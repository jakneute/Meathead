// CON-FUCK-TIOUS's lines (and Meathead's at him), by voice. Pure data ONLY (tools/voices bundles this in node: nothing
// here may pull in the engine, the canvas or timeOfDay.ts). Recorded via upgrades/lines.ts UPGRADE_VOICE_LINES
// (extract.ts and m2pack.ts both read that table).
//
// WHO HE IS (the owner, 2026-11-01: "just a buff generic japanese american man who speaks in riddles and shares much of
// meathead's sensibilities. like an older mentor."): BEN SMITH, Meathead's old gym buddy, a Japanese American lifelong
// gym rat in his fifties or sixties, a dirty fucking fighter. Crude, gym-bro, an older mentor and big brother, not a
// mystic: no kung-fu-movie talk (no GRASSHOPPER, no masters and students), nothing leaning on Asian stereotypes.
// Meathead hero-worships him (the father figure he never had) and calls him CON-FUCK-TIOUS out of stupidity, not
// malice. Ben's irritated by it, quietly concedes, and talks in fake riddles in a gym-bro voice ("THE BAR DOES NOT
// LIFT ITSELF") to amuse Meathead; his irritation leaks out in short dry asides. Blunt, short, vulgar, specific; talk
// less. He only speaks English (plain American English: no broken English, no accent writing, nothing that makes him
// foreign); all the Japanese he knows is a few token phrases from his grandfather, used rarely, and the joke is
// that's all there is (the owner: "con-fuck-tious only speaks english and only knows some token japanese phrases he
// learned from his grandfather"). Clean / shitty pants / nude pools wherever the state of Meathead could come up.
//
// THE TWO MEETUPS (the owner, 2026-11-01: "the first time meeting him the cutscene and dialogue should be different than
// subsequent visits... the first one should be one that establishes his character and his purpose in the game.
// subsequent visits acknowledge you're back and won't be as lengthy. your first visit can be anywhere"):
//   FIRST (whichever land he's found in first): MEET, NAME, RIDDLE (the gross-up), FIRST_WHY, PURPOSE, FIRST_REACT,
//     FIRST_ASIDE: who he is (the old spotter from the Iron Pit, the nickname, the hero worship) and what he's for (junk
//     armor from every land, one piece hidden in each, find him, pass his test).
//   LATER (any land after that): AGAIN (the gross-up), AGAIN_MH, NAME: short.
//   Then the land's piece (PIECE_LINES): ask, sell, the trial; the gift and the tease after it.
// All land-agnostic but PIECE_LINES (each armor piece's own set). Only the hand armor's is written so far.

/** Clean, shat, naked: a pool for each. */
export interface ByPants { clean: string[]; shitty: string[]; nude: string[] }
const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

/** His voice (tools/voices/cast.json). */
export const BEN_VOICE = 'm2.ben';

// ---------------------------------------------------------------------------------------------------------------
// Every meetup

