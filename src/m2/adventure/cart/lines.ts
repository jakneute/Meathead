// What's said in the mine cart, by voice (recorded with the rest: tools/voices). Where somebody reacts to him, three
// ways: clean pants, shitty ones, naked.

export type Dressed = 'clean' | 'shitty' | 'nude';

/** Meathead, when the guest scanner reads him as UNFRIENDLY and throws the switch up the hill. */
export const MEATHEAD_UNFRIENDLY = ['DAMN RIGHT I AM.', 'WHAT GAVE IT AWAY?', 'FRIENDLY GUESTS CAN SUCK MY DICK.', 'FINALLY, A MACHINE THAT GETS ME.'];
/** Meathead, when Safari Artie turns up behind him in a cart of his own. */
export const MEATHEAD_ARTIE_AGAIN = ['OH, COME ON. THE BOAT GUY.', 'ARTIE?! HOW ARE YOU EVEN HERE?', "DON'T YOU HAVE A BOAT TO SINK?"];

/** Meathead, the first time each of the ride's tricks goes off at him (he's seen them all from behind, backstage). */
export const MEATHEAD_SEES_DARTS = ["I KNOW THERE'S A GUY BACK THERE WITH A LEAF BLOWER!", 'I SAW YOUR BUCKET OF DARTS, DIPSHIT!', 'NICE LEAF BLOWER, ASSHOLE!'];
export const MEATHEAD_SEES_SNAKE = ['IT SAYS SERPENT OF DOOM ON YOUR ASS!', "I'VE SEEN YOUR AIR TANK, SNAKE!", "OH, IT'S YOU. THE PUPPET."];
export const MEATHEAD_SEES_LOB = ['INSURANCE SAID FOAM!', "I KNOW YOU'RE BACK THERE WITH A CATAPULT!", 'NICE CATAPULT, NERD!'];
export const MEATHEAD_SEES_CHASE = ["THAT ONE WASN'T BACKSTAGE!", 'WHY IS THIS ONE BIGGER?!', 'GO GO GO GO GO!'];

/** Safari Artie, rolling up behind him. */
export const ARTIE_CHASE_START: Record<Dressed, string[]> = {
  clean: ['YOU JUMPED OUT OF MY BOAT! NOBODY JUMPS OUT OF MY BOAT!', 'YOU NEVER FINISHED THE TOUR! THE TOUR IS MANDATORY!'],
  shitty: ['YOU JUMPED OUT OF MY BOAT, YOU SHIT-STAINED PRICK!', 'THE TOUR IS MANDATORY! SO IS WIPING!'],
  nude: ['YOU JUMPED OUT OF MY BOAT! PUT SOME PANTS ON!', "STOP! THIS RIDE HAS A DRESS CODE! IT'S PANTS!"],
};
/** ...while he's after him (from here on, three ways too: whatever Meathead's wearing as it's said). */
export const ARTIE_TAUNT: Record<Dressed, string[]> = {
  clean: [
    'THIS IS AN UNAUTHORIZED RIDE EXPERIENCE!',
    'KEEP YOUR ARMS IN THE CART SO I CAN BREAK THEM!',
    "MY BROTHER WOULD'VE HAD YOU BY NOW! HE WAS AN ASSHOLE, BUT HE WAS FAST!",
    "I'M ON MY BREAK, YOU FAT FUCK!",
  ],
  shitty: [
    "THIS IS AN UNAUTHORIZED RIDE EXPERIENCE! AND YOU'RE LEAVING A TRAIL!",
    "I CAN'T SEE YOU IN THE DARK! I CAN SMELL YOU, THOUGH!",
    "THEY'RE GONNA HAVE TO BURN YOUR CART!",
    'I WAS GONNA EAT LUNCH ON MY BREAK! NOT ANYMORE!',
  ],
  nude: [
    'THOSE SEATS ARE NOT RATED FOR BARE ASS!',
    'KEEP YOUR ARMS IN THE CART! AND WHATEVER ELSE IS FLAPPING!',
    'MY BROTHER WAS AN ASSHOLE, BUT HE KEPT HIS ASS COVERED!',
    'THIS IS NOT WHAT I WANTED TO LOOK AT ON MY BREAK!',
  ],
};
/** ...when he rams him. */
export const ARTIE_BUMP: Record<Dressed, string[]> = {
  clean: ['BUMPER CARTS!', "THAT'S FOR THE BOAT!", 'HOW DO YOU LIKE THAT, BIG BOY?!'],
  shitty: ['BUMPER CARTS! OH GOD, IT SPLASHED!', "THAT'S FOR THE BOAT, SHIT-FOR-PANTS!", 'HOW DO YOU LIKE THAT, STINKY?!'],
  nude: ['BUMPER CARTS! WHY DID IT ALL JIGGLE?!', "THAT'S FOR THE BOAT! AND FOR MY EYES!", 'HOW DO YOU LIKE THAT, NAKED BOY?!'],
};
/** ...when he's shot at. */
export const ARTIE_SHOT: Record<Dressed, string[]> = {
  clean: ["OW! THAT'S A WRITE-UP!", "I DON'T GET PAID ENOUGH FOR THIS!", 'WATCH IT! THIS IS A RENTAL HELMET!'],
  shitty: ["YOU CAN'T AIM AND YOU CAN'T HOLD IT!", "I DON'T GET PAID ENOUGH FOR THE SMELL ALONE!", 'I AM NOT DYING DOWNWIND OF YOU!'],
  nude: ['INDECENT EXPOSURE AND ASSAULT! THAT IS TWO WRITE-UPS!', 'NOBODY GETS PAID ENOUGH TO SEE THAT!', "NAKED GUYS DON'T GET TO SHOOT AT PEOPLE!"],
};
/** ...when one of the ride's tricks gets him instead (it's Meathead's fault: everything is). */
export const ARTIE_TRAPPED: Record<Dressed, string[]> = {
  clean: ["WHO TURNED THE SHOW ON?! I'M ON MY BREAK!", 'YOU SET THAT OFF ON PURPOSE!', "THAT'S YOUR FAULT! EVERYTHING TODAY IS YOUR FAULT!"],
  shitty: ['YOU SET THAT OFF ON PURPOSE, YOU STINKING PRICK!', "THAT ONE CAME THROUGH YOUR STINK CLOUD! IT'S CONTAMINATED!", "I'M PUTTING THAT ON YOUR TAB! AND THE CART CLEANING!"],
  nude: ['YOU SET THAT OFF ON PURPOSE! YOU AND YOUR BARE ASS!', "OW! AND THAT'S NOT EVEN THE WORST THING I'VE SEEN TODAY!", "PUT IT ON YOUR TAB! YOU DON'T EVEN HAVE POCKETS!"],
};
/** ...when one of them gets Meathead, and Artie saw it. */
export const ARTIE_GLOATS: Record<Dressed, string[]> = {
  clean: ['HA! THE RIDE HATES YOU TOO!', 'BEST TIME I EVER HAD ON THIS RIDE!', 'HA! DUMBASS!'],
  shitty: ['HA! EVEN THE RIDE WANTS YOU OFF IT!', 'HA! DID THAT KNOCK MORE LOOSE?!', 'HA! RIGHT IN THE STINK!'],
  nude: ['HA! RIGHT IN THE— OH GOD, I LOOKED!', "HA! THE RIDE'S GOT A DRESS CODE TOO!", 'HA! COVER UP! NOT WITH YOUR HANDS!'],
};
/** ...at the end of the line, where it goes straight up. */
export const ARTIE_RAMP: Record<Dressed, string[]> = {
  clean: ['OH NO. NOT THE RAMP!'],
  shitty: ['OH NO. NOT THE RAMP! NOT RIGHT BEHIND HIM!'],
  nude: ['NOT THE RAMP! NOT BEHIND HIM! NOT LOOKING UP!'],
};

