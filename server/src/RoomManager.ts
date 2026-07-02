import type { WebSocket } from "ws";
import GameRoom from "./GameRoom.ts";


// Room codes avoid ambiguous characters (0/O, 1/I)
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 4;


export default class RoomManager {

	private rooms: Map<string, GameRoom> = new Map();
	private roomsBySocket: Map<WebSocket, GameRoom> = new Map();


	private generateCode(): string {
		for(let attempt = 0; attempt < 100; attempt ++) {
			let code = "";
			for(let i = 0; i < CODE_LENGTH; i ++)
				code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
			if(!this.rooms.has(code))
				return code;
		}
		throw new Error("could not generate a unique room code");
	}


	createRoom(socket: WebSocket): GameRoom {
		const room = new GameRoom(this.generateCode(), emptyRoom => this.rooms.delete(emptyRoom.code));
		this.rooms.set(room.code, room);
		this.roomsBySocket.set(socket, room);
		room.addPlayer(socket);
		return room;
	}

	joinRoom(socket: WebSocket, code: string): GameRoom | string {
		const room: GameRoom | undefined = this.rooms.get(code.toUpperCase());
		if(!room)
			return "no room with that code";
		if(room.isFull)
			return "room is full";
		this.roomsBySocket.set(socket, room);
		room.addPlayer(socket);
		return room;
	}

	getRoom(socket: WebSocket): GameRoom | undefined {
		return this.roomsBySocket.get(socket);
	}

	handleDisconnect(socket: WebSocket): void {
		const room: GameRoom | undefined = this.roomsBySocket.get(socket);
		this.roomsBySocket.delete(socket);
		room?.handleDisconnect(socket);
	}

}
