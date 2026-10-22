// What's said in the castle (by voice: spooky/voices.ts gathers these for the voice pack). The PA is "Dracula" (it's
// Donnie, the boss, in his control room, doing a fake accent: 'm2.donnie.pa'): every one of his line groups three ways,
// clean / shitty pants / naked, each the same size. A room's story is said in order, line by line; a quip is one of its
// pool. Meathead has his say back after each story. The hurt and death lines are registered in staff.ts and index.ts.
// He's eating the whole tour (his sin's gluttony): crunching and slurping into the mic, losing his place for a bite,
// the food creeping into his script. A *CRUNCH*, *SLURP*, *GULP* is shown but never said: it plays as the real sound,
// at its place in the line, out of the speakers (m1 platform/cues.ts).

export type Dressed = 'clean' | 'shitty' | 'nude';
export type ByPants = Record<Dressed, readonly string[]>;
export const PA = 'm2.donnie.pa';

// ---------------------------------------------------------------------------------------------------------------
// The PA: the greeting, in the foyer

export const PA_GREET: ByPants = {
  clean: [
    '*SLURP*. AHEM. GOOD EVENINK. I AM DRACULA. YES, THE REAL VUN. SHUT YOUR MOUTH. I AM EATING.',
    'SURVIVE MY HOME AND I VILL SEE YOU IN THE BALLROOM. *CRUNCH*. VIPE YOUR FEET.',
  ],
  shitty: [
    '*SLURP*. AHEM. GOOD EVENINK. I AM DRACULA. YOU SMELL LIKE A GREYHOUND TOILET. I AM EATING.',
    'SURVIVE MY HOME AND I VILL SEE YOU IN THE BALLROOM. *CRUNCH*. DO NOT SIT ON MY VELVET.',
  ],
  nude: [
    '*SLURP*. AHEM. GOOD EVENINK. I AM DRACULA. VHY IS YOUR DICK IN MY FOYER? I AM EATING.',
    'SURVIVE MY HOME AND I VILL SEE YOU IN THE BALLROOM. *CRUNCH*. IT IS BLACK TIE, ASSHOLE.',
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// The PA: each room's story (the tour), said in order as he comes into it

export type RoomId = 'foyer' | 'dining' | 'study' | 'kitchen' | 'bedroom' | 'nursery' | 'gallery';

// (one line a room. All three ways tell the same story, so Meathead's say back fits whichever he heard; then the dig,
// the room's threat as often as not)
export const PA_STORY: Record<Exclude<RoomId, 'foyer'>, ByPants> = {
  dining: {
    clean: ['*CRUNCH*. THE DINING ROOM. FORTY GUESTS ATE BAD SHRIMP HERE AND SHIT THEMSELVES TO DEATH. MORE SHRIMP FOR ME. VATCH THE CHANDELIERS.'],
    shitty: ['*CRUNCH*. THE DINING ROOM. FORTY GUESTS ATE BAD SHRIMP HERE AND SHIT THEMSELVES TO DEATH. I SEE YOU HAD THE SHRIMP. I HAD SECONDS.'],
    nude: ['*CRUNCH*. THE DINING ROOM. FORTY GUESTS ATE BAD SHRIMP HERE AND SHIT THEMSELVES TO DEATH. GET YOUR BALLS OFF MY TABLE. I EAT THERE.'],
  },
  study: {
    clean: ['THE LIBRARY. DOCTOR ABERNATHY READ THE... *CHEW CHEW*... VHERE VAS I. THE TERMS AND CONDITIONS. ELEVEN YEARS. HE DIED A VIRGIN.'],
    shitty: ['THE LIBRARY. DOCTOR ABERNATHY READ THE... *CHEW CHEW*... VHERE VAS I. THE TERMS AND CONDITIONS. ELEVEN YEARS. HE NEVER SHIT HIMSELF. NOT EVEN A LITTLE.'],
    nude: ['THE LIBRARY. DOCTOR ABERNATHY READ THE... *CHEW CHEW*... VHERE VAS I. THE TERMS AND CONDITIONS. ELEVEN YEARS. COVER YOUR DICK VITH A BOOK. A SMALL VUN.'],
  },
  kitchen: {
    clean: ["THE KITCHEN. THE COOK ROASTED THE COUNT'S MOTHER-IN-LAV LIKE A HAM. ...MMM. HAM. *SLURP*. STAY OFF THE STOVES."],
    shitty: ["THE KITCHEN. THE COOK ROASTED THE COUNT'S MOTHER-IN-LAV LIKE A HAM. ...MMM. HAM. *SLURP*. SHE SMELLED BETTER THAN YOU."],
    nude: ["THE KITCHEN. THE COOK ROASTED THE COUNT'S MOTHER-IN-LAV LIKE A HAM. ...MMM. HAM. *SLURP*. I SEE YOU BROUGHT A LITTLE SAUSAGE."],
  },
  bedroom: {
    clean: ["AHEM. *GULP*... THE MASTER'S CHAMBERS. THE COUNT SLEPT ON LADY MORTIMER ALL VINTER. SHE VAS DEAD. HIS BRIDES VAIT IN THE VARDROBES."],
    shitty: ["AHEM. *GULP*... THE MASTER'S CHAMBERS. THE COUNT SLEPT ON LADY MORTIMER ALL VINTER. SHE VAS DEAD. SHE STILL NEVER SHIT THE BED."],
    nude: ["AHEM. *GULP*... THE MASTER'S CHAMBERS. THE COUNT SLEPT ON LADY MORTIMER ALL VINTER. SHE VAS DEAD. MY BRIDES SAW YOUR DICK. THEY LAUGHED."],
  },
  nursery: {
    clean: ["THE NURSERY. LITTLE VILHELM'S FAVORITE TOY VAS A LIT CANDLE. FOUR FIRES. HE ALSO ATE THE CANDLE. *CRUNCH*. RESPECT."],
    shitty: ["THE NURSERY. LITTLE VILHELM'S FAVORITE TOY VAS A LIT CANDLE. FOUR FIRES. HE ALSO SHIT HIMSELF. *CRUNCH*. YOU VOULD HAVE BEEN BEST FRIENDS."],
    nude: ["THE NURSERY. LITTLE VILHELM'S FAVORITE TOY VAS A LIT CANDLE. FOUR FIRES. HE ALSO VORE NO PANTS. *CRUNCH*. HE VAS THREE. VHAT IS YOUR EXCUSE?"],
  },
  gallery: {
    clean: ['*SLURP*. THE PORTRAIT GALLERY. MY ANCESTORS, PAINTED AS THEY DIED. MOSTLY AT DINNER. THE EMPTY FRAME IS RESERVED. FOR YOU.'],
    shitty: ['*SLURP*. THE PORTRAIT GALLERY. MY ANCESTORS, PAINTED AS THEY DIED. MOSTLY AT DINNER. THE EMPTY FRAME IS YOURS. VE VILL PAINT YOU IN BROVN.'],
    nude: ['*SLURP*. THE PORTRAIT GALLERY. MY ANCESTORS, PAINTED AS THEY DIED. MOSTLY AT DINNER. THE EMPTY FRAME IS YOURS. FOR THE DICK, A VERY SMALL BRUSH.'],
  },
};

/** The PA, now and then, as he kills off the cast (once the story's done, never over it). (The cast are men and
 *  women both: no he or she.) */
export const PA_KILL: ByPants = {
  clean: [
    'THAT VUN VAS SEASONAL! NO BENEFITS! *CRUNCH*.',
    'MY GOOD CARPET! I DROPPED A CHICKEN VING ON IT! FIVE-SECOND RULE.',
    'KILL ALL YOU VANT. I PAY THEM IN EXPOSURE. AND CRUSTS.',
    'OH, COME ON! ...*GULP*. I MEAN. HA. HA. A TRAGEDY.',
  ],
  shitty: [
    'THAT VUN DIED LOOKING AT YOUR PANTS. A MERCY. *CRUNCH*.',
    'BLOOD ON MY CARPET. AND SHIT. YOUR SHIT. I AM TRYING TO EAT.',
    'KILL ALL YOU VANT. NOBODY VANTS TO TOUCH YOUR SHITTY ASS ANYVAY.',
    'OH, COME ON! ...*GULP*. A TRAGEDY. THEY SHOULD HAVE HELD THEIR BREATH.',
  ],
  nude: [
    'THE LAST THING THAT VUN SAW VAS YOUR BALLS. VHAT A VAY TO GO. *CRUNCH*.',
    'BLOOD ON MY CARPET. AND YOUR BARE ASS. I AM TRYING TO EAT.',
    'KILL ALL YOU VANT. THE SURVIVORS SAW YOUR BALLS. THEY VILL NEED THERAPY.',
    'OH, COME ON! ...*GULP*. I MEAN. PUT THAT THING AVAY AND FIGHT LIKE A MAN.',
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead, back at the PA (after each story: these fit all three ways of it)

export const MH_GREET = [
  'NICE ACCENT. WHAT PART OF TRANSYLVANIA, NEW JERSEY?',
  "I'M GONNA SHOVE THAT CAPE UP YOUR ASS.",
  'ARE YOU EATING INTO THE MIC? CHEW WITH YOUR MOUTH CLOSED, FATSO.',
];
export const MH_REPLY: Record<Exclude<RoomId, 'foyer'>, readonly string[]> = {
  dining: ['BAD SHRIMP. BEEN THERE.', 'FORTY DEAD AND IT STILL GETS FOUR STARS ON YELP.'],
  study: ['ELEVEN YEARS? I JUST CLICK AGREE. LIKE A MAN.', "SEE? THIS IS WHY I DON'T READ."],
  kitchen: ['MOTHER-IN-LAW HAM. WITH GRAVY? I WOULD.', "MY EX'S MOM WOULD FEED A FAMILY OF NINE."],
  bedroom: ['ALL WINTER WITH A DEAD LADY. LONGER THAN MY MARRIAGE.', 'SLEPT ON A CORPSE. I THINK I DATED HER SISTER.'],
  nursery: ['A KID WITH A CANDLE. SOMEBODY CALL CPS. AND THE FIRE DEPARTMENT.', 'FOUR FIRES. THAT KID RULES.'],
  gallery: ["LOTTA PAINTINGS FOR A GUY WHO DOESN'T SHOW UP IN MIRRORS.", 'PAINT ME FLEXING. AND ADD FOUR INCHES.'],
};


// ---------------------------------------------------------------------------------------------------------------
// What he says when each thing in the castle hurts him, and the death screen

export const HURT_SKELETON = ['A COFFIN LID! TO THE FACE!', "THAT'S NOT A SHIELD, IT'S FURNITURE!", 'BONY BITCH CAN SWING! MUST BE ALL THAT CALCIUM!'];
export const DEATH_SKELETON = ['BEATEN WITH A COFFIN LID', 'BONED'];
export const HURT_KNIGHT = ['THAT SWORD IS NOT PLASTIC!', 'FUCKING TIN CAN!', 'OW! RIGHT IN THE RENAISSANCE FAIRE!'];
export const DEATH_KNIGHT = ['SLAIN BY A TIN CAN', 'KNIGHTED. FATALLY.'];
export const HURT_KNIGHT_SPIKES = ['A SPIKED HAT?! WHO DOES THAT?!', 'MY FEET! I JUST GOT A PEDICURE!', 'NOT ON THE HELMET, IDIOT!'];
export const DEATH_KNIGHT_SPIKES = ['STOMPED ON A SPIKED HELMET', 'POINTY HAT, POINTY END'];
export const HURT_IGOR = ['GET OFF ME, QUASIMODO!', 'KEEP YOUR HUMP TO YOURSELF!', 'THE HUNCHBACK GRABBED MY ASS!'];
export const DEATH_IGOR = ['HUMPED TO DEATH', 'DRY HUMPED BY A HUNCHBACK'];
export const HURT_FORK = ['FORKED ME LIKE A HAM!', "I'M NOT DONE YET, CHEF!", "I'M NOT A HAM! I'M A WHOLE ROAST!"];
export const DEATH_FORK = ['FORKED', 'FORKED. HE WAS DONE.'];
export const HURT_WITCH = ['GET YOUR BROOM OUT OF MY FACE!', 'WITCH SLAPPED!', 'UGLY HAG! YOU LOOK LIKE MY AUNT JUDY!'];
export const DEATH_WITCH = ['HEXED', 'BROOMED'];
export const HURT_FLASK = ['WHAT WAS IN THAT BOTTLE?!', 'IT BURNS! LIKE THE CLAP!', 'POTION TO THE FACE!'];
export const DEATH_FLASK = ['POISONED BY A POTION', 'DRANK IT THROUGH HIS FACE'];
export const HURT_BRIDE = ["IT BIT ME! I'M NOT YOUR HUSBAND!", 'GET OFF MY NECK!', "I DON'T EVEN KNOW YOUR NAME, LADY!"];
export const DEATH_BRIDE = ['LEFT AT THE ALTAR IN PIECES', 'TILL DEATH DID THEM PART'];
export const HURT_BATSUIT = ['A DORK IN A BAT SUIT! VIRGIN!', 'FLEW INTO ME ON A STRING!', 'GET YOUR WINGS OUT OF MY MOUTH!'];
export const DEATH_BATSUIT = ['KILLED BY A BAT SUIT DORK', 'MANHANDLED BY A BAT SUIT'];
export const HURT_MUMMY = ['TOILET PAPER HITS HARD!', 'BEAT UP BY CHARMIN!', 'YOU SMELL LIKE A HAMPER, MUMMY!'];
export const DEATH_MUMMY = ['WIPED OUT BY A MUMMY', 'WIPED OUT BY CHARMIN'];
export const HURT_BAT = ['BAT! IN MY HAIR!', "IT'S IN MY HAIR! IT'S NESTING!", 'RABIES! I GOT RABIES!'];
export const DEATH_BAT = ['BATTED', 'NIBBLED TO DEATH BY A BAT'];
export const HURT_CHANDELIER = ['THE CHANDELIER! ON MY HEAD!', 'A CHANDELIER! WHO HANGS THAT OVER A FAT GUY?!', 'WHO HANGS THAT OVER A TABLE?!'];
export const DEATH_CHANDELIER = ['CHANDELIERED', 'DINNER WAS SERVED'];
export const HURT_BOOKS = ['BOOK TO THE FACE!', "THIS IS WHY I DON'T READ!", "HARDCOVER! THAT'S A FORTY DOLLAR BOOK!"];
export const DEATH_BOOKS = ['KILLED BY READING', 'THROWN THE BOOK AT'];
export const HURT_STOVE = ['MY ASS IS ON FIRE!', 'MY ASS CHEEKS ARE SEARING!', "I'M COOKING! I'M COOKING!"];
export const DEATH_STOVE = ['COOKED ON A STOVE', 'WELL DONE'];
export const HURT_TRAIN = ['CHOO CHOO MY ASS!', 'I GOT RUN OVER BY A LIONEL!', 'MY ANKLES!'];
export const DEATH_TRAIN = ['RUN DOWN BY A TOY TRAIN', 'THE LITTLE ENGINE COULD'];

const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  [PA]: [...all(PA_GREET), ...Object.values(PA_STORY).flatMap(all), ...all(PA_KILL)],
  meathead: [
    ...MH_GREET, ...Object.values(MH_REPLY).flat(),
    ...HURT_SKELETON, ...HURT_KNIGHT, ...HURT_KNIGHT_SPIKES, ...HURT_IGOR, ...HURT_FORK, ...HURT_WITCH, ...HURT_FLASK, ...HURT_BRIDE,
    ...HURT_BATSUIT, ...HURT_MUMMY, ...HURT_BAT, ...HURT_CHANDELIER, ...HURT_BOOKS, ...HURT_STOVE, ...HURT_TRAIN,
  ],
  death: [
    ...DEATH_SKELETON, ...DEATH_KNIGHT, ...DEATH_KNIGHT_SPIKES, ...DEATH_IGOR, ...DEATH_FORK, ...DEATH_WITCH, ...DEATH_FLASK, ...DEATH_BRIDE,
    ...DEATH_BATSUIT, ...DEATH_MUMMY, ...DEATH_BAT, ...DEATH_CHANDELIER, ...DEATH_BOOKS, ...DEATH_STOVE, ...DEATH_TRAIN,
  ],
};
