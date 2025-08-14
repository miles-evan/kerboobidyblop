import type CastHandler from "./CastHandler.ts";
import Game from "../../engine/Game.ts";
export default class KeyboardInputPlayer implements CastHandler {

	private nextTier: Tier | null = null;
	private nextPower: Power | null = null;
	
	// time after setting tier and power that it resets
	private timeToExpire: number = 0;
	private readonly expireDuration: number = 750;
	
	castSpell(): [Tier, Power, Lane] | null {
		let tier: Tier | null = null;
		let power: Power | null = null;
		let lane: Lane | null = null;
		
		// set tier first, then power, then lane (when playing the game)
		
		if(Game.isKeyPressed("ArrowLeft")) {
			tier = 1;
			lane = 0;
			power = "dodger";
		} else if(Game.isKeyPressed("ArrowDown")) {
			tier = 2;
			lane = 1;
			power = "retreater";
		} else if(Game.isKeyPressed("ArrowRight")) {
			tier = 3;
			lane = 2;
			power = "hopper";
		} else if(Game.isKeyPressed("ArrowUp")) {
			tier = 4;
			lane = 1;
			power = "none";
		} else if(Game.isKeyPressed("Control") || Date.now() > this.timeToExpire) {
			this.nextTier = this.nextPower = null;
			this.timeToExpire = Date.now() + this.expireDuration;
		} else {
			return null;
		}
		
		if(this.nextTier !== null && this.nextPower !== null && lane !== null) {
			const cast: [Tier, Power, Lane] = [this.nextTier, this.nextPower, lane];
			this.nextTier = this.nextPower = null;
			return cast;
		} else if(this.nextTier !== null) {
			this.nextPower = power;
			this.timeToExpire = Date.now() + this.expireDuration; // reset expire time
		} else {
			this.nextTier = tier;
			this.timeToExpire = Date.now() + this.expireDuration; // reset expire time
		}
		
		return null;
	}

}