import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import Spell from "./Spell.ts";
import SpellTrail from "./SpellTrail.ts";
import type { Power, Tier, PlayerNum } from "../net/protocol.ts";


// A spell rendered from server snapshots. Has no game logic of its own —
// OnlineBoard sets its position each frame from the interpolated state.
export default class RemoteSpell extends GameObject {

	readonly power: Power;
	private prevX: Pixels;
	private prevY: Pixels;
	private moving: boolean = false;
	private readonly trailRepeatableId: RepeatableId;

	constructor(x: number, y: number, tier: Tier, playerNum: PlayerNum, power: Power) {
		super(x, y, 16, 16, `/src/game/main/sprites/spells/spell-player${playerNum}-tier${tier}.png`);
		this.power = power;
		this.prevX = x;
		this.prevY = y;

		this.trailRepeatableId = Game.addRepeatable(() => {
			if(this.moving)
				new SpellTrail(Math.round(this.x), Math.round(this.y), this.power);
		}, Spell.velocity);
	}

	step(): void {
		this.moving = this.x !== this.prevX || this.y !== this.prevY;
		this.prevX = this.x;
		this.prevY = this.y;
	}

	destroy(): void {
		super.destroy();
		Game.removeRepeatable(this.trailRepeatableId);
	}

}
