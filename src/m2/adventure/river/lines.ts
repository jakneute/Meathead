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
  clean: ['YOU CAME THROUGH THE BACK? WHATEVER. WELCOME ABOARD.', "I'M ARTIE, YOUR SKIPPER. HANDS IN THE BOAT, MOUTH SHUT."],
  shitty: ['YOU CAME THROUGH THE BACK? WHAT IS THAT SMELL? WHATEVER. WELCOME ABOARD.', "I'M ARTIE, YOUR SKIPPER. HANDS IN THE BOAT. SHIT IN THE PANTS, APPARENTLY."],
  nude: ['YOU CAME THROUGH THE BACK? WHERE ARE YOUR PANTS? WHATEVER. WELCOME ABOARD.', "I'M ARTIE, YOUR SKIPPER. HANDS IN THE BOAT. DON'T SIT ON ANYTHING."],
};
/** Meathead, on hearing the name. */
export const BROTHER = {
  meathead1: 'ARTIE? LIKE ARTIE AVALANCHE?',
  artie1: 'THAT WAS MY BROTHER. ALSO NAMED ARTIE.',
  meathead2: 'YOUR PARENTS NAMED YOU BOTH ARTIE?',
  artie2: "THEY WEREN'T CREATIVE PEOPLE. HE WAS A FUCKING ASSHOLE, BY THE WAY.",
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
    "THAT WAS MY BROTHER. ALSO ARTIE. I'M LOOKING AT YOUR FACE. ONLY YOUR FACE.",
    "THEY WEREN'T CREATIVE PEOPLE. HE WAS A FUCKING ASSHOLE. BUT HE WORE PANTS.",
    '...YOU KNEW HIM? WERE YOU NAKED THEN, TOO?',
  ],
};
/** The tour: the spiel, the jokes he's told nine thousand times. In order (each way as long as the others). */
export const ARTIE_TOUR: ByPants = {
  clean: [
    'ON YOUR LEFT, THE RIVER ELEPHANT. HE IS SPRAYING US. THAT IS NOT WATER.',
    'HIPPOS KILL MORE PEOPLE THAN ANY OTHER ANIMAL. EXCEPT THE CHURROS.',
    "THOSE GORILLAS ARE ALL DAVE. HI, DAVE. DAVE'S A PIECE OF SHIT.",
    "THOSE PIRANHAS ARE REAL. THEY'RE NOT PART OF THE RIDE. NOBODY KNOWS.",
    'I HAVE A DOCTORATE IN RIVER-OLOGY. THIS IS WHAT IT GETS YOU.',
    'COMING UP, THE BACKSIDE OF WATER. ...NOBODY EVER LAUGHS AT THE BACKSIDE OF WATER.',
  ],
  shitty: [
    'ON YOUR LEFT, THE RIVER ELEPHANT. HE IS SPRAYING US. IT SMELLS BETTER THAN YOU.',
    'HIPPOS SPIN THEIR TAILS WHEN THEY SHIT. YOU TWO WOULD HIT IT OFF.',
    'THAT GORILLA IS DAVE. DAVE THROWS SHIT AT THE BOATS. DAVE SAW YOU AND PUT IT DOWN.',
    'THE PIRANHAS ARE FOLLOWING THE BOAT. THEY CAN SMELL YOU. I CAN SMELL YOU.',
    'I HAVE A DOCTORATE IN RIVER-OLOGY. NOW I SIT DOWNWIND OF YOUR ASS.',
    'COMING UP, THE BACKSIDE OF WATER. YOUR BACKSIDE IS LEAKING ON MY BENCH.',
  ],
  nude: [
    "ON YOUR LEFT, THE RIVER ELEPHANT AND HIS TRUNK. SIR, IT'S NOT A CONTEST. YOU LOST.",
    "HIPPOS DON'T WEAR PANTS EITHER. BUT THEY HAVE THE DECENCY TO STAY UNDERWATER.",
    "THAT GORILLA IS DAVE. DAVE WEARS A FUR SUIT IN THIS HEAT. YOU COULDN'T MANAGE PANTS.",
    "THOSE PIRANHAS ARE REAL. IF I WERE YOU, I WOULDN'T DANGLE.",
    "I HAVE A DOCTORATE IN RIVER-OLOGY. I'VE SEEN BIGGER SHRIMP.",
    'COMING UP, THE BACKSIDE OF WATER. NOBODY NEEDED YOURS TOO.',
  ],
};
/** The engine coughing out (the first, the first radio call, the second). */
export const ARTIE_GAS: ByPants = {
  clean: ["OH, COME ON. WE'RE OUT OF GAS. AGAIN.", 'SLIGHT DELAY, FOLKS. THIS IS A NORMAL PART OF THE EXPERIENCE.'],
  shitty: ["OH, COME ON. OUT OF GAS. NOW I CAN'T OUTRUN THE SMELL.", "SLIGHT DELAY. THE BOAT'S OUT OF GAS. YOU, CLEARLY, ARE NOT."],
  nude: ['OH, COME ON. OUT OF GAS. WITH A NAKED MAN. AGAIN.', 'SLIGHT DELAY. PLEASE REMAIN SEATED. ON A TOWEL. FIND A TOWEL.'],
};
/** On the radio to maintenance (nobody comes, ever). The first, the first call; the rest while he's still aboard. */
export const ARTIE_RADIO: ByPants = {
  clean: [
    'MAINTENANCE, BOAT SEVEN. OUT OF GAS. AGAIN. OVER.',
    'MAINTENANCE, I CAN HEAR YOU EATING. OVER.',
    "MAINTENANCE, I HAVE A GUEST. HE'S STARING AT ME. OVER.",
    'MAINTENANCE, I CAN SEE YOU FROM HERE, YOU LAZY PRICK. OVER.',
  ],
  shitty: [
    'MAINTENANCE, BOAT SEVEN. OUT OF GAS. AND A GUEST SHIT HIMSELF. OVER.',
    "MAINTENANCE, HOW CAN YOU EAT? I'M NEVER EATING AGAIN. OVER.",
    'MAINTENANCE, THE FLIES FOUND US. THEY BROUGHT FRIENDS. OVER.',
    'MAINTENANCE, BRING A MOP. AND A PRIEST. OVER.',
  ],
  nude: [
    'MAINTENANCE, BOAT SEVEN. OUT OF GAS. GUEST IS OUT OF PANTS. OVER.',
    'MAINTENANCE, I NEED GAS AND PANTS. SIZE HUSKY. OVER.',
    "MAINTENANCE, I'M TRYING NOT TO LOOK AT IT. IT'S HARD. NOT LIKE THAT. OVER.",
    "MAINTENANCE, I CAN SEE YOU LAUGHING, YOU PRICK. IT'S RIGHT NEXT TO ME. OVER.",
  ],
};
/** Stuck, and still going: the monologue (he never shuts up). */
export const ARTIE_STUCK: ByPants = {
  clean: [
    "I WAS GONNA BE A VETERINARIAN. NOW I'M THIS.",
    'THE HAT CRACKED IN TWENTY NINETEEN. THEY SAID TAPE IT. I TAPED IT.',
    "SEE THAT ROCK? THAT'S GERALD. GERALD'S MY BEST FRIEND.",
    'MY BROTHER WOULD HAVE LOVED THIS. YOU, STUCK IN MY BOAT. FOREVER.',
    'FOUR HUNDRED GUESTS AN HOUR, AND I GET YOU.',
    'I WORK REALLY HARD ON THIS SET. FOUR HOURS A NIGHT. IN A MIRROR.',
  ],
  shitty: [
    "I WAS GONNA BE A VET. I'VE HAD MY ARM UP A COW. THE COW SMELLED BETTER.",
    "THERE'S A FLY ON YOUR ASS. NOW THERE'S A FAMILY. THEY'RE PUTTING IN A POOL.",
    "GERALD'S BEEN A ROCK FOR TWENTY YEARS. GERALD'S GAGGING.",
    'MY BROTHER SHIT HIMSELF ON A CHAIRLIFT ONCE. SAT IN IT ALL DAY. OUT OF SPITE.',
    "A FOUR-YEAR-OLD SHIT HERSELF ON MY BOAT ONCE. SHE CRIED. YOU HAVEN'T EVEN NOTICED.",
    "IS IT WARM? DON'T TELL ME.",
  ],
  nude: [
    "I WAS GONNA BE A VET. I KNOW WHAT I'M LOOKING AT. I WISH I DIDN'T.",
    "I'M LOOKING AT THE TREES. ...I LOOKED. I'M SORRY.",
    "GERALD, DON'T LOOK. ...HE LOOKED. HE'S A ROCK. HE CAN'T NOT LOOK.",
    "YOU KNOW WHAT SUNBURNS FIRST OUT HERE? YOU'RE ABOUT TO FIND OUT.",
    "FOUR HUNDRED GUESTS AN HOUR. ALL FOUR HUNDRED WEAR PANTS. IT'S NOT A HARD NUMBER.",
    "THAT SEAT IS VINYL. YOU'RE GONNA STICK TO IT. I'M NOT PEELING YOU OFF.",
  ],
};
/** Meathead, stuck in the boat with him (as the pool goes round: a hint he could just swim for it). */
export const MEATHEAD_STUCK = ['I COULD SWIM FOR IT.', 'SHUT UP, ARTIE.', "I'D RATHER DROWN.", 'IS THAT WATER? I COULD JUST JUMP IN THE WATER.'];
/** He jumps overboard: Artie's not happy about it (one of these). */
export const ARTIE_JUMPED: ByPants = {
  clean: ["SIR! I'M IN THE MIDDLE OF MY SET!", "YOU'RE WALKING OUT BEFORE THE BACKSIDE OF WATER?! I WROTE THAT!", 'FINE! GO! THE PIRANHAS ARE REAL, ASSHOLE! THAT ONE WAS A JOKE TOO!'],
  shitty: ["SIR! I'M IN THE MIDDLE OF MY SET! ...ACTUALLY, GO.", 'YOU SHIT ON MY BENCH AND WALKED OUT ON MY SET! BOTH!', "FINE! GO! THE PIRANHAS WON'T TOUCH YOU EITHER! THAT'S MATERIAL!"],
  nude: ['SIR! NOT DURING MY SET! NOT LIKE THAT!', 'A NAKED WALKOUT! IN THE MIDDLE OF MY BEST BIT!', 'FINE! THE PIRANHAS GO FOR THE DANGLY BITS, ASSHOLE! I WROTE THAT TOO!'],
};
/** ...and after, alone in the boat, still at it (he can be heard a while yet). */
export const ARTIE_ALONE: ByPants = {
  clean: ['MAINTENANCE, A GUEST WALKED OUT ON MY SET. OVERBOARD. OVER.', 'SIX YEARS I WORKED ON THE BACKSIDE OF WATER. SIX YEARS.', "I'M NOT LETTING THIS GO, GERALD. I'M NOT."],
  shitty: ['MAINTENANCE, A GUEST WALKED OUT ON MY SET. BRING A HOSE FOR THE BENCH. OVER.', 'HE SHIT ON MY BENCH AND WALKED OUT ON MY SET. IN THAT ORDER.', "I'M NOT LETTING THIS GO, GERALD. NEITHER IS THE BENCH."],
  nude: ["MAINTENANCE, A NAKED GUEST WALKED OUT ON MY SET. NO, I DIDN'T TAKE HIS PANTS. OVER.", 'I DID MY BEST MATERIAL FOR A NAKED GUY. AND HE LEFT.', "WE'RE NEVER TALKING ABOUT THIS, GERALD. EXCEPT THE WALKOUT."],
};
/** Meathead, going over the side. */
export const MEATHEAD_JUMP = ['NOPE.', 'FUCK THIS BOAT.', 'SEE YA, ARTIE.', 'CANNONBALL!'];

