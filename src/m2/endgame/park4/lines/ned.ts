// NED THE NECROMANCER's lines (and Meathead's to him): the lot, his intros to the refights, his own fight. ALL CAPS,
// American spelling; clean / shitty / naked wherever it's his or said to him. Every line here is in PARK4_VOICE_LINES
// (park4/lines/index.ts), folded into ENDGAME_VOICE_LINES (endgame/lines.ts) and recorded by npm run voices.
//
// Ned: Satan's son, the middle one, the disappointment (the owner: every endgame boss is one of Satan's or the widow's
// kids). His brothers MEHPHISTO and BRATHAZAR got the fire and the fists; he went into necromancy, and he's a hack at
// it: he can't make anything of his own, only knockoffs (that's why every refight's arena is a cheap copy of where the
// boss died, and why the raised can only do what they did when they died). All of it is for Dad's approval. A ham, an
// MC who thinks he's great, proud of all the wrong things, defensive (OH YEAH?), and a pushover.

import type { ByPants } from '../../park1/lines';
const bp = (clean: string[], shitty: string[], nude: string[]): ByPants => ({ clean, shitty, nude });

export const NED_VOICE = 'm2.ned';
export const NED_NAME = 'NED THE NECROMANCER';

// ---------------------------------------------------------------------------------------------------------------
// The lot (park4/lot.ts): he turns up in a puff, his piece, gone in another; the eight portals open

export const NED_APPEAR = ['BEHOLD! NED THE NECROMANCER! SON OF SATAN! THE MIDDLE ONE!'];
export const MH_WHO = bp(
  ['SATAN HAS A THIRD KID? YOU LOOK LIKE YOU SELL DICE AT A MALL.'],
  ['SATAN HAS A THIRD KID? QUIT SNIFFING MY PANTS, MALL WIZARD.'],
  ['SATAN HAS A THIRD KID? EYES OFF MY DICK, MERLIN.'],
);
export const NED_TAUNT = bp(
  ['YOU KILLED BOTH MY BROTHERS. FINE. I RAISED EIGHT OF YOUR DEAD. TOP THAT.'],
  ['YOU KILLED BOTH MY BROTHERS. IN THOSE PANTS. I RAISED EIGHT OF YOUR DEAD. THEY CAN SMELL YOU.'],
  ['YOU KILLED BOTH MY BROTHERS. NAKED. I RAISED EIGHT OF YOUR DEAD. PUT SOMETHING ON FOR THEM.'],
);
export const NED_BYE = ["DAD'S GONNA BE SO PROUD OF ME. FOR ONCE. BYE!"];
export const MH_AFTER = bp(
  ['EIGHT PORTALS IN A PARKING LOT. FINE.'],
  ['EIGHT PORTALS AND I GOTTA DO ALL OF THEM IN THESE PANTS.'],
  ['EIGHT PORTALS. AND MY DICK GOES THROUGH EVERY ONE.'],
);
/** Back at the lot after a refight, now and then (none if all eight are done: Ned's turning up). */
export const MH_BACK = bp(
  ['ONE MORE DEAD GUY. AGAIN.', 'KILLED HIM TWICE. STILL FUN.'],
  ['ONE MORE DEAD GUY. MY PANTS DID MOST OF IT.', 'KILLED HIM TWICE. SHIT MYSELF BOTH TIMES.'],
  ['ONE MORE DEAD GUY. AND HE SAW MY DICK TWICE.', 'KILLED HIM TWICE. NAKED BOTH TIMES.'],
);
/** At a spent portal, UP: it's shut. */
export const MH_SPENT = ['ALREADY KILLED THAT ONE. TWICE.', "THAT ONE'S DONE. STAY DEAD."];

// ---------------------------------------------------------------------------------------------------------------
// The intros (park4/refight.ts's title card, park4/card.ts): Ned the MC presents each sinner before Meathead drops in.
// Four short lines, all voiced, all skippable (SKIP takes the lot): the sin, named by its word, and what he did to earn
// it; the punishment, the place he's in now; why it fits, in one line; and the kicker, by Meathead's pants. The Queen
// has none (she's the robot: the aliens rebuilt her, and Ned's up in her booth).

