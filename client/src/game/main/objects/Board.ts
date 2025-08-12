import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import Spell from "./Spell.ts";
import boardSprite from "../sprites/board.png";
import type MoveHandler from "../moveHandlers/MoveHandler.ts";

export default class Board extends GameObject {
	player1: MoveHandler;
	player2: MoveHandler;

	constructor(player1: MoveHandler, player2: MoveHandler) {
		super(0, 0, 256, 720, boardSprite);
		this.middleX = Game.screenWidth / 2;
		this.middleY = Game.screenHeight / 2;
		this.player1 = player1;
		this.player2 = player2;
	}
	
	getPositionOfTile(lane: number, rank: number): [number, number] {
		// lane 0 is left most col, rank 0 is bottom most row
		return [4 * (8 + 16*lane) + this.x, 4 * (10 + 16*(9-rank)) + this.y];
	}
	
	step() {
		
		const player1Move = this.player1.makeMove();
		if(player1Move){
			const [player1Lane, player1Tier] = player1Move;
			new Spell(...this.getPositionOfTile(player1Lane, 0), player1Lane, player1Tier, 1);
		}
		
		const player2Move = this.player2.makeMove();
		if(player2Move){
			const [player2Lane, player2Tier] = player2Move;
			new Spell(...this.getPositionOfTile(player2Lane, 9), player2Lane, player2Tier, 2);
		}
		
	}
	
}