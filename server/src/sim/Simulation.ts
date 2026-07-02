import type { Lane, Tier, PlayerNum, Power, Snapshot, PlayerState } from "../protocol.ts";
import {
	FLUX_PER_SECOND, MAX_FLUX, STARTING_HEALTH, TILE_TICK_PERIOD_MS,
	TOP_LEFT_TILE_X, TOP_LEFT_TILE_Y, TILE_SIZE, fluxCost,
} from "../constants.ts";
import SimSpell from "./SimSpell.ts";


type PendingCast = {
	playerNum: PlayerNum,
	seq: number,
	tier: Tier,
	power: Power,
	lane: Lane,
};

export type CastResult = {
	playerNum: PlayerNum,
	seq: number,
	accepted: boolean,
	reason?: string,
};


// Authoritative, headless port of the client game (Board.ts + Spell.ts rules).
// Advanced with a fixed timestep; all inputs are queued casts validated here.
export default class Simulation {

	spells: SimSpell[] = [];
	players: { 1: PlayerState, 2: PlayerState } = {
		1: { flux: 0, health: STARTING_HEALTH },
		2: { flux: 0, health: STARTING_HEALTH },
	};
	tick: number = 0;
	timeMs: number = 0;
	tileTickThisStep: boolean = false;
	private timeSinceTileTick: number = 0;
	private nextSpellId: number = 1;
	private pendingCasts: PendingCast[] = [];


	queueCast(playerNum: PlayerNum, seq: number, tier: Tier, power: Power, lane: Lane): void {
		this.pendingCasts.push({ playerNum, seq, tier, power, lane });
	}


	damagePlayer(playerNum: PlayerNum, damage: number): void {
		const player: PlayerState = this.players[playerNum];
		player.health = Math.max(0, player.health - damage);
	}

	// null while the game is ongoing, 0 for a draw, otherwise the winning player
	get winner(): PlayerNum | 0 | null {
		const [dead1, dead2] = [this.players[1].health <= 0, this.players[2].health <= 0];
		if(!dead1 && !dead2) return null;
		if(dead1 && dead2) return 0;
		return dead1? 2 : 1;
	}


	// lane 0 is left most col, rank 0 is bottom most row (Board.getPositionOfTile)
	static getPositionOfTile(lane: Lane, rank: number): [number, number] {
		return [TOP_LEFT_TILE_X + TILE_SIZE * lane, TOP_LEFT_TILE_Y + TILE_SIZE * (9 - rank)];
	}


	// Unlike the client (which deducts flux before the collision check), the
	// server only charges flux for casts that actually spawn a spell.
	private processCast(cast: PendingCast): CastResult {
		const player: PlayerState = this.players[cast.playerNum];
		const cost: number = fluxCost(cast.tier, cast.power);

		if(!isFinite(cost))
			return { playerNum: cast.playerNum, seq: cast.seq, accepted: false, reason: "invalid cast" };
		if(cost > player.flux)
			return { playerNum: cast.playerNum, seq: cast.seq, accepted: false, reason: "not enough flux" };

		const rank: number = cast.playerNum === 1? 0 : 9;
		const [x, y] = Simulation.getPositionOfTile(cast.lane, rank);

		// Board.validateCast: can't spawn on top of your own spell
		const blocked: boolean = this.spells.some(spell =>
			!spell.dead
			&& spell.playerNum === cast.playerNum
			&& SimSpell.overlaps(x, y, spell.x, spell.y));
		if(blocked)
			return { playerNum: cast.playerNum, seq: cast.seq, accepted: false, reason: "spawn tile blocked" };

		player.flux -= cost;
		this.spells.push(new SimSpell(this.nextSpellId ++, x, y, cast.lane, cast.tier, cast.playerNum, cast.power));
		return { playerNum: cast.playerNum, seq: cast.seq, accepted: true };
	}


	step(deltaTime: number): CastResult[] {
		this.tick ++;
		this.timeMs += deltaTime;

		// tile tick (client does this with a Game repeatable at SPELL_VELOCITY/16 Hz)
		this.tileTickThisStep = false;
		this.timeSinceTileTick += deltaTime;
		if(this.timeSinceTileTick >= TILE_TICK_PERIOD_MS) {
			this.tileTickThisStep = true;
			this.timeSinceTileTick -= TILE_TICK_PERIOD_MS;
			// so you don't get too behind if lagging:
			if(this.timeSinceTileTick >= TILE_TICK_PERIOD_MS)
				this.timeSinceTileTick = 0;
		}

		// Board.step: flux regen, then casts
		([1, 2] as const).forEach(playerNum => {
			const player: PlayerState = this.players[playerNum];
			player.flux = Math.min(MAX_FLUX, player.flux + FLUX_PER_SECOND * (deltaTime / 1000));
		});

		// spells spawned this step don't get stepped until next step (matches client ordering)
		const existingSpells: SimSpell[] = [...this.spells];

		const results: CastResult[] = this.pendingCasts.map(cast => this.processCast(cast));
		this.pendingCasts = [];

		existingSpells.forEach(spell => {
			if(!spell.dead)
				spell.step(this, deltaTime);
		});

		// GameObject.update applies velocity after all steps
		this.spells.forEach(spell => {
			if(!spell.dead)
				spell.applyVelocity(deltaTime);
		});

		this.spells = this.spells.filter(spell => !spell.dead);

		return results;
	}


	takeSnapshot(): Snapshot {
		return {
			type: "snapshot",
			tick: this.tick,
			time: this.timeMs,
			spells: this.spells.map(spell => spell.toState()),
			players: {
				1: { ...this.players[1] },
				2: { ...this.players[2] },
			},
		};
	}

}
