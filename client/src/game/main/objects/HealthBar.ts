import GameObject from "../../engine/GameObject.ts";
import Game from "../../engine/Game.ts";
import Player from "../castHandlers/Player.ts";

// horizontal health bar above (opponent) or below (you) the board
export default class HealthBar extends GameObject {

	readonly player: Player;
	private fillDiv: HTMLDivElement;

	constructor(player: Player, side: "top" | "bottom") {
		const width: Pixels = Game.screenWidth - 4;
		super((Game.screenWidth - width) / 2, side === "top"? 1 : 171, width, 8, "");
		this.player = player;
		this.depth = -3; // in front of the board and spells

		this._object.style.backgroundColor = "#411";
		this._object.style.borderRadius = "2px";

		this.fillDiv = document.createElement("div");
		this.fillDiv.style.position = "absolute";
		this.fillDiv.style.inset = "1px";
		this.fillDiv.style.background = "#0c0";
		this.fillDiv.style.borderRadius = "2px";
		this.fillDiv.style.pointerEvents = "none";
		this.fillDiv.style.transformOrigin = "left";
		this._object.appendChild(this.fillDiv);
	}

	step(): void {
		const fillPercent: number = Math.max(0, Math.min(1, this.player.health / Player.maxHealth));
		this.fillDiv.style.transform = `scaleX(${fillPercent})`;
	}

}
