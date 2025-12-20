import GameObject from "./GameObject.ts";
import SafeClosure from "./SafeClosure.ts";


export default class Game {
	public static _gameObjects: GameObject[] = [];
	public static instanceCount: number = 0;
	public static _instanceCounts: Record<string, number> = {};
	public static maxFrameRate: FramesPerSecond = 60;
	public static isRunning: boolean = false;
	public static _screen: HTMLElement | null;
	public static screenWidth: Pixels;
	public static screenHeight: Pixels;
	public static mouseX: Pixels;
	public static mouseY: Pixels;
	public static lockPositionsToVirtualPixels: boolean = false;
	private static keysDown: Record<Key, Time> = {};
	private static lastFrameTimeStamp: Time = 0;
	private static currentFrameTimeStamp: Time = 0;
	private static timeoutId: number | null = null;
	private static onKeyDown: (e: KeyboardEvent) => void;
	private static onKeyUp: (e: KeyboardEvent) => void;
	private static onTouchStart: (e: TouchEvent) => void;
	private static onTouchEnd: (e: TouchEvent) => void;
	private static onMouseMove: (e: MouseEvent) => void;
	static #frameCount: number = 0;
	public static globalSteps: AnyFunction[] = [];
	private static timeStart: Time = 0;
	private static preloadedImages: Record<string, HTMLImageElement> = {};
	public static _repeatables: Record<RepeatableId, Repeatable> = {}
	private static nextRepeatableId: RepeatableId = 0;
	
	
	public static init(screen: HTMLElement): boolean {
		if(Game._screen) return false;
		
		Game._screen = screen;
		Game.screenWidth = screen.clientWidth;
		Game.screenHeight = screen.clientHeight;
		screen.style.position = "relative";
		screen.style.overflow = "hidden";
		screen.style.position = "relative";
		screen.addEventListener("contextmenu", e => e.preventDefault());
		
		Game.onKeyDown = (e: KeyboardEvent): void => {
			if(!(e.key in Game.keysDown))
				Game.keysDown[e.key as Key] = Date.now();
		};
		Game.onKeyUp = (e: KeyboardEvent): void => {
			delete Game.keysDown[e.key as Key];
		};
		Game.onTouchStart = (): void => {
			if(!("touch" in Game.keysDown))
				Game.keysDown["touch"] = Date.now();
		};
		Game.onTouchEnd = (): void => {
			delete Game.keysDown["touch"];
		};
		Game.onMouseMove = (e: MouseEvent): void => {
			const rect: DOMRect = screen.getBoundingClientRect();
			Game.mouseX = (e.clientX - rect.left) / Game.virtualScreenSizeMultiplier;
			Game.mouseY = (e.clientY - rect.top) / Game.virtualScreenSizeMultiplier;
		}
		window.addEventListener("keydown", Game.onKeyDown);
		window.addEventListener("keyup", Game.onKeyUp);
		screen.addEventListener("touchstart", Game.onTouchStart);
		screen.addEventListener("touchend", Game.onTouchEnd);
		screen.addEventListener('mousemove', Game.onMouseMove);
		
		return true;
	}
	
	// destroys all objects and cleans things up
	public static destroy(): boolean {
		Game.stop();
		if(!Game._screen) return false;
		window.removeEventListener("keydown", Game.onKeyDown);
		window.removeEventListener("keyup", Game.onKeyUp);
		Game._screen.removeEventListener("touchstart", Game.onTouchStart);
		Game._screen.removeEventListener("touchend", Game.onTouchEnd);
		Game._screen.removeEventListener("mousemove", Game.onMouseMove);
		Game._screen = null;
		Game._gameObjects.forEach(gameObject => gameObject.destroy());
		Game._gameObjects = [];
		Game._instanceCounts = {};
		Game.instanceCount = 0;
		return true;
	}
	
	
	public static _appendGameObject(gameObject: GameObject): void {
		Game.instanceCount ++;
		Game._instanceCounts[gameObject.constructor.name] =
			1 + (Game._instanceCounts[gameObject.constructor.name] ?? 0);
		Game._gameObjects.push(gameObject);
	}
	
	public static _popGameObject(gameObject: GameObject): void {
		Game.instanceCount --;
		Game._instanceCounts[gameObject.constructor.name] =
			-1 + (Game._instanceCounts[gameObject.constructor.name] ?? 0);
		Game._gameObjects = Game._gameObjects.filter(element => element !== gameObject);
	}
	
	
	public static start(): boolean {
		if(Game.isRunning) return false;
		Game.isRunning = true;
		Game.timeStart = Date.now();
		Game.doSteps();
		return true;
	}
	
	public static stop(): void {
		Game.isRunning = false;
		if(Game.timeoutId) {
			clearTimeout(Game.timeoutId);
			Game.timeoutId = null;
		}
	}
	
	
	public static objectCollidedWithType(
		gameObject: GameObject, type: GameObjectClass, x?: Pixels, y?: Pixels
	): boolean {
		return gameObject.withTempPosition(x, y, () => {
			return Game._gameObjects.some(other =>
				other instanceof type
				&& gameObject !== other
				&& gameObject.collidedWith(other));
		})
	}
	
