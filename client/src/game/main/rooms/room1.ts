import Board from "../objects/Board.ts";
import KeyboardInputPlayer from "../moveHandlers/KeyboardInputPlayer.ts";
import RandomBot from "../moveHandlers/RandomBot.ts";

export function loadRoom1() {
	new Board(new KeyboardInputPlayer(), new RandomBot());
}