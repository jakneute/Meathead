// What's said in the secret warehouse (the director in the burst-in, the film crew, the AD on the stage's bullhorn, the
// public at the fallen walls, THE ENSEMBLE CAST, the studio exec), by voice (recorded with the rest: hollywood/voices.ts
// gathers these; tools/voices). In the user's voice (hollywood-spec.md): blunt, short, vulgar; pick lines with pickLine;
// clean / shitty / naked pools where people react to him, and for every one of the sub-boss's line groups. The hurt and
// death lines for every new way he's hurt here are here too (registered in kinds.ts).
//
// The movie (the user's): REVENGERS: END-OF-THE-WORLD'S-DAY. Its tagline: REVENGERS: RESEMBLE.

import type { ByPants } from '../blvd/lines';
import { GUEST_VOICES } from '../coaster/lines';
export { GUEST_VOICES };

/** The movie's name, as the director says it (and the set's signs show it). */
export const MOVIE = "REVENGERS: END-OF-THE-WORLD'S-DAY";

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** The burst-in: down through the roof onto a movie set; the director wants to know who the fuck he is. He hasn't a
 *  clue what the fuss is. */
export const BURST_WHAT = ['WHAT IS THIS, A PORNO?', 'WHERE AM I? IS THIS THE GIFT SHOP?'];
export const BURST_NEVER = ['NEVER HEARD OF IT.', 'NOPE. IS IT A PORNO?'];
/** The walls down, the crew coming: he still doesn't get it. */
export const BURST = ['ALL THIS OVER A MOVIE I NEVER HEARD OF.', 'OKAY. KILLING MOVIE PEOPLE. FINE.'];
/** Launched in again (a revisit: the lever's still on): down through his own hole in the roof. */
export const BACK_AGAIN = ['SAME HOLE. SAME SHITTY MOVIE.', 'THE TRAIN KEEPS BRINGING ME HERE. FINE.'];
/** Along the way, passing each (once each). */
export const GAG_LINES: Record<'rooftop' | 'abyss' | 'craft' | 'steve' | 'mothership' | 'pyro' | 'newyork' | 'refill', string[]> = {
  rooftop: ['A CITY PAINTED ON PLYWOOD. BY A GUY WHO HATES CITIES.', "GREEN SCREEN. THEY'LL PAINT IN SOMETHING WORSE LATER."],
  abyss: ['A BOTTOMLESS PIT. ON A SOUNDSTAGE. WHO SIGNED OFF ON THIS?', 'THE ABYSS. PAINTED GREEN. SO THEY CAN ADD A WORSE ABYSS LATER.'],
  craft: ["CRAFT SERVICES. THE ONLY REASON ANYBODY'S IN MOVIES.", "FREE DONUTS. I'M EATING THE DIRECTOR'S."],
  steve: ["STUNTMAN STEVE'S HEADSHOT. AVAILABLE FOR WORK. NO SHIT.", "STEVE'S HEADSHOT ON THE BOARD. NOBODY'S CALLED HIM SINCE 1986."],
  mothership: ['AN ALIEN MOTHERSHIP. MADE OF GREEN SHEETS AND A LEAF BLOWER.', 'THE SPACESHIP HAS A FIRE EXIT SIGN.'],
  pyro: ['REAL FIRE FOR A FAKE SPACESHIP. GREAT.', "HOT SET. THEY MEAN IT."],
  newyork: ['NEW NEW YORK. THEY BLOW IT UP EVERY MOVIE. IT NEVER LEARNS.', 'A FAKE TAXI IN A FAKE CITY. THE MOST REAL THING IN THIS MOVIE.'],
  refill: ["PRINCIPAL CAST ONLY. I'M VERY PRINCIPAL.", 'A BUFFET BEFORE THE BIG FIGHT. THEY KNOW WHAT I LIKE.'],
};
/** The main stage: the script in its case, at the back (coming in). */
export const CASE = ['THE SCRIPT. IN A GLASS CASE. LIT LIKE JESUS.', "A LASER GRID AROUND A SCRIPT. IT'S A FUCKING BOOK."];
/** CAPTAIN AMERICANO's piece said: his answer. */
export const CAP_REPLY = ["THAT'S NOT HOW IT WORKS.", "YOU'RE A GUY IN PAJAMAS."];
/** The rest of them coming down (once). */
export const CAST_ARRIVE = ['OH LOOK. MORE PAJAMA PEOPLE.', "MOVIE STARS. I'VE NEVER KILLED A MOVIE STAR. TODAY I KILL ALL OF THEM."];
/** One of them dead (now and then). */
export const KILL_QUIPS = ["NOW THAT'S A DEATH SCENE.", 'NO STUNT DOUBLE.', 'BOX OFFICE POISON.', 'CUT. PRINT IT.', "THAT'S A WRAP ON YOU.", 'RECAST THAT ONE.'];
/** Half of them dead. */
export const HALF = ["HALF THE CAST. THE SEQUEL'S GONNA BE CHEAP.", 'HALF DOWN. THE POSTER JUST GOT A LOT EMPTIER.'];
/** The last one standing. */
export const LAST = ['ONE LEFT. THE ONE NOBODY KNOWS THE NAME OF.', "LAST ONE. YOU'RE THE LEAD NOW. CONGRATULATIONS."];
/** The last one dead (the user's line, word for word). */
export const CLEAN_UP = 'BETTER CLEAN UP THE BODIES.';
/** Hopping down off the bulldozer in the lot, after the exec's meltdown: he cares about neither. */
export const SHRUG = ["THEY DIED. IT LEAKED. I'M HUNGRY.", "I DIDN'T READ IT. I DON'T READ."];

