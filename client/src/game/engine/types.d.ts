import GameObject from "./GameObject.ts";

export {};

declare global {
	type Constructor<T> = abstract new (...args: any[]) => T;
	type Key = KeyboardEvent["key"] | "touch";
}