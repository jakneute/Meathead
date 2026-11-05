// The water park, level 2 (THE LAZY RIVER): what's said (ALL CAPS, American spelling; clean / shitty / naked wherever
// it's his or said to him). Every line here is in PARK2_VOICE_LINES (endgame/lines.ts folds it into
// ENDGAME_VOICE_LINES, recorded by npm run voices).
//
// MEHPHISTO: Satan's other son. A goth stoner: apathetic, monotone, "whatever" about everything; the opposite of his
// punk brother BRATHAZAR (Spooky Land's hell: loud, try-hard, DAD! DAD! WATCH!). Under it he badly wants his dad to
// notice him and can't admit it: it leaks out (tell him I did it on purpose; did he see?). Mock him or bring up his
// dad and he snaps and actually tries, for a bit.

import type { ByPants } from '../park1/lines';
export type { ByPants };
const bp = (clean: string[], shitty: string[], nude: string[]): ByPants => ({ clean, shitty, nude });

export const SON_VOICE = 'm2.wp.goth';
export const BURNOUT_VOICE = { m: 'm2.wp.burnout', f: 'm2.wp.burnoutf' };
export const SON_NAME = 'MEHPHISTO';

// ---------------------------------------------------------------------------------------------------------------
// The meeting (meet.ts): at the river's head, on the dock, vaping

/** He sees Meathead (doesn't get up). */
export const SON_HELLO = bp(
  ["OH. IT'S YOU. THE GUY EVERYBODY'S FREAKING OUT ABOUT. COOL. I GUESS."],
  ["OH. IT'S YOU. YOU SMELL LIKE A PORTA POTTY ON FIRE. COOL. I GUESS."],
  ["OH. IT'S YOU. NAKED. COOL. I'M NOT GONNA LOOK. WHATEVER."],
);
export const MH_MEET = bp(["WHO THE FUCK ARE YOU?"], ["WHO THE FUCK ARE YOU? QUIT SNIFFING."], ["WHO THE FUCK ARE YOU? EYES UP HERE."]);
export const SON_NAME_LINE = bp(
  ["MEHPHISTO. SATAN'S OTHER SON. THE ONE HE DOESN'T BRAG ABOUT."],
  ["MEHPHISTO. SATAN'S OTHER SON. YOU'RE NOT THE ONLY DISAPPOINTMENT HERE."],
  ["MEHPHISTO. SATAN'S OTHER SON. AT LEAST I GOT PANTS FROM HIM."],
);
/** What his dad told him to do. */
export const SON_JOB = bp(
  ["DAD SAID SET THE RIVER ON FIRE SO YOU CAN'T GET THROUGH. OR WHATEVER."],
  ["DAD SAID SET THE RIVER ON FIRE SO YOU CAN'T GET THROUGH. YOU'D PUT IT OUT WITH YOUR PANTS."],
  ["DAD SAID SET THE RIVER ON FIRE SO YOU CAN'T GET THROUGH. GOOD LUCK WITH YOUR BALLS."],
);
/** The river up, the leak: he wants it passed on. */
export const SON_LEAK = bp(
  ["TELL MY DAD I DID THAT ON PURPOSE. NOT THAT I CARE."],
  ["TELL MY DAD I DID THAT ON PURPOSE. AND THAT YOU SHIT YOURSELF. HE'LL LIKE THAT."],
  ["TELL MY DAD I DID THAT ON PURPOSE. LEAVE OUT THE NAKED PART."],
);
export const SON_BYE = bp(["WHATEVER. BYE."], ["WHATEVER. SHOWER."], ["WHATEVER. PANTS."]);
export const MH_AFTER_MEET = bp(
  ["THE DEVIL HAS A SPARE. A SAD ONE."],
  ["THE DEVIL'S GOT A SPARE KID. HE SMELLED ME AND LIT A RIVER."],
  ["THE DEVIL'S SPARE KID SET A RIVER ON FIRE TO GET AWAY FROM MY DICK."],
);

