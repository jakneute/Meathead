// What's said in the clock tower (the ELEVATOR TO HELL's loading bay, and the climb), by voice (recorded with the rest:
// spooky/voices.ts gathers it). Where somebody reacts to him, three ways (clean, shitty pants, naked), the pools the
// same size.

export type Dressed = 'clean' | 'shitty' | 'nude';
export type ByPants = Record<Dressed, readonly string[]>;

// ---------------------------------------------------------------------------------------------------------------
// The loading bay

/** Meathead, at HOW THE RIDE WORKS (in order). */
export const MEATHEAD_HOW = ["UP THE TOWER, DROP INTO HELL, OUT THROUGH THE GIFT SHOP. FINALLY, A RIDE THAT DOESN'T SUCK."];
/** Meathead, at the gate: one, please. */
export const MEATHEAD_ASK = ['ONE FOR HELL, PLEASE.', 'FRONT SEAT. OPEN THE GATE, DEVIL BOY.'];
/** The ride operator (in his booth, in his little devil horns), not letting him on. */
export const OPERATOR_REFUSE: ByPants = {
  clean: [
    "NOPE. YOU CAME IN THE EMERGENCY EXIT, DUMBASS. THAT'S NOT A LINE.",
    "NO WRISTBAND, NO HELL. I MAKE NINE BUCKS AN HOUR. I DON'T NEGOTIATE.",
  ],
  shitty: [
    "NOPE. FABRIC SEATS, MAN. I'M NOT HOSING YOUR SHIT OUT OF HELL.",
    'SIR, YOU ALREADY RODE SOMETHING TODAY. AND IT WON.',
  ],
  nude: [
    'SIR, THE LAP BAR GOES RIGHT ON YOUR DICK. NO.',
    'NO PANTS, NO HELL. THE ON-RIDE PHOTO GOES ON A MUG.',
  ],
};
/** Meathead, back at him. */
export const MEATHEAD_REFUSED = ['FINE. I KNOW A SHORTCUT.', 'ENJOY YOUR NINE BUCKS, DEVIL BOY.'];
/** The operator, on the radio for security. */
export const OPERATOR_SECURITY: ByPants = {
  clean: ['SECURITY! LINE JUMPER AT THE GATE! BIG UGLY ONE!', 'SECURITY TO HELL. WE GOT A FAT GUY. A REAL CHUD.'],
  shitty: ['SECURITY! GUY AT THE GATE SHIT HIMSELF! BRING GLOVES!', 'SECURITY TO HELL. CODE BROWN. I REPEAT, CODE BROWN.'],
  nude: ["SECURITY! NAKED GUY AT THE GATE! DON'T LOOK DOWN!", 'SECURITY TO HELL. WE GOT A STREAKER. A BIG HAIRY ONE.'],
};
/** The operator's spiel over the PA as each car loads (when he's about). */
export const OPERATOR_SPIEL = [
  'WELCOME TO THE ELEVATOR TO HELL. KEEP YOUR HANDS, FEET AND SOUL IN THE CAR.',
  'PULL THE LAP BAR DOWN TILL IT CRUSHES YOUR SINS. OR YOUR NUTS. WHICHEVER.',
  'IF YOU PUKE, YOU CLEAN IT. I AM NOT KIDDING. I HAVE A BUCKET.',
];
/** After the car's gone through the floor into the real hell: he's back by, and the operator's still loading them. */
export const OPERATOR_AFTER: ByPants = {
  clean: ["THE DROP'S WAY LONGER NOW. LINE'S NEVER BEEN LONGER.", "NOBODY'S COME BACK. NOBODY'S COMPLAINED. MY METRICS ARE GREAT."],
  shitty: ["YOU AGAIN. STILL STINK, STILL CAN'T RIDE. RIDE'S GREAT NOW, BY THE WAY.", "THE CARS DON'T COME BACK NOW. YOU SHIT YOURSELF AND BROKE HELL."],
  nude: ["STILL NAKED? STILL CAN'T RIDE. THE NEW DROP'S WAY LONGER, THOUGH.", 'PUT YOUR DICK AWAY. THE RIDERS HAVE ENOUGH GOING ON.'],
};
/** The operator, as another car goes down for good. */
export const OPERATOR_NEXT = ['NEXT!', "THEY'RE FINE. NEXT!", 'NOT MY DEPARTMENT. NEXT!'];

