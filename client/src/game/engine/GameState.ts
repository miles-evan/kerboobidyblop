import Snapshotable from "./Snapshotable.ts";
import Game from "./Game.ts";

// keeps track of all Snapshotables. can create snapshots
export default class GameState {
	public static readonly objectRegistry: Record<number, Snapshotable> = {}; // id -> object
	public static readonly constructorRegistry: Record<string, typeof Snapshotable> = {}; // class name -> constructor
	
	
	public static destroyAllObjects(): void {
		for(const id in GameState.objectRegistry)
			GameState.objectRegistry[id]!.destroy();
	}
	
	
	public static snapshot(): GameStateSnapshot {
		// objects
		const objects: Record<number, Like<Snapshotable>> = { ...GameState.objectRegistry };
		for(const id in objects) {
			objects[id] = (objects[id] as Snapshotable).snapshot();
		}
		
		// classes
		const classStatics: Record<string, ClassStatics> = { ...GameState.constructorRegistry };
		for(const className in classStatics) {
			classStatics[className] = Snapshotable.snapshotClassStatics(classStatics[className]!);
		}
		
		// Game class
		const gameClassStatics: ClassStatics = Snapshotable.snapshotClassStatics(Game);
		
		return { objects, classStatics, gameClassStatics };
	}
	
	
	public static recover(snapshot: GameStateSnapshot): void {
		// objects
		for(const id in GameState.objectRegistry) {
			if(!(id in snapshot)) delete GameState.objectRegistry[id];
		}
		Object.values(snapshot.objects).forEach(Snapshotable.recoverSnapshotable);
		
		// classes
		for(const className in GameState.constructorRegistry) {
			Snapshotable.recoverClassStatics(
				GameState.constructorRegistry[className]!,
				snapshot.classStatics[className]!
			);
		}
		
		// Game class
		Snapshotable.recoverClassStatics(Game, snapshot.gameClassStatics);
	}
}