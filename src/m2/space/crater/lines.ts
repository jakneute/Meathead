// What's said in the crater section, by voice (recorded with the rest: space/voices.ts gathers these; tools/voices). In
// the user's voice (space-spec.md); pick lines with pickLine; clean / shitty / naked pools where people react to him.
//
// The impact site (the UFO's crash: dead aliens everywhere, the rest running for it), then XENOSCARE (the park's cheap
// haunted spaceship: a derelict alien ship, very much like one from the movies, its signs insist LEGALLY DISTINCT; its
// pre-show host 'm2.space.xeno', its animatronics' canned 'm2.space.boo'). The real aliens ('m2.space.alien',
// 'm2.space.alienf': Zorblax's people) are sore about the ship, and about the ride making them look like violent
// invaders, while being violent invaders; and they take the animatronics over with their mind-control headsets.

export type Dressed = 'clean' | 'shitty' | 'nude';
export type ByPants = Record<Dressed, readonly string[]>;
export const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

// ---- Meathead

/** Walking out into the impact site: the dead all over. */
export const MH_ARRIVE = [
  "AND THAT'S WHY YOU WEAR A SEAT BELT. I DIDN'T. STILL FINE.",
  'GREEN BLOOD EVERYWHERE. LOOKS LIKE A SALAD BAR EXPLODED.',
  "THAT ONE'S HEAD FIRST IN THE DIRT. TEN OUT OF TEN.",
];
/** The first of them running off (some got out alive). */
export const MH_ESCAPEES = [
  "WHERE ARE YOU GOING? I'M NOT DONE WITH YOU.",
  'RUN. IT MAKES IT MORE FUN.',
  'HEY! GET BACK HERE AND DIE LIKE YOUR FRIENDS!',
];
/** Up to the haunted house's front: they ran in there. */
export const MH_HOUSE = [
  'THEY RAN INTO A FAKE SPACESHIP. THEY JUST GOT OUT OF A REAL ONE.',
  "A HAUNTED SPACESHIP? I'M THE SCARIEST THING IN THIS PARK.",
  'XENOSCARE. SOUNDS LIKE A FOOT CREAM.',
];
/** The pre-show's BOO, and him not scared. */
export const MH_BOO: ByPants = {
  clean: ["THAT'S IT? A RUBBER HEAD ON A STICK?", "I'VE BEEN SCARIER ON THE TOILET.", 'BOO YOURSELF, YOU CHEAP PIECE OF SHIT.'],
  shitty: ["DON'T DO THAT. I'M OUT OF ROOM BACK THERE.", 'TOO LATE, BUDDY. I ALREADY SHIT MYSELF.', "GO AHEAD. SCARE IT OUT OF ME. THERE'S NOTHING LEFT."],
  nude: ["BOO? I'M NAKED IN THE DARK. I'M THE SCARY ONE.", 'YOU POP OUT AT A NAKED GUY, YOU GET WHAT YOU SEE.', 'NICE TRY. I GOT NOTHING ON TO SHIT IN.'],
};
/** One of the animatronics popping out at him along the way (now and then). */
export const MH_JUMPSCARE = [
  'GOD DAMN IT.',
  'FUCK OFF, RUBBER BOY.',
  "THAT ONE GOT ME. I'M GONNA BREAK IT.",
  'WHO PAYS FOR THIS SHIT?',
];

// ---- The real aliens

