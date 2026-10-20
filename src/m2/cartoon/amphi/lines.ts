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

import { allOf, type ByPants, type HurtTable } from '../talk';

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

/** He drags the couch up front and drops back onto it (the intro's last beat, him to the room). */
export const DAD_SETTLE: ByPants = {
  clean: ["AH. THAT'S BETTER. NOW GET OFF MY SET.", 'DAD FIGHTS SITTING DOWN.'],
  shitty: ["DAD FIGHTS SITTING DOWN. YOU CAN'T. I CAN TELL.", 'I SIT. YOU STINK. THAT IS THE SHOW.'],
  nude: ["DAD FIGHTS SITTING DOWN. EYE LEVEL WITH... OH GOD.", "I'M SITTING. DON'T STAND THERE LIKE THAT."],
};

// ---------------------------------------------------------------------------------------------------------------
// THE FIGHT (fight.ts): STUPID DAD on his couch, drunk, the stolen mallet by him, yelling at his family for beer.
// Everything he says is by pants (he's seen him). The family's tapes don't react to Meathead: one pool each.

/** Screaming at the family for a beer (the whole fight). */
export const DAD_BEER: ByPants = {
  clean: [
    'MARLENE! BEER! THERE\'S A FAN IN THE HOUSE!', 'BOY! BEER! I\'M BEING ATTACKED HERE!', 'SOMEBODY GET ME A BEER BEFORE I LOSE IT!',
    'GRAMPS! BEER! YOU\'RE CLOSEST TO DEATH, MAKE YOURSELF USEFUL!', 'SIS! BEER! AND QUIT LOOKING AT ME LIKE THAT!',
  ],
  shitty: [
    'BEER! IF I GET DRUNK ENOUGH I CAN\'T SMELL HIM!', 'MARLENE! BEER! THE GUEST SHIT HIMSELF!', 'BOY! TWO BEERS! ONE TO DRINK, ONE TO POUR ON HIM!',
    'BEER! SOMETHING DIED IN HIS PANTS!',
  ],
  nude: [
    'BEER! I GOTTA UNSEE THIS!', 'MARLENE! BEER! AND A TOWEL FOR THE NAKED GUY!', 'BOY! BEER! DON\'T LOOK AT HIM, JUST BRING IT!',
    'BEER! A NAKED MAN IN MY LIVING ROOM! BEER!',
  ],
};
/** Snark at the family (the sitcom: everybody mean to everybody, in the living room, forever). */
export const DAD_SNIPE: ByPants = {
  clean: [
    'SIS, YOU\'RE THE REASON I DRINK.', 'GRAMPS, DIE ALREADY. I WANT THE RECLINER.', 'MARLENE, THAT CASSEROLE\'S OLDER THAN THE BOY.',
    'BOY, YOU\'RE ON A TRACK. EVEN YOUR LIFE GOT NO CHOICES.',
  ],
  shitty: [
    'MARLENE, THE GUEST SHIT HIMSELF. CLEAN IT. IT\'S YOUR JOB.', 'SIS, QUIT STARING. HE\'S NOT YOUR DATE. HE SHIT HIMSELF.',
    'GRAMPS, YOU SMELL HIM TOO? NO? YOU\'RE DEAD INSIDE.',
  ],
  nude: [
    'MARLENE, QUIT LOOKING AT THE NAKED GUY.', 'SIS, EYES ON THE TV. THAT AIN\'T FOR YOU.', 'GRAMPS, YOU\'RE DROOLING. HE\'S NAKED, NOT A SANDWICH.',
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
  shitty: ['I MANAGE A CLOTHING STORE. I GOT PANTS IN YOUR SIZE. AND A HOSE.', 'I SELL PANTS FOR A LIVING. YOU NEED SOME. BAD.'],
  nude: ['I MANAGE A CLOTHING STORE AND YOU SHOW UP NAKED? INSULTING.', 'I SELL PANTS, KID. FORTY PERCENT OFF. PLEASE.'],
};
/** Too close: the mallet. */
export const DAD_SWAT: ByPants = {
  clean: ['BACK OFF, FAN!', 'NO AUTOGRAPHS!', 'OFF MY SET!'],
  shitty: ['GET YOUR STINK OFF MY SET!', 'BACK! YOU SMELL LIKE THE BOY\'S TRACK!'],
  nude: ['PUT IT AWAY AND BACK OFF!', 'NO NAKED FANS!'],
};
/** A bottle caught (one at last). */
export const DAD_CATCH: ByPants = {
  clean: ['NOW THAT\'S PARENTING.', 'COLD. FINALLY.', 'ATTA... WHOEVER YOU ARE.'],
  shitty: ['BEER. IT KILLS THE SMELL. FROM THE INSIDE.', 'FINALLY. NOW I CAN\'T SMELL YOU.'],
  nude: ['BEER. NOW YOU LOOK BETTER. NOT MUCH.', 'ONE BEER IN AND YOU\'RE STILL NAKED.'],
};
/** A bottle missed him (most do). */
export const DAD_MISS: ByPants = {
  clean: ['YOU THROW LIKE YOUR MOTHER!', 'MY HANDS ARE RIGHT HERE!', 'THAT WAS A GOOD BEER!'],
  shitty: ['CLOSER! THROW IT AT THE SMELLY ONE!', 'MISSED! HIT THE STINKER NEXT TIME!'],
  nude: ['MISSED! HIT THE NAKED ONE!', 'AIM FOR HIS WANG, NOT MY FLOOR!'],
};
/** ...off his head. */
export const DAD_BONK: ByPants = {
  clean: ['OW! MY HEAD!', 'IN THE HEAD? I\'M YOUR FATHER!'],
  shitty: ['OW! THAT\'S THE SECOND WORST THING TODAY. HE\'S THE FIRST.', 'OW! THROW IT AT THE POOPY GUY!'],
  nude: ['OW! THROW IT AT THE NAKED GUY!', 'OW! I SAW STARS. AND HIS WANG.'],
};
/** The beer coming back up (the couch takes off). */
export const DAD_PUKE: ByPants = {
  clean: ['OH NO. THAT ONE WAS SKUNKED.', 'HURK. HERE COMES THE SECOND HALF.'],
  shitty: ['YOU SMELL SO BAD I... HURK!', 'THAT SMELL. THAT BEER. HURK!'],
  nude: ['I CAN SEE YOUR... HURK!', 'PUT IT AWAY OR I... HURK!'],
};
/** The drunken rage (the mallet up, Donkey Kong). */
export const DAD_RAGE: ByPants = {
  clean: ['THAT\'S IT! DAD\'S GOT THE HAMMER!', 'WHO WANTS SOME? DAD\'S GOT A HAMMER!'],
  shitty: ['C\'MERE, STINKY! DAD\'S GOT A HAMMER!', 'I\'LL HAMMER THE SHIT OUTTA YOU! OH. ALREADY OUT.'],
  nude: ['I\'M GONNA HAMMER THAT THING FLAT!', 'NAKED? I\'LL BONK YOU WHERE IT COUNTS!'],
};
/** ...worn out: back to the couch. */
export const DAD_TIRED: ByPants = {
  clean: ['OKAY. OKAY. DAD\'S GOTTA SIT.', 'MY HEART. MY HEART\'S GOING.'],
  shitty: ['I\'M WINDED. AND YOU STILL STINK.', 'GOTTA SIT. AWAY FROM YOU.'],
  nude: ['I\'M OUT OF BREATH AND YOU\'RE STILL NAKED.', 'GOTTA SIT. CAN\'T LOOK AT THAT STANDING UP.'],
};
/** Hit (now and then). */
export const DAD_HURT: ByPants = {
  clean: ['OW! MY BACK!', 'THAT\'S GONNA BRUISE!', 'HEY! I\'M SEVENTY-FOUR!'],
  shitty: ['DON\'T TOUCH ME WITH THOSE HANDS!', 'OW! AND NOW I SMELL LIKE YOU!'],
  nude: ['OW! DON\'T HIT ME WITH IT OUT!', 'OW! SOMETHING SLAPPED ME. I HOPE IT WAS A HAND.'],
};
/** A family member flattened by a stunt car: more baffled, more fed up, every time (by how many: 1, 2, 3 (his couch
 *  goes with it), 4 (the last)). */
export const DAD_KILL: ByPants[] = [
  {
    clean: ['WHAT THE HELL? WHERE\'D THAT CAR COME FROM?', 'WHO PARKED ON MY FAMILY?'],
    shitty: ['A CAR? ON MY FAMILY? IS THAT YOU? IT SMELLS LIKE YOU.', 'WHAT THE HELL WAS THAT? AND WHAT IS THAT SMELL?'],
    nude: ['A CAR? FROM WHERE? FROM YOUR... NO.', 'WHO PARKED ON MY FAMILY? WAS IT THE NAKED GUY?'],
  },
  {
    clean: ['TWO! WHO KEEPS PARKING ON MY FAMILY?!', 'AGAIN? THOSE ROBOTS COST NINETY BUCKS!'],
    shitty: ['ANOTHER ONE? QUIT IT, YOU SMELLY BASTARD!', 'TWO! AND THE SMELL STAYS! WHY DOES THE SMELL STAY?'],
    nude: ['ANOTHER ONE? YOU NAKED LUNATIC!', 'QUIT IT! PUT ON PANTS AND QUIT IT!'],
  },
  {
    clean: ['MY COUCH! NOT THE COUCH!', 'THAT COUCH WAS IN THE PILOT!'],
    shitty: ['MY COUCH! NOW IT SMELLS WORSE THAN YOU!', 'THE COUCH! YOU SMELLY SON OF A...!'],
    nude: ['MY COUCH! YOU NAKED MONSTER!', 'THE COUCH! WHERE DO I SIT NOW? NOT WHERE YOU SAT!'],
  },
  {
    clean: ['THAT WAS THE LAST ONE. I GOT NOBODY.', 'THAT\'S EVERYBODY. AGAIN.'],
    shitty: ['THAT\'S EVERYBODY. JUST ME AND THE SMELL NOW.', 'ALL GONE. AND YOU\'RE STILL HERE. STINKING.'],
    nude: ['ALL GONE. JUST ME. AND A NAKED GUY.', 'NOBODY LEFT. NOBODY TO COVER THEIR EYES.'],
  },
];
/** No couch, no family: stood up, pathetic, falling over. */
export const DAD_PATHETIC: ByPants = {
  clean: ['HOLD STILL. I\'LL GET YOU. GIMME A SEC.', 'WHERE\'S MY COUCH? WHO MOVED THE FLOOR?', 'I CAN\'T FEEL MY LEGS. NEVER COULD.'],
  shitty: ['I\'LL GET YOU, STINKY. ONCE THE ROOM STOPS.', 'I\'M FALLING OVER IN YOUR SMELL.'],
  nude: ['STAND STILL, NAKED. THERE\'S TWO OF YOU.', 'WHY\'S THE NAKED GUY SPINNING?'],
};
/** ...trying to lift the mallet and not. */
export const DAD_HEAVY: ByPants = {
  clean: ['THIS USED TO BE LIGHTER.', 'HOO. GIMME A MINUTE.'],
  shitty: ['TOO HEAVY. LIKE YOUR PANTS.', 'CAN\'T LIFT IT. CAN\'T BREATHE NEAR YOU EITHER.'],
  nude: ['TOO HEAVY. AND YOU\'RE TOO NAKED.', 'I CAN\'T LIFT IT. YOU CAN\'T COVER IT. WE\'RE EVEN.'],
};
/** Sat there, at him, now and then. */
export const DAD_TAUNT: ByPants = {
  clean: ['SIT DOWN. YOU\'RE BLOCKING THE GAME.', 'COMMERCIAL\'S OVER, KID. BEAT IT.', 'THIS IS A FAMILY SHOW.'],
  shitty: ['YOU\'RE STINKING UP A FAMILY SHOW!', 'NOBODY SAID IT WAS SMELL-O-VISION.'],
  nude: ['THIS IS A FAMILY SHOW! PUT IT AWAY!', 'THE NETWORK\'S GONNA PULL US. AGAIN.'],
};
/** Low. */
export const DAD_LOW: ByPants = {
  clean: ['I NEED A BEER. A BIG ONE. A KEG.', 'I SEE THE CAST. THEY\'RE WAVING.'],
  shitty: ['I\'M DYING AND IT SMELLS LIKE YOUR PANTS.', 'THIS CAN\'T BE IT. NOT WITH THAT SMELL.'],
  nude: ['IF I DIE, THE LAST THING I SAW WAS THAT.', 'I SEE A LIGHT. NO. IT\'S YOUR ASS.'],
};
/** A retry: straight back on (him already on the couch). */
export const DAD_ENTRANCE: ByPants = {
  clean: ['BACK? SIT DOWN. THE GAME\'S ON.', 'YOU AGAIN? MARLENE, LOCK THE DOOR.'],
  shitty: ['BACK? AND YOU STILL STINK.', 'OH GOD, HE\'S BACK. SO\'S THE SMELL.'],
  nude: ['BACK. STILL NAKED. MARLENE, THE BELT.', 'YOU AGAIN? AT LEAST BRING PANTS.'],
};
/** A grab at him: TOO GREASY (forty years of beer sweat). */
export const DAD_GRABBED: ByPants = {
  clean: ['HANDS OFF! I\'M BASTED IN BEER!', 'NOBODY TOUCHES DAD!'],
  shitty: ['DON\'T GRAB ME WITH THOSE HANDS!', 'GET YOUR POOP HANDS OFF ME!'],
  nude: ['DON\'T HUG ME NAKED!', 'NO NAKED HUGS ON A FAMILY SHOW!'],
};
/** The last stunt car coming at him (stood up, nobody left). */
export const DAD_SEES_CAR: ByPants = {
  clean: ['OH, COME ON.', 'NOT ON ME. NOT ON...'],
  shitty: ['OH, COME ON. AT LEAST IT\'LL KILL THE SMELL.', 'A CAR? FINE. ANYTHING TO GET AWAY FROM YOU.'],
  nude: ['OH, COME ON. LAST THING I SEE IS HIS WANG AND A CAR.', 'A CAR? FINE. BETTER THAN THE VIEW.'],
};
/** The standard death: he gets up for a beer himself (the fridge overloaded: SWILL LITE buries him). */
export const DAD_FRIDGE: ByPants = {
  clean: ['FINE. I\'LL GET IT MYSELF.', 'IF YOU WANT SOMETHING DONE...'],
  shitty: ['FINE. I\'LL GET IT. YOU\'D ONLY SHIT ON IT.', 'I\'LL GET MY OWN BEER. AWAY FROM YOU.'],
  nude: ['FINE. I\'LL GET IT. DON\'T FOLLOW ME NAKED.', 'I\'LL GET MY OWN. AND A ROBE FOR YOU.'],
};
/** ...from under the pile (and he shits himself). */
export const DAD_BURIED: ByPants = {
  clean: ['...STILL COLD. AND I SHIT MYSELF. WORTH IT.', '...BEST SHOW WE EVER DID. I SHIT MYSELF.'],
  shitty: ['...NOW I SHIT MYSELF. WE MATCH.', '...I SHIT MYSELF. DON\'T SAY IT.'],
  nude: ['...I SHIT MYSELF. AT LEAST I GOT SHORTS.', '...I SHIT MYSELF. STILL BETTER DRESSED THAN YOU.'],
};
/** The weakness death: flattened under the last stunt car, like a cartoon. */
export const DAD_FLAT: ByPants = {
  clean: ['...I\'M FLAT. LIKE THE RATINGS.', '...SOMEBODY ROLL ME UP.'],
  shitty: ['...FLAT. AND I STILL SMELL YOU.', '...FLAT AS A PANCAKE. A SHITTY ONE.'],
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
  clean: ['HIS WHOLE FAMILY\'S JUST STANDING THERE. I GOT A CLAPPERBOARD.', 'STUNT CARS. ROBOT FAMILY. I SMELL A SEQUEL.', 'SNAP THE CLAPPERBOARD. SEE WHO GETS PARKED ON.'],
  shitty: ['I SHIT MY PANTS AND HE\'S STILL WINNING. CLAPPERBOARD TIME.', 'CLAPPERBOARD. ROBOTS. LET\'S MAKE THIS SHOW WORSE.'],
  nude: ['NAKED, BROKE, AND I GOT A CLAPPERBOARD. ACTION.', 'HIS FAMILY\'S PARKED RIGHT THERE. LET\'S PARK ON THEM.'],
};
export const MH_TOO_GREASY: ByPants = {
  clean: ['HE\'S ALL BEER SWEAT!', 'LIKE GRABBING A WET BRATWURST!', 'TOO GREASY! HE\'S MARINATED!'],
  shitty: ['HE\'S SLIMIER THAN MY PANTS!', 'GREASY! AND I\'M ONE TO TALK!'],
  nude: ['NAKED GRAB! BAD IDEA! SO MUCH SWEAT!', 'SKIN ON BEER SWEAT! NEVER AGAIN!'],
};
export const MH_PUKE: ByPants = {
  clean: ['HE PUKED SO HARD THE COUCH TOOK OFF!', 'JET-POWERED LA-Z-BOY!'],
  shitty: ['HE BLEW CHUNKS. I BLEW MY PANTS. WE\'RE EVEN.', 'PUKE-POWERED COUCH! I\'VE SEEN WORSE. IN MY PANTS.'],
  nude: ['NOT ON MY BARE ASS! NOT ON MY BARE ASS!', 'HE\'S PUKING AND I\'M NAKED. DON\'T SPLASH ME.'],
};
export const MH_RAGE: ByPants = {
  clean: ['DONKEY KONG DAD!', 'HE\'S GOT A HAMMER AND HE\'S HOPPING!'],
  shitty: ['HAMMER TIME. MY PANTS ALREADY KNEW.', 'RUN! WADDLE! WHATEVER! RUN!'],
  nude: ['A HAMMER AND MY BALLS OUT. GREAT COMBO.', 'NAKED DONKEY KONG! WRONG GAME!'],
};
export const MH_BUNDY: ByPants = {
  clean: ['HE SELLS PANTS. HOW\'S HE GOT THIS HOUSE?'],
  shitty: ['HE SELLS PANTS? I\'M A CUSTOMER. NOW.'],
  nude: ['HE SELLS CLOTHES? I\'LL TAKE ONE OF EVERYTHING.'],
};
export const MH_KILL: ByPants = {
  clean: ['CUT! PRINT IT!', 'THAT\'S A WRAP.', 'RECAST THAT ONE.'],
  shitty: ['PARKED ON. LIKE MY PANTS.', 'BLOWN UP. SAME AS MY PANTS.'],
  nude: ['SCENE. TAKE A BOW.', 'NOW EVERYBODY ON THIS SET\'S HALF NAKED.'],
};
export const MH_COUCH: ByPants = {
  clean: ['THERE GOES THE COUCH.', 'NOW YOU GOTTA STAND, DAD.'],
  shitty: ['COUCH IS TOAST. NOBODY SITS WHERE I\'VE BEEN ANYWAY.', 'UP YOU GET. WE BOTH LOST SOMETHING TODAY.'],
  nude: ['NO COUCH. NOW WE\'RE BOTH EXPOSED.', 'UP YOU GET. LOOK AT ME. I\'M UP.'],
};
/** The clapperboard snapped before the scene's reset (its recharge in the fight). */
export const MH_DUD: ByPants = {
  clean: ['SCENE\'S NOT RESET YET.', 'THEY\'RE STILL HOSING OFF THE LAST TAKE.'],
  shitty: ['NO CAR YET. JUST ME AND MY PANTS.', 'STILL RESETTING. HURRY. I SMELL.'],
  nude: ['NO CAR YET. JUST A NAKED GUY CLAPPING.', 'STILL RESETTING. I\'M STANDING HERE NAKED.'],
};
export const MH_WON_WEAK: ByPants = {
  clean: ['THAT\'S A WRAP, DAD.', 'CANCELED. AGAIN.'],
  shitty: ['FLATTENED. I KNOW THE FEELING. IN MY PANTS.', 'FLAT AS MY ASS FEELS.'],
  nude: ['FLATTER THAN ME. AND I\'M NAKED.', 'PANCAKE DAD. NO SYRUP.'],
};
export const MH_WON: ByPants = {
  clean: ['DEATH BY BEER. HE\'D WANT IT THAT WAY.', 'COLD ONE\'S ON ME, DAD.'],
  shitty: ['HE SHIT HIMSELF TOO. WELCOME TO THE CLUB.', 'IT SMELLS LIKE HIM NOW. NOT ME. FINALLY.'],
  nude: ['BURIED IN BEER. BEATS PANTS.', 'ONE ROLLED OUT. NAKED KEEPERS.'],
};

/** What hurts him here (by source), and the death screen (28 characters at most). The family can't hurt him (the
 *  user's): their bottles don't. */
export const HURT: HurtTable = {
  'm2:ct_dad_swat': {
    hurt: ['BONKED BY A MALLET!', 'HE BATTED ME LIKE A FLY!', 'HOME RUN! ME!'],
    death: ['BATTED AWAY BY A DRUNK', 'HOME RUN. HE WAS THE BALL.', 'BONKED OFF A SITCOM SET'],
  },
  'm2:ct_dad_puke': {
    hurt: ['PUKE! HOT PUKE!', 'IT\'S IN MY MOUTH!', 'BEER PUKE! IN MY EYES!'],
    death: ['DROWNED IN DAD PUKE', 'HOSED DOWN BY A DRUNK', 'DIED IN A PUKE SHOWER'],
  },
  'm2:ct_dad_couch': {
    hurt: ['HIT BY A FLYING COUCH!', 'THE COUCH GOT ME!', 'SOFA TO THE FACE!'],
    death: ['RUN OVER BY A COUCH', 'KILLED BY A FLYING SOFA', 'COUCH-SURFED TO DEATH'],
  },
  'm2:ct_dad_hammer': {
    hurt: ['HAMMERED!', 'HE HOPPED AND BONKED ME!', 'MY HEAD\'S RINGING!'],
    death: ['HAMMERED BY DONKEY DAD', 'WHACKED BY A STOLEN MALLET', 'BONKED FLAT'],
  },
};

const all = (b: ByPants) => allOf(b);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...[ARRIVE, REVISIT, ...Object.values(GAGS), MH_KICKED, MH_SEES, MH_ON].flatMap(all),
    ...[MH_HINT, MH_TOO_GREASY, MH_PUKE, MH_RAGE, MH_BUNDY, MH_KILL, MH_COUCH, MH_DUD, MH_WON_WEAK, MH_WON].flatMap(all),
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [VOICES.guard]: [GUARD_STOP, GUARD_DOWN_LINES, GUARD_GROAN, GUARD_LATER].flatMap(all),
  [VOICES.dad]: [
    ...SHOW_CALL, ...SHOW_TAKE, ...SHOW_ADLIB, ...SHOW_TV, ...[DAD_NOTICE, DAD_UP, DAD_FIGHT, DAD_SETTLE].flatMap(all),
    ...[DAD_BEER, DAD_SNIPE, DAD_BUNDY, DAD_SWAT, DAD_CATCH, DAD_MISS, DAD_BONK, DAD_PUKE, DAD_RAGE, DAD_TIRED, DAD_HURT, ...DAD_KILL,
      DAD_PATHETIC, DAD_HEAVY, DAD_TAUNT, DAD_LOW, DAD_ENTRANCE, DAD_GRABBED, DAD_SEES_CAR, DAD_FRIDGE, DAD_BURIED, DAD_FLAT].flatMap(all),
  ],
  [VOICES.mom]: [...MOM_TAPE, ...GLITCH_TAPE.mom, ...MOM_SNARK, ...FETCH_TAPE.mom, ...DIE_TAPE.mom],
  [VOICES.boy]: [...BOY_TAPE, ...GLITCH_TAPE.boy, ...BOY_SNARK, ...DIE_TAPE.boy],
  [VOICES.sis]: [...SIS_TAPE, ...SIS_SNARK, ...FETCH_TAPE.sis, ...DIE_TAPE.sis],
  [VOICES.gramps]: [...GRAMPS_TAPE, ...GLITCH_TAPE.gramps, ...GRAMPS_SNARK, ...FETCH_TAPE.gramps, ...DIE_TAPE.gramps],
};
