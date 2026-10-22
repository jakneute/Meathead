// What's said on HELICOPTER RIDES ACROSS THE WORLD, by voice: HELICOPTER HARRY (the tour's relentlessly nice, preachy
// pilot, then, thrown out of his own helicopter, the bigot he always was: swearing nonstop, NO slurs), the landmark
// mechs (each its own voice: they trash-talk, the Leaning Tower most of all), his jetpack lackeys (the ride's cast
// members), the guests in the queue he skips, Meathead (sparse), and every way the gauntlet can hurt or kill him.
// Pure data (tools/voices bundles it in node). American spelling. Pick with pickLine (no line twice inside 45 s).

import { pavilionVoices, type ByPants, type HurtTable } from '../talk';

export const HARRY = 'm2.foreign.harry';
export const GOON = { m: 'm2.foreign.jetgoon', f: 'm2.foreign.jetgoonf' } as const;
export const GUEST = { m: 'm2.guest2', f: 'm2.guest' } as const;

export type MechId = 'eiffel' | 'opera' | 'redeemer' | 'pisa' | 'taj' | 'bigben' | 'colosseum' | 'pyramid' | 'moai';
/** The gauntlet's order (the souvenir launcher's, light to heavy). */
export const MECHS: MechId[] = ['eiffel', 'opera', 'redeemer', 'pisa', 'taj', 'bigben', 'colosseum', 'pyramid', 'moai'];
export const MECH_VOICE: Record<MechId, string> = {
  eiffel: 'm2.foreign.mech_eiffel', opera: 'm2.foreign.mech_opera', redeemer: 'm2.foreign.mech_redeemer', pisa: 'm2.foreign.mech_pisa',
  taj: 'm2.foreign.mech_taj', bigben: 'm2.foreign.mech_bigben', colosseum: 'm2.foreign.mech_colosseum', pyramid: 'm2.foreign.mech_pyramid', moai: 'm2.foreign.mech_moai',
};
/** Its name on the health bar (the park's sizes). */
export const MECH_NAME: Record<MechId, string> = {
  eiffel: 'THE EIFFEL TOWER (3X ACTUAL SIZE)', opera: 'THE SYDNEY OPERA HOUSE (NOW WITH LEGS)', redeemer: 'CHRIST THE REDEEMER (XXL)',
  pisa: 'THE LEANING TOWER OF PISA', taj: 'THE TAJ MAHAL (SUPERSIZED)', bigben: 'BIG BEN (BIGGER BEN)', colosseum: 'THE COLOSSEUM (EVEN MORE COLOSSAL)',
  pyramid: 'THE GREAT PYRAMID (GREATER)', moai: 'EASTER ISLAND HEAD (THE WHOLE GUY)',
};

// ---------------------------------------------------------------------------------------------------------------
// The helipad: the queue he skips

export const QUEUE_SHOUT = [
  'HEY! THERE IS A LINE!', "WE'VE BEEN WAITING THREE HOURS!", 'I PAID FOR A FAST PASS, YOU FAT FUCK!',
  'MY KIDS ARE CRYING AND YOU JUST WALK RIGHT PAST US?', 'SECURITY! LINE CUTTER!', "I'M CALLING GUEST RELATIONS! I HAVE THEM ON SPEED DIAL!",
];
export const QUEUE_SHOUT_SHAT = ['HE SHIT HIMSELF AND HE STILL CUT THE LINE!', 'OH GOD, THE SMELL! LET HIM GO! LET HIM GO FIRST!'];
export const QUEUE_SHOUT_NUDE = ["HE'S NAKED! WHY IS HE NAKED AT THE FRONT OF THE LINE?", 'COVER THE KIDS EYES! HE CUT THE LINE NAKED!'];

// ---------------------------------------------------------------------------------------------------------------
// The tour (Harry, nice)

/** He climbs in past the whole line (Harry doesn't mind: by his pants). */
export const HARRY_BOARD: ByPants = {
  clean: [
    "HEY THERE, FRIEND! YOU SKIPPED THE LINE, BUT THAT'S OKAY. LINES ARE A SOCIAL CONSTRUCT. HOP IN!",
    "WELCOME ABOARD, BROTHER! NO TICKET? NO PROBLEM! THE SKY BELONGS TO EVERYBODY!",
  ],
  shitty: [
    'WELCOME ABOARD, FRIEND! I SEE YOU HAD AN ACCIDENT. NO JUDGMENT HERE. EVERY BODY IS DIFFERENT. HOP IN.',
    "HEY, BROTHER! SMELLS LIKE SOMEBODY'S HAD A ROUGH DAY. THAT'S OKAY. THIS IS A SAFE SPACE. A SMELLY SAFE SPACE.",
  ],
  nude: [
    "WELCOME ABOARD, FRIEND! NO CLOTHES? BEAUTIFUL. THE HUMAN BODY IS NOTHING TO BE ASHAMED OF. PLEASE DON'T SIT ON MY JACKET.",
    "WHOA! A FREE SPIRIT! LOVE IT, BROTHER. BUCKLE UP. CAREFULLY. AROUND EVERYTHING.",
  ],
};
/** The tour itself, in order (said one after another while the park turns below). Trimmed (the user: "shorten the
 *  hippie's lecture a bit"): the welcome, the bigger landmarks, the straws. */
