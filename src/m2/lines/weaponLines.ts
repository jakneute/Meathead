// What Meathead says about his weapons themselves (not a kill): the soul sucker's gore bag full up when he tries to
// suck. Recorded with the rest (tools/voices: extract.ts, m2pack.ts).

export const FULL_BAG_LINES = [
  "BAG'S FULL!", "IT'S BACKED UP!", 'GOTTA EMPTY THE BAG FIRST!', 'TOO MUCH MEAT, NOT ENOUGH BAG!', "IT'S CLOGGED WITH GUYS!",
  'SPRAY FIRST, SUCK LATER!',
];

/** The spellbook's bulk up, cast. */
export const BULK_LINES = ['BULK UP!', 'MAXIMUM GAINS!', 'SWOLE MODE!', 'FEEL THE PUMP!', 'TOO BIG TO FAIL!', 'DO YOU EVEN LIFT, BITCHES?'];

/** ...and when it won't: why not. */
export const BULK_FAIL_LINES = {
  already: ["I'M ALREADY HUGE!", 'ANY MORE PUMP AND I POP!', "CAN'T GET ANY BIGGER! YET."],
  cooldown: ['GOTTA REST BETWEEN SETS!', 'STILL RECOVERING!', 'MUSCLES NEED A BREATHER!'],
  mana: ['OUT OF MANA, WHATEVER THAT IS!', "THE BOOK'S TAPPED OUT!", 'NO JUICE LEFT IN THIS THING!'],
  air: ['NEED MY FEET UNDER ME!', "CAN'T FLEX IN MIDAIR!"],
};

/** The mallet of pain, tried while he's ducking. */
export const DUCK_LINES = ["CAN'T SWING IT ON MY KNEES!", 'NO LEVERAGE DOWN HERE!', 'GOTTA STAND UP TO SWING THIS!', "I DON'T DO MY BEST WORK ON MY KNEES!"];

/** ...and empty, when he tries to spray it. */
export const EMPTY_BAG_LINES = [
  "BAG'S EMPTY!", 'GOTTA SUCK SOMEBODY UP FIRST!', 'OUT OF GUTS!', 'NO GUTS, NO GLORY!', "THE BAG'S DRY!", 'FEED THE GRINDER!',
];

/** A grab at an animal far too big to get hold of (any of them), and at the ones in particular. */
export const TOO_BIG_LINES = [
  'TOO MUCH ANIMAL!', "I'M GONNA NEED BIGGER HANDS!", "MY ARMS DON'T GO AROUND THAT!", "THAT'S NOT A PET. THAT'S A BUILDING.",
  'WHERE DO YOU EVEN GRAB THAT?!',
];
/** A grab at somebody who can't be grabbed, by what they are: a boss (or a mid-boss), a machine, a person the grabs
 *  don't work on. (An animal too big: TOO_BIG_LINES.) */
export const GRAB_IMMUNE_LINES: Record<'boss' | 'machine' | 'person', string[]> = {
  boss: ["BOSSES DON'T DO HUGS, APPARENTLY!", 'NOPE. SLIPPERY BASTARD.', "CAN'T GET A GRIP ON THIS ASSHOLE!", "WON'T LET ME GET MY HANDS ON HIM!"],
  machine: ["IT'S ALL BOLTS! NOTHING TO GRAB!", "YOU CAN'T SHAKE DOWN A MACHINE!", 'NO NECK! NO NECK ON IT!', "IT'S LIKE HUGGING A FRIDGE!"],
  person: ["CAN'T GET A HOLD!", 'SLIPPED RIGHT OUT OF MY HANDS!', 'GREASED UP OR SOMETHING!', 'SLIPPERY LITTLE SHIT!'],
};
export const TOO_BIG_BY_KIND: Record<string, string[]> = {
  'm2:trike': ["YOU DON'T SHAKE DOWN A TRICERATOPS!", 'THREE HORNS AND NO HANDLES!', "IT'S BOLTED TOGETHER! NOTHING TO GRAB!"],
  'm2:tower_ringer': ["I CAN'T LIFT A GIANT WIND-UP TOY!", 'SOLID BRASS! NOTHING TO GRAB BUT THE KEY!', 'IT WEIGHS MORE THAN THE BELL!'],
  'm2:rex': ["I'M NOT WRESTLING A T-REX!", "THAT'S A WHOLE-ASS DINOSAUR!", 'TINY ARMS, BIG EVERYTHING ELSE!'],
};
