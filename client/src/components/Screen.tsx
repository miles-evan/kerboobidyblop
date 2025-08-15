import { type ReactElement, useEffect, useRef } from "react";
import Game from "../game/engine/Game.ts";
import room1 from "../game/main/rooms/room1.ts";

export default function Screen({ children }: { children?: ReactElement }) {
	
	const screenRef = useRef<HTMLDivElement>(null);
	
	
	useEffect(() => {
		const cleanup = () => {Game.destroy();};
		
		if(!screenRef.current) return cleanup;
		if(!Game.init(screenRef.current)) return cleanup;
		if(!Game.start()) return cleanup;
		room1();
		
		return cleanup;
	}, []);
	
	
	return (
		<div
			ref={screenRef}
			style={{
				border: "1px solid black",
				display: "flex",
				width: "auto",
				height: "70vh",
				aspectRatio: "400 / 720",
			}}
		>
			{children}
		</div>
	);
	
}
