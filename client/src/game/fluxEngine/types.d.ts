import { GameObject } from "./GameObject.ts";

export {};

declare global {
	type Key = KeyboardEvent["key"] | "touch";
	type GameObjectConstructor = new (...args: any[]) => GameObject;
	type Lane =  0 | 1 | 2;
	type Tier = 1 | 2 | 3 | 4;
}