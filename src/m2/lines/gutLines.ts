// What Meathead says, Meathead 2, about his stomach (the crouching easter egg, game/player/gut.ts): crouched still too
// long, the grumble, the warning, then he's shit himself; and, already shitty, the same again, and his pants are gone.
// Meathead 2's own (Meathead 1's are in its dialogue). Put in the engine at startup; recorded with the rest
// (tools/voices: extract.ts, m2pack.ts).

export const M2_GUT_LINES = {
  GRUMBLE: [
    '...THAT TURKEY LEG WAS GREEN IN THE MIDDLE.',
    'FOURTEEN CHURROS. THAT WAS TOO MANY CHURROS.',
    'THE FUNNEL CAKE IS FIGHTING BACK.',
    'NEVER TRUST A HOT DOG SHAPED LIKE A MASCOT.',
  ],
  /** A few seconds on, still squatting: the warning (get up, or else). */
  WARN: [
    "DON'T SQUAT. THE CHURROS WANT OUT.",
    'STAND UP OR THIS PARK GETS A NEW WATER RIDE.',
    "IT'S CROWNING. STAND UP.",
    "GET UP. GET UP. IT'S RIGHT THERE.",
  ],
  ACCIDENT: [
    '...THAT WAS NOT A FART.',
    'IN HAPPY LAND, OF ALL PLACES.',
    "IT'S A THEME PARK. THEY'VE SEEN WORSE.",
    'WARM. WHY IS IT ALWAYS WARM?',
  ],
  /** Already shitty, and squatting down again: the second grumble. */
  GRUMBLE_AGAIN: [
    "THERE'S MORE?! WHERE'S IT ALL COMING FROM?!",
    'ROUND TWO. OH GOD, ROUND TWO.',
    'THE CORN DOG WANTS OUT TOO.',
    'HOW IS IT NOT DONE?',
  ],
  /** ...and still squatting: these pants can't take another one. */
  WARN_AGAIN: [
    "THESE PANTS CAN'T TAKE ANOTHER ONE.",
    'IF THIS ONE GOES, THE PANTS GO WITH IT.',
    'STAND UP, MEATHEAD. FOR THE LOVE OF GOD.',
    "THAT'S PRESSURE. THAT'S A LOT OF PRESSURE.",
  ],
  /** Naked already, squatting a third time: nothing left to blow off. */
  GRUMBLE_THIRD: [
    "OH NO. I'M OUT OF PANTS. WHERE'S IT GONNA GO?",
    "THAT'S NOT A RUMBLE. THAT'S A COUNTDOWN.",
    "NOT AGAIN. THERE'S NOTHING LEFT TO BLOW OFF.",
  ],
  /** ...and still squatting: this one's going to take him with it. */
  WARN_THIRD: [
    'THIS ONE FEELS STRUCTURAL.',
    'TELL MY TRUCK I LOVED IT.',
    'EVERYBODY GET BACK. WAY BACK.',
  ],
  /** ...and it went: so hard his pants and his underpants blew clean off him. Naked but for his boots. */
  BLOWOUT: [
    "...WELL. I'M NAKED NOW.",
    "THAT'S THE MOST FREE I'VE EVER FELT.",
    'AT LEAST I STILL GOT MY BOOTS.',
    'NOBODY LOOK DOWN.',
    'THE PANTS ARE IN ORBIT.',
  ],
  /** Naked and shitty, in clean water: it's washing it off him... */
  WASHED: [
    "THE WATER'S TAKING IT. ALL OF IT.",
    "THAT'S A LOT OF BROWN WATER.",
    'NOBODY SWIM HERE FOR A WHILE.',
    "OH, THAT'S BETTER.",
  ],
  /** Shitty pants still on, a while in clean water: rinsed out, good as new. */
  WASHED_PANTS: [
    'RINSED OUT. GOOD AS NEW. BASICALLY.',
    'PANTS ARE CLEAN. NOBODY HAS TO KNOW.',
    "AND THAT'S WHY YOU WEAR DARK JEANS.",
    'LIKE IT NEVER HAPPENED.',
  ],
  /** ...and, right after: clean, but still no pants. */
  WASHED_NO_PANTS: [
    'STILL NO PANTS, THOUGH.',
    'CLEAN ASS. NO PANTS. ONE OUT OF TWO.',
    'SHAME ABOUT THE PANTS.',
  ],
};

/** The death screen, the third time: he's blown himself to bits from the inside out (read out by the death announcer). */
export const M2_GUT_DEATH = [
  'YOU SHIT YOURSELF TO DEATH.',
  'EXPLODED. ASS FIRST.',
  'KILLED BY THE THIRD ONE.',
  'DEATH BY CHURRO.',
];
