// What's said in HELICOPTER HARRY's arena, by voice: Harry (the land's boss: the hippie act long gone, a jacked,
// bandana'd, swearing xenophobe; NO slurs), Meathead (sparse, blunt), and every way the fight can hurt or kill him.
// Harry gets clean / shitty / naked pools for every line group, intro to death (the state of HIM: Meathead's pants).
// The Statue of Liberty never talks (stone: she rumbles, gags, sobs). Pure data (tools/voices bundles it in node).
// American spelling. Picked through heli/talk.ts harryPick: never a line twice in one life (and the 45 s rule).

import { pavilionVoices, allOf, type ByPants, type HurtTable } from '../talk';
import { HARRY } from '../heli/lines';

export { HARRY };
export type { ByPants };

// ---------------------------------------------------------------------------------------------------------------
// The intro: down on his jetpack, queasy (the weakness, planted), the uniform ripped off, the rant, her

/** Down off the jetpack, green: where are his pills (the plague crossbow's way in). */
export const HARRY_QUEASY: ByPants = {
  clean: ["UGH. JETPACKS. WHERE THE HELL ARE MY AIRSICK PILLS? ...SCREW IT.", "WHOO. MY STOMACH. I LEFT MY DAMN AIRSICK PILLS IN THE HELICOPTER. THE ONE YOU STOLE."],
  shitty: ["UGH. I'M AIRSICK AND YOU SMELL LIKE THAT. WHERE ARE MY DAMN PILLS?", "DON'T COME ANY CLOSER. I'M AIRSICK, I LOST MY PILLS, AND YOU SHIT YOURSELF."],
  nude: ["UGH. AIRSICK. NO PILLS. AND NOW I'M LOOKING AT THAT. GREAT.", "MY STOMACH'S FLIPPING. PUT THAT AWAY BEFORE I LOSE IT."],
};
/** Before he rips the uniform off. */
export const HARRY_RIP: ByPants = {
  clean: ['YOU WANNA MEET THE REAL HARRY? HERE HE IS, YOU SON OF A BITCH!', 'TWENTY-TWO YEARS IN TIE-DYE. NO MORE!'],
  shitty: ['YOU WANNA SEE WHAT A REAL MAN LOOKS LIKE? NOT SHITTY PANTS OVER HERE. THIS!', "TIME TO SHOW YOU A REAL AMERICAN. ONE THAT DOESN'T SHIT HIMSELF."],
  nude: ["YOU'RE NOT THE ONLY ONE WHO CAN TAKE HIS SHIRT OFF! JUST THE SHIRT, THOUGH!", "OH, YOU LIKE BEING NAKED? I'LL SHOW YOU A BODY WORTH LOOKING AT!"],
};
/** Ripped: Meathead's impressed (any state). */
export const MH_IMPRESSED = ['...DAMN.', "OKAY. THAT'S KIND OF BADASS.", 'HOLY SHIT. THE HIPPIE GOT JACKED.'];
/** The rant: the act's gone all the way (trimmed: the user, "shorten harry's lecture at the start of the fight"). */
export const HARRY_RANT: ByPants = {
  clean: [
    'TWENTY-TWO YEARS OF NAMASTE! I HATE SOCCER, I HATE THE METRIC SYSTEM, AND I HATE YOU, MOTHERFUCKER! DAMN FOREIGNERS!',
    'THEY SHOULD BUILD A WALL AROUND THE WALL! AND PUT YOU ON THE OTHER SIDE, YOU COCKSUCKER!',
  ],
  shitty: [
    'TWENTY-TWO YEARS OF SMILING AT FOREIGNERS, AND NOW A SHIT-PANTS STEALS MY HELICOPTER! DAMN FOREIGNERS!',
    'AT LEAST IT IS AMERICAN SHIT, YOU STINKING BASTARD! NOT LIKE THOSE DAMN FOREIGNERS!',
  ],
  nude: [
    'NAKED? WHAT ARE YOU, EUROPEAN? DAMN FOREIGNERS AND THEIR NUDE BEACHES, YOU PERVERT!',
    'TWENTY-TWO YEARS OF HUGGING FOREIGNERS AND A NAKED JACKASS STEALS MY HELICOPTER! DAMN EVERYBODY!',
  ],
};
/** The user's line, verbatim (said whatever state he's in). */
export const MH_ABACK = 'I LIKED YOU BETTER WHEN YOU WERE A PUSSY HIPPIE, AND THAT VERSION OF YOU REALLY SUCKED.';
/** Calling her up out of the dig (short). */
export const HARRY_SUMMON: ByPants = {
  clean: ['LADY! GET YOUR GREEN ASS UP HERE!', 'LADY LIBERTY! UP, YOU BIG GREEN BITCH! WORK!'],
  shitty: ['LADY! UP! STOMP THIS STINKY BASTARD!', 'LADY LIBERTY! UP! A SHIT-PANTS NEEDS FREEDOM-ING!'],
  nude: ['LADY! UP! THERE IS A NAKED JACKASS IN YOUR CONSTRUCTION SITE!', 'LADY! UP! AND DO NOT LOOK DOWN THERE!'],
};
/** The user's words, verbatim: once she's up. */
export const HARRY_MONUMENT = 'A REAL AMERICAN MONUMENT.';

