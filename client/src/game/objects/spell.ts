import GameObject from "../fluxEngine/GameObject";
import Game from "../fluxEngine/Game.ts";
import s1 from "../sprites/spells/default-spell-1.png";
import s2 from "../sprites/spells/default-spell-2.png";
import s3 from "../sprites/spells/default-spell-3.png";
import s4 from "../sprites/spells/default-spell-4.png";


export default class Spell extends GameObject {
	
	tier: 1 | 2 | 3 | 4; // the spell's number
	player: 1 | 2; // player 1 is bottom-up, player 2 is top-down
	readonly vy = 0.05; // pixels per millisecond

	constructor(x: number, y: number, tier: 1|2|3|4, player: 1|2){
		super(x, y, 64, 64, [s1, s2, s3, s4][tier-1]);
		this.tier = tier;
		this.player = player;
	}

	step() {
		
		this.y += this.vy * Game.deltaTime * (this.player === 1? -1 : 1);
		if(this.top > Game.screenHeight || this.bottom < 0)
			this.destroy();
	}
}