export const HARRY_TOUR = [
  "I'M HELICOPTER HARRY, AND TODAY WE'RE GOING TO FLY ACROSS THE WHOLE BEAUTIFUL WORLD. NO BORDERS UP HERE, MAN.",
  'DOWN THERE: THE EIFFEL TOWER. THREE TIMES BIGGER THAN THE REAL ONE. IN AMERICA, EVERYTHING IS BIGGER. EVEN OTHER PLACES.',
  "THE HELICOPTER RUNS ON RECYCLED FRYER OIL FROM THE FUNNEL CAKE STAND. I ALSO BROUGHT REUSABLE STRAWS FOR EVERYBODY. HERE'S YOURS. IT'S BAMBOO.",
];
/** Meathead, fed up, between the tour's lines (sparse; the last is always the same). */
export const MH_TOUR = ['UH HUH.', "I DON'T WANT A STRAW."];
export const MH_SHUT_UP = 'SHUT UP, HIPPIE.';
/** Harry, as he's kicked out the door (still nice: it's the last time). */
export const HARRY_SHOVED = ['WHOA! BROTHER! THAT IS NOT A SAFE SPACE!'];
/** Up off the ground where he landed, the facade gone, the remote out, in order. */
export const HARRY_TURNS = [
  'I WAS FAKING IT THE WHOLE TIME, YOU SON OF A BITCH!',
  'TWENTY YEARS OF TOLERANCE! TWENTY YEARS OF SMILING AT DAMN FOREIGNERS AND THEIR FOREIGN-ASS LANDMARKS, YOU COCKSUCKER!',
  'LANDMARKS OF THE WORLD! WAKE YOUR ASSES UP AND KILL THIS PRICK!',
];
export const MH_TAKES = ['MY HELICOPTER NOW.', "HOW HARD CAN FLYING BE? IT'S GOT A STICK."];

// ---------------------------------------------------------------------------------------------------------------
// The gauntlet: Harry, down on the ground chasing after him with the remote (swearing, no slurs; by his pants)

