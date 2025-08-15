import GameObject from "../../engine/GameObject.ts";
import type Spell from "./Spell.ts";


export default class SpellTrail extends GameObject {
	
	decayRate: number;
	
	constructor(spell: Spell) {
		super(spell.x, spell.y, spell.width, spell.height, `/src/game/main/sprites/spell-trails/spell-trail-${spell.power}.png`);
		
		[this.opacity, this.decayRate] = {
			"none": [0.1, 0.0025],
			"retreater": [0.1, 0.0025],
			"dodger": [0.05, 0.00125],
			"hopper": [0.025, 0.000625]
		}[spell.power];
		
		this.depth = 1;
	}
	
	step() {
		this.opacity -= this.decayRate;
		if(this.opacity <= 0)
			this.destroy();
	}
	
}