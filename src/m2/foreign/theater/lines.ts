// What's said in CULTURES OF THE WORLD, by voice: the show's PA narrator (a smarmy, patriotic showman over the house
// speakers: he introduces each culture and spins it, "...NEAT. BUT NOT AS COOL AS EATING HOT DOGS."), the crowd in the
// seats (somebody shouting, or the whole house chanting), Meathead (sparse, blunt), and what hurts him here (every
// showpiece's attacks, each its own hurt source). Pure data: tools/voices bundles it in node.
//
// The joke is on the clueless Americans and the park: stereotypes for laughs, never slurs or hate. American spelling.
// Pick with pickLine (no line twice inside 45 s). The PA's lines about HIM come in clean / shitty / naked pools.

import { pavilionVoices, type ByPants, type HurtTable } from '../talk';

export const NARRATOR = 'm2.foreign.showpa';
/** The whole house at once (a chant, a boo, an ovation). */
export const CHORUS = 'm2.foreign.crowd';
/** Somebody in the seats (a man, a woman). */
export const GUEST = { m: 'm2.guest2', f: 'm2.guest' } as const;

export type CultureId = 'spain' | 'ireland' | 'egypt' | 'russia' | 'netherlands' | 'australia' | 'greece' | 'brazil';
export const CULTURES: CultureId[] = ['spain', 'ireland', 'egypt', 'russia', 'netherlands', 'australia', 'greece', 'brazil'];
export const CULTURE_NAME: Record<CultureId, string> = {
  spain: 'SPAIN', ireland: 'IRELAND', egypt: 'EGYPT', russia: 'RUSSIA', netherlands: 'THE NETHERLANDS', australia: 'AUSTRALIA', greece: 'GREECE', brazil: 'BRAZIL',
};

// ---------------------------------------------------------------------------------------------------------------
// The narrator

/** Walking into the lobby (once). */
export const PA_LOBBY = [
  'WELCOME TO THE CULTURES OF THE WORLD THEATER! CONCESSIONS ARE AMERICAN ONLY!',
  'WELCOME TO CULTURES OF THE WORLD! THE WHOLE WORLD COMES TO YOU! SO YOU NEVER HAVE TO GO THERE!',
];
/** Into the house, the show about to start (once). */
export const PA_HOUSE = [
  'PLEASE TAKE YOUR SEATS. THE SHOW IS ABOUT TO BEGIN. NO FLASH PHOTOGRAPHY. ALL OTHER PHOTOGRAPHY IS FINE.',
  'FOLKS, PLEASE SILENCE YOUR PHONES. OR DO NOT. FILM ALL OF IT. TAG THE PARK.',
];
/** He's up on the stage: a volunteer (his pants). */
export const PA_VOLUNTEER: ByPants = {
  clean: [
    'OH! WE HAVE A VOLUNTEER FROM THE AUDIENCE! GIVE HIM A HAND!',
    "LOOK AT THAT, FOLKS! A VOLUNTEER! HE'S NOT SUPPOSED TO BE UP THERE, BUT LOOK AT HIM GO!",
  ],
  shitty: [
    "WE HAVE A VOLUNTEER! AND HE'S... OH NO. HE SHAT HIMSELF. GIVE HIM A HAND. DON'T TOUCH HIM.",
    'A VOLUNTEER! FRONT ROW, YOU MAY WANT TO HOLD YOUR NOSE. WE CERTAINLY ARE.',
  ],
  nude: [
    'A VOLUNTEER! A NAKED VOLUNTEER! SIR, THIS IS A FAMILY SHOW!',
    'FOLKS, WE HAVE A VOLUNTEER, AND HE IS NOT WEARING ANYTHING. PHONES DOWN. PHONES DOWN!',
  ],
};
/** The show opens. */
export const PA_OPEN = [
  'LADIES AND GENTLEMEN! CULTURES! OF THE WORLD! THE WHOLE WORLD, ON ONE STAGE! IT WAS CHEAPER!',
  'LADIES AND GENTLEMEN! EIGHT COUNTRIES! ZERO PASSPORTS! CULTURES OF THE WORLD!',
];

