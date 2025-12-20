

export default abstract class Shareable {
	public readonly id: number;
	private static nextId: number = 0;
	
	protected constructor() {
		this.id = Shareable.nextId ++;
	}
}