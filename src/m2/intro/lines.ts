// What's said on the way in (the intro, intro/index.ts): Meathead at the ticket window, the ticket lady, park security
// when he starts something, and the PA in America USA. Where somebody reacts to him, three ways: in clean pants, in
// shitty ones (game/player/gut.ts), and naked. Recorded with the rest (tools/voices: extract.ts, m2pack.ts; the voices
// in tools/voices/cast.json).

export const TICKET_VOICE = { id: 'm2.ticket', pitch: 0, rate: 1 };
export const GUARD_VOICE = { id: 'm2.guard', pitch: 0, rate: 1 };
export const GUARD_F_VOICE = { id: 'm2.guardf', pitch: 0, rate: 1 };
export const PA_VOICE = { id: 'm2.pa', pitch: 0, rate: 1 };
/** People in line: a woman's voice, a man's. */
export const GUEST_VOICE = { id: 'm2.guest', pitch: 0, rate: 1 };
export const GUEST2_VOICE = { id: 'm2.guest2', pitch: 0, rate: 1 };

export type Dressed = 'clean' | 'shitty' | 'nude';

/** Meathead, out of the truck he's just put into a pillar (and out of its window: the door won't open now). */
export const MEATHEAD_PARKED = ['PARKED.', "INSURANCE IS THE GOVERNMENT'S PROBLEM.", 'FOUR SPACES. I EARNED THEM.', 'WHO THE FUCK PUTS A PILLAR THERE?'];
/** Meathead at the window, before he shows his ticket (or goes for it and finds he hasn't got one). */
export const MEATHEAD_TICKET: Record<Dressed, string[]> = {
  clean: ['ONE ADULT, SWEETHEART. A BIG ONE.', 'PRINTED IT AT HOME. IN COLOR.', 'TICKET. THE GOVERNMENT PAID FOR IT.', "ONE TICKET. DON'T MAKE IT WEIRD."],
  shitty: ["IT'S A LITTLE DAMP. IT STILL SCANS.", "DON'T SMELL IT. JUST SCAN IT.", 'IT WAS IN MY BACK POCKET. BAD CALL.', "THAT'S NOT MUD."],
  nude: ['MY TICKET WAS IN MY PANTS. MY PANTS BLEW UP.', 'I HAD A TICKET! IT WENT WITH THE PANTS!', "CHECK MY ASS CRACK. MAYBE IT'S IN THERE.", "WHERE'S MY TICKET? WHERE'S MY ANYTHING?"],
};

/** The ticket lady, to him. */
export const TICKET_LADY: Record<Dressed, string[]> = {
  clean: ["WELCOME TO HAPPY LAND. GOD BLESS, AND DON'T SUE.", "ENJOY YOUR DAY. FREEDOM ISN'T FREE. NEITHER ARE CHURROS."],
  shitty: ['SIR, YOUR TICKET IS WET. WHY IS IT WARM?', "I'M NOT TOUCHING THAT. JUST GO."],
  nude: ['SIR, YOU HAVE NO TICKET AND NO PANTS.', 'SIR, YOUR PENIS IS ON MY COUNTER.'],
};
/** ...serving whoever's in front of him: just this. */
export const TICKET_NEXT = ['NEXT!', 'NEXT. GOD BLESS.', 'NEXT, PLEASE.', 'WELCOME TO HAPPY LAND. NEXT.'];
/** ...when he starts something (or she's knocked out cold: nothing). */
export const TICKET_ALARM = ['SECURITY! SECURITY!', 'SECURITY! THE BIG ONE!'];

