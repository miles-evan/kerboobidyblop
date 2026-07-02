import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import Spell from "./Spell.ts";
import FluxBar from "./FluxBar.ts";
import HealthBar from "./HealthBar.ts";
import GameOverText from "./GameOverText.ts";
import boardSprite from "../sprites/board.png";
import type Player from "../castHandlers/Player.ts";

export default class Board extends GameObject {
	readonly player1: Player;
	readonly player2: Player;
	topLeftTileX: number;
	topLeftTileY: number;
	gameOver: boolean = false;

	constructor(player1: Player, player2: Player) {
		super(0, 0, 64, 180, boardSprite);
		this.middleX = Game.screenWidth / 2;
		this.middleY = Game.screenHeight / 2;
		this.player1 = player1;
		this.player2 = player2;
		this.depth = 2;
		[this.topLeftTileX, this.topLeftTileY] = [this.x + 8, this.y + 10];

		new FluxBar(player1); // only the local player's flux is shown
		new HealthBar(player1, "bottom");
		new HealthBar(player2, "top");

		Spell.syncTiles();
	}
	
	getPositionOfTile(lane: Lane, rank: Rank): [number, number] {
		// lane 0 is left most col, rank 0 is bottom most row
		return [this.topLeftTileX + 16*lane, this.topLeftTileY + 16*(9-rank)];
	}
	
	initiatePlayerCast(playerNum: PlayerNum): void {
		const player: Player = playerNum === 1? this.player1 : this.player2;
		const rank: Rank = playerNum === 1? 0 : 9;
		const cast: [Tier, Power, Lane] | null = player.castSpell();
		
		if(cast) {
			const [tier, power, lane] = cast;
			const [x, y] = this.getPositionOfTile(lane, rank);
			const newSpell = new Spell(x, y, lane, tier, playerNum, power, this);
			if(!this.validateCast(newSpell))
				newSpell.destroy();
		}
	}
	
	validateCast(newSpell: Spell): boolean {
		return !newSpell.getCollisionsWithType(Spell).some(spell => spell.playerNum === newSpell.playerNum);
	}
	
	damagePlayer(playerNum: PlayerNum, damage: number): void {
		const player: Player = playerNum === 1? this.player1 : this.player2;
		player.health = Math.max(0, player.health - damage);
	}

	step(): void {
		if(this.gameOver) return;

		if(this.player1.health <= 0 || this.player2.health <= 0) {
			this.gameOver = true;
			const winner: PlayerNum | 0 =
				this.player1.health <= 0 && this.player2.health <= 0? 0
				: this.player1.health <= 0? 2 : 1;
			new GameOverText(winner === 0? "Draw!" : `Player ${winner} wins!`);
			return;
		}

		const fluxPerSecond = 1;
		this.player1.flux = Math.min(10, this.player1.flux + fluxPerSecond * (Game.deltaTime / 1000));
		this.player2.flux = Math.min(10, this.player2.flux + fluxPerSecond * (Game.deltaTime / 1000));

		this.initiatePlayerCast(1);
		this.initiatePlayerCast(2);
	}
	
	destroy(): void {
		super.destroy();
		Game.removeRepeatable(Spell.tileTickRepeatableId);
		Spell.tileTickRepeatableId = null;
	}
	
}