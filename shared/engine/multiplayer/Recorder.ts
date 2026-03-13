import Game from "../main/Game.ts";
import GameState from "./GameState.ts";
import SnapshotableClosure from "./SnapshotableClosure.ts";
import TimeWindow from "./TimeWindow.ts";
import SnapshotableTime from "./SnapshotableTime.ts";
import Snapshotable from "./Snapshotable.ts";


export default class Recorder extends Snapshotable {
	
	static { GameState.registerConstructor(Recorder); } // only registered so we can use snapshotableClosure
	
	// all #private to remain unchanged from snapshots
	static #snapshots: TimeWindow<GameStateSnapshot> | null = null;
	static #inputs: TimeWindow<Record<Key, SnapshotableTime>> | null = null;
	static #state: "stopped" | "recording" | "paused" = "stopped";
	static #snapshotsRepeatableId: RepeatableId = -1;
	static #inputsRepeatableId: RepeatableId = -1;
	
	
	private static saveSnapshot(): void {
		console.log("trying to snapshot")
		if(Recorder.#state !== "recording") return;
		Recorder.#snapshots!.push(Date.now(), GameState.snapshot());
	}
	
	private static saveInputs(): void {
		if(Recorder.#state !== "recording") return;
		Recorder.#inputs!.push(Date.now(), Game.keysDownObject);
	}
	
	
	public static start(tickRate: Hertz = Game.maxFrameRate, windowSize: number = Game.maxFrameRate * 5): void {
		if(Recorder.#state === "recording" || Recorder.#state === "paused") return;
		this.#snapshots = new TimeWindow(windowSize, 1000 / tickRate);
		this.#inputs = new TimeWindow(windowSize * Game.maxFrameRate / tickRate, 1000 / Game.maxFrameRate);
		this.#state = "recording";
		
		Recorder.#snapshotsRepeatableId =
			Game.addRepeatable(new SnapshotableClosure(Recorder, Recorder.saveSnapshot), tickRate);
		Recorder.#inputsRepeatableId =
			Game.addRepeatable(new SnapshotableClosure(Recorder, Recorder.saveInputs), Game.maxFrameRate);
	}
	
	
	public static stop(): void {
		if(Recorder.#state === "stopped") return;
		Recorder.#snapshots = null;
		Recorder.#state = "stopped";
		Game.removeRepeatable(Recorder.#snapshotsRepeatableId);
		Game.removeRepeatable(Recorder.#inputsRepeatableId);
		Recorder.#snapshotsRepeatableId = Recorder.#inputsRepeatableId = -1;
	}
	
	
	private static pause(): void {
		if(Recorder.#state !== "recording") return;
		Recorder.#state = "paused";
	}
	private static unPause(): void {
		if(Recorder.#state !== "paused") return;
		Recorder.#state = "recording";
	}
	
	
	public static rewindAndReplay(timeStamp: Time): void {
		const snapshot = Recorder.#snapshots!.getAtTime(timeStamp);
		if(!snapshot) throw new Error(`(snapshot) Cannot rewind to time ${timeStamp} because it was not recorded
										${JSON.stringify(Recorder.#snapshots!["data"])}`);
		
		Recorder.pause();
		
		GameState.recover(snapshot.value);
		SnapshotableTime.setTime(snapshot.timeStamp);
		
		const startIndex = Recorder.#inputs!.getIndexAtTime(snapshot.timeStamp);
		if(startIndex === -1) throw new Error(`(inputs) Cannot rewind to time ${timeStamp} because it was not recorded
										${JSON.stringify(Recorder.#inputs!["data"])}`);
		
		Game.replay(Recorder.#inputs!, startIndex);
		
		Recorder.unPause();
	}
	
}