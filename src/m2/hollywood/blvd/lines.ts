// What's said on the boulevard, by voice (recorded with the rest: hollywood/voices.ts gathers these; tools/voices). In
// the user's voice (hollywood-spec.md); pick lines with pickLine; clean / shitty / naked pools where people react to
// him. The hustlers' hurt and death lines are here too (registered in kinds.ts), and the stunt wires' first words
// (wires.ts: every section's wires use them).

/** Clean, shat, naked: a pool for each (an NPC reacting to the state of him). */
export interface ByPants { clean: string[]; shitty: string[]; nude: string[] }

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Walking in (once, from the start). */
export const ARRIVE = [
  'HOLLYWOOD. WHERE DREAMS COME TO GET A TETANUS SHOT.',
  "HAPPYWOOD BOULEVARD. SMELLS LIKE PISS AND BROKEN DREAMS. MY KIND OF PLACE.",
];
/** The gags along the way, passing each (once each). */
export const GAG_LINES: Record<'stars' | 'plaque' | 'palace' | 'sinkhole' | 'scaffold' | 'tram' | 'marquee' | 'steve', string[]> = {
  stars: [
    "A STAR FOR THE GUY WHO SAID CUT ONCE. I KILLED A DINOSAUR. WHERE'S MINE?",
    'A STAR FOR A DOG\'S UNDERSTUDY. I\'M GONNA SHIT ON IT.',
  ],
  plaque: [
    'AS SEEN IN. IT\'S A BENCH. THEY ROPED OFF A BENCH.',
    "A VELVET ROPE AROUND A FIRE HYDRANT. A DOG PISSED ON IT. NOW IT'S HISTORIC.",
  ],
  palace: [
    'HANDPRINTS OF NOBODIES. I\'LL LEAVE MY ASS PRINT.',
    "THE WHOLE THEATER'S PLYWOOD AND SANDBAGS. JUST LIKE MY UNCLE'S HOUSE.",
  ],
  sinkhole: [
    'THE SIDEWALK FELL IN. THEY PUT A STAR ON THE EDGE OF IT.',
    'A SINKHOLE. RIGHT THROUGH THE WALK OF FAME. FINALLY SOMETHING HONEST.',
  ],
  scaffold: [
    'SCAFFOLDING. LAST INSPECTED BY A GUY NAMED DUKE IN 1986.',
    'THE BACK OF A FAKE BUILDING. MORE HONEST THAN THE FRONT.',
  ],
  tram: [
    'A TOUR TRAM. FULL OF PEOPLE FROM OHIO TAKING PICTURES OF A CURB.',
    'HERE COMES THE TRAM. THOSE PEOPLE PAID TO SEE THIS STREET. SUCKERS.',
  ],
  marquee: [
    'THRONES OF THE STARS. A ROLLER COASTER. THE LINE CAN KISS MY ASS.',
    "THAT COASTER'S GOT MORE LOOPS THAN MY COLON. I'M GETTING ON IT.",
  ],
  steve: [
    'STUNTMAN STEVE. WHO THE HELL IS STUNTMAN STEVE?',
    'STUNTMAN STEVE AGAIN. I ALREADY HATE THAT FACE.',
  ],
};
/** First time on a stunt wire (any section's: wires.ts). */
export const FIRST_WIRE = [
  "I'M FLYING! WHERE'S MY FUCKING OSCAR?!",
  'THIS HARNESS IS RIDING UP MY ASS! KEEP GOING!',
];
/** Now and then, riding one again. */
export const WIRE_WHOOP = ['WHEEE, MOTHERFUCKER!', 'HOLD ON, BALLS!', 'NO STUNT DOUBLE!'];
/** Pickpocketed by a hustler (once in a while). */
export const PICKPOCKETED = [
  'HEY! THAT\'S MY AMMO!',
  'SHE TOOK MY AMMO! GET BACK HERE!',
  'MY POCKETS! YOU THIEVING DRAMA MAJOR!',
];
/** Killed the one who robbed him: it's back. */
export const GOT_IT_BACK = ['MINE.', "THAT'S WHAT YOU GET, YOU COSTUMED BUM."];
/** Over the edge into the sinkhole (once a fall). */
export const FALL_SCREAM = ['NOT LIKE THIIIS!', 'SHIIIIT!'];

// ---------------------------------------------------------------------------------------------------------------
// The impersonators. Each wants a photo and twenty bucks; their hustle (and their reaction to the state of him) by
// pants. Their voices: each kind's own (men's and women's both where the suit fits either).

