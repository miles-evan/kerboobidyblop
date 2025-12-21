import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import SpellTrail from "./SpellTrail.ts";
import type Board from "./Board.ts";
import SnapshotableClosure from "../../engine/SnapshotableClosure.ts";
import SnapshotableTime from "../../engine/SnapshotableTime.ts";


export default class Spell extends GameObject {
	
	public lane: Lane;
	public readonly tier: Tier; // the spell's number
	public power: Power;
	public readonly playerNum: PlayerNum; // player 1 is bottom-up, player 2 is top-down
	public board: Board;
	private readonly trailRepeatableId: RepeatableId;
	
	private static readonly secondsPerTile: Seconds = 1.5;
	private static readonly velocity: PixelsPerSecond = 16 / Spell.secondsPerTile;
	private static tileTickRepeatableId: RepeatableId | null = null;
	private static lastTileTickTime: SnapshotableTime = new SnapshotableTime(0);
	
	public constructor(x: Pixels, y: Pixels, lane: Lane, tier: Tier, playerNum: PlayerNum, power: Power = "none", board: Board) {
		super(x, y, 16, 16, `/src/game/main/sprites/spells/spell-player${playerNum}-tier${tier}.png`);
		this.lane = lane;
		this.tier = tier;
		this.playerNum = playerNum;
		this.power = power;
		this.board = board;
		
		this.trailRepeatableId = Game.addRepeatable(new SnapshotableClosure(this, this.spawnTrail), Spell.velocity / 2);
	}
	
	
	// call once to sync
	public static syncTiles(): void {
		Game.removeRepeatable(Spell.tileTickRepeatableId);
		Spell.tileTickRepeatableId = Game.addRepeatable(
			new SnapshotableClosure(Spell, Spell.updateLastTileTickTime),
			Spell.velocity / 16
		);
	}
	
	private static onTileTick(): boolean {
		return Game.justHappened(Spell.lastTileTickTime.value);
	}


	public static fluxCost(tier: Tier, power: Power): Flux {
		return tier * (power === "none"? 1 : 2);
	}
	
	private spawnTrail(): void {
		if(this.yVelocity) new SpellTrail(this.x, this.y, this.power);
	}
	
	private static updateLastTileTickTime(): void {
		Spell.lastTileTickTime = SnapshotableTime.now();
	}
	
	// returns true if this kills collider
	private kills(other: Spell): boolean {
		return other.playerNum !== this.playerNum && {
			1: [4], 2: [1], 3: [2, 1], 4: [3, 2]            // map of which spells beat who
		}[this.tier].includes(other.tier);
	}
	
	private collidedWithEnemy(x?: number, y?: number): boolean {
		return this.getCollisionsWithType(Spell, x, y).some(collider => this.playerNum !== collider.playerNum);
	}
	
	public collidedWithAlly(x?: number, y?: number): boolean {
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
		if(this.collidedWithEnemy(this.x, this.y + 34 * Math.sign(this.yVelocity))) {
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


	private handleCollisions(): void {
		const colliders: Spell[] = this.getCollisionsWithType(Spell);
		colliders.forEach(collider => {
			if(this.kills(collider))
				collider.destroy();
		});
	}

	
	public step(): void {
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
	
	
	public destroy(): void {
		super.destroy();
		Game.removeRepeatable(this.trailRepeatableId);
	}
	
	public static cleanupRepeatables(): void {
		Game.removeRepeatable(Spell.tileTickRepeatableId);
		Spell.tileTickRepeatableId = null
	}
	
}