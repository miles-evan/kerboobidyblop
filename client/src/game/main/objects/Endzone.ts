import GameObject from "../../engine/GameObject.ts";
import Spell from "./Spell.ts";


// spells step into the endzone to do damage to their enemy
export default class Endzone extends GameObject {
	
	private readonly onZoneEntered: (sumOfTiers: number) => any;
	
	public constructor(x: Pixels, y: Pixels, onZoneEntered: (sumOfTiers: number) => any) {
		super(x, y, 64, 16);
		this.depth = -10;
		this.onZoneEntered = onZoneEntered;
	}
	
	public step(): void {
		const colliders: Spell[] = this.getCollisionsWithType(Spell);
		if(colliders.length === 0) return;
		const damage: number = colliders.reduce((sum, collider) => {
			collider.destroy();
			return sum + collider.tier;
		}, 0);
		this.onZoneEntered(damage);
	}
	
}