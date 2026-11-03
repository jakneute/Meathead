// DEAD-EYE DOOLEY'S SHOOTIN' GALLERY's lines (gallery.ts): Dooley the booth man (his pitch, his slide from confused to
// irritated to existential as the ray gun takes his gallery out of existence a piece at a time, the panic attack after,
// the chewing out), and Meathead's few. Pure data (tools/voices bundles it in node: nothing here pulls in the engine).

import { allOf, type ByPants } from '../talk';

/** Dooley's voice (cast.json). */
export const DOOLEY_VOICE = 'm2.frontier.dooley';
/** His calm voice (cast.json: the same man, unhurried): the rules up front and his first puzzled words, so the
 *  meltdown later has somewhere to fall from (the owner's: "he should sound calm for a good comedic beat"). */
export const DOOLEY_CALM_VOICE = 'm2.frontier.dooleycalm';

const same = (l: string[]): ByPants => ({ clean: l, shitty: l, nude: l });

// ---------------------------------------------------------------------------------------------------------------
// At his booth, before

/** The first time he sees him coming (once a visit). */
export const DOOLEY_GREET: ByPants = {
  clean: ['STEP RIGHT UP! STEP RIGHT UP!', 'YOU THERE! YOU LOOK LIKE A DEAD EYE!'],
  shitty: ['STEP RIGHT UP! WHOA. STEP RIGHT BACK.', 'YOU THERE! YOU SMELL LIKE A WINNER. A WINNER WHO SHAT.'],
  nude: ['YOU THERE! YOUR PRIZES ARE SHOWING!', 'STEP RIGHT UP, NAKED MAN! NOT THAT FAR UP!'],
};
/** UP at the counter: the offer (then the ask). */
export const DOOLEY_OFFER: ByPants = {
  clean: ['KNOCK DOWN THE TIN DUCKS, WIN A PRIZE! EVERYBODY IS A WINNER!', 'TEST YOUR AIM, BIG FELLA! FIFTY SECONDS! EVERYBODY IS A WINNER!'],
  shitty: ['KNOCK DOWN THE DUCKS, WIN A PRIZE! AND STAND DOWNWIND, PLEASE.', 'EVERYBODY IS A WINNER. EVEN GUYS WHO SHAT THEMSELVES. LEGALLY.'],
  nude: ['KNOCK DOWN THE DUCKS, WIN A PRIZE! PUT THAT AWAY FIRST.', 'TEST YOUR AIM, MISTER! WITH THE GUN. NOT WITH THAT.'],
};
/** He said no (BACK). */
export const DOOLEY_DECLINED: ByPants = {
  clean: ['YOUR LOSS, CHAMP.', 'COME BACK WHEN YOU GROW A PAIR.'],
  shitty: ['PLEASE DO NOT COME BACK.', 'TAKE YOUR SMELL WITH YOU.'],
  nude: ['AND PUT SOME PANTS ON.', 'YOUR LOSS. MY EYES GAIN.'],
};
/** He's walked off past the booth and out of sight, never played (or backed out): gallery.ts, walkOffCall.ts. */
export const DOOLEY_LEAVE: ByPants = {
  clean: [
    'WHERE ARE YOU GOING? COME BACK! EVERYBODY IS A WINNER!',
    'HEY! BIG FELLA! THE DUCKS ARE BACK HERE!',
    'COME BACK, CHAMP! FIFTY SECONDS! THAT IS ALL I ASK!',
    'DO NOT WALK AWAY FROM A SURE THING, PAL!',
    'COME BACK! THE DUCKS GET LONELY!',
  ],
  shitty: [
    'WHERE ARE YOU GOING? COME BACK! STAY DOWNWIND, BUT COME BACK!',
    'HEY, STINKY! COME BACK! EVERYBODY IS A WINNER! EVEN YOU!',
    'COME BACK! I WILL HOLD MY BREATH!',
    'COME BACK! THE DUCKS DO NOT HAVE NOSES!',
  ],
  nude: [
    'WHERE ARE YOU GOING? COME BACK! I CAN SEE YOUR WHOLE BACKSIDE!',
    'HEY, NAKED MAN! COME BACK! WE GOT A PRIZE SHELF!',
    'COME BACK, MISTER! YOU CAN BORROW MY APRON!',
    'DO NOT WALK AWAY! IT JIGGLES WHEN YOU WALK AWAY!',
  ],
};
/** He's walked off out of sight from the panic attack (the gallery erased, Dooley alive): don't you walk away. */
const LEAVE_PANIC_BASE = [
  'WHERE ARE YOU GOING? YOU CANNOT ERASE A MAN AND LEAVE!',
  'COME BACK! UN-ZAP THEM! MAKE THEM HAVE BEEN THERE!',
  'DO NOT LEAVE ME ALONE WITH THE NOTHING!',
  "WHERE DID THE DUCKS GO? THEY DIDN'T GO! THEY JUST WEREN'T!",
];
export const DOOLEY_LEAVE_PANIC: ByPants = {
  clean: [...LEAVE_PANIC_BASE, 'COME BACK HERE, YOU DUCK ERASER!'],
  shitty: [...LEAVE_PANIC_BASE, 'COME BACK! YOUR SMELL IS THE ONLY THING LEFT THAT WAS EVER THERE!'],
  nude: [...LEAVE_PANIC_BASE, 'COME BACK HERE, YOU NAKED DUCK ERASER!'],
};
/** UP at the counter again after the lazy fail (he never erased a thing): the offer, once more. */
export const DOOLEY_RETRY: ByPants = {
  clean: ['BACK FOR ANOTHER GO, SONNY? THIS TIME, PULL THE TRIGGER.', 'FIFTY MORE SECONDS. AIM AT A DUCK. ANY DUCK.'],
  shitty: ['BACK AGAIN? SHOOT SOMETHING THIS TIME. AND STAND DOWNWIND.', 'FIFTY MORE SECONDS. AIM AT A DUCK. ANY DUCK.'],
  nude: ['BACK AGAIN? THIS TIME SHOOT THE GUN, SONNY. THE GUN.', 'FIFTY MORE SECONDS. AIM AT A DUCK. ANY DUCK.'],
};
/** UP with a fight still going near the booth. */
export const DOOLEY_NOT_NOW: ByPants = same(['FINISH YOUR FIGHT FIRST, PAL.', 'NO SHOOTING WHILE SOMEBODY IS SHOOTING AT YOU.']);

