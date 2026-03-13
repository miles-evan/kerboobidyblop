import './App.css'
import Screen from "./Screen.tsx"
import FlexCol from "./FlexCol.tsx";
import { useRef } from "react";

export default function App() {
	
	const startFnRef = useRef<((mode: "local" | "host" | "client") => void) | null>(null);
	
	return (
		<div style={{ display: "flex", flexDirection: "row-reverse" }}>
			<h1 style={{ maxHeight: "20vh" }}>Kerboobidyblop 7 </h1>
			<FlexCol>
				<button onClick={() => startFnRef.current?.("local")}>Local</button>
				<button onClick={() => startFnRef.current?.("host")}>Host</button>
				<button onClick={() => startFnRef.current?.("client")}>Client</button>
			</FlexCol>
			<Screen startFnRef={startFnRef}/>
		</div>
	);
}