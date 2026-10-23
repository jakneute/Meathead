// What's said on Thrones of the Stars, by voice (recorded with the rest: hollywood/voices.ts gathers these;
// tools/voices). In the user's voice (hollywood-spec.md); pick lines with pickLine; clean / shitty / naked pools where
// people react to him. The staff's hurt and death lines are here too (registered in kinds.ts).

import type { ByPants } from '../blvd/lines';
import { PA_VOICE } from '../blvd/lines';

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Shoving into the queue (the first guest). */
export const CUT_LINE = [
  'FOUR HOURS? FUCK THAT.',
  'LINES ARE FOR POOR PEOPLE.',
  "MOVE. I'M WITH THE STUNTMEN.",
];
/** Shoving through them, now and then after. */
export const SHOVE = ['OUTTA MY WAY, FANNY PACK.', 'COMING THROUGH, LOSERS.', 'SCOOT, LARDO.'];
/** Passing Steve's standee in the queue. */
export const STEVE_STANDEE = ['STUNTMAN STEVE TESTED THIS RIDE. HE LOOKS LIKE HE LICKED THE SEATS.'];
/** Into the front seat (the first time; again). */
export const BOARD = ["THE SEAT'S A TOILET. I'M HOME.", "FRONT ROW ON THE SHITTER. LET'S GO."];
export const BOARD_AGAIN = ['BACK ON THE THRONE.', 'ALL ABOARD THE SHIT TRAIN. CHOO CHOO, MOTHERFUCKERS.'];
/** On the rides: the beats (he loves it; never sick). */
export const RIDE_LINES: Record<'lift' | 'drop' | 'loop' | 'roll' | 'tophat' | 'insane0' | 'insane4' | 'insane8' | 'brakes', string[]> = {
  lift: ['CLACK CLACK CLACK. MY GRANDMA CLIMBS FASTER.', 'HIGHER, YOU BASTARD. HIGHER.'],
  drop: ['WOOOOOO!', 'HOLY SHIIIIT!'],
  loop: ['UPSIDE DOWN ON A TOILET! BEST DAY EVER!', 'MY BALLS ARE IN MY THROAT! I LOVE IT!', "I'M SHITTING UPSIDE DOWN! IN SPIRIT!"],
  roll: ["I'M A ROTISSERIE CHICKEN!", 'SPIN ME LIKE A PROM DATE!'],
  tophat: ["STRAIGHT UP! THAT'S ILLEGAL!", "THAT'S NOT HOW TRACKS WORK! I LOVE IT!"],
  insane0: ['LOOPS! LIKE MY INTESTINES!', 'LOOPS! KEEP EM COMING!'],
  insane4: ["THEY'RE GETTING SMALLER!", "TIGHTER! THAT'S WHAT SHE SAID!"],
  insane8: ['MY BRAIN IS SOUP! FASTER!', "I CAN'T FEEL MY FACE! MORE!"],
  brakes: ['AGAIN!', 'AW. LIKE MY HONEYMOON. OVER TOO FAST.'],
};
/** At each stop, the toilet (once a visit each): merely gross, worse, a biohazard. */
export const TOILET_LINES = [
  ["A TOILET A SINGER SHAT IN. THEY PUT A ROPE AROUND IT.", 'THERE\'S STILL A RING IN IT. THEY KEPT THE RING.'],
  ["IT'S STILL CLOGGED. FROM NINETY-FOUR.", "THAT'S NOT A TOILET. THAT'S A SUPERFUND SITE."],
  ["THE SHIT IS GLOWING. THAT'S COCAINE OR PLUTONIUM.", "NEVER FLUSHED. SINCE SEVENTY-THREE. SOMETHING'S ALIVE IN THERE."],
];
/** The staff piling out at him. */
export const STAFF_OUT = ['OH GOOD. MINIMUM WAGE.', 'STAFF. I LOVE KILLING STAFF.', "HERE COME THE VISORS. LET'S GET YOU FIRED."];
/** The last of a stop's staff dead: the train's his. */
export const CLEARED = ["TRAIN'S FREE. ALL ABOARD.", 'NOBODY LEFT TO WRITE ME UP. BACK ON THE SHITTER.'];
/** Trying the seat (or the stairs) before they're dead. */
export const LOCKED = ["IT WON'T GO TILL THEY'RE DEAD. FINE.", "LOCKED. HEALTH AND SAFETY. I'LL KILL HEALTH AND SAFETY."];
/** Stop 2: the track walker the train hit. */
export const WALKER = ["HE WAS ON THE TRACK. THAT'S ON HIM.", 'SPLAT. SHOULDA WORN A BRIGHTER VEST.'];
/** Stop 3: the sleeper by the lever (once he's cleared them). */
export const BOOTH = ["A GUY ASLEEP NEXT TO A LEVER. I'M PULLING IT.", 'A GUY ASLEEP ON THE CLOCK. MY HERO.'];
/** Stop 3: up at the lever with the staff still alive (it's locked out: its lamp's red). */
export const LEVER_LOCKED = ["IT'S LOCKED. FINE. KILL FIRST, PULL AFTER.", "WON'T BUDGE. SOMEBODY'S STILL CLOCKED IN."];
/** Stop 3, the staff dead: on the train without pulling the lever (he's not riding it on NORMAL). */
export const LEVER_FIRST = ["FUCK NORMAL. I'M PULLING THAT LEVER.", 'NOT YET. I GOT A LEVER TO YANK. HEH. YANK.', "RIDE IT ON NORMAL? I'D RATHER SHIT MYSELF."];
/** The lever flipped. */
export const LEVER = ['EXPERIMENTAL. HELL YES.', 'NO WAIVER. NO PROBLEM.'];
/** Off the end of the track. */
export const LAUNCH = ['EXPERIMENTAAAAL!', "THE TRACK ENDS! I DON'T CARE!"];
/** The train back to the station (the lever on NORMAL). */
export const RIDE_BACK = ['BACK TO THE START. LIKE MY CAREER.', "THAT'S IT? BACK TO THE STATION?"];
/** Back at stop 3 from the warehouse: the track's still bent where he left it. */
export const BENT = ["THE TRACK'S STILL BENT. THEY JUST LEFT IT.", "NOBODY FIXED THE TRACK. UNION'S ON STRIKE. LAUNCH ME."];