// ---------------------------------------------------------------------------------------------------------------
// Meathead, going

export const MH_FIRST_VINE = ['A VINE OVER A RIVER ON FIRE. GREAT.', "SWING. DON'T THINK. DON'T LOOK DOWN."];
export const MH_VINE_BURN = bp(
  ["THE VINE'S ON FIRE! WHY IS THE VINE ON FIRE?!"],
  ["THE VINE'S ON FIRE! IT'S COMING FOR MY ASS!"],
  ["THE VINE'S ON FIRE! IT'S COMING FOR MY BALLS!"],
);
export const MH_LOG = bp(["A BURNING LOG IN A BURNING RIVER. KEEP MOVING."], ["A BURNING LOG. MY ASS IS ALREADY HOT."], ["A BURNING LOG. BETWEEN MY LEGS. HURRY."]);
export const MH_LOG_GOING = ["IT'S FALLING APART! MOVE!", "THE LOG'S DONE! JUMP!", 'OFF THE LOG! OFF!'];
export const MH_TOWER = bp(["A TOWER OF POOL TOYS. ON FIRE. ON A ROCK. IN A FIRE."], ["POOL TOYS ON FIRE. SMELLS BETTER THAN ME."], ["POOL TOYS ON FIRE. DON'T LET IT TOUCH ANYTHING."]);
export const MH_TOWER_GOING = ["IT'S GOING OVER!", 'OFF! GET OFF IT!', "IT'S MELTING!"];
export const MH_GROTTO = bp(
  ["SKULL GROTTO. SMELLS LIKE WEED AND SULFUR. HE'S IN THERE."],
  ["SMELLS LIKE WEED AND SULFUR. AND ME."],
  ["SMELLS LIKE WEED IN THERE. GOING IN NAKED. FINE."],
);
/** Into the river, as he goes in. */
export const MH_RIVER = ["I'M ON FIRE! I'M ON FIRE!", 'HOT HOT HOT HOT!', 'NOT THE RIVER!'];
/** Kicking the grotto's door in. */
export const MH_DOOR = bp(['KNOCK KNOCK, DEVIL BOY.'], ['KNOCK KNOCK. SMELL THAT? ME.'], ['KNOCK KNOCK. NAKED GUY.']);

// ---------------------------------------------------------------------------------------------------------------
// The burnouts (his crew: goth stoner kids, his hangers-on): a bark now and then

export const BURN_BARK = bp(
  ["WHOA. IT'S HIM. MEHPHISTO SAID YOU'D COME.", "DUDE. YOU'RE HARSHING THE FIRE.", 'THIS RIVER IS SO METAL RIGHT NOW.', 'WE WERE HERE FIRST, NORMIE.'],
  ['DUDE. YOU SMELL WORSE THAN OUR BAND.', 'EW. THE NORMIE SHIT HIMSELF.', "NOT EVEN THE SMOKE COVERS THAT."],
  ["WHOA. HE'S NAKED. THAT'S KINDA PUNK.", "DUDE. PUT IT AWAY. IT'S CLOSED CASKET.", 'NAKED AND ON FIRE. RESPECT.'],
);

// ---------------------------------------------------------------------------------------------------------------
// Hurt and death (his hurt callouts, the death screen's one line: 28 characters at most)

