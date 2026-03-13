import Player from "../client/src/game/castHandlers/Player.ts";
import Host from "./Host.ts";
import type HealthMeter from "../client/src/game/objects/HealthMeter.ts";


// a remote player is a player that gets its moves from the socket (the other player in multiplayer is controlling it)
export default class RemotePlayer extends Player {
	
	private cast: [Tier, Power, Lane] | null = null;
	
	public constructor(host: Host, healthMeter: HealthMeter) {
		super(healthMeter);
		host.setOnCast((cast: [Tier, Power, Lane]) => this.cast = cast);
	}
	
	public tryCast(): [Tier, Power, Lane] | null {
		const cast = this.cast;
		this.cast = null;
		return cast;
	}
	
}