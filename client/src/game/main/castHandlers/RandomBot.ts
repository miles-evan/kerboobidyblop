import Player from "./Player.ts";


export default class RandomBot extends Player {
	
	chanceOfMoving: number;
	
	constructor(chanceOfMoving: number = 0.002) {
		super();
		this.chanceOfMoving = chanceOfMoving;
	}
	
	tryCast(): [Tier, Power, Lane] | null {
		if(Math.random() > this.chanceOfMoving)
			return null;
		
		const lane: Lane = Math.floor(Math.random() * 3) as Lane;
		const tier: Tier = Math.floor(Math.random() * 4) + 1 as Tier;

		return [tier, "none", lane];
	}
}