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
export const MEATHEAD_PARKED = ['PARKED.', 'NAILED IT.', 'FOUR SPACES. NOBODY TOUCH IT.', "THAT PILLAR WASN'T THERE LAST TIME."];
/** Meathead at the window, before he shows his ticket (or goes for it and finds he hasn't got one). */
export const MEATHEAD_TICKET: Record<Dressed, string[]> = {
  clean: ['GOT MY TICKET RIGHT HERE.', 'ONE ADULT. A BIG ONE.', 'HOW YOU DOING. HERE YOU GO.', 'PRINTED IT AT HOME. IN COLOR.'],
  shitty: ["IT'S A LITTLE DAMP. IT'S STILL GOOD.", "DON'T WORRY ABOUT WHAT'S ON IT.", "HERE. DON'T ASK.", 'IT WAS IN MY BACK POCKET. THAT WAS A MISTAKE.'],
  nude: ['TICKET, TICKET... IT WAS IN MY PANTS. MY PANTS BLEW UP. OH NO. OH NO NO NO NO.', "WHERE'S MY TICKET?! IT WAS IN MY BACK POCKET! MY BACK POCKET BLEW UP WITH THE REST OF THEM!", 'I HAD A TICKET! IT WENT WITH THE PANTS! THE PANTS WENT EVERYWHERE!', "OKAY. DON'T PANIC. THE TICKET WAS IN THE PANTS. THE PANTS EXPLODED. ...I'M PANICKING. I'M PANICKING!"],
};

/** The ticket lady, to him. */
export const TICKET_LADY: Record<Dressed, string[]> = {
  clean: ['WELCOME TO HAPPY LAND! GOD BLESS AMERICA, AND GOD BLESS HAPPY LAND!', 'ENJOY YOUR DAY, SIR! AND REMEMBER: FREEDOM ISN\'T FREE. NEITHER ARE CHURROS.'],
  shitty: ['SIR... THE TICKET IS... MOIST. ...ENJOY YOUR DAY.', "I'M GOING TO SCAN THIS WITH MY EYES. ...OKAY. GO. PLEASE GO."],
  nude: ["SIR, YOU CAN'T COME IN WITHOUT A TICKET. OR PANTS.", 'SIR. SIR, YOU ARE NAKED. SIR, I NEED YOU TO STEP BACK FROM THE WINDOW.'],
};
/** ...serving whoever's in front of him: just this. */
export const TICKET_NEXT = ['NEXT!', 'WELCOME TO HAPPY LAND!', 'NEXT IN LINE, PLEASE!', 'GOD BLESS! NEXT!'];
/** ...when he starts something (or she's knocked out cold: nothing). */
export const TICKET_ALARM = ['SECURITY! SECURITY!', 'CODE RED AT THE TICKET BOOTH!'];

/** Park security, the moment he starts something (the first one to see it). */
export const GUARD_ALERT: Record<Dressed, string[]> = {
  clean: ['HEY! THAT IS A VIOLATION OF PARK POLICY!', 'CODE RED! CODE RED IN AMERICA USA!', 'SIR! HANDS WHERE I CAN SEE THEM!'],
  shitty: ["HE'S SOILED AND HE'S VIOLENT! CODE BROWN! CODE RED!", 'OH GOD, HE SMELLS! GET HIM ANYWAY!', 'CODE BROWN! I REPEAT, CODE BROWN AND CODE RED!'],
  nude: ["HE'S NAKED AND HE'S HITTING PEOPLE!", 'SIR, PUT SOMETHING ON AND GET ON THE GROUND!', "CODE RED! AND WHATEVER THE CODE IS FOR THAT!"],
};
/** The first guard he comes to, in the garage: the park's welcome (it's Happy Land; America USA's only the bit at the front). */
export const GUARD_WELCOME: Record<Dressed, string> = {
  clean: 'WELCOME TO HAPPY LAND, SIR.',
  shitty: 'WELCOME TO HAPPY LAND, SIR. ...OH. OH, SIR.',
  nude: 'WELCOME TO HAPPY LAND, SIR. ...SIR?',
};
/** Park security, not after him (yet): a word as he goes by, depending on the state of him. */
export const GUARD_IDLE: Record<Dressed, string[]> = {
  clean: ['HAVE A PATRIOTIC DAY, SIR.', 'AMERICA USA IS STRAIGHT AHEAD, SIR.', "I'M WATCHING YOU, BIG GUY.", 'NICE TRUCK. TERRIBLE PARKING.', 'NO RUNNING, SIR. WALKING ONLY. FREEDOM WALKING.'],
  shitty: ['SIR, I THINK YOU HAD AN ACCIDENT.', "IS THAT YOU? THAT'S YOU, ISN'T IT.", 'THERE ARE RESTROOMS ON EVERY LEVEL, SIR. ...TOO LATE, HUH.', 'OH, BUDDY. OH NO.', "I'M GONNA STAND OVER HERE. UPWIND."],
  nude: ["SIR, WHERE ARE YOUR PANTS?", "THAT'S NOT IN THE DRESS CODE, SIR.", "I'M GONNA PRETEND I DIDN'T SEE THAT.", "THAT IS A LOT OF MAN, SIR.", "THEY DON'T PAY ME ENOUGH TO DEAL WITH THAT."],
};
/** ...and now and then, having a go at him. */
export const GUARD_BARK: Record<Dressed, string[]> = {
  clean: ['STOP RESISTING!', 'YOU HAVE THE RIGHT TO REMAIN HAPPY!', 'THAT IS NOT HOW WE DO THINGS IN AMERICA USA!'],
  shitty: ["I'M NOT TOUCHING HIM! YOU TOUCH HIM!", "THIS ISN'T IN THE HANDBOOK!", 'SOMEBODY GET A HOSE!'],
  nude: ["DON'T LOOK AT IT! TAKE HIM DOWN!", 'COVER YOURSELF, SIR!', 'THERE ARE FAMILIES HERE!'],
};

