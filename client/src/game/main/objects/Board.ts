import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import Spell from "./Spell.ts";
import boardSprite from "../sprites/board.png";
import type CastHandler from "../castHandlers/CastHandler.ts";

export default class Board extends GameObject {
	readonly player1: CastHandler;
	readonly player2: CastHandler;

	constructor(player1: CastHandler, player2: CastHandler) {
		super(0, 0, 64, 180, boardSprite);
		this.middleX = Game.screenWidth / 2;
		this.middleY = Game.screenHeight / 2;
		this.player1 = player1;
		this.player2 = player2;
		this.depth = 2;
	}
	
	getPositionOfTile(lane: Lane, rank: Rank): [number, number] {
		// lane 0 is left most col, rank 0 is bottom most row
		return [8 + 16*lane + this.x, 10 + 16*(9-rank) + this.y];
	}
	
	validateCast(newSpell: Spell) {
		return !newSpell.getCollisionsWithType(Spell).some(spell => spell.playerNum === newSpell.playerNum);
	}
	
	castSpell(playerNum: PlayerNum) {
		const player: CastHandler = [this.player1, this.player2][playerNum - 1];
		const rank: Rank = playerNum === 1? 0 : 9;
		const cast: [Tier, Power, Lane] | null = player.castSpell();
		
		if(cast) {
			const [tier, power, lane] = cast;
			const [x, y] = this.getPositionOfTile(lane, rank);
			const newSpell = new Spell(x, y, lane, tier, playerNum, power);
			if(!this.validateCast(newSpell))
				newSpell.destroy();
		}
	}
	
	step() {
		this.castSpell(1);
		this.castSpell(2);
	}
	
}