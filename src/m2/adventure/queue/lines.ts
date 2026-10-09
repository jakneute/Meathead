// What's said in the Jungle Cruise's queue (queue/index.ts): Meathead at the signs, the people in line when he goes
// round them, the staff (who can't be arsed: it's the extra fast pass, whatever he is), the front of the line at the
// dock. Where somebody reacts to him, three ways: clean, shitty pants, naked. Recorded with the rest (tools/voices).

export type Dressed = 'clean' | 'shitty' | 'nude';

/** Meathead at the wait-time signs (in order). */
export const MEATHEAD_SIGNS = ['THREE HOURS? FOR A BOAT?', 'THE EXTRA FAST PASS LINE IS LONGER THAN THE FAST PASS LINE.', 'FUCK THAT.'];
/** ...and at the staff gate. */
export const MEATHEAD_BACK = 'EXTRA FAST PASS.';

/** Somebody in line, seeing him go round them (through the fence out back). */
export const GUEST_CUT: Record<Dressed, string[]> = {
  clean: ["HEY! HE'S CUTTING!", "EXCUSE ME! THERE'S A LINE!", "WE'VE BEEN HERE SINCE NINE A.M.!", 'WHY DOES HE GET TO GO BACK THERE?'],
  shitty: ["HE'S CUTTING! AND HE SMELLS LIKE A PORTA-POTTY!", 'LET HIM GO. LET HIM GO, PLEASE. AWAY FROM US.', "IS HE CUTTING, OR IS HE LEAKING? BOTH. IT'S BOTH."],
  nude: ["THERE'S A NAKED MAN CUTTING THE LINE!", "HE DOESN'T HAVE A FAST PASS! HE DOESN'T HAVE ANYTHING!", 'WHY IS HE NAKED AND WHY DOES HE GET TO GO FIRST?'],
};
/** A staffer, explaining him away. */
export const STAFF_EXCUSE: Record<Dressed, string[]> = {
  clean: ["HE'S GOT THE EXTRA FAST PASS, MA'AM.", "EXTRA FAST PASS. IT'S A WHOLE THING.", "THAT'S THE EXTRA FAST PASS. IT'S NEW. DON'T WORRY ABOUT IT."],
  shitty: ['EXTRA FAST PASS. ...THE BROWN TIER.', "THAT'S THE EXTRA FAST PASS. IT COMES WITH... THAT."],
  nude: ["EXTRA FAST PASS. PLATINUM. IT DOESN'T COME WITH PANTS.", "HE'S GOT THE EXTRA FAST PASS. WHERE'S HE KEEPING IT? NOT MY PROBLEM."],
};
/** A staffer on break, as he goes by. */
export const STAFF_IDLE: Record<Dressed, string[]> = {
  clean: ["I'M ON BREAK.", "I DON'T GET PAID ENOUGH TO STOP YOU.", 'DO WHATEVER YOU WANT, MAN.', "YOU'RE NOT SUPPOSED TO BE BACK HERE. ANYWAY."],
  shitty: ['YOU SMELL LIKE MY WHOLE SHIFT.', 'NOPE. NOT TOUCHING THAT. GO AHEAD.', "I'M NOT CLEANING THAT UP. I'M ON BREAK."],
  nude: ["SIR, YOU'RE NAKED. ...I'M ON BREAK, THOUGH.", 'NOT MY DEPARTMENT. NUDITY IS GUEST SERVICES.', "I DIDN'T SEE ANYTHING. I DON'T WANT TO SEE ANYTHING."],
};
/** A staffer he's hit. */
export const STAFF_HIT = ["OW. ...I'M STILL NOT FIGHTING YOU.", "THAT'S GOING IN MY REPORT. WHICH I'M NOT GOING TO WRITE.", 'I MAKE ELEVEN DOLLARS AN HOUR, MAN.', 'COOL. COOL COOL COOL.'];

/** The front of the line, at the dock, as he walks past them onto their boat. */
export const GUEST_FRONT: Record<Dressed, string[]> = {
  clean: ["WE'VE BEEN IN LINE FOR THREE HOURS!", "THAT'S OUR BOAT! THAT'S OUR BOAT!"],
  shitty: ["OH GOD, HE'S GETTING IN OUR BOAT. TAKE IT. TAKE THE BOAT."],
  nude: ["HE'S NAKED AND HE'S TAKING OUR BOAT!"],
};
/** The ride operator at the dock. */
export const OPERATOR_DOCK: Record<Dressed, string[]> = {
  clean: ['EXTRA FAST PASS. STEP RIGHT IN, SIR.'],
  shitty: ["EXTRA FAST PASS. ...ARTIE'S GONNA LOVE THIS."],
  nude: ['EXTRA FAST PASS. ...ARTIE, YOU GOT ONE.'],
};

const flat = (r: Record<string, string[]>) => Object.values(r).flat();
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_SIGNS, MEATHEAD_BACK],
  'm2.guest': [...flat(GUEST_CUT), ...flat(GUEST_FRONT)],
  'm2.guest2': [...flat(GUEST_CUT), ...flat(GUEST_FRONT)],
  'm2.operator': [...flat(STAFF_EXCUSE), ...flat(STAFF_IDLE), ...STAFF_HIT, ...flat(OPERATOR_DOCK)],
  'm2.operator2': [...flat(STAFF_EXCUSE), ...flat(STAFF_IDLE), ...STAFF_HIT, ...flat(OPERATOR_DOCK)],
};
