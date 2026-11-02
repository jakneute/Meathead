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
  clean: ["HEY! HE'S CUTTING, THE PRICK!", "WE'VE BEEN HERE SINCE NINE, ASSHOLE!", "HE'S GOT A FAST PASS? HE LOOKS POOR!"],
  shitty: ["HE'S CUTTING! AND HE SHIT HIMSELF!", 'LET HIM CUT. GOD, LET HIM CUT.', "HE'S DRIPPING ON MY CROCS!"],
  nude: ["A NAKED MAN IS CUTTING THE LINE!", "WHERE'S HE KEEPING HIS PASS?!", 'COVER YOUR EYES, KAYLEE!'],
};
/** A staffer, explaining him away. */
export const STAFF_EXCUSE: Record<Dressed, string[]> = {
  clean: ["EXTRA FAST PASS, MA'AM.", 'EXTRA FAST PASS. TAKE IT UP WITH GUEST SERVICES.'],
  shitty: ['EXTRA FAST PASS. THE BROWN TIER.', 'EXTRA FAST PASS. IT COMES WITH THAT.'],
  nude: ["EXTRA FAST PASS. PANTS AREN'T INCLUDED.", "WHERE'S HE KEEPING IT? NOT MY PROBLEM."],
};
/** A staffer on break, as he goes by. */
export const STAFF_IDLE: Record<Dressed, string[]> = {
  clean: ["I'M ON BREAK.", "THEY DON'T PAY ME ENOUGH TO STOP YOU.", "I'M ON MY TEN. DO WHATEVER THE FUCK YOU WANT."],
  shitty: ["I'M NOT CLEANING THAT. I'M ON BREAK.", 'DUDE. YOU SHIT YOURSELF.', 'NOPE. GO AHEAD. KEEP WALKING.'],
  nude: ["SIR, YOUR DICK IS OUT. I'M ON BREAK, THOUGH.", 'NUDITY IS GUEST SERVICES. NOT ME.', "I DIDN'T SEE ANYTHING. I'M ON BREAK."],
};
/** A staffer he's hit. */
export const STAFF_HIT = ["OW. I'M STILL NOT FIGHTING YOU.", 'I MAKE ELEVEN DOLLARS AN HOUR, MAN.', 'COOL. COOL COOL COOL.'];

/** The front of the line, at the dock, as he walks past them onto their boat. */
export const GUEST_FRONT: Record<Dressed, string[]> = {
  clean: ["THAT'S OUR BOAT, YOU FAT FUCK!", 'I PAID FOUR HUNDRED DOLLARS FOR THIS DAY!'],
  shitty: ['TAKE IT. TAKE THE BOAT.', "HE'S SITTING ON THE SEAT! WITH HIS ASS!"],
  nude: ["HE'S NAKED AND HE TOOK OUR BOAT!", "KAYLEE, DON'T LOOK AT THE MAN'S BALLS!"],
};
/** The ride operator at the dock. */
export const OPERATOR_DOCK: Record<Dressed, string[]> = {
  clean: ['EXTRA FAST PASS. HOP IN, SIR.'],
  shitty: ["EXTRA FAST PASS. ARTIE'S GONNA LOVE THIS."],
  nude: ['EXTRA FAST PASS. ARTIE, YOU GOT A NAKED ONE.'],
};

// ---- Back after Artie's dead (the owner's: "there's no boat or 'active attendand' on duty, the line is still really
// long and people complain about the line not moving"). No operator at the dock; he just goes in off the end of it.