// ---------------------------------------------------------------------------------------------------------------
// The director, in the burst-in (the crew's director's voice): a civilian on the secret set; he panics; he thinks
// about buying him or burying him; the walls go; KILL THEM ALL

export const DIR_WHO: ByPants = {
  clean: ['CUT! CUT! WHO THE FUCK ARE YOU?', 'CUT! A CIVILIAN! THROUGH MY FUCKING ROOF!'],
  shitty: ['CUT! WHO THE FUCK IS THAT? AND WHAT IS THAT SMELL?', 'CUT! A CIVILIAN! THROUGH MY ROOF! IN SHITTY PANTS!'],
  nude: ['CUT! A NAKED CIVILIAN! THROUGH MY FUCKING ROOF!', 'CUT! WHO IS THAT? AND WHERE ARE HIS PANTS?'],
};
/** He assumes everybody knows it, and everybody's hyped. */
export const DIR_TITLE: ByPants = {
  clean: [`THIS IS ${MOVIE}! THE BIGGEST TEAM-UP EVER! YOU'VE SEEN THE TRAILER!`, `${MOVIE}! THIRTY STARS! YOU KNOW THIS! EVERYBODY KNOWS THIS!`],
  shitty: [`THIS IS ${MOVIE}! YOU KNOW THIS! AND YOU SHIT ON IT!`, `${MOVIE}! EVERYBODY KNOWS IT! NOBODY SHITS ON IT!`],
  nude: [`THIS IS ${MOVIE}! YOU KNOW THIS! PUT IT AWAY!`, `${MOVIE}! EVERYBODY KNOWS IT! NOBODY'S DICK IS IN IT!`],
};
/** The secret: shot at Happy Land, of all places, for the taxes; Area 51. */
export const DIR_SECRET: ByPants = {
  clean: ["WE'RE SHOOTING IT AT HAPPY LAND. CHEAPEST LOT IN AMERICA. TAX WRITE-OFF. NOBODY CAN KNOW.", "IT'S A SECRET SHOOT! IN HAPPY LAND! IT'S CHEAPER HERE! THIS IS AREA 51 SHIT!"],
  shitty: ["IT'S A SECRET SHOOT. IN HAPPY LAND. IT WAS CHEAPER. NOW IT SMELLS LIKE SHIT.", "NOBODY KNOWS WE'RE HERE! IT'S CHEAPER! AREA 51 SHIT! YOUR SHIT!"],
  nude: ["IT'S A SECRET SHOOT. IN HAPPY LAND. IT WAS CHEAPER. NOW A NAKED MAN KNOWS.", "NOBODY CAN KNOW WE'RE HERE! AREA 51! AND YOU'RE NAKED IN AREA 51!"],
};
/** Buy him or bury him (thinking it over: the walls go while he does). */
export const DIR_PONDER: ByPants = {
  clean: ['OKAY. OKAY. WE PAY HIM OFF. OR WE KILL HIM. WHICH IS CHEAPER?', 'WE COULD BRIBE HIM. OR BURY HIM. LEGAL, WHAT COSTS LESS?'],
  shitty: ['WE BRIBE HIM. OR WE KILL HIM. KILLING HIM SMELLS CHEAPER.', 'BRIBE HIM? BURY HIM? NOBODY WANTS TO TOUCH HIM. HMM.'],
  nude: ['WE BRIBE HIM. HE HAS NO POCKETS. SO WE KILL HIM?', 'BRIBE HIM? BURY HIM? WE COULD BURY HIM. HE CAME DRESSED FOR IT.'],
};
// ---------------------------------------------------------------------------------------------------------------
// The producer, on the set before the crash (his own voice): a control freak laying down the law to the cast and crew.
// Then the throne-train comes down through the roof on him.

