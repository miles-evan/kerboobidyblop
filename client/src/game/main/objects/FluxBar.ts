import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import type Player from "../castHandlers/Player.ts";

// vertical flux bar in a side margin, filling from the bottom
export default class FluxBar extends GameObject {

	readonly player: Player;
	static readonly maxFlux: number = 10; // matches the cap in Board.step / the server sim
	private fillDiv: HTMLDivElement;

	constructor(player: Player) {
		super(Game.screenWidth - 12, 10, 8, 160, "");
		this.player = player;
		this.depth = -3; // in front of the board and spells

		this._object.style.backgroundColor = "#223";
		this._object.style.borderRadius = "2px";

		this.fillDiv = document.createElement("div");
		this.fillDiv.style.position = "absolute";
		this.fillDiv.style.inset = "1px";
		this.fillDiv.style.background = "#00f";
		this.fillDiv.style.borderRadius = "2px";
		this.fillDiv.style.pointerEvents = "none";
		this.fillDiv.style.transformOrigin = "bottom";
		this._object.appendChild(this.fillDiv);
	}

	step(): void {
		const fillPercent: number = Math.max(0, Math.min(1, this.player.flux / FluxBar.maxFlux));
		this.fillDiv.style.transform = `scaleY(${fillPercent})`;
	}

}
