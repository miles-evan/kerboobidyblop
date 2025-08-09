import { GameObject } from "../fluxEngine/GameObject";

export class Spell extends GameObject {
	lane: number; // Col 
	rank: number; // Row
	type: number; 
	// Be poop make spell again
	constructor(lane: number, type: 0|1|2|3){
		super()
		this.lane = lane;
		this.rank = 0;
		this.type = type;
	}

	step() {

	}
}