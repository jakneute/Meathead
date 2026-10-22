// What's said in the town, by voice (recorded with the rest: spooky/voices.ts gathers these; tools/voices). Only
// Meathead talks here (the costumed staff just come at him), so nothing in here needs clean / shitty / naked pools.
// The hurt and death lines are registered against their sources in kinds.ts, from these same lists. (The staff under
// the costumes are men and women both, by seed: no he or she for them.)

/** Walking into the town square (once, from the start). */
export const ARRIVE = [
  'SPOOKY TOWN. THERE IS AN ATM IN THE CRYPT. VERY HAUNTED.',
  'A HAUNTED TOWN WITH A STARBUCKS. THE GHOSTS ORDER VENTIS.',
];
/** His first look at the ELEVATOR TO HELL's clock tower, way off in the back. */
export const ELEVATOR_SEEN = [
  'ELEVATOR TO HELL. OH, I AM RIDING THAT.',
  "ELEVATOR TO HELL. THAT'S MY RIDE. EVERYTHING ELSE CAN SUCK IT.",
];
/** Still on his mind, on the castle stairs (the tower's over past it). */
export const ELEVATOR_AGAIN = [
  "HOLD MY SEAT, ELEVATOR. DADDY'S COMING.",
  'ONE CASTLE BETWEEN ME AND HELL. STORY OF MY LIFE.',
];
/** At the stairs, reading the sign. */
export const STAIRS = [
  "DRACULA'S OTHER CASTLE. WHO GOT THE FIRST ONE, HIS EX-WIFE?",
  "THIS MANY STAIRS FOR A GUY WHO TURNS INTO A BAT. LAZY PRICK.",
];

/** The haunted kiddie rides, mocked in passing (once each: one of these picked). */
export const RIDE_LINES: Record<'cups' | 'carousel' | 'train' | 'drop' | 'pony', string[]> = {
  cups: [
    "SPINNING COFFINS. SOME POOR BASTARD'S GOTTA HOSE THE PUKE OUT OF THOSE.",
    'MUST BE THIS SHORT TO RIDE. DISCRIMINATION.',
  ],
  carousel: [
    'YOU GLUED FANGS ON A HORSE. THAT IS STILL A HORSE, DUMBASS.',
    'SPOOKY ORGAN MUSIC ON A MERRY-GO-ROUND. YOU HACKS.',
  ],
  train: [
    'A GHOST TRAIN WITH A PACIFIER. THE GHOST IS A BABY. WHO KILLED A BABY?',
    'OOOH, A CHOO-CHOO. I SHIT MY PANTS. NOT REALLY.',
  ],
  drop: [
    "MINI DROP OF DOOM. SIX FEET. I'VE FALLEN OFF TALLER BARSTOOLS.",
    'THE SIGN IS TALLER THAN THE RIDE. LIKE MY DICK AND MY... NEVER MIND.',
  ],
  pony: [
    "A SKELETON PONY. THEY'RE STILL BEATING A DEAD HORSE FOR QUARTERS.",
    "THAT'S THE QUARTER HORSE FROM OUTSIDE KMART IN A COSTUME.",
  ],
};

/** What hurts him in the town (by source: an enemy's kind, or what it throws), and the death screen when it kills him. */
export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:town_bat': {
    hurt: ['BAT IN MY HAIR!', 'IT BIT MY NECK! DO I GET POWERS NOW?!', 'GET OFF, YOU FLYING TAMPON!'],
    death: ['SUCKED DRY BY A TINY BAT', 'GIVEN A HICKEY BY A BAT'],
  },
  'm2:town_crow': {
    hurt: ['IT WENT FOR MY EYE!', "I'M NOT DEAD YET, YOU GOTH PIGEON!", 'SHIT-EATING CROW!'],
    death: ['PICKED CLEAN BY CROWS', 'MURDERED BY A MURDER'],
  },
  'm2:town_rat': {
    hurt: ['RAT! UP MY PANT LEG!', 'IT BIT MY ANKLE! I NEED A SHOT!', "IT'S IN MY SOCK! IT'S EATING MY TOE JAM!"],
    death: ['GNAWED OFF AT THE ANKLES', 'RAT FOOD'],
  },
  'm2:town_cat': {
    hurt: ['MANGY BITCH CAT!', 'IT CROSSED MY PATH! THEN MY FACE!', 'FUCKING SATAN PUSSY!'],
    death: ['A BLACK CAT CROSSED HIM', 'SEVEN YEARS BAD LUCK AT ONCE'],
  },
  'm2:town_ghost': {
    hurt: ['I CAN SEE YOUR SNEAKERS, ASSHOLE!', 'BOO YOURSELF, CASPER!', 'THAT SHEET HAS CUM STAINS ON IT!'],
    death: ['SPOOKED BY A BEDSHEET', 'KILLED BY LAUNDRY'],
  },
  'm2:town_wolfman': {
    hurt: ['IT BIT ME! IN CHARACTER!', 'THAT SUIT SMELLS LIKE A WET DOG FART!', 'QUIT HUMPING MY LEG, YOU FURRY!'],
    death: ['MAULED BY A RENTAL FUR SUIT', "IT WASN'T EVEN A FULL MOON"],
  },
  'm2:town_monster': {
    hurt: ['BOTH FISTS! WHO DOES THAT?!', 'THOSE PLATFORM BOOTS ARE A WEAPON!', 'BIG FLATHEADED NECK-BOLT BITCH!'],
    death: ['FLATTENED BY PLATFORM BOOTS', 'STOMPED BY THE NIGHT SHIFT'],
  },
  'm2:town_witch': {
    hurt: ['THE BROOM IS FOR SWEEPING, YOU HAG!', 'GET DOWN HERE, YOU SINGLE CAT LADY!', 'WITCH SLAPPED!'],
    death: ['KNOCKED OFF BY A WITCH', 'SWEPT UNDER THE RUG'],
  },
  'm2:town_potion': {
    hurt: ["IT'S GREEN! WHY IS IT GREEN?!", "THAT'S JUST ANTIFREEZE!", "IT'S IN MY EYES! IT SMELLS LIKE MOUNTAIN DEW!"],
    death: ['MELTED BY A NOVELTY POTION', "DIDN'T DRINK IT. WORE IT."],
  },
  'm2:town_skeleton': {
    hurt: ['A FOAM TOMBSTONE! WHY DOES IT HURT?!', 'NICE ONESIE, BONES! DOES IT HAVE A BUTT FLAP?', 'QUIT HIDING BEHIND YOUR GRAVE, PUSSY!'],
    death: ['BEATEN WITH A FOAM TOMBSTONE', 'BONED BY A SKELETON'],
  },
  'm2:town_bone': {
    hurt: ['A PLASTIC FEMUR TO THE FACE!', 'THROW ME A BONE! NOT LIKE THAT!', 'A FEMUR UP MY NOSE!'],
    death: ['THROWN A BONE. IN THE HEAD.', 'BONED TO DEATH'],
  },
};