/** Meathead, first sight of him. */
export const MEET: ByPants = {
  clean: ['CON-FUCK-TIOUS! IN A HOLE! UNDER A BALL PIT!', 'HOLY SHIT! CON-FUCK-TIOUS! MY SPOTTER!'],
  shitty: ["CON-FUCK-TIOUS! DON'T LOOK AT MY PANTS. LOOK AT MY EYES.", 'CON-FUCK-TIOUS! I SHAT MYSELF, BUT LIKE A WARRIOR.'],
  nude: ["CON-FUCK-TIOUS! IT'S OKAY, YOU'VE SEEN IT IN THE GYM SHOWERS.", 'CON-FUCK-TIOUS! I LOST MY PANTS. AND MY WAY.'],
};
/** Ben, under his breath, at the name. */
export const NAME = ["IT'S BEN.", "BEN. IT'S BEN.", "MY NAME IS BEN. IT'S ON MY LOCKER."];
/** Ben, the fake-riddle act for Meathead's benefit, gym-bro style (the gross-up's line). */
export const RIDDLE: ByPants = {
  clean: ['THE BAR DOES NOT LIFT ITSELF. ALSO, YOU FELL IN MY HOLE.', 'HE WHO SKIPS LEG DAY FALLS DOWN HOLES.'],
  shitty: ['THE SQUAT REVEALS ALL. YOURS REVEALED TOO MUCH.', 'NO PAIN, NO GAIN. NO BOWEL CONTROL EITHER, I SEE.'],
  nude: ['THE STRONGEST MAN NEEDS NO PANTS. THE SMART ONE WEARS THEM ANYWAY.', 'NAKED IN MY GYM. AT LEAST WIPE DOWN THE BENCH AFTER.'],
};
/** Meathead, the first meeting: what's he doing here? */
export const FIRST_WHY: ByPants = {
  clean: ['WHAT ARE YOU DOING IN A THEME PARK? YOU HATE FUN.'],
  shitty: ["WHAT ARE YOU DOING HERE? DON'T SMELL ME."],
  nude: ["WHAT ARE YOU DOING HERE? DON'T LOOK DOWN."],
};
/** Ben, the first meeting: who he is to Meathead, and what he's here for (in order). */
export const PURPOSE = [
  "TWENTY YEARS I SPOTTED YOU AT THE IRON PIT. YOU THINK I'D LET YOU DO THIS PARK ALONE?",
  "I'VE BEEN STEALING JUNK FROM EVERY LAND IN THIS DUMP AND BOLTING IT INTO ARMOR. CHEAP. DIRTY. WORKS.",
  'EVERY PIECE MAKES ONE OF YOUR MOVES NASTIER. ONE IN EVERY LAND. FIND ME, PASS MY TEST, IT IS YOURS.',
];
/** Meathead, the first meeting: armor! */
export const FIRST_REACT: ByPants = {
  clean: ["ARMOR! CON-FUCK-TIOUS, YOU'RE THE DAD I NEVER HAD."],
  shitty: ['ARMOR! DOES IT COME WITH PANTS?'],
  nude: ['ARMOR! FINALLY, SOMETHING TO WEAR!'],
};
/** Ben, the first meeting's last word on it. */
export const FIRST_ASIDE = ["DON'T MAKE IT WEIRD. AND IT'S BEN."];
/** Ben, a later meeting (any land after the first): he's been found again. */
export const AGAIN: ByPants = {
  clean: ['YOU FOUND ME AGAIN. ATTA BOY.', 'BACK FOR MORE. GOOD. THE BAR MISSED YOU.'],
  shitty: ['FOUND ME AGAIN. I SMELLED YOU COMING.', 'AGAIN WITH THE PANTS. FINE. COME HERE.'],
  nude: ['FOUND ME AGAIN. STILL NAKED. STILL PROUD OF YOU.', 'YOU AGAIN. PUT A TOWEL ON THAT.'],
};
/** Meathead, a later meeting. */
export const AGAIN_MH: ByPants = {
  clean: ["CON-FUCK-TIOUS! YOU'RE EVERYWHERE!", 'CON-FUCK-TIOUS! I KNEW YOU WERE HERE!'],
  shitty: ["CON-FUCK-TIOUS! DON'T MIND THE SMELL.", 'CON-FUCK-TIOUS! I SHAT MYSELF LOOKING FOR YOU.'],
  nude: ["CON-FUCK-TIOUS! I'M STILL NAKED!", 'CON-FUCK-TIOUS! I LOST THE PANTS AGAIN.'],
};
/** Ben, done teaching: get in the cannon (the owner: "you are encouraged to step into the cannon when you are done"). */
export const NUDGE: ByPants = {
  clean: ['REST BETWEEN SETS. NOT FOREVER. GET IN THE CANNON.', 'THE CANNON, MEATHEAD. I GOT A NAP SCHEDULED.'],
  shitty: ['THE CANNON. PLEASE. THE SMELL IS IN THE BENCH NOW.', 'GET IN THE CANNON. TAKE YOUR PANTS WITH YOU.'],
  nude: ['GET IN THE CANNON. AND KEEP THAT OFF MY BENCH.', 'THE CANNON. GO. BE NAKED SOMEWHERE ELSE.'],
};
/** Getting into the cannon: Meathead's goodbye, then Ben's. */
export const BYE_MEATHEAD = ['BYE, CON-FUCK-TIOUS!', 'LATER, CON-FUCK-TIOUS! I LOVE YOU!'];
export const BYE_BEN = ['BEN. GOODBYE.', 'TRY NOT TO DIE STUPID.'];

// ---------------------------------------------------------------------------------------------------------------
// Each piece's meetup (the trial, the gift, the tease)

export interface PieceLines {
  /** Meathead, at the piece in Ben's hands. */
  ask: ByPants;
  /** Ben, selling it. */
  sell: string[];
  /** Ben, the trial set. */
  trial: string[];
  /** Ben, a try at the trial that didn't do it. */
  miss: string[];
  /** Ben, a hint after two of those. */
  hint: string[];
  /** Ben, it's passed. */
  pass: string[];
  /** Meathead, after it's passed. */
  passed: ByPants;
  /** Ben, handing it over. */
  gift: string[];
  /** Ben's tease (the owner's line). */
  tease: string[];
  /** Meathead, enamored (the owner's line). */
  enamored: ByPants;
  /** Ben, after: go practice on the one that keeps coming, then the cannon. */
  practice: string[];
  /** Ben, the first time the piece is used on the practice one. */
  good: string[];
  /** Ben, back again after he's given it (a revisit). */
  idle: ByPants;
}

