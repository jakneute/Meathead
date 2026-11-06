// NED THE NECROMANCER's lines (and Meathead's to him): the lot, his intros to the eight refights, his own fight. ALL
// CAPS, American spelling; clean / shitty / naked wherever it's his or said to him. Every line here is in
// PARK4_VOICE_LINES (park4/lines/index.ts), folded into ENDGAME_VOICE_LINES (endgame/lines.ts) and recorded by
// npm run voices.
//
// Ned: a demon, middle-aged, a nobody, a hack. He can't make anything of his own, only knockoffs (that's why every
// refight's arena is a cheap copy of where the boss died, and why the raised can only do what they did when they died:
// it's all he's got). He thinks this is his big break with Satan. Defensive (OH YEAH?), a ham, proud of all the wrong
// things, and a pushover.

import type { ByPants } from '../../park1/lines';
const bp = (clean: string[], shitty: string[], nude: string[]): ByPants => ({ clean, shitty, nude });

export const NED_VOICE = 'm2.ned';
export const NED_NAME = 'NED THE NECROMANCER';

// ---------------------------------------------------------------------------------------------------------------
// The lot (park4/lot.ts): he turns up in a puff, his piece, gone in another; the eight portals open

export const NED_APPEAR = ['BEHOLD! IT IS I! NED THE NECROMANCER! MASTER OF THE DEAD!'];
export const MH_WHO = bp(
  ['WHO? YOU LOOK LIKE A GUY WHO SELLS DICE AT A MALL.'],
  ['WHO? YOU LOOK LIKE A GUY WHO SELLS DICE. QUIT SNIFFING MY PANTS.'],
  ['WHO? YOU LOOK LIKE A GUY WHO SELLS DICE. EYES OFF MY DICK, MERLIN.'],
);
export const NED_TAUNT = bp(
  ['EVERY BOSS YOU KILLED? I DUG THEM UP. ALL EIGHT. THEY REMEMBER YOU.'],
  ['EVERY BOSS YOU KILLED? I DUG THEM UP. ALL EIGHT. THEY CAN SMELL YOU FROM HELL.'],
  ['EVERY BOSS YOU KILLED? I DUG THEM UP. ALL EIGHT. PUT SOME PANTS ON FOR THEM.'],
);
export const NED_BYE = ["SATAN'S GONNA BE SO PROUD OF ME. BYE!"];
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
// The intros (park4/refight.ts's card): before he drops in. Skippable (all of it). Every one names the sin out loud.
// [the place (a knockoff), who and what the sin was], then how Ned put him back together (by how he died), then the
// close (by Meathead's pants).

