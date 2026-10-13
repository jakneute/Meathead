// What's said in the drag section, by voice (recorded with the rest: space/voices.ts gathers these; tools/voices). In
// the user's voice (space-spec.md); pick lines with pickLine. The drag's enemies and gear are the square's (their hurt
// and death lines are in square/lines.ts); the PA is the square's too (square/lines.ts's PA_VOICE).

/** Down on the main drag, on top of what's left of the riders of the sled in front (he's fine). */
export const LANDED = [
  "I'M FINE.",
  'SOFT LANDING. THANKS, GUYS.',
  'THEY BROKE MY FALL. AND EVERYTHING ELSE.',
];
/** Back past the smear later (once). */
export const SMEAR_AGAIN = [
  "STILL THERE. NOBODY'S MOPPING THAT.",
  'THE FUTURE HAS A STAIN ON IT.',
];
/** The PA, about the launch (a minute after: the same for anybody). */
export const PA_EJECT = ['ATTENTION. THE VOYAGE TO 2010 HAS EJECTED A GUEST. THIS IS A NEW FEATURE. ENJOY!'];
/** His first look up at Space Needle 2. */
export const NEEDLE_SEEN = [
  'SPACE NEEDLE 2. IT GOES ALL THE WAY TO SPACE. THE FIRST ONE WAS A PUSSY.',
  "THAT THING GOES UP FOREVER. I BET THE TOP'S A RESTAURANT.",
];
/** The anti-gravity saucers over the trench. */
export const SAUCERS = [
  'ANTI-GRAVITY. THERE IS A POLE RIGHT THERE. I CAN SEE THE POLE.',
  'FLYING SAUCERS ON STICKS. MY GRANDMA COULD BUILD THIS. SHE DID, PROBABLY.',
];
/** The third rail along the monorail track. */
export const THIRD_RAIL = [
  "THE TRACK'S ELECTRIC TOO. EVERYTHING HERE WANTS TO FRY MY NUTS.",
  'THIRD RAIL. I KNOW WHAT THAT IS. I PEED ON ONE ONCE.',
];
/** The long people mover the wrong way. */
export const MOVER_BACK = [
  'A MOVING SIDEWALK GOING THE WRONG WAY. THAT IS A TREADMILL. FUCK THIS.',
  'THE FUTURE HAS TREADMILLS IN THE STREET. NO WONDER EVERYBODY LEFT.',
];
/** At the needle's lift. */
export const NEEDLE_BASE = [
  'FIVE MILES UP. THE ELEVATOR BETTER HAVE A TOILET.',
  'TO SPACE AND BEYOND. I PACKED NOTHING. LET\'S GO.',
];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...LANDED, ...SMEAR_AGAIN, ...NEEDLE_SEEN, ...SAUCERS, ...THIRD_RAIL, ...MOVER_BACK, ...NEEDLE_BASE],
  'm2.space.futurepa': [...PA_EJECT],
};