/** The PA, in America USA: every so often, annoyingly. */
export const PA_LINES = [
  'ATTENTION GUESTS: AMERICA USA IS THE GREATEST LAND IN HAPPY LAND. THIS HAS BEEN INDEPENDENTLY VERIFIED BY AMERICA USA.',
  "TODAY'S FREEDOM FORECAST: ONE HUNDRED PERCENT, WITH A CHANCE OF FIREWORKS.",
  'A FRIENDLY REMINDER: FRENCH FRIES ARE NOW FREEDOM FRIES. FRENCH TOAST IS UNDER REVIEW.',
  'THE NATIONAL ANTHEM WILL PLAY EVERY FIFTEEN MINUTES. PLEASE REMOVE YOUR HATS. AND YOUR HAND FROM YOUR CHURRO.',
  'WOULD THE OWNER OF A RED PICKUP TRUCK PARKED ACROSS FOUR SPACES ON LEVEL THREE... NEVER MIND. GOD BLESS.',
  'THIS LAND IS YOUR LAND. TERMS AND CONDITIONS APPLY.',
  'REMEMBER, GUESTS: EVERY SOUVENIR YOU BUY IS A SALUTE TO THE TROOPS.',
  'AMERICA USA: BRINGING YOU THE BEST OF EVERY AMERICAN CITY, WITHOUT THE PEOPLE.',
];

/** The people in line behind him, when he's at the window holding it up. */
export const GUEST_HURRY: Record<Dressed, string[]> = {
  clean: ['HURRY IT UP, BUDDY!', "COME ON, PAL. SOME OF US HAVE RIDES TO GET TO!", 'TICKET. WINDOW. HOW HARD IS IT?', "WE'VE BEEN IN THIS LINE SINCE BREAKFAST!"],
  shitty: ['CAN YOU HURRY UP? WE CAN SMELL YOU FROM HERE!', 'MOVE IT, STINKY!', "SIR, THE WHOLE LINE'S GAGGING. PLEASE.", 'OH GOD, THE WIND CHANGED. HURRY UP!'],
  nude: ['COULD YOU HURRY UP? AND PUT SOMETHING ON?', "SIR, MY KIDS ARE BACK HERE! MOVE IT!", "I DIDN'T PAY TO LOOK AT THAT! HURRY UP!", "WHY IS HE NAKED? WHY ISN'T HE MOVING?"],
};
/** The people in line, about the state of him: when it happens right there in front of them... */
export const GUEST_REACT_NOW: Record<Exclude<Dressed, 'clean'>, string[]> = {
  shitty: ['DID HE JUST... IN LINE?!', 'OH NO. OH NO, HE DID.', 'WHAT WAS THAT NOISE? OH GOD, THE SMELL!'],
  nude: ['HIS PANTS JUST EXPLODED!', "WHAT IN THE... WHERE'D HIS PANTS GO?!", "OH MY GOD! COVER THE KIDS' EYES!"],
};
/** ...and, stood near him while he's like that, now and then. */
export const GUEST_REACT: Record<Exclude<Dressed, 'clean'>, string[]> = {
  shitty: ['IS THAT COMING FROM HIM?', "HONEY, DON'T BREATHE.", 'SIR. YOUR PANTS. YOUR PANTS, SIR.', 'I CAN TASTE IT. WHY CAN I TASTE IT?', 'SOMEBODY GET A MOP. AND A PRIEST.'],
  nude: ['KIDS, LOOK AT THE FLAGS. ONLY THE FLAGS.', "SIR, YOU'RE NAKED. AT A FAMILY PARK.", 'IS HE ALLOWED IN LIKE THAT?', 'PUT IT AWAY, PAL!', "I'VE SEEN THINGS TODAY. TERRIBLE THINGS."],
};
/** ...when he's got past them to the window. */
export const GUEST_CUT: Record<Dressed, string[]> = {
  clean: ['HEY! NO CUTTING!', 'BACK OF THE LINE, PAL!'],
  shitty: ['HEY! NO CUTTING! ...AND, WOW.', 'BACK OF THE LINE, STINKY!'],
  nude: ['HEY! NO CUTTING! OR NUDITY!', 'BACK OF THE LINE! AND GET DRESSED!'],
};
/** The ticket lady, to him when he's cut in. */
export const TICKET_CUT = ['BACK OF THE LINE, SIR.', 'SIR, THERE IS A LINE.'];
/** Somebody in line, knocked flying. */
export const GUEST_HIT = ['OW! MY HIP!', 'HE HIT ME!', 'HEY! WHAT THE HELL?!', 'MY CHURRO!', "I'M CALLING MY LAWYER!", 'CALL SECURITY!'];
