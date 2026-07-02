import Player from "./Player.ts";
import KeyboardInputPlayer from "./KeyboardInputPlayer.ts";
import CastMenu from "../objects/ui/CastMenu.ts";


// Casts via the tap/click CastMenu (mobile + desktop), with the old
// keyboard shortcuts still working alongside.
export default class PointerInputPlayer extends Player {

	private pendingCast: [Tier, Power, Lane] | null = null;
	private readonly keyboard: KeyboardInputPlayer = new KeyboardInputPlayer();

	constructor(playerNum: PlayerNum = 1) {
		super();
		new CastMenu(playerNum, this, cast => { this.pendingCast = cast; });
	}

	tryCast(): [Tier, Power, Lane] | null {
		const cast: [Tier, Power, Lane] | null = this.pendingCast ?? this.keyboard.tryCast();
		this.pendingCast = null;
		return cast;
	}

}