// ---------------------------------------------------------------------------------------------------------------
// The gallery (first person: his face in the corner)

/** It starts (first person, no crosshair yet): the rules, calm and folksy, one then the other, then the countdown.
 *  The owner's: "he explains the rules. 'it's real simple, sonny'". */
export const DOOLEY_RULES_A: ByPants = same(["IT'S REAL SIMPLE, SONNY. SEE THEM LITTLE TIN DUCKS?"]);
export const DOOLEY_RULES_B: ByPants = {
  clean: ['YOU SHOOT EM, THEY FALL DOWN, THEY POP RIGHT BACK UP. FIFTY SECONDS. EVERYBODY IS A WINNER.', 'DUCKS GO DOWN, DUCKS COME BACK UP. BANDITS ARE WORTH A LITTLE EXTRA. FIFTY SECONDS. EVERYBODY IS A WINNER.'],
  shitty: ['YOU SHOOT EM, THEY FALL DOWN, THEY POP RIGHT BACK UP. FIFTY SECONDS. AND NO SUDDEN MOVEMENTS, SONNY. FOR THE SMELL.'],
  nude: ['YOU SHOOT EM, THEY FALL DOWN, THEY POP RIGHT BACK UP. FIFTY SECONDS. BOTH HANDS ON THE GUN, SONNY. THE GUN.'],
};
/** Nothing shot for a while, nothing gone yet (calm). */
export const DOOLEY_IDLE: ByPants = same(['TAKE YOUR TIME, SONNY. BUT THE CLOCK IS RUNNING.', 'ANY TIME NOW, SONNY.']);
/** The tiers, by how much of the set no longer exists. Each tier's first line is said first. The horror's not that
 *  things break: they're erased like they never were (no dent, no pieces, the rail closing up around the gap), and he
 *  can't quite remember what was there. */
