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
export const MH_LANDED = ['OW. I LANDED ON SOMEBODY.', "THAT WAS A LONG WAY DOWN. HUH. IT'S WARM DOWN HERE.", "WELL. THAT'S NOT THE GIFT SHOP."];
/** ...and a look at what's left of the riders. */
export const MH_BODIES = ["WELL, THAT RIDE'S GETTING A BAD REVIEW.", "THAT GUY'S IN SIX PLACES.", "SOMEBODY'S GONNA HAVE TO CLEAN THAT UP. NOT ME."];
/** The first lava. */
export const MH_LAVA = ["OKAY. THAT'S REAL LAVA. THAT IS NOT A FOG MACHINE.", 'WHY IS THE HELL RIDE ACTUALLY HELL?', 'THEY SPENT THE WHOLE BUDGET ON THIS PART.'];
/** Another car down the shaft (the ride's still boarding). */
export const MH_CAR = ['THEY KEEP SENDING THEM DOWN!', 'NOBODY UP THERE IS READING THE REVIEWS.', 'WHO IS STILL GETTING ON THAT THING?!'];
/** Walking in on the demon at his lunch. */
export const MH_DEMON = ["BIG GUY. HE'S EATING A GHOST.", "THAT'S THE FATTEST DEVIL I EVER SAW.", 'HEY, TUBBY. PUT DOWN THE GHOST.'];
/** The demon storming off to his dad. */
export const MH_LEAVES = ['DID HE JUST CALL HIS DAD?', 'YEAH! RUN TO DADDY!', "HE TATTLED. THE DEVIL'S KID TATTLED ON ME."];
/** Satan coming up out of the lava. */
export const MH_SATAN = ['OH. HI.', "...THAT'S HIS DAD.", "OKAY. THAT'S A LOT OF DEVIL."];
/** The ground going hot under his feet. */
export const MH_LAUNCH = ["WAIT, WHAT'S IT DOING-", "IT'S GETTING REAL HOT UNDER MY-", 'OH, COME ON-'];

// What he says when these hurt him (the death screen's when they kill him).
export const HURT_LAVA = ["HOT FOOT! HOT FOOT! IT'S REAL LAVA!", 'MY TOES! MY TOES ARE COOKING!', 'WHO PUTS REAL LAVA IN HELL?! ...OH. HELL DOES.', "I'M SEARED! I'M A STEAK!"];
export const DEATH_LAVA = ['WELL DONE', 'DIPPED IN HELL', 'SOUP OF THE DAMNED'];
export const HURT_JET = ['THE FLOOR FARTED FIRE AT ME!', 'MY EYEBROWS! WHERE ARE MY EYEBROWS?!', 'FIRE UP THE BUTT! FIRE UP THE BUTT!'];
export const DEATH_JET = ['FLAME-BROILED', 'VENTED', 'ROASTED FROM BELOW'];
export const HURT_CAR = ['AN ELEVATOR FELL ON ME!', "WHO'S STILL RIDING THIS THING?!", 'THE RIDE FELL ON MY HEAD!'];
export const DEATH_CAR = ['GOING DOWN', 'MIND THE DOORS', 'ELEVATED TO HELL'];
export const HURT_IMP = ['THE LITTLE RED GUY BIT MY ANKLE!', 'GET OFF ME, YOU DEVIL GREMLIN!', "IT'S LIKE A CHIHUAHUA FROM HELL!"];
export const DEATH_IMP = ['NIBBLED BY AN IMP', 'IMPOSSIBLE', 'DEATH BY A THOUSAND LITTLE DEVILS'];
export const HURT_IMP_FIRE = ['IT THREW FIRE AT ME! LITTLE PRICK!', 'FIREBALL! TO THE FACE!', 'QUIT LOBBING THAT SHIT!'];
export const DEATH_IMP_FIRE = ['FIREBALLED', 'LOBBED TO DEATH', 'TOASTED BY A TODDLER DEVIL'];
export const HURT_HOUND = ['BAD DOG! BAD FLAMING DOG!', "IT BIT ME AND IT'S ON FIRE!", "WHO'S A GOOD BOY?! NOT YOU!"];
export const DEATH_HOUND = ['CHEW TOY OF THE DAMNED', 'HOUNDED', 'DOG FOOD'];
export const HURT_BAT = ['BATS! ON FIRE! IN MY HAIR!', 'GET OUT OF MY FACE, YOU FLAMING RAT!', 'IT SET MY HEAD ON FIRE!'];
export const DEATH_BAT = ['BAT OUT OF HELL', 'FLAMBEED BY A BAT', 'BATTERED'];
export const HURT_GOAT = ['THE GOAT! THE DEVIL GOAT!', 'IT HEADBUTTED MY KIDNEYS!', "THAT'S THE MEANEST GOAT ALIVE!"];
export const DEATH_GOAT = ['GOATED', 'BUTTED TO DEATH', 'BAAAAD END'];
/** Shoulder charged into a hell goat's horns. */
export const HURT_HORNS = ['I CHARGED INTO THE HORNS! THE HORNS!', 'SHOULDER, MEET HORN! OW!', 'WHY DID I RAM THE POINTY GOAT?!'];
export const DEATH_HORNS = ['RAMMED THE WRONG GOAT', 'HORNED', 'SHISH-KA-GOAT'];
/** The demon's pitchfork (the thrust, the overhead slam, the sweep). */
export const HURT_FORK = ["HE FORKED ME! I'VE BEEN FORKED!", "THAT'S THREE HOLES! THREE NEW HOLES!", 'GET THAT FORK OUT OF MY ASS!', "I'M NOT A POT ROAST!"];
export const DEATH_FORK = ['FORKED', 'DONE. STICK A FORK IN HIM.', 'SERVED ON A PITCHFORK'];
/** The demon's quakes (his landings). */
export const HURT_QUAKE = ['MY KNEES! THE FLOOR HIT MY KNEES!', 'WHOA WHOA WHOA! THE GROUND!', 'HE SHOOK MY FILLINGS LOOSE!'];
export const DEATH_QUAKE = ['SHAKEN, NOT STIRRED', 'RATTLED TO DEATH', 'SEISMIC'];
/** The demon's gut: landed on, or just walked into. */
/** Charged him, bounced off all that gut, and back into the wall of fire. */
export const HURT_BOUNCE_FIRE = ['BOUNCED OFF THE FAT ONE INTO THE FIRE!', 'HE BOINGED ME INTO THE FIRE!', "WHY IS HE SO BOUNCY?! WHY IS THE WALL ON FIRE?!"];
export const DEATH_BOUNCE_FIRE = ['REBOUNDED INTO HELLFIRE', 'BELLY BOUNCED AND BARBECUED', 'PINBALLED'];
export const HURT_BELLY = ['HE LANDED ON ME! WITH HIS GUT!', "I'M UNDER THE BELLY! I'M UNDER THE BELLY!", "IT'S SWEATY UNDER HERE!"];
export const DEATH_BELLY = ['BELLY-FLOPPED', 'CRUSHED BY A FAT DEVIL', 'SMOTHERED'];

