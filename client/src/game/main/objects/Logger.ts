import GameObject from "../../engine/GameObject.ts";


export default class Logger extends GameObject {
	
	value: () => string | number | null
	
	constructor(x: Pixels, y: Pixels, value: () => string | number | null) {
		super(x, y);
		this.value = value;
	}
	
	step(): void {
		this.__object.textContent = String(this.value());
	}
	
}