import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import SpellTrail from "./SpellTrail.ts";
import type Board from "./Board.ts";


export default class Spell extends GameObject {
	
	lane: Lane;
	readonly tier: Tier; // the spell's number
	power: Power;
	readonly playerNum: PlayerNum; // player 1 is bottom-up, player 2 is top-down
	moveDirectionX: -1 | 0 | 1 = 0;
	moveDirectionY: -1 | 0 | 1 = 0;
	board: Board;
	static readonly velocity: number = 0.006; // pixels per millisecond
	static readonly framesPerTick: number = Math.round(16 / Spell.velocity / 1000 * Game.maxFrameRate);
	
	constructor(x: number, y: number, lane: Lane, tier: Tier, playerNum: PlayerNum, power: Power = "none", board: Board) {
		super(x, y, 16, 16, `/src/game/main/sprites/spells/spell-player${playerNum}-tier${tier}.png`);
		this.lane = lane;
		this.tier = tier;
		this.playerNum = playerNum;
		this.power = power;
		this.board = board;
	}

	static readonly tierEliminationMap = { // map of which spells beat who
		1: [4],
		2: [1],
		3: [2, 1],
		4: [3, 2],
	};
	
	// returns true if this kills collider
	kills(other: Spell): boolean {
		return other.playerNum !== this.playerNum
			&& Spell.tierEliminationMap[this.tier].includes(other.tier);
	}
	
	collidedWithEnemy(x?: number, y?: number): boolean {
		return this.getCollisionsWithType(Spell, x, y).some(collider => this.playerNum !== collider.playerNum);
	}
	
	collidedWithAlly(x?: number, y?: number): boolean {
		return this.getCollisionsWithType(Spell, x, y).some(collider => this.playerNum === collider.playerNum);
	}

	retreater(): void {
		// stop retreating if lined up with a tile and not colliding with an ally
		if(Game.frameCount % Spell.framesPerTick === 0 && !this.collidedWithAlly())
			this.moveDirectionY = this.playerNum === 1? -1 : 1;
		
		const colliders: Spell[] = this.getCollisionsWithType(Spell, this.x, this.y + 16 * this.moveDirectionY);
		colliders.forEach(collider => {
			if(collider.kills(this))
				this.moveDirectionY = this.playerNum === 1? 1 : -1; // turn around
		});
	}
	
	
	dodger(): void {
		// im gonna extract out the logic for changing lanes once i get to this
	}
	
	private wasLinedUpLastFrame: boolean = true;
	hopper(): void {
		if(!this.moveDirectionY) return;
		
		// stop hopping if lined up with square
		const isLinedUp: boolean = this.board.positionLinesUpWithTile(this.x, undefined, true);
		if(!this.wasLinedUpLastFrame && isLinedUp) {
			this.moveDirectionX = 0;
			this.x = Math.round(this.x);
		}
		this.wasLinedUpLastFrame = isLinedUp;
		
		// start hopping if there are any enemies diagonally, no allies next to you there, and you're not alr hopping
		([1, -1] as const).forEach(dir => {
			if(
				this.collidedWithEnemy(this.x + 16*dir, this.y + 32 * this.moveDirectionY)
				&& !this.collidedWithAlly(this.x + 16*dir, this.y)
			) {
				this.moveDirectionX = dir;
			}
		});
	}


	handleCollisions(): void {
		const colliders: Spell[] = this.getCollisionsWithType(Spell);
		colliders.forEach(collider => {
			if(this.kills(collider))
				collider.destroy();
		});
	}

	step(): void {
		if(this.power !== "none")
			this[this.power]();

		this.handleCollisions();
		
		if(Game.frameCount % Spell.framesPerTick === 0) // start moving when lined up with a tile
			this.moveDirectionY = this.playerNum === 1? -1 : 1;
		
		this.x += Spell.velocity * Game.deltaTime * this.moveDirectionX;
		this.y += Spell.velocity * Game.deltaTime * this.moveDirectionY;
		
		
		if(this.top > Game.screenHeight || this.bottom < 0)
			this.destroy();
		
		if((this.moveDirectionY || this.moveDirectionX) && Game.frameCount % Math.round(Spell.framesPerTick / 16))
			new SpellTrail(this);
	}
	
}