import * as React from "react";


export default function FlexCol({ children }: { children?: React.ReactNode }) {
	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			{ children }
		</div>
	);
}