// ---------------------------------------------------------------------------------------------------------------
// The riders

/** Somebody in the car as it drops (the fake drop). */
export const RIDER_DROP = ['WHEEEEEE!', 'AAAAAAAAH!', "I'M GONNA PUKE!", 'I WANT MY MOOOOOM!', 'I PEED! I PEED A LITTLE!', 'WOOOOOOOO!'];
/** Somebody in the car going up the shaft (slowly: click, clack), nervous. */
export const RIDER_RISE = ['HERE WE GO. HERE WE GO.', "OH GOD, IT'S SO HIGH.", 'I CHANGED MY MIND! LET ME OFF!', 'HOLD MY HAND, YOU PUSSY.', "I SHOULDN'T HAVE HAD THE CHILI DOG.", "DON'T LOOK DOWN. FUCK. I LOOKED DOWN."];
/** ...and going down into the real one. */
export const RIDER_REAL = ['THIS IS LONGER THAN LAST TIME!', 'IS THIS PART OF IT?!', 'IT SMELLS LIKE ACTUAL SULFUR!', 'THAT IS THE ACTUAL DEVIL! FIVE STARS!', 'I THINK I SHIT! I THINK I SHIT A LITTLE!'];

// ---------------------------------------------------------------------------------------------------------------
// The climb

/** Meathead, at the first support beam (its plaque: LOAD-BEARING. DO NOT RAM.). */
export const MEATHEAD_BEAM_SIGN = ['LOAD-BEARING. DO NOT RAM. ...WATCH ME.'];
/** Meathead, breaking one (by which one: the tower worse every time; the last, the main support, is the crash). */
export const MEATHEAD_BEAM_BROKE: readonly (readonly string[])[] = [
  ['OOPS.', 'THAT WAS LOAD-BEARING? HUH.'],
  ["I MOVED THE TOWER. THAT'S WHAT TWELVE CORN DOGS GETS YOU.", "IT'S A CLOCK TOWER. IT'S GOT TIME."],
  ['WHOA. OKAY. THAT WAS A BIG ONE.', 'NOT STOPPING NOW.'],
  ['IS IT SUPPOSED TO DO THAT?', "IT'S SWAYING. I LOVE IT."],
  ['I CAN FEEL THAT IN MY COLON.', 'TWO MORE. MAYBE ONE. I LOST COUNT.'],
  ["ONE LEFT. UP TOP.", 'THIS WHOLE BUILDING IS A MISTAKE.'],
];
/** Meathead, as it gets worse (now and then, climbing, with three or more down; in order). */
export const MEATHEAD_WOBBLE = [
  'WHO BUILT THIS, SAL?',
  "STOP SWAYING! YOU'RE WORSE THAN MY WATERBED!",
  "EVERYTHING'S LEANING. I'M LEANING.",
];
/** Meathead, at the top: the main support. */
export const MEATHEAD_MAIN = ['THE MAIN SUPPORT. COME TO DADDY.', 'THAT ONE HOLDS UP THE WHOLE RIDE. PERFECT.'];
/** The car going through the floor (once it's done). */
export const MEATHEAD_CRASH = ['...THAT WAS NOT THE GIFT SHOP.', 'WELL. THEY WANTED HELL.', "OOPS. THEY'RE GONNA NEED A BIGGER WAIVER."];
/** Meathead, a way down the shaft after it, going into his cannonball (any of them: the dive's pose is his cannonball). */
export const MEATHEAD_JUMP = ['CANNONBAAAALL!', 'GERONIMOOOO!', 'WAIT FOR MEEEE!'];

