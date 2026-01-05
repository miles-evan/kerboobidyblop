
type Pair<T> = { timeStamp: Time, value: T };


// circular array of timestamp/value pairs. overwrites on push (like sliding window)
export default class TimeWindow<T> {
	
	private readonly data: Pair<T>[];
	private readonly windowSize: number;
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

	
	public push(timeStamp: number, value: T): void {
		this.data[this.nextTailIndex] = { timeStamp, value };
		this.incrementTail();
		if(this.headIndex === this.nextTailIndex) this.incrementHead();
	}
	
	
	public getAtTime(timeStamp: Time): T | null {
		if(!this.inTimeRange(timeStamp)) return null;
		
		const startTime: Time = this.data[this.headIndex]!.timeStamp;
		const guessIndex = (this.headIndex + Math.floor((timeStamp - startTime) / this.estimatedTimeGap)) % this.windowSize;
		const guessPair: Pair<T> = this.data[guessIndex]!;
		
		let index = guessIndex;
		let pair = guessPair;
		const dirToSearch = Math.sign(timeStamp - pair.timeStamp);
		
		while(Math.sign(timeStamp - pair.timeStamp) === dirToSearch) {
			if(index === this.lastIndex && dirToSearch === 1) break;
			if(index === this.headIndex && dirToSearch === -1) break;
			
			index = dirToSearch === 1? this.incrementedIndex(index) : this.decrementedIndex(index);
			pair = this.data[index]!;
		}
		
		return Math.abs(guessPair.timeStamp - timeStamp) < Math.abs(pair.timeStamp - timeStamp)?
			guessPair.value : pair.value; // return the closer one
	}
	
}