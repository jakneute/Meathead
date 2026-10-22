// What's said in Mexico (the PA's hello, his lines, the cast's barks, what hurts him here), by voice.

import { pavilionVoices, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

export const V = {
  mariachi: { m: 'm2.foreign.mariachi', f: 'm2.foreign.mariachif' },
  sombrero: { m: 'm2.foreign.sombrero', f: 'm2.foreign.sombrerof' },
  pinata: { m: 'm2.foreign.pinata', f: 'm2.foreign.pinataf' },
  luchador: { m: 'm2.foreign.luchador', f: 'm2.foreign.luchadorf' },
};

export const TALK: PavilionTalk = {
  pa: {
    clean: [
      'NOW ENTERING MEXICO! HOLA, Y\'ALL! TRY OUR AUTHENTIC TACOS, MADE FRESH IN NEW JERSEY!',
      'WELCOME TO MEXICO! THE PYRAMID WAS BUILT BY THE ANCIENT MAYANS. AND A GUY NAMED DOUG.',
    ],
    shitty: [
      'WELCOME TO MEXICO! SIR, MONTEZUMA\'S REVENGE IS A RIDE. YOU DO NOT BRING YOUR OWN.',
      'NOW ENTERING MEXICO! SIR, THAT IS NOT A SOUVENIR. PLEASE TAKE IT WITH YOU.',
    ],
    nude: [
      'WELCOME TO MEXICO! SIR, A PONCHO IS NOT PANTS. YOU DON\'T EVEN HAVE A PONCHO.',
      'NOW ENTERING MEXICO! SIR, CHURROS ARE FOUR DOLLARS. PLEASE PUT YOURS AWAY.',
    ],
  },
  arrive: [
    "EUROPE'S MEXICO? WHO MADE THIS SIGN?",
    'MEXICO. SMELLS LIKE A TACO BELL DUMPSTER. I LOVE IT.',
  ],
  gags: [
    { from: 900, to: 1300, key: 'taco', lines: ['TACOS: AN ITALIAN TRADITION. I\'M NOT EVEN MAD.', "TWELVE-DOLLAR TACO. THE MEAT'S GRAY. I'M GETTING THREE."] },
    { from: 1500, to: 2100, key: 'pyramid', lines: ['A PYRAMID. THE GIFT SHOP\'S AT THE TOP. OF COURSE IT IS.', 'STAIRS. MY ASS IS GONNA FEEL THIS TOMORROW.'], minH: 150 },
    { from: 1700, to: 2900, key: 'plaza', maxH: 60,
      // (the plaza's painted dusk, against whatever the real sky's doing: never the wrong time of day)
      lines: ['A FAKE SUNSET. INDOORS. I WANT A FAKE MARGARITA.'],
      byTime: {
        morning: ["IT'S NIGHTTIME IN HERE. IT'S NINE IN THE MORNING.", 'A FAKE SUNSET. INDOORS. BEFORE LUNCH.'],
        day: ["IT'S NIGHTTIME IN HERE. IT'S TWO IN THE AFTERNOON.", 'A FAKE SUNSET. INDOORS. I WANT A FAKE MARGARITA.'],
        evening: ["A FAKE SUNSET. INDOORS. THERE'S A REAL ONE RIGHT OUTSIDE.", 'THEY PAINTED A SUNSET IN HERE. THE REAL ONE IS FREE.'],
        night: ["A FAKE NIGHT SKY. INDOORS. THE REAL ONE'S RIGHT OUTSIDE.", "IT'S NIGHT IN HERE AND IT'S NIGHT OUT THERE. WHAT WAS THE POINT?"],
      } },
    { from: 3100, to: 3600, key: 'mesas', lines: ['PLYWOOD CACTUSES. SOMEBODY CARVED A DICK IN THAT ONE.', "THAT'S ARIZONA. THEY PAINTED ARIZONA BACK THERE."] },
    // (job 4b: La Quebrada, the cliff divers)
    { from: 4250, to: 4700, key: 'quebrada', lines: ['CLIFF DIVERS. INTO SIX FEET OF WATER. FROM OHIO.', "A FIBERGLASS CLIFF. YOU CAN SEE THE SCREWS."] },
    { from: 4820, to: 5480, key: 'clifftop', lines: ["THE GUY ON THE POLE IS CRYING. HE'S STILL GONNA JUMP.", "LONG WAY DOWN. THE POOL'S THE SIZE OF A HOT TUB. A DIRTY ONE."], minH: 560 },
    { from: 5800, to: 6200, key: 'tequila', lines: ['APPLE JUICE TEQUILA. NINE BUCKS. THE WORM IS A GUMMY WORM.', 'APPLE JUICE TEQUILA. WHO IS THIS FOR?'] },
  ],
};

/** His own dive off the board into the pool. */
export const DIVE_GAG = ['TEN. TEN. TEN. SUCK IT, OHIO.', "CANNONBALL! HALF THE POOL'S ON THE CROWD!", 'MY BALLS HIT THE WATER FIRST. NEVER AGAIN.'];

/** The cast divers on the pole, before the plunge (the luchador voices). */
export const DIVER: ByPants = {
  clean: ["OLE! I CAN'T SWIM!", 'NINE BUCKS AN HOUR FOR THIS! NINE!', "FOURTH DIVE TODAY! I CAN'T FEEL MY FACE!", "IT'S SIX FEET DEEP! WHO APPROVED THIS?!"],
  shitty: ["SOMETHING'S FLOATING IN THE POOL! IS THAT YOURS?!", "I'M NOT DIVING INTO THAT! ...I'M CONTRACTUALLY DIVING INTO THAT!"],
  nude: ["NAKED DIVING ISN'T IN THE SHOW, DUDE!", "HE'S NAKED IN MY POOL! I'M AIMING FOR HIM!"],
};

// ---------------------------------------------------------------------------------------------------------------
// The cast's barks

export const MARIACHI: ByPants = {
  clean: ["OLE! MY MUSTACHE IS GLUED ON! IT'S IN MY MOUTH!", "WE ONLY KNOW ONE SONG! IT'S LA CUCARACHA! IT'S ALWAYS LA CUCARACHA!"],
  shitty: ['HE SHIT HIMSELF! PLAY LOUDER! PLAY LOUDER!', 'OLE! OH GOD! OLE, WHAT IS THAT SMELL?!'],
  nude: ['SENOR, WHERE ARE YOUR PANTALONES? IS THAT THE WORD? I TOOK FRENCH.', 'PUT IT AWAY, DUDE! MY MOM COMES TO THESE!'],
};
export const SOMBRERO: ByPants = {
  clean: ["SOMBRERO! THAT'S ALL THE SPANISH I KNOW!", "I'M MADISON! I'M A COMMUNICATIONS MAJOR! HAT!"],
  shitty: ['EW! YOU SMELL LIKE THE CHURRO GREASE TRAP!', "HE SHIT HIMSELF! THAT'S NOT IN THE SHOW!"],
  nude: ["OH MY GOD, HE'S NAKED! COVER IT WITH THE HAT!", "HAT! FOR YOUR THING! IT'S A SMALL HAT! IT'LL FIT!"],
};
export const PINATA: ByPants = {
  clean: ["WHERE IS IT?! I CAN'T SEE! CANDY!", "IS THAT THE PINATA?! HOLD STILL!"],
  shitty: ['WHY DOES THE PINATA SMELL LIKE SHIT?!', 'THE PINATA IS WARM! WHY IS IT WARM?!'],
  nude: ["I GRABBED THE PINATA'S STRING! WHY'S IT SCREAMING?!", 'WHY IS THE PINATA SO SQUISHY?!'],
};
export const LUCHADOR: ByPants = {
  clean: ['EL CAMPEON! I ALSO WORK THE CHURRO CART!', "I WRESTLED IN HIGH SCHOOL! STATE QUALIFIER!"],
  shitty: ["NO WAY I'M GRABBING THAT! ...OKAY, I'M GRABBING THAT!", 'SUPLEX THE STINK RIGHT OUT OF YOU!'],
  nude: ['NO PANTS?! I WEAR TIGHTS, BRO! THAT IS DIFFERENT!', 'GRAPPLING A NAKED GUY! THIS IS WHY I DROPPED OUT!'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here

export const HURT: HurtTable = {
  'm2:fl_mariachi': {
    hurt: ['HE HIT ME WITH A TRUMPET!', 'OW! BRASS TO THE FACE!', 'FUCK YOUR TRUMPET!'],
    death: ['BLOWN AWAY BY A MARIACHI', 'LA CUCARACHA\'D'],
  },
  'm2:fl_mariachi_note': {
    hurt: ["MY EARS! THAT'S NOT EVEN A SONG!", "IT'S LA CUCARACHA AGAIN!", 'MY EARS ARE BLEEDING! FOR REAL!'],
    death: ['KILLED BY LA CUCARACHA', 'TRUMPETED TO DEATH'],
  },
  'm2:fl_sombrero': {
    hurt: ['THE HAT GUY HIT ME!', 'OW! WATCH THE BRIM!', 'HAT GUY! FUCK YOU!'],
    death: ['KILLED BY A HAT GUY', 'SOMBRERO\'D'],
  },
  'm2:fl_sombrero_hat': {
    hurt: ['A ROLLING HAT! IN MY SHIN!', 'THE BRIM GOT ME!', 'WHO THROWS A HAT?!'],
    death: ['RUN OVER BY A SOMBRERO', 'HAT TRICK'],
  },
  'm2:fl_pinata': {
    hurt: ['THE BLIND GUY HIT ME!', "I'M NOT THE PINATA!", "I'M NOT FULL OF CANDY, ASSHOLE!"],
    death: ['MISTAKEN FOR A PINATA', 'NO CANDY CAME OUT'],
  },
  'm2:fl_luchador': {
    hurt: ['SUPLEXED! BY A GUY FROM OHIO!', 'MY SPINE WENT CRUNCHY!', 'FUCK! THE MASK GUY!'],
    death: ['PINNED. ONE. TWO. THREE.', 'SUPLEXED INTO THE AFTERLIFE'],
  },
  'm2:fl_cliff_diver': {
    hurt: ['A GUY FELL ON ME! FROM THE SKY!', 'OW! HIS FEET! IN MY FACE!', 'WATCH WHERE YOU DIVE, ASSHOLE!'],
    death: ['DIVED ON FROM 80 FEET', 'A PERFECT TEN, ON HIS HEAD'],
  },
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.mariachi, MARIACHI], [V.sombrero, SOMBRERO], [V.pinata, PINATA], [V.luchador, LUCHADOR], [V.luchador, DIVER]], { meathead: DIVE_GAG });
