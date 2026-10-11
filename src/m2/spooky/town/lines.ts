// What's said in the town, by voice (recorded with the rest: spooky/voices.ts gathers these; tools/voices). Only
// Meathead talks here (the costumed staff just come at him), so nothing in here needs clean / shitty / naked pools.
// The hurt and death lines are registered against their sources in kinds.ts, from these same lists. (The staff under
// the costumes are men and women both, by seed: no he or she for them.)

/** Walking into the town square (once, from the start). */
export const ARRIVE = [
  'SPOOKY TOWN. THERE IS AN ATM IN THE CRYPT. VERY HAUNTED.',
  'FREE WI-FI ON THE GAS LAMPS. JACK THE RIPPER COULD CHECK HIS EMAIL.',
];
/** His first look at the ELEVATOR TO HELL's clock tower, way off in the back. */
export const ELEVATOR_SEEN = [
  'ELEVATOR TO HELL. OH, I AM RIDING THAT.',
  "ELEVATOR TO HELL. THAT'S MY RIDE. EVERYTHING ELSE CAN SUCK IT.",
];
/** Still on his mind, on the castle stairs (the tower's over past it). */
export const ELEVATOR_AGAIN = [
  "HOLD MY SEAT, ELEVATOR. DADDY'S COMING.",
  'ONE CASTLE BETWEEN ME AND HELL. EASY.',
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
    'MUST BE THIS SHORT. FINALLY, A RIDE THAT HATES ME FIRST.',
  ],
  carousel: [
    'YOU GLUED FANGS ON A HORSE. THAT IS STILL A HORSE, DUMBASS.',
    "THE ORGAN MUSIC'S DOING ALL THE WORK. IT'S A MERRY-GO-ROUND, YOU HACKS.",
  ],
  train: [
    'A GHOST TRAIN WITH A PACIFIER. THE GHOST IS A BABY. WHO KILLED A BABY?',
    'OOOH, A CHOO-CHOO. SOMEBODY CALL A PRIEST.',
  ],
  drop: [
    "MINI DROP OF DOOM. SIX FEET. I'VE FALLEN OFF TALLER BARSTOOLS.",
    'THE SIGN IS TALLER THAN THE RIDE.',
  ],
  pony: [
    "A SKELETON PONY. THEY'RE STILL BEATING A DEAD HORSE FOR QUARTERS.",
    "THAT'S THE HORSE OUTSIDE A GROCERY STORE IN A HALLOWEEN COSTUME.",
  ],
};