export const HURT2: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:wp2_river': { hurt: ["I'M ON FIRE!", 'HOT! HOT! HOT!', 'THE RIVER!'], death: ['DEEP FRIED IN THE LAZY RIVER', 'COOKED IN TANNING OIL'] },
  'm2:wp2_log': { hurt: ['THE LOG!', "IT'S GONE!", 'NO LOG!'], death: ['THE LOG BURNED AWAY', 'STOOD ON IT TOO LONG'] },
  'm2:wp2_tower': { hurt: ['THE TOWER!', "IT'S GOING OVER!", 'POOL TOYS!'], death: ['THE TOWER BURNED DOWN', 'POOL TOYS ARE FLAMMABLE'] },
  'm2:wp2_vine': { hurt: ['THE VINE!', 'IT SNAPPED!', 'NO VINE!'], death: ['THE VINE SNAPPED', 'HUNG AROUND TOO LONG'] },
  'm2:wp2_jet': { hurt: ['FIRE CAME UP OUT OF THE RIVER!', 'MY ASS! THE RIVER SPAT FIRE!', 'A FIRE GEYSER! WHY?!'], death: ['GEYSERED', 'TORCHED FROM BELOW'] },
  'm2:wp2_patch': { hurt: ['HOT! HOT FLOOR!', 'I STEPPED IN FIRE!', 'MY FEET ARE ON FIRE!'], death: ['WALKED INTO A FIRE', 'HOTFOOTED'] },
  'm2:wp2_beam': { hurt: ['THE BRIDGE! MY HEAD!', 'DUCK, DUMBASS! IT SAID DUCK!', 'A BURNING BRIDGE TO THE FACE!'], death: ['SHOULD HAVE DUCKED', 'BURNED A BRIDGE'] },
  'm2:wp2_imp': { hurt: ['THE LITTLE FIRE DEVIL BIT ME!', 'GET OFF ME, YOU HOT GREMLIN!', 'IT CLAWED MY FACE!'], death: ['KILLED BY AN IMP', 'SCRATCHED TO DEATH'] },
  'm2:wp2_impfire': { hurt: ['FIREBALL! FROM A TINY DEVIL!', 'IT THREW FIRE AT ME!', 'MY HAIR! IT GOT MY HAIR!'], death: ['FIREBALLED BY AN IMP', 'TOASTED BY A TINY DEVIL'] },
  'm2:wp2_burnout': { hurt: ['A GOTH KID PUNCHED ME!', 'GET YOUR EYELINER AWAY FROM ME!', 'HE HITS LIKE HE MEANS IT!'], death: ['BEATEN UP BY A GOTH KID', 'KILLED BY A BURNOUT'] },
  'm2:wp2_burnjoint': { hurt: ['THEY THREW A LIT JOINT AT ME!', 'WASTE OF A GOOD JOINT!', 'THE JOINT BURNED ME!'], death: ['KILLED BY A LIT JOINT', 'HOTBOXED'] },
  'm2:wp2_smoke': { hurt: ['THAT SMOKE BURNS!', 'BLOW IT THE OTHER WAY!', 'THEY SMOKED ME OUT!'], death: ['SMOKED OUT', 'SECONDHAND DEATH'] },
  'm2:wp2_son': { hurt: ['THE GOTH KID SHOVED ME!', 'GET OFF ME, MALL VAMPIRE!', "DON'T TOUCH ME, YOU'RE CLAMMY!"], death: ['KILLED BY MEHPHISTO', "SLAIN BY SATAN'S SPARE"] },
  'm2:wp2_sonflick': { hurt: ['HE FLICKED HIS JOINT AT ME!', 'A LIT ROACH! IN MY EYE!', 'THE ROACH BURNS!'], death: ['FLICKED TO DEATH', 'ROACHED'] },
  'm2:wp2_sonring': { hurt: ['A SMOKE RING! A HOT ONE!', 'HE BLEW A RING THROUGH ME!', 'THAT RING BURNS!'], death: ['RINGED', 'VAPED TO DEATH'] },
  'm2:wp2_sonburp': { hurt: ['HE BURPED FIRE ALONG THE FLOOR!', 'MY FEET! HIS BURP!', 'GROSS! AND HOT!'], death: ['BURPED ON', 'FLOOR FIRE'] },
  'm2:wp2_sonpillar': { hurt: ['FIRE OUT OF THE FLOOR!', 'HE MEANT THAT ONE!', 'MY ASS! FROM BELOW!'], death: ['HELLFIRED', 'HE TRIED, FOR ONCE'] },
  'm2:wp2_sonball': { hurt: ['FIREBALL! HE CAN TRY!', 'HE THREW ONE FOR REAL!', 'OW! HE AIMED!'], death: ['FIREBALLED BY MEHPHISTO', 'HE ACTUALLY TRIED'] },
  'm2:wp2_sondrop': { hurt: ['HE LANDED ON ME!', 'FROM THE CEILING?!', 'GET YOUR BONY ASS OFF ME!'], death: ['SAT ON BY A GOTH', 'DROPPED ON'] },
  'm2:wp2_sonbreath': { hurt: ['HIS BREATH IS A FLAMETHROWER!', 'WEED BREATH! ON FIRE!', 'DUCK THE BREATH, IDIOT!'], death: ['TORCHED BY WEED BREATH', 'HOTBOXED BY A GOTH'] },
  'm2:wp2_sontail': { hurt: ['HIS TAIL GOT MY ANKLES!', 'TRIPPED BY A TAIL!', 'THE TAIL! IT WHIPS!'], death: ['TAIL WHIPPED', 'SWEPT BY A TAIL'] },
};

