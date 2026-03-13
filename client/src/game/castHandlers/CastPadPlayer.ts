import Player from "./Player.ts";
import CastPad from "../objects/CastPad.ts";
import type Fluxometer from "../objects/Fluxometer.ts";
import type HealthMeter from "../objects/HealthMeter.ts";
import SnapshotableClosure from "@engine/multiplayer/SnapshotableClosure.ts";


export default class CastPadPlayer extends Player {
	
	public cast: [Tier, Power, Lane] | null = null;
	
	public constructor(healthMeter: HealthMeter | null, fluxometer: Fluxometer | null,
		castPadX: Pixels = 120, castPadY: Pixels = 30
	) {
		super(healthMeter, fluxometer);
		new CastPad(castPadX, castPadY, new SnapshotableClosure(this, this.setCast));
	}
	
	private setCast(cast: [Tier, Power, Lane]) {
		this.cast = cast;
	}
	
	public tryCast(): [Tier, Power, Lane] | null {
		const cast: [Tier, Power, Lane] | null = this.cast;
		this.cast = null;
		return cast;
	}
	
}