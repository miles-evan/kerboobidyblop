import type PlayerInterface from "./PlayerInterface";
export default class RandomBotYo implements PlayerInterface {
	makeMove(): [Lane, Tier] {
		const lane: Lane = Math.floor(Math.random() * 3) as Lane;
		const tier: Tier = Math.floor(Math.random() * 4) + 1 as Tier;

		return [lane, tier];
	}
}