/** Each culture, the first time its curtain goes up. */
export const INTRO: Record<CultureId, string[]> = {
  spain: [
    'SPAIN! THE ANCIENT ART OF THE BULLFIGHT! A MAN, A BULL, A CAPE, AND NO SAFETY REGULATIONS!',
    'FROM SPAIN, WHICH IS NEXT TO MEXICO: THE BULLFIGHT!',
  ],
  ireland: [
    'IRELAND! LAND OF STEP DANCING, WHERE YOUR ARMS ARE AGAINST THE LAW!',
    "FROM IRELAND: A LEPRECHAUN AND HIS POT OF GOLD! WE CHECKED. IT'S CHOCOLATE.",
  ],
  egypt: [
    'EGYPT! HOME OF THE PYRAMIDS! WHICH ALIENS BUILT!',
    'FROM ANCIENT EGYPT: A REAL MUMMY! NOT REAL. OUR LAWYERS ASKED US TO SAY NOT REAL.',
  ],
  russia: [
    "RUSSIA! A BEAR ON A UNICYCLE! THAT'S JUST WHAT THEY HAVE OVER THERE!",
    "FROM RUSSIA, WHERE IT'S COLD: COSSACK DANCERS! THEY DANCE SITTING DOWN!",
  ],
  netherlands: [
    'THE NETHERLANDS! OR HOLLAND! OR DUTCH! NOBODY KNOWS! WINDMILLS AND WOODEN SHOES!',
    'FROM THE NETHERLANDS: CLOGS! SHOES MADE OUT OF A WHOLE TREE!',
  ],
  australia: [
    'AUSTRALIA! WHERE EVERYTHING WANTS TO KILL YOU! INCLUDING THIS KANGAROO!',
    'FROM DOWN UNDER: A BOXING KANGAROO AND A CROCODILE! SHRIMP NOT INCLUDED!',
  ],
  greece: [
    'GREECE! THEY INVENTED DEMOCRACY! WE PERFECTED IT! ALSO, A MINOTAUR!',
    "FROM ANCIENT GREECE: SPARTANS! THIS IS SPARTA! IT'S ACTUALLY STAGE FOUR!",
  ],
  brazil: [
    "BRAZIL! IT'S CARNIVAL! IT'S ALWAYS CARNIVAL! THAT'S ALL THEY DO DOWN THERE!",
    'FROM BRAZIL: THE SAMBA! AND A GIANT PARROT! THE PARROT IS LOAD-BEARING!',
  ],
};
/** Each culture coming round again (it ran out his clock last time). */
export const RETURN: Record<CultureId, string[]> = {
  spain: ['SPAIN IS BACK! THE BULL HAS UNION PROTECTION!', 'SPAIN AGAIN! THE BULL REFUSES TO RETIRE!'],
  ireland: ['IRELAND AGAIN! THE DANCERS NEVER STOP! WE CANNOT FIND THE SWITCH!', "THE LEPRECHAUN IS BACK! HE WANTS HIS GOLD BACK TOO!"],
  egypt: ['EGYPT RETURNS! LIKE A CURSE! IT IS A CURSE!', 'THE MUMMY IS BACK! MUMMIES ALWAYS COME BACK! THAT IS THEIR WHOLE THING!'],
  russia: ['RUSSIA IS BACK! THE BEAR HAS NO BRAKES!', 'RUSSIA AGAIN! THEY ARE STILL SQUATTING!'],
  netherlands: ['THE NETHERLANDS AGAIN! THE WINDMILL HAS BEEN SPINNING THIS WHOLE TIME!', 'BACK TO HOLLAND! OR DUTCH! STILL NOT SURE!'],
  australia: ['AUSTRALIA AGAIN! THE KANGAROO WANTS A REMATCH!', 'BACK DOWN UNDER! THE CROC IS HUNGRY! WE FORGOT TO FEED IT! IT IS A ROBOT!'],
  greece: ['GREECE IS BACK! THE SPARTANS DO NOT RETREAT! THEY JUST WENT BEHIND THE CURTAIN!', 'THE MINOTAUR RETURNS! HALF BULL! HALF GUY! ALL UNION!'],
  brazil: ['BRAZIL AGAIN! CARNIVAL NEVER ENDS!', 'THE PARROT IS BACK! THE PARROT IS ALWAYS BACK!'],
};
/** The spin, after every introduction: the culture's fine, America's better. */
export const SPIN = [
  'NEAT. BUT NOT AS COOL AS EATING HOT DOGS.',
  'NEAT. BUT NOT AS COOL AS A MONSTER TRUCK.',
  'NEAT. BUT NOT AS COOL AS A FOUR-DOLLAR HAMBURGER.',
  'NEAT. BUT NOT AS COOL AS FIREWORKS YOU BOUGHT ACROSS STATE LINES.',
  'NEAT. BUT NOT AS COOL AS A BALD EAGLE.',
  'NEAT. BUT NOT AS COOL AS TRUCK NUTS.',
  'CUTE. BUT NOT AS COOL AS A FORTY-FOUR-OUNCE SODA.',
  'SURE. BUT NOT AS COOL AS FOOTBALL. THE REAL ONE. WITH THE HANDS.',
  'NEAT. BUT NOT AS COOL AS A DRIVE-THROUGH. FOR ANYTHING.',
  'NEAT. BUT NOT AS COOL AS FREE REFILLS.',
  'FINE. BUT NOT AS COOL AS A GUN SHOW.',
  'NEAT. BUT NOT AS COOL AS DEEP-FRYING A TURKEY IN YOUR GARAGE.',
  'NEAT. BUT NOT AS COOL AS A PICKUP TRUCK YOU NEVER PUT ANYTHING IN.',
  'NEAT. BUT NOT AS COOL AS THE MOON. WE WENT THERE. ONLY US.',
  'NEAT. BUT NOT AS COOL AS CHEESE IN A SPRAY CAN.',
  'OKAY. BUT NOT AS COOL AS A HALFTIME SHOW.',
  'OKAY. BUT NOT AS COOL AS MEASURING THINGS IN FEET.',
  'NEAT. BUT NOT AS COOL AS A RECLINER WITH A CUP HOLDER.',
  'NEAT. BUT NOT AS COOL AS A BIGGER ONE OF THAT. WHICH WE HAVE.',
  'NEAT. BUT NOT AS COOL AS FIREWORKS. ON ANY DAY. FOR ANY REASON.',
];
/** All of one showpiece dead. */
export const CANCEL: Record<CultureId, string[]> = {
  spain: ['SPAIN: CANCELED.', 'THAT IS ALL FOR SPAIN. FOREVER. OLAY, I GUESS.'],
  ireland: ['IRELAND: CANCELED.', 'IRELAND IS OUT OF LUCK. AND OUT OF LEPRECHAUNS.'],
  egypt: ['EGYPT: CANCELED.', 'EGYPT HAS BEEN RETURNED TO THE TOMB. PERMANENTLY.'],
  russia: ['RUSSIA: CANCELED.', 'RUSSIA IS DOWN. THE BEAR HAS LEFT THE UNICYCLE.'],
  netherlands: ['THE NETHERLANDS: CANCELED.', 'HOLLAND, DUTCH, WHATEVER IT WAS: CANCELED.'],
  australia: ['AUSTRALIA: CANCELED.', 'AUSTRALIA IS DOWN AND OUT. AND UNDER.'],
  greece: ['GREECE: CANCELED.', 'GREECE HAS FALLEN. AGAIN. HISTORY, FOLKS.'],
  brazil: ['BRAZIL: CANCELED.', 'CARNIVAL IS OVER. FIRST TIME EVER.'],
};
/** He's hurt (now and then): about him (his pants). */
export const PA_HURT: ByPants = {
  clean: [
    'OOH! AND HE PAID FOR A TICKET!',
    "THAT'S GOTTA HURT! THE ANIMATRONICS ARE FULLY INSURED! HE IS NOT!",
    'FOLKS, THE VOLUNTEER IS BLEEDING. THAT IS NOT PART OF THE SHOW. IT IS NOW.',
  ],
  shitty: [
    'OOH! AND HE CANNOT AFFORD TO LOSE ANY MORE OF ANYTHING!',
    'HE TOOK A HIT! AND, I THINK, ANOTHER SHIT!',
  ],
  nude: [
    'OOH! RIGHT IN THE EVERYTHING!',
    'FOLKS, THERE IS NOTHING PROTECTING HIM. NOTHING AT ALL.',
  ],
};
/** A showpiece's clock ran out: the curtain's coming down on it (his pants). */
export const PA_TIMEOUT: ByPants = {
  clean: [
    "TIME'S UP! LET'S SEE WHAT ELSE THE WORLD'S GOT!",
    "AND THAT'S TIME! OUR VOLUNTEER COULDN'T FINISH THEM! THEY'LL BE BACK!",
  ],
  shitty: [
    "TIME'S UP! AND WE'RE OPENING THE DOORS FOR SOME AIR!",
    'TIME! STAGEHANDS, BRING A MOP.',
  ],
  nude: [
    'TIME! SIR, THE CURTAIN IS NOT FOR YOU. DO NOT HIDE BEHIND THE CURTAIN.',
    "TIME'S UP! SOMEBODY THROW HIM A TOWEL!",
  ],
};
/** Four showpieces down (his pants). */
export const PA_HALF: ByPants = {
  clean: ["HALFWAY THROUGH THE WORLD, FOLKS! AND WE'VE LOST HALF THE WORLD!"],
  shitty: ['HALFWAY THROUGH! AND HE IS HALFWAY THROUGH HIS PANTS!'],
  nude: ['HALFWAY THROUGH! FRONT ROW, YOU CAN OPEN YOUR EYES. NO. CLOSE THEM.'],
};
/** The curtain call (his pants). */
export const PA_WRAP: ByPants = {
  clean: [
    "THAT'S OUR SHOW! THE WHOLE WORLD, FOLKS! ALL OF IT DEAD! GIVE IT UP FOR AMERICA!",
    'AND THAT IS THE WORLD! NOT AS COOL AS AMERICA! AS PROVEN TONIGHT, ON STAGE, WITH VIOLENCE!',
  ],
  shitty: [
    "THAT'S OUR SHOW! A STANDING OVATION FOR THE MAN WHO SHAT THROUGH THE WHOLE WORLD!",
    'THE WORLD IS DEAD, AND IT SMELLS LIKE IT! GOODNIGHT!',
  ],
  nude: [
    "THAT'S OUR SHOW! GIVE IT UP FOR OUR NAKED VOLUNTEER! ACTUALLY, DON'T. KEEP YOUR HANDS WHERE WE CAN SEE THEM.",
    'THE WORLD IS DEAD! AND SO IS MODESTY! GOODNIGHT, AMERICA!',
  ],
};
/** The way out, after the call. */
export const PA_EXIT = [
  'PLEASE EXIT STAGE RIGHT TO HELICOPTER RIDES ACROSS THE WORLD. WHAT IS LEFT OF IT.',
  'THE EXIT IS STAGE RIGHT. THE HELICOPTERS ARE WAITING. TIP YOUR PILOT.',
];

