// What's said in the castle (by voice: spooky/voices.ts gathers these for the voice pack). The PA is "Dracula" (it's
// Donnie, the boss, in his control room, doing a fake accent: 'm2.donnie.pa'): every one of his line groups three ways,
// clean / shitty pants / naked, each the same size. A room's story is said in order, line by line; a quip is one of its
// pool. Meathead has his say back after each story. The hurt and death lines are registered in staff.ts and index.ts.

export type Dressed = 'clean' | 'shitty' | 'nude';
export type ByPants = Record<Dressed, readonly string[]>;
export const PA = 'm2.donnie.pa';

// ---------------------------------------------------------------------------------------------------------------
// The PA: the greeting, in the foyer

export const PA_GREET: ByPants = {
  clean: [
    'GOOD EVENINK. I AM DRACULA. YES, THE REAL VUN. SHUT YOUR MOUTH.',
    'SURVIVE MY HOME AND I VILL SEE YOU IN THE BALLROOM. VIPE YOUR FEET.',
  ],
  shitty: [
    'GOOD EVENINK. I AM DRACULA. VHY DO YOU SMELL LIKE A BUS STATION TOILET?',
    'SURVIVE MY HOME AND I VILL SEE YOU IN THE BALLROOM. DO NOT SIT ON ANYTHING.',
  ],
  nude: [
    'GOOD EVENINK. I AM DRACULA. VHY IS YOUR DICK IN MY FOYER?',
    'SURVIVE MY HOME AND I VILL SEE YOU IN THE BALLROOM. IT IS BLACK TIE, ASSHOLE.',
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// The PA: each room's story (the tour), said in order as he comes into it

export type RoomId = 'foyer' | 'dining' | 'study' | 'kitchen' | 'bedroom' | 'nursery' | 'gallery';

// (one line a room. All three ways tell the same story, so Meathead's say back fits whichever he heard; then the dig,
// the room's threat as often as not)
export const PA_STORY: Record<Exclude<RoomId, 'foyer'>, ByPants> = {
  dining: {
    clean: ['THE DINING ROOM. FORTY GUESTS ATE BAD SHRIMP HERE AND SHIT THEMSELVES TO DEATH. VATCH THE CHANDELIERS.'],
    shitty: ['THE DINING ROOM. FORTY GUESTS ATE BAD SHRIMP HERE AND SHIT THEMSELVES TO DEATH. I SEE YOU HAD THE SHRIMP.'],
    nude: ['THE DINING ROOM. FORTY GUESTS ATE BAD SHRIMP HERE AND SHIT THEMSELVES TO DEATH. GET YOUR BALLS OFF MY TABLE.'],
  },
  study: {
    clean: ['THE LIBRARY. DOCTOR ABERNATHY READ THE TERMS AND CONDITIONS HERE FOR ELEVEN YEARS. HE DIED A VIRGIN.'],
    shitty: ['THE LIBRARY. DOCTOR ABERNATHY READ THE TERMS AND CONDITIONS HERE FOR ELEVEN YEARS. HE NEVER SHIT HIMSELF. NOT EVEN A LITTLE.'],
    nude: ['THE LIBRARY. DOCTOR ABERNATHY READ THE TERMS AND CONDITIONS HERE FOR ELEVEN YEARS. COVER YOUR DICK VITH A BOOK. A SMALL VUN.'],
  },
  kitchen: {
    clean: ["THE KITCHEN. THE COOK ROASTED THE COUNT'S MOTHER-IN-LAV LIKE A HAM. STAY OFF THE STOVES."],
    shitty: ["THE KITCHEN. THE COOK ROASTED THE COUNT'S MOTHER-IN-LAV LIKE A HAM. SHE SMELLED BETTER THAN YOU."],
    nude: ["THE KITCHEN. THE COOK ROASTED THE COUNT'S MOTHER-IN-LAV LIKE A HAM. I SEE YOU BROUGHT A LITTLE SAUSAGE."],
  },
  bedroom: {
    clean: ['THE MASTER BEDROOM. THE COUNT SLEPT ON LADY MORTIMER ALL VINTER. SHE VAS DEAD. HIS BRIDES VAIT IN THE VARDROBES.'],
    shitty: ['THE MASTER BEDROOM. THE COUNT SLEPT ON LADY MORTIMER ALL VINTER. SHE VAS DEAD. SHE STILL NEVER SHIT THE BED.'],
    nude: ['THE MASTER BEDROOM. THE COUNT SLEPT ON LADY MORTIMER ALL VINTER. SHE VAS DEAD. MY BRIDES SAW YOUR DICK. THEY LAUGHED.'],
  },
  nursery: {
    clean: ["THE NURSERY. LITTLE VILHELM'S FAVORITE TOY VAS A LIT CANDLE. FOUR FIRES. HIS TRAIN STILL RUNS."],
    shitty: ["THE NURSERY. LITTLE VILHELM'S FAVORITE TOY VAS A LIT CANDLE. HE ALSO SHIT HIMSELF. YOU VOULD HAVE BEEN BEST FRIENDS."],
    nude: ["THE NURSERY. LITTLE VILHELM'S FAVORITE TOY VAS A LIT CANDLE. HE ALSO VORE NO PANTS. HE VAS THREE. VHAT IS YOUR EXCUSE?"],
  },
  gallery: {
    clean: ['THE PORTRAIT GALLERY. MY ANCESTORS, PAINTED AS THEY DIED. THE EMPTY FRAME IS RESERVED. FOR YOU.'],
    shitty: ['THE PORTRAIT GALLERY. MY ANCESTORS, PAINTED AS THEY DIED. THE EMPTY FRAME IS YOURS. VE VILL PAINT YOU IN BROVN.'],
    nude: ['THE PORTRAIT GALLERY. MY ANCESTORS, PAINTED AS THEY DIED. THE EMPTY FRAME IS YOURS. FOR THE DICK, A VERY SMALL BRUSH.'],
  },
};

/** The PA, now and then, as he kills off the cast (once the story's done, never over it). (The cast are men and
 *  women both: no he or she.) */
export const PA_KILL: ByPants = {
  clean: [
    'THAT VUN VAS ONLY SEASONAL!',
    'MY GOOD CARPET! DO YOU KNOW VHAT CARPET COSTS, YOU PRICK?',
    'KILL ALL YOU VANT. I PAY THEM IN EXPOSURE.',
    'OH, COME ON! ...I MEAN. HA. HA. A TRAGEDY.',
  ],
  shitty: [
    'THAT VUN DIED LOOKING AT YOUR PANTS. A MERCY.',
    'BLOOD ON MY CARPET. AND SHIT. YOUR SHIT. ON MY CARPET.',
    'KILL ALL YOU VANT. NOBODY VANTED TO TOUCH YOU ANYVAY.',
    'OH, COME ON! ...I MEAN. A TRAGEDY. THEY SHOULD HAVE HELD THEIR BREATH.',
  ],
  nude: [
    'THE LAST THING THAT VUN SAW VAS YOUR BALLS. VHAT A VAY TO GO.',
    'BLOOD ON MY CARPET. AND YOUR BARE ASS. ON MY CARPET.',
    'KILL ALL YOU VANT. THE SURVIVORS VILL NEED THERAPY. NOT FOR THE KILLING.',
    'OH, COME ON! ...I MEAN. PUT THAT THING AVAY AND FIGHT LIKE A MAN.',
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead, back at the PA (after each story: these fit all three ways of it)

export const MH_GREET = [
  'NICE ACCENT. WHAT PART OF TRANSYLVANIA, NEW JERSEY?',
  "I'M GONNA SHOVE THAT CAPE UP YOUR ASS.",
];
export const MH_REPLY: Record<Exclude<RoomId, 'foyer'>, readonly string[]> = {
  dining: ['BAD SHRIMP. BEEN THERE.', 'FORTY DEAD AND THE PLACE STILL GETS ONE STAR.'],
  study: ['ELEVEN YEARS? I JUST CLICK AGREE. LIKE A MAN.', 'SEE? READING KILLS.'],
  kitchen: ['MOTHER-IN-LAW HAM. WITH GRAVY? I WOULD.', 'BEST USE OF A MOTHER-IN-LAW I EVER HEARD.'],
  bedroom: ['A DEAD LADY ALL WINTER. THAT IS A RELATIONSHIP.', 'SLEPT ON A CORPSE. I THINK I DATED HER SISTER.'],
  nursery: ['WHO GIVES A KID A LIT CANDLE?', 'FOUR FIRES. THAT KID RULES.'],
  gallery: ["LOTTA PAINTINGS FOR A GUY WHO DOESN'T SHOW UP IN MIRRORS.", "PAINT ME FLEXING OR DON'T BOTHER."],
};


// ---------------------------------------------------------------------------------------------------------------
// What he says when each thing in the castle hurts him, and the death screen

export const HURT_SKELETON = ['A COFFIN LID! TO THE FACE!', "THAT'S NOT A SHIELD, IT'S FURNITURE!", 'BONY BITCH CAN SWING!'];
export const DEATH_SKELETON = ['BEATEN WITH A COFFIN LID', 'BONED'];
export const HURT_KNIGHT = ['THAT SWORD IS NOT PLASTIC!', 'FUCKING TIN CAN!', 'OW! MY RENAISSANCE!'];
export const DEATH_KNIGHT = ['SLAIN BY A TIN CAN', 'KNIGHTED. FATALLY.'];
export const HURT_KNIGHT_SPIKES = ['A SPIKED HAT?! WHO DOES THAT?!', 'MY FEET! MY BEAUTIFUL FEET!', 'NOT ON THE HELMET, IDIOT!'];
export const DEATH_KNIGHT_SPIKES = ['STOMPED ON A SPIKED HELMET', 'POINTY HAT, POINTY END'];
export const HURT_IGOR = ['GET OFF ME, QUASIMODO!', 'KEEP YOUR HUMP TO YOURSELF!', 'THE HUNCHBACK GOT ME!'];
export const DEATH_IGOR = ['HUMPED TO DEATH', 'YES, MASTER'];
export const HURT_FORK = ['FORKED ME LIKE A HAM!', "I'M NOT DONE YET, CHEF!", 'NOT THE BIG FORK!'];
export const DEATH_FORK = ['FORKED', 'FORKED. HE WAS DONE.'];
export const HURT_WITCH = ['GET YOUR BROOM OUT OF MY FACE!', 'WITCH SLAPPED!', 'UGLY HAG!'];
export const DEATH_WITCH = ['HEXED', 'WITCHED'];
export const HURT_FLASK = ['WHAT WAS IN THAT BOTTLE?!', 'IT BURNS! LIKE THE CLAP!', 'POTION TO THE FACE!'];
export const DEATH_FLASK = ['POISONED BY A POTION', 'DRANK IT THROUGH HIS FACE'];
export const HURT_BRIDE = ["IT BIT ME! I'M NOT YOUR HUSBAND!", 'GET OFF MY NECK!', 'CRAZY BRIDE! CRAZY BRIDE!'];
export const DEATH_BRIDE = ['LEFT AT THE ALTAR IN PIECES', 'TILL DEATH DID THEM PART'];
export const HURT_BATSUIT = ['A DORK IN A BAT SUIT!', 'FLEW INTO ME ON A STRING!', 'GET YOUR WINGS OUT OF MY MOUTH!'];
export const DEATH_BATSUIT = ['KILLED BY A BAT SUIT DORK', 'MANHANDLED BY A BAT SUIT'];
export const HURT_MUMMY = ['TOILET PAPER HITS HARD!', 'BEAT UP BY TWO-PLY!', 'MUMMY! MUMMY, NO!'];
export const DEATH_MUMMY = ['WIPED OUT BY A MUMMY', 'TWO-PLY DEATH'];
export const HURT_BAT = ['BAT! IN MY HAIR!', 'GET IT OFF! GET IT OFF!', 'RABIES! I GOT RABIES!'];
export const DEATH_BAT = ['BATTED', 'NIBBLED TO DEATH BY A BAT'];
export const HURT_CHANDELIER = ['THE CHANDELIER! ON MY HEAD!', 'DINNER IS SERVED! ON ME!', 'WHO HANGS THAT OVER A TABLE?!'];
export const DEATH_CHANDELIER = ['CHANDELIERED', 'DINNER WAS SERVED'];
export const HURT_BOOKS = ['BOOK TO THE FACE!', "THIS IS WHY I DON'T READ!", 'HARDCOVER! HARDCOVER!'];
export const DEATH_BOOKS = ['KILLED BY READING', 'THROWN THE BOOK AT'];
export const HURT_STOVE = ['MY ASS IS ON FIRE!', 'STOVE! HOT STOVE!', "I'M COOKING! I'M COOKING!"];
export const DEATH_STOVE = ['COOKED ON A STOVE', 'WELL DONE'];
export const HURT_TRAIN = ['CHOO CHOO MY ASS!', 'A TOY TRAIN! A TOY!', 'MY ANKLES!'];
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
