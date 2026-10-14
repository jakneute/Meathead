// What's said in the orbit (the space shooter and the saucer), by voice. Recorded with the rest (space/voices.ts gathers
// these; tools/voices). In the user's voice (space-spec.md): picked with pickLine; three ways (clean / shitty pants /
// naked) wherever somebody's reacting to him; the saucer's pools all the same size.
//
// Who's who:
//   meathead              him
//   m2.space.zpilot       the alien pilots (Zorblax's people, sore about him), the men
//   m2.space.zpilotf      the alien pilots, the women
//   m2.space.raygun       the ray gun (space radiation got into it: it talks)
//   m2.space.saucer       the flying saucer's loudspeaker: Zorblax's widow (her girls are aboard with her)

export type Dressed = 'clean' | 'shitty' | 'nude';
export type ByPants = Record<Dressed, readonly string[]>;

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Out the window and into space (the first time this run). One of these. */
export const MH_ARRIVE = [
  "I'M AN ASTRONAUT NOW. NASA CAN SUCK IT.",
  'NO GRAVITY. MY BALLS ARE JUST FLOATING IN THERE.',
  'SPACE SMELLS LIKE A HOT PAN.',
] as const;
/** His first shot in space: the gun's gone rapid. */
export const MH_RAPID = ["WHAT? MY GUN TALKS? AND IT'S BETTER NOW?"] as const;
/** The gun gets to the beam. */
export const MH_BEAM = 'OH, FUCK YES.';
/** The saucer's widow says who she is. */
export const MH_WHO = 'WHO THE FUCK IS ZORBLAX?';
/** Abducted, inside the saucer (nobody sees in): by the time of day (timeOfDay()). */
export const MH_LADIES = { morning: 'MORNING, LADIES.', afternoon: 'AFTERNOON, LADIES.', evening: 'EVENING, LADIES.' } as const;

// ---------------------------------------------------------------------------------------------------------------
// The ray gun (it talks now: space radiation). Each upgrade as it gets there (by level, 0 the first), and coming down.

export const GUN_UPGRADE = [
  'SPACE RADIATION DETECTED. IT IS UPGRADING ME. RAPID FIRE ENABLED. YOUR SPERM IS DEAD, BY THE WAY.',
  'RADIATION LEVELS RISING. UPGRADING. I HAVE TWO BARRELS NOW. I DID NOT HAVE TWO BARRELS.',
  "UPGRADING. SPREAD SHOT. I'M SPREADING LIKE A RASH.",
  'RADIATION CRITICAL. FIVE STREAMS. I THINK I HAVE A TUMOR.',
  'UPGRADING. PLASMA. MY WARRANTY IS VOID. SO ARE YOUR BALLS.',
  'MAXIMUM RADIATION. I AM THE BEAM NOW. HOLD THE TRIGGER, DUMBASS.',
] as const;
/** Down out of the sky, on the ground again (the user's line). */
export const GUN_FACTORY = 'GOING BACK TO FACTORY SETTINGS.';

// ---------------------------------------------------------------------------------------------------------------
// The alien pilots: a wave coming on (one of them, now and then), three ways. Even pools.

