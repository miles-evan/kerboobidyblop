import GameObject from "../../../engine/GameObject.ts";
import Game from "../../../engine/Game.ts";

type UiButtonOptions = {
	className?: string, // for styling/tests
	label?: string, // small text under the button
	onClick: () => void,
	isEnabled?: () => boolean, // grayed out and unclickable when false
};

// a clickable/tappable sprite; pointerdown works for both mouse and touch
export default class UiButton extends GameObject {

	private readonly isEnabled: (() => boolean) | null;
	private readonly labelDiv: HTMLDivElement | null = null;

	constructor(
		x: Pixels, y: Pixels, width: Pixels, height: Pixels, sprite: string,
		{ className, label, onClick, isEnabled }: UiButtonOptions
	) {
		super(x, y, width, height, sprite);
		this.isEnabled = isEnabled ?? null;

		if(className)
			this._object.className = className;

		const style = this._object.style;
		style.cursor = "pointer";
		style.touchAction = "manipulation";
		style.userSelect = "none";
		style.setProperty("-webkit-tap-highlight-color", "transparent");

		if(label) {
			this.labelDiv = document.createElement("div");
			this.labelDiv.textContent = label;
			this.labelDiv.style.position = "absolute";
			this.labelDiv.style.top = "100%";
			this.labelDiv.style.width = "100%";
			this.labelDiv.style.textAlign = "center";
			this.labelDiv.style.color = "white";
			this.labelDiv.style.textShadow = "0 0 2px black";
			this.labelDiv.style.pointerEvents = "none";
			this._object.appendChild(this.labelDiv);
		}

		this._object.addEventListener("pointerdown", event => {
			event.preventDefault();
			event.stopPropagation();
			if(!this.isEnabled || this.isEnabled())
				onClick();
		});
	}

	set visible(visible: boolean) {
		this._object.style.display = visible? "" : "none";
	}

	step(): void {
		this.opacity = (!this.isEnabled || this.isEnabled())? 1 : 0.35;
		if(this.labelDiv)
			this.labelDiv.style.fontSize = 3.5 * Game.virtualScreenSizeMultiplier + "px";
	}

}
