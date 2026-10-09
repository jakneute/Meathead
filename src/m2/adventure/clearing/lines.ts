// What's said in the clearing (and the placeholder fight with Safari Artie), by voice (recorded with the rest:
// tools/voices). Where somebody reacts to him, three ways: clean pants, shitty ones, naked.

export type Dressed = 'clean' | 'shitty' | 'nude';

/** Meathead, kicking the tree that's in his way. */
export const MEATHEAD_KICK = ['MOVE.', 'OUTTA MY WAY, TREE.', 'NATURE. ALWAYS IN THE WAY.'];
/** Safari Artie, found out up in his blind (in the dust off the roof: he got here first). */
export const ARTIE_FOUND: Record<Dressed, string[]> = {
  clean: ["...I WAS GONNA AMBUSH YOU. EMPLOYEE SHORTCUTS. YOU DON'T KNOW ABOUT THOSE.", "HOW'D I GET HERE FIRST? EMPLOYEE SHORTCUTS. NOW HOLD STILL."],
  shitty: ['...I WAS GONNA AMBUSH YOU. I COULD SMELL YOU COMING, BUT STILL.', "HOW'D I GET HERE FIRST? I FOLLOWED THE SMELL BACKWARDS."],
  nude: ['...I WAS GONNA AMBUSH YOU. THEN I SAW YOU COMING. ALL OF YOU.', "HOW'D I GET HERE FIRST? I DIDN'T STOP TO LOSE MY PANTS."],
};
/** Meathead, back at him. */
export const MEATHEAD_ARTIE = ['YOU KNOW YOUR BROTHER DIED LIKE THIS.', 'THIS IS GONNA BE THE BEST PART OF THE TOUR.', "LET'S GO, TOUR GUIDE."];
/** Safari Artie, in the (placeholder) fight. */
export const ARTIE_FIGHT = ["THIS IS FOR THE BOAT!", "THIS IS FOR THE ROOF!", "I'VE GOT A TRANQ GUN AND NOTHING TO LOSE!", "HOLD STILL! I'M TRAINED FOR HIPPOS!"];
/** Meathead, after. */
export const MEATHEAD_WON = ['TOUR OVER.', 'FIVE STARS. WOULD NOT RECOMMEND.', 'TIP YOUR GUIDE.'];

/** What he says when Artie bumps him / his darts get him, and the death screen. */
export const HURT_ARTIE = ['GET YOUR HANDS OFF ME, TOUR GUIDE!', 'WATCH IT, ARTIE!', 'OW! YOU BUCK-TOOTHED PRICK!'];
export const DEATH_ARTIE = ['GUIDED TO DEATH', 'END OF THE TOUR'];
export const HURT_DART = ['TRANQ DART! IN MY ASS!', 'THAT WAS FOR A HIPPO!', "I'M GETTING SLEEPY... NO I'M NOT!"];
export const DEATH_DART = ['TRANQUILIZED', 'SLEEPING WITH THE HIPPOS'];

const all = (r: Record<Dressed, string[]>) => [...r.clean, ...r.shitty, ...r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_KICK, ...MEATHEAD_ARTIE, ...MEATHEAD_WON, ...HURT_ARTIE, ...HURT_DART],
  death: [...DEATH_ARTIE, ...DEATH_DART],
  'm2.safari': [...all(ARTIE_FOUND), ...ARTIE_FIGHT],
};
