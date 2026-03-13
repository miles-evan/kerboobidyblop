import { useEffect } from "react";

export default function useCleanup(cleanup: AnyFunction) {
	useEffect(() => {
		return cleanup;
	}, []);
}