// What's said in CHELSEA AND SOCKS' WACKY WHITE HOUSE ADVENTURES, part two, by voice (cartoon/voices.ts gathers it;
// tools/voices records it). Pure data (tools/voices bundles it in node).
//
// The satire (the user's): "who the hell are these people". The show plays its 90s pundits straight, as Saturday
// morning cartoon villains spouting their talking points; the joke is Meathead not getting any of it. Then the screen
// comes down: the real stage, real bodies, and the woman who played Chelsea on her knees being sick. Never anything
// about his age.
//
// MEATHEAD: blunt, short, vulgar; baffled; then, behind the screen, flat.
// CHELSEA (m2.cartoon.chelsea, part one's voice): the show's Chelsea, chirpy, nagging; queasy after each kill.
// RUSH LIMBAUGH (m2.cartoon.limbaugh), BOB DOLE (m2.cartoon.dole), NEWT GINGRICH (m2.cartoon.newt): the show's
// impersonators, hammy cartoon villains.
// BILL and HILLARY (m2.cartoon.bill, m2.cartoon.hillary): the show's Clintons, on the TV from the UN.
// THE ACTRESS (m2.cartoon.actress): the grown woman under the Chelsea projection, her own voice, retching.
// THE NEW MEAN MEN: spin doctors, dittoheads.

import { allOf, type ByPants, type HurtTable } from '../talk';