/** The star toilets (thrones.ts; HOLD down by one, its stop cleared): sitting down on each (clean; his own in it). */
export const THRONE_SIT = [
  ['MOVE OVER, DINO. MY TURN.', 'START SPREADING THE NEWS.'],
  ["SITTING ON THE GODFATHER'S CLOG. HOLD MY BEER.", "IT'S ALREADY CLOGGED. WHAT'S ONE MORE."],
  ['OPEN THE CASE. PANTS DOWN. FOR SCIENCE.', "IT'S GLOWING. IT'S WARM. I'M GOING."],
];
export const THRONE_SIT_AGAIN = ['ROUND TWO.', "IT'S STILL WARM. THAT'S MINE.", 'BACK FOR SECONDS. I ATE TACO BELL FOR THIS.'];
/** Shut in the hazmat case with it (stop 3). */
export const THRONE_CASE = ['IT SMELLS LIKE 1973 IN HERE.', "I'M IN A GLASS BOX TAKING A SHIT. FINALLY, ART."];
export const THRONE_STRAIN = ['NNNNNGH. CHEESE FRIES.', "COME ON, BUDDY. DADDY'S WAITING.", "IT'S A BIG ONE. IT'S FIGHTING ME.", "THIS ONE'S GOT ELBOWS.", "HNNNG. IT'S CROWNING."];
export const THRONE_PLOP = ["OH YEAH. THAT'S THE STUFF.", 'IT SPLASHED. I FELT FAMOUS.', "THAT ONE HAD A NAME."];
/** He's clogged it (15 s on it). */
export const THRONE_CLOG = ['I CLOGGED A CELEBRITY. HELL YES.', "IT'S UP TO THE SEAT. I'M NOT DONE.", "IT'S TOUCHING MY ASS. KEEP GOING."];
/** Up off it: before he's clogged it (nothing); after. */
export const THRONE_STAND = ['JUST A FART. A BIG ONE.', "NOT YET. IT'S SHY."];
export const THRONE_DONE = ["LEAVE IT. THAT'S HISTORY NOW.", 'PUT MY NAME ON THE PLAQUE. SPELL IT RIGHT.', "DON'T FLUSH. IT'S A RELIC."];
/** The blowout coming (get up now or die). */
export const THRONE_UHOH = ['UH OH.', "THAT GURGLE WASN'T ME.", "OH NO. IT'S PUSHING BACK."];
/** His last words (the blowout). */
export const THRONE_BLOW = ['OH SHIIIIIT!', 'NOT LIKE THIIIIS!'];

