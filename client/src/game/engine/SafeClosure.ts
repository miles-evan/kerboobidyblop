import GameObject from "./GameObject.ts";

// state-safe closure
// like a function, but serializable and re-linkable (important for multiplayer)
export default class SafeClosure {
	public obj: GameObject | GameObjectClass;
	public method: string;
	
	// method MUST be a method of obj. ClosureLike will only store the name of the method
	// (it takes the method instead of just the string, so that ts doesn't get mad that you aren't "using" the method ever)
	// obj can be Constructor<GameObject> too so that it can use static functions
	public constructor(obj: GameObject | GameObjectClass, method: AnyFunction) {
		this.obj = obj;
		this.method = method.name;
	}
	
	public run(): void {
		// @ts-ignore
		this.obj[this.method](); // will throw a runtime error if the method name doesn't match
	}
}