import Game from "./Game.ts";
import SnapshotableClosure from "./SnapshotableClosure.ts";
import Snapshotable from "./Snapshotable.ts";


export default abstract class GameObject extends Snapshotable {
	
	public __object: HTMLDivElement;
	public left: Pixels = 0;
	public top: Pixels = 0;
	private _width: Pixels = 0;
	private _height: Pixels = 0;
	public rotation: Degrees = 0;
	public xVelocity: PixelsPerSecond = 0;
	public yVelocity: PixelsPerSecond = 0;
	public __hitboxLeft: Pixels = 0;
	public __hitboxTop: Pixels = 0;
	public __hitboxRight: Pixels = 0;
	public __hitboxBottom: Pixels = 0;
	public originX: Pixels;
	public originY: Pixels;
	private _sprite: string | null = null;
	private spriteChanged: boolean = false;
	private spriteImages: string[] | null = null;
	private _imageSpeed: Hertz = 1;
	private animationRepeatableId: RepeatableId | null = null;
	private _imageIndex: number = 0;
	public opacity: number = 1;
	public onClick: AnyFunction | null = null;
	public onRightClick: AnyFunction | null = null;
	public onMiddleClick: AnyFunction | null = null;
	
	protected constructor(
		x: Pixels = 0, y: Pixels = 0, width: Pixels = 0, height: Pixels = 0, sprite: string = "",
		{ hitboxWidth, hitboxHeight, originX=0, originY=0, snapshotMode }: ObjectOptions = {}
	) {
		super(snapshotMode);
		
		this.__object = document.createElement("div");
		this.__object.style.position = "absolute"
		this.__object.style.backgroundRepeat = "no-repeat"
		this.__object.style.backgroundSize = "100% 100%"
		this.__object.style.imageRendering = "pixelated";
		
		this.originX = originX;
		this.originY = originY;
		
		this.x = x;
		this.y = y;
		this.update();
		
		this.width = width;
		this.height = height;
		
		this.sprite = sprite;
		
		this.setHitbox(hitboxWidth, hitboxHeight);
		
		this.__object.addEventListener("mousedown", e => this.onMouseDown(e));
		
		Game.__appendGameObject(this);
	}
	
	
	// updates things like position and sprite
	public update(): void {
		this.x += (this.xVelocity / 1000) * Game.deltaTime;
		this.y += (this.yVelocity / 1000) * Game.deltaTime;
		
		const roundOrNot: (x: Pixels) => Pixels = Game.lockPositionsToVirtualPixels? Math.round : x => x;
		const ceilOrNot: (x: Pixels) => Pixels = Game.lockPositionsToVirtualPixels? Math.ceil : x => x;
		this.__object.style.left = roundOrNot(this.left) * Game.virtualScreenSizeMultiplier + "px";
		this.__object.style.top = roundOrNot(this.top) * Game.virtualScreenSizeMultiplier + "px";
		this.__object.style.width = ceilOrNot(this._width) * Game.virtualScreenSizeMultiplier + "px";
		this.__object.style.height = ceilOrNot(this._height) * Game.virtualScreenSizeMultiplier + "px";
		this.__object.style.transform = "rotate(" + this.rotation + "deg)";
		this.__object.style.opacity = String(this.opacity);
		if(this.spriteChanged && this.sprite)
			Game.preloadImage(this.sprite)
				.then(() => this.__object.style.backgroundImage = "url(" + this.sprite + ")");
	}
	
	
	public get x(): Pixels {
		return this.left + this.originX;
	}
	public set x(x: Pixels) {
		this.left = x - this.originX;
	}
	
	public get y(): Pixels {
		return this.top + this.originY;
	}
	public set y(y: Pixels) {
		this.top = y - this.originY;
	}
	
	public get right(): Pixels {
		return this.left + this.width;
	}
	public set right(right: Pixels) {
		this.left = right - this.width;
	}
	
	public get bottom(): Pixels {
		return this.top + this.height;
	}
	public set bottom(bottom: Pixels) {
		this.top = bottom - this.height;
	}
	
	public get middleX(): Pixels {
		return (this.left + this.right) / 2;
	}
	public set middleX(middleX: Pixels) {
		this.left = middleX - this.width / 2;
	}
	
	public get middleY(): Pixels {
		return (this.top + this.bottom) / 2;
	}
	public set middleY(middleY: Pixels) {
		this.top = middleY - this.height / 2;
	}
	
	public get width(): Pixels {
		return this._width;
	}
	public set width(width: Pixels) {
		this.__hitboxLeft = this.__hitboxLeft * width / this.width;
		this.__hitboxRight = this.__hitboxRight * width / this.width;
		this._width = width;
	}
	
	public get height(): Pixels {
		return this._height;
	}
	public set height(height: Pixels) {
		this.__hitboxTop = this.__hitboxTop * height / this.height;
		this.__hitboxBottom = this.__hitboxBottom * height / this.height;
		this._height = height;
	}
	
	
	public get speed(): PixelsPerSecond {
		return Math.sqrt(this.xVelocity ** 2 + this.yVelocity ** 2);
	}
	public set speed(speed: PixelsPerSecond) {
		const angle: Degrees = this.velocityAngle;
		this.xVelocity = speed * Math.cos(angle);
		this.yVelocity = speed * Math.sin(angle);
	}
	
