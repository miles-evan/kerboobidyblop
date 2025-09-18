import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import Spell from "./Spell.ts";
import boardSprite from "../sprites/board.png";
import type Player from "../castHandlers/Player.ts";
import Endzone from "./Endzone.ts";

export default class Board extends GameObject {
	readonly player1: Player;
	readonly player2: Player;
	topLeftTileX: number;
	topLeftTileY: number;

	constructor(player1: Player, player2: Player) {
		super(30, 0, 64, 180, boardSprite);
		this.middleY = Game.screenHeight / 2;
		this.player1 = player1;
		this.player2 = player2;
		this.depth = 2;
		[this.topLeftTileX, this.topLeftTileY] = [this.x + 8, this.y + 10];
		
		new Endzone(this.x, this.getPositionOfTile(0, 0)[1] + 16, damage => player1.hurt(damage));
		new Endzone(this.x, this.getPositionOfTile(0, 9)[1] - 16, damage => player2.hurt(damage));
		
		Spell.syncTiles();
	}
	
	getPositionOfTile(lane: Lane, rank: Rank): [Pixels, Pixels] {
		// lane 0 is left most col, rank 0 is bottom most row
		return [this.topLeftTileX + 16*lane, this.topLeftTileY + 16*(9-rank)];
	}
	
	// validate flux and collision and spawn spell
	initiatePlayerCast(playerNum: PlayerNum): void {
		const player: Player = playerNum === 1? this.player1 : this.player2;
		const rank: Rank = playerNum === 1? 0 : 9;
		const cast: [Tier, Power, Lane] | null = player.tryCast();
		
		if(!cast) return;
		
		const [tier, power, lane] = cast;
		const fluxCost: Flux = Spell.fluxCost(tier, power);
		if(player.flux < fluxCost)
			return;
		const [x, y] = this.getPositionOfTile(lane, rank);
		const newSpell = new Spell(x, y, lane, tier, playerNum, power, this);
		if(newSpell.collidedWithAlly())
			return newSpell.destroy();
		player.flux -= fluxCost;
	}
	
	step(): void {
		this.player1.updateFlux();
		this.player2.updateFlux();
		
		this.initiatePlayerCast(1);
		this.initiatePlayerCast(2);
	}
	
	destroy(): void {
		super.destroy();
		Game.removeRepeatable(Spell.tileTickRepeatableId);
		Spell.tileTickRepeatableId = null;
	}
	
}