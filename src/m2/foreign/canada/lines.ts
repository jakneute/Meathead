// What's said in Canada (the PA's hello, his lines, the cast's barks, what hurts him here), by voice. Everybody here
// apologizes as they attack (SORRY: shouted on every strike, the bark's own rules permitting).

import { pavilionVoices, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

export const V = {
  lumberjack: { m: 'm2.foreign.lumberjack', f: 'm2.foreign.lumberjackf' },
  mountie: { m: 'm2.foreign.mountie', f: 'm2.foreign.mountief' },
  hockey: { m: 'm2.foreign.hockey', f: 'm2.foreign.hockeyf' },
  moose: { m: 'm2.foreign.moose', f: 'm2.foreign.moosef' },
};

export const TALK: PavilionTalk = {
  pa: {
    clean: [
      "WELCOME TO CANADA! AMERICA'S HAT! IT'S LIKE AMERICA, BUT SORRY ABOUT IT!",
      'NOW ENTERING CANADA! THE LAST STOP ON OUR TOUR OF THE WHOLE WORLD! NEXT: THE SHOW!',
    ],
    shitty: [
      'WELCOME TO CANADA! SIR, THEY WILL APOLOGIZE FOR YOUR SMELL. THEY SHOULD NOT HAVE TO.',
      "NOW ENTERING CANADA! SIR, THAT IS NOT WHAT THEY MEAN BY A BROWN BEAR.",
    ],
    nude: [
      'WELCOME TO CANADA! SIR, IT IS NINETEEN DEGREES FAHRENHEIT IN THE ROCKIES SECTION. WE CAN TELL.',
      'NOW ENTERING CANADA! SIR, THE MOUNTIES ALWAYS GET THEIR MAN. PLEASE DO NOT MAKE IT WEIRD.',
    ],
  },
  arrive: [
    "CANADA. IT'S JUST COLD AMERICA WITH A MOOSE.",
    "CANADA. THEY'RE GONNA SAY SORRY WHILE THEY HIT ME. I CAN FEEL IT.",
  ],
  gags: [
    { from: 300, to: 1100, key: 'poles', lines: ['CARVED POLES. A MOOSE, A BEAVER, A HOCKEY GUY. DEEP.', 'MADE IN OHIO. IT SAYS IT RIGHT ON THE BEAVER.'] },
    { from: 1100, to: 1650, key: 'logs', lines: ["LOGS IN A POND. THAT'S A WHOLE ATTRACTION?", 'LOG ROLLING. IT IS WHAT IT SOUNDS LIKE.'] },
    { from: 1900, to: 2300, key: 'falls', lines: ['THE WATERFALL IS A PIPE. I CAN SEE THE PIPE.', "THE LOG RIDE'S DUMPING LOGS DOWN THE FALLS. ON PURPOSE?"], minH: 250 },
    { from: 2300, to: 2950, key: 'rink', lines: ['A HOCKEY RINK ON A MOUNTAIN. SURE.', 'THESE GUYS SAY SORRY AND THEN SLAPSHOT YOU IN THE NUTS.'], minH: 800 },
  ],
};

export const LUMBERJACK: ByPants = {
  clean: ["I'M A LUMBERJACK AND I'M OKAY! I'M TYLER!", "TIMBER! THAT'S YOU! YOU'RE THE TIMBER!", "I'VE NEVER CUT DOWN A TREE! FIRST TIME FOR EVERYTHING, EH?"],
  shitty: ['OH JEEZ! OH JEEZ, BUD, THAT SMELL!', "SORRY! I'M SORRY! BUT YOU REEK, BUD!"],
  nude: ["SORRY, BUD, BUT IT'S TOO COLD TO BE DOING THAT!", 'PUT ON SOME FLANNEL! I HAVE EXTRA FLANNEL!'],
};
export const MOUNTIE: ByPants = {
  clean: ["THE MOUNTIE ALWAYS GETS HIS MAN! I'M KAYLEE! I GET MY MAN!", "GIDDY UP! IT'S A STICK! IT'S STILL A HORSE!", 'HALT, IN THE NAME OF... CANADA? IS THAT A NAME?'],
  shitty: ["EVEN MY FAKE HORSE CAN SMELL YOU!", 'SORRY, SIR, BUT YOU ARE UNDER ARREST FOR THAT SMELL!'],
  nude: ["I'M ARRESTING YOU FOR THAT! SORRY! BUT I AM!", 'SIR! IT IS FREEZING! SORRY! COVER UP!'],
};
export const HOCKEY: ByPants = {
  clean: ["I'M BRAYDEN! I PLAYED HOCKEY ONCE! ON A WII!", 'SLAPSHOT! SORRY! SLAPSHOT!', "DROP THE GLOVES! NO, KEEP THEM, IT'S COLD!"],
  shitty: ['THE ZAMBONI SMELLS BETTER THAN YOU, BUD!', "THAT'S A PENALTY! TWO MINUTES FOR STINKING!"],
  nude: ['YOU NEED A CUP, BUD! YOU NEED SO MANY CUPS!', 'FIVE MINUTES IN THE BOX FOR INDECENCY! SORRY!'],
};
export const MOOSE: ByPants = {
  clean: ["I'M THE MOOSE! I'M MADISON! IT'S HOT IN HERE!", "MOOSE NOISE! I DON'T KNOW WHAT A MOOSE SAYS!", 'SORRY! MOOSE COMING THROUGH! SORRY!'],
  shitty: ['I CAN SMELL YOU THROUGH THE MOOSE HEAD!', "THE MOOSE SUIT HASN'T BEEN WASHED IN YEARS AND YOU'RE WORSE!"],
  nude: ["I'M A MOOSE AND I'M WEARING MORE THAN YOU!", "SORRY! I'M SORRY! I SAW EVERYTHING! SORRY!"],
};
/** Shouted on every strike (Canada's cast all apologize as they attack). */
export const SORRY = ['SORRY! SORRY!', 'OH, SORRY!', 'SORRY ABOUT THIS!', "SORRY, BUD!", 'SO SORRY!', 'SORRY! MY BAD! SORRY!'];

export const HURT: HurtTable = {
  'm2:fl_lumberjack': {
    hurt: ['THE LUMBERJACK CHOPPED ME!', "OW! HE SAID SORRY AND THEN HE AXED ME!", 'NOT THE AXE! NOT THE AXE!'],
    death: ['CHOPPED DOWN', 'TIMBER'],
  },
  'm2:fl_mountie': {
    hurt: ['THE MOUNTIE RAN ME OVER! WITH A STICK HORSE!', 'OW! THE HORSE! THE FAKE HORSE!', 'SHE TROTTED RIGHT INTO ME!'],
    death: ['GOT HIS MAN', 'TRAMPLED BY A STICK HORSE'],
  },
  'm2:fl_hockey': {
    hurt: ['THE HOCKEY GUY CHECKED ME!', 'OW! HE HIT ME WITH THE STICK!', 'HIGH STICKING! THAT IS HIGH STICKING!'],
    death: ['CHECKED INTO THE BOARDS', 'PENALTY: DEATH'],
  },
  'm2:fl_puck': {
    hurt: ['A PUCK! RIGHT IN THE SHIN!', 'OW! THE PUCK! THE FUCKING PUCK!', 'PUCK TO THE NUTS!'],
    death: ['PUCKED', 'SLAPSHOT TO THE HEAD'],
  },
  'm2:fl_moose': {
    hurt: ['THE MOOSE RAMMED ME!', 'OW! IT SAID SORRY AND RAMMED ME!', 'GET YOUR ANTLERS OUT OF MY ASS!'],
    death: ['KILLED BY A MOOSE', 'GORED BY A GUY IN A MOOSE SUIT'],
  },
  'm2:fl_moose_antlers': {
    hurt: ['I LANDED ON THE ANTLERS!', 'OW! THE ANTLERS ARE POINTY!', 'MOOSE HORNS! IN MY FEET!'],
    death: ['IMPALED ON ANTLERS', 'STOMPED ON A MOOSE AND LOST'],
  },
  'm2:fl_flume_log': {
    hurt: ['A LOG! A LOG CAME DOWN THE WATERFALL!', 'OW! THE LOG RIDE THREW A LOG AT ME!', 'LOG! LOG! LOG!'],
    death: ['FLATTENED BY A LOG', 'LOGGED'],
  },
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.lumberjack, LUMBERJACK], [V.mountie, MOUNTIE], [V.hockey, HOCKEY], [V.moose, MOOSE]], Object.fromEntries(
  [V.lumberjack, V.mountie, V.hockey, V.moose].flatMap(v => [[v.m, SORRY], [v.f, SORRY]]),
));
