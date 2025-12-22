import Snapshotable from "./Snapshotable.ts";
import Game from "./Game.ts";

// keeps track of all Snapshotables. can create snapshots
export default class GameState {
	public static readonly objectRegistry: Record<number, Snapshotable> = {}; // id -> object
	public static readonly constructorRegistry: Record<string, typeof Snapshotable> = {}; // class name -> constructor
	
	
	public static registerConstructor(ctor: typeof Snapshotable | any) { // typescript's making me want to blow my brains out because no matter what I say the type is of the constructor, it gets mad at one of the usages. If I say typeof Snapshotable, Room1 works, but GameObject doesn't, and if I say Constructor<Snapshotable> the converse happens. I give up. I said typeof Snapshotable | any so that it's clear what it wants, but It'll take whatever
		GameState.constructorRegistry[ctor.name] = ctor as typeof Snapshotable;
	}
	
	
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
		
		// other classes
		const snapshotableClassStatics: ClassStatics = Snapshotable.snapshotClassStatics(Snapshotable);
		const gameClassStatics: ClassStatics = Snapshotable.snapshotClassStatics(Game);
		
		return { objects, classStatics, snapshotableClassStatics, gameClassStatics };
	}
	
	
	public static recover(snapshot: GameStateSnapshot): void {
		// objects
		for(const id of Object.keys(GameState.objectRegistry)) {
			if(!(id in snapshot.objects)) {
				GameState.objectRegistry[id as unknown as number]!.destroy();
			}
		}
		Object.values(snapshot.objects).forEach(Snapshotable.recoverSnapshotable);
		
		// classes
		for(const className in GameState.constructorRegistry) {
			Snapshotable.recoverClassStatics(
				GameState.constructorRegistry[className]!,
				snapshot.classStatics[className]!
			);
		}
		
		// other classes
		Snapshotable.recoverClassStatics(Snapshotable, snapshot.snapshotableClassStatics);
		Snapshotable.recoverClassStatics(Game, snapshot.gameClassStatics);
		
		Game.stop();
		Game.start();
	}
}