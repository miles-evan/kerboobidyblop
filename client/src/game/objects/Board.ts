import GameObject from "../fluxEngine/GameObject.ts";
import Game from "../fluxEngine/Game.ts";
import Spell from "./Spell.ts";

export default class Board extends GameObject {
	
	constructor() {
		super();
	}
	
	step() {
		if(Game.isKeyPressed("ArrowUp")) {
			new Spell(0, 500, 2, 1);
		}
	}
	
}