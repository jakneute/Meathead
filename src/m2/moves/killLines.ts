// What Meathead says over a kill done Meathead 2's ways: beaten to death on the ground, thrown (slammed, suplexed,
// booted, tossed into a wall), a critter pitched like a fastball, the ray gun, and the souvenir launcher's junk. Each a
// pool of its own, in the mix with the lines about who he's killed and the general ones (effects.ts killLine), the way
// his weapons' are. Put in the engine's table at startup; recorded with the rest (tools/voices: extract.ts, m2pack.ts).

import { KILL_LINES } from '../../m1/content/dialogue';
import type { VulgarityType } from '../../m1/types';

export const M2_KILL_LINES = {
  beatdown_kill: [
    'GROUND AND POUND, BITCH!', "TAP OUT! OH WAIT, YOU CAN'T.", "THAT'S WHAT THE FLOOR IS FOR!", 'PICK UP YOUR TEETH!',
    'SHOULDA STAYED HOME, BITCH!', "THE REFEREE'S ON BREAK, ASSHOLE!", 'YOUR FACE IS MY HEAVY BAG!', 'BEAT YOU LIKE YOUR DAD DID!',
  ],
  throw_kill: [
    'HUMAN SHOT PUT, BABY!', "CATCH! OH. YOU DIDN'T.", 'FLY, YOU PIECE OF SHIT!', 'DEADLIFT, THEN DEAD!',
    "NOBODY CATCHES YOU! NOBODY LOVES YOU!", 'I LIFT THINGS UP AND PUT THEM DOWN. HARD.', 'CLEAN AND JERKED TO DEATH!', 'TOUCHDOWN, BITCH!',
  ],
  airgrab_kill: [
    'HEAD FIRST, DUMBASS!', 'EAT FLOOR!', 'PILEDRIVER, BITCH!', 'NECK GO CRUNCH!', 'KISS THE CONCRETE, DICKHEAD!',
    'DOWN WE GO, FUCKFACE!', 'THAT WAS YOUR NECK!', 'SPIKED, MOTHERFUCKER!',
  ],
  pitch_kill: [
    'STEE-RIKE!', 'FASTBALL, MOTHERFUCKER!', 'BATTER UP! BATTER DEAD!', "STRIKE THREE, YOU'RE DEAD!", 'OUT OF THE PARK!', 'PEST CONTROL, BITCH!',
    'BEANBALL!', 'CHIN MUSIC!',
  ],
  raygun_kill: [
    'DISINTEGRATED!', 'PEW PEW, BITCH!', 'NOTHING LEFT BUT SHOES!', 'PROBE THIS!', 'NOT EVEN A STAIN!', 'BEAM ME UP, ASSHOLE!',
    'SMELLS LIKE BURNT PUBES!', 'TAKE ME TO YOUR UNDERTAKER!',
  ],
  souvenir_kill: [
    'WISH YOU WERE HERE!', 'GREETINGS FROM YOUR FUNERAL!', 'TAKE A PICTURE, IT LASTS LONGER!', 'CULTURE, BITCH!',
    'CHEAP PLASTIC, EXPENSIVE FUNERAL!', 'NINE NINETY-NINE PLUS TAX, BITCH!', "THE GIFT SHOP'S THAT WAY, ASSHOLE!", 'NO REFUNDS, MOTHERFUCKER!',
  ],
  shred_kill: [
    'IN THE BAG!', 'GROUND BEEF, BITCH!', 'SLURPED, BITCH!', 'EXTRA LEAN!', "NOW YOU'RE PROTEIN!", 'CLEANUP ON AISLE YOU!',
    'DIRT DEVIL, MOTHERFUCKER!', 'NO SOUL, NO PROBLEM!',
  ],
  flintlock_kill: [
    'HEADS UP! OH, NO HEAD.', 'YEEHAW, MOTHERFUCKER!', 'HEAD COUNT: ZERO!', 'FINALLY, SOME HEAD!', "YOUR NECK'S A HAT RACK NOW!",
    'DRAW, PARTNER!', 'BULLSEYE!', "LOST YOUR HEAD, DIDN'T YA?",
  ],
  spell_kill: [
    'ABRACA-DEAD!', 'MAGIC, MOTHERFUCKER!', 'SMITE THIS!', 'YOU SHALL NOT PASS! OR LIVE!', 'READ IT AND WEEP!', 'NERD SHIT WORKS!',
    'READING IS FUNDAMENTAL, ASSHOLE!', 'BIBBIDI BOBBIDI BOOM!',
  ],
  stunt_kill: [
    'CUT! PRINT IT!', 'YOUR STUNT DOUBLE QUIT!', 'FAST AND THE FUCKED UP!', 'BLOCKBUSTER, BITCH!', 'DIRECTED BY MEATHEAD!',
    'AND SCENE!', 'NO INSURANCE, NO PROBLEM!', 'GREEN LIGHT, RED MIST!',
  ],
  alien_kill: [
    'EAT UP, BOYS!', "WHO'S HUNGRY?", 'EAT THE FACE FIRST, KIDS!', 'BONE APPETIT!', "THAT'S MY BABIES!", "DADDY'S SO PROUD!",
    'CHEW WITH YOUR MOUTHS OPEN!', 'PICKED CLEAN, MOTHERFUCKER!',
  ],
  plague_kill: [
    'PUKE AND DIE!', 'TOSSED YOUR COOKIES, THEN YOUR LIFE!', 'CHUNKS AWAY!', 'FOOD POISONING, BITCH!', 'SPEW, MOTHERFUCKER!',
    'PASS THE BUCKET!', 'GAS STATION SUSHI, BITCH!', 'LIQUID LUNCH!',
  ],
  mallet_kill: [
    'BONK! GO TO HELL!', 'WHACK-A-MOLE, BITCH!', 'FLAT AS A PANCAKE!', 'SEE YOU IN THE FUNNY PAGES!', 'MALLET, MOTHERFUCKER!',
    'SIT DOWN, SHORTY!', 'TWINKLE TWINKLE, LITTLE PRICK!', 'BRAINS OUT YOUR EARS!',
  ],
  hairball_kill: [
    'HAIRBALL, BITCH!', 'CHOKE ON THAT!', 'COUGHED YOU TO DEATH!', 'FROM DEEP DOWN, ASSHOLE!', 'MEOW, MOTHERFUCKER!',
    'COUGHED UP A WINNER!', 'HACKED UP AND DEAD!', 'SPIT TAKE!',
  ],
  gore_kill: [
    'HAVE SOME OF YOUR FRIEND!', 'SECOND HAND GORE!', "IT'S RAINING MEN! IN BITS!", 'GORE SHOWER, BITCH!', "YOU'VE BEEN HOSED!",
    'WEAR YOUR FRIEND!', 'SPLASH ZONE!', 'SLIPPED ON YOUR BUDDY!',
  ],
} as const;

export type M2Kill = keyof typeof M2_KILL_LINES;

/** Puts them in the engine's table, each under its own category. */
export const registerKillLines = () => {
  const table = KILL_LINES as Record<string, string[]>;
  for (const [k, v] of Object.entries(M2_KILL_LINES)) table[k] = [...v];
};
/** The category to hand the engine for one of them. */
export const m2Kill = (k: M2Kill) => k as unknown as VulgarityType;
