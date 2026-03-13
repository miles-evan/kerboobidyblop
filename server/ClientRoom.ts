import Board from "../client/src/game/objects/Board.ts";
import Game from "@engine/main/Game.ts";
import CastPadPlayer from "../client/src/game/castHandlers/CastPadPlayer.ts";
import Fluxometer from "../client/src/game/objects/Fluxometer.ts";
import HealthMeter from "../client/src/game/objects/HealthMeter.ts";
import DoNothingPlayer from "../client/src/game/castHandlers/DoNothingPlayer.ts";
import ClientPlayer from "./ClientPlayer.ts";
import Client from "../client/src/game/networking/Client.ts";

export default class ClientRoom {
	
	public static load(): void {
		Game.screenWidth = 192;
		Game.screenHeight = 212;
		
		const client = new Client("http://localhost:3000");
		
		new Board(
			new ClientPlayer(
				client,
				new CastPadPlayer(
					null, null,
					130, 75,
				),
				new HealthMeter(100, Game.screenHeight - 16),
				new Fluxometer(),
			),
			new DoNothingPlayer(
				new HealthMeter(100, 16)
			),
		);
		
	}
}