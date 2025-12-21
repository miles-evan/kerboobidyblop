import GameState from "./GameState.ts";


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
	
	public snapshot() {
		return Snapshotable.snapshotObject(this);
	}
	
	private static snapshotData(data: any): any {
		if(data instanceof Snapshotable) {
			return { SNAPSHOTABLE_ID: data.id }
		} else if(Array.isArray(data)) {
			return data.map(Snapshotable.snapshotData);
		} else if(typeof data === "object" && data !== null) {
			return Snapshotable.snapshotObject(data);
		} else {
			return data;
		}
	}
	
	private static snapshotObject(data: object) {
		const snapshot: any = { ...data };
		for(const key in snapshot) {
			snapshot[key] = Snapshotable.snapshotData(snapshot[key]);
		}
		return snapshot;
	}
	
}