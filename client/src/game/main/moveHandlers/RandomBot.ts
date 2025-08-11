import type MoveHandler from "./MoveHandler.ts";


export default class RandomBot implements MoveHandler {
	
	chanceOfMoving: number;
	
	constructor(chanceOfMoving: number = 0.01) {
		this.chanceOfMoving = chanceOfMoving;
	}
	
	makeMove(): [Lane, Tier] | null {
		if(Math.random() > this.chanceOfMoving)
			return null;
		
		const lane: Lane = Math.floor(Math.random() * 3) as Lane;
		const tier: Tier = Math.floor(Math.random() * 4) + 1 as Tier;

		return [lane, tier];
	}
}