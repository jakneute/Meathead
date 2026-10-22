// What Meathead says, Meathead 2, about his stomach (the crouching easter egg, game/player/gut.ts): crouched still too
// long, the grumble, the warning, then he's shit himself; and, already shitty, the same again, and his pants are gone.
// Meathead 2's own (Meathead 1's are in its dialogue). Put in the engine at startup; recorded with the rest
// (tools/voices: extract.ts, m2pack.ts).

export const M2_GUT_LINES = {
  GRUMBLE: [
    '...THAT TURKEY LEG WAS GREEN IN THE MIDDLE.',
    'FOURTEEN CHURROS. THAT WAS TOO MANY CHURROS.',
    'MY ASS IS MAKING WHALE NOISES.',
    'THAT HOT DOG HAD A BAND-AID IN IT.',
  ],
  /** A few seconds on, still squatting: the warning (get up, or else). */
  WARN: [
    "DON'T SQUAT. THE CHURROS WANT OUT.",
    'STAND UP OR THIS PARK GETS A NEW LOG RIDE.',
    "IT'S CROWNING. STAND UP.",
    'CLENCH, YOU STUPID ASS. CLENCH.',
  ],
  ACCIDENT: [
    '...THAT WAS NOT A FART.',
    "FUCK. IT'S IN MY SOCKS.",
    'THERE WAS CORN IN THAT. I FELT THE CORN.',
    'WARM. WHY IS IT ALWAYS WARM?',
  ],
  /** Already shitty, and squatting down again: the second grumble. */
  GRUMBLE_AGAIN: [
    "THERE'S MORE?! I DIDN'T EAT THIS MUCH!",
    'ROUND TWO. OH GOD, ROUND TWO.',
    'THE CORN DOG WANTS OUT TOO.',
    'MY ASS IS RELOADING.',
  ],
  /** ...and still squatting: these pants can't take another one. */
  WARN_AGAIN: [
    "THESE PANTS CAN'T TAKE ANOTHER ONE.",
    'IF THIS ONE GOES, THE PANTS GO WITH IT.',
    'THE PANTS ARE AT CAPACITY. STAND UP.',
    "MY BUTTHOLE'S HUMMING. THAT'S NEW.",
  ],
  /** Naked already, squatting a third time: nothing left to blow off. */
  GRUMBLE_THIRD: [
    "NO PANTS LEFT. IT'S GONNA GO EVERYWHERE.",
    "THAT'S NOT A RUMBLE. THAT'S A COUNTDOWN.",
    "NOT AGAIN. THERE'S NOTHING LEFT TO BLOW OFF.",
  ],
  /** ...and still squatting: this one's going to take him with it. */
  WARN_THIRD: [
    'THIS ONE FEELS STRUCTURAL.',
    'TELL MY TRUCK I LOVED IT.',
    'TELL MY MOM IT WAS THE CHURROS.',
  ],
  /** ...and it went: so hard his pants and his underpants blew clean off him. Naked but for his boots. */
  BLOWOUT: [
    "...WELL. I'M NAKED NOW.",
    "THAT'S THE MOST FREE I'VE EVER FELT.",
    'AT LEAST I STILL GOT MY BOOTS.',
    'MY UNDERWEAR HIT A BIRD.',
    'THE PANTS ARE IN ORBIT.',
  ],
  /** Naked and shitty, in clean water: it's washing it off him... */
  WASHED: [
    "THE WATER'S TAKING IT. ALL OF IT.",
    'GOODBYE, CHURROS. SWIM FREE.',
    'NOBODY SWIM HERE FOR A WHILE.',
    'BALLS RINSED. GOOD ENOUGH.',
  ],
  /** Shitty pants still on, a while in clean water: rinsed out, good as new. */
  WASHED_PANTS: [
    'RINSED OUT. GOOD AS NEW. BASICALLY.',
    'PANTS ARE CLEAN. NOBODY HAS TO KNOW.',
    "AND THAT'S WHY YOU WEAR DARK JEANS.",
    'STILL A LITTLE CRUNCHY. FINE.',
  ],
  /** ...and, right after: clean, but still no pants. */
  WASHED_NO_PANTS: [
    'STILL NO PANTS, THOUGH.',
    'CLEAN ASS. NO PANTS. ONE OUT OF TWO.',
    "CLEANEST MY DICK'S BEEN ALL YEAR.",
  ],
};

/** The death screen, the third time: he's blown himself to bits from the inside out (read out by the death announcer). */
export const M2_GUT_DEATH = [
  'YOU SHIT YOURSELF TO DEATH.',
  'EXPLODED. ASS FIRST.',
  'YOUR ASS WON.',
  'DEATH BY CHURRO.',
];