// ---------------------------------------------------------------------------------------------------------------
// Meathead (sparse, blunt)

export const MH_LOBBY = ["FREEDOM FRIES. TWELVE DOLLARS. THEY'RE JUST FRIES.", 'A WHOLE THEATER FOR ROBOTS. I HATE IT ALREADY.'];
export const MH_HOUSE = ['A ROBOT SHOW. GREAT. A ROBOT SHOW.', "THE WHOLE CROWD'S FILMING. NOBODY'S EVEN WATCHING."];
export const MH_VOLUNTEER = ["I'M NOT A VOLUNTEER. I'M CUTTING THROUGH.", "I'M JUST WALKING THROUGH. START YOUR SHOW. I DON'T CARE."];
/** The first time each culture's curtain goes up. */
export const MH_FIRST: Record<CultureId, string[]> = {
  spain: ['A ROBOT BULL. SURE. WHY NOT.', "THE MATADOR'S A ROBOT TOO. NOBODY'S EVEN TRYING."],
  ireland: ["THEIR ARMS DON'T MOVE. THAT'S THE WHOLE DANCE?", 'A LEPRECHAUN THROWING MONEY. I WANT THAT MONEY.'],
  egypt: ['A MUMMY. AND A CAT WITH A GUY FOR A HEAD.', "THE SPHINX'S EYES ARE GLOWING. THAT'S NEVER GOOD."],
  russia: ['A BEAR ON A UNICYCLE. OKAY. THAT ONE IS PRETTY COOL.', "THOSE GUYS ARE DANCING SITTING DOWN."],
  netherlands: ['A WINDMILL. INDOORS. SPINNING. GREAT IDEA.', 'MILK MAIDS. THROWING THEIR SHOES.'],
  australia: ['A KANGAROO WITH BOXING GLOVES. FINALLY, A FAIR FIGHT.', "THE GUY'S HOLDING THE CROC BY THE TAIL. THAT'S HIS WHOLE JOB."],
  greece: ['A COW MAN WITH AN AXE.', 'THE SPARTANS ARE HIDING BEHIND THEIR SHIELDS. PUSSIES.'],
  brazil: ['SAMBA LADIES. AND A PARROT THE SIZE OF A TRUCK.', 'A PARADE FLOAT. INDOORS. THIS PLACE IS INSANE.'],
};
/** A showpiece cancelled (now and then). */
export const MH_KILL = ['NEXT.', 'CANCELED. GOOD.', 'ONE LESS COUNTRY.', 'BLEEDING. THE ROBOTS ARE BLEEDING. WHATEVER.'];
/** Its clock ran out on him (now and then). */
export const MH_TIMEOUT = ["HEY! I WASN'T DONE!", "GET BACK HERE! I'M NOT FINISHED KILLING YOU!"];
/** The curtain call. */
export const MH_CALL = ["I DIDN'T VOLUNTEER. BUT YOU'RE WELCOME.", "A BOW? FINE. THERE. NOW WHERE'S THE HELICOPTER?"];

