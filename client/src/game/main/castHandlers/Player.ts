import type Fluxometer from "../objects/Fluxometer.ts";
import Game from "../../engine/Game.ts";


export default abstract class Player {
	
	health: number = 9;
	flux: Flux = 0;
	readonly fluxometer: Fluxometer | null;
	static readonly fluxPerSecond: number = 0.5;
	
	protected constructor(fluxometer: Fluxometer | null) {
		this.fluxometer = fluxometer;
	}
	
	updateFlux(): void {
		this.flux = Math.min(10, this.flux + Player.fluxPerSecond * (Game.deltaTime / 1000));
		if(this.fluxometer)
			this.fluxometer.flux = this.flux;
	}
	
	hurt(damage: number): void {
		console.log("ouch!", damage, this.health)
		this.health -= damage;
		console.log("now im only at", this.health)
	}
	
	// attempt to cast (may reject due to flux or collision)
	abstract tryCast(): [Tier, Power, Lane] | null;
	
}