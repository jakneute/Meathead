// DEAD-EYE DOOLEY'S SHOOTIN' GALLERY's lines (gallery.ts): Dooley the booth man (his pitch, his slide from confused to
// irritated to existential as the ray gun takes his gallery out of existence a piece at a time, the panic attack after,
// the chewing out), and Meathead's few. Pure data (tools/voices bundles it in node: nothing here pulls in the engine).

import { allOf, type ByPants } from '../talk';

/** Dooley's voice (cast.json). */
export const DOOLEY_VOICE = 'm2.frontier.dooley';

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
/** UP with a fight still going near the booth. */
export const DOOLEY_NOT_NOW: ByPants = same(['FINISH YOUR FIGHT FIRST, PAL.', 'NO SHOOTING WHILE SOMEBODY IS SHOOTING AT YOU.']);

// ---------------------------------------------------------------------------------------------------------------
// The gallery (first person: his face in the corner)

/** It starts. */
export const DOOLEY_START: ByPants = same(['THREE ROWS OF DUCKS! KNOCK EM DOWN!', 'AIM FOR THE DUCKS, CHAMP! AND THE BANDITS!']);
/** Nothing shot for a while, nothing gone yet. */
export const DOOLEY_IDLE: ByPants = same(['SHOOT SOMETHING, CHAMP! THE CLOCK IS RUNNING!', 'YOU GONNA SHOOT OR WHAT?']);
/** The tiers, by how much of the set no longer exists. Each tier's first line is said first. */
export const DOOLEY_TIERS: ByPants[] = [
  // (1: the first thing gone: confused)
  same(['HEY. WHERE DID THE DUCK GO?', 'THAT IS NOT HOW THE DUCKS WORK.', 'WHAT IS THAT GUN? THAT IS NOT MY GUN.', 'THE DUCK IS SUPPOSED TO FALL DOWN. NOT... LEAVE.']),
  // (2: irritated)
  same(['QUIT IT! THOSE ARE RENTAL DUCKS!', 'KNOCK THEM DOWN! DOWN! NOT OUT OF EXISTENCE!', 'I HAVE TO SIGN FOR THOSE!', 'STOP ZAPPING MY STUFF, YOU MEATHEAD!', 'WHO TAUGHT YOU TO PLAY A SHOOTING GALLERY? SATAN?']),
  // (3: it dawns on him)
  same(['OH GOD, THEY NO LONGER EXIST.', 'WHERE DO THEY GO? WHERE DO THE DUCKS GO?', 'THERE IS NO BODY. THERE IS NOTHING TO BURY.', 'IS THERE A HEAVEN FOR TIN DUCKS? IS IT TIN?', 'THEY WERE HERE. I PAINTED THEIR LITTLE EYES.']),
  // (4: existential)
  same(['WHAT IS DEATH? IS THIS DEATH?', 'IF A DUCK CAN JUST STOP BEING, CAN I JUST STOP BEING?', 'NINETEEN YEARS I WORKED THIS BOOTH. WHAT DID I BUILD? NOTHING. LITERALLY NOTHING.', 'WAS ANY OF IT REAL? WERE THE DUCKS EVER REAL?']),
  // (5: the bottom falls out)
  same(['IS ANYTHING REAL? AM I REAL?', 'THERE IS NOTHING BEHIND IT. THERE WAS ALWAYS NOTHING BEHIND IT.', 'I CAN SEE THE VOID. IT DOES NOT HAVE A PRIZE SHELF.', 'I WANT MY MOMMY.', 'WE ARE ALL JUST DUCKS ON A RAIL.']),
];
/** What he says to a particular thing going (said ahead of the tier's, once each). */
export const DOOLEY_SAW: Record<string, ByPants> = {
  moon: same(['YOU SHOT THE MOON. WHO SHOOTS THE MOON?', 'NOT THE MOON! IT HAD A FACE!']),
  sky: same(['THAT WAS THE SKY! I PAINTED THAT SKY!', 'THE MESAS! TWELVE BUCKS IN PAINT!']),
  void: same(['WHAT IS THAT? WHAT IS BEHIND THE WALL?', 'THERE IS NOTHING BACK THERE. OH GOD, THERE IS NOTHING.']),
  counter: same(['THAT IS MY COUNTER! I LEAN ON THAT!']),
  score: same(['THE SCORE DOES NOT MEAN ANYTHING NOW. IT NEVER DID.']),
  bandit: same(['THE BANDITS HAD FAMILIES! PAINTED ON THE BACK!']),
  prize: same(['THE PRIZES! NOBODY EVER WON THOSE! NOW NOBODY EVER WILL!']),
};

// ---------------------------------------------------------------------------------------------------------------
// After (back in the street): the panic attack

