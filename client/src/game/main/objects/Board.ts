import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import Spell from "./Spell.ts";
import boardSprite from "../sprites/board.png";
import type MoveHandler from "../moveHandlers/MoveHandler.ts";

export default class Board extends GameObject {
	readonly player1: MoveHandler;
	readonly player2: MoveHandler;

	constructor(player1: MoveHandler, player2: MoveHandler) {
		super(0, 0, 256, 720, boardSprite);
		this.middleX = Game.screenWidth / 2;
		this.middleY = Game.screenHeight / 2;
		this.player1 = player1;
		this.player2 = player2;
	}
	
	getPositionOfTile(lane: Lane, rank: Rank): [number, number] {
		// lane 0 is left most col, rank 0 is bottom most row
		return [4 * (8 + 16*lane) + this.x, 4 * (10 + 16*(9-rank)) + this.y];
	}
	
	validateMove(newSpell: Spell) {
		return !newSpell.getCollisionsWithType(Spell).some(spell => spell.playerNum === newSpell.playerNum);
	}
	
	castSpell(playerNum: PlayerNum) {
		const player: MoveHandler = [this.player1, this.player2][playerNum - 1];
		const rank: Rank = playerNum === 1? 0 : 9;
		const move: [Lane, Tier] | null = player.makeMove();
		
		if(move){
			const [lane, tier] = move;
			const [x, y] = this.getPositionOfTile(lane, rank);
			const newSpell = new Spell(x, y, lane, tier, playerNum);
			if(!this.validateMove(newSpell))
				newSpell.destroy();
		}
	}
	
	step() {
		this.castSpell(1);
		this.castSpell(2);
	}
	
}