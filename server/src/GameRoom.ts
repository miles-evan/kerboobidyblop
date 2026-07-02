import type { WebSocket } from "ws";
import type { CastMessage, PlayerNum, ServerMessage } from "./protocol.ts";
import { TICK_MS, TICK_RATE, SNAPSHOT_EVERY_N_TICKS, MAX_CASTS_PER_SECOND } from "./constants.ts";
import Simulation from "./sim/Simulation.ts";


type PlayerConnection = {
	socket: WebSocket,
	playerNum: PlayerNum,
	castTimestamps: number[], // for rate limiting
};


export default class GameRoom {

	readonly code: string;
	private readonly onEmpty: (room: GameRoom) => void;
	private players: PlayerConnection[] = [];
	private sim: Simulation = new Simulation();
	private loopInterval: NodeJS.Timeout | null = null;
	private lastLoopTime: number = 0;
	private accumulator: number = 0;

	constructor(code: string, onEmpty: (room: GameRoom) => void) {
		this.code = code;
		this.onEmpty = onEmpty;
	}


	get isFull(): boolean {
		return this.players.length >= 2;
	}

	get isRunning(): boolean {
		return this.loopInterval !== null;
	}


	addPlayer(socket: WebSocket): PlayerNum {
		const playerNum: PlayerNum = this.players.length === 0? 1 : 2;
		this.players.push({ socket, playerNum, castTimestamps: [] });
		if(this.isFull)
			this.start();
		return playerNum;
	}


	private start(): void {
		this.players.forEach(player => this.send(player, {
			type: "start",
			code: this.code,
			playerNum: player.playerNum,
			tickRate: TICK_RATE,
			snapshotRate: TICK_RATE / SNAPSHOT_EVERY_N_TICKS,
		}));

		this.lastLoopTime = Date.now();
		this.loopInterval = setInterval(() => this.loop(), TICK_MS);
	}

	// fixed-timestep loop: real time drives how many fixed steps to run,
	// so the simulation stays aligned with wall clock even if setInterval drifts
	private loop(): void {
		const now: number = Date.now();
		this.accumulator += now - this.lastLoopTime;
		this.lastLoopTime = now;

		// don't spiral if the event loop stalled; drop the excess time instead
		this.accumulator = Math.min(this.accumulator, 1000);

		while(this.accumulator >= TICK_MS) {
			this.accumulator -= TICK_MS;

			const castResults = this.sim.step(TICK_MS);
			castResults.forEach(result => {
				const player = this.players.find(p => p.playerNum === result.playerNum);
				if(player)
					this.send(player, {
						type: "castResult",
						seq: result.seq,
						accepted: result.accepted,
						...(result.reason !== undefined? { reason: result.reason } : {}),
					});
			});

			if(this.sim.tick % SNAPSHOT_EVERY_N_TICKS === 0)
				this.broadcast(this.sim.takeSnapshot());
		}
	}


	handleCast(socket: WebSocket, message: CastMessage): void {
		if(!this.isRunning) return;
		const player = this.players.find(p => p.socket === socket);
		if(!player) return;

		// validate untrusted input
		if(![1, 2, 3, 4].includes(message.tier)
			|| ![0, 1, 2].includes(message.lane)
			|| !["none", "retreater", "dodger", "hopper"].includes(message.power)
			|| typeof message.seq !== "number") {
			this.send(player, { type: "castResult", seq: message.seq ?? -1, accepted: false, reason: "malformed cast" });
			return;
		}

		// rate limit
		const now: number = Date.now();
		player.castTimestamps = player.castTimestamps.filter(t => now - t < 1000);
		if(player.castTimestamps.length >= MAX_CASTS_PER_SECOND) {
			this.send(player, { type: "castResult", seq: message.seq, accepted: false, reason: "rate limited" });
			return;
		}
		player.castTimestamps.push(now);

		this.sim.queueCast(player.playerNum, message.seq, message.tier, message.power, message.lane);
	}


	handleDisconnect(socket: WebSocket): void {
		const player = this.players.find(p => p.socket === socket);
		if(!player) return;

		this.players = this.players.filter(p => p !== player);
		this.players.forEach(other => this.send(other, { type: "opponentLeft" }));
		this.close();
	}

	private close(): void {
		if(this.loopInterval) {
			clearInterval(this.loopInterval);
			this.loopInterval = null;
		}
		this.onEmpty(this);
	}


	private send(player: PlayerConnection, message: ServerMessage): void {
		if(player.socket.readyState === player.socket.OPEN)
			player.socket.send(JSON.stringify(message));
	}

	private broadcast(message: ServerMessage): void {
		this.players.forEach(player => this.send(player, message));
	}

}
