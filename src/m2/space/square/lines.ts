// What's said in the square section, by voice (recorded with the rest: space/voices.ts gathers these; tools/voices). In
// the user's voice (space-spec.md); pick lines with pickLine; clean / shitty / naked pools where people react to him.
// The hurt and death lines for the outdoors' enemies and gear (the square's and the drag's: the same cast and the
// same gear) are here, registered against their sources in kinds.ts. (The staff are men and women both, by seed: no
// he or she for them.)

/** Clean, shat, naked: a pool for each (an NPC reacting to the state of him). */
export interface ByPants { clean: string[]; shitty: string[]; nude: string[] }

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Walking in under the gate (once, from the start). */
export const ARRIVE = [
  'FUTURELAND. THE FUTURE, AS DREAMED UP BY GUYS WHO SMOKED IN THE DELIVERY ROOM.',
  'THE WORLD OF TOMORROW. SMELLS LIKE CHURROS AND ASBESTOS.',
];
/** His first proper look at the giant atom, over the rooftops. */
export const ATOM_SEEN = [
  'A GIANT ATOM. NOBODY WHO BUILT THAT EVER GOT LAID.',
  "ONE BIG BALL, THREE HULA HOOPS. I'M GOING IN.",
];
/** The gags along the way, passing each (once each). */
export const GAG_LINES: Record<'mover' | 'zap' | 'pad' | 'wall' | 'mono' | 'pit' | 'queue', string[]> = {
  mover: [
    'A SIDEWALK THAT WALKS FOR YOU. THE FUTURE IS FAT.',
    "MOVING SIDEWALK. I'M STILL WALKING. WHAT AM I PAYING FOR?",
  ],
  zap: [
    'SAFE AS MILK, SAYS THE SIGN. MILK NEVER ZAPPED MY NUTS.',
    'THE FLOOR IS BUZZING. SO ARE MY BALLS.',
  ],
  pad: [
    'FEEL THE THRUST. DON\'T MIND IF I DO.',
    'A ROCKET UNDER A MANHOLE COVER. STAND ON IT? HELL YES.',
  ],
  wall: [
    'THE WALL OF TOMORROW. IT\'S A WALL. TOMORROW\'S GONNA SUCK.',
    'A WALL IN THE MIDDLE OF THE STREET. SOME ARCHITECT GOT PAID FOR THIS.',
  ],
  mono: [
    'EXPRESS. DOES NOT STOP. SO HOW THE HELL DO YOU GET ON?',
    'A MONORAIL THAT NEVER STOPS. JUST LIKE MY UNCLE AFTER THE DIVORCE.',
  ],
  pit: [
    "FUTURE SITE OF TOMORROW. COMING 1964. THEY'RE A LITTLE BEHIND.",
    'A HOLE WITH A SIGN ON IT. SIXTY YEARS. UNION JOB.',
  ],
  queue: [
    "NINETY MINUTES FROM THIS POINT. I DON'T WAIT NINETY MINUTES TO SHIT.",
    "NINETY MINUTES? I'M THE FAST PASS.",
  ],
};
/** Launched off a thrust pad, the first time. */
export const PAD_LAUNCHED = [
  'HOUSTON, WE HAVE A BONER!',
  'THAT WENT RIGHT UP MY SHORTS!',
];
/** Riding the monorail's roof (the first time). */
export const MONO_RIDE = [
  'TICKET? MY ASS IS THE TICKET.',
  'EXPRESS SERVICE. I SAT ON TOP. FIRST CLASS.',
];
/** Over the edge into the construction pit (once a fall). */
export const FALL_SCREAM = ['NOT TOMORROWWW!', 'SHIIIIT!'];

// ---------------------------------------------------------------------------------------------------------------
// Futureland's PA (a 1962 announcer, cheery and glad about everything, over the square's horn speakers)

