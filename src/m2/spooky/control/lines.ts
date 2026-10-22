// Every line said in this section of Spooky Land, by voice id (the voice pack records these: spooky/voices.ts gathers
// them; tools/voices/m2pack.ts and extract.ts take them from there). Meathead's lines go under 'meathead'; anybody
// else's under their voice id (new speakers need an entry in tools/voices/cast.json). Keep the clean / shitty / naked
// pools the same size wherever lines react to how he is.
//
// The control room and the gift shop: Donnie caught on the PA (his Dracula voice, 'm2.donnie.pa'), then Donnie himself
// ('m2.donnie': the real voice, whiny, Jersey), the dress-up, the run for it, the chase. He's been watching Meathead on
// the cameras the whole way (he knows everything he did, and the state of him). Never says how Meathead got here.
// A glutton (his sin): eating into the mic when he's caught at it, a drumstick in his other hand.

export type Dressed = 'clean' | 'shitty' | 'nude';
export type ByPants = Record<Dressed, readonly string[]>;
export const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

// ---- The control room

/** On the PA as the floor goes up (the Dracula voice): calling in the cleanup for the guest he watched go to hell. */
export const PA_CAUGHT: ByPants = {
  clean: [
    'ATTENTION. *CRUNCH*. A GUEST FELL DOWN THE HELL SHAFT. HE VAS RUDE. GOOD RIDDANCE. *GULP*.',
    'CLEANUP TO THE HELL PIT. ONE DEAD GUEST. BRING TWO MOPS. AND A BUCKET OF CHICKEN.',
    'THE FAT BALD INTRUDER HAS BEEN DEALT VITH. BY GRAVITY. *SLURP*. RESUME SCREAMING.',
  ],
  shitty: [
    'ATTENTION. *CRUNCH*. A GUEST FELL DOWN THE HELL SHAFT. HE VAS FULL OF SHIT. LITERALLY. *GULP*.',
    'CLEANUP TO THE HELL PIT. ONE DEAD GUEST. BRING A HOSE. AND A BUCKET OF CHICKEN.',
    'THE INTRUDER VITH THE LOADED DIAPER HAS BEEN DEALT VITH. *SLURP*. OPEN A VINDOW.',
  ],
  nude: [
    'ATTENTION. *CRUNCH*. A NAKED GUEST FELL DOWN THE HELL SHAFT. EVERYTHING BOUNCED. *GULP*.',
    'CLEANUP TO THE HELL PIT. ONE DEAD NUDIST. BRING A BIG TARP. AND A BUCKET OF CHICKEN.',
    'THE NUDIST HAS BEEN DEALT VITH. *SLURP*. YOU MAY OPEN YOUR EYES. HE VAS NOT HUNG.',
  ],
};

/** Caught: the real voice. */
export const DONNIE_SEES: ByPants = {
  clean: [
    'HOW DID YOU GET IN HERE?! THIS IS AN EMPLOYEE AREA!',
    'HOW DID YOU GET IN HERE?! YOU WERE IN HELL! I WATCHED! I ATE A SANDWICH ABOUT IT!',
    'HOW DID YOU GET IN HERE?! I WAS EATING! THIS IS MY LUNCH HOUR! ALL EIGHT OF THEM!',
  ],
  shitty: [
    'HOW DID YOU GET IN HERE?! WHY DOES IT SMELL LIKE A PORTA-POTTY?!',
    'HOW DID YOU GET IN HERE?! YOU WENT TO HELL AND CAME BACK SMELLING WORSE!',
    "OH NO. HOW DID YOU GET IN HERE?! IT'S ON MY CARPET! ARE YOU KIDDING ME?!",
  ],
  nude: [
    'HOW DID YOU GET IN HERE?! PUT YOUR DICK AWAY! THIS IS AN EMPLOYEE AREA!',
    "HOW DID YOU GET IN HERE?! THEY DIDN'T GIVE YOU A ROBE IN HELL?!",
    "HOW DID YOU GET IN HERE?! WHY IS IT ALL OUT?! I'M EATING SAUSAGE!",
  ],
};
/** Meathead, at the sight of him. */
export const MEATHEAD_SEES = ["YOU'RE THE DRACULA GUY?", 'YOU LOOK LIKE A GUY WHO SELLS MATTRESSES.', 'YOU. YOU CHEW WITH YOUR MOUTH OPEN. INTO A MIC.'];

