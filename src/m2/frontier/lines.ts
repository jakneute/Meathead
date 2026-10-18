// What's said land-wide in Wilderness Land, by voice (each section's own lines are in its folder's lines.ts). In the
// user's voice (blunt, short, vulgar, specific; talk less; fit the trigger); pick with pickLine; clean / shitty / naked
// pools where it's about the state of him. Pure data (tools/voices bundles it in node).

import type { HurtTable } from './talk';

/** His air running out, under the water (any of the land's water). */
export const AIR_LOW = ["CAN'T BREATHE. CAN'T BREATHE.", 'AIR. NEED AIR. NOW.', "I'M NOT DYING IN A THEME PARK CREEK."];

/** The land's own ways to hurt him (the wilds' are in wilds/lines.ts). */
export const HURT: HurtTable = {
  'm2:fr_drown': {
    hurt: ['GLUB! GLUB!', 'WATER IN MY LUNGS! THE BAD KIND!', 'I SWALLOWED A FISH!'],
    death: ['DROWNED IN THE FRONTIER', 'DROWNED. THE CREEK IS FOUR FEET DEEP.'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...AIR_LOW, ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
};
