// Every line said in real hell, by voice id (the voice pack records these: spooky/voices.ts gathers them;
// tools/voices/m2pack.ts and extract.ts take them from there). Meathead's lines go under 'meathead', the death screen's
// under 'death', the demon's under 'm2.demon', Satan's under 'm2.satan'. The clean / shitty / naked pools are all the
// same size wherever lines react to how he is.

export type Dressed = 'clean' | 'shitty' | 'nude';
export type ByPants = Record<Dressed, readonly string[]>;
const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Down the pit from the top of the clock tower: landing in the wreck. */
export const MH_LANDED = ['OW. I LANDED ON A GUY.', 'SOFT LANDING. SORRY, BUDDY.', "WELL. THAT'S NOT THE GIFT SHOP."];
/** ...and a look at what's left of the riders. */
export const MH_BODIES = ["THAT RIDE'S GETTING ONE STAR.", "THAT GUY'S IN SIX PLACES.", "SOMEBODY'S GONNA HAVE TO MOP THAT. NOT ME."];
/** The first lava. */
export const MH_LAVA = ["OKAY. THAT'S REAL LAVA.", 'WHY IS THE HELL RIDE ACTUALLY HELL?', 'THEY BLEW THE WHOLE BUDGET ON THIS PART.'];
/** Another car down the shaft (the ride's still boarding). */
export const MH_CAR = ["THEY KEEP SENDING 'EM DOWN!", 'WHO IS STILL GETTING ON THAT THING?!', 'SHUT THE RIDE DOWN, YOU IDIOTS!'];
/** Walking in on the demon at his lunch. */
export const MH_DEMON = ['HEY, TUBBY. PUT DOWN THE GHOST.', "HE'S EATING A GUY LIKE A HOT DOG.", "THAT'S THE FATTEST DEVIL I EVER SAW."];
/** The demon storming off to his dad. */
export const MH_LEAVES = ['DID HE JUST CALL HIS DAD?', 'YEAH! RUN TO DADDY, FAT ASS!', "THE DEVIL'S KID TATTLED ON ME."];
/** Satan coming up out of the lava. */
export const MH_SATAN = ['OH. HI.', "...THAT'S HIS DAD.", "OH SHIT. THAT'S A LOT OF DEVIL."];
/** The ground going hot under his feet. */
export const MH_LAUNCH = ["WAIT, WHAT'S IT DOING-", "IT'S GETTING REAL HOT UNDER MY-", 'OH, COME ON-'];