export const DOOLEY_TIERS: ByPants[] = [
  // (1: the first thing gone: baffled and terrified at once, the calm gone in one shot; the word for it said first (the
  // owner's: "mentions 'disintegration' on the first item you disintegrate"))
  same([
    "WHAT THE HELL?! IT DIDN'T FALL DOWN! YOU DISINTEGRATED IT! WAS THERE EVEN A DUCK THERE?!",
    "DISINTEGRATED! NOT SHOT! NOT DENTED! DISINTEGRATED! WHAT KIND OF GUN IS THAT?!",
    "NO DENT! NO HOLE! NO DUCK! THE RAIL'S GOT A GAP LIKE IT ALWAYS HAD ONE!",
    "DUCKS DON'T DO THAT! TIN DOESN'T DO THAT!",
    'I HAD TWELVE DUCKS. I THINK. DID I HAVE TWELVE?',
  ]),
  // (2: irritated, and it's starting to get to him)
  same([
    'QUIT IT! THOSE ARE RENTAL DUCKS!',
    'KNOCK THEM DOWN! DOWN! NOT OUT OF EVER BEING!',
    'HOW DO I SIGN FOR A DUCK THAT WAS NEVER THERE?',
    'STOP DISINTEGRATING MY STUFF, YOU MEATHEAD! WHATEVER IT WAS!',
    "MY INVENTORY SHEET'S GOT A BLANK LINE. IT ALWAYS HAD A BLANK LINE. DID IT?",
    "I KEEP COUNTING. THE NUMBER KEEPS BEING RIGHT. THAT'S WHAT SCARES ME.",
  ]),
  // (3: it dawns on him)
  same([
    'OH GOD, THEY NO LONGER EXIST.',
    'NO BODY. NO PIECES. NOT EVEN A SMELL. LIKE THEY WERE NEVER MADE.',
    'THE PRIZE SHELF SCOOTED OVER. IT IS PRETENDING NOTHING WAS THERE.',
    'I PAINTED THEIR LITTLE EYES. DID I? WHOSE EYES DID I PAINT?',
    "WHERE DO THEY GO? THEY DON'T GO. THEY JUST WEREN'T.",
    'EVERY ONE YOU HIT, THE WORLD CLOSES UP OVER THE HOLE. LIKE WATER.',
    "THINGS CAN JUST VAPORIZE. THINGS CAN JUST STOP EXISTING. NOBODY TOLD ME THAT WAS ALLOWED.",
    "IT DIDN'T BREAK. IT DIDN'T BURN. IT JUST STOPPED. EXISTING. WHO SAID THAT WAS AN OPTION?",
  ]),
  // (4: existential: it's not the ducks any more, it's him)
  same([
    'YOU DID NOT KILL IT. KILLING LEAVES SOMETHING. YOU UNMADE IT.',
    'DEATH I COULD TAKE. DEATH YOU GET A FUNERAL. THIS IS WORSE THAN DEATH.',
    'A DEAD DUCK GETS REMEMBERED. THESE DO NOT EVEN GET THAT.',
    'IF YOU ZAP ME, DOES MY MOTHER STILL HAVE A SON? DID SHE EVER?',
    'NINETEEN YEARS IN THIS BOOTH. OR EIGHTEEN. IT IS GETTING SHORTER.',
    "I'M FORGETTING MY WIFE'S FACE. I'M FORGETTING IF I HAD A WIFE.",
    'EVERYTHING I EVER DID COULD BE ONE TRIGGER PULL FROM NEVER HAPPENING.',
    "IF A DUCK CAN STOP EXISTING, SO CAN A MAN. SO CAN THIS TOWN. SO CAN THE SUN.",
    "I SPENT MY WHOLE LIFE SCARED OF DYING. NOBODY WARNED ME ABOUT VAPORIZING.",
  ]),
  // (5: the bottom falls out)
  same([
    'IS ANYTHING REAL? AM I REAL? SOMEBODY TOUCH ME. PROVE IT.',
    'IT CAN JUST BE TAKEN. ANYBODY. ME. AND NOBODY WOULD KNOW TO MISS ME.',
    'NO GRAVE. NO GHOST. NOT EVEN A MEMORY OF A DUCK.',
    'THERE WAS A BOOTH HERE. I THINK. I WORK AT A BOOTH. I THINK.',
    'I CAN SEE THE VOID. IT DOES NOT HAVE A PRIZE SHELF.',
    'I WANT MY MOMMY. DO I HAVE A MOMMY?',
    'WE ARE ALL JUST DUCKS ON A RAIL. AND SOMEBODY IS HOLDING THAT GUN.',
    "I'M NOT AFRAID OF DYING. I'M AFRAID I NEVER LIVED.",
  ]),
];
/** What he says to a particular thing going (said ahead of the tier's, once each). */
export const DOOLEY_SAW: Record<string, ByPants> = {
  moon: same(['YOU SHOT THE MOON. WHO SHOOTS THE MOON?', 'NOT THE MOON! WAS THERE A MOON? THERE WAS A MOON. IT HAD A FACE.']),
  sky: same(['THAT WAS THE SKY! I PAINTED THAT SKY! I THINK I PAINTED A SKY!', 'THE MESAS! TWELVE BUCKS IN PAINT! WHAT PAINT?']),
  void: same(['WHAT IS THAT? WHAT IS BEHIND THE WALL?', 'THERE IS NOTHING BACK THERE. OH GOD, THERE IS NOTHING.']),
  counter: same(['THAT IS MY COUNTER! I LEAN ON THAT! WHAT WAS I LEANING ON?']),
  score: same(['THE SCORE DOES NOT MEAN ANYTHING NOW. IT NEVER DID.']),
  bandit: same(['ALL THAT IS LEFT IS BOOTS. WHOSE BOOTS ARE THOSE?', 'THE BANDITS HAD FAMILIES! NOW THEY NEVER HAD FAMILIES!']),
  prize: same(['THE PRIZES! NOBODY EVER WON THOSE! NOW NOBODY EVER COULD HAVE!', 'THE SHELF CLOSED UP AROUND THE GAP! LIKE IT IS IN ON IT!']),
};

