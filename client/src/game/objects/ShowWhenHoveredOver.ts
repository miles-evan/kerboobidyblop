import GameObject from "@engine/main/GameObject.ts";
import type SnapshotableClosure from "@engine/multiplayer/SnapshotableClosure.ts";


export default class ShowWhenHoveredOver extends GameObject {
	
	private mouseWasHovered: boolean = false;
	private readonly onHover: SnapshotableClosure | null;
	private readonly onStopHover: SnapshotableClosure | null;
	private readonly runContinuously: boolean;
	
	public constructor(
		x: Pixels, y: Pixels, width: Pixels, height: Pixels, sprite: string,
		onHover?: SnapshotableClosure, onStopHover?: SnapshotableClosure, runContinuously: boolean = false,
	) {
		super(x, y, width, height, sprite);
		this.onHover = onHover ?? null;
		this.onStopHover = onStopHover ?? null;
		this.runContinuously = runContinuously;
	}
	
	public step(): void {
		const mouseHovered: boolean = this.mouseHovered;
		this.opacity = mouseHovered? 1 : 0;
		if(this.runContinuously || mouseHovered !== this.mouseWasHovered)
			mouseHovered? this.onHover?.run() : this.onStopHover?.run();
		this.mouseWasHovered = mouseHovered;
	}
	
}