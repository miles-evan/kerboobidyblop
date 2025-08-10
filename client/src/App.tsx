import { useEffect, useRef } from 'react'
import './App.css'
import Game from "./game/fluxEngine/Game.ts";
import Screen from "./components/Screen.tsx"
import { loadRoom1 } from "./game/rooms/room1.ts";


function App() {
	
	const screenRef = useRef<HTMLDivElement>(null);
	
	useEffect(() => {
		if(!screenRef.current) return;
		Game.init(screenRef.current);
		Game.start();
		loadRoom1();
		return () => Game.destroy();
	}, []);
	
	
	return (
		<>
			<h1>Kerboobidyblop 2</h1>
			
			<Screen screenRef={screenRef}>
				<p>HI bro</p>
			</Screen>
		</>
	);
}


export default App;
