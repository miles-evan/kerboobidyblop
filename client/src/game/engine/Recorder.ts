import Game from "./Game.ts";
import Snapshotable from "./Snapshotable.ts";
import GameState from "./GameState.ts";
import SnapshotableClosure from "./SnapshotableClosure.ts";


export default class Recorder extends Snapshotable {
	
	static {
		GameState.registerConstructor(Recorder);
	}
	
	private static windowSize: number = 0;
	private static recording: boolean = false;
	private static repeatableId: RepeatableId = -1;
	
	public static start(tickRate: Hertz = Game.maxFrameRate, windowSize: number = Game.maxFrameRate * 5) {
		this.windowSize = windowSize;
		this.recording = true;
		Recorder.repeatableId = Game.addRepeatable(new SnapshotableClosure(Recorder, Recorder.tick), tickRate);
	}
	
	public static stop() {
		if(!Recorder.recording) return;
		Recorder.recording = false;
		Game.removeRepeatable(Recorder.repeatableId);
	}
	
	private static tick() {
	
	}
	
}