export const PIECE_LINES: { hands: PieceLines } = {
  hands: {
    ask: {
      clean: ['WHAT ARE THOSE? ARE THOSE MICKEY HANDS?', 'WHOA. GIANT CARTOON HANDS. I NEED THOSE.'],
      shitty: ["I NEED THOSE. I'LL WASH MY HANDS FIRST. PROBABLY.", 'CARTOON GLOVES! FINALLY, SOMETHING CLEAN ON ME.'],
      nude: ['GLOVES! FINALLY SOMETHING I CAN WEAR.', "GIVE ME THOSE. I'LL WEAR ONE ON MY DICK IF I HAVE TO."],
    },
    sell: ['THE HANDS OF A CARTOON. THE FISTS OF A GOD. I STOLE THEM OFF A GUY IN A DOG SUIT.'],
    trial: ["PASS MY TEST AND THEY'RE YOURS. TAKE THE SHAKER OUT OF MY HAND."],
    miss: ['TOO SLOW.', 'NOPE.', 'THE SHAKER IS PATIENT. I AM NOT.', 'AGAIN. LIKE YOU MEAN IT.', 'YOU GRAB LIKE A GUY ON A FIRST DATE.'],
    hint: ['THE HAND THAT CANNOT REACH HIGH... SHOULD THINK ABOUT LOW.'],
    pass: ['OH. OH GOD. THAT... IS THE LESSON.', 'RIGHT IN THE... YOU PASS. YOU FUCKING PASS.'],
    passed: {
      clean: ['I WAS GOING FOR THE SHAKER.'],
      shitty: ['I WAS GOING FOR THE SHAKER. I SWEAR ON MY PANTS.'],
      nude: ["I WAS GOING FOR THE SHAKER. MINE ARE OUT TOO, SO WE'RE EVEN."],
    },
    gift: ['SURE YOU WERE. TAKE THE GLOVES. YOU EARNED THEM WITH MY BALLS.'],
    tease: ["TRY DOING A BEATDOWN ON BOSSES OR SUB BOSSES. YOU'LL GET A SURPRISE."],
    enamored: {
      clean: ['A SURPRISE? MAYBE I SHOULD TRY DOING A BEATDOWN ON A BOSS OR SUB BOSS NOW.'],
      shitty: ['A SURPRISE? MAYBE I SHOULD TRY DOING A BEATDOWN ON A BOSS OR SUB BOSS NOW. AFTER I CHANGE.'],
      nude: ['A SURPRISE! MAYBE I SHOULD TRY DOING A BEATDOWN ON A BOSS OR SUB BOSS NOW. NAKED. FOR SPEED.'],
    },
    practice: ["PRACTICE ON THE FAT ONE. THEY DON'T RUN OUT. WHEN YOU'RE DONE, GET IN THE CANNON."],
    good: ['GOOD. NOW DO THAT TO SOMEBODY WHO DESERVES IT.', 'BEAUTIFUL. LIKE WATCHING A BEAR OPEN A COOLER.', "SUGOI. THAT'S ALL THE JAPANESE MY GRANDPA LEFT ME."],
    idle: {
      clean: ["YOU AGAIN. THE GLOVES DON'T COME IN A SECOND PAIR.", 'YOU AGAIN. I WAS MID-NAP.'],
      shitty: ['YOU CAME BACK. AND YOU BROUGHT THAT.', 'YOU CAME BACK. YOUR PANTS GOT HERE FIRST.'],
      nude: ['NAKED AGAIN. THIS HOLE IS NOT A NUDE BEACH.', 'YOU AGAIN. STILL NO PANTS. STILL NO SECOND PAIR.'],
    },
  },
};

const pieceBen = (p: PieceLines) => [...p.sell, ...p.trial, ...p.miss, ...p.hint, ...p.pass, ...p.gift, ...p.tease, ...p.practice, ...p.good, ...all(p.idle)];
const pieceMeathead = (p: PieceLines) => [...all(p.ask), ...all(p.passed), ...all(p.enamored)];

export const BEN_VOICE_LINES: Record<string, string[]> = {
  [BEN_VOICE]: [...NAME, ...all(RIDDLE), ...PURPOSE, ...FIRST_ASIDE, ...all(AGAIN), ...all(NUDGE), ...BYE_BEN, ...Object.values(PIECE_LINES).flatMap(pieceBen)],
  meathead: [...all(MEET), ...all(FIRST_WHY), ...all(FIRST_REACT), ...all(AGAIN_MH), ...BYE_MEATHEAD, ...Object.values(PIECE_LINES).flatMap(pieceMeathead)],
};