// ---------------------------------------------------------------------------------------------------------------
// The way down (after the car's gone through)

/** Meathead, setting off down: on the wreckage jammed in the shaft. */
export const MEATHEAD_DOWN = ['NOW I GOTTA GO ALL THE WAY BACK DOWN. GREAT.', "SHAFT'S JAMMED. GUESS I'M TAKING THE FLOORS."];
/** ...the first time the shaft's red lamps go (a car coming down). */
export const MEATHEAD_LAMP = ["RED LIGHT. THAT'S FOR ME, ISN'T IT.", "THEY'RE STILL SENDING CARS?!"];
/** ...back on the ground floor, where he came in. */
export const MEATHEAD_BASE = ['BACK WHERE I STARTED. ONLY WORSE.', 'HEY. I KNOW THIS FLOOR.'];
/** ...down the hole under it. */
export const MEATHEAD_CHUTE = ['THE BASEMENT HAS A BASEMENT.', 'SMELLS LIKE A BURGER KING DOWN THERE. AND FARTS.'];

// ---------------------------------------------------------------------------------------------------------------
// What he says when these hurt him, and the death screen when they kill him

export const HURT_GEAR = ["IT'S EATING MY SHIRT! I GOT THIS AT WALMART!", 'GEARS! WHO PUTS THE GEARS ON THE OUTSIDE?!', "IT'S CHEWING ME! THE CLOCK IS CHEWING ME!", 'IT PINCHED MY NUTS!'];
export const DEATH_GEAR = ['GROUND INTO TIME', 'CLOCKWORK ORANGE JUICE', 'CAUGHT IN THE WORKS'];
export const HURT_PENDULUM = ['THE PENDULUM! I WAS WATCHING IT! I WAS!', 'TICK, TOCK, MY NUTSACK!', 'WHO SHARPENS A PENDULUM?!'];
export const DEATH_PENDULUM = ['THE PIT AND THE MEATHEAD', 'TIME CUT HIM SHORT', 'HALVED ON THE HOUR'];
export const HURT_DEBRIS = ['HEADS UP! THAT WAS MY HEAD!', "THE TOWER'S FALLING ON ME! A LITTLE AT A TIME!", "THE CEILING'S THROWING SHIT AT ME!", 'OW! A BRICK! A WHOLE BRICK!'];
export const DEATH_DEBRIS = ['THE CEILING CAME DOWN', 'BRAINED BY A BRICK', 'BROUGHT THE HOUSE DOWN'];
export const HURT_CUCKOO = ['CUCKOO! CUCKOO! FUCK YOU!', 'IT PECKED ME! THE CLOCK PECKED ME!', 'GET BACK IN YOUR HOUSE, BIRD!'];
export const DEATH_CUCKOO = ['CUCKOO', 'PECKED TO DEATH BY THE TIME', 'IT WAS HIS HOUR'];
export const HURT_RINGER = ['THE BIG WOODEN GUY!', 'IT STEPPED ON MY TOES! I HAVE A CORN!', 'WATCH WHERE YOU WALK, PINOCCHIO!'];
export const DEATH_RINGER = ['TROD ON BY CLOCKWORK', 'FLATTENED BY A FIGURINE', 'WOODEN IT BE NICE'];
export const HURT_HAMMER = ['RANG MY BELL!', "DING DONG! MY HEAD'S A DOORBELL!", "I'M NOT A BELL!", 'MY BALLS ARE RINGING!'];
export const DEATH_HAMMER = ['HIS BELL WAS RUNG', 'FOR WHOM THE BELL TOLLED', 'STRUCK ON THE HOUR'];
export const HURT_IGOR = ['GET OFF ME, HUNCHY!', 'THE IGOR BIT ME!', "WHAT'S IN THE HUMP, YOUR LUNCH?!"];
export const DEATH_IGOR = ['IGORED', 'ASSISTED TO DEATH', 'YES, MASTER'];
/** Shoulder charged head-on into an igor's pitchfork. */
export const HURT_PITCHFORK = ["THE PITCHFORK'S REAL! WHY IS THE PITCHFORK REAL?!", 'I CHARGED A FORK LIKE A DUMBASS!', 'THREE NEW HOLES! I HAD ENOUGH HOLES!'];
export const DEATH_PITCHFORK = ['FORKED', 'TOSSED LIKE A SALAD', 'STUCK WITH A FORK. DONE.'];
export const HURT_MUMMY = ['BEAT UP BY TWO-PLY!', 'GET YOUR WRAPPED HANDS OFF ME!', 'YOU SMELL LIKE A USED ROLL!'];
export const DEATH_MUMMY = ['WIPED OUT', 'UNWRAPPED', 'ENTOMBED IN TOILET PAPER'];
export const HURT_BRIDE = ["THE BRIDE'S GOT A RIGHT HOOK!", "I DON'T EVEN KNOW YOU!", 'SPEAK NOW OR... OW! FUCK!'];
export const DEATH_BRIDE = ['TILL DEATH DID THEM PART', 'LEFT AT THE ALTAR', 'JILTED'];
export const HURT_BOUQUET = ['THORNS! THE ROSES HAVE THORNS!', "I CAUGHT THE BOUQUET! WITH MY FACE!", "I'M NEXT?! I'M NOT MARRYING ANYBODY!"];
export const DEATH_BOUQUET = ['CAUGHT THE BOUQUET', 'DEAD ROSES, DEAD MEATHEAD', 'SHE THREW, HE DIED'];

