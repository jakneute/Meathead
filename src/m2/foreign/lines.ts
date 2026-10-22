// What's said land-wide in Foreign Lands (the gate, the PA between pavilions), by voice; each pavilion's own lines are
// in its folder's lines.ts. In the user's voice (blunt, short, vulgar, specific); pick with pickLine; clean / shitty /
// naked pools where somebody reacts to the state of him. The joke is on the clueless Americans and the park as much as
// anyone: stereotypes for laughs, never slurs or hate.

import { PA_VOICE, type ByPants } from './talk';

/** Walking in through the gate (once, from the start). */
export const ARRIVE = [
  'FOREIGN LANDS. THE WHOLE WORLD AND NO PASSPORT. SUCK IT, CUSTOMS.',
  "TEN COUNTRIES IN ONE WALK. I'M GONNA HATE ALL OF THEM EQUALLY.",
];

/** The PA at the gate (the land's announcer: a cheerful, smarmy, very American voice over the lamppost horns). */
export const PA_WELCOME: ByPants = {
  clean: [
    'WELCOME TO FOREIGN LANDS! THE WHOLE WORLD, FIXED! NO PASSPORT NEEDED! NO PASSPORT ALLOWED!',
    'WELCOME TO FOREIGN LANDS! TEN COUNTRIES! ZERO FOREIGNERS! EVERY CAST MEMBER IS FROM OHIO!',
  ],
  shitty: [
    "WELCOME TO FOREIGN LANDS! SIR, IT LOOKS LIKE YOU'VE ALREADY BEEN TO MEXICO.",
    'WELCOME TO FOREIGN LANDS! SIR, YOU CANNOT BLAME THE WATER. YOU HAVE NOT HAD THE WATER YET.',
  ],
  nude: [
    'WELCOME TO FOREIGN LANDS! SIR, IN AMERICA WE WEAR PANTS. EVEN IN OTHER COUNTRIES.',
    'WELCOME TO FOREIGN LANDS! SIR, CUSTOMS WILL NEED TO SEARCH YOU. NOBODY WANTS TO.',
  ],
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...ARRIVE],
  [PA_VOICE]: [...PA_WELCOME.clean, ...PA_WELCOME.shitty, ...PA_WELCOME.nude],
};
