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
  clean: ["THREE DRAGONS. NO SEATBELTS. WHO'S THE LAWYER HERE?", "A COASTER. AND I DIDN'T EVEN PAY."],
  shitty: ['A ROLLER COASTER. IN SHIT PANTS. GREAT.', "SOMEBODY'S GONNA HOSE THIS DRAGON OFF TONIGHT."],
  nude: ['A COASTER. NAKED. WHAT COULD GO WRONG.', 'NO PANTS. NO LAP BAR. MY BALLS ON COLD STEEL.'],
};
/** Off it goes. */
export const BOARD: ByPants = {
  clean: ['NO SEAT. JUST A RAIL. AWESOME.', 'HOLD ON TO WHAT? HIS SCALY DICK?'],
  shitty: ['RIDING A DRAGON IN SHIT PANTS. CLASSY.', "SORRY, NEXT GUY. IT'S WARM FOR A REASON."],
  nude: ['NAKED ON A COASTER. WIND IN MY EVERYTHING.', 'MY BALLS ARE DOING A HUNDRED MILES AN HOUR.'],
};
/** Fire pressed on the ride (no guns here). */
export const NO_GUNS: ByPants = {
  clean: ["CAN'T SHOOT. BOTH HANDS ARE BUSY NOT DYING.", "LET GO OF THE RAIL TO SHOOT? I'M AN IDIOT, NOT A DEAD IDIOT."],
  shitty: ["CAN'T SHOOT. TOO BUSY CLENCHING.", 'NO GUNS. MY ASS IS DOING THE SHOOTING.'],
  nude: ["NO GUNS. JUST THE ONE. AND IT'S FLAPPING.", 'HANDS ON THE RAIL. NOT ON MY DICK.'],
};
/** The track out ahead of him, the first time. */
export const FIRST_GAP: ByPants = {
  clean: ["THE TRACK! IT'S GONE!", 'WHO THE FUCK BUILT HALF A COASTER?'],
  shitty: ['NO TRACK! THERE GOES MORE SHIT!', "THE TRACK'S GONE! SO ARE MY BOWELS!"],
  nude: ['NO TRACK! MY BALLS JUST CRAWLED UP!', "TRACK'S OUT! EVERYTHING'S FLAPPING!"],
};
/** Over to another car (the first time; now and then after). */
export const HOPPED: ByPants = {
  clean: ['DRAGON HOP!', 'NEW DRAGON. SAME SHITTY CHOICES.', "MIND THE GAP, ASSHOLE. THAT'S ME. I'M THE ASSHOLE."],
  shitty: ['HOP! SOMETHING SLOSHED.', 'NEW DRAGON. SORRY ABOUT THE SEAT.'],
  nude: ['HOP! MY BALLS SLAPPED MY THIGHS.', 'LEAP OF FAITH. DICK FIRST.'],
};
/** The lanes closing right in (a near miss). */
export const NEAR: ByPants = {
  clean: ["WHOA! I SAW HIS DRAGON'S FILLINGS!", 'TOO CLOSE! TOO CLOSE!'],
  shitty: ['TOO CLOSE! A LITTLE CAME OUT!', 'THAT ONE SQUEEZED A LITTLE OUT.'],
  nude: ['CLOSE! ALMOST LOST MY DICK!', 'THAT DRAGON NEARLY CLIPPED MY BALLS!'],
};
/** Over the top of a big drop. */
export const DROP: ByPants = {
  clean: ['OH NO. OH NO NO NO.', 'MOMMY. MOMMY. MOMMY.', "THAT'S NOT A DROP! THAT'S A SUICIDE!"],
  shitty: ['HERE COMES THE REST OF IT!', 'MY ASS IS LEAVING WITHOUT ME!'],
  nude: ['MY BALLS ARE IN MY THROAT!', 'EVERYTHING IS FLAPPING UP!'],
};
/** A loop coming on his track (its warning). */
export const LOOP_SEE: ByPants = {
  clean: ['A LOOP? THERE IS NO SEAT!', "UPSIDE DOWN? I'M STANDING ON IT!"],
  shitty: ['A LOOP. EVERYBODY BELOW, OPEN UMBRELLAS.', 'UPSIDE DOWN IN THESE PANTS? OH GOD.'],
  nude: ["UPSIDE DOWN AND NAKED. SOMEBODY'S GETTING A FREE SHOW.", 'A LOOP. MY BALLS ARE GONNA SLAP MY FACE.'],
};
/** Into a loop, hanging on (screaming). */
export const LOOP_IN: ByPants = {
  clean: ['AAAAAAAH!', 'SHIT SHIT SHIT SHIT!', 'JESUS! JESUS! JESUS!', 'I HATE THIS RIDE! I HATE MY LIFE!'],
  shitty: ["IT'S COMING OUT MY CUFFS!", 'SHIT! LITERALLY! EVERYWHERE!'],
  nude: ['MY BALLS! MY BALLS!', 'MY NUTS ARE SLAPPING MY CHIN!'],
};
/** Into a corkscrew. */
export const CORK_IN: ByPants = {
  clean: ['WHICH WAY IS UP?!', "I'M GONNA PUKE!"],
  shitty: ['SHIT IN MY HAIR NOW!', "I'M A SHIT SPRINKLER!"],
  nude: ['MY DICK IS A PROPELLER!', 'MY BALLS ARE TWISTING!'],
};
/** Into the triple helix (all three). */
export const BRAID: ByPants = {
  clean: ['ALL THREE?! NO WAY AROUND IT!', 'WHO DESIGNED THIS? WHO HATES PEOPLE THIS MUCH?'],
  shitty: ['ALL THREE. NOWHERE TO HIDE THIS SMELL.', "SHIT TORNADO! I'M THE SHIT!"],
  nude: ["ALL THREE. MY DICK'S GONNA WRAP AROUND MY LEG.", 'MY DICK IS GONNA TIE IN A KNOT!'],
};
/** Out of a loop, still on (now and then). */
export const LOOP_OUT: ByPants = {
  clean: ['STILL HERE. BARELY.', "MY HANDS. I CAN'T FEEL MY HANDS.", 'I PISSED. JUST A LITTLE. A LOT.'],
  shitty: ['THAT WENT IN MY EAR.', 'WHOEVER RIDES BEHIND ME, SORRY.'],
  nude: ['STILL GOT MY BALLS. COUNTED TWICE.', "ALIVE. MY ASSHOLE'S INSIDE OUT, BUT ALIVE."],
};
/** Losing his grip (not holding down, in a loop: a moment before he's gone). */
export const SLIP: ByPants = {
  clean: ['MY GRIP! MY GRIP!', 'NO NO NO NO! FUCK!'],
  shitty: ["SLIPPING! IT'S GREASY! IT'S MINE!", 'SHIT HANDS! SHIT HANDS!'],
  nude: ['SWEATY HANDS! SWEATY EVERYTHING!', 'SWEATY BALLS ON A RAIL! SLIPPING!'],
};
/** Into the fake mountain, in the dark. */
export const TUNNEL: ByPants = {
  clean: ['A FAKE MOUNTAIN. THEY BUILT IT FROM CHICKEN WIRE AND LIES.', "I CAN'T SEE SHIT!"],
  shitty: ['DARK. GOOD. NOBODY SEES MY PANTS.', "IT'S DARK AND IT SMELLS LIKE A DIAPER GENIE."],
  nude: ['DARK. AT LEAST NOBODY SEES MY DICK.', 'DARK AND COLD. MY DICK WENT IN LIKE A TURTLE.'],
};
/** The splashdown. */
export const SPLASH: ByPants = {
  clean: ['WATER! IN MY EVERYTHING!', 'IT WENT UP MY NOSE! AND MY ASS!'],
  shitty: ['WELL. THAT WASHED SOME OF IT OFF.', 'SOMEBODY IN THE SPLASH ZONE GOT A SURPRISE.'],
  nude: ['COLD WATER! IT WENT UP INSIDE!', 'SHRINKAGE! IT WAS COLD!'],
};
/** Pulled into the unload. */
export const ARRIVE: ByPants = {
  clean: ['STILL ALIVE. PIPER, PUT ON SOMETHING SLUTTY.', "I WANT TO GO AGAIN. NO I DON'T."],
  shitty: ['RIDE OVER. PANTS OVER TOO.', 'MADE IT. A POUND OF ME STAYED ON THE LOOPS.'],
  nude: ["RIDE'S OVER. I'M STILL HARD. FEAR BONER.", "TRIAL TWO DONE. MY DICK'S WINDBURNED."],
};
/** Back on a revisit: the ride's closed. */
export const CLOSED: ByPants = {
  clean: ['CLOSED. NOT MY FAULT. A LITTLE MY FAULT.', "TRACK DAMAGE. I'M SURE THEY'LL SUE THE DRAGON."],
  shitty: ['CLOSED. PROBABLY CLEANING MY SEAT.', "CLOSED. A HAZMAT GUY'S IN THERE WITH A MOP."],
  nude: ['CLOSED. THEY FOUND MY BALL PRINTS.', "CLOSED. THEY'RE SCRAPING ASS PRINTS OFF A DRAGON."],
};

