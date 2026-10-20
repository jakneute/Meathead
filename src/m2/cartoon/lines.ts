// What's said land-wide in Cartoon Land, by voice (each section's own lines are in its folder's lines.ts). In the user's
// voice (blunt, short, vulgar, specific; talk less; fit the trigger); pick with pickLine; clean / shitty / naked pools
// where it's about the state of him. Pure data (tools/voices bundles it in node).

import { allOf, type ByPants } from './talk';

/**
 * His ride snobbery (the user's: "there's no good rides here"; later, trackless rides are for "pussies"): for any
 * section's ride he won't get on. Never anything about his age (it stays ambiguous).
 */
export const RIDE_SNOB: ByPants = {
  clean: ["THERE'S NO GOOD RIDES HERE.", "IF IT DOESN'T GO UPSIDE DOWN, IT'S A CHAIR.", 'I DID NOT PAY TO SIT IN A CUP.'],
  shitty: ["THERE'S NO GOOD RIDES HERE. JUST BAD PANTS.", 'RIDE THAT? I ALREADY HAD MY THRILL. IN MY SHORTS.'],
  nude: ["THERE'S NO GOOD RIDES HERE. NOT FOR A NAKED MAN.", 'NO SEAT IN THIS PARK IS READY FOR MY BARE ASS.'],
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: allOf(RIDE_SNOB),
};
