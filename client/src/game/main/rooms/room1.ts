import Board from "../objects/Board.ts";
import PointerInputPlayer from "../castHandlers/PointerInputPlayer.ts";
import RandomBot from "../castHandlers/RandomBot.ts";
import Game from "../../engine/Game.ts";

export default function room1() {
	Game.screenWidth = 96;
	Game.screenHeight = 180;

	new Board(new PointerInputPlayer(), new RandomBot());
}