/** Throwing the getup on in a hurry (trying the Dracula voice out of the real one, and losing it). */
export const DONNIE_DRESS: ByPants = {
  clean: [
    'HOLD ON! I AM COUNT... GOD DAMN IT, WHERE ARE MY TEETH?!',
    "DON'T LOOK! THE COUNT DOESN'T SEE PEOPLE WITHOUT HIS HAIR!",
    'BEHOLD! I AM LORD OF THE... CAPE IS INSIDE OUT. BEHOLD ANYWAY!',
  ],
  shitty: [
    'HOLD ON! I AM COUNT... MY EYES ARE WATERING! YOUR PANTS ARE FULL, YOU KNOW THAT?!',
    "DON'T LOOK! THE COUNT IS BREATHING THROUGH HIS MOUTH!",
    'BEHOLD! I AM LORD OF THE NIGHT! YOU STINK LIKE A TRUCK STOP!',
  ],
  nude: [
    'HOLD ON! I AM COUNT... WHY AM I THE ONE GETTING DRESSED?!',
    "DON'T LOOK! AND YOU DON'T LOOK EITHER! NOBODY LOOK!",
    'BEHOLD! LORD OF THE NIGHT! YOU WANT THE CAPE? WEAR THE CAPE! PLEASE!',
  ],
};
/** And out the door. */
export const DONNIE_FLEES: ByPants = {
  clean: ['THE COUNT MUST GO! FAR AWAY! VERY FAST!', "STAY BACK! I KNOW KARATE! I DON'T! BYE!", "YOU'LL NEVER TAKE ME ALIVE! I'M FAT BUT I'M FAST!"],
  shitty: ['THE COUNT MUST GO! UPWIND!', "STAY BACK! I KNOW KARATE! AND I KNOW WHAT'S IN YOUR PANTS! BYE!", "YOU'LL NEVER TAKE ME ALIVE! OR DOWNWIND!"],
  nude: ['THE COUNT MUST GO! AWAY FROM YOUR WIENER!', "STAY BACK! I KNOW KARATE! I'M NOT KICKING THAT! BYE!", "YOU'LL NEVER TAKE ME ALIVE! NOT WITH THAT THING SWINGING!"],
};
/** Meathead, going after him. */
export const MEATHEAD_AFTER = ['GET BACK HERE, COUNT DORKULA.', 'RUN, DORK. I LIKE A CHASE.', 'RUN, FATASS. SAYS THE FATASS.'];

// ---- The chase, through the gift shop

