// What's said on Truelling Tragons, by voice (fantasy/voices.ts gathers it; tools/voices records it). In the user's
// voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine (never twice in 45 s).
// A survival ride now (the user's): Meathead terrified (the drops, the loops, screaming, swearing), in clean / shitty /
// naked pools; the ride's own spiel (a cheesy herald over the dragons' speakers, naming the track that loops); Piper on
// the PA (purring at the thought of him letting go). The suitors aren't on the ride: glimpsed at the unload, off the
// train ahead of his, having their say as they go. Pure data.

import { allOf, PIPER_PA_VOICE, type ByPants, type HurtTable } from '../talk';
import { GLEN_VOICES } from '../glen/lines';

/** The ride's spiel (cast.json): a cheesy herald over the ride's speakers. */
export const SPIEL_VOICE = 'm2.fantasy.tragons_spiel';
export const RIVAL_VOICES = { blake: GLEN_VOICES.blake, rafael: GLEN_VOICES.rafael, hank: GLEN_VOICES.hank } as const;

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In at the load station. */
export const LOAD: ByPants = {
  clean: ['THREE DRAGONS. NO SEATBELTS. COOL.', "A COASTER. AND I DIDN'T EVEN PAY."],
  shitty: ['A ROLLER COASTER. IN SHIT PANTS. GREAT.', 'THIS WILL END BADLY. FOR THE SEATS.'],
  nude: ['A COASTER. NAKED. WHAT COULD GO WRONG.', 'NO PANTS. NO LAP BAR. NO PROBLEM.'],
};
/** Off it goes. */
export const BOARD: ByPants = {
  clean: ['NO SEAT. JUST A RAIL. AWESOME.', 'HOLD ON TO WHAT? THIS?'],
  shitty: ['RIDING A DRAGON IN SHIT PANTS. CLASSY.', 'HOPE THESE DRAGONS WIPE CLEAN.'],
  nude: ['NAKED ON A COASTER. WIND IN MY EVERYTHING.', 'BALLS TO THE WIND. LITERALLY.'],
};
/** Fire pressed on the ride (no guns here). */
export const NO_GUNS: ByPants = {
  clean: ["CAN'T SHOOT. BOTH HANDS ARE BUSY NOT DYING.", 'NO GUNS. JUST HANG ON, DUMBASS.'],
  shitty: ["CAN'T SHOOT. TOO BUSY CLENCHING.", 'NO GUNS. JUST FEAR AND SHIT.'],
  nude: ["NO GUNS. JUST THE ONE. AND IT'S FLAPPING.", 'HANDS ON THE RAIL. NOT ON IT.'],
};
/** The track out ahead of him, the first time. */
export const FIRST_GAP: ByPants = {
  clean: ["THE TRACK! IT'S GONE!", 'NO TRACK! HOP! HOP!'],
  shitty: ['NO TRACK! THERE GOES MORE SHIT!', "THE TRACK'S GONE! SO ARE MY BOWELS!"],
  nude: ['NO TRACK! MY BALLS JUST CRAWLED UP!', "TRACK'S OUT! EVERYTHING'S FLAPPING!"],
};
/** Over to another car (the first time; now and then after). */
export const HOPPED: ByPants = {
  clean: ['DRAGON HOP!', 'NEW DRAGON. SAME ME.', 'MIND THE GAP.'],
  shitty: ['HOP! SOMETHING SLOSHED.', 'NEW DRAGON. SORRY ABOUT THE SEAT.'],
  nude: ['HOP! MY BALLS SLAPPED MY THIGHS.', 'NAKED LEAP OF FAITH.'],
};
/** The lanes closing right in (a near miss). */
export const NEAR: ByPants = {
  clean: ['WHOA! THEY ALMOST HIT!', 'TOO CLOSE! TOO CLOSE!'],
  shitty: ['TOO CLOSE! A LITTLE CAME OUT!', 'NEAR MISS. NOT A CLEAN ONE.'],
  nude: ['CLOSE! ALMOST LOST MY DICK!', 'THAT DRAGON NEARLY CLIPPED MY BALLS!'],
};
/** Over the top of a big drop. */
export const DROP: ByPants = {
  clean: ['OH NO. OH NO NO NO.', 'MOMMY.', 'THAT IS STRAIGHT DOWN!'],
  shitty: ['HERE COMES THE REST OF IT!', 'MY ASS IS LEAVING WITHOUT ME!'],
  nude: ['MY BALLS ARE IN MY THROAT!', 'EVERYTHING IS FLAPPING UP!'],
};
/** A loop coming on his track (its warning). */
export const LOOP_SEE: ByPants = {
  clean: ['A LOOP? THERE IS NO SEAT!', "UPSIDE DOWN? I'M STANDING ON IT!"],
  shitty: ['A LOOP. THIS IS GONNA RAIN SHIT.', 'UPSIDE DOWN IN THESE PANTS? OH GOD.'],
  nude: ['UPSIDE DOWN. NAKED. GREAT VIEW FOR SOMEBODY.', 'A LOOP. MY BALLS ARE GONNA SLAP MY FACE.'],
};
/** Into a loop, hanging on (screaming). */
export const LOOP_IN: ByPants = {
  clean: ['AAAAAAAH!', 'SHIT SHIT SHIT SHIT!', 'HOLD! HOLD! HOLD!', 'I HATE THIS RIDE!'],
  shitty: ['IT IS ALL COMING OUT!', 'SHIT! LITERALLY! EVERYWHERE!'],
  nude: ['MY BALLS! MY BALLS!', 'EVERYTHING IS SWINGING!'],
};
/** Into a corkscrew. */
export const CORK_IN: ByPants = {
  clean: ['WHICH WAY IS UP?!', "I'M GONNA PUKE!"],
  shitty: ['SHIT IN MY HAIR NOW!', 'SPINNING SHIT CYCLONE!'],
  nude: ['MY DICK IS A PROPELLER!', 'NAKED BLENDER!'],
};
/** Into the triple helix (all three). */
export const BRAID: ByPants = {
  clean: ['ALL THREE?! NO WAY AROUND IT!', 'THEY ARE TWISTING TOGETHER!'],
  shitty: ['ALL THREE. NOWHERE TO HIDE THIS SMELL.', 'A SHIT TORNADO. STARRING ME.'],
  nude: ['ALL THREE. NAKED. SPINNING. GREAT.', 'MY DICK IS GONNA TIE IN A KNOT!'],
};
/** Out of a loop, still on (now and then). */
export const LOOP_OUT: ByPants = {
  clean: ['STILL HERE. BARELY.', "MY HANDS. I CAN'T FEEL MY HANDS.", 'NEVER AGAIN. UNTIL THE NEXT ONE.'],
  shitty: ['THAT WENT EVERYWHERE.', 'WHOEVER RIDES BEHIND ME, SORRY.'],
  nude: ['STILL GOT MY BALLS. COUNTED TWICE.', 'NAKED AND ALIVE. MOSTLY.'],
};
/** Losing his grip (not holding down, in a loop: a moment before he's gone). */
export const SLIP: ByPants = {
  clean: ['MY GRIP! MY GRIP!', 'NO NO NO!'],
  shitty: ['SLIPPING! IT IS GREASY!', 'SHIT HANDS! SHIT HANDS!'],
  nude: ['SWEATY HANDS! SWEATY EVERYTHING!', 'SLIPPING! NAKED!'],
};
/** Into the fake mountain, in the dark. */
export const TUNNEL: ByPants = {
  clean: ['A FAKE MOUNTAIN. IN THE DARK. SURE.', "I CAN'T SEE SHIT!"],
  shitty: ['DARK. GOOD. NOBODY SEES MY PANTS.', 'IN THE DARK WITH MY OWN SMELL.'],
  nude: ['DARK. AT LEAST NOBODY SEES MY DICK.', 'DARK AND COLD. EVERYTHING SHRANK.'],
};
/** The splashdown. */
export const SPLASH: ByPants = {
  clean: ['WATER! IN MY EVERYTHING!', 'I AM SOAKED!'],
  shitty: ['WELL. THAT WASHED SOME OF IT OFF.', 'FREE BATH. NOT ENOUGH.'],
  nude: ['COLD WATER! IT WENT UP INSIDE!', 'SHRINKAGE! SHRINKAGE!'],
};
/** Pulled into the unload. */
export const ARRIVE: ByPants = {
  clean: ['STILL ALIVE. PIPER, STRETCH.', "I WANT TO GO AGAIN. NO I DON'T."],
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

/** By the lane that's left out (two looping: the third's the way round). */
type ByOdd = { bolt: string[]; fire: string[]; ice: string[] };

export const SPIEL = {
  board: ['HEAR YE! PICK THY DRAGON. ANY DRAGON. THERE ARE NO SEATS.', 'BRAVE KNIGHT! STEP ABOARD. GRIP THE RAIL.'],
  welcome: ['HEAR YE! WELCOME TO TRUELLING TRAGONS! THREE DRAGONS! NO SEATS!', 'HARK! THREE DRAGONS. NO LAP BARS. NO REFUNDS.'],
  rules: ['THROUGH THE LOOPS, HOLD ON TO THE RAIL. OR DO NOT. ONCE.', 'KEEP THY HANDS ON THE RAIL THROUGH THE LOOPS. ALL OF THEM.'],
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
  near: ['BEHOLD! THE DRAGONS MEET HEAD ON! MIND THY HEADS!', 'MIND THY HEADS! DRAGONS PASSING!'],
  drop: ['BEHOLD THE DROP! SCREAM IF THOU MUST!', 'AND NOW... DOWN!'],
  tunnel: ['INTO THE MOUNTAIN! MIND THE DARK!', 'BEHOLD! A REAL FAKE MOUNTAIN!'],
  splash: ['PREPARE TO GET WET! OR DEAD!', 'THE LAGOON APPROACHES! SPLASH ZONE!'],
  loop: {
    bolt: ['A LOOP ON THE LIGHTNING TRACK! HOLD ON!', 'THE LIGHTNING DRAGON LOOPS! HOLD ON TO THY RAIL!'],
    fire: ['A LOOP ON THE FIRE TRACK! HOLD ON!', 'THE FIRE DRAGON LOOPS! HOLD ON TO THY RAIL!'],
    ice: ['A LOOP ON THE ICE TRACK! HOLD ON!', 'THE ICE DRAGON LOOPS! HOLD ON TO THY RAIL!'],
  } as ByOdd,
  cork: {
    bolt: ['THE LIGHTNING TRACK CORKSCREWS! HOLD ON!'],
    fire: ['THE FIRE TRACK CORKSCREWS! HOLD ON!'],
    ice: ['THE ICE TRACK CORKSCREWS! HOLD ON!'],
  } as ByOdd,
  /** Two lanes looping, by the one that doesn't. */
  loop2: {
    bolt: ['THE FIRE AND ICE TRACKS LOOP! ONLY LIGHTNING RUNS STRAIGHT!'],
    fire: ['THE LIGHTNING AND ICE TRACKS LOOP! ONLY FIRE RUNS STRAIGHT!'],
    ice: ['THE LIGHTNING AND FIRE TRACKS LOOP! ONLY ICE RUNS STRAIGHT!'],
  } as ByOdd,
  cork2: {
    bolt: ['THE FIRE AND ICE TRACKS CORKSCREW! ONLY LIGHTNING RUNS STRAIGHT!'],
    fire: ['THE LIGHTNING AND ICE TRACKS CORKSCREW! ONLY FIRE RUNS STRAIGHT!'],
    ice: ['THE LIGHTNING AND FIRE TRACKS CORKSCREW! ONLY ICE RUNS STRAIGHT!'],
  } as ByOdd,
  chain: {
    bolt: ['THE FIRE AND ICE LOOPS RUN THROUGH EACH OTHER! HOLD ON!'],
    fire: ['THE LIGHTNING AND ICE LOOPS RUN THROUGH EACH OTHER! HOLD ON!'],
    ice: ['THE LIGHTNING AND FIRE LOOPS RUN THROUGH EACH OTHER! HOLD ON!'],
  } as ByOdd,
  braid: ['ALL THREE TRACKS TWIST TOGETHER! HOLD ON, ALL OF YE!', 'THE TRIPLE HELIX! NO DRAGON ESCAPES IT! HOLD ON!'],
  chain3: ['THE GRAND FINALE! ALL THREE LOOP! HOLD ON!', 'THREE LOOPS AT ONCE! HOLD ON TO THY RAIL!'],
  unload: ['THANK THEE FOR RIDING TRUELLING TRAGONS. EXIT TO THY RIGHT.', 'THE RIDE HATH ENDED. TAKE THY BELONGINGS. AND THY LIMBS.'],
};

export const PIPER_T = {
  start: ["TRIAL TWO, SWEETIE. HANG ON. OR DON'T. I LIKE BOTH.", 'NO SEATS. NO BELTS. JUST YOU AND THE DROP.'],
  gap: ['OOPS. I HAD SOME BOLTS TAKEN OUT. FOR FUN.', 'THE TRACK? I NEVER SAID IT WAS FINISHED.'],
  loop: ['MMM. UPSIDE DOWN. LET GO. JUST A LITTLE.', 'IF YOU FALL, FALL PRETTY.', "I PAID EXTRA FOR THE LOOPS. DON'T WASTE THEM."],
  mid: ['STILL ON? I HAD A BET ON THE MOUNTAIN.', 'THE LAST GUY LASTED HALF THIS LONG. I MISS HIM.'],
  late: ['THE FINALE. I GET SO WARM WHEN THEY LET GO.', "ALL THREE LOOPS, SWEETIE. I'LL BE WATCHING YOUR HANDS."],
  end: ['STILL ALIVE? MMM. COME UP TO THE CASTLE.', "TRIAL TWO IS OVER. I'M SO WARM RIGHT NOW."],
};

// ---------------------------------------------------------------------------------------------------------------
// The suitors at the unload (off the train ahead of his: glimpsed, having their say, out the exit)

export const RIVAL_UNLOAD: Record<'blake' | 'rafael' | 'hank', ByPants> = {
  blake: {
    clean: ['BRO. I PUKED IN MY HELMET. I HAVE NO HELMET.', 'YOU MADE IT? LAME, BRO.'],
    shitty: ['DUDE. WE COULD SMELL YOU FROM THE LOOPS.', 'BRO. YOU SHAT ON A DRAGON.'],
    nude: ['BRO. WE SAW EVERYTHING. EVERY LOOP.', 'PUT IT AWAY, BRO. IT WAVED AT ME.'],
  },
  rafael: {
    clean: ['I RODE IT TWICE. I CRIED ONCE.', 'MY HAIR. LOOK WHAT IT DID TO MY HAIR.'],
    shitty: ['YOU RODE LIKE A FLAG OF FILTH.', 'THE SMELL REACHED US IN THE MOUNTAIN.'],
    nude: ['NAKED THROUGH THE LOOPS. HOW DESPERATE.', 'I SAW IT SWING. I CANNOT UNSEE IT.'],
  },
  hank: {
    clean: ['HANK LOVE DRAGON. HANK GO AGAIN.', 'HANK THROW UP TURKEY LEG.'],
    shitty: ['LITTLE MAN SHIT ON RIDE. HANK LAUGH.', 'HANK SMELL LITTLE MAN.'],
    nude: ['LITTLE MAN NAKED ON DRAGON. HANK SAW.', 'HANK SEE TOO MUCH.'],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him (each its own source), the death screen when it kills him (28 characters at most)

export const HURT: HurtTable = {
  'm2:fa_track_fire': { hurt: ['NO TRACK! NO TRACK!', 'WE ARE GOING DOWN!'], death: ['DEEP FRIED DRAGON RIDER', 'CHARRED ON THE FIRE DRAGON', 'WELL DONE. EXTRA CRISPY'] },
  'm2:fa_track_ice': { hurt: ['NO TRACK! NOT THE ICE!', 'ICE! ICE! ICE!'], death: ['SHATTERED LIKE A POPSICLE', 'MEATHEAD ON THE ROCKS'] },
  'm2:fa_track_bolt': { hurt: ['THE RAIL IS LIVE!', 'ZAP! ZAP! ZAAAP!'], death: ['RODE THE LIGHTNING. ONCE', 'ELECTROCUTED, THEN DROPPED'] },
  'm2:fa_flung': { hurt: ['MY HANDS SLIPPED!', 'I LET GO! I LET GO!'], death: ["DIDN'T HOLD ON", 'FLUNG OFF THE LOOP', 'LET GO AT THE TOP'] },
  'm2:fa_fell_ride': { hurt: ['WHOA WHOA WHOA!', 'I FELL OFF THE DRAGON!'], death: ['FELL OFF A DRAGON', "DIDN'T KEEP ARMS INSIDE"] },
  'm2:fa_breath': { hurt: ['DRAGON BREATH! IN MY FACE!', 'MY EYEBROWS!'], death: ['KILLED BY DRAGON BREATH', 'BREATHED ON TO DEATH'] },
  'm2:fa_ring': { hurt: ["MY HAIR'S ON FIRE!", 'FLAMING HOOP! TO THE FACE!'], death: ['THROUGH THE RING OF FIRE', 'BURNED LIKE A CIRCUS LION'] },
  'm2:fa_jet': { hurt: ['FIRE UP MY LEGS!', 'MY ASS IS ON FIRE!'], death: ['ROASTED FROM THE FEET UP', 'FLAME JET TO THE CROTCH'] },
  'm2:fa_fireball': { hurt: ['FIREBALL! FIREBALL!', 'THE DRAGON SPIT ON ME!'], death: ['HIT BY A DRAGON FIREBALL', 'CHARBROILED ON A COASTER'] },
  'm2:fa_icicles': { hurt: ['ICICLES! IN MY FACE!', 'BRAIN FREEZE! A REAL ONE!'], death: ['ICICLE THROUGH THE SKULL', 'STABBED BY AN ICICLE'] },
  'm2:fa_icebar': { hurt: ['MY SHINS! FROZEN BAR!', 'TRIPPED ON A BAR OF ICE!'], death: ['CLOTHESLINED BY ICE', 'SHINS VS ICE. ICE WON'] },
  'm2:fa_snowball': { hurt: ['SNOWBALL! WITH A ROCK IN IT!', 'IN THE FACE! COLD!'], death: ['KILLED BY A SNOWBALL', 'SNOWBALLED TO DEATH'] },
  'm2:fa_arc': { hurt: ['ZAPPED IN THE HEAD!', 'MY FILLINGS! MY FILLINGS!'], death: ['FRIED BY A TESLA GATE', 'ELECTROCUTED ON A RIDE'] },
  'm2:fa_strike': { hurt: ['STRUCK BY LIGHTNING!', 'THE SKY HIT ME!'], death: ['STRUCK BY FAKE LIGHTNING', 'HE WAS THE LIGHTNING ROD'] },
  'm2:fa_live_rail': { hurt: ["THE DRAGON'S LIVE! MY FEET!", 'ZAP! ZAP! ZAP!'], death: ['ELECTRIC DRAGON. CRISPY', 'GROUNDED. FOR GOOD'] },
};

const odd = (o: ByOdd) => [...o.bolt, ...o.fire, ...o.ice];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...[LOAD, BOARD, NO_GUNS, FIRST_GAP, HOPPED, NEAR, DROP, LOOP_SEE, LOOP_IN, CORK_IN, BRAID, LOOP_OUT, SLIP, TUNNEL, SPLASH, ARRIVE, CLOSED].flatMap(allOf),
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [SPIEL_VOICE]: [
    ...SPIEL.board, ...SPIEL.welcome, ...SPIEL.rules, ...SPIEL.remain, ...Object.values(SPIEL.out).flat(), ...Object.values(SPIEL.safe).flat(),
    ...SPIEL.spare, ...SPIEL.near, ...SPIEL.drop, ...SPIEL.tunnel, ...SPIEL.splash,
    ...odd(SPIEL.loop), ...odd(SPIEL.cork), ...odd(SPIEL.loop2), ...odd(SPIEL.cork2), ...odd(SPIEL.chain), ...SPIEL.braid, ...SPIEL.chain3, ...SPIEL.unload,
  ],
  [PIPER_PA_VOICE]: Object.values(PIPER_T).flat(),
  [RIVAL_VOICES.blake]: allOf(RIVAL_UNLOAD.blake),
  [RIVAL_VOICES.rafael]: allOf(RIVAL_UNLOAD.rafael),
  [RIVAL_VOICES.hank]: allOf(RIVAL_UNLOAD.hank),
};
