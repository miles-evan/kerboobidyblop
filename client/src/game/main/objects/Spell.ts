import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import s1 from "../sprites/spells/default-spell-1.png";
import s2 from "../sprites/spells/default-spell-2.png";
import s3 from "../sprites/spells/default-spell-3.png";
import s4 from "../sprites/spells/default-spell-4.png";


export default class Spell extends GameObject {
	
	lane: Lane;
	readonly tier: Tier; // the spell's number
	readonly playerNum: PlayerNum; // player 1 is bottom-up, player 2 is top-down
	moving: boolean = false; // whether it's moving (only starts moving on tick start)
	static readonly vy = 0.05; // pixels per millisecond
	static readonly framesPerTick = Math.round(64 / Spell.vy / 1000 * Game.maxFrameRate);

	static readonly tierEliminationMap = { // map of which spells beat who
		1: [4],
		2: [1],
		3: [2, 1],
		4: [3, 2, 1] 
	};
	// powers are function pointers that are called in order at the start of each step.
	powers: Array<() => void> = [];


	constructor(x: number, y: number, lane: Lane, tier: Tier, playerNum: PlayerNum){
		super(x, y, 64, 64, [s1, s2, s3, s4][tier-1]);
		this.lane = lane;
		this.tier = tier;
		this.playerNum = playerNum;
		this.powers = [this.dodger];
	}

	dodger = () => {
		const colliders = Game.getObjectsCollisionsWithType(this, Spell);
		colliders.forEach(collider => {
			if(collider.kills(this)){
				this.y += (this.playerNum === 1 ? 1 : -1) * 100;
				// Remove the power once it's used once
				this.powers = this.powers.filter(power => power !== this.dodger);
			}
		});
	}

	// Returns true if this kills collider
	kills(collider: Spell) {
		return Spell.tierEliminationMap[this.tier].includes(collider.tier);
	}



	handleCollisions() {
		const colliders = Game.getObjectsCollisionsWithType(this, Spell);
		colliders.forEach(collider => {
			if(this.kills(collider)) {
				collider.destroy();
			}
		});
	}

	step() {
		this.powers.forEach(power => power());

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