// What's said in the atom section, by voice (recorded with the rest: space/voices.ts gathers these; tools/voices). In
// the user's voice (space-spec.md); pick lines with pickLine; clean / shitty / naked pools where people react to him.

export type Dressed = 'clean' | 'shitty' | 'nude';
export type ByPants = Record<Dressed, string[]>;

// ---------------------------------------------------------------------------------------------------------------
// The stagehands (a man's voice and a woman's: the same lines, by who it is), cowering as he comes at them

export const HAND_COWERS: ByPants = {
  clean: ['I JUST RUN THE FOG!', "I'M NOT EVEN UNION!", 'I MAKE ELEVEN BUCKS AN HOUR!', "DON'T! I'VE GOT A KID! HE'S AN ASSHOLE, BUT I'VE GOT ONE!"],
  shitty: ["OH GOD, IT'S IN MY HEADSET!", "I'M NOT PAID ENOUGH TO SMELL THAT!", 'I CAN TASTE YOU!', "THAT'S GONNA BE IN THE FOG NOW!"],
  nude: ["NAKED GUY BACKSTAGE! THAT'S TWICE THIS WEEK!", 'PUT IT AWAY! THERE\'S BLACKLIGHT IN HERE!', 'I SEE ENOUGH ASS ON THIS JOB!', "THAT'S NOT ON THE CUE SHEET!"],
};
/** The cast members in costume (the astronauts, the martians), coming at him (now and then). */
export const CAST_BARKS: ByPants = {
  clean: ['SIR, THIS IS A CAST-ONLY AREA!', 'ONE SMALL STEP, BUDDY!', "YOU'RE OFF SCRIPT, ASSHOLE!"],
  shitty: ['CAST ONLY! AND CLEAN PANTS ONLY!', 'HOUSTON, WE HAVE A SHITTER!', 'YOU SMELL LIKE THE PORTA-POTTY ON THE MOON!'],
  nude: ['CAST ONLY! AND PANTS ONLY!', 'HOUSTON, WE HAVE A NAKED GUY!', 'PUT ON A SPACESUIT! PUT ON ANYTHING!'],
};

// ---------------------------------------------------------------------------------------------------------------
// The line (a woman's voice and a man's: m2.guest, m2.guest2), as he walks up past them to the front

export const QUEUE_BARKS: ByPants = {
  clean: ['HEY! THE LINE STARTS BACK THERE!', "WE'VE BEEN HERE TWO HOURS, YOU FAT FUCK!", "I'M TELLING A MANAGER! ALL OF THEM!", 'OH, SURE. JUST WALK RIGHT UP.'],
  shitty: ["HE'S CUTTING AND HE SHIT HIMSELF!", 'LET HIM GO. JUST BREATHE THROUGH YOUR MOUTH.', 'NOW THE WHOLE LINE SMELLS LIKE HIM!', "THAT'S A TWO-HOUR WAIT AND A FIVE-HOUR SMELL!"],
  nude: ["HE'S NAKED AND HE'S CUTTING!", "COVER THE KIDS' EYES! COVER MINE!", "THAT'S NOT A FAST PASS, THAT'S HIS ASS!", 'SHIRT, SHOES, AND A WIENER COVER, BUDDY!'],
};
/** Meathead, cutting (once, going up the line). */
export const MEATHEAD_CUTS = ["I'M WITH THE BAND.", "MAKE-A-WISH. I'M DYING.", 'SINGLE RIDER.'];

// ---------------------------------------------------------------------------------------------------------------
// THE HIJACK: the operator (m2.space.op), the two in the sled (by who they are), him

export const OP_GREET: Record<Dressed, string> = {
  clean: 'WELCOME TO THE FUTURE! HOW MANY IN YOUR PARTY?',
  shitty: 'WELCOME TO THE FUTURE! ...WHAT IS THAT SMELL?',
  nude: 'WELCOME TO THE— SIR, WHERE ARE YOUR CLOTHES?',
};
export const MEATHEAD_PARTY = ['ONE.', 'JUST ME. THEY\'RE GETTING OUT.'];
/** The one he hauls out of the front seat and throws over the rail into the line. */
export const GUEST_THROWN: ByPants = {
  clean: ['MY KIDS ARE WATCHING!', 'I HAD A FAST PASS!'],
  shitty: ['HE GRABBED ME WITH HIS SHIT HANDS!', "IT'S IN MY FANNY PACK!"],
  nude: ['HIS THING TOUCHED MY ARM!', 'I FELT IT! I FELT ALL OF IT!'],
};
/** The one in the back seat, getting out on their own. */
export const GUEST_FLEES = "I'LL WAIT FOR THE NEXT ONE.";
export const OP_PROTEST: Record<Dressed, string> = {
  clean: "SIR! STAR SLEDS ARE CAST-OPERATED! I'M WRITING YOU UP!",
  shitty: "SIR! YOU CAN'T SIT IN THE— AW. THAT'S THE WHOLE SLED.",
  nude: 'SIR! BARE ASS ON THE SEATS IS A CODE NINE!',
};
export const MEATHEAD_WHICH = 'WHICH ONE MAKES IT GO?';
export const OP_DONT = "DON'T TOUCH THE BIG GREEN ONE.";
export const OP_AFTER = '...ENJOY THE FUTURE.';

