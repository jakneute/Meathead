// What's said in the temple (backstage), by voice (recorded with the rest: tools/voices). Where somebody reacts to
// him, three ways: clean pants, shitty ones, naked.

export type Dressed = 'clean' | 'shitty' | 'nude';

/** The guests he kicks out of the cart, as they go (a woman's voice, a man's: by who it is). */
export const GUEST_KICKED: Record<Dressed, string[]> = {
  clean: ['HEY! WE WAITED NINETY MINUTES!', 'MY FAST PASS! I HAD A FAST PASS!', "THAT'S MY SEAT, YOU— OW!"],
  shitty: ['WHAT IS THAT SMELL— OH GOD, IT\'S HIM!', "HE'S SITTING IN IT! HE'S SITTING IN IT WITH THAT!", 'MY KIDS ARE WATCHING THIS! MY KIDS CAN SMELL THIS!'],
  nude: ['HE\'S NAKED! A NAKED MAN KICKED ME!', 'I SAW IT! I SAW ALL OF IT ON THE WAY OUT!', "SIR, THAT SEAT IS VINYL! YOU'RE NAKED ON VINYL!"],
};
/** Two in the line behind, after (the extra fast pass, again). Woman, then man. */
export const LINE_ASKS = 'IS THAT THE EXTRA FAST PASS?';
export const LINE_ANSWERS = "I DIDN'T EVEN KNOW THEY SOLD THAT.";

/** Meathead, sat in the cart. */
export const MEATHEAD_BOARDS = ['DRIVE.', 'ONE, PLEASE.', 'HIT IT.'];

/** The operators: he cares (m2.operator), she's done caring (m2.operator2). */
export const OPERATOR_PROTEST: Record<Dressed, string> = {
  clean: 'SIR! SIR, YOU CAN\'T DO THAT! THOSE PEOPLE WAITED IN LINE!',
  shitty: "SIR! YOU CAN'T— OH, NO. YOU SAT DOWN. YOU SAT DOWN IN THAT.",
  nude: "SIR! YOU CAN'T RIDE NAKED! THERE'S A SIGN! ...THERE SHOULD BE A SIGN!",
};
export const OPERATOR2_ENGAGE = '...YOU KNOW WHAT? ENGAGE THE ACTUAL DANGEROUS TRACK.';

/** What he says when these hurt him, and the death screen when they kill him. */
export const HURT_BOULDER = ["THAT'S NOT FOAM! THAT'S NOT FOAM!", 'WHO LOADS REAL ROCKS IN A RIDE?!', 'MY SHINS! MY EVERYTHING!'];
export const DEATH_BOULDER = ['INDIANA BONED', 'THE BOULDER WAS REAL', 'ROLLED'];
export const HURT_DART = ['A DART! IN MY ASS! AGAIN!', 'WHO SHOOTS DARTS WITH A LEAF BLOWER?!', 'OW! THAT ONE HAD A FEATHER ON IT!'];
export const DEATH_DART = ['LEAF BLOWN', 'A PINCUSHION', 'GARDENING ACCIDENT'];
export const HURT_SNAKE = ['THE SNAKE! THE BIG RUBBER SNAKE!', "WHY'D IT HAVE TO BE SNAKES!", 'IT HEADBUTTED ME! A PUPPET HEADBUTTED ME!'];
export const DEATH_SNAKE = ['KILLED BY A PUPPET', 'SNAKE EYES', 'PNEUMATICALLY DECEASED'];
export const HURT_ACTOR = ['THE PROP SPEAR IS REAL!', 'HE STABBED ME! IN CHARACTER!', 'STAY IN YOUR LANE, DRAMA CLUB!'];
export const DEATH_ACTOR = ['METHOD ACTING', 'STABBED BY A CAST MEMBER', 'A TRAGIC PERFORMANCE'];
/** Shoulder charged right onto a cast member's spear. */
export const HURT_SPEAR = ['I RAN STRAIGHT ONTO THE SPEAR! SHOULDER FIRST!', 'WHO CHARGES A SPEAR?! ME! I DO!', "THAT'S NOT IN THE SCRIPT!", 'SHISH-KE-ME!'];
export const DEATH_SPEAR = ['RAN ONTO A SPEAR', 'SKEWERED BY THE DRAMA CLUB', 'THE STRONGEST LINK'];

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
