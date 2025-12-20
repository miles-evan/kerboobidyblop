import GameState from "./GameState.ts";
import Snapshot from "./Snapshot.ts";


export default abstract class Snapshotable {
	private static nextId: number = 0;
	public readonly id: number;
	private readonly className: string;
	
	protected constructor() {
		this.id = Snapshotable.nextId ++;
		this.className = new.target.name;
		
		GameState.objectRegistry[this.id] = this;
		GameState.constructorRegistry[new.target.name] = new.target;
	}
	
	public destroy(): void {
		delete GameState.objectRegistry[this.id];
	}
	
	private snapshot(): Snapshot {
	
	}
	
}