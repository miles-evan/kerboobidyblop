import { type ReactElement, useEffect, useRef } from "react";
import Game from "../game/engine/Game.ts";

export default function Screen({ setup, children }: { setup: () => void, children?: ReactElement }) {

	const screenRef = useRef<HTMLDivElement>(null);
	const setupRef = useRef(setup);
	setupRef.current = setup;


	useEffect(() => {
		const cleanup = () => {Game.destroy();};

		if(!screenRef.current) return cleanup;
		if(!Game.init(screenRef.current)) return cleanup;
		if(!Game.start()) return cleanup;
		setupRef.current();

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