// ---------------------------------------------------------------------------------------------------------------
// The grotto: MEHPHISTO's fight (boss.ts)

/** The intro: on his beanbag in the smoke, not getting up. */
export const SON_INTRO = bp(
  ['UGH. YOU GOT THROUGH. I SET A WHOLE RIVER ON FIRE.'],
  ['UGH. YOU GOT THROUGH. AND YOU BROUGHT THAT SMELL INTO MY GROTTO.'],
  ['UGH. YOU GOT THROUGH. NAKED. INTO MY GROTTO.'],
);
export const MH_INTRO2 = bp(["NICE CAVE. DOES YOUR DAD KNOW YOU LIVE HERE?"], ['NICE CAVE. SMELLS LIKE A BONG AND A SULK.'], ['NICE CAVE. CAN I SIT ON THE BEANBAG? NAKED?']);
export const SON_INTRO2 = bp(
  ["FINE. I'LL KILL YOU. OR WHATEVER. IT'S NOT A BIG DEAL."],
  ["FINE. I'LL KILL YOU. YOU SMELL HALF DEAD ALREADY."],
  ["FINE. I'LL KILL YOU. DON'T SIT ON ANYTHING."],
);
export const SON_RETRY = bp(['YOU AGAIN. COOL. WHATEVER.'], ['YOU AGAIN. STILL GROSS.'], ['YOU AGAIN. STILL NAKED. COOL.']);
/** Lazy: muttered now and then. */
export const SON_LAZY = bp(
  ['THIS IS SO MUCH EFFORT.', 'I COULD BE NAPPING RIGHT NOW.', 'MY BROTHER WOULD BE SCREAMING BY NOW. LAME.', "I DON'T EVEN WANT TO BE HERE."],
  ["YOU SMELL LIKE MY BROTHER'S BAND.", "UGH. YOU'RE DRIPPING ON MY RUG.", "I'M NOT TOUCHING YOU. YOU'RE WET.", 'THIS IS SO MUCH EFFORT. AND IT STINKS.'],
  ["PUT SOMETHING ON. OR DON'T. WHATEVER.", "I'M LOOKING AT THE CEILING. THE WHOLE TIME.", "YOU'RE NOT EVEN WEIRD. JUST NAKED.", "THIS IS SO MUCH EFFORT. AND IT'S NAKED."],
);
/** Meathead, mocking him (his dad, his brother): it gets to him. */
export const MH_MOCK = bp(
  ['YOUR DAD LIKES YOUR BROTHER BETTER.', "BET YOUR DAD DOESN'T EVEN KNOW YOUR NAME.", 'YOUR BROTHER CRIED BETTER THAN YOU FIGHT.', "DADDY'S WATCHING. JUST KIDDING. HE ISN'T."],
  ["YOUR DAD'D BE PROUDER OF MY PANTS.", 'EVEN MY SHIT GETS MORE ATTENTION FROM YOUR DAD.', 'YOUR BROTHER AT LEAST TRIED. HE CRIED, BUT HE TRIED.', "DADDY'S WATCHING. HE'S EMBARRASSED."],
  ['YOUR DAD SEES MORE OF ME THAN HE DOES OF YOU.', 'YOUR BROTHER FOUGHT ME AND STILL TRIED HARDER.', "BET YOUR DAD DOESN'T EVEN KNOW YOUR NAME.", "DADDY'S WATCHING. NOT YOU. ME. I'M NAKED."],
);
export const SON_HURT = bp(['OW. COOL.', 'OW. RUDE.', 'THAT LEFT A MARK. GREAT.'], ['OW. YOU GOT IT ON MY COAT.', 'OW. NOW I SMELL LIKE YOU.', 'GROSS. OW.'], ['OW. YOUR THING TOUCHED ME.', "OW. DON'T BE NAKED AT ME.", 'OW. GROSS.']);
export const SON_LOW = bp(
  ["DAD'S GONNA HEAR ABOUT THIS. FROM MY BROTHER. GREAT."],
  ["I'M LOSING TO A GUY WHO SHIT HIMSELF. DAD'S GONNA LOVE THAT."],
  ["I'M LOSING TO A NAKED GUY. DAD'S GONNA FRAME IT."],
);
/** His standard death: the last line (the leak), then his coat catches off his own joint. */
export const SON_DEATH = bp(["DID HE SEE? TELL ME HE DIDN'T SEE."], ["DID HE SEE? DON'T TELL HIM YOU WERE SHITTY."], ["DID HE SEE? DON'T TELL HIM ABOUT THE NAKED PART."]);
export const SON_BURNING = bp(["DAD! I'M ON FIRE! I THOUGHT WE WERE FIREPROOF!"], ["DAD! I'M ON FIRE! AND I SMELL LIKE HIM!"], ["DAD! I'M ON FIRE! DON'T LET THE NAKED GUY WATCH!"]);
/** Grabbing him (a boss: no). */
export const GRAB_SON = ["HE'S CLAMMY. I'M NOT GRABBING THAT.", "I'M NOT HUGGING A GOTH."];
/** Level 3's stub (shut, for now). */
export const MH_STUB3 = bp(["MAINTENANCE TUNNEL. LOCKED. FOR NOW."], ["LOCKED. I'LL WAIT. I'LL STINK."], ["LOCKED. I'LL WAIT. NAKED."]);


