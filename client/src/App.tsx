import { useRef, useState } from "react";
import './App.css'
import Screen from "./components/Screen.tsx"
import room1 from "./game/main/rooms/room1.ts";
import onlineRoom from "./game/main/rooms/onlineRoom.ts";
import NetworkClient from "./game/main/net/NetworkClient.ts";
import type { PlayerNum } from "./game/main/net/protocol.ts";


// the public (port-forwarded) address of the game server;
// override with VITE_SERVER_URL (e.g. ws://localhost:8787 in .env.local for local dev)
const SERVER_URL: string = import.meta.env.VITE_SERVER_URL ?? "ws://68.198.104.255:8787";

type Mode =
	| { kind: "menu" }
	| { kind: "local" }
	| { kind: "waiting", code: string }
	| { kind: "online", playerNum: PlayerNum };


export default function App() {

	const [mode, setMode] = useState<Mode>({ kind: "menu" });
	const [joinCode, setJoinCode] = useState("");
	const [status, setStatus] = useState<string | null>(null);
	const netRef = useRef<NetworkClient | null>(null);


	function backToMenu(message: string | null = null): void {
		netRef.current?.disconnect();
		netRef.current = null;
		setStatus(message);
		setMode({ kind: "menu" });
	}

	async function connect(): Promise<NetworkClient> {
		const net = new NetworkClient();
		netRef.current = net;
		net.onStart = message => setMode({ kind: "online", playerNum: message.playerNum });
		net.onOpponentLeft = () => backToMenu("Opponent left the game.");
		net.onError = message => backToMenu(message);
		net.onClose = () => backToMenu("Lost connection to server.");
		await net.connect(SERVER_URL);
		return net;
	}

	async function createGame(): Promise<void> {
		setStatus(null);
		try {
			const net = await connect();
			net.onCreated = code => setMode({ kind: "waiting", code });
			net.createRoom();
		} catch {
			backToMenu("Could not connect to server.");
		}
	}

	async function joinGame(): Promise<void> {
		const code = joinCode.trim().toUpperCase();
		if(!code) return;
		setStatus(null);
		try {
			const net = await connect();
			net.joinRoom(code);
		} catch {
			backToMenu("Could not connect to server.");
		}
	}


	return (
		<>
			<h1>Kerboobidyblop 4</h1>

			{status && <p>{status}</p>}

			{mode.kind === "menu" && <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "240px" }}>
				<button onClick={() => { setStatus(null); setMode({ kind: "local" }); }}>Practice vs bot</button>
				<button onClick={() => void createGame()}>Create online game</button>
				<div style={{ display: "flex", gap: "8px" }}>
					<input
						value={joinCode}
						onChange={e => setJoinCode(e.target.value)}
						onKeyDown={e => { if(e.key === "Enter") void joinGame(); }}
						placeholder="Room code"
						maxLength={4}
						style={{ width: "100px", textTransform: "uppercase" }}
					/>
					<button onClick={() => void joinGame()}>Join</button>
				</div>
			</div>}

			{mode.kind === "waiting" && <div>
				<p>Room code: <b>{mode.code}</b> — waiting for opponent…</p>
				<button onClick={() => backToMenu()}>Cancel</button>
			</div>}

			{mode.kind === "local" && <>
				<Screen setup={room1}/>
				<button onClick={() => backToMenu()}>Back to menu</button>
			</>}

			{mode.kind === "online" && <>
				<Screen setup={() => onlineRoom(netRef.current!, mode.playerNum)}/>
				<button onClick={() => backToMenu()}>Leave game</button>
			</>}
		</>
	);

}
