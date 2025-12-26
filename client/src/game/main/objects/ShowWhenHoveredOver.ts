import GameObject from "../../engine/GameObject.ts";
import type SnapshotableClosure from "../../engine/SnapshotableClosure.ts";


export default class ShowWhenHoveredOver extends GameObject {
	
	private mouseWasHovered: boolean = false;
	private readonly onHover: SnapshotableClosure | null;
	private readonly onHoverArgs: any[]; // args to call onHover with. assumes contents won't change, so it copies
	private readonly onStopHover: SnapshotableClosure | null;
	private readonly onStopHoverArgs: any[];
	
	public constructor(
		x: Pixels, y: Pixels, width: Pixels, height: Pixels, sprite: string,
		onHover?: SnapshotableClosure, onHoverArgs: any[] = [],
		onStopHover?: SnapshotableClosure, onStopHoverArgs: any[] = []
	) {
		super(x, y, width, height, sprite);
		this.onHover = onHover ?? null;
		this.onStopHover = onStopHover ?? null;
		this.onHoverArgs = [...onHoverArgs];
		this.onStopHoverArgs = [...onStopHoverArgs];
	}
	
	public step(): void {
		const mouseHovered: boolean = this.mouseHovered;
		this.opacity = mouseHovered? 1 : 0;
		if(mouseHovered !== this.mouseWasHovered)
			mouseHovered? this.onHover?.run(...this.onHoverArgs) : this.onStopHover?.run(...this.onStopHoverArgs);
	}
	
}