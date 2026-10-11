// What's said in the Jungle Cruise's queue (queue/index.ts): Meathead at the signs, the people in line when he goes
// round them, the staff (who can't be arsed: it's the extra fast pass, whatever he is), the front of the line at the
// dock. Where somebody reacts to him, three ways: clean, shitty pants, naked. Recorded with the rest (tools/voices).

export type Dressed = 'clean' | 'shitty' | 'nude';

/** Meathead at the wait-time signs (in order). */
export const MEATHEAD_SIGNS = ['THREE HOURS. FOR A BOAT.', 'EXTRA FAST PASS: FOUR HOURS. FUCK THAT.'];
/** ...and at the staff gate. */
export const MEATHEAD_BACK = 'EXTRA FAST PASS.';

/** Somebody in line, seeing him go round them (through the fence out back). */
export const GUEST_CUT: Record<Dressed, string[]> = {
  clean: ["HEY! HE'S CUTTING, THE PRICK!", "WE'VE BEEN HERE SINCE NINE, ASSHOLE!", 'HOW COME HE GETS TO GO BACK THERE?'],
  shitty: ["HE'S CUTTING! AND HE SHIT HIMSELF!", 'LET HIM CUT. GOD, LET HIM CUT.', 'IS THAT GUY LEAKING?'],
  nude: ["A NAKED MAN IS CUTTING THE LINE!", "WHERE'S HE KEEPING HIS PASS?!", 'COVER YOUR EYES, KAYLEE!'],
};
/** A staffer, explaining him away. */
export const STAFF_EXCUSE: Record<Dressed, string[]> = {
  clean: ["EXTRA FAST PASS, MA'AM.", "IT'S THE EXTRA FAST PASS. DON'T WORRY ABOUT IT."],
  shitty: ['EXTRA FAST PASS. THE BROWN TIER.', 'EXTRA FAST PASS. IT COMES WITH THAT.'],
  nude: ["EXTRA FAST PASS. PANTS AREN'T INCLUDED.", "WHERE'S HE KEEPING IT? NOT MY PROBLEM."],
};
/** A staffer on break, as he goes by. */
export const STAFF_IDLE: Record<Dressed, string[]> = {
  clean: ["I'M ON BREAK.", "THEY DON'T PAY ME ENOUGH TO STOP YOU.", "YOU'RE NOT ALLOWED BACK HERE. ANYWAY."],
  shitty: ["I'M NOT CLEANING THAT. I'M ON BREAK.", 'DUDE. YOU SHIT YOURSELF.', 'NOPE. GO AHEAD. KEEP WALKING.'],
  nude: ["SIR, YOUR DICK IS OUT. I'M ON BREAK, THOUGH.", 'NUDITY IS GUEST SERVICES. NOT ME.', "I DIDN'T SEE ANYTHING. I'M ON BREAK."],
};
/** A staffer he's hit. */
export const STAFF_HIT = ["OW. I'M STILL NOT FIGHTING YOU.", 'I MAKE ELEVEN DOLLARS AN HOUR, MAN.', 'COOL. COOL COOL COOL.'];

/** The front of the line, at the dock, as he walks past them onto their boat. */
export const GUEST_FRONT: Record<Dressed, string[]> = {
  clean: ["THAT'S OUR BOAT, YOU FAT FUCK!", 'THREE HOURS! WE WAITED THREE HOURS!'],
  shitty: ['TAKE IT. TAKE THE BOAT.', "HE'S SITTING ON THE SEAT! WITH HIS ASS!"],
  nude: ["HE'S NAKED AND HE TOOK OUR BOAT!", "KAYLEE, DON'T LOOK AT THE MAN'S BALLS!"],
};
/** The ride operator at the dock. */
export const OPERATOR_DOCK: Record<Dressed, string[]> = {
  clean: ['EXTRA FAST PASS. HOP IN, SIR.'],
  shitty: ["EXTRA FAST PASS. ARTIE'S GONNA LOVE THIS."],
  nude: ['EXTRA FAST PASS. ARTIE, YOU GOT A NAKED ONE.'],
};

const flat = (r: Record<string, string[]>) => Object.values(r).flat();
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_SIGNS, MEATHEAD_BACK],
  'm2.guest': [...flat(GUEST_CUT), ...flat(GUEST_FRONT)],
  'm2.guest2': [...flat(GUEST_CUT), ...flat(GUEST_FRONT)],
  'm2.operator': [...flat(STAFF_EXCUSE), ...flat(STAFF_IDLE), ...STAFF_HIT, ...flat(OPERATOR_DOCK)],
  'm2.operator2': [...flat(STAFF_EXCUSE), ...flat(STAFF_IDLE), ...STAFF_HIT, ...flat(OPERATOR_DOCK)],
};
