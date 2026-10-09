// What's said in the dino park, by voice (recorded with the rest: tools/voices).

/** Meathead, coming down out of the storm drain into the raptor pen (the pebble cutscene). */
export const MEATHEAD_LANDED = ['OW. MY EVERYTHING.', 'NAILED THE LANDING. WITH MY FACE.', 'SMELLS LIKE A PETTING ZOO IN HERE.'];
/** ...and the raptors' eyes going red. */
export const MEATHEAD_RED_EYES = ['...NICE LIZARDS. GOOD LIZARDS.', "...WHY ARE THEIR EYES DOING THAT?", 'OH, YOU WANNA GO? LET\'S GO, GECKOS.'];
/** The maintenance man in his booth, not noticing the switch his window just let a pebble in to flip. */
export const MAINT_OBLIVIOUS = [
  'FOUR MORE HOURS. FOUR MORE HOURS AND I AM OUTTA HERE.',
  'MM-HMM. YEP. NOPE. NOT MY DEPARTMENT.',
  'TWELVE YEARS. NOT ONE THING HAS EVER HAPPENED IN THIS BOOTH.',
];
/** The animatronics' speakers, friendly mode (before the switch). */
export const DINO_FRIENDLY = ['RAWR! HI, KIDS!', 'I AM A FRIENDLY VELOCIRAPTOR! RAWR!'];

/** Meathead, kicking the temple's back door in. */
export const MEATHEAD_DOOR = ['KNOCK KNOCK.', 'DELIVERY!', "I'M LETTING MYSELF IN."];

/** What he says when these hurt him, and the death screen when they kill him. */
export const HURT_RAPTOR = ['IT BIT ME! THE ROBOT BIT ME!', 'GET OFF ME, YOU TOASTER WITH TEETH!', 'WHO PROGRAMMED THAT?!', 'CLAWS! WHY DOES IT NEED REAL CLAWS?!'];
export const DEATH_RAPTOR = ['CLEVER GIRL', 'EATEN BY AN APPLIANCE', 'LIFE, UH, FOUND A WAY'];
export const HURT_TRIKE = ['THREE HORNS! THREE!', 'IT RAMMED ME! IN THE GROIN! ALL THREE!', 'GET THAT FORKLIFT AWAY FROM ME!'];
export const DEATH_TRIKE = ['SHISH KEBABBED', 'GORED BY A GIFT SHOP MASCOT', 'TRICERATOPPED'];
export const HURT_PTERO = ['GET OUTTA MY HAIR!', 'THE BIRD ROBOT! THE BIRD ROBOT!', 'QUIT DIVE-BOMBING ME, YOU KITE!'];
export const DEATH_PTERO = ['PECKED TO DEATH BY A DRONE WITH A BEAK', 'AIR STRIKE', 'PTERRIBLE'];
export const HURT_REX = ['IT STEPPED ON ME! IT STEPPED ON ALL OF ME!', 'BIG TEETH! BIG TEETH!', 'OKAY! OKAY! YOU WIN THE STARING CONTEST!', 'WHO BUILT THAT THING, THE PENTAGON?!'];
export const DEATH_REX = ['T-REKT', 'A SNACK', 'OBJECTS IN MIRROR ARE CLOSER THAN THEY APPEAR'];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_LANDED, ...MEATHEAD_RED_EYES, ...MEATHEAD_DOOR, ...HURT_RAPTOR, ...HURT_TRIKE, ...HURT_PTERO, ...HURT_REX],
  death: [...DEATH_RAPTOR, ...DEATH_TRIKE, ...DEATH_PTERO, ...DEATH_REX],
  'm2.maint': [...MAINT_OBLIVIOUS],
};
