// What's said in the secret warehouse (the film crew, the AD on the stage's bullhorn, the public at the fallen walls,
// THE ENSEMBLE CAST), by voice (recorded with the rest: hollywood/voices.ts gathers these; tools/voices). In the user's
// voice (hollywood-spec.md); pick lines with pickLine; clean / shitty / naked pools where people react to him, and for
// every one of the sub-boss's line groups. The hurt and death lines for every new way he's hurt here are here too
// (registered in kinds.ts and cast.ts).

import type { ByPants } from '../blvd/lines';
import { GUEST_VOICES } from '../coaster/lines';
export { GUEST_VOICES };

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** The walls down, the public staring in (the burst-in). */
export const BURST = ["OOPS. YOUR SECRET'S OUT.", "SURPRISE. I'M IN YOUR MOVIE NOW."];
/** Launched in again (a revisit: the lever's still on). */
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
/** The main stage: the script in its case (the fight's start). */
export const CASE = ['THE SCRIPT. IN A GLASS CASE. LIT LIKE JESUS.', "A LASER GRID AROUND A SCRIPT. IT'S A FUCKING BOOK."];
/** The cast coming down. */
export const CAST_ARRIVE = ['OH LOOK. THE AVENGERS. NO. THE KNOCKOFF ONES.', "MOVIE STARS. I'VE NEVER KILLED A MOVIE STAR. TODAY I KILL THIRTY."];
/** One of them dead (now and then). */
export const KILL_QUIPS = ["NOW THAT'S A DEATH SCENE.", 'NO STUNT DOUBLE.', 'BOX OFFICE POISON.', 'CUT. PRINT IT.', "THAT'S A WRAP ON YOU.", 'RECAST THAT ONE.'];
/** One whose wire wasn't hooked up (he never touched him). */
export const UNHOOKED_QUIP = ["HIS WIRE WASN'T HOOKED UP. I DIDN'T EVEN TOUCH HIM.", 'THAT ONE KILLED HIMSELF. METHOD ACTING.'];
/** A power that does nothing, right in front of him (now and then). */
export const FIZZLE_MOCK = ["THERE'S NOTHING THERE, DUMBASS.", "YOU KNOW THAT'S CGI, RIGHT?", 'NICE POWERS. DO THE ONE WHERE YOU DIE.'];
/** Half of them dead. */
export const HALF = ["HALF THE CAST. THE SEQUEL'S GONNA BE CHEAP.", 'FIFTEEN DOWN. THE POSTER JUST GOT A LOT EMPTIER.'];
/** The last one standing. */
export const LAST = ['ONE LEFT. THE ONE NOBODY KNOWS THE NAME OF.', "LAST ONE. YOU'RE THE LEAD NOW. CONGRATULATIONS."];
/** The last one dead (the user's line, word for word). */
export const CLEAN_UP = 'BETTER CLEAN UP THE BODIES.';

// ---------------------------------------------------------------------------------------------------------------
// The public, at the fallen walls (the park's guests' voices)

export const CROWD_GASP: ByPants = {
  clean: ["OH MY GOD. IS THAT THE REVENGERS?", "THEY'RE FILMING REVENGERS IN THERE! IN SECRET!", "IT'S A TAX WRITE-OFF! I KNEW IT!"],
  shitty: ['IT\'S THE REVENGERS! AND A MAN WHO SHIT HIMSELF!', 'THE SMELL GOT OUT BEFORE THE WALLS DID.'],
  nude: ['THE REVENGERS! AND A NAKED GUY ON A TOILET!', "IS HE IN THE MOVIE? HE'S NOT WEARING THE MOVIE."],
};
/** The script's pages flying out to them (the leak). */
export const CROWD_PAGES: ByPants = {
  clean: ["FREE PAGES! IT'S THE SCRIPT!", 'I GOT THE ENDING! THEY ALL RESEMBLE!'],
  shitty: ['THE PAGES SMELL LIKE HIM! STILL WORTH IT!', "IT'S GOT SHIT ON IT! I'M FRAMING IT!"],
  nude: ['THE NAKED GUY LEAKED THE SCRIPT! HERO!', 'PAGE NINETY! THERE\'S A NUDE SCENE NOW!'],
};

