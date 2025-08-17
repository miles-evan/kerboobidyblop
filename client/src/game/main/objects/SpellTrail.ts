import GameObject from "../../engine/GameObject.ts";


export default class SpellTrail extends GameObject {
	
	decayRate: number;
	
	constructor(x: number, y: number, power: Power) {
		super(x, y, 16, 16, `/src/game/main/sprites/spell-trails/spell-trail-${power}.png`);
		
		[this.opacity, this.decayRate] = {
			"none": [0.5, 0.005],
			"retreater": [0.5, 0.005],
			"dodger": [0.25, 0.0025],
			"hopper": [0.125, 0.00125]
		}[power];
		
		this.depth = 1;
	}
	
	step() {
		this.opacity -= this.decayRate;
		if(this.opacity <= 0)
			this.destroy();
	}
	
}