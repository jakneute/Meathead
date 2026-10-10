// What's said in the town, by voice (recorded with the rest: spooky/voices.ts gathers these; tools/voices). Only
// Meathead talks here (the costumed staff just come at him), so nothing in here needs clean / shitty / naked pools.
// The hurt and death lines are registered against their sources in kinds.ts, from these same lists.

/** Walking into the town square (once, from the start). */
export const ARRIVE = [
  'A SPOOKY VICTORIAN TOWN. WITH AN ATM IN THE CRYPT. VERY AUTHENTIC.',
  "GAS LAMPS, GRAVESTONES, FREE WI-FI. JACK THE RIPPER WOULD'VE LOVED THE WI-FI.",
];
/** His first look at the ELEVATOR TO HELL's clock tower, way off in the back. */
export const ELEVATOR_SEEN = [
  'ELEVATOR TO HELL. NOW THAT IS A RIDE. I AM RIDING THAT.',
  "SEE THAT CLOCK TOWER? ELEVATOR TO HELL. THAT'S THE ONE. THAT'S MY RIDE.",
];
/** Still on his mind, at the foot of the castle stairs (the tower's over past it). */
export const ELEVATOR_AGAIN = [
  "THE ELEVATOR'S STILL BACK THERE. I'M COMING FOR YOU, ELEVATOR.",
  "ONE CASTLE BETWEEN ME AND THE ELEVATOR TO HELL. I'VE GONE THROUGH WORSE FOR LESS.",
];
/** At the stairs, reading the sign. */
export const STAIRS = [
  "DRACULA'S OTHER CASTLE. WHERE'S HIS FIRST ONE? WHO GOT THAT ONE IN THE DIVORCE?",
  "DRACULA'S OTHER CASTLE. THAT'S A LOT OF STAIRS FOR A GUY WHO CAN TURN INTO A BAT.",
];

/** The haunted kiddie rides, mocked in passing (once each: one of these picked). */
export const RIDE_LINES: Record<'cups' | 'carousel' | 'train' | 'drop' | 'pony', string[]> = {
  cups: [
    "SPINNING COFFIN CUPS. THE SCARIEST THING HERE IS WHOEVER'S CLEANING THE PUKE OUT OF THOSE.",
    "COFFINS THAT SPIN. AT TWO MILES AN HOUR. TERRIFYING. I'M SHAKING.",
    'A TEACUP RIDE IN A CAPE IS STILL A TEACUP RIDE.',
  ],
  carousel: [
    'A BAT CAROUSEL. THE BATS GO ROUND. THE KIDS GO ROUND. NOBODY GOES TO HELL.',
    "YOU CAN'T MAKE A MERRY-GO-ROUND SCARY BY GLUING FANGS ON THE HORSES. THOSE ARE HORSES.",
    "THE ORGAN MUSIC'S DOING ALL THE WORK ON THAT ONE.",
  ],
  train: [
    'A GHOST TRAIN FOR TODDLERS. THE GHOST HAS A PACIFIER. THE GHOST IS A BABY.',
    "THAT TRAIN'S GOING SLOWER THAN I WALK. AND I WALK LIKE I'M CARRYING A FRIDGE.",
    'OOOH, SPOOKY. A CHOO-CHOO. SOMEBODY CALL A PRIEST.',
  ],
  drop: [
    "MINI DROP OF DOOM. SIX FEET. I'VE FALLEN FURTHER OFF A BARSTOOL.",
    "THAT'S NOT A DROP TOWER, THAT'S A TALL CHAIR WITH ANXIETY.",
    'DOOM. SIX FEET OF DOOM. THE SIGN IS TALLER THAN THE RIDE.',
  ],
  pony: [
    "A SKELETON PONY. TWENTY-FIVE CENTS. IT'S A DEAD HORSE AND THEY'RE STILL BEATING IT.",
    "THAT'S A COIN RIDE OUTSIDE A GROCERY STORE WITH A HALLOWEEN COSTUME ON.",
    'GIDDY UP, BONES. ACTUALLY NO. YOU STAY.',
  ],
};