// ---------------------------------------------------------------------------------------------------------------
// Half way down: his brother BRATHAZAR (Spooky Land's punk: his own voice, m2.demon) comes when he's called

/** The son, at half: calling his brother in (it costs him). */
export const SON_CALL = bp(
  ["...FINE. BRATHAZAR. GET IN HERE. NOT 'CAUSE I NEED YOU."],
  ['...FINE. BRATHAZAR, GET IN HERE. BRING A HOSE.'],
  ["...FINE. BRATHAZAR, GET IN HERE. DON'T LOOK AT HIM."],
);
/** The brother, down through the ceiling. */
export const BRO_ARRIVE = bp(
  ['BRO! YOU CALLED ME! DAD, HE CALLED ME! WATCH US!'],
  ['BRO! YOU CALLED ME! EW, HE STILL SMELLS! DAD, WATCH US!'],
  ["BRO! YOU CALLED ME! HE'S STILL NAKED! DAD, WATCH US!"],
);
export const MH_BRO = bp(['OH GOOD. THE CRYBABY.'], ['OH GOOD. THE CRYBABY. HE BROUGHT HIS GUITAR.'], ['OH GOOD. THE CRYBABY. HI AGAIN.']);
/** Down on his knees (out of it till the other's down too). */
export const SON_KNEEL = bp(["...I'M JUST GONNA SIT. WHATEVER."], ["...I'M SITTING DOWN. YOU SMELL TOO BAD TO STAND."], ["...I'M SITTING. I'M NOT LOOKING UP. EVER."]);
export const BRO_KNEEL = bp(["BRO! I'M DOWN! FINISH HIM! DAD, I WAS HELPING!"], ["BRO! I'M DOWN! HE GOT SHIT ON MY GUITAR!"], ["BRO! I'M DOWN! A NAKED GUY DID IT AGAIN!"]);

