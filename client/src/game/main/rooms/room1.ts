import Board from "../objects/Board.ts";
import KeyboardInputPlayer from "../castHandlers/KeyboardInputPlayer.ts";
import RandomBot from "../castHandlers/RandomBot.ts";
import Game from "../../engine/Game.ts";
import CastPad from "../objects/CastPad.ts";

export default function room1() {
	Game.screenWidth = 192;
	Game.screenHeight = 180;
	Game.globalSteps.push(() => {
		if(Game.isKeyPressed(" "))
			Game.stop();
	});
	
	new Board(new KeyboardInputPlayer(), new RandomBot());
	new CastPad(120, 30);
}