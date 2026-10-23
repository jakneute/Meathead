// What's said on the river (river/index.ts): Safari Artie's Jungle Cruise (he never stops), Meathead's half of it, the
// river's wildlife getting him (hurt and death lines), and the guests behind the glass at the dinosaur tank (three ways:
// clean, shitty pants, naked). Recorded with the rest (tools/voices).

export type Dressed = 'clean' | 'shitty' | 'nude';
/** A pool of lines each way, by the state of Meathead's pants when it's said. */
export type ByPants = Record<Dressed, readonly string[]>;

// ---------------------------------------------------------------------------------------------------------------
// Safari Artie, the boat ride (everything he says, three ways: clean, shitty pants, naked; picked as it's said)

/** Boarding: he gets on (no line, no ticket, the boat already full of nobody). In order. */
export const ARTIE_WELCOME: ByPants = {
  clean: ['YOU CAME THROUGH THE BACK? WHATEVER. WELCOME ABOARD.', "I'M ARTIE. SKIPPER OF THE YEAR, FOUR YEARS RUNNING. HANDS IN THE BOAT."],
  shitty: ['YOU CAME THROUGH THE BACK? SMELLS LIKE IT. WELCOME ABOARD.', "I'M ARTIE. SKIPPER OF THE YEAR. FOUR YEARS, NOBODY SHIT ON MY BENCH. TILL TODAY."],
  nude: ['NO PANTS? NO TICKET? WHATEVER. WELCOME ABOARD.', "I'M ARTIE. SKIPPER OF THE YEAR. EYES ON ME. NOT ON THAT."],
};
/** Meathead, on hearing the name. */
export const BROTHER = {
  meathead1: 'ARTIE? LIKE ARTIE AVALANCHE?',
  artie1: 'THAT WAS MY BROTHER. ALSO NAMED ARTIE.',
  meathead2: 'YOUR PARENTS NAMED YOU BOTH ARTIE?',
  artie2: "THEY WEREN'T CREATIVE PEOPLE. I WAS THE FUNNY ONE. HE WAS A FUCKING ASSHOLE.",
  meathead3: 'YEAH. HE WAS.',
  artie3: '...YOU KNEW HIM?',
  meathead4: '...NO.',
};
/** Artie's half of that, three ways (in order: Meathead's half goes between, the same whatever he's wearing). */
export const BROTHER_ARTIE: ByPants = {
  clean: [BROTHER.artie1, BROTHER.artie2, BROTHER.artie3],
  shitty: [
    'THAT WAS MY BROTHER. ALSO ARTIE. ALSO SMELLED LIKE THAT.',
    "THEY WEREN'T CREATIVE PEOPLE. HE WAS A FUCKING ASSHOLE. SHIT HIMSELF A LOT, TOO.",
    '...YOU KNEW HIM? IS THAT WHY YOU SHIT YOURSELF?',
  ],
  nude: [
    'THAT WAS MY BROTHER. ALSO ARTIE. ALSO LET IT ALL HANG OUT.',
    "THEY WEREN'T CREATIVE PEOPLE. HE WAS A FUCKING ASSHOLE. BUT HE WORE PANTS.",
    '...YOU KNEW HIM? WERE YOU NAKED THEN, TOO?',
  ],
};
/** The tour: the spiel, the jokes he's told nine thousand times. In order (each way as long as the others). */
export const ARTIE_TOUR: ByPants = {
  clean: [
    'ON YOUR LEFT, THE RIVER ELEPHANT. HE IS SPRAYING US. THAT IS NOT WATER.',
    'HIPPOS KILL MORE PEOPLE THAN ANY OTHER ANIMAL. EXCEPT THE CHURROS. I WROTE THAT.',
    'THOSE GORILLAS ARE ALL DAVE. DAVE WANTED MY BOAT. DAVE GOT A FUR SUIT.',
    "THOSE PIRANHAS ARE REAL. THEY'RE NOT PART OF THE RIDE. NOBODY KNOWS.",
    'FOUR HUNDRED TWELVE BENDS. A JOKE FOR EVERY ONE. ALL MINE. IN ORDER.',
    "COMING UP, THE BACKSIDE OF WATER. MY CLOSER. NOBODY LAUGHS. THEY'RE WRONG.",
  ],
  shitty: [
    'ON YOUR LEFT, THE RIVER ELEPHANT. HE IS SPRAYING US. IT SMELLS BETTER THAN YOU.',
    'HIPPOS SPIN THEIR TAILS WHEN THEY SHIT. TRUE FACT. YOU TWO WOULD HIT IT OFF.',
    'THAT GORILLA IS DAVE. DAVE WANTED MY BOAT. DAVE SMELLED YOU. DAVE DOES NOT WANT IT NOW.',
    'THE PIRANHAS ARE FOLLOWING US. CHUM IN THE WATER, BUDDY.',
    "FOUR HUNDRED TWELVE JOKES, ONE PER BEND. NOT ONE ABOUT THIS. I'M NOT WRITING ONE.",
    'COMING UP, THE BACKSIDE OF WATER. MY CLOSER. AND YOUR BACKSIDE IS UPSTAGING IT.',
  ],
  nude: [
    'ON YOUR LEFT, THE RIVER ELEPHANT AND HIS TRUNK. YOU LOST, BUDDY.',
    "HIPPOS DON'T WEAR PANTS EITHER. THEY HAVE THE DECENCY TO SUBMERGE.",
    "THAT GORILLA IS DAVE. DAVE WEARS A FUR SUIT IN JULY. YOU CAN'T DO PANTS?",
    "THOSE PIRANHAS ARE REAL. IF I WERE YOU, I WOULDN'T DANGLE.",
    'FOUR HUNDRED TWELVE JOKES ON THIS BOAT. THE SMALLEST ONE IS IN YOUR LAP.',
    'COMING UP, THE BACKSIDE OF WATER. MY CLOSER. NOBODY NEEDED YOUR BACKSIDE TOO.',
  ],
};
/** The engine coughing out (the first, the first radio call, the second). */
export const ARTIE_GAS: ByPants = {
  clean: ['OH, COME ON. OUT OF GAS. IN THE MIDDLE OF MY SET.', 'SLIGHT DELAY, FOLKS. THE SKIPPER WILL CONTINUE. THE SKIPPER ALWAYS CONTINUES.'],
  shitty: ["OH, COME ON. OUT OF GAS. NOW I CAN'T OUTRUN THE SMELL.", "SLIGHT DELAY. THE BOAT'S OUT OF GAS. YOU, CLEARLY, ARE NOT."],
  nude: ['OH, COME ON. OUT OF GAS. WITH A NAKED MAN. AGAIN.', "SLIGHT DELAY. THE SET GOES ON. I'M A PROFESSIONAL. SIT ON A TOWEL."],
};
/** On the radio to maintenance (nobody comes, ever). The first, the first call; the rest while he's still aboard. */
export const ARTIE_RADIO: ByPants = {
  clean: [
    'MAINTENANCE, BOAT SEVEN. OUT OF GAS. AGAIN. OVER.',
    'MAINTENANCE, I CAN HEAR YOU EATING. OVER.',
    "MAINTENANCE, THIS IS ARTIE. SKIPPER OF THE YEAR. I DON'T WAIT. OVER.",
    'MAINTENANCE, I CAN SEE YOU FROM HERE, YOU LAZY PRICK. OVER.',
  ],
  shitty: [
    'MAINTENANCE, BOAT SEVEN. OUT OF GAS. AND A GUEST SHIT HIMSELF. OVER.',
    "MAINTENANCE, HOW CAN YOU EAT? I'M NEVER EATING AGAIN. OVER.",
    'MAINTENANCE, A GUEST SHIT ON MY BENCH. MY BENCH. OVER.',
    'MAINTENANCE, BRING A MOP. AND A PRIEST. OVER.',
  ],
  nude: [
    'MAINTENANCE, BOAT SEVEN. OUT OF GAS. GUEST IS OUT OF PANTS. OVER.',
    'MAINTENANCE, I NEED GAS AND PANTS. SIZE HUSKY. OVER.',
    "MAINTENANCE, I'M TRYING NOT TO LOOK AT IT. IT'S HARD. NOT LIKE THAT. OVER.",
    "MAINTENANCE, YOU'RE LAUGHING AT HIM, RIGHT? NOT ME? OVER.",
  ],
};
/** Stuck, and still going: the monologue (he never shuts up). */
export const ARTIE_STUCK: ByPants = {
  clean: [
    "I WAS GONNA BE A VET. THE ANIMALS WEREN'T READY FOR ME.",
    "THE HAT CRACKED IN TWENTY NINETEEN. I TAPED IT. IT'S STILL THE BEST HAT ON THE RIVER.",
    "SEE THAT ROCK? THAT'S GERALD. GERALD SAYS I'M THE BEST SKIPPER HERE. GERALD'S RIGHT.",
    'MY BROTHER DIED OWING ME FORTY BUCKS. AND AN APOLOGY. I WAS THE FUNNY ONE.',
    'FOUR HUNDRED GUESTS AN HOUR, AND I GET YOU.',
    'I WORK REALLY HARD ON THIS SET. FOUR HOURS A NIGHT. IN A MIRROR.',
  ],
  shitty: [
    "I WAS GONNA BE A VET. I'VE HAD MY ARM UP A COW. THE COW SMELLED BETTER.",
    "THERE'S A FLY ON YOUR ASS. NOW THERE'S A FAMILY. THEY'RE PUTTING IN A POOL.",
    "GERALD'S BEEN A ROCK FOR TWENTY YEARS. GERALD'S GAGGING.",
    'MY BROTHER SHIT HIMSELF ON A CHAIRLIFT ONCE. SAT IN IT ALL DAY. OUT OF SPITE.',
    'A FOUR-YEAR-OLD SHIT HERSELF ON MY BOAT ONCE. SHE HAD THE DECENCY TO CRY.',
    'SKIPPER OF THE YEAR. FOUR YEARS RUNNING. AND THIS IS WHAT THEY GIVE ME.',
  ],
  nude: [
    "I WAS GONNA BE A VET. I KNOW WHAT I'M LOOKING AT. I WISH I DIDN'T.",
    "FOUR HOURS A NIGHT IN A MIRROR ON THIS SET. AND YOU'RE THE ONE GETTING STARED AT.",
    "GERALD, DON'T LOOK. ...HE LOOKED. HE'S A ROCK. HE CAN'T NOT LOOK.",
    "YOU KNOW WHAT SUNBURNS FIRST OUT HERE? YOU'RE ABOUT TO FIND OUT.",
    'FOUR HUNDRED GUESTS AN HOUR. THREE HUNDRED NINETY-NINE WEAR PANTS.',
    "THAT SEAT IS VINYL. YOU'RE GONNA STICK TO IT. I'M NOT PEELING YOU OFF.",
  ],
};
/** Meathead, stuck in the boat with him (as the pool goes round: a hint he could just swim for it). */
export const MEATHEAD_STUCK = ['I COULD SWIM FOR IT.', 'SHUT UP, ARTIE.', "I'D RATHER DROWN.", 'IS THAT WATER? I COULD JUST JUMP IN THE WATER.'];
/** He jumps overboard: Artie's not happy about it (one of these). */
export const ARTIE_JUMPED: ByPants = {
  clean: ["SIR! I'M IN THE MIDDLE OF MY SET!", "YOU'RE WALKING OUT BEFORE THE BACKSIDE OF WATER?! I WROTE THAT!", "NOBODY WALKS OUT ON ARTIE! I'LL FIND YOU! I KNOW THIS JUNGLE!"],
  shitty: ["SIR! I'M IN THE MIDDLE OF MY SET! ...ACTUALLY, GO.", 'YOU SHIT ON MY BENCH AND WALKED OUT ON MY SET! BOTH!', 'A SHIT-PANTS WALKED OUT ON ME?! ON ME?! I WILL FIND YOU!'],
  nude: ['SIR! NOT DURING MY SET! NOT LIKE THAT!', 'A NAKED WALKOUT! IN THE MIDDLE OF MY BEST BIT!', "A NAKED MAN HECKLED ME WITH HIS ASS! NOBODY WALKS OUT ON ARTIE!"],
};
/** ...and after, alone in the boat, still at it (he can be heard a while yet). */
export const ARTIE_ALONE: ByPants = {
  clean: ['MAINTENANCE, A GUEST WALKED OUT ON MY SET. OVERBOARD. OVER.', 'SIX YEARS I WORKED ON THE BACKSIDE OF WATER. SIX YEARS.', "I'M NOT LETTING THIS GO, GERALD. I'M NOT.", "I'LL FIND HIM, GERALD. I'VE TRACKED JAGUARS."],
  shitty: ['MAINTENANCE, A GUEST WALKED OUT ON MY SET. BRING A HOSE FOR THE BENCH. OVER.', 'HE SHIT ON MY BENCH AND WALKED OUT ON MY SET. IN THAT ORDER.', "I'M NOT LETTING THIS GO, GERALD. NEITHER IS THE BENCH.", "I'LL FIND HIM, GERALD. HE LEFT A TRAIL."],
  nude: ["MAINTENANCE, A NAKED GUEST WALKED OUT ON MY SET. NO, I DIDN'T TAKE HIS PANTS. OVER.", 'I DID MY BEST MATERIAL FOR A NAKED GUY. AND HE LEFT.', "WE'RE NEVER TALKING ABOUT THIS, GERALD. EXCEPT THE WALKOUT.", "I'LL FIND HIM, GERALD. HE'S THE PINK ONE."],
};
/** Meathead, going over the side. */
export const MEATHEAD_JUMP = ['NOPE.', 'FUCK THIS BOAT.', 'BOOOOO!', 'CANNONBALL!'];

