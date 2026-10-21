// Stuntman Steve's likeness on his fliers, posters, standees and billboards: a gross-up (the user's rule for every
// portrait of one person; grossBust.ts), matching his model (stunt/steveGross.ts): forty years of sun and baby oil (a
// leathery tan shining with grease), the feathered mullet, the cheap gold aviators, the horseshoe mustache, the grin
// (stained teeth, a gold one), the rhinestone neck brace, a cigarette behind his ear, the yellow stunt suit.

import { R } from '../grossKit';
import { bust, tintBust, SKIN, HAIR, IRIS, type BustSpec, type Medium } from '../grossBust';

const SUIT = R('#FFF6B0', '#FDE047', '#E8C020', '#C09A14', '#8A6A0A', '#4A3604');
export const STEVE_BUST: BustSpec = {
  seed: 1977, skin: SKIN.tan, hair: 'long', hairRamp: HAIR.brown, beard: 'stache', beardRamp: HAIR.brown, iris: IRIS.blue, sclera: 'red', mouth: 'grin',
  coat: SUIT, extras: ['aviators', 'brace', 'cig', 'sweaty'], jowl: 1.1, nose: 1.15,
};
/** His bust in a medium (a print, a photo), under a color if it's dimmed or the day's going. */
export const steveBust = (medium: Medium = 'poster', col?: string) => { const b = bust('steve', STEVE_BUST, medium); return col ? tintBust(b, col) : b; };