/** Coming for him at the impact site (sore about the ship). */
export const CRASH_BARK: ByPants = {
  clean: [
    "IT'S THE 'LADIES' GUY! KILL HIM!",
    'YOU BLEW UP OUR SHIP! WE JUST HAD IT DETAILED!',
    'MY WHOLE CREW IS DEAD! I HATED THEM, BUT STILL!',
    'YOU KILLED ZORBLAX AND NOW YOU KILLED THE BUS!',
  ],
  shitty: [
    "IT'S THE 'LADIES' GUY! HE SHIT IN OUR SHIP!",
    'YOU BLEW UP OUR SHIP AND IT STILL SMELLS BETTER THAN YOU!',
    'MY WHOLE CREW IS DEAD! THE LAST THING THEY SMELLED WAS YOU!',
    'WE PROBE HUMANS! WE ARE NOT PROBING THAT!',
  ],
  nude: [
    "IT'S THE 'LADIES' GUY! NOBODY WANTED TO SEE THAT!",
    'YOU BLEW UP OUR SHIP! AND YOU CAME OUT NAKED?!',
    'MY WHOLE CREW IS DEAD! THEY DIED LOOKING AT YOUR DICK!',
    'WE ABDUCTED YOU WITH PANTS! WHERE ARE THE PANTS?!',
  ],
};
/** The ones getting away, running for the haunted house. */
export const FLEE: ByPants = {
  clean: ["RUN! IT'S HIM!", 'EVERY ALIEN FOR HIMSELF!', 'HIDE IN THE SPACESHIP RIDE! NOBODY GOES IN THERE!'],
  shitty: ["RUN! IT'S HIM! AND THE SMELL!", 'EVERY ALIEN FOR HIMSELF! HOLD YOUR NOSE!', "HIDE IN THE SPACESHIP RIDE! IT CAN'T SMELL WORSE!"],
  nude: ["RUN! IT'S HIM! THE NAKED ONE!", "EVERY ALIEN FOR HIMSELF! DON'T LOOK DOWN!", "HIDE IN THE SPACESHIP RIDE! IT'S DARK IN THERE! THANK GOD!"],
};
/** Coming for him in the haunted house: the ride makes them look like violent invaders (they're violent invaders). */
export const HOUSE_BARK: ByPants = {
  clean: [
    "THIS RIDE SAYS WE'RE VIOLENT INVADERS! I'M GONNA KILL WHOEVER WROTE IT!",
    'WE ARE A PEACEFUL PEOPLE! HOLD STILL WHILE I VAPORIZE YOU!',
    'TEN BILLION OF US AND THEY ONLY SHOW THE PROBING! I PROBED ONE GUY!',
    'STEREOTYPES HURT, EARTHLING! SO DOES THIS!',
    'GREEN SKIN, BIG HEAD, RAY GUN. LAZY WRITING. ACCURATE, BUT LAZY.',
    'THEY MADE US THE BAD GUYS! WE ARE THE BAD GUYS, BUT STILL!',
    "MY MOTHER CAME HERE FOR THIS RIDE. SHE CRIED. THEN SHE ATE A KID.",
    'NOT EVERY ALIEN WANTS YOUR PLANET! I DO. BUT NOT EVERY ALIEN!',
  ],
  shitty: [
    'THIS RIDE SAYS WE SMELL BAD! HAVE THEY MET YOU?!',
    'WE ARE A PEACEFUL PEOPLE! BUT YOU STINK! SO DIE!',
    'THEY SAY WE PROBE HUMANS! NOT THAT ONE! NOT TODAY!',
    'STEREOTYPES HURT, EARTHLING! SO DOES THAT SMELL!',
    "THEY SAY ALIENS LEAVE SLIME TRAILS! WHAT'S YOUR EXCUSE?!",
    'THEY MADE US THE MONSTERS! YOU SHIT YOURSELF IN A SPACESHIP!',
    'MY MOTHER CAME HERE FOR THIS RIDE. EVEN SHE NEVER SMELLED THIS BAD.',
    "INVADE YOUR PLANET?! NOT IF IT SMELLS LIKE YOU!",
  ],
  nude: [
    "THIS RIDE SAYS WE ABDUCT PEOPLE NAKED! WE DIDN'T DO YOU!",
    "WE ARE A PEACEFUL PEOPLE! PUT ON PANTS AND I'LL VAPORIZE YOU!",
    "THEY SAY WE PROBE HUMANS! NOBODY'S PROBING THAT!",
    'STEREOTYPES HURT, EARTHLING! COVER YOURSELF!',
    'GREEN SKIN, BIG HEAD, RAY GUN. AT LEAST WE WEAR SOMETHING.',
    'THEY MADE US THE CREEPS! YOU WALKED IN HERE WITH YOUR DICK OUT!',
    'MY MOTHER CAME HERE FOR THIS RIDE. SHE WOULD HAVE LEFT AT YOU.',
    'NOT EVERY ALIEN WANTS YOUR PLANET! NOBODY WANTS WHAT YOU GOT!',
  ],
};
/** An operator (a mind-control headset on) taking one of the animatronics over: the irony's lost on him. */
export const HIJACK = [
  "OKAY. BUT THAT ONE'S JUSTIFIED.",
  "SEE? NOW IT'S ACCURATE.",
  "WE DON'T LOOK LIKE THAT. BUT WE KILL LIKE THAT.",
  'I HATE ITS STUPID HEAD. BUT IT WORKS FOR ME NOW.',
  'FINE. YOU WANT A SCARY ALIEN? HERE.',
];
/** An animatronic popping out near one of them: sore about it (it's the ride, not him). */
export const GRIPE = [
  'SEE?! THAT RIGHT THERE IS WHY NOBODY LIKES US!',
  "WE DON'T SAY BOO! WE SAY SURRENDER YOUR PLANET!",
  "THAT'S SUPPOSED TO BE US?! WE DON'T HAVE ANTENNAS!",
  'WHO DESIGNED THIS SHIT?! THE EYES ARE HUGE!',
  "I'M WRITING A LETTER TO MANAGEMENT! THEN I'M KILLING MANAGEMENT!",
  'RUBBER?! WE ARE NOT MADE OF RUBBER! MOSTLY.',
  'IT HAS FIVE FINGERS! WHO HAS FIVE FINGERS?! DISGUSTING!',
  'THEY GAVE IT A CAPE! WE HAVE NEVER WORN A CAPE!',
  'THAT ONE LOOKS LIKE MY UNCLE. I HATE IT.',
];

