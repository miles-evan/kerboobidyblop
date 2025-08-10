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
	private static timeoutId: number | null = null;
	private static onKeyDown: (e: KeyboardEvent) => void;
	private static onKeyUp: (e: KeyboardEvent) => void;
	private static onTouchStart: (e: TouchEvent) => void;
	private static onTouchEnd: (e: TouchEvent) => void;
	static #frameCount: number = 0;
	static globalStep = () => {};
	
	
	static init(screen: HTMLElement): boolean {
		if(Game.screen) return false;
		
		Game.screen = screen;
		Game.screenWidth = screen.clientWidth;
		Game.screenHeight = screen.clientHeight;
		screen.style.position = "relative";
		screen.style.overflow = "hidden";
		screen.style.position = "relative";
		
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
		
		return true;
	}
	
	static destroy(): boolean {
		Game.stop();
		if(!Game.screen) return false;
		window.removeEventListener("keydown", Game.onKeyDown);
		window.removeEventListener("keyup", Game.onKeyUp);
		Game.screen.removeEventListener("touchstart", Game.onTouchStart);
		Game.screen.removeEventListener("touchend", Game.onTouchEnd);
		Game.screen = null;
		Game._gameObjects.forEach(gameObject => gameObject.destroy());
		Game._gameObjects = [];
		return true;
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
	
	
	static start(): boolean {
		if(Game.isRunning) return false;
		Game.isRunning = true;
		Game.doSteps();
		return true;
	}
	
	static stop(): void {
		Game.isRunning = false;
		if(Game.timeoutId) {
			clearTimeout(Game.timeoutId);
			Game.timeoutId = null;
		}
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
		return Game.lastFrameTimeStamp?
			Game.currentFrameTimeStamp - Game.lastFrameTimeStamp
			: 1000 / Game.maxFrameRate;
	}
	
	private static updateDeltaTime(): void {
		Game.lastFrameTimeStamp = Game.currentFrameTimeStamp;
		Game.currentFrameTimeStamp = Date.now();
	}
	
	
	static get frameCount() {
		return Game.#frameCount;
	}
	
	
	private static doSteps() {
		Game.updateDeltaTime();
		Game.globalStep();
		Game._gameObjects.forEach(gameObject => gameObject.step());
		Game._gameObjects.forEach(gameObject => gameObject.updatePosition());
		if(Game.isRunning) {
			const timeSinceFrameStart = Date.now() - Game.currentFrameTimeStamp;
			Game.timeoutId = setTimeout(Game.doSteps, Math.max(0, 1000 / Game.maxFrameRate - timeSinceFrameStart));
		}
		Game.#frameCount ++;
	}
}