// ---------------------------------------------------------------------------------------------------------------
// Under the water

/** Under, and it gets more and more obviously a theme park (said the once each, at each). */
export const MEATHEAD_UNDER = {
  dive: "DEEPER THAN IT LOOKS. THAT'S WHAT SHE SAID.",
  rides: 'A TEACUP RIDE. DOWN HERE. SURE.',
  rides2: 'THIS IS WHERE RIDES COME TO DIE.',
  dinos: "DINOSAURS. THEY'RE FAKE. THEY'RE FAKE, RIGHT?",
  dinos2: "THAT ONE'S FAKE. IT'S GOT A PRICE TAG.",
  tank: 'OH HEY. AN AUDIENCE.',
  drain: "WHY'S THE WATER PULLING?",
  sucked: 'OH NO. NO NO NO NO NO.',
};
/** Low on air (once per breath held). */
export const MEATHEAD_AIR = ['NEED AIR.', 'LUNGS. BURNING.', 'AIR. NOT FARTS. AIR.'];

/** What hurts him in the water: the voiced hurt callouts and the death screen, by source (the enemy's kind). */
export const HURT = {
  'm2:piranha': {
    hurt: ['PIRANHA! ON MY ASS!', 'THEY WENT FOR THE TAINT!', 'GET OFF MY NIPPLE!', 'SO MANY TINY TEETH!'],
    death: ['PICKED CLEAN BY PIRANHAS', 'FISH FOOD', 'NIBBLED TO THE BONE', 'ALL YOU CAN EAT MEATHEAD'],
  },
  'm2:eel': {
    hurt: ['MY BALLS ARE BUZZING!', 'ZAPPED BY A SNAKE FISH!', 'MY FILLINGS ARE HUMMING!', 'WHY IS THE WATER SPICY?!'],
    death: ['ELECTROCUTED BY AN EEL', 'KILLED BY A WET NOODLE', 'FRIED IN THE RIVER', 'TASED BY A FISH'],
  },
  'm2:snapper': {
    hurt: ["THIS IS WHY I DON'T EAT VEGETABLES!", 'THE SALAD BITES BACK!', 'STUPID FUCKING WEED!', 'GET YOUR LEAVES OFF ME!'],
    death: ['EATEN BY A PLANT', 'DIGESTED BY SHRUBBERY', 'MURDERED BY A HOUSEPLANT', 'FERTILIZER'],
  },
  'm2:drown': {
    hurt: ["CAN'T BREATHE!", 'AIR! AIR!', 'GLUB! GLUB!', 'WATER IN MY LUNGS!'],
    death: ['DROWNED IN THE JUNGLE CRUISE', 'FORGOT TO BREATHE', "SHOULD'VE STAYED IN THE BOAT", 'GLUB GLUB GLUB'],
  },
} as const;

