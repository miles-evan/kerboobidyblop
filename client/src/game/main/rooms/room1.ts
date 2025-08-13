import Board from "../objects/Board.ts";
import KeyboardInputPlayer from "../castHandlers/KeyboardInputPlayer.ts";
import RandomBot from "../castHandlers/RandomBot.ts";

export function loadRoom1() {
	new Board(new KeyboardInputPlayer(), new RandomBot());
}