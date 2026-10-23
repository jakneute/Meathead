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
  nude: ['NOBODY JUMPS OUT OF MY BOAT! NOBODY! PUT SOME PANTS ON!', "STOP! THIS RIDE HAS A DRESS CODE! IT'S PANTS!"],
};
/** ...while he's after him (from here on, three ways too: whatever Meathead's wearing as it's said). */
export const ARTIE_TAUNT: Record<Dressed, string[]> = {
  clean: [
    'I KNOW EVERY INCH OF THIS PARK! YOU KNOW THE SNACK BAR!',
    'KEEP YOUR ARMS IN THE CART SO I CAN BREAK THEM!',
    "MY BROTHER COULDN'T DO THIS! I'M THE TALENTED ARTIE!",
    "I'M ON MY BREAK, YOU FAT FUCK! THIS IS ME ON BREAK!",
  ],
  shitty: [
    "I TRACKED A JAGUAR FOR THREE DAYS! YOU'RE LEAVING A TRAIL!",
    "I CAN'T SEE YOU IN THE DARK! I CAN SMELL YOU, THOUGH!",
    "THEY'RE GONNA HAVE TO BURN THAT CART! WITH YOU IN IT!",
    'SKIPPER OF THE YEAR! CHASING A TURD THROUGH A MINE!',
  ],
  nude: [
    'THOSE SEATS ARE NOT RATED FOR BARE ASS!',
    'KEEP YOUR ARMS IN THE CART! AND WHATEVER ELSE IS FLAPPING!',
    "BEST HUNTER IN THE PARK! I'VE NEVER HUNTED ANYTHING THIS PINK!",
    'I CAN SEE YOUR TAINT FROM HERE! THANKS!',
  ],
};
/** ...riding his tail (his cart can't ram: the ride sets the pace), chewing him out. */
export const ARTIE_CHIDE: Record<Dressed, string[]> = {
  clean: ['KEEP YOUR HANDS INSIDE THE CART!', 'NO STANDING ON THE RIDE, DUMBASS!', "I'VE NEVER LOST A GUEST! I'M NOT STARTING WITH YOU!", "THIS IS MY PARK! I'M ON THE BROCHURE!", "YOU'RE BANNED! FROM THIS RIDE AND ALL RIDES!"],
  shitty: ['KEEP YOUR HANDS INSIDE THE CART! AND WHATEVER THAT IS!', "THAT CART'S GETTING BURNED! YOU'RE PAYING FOR IT!", "I'VE NEVER LOST A GUEST! I'D LIKE TO LOSE YOU!", "SOMEBODY'S GRANDMA SITS IN THAT SEAT NEXT!", "YOU'RE BANNED! AND HOSED DOWN! THEN BANNED!"],
  nude: ['KEEP YOUR HANDS INSIDE THE CART! AND EVERYTHING ELSE!', "I'M ON THE BROCHURE! YOU'RE GONNA BE ON A WARNING SIGN!", "I'M WRITING YOU UP! THERE'S NO BOX FOR BALLS!", 'THIS IS A FAMILY RIDE! COVER UP YOUR FAMILY JEWELS!', "YOU'RE BANNED! PUT SOMETHING ON AND GET BANNED!"],
};
/** ...when he's shot at. */
export const ARTIE_SHOT: Record<Dressed, string[]> = {
  clean: ["OW! THAT'S A WRITE-UP!", 'NOT THE FACE! THE FACE IS ON THE BROCHURE!', 'YOU SHOT SKIPPER OF THE YEAR, ASSHOLE!'],
  shitty: ["YOU CAN'T AIM AND YOU CAN'T HOLD IT IN!", "THAT DOESN'T COUNT! YOU SHIT YOURSELF! IT DOESN'T COUNT!", 'I AM NOT DYING DOWNWIND OF YOU!'],
  nude: ['INDECENT EXPOSURE AND ASSAULT! THAT IS TWO WRITE-UPS!', "SHOT BY A NAKED MAN! THAT'S NOT GOING ON MY RECORD!", 'PUT THAT AWAY! THE GUN TOO!'],
};
/** ...when one of the ride's tricks gets him instead (it's Meathead's fault: everything is). */
export const ARTIE_TRAPPED: Record<Dressed, string[]> = {
  clean: ["WHO TURNED THE SHOW ON?! I'M ON MY BREAK!", "THAT DIDN'T HAPPEN! NOBODY SAW THAT!", "THAT'S YOUR FAULT! EVERYTHING TODAY IS YOUR FAULT!"],
  shitty: ['YOU SET THAT OFF ON PURPOSE, YOU STINKING PRICK!', "THAT DIDN'T HAPPEN! YOU SHITTING YOURSELF HAPPENED!", "I'M PUTTING THAT ON YOUR TAB! AND THE CART CLEANING!"],
  nude: ['YOU SET THAT OFF ON PURPOSE! YOU AND YOUR BARE ASS!', "OW! AND THAT'S NOT EVEN THE WORST THING I'VE SEEN TODAY!", "PUT IT ON YOUR TAB! YOU DON'T EVEN HAVE POCKETS!", "THAT DIDN'T HAPPEN! NOBODY SAW THAT! THEY'RE ALL LOOKING AT YOU!"],
};
/** ...each of the ride's tricks that misses Meathead and has him instead, its own (his sin's pride: the face, the
 *  brochure, skipper of the year; it didn't happen). Darts: stuck in his face, he yanks one out. */
