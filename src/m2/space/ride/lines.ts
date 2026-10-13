// What's said in the ride section, by voice (recorded with the rest: space/voices.ts gathers these; tools/voices). In
// the user's voice (space-spec.md); pick lines with pickLine; clean / shitty / naked pools where people react to him.
//
// The ride's PA (m2.space.ridepa): a cheesy, upbeat corporate narrator, recorded in 1990 and never updated since. It
// knows exactly what 2010 will be like. It is wrong about all of it.

export type Dressed = 'clean' | 'shitty' | 'nude';

/** The PA's stories, by where along the ride they come (layout.ts: PA_CUES), and what Meathead says back (if anything). */
export const PA: Record<string, { lines: string[]; reply?: string[] }> = {
  welcome: { lines: ['WELCOME ABOARD VOYAGE TO 2010! PRESENTED BY PROGRESSCO.', 'PLEASE KEEP YOUR HANDS, ARMS AND OPINIONS INSIDE THE STAR SLED.'] },
  home: { lines: ["IT'S 2010! DAD COMMUTES BY JETPACK. HE'S HOME BY TWO.", 'ROBO-BUTLER SERVES DINNER: THREE DELICIOUS MEAL PILLS!'], reply: ["I'D EAT THE BUTLER."] },
  office: { lines: ['THE OFFICE OF 2010 IS ONE HUNDRED PERCENT PAPERLESS!', 'EVERY EXECUTIVE CARRIES A FAX MACHINE IN HIS POCKET!'], reply: ["MY POCKET'S FULL OF NAPKINS."] },
  cars: { lines: ['TRAFFIC? NOT IN 2010! EVERY CAR FLIES, AND NONE OF THEM CRASH.', 'THE SUPERSONIC BLIMP GETS YOU TO PARIS IN TWENTY MINUTES!'], reply: ['I GOT A DUI ON A LAWNMOWER.'] },
  moon: { lines: ['OUR FRIENDS IN THE SOVIET UNION HAVE A MOON BASE. OURS IS BIGGER!', 'THE FIRST HOTEL ON MARS IS OPEN! CONTINENTAL BREAKFAST INCLUDED!'], reply: ['THE SOVIET WHAT?'] },
  lift: { lines: ['NOW HOLD ON TIGHT. THE FUTURE IS UP THERE!', 'THIS PART OF YOUR VOYAGE IS SPONSORED BY PROGRESSCO SPACE SNACKS.'] },
  crest: { lines: ["TEN, NINE... OH, LET'S JUST GO!"] },
  space1: { lines: ['BY 2010, SCIENCE WILL HAVE CURED EVERY DISEASE! EXCEPT BOREDOM.', 'THE HOLE IN THE OZONE? FIXED! WITH A BIG STICKER.'] },
  space2: { lines: ["EVERY HOME WILL HAVE A VIDEO PHONE! YOU'LL SEE GRANDMA WHENEVER YOU WANT!", 'AND ALL HUMAN KNOWLEDGE WILL FIT ON ONE LASER DISC!'], reply: ["I DON'T WANT TO SEE GRANDMA."] },
  stars: { lines: ['AND HERE, THE BREATHTAKING MAJESTY OF THE STARS!'], reply: ["IT'S A WAREHOUSE.", 'THE STARS ARE CHRISTMAS LIGHTS.', "THE FUTURE'S A WAREHOUSE."] },
  station: { lines: ['ABOVE YOU, THE BIGGEST SPACE STATION EVER BUILT. BUILT ENTIRELY BY ROBOTS!', 'THANKS TO ROBOTS, NOBODY IN 2010 WILL EVER HAVE TO WORK AGAIN!'] },
  end: { lines: ['THANK YOU FOR VOYAGING TO 2010! THE FUTURE IS CLOSER THAN YOU THINK!', 'PLEASE REMAIN SEATED UNTIL YOUR STAR SLED COMES TO A COMPLETE STOP.'] },
};

/** A worker in the warehouse, the lights up and the sled still coming (m2.space.hand). */
export const WORKER_YELLS = ['SOMEBODY FLIP THE BREAKER BACK!', "WHO'S DRIVING THAT?!"];

