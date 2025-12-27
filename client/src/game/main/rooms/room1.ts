import Board from "../objects/Board.ts";
import RandomBot from "../castHandlers/RandomBot.ts";
import Game from "../../engine/Game.ts";
import CastPadPlayer from "../castHandlers/CastPadPlayer.ts";
import Fluxometer from "../objects/Fluxometer.ts";
import HealthMeter from "../objects/HealthMeter.ts";
import GameState from "../../engine/GameState.ts";
import Snapshotable from "../../engine/Snapshotable.ts";
import SnapshotableClosure from "../../engine/SnapshotableClosure.ts";

export default class Room1 extends Snapshotable {
	
	private static testing: boolean = false;
	
	static {
		GameState.registerConstructor(Room1);
	}
	
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
		
		Game.globalSteps.push(new SnapshotableClosure(Room1, Room1.test));
	}
	
	private static test(): void {
		if(Game.isKeyPressed("Escape") && !Room1.testing) {
			Room1.testing = true;
			const snapshot = GameState.snapshot();
			console.log(JSON.parse(JSON.stringify(snapshot)));
			setTimeout(() => {
				GameState.recover(snapshot);
				Room1.testing = false;
			}, 1000);
		}
	}
	
	public static snapshotClassStatics(): ClassStatics {
		return { ...Snapshotable.snapshotClassStatics(Room1), testing: false };
	}
}