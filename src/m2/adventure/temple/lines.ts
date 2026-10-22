// What's said in the temple (backstage), by voice (recorded with the rest: tools/voices). Where somebody reacts to
// him, three ways: clean pants, shitty ones, naked.

export type Dressed = 'clean' | 'shitty' | 'nude';

/** The guests he kicks out of the cart, as they go (a woman's voice, a man's: by who it is). */
export const GUEST_KICKED: Record<Dressed, string[]> = {
  clean: ['WE WAITED NINETY MINUTES, YOU FAT FUCK!', "I'M A PLATINUM MEMBER, YOU FAT FUCK!", "THAT'S MY SEAT, YOU— OW!"],
  shitty: ["WHAT IS THAT SMELL— OH GOD, IT'S HIM!", "HE'S SITTING IN IT WITH THAT!", "HE'S MARINATING IN IT!"],
  nude: ['A NAKED MAN KICKED ME!', 'HIS SACK TOUCHED MY ELBOW!', 'HIS BALLS ARE ON MY SEAT!'],
};
/** Two in the line behind, after (the extra fast pass, again). Woman, then man. */
export const LINE_ASKS = 'IS THAT THE EXTRA FAST PASS?';
export const LINE_ANSWERS = "I DIDN'T EVEN KNOW THEY SOLD THAT.";

/** Meathead, sat in the cart. */
export const MEATHEAD_BOARDS = ['DRIVE.', 'ONE, PLEASE. NO SMALL TALK.', 'HIT IT.'];

/** The operators: he cares (m2.operator), she's done caring (m2.operator2). */
export const OPERATOR_PROTEST: Record<Dressed, string> = {
  clean: 'SIR! THOSE PEOPLE WAITED IN LINE!',
  shitty: "SIR! YOU CAN'T— OH NO. YOU SAT IN THAT.",
  nude: "SIR! YOU CAN'T RIDE NAKED! THAT SEAT'S UPHOLSTERED!",
};
export const OPERATOR2_ENGAGE = '...YOU KNOW WHAT? ENGAGE THE ACTUAL DANGEROUS TRACK.';

/** What he says when these hurt him, and the death screen when they kill him. */
export const HURT_BOULDER = ["THAT'S NOT FOAM!", 'WHO LOADS REAL ROCKS IN A RIDE?!', 'THAT WAS ONE OF MY GOOD SHINS!'];
export const DEATH_BOULDER = ['INDIANA BONED', 'THE BOULDER WAS REAL', 'FLATTENED BY A PROP'];
export const HURT_DART = ['A DART! IN MY ASS!', "A LEAF BLOWER?! WHO'S BACK THERE, HOME DEPOT?!", 'THAT ONE HAD A FEATHER ON IT!'];
export const DEATH_DART = ['LEAF BLOWN', 'A PINCUSHION', 'KILLED BY YARD EQUIPMENT'];
export const HURT_SNAKE = ['THE BIG RUBBER SNAKE!', "WHY'D IT HAVE TO BE SNAKES?!", "A PUPPET GOT ME! MY DAD'S GONNA HEAR ABOUT THIS!"];
export const DEATH_SNAKE = ['KILLED BY A PUPPET', 'HEADBUTTED BY A SOCK', 'PNEUMATICALLY DECEASED'];
export const HURT_ACTOR = ['THE PROP SPEAR IS REAL!', 'HE STABBED ME! IN CHARACTER!', 'SIT DOWN, DRAMA CLUB!'];
export const DEATH_ACTOR = ['METHOD ACTING', 'STABBED BY A CAST MEMBER', 'ONE STAR. WOULD NOT DIE AGAIN'];
/** Shoulder charged right onto a cast member's spear. */
export const HURT_SPEAR = ['I RAN STRAIGHT ONTO THE SPEAR!', 'WHO CHARGES A SPEAR?! ME, DUMBASS!', "THAT'S NOT IN THE SCRIPT!", 'RIGHT IN THE MAN TITTY!'];
export const DEATH_SPEAR = ['RAN ONTO A SPEAR', 'SKEWERED BY THE DRAMA CLUB', 'SHISH-KE-MEATHEAD'];

const all = (r: Record<Dressed, string[]>) => [...r.clean, ...r.shitty, ...r.nude];
const each = (r: Record<Dressed, string>) => [r.clean, r.shitty, r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_BOARDS, ...HURT_BOULDER, ...HURT_DART, ...HURT_SNAKE, ...HURT_ACTOR, ...HURT_SPEAR],
  death: [...DEATH_BOULDER, ...DEATH_DART, ...DEATH_SNAKE, ...DEATH_ACTOR, ...DEATH_SPEAR],
  'm2.guest': [...all(GUEST_KICKED), LINE_ASKS],
  'm2.guest2': [...all(GUEST_KICKED), LINE_ANSWERS],
  'm2.operator': each(OPERATOR_PROTEST),
  'm2.operator2': [OPERATOR2_ENGAGE],
};