/** Each landmark coming on: Harry, on the ground, yells it up with his remote. */
export const HARRY_SEND: Record<MechId, ByPants> = {
  eiffel: {
    clean: ["FRANCE! GET UP AND KILL THAT MOTHERFUCKER! THE ONE TIME YOU DON'T SURRENDER!", 'EIFFEL TOWER! UP! KILL THE HIJACKING SON OF A BITCH!'],
    shitty: ['EIFFEL TOWER! KILL THE SHIT-PANTS! HE SMELLS LIKE YOUR WHOLE COUNTRY!', 'FRANCE! UP! STOMP THAT STINKING COCKSUCKER!'],
    nude: ['EIFFEL TOWER! KILL THE NAKED BASTARD! YOU PEOPLE LOVE NAKED! GO GET HIM!', 'FRANCE! THERE IS A NUDIST IN MY HELICOPTER! YOUR KIND OF GUY! KILL HIM ANYWAY!'],
  },
  opera: {
    clean: ['AUSTRALIA! YOU FANCY-ASS BOAT SHED! UP! SING THAT DIPSHIT TO DEATH!', "OPERA HOUSE! I DON'T KNOW WHAT YOU ARE! A PILE OF SAILS? KILL HIM, JACKASS!"],
    shitty: ['OPERA HOUSE! KILL THE SHITTY BASTARD! HIT A HIGH NOTE ON HIS STINKING ASS!', 'UP, YOU SEASHELL SUMBITCH! THE SHIT-PANTS IS GETTING AWAY!'],
    nude: ["OPERA HOUSE! THERE'S A NAKED MAN IN MY SKY! DO SOMETHING CULTURAL TO HIM!", 'UP, SAILBOAT! KILL THE NAKED DOUCHEBAG!'],
  },
  redeemer: {
    clean: ["BRAZIL! ARMS OUT, BIG GUY! GIVE THAT PIECE OF SHIT A HUG HE WON'T WALK AWAY FROM!", 'BIG GUY! UP! REDEEM THAT MOTHERFUCKER RIGHT OUT OF MY SKY!'],
    shitty: ['HEY, BIG GUY! REDEEM THIS SON OF A BITCH! HE SHIT IN MY HELICOPTER SEAT!', 'UP, BIG GUY! HE SHIT HIMSELF! THAT SEAT WAS HEMP, YOU FUCKWIT! KILL HIM!'],
    nude: ["BIG GUY! THE NAKED ONE! HUG HIM! NO, WAIT, DON'T HUG HIM! KILL HIM!", 'UP, BIG GUY! SMITE THE NAKED JACKASS!'],
  },
  pisa: {
    clean: ["PISA! YOU CROOKED COCKSUCKER! FALL ON HIM! IT'S ALL YOU'RE GOOD FOR!", 'PISA! UP! LEAN ON THAT DIPSHIT! LEAN HARD!'],
    shitty: ["PISA! FALL ON THE SHITTY BASTARD! YOU'VE BEEN TRYING TO FALL FOR SIX HUNDRED YEARS!", 'PISA! FLATTEN THE STINKING SHIT-FOR-BRAINS!'],
    nude: ["PISA! SQUASH THE NAKED FREAK! YOU'RE ALREADY HALFWAY THERE!", 'PISA! FALL ON THE NUDIST, YOU CROOKED SUMBITCH!'],
  },
  taj: {
    clean: ["TAJ MAHAL! THE BIG WHITE ONION! UP! KILL THE SON OF A BITCH!", 'TAJ MAHAL! UP, YOU FANCY-ASS TOMB! PUT THAT JACKASS IN YOU!'],
    shitty: ['TAJ MAHAL! KILL THE SHITTY BASTARD! YOU KNOW WHAT? YOU MAKE A NICE TOILET!', 'UP, TOMB! THE STINKING DOUCHEBAG NEEDS BURYING!'],
    nude: ['TAJ MAHAL! KILL THE NAKED GUY! HE IS DEFILING YOUR LAWN!', 'UP, YOU MARBLE MOTHERFUCKER! THE NUDIST!'],
  },
  bigben: {
    clean: ["BIG BEN! YOU TEA-SIPPING CLOCK! IT'S KILLING TIME! GET IT? NOBODY EVER GETS IT, YOU ASSHOLES!", 'BIG BEN! UP! TIME TO DIE, SHIT-FOR-BRAINS! THAT ONE THEY GET!'],
    shitty: ['BIG BEN! KILL THE SHITTY BASTARD! YOU BRITS LOVE A BAD SMELL! THE FOOD!', 'UP, BIG BEN! STRIKE TWELVE ON THAT STINKING COCKSUCKER!'],
    nude: ["BIG BEN! THERE'S A NAKED MAN FLYING MY HELICOPTER! STIFF UPPER LIP AND KILL HIM!", 'UP, BIG BEN! KILL THE NAKED FUCKWIT!'],
  },
  colosseum: {
    clean: ['COLOSSEUM! YOU BROKE-ASS ROMAN DONUT! ARE YOU NOT ENTERTAINED? THEN KILL HIM!', 'UP, COLOSSEUM! THUMBS DOWN ON THAT MOTHERFUCKER!'],
    shitty: ["COLOSSEUM! THROW HIM TO THE LIONS! THE LIONS WON'T EAT HIM! HE SHIT HIMSELF!", 'UP, YOU RUIN! FEED THE STINKING BASTARD TO SOMETHING!'],
    nude: ['COLOSSEUM! A NAKED GUY! YOU ROMANS LOVED THAT SHIT! NOW KILL HIM!', 'UP, DONUT! GLADIATE THE NAKED DIPSHIT!'],
  },
  pyramid: {
    clean: ['PYRAMID! THE BIG TRIANGLE! ALIENS BUILT YOU AND EVEN THEY GAVE UP! KILL HIM!', 'UP, PYRAMID! BURY THAT SON OF A BITCH WITH THE OTHER MUMMIES!'],
    shitty: ['PYRAMID! KILL HIM! HE SMELLS LIKE A FOUR THOUSAND YEAR OLD TOMB!', 'UP, TRIANGLE! THE SHITTY COCKSUCKER IS STILL FLYING!'],
    nude: ['PYRAMID! NAKED MAN! WRAP HIM UP LIKE A MUMMY AND KILL HIM!', 'UP, PYRAMID! SAND IN THE NUDIST! ALL OF IT!'],
  },
  moai: {
    clean: ['EASTER ISLAND! BIG HEAD! SHOW HIM YOUR BODY! YEAH! THEY HAVE BODIES! LOOK IT UP, JACKASS!', 'BIG HEAD! LAST ONE! STARE THAT MOTHERFUCKER TO DEATH!'],
    shitty: ['BIG HEAD! LAST ONE! KILL THE SHITTY SON OF A BITCH! STARE HIM TO DEATH!', 'UP, ROCK HEAD! THE STINKING BASTARD IS ALL THAT IS LEFT!'],
    nude: ["BIG HEAD! LAST ONE! HE'S NAKED! YOU'RE NAKED! YOU'LL GET ALONG! KILL HIM!", 'UP, BIG HEAD! ONE NAKED DOUCHEBAG TO GO!'],
  },
};
/** Each landmark wrecked: Harry's reaction. */
export const HARRY_LOST: Record<MechId, string[]> = {
  eiffel: ['SON OF A BITCH! TYPICAL FRENCH! FOLDED LIKE A CHEAP LAWN CHAIR!', 'FRANCE! YOU USELESS PILE OF FRENCH SCRAP!'],
  opera: ['THE OPERA HOUSE! SHIT! WHO EVEN GOES TO THE OPERA! NOBODY! GOOD RIDDANCE, YOU FANCY-ASS SHED!'],
  redeemer: ['YOU KILLED THE BIG GUY! YOU KNOW HOW MANY POSTCARDS HE WAS ON, YOU COCKSUCKER?'],
  pisa: ["PISA! YOU USELESS CROOKED PIECE OF SHIT! YOU HAD ONE JOB! FALL ON HIM!"],
  taj: ["THE TAJ MAHAL! SHIT! THAT WAS A TOMB, YOU KNOW! NOW IT'S TWO TOMBS, YOU DIPSHIT!"],
  bigben: ["BIG BEN! MOTHERFUCKER! WHAT TIME IS IT? IT'S TIME FOR ME TO KILL YOU, THAT'S WHAT!"],
  colosseum: ['THE COLOSSEUM! IT WAS ALREADY BROKE! YOU BROKE IT MORE, YOU SON OF A BITCH!'],
  pyramid: ['THE PYRAMID! FOUR THOUSAND YEARS IT STOOD! TEN MINUTES WITH YOU, SHIT-FOR-BRAINS!'],
  moai: [],
};
/** Harry heckling up at him now and then (by his pants; the clean ones go to every state). */
export const HARRY_HECKLE: ByPants = {
  clean: [
    'I HATE THE WORLD! ALL OF IT! EXCEPT AMERICA! AND NOT EVEN ALL OF AMERICA!',
    'THEY SHOULD BUILD A WALL AROUND THE WALL!',
    'TWENTY YEARS OF TOURS! EVERY ONE A LIE! I HATE FRYER OIL, YOU MOTHERFUCKER!',
    'GO BACK TO WHERE YOU CAME FROM! NOT YOU! THE BUILDINGS!',
    'RECYCLING IS A SCAM, YOU SON OF A BITCH! IT ALL GOES IN THE SAME DUMPSTER!',
    'I DRIVE A TRUCK! A BIG ONE! SIX MILES TO THE GALLON AND I LOVE IT, YOU DIPSHIT!',
    'GET DOWN HERE, YOU HELICOPTER-STEALING COCKSUCKER!',
    'YOU KNOW WHAT THAT HELICOPTER COST? NEITHER DO I! THE PARK PAID! STILL MINE, ASSHOLE!',
    'METRIC SYSTEM! SOCCER! TINY CARS! AND YOU! THE FOUR WORST THINGS!',
    'HEY, SHIT-FOR-BRAINS! THAT IS NOT HOW YOU FLY! YOU FLY LIKE A FRENCHMAN!',
    "I'M GONNA KICK YOUR ASS SO HARD YOUR ANCESTORS FEEL IT, JACKASS!",
    'COME DOWN HERE AND FIGHT LIKE A MAN, YOU FUCKWIT!',
    'I KNEW YOU WERE TROUBLE THE SECOND YOU CUT THE LINE, YOU SUMBITCH!',
    "BAMBOO STRAWS! I HANDED OUT BAMBOO STRAWS FOR TWENTY YEARS! I'LL SHOVE ONE UP YOUR ASS!",
    'NAMASTE MY ASS! NAMASTE YOUR WHOLE ASS!',
    'YOU PIECE OF SHIT! I HAD A PENSION! IT WAS ATTACHED TO THAT HELICOPTER!',
    'HEY, DOUCHEBAG! WHO TAUGHT YOU TO FLY? A EUROPEAN?',
    'I DID SIX THOUSAND TOURS! SIX THOUSAND, YOU BASTARD! I SMILED THROUGH EVERY ONE!',
  ],
  shitty: [
    'YOU SHIT IN MY HELICOPTER! THAT SEAT WAS HEMP!',
    'THE WHOLE SKY SMELLS LIKE YOUR ASS! I CAN SMELL IT FROM DOWN HERE!',
    'SHIT-PANTS! YOU KNOW HOW HARD IT IS TO GET SHIT OUT OF HEMP?',
    'I WAS FAKING TOLERANCE, BUT I WAS NEVER FAKING THAT SMELL! THAT SMELL IS REAL!',
    'YOU STINKING SON OF A BITCH! YOU CROP-DUSTED MY WHOLE PARK!',
    "HEY, SHITTY! IT'S RAINING SOMETHING AND IT'S NOT RAIN!",
  ],
  nude: [
    'PUT SOME PANTS ON! THIS IS A FAMILY RIDE!',
    "YOUR BARE ASS IS ON MY SEAT! I'M BURNING THAT HELICOPTER! AFTER I SHOOT IT DOWN!",
    "I SAID BODIES WERE BEAUTIFUL! I LIED! YOURS ISN'T!",
    "EVERYBODY IN THE PARK CAN SEE YOUR WIENER! IT'S A HELICOPTER! IT'S IN THE SKY!",
    "NAKED IN MY COCKPIT! THAT'S A WORD I CAN'T SAY ANYMORE, YOU PERVERT!",
    'HEY, NUDIE! THE KIDS ARE LOOKING UP, YOU SICK SUMBITCH!',
  ],
};
/** Harry when his lackeys die. */
export const HARRY_GOONS = [
  'THOSE WERE GOOD AMERICAN KIDS! FROM OHIO!', 'SHIT! I GOT A WHOLE STAFF MEETING OF THEM! SEND MORE!',
  'KAYLEE, YOU USELESS DIPSHIT! YOU HAD ONE JOB!', 'MORE KIDS! I GOT JETPACKS FOR ALL OF THEM! THE LIABILITY WAIVERS ARE SIGNED!',
  'YOU CHOPPED UP BRANDON, YOU MOTHERFUCKER! HE WAS EMPLOYEE OF THE MONTH!', "THAT'S COMING OUT OF YOUR PAYCHECK! ...THEIRS! NOT YOURS! SHIT!",
  'TYLER! GET UP! ...TYLER IS IN TWO PIECES. GODDAMN IT, TYLER.', 'NEXT WAVE! AND THIS TIME AIM, YOU JACKASSES!',
  'MINIMUM WAGE AND THEY STILL CAN\'T KILL ONE GUY! USELESS!', 'I TRAINED THOSE KIDS! TWO HOURS! TWO WHOLE HOURS!',
  'SON OF A BITCH! THAT WAS MY NEPHEW! HE OWED ME MONEY!', 'MORE INTERNS! THE CHEAP ONES!',
];
/** Harry when the boy gets hurt. */
export const HARRY_GLOAT = [
  'HA! TAKE THAT, YOU HIJACKING SON OF A BITCH!', 'YEAH! RIGHT IN THE HELICOPTER!', "THAT'S WHAT YOU GET FOR SKIPPING THE LINE!",
  'HA! SUCK IT, COCKSUCKER!', "HOW'S THAT FEEL, SHIT-FOR-BRAINS?", 'BULLSEYE, YOU BASTARD!',
  'HA! DIE IN MY AIRSPACE, DIPSHIT!', 'THAT ONE WAS FOR THE STRAWS!', 'RIGHT IN THE FACE, YOU FUCKWIT!',
  'HA! BLEED ON MY UPHOLSTERY, ASSHOLE!', 'YEAH! THE LANDMARKS STILL GOT IT!', 'HA! WHO SKIPS THE LINE NOW, JACKASS?',
];