// ---------------------------------------------------------------------------------------------------------------
// Under the water

/** Under, and it gets more and more obviously a theme park (said the once each, at each). */
export const MEATHEAD_UNDER = {
  dive: "DEEPER THAN IT LOOKS. THAT'S WHAT SHE SAID.",
  rides: 'A TEACUP RIDE. DOWN HERE. SURE.',
  rides2: 'THIS IS WHERE RIDES COME TO DIE.',
  dinos: "DINOSAURS. THEY'RE FAKE. THEY'RE FAKE, RIGHT?",
  dinos2: "THAT ONE'S FAKE. IT'S GOT A PRICE TAG.",
  tank: 'OH HEY. PEOPLE.',
  drain: "WHY'S THE WATER PULLING?",
  sucked: 'OH NO. NO NO NO NO NO.',
};
/** Low on air (once per breath held). */
export const MEATHEAD_AIR = ['NEED AIR.', 'LUNGS. BURNING.', 'GOTTA BREATHE.'];

/** What hurts him in the water: the voiced hurt callouts and the death screen, by source (the enemy's kind). */
export const HURT = {
  'm2:piranha': {
    hurt: ['PIRANHA! ON MY ASS!', 'THE FISH BIT ME!', 'GET OFF MY NIPPLE!', 'SO MANY TINY TEETH!'],
    death: ['PICKED CLEAN BY PIRANHAS', 'FISH FOOD', 'NIBBLED TO THE BONE', 'ALL YOU CAN EAT MEATHEAD'],
  },
  'm2:eel': {
    hurt: ['ELECTRIC EEL!', 'ZAPPED BY A SNAKE FISH!', 'MY FILLINGS ARE HUMMING!', 'WHY IS THE WATER SPICY?!'],
    death: ['ELECTROCUTED BY AN EEL', 'KILLED BY A WET NOODLE', 'FRIED IN THE RIVER', 'GOT THE EEL TREATMENT'],
  },
  'm2:snapper': {
    hurt: ['THE PLANT BIT ME!', 'THE SALAD BITES BACK!', 'STUPID FUCKING WEED!', 'GET YOUR LEAVES OFF ME!'],
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
  clean: ["MOM, THERE'S A FAT MAN IN THE DINOSAUR TANK.", 'IS HE PART OF THE SHOW?', "IS THAT A MANATEE? NO, IT'S A GUY.", 'FORTY DOLLARS, AND THERE IS A MAN IN IT.'],
  shitty: ["WHY'S THE WATER GOING BROWN?", "HE'S LEAKING INTO THE TANK!", "IS THAT A DINOSAUR EGG? OH GOD, NO IT ISN'T.", 'THE DINOSAURS ARE SWIMMING AWAY FROM HIM.'],
  nude: ["THERE'S A NAKED MAN IN THE DINOSAUR TANK!", "KIDS, DON'T LOOK. THAT'S NOT A DINOSAUR.", "IS THAT AN EEL? ...THAT'S NOT AN EEL.", 'WHY DOES THE GLASS MAGNIFY IT?'],
};
/** He's killed something in there. */
export const GUESTS_KILL = ['HE KILLED IT! IS THAT THE SHOW?', 'BEST EXHIBIT IN THE PARK.', "THE WATER'S ALL RED. I WANT MY MONEY BACK.", 'DO IT AGAIN!'];

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
