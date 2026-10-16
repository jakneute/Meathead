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
      'WELCOME TO MEXICO! SIR, WE TOLD YOU NOT TO DRINK THE WATER. WE DON\'T EVEN HAVE WATER.',
      'NOW ENTERING MEXICO! SIR, THAT IS NOT A SOUVENIR. PLEASE TAKE IT WITH YOU.',
    ],
    nude: [
      'WELCOME TO MEXICO! SIR, A PONCHO IS NOT PANTS. YOU DON\'T EVEN HAVE A PONCHO.',
      'NOW ENTERING MEXICO! SIR, THE PINATA IS THE ONLY THING HERE THAT GETS STRIPPED.',
    ],
  },
  arrive: [
    "EUROPE'S MEXICO? WHO MADE THIS SIGN?",
    'MEXICO. THE GUY IN THE PONCHO HAS AN OHIO STATE HAT ON.',
  ],
  gags: [
    { from: 900, to: 1300, key: 'taco', lines: ['TACOS: AN ITALIAN TRADITION. I\'M NOT EVEN MAD.', 'THAT TACO CART SMELLS LIKE A GYM BAG.'] },
    { from: 1500, to: 2100, key: 'pyramid', lines: ['A PYRAMID. THE GIFT SHOP\'S AT THE TOP. OF COURSE IT IS.', 'STAIRS. MY ASS IS GONNA FEEL THIS TOMORROW.'], minH: 150 },
    { from: 1700, to: 2900, key: 'plaza', lines: ["IT'S NIGHTTIME IN HERE. IT'S TWO IN THE AFTERNOON.", 'A FAKE SUNSET. INDOORS. I WANT A FAKE MARGARITA.'], maxH: 60 },
    { from: 3100, to: 3600, key: 'volcano', lines: ["A FAKE VOLCANO. IT'S A FOG MACHINE IN A CONE.", 'THE VOLCANO IS SMOKING. SO AM I, AFTER THIS.'] },
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// The cast's barks

export const MARIACHI: ByPants = {
  clean: ["HOLA! I'M BRAYDEN! I'M FROM OHIO! OLE!", "WE ONLY KNOW ONE SONG! IT'S LA CUCARACHA! IT'S ALWAYS LA CUCARACHA!"],
  shitty: ["DUDE, DID YOU DRINK THE WATER? WE DON'T EVEN HAVE WATER!", 'OLE! OH GOD! OLE, WHAT IS THAT SMELL?!'],
  nude: ['SENOR, WHERE ARE YOUR PANTALONES? IS THAT THE WORD? I TOOK FRENCH.', 'DUDE, PUT ON A PONCHO! ANY PONCHO!'],
};
export const SOMBRERO: ByPants = {
  clean: ["SOMBRERO! THAT'S ALL THE SPANISH I KNOW!", "I'M MADISON! I'M A COMMUNICATIONS MAJOR! HAT!"],
  shitty: ['EW! GROSS! SOMBRERO!', "HE SHIT HIMSELF! THAT'S NOT IN THE SHOW!"],
  nude: ["OH MY GOD, HE'S NAKED! COVER IT WITH THE HAT!", 'HAT! FOR YOUR THING! TAKE THE HAT!'],
};
export const PINATA: ByPants = {
  clean: ["WHERE IS IT?! I CAN'T SEE! CANDY!", "IS THAT THE PINATA?! HOLD STILL!"],
  shitty: ['WHY DOES THE PINATA SMELL LIKE SHIT?!', 'THE PINATA IS WARM! WHY IS IT WARM?!'],
  nude: ['THE PINATA FEELS NAKED!', 'WHY IS THE PINATA SO SQUISHY?!'],
};
export const LUCHADOR: ByPants = {
  clean: ['EL CAMPEON! FROM COLUMBUS! LUCHA LUCHA!', "I WRESTLED IN HIGH SCHOOL! STATE QUALIFIER!"],
  shitty: ["NO WAY I'M GRABBING THAT! ...OKAY, I'M GRABBING THAT!", 'SUPLEX THE STINK RIGHT OUT OF YOU!'],
  nude: ['NO PANTS?! I WEAR TIGHTS, BRO! THAT IS DIFFERENT!', 'GRAPPLING A NAKED GUY! THIS IS WHY I DROPPED OUT!'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here

export const HURT: HurtTable = {
  'm2:fl_mariachi': {
    hurt: ['HE HIT ME WITH A TRUMPET!', 'OW! BRASS TO THE FACE!', 'QUIT TOOTING AT ME!'],
    death: ['BLOWN AWAY BY A MARIACHI', 'LA CUCARACHA\'D'],
  },
  'm2:fl_mariachi_note': {
    hurt: ["MY EARS! THAT'S NOT EVEN A SONG!", "IT'S LA CUCARACHA AGAIN!", 'THE TRUMPET IS A WEAPON!'],
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
    hurt: ['THE BLIND GUY HIT ME!', "I'M NOT THE PINATA!", 'OW! NO CANDY IN ME!'],
    death: ['MISTAKEN FOR A PINATA', 'NO CANDY CAME OUT'],
  },
  'm2:fl_luchador': {
    hurt: ['SUPLEXED! BY A GUY FROM OHIO!', 'MY BACK! MY WHOLE BACK!', 'FUCK! THE MASK GUY!'],
    death: ['PINNED. ONE. TWO. THREE.', 'SUPLEXED INTO THE AFTERLIFE'],
  },
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.mariachi, MARIACHI], [V.sombrero, SOMBRERO], [V.pinata, PINATA], [V.luchador, LUCHADOR]]);
