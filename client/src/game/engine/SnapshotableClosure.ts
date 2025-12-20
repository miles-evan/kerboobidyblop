import Snapshotable from "./Snapshotable.ts";


export default class SnapshotableClosure extends Snapshotable {
	public readonly obj: Snapshotable | SnapshotableClass;
	public readonly methodName: string;
	
	// method MUST be a method of obj. ClosureLike will only store the name of the method
	// (it takes the method instead of just the string, so that ts doesn't get mad that you aren't "using" the method ever)
	// obj can be Constructor<GameObject> too so that it can use static functions
	public constructor(obj: Snapshotable | SnapshotableClass, method: AnyFunction) {
		super();
		this.obj = obj;
		this.methodName = method.name;
		if(!(method.name in obj))
			throw new Error(`Cannot create SafeClosure; ${method.name} does not belong to object`);
	}
	
	public run(): void {
		// @ts-ignore
		this.obj[this.methodName](); // will throw a runtime error if the method name doesn't match
	}
}