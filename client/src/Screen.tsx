import * as React from "react";
import { useEffect, useRef } from "react";
import Game from "@engine/main/Game.ts";
import Room1 from "./game/rooms/Room1.ts";
import ClientRoom from "./game/rooms/ClientRoom.ts";

export default function Screen({ children, startFnRef }:
	{ children?: React.ReactNode, startFnRef: React.RefObject<((mode: "local" | "host" | "client") => void) | null> }
) {
	
	const screenRef = useRef<HTMLDivElement>(null);
	
	
	useEffect(() => {
		startFnRef.current = startGame;
		return () => { Game.destroy(); }
	}, [startFnRef]);
	
	
	function startGame(mode: "local" | "host" | "client"): boolean {
		console.log({ mode });
		
		// try to start game
		if(!screenRef.current || !Game.init(screenRef.current) || !Game.start()) return false;
		
		// load room
		// ({ local: Room1, host: HostRoom, client: ClientRoom })[mode].load();
		mode == "local"? Room1.load() : ClientRoom.load();
		return true;
	}
	
	
	return (
		<div
			ref={screenRef}
			style={{
				border: "1px solid black",
				width: "75vh",
				aspectRatio: "800 / 720",
			}}
		>
			{children}
		</div>
	);
	
}
