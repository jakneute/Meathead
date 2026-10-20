// What's said on the fairy wheel (trial one), by voice (fantasy/voices.ts gathers it; tools/voices records it). In the
// user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine. Everybody reacting to
// Meathead in clean / shitty / naked pools. Piper on the PA: her lust is for being fought over (purring over the blood,
// coy about the prize); the suitors read the prize as sex. Pure data (tools/voices bundles it in node).

import { allOf, PIPER_PA_VOICE, type ByPants, type HurtTable } from '../talk';
import { SUITORS } from '../suitors';

// ---------------------------------------------------------------------------------------------------------------
// The roster's voices (cast.json): the three from the bandstand, and five more (DUANE and LORENZO are off the wheel now
// (layout.ts ROSTER: six); their lines stay listed for the clips recorded)

export const WHEEL_VOICES = {
  braxton: SUITORS.braxton.voice, gunnar: SUITORS.gunnar.voice, tremaine: SUITORS.tremaine.voice,
  chad: 'm2.fantasy.suitor_chad', derek: 'm2.fantasy.suitor_derek', wayne: 'm2.fantasy.suitor_wayne',
  duane: 'm2.fantasy.suitor_duane', lorenzo: 'm2.fantasy.suitor_lorenzo',
} as const;
export type RosterId = keyof typeof WHEEL_VOICES;

