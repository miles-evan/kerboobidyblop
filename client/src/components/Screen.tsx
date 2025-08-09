import type { ReactElement } from "react";


export default function Screen({ screenRef, children }: { screenRef: any, children: ReactElement }) {
	
	return (
		<div ref={screenRef}>
			{children}
		</div>
	)
	
}