// What's said in Morocco (the PA's hello, his lines, the cast's barks, what hurts him here), by voice.

import { pavilionVoices, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

export const V = {
  carpet: { m: 'm2.foreign.carpet', f: 'm2.foreign.carpetf' },
  snake: { m: 'm2.foreign.snake', f: 'm2.foreign.snakef' },
  camel: { m: 'm2.foreign.camel', f: 'm2.foreign.camelf' },
  hookah: { m: 'm2.foreign.hookah', f: 'm2.foreign.hookahf' },
};

export const TALK: PavilionTalk = {
  pa: {
    clean: [
      'WELCOME TO MOROCCO! THE MIDDLE EAST OF AFRICA! PLEASE HAGGLE RESPONSIBLY!',
      'NOW ENTERING MOROCCO! EVERY CARPET IS HANDMADE! BY A MACHINE! IN OHIO!',
    ],
    shitty: [
      'WELCOME TO MOROCCO! SIR, THE SPICE MARKET SMELLS BAD ENOUGH ALREADY.',
      'NOW ENTERING MOROCCO! SIR, YOU CANNOT TRADE THOSE PANTS FOR A CARPET. WE ASKED.',
    ],
    nude: [
      'WELCOME TO MOROCCO! SIR, IT IS A DRY HEAT. IT IS NOT A NUDE HEAT.',
      'NOW ENTERING MOROCCO! SIR, PLEASE BUY A ROBE. THEY ARE THIRTY PERCENT OFF.',
    ],
  },
  arrive: [
    "MOROCCO. I DON'T KNOW WHERE IT IS. NEITHER DO THEY.",
    'CARPETS ON THE ROOF. CARPETS ON THE WALLS. THIS PLACE HAS A CARPET PROBLEM.',
  ],
  gags: [
    { from: 500, to: 1700, key: 'roofs', lines: ["I'M STANDING ON A RUG ON A ROPE. THAT'S THE PARK'S PROBLEM.", 'NICE RUG. I WIPED MY FEET ON IT.'], minH: 150 },
    { from: 1700, to: 2050, key: 'tower', lines: ['A TOWER. THE ELEVATOR SAYS OUT OF ORDER. SINCE 1994.', "WHO BUILDS A GIFT SHOP UP A TOWER?"], minH: 400 },
    { from: 2250, to: 3150, key: 'dye', lines: ["VATS OF DYE. IF I FALL IN I'M BLUE FOREVER.", 'IT SMELLS LIKE A HOT DUMPSTER FULL OF PAINT.'] },
    { from: 3150, to: 3600, key: 'hookah', lines: ["THAT GUY'S SMOKING A BONG SHAPED LIKE A LAMP.", "THE SMOKE'S APPLE FLAVORED. STILL SMOKE."] },
  ],
};

export const CARPET: ByPants = {
  clean: ['CARPET! GOOD CARPET! FOR YOU, SPECIAL PRICE! FULL PRICE!', "I'M MADISON! I SELL RUGS! I DON'T KNOW WHAT A RUG IS!", 'MAGIC CARPET! IT DOES NOT FLY! NO REFUNDS!'],
  shitty: ['NOT ON THE CARPET! NOT ON THE CARPET!', "YOU'RE BUYING THAT ONE NOW! YOU KNOW WHY!"],
  nude: ['WRAP UP IN A RUG! PLEASE! I GIVE YOU A DISCOUNT!', 'NO SHIRT, NO PANTS, NO HAGGLING!'],
};
export const SNAKE: ByPants = {
  clean: ['THE SNAKE IS REAL! THE FLUTE IS A RECORDER!', "I'M TYLER! I PLAY THE RECORDER! THIRD GRADE BAND!", 'DANCE, SNAKE! GET HIM!'],
  shitty: ['EVEN THE SNAKE IS GAGGING!', 'THE SNAKE WENT BACK IN THE BASKET! SMART SNAKE!'],
  nude: ["THAT'S NOT A SNAKE! I MEAN... PUT IT AWAY!", 'MY SNAKE IS SCARED OF YOUR SNAKE!'],
};
export const CAMEL: ByPants = {
  clean: ["I'M THE FRONT OF THE CAMEL! KAYLEE'S THE BACK!", 'CAMELS SPIT! IT SAYS SO ON MY SCHEDULE!', 'ONE HUMP OR TWO! IT IS ONE HUMP!'],
  shitty: ['IT SMELLS WORSE THAN THE INSIDE OF THIS SUIT!', "I'M NOT EVEN SPITTING! I'M GAGGING!"],
  nude: ["I'M A CAMEL AND I'M MORE DRESSED THAN YOU!", "THAT'S A TOE THING AND I'M NOT SAYING IT!"],
};
export const HOOKAH: ByPants = {
  clean: ["IT'S APPLE FLAVORED, BRO! IT'S BASICALLY FRUIT!", "I'M CHAD! I DO THIS IN MY DORM ANYWAY!", 'BLOW IT IN HIS FACE! THAT IS THE CULTURE, BRO!'],
  shitty: ["BRO, EVEN MY SMOKE CAN'T COVER THAT!", 'DUDE, YOU SMELL LIKE A HOOKAH BAR TOILET!'],
  nude: ["BRO, YOU'RE NAKED IN THE LOUNGE! THERE'S A DRESS CODE! SANDALS!", 'PUT A TOWEL ON IT, BRO!'],
};

export const HURT: HurtTable = {
  'm2:fl_carpet': {
    hurt: ['HE HIT ME WITH A ROLLED-UP RUG!', 'OW! A CARPET! TO THE FACE!', 'QUIT RUGGING ME!'],
    death: ['RUGGED TO DEATH', 'ROLLED UP IN A CARPET'],
  },
  'm2:fl_snakecharmer': {
    hurt: ['THE SNAKE GUY SHOVED ME!', 'OW! THE BASKET!', 'GET YOUR RECORDER AWAY FROM ME!'],
    death: ['CHARMED', 'KILLED BY A RECORDER PLAYER'],
  },
  'm2:fl_snake': {
    hurt: ['THE SNAKE BIT ME!', "IT'S A REAL SNAKE! IT'S A REAL FUCKING SNAKE!", 'SNAKE! SNAKE ON MY LEG!'],
    death: ['SNAKEBIT', 'BITTEN BY A SNAKE IN A BASKET'],
  },
  'm2:fl_camel': {
    hurt: ['THE CAMEL KICKED ME!', 'OW! BOTH ENDS OF THE CAMEL!', 'GET OFF ME, HUMP!'],
    death: ['TRAMPLED BY A CAMEL', 'KILLED BY TWO GUYS IN A CAMEL'],
  },
  'm2:fl_camel_spit': {
    hurt: ['IT SPIT ON ME! IT SPIT IN MY MOUTH!', 'CAMEL SPIT! IN MY EYE!', 'THAT WAS A SQUIRT GUN! I SAW IT!'],
    death: ['SPAT ON TO DEATH', 'DROWNED IN CAMEL SPIT'],
  },
  'm2:fl_hookah': {
    hurt: ['THE HOOKAH GUY HIT ME WITH THE HOSE!', 'OW! THE PIPE!', 'BACK OFF, VAPE BOY!'],
    death: ['HOTBOXED', 'KILLED BY A HOOKAH BRO'],
  },
  'm2:fl_smoke': {
    hurt: ["SMOKE! I CAN'T BREATHE!", 'MY EYES! IT BURNS!', 'STOP BLOWING THAT SHIT AT ME!'],
    death: ['SMOKED', 'SECONDHAND SMOKE'],
  },
  'm2:fl_dye': {
    hurt: ["THE DYE! I'M IN THE DYE!", "HOT! IT'S HOT! AND I'M BLUE!", 'MY BALLS ARE DYED NOW!'],
    death: ['DYED', 'DIED IN A DYE VAT'],
  },
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.carpet, CARPET], [V.snake, SNAKE], [V.camel, CAMEL], [V.hookah, HOOKAH]]);
