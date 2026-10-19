// What's said on Disaster: The Ride (the queue, the pre-show's host, the narrator's loop, the guests, the ride's staff,
// the booth's sleeper, REAL DISASTERS), by voice (recorded with the rest: hollywood/voices.ts gathers these;
// tools/voices). In the user's voice (hollywood-spec.md): blunt, short; pick lines with pickLine; clean / shitty / naked
// pools where people react to him. The ride's staff's and the real fire's hurt and death lines are here too
// (registered in kinds.ts).
//
// The host and the narrator are recordings (a tape, a loop): they never react to him. That's the joke.

import type { ByPants } from '../blvd/lines';
import { PA_VOICE } from '../blvd/lines';

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In the doors, the queue ahead (once). */
export const ARRIVE = ['NINETY MINUTES. FOR A ROOM WITH A TV.', 'DISASTER: THE RIDE. THE LINE IS THE DISASTER.'];
/** Shoving into the queue (the first guest); now and then after. */
export const CUT_LINE = ['NINETY MINUTES? I HAVE SIX.', 'OUT OF THE WAY. I HAVE A DISASTER TO GET TO.'];
export const SHOVE = ['MOVE IT, GRANDMA.', 'EXCUSE ME. NOPE.', 'SHOULDA STAYED HOME.'];
/** The pre-show's host on the TV. */
export const PRESHOW = ['THIS GUY IS HAVING THE BEST DAY OF HIS LIFE. IN 1983.', 'CHIP CHADWICK. HE PEAKED ON THAT TAPE.'];
/** Into the theater. */
export const THEATER = ['IT\'S A ROOM. WITH A TV. AND A FAN.', 'STAND BEHIND A RAIL AND WATCH TV. TERRIFYING.'];
/** Each effect, the first time he gets it (by the disaster's index: quake, volcano, tornado, blizzard, flood, fire). */
export const EFFECT = [
  ['THAT WAS THE GUY NEXT TO ME FARTING.', 'MY CAR SHAKES MORE AT A RED LIGHT.'],
  ['A SPACE HEATER. I\'M SHAKING.', 'THE VOLCANO IS A SPACE HEATER WITH A RED LIGHT ON IT.'],
  ['IT\'S A DESK FAN. MY GRANDMA HAS THAT FAN.', 'A TORNADO. ON LOW.'],
  ['THEY TURNED THE AC UP. I\'LL ALERT THE MEDIA.', 'THE BLIZZARD IS SIXTY-EIGHT DEGREES.'],
  ['SOMEBODY SQUIRTED ME. I\'M GONNA FIND HIM.', 'THE FLOOD IS A SQUIRT GUN.'],
  ['A FOG MACHINE. SMELLS LIKE A BAR MITZVAH.', 'THE WILDFIRE IS FOG. FROM A HOSE.'],
];
/** The flying cow's rig (the tornado's cow, on a stunt wire over the screen). */
export const COW = ['A COW ON A WIRE. I\'M RIDING THE COW.', 'THE TORNADO COW. GET OVER HERE, BESSIE.'];
/** The booth, with its sleeper (once). */
export const BOOTH = ['ANOTHER GUY ASLEEP NEXT TO A LEVER. THIS PARK NEVER LEARNS.', 'REAL DISASTERS. EXPERIMENTAL. I KNOW THIS ONE.'];
/** The lever flipped. */
export const LEVER = ['REAL DISASTERS. FINALLY, SOME VALUE.', 'FLIP IT. WHAT\'S THE WORST THAT COULD HAPPEN. THAT\'S A JOKE.'];
/** After it all. */
export const REAL_AFTER = ['NOW THAT\'S A RIDE.', 'FIVE STARS. WOULD WRECK AGAIN.'];
/** Out through the hole in the wall (once). */
export const OUT = ['EVERY DISASTER AT ONCE. I DID THAT.', 'THE WHOLE PARK\'S A RIDE NOW. YOU\'RE WELCOME.'];
/** Back in the wreck, the narrator still going. */
export const WRECK_AGAIN = ['STILL LOOPING. NOBODY TOLD THE NARRATOR.', 'HE\'S STILL UNDER THERE. NOBODY TOLD HIM EITHER.'];

// ---------------------------------------------------------------------------------------------------------------
// The tape and the loop (recordings: never about him)

