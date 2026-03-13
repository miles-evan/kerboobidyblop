import Player from "./Player.ts";
import type HealthMeter from "../objects/HealthMeter.ts";


export default class DoNothingPlayer extends Player {
	
	public constructor(healthMeter: HealthMeter) {
		super(healthMeter);
	}
	
	public tryCast(): [Tier, Power, Lane] | null {
		return null;
	}
	
}