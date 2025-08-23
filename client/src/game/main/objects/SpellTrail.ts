import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";

export default class SpellTrail extends GameObject {
	
	initialOpacity: number;
	static readonly lifeTime: Seconds = 1;
	
	constructor(x: number, y: number, power: Power) {
		super(x, y, 16, 16, `/src/game/main/sprites/spell-trails/spell-trail-${power}.png`);
		
		this.initialOpacity = {
			"none": 1,
			"retreater": 1,
			"dodger": 0.5,
			"hopper": 0.25,
		}[power];
		
		this.opacity = this.initialOpacity;
		
		this.depth = 1;
	}
	
	step() {
		this.opacity -= Game.deltaTime * ((this.initialOpacity / SpellTrail.lifeTime) / 1000);
		if(this.opacity <= 0)
			this.destroy();
	}
	
}