/** Each one's own cheesy lines (barked now and then as he throws). */
export const OWN: Record<RosterId, string[]> = {
  braxton: ['THIS BODY IS FOR PIPER. AND MIRRORS.', 'I OILED UP FOR THIS. ALL OVER.'],
  gunnar: ['VALHALLA IS HER BEDROOM!', 'I BENCH THREE GOATS. FOR HER!'],
  tremaine: ['SHE WANTS A PRINCE. I BOUGHT THE SASH.', 'CALVES LIKE THESE DON\'T LOSE.'],
  chad: ['PIPER\'S GONNA LOVE THESE GUNS, BRO.', 'I DID CHEST DAY TWICE TODAY.'],
  derek: ['M\'LADY PIPER. I HAVE NINE FAIRE PASSES.', 'MY SWORD IS REAL. MY CASTLE IS A CONDO.'],
  wayne: ['MY STAFF IS FOUR FEET LONG. THE STAFF.', 'I CAST LEVEL NINE HORNY.'],
  duane: ['I DEADLIFT FIVE HUNDRED. I CAN LIFT HER.', 'PIPER LIKES A BIG MAN. I AM A BIG MAN.'],
  lorenzo: ['I WAS ON A ROMANCE NOVEL. TWICE.', 'MY HAIR DOES THIS NATURALLY, PIPER.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Every suitor (each in his own voice)

/** Throwing at Meathead. */
export const AT_HIM: ByPants = {
  clean: ['CATCH, MEATBALL!', 'SHE\'S MINE, FATSO!', 'GET OFF MY WHEEL!'],
  shitty: ['CATCH, SHIT PANTS!', 'YOU SMELL LIKE A BUS STATION!'],
  nude: ['PUT SOME PANTS ON!', 'NOBODY WANTS TO SEE THAT!'],
};
/** Throwing at a rival. */
export const AT_RIVAL = ['SHE\'S MINE, BRO!', 'EAT IT, PRETTY BOY!', 'BACK OF THE LINE!', 'NICE CALVES, LOSER!'];
/** Hit by a rival's throw. */
export const YELP = ['MY FACE!', 'OW! MY PECS!', 'THAT\'S A FOUL!'];
/** Shot at: it bounces off him. */
export const BOUNCE: ByPants = {
  clean: ['HA! I\'M SHREDDED!', 'TICKLES, BRO!'],
  shitty: ['BULLETS? FROM A GUY WHO SHAT HIMSELF?', 'HA! SHOOT ME WITH YOUR SMELL!'],
  nude: ['HA! NICE TRY, NAKED!', 'IS THAT A GUN OR A DICK? BOTH TINY!'],
};
/** Meathead's jumped into his cart (the QTE's on). */
export const QTE_START: ByPants = {
  clean: ['GET OUT OF MY CART!', 'THIS IS A ONE MAN CART!'],
  shitty: ['OH GOD, THE SMELL! GET OUT!', 'YOU SHAT IN MY CART!'],
  nude: ['WHY IS YOUR DICK IN MY CART?', 'YOUR BALLS ARE ON MY BENCH!'],
};
/** He's won it: Meathead's thrown out. */
export const QTE_WIN: ByPants = {
  clean: ['AND STAY OUT!', 'SHE\'S MINE, LOSER!'],
  shitty: ['TAKE YOUR SMELL WITH YOU!'],
  nude: ['TAKE YOUR TINY DICK WITH YOU!'],
};

/** The kills (fantasy/wheel/kills.ts): smashed into the cart's wall, thrown off the wheel, stuffed headfirst through the
 *  floor, spun round by the ankles and flung into another cart, choked with his own bouquet. */
export type KillKind = 'smash' | 'throw' | 'floor' | 'fling' | 'choke';
/** What he yells, going (each kill its own). */
export const DEATH: Record<KillKind, string[]> = {
  smash: ['NOT THE FACE!', 'MY VENEERS!'],
  throw: ['AAAAAAAAAAH!', 'I CAN\'T FLY! I CAN\'T FLY!'],
  floor: ['MMMPH! MMMPH!', 'MY HEAD\'S IN THE FLOOR!'],
  fling: ['PUT ME DOWN! PUT ME DOWN!', 'I\'M GONNA PUKE!'],
  choke: ['MY OWN ROSES!', 'GLURK! PETALS!'],
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Shot one of them: it bounced off. */
export const SHOT_BOUNCE: ByPants = {
  clean: ['IT BOUNCED OFF HIS PECS.', 'BULLETPROOF? STEROIDS.', 'GUNS DON\'T WORK ON HIM. HANDS, THEN.'],
  shitty: ['IT BOUNCED. I GOTTA GET IN THERE. SMELLING LIKE THIS.', 'BULLETPROOF. NOT SMELL PROOF.'],
  nude: ['BULLETS BOUNCE. GUESS I GO IN NAKED.', 'FINE. HAND TO HAND. DICK TO DICK.'],
};
/** After a kill (his own, or the land's HORNY pool). */
export const KILLED: ByPants = {
  clean: ['NEXT.', 'THAT\'S FOR PIPER.', 'ONE LESS DICK IN LINE.', 'SHE\'S WORTH IT. PROBABLY.'],
  shitty: ['DIED SMELLING ME. RESPECT.', 'SHITTY WAY TO GO. FOR HIM.'],
  nude: ['KILLED HIM NAKED. STILL HARD.', 'EVERY KILL, HARDER. THAT\'S NOT WEIRD.'],
};
/** The wheel's clear. */
export const ALL_DEAD: ByPants = {
  clean: ['WHEEL\'S CLEAR. PIPER, I\'M COMING.', 'TRIAL ONE. DONE. NOW WHERE\'S MY PIPER?'],
  shitty: ['WHEEL\'S CLEAR. PIPER, I\'M COMING. AND I REEK.', 'TRIAL ONE. DONE. SO ARE MY PANTS.'],
  nude: ['WHEEL\'S CLEAR. THE BONER LIVES.', 'TRIAL ONE. DONE. STILL NAKED. STILL HARD.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Piper on the PA

/** The trial's on (he's at the wheel). */
export const PIPER_START: ByPants = {
  clean: ['ALL ABOARD, BOYS. ONLY ONE OF YOU GETS OFF.', 'ROUND AND ROUND. LAST MAN BREATHING GETS ME. SORT OF.'],
  shitty: ['SOMEBODY BROUGHT A SMELL. HOW BRAVE.', 'ONE OF YOU SHAT ALREADY. I DO LOVE FEAR.'],
  nude: ['ONE OF YOU CAME NAKED. NOW THAT\'S COMMITMENT.', 'A NAKED ONE. NOTHING TO SOAK UP THE BLOOD.'],
};
/** Purring over a death. */
export const PIPER_KILL: ByPants = {
  clean: ['OOH. DO IT AGAIN.', 'MMM. THAT ONE SQUIRTED.', 'ALL THAT RED. FOR ME?', 'YES. FIGHT OVER ME.', 'ONE LESS. KEEP GOING, BABY.'],
  shitty: ['MESSY. FROM BOTH ENDS. I LOVE IT.', 'HE STINKS AND HE KILLS. MMM.', 'BLOOD AND SHIT. YOU SPOIL ME.'],
  nude: ['NAKED AND KILLING. HOW PRIMAL.', 'BLOOD ON BARE SKIN. MMM.', 'KILL ANOTHER ONE, NAKED BOY.'],
};
/** He's lost a QTE: thrown out. */
export const PIPER_KNOCK: ByPants = {
  clean: ['OOH, HE BOUNCED.', 'I DO LIKE WATCHING YOU LOSE.'],
  shitty: ['HE FELL AND SPRAYED. GROSS. GOOD.', 'OFF YOU GO, STINKY.'],
  nude: ['NAKED AND FLYING. WHAT A VIEW.', 'OFF HE GOES. EVERYTHING FLAPPING.'],
};
/** The suitors hitting each other. */
export const PIPER_RIVAL = ['YES, BOYS. HURT EACH OTHER.', 'OOH. RIGHT IN THE FACE.', 'THROW HARDER. FOR ME.'];
/** All of them dead. */
export const PIPER_DONE: ByPants = {
  clean: ['ALL THAT BLOOD. FOR LITTLE OLD ME. NEXT TRIAL.', 'WELL DONE. I\'M ALL FLUSHED. ON TO THE NEXT ONE.'],
  shitty: ['THE STINKY ONE WINS. NEXT TRIAL, STINKY.', 'YOU WON. YOU REEK. ON TO THE NEXT ONE.'],
  nude: ['THE NAKED ONE WINS. KEEP IT OUT. NEXT TRIAL.', 'ALL THAT RED ON BARE SKIN. NEXT TRIAL, BABY.'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here, and the death screens (28 characters at most)

/** What they throw (each its own hurt source). */
export type Item = 'bouquet' | 'chocolates' | 'horseshoe' | 'brick' | 'shaker' | 'wand';
export const ITEM_SRC: Record<Item, string> = {
  bouquet: 'm2:fa_wheel_bouquet', chocolates: 'm2:fa_wheel_chocolates', horseshoe: 'm2:fa_wheel_horseshoe',
  brick: 'm2:fa_wheel_brick', shaker: 'm2:fa_wheel_shaker', wand: 'm2:fa_wheel_wand',
};
/** Thrown out of a cart (a QTE lost), off the wheel (a long fall). */
export const QTE_SRC = 'm2:fa_wheel_qte', FALL_SRC = 'm2:fa_wheel_fall';

export const HURT: HurtTable = {
  [ITEM_SRC.bouquet]: { hurt: ['THORNS! IN MY EYE!', 'ROSES! WITH THORNS!', 'HE THREW FLOWERS AT ME!'], death: ['KILLED BY A BOUQUET', 'DIED OF ROMANCE'] },
  [ITEM_SRC.chocolates]: { hurt: ['A BOX OF CHOCOLATES! HARD!', 'NOUGAT! IN MY TEETH!', 'THE HEART BOX! MY HEAD!'], death: ['CHOCOLATED TO DEATH', 'DIED OF A HEART-SHAPED BOX'] },
  [ITEM_SRC.horseshoe]: { hurt: ['A HORSESHOE! LUCKY HIM!', 'HORSESHOE! TO THE DOME!', 'RINGER! ON MY NECK!'], death: ['NOT SO LUCKY HORSESHOE', 'RINGER TO THE SKULL'] },
  [ITEM_SRC.brick]: { hurt: ['A LOVE LETTER! WITH A BRICK!', 'HE MAILED ME A BRICK!', 'LOVE HURTS! IT\'S A BRICK!'], death: ['KILLED BY A LOVE LETTER', 'BRICKED BY A SUITOR'] },
  [ITEM_SRC.shaker]: { hurt: ['PROTEIN SHAKE! IN MY EYES!', 'WHEY! IN MY FACE!', 'IT\'S CHUNKY! WHY IS IT CHUNKY?'], death: ['DROWNED IN A PROTEIN SHAKE', 'WHEYED DOWN'] },
  [ITEM_SRC.wand]: { hurt: ['A WAND! TO THE NUTS!', 'HE THREW A FORTY BUCK WAND!', 'MAGIC STICK! MY EYE!'], death: ['WANDED OFF A FERRIS WHEEL', 'KILLED BY A WAND TOSS'] },
  [QTE_SRC]: { hurt: ['HE THREW ME OUT!', 'KICKED OUT OF THE CART!', 'LOST TO A GYM RAT!'], death: ['THROWN FROM A FAIRY WHEEL', 'LOST THE CART FIGHT'] },
  [FALL_SRC]: { hurt: ['FELL OFF THE WHEEL! MY ASS!', 'THAT\'S A LONG WAY DOWN!', 'MY KNEES! MY EVERYTHING!'], death: ['FELL OFF A FERRIS WHEEL', 'SPLATTED UNDER THE WHEEL'] },
};

/** The announcer's calls, by kill. */
export const KILL_CALLS: Record<KillKind, string[]> = {
  smash: ['WALLED!', 'CART SMASH!'],
  throw: ['OFF THE WHEEL!', 'AIR MAIL!'],
  floor: ['FLOORED!', 'HEAD FIRST!'],
  fling: ['SPECIAL DELIVERY!', 'RETURN TO SENDER!'],
  choke: ['STOP AND SMELL THE ROSES!', 'DEFLOWERED!'],
};

const everySuitor = (id: RosterId) => [
  ...OWN[id], ...allOf(AT_HIM), ...AT_RIVAL, ...YELP, ...allOf(BOUNCE), ...allOf(QTE_START), ...allOf(QTE_WIN),
  ...Object.values(DEATH).flat(),
];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...[SHOT_BOUNCE, KILLED, ALL_DEAD].flatMap(allOf), ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flat())],
  [PIPER_PA_VOICE]: [...[PIPER_START, PIPER_KILL, PIPER_KNOCK, PIPER_DONE].flatMap(allOf), ...PIPER_RIVAL],
  ...Object.fromEntries((Object.keys(WHEEL_VOICES) as RosterId[]).map(id => [WHEEL_VOICES[id], everySuitor(id)])),
};
