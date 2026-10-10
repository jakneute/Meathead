// What's said in the clock tower (the ELEVATOR TO HELL's loading bay, and the climb), by voice (recorded with the rest:
// spooky/voices.ts gathers it). Where somebody reacts to him, three ways (clean, shitty pants, naked), the pools the
// same size.

export type Dressed = 'clean' | 'shitty' | 'nude';
export type ByPants = Record<Dressed, readonly string[]>;

// ---------------------------------------------------------------------------------------------------------------
// The loading bay

/** Meathead, at HOW THE RIDE WORKS (in order). */
export const MEATHEAD_HOW = [
  'UP THE CLOCK TOWER, DROP INTO HELL, EXIT THROUGH THE GIFT SHOP.',
  "FINALLY. A RIDE THAT DOESN'T SUCK. I'M IN.",
];
/** Meathead, at the gate: one, please. */
export const MEATHEAD_ASK = ['ONE FOR HELL, PLEASE.', 'ONE. FRONT SEAT. LET ME ON.', "I'VE BEEN WAITING MY WHOLE LIFE FOR THIS ONE. OPEN THE GATE."];
/** The ride operator (in his booth, in his little devil horns), not letting him on. */
export const OPERATOR_REFUSE: ByPants = {
  clean: [
    "SORRY, PAL. YOU CAME IN THROUGH THE EMERGENCY EXIT. THAT'S NOT A LINE. THAT'S A FIRE CODE VIOLATION.",
    "NO WRISTBAND, NO HELL. THOSE ARE THE RULES. I DON'T MAKE 'EM. I JUST ENFORCE 'EM FOR NINE BUCKS AN HOUR.",
    "YOU'RE NOT GETTING ON MY RIDE. YOU'VE GOT THE LOOK OF A GUY WHO STANDS UP DURING THE DROP.",
  ],
  shitty: [
    "WHOA. NO. THE CAR'S FABRIC SEATS, MAN. I'M NOT HOSING OUT HELL AGAIN.",
    "SIR, YOU'VE CLEARLY ALREADY BEEN ON A RIDE TODAY. AND IT WON.",
    "NOPE. RIDERS MUST BE THIS CLEAN TO RIDE. YOU ARE NOT THIS CLEAN. NOBODY'S EVER BEEN LESS THIS CLEAN.",
  ],
  nude: [
    'SIR, THE LAP BAR GOES RIGHT WHERE YOUR... NO. ABSOLUTELY NOT.',
    "NO SHIRT, NO SHOES, NO PANTS, NO HELL. IT'S ON THE SIGN. IT'S ON EVERY SIGN.",
    "YOU CAN'T RIDE NAKED. THE ON-RIDE PHOTO GOES STRAIGHT TO THE GIFT SHOP. THERE ARE CHILDREN AT THE GIFT SHOP.",
  ],
};
/** Meathead, back at him. */
export const MEATHEAD_REFUSED = ['FINE. I KNOW A SHORTCUT.', "I'LL TAKE THE STAIRS. AND THEN I'LL TAKE YOUR RIDE.", "YOU'RE GONNA REGRET THAT, DEVIL BOY."];
/** The operator, on the radio for security. */
export const OPERATOR_SECURITY: ByPants = {
  clean: ['SECURITY! LINE JUMPER AT THE GATE! THE BIG ONE! WITH THE FACE!', "SECURITY TO HELL, PLEASE. SECURITY TO HELL. WE'VE GOT A GUY."],
  shitty: ["SECURITY! THERE'S A GUY AT THE GATE WHO SHIT HIMSELF! BRING GLOVES! BRING ALL THE GLOVES!", 'SECURITY TO HELL. CODE BROWN. I REPEAT, CODE BROWN.'],
  nude: ["SECURITY! THERE'S A NAKED GUY AT THE GATE! DON'T LOOK DOWN! DON'T LOOK ANYWHERE!", "SECURITY TO HELL. WE'VE GOT A STREAKER. A SLOW ONE. A BIG ONE."],
};
/** The operator's spiel over the PA as each car loads (when he's about). */
export const OPERATOR_SPIEL = [
  'WELCOME TO THE ELEVATOR TO HELL. KEEP YOUR HANDS, FEET AND SOUL INSIDE THE CAR AT ALL TIMES.',
  'PLEASE PULL THE LAP BAR DOWN UNTIL YOU FEEL IT CRUSH YOUR SINS.',
  "RIDERS WITH HEART CONDITIONS, BACK PROBLEMS OR A CONSCIENCE SHOULD NOT RIDE. ENJOY YOUR DESCENT.",
  'THE ON-RIDE PHOTO WILL BE AVAILABLE IN THE GIFT SHOP. YOUR SCREAM IS INCLUDED.',
];
/** After the car's gone through the floor into the real hell: he's back by, and the operator's still loading them. */
export const OPERATOR_AFTER: ByPants = {
  clean: ["WE'RE CALLING IT AN UPGRADE. THE LINE'S NEVER BEEN LONGER.", "NOBODY'S COMPLAINED. NOBODY'S COME BACK TO COMPLAIN, BUT NOBODY'S COMPLAINED."],
  shitty: ['OH, YOU AGAIN. YOU STILL CAN\'T RIDE. YOU STILL STINK. THE RIDE\'S FINE. IT\'S BETTER THAN FINE.', "THE CARS DON'T COME BACK NOW. NEITHER DOES THE SMELL. WHAT DID YOU DO?"],
  nude: ["STILL NAKED, HUH? STILL CAN'T RIDE. THE NEW DROP'S A LOT LONGER, THOUGH.", "PUT SOMETHING ON. THE RIDERS HAVE ENOUGH TO DEAL WITH NOW."],
};
/** The operator, as another car goes down for good. */
export const OPERATOR_NEXT = ['NEXT!', 'NEXT CAR, PLEASE. WE HAVE PLENTY.', "THEY'RE FINE. THEY'RE FINE. NEXT!", "IT'S PART OF THE RIDE NOW. NEXT!"];