// ---------------------------------------------------------------------------------------------------------------
// The lazy fail (the time up, nothing erased): calm, baffled, a participation sticker

export const DOOLEY_LAZY_A: ByPants = {
  clean: ["FIFTY SECONDS, SONNY. NOT ONE DUCK. NINETEEN YEARS, I NEVER SEEN THAT.", 'SONNY. THE DUCKS WERE RIGHT THERE. THEY WERE GOING SLOW.'],
  shitty: ['FIFTY SECONDS. NOT ONE DUCK. YOU JUST STOOD THERE AND SMELLED.', "SONNY. YOU SHAT YOURSELF AND DIDN'T HIT A THING. I HOPE ONE OF THOSE WAS ON PURPOSE."],
  nude: ['FIFTY SECONDS. NOT ONE DUCK. NAKED. JUST STANDING THERE. NAKED.', 'SONNY. THE DUCKS WERE RIGHT THERE. SO WAS EVERYTHING ELSE OF YOURS.'],
};
export const DOOLEY_LAZY_B: ByPants = same([
  "WELL. HERE'S YOUR PARTICIPATION STICKER. IT SAYS I TRIED. YOU DIDN'T. TAKE IT ANYWAY.",
  'HERE, SONNY. A GOLD STAR. FOR SHOWING UP. THERE, THERE.',
]);
export const DOOLEY_LAZY_C: ByPants = same(['EVERYBODY IS A WINNER. ALMOST EVERYBODY.', 'EVERYBODY IS A WINNER. EXCEPT YOU. COME BACK ANY TIME.']);

