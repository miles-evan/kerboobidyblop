import type CastHandler from "./CastHandler.ts";


export default class RandomBot implements CastHandler {
	
	chanceOfMoving: number;
	flux: number;
	
	constructor(chanceOfMoving: number = 0.002) {
		this.chanceOfMoving = chanceOfMoving;
		this.flux = 0.0
	}
	
	castSpell(): [Tier, Power, Lane] | null {
		if(Math.random() > this.chanceOfMoving)
			return null;
		
		const lane: Lane = Math.floor(Math.random() * 3) as Lane;
		const tier: Tier = Math.floor(Math.random() * 4) + 1 as Tier;

		return [tier, "none", lane];
	}
}