// ---------------------------------------------------------------------------------------------------------------
// The queue's guests (outraged: he's cut in front of them), the voices the park's guests already have

export const GUEST_VOICES = { m: 'm2.guest2', f: 'm2.guest' } as const;
export const QUEUE_OUTRAGE: ByPants = {
  clean: ["HEY! THERE'S A LINE!", "WE'VE BEEN HERE FOUR HOURS!", "I'M TELLING CORPORATE! I HAVE A BLOG!", 'MOMMY, THAT MAN CUT!'],
  shitty: ['HE CUT THE LINE AND HE SHIT HIMSELF!', "IT'S ON MY CROCS! THESE WERE NEW!", "THE THRONES ARE FOR THE STARS, NOT YOUR ASS!"],
  nude: ['A NAKED MAN CUT THE LINE!', 'HIS BALLS TOUCHED MY FUNNEL CAKE!', 'NOT IN FRONT OF MY KIDS! OR AT ALL!'],
};

// ---------------------------------------------------------------------------------------------------------------
// The staff (new kinds: kinds.ts), their voices and barks

export const STAFF_VOICES = {
  rideop: 'm2.hollywood.rideop', rideopf: 'm2.hollywood.rideopf',
  janitor: 'm2.hollywood.janitor', janitorf: 'm2.hollywood.janitorf',
  docent: 'm2.hollywood.docent', docentf: 'm2.hollywood.docentf',
  // (security: the backlot's own)
  guard: 'm2.hollywood.security', guardf: 'm2.hollywood.securityf',
} as const;

