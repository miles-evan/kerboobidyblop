import GameObject from "../../engine/GameObject.ts";
import type Spell from "./Spell.ts";


export default class SpellTrail extends GameObject {
	
	constructor(spell: Spell) {
		super(spell.x, spell.y, spell.width, spell.height, "/src/game/main/sprites/spell-trail.png");
		this.opacity = 0.1;
		this.depth = 1;
	}
	
	step() {
		this.opacity -= 0.0025;
		if(this.opacity <= 0)
			this.destroy();
	}
	
}