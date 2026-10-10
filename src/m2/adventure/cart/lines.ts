// What's said in the mine cart, by voice (recorded with the rest: tools/voices). Where somebody reacts to him, three
// ways: clean pants, shitty ones, naked.

export type Dressed = 'clean' | 'shitty' | 'nude';

/** Meathead, when the guest scanner reads him as UNFRIENDLY and throws the switch up the hill. */
export const MEATHEAD_UNFRIENDLY = ['DAMN RIGHT I AM.', 'WHAT GAVE IT AWAY?', 'FRIENDLY GUESTS CAN SUCK IT.', 'FINALLY, A MACHINE THAT GETS ME.'];
/** Meathead, when Safari Artie turns up behind him in a cart of his own. */
export const MEATHEAD_ARTIE_AGAIN = ["OH, COME ON. IT'S THE BOAT GUY.", 'ARTIE?! HOW ARE YOU EVEN HERE?', "YOU AGAIN? DON'T YOU HAVE A BOAT TO SINK?"];

/** Safari Artie, rolling up behind him. */
export const ARTIE_CHASE_START: Record<Dressed, string[]> = {
  clean: ['YOU JUMPED OUT OF MY BOAT! NOBODY JUMPS OUT OF MY BOAT!', 'HEY! YOU NEVER FINISHED THE TOUR! THE TOUR IS MANDATORY!'],
  shitty: ['YOU JUMPED OUT OF MY BOAT! AND YOU LEFT SOMETHING ON THE SEAT!', 'HEY! STOP! YOU SMELL LIKE THE BACK OF THE HIPPO ENCLOSURE!'],
  nude: ['YOU JUMPED OUT OF MY BOAT! AND PUT SOME PANTS ON!', "HEY! STOP! THERE'S A DRESS CODE ON THIS RIDE! IT'S PANTS!"],
};
/** ...while he's after him (from here on, three ways too: whatever Meathead's wearing as it's said). */
export const ARTIE_TAUNT: Record<Dressed, string[]> = {
  clean: [
    'THIS IS AN UNAUTHORIZED RIDE EXPERIENCE!',
    'KEEP YOUR HANDS AND ARMS INSIDE THE CART SO I CAN BREAK THEM!',
    "I'VE BEEN DRIVING THESE CARTS SINCE TWO THOUSAND NINE!",
    "MY BROTHER WOULD'VE HAD YOU BY NOW! HE WAS AN ASSHOLE, BUT HE WAS FAST!",
    "I'M ON MY BREAK! YOU'RE RUINING MY BREAK!",
  ],
  shitty: [
    "THIS IS AN UNAUTHORIZED RIDE EXPERIENCE! AND YOU'RE LEAVING A TRAIL!",
    "I CAN'T SEE YOU IN THE DARK! DOESN'T MATTER! I CAN FOLLOW MY NOSE!",
    "I'VE BEEN DRIVING THESE CARTS SINCE TWO THOUSAND NINE! YOURS IS THE FIRST ONE THEY'LL HAVE TO BURN!",
    'MY BROTHER WOULD\'VE HAD YOU BY NOW! HE ALSO WOULD\'VE BEEN SMART ENOUGH TO STAY UPWIND!',
    "I'M ON MY BREAK! I WAS GONNA EAT LUNCH! I'M NEVER EATING LUNCH AGAIN!",
  ],
  nude: [
    'THIS IS AN UNAUTHORIZED RIDE EXPERIENCE! AND THOSE SEATS ARE NOT RATED FOR BARE SKIN!',
    'KEEP YOUR HANDS AND ARMS INSIDE THE CART! AND WHATEVER ELSE IS FLAPPING AROUND IN THERE!',
    "I'VE BEEN DRIVING THESE CARTS SINCE TWO THOUSAND NINE! NEVER BEHIND A BARE ASS! NOT ONCE!",
    "MY BROTHER WOULD'VE HAD YOU BY NOW! HE WAS AN ASSHOLE, BUT HE KEPT HIS ASS COVERED!",
    "I'M ON MY BREAK! THIS IS NOT WHAT I WANTED TO LOOK AT ON MY BREAK!",
  ],
};
/** ...when he rams him. */
export const ARTIE_BUMP: Record<Dressed, string[]> = {
  clean: ['BUMPER CARTS!', "THAT'S FOR THE BOAT!", 'RAMMING SPEED!', 'HOW DO YOU LIKE THAT, BIG GUY?!'],
  shitty: ['BUMPER CARTS! ...OH GOD, IT SPLASHED!', "THAT'S FOR THE BOAT! AND FOR THE BENCH!", "RAMMING SPEED! I'M HOLDING MY BREATH!", 'HOW DO YOU LIKE THAT, STINKY?!'],
  nude: ['BUMPER CARTS! ...WHY DID IT ALL JIGGLE LIKE THAT?!', "THAT'S FOR THE BOAT! AND FOR MY EYES!", 'RAMMING SPEED! EYES CLOSED! EYES CLOSED!', 'HOW DO YOU LIKE THAT, NAKED BOY?!'],
};
/** ...when he's shot at. */
export const ARTIE_SHOT: Record<Dressed, string[]> = {
  clean: ["OW! THAT'S A WRITE-UP!", 'HEY! I DO NOT GET PAID ENOUGH FOR THIS!', 'WATCH IT! THIS IS A RENTAL HELMET!'],
  shitty: [
    "OW! YOU CAN'T AIM AND YOU CAN'T HOLD IT! IS THERE ANYTHING YOU CAN DO?!",
    "HEY! I DO NOT GET PAID ENOUGH FOR THIS! I DON'T GET PAID ENOUGH FOR THE SMELL ALONE!",
    "WATCH IT! I AM NOT DYING DOWNWIND OF YOU!",
  ],
  nude: [
    "OW! THAT'S A WRITE-UP! INDECENT EXPOSURE AND ASSAULT! THAT'S TWO WRITE-UPS!",
    'HEY! I DO NOT GET PAID ENOUGH FOR THIS! NOBODY GETS PAID ENOUGH TO SEE THAT!',
    "WATCH IT! NAKED GUYS DON'T GET TO SHOOT AT PEOPLE! THAT'S A RULE! IT SHOULD BE!",
  ],
};
/** ...at the end of the line, where it goes straight up. */
export const ARTIE_RAMP: Record<Dressed, string[]> = {
  clean: ['OH NO. NOT THE RAMP. NOT THE RAMP!'],
  shitty: ['OH NO. NOT THE RAMP. NOT THE RAMP! ...OH GOD. NOW I GET IT. NOW I UNDERSTAND YOUR PANTS!'],
  nude: ['OH NO. NOT THE RAMP. NOT THE RAMP! NOT RIGHT BEHIND HIM! NOT LOOKING UP AT HIM!'],
};

