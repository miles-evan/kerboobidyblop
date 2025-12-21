import GameState from "./GameState.ts";
import Game from "./Game.ts";


export default abstract class Snapshotable {
	
	private static nextId: number = 0;
	
	public readonly id: number;
	public readonly className: string;
	
	protected constructor() {
		this.id = Snapshotable.nextId ++;
		this.className = new.target.name;
		
		GameState.objectRegistry[this.id] = this;
		GameState.constructorRegistry[this.className] = new.target;
	}
	
	public destroy(): void {
		delete GameState.objectRegistry[this.id];
	}
	
	
	// -------------------------------- Snapshotting:
	
	
	public static snapshotClassStatics(classToSnapshot: ClassStatics): ClassStatics {
		return Snapshotable.snapshotObject(classToSnapshot);
	}
	
	public snapshot(): Like<Snapshotable> {
		return Snapshotable.snapshotObject(this);
	}
	
	private static snapshotData(data: any): any {
		if(data instanceof Snapshotable) {
			return { "$-SNAPSHOTABLE_ID": data.id, "$-CLASS_NAME": data.className };
		} else if(data instanceof HTMLElement) {
			return { "$-HTML_ELEMENT": data.outerHTML };
		} else if(Array.isArray(data)) {
			return data.map(Snapshotable.snapshotData);
		} else if(typeof data === "object" && data !== null) {
			return Snapshotable.snapshotObject(data);
		} else { // primitive
			return data;
		}
	}
	
	private static snapshotObject<T>(data: T): Like<T> {
		const snapshot: any = { ...data };
		for(const key in snapshot) {
			snapshot[key] = Snapshotable.snapshotData(snapshot[key]);
		}
		return snapshot;
	}
	
	
	// -------------------------------- Recovery:
	
	
	public static recoverClassStatics(ctor: ClassStatics, classStaticsSnapshot: ClassStatics): void {
		Object.assign(ctor, classStaticsSnapshot);
	}
	
	public static recoverSnapshotable(objectSnapshot: Like<Snapshotable>): void {
		const id = objectSnapshot.id;
		if(id in GameState.objectRegistry) {
			const obj: Snapshotable = GameState.objectRegistry[id]!;
			obj.recoverReplace(objectSnapshot);
		} else {
			const ctor = GameState.constructorRegistry[objectSnapshot.className]!;
			ctor.recoverCreate(objectSnapshot); // manually do dynamic method dispatch since class is lost
		}
	}
	
	protected recoverReplace(objectSnapshot: Like<Snapshotable>): void {
		const source = objectSnapshot as Record<string, any>;
		const target = this as Record<string, any>;
		for(const key in source) {
			target[key] = Snapshotable.expandAndLink(source[key]);
		}
	}
	
	protected static recoverCreate(objectSnapshot: Like<Snapshotable>): Snapshotable {
		const ctor = GameState.constructorRegistry[objectSnapshot.className]!;
		const obj: Snapshotable = Object.create(ctor.prototype);
		objectSnapshot = Snapshotable.expandAndLink(objectSnapshot);
		Object.assign(obj, objectSnapshot);
		GameState.objectRegistry[obj.id] = obj;
		return obj;
	}
	
	public static expandAndLink(snapshotData: any): any {
		if(typeof snapshotData !== "object" || snapshotData === null) { // primitive
			return snapshotData;
		} else if("$-SNAPSHOTABLE_ID" in snapshotData) {
			const id: number = snapshotData["$-SNAPSHOTABLE_ID"];
			if(id in GameState.objectRegistry) return GameState.objectRegistry[id];
			const className = snapshotData["$-CLASS_NAME"];
			const ctor = GameState.constructorRegistry[className]!
			ctor.recoverCreate({ id, className } as Like<Snapshotable>); // stub out the snapshotable for now
		} else if("$-HTML_ELEMENT" in snapshotData) {
			const tempContainer = document.createElement("div");
			tempContainer.innerHTML = snapshotData.outerHTML;
			const restored = tempContainer.firstElementChild!;
			Game.__screen!.append(restored);
			return restored;
		} else if(Array.isArray(snapshotData)) {
			return snapshotData.map(Snapshotable.expandAndLink);
		} else { // regular object
			for(const key in snapshotData) {
				snapshotData[key] = Snapshotable.expandAndLink(snapshotData[key]);
			}
			return snapshotData;
		}
	}
	
}