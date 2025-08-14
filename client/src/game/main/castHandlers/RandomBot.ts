import type CastHandler from "./CastHandler.ts";


export default class RandomBot implements CastHandler {
	
	chanceOfMoving: number;
	
	constructor(chanceOfMoving: number = 0.005) {
		this.chanceOfMoving = chanceOfMoving;
	}
	
	castSpell(): [Tier, Power, Lane] | null {
		if(Math.random() > this.chanceOfMoving)
			return null;
		
		const lane: Lane = Math.floor(Math.random() * 3) as Lane;
		const tier: Tier = Math.floor(Math.random() * 4) + 1 as Tier;

		return [tier, "none", lane];
	}
}