import Spell from "../objects/Spell.ts";

export default abstract class Player {
	
	health: number; // Should be between 0 and 10, but I don't think there's a way to enforce that
	flux: number;
	
	protected constructor() {
		this.health = 100;
		this.flux = 0;
	}
	
	abstract tryCast(): [Tier, Power, Lane] | null
	
	castSpell(): [Tier, Power, Lane] | null {
		const cast: [Tier, Power, Lane] | null = this.tryCast();
		if(!cast)
			return null;
		
		const [tier, power] = cast;
		
		const fluxCost: number = Spell.fluxCost(tier, power);
		
		if (fluxCost > this.flux)
			return null;
		
		this.flux -= fluxCost;
		return cast;
	}
	
}