export interface Intro { place: string; sin: string; looks: Record<string, string>; close: ByPants; statue?: Record<string, string> }
export const INTROS: Record<string, Intro> = {
  adventure: {
    place: "WELCOME TO HELL'S JUNGLE CRUISE! AN ORIGINAL ATTRACTION BY NED. DON'T LOOK IT UP.",
    sin: 'SAFARI ARTIE. HIS SIN? PRIDE. BEST GUIDE IN THE PARK, HE SAID. EVERY DAY. TO EVERYBODY.',
    looks: {
      normal: 'THE RHINO WENT RIGHT THROUGH HIM. I PLUGGED THE HOLE WITH A COCONUT.',
      weakness: 'THE LITTLE GOBLINS ATE MOST OF HIM. THE REST IS A MANNEQUIN.',
    },
    close: bp(
      ['NOW HE GIVES THE SAME TOUR FOREVER. TO THE GUY WHO KILLED HIM. ENJOY!'],
      ['NOW HE GIVES THE SAME TOUR FOREVER. TO THE GUY WHO KILLED HIM. HE CAN SMELL YOU ALREADY.'],
      ['NOW HE GIVES THE SAME TOUR FOREVER. TO THE GUY WHO KILLED HIM. NAKED. HE LOVES THAT.'],
    ),
  },
  spooky: {
    place: "HELL'S BALLROOM! A FAITHFUL RECREATION! THE CHANDELIER'S A HULA HOOP.",
    sin: 'DONNIE DRACULA. HIS SIN? GLUTTONY. HE DRANK EVERY NECK AT THE BUFFET AND WENT BACK FOR SECONDS.',
    looks: {
      normal: 'HE DIED SHITTING HIMSELF. I SEWED THAT SHUT. YOU ARE WELCOME.',
      weakness: 'YOU SUCKED HIS SOUL OUT. I FILLED HIM BACK UP WITH GRAVY. CLOSE ENOUGH.',
    },
    close: bp(
      ["NOW HE'S A ZOMBIE VAMPIRE. HE'S THRILLED. NOBODY ELSE IS."],
      ["NOW HE'S A ZOMBIE VAMPIRE. AND YOU SMELL LIKE HIS LAST WORDS."],
      ["NOW HE'S A ZOMBIE VAMPIRE. AND YOU SHOWED UP AS A NAKED SNACK."],
    ),
  },
  space: {
    place: "HELL'S DISCO! THE ALIENS SNUCK IN AND BUILT IT. I'M TAKING THE CREDIT.",
    sin: "THE QUEEN. HER SIN? ROBOT. THAT'S NOT A SIN? IT IS NOW. I MADE A LIST.",
    looks: {
      normal: 'HER SKIN BURNT OFF. THE ALIENS GLUED ON NEW SKIN FROM THE DOLLAR STORE. SHE SMELLS LIKE A BEACH BALL.',
      weakness: 'YOU FLATTENED HER HEAD WITH A MALLET. THEY BANGED IT BACK OUT. MOSTLY.',
    },
    close: bp(
      ["I'LL BE UP IN THE BOOTH. DON'T LOOK AT THE BOOTH."],
      ["I'LL BE UP IN THE BOOTH. AWAY FROM YOUR PANTS."],
      ["I'LL BE UP IN THE BOOTH. AWAY FROM YOUR DICK."],
    ),
  },
  hollywood: {
    place: 'THE COLOSSEUM OF THE DAMNED! STUNT SHOWS NIGHTLY! THE DEMONS ONLY COME FOR THE FREE NACHOS.',
    sin: 'STUNTMAN STEVE. HIS SIN? ENVY. EVERY REAL STUNTMAN GOT A MOVIE. HE GOT A PARKING LOT.',
    looks: {
      normal: 'HE MISSED THE CRASH MAT. HEAD FIRST. I TURNED HIS HEAD BACK AROUND. MOSTLY.',
      weakness: 'LIGHTNING TURNED HIM TO ASH. I GLUED HIM BACK TOGETHER WITH SPIT.',
    },
    close: bp(
      ["NOW YOU'RE CRASHING HIS SHOW. HE HATES THAT MORE THAN HE HATES YOU."],
      ["NOW YOU'RE CRASHING HIS SHOW. IN SHITTY PANTS. HE'S GONNA LOSE IT."],
      ["NOW YOU'RE CRASHING HIS SHOW. NAKED. YOU'LL GET MORE APPLAUSE THAN HIM."],
    ),
  },
  foreign: {
    place: "WELCOME TO HELL'S AMERICA PAVILION! THE STATUE'S BACK TOO. I'M VERY PROUD OF THE STATUE.",
    sin: 'HELICOPTER HARRY. HIS SIN? WRATH. HE SHOT AT EVERYTHING. CLOUDS. BIRDS. HIS OWN DAD.',
    looks: {
      spin: 'HE SHOT HIMSELF FULL OF HOLES. I PLUGGED THEM WITH CHEWED GUM.',
      buried: 'YOU BURIED HIM IN CEMENT. I CHISELED HIM OUT. SOME OF HIM IS STILL CEMENT.',
      barfed: "HE PUKED HIMSELF TO DEATH. I POURED IT ALL BACK IN. DON'T ASK HOW.",
    },
    statue: {
      shot: 'SHE BLEW HER OWN HEAD OFF. I GAVE HER A FLOWER POT.',
      fell: 'SHE FELL TO PIECES. I USED DUCT TAPE. ALL OF THE DUCT TAPE.',
    },
    close: bp(
      ["HE'S STILL ANGRY. HE'S ALWAYS ANGRY. GO GET HIM."],
      ["HE'S STILL ANGRY. AND NOW HE HAS TO SMELL YOU. GO GET HIM."],
      ["HE'S STILL ANGRY. AND YOUR DICK'S OUT. GO GET HIM."],
    ),
  },
  frontier: {
    place: "HELL'S WILDERNESS! REAL FAKE TREES! HE'S BEEN LOST IN HERE FOR WEEKS.",
    sin: 'TUCKER THE CONDUCTOR. HIS SIN? GREED. HE SOLD THE WHOLE FOREST TO A LOGGING COMPANY. FOR A RAISE.',
    looks: {
      normal: 'THE GRIZZLY ATE HALF OF HIM. I FINISHED HIM OFF WITH A BEAR.',
      weakness: 'THE LIONS TORE HIM IN HALF. I SEWED THE HALVES BACK ON. MAYBE THE RIGHT WAY.',
    },
    close: bp(
      ["HE'S STILL BLIND. I FORGOT THE EYES. HE'S VERY MAD ABOUT IT."],
      ["HE'S STILL BLIND. BUT HE CAN SMELL. GOOD LUCK."],
      ["HE'S STILL BLIND. LUCKY HIM. YOU'RE NAKED."],
    ),
  },
  fantasy: {
    place: "HELL'S PIXIE BEDROOM! THE SHEETS GET CHANGED EVERY CENTURY.",
    sin: 'PIPER THE PIXIE. HER SIN? LUST. BLOODLUST. SHE WANTED YOU DEAD SO BAD SHE COULD TASTE IT.',
    looks: {
      normal: 'A CORK WENT THROUGH HER HEAD. I PLUGGED IT WITH A NICER CORK.',
      weakness: 'YOU POPPED HER LIKE A BALLOON. I PATCHED HER UP WITH A BIKE TIRE KIT.',
    },
    close: bp(
      ["SHE SAYS SEEING YOU AGAIN PROVES SHE'S IN HELL. SHE'S NOT WRONG."],
      ["SHE SAYS SMELLING YOU AGAIN PROVES SHE'S IN HELL. SHE'S NOT WRONG."],
      ["SHE SAYS SEEING YOUR DICK AGAIN PROVES SHE'S IN HELL. SHE'S NOT WRONG."],
    ),
  },
  cartoon: {
    place: 'DAD GUY, LIVE IN HELL! TONIGHT: THE SAME EPISODE! LIKE EVERY NIGHT!',
    sin: 'DAD GUY. HIS SIN? SLOTH. NEVER GOT OFF THE COUCH. NOT ONCE. NOT EVEN TO DIE.',
    looks: {
      normal: 'HE DROWNED IN BEER. I WRUNG HIM OUT. HE STILL SLOSHES.',
      weakness: 'A STUNT CAR FLATTENED HIM. I PUMPED HIM BACK UP WITH A BIKE PUMP.',
    },
    close: bp(
      ["AND THE ACTORS WHO PLAYED HIS FAMILY? THEY'RE ON THE TRACK NOW. THEY CAN'T DIE. ISN'T THAT FUN?"],
      ["AND THE ACTORS WHO PLAYED HIS FAMILY? ON THE TRACK. FOREVER. THEY CAN'T EVEN DIE OF YOUR SMELL."],
      ["AND THE ACTORS WHO PLAYED HIS FAMILY? ON THE TRACK. FOREVER. STARING AT YOUR DICK."],
    ),
  },
};