/** The pre-show's host (very excited), in order, looping. */
export const HOST = 'm2.hollywood.host';
export const HOST_TAPE = [
  'HI THERE! I\'M CHIP CHADWICK! WELCOME TO THE MOST TERRIFYING TWELVE MINUTES OF YOUR LIFE!',
  'EVER WONDERED WHAT A REAL DISASTER FEELS LIKE? KEEP WONDERING!',
  'OUR SCIENTISTS HAVE RECREATED THE FURY OF NATURE! WITH A FAN!',
  'AFTER THE SHOW, SEE STUNTMAN STEVE! HE\'S MY FRIEND! I MET HIM ONCE!',
  'NOW STEP INSIDE! IF YOU DARE! YOU DON\'T HAVE TO DARE! IT\'S FINE!',
];

/** The ride's narrator (deadpan, bored, on a loop). */
export const NARR = 'm2.hollywood.disaster';
export const NARR_WELCOME = ['WELCOME TO DISASTER: THE RIDE. PLEASE STAND BEHIND THE RAIL. NATURE IS COMING.'];
/** The loop: earthquake, volcano, tornado, blizzard, flood, wildfire (a few ways each: no line twice in 45 s). */
export const LOOP = [
  ['HERE\'S AN EARTHQUAKE.', 'HERE\'S AN EARTHQUAKE. HOLD THE RAIL.', 'HERE\'S AN EARTHQUAKE. FEEL THAT?'],
  ['HERE\'S A VOLCANO.', 'HERE\'S A VOLCANO. IT GOT WARMER.', 'HERE\'S A VOLCANO. DON\'T TOUCH THE HEATER.'],
  ['HERE\'S A TORNADO.', 'HERE\'S A TORNADO. THE FANS ARE ON.', 'HERE\'S A TORNADO. THAT\'S A COW.'],
  ['HERE\'S A BLIZZARD.', 'HERE\'S A BLIZZARD. WE TURNED THE AIR UP.', 'HERE\'S A BLIZZARD. BUNDLE UP.'],
  ['HERE\'S A FLOOD.', 'HERE\'S A FLOOD. YOU MAY GET MISTED.', 'HERE\'S A FLOOD. THAT WAS THE MIST.'],
  ['HERE\'S A WILDFIRE.', 'HERE\'S A WILDFIRE. THAT\'S FOG. DON\'T PANIC.', 'HERE\'S A WILDFIRE. ONLY YOU.'],
];
export const NARR_STEVE = ['THE EFFECTS IN THIS ROOM WERE TESTED BY STUNTMAN STEVE. HE GOT A LITTLE WARM.'];
/** REAL DISASTERS: the same deadpan, the room going real. */
export const REAL = {
  quake: 'HERE\'S AN EARTHQUAKE. A REAL ONE.',
  volcano: 'HERE\'S A VOLCANO. THAT ONE\'S HOT.',
  tornado: 'HERE\'S A TORNADO. THAT\'S NOT THE FAN.',
  blizzard: 'HERE\'S A BLIZZARD. FOR REAL.',
  flood: 'HERE\'S A FLOOD. SORRY ABOUT THE SCREEN.',
  all: 'HERE\'S EVERYTHING.',
  thanks: 'THANK YOU FOR RIDING DISASTER: THE RIDE. PLEASE EXIT THROUGH THE HOLE.',
};

// ---------------------------------------------------------------------------------------------------------------
// The guests (the queue, the theater)

