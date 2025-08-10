import GameObject from "../fluxEngine/GameObject.ts";
import Game from "../fluxEngine/Game.ts";
import Spell from "./Spell.ts";
import boardSprite from "../sprites/board.png";
import Player1 from "../players/Player1.ts";
import RandomBotYo from "../players/RandomBotYo.ts";

export default class Board extends GameObject {
	player1: Player1;
	randomBot: RandomBotYo;

	constructor() {
		super(0, 0, 256, 720, boardSprite);
		this.middleX = Game.screenWidth / 2;
		this.middleY = Game.screenHeight / 2;
		this.player1 = new Player1();
        this.randomBot = new RandomBotYo();
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

		// const [randomLane, randomTier] = RandomBotYo.makeMove();
		// new Spell(...this.getPositionOfTile(randomLane, 0), randomLane, randomTier, 2);
		
	}
	
}