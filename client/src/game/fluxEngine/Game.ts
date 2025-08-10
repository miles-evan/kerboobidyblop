import GameObject from "./GameObject.ts";


export default class Game {
	static _gameObjects: GameObject[] = [];
	static maxFrameRate: number = 60;
	static isRunning: boolean = false;
	static screen: HTMLElement | null;
	static screenWidth: number;
	static screenHeight: number;
	private static keysDown: Record<Key, number> = {};
	private static lastFrameTimeStamp = 0;
	private static currentFrameTimeStamp = 0;
	private static onKeyDown: (e: KeyboardEvent) => void;
	private static onKeyUp: (e: KeyboardEvent) => void;
	private static onTouchStart: (e: TouchEvent) => void;
	private static onTouchEnd: (e: TouchEvent) => void;
	static globalStep = () => {};
	
	
	static init(screen: HTMLElement) {
		Game.screen = screen;
		Game.screenWidth = screen.clientWidth;
		Game.screenHeight = screen.clientHeight;
		
		Game.onKeyDown = (e: KeyboardEvent) => {
			if(!(e.key in Game.keysDown))
				Game.keysDown[e.key as Key] = Date.now();
		};
		Game.onKeyUp = (e: KeyboardEvent) => {
			delete Game.keysDown[e.key as Key];
		};
		Game.onTouchStart = () => {
			if(!("touch" in Game.keysDown))
				Game.keysDown["touch"] = Date.now();
		};
		Game.onTouchEnd = () => {
			delete Game.keysDown["touch"];
		};
		window.addEventListener("keydown", Game.onKeyDown);
		window.addEventListener("keyup", Game.onKeyUp);
		screen.addEventListener("touchstart", Game.onTouchStart);
		screen.addEventListener("touchend", Game.onTouchEnd);
	}
	
	static destroy() {
		Game.stop();
		if(!Game.screen) return;
		window.removeEventListener("keydown", Game.onKeyDown);
		window.removeEventListener("keyup", Game.onKeyUp);
		Game.screen.removeEventListener("touchstart", Game.onTouchStart);
		Game.screen.removeEventListener("touchend", Game.onTouchEnd);
		Game.screen = null;
		Game._gameObjects = [];
	}
	
	
	static _addGameObjects(...gameObjects: GameObject[]): void {
		gameObjects.forEach(gameObject => Game._gameObjects.push(gameObject));
	}
	
	static _removeGameObject(gameObject: GameObject): void {
		gameObject._object.remove();
		Game._gameObjects = Game._gameObjects.filter(element => element !== gameObject);
	}
	
	static removeAllGameObjects(): void {
		Game._gameObjects.forEach(gameObject => gameObject._object.remove());
		Game._gameObjects = [];
	}
	
	
	static start(): void {
		if(Game.isRunning) return;
		Game.isRunning = true;
		Game.doSteps();
	}
	
	static stop(): void {
		Game.isRunning = false;
	}
	
	
	static objectCollidedWithType(gameObject: GameObject, type: GameObjectConstructor): boolean {
		return Game._gameObjects.some(other =>
			other instanceof type
			&& gameObject !== other
			&& gameObject.collidedWith(other)
		);
	}
	
	
	static isKeyDown(key: Key): boolean {
		return key in Game.keysDown;
	}
	
	static isKeyPressed(key: Key) {
		const timePressed: number | undefined = Game.keysDown[key];
		if(timePressed === undefined)
			return false;
		return timePressed >= Game.lastFrameTimeStamp && timePressed <= Game.currentFrameTimeStamp;
	}
	
	
	static get deltaTime(): number {
		if(Game.lastFrameTimeStamp === 0)
			return 1000 / Game.maxFrameRate;
		return Game.currentFrameTimeStamp - Game.lastFrameTimeStamp;
	}
	
	private static updateDeltaTime(): void {
		Game.lastFrameTimeStamp = Game.currentFrameTimeStamp;
		Game.currentFrameTimeStamp = Date.now();
	}
	
	
	private static doSteps() {
		Game.globalStep();
		Game._gameObjects.forEach(gameObject => gameObject.step());
		Game._gameObjects.forEach(gameObject => gameObject.updatePosition());
		Game.updateDeltaTime();
		if(Game.isRunning)
			setTimeout(Game.doSteps, Math.max(0, 1000 / Game.maxFrameRate - Game.deltaTime));
	}
}