// Who it was: a line about whoever's just been killed (Meathead's kill lines, the announcer's callouts) that says he,
// him, his or man has one for a woman too, and the other way round, and the one that fits is said. The game says who's
// a woman and who's a man, and what's an animal (setGenderOf: an animal's an it); left alone, nobody's anything, and
// every line's said as it's written (Meathead 1).

import type { Enemy } from '../types';

/** A man, a woman, or an animal (an it). */
export type Gender = 'm' | 'f' | 'n';

let genderOf: (e: Enemy) => Gender | null = () => null;
/** How to tell (a game's own enemies: a guard by her look, a guest by who she is). */
export const setGenderOf = (fn: (e: Enemy) => Gender | null) => { genderOf = fn; };
export const enemyGender = (e?: unknown): Gender | null => (e && typeof e === 'object' && 'kind' in e ? genderOf(e as Enemy) : null);

/** Lines about a man, and what's said in their place about a woman. */
export const FOR_A_WOMAN: Record<string, string> = {
  // Meathead's
  "HE'S OUT!": "SHE'S OUT!",
  'HE LOST HIS HEAD!': 'SHE LOST HER HEAD!',
  "IT'S RAINING MEN! IN BITS!": "IT'S RAINING WOMEN! IN BITS!",
  "ONE MAN'S GUTS!": "ONE WOMAN'S GUTS!",
  // the announcer's
  'MAN OVERBOARD!': 'WOMAN OVERBOARD!',
  "HE'S NOT GETTING UP!": "SHE'S NOT GETTING UP!",
  "HE'S NOT COMING BACK DOWN!": "SHE'S NOT COMING BACK DOWN!",
};
const FOR_A_MAN: Record<string, string> = Object.fromEntries(Object.entries(FOR_A_WOMAN).map(([m, f]) => [f, m]));
/** ...and about an animal: it. */
export const FOR_AN_ANIMAL: Record<string, string> = {
  "HE'S OUT!": "IT'S OUT!",
  'HE LOST HIS HEAD!': 'IT LOST ITS HEAD!',
  "IT'S RAINING MEN! IN BITS!": "IT'S RAINING MEAT! IN BITS!",
  "ONE MAN'S GUTS!": "SOMETHING'S GUTS!",
  'MAN OVERBOARD!': 'CRITTER OVERBOARD!',
  "HE'S NOT GETTING UP!": "IT'S NOT GETTING UP!",
  "HE'S NOT COMING BACK DOWN!": "IT'S NOT COMING BACK DOWN!",
  "WHO'S A DEAD BOY?!": "WHO'S A DEAD DOGGY?!",
};

/** The line, for who it's about. */
export const forGender = (line: string, g: Gender | null) => (g === 'f' ? FOR_A_WOMAN[line] : g === 'm' ? FOR_A_MAN[line] : g === 'n' ? FOR_AN_ANIMAL[FOR_A_MAN[line] ?? line] : undefined) ?? line;

/** Does a line say he or she about somebody (and so need its other half in FOR_A_WOMAN)? */
export const GENDERED = /\b(HE|HE'S|HE'LL|HIS|HIM|HIMSELF|MAN|MEN|MAN'S|SHE|SHE'S|SHE'LL|HER|HERS|HERSELF|WOMAN|WOMEN|WOMAN'S|GUY|LADY|BOY|GIRL)\b/;
/** ...unless it's about Meathead, or his little goblins, not the dead. */
export const NOT_ABOUT_THEM = new Set(['EAT UP, BOYS!', "DADDY'S SO PROUD!", 'TELL MY SPOTTER... I LOVE HIM']);
/** The lines that say he or she with no other half (a dev check: see Meathead 2's startup). */
export const unpaired = (lines: string[]) => lines.filter(t => GENDERED.test(t) && !NOT_ABOUT_THEM.has(t) && !(t in FOR_A_WOMAN) && !(t in FOR_A_MAN) && !(t in FOR_AN_ANIMAL));
