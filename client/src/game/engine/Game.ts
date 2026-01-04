import GameObject from "./GameObject.ts";
import SnapshotableClosure from "./SnapshotableClosure.ts";
import Repeatable from "./Repeatable.ts";
import GameState from "./GameState.ts";
import SnapshotableTime from "./SnapshotableTime.ts";
import Snapshotable from "./Snapshotable.ts";


export default class Game extends Snapshotable {
	// naming scheme: regularField, _backingField, __avoidUsingUnlessYouHaveToField, #excludedFromStateField
	public static __gameObjects: GameObject[] = [];
	public static instanceCount: number = 0;
	private static _instanceCounts: Record<string, number> = {}; // type -> count
	public static maxFrameRate: FramesPerSecond = 60;
	public static isRunning: boolean = false;
	static #screen: HTMLElement | null;
	public static screenWidth: Pixels;
	public static screenHeight: Pixels;
	public static mouseX: Pixels;
	public static mouseY: Pixels;
	public static lockPositionsToVirtualPixels: boolean = false;
	private static keysDown: Record<Key, SnapshotableTime> = {};
	private static lastFrameTimeStamp: SnapshotableTime = new SnapshotableTime(0);
	private static currentFrameTimeStamp: SnapshotableTime = new SnapshotableTime(0);
	private static timeoutId: number | null = null;
	static #onKeyDown: (e: KeyboardEvent) => void;
	static #onKeyUp: (e: KeyboardEvent) => void;
	static #onTouchStart: (e: TouchEvent) => void;
	static #onTouchEnd: (e: TouchEvent) => void;
	static #onMouseDown: (e: MouseEvent) => void;
	static #onMouseUp: (e: MouseEvent) => void;
	static #onMouseMove: (e: MouseEvent) => void;
	private static _frameCount: number = 0;
	public static snapshotableGlobalSteps: SnapshotableClosure[] = [];
	static #globalSteps: AnyFunction[] = [];
	private static timeStart: SnapshotableTime = new SnapshotableTime(0);
	static #preloadedImages: Record<string, HTMLImageElement> = {};
	public static _repeatables: Record<number, Repeatable> = {}; // id -> repeatable
	
	
	// register constructor
	static { GameState.registerConstructor(Game); }
	
	
	public static init(screen: HTMLElement): boolean {
		if(Game.#screen) return false;
		
		Game.#screen = screen;
		Game.screenWidth = screen.clientWidth;
		Game.screenHeight = screen.clientHeight;
		screen.style.position = "relative";
		screen.style.overflow = "hidden";
		screen.style.position = "relative";
		screen.addEventListener("contextmenu", e => e.preventDefault());
		
		Game.#onKeyDown = e => {
			if(!(e.key in Game.keysDown))
				Game.keysDown[e.key] = SnapshotableTime.now();
		};
		Game.#onKeyUp = e => {
			delete Game.keysDown[e.key];
		};
		Game.#onTouchStart = () => {
			if(!("touch" in Game.keysDown))
				Game.keysDown["touch"] = SnapshotableTime.now();
		};
		Game.#onTouchEnd = () => {
			delete Game.keysDown["touch"];
		};
		const clickMap: Record<number, string> = { 0: "left-click", 1: "middle-click", 2: "right-click" } // todo add more
		Game.#onMouseDown = e => {
			if(!(clickMap[e.button]! in Game.keysDown))
				Game.keysDown[clickMap[e.button]!] = SnapshotableTime.now();
		}
		Game.#onMouseUp = e => {
			delete Game.keysDown[clickMap[e.button]!];
		}
		Game.#onMouseMove = (e: MouseEvent): void => {
			const rect: DOMRect = screen.getBoundingClientRect();
			Game.mouseX = (e.clientX - rect.left) / Game.virtualScreenSizeMultiplier;
			Game.mouseY = (e.clientY - rect.top) / Game.virtualScreenSizeMultiplier;
		}
		window.addEventListener("keydown", Game.#onKeyDown);
		window.addEventListener("keyup", Game.#onKeyUp);
		screen.addEventListener("touchstart", Game.#onTouchStart);
		screen.addEventListener("touchend", Game.#onTouchEnd);
		screen.addEventListener("mousedown", Game.#onMouseDown);
		screen.addEventListener("mouseup", Game.#onMouseUp);
		screen.addEventListener('mousemove', Game.#onMouseMove);
		
		return true;
	}
	
	// destroys all objects and cleans things up
	public static destroy(): boolean {
		Game.stop();
		if(!Game.#screen) return false;
		window.removeEventListener("keydown", Game.#onKeyDown);
		window.removeEventListener("keyup", Game.#onKeyUp);
		Game.#screen.removeEventListener("touchstart", Game.#onTouchStart);
		Game.#screen.removeEventListener("touchend", Game.#onTouchEnd);
		Game.#screen.removeEventListener("mousedown", Game.#onMouseDown);
		Game.#screen.removeEventListener("mouseup", Game.#onMouseUp);
		Game.#screen.removeEventListener("mousemove", Game.#onMouseMove);
		Game.#screen = null;
		GameState.destroyAllObjects();
		Game.__gameObjects = [];
		Game._instanceCounts = {};
		Game.instanceCount = 0;
		Game.snapshotableGlobalSteps = [];
		Game._repeatables = {};
		return true;
	}
	
	
	public static __appendGameObject(gameObject: GameObject): void {
		Game.instanceCount ++;
		Game._instanceCounts[gameObject.constructor.name] =
			1 + (Game._instanceCounts[gameObject.constructor.name] ?? 0);
		Game.__gameObjects.push(gameObject);
		if(!Game.#screen) throw new Error("Must initialize screen");
		Game.#screen.append(gameObject.__object);
	}
	
	public static __popGameObject(gameObject: GameObject): void {
		Game.instanceCount --;
		Game._instanceCounts[gameObject.constructor.name] =
			-1 + (Game._instanceCounts[gameObject.constructor.name] ?? 0);
		Game.__gameObjects = Game.__gameObjects.filter(element => element !== gameObject);
	}
	
	
	public static __appendHTMLElementToScreen(el: Element) {
		if(!Game.#screen) throw new Error("Must initialize screen");
		Game.#screen.append(el);
	}
	
	
	public static start(): boolean {
		if(Game.isRunning) return false;
		Game.isRunning = true;
		Game.timeStart = SnapshotableTime.now();
		Game.step();
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
			return Game.__gameObjects.some(other =>
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
			Game.__gameObjects.forEach(other => {
				if(other instanceof type
					&& gameObject !== other
					&& gameObject.collidedWith(other))
					objectsCollidedWith.push(other);
			});
			return objectsCollidedWith;
		});
	}
	
	
	public static isKeyDown(key: Key): boolean {
		return Game.keysDown[key] !== undefined && Game.keysDown[key].value <= Game.currentFrameTimeStamp.value;
	}
	
	public static isKeyPressed(key: Key): boolean {
		const timePressed: SnapshotableTime | undefined = Game.keysDown[key];
		return timePressed !== undefined && Game.justHappened(timePressed.value);
	}
	
	
	public static get virtualScreenSizeMultiplier(): number {
		if(!Game.#screen)
			throw new Error("Must initialize screen");
		return Game.#screen.clientHeight / Game.screenHeight;
	}
	
	
	// milliseconds since last frame
	public static get deltaTime(): Milliseconds {
		return Game.lastFrameTimeStamp.value !== 0?
			Game.currentFrameTimeStamp.value - Game.lastFrameTimeStamp.value
			: 1000 / Game.maxFrameRate;
	}
	
	private static updateDeltaTime(): void {
		Game.lastFrameTimeStamp = Game.currentFrameTimeStamp;
		Game.currentFrameTimeStamp = SnapshotableTime.now();
	}
	
	
	public static get timeSinceStart(): Milliseconds {
		return Date.now() - Game.timeStart.value;
	}
	
	
	// returns whether a time occurred between the last frame and current frame
	public static justHappened(time: Time): boolean {
		return time >= Game.lastFrameTimeStamp.value && time <= Game.currentFrameTimeStamp.value;
	}
	
	
	public static get frameCount(): number {
		return Game._frameCount;
	}
	
	
	public static getInstanceCount<T extends GameObject>(type: Constructor<T>): number {
		return Game._instanceCounts[type.name] ?? 0;
	}
	
	
	public static async preloadImage(url: string) {
		return new Promise<void>(resolve => {
			if(url in Game.#preloadedImages) {
				resolve();
				return;
			}
			const img = new Image();
			img.onload = () => {
				Game.#preloadedImages[url] = img;
				resolve();
			};
			img.src = url;
		});
	}
	
	
	public static get globalSteps(): AnyFunction[] {
		return Game.#globalSteps;
	}
	
	
	public static addRepeatable(fn: AnyFunction | SnapshotableClosure, timesPerSecond: Hertz): RepeatableId {
		const repeatable = new Repeatable(fn, timesPerSecond);
		Game._repeatables[repeatable.id] = repeatable;
		return repeatable.id;
	}
	public static removeRepeatable(id: RepeatableId | null): void {
		if(id !== null) delete Game._repeatables[id];
	}
	private static runRepeatables(): void {
		for(const repeatable of Object.values(Game._repeatables)) {
			repeatable.tryRun();
		}
	}
	
	
	private static step(): void {
		Game.updateDeltaTime();
		
		Game.snapshotableGlobalSteps.forEach(step => step.run());
		Game.#globalSteps.forEach(step => step());
		
		Game.__gameObjects.forEach(gameObject => gameObject.step());
		Game.__gameObjects.forEach(gameObject => gameObject.update());
		
		Game.runRepeatables();
		
		if(Game.isRunning) {
			const timeSinceFrameStart: Milliseconds = Date.now() - Game.currentFrameTimeStamp.value;
			Game.timeoutId = setTimeout(Game.step, Math.max(0, 1000 / Game.maxFrameRate - timeSinceFrameStart));
		}
		
		Game._frameCount ++;
	}
	
	
	public static snapshotClassStatics(): ClassStatics {
		return { ...Snapshotable.snapshotClassStatics(Game), keysDown: {} };
	}
}