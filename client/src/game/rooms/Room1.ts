import Board from "../objects/Board.ts";
import RandomBot from "../castHandlers/RandomBot.ts";
import Game from "@engine/main/Game.ts";
import CastPadPlayer from "../castHandlers/CastPadPlayer.ts";
import Fluxometer from "../objects/Fluxometer.ts";
import HealthMeter from "../objects/HealthMeter.ts";

export default class Room1 {
	
	public static load(): void {
		Game.screenWidth = 192;
		Game.screenHeight = 212;
		
		new Board(
			new CastPadPlayer(
				new HealthMeter(100, Game.screenHeight - 16),
				new Fluxometer(),
				130, 75,
			),
			new RandomBot(
				new HealthMeter(100, 16),
			),
		);
	}
}