export const GUEST_VOICES = { m: 'm2.guest2', f: 'm2.guest' } as const;
export const QUEUE_OUTRAGE: ByPants = {
  clean: ['NINETY MINUTES! WE WAITED NINETY MINUTES!', 'HEY! BACK OF THE LINE!', 'USHER! HE CUT! HE CUT!'],
  shitty: ['HE CUT AND HE STINKS!', 'HE BROUGHT HIS OWN DISASTER!', 'IT\'S ON MY FANNY PACK!'],
  nude: ['A NAKED MAN CUT THE LINE!', 'HIS THING HIT THE ROPE!', 'NOT IN THE QUEUE! NOT ANYWHERE!'],
};
/** The theater's guests at the effects: underwhelmed, or overreacting. */
export const UNDERWHELMED = ['THAT\'S IT?', 'I PAID FOR THIS.', 'MY DRYER DOES MORE THAN THAT.', 'WAS THAT IT OR WAS THAT KEVIN?'];
export const OVERREACT = ['OH MY GOD! I FELT THAT!', 'HOLD ME, KEVIN!', 'IT\'S SO REAL! I\'M SWEATING! A LITTLE!', 'I CAN\'T LOOK! IT\'S A FAN!'];
/** The theater's guests, at him. */
export const GUEST_HIM: ByPants = {
  clean: ['SIR, BEHIND THE RAIL!', 'HE\'S WALKING IN FRONT OF THE SCREEN!'],
  shitty: ['IS THAT SMELL AN EFFECT?', 'WAS THAT THE VOLCANO OR HIM?'],
  nude: ['IS THE NAKED GUY PART OF THE SHOW?', 'THE BLIZZARD GOT HIM! LOOK HOW SMALL!'],
};
/** The one guest left in the wreck, singed, clapping. */
export const SINGED = ['BEST RIDE IN THE PARK.', 'FIVE STARS. CAN\'T FEEL MY FACE.'];

// ---------------------------------------------------------------------------------------------------------------
// The ride's staff (new kinds: kinds.ts)

export const STAFF_VOICES = {
  usher: 'm2.hollywood.usher', usherf: 'm2.hollywood.usherf',
  tech: 'm2.hollywood.tech', techf: 'm2.hollywood.techf',
  twisty: 'm2.hollywood.twisty', twistyf: 'm2.hollywood.twistyf',
} as const;
export const USHER_BARK: ByPants = {
  clean: ['SIR! BEHIND THE ROPE!', 'NO TICKET, NO DISASTER!', 'THE LINE IS THAT WAY, SIR!'],
  shitty: ['THE RIDE DOESN\'T HAVE A SMELL EFFECT! IT DOES NOW!', 'CODE BROWN IN THE QUEUE!'],
  nude: ['PANTS ARE REQUIRED IN LINE, SIR!', 'I\'M NOT ROPING THAT OFF!'],
};
export const TECH_BARK: ByPants = {
  clean: ['YOU\'RE IN MY EFFECT ZONE!', 'THAT FAN COST NINE DOLLARS!', 'HIT YOUR MARK OR GET FOGGED!'],
  shitty: ['I\'M FOGGING THAT SMELL OUT!', 'WE DON\'T HAVE A FILTER FOR THAT!'],
  nude: ['COLD BLAST! SHRINK IT!', 'HE\'S NAKED! BLIZZARD HIM!'],
};
export const TWISTY_BARK: ByPants = {
  clean: ['TWISTY WANTS A HUG! A VIOLENT HUG!', 'WHOOOOSH! I\'M A TORNADO!', 'TWISTY SAYS NO CUTTING!'],
  shitty: ['TWISTY SMELLS SOMETHING! IT\'S NOT TWISTY!', 'EVEN TWISTY WON\'T SPIN NEAR THAT!'],
  nude: ['TWISTY SEES A NAKED MAN! TWISTY IS SCARED!', 'COVER UP! TWISTY\'S A FAMILY TORNADO!'],
};

// ---------------------------------------------------------------------------------------------------------------
// The sleeper in the booth (an eye mask, earplugs: he sleeps through it all, wakes too late)

export const SLEEPER = 'm2.hollywood.sleeper2';
export const SLEEPER_MUMBLE: ByPants = {
  clean: ['MMM. EARTHQUAKE. NICE.', 'ZZZ. HERE\'S A NAP.', 'FIVE MORE DISASTERS, MOM.'],
  shitty: ['SNIFF. VOLCANO? ZZZ.', 'WHO LET A SKUNK IN THE BLIZZARD.'],
  nude: ['MMM. SOMEBODY\'S COLD. ZZZ.', 'NAKED GUY. THIS DREAM AGAIN.'],
};
export const SLEEPER_LEVER = 'REAL DISASTERS. SURE. ZZZ.';
export const SLEEPER_WAKE = 'HUH? WHAT\'D I MISS?';

// ---------------------------------------------------------------------------------------------------------------
// The park's PA (the trailer voice): into the ride, Steve, the real thing after

