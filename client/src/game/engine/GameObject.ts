import Game from "./Game.ts";


export default abstract class GameObject {
	
	_object: HTMLDivElement;
	left: number = 0;
	top: number = 0;
	#width: number = 0;
	#height: number = 0;
	rotation: number = 0;
	_hitboxLeft: number = 0;
	_hitboxTop: number = 0;
	_hitboxRight: number = 0;
	_hitboxBottom: number = 0;
	originX: number;
	originY: number;
	sprite: string | null = null;
	#spriteImages: string[] | null = null; // only use if doing animation
	#imageSpeed: Hertz = 1; // frames per second
	private animationRepeatableId: RepeatableId | null = null;
	imageIndex: number = 0;
	opacity: number = 1;
	
	
	protected constructor(
		x: number = 0, y: number = 0, width: number = 0, height: number = 0, sprite: string = "",
		{ hitboxWidth, hitboxHeight, originX=0, originY=0 }: ObjectOptions = {}
	) {
		this._object = document.createElement("div");
		this._object.style.position = "absolute"
		this._object.style.backgroundRepeat = "no-repeat"
		this._object.style.backgroundSize = "100% 100%"
		
		this.originX = originX;
		this.originY = originY;
		
		this.x = x;
		this.y = y;
		this.update();
		
		this.width = width;
		this.height = height;
		
		this.sprite = sprite;
		
		this.setHitbox(hitboxWidth, hitboxHeight);
		
		if(!Game._screen)
			throw new Error("Must initialize screen");
		Game._screen.append(this._object);
		
		Game._addGameObjects(this);
	}
	
	
	// updates things like position and sprite
	update(): void {
		const roundOrNot : (x: number) => number = Game.lockPositionsToVirtualPixels? Math.round : x => x;
		this._object.style.left = roundOrNot(this.left) * Game.virtualScreenSizeMultiplier + "px";
		this._object.style.top = roundOrNot(this.top) * Game.virtualScreenSizeMultiplier + "px";
		this._object.style.transform = "rotate(" + this.rotation + "deg)";
		this._object.style.width = roundOrNot(this.#width) * Game.virtualScreenSizeMultiplier + "px";
		this._object.style.height = roundOrNot(this.#height) * Game.virtualScreenSizeMultiplier + "px";
		this._object.style.backgroundImage = "url(" + this.sprite + ")";
		this._object.style.opacity = String(this.opacity);
	}
	
	
	get x(): number {
		return this.left + this.originX;
	}
	set x(x: number) {
		this.left = x - this.originX;
	}
	
	get y(): number {
		return this.top + this.originY;
	}
	set y(y: number) {
		this.top = y - this.originY;
	}
	
	get right(): number {
		return this.left + this.width;
	}
	set right(right: number) {
		this.left = right - this.width;
	}
	
	get bottom(): number {
		return this.top + this.height;
	}
	set bottom(bottom: number) {
		this.top = bottom - this.height;
	}
	
	get middleX(): number {
		return (this.left + this.right) / 2;
	}
	set middleX(middleX: number) {
		this.left = middleX - this.width / 2;
	}
	
	get middleY(): number {
		return (this.top + this.bottom) / 2;
	}
	set middleY(middleY: number) {
		this.top = middleY - this.height / 2;
	}
	
	get width(): number {
		return this.#width;
	}
	set width(width: number) {
		this._hitboxLeft = this._hitboxLeft * width / this.width;
		this._hitboxRight = this._hitboxRight * width / this.width;
		this.#width = width;
	}
	
	get height(): number {
		return this.#height;
	}
	set height(height: number) {
		this._hitboxTop = this._hitboxTop * height / this.height;
		this._hitboxBottom = this._hitboxBottom * height / this.height;
		this.#height = height;
	}
	
	
	setHitbox(hitboxWidth: number = this.width, hitboxHeight: number = this.height): void  {
		this._hitboxLeft = this.width/2 - hitboxWidth/2;
		this._hitboxTop = this.height/2 - hitboxHeight/2;
		this._hitboxRight = this._hitboxLeft + hitboxWidth;
		this._hitboxBottom = this._hitboxTop + hitboxHeight;
	}
	
	get hitboxLeft(): number {
		return this.left + this._hitboxLeft;
	}
	
	get hitboxTop(): number {
		return this.top + this._hitboxTop;
	}
	
	get hitboxRight(): number {
		return this.left + this._hitboxRight;
	}
	
	get hitboxBottom(): number {
		return this.top + this._hitboxBottom;
	}
	
	
	set animatedSprite(spriteImages: string[]) {
		this.#spriteImages = spriteImages;
		this.sprite = spriteImages[0];
		Game.removeRepeatable(this.animationRepeatableId);
		this.animationRepeatableId = null;
		this.animationRepeatableId = Game.addRepeatable(() => {
			if(!this.#spriteImages) throw new Error("sprite images for animation not set")
			this.imageIndex = (this.imageIndex + 1) % this.#spriteImages.length;
			this.sprite = this.#spriteImages[this.imageIndex];
		}, this.imageSpeed);
	}
	
	get imageSpeed() {
		return this.#imageSpeed;
	}
	set imageSpeed(imageSpeed: number) {
		this.#imageSpeed = imageSpeed;
		if(this.animationRepeatableId)
			Game._repeatables[this.animationRepeatableId].timesPerSecond = imageSpeed;
	}
	
	
	// higher depth = further into the screen (further behind)
	get depth(): number {
		return -Number(this._object.style.zIndex);
	}
	set depth(depth: number) {
		this._object.style.zIndex = String(-depth);
	}
	
	
	collidedWith(other: GameObject): boolean {
		return this.hitboxRight > other.hitboxLeft
			&& this.hitboxLeft < other.hitboxRight
			&& this.hitboxBottom > other.hitboxTop
			&& this.hitboxTop < other.hitboxBottom;
	}
	
	
	collidedWithType(type: Constructor<GameObject>, x?: number, y?: number): boolean {
		return Game.objectCollidedWithType(this, type, x, y);
	}
	getCollisionsWithType<T extends GameObject>(type: Constructor<T>, x?: number, y?: number): T[] {
		return Game.getObjectsCollisionsWithType(this, type, x, y);
	}
	
	
	withTempPosition<T>(x: number | undefined, y: number | undefined, fn: (...args: any[]) => T): T {
		const [originalX, originalY] = [this.x, this.y];
		if(x) this.x = x;
		if(y) this.y = y;
		
		const result: any = fn();
		
		[this.x, this.y] = [originalX, originalY];
		
		return result;
	}
	
	
	destroy(): void {
		this._object.remove();
		Game._removeGameObject(this);
		Game.removeRepeatable(this.animationRepeatableId);
	}
	
	
	abstract step(): void;
	
}
