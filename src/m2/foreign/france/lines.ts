// What's said in France (the PA's hello, his lines, the cast's barks, what hurts him here), by voice.

import { pavilionVoices, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

export const V = {
  mime: { m: 'm2.foreign.mime', f: 'm2.foreign.mimef' },
  waiter: { m: 'm2.foreign.waiter', f: 'm2.foreign.waiterf' },
  baguette: { m: 'm2.foreign.baguette', f: 'm2.foreign.baguettef' },
  cancan: { m: 'm2.foreign.cancan', f: 'm2.foreign.cancanf' },
  smoker: { m: 'm2.foreign.smoker', f: 'm2.foreign.smokerf' },
};

export const TALK: PavilionTalk = {
  pa: {
    clean: [
      'BONJOUR AND WELCOME TO FRANCE! THE OOH LA LA ZONE! FRIES SOLD SEPARATELY!',
      'NOW ENTERING PARIS, FRANCE! HOME OF THE ARC DE TRIOMPHE! OURS IS BIGGER!',
    ],
    shitty: [
      'WELCOME TO FRANCE! SIR, THAT SMELL IS NOT A CHEESE. WE CHECKED.',
      'NOW ENTERING PARIS! SIR, EVEN THE FRENCH THINK YOU SHOULD SHOWER.',
    ],
    nude: [
      'WELCOME TO FRANCE! SIR, THE FRENCH ARE RELAXED ABOUT NUDITY. WE ARE NOT FRENCH.',
      'NOW ENTERING PARIS! SIR, NOBODY ASKED TO BE PAINTED LIKE ONE OF YOUR FRENCH GIRLS.',
    ],
  },
  arrive: [
    "FRANCE. EVERYBODY'S SMOKING AND NOBODY'S HAPPY TO SEE ME.",
    'FRANCE. THE COUNTRY THAT GAVE US FRIES AND ATTITUDE.',
  ],
  gags: [
    { from: 300, to: 1100, key: 'cafe', lines: ["A CAFE. EIGHT BUCKS FOR A COFFEE THE SIZE OF A THIMBLE.", "THE WAITER LOOKED AT ME LIKE I'M THE PROBLEM."] },
    { from: 600, to: 1700, key: 'mime', lines: ["A MIME. THE ONLY GOOD THING ABOUT A MIME IS THEY CAN'T TALK BACK.", "HE MADE A WALL. A FAKE WALL. AND IT WORKS."] },
    { from: 1100, to: 1500, key: 'cancan', lines: ['THE CAN-CAN. KICKING IN A LINE. SURE.', "THEY ALL KICK AT ONCE. THAT'S THE WHOLE TRICK."] },
    { from: 1550, to: 2650, key: 'arc', lines: ["A GIANT ARCH FOR WINNING A WAR. THE FRENCH. WINNING. SURE.", 'A DOOR THE SIZE OF A BUILDING. AND NO BUILDING.'], minH: 340 },
    // (job 4b: the Louvre, the Seine)
    { from: 3700, to: 4100, key: 'louvre', lines: ['THE LOUVRE. A GLASS PYRAMID FULL OF GIFT SHOP.', "A MUSEUM. I'VE NEVER BEEN IN ONE. I'M STILL NOT GOING IN."] },
    { from: 4200, to: 4400, key: 'mona', lines: ["THE MONA LISA. IT'S A POSTCARD. SHE STILL LOOKS SMUG.", "THAT'S IT? I CLIMBED A PYRAMID FOR A POSTCARD?"], minH: 460 },
    { from: 4700, to: 5000, key: 'seine', lines: ['THE SEINE. IT SAYS A PUDDLE. IT IS A PUDDLE.', "USED BOOKS. IN FRENCH. I DON'T READ IN ENGLISH."] },
  ],
};

export const MIME: ByPants = {
  clean: ["I'M NOT SUPPOSED TO TALK! I'M BRAYDEN! DAMN IT!", 'INVISIBLE WALL! SEE? YOU CAN SEE IT, RIGHT?', "I'M TRAPPED IN A BOX! FOR REAL! MY SHIFT IS EIGHT HOURS!"],
  shitty: ["I'M MIMING THAT I CAN'T SMELL YOU! IT'S NOT WORKING!", 'EVEN MY INVISIBLE WALL CAN SMELL YOU!'],
  nude: ["I'M MIMING THAT I DIDN'T SEE THAT!", 'PUT ON INVISIBLE PANTS AT LEAST!'],
};
export const WAITER: ByPants = {
  clean: ['YOU WANT A TABLE? NO.', "I'M KAYLEE! I'M RUDE ON PURPOSE! IT'S IN THE TRAINING!", 'THE SPECIAL IS GO AWAY!'],
  shitty: ['WE HAVE A DRESS CODE! IT IS: NOT THAT!', 'THE CHEESE SMELLS BETTER THAN YOU! THE CHEESE!'],
  nude: ['NO SHIRT, NO SHOES, NO SERVICE! NO PANTS, NO MERCY!', 'MONSIEUR! WHERE IS YOUR EVERYTHING!'],
};
export const BAGUETTE: ByPants = {
  clean: ['HON HON HON! THAT IS WHAT FRENCH PEOPLE SAY!', "I'M TYLER! THIS BAGUETTE IS FROM COSTCO!", 'TAKE THE BREAD! TAKE IT IN THE FACE!'],
  shitty: ['THE BREAD IS RUINED! THE SMELL GOT IN THE BREAD!', 'OH GOD, IT SMELLS LIKE A FRENCH SUBWAY!'],
  nude: ['PUT A BAGUETTE OVER IT! A SMALL ONE! ...A CROISSANT!', 'THIS IS NOT THAT KIND OF FRENCH FILM!'],
};
export const CANCAN: ByPants = {
  clean: ['KICK! KICK! KICK! KICK!', "WE'RE THE CAN-CAN! WE CAN! WE CAN!", "I'M MADISON! I HAVE A DANCE SCHOLARSHIP! IT'S FOR THIS!"],
  shitty: ['KICK HIM! KICK HIM! DON\'T BREATHE!', 'EVERYBODY KICK AND HOLD YOUR NOSE!'],
  nude: ['WE SHOW A LITTLE LEG! YOU SHOW ALL OF EVERYTHING!', 'ONE, TWO, THREE, KICK IT OFF! NOT LIKE THAT!'],
};
export const SMOKER: ByPants = {
  clean: ['UGH. AMERICANS. I AM ALSO AMERICAN. UGH.', "I'M CHLOE. I'M FROM OHIO. I'M OVER IT.", 'YOU ARE BORING ME. GO AWAY.'],
  shitty: ['YOU SMELL LIKE MY CIGARETTE BUT WORSE.', 'I SMOKE TWO PACKS A DAY AND I CAN STILL SMELL YOU.'],
  nude: ['NAKED. HOW PEDESTRIAN.', 'I HAVE SEEN BETTER. IN A MUSEUM. ON A STATUE.'],
};

export const HURT: HurtTable = {
  'm2:fl_mime': {
    hurt: ['THE MIME PUNCHED ME! A REAL PUNCH!', "OW! THAT WASN'T A MIMED PUNCH!", 'I HATE MIMES! I HATE THEM!'],
    death: ['KILLED BY A MIME', 'MIMED TO DEATH'],
  },
  'm2:fl_waiter': {
    hurt: ['THE WAITER HIT ME!', 'OW! THE TRAY!', "THAT'S NOT IN THE TIP, ASSHOLE!"],
    death: ['SERVED', 'KILLED BY A WAITER'],
  },
  'm2:fl_plate': {
    hurt: ['A PLATE! HE THREW A PLATE!', 'OW! THE CHINA! IN MY FACE!', 'THAT WAS A FRISBEE OF FOOD!'],
    death: ['PLATED', 'KILLED BY A FLYING PLATE'],
  },
  'm2:fl_baguette': {
    hurt: ['HE HIT ME WITH A BREAD!', 'OW! THE BAGUETTE IS HARD!', "THAT BREAD'S A WEEK OLD!"],
    death: ['BREADED', 'BEATEN WITH A BAGUETTE'],
  },
  'm2:fl_cancan': {
    hurt: ['THE CAN-CAN KICKED ME!', 'OW! ALL OF THEM AT ONCE!', 'QUIT KICKING IN A LINE!'],
    death: ['CAN-CANNED', 'KICKED TO DEATH IN UNISON'],
  },
  'm2:fl_smoker': {
    hurt: ['THE SMOKER SHOVED ME!', 'OW! SHE BURNED ME!', 'BACK OFF, ASHTRAY!'],
    death: ['KILLED BY A RUDE SMOKER', 'BORED TO DEATH'],
  },
  'm2:fl_fountain': {
    hurt: ['THE FOUNTAIN! UP MY SHORTS!', 'HOSED! BY A MUSEUM!', 'WATER! IN MY EVERYTHING!'],
    death: ['HOSED OFF THE LOUVRE', 'DIED IN A FOUNTAIN SHOW'],
  },
};

/** A waiter, sneering, as the fountain show starts (the waiter voices). */
export const FOUNTAIN: ByPants = {
  clean: ['THE FOUNTAIN SHOW BEGINS. YOU ARE STANDING IN IT. OF COURSE.', 'ZE FOUNTAINS, MONSIEUR. I AM FROM DAYTON.', 'PLEASE DO NOT TOUCH ZE ART. ZE ART WILL TOUCH YOU.'],
  shitty: ['ZE FOUNTAIN WILL WASH YOU. IT CANNOT WASH YOU ENOUGH.', 'MONSIEUR, ZE FOUNTAIN IS NOT A BIDET.'],
  nude: ['MONSIEUR, ZE LOUVRE HAS NUDES. YOU ARE NOT ONE OF ZEM.', 'ZE STATUES ARE NAKED. ZEY ARE ALSO BETTER.'],
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.mime, MIME], [V.waiter, WAITER], [V.baguette, BAGUETTE], [V.cancan, CANCAN], [V.smoker, SMOKER], [{ m: V.waiter.m, f: V.waiter.m }, FOUNTAIN]]);
