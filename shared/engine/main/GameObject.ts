import Game from "./Game.ts";
import SnapshotableClosure from "../multiplayer/SnapshotableClosure.ts";
import Snapshotable from "../multiplayer/Snapshotable.ts";
import View from "@engine/main/View.ts";


export default abstract class GameObject extends Snapshotable {
	
	private view: View;
	public left: Pixels = 0;
	public top: Pixels = 0;
	private _width: Pixels = 0;
	private _height: Pixels = 0;
	public rotation: Degrees = 0;
	private _xVelocity: PixelsPerSecond = 0;
	private _yVelocity: PixelsPerSecond = 0;
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
	public depth: number = 0 // higher depth = further into the screen (further behind)
	public onClick: AnyFunction | SnapshotableClosure | null = null;
	public onRightClick: AnyFunction | SnapshotableClosure | null = null;
	public onMiddleClick: AnyFunction | SnapshotableClosure | null = null;
	private _velocityAngle: Degrees = 0;
	
	protected constructor(
		x: Pixels = 0, y: Pixels = 0, width: Pixels = 0, height: Pixels = 0, sprite: string = "",
		{ hitboxWidth, hitboxHeight, originX=0, originY=0 }: ObjectOptions = {}
	) {
		super();
		
		this.view = View.new((button: number) => this.onMouseDown(button));
		
		this.originX = originX;
		this.originY = originY;
		
		this.x = x;
		this.y = y;
		this.update();
		
		this.width = width;
		this.height = height;
		
		this.sprite = sprite;
		
		this.setHitbox(hitboxWidth, hitboxHeight);
		
		Game.__appendGameObject(this);
	}
	
	
	// updates things like position and sprite
	public update(): void {
		this.x += (this.xVelocity / 1000) * Game.deltaTime;
		this.y += (this.yVelocity / 1000) * Game.deltaTime;
		
		const roundOrNot: (x: Pixels) => Pixels = Game.lockPositionsToVirtualPixels? Math.round : x => x;
		const ceilOrNot: (x: Pixels) => Pixels = Game.lockPositionsToVirtualPixels? Math.ceil : x => x;
		
		this.view.update(
			roundOrNot(this.left) * Game.virtualScreenSizeMultiplier,
			roundOrNot(this.top) * Game.virtualScreenSizeMultiplier,
			ceilOrNot(this._width) * Game.virtualScreenSizeMultiplier,
			ceilOrNot(this._height) * Game.virtualScreenSizeMultiplier,
			this.rotation,
			this.opacity,
			this.depth,
		);
		
		// update sprite
		if(this.spriteChanged && this.sprite)
			Game.preloadImage(this.sprite)
				.then(() => this.view.updateSprite(this.sprite!));
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
	
	
	public get xVelocity(): PixelsPerSecond {
		return this._xVelocity;
	}
	public set xVelocity(xVelocity: PixelsPerSecond) {
		this._xVelocity = xVelocity;
		this.updateVelocityAngle();
	}
	public get yVelocity(): PixelsPerSecond {
		return this._yVelocity;
	}
	public set yVelocity(yVelocity: PixelsPerSecond) {
		this._yVelocity = yVelocity;
		this.updateVelocityAngle();
	}
	
	
	public get speed(): PixelsPerSecond {
		return Math.sqrt(this.xVelocity ** 2 + this.yVelocity ** 2);
	}
	public set speed(speed: PixelsPerSecond) {
		if(speed === 0) {
			this._xVelocity = this._yVelocity = 0;
		} else {
			const radians: Radians = (Math.PI / 180) * this.velocityAngle;
			this.xVelocity = speed * Math.cos(radians);
			this.yVelocity = speed * Math.sin(radians);
		}
	}
	
	public get velocityAngle(): Degrees {
		return this._velocityAngle;
	}
	public set velocityAngle(angle: Degrees) {
		this._velocityAngle = angle;
		const radians: Radians = (Math.PI / 180) * angle;
		this._xVelocity = this.speed * Math.cos(radians);
		this._yVelocity = this.speed * Math.sin(radians);
	}
	private updateVelocityAngle(): void {
		if(this.xVelocity === 0 && this.yVelocity === 0) return;
		const radians: Radians = Math.atan2(this.yVelocity, this.xVelocity);
		this._velocityAngle = (180 / Math.PI) * radians;
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
		return Game.mouseY - this.y;
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
	
	
	private onMouseDown(button: number): void {
		if(button === 0) // left click
			this.onClick instanceof SnapshotableClosure? this.onClick.run() : this.onClick?.();
		else if(button === 1) // middle click
			this.onMiddleClick instanceof SnapshotableClosure? this.onMiddleClick.run() : this.onMiddleClick?.();
		else if(button === 2) // right click
			this.onRightClick instanceof SnapshotableClosure? this.onRightClick.run() : this.onRightClick?.();
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
		this.view.destroy();
		Game.__popGameObject(this);
		Game.removeRepeatable(this.animationRepeatableId);
	}
	
	
	public abstract step(): void;
	
	
	// -------------------------------- snapshot recovery
	// This section has been commented out since decoupling GameObject from the DOM
	// todo: re-implement this section to make GameObject once again state-safe
	
	// protected recoverReplace(objectSnapshot: Like<GameObject>): void {
	// 	if(!(this.__object instanceof Element)) throw new Error(`__object isn't an HTML element. it's: ${this.__object} and my id is ${this.id}`)
	// 	this.__object.remove(); // remove HTML element since we'll create a new one
	// 	super.recoverReplace(objectSnapshot);
	// 	this.__object.addEventListener("mousedown", e => this.onMouseDown(e)); // must be added back
	// }
	//
	// protected static recoverCreate(objectSnapshot: Like<GameObject>): GameObject {
	// 	const obj = super.recoverCreate(objectSnapshot) as GameObject;
	// 	if(!(obj.__object instanceof Element)) throw new Error(`__object isn't an HTML element. it's: ${obj.__object} and my id is ${obj.id}`)
	// 	obj.__object.addEventListener("mousedown", e => obj.onMouseDown(e)); // must be added back
	// 	return obj;
	// }
	
}
