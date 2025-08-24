import Player from "./Player.ts";
import CastPad from "../objects/CastPad.ts";
import Logger from "../objects/Logger.ts";


export default class CastPadPlayer extends Player {
	
	cast: [Tier, Power, Lane] | null = null;
	
	constructor(castPadX: Pixels = 120, castPadY: Pixels = 30) {
		super();
		new Logger(5, 30, () => Math.round(this.flux));
		new CastPad(castPadX, castPadY, cast => this.cast = cast);
	}
	
	tryCast(): [Tier, Power, Lane] | null {
		const cast: [Tier, Power, Lane] | null = this.cast;
		this.cast = null;
		return cast;
	}
	
}