import Player from "./Player.ts";
import Game from "../../engine/Game.ts";
import type Fluxometer from "../objects/Fluxometer.ts";
import Logger from "../objects/Logger.ts";


export default class RandomBot extends Player {
	
	chanceOfMoving: number;
	
	constructor(fluxometer: Fluxometer | null = null, chanceOfMoving: number = 0.005) {
		super(fluxometer);
		this.chanceOfMoving = chanceOfMoving;
		new Logger(2, 75, () => this.health);
	}
	
	tryCast(): [Tier, Power, Lane] | null {
		if(!Game.isKeyPressed("0") && Math.random() > this.chanceOfMoving)
			return null;
		
		const lane: Lane = Math.floor(Math.random() * 3) as Lane;
		const tier: Tier = Math.floor(Math.random() * 4) + 1 as Tier;

		return [tier, "none", lane];
	}
}