import Player from "./Player.ts";
import Game from "../../engine/Game.ts";
import Logger from "../objects/Logger.ts";


export default class KeyboardInputPlayer extends Player {

	private nextTier: Tier | null = null;
	private nextPower: Power | null = null;
	private timeToExpire: number = 0; // time after setting tier and power that it resets
	private readonly expireDuration: number = 1000;

	
	constructor() {
		super();
		new Logger(5, 10, () => this.nextTier + " " + this.nextPower);
		new Logger(5, 30, () => Math.round(this.flux));
	}
	
	
	tryCast(): [Tier, Power, Lane] | null {
		let tier: Tier | null = null;
		let power: Power | null = null;
		let lane: Lane | null = null;
		
		// set tier first, then power, then lane (when playing the game)
		
		if(Game.isKeyPressed("ArrowLeft") || Game.isKeyPressed("1")) {
			tier = 1;
			lane = 0;
			power = "dodger";
		} else if(Game.isKeyPressed("ArrowDown") || Game.isKeyPressed("2")) {
			tier = 2;
			lane = 1;
			power = "retreater";
		} else if(Game.isKeyPressed("ArrowRight") || Game.isKeyPressed("3")) {
			tier = 3;
			lane = 2;
			power = "hopper";
		} else if(Game.isKeyPressed("ArrowUp") || Game.isKeyPressed("4")) {
			tier = 4;
			lane = 1;
			power = "none";
		} else if(Game.isKeyPressed("Control") || Date.now() > this.timeToExpire) {
			// input expired
			this.nextTier = this.nextPower = null;
			this.timeToExpire = Date.now() + this.expireDuration;
			return null;
		} else {
			return null;
		}
		
		if(this.nextTier === null) {
			this.nextTier = tier;
			this.timeToExpire = Date.now() + this.expireDuration; // reset expire time
		} else if(this.nextPower === null) {
			this.nextPower = power;
			this.timeToExpire = Date.now() + this.expireDuration; // reset expire time
		} else {
			const cast: [Tier, Power, Lane] = [this.nextTier, this.nextPower, lane];
			this.nextTier = this.nextPower = null;
			return cast;
		}
		
		return null;
	}

}