/** Meathead at the wait-time signs, back (one of these). */
export const MEATHEAD_SIGNS_BACK: Record<Dressed, string[]> = {
  clean: ["THE LINE'S LONGER. THERE'S NO FUCKING BOAT.", "THEY'RE STILL IN LINE. FOR A DEAD GUY'S BOAT."],
  shitty: ["THE LINE'S LONGER. NO BOAT. AND I SHIT MYSELF.", "STILL IN LINE. FOR A DEAD GUY'S BOAT. SUCKERS."],
  nude: ["THE LINE'S LONGER. NO BOAT. NO PANTS. NO PROBLEM.", "STILL IN LINE. FOR A DEAD GUY'S BOAT. I'M THE SMART ONE."],
};
/** Somebody in line, out back, as he goes by: it hasn't moved. */
export const GUEST_STUCK: Record<Dressed, string[]> = {
  clean: ["IT HASN'T MOVED IN FOUR HOURS!", "THERE'S NO BOAT! WHY ARE WE STILL IN LINE?!", 'HEY, FATSO! IS IT MOVING UP THERE?'],
  shitty: ["IT HASN'T MOVED IN FOUR HOURS! AND NOW IT SMELLS!", "WE'VE BEEN HERE SO LONG HE SHIT HIMSELF!", "IS IT MOVING UP THERE? NO, DON'T COME CLOSER!"],
  nude: ["IT HASN'T MOVED IN FOUR HOURS! NOW THERE'S A NAKED GUY!", 'THE LINE IS SO LONG HE LOST HIS PANTS IN IT!', 'IS IT MOVING UP THERE? WHY ARE YOU NAKED?!'],
};
/** A staffer, explaining it to them. */
export const STAFF_EXCUSE_BACK: Record<Dressed, string[]> = {
  clean: ["SKIPPER'S DEAD, MA'AM. THE LINE IS STILL OPEN.", "NO BOATS TODAY. KEEP WAITING. IT'S POLICY."],
  shitty: ["SKIPPER'S DEAD. THAT GUY DID IT. THEN HE SHIT HIMSELF.", 'NO BOATS. THE LINE STAYS. THE SMELL IS FREE.'],
  nude: ["SKIPPER'S DEAD. THE NAKED GUY DID IT. NOT MY PROBLEM.", 'NO BOATS. NO PANTS EITHER, I GUESS. KEEP WAITING.'],
};
/** A staffer on break, as he goes by again. */
export const STAFF_IDLE_BACK: Record<Dressed, string[]> = {
  clean: ["YOU AGAIN? I'M STILL ON BREAK.", "ARTIE'S DEAD. I GOT HIS SKIPPER OF THE YEAR PLAQUE.", "NO SKIPPER, NO BOATS. I'M ON BREAK FOREVER."],
  shitty: ['YOU AGAIN. STILL SHITTY. STILL ON BREAK.', 'YOU KILLED ARTIE AND YOU SHIT YOURSELF. BIG DAY.', "ARTIE'S DEAD AND YOU SMELL WORSE THAN HIM."],
  nude: ["YOU AGAIN. NOW YOU'RE NAKED. I'M STILL ON BREAK.", 'YOU KILLED ARTIE. THANKS. PUT YOUR DICK AWAY.', "NO SKIPPER, NO PANTS. I'M ON BREAK."],
};
/** The front of the line at the dock: next since forever. */
export const GUEST_FRONT_BACK: Record<Dressed, string[]> = {
  clean: ["WE'RE NEXT! WE'VE BEEN NEXT SINCE TUESDAY!", "WHERE'S THE BOAT? WHERE'S THE GUY?!"],
  shitty: ["WE'RE NEXT! DON'T CUT! DON'T STAND NEAR US!", 'WHERE IS THE BOAT? WHY DO YOU SMELL LIKE THAT?!'],
  nude: ["WE'RE NEXT! KAYLEE, DON'T LOOK AT THE MAN!", 'WHERE IS THE BOAT? WHERE ARE YOUR PANTS?!'],
};
/** Meathead at the end of the dock: no boat, in he goes. */
export const MEATHEAD_DOCK_BACK: Record<Dressed, string[]> = {
  clean: ['NO BOAT. CANNONBALL.', 'FUCK THE BOAT. I SWIM.'],
  shitty: ['NO BOAT. TIME TO WASH MY ASS.', 'THE RIVER NEEDS THIS MORE THAN I DO.'],
  nude: ['NO BOAT. SKINNY DIPPING.', 'NO PANTS TO GET WET. IN WE GO.'],
};

const flat = (r: Record<string, string[]>) => Object.values(r).flat();
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_SIGNS, MEATHEAD_BACK, ...flat(MEATHEAD_SIGNS_BACK), ...flat(MEATHEAD_DOCK_BACK)],
  'm2.guest': [...flat(GUEST_CUT), ...flat(GUEST_FRONT), ...flat(GUEST_STUCK), ...flat(GUEST_FRONT_BACK)],
  'm2.guest2': [...flat(GUEST_CUT), ...flat(GUEST_FRONT), ...flat(GUEST_STUCK), ...flat(GUEST_FRONT_BACK)],
  'm2.operator': [...flat(STAFF_EXCUSE), ...flat(STAFF_IDLE), ...STAFF_HIT, ...flat(OPERATOR_DOCK), ...flat(STAFF_EXCUSE_BACK), ...flat(STAFF_IDLE_BACK)],
  'm2.operator2': [...flat(STAFF_EXCUSE), ...flat(STAFF_IDLE), ...STAFF_HIT, ...flat(OPERATOR_DOCK), ...flat(STAFF_EXCUSE_BACK), ...flat(STAFF_IDLE_BACK)],
};
