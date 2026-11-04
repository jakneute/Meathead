// What's said in the prologue of the epilogue (the owner's name for it) and the endgame's first stage: the walk out
// through America USA at closing (park security sat about bored, the PA shutting the park), the abduction in the
// garage and Satan's throw (abduction.ts), the lot outside the water park (lot/). The owner's own lines are kept word
// for word (WHO KEEPS A STANDBY UFO?, OH NO YOU DON'T., YOU ALIEN FUCKS...); the rest is flavor round them. Meathead's
// and anybody's who's talking to him three ways: clean pants, shitty, naked. All recorded: ENDGAME_VOICE_LINES (in
// tools/voices extract.ts and m2pack.ts).

export type Dressed = 'clean' | 'shitty' | 'nude';
type ByDress = Record<Dressed, string[]>;

export const SAUCER_VOICE = { id: 'm2.space.saucer', pitch: 0, rate: 1 };
export const SATAN_VOICE = { id: 'm2.satan', pitch: 0, rate: 1 };
export const ALIEN_VOICE = { id: 'm2.space.alien', pitch: 0, rate: 1 };
export const DEMON_VOICE = { id: 'm2.demon', pitch: 0, rate: 1 };

// ---------------------------------------------------------------------------------------------------------------
// The walk out (intro/index.ts, its walk-out mode)

/** Meathead, out of the gate, walking out (once, a moment in). */
export const MH_WALK_OUT: ByDress = {
  clean: ['GOOD DAY. KILLED A LOT OF SHIT.', "BACK TO THE TRUCK. IT'S IN A PILLAR."],
  shitty: ['GOOD DAY. SHIT MYSELF. KILLED A LOT OF SHIT.', 'BACK TO THE TRUCK. TOWELS ON THE SEAT.'],
  nude: ['GOOD DAY. LOST MY PANTS. KILLED A LOT OF SHIT.', 'BACK TO THE TRUCK. LEATHER SEATS. FUCK.'],
};
/** Park security, sat about at closing, waiting on everybody to leave so they can go home: muttered as he goes by. */
export const GUARD_BORED: ByDress = {
  clean: ['GO HOME. PLEASE. I WANT TO GO HOME.', "PARK'S CLOSED, BUDDY. KEEP WALKING.", 'TWELVE HOUR SHIFT. NOBODY ROBBED ANYTHING.', "DON'T START ANYTHING. I'M OFF IN FIVE.", 'LAST ONE OUT. EVERY NIGHT, SOME BIG GUY.'],
  shitty: ['GO HOME, SIR. AND SHOWER.', "I'M OFF IN FIVE. I'M NOT WRITING UP SHIT. LITERALLY.", 'KEEP WALKING, SIR. DOWNWIND.', "THE JANITOR'S GONNA CRY.", "PARK'S CLOSED. SO SHOULD YOUR PANTS BE."],
  nude: ['GO HOME, SIR. FIND PANTS ON THE WAY.', "PARK'S CLOSED. SO ARE MY EYES.", "I'M OFF IN FIVE. I DIDN'T SEE YOUR DICK.", 'KEEP WALKING, SIR. ALL OF YOU.', "THIRD NAKED GUY TODAY. I DON'T EVEN LOOK UP."],
};
/** ...and the moment he starts something (the first guard to see it, getting up off the chair). */
export const GUARD_ALERT_OUT: ByDress = {
  clean: ['OH COME ON! I WAS ALMOST OFF!', 'FIVE MINUTES! I HAD FIVE MINUTES LEFT!'],
  shitty: ['OH COME ON! I WAS ALMOST OFF, YOU SHITTY BASTARD!', 'FIVE MINUTES LEFT AND NOW I GOTTA TOUCH THAT!'],
  nude: ["OH COME ON! I WAS ALMOST OFF, AND HE'S NAKED!", 'FIVE MINUTES LEFT AND NOW I GOTTA TACKLE A NAKED GUY!'],
};
/** The PA, shutting the park. */
export const PA_OUT = [
  'HAPPY LAND IS NOW CLOSED. GO HOME. GOD BLESS.',
  'THE PARK IS CLOSED. GUESTS STILL INSIDE WILL BE CHARGED RENT.',
  "THANK YOU FOR VISITING HAPPY LAND. DON'T TELL ANYONE WHAT YOU SAW.",
  'WOULD THE OWNER OF THE RED PICKUP IN THE PILLAR PLEASE LEAVE. PLEASE.',
];

// ---------------------------------------------------------------------------------------------------------------
// The abduction (abduction.ts): ZARBLAX (Zorblax's wife and sister) in her standby saucer, then Satan

