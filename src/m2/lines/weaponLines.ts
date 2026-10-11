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
/** A grab at somebody who can't be grabbed, by what they are: a boss (or a mid-boss), a machine, a person the grabs
 *  don't work on. (An animal too big: TOO_BIG_LINES.) */
export const GRAB_IMMUNE_LINES: Record<'boss' | 'machine' | 'person', string[]> = {
  boss: [
    "HE'S NOT THE GRABBING KIND!", "BOSSES DON'T DO HUGS, APPARENTLY!", "CAN'T GET A GRIP ON THIS GUY!",
    'NOPE. SLIPPERY BASTARD.', "WON'T LET ME GET MY HANDS ON HIM!", "HE'S TOO BIG A DEAL TO GRAB!",
  ],
  machine: [
    "IT'S ALL BOLTS! NOTHING TO GRAB!", "YOU CAN'T SHAKE DOWN A MACHINE!", 'NO NECK! NO NECK ON IT!',
    "IT'S LIKE HUGGING A FRIDGE!", 'NOWHERE TO GET A HOLD!', 'METAL. SLIPPERY. NO.',
  ],
  person: [
    "CAN'T GET A HOLD OF HIM!", "HE WON'T STAND STILL FOR IT!", 'SLIPPED RIGHT OUT OF MY HANDS!',
    'NOT THIS ONE, APPARENTLY!', "HE'S GREASED UP OR SOMETHING!", "MY HANDS WON'T CLOSE ON HIM!",
  ],
};
export const TOO_BIG_BY_KIND: Record<string, string[]> = {
  'm2:trike': ["YOU DON'T SHAKE DOWN A TRICERATOPS!", "IT'S LIKE HUGGING A DUMP TRUCK!", 'THREE HORNS AND NO HANDLES!', "IT'S BOLTED TOGETHER! NOTHING TO GRAB!"],
  'm2:tower_ringer': ["IT'S A GIANT WIND-UP TOY! I CAN'T LIFT THAT!", 'SOLID BRASS! NOTHING TO GRAB BUT THE KEY!', "YOU DON'T PICK UP A TOY SOLDIER THAT SIZE!", 'IT WEIGHS MORE THAN THE BELL!'],
  'm2:rex': ["I'M NOT WRESTLING A T-REX!", "THAT'S A WHOLE-ASS DINOSAUR!", 'TINY ARMS, BIG EVERYTHING ELSE!', 'I CAME UP TO ITS KNEE!'],
};
