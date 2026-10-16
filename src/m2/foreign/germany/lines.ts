// What's said in Germany (the PA's hello, his lines, the cast's barks, what hurts him here), by voice.

import { pavilionVoices, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

export const V = {
  tuba: { m: 'm2.foreign.tuba', f: 'm2.foreign.tubaf' },
  barmaid: { m: 'm2.foreign.barmaid', f: 'm2.foreign.barmaidf' },
  slapper: { m: 'm2.foreign.slapper', f: 'm2.foreign.slapperf' },
};

export const TALK: PavilionTalk = {
  pa: {
    clean: [
      'WILLKOMMEN TO GERMANY! IT IS OKTOBERFEST HERE THREE HUNDRED AND SIXTY-FIVE DAYS A YEAR!',
      'NOW ENTERING GERMANY! HOME OF THE PRETZEL, THE BRATWURST, AND THE DUTCH!',
    ],
    shitty: [
      'WELCOME TO GERMANY! SIR, THE BEER IS SUPPOSED TO GO IN THE STEIN. NOT OUT THE BACK.',
      'NOW ENTERING GERMANY! SIR, THE LEDERHOSEN ARE NOT FOR RENT. NOT TO YOU.',
    ],
    nude: [
      'WELCOME TO GERMANY! SIR, LEDERHOSEN ARE STILL HOSEN.',
      'NOW ENTERING GERMANY! SIR, THE SAUNA IS IN FINLAND. WE DO NOT HAVE A FINLAND.',
    ],
  },
  arrive: [
    'GERMANY. A BEER GARDEN. FINALLY SOMEBODY GETS IT.',
    'OKTOBERFEST. IT IS NOT OCTOBER. NOBODY HERE OWNS A CALENDAR.',
  ],
  gags: [
    { from: 400, to: 1200, key: 'beer', lines: ['A BEER GARDEN WHERE THE BEER FIGHTS BACK.', 'TWENTY-DOLLAR BEERS. I SHOULD BE THROWING THEM.'] },
    { from: 1700, to: 2200, key: 'clock', lines: ["THE WORLD'S BIGGEST CUCKOO CLOCK. IT'S WRONG.", 'THE LITTLE WOODEN GUYS COME OUT AND SPIN. SAME, BUDDY.'] },
    { from: 2000, to: 2700, key: 'castle', lines: ['A CASTLE. THE DOOR IS LOCKED. THE CLOCK IS NOT.', "I'M ON TOP OF A CASTLE. THE KING'S A TUBA GUY."], minH: 500 },
    { from: 2900, to: 3400, key: 'pretzel', lines: ['A PRETZEL THE SIZE OF MY HEAD. I RESPECT THAT.', 'BRATWURST. NOW WE ARE TALKING.'] },
  ],
};

export const TUBA: ByPants = {
  clean: ["OOM-PAH! OOM-PAH! THAT'S ALL WE PLAY!", "I'M TYLER! I WAS IN MARCHING BAND! THIS IS THE SAME THING!", 'ROLL OUT THE BARREL! THAT ONE IS POLISH!'],
  shitty: ['OOM-PAH! OOM... WHAT IS THAT SMELL?!', "I CAN SMELL HIM THROUGH THE TUBA!"],
  nude: ["DUDE, THE LEDERHOSEN COVER THE IMPORTANT PART! YOU DON'T HAVE ANY!", 'OOM-PAH! OH GOD! OOM-PAH!'],
};
export const BARMAID: ByPants = {
  clean: ['PROST! THAT MEANS CHEERS! OR GOODBYE! I FORGET!', "I'M MADISON! I CARRY TWELVE STEINS! I CAN THROW TWELVE STEINS!", 'ONE BEER! COMING UP! AT YOUR HEAD!'],
  shitty: ["YOU'RE CUT OFF! YOU'RE SO CUT OFF!", 'HE SHAT HIMSELF AT A BEER GARDEN! CLASSIC!'],
  nude: ['NO SHIRT, NO SHOES, NO PANTS, NO BEER!', "PUT IT AWAY! WE'RE A FAMILY BEER GARDEN!"],
};
export const SLAPPER: ByPants = {
  clean: ["IT'S A SLAP DANCE! IT'S TRADITIONAL! I SLAP!", 'SCHUHPLATTLER! I CAN SAY IT! I CAN DO IT TO YOUR FACE!', 'SLAP THE THIGH! SLAP THE SHOE! SLAP THE GUY!'],
  shitty: ["I'M NOT SLAPPING THAT ASS! ...OKAY, ONE SLAP!", 'MY HANDS! I SLAPPED IT! MY HANDS!'],
  nude: ["I'M ONLY SLAPPING ABOVE THE WAIST!", 'NAKED SLAP DANCE! THAT IS NOT IN THE SHOW!'],
};

export const HURT: HurtTable = {
  'm2:fl_tuba': {
    hurt: ['HE HIT ME WITH A TUBA!', 'OW! THE BRASS!', 'TUBA TO THE TEETH!'],
    death: ['KILLED BY A MARCHING BAND', 'OOM-PAH\'D'],
  },
  'm2:fl_tuba_blast': {
    hurt: ['THE TUBA KNOCKED ME OVER!', 'OOM-PAH! IN MY CHEST!', "THAT'S NOT MUSIC! THAT'S WIND!"],
    death: ['BLOWN AWAY BY A TUBA', 'OOM-PAH\'D TO DEATH'],
  },
  'm2:fl_barmaid': {
    hurt: ['THE WAITSTAFF HIT ME!', 'OW! TWELVE STEINS WORTH OF ARM!', 'NO TIP FOR YOU! FUCK YOU!'],
    death: ['CUT OFF', 'LAST CALL'],
  },
  'm2:fl_stein': {
    hurt: ['A STEIN! A FULL ONE! WHAT A WASTE!', 'BEER IN MY EYE!', 'GLASS! IN MY FACE!'],
    death: ['KILLED BY BEER', 'PROST'],
  },
  'm2:fl_slapper': {
    hurt: ['HE SLAPPED ME! HE SLAPPED ME AGAIN!', 'QUIT SLAPPING ME!', 'THE SLAP DANCE GUY! SLAP-DANCED ME!'],
    death: ['SLAPPED TO DEATH', 'SCHUHPLATTLERED'],
  },
  'm2:fl_cuckoo': {
    hurt: ['THE CUCKOO! IT PECKED ME!', 'A WOODEN BIRD! IN MY FACE!', 'CUCKOO! FUCK YOU!'],
    death: ['CUCKOO\'D', 'KILLED BY A CLOCK'],
  },
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.tuba, TUBA], [V.barmaid, BARMAID], [V.slapper, SLAPPER]]);
