import SafeClosure from "./SafeClosure.ts";
import GameState from "./GameState.ts";

// repeatables are functions that get called at a set rate like 5 times per second
// use these instead of setInterval because this will time more accurately alongside the game's framerate
// they can also be state-safe whereas intervals cannot
export default class Repeatable extends GameState {
	public fn: AnyFunction | SafeClosure; // if you want the repeatable to be state-safe, use SafeClosure
	public timesPerSecond: Hertz;
	private timeOfLastFrameIdeally: Time;
	
	constructor(fn: AnyFunction | SafeClosure, timesPerSecond: Hertz) {
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
		if(this.fn instanceof SafeClosure) this.fn.run();
		else this.fn();
	}
}