import GameObject from "../../engine/GameObject.ts";
import Spell from "./Spell.ts";


export default class Endzone extends GameObject {
	
	private readonly onZoneEntered: (sumOfTiers: number) => any;
	
	constructor(x: Pixels, y: Pixels, onZoneEntered: (sumOfTiers: number) => any) {
		super(x, y, 64, 16);
		// this._object.style.border = "1px solid black";
		this._object.style.boxSizing = "border-box";
		this.depth = -10;
		this.onZoneEntered = onZoneEntered;
	}
	
	step(): void {
		const colliders: Spell[] = this.getCollisionsWithType(Spell);
		if(colliders.length !== 0) {
			this.onZoneEntered(colliders.reduce((sum: number, collider: Spell): number => {
				collider.destroy();
				return sum + collider.tier;
			}, 0));
		}
	}
	
}