	public static getObjectsCollisionsWithType<T extends GameObject>(
		gameObject: GameObject, type: Constructor<T>, x?: Pixels, y?: Pixels
	): T[] {
		
		return gameObject.withTempPosition(x, y, () => {
			const objectsCollidedWith: T[] = [];
			Game._gameObjects.forEach(other => {
				if(other instanceof type
					&& gameObject !== other
					&& gameObject.collidedWith(other))
					objectsCollidedWith.push(other);
			});
			return objectsCollidedWith;
		});
	}
	
	
	public static isKeyDown(key: Key): boolean {
		return key in Game.keysDown;
	}
	
	public static isKeyPressed(key: Key): boolean {
		const timePressed: Time | undefined = Game.keysDown[key];
		if(timePressed === undefined)
			return false;
		return Game.justHappened(timePressed);
	}
	
	
	public static get virtualScreenSizeMultiplier(): number {
		if(!Game._screen)
			throw new Error("Must initialize screen");
		return Game._screen.clientHeight / Game.screenHeight;
	}
	
	
	// milliseconds since last frame
	public static get deltaTime(): Milliseconds {
		return Game.lastFrameTimeStamp?
			Game.currentFrameTimeStamp - Game.lastFrameTimeStamp
			: 1000 / Game.maxFrameRate;
	}
	
	private static updateDeltaTime(): void {
		Game.lastFrameTimeStamp = Game.currentFrameTimeStamp;
		Game.currentFrameTimeStamp = Date.now();
	}
	
	
	public static get timeSinceStart(): Milliseconds {
		return Date.now() - Game.timeStart;
	}
	
	
	// returns whether a time occurred between the last frame and current frame
	public static justHappened(time: Time): boolean {
		return time >= Game.lastFrameTimeStamp && time <= Game.currentFrameTimeStamp;
	}
	
	
	public static get frameCount(): number {
		return Game.#frameCount;
	}
	
	
	public static getInstanceCount<T extends GameObject>(type: Constructor<T>): number {
		return Game._instanceCounts[type.name] ?? 0;
	}
	
	
	public static async preloadImage(url: string) {
		return new Promise<void>(resolve => {
			if(url in Game.preloadedImages) {
				resolve();
				return;
			}
			const img = new Image();
			img.onload = () => {
				Game.preloadedImages[url] = img;
				resolve();
			};
			img.src = url;
		});
	}
	
	
	// repeatables are functions that get called at a set rate like 5 times per second
	// use this instead of setInterval because this will time more accurately alongside the game's framerate
	// this is also serializable and re-linkable (important for multiplayer games)
	public static addRepeatable(fn: AnyFunction | SafeClosure, timesPerSecond: Hertz): RepeatableId {
		Game. _repeatables[Game.nextRepeatableId] = {
			fn, timesPerSecond, timeOfLastFrameIdeally: Date.now(),
		};
		return Game.nextRepeatableId ++;
	}
	public static removeRepeatable(id: RepeatableId | null): void {
		if(id !== null) delete Game._repeatables[id];
	}
	private static runRepeatables(): void {
		for(const repeatable of Object.values(Game._repeatables)) {
			const now: Time = Date.now();
			const period: Milliseconds = 1000 / repeatable.timesPerSecond;
			if(now - repeatable.timeOfLastFrameIdeally >= period) {
				if(repeatable.fn instanceof SafeClosure) repeatable.fn.run(); else repeatable.fn();
				repeatable.timeOfLastFrameIdeally += period;
				// so you don't get too behind if low framerate:
				if(now - repeatable.timeOfLastFrameIdeally > period)
					repeatable.timeOfLastFrameIdeally = now;
			}
		}
	}
	
	
	public static getSnapshot(): object {
		let snapShot: AppendableObject = {
			timeOfSnapShot: Date.now(),
			_gameObjects: Game._gameObjects,
			instanceCount: Game.instanceCount,
			_instanceCounts: Game._instanceCounts,
			frameCount: Game.frameCount,
			lastFrameTimeStamp: Game.lastFrameTimeStamp,
			currentFrameTimeStamp: Game.currentFrameTimeStamp,
			timeStart: Game.timeStart,
			nextRepeatableId: Game.nextRepeatableId,
		};
		
		// copy
		snapShot = JSON.parse(JSON.stringify(snapShot));
		
		// attach functions because they can't be serialized
		snapShot.repeatables = { ...Game._repeatables };
		
		return snapShot;
	}
	
	
	// public static loadGameState(gameState: object): void {
	// 	// TODO
	// }
	
	
	private static doSteps(): void {
		Game.updateDeltaTime();
		Game.globalSteps.forEach(step => step());
		Game._gameObjects.forEach(gameObject => gameObject.step());
		Game._gameObjects.forEach(gameObject => gameObject.update());
		Game.runRepeatables();
		if(Game.isRunning) {
			const timeSinceFrameStart: Milliseconds = Date.now() - Game.currentFrameTimeStamp;
			Game.timeoutId = setTimeout(Game.doSteps, Math.max(0, 1000 / Game.maxFrameRate - timeSinceFrameStart));
		}
		Game.#frameCount ++;
	}
}