// ---------------------------------------------------------------------------------------------------------------
// The first AD, on the stage's bullhorn

export const AD_VOICE = 'm2.hollywood.ad';
export const AD_CLOSED: ByPants = {
  clean: ['THIS IS A CLOSED SET! WHO OPENED THE WALLS?', 'CLOSED SET! NO PHOTOS! NO PHONES! NO WALLS, APPARENTLY!'],
  shitty: ['CLOSED SET! AND SOMEBODY JUST SHIT ON IT!', 'CLOSED SET! WHO BROUGHT THE SMELL?'],
  nude: ['CLOSED SET! AND THERE IS A NAKED MAN ON IT!', 'CLOSED SET! THE PUBLIC CAN SEE HIS EVERYTHING!'],
};
export const AD_CREW: ByPants = {
  clean: ['CREW! GET THAT MAN OFF MY SET!', 'ALL CREW! THE SECRET IS OUT! KILL WHOEVER LET IT OUT!'],
  shitty: ['CREW! GET THE SHITTY MAN OFF MY SET! USE GLOVES!', 'ALL CREW! CODE BROWN ON STAGE ONE!'],
  nude: ['CREW! TACKLE THE NAKED MAN! SOMEBODY! ANYBODY!', 'ALL CREW! HE IS NAKED AND HE IS COMING!'],
};
/** The PA plug (Steve, foreshadowed). */
export const AD_STEVE = ['FOR THE LAST TIME: STUNTMAN STEVE IS NOT ON THIS PRODUCTION. STOP CALLING THE OFFICE.'];
export const AD_CAST: ByPants = {
  clean: ['PRINCIPAL CAST TO THE MAIN STAGE. ALL OF THEM. PROTECT THE SCRIPT.', 'ALL PRINCIPALS TO SET. THE SCRIPT IS IN DANGER. HERO LANDINGS, PEOPLE.'],
  shitty: ['PRINCIPAL CAST TO THE MAIN STAGE. HE HAS SHIT HIMSELF. STAY UPWIND.', 'ALL PRINCIPALS TO SET. PROTECT THE SCRIPT. HOLD YOUR BREATH.'],
  nude: ['PRINCIPAL CAST TO THE MAIN STAGE. HE IS NAKED. DO NOT LOOK AT IT.', 'ALL PRINCIPALS TO SET. A NUDE MAN IS NEAR THE SCRIPT. NOBODY LOOK DOWN.'],
};
export const AD_WAVE: ByPants = {
  clean: ['NEXT PRINCIPALS TO SET. WE HAVE THIRTY OF YOU. USE THEM.', 'MORE CAST. KEEP THE POSES TIGHT.', 'BACKUP PRINCIPALS, YOU ARE UP.'],
  shitty: ['NEXT PRINCIPALS. AVOID THE BROWN AREA.', 'MORE CAST TO SET. BREATHE THROUGH YOUR MOUTHS.'],
  nude: ['NEXT PRINCIPALS. EYES UP. EYES WAY UP.', 'MORE CAST TO SET. HE IS STILL NAKED. SORRY.'],
};

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
// THE ENSEMBLE CAST (cast.ts): every one of them their own entrance (clean, shat, naked); and the lines they share

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

