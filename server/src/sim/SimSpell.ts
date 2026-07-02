import type { Lane, Tier, PlayerNum, Power, SpellState } from "../protocol.ts";
import {
	SPELL_SIZE, SPELL_VELOCITY, SCREEN_HEIGHT, TOP_LEFT_TILE_X, TILE_SIZE, TIER_ELIMINATION_MAP,
	DAMAGE_PER_TIER,
} from "../constants.ts";
import type Simulation from "./Simulation.ts";


// Headless port of client/src/game/main/objects/Spell.ts.
// x/y are the top-left corner, same as the client (spells have origin 0,0).
export default class SimSpell {

	readonly id: number;
	lane: Lane;
	readonly tier: Tier;
	readonly power: Power;
	readonly playerNum: PlayerNum;
	x: number;
	y: number;
	xVelocity: number = 0;
	yVelocity: number = 0;
	dead: boolean = false;

	constructor(id: number, x: number, y: number, lane: Lane, tier: Tier, playerNum: PlayerNum, power: Power) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.lane = lane;
		this.tier = tier;
		this.playerNum = playerNum;
		this.power = power;
	}


	// same strict-inequality AABB as GameObject.collidedWith (hitbox = full 16x16 sprite)
	static overlaps(ax: number, ay: number, bx: number, by: number): boolean {
		return ax + SPELL_SIZE > bx
			&& ax < bx + SPELL_SIZE
			&& ay + SPELL_SIZE > by
			&& ay < by + SPELL_SIZE;
	}

	getCollisions(sim: Simulation, x?: number, y?: number): SimSpell[] {
		const [atX, atY] = [x ?? this.x, y ?? this.y];
		return sim.spells.filter(other =>
			other !== this
			&& !other.dead
			&& SimSpell.overlaps(atX, atY, other.x, other.y));
	}

	collidedWithEnemy(sim: Simulation, x?: number, y?: number): boolean {
		return this.getCollisions(sim, x, y).some(collider => this.playerNum !== collider.playerNum);
	}

	collidedWithAlly(sim: Simulation, x?: number, y?: number): boolean {
		return this.getCollisions(sim, x, y).some(collider => this.playerNum === collider.playerNum);
	}

	// returns true if this kills other
	kills(other: SimSpell): boolean {
		return other.playerNum !== this.playerNum
			&& (TIER_ELIMINATION_MAP[this.tier] ?? []).includes(other.tier);
	}


	private retreater(sim: Simulation): void {
		// stop retreating if lined up with a tile and not colliding with an ally
		if(sim.tileTickThisStep)
			this.yVelocity = this.playerNum === 1? -SPELL_VELOCITY : SPELL_VELOCITY;

		const colliders: SimSpell[] = this.getCollisions(sim, this.x, this.y + 16 * Math.sign(this.yVelocity));
		colliders.forEach(collider => {
			if(collider.kills(this))
				this.yVelocity = this.playerNum === 1? SPELL_VELOCITY : -SPELL_VELOCITY; // turn around
		});
	}

	private dodger(sim: Simulation): void {
		if(this.collidedWithEnemy(sim, this.x, this.y + 32 * Math.sign(this.yVelocity))) {
			if(!this.collidedWithAlly(sim, this.x - 16) && this.lane !== 0)
				this.changeLanes(-1);
			else if(!this.collidedWithAlly(sim, this.x + 16) && this.lane !== 2)
				this.changeLanes(1);
		}
	}

	private hopper(sim: Simulation): void {
		// start hopping if there are any enemies diagonally, no allies next to you there, and you're not alr hopping
		([1, -1] as const).forEach(dir => {
			if(
				this.collidedWithEnemy(sim, this.x + 16*dir, this.y + 32 * Math.sign(this.yVelocity))
				&& !this.collidedWithAlly(sim, this.x + 16*dir, this.y)
			) {
				this.changeLanes(dir);
			}
		});
	}

	private changeLanes(dir: -1 | 0 | 1): void {
		if(!dir || !this.yVelocity || this.xVelocity) return;
		this.lane = (this.lane + dir) as Lane;
		this.xVelocity = dir * SPELL_VELOCITY;
	}


	handleCollisions(sim: Simulation): void {
		const colliders: SimSpell[] = this.getCollisions(sim);
		colliders.forEach(collider => {
			if(this.kills(collider))
				collider.dead = true;
		});
	}

	step(sim: Simulation, deltaTime: number): void {
		if(this.power === "retreater") this.retreater(sim);
		else if(this.power === "dodger") this.dodger(sim);
		else if(this.power === "hopper") this.hopper(sim);

		this.handleCollisions(sim);

		// start moving when lined up with a tile
		if(sim.tileTickThisStep)
			this.yVelocity = this.playerNum === 1? -SPELL_VELOCITY : SPELL_VELOCITY;

		// changing lanes
		const targetX: number = TOP_LEFT_TILE_X + TILE_SIZE * this.lane;
		// if you're about to finish or finished changing lanes (algebraically simplified equation), then stop
		if(
			Math.sign(this.xVelocity) !== Math.sign((targetX - this.x) * (1 - (SPELL_VELOCITY / 1000) * deltaTime))
			|| Math.sign(this.xVelocity) !== Math.sign(targetX - this.x)
		) {
			this.x = targetX;
			this.xVelocity = 0;
		}

		// reaching the far side damages the player there (but not your own side, e.g. a fleeing retreater)
		if(this.y > SCREEN_HEIGHT) {
			if(this.playerNum === 2)
				sim.damagePlayer(1, DAMAGE_PER_TIER * this.tier);
			this.dead = true;
		} else if(this.y + SPELL_SIZE < 0) {
			if(this.playerNum === 1)
				sim.damagePlayer(2, DAMAGE_PER_TIER * this.tier);
			this.dead = true;
		}
	}

	applyVelocity(deltaTime: number): void {
		this.x += (this.xVelocity / 1000) * deltaTime;
		this.y += (this.yVelocity / 1000) * deltaTime;
	}


	toState(): SpellState {
		return {
			id: this.id,
			lane: this.lane,
			tier: this.tier,
			power: this.power,
			playerNum: this.playerNum,
			x: this.x,
			y: this.y,
			xVelocity: this.xVelocity,
			yVelocity: this.yVelocity,
		};
	}

}