export const PA_RIDE: ByPants = {
  clean: ['NOW ENTERING: DISASTER: THE RIDE! THE FURY OF NATURE! SIMULATED!', 'DISASTER: THE RIDE! NO REAL DISASTERS WERE HARMED!'],
  shitty: ['ATTENTION. A GUEST HAS BROUGHT HIS OWN DISASTER INTO DISASTER: THE RIDE.', 'DISASTER: THE RIDE NOW FEATURES A BROWN ALERT.'],
  nude: ['ATTENTION. DISASTER: THE RIDE IS NOT A NUDE EXPERIENCE.', 'DISASTER: THE RIDE! NOW WITH A NAKED MAN! WE ARE SORRY!'],
};
/** Once, in the lobby: the leak, mourned; the cast, a coupon. */
export const PA_LEAK_RIDE = [
  'THE FAMILIES OF THE REVENGERS CAST HAVE BEEN SENT A COUPON. THE SCRIPT\'S FAMILY IS INCONSOLABLE.',
  'GUESTS WITH REVENGERS PAGES WILL BE ESCORTED TO A ROOM. THE CAST IS FINE. THE CAST IS CGI NOW.',
];
export const PA_STEVE = ['STUNTMAN STEVE CONSULTED ON DISASTER: THE RIDE! HE SAID IT WAS FINE!'];
export const PA_REAL = ['ATTENTION. DISASTER: THE RIDE IS EXPERIENCING REAL DISASTERS. PLEASE ENJOY THEM.'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him on the ride (by source), and the death screen

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:hwd_usher': {
    hurt: ['HIT WITH THE LINE! THE ACTUAL LINE!', 'A STANCHION TO THE FACE!', 'OW! THE VELVET ROPE!'],
    death: ['BEATEN WITH A STANCHION', 'DIED WAITING IN LINE'],
  },
  'm2:hwd_tech': {
    hurt: ['THE TECH KICKED ME!', 'OW! GET YOUR HEADSET OUT OF MY FACE!'],
    death: ['KILLED BY THE CREW', 'TECHNICAL DIFFICULTIES'],
  },
  'm2:hwd_fog': {
    hurt: ['COLD! MY NIPPLES!', 'FOGGED! I CAN\'T SEE SHIT!', 'FREEZER BURN ON MY FACE!'],
    death: ['FROZEN BY A FOG MACHINE', 'DIED IN THE SPECIAL EFFECTS'],
  },
  'm2:hwd_twisty': {
    hurt: ['THE MASCOT SPUN INTO ME!', 'TWISTY! YOU FOAM FUCK!', 'HIT BY A TORNADO! A FOAM ONE!'],
    death: ['TAKEN BY A FOAM TORNADO', 'TWISTY GOT HIM'],
  },
  'm2:hwd_fire': {
    hurt: ['THE HEATER\'S REAL NOW! MY ASS!', 'FIRE! ACTUAL FIRE!', 'IT\'S HOT! IT\'S FINALLY HOT!'],
    death: ['DISASTER: THE DEATH', 'THE VOLCANO WAS REAL'],
  },
};

const pools = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...ARRIVE, ...CUT_LINE, ...SHOVE, ...PRESHOW, ...THEATER, ...EFFECT.flat(), ...COW, ...BOOTH, ...LEVER, ...REAL_AFTER, ...OUT,
    ...WRECK_AGAIN, ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [HOST]: HOST_TAPE,
  [NARR]: [...NARR_WELCOME, ...LOOP.flat(), ...NARR_STEVE, ...Object.values(REAL)],
  [GUEST_VOICES.m]: [...pools(QUEUE_OUTRAGE), ...UNDERWHELMED, ...OVERREACT, ...pools(GUEST_HIM), ...SINGED],
  [GUEST_VOICES.f]: [...pools(QUEUE_OUTRAGE), ...UNDERWHELMED, ...OVERREACT, ...pools(GUEST_HIM), ...SINGED],
  [STAFF_VOICES.usher]: pools(USHER_BARK), [STAFF_VOICES.usherf]: pools(USHER_BARK),
  [STAFF_VOICES.tech]: pools(TECH_BARK), [STAFF_VOICES.techf]: pools(TECH_BARK),
  [STAFF_VOICES.twisty]: pools(TWISTY_BARK), [STAFF_VOICES.twistyf]: pools(TWISTY_BARK),
  [SLEEPER]: [...pools(SLEEPER_MUMBLE), SLEEPER_LEVER, SLEEPER_WAKE],
  [PA_VOICE]: [...pools(PA_RIDE), ...PA_LEAK_RIDE, ...PA_STEVE, ...PA_REAL],
};
