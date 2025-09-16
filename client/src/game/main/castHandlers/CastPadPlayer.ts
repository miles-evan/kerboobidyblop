import Player from "./Player.ts";
import CastPad from "../objects/CastPad.ts";
import type Fluxometer from "../objects/Fluxometer.ts";


export default class CastPadPlayer extends Player {
	
	cast: [Tier, Power, Lane] | null = null;
	
	constructor(fluxometer: Fluxometer, castPadX: Pixels = 120, castPadY: Pixels = 30) {
		super(fluxometer);
		new CastPad(castPadX, castPadY, cast => this.cast = cast);
	}
	
	tryCast(): [Tier, Power, Lane] | null {
		const cast: [Tier, Power, Lane] | null = this.cast;
		this.cast = null;
		return cast;
	}
	
}