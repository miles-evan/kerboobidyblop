import type { ReactElement } from "react";


export default function Screen({ screenRef, children }: { screenRef: any, children?: ReactElement }) {
	
	return (
		<div ref={screenRef} style={{
			border: "1px solid black",
			height: 720,
		}}>
			{children}
		</div>
	)
	
}