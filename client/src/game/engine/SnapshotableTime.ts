import Snapshotable from "./Snapshotable.ts";


// stores a time (see Time type), but auto adjusts when recovered (relative to when it was captured)
export default class SnapshotableTime extends Snapshotable {
	public value: Time;
	
	constructor(time: Time) {
		super();
		this.value = time;
	}
	
	snapshot(): Like<Snapshotable> {
		const result = super.snapshot() as SnapshotableTime;
		result.value -= Date.now();
		return result;
	}
	
	public recoverReplace(objectSnapshot: Like<Snapshotable>): void {
		super.recoverReplace(objectSnapshot);
		this.value += Date.now();
	}
	
	public static recoverCreate(objectSnapshot: Like<Snapshotable>): SnapshotableTime {
		const obj = Snapshotable.recoverCreate(objectSnapshot) as SnapshotableTime;
		obj.value += Date.now();
		return obj;
	}
}