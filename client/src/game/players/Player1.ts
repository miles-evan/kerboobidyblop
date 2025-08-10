import type PlayerInterface from "./PlayerInterface";
import Game from "../fluxEngine/Game";
export default class Player1 implements PlayerInterface {

	nextTier: 1 | 2 | 3 | 4 | null = null;
	nextTierExpires: number = 0;

	makeMove(): [Lane, Tier] | null {
		let tier: 1 | 2 | 3 | 4 | null = null;
		let lane: 0 | 1 | 2 | null = null;
		
		if(Game.isKeyPressed("ArrowLeft")) {
			tier = 1;
			lane = 0;
		} else if(Game.isKeyPressed("ArrowDown")) {
			tier = 2;
			lane = 1;
		} else if(Game.isKeyPressed("ArrowRight")) {
			tier = 3;
			lane = 2;
		} else if(Game.isKeyPressed("ArrowUp")) {
			tier = 4;
		} else if(Game.isKeyPressed("Control") || Date.now() > this.nextTierExpires) {
			this.nextTier = null;
		}

		
		if(this.nextTier !== null && lane !== null) {
			this.nextTier = null;
			return [lane, tier] as [Lane, Tier];
		} else if(tier !== null) {
			this.nextTier = tier;
			this.nextTierExpires = Date.now() + 1000;
		}
		return null;
	}


}