/** Park security, the moment he starts something (the first one to see it). */
export const GUARD_ALERT: Record<Dressed, string[]> = {
  clean: ["HEY! THAT'S A PARK POLICY VIOLATION, ASSHOLE!", 'CODE RED! CODE RED!', 'GET ON THE GROUND, YOU BIG DUMB SON OF A BITCH!'],
  shitty: ['CODE BROWN! CODE BROWN!', "HE SHIT HIMSELF AND HE'S SWINGING!", "OH GOD, HE'S LEAKING! GET HIM!"],
  nude: ["HE'S NAKED AND HE'S PUNCHING PEOPLE!", 'CODE RED! AND CODE... DICK!', 'GET ON THE GROUND! NOT LIKE THAT!'],
};
/** The first guard he comes to, in the garage: the park's welcome (it's Happy Land; America USA's only the bit at the front). */
export const GUARD_WELCOME: Record<Dressed, string> = {
  clean: 'WELCOME TO HAPPY LAND, SIR.',
  shitty: 'WELCOME TO HAPPY LAND, SIR. ...JESUS CHRIST.',
  nude: 'WELCOME TO HAPPY LAND, SIR. ...SIR?',
};
/** Park security, not after him (yet): a word as he goes by, depending on the state of him. */
export const GUARD_IDLE: Record<Dressed, string[]> = {
  clean: ['HAVE A PATRIOTIC DAY, SIR.', 'YOU LOOK LIKE THAT GUY WHO KILLED THE PRESIDENT.', 'NICE TRUCK. SHITTY PARKING.', 'NO RUNNING. FREEDOM WALKING ONLY.'],
  shitty: ['SIR, YOU SHIT YOUR PANTS.', "SIR, IT'S COMING OUT YOUR CUFFS.", 'RESTROOMS ARE ON EVERY LEVEL. TOO LATE, HUH?', "THEY DON'T PAY ME ENOUGH TO SMELL THAT."],
  nude: ['SIR, WHERE ARE YOUR PANTS?', 'NICE GLASSES, SIR. NOTHING ELSE, THOUGH.', 'THAT IS A LOT OF MAN, SIR.', "I DIDN'T SEE THAT. I'M NOT WRITING THAT UP."],
};
/** ...and now and then, having a go at him. */
export const GUARD_BARK: Record<Dressed, string[]> = {
  clean: ['STOP RESISTING!', 'YOU HAVE THE RIGHT TO REMAIN HAPPY!', 'I MAKE NINE BUCKS AN HOUR! STOP HITTING ME!'],
  shitty: ["I'M NOT TOUCHING HIM! YOU TOUCH HIM!", 'SOMEBODY GET A HOSE!', 'HE GOT SHIT ON MY BADGE!'],
  nude: ["DON'T LOOK AT IT! TAKE HIM DOWN!", "I'M NOT TACKLING HIM! HE'S NAKED!", 'THERE ARE FAMILIES HERE, YOU PERVERT!'],
};

/** The PA (the same announcer as America USA's), the night the last land's cleared: the alpha's ending (alphaEnd.ts).
 *  Three lines, one after another (the user's one speech, split so each fits on screen). */
export const PA_ALPHA_END = [
  'CONGRATULATIONS! YOU FINISHED THE ALPHA BUILD OF MEATHEAD 2!',
  'CHECK BACK LATER-ISH FOR THE GRAND ENDGAME CONTENT!',
  'NEW FEATURES IN THE MAIN GAME TOO, PROBABLY. STAY TUNED!',
  'OR YOU CAN LOAD YOUR SAVED GAME AND TEST THE NEW WEAPON YOU JUST GOT.',
  'IF YOU WANT TO HEAR MY WONDERFUL VOICE AGAIN, EXIT THROUGH AMERICA USA FROM YOUR SAVED GAME.',
  "IF YOU CHOSE NOT TO SAVE YOUR GAME, YOU'RE SHIT OUT OF LUCK.",
  'SORRY TO HAVE INTERRUPTED YOU.',
  'GOODBYE.',
];

