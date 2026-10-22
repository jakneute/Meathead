// What's said in the mine cart, by voice (recorded with the rest: tools/voices). Where somebody reacts to him, three
// ways: clean pants, shitty ones, naked.

export type Dressed = 'clean' | 'shitty' | 'nude';

/** Meathead, when the guest scanner reads him as UNFRIENDLY and throws the switch up the hill. */
export const MEATHEAD_UNFRIENDLY = ['DAMN RIGHT I AM.', 'WHAT GAVE IT AWAY? THE FACE?', 'FRIENDLY GUESTS CAN SUCK MY DICK.', 'FINALLY, A MACHINE WITH SOME BALLS.'];
/** Meathead, when Safari Artie turns up behind him in a cart of his own. */
export const MEATHEAD_ARTIE_AGAIN = ['OH, COME ON. THE BOAT GUY.', 'ARTIE?! HOW ARE YOU EVEN HERE?', "DON'T YOU HAVE A BOAT TO RUN OUT OF GAS?"];

/** Meathead, the first time each of the ride's tricks goes off at him (he's seen them all from behind, backstage). */
export const MEATHEAD_SEES_DARTS = ["I KNOW THERE'S A GUY BACK THERE WITH A LEAF BLOWER!", 'I SAW YOUR BUCKET OF DARTS, DIPSHIT!', 'NICE LEAF BLOWER, ASSHOLE!'];
export const MEATHEAD_SEES_SNAKE = ['IT SAYS SERPENT OF DOOM ON YOUR ASS!', "I'VE SEEN YOUR AIR TANK, SNAKE!", 'I KNOW WHERE YOUR HAND GOES, SNAKE.'];
export const MEATHEAD_SEES_LOB = ['INSURANCE SAID FOAM!', "I KNOW YOU'RE BACK THERE WITH A CATAPULT!", 'NICE CATAPULT, DUNGEONS AND DRAGONS!'];
export const MEATHEAD_SEES_CHASE = ["THAT ONE WASN'T BACKSTAGE!", "THAT'S NOT FOAM! THAT'S NOT FOAM!", 'GO GO GO GO GO!'];

