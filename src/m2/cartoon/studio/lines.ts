// What's said in LEARN THE MAGIC OF HOW CARTOONS ARE MADE (EST. 1994), by voice (cartoon/voices.ts gathers it;
// tools/voices records it). Pure data (tools/voices bundles it in node).
//
// THE NARRATOR (m2.cartoon.narrator): the ride's PA, a cheesy 1994 corporate announcer, recorded once and never
// touched since. Smug, chipper, proud of the wrong people: the Americans are visionaries for a napkin and a stamp; the
// Korean animators doing every drawing are, cheerfully, "suckers". The satire's target is HIM (the park's smugness),
// never the animators: they're drawn tired, working, human. A recording: he doesn't react to Meathead (no pants pools).
// One room's story at a time, in turn (pa.ts): nobody talked over.
//
// MEATHEAD: bored, blunt, vulgar; he does not care how cartoons are made. Clean / shitty / naked pools. Talks less
// than the narrator. Never anything about his age.
//
// THE STAFF: the studio's tour staff, on the clock, breaking character (barks: rare, short, by the state of him).

import { allOf, type ByPants, type HurtTable } from '../talk';

export const NARRATOR = 'm2.cartoon.narrator';
/** The staff's voices (cast.json): a man's and a woman's for each; the pencil's inside a foam head. */
export const STAFF_VOICES = {
  guide: 'm2.cartoon.guide', guidef: 'm2.cartoon.guidef',
  intern: 'm2.cartoon.intern', internf: 'm2.cartoon.internf',
  exec: 'm2.cartoon.exec', execf: 'm2.cartoon.execf',
  pencil: 'm2.cartoon.pencil', pencilf: 'm2.cartoon.pencilf',
  guard: 'm2.cartoon.guard', guardf: 'm2.cartoon.guardf',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// The narrator: each room's story, said through in order as its lights come up (pa.ts); `reply` Meathead's say back
// after it (talk less: only some rooms get one).

export interface Story { lines: string[]; reply?: ByPants }

/** Meathead's say backs. */
export const REPLY: Record<'lobby' | 'vision' | 'voice' | 'overseas' | 'inkpaint' | 'premiere', ByPants> = {
  lobby: {
    clean: ["I DON'T WANT TO LEARN. I WANT A RIDE.", 'A HALLWAY WITH A GUY TALKING. I DROPPED OUT TO AVOID THIS.'],
    shitty: ["MY HANDS ARE KEEPING TO MY PANTS. TRUST ME.", "HANDS TO MYSELF? THEY'RE BUSY HOLDING IT IN."],
    nude: ['KEEP MY HANDS TO MYSELF. THAT LEAVES ONE PROBLEM.', "KEEP YOUR HANDS TO YOURSELF. NAKED. THAT'S A BIG ASK, BUDDY."],
  },
  vision: {
    clean: ["HE DREW A CAT ON A NAPKIN. I'VE WIPED MY ASS WITH BETTER.", 'TWO MILLION FOR A NAPKIN. I BLEW MY NOSE IN BETTER.'],
    shitty: ['TWO MILLION FOR A NAPKIN. I COULD USE A NAPKIN RIGHT NOW.', "TWO MILLION DOLLAR NAPKIN. I'D WIPE MY ASS WITH IT. I NEED TO."],
    nude: ['A GENIUS. HE DREW A CAT. I SHOWED A WHOLE PARK MY DICK.', "GIVE ME THAT NAPKIN. IT'S BIG ENOUGH TO COVER IT."],
  },
  voice: {
    clean: ['PAID BY THE MEOW. I WANT THAT JOB.', 'FORTY TAKES OF MEOW. MY UNCLE DOES THAT DRUNK FOR FREE.'],
    shitty: ['PAID BY THE MEOW. I SHOULD GET PAID BY THE SHART.', 'I MAKE NOISES TOO. OUT MY ASS. NO UNION.'],
    nude: ["PAID BY THE MEOW. I'D TAKE OFF MY PANTS FOR THAT. OH.", "PAID BY THE MEOW. I'D DO IT NAKED. I'M ALREADY DRESSED FOR IT."],
  },
  overseas: {
    clean: ["SUCKERS? THOSE GUYS DID ALL OF IT. PONYTAIL DREW A NAPKIN.", 'SUCKERS? THEY DID FORTY THOUSAND DRAWINGS. DAVE DREW A CAT ON A NAPKIN, DRUNK.'],
    shitty: ["THEY'VE BEEN HERE ALL NIGHT. NOBODY GAVE THEM A BATHROOM BREAK EITHER.", "SUCKERS. SAYS THE GUY ON THE TAPE. I'M THE GUY IN BROWN PANTS."],
    nude: ["NOBODY'S EVEN LOOKING UP. I'M NAKED. THAT'S HOW TIRED THEY ARE.", "THEY DON'T CARE I'M NAKED. DEADLINE'S FRIDAY."],
  },
  inkpaint: {
    clean: ["FREE TRADE. THAT'S WHEN SOMEBODY ELSE DOES IT.", 'BY SOMEBODY. SOMEWHERE. FOR PENNIES. CLASSY.'],
    shitty: ['PAINT BY HAND. I PAINTED MY PANTS BY ASS.', "I'M HAND PAINTED TOO. ONE COLOR. BROWN."],
    nude: ['HAND PAINTED. LIKE ME, IF I FALL IN THAT TUB.', "FOR A NICKEL THEY'D PAINT ME SOME PANTS."],
  },
  premiere: {
    clean: ['A CARTOON ABOUT THE WHITE HOUSE CAT. WHAT KIND OF KID WATCHES THAT?', "WHO WANTS THAT ON SATURDAY MORNING? WHERE'S THE ROBOTS? WHERE'S THE TITS?"],
    shitty: ["A SHOW ABOUT A CAT IN THE WHITE HOUSE. I'D SHIT MYSELF FROM BOREDOM. AGAIN.", 'NO KID ON EARTH WANTS THIS. I JUST SHARTED FROM BOREDOM.'],
    nude: ['A WHITE HOUSE CAT SHOW. MY DICK FELL ASLEEP.', "WHAT KID WATCHES THAT? I'D RATHER WATCH ME. EVERYBODY ELSE IS."],
  },
};

export const STORIES: Record<string, Story> = {
  lobby: {
    lines: ['WELCOME, BOYS AND GIRLS, TO LEARN THE MAGIC OF HOW CARTOONS ARE MADE!', 'PLEASE STAY ON THE PATH, AND KEEP YOUR HANDS TO YOURSELF.'],
    reply: REPLY.lobby,
  },
  vision: {
    lines: ['EVERY CARTOON BEGINS WITH A VISION.', 'THIS IS DAVE. IN NINETEEN NINETY THREE, DAVE DREW A CAT ON A NAPKIN. THAT NAPKIN IS NOW INSURED FOR TWO MILLION DOLLARS.', 'DAVE IS WHAT WE IN THE BUSINESS CALL A GENIUS.'],
    reply: REPLY.vision,
  },
  writers: {
    lines: ['NEXT, OUR WRITERS ADD THE JOKES.', "IT TOOK ELEVEN OF AMERICA'S FUNNIEST MEN SIX MONTHS TO COME UP WITH THE WORD WACKY."],
  },
  storyboards: {
    lines: ['OUR STORYBOARD ARTISTS PLAN OUT EVERY SINGLE SHOT.', "SOME OF THEM ARE STICK FIGURES. IN THE BUSINESS, WE CALL THAT STYLE."],
  },
  voice: {
    lines: ["THEN, HOLLYWOOD'S BIGGEST STARS GIVE OUR CHARACTERS THEIR VOICES.", 'THIS IS TAKE FORTY OF THE WORD MEOW. HE GETS PAID BY THE MEOW.'],
    reply: REPLY.voice,
  },
  models: {
    lines: ['OUR ART DIRECTOR APPROVES EVERY DRAWING. WITH A STAMP.', "IT'S EXHAUSTING WORK. HE TAKES FRIDAYS OFF.", 'AND NOW, THE EASY PART.'],
  },
  overseas: {
    lines: ['MEANWHILE, OVERSEAS, OUR FRIENDS IN KOREA DRAW THE OTHER FORTY THOUSAND DRAWINGS.', 'BY HAND. ALL NIGHT. FOR A FRACTION OF THE COST.', 'WHAT SUCKERS!'],
    reply: REPLY.overseas,
  },
  rejects: {
    lines: ['EVERY DRAWING IS CHECKED BY AN AMERICAN SUPERVISOR. MOST OF THEM GO IN THE BIN!'],
  },
  inkpaint: {
    lines: ['NEXT, EVERY CEL IS PAINTED BY HAND. BY SOMEBODY. SOMEWHERE.', "IT'S THE MAGIC OF FREE TRADE!"],
    reply: REPLY.inkpaint,
  },
  camera: {
    lines: ['FINALLY, OUR CAMERA PHOTOGRAPHS EVERY CEL, ONE FRAME AT A TIME.', 'TWENTY FOUR TIMES A SECOND. TAKE A BOW, CAMERA!'],
  },
  premiere: {
    lines: ["AND THEN, IT'S PREMIERE NIGHT!", "THIS PROCESS WAS USED TO MAKE THIS SEASON'S HOT NEW TV SHOW: CHELSEA CLINTON AND SOCKS THE CAT'S WACKY WHITE HOUSE ADVENTURES!"],
    reply: REPLY.premiere,
  },
  screen: {
    lines: ['THE MAGIC CONTINUES BEHIND THE SCREEN. GO ON. NOBODY WILL STOP YOU.'],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In through the front door (the first time). */
export const ARRIVE: ByPants = {
  clean: ["IT'S DARK IN HERE. GOOD. NOBODY CAN SEE ME NOT GIVE A SHIT.", 'A WALK-THROUGH. MY FEET PAID FOR A RIDE.'],
  shitty: ["DARK IN HERE. NOBODY CAN SEE MY PANTS. THEY CAN SMELL THEM.", 'AIR CONDITIONING. MY SWAMP ASS SAYS THANK YOU.'],
  nude: ['DARK IN HERE. GREAT FOR A NAKED GUY. AND MOVIE THEATER PERVERTS.', 'COLD IN HERE. EVERYTHING ON ME JUST SHRANK.'],
};
/** Back in, later (the lights on, nobody on the PA, the staff gone home). */
export const REVISIT: ByPants = {
  clean: ["THE LIGHTS ARE ON. THE GUY ON THE TAPE SHUT UP. BEST VERSION.", 'EVERYBODY WENT HOME. EXCEPT THE GUYS DOING ALL THE WORK.'],
  shitty: ['LIGHTS ON. NOW EVERYBODY CAN SEE MY PANTS.', 'BACK IN THE HALLWAY. STILL SHITTY. STILL NOT LEARNING.'],
  nude: ['LIGHTS ON. GREAT. NOW THE WHOLE HALLWAY SEES IT.', 'NAKED IN AN EMPTY STUDIO. I COULD DRAW SOMETHING. ON MYSELF.'],
};
/** Once each a visit, at what he's passing. */
export const GAGS: Record<'stack' | 'cels' | 'crane' | 'grind' | 'screen', ByPants> = {
  /** A stack of drawings, as it first leans under him. */
  stack: {
    clean: ['A PILE OF DRAWINGS. IT LEANS. OF COURSE IT FUCKING LEANS.', 'A MONTH OF SOMEBODY\'S WORK. AND I\'M STANDING ON IT.'],
    shitty: ["DON'T TIP, DON'T TIP. I'M NOT CLEAN ENOUGH TO FALL.", "I'M SMEARING SHIT ON SOMEBODY'S HARD WORK. SORRY, KOREA."],
    nude: ["THIS IS A LOT OF DRAWINGS TO HAVE MY ASS ON.", "NAKED ON A STACK OF ART. THAT'S A MUSEUM PIECE NOW."],
  },
  /** On a moving cel, the first time. */
  cels: {
    clean: ['I\'M RIDING A CARTOON. THIS IS THE ONLY RIDE IN HERE.', 'A PIECE OF PLASTIC ON A HOOK. STILL BEATS THE TEACUPS.'],
    shitty: ["DON'T LOOK DOWN. DON'T SQUEEZE.", 'HANGING OVER PAINT. MY PANTS ALREADY DID A MURAL.'],
    nude: ['OVER A TUB OF PAINT. NAKED. ONE SLIP AND I\'M BLUE.', 'MY BALLS ARE SWINGING MORE THAN THIS CEL.'],
  },
  /** On the camera crane, the first time. */
  crane: {
    clean: ['GOING UP. FINALLY, A RIDE WITH SOME HEIGHT TO IT.', 'A CAMERA CRANE. STILL THE SECOND BEST RIDE IN THIS SHITHOLE.'],
    shitty: ['GOING UP. MY SMELL IS GOING UP WITH ME.', "UP ON THE CRANE. DON'T FILM ME FROM BELOW. TRUST ME."],
    nude: ["DON'T POINT THAT CAMERA AT ME. I'M NOT THAT KIND OF STAR.", 'NAKED ON CAMERA. THIS IS HOW YOU END UP IN THE VALLEY DOING ANAL.'],
  },
  /** The night shift, looked at (he's passing the light tables). */
  grind: {
    clean: ["THE CLOCK SAYS QUARTER TO THREE. NOBODY'S LEAVING.", "THAT GUY'S ASLEEP WITH THE PENCIL STILL IN HIS HAND."],
    shitty: ["THEY'RE EATING CUP NOODLES AT THREE IN THE MORNING. FOR DAVE.", "THEY DON'T EVEN LOOK UP. GOOD. DON'T LOOK."],
    nude: ["NOT ONE OF THEM LOOKED UP. NAKED GUY. THAT'S A REAL DEADLINE.", "THEY'RE TOO TIRED TO SEE MY DICK. RESPECT."],
  },
  /** The screen at the end. */
  screen: {
    clean: ["BEHIND THE SCREEN. SURE. WHAT'S THE WORST THAT HAPPENS.", "THE TAPE SAYS GO BEHIND THE SCREEN. I'VE DONE DUMBER."],
    shitty: ["BEHIND THE SCREEN. NOBODY WILL SEE WHAT'S BEHIND ME.", 'BEHIND THE SCREEN. GOOD PLACE TO LEAVE A SMELL.'],
    nude: ['BEHIND THE SCREEN. FINALLY, SOMETHING TO HIDE MY DICK.', "BEHIND THE SCREEN. THEY'LL JUST SEE MY SHADOW. MOST OF IT."],
  },
};
/** In the paint vat's ink: dyed that color, a second color mixed in, a third and it all cancels out (dye.ts). */
export const INK: Record<'dyed' | 'mixed' | 'undyed', ByPants> = {
  dyed: {
    clean: ["GREAT. I'M A CARTOON NOW. A WET ONE.", 'CEL PAINT. IT SAID NON-TOXIC. MY TONGUE IS NUMB.'],
    shitty: ['PAINT OVER THE SHIT. THAT IS ONE WAY TO FIX IT.', "I'M COLORED IN NOW. EXCEPT THE BROWN PART. THAT'S PERMANENT."],
    nude: ['PAINTED. EVERYWHERE. MY BALLS ARE A NEW COLOR.', "NAKED AND PAINTED. I'M MODERN ART."],
  },
  mixed: {
    clean: ["TWO COLORS. I'M A NEW COLOR. THEY SHOULD PAY ME.", "I MIXED. THAT'S THE COLOR OF A GAS STATION HOT DOG."],
    shitty: ["MIXED IT. THAT'S A COLOR NOBODY WANTS. LIKE MY PANTS.", "TWO COLORS AND THE SHIT. THAT'S THREE."],
    nude: ['NOW I MATCH NOTHING. NAKED AND OFF MODEL.', "TWO COLORS. MY ASS DOESN'T MATCH MY FACE. NEVER DID."],
  },
  undyed: {
    clean: ["THREE COLORS AND IT'S GONE. SCIENCE. DON'T ASK ME.", "BACK TO MEAT COLOR. THAT'S HOW PAINT WORKS, RIGHT?"],
    shitty: ['ALL THE PAINT CAME OFF. THE SHIT STAYED.', "THE COLOR'S GONE. THE SMELL ISN'T."],
    nude: ["BACK TO PINK. ALL OF ME. YOU CAN LOOK AGAIN. DON'T.", 'THE PAINT CANCELED OUT. MY DIGNITY LEFT IN NINETY-FOUR.'],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The staff (barks: rare, short)

/** The tour guide: perky, walking backwards, on a script, losing it. */
export const GUIDE_BARK: ByPants = {
  clean: ['SIR! STAY WITH THE GROUP!', 'HI! WELCOME! I WANT TO DIE!', 'NO FLASH PHOTOGRAPHY! NO PUNCHING! NO FUN!'],
  shitty: ['SIR, THE GROUP HAS ASKED YOU TO LEAVE THE GROUP.', 'WE HAVE RESTROOMS! YOU WALKED PAST FOUR!'],
  nude: ['SIR! SHIRT AND SHOES REQUIRED! AND EVERYTHING ELSE!', 'SIR! I HAVE A LIABILITY FORM FOR THAT!'],
};
/** ...throwing a souvenir plate. */
export const GUIDE_PLATE = ['COMMEMORATIVE PLATE! THIRTY BUCKS!', 'SOUVENIR, ASSHOLE!', 'GIFT SHOP!'];
/** The intern: on no sleep and nine coffees. */
export const INTERN_BARK: ByPants = {
  clean: ["I'M NOT EVEN PAID! I GET CREDIT!", 'THESE ARE FOR DAVE! THESE ARE ALL FOR DAVE!', "DAVE WILL FIRE ME AGAIN! I'M NOT EVEN HIRED!"],
  shitty: ['OH GOD. IS THAT YOU? IT SMELLS LIKE THE CREAMER.', "I HAVE A MASTER'S DEGREE AND I'M SMELLING YOUR SHIT."],
  nude: ["I'M NOT PAID ENOUGH TO SEE THAT! I'M NOT PAID!", 'MY STUDENT LOANS HAVE A BIGGER BALANCE THAN THAT!'],
};
export const INTERN_THROW = ['HOT! HOT! HOT!', 'COFFEE!', "IT'S DECAF!"];
/** The pitch exec: synergy, laser pointer. */
export const EXEC_BARK: ByPants = {
  clean: ["LET'S CIRCLE BACK TO YOU BEING DEAD.", "LET'S TAKE YOUR DEATH OFFLINE.", 'I SEE YOU AS MORE OF A CORPSE.'],
  shitty: ["THE SMELL IS OFF BRAND. LET'S LOSE THE SMELL.", 'WHO GREENLIT THOSE PANTS? BROWNLIT.'],
  nude: ["I'M SEEING A LOT OF YOU. I'M SEEING TOO MUCH OF YOU.", "I DON'T SEE A LOT OF UPSIDE THERE."],
};
export const EXEC_ZAP = ['SEE THE DOT?', 'AS YOU CAN SEE ON THIS SLIDE.', 'BULLET POINT ONE.'];
/** Pencil Pete, the studio's mascot: a giant number two pencil, sharpened on top. */
export const PENCIL_BARK: ByPants = {
  clean: ["I'M PENCIL PETE! I'M A NUMBER TWO!", "IT'S A HUNDRED DEGREES IN HERE AND I'M A PENCIL! I HAVE A BACHELOR'S!", "I'LL ERASE YOU!"],
  shitty: ["I'M A NUMBER TWO! YOU'RE A NUMBER TWO!", 'I CAN SMELL YOU THROUGH THE FOAM! AND I SHIT IN HERE!'],
  nude: ["I'M SHARP! YOU'RE NAKED! THIS ENDS BADLY FOR YOU!", "MY ERASER'S BIGGER THAN YOUR WHOLE SITUATION!"],
};
export const PENCIL_SPIN = ['SHARPENING!', 'GRIND TIME!', 'POINTY!'];
/** Studio security: tired, big, on a radio. */
export const GUARD_BARK: ByPants = {
  clean: ['SIR. SIR. SIR. SIR.', "THIS IS A WALK-THROUGH. YOU'RE A RUN-THROUGH.", "CODE TWELVE IN THE NAPKIN ROOM. I'M ON MY LUNCH."],
  shitty: ["CODE BROWN. I REPEAT, CODE BROWN.", "I'M NOT TOUCHING YOU, SIR. THAT'S WHAT THE STICK IS FOR."],
  nude: ["WE GOT A NAKED ONE. THIRD TODAY. IT'S THE AC.", "PUT IT AWAY, SIR. I'VE SEEN BIGGER ON THE WRITERS."],
};
export const GUARD_WHISTLE = ['HEY!', 'STOP RIGHT THERE!', 'HOLD IT!'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here, and the death screens (28 characters at most)

export const HURT: HurtTable = {
  'm2:ct_guide': { hurt: ['THE TOUR GUIDE HIT ME!', 'SHE HIT ME WITH A CLIPBOARD!', 'CLOTHESLINED BY A TOUR!'], death: ['KILLED ON A TOUR', 'DIED WITH THE GROUP'] },
  'm2:ct_flagpole': { hurt: ['I RAN INTO HER FLAG!', 'THE TOUR FLAG! IN MY GUT!', 'WHY DOES A TOUR FLAG NEED A POINT!'], death: ['SKEWERED BY A TOUR FLAG', 'FLAGGED DOWN. FOR GOOD'] },
  'm2:ct_plate_shot': { hurt: ['A SOUVENIR PLATE! IN THE FACE!', 'THIRTY BUCKS! RIGHT IN THE TEETH!', "A PLATE! WITH DAVE'S FACE ON IT!"], death: ['KILLED BY A SOUVENIR PLATE', 'COMMEMORATED'] },
  'm2:ct_intern': { hurt: ['THE INTERN SHOVED ME!', 'SHOVED BY A GUY WHO LIVES WITH HIS MOM!', 'SHOVED BY FREE LABOR!'], death: ['KILLED BY AN INTERN', 'DONE IN BY FREE LABOR'] },
  'm2:ct_coffee_shot': { hurt: ['HOT COFFEE! MY FACE!', 'SCALDING! IT WAS DAVE\'S!', "COFFEE IN MY CROTCH! I'M SUING! LIKE THAT LADY!"], death: ['SCALDED TO DEATH', "DROWNED IN DAVE'S COFFEE"] },
  'm2:ct_exec': { hurt: ['HE HIT ME WITH A BINDER!', 'HE HIT ME WITH A QUARTERLY REPORT!', 'HIT BY MIDDLE MANAGEMENT!'], death: ['KILLED IN A MEETING', 'DOWNSIZED'] },
  'm2:ct_laser_shot': { hurt: ['MY EYE! THE LASER POINTER!', 'THE DOT! THE DOT IS IN MY EYE!', 'BULLET POINTED IN THE EYE!'], death: ['POINTED AT TO DEATH', 'BLINDED BY A POWERPOINT'] },
  'm2:ct_pencil': { hurt: ['THE PENCIL GOT ME!', 'A NUMBER TWO SPUN INTO ME!', 'SHAVINGS! IN MY MOUTH!'], death: ['SHARPENED TO DEATH', 'KILLED BY A NUMBER TWO'] },
  'm2:ct_pencil_point': { hurt: ['I STOMPED ON THE POINT!', "THE LEAD! IN MY FOOT! I'LL GET POISONED!", 'NUMBER TWO! UP MY ASS!'], death: ['IMPALED ON A PENCIL', 'LEAD POISONING'] },
  'm2:ct_guard': { hurt: ['THE GUARD TACKLED ME!', "HE SMELLS LIKE HOT POCKETS AND HE'S ON ME!", 'FLASHLIGHT! RIGHT ON THE HEAD!'], death: ['TACKLED BY RENT-A-COP', 'ESCORTED OUT. FOREVER'] },
};

// ---------------------------------------------------------------------------------------------------------------
// The announcer's kill callouts, by kind

export const KILL_CALLS: Record<string, Record<string, string[]>> = {
  'm2:ct_guide': { charge: ['TOUR OVER!', 'LOST THE GROUP!'], uppercut: ['FLAGGED!'], divekick: ['GROUPED!'] },
  'm2:ct_intern': { charge: ['UNPAID!', 'COFFEE BREAK!'], uppercut: ['INTERNED!'], divekick: ['NO CREDIT!'] },
  'm2:ct_exec': { charge: ['DOWNSIZED!', 'CIRCLED BACK!'], uppercut: ['PROMOTED!'], divekick: ['BOTTOM LINE!'] },
  'm2:ct_pencil': { charge: ['ERASED!', 'SNAPPED!'], uppercut: ['SHARPENED!'], divekick: ['BROKEN LEAD!'] },
  'm2:ct_guard': { charge: ['OFF DUTY!', 'NO OVERTIME!'], uppercut: ['ESCORTED!'], divekick: ['CODE RED!'] },
};

const pools = (b: ByPants) => allOf(b);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...[ARRIVE, REVISIT, ...Object.values(GAGS), ...Object.values(REPLY), ...Object.values(INK)].flatMap(allOf),
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flatMap(k => Object.values(k).flat()))],
  [NARRATOR]: Object.values(STORIES).flatMap(s => s.lines),
  [STAFF_VOICES.guide]: [...pools(GUIDE_BARK), ...GUIDE_PLATE], [STAFF_VOICES.guidef]: [...pools(GUIDE_BARK), ...GUIDE_PLATE],
  [STAFF_VOICES.intern]: [...pools(INTERN_BARK), ...INTERN_THROW], [STAFF_VOICES.internf]: [...pools(INTERN_BARK), ...INTERN_THROW],
  [STAFF_VOICES.exec]: [...pools(EXEC_BARK), ...EXEC_ZAP], [STAFF_VOICES.execf]: [...pools(EXEC_BARK), ...EXEC_ZAP],
  [STAFF_VOICES.pencil]: [...pools(PENCIL_BARK), ...PENCIL_SPIN], [STAFF_VOICES.pencilf]: [...pools(PENCIL_BARK), ...PENCIL_SPIN],
  [STAFF_VOICES.guard]: [...pools(GUARD_BARK), ...GUARD_WHISTLE], [STAFF_VOICES.guardf]: [...pools(GUARD_BARK), ...GUARD_WHISTLE],
};
