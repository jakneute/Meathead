// What's said on the river (river/index.ts): Safari Artie's Jungle Cruise (he never stops), Meathead's half of it, the
// river's wildlife getting him (hurt and death lines), and the guests behind the glass at the dinosaur tank (three ways:
// clean, shitty pants, naked). Recorded with the rest (tools/voices).

export type Dressed = 'clean' | 'shitty' | 'nude';

// ---------------------------------------------------------------------------------------------------------------
// Safari Artie, the boat ride

/** Boarding: he gets on (no line, no ticket, the boat already full of nobody). */
export const ARTIE_WELCOME = [
  "WHOA, WHOA. SIR, DID YOU COME THROUGH THE BACK? ...YOU KNOW WHAT, I DON'T CARE. WELCOME ABOARD THE JUNGLE CRUISE!",
  "I'M ARTIE, I'LL BE YOUR SKIPPER TODAY. KEEP YOUR HANDS AND FEET INSIDE THE BOAT, AND YOUR OPINIONS TO YOURSELF.",
];
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
/** The tour: the spiel, the jokes he's told nine thousand times. */
export const ARTIE_TOUR = [
  'ON YOUR LEFT, THE MIGHTY RIVER ELEPHANT. HE IS SPRAYING US. THAT IS NOT WATER.',
  "AND THERE'S A HIPPO. HIPPOS KILL MORE PEOPLE EVERY YEAR THAN ANY OTHER ANIMAL. EXCEPT CHURROS.",
  "LOOK AT THOSE GORILLAS. THEY'RE ACTUALLY DAVE. DAVE PLAYS ALL OF THEM. HI DAVE.",
  'THIS RIVER IS FED BY THE MIGHTY NILE, THE AMAZON, AND A GARDEN HOSE BEHIND THE CHURRO STAND.',
  "THOSE ARE PIRANHAS. THEY'RE REAL. THAT'S NOT PART OF THE RIDE. NOBODY KNOWS HOW THEY GOT IN.",
  "IF ANYONE FALLS OVERBOARD, I'M LEGALLY REQUIRED TO SAY OH NO.",
  'I HAVE A DEGREE IN MARINE BIOLOGY. THIS IS WHAT IT GETS YOU.',
  'THE BACKSIDE OF WATER IS COMING UP. ...IT WAS A JOKE. NOBODY EVER LAUGHS AT THE BACKSIDE OF WATER.',
];
/** The engine coughing out. */
export const ARTIE_GAS = ["OH, COME ON. COME ON. ...WE'RE OUT OF GAS. AGAIN.", "OKAY FOLKS, SLIGHT DELAY. THE BOAT'S OUT OF GAS. THIS IS A NORMAL PART OF THE EXPERIENCE."];
/** On the radio to maintenance (nobody comes, ever). */
export const ARTIE_RADIO = [
  'MAINTENANCE, THIS IS ARTIE ON BOAT SEVEN. WE ARE OUT OF GAS. AGAIN. OVER.',
  'MAINTENANCE, COME IN. ...MAINTENANCE. I CAN HEAR YOU EATING. OVER.',
  "MAINTENANCE, BOAT SEVEN, STILL OUT OF GAS. I HAVE A GUEST. HE'S LOOKING AT ME. OVER.",
  "THIS IS ARTIE. IF ANYBODY'S LISTENING, I'D LIKE TO FILE A COMPLAINT ABOUT MAINTENANCE. TO MAINTENANCE. OVER.",
  'MAINTENANCE, DO YOU COPY? ...I KNOW YOU COPY. I CAN SEE YOU FROM HERE. OVER.',
];
/** Stuck, and still going: the monologue (he never shuts up). */
export const ARTIE_STUCK = [
  "SO WHILE WE WAIT, A LITTLE ABOUT ME. I'VE WORKED HERE ELEVEN YEARS. I WAS GOING TO BE A VETERINARIAN.",
  "THIS SUIT? COMPANY ISSUE. IT'S MADE OF THE SAME STUFF AS A SHOWER CURTAIN. IT DOESN'T BREATHE. NEITHER DO I, IN IT.",
  "THE HAT IS PLASTIC. IT CRACKED IN 2019. THEY SAID TAPE IT. I TAPED IT.",
  "MY BROTHER WOULD'VE LOVED THIS. HIM STUCK IN A BOAT WITH NO WAY OUT. LOVED IT.",
  'YOU KNOW WHAT THE WORST PART OF THIS JOB IS? EVERYTHING. EVERYTHING IS THE WORST PART.',
  "THEY TELL US NEVER BREAK CHARACTER. I'M NOT IN CHARACTER. THIS IS JUST ME. THIS IS WHO I AM NOW.",
  "SEE THAT ROCK? THAT ROCK HAS A NAME. IT'S GERALD. I TALK TO GERALD ON SLOW DAYS.",
  'WE GET ABOUT FOUR HUNDRED GUESTS AN HOUR. MOST OF THEM ARE BETTER THAN YOU. NO OFFENSE.',
  "I'D SING, BUT LAST TIME A GUEST JUMPED OUT. ...I'M NOT SAYING ANYTHING. I'M JUST SAYING.",
  "ANYWAY. THE JUNGLE. VERY DANGEROUS. LOTS OF... TREES. I'VE RUN OUT OF JUNGLE. I'M GOING TO START OVER.",
];
/** Meathead, stuck in the boat with him (as the pool goes round: a hint he could just swim for it). */
export const MEATHEAD_STUCK = ['I COULD SWIM FOR IT.', 'HOW DEEP IS THIS WATER.', "I'M GONNA DIE IN THIS BOAT.", 'PLEASE STOP TALKING.', 'IS THAT WATER? THAT LOOKS LIKE WATER. I COULD JUST JUMP IN THE WATER.'];
/** He jumps overboard: Artie's not happy about it. */
export const ARTIE_JUMPED = [
  'SIR! SIR, YOU CANNOT EXIT THE BOAT DURING THE RIDE!',
  "OH GREAT. GREAT. THAT'S A WRITE-UP. THAT'S A WRITE-UP FOR ME.",
  'I WASN\'T DONE! I HAD TWENTY MORE MINUTES OF MATERIAL!',
  'FINE! GO! THE PIRANHAS ARE REAL, ASSHOLE!',
];
/** ...and after, alone in the boat, still at it (he can be heard a while yet). */
export const ARTIE_ALONE = [
  'MAINTENANCE, I LOST A GUEST. ...NO, OVERBOARD. ...NO, ON PURPOSE. OVER.',
  'HE DIDN\'T EVEN TIP.',
  "THAT'S FINE. I'LL JUST TALK TO GERALD. RIGHT, GERALD?",
  'NOBODY EVER STAYS FOR THE BACKSIDE OF WATER.',
];
/** Meathead, going over the side. */
export const MEATHEAD_JUMP = ['NOPE.', "I'M OUT.", 'SEE YA, ARTIE.', 'CANNONBALL!'];

