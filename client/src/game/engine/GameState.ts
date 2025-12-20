
// objects that can be serialized and re-linked
// the class also tracks all of such objects
export default abstract class GameState {
	
	private static nextId: number = 0;
	private static readonly objectRegistry: Record<number, GameState> = {}; // id -> object
	private static readonly constructorRegistry: Record<string, typeof GameState> = {}; // class name -> constructor
	
	public readonly id: number;
	private readonly className: string;
	
	
	protected constructor() {
		this.id = GameState.nextId ++;
		this.className = new.target.name;
		
		GameState.objectRegistry[this.id] = this;
		GameState.constructorRegistry[new.target.name] = new.target;
	}
	
	
	public static destroyAll(): void {
		for(const id in GameState.objectRegistry)
			GameState.objectRegistry[id]!.destroy();
		for(const className in GameState.constructorRegistry)
			delete GameState.constructorRegistry[className];
		GameState.nextId = 0;
	}
	
	
	public destroy(): void {
		delete GameState.objectRegistry[this.id];
	}
	
	
	public static serializeGameState() {
	
	}
	
	
	// private serialize() {
	//
	// }
	
	public shutuptypescript() {this.className;}
	
}