export const HUSTLER_VOICES = {
  marilyn: 'm2.hollywood.marilyn',
  elvis: 'm2.hollywood.elvis',
  hero: 'm2.hollywood.hero', herof: 'm2.hollywood.herof',
  pirate: 'm2.hollywood.pirate', piratef: 'm2.hollywood.piratef',
  statue: 'm2.hollywood.statue', statuef: 'm2.hollywood.statuef',
} as const;

export const MARILYN_HUSTLE: ByPants = {
  clean: ['PHOTO, BIG BOY? TWENTY BUCKS.', 'HAPPY BIRTHDAY, MISTER PRESIDENT... CASH ONLY.'],
  shitty: ['PHOTO? FORTY. YOU SMELL LIKE A NURSING HOME.', 'HONEY, YOUR PANTS ARE BROWN IN THE BACK.'],
  nude: ['NAKED PHOTO? THAT\'S EXTRA, SUGAR.', 'OH MY. IS THAT IT, HONEY? STILL TWENTY.'],
};
export const ELVIS_HUSTLE: ByPants = {
  clean: ['THANK YOU. THANK YOU VERY MUCH. TWENTY BUCKS.', 'THE KING TAKES VENMO, MAN.'],
  shitty: ['THE KING DIED ON THE TOILET, MAN. YOU DIDN\'T EVEN MAKE IT THAT FAR.', "YOU'RE ALL SHOOK UP, MAN. AND SO ARE YOUR PANTS."],
  nude: ['ELVIS HAS SEEN YOUR DICK, MAN.', 'HUNKA HUNKA SHRIVELED LOVE, MAN.'],
};
export const HERO_HUSTLE: ByPants = {
  clean: ['CITIZEN! PHOTO WITH A HERO! TWENTY BUCKS!', "JUSTICE ISN'T FREE. IT'S TWENTY. PLUS TAX."],
  shitty: ['CITIZEN! YOU HAVE SOILED YOURSELF! STILL TWENTY!', "MY SPIDEY SENSE IS TINGLING. NO. THAT'S YOUR ASS."],
  nude: ['CITIZEN! YOUR SECRET IDENTITY IS TINY!', 'NAKED VILLAIN ON THE BOULEVARD! PHOTO\'S STILL TWENTY!'],
};
export const PIRATE_HUSTLE: ByPants = {
  clean: ['PHOTO WITH THE CAPTAIN, MATE? TWENTY DOUBLOONS. DOLLARS.', 'SAVVY? TWENTY BUCKS OR I KEELHAUL YOUR MOTHER.'],
  shitty: ['SOMETHING\'S DIED IN YOUR BREECHES, MATE.', 'YOU SHAT THE POOP DECK, SAVVY?'],
  nude: ['WHERE\'S YOUR TROUSERS, MATE? THE KRAKEN TAKE \'EM?', 'ARR. THAT BE THE SMALLEST PLANK I EVER SEEN.'],
};
export const STATUE_HUSTLE: ByPants = {
  clean: ['PSST. TIP THE STATUE.', "PSST. I'VE BEEN STANDING HERE NINE HOURS. I PISSED IN MY PAINT."],
  shitty: ['PSST. I CAN\'T MOVE AND I CAN STILL SMELL YOU.', "PSST. I'M PAINTED GOLD. YOU'RE PAINTED BROWN."],
  nude: ['PSST. I\'M GOLD AND I\'M STILL LESS NAKED THAN YOU.', "PSST. I CAN'T MOVE MY EYES. THANKS A LOT."],
};
/** Him robbed by one, as they leg it (whoever it is: the pool for their kind's voice). */
export const THIEF_GLOAT: ByPants = {
  clean: ['TIPS ARE APPRECIATED!', 'THIS IS GOING STRAIGHT UP MY NOSE!'],
  shitty: ['I\'M WASHING THIS IN BLEACH!', 'EVEN YOUR AMMO SMELLS LIKE SHIT!'],
  nude: ["WHERE WAS THAT?! DON'T TELL ME!", 'IT WAS WARM! WHY WAS IT WARM?!'],
};

// ---------------------------------------------------------------------------------------------------------------
// The boulevard's PA (Happywood's announcer: a smooth movie-trailer voice, over the lamppost speakers). Stuntman
// Steve's plugs are his.

