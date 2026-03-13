import HtmlView from "@engine/main/HtmlView.ts";


// outlines the interface with a type of view, such as an HTML view
// it is the View implementation's responsibility to call the game object's onClick etc.
// implementations' constructors must take onMouseDown as the first argument
export default abstract class View {
	
	protected onMouseDown: (button: number) => void;
	public static currentViewType: ConcreteConstructor<View> = HtmlView;
	
	
	protected constructor(onMouseDown: (button: number) => void) {
		this.onMouseDown = onMouseDown;
	}
	
	
	public static new(onMouseDown: (button: number) => void, ...args: any[]): View {
		return new View.currentViewType(onMouseDown, ...args);
	}
	
	
	abstract update(
		left: Pixels,
		top: Pixels,
		width: Pixels,
		height: Pixels,
		rotation: Degrees,
		opacity: number,
		depth: number,
	): void;
	
	abstract updateSprite(sprite: string): void;
	
	abstract destroy(): void;
	
}