/** What he says when these hurt him, and the death screen when they kill him. */
export const HURT_BEAM = ['MY FACE!', 'WHO HANGS A BEAM THERE?!', 'WHY IS THERE ALWAYS A BEAM?!'];
export const DEATH_BEAM = ['MIND YOUR HEAD', 'HEADBANGER'];
export const HURT_ARTIE = ['QUIT RAMMING ME!', 'LEARN TO DRIVE, ARTIE!', 'WHO GAVE YOU A LICENSE?!', 'MY SPINE! YOU BUCK-TOOTHED BASTARD!'];
export const DEATH_ARTIE = ['REAR-ENDED BY A TOUR GUIDE', 'BUMPER CARTED'];
export const HURT_PIT = ['NO TRACK! NO TRACK!'];
export const DEATH_PIT = ['OFF THE RAILS', 'THE UNFRIENDLY ROUTE'];
export const HURT_CART_DART = ['IN MY FACE THIS TIME!', 'IT SAYS POISON! IS IT POISON?!', 'RIGHT IN THE NECK!'];
export const DEATH_CART_DART = ["THE IDOL'S CURSE", 'DONE IN BY A LEAF BLOWER', 'POISON DARTS (REAL)'];
export const HURT_CART_SNAKE = ['THE SNAKE AGAIN!', 'A PUPPET BIT MY FACE!', 'THAT PUPPET HITS LIKE A TRUCK!'];
export const DEATH_CART_SNAKE = ['SERPENT OF DOOM (REAL DOOM)', 'BITTEN BY A PROP', 'FACE FIRST INTO A PUPPET'];
export const HURT_CART_BOULDER = ["THAT'S NOT FOAM EITHER!", 'A ROCK! IN THE CART! WITH ME!', 'MY KNEES!'];
export const DEATH_CART_BOULDER = ['BOULDERED', 'ROCKED OFF THE RAILS', 'INSURANCE SAID FOAM'];
export const HURT_CART_CHASE = ['IT CAUGHT ME!', 'GO FASTER, YOU STUPID CART!', 'IT FLATTENED MY BACK!'];
export const DEATH_CART_CHASE = ['OUTRUN BY A ROCK', 'FLATTENED BY THE FINALE', 'INDIANA BONED AGAIN'];

const all = (r: Record<Dressed, string[]>) => [...r.clean, ...r.shitty, ...r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...MEATHEAD_UNFRIENDLY, ...MEATHEAD_ARTIE_AGAIN, ...MEATHEAD_SEES_DARTS, ...MEATHEAD_SEES_SNAKE, ...MEATHEAD_SEES_LOB, ...MEATHEAD_SEES_CHASE,
    ...HURT_BEAM, ...HURT_ARTIE, ...HURT_PIT, ...HURT_CART_DART, ...HURT_CART_SNAKE, ...HURT_CART_BOULDER, ...HURT_CART_CHASE,
  ],
  death: [...DEATH_BEAM, ...DEATH_ARTIE, ...DEATH_PIT, ...DEATH_CART_DART, ...DEATH_CART_SNAKE, ...DEATH_CART_BOULDER, ...DEATH_CART_CHASE],
  'm2.safari': [...all(ARTIE_CHASE_START), ...all(ARTIE_TAUNT), ...all(ARTIE_BUMP), ...all(ARTIE_SHOT), ...all(ARTIE_TRAPPED), ...all(ARTIE_GLOATS), ...all(ARTIE_RAMP)],
};
