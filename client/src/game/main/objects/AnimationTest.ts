import GameObject from "../../engine/GameObject.ts";
import f1 from "../sprites/spell-trails/spell-trail-none.png";
import f2 from "../sprites/spell-trails/spell-trail-retreater.png";
import f3 from "../sprites/spell-trails/spell-trail-dodger.png";
import f4 from "../sprites/spell-trails/spell-trail-hopper.png";


export default class AnimationTest extends GameObject {
	
	constructor(x: number, y: number, imageSpeed: number) {
		super(x, y, 16, 16);
		this.animatedSprite = [f1, f2, f3, f4];
		this.imageSpeed = imageSpeed;
	}
	
	step(): void {
	
	}
	
}