// ---------------------------------------------------------------------------------------------------------------
// The riders

/** Somebody in the car as it drops (the fake drop). */
export const RIDER_DROP = ['WHEEEEEE!', 'AAAAAAAAH!', "I'M GONNA PUKE! I'M GONNA PUKE!", 'MOM! MOOOOM!', 'BEST! RIDE! EVER!', 'WOOOOOOOO!', 'YEEEEEHAW!'];
/** Somebody in the car going up the shaft (slowly: click, clack), nervous. */
export const RIDER_RISE = ['HERE WE GO. HERE WE GO. HERE WE GO.', "OH GOD, IT'S SO HIGH.", 'I CHANGED MY MIND! CAN I CHANGE MY MIND?', 'HOLD MY HAND. HOLD MY HAND!', "WHY IS IT SO SLOW? WHY IS IT SO SLOW?!", "DON'T LOOK DOWN. I LOOKED DOWN."];
/** ...and going down into the real one. */
export const RIDER_REAL = ['THIS IS LONGER THAN LAST TIME!', 'IS THIS PART OF IT?!', 'IT SMELLS LIKE ACTUAL SULFUR!', 'I CAN SEE THE ACTUAL DEVIL! FIVE STARS!', 'WHERE IS THE GIFT SHOP?!'];

// ---------------------------------------------------------------------------------------------------------------
// The climb

