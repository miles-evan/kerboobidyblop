import GameObject from "../../engine/GameObject.ts";
import castPadSprite from "../sprites/cast-pad/cast-pad.png";
import ShowWhenHoveredOver from "./ShowWhenHoveredOver.ts";
import Spell from "./Spell.ts";
import cost1 from "../sprites/cast-pad/cost-1.png";
import cost2 from "../sprites/cast-pad/cost-2.png";
import cost3 from "../sprites/cast-pad/cost-3.png";
import cost4 from "../sprites/cast-pad/cost-4.png";
import cost5 from "../sprites/cast-pad/cost-5.png";
import cost6 from "../sprites/cast-pad/cost-6.png";
import cost7 from "../sprites/cast-pad/cost-7.png";
import cost8 from "../sprites/cast-pad/cost-8.png";
import Game from "../../engine/Game.ts";


export default class CastPad extends GameObject {
	
	hoveredCast: [Tier, Power] = [1, "none"];
	onCast: (cast: [Tier, Power, Lane]) => any;
	
	constructor(x: Pixels, y: Pixels, onCast: (cast: [Tier, Power, Lane]) => any) {
		super(x, y, 64, 64, castPadSprite);
		
		this.onCast = onCast;
		
		const costSprites: string[] = [cost1, cost2, cost3, cost4, cost5, cost6, cost7, cost8];
		for(let t: number = 0; t < 4; t ++) {
			for(let p: number = 0; p < 4; p ++) {
				const tier: Tier = t + 1 as Tier;
				const power: Power = ["dodger", "retreater", "hopper", "none"][p] as Power;
				const cost: Flux = Spell.fluxCost(tier, power);
				const costObj = new ShowWhenHoveredOver(x + 16*t, y + 16*p, 16, 16, costSprites[cost - 1] ?? "", () => {
					this.hoveredCast = [tier, power];
				});
				costObj.onClick = () => onCast([tier, power, 0]);
				costObj.onMiddleClick = () => onCast([tier, power, 1]);
				costObj.onRightClick = () => onCast([tier, power, 2]);
			}
		}
	}
	
	step(): void {
		if(Game.isKeyPressed("1")) this.onCast([...this.hoveredCast, 0])
		else if(Game.isKeyPressed("2")) this.onCast([...this.hoveredCast, 1])
		else if(Game.isKeyPressed("3")) this.onCast([...this.hoveredCast, 2])
	}
	
}