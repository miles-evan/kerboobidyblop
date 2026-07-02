import type {
	ClientMessage, ServerMessage, Snapshot, StartMessage, CastResultMessage, GameOverMessage,
	Tier, Power, Lane,
} from "./protocol.ts";


export default class NetworkClient {

	private ws: WebSocket | null = null;
	private nextSeq: number = 1;

	onCreated: ((code: string) => void) | null = null;
	onStart: ((message: StartMessage) => void) | null = null;
	onSnapshot: ((snapshot: Snapshot) => void) | null = null;
	onCastResult: ((message: CastResultMessage) => void) | null = null;
	onGameOver: ((message: GameOverMessage) => void) | null = null;
	onOpponentLeft: (() => void) | null = null;
	onError: ((message: string) => void) | null = null;
	onClose: (() => void) | null = null;


	connect(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const ws = new WebSocket(url);
			this.ws = ws;
			ws.onopen = () => resolve();
			ws.onerror = () => reject(new Error("could not connect to server"));
			ws.onclose = () => {
				if(this.ws === ws)
					this.onClose?.();
			};
			ws.onmessage = event => {
				let message: ServerMessage;
				try {
					message = JSON.parse(String(event.data));
				} catch {
					return;
				}
				this.handleMessage(message);
			};
		});
	}


	private handleMessage(message: ServerMessage): void {
		switch(message.type) {
			case "created": this.onCreated?.(message.code); return;
			case "start": this.onStart?.(message); return;
			case "snapshot": this.onSnapshot?.(message); return;
			case "castResult": this.onCastResult?.(message); return;
			case "gameOver": this.onGameOver?.(message); return;
			case "opponentLeft": this.onOpponentLeft?.(); return;
			case "error": this.onError?.(message.message); return;
		}
	}


	private send(message: ClientMessage): void {
		if(this.ws && this.ws.readyState === WebSocket.OPEN)
			this.ws.send(JSON.stringify(message));
	}

	createRoom(): void {
		this.send({ type: "create" });
	}

	joinRoom(code: string): void {
		this.send({ type: "join", code });
	}

	sendCast(tier: Tier, power: Power, lane: Lane): void {
		this.send({ type: "cast", seq: this.nextSeq ++, tier, power, lane });
	}


	disconnect(): void {
		const ws = this.ws;
		this.ws = null; // suppress onClose callback for intentional disconnects
		ws?.close();
	}

}
