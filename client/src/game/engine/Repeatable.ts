import SnapshotableClosure from "./SnapshotableClosure.ts";
import Snapshotable from "./Snapshotable.ts";


// repeatables are functions that get called at a set rate like 5 times per second
// use these instead of setInterval because this will time more accurately alongside the game's framerate
// they can also be snapshotable whereas intervals cannot
export default class Repeatable extends Snapshotable {
	public fn: AnyFunction | SnapshotableClosure; // if you want the repeatable to be snapshotable, use SnapshotableClosure
	public timesPerSecond: Hertz;
	private timeOfLastFrameIdeally: Time;
	
	constructor(fn: AnyFunction | SnapshotableClosure, timesPerSecond: Hertz) {
		super();
		this.fn = fn;
		this.timesPerSecond = timesPerSecond;
		this.timeOfLastFrameIdeally = Date.now();
	}
	
	// checks if it's time to run the function, and runs it
	public tryRun(): void {
		const now: Time = Date.now();
		const period: Milliseconds = 1000 / this.timesPerSecond;
		if(now - this.timeOfLastFrameIdeally < period) return; // not time yet
		
		this.runFunction();
		this.timeOfLastFrameIdeally += period;
		
		// so you don't get too behind if low framerate:
		if(now - this.timeOfLastFrameIdeally > period)
			this.timeOfLastFrameIdeally = now;
	}
	
	private runFunction() {
		if(this.fn instanceof SnapshotableClosure) this.fn.run();
		else this.fn();
	}
}