/** The end: every landmark wrecked; Harry's had enough (by his pants). */
export const HARRY_END: ByPants = {
  clean: ["THAT'S IT! I'M DONE WITH TOLERANCE, I'M DONE WITH THE WORLD, AND I'M DONE WITH YOU, MOTHERFUCKER! I GOT A ROCKET LAUNCHER!"],
  shitty: ["THAT'S IT! NO MORE MISTER NICE GUY! SAY GOODBYE, SHIT-PANTS! THIS IS AN AMERICAN ROCKET LAUNCHER!"],
  nude: ["THAT'S IT! I'M SHOOTING YOUR NAKED ASS OUT OF THE SKY, YOU PERVERT! AMERICAN ROCKET! AMERICAN EXPLOSION!"],
};
export const MH_ROCKET = ['OH, COME ON.'];
export const HARRY_HIT = ['MISSION ACCOMPLISHED! SEE YOU ON THE GROUND, YOU SON OF A BITCH!'];

// ---------------------------------------------------------------------------------------------------------------
// The landmarks (each its own voice)

export interface MechTalk { intro: string[]; taunt: string[]; hurt: string[]; die: string[] }
export const MECH_TALK: Record<MechId, MechTalk> = {
  eiffel: {
    intro: ['BONJOUR, AMERICAN. I AM THE EIFFEL TOWER. ALSO, I AM NOW HUNGRY FOR BLOOD.'],
    taunt: ['YOU SMELL OF CHEESEBURGER AND DIVORCE.', 'I AM ART. YOU ARE A MAN WHO SKIPS THE LINES.', 'HON HON HON. THAT IS A LAUGH. I DO NOT KNOW WHY I SAID IT.', 'MY ELEVATOR IS BROKEN. I WILL TAKE IT OUT ON YOU.'],
    hurt: ['SACRE BLEU! MY RIVETS!'],
    die: ['I SURRENDER! I SURRENDER!'],
  },
  opera: {
    intro: ["G'DAY, MATE! I'M THE OPERA HOUSE! THIS ONE'S A TRAGEDY! FOR YOU!"],
    taunt: ["EVERYBODY THINKS I'M A BUNCH OF BOATS! I'M A BUILDING, MATE!", 'TICKETS TO YOUR DEATH! SOLD OUT!', "I LOOK LIKE TOENAIL CLIPPINGS AND I'M STILL PRETTIER THAN YOU!", "THE FAT LADY'S SINGING, MATE! SHE'S ME!"],
    hurt: ["OI! THAT'S MY GOOD SAIL!"],
    die: ['THE SHOW... IS... CANCELED, MATE.'],
  },
  redeemer: {
    intro: ['MY ARMS ARE OPEN, BROTHER. THEY HAVE BEEN OPEN SINCE NINETEEN THIRTY-ONE. THEY ARE VERY TIRED.'],
    taunt: ['COME HERE. LET ME HUG YOU. TO DEATH.', 'A HUNDRED YEARS WITH MY ARMS UP. SMELL MY PITS.', 'I AM VERY FORGIVING. NOT TODAY.', 'NOBODY EVER HUGS ME BACK.'],
    hurt: ['OW. MY ARMS. MY OLD ARMS.'],
    die: ['FINALLY. I CAN PUT MY ARMS DOWN.'],
  },
  pisa: {
    intro: ["CIAO, LOSER! I'M THE LEANING TOWER OF PISA! I'M IMPERVIOUS! YOU CAN'T HURT ME! NOBODY CAN HURT ME!"],
    taunt: [
      'GO ON! SHOOT ME! IT TICKLES!', "I'VE BEEN FALLING FOR SIX HUNDRED YEARS AND I'VE NEVER FALLEN! THAT'S HOW TOUGH I AM!",
      "BULLETS? ROCKETS? I'M MADE OF MARBLE AND SPITE!", "YOU'RE WASTING YOUR AMMO, IDIOT! IMMUNE! IMMUNE! IMMUNE!",
      "I'M THE GREATEST TOWER IN THE WORLD! I DON'T EVEN NEED TO STAND STRAIGHT!", "IMPERVIOUS! LOOK IT UP! IT MEANS I'M HUNG!",
    ],
    hurt: ['HA! MISSED! WELL, YOU HIT ME! BUT NOTHING HAPPENED!', "THAT DIDN'T EVEN HURT! IMMUNE!"],
    die: [],
  },
  taj: {
    intro: ['WELCOME TO THE TAJ MAHAL. SHOES OFF. ALSO, DIE.'],
    taunt: ['I AM A MONUMENT TO LOVE. I HATE YOU.', 'I AM SYMMETRICAL. YOU ARE NOT. YOUR FACE IS CROOKED.', 'MY MINARETS ARE NOT DECORATIVE. NOT ANYMORE.', 'YOU WILL BE BURIED IN ME. THERE IS ROOM.'],
    hurt: ['MY BEAUTIFUL WHITE MARBLE!'],
    die: ['I WAS... SO... SYMMETRICAL...'],
  },
  bigben: {
    intro: ["RIGHT, THEN! I'M BIG BEN! IT'S HALF PAST YOUR DEATH, INNIT!"],
    taunt: ["BONG! BONG! THAT MEANS YOU'RE DEAD!", "TIME FOR TEA! AND MURDER!", "I'M ACTUALLY CALLED ELIZABETH TOWER! NOBODY CALLS ME THAT! I'M FURIOUS!", 'TICK TOCK, YOU WANKER!'],
    hurt: ['BLOODY HELL! ME GEARS!'],
    die: ['TIME... IS... UP... BONG.'],
  },
  colosseum: {
    intro: ['WELCOME TO THE COLOSSEUM! ARE YOU NOT ENTERTAINED? YOU WILL BE! THEN DEAD!'],
    taunt: ['THUMBS DOWN! THUMBS DOWN FOR YOU!', 'I HAVE SEEN A THOUSAND MEN DIE! YOU ARE NEXT! ALSO A LION!', 'I AM MISSING HALF MY WALLS AND I STILL GET MORE ASS THAN YOU!', 'RELEASE THE LIONS! THE LIONS ARE IN ME! IT IS VERY CROWDED!'],
    hurt: ['MAMMA MIA! MORE HOLES! I HAD ENOUGH HOLES!'],
    die: ['THUMBS... DOWN... FOR... ME...'],
  },
  pyramid: {
    intro: ['I AM THE GREAT PYRAMID. I HAVE STOOD FOR FOUR THOUSAND YEARS. I WILL STAND ON YOU.'],
    taunt: ['ALIENS DID NOT BUILD ME. GUYS DID. GUYS WITH ROPES.', 'MY EYE SEES ALL. IT SEES YOU. IT SEES YOUR PANTS.', 'YOU WILL BE MUMMIFIED. THEY TAKE OUT YOUR BRAIN THROUGH YOUR NOSE.', 'I AM A TRIANGLE. TRIANGLES ARE THE STRONGEST SHAPE.'],
    hurt: ['MY BLOCKS! THEY WEIGH TWO TONS EACH!'],
    die: ['I AM... JUST... A BIG... PILE NOW...'],
  },
  moai: {
    intro: ['...', 'I AM THE HEAD. I AM ALSO THE BODY. NOBODY KNOWS ABOUT THE BODY.'],
    taunt: ['...', 'STARE.', 'I HAVE BEEN STARING AT THE OCEAN FOR EIGHT HUNDRED YEARS. NOW I STARE AT YOU.', 'BIG HEAD. BIG BODY. SMALL DICK. DO NOT LOOK.'],
    hurt: ['THE BODY. BEHOLD. THE BODY.'],
    die: ['...OW.'],
  },
};
/** The Leaning Tower's fall: as it goes, missing him, and on him. */
export const PISA_FALL = ['UH OH. UH OH. UH OH, NO.', 'WHOA. WHOA. WHOA. WHOOOOAAA!'];
export const PISA_MISSED = ['...I MEANT TO DO THAT.', 'OKAY. I FELL OVER. I STILL WIN. IMMUNE.'];
export const PISA_GOT_HIM = ['TOLD YOU! IMPERVIOUS! UNBEATABLE! ...CAN SOMEBODY HELP ME UP?'];
export const MH_PISA_MISSED = ['IT KILLED ITSELF.', "YOU FELL OVER. THAT'S IT? THAT WAS YOUR WHOLE THING?"];

