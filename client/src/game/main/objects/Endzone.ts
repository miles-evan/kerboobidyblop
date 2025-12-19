import GameObject from "../../engine/GameObject.ts";
import Spell from "./Spell.ts";
import type Player from "../castHandlers/Player.ts";


// when spells collide with the endzone, they do damage to their enemy
export default class Endzone extends GameObject {
	
	private readonly player: Player;
	
	public constructor(x: Pixels, y: Pixels, player: Player) {
		super(x, y, 64, 16);
		this.depth = -10;
		this.player = player;
	}
	
	public step(): void {
		const colliders: Spell[] = this.getCollisionsWithType(Spell);
		if(colliders.length === 0) return;
		const damage: number = colliders.reduce((sum, collider) => {
			collider.destroy();
			return sum + collider.tier;
		}, 0);
		this.player.hurt(damage);
	}
	
}