/** The PA, in America USA: every so often, annoyingly. */
export const PA_LINES = [
  'AMERICA USA: VOTED GREATEST LAND IN HAPPY LAND. BY AMERICA USA.',
  "TODAY'S FREEDOM FORECAST: ONE HUNDRED PERCENT.",
  'FRENCH FRIES ARE NOW FREEDOM FRIES. FRENCH KISSING IS NOW A MISDEMEANOR.',
  'WOULD THE OWNER OF THE RED PICKUP IN THE PILLAR ON LEVEL THREE... NEVER MIND. GOD BLESS.',
  'THIS LAND IS YOUR LAND. TERMS AND CONDITIONS APPLY.',
  'LOST CHILDREN WILL BE HELD AT GUEST SERVICES. UNCLAIMED CHILDREN WILL BE DRAFTED.',
  'THE TRAIN IN CHICAGO-ISH DOES NOT STOP. STOP WAITING FOR IT.',
  'THE BALD EAGLE ENCOUNTER IS CLOSED. THE EAGLE WON.',
  'THE CURRENT WAIT AT THE TICKET WINDOW IS: YES.',
  'IT IS PRONOUNCED CHOWDAH. GUESTS SAYING CHOWDER WILL BE ESCORTED OUT.',
  'PLEASE DO NOT FEED THE SECURITY STAFF.',
  'THE EAGLE BY THE TICKET BOOTHS IS A SHRUB. STOP SALUTING THE SHRUB.',
  'THE FOUNTAIN OF FREEDOM IS NOT A TOILET. WE CAN SEE YOU, SIR.',
  'NACHO CHEESE IS NOW LEGALLY CHEESE. GOD BLESS.',
  'HAPPY LAND IS NOT RESPONSIBLE FOR LOST FINGERS.',
];

/** The people in line behind him, when he's at the window holding it up. */
export const GUEST_HURRY: Record<Dressed, string[]> = {
  clean: ['HURRY IT UP, DIPSHIT!', "IT'S A TICKET, NOT A MORTGAGE, DUMBASS!", "WE'VE BEEN IN LINE SINCE BREAKFAST, ASSHOLE!", 'MOVE, YOU BIG DUMB OX!'],
  shitty: ['MOVE YOUR SHITTY ASS!', "MY KID'S EYES ARE WATERING, ASSHOLE!", "THE WHOLE LINE'S GAGGING, YOU ANIMAL!", 'THE WIND CHANGED! HURRY UP!'],
  nude: ['MOVE IT, BALLS!', 'MY KIDS ARE BACK HERE, YOU PERVERT!', "I DIDN'T PAY TO SEE YOUR ASS! MOVE!", "WHY IS HE NAKED? WHY ISN'T HE MOVING?"],
};
/** The people in line, about the state of him: when it happens right there in front of them... */
export const GUEST_REACT_NOW: Record<Exclude<Dressed, 'clean'>, string[]> = {
  shitty: ['DID HE JUST SHIT HIMSELF? IN LINE?', 'OH GOD. HE DID.', 'THAT SOUNDED WET.'],
  nude: ['HIS PANTS JUST EXPLODED!', "WHERE'D HIS PANTS GO?!", "COVER THE KIDS' EYES!"],
};
/** ...and, stood near him while he's like that, now and then. */
export const GUEST_REACT: Record<Exclude<Dressed, 'clean'>, string[]> = {
  shitty: ['IS THAT COMING FROM HIM?', "HONEY, DON'T BREATHE.", 'I CAN TASTE IT. WHY CAN I TASTE IT?', 'SOMEBODY GET A MOP. AND A PRIEST.'],
  nude: ['KIDS, LOOK AT THE FLAGS. ONLY THE FLAGS.', 'PUT IT AWAY, PAL!', "HE'S GOT NO TAN LINES. HE DOES THIS A LOT.", "I'VE SEEN BIGGER. NOT MUCH BIGGER."],
};
/** ...when he's got past them to the window. */
export const GUEST_CUT: Record<Dressed, string[]> = {
  clean: ['HEY! NO CUTTING, ASSHOLE!', 'BACK OF THE LINE, MEATHEAD!'],
  shitty: ['NO CUTTING! AND YOU STINK!', 'BACK OF THE LINE, SHIT PANTS!'],
  nude: ['HEY! NO CUTTING! OR NUDITY!', 'BACK OF THE LINE! AND GET DRESSED!'],
};
// ---------------------------------------------------------------------------------------------------------------
// The walk back in (after Wilderness Land's boss: the walk-away's HEADING BACK TO PARK, then here from the parking
// lot, in off the real wilderness: blood, sawdust, sewer muck, leaves).