/** Each one's entrance (the hero landing, the wire down, the walk on), by the state of him. In cast.ts's order. */
export const ENTRANCES: ByPants[] = [
  { clean: ['CAPTAIN AMERICANO! REVENGERS... RESEMBLE!'], shitty: ['I CAN SMELL HIM FROM THE FORTIES.'], nude: ['LANGUAGE! AND PANTS!'] },
  { clean: ['I AM THUD! GOD OF THUNDER-ISH!'], shitty: ["BY MY FATHER'S BEARD, WHAT IS THAT SMELL?"], nude: ['EVEN THE GODS WEAR PANTS!'] },
  { clean: ['I AM IRONIC MAN. NO, REALLY.'], shitty: ['COMPUTER, SCAN FOR THE SHIT. OH. FOUND IT.'], nude: ["MY SUIT HAS A SUIT. WHERE'S YOURS?"] },
  { clean: ['BULK... SMASH! IS THIS MY MARK?'], shitty: ['BULK SMELL. BULK NOT LIKE.'], nude: ['BULK SEE TINY PENIS.'] },
  { clean: ['BLACK WINDOW. I DO MY OWN STUNTS. MOSTLY.'], shitty: ["I'VE BEEN TORTURED. THIS IS WORSE."], nude: ["I'VE SEEN BIGGER ON A SPY."] },
  { clean: ['HAWKGUY! THE ONE WITH THE BOW!'], shitty: ["I NEVER MISS. I'D MISS THAT."], nude: ["I'M AIMING ANYWHERE BUT THERE."] },
  { clean: ["SPIDER-TEEN! I'M TWENTY-NINE!"], shitty: ['MY SPIDER SENSE IS GAGGING!'], nude: ['DUDE! YOUR WHOLE THING IS OUT!'] },
  { clean: ["DOCTOR STRANGLE. I'VE SEEN FOURTEEN MILLION OUTCOMES."], shitty: ['FOURTEEN MILLION OUTCOMES. ALL OF THEM STINK.'], nude: ["FOURTEEN MILLION OUTCOMES. YOU'RE NAKED IN ALL OF THEM."] },
  { clean: ['THE SCARLET WHICH. WHICH ONE? ME.'], shitty: ['I CAN BEND REALITY. NOT THAT SMELL.'], nude: ["I'LL HEX YOU SOME PANTS."] },
  { clean: ['I CAN FLOAT THROUGH ANYTHING! IS MY WIRE HOOKED—'], shitty: ['I WILL FLOAT ABOVE THE SMELL! IS MY WIRE HOOKED—'], nude: ['I WILL FLOAT ABOVE THE NUDITY! IS MY WIRE HOOKED—'] },
  { clean: ["STAR-LARD! YOU'VE PROBABLY HEARD OF ME."], shitty: ['DUDE. DID YOU SHIT? DUDE.'], nude: ['DUDE. NOT COOL. PUT IT IN A HOLSTER.'] },
  { clean: ['GAMMA-RAY. DEADLIEST WOMAN IN THE GALAXY.'], shitty: ['WHERE I COME FROM WE BURN THINGS THAT SMELL LIKE YOU.'], nude: ['THE DEADLIEST WOMAN IN THE GALAXY IS NOT IMPRESSED.'] },
  { clean: ['I AM DRAKS. I DO NOT UNDERSTAND METAPHORS.'], shitty: ['YOU HAVE SOILED YOURSELF. I ADMIRE THE HONESTY.'], nude: ['YOU ARE NAKED. LIKE ME. BUT WORSE.'] },
  { clean: ['AUNT-MAN! I GET SMALL! SOMETIMES!'], shitty: ["I'M SHRINKING AWAY FROM THAT SMELL."], nude: ["HEY. I'M NOT THE ONLY SMALL ONE HERE."] },
  { clean: ['CAPTAIN MARVELOUS. HIGHER. FURTHER. FASTER.'], shitty: ['HIGHER. FURTHER. AWAY FROM YOU.'], nude: ['HIGHER. FURTHER. COVER THAT.'] },
  { clean: ['THE WINTER SOLDER. I FIX PIPES. AND KILL.'], shitty: ['READY TO COMPLY. NOT READY FOR THAT.'], nude: ['MY ARM IS METAL. YOUR SHAME IS NOT.'] },
  { clean: ['ON YOUR LEFT! WAIT. MY WINGS ARE CARDBOARD—'], shitty: ['ON YOUR LEFT, SHIT MAN! WAIT. MY WINGS—'], nude: ['ON YOUR LEFT, NAKED MAN! WAIT. MY WINGS—'] },
  { clean: ['SHE-BULK. ATTORNEY AT LAW. AND SMASH.'], shitty: ["I'LL SUE YOU FOR THAT SMELL."], nude: ["INDECENT EXPOSURE. I'M A LAWYER."] },
  { clean: ["MISS MARBLE! I'M PLAYING SIXTEEN! I'M THIRTY-ONE!"], shitty: ["EW! I'M POSTING THIS!"], nude: ["EW! EW! I'M POSTING ALL OF THIS!"] },
  { clean: ["QUICKSHILL! YOU DIDN'T SEE THAT COMING!"], shitty: ["I'M FAST. NOT FAST ENOUGH FOR THAT SMELL."], nude: ['I SAW EVERYTHING. AT SUPER SPEED.'] },
  { clean: ["WOLVERINO. I'M THE BEST THERE IS, BUB."], shitty: ["MY NOSE IS MY POWER. YOU'RE MY WEAKNESS."], nude: ['PUT SOME METAL ON THAT, BUB.'] },
  { clean: ['DEADPAN! MAXIMUM EFFORT! OR SOME EFFORT.'], shitty: ["HE SHIT HIMSELF. I CAN'T EVEN MAKE THAT JOKE."], nude: ["A NAKED GUY? THAT'S MY BIT!"] },
  { clean: ['DRIZZLE! MISTRESS OF LIGHT RAIN!'], shitty: ["I'LL WASH THAT SMELL AWAY. LIGHTLY."], nude: ["IT'S COLD IN HERE. FOR YOU, I MEAN."] },
  { clean: ['NEBULOUS. I AM MOSTLY ROBOT. AND RESENTMENT.'], shitty: ['MY SENSORS DETECT SHIT.'], nude: ['MY SENSORS DETECT DISAPPOINTMENT.'] },
  { clean: ["JEAN BEIGE. I CAN READ YOUR MIND. IT'S EMPTY."], shitty: ['I READ YOUR MIND. IT JUST SAYS POOP.'], nude: ['I READ YOUR MIND. PUT IT AWAY.'] },
  { clean: ['WONDER WOMANISH! I FIGHT FOR LOVE! AND RESIDUALS!'], shitty: ['ON MY ISLAND WE HAD NO MEN. NOW I KNOW WHY.'], nude: ['THE LASSO OF TRUTH SAYS: SMALL.'] },
  { clean: ["LOOK! UP IN THE SKY! IT'S SUPERBMAN!"], shitty: ['NOT EVEN MY X-RAY VISION WANTS THAT.'], nude: ['MY X-RAY VISION IS OFF. THANK GOD.'] },
  { clean: ["I'M BATTMAN."], shitty: ["I'M BATTMAN. WHAT'S THAT SMELL?"], nude: ["I'M BATTMAN. YOU'RE NAKED."] },
  { clean: ['I AM GROAT.'], shitty: ['I AM... GAGGING.'], nude: ['I AM GROAT. YOU ARE NAKED.'] },
  { clean: ["SOCKET! I'M A RACCOON! I'M ON MY KNEES!"], shitty: ['I GO THROUGH TRASH FOR A LIVING. THIS IS WORSE.'], nude: ["I'M NAKED UNDER THE FUR TOO, BUDDY."] },
];
/** A hero pose (the tell): the catchphrase. */
export const TAUNT: ByPants = {
  clean: ['HERO POSE!', 'GET MY GOOD SIDE!', 'FOR THE FRANCHISE!', 'REVENGERS! RESEMBLE!'],
  shitty: ['HOLD YOUR BREATH! HERO POSE!', "I'M NOT DYING NEXT TO THE SHIT GUY!", 'MY AGENT SAID NOTHING ABOUT POOP!'],
  nude: ["DON'T LOOK DOWN! HERO POSE!", 'MY CONTRACT HAS A NO-NUDITY CLAUSE!', 'IS HE A METHOD ACTOR?'],
};
/** The power that does nothing (it's added in post). */
export const FAIL: ByPants = {
  clean: ["WHY ISN'T IT WORKING?", "THAT'S CGI? SINCE WHEN?", 'MY POWERS! SOMEBODY CALL VFX!', 'IT WORKED IN THE TRAILER!'],
  shitty: ['MY POWERS DON\'T WORK AND HE SHIT HIMSELF!', 'VFX! PAINT OUT HIS PANTS! AND GIVE ME POWERS!'],
  nude: ['NOTHING CAME OUT! NOTHING!', 'VFX! FIX MY POWERS! AND HIS JUNK!'],
};
/** Dying like the ordinary people they are. */
export const DEATH: ByPants = {
  clean: ['TELL MY AGENT...', 'I HAD A THREE-PICTURE DEAL...', 'MOMMY...', "I'M NOT EVEN... THE MAIN ONE...", "IT'S... NOT... CGI...", 'MY... RESIDUALS...'],
  shitty: ['KILLED... BY A GUY... WHO SHIT HIMSELF...', 'NOT LIKE THIS... IT SMELLS...', 'MY LAST BREATH... WAS THAT...'],
  nude: ['KILLED... BY A NAKED MAN...', "DON'T LET... THAT... BE THE LAST THING I SEE...", 'MY OBITUARY... WILL MENTION... HIS DICK...'],
};
/** On the way down, the wire not hooked up. */
export const UNHOOKED: ByPants = {
  clean: ["MY WIRE ISN'T HOOKED UP! AAAAH!", 'WHO RIGGED THIS?! AAAAH!'],
  shitty: ['NOT INTO THE SHIT! AAAAH!', 'MY WIRE! AND THE SMELL! AAAAH!'],
  nude: ['NOT ONTO THE NAKED GUY! AAAAH!', 'MY WIRE! HIS BALLS! AAAAH!'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him in the warehouse (by source), and the death screen

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:hww_grip': { hurt: ['A C-STAND TO THE HEAD!', 'THE GRIP HIT ME WITH A LIGHT STAND!', 'OW! UNION LABOR!'], death: ['C-STANDED', 'BEATEN BY A GRIP'] },
  'm2:hww_boom': { hurt: ['BONKED BY A BOOM MIC!', 'THE FUZZY THING HIT ME!', 'GET YOUR MIC OUT OF MY FACE!'], death: ['BOOMED', 'DIED IN THE SOUND MIX'] },
  'm2:hww_runner': { hurt: ['A PA SHOVED ME!', 'OW! THE INTERN!', 'GET OFF ME, COFFEE BOY!'], death: ['KILLED BY A PRODUCTION ASSISTANT', 'FETCHED'] },
  'm2:hww_coffee': { hurt: ['HOT COFFEE! IN MY EYES!', "IT'S A LATTE! IT BURNS!", 'OAT MILK! I HATE OAT MILK!'], death: ['SCALDED BY A LATTE', 'KILLED ON A COFFEE RUN'] },
  'm2:hww_director': { hurt: ['THE DIRECTOR HIT ME WITH HIS MEGAPHONE!', 'OW! NOTES!', 'QUIT DIRECTING MY FACE!'], death: ['DIRECTED TO DEATH', 'CUT. PRINT. DEAD'] },
  'm2:hww_craft': { hurt: ['THE LUNCH LADY HIT ME!', 'OW! HAIRNET!', 'GET YOUR TONGS OFF ME!'], death: ['KILLED BY CRAFT SERVICES', 'SERVED'] },
  'm2:hww_food': { hurt: ['A DONUT TO THE FACE!', 'A BURRITO! IT EXPLODED!', 'SHEET CAKE IN MY EYES!'], death: ['DEATH BY DONUT', 'CATERED TO DEATH'] },
  'm2:hww_mocap': { hurt: ['KICKED BY A GUY IN PING-PONG BALLS!', 'THE DOT MAN FLIPPED ON ME!', "OW! YOU'RE NOT EVEN A DRAGON!"], death: ['KILLED BY A MOCAP DOUBLE', 'CAPTURED'] },
  'm2:hww_stuntco': { hurt: ['TACKLED BY THE STUNT GUY!', "THAT'S NOT A SAFE FALL!", 'HE COORDINATED MY RIBS!'], death: ['TACKLED TO DEATH', 'A STUNT GONE RIGHT'] },
  'm2:hww_light': { hurt: ['A LIGHT FELL ON ME!', "THE RIG! IT'S HOT!", 'MY HEAD! THAT LIGHT WEIGHS FIFTY POUNDS!'], death: ['CRUSHED BY A STUDIO LIGHT', 'LIT'] },
  'm2:hww_pyro': { hurt: ['PYRO! MY ASS IS ON FIRE!', "THE FIRE'S REAL! THE SET'S FAKE!", 'HOT SET! HOT SET!'], death: ['BURNED ON A HOT SET', 'SET ON FIRE FOR A FAKE SPACESHIP'] },
  'm2:hww_actor': { hurt: ['A MOVIE STAR PUNCHED ME!', 'OW! THEY DO THEIR OWN STUNTS!', 'SLAPPED BY THE A-LIST!'], death: ['BEATEN BY THE A-LIST', 'KILLED BY A CELEBRITY'] },
  'm2:hww_prop': { hurt: ['HIT WITH A PROP!', "IT'S RUBBER! IT STILL HURTS!", 'A FOAM HAMMER IN MY EYE!'], death: ['KILLED BY A PROP', 'MERCHANDISED TO DEATH'] },
  'm2:hww_rage': { hurt: ["THE BIG GREEN ONE! HE'S JUST A FAT GUY IN PAINT!", 'BULKED!', "OW! THAT'S NOT CGI!"], death: ['SMASHED BY A GUY IN GREEN PAINT', 'BULKED'] },
  'm2:hww_flop': { hurt: ['HE FELL ON ME!', "THEY CAN'T FLY! THEY CAN LAND ON ME!", 'BELLY FLOP! FROM A SUPERHERO!'], death: ['CRUSHED BY A FLYING HERO', 'LANDED ON'] },
  'm2:hww_string': { hurt: ['SILLY STRING! IN MY EYES!', "IT'S STICKY! WHY IS IT STICKY?", 'WEBBED BY A TWENTY-NINE-YEAR-OLD!'], death: ['WEBBED', 'STRUNG UP BY SPIDER-TEEN'] },
};

const pools = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];
/** (the lines every one of the cast can say, and each voice's own entrances) */
const castShared = [...pools(TAUNT), ...pools(FAIL), ...pools(DEATH), ...pools(UNHOOKED)];
const castLines = (v: string) => [...ENTRANCES.flatMap((e, i) => (ACTOR_VOICE_OF[i] === v ? pools(e) : [])), ...castShared];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...BURST, ...BACK_AGAIN, ...Object.values(GAG_LINES).flat(), ...CASE, ...CAST_ARRIVE, ...KILL_QUIPS, ...UNHOOKED_QUIP, ...FIZZLE_MOCK,
    ...HALF, ...LAST, CLEAN_UP,
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [GUEST_VOICES.m]: [...pools(CROWD_GASP), ...pools(CROWD_PAGES)],
  [GUEST_VOICES.f]: [...pools(CROWD_GASP), ...pools(CROWD_PAGES)],
  [AD_VOICE]: [...pools(AD_CLOSED), ...pools(AD_CREW), ...AD_STEVE, ...pools(AD_CAST), ...pools(AD_WAVE)],
  [CREW_VOICES.grip]: pools(GRIP_BARK), [CREW_VOICES.gripf]: pools(GRIP_BARK),
  [CREW_VOICES.boom]: pools(BOOM_BARK), [CREW_VOICES.boomf]: pools(BOOM_BARK),
  [CREW_VOICES.runner]: pools(RUNNER_BARK), [CREW_VOICES.runnerf]: pools(RUNNER_BARK),
  [CREW_VOICES.director]: [...pools(DIRECTOR_BARK), ...pools(ACTION)], [CREW_VOICES.directorf]: [...pools(DIRECTOR_BARK), ...pools(ACTION)],
  [CREW_VOICES.craft]: pools(CRAFT_BARK), [CREW_VOICES.craftf]: pools(CRAFT_BARK),
  [CREW_VOICES.mocap]: pools(MOCAP_BARK), [CREW_VOICES.mocapf]: pools(MOCAP_BARK),
  [CREW_VOICES.stuntco]: pools(STUNTCO_BARK), [CREW_VOICES.stuntcof]: pools(STUNTCO_BARK),
  // (the cast: their shared lines, and each voice its own people's entrances)
  ...Object.fromEntries(Object.values(ACTOR_VOICES).map(v => [v, castLines(v)])),
};
