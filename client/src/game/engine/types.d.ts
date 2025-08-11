import GameObject from "./GameObject.ts";

export {};

declare global {
	type Key = KeyboardEvent["key"] | "touch";
	type GameObjectConstructor = new (...args: any[]) => GameObject;
}