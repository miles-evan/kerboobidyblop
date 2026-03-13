import HtmlView from "@engine/main/HtmlView.ts";


// outlines the interface with a type of view, such as an HTML view
// it is the View implementation's responsibility to call the game object's onClick etc.
export default abstract class View {
	
	protected onMouseDown: (buttonNumber: number) => void;
	public static currentViewType: ConcreteConstructor<View> = HtmlView;
	
	
	protected constructor(onMouseDown: (buttonNumber: number) => void) {
		this.onMouseDown = onMouseDown;
	}
	
	
	public static new(...args: any[]): View {
		return new View.currentViewType(...args);
	}
	
	
	// updates things like position and sprite image
	// give sprite as null if sprite shouldn't be updated this frame
	abstract update(
		left: Pixels,
		top: Pixels,
		width: Pixels,
		height: Pixels,
		rotation: Degrees,
		opacity: number,
		sprite: string | null,
	): void;
}