// ---------------------------------------------------------------------------------------------------------------
// After (back in the street): the panic attack

/** The beat back in the street (no controls): his first, by how much he lost. */
export const DOOLEY_OPEN_SMALL: ByPants = same([
  'YOU MADE A DUCK NEVER HAVE BEEN. HOW? HOW DID YOU DO THAT?',
  'THERE WAS A DUCK. I KNOW THERE WAS A DUCK. TELL ME THERE WAS A DUCK!',
]);
export const DOOLEY_OPEN_BIG: ByPants = {
  clean: ['YOU ERASED IT! LIKE IT WAS NEVER THERE, YOU SICK SON OF A BITCH!', 'WHAT DID YOU DO TO MY GALLERY? WHAT GALLERY? I HAD A GALLERY!'],
  shitty: ['YOU SHAT YOURSELF AND ERASED MY WHOLE LIFE! THE SHIT IS STILL HERE! MY LIFE IS NOT!', 'WHAT DID YOU DO TO MY GALLERY? AND WHY DO YOU SMELL LIKE THAT?'],
  nude: ['A NAKED MAN ERASED MY WHOLE LIFE WITH A RAY GUN! I CANNOT BREATHE!', 'YOUR DICK IS STILL HERE AND MY DUCKS ARE NOT! HOW IS THAT FAIR?'],
};
export const DOOLEY_OPEN_ALL: ByPants = same([
  'IT IS GONE! ALL OF IT! NOT BROKEN! GONE! LIKE IT NEVER WAS!',
  'THERE IS NOTHING! THERE WAS NEVER ANYTHING! WAS THERE? I HAD A WALL!',
]);
/** In play, over and over while he paces (plain words over his head): the panic attack, chewing him out. */
const PANIC_BASE = [
  'I CANNOT FEEL MY HANDS! ARE THEY STILL THERE? WERE THEY EVER?',
  'BREATHE. IN THROUGH THE NOSE. OH GOD, WHAT IF I NEVER HAD A NOSE?',
  'YOU ARE A MONSTER! A BIG, DUMB MONSTER!',
  'WHAT DO I TELL CORPORATE? I HAD DUCKS? WHAT DUCKS?',
  'NINETEEN YEARS! OR NONE! I CANNOT TELL ANYMORE!',
  'MY CHEST! A HEART ATTACK! AT LEAST A HEART ATTACK LEAVES A BODY!',
  'GET AWAY FROM ME! DO NOT POINT THAT AT ME!',
  'IS THIS A DREAM? PINCH ME! NO! DO NOT TOUCH ME!',
  'EVERYBODY IS A WINNER! THAT WAS THE DEAL! NOBODY WINS NOW!',
  'KILL ME IF YOU HAVE TO! BUT LEAVE A BODY! LEAVE SOMETHING!',
  'SOMEBODY WRITE MY NAME DOWN! JUST IN CASE!',
];
export const DOOLEY_PANIC: ByPants = {
  clean: [...PANIC_BASE, 'GET OUT OF MY SIGHT, YOU DUCK ERASER!'],
  shitty: [...PANIC_BASE, 'YOU ERASED MY LIFE AND YOU SMELL LIKE SHIT!', 'I AM HYPERVENTILATING YOUR FARTS! WORST DAY OF MY LIFE!'],
  nude: [...PANIC_BASE, 'AND YOU ARE NAKED! WHY ARE YOU NAKED? WHY IS ANYTHING?', 'STOP JIGGLING AT ME! I AM HAVING A PANIC ATTACK!'],
};
/** The ray gun out and on him, or fired near him (the owner's: "he is really fucking frightened of the ray gun"):
 *  begging, harder than anything else gets out of him. */
