// What's said in Japan (the PA's hello, his lines, the cast's barks, what hurts him here), by voice.

import { pavilionVoices, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

export const V = {
  ninja: { m: 'm2.foreign.ninja', f: 'm2.foreign.ninjaf' },
  sumo: { m: 'm2.foreign.sumo', f: 'm2.foreign.sumof' },
  samurai: { m: 'm2.foreign.samurai', f: 'm2.foreign.samuraif' },
  cosplay: { m: 'm2.foreign.cosplay', f: 'm2.foreign.cosplayf' },
};

export const TALK: PavilionTalk = {
  pa: {
    clean: [
      'KONNICHIWA AND WELCOME TO JAPAN! HOME OF NINJAS, SUSHI, AND THE CALIFORNIA ROLL!',
      'NOW ENTERING JAPAN! PLEASE BOW TO THE CAST MEMBERS! THEY WILL NOT BOW BACK!',
    ],
    shitty: [
      'WELCOME TO JAPAN! SIR, THE TOILETS HERE HAVE BUTTONS. YOU CLEARLY NEEDED ONE.',
      'NOW ENTERING JAPAN! SIR, PLEASE DO NOT SIT IN THE KOI POND.',
    ],
    nude: [
      'WELCOME TO JAPAN! SIR, THE BATHHOUSE IS NOT OPEN. IT IS ALSO NOT HERE.',
      'NOW ENTERING JAPAN! SIR, THIS IS NOT THAT KIND OF ANIME.',
    ],
  },
  arrive: [
    'JAPAN. A TASTE OF CHINA. THEY JUST SWAPPED THE SIGNS.',
    "JAPAN. EVERYTHING HERE'S A NINJA OR A VENDING MACHINE.",
  ],
  gags: [
    { from: 600, to: 1200, key: 'koi', lines: ["THAT FISH IS A ROBOT. IT'S JUMPING AT PEOPLE.", "BIG FISH. I'M NOT EATING IT RAW."] },
    { from: 1200, to: 1700, key: 'vending', lines: ['A VENDING MACHINE THAT SELLS VENDING MACHINES.', 'HOT CORN SOUP IN A CAN. NO.'] },
    { from: 1750, to: 2300, key: 'pagoda', lines: ['FIVE FLOORS OF NOTHING. GREAT TOWER.', "EVERY FLOOR'S GOT A NINJA. THAT'S THE WHOLE TOWER."], minH: 300 },
    { from: 2350, to: 2900, key: 'sumo', lines: ["A FAT GUY IN A DIAPER. RESPECT.", "I COULD DO SUMO. I'M HALFWAY THERE."] },
  ],
};

export const NINJA: ByPants = {
  clean: ["YOU CAN'T SEE ME! I'M A NINJA! I'M BRAYDEN!", 'HI-YAH! SMOKE BOMB! I MEAN, POOF!', "NINJAS ARE FROM JAPAN, RIGHT? COOL, SO I'M FROM JAPAN!"],
  shitty: ['I CAN SMELL YOU FROM THE SHADOWS!', 'STEALTH MODE! OH GOD, THE SMELL BROKE MY STEALTH!'],
  nude: ["I'M THE ONE WHO'S SUPPOSED TO BE HIDDEN! COVER UP!", 'EVEN NINJAS WEAR PANTS, DUDE!'],
};
export const SUMO: ByPants = {
  clean: ["I'M TYLER! THIS IS A FAT SUIT! MOSTLY!", 'SUMO! THAT MEANS BIG HUG!', 'GET IN THE RING, BRO! THE RING IS A CIRCLE!'],
  shitty: ["THAT'S NOT MY DIAPER! THAT'S YOURS!", "I'M IN A DIAPER AND YOU STILL SMELL WORSE!"],
  nude: ["I'M THE ONE WHO'S SUPPOSED TO BE ALMOST NAKED!", 'PUT A DIAPER ON! I HAVE A SPARE!'],
};
export const SAMURAI: ByPants = {
  clean: ['I AM SAMURAI! I AM KAYLEE! I TOOK FENCING!', "HONOR! I DON'T KNOW WHAT IT MEANS! HONOR!", 'THIS SWORD IS FOAM! THE PAIN IS REAL!'],
  shitty: ['YOU HAVE NO HONOR! AND NO CLEAN UNDERWEAR!', 'A SAMURAI DIES BEFORE SMELLING THAT!'],
  nude: ['SHAME! SO MUCH SHAME! MOSTLY YOURS!', "I'LL CUT IT OFF! NOT IT! YOUR HEAD!"],
};
export const COSPLAY: ByPants = {
  clean: ["I'M THE CHOSEN ONE! FROM THE SHOW! YOU WOULDN'T KNOW IT!", 'MY POWER LEVEL IS OVER... A LOT!', 'SENPAI WILL NOTICE ME NOW!'],
  shitty: ["EWW! YOU'RE LIKE A FILLER EPISODE!", 'MY WIG! IT SMELLS LIKE YOU NOW!'],
  nude: ['THIS IS A FAMILY CON! COVER UP!', "THAT'S NOT A COSPLAY! THAT'S A CRIME!"],
};
/** The cosplay kid's scream, charging the ball (legally distinct, half remembered). */
export const SCREAM = ['ULTRA... MEGA... BEAM... OF THE HEART!', 'POWER OF FRIENDSHIP... BLAST!', 'FINAL FORM! FINAL FORM! FIRE!'];

export const HURT: HurtTable = {
  'm2:fl_ninja': {
    hurt: ['THE NINJA KICKED ME!', 'OW! WHERE DID HE COME FROM?!', 'SNEAKY LITTLE BITCH!'],
    death: ["NINJA'D", 'NEVER SAW IT COMING'],
  },
  'm2:fl_shuriken': {
    hurt: ['A THROWING STAR! IN MY FACE!', 'OW! THE FOAM ONES STILL HURT!', 'STOP THROWING STARS!'],
    death: ['STARRED TO DEATH', 'SHURIKEN TO THE FACE'],
  },
  'm2:fl_sumo': {
    hurt: ['THE FAT GUY SHOVED ME!', 'OOF! HE BELLY BUMPED ME!', 'GET YOUR GUT OFF ME!'],
    death: ['CRUSHED BY A SUMO', 'PUSHED OUT OF THE RING'],
  },
  'm2:fl_sumo_stomp': {
    hurt: ['THE WHOLE GROUND JUMPED!', 'HE STOMPED AND I FELL OVER!', 'QUIT STOMPING, FATSO!'],
    death: ['STOMPED', 'SHOOK TO DEATH BY A FAT GUY'],
  },
  'm2:fl_samurai': {
    hurt: ['THE SAMURAI SHOVED ME!', "OW! THAT ARMOR'S HARD!", 'BACK OFF, SHOGUN!'],
    death: ['DISHONORED', 'KILLED BY A SAMURAI FROM OHIO'],
  },
  'm2:fl_samurai_blade': {
    hurt: ['I RAN RIGHT ONTO HIS SWORD!', 'THE SWORD! I CHARGED THE SWORD!', "THAT'S A POINTY FUCKING FOAM SWORD!"],
    death: ['SKEWERED ON A KATANA', 'RAN ONTO A SWORD'],
  },
  'm2:fl_cosplay': {
    hurt: ['THE ANIME KID HIT ME WITH A FOAM SWORD!', 'OW! THE BIG SWORD!', 'GET YOUR WIG OUT OF MY FACE!'],
    death: ['KILLED BY A WEEB', 'DEFEATED IN ONE EPISODE'],
  },
  'm2:fl_ki_blast': {
    hurt: ['THE GLITTER BALL! IT WORKED!', 'HE SCREAMED AND IT FUCKING WORKED!', 'POWER OF FRIENDSHIP, MY ASS!'],
    death: ['BLASTED BY FRIENDSHIP', 'POWER LEVEL: DEAD'],
  },
  'm2:fl_koi': {
    hurt: ['THE ROBOT FISH HIT ME!', 'A GIANT FISH! IN MY FACE!', 'FUCK THIS FISH!'],
    death: ['KILLED BY A KOI', 'SLAPPED BY A ROBOT FISH'],
  },
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.ninja, NINJA], [V.sumo, SUMO], [V.samurai, SAMURAI], [V.cosplay, COSPLAY]], {
  [V.cosplay.m]: SCREAM, [V.cosplay.f]: SCREAM,
});
