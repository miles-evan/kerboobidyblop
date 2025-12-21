import Snapshotable from "./Snapshotable.ts";
import Game from "./Game.ts";

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
	
	public static snapshot(): GameStateSnapshot {
		const objects: Record<number, Like<Snapshotable>> = { ...GameState.objectRegistry };
		for(const id in objects) {
			objects[id] = (objects[id] as Snapshotable).snapshot();
		}
		
		const classStatics: Record<string, ClassStatics> = { ...GameState.constructorRegistry };
		for(const className in classStatics) {
			classStatics[className] = Snapshotable.snapShotClassStatics(classStatics[className]!);
		}
		
		const gameClassStatics: ClassStatics = Snapshotable.snapShotClassStatics(Game);
		
		return { objects, classStatics, gameClassStatics };
	}
}