export const PRODUCER_VOICE = 'm2.hollywood.producer';
/** Warming up (one of these first). */
export const PROD_RULES = [
  'NO PHONES. NO PICTURES. NO TALKING TO EACH OTHER. NO TALKING TO ME.',
  'YOU EAT IN HERE. YOU SHIT IN HERE. NOBODY LEAVES THIS BUILDING.',
];
/** Then (the user's line, word for word). */
export const PROD_ASSASSIN = "IF YOU TELL YOUR FRIENDS OR FAMILY WHAT YOU'RE WORKING ON, I'LL SEND AN ASSASSIN TO YOUR HOME.";

/** The walls down, the whole public looking in (the user's line, word for word). */
export const DIR_KILL = 'KILL THEM ALL! THEY CANNOT KNOW!';

// ---------------------------------------------------------------------------------------------------------------
// The public, at the fallen walls (the park's guests' voices)

export const CROWD_GASP: ByPants = {
  clean: ["OH MY GOD. IS THAT THE REVENGERS?", "THEY'RE FILMING REVENGERS IN THERE! IN SECRET!", "THEY'RE SHOOTING IT HERE TO SAVE MONEY! I KNEW IT!"],
  shitty: ['IT\'S THE REVENGERS! AND A MAN WHO SHIT HIMSELF!', 'THE SMELL GOT OUT BEFORE THE WALLS DID.'],
  nude: ['THE REVENGERS! AND A NAKED GUY!', "IS HE IN THE MOVIE? HE'S NOT WEARING THE MOVIE."],
};
/** The script's pages flying out to them (the leak). */
export const CROWD_PAGES: ByPants = {
  clean: ["FREE PAGES! IT'S THE SCRIPT!", 'I GOT THE ENDING! THEY ALL RESEMBLE!', 'FORGET THE BODIES! GRAB A PAGE!'],
  shitty: ['THE PAGES SMELL LIKE HIM! STILL WORTH IT!', "IT'S GOT SHIT ON IT! I'M FRAMING IT!"],
  nude: ['THE NAKED GUY LEAKED THE SCRIPT! HERO!', 'PAGE NINETY! THERE\'S A NUDE SCENE NOW!'],
};

