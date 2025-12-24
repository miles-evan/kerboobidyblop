import GameState from "./GameState.ts";
import Game from "./Game.ts";
import { mapObj, mapObjInPlace } from "./utils.ts";


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
		} else if(data instanceof Element) {
			return { "$-HTML_ELEMENT": data.outerHTML };
		} else if(Array.isArray(data)) {
			return data.map(Snapshotable.snapshotData);
		} else if(typeof data === "object" && data !== null) {
			return Snapshotable.snapshotObject(data);
		} else { // primitive
			return data;
		}
	}
	
	private static snapshotObject<T extends object>(data: T): Like<T> {
		return mapObj(data, Snapshotable.snapshotData) as Like<T>;
	}
	
	
	// -------------------------------- Recovery:
	
	
	public static recoverClassStatics(ctor: ClassStatics, classStaticsSnapshot: ClassStatics): void {
		Object.assign(ctor, Snapshotable.expandAndLink(classStaticsSnapshot));
	}
	
	public static recoverSnapshotable(objectSnapshot: Like<Snapshotable>): void {
		const id = objectSnapshot.id;
		if(id in GameState.objectRegistry) {
			const obj: Snapshotable = GameState.objectRegistry[id]!;
			// delete obj["$-debug"];
			obj.recoverReplace(objectSnapshot);
		} else {
			if(!(objectSnapshot.className in GameState.constructorRegistry)) {
				for(const key in objectSnapshot) {
					console.log(key);
				}
				throw new Error(`class ${objectSnapshot.className} not registered. ${objectSnapshot.id}`)
			}
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
		const obj: Snapshotable = Snapshotable.stubOutAndRegister(objectSnapshot.id, objectSnapshot.className);
		// delete obj["$-debug"];
		objectSnapshot = Snapshotable.expandAndLink(objectSnapshot);
		Object.assign(obj, objectSnapshot);
		return obj;
	}
	
	private static stubOutAndRegister(id: number, className: string): Snapshotable {
		const ctor = GameState.constructorRegistry[className]!;
		const obj: Snapshotable = Object.create(ctor.prototype);
		Object.assign(obj, { id, className, /*"$-debug": "i was stubbed"*/ });
		GameState.objectRegistry[id] = obj;
		return obj;
	}
	
	public static expandAndLink(snapshotData: any): any {
		if(typeof snapshotData !== "object" || snapshotData === null) { // primitive
			return snapshotData;
		} else if("$-SNAPSHOTABLE_ID" in snapshotData) {
			const id: number = snapshotData["$-SNAPSHOTABLE_ID"];
			if(id in GameState.objectRegistry) return GameState.objectRegistry[id];
			const className = snapshotData["$-CLASS_NAME"];
			return Snapshotable.stubOutAndRegister(id, className);
		} else if("$-HTML_ELEMENT" in snapshotData) {
			const tempContainer = document.createElement("div");
			tempContainer.innerHTML = snapshotData["$-HTML_ELEMENT"];
			const restored = tempContainer.firstElementChild!;
			Game.__appendHTMLElementToScreen(restored);
			return restored;
		} else if(Array.isArray(snapshotData)) {
			return snapshotData.map(Snapshotable.expandAndLink);
		} else { // regular object
			mapObjInPlace(snapshotData, Snapshotable.expandAndLink);
			return snapshotData;
		}
	}
	
	
	// -------------------------------- Memory management:
	
	
	// does both garbage collection (mark and sweep) and dangling reference removal (sets to null)
	public clean(validIds: Set<number>, idsFound: Set<number>): void {
		Snapshotable.cleanObject(this, validIds, idsFound);
	}
	
	public static cleanClassStatics(ctor: ClassStatics, validIds: Set<number>, idsFound: Set<number>): void {
		Snapshotable.cleanObject(ctor, validIds, idsFound);
	}
	
	private static cleanData(data: any, validIds: Set<number>, idsFound: Set<number>): any {
		if(data instanceof Snapshotable) {
			idsFound.add(data.id); // for garbage collection
			return validIds.has(data.id)? data : null; // dangling reference removal
		} else if(data instanceof Element) {
			return data;
		} else if(Array.isArray(data)) {
			return data.map(x => Snapshotable.cleanData(x, validIds, idsFound));
		} else if(typeof data === "object" && data !== null) {
			Snapshotable.cleanObject(data, validIds, idsFound);
			return data;
		} else { // primitive
			return data;
		}
	}
	
	private static cleanObject(data: object, validIds: Set<number>, idsFound: Set<number>): void {
		mapObjInPlace(data, (x: any) => Snapshotable.cleanData(x, validIds, idsFound));
	}
	
}