// ---------------------------------------------------------------------------------------------------------------
// The fight (pools sized for a long life: he never says a line twice in one; the clean ones go to every state)

export const HARRY_TAUNT: ByPants = {
  clean: [
    'COME ON, YOU HELICOPTER-STEALING SON OF A BITCH!', "WHERE'S YOUR PASSPORT? YOU DON'T NEED ONE! YOU'RE DEAD!",
    "I'VE BEEN FAKING A SMILE SINCE NINETEEN NINETY-NINE! THIS IS REAL!", 'THIS IS FOR EVERY BAMBOO STRAW I HAD TO HAND OUT, COCKSUCKER!',
    'STAND STILL, SHIT-FOR-BRAINS!', 'I EAT GUYS LIKE YOU FOR BREAKFAST! WITH AMERICAN CHEESE!',
    'YOU FLY LIKE A FRENCHMAN AND YOU FIGHT LIKE ONE, JACKASS!', 'COME HERE, YOU SLIPPERY MOTHERFUCKER!',
    'I DID SIX THOUSAND TOURS! I CAN DO ONE MORE MURDER!', "YOU'RE NOTHING, YOU DOUCHEBAG! A LINE-CUTTING NOTHING!",
    'FREEDOM ISN\'T FREE! IT COSTS YOU YOUR LIFE, FUCKWIT!', 'I GOT ABS OF STEEL AND A HEART OF HATE, YOU BASTARD!',
  ],
  shitty: ['HOLD STILL, SHITTY PANTS!', 'YOU SMELL LIKE A FOREIGN BATHROOM!', 'I CAN SMELL YOU FROM UP HERE, YOU DIRTY BASTARD!', 'GET OVER HERE, YOU STINKING SUMBITCH!'],
  nude: ['PUT SOME PANTS ON! AMERICAN PANTS!', 'NAKED LIKE A FRENCHMAN!', 'STOP JIGGLING AT ME, YOU SICK BASTARD!', 'COVER THAT UP, YOU NAKED DIPSHIT!'],
};
/** Walking at him, the machine gun going. */
export const HARRY_FIRE: ByPants = {
  clean: [
    'EAT FREEDOM!', 'SAY HELLO TO MY LITTLE AMERICAN!', 'THIS IS HOW WE SAY HELLO IN AMERICA!', 'BRRRRRT, MOTHERFUCKER!',
    'DANCE, DIPSHIT!', 'LEAD SALAD, ASSHOLE!', 'JUMP, JACKASS! JUMP!', 'TASTE THE RED, WHITE AND BLUE!',
    'HERE COMES THE FOURTH OF JULY, COCKSUCKER!', 'BULLETS! THE ONLY THING I RECYCLE!',
  ],
  shitty: ['HOSE DOWN THE SHITTY ONE!', 'EAT LEAD, STINK BOMB!', "I'LL SHOOT THE SHIT RIGHT OUT OF YOU! OH. ALREADY OUT.", 'LEAD FOR THE STINKING BASTARD!'],
  nude: ['EAT LEAD, NUDIST!', 'NO SHIRT, NO SHOES, NO SURVIVING!', 'AIM FOR THE... NO. CENTER MASS. CENTER MASS!', 'DANCE, YOU NAKED DOUCHEBAG!'],
};
/** Up into her crown: the smash called. */
export const HARRY_CROWN: ByPants = {
  clean: [
    'LADY! SMASH HIM!', 'GET HIM, LADY! FIST OF FREEDOM!', 'HE IS RIGHT THERE! HIT HIM!', 'LADY! FLATTEN THAT SON OF A BITCH!',
    'PUNCH, YOU BIG GREEN BASTARD! PUNCH!', 'SMASH THE DIPSHIT, LADY!', 'LADY! RIGHT ON HIS STUPID HEAD!', 'FREEDOM FIST! NOW, DAMMIT!',
    // (to her like a lousy husband: the user's; it pays off her heartbreak when he's dead)
    "AND DON'T YOU LOOK AT ME LIKE THAT. SMASH HIM.", 'YOU NEVER LISTEN! THIS TIME LISTEN! HIT HIM!',
    'I GAVE YOU EVERYTHING. I GAVE YOU A TORCH. NOW HIT HIM!', "DON'T MAKE ME ASK TWICE, SWEETHEART. SMASH HIM.",
    "YOU'RE NOTHING WITHOUT ME, LADY. PROVE ME WRONG. HIT HIM!",
  ],
  shitty: ['LADY! SMASH THE STINKY ONE!', 'SQUASH HIM! LIKE THE TURD HE IS!', 'LADY! MASH THAT SHITTY COCKSUCKER!'],
  nude: ['LADY! SMASH THE NAKED ONE!', 'FLATTEN HIM, LADY! ALL OF HIM!', 'LADY! SQUASH THE NUDIST, JUST NOT THERE!'],
};
/** The stuck arm, and how pissed he is about it, angrier every time (each level its own pools; the last comes round
 *  every stuck arm after the second, so it's the biggest). The user's words, verbatim, in the first two. */
