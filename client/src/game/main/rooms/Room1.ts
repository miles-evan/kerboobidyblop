import Board from "../objects/Board.ts";
import RandomBot from "../castHandlers/RandomBot.ts";
import Game from "../../engine/Game.ts";
import CastPadPlayer from "../castHandlers/CastPadPlayer.ts";
import Fluxometer from "../objects/Fluxometer.ts";
import HealthMeter from "../objects/HealthMeter.ts";
import GameState from "../../engine/GameState.ts";
import Snapshotable from "../../engine/Snapshotable.ts";
import SnapshotableClosure from "../../engine/SnapshotableClosure.ts";
import Recorder from "../../engine/Recorder.ts";

export default class Room1 extends Snapshotable {
	
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
		
		Game.snapshotableGlobalSteps.push(new SnapshotableClosure(Room1, Room1.test));
	}
	
	private static test(): void {
		if(Game.isKeyPressed("1"))
			Recorder.start();
		if(Game.isKeyPressed("2"))
			Recorder.rewindAndReplay(Date.now() - 3000);
		
	}
	
	public static snapshotClassStatics(): ClassStatics {
		return { ...Snapshotable.snapshotClassStatics(Room1), testing: false };
	}
}