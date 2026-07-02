import type { Snapshot, SpellState } from "./protocol.ts";


// render this far in the past so there's always a newer snapshot to interpolate toward;
// should comfortably exceed one snapshot interval (~67ms at 15/sec) plus jitter
const INTERPOLATION_DELAY_MS: Milliseconds = 100;
const MAX_BUFFERED_SNAPSHOTS: number = 30; // ~2 seconds at 15 snapshots/sec


export type InterpolatedState = {
	spells: SpellState[],
	players: Snapshot["players"],
};


// Buffers authoritative server snapshots and interpolates entity positions
// between them, so movement looks smooth despite the lower snapshot rate.
export default class SnapshotBuffer {

	private snapshots: Snapshot[] = [];
	private clockOffset: number | null = null; // smoothed estimate of (server sim time - local time)


	add(snapshot: Snapshot): void {
		const instantOffset: number = snapshot.time - Date.now();
		this.clockOffset = this.clockOffset === null?
			instantOffset
			: this.clockOffset * 0.9 + instantOffset * 0.1;

		this.snapshots.push(snapshot);
		if(this.snapshots.length > MAX_BUFFERED_SNAPSHOTS)
			this.snapshots.shift();
	}


	getInterpolatedState(): InterpolatedState | null {
		if(this.clockOffset === null || this.snapshots.length === 0)
			return null;

		const renderTime: number = Date.now() + this.clockOffset - INTERPOLATION_DELAY_MS;

		// find the snapshots bracketing the render time
		let older: Snapshot | null = null;
		let newer: Snapshot | null = null;
		for(const snapshot of this.snapshots) {
			if(snapshot.time <= renderTime) {
				older = snapshot;
			} else {
				newer = snapshot;
				break;
			}
		}

		// render time is past the newest snapshot (e.g. a network stall) — hold the latest state
		if(!newer) {
			const latest: Snapshot = this.snapshots[this.snapshots.length - 1]!;
			return { spells: latest.spells, players: latest.players };
		}
		if(!older)
			return { spells: newer.spells, players: newer.players };

		const t: number = (renderTime - older.time) / (newer.time - older.time);
		const olderById: Map<number, SpellState> = new Map(older.spells.map(spell => [spell.id, spell]));

		// spells are drawn from the newer snapshot: ones that died by then are gone,
		// ones that spawned by then appear (snapped to position if not in the older one)
		const spells: SpellState[] = newer.spells.map(spell => {
			const previous: SpellState | undefined = olderById.get(spell.id);
			if(!previous)
				return spell;
			return {
				...spell,
				x: previous.x + (spell.x - previous.x) * t,
				y: previous.y + (spell.y - previous.y) * t,
			};
		});

		return { spells, players: newer.players };
	}

}
