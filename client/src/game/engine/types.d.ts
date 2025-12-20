import GameObject from "./GameObject.ts";
import type Snapshotable from "./Snapshotable.ts";

export {};

declare global {
	type ObjectOptions = {
		hitboxWidth?: number,
		hitboxHeight?: number,
		originX?: number,
		originY?: number,
		includeInGameState?: boolean,
	}
	type AppendableObject = { [key: string]: any };
	type Constructor<T> = abstract new (...args: any[]) => T;
	type GameObjectClass = Constructor<GameObject>;
	type SnapshotableClass = Constructor<Snapshotable>;
	type Key = KeyboardEvent["key"] | "touch";
	type AnyFunction = (...args: any[]) => any;
	type RepeatableId = number;
	type Hertz = number;
	type Time = number; // milliseconds since epoch
	type Seconds = number;
	type Milliseconds = number;
	type Pixels = number;
	type PixelsPerSecond = number;
	type Degrees = number;
	type Radians = number;
	type Frames = number;
	type FramesPerSecond = number;
}