/** Meathead, at the first support beam (its plaque: LOAD-BEARING. DO NOT RAM.). */
export const MEATHEAD_BEAM_SIGN = ['LOAD-BEARING. DO NOT RAM. ...CHALLENGE ACCEPTED.'];
/** Meathead, breaking one (by how many he's broken: the tower worse every time). */
export const MEATHEAD_BEAM_BROKE: readonly (readonly string[])[] = [
  ['OOPS.', "THAT WAS LOAD-BEARING? HUH."],
  ['THE TOWER MOVED. I MOVED THE TOWER.', "IT'S FINE. IT'S A CLOCK TOWER. IT'S GOT PLENTY OF TIME."],
  ['WHOA. WHOA. OKAY.', "I'M NOT STOPPING NOW."],
  ['IS THE WHOLE TOWER SUPPOSED TO DO THAT?', "IT'S SWAYING. I LOVE IT."],
  ["I CAN FEEL IT IN MY KNEES. AND MY LUNCH.", 'TWO MORE. MAYBE ONE. I LOST COUNT.'],
  ['LAST ONE UP TOP. THEN THEY GET THEIR DROP.', 'THIS ENTIRE BUILDING IS A MISTAKE.'],
];
/** Meathead, as it gets worse (now and then, climbing, with three or more down). */
export const MEATHEAD_WOBBLE = [
  'WHO BUILT THIS? A GUY WHO BUILDS BIRDHOUSES?',
  "STOP SWAYING! I'M TRYING TO CLIMB YOU!",
  "IT'S LEANING. EVERYTHING'S LEANING. I'M LEANING.",
  'THIS IS HOW THE LEANING TOWER STARTED.',
];
/** Meathead, at the top: the main support. */
export const MEATHEAD_MAIN = ['THE MAIN SUPPORT. OF COURSE IT IS.', 'THAT ONE THERE IS HOLDING UP THE WHOLE RIDE. GOOD.'];
/** The car going through the floor (once it's done). */
export const MEATHEAD_CRASH = ['...THAT WAS NOT THE GIFT SHOP.', 'WELL. THEY WANTED HELL.', 'HUH. IT WENT ALL THE WAY DOWN. THE REAL WAY.'];
/** Meathead, jumping into the shaft after it. */
export const MEATHEAD_JUMP = ['CANNONBAAAALL!', 'GERONIMOOOO!', 'WAIT FOR MEEEE!'];

// ---------------------------------------------------------------------------------------------------------------
// The way down (after the car's gone through)

/** Meathead, setting off down: on the wreckage jammed in the shaft. */
export const MEATHEAD_DOWN = ["NOW I GOTTA GO ALL THE WAY BACK DOWN. GREAT.", 'WHAT GOES UP...', "THE SHAFT'S JAMMED. GUESS I'M TAKING THE FLOORS."];
/** ...the first time the shaft's red lamps go (a car coming down). */
export const MEATHEAD_LAMP = ["RED LIGHT. THAT'S FOR ME, ISN'T IT.", 'INCOMING CAR!', "THEY'RE STILL SENDING THEM DOWN?!"];
/** ...back on the ground floor, where he came in. */
export const MEATHEAD_BASE = ['BACK WHERE I STARTED. ONLY WORSE.', 'HEY. I KNOW THIS FLOOR.', 'THE GROUND FLOOR. AND THEN SOME.'];
/** ...down the hole under it. */
export const MEATHEAD_CHUTE = ['THE BASEMENT HAS A BASEMENT.', 'IT JUST KEEPS GOING.', 'I CAN SMELL IT. IT SMELLS LIKE A GRILL.'];

// ---------------------------------------------------------------------------------------------------------------
// What he says when these hurt him, and the death screen when they kill him

