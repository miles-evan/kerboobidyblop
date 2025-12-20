

export default abstract class GameState {
	
	private static nextId: number = 0;
	private static readonly objectRegistry: Record<number, GameState>; // id -> object
	private static readonly constructorRegistry: Record<string, typeof GameState>; // class name -> constructor
	
	private readonly id: number;
	private readonly constructorName: string;
	
	
	protected constructor() {
		this.id = GameState.nextId ++;
		this.constructorName = new.target.name;
		
		GameState.objectRegistry[this.id] = this;
		GameState.constructorRegistry[new.target.name] = new.target;
	}
	
	
	public destroy(): void {
		delete GameState.objectRegistry[this.id];
	}
	
	public static destroyAll(): void {
		for(const id in GameState.objectRegistry)
			GameState.objectRegistry[id]!.destroy();
		for(const className in GameState.constructorRegistry)
			delete GameState.constructorRegistry[className];
		GameState.nextId = 0;
	}
	
	
	public typescriptIsAngryAtMeBecauseImNotUsingSomeStuffYet() {
		this.id;
		this.constructorName;
	}
	
}