import GameState from "./GameState.ts";
import Game from "../main/Game.ts";
import { mapObj, mapObjInPlace } from "../utils.ts";


export default abstract class Snapshotable {
	
	private static nextId: number = 0;
	
	public readonly id: number; // -1 if inline snapshotable
	public readonly className: string;
	
	
	// register constructor
	static { GameState.registerConstructor(Snapshotable); }
	
	
	// "reference" is the default setting, "inline" means it has no ID, and won't be stored in the list of objects
	// pick "inline" if it doesn't need to be relinked up, like if its reference isn´t shared. "inline" is helpful
	// if the garbage collector is wasting a lot of time removing instances of it
	protected constructor(mode: "inline" | "reference" = "reference") {
		if(mode === "reference") {
			this.id = Snapshotable.nextId ++;
			GameState.objectRegistry[this.id] = this;
		} else {
			this.id = -1;
		}
		
		this.className = new.target.name;
		GameState.constructorRegistry[this.className] = new.target;
	}
	
	
	public destroy(): void {
		if(this.id !== -1) delete GameState.objectRegistry[this.id];
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
			const result = { "$-SNAPSHOTABLE_ID": data.id, "$-CLASS_NAME": data.className };
			if(data.id === -1) Object.assign(result, data.snapshot()); // inline snapshotable
			return result;
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
		if(id !== -1 && id in GameState.objectRegistry) {
			const obj: Snapshotable = GameState.objectRegistry[id]!;
			obj.recoverReplace(objectSnapshot);
		} else {
			if(!(objectSnapshot.className in GameState.constructorRegistry))
				throw new Error(`class ${objectSnapshot.className} not registered. ${objectSnapshot.id}`)
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
		let obj: Snapshotable;
		if(objectSnapshot.id !== -1) {
			obj = Snapshotable.stubOutAndRegister(objectSnapshot.id, objectSnapshot.className);
		} else {
			obj = Snapshotable.stubOut(objectSnapshot.className);
			const { "$-SNAPSHOTABLE_ID": _1, "$-CLASS_NAME": _2, ...withoutTags } = objectSnapshot as any;
			objectSnapshot = withoutTags; // remove tags
		}
		objectSnapshot = Snapshotable.expandAndLink(objectSnapshot);
		Object.assign(obj, objectSnapshot);
		return obj;
	}
	
	private static stubOutAndRegister(id: number, className: string): Snapshotable {
		const obj: Snapshotable = Snapshotable.stubOut(className);
		GameState.objectRegistry[id] = obj;
		return obj;
	}
	
	private static stubOut(className: string): Snapshotable {
		const ctor = GameState.constructorRegistry[className]!;
		return Object.create(ctor.prototype);
	}
	
	private static expandAndLink(snapshotData: any): any {
		if(typeof snapshotData !== "object" || snapshotData === null) { // primitive
			return snapshotData;
		} else if("$-SNAPSHOTABLE_ID" in snapshotData) {
			const id: number = snapshotData["$-SNAPSHOTABLE_ID"];
			if(id === -1) { // inline snapshotable
				const ctor = GameState.constructorRegistry[snapshotData["$-CLASS_NAME"]]!;
				return ctor.recoverCreate(snapshotData); // manually do dynamic method dispatch since class is lost
			}
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
		if(data instanceof Snapshotable && data.id !== -1) {
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