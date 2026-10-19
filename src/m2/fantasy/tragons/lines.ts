// What's said on Truelling Tragons, by voice (fantasy/voices.ts gathers it; tools/voices records it). In the user's
// voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine (never twice in 45 s).
// Meathead, and the rivals at him, in clean / shitty / naked pools; the ride's own spiel (a cheesy herald over the
// dragons' speakers); Piper on the PA (purring over the blood, coy about the prize). Pure data.

import { allOf, PIPER_PA_VOICE, type ByPants, type HurtTable } from '../talk';

/** The ride's spiel (cast.json): a cheesy herald over the ride's speakers. The rivals' are the glen's. */
export const SPIEL_VOICE = 'm2.fantasy.tragons_spiel';
export const RIVAL_VOICES = { blake: 'm2.fantasy.suitor_blake', rafael: 'm2.fantasy.suitor_rafael', hank: 'm2.fantasy.suitor_hank' } as const;

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In at the load station. */
export const LOAD: ByPants = {
  clean: ['THREE TRACKS. ONE WINNER. ME.', "A COASTER. AND I DIDN'T EVEN PAY."],
  shitty: ['A ROLLER COASTER. IN SHIT PANTS. GREAT.', 'THIS WILL END BADLY. FOR THE SEATS.'],
  nude: ['A COASTER. NAKED. WHAT COULD GO WRONG.', 'NO PANTS. NO LAP BAR. NO PROBLEM.'],
};
/** Off it goes. */
export const BOARD: ByPants = {
  clean: ['THREE DRAGONS. ONE MEATHEAD. GO.', 'ALL ABOARD THE PIPER EXPRESS.'],
  shitty: ['RIDING A DRAGON IN SHIT PANTS. CLASSY.', 'HOPE THESE DRAGONS WIPE CLEAN.'],
  nude: ['NAKED ON A COASTER. WIND IN MY EVERYTHING.', 'BALLS TO THE WIND. LITERALLY.'],
};
/** Fire pressed on the ride (no firing here). */
export const NO_GUNS: ByPants = {
  clean: ['NO GUNS ON THE RIDE? FINE. FISTS.', "CAN'T SHOOT. STUPID RIDE RULES.", 'NO FIREARMS ON THE DRAGON. GOT IT.'],
  shitty: ['NO GUNS. JUST FISTS AND SHIT.', "CAN'T SHOOT. CAN STILL STINK."],
  nude: ['NO GUNS. JUST THE ONE. AND IT\'S OUT.', "CAN'T SHOOT. MY OTHER GUN'S LOADED THOUGH."],
};
/** The track out ahead of him, the first time. */
export const FIRST_GAP: ByPants = {
  clean: ["THE TRACK! IT'S GONE!", 'NO TRACK! HOP! HOP!'],
  shitty: ['NO TRACK! THERE GOES MORE SHIT!', "THE TRACK'S GONE! SO ARE MY BOWELS!"],
  nude: ['NO TRACK! MY BALLS JUST CRAWLED UP!', "TRACK'S OUT! EVERYTHING'S FLAPPING!"],
};
/** Over to another car (the first time; now and then after). */
export const HOPPED: ByPants = {
  clean: ['DRAGON HOP!', 'NEW DRAGON. SAME ME.', 'MIND THE GAP, LOSERS.'],
  shitty: ['HOP! SOMETHING SLOSHED.', 'NEW DRAGON. SORRY ABOUT THE SEAT.'],
  nude: ['HOP! MY BALLS SLAPPED MY THIGHS.', 'NAKED LEAP OF FAITH.'],
};
/** The lanes closing right in (a near miss). */
export const NEAR: ByPants = {
  clean: ['WHOA! THEY ALMOST HIT!', 'TOO CLOSE! TOO CLOSE!'],
  shitty: ['TOO CLOSE! A LITTLE CAME OUT!', 'NEAR MISS. NOT A CLEAN ONE.'],
  nude: ['CLOSE! ALMOST LOST MY DICK!', 'THAT DRAGON NEARLY CLIPPED MY BALLS!'],
};
/** Sliding on the ice dragon, the first time. */
export const ICE_SLIDE: ByPants = {
  clean: ['THE ICE ONE IS SLIPPERY! WHO DESIGNED THIS?', "I'M SLIDING OFF THE BACK!"],
  shitty: ["ICE AND SHIT PANTS. I'M A SLED.", 'SLIDING ON MY OWN GREASE HERE.'],
  nude: ['ICE. ON MY BARE FEET. AND MY BALLS.', 'NAKED ON ICE. EVERYTHING SHRANK.'],
};
/** A rival down. */
export const RIVAL_DOWN: ByPants = {
  clean: ['ONE LESS DICK ON THE RIDE.', 'ENJOY THE GROUND, LOSER.', 'PIPER, THAT ONE WAS FOR YOU.'],
  shitty: ["DOWN YOU GO. I'D SHIT MYSELF TOO.", 'SPLAT. NOW WE BOTH SMELL.'],
  nude: ['DOWN HE GOES. MY DICK WAVES BYE.', 'GRAVITY WINS. SO DOES MY BONER.'],
};
/** Pulled into the unload. */
export const ARRIVE: ByPants = {
  clean: ['TRIAL TWO. DONE. PIPER, STRETCH.', 'THAT RIDE SUCKED. I WANT TO GO AGAIN.'],
  shitty: ['RIDE OVER. PANTS OVER TOO.', 'MADE IT. MOSTLY. SOME OF ME STAYED BACK THERE.'],
  nude: ['RIDE OVER. STILL HARD. WEIRD.', "TRIAL TWO DONE. MY DICK'S WINDBURNED."],
};
/** Back on a revisit: the ride's closed. */
export const CLOSED: ByPants = {
  clean: ['CLOSED. WONDER WHY.', 'TRACK DAMAGE. NOT MY FAULT. MOSTLY.'],
  shitty: ['CLOSED. PROBABLY CLEANING MY SEAT.', 'CLOSED. GOOD. MY ASS NEEDS A BREAK.'],
  nude: ['CLOSED. THEY FOUND MY BALL PRINTS.', 'CLOSED. SOMEBODY SAW ME NAKED ON IT.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The spiel (the ride's herald) and Piper on the PA

export const SPIEL = {
  board: ['HEAR YE! STEP ONTO THE ICE DRAGON. THE OTHERS ARE TAKEN.', 'BRAVE KNIGHT! THY DRAGON AWAITS. THE LOW ONE.'],
  welcome: ['HEAR YE! WELCOME TO TRUELLING TRAGONS! THREE DRAGONS! ONE TRUEL!', 'HARK! THREE DRAGONS ENTER. NO REFUNDS.'],
  rules: ['NO FIREARMS UPON THE DRAGON. FISTS ONLY.', 'KEEP THY HANDS AND FEET INSIDE THE DRAGON. OR DO NOT.'],
  remain: ['PLEASE REMAIN ON THE DRAGON AT ALL TIMES!', 'SIR! GET BACK ON THE DRAGON!'],
  out: {
    bolt: ['TRACK OUT ON THE LIGHTNING DRAGON! CHANGE DRAGONS!', 'THE LIGHTNING TRACK IS GONE! HOP!'],
    fire: ['TRACK OUT ON THE FIRE DRAGON! CHANGE DRAGONS!', 'THE FIRE TRACK IS GONE! HOP!'],
    ice: ['TRACK OUT ON THE ICE DRAGON! CHANGE DRAGONS!', 'THE ICE TRACK IS GONE! HOP!'],
  },
  safe: {
    bolt: ['ONLY THE LIGHTNING DRAGON MAKES IT! GET ON IT!', 'THE LIGHTNING TRACK ALONE HOLDS! HOP TO IT!'],
    fire: ['ONLY THE FIRE DRAGON MAKES IT! GET ON IT!', 'THE FIRE TRACK ALONE HOLDS! HOP TO IT!'],
    ice: ['ONLY THE ICE DRAGON MAKES IT! GET ON IT!', 'THE ICE TRACK ALONE HOLDS! HOP TO IT!'],
  },
  spare: ['A SPARE DRAGON HATH BEEN DISPATCHED. ENJOY.', 'REPLACEMENT DRAGON INBOUND. PLEASE HOLD.'],
  near: ['BEHOLD! THE TRUEL! THE DRAGONS FLY CLOSE!', 'MIND THY HEADS! DRAGONS PASSING!'],
  unload: ['THANK THEE FOR RIDING TRUELLING TRAGONS. EXIT TO THY RIGHT.', 'THE RIDE HATH ENDED. TAKE THY BELONGINGS. AND THY LIMBS.'],
};

export const PIPER_T = {
  start: ['TRIAL TWO, BOYS. THREE DRAGONS. SHOVE EACH OTHER OFF.', 'THREE TRACKS. NOT ALL OF THEM FINISHED. HAVE FUN.'],
  gap: ['OOPS. I HAD SOME BOLTS TAKEN OUT. FOR FUN.', 'THE TRACK? I NEVER SAID IT WAS FINISHED.'],
  kill: ['OH. HE WENT ALL THE WAY DOWN. LOVELY.', 'MMM. DID YOU HEAR THAT SPLAT? AGAIN.', "ONE LESS SUITOR. I'M BLUSHING."],
  hank: ['OH GOOD. HANK CAUGHT A LATE DRAGON.', 'HANK! YOU MADE IT. NOW MAKE A MESS.'],
  end: ['STILL ALIVE? MMM. COME UP TO THE CASTLE.', "TRIAL TWO IS OVER. I'M SO WARM RIGHT NOW."],
};

// ---------------------------------------------------------------------------------------------------------------
// The rivals (BLAKE, RAFAEL, HANK: the glen's queue)

/** Sat in their dragons at the station, at him. */
export const RIVAL_STATION: Record<'blake' | 'rafael', string[]> = {
  blake: ['SEE YOU AT THE BOTTOM, MEATHEAD!', 'ENJOY THE BABY DRAGON, BRO!'],
  rafael: ['THE ICE DRAGON. FOR LOSERS.', 'WAVE TO ME FROM DOWN THERE.'],
};
/** Up out of their seats, at him. */
export const RIVAL_WAKE: Record<'blake' | 'rafael' | 'hank', ByPants> = {
  blake: {
    clean: ['HEY MEATHEAD! THIS RIDE IS MINE NOW!', "PIPER'S MINE, BRO! GET OFF THE RIDE!"],
    shitty: ['YOU SHIT YOURSELF ON A KIDDIE COASTER?', 'DUDE. THE WHOLE TRACK SMELLS LIKE YOU.'],
    nude: ["PUT SOMETHING ON, MAN! IT'S A FAMILY RIDE!", "BRO, YOUR DICK'S IN THE WIND!"],
  },
  rafael: {
    clean: ['YOU? ON A DRAGON? ADORABLE.', 'I HAVE RIDDEN DRAGONS. AND WOMEN.'],
    shitty: ['THE STENCH REACHES ME UP HERE.', 'YOU SOILED A DRAGON. DISGUSTING.'],
    nude: ['IS THAT YOUR... OH. OH NO.', 'NAKED ON A DRAGON. HOW DESPERATE.'],
  },
  hank: {
    clean: ['HANK CAUGHT THE NEXT DRAGON!', 'HANK SMASH THE LITTLE MAN!'],
    shitty: ['HANK SMELL POOP. HANK ANGRY.', 'LITTLE MAN SHIT HIMSELF. HANK LAUGH.'],
    nude: ['HANK SEE TOO MUCH. HANK SMASH.', 'LITTLE MAN NAKED. LITTLE EVERYTHING.'],
  },
};
/** Throwing at him. */
export const RIVAL_THROW: Record<'blake' | 'rafael' | 'hank', string[]> = {
  blake: ['PROTEIN SHAKE!', 'CATCH, BRO!'],
  rafael: ['DUMBBELL!', 'LIFT THIS!'],
  hank: ['TURKEY LEG!', 'HANK THROW LUNCH!'],
};
/** Hopping over onto his dragon. */
export const RIVAL_HOP: Record<'blake' | 'rafael' | 'hank', string[]> = {
  blake: ['COMING OVER, BRO!', 'MAKE ROOM, LOSER!'],
  rafael: ['MAKE ROOM FOR A PRINCE!', 'STAND STILL. I AM COMING.'],
  hank: ['HANK COMING!', 'HANK JUMP!'],
};
/** Going down (knocked off, or down with a dragon). */
export const RIVAL_FALL: Record<'blake' | 'rafael' | 'hank', string[]> = {
  blake: ['NOT LIKE THIS, BRO!', 'TELL PIPER I-'],
  rafael: ['NOT MY FACE!', 'I AM TOO PRETTY TO-'],
  hank: ['HANK FALL!', 'HANK NOT FLY!'],
};
/** Shot at at the station (it bounces off). */
export const RIVAL_BOUNCE: Record<'blake' | 'rafael', string> = { blake: 'BRO. THAT TICKLED.', rafael: 'YOU MISSED MY GOOD SIDE.' };

// ---------------------------------------------------------------------------------------------------------------
// What hurts him (each its own source), the death screen when it kills him (28 characters at most)

export const HURT: HurtTable = {
  'm2:fa_track_out': { hurt: ['NO TRACK! NO TRACK!', 'WE ARE GOING DOWN!'], death: ['RODE IT INTO THE GAP', 'THE TRACK RAN OUT. SO DID HE', 'DERAILED ON A DRAGON'] },
  'm2:fa_fell_ride': { hurt: ['WHOA WHOA WHOA!', 'I FELL OFF THE DRAGON!'], death: ['FELL OFF A DRAGON', "DIDN'T KEEP ARMS INSIDE"] },
  'm2:fa_ring': { hurt: ["MY HAIR'S ON FIRE!", 'FLAMING HOOP! TO THE FACE!'], death: ['THROUGH THE RING OF FIRE', 'BURNED LIKE A CIRCUS LION'] },
  'm2:fa_jet': { hurt: ['FIRE UP MY LEGS!', 'MY ASS IS ON FIRE!'], death: ['ROASTED FROM THE FEET UP', 'FLAME JET TO THE CROTCH'] },
  'm2:fa_fireball': { hurt: ['FIREBALL! FIREBALL!', 'THE DRAGON SPIT ON ME!'], death: ['HIT BY A DRAGON FIREBALL', 'CHARBROILED ON A COASTER'] },
  'm2:fa_icicles': { hurt: ['ICICLES! IN MY FACE!', 'BRAIN FREEZE! A REAL ONE!'], death: ['ICICLE THROUGH THE SKULL', 'STABBED BY AN ICICLE'] },
  'm2:fa_icebar': { hurt: ['MY SHINS! FROZEN BAR!', 'TRIPPED ON A BAR OF ICE!'], death: ['CLOTHESLINED BY ICE', 'SHINS VS ICE. ICE WON'] },
  'm2:fa_snowball': { hurt: ['SNOWBALL! WITH A ROCK IN IT!', 'IN THE FACE! COLD!'], death: ['KILLED BY A SNOWBALL', 'SNOWBALLED TO DEATH'] },
  'm2:fa_arc': { hurt: ['ZAPPED IN THE HEAD!', 'MY FILLINGS! MY FILLINGS!'], death: ['FRIED BY A TESLA GATE', 'ELECTROCUTED ON A RIDE'] },
  'm2:fa_strike': { hurt: ['STRUCK BY LIGHTNING!', 'THE SKY HIT ME!'], death: ['STRUCK BY FAKE LIGHTNING', 'HE WAS THE LIGHTNING ROD'] },
  'm2:fa_live_rail': { hurt: ["THE DRAGON'S LIVE! MY FEET!", 'ZAP! ZAP! ZAP!'], death: ['ELECTRIC DRAGON. CRISPY', 'GROUNDED. FOR GOOD'] },
  'm2:fa_rival': { hurt: ['SUCKER PUNCHED ON A RIDE!', 'HE HIT ME! ON A DRAGON!'], death: ['PUNCHED OUT BY A SUITOR', 'BEATEN UP ON A KIDDIE RIDE'] },
  'm2:fa_shaker': { hurt: ['PROTEIN SHAKE! IN MY EYE!', 'CHOCOLATE WHEY! EVERYWHERE!'], death: ['DIED OF PROTEIN SHAKE', 'SHAKEN. NOT STIRRED. DEAD'] },
  'm2:fa_dumbbell': { hurt: ['A DUMBBELL! TO THE HEAD!', 'HE THREW HIS WEIGHTS AT ME!'], death: ['DUMBBELL TO THE HEAD', 'KILLED BY LEG DAY'] },
  'm2:fa_turkey': { hurt: ['TURKEY LEG! SO GREASY!', 'HIT WITH A TURKEY LEG!'], death: ['BEATEN WITH A TURKEY LEG', 'KILLED BY FAIR FOOD'] },
};
/** The rivals' kill callouts (the announcer's). */
export const KILL_CALLS: Record<string, Record<string, string[]>> = {
  'm2:fa_rival_blake': { charge: ['OFF THE DRAGON!', 'BRO DOWN!'], uppercut: ['SKY HIGH!'], divekick: ['STOMPED!'] },
  'm2:fa_rival_rafael': { charge: ['OFF THE DRAGON!', 'DETHRONED!'], uppercut: ['SKY HIGH!'], divekick: ['STOMPED!'] },
  'm2:fa_rival_hank': { charge: ['OFF THE DRAGON!', 'TIMBER!'], uppercut: ['SKY HIGH!'], divekick: ['HANK SMASHED!'] },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...[LOAD, BOARD, NO_GUNS, FIRST_GAP, HOPPED, NEAR, ICE_SLIDE, RIVAL_DOWN, ARRIVE, CLOSED].flatMap(allOf), ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flatMap(k => Object.values(k).flat()))],
  [SPIEL_VOICE]: [...SPIEL.board, ...SPIEL.welcome, ...SPIEL.rules, ...SPIEL.remain, ...Object.values(SPIEL.out).flat(), ...Object.values(SPIEL.safe).flat(), ...SPIEL.spare, ...SPIEL.near, ...SPIEL.unload],
  [PIPER_PA_VOICE]: Object.values(PIPER_T).flat(),
  [RIVAL_VOICES.blake]: [...RIVAL_STATION.blake, ...allOf(RIVAL_WAKE.blake), ...RIVAL_THROW.blake, ...RIVAL_HOP.blake, ...RIVAL_FALL.blake, RIVAL_BOUNCE.blake],
  [RIVAL_VOICES.rafael]: [...RIVAL_STATION.rafael, ...allOf(RIVAL_WAKE.rafael), ...RIVAL_THROW.rafael, ...RIVAL_HOP.rafael, ...RIVAL_FALL.rafael, RIVAL_BOUNCE.rafael],
  [RIVAL_VOICES.hank]: [...allOf(RIVAL_WAKE.hank), ...RIVAL_THROW.hank, ...RIVAL_HOP.hank, ...RIVAL_FALL.hank],
};
