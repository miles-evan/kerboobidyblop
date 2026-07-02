import GameObject from "../../../engine/GameObject.ts";
import Spell from "../Spell.ts";
import UiButton from "./UiButton.ts";
import UiPanel from "./UiPanel.ts";
import { spellSprites, spellTrailSprites } from "../../sprites/sprites.ts";
import type Player from "../../castHandlers/Player.ts";


const POWERS: readonly Power[] = ["none", "retreater", "dodger", "hopper"];
const POWER_LABELS: Record<Power, string> = {
	"none": "plain",
	"retreater": "retreat",
	"dodger": "dodge",
	"hopper": "hop",
};


// Tap-to-cast menu: tap a column, then a spell tier, then a power.
// Works with both touch and mouse. Unaffordable options are grayed out
// (based on the player's flux; the server still has the final say online).
export default class CastMenu extends GameObject {

	private stage: "lane" | "tier" | "power" = "lane";
	private lane: Lane | null = null;
	private tier: Tier | null = null;
	private expireTime: Time = 0;
	private static readonly expireDuration: Milliseconds = 6000;

	private readonly player: Player; // read for flux affordability
	private readonly onCast: (cast: [Tier, Power, Lane]) => void;
	private readonly laneHighlight: UiPanel;
	private readonly panel: UiPanel;
	private readonly tierButtons: UiButton[];
	private readonly powerButtons: UiButton[];

	constructor(playerNum: PlayerNum, player: Player, onCast: (cast: [Tier, Power, Lane]) => void) {
		super(0, 0, 0, 0, "");
		this.player = player;
		this.onCast = onCast;

		// full-height hit area over each column
		([0, 1, 2] as const).forEach(lane => {
			const hitArea = new UiButton(24 + 16*lane, 10, 16, 160, "", {
				className: `kb-lane-${lane}`,
				onClick: () => this.handleLaneClick(lane),
			});
			hitArea.depth = -5;
		});

		this.laneHighlight = new UiPanel(24, 10, 16, 160, "rgba(255, 255, 255, 0.3)");
		this.laneHighlight.depth = -4;

		this.panel = new UiPanel(14, 72, 68, 26, "rgba(15, 15, 35, 0.85)");
		this.panel.depth = -6;

		this.tierButtons = ([1, 2, 3, 4] as const).map((tier, i) => {
			const button = new UiButton(16 + 16*i, 75, 16, 16, spellSprites[playerNum][tier], {
				className: `kb-tier-${tier}`,
				onClick: () => this.handleTierClick(tier),
				isEnabled: () => this.player.flux >= Spell.fluxCost(tier, "none"),
			});
			button.depth = -7;
			return button;
		});

		this.powerButtons = POWERS.map((power, i) => {
			const button = new UiButton(16 + 16*i, 75, 16, 16, spellTrailSprites[power], {
				className: `kb-power-${power}`,
				label: POWER_LABELS[power],
				onClick: () => this.handlePowerClick(power),
				isEnabled: () => this.tier !== null && this.player.flux >= Spell.fluxCost(this.tier, power),
			});
			button.depth = -7;
			return button;
		});

		this.applyStage();
	}


	private handleLaneClick(lane: Lane): void {
		// tapping the selected column again closes the menu
		if(this.stage !== "lane" && this.lane === lane) {
			this.reset();
			return;
		}
		this.lane = lane;
		this.stage = "tier";
		this.bumpExpiry();
		this.applyStage();
	}

	private handleTierClick(tier: Tier): void {
		if(this.stage !== "tier") return;
		this.tier = tier;
		this.stage = "power";
		this.bumpExpiry();
		this.applyStage();
	}

	private handlePowerClick(power: Power): void {
		if(this.stage !== "power" || this.lane === null || this.tier === null) return;
		this.onCast([this.tier, power, this.lane]);
		this.reset();
	}


	private reset(): void {
		this.stage = "lane";
		this.lane = null;
		this.tier = null;
		this.applyStage();
	}

	private bumpExpiry(): void {
		this.expireTime = Date.now() + CastMenu.expireDuration;
	}

	private applyStage(): void {
		this.laneHighlight.visible = this.lane !== null;
		if(this.lane !== null)
			this.laneHighlight.x = 24 + 16*this.lane;
		this.panel.visible = this.stage !== "lane";
		this.tierButtons.forEach(button => button.visible = this.stage === "tier");
		this.powerButtons.forEach(button => button.visible = this.stage === "power");
	}


	step(): void {
		// abandon a half-finished selection after a while
		if(this.stage !== "lane" && Date.now() > this.expireTime)
			this.reset();
	}

}
