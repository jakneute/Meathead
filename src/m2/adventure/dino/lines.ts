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
/** Shoulder charged head-on into a triceratops' horns. */
export const HURT_HORNS = ['SHOULDER VERSUS THREE HORNS! HORNS WIN!', 'I CHARGED THE POINTY END!', "IT'S GOT THREE OF THEM! I COUNTED! WITH MY SHOULDER!"];
export const DEATH_HORNS = ['CHARGED THE POINTY END', 'HEAD-ON WITH A TRICERATOPS', 'THREE HOLES, ONE MEATHEAD'];
export const HURT_PTERO = ['GET OUTTA MY HAIR!', 'THE BIRD ROBOT! THE BIRD ROBOT!', 'QUIT DIVE-BOMBING ME, YOU KITE!'];
export const DEATH_PTERO = ['PECKED TO DEATH BY A DRONE WITH A BEAK', 'AIR STRIKE', 'PTERRIBLE'];
export const HURT_REX = ['IT STEPPED ON ME! IT STEPPED ON ALL OF ME!', 'BIG TEETH! BIG TEETH!', 'OKAY! OKAY! YOU WIN THE STARING CONTEST!', 'WHO BUILT THAT THING, THE PENTAGON?!'];
export const DEATH_REX = ['T-REKT', 'A SNACK', 'OBJECTS IN MIRROR ARE CLOSER THAN THEY APPEAR'];

/** The T. rex paddock's sub-boss (rex.ts). Walking into the paddock, it waking up. */
export const MEATHEAD_REX_INTRO = ['OH, GOOD. THE BIG ONE.', "THAT'S A LOT OF DINOSAUR.", "NICE T-REX. GOOD T-REX. ...IT'S NOT A GOOD T-REX."];
/** Its bite. */
export const HURT_REX_BITE = ['IT BIT ME! IT ACTUALLY BIT ME!', 'I AM NOT ON THE MENU!', 'WHO PUTS REAL TEETH IN A KIDS RIDE?!', 'GET YOUR GIFT SHOP TEETH OFF MY BUTT!'];
export const DEATH_REX_BITE = ['FEEDING TIME', 'ALL YOU CAN EAT', 'CHEWED UP BY A THEME PARK'];
/** Run down by it sprinting. */
export const HURT_REX_SPRINT = ['IT CAN RUN?! WHY CAN IT RUN?!', 'HIT BY A DINOSAUR AT HIGHWAY SPEED!', 'WHO GAVE IT A TURBO BUTTON?!'];
export const DEATH_REX_SPRINT = ['T-BONED', 'RUN OVER BY A RIDE', 'MUST GO FASTER'];
/** Its tail, swung at him behind it. */
export const HURT_REX_TAIL = ['TAIL! TAIL! TAIL!', 'IT SPANKED ME WITH ITS TAIL!', 'THE BACK END! THE BACK END IS ALSO DANGEROUS!'];
export const DEATH_REX_TAIL = ['TAIL-WHIPPED', 'SPANKED TO DEATH', 'SWATTED LIKE A FLY'];
/** Charging (any move) into a part of it that's gone live from being hit too much. */
export const HURT_REX_SHOCK = ['ZAPPED! IT ZAPPED ME!', 'MY FILLINGS! I CAN TASTE MY FILLINGS!', "IT'S LIVE! THAT PART IS LIVE!", 'MY HAIR! ALL OF IT! EVERYWHERE!'];
export const DEATH_REX_SHOCK = ['ELECTROCUTED BY A KIDS RIDE', 'SHOULDER-CHARGED A LIVE WIRE', 'GROUNDED. PERMANENTLY.'];
/** Its speaker, going on in friendly mode as it falls to bits. */
export const REX_SPEAKER_DYING = [
  'RAWR! HI, KIDS! HI, KIDS! HI, KI- HI, KI- HIIIII...',
  'I AM A FRIENDLY TYRANNOSAURUS! PLEASE KEEP YOUR ARMS INSIDE MY MOUTH AT ALL TIMES!',
  'THANK YOU FOR VISITING! THANK YOU FOR VIS- THANK YOU FOR- THANK- THAAAANK...',
];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_LANDED, ...MEATHEAD_RED_EYES, ...MEATHEAD_DOOR, ...HURT_RAPTOR, ...HURT_TRIKE, ...HURT_HORNS, ...HURT_PTERO, ...HURT_REX, ...MEATHEAD_REX_INTRO, ...HURT_REX_BITE, ...HURT_REX_SPRINT, ...HURT_REX_TAIL, ...HURT_REX_SHOCK],
  death: [...DEATH_RAPTOR, ...DEATH_TRIKE, ...DEATH_HORNS, ...DEATH_PTERO, ...DEATH_REX, ...DEATH_REX_BITE, ...DEATH_REX_SPRINT, ...DEATH_REX_TAIL, ...DEATH_REX_SHOCK],
  'm2.maint': [...MAINT_OBLIVIOUS],
  'm2.rex': [...REX_SPEAKER_DYING],
};