/** Safari Artie, rolling up behind him. */
export const ARTIE_CHASE_START: Record<Dressed, string[]> = {
  clean: ['YOU JUMPED OUT OF MY BOAT! NOBODY JUMPS OUT OF MY BOAT!', "YOU NEVER FINISHED THE TOUR! IT'S MANDATORY! IT'S IN THE WAIVER!"],
  shitty: ['YOU JUMPED OUT OF MY BOAT, YOU SHIT-STAINED PRICK!', 'THE TOUR IS MANDATORY! SO IS WIPING!'],
  nude: ['YOU JUMPED OUT OF MY BOAT! PUT SOME PANTS ON!', "STOP! THIS RIDE HAS A DRESS CODE! IT'S PANTS!"],
};
/** ...while he's after him (from here on, three ways too: whatever Meathead's wearing as it's said). */
export const ARTIE_TAUNT: Record<Dressed, string[]> = {
  clean: [
    'THIS IS AN UNAUTHORIZED RIDE EXPERIENCE!',
    'KEEP YOUR ARMS IN THE CART SO I CAN BREAK THEM!',
    "MY BROTHER WOULD'VE HAD YOU BY NOW! HE WAS AN ASSHOLE!",
    "I'M ON MY BREAK, YOU FAT FUCK!",
  ],
  shitty: [
    "THIS IS AN UNAUTHORIZED RIDE EXPERIENCE! AND YOU'RE LEAVING A TRAIL!",
    "I CAN'T SEE YOU IN THE DARK! I CAN SMELL YOU, THOUGH!",
    "THEY'RE GONNA HAVE TO BURN THAT CART! WITH YOU IN IT!",
    "I HAD A TUNA SANDWICH FOR LUNCH! IT'S COMING BACK!",
  ],
  nude: [
    'THOSE SEATS ARE NOT RATED FOR BARE ASS!',
    'KEEP YOUR ARMS IN THE CART! AND WHATEVER ELSE IS FLAPPING!',
    'MY BROTHER WAS AN ASSHOLE, BUT HE KEPT HIS ASS COVERED!',
    'I CAN SEE YOUR TAINT FROM HERE! THANKS!',
  ],
};
/** ...riding his tail (his cart can't ram: the ride sets the pace), chewing him out. */
export const ARTIE_CHIDE: Record<Dressed, string[]> = {
  clean: ['KEEP YOUR HANDS INSIDE THE CART!', 'NO STANDING ON THE RIDE, DUMBASS!', "I'M WRITING YOU UP! I'VE GOT A PEN IN HERE!", 'THIS IS A FAMILY RIDE! QUIT BEING A FAT DICK!', "YOU'RE BANNED! FROM THIS RIDE AND ALL RIDES!"],
  shitty: ['KEEP YOUR HANDS INSIDE THE CART! AND WHATEVER THAT IS!', "THAT CART'S GETTING BURNED! YOU'RE PAYING FOR IT!", "I CAN SMELL YOU FROM HERE! THAT'S A WRITE-UP!", "SOMEBODY'S GRANDMA SITS IN THAT SEAT NEXT!", "YOU'RE BANNED! AND HOSED DOWN! THEN BANNED!"],
  nude: ['KEEP YOUR HANDS INSIDE THE CART! AND EVERYTHING ELSE!', "NO NAKED ON THE RIDE! IT'S ON THE SIGN!", "I'M WRITING YOU UP! THERE'S NO BOX FOR BALLS!", 'THIS IS A FAMILY RIDE! COVER UP YOUR FAMILY JEWELS!', "YOU'RE BANNED! PUT SOMETHING ON AND GET BANNED!"],
};
/** ...when he's shot at. */
export const ARTIE_SHOT: Record<Dressed, string[]> = {
  clean: ["OW! THAT'S A WRITE-UP!", 'I MAKE NINE FIFTY AN HOUR, ASSHOLE!', 'WATCH IT! THIS IS A RENTAL HELMET!'],
  shitty: ["YOU CAN'T AIM AND YOU CAN'T HOLD IT IN!", "I DON'T GET PAID ENOUGH FOR THE SMELL ALONE!", 'I AM NOT DYING DOWNWIND OF YOU!'],
  nude: ['INDECENT EXPOSURE AND ASSAULT! THAT IS TWO WRITE-UPS!', 'NOBODY GETS PAID ENOUGH TO SEE THAT!', 'PUT THAT AWAY! THE GUN TOO!'],
};
/** ...when one of the ride's tricks gets him instead (it's Meathead's fault: everything is). */
export const ARTIE_TRAPPED: Record<Dressed, string[]> = {
  clean: ["WHO TURNED THE SHOW ON?! I'M ON MY BREAK!", 'YOU SET THAT OFF ON PURPOSE!', "THAT'S YOUR FAULT! EVERYTHING TODAY IS YOUR FAULT!"],
  shitty: ['YOU SET THAT OFF ON PURPOSE, YOU STINKING PRICK!', "THAT DART WENT THROUGH YOUR STINK! NOW I'M POISONED TWICE!", "I'M PUTTING THAT ON YOUR TAB! AND THE CART CLEANING!"],
  nude: ['YOU SET THAT OFF ON PURPOSE! YOU AND YOUR BARE ASS!', "OW! AND THAT'S NOT EVEN THE WORST THING I'VE SEEN TODAY!", "PUT IT ON YOUR TAB! YOU DON'T EVEN HAVE POCKETS!"],
};
/** ...when one of them gets Meathead, and Artie saw it. */
export const ARTIE_GLOATS: Record<Dressed, string[]> = {
  clean: ['HA! THE RIDE HATES YOU TOO!', "BEST TIME I EVER HAD ON THIS RIDE! AND I'VE HAD SEX ON IT!", 'HA! DUMBASS!'],
  shitty: ['HA! EVEN THE RIDE WANTS YOU OFF IT!', 'HA! DID THAT KNOCK MORE LOOSE?!', 'HA! RIGHT IN THE SHITTER!'],
  nude: ['HA! RIGHT IN THE— OH GOD, I LOOKED!', "HA! THE RIDE'S GOT A DRESS CODE TOO!", 'HA! COVER UP! NOT WITH YOUR HANDS!'],
};
/** ...at the end of the line, where it goes straight up. */
export const ARTIE_RAMP: Record<Dressed, string[]> = {
  clean: ['OH NO. NOT THE RAMP!'],
  shitty: ['OH NO. NOT THE RAMP! NOT RIGHT BEHIND HIM!'],
  nude: ['NOT THE RAMP! NOT LOOKING UP AT HIS BALLS!'],
};