export interface Intro {
  /** The card's caption for the place (the punishment, as a name). */
  place: string;
  sin: string; punish: string; why: string; kick: ByPants;
}
export const INTROS: Record<string, Intro> = {
  adventure: {
    place: "HELL'S JUNGLE CRUISE",
    sin: 'SAFARI ARTIE! HIS SIN: PRIDE! HE TOLD EVERY TOURIST HE WAS THE BEST GUIDE ALIVE.',
    punish: 'NOW HE GIVES THE SAME TOUR. FOREVER. ONE STAR. EVERY TIME.',
    why: "HE LOVED THE SOUND OF HIS OWN VOICE. NOW IT'S ALL HE GETS.",
    kick: bp(["TODAY'S TOUR GROUP: YOU!"], ["TODAY'S TOUR GROUP: YOU! AND YOUR SMELL!"], ["TODAY'S TOUR GROUP: YOU! NAKED! HE'LL NARRATE IT!"]),
  },
  spooky: {
    place: "HELL'S BALLROOM BUFFET",
    sin: 'DONNIE DRACULA! HIS SIN: GLUTTONY! HE DRANK EVERY NECK AT EVERY BUFFET AND WENT BACK FOR SECONDS.',
    punish: "NOW IT'S ALL YOU CAN EAT. FOREVER. AND IT'S ALL ROTTEN.",
    why: "IT'S NOT WORKING. HE LOVES IT. MY DAD IS FURIOUS.",
    kick: bp(["DESSERT'S HERE. IT'S YOU!"], ["DESSERT'S HERE. IT'S YOU! IT'S GONE OFF!"], ["DESSERT'S HERE. IT'S YOU! NO WRAPPER!"]),
  },
  hollywood: {
    place: 'THE COLOSSEUM OF THE DAMNED',
    sin: 'STUNTMAN STEVE! HIS SIN: ENVY! EVERY REAL STUNTMAN GOT A MOVIE. HE GOT A PARKING LOT.',
    punish: 'NOW HE DOES HIS SHOW EVERY NIGHT. THE CROWD ONLY WATCHES THE OTHER GUY.',
    why: 'HE WANTED THEIR APPLAUSE. NOW HE GETS TO HEAR SOMEBODY ELSE GET IT.',
    kick: bp(["YOU'RE TONIGHT'S VOLUNTEER!"], ["YOU'RE TONIGHT'S VOLUNTEER! BRING A TOWEL!"], ["YOU'RE TONIGHT'S VOLUNTEER! WARDROBE'S CLOSED!"]),
  },
  foreign: {
    place: "HELL'S AMERICA PAVILION",
    sin: 'HELICOPTER HARRY! HIS SIN: WRATH! HE SHOT AT CLOUDS. BIRDS. HIS OWN DAD.',
    punish: 'NOW HE SHOOTS FOREVER. AND NOTHING HE SHOOTS EVER STAYS DEAD.',
    why: 'NOT EVEN THE STATUE. SHE GETS BACK UP EVERY TIME. IT KILLS HIM.',
    kick: bp(['YOU CAN STILL DIE, THOUGH. GO!'], ['YOU CAN STILL DIE, THOUGH. HURRY. YOU STINK.'], ['YOU CAN STILL DIE, THOUGH. OF EXPOSURE.']),
  },
  frontier: {
    place: "HELL'S WILDERNESS",
    sin: 'TUCKER THE CONDUCTOR! HIS SIN: GREED! HE SOLD THE WHOLE FOREST FOR A RAISE.',
    punish: "NOW HE'S LOST IN WHAT'S LEFT OF IT. BLIND. FOREVER.",
    why: "THERE'S GOLD ALL OVER THE PLACE DOWN THERE. HE CAN'T SEE ANY OF IT.",
    kick: bp(['HE CAN HEAR YOU, THOUGH.'], ['HE CAN SMELL YOU, THOUGH.'], ["LUCKY HIM. YOU'RE NAKED."]),
  },
  fantasy: {
    place: "HELL'S PIXIE BEDROOM",
    sin: 'PIPER THE PIXIE! HER SIN: LUST! BLOODLUST. SHE WANTED YOU DEAD SO BAD SHE COULD TASTE IT.',
    punish: 'NOW SHE GETS ONE VISITOR A CENTURY. THE SAME ONE. FOREVER.',
    why: "IT'S YOU. IT'S ALWAYS YOU. THAT'S HOW SHE KNOWS IT'S HELL.",
    kick: bp(['KNOCK FIRST.'], ['KNOCK FIRST. THEN WIPE.'], ['KNOCK FIRST. WITH YOUR HAND.']),
  },
  cartoon: {
    place: 'DAD GUY, LIVE IN HELL',
    sin: 'DAD GUY! HIS SIN: SLOTH! HE NEVER GOT OFF THE COUCH. NOT ONCE. NOT EVEN TO DIE.',
    punish: 'NOW HE WORKS. A LIVE SHOW. EVERY NIGHT. NO COUCH. NO RERUNS.',
    why: "AND THE ACTORS WHO PLAYED HIS FAMILY ARE BOLTED TO THE TRACK. THEY CAN'T DIE. THAT'S SHOWBIZ!",
    kick: bp(["YOU'RE THE STUDIO AUDIENCE!"], ["YOU'RE THE STUDIO AUDIENCE! THE SMELLY KIND!"], ["YOU'RE THE STUDIO AUDIENCE! THE NAKED KIND!"]),
  },
};