// ---------------------------------------------------------------------------------------------------------------
// The first AD, on the stage's bullhorn

export const AD_VOICE = 'm2.hollywood.ad';
/** Another principal dead (a couple of times in the fight): a shrug. They own the scans. */
export const AD_SHRUG: ByPants = {
  clean: ['KEEP ROLLING. REVENGERS 20 IS ALL CGI ANYWAY.', 'PRINCIPAL DOWN. NOTED. LEGAL OWNS THE FACE.', "THAT'S FINE. WE SCANNED HIM IN 2019."],
  shitty: ['KEEP ROLLING. WE CAN CGI THEM. WE CANNOT CGI THAT SMELL.', 'PRINCIPAL DOWN. THE AI VERSION WILL NOT HAVE TO SMELL HIM.'],
  nude: ['KEEP ROLLING. THE AI VERSIONS NEVER HAVE TO SEE THAT.', "PRINCIPAL DOWN. FINE. WE OWN THE FACE. NOBODY WANTS HIS."],
};
/** The case knocked over, the pages out to the public: panic. */
export const AD_LEAK = ['CODE RED! THE SCRIPT IS LOOSE! THE SCRIPT IS LOOSE!', 'NOBODY READ THOSE PAGES! YOU ARE ALL UNDER NDA! ALL OF YOU!'];
/** The PA plug (Steve, foreshadowed). */
export const AD_STEVE = ['FOR THE LAST TIME: STUNTMAN STEVE IS NOT ON THIS PRODUCTION. STOP CALLING THE OFFICE.'];
/** The rest of the principals called (after CAPTAIN AMERICANO's gone in). */
export const AD_CAST: ByPants = {
  clean: ['ALL PRINCIPALS TO THE MAIN STAGE. PILE ON HIM. PROTECT THE SCRIPT.', 'PRINCIPAL CAST TO SET. ALL OF YOU. SIT ON HIM.'],
  shitty: ['ALL PRINCIPALS TO THE MAIN STAGE. PILE ON HIM. HOLD YOUR BREATH.', 'PRINCIPAL CAST TO SET. SIT ON HIM. WEAR GLOVES.'],
  nude: ['ALL PRINCIPALS TO THE MAIN STAGE. PILE ON HIM. NOT THERE.', 'PRINCIPAL CAST TO SET. SIT ON HIM. EYES UP.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The studio executive (the ending: at the back by the script on his phone, never a glance at the bodies; then the
// pages fly)

export const EXEC_VOICE = 'm2.hollywood.exec';
/** On the phone, stood by the script, the pile going past him to the dumpster. */
export const EXEC_PHONE = ["YEAH, THE WHOLE CAST. NO, WE'RE FINE. WE OWN THEIR FACES.", 'ALL OF THEM DEAD. SURE. HAVE LEGAL SEND FLOWERS. THE CHEAP ONES.'];
/** The case down, the pages up: he sees. */
export const EXEC_SEES = ['NO. NO NO NO. NOT THE SCRIPT!', 'THE SCRIPT! WHO TOUCHED THE SCRIPT?!'];
/** Out of the hole after the pages, the bodies flying past him into the dumpster. */
export const EXEC_RANT = [
  'THE CAST WE CAN REPLACE! CGI! AI! WE OWN THEIR FACES! THE SCRIPT WAS THE ONLY COPY!',
  'ACTORS GROW BACK! THAT SCRIPT WAS THE ONLY COPY! IT WAS ON PAPER! FOR SECURITY!',
];

// ---------------------------------------------------------------------------------------------------------------
// The film crew (kinds.ts), their voices and barks

export const CREW_VOICES = {
  grip: 'm2.hollywood.grip', gripf: 'm2.hollywood.gripf',
  boom: 'm2.hollywood.boom', boomf: 'm2.hollywood.boomf',
  runner: 'm2.hollywood.runner', runnerf: 'm2.hollywood.runnerf',
  director: 'm2.hollywood.director', directorf: 'm2.hollywood.directorf',
  craft: 'm2.hollywood.craft', craftf: 'm2.hollywood.craftf',
  mocap: 'm2.hollywood.mocap', mocapf: 'm2.hollywood.mocapf',
  stuntco: 'm2.hollywood.stuntco', stuntcof: 'm2.hollywood.stuntcof',
} as const;

export const GRIP_BARK: ByPants = {
  clean: ['THIS IS A C-STAND. NOW IT IS A WEAPON.', 'YOU KNOCKED DOWN MY WALLS!'],
  shitty: ['YOU SHIT ON MY APPLE BOX!', "GRIPS DON'T TOUCH THAT. GRIPS HIT THAT."],
  nude: ['PUT A SANDBAG ON IT!', 'SOMEBODY FLAG OFF HIS DICK!'],
};
export const BOOM_BARK: ByPants = {
  clean: ["YOU'RE IN MY SHOT AND MY MIC!", 'QUIET ON SET! I SAID QUIET!'],
  shitty: ['THE MIC PICKED UP YOUR PANTS!', 'I CAN HEAR IT. I CAN HEAR THE SHIT.'],
  nude: ["BOOM'S IN THE SHOT! SO ARE YOUR BALLS!", "I'M NOT BOOMING THAT."],
};
export const RUNNER_BARK: ByPants = {
  clean: ['WE HAVE A CIVILIAN ON STAGE ONE! COPY?', 'HOT COFFEE! COMING THROUGH!'],
  shitty: ['COPY, HE SHIT HIMSELF. COPY THAT.', 'NEED A MOP ON STAGE ONE! A BIG MOP!'],
  nude: ['NAKED CIVILIAN ON STAGE! REPEAT, NAKED!', 'I NEED WARDROBE! FOR HIM! NOW!'],
};
export const DIRECTOR_BARK: ByPants = {
  clean: ["ACTION! KILL HIM! THAT'S THE NOTE!", "WHO IS THIS? HE'S NOT IN THE SCRIPT!"],
  shitty: ['ACTION! AND SOMEBODY CHANGE HIS PANTS!', "I DIDN'T ASK FOR A SHIT SCENE!"],
  nude: ["WE'RE NOT RATED R! ACTION ANYWAY!", 'GET A WIDE SHOT. NO! NOT OF THAT!'],
};
export const CRAFT_BARK: ByPants = {
  clean: ["YOU WANT CRAFT SERVICES? HERE'S CRAFT SERVICES!", 'NOBODY TOUCHES THE DONUTS!'],
  shitty: ['YOU SHIT NEAR MY BAGELS!', "THAT'S A HEALTH CODE VIOLATION, PAL!"],
  nude: ['NOT NEAR THE HUMMUS!', 'PUT ON AN APRON! ANYTHING!'],
};
export const MOCAP_BARK: ByPants = {
  clean: ["I'M A DRAGON IN THIS MOVIE! RAWR!", "NOBODY KNOWS MY FACE! THAT'S THE JOB!"],
  shitty: ['THE DOTS ARE PICKING UP THE SMELL!', "THEY'LL HAVE TO PAINT YOUR PANTS OUT!"],
  nude: ['YOU NEED DOTS! EVERYWHERE!', "THEY'LL CGI A CODPIECE ON YOU!"],
};
export const STUNTCO_BARK: ByPants = {
  clean: ['I COORDINATE STUNTS. THIS IS ONE.', "CLEAR THE MATS! HE'S GOING DOWN!"],
  shitty: ['NOBODY LANDS ON THE SHIT GUY!', "I'VE TAKEN WORSE FALLS. NOT WORSE SMELLS."],
  nude: ['NO PADS? NO PANTS? RESPECT.', "THAT'S NOT A SAFE LANDING ZONE!"],
};
/** The director's ACTION! (his crew speed up): what he yells. */
export const ACTION: ByPants = {
  clean: ['AND... ACTION!', 'ACTION! MORE ENERGY!'],
  shitty: ['ACTION! AND HOLD YOUR NOSES!', 'ACTION! THROUGH THE SMELL!'],
  nude: ['ACTION! EYES ON HIS FACE!', 'ACTION! WE FIX IT IN POST!'],
};

// ---------------------------------------------------------------------------------------------------------------
// THE ENSEMBLE CAST (cast.ts): CAPTAIN AMERICANO's piece (always first); then everybody else on the same few lines
// (the user: generic arrivals, sparse, not every line in every fight)

export const ACTOR_VOICES = {
  m: 'm2.hollywood.actor', f: 'm2.hollywood.actorf', m2: 'm2.hollywood.actor2', f2: 'm2.hollywood.actor2f', big: 'm2.hollywood.actorbig', bigf: 'm2.hollywood.actorbigf',
} as const;

/** Whose voice each of them has (cast.ts's order). */
const V = ACTOR_VOICES;
export const ACTOR_VOICE_OF: string[] = [
  V.m, V.m2, V.m, V.big, V.f, V.m2, V.m, V.m2, V.f2, V.m,
  V.m2, V.f, V.big, V.m, V.f2, V.m2, V.m, V.bigf, V.f, V.m2,
  V.m, V.m2, V.f2, V.f, V.f2, V.f, V.m, V.m2, V.big, V.m,
];

/** CAPTAIN AMERICANO, jumping in (the user's line, word for word). */
export const CAP_RESEMBLE = 'REVENGERS: RESEMBLE!';
/** ...and his piece: he plays a superhero, so he is one; he'll stop this civilian himself. */
export const CAP_SURE: ByPants = {
  clean: ['I PLAY A SUPER SOLDIER. SO I AM ONE. STAND DOWN, CITIZEN.', "I'VE SAVED THE WORLD ELEVEN TIMES. ON SCREEN COUNTS. YOU'RE DONE."],
  shitty: ["I'VE SAVED THE WORLD ELEVEN TIMES. I CAN HANDLE ONE SHITTY CIVILIAN.", 'I PLAY A SUPER SOLDIER. SUPER SOLDIERS DO NOT SMELL THAT. STAND DOWN.'],
  nude: ["I'VE SAVED THE WORLD ELEVEN TIMES. I CAN HANDLE ONE NAKED CIVILIAN.", 'I PLAY A SUPER SOLDIER. PUT IT AWAY AND STAND DOWN, CITIZEN.'],
};
/** Any of the others coming in (sparse: not every one says one). */
export const ARRIVE: ByPants = {
  clean: ['REVENGERS: RESEMBLE!', 'HERO LANDING!', 'I PLAY A HERO. SO I AM ONE.', 'I DO MY OWN STUNTS!', 'STAND DOWN, CIVILIAN!'],
  shitty: ['HOLD YOUR NOSE AND RESEMBLE!', 'MY AGENT SAID NOTHING ABOUT SHIT!', "I'M NOT DYING NEXT TO THE SHIT GUY!"],
  nude: ["DON'T LOOK DOWN! RESEMBLE!", 'MY CONTRACT HAS A NO-NUDITY CLAUSE!', 'IS HE A METHOD ACTOR?'],
};
/** Jumping on him (the dogpile; sparse). */
export const LATCH: ByPants = {
  clean: ['DOGPILE!', 'GOT HIM!', 'PILE ON!', 'HOLD HIM DOWN!'],
  shitty: ['GOT HIM! OH GOD, THE SMELL!', 'DOGPILE! BREATHE THROUGH YOUR MOUTH!'],
  nude: ["GOT HIM! DON'T GRAB THAT!", 'DOGPILE! NOT THERE! NOT THERE!'],
};
/** Dying like the ordinary people they are. */
export const DEATH: ByPants = {
  clean: ['TELL MY AGENT...', 'I HAD A THREE-PICTURE DEAL...', 'MOMMY...', "I'M NOT EVEN... THE MAIN ONE...", "IT'S... NOT... CGI...", 'MY... RESIDUALS...'],
  shitty: ['KILLED... BY A GUY... WHO SHIT HIMSELF...', 'NOT LIKE THIS... IT SMELLS...', 'MY LAST BREATH... WAS THAT...'],
  nude: ['KILLED... BY A NAKED MAN...', "DON'T LET... THAT... BE THE LAST THING I SEE...", 'MY OBITUARY... WILL MENTION... HIS DICK...'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him in the warehouse (by source), and the death screen

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:hww_grip': { hurt: ['A C-STAND TO THE HEAD!', 'THE GRIP HIT ME WITH A LIGHT STAND!', 'OW! UNION LABOR!'], death: ['C-STANDED', 'BEATEN BY A GRIP'] },
  'm2:hww_boom': { hurt: ['BONKED BY A BOOM MIC!', 'THE FUZZY THING HIT ME!', 'GET YOUR MIC OUT OF MY FACE!'], death: ['BOOMED', 'DIED IN THE SOUND MIX'] },
  'm2:hww_runner': { hurt: ['A PA SHOVED ME!', 'OW! THE INTERN!', 'GET OFF ME, COFFEE BOY!'], death: ['KILLED BY AN INTERN', 'FETCHED'] },
  'm2:hww_coffee': { hurt: ['HOT COFFEE! IN MY EYES!', "IT'S A LATTE! IT BURNS!", 'OAT MILK! I HATE OAT MILK!'], death: ['SCALDED BY A LATTE', 'KILLED ON A COFFEE RUN'] },
  'm2:hww_director': { hurt: ['THE DIRECTOR HIT ME WITH HIS MEGAPHONE!', 'OW! NOTES!', 'QUIT DIRECTING MY FACE!'], death: ['DIRECTED TO DEATH', 'CUT. PRINT. DEAD'] },
  'm2:hww_craft': { hurt: ['THE LUNCH LADY HIT ME!', 'OW! HAIRNET!', 'GET YOUR TONGS OFF ME!'], death: ['KILLED BY CRAFT SERVICES', 'SERVED'] },
  'm2:hww_food': { hurt: ['A DONUT TO THE FACE!', 'A BURRITO! IT EXPLODED!', 'SHEET CAKE IN MY EYES!'], death: ['DEATH BY DONUT', 'CATERED TO DEATH'] },
  'm2:hww_mocap': { hurt: ['KICKED BY A GUY IN PING-PONG BALLS!', 'THE DOT MAN FLIPPED ON ME!', "OW! YOU'RE NOT EVEN A DRAGON!"], death: ['KILLED BY A MOCAP DOUBLE', 'CAPTURED'] },
  'm2:hww_stuntco': { hurt: ['TACKLED BY THE STUNT GUY!', "THAT'S NOT A SAFE FALL!", 'HE COORDINATED MY RIBS!'], death: ['TACKLED TO DEATH', 'A STUNT GONE RIGHT'] },
  'm2:hww_light': { hurt: ['A LIGHT FELL ON ME!', "THE RIG! IT'S HOT!", 'MY HEAD! THAT LIGHT WEIGHS FIFTY POUNDS!'], death: ['CRUSHED BY A STUDIO LIGHT', 'LIT'] },
  'm2:hww_pyro': { hurt: ['PYRO! MY ASS IS ON FIRE!', "THE FIRE'S REAL! THE SET'S FAKE!", 'HOT SET! HOT SET!'], death: ['BURNED ON A HOT SET', 'BURNED FOR A FAKE SPACESHIP'] },
  'm2:hww_actor': { hurt: ['A MOVIE STAR PUNCHED ME!', 'OW! THEY DO THEIR OWN STUNTS!', 'SLAPPED BY THE A-LIST!'], death: ['BEATEN BY THE A-LIST', 'KILLED BY A CELEBRITY'] },
  'm2:hww_flop': { hurt: ['HE LANDED ON ME!', "THEY CAN'T FLY! THEY CAN LAND ON ME!", 'A HERO LANDING! ON MY HEAD!'], death: ['CRUSHED BY A HERO LANDING', 'LANDED ON'] },
  // (the dogpile: one jumping on him; enough of them and he's under the pile)
  'm2:hww_pile': {
    hurt: ['GET OFF ME!', "THERE'S A MOVIE STAR ON MY LEG!", "THEY'RE CLIMBING ME!", "I'M NOT A JUNGLE GYM!", 'GET YOUR CAPE OUT OF MY MOUTH!'],
    death: ['BURIED UNDER CELEBRITIES', 'DOGPILED BY THE A-LIST', 'CRUSHED BY THE ENSEMBLE'],
  },
};

const pools = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];
/** (the lines every one of the cast can say; CAPTAIN AMERICANO's piece on his voice) */
const castShared = [...pools(ARRIVE), ...pools(LATCH), ...pools(DEATH)];
const castLines = (v: string) => [...(v === ACTOR_VOICE_OF[0] ? [CAP_RESEMBLE, ...pools(CAP_SURE)] : []), ...castShared];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...BURST_WHAT, ...BURST_NEVER, ...BURST, ...BACK_AGAIN, ...Object.values(GAG_LINES).flat(), ...CASE, ...CAP_REPLY, ...CAST_ARRIVE, ...KILL_QUIPS,
    ...HALF, ...LAST, CLEAN_UP, ...SHRUG,
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [GUEST_VOICES.m]: [...pools(CROWD_GASP), ...pools(CROWD_PAGES)],
  [GUEST_VOICES.f]: [...pools(CROWD_GASP), ...pools(CROWD_PAGES)],
  [AD_VOICE]: [...AD_STEVE, ...pools(AD_CAST), ...pools(AD_SHRUG), ...AD_LEAK],
  [EXEC_VOICE]: [...EXEC_PHONE, ...EXEC_SEES, ...EXEC_RANT],
  [PRODUCER_VOICE]: [...PROD_RULES, PROD_ASSASSIN],
  [CREW_VOICES.grip]: pools(GRIP_BARK), [CREW_VOICES.gripf]: pools(GRIP_BARK),
  [CREW_VOICES.boom]: pools(BOOM_BARK), [CREW_VOICES.boomf]: pools(BOOM_BARK),
  [CREW_VOICES.runner]: pools(RUNNER_BARK), [CREW_VOICES.runnerf]: pools(RUNNER_BARK),
  // (the burst-in's director is a man: his panic on the men's director voice)
  [CREW_VOICES.director]: [...pools(DIRECTOR_BARK), ...pools(ACTION), ...pools(DIR_WHO), ...pools(DIR_TITLE), ...pools(DIR_SECRET), ...pools(DIR_PONDER), DIR_KILL],
  [CREW_VOICES.directorf]: [...pools(DIRECTOR_BARK), ...pools(ACTION)],
  [CREW_VOICES.craft]: pools(CRAFT_BARK), [CREW_VOICES.craftf]: pools(CRAFT_BARK),
  [CREW_VOICES.mocap]: pools(MOCAP_BARK), [CREW_VOICES.mocapf]: pools(MOCAP_BARK),
  [CREW_VOICES.stuntco]: pools(STUNTCO_BARK), [CREW_VOICES.stuntcof]: pools(STUNTCO_BARK),
  // (the cast: their shared lines; CAPTAIN AMERICANO's voice his piece too)
  ...Object.fromEntries(Object.values(ACTOR_VOICES).map(v => [v, castLines(v)])),
};