/** What he says when these hurt him, and the death screen when they kill him. */
export const HURT_BEAM = ['MY FACE! MY MONEY MAKER!', 'WHO HANGS A BEAM THERE?!', 'WHY IS THERE ALWAYS A BEAM?!'];
export const DEATH_BEAM = ['MIND YOUR HEAD', 'BEAMED IN THE FOREHEAD'];
export const HURT_PIT = ['NO TRACK! NO FUCKING TRACK!'];
export const DEATH_PIT = ['OFF THE RAILS', 'THE UNFRIENDLY ROUTE'];
export const HURT_CART_DART = ['IN MY FACE THIS TIME!', 'IT SAYS POISON! REAL POISON OR PARK POISON?!', 'RIGHT IN THE NECK!'];
export const DEATH_CART_DART = ["THE IDOL'S CURSE", 'DONE IN BY A LEAF BLOWER', 'POISON DARTS (REAL)'];
export const HURT_CART_SNAKE = ["THE PUPPET'S BACK AND HE'S PISSED!", 'A PUPPET BIT MY FACE!', 'THAT PUPPET HITS LIKE A TRUCK!'];
export const DEATH_CART_SNAKE = ['SERPENT OF DOOM (REAL DOOM)', 'BITTEN BY A PROP', 'FACE FIRST INTO A PUPPET'];
export const HURT_CART_BOULDER = ["THAT'S NOT FOAM EITHER!", 'A ROCK! IN THE CART! WITH ME!', 'MY KNEES! I JUST GOT THEM REPLACED!'];
export const DEATH_CART_BOULDER = ['BOULDERED', 'ROCKED OFF THE RAILS', 'INSURANCE SAID FOAM'];
export const HURT_CART_CHASE = ['IT CAUGHT ME!', 'GO FASTER, YOU STUPID CART!', 'IT FLATTENED MY ASS! I HAD A GREAT ASS!'];
export const DEATH_CART_CHASE = ['OUTRUN BY A ROCK', 'FLATTENED BY THE FINALE', 'INDIANA BONED AGAIN'];

const all = (r: Record<Dressed, string[]>) => [...r.clean, ...r.shitty, ...r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...MEATHEAD_UNFRIENDLY, ...MEATHEAD_ARTIE_AGAIN, ...MEATHEAD_SEES_DARTS, ...MEATHEAD_SEES_SNAKE, ...MEATHEAD_SEES_LOB, ...MEATHEAD_SEES_CHASE,
    ...HURT_BEAM, ...HURT_PIT, ...HURT_CART_DART, ...HURT_CART_SNAKE, ...HURT_CART_BOULDER, ...HURT_CART_CHASE,
  ],
  death: [...DEATH_BEAM, ...DEATH_PIT, ...DEATH_CART_DART, ...DEATH_CART_SNAKE, ...DEATH_CART_BOULDER, ...DEATH_CART_CHASE],
  'm2.safari': [...all(ARTIE_CHASE_START), ...all(ARTIE_TAUNT), ...all(ARTIE_CHIDE), ...all(ARTIE_SHOT), ...all(ARTIE_TRAPPED), ...all(ARTIE_GLOATS), ...all(ARTIE_RAMP)],
};