// ---------------------------------------------------------------------------------------------------------------
// His fight (park4/ned.ts): after all eight. He's a summoner, a pathetic one.

export const NED_FIGHT_HELLO = bp(
  ["ALL EIGHT?! FINE. DAD ALWAYS SAID IF YOU WANT IT DONE RIGHT, SEND MEHPHISTO. HE'S DEAD. SO IT'S ME."],
  ["ALL EIGHT?! IN THOSE PANTS?! FINE. MY BROTHERS ARE DEAD. SO IT'S ME."],
  ["ALL EIGHT?! NAKED?! FINE. MY BROTHERS ARE DEAD. SO IT'S ME."],
);
export const MH_FIGHT_HELLO = bp(
  ["YOU'RE THE BACKUP PLAN? COME HERE."],
  ["YOU'RE THE BACKUP PLAN? COME HERE. SMELL THIS."],
  ["YOU'RE THE BACKUP PLAN? COME HERE. LOOK AT IT."],
);
/** The summons (the owner's two, and more in that vein): said as they climb up out of the ground. */
export const NED_ARCHERS = ["OH YEAH! HERE'S SOME SKELETON ARCHERS!", "OH YEAH?! MORE SKELETON ARCHERS!", "OH YEAH! ARCHERS! THE BONY KIND!"];
export const NED_MAGES = ["OH YEAH? HERE'S SOME SKELETON MAGES!", "OH YEAH?! SKELETON MAGES! FIRE AND ICE!", "OH YEAH? MAGES! I READ A BOOK ABOUT THEM!"];
export const NED_DOGS = ["OH YEAH?! HERE'S SOME SKELETON DOGS!", "OH YEAH! SKELETON DOGS! THEY DON'T FETCH!"];
export const NED_ONE = ["OH YEAH? HERE'S... ONE SKELETON.", "OH YEAH?! HERE'S A SKELETON! HE'S... TRYING."];
/** The necromancy itself (the rite before each summon, park4/ned.ts): played straight, in his other voice (deep, slow,
 *  wrong: NED_RITE_VOICE). It calls back to the eight he raised. The full one (the first two, and his last), then the
 *  short one. */