export const LIMBAUGH = 'm2.cartoon.limbaugh';
export const DOLE = 'm2.cartoon.dole';
export const NEWT = 'm2.cartoon.newt';
export const BILL = 'm2.cartoon.bill';
export const HILLARY = 'm2.cartoon.hillary';
export const ACTRESS = 'm2.cartoon.actress';
export const CHELSEA2 = 'm2.cartoon.chelsea';
export const MEAN2 = {
  spindoc: 'm2.cartoon.spindoc', spindocf: 'm2.cartoon.spindocf',
  ditto: 'm2.cartoon.ditto', dittof: 'm2.cartoon.dittof',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// Chelsea

/** Said once each, the first time he gets there (never says which button: she says what to do). */
export const HINT2: Record<'westwing' | 'drawers' | 'blimp' | 'ditto' | 'kitchen' | 'jello' | 'map' | 'lasers' | 'sweep' | 'oval', string[]> = {
  westwing: ["THE WEST WING, SOCKS! THIS IS WHERE DAD WORKS! MOSTLY!"],
  drawers: ['THE DRAWERS POP OUT, SOCKS! CLIMB THEM LIKE STAIRS!'],
  blimp: ["THE SPY BLIMP FOLLOWED US! IT'S SPYING!"],
  ditto: ['THAT MAN HAS A RADIO! HE AGREES WITH EVERYTHING ON IT!'],
  kitchen: ['THE KITCHENS! THE CHEF MAKES DAD CHEESEBURGERS! SECRETLY!'],
  jello: ["THE JELLY MOLD! IT'S BOUNCY, SOCKS! BOING!"],
  map: ["DAD'S BIG GLOBE! DON'T TOUCH IT, SOCKS! IT'S WOBBLY!"],
  lasers: ['LASERS! WAIT FOR THEM TO BLINK OFF, SOCKS!'],
  sweep: ['THAT ONE GOES UP AND DOWN! TIME IT, SOCKS!'],
  oval: ['THE OVAL OFFICE! THE MEANEST MAN OF ALL IS IN THERE!'],
};
/** The globe's off its stand. */
export const GLOBE_RUN = ['THE GLOBE! RUN, SOCKS! RUN!'];
/** A pundit's coming (she names him: in character). */
export const LIMBAUGH_COMING = ["OH NO! IT'S RUSH LIMBAUGH! HE'S ON THE RADIO! IN THE ROOSEVELT ROOM!"];
export const DOLE_COMING = ["OH NO, SOCKS! IT'S BOB DOLE! HE'S RUNNING FOR PRESIDENT! IN HERE!"];
export const NEWT_COMING = ["IT'S NEWT GINGRICH, SOCKS! HE WANTS TO SHUT DOWN THE WHOLE GOVERNMENT!"];
/** A pundit's dead: about to be sick (it's real), still hurrying him on. */
export const QUEASY_LIMBAUGH = ["YOU DID IT, SOCKS! HE'S OFF THE AIR! HURK. THE KITCHENS! THIS WAY!"];
export const QUEASY_DOLE = ['BOB DOLE IS... GONE! URP. NOBODY LOOK AT THE CARPET! THE MAP ROOM! GO!'];
export const QUEASY_NEWT = ["YOU DID IT! HURK. HURRGH. I'M FINE! LOOK, SOCKS! IT'S MOM AND DAD! ON TV!"];
/** The picture judders (the screen's going): still in character, scared. */
export const WOBBLY = ['UM. SOCKS? WHY ARE THE WALLS WOBBLY?'];

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Once each a visit, at what he's passing. */
export const GAGS2: Record<'colonnade' | 'drawers' | 'jello' | 'range' | 'globe' | 'lasers' | 'oval', ByPants> = {
  colonnade: {
    clean: ['MORE WHITE HOUSE. HOW MANY ROOMS DOES ONE GUY NEED?', "STILL A CAT. STILL NOBODY'S EXPLAINED WHY."],
    shitty: ['STILL A CAT. STILL SHITTY. STILL HERE.', 'A SHITTY CAT IN THE WEST WING. SOMEBODY CALL THE PRESS.'],
    nude: ['NAKED CAT IN THE WEST WING. TOUR GOING GREAT.', 'NO PANTS. NO IDEA WHERE I AM. NORMAL TUESDAY.'],
  },
  drawers: {
    clean: ['THE DRAWERS ARE THE STAIRS. SURE.', 'FILING CABINETS. LIKE EVERY JOB I EVER GOT FIRED FROM.'],
    shitty: ['IF A DRAWER HITS MY GUT, THAT IS IT.', 'ONE DRAWER IN THE GUT AND THIS OFFICE GETS NEW CARPET.'],
    nude: ["DON'T SLAM A DRAWER ON ANYTHING.", "IF A DRAWER CATCHES MY BALLS, I'M SUING THE GOVERNMENT."],
  },
  jello: {
    clean: ['BOUNCING ON JELLY. FINALLY A DECENT RIDE.', 'A JELLY MOLD THE SIZE OF A HOT TUB. FINALLY, TAX DOLLARS AT WORK.'],
    shitty: ['JELLY ON MY ASS. JUST ADDING TO IT.', "NOBODY EAT THAT JELLY. IT'S GOT A BROWN STREAK IN IT NOW."],
    nude: ['BARE ASS ON COLD JELLY. MY BALLS WENT UP INSIDE ME.', 'NOBODY EAT THAT JELLY. EVER.'],
  },
  range: {
    clean: ["A HOT STOVE. EVERY CAT'S DREAM. ASSHOLES.", 'WALKING ON A STOVE. SURE.'],
    shitty: ["THE HEAT'S BAKING MY PANTS. SMELLS LIKE A PORTA-POTTY IN JULY.", 'HEAT PLUS THESE PANTS. HOLD YOUR NOSE.'],
    nude: ['NOTHING DANGLES OVER THE BURNERS.', 'NAKED OVER A STOVE. TUCK IT OR FRY IT.'],
  },
  globe: {
    clean: ["THE WHOLE WORLD'S AFTER ME!", 'OH, COME ON. THE FUCKING GLOBE?'],
    shitty: ['RUNNING FROM A GLOBE. EVERY STEP SQUISHES.', "IT'S A BIG BALL. I'M A SHITTY CAT. RUN."],
    nude: ['RUNNING NAKED FROM THE WORLD. STORY OF MY LIFE.', "THE WORLD'S CHASING MY NAKED ASS. AGAIN."],
  },
  lasers: {
    clean: ['LASERS. IN A KIDS SHOW.', 'LASER BEAMS. IN A CAT SHOW. FOR SIX YEAR OLDS.'],
    shitty: ['LASER MY ASS. IT WOULD BE AN IMPROVEMENT.', 'IF A LASER HITS MY PANTS, IT SMELLS LIKE BACON. AND SHIT.'],
    nude: ['KEEP THOSE LASERS AWAY FROM MY BALLS.', 'LASERS AT BALL HEIGHT. WHO DESIGNED THIS?'],
  },
  oval: {
    clean: ['THE OVAL OFFICE. EVEN I KNOW THIS ONE.', 'THE ROUND ROOM. WHERE THE GUY SITS. WHOEVER HE IS.'],
    shitty: ["THE OVAL OFFICE. I'M SITTING IN THE BIG CHAIR LIKE THIS.", 'THE OVAL OFFICE. SORRY ABOUT THE RUG.'],
    nude: ['NAKED IN THE OVAL OFFICE. FEELS PRESIDENTIAL.', "NAKED IN THE OVAL OFFICE. I'M NAPPING ON THE DESK."],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The pundits (the show's: cartoon villains, their 90s talking points played straight) and Meathead baffled by them

export interface PunditLines2 {
  intro: ByPants; reply: ByPants; taunt: ByPants; toss: string[]; baffled: ByPants; death: ByPants; after: ByPants;
  /** His window: Limbaugh winded on the floor, Dole's pratfall, Newt's tantrum. */
  flop: string[];
}

export const LIMBAUGH_LINES: PunditLines2 = {
  intro: {
    clean: ['GREETINGS ACROSS THE FRUITED PLAIN, KITTY! RUSH LIMBAUGH HERE! WITH HALF MY BRAIN TIED BEHIND MY BACK!'],
    shitty: ['WHOA! SOMETHING STINKS ACROSS THE FRUITED PLAIN, KITTY! IT\'S YOU! RUSH LIMBAUGH HERE!'],
    nude: ['A NAKED CAT! ON MY AIRWAVES! RUSH LIMBAUGH HERE, AND THIS IS EXCELLENCE IN BROADCASTING!'],
  },
  reply: {
    clean: ['WHO THE FUCK IS THAT?', "IS HE ON THE RADIO? I'M STANDING RIGHT HERE, DUMBASS.", "WHO'S THIS? THE WEATHER GUY?", 'RUSH? LIKE THE BAND?', 'WHO ARE YOU? THE GUY FROM THE MATTRESS STORE COMMERCIALS?'],
    shitty: ["WHO? AND YEAH. IT'S ME.", 'WHO ARE YOU? AND KEEP MY PANTS OFF THE RADIO.', 'THE WEATHER GUY? FORECAST: SHITTY.', 'RUSH? I HAD A RUSH. IT WENT DOWN MY LEG.'],
    nude: ['WHO? AND STOP SAYING NAKED ON THE AIR, FAT ASS.', "I DON'T KNOW YOU. YOU'RE DESCRIBING MY DICK.", 'THE WEATHER GUY? COLD FRONT. ON MY BALLS.', 'RUSH? LIKE THE BAND? QUIT STARING, BAND.'],
  },
  taunt: {
    clean: [
      'DITTOS, KITTY! MEGA DITTOS!', 'TALENT ON LOAN FROM GOD, KITTY!', "I'M RIGHT NINETY-SEVEN POINT NINE PERCENT OF THE TIME!",
      'EXCELLENCE IN BROADCASTING! E-I-B!', 'ENVIRONMENTALIST WACKOS! THEY WANT TO SAVE THE CATS!',
      "LET'S GO TO THE PHONES! YOU'RE ON THE AIR, KITTY!", "HALF MY BRAIN, KITTY! AND I'M STILL WINNING!",
    ],
    shitty: ['THE PHONES ARE LIT UP! EVERYBODY SMELLS YOU!', 'THIS JUST IN! THE CAT SHIT ITSELF!'],
    nude: ["FOLKS, THE CAT'S NAKED! I'M NOT MAKING THIS UP!", 'PUT IT AWAY, KITTY! THIS IS A FAMILY STATION!', "FOLKS, IT'S BOUNCING! I'M DESCRIBING IT FOR THE LISTENERS AT HOME!"],
  },
  toss: ['HAVE A CIGAR!', 'ON THE AIR!', 'MEGA DITTOS!', 'E-I-B!'],
  flop: ['TIME FOR A COMMERCIAL BREAK!', 'HOLD MY CALLS, FOLKS! HOLD MY CALLS!'],
  baffled: {
    clean: [
      'WHAT THE FUCK IS A DITTO?', "WHO'S HE TALKING TO? NOBODY'S CALLING.", 'WHY IS THERE A RADIO SHOW IN A CAT CARTOON?', 'WHAT KID LISTENS TO THIS?',
      'A RADIO SHOW IN A CARTOON. I CAN SEE HIM. THAT DEFEATS THE PURPOSE.', "IT'S A KIDS SHOW AND THE BAD GUY SMOKES CIGARS. NICE.",
      'THEY MADE A TALK RADIO GUY A CARTOON VILLAIN. FOR WHAT KIDS?',
      "STILL DON'T KNOW YOU. JUST DO THE WEATHER.", "WHAT'S THE FIVE DAY, WEATHER GUY?", "I DON'T LISTEN TO THE RADIO. I DON'T KNOW YOU.",
    ],
    shitty: ['HE KEEPS TELLING THE RADIO I SHIT. THE RADIO KNOWS.', 'NOBODY CALL IN ABOUT MY PANTS.', "LONG TIME LISTENER. FIRST TIME SHITTER.",
      "STILL DON'T KNOW YOU, WEATHER GUY. HUMID WITH A CHANCE OF SHIT.", "I DON'T KNOW YOU. YOU KNOW MY PANTS. NOT FAIR."],
    nude: ["HE'S DESCRIBING MY DICK TO THE WHOLE COUNTRY.", 'WHO LISTENS THREE HOURS A DAY TO A GUY DESCRIBING A CAT DICK?', "NAKED ON THE RADIO. YOU CAN'T EVEN SEE IT. GOOD.",
      "STILL DON'T KNOW YOU. IT'S COLD. SAY THAT ON THE RADIO.", 'WEATHER GUY. SHRINKAGE ADVISORY. SHUT UP.'],
  },
  death: {
    clean: ["I'M... GOING TO A COMMERCIAL BREAK! DON'T TOUCH THAT DIAL!"],
    shitty: ["THE STINK! IT'S TOO MUCH! WE'LL BE RIGHT BACK!"],
    nude: ['DEAD AIR! DEAD AIR! THE NAKED CAT WINS!'],
  },
  after: {
    clean: ['OFF THE AIR. WHOEVER YOU WERE.', "I STILL DON'T KNOW WHAT A DITTO IS."],
    shitty: ['NOBODY CALL IN ABOUT MY PANTS.', 'OFF THE AIR. STILL SMELLS LIKE HIS CIGAR AND MY ASS.'],
    nude: ['HE TOLD THE WHOLE COUNTRY ABOUT MY DICK. THEN HE POOFED.', "OFF THE AIR. AND THAT'S THE WAY IT IS."],
  },
};

export const DOLE_LINES: PunditLines2 = {
  intro: {
    clean: ['BOB DOLE IS HERE, KITTY! AND BOB DOLE WANTS THIS WHITE HOUSE!'],
    shitty: ["BOB DOLE SMELLS SOMETHING, KITTY! BOB DOLE DOESN'T LIKE IT!"],
    nude: ['BOB DOLE SEES A NAKED CAT! BOB DOLE IS NOT HAPPY ABOUT IT!'],
  },
  reply: {
    clean: ["WHO'S BOB DOLE?", 'WHY DOES HE KEEP SAYING HIS OWN NAME? IS HE DRUNK?', 'WHOSE DAD ARE YOU? WHO LET YOU OUT?', 'BOB DOLE? LIKE THE PINEAPPLES?', "ARE YOU SOMEBODY'S GRANDPA? WHERE'S YOUR NURSE?"],
    shitty: ["I DON'T KNOW BOB DOLE. BOB DOLE KNOWS MY PANTS.", 'WHO? AND KEEP YOUR NOSE OUT OF MY BUSINESS. AND MY PANTS.', "WHOSE DAD ARE YOU? DON'T TELL MINE.", "THE PINEAPPLE GUY? I DON'T WANT FRUIT."],
    nude: ['WHO? AND BOB DOLE CAN STOP STARING.', "I DON'T KNOW YOU. EYES UP, BOB DOLE.", 'WHOSE DAD ARE YOU? GO PICK UP YOUR OWN KID.', 'THE PINEAPPLE GUY? EYES ON THE FRUIT, NOT MY BANANA.'],
  },
  taunt: {
    clean: [
      "BOB DOLE SAYS: WHERE'S THE OUTRAGE?", 'A FIFTEEN PERCENT TAX CUT! FOR BOB DOLE!', 'BOB DOLE IS THE MOST OPTIMISTIC MAN IN AMERICA!',
      'YOU KNOW WHO WANTS TO BE PRESIDENT? BOB DOLE!', 'BOB DOLE! BOB DOLE! BOB DOLE!', 'BOB DOLE IS A BRIDGE TO A BETTER TIME, KITTY!',
      'BOB DOLE WAS IN THE SENATE A LONG TIME, KITTY!',
    ],
    shitty: ['BOB DOLE KNOWS THAT SMELL! IT\'S THE SENATE CLOAKROOM!', 'BOB DOLE SAYS CHANGE YOUR PANTS!'],
    nude: ["BOB DOLE DOESN'T WANT TO SEE THAT!", 'BOB DOLE SAYS PUT SOME PANTS ON, SON!', 'BOB DOLE CAN SEE THE CAT DICK! BOB DOLE WANTS IT TO STOP BOUNCING!'],
  },
  toss: ['PINEAPPLE!', 'BOB DOLE! NINETY-SIX!', 'VOTE BOB DOLE!', 'HAVE A PINEAPPLE!'],
  flop: ['BOB DOLE IS OKAY!', 'BOB DOLE MEANT TO DO THAT!'],
  baffled: {
    clean: [
      'WHY THE FUCK ARE THERE PINEAPPLES?', "WHO'S BOB DOLE? IS HE BOB DOLE?", 'WHAT KIND OF KID WATCHES A GUY SAY HIS OWN NAME?',
      'A CAT VERSUS A SENATOR. SOMEBODY WAS ON COKE IN THAT PITCH MEETING.', "THE WRITERS QUIT AND LEFT A FRUIT BOWL.", 'HIS WHOLE BIT IS HIS NAME. HE HAS ONE BIT.',
      "STILL DON'T KNOW YOU. YOU LOOK LIKE A DAD AT TEE BALL.", 'ARE YOU THE GUY ON THE PINEAPPLE CAN?', "I'VE MET A THOUSAND BOB DOLES. ALL DADS.",
    ],
    shitty: ["BOB DOLE WON'T SHUT UP ABOUT MY PANTS.", 'PINEAPPLES AND MY PANTS. THE WRITERS WERE HIGH.', 'BOB DOLE SMELLS IT. EVERYBODY SMELLS IT.',
      "WHOSE DAD ARE YOU? GO HOME. I'M BUSY SHITTING.", "STILL DON'T KNOW YOU. EVERY DAD SMELLS LIKE THIS ANYWAY."],
    nude: ['BOB DOLE HAS SEEN MY DICK. BOB DOLE SAYS SO.', "WHY PINEAPPLES? WHY AM I NAKED? NOBODY KNOWS.", 'NAKED CAT. PINEAPPLES. NOBODY READ THIS SCRIPT.',
      "STILL DON'T KNOW YOU. SOMEBODY'S DAD SAW MY DICK.", "WHOSE DAD ARE YOU? YOU'RE SEEING TOO MUCH."],
  },
  death: {
    clean: ['BOB DOLE... WILL BE BACK! BOB DOLE!'],
    shitty: ['BOB DOLE... SMELLED THE CAT... BOB DOLE!'],
    nude: ['BOB DOLE... SAW TOO MUCH... BOB DOLE!'],
  },
  after: {
    clean: ['THAT WAS BOB DOLE, I GUESS.', "PINEAPPLES. I STILL DON'T GET IT. I NEVER WILL."],
    shitty: ['BYE, BOB DOLE. BOB DOLE SMELLED ME.', 'BOB DOLE IS GONE. MY SMELL IS RUNNING FOR A SECOND TERM.'],
    nude: ['BOB DOLE SAW MY DICK AND DIED.', "BOB DOLE'S GONE. MY PANTS ARE STILL GONE."],
  },
};

export const NEWT_LINES: PunditLines2 = {
  intro: {
    clean: ['I AM NEWT GINGRICH, SPEAKER OF THE HOUSE! AND I HAVE A CONTRACT! WITH AMERICA!'],
    shitty: ['NEWT GINGRICH HERE! AND THIS CAT IS IN VIOLATION OF MY CONTRACT WITH AMERICA!'],
    nude: ['NEWT GINGRICH, SPEAKER OF THE HOUSE! A NAKED CAT? IN THE OVAL OFFICE? SHUT IT DOWN!'],
  },
  reply: {
    clean: ['WHO? WHAT CONTRACT?', "I NEVER SIGNED SHIT. I CAN'T EVEN READ CURSIVE.", 'NEWT? LIKE THE LIZARD?', 'YOUR MOM NAMED YOU AFTER A LIZARD?', "THE SPEAKER? LIKE A STEREO? YOU'RE BLOWN OUT, BUDDY."],
    shitty: ["I DIDN'T SIGN ANY CONTRACT. I SIGNED MY PANTS.", 'WHO? WHAT VIOLATION? OH. THE SHIT. YEAH.', "A NEWT? LIZARDS DON'T SHIT THEIR PANTS. I DO.", 'THE SPEAKER? LIKE A STEREO? TURN IT DOWN.'],
    nude: ['WHO? AND QUIT YELLING SHUT IT DOWN AT MY DICK.', "I DON'T KNOW YOU. QUIT POINTING AT IT.", "A NEWT? NEWTS ARE NAKED TOO. WE'RE EVEN.", 'THE SPEAKER? STOP POINTING, STEREO.'],
  },
  taunt: {
    clean: [
      'THE CONTRACT WITH AMERICA, KITTY! TEN BILLS! A HUNDRED DAYS!', 'SHUT IT DOWN! SHUT THE WHOLE GOVERNMENT DOWN!',
      'THEY MADE ME GET OFF AIR FORCE ONE IN THE BACK! THE BACK!', 'THE REPUBLICAN REVOLUTION IS HERE, KITTY!', 'MISTER SPEAKER! THAT\'S ME!',
      'ORPHANAGES, KITTY! LIKE IN THE MOVIES!', 'NO BUDGET FOR CATS! NOT ONE DIME!',
    ],
    shitty: ['THIS CAT IS A SHUTDOWN! A SMELLY SHUTDOWN!', "I'M CUTTING FUNDING FOR YOUR PANTS!"],
    nude: ["INDECENCY! IN THE OVAL OFFICE! THAT'S A BILL!", 'NO PANTS? THAT IS A HUNDRED DAYS, KITTY!', "I'M CUTTING THE FUNDING FOR THAT THING'S BOUNCE!"],
  },
  toss: ['SIGN IT!', 'THE CONTRACT!', 'ORDER! ORDER!', 'SHUTDOWN!'],
  flop: ['THE BACK OF THE PLANE! THE BACK OF THE PLANE!', "IT'S NOT FAIR! I'M THE SPEAKER!"],
  baffled: {
    clean: [
      'WHAT CONTRACT? WITH WHO?', "WHY'S HE CRYING ABOUT A PLANE?", 'WHAT KID WANTS TO WATCH A GUY SHUT DOWN A GOVERNMENT?', 'WHO THE FUCK IS THIS GUY?',
      'THE FINAL BOSS IS A GUY WITH PAPERWORK. LIKE THE DMV.', "THE SEASON FINALE IS A BUDGET FIGHT. NO WONDER IT'S DEAD.",
      'A GAVEL. HE FIGHTS WITH A GAVEL. WHAT A PUSSY.',
      "STILL DON'T KNOW YOU, LIZARD.", "WHERE'S YOUR TAIL, NEWT? I GOT ONE.", 'A LIZARD WITH A GAVEL. SURE. WHY NOT.',
    ],
    shitty: ['HE WANTS TO SHUT IT DOWN. MY ASS ALREADY DID.', 'CUT FUNDING FOR MY PANTS. THEY GOT NOTHING LEFT.', 'ORDER? I LOST ORDER AT THE FAIRY WHEEL.',
      "STILL DON'T KNOW YOU, LIZARD. GET OUT OF MY SWAMP.", 'LIZARDS SMELL WITH THEIR TONGUES. GOOD LUCK, LIZARD.'],
    nude: ['HE WANTS A BILL ABOUT MY DICK.', 'ALL HE DOES IS POINT AT MY DICK AND YELL.', 'SIGN THIS? WITH WHAT? MY DICK?',
      "STILL DON'T KNOW YOU. NAKED LIZARD, NAKED CAT.", 'SOME LIZARD IS POINTING AT MY DICK.'],
  },
  death: {
    clean: ['THE CONTRACT... IS... VOID!'],
    shitty: ['THE CONTRACT... SMELLS... VOID!'],
    nude: ['A NAKED CAT... BROKE... THE CONTRACT!'],
  },
  after: {
    clean: ["THAT'S ALL OF THEM? I DIDN'T KNOW ONE OF THESE ASSHOLES."],
    shitty: ["THAT'S ALL OF THEM. AND ALL OF MY PANTS."],
    nude: ["THAT'S ALL OF THEM. THEY ALL SAW MY DICK."],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The Clintons on the TV, the screen coming down, the real stage

/** On the TV from the UN (the show's Clintons, the show's tune). */
export const BILL_TV: ByPants = {
  clean: ['SOCKS, BUDDY! WE SAW THE WHOLE THING FROM THE U.N.! THANK YOU FOR YOUR SERVICE!'],
  shitty: ["SOCKS, BUDDY! THANK YOU FOR YOUR SERVICE! AND, UH, WE'LL GET THE CARPETS CLEANED."],
  nude: ['SOCKS, BUDDY! THANK YOU FOR YOUR SERVICE! AND, UH, NICE TO SEE ALL OF YOU.'],
};
export const HILLARY_TV: ByPants = {
  clean: ['YOU STOPPED ALL THOSE BAD MEN, SOCKS. IT TAKES A VILLAGE. AND A CAT.'],
  shitty: ['YOU STOPPED THOSE BAD MEN, SOCKS. NOW SOMEBODY TAKE HIM TO THE VET.'],
  nude: ['YOU STOPPED THOSE BAD MEN, SOCKS. CHELSEA, COVER YOUR EYES.'],
};
/** Him, to the TV. */
export const TV_REPLY: ByPants = {
  clean: ['WHO THE FUCK ARE YOU TWO?', "I DON'T KNOW YOU EITHER. NOBODY HERE KNOWS ANYBODY.", 'WHO ARE THESE PEOPLE AND WHY ARE THEY THANKING ME?',
    "THE KID'S PARENTS? I DON'T KNOW THE KID EITHER.", 'THANKS FOR WHAT? WHO ARE YOU?'],
  shitty: ["WHO ARE YOU? AND DON'T TALK ABOUT MY CARPET.", "WHO ARE YOU? THE CARPET'S FINE. IT'S BROWN NOW. IT'S FINE.",
    'WHO ARE THESE PEOPLE AND WHY ARE THEY THANKING ME? I SHIT ON THEIR RUG.', 'THANKS FOR WHAT? WHO ARE YOU? WHERE IS YOUR BATHROOM?'],
  nude: ["WHO ARE YOU? AND QUIT LOOKING. IT'S A CARTOON.", "I DON'T KNOW YOU. STOP WAVING AT MY DICK.",
    'WHO ARE THESE PEOPLE AND WHY ARE THEY THANKING A NAKED GUY?', "THE KID'S PARENTS? STILL DON'T KNOW THE KID. GOT PANTS?"],
};
/** The screen going (her own voice breaking through). */
export const ACTRESS_FALL = ['OH NO. NO, NO, NO, NO!'];
/** The cat slid off him: he never was one. */
export const NOT_A_CAT: ByPants = {
  clean: ["I WASN'T A CAT. IT WAS A FUCKING PROJECTOR."],
  shitty: ["I WASN'T A CAT. I WAS A GUY WHO SHIT HIMSELF. WITH A PROJECTOR ON HIM."],
  nude: ["I WASN'T A CAT. I WAS JUST NAKED. THE WHOLE TIME."],
};
/** The body, the camera in close on it (the user's line, word for word, whatever the state of him). */
export const SEES_NEWT: ByPants = {
  clean: ["HE DEFINITELY DIDN'T POOF."],
  shitty: ["HE DEFINITELY DIDN'T POOF."],
  nude: ["HE DEFINITELY DIDN'T POOF."],
};
/** The actress, on her knees, being sick: get out. */
export const ACTRESS_OUT: ByPants = {
  clean: ['GET OUT. JUST GET OUT OF HERE.'],
  shitty: ["GET OUT. YOU SMELL LIKE SHIT AND HE'S... HE'S... GET OUT."],
  nude: ['GET OUT. PUT SOMETHING ON AND GET OUT.'],
};
/** Him, back. */
export const ACTRESS_ANSWER: ByPants = {
  clean: ["YOU'RE NOT A KID.", 'SURE. NICE WORKING WITH YOU. NOT REALLY.'],
  shitty: ['SURE. YOU GOT A BATHROOM BACK THERE?', "SURE. I'LL SHOW MYSELF OUT. AND MY PANTS."],
  nude: ['SURE. YOU GOT ANY PANTS BACK THERE?', "SURE. I'LL GO. FIND ME A TOWEL ON THE WAY OUT."],
};
/** The actress after (he's still about): now and then, between heaves. */
export const ACTRESS_NAG: ByPants = {
  clean: [
    'PLEASE LEAVE.', "I'M TWENTY-NINE. I WAS PLAYING TWELVE.", 'THE AUDIENCE RAN. THEY ALL RAN.', 'HE DID DINNER THEATER. HE HAD A DOG.',
    'STOP LOOKING AT ME. GO.', 'THEY TOLD ME IT WAS SAFE. THEY SAID IT WAS JUST A PROJECTOR.',
  ],
  shitty: ['THE SMELL. OH GOD, THE SMELL. GO.', 'YOU SHIT YOURSELF ON A KIDS SHOW. GO.'],
  nude: ['I CAN SEE EVERYTHING. GO.', 'YOU WERE NAKED THE WHOLE TIME. UNDER THE CAT. GO.'],
};
/** Out the stage door. */
export const LEAVING: ByPants = {
  clean: ["I'M DONE WITH CARTOONS.", "NOBODY CALL THE COPS. THEY'LL THINK IT WAS ME. IT WAS ME."],
  shitty: ["I'M DONE WITH CARTOONS. AND THESE PANTS.", 'NOBODY CALL THE COPS. CALL A PLUMBER. FOR MY PANTS.'],
  nude: ["I'M DONE WITH CARTOONS. NOW I NEED PANTS.", "NOBODY CALL THE COPS. I'M NAKED ENOUGH."],
};
/** Back on the stage later (the screen's down). */
export const STAGE_AGAIN: ByPants = {
  clean: ["THE STAGE. STILL A MESS. NOBODY'S PAYING THE JANITOR ENOUGH.", 'NOBODY CLEANED UP.'],
  shitty: ['STILL A MESS. I SMELL LIKE THE RIGHT GUY FOR IT.', 'NOBODY CLEANED UP. ME NEITHER.'],
  nude: ['STILL A MESS. STILL NAKED. STILL NOT A CAT.', 'NOBODY CLEANED UP. NOBODY BROUGHT PANTS.'],
};
/** Part one, back through it with the screen down: no cat, no cartoon. */
export const STAGE_WH1: ByPants = {
  clean: ['NO CAT. NO CARTOON. JUST A STAGE.', 'IT WAS PLYWOOD. THE WHOLE WHITE HOUSE.'],
  shitty: ['NO CAT. JUST PLYWOOD AND MY SHIT STAINS ON IT.', 'PLYWOOD. AND THE SMELL WAS ME THE WHOLE TIME.'],
  nude: ['NO CAT. NO FUR. JUST MY HAIRY ASS ON A PLYWOOD STAGE.', 'PLYWOOD. AND I WAS NAKED IN FRONT OF A CROWD.'],
};
/** At each pundit's actor, the first time back past him (once each a visit). */
export const BODY_LINES: Record<'perot' | 'falwell' | 'limbaugh' | 'dole' | 'staff' | 'wig', ByPants> = {
  perot: {
    clean: ['THE FAKE EARS CAME OFF. SO DID HIS REAL ONES.'],
    shitty: ['HIS EARS CAME OFF. I SHIT MYSELF. WE BOTH HAD A DAY.'],
    nude: ["HIS EARS CAME OFF. I'M NAKED. NOBODY'S HAVING A GOOD DAY."],
  },
  falwell: {
    clean: ['CHOKED ON MY HAIRBALLS. EVERY ONE OF THEM.'],
    shitty: ['CHOKED ON MY HAIRBALLS. AND HE SMELLED ME FIRST.'],
    nude: ['CHOKED ON MY HAIR. NOT ALL OF IT FROM MY HEAD.'],
  },
  limbaugh: {
    clean: ['HUNG BY HIS OWN MIC CORD. STILL ON THE AIR.'],
    shitty: ['STILL ON THE AIR. DEAD AIR. AND I STILL SMELL.'],
    nude: ["HUNG BY THE MIC CORD. THE ON AIR LIGHT'S STILL ON."],
  },
  dole: {
    clean: ['A PINEAPPLE. IN HIS HEAD. CARTOONS ARE FUCKED.'],
    shitty: ['A PINEAPPLE IN HIS HEAD. AND I SHIT MYSELF. WHAT A SHOW.'],
    nude: ['A PINEAPPLE IN HIS HEAD. ME NAKED. WHAT A SHOW.'],
  },
  staff: {
    clean: ["I THOUGHT THEY ALL WENT POOF. GUESS I'M A MURDERER. AGAIN.", "THEY DIDN'T GO POOF. THEY JUST WENT."],
    shitty: ["THEY DIDN'T GO POOF. I DID. IN MY PANTS.", 'ALL THESE DEAD GUYS. AND THE WORST SMELL IS STILL ME.'],
    nude: ["THEY DIDN'T POOF. THEY'RE JUST DEAD. AND I'M NAKED.", 'ALL THESE GUYS. KILLED BY A NAKED MAN THEY THOUGHT WAS A CAT.'],
  },
  wig: {
    clean: ['SHE LEFT HER HAIR. AND HER LUNCH.', 'HER WIG. AND A LOT OF PUKE.'],
    shitty: ['HER WIG. HER PUKE. MY SHIT. TEAMWORK.', 'SHE LEFT HER HAIR. I LEFT SOMETHING TOO.'],
    nude: ['HER WIG. I COULD WEAR IT. AS A DIAPER.', 'SHE LEFT HER HAIR. NOBODY LEFT PANTS.'],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The new mean men (barks: rare, short, by the state of him)

export const SPIN_BARK: ByPants = {
  clean: ["LET ME SPIN THIS, KITTY! YOU'RE NOT DEAD, YOU'RE PRE-ALIVE!", "THAT'S NOT A SCRATCH! THAT'S A NARRATIVE!", 'NO COMMENT! OFF THE RECORD, FUCK YOU!'],
  shitty: ["THAT SMELL? IT'S A PERCEPTION PROBLEM!", 'I CAN SPIN ANYTHING! NOT THAT! NOBODY CAN SPIN THAT!'],
  nude: ["A NAKED CAT? I CAN'T SPIN THAT!", "NO PANTS? WE'LL CALL IT TRANSPARENCY!", "THE CAT'S DICK IS OUT. OFF THE RECORD, IT'S BOUNCING."],
};
export const SPIN_GO = ['SPIN CYCLE!', 'WATCH ME SPIN!', 'TALKING POINTS!'];
export const DITTO_BARK: ByPants = {
  clean: ['DITTOS! DITTOS FROM THE WHITE HOUSE!', 'RUSH IS RIGHT! RUSH IS ALWAYS RIGHT!', 'I LISTEN THREE HOURS A DAY! MY WIFE LEFT ME!'],
  shitty: ['RUSH SAYS YOU STINK! DITTOS!', 'DITTOS ON THE SMELL! MEGA DITTOS ON THE SMELL!'],
  nude: ['RUSH SAYS PUT PANTS ON! DITTOS!', "NAKED CAT! I'M CALLING IN! I'VE BEEN ON HOLD SINCE NINETY-TWO!", "I CAN SEE THE CAT'S WIENER! IS THAT ON THE RADIO TOO?"],
};
export const DITTO_BLAST = ['DITTOS!', 'TURN IT UP!', 'MEGA DITTOS!'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here, and the death screens (28 characters at most)

export const HURT2: HurtTable = {
  'm2:ct_spindoc': { hurt: ['THE SPIN DOCTOR SPUN ME!', 'HE SPUN ME LIKE A PRESS RELEASE!', 'TWISTED BY A SUIT!'], death: ['SPUN TO DEATH', 'KILLED BY A SPIN DOCTOR'] },
  'm2:ct_ditto': { hurt: ['THE DITTOHEAD HIT ME!', 'OW! A RADIO TO THE FACE!', 'HE HIT ME WITH A CLOCK RADIO!'], death: ['DITTOED TO DEATH', 'KILLED BY A FAN'] },
  'm2:ct_wave_shot': { hurt: ['TALK RADIO! IN MY EARS!', 'TALK RADIO! MY EARS ARE BLEEDING!', 'BLASTED BY A RADIO!'], death: ['KILLED BY TALK RADIO', 'TURNED UP TO DEATH'] },
  'm2:ct_drawer': { hurt: ['A DRAWER! IN MY GUT!', 'FILED! UNDER F FOR FUCK!', 'THE CABINET PUNCHED ME!'], death: ['FILED AWAY', 'KILLED BY A DRAWER'] },
  'm2:ct_burner': { hurt: ['THE STOVE! MY FUR!', "MY ASS! IT'S ON THE BACK BURNER!", 'HOT! HOT! HOT!'], death: ['COOKED ON A STOVE', 'BURNED TO A CRISP'] },
  'm2:ct_globe': { hurt: ['THE WHOLE WORLD HIT ME!', 'FLATTENED BY A GLOBE!', 'OW! I GOT HIT BY CANADA!'], death: ['CRUSHED BY THE WORLD', 'GLOBED'] },
  'm2:ct_laser': { hurt: ['LASER! MY FUR!', 'IT LASERED MY BUTTHOLE!', 'OW! THE BEAM!'], death: ['LASERED', 'CUT IN HALF BY A LASER'] },
  'm2:ct_limbaugh': { hurt: ['LIMBAUGH SAT ON ME!', "HE SAT ON ME! HE'S ALL HAM!", 'BELLY BUMPED!'], death: ['SQUASHED BY LIMBAUGH', 'TAKEN OFF THE AIR'] },
  'm2:ct_cigar_shot': { hurt: ['A LIT CIGAR! MY FUR!', 'A CIGAR BURN! RIGHT ON MY NIPPLE!', 'SMOKED!'], death: ['KILLED BY A CIGAR', 'SMOKED'] },
  'm2:ct_mic_shot': { hurt: ['HIT BY A MICROPHONE!', 'THE GOLDEN EIB MIC! IN MY TEETH!', 'MIC TO THE FACE!'], death: ['MIC DROPPED ON', 'KILLED BY A MICROPHONE'] },
  'm2:ct_dole': { hurt: ['DOLE STOMPED ME!', 'BOB DOLE STOMPED ME! BOB DOLE IS STRONG!', 'BOB DOLED!'], death: ['STOMPED BY BOB DOLE', 'BOB DOLED'] },
  'm2:ct_pineapple_shot': { hurt: ['A PINEAPPLE! IN THE FACE!', 'A PINEAPPLE! THE SPIKY END!', 'PINEAPPLED!'], death: ['KILLED BY A PINEAPPLE', 'FRUITED'] },
  'm2:ct_button_shot': { hurt: ['A CAMPAIGN BUTTON!', "THE PIN! IT'S STUCK IN MY TIT!", 'VOTED IN THE FACE!'], death: ['KILLED BY A BUTTON', 'VOTED OUT'] },
  'm2:ct_newt': { hurt: ['NEWT FLATTENED ME!', 'THE SPEAKER OF THE HOUSE SAT ON MY FACE!', 'SAT ON BY THE SPEAKER!'], death: ['FLATTENED BY NEWT', 'SHUT DOWN'] },
  'm2:ct_contract_shot': { hurt: ['HIT BY A CONTRACT!', 'A HUNDRED PAGES! IN MY EYE!', 'CONTRACTED!'], death: ['KILLED BY A CONTRACT', 'SIGNED, SEALED, DEAD'] },
  'm2:ct_gavel_shot': { hurt: ['A GAVEL! ON MY HEAD!', 'ORDER IN THE COURT! MY SKULL!', 'GAVELED!'], death: ['GAVELED TO DEATH', 'ORDER IN THE HOUSE'] },
};

// ---------------------------------------------------------------------------------------------------------------
// The announcer's kill callouts, by kind

export const KILL_CALLS2: Record<string, Record<string, string[]>> = {
  'm2:ct_spindoc': { charge: ['SPUN OUT!', 'NO COMMENT!'], uppercut: ['OFF MESSAGE!'], divekick: ['SPIN CONTROL!'] },
  'm2:ct_ditto': { charge: ['DITTO THAT!', 'OFF THE DIAL!'], uppercut: ['SIGNED OFF!'], divekick: ['STATIC!'] },
};

const meatPundit = (l: PunditLines2) => [...allOf(l.reply), ...allOf(l.baffled), ...allOf(l.after)];
const punditPools = (l: PunditLines2) => [...allOf(l.intro), ...allOf(l.taunt), ...l.toss, ...l.flop, ...allOf(l.death)];
/** The announcer's call as each pundit goes down (pundits.ts: their SPECS' call). */
export const LIMBAUGH_DOWN = 'LIMBAUGH SIGNS OFF!';
export const DOLE_DOWN = 'BOB DOLE DROPS!';
export const NEWT_DOWN = 'NEWT IS SHUT DOWN!';

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...Object.values(GAGS2).flatMap(allOf), ...meatPundit(LIMBAUGH_LINES), ...meatPundit(DOLE_LINES), ...meatPundit(NEWT_LINES),
    ...allOf(TV_REPLY), ...allOf(NOT_A_CAT), ...allOf(SEES_NEWT), ...allOf(ACTRESS_ANSWER), ...allOf(LEAVING), ...allOf(STAGE_AGAIN),
    ...allOf(STAGE_WH1), ...Object.values(BODY_LINES).flatMap(allOf), ...Object.values(HURT2).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT2).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS2).flatMap(k => Object.values(k).flat())), LIMBAUGH_DOWN, DOLE_DOWN, NEWT_DOWN],
  [CHELSEA2]: [
    ...Object.values(HINT2).flat(), ...GLOBE_RUN, ...LIMBAUGH_COMING, ...DOLE_COMING, ...NEWT_COMING, ...QUEASY_LIMBAUGH, ...QUEASY_DOLE,
    ...QUEASY_NEWT, ...WOBBLY,
  ],
  [LIMBAUGH]: punditPools(LIMBAUGH_LINES),
  [DOLE]: punditPools(DOLE_LINES),
  [NEWT]: punditPools(NEWT_LINES),
  [BILL]: allOf(BILL_TV),
  [HILLARY]: allOf(HILLARY_TV),
  [ACTRESS]: [...ACTRESS_FALL, ...allOf(ACTRESS_OUT), ...allOf(ACTRESS_NAG)],
  [MEAN2.spindoc]: [...allOf(SPIN_BARK), ...SPIN_GO], [MEAN2.spindocf]: [...allOf(SPIN_BARK), ...SPIN_GO],
  [MEAN2.ditto]: [...allOf(DITTO_BARK), ...DITTO_BLAST], [MEAN2.dittof]: [...allOf(DITTO_BARK), ...DITTO_BLAST],
};