export const RIDEOP_BARK: ByPants = {
  clean: ['SIR! YOU CUT THE LINE!', 'THE LINE STARTS FOUR HOURS BACK, SIR!', "I'M ONE WEEK FROM COLLEGE! DON'T MAKE ME DO THIS!"],
  shitty: ["SIR, YOU CAN'T SHIT ON THE THRONES! THAT'S THE STARS' JOB!", "HE ALREADY WENT! I'M NOT HOSING THAT SEAT!"],
  nude: ['SIR! SHIRT, SHOES AND PANTS! ALL THREE!', 'NAKED LINE CUTTER! CODE BROWN! CODE NAKED!'],
};
export const JANITOR_BARK: ByPants = {
  clean: ["I SCRUB THESE THRONES WITH A TOOTHBRUSH. I'LL SCRUB YOU.", "TWENTY-SIX YEARS OF OTHER PEOPLE'S SHIT. I WON'T MISS YOU."],
  shitty: ['I HAVE ONE MOP. ONE. AND YOU DO THIS?', "I'M NOT CLEANING YOUR PANTS, PAL."],
  nude: ["I'VE CLEANED BIGGER TURDS THAN THAT.", 'PUT IT AWAY OR I PLUNGE IT.'],
};
export const DOCENT_BARK: ByPants = {
  clean: ['PLEASE DO NOT TOUCH THE EXHIBIT.', 'YOU ARE STANDING IN FRONT OF HISTORY, SIR. BROWN HISTORY.', "I HAVE A MASTER'S DEGREE IN THIS TOILET!"],
  shitty: ['YOU DARE SOIL YOURSELF BEFORE THE THRONE?', 'ONLY THE STARS MAY SHIT HERE, SIR.'],
  nude: ['SIR, YOUR MEMBER IS NOT PART OF THE COLLECTION.', 'COVER YOURSELF. THE THRONE IS WATCHING.'],
};
export const GUARD_BARK: ByPants = {
  clean: ['THRONE SECURITY! ON THE GROUND!', "EIGHT BUCKS AN HOUR AND I'LL STILL BREAK YOUR ARM!"],
  shitty: ['SUSPECT HAS SOILED HIMSELF! REPEAT, SOILED!', "I'M NOT TACKLING THAT. NOT FOR EIGHT BUCKS."],
  nude: ['SUSPECT IS NUDE! AVOID THE FRONT!', 'WE NEED A SMALLER FLASHLIGHT.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The ride's narrator (hushed, reverent: a nature documentary about toilets), on the speakers in the thrones' headrests

export const NARRATOR = 'm2.hollywood.thrones';
export const SPIEL_STATION = [
  'WELCOME TO THRONES OF THE STARS. KEEP YOUR HANDS, FEET AND OPINIONS INSIDE THE THRONE.',
  'PLEASE BE SEATED. PANTS ON. THIS IS NOT THAT KIND OF RIDE.',
];
export const SPIEL_LIFT = ['ASCEND, PILGRIM. TO WHERE THE GREATS HAVE SAT.', 'THIS RIDE WAS TESTED BY STUNTMAN STEVE. HE IS DOING MUCH BETTER.'];
export const SPIEL_INSANE = ['AHEAD: THE INSANITY LOOPS. TEN OF THEM. EACH SMALLER. YOU SIGNED A WAIVER.'];
/** At each stop, the toilet: introduced like a holy relic. */
export const SPIEL_TOILET = [
  ['BEHOLD. THE CHAIRMAN OF THE BOWEL. DINO SINATRELLI SAT HERE IN 1961. HE DID IT HIS WAY.'],
  ["BEHOLD. THE GODFATHER'S CLOG. MARLOWE BRANDOE, 1994. IT IS STILL IN THERE."],
  ["BEHOLD. THE ROCK GOD'S TOUR BUS TOILET. NEVER FLUSHED SINCE 1973. DO NOT TAP THE GLASS."],
];
/** Calling the staff on him. */
export const SPIEL_STAFF: ByPants = {
  clean: ['A LINE CUTTER IS ON THE THRONE. ATTENDANTS, REMOVE HIM.', 'ATTENDANTS. A LINE CUTTER. YOU ARE AUTHORIZED TO USE THE PLUNGERS.'],
  shitty: ['ATTENDANTS. THE LINE CUTTER HAS SOILED A THRONE. THAT IS NOT A TRIBUTE.', 'ATTENDANTS. THE LINE CUTTER HAS SHIT HIMSELF ON A SACRED SEAT.'],
  nude: ['ATTENDANTS. THE LINE CUTTER IS NUDE ON A THRONE. NOBODY SIT THERE AFTER HIM.', 'ATTENDANTS. A NAKED MAN IS ON THE THRONE. BRING THE LONG GLOVES.'],
};
/** Another wave coming. */
export const SPIEL_MORE = ['MORE ATTENDANTS TO THE PLATFORM, PLEASE.', 'ALL ATTENDANTS. ALL OF THEM.'];
export const SPIEL_CLEAR = ['THE THRONE WILL NOW CONTINUE. PLEASE BE SEATED.', 'THANK YOU FOR YOUR PATIENCE. THE ATTENDANTS ARE DEAD.'];
export const SPIEL_BACK = ['THIS THRONE WILL NOW RETURN TO THE STATION. THANK YOU FOR SITTING WHERE THE STARS SAT.'];
export const SPIEL_EXPERIMENTAL = ['EXPERIMENTAL MODE ENGAGED. THE TRACK IS NOT FINISHED. ENJOY.'];
export const SPIEL_FLIGHT = ['THRONES OF THE STARS IS NOT RESPONSIBLE FOR. THAT.'];
export const SPIEL_BENT = ['EXPERIMENTAL MODE IS STILL ENGAGED. WE HAVE NOT FOUND ANYONE TO TURN IT OFF.'];
/** The star toilets: him sat on one (each); on his own; clogged; the blowout coming. */
export const SPIEL_THRONE_SIT = [
  ["SIR. THAT IS DINO SINATRELLI'S TOILET. SIR. YOUR PANTS."],
  ["SIR. MARLOWE BRANDOE'S CLOG IS STILL IN THERE. DO NOT ADD TO IT."],
  ['SIR. THAT CASE IS NOT TO BE OPENED. SIR. THE CASE IS FOR US.'],
];
export const SPIEL_THRONE_AGAIN = ['HE IS BACK ON IT.', 'AGAIN. HE IS DOING IT AGAIN. HE HAS NO SHAME.'];
export const SPIEL_THRONE_CLOG = ['THE RELIC HAS BEEN ADDED TO. THE RELIC IS RUINED.', 'THAT IS NOT A STAR. THAT IS A NOBODY. HE ATE CORN.'];
export const SPIEL_THRONE_UHOH = ['THE THRONE IS MAKING A NOISE IT SHOULD NOT MAKE.', 'PLEASE STAND CLEAR OF THE THRONE. ALL OF YOU. NOW.'];

/** The park's PA (the boulevard's trailer voice) in the queue: Stuntman Steve. */
export const PA_STEVE_QUEUE = [
  "WHILE YOU WAIT: STUNTMAN STEVE'S STUPENDOUS STUNTERY! HE ONCE FELL OFF A HORSE IN A MOVIE! ON PURPOSE!",
  "STUNTMAN STEVE TESTED THIS RIDE! HE DOES NOT HAVE A THRONE! HE'S FINE WITH THAT! HE'S TOTALLY FINE!",
];

// ---------------------------------------------------------------------------------------------------------------
// The sleeper in the control booth (he never wakes up)

export const SLEEPER = 'm2.hollywood.sleeper';
export const SLEEPER_MUMBLE: ByPants = {
  clean: ['MMM. FIVE MORE MINUTES, MOM.', "ZZZ. I'M ON MY UNION BREAK. ZZZ.", 'CHURROS. SO MANY CHURROS.'],
  shitty: ['SNIFF. WHO DIED. ZZZ.', 'SNIFF. GARY, DID YOU SHIT THE BOOTH AGAIN.'],
  nude: ["MMM. BIG NAKED GUY. I SHOULDN'T HAVE EATEN THAT BURRITO.", 'NO PANTS AT WORK. THIS DREAM AGAIN.'],
};
export const SLEEPER_LEVER = ['EXPERIMENTAL. SOUNDS GOOD. ZZZ.'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him on the coaster (by source), and the death screen

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:hwc_rideop': {
    hurt: ['SHOVED BY A TEENAGER IN A VISOR!', "OW! YOU'RE NOT OLD ENOUGH TO DRIVE!", 'STOP BLOWING THAT WHISTLE IN MY EAR!'],
    death: ['ESCORTED OFF THE RIDE', 'REMOVED BY A RIDE OPERATOR'],
  },
  'm2:hwc_janitor': {
    hurt: ['WHACKED WITH A PLUNGER!', "OW! IT'S WET! WHY IS IT WET?!", "OW! HE'S GOT NOTHING TO LOSE!"],
    death: ['CLEANED UP BY THE JANITOR', 'MOPPED UP'],
  },
  'm2:hwc_plunger': {
    hurt: ['A PLUNGER! ON MY FACE!', "IT'S SUCKING MY FACE OFF!", "GET IT OFF! IT'S BEEN IN THE TOILETS!"],
    death: ['PLUNGED', 'FACE-PLUNGED'],
  },
  'm2:hwc_docent': {
    hurt: ['POKED BY A MUSEUM NERD!', "OW! THAT'S A POINTER, NOT A SWORD!", 'QUIT LECTURING ME WITH THAT STICK!'],
    death: ['LECTURED TO DEATH', 'KILLED ON A TOUR OF A TOILET'],
  },
  'm2:hwc_pointer': {
    hurt: ['I CHARGED RIGHT INTO THE POINTER!', 'RIGHT IN THE TAINT! FOR EDUCATION!', 'WHO SHARPENS A POINTER?!'],
    death: ['CHARGED INTO A POINTER', 'POINTED AT. FATALLY'],
  },
  'm2:hwc_guard': {
    hurt: ['BATON TO THE KIDNEYS!', 'OW! HE FAILED THE COP EXAM AND TOOK IT OUT ON ME!', 'HE HIT ME WITH THE FLASHLIGHT!'],
    death: ['BEATEN BY THRONE SECURITY', 'KILLED BY A MALL COP'],
  },
  'm2:hwc_throne': {
    hurt: ["MY ASS! I'M WEARING A CELEBRITY!"],
    death: ['DIED LIKE THE KING', 'BLEW UP A FAMOUS TOILET', 'KILLED BY HIS OWN SHIT', 'SAT THERE TOO LONG'],
  },
  'm2:hwc_fumes': {
    hurt: ['THE FUMES! MY EYES!', "IT'S IN MY MOUTH! SEVENTY-THREE IS IN MY MOUTH!", 'I CAN TASTE THE ROCK STAR!'],
    death: ["GASSED BY A ROCK STAR'S SHIT", 'DIED OF VINTAGE FUMES'],
  },
};

const pools = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...CUT_LINE, ...SHOVE, ...STEVE_STANDEE, ...BOARD, ...BOARD_AGAIN, ...Object.values(RIDE_LINES).flat(), ...TOILET_LINES.flat(),
    ...STAFF_OUT, ...CLEARED, ...LOCKED, ...WALKER, ...BOOTH, ...LEVER_LOCKED, ...LEVER_FIRST, ...LEVER, ...LAUNCH, ...RIDE_BACK, ...BENT,
    ...THRONE_SIT.flat(), ...THRONE_SIT_AGAIN, ...THRONE_CASE, ...THRONE_STRAIN, ...THRONE_PLOP, ...THRONE_CLOG, ...THRONE_STAND,
    ...THRONE_DONE, ...THRONE_UHOH, ...THRONE_BLOW,
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [GUEST_VOICES.m]: pools(QUEUE_OUTRAGE),
  [GUEST_VOICES.f]: pools(QUEUE_OUTRAGE),
  [STAFF_VOICES.rideop]: pools(RIDEOP_BARK), [STAFF_VOICES.rideopf]: pools(RIDEOP_BARK),
  [STAFF_VOICES.janitor]: pools(JANITOR_BARK), [STAFF_VOICES.janitorf]: pools(JANITOR_BARK),
  [STAFF_VOICES.docent]: pools(DOCENT_BARK), [STAFF_VOICES.docentf]: pools(DOCENT_BARK),
  [STAFF_VOICES.guard]: pools(GUARD_BARK), [STAFF_VOICES.guardf]: pools(GUARD_BARK),
  [NARRATOR]: [
    ...SPIEL_STATION, ...SPIEL_LIFT, ...SPIEL_INSANE, ...SPIEL_TOILET.flat(), ...pools(SPIEL_STAFF), ...SPIEL_MORE, ...SPIEL_CLEAR,
    ...SPIEL_BACK, ...SPIEL_EXPERIMENTAL, ...SPIEL_FLIGHT, ...SPIEL_BENT,
    ...SPIEL_THRONE_SIT.flat(), ...SPIEL_THRONE_AGAIN, ...SPIEL_THRONE_CLOG, ...SPIEL_THRONE_UHOH,
  ],
  [PA_VOICE]: PA_STEVE_QUEUE,
  [SLEEPER]: [...pools(SLEEPER_MUMBLE), ...SLEEPER_LEVER],
};