export const HURT_GEAR = ['MY SHIRT! IT ATE MY SHIRT!', 'GEARS! WHO PUTS THE GEARS ON THE OUTSIDE?!', "IT'S CHEWING ME! THE CLOCK IS CHEWING ME!", 'THAT ONE PINCHED SOMETHING IMPORTANT!'];
export const DEATH_GEAR = ['GROUND INTO TIME', 'CLOCKWORK ORANGE JUICE', 'CAUGHT IN THE WORKS'];
export const HURT_PENDULUM = ['THE PENDULUM! I WAS WATCHING IT! I WAS!', 'TICK, TOCK, MY FACE!', 'WHO SHARPENS A PENDULUM?!'];
export const DEATH_PENDULUM = ['THE PIT AND THE MEATHEAD', 'TIME CUT HIM SHORT', 'HALVED ON THE HOUR'];
export const HURT_DEBRIS = ['HEADS UP! THAT WAS MY HEAD!', "THE TOWER'S FALLING ON ME! A LITTLE AT A TIME!", 'WHO THREW THAT?! THE CEILING?!', 'OW! A BRICK! A WHOLE BRICK!'];
export const DEATH_DEBRIS = ['THE CEILING CAME DOWN', 'BRAINED BY A BRICK', 'HE BROUGHT THE HOUSE DOWN. ON HIMSELF.'];
export const HURT_CUCKOO = ['CUCKOO! CUCKOO! OW!', 'IT PECKED ME! THE CLOCK PECKED ME!', 'GET BACK IN YOUR HOUSE, BIRD!'];
export const DEATH_CUCKOO = ['CUCKOO', 'PECKED TO DEATH BY THE TIME', 'IT WAS HIS HOUR'];
export const HURT_RINGER = ['THE BIG WOODEN GUY! THE BIG WOODEN GUY!', 'HE BUMPED ME! HE WEIGHS A TON!', 'WATCH WHERE YOU WALK, PINOCCHIO!'];
export const DEATH_RINGER = ['TROD ON BY CLOCKWORK', 'FLATTENED BY A FIGURINE', 'WOODEN IT BE NICE'];
export const HURT_HAMMER = ['HE RANG MY BELL!', 'DING DONG! THAT WAS MY SKULL!', "I'M NOT A BELL! I'M NOT A BELL!", 'MY EARS ARE RINGING! MY WHOLE BODY IS RINGING!'];
export const DEATH_HAMMER = ['HIS BELL WAS RUNG', 'FOR WHOM THE BELL TOLLED', 'STRUCK ON THE HOUR'];
export const HURT_IGOR = ['GET OFF ME, HUNCHY!', 'HE BIT ME! THE IGOR BIT ME!', "WHAT'S UNDER THAT HUMP?! IS IT A FANNY PACK?!"];
export const DEATH_IGOR = ['IGORED', 'ASSISTED TO DEATH', 'YES, MASTER'];
/** Shoulder charged head-on into an igor's pitchfork. */
export const HURT_PITCHFORK = ["THE PITCHFORK'S REAL! WHY IS THE PITCHFORK REAL?!", 'I CHARGED A FORK! LIKE A SALAD!', 'THREE HOLES! THREE NEW HOLES!'];
export const DEATH_PITCHFORK = ['FORKED', 'TOSSED LIKE A SALAD', 'STUCK A FORK IN HIM. HE WAS DONE.'];
export const HURT_MUMMY = ["THE TOILET PAPER GUY HIT ME! IT'S TWO-PLY!", 'GET YOUR WRAPPED HANDS OFF ME!', "HE'S STRONGER THAN HE SMELLS! AND HE SMELLS!"];
export const DEATH_MUMMY = ['WIPED OUT', 'UNWRAPPED', 'ENTOMBED BY A GUY IN TP'];
export const HURT_BRIDE = ["THE BRIDE'S GOT A RIGHT HOOK!", "I DON'T EVEN KNOW YOU, LADY!", "I OBJECT! I OBJECT!"];
export const DEATH_BRIDE = ['TILL DEATH DID THEM PART', 'LEFT AT THE ALTAR', 'JILTED'];
export const HURT_BOUQUET = ['THORNS! THE ROSES HAVE THORNS!', "I CAUGHT THE BOUQUET! WITH MY FACE!", "I'M NEXT?! NEXT FOR WHAT?!"];
export const DEATH_BOUQUET = ['CAUGHT THE BOUQUET', 'DEAD ROSES, DEAD MEATHEAD', 'NEXT TO GO'];

/** What comes off a car falling past him down the shaft (a shoe, a purse, the lap bar...). */
export const HURT_CAR = ['A WHOLE CAR WENT BY MY FACE!', "SOMEBODY'S PURSE! RIGHT IN THE TEETH!", 'A SHOE! WHO LOSES A SHOE ON A RIDE?!', "THE LAP BAR! THEY DON'T EVEN NEED IT ANYMORE!"];
export const DEATH_CAR = ['NEXT!', 'SHOULD HAVE WAITED FOR THE NEXT ONE', 'HIT BY THE RIDE HE NEVER GOT ON'];

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
