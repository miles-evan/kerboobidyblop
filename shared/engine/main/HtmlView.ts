import View from "@engine/main/View.ts";


export default class HtmlView extends View {
	
	public element: HTMLDivElement;
	
	
	public constructor(onMouseDown: (buttonNumber: number) => void) {
		super(onMouseDown);
		
		this.element = document.createElement("div");
		this.element.style.position = "absolute"
		this.element.style.backgroundRepeat = "no-repeat"
		this.element.style.backgroundSize = "100% 100%"
		this.element.style.imageRendering = "pixelated";
		
		this.element.addEventListener("mousedown", e => this.onMouseDown(e.button));
	}
	
	
	public update(
		left: Pixels,
		top: Pixels,
		width: Pixels,
		height: Pixels,
		rotation: Degrees,
		opacity: number,
		depth: number,
	): void {
		this.element.style.left = left + "px";
		this.element.style.top = top + "px";
		this.element.style.width = width + "px";
		this.element.style.height = height + "px";
		this.element.style.transform = "rotate(" + rotation + "deg)";
		this.element.style.opacity = String(opacity);
		this.element.style.zIndex = String(-depth);
	}
	
	
	public updateSprite(sprite: string) {
		this.element.style.backgroundImage = "url(" + sprite + ")";
	}
	
	
	public destroy(): void {
		this.element.remove();
	}
	
}