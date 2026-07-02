import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import boardSprite from "../sprites/board.png";
import Spell from "./Spell.ts";
import RemoteSpell from "./RemoteSpell.ts";
import RemotePlayer from "../castHandlers/RemotePlayer.ts";
import KeyboardInputPlayer from "../castHandlers/KeyboardInputPlayer.ts";
import type NetworkClient from "../net/NetworkClient.ts";
import SnapshotBuffer from "../net/SnapshotBuffer.ts";
import type { PlayerNum, SpellState } from "../net/protocol.ts";


// The online counterpart of Board: renders the authoritative server state
// (via SnapshotBuffer interpolation) and forwards local keyboard casts to the server.
export default class OnlineBoard extends GameObject {

	private readonly net: NetworkClient;
	private readonly localPlayerNum: PlayerNum;
	private readonly buffer: SnapshotBuffer = new SnapshotBuffer();
	private readonly remoteSpells: Map<number, RemoteSpell> = new Map();
	private readonly localPlayer: RemotePlayer = new RemotePlayer();
	private readonly opponent: RemotePlayer = new RemotePlayer();
	private readonly input: KeyboardInputPlayer = new KeyboardInputPlayer();

	constructor(net: NetworkClient, localPlayerNum: PlayerNum) {
		super(0, 0, 64, 180, boardSprite);
		this.middleX = Game.screenWidth / 2;
		this.middleY = Game.screenHeight / 2;
		this.depth = 2;

		this.net = net;
		this.localPlayerNum = localPlayerNum;
		net.onSnapshot = snapshot => this.buffer.add(snapshot);
	}


	// mirror the board vertically for player 2, so your own spells always start at the bottom
	private toViewY(y: number): number {
		return this.localPlayerNum === 1? y : Game.screenHeight - 16 - y;
	}


	private handleInput(): void {
		const cast: [Tier, Power, Lane] | null = this.input.tryCast();
		if(!cast) return;
		const [tier, power, lane] = cast;

		// local flux check is just a prediction to avoid pointless sends — the server re-validates
		if(Spell.fluxCost(tier, power) > this.localPlayer.flux)
			return;

		this.net.sendCast(tier, power, lane);
	}


	step(): void {
		this.handleInput();

		const state = this.buffer.getInterpolatedState();
		if(!state) return;

		this.localPlayer.flux = state.players[this.localPlayerNum].flux;
		this.localPlayer.health = state.players[this.localPlayerNum].health;
		const opponentNum: PlayerNum = this.localPlayerNum === 1? 2 : 1;
		this.opponent.flux = state.players[opponentNum].flux;
		this.opponent.health = state.players[opponentNum].health;

		const aliveIds: Set<number> = new Set();
		state.spells.forEach((spellState: SpellState) => {
			aliveIds.add(spellState.id);
			let spell: RemoteSpell | undefined = this.remoteSpells.get(spellState.id);
			if(!spell) {
				spell = new RemoteSpell(
					spellState.x, this.toViewY(spellState.y),
					spellState.tier, spellState.playerNum, spellState.power
				);
				this.remoteSpells.set(spellState.id, spell);
			}
			spell.x = spellState.x;
			spell.y = this.toViewY(spellState.y);
		});

		this.remoteSpells.forEach((spell, id) => {
			if(!aliveIds.has(id)) {
				spell.destroy();
				this.remoteSpells.delete(id);
			}
		});
	}


	destroy(): void {
		super.destroy();
		this.remoteSpells.forEach(spell => spell.destroy());
		this.remoteSpells.clear();
		this.net.onSnapshot = null;
	}

}
