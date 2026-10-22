// What's said land-wide in Cartoon Land, by voice (each section's own lines are in its folder's lines.ts). In the user's
// voice (blunt, short, vulgar, specific; talk less; fit the trigger); pick with pickLine; clean / shitty / naked pools
// where it's about the state of him. Pure data (tools/voices bundles it in node).

import { allOf, type ByPants, type HurtTable } from './talk';

/**
 * His ride snobbery (the user's: "there's no good rides here"; later, trackless rides are for "pussies"): for any
 * section's ride he won't get on. Never anything about his age (it stays ambiguous).
 */
export const RIDE_SNOB: ByPants = {
  clean: ["THERE'S NO GOOD RIDES HERE.", "IF IT DOESN'T GO UPSIDE DOWN, IT'S A CHAIR.", 'I DID NOT PAY EIGHTY BUCKS TO SIT IN A CUP.'],
  shitty: ["THERE'S NO GOOD RIDES HERE. JUST BAD PANTS.", 'RIDE THAT? MY ASS ALREADY DID THE LOOP.'],
  nude: ["THERE'S NO GOOD RIDES HERE. NOT FOR A NAKED MAN.", 'NO SEAT IN THIS PARK DESERVES MY BARE ASS.'],
};

/**
 * The soft pits' dirty needle (pitBounce.ts: the ball pits, the reject pile, the paint vat, the glop pits bounce him
 * out with one stuck in his ass): a source for each state of him, so the hurt and the death screen fit it.
 */
export const NEEDLE: HurtTable = {
  'm2:ct_needle': {
    hurt: ['A NEEDLE! IN MY ASS! A USED ONE!', 'WHO LEAVES A NEEDLE IN A BALL PIT?', "I'M GONNA GET HEPATITIS! ALL OF THEM!", "THERE'S STILL SOMETHING IN IT! IT'S IN ME NOW!"],
    death: ['DIED OF A DIRTY NEEDLE', "STUCK BY A JUNKIE'S NEEDLE"],
  },
  'm2:ct_needle_shat': {
    hurt: ['A NEEDLE! RIGHT THROUGH THE SHIT!', 'IT WENT THROUGH THE SHIT AND INTO ME!', "NOW I'VE GOT SHIT AND HEPATITIS!"],
    death: ['SHAT, THEN NEEDLED', 'HEPATITIS IN SHITTY PANTS'],
  },
  'm2:ct_needle_nude': {
    hurt: ['A NEEDLE! IN MY BARE ASS!', 'NOTHING BETWEEN MY ASS AND THAT NEEDLE!', "A JUNKIE'S NEEDLE! IN MY NAKED ASS!"],
    death: ['NEEDLED IN THE BARE ASS', 'BARE ASS, DIRTY NEEDLE'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...allOf(RIDE_SNOB), ...Object.values(NEEDLE).flatMap(h => h.hurt)],
  death: Object.values(NEEDLE).flatMap(h => h.death),
};