// What he says when these hurt him (the death screen's when they kill him).
export const HURT_LAVA = ['HOT FOOT! HOT FOOT!', 'MY TOES ARE COOKING!', "I'M SEARED! I'M A STEAK!"];
export const DEATH_LAVA = ['WELL DONE', 'DIPPED IN HELL', 'SOUP OF THE DAMNED'];
export const HURT_JET = ['THE FLOOR FARTED FIRE AT ME!', 'MY EYEBROWS!', 'FIRE UP THE ASS! FIRE UP THE ASS!'];
export const DEATH_JET = ['FLAME-BROILED', 'VENTED', 'ROASTED FROM BELOW'];
export const HURT_CAR = ['AN ELEVATOR FELL ON ME!', "WHO'S STILL RIDING THIS THING?!", 'THE RIDE LANDED ON MY HEAD!'];
export const DEATH_CAR = ['GOING DOWN', 'MIND THE DOORS', 'ELEVATED TO HELL'];
export const HURT_IMP = ['THE LITTLE RED FUCKER BIT MY ANKLE!', 'GET OFF ME, YOU DEVIL GREMLIN!', "IT'S A CHIHUAHUA FROM HELL!"];
export const DEATH_IMP = ['NIBBLED BY AN IMP', 'ANKLE-BITTEN', 'DEATH BY TINY DEVILS'];
export const HURT_IMP_FIRE = ['IT THREW FIRE AT ME! LITTLE PRICK!', 'FIREBALL! TO THE FACE!', 'QUIT LOBBING THAT SHIT!'];
export const DEATH_IMP_FIRE = ['FIREBALLED', 'LOBBED TO DEATH', 'TOASTED BY A TODDLER DEVIL'];
export const HURT_HOUND = ['BAD DOG! BAD FLAMING DOG!', "IT BIT ME AND IT'S ON FIRE!", "WHO'S A GOOD BOY?! NOT YOU, ASSHOLE!"];
export const DEATH_HOUND = ['CHEW TOY OF THE DAMNED', 'HOUNDED', 'DOG FOOD'];
export const HURT_BAT = ['FLAMING BAT ON MY HEAD!', 'GET OUT OF MY FACE, YOU FLYING RAT!', 'IT SET MY HEAD ON FIRE!'];
export const DEATH_BAT = ['BAT OUT OF HELL', 'TORCHED BY A BAT', 'BATTERED'];
export const HURT_GOAT = ['THE DEVIL GOAT!', 'IT HEADBUTTED MY KIDNEYS!', 'MEANEST GOAT ALIVE!'];
export const DEATH_GOAT = ['GOATED', 'BUTTED TO DEATH', 'BAAAAD END'];
/** Shoulder charged into a hell goat's horns. */
export const HURT_HORNS = ['I CHARGED INTO THE HORNS!', 'SHOULDER, MEET HORN! OW!', 'WHY DID I RAM THE POINTY GOAT?!'];
export const DEATH_HORNS = ['RAMMED THE WRONG GOAT', 'HORNED', 'SHISH-KA-GOAT'];
/** The demon's pitchfork (the thrust, the overhead slam, the sweep). */
export const HURT_FORK = ['HE FORKED ME!', 'THREE NEW HOLES!', 'GET THAT FORK OUT OF MY ASS!', "I'M NOT A POT ROAST, FAT ASS!"];
export const DEATH_FORK = ['FORKED', 'DONE. STICK A FORK IN HIM.', 'SERVED ON A PITCHFORK'];
/** The demon's quakes (his landings). */
export const HURT_QUAKE = ['THE FLOOR HIT MY KNEES!', 'WHOA WHOA WHOA!', 'HE SHOOK MY FILLINGS LOOSE!'];
export const DEATH_QUAKE = ['RATTLED TO DEATH', 'SEISMIC', 'HE STUCK THE LANDING'];
/** The demon's gut: landed on, or just walked into. */
/** Charged him, bounced off all that gut, and back into the wall of fire. */
export const HURT_BOUNCE_FIRE = ['BOUNCED OFF HIS GUT INTO THE FIRE!', 'HE BOINGED ME INTO THE FIRE!', 'WHY IS HE SO BOUNCY?!'];
export const DEATH_BOUNCE_FIRE = ['REBOUNDED INTO HELLFIRE', 'BELLY BOUNCED AND BARBECUED', 'PINBALLED'];
/** Bumped into him while he's up in the air on a jump. */
export const HURT_AIRBODY = ['HE BODY-CHECKED ME IN MID-AIR!', "IT'S RAINING FAT DEVIL!", 'HIS GUT HIT ME LIKE A WRECKING BALL!'];
export const DEATH_AIRBODY = ['SWATTED OUT OF THE AIR BY A GUT', 'AIRBALLED', 'GUT CHECK FAILED'];
export const HURT_BELLY = ['HE LANDED ON ME! WITH HIS GUT!', "I'M UNDER THE BELLY!", "IT'S SO SWEATY UNDER HERE!"];
export const DEATH_BELLY = ['BELLY-FLOPPED', 'CRUSHED BY A FAT DEVIL', 'SMOTHERED BY GUT'];

// ---------------------------------------------------------------------------------------------------------------
// The demon (BLOATHAZAR, Satan's boy): a big fat tanky lump who'd rather be eating souls than fighting anybody. Bored,
// lazy, complaining. Every group three ways, by the state of Meathead's pants.

export const DEMON_NAME = 'BLOATHAZAR';

