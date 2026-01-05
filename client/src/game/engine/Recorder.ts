import Game from "./Game.ts";
import Snapshotable from "./Snapshotable.ts";
import GameState from "./GameState.ts";
import SnapshotableClosure from "./SnapshotableClosure.ts";
import TimeWindow from "./TimeWindow.ts";
import SnapshotableTime from "./SnapshotableTime.ts";


export default class Recorder extends Snapshotable {
	
	static { GameState.registerConstructor(Recorder); }
	
	static #snapshots: TimeWindow<GameStateSnapshot> | null = null;
	static #inputs: TimeWindow<Record<Key, SnapshotableTime>> | null = null;
	static #recording: boolean = false;
	static #snapshotsRepeatableId: RepeatableId = -1;
	static #inputsRepeatableId: RepeatableId = -1;
	
	
	private static snapshot(): void {
		Recorder.#snapshots?.push(Date.now(), GameState.snapshot());
	}
	
	private static saveInputs(): void {
		Recorder.#inputs?.push(Date.now(), Game.keysDownObject);
	}
	
	
	public static start(tickRate: Hertz = Game.maxFrameRate, windowSize: number = Game.maxFrameRate * 5): void {
		if(Recorder.#recording) return;
		this.#snapshots = new TimeWindow(windowSize, 1000 / tickRate);
		this.#recording = true;
		
		Recorder.#snapshotsRepeatableId =
			Game.addRepeatable(new SnapshotableClosure(Recorder, Recorder.snapshot), tickRate);
		Recorder.#inputsRepeatableId =
			Game.addRepeatable(new SnapshotableClosure(Recorder, Recorder.saveInputs), Game.maxFrameRate)
	}
	
	
	public static stop(): void {
		if(!Recorder.#recording) return;
		Recorder.#snapshots = null;
		Recorder.#recording = false;
		Game.removeRepeatable(Recorder.#snapshotsRepeatableId);
		Game.removeRepeatable(Recorder.#inputsRepeatableId);
		Recorder.#snapshotsRepeatableId = Recorder.#inputsRepeatableId = -1;
	}
	
	
	public static rewind(timeStamp: Time): void {
		const snapshot = Recorder.#snapshots?.getAtTime(timeStamp);
		if(!snapshot) throw new Error(`Cannot rewind to time ${timeStamp} because it was not recorded`);
		GameState.recover(snapshot);
	}
	
}