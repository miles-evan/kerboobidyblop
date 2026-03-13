
type Pair<T> = { timeStamp: Time, value: T };


// circular array of timestamp/value pairs. overwrites on push (like sliding window)
export default class TimeWindow<T> {
	
	private readonly data: Pair<T>[];
	public readonly windowSize: number;
	private readonly estimatedTimeGap: Milliseconds;
	private headIndex: number = 0; // where start is
	private nextTailIndex: number = 0; // where next element will be pushed
	
	
	public constructor(windowSize: number, estimatedTimeGap: Milliseconds) {
		this.data = new Array(windowSize);
		this.windowSize = windowSize;
		this.estimatedTimeGap = estimatedTimeGap;
	}
	
	
	private get lastIndex(): number {
		return this.decrementedIndex(this.nextTailIndex);
	}
	
	private incrementHead(): void {
		this.headIndex = this.incrementedIndex(this.headIndex);
	}
	private incrementTail(): void {
		this.nextTailIndex = this.incrementedIndex(this.nextTailIndex);
	}
	private incrementedIndex(index: number): number {
		return (index + 1) % this.windowSize;
	}
	private decrementedIndex(index: number): number {
		return (index - 1 + this.windowSize) % this.windowSize;
	}
	
	private inTimeRange(timeStamp: Time): boolean {
		return timeStamp >= this.data[this.headIndex]!.timeStamp && timeStamp <= this.data[this.lastIndex]!.timeStamp;
	}

	
	public push(timeStamp: Time, value: T): void {
		this.data[this.nextTailIndex] = { timeStamp, value };
		this.incrementTail();
		if(this.headIndex === this.nextTailIndex) this.incrementHead();
	}
	
	
	public getAtIndex(index: number): { timeStamp: Time, value: T } {
		return this.data[(this.headIndex + index) % this.windowSize]!;
	}
	
	
	public getIndexAtTime(timeStamp: Time): number {
		if(!this.inTimeRange(timeStamp)) return -1;
		
		const startTime: Time = this.data[this.headIndex]!.timeStamp;
		const guessIndex =
			(this.headIndex + Math.floor((timeStamp - startTime) / this.estimatedTimeGap)) % this.windowSize;
		
		let index = guessIndex;
		let pair = this.data[index]!;
		const dirToSearch = Math.sign(timeStamp - pair.timeStamp);
		
		while(Math.sign(timeStamp - pair.timeStamp) === dirToSearch) {
			if(index === this.lastIndex && dirToSearch === 1) break;
			if(index === this.headIndex && dirToSearch === -1) break;
			
			index = dirToSearch === 1 ? this.incrementedIndex(index) : this.decrementedIndex(index);
			pair = this.data[index]!;
		}
		
		// todo: fix logic to compare to previous, not first index
		const closerIndex =
			Math.abs(this.data[guessIndex]!.timeStamp - timeStamp) <
			Math.abs(pair.timeStamp - timeStamp)
				? guessIndex
				: index;
		
		return (closerIndex - this.headIndex + this.windowSize) % this.windowSize;
	}
	
	public getAtTime(timeStamp: Time): { timeStamp: Time, value: T } | null {
		const index = this.getIndexAtTime(timeStamp);
		if(index === -1) return null;
		return this.getAtIndex(index);
	}
	
}