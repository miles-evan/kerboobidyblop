import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";

export default class GameOverText extends GameObject {

	constructor(text: string) {
		super(0, 75, Game.screenWidth, 20, "");
		this._object.textContent = text;
		this._object.style.color = "white";
		this._object.style.textShadow = "1px 1px 3px black, -1px -1px 3px black";
		this._object.style.textAlign = "center";
		this._object.style.fontWeight = "bold";
		this.depth = -10;
	}

	step(): void {
		// font size isn't scaled by GameObject.update, so scale it to the screen here
		this._object.style.fontSize = 10 * Game.virtualScreenSizeMultiplier + "px";
	}

}
