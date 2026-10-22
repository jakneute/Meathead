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
  braxton: ['I JERK OFF TO MY OWN FLEX VIDEOS. FOR PIPER.', 'I OILED UP FOR THIS. ALL OVER.'],
  gunnar: ['VALHALLA IS HER BEDROOM!', 'I DRINK RAW EGGS AND GOAT PISS. FOR HER!'],
  tremaine: ['SHE WANTS A PRINCE. MY SASH WAS NINETEEN NINETY-NINE.', 'CALVES LIKE THESE DON\'T LOSE.'],
  chad: ['PIPER\'S GONNA LOVE THESE GUNS, BRO.', 'MY NIPPLES ARE BLEEDING FROM CHEST DAY. FOR HER, BRO.'],
  derek: ['M\'LADY PIPER. I HAVE NINE FAIRE PASSES.', 'MY SWORD IS REAL. I STILL LIVE WITH MY MOM.'],
  wayne: ['MY STAFF IS FOUR FEET LONG. THE STAFF.', 'I CAST LEVEL NINE HORNY.'],
  duane: ['MY BALLS SHRANK TO RAISINS FOR THIS. WORTH IT.', 'PIPER LIKES A BIG MAN. I AM A BIG MAN.'],
  lorenzo: ['I WAS ON A ROMANCE NOVEL. TWICE.', 'THIS HAIR COST FOUR HUNDRED BUCKS, PIPER.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Every suitor (each in his own voice)

/** Throwing at Meathead. */
export const AT_HIM: ByPants = {
  clean: ['CATCH, MEATBALL!', 'SHE\'S MINE, FATSO!', 'GET OFF MY WHEEL, LARD ASS!'],
  shitty: ['CATCH, SHIT PANTS!', 'YOU SMELL LIKE A GREYHOUND SHITTER!'],
  nude: ['PUT SOME PANTS ON!', 'THERE ARE KIDS ON THIS WHEEL, YOU PERVERT!'],
};
/** Throwing at a rival. */
export const AT_RIVAL = ['SHE\'S MINE, BRO!', 'EAT IT, PRETTY BOY!', 'BACK OF THE LINE!', "SHE'D NEVER FUCK A GUY WITH CALF IMPLANTS!"];
/** Hit by a rival's throw. */
export const YELP = ['MY FACE!', 'OW! MY PECS!', 'MY GOD DAMN TEETH!'];
/** Shot at: it bounces off him. */
export const BOUNCE: ByPants = {
  clean: ['HA! I\'M SHREDDED!', 'TICKLES, BRO!'],
  shitty: ['BULLETS? FROM A GUY WHO SHAT HIMSELF?', 'YOUR SMELL HURTS MORE THAN YOUR GUN!'],
  nude: ['HA! NICE TRY, NAKED!', 'IS THAT A GUN OR A DICK? BOTH TINY!'],
};
/** Meathead's jumped into his cart (the QTE's on). */
export const QTE_START: ByPants = {
  clean: ['GET OUT OF MY CART!', 'THIS CART IS FOR ME AND MY BOOTY!'],
  shitty: ['OH GOD, THE SMELL! GET OUT!', 'YOU SHAT IN MY CART!'],
  nude: ['WHY IS YOUR DICK IN MY CART?', 'YOUR BARE ASS IS ON MY SEAT!'],
};
/** He's won it: Meathead's thrown out. */
export const QTE_WIN: ByPants = {
  clean: ['AND STAY OUT, FAT FUCK!', 'SHE\'S MINE, LOSER!'],
  shitty: ['TAKE YOUR SMELL WITH YOU!'],
  nude: ['TAKE YOUR TINY DICK WITH YOU!'],
};

/** The kills (fantasy/wheel/kills.ts): smashed into the cart's wall, thrown off the wheel, stuffed headfirst through the
 *  floor, spun round by the ankles and flung into another cart, choked with his own bouquet. */
export type KillKind = 'smash' | 'throw' | 'floor' | 'fling' | 'choke';
/** What he yells, going (each kill its own). */
export const DEATH: Record<KillKind, string[]> = {
  smash: ['NOT THE FACE!', 'MY VENEERS!'],
  throw: ['AAAAAAAAAAH!', "I SHOULD'VE DONE CARDIO!"],
  floor: ['MMMPH! MY HAIR!', 'MY HEAD\'S IN THE FLOOR!'],
  fling: ['PUT ME DOWN! PUT ME DOWN!', "I'M GONNA SHART!"],
  choke: ['MY OWN ROSES!', 'GLURK! PETALS!'],
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Shot one of them: it bounced off. */
export const SHOT_BOUNCE: ByPants = {
  clean: ['IT BOUNCED OFF HIS PECS.', 'BULLETS BOUNCE OFF HIM. HORSE STEROIDS, MUST BE.', 'GUNS DON\'T WORK ON HIM. HANDS, THEN.'],
  shitty: ["IT BOUNCED. GUESS I'M CLIMBING IN WITH MY SHITTY PANTS.", "BULLETPROOF. LET'S SEE IF HE'S SHIT PROOF."],
  nude: ["BULLETS BOUNCE. MY BALLS WON'T.", 'FINE. HAND TO HAND. DICK TO DICK.'],
};
/** After a kill (his own, or the land's HORNY pool). */
export const KILLED: ByPants = {
  clean: ['NEXT.', 'THAT\'S FOR PIPER.', 'ONE LESS DICK IN LINE.', "HOPE SHE'S HOT. I'M IN TOO DEEP."],
  shitty: ['DIED SMELLING ME. RESPECT.', 'LAST THING HE SMELLED WAS MY ASS.'],
  nude: ['KILLED HIM NAKED. STILL HARD.', 'EVERY KILL MAKES IT HARDER. NOT WEIRD. TOTALLY NORMAL.'],
};
/** The wheel's clear. */
export const ALL_DEAD: ByPants = {
  clean: ['WHEEL\'S CLEAR. PIPER, I\'M COMING.', "TRIAL ONE. NOW WHERE'S MY PUSSY?"],
  shitty: ['WHEEL\'S CLEAR. PIPER, I\'M COMING. AND I REEK.', 'TRIAL ONE. DONE. MY PANTS ARE DONE TOO.'],
  nude: ['WHEEL\'S CLEAR. THE BONER LIVES.', 'TRIAL ONE. DONE. STILL NAKED. STILL HARD.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Piper on the PA

/** The trial's on (he's at the wheel). */
export const PIPER_START: ByPants = {
  clean: ['ALL ABOARD, BOYS. ONLY ONE OF YOU GETS OFF.', 'ROUND AND ROUND. LAST ONE BREATHING GETS ME.'],
  shitty: ['SOMEBODY BROUGHT A SMELL. HOW BRAVE.', 'ONE OF YOU SHAT ALREADY. I DO LOVE FEAR.'],
  nude: ['ONE OF YOU CAME NAKED. NOW THAT\'S COMMITMENT.', 'A NAKED ONE. THE BLOOD WILL GO EVERYWHERE. GOOD.'],
};
/** Purring over a death. */
export const PIPER_KILL: ByPants = {
  clean: ['OOH. DO IT AGAIN.', 'MMM. HE SQUIRTED. SO DID I.', 'ALL THAT RED. FOR ME?', 'YES. FIGHT OVER ME.', 'MY PANTIES ARE RUINED, BOYS.'],
  shitty: ['MESSY. FROM BOTH ENDS. I LOVE IT.', "HE KILLS WITH SHIT IN HIS PANTS. I'M SOAKED.", 'BLOOD AND SHIT. YOU SPOIL ME.'],
  nude: ["NAKED AND KILLING. I'M TOUCHING MYSELF.", 'BLOOD ON BARE SKIN. MMM.', 'KILL ANOTHER ONE, NAKED BOY.'],
};
/** He's lost a QTE: thrown out. */
export const PIPER_KNOCK: ByPants = {
  clean: ['OOH, HE BOUNCED. ON HIS FACE.', 'I DO LIKE WATCHING YOU LOSE.'],
  shitty: ['HE FELL AND SPRAYED. GROSS. GOOD.', 'BYE, STINKY. TAKE YOUR SKID MARKS.'],
  nude: ['NAKED AND FLYING. WHAT A VIEW.', 'OFF HE GOES. BALLS FLAPPING. DELICIOUS.'],
};
/** The suitors hitting each other. */
export const PIPER_RIVAL = ['YES, BOYS. HURT EACH OTHER.', 'OOH. RIGHT IN THE FACE.', "THROW HARDER. I'M ALMOST THERE."];
/** All of them dead. */
export const PIPER_DONE: ByPants = {
  clean: ['ALL THAT BLOOD. FOR LITTLE OLD ME. NEXT TRIAL.', "I'M ALL FLUSHED. I NEED A CIGARETTE. NEXT TRIAL."],
  shitty: ['THE STINKY ONE WINS. HOSE OFF. NEXT TRIAL.', 'YOU WON. YOU REEK. ON TO THE NEXT ONE.'],
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
  [ITEM_SRC.bouquet]: { hurt: ['THORNS! IN MY EYE!', 'ROSES! WITH THORNS!', 'ROSES! THE THORNS ARE IN MY NIPPLE!'], death: ['KILLED BY A BOUQUET', 'DIED OF ROMANCE'] },
  [ITEM_SRC.chocolates]: { hurt: ['A BOX OF CHOCOLATES! HARD!', 'NOUGAT! IN MY TEETH!', "WHITMAN'S SAMPLER! TO THE FACE!"], death: ['CHOCOLATED TO DEATH', 'DIED OF A HEART-SHAPED BOX'] },
  [ITEM_SRC.horseshoe]: { hurt: ['A HORSESHOE! LUCKY HIM!', 'IT STILL HAS HORSE SHIT ON IT!', 'RINGER! ON MY NECK!'], death: ['NOT SO LUCKY HORSESHOE', 'RINGER TO THE SKULL'] },
  [ITEM_SRC.brick]: { hurt: ['A LOVE LETTER! WITH A BRICK!', 'A BRICK! WITH A POEM ON IT!', 'LOVE HURTS! IT\'S A BRICK!'], death: ['KILLED BY A LOVE LETTER', 'BRICKED BY A SUITOR'] },
  [ITEM_SRC.shaker]: { hurt: ['PROTEIN SHAKE! IN MY EYES!', 'WHEY! CHOCOLATE! IN MY NOSE!', 'IT\'S CHUNKY! WHY IS IT CHUNKY?'], death: ['DROWNED IN A PROTEIN SHAKE', 'WHEYED DOWN'] },
  [ITEM_SRC.wand]: { hurt: ['A WAND! TO THE NUTS!', 'THE WAND! UP MY ASS!', 'MAGIC STICK! MY EYE!'], death: ['WANDED OFF A FERRIS WHEEL', 'KILLED BY A WAND TOSS'] },
  [QTE_SRC]: { hurt: ['HE THREW ME OUT!', 'KICKED OUT OF THE CART!', 'THROWN OUT BY A GUY WITH FROSTED TIPS!'], death: ['THROWN FROM A FAIRY WHEEL', 'LOST THE CART FIGHT'] },
  [FALL_SRC]: { hurt: ['FELL OFF THE WHEEL! MY ASS!', 'THAT\'S A LONG WAY DOWN!', 'MY TAILBONE! I HEARD IT!'], death: ['FELL OFF A FERRIS WHEEL', 'SPLATTED UNDER THE WHEEL'] },
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