/** What hurts him in the town (by source: an enemy's kind, or what it throws), and the death screen when it kills him. */
export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:town_bat': {
    hurt: ['BAT! BAT IN MY HAIR!', 'IT BIT MY NECK! DO I GET POWERS NOW?!', "GET OFF! I'M NOT A FRUIT!"],
    death: ['DRAINED BY A BAT THE SIZE OF A SANDWICH', 'THE BATS GOT HIM. OF COURSE THERE WERE BATS.'],
  },
  'm2:town_crow': {
    hurt: ['THE CROW WENT FOR MY EYE!', "I'M NOT DEAD YET, YOU VULTURE WANNABE!", 'STUPID GOTH PIGEON!'],
    death: ['PICKED CLEAN BY CROWS. THEY WERE PATIENT.', 'A MURDER OF CROWS. HE WAS THE MURDER.'],
  },
  'm2:town_rat': {
    hurt: ['RAT! UP MY PANT LEG!', 'IT BIT MY ANKLE! I NEED A SHOT NOW!', "THAT RAT'S BIGGER THAN THE ONES AT HOME!"],
    death: ['GNAWED TO DEATH AT THE ANKLES', 'THE RATS HAD HIM FOR LUNCH. AND DINNER.'],
  },
  'm2:town_cat': {
    hurt: ['THE CAT! THE MANGY CAT!', "IT CROSSED MY PATH AND THEN IT CROSSED MY FACE!", 'BAD LUCK! BAD KITTY! BAD EVERYTHING!'],
    death: ['A BLACK CAT CROSSED HIS PATH. THEN HIS THROAT.', 'SEVEN YEARS BAD LUCK, ALL AT ONCE'],
  },
  'm2:town_ghost': {
    hurt: ["THE BEDSHEET GUY HIT ME! IT'S A GUY IN A SHEET!", 'BOO YOURSELF!', 'I CAN SEE YOUR SNEAKERS, BUDDY!'],
    death: ['SPOOKED BY A GUY IN A BEDSHEET', 'KILLED BY LAUNDRY'],
  },
  'm2:town_wolfman': {
    hurt: ['HE BIT ME! HE BIT ME IN CHARACTER!', "THAT FUR SUIT SMELLS LIKE A WET DOG'S FUNERAL!", 'DOWN, BOY! DOWN!'],
    death: ['MAULED BY A RENTAL FUR SUIT', 'THE WOLFMAN GOT HIM. IT WASN\'T EVEN A FULL MOON.'],
  },
  'm2:town_monster': {
    hurt: ['HE HIT ME WITH BOTH FISTS! WHO DOES THAT?!', 'THOSE PLATFORM BOOTS ARE A WEAPON!', 'BIG FLATHEADED SON OF A BITCH!'],
    death: ['FLATTENED BY A GUY IN PLATFORM BOOTS', 'STOMPED FLAT BY THE NIGHT-SHIFT MONSTER'],
  },
  'm2:town_witch': {
    hurt: ['THE WITCH! THE BROOM WITCH!', 'SHE HIT ME WITH THE BROOM! THE BROOM IS FOR SWEEPING!', 'GET DOWN HERE, YOU FLYING CAT LADY!'],
    death: ['KNOCKED OFF BY A WITCH ON A BROOM', 'SWEPT UNDER THE RUG'],
  },
  'm2:town_potion': {
    hurt: ["IT'S GREEN! IT BURNS! WHY IS IT GREEN?!", 'THAT POTION IS JUST ANTIFREEZE!', 'MY EYEBROWS! SHE MELTED MY EYEBROWS!'],
    death: ['DISSOLVED IN A NOVELTY POTION', 'THE LABEL SAID NOT FOR DRINKING. HE WORE IT.'],
  },
  'm2:town_skeleton': {
    hurt: ['THE SKELETON BASHED ME WITH HIS TOMBSTONE!', 'NICE ONESIE, BONES!', 'THAT SHIELD IS FOAM! WHY DOES IT HURT?!'],
    death: ['BEATEN WITH A FOAM TOMBSTONE', 'BONED BY A SKELETON'],
  },
  'm2:town_bone': {
    hurt: ['HE THREW A BONE AT ME!', 'A PLASTIC FEMUR TO THE FACE!', "THROW ME A BONE! NOT LIKE THAT!"],
    death: ['THROWN A BONE. IN THE TEMPLE.', 'BONED TO DEATH'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...ARRIVE, ...ELEVATOR_SEEN, ...ELEVATOR_AGAIN, ...STAIRS,
    ...Object.values(RIDE_LINES).flat(),
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
};
