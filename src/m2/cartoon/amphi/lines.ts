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
// asks the Boy for another beer so he can watch the game, and he drinks real beer doing it. Specifically (the user's):
// HONK AZORIA was the VOICE of the cartoon dad; STUPID DAD LIVE! is a live-action stage recreation of the cartoon, him
// playing the character in person, no fat suit needed (a voice actor's vanity, typecast for life). Never anything about
// Meathead's age. Pure data.

import { allOf, type ByPants, type HurtTable } from '../talk';

export const VOICES = {
  guard: 'm2.cartoon.bouncer',
  dad: 'm2.cartoon.dad',
  mom: 'm2.cartoon.tvmom', boy: 'm2.cartoon.tvboy', sis: 'm2.cartoon.tvsis', gramps: 'm2.cartoon.tvgramps',
  /** The stunt coordinator, off-stage on a walkie (the clapperboard's crew: the stunt company's own voice). */
  crew: 'm2.hollywood.stuntco',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In through the gate. */
export const ARRIVE: ByPants = {
  clean: ['STUPID DAD LIVE. SHOWS DAILY. GOD HELP US.', 'A WHOLE AMPHITHEATER. FOR A SHOW THAT LASTED SIX WEEKS IN NINETY-FIVE.'],
  shitty: ["A LIVE SHOW. I'LL TAKE THE BACK ROW.", 'BLEACHERS. ALUMINUM. THEY HOSE RIGHT OFF. PERFECT.'],
  nude: ["A LIVE SHOW. I'LL BE THE ONE IN THE AISLE. NAKED.", "STUPID DAD LIVE. HE'S ABOUT TO SEE A LOT MORE LIVE."],
};
/** Back once it's all over (the land cleared). */
export const REVISIT: ByPants = {
  clean: ['EMPTY STAGE. BEST SHOW THEY EVER HAD.', 'SHOW CANCELED. AGAIN. FOR GOOD THIS TIME.'],
  shitty: ['NOBODY HERE. GOOD. NOBODY TO SMELL ME.', 'EMPTY SEATS. I COULD SHIT ANYWHERE. I ALREADY DID.'],
  nude: ['EMPTY. I COULD STREAK THE STAGE. I ALREADY DID.', 'NOBODY LEFT TO SEE MY DICK. THEIR LOSS. NOT REALLY.'],
};

/** Things he's got to say passing them (once each a visit). */
export const GAGS: Record<'beer' | 'crowd' | 'show' | 'robots', ByPants> = {
  /** The beer stand (COLD BEER, $12). */
  beer: {
    clean: ["THE BEER STAND'S THE ONLY THING HERE WITH A LINE.", 'TWELVE BUCKS FOR A BEER. YOU NEED SIX TO SIT THROUGH THIS.'],
    shitty: ["A BEER. THAT'S GOING STRAIGHT THROUGH ME. LIKE EVERYTHING.", "TWELVE BUCKS A BEER. I'M ALREADY OUT A PAIR OF PANTS."],
    nude: ['NO SHIRT, NO SHOES, NO BEER. NO JUSTICE.', 'TWELVE BUCKS A BEER AND NOWHERE TO PUT MY WALLET.'],
  },
  /** The bleachers: six people, two asleep. */
  crowd: {
    clean: ['SIX PEOPLE. TWO ASLEEP. ONE MIGHT BE DEAD.', 'HALF EMPTY. THE OTHER HALF IS SHIT-FACED.'],
    shitty: ["PLENTY OF SEATS. EVERYBODY'S ABOUT TO MOVE ANYWAY.", 'EMPTY ROWS. MY SMELL GETS ITS OWN SECTION.'],
    nude: ["A NAKED GUY IN THE AISLE AND NOBODY WAKES UP.", "A NAKED MAN AND NOBODY LOOKS UP. THAT'S HOW BAD THIS SHOW IS."],
  },
  /** The show, the first "BOY! BEER!" he hears coming down the steps. */
  show: {
    clean: ["THAT'S THE SHOW? A GUY ON A COUCH YELLING FOR BEER?", 'I SAW THIS SHOW. EVERY NIGHT. MY UNCLE PLAYED THE DAD.', "THE CARTOON DAD'S VOICE GUY? PLAYING HIM? IN PERSON?"],
    shitty: ['A FAT GUY YELLING FOR BEER. HE SHITS HIMSELF TOO. I CAN TELL.', "THAT'S A REAL BEER. AND THOSE ARE REAL PISS STAINS.", "THE CARTOON DAD'S VOICE GUY. NO COSTUME. HE JUST LOOKS LIKE THAT."],
    nude: ["HE'S IN HIS UNDERWEAR. I'M STILL LESS DRESSED.", "THAT'S THE SHOW? I'M MORE ENTERTAINING NAKED IN A PARKING LOT.", "THE CARTOON DAD'S VOICE GUY. LIVE. HE SHOULD'VE STAYED A VOICE."],
  },
  /** The family, up close from the pit: cheap animatronics. */
  robots: {
    clean: ["THE WHOLE FAMILY'S ROBOTS. CHEAP ROBOTS.", "THE KID'S ON A TRACK. FINALLY, A RIDE WITH A TRACK. IT'S A ROBOT."],
    shitty: ['ROBOT FAMILY. AT LEAST THEY CAN\'T SMELL ME.', 'THE MOM IS A ROBOT. SHE STILL LOOKS DISGUSTED. GOOD WORK, ROBOT.'],
    nude: ['ROBOT FAMILY. DEAD EYES. NOBODY JUDGES THE DICK.', "THE GRANDPA ROBOT'S LOOKING RIGHT AT MY DICK."],
  },
};

/** The guard down, the way open (the boss door's line). */
export const MH_KICKED: ByPants = {
  clean: ['BEST DOOR I EVER KICKED.', "DOOR'S OPEN. NUTS ARE CLOSED."],
  shitty: ['THERE. NOW WE BOTH HAD A BAD DAY.', 'SORRY, PAL. YOUR NUTS, MY PANTS. WE BOTH LOST.'],
  nude: ['SKIN ON SKIN. WE BOTH FELT THAT.', 'A NAKED KICK. HE SAW EVERYTHING ON THE WAY UP.'],
};
/** STUPID DAD's mistaken him for the Boy. */
export const MH_SEES: ByPants = {
  clean: ["I'M NOT YOUR KID, GRANDPA.", "YOUR FAMILY'S A BUNCH OF ROBOTS, MAN. AND YOU'RE DRUNK."],
  shitty: ["I'M NOT YOUR KID. BUT YES. I SHIT MYSELF.", 'I CAN SMELL YOUR BREATH OVER MY PANTS. CONGRATULATIONS.'],
  nude: ["I'M NOT YOUR KID. AND THESE AREN'T PANTS.", 'EYES ON THE GAME, GRANDPA. NOT THE BALLS.'],
};
/** Last word before it's on. */
export const MH_ON: ByPants = {
  clean: ['SIT DOWN BEFORE YOU BREAK A HIP.', "FINE. LET'S GO, DAD. I GOT DADDY ISSUES ANYWAY."],
  shitty: ['COME ON, OLD MAN. WE BOTH SMELL.', "LET'S GO. LOSER LICKS THE COUCH."],
  nude: ["LET'S GO, GRANDPA. EYES UP HERE.", 'COME ON, GRANDPA. LAST THING YOU SEE IS MY DICK.'],
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
  clean: ['MY... NUTS...', 'OH GOD. RIGHT IN THE PLUMS. OH GOD.'],
  shitty: ['MY NUTS... AND NOW I CAN SMELL YOU...', "MY NUTS... AND NOW I'M DOWN HERE AT ASS LEVEL..."],
  nude: ['I SAW HIS SWING... THEN I FELT MINE...', 'KICKED IN THE NUTS... BY A NAKED GUY...'],
};
/** Lying there, now and then, as he goes by (only fresh lines). */
export const GUARD_GROAN: ByPants = {
  clean: ['STILL... HURTS...', "I'M GONNA PUKE.", 'WHY THE NUTS, MAN? I GOT A KID ON THE WAY.'],
  shitty: ['DO NOT STEP OVER ME. NOT IN THOSE PANTS.', 'I CAN TASTE YOU... OH GOD, I CAN TASTE YOU...'],
  nude: ['DO NOT STEP OVER ME. NOT NAKED. PLEASE.', 'I CAN STILL SEE IT SWING WHEN I CLOSE MY EYES.'],
};
/** ...on a later visit (the land cleared): somebody gave him an ice pack. */
export const GUARD_LATER: ByPants = {
  clean: ['THEY GAVE ME AN ICE PACK. THAT IS IT.', "STILL HERE. ONE NUT'S UP IN MY STOMACH NOW."],
  shitty: ['YOU AGAIN. AND THE SMELL AGAIN.', 'STAY AWAY FROM MY NUTS. AND MY NOSE. AND ME.'],
  nude: ['YOU AGAIN. STILL NAKED. STILL NO.', 'KEEP YOUR NUTS AWAY FROM MY ICE PACK. GET YOUR OWN.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The show (STUPID DAD, before he's seen him; the family's tapes)

/** Calling the Boy (the user's line first). */
export const SHOW_CALL = ['BOY! GET ME ANOTHER BEER!', 'BOY! BEER!', 'BOY! ANOTHER COLD ONE!', "BOY! THIS ONE'S EMPTY!", "BOY! BEER! THE GAME'S ON!"];
/** Handed it. */
export const SHOW_TAKE = ['ATTABOY.', "THAT'S MY BOY.", 'COLD. GOOD. NOW SCRAM.'];
/** Out of character, mumbled to nobody: the sad part. */
export const SHOW_ADLIB = [
  "MARLENE. THAT'S YOUR LINE, SWEETHEART.",
  "HAL WOULD'VE LAUGHED AT THAT ONE.",
  'SAME COUCH SINCE NINETY-FIVE. SAME STAIN TOO.',
  "THEY'RE ALL GONE. EVERY ONE OF THEM.",
  "THAT'S REAL BEER, FOLKS. DON'T TELL THE PARK.",
  'TWO MORE SHOWS. THEN THE GOOD STUFF. THE JIM BEAM.',
  "NO ANNOUNCER. BUDGET. I'M HONK AZORIA. I WAS HIS VOICE. NOW I'M HIM.",
  'NO FAT SUIT, FOLKS. I GREW INTO THE PART.',
  'I USED TO DO THIS IN A BOOTH. NOBODY COULD SEE ME DRINK.',
  "I DID SHAKESPEARE ONCE. NOW IT'S 'BOY! BEER!' TILL I DIE.",
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
  shitty: ['BOY? DID YOU SHIT YOURSELF AGAIN?', 'SOMETHING DIED. MARLENE, CHECK GRAMPS.'],
  nude: ["BOY! PANTS! YOUR MOTHER'S RIGHT THERE!", 'A NAKED GUY ON MY SET. LIKE THE WRAP PARTY IN NINETY-FIVE.'],
};
/** Getting up off the couch (it takes a while). */
export const DAD_UP: ByPants = {
  clean: ['THAT IS IT. NOBODY INTERRUPTS THE GAME.', 'THIRTY YEARS ON THIS COUCH. MY ASS IS PART OF IT NOW.'],
  shitty: ["THIS IS WHY WE DON'T HAVE GUESTS. OR FRIENDS.", 'YOU STINK UP MY LIVING ROOM, I STINK UP YOUR FACE.'],
  nude: ['YOU WALK ON MY SET WITH YOUR WANG OUT?', "PUT IT AWAY. MY ROBOTS GOT BIGGER ONES. AND THEY'RE ROBOTS."],
};
/** Up, the can crushed: the threat. */
export const DAD_FIGHT: ByPants = {
  clean: ['MARLENE! GET MY BELT!', "DAD'S GONNA TEACH YOU A LESSON. AFTER THIS BEER. AND THE NEXT ONE."],
  shitty: ['GO TO YOUR ROOM. AND TAKE THAT SMELL WITH YOU.', "WAIT TILL YOUR MOTHER GETS... OH. RIGHT. SHE'S DEAD."],
  nude: ["NO SON OF MINE WALKS AROUND WITH IT HANGING OUT. THAT'S MY JOB.", "MARLENE! GET MY BELT! HE'S NOT WEARING ONE."],
};

/** He drags the couch up front and drops back onto it (the intro's last beat, him to the room). */
export const DAD_SETTLE: ByPants = {
  clean: ["AH. THAT'S BETTER. NOW GET OFF MY SET.", 'DAD FIGHTS SITTING DOWN.'],
  shitty: ["DAD FIGHTS SITTING DOWN. YOU CAN'T. I CAN TELL.", "I SIT. YOU STINK. THAT'S THE WHOLE SHOW. IT RAN SIX WEEKS."],
  nude: ["DAD FIGHTS SITTING DOWN. EYE LEVEL WITH... OH GOD.", "I'M SITTING. YOUR DICK'S AT EYE LEVEL. MOVE."],
};

// ---------------------------------------------------------------------------------------------------------------
// THE FIGHT (fight.ts): STUPID DAD on his couch, drunk, the stolen mallet by him, yelling at his family for beer.
// Everything he says is by pants (he's seen him). The family's tapes don't react to Meathead: one pool each.

/** Screaming at the family for a beer (the whole fight). */
/** Yelling for a beer, at whoever's going to get it (the user's: "make sure the callouts match": the runner's picked
 *  first, his line from that one's own pool). */
export const DAD_BEER_FOR: Record<'mom' | 'boy' | 'sis' | 'gramps', ByPants> = {
  mom: {
    clean: ['MARLENE! BEER! THERE\'S A FAN IN THE HOUSE!', 'MARLENE! BEER! MOVE YOUR FAT ASS!', 'MARLENE! A BEER! YOU HAD ONE JOB!'],
    shitty: ['MARLENE! BEER! THE GUEST SHIT HIMSELF!', 'MARLENE! BEER! AND THE FEBREZE!'],
    nude: ['MARLENE! BEER! AND A TOWEL FOR THE NAKED GUY!', "MARLENE! BEER! QUIT LOOKING AT HIS THING! IT'S SMALLER THAN MINE!"],
  },
  boy: {
    clean: ['BOY! BEER! I\'M BEING ATTACKED HERE!', 'BOY! BEER! MOVE IT, YOU TIN SHIT!', 'BOY! GET YOUR OLD MAN A BEER!'],
    shitty: ['BOY! TWO BEERS! ONE TO DRINK, ONE TO POUR ON HIM!', "BOY! BEER! DON'T STEP IN HIM!"],
    nude: ['BOY! BEER! DON\'T LOOK AT HIM, JUST BRING IT!', 'BOY! BEER! EYES ON THE FRIDGE!'],
  },
  sis: {
    clean: ['SIS! BEER! AND QUIT LOOKING AT ME LIKE THAT!', "SIS! BEER! YOU'RE GROUNDED! FOREVER! YOU'RE DEAD!", 'SIS! A BEER! AND NO LIP!'],
    shitty: ['SIS! BEER! BREATHE THROUGH YOUR MOUTH!', 'SIS! BEER! AND A CLOTHESPIN FOR YOUR NOSE!'],
    nude: ['SIS! BEER! AND COVER YOUR EYES!', 'SIS! BEER! LOOK AT THE FLOOR!'],
  },
  gramps: {
    clean: ['GRAMPS! BEER! YOU\'RE CLOSEST TO DEATH, MAKE YOURSELF USEFUL!', "GRAMPS! BEER! YOU'RE NOT DEAD, I CAN SEE YOU TWITCHING!", 'GRAMPS! A BEER! BEFORE YOU DIE!'],
    shitty: ['GRAMPS! BEER! HE SMELLS WORSE THAN YOU!', "GRAMPS! BEER! YOU LOST YOUR NOSE IN KOREA, YOU'RE FINE!"],
    nude: ['GRAMPS! BEER! AND PUT YOUR TEETH IN, THERE\'S A NAKED GUY!', 'GRAMPS! BEER! YOU SEEN WORSE. IN THE WAR.'],
  },
};
/** ...nobody in particular (spare). */
export const DAD_BEER: ByPants = {
  clean: ['SOMEBODY GET ME A BEER BEFORE I SOBER UP!'],
  shitty: ['BEER! IF I GET DRUNK ENOUGH I CAN\'T SMELL HIM!', 'BEER! SOMETHING CRAWLED UP HIS ASS AND DIED!'],
  nude: ['BEER! I GOTTA DRINK THAT DICK OUT OF MY MEMORY!', 'BEER! A NAKED MAN IN MY LIVING ROOM! BEER!'],
};
/** Snark at the family (the sitcom: everybody mean to everybody, in the living room, forever). */
export const DAD_SNIPE: ByPants = {
  clean: [
    'SIS, YOU\'RE THE REASON I DRINK.', 'GRAMPS, DIE ALREADY. I WANT THE RECLINER.', 'MARLENE, THAT CASSEROLE\'S OLDER THAN THE BOY.',
    "BOY, YOU'RE ON A TRACK. YOU'RE THE ONLY ONE IN THIS FAMILY GOING ANYWHERE.",
  ],
  shitty: [
    'MARLENE, THE GUEST SHIT HIMSELF. CLEAN IT. IT\'S YOUR JOB.', "SIS, QUIT GAGGING. YOU'LL WRECK YOUR SERVOS.",
    "GRAMPS, YOU SMELL HIM TOO? NO? YOU'RE DEAD OUTSIDE TOO.",
  ],
  nude: [
    'MARLENE, QUIT LOOKING AT THE NAKED GUY.', "SIS, EYES ON THE TV. THE GAME'S ON.", "GRAMPS, PUT YOUR TEETH BACK IN. YOU'RE SCARING THE NAKED GUY.",
  ],
};
/** ...and the tape fires back (the dead actors' voices; the laugh track after). */
export const MOM_SNARK = ['MAYBE IF YOU GOT OFF THE COUCH, DEAR!', 'I MARRIED YOU FOR YOUR MONEY. JOKE\'S ON ME!'];
export const BOY_SNARK = ['MAYBE GET A REAL JOB, POP!', 'SURE THING, LOSER! I MEAN POP!'];
export const SIS_SNARK = ['I WISH I WAS ADOPTED!', 'YOU\'RE SO EMBARRASSING!'];
export const GRAMPS_SNARK = ['I SHOULD\'VE LEFT YOU AT THE HOSPITAL!', 'IN MY DAY, DADS WORKED!'];
/** The dig (the user's: a nice house on a clothing-store manager's pay, the wife at home: Al Bundy). */
export const DAD_BUNDY: ByPants = {
  clean: ['I MANAGE A CLOTHING STORE. FOUR BEDROOMS. DON\'T ASK.', 'MARLENE DOESN\'T WORK. I SELL SLACKS. WE GOT A SUNROOM.', 'A POOL, TWO CARS, ONE CLOTHING STORE SALARY. TV MATH.'],
  shitty: ['I MANAGE A CLOTHING STORE. I GOT PANTS IN YOUR SIZE. AND A HOSE.', 'I SELL PANTS FOR A LIVING. YOU NEED SOME. AND A PRIEST.'],
  nude: ['I MANAGE A CLOTHING STORE AND YOU SHOW UP NAKED? INSULTING.', "I SELL PANTS, KID. FORTY PERCENT OFF. I'M BEGGING YOU."],
};
/** Too close: the mallet. */
export const DAD_SWAT: ByPants = {
  clean: ['BACK OFF, FAN!', 'NO AUTOGRAPHS!', 'OFF MY SET, YOU FAT FUCK!'],
  shitty: ['GET YOUR STINK OFF MY SET!', 'BACK! YOU SMELL LIKE THE BLEACHERS AFTER CHILI NIGHT!'],
  nude: ['PUT IT AWAY AND BACK OFF!', 'NO NAKED FANS! NOT SINCE THE INCIDENT!'],
};
/** A bottle caught (one at last). */
export const DAD_CATCH: ByPants = {
  clean: ['NOW THAT\'S PARENTING.', 'COLD. FINALLY. ATTA ROBOT.', 'ATTA... WHOEVER YOU ARE.'],
  shitty: ["BEER. NOW I'M TOO DRUNK TO SMELL YOU. ALMOST.", 'FINALLY. NOW I CAN\'T SMELL YOU.'],
  nude: ['BEER. NOW YOU LOOK BETTER. NOT MUCH.', "TEN BEERS IN AND YOU'RE STILL UGLY NAKED."],
};
/** A bottle missed him (most do). */
export const DAD_MISS: ByPants = {
  clean: ['YOU THROW LIKE YOUR MOTHER!', 'MY HANDS ARE RIGHT HERE, YOU DUMB TOASTER!', 'THAT WAS A GOOD BEER!'],
  shitty: ['CLOSER! THROW IT AT THE SMELLY ONE!', 'MISSED! HIT THE TURD BURGLAR NEXT TIME!'],
  nude: ['MISSED! HIT THE NAKED ONE! IN THE BALLS!', 'AIM FOR HIS WANG, NOT MY FLOOR!'],
};
/** ...off his head. */
export const DAD_BONK: ByPants = {
  clean: ['OW! MY HEAD! THAT WAS FULL!', 'IN THE HEAD? I\'M YOUR FATHER!'],
  shitty: ['OW! SECOND WORST THING TODAY. SHIT PANTS THERE IS FIRST.', 'OW! THROW IT AT THE POOPY GUY!'],
  nude: ['OW! THROW IT AT THE NAKED GUY!', 'OW! I SAW STARS. AND A LITTLE WANG.'],
};
/** The beer coming back up (the couch takes off). */
export const DAD_PUKE: ByPants = {
  clean: ['OH NO. THAT ONE WAS SKUNKED. HERE IT COMES.', 'HURK. HERE COMES THE BACK NINE.'],
  shitty: ['YOU SMELL SO BAD I... HURK!', 'YOUR SMELL AND MY BEER. HURK!'],
  nude: ['I CAN SEE YOUR... HURK!', "IT'S SO SMALL I... HURK!"],
};
/** The drunken rage (the mallet up, Donkey Kong). */
export const DAD_RAGE: ByPants = {
  clean: ['THAT\'S IT! DAD\'S GOT THE HAMMER!', "WHO WANTS SOME? DAD'S GOT A HAMMER AND A BUZZ!"],
  shitty: ['C\'MERE, STINKY! DAD\'S GOT A HAMMER!', "I'LL HAMMER THE SHIT OUTTA YOU! OH. IT'S ALREADY OUT."],
  nude: ['I\'M GONNA HAMMER THAT THING FLAT!', "NAKED? I'LL HAMMER THAT LITTLE NAIL!"],
};
/** ...worn out: back to the couch. */
export const DAD_TIRED: ByPants = {
  clean: ['OKAY. OKAY. DAD\'S GOTTA SIT.', "MY HEART. MY HEART'S GOING. I SEE MARLENE."],
  shitty: ['I\'M WINDED. AND YOU STILL STINK.', 'GOTTA SIT. MY ASS MISSES THE COUCH.'],
  nude: ["I'M OUT OF BREATH AND YOUR DICK'S STILL OUT.", 'GOTTA SIT. CAN\'T LOOK AT THAT STANDING UP.'],
};
/** Hit (now and then). */
export const DAD_HURT: ByPants = {
  clean: ['OW! MY BACK!', "THAT'S GONNA BRUISE! I'M ON BLOOD THINNERS!", 'HEY! I\'M SEVENTY-FOUR!', 'NOT THE THROAT! THAT\'S THE VOICE!'],
  shitty: ['DON\'T TOUCH ME WITH THOSE HANDS!', 'OW! YOU GOT YOUR SHIT ON MY BEER SHIRT!', 'WATCH THE THROAT! THAT VOICE PAYS MY BAR TAB!'],
  nude: ["OW! DON'T HIT ME WITH YOUR BALLS OUT!", 'OW! SOMETHING SLAPPED ME. I HOPE IT WAS A HAND.', 'NOT THE THROAT, YOU NAKED FREAK! I NEED THAT!'],
};
/** A family member flattened by a stunt car: more baffled, more fed up, every time (by index: kills 1, 2, 3; the couch
 *  (the 5th car, crushCouch); 4, that's everybody). */
export const DAD_KILL: ByPants[] = [
  {
    clean: ['WHAT THE HELL? WHERE\'D THAT CAR COME FROM?', 'WHO THE HELL PARKED ON MY FAMILY?'],
    shitty: ['A CAR? ON MY FAMILY? IS THAT YOU? IT SMELLS LIKE YOU.', 'A CAR? ON MARLENE? AND WHAT IS THAT SMELL?'],
    nude: ['A CAR? FROM WHERE? FROM YOUR... NO.', 'WHO PARKED ON MY FAMILY? WAS IT THE NAKED GUY?'],
  },
  {
    clean: ['TWO! WHO KEEPS PARKING ON MY FAMILY?!', 'AGAIN? THOSE ROBOTS COST NINETY BUCKS! EACH!'],
    shitty: ['ANOTHER ONE? QUIT IT, YOU SMELLY BASTARD!', 'TWO! AND THE SMELL STAYS! WHY DOES THE SMELL STAY?'],
    nude: ['ANOTHER ONE? YOU NAKED LUNATIC!', 'QUIT IT! PUT ON PANTS AND QUIT KILLING MY FAMILY!'],
  },
  {
    clean: ["THREE! THAT'S THREE! I'M RUNNING OUT OF FAMILY!", "THREE! I CAN'T AFFORD ANOTHER WIFE! OR KID! WHATEVER THAT ONE WAS!"],
    shitty: ['THREE! AND EVERY TIME, THAT SMELL GETS CLOSER!', 'ANOTHER ONE! YOU SHIT YOURSELF AND YOU STILL PARK BETTER THAN ME!'],
    nude: ["THREE! IN FRONT OF A NAKED GUY! THEY DIDN'T EVEN GET DIGNITY!", 'ANOTHER ONE! PUT SOMETHING ON AND STOP KILLING!'],
  },
  {
    clean: ['MY COUCH! NOT THE COUCH!', 'THAT COUCH WAS IN THE PILOT! I LOST MY VIRGINITY ON THAT COUCH!'],
    shitty: ['MY COUCH! NOW IT SMELLS WORSE THAN YOU!', 'THE COUCH! YOU SMELLY SON OF A BITCH!'],
    nude: ['MY COUCH! YOU NAKED MONSTER!', 'THE COUCH! WHERE DO I SIT NOW? NOT WHERE YOU SAT!'],
  },
  {
    clean: ['THAT WAS THE LAST ONE. I GOT NOBODY.', "THAT'S EVERYBODY. AGAIN. LIKE THE NINETIES."],
    shitty: ['THAT\'S EVERYBODY. JUST ME AND THE SMELL NOW.', 'ALL GONE. AND YOU\'RE STILL HERE. STINKING.'],
    nude: ['ALL GONE. JUST ME. AND A NAKED GUY.', 'NOBODY LEFT. JUST ME AND A NAKED GUY. LIKE THE WRAP PARTY.'],
  },
];
/** No couch, no family: stood up, pathetic, falling over. */
export const DAD_PATHETIC: ByPants = {
  clean: ['HOLD STILL. I\'LL GET YOU. GIMME A SEC.', "WHERE'S MY COUCH? WHO TILTED THE FLOOR?", 'I CAN\'T FEEL MY LEGS. NEVER COULD.'],
  shitty: ['I\'LL GET YOU, STINKY. ONCE THE ROOM STOPS.', "THE SMELL'S GOT ME DIZZIER THAN THE JIM BEAM."],
  nude: ['STAND STILL, NAKED. THERE\'S TWO OF YOU.', "WHY'S THE NAKED GUY SPINNING? WHY'S HIS DICK SPINNING?"],
};
/** ...trying to lift the mallet and not. */
export const DAD_HEAVY: ByPants = {
  clean: ['THIS USED TO BE LIGHTER.', 'HOO. GIMME A MINUTE. GIMME A BEER.'],
  shitty: ['TOO HEAVY. LIKE YOUR PANTS. HEAVY AND BROWN.', 'CAN\'T LIFT IT. CAN\'T BREATHE NEAR YOU EITHER.'],
  nude: ['TOO HEAVY. LIKE YOUR BALLS. NO. LIGHTER THAN YOUR BALLS.', 'I CAN\'T LIFT IT. YOU CAN\'T COVER IT. WE\'RE EVEN.'],
};
/** Sat there, at him, now and then. */
export const DAD_TAUNT: ByPants = {
  clean: ['SIT DOWN. YOU\'RE BLOCKING THE GAME.', "COMMERCIAL'S OVER, KID. BEAT IT BEFORE I BEAT YOU.", "THIS IS A FAMILY SHOW. MY FAMILY'S ROBOTS. STILL COUNTS.", 'YOU WANT THE VOICE? \'BOY! BEER!\' THERE. NOW BEAT IT.'],
  shitty: ['YOU\'RE STINKING UP A FAMILY SHOW!', 'NOBODY SAID THIS WAS SMELL-O-VISION, SHIT BOY.', 'THIRTY YEARS DOING THE VOICE. NEVER SMELLED A FAN LIKE YOU.'],
  nude: ['THIS IS A FAMILY SHOW! PUT IT AWAY!', "THE NETWORK'S GONNA PULL US. AGAIN. THERE IS NO NETWORK.", 'I DID THIS IN A BOOTH FOR YEARS. NOBODY EVER SHOWED UP NAKED.'],
};
/** Low. */
export const DAD_LOW: ByPants = {
  clean: ['I NEED A BEER. A BIG ONE. AN IV OF IT.', 'I SEE THE CAST. THEY\'RE WAVING.', 'THEY\'LL PUT \'BOY! BEER!\' ON MY STONE.'],
  shitty: ['I\'M DYING AND IT SMELLS LIKE YOUR PANTS.', "I CAN'T DIE SMELLING THIS. I WANT TO DIE SMELLING BEER."],
  nude: ['IF I DIE, THE LAST THING I SAW WAS THAT.', 'I SEE A LIGHT. NO. IT\'S YOUR ASS.'],
};
/** A retry: straight back on (him already on the couch). */
export const DAD_ENTRANCE: ByPants = {
  clean: ['BACK? SIT DOWN. THE GAME\'S ON.', "YOU AGAIN? MARLENE, LOCK THE DOOR. MARLENE'S DEAD. RIGHT."],
  shitty: ['BACK? AND YOU STILL STINK.', "OH GOD, HE'S BACK. AND HE BROUGHT HIS ASS."],
  nude: ['BACK. STILL NAKED. MARLENE, THE BELT.', "YOU AGAIN? I SELL PANTS. I'LL GIVE YOU A DISCOUNT."],
};
/** A grab at him: TOO GREASY (forty years of beer sweat). */
export const DAD_GRABBED: ByPants = {
  clean: ['HANDS OFF! I\'M BASTED IN BEER!', 'NOBODY TOUCHES DAD! NOT SINCE NINETY-SIX!'],
  shitty: ['DON\'T GRAB ME WITH THOSE HANDS!', 'GET YOUR SHIT HANDS OFF MY BEER SWEAT!'],
  nude: ['DON\'T HUG ME NAKED!', 'NO NAKED HUGS! I GOT ENOUGH PROBLEMS!'],
};
/** The last stunt car coming at him (stood up, nobody left). */
export const DAD_SEES_CAR: ByPants = {
  clean: ['OH, COME ON.', 'NOT ON ME. NOT ON MY GOOD SIDE...'],
  shitty: ['OH, COME ON. AT LEAST IT\'LL KILL THE SMELL.', 'A CAR? FINE. ANYTHING TO GET AWAY FROM YOUR ASS.'],
  nude: ['OH, COME ON. LAST THING I SEE IS HIS WANG AND A CAR.', 'A CAR? FINE. BETTER THAN LOOKING AT YOUR DICK.'],
};
/** The standard death: he gets up for a beer himself (the fridge overloaded: SWILL LITE buries him). */
export const DAD_FRIDGE: ByPants = {
  clean: ['FINE. I\'LL GET IT MYSELF.', 'IF YOU WANT A BEER DONE RIGHT...'],
  shitty: ['FINE. I\'LL GET IT. YOU\'D ONLY SHIT ON IT.', "I'LL GET MY OWN BEER. YOU'D JUST SHIT IN IT."],
  nude: ['FINE. I\'LL GET IT. DON\'T FOLLOW ME NAKED.', "I'LL GET MY OWN. YOU STAY THERE AND BE NAKED."],
};
/** The fridge rocking: he looks up at it. */
export const DAD_WOBBLE: ByPants = {
  clean: ['UH OH.', 'EASY, BIG GREEN. DADDY LOVES YOU.', 'NO. NO NO NO.'],
  shitty: ['UH OH. NOW I KNOW HOW YOUR PANTS FEEL.', "NO NO NO. DON'T YOU DARE, FRIDGE. I PAID YOU OFF."],
  nude: ["UH OH. DON'T JUST STAND THERE NAKED. CATCH IT.", 'NO NO NO. NOT IN FRONT OF THE NAKED GUY.'],
};
/** ...from under the fridge, flat (and he shits himself). */
export const DAD_CRUSHED: ByPants = {
  clean: ['...STILL COLD. AND I SHIT MYSELF.', '...THIRTY YEARS I FILLED THAT FRIDGE. I SHIT MYSELF.'],
  shitty: ['...NOW I SHIT MYSELF. WE MATCH.', "...I SHIT MYSELF. DON'T SAY IT. YOU OF ALL PEOPLE."],
  nude: ['...I SHIT MYSELF. AT LEAST I GOT SHORTS.', '...I SHIT MYSELF. STILL GOT MORE CLOTHES THAN YOU.'],
};
/** The weakness death: flattened under the last stunt car, like a cartoon. */
export const DAD_FLAT: ByPants = {
  clean: ['...I\'M FLAT. LIKE THE RATINGS.', '...SOMEBODY ROLL ME UP. SMOKE ME.'],
  shitty: ['...FLAT. AND I CAN STILL SMELL YOUR ASS.', '...FLAT AS A PANCAKE. A SHITTY ONE.'],
  nude: ['...FLAT. AND YOU\'RE STILL NAKED.', '...ROLL ME UP. USE ME AS PANTS.'],
};

/** The family's tapes in the fight: off to the fridge; flattened (the tape dragging, dying). One pool each. */
export const FETCH_TAPE: Record<'mom' | 'boy' | 'sis' | 'gramps', string[]> = {
  mom: ['ONE COLD ONE, DEAR!', 'HERE YOU GO, HONEY!'],
  boy: BOY_TAPE,
  sis: ['UGH. CATCH.', 'FINE. WHATEVER.'],
  gramps: ["IN MY DAY WE THREW 'EM!", 'HEADS UP, SONNY!'],
};
export const DIE_TAPE: Record<'mom' | 'boy' | 'sis' | 'gramps', string[]> = {
  mom: ['OH, HO-HO-HONEEEY...', "DINNER'S IN THE OV-V-V..."],
  boy: ['SURE THING, P-P-P...', 'HERE YA GO, P...'],
  sis: ['DA-A-A-AD...', 'GRO-O-O-OSS...'],
  gramps: ['IN MY DAAAAY...', "WHAT'S EVERYBODY YEL-L-L..."],
};

/** Meathead in the fight. */
export const MH_HINT: ByPants = {
  clean: ['HIS WHOLE FAMILY\'S JUST STANDING THERE. I GOT A CLAPPERBOARD.', "STUNT CARS AND A ROBOT FAMILY. LET'S DO SOME PARKING.", 'SNAP THE CLAPPERBOARD. SEE WHO GETS PARKED ON.'],
  shitty: ['I SHIT MY PANTS AND HE\'S STILL WINNING. CLAPPERBOARD TIME.', "CLAPPERBOARD. ROBOTS. LET'S MAKE THIS SHOW EVEN SHITTIER."],
  nude: ['NAKED, BROKE, AND HOLDING A CLAPPERBOARD. ACTION, MOTHERFUCKER.', 'HIS FAMILY\'S PARKED RIGHT THERE. LET\'S PARK ON THEM.'],
};
export const MH_TOO_GREASY: ByPants = {
  clean: ['HE\'S ALL BEER SWEAT!', 'LIKE GRABBING A BRATWURST IN A KIDDIE POOL OF BUD LIGHT!', 'TOO GREASY! HE\'S MARINATED!'],
  shitty: ['HE\'S SLIMIER THAN MY PANTS!', "GREASY! AND I'M THE GUY WITH SHIT IN HIS PANTS!"],
  nude: ['NAKED GRAB! BAD IDEA! SO MUCH SWEAT!', 'NAKED SKIN ON OLD MAN BEER SWEAT! I NEED A SHOWER IN BLEACH!'],
};
export const MH_PUKE: ByPants = {
  clean: ['HE PUKED SO HARD THE COUCH TOOK OFF!', 'A PUKE-POWERED LA-Z-BOY! SCIENCE!'],
  shitty: ['HE BLEW CHUNKS. I BLEW MY PANTS. WE\'RE EVEN.', "PUKE-POWERED COUCH! SHIT-POWERED PANTS! WE'RE BOTH ROCKETS!"],
  nude: ['NOT ON MY BARE ASS! NOT ON MY BARE ASS!', "HE'S PUKING AND I'M NAKED. THIS IS MY HELL."],
};
export const MH_RAGE: ByPants = {
  clean: ['DONKEY KONG DAD!', "HE'S SEVENTY-FOUR AND HOPPING WITH A HAMMER!"],
  shitty: ['HAMMER TIME. MY PANTS ALREADY KNEW.', 'RUN! WADDLE! SQUISH! RUN!'],
  nude: ["A HAMMER AND MY BALLS OUT. THAT'S A NAIL HE CAN'T MISS.", 'NAKED DONKEY KONG! WRONG GAME!'],
};
export const MH_BUNDY: ByPants = {
  clean: ['HE SELLS PANTS. FOUR BEDROOMS. TV MATH.'],
  shitty: ['HE SELLS PANTS? I\'M A CUSTOMER. NOW.'],
  nude: ['HE SELLS CLOTHES? I\'LL TAKE ONE OF EVERYTHING.'],
};
export const MH_KILL: ByPants = {
  clean: ['CUT! PRINT IT!', 'THAT\'S A WRAP.', 'RECAST THAT ONE. WITH A CHEAPER ROBOT.'],
  shitty: ['PARKED ON. FLAT AS MY ASS FEELS.', 'BLOWN UP. SAME AS MY PANTS.'],
  nude: ['SCENE. TAKE A BOW.', 'CUT! MY DICK GETS TOP BILLING.'],
};
export const MH_COUCH: ByPants = {
  clean: ['THERE GOES THE COUCH.', 'NOW YOU GOTTA STAND, DAD. FIRST TIME SINCE CLINTON.'],
  shitty: ['COUCH IS TOAST. NOBODY SITS WHERE I\'VE BEEN ANYWAY.', 'UP YOU GET. WE BOTH LOST SOMETHING TODAY.'],
  nude: ['NO COUCH. YOUR ASS HAS NOWHERE TO HIDE. LIKE MINE.', 'UP YOU GET. LOOK AT ME. I\'M UP.'],
};
/** The clapperboard snapped before the scene's reset (its recharge in the fight). */
export const MH_DUD: ByPants = {
  clean: ['SCENE\'S NOT RESET YET.', "THEY'RE STILL HOSING THE LAST ROBOT OFF THE BUMPER."],
  shitty: ['NO CAR YET. JUST ME AND MY PANTS.', 'STILL RESETTING. HURRY. MY PANTS ARE RESETTING TOO.'],
  nude: ['NO CAR YET. JUST A NAKED GUY CLAPPING.', 'STILL RESETTING. I\'M STANDING HERE NAKED.'],
};
export const MH_WON_WEAK: ByPants = {
  clean: ['THAT\'S A WRAP, DAD.', 'CANCELED. AGAIN. NO SEASON TWO.'],
  shitty: ['FLATTENED. I KNOW THE FEELING. IN MY PANTS.', 'FLAT. LIKE A SHIT I STEPPED ON.'],
  nude: ['FLATTER THAN ME. AND I\'M NAKED.', 'PANCAKE DAD. NO SYRUP. JUST BEER.'],
};
export const MH_WON: ByPants = {
  clean: ['CRUSHED BY HIS OWN FRIDGE. COLD.', 'HE GOT HIS OWN BEER. THIRTY YEARS. FIRST TIME.', "COLD ONE\'S ON ME, DAD."],
  shitty: ['HE SHIT HIMSELF UNDER THERE. WELCOME TO THE CLUB.', 'FLAT UNDER A FRIDGE. IT SMELLS LIKE HIM NOW. NOT ME.'],
  nude: ["CRUSHED BY A FRIDGE. I\'LL TAKE THE BEER. NOT THE SHORTS.", "A COLD ONE AND NO PANTS. THIS IS HOW I'D WANT TO GO TOO."],
};

/** The clapperboard snapped while the scene's resetting (its cooldown in the fight): the stunt coordinator on the
 *  walkie, with why the next car isn't ready (the user's: "like 'the new drivers are slow as shit'"). */
export const CREW_EXCUSE = [
  'THE NEW DRIVERS ARE SLOW AS SHIT.', 'CREW\'S ON UNION BREAK. FIFTEEN MINUTES.', 'WE\'RE LOOKING FOR A CAR THAT STILL RUNS.',
  'LAST DRIVER QUIT. WE\'RE CALLING HIS COUSIN.', 'INSURANCE WANTS ANOTHER FORM SIGNED.', 'HOLD ON. THE STUNTMAN\'S THROWING UP.',
  'SOMEBODY PARKED IN FRONT OF THE RAMP.', 'THE NEW GUY CAN\'T DRIVE STICK.',
];
/** One of the animatronic family ate his shot (they're only hurt by the stunt cars): the user's line, and similar. */
export const MH_BLOCKED: ByPants = {
  clean: ['WHAT KIND OF BULLSHIT TITANIUM ARE THESE ROBOTS BUILT WITH?', "THE ROBOT ATE MY BULLET! THE ROBOT DIDN'T EVEN BLINK!", 'MOVE, TIN FAMILY! I GOT A CLEAR SHOT AT DAD!'],
  shitty: ['WHAT KIND OF BULLSHIT TITANIUM ARE THESE ROBOTS BUILT WITH?', 'BULLETPROOF ROBOTS. NINETY BUCKS EACH. MY ASS.', 'THE TIN FAMILY ATE MY SHOT. AND I STILL SMELL.'],
  nude: ['WHAT KIND OF BULLSHIT TITANIUM ARE THESE ROBOTS BUILT WITH?', "BULLETPROOF ROBOTS, AND I'M THE ONE NAKED."],
};
/** The same gripe, naming the one that ate it (fight.ts picks these for whichever of them he just shot). */
export const MH_BLOCKED_BY: Record<'mom' | 'boy' | 'sis' | 'gramps', ByPants> = {
  mom: {
    clean: ['A BULLETPROOF ROBOT MOM? THE PENTAGON SHOULD BUY THESE.', 'MOVE, ROBOT MOM!'],
    shitty: ["A BULLETPROOF ROBOT MOM. SHE DOESN'T EVEN FLINCH AT THE SMELL."],
    nude: ["ROBOT MOM ATE MY SHOT. SHE DIDN'T EVEN LOOK DOWN."],
  },
  gramps: {
    clean: ['WHO BUILDS A SITCOM GRANDPA OUT OF TANK ARMOR?', 'OUT OF THE WAY, ROBOT GRAMPS!'],
    shitty: ['ROBOT GRAMPS IS BULLETPROOF. AND HE SMELLS WORSE THAN ME.'],
    nude: ['THE ROBOT ATE MY SHOT. AND GRAMPS IS STARING AT MY DICK.'],
  },
  boy: {
    clean: ['THE ROBOT KID ATE MY BULLET. WHAT DO THEY FEED HIM?', 'MOVE, TIN KID!'],
    shitty: ["A BULLETPROOF ROBOT KID. AND HE'S LAUGHING AT MY PANTS."],
    nude: ['THE ROBOT KID ATE MY SHOT. COVER HIS EYES, SOMEBODY.'],
  },
  sis: {
    clean: ['THE ROBOT SISTER JUST TANKED A BULLET. ROLLED HER EYES, TOO.', 'OUT OF THE WAY, ROBOT SIS!'],
    shitty: ["ROBOT SIS ATE MY SHOT. AND SHE'S HOLDING HER NOSE."],
    nude: ["ROBOT SIS ATE MY SHOT. SHE'S FILMING THIS, ISN'T SHE."],
  },
};

/** What hurts him here (by what did it, then by the state he's in: hurtSrc in fight.ts sends `<source>.<clean|shitty|
 *  nude>`), and the death screen (28 characters at most). Every one names what it was: Stupid Dad's mallet swat from
 *  the couch, his Donkey Kong hammer, the puke, the couch, the family's beer bottles (they hurt a bit: the user's). */
export const HURT_BY: Record<string, Record<'clean' | 'shitty' | 'nude', { hurt: string[]; death: string[] }>> = {
  'm2:ct_dad_swat': {
    clean: { hurt: ['THE DRUNK SWATTED ME!', 'HE BATTED ME OFF HIS COUCH!', 'SWATTED LIKE A FLY BY A SEVENTY-FOUR YEAR OLD!', "NO AUTOGRAPHS! I DON'T EVEN KNOW WHO YOU ARE!", 'HOME RUN! I\'M THE BALL!'], death: ['SWATTED OFF A SITCOM COUCH', 'BATTED AWAY BY A DRUNK', 'HOME RUN. HE WAS THE BALL.'] },
    shitty: { hurt: ['HE SWATTED THE SHIT OUT OF ME!', 'HE KNOCKED A LITTLE MORE OUT OF ME!', 'SWATTED LIKE A STINKY FLY!', 'THAT KNOCKED MORE OUT OF ME!'], death: ['SWATTED, SHITTY, DEAD', 'BATTED AWAY, PANTS FULL'] },
    nude: { hurt: ['HE SWATTED MY BARE ASS!', 'BATTED OFF THE COUCH! NAKED!', 'SWATTED! MY BALLS SWUNG ROUND TWICE!', 'NOT THE BALLS, DAD!'], death: ['SWATTED OFF A COUCH, NAKED', 'BATTED AWAY BARE-ASSED'] },
  },
  'm2:ct_dad_hammer': {
    clean: { hurt: ['DONKEY DAD HAMMERED ME!', 'HE HAMMERED ME INTO THE FLOOR!', "MY HEAD'S RINGING LIKE A CHURCH BELL!", 'HE HOPPED ON ME WITH A HAMMER!', 'THE OLD FUCK HAMMERED ME!'], death: ['HAMMERED BY DONKEY DAD', 'NAILED BY A DRUNK DAD', 'HAMMERED INTO THE STAGE'] },
    shitty: { hurt: ['HE HAMMERED IT OUT OF ME!', 'HAMMERED! IT SPLURTED!', 'DONKEY DAD! MY PANTS!', 'HE HAMMERED MY SHITTY ASS!'], death: ['HAMMERED, PANTS FULL', 'DONKEY DAD, SHITTY END'] },
    nude: { hurt: ['HAMMERED! RIGHT ON MY BARE ASS!', 'DONKEY DAD! MY BALLS!', 'HE HAMMERED ME NAKED!', "NOT THE NUTS WITH A HAMMER! THEY'RE NOT NAILS!"], death: ['HAMMERED FLAT, NAKED', 'DONKEY DAD, BARE ASS'] },
  },
  'm2:ct_dad_puke': {
    clean: { hurt: ['HOT DAD PUKE!', 'BEER PUKE! IN MY EYES!', "IT'S IN MY MOUTH! IT'S MOSTLY BUSCH LIGHT!", 'HE PUKED ON ME!'], death: ['DROWNED IN DAD PUKE', 'HOSED DOWN BY A DRUNK', 'DIED IN A PUKE SHOWER'] },
    shitty: { hurt: ['PUKE! NOW I\'M BOTH ENDS!', 'HE PUKED ON MY SHITTY PANTS!', "PUKE AND SHIT! I'M A PORTA-POTTY!"], death: ['PUKED ON AND SHAT IN', 'BOTH ENDS. DEAD.'] },
    nude: { hurt: ['PUKE! ON MY BARE SKIN!', 'HOT PUKE RUNNING DOWN MY ASS CRACK!', 'HOT PUKE ON MY NAKED ASS!'], death: ['PUKED ON, NAKED', 'BARE ASS IN DAD PUKE'] },
  },
  'm2:ct_dad_couch': {
    clean: { hurt: ['HIT BY A FLYING COUCH!', 'THE PLAID COUCH! RIGHT IN THE TEETH!', 'SOFA TO THE FACE!', 'PUKE-POWERED COUCH! OW!'], death: ['RUN OVER BY A COUCH', 'KILLED BY A FLYING SOFA', 'COUCH-SURFED TO DEATH'] },
    shitty: { hurt: ['THE COUCH SQUISHED MY PANTS!', 'FLYING COUCH! IT SPLATTED!', 'SOFA! RIGHT IN THE SHIT!'], death: ['FLATTENED BY A SOFA. SHITTY.', 'COUCHED IN MY OWN SHIT'] },
    nude: { hurt: ['COUCH! ON MY BARE ASS!', 'PLAID BURN ON MY BALLS!', 'THE COUCH HIT MY BALLS! IT SMELLS LIKE FEET!'], death: ['RUN OVER BY A COUCH, NAKED', 'SOFA\'D BARE-ASSED'] },
  },


  'm2:ct_dad_beer': {
    clean: { hurt: ['BEER BOTTLE! OW!', 'THEY\'RE THROWING BEER AT ME!', 'RIGHT IN THE HEAD! WITH BEER!', 'GOOD BEER! WASTED ON MY FACE!'], death: ['KILLED BY FLYING BEER', 'BOTTLED BY A ROBOT FAMILY', 'BEER TO THE HEAD'] },
    shitty: { hurt: ['BEER BOTTLE! IN THE MESS!', 'BOTTLED! AND I STINK!', 'THE ROBOT KID BEANED ME!'], death: ['BOTTLED, PANTS FULL', 'BEER, SHIT, DEAD'] },
    nude: { hurt: ['BEER BOTTLE! ON MY BARE ASS!', 'COLD BEER! ON MY NUTS!', 'A BOTTLE! RIGHT IN THE TAINT!'], death: ['BOTTLED, NAKED', 'BEER TO THE BARE ASS'] },
  },
};
/** Flat (one line per source, all states): what fight.ts registers, `<source>.<state>` and the source alone (clean). */
export const HURT: HurtTable = Object.fromEntries(Object.entries(HURT_BY).flatMap(([src, by]) => [
  [src, by.clean], ...(['clean', 'shitty', 'nude'] as const).map(k => [`${src}.${k}`, by[k]] as const),
]));

const all = (b: ByPants) => allOf(b);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...[ARRIVE, REVISIT, ...Object.values(GAGS), MH_KICKED, MH_SEES, MH_ON].flatMap(all),
    ...[MH_HINT, MH_TOO_GREASY, MH_PUKE, MH_RAGE, MH_BUNDY, MH_KILL, MH_COUCH, MH_DUD, MH_WON_WEAK, MH_WON, MH_BLOCKED, ...Object.values(MH_BLOCKED_BY)].flatMap(all),
    ...Object.values(HURT_BY).flatMap(by => Object.values(by).flatMap(h => h.hurt)),
  ],
  death: Object.values(HURT_BY).flatMap(by => Object.values(by).flatMap(h => h.death)),
  [VOICES.guard]: [GUARD_STOP, GUARD_DOWN_LINES, GUARD_GROAN, GUARD_LATER].flatMap(all),
  [VOICES.dad]: [
    ...SHOW_CALL, ...SHOW_TAKE, ...SHOW_ADLIB, ...SHOW_TV, ...[DAD_NOTICE, DAD_UP, DAD_FIGHT, DAD_SETTLE].flatMap(all),
    ...Object.values(DAD_BEER_FOR).flatMap(all), ...[DAD_BEER, DAD_SNIPE, DAD_BUNDY, DAD_SWAT, DAD_CATCH, DAD_MISS, DAD_BONK, DAD_PUKE, DAD_RAGE, DAD_TIRED, DAD_HURT, ...DAD_KILL,
      DAD_PATHETIC, DAD_HEAVY, DAD_TAUNT, DAD_LOW, DAD_ENTRANCE, DAD_GRABBED, DAD_SEES_CAR, DAD_FRIDGE, DAD_WOBBLE, DAD_CRUSHED, DAD_FLAT].flatMap(all),
  ],
  [VOICES.crew]: [...CREW_EXCUSE],
  [VOICES.mom]: [...MOM_TAPE, ...GLITCH_TAPE.mom, ...MOM_SNARK, ...FETCH_TAPE.mom, ...DIE_TAPE.mom],
  [VOICES.boy]: [...BOY_TAPE, ...GLITCH_TAPE.boy, ...BOY_SNARK, ...DIE_TAPE.boy],
  [VOICES.sis]: [...SIS_TAPE, ...SIS_SNARK, ...FETCH_TAPE.sis, ...DIE_TAPE.sis],
  [VOICES.gramps]: [...GRAMPS_TAPE, ...GLITCH_TAPE.gramps, ...GRAMPS_SNARK, ...FETCH_TAPE.gramps, ...DIE_TAPE.gramps],
};
