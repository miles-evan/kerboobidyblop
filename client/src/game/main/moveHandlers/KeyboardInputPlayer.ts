import type MoveHandler from "./MoveHandler.ts";
import Game from "../../engine/Game.ts";
export default class KeyboardInputPlayer implements MoveHandler {

	nextTier: Tier | null = null;
	nextTierExpires: number = 0;

	makeMove(): [Lane, Tier] | null {
		let tier: Tier | null = null;
		let lane: Lane | null = null;
		
		// set tier first, then lane (when playing the game)
		
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
			const move: [Lane, Tier] = [lane, this.nextTier];
			this.nextTier = null;
			return move;
		} else if(tier !== null) {
			this.nextTier = tier;
			this.nextTierExpires = Date.now() + 1000;
		}
		return null;
	}

}