/** Her, over the saucer's loudspeaker, the truck going up in the beam: who she is... */
export const WIFE_HELLO: ByDress = {
  clean: ["HI, ASSHOLE. REMEMBER ME? ZARBLAX. ZORBLAX'S WIFE. AND SISTER."],
  shitty: ["HI, ASSHOLE. REMEMBER ME? ZARBLAX. HIS WIFE AND SISTER. YOU STILL STINK."],
  nude: ["HI, ASSHOLE. REMEMBER ME? ZARBLAX. HIS WIFE AND SISTER. STILL NAKED, HUH?"],
};
/** ...the saucer he wrecked, and this one. */
export const WIFE_STANDBY: ByDress = {
  clean: ['YOU WRECKED MY SAUCER. SO I BROUGHT THE OTHER ONE.'],
  shitty: ['YOU WRECKED MY SAUCER. SO I BROUGHT THE OTHER ONE. THE ONE WITH THE HOSE.'],
  nude: ['YOU WRECKED MY SAUCER. SO I BROUGHT THE OTHER ONE. THE GIRLS BROUGHT CAMERAS.'],
};
/** Him, in the cab, going up (the owner's line, then the state of him). */
export const MH_STANDBY: ByDress = {
  clean: ['WHO KEEPS A STANDBY UFO?'],
  shitty: ["WHO KEEPS A STANDBY UFO? I CAN'T KEEP CLEAN PANTS."],
  nude: ["WHO KEEPS A STANDBY UFO? I CAN'T EVEN KEEP PANTS."],
};
/** Her answer; then what's in store for him. */
export const WIFE_ANSWER = "A WIDOW WITH HER HUSBAND'S LIFE INSURANCE. AND HER BROTHER'S. SAME POLICY.";
export const WIFE_PLAN: ByDress = {
  clean: ['THE GIRLS WANT YOU STUFFED. OVER THE FIREPLACE.'],
  shitty: ['THE GIRLS WANT YOU STUFFED. AFTER A HOSE-DOWN.'],
  nude: ['THE GIRLS WANT YOU STUFFED. AS IS.'],
};
/** Satan, up out of the ground, a hand round the saucer (the owner's line). */
export const SATAN_GRAB = "OH NO YOU DON'T.";
/** Her, in his fist. */
export const WIFE_GRABBED = "HEY! HANDS OFF! THIS ONE'S LEASED!";
/** Satan, the truck in his other hand (the owner's line). */
export const SATAN_CLAIM = 'YOU ALIEN FUCKS STAKE NO CLAIM IN THIS MAN. HE OWES ME HIS SOUL.';
/** Him, held up in the cab in front of that face. */
export const MH_OWE: ByDress = {
  clean: ['I OWE YOU WHAT?'],
  shitty: ['I OWE YOU WHAT? I JUST SHIT MYSELF.'],
  nude: ["I OWE YOU WHAT? I DON'T EVEN HAVE POCKETS."],
};
/** Him, thrown, the truck tumbling over the water park. */
export const MH_THROWN: ByDress = {
  clean: ['OH SHIT. OH SHIT. OH SHIT.'],
  shitty: ['OH SHIT. MORE SHIT. OH SHIT.'],
  nude: ['OH SHIT. THE WIND. EVERYWHERE.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Stage 1: the lot outside the water park (lot/)

/** Climbing out of the wreck. */
export const MH_LOT: ByDress = {
  clean: ["TWO TRUCKS IN ONE DAY. THE GOVERNMENT'S GONNA BE PISSED.", 'A WATER PARK. FINALLY, SOME GOOD NEWS.'],
  shitty: ['TWO TRUCKS IN ONE DAY. AND MY PANTS. FUCK.', 'A WATER PARK. I CAN RINSE OFF.'],
  nude: ['TWO TRUCKS IN ONE DAY. AND NO PANTS.', "A WATER PARK. FINALLY, A PLACE I'M DRESSED FOR."],
};
/** At the water park's gate, chained shut (the stub's end, for now). */
export const MH_GATE: ByDress = {
  clean: ['LOCKED. FOR NOW.', 'A CHAIN ON THE GATE. CUTE.'],
  shitty: ["LOCKED. AND I'M THE ONE WHO NEEDS A RINSE.", 'A CHAIN ON THE GATE. MY PANTS ARE CRYING.'],
  nude: ["LOCKED. I'LL CLIMB IT LATER. CAREFULLY.", 'A CHAIN ON THE GATE. NOT CLIMBING THAT NAKED. YET.'],
};
/** The aliens and the demons up there, fighting over who gets him: now and then one of them yells it. */
export const ALIEN_CLAIM = ['HE KILLED OUR QUEEN! HE IS OURS!', 'BACK OFF, HORN BOY! WE SAW HIM FIRST!', 'HE GOES IN A JAR! THAT IS THE RULE!'];
export const DEMON_CLAIM = ["HE OWES THE BOSS A SOUL! HE'S OURS!", 'GET BACK IN YOUR FRISBEE, GRAY BOY!', "THE BOSS SAID BRING HIM DOWN. WHOLE OR NOT."];

/** All of it, by voice, for the recordings. */
const all = (...pools: (string | string[] | ByDress)[]) => pools.flatMap(p => (typeof p === 'string' ? [p] : Array.isArray(p) ? p : Object.values(p).flat()));
export const ENDGAME_VOICE_LINES: Record<string, string[]> = {
  meathead: all(MH_WALK_OUT, MH_STANDBY, MH_OWE, MH_THROWN, MH_LOT, MH_GATE),
  'm2.guard': all(GUARD_BORED, GUARD_ALERT_OUT),
  'm2.guardf': all(GUARD_BORED, GUARD_ALERT_OUT),
  'm2.pa': all(PA_OUT),
  'm2.space.saucer': all(WIFE_HELLO, WIFE_STANDBY, WIFE_ANSWER, WIFE_PLAN, WIFE_GRABBED),
  'm2.satan': all(SATAN_GRAB, SATAN_CLAIM),
  'm2.space.alien': all(ALIEN_CLAIM),
  'm2.demon': all(DEMON_CLAIM),
};
