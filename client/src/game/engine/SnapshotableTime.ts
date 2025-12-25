import Snapshotable from "./Snapshotable.ts";


// stores a time (see Time type), but auto adjusts when recovered (relative to when it was captured)
export default class SnapshotableTime extends Snapshotable {
	public value: Time;
	
	public constructor(time: Time) {
		super("reference");
		this.value = time;
	}
	
	public static now(): SnapshotableTime {
		return new SnapshotableTime(Date.now());
	}
	
	public snapshot(): Like<Snapshotable> {
		const result = super.snapshot() as SnapshotableTime;
		result.value -= Date.now();
		return result;
	}
	
	protected recoverReplace(objectSnapshot: Like<SnapshotableTime>): void {
		super.recoverReplace(objectSnapshot);
		this.value += Date.now();
	}
	
	protected static recoverCreate(objectSnapshot: Like<SnapshotableTime>): SnapshotableTime {
		const obj = Snapshotable.recoverCreate(objectSnapshot) as SnapshotableTime;
		obj.value += Date.now();
		return obj;
	}
}