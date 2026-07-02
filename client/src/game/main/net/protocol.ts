// Wire protocol shared between server and client.
// This is a copy of server/src/protocol.ts — keep them in sync.

export type Lane = 0 | 1 | 2;
export type Tier = 1 | 2 | 3 | 4;
export type PlayerNum = 1 | 2;
export type Power = "none" | "retreater" | "dodger" | "hopper";

export type SpellState = {
	id: number,
	lane: Lane,
	tier: Tier,
	power: Power,
	playerNum: PlayerNum,
	x: number,
	y: number,
	xVelocity: number,
	yVelocity: number,
};

export type PlayerState = {
	flux: number,
	health: number,
};

export type Snapshot = {
	type: "snapshot",
	tick: number,
	time: number, // simulation time in ms since game start
	spells: SpellState[],
	players: { 1: PlayerState, 2: PlayerState },
};

// client -> server
export type CreateMessage = { type: "create" };
export type JoinMessage = { type: "join", code: string };
export type CastMessage = { type: "cast", seq: number, tier: Tier, power: Power, lane: Lane };
export type ClientMessage = CreateMessage | JoinMessage | CastMessage;

// server -> client
export type CreatedMessage = { type: "created", code: string };
export type StartMessage = {
	type: "start",
	code: string,
	playerNum: PlayerNum,
	tickRate: number,
	snapshotRate: number,
};
export type CastResultMessage = { type: "castResult", seq: number, accepted: boolean, reason?: string };
export type GameOverMessage = { type: "gameOver", winner: PlayerNum | 0 }; // 0 = draw
export type OpponentLeftMessage = { type: "opponentLeft" };
export type ErrorMessage = { type: "error", message: string };
export type ServerMessage =
	CreatedMessage | StartMessage | Snapshot | CastResultMessage | GameOverMessage
	| OpponentLeftMessage | ErrorMessage;
