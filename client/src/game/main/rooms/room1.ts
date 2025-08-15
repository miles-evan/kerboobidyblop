import Board from "../objects/Board.ts";
import KeyboardInputPlayer from "../castHandlers/KeyboardInputPlayer.ts";
import RandomBot from "../castHandlers/RandomBot.ts";
import Game from "../../engine/Game.ts";
import MouseCursor from "../objects/MouseCursor.ts";

export default function room1() {
	Game.screenWidth = 96;
	Game.screenHeight = 180;
	new Board(new KeyboardInputPlayer(), new RandomBot());
	new MouseCursor();
}