export const PA_VOICE = 'm2.hollywood.pa';
export const PA_WELCOME: ByPants = {
  clean: [
    'IN A WORLD... WHERE EVERYONE\'S A STAR... WELCOME TO HAPPYWOOD BOULEVARD.',
    "WELCOME TO HAPPYWOOD BOULEVARD. TIP YOUR IMPERSONATORS. THEIR AGENTS DON'T CALL.",
  ],
  shitty: [
    'IN A WORLD... WHERE ONE MAN... SHIT HIS PANTS... RATED R.',
    'WELCOME TO HAPPYWOOD BOULEVARD. THE RESTROOMS ARE BEHIND THE THEATER. TOO LATE, HUH?',
  ],
  nude: [
    'IN A WORLD... WHERE ONE MAN... WEARS NO PANTS... NOT YET RATED.',
    'WELCOME TO HAPPYWOOD BOULEVARD. SIR, THE CASTING COUCH IS INDOORS.',
  ],
};
/** Stuntman Steve's plugs (a few along the way: once each). */
export const PA_STEVE = [
  'STUNTMAN STEVE ASKS GUESTS TO STOP CLAPPING FOR THE IMPERSONATORS. IT UPSETS HIM. SHOWS HOURLY!',
  'STUNTMAN STEVE! HE WAS IN A FILM! YOU CAN SEE HIS ELBOW FOR TWO FRAMES! SHOWS HOURLY!',
  'STUNTMAN STEVE! WATCH HIM STEP OUT OF THE WAY OF A SLOW CAR! LIVE! PARKING NOT VALIDATED!',
];
/** Once he's done in a few of the impersonators. */
export const PA_SECURITY: ByPants = {
  clean: [
    'ATTENTION. A GUEST IS MURDERING THE IMPERSONATORS. THAT IS NOT A STREET SHOW.',
    'ATTENTION. PLEASE DO NOT KILL THE KING. THE KING HAS DIED ENOUGH.',
  ],
  shitty: [
    'ATTENTION. A GUEST IN LOADED PANTS IS KILLING THE TALENT. YOU WILL SMELL HIM FIRST.',
    'COMING THIS SUMMER... THE SHITTER... HE\'S KILLING ELVIS.',
  ],
  nude: [
    'ATTENTION. A NUDE MAN IS KILLING THE IMPERSONATORS. HE IS NOT ANYBODY FAMOUS.',
    'COMING THIS SUMMER... THE NAKED MAN... HE HAS NO PANTS... AND NO MERCY.',
  ],
};
/** The tour tram's horn, coming (the driver over its speaker, as it rolls). */
export const TRAM_VOICE = 'm2.hollywood.tram';
export const TRAM_CALL = [
  'TRAM COMING THROUGH! WE DO NOT STOP!',
  'ON YOUR LEFT, A BUM! HE WAS IN THE GOONIES! WE ARE NOT STOPPING!',
  'MOVE IT, PAL! THIS TOUR IS NINETY MINUTES AND WE\'RE LATE!',
];
/** At the coaster's queue plaza. */
export const PA_COASTER: ByPants = {
  clean: [
    'THRONES OF THE STARS! SIT WHERE THE STARS SAT! THE WAIT IS FOUR HOURS!',
    'NOW BOARDING: THRONES OF THE STARS! THE LINE STARTS WAY BACK THERE, SIR. SIR?',
  ],
  shitty: [
    'SIR, THRONES OF THE STARS IS A RIDE. IT IS NOT A TOILET. YET.',
    'SIR. YOU ALREADY WENT. ALL OVER THE PLAZA.',
  ],
  nude: [
    'SIR, PANTS ARE REQUIRED ON THRONES OF THE STARS. THE SEATS ARE PORCELAIN. AND COLD.',
    'COMING SOON... A NAKED MAN ON A ROLLER COASTER... GOD HELP US.',
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him on the boulevard (by source), and the death screen

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:hw_marilyn': {
    hurt: ['SHE SLAPPED ME! WITH HER PURSE!', 'OW! GET YOUR HEELS OFF MY FOOT!', "MARILYN'S GOT A ROLL OF QUARTERS IN THAT PURSE!"],
    death: ['BEATEN TO DEATH BY MARILYN', 'SOME LIKE IT DEAD'],
  },
  'm2:hw_marilyn_gust': {
    hurt: ['HER DRESS! IT\'S A HURRICANE!', 'I GOT A FACE FULL OF PETTICOAT!', "WHAT'S UNDER THERE?! IT SMELLS LIKE TUNA!"],
    death: ['BLOWN AWAY BY A DRESS', 'DIED UNDER MARILYN\'S SKIRT'],
  },
  'm2:hw_elvis': {
    hurt: ['HIP CHECKED BY ELVIS!', 'YOUR PELVIS IS A WEAPON, MAN!', 'OW! FAT VEGAS ELVIS KNOWS KARATE!'],
    death: ['THE KING KILLED HIM', 'MEATHEAD LEFT THE BUILDING'],
  },
  'm2:hw_hero': {
    hurt: ['YOUR ABS ARE FOAM! THAT STILL HURT!', 'GET YOUR CAPE OUT OF MY FACE!', 'OW! YOU SMELL LIKE A COMIC SHOP!'],
    death: ['BEATEN UP BY A GUY IN A CAPE', 'KILLED BY AN EXTRA'],
  },
  'm2:hw_hero_shield': {
    hurt: ['A FOAM SHIELD! IT HAS A BRICK IN IT!', 'RIGHT IN THE TEETH! FUCKING SHIELD!', 'THAT CAME BACK AROUND!'],
    death: ['SHIELD TO THE HEAD', 'FRISBEED'],
  },
  'm2:hw_pirate': {
    hurt: ["HE'S DRUNK! HE'S NOT ACTING DRUNK!", 'YOUR SWORD IS REAL, YOU DRUNK!', 'ARR! FUCK YOU!'],
    death: ['STABBED BY A DRUNK PIRATE', 'WALKED THE PLANK'],
  },
  'm2:hw_pirate_cutlass': {
    hurt: ['I CHARGED RIGHT ONTO HIS SWORD!', 'CUTLASS IN THE GUT!', 'WHO GIVES A PIRATE A REAL SWORD?!'],
    death: ['CHARGED INTO A CUTLASS', 'SKEWERED, SAVVY'],
  },
  'm2:hw_statue': {
    hurt: ['THE STATUE MOVED! THE STATUE HIT ME!', 'GOLD PAINT IN MY EYE!', 'OW! GOLDFINGER CHEATED!'],
    death: ['KILLED BY A STATUE', 'BEAT BY A GOLD BUM'],
  },
  'm2:hw_tram': {
    hurt: ['HIT BY THE TOUR TRAM!', 'IT DIDN\'T EVEN HONK! IT HONKED! I DIDN\'T CARE!', 'A TOURIST TOOK A PICTURE OF ME DYING!'],
    death: ['RUN OVER BY A STUDIO TOUR', 'THE TOUR DOES NOT STOP'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...ARRIVE, ...Object.values(GAG_LINES).flat(), ...FIRST_WIRE, ...WIRE_WHOOP, ...PICKPOCKETED, ...GOT_IT_BACK, ...FALL_SCREAM,
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [PA_VOICE]: [...Object.values(PA_WELCOME).flat(), ...PA_STEVE, ...Object.values(PA_SECURITY).flat(), ...Object.values(PA_COASTER).flat()],
  [TRAM_VOICE]: TRAM_CALL,
  [HUSTLER_VOICES.marilyn]: [...Object.values(MARILYN_HUSTLE).flat(), ...Object.values(THIEF_GLOAT).flat()],
  [HUSTLER_VOICES.elvis]: [...Object.values(ELVIS_HUSTLE).flat(), ...Object.values(THIEF_GLOAT).flat()],
  [HUSTLER_VOICES.hero]: [...Object.values(HERO_HUSTLE).flat(), ...Object.values(THIEF_GLOAT).flat()],
  [HUSTLER_VOICES.herof]: [...Object.values(HERO_HUSTLE).flat(), ...Object.values(THIEF_GLOAT).flat()],
  [HUSTLER_VOICES.pirate]: [...Object.values(PIRATE_HUSTLE).flat(), ...Object.values(THIEF_GLOAT).flat()],
  [HUSTLER_VOICES.piratef]: [...Object.values(PIRATE_HUSTLE).flat(), ...Object.values(THIEF_GLOAT).flat()],
  [HUSTLER_VOICES.statue]: [...Object.values(STATUE_HUSTLE).flat(), ...Object.values(THIEF_GLOAT).flat()],
  [HUSTLER_VOICES.statuef]: [...Object.values(STATUE_HUSTLE).flat(), ...Object.values(THIEF_GLOAT).flat()],
};
