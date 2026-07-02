// Game constants mirrored from the client (client/src/game/main).
// If you change game rules on the client, keep these in sync.

export const SCREEN_WIDTH = 96;
export const SCREEN_HEIGHT = 180;

// Board is 64x180, centered on the screen (see Board.ts)
export const BOARD_LEFT = (SCREEN_WIDTH - 64) / 2;
export const BOARD_TOP = 0;
export const TOP_LEFT_TILE_X = BOARD_LEFT + 8;
export const TOP_LEFT_TILE_Y = BOARD_TOP + 10;
export const TILE_SIZE = 16;

export const SPELL_SIZE = 16;
export const SECONDS_PER_TILE = 1.5;
export const SPELL_VELOCITY = TILE_SIZE / SECONDS_PER_TILE; // pixels per second
export const TILE_TICK_PERIOD_MS = SECONDS_PER_TILE * 1000;

export const FLUX_PER_SECOND = 1;
export const MAX_FLUX = 10;
export const STARTING_HEALTH = 100;

// map of which spells beat who (Spell.tierEliminationMap)
export const TIER_ELIMINATION_MAP: Record<number, number[]> = {
	1: [4],
	2: [1],
	3: [2, 1],
	4: [3, 2],
};

const TIER_COST: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4 };
const POWER_COST: Record<string, number> = {
	"none": 1,
	"retreater": 2,
	"dodger": 2,
	"hopper": 2,
};

export function fluxCost(tier: number, power: string): number {
	return (TIER_COST[tier] ?? Infinity) * (POWER_COST[power] ?? Infinity);
}

// Netcode tuning
export const TICK_RATE = 30; // simulation steps per second (1500ms tile period divides evenly)
export const TICK_MS = 1000 / TICK_RATE;
export const SNAPSHOT_EVERY_N_TICKS = 2; // 15 snapshots per second
export const MAX_CASTS_PER_SECOND = 10; // per-connection rate limit
export const HEARTBEAT_INTERVAL_MS = 15000;