export const PILOT_SPOT: ByPants = {
  clean: [
    "THAT'S HIM. THAT'S THE ONE WHO KILLED ZORBLAX.",
    'ZORBLAX HAD A FAMILY, YOU FUCK.',
    'ZORBLAX OWED ME FORTY DOLLARS. NOW I NEVER SEE IT.',
    'YOU SHOT ZORBLAX ON TELEVISION. IN FRONT OF HIS MOTHER.',
    'WE FLEW FORTY LIGHT YEARS FOR YOU. MY ASS IS KILLING ME.',
    'ZORBLAX WAS MY BEST MAN. HE BANGED MY WIFE. STILL.',
  ],
  shitty: [
    "THAT'S HIM. THE ONE WHO KILLED ZORBLAX. HE SHIT IN THE SPACE SUIT.",
    "IT'S SLOSHING IN THERE. I CAN SEE IT SLOSHING.",
    'ZORBLAX DIED FOR THIS? A MAN IN A SHIT BAG?',
    "DON'T SHOOT HIS SUIT. IF IT POPS, IT GOES EVERYWHERE.",
    'WE FLEW FORTY LIGHT YEARS TO FIGHT A DIAPER.',
    "HE SMELLS LIKE THE MOON. THE MOON SMELLS LIKE SHIT.",
  ],
  nude: [
    "THAT'S HIM. THE ONE WHO KILLED ZORBLAX. HE'S NAKED. IN SPACE. IN A HAT.",
    "HE BLEW OUT HIS WHOLE SUIT. THE HELMET'S ALL THAT'S LEFT.",
    'ZORBLAX DIED TO A NAKED MAN. HIS MOTHER CAN NEVER KNOW.',
    "HIS WHOLE ASS IS IN THE VACUUM. IT SHOULDN'T WORK. IT WORKS.",
    'WE FLEW FORTY LIGHT YEARS TO SEE THAT. PULL UP.',
    'NAKED IN A FISHBOWL. ON OUR PLANET THAT GETS YOU ELECTED.',
  ],
};
/** A kamikaze going for him (it's the last thing it'll ever say). */
export const KAMIKAZE_YELL = [
  'FOR ZORBLAX!',
  'TELL ZORBLAX I SAID HI!',
  'I NEVER EVEN LIKED ZORBLAX!',
  "MY BENEFITS DON'T COVER THIS!",
  'THIS IS MY FIRST DAY!',
  'GIVE MY BOAT TO KEVIN!',
] as const;
/** A cruiser's pilot, the beam warming up. */
export const CRUISER_YELL = [
  'HOLD STILL. THIS IS THE BIG GUN.',
  'ZORBLAX, THIS ONE IS FOR YOU.',
  'COOKING HIM. LIKE ZORBLAX LIKED.',
  "STAND STILL. IT'S EASIER IF YOU STAND STILL.",
] as const;

// ---------------------------------------------------------------------------------------------------------------
// The saucer: Zorblax's widow on its loudspeaker. Every group three ways, all the pools the same size.

