import GameObject from "../../engine/GameObject.ts";


export default class Logger extends GameObject {
	
	value: () => string | number | null
	
	constructor(x: Pixels, y: Pixels, value: () => string | number | null) {
		super(x, y);
		this.value = value;
	}
	
	step(): void {
		this._object.textContent = String(this.value());
	}
	
}