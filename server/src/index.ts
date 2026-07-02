import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage, ServerMessage } from "./protocol.ts";
import { HEARTBEAT_INTERVAL_MS } from "./constants.ts";
import RoomManager from "./RoomManager.ts";
import GameRoom from "./GameRoom.ts";


const PORT: number = Number(process.env["PORT"] ?? 8787);

const wss = new WebSocketServer({ port: PORT });
const roomManager = new RoomManager();

const aliveSockets: WeakSet<WebSocket> = new WeakSet();


function send(socket: WebSocket, message: ServerMessage): void {
	if(socket.readyState === socket.OPEN)
		socket.send(JSON.stringify(message));
}


function handleMessage(socket: WebSocket, message: ClientMessage): void {
	switch(message.type) {
		case "create": {
			if(roomManager.getRoom(socket)) {
				send(socket, { type: "error", message: "already in a room" });
				return;
			}
			const room: GameRoom = roomManager.createRoom(socket);
			send(socket, { type: "created", code: room.code });
			console.log(`room ${room.code} created`);
			return;
		}
		case "join": {
			if(roomManager.getRoom(socket)) {
				send(socket, { type: "error", message: "already in a room" });
				return;
			}
			if(typeof message.code !== "string") {
				send(socket, { type: "error", message: "malformed join" });
				return;
			}
			const result: GameRoom | string = roomManager.joinRoom(socket, message.code);
			if(typeof result === "string") {
				send(socket, { type: "error", message: result });
				return;
			}
			console.log(`room ${result.code} started`);
			return;
		}
		case "cast": {
			roomManager.getRoom(socket)?.handleCast(socket, message);
			return;
		}
		default:
			send(socket, { type: "error", message: "unknown message type" });
	}
}


wss.on("connection", (socket: WebSocket) => {
	aliveSockets.add(socket);
	socket.on("pong", () => aliveSockets.add(socket));

	socket.on("message", data => {
		let message: ClientMessage;
		try {
			message = JSON.parse(String(data));
		} catch {
			send(socket, { type: "error", message: "invalid JSON" });
			return;
		}
		try {
			handleMessage(socket, message);
		} catch(error) {
			console.error("error handling message:", error);
			send(socket, { type: "error", message: "internal server error" });
		}
	});

	socket.on("close", () => roomManager.handleDisconnect(socket));
	socket.on("error", () => socket.close());
});


// heartbeat: terminate connections that stop responding to pings
setInterval(() => {
	wss.clients.forEach(socket => {
		if(!aliveSockets.has(socket)) {
			socket.terminate();
			return;
		}
		aliveSockets.delete(socket);
		socket.ping();
	});
}, HEARTBEAT_INTERVAL_MS);


console.log(`kerboobidyblop server listening on ws://localhost:${PORT}`);