/** What comes off a car falling past him down the shaft (a shoe, a purse, the lap bar...). */
export const HURT_CAR = ['A WHOLE CAR WENT BY MY FACE!', "SOMEBODY'S PURSE! RIGHT IN THE TEETH!", 'A CROC! WHO WEARS CROCS TO HELL?!', "THE LAP BAR! THEY DON'T EVEN NEED IT ANYMORE!"];
export const DEATH_CAR = ['NEXT!', 'WAIT FOR THE NEXT CAR', 'HIT BY A RIDE HE SKIPPED'];

const flat = (r: ByPants) => Object.values(r).flat();
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...MEATHEAD_HOW, ...MEATHEAD_ASK, ...MEATHEAD_REFUSED, ...MEATHEAD_BEAM_SIGN, ...MEATHEAD_BEAM_BROKE.flat(), ...MEATHEAD_WOBBLE,
    ...MEATHEAD_MAIN, ...MEATHEAD_CRASH, ...MEATHEAD_JUMP, ...MEATHEAD_DOWN, ...MEATHEAD_LAMP, ...MEATHEAD_BASE, ...MEATHEAD_CHUTE, ...HURT_CAR,
    ...HURT_GEAR, ...HURT_PENDULUM, ...HURT_DEBRIS, ...HURT_CUCKOO, ...HURT_RINGER, ...HURT_HAMMER, ...HURT_IGOR, ...HURT_PITCHFORK,
    ...HURT_MUMMY, ...HURT_BRIDE, ...HURT_BOUQUET,
  ],
  death: [
    ...DEATH_GEAR, ...DEATH_PENDULUM, ...DEATH_DEBRIS, ...DEATH_CUCKOO, ...DEATH_RINGER, ...DEATH_HAMMER, ...DEATH_IGOR, ...DEATH_PITCHFORK,
    ...DEATH_MUMMY, ...DEATH_BRIDE, ...DEATH_BOUQUET, ...DEATH_CAR,
  ],
  'm2.hellop': [...flat(OPERATOR_REFUSE), ...flat(OPERATOR_SECURITY), ...OPERATOR_SPIEL, ...flat(OPERATOR_AFTER), ...OPERATOR_NEXT],
  'm2.guest': [...RIDER_DROP, ...RIDER_REAL, ...RIDER_RISE],
  'm2.guest2': [...RIDER_DROP, ...RIDER_REAL, ...RIDER_RISE],
};
