// What's said in China (the PA's hello, his lines, the cast's barks, what hurts him here), by voice.

import { pavilionVoices, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

export const V = {
  kungfu: { m: 'm2.foreign.kungfu', f: 'm2.foreign.kungfuf' },
  dragon: { m: 'm2.foreign.dragon', f: 'm2.foreign.dragonf' },
  fireworks: { m: 'm2.foreign.fireworks', f: 'm2.foreign.fireworksf' },
};

export const TALK: PavilionTalk = {
  pa: {
    clean: [
      'NOW ENTERING CHINA! HOME OF THE GREAT WALL! OURS IS ONE FORTIETH THE SIZE AND TWICE AS GREAT!',
      'WELCOME TO CHINA! EVERYTHING IN THIS PAVILION WAS MADE IN CHINA. SO IT IS AUTHENTIC.',
    ],
    shitty: [
      'WELCOME TO CHINA! SIR, THE GREAT WALL CAN BE SEEN FROM SPACE. SO CAN YOUR PANTS.',
      'NOW ENTERING CHINA! SIR, THAT IS NOT WHAT WE MEAN BY TAKEOUT.',
    ],
    nude: [
      'WELCOME TO CHINA! SIR, THE TERRACOTTA ARMY WORE ARMOR. YOU ARE WEARING NOTHING.',
      'NOW ENTERING CHINA! SIR, PLEASE COVER YOUR FORTUNE COOKIE.',
    ],
  },
  arrive: [
    'A TASTE OF ASIA, JAPAN. THE SIGN SAYS CHINA. THE SIGN ALSO SAYS JAPAN.',
    "THE GREAT WALL. I GOTTA CLIMB A WALL. I CAN'T CLIMB STAIRS.",
  ],
  gags: [
    { from: 900, to: 1250, key: 'tower', lines: ['A STAIRCASE WOULD BE NICE. JUST ONE.', 'THE TOWER HAS NO STAIRS. JUST SHELVES.'], minH: 100 },
    { from: 1300, to: 2000, key: 'wall', lines: ["THEY BUILT THIS TO KEEP PEOPLE OUT. IT DIDN'T WORK. I'M HERE.", 'MY LEGS ARE ON FIRE. THE WALL WON.'], minH: 400 },
    { from: 2550, to: 2750, key: 'dip', lines: ['DOWN, THEN UP. WHO DESIGNED THIS? A MOUNTAIN?', 'THE WALL GOES DOWN JUST TO GO BACK UP. FUCK THE WALL.'], minH: 380 },
    { from: 4300, to: 4620, key: 'top', lines: ["YOU CAN SEE THE WHOLE PARK FROM UP HERE. IT'S ALL PARKING LOT.", "I CAN SEE MEXICO FROM HERE. IT'S SMOKING."], minH: 1000 },
    // (job 4b: the second ridge, the battery, the beacon tower)
    { from: 4650, to: 5250, key: 'saddle', lines: ["IT KEEPS GOING. WHY DOES IT KEEP GOING?", 'A SECOND MOUNTAIN. THE FIRST ONE WAS A WARMUP. FUCK ME.'], minH: 700 },
    { from: 5250, to: 5650, key: 'shelling', lines: ["THEY'RE SHELLING THE GREAT WALL. FROM THE GREAT WALL. WITH FIREWORKS.", 'INCOMING! I ALWAYS WANTED TO SAY INCOMING!'], minH: 800 },
    { from: 6000, to: 6260, key: 'beacon', lines: ["TOP OF THE WORLD. I CAN SEE CANADA. IT'S APOLOGIZING.", "HIGHEST POINT IN OHIO. I'M NOT EVEN IN OHIO."], minH: 1600 },
    { from: 6500, to: 7030, key: 'scaffold', lines: ['THE GREAT WALL ENDS IN A SCAFFOLD. HISTORICALLY ACCURATE.', 'BUILT IN 1987. STILL UNDER CONSTRUCTION.'], maxH: 1200 },
  ],
};

export const KUNGFU: ByPants = {
  clean: ['HI-YAH! I TOOK TAEKWONDO! THAT COUNTS!', "I'M KAYLEE! I'M A KUNG FU MASTER! SINCE TUESDAY!", 'WAX ON! WAIT, THAT IS THE OTHER ONE!'],
  shitty: ['DRUNKEN MASTER! NO, SHITTY MASTER!', 'MY SIFU NEVER WARNED ME ABOUT THIS STYLE!'],
  nude: ["THAT'S NOT A KUNG FU STANCE! THAT'S A NAKED GUY!", 'CRANE STYLE! NO! NOT THAT CRANE!'],
};
/** What they shout as they fly at him (in the kick). */
export const MOVES: string[] = ['CRANE KICK!', 'DRAGON PUNCH!', 'TIGER... SOMETHING!', 'HADOUKEN!', 'FIVE POINT PALM! FOOT!', 'FLYING... KICK!'];
export const DRAGON: ByPants = {
  clean: ["WE'RE THE DRAGON! I'M THE BUTT!", "IT'S HOT IN HERE! I CAN'T SEE ANYTHING!", 'HAPPY NEW YEAR! IT IS NOT NEW YEAR!'],
  shitty: ["WHO FARTED IN THE DRAGON?! OH, IT'S HIM!", "IT SMELLS IN HERE! IT SMELLS WORSE OUT THERE!"],
  nude: ['THE DRAGON IS MORE DRESSED THAN YOU, BRO!', "DON'T LOOK UP! WE'RE AT CROTCH LEVEL!"],
};
export const FIREWORKS: ByPants = {
  clean: ["FIRE IN THE HOLE! I DON'T KNOW WHAT THAT MEANS!", "I'M IN PYROTECHNICS! I HAVE NO TRAINING!", 'THE CHINESE INVENTED THESE! WE IMPROVED THEM! WITH MORE!'],
  shitty: ["DON'T LIGHT ANYTHING NEAR HIM! HE'S A GAS LEAK!", "IS THAT METHANE?! EVERYBODY BACK UP!"],
  nude: ['LIGHTING YOUR FUSE! WAIT, NO! NO!', "I'M NOT AIMING AT THAT! I'M NOT AIMING NEAR THAT!"],
};

/** The battery's intern lighting a volley (the pyrotechnics voices). */
export const BATTERY: ByPants = {
  clean: ['FIRE IN THE HOLE! ALL THE HOLES!', "THE SHOW'S EVERY FIVE SECONDS! IT'S A LOT OF SHOW!", "I'M AIMING! I'M NOT LICENSED TO AIM!"],
  shitty: ["AIM FOR THE SMELL! YOU CAN'T MISS!", 'LIGHT IT UP! NOT HIM! HE MIGHT BLOW!'],
  nude: ["AIM FOR THE NAKED GUY! IT'S A BIG TARGET! IT'S NOT THAT BIG!", 'FIRE! COVER HIS JUNK WITH SMOKE!'],
};

export const HURT: HurtTable = {
  'm2:fl_kungfu': {
    hurt: ['KICKED BY A KAYLEE!', 'OW! THAT WAS A REAL KICK!', 'HE SAID CRANE KICK! HE MEANT IT!'],
    death: ['KUNG FU FIGHTING', 'CRANE KICKED TO DEATH'],
  },
  'm2:fl_dragon': {
    hurt: ['THE DRAGON BIT ME! IT HAS FELT TEETH!', 'RUN OVER BY A PARADE!', 'OW! SIX KIDS IN A BLANKET!'],
    death: ['EATEN BY A PARADE', 'TRAMPLED BY SIX COLLEGE KIDS'],
  },
  'm2:fl_fireworks': {
    hurt: ['HE HIT ME WITH THE LIGHTER!', 'OW! THE FIREWORKS GUY!', 'QUIT LIGHTING ME!'],
    death: ['KILLED BY AN INTERN', 'LIT UP BY PYROTECHNICS'],
  },
  'm2:fl_firework': {
    hurt: ['FIREWORKS! IN MY FACE!', 'MY EYEBROWS! WHERE ARE MY EYEBROWS?!', 'THAT ONE WAS ILLEGAL IN OHIO!'],
    death: ['HAPPY FOURTH OF JULY', 'EXPLODED. FESTIVELY.'],
  },
  'm2:fl_mortar': {
    hurt: ['A MORTAR! ON THE GREAT WALL!', 'THE FIREWORKS SHOW HIT ME!', 'MY ASS IS ON FIRE! FESTIVELY!'],
    death: ['SHELLED ON THE GREAT WALL', 'THE GRAND FINALE'],
  },
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.kungfu, KUNGFU], [V.dragon, DRAGON], [V.fireworks, FIREWORKS], [{ m: V.fireworks.m, f: V.fireworks.m }, BATTERY]],{ [V.kungfu.m]: MOVES, [V.kungfu.f]: MOVES });
