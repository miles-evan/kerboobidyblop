import { io, Socket } from "socket.io-client";


export default class Client {
	
	private socket: Socket;
	private onReceiveSnapshot: (() => void) | null = null;
	
	public constructor(uri: string) {
		this.socket = io(uri, { secure: true });
		this.onConnect();
	}
	
	private onConnect(): void {
		this.socket.on("snapshot", () => this.onReceiveSnapshot?.());
	}
	
	public setOnReceiveSnapshot(onReceiveSnapshot : (() => void) | null): void {
		this.onReceiveSnapshot = onReceiveSnapshot;
	}
	
	public sendCast(cast: [Tier, Power, Lane]): void {
		this.socket.emit("cast", cast);
	}
	
}