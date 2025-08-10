import GameObject from "../fluxEngine/GameObject.ts";
import Game from "../fluxEngine/Game.ts";
import Spell from "./Spell.ts";
import boardSprite from "../sprites/board.png";

export default class Board extends GameObject {
	
	nextTier: 1 | 2 | 3 | 4 | null = null;
	nextTierExpires: number = 0;
	
	constructor() {
		super(0, 0, 256, 720, boardSprite);
		this.middleX = Game.screenWidth / 2;
		this.middleY = Game.screenHeight / 2;
	}
	
	getPositionOfTile(lane: number, rank: number): [number, number] {
		// lane 0 is left most col, rank 0 is bottom most row
		return [4 * (8 + 16*lane) + this.x, 4 * (10 + 16*(9-rank)) + this.y];
	}
	
	step() {
		
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
			new Spell(...this.getPositionOfTile(lane, 0), lane, this.nextTier, 1);
			this.nextTier = null;
		} else if(tier !== null) {
			this.nextTier = tier;
			this.nextTierExpires = Date.now() + 1000;
		}
		
	}
	
}