export const PA_VOICE = 'm2.space.futurepa';
/** Him coming in under the gate. */
export const PA_WELCOME: ByPants = {
  clean: [
    'WELCOME TO FUTURELAND, WHERE IT IS ALWAYS TOMORROW! TOMORROW IS CLOSED FOR REFURBISHMENT.',
    'GOOD DAY, CITIZEN OF TOMORROW! SMOKING IS PERMITTED IN ALL AREAS, INCLUDING THE NURSERY.',
  ],
  shitty: [
    'ATTENTION, GUEST IN THE BROWN TROUSERS. THE FUTURE HAS TOILETS. USE THEM.',
    'WELCOME, CITIZEN! IN THE FUTURE, PANTS CLEAN THEMSELVES. YOURS ARE NOT FROM THE FUTURE.',
  ],
  nude: [
    'ATTENTION! A NUDE MAN IS LOOSE IN FUTURELAND. IN THE FUTURE, THAT IS STILL A CRIME.',
    'WELCOME, CITIZEN! IN THE FUTURE, GENITALS ARE KEPT IN A SILVER POUCH.',
  ],
};
/** The people mover, as he gets to it (the same for anybody). */
export const PA_MOVER = ['THE PEOPLE MOVER! WALKING IS FOR COMMUNISTS.'];
/** Once he's killed a few of the cast. */
export const PA_SECURITY: ByPants = {
  clean: [
    'SECURITY TO THE SQUARE. A GUEST IS MURDERING THE CAST. AGAIN.',
    'SECURITY TO THE SQUARE. BIG GUY. NO NECK. HE BROKE A SPACE CADET IN HALF.',
  ],
  shitty: [
    'SECURITY TO THE SQUARE. FOLLOW THE SMELL.',
    "SECURITY TO THE SQUARE. HE SHIT HIMSELF AND HE'S WINNING.",
  ],
  nude: [
    'SECURITY TO THE SQUARE. HE IS NAKED. AIM LOW.',
    'SECURITY, NAKED MAN IN THE SQUARE. DO NOT TASE THE DANGLY PART.',
  ],
};
/** At the monorail station. */
export const PA_MONO = ['THE MONORAIL OF TOMORROW IS EXPRESS ONLY. IT HAS NEVER STOPPED. IT CANNOT STOP.'];
/** At the atom's doors. */
export const PA_ATOM: ByPants = {
  clean: [
    'THE GIANT ATOM WELCOMES YOU! NINETY MINUTE WAIT. SIR. SIR!',
    'NOW ENTERING THE GIANT ATOM! PLEASE DO NOT SPLIT IT.',
  ],
  shitty: [
    'SIR, THE GIANT ATOM IS A CLOSED SYSTEM. WHATEVER YOU BRING IN, WE ALL BREATHE.',
    'THE GIANT ATOM IS NOT A RESTROOM, SIR. NO MATTER WHAT YOU HAVE HEARD.',
  ],
  nude: [
    'SIR, THE GIANT ATOM HAS A DRESS CODE. IT IS PANTS.',
    'NOW ENTERING THE GIANT ATOM: ONE NUDE MAN. GOD HELP THE NEUTRONS.',
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// Park security, barking as they gun the scooter at him (rare: one in three). Men's and women's voices, the same lines.

export const GUARD_VOICES = { m: 'm2.space.guard', f: 'm2.space.guardf' } as const;
export const GUARD_BARK: ByPants = {
  clean: ['SIR! NO RUNNING IN THE FUTURE!', 'HALT! I HAVE A SCOOTER AND A GED!'],
  shitty: ['CODE BROWN! CODE BROWN!', "HE'S LEAKING! DON'T LET HIM SIT ON ANYTHING!"],
  nude: ['CODE NUDE! I REPEAT, CODE NUDE!', 'SIR! PUT YOUR WIENER AWAY!'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him out here (by source: an enemy's kind, what it fires or throws, the gear), and the death screen

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:space_cadet': {
    hurt: ["I'LL SHOVE THAT FISHBOWL UP YOUR ASS!", 'GET YOUR FISHBOWL OFF ME!', "I'LL GIVE YOU A SWIRLY IN THAT FISHBOWL!"],
    death: ['BEATEN UP BY A SPACE CADET', 'KILLED BY A FISHBOWL HEAD'],
  },
  'm2:space_cadet_shot': {
    hurt: ['A TOY GUN! A TOY GUN SHOT ME!', 'PEW PEW, MY ASS! THAT HURT!', 'WHAT DO THEY PUT IN THESE THINGS?!'],
    death: ['SHOT DEAD WITH A TOY', 'PEW PEW'],
  },
  'm2:space_robot': {
    hurt: ['BEEP BOOP, MOTHERFUCKER!', 'I GOT BEAT UP BY RECYCLING!', 'OW! YOUR ARMS ARE DRYER HOSE!'],
    death: ['DESTROYED BY A CARDBOARD BOX', 'DOES NOT COMPUTE'],
  },
  'm2:space_robot_antenna': {
    hurt: ['ZAPPED MY TAINT!', 'THE ANTENNA! IT GOT MY BALLS!', "WHO WIRED A ROBOT'S DICK TO THE GRID?!"],
    death: ['SAT ON A ROBOT\'S ANTENNA', 'FRIED FROM THE TAINT UP'],
  },
  'm2:space_guard': {
    hurt: ['A MALL COP RAN ME OVER! A MALL COP!', 'GET OFF YOUR SEGWAY AND FIGHT ME!', 'THAT THING DOES NOT HOVER!'],
    death: ['RUN OVER BY A MALL COP', 'FLATTENED BY A SEGWAY'],
  },
  'm2:space_guard_baton': {
    hurt: ['STUN STICK! RIGHT IN THE TITS!', 'OW! MY NIPPLES ARE ON FIRE!', 'DON\'T TASE ME, BRO! I MEAN IT!'],
    death: ['CHARGED INTO A STUN BATON', 'TASED, BRO'],
  },
  'm2:space_jetpack': {
    hurt: ['JETPACK IN MY FACE!', 'HE FARTED FIRE ON ME!', 'GET DOWN HERE, ROCKET BOY!'],
    death: ['BURNED UP BY A JETPACK', 'ROCKETEERED'],
  },
  'm2:space_icecream': {
    hurt: ['ASTRONAUT ICE CREAM! IT\'S A BRICK!', 'FREEZE-DRIED RIGHT IN THE TEETH!', 'THAT AIN\'T ICE CREAM! THAT\'S A ROCK!'],
    death: ['STONED WITH SPACE ICE CREAM', 'FREEZE-DRIED'],
  },
  'm2:space_rover': {
    hurt: ['THE ROBOT DOG BIT ME!', "BAD DOG! I'LL PULL YOUR BATTERIES!", 'IT HUMPED MY ANKLE!'],
    death: ['MAULED BY A ROBOT DOG', 'GOOD BOY'],
  },
  'm2:space_zap': {
    hurt: ['THE SIDEWALK BIT ME!', 'MY FILLINGS! MY FILLINGS!', 'SAFE AS MILK MY ASS!'],
    death: ['ELECTROCUTED BY THE SIDEWALK', 'SAFE AS MILK'],
  },
  'm2:space_monorail': {
    hurt: ['HIT BY A TRAIN!', "IT DIDN'T EVEN HONK!", 'EXPRESS! OW! EXPRESS!'],
    death: ['HIT BY A MONORAIL', 'THE EXPRESS DOES NOT STOP'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...ARRIVE, ...ATOM_SEEN, ...Object.values(GAG_LINES).flat(), ...PAD_LAUNCHED, ...MONO_RIDE, ...FALL_SCREAM,
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [PA_VOICE]: [
    ...Object.values(PA_WELCOME).flat(), ...PA_MOVER, ...Object.values(PA_SECURITY).flat(), ...PA_MONO, ...Object.values(PA_ATOM).flat(),
  ],
  [GUARD_VOICES.m]: Object.values(GUARD_BARK).flat(),
  [GUARD_VOICES.f]: Object.values(GUARD_BARK).flat(),
};