export const HARRY_STUCK: ByPants[] = [
  {
    clean: ["YOU'RE USELESS NOW.", "SHE'S STUCK. OF COURSE SHE'S STUCK. YOU'RE USELESS NOW.", "YOU'RE USELESS NOW. AND DON'T YOU LOOK AT ME LIKE THAT."],
    shitty: ["YOU'RE USELESS NOW. AND HE STILL STINKS.", "STUCK. YOU'RE USELESS NOW. HE'S RIGHT THERE STINKING."],
    nude: ["YOU'RE USELESS NOW. AND THE NAKED GUY IS LAUGHING.", "STUCK? YOU'RE USELESS NOW. LOOK AT HIM WIGGLING."],
  },
  {
    clean: ["SHE'S DUMB AT FIGHTING THINGS MUCH SMALLER THAN HER.", "AGAIN? SHE'S DUMB AT FIGHTING THINGS MUCH SMALLER THAN HER!", "SHE'S DUMB AT FIGHTING THINGS MUCH SMALLER THAN HER. LOOK AT WHAT YOU MADE ME SAY."],
    shitty: ["SHE'S DUMB AT FIGHTING THINGS MUCH SMALLER THAN HER. AND STINKIER.", "AGAIN! SHE'S DUMB AT FIGHTING THINGS MUCH SMALLER THAN HER! HE'S A TURD! HIT THE TURD!"],
    nude: ["SHE'S DUMB AT FIGHTING THINGS MUCH SMALLER THAN HER. AND NAKEDER.", "AGAIN! SHE'S DUMB AT FIGHTING THINGS MUCH SMALLER THAN HER! THERE'S A WHOLE NAKED GUY RIGHT THERE!"],
  },
  {
    clean: [
      "EVERY TIME! A HUNDRED AND FIFTY FEET TALL AND YOU CAN'T HIT ONE ASSHOLE!", 'MADE IN FRANCE. I SHOULD HAVE KNOWN. FRENCH PIECE OF SHIT!',
      "SHE'S DUMB AT FIGHTING THINGS MUCH SMALLER THAN HER, AND SHE'S DUMB AT EVERYTHING ELSE TOO!", 'STUCK AGAIN! YOU GREEN COPPER COCKSUCKER!',
      'UNBELIEVABLE! I GOT A STATUE WITH A BAD ARM AND A WORSE ATTITUDE!', 'PULL, YOU USELESS SUMBITCH! PULL!',
      "WHAT IS THIS, A HUG? DON'T HUG THE FLOOR, HIT THE MOTHERFUCKER!", 'I SHOULD HAVE ORDERED MOUNT RUSHMORE! FOUR HEADS! NO ARMS! STILL BETTER!',
      'SHIT! SHIT SHIT SHIT! A TORCH AND NO AIM!', 'YOU HAD ONE JOB, LADY! ONE! AND IT WAS STANDING THERE!',
      'TWO HUNDRED TONS OF DUMBASS!', 'IS IT THE ROCK? IS THE ROCK TOO HARD FOR YOU, PRINCESS?',
      // (the lousy husband)
      'LOOK AT WHAT YOU MADE ME DO.', 'WHY DO YOU ALWAYS EMBARRASS ME IN FRONT OF PEOPLE?', "I'M NOT MAD. I'M DISAPPOINTED.",
      "SAY YOU'RE SORRY. SAY IT.", 'YOU NEVER LISTEN. NEVER.', "YOU'RE NOTHING WITHOUT ME. NOTHING. A BIG GREEN NOTHING.",
      'I GAVE YOU EVERYTHING. I GAVE YOU A TORCH.', "DON'T YOU LOOK AT ME LIKE THAT.",
    ],
    shitty: ['HE SHIT HIMSELF AND YOU STILL MISSED! HOW?!', "FRENCH PIECE OF SHIT! YOU CAN'T EVEN HIT A GUY WHO SHIT HIMSELF!", 'FOLLOW THE SMELL, YOU BLIND BITCH! THE SMELL!'],
    nude: ["HE'S NAKED! THERE'S NOTHING IN THE WAY! HOW?!", 'FRENCH PIECE OF SHIT! YOU MISSED A NAKED MAN! A NAKED MAN!', 'AIM FOR THE PINK ONE, DUMBASS!'],
  },
];
/** She's up again. */
export const HARRY_UNSTUCK: ByPants = {
  clean: ['FINALLY. ONE MORE TIME. AND AIM THIS TIME!', 'SHE LIVES. GREAT. HERE WE GO AGAIN.', 'ABOUT DAMN TIME, YOU SLOW BITCH!', 'UP! GOOD! NOW DO SOMETHING USEFUL!', 'THERE SHE IS. MISS AMERICA. MISS EVERYTHING.', 'FREE? GREAT. NOW TRY HITTING HIM, DUMBASS!', "THERE. WAS THAT SO HARD? I'M NOT MAD. I'M DISAPPOINTED.", 'GOOD GIRL. NOW DO IT RIGHT FOR ONCE.'],
  shitty: ["FINALLY. NOW SQUASH THE STINKY ONE. AND AIM!", "SHE'S UP. TRY HITTING THE SMELL. IT'S EVERYWHERE."],
  nude: ['FINALLY. NOW AIM FOR THE NAKED ONE. HE STANDS OUT!', "SHE'S UP. HIT HIM. HE'S THE PINK ONE."],
};
/** Up a wall: across to the far wall and sweeping down (safe right under him). */
export const HARRY_CLING_DOWN: ByPants = {
  clean: ['WALL TO WALL FREEDOM!', "I'M GONNA MOW YOU DOWN LIKE A FOREIGN LAWN!", 'TOP TO BOTTOM, MOTHERFUCKER!', 'RAINING LEAD, DIPSHIT!', 'SWEEPING UP THE TRASH!', 'DOWN YOU GO, JACKASS!'],
  shitty: ['HOSING THE PLACE DOWN! IT NEEDS IT!', "I'LL MOW YOU DOWN, STINKY! TOP TO BOTTOM!"],
  nude: ["I'LL MOW YOU DOWN! NAKED TARGET PRACTICE!", 'WALL TO WALL! NOWHERE TO HIDE THAT!'],
};
/** Up a wall: straight down and sweeping up across the floor. */
export const HARRY_CLING_UP: ByPants = {
  clean: ['NOBODY HIDES UNDER ME, YOU SNEAKY BASTARD!', 'BOTTOM TO TOP! RUN, YOU SON OF A BITCH!', 'STRAIGHT DOWN, THEN STRAIGHT AT YOU!', 'UP THE FLOOR AND UP YOUR ASS!', 'RUN, COCKSUCKER! RUN!', 'NOWHERE TO GO, DOUCHEBAG!'],
  shitty: ['NOBODY HIDES UNDER ME! ESPECIALLY NOT SMELLING LIKE THAT!', 'BOTTOM TO TOP, STINKY! RUN!'],
  nude: ["DON'T STAND UNDER ME NAKED! NOBODY WANTS THAT VIEW!", 'BOTTOM TO TOP! RUN, NUDIE!'],
};
export const HARRY_HURT: ByPants = {
  clean: [
    'SON OF A BITCH!', 'THAT ALL YOU GOT?', 'OW! MY GOOD PEC!', 'I DID NAM! THE RESTAURANT! I CAN TAKE IT!', 'MOTHERFUCKER!',
    'OW! YOU DIPSHIT!', 'SHIT! THAT ONE STUNG!', 'YOU LITTLE BASTARD!', 'OW! MY TATTOO! MY PEACE SIGN!', 'COCKSUCKER! RIGHT IN THE ABS!',
    'SUMBITCH! THAT LEFT A MARK!', 'DAMMIT! I JUST GOT THESE JEANS BROKEN IN!', 'OW! FUCKWIT!', 'THAT TICKLED, ASSHOLE! NO IT DID NOT!',
  ],
  shitty: ['YOU GOT SHIT ON MY ABS!', 'OW! AND THE SMELL! THE SMELL!', 'OW! YOU STINKING SON OF A BITCH!'],
  nude: ["OW! DON'T TOUCH ME WITH THAT!", 'OW! SOMETHING SLAPPED ME! I HOPE IT WAS A HAND!', 'OW! THE NAKED BASTARD GOT ME!'],
};
/** Meathead's hurt (a bark). */
export const HARRY_GLOAT: ByPants = {
  clean: [
    'HA! THAT ONE WAS FOR SOCCER!', "HOW'D THAT FEEL? THAT'S AMERICAN!", 'GOT YOU, YOU HIJACKING SON OF A BITCH!', 'HA! BLEED, DIPSHIT!',
    'DOWN YOU GO, JACKASS!', 'THAT ONE WAS FOR THE HELICOPTER, COCKSUCKER!', 'HA! WHO CUTS THE LINE NOW?', 'TASTE THAT, SHIT-FOR-BRAINS!',
  ],
  shitty: ['HA! SHAKE THAT LOOSE!', 'GOT YOU! RIGHT IN THE SHITTY PANTS!'],
  nude: ['HA! RIGHT IN THE NAKED!', 'GOT YOU! STOP FLOPPING!'],
};
/** Under a quarter: once. */
export const HARRY_LOW: ByPants = {
  clean: ["I'M NOT DYING IN A CONSTRUCTION SITE! NOT TO YOU, YOU MOTHERFUCKER!", 'I CAN STILL TAKE YOU. I CAN STILL TAKE THE WHOLE WORLD!'],
  shitty: ["I'M NOT DYING TO A GUY WHO SHIT HIMSELF!", 'NOT LIKE THIS! NOT DOWNWIND OF YOU!'],
  nude: ["I'M NOT DYING TO A NAKED GUY! THAT'S A FOREIGN WAY TO DIE!", 'NOT LIKE THIS! NOT LOOKING AT THAT!'],
};
/** The plague crossbow: sick (the first time: no pills). */
export const HARRY_SICK_FIRST: ByPants = {
  clean: ['OH NO. OH NO NO NO. I FORGOT MY AIRSICK PILLS.', 'WHAT WAS ON THAT DART? WHERE ARE MY AIRSICK PILLS? OH SHIT.'],
  shitty: ['OH NO. NO PILLS, AND I CAN SMELL YOU. HERE IT COMES.', 'MY AIRSICK PILLS! I FORGOT THEM! AND YOU SMELL LIKE THAT!'],
  nude: ["OH NO. NO AIRSICK PILLS. AND I'M LOOKING RIGHT AT IT. HERE IT COMES.", 'MY PILLS! I FORGOT MY PILLS! STOP JIGGLING!'],
};
export const HARRY_SICK: ByPants = {
  clean: ['NOT AGAIN. NOT AGAIN!', 'OH SHIT. HERE IT COMES. LADY! DUCK!', "WHY DIDN'T I BRING THE PILLS?!", 'YOU SON OF A BITCH, NOT THE DARTS!', 'OH NO. MY BREAKFAST. MY AMERICAN BREAKFAST.', 'STOP SHOOTING ME WITH THAT SHIT, YOU BASTARD!', 'HERE COMES LUNCH, MOTHERFUCKER!'],
  shitty: ["NOT AGAIN! IT'S THE SMELL! IT'S THE SMELL TOO!", 'OH GOD. HIS SMELL. HERE IT COMES.'],
  nude: ['NOT AGAIN! STOP SHOWING ME THAT!', "OH GOD. HE'S NAKED AND I'M SPINNING. HERE IT COMES."],
};
/** Her concrete guts, all over him. */
export const HARRY_CONCRETED: ByPants = {
  clean: ["IT'S IN MY MOUTH! IT'S SETTING! IT'S SETTING!", 'YOU PUKED CONCRETE ON ME! ON ME!', "MY ABS! THEY'RE GRAY! THEY'RE SOLID!", 'YOU GREEN BITCH! ON MY BANDANA!', 'I CAN TASTE GRAVEL, YOU STUPID STATUE!'],
  shitty: ["YOU PUKED ON ME! I'M THE ONE WHO PUKED! HE'S THE ONE WHO SHIT!", 'CONCRETE! IN MY MOUTH! AND I CAN STILL SMELL HIM!'],
  nude: ["YOU PUKED ON ME?! THERE'S A NAKED GUY RIGHT THERE! PUKE ON HIM!", "CONCRETE IN MY MOUTH! AT LEAST I CAN'T SEE HIM!"],
};
/** Back up into the crown, fuming, for the smash. */
export const HARRY_FOLLOWUP: ByPants = {
  clean: ['YOU PUKED ON ME. MAKE IT UP TO ME. SMASH HIM! FAST!', 'FORGET IT! I FORGIVE YOU! SMASH HIM! NOW!', 'SMASH HIM BEFORE I HARDEN, DAMMIT!', 'PAYBACK, LADY! ON HIM! NOT ME!', 'FAST, YOU GREEN COCKSUCKER! FAST!'],
  shitty: ['FINE! WE BOTH PUKED! NOW SMASH THE ONE WHO SHIT! FAST!', 'SMASH HIM! FAST! BEFORE MY ABS HARDEN!'],
  nude: ['FINE! SMASH THE NAKED ONE! FAST! AIM SMALL!', "SMASH HIM! FAST! HE CAN'T HIDE THAT!"],
};