// ---------------------------------------------------------------------------------------------------------------
// The lackeys (the ride's cast members, on emergency jetpacks)

export const GOON_BARK: ByPants = {
  clean: [
    'HARRY SAYS YOU HAVE TO DIE! HARRY SIGNS MY CHECKS!', "I'M NOT EVEN CERTIFIED ON THIS JETPACK!", 'GIVE BACK THE HELICOPTER! IT HAS MY LUNCH IN IT!',
    "I THOUGHT HARRY WAS NICE! HE'S NOT NICE!", 'THIS IS MY FIRST DAY!', 'MY JETPACK IS LEAKING ON MY BALLS!',
  ],
  shitty: ["HE SHIT IN THE HELICOPTER! HARRY'S GONNA MAKE US CLEAN IT!", "I CAN SMELL HIM THROUGH MY HELMET!", 'OH GOD, THE DOWNDRAFT! THE SMELL IS IN THE DOWNDRAFT!'],
  nude: ["HE'S NAKED! I CAN SEE EVERYTHING FROM UP HERE!", "I'M NOT FLYING UNDER HIM! IT'S DANGLING!", 'HIS WHOLE BUTT IS ON THE PILOT SEAT!'],
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead (sparse)

export const MH_KILL: Record<MechId, string[]> = {
  eiffel: ['FRANCE: DOWN.'], opera: ['THE FAT LADY SANG. THEN SHE BLEW UP.'], redeemer: ['YOU CAN PUT YOUR ARMS DOWN NOW.'], pisa: [],
  taj: ['NOT SO SYMMETRICAL NOW.'], bigben: ['BIG BEN. NOW LITTLE BEN.'], colosseum: ['THUMBS DOWN, ASSHOLE.'], pyramid: ["THAT'S A PILE OF ROCKS NOW."], moai: [],
};
export const MH_SHRED = ['SMOOTHIE.', 'CHOPPED.', 'MULCHED!', "THAT'S WHAT THE SPINNY PART IS FOR."];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him up here (each its own source), and what kills him

export const HURT: HurtTable = {
  'm2:fl_jetgoon': { hurt: ['THE JETPACK KID RAMMED ME!', 'GET OFF MY HELICOPTER!'], death: ['RAMMED BY A JETPACK INTERN', "KILLED ON A KID'S FIRST DAY"] },
  'm2:fl_jetgoon_shot': { hurt: ['THE KID SHOT MY HELICOPTER!', 'OW! THEY GAVE THE INTERNS GUNS?'], death: ['SHOT DOWN BY THE RIDE STAFF', 'KILLED BY MINIMUM WAGE'] },
  'm2:fl_mech_eiffel': { hurt: ['I FLEW INTO THE EIFFEL TOWER!', 'OW! THE GIRDERS!'], death: ['IMPALED ON FRANCE', 'FLEW INTO A BIG FRENCH THING'] },
  'm2:fl_mech_eiffel_shot': { hurt: ["RIVETS! IT'S SHOOTING RIVETS!", 'OW! FRENCH RIVETS!'], death: ['RIVETED', 'SHOT BY A TOWER'] },
  'm2:fl_eiffel_beam': { hurt: ['THE SEARCHLIGHT BURNS!', "OW! IT'S A LASER! WHY IS IT A LASER?"], death: ['SEARCHLIGHTED', 'BURNED BY THE CITY OF LIGHT'] },
  'm2:fl_mech_opera': { hurt: ['I FLEW INTO THE OPERA HOUSE!', 'OW! THE SAILS ARE SHARP!'], death: ['CRASHED INTO THE OPERA', 'A TRAGEDY IN ONE ACT'] },
  'm2:fl_mech_opera_shot': { hurt: ['THE NOTES HURT!', 'OW! A HIGH NOTE! RIGHT IN THE EAR!'], death: ['SUNG TO DEATH', 'KILLED BY A HIGH C'] },
  'm2:fl_opera_seagull': { hurt: ['A SEAGULL! GET IT OFF!', 'OW! THE GULL BIT ME!'], death: ['MOBBED BY SEAGULLS', 'PECKED TO DEATH OVER SYDNEY'] },
  'm2:fl_mech_redeemer': { hurt: ['I HIT THE BIG GUY!', "OW! HE'S MADE OF CONCRETE!"], death: ['FLEW INTO THE BIG GUY', 'SMASHED ON A MOUNTAIN STATUE'] },
  'm2:fl_mech_redeemer_shot': { hurt: ["OW! IT'S SHOOTING AT ME FROM ITS HANDS!", 'THE HALO! THE HALO HURTS!'], death: ['SHOT BY A STATUE', 'REDEEMED'] },
  'm2:fl_redeemer_arms': { hurt: ['HE HUGGED ME! IT HURTS!', 'OW! THE ARMS! THE BIG ARMS!'], death: ['HUGGED TO DEATH', 'CRUSHED IN A CONCRETE HUG'] },
  'm2:fl_pisa_fall': { hurt: ['THE TOWER FELL ON ME!', 'NOT ON ME! NOT ON MEEE!', 'OH SHIT, IT ACTUALLY FELL!'], death: ['FIXED THE LEAN WITH HIS FACE', 'IT FINALLY FELL. ON HIM.', 'NOW IT STANDS UP STRAIGHT'] },
  'm2:fl_mech_pisa': { hurt: ['I FLEW INTO THE TOWER!', "OW! IT'S HARD AS HELL!"], death: ['FLEW INTO A CROOKED TOWER', 'KILLED BY ITALIAN MARBLE'] },
  'm2:fl_mech_taj': { hurt: ['I HIT THE TAJ MAHAL!', 'OW! THE DOME!'], death: ['CRASHED INTO A TOMB', 'BURIED IN THE TAJ MAHAL'] },
  'm2:fl_mech_taj_shot': { hurt: ['IT SPITS MARBLES!', "OW! THE DOME'S SHOOTING!"], death: ['MARBLED', 'SHOT BY A MONUMENT TO LOVE'] },
  'm2:fl_taj_minaret': { hurt: ['A MINARET FELL ON ME!', 'OW! IT THREW A TOWER AT ME!'], death: ['HIT BY A FLYING MINARET', 'SQUASHED BY A TOWER IT THREW'] },
  'm2:fl_mech_bigben': { hurt: ['I FLEW INTO THE CLOCK!', 'OW! BIG BEN!'], death: ['CRASHED INTO BIG BEN', 'KILLED AT HALF PAST'] },
  'm2:fl_mech_bigben_shot': { hurt: ["GEARS! IT'S THROWING GEARS!", 'OW! A TEACUP!'], death: ['GEARED', 'KILLED AT TEATIME'] },
  'm2:fl_bigben_hand': { hurt: ['THE CLOCK HAND GOT ME!', 'OW! THE BIG HAND!'], death: ['SLICED BY THE MINUTE HAND', 'HIS TIME WAS UP'] },
  'm2:fl_mech_colosseum': { hurt: ['I HIT THE COLOSSEUM!', 'OW! OLD ROCKS!'], death: ['CRASHED INTO THE COLOSSEUM', 'NOT ENTERTAINED'] },
  'm2:fl_mech_colosseum_shot': { hurt: ["IT'S SHOOTING OUT OF THE WINDOWS!", 'OW! A LION!'], death: ['THROWN TO THE LIONS', 'SHOT FULL OF ROMAN HOLES'] },
  'm2:fl_colosseum_thumb': { hurt: ['THE THUMB! THE GIANT THUMB!', 'OW! THUMBS DOWN!'], death: ['THUMBS DOWN', 'SQUASHED BY A GIANT THUMB'] },
  'm2:fl_mech_pyramid': { hurt: ['I HIT THE PYRAMID!', "OW! IT'S POINTY!"], death: ['CRASHED INTO A PYRAMID', 'FOUR THOUSAND YEARS OF ROCK'] },
  'm2:fl_mech_pyramid_shot': { hurt: ["BLOCKS! IT'S THROWING BLOCKS!", 'OW! SCARABS!'], death: ['HIT BY A TWO TON BLOCK', 'EATEN BY BUGS'] },
  'm2:fl_pyramid_eye': { hurt: ['THE EYE! THE EYE BEAM!', 'OW! IT SEES ME AND IT BURNS!'], death: ['SEEN BY THE ALL-SEEING EYE', 'BURNED BY A TRIANGLE'] },
  'm2:fl_mech_moai': { hurt: ['I HIT THE BIG HEAD!', 'OW! IT HAS A BODY!'], death: ['CRASHED INTO A BIG HEAD', 'THE BIG HEAD HAD A BODY'] },
  'm2:fl_mech_moai_shot': { hurt: ['IT SPIT A ROCK!', 'OW! LITTLE HEADS!'], death: ['STONED', 'KILLED BY LITTLE HEADS'] },
  'm2:fl_moai_stare': { hurt: ['THE STARE! THE STARE BURNS!', 'OW! IT LOOKED AT ME!'], death: ['STARED TO DEATH', 'IT JUST LOOKED AT HIM'] },
};

const pants = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];
const ALL = <T,>(r: Record<string, T>, f: (t: T) => string[]) => Object.values(r).flatMap(f);

