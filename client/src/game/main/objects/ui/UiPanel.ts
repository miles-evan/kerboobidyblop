import GameObject from "../../../engine/GameObject.ts";

// a plain colored rectangle (menu backgrounds, highlights); never intercepts clicks
export default class UiPanel extends GameObject {

	constructor(x: Pixels, y: Pixels, width: Pixels, height: Pixels, color: string) {
		super(x, y, width, height, "");
		this._object.style.backgroundColor = color;
		this._object.style.borderRadius = "2px";
		this._object.style.pointerEvents = "none";
	}

	set visible(visible: boolean) {
		this._object.style.display = visible? "" : "none";
	}

	step(): void {}

}
