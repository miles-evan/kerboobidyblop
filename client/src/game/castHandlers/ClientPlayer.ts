import Player from "./Player.ts";
import type HealthMeter from "../objects/HealthMeter.ts";
import type Fluxometer from "../objects/Fluxometer.ts";
import type Client from "../networking/Client.ts";


// a client player is a local player that makes moves on this computer, then sends the cast to the socket
export default class ClientPlayer extends Player {
	
	private readonly client: Client;
	private readonly castHandler: Player;
	
	public constructor(client: Client, castHandler: Player, healthMeter: HealthMeter, fluxometer: Fluxometer) {
		super(healthMeter, fluxometer);
		this.client = client;
		this.castHandler = castHandler;
	}
	
	public tryCast(): [Tier, Power, Lane] | null {
		const cast = this.castHandler.tryCast();
		if (cast) this.client.sendCast(cast);
		return cast;
	}
	
}