// ---------------------------------------------------------------------------------------------------------------
// Under the water

/** Under, and it gets more and more obviously a theme park (said the once each, at each). */
export const MEATHEAD_UNDER = {
  dive: "IT'S DEEPER THAN IT LOOKS.",
  rides: "IS THAT A TEACUP? WHY'S THERE A TEACUP DOWN HERE?",
  rides2: 'THIS IS WHERE RIDES COME TO DIE.',
  dinos: 'DINOSAURS. ...THEY\'RE FAKE. THEY\'RE FAKE, RIGHT?',
  dinos2: 'YEAH, THAT ONE\'S FAKE. IT HAS A PRICE TAG.',
  tank: 'OH HEY. PEOPLE.',
  drain: "WHY'S IT PULLING? WHY'S THE WATER PULLING?",
  sucked: 'OH NO. NO NO NO NO NO.',
};
/** Low on air (once per breath held). */
export const MEATHEAD_AIR = ['NEED AIR. NEED AIR.', 'LUNGS. BURNING.', 'BREATHE. GOTTA BREATHE.'];

/** What hurts him in the water: the voiced hurt callouts and the death screen, by source (the enemy's kind). */
export const HURT = {
  'm2:piranha': {
    hurt: ['PIRANHA! ON MY ASS!', 'IT BIT ME! THE FISH BIT ME!', 'GET OFF MY NIPPLE!', 'TINY TEETH! SO MANY TINY TEETH!'],
    death: ['PICKED CLEAN BY PIRANHAS', 'A SNACK FOR THE FISHES', 'NIBBLED TO THE BONE', 'ALL YOU CAN EAT MEATHEAD'],
  },
  'm2:eel': {
    hurt: ['EEL! ELECTRIC EEL!', 'ZAPPED BY A SNAKE FISH!', 'MY FILLINGS! MY FILLINGS ARE HUMMING!', 'WHY IS THE WATER SPICY!'],
    death: ['ELECTROCUTED BY AN EEL', 'SHOCKED TO DEATH BY A WET NOODLE', 'FRIED IN THE RIVER', 'GOT THE EEL TREATMENT'],
  },
  'm2:snapper': {
    hurt: ['THE PLANT BIT ME!', 'THE SALAD BITES BACK!', 'STUPID CARNIVOROUS WEED!', 'GET YOUR LEAVES OFF ME!'],
    death: ['EATEN BY A PLANT', 'DIGESTED BY SHRUBBERY', 'MURDERED BY A HOUSEPLANT', 'FERTILIZER'],
  },
  'm2:drown': {
    hurt: ['CAN\'T BREATHE!', 'AIR! AIR!', 'GLUB! GLUB!', 'WATER IN MY LUNGS!'],
    death: ['DROWNED IN THE JUNGLE CRUISE', 'FORGOT TO BREATHE', 'SHOULD HAVE STAYED IN THE BOAT', 'GLUB GLUB GLUB'],
  },
} as const;

