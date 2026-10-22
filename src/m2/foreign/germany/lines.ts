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
      'NOW ENTERING GERMANY! SIR, THAT IS NOT WHAT WE MEAN BY A BROWN ALE.',
    ],
    nude: [
      'WELCOME TO GERMANY! SIR, LEDERHOSEN ARE STILL HOSEN.',
      'NOW ENTERING GERMANY! SIR, THE SAUNA IS IN FINLAND. WE DO NOT HAVE A FINLAND.',
    ],
  },
  arrive: [
    'GERMANY. A BEER GARDEN. FINALLY SOMEBODY GETS IT.',
    "OKTOBERFEST. IT'S NOT OCTOBER. I'M NOT ASKING QUESTIONS. I'M DRINKING.",
  ],
  gags: [
    { from: 400, to: 1200, key: 'beer', lines: ['A BEER GARDEN WHERE THE BEER FIGHTS BACK.', 'TWENTY-DOLLAR BEERS. I SHOULD BE THROWING THEM.'] },
    { from: 1700, to: 2200, key: 'clock', lines: ["THE WORLD'S BIGGEST CUCKOO CLOCK. IT'S WRONG.", 'THE LITTLE WOODEN GUYS COME OUT AND SPIN. SAME, BUDDY.'] },
    { from: 2000, to: 2700, key: 'castle', lines: ["A CASTLE. THE DOOR'S PAINTED ON. I KICKED IT ANYWAY.", "I'M ON TOP OF A CASTLE. THE KING'S A TUBA GUY."], minH: 500 },
    { from: 2900, to: 3400, key: 'pretzel', lines: ['A PRETZEL THE SIZE OF MY HEAD. I RESPECT THAT.', "BRATWURST. I'LL BE SHITTING THIS OUT IN CANADA."] },
    // (job 4b: the brewery hill)
    { from: 3850, to: 4300, key: 'kegs', lines: ["THEY'RE ROLLING FULL KEGS DOWN A HILL. AT ME. WHAT A WASTE.", "IT'S RAINING BEER. UPHILL. THE WRONG WAY."] },
    { from: 4880, to: 5060, key: 'brauhaus', lines: ['A BREWERY THAT SERVES BUD LIGHT. GERMANY WOULD CRY.', "THE COPPER KETTLE'S EMPTY. IT'S A PROP. EVERYTHING'S A PROP."], minH: 760 },
  ],
};

/** The keg dock's crew sending one down (the barmaid voices). */
export const KEG: ByPants = {
  clean: ['KEG! KEG! KEG!', "ROLL OUT THE BARREL! THAT'S A SONG! IT'S ALSO AN ORDER!", "THEY'RE FULL! DON'T WASTE THEM! ...WITH YOUR BODY!"],
  shitty: ['KEG! RIGHT AT THE STINK!', 'ROLL IT! FLATTEN HIM! FLATTEN THE SMELL!'],
  nude: ["KEG! AIM FOR THE NAKED ONE! THAT'S GONNA HURT!", 'ROLL IT AT HIS LITTLE BRATWURST!'],
};

export const TUBA: ByPants = {
  clean: ["OOM-PAH! OOM-PAH! THAT'S ALL WE PLAY!", "I'M TYLER! I WAS IN MARCHING BAND! THIS IS THE SAME THING!", "I HAVEN'T FELT MY LIPS SINCE JUNE!"],
  shitty: ['OOM-PAH! OOM... WHAT IS THAT SMELL?!', "I CAN SMELL HIM THROUGH THE TUBA!"],
  nude: ["DUDE, THE LEDERHOSEN COVER THE IMPORTANT PART! YOU DON'T HAVE ANY!", "IT'S FLOPPING IN TIME WITH THE TUBA!"],
};
export const BARMAID: ByPants = {
  clean: ['PROST! THAT MEANS CHEERS! OR FUCK OFF! I FORGET!', "I'M MADISON! I CARRY TWELVE STEINS! I CAN THROW TWELVE STEINS!", 'ONE BEER! COMING UP! AT YOUR HEAD!'],
  shitty: ["YOU'RE CUT OFF! YOU'RE SO CUT OFF!", 'HE SHAT HIMSELF AT A BEER GARDEN! CLASSIC!'],
  nude: ['NO SHIRT, NO SHOES, NO PANTS, NO BEER!', "PUT IT AWAY! WE'RE A FAMILY BEER GARDEN!"],
};
export const SLAPPER: ByPants = {
  clean: ['I SLAP MY OWN ASS FOR TWELVE BUCKS AN HOUR!', 'SCHUHPLATTLER! I CAN SAY IT! I CAN DO IT TO YOUR FACE!', 'SLAP THE THIGH! SLAP THE SHOE! SLAP THE GUY!'],
  shitty: ["I'M NOT SLAPPING THAT ASS! ...OKAY, ONE SLAP!", 'MY HANDS! I SLAPPED IT! MY HANDS!'],
  nude: ["I'M ONLY SLAPPING ABOVE THE WAIST!", 'NAKED SLAP DANCE! THAT IS NOT IN THE SHOW!'],
};

export const HURT: HurtTable = {
  'm2:fl_tuba': {
    hurt: ['HE HIT ME WITH A TUBA!', 'HE TUBA\'D MY NUTS!', 'TUBA TO THE TEETH!'],
    death: ['KILLED BY A MARCHING BAND', 'OOM-PAH\'D'],
  },
  'm2:fl_tuba_blast': {
    hurt: ['THE TUBA KNOCKED ME OVER!', 'OOM-PAH! IN MY CHEST!', "THAT'S NOT MUSIC! THAT'S WIND!"],
    death: ['BLOWN AWAY BY A TUBA', 'OOM-PAH\'D TO DEATH'],
  },
  'm2:fl_barmaid': {
    hurt: ['THE BEER LADY DECKED ME!', 'OW! TWELVE STEINS WORTH OF ARM!', 'NO TIP FOR YOU! FUCK YOU!'],
    death: ['CUT OFF', 'LAST CALL'],
  },
  'm2:fl_stein': {
    hurt: ['A STEIN! A FULL ONE! WHAT A WASTE!', 'BEER IN MY EYE!', 'GLASS IN MY EYEBROW!'],
    death: ['KILLED BY BEER', 'PROST'],
  },
  'm2:fl_slapper': {
    hurt: ['HE SLAPPED ME! HE SLAPPED ME AGAIN!', 'HE SLAPPED MY TITS!', 'THE SLAP DANCE GUY! SLAP-DANCED ME!'],
    death: ['SLAPPED TO DEATH', 'SCHUHPLATTLERED'],
  },
  'm2:fl_cuckoo': {
    hurt: ['THE CUCKOO! IT PECKED ME!', 'A WOODEN BIRD! IN MY FACE!', 'CUCKOO! FUCK YOU!'],
    death: ['CUCKOO\'D', 'KILLED BY A CLOCK'],
  },
  'm2:fl_keg': {
    hurt: ['A KEG! A FULL ONE!', 'RUN OVER BY BEER!', 'MY SHINS! THE KEG GOT MY SHINS!'],
    death: ['FLATTENED BY A KEG', 'ROLLED OUT THE BARREL'],
  },
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.tuba, TUBA], [V.barmaid, BARMAID], [V.slapper, SLAPPER], [{ m: V.barmaid.f, f: V.barmaid.f }, KEG]]);