/** The beat back in the street (no controls): his first, by how much he lost. */
export const DOOLEY_OPEN_NONE: ByPants = same([
  'YOU DID NOT EVEN SHOOT. WHY DID YOU NOT SHOOT? WHAT ARE YOU? WHAT DO YOU WANT?',
  'FIFTY SECONDS OF YOU STARING AT ME! I CANNOT BREATHE! WHY CAN I NOT BREATHE?',
]);
export const DOOLEY_OPEN_SMALL: ByPants = same([
  'YOU MADE A DUCK STOP BEING. HOW? HOW DID YOU DO THAT?',
  'GONE FOREVER! DO YOU KNOW WHAT THAT DOES TO A MAN?',
]);
export const DOOLEY_OPEN_BIG: ByPants = {
  clean: ['YOU ERASED IT! YOU ERASED MY WHOLE LIFE, YOU SICK SON OF A BITCH!', 'WHAT DID YOU DO TO MY GALLERY? WHERE IS IT? WHERE DID IT GO?'],
  shitty: ['YOU SHAT YOURSELF AND ERASED MY WHOLE LIFE! IN THAT ORDER!', 'WHAT DID YOU DO TO MY GALLERY? AND WHY DO YOU SMELL LIKE THAT?'],
  nude: ['A NAKED MAN ERASED MY WHOLE LIFE WITH A RAY GUN! I CANNOT BREATHE!', 'WHAT DID YOU DO TO MY GALLERY, YOU NAKED FREAK?'],
};
export const DOOLEY_OPEN_ALL: ByPants = same([
  'IT IS GONE! ALL OF IT! THE DUCKS! THE SKY! THE MOON! THERE IS NOTHING LEFT!',
  'THERE IS NOTHING! YOU SHOT IT ALL INTO NOTHING! THERE IS NOT EVEN A WALL!',
]);
/** In play, over and over while he paces (plain words over his head): the panic attack, chewing him out. */
const PANIC_BASE = [
  'I CANNOT FEEL MY HANDS! I CANNOT FEEL MY DUCKS!',
  'BREATHE. IN THROUGH THE NOSE. OH GOD, WHAT IF MY NOSE STOPS EXISTING?',
  'YOU ARE A MONSTER! A BIG, DUMB MONSTER!',
  'WHAT DO I TELL CORPORATE? THE DUCKS WENT TO NOTHING?',
  'NINETEEN YEARS! NINETEEN YEARS OF DUCKS!',
  'MY CHEST! IS IT A HEART ATTACK? IT IS A HEART ATTACK!',
  'GET AWAY FROM ME! DO NOT POINT THAT AT ME!',
  'IS THIS A DREAM? PINCH ME! NO! DO NOT TOUCH ME!',
  'EVERYBODY IS A WINNER! THAT WAS THE DEAL! NOBODY WINS NOW!',
];
export const DOOLEY_PANIC: ByPants = {
  clean: [...PANIC_BASE, 'GET OUT OF MY SIGHT, YOU DUCK MURDERER!'],
  shitty: [...PANIC_BASE, 'YOU ERASED MY LIFE AND YOU SMELL LIKE SHIT!', 'I AM HYPERVENTILATING YOUR FARTS! WORST DAY OF MY LIFE!'],
  nude: [...PANIC_BASE, 'AND YOU ARE NAKED! WHY ARE YOU NAKED? WHY IS ANYTHING?', 'STOP JIGGLING AT ME! I AM HAVING A PANIC ATTACK!'],
};
/** On a later visit to his wrecked booth (he's still at it, quieter): muttering. */
export const DOOLEY_MUTTER: ByPants = same(['THEY NO LONGER EXIST. THEY NO LONGER EXIST.', 'WHERE DO THE DUCKS GO...', 'NOTHING BEHIND IT. NOTHING.']);

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Accepting (into the gallery). */
export const MH_ACCEPT: ByPants = {
  clean: ['I BROUGHT MY OWN GUN.', 'DUCKS. EASY.'],
  shitty: ['I BROUGHT MY OWN GUN. AND MY OWN SMELL.', 'DUCKS. EASY. SQUISHY, BUT EASY.'],
  nude: ['I BROUGHT MY OWN GUN. IT IS ALL I BROUGHT.', 'DUCKS. EASY. AND BREEZY.'],
};
/** His answer to the chewing out (the end of the beat in the street). */
export const MH_PRIZE: ByPants = {
  clean: ['SO DO I GET A PRIZE OR WHAT?', 'SO WHO WON?'],
  shitty: ['SO WHAT DO I WIN? NEW PANTS?', 'SO DO I GET A PRIZE OR WHAT?'],
  nude: ['WHAT IS MY PRIZE? PANTS WOULD BE NICE.', 'SO WHO WON?'],
};
/** Dooley killed. */
export const MH_KILL: ByPants = {
  clean: ['EVERYBODY IS A WINNER.', 'NOW YOU NO LONGER EXIST.'],
  shitty: ['EVERYBODY IS A WINNER. EVEN MY PANTS.', 'NOW YOU NO LONGER EXIST. LIKE MY DIGNITY.'],
  nude: ['EVERYBODY IS A WINNER. ESPECIALLY ME.', 'NOW YOU NO LONGER EXIST. LIKE MY PANTS.'],
};
/** The shard picked up. */
export const MH_SHARD: ByPants = {
  clean: ['THERE IS MY PRIZE.', 'DEAD EYE, BABY.'],
  shitty: ['THERE IS MY PRIZE. SHAT FOR IT, TOO.', 'DEAD EYE, BABY.'],
  nude: ['THERE IS MY PRIZE. NOWHERE TO PUT IT.', 'DEAD EYE, BABY.'],
};

const DOOLEY_ALL = [DOOLEY_GREET, DOOLEY_OFFER, DOOLEY_DECLINED, DOOLEY_NOT_NOW, DOOLEY_START, DOOLEY_IDLE, ...DOOLEY_TIERS, ...Object.values(DOOLEY_SAW), DOOLEY_OPEN_NONE, DOOLEY_OPEN_SMALL, DOOLEY_OPEN_BIG, DOOLEY_OPEN_ALL, DOOLEY_PANIC, DOOLEY_MUTTER];
const uniq = (l: string[]) => [...new Set(l)];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: uniq([MH_ACCEPT, MH_PRIZE, MH_KILL, MH_SHARD].flatMap(allOf)),
  [DOOLEY_VOICE]: uniq(DOOLEY_ALL.flatMap(allOf)),
};