// ---------------------------------------------------------------------------------------------------------------
// The aquatic dinosaur exhibit: the guests behind the glass

/** As he swims by: clean, in shitty pants (the water's going brown round him), naked. Women and men both say these. */
export const GUESTS_SEE: Record<Dressed, string[]> = {
  clean: [
    'MOM, THERE\'S A MAN IN THE DINOSAUR TANK.',
    'IS HE PART OF THE SHOW?',
    "THAT'S NOT A PLESIOSAUR. THAT'S A GUY.",
    "HE'S BIG. IS HE A MANATEE?",
    "I PAID FORTY DOLLARS FOR THIS AND THERE'S A MAN IN IT.",
    'SOMEBODY CALL A LIFEGUARD. OR A ZOOKEEPER.',
  ],
  shitty: [
    "WHY IS THE WATER GOING BROWN AROUND HIM?",
    "OH GOD. HE'S LEAKING. HE'S LEAKING INTO THE TANK.",
    'IS THAT... IS THAT A DINOSAUR EGG? OH NO. OH NO, IT ISN\'T.',
    'COVER YOUR EYES, KIDS. AND YOUR NOSES. THROUGH THE GLASS, SOMEHOW.',
  ],
  nude: [
    "HE'S NAKED! THERE'S A NAKED MAN IN THE DINOSAUR TANK!",
    'KIDS, DON\'T LOOK. THAT\'S NOT A DINOSAUR.',
    "IS THAT A FISH? ...THAT'S NOT A FISH.",
    'I CAN SEE EVERYTHING. THE GLASS MAGNIFIES IT.',
  ],
};
/** He's killed something in there. */
export const GUESTS_KILL = ['HE KILLED IT! IS THAT PART OF THE SHOW?', 'BEST EXHIBIT IN THE PARK.', 'THE WATER\'S ALL RED NOW. I WANT MY MONEY BACK.', 'DO IT AGAIN!'];

// (everything above, by voice: for the recording)
const flat = (r: Record<string, readonly string[]>) => Object.values(r).flat();
export const VOICE_LINES: Record<string, string[]> = {
  'm2.safari': [...ARTIE_WELCOME, BROTHER.artie1, BROTHER.artie2, BROTHER.artie3, ...ARTIE_TOUR, ...ARTIE_GAS, ...ARTIE_RADIO, ...ARTIE_STUCK, ...ARTIE_JUMPED, ...ARTIE_ALONE],
  meathead: [
    BROTHER.meathead1, BROTHER.meathead2, BROTHER.meathead3, BROTHER.meathead4, ...MEATHEAD_STUCK, ...MEATHEAD_JUMP,
    ...Object.values(MEATHEAD_UNDER), ...MEATHEAD_AIR, ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  'm2.guest': [...flat(GUESTS_SEE), ...GUESTS_KILL],
  'm2.guest2': [...flat(GUESTS_SEE), ...GUESTS_KILL],
};
