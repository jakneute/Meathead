// What's said going over the falls at the long river's end (fallsDeath.ts: the kill cam), by voice (frontier/voices.ts
// gathers it; tools/voices records it). Pure data.

import type { ByPants, HurtTable } from '../talk';
import { allOf } from '../talk';

/** The falls on foot or swimming (the log's own is m2:fr_falls_log, wilds/lines.ts). */
export const WATERFALL_SRC = 'm2:fr_waterfall';

/** His scream going over, the once, as the kill cam starts. */
export const FALLS_SCREAM: ByPants = {
  clean: ['OH SHIIIIIT!', 'WATERFAAAAALL!', 'NOT LIKE THIIIIS!'],
  shitty: ['OH SHIIIT! AND I ALREADY DID!', 'AT LEAST IT RINSES MY PAAAANTS!'],
  nude: ['MY BALLS ARE GOING FIRST!', 'NAKED AND FALLIIIING!'],
};

export const FALLS_HURT: HurtTable = {
  [WATERFALL_SRC]: {
    hurt: ['THE FALLS! THE FALLS!', 'NOT THE WATERFALL!'],
    death: ['WENT OVER THE WATERFALL', 'THE WATERFALL HAD ROCKS', 'WATERFALL 1, MEATHEAD 0'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...allOf(FALLS_SCREAM), ...Object.values(FALLS_HURT).flatMap(h => h.hurt)],
  death: Object.values(FALLS_HURT).flatMap(h => h.death),
};
