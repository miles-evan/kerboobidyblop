import type Snapshotable from "./Snapshotable.ts";

// keeps track of all Snapshotables. can create snapshots
export default class GameState {
	public static readonly objectRegistry: Record<number, Snapshotable> = {}; // id -> object
	public static readonly constructorRegistry: Record<string, typeof Snapshotable> = {}; // class name -> constructor
	
	public static destroyAll(): void {
		for(const id in GameState.objectRegistry)
			GameState.objectRegistry[id]!.destroy();
		for(const className in GameState.constructorRegistry)
			delete GameState.constructorRegistry[className];
	}
	
	public static snapshot() {
	
	}
}