/** Bucked sky-high off the skeleton pony (once). */
export const PONY_LAUNCHED = ['BAD DEAD HORSE!', "A QUARTER'S WORTH OF RODEO!"];
/** Riding the ghost train over the moat (once). */
export const TRAIN_RIDE = ['ALL ABOARD. ONE TODDLER, EXTRA LARGE.', 'CHOO CHOO, MOTHERFUCKERS.'];
/** His first look at the pit the ghost train goes over (once). */
export const PIT_SEEN = [
  'A BOTTOMLESS PIT. ON A TODDLER RIDE. WHO DESIGNED THIS, SATAN?',
  'BOTTOMLESS PIT. NO, REALLY. OKAY. BABY TRAIN IT IS.',
];
/** Falling into it: the scream, going away down into the dark. */
export const FALL_SCREAM = ['AAAAAAAAAAAAAAAAAaaaaaaaaaaaa...', 'NOOOOOOOOOOOOOOOooooooooo...'];
/** The pumpkin-head at the top of the stairs, first seen rolling them (once). */
export const PUMPKINS_SEEN = ["THAT DICK IS BOWLING JACK-O'-LANTERNS AT ME."];

/** The rides themselves (and the stairs' pumpkins), when they hurt him. */
export const RIDE_HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:town_cups': {
    hurt: ['THE TEACUP COFFIN HIT ME!', 'WATCH WHERE YOU SPIN, ASSHOLE!', 'RUN OVER BY A KIDDIE RIDE!'],
    death: ['RUN DOWN BY A TEACUP', 'THE COFFIN GOT ITS GUY'],
  },
  'm2:town_carousel': {
    hurt: ['A FIBERGLASS BAT TO THE FACE!', 'THE MERRY-GO-ROUND SHOVED ME!', 'FUCK THIS HORSE! AND ITS FANGS!'],
    death: ['TRAMPLED BY A MERRY-GO-ROUND', 'ROUND AND ROUND. THEN DOWN.'],
  },
  'm2:town_train': {
    hurt: ['HIT BY A BABY TRAIN!', 'IT HAS A PACIFIER AND IT HIT ME!', 'TOOT TOOT MY ASS!'],
    death: ['HIT BY A TRAIN FOR TODDLERS', 'GHOST TRAIN. NEW GHOST.'],
  },
  'm2:town_drop': {
    hurt: ['SIX FEET OF DOOM ON MY HEAD!', 'WHY WAS I UNDER IT?! WHY AM I LIKE THIS?!', 'MY SKULL! MINI DOOM!'],
    death: ['CRUSHED BY A SIX FOOT DROP', 'DOOM, MINI'],
  },
  'm2:town_pony': {
    hurt: ['THE DEAD HORSE KICKED ME!', 'RIGHT IN THE NUTS! FROM A SKELETON!', 'THAT HORSE OWES ME A QUARTER!'],
    death: ['KICKED DEAD BY A DEAD HORSE', 'THE DEAD HORSE BEAT HIM'],
  },
  'm2:town_pumpkin': {
    hurt: ['A WHOLE DAMN PUMPKIN!', 'STRIKE! I AM THE PINS!', 'PUMPKIN SPICE! IN MY EYES!'],
    death: ['BOWLED OVER BY A PUMPKIN', 'SMASHED. HAPPY NOVEMBER.'],
  },
  'm2:town_pumpkinhead': {
    hurt: ["YOU CAN'T EVEN SEE OUT OF THAT THING!", 'GET YOUR GOURD OUT OF MY FACE!', 'YOUR HEAD SMELLS LIKE A WHOLE FOODS DUMPSTER!'],
    death: ['BEATEN BY A GOURD WITH LEGS', 'CARVED UP BY A PUMPKIN'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...ARRIVE, ...ELEVATOR_SEEN, ...ELEVATOR_AGAIN, ...STAIRS,
    ...Object.values(RIDE_LINES).flat(),
    ...PONY_LAUNCHED, ...TRAIN_RIDE, ...PUMPKINS_SEEN, ...PIT_SEEN, ...FALL_SCREAM,
    ...Object.values(HURT).flatMap(h => h.hurt),
    ...Object.values(RIDE_HURT).flatMap(h => h.hurt),
  ],
  death: [...Object.values(HURT).flatMap(h => h.death), ...Object.values(RIDE_HURT).flatMap(h => h.death)],
};
