import Game from "../../engine/Game.ts";
import OnlineBoard from "../objects/OnlineBoard.ts";
import type NetworkClient from "../net/NetworkClient.ts";
import type { PlayerNum } from "../net/protocol.ts";

export default function onlineRoom(net: NetworkClient, localPlayerNum: PlayerNum) {
	Game.screenWidth = 96;
	Game.screenHeight = 180;

	new OnlineBoard(net, localPlayerNum);
}