// ---------------------------------------------------------------------------------------------------------------
// The spiel (the ride's herald) and Piper on the PA

/** By the lane that's left out (two looping: the third's the way round). */
type ByOdd = { bolt: string[]; fire: string[]; ice: string[] };

export const SPIEL = {
  board: ['HEAR YE! PICK THY DRAGON. ANY DRAGON. THERE ARE NO SEATS.', 'BRAVE KNIGHT! STEP ABOARD. SIGN NOTHING. GRIP THE RAIL.'],
  welcome: ['HEAR YE! WELCOME TO TRUELLING TRAGONS! THREE DRAGONS! NO SEATS!', 'HARK! THREE DRAGONS. NO LAP BARS. LEGAL SAID NO. WE DID IT ANYWAY.'],
  rules: ['THROUGH THE LOOPS, HOLD ON TO THE RAIL. OR DO NOT. ONCE.', 'KEEP THY HANDS ON THE RAIL THROUGH THE LOOPS. ALL OF THEM.'],
  remain: ['PLEASE REMAIN ON THE DRAGON AT ALL TIMES!', 'SIR! GET BACK ON THE DRAGON, YOU FUCKING IDIOT!'],
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
  spare: ['A SPARE DRAGON HATH BEEN DISPATCHED. GOD SPEED, DUMBASS.', 'REPLACEMENT DRAGON INBOUND. PLEASE HOLD.'],
  near: ['BEHOLD! THE DRAGONS MEET HEAD ON! MIND THY HEADS!', 'MIND THY HEADS! DRAGONS PASSING!'],
  drop: ['BEHOLD THE DROP! SCREAM IF THOU MUST!', 'AND NOW... SHIT THYSELF!'],
  tunnel: ['INTO THE MOUNTAIN! MIND THE DARK!', 'BEHOLD! A REAL FAKE MOUNTAIN! NINE MILLION DOLLARS!'],
  splash: ["PREPARE TO GET WET! IT'S MOSTLY WATER!", 'THE LAGOON APPROACHES! SPLASH ZONE!'],
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
  unload: ['THANK THEE FOR RIDING TRUELLING TRAGONS. EXIT TO THY RIGHT.', 'THE RIDE HATH ENDED. CHECK THY PANTS. TAKE THY LIMBS.'],
};