// ---------------------------------------------------------------------------------------------------------------
// The crowd

/** The whole house: cheering a kill. */
export const CHANT_CHEER = ['USA! USA! USA!', 'WOOOOO!', 'AGAIN! AGAIN!', 'KILL IT! KILL IT! KILL IT!'];
/** The whole house: booing a showpiece that got away. */
export const CHANT_BOO = ['BOOOOO!', 'BOO! YOU SUCK!', 'REFUND! REFUND!'];
/** The whole house, at a bull charge he's dodged. */
export const CHANT_OLE = ['OLAY!', 'OH-LAY!'];
/** The whole house, standing, at the end. */
export const CHANT_OVATION = ['ENCORE! ENCORE!', 'USA! USA! USA!'];
/** Somebody in the seats, about him (his pants). */
export const GUEST_HIM: ByPants = {
  clean: [
    'IS HE PART OF THE SHOW?',
    'KILL THE BULL! KILL ALL OF THEM!',
    'THIS IS BETTER THAN THE ACTUAL SHOW!',
    'I PAID FORTY DOLLARS FOR THIS AND IT WAS WORTH IT!',
    'MOM, IS THAT GUY ALLOWED UP THERE?',
  ],
  shitty: [
    'WHAT IS THAT SMELL? IS THAT HIM?',
    "HE SHIT HIMSELF! THAT'S NOT IN THE PROGRAM!",
    'I CAN SMELL HIM FROM ROW K!',
  ],
  nude: [
    "HE'S NAKED! MOM! MOM, HE'S NAKED!",
    "I'M GETTING THIS ON VIDEO! EVERYBODY GET IT ON VIDEO!",
    'SIR! THERE ARE CHILDREN HERE! THEY LOVE IT, BUT STILL!',
  ],
};
/** Somebody in the seats, at a kill. */
export const GUEST_KILL = [
  "DID YOU SEE THAT? IT'S BLEEDING! ROBOTS BLEED!",
  'TAKE THAT, EUROPE!',
  "THAT WAS FOREIGN! KILL IT!",
  'BEST SHOW IN THE PARK!',
  'THAT ONE WAS MY FAVORITE! KILL IT ANYWAY!',
];
/** Somebody in the seats, laughing at him getting hit. */
export const GUEST_HURT = ['HAHAHA! HE GOT HIT!', 'OOH! I GOT THAT ON VIDEO!', 'DO IT AGAIN! HIT HIM AGAIN!'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him (each showpiece's attacks, each its own source)

export const HURT: HurtTable = {
  'm2:fl_th_bull': {
    hurt: ['THE BULL GORED ME! THE ROBOT BULL!', 'OW! RIGHT IN THE ASS! WITH A HORN!', 'THAT BULL HAS A MOTOR IN IT!'],
    death: ['GORED BY A ROBOT BULL', 'OLAY'],
  },
  'm2:fl_th_matador': {
    hurt: ['THE MATADOR STABBED ME!', 'OW! THE LITTLE SWORD!', 'HE STABBED ME THROUGH HIS CAPE!'],
    death: ['RUN THROUGH BY A ROBOT IN TIGHTS', 'STABBED. THE CROWD WENT OLAY.'],
  },
  'm2:fl_th_kick': {
    hurt: ['THE DANCERS KICKED ME! ALL OF THEM AT ONCE!', 'OW! THE RIVER KICK!', "THEIR ARMS DON'T MOVE BUT THEIR LEGS SURE DO!"],
    death: ['STEP DANCED TO DEATH', 'KICKED IN PERFECT UNISON'],
  },
  'm2:fl_th_coin': {
    hurt: ['GOLD COINS! IN MY FACE!', "OW! THE LEPRECHAUN'S PELTING ME!", "THE LITTLE BASTARD'S THROWING MONEY!"],
    death: ['PELTED TO DEATH WITH GOLD', 'DIED FOR THE GOLD'],
  },
  'm2:fl_th_bandage': {
    hurt: ['THE MUMMY WHIPPED ME!', 'OW! BANDAGES! DIRTY BANDAGES!', 'IT YANKED ME! WITH ITS WRAPS!'],
    death: ['WHIPPED BY A MUMMY', 'ALL WRAPPED UP'],
  },
  'm2:fl_th_laser': {
    hurt: ['THE SPHINX HAS LASERS!', 'OW! EYE LASERS! WHY DOES IT HAVE EYE LASERS?', 'MY LEGS ARE ON FIRE!'],
    death: ['LASERED BY A SPHINX', 'THE ANSWER TO THE RIDDLE WAS LASERS'],
  },
  'm2:fl_th_bear': {
    hurt: ['THE BEAR RAN ME OVER! ON A UNICYCLE!', 'OW! ONE WHEEL! RIGHT OVER ME!', 'SOMEBODY TAKE THAT BEAR OFF THE ROAD!'],
    death: ['RUN DOWN BY A BEAR ON A UNICYCLE', 'ROADKILL. FOR A BEAR.'],
  },
  'm2:fl_th_cossack': {
    hurt: ['THE SQUATTING GUY KICKED ME!', 'OW! RIGHT IN THE KNEE!', 'HOW DO THEY KICK FROM DOWN THERE?'],
    death: ['KICKED TO DEATH BY A SQUATTING ROBOT', 'DANCED ON'],
  },
  'm2:fl_th_windmill': {
    hurt: ['THE WINDMILL HIT ME!', 'OW! THE BLADES! THE BLADES!', 'WHO PUTS A WINDMILL INDOORS?'],
    death: ['WINDMILLED', 'SWATTED BY A DUTCH FAN'],
  },
  'm2:fl_th_clog': {
    hurt: ['A CLOG! RIGHT IN THE HEAD!', 'OW! A WOODEN SHOE!', 'STOP THROWING YOUR SHOES!'],
    death: ['CLOGGED', 'KILLED BY A SHOE MADE OF A TREE'],
  },
  'm2:fl_th_kangaroo': {
    hurt: ['THE KANGAROO PUNCHED ME!', 'OW! IT KICKED ME WITH BOTH FEET!', "IT'S GOT GLOVES ON! THAT'S CHEATING!"],
    death: ['KNOCKED OUT BY A KANGAROO', 'TKO. ROUND ONE.'],
  },
  'm2:fl_th_croc': {
    hurt: ['THE CROC BIT ME!', "OW! MY LEG! IT'S GOT MY LEG!", 'GET IT OFF! GET THE CROC OFF!'],
    death: ['EATEN BY A ROBOT CROC', 'DEATH ROLLED'],
  },
  'm2:fl_th_boomerang': {
    hurt: ['A BOOMERANG! IT CAME BACK!', 'OW! IT GOT ME ON THE WAY BACK!', 'STOP THROWING THAT STICK!'],
    death: ['BOOMERANGED', 'IT CAME BACK FOR ME'],
  },
  'm2:fl_th_minotaur': {
    hurt: ['THE COW MAN HIT ME!', 'OW! THE AXE! THE BIG AXE!', 'HALF BULL, HALF GUY, ALL ASSHOLE!'],
    death: ['AXED BY A MINOTAUR', 'LOST IN THE LABYRINTH'],
  },
  'm2:fl_th_spear': {
    hurt: ['SPEARS! OVER THE SHIELDS!', 'OW! THEY POKED ME!', 'THIS IS SPARTA! OW!'],
    death: ['SPEARED BY SPARTANS', 'CARRIED OUT ON A SHIELD'],
  },
  'm2:fl_th_samba': {
    hurt: ['THE SAMBA LADY SPUN INTO ME!', 'OW! FEATHERS! FEATHERS IN MY EYE!', 'SHE HIP CHECKED ME!'],
    death: ['SAMBAED TO DEATH', 'KILLED AT CARNIVAL'],
  },
  'm2:fl_th_parrot': {
    hurt: ['THE PARROT FLOAT RAN ME OVER!', 'OW! THE BEAK! THE GIANT BEAK!', 'POLLY WANTS ME DEAD!'],
    death: ['RUN OVER BY A PARADE', 'PECKED BY A PARROT THE SIZE OF A HOUSE'],
  },
};

const ALL = (r: Record<string, string[]>) => Object.values(r).flat();
const pants = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

export const VOICE_LINES = pavilionVoices({ pa: { clean: [], shitty: [], nude: [] }, arrive: [], gags: [] }, HURT, [], {
  meathead: [...MH_LOBBY, ...MH_HOUSE, ...MH_VOLUNTEER, ...ALL(MH_FIRST), ...MH_KILL, ...MH_TIMEOUT, ...MH_CALL],
  [NARRATOR]: [
    ...PA_LOBBY, ...PA_HOUSE, ...pants(PA_VOLUNTEER), ...PA_OPEN, ...ALL(INTRO), ...ALL(RETURN), ...SPIN, ...ALL(CANCEL),
    ...pants(PA_HURT), ...pants(PA_TIMEOUT), ...pants(PA_HALF), ...pants(PA_WRAP), ...PA_EXIT,
  ],
  [CHORUS]: [...CHANT_CHEER, ...CHANT_BOO, ...CHANT_OLE, ...CHANT_OVATION],
  [GUEST.m]: [...pants(GUEST_HIM), ...GUEST_KILL, ...GUEST_HURT],
  [GUEST.f]: [...pants(GUEST_HIM), ...GUEST_KILL, ...GUEST_HURT],
});
