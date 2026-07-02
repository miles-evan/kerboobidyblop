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
				// fill most of the viewport; aspect ratio matches the game's
				// virtual 96x180 space exactly so there's no dead margin
				height: "min(78dvh, calc(94vw * 180 / 96))",
				aspectRatio: "96 / 180",
				backgroundColor: "#12121f",
				border: "1px solid #8888",
				borderRadius: "6px",
				boxShadow: "0 4px 24px rgba(0, 0, 0, 0.25)",
				overflow: "hidden",
				touchAction: "manipulation",
				userSelect: "none",
				WebkitUserSelect: "none",
				WebkitTapHighlightColor: "transparent",
			}}
		>
			{children}
		</div>
	);

}