// ---------------------------------------------------------------------------------------------------------------
// The demon (BLOATHAZAR, Satan's boy): a big fat tanky lump who'd rather be eating souls than fighting anybody. Bored,
// lazy, complaining. Every group three ways, by the state of Meathead's pants.

export const DEMON_NAME = 'BLOATHAZAR';

/** Walking in on him at his lunch (a soul in his fist like a hot dog). */
export const DEMON_INTRO: ByPants = {
  clean: [
    "UGH. A MORTAL. I'M ON MY LUNCH BREAK. I'VE BEEN ON MY LUNCH BREAK FOR SIX HUNDRED YEARS.",
    "OH, GREAT. ANOTHER ONE. CAN'T YOU SEE I'M EATING? THIS SOUL WAS A TAX ATTORNEY. HE'S STILL WARM.",
    "DAD SAID IF ANYBODY CAME DOWN HERE I HAD TO 'DEAL WITH IT.' FINE. HOLD MY SOUL.",
  ],
  shitty: [
    "UGH. A MORTAL. AND HE SMELLS WORSE THAN THE SULFUR. I'M TRYING TO EAT HERE.",
    'OH, GREAT. YOU BROUGHT YOUR OWN BRIMSTONE. IN YOUR PANTS. I WAS HAVING A NICE LUNCH.',
    "DAD SAID TO DEAL WITH INTRUDERS. HE DIDN'T SAY THEY'D BE SOGGY. HOLD MY SOUL.",
  ],
  nude: [
    "UGH. A NAKED MORTAL. I WAS EATING. I'M NOT ANYMORE.",
    'OH, GREAT. YOU CAME ALL THE WAY DOWN TO HELL WITH NO PANTS? EVEN THE DAMNED GET PANTS.',
    "DAD SAID TO DEAL WITH INTRUDERS. HE DIDN'T SAY I'D HAVE TO LOOK AT THEM. HOLD MY SOUL.",
  ],
};
/** Grumbling through the fight. */
export const DEMON_CHATTER: ByPants = {
  clean: [
    "CAN WE MAKE THIS QUICK? MY SOUL'S GETTING COLD.",
    "YOU KNOW HOW MANY CALORIES THIS IS? I'M NOT SUPPOSED TO DO CARDIO.",
    "I COULD BE TORMENTING A LAWYER RIGHT NOW. INSTEAD I'M DOING THIS.",
    "HOLD STILL. I DON'T WANT TO STAND UP AGAIN.",
  ],
  shitty: [
    "QUIT RUNNING AROUND. YOU'RE SPREADING IT.",
    "I LIVE IN A LAKE OF FIRE AND YOU'RE THE WORST THING I'VE SMELLED ALL DAY.",
    "I'M NOT STABBING THAT. THE FORK'LL NEVER BE CLEAN AGAIN. ...FINE. I'M STABBING IT.",
    "YOU KNOW WE HAVE A WHOLE CIRCLE FOR PEOPLE LIKE YOU? IT'S THE SEWER ONE.",
  ],
  nude: [
    'PUT IT AWAY. PUT ALL OF IT AWAY.',
    "EVERY TIME YOU JUMP, IT FLOPS. I SEE IT. I CAN'T UNSEE IT.",
    "I'VE SEEN THE NINTH CIRCLE. THIS IS WORSE.",
    "I'M GONNA NEED A NEW PITCHFORK AFTER THIS. AND NEW EYES.",
  ],
};
/** He's got him with the fork (or his gut). */
export const DEMON_HIT: ByPants = {
  clean: ['THERE. NOW LIE DOWN AND DIE SO I CAN FINISH MY LUNCH.', "SHISH KEBAB. DAD WOULD BE SO PROUD. HE WON'T BE. BUT HE WOULD.", 'GOT YA. CAN I GO NOW?'],
  shitty: ["UGH. IT'S ON THE FORK. IT'S ON THE FORK!", 'GOT YA. AND NOW I HAVE TO HOSE THIS OFF.', 'SKEWERED. AND SOILED. GREAT.'],
  nude: ["UGH. I POKED SOMETHING I SHOULDN'T HAVE.", "GOT YA. I'M BURNING THIS FORK.", 'THAT ONE WAS FOR MAKING ME LOOK AT YOU.'],
};
/** Hurt enough to sit down a moment (his stagger). */
export const DEMON_HURT: ByPants = {
  clean: ['OW! WHAT IS WRONG WITH YOU?!', 'HEY! I BRUISE LIKE A PEACH!', 'STOP THAT! I HAVE A NOTE FROM MY DAD!'],
  shitty: ["OW! AND NOW IT'S ON ME! IT'S ON MY BELLY!", "DON'T TOUCH ME WITH THOSE PANTS!", 'YOU GOT IT IN MY BELLY BUTTON!'],
  nude: ["OW! DON'T RUB ON ME! DON'T RUB ON ME!", 'SOMETHING TOUCHED ME! SOMETHING DANGLY!', 'THAT WAS SKIN! YOUR SKIN WAS ON MY SKIN!'],
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
  shitty: ['AND YOU HAVE SOILED MY LAVA. GET OUT.', 'EVEN HELL HAS STANDARDS. GO WASH.'],
  nude: ['AND PUT SOMETHING ON. EVEN I HAVE LIMITS.', 'I HAVE SEEN EVERY SIN THERE IS. COVER THAT ONE.'],
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...MH_LANDED, ...MH_BODIES, ...MH_LAVA, ...MH_CAR, ...MH_DEMON, ...MH_LEAVES, ...MH_SATAN, ...MH_LAUNCH,
    ...HURT_LAVA, ...HURT_JET, ...HURT_CAR, ...HURT_IMP, ...HURT_IMP_FIRE, ...HURT_HOUND, ...HURT_BAT, ...HURT_GOAT, ...HURT_HORNS,
    ...HURT_FORK, ...HURT_QUAKE, ...HURT_BELLY, ...HURT_BOUNCE_FIRE,
  ],
  death: [...DEATH_LAVA, ...DEATH_JET, ...DEATH_CAR, ...DEATH_IMP, ...DEATH_IMP_FIRE, ...DEATH_HOUND, ...DEATH_BAT, ...DEATH_GOAT, ...DEATH_HORNS, ...DEATH_FORK, ...DEATH_QUAKE, ...DEATH_BELLY, ...DEATH_BOUNCE_FIRE],
  'm2.demon': [...all(DEMON_INTRO), ...all(DEMON_CHATTER), ...all(DEMON_HIT), ...all(DEMON_HURT), ...all(DEMON_BEATEN)],
  'm2.satan': [SATAN_CORE, ...all(SATAN_PARTING)],
};
