import Board from "../client/src/game/objects/Board.ts";
import Game from "@engine/main/Game.ts";
import CastPadPlayer from "../client/src/game/castHandlers/CastPadPlayer.ts";
import Fluxometer from "../client/src/game/objects/Fluxometer.ts";
import HealthMeter from "../client/src/game/objects/HealthMeter.ts";
import RemotePlayer from "./RemotePlayer.ts";
import Host from "./Host.ts";

export default class HostRoom {
	
	public static load(): void {
		Game.screenWidth = 192;
		Game.screenHeight = 212;
		
		const host = new Host(3000);
		
		new Board(
			new CastPadPlayer(
				new HealthMeter(100, Game.screenHeight - 16),
				new Fluxometer(),
				130, 75,
			),
			new RemotePlayer(
				host,
				new HealthMeter(100, 16),
			),
		);
		
	}
}