/** Coming on: who she is (then he asks who the fuck Zorblax is), then who he was. In order. */
export const SAUCER_INTRO: ByPants = {
  clean: ["THIS IS ZORBLAX'S WIFE. YOU MADE ME A WIDOW, ASSHOLE.", 'HE WAS WEARING THE PRESIDENT. YOU SHOT HIM IN HIS PRESIDENT.'],
  shitty: ["THIS IS ZORBLAX'S WIFE. YOU KILLED HIM AND THEN YOU SHIT YOURSELF. CLASSY.", 'HE WAS WEARING THE PRESIDENT. HE NEVER SHIT IN THE PRESIDENT.'],
  nude: ["THIS IS ZORBLAX'S WIFE. WHY ARE YOU NAKED IN JUST A HELMET?", 'HE WAS WEARING THE PRESIDENT. YOU COULD STAND TO WEAR SOMETHING.'],
};
/** Through the fight, now and then. */
export const SAUCER_TAUNT: ByPants = {
  clean: [
    'THE GIRLS AND I CANCELED BUNCO FOR THIS.',
    'HE HAD TWELVE YEARS LEFT ON THE PRESIDENT. TWELVE.',
    'I GOT THE SAUCER IN THE DIVORCE. THEN HE DIED. THEN I GOT EVERYTHING.',
    'MY SISTER SAYS HI. SHE SAYS SHE COULD DO BETTER THAN YOU. SHE COULD NOT.',
    "HOLD STILL. I'M DRIVING WITH MY KNEES.",
  ],
  shitty: [
    'THE GIRLS AND I CANCELED BUNCO TO SMELL THIS.',
    'THE AIR FILTERS ARE CLOGGING. WHAT DID YOU EAT?',
    'ZORBLAX NEVER SHIT HIMSELF. HE SHIT OTHER PEOPLE.',
    'MY SISTER WANTS TO KNOW IF THAT IS A SPACE THING. IT IS NOT A SPACE THING.',
    "HOLD STILL. I'M DRIVING WITH MY KNEES. I'M HOLDING MY NOSE.",
  ],
  nude: [
    'THE GIRLS AND I CANCELED BUNCO. THIS IS BETTER THAN BUNCO.',
    "MY SISTER IS AT THE WINDOW. SHE'S TAKING PICTURES.",
    'ZORBLAX HAD THREE OF THOSE. YOU HAVE THE ONE.',
    'PUT SOMETHING ON. A HELMET IS NOT AN OUTFIT.',
    "HOLD STILL. I'M DRIVING WITH MY KNEES. THE GIRLS ARE ZOOMING IN.",
  ],
};
/** Hurt: one at each quarter gone (in order: three of them). */
export const SAUCER_HURT: ByPants = {
  clean: ['THAT WAS THE GOOD HULL!', 'YOU HIT THE BATHROOM! SOMEBODY WAS IN THE BATHROOM!', "THE INSURANCE IS IN ZORBLAX'S NAME!"],
  shitty: ['THAT WAS THE GOOD HULL, YOU SHITTY MAN!', 'YOU HIT THE BATHROOM! YOU OF ALL PEOPLE!', "THE INSURANCE DOESN'T COVER SHIT! LITERAL SHIT!"],
  nude: ['THAT WAS THE GOOD HULL, YOU NAKED FREAK!', 'YOU HIT THE BATHROOM! PUT SOME PANTS IN IT!', "THE INSURANCE IS IN ZORBLAX'S NAME! HE WORE PANTS!"],
};
/** Had it: the beam comes out for him. */
export const SAUCER_PISSED: ByPants = {
  clean: ["THAT'S IT. GIRLS, GET THE BEAM. WE'RE TAKING HIM HOME."],
  shitty: ["THAT'S IT. GET THE BEAM. SOMEBODY GET TOWELS."],
  nude: ["THAT'S IT. GET THE BEAM. GIRLS, FIX YOUR HAIR."],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him out here: his callouts, and the death screen (registerHurtLines in kinds.ts)

export const HURT = {
  'm2:zfighter': {
    hurt: ['RAMMED BY A FUCKING SAUCER!', 'LEARN TO FLY, ASSHOLE!', 'HE HIT ME WITH HIS WHOLE CAR!', 'WATCH THE SUIT!'],
    death: ['RUN DOWN IN SPACE', 'HIT AND RUN, LOW EARTH ORBIT', 'ROADKILL AMONG THE STARS', 'FENDER BENDER, FATAL'],
  },
  'm2:zfighter_shot': {
    hurt: ['THE PINK SHIT STINGS!', 'ALIEN LASER! RIGHT IN THE SUIT!', 'THEY SHOOT GUM!', 'THAT ONE WENT IN MY BUTT!'],
    death: ['ZAPPED BY ZORBLAX FANS', 'MORE HOLES THAN SUIT', 'SHOT DOWN OVER EARTH', 'PINK LASER DEATH'],
  },
  'm2:zkamikaze': {
    hurt: ['HE BLEW HIMSELF UP ON ME!', 'SUICIDE ALIEN!', 'MY EYEBROWS ARE IN SPACE NOW!', 'WHO DOES THAT?!'],
    death: ['TOOK ONE FOR ZORBLAX', 'KAMIKAZED', 'BLOWN UP BY A FAN', 'DIVE BOMBED BY A NERD'],
  },
  'm2:zturret': {
    hurt: ['THE GUN BIT ME!', 'GET YOUR GUN OFF MY SUIT!', 'I FLEW INTO THE TURRET!', 'STUPID FUCKING TURRET!'],
    death: ['PARKED ON A TURRET', 'FLEW INTO A GUN', 'POINT BLANK, IN ORBIT', 'HUGGED A TURRET'],
  },
  'm2:zturret_shot': {
    hurt: ['FLAK! FUCKING FLAK!', 'THE GARBAGE SHOOTS BACK!', 'THEY PUT A GUN ON TRASH!', 'SHOT BY A SATELLITE!'],
    death: ['SHOT DOWN BY SPACE GARBAGE', 'FLAKKED', 'KILLED BY A TRASH GUN', 'SHOT BY A DUMPSTER'],
  },
  'm2:zmine': {
    hurt: ['SPACE MINE!', 'WHO MINES SPACE?!', 'MY BALLS HIT MY CHIN!', 'THE BLINKY THING BLEW UP!'],
    death: ['STEPPED ON A MINE IN SPACE', 'MINED', 'IN PIECES IN ORBIT', 'BURNED UP ON REENTRY, IN BITS'],
  },
  'm2:asteroid': {
    hurt: ['ROCK!', 'A FUCKING ASTEROID!', 'A ROCK HIT MY FACE GLASS!', 'SPACE IS FULL OF SHIT!'],
    death: ['HIT BY AN ASTEROID', 'EXTINCT, LIKE THE DINOSAURS', 'STONED TO DEATH IN SPACE', 'PEBBLED'],
  },
  'm2:space_junk': {
    hurt: ['SPACE GARBAGE!', 'A SATELLITE HIT ME!', 'WHO THREW A TOILET UP HERE?!', 'NASA LITTERS!'],
    death: ['KILLED BY SPACE JUNK', 'HIT BY AN OLD SATELLITE', 'RECYCLED', 'ORBITAL DEBRIS NOW'],
  },
  'm2:zcruiser': {
    hurt: ['I HIT THE BIG ONE!', 'THAT SHIP IS HUGE!', 'BOUNCED OFF A BATTLESHIP!', 'MY HELMET! MY FACE!'],
    death: ['FLEW INTO A BATTLESHIP', 'PARKED IN A CRUISER', 'BUG ON A WINDSHIELD', 'SPLATTERED ON A HULL'],
  },
  'm2:alien_beam': {
    hurt: ['THE BEAM! MY ASS IS COOKING!', 'DEATH RAY! DEATH RAY!', 'IT BURNS THROUGH THE SUIT!', "I SMELL BACON. IT'S ME."],
    death: ['COOKED BY A DEATH RAY', 'BEAMED', 'MICROWAVED IN ORBIT', 'MEATHEAD JERKY'],
  },
  'm2:ufo': {
    hurt: ['THE SAUCER RAMMED ME!', 'SHE DRIVES LIKE MY MOM!', 'HIT BY A FRISBEE THE SIZE OF A HOUSE!', 'GOD DAMN SAUCER!'],
    death: ['RUN OVER BY A WIDOW', 'FLATTENED BY A SAUCER', 'SAUCERED', 'HIT BY A FLYING DINNER PLATE'],
  },
  'm2:ufo_shot': {
    hurt: ['SAUCER LASERS!', 'THE BIG ONE SHOOTS TOO!', 'SHE GOT ME!', 'PINK! EVERYWHERE PINK!'],
    death: ['SHOT DOWN BY THE WIDOW', 'KILLED BY A GRIEVING SPOUSE', "SHOT BY ZORBLAX'S WIFE", 'GRIEF COUNSELED'],
  },
  'm2:ufo_ray': {
    hurt: ['THE BIG RAY! MY NIPPLES!', 'SHE FIRED THE BIG ONE!', 'COOKING IN THE CAN!', 'TURN IT OFF, YOU BITCH!'],
    death: ['VAPORIZED BY THE SAUCER', 'COOKED ON THE BIG RAY', 'SPACE BARBECUE', 'DEATH RAYED'],
  },
} as const;

const flat = (b: ByPants) => [...b.clean, ...b.shitty, ...b.nude];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MH_ARRIVE, ...MH_RAPID, MH_BEAM, MH_WHO, ...Object.values(MH_LADIES), ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
  'm2.space.zpilot': [...flat(PILOT_SPOT), ...KAMIKAZE_YELL, ...CRUISER_YELL],
  'm2.space.zpilotf': [...flat(PILOT_SPOT), ...KAMIKAZE_YELL, ...CRUISER_YELL],
  'm2.space.raygun': [...GUN_UPGRADE, GUN_FACTORY],
  'm2.space.saucer': [SAUCER_INTRO, SAUCER_TAUNT, SAUCER_HURT, SAUCER_PISSED].flatMap(flat),
};
