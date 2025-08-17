import Board from "../objects/Board.ts";
import KeyboardInputPlayer from "../castHandlers/KeyboardInputPlayer.ts";
import RandomBot from "../castHandlers/RandomBot.ts";
import Game from "../../engine/Game.ts";
import AnimationTest from "../objects/AnimationTest.ts";

export default function room1() {
	Game.screenWidth = 96;
	Game.screenHeight = 180;
	Game.globalSteps = () => {
	
	}
	new Board(new KeyboardInputPlayer(), new RandomBot());
	new AnimationTest(0, 0, 2);
	new AnimationTest(16, 0, 2.1);
}