// ---------------------------------------------------------------------------------------------------------------
// His deaths: the machine gun's recoil spinning him round on his back (any way but the weakness), and buried in her
// concrete puke (the plague crossbow's)

export const HARRY_DEATH: ByPants = {
  clean: ['NOT... ON FOREIGN... OH, WAIT. AMERICAAAAAA!', 'I REGRET... NOTHING... EXCEPT THE STRAWS... AMERICAAAA!', 'YOU... COCKSUCKER... AMERICAAAAA!'],
  shitty: ['KILLED BY A GUY... WHO SHIT HIMSELF... AMERICAAAAA!', 'THE LAST THING I SMELL... IS YOU... AMERICAAAA!'],
  nude: ['KILLED... BY A NAKED... EUROPEAN... AMERICAAAAA!', 'THE LAST THING I SEE... IS THAT... AMERICAAAA!'],
};
export const HARRY_BURIED: ByPants = {
  clean: ["MMF! IT'S SETTING! MMMF! LADY! DIG ME OUT! MMMF!", "MMMF! I CAN'T MOVE MY... MMMF... ANYTHING!"],
  shitty: ['MMF! AT LEAST... I CAN\'T SMELL HIM... MMMF!', "MMMF! STILL BETTER THAN HIS PANTS! MMMF!"],
  nude: ["MMF! AT LEAST... I CAN'T SEE HIM... MMMF!", 'MMMF! WORTH IT! NO MORE NAKED GUY! MMMF!'],
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead (sparse)

/** Something that isn't the crossbow, now and then. */
export const MH_HINT = [
  "HE SAID HE FORGOT HIS AIRSICK PILLS. I GOT A CROSSBOW THAT MAKES PEOPLE PUKE.",
  'WEAK STOMACH. THE PUKE DARTS.',
  "SHE'S A TOUGH OLD BROAD. HE ISN'T. THE CROSSBOW.",
];
/** The first stuck arm (once a visit). */
export const MH_STUCK = ["...SHE'S STUCK.", 'JUST LIKE EVERY GIANT STATUE EVER.'];
/** The first time she pukes concrete on him. */
export const MH_CONCRETE = ['SHE PUKES CONCRETE.', "THAT'S GONNA SET."];
/** It's over (after her). */
export const MH_WON = ['...WELL. THAT\'S AMERICA.', 'SHE REALLY LOVED THAT ASSHOLE.'];
export const MH_WON_WEAK = ['SHOULD HAVE TAKEN YOUR PILLS.', 'SHE REALLY LOVED THAT ASSHOLE.'];
/** A grab at Harry (the grab's pool for his kind). */
export const GRAB_HARRY = ["HE'S ALL OILED UP!", "CAN'T GET A GRIP! IT'S ALL MUSCLE!", 'HE SMELLS LIKE PATCHOULI AND GUN OIL!'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him in here (by source), and the death screen

export const HURT: HurtTable = {
  'm2:fl_harry_gun': {
    hurt: ['MACHINE GUN! HE HAS A MACHINE GUN!', 'OW! THE HIPPIE SHOT ME!', 'WHERE DID HE EVEN GET THAT?'],
    death: ['MOWED DOWN BY A HIPPIE', 'SHOT BY HELICOPTER HARRY', 'KILLED BY THE REAL HARRY'],
  },
  'm2:fl_liberty_fist': {
    hurt: ['THE STATUE PUNCHED ME!', 'OW! A FIST THE SIZE OF A CAR!', 'LADY LIBERTY! WHY?!'],
    death: ['SMASHED BY THE STATUE OF LIBERTY', 'SHE FINALLY HIT SOMETHING', 'FREEDOM PUNCHED'],
  },
  'm2:fl_harry_sweep_down': {
    hurt: ['HE SHOT ME FROM THE WALL!', 'OW! I SHOULD HAVE STOOD UNDER HIM!', 'HE SPRAYED THE WHOLE PLACE!'],
    death: ['SHOT OFF THE WALL', 'MOWED DOWN TOP TO BOTTOM', 'HOSED DOWN BY A HIPPIE'],
  },
  'm2:fl_harry_sweep_up': {
    hurt: ['HE SHOT STRAIGHT DOWN!', 'OW! IT CAME UP THE FLOOR!', 'I SHOULD HAVE JUMPED!'],
    death: ['MOWED DOWN BOTTOM TO TOP', 'SHOT FROM ABOVE BY A HIPPIE', 'SPRAYED OFF A WALL'],
  },
  'm2:fl_liberty_barf': {
    hurt: ['CONCRETE PUKE! IT BURNS!', 'OW! SHE PUKED ON ME!', "IT'S SETTING ON MY LEGS!"],
    death: ['DROWNED IN STATUE PUKE', 'BURIED IN CONCRETE VOMIT', 'PUKED ON BY A NATIONAL MONUMENT'],
  },
};

const levels = (l: ByPants[]) => l.flatMap(allOf);
export const VOICE_LINES = pavilionVoices({ pa: { clean: [], shitty: [], nude: [] }, arrive: [], gags: [] }, HURT, [], {
  meathead: [...MH_IMPRESSED, MH_ABACK, ...MH_HINT, ...MH_STUCK, ...MH_CONCRETE, ...MH_WON, ...MH_WON_WEAK, ...GRAB_HARRY],
  [HARRY]: [
    ...allOf(HARRY_QUEASY), ...allOf(HARRY_RIP), ...allOf(HARRY_RANT), ...allOf(HARRY_SUMMON), HARRY_MONUMENT,
    ...allOf(HARRY_TAUNT), ...allOf(HARRY_FIRE), ...allOf(HARRY_CROWN), ...levels(HARRY_STUCK), ...allOf(HARRY_UNSTUCK),
    ...allOf(HARRY_CLING_DOWN), ...allOf(HARRY_CLING_UP), ...allOf(HARRY_HURT), ...allOf(HARRY_GLOAT), ...allOf(HARRY_LOW),
    ...allOf(HARRY_SICK_FIRST), ...allOf(HARRY_SICK), ...allOf(HARRY_CONCRETED), ...allOf(HARRY_FOLLOWUP),
    ...allOf(HARRY_DEATH), ...allOf(HARRY_BURIED),
  ],
});