export const PIPER_T = {
  start: ["TRIAL TWO, SWEETIE. HANG ON. OR DON'T. I LIKE BOTH.", 'NO SEATS. NO BELTS. I SIGNED THE WAIVER FOR YOU.'],
  gap: ['OOPS. I HAD SOME BOLTS TAKEN OUT. FOR FUN.', 'THE TRACK? THE CONTRACTOR TOOK MY MONEY AND RAN.'],
  loop: ['MMM. UPSIDE DOWN. LET GO. JUST A LITTLE.', 'IF YOU FALL, SCREAM. I LIKE THE SCREAMING.', "I PAID EXTRA FOR THE LOOPS. DON'T WASTE THEM."],
  mid: ['STILL ON? I HAD TWENTY BUCKS ON THE MOUNTAIN.', 'THE LAST GUY LASTED HALF THIS LONG. THEY ALL DO.'],
  late: ['THE FINALE. I GET SO WARM WHEN THEY LET GO.', "ALL THREE LOOPS, SWEETIE. I'LL BE WATCHING YOUR HANDS."],
  end: ["STILL ALIVE? MMM. I'LL HAVE TO TRY HARDER.", "TRIAL TWO IS OVER. I'M SO WARM RIGHT NOW."],
};

// ---------------------------------------------------------------------------------------------------------------
// The suitors at the unload (off the train ahead of his: glimpsed, having their say, out the exit)

