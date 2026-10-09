// What Meathead says, Meathead 2, about his stomach (the crouching easter egg, game/player/gut.ts): crouched still too
// long, the grumble, the warning, then he's shit himself; and, already shitty, the same again, and his pants are gone.
// Meathead 2's own (Meathead 1's are in its dialogue). Put in the engine at startup; recorded with the rest
// (tools/voices: extract.ts, m2pack.ts).

export const M2_GUT_LINES = {
  GRUMBLE: [
    '...THAT TURKEY LEG WAS GREEN IN THE MIDDLE.',
    'FOURTEEN CHURROS. IN LINE. FOR THE TEACUPS.',
    'THE FUNNEL CAKE IS FIGHTING BACK.',
    'NEVER TRUST A HOT DOG SHAPED LIKE A MASCOT.',
  ],
  /** A few seconds on, still squatting: the warning (get up, or else). */
  WARN: [
    "DON'T SQUAT. THE CHURROS ARE LOOKING FOR THE EXIT.",
    'STAND UP, OR THIS PARK GETS A NEW WATER RIDE.',
    'SQUATTING IS MAKING IT WORSE. I CAN FEEL IT MOVING.',
    "GET UP. GET UP. IT'S RIGHT THERE.",
  ],
  ACCIDENT: [
    '...THAT WAS NOT A FART. THAT WAS A FUNNEL CAKE.',
    'SHOULD HAVE KEPT MY HANDS AND FEET INSIDE THE RIDE.',
    'IN HAPPY LAND, OF ALL PLACES.',
    "IT'S A THEME PARK. SOMEBODY'S SEEN WORSE.",
  ],
  /** Already shitty, and squatting down again: the second grumble. */
  GRUMBLE_AGAIN: [
    "IT'S NOT DONE. HOW IS IT NOT DONE?!",
    'ROUND TWO. OH GOD, ROUND TWO.',
    "THERE'S MORE?! WHERE IS IT ALL COMING FROM?!",
    "THE CORN DOG'S COMING BACK FOR SECONDS.",
  ],
  /** ...and still squatting: these pants can't take another one. */
  WARN_AGAIN: [
    "GET UP. THESE PANTS CAN'T TAKE ANOTHER ONE.",
    'IF THIS ONE GOES, THE PANTS GO WITH IT.',
    'STAND UP, MEATHEAD. FOR THE LOVE OF GOD, STAND UP.',
    "THAT'S PRESSURE. THAT'S A LOT OF PRESSURE.",
  ],
  /** Naked already, squatting a third time: nothing left to blow off. */
  GRUMBLE_THIRD: [
    "OH NO. NOT AGAIN. THERE'S NOTHING LEFT TO BLOW OFF.",
    "MY GUT'S DOING THE THING AGAIN. I'M OUT OF PANTS. WHERE'S IT GONNA GO?",
    "THAT'S NOT A RUMBLE. THAT'S A COUNTDOWN.",
  ],
  /** ...and still squatting: this one's going to take him with it. */
  WARN_THIRD: [
    'THIS ONE FEELS DIFFERENT. THIS ONE FEELS STRUCTURAL.',
    'TELL MY TRUCK I LOVED IT.',
    'EVERYBODY GET BACK. I MEAN IT. WAY BACK.',
  ],
  /** ...and it went: so hard his pants and his underpants blew clean off him. Naked but for his boots. */
  BLOWOUT: [
    '...WELL. I\'M NAKED NOW.',
    "WHERE'D MY PANTS GO?! THEY WERE JUST ON ME!",
    "THAT'S THE MOST FREE I'VE EVER FELT.",
    'AT LEAST I STILL GOT MY BOOTS.',
    'NOBODY LOOK DOWN.',
    'THE PANTS ARE IN ORBIT. THE PANTS ARE GONE.',
  ],
  /** Naked and shitty, in clean water: it's washing it off him... */
  WASHED: [
    "AH. THE WATER'S TAKING IT. ALL OF IT.",
    "THAT'S A CLEAN ASS. FIRST TIME TODAY.",
    "OH, THAT'S BETTER. THAT'S SO MUCH BETTER.",
    "NOBODY SWIM HERE FOR A WHILE.",
  ],
  /** Shitty pants still on, a while in clean water: rinsed out, good as new. */
  WASHED_PANTS: [
    'RINSED OUT. GOOD AS NEW. BASICALLY.',
    "PANTS ARE CLEAN. NOBODY HAS TO KNOW.",
    "THERE. LIKE IT NEVER HAPPENED.",
    "AND THAT'S WHY YOU WEAR DARK JEANS.",
  ],
  /** ...and, right after: clean, but still no pants. */
  WASHED_NO_PANTS: [
    'STILL NO PANTS, THOUGH.',
    'CLEAN ASS. NO PANTS. ONE OUT OF TWO.',
    'NOW IF ONLY THE WATER HAD PANTS IN IT.',
    'SHAME ABOUT THE PANTS.',
  ],
};

/** The death screen, the third time: he's blown himself to bits from the inside out (read out by the death announcer). */
export const M2_GUT_DEATH = [
  'YOU SHIT YOURSELF TO DEATH.',
  'NOTHING LEFT TO BLOW OFF. SO YOU BLEW UP.',
  'CAUSE OF DEATH: THE THIRD ONE.',
  'DEATH BY CHURRO.',
];