/** Over his shoulder, running (the gift shop), now and then. */
export const DONNIE_CHASE: ByPants = {
  clean: [
    "SECURITY! WE DON'T HAVE SECURITY! WE HAVE A GUY NAMED RAY!",
    'EVERYTHING IS FORTY PERCENT OFF! TAKE SOMETHING AND FUCK OFF!',
    "MY HEART! I'M FIFTY-THREE!",
    "STAFF! WHOEVER STOPS HIM GETS A FREE HOT DOG! HALF A HOT DOG! I'M HUNGRY!",
  ],
  shitty: [
    "YOU'RE LEAVING A TRAIL! WE JUST WAXED THESE FLOORS!",
    'SECURITY! AND JANITORIAL! MOSTLY JANITORIAL!',
    "MY HEART! MY LUNGS! IT'S IN MY LUNGS!",
    'STAFF! STOP HIM! DOUBLE-GLOVE IT!',
  ],
  nude: [
    'STOP CHASING ME! I CAN HEAR IT SLAPPING!',
    'SECURITY! NAKED MAN IN THE GIFT SHOP! AGAIN! SECOND ONE THIS WEEK!',
    'THE T-SHIRTS ARE RIGHT THERE! PUT ONE ON, YOU ANIMAL!',
    "STAFF! STOP HIM! DON'T GRAB HIM BY ANYTHING!",
  ],
};
/** Throwing the shop at him (a rack over, globes, a barrel). */
export const DONNIE_THROW: ByPants = {
  clean: ['HAVE A RACK! ON THE HOUSE!', "CATCH! IT'S A SNOW GLOBE! IT'S SIX NINETY-NINE!", 'EVERYTHING MUST GO! AT YOU!'],
  shitty: ['HAVE A RACK! WIPE ON THE SHIRTS!', 'CATCH! THEN WIPE!', 'EVERYTHING MUST GO! ESPECIALLY YOU!'],
  nude: ["HAVE A RACK! THEY'RE SHIRTS! PUT ONE ON!", 'CATCH! WITH YOUR HANDS! ONLY YOUR HANDS!', 'EVERYTHING MUST GO! TAKE A HAT! COVER IT!'],
};
/** At the ballroom's doors, before he's in through them. */
export const DONNIE_DOOR: ByPants = {
  clean: ["THE BALLROOM! IT'S BOOKED FOR A WEDDING SATURDAY!", "SANCTUARY! I READ THAT IN A BOOK! I DON'T READ!", 'IN HERE! THE COUNT HAS A PLAN! THE COUNT DOES NOT HAVE A PLAN!'],
  shitty: ["THE BALLROOM! YOU CAN'T COME IN LIKE THAT! THERE'S A BUFFET!", 'SANCTUARY! SANCTUARY HAS A NO-SHIT POLICY!', "IN HERE! THE BUFFET'S IN HERE! I MEAN THE COUNT'S PLAN!"],
  nude: ["THE BALLROOM! IT'S BLACK TIE! YOU'RE NOT EVEN BLACK SOCKS!", 'SANCTUARY! NO SHIRT, NO SHOES, NO DICKS!', 'IN HERE! THE COUNT WILL FACE YOU FROM THE NECK UP!'],
};
/** Behind the ballroom's doors, locked (muffled through them, the doors rattling). */
export const DONNIE_LOCKED: ByPants = {
  clean: ["IT'S LOCKED! I'M NOT HOME!", 'GO AWAY! PRIVATE EVENT! THE EVENT IS ME HIDING!', "SOLID OAK! IT'S PARTICLE BOARD! FROM IKEA! DON'T TEST IT!"],
  shitty: ["IT'S LOCKED! I PUT A TOWEL UNDER IT FOR THE SMELL!", 'GO AWAY! I CAN SMELL YOU THROUGH THE DOOR!', "I'M EATING IN HERE! YOU'RE RUINING MY APPETITE! ALMOST!"],
  nude: ["IT'S LOCKED! AND I'M NOT LOOKING THROUGH THE KEYHOLE! I LOOKED!", "GO AWAY! THERE'S A DRESS CODE! YOU'RE THE OPPOSITE!", "SOLID OAK! DON'T PRESS AGAINST IT! NOT WITH THAT!"],
};
/** Meathead, kicking them in. */
export const MEATHEAD_DOOR_KICK = ['KNOCK KNOCK.', "HERE'S MEATHEAD.", 'ROOM SERVICE.'];
/** Meathead, along the way (the gift shop's merchandise), by where it is: [0] the tee racks, [1] the pitchfork rack,
 *  [2] out of the photo booth, [3] the devil horns. */
export const MEATHEAD_SHOP = [
  "TWENTY-FIVE BUCKS FOR A HELL SHIRT. I WENT TO HELL FOR FREE.",
  "FIFTEEN BUCKS FOR A PITCHFORK. THE FAT DEVIL'S WAS BIGGER.",
  'PICTURE WITH SATAN. ALREADY DID THAT. HE WAS TALLER.',
  'DEVIL HORNS. FIVE BUCKS TO LOOK LIKE A YOUTH PASTOR.',
];
/** Meathead, passing the shop's buffet (ALL-YOU-CAN-EAT, the blood slushies) as Donnie grabs one on the run. */
export const MEATHEAD_BUFFET = ['ALL YOU CAN EAT. THAT EXPLAINS THE COUNT.', 'BLOOD SLUSHIES. NO WONDER HE SWEATS.'];
/** Meathead, coming up out of the floor (the geyser). */
export const MEATHEAD_BURST = ['HOT. HOT. HOT HOT HOT.', 'MY ASS IS ON FIRE. AGAIN.', "WHAT FLOOR IS THIS? WHERE'S THE BUFFET?"];

