import GameObject from "@engine/main/GameObject.ts";
import h0 from "../sprites/health/health-0.png";
import h1 from "../sprites/health/health-1.png";
import h2 from "../sprites/health/health-2.png";
import h3 from "../sprites/health/health-3.png";
import h4 from "../sprites/health/health-4.png";
import h5 from "../sprites/health/health-5.png";
import h6 from "../sprites/health/health-6.png";
import h7 from "../sprites/health/health-7.png";
import h8 from "../sprites/health/health-8.png";
import h9 from "../sprites/health/health-9.png";


export default class HealthMeter extends GameObject {
	
	public constructor(x: Pixels, y: Pixels) {
		super(x, y, 16, 16);
		this.animatedSprite = [h0, h1, h2, h3, h4, h5, h6, h7, h8, h9];
		this.imageSpeed = 0;
		this.imageIndex = 9;
	}
	
	public set health(health: number) {
		this.imageIndex = Math.max(0, health);
	}
	
	public step(): void {}
}