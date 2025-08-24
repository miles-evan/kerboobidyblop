import GameObject from "../../engine/GameObject.ts";


export default class ShowWhenHoveredOver extends GameObject {
	
	constructor(x: Pixels, y: Pixels, width: Pixels, height: Pixels, sprite: string) {
		super(x, y, width, height, sprite);
	}
	
	step(): void {
		this.opacity = this.mouseHovered? 1 : 0;
	}
	
}