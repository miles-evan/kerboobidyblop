import type Fluxometer from "../objects/Fluxometer.ts";
import Game from "../../engine/Game.ts";


export default abstract class Player {
	
	public health: number = 9;
	public flux: Flux = 0;
	public readonly fluxometer: Fluxometer | null;
	public static readonly fluxPerSecond: number = 0.5;
	
	protected constructor(fluxometer: Fluxometer | null) {
		this.fluxometer = fluxometer;
	}
	
	public updateFlux(): void {
		this.flux = Math.min(10, this.flux + Player.fluxPerSecond * (Game.deltaTime / 1000));
		if(this.fluxometer)
			this.fluxometer.flux = this.flux;
	}
	
	public hurt(damage: number): void {
		console.log("ouch!", damage, this.health)
		this.health -= damage;
		console.log("now im only at", this.health)
	}
	
	// attempt to cast (may reject due to flux or collision)
	public abstract tryCast(): [Tier, Power, Lane] | null;
	
}