export const ARTIE_DARTED: Record<Dressed, string[]> = {
  clean: ['OW! NOT THE BROCHURE FACE!', "THAT DIDN'T HAPPEN. THERE'S NOTHING IN MY FACE.", 'I LOOK GOOD WITH DARTS. THAT IS A FACT.'],
  shitty: ['DARTS IN MY FACE AND I STILL SMELL BETTER THAN YOU!', 'OW! PRETTIER THAN SHIT-PANTS! STILL!', "THAT DIDN'T HAPPEN! YOUR PANTS HAPPENED!"],
  nude: ['OW! STILL PRETTIER THAN YOUR NAKED ASS!', 'THE FACE IS ON THE BROCHURE! YOUR ASS IS ON A WARNING SIGN!', "AT LEAST THEY'RE IN MY FACE! NOT IN YOUR BARE ASS!"],
};
/** ...the Serpent of Doom: knocks his helmet off, and there's the bald spot under it (he covers it). */
export const ARTIE_BALDED: Record<Dressed, string[]> = {
  clean: ["DON'T LOOK AT IT! THE HAT STAYS ON!", "IT'S NOT BALD! IT'S SUN-THINNED!", 'NOBODY SEES THE HEAD! NOBODY!'],
  shitty: ["DON'T LOOK AT MY HEAD! LOOK AT YOUR PANTS!", "I'M BALD! YOU'RE FULL OF SHIT! I WIN!", 'EYES OFF THE SCALP, SHIT-PANTS!'],
  nude: ["DON'T LOOK AT MY HEAD! I'M NOT LOOKING AT YOURS!", "I'M BALD UP TOP! YOU'RE BALD EVERYWHERE!", 'COVER YOURS AND I COVER MINE!'],
};
/** ...a lobbed boulder: flattened like a pancake, then he pops back up. */
export const ARTIE_FLATTENED: Record<Dressed, string[]> = {
  clean: ["THAT DIDN'T HAPPEN. I'M FINE. I'M GREAT.", 'FLAT! STILL SKIPPER OF THE YEAR!', "THAT WAS FOAM! IT'S ALL FOAM!"],
  shitty: ["I'M FLAT AND I STILL DON'T SMELL LIKE YOU!", "I'M FINE! YOU'RE THE ONE WHO SHIT!", 'FLATTENED! STILL CLEANER THAN YOUR SEAT!'],
  nude: ['FLAT AS A PANCAKE! STILL BIGGER THAN YOUR DICK!', "I'M FINE! I'M GREAT! COVER THAT UP!", "THAT DOESN'T COUNT! YOU'RE NAKED!"],
};
/** ...the big one, right over him: flipped up out of his seat, head first into the cart, legs kicking. */
export const ARTIE_FLIPPED: Record<Dressed, string[]> = {
  clean: ["I MEANT TO DO THAT! THAT'S A STUNT!", "THAT'S MY BOULDER! IT KNOWS ME!", "NOBODY SAW THAT! I'M ON THE BROCHURE!"],
  shitty: ["I MEANT TO DO THAT! YOU DIDN'T MEAN TO DO THAT!", 'THAT WAS A STUNT! YOUR PANTS ARE AN ACCIDENT!', 'UPSIDE DOWN AND I CAN STILL SMELL YOU!'],
  nude: ['I MEANT TO DO THAT! YOU MEANT TO DO THAT?!', "THAT WAS A STUNT! WHAT'S YOUR EXCUSE?!", 'UPSIDE DOWN AND I CAN STILL SEE YOUR BALLS!'],
};
/** ...when one of them gets Meathead, and Artie saw it. */
export const ARTIE_GLOATS: Record<Dressed, string[]> = {
  clean: ['HA! THE RIDE HATES YOU TOO!', "BEST TIME I EVER HAD ON THIS RIDE! AND I'VE HAD SEX ON IT!", 'HA! I KNEW THAT WAS THERE! I KNOW EVERYTHING!'],
  shitty: ['HA! A THOUSAND RIDES! NEVER HIT ONCE! NEVER SHIT ONCE!', 'HA! DID THAT KNOCK MORE LOOSE?!', 'HA! RIGHT IN THE SHITTER!'],
  nude: ['HA! RIGHT IN THE— OH GOD, I LOOKED!', 'HA! A THOUSAND RIDES! NEVER HIT ONCE! NEVER NAKED ONCE!', 'HA! COVER UP! NOT WITH YOUR HANDS!'],
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
  'm2.safari': [...all(ARTIE_CHASE_START), ...all(ARTIE_TAUNT), ...all(ARTIE_CHIDE), ...all(ARTIE_SHOT), ...all(ARTIE_TRAPPED), ...all(ARTIE_DARTED), ...all(ARTIE_BALDED), ...all(ARTIE_FLATTENED), ...all(ARTIE_FLIPPED), ...all(ARTIE_GLOATS), ...all(ARTIE_RAMP)],
};
