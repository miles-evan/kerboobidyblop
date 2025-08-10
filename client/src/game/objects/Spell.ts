import GameObject from "../fluxEngine/GameObject";
import Game from "../fluxEngine/Game.ts";


export default class Spell extends GameObject {
	
	tier: 1 | 2 | 3 | 4; // the spell's number
	player: 1 | 2; // player 1 is bottom-up, player 2 is top-down
	readonly vy = 1;

	constructor(x: number, y: number, tier: 1|2|3|4, player: 1|2){
		super(x, y, 32, 32, `../sprites/spells/default-spell-${tier}`);
		this.tier = tier;
		this.player = player;
	}

	step() {
		
		this.y += this.vy * Game.deltaTime * this.player === 1? -1 : 1;
		
	}
}