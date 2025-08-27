

export default abstract class Player {
	
	health: number; // Should be between 0 and 10, but I don't think there's a way to enforce that
	flux: Flux;
	
	protected constructor() {
		this.health = 100;
		this.flux = 0;
	}
	
	// attempt to cast (may reject due to flux or collision)
	abstract tryCast(): [Tier, Power, Lane] | null;
	
}