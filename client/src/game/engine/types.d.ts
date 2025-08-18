import GameObject from "./GameObject.ts";

export {};

declare global {
	type ObjectOptions = {
		hitboxWidth?: number,
		hitboxHeight?: number,
		originX?: number,
		originY?: number
	}
	type Constructor<T> = abstract new (...args: any[]) => T;
	type Key = KeyboardEvent["key"] | "touch";
	type AnyFunction = (...args: any[]) => any;
	type RepeatableId = number;
	type Hertz = number;
	type Time = number; // Date.now()
	type Repeatable = {
		fn: AnyFunction,
		timesPerSecond: Hertz,
		timeOfLastFrameIdeally: Time,
	}
}