const GUN_BASE = [
  'NOT THE GUN! NOT THE GUN!',
  'PUT IT DOWN! PLEASE! I WILL GIVE YOU ANYTHING! I WILL GIVE YOU THE MOON! I HAVE NO MOON!',
  'SHOOT ME WITH ANYTHING ELSE! A REAL GUN! A ROCK! NOT THAT!',
  'PLEASE! I HAVE A FAMILY! I THINK! ASK ME AFTER!',
  'DO NOT POINT IT! DO NOT EVEN LOOK AT ME WITH IT!',
  'I DO NOT WANT TO HAVE NEVER BEEN BORN!',
  'OH GOD! OH GOD! OH GOD! NOT THE GUN!',
];
export const DOOLEY_GUN: ByPants = {
  clean: [...GUN_BASE, 'MERCY! I AM BEGGING! LOOK AT ME BEG!'],
  shitty: [...GUN_BASE, 'I JUST SHAT MYSELF TOO! WE ARE THE SAME! DO NOT ZAP A BROTHER!'],
  nude: [...GUN_BASE, 'PUT IT AWAY! BOTH OF THEM! THE GUN FIRST!'],
};
/** Erased by the ray gun, his last: said once, thrown back and fading, fading, fading as he goes (gallery.ts). */
export const DOOLEY_ERASED: ByPants = same([
  'NO! NO! I WAS HERE! I WAS HERE!',
  'REMEMBER ME! SOMEBODY REMEMBER ME!',
  'NOT LIKE THE DUCKS! NOT LIKE THE DUCKS!',
  'TELL THEM THERE WAS A DOOLEY!',
  'MOMMY! MOMMY!',
]);
/** Killed any other way (bar the stunt car: he's just crushed, nothing said): a real death, and he's grateful. */
const THANKS_BASE = [
  'OH THANK GOD. REGULAR DEAD.',
  'THANK YOU. A BODY. I GET TO HAVE A BODY.',
  'A CORPSE! I GET A CORPSE! THANK YOU!',
  'THANK YOU. BURY ME. SO THEY KNOW.',
];
export const DOOLEY_THANKS: ByPants = {
  clean: [...THANKS_BASE, 'BLESS YOU, YOU BIG DUMB ANGEL.'],
  shitty: [...THANKS_BASE, 'THANK YOU. EVEN SMELLING LIKE THAT. THANK YOU.'],
  nude: [...THANKS_BASE, 'THANK YOU, NAKED ANGEL. THANK YOU.'],
};
/** On a later visit to his wrecked booth (he's still at it, quieter): muttering. */
export const DOOLEY_MUTTER: ByPants = same(['THEY NO LONGER EXIST. THEY NEVER EXISTED.', 'THERE WAS A DUCK THERE. THERE WAS A DUCK THERE.', 'NOTHING BEHIND IT. NOTHING.']);

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Accepting (into the gallery). */
export const MH_ACCEPT: ByPants = {
  clean: ['I BROUGHT MY OWN GUN.', 'DUCKS. EASY.'],
  shitty: ['I BROUGHT MY OWN GUN. AND MY OWN SMELL.', 'DUCKS. EASY. SQUISHY, BUT EASY.'],
  nude: ['I BROUGHT MY OWN GUN. IT IS ALL I BROUGHT.', 'DUCKS. EASY. AND BREEZY.'],
};
/** The lazy fail: his answer to the sticker. */
export const MH_LAZY: ByPants = {
  clean: ['I WAS SAVING MY BULLETS.', 'THE DUCKS NEVER DID ANYTHING TO ME.'],
  shitty: ['I WAS BUSY. SHITTING.', 'I WAS SAVING MY BULLETS.'],
  nude: ['WHERE AM I SUPPOSED TO STICK THIS?', 'THE DUCKS NEVER DID ANYTHING TO ME.'],
};
/** Dooley's answer to "do I get a prize": the panic starts on it. */
export const DOOLEY_PRIZE: ByPants = {
  clean: ["A PRIZE?! THE PRIZES DON'T EXIST! THE SHELF DOESN'T EXIST! YOU WANT A PRIZE?!", "WON?! NOBODY WON! THERE'S NOTHING LEFT TO WIN! THERE'S NOTHING LEFT!"],
  shitty: ["A PRIZE?! YOU SHIT YOURSELF AND ERASED MY LIFE AND YOU WANT A PRIZE?!", "PANTS?! THE PANTS DON'T EXIST! NOTHING EXISTS!"],
  nude: ["PANTS?! THERE ARE NO PANTS! THERE WERE NEVER ANY PANTS! NOTHING IS REAL!", "WON?! YOU'RE NAKED IN A VOID, SON! NOBODY WON!"],
};
/** His answer to the chewing out (the end of the beat in the street). */
export const MH_PRIZE: ByPants = {
  clean: ['SO DO I GET A PRIZE OR WHAT?', 'SO WHO WON?'],
  shitty: ['SO WHAT DO I WIN? NEW PANTS?', 'SO DO I GET A PRIZE OR WHAT?'],
  nude: ['WHAT IS MY PRIZE? PANTS WOULD BE NICE.', 'SO WHO WON?'],
};
/** Dooley killed (a plain death: after his thanks). */
export const MH_KILL: ByPants = {
  clean: ['EVERYBODY IS A WINNER.', "YOU'RE WELCOME."],
  shitty: ['EVERYBODY IS A WINNER. EVEN MY PANTS.', "YOU'RE WELCOME. DON'T SMELL ME."],
  nude: ['EVERYBODY IS A WINNER. ESPECIALLY ME.', "YOU'RE WELCOME. DON'T LOOK DOWN."],
};
/** Dooley erased (the ray gun). */
export const MH_ERASE: ByPants = {
  clean: ['NOW YOU NO LONGER EXIST.', 'WHO?'],
  shitty: ['NOW YOU NO LONGER EXIST. LIKE MY DIGNITY.', 'WHO?'],
  nude: ['NOW YOU NO LONGER EXIST. LIKE MY PANTS.', 'WHO?'],
};
/** The shard picked up. */
export const MH_SHARD: ByPants = {
  clean: ['THERE IS MY PRIZE.', 'DEAD EYE, BABY.'],
  shitty: ['THERE IS MY PRIZE. SHAT FOR IT, TOO.', 'DEAD EYE, BABY.'],
  nude: ['THERE IS MY PRIZE. NOWHERE TO PUT IT.', 'DEAD EYE, BABY.'],
};