// ---------------------------------------------------------------------------------------------------------------
// The end (both down): they try to run, he twists them into a pool float, a beer, down the river on them

export const SON_ESCAPE = bp(['BRO. RUN.'], ['BRO. RUN. HE SMELLS LIKE DEATH.'], ["BRO. RUN. DON'T LOOK BACK. HE'S NAKED."]);
export const BRO_ESCAPE = bp(['DAAAD! WAIT UP!'], ["DAAAD! THE SHITTY ONE'S COMING!"], ["DAAAD! THE NAKED ONE'S COMING!"]);
export const MH_STOP = bp(["WHERE THE FUCK DO YOU TWO THINK YOU'RE GOING?"], ['NOBODY LEAVES. NOT EVEN ME, AND I SMELL LIKE THIS.'], ["GET BACK HERE. I'M NAKED AND I'M FAST."]);
export const MH_PRETZEL = bp(
  ['A PRETZEL. A LAVA-PROOF PRETZEL. MADE OF DEVIL KIDS.'],
  ["A DEVIL KID PRETZEL. IT FLOATS. IT'S BETTER THAN MY PANTS."],
  ['A DEVIL KID PRETZEL. IT FLOATS. NOW I HAVE A SEAT.'],
);
/** The demon going by with a beer cart (walking on the fire: it's nothing to him). */
export const BEER_VOICE = 'm2.wp.beerdemon';
export const BEER_DEMON = bp(["ICE COLD BEER! ICE COLD... OH SHIT. IT'S HIM."], ["ICE COLD BEER! OH SHIT. IT'S THE SMELLY ONE."], ["ICE COLD BEER! OH SHIT. IT'S THE NAKED ONE."]);
export const MH_BEER = bp(["DON'T MIND IF I DO."], ["I'LL TAKE ONE. FOR THE SMELL."], ["I'LL TAKE ONE. I'LL HOLD IT WHERE MY POCKET WOULD BE."]);
/** Lounging back on them with it: the last word, then VICTORY on the way down the river. */
export const MH_LOUNGE = bp(['NOW THIS IS A LAZY RIVER.'], ["NOW THIS IS A LAZY RIVER. IT'S WARM UNDER ME. IT'S NOT ME."], ["NOW THIS IS A LAZY RIVER. THE FIRE'S WARMING MY ASS."]);

// ---------------------------------------------------------------------------------------------------------------

const all = (...pools: (string | string[] | ByPants)[]) => pools.flatMap(p => (typeof p === 'string' ? [p] : Array.isArray(p) ? p : Object.values(p).flat()));
export const PARK2_VOICE_LINES: Record<string, string[]> = {
  meathead: all(MH_MEET, MH_AFTER_MEET, MH_FIRST_VINE, MH_VINE_BURN, MH_LOG, MH_LOG_GOING, MH_TOWER, MH_TOWER_GOING, MH_GROTTO, MH_RIVER, MH_DOOR, MH_INTRO2, MH_MOCK, GRAB_SON, MH_STUB3, MH_BRO, MH_STOP, MH_PRETZEL, MH_BEER, MH_LOUNGE, ...Object.values(HURT2).map(h => h.hurt)),
  death: all(...Object.values(HURT2).map(h => h.death)),
  [SON_VOICE]: all(SON_HELLO, SON_NAME_LINE, SON_JOB, SON_LEAK, SON_BYE, SON_INTRO, SON_INTRO2, SON_RETRY, SON_LAZY, SON_HURT, SON_LOW, SON_DEATH, SON_CALL, SON_KNEEL, SON_ESCAPE),
  'm2.demon': all(BRO_ARRIVE, BRO_KNEEL, BRO_ESCAPE),
  [BEER_VOICE]: all(BEER_DEMON),
  [BURNOUT_VOICE.m]: all(BURN_BARK), [BURNOUT_VOICE.f]: all(BURN_BARK),
};