/** Walking in on him at his lunch (a soul in his fist like a hot dog). */
export const DEMON_INTRO: ByPants = {
  clean: ["UGH. A MORTAL. I'M ON MY LUNCH BREAK.", "I'M EATING, ASSHOLE. THIS GUY WAS A TAX ATTORNEY. HE'S STILL WARM.", 'DAD SAID DEAL WITH IT. FINE. HOLD MY SOUL.'],
  shitty: ['UGH. A MORTAL. HE SMELLS WORSE THAN THE SULFUR.', "I'M EATING, ASSHOLE. AND YOU SHIT YOURSELF. THERE GOES MY APPETITE.", "DAD SAID DEAL WITH IT. HE DIDN'T SAY IT'D BE SOGGY."],
  nude: ['UGH. A NAKED MORTAL. I WAS EATING.', 'EVEN THE DAMNED GET PANTS, DUMBASS.', "DAD SAID DEAL WITH IT. HE DIDN'T SAY I'D HAVE TO LOOK AT IT."],
};
/** Grumbling through the fight. */
export const DEMON_CHATTER: ByPants = {
  clean: ["HURRY UP. MY SOUL'S GETTING COLD.", "I'M NOT SUPPOSED TO DO CARDIO.", "HOLD STILL. I DON'T WANT TO STAND UP AGAIN."],
  shitty: ["QUIT RUNNING AROUND. YOU'RE SPREADING IT.", "I LIVE IN A LAKE OF FIRE AND YOU'RE THE WORST THING I SMELLED ALL DAY.", "WE GOT A WHOLE CIRCLE FOR GUYS LIKE YOU. IT'S THE TOILET ONE."],
  nude: ['PUT IT AWAY. PUT ALL OF IT AWAY.', 'EVERY TIME YOU JUMP, IT FLOPS.', "I'VE SEEN THE NINTH CIRCLE. THIS IS WORSE."],
};
/** He's got him with the fork (or his gut). */
export const DEMON_HIT: ByPants = {
  clean: ['THERE. NOW DIE SO I CAN FINISH LUNCH.', 'SHISH KEBAB.', 'GOT YA. CAN I GO NOW?'],
  shitty: ["UGH. IT'S ON THE FORK.", 'GOT YA. NOW I GOTTA HOSE THIS OFF.', 'SKEWERED. AND SOILED. GREAT.'],
  nude: ["UGH. I POKED SOMETHING I SHOULDN'T HAVE.", "GOT YA. I'M BURNING THIS FORK.", 'THAT ONE WAS FOR MAKING ME LOOK.'],
};
/** Hurt enough to sit down a moment (his stagger). */
export const DEMON_HURT: ByPants = {
  clean: ['OW! WHAT IS WRONG WITH YOU?!', 'HEY! I BRUISE LIKE A PEACH!', "OW! I'M TELLING MY DAD!"],
  shitty: ["OW! IT'S ON MY BELLY NOW!", "DON'T TOUCH ME WITH THOSE PANTS!", 'YOU GOT SHIT IN MY BELLY BUTTON!'],
  nude: ["DON'T RUB ON ME! DON'T RUB ON ME!", 'SOMETHING DANGLY TOUCHED ME!', 'YOUR SKIN WAS ON MY SKIN!'],
};
/** Beaten: off to his dad (he doesn't die, he leaves). */
export const DEMON_BEATEN: ByPants = {
  clean: ['FUCK THIS. DAAAAAD! THIS MORTAL IS HURTING ME!', 'FUCK THIS. I QUIT. DAAAAAD! THIS MORTAL IS HURTING ME!'],
  shitty: ['FUCK THIS. DAAAAAD! THIS MORTAL IS HURTING ME! AND HE SHAT HIMSELF!', 'FUCK THIS. DAAAAAD! THIS MORTAL IS HURTING ME AND HE STINKS!'],
  nude: ["FUCK THIS. DAAAAAD! THIS MORTAL IS HURTING ME! AND HE'S NAKED!", 'FUCK THIS. DAAAAAD! A NAKED MORTAL IS HURTING ME!'],
};

// ---------------------------------------------------------------------------------------------------------------
// Satan: up out of the lava after his boy's gone crying to him. The core line's always the same; what follows it is
// by the state of Meathead's pants.

export const SATAN_CORE = 'MEATHEAD. ONE OF THESE DAYS YOUR SOUL WILL BE MINE FOREVER. THAT TIME IS NOT NOW.';
export const SATAN_PARTING: ByPants = {
  clean: ['NOW GET OUT OF MY HOUSE.', 'AND STOP HITTING MY SON. HE IS SENSITIVE.'],
  shitty: ['AND YOU SHAT IN MY HOUSE. GET OUT.', 'EVEN HELL HAS STANDARDS. GO WASH.'],
  nude: ['AND PUT SOMETHING ON. EVEN I HAVE LIMITS.', 'I HAVE SEEN EVERY SIN THERE IS. COVER THAT ONE.'],
};

/** Meathead, a while into the demon fight without having tripped him yet: thinking out loud, plainer each time (said in
 *  order; never once he's tripped him). */
export const MH_TRIP_HINT = [
  "WHAT IS HOLDING THAT GUY UP? THOSE LEGS ARE TINY.",
  "ALL GUT, NO ANKLES. ONE GOOD KICK DOWN THERE AND HE'S GOING OVER.",
  "BIG GUY, LITTLE LEGS. SLIDE INTO 'EM. TAKE OUT THE LEGS.",
];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...MH_LANDED, ...MH_BODIES, ...MH_LAVA, ...MH_CAR, ...MH_DEMON, ...MH_TRIP_HINT, ...MH_LEAVES, ...MH_SATAN, ...MH_LAUNCH,
    ...HURT_LAVA, ...HURT_JET, ...HURT_CAR, ...HURT_IMP, ...HURT_IMP_FIRE, ...HURT_HOUND, ...HURT_BAT, ...HURT_GOAT, ...HURT_HORNS,
    ...HURT_FORK, ...HURT_QUAKE, ...HURT_BELLY, ...HURT_BOUNCE_FIRE, ...HURT_AIRBODY,
  ],
  death: [...DEATH_LAVA, ...DEATH_JET, ...DEATH_CAR, ...DEATH_IMP, ...DEATH_IMP_FIRE, ...DEATH_HOUND, ...DEATH_BAT, ...DEATH_GOAT, ...DEATH_HORNS, ...DEATH_FORK, ...DEATH_QUAKE, ...DEATH_BELLY, ...DEATH_BOUNCE_FIRE, ...DEATH_AIRBODY],
  'm2.demon': [...all(DEMON_INTRO), ...all(DEMON_CHATTER), ...all(DEMON_HIT), ...all(DEMON_HURT), ...all(DEMON_BEATEN)],
  'm2.satan': [SATAN_CORE, ...all(SATAN_PARTING)],
};