export const NED_RITE_VOICE = 'm2.ned.rite';
export const NED_RITE = bp(
  ['I RAISED EIGHT. I CAN RAISE EIGHT HUNDRED. RISE.', 'EVERY BODY UNDER THIS LOT. RISE.'],
  ['THE DEAD CAN SMELL YOU. RISE.', 'I RAISED EIGHT. THEY REMEMBER YOUR STINK. RISE.'],
  ['THE DEAD SEE ALL OF YOU. RISE.', 'I RAISED EIGHT. THE REST WANT A LOOK. RISE.'],
);
export const NED_RITE_SHORT = bp(['RISE.', 'AGAIN. RISE.'], ['RISE. SMELL HIM.', 'RISE.'], ['RISE. SEE HIM.', 'RISE.']);
/** Low: the last of it, everything he's got (then: one skeleton). */
export const NED_RITE_LAST = bp(
  ['EVERY GRAVE. EVERY BONE. RISE!'],
  ['EVERY GRAVE. EVERY BONE. DROWN HIM. RISE!'],
  ['EVERY GRAVE. EVERY BONE. BURY HIM. RISE!'],
);
/** One of them falls to bits as soon as it's up. */
export const NED_DUD = bp(
  ["THAT ONE'S... RESTING.", 'HE WAS OLD. HE HAD A GOOD RUN.'],
  ['THAT ONE SMELLED YOU AND GAVE UP.', 'HE DIED AGAIN. FROM YOUR PANTS.'],
  ['THAT ONE SAW YOUR DICK AND GAVE UP.', 'HE DIED AGAIN. LOOKING AT YOU.'],
);
/** One of them's from a party store (plastic, the price tag still on). */
export const NED_PARTY = bp(
  ['THAT ONE IS REAL! THE TAG IS PART OF HIM!', "IT WAS ON SALE! IT'S STILL CURSED!"],
  ["THAT ONE IS REAL! IT'S SCARIER THAN YOUR PANTS!", "IT WAS ON SALE! LIKE YOUR DIAPERS!"],
  ['THAT ONE IS REAL! IT HAS MORE ON THAN YOU!', "IT WAS ON SALE! IT'S STILL BETTER DRESSED!"],
);
/** When his summons all crumble. */
export const NED_ALL_DEAD = ['THEY HAD HOMES TO GO TO.', 'THOSE WERE RENTALS!', 'I PAID FOR THOSE!', 'THEY WERE NEW!'];
export const NED_HURT = bp(
  ['OW! OW! RULES! THERE ARE RULES!', 'NOT THE FACE!', 'OW! I BRUISE!'],
  ['OW! YOU GOT SHIT ON MY ROBE!', 'NOT THE FACE! YOUR HANDS ARE BROWN!', 'OW! THIS ROBE WAS TWENTY BUCKS!'],
  ['OW! YOUR THING TOUCHED ME!', 'NOT THE FACE! NOT WITH THAT OUT!', 'OW! PUT IT AWAY!'],
);
export const NED_TAUNTS = bp(
  ['DAD SAYS I HAVE REAL POTENTIAL!', 'MEHPHISTO NEVER RAISED ANYTHING! NOT EVEN HIS GRADES!', "I HAVE A CERTIFICATE! BRATHAZAR CAN'T EVEN READ!"],
  ['DAD SAYS I HAVE REAL POTENTIAL! YOU HAVE SHIT PANTS!', 'YOU SMELL WORSE THAN MY ZOMBIES!', 'I HAVE A CERTIFICATE! YOU HAVE DIARRHEA!'],
  ['DAD SAYS I HAVE REAL POTENTIAL! YOU HAVE NO PANTS!', "I'M NOT LOOKING AT IT! I'M NOT!", 'I HAVE A CERTIFICATE! YOU HAVE A TINY... NEVER MIND!'],
);
/** He flinches off somewhere else when Meathead's on him. */
export const NED_BLINK = ['NOPE!', 'PERSONAL SPACE!', 'NOT TODAY!', 'NO TOUCHING!'];
export const NED_LOW = bp(
  ["DAD! DAD, ARE YOU WATCHING?! DON'T WATCH!"],
  ["DAD, DON'T WATCH! I'M LOSING TO A GUY IN A DIAPER!"],
  ["DAD, DON'T WATCH! I'M LOSING TO A NAKED GUY!"],
);
/** His last summon: himself, by accident. */
export const NED_DYING = ['I SUMMON... MY... OH NO. NOT MINE. DAD!', 'RAISE... THE... WAIT. THAT ONE IS ME. MOM!'];
export const MH_NED_DEAD = bp(
  ['HIS OWN SKELETON RAN OFF ON HIM. TELL YOUR DAD.'],
  ['HIS OWN SKELETON RAN OFF. COULDN\'T TAKE THE SMELL.'],
  ['HIS OWN SKELETON RAN OFF. SAW MY DICK AND QUIT.'],
);
/** On to the stub (the last battle's to come). */
export const MH_LAST = bp(
  ['OKAY. WHO ELSE WANTS SOME?'],
  ['OKAY. WHO ELSE WANTS SOME? I GOT PLENTY.'],
  ['OKAY. WHO ELSE WANTS SOME? IT\'S ALL OUT ALREADY.'],
);

// The skeletons' own: a rattle, a word or two (they're weak, they know it)
export const SKEL_VOICE = 'm2.wp.skel';
export const SKEL_BARK = ["I'M BONES.", 'WE JUST GOT HERE.', 'DO I HAVE TO?', 'MY UNION SAYS NO.'];

// ---------------------------------------------------------------------------------------------------------------
// New ways to hurt him (Ned's fight): his voiced hurt callouts and the death screen's line, each

export const HURT4: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:wp4_arrow': { hurt: ['A BONE GUY SHOT ME!', 'AN ARROW? WHAT YEAR IS IT?!', 'OW! IN THE BUTT! AGAIN!'], death: ['SHOT BY A SKELETON', 'ARROWED BY BONES'] },
  'm2:wp4_fire': { hurt: ['HOT! HOT! A SKELETON THREW FIRE!', 'MY HAIR! WHAT HAIR I GOT!'], death: ['ROASTED BY A SKELETON', 'SKELETON BARBECUE'] },
  'm2:wp4_ice': { hurt: ['COLD! RIGHT IN THE NIPS!', 'BRAIN FREEZE! FROM A SKELETON!'], death: ['FROZEN BY A SKELETON', 'ICED BY BONES'] },
  'm2:wp4_dog': { hurt: ['THE BONE DOG BIT ME!', 'BAD DOG! DEAD DOG!'], death: ['BITTEN BY A DEAD DOG', 'CHEWED BY A BONE DOG'] },
  'm2:wp4_staff': { hurt: ['HE BONKED ME WITH A DOLLAR STORE SKULL!', 'OW! HIS STICK!'], death: ['BONKED TO DEATH BY NED', 'KILLED BY A PARTY STORE SKULL'] },
};