/** What hurts him in the town (by source: an enemy's kind, or what it throws), and the death screen when it kills him. */
export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:town_bat': {
    hurt: ['BAT IN MY HAIR!', 'IT BIT MY NECK! DO I GET POWERS NOW?!', 'GET OFF, YOU FLYING RAT!'],
    death: ['DRAINED BY A BAT THE SIZE OF A SANDWICH', 'OF COURSE THERE WERE BATS'],
  },
  'm2:town_crow': {
    hurt: ['IT WENT FOR MY EYE!', "I'M NOT DEAD YET, YOU GOTH PIGEON!", 'SHITTY BIRD!'],
    death: ['PICKED CLEAN BY CROWS', 'MURDERED BY A MURDER'],
  },
  'm2:town_rat': {
    hurt: ['RAT! UP MY PANT LEG!', 'IT BIT MY ANKLE! I NEED A SHOT!', 'GET OUT OF MY SOCK!'],
    death: ['GNAWED TO DEATH AT THE ANKLES', 'RAT FOOD'],
  },
  'm2:town_cat': {
    hurt: ['MANGY BITCH CAT!', 'IT CROSSED MY PATH! THEN MY FACE!', 'BAD KITTY!'],
    death: ['A BLACK CAT CROSSED HIS THROAT', 'SEVEN YEARS BAD LUCK, ALL AT ONCE'],
  },
  'm2:town_ghost': {
    hurt: ['I CAN SEE YOUR SNEAKERS, ASSHOLE!', 'BOO YOURSELF!', 'KILLED BY A BEDSHEET? NO!'],
    death: ['SPOOKED BY A BEDSHEET', 'KILLED BY LAUNDRY'],
  },
  'm2:town_wolfman': {
    hurt: ['IT BIT ME! IN CHARACTER!', 'THAT SUIT SMELLS LIKE A WET DOG FART!', 'DOWN, BOY! DOWN!'],
    death: ['MAULED BY A RENTAL FUR SUIT', "IT WASN'T EVEN A FULL MOON"],
  },
  'm2:town_monster': {
    hurt: ['BOTH FISTS! WHO DOES THAT?!', 'THOSE PLATFORM BOOTS ARE A WEAPON!', 'BIG FLATHEADED SON OF A BITCH!'],
    death: ['FLATTENED BY PLATFORM BOOTS', 'STOMPED BY THE NIGHT-SHIFT MONSTER'],
  },
  'm2:town_witch': {
    hurt: ['THE BROOM IS FOR SWEEPING, YOU HAG!', 'GET DOWN HERE, CAT LADY!', 'WITCH SLAPPED!'],
    death: ['KNOCKED OFF BY A WITCH ON A BROOM', 'SWEPT UNDER THE RUG'],
  },
  'm2:town_potion': {
    hurt: ["IT'S GREEN! WHY IS IT GREEN?!", "THAT'S JUST ANTIFREEZE!", 'MY EYEBROWS!'],
    death: ['DISSOLVED IN A NOVELTY POTION', 'NOT FOR DRINKING. HE WORE IT.'],
  },
  'm2:town_skeleton': {
    hurt: ['A FOAM TOMBSTONE! WHY DOES IT HURT?!', 'NICE ONESIE, BONES!', 'QUIT HIDING BEHIND YOUR GRAVE, PUSSY!'],
    death: ['BEATEN WITH A FOAM TOMBSTONE', 'BONED BY A SKELETON'],
  },
  'm2:town_bone': {
    hurt: ['A PLASTIC FEMUR TO THE FACE!', 'THROW ME A BONE! NOT LIKE THAT!', 'BONED IN THE HEAD!'],
    death: ['THROWN A BONE. IN THE TEMPLE.', 'BONED TO DEATH'],
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
    hurt: ['THE TEACUP COFFIN HIT ME!', 'WATCH WHERE YOU SPIN!', 'RUN OVER BY A KIDDIE RIDE!'],
    death: ['RUN DOWN BY A SPINNING TEACUP', 'THE COFFIN FINALLY GOT ITS GUY'],
  },
  'm2:town_carousel': {
    hurt: ['A FIBERGLASS BAT TO THE FACE!', 'THE MERRY-GO-ROUND SHOVED ME!', 'FUCK THIS HORSE!'],
    death: ['TRAMPLED BY A MERRY-GO-ROUND', 'WENT ROUND AND ROUND. THEN DOWN.'],
  },
  'm2:town_train': {
    hurt: ['HIT BY A BABY TRAIN!', 'IT HAS A PACIFIER AND IT HIT ME!', 'TOOT TOOT MY ASS!'],
    death: ['HIT BY A TRAIN FOR TODDLERS', 'THE GHOST TRAIN GOT ITS GHOST'],
  },
  'm2:town_drop': {
    hurt: ['SIX FEET OF DOOM ON MY HEAD!', 'WHY WAS I UNDER IT?!', 'MY SKULL! MINI DOOM!'],
    death: ['CRUSHED BY A SIX FOOT DROP', 'DOOM, MINI'],
  },
  'm2:town_pony': {
    hurt: ['THE DEAD HORSE KICKED ME!', 'RIGHT IN THE NUTS! FROM A SKELETON!', 'I WANT MY QUARTER BACK!'],
    death: ['KICKED TO DEATH BY A DEAD HORSE', 'BEAT A DEAD HORSE. IT BEAT HIM BACK.'],
  },
  'm2:town_pumpkin': {
    hurt: ['A WHOLE DAMN PUMPKIN!', 'STRIKE! I AM THE PINS!', 'PIE FILLING! IN MY EYES!'],
    death: ["BOWLED OVER BY A JACK-O'-LANTERN", 'SMASHED LIKE A PUMPKIN ON NOVEMBER FIRST'],
  },
  'm2:town_pumpkinhead': {
    hurt: ["YOU CAN'T EVEN SEE OUT OF THAT THING!", 'GET YOUR GOURD OUT OF MY FACE!', 'YOUR HEAD SMELLS LIKE A COMPOST BIN!'],
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
