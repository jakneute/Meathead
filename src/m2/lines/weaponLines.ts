// What Meathead says about his weapons themselves (not a kill): the soul sucker's gore bag full up when he tries to
// suck. Recorded with the rest (tools/voices: extract.ts, m2pack.ts).

export const FULL_BAG_LINES = [
  "BAG'S FULL!", "IT'S BACKED UP!", 'NO ROOM AT THE INN!', 'GOTTA EMPTY THE BAG FIRST!', "THE GRINDER'S CHOKING!",
  'TIME TO HOSE SOMEBODY DOWN!', 'TOO MUCH MEAT, NOT ENOUGH BAG!', "IT'S FULL OF GUYS!", 'SPRAY FIRST, SUCK LATER!',
  "THE BAG CAN'T TAKE ANY MORE, AND NEITHER CAN YOU!",
];

/** The spellbook's bulk up, cast. */
export const BULK_LINES = ['BULK UP!', 'MAXIMUM GAINS!', 'I AM THE PUMP!', 'SWOLE MODE!', 'FEEL THE PUMP!', 'HULKING OUT!', 'TOO BIG TO FAIL!'];

/** ...and when it won't: why not. */
export const BULK_FAIL_LINES = {
  already: ["I'M ALREADY HUGE!", "CAN'T GET ANY BIGGER! YET.", 'ANY MORE PUMP AND I POP!'],
  cooldown: ['GOTTA REST BETWEEN SETS!', 'STILL RECOVERING!', 'MUSCLES NEED A BREATHER!'],
  mana: ['OUT OF MANA, WHATEVER THAT IS!', "THE BOOK'S TAPPED OUT!", 'NO JUICE LEFT IN THIS THING!'],
  air: ['NEED MY FEET UNDER ME!', "CAN'T FLEX IN MIDAIR!"],
};

/** The mallet of pain, tried while he's ducking. */
export const DUCK_LINES = ["CAN'T FIND ENOUGH LEVERAGE!", 'NO LEVERAGE DOWN HERE!', 'GOTTA STAND UP TO SWING THIS!', "CAN'T SWING IT ON MY KNEES!"];

/** ...and empty, when he tries to spray it. */
export const EMPTY_BAG_LINES = [
  "BAG'S EMPTY!", 'NOTHING IN THE BAG!', 'GOTTA SUCK SOMEBODY UP FIRST!', 'OUT OF GUTS!', 'NO GUTS, NO GLORY!',
  'I NEED MORE MEAT!', "THE BAG'S DRY!", 'FEED THE GRINDER!',
];

/** A grab at an animal far too big to get hold of (any of them), and at the ones in particular. */
export const TOO_BIG_LINES = [
  'TOO MUCH ANIMAL!', "I'M GONNA NEED BIGGER HANDS!", "NOPE. THAT'S NOT A HUG-SIZED ANIMAL.", "MY ARMS DON'T GO AROUND THAT!",
  "THAT'S NOT A PET. THAT'S A BUILDING.", 'WHERE DO YOU EVEN GRAB THAT?!',
];
export const TOO_BIG_BY_KIND: Record<string, string[]> = {
  'm2:trike': ["YOU DON'T SHAKE DOWN A TRICERATOPS!", "IT'S LIKE HUGGING A DUMP TRUCK!", 'THREE HORNS AND NO HANDLES!', "IT'S BOLTED TOGETHER! NOTHING TO GRAB!"],
  'm2:rex': ["I'M NOT WRESTLING A T. REX!", "THAT'S A WHOLE-ASS DINOSAUR!", 'TINY ARMS, BIG EVERYTHING ELSE!', 'I CAME UP TO ITS KNEE!'],
};