const DOOLEY_CALM = [DOOLEY_RULES_A, DOOLEY_RULES_B, DOOLEY_IDLE, DOOLEY_LAZY_A, DOOLEY_LAZY_B, DOOLEY_LAZY_C];
const DOOLEY_ALL = [DOOLEY_PRIZE, DOOLEY_GREET, DOOLEY_LEAVE, DOOLEY_LEAVE_PANIC, DOOLEY_OFFER, DOOLEY_RETRY, DOOLEY_DECLINED, DOOLEY_NOT_NOW, ...DOOLEY_TIERS, ...Object.values(DOOLEY_SAW), DOOLEY_OPEN_SMALL, DOOLEY_OPEN_BIG, DOOLEY_OPEN_ALL, DOOLEY_PANIC, DOOLEY_GUN, DOOLEY_ERASED, DOOLEY_THANKS, DOOLEY_MUTTER];
const uniq = (l: string[]) => [...new Set(l)];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: uniq([MH_ACCEPT, MH_PRIZE, MH_KILL, MH_ERASE, MH_LAZY, MH_SHARD].flatMap(allOf)),
  [DOOLEY_VOICE]: uniq(DOOLEY_ALL.flatMap(allOf)),
  [DOOLEY_CALM_VOICE]: uniq(DOOLEY_CALM.flatMap(allOf)),
};