/** Meathead, the first time each of the ride's tricks has a go at him. */
export const SEES: Record<string, string[]> = {
  satellite: ['WHO HANGS A SATELLITE THAT LOW?!', 'SPACE JUNK! DUCK!'],
  butler: ['NO PILLS, ROBOT!', 'THE BUTLER WANTS A PIECE!'],
  laser: ['LASERS AGAIN?!', 'I KILLED YOUR LASER GUY ALREADY!'],
  meteor: ['THE METEORS AGAIN!', "THAT ROCK'S ON THE TRACK!"],
  rocket: ["THAT ROCKET'S REAL TOO!", 'WHY IS EVERYTHING ON FIRE IN THE FUTURE?!'],
  forklift: ['A FORKLIFT?! IN SPACE?!', 'MOVE THE FORKLIFT, DIPSHIT!'],
};

/** THE BRAKE RUN: its attendant (m2.space.hand), him after. */
export const BRAKE_YELL = 'SLOW DOWN! THIS IS THE BRAKE RUN!';
export const MEATHEAD_BRAKE = "WHAT'S A BRAKE RUN?";
/** The two in the sled in front, sat at the platform, him coming (a man's voice). */
export const FRONT_SCREAM = "HE'S NOT STOPPING!";
export const MEATHEAD_RAM = 'BRAKES!';
/** Landed out on the main drag, fine (the two from the sled in front are not). */
export const MEATHEAD_LANDS = ["I'M GOOD.", 'STUCK IT.', 'BEST RIDE IN THE PARK.'];

/** What he says when these hurt him, and the death screen when they kill him. */
export const HURT_SATELLITE = ['A SATELLITE! IN MY FACE!', 'WHO HANGS SPACE JUNK THAT LOW?!', 'MY FOREHEAD!'];
export const DEATH_SATELLITE = ['SPACE JUNK', 'SATELLITED'];
export const HURT_BUTLER = ['THE ROBOT HIT ME WITH A TRAY!', 'I SAID NO PILLS!', "BUTLER! YOU'RE FIRED!"];
export const DEATH_BUTLER = ['DINNER IS SERVED', 'KILLED BY HOSPITALITY'];
export const HURT_PIT = ['NO TRACK! NO TRACK!'];
export const DEATH_PIT = ["THE FUTURE ISN'T BUILT YET", 'OFF THE RAILS (2010)'];
export const HURT_LASER = ['MY EYEBROWS!', 'IT CUT MY SHIRT!', 'THE LASERS AGAIN!'];
export const DEATH_LASER = ['LASER CURTAIN CALL', 'PERFORATED'];
export const HURT_METEOR = ['A METEOR ON THE TRACK!', "THAT ONE'S CONCRETE TOO!"];
export const DEATH_METEOR = ['IMPACT EVENT', 'STRUCK BY A PROP'];
export const HURT_ROCKET = ["MY HAIR'S ON FIRE!", 'REAL ROCKET! REAL FIRE!'];
export const DEATH_ROCKET = ['LIFTOFF', 'BURNED UP ON REENTRY'];
export const HURT_FORKLIFT = ['A FORKLIFT! IN THE FUTURE!', "HE WASN'T EVEN LOOKING!"];
export const DEATH_FORKLIFT = ['FORKLIFTED', 'AN OSHA VIOLATION'];

export const VOICE_LINES: Record<string, string[]> = {
  'm2.space.ridepa': Object.values(PA).flatMap(s => s.lines),
  meathead: [
    ...Object.values(PA).flatMap(s => s.reply ?? []), ...Object.values(SEES).flat(), MEATHEAD_BRAKE, MEATHEAD_RAM, ...MEATHEAD_LANDS,
    ...HURT_SATELLITE, ...HURT_BUTLER, ...HURT_PIT, ...HURT_LASER, ...HURT_METEOR, ...HURT_ROCKET, ...HURT_FORKLIFT,
  ],
  death: [...DEATH_SATELLITE, ...DEATH_BUTLER, ...DEATH_PIT, ...DEATH_LASER, ...DEATH_METEOR, ...DEATH_ROCKET, ...DEATH_FORKLIFT],
  'm2.space.hand': [...WORKER_YELLS, BRAKE_YELL],
  'm2.guest2': [FRONT_SCREAM],
};