/** What he says when these hurt him, and the death screen when they kill him. */
export const HURT_BEAM = ['MY FACE! MY BEAUTIFUL FACE!', 'WHO HANGS A BEAM THERE?!', 'BEAM! BEAM! WHY IS THERE ALWAYS A BEAM!'];
export const DEATH_BEAM = ['MIND YOUR HEAD', 'HEADBANGER'];
export const HURT_ARTIE = ['QUIT RAMMING ME!', 'LEARN TO DRIVE, ARTIE!', 'WHO GAVE YOU A LICENSE?!', 'MY SPINE! YOU BUCK-TOOTHED BASTARD!'];
export const DEATH_ARTIE = ['REAR-ENDED BY A TOUR GUIDE', 'BUMPER CARTED'];
export const HURT_PIT = ['NO TRACK! NO TRACK!'];
export const DEATH_PIT = ['OFF THE RAILS', 'THE UNFRIENDLY ROUTE'];

const all = (r: Record<Dressed, string[]>) => [...r.clean, ...r.shitty, ...r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_UNFRIENDLY, ...MEATHEAD_ARTIE_AGAIN, ...HURT_BEAM, ...HURT_ARTIE, ...HURT_PIT],
  death: [...DEATH_BEAM, ...DEATH_ARTIE, ...DEATH_PIT],
  'm2.safari': [...all(ARTIE_CHASE_START), ...all(ARTIE_TAUNT), ...all(ARTIE_BUMP), ...all(ARTIE_SHOT), ...all(ARTIE_RAMP)],
};
