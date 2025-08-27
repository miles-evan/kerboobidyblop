import GameObject from "../../engine/GameObject.ts";


export default class ShowWhenHoveredOver extends GameObject {
	
	mouseWasHovered: boolean = false;
	onHover: AnyFunction | undefined;
	onStopHover: AnyFunction | undefined;
	
	constructor(
		x: Pixels, y: Pixels, width: Pixels, height: Pixels, sprite: string,
		onHover?: AnyFunction, onStopHover?: AnyFunction
	) {
		super(x, y, width, height, sprite);
		this.onHover = onHover;
		this.onStopHover = onStopHover;
	}
	
	step(): void {
		const mouseHovered: boolean = this.mouseHovered;
		this.opacity = mouseHovered? 1 : 0;
		if(mouseHovered !== this.mouseWasHovered)
			(mouseHovered? this.onHover : this.onStopHover)?.();
	}
	
}