import Snapshotable from "./Snapshotable.ts";


// stores a time (see Time type), but auto adjusts when recovered (relative to when it was captured)
export default class SnapshotableTime extends Snapshotable {
	
	private static offset: Milliseconds = 0; // you can change the time so .now() gives you a diff time
	public value: Time;
	
	public constructor(time: Time) {
		super("inline");
		this.value = time;
	}
	
	public static now(): SnapshotableTime {
		return new SnapshotableTime(Date.now() + SnapshotableTime.offset);
	}
	
	public static setTime(time: Time): void {
		SnapshotableTime.offset = time - Date.now();
	}
	
	public static resetTime(): void {
		SnapshotableTime.offset = 0;
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