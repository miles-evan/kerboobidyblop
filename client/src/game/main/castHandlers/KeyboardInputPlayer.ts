import type CastHandler from "./CastHandler.ts";
import Game from "../../engine/Game.ts";
import GameObject from "../../engine/GameObject.ts";
import Spell from "../objects/Spell.ts";
export default class KeyboardInputPlayer implements CastHandler {

	private nextTier: Tier | null = null;
	private nextPower: Power | null = null;
	
	// time after setting tier and power that it resets
	private timeToExpire: number = 0;
	private readonly expireDuration: number = 1000;

	flux: number; // Should be between 0 and 10, but I don't think theres a way to enforce that
	
	
	constructor() {
		const thisRef = this;
		this.flux = 0.0;
		new class extends GameObject {
			constructor() {
				super(5, 10);
			}
			step() {
				this._object.textContent = thisRef.nextTier + " " + thisRef.nextPower;
			}
		}
	}
	
	possibleCast() {
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
	
	castSpell(): [Tier, Power, Lane] | null {
		const cast = this.possibleCast();
		if(!cast)
			return null;

		const [tier, power, _] = cast;

		const fluxCost = Spell.fluxCost(tier, power);

		if (fluxCost > this.flux) 
			return null;

		this.flux -= fluxCost;
		return cast;
	}

}