/** Meathead, walked back into the parking garage from the actual woods (his truck still in the pillar). */
export const MEATHEAD_BACK_LOT: Record<Dressed, string[]> = {
  clean: ['HOW THE FUCK AM I IN THE PARKING LOT?', "THERE'S MY TRUCK. STILL IN THE PILLAR.", 'THE WOODS SPIT ME OUT IN THE PARKING LOT.'],
  shitty: ['THREE MILES OF WOODS IN SHITTY PANTS. CHAFED RAW.', 'A RACCOON FOLLOWED ME FOR A MILE. HE WANTED IT.', 'THE DEER WOULDN\'T EVEN COME NEAR ME.'],
  nude: ['WALKED BACK FROM THE WOODS BALLS OUT.', 'THE MOSQUITOES GOT EVERYTHING. EVERYTHING.', 'NAKED IN A PARKING GARAGE. NEW LOW.'],
};
/** The first guard he comes to, the way back in: he's been in already. */
export const GUARD_WELCOME_BACK: Record<Dressed, string> = {
  clean: 'WELCOME BACK, SIR. IS THAT BLOOD?',
  shitty: 'WELCOME BACK, SIR. YOU WALKED HERE LIKE THAT?',
  nude: 'WELCOME BACK, SIR. YOU HAVE A LEAF ON YOUR... OH GOD.',
};
/** The ticket window again, the way back in: his opener, her answer, his last word (one exchange: the same place in
 *  each list goes together). Naked, there's no last word: she gets knocked out (the intro's naked rule). */
export const MEATHEAD_REENTRY: Record<Dressed, string[]> = {
  clean: ["I'M BACK. GOT MY TICKET RIGHT HERE.", "COMING BACK IN. DON'T ASK.", 'RE-ENTRY. ONE ADULT.'],
  shitty: ['ME AGAIN.', 'I NEED BACK IN.', 'RE-ENTRY. SCAN IT.'],
  nude: ["LET ME BACK IN. MY TICKET'S SOMEWHERE IN THE WOODS.", 'I GOT A RE-ENTRY STAMP. IT WAS ON MY ASS.', 'OPEN UP. I WALKED HERE FROM THE WOODS.'],
};
export const TICKET_REENTRY: Record<Dressed, string[]> = {
  clean: ["THAT TICKET'S BEEN USED. WHERE'S YOUR HAND STAMP?", 'SIR, THERE ARE PINE NEEDLES IN YOUR TEETH.', 'WE DO NOT DO RE-ENTRY. HOW DID YOU EVEN GET OUT?'],
  shitty: ['OH NO. THE WARM TICKET.', 'SIR, YOU SMELL WORSE THAN LAST TIME.', "YOU'VE GOT SAWDUST STUCK ALL OVER YOUR... THAT'S NOT SAWDUST."],
  nude: ['NO TICKET. NO STAMP. NO PANTS. NO.', "SIR, THAT'S A BEE STING.", "SIR, THERE'S A TICK ON YOUR... NO. JUST NO."],
};
export const MEATHEAD_REENTRY_BACK: Record<Exclude<Dressed, 'nude'>, string[]> = {
  clean: ['SOMEWHERE UNDER ALL THIS BLOOD.', "YOUR LOG RIDE DOESN'T STOP AT THE FENCE, LADY.", 'SEWER. RIVER. WOODCHIPPER. DIRT BIKES. PARKING LOT.'],
  shitty: ["IT'S BEEN THROUGH A SEWER SINCE. IT'S CLEANER.", 'I WAS IN YOUR SEWER, LADY. WHAT DID YOU EXPECT?', 'SOME OF IT IS.'],
};

/** The ticket lady, to him when he's cut in. */
export const TICKET_CUT = ['BACK OF THE LINE, SIR.', 'SIR. THERE IS A LINE.'];
/** Somebody in line, knocked flying. */
export const GUEST_HIT = ['OW! MY NEW HIP!', 'MY COLOSTOMY BAG!', 'WHAT THE HELL, ASSHOLE?!', 'MY CHURRO!', "I'M CALLING MY LAWYER!", 'CALL SECURITY!'];
