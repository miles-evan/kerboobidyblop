import GameObject from "./main/GameObject.ts";
import type Snapshotable from "./Snapshotable.ts";

export {};

declare global {
	type ObjectOptions = {
		hitboxWidth?: number,
		hitboxHeight?: number,
		originX?: number,
		originY?: number,
	}
	type AppendableObject = { [key: string]: any };
	type Constructor<T> = abstract new (...args: any[]) => T;
	type GameObjectClass = Constructor<GameObject>;
	type SnapshotableClass = Constructor<Snapshotable>;
	type ClassStatics = Record<string, any>; // because TS complains about Constructor<> if it's a protected constructor
	type Key = KeyboardEvent["key"] | "touch" | "left-click" | "middle-click" | "right-click";
	type AnyFunction = (...args: any[]) => any;
	type RepeatableId = number;
	type Hertz = number;
	type Seconds = number;
	type Milliseconds = number;
	type Time = Milliseconds; // milliseconds since epoch
	type Pixels = number;
	type PixelsPerSecond = number;
	type Degrees = number;
	type Radians = number;
	type Frames = number;
	type FramesPerSecond = number;
	type Like<T> = { [K in keyof T]: T[K] }; // has same keys and value types as T
	type KeysLike<T> = { [K in keyof T]: unkown }; // has same keys as T, but values unknown
	type GameStateSnapshot = {
		objects: Record<number, Like<Snapshotable>>,
		classStatics: Record<string, Like<ClassStatics>>,
	};
	type SnapshotMode = "reference" | "inline";
	type Room = { load: AnyFunction }
}