import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import SpellTrail from "./SpellTrail.ts";
import type Board from "./Board.ts";


export default class Spell extends GameObject {
	
	lane: Lane;
	readonly tier: Tier; // the spell's number
	power: Power;
	readonly playerNum: PlayerNum; // player 1 is bottom-up, player 2 is top-down
	board: Board;
	private readonly trailRepeatableId: RepeatableId;
	
	static readonly secondsPerTile: Seconds = 1.5;
	static readonly velocity: PixelsPerSecond = 16 / Spell.secondsPerTile;
	static tileTickRepeatableId: RepeatableId | null = null;
	static lastTileTickTime: Time = 0;
	
	constructor(x: Pixels, y: Pixels, lane: Lane, tier: Tier, playerNum: PlayerNum, power: Power = "none", board: Board) {
		super(x, y, 16, 16, `/src/game/main/sprites/spells/spell-player${playerNum}-tier${tier}.png`);
		this.lane = lane;
		this.tier = tier;
		this.playerNum = playerNum;
		this.power = power;
		this.board = board;
		
		this.trailRepeatableId = Game.addRepeatable(() => {
			if(this.yVelocity)
				new SpellTrail(this.x, this.y, this.power)
		}, Spell.velocity / 2);
	}
	
	
	// call once to sync
	static syncTiles(): void {
		Game.removeRepeatable(Spell.tileTickRepeatableId);
		Spell.tileTickRepeatableId = Game.addRepeatable(() => {
			Spell.lastTileTickTime = Date.now();
		}, Spell.velocity / 16);
	}


	static fluxCost(tier: Tier, power: Power): Flux {
		const tierCost: Record<Tier, number> = {
			1: 1,
			2: 2,
			3: 3,
			4: 4,
		}
		const powerCost: Record<Power, number> = {
			"none": 1,
			"retreater": 2,
			"dodger": 2,
			"hopper": 2,
		}

		return tierCost[tier] * powerCost[power];
	}
	
	static onTileTick(): boolean {
		return Game.justHappened(Spell.lastTileTickTime);
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
	
	private retreater(): void {
		// stop retreating if lined up with a tile and not colliding with an ally
		if(Spell.onTileTick())
			this.yVelocity = this.playerNum === 1? -Spell.velocity : Spell.velocity;
		
		const colliders: Spell[] = this.getCollisionsWithType(Spell, this.x, this.y + 16 * Math.sign(this.yVelocity));
		colliders.forEach(collider => {
			if(collider.kills(this))
				this.yVelocity = this.playerNum === 1? Spell.velocity : -Spell.velocity; // turn around
		});
	}
	
	
	private dodger(): void {
		if(this.collidedWithEnemy(this.x, this.y + 33 * Math.sign(this.yVelocity))) {
			if(!this.collidedWithAlly(this.x - 16) && this.lane !== 0)
				this.changeLanes(-1);
			else if(!this.collidedWithAlly(this.x + 16) && this.lane !== 2)
				this.changeLanes(1);
		}
	}
	
	private hopper(): void {
		// start hopping if there are any enemies diagonally, no allies next to you there, and you're not alr hopping
		([1, -1] as const).forEach(dir => {
			if(
				this.collidedWithEnemy(this.x + 16*dir, this.y + 32 * Math.sign(this.yVelocity))
				&& !this.collidedWithAlly(this.x + 16*dir, this.y)
			) {
				this.changeLanes(dir);
			}
		});
	}
	
	
	private changeLanes(dir: -1 | 0 | 1) {
		if(!dir || !this.yVelocity || this.xVelocity) return;
		this.lane += dir;
		this.xVelocity = dir * Spell.velocity;
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
		
		// start moving when lined up with a tile
		if(Spell.onTileTick())
			this.yVelocity = this.playerNum === 1? -Spell.velocity : Spell.velocity;
		
		// changing lanes
		const targetX: number = this.board.getPositionOfTile(this.lane, 0)[0];
		// if you're about to finish or finished changing lanes (algebraically simplified equation), then stop
		if(
			Math.sign(this.xVelocity) !== Math.sign((targetX - this.x) * (1 - (Spell.velocity / 1000) * Game.deltaTime))
			|| Math.sign(this.xVelocity) !== Math.sign(targetX - this.x)
		) {
			this.x = targetX;
			this.xVelocity = 0;
		}
		
		if(this.top > Game.screenHeight || this.bottom < 0)
			this.destroy();
	}
	
	destroy() {
		super.destroy();
		Game.removeRepeatable(this.trailRepeatableId);
	}
	
}