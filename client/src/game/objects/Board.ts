import GameObject from "../fluxEngine/GameObject.ts";
import Game from "../fluxEngine/Game.ts";
import Spell from "./Spell.ts";
import boardSprite from "../sprites/board.png";

export default class Board extends GameObject {
	
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
		if(Game.isKeyPressed("ArrowDown")) {
			new Spell(...this.getPositionOfTile(1, 0), 2, 1);
		}
		if(Game.isKeyPressed("ArrowLeft")) {
			new Spell(...this.getPositionOfTile(0, 0), 2, 1);
		}
		if(Game.isKeyPressed("ArrowRight")) {
			new Spell(...this.getPositionOfTile(2, 0), 2, 1);
		}
	}
	
}