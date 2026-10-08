// What Meathead says over a kill done Meathead 2's ways: beaten to death on the ground, thrown (slammed, suplexed,
// booted, tossed into a wall), a critter pitched like a fastball, and the ray gun. Each a pool of its own, in the mix
// with the lines about who he's killed and the general ones (effects.ts killLine), the way his weapons' are. Put in the
// engine's table at startup; recorded with the rest (tools/voices: extract.ts, m2pack.ts).

import { KILL_LINES } from '../../m1/content/dialogue';
import type { VulgarityType } from '../../m1/types';

export const M2_KILL_LINES = {
  beatdown_kill: [
    'GROUND AND POUND, BITCH!', 'TAP OUT! OH WAIT, YOU CAN\'T.', 'THAT\'S WHAT THE FLOOR IS FOR!', 'STAY DOWN FOREVER!',
    'FACE, MEET FIST. FIST, MEET FLOOR.', 'I\'M NOT DONE TILL YOU\'RE DONE!', 'THE REFEREE\'S ON BREAK, ASSHOLE!', 'TENDERIZED!',
    'PUNCHED INTO THE PAVEMENT!', 'YOUR FACE IS MY HEAVY BAG!', 'BEATEN LIKE A RENTED MULE!', 'THE MEAT TENDERIZER STRIKES AGAIN!',
  ],
  throw_kill: [
    'HUMAN SHOT PUT, BABY!', 'CATCH! OH. YOU DIDN\'T.', 'OUT OF MY HANDS AND OUT OF YOUR LIFE!', 'SPIKED LIKE A FOOTBALL!',
    'FLY, YOU PIECE OF SHIT!', 'DEADLIFT, THEN DEAD!', 'THROWN OUT WITH THE TRASH!', 'I LIFT THINGS UP AND PUT THEM DOWN. HARD.',
    'SHAKEN, THEN TAKEN OUT!', 'TAKE A HIKE! AN AIRBORNE ONE!', 'FREE FLIGHT, NO LANDING!', 'CLEAN AND JERKED TO DEATH!',
  ],
  pitch_kill: [
    'STEE-RIKE!', 'FASTBALL, MOTHERFUCKER!', 'HE\'S OUT!', 'BATTER UP! BATTER DOWN!', 'HIGH HEAT!', 'PLAY BALL, VERMIN!',
    'OUT OF THE PARK!', 'SEVENTH INNING SPLAT!', 'PEST CONTROL, BITCH!', 'BEANBALL!', 'THE BULLPEN\'S OPEN!', 'CHIN MUSIC!',
  ],
  raygun_kill: [
    'DISINTEGRATED!', 'BEAM ME UP, ASSHOLE!', 'PEW PEW, BITCH!', 'ATOMIZED!', 'NOTHING LEFT BUT SHOES!', 'SEE YOU NEVER!',
    'PROBE THIS!', 'SPACE AGE SLAUGHTER!', 'ZAPPED OUT OF EXISTENCE!', 'NOT EVEN A STAIN!', 'THANKS FOR THE GUN, ZORBLAX!', 'TAKE ME TO YOUR UNDERTAKER!',
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