export const VOICE_LINES = pavilionVoices({ pa: { clean: [], shitty: [], nude: [] }, arrive: [], gags: [] }, HURT, [[GOON, GOON_BARK]], {
  meathead: [...MH_TOUR, MH_SHUT_UP, ...MH_TAKES, ...MH_ROCKET, ...MH_PISA_MISSED, ...ALL(MH_KILL, l => l), ...MH_SHRED],
  [HARRY]: [
    ...pants(HARRY_BOARD), ...HARRY_TOUR, ...HARRY_SHOVED, ...HARRY_TURNS, ...ALL(HARRY_SEND, pants), ...ALL(HARRY_LOST, l => l),
    ...pants(HARRY_HECKLE), ...HARRY_GOONS, ...HARRY_GLOAT, ...pants(HARRY_END), ...HARRY_HIT,
  ],
  ...Object.fromEntries(Object.entries(MECH_TALK).map(([id, t]) => [MECH_VOICE[id as MechId], [
    ...t.intro, ...t.taunt, ...t.hurt, ...t.die, ...(id === 'pisa' ? [...PISA_FALL, ...PISA_MISSED, ...PISA_GOT_HIM] : []),
  ].filter(l => l !== '...')])),
  [GUEST.m]: [...QUEUE_SHOUT, ...QUEUE_SHOUT_SHAT, ...QUEUE_SHOUT_NUDE],
  [GUEST.f]: [...QUEUE_SHOUT, ...QUEUE_SHOUT_SHAT, ...QUEUE_SHOUT_NUDE],
});
