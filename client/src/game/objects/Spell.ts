import GameObject from "../fluxEngine/GameObject";


export default class Spell extends GameObject {
	
	lane: number; // Col
	rank: number; // Row
	tier: 1 | 2 | 3 | 4; // the spell's number
	player: 1 | 2; // player 1 is bottom-up, player 2 is top-down

	constructor(lane: number, rank: number, tier: 1|2|3|4, player: 1|2){
		super()
		this.lane = lane;
		this.rank = rank;
		this.tier = tier;
		this.player = player;
	}

	step() {

	}
}