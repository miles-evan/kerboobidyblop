import './App.css'
import Screen from "./components/Screen.tsx"

export default function App() {
	return (
		<div style={{ display: "flex", flexDirection: "row-reverse" }}>
			<h1 style={{ maxHeight: "20vh" }}>Kerboobidyblop 5</h1>
			<Screen/>
		</div>
	);
}