import Player from "./Player.ts";


// A player whose flux/health are set from server snapshots rather than local logic.
// It never casts locally; it exists so display objects like FluxBar can read from it.
export default class RemotePlayer extends Player {

	constructor() {
		super();
	}

	tryCast(): [Tier, Power, Lane] | null {
		return null;
	}

}
