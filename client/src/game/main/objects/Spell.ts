import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";


export default class Spell extends GameObject {
	
	lane: Lane;
	readonly tier: Tier; // the spell's number
	readonly playerNum: PlayerNum; // player 1 is bottom-up, player 2 is top-down
	moving: boolean = false; // whether it's moving (only starts moving on tick start)
	power: (() => void) | null = null;
	static readonly vy = 0.05; // pixels per millisecond
	static readonly framesPerTick = Math.round(64 / Spell.vy / 1000 * Game.maxFrameRate);
	
	constructor(x: number, y: number, lane: Lane, tier: Tier, playerNum: PlayerNum, power: PowerName | null = null) {
		super(x, y, 64, 64, `/src/game/main/sprites/spells/spell-player${playerNum}-tier${tier}.png`);
		this.lane = lane;
		this.tier = tier;
		this.playerNum = playerNum;
		if(power)
			this.power = this[power];
	}

	static readonly tierEliminationMap = { // map of which spells beat who
		1: [4],
		2: [1],
		3: [2, 1],
		4: [3, 2],
	};
	
	// Returns true if this kills collider
	kills(collider: Spell) {
		return Spell.tierEliminationMap[this.tier].includes(collider.tier);
	}

	retreater(): void {
		const colliders = this.getCollisionsWithType(Spell);
		colliders.forEach(collider => {
			if(collider.kills(this))
				this.y += (this.playerNum === 1 ? 1 : -1) * 100;
		});
	}
	
	
	dodger(): void {
	
	}
	
	hopper(): void {
	
	}


	handleCollisions() {
		const colliders = this.getCollisionsWithType(Spell);
		colliders.forEach(collider => {
			if(this.kills(collider))
				collider.destroy();
		});
	}

	step() {
		this.power?.();

		this.handleCollisions();

		if(Game.frameCount % Spell.framesPerTick === 0)
			this.moving = true;
		
		if(this.moving) {
			this.y += Spell.vy * Game.deltaTime * (this.playerNum === 1? -1 : 1);
			if(this.top > Game.screenHeight || this.bottom < 0)
				this.destroy();
		}
		
	}
}