// ---------------------------------------------------------------------------------------------------------------
// His fight (park4/ned.ts): after all eight. He's a summoner, a pathetic one.

export const NED_FIGHT_HELLO = bp(
  ["YOU BEAT ALL EIGHT?! FINE. THAT'S FINE. I HAVE A BACKUP PLAN. IT'S ME."],
  ["YOU BEAT ALL EIGHT?! IN THOSE PANTS?! FINE. I HAVE A BACKUP PLAN. IT'S ME."],
  ["YOU BEAT ALL EIGHT?! NAKED?! FINE. I HAVE A BACKUP PLAN. IT'S ME."],
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
  ['SATAN SAYS I HAVE REAL POTENTIAL!', "I'M WAY SCARIER THAN I LOOK!", 'I HAVE A CERTIFICATE!'],
  ['SATAN SAYS I HAVE REAL POTENTIAL! YOU HAVE SHIT PANTS!', "YOU SMELL WORSE THAN MY ZOMBIES!", 'I HAVE A CERTIFICATE! YOU HAVE DIARRHEA!'],
  ['SATAN SAYS I HAVE REAL POTENTIAL! YOU HAVE NO PANTS!', "I'M NOT LOOKING AT IT! I'M NOT!", 'I HAVE A CERTIFICATE! YOU HAVE A TINY... NEVER MIND!'],
);
/** He flinches off somewhere else when Meathead's on him. */
export const NED_BLINK = ['NOPE!', 'PERSONAL SPACE!', 'NOT TODAY!', 'NO TOUCHING!'];
export const NED_LOW = bp(
  ["THIS ISN'T FAIR! I SUMMONED THINGS!"],
  ["THIS ISN'T FAIR! I'M BEING BEATEN BY A GUY IN A DIAPER!"],
  ["THIS ISN'T FAIR! I'M BEING BEATEN BY A NAKED GUY!"],
);
/** His last summon: himself, by accident. */
export const NED_DYING = ['I SUMMON... MY... OH NO. NOT MINE.', 'RAISE... THE... WAIT. THAT ONE IS ME.'];
export const MH_NED_DEAD = bp(
  ['HIS OWN SKELETON RAN OFF ON HIM. HACK.'],
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
