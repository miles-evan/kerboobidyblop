// Sprite lookup tables. Sprites must be imported (not referenced by path string)
// so vite includes them in production builds.

import spellP1T1 from "./spells/spell-player1-tier1.png";
import spellP1T2 from "./spells/spell-player1-tier2.png";
import spellP1T3 from "./spells/spell-player1-tier3.png";
import spellP1T4 from "./spells/spell-player1-tier4.png";
import spellP2T1 from "./spells/spell-player2-tier1.png";
import spellP2T2 from "./spells/spell-player2-tier2.png";
import spellP2T3 from "./spells/spell-player2-tier3.png";
import spellP2T4 from "./spells/spell-player2-tier4.png";
import trailNone from "./spell-trails/spell-trail-none.png";
import trailRetreater from "./spell-trails/spell-trail-retreater.png";
import trailDodger from "./spell-trails/spell-trail-dodger.png";
import trailHopper from "./spell-trails/spell-trail-hopper.png";

export const spellSprites: Record<PlayerNum, Record<Tier, string>> = {
	1: { 1: spellP1T1, 2: spellP1T2, 3: spellP1T3, 4: spellP1T4 },
	2: { 1: spellP2T1, 2: spellP2T2, 3: spellP2T3, 4: spellP2T4 },
};

export const spellTrailSprites: Record<Power, string> = {
	"none": trailNone,
	"retreater": trailRetreater,
	"dodger": trailDodger,
	"hopper": trailHopper,
};
