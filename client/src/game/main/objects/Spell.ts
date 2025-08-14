import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import SpellTrail from "./SpellTrail.ts";


export default class Spell extends GameObject {
	
	lane: Lane;
	readonly tier: Tier; // the spell's number
	readonly playerNum: PlayerNum; // player 1 is bottom-up, player 2 is top-down
	moving: boolean = false; // whether it's moving (only starts moving on tick start)
	moveDirection: 1 | -1;
	power: (() => void) | null = null;
	static readonly velocity = 0.025; // pixels per millisecond
	static readonly framesPerTick = Math.round(64 / Spell.velocity / 1000 * Game.maxFrameRate);
	
	constructor(x: number, y: number, lane: Lane, tier: Tier, playerNum: PlayerNum, power: Power = "none") {
		super(x, y, 64, 64, `/src/game/main/sprites/spells/spell-player${playerNum}-tier${tier}.png`);
		this.lane = lane;
		this.tier = tier;
		this.playerNum = playerNum;
		this.moveDirection = playerNum === 1? -1 : 1;
		if(power !== "none")
			this.power = this[power];
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

	retreater(): void {
		// set to forward, only if lined up with a tile and not colliding with an ally
		if(Game.frameCount % Spell.framesPerTick === 0
			&& !this.getCollisionsWithType(Spell).some(collider => this.playerNum === collider.playerNum))
			this.moveDirection = this.playerNum === 1? -1 : 1;
		
		const colliders: Spell[] = this.getCollisionsWithType(Spell, this.x, this.y + 64 * this.moveDirection);
		colliders.forEach(collider => {
			if(collider.kills(this))
				this.moveDirection = this.playerNum === 1? 1 : -1; // turn around
		});
	}
	
	
	dodger(): void {
	
	}
	
	hopper(): void {
	
	}


	handleCollisions(): void {
		const colliders: Spell[] = this.getCollisionsWithType(Spell);
		colliders.forEach(collider => {
			if(this.kills(collider))
				collider.destroy();
		});
	}

	step(): void {
		this.power?.();

		this.handleCollisions();
		
		if(Game.frameCount % Spell.framesPerTick === 0) // start moving when lined up with a tile
			this.moving = true;
		
		if(this.moving) {
			this.y += Spell.velocity * Game.deltaTime * this.moveDirection;
			if(this.top > Game.screenHeight || this.bottom < 0)
				this.destroy();
			
			if(Game.frameCount % Math.round(Spell.framesPerTick / 16))
				new SpellTrail(this);
		}
		
	}
}