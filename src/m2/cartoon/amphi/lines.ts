// What's said at STUPID DAD LIVE! (the amphitheater: the security guard, the show, STUPID DAD's intro), by voice
// (cartoon/voices.ts gathers it; tools/voices records it). In the user's voice: blunt, short, vulgar, specific; talk
// less; fit the trigger. Picked with pickLine (no line twice within 45 s). Meathead's lines and everybody reacting to
// him in clean / shitty / naked pools; STUPID DAD's (the boss's) in all three for every group from the moment he sees
// him. The show's own lines (him on the couch calling for beer, the family's tapes) don't react to Meathead (he hasn't
// seen him yet): one pool each, the studio narrator's way.
//
// The setup (the user's): the lone surviving cast member of STUPID DAD, the man who voiced the dad, in his 70s now, an
// alcoholic like the rest of them were (MOM, THE BOY, SIS and GRAMPS all dead of it: the plaque back in the big-kid zone
// has their names); his TV family cheap animatronics on the tapes of the dead actors' voices; he sits on the couch and
// asks the Boy for another beer so he can watch the game, and he drinks real beer doing it. Never anything about
// Meathead's age. Pure data.

import { allOf, type ByPants } from '../talk';

export const VOICES = {
  guard: 'm2.cartoon.bouncer',
  dad: 'm2.cartoon.dad',
  mom: 'm2.cartoon.tvmom', boy: 'm2.cartoon.tvboy', sis: 'm2.cartoon.tvsis', gramps: 'm2.cartoon.tvgramps',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In through the gate. */
export const ARRIVE: ByPants = {
  clean: ['STUPID DAD LIVE. SHOWS DAILY. GOD HELP US.', 'AN AMPHITHEATER. FOR A SHOW NOBODY WATCHED.'],
  shitty: ["A LIVE SHOW. I'LL TAKE THE BACK ROW.", "BLEACHERS. NOBODY'S SITTING NEXT TO ME ANYWAY."],
  nude: ["A LIVE SHOW. I'LL BE THE ONE IN THE AISLE. NAKED.", 'STUPID DAD LIVE. WAIT TILL HE SEES ME LIVE.'],
};
/** Back once it's all over (the land cleared). */
export const REVISIT: ByPants = {
  clean: ['EMPTY STAGE. BEST SHOW THEY EVER HAD.', 'SHOW CANCELED. AGAIN.'],
  shitty: ['NOBODY HERE. GOOD. NOBODY TO SMELL ME.', 'EMPTY SEATS. I COULD SIT ANYWHERE. NOBODY WOULD MOVE.'],
  nude: ['EMPTY. I COULD STREAK THE STAGE. I ALREADY DID.', 'NOBODY LEFT TO SEE ME. THEIR LOSS.'],
};

/** Things he's got to say passing them (once each a visit). */
export const GAGS: Record<'beer' | 'crowd' | 'show' | 'robots', ByPants> = {
  /** The beer stand (COLD BEER, $12). */
  beer: {
    clean: ["THE BEER STAND'S THE ONLY THING HERE WITH A LINE.", 'TWELVE BUCKS FOR A BEER. YOU NEED ONE TO SIT THROUGH IT.'],
    shitty: ['A BEER. THE LAST THING MY GUT NEEDS.', "TWELVE BUCKS A BEER. I'M ALREADY OUT A PAIR OF PANTS."],
    nude: ['NO SHIRT, NO SHOES, NO BEER. FINE.', 'TWELVE BUCKS A BEER AND NOWHERE TO PUT MY WALLET.'],
  },
  /** The bleachers: six people, two asleep. */
  crowd: {
    clean: ['SIX PEOPLE. TWO ASLEEP. ONE MIGHT BE DEAD.', "HALF EMPTY. THE OTHER HALF'S DRUNK."],
    shitty: ["PLENTY OF SEATS. EVERYBODY'S ABOUT TO MOVE ANYWAY.", 'EMPTY ROWS. GOOD. MORE ROOM FOR THE SMELL.'],
    nude: ["A NAKED GUY IN THE AISLE AND NOBODY WAKES UP.", "NOBODY LOOKS UP. THAT'S HOW BORING THIS SHOW IS."],
  },
  /** The show, the first "BOY! BEER!" he hears coming down the steps. */
  show: {
    clean: ["THAT'S THE SHOW? A GUY ON A COUCH YELLING FOR BEER?", 'I SAW THIS SHOW. EVERY NIGHT. AT MY HOUSE.'],
    shitty: ['A FAT GUY YELLING FOR BEER. HE SHITS HIMSELF TOO. I CAN TELL.', 'THAT IS A REAL BEER. AND THOSE ARE REAL STAINS.'],
    nude: ["HE'S IN HIS UNDERWEAR. I'M STILL LESS DRESSED.", "THAT'S THE SHOW? I'M MORE OF A SHOW THAN THAT."],
  },
  /** The family, up close from the pit: cheap animatronics. */
  robots: {
    clean: ["THE WHOLE FAMILY'S ROBOTS. CHEAP ROBOTS.", "THE KID'S ON A TRACK. LIKE A TOY TRAIN."],
    shitty: ['ROBOT FAMILY. AT LEAST THEY CAN\'T SMELL ME.', 'THE MOM IS A ROBOT. SHE STILL LOOKS DISGUSTED.'],
    nude: ["ROBOT FAMILY. NOBODY'S EYES FOLLOW ME. GOOD.", "THE GRANDPA ROBOT'S LOOKING RIGHT AT MY DICK."],
  },
};

/** The guard down, the way open (the boss door's line). */
export const MH_KICKED: ByPants = {
  clean: ['BEST DOOR I EVER KICKED.', "DOOR'S OPEN."],
  shitty: ['THERE. NOW WE BOTH HAD A BAD DAY.', "SORRY, PAL. I'M HAVING A WORSE ONE."],
  nude: ['SKIN ON SKIN. WE BOTH FELT THAT.', 'A NAKED KICK. NOBODY WON.'],
};
/** STUPID DAD's mistaken him for the Boy. */
export const MH_SEES: ByPants = {
  clean: ["I'M NOT YOUR KID, GRANDPA.", "YOUR FAMILY'S A BUNCH OF ROBOTS, MAN."],
  shitty: ["I'M NOT YOUR KID. BUT YES. I SHIT MYSELF.", 'I CAN SMELL YOUR BREATH OVER MY PANTS. THAT IS AN ACCOMPLISHMENT.'],
  nude: ["I'M NOT YOUR KID. AND THESE AREN'T PANTS.", 'EYES ON THE GAME, GRANDPA.'],
};
/** Last word before it's on. */
export const MH_ON: ByPants = {
  clean: ['SIT DOWN BEFORE YOU BREAK A HIP.', "FINE. LET'S GO, DAD."],
  shitty: ['COME ON, OLD MAN. WE BOTH SMELL.', "LET'S GO. LOSER CLEANS THE COUCH."],
  nude: ["LET'S GO, GRANDPA. EYES UP HERE.", "COME ON. LAST THING YOU'LL SEE IS ME. ALL OF ME."],
};

// ---------------------------------------------------------------------------------------------------------------
// The security guard (the boss door)

/** At the stage steps, a hand up (the user's line, verbatim, first in every pool). */
export const GUARD_STOP: ByPants = {
  clean: ["SHOW'S IN PROGRESS. NO GUESTS ON STAGE.", "SHOW'S IN PROGRESS. NO GUESTS ON STAGE. BACK TO YOUR SEAT."],
  shitty: ["SHOW'S IN PROGRESS. NO GUESTS ON STAGE. AND, MAN. NO.", "SHOW'S IN PROGRESS. NO GUESTS ON STAGE. GO HOSE OFF."],
  nude: ["SHOW'S IN PROGRESS. NO GUESTS ON STAGE. NO NAKED ONES EITHER.", "SHOW'S IN PROGRESS. NO GUESTS ON STAGE. PUT THAT AWAY."],
};
/** Kicked in the nuts, going down. */
export const GUARD_DOWN_LINES: ByPants = {
  clean: ['MY... NUTS...', 'OH GOD. RIGHT IN THE... OH GOD.'],
  shitty: ['MY NUTS... AND NOW I CAN SMELL YOU...', "THE NUTS... AND I'M DOWN HERE WITH THE SMELL..."],
  nude: ['I SAW IT ALL SWING. THEN I FELT IT.', 'KICKED IN THE NUTS... BY A NAKED GUY...'],
};
/** Lying there, now and then, as he goes by (only fresh lines). */
export const GUARD_GROAN: ByPants = {
  clean: ['STILL... HURTS...', "I'M GONNA PUKE.", 'WHY THE NUTS, MAN?'],
  shitty: ['DO NOT STEP OVER ME. NOT IN THOSE PANTS.', 'THE SMELL... IS NOT HELPING...'],
  nude: ['DO NOT STEP OVER ME. NOT NAKED. PLEASE.', 'I CAN STILL SEE IT WHEN I CLOSE MY EYES.'],
};
/** ...on a later visit (the land cleared): somebody gave him an ice pack. */
export const GUARD_LATER: ByPants = {
  clean: ['THEY GAVE ME AN ICE PACK. THAT IS IT.', 'STILL HERE. STILL HURTS. THANKS.'],
  shitty: ['YOU AGAIN. AND THE SMELL AGAIN.', 'STAY AWAY FROM MY NUTS. AND MY NOSE.'],
  nude: ['YOU AGAIN. STILL NAKED. STILL NO.', 'KEEP THAT THING AWAY FROM MY ICE PACK.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The show (STUPID DAD, before he's seen him; the family's tapes)

/** Calling the Boy (the user's line first). */
export const SHOW_CALL = ['BOY! GET ME ANOTHER BEER!', 'BOY! BEER!', 'BOY! ANOTHER COLD ONE!', "BOY! THIS ONE'S EMPTY!", "BOY! BEER! THE GAME'S ON!"];
/** Handed it. */
export const SHOW_TAKE = ['ATTABOY.', "THAT'S MY BOY.", 'COLD. GOOD.'];
/** Out of character, mumbled to nobody: the sad part. */
export const SHOW_ADLIB = [
  "MARLENE. THAT'S YOUR LINE, SWEETHEART.",
  "HAL WOULD'VE LAUGHED AT THAT ONE.",
  'SAME COUCH SINCE NINETY-FIVE.',
  "THEY'RE ALL GONE. EVERY ONE OF THEM.",
  "THAT'S REAL BEER, FOLKS. DON'T TELL THE PARK.",
  'TWO MORE SHOWS. THEN THE GOOD STUFF.',
];
/** At the game on the TV (the same tape every show). */
export const SHOW_TV = ['RUN THE BALL! RUN THE... AH, HELL.', "THAT'S HOLDING! YOU BLIND?", "TOUCHDOWN! ...NO. IT'S THE SAME TAPE."];

/** The family's tapes (the dead actors' voices, through cheap speakers). */
export const MOM_TAPE = ['OH, HONEY!', 'NOT IN FRONT OF THE KIDS, DEAR!', "DINNER'S IN THE OVEN, SWEETIE!"];
export const BOY_TAPE = ['SURE THING, POP!', 'COMING RIGHT UP, POP!', 'HERE YA GO, POP!'];
export const SIS_TAPE = ['DA-AD! GROSS!', 'UGH. EVERY EPISODE.'];
export const GRAMPS_TAPE = ['IN MY DAY, WE DRANK FROM THE HOSE!', "WHAT'S EVERYBODY YELLING ABOUT?"];
/** ...glitching (the intro: the show's stopped and they haven't). */
export const GLITCH_TAPE: Record<'mom' | 'boy' | 'gramps', string[]> = {
  mom: ['OH, HO-HO-HO-HONEY!', 'NOT IN FRONT OF THE... THE... THE...'],
  boy: ['SURE THING, P-P-P-POP!', 'HERE YA GO, POP! HERE YA GO, POP! HERE YA...'],
  gramps: ['IN MY DAY. IN MY DAY. IN MY DAY.', "WHAT'S EVERYBODY... EVERYBODY... EVERYBODY..."],
};

// ---------------------------------------------------------------------------------------------------------------
// STUPID DAD, the intro (he's seen him: by pants, every group)

/** He squints at him: half in character (he thinks it's the Boy). */
export const DAD_NOTICE: ByPants = {
  clean: ['BOY? THAT YOU? YOU GOT BIG.', "YOU'RE NOT THE BOY. THE BOY'S GOT A KEY IN HIS BACK."],
  shitty: ['BOY? DID YOU SHIT YOURSELF AGAIN?', 'SOMETHING DIED. MARLENE, CHECK THE BOY.'],
  nude: ["BOY! PANTS! YOUR MOTHER'S RIGHT THERE!", 'A NAKED GUY ON MY SET. EPISODE NINE ALL OVER AGAIN.'],
};
/** Getting up off the couch (it takes a while). */
export const DAD_UP: ByPants = {
  clean: ['THAT IS IT. NOBODY INTERRUPTS THE GAME.', 'THIRTY YEARS ON THIS COUCH. NOW I GOTTA GET UP.'],
  shitty: ["THIS IS WHY WE DON'T HAVE GUESTS.", 'YOU STINK UP MY LIVING ROOM, I STINK UP YOUR FACE.'],
  nude: ['YOU WALK ON MY SET WITH YOUR WANG OUT?', "PUT IT AWAY. MY ROBOTS GOT MORE DIGNITY."],
};
/** Up, the can crushed: the threat. */
export const DAD_FIGHT: ByPants = {
  clean: ['MARLENE! GET MY BELT!', "DAD'S GONNA TEACH YOU A LESSON. AFTER THIS BEER."],
  shitty: ['GO TO YOUR ROOM. AND TAKE THAT SMELL WITH YOU.', "WAIT TILL YOUR MOTHER GETS... OH. RIGHT. SHE'S DEAD."],
  nude: ['NO SON OF MINE WALKS AROUND LIKE THAT.', "MARLENE! GET MY BELT! HE'S NOT WEARING ONE."],
};

const all = (b: ByPants) => allOf(b);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [ARRIVE, REVISIT, ...Object.values(GAGS), MH_KICKED, MH_SEES, MH_ON].flatMap(all),
  [VOICES.guard]: [GUARD_STOP, GUARD_DOWN_LINES, GUARD_GROAN, GUARD_LATER].flatMap(all),
  [VOICES.dad]: [...SHOW_CALL, ...SHOW_TAKE, ...SHOW_ADLIB, ...SHOW_TV, ...[DAD_NOTICE, DAD_UP, DAD_FIGHT].flatMap(all)],
  [VOICES.mom]: [...MOM_TAPE, ...GLITCH_TAPE.mom],
  [VOICES.boy]: [...BOY_TAPE, ...GLITCH_TAPE.boy],
  [VOICES.sis]: SIS_TAPE,
  [VOICES.gramps]: [...GRAMPS_TAPE, ...GLITCH_TAPE.gramps],
};
