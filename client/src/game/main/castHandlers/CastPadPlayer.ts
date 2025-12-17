import Player from "./Player.ts";
import CastPad from "../objects/CastPad.ts";
import type Fluxometer from "../objects/Fluxometer.ts";
import Logger from "../objects/Logger.ts";


export default class CastPadPlayer extends Player {
	
	public cast: [Tier, Power, Lane] | null = null;
	
	public constructor(fluxometer: Fluxometer, castPadX: Pixels = 120, castPadY: Pixels = 30) {
		super(fluxometer);
		new CastPad(castPadX, castPadY, cast => this.cast = cast);
		new Logger(2, 50, () => this.health);
	}
	
	public tryCast(): [Tier, Power, Lane] | null {
		const cast: [Tier, Power, Lane] | null = this.cast;
		this.cast = null;
		return cast;
	}
	
}