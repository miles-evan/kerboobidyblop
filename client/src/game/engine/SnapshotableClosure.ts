import Snapshotable from "./Snapshotable.ts";
import GameState from "./GameState.ts";


export default class SnapshotableClosure<F extends AnyFunction = AnyFunction> extends Snapshotable {
	
	private readonly objOrClassName: Snapshotable | string; // either the object that owns the method or the name of the class that owns the method
	private readonly methodName: string;
	private readonly args: any[]; // if these args are set, they will be used on calls
	
	// method MUST be a method of obj. ClosureLike will only store the name of the method
	// (it takes the method instead of just the string, so that ts doesn't get mad that you aren't "using" the method ever)
	// obj can be Constructor<GameObject> too so that it can use static functions
	public constructor(objOrClass: Snapshotable | { name: string }, method: F, ...args: any[]) {
		super("inline");
		this.objOrClassName = objOrClass instanceof Snapshotable? objOrClass : objOrClass.name;
		this.methodName = method.name;
		if(!(method.name in objOrClass))
			throw new Error(`Cannot create SafeClosure; ${method.name} does not belong to object`);
		this.args = [...args];
	}
	
	public run(...args: any[]): void {
		if(this.args.length !== 0) args = this.args; // overwrite if args already set
		
		const base = this.objOrClassName instanceof Snapshotable?
			this.objOrClassName as Record<string, any>
			: GameState.constructorRegistry[this.objOrClassName] as Record<string, any>;
		
		// error handling
		if(!base) {
			throw new Error(`Class "${this.objOrClassName}" not found, make sure you register your class manually if it's used before any instances of it are created.
			Ex: static{GameState.registerConstructor(MyClass);}
			The object was: ${this.objOrClassName}
			The SnapshotableClosure had: className=${this.className}, id=${this.id}`);
		}
		if(!(this.methodName in base)) throw new Error(`Method "${this.methodName}" not found on object`)
		
		// call
		base[this.methodName](...args);
	}
	
}