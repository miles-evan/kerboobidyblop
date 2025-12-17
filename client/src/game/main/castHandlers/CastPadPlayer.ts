import Player from "./Player.ts";
import CastPad from "../objects/CastPad.ts";
import type Fluxometer from "../objects/Fluxometer.ts";
import type HealthMeter from "../objects/HealthMeter.ts";


export default class CastPadPlayer extends Player {
	
	public cast: [Tier, Power, Lane] | null = null;
	
	public constructor(healthMeter: HealthMeter, fluxometer: Fluxometer, castPadX: Pixels = 120, castPadY: Pixels = 30) {
		super(fluxometer, healthMeter);
		new CastPad(castPadX, castPadY, cast => this.cast = cast);
	}
	
	public tryCast(): [Tier, Power, Lane] | null {
		const cast: [Tier, Power, Lane] | null = this.cast;
		this.cast = null;
		return cast;
	}
	
}