// ---------------------------------------------------------------------------------------------------------------
// The aquatic dinosaur exhibit: the guests behind the glass

/** As he swims by: clean, in shitty pants (the water's going brown round him), naked. Women and men both say these. */
export const GUESTS_SEE: Record<Dressed, string[]> = {
  clean: ["MOM, THERE'S A FAT MAN IN THE DINOSAUR TANK.", 'IS HE PART OF THE SHOW?', "IS THAT A MANATEE? NO, IT'S A GUY.", 'FORTY BUCKS TO WATCH A FAT GUY SWIM. I CAN DO THAT AT THE Y.'],
  shitty: ["WHY'S THE WATER GOING BROWN?", "HE'S LEAKING INTO THE TANK!", "IS THAT A DINOSAUR EGG? OH GOD, NO IT ISN'T.", 'HE JUST CROP-DUSTED THE PLESIOSAUR.'],
  nude: ["THERE'S A NAKED MAN IN THE DINOSAUR TANK!", "KIDS, DON'T LOOK. THAT'S NOT A DINOSAUR.", "IS THAT AN EEL? ...THAT'S NOT AN EEL.", 'WHY DOES THE GLASS MAGNIFY IT?'],
};
/** He's killed something in there. */
export const GUESTS_KILL = ['HE KILLED IT! IS THAT THE SHOW?', 'FINALLY, SOMETHING HAPPENS IN THIS PARK!', "THE WATER'S ALL RED. I WANT MY MONEY BACK.", 'DO IT AGAIN!'];

// (everything above, by voice: for the recording)
const flat = (r: Record<string, readonly string[]>) => Object.values(r).flat();
export const VOICE_LINES: Record<string, string[]> = {
  'm2.safari': [ARTIE_WELCOME, BROTHER_ARTIE, ARTIE_TOUR, ARTIE_GAS, ARTIE_RADIO, ARTIE_STUCK, ARTIE_JUMPED, ARTIE_ALONE].flatMap(flat),
  meathead: [
    BROTHER.meathead1, BROTHER.meathead2, BROTHER.meathead3, BROTHER.meathead4, ...MEATHEAD_STUCK, ...MEATHEAD_JUMP,
    ...Object.values(MEATHEAD_UNDER), ...MEATHEAD_AIR, ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  'm2.guest': [...flat(GUESTS_SEE), ...GUESTS_KILL],
  'm2.guest2': [...flat(GUESTS_SEE), ...GUESTS_KILL],
};