// ---------------------------------------------------------------------------------------------------------------
// What he says when these hurt him, and the death screen when they kill him

export const HURT_THRUSTER = ['MY ASS IS ON FIRE!', 'WHO SIGNED OFF ON A REAL ROCKET?!', 'WHO PUTS REAL FUEL IN A PROP?!'];
export const DEATH_THRUSTER = ['LAUNCHED', 'T-MINUS DEAD', 'SCRUBBED'];
export const HURT_METEOR = ['A METEOR! INDOORS!', "THAT'S NOT FOAM, THAT'S CONCRETE!", 'RIGHT IN THE DENTAL PLAN!'];
export const DEATH_METEOR = ['EXTINCTION EVENT', 'HIT BY A PROP METEOR', 'DINOSAURED'];
export const HURT_AIRLOCK = ['MY SPINE!', 'THE DOOR! THE DOOR!', 'WHO MAKES A DOOR THAT FAST?!'];
export const DEATH_AIRLOCK = ['FLATTENED BY AN AIRLOCK', 'CYCLED', 'PANCAKED IN SPACE (INDOORS)'];
export const HURT_LASER = ['IT BURNED MY SHIN!', 'THEY SPENT THE BUDGET ON A REAL LASER?!', 'I SMELL MY OWN HAIR!'];
export const DEATH_LASER = ['LASER SHOWED', 'CAUTERIZED', 'SLICED BY THE LIGHT SHOW'];
export const HURT_FLAG = ['ONE SMALL STEP, MY ASS!', "NEIL ARMSTRONG'S A DICK!", 'FIGHT ME ON THE MOON!'];
export const DEATH_FLAG = ['A GIANT LEAP', 'BEATEN BY FAKE NASA'];
export const HURT_FLAGPOLE = ['I CHARGED RIGHT INTO THE FLAG!', "THE FLAGPOLE'S GOT A SPIKE ON IT!", 'IT WENT UP MY ASS! FOR AMERICA!'];
export const DEATH_FLAGPOLE = ['FLAG PLANTED', 'CLAIMED FOR AMERICA', 'SKEWERED ON THE MOON'];
export const HURT_MARTIAN = ['HEADBUTTED BY A MARTIAN!', 'TAKE ME TO YOUR— OW!', 'MY TAINT! HE WENT FOR THE TAINT!'];
export const DEATH_MARTIAN = ['PROBED', 'RAMMED BY A MARTIAN'];
export const HURT_ANTENNAE = ['SPIKES ON THE ANTENNAE?!', 'MY FEET! THE SPIKY BALLS!', 'WHO PUTS SPIKES ON A MARTIAN?!'];
export const DEATH_ANTENNAE = ['ANTENNAED', 'SPIKED BY A MARTIAN', 'COSTUME DEPARTMENT KILL'];
export const HURT_RIGGER = ['GET OFF ME, YOU UNION HACK!', 'HE SMELLS LIKE GAFF TAPE!'];
export const DEATH_RIGGER = ['RIGGED', 'KILLED BY CARGO SHORTS'];
export const HURT_WRENCH = ['A WRENCH! IN THE FACE!', 'WHO THROWS A WRENCH?!', 'RIGHTY TIGHTY, ASSHOLE!'];
export const DEATH_WRENCH = ['WRENCHED', 'LEFTY LOOSEY', 'KILLED BY A TOOL'];

const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];
const each = (r: Record<Dressed, string>) => [r.clean, r.shitty, r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...MEATHEAD_CUTS, ...MEATHEAD_PARTY, MEATHEAD_WHICH,
    ...HURT_THRUSTER, ...HURT_METEOR, ...HURT_AIRLOCK, ...HURT_LASER, ...HURT_FLAG, ...HURT_FLAGPOLE, ...HURT_MARTIAN, ...HURT_ANTENNAE, ...HURT_RIGGER, ...HURT_WRENCH,
  ],
  death: [
    ...DEATH_THRUSTER, ...DEATH_METEOR, ...DEATH_AIRLOCK, ...DEATH_LASER, ...DEATH_FLAG, ...DEATH_FLAGPOLE, ...DEATH_MARTIAN, ...DEATH_ANTENNAE, ...DEATH_RIGGER, ...DEATH_WRENCH,
  ],
  'm2.space.hand': [...all(HAND_COWERS), ...all(CAST_BARKS)],
  'm2.space.handf': [...all(HAND_COWERS), ...all(CAST_BARKS)],
  'm2.guest': [...all(QUEUE_BARKS), ...all(GUEST_THROWN), GUEST_FLEES],
  'm2.guest2': [...all(QUEUE_BARKS), ...all(GUEST_THROWN), GUEST_FLEES],
  'm2.space.op': [...each(OP_GREET), ...each(OP_PROTEST), OP_DONT, OP_AFTER],
};
