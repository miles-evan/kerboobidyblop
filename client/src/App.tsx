import { useEffect, useRef } from 'react'
import './App.css'
import { Game } from "./game/fluxEngine/Game.ts";
import Screen from "./components/Screen.tsx"


function App() {
	
	const screenRef = useRef<HTMLDivElement>(null);
	
	useEffect(() => {
		if(!screenRef.current) return;
		Game.init(screenRef.current);
		Game.start();
		return () => Game.destroy();
	}, []);
	
	
	return (
		<>
			<h1>PEW PEW FLUX</h1>
			
			<Screen screenRef={screenRef}>
				<p>HI bro</p>
			</Screen>
		</>
	);
}


export default App
