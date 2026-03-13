import { Server, Socket } from "socket.io";


// creates a socket.io server and gives you a way to send and receive data from the client
export default class Host {
	
	private readonly io: Server;
	private client: Socket | null = null;
	private onCast: ((cast: [Tier, Power, Lane]) => void) | null = null;
	
	public constructor(port: number = 3000) {
		this.io = new Server(port, {
			cors: { origin: "*" }
		});
		this.io.on("connect", (client: Socket) => this.onConnect(client));
	}
	
	private onConnect(client: Socket): void {
		if (this.client) return; // someone's already connected
		this.client = client;
		client.on("cast", (cast: [Tier, Power, Lane]) => this.onCast?.(cast));
	}
	
	public setOnCast(onCast: (cast: [Tier, Power, Lane]) => void): void {
		this.onCast = onCast;
	}
	
	public sendSnapshot(): void {
		// todo
	}
	
}