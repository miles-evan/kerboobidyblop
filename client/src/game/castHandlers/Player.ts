import type Fluxometer from "../objects/Fluxometer.ts";
import Game from "@engine/main/Game.ts";
import type HealthMeter from "../objects/HealthMeter.ts";
import Snapshotable from "@engine/multiplayer/Snapshotable.ts";


// holds player data
// subclasses implement a way to cast spells, like user input or bots
export default abstract class Player extends Snapshotable {
	
	protected health: number = 9;
	public flux: Flux = 0;
	private readonly fluxometer: Fluxometer | null;
	private readonly healthMeter: HealthMeter | null;
	private static readonly fluxPerSecond: number = 0.5;
	
	protected constructor(healthMeter: HealthMeter | null = null, fluxometer: Fluxometer | null = null) {
		super();
		this.fluxometer = fluxometer;
		this.healthMeter = healthMeter;
	}
	
	public updateFlux(): void {
		this.flux = Math.min(10, this.flux + Player.fluxPerSecond * (Game.deltaTime / 1000));
		if(this.fluxometer) this.fluxometer.flux = this.flux;
	}
	
	public hurt(damage: number): void {
		this.health -= damage;
		if(this.healthMeter) this.healthMeter.health = this.health;
	}
	
	// attempt to cast (may reject due to flux or collision)
	public abstract tryCast(): [Tier, Power, Lane] | null;
	
}