export const RIVAL_UNLOAD: Record<'blake' | 'rafael' | 'hank', ByPants> = {
  blake: {
    clean: ['BRO. I PUKED IN MY HELMET. I HAVE NO HELMET.', 'YOU MADE IT? BULLSHIT, BRO. TOTAL BULLSHIT.'],
    shitty: ['DUDE. WE COULD SMELL YOU FROM THE LOOPS.', 'BRO. YOU SHAT ON A DRAGON.'],
    nude: ['BRO. WE SAW EVERYTHING. EVERY LOOP.', 'PUT IT AWAY, BRO. IT WAVED AT ME. I WAVED BACK.'],
  },
  rafael: {
    clean: ['I RODE IT TWICE. I CRIED ONCE.', 'MY HAIR. I LOOK LIKE A GUY WHO SELLS CARS.'],
    shitty: ['YOU RODE LIKE A WET FART IN A WIND TUNNEL.', 'THE SMELL REACHED US IN THE MOUNTAIN.'],
    nude: ['NAKED THROUGH THE LOOPS. HOW DESPERATE.', 'I SAW IT SWING. LIKE A FROZEN PEA ON A STRING.'],
  },
  hank: {
    clean: ['HANK LOVE DRAGON. HANK GO AGAIN.', 'HANK THROW UP TURKEY LEG.'],
    shitty: ['LITTLE MAN SHIT ON RIDE. HANK LAUGH.', 'HANK SMELL LITTLE MAN. HANK GONNA BARF AGAIN.'],
    nude: ['LITTLE MAN NAKED ON DRAGON. HANK SAW.', 'HANK SEE LITTLE MAN DINGUS. HANK SAD.'],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him (each its own source), the death screen when it kills him (28 characters at most)

export const HURT: HurtTable = {
  'm2:fa_track_fire': { hurt: ['NO TRACK! NO TRACK!', "WE'RE GONNA DIE ON A FAIRY RIDE!"], death: ['DEEP FRIED DRAGON RIDER', 'CHARRED ON THE FIRE DRAGON', 'WELL DONE. EXTRA CRISPY'] },
  'm2:fa_track_ice': { hurt: ['NO TRACK! NOT THE ICE!', 'MY ASS IS FROZEN TO THE DRAGON!'], death: ['SHATTERED LIKE A POPSICLE', 'MEATHEAD ON THE ROCKS'] },
  'm2:fa_track_bolt': { hurt: ['THE RAIL IS LIVE!', 'ZAP! ZAP! ZAAAP!'], death: ['RODE THE LIGHTNING. ONCE', 'ELECTROCUTED, THEN DROPPED'] },
  'm2:fa_flung': { hurt: ['MY HANDS SLIPPED!', 'I LET GO! STUPID! STUPID!'], death: ["DIDN'T HOLD ON", 'FLUNG OFF THE LOOP', 'LET GO AT THE TOP'] },
  'm2:fa_fell_ride': { hurt: ['WHOA WHOA WHOA!', 'I FELL OFF THE DRAGON!'], death: ['FELL OFF A DRAGON', "DIDN'T KEEP ARMS INSIDE"] },
  'm2:fa_breath': { hurt: ['DRAGON BREATH! IN MY FACE!', 'MY EYEBROWS! THEY GREW BACK FOR THIS!'], death: ['KILLED BY DRAGON BREATH', 'BREATHED ON TO DEATH'] },
  'm2:fa_ring': { hurt: ["MY HAIR'S ON FIRE!", 'FLAMING HOOP! TO THE FACE!'], death: ['THROUGH THE RING OF FIRE', 'BURNED LIKE A CIRCUS LION'] },
  'm2:fa_jet': { hurt: ['FIRE UP MY LEGS!', 'MY ASS IS ON FIRE!'], death: ['ROASTED FROM THE FEET UP', 'FLAME JET TO THE CROTCH'] },
  'm2:fa_fireball': { hurt: ['FIREBALL! FIREBALL!', 'THE DRAGON SPIT A FIREBALL IN MY CROTCH!'], death: ['HIT BY A DRAGON FIREBALL', 'CHARBROILED ON A COASTER'] },
  'm2:fa_icicles': { hurt: ['ICICLES! IN MY FACE!', 'BRAIN FREEZE! A REAL ONE!'], death: ['ICICLE THROUGH THE SKULL', 'STABBED BY AN ICICLE'] },
  'm2:fa_icebar': { hurt: ['MY SHINS! FROZEN BAR!', 'TRIPPED ON A BAR OF ICE!'], death: ['CLOTHESLINED BY ICE', 'SHINS VS ICE. ICE WON'] },
  'm2:fa_snowball': { hurt: ['SNOWBALL! WITH A ROCK IN IT!', 'THERE WAS A FUCKING ROCK IN IT!'], death: ['KILLED BY A SNOWBALL', 'SNOWBALLED TO DEATH'] },
  'm2:fa_arc': { hurt: ['ZAPPED IN THE HEAD!', 'MY FILLINGS! MY FILLINGS!'], death: ['FRIED BY A TESLA GATE', 'ELECTROCUTED ON A RIDE'] },
  'm2:fa_strike': { hurt: ['STRUCK BY LIGHTNING!', 'GOD HATES ME! OR CORPORATE!'], death: ['STRUCK BY FAKE LIGHTNING', 'HE WAS THE LIGHTNING ROD'] },
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
