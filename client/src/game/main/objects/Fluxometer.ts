import GameObject from "../../engine/GameObject.ts";
import f0 from "../sprites/fluxometer/fluxometer0.png";
import f1 from "../sprites/fluxometer/fluxometer1.png";
import f2 from "../sprites/fluxometer/fluxometer2.png";
import f3 from "../sprites/fluxometer/fluxometer3.png";
import f4 from "../sprites/fluxometer/fluxometer4.png";
import f5 from "../sprites/fluxometer/fluxometer5.png";
import f6 from "../sprites/fluxometer/fluxometer6.png";
import f7 from "../sprites/fluxometer/fluxometer7.png";
import f8 from "../sprites/fluxometer/fluxometer8.png";
import f9 from "../sprites/fluxometer/fluxometer9.png";
import f10 from "../sprites/fluxometer/fluxometer10.png";
import Game from "../../engine/Game.ts";


export default class Fluxometer extends GameObject {
	
	constructor() {
		super(30, Game.screenHeight - 16, 64, 16);
		this.animatedSprite = [f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10];
		this.imageSpeed = 0;
	}
	
	set flux(flux: Flux) {
		this.imageIndex = Math.floor(flux);
	}
	
	step(): void {}
	
}