// ---- XENOSCARE: the pre-show's host (recorded, cheesy, ominous) and the animatronics' canned BOOs

/** The first animatronic that comes for him for real. */
export const MH_HIJACK = [
  'THE RUBBER ONES ARE FIGHTING NOW?!',
  'OH, COME ON. THE PROPS TOO?',
  'GREAT. NOW THE DECORATIONS WANT ME DEAD.',
];
export const XENO_WELCOME = [
  'WELCOME ABOARD XENOSCARE, A LEGALLY DISTINCT DERELICT SPACESHIP. PLEASE REMAIN SEATED. THERE ARE NO SEATS.',
  'GREETINGS, CREW. YOU HAVE BEEN CHOSEN. BY BUYING A TICKET. ANY RESEMBLANCE TO A MOVIE IS A COINCIDENCE.',
];
export const XENO_TELEPORT = [
  'PREPARE FOR TELEPORTATION TO THE ALIEN MOTHERSHIP. DO NOT BE ALARMED. BE A LITTLE ALARMED.',
  'TELEPORTATION BEGINNING. PLEASE REMOVE ALL METAL, PACEMAKERS AND CHILDREN.',
];
export const XENO_ARRIVED = [
  'TELEPORTATION COMPLETE. WELCOME TO THE MOTHERSHIP. IT LOOKS A LOT LIKE THE ROOM YOU WERE IN.',
  'YOU HAVE ARRIVED. THE ALIENS ARE VIOLENT INVADERS. THE QUEEN IS LEGALLY DISTINCT. EXIT TO YOUR RIGHT.',
];
export const BOO = ['BOO!', 'BOOOOO!', 'WE COME IN PEACE! BOO!', 'EARTHLING! BOO!', 'TAKE ME TO YOUR LEADER! BOO!', 'PROBE TIME! BOO!'];

// ---- What he says when each of theirs hurts him, and the death screen

export const HURT_GRUNT = ['THE FROG GUY PUNCHED ME!', 'GET YOUR SLIMY FIST OUT OF MY FACE!', "THAT'S ASSAULT, YOU UGLY BULLFROG!"];
export const DEATH_GRUNT = ['BEATEN BY A BULLFROG', 'PUNCHED OUT OF THE GALAXY', 'SLIMED'];
export const HURT_LASER = ['OW! LASER! RIGHT IN THE NIPPLE!', 'QUIT ZAPPING ME, YOU PEG-TOOTHED FUCK!', "THAT'S A ZORBLAX GUN! I KNOW THAT GUN!"];
export const DEATH_LASER = ['VAPORIZED', 'ZAPPED', 'PINK BEAM OF DEATH'];
export const HURT_BRUTE = ['THE BIG ONE HITS LIKE A TRUCK!', "THAT ONE'S BEEN DOING PUSH-UPS!", 'OW! FROG HAMMER!'];
export const DEATH_BRUTE = ['CLOBBERED BY A MEGAFROG', 'FLATTENED BY THE BIG ONE', 'BEATEN DOWN'];
export const HURT_SPIKES = ['SPIKES ON HIS HEAD! WHO DOES THAT?!', 'I STOMPED A PINEAPPLE!', 'RIGHT THROUGH THE FOOT!'];
export const DEATH_SPIKES = ['SKEWERED', 'STOMPED A SPIKE HELMET', 'SHISH KEBAB'];
export const HURT_CRAWLER = ['THE HALF GUY BIT MY ANKLE!', 'GET OFF ME, YOU HALF-ASSED FUCK!', "IT'S HALF A GUY AND IT STILL BIT ME!"];
export const DEATH_CRAWLER = ['ANKLE-BITTEN BY HALF AN ALIEN', 'DEATH BY HALF', 'GNAWED'];
export const HURT_TRAM = ['THE RIDE HIT ME!', "WHO'S DRIVING THIS?! NOBODY?!", 'KEEP YOUR ARMS INSIDE THE RIDE, MY ASS!'];
export const DEATH_TRAM = ['RUN OVER BY A RIDE', 'HIT BY THE TRAM', 'KEEP ALL LIMBS INSIDE THE VEHICLE'];

export const HURT_PROP = ['THE RUBBER GUY CLAWED ME!', "IT'S ON A SPRING AND IT STILL GOT ME!", 'A PROP! I GOT HIT BY A PROP!'];
export const DEATH_PROP = ['KILLED BY A DECORATION', 'CLAWED BY A PROP', 'BOO'];
export const HURT_SPARK = ['IT SPIT SPARKS AT ME!', "OW! IT'S SHORTING OUT ON MY FACE!", 'ELECTRIC SPIT! IN THE EYE!'];
export const DEATH_SPARK = ['SHORT-CIRCUITED', 'ZAPPED BY A PROP', 'ELECTROCUTED BY A HALLOWEEN DECORATION'];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...MH_ARRIVE, ...MH_ESCAPEES, ...MH_HOUSE, ...all(MH_BOO), ...MH_JUMPSCARE,
    ...MH_HIJACK, ...HURT_GRUNT, ...HURT_LASER, ...HURT_BRUTE, ...HURT_SPIKES, ...HURT_CRAWLER, ...HURT_TRAM, ...HURT_PROP, ...HURT_SPARK,
  ],
  death: [...DEATH_GRUNT, ...DEATH_LASER, ...DEATH_BRUTE, ...DEATH_SPIKES, ...DEATH_CRAWLER, ...DEATH_TRAM, ...DEATH_PROP, ...DEATH_SPARK],
  'm2.space.alien': [...all(CRASH_BARK), ...all(FLEE), ...all(HOUSE_BARK), ...GRIPE, ...HIJACK],
  'm2.space.alienf': [...all(CRASH_BARK), ...all(FLEE), ...all(HOUSE_BARK), ...GRIPE, ...HIJACK],
  'm2.space.xeno': [...XENO_WELCOME, ...XENO_TELEPORT, ...XENO_ARRIVED],
  'm2.space.boo': [...BOO],
};