// ---- The gift shop's staff (costumed: devil horns, the mascot suit), and what they do to him

export const HURT_PITCHFORK = ['A SOUVENIR PITCHFORK! IN MY GUT!', 'THEY SELL REAL ONES?!', 'FORTY PERCENT OFF MY KIDNEY!'];
export const DEATH_PITCHFORK = ['SKEWERED BY MERCHANDISE', 'PRICED TO MOVE', 'IMPULSE BUY'];
export const HURT_CLERK = ["THE CASHIER HIT ME! I'M A CUSTOMER!", "I WANT YOUR MANAGER! YOUR MANAGER'S MANAGER!", 'CUSTOMER SERVICE SUCKS HERE!'];
export const DEATH_CLERK = ['RUNG UP', 'CHECKED OUT AT REGISTER FOUR', 'NO REFUNDS'];
export const HURT_GLOBE = ['SNOW GLOBE TO THE FACE!', 'GLASS AND FAKE SNOW IN MY EYE!', 'WHO EVEN BUYS THESE, GRANDMAS?!'];
export const DEATH_GLOBE = ['SNOW GLOBED', 'KILLED BY A SOUVENIR', 'SHAKEN, NOT STIRRED'];
export const HURT_BARREL = ['A BARREL OF PITCHFORKS! WHO ROLLS THAT?!', 'MY SHINS!', "THAT'S FIFTEEN BUCKS A FORK, DUMBASS!"];
export const DEATH_BARREL = ['BARRELED OVER', 'ROLLED FLAT', 'MARKED DOWN'];
export const HURT_MASCOT = ['THE MASCOT HUMPED ME!', 'GET YOUR FOAM HEAD OUT OF MY FACE!', 'LIL LUCIFER HITS LIKE A TRUCK!'];
export const DEATH_MASCOT = ['HUGGED TO DEATH BY A MASCOT', 'MASCOTTED', 'FLATTENED BY FOAM'];
/** The staff, as they come at him (each by how he looks: a clean / shitty / naked pool). */
export const STAFF_BARK: ByPants = {
  clean: ["SIR, YOU CAN'T BE BACK HERE!", 'WELCOME TO THE GIFT SHOP OF THE DAMNED! DIE!', 'HAVE YOU SIGNED UP FOR OUR REWARDS CARD?!'],
  shitty: ["SIR, YOU CAN'T SHIT BACK HERE!", 'CLEANUP ON EVERY AISLE!', "OH GOD! IT'S IN HIS SOCKS! IT'S IN HIS SHOES!"],
  nude: ['SIR, YOU CANNOT BE NAKED IN THE GIFT SHOP!', 'COVER IT WITH A TOTE BAG! A SMALL ONE WILL DO!', "I DON'T GET PAID ENOUGH TO LOOK AT THAT!"],
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_DOOR_KICK, ...MEATHEAD_SEES, ...MEATHEAD_AFTER, ...MEATHEAD_SHOP, ...MEATHEAD_BUFFET, ...MEATHEAD_BURST, ...HURT_PITCHFORK, ...HURT_CLERK, ...HURT_GLOBE, ...HURT_MASCOT, ...HURT_BARREL],
  death: [...DEATH_PITCHFORK, ...DEATH_CLERK, ...DEATH_GLOBE, ...DEATH_MASCOT, ...DEATH_BARREL],
  'm2.donnie.pa': [...all(PA_CAUGHT)],
  'm2.donnie': [...[DONNIE_SEES, DONNIE_DRESS, DONNIE_FLEES, DONNIE_CHASE, DONNIE_THROW, DONNIE_DOOR, DONNIE_LOCKED].flatMap(all)],
  'm2.spooky.clerk': [...all(STAFF_BARK)],
  'm2.spooky.clerkf': [...all(STAFF_BARK)],
};