	public get velocityAngle(): Degrees {
		if(this.xVelocity === 0 && this.yVelocity === 0)
			return 0; // TODO is this really how we want that to work?
		const radians: Radians = Math.atan2(this.yVelocity, this.xVelocity);
		return (180 / Math.PI) * radians;
	}
	public set velocityAngle(angle: Degrees) {
		const radians: Radians = (Math.PI / 180) * angle;
		const speed: PixelsPerSecond = this.speed;
		this.xVelocity = speed * Math.cos(radians);
		this.yVelocity = speed * Math.sin(radians);
	}
	
	
	public setHitbox(hitboxWidth: Pixels = this.width, hitboxHeight: Pixels = this.height): void  {
		this.__hitboxLeft = this.width/2 - hitboxWidth/2;
		this.__hitboxTop = this.height/2 - hitboxHeight/2;
		this.__hitboxRight = this.__hitboxLeft + hitboxWidth;
		this.__hitboxBottom = this.__hitboxTop + hitboxHeight;
	}
	
	public get hitboxLeft(): Pixels {
		return this.left + this.__hitboxLeft;
	}
	
	public get hitboxTop(): Pixels {
		return this.top + this.__hitboxTop;
	}
	
	public get hitboxRight(): Pixels {
		return this.left + this.__hitboxRight;
	}
	
	public get hitboxBottom(): Pixels {
		return this.top + this.__hitboxBottom;
	}
	
	
	public get relativeMouseX(): Pixels {
		return Game.mouseX - this.x;
	}
	
	public get relativeMouseY(): Pixels {
		return Game.mouseY - this.x;
	}
	
	
	public get mouseHovered(): boolean {
		return Game.mouseX > this.left && Game.mouseX < this.right
			&& Game.mouseY > this.top && Game.mouseY < this.bottom;
	}
	
	
	public get sprite(): string | null {
		return this._sprite;
	}
	public set sprite(sprite: string | null) {
		this._sprite = sprite;
		this.spriteChanged = true;
	}
	
	public set animatedSprite(spriteImages: string[]) {
		if(spriteImages.length === 0)
			throw new Error("can't set animation without sprites");
		
		this.spriteImages = spriteImages;
		this.sprite = spriteImages[0]!;
		
		Game.removeRepeatable(this.animationRepeatableId);
		this.animationRepeatableId = null;
		
		this.animationRepeatableId = Game.addRepeatable(
			new SnapshotableClosure(this, this.nextAnimationFrame),
			this.imageSpeed
		);
	}
	private nextAnimationFrame(): void {
		if(!this.spriteImages)
			throw new Error("sprite images for animation not set");
		this.imageIndex = (this.imageIndex + 1) % this.spriteImages.length;
	}
	
	public get imageIndex() {
		return this._imageIndex;
	}
	public set imageIndex(imageIndex: number) {
		this._imageIndex = imageIndex;
		this.sprite = this.spriteImages![imageIndex]!;
	}
	
	public get imageSpeed() {
		return this._imageSpeed;
	}
	public set imageSpeed(imageSpeed: Hertz) {
		this._imageSpeed = imageSpeed;
		if(!this.animationRepeatableId)
			return;
		if(imageSpeed === 0) {
			Game.removeRepeatable(this.animationRepeatableId);
			this.animationRepeatableId = null;
		} else {
			Game._repeatables[this.animationRepeatableId]!.timesPerSecond = imageSpeed;
		}
	}
	
	
	// higher depth = further into the screen (further behind)
	public get depth(): number {
		return -Number(this.__object.style.zIndex);
	}
	public set depth(depth: number) {
		this.__object.style.zIndex = String(-depth);
	}
	
	
	private onMouseDown(e: MouseEvent): void {
		if(e.button === 0) this.onClick?.();
		if(e.button === 1) this.onMiddleClick?.();
		if(e.button === 2) this.onRightClick?.();
	}
	
	
	public collidedWith(other: GameObject): boolean {
		return this.hitboxRight > other.hitboxLeft
			&& this.hitboxLeft < other.hitboxRight
			&& this.hitboxBottom > other.hitboxTop
			&& this.hitboxTop < other.hitboxBottom;
	}
	
	
	public collidedWithType(type: GameObjectClass, x?: Pixels, y?: Pixels): boolean {
		return Game.objectCollidedWithType(this, type, x, y);
	}
	public getCollisionsWithType<T extends GameObject>(type: Constructor<T>, x?: Pixels, y?: Pixels): T[] {
		return Game.getObjectsCollisionsWithType(this, type, x, y);
	}
	
	
	public withTempPosition<T>(x: Pixels | undefined, y: Pixels | undefined, fn: (...args: any[]) => T): T {
		const [originalX, originalY] = [this.x, this.y];
		if(x) this.x = x;
		if(y) this.y = y;
		
		const result: any = fn();
		
		[this.x, this.y] = [originalX, originalY];
		
		return result;
	}
	
	
	public destroy(): void {
		super.destroy();
		this.__object.remove();
		Game.__popGameObject(this);
		Game.removeRepeatable(this.animationRepeatableId);
	}
	
	
	public abstract step(): void;
	
	
	// -------------------------------- snapshot recovery
	
	
	protected recoverReplace(objectSnapshot: Like<GameObject>): void {
		if(!(this.__object instanceof Element)) throw new Error(`__object isn't an HTML element. it's: ${this.__object} and my id is ${this.id}`)
		this.__object.remove(); // remove HTML element since we'll create a new one
		super.recoverReplace(objectSnapshot);
		this.__object.addEventListener("mousedown", e => this.onMouseDown(e)); // must be added back
	}
	
	protected static recoverCreate(objectSnapshot: Like<GameObject>): GameObject {
		const obj = super.recoverCreate(objectSnapshot) as GameObject;
		if(!(obj.__object instanceof Element)) throw new Error(`__object isn't an HTML element. it's: ${obj.__object} and my id is ${obj.id}`)
		obj.__object.addEventListener("mousedown", e => obj.onMouseDown(e)); // must be added back
		return obj;
	}
	
}
