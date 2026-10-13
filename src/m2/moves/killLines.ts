// What Meathead says over a kill done Meathead 2's ways: beaten to death on the ground, thrown (slammed, suplexed,
// booted, tossed into a wall), a critter pitched like a fastball, the ray gun, and the souvenir launcher's junk. Each a
// pool of its own, in the mix with the lines about who he's killed and the general ones (effects.ts killLine), the way
// his weapons' are. Put in the engine's table at startup; recorded with the rest (tools/voices: extract.ts, m2pack.ts).

import { KILL_LINES } from '../../m1/content/dialogue';
import type { VulgarityType } from '../../m1/types';

export const M2_KILL_LINES = {
  beatdown_kill: [
    'GROUND AND POUND, BITCH!', "TAP OUT! OH WAIT, YOU CAN'T.", "THAT'S WHAT THE FLOOR IS FOR!", 'STAY DOWN FOREVER!',
    'TENDERIZED!', "THE REFEREE'S ON BREAK, ASSHOLE!", 'YOUR FACE IS MY HEAVY BAG!', 'BEATEN LIKE A RENTED MULE!',
  ],
  throw_kill: [
    'HUMAN SHOT PUT, BABY!', "CATCH! OH. YOU DIDN'T.", 'FLY, YOU PIECE OF SHIT!', 'DEADLIFT, THEN DEAD!',
    'THROWN OUT WITH THE TRASH!', 'I LIFT THINGS UP AND PUT THEM DOWN. HARD.', 'CLEAN AND JERKED TO DEATH!', 'SPIKED LIKE A FOOTBALL!',
  ],
  airgrab_kill: [
    'HEAD FIRST, DUMBASS!', 'EAT FLOOR!', 'PILEDRIVER, BITCH!', 'NECK GO CRUNCH!', 'SAY HI TO THE FLOOR!',
    'DOWN WE GO, FUCKFACE!', 'THAT WAS YOUR NECK!', 'SPIKED, MOTHERFUCKER!',
  ],
  pitch_kill: [
    'STEE-RIKE!', 'FASTBALL, MOTHERFUCKER!', 'BATTER UP! BATTER DEAD!', 'HIGH HEAT!', 'OUT OF THE PARK!', 'PEST CONTROL, BITCH!',
    'BEANBALL!', 'CHIN MUSIC!',
  ],
  raygun_kill: [
    'DISINTEGRATED!', 'PEW PEW, BITCH!', 'NOTHING LEFT BUT SHOES!', 'PROBE THIS!', 'NOT EVEN A STAIN!', 'BEAM ME UP, ASSHOLE!',
    'ATOMIZED!', 'TAKE ME TO YOUR UNDERTAKER!',
  ],
  souvenir_kill: [
    'WISH YOU WERE HERE!', 'GREETINGS FROM YOUR FUNERAL!', 'TAKE A PICTURE, IT LASTS LONGER!', 'CULTURE, BITCH!',
    'CHEAP PLASTIC, EXPENSIVE FUNERAL!', 'ONE PER CUSTOMER!', "THE GIFT SHOP'S THAT WAY, ASSHOLE!", 'NO REFUNDS, MOTHERFUCKER!',
  ],
  shred_kill: [
    'IN THE BAG!', 'GROUND BEEF, BITCH!', 'SUCKS TO BE YOU!', 'EXTRA LEAN!', "NOW YOU'RE PROTEIN!", 'CLEANUP ON AISLE YOU!',
    'DIRT DEVIL, MOTHERFUCKER!', 'NO SOUL, NO PROBLEM!',
  ],
  flintlock_kill: [
    'HEADS UP! OH, NO HEAD.', 'YEEHAW, MOTHERFUCKER!', 'HEAD COUNT: ZERO!', 'FINALLY, SOME HEAD!', 'OLD SCHOOL, BITCH!',
    'DRAW, PARTNER!', 'BULLSEYE!', "LOST YOUR HEAD, DIDN'T YA?",
  ],
  spell_kill: [
    'ABRACA-DEAD!', 'MAGIC, MOTHERFUCKER!', 'SMITE THIS!', 'YOU SHALL NOT PASS! OR LIVE!', 'READ IT AND WEEP!', 'NERD SHIT WORKS!',
    'BOOKWORM, BITCH!', 'BIBBIDI BOBBIDI BOOM!',
  ],
  stunt_kill: [
    'CUT! PRINT IT!', 'NO STUNT DOUBLE FOR YOU!', 'FAST AND THE FUCKED UP!', 'BLOCKBUSTER, BITCH!', 'DIRECTED BY MEATHEAD!',
    'AND SCENE!', 'NO INSURANCE, NO PROBLEM!', 'GREEN LIGHT, RED MIST!',
  ],
  alien_kill: [
    'EAT UP, BOYS!', "WHO'S HUNGRY?", "DINNER'S SERVED!", 'BONE APPETIT!', "THAT'S MY BABIES!", "DADDY'S SO PROUD!",
    'ALL YOU CAN EAT!', 'PICKED CLEAN, MOTHERFUCKER!',
  ],
  plague_kill: [
    'PUKE AND DIE!', 'TOSSED YOUR COOKIES, THEN YOUR LIFE!', 'CHUNKS AWAY!', 'FOOD POISONING, BITCH!', 'SPEW, MOTHERFUCKER!',
    'PASS THE BUCKET!', "THAT'S SOME BAD SUSHI!", 'LIQUID LUNCH!',
  ],
  mallet_kill: [
    'BONK! GO TO HELL!', 'WHACK-A-MOLE, BITCH!', 'FLAT AS A PANCAKE!', 'SEE YOU IN THE FUNNY PAGES!', 'MALLET, MOTHERFUCKER!',
    'SIT DOWN, SHORTY!', 'TWINKLE TWINKLE, LITTLE PRICK!', 'LOOK, BIRDIES!',
  ],
  gore_kill: [
    'HAVE SOME OF YOUR FRIEND!', 'SECOND HAND GORE!', "IT'S RAINING MEN! IN BITS!", 'GORE SHOWER, BITCH!', "YOU'VE BEEN HOSED!",
    'THE BAG GIVES BACK!', 'SPLASH ZONE!', 'SLIPPED ON YOUR BUDDY!',
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
