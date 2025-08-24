import Board from "../objects/Board.ts";
import RandomBot from "../castHandlers/RandomBot.ts";
import Game from "../../engine/Game.ts";
import CastPadPlayer from "../castHandlers/CastPadPlayer.ts";

export default function room1() {
	Game.screenWidth = 192;
	Game.screenHeight = 180;
	Game.globalSteps.push(() => {
		if(Game.isKeyPressed(" "))
			Game.stop();
	});
	
	new Board(new CastPadPlayer(), new RandomBot(0.005));
}