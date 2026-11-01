// CON-FUCK-TIOUS's lines (and Meathead's at him), by voice. Pure data ONLY (tools/voices bundles this in node: nothing
// here may pull in the engine, the canvas or timeOfDay.ts). Recorded via upgrades/lines.ts UPGRADE_VOICE_LINES
// (extract.ts and m2pack.ts both read that table).
//
// WHO HE IS (the owner, 2026-10-31): BEN SMITH, Meathead's old gym buddy, of Japanese ancestry with a totally generic
// name. He looks like a wise old dojo master and is a dirty fucking fighter. Meathead hero-worships him (the father
// figure he never had) and calls him CON-FUCK-TIOUS out of stupidity, not malice. Ben's irritated by it, quietly
// concedes, and talks in fake-wise riddles to amuse Meathead; his irritation leaks out in short dry asides. Blunt,
// short, vulgar, specific; talk less. Clean / shitty pants / nude pools wherever the state of Meathead could come up.
//
// Shared by every land's meetup (MEET, NAME, RIDDLE, NUDGE, BYE are land-agnostic); each armor piece has its own set in
// PIECE_LINES (the trial, the gift, the tease, the revisit). Only the hand armor's is written so far.

/** Clean, shat, naked: a pool for each. */
export interface ByPants { clean: string[]; shitty: string[]; nude: string[] }
const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

/** His voice (tools/voices/cast.json). */
export const BEN_VOICE = 'm2.ben';

// ---------------------------------------------------------------------------------------------------------------
// Every meetup

/** Meathead, first sight of him. */
export const MEET: ByPants = {
  clean: ['CON-FUCK-TIOUS! IN A HOLE! UNDER A BALL PIT!', 'HOLY SHIT! CON-FUCK-TIOUS! MY MASTER!'],
  shitty: ["CON-FUCK-TIOUS! DON'T LOOK AT MY PANTS. LOOK AT MY EYES.", 'CON-FUCK-TIOUS! I SHAT MYSELF, BUT LIKE A WARRIOR.'],
  nude: ["CON-FUCK-TIOUS! IT'S OKAY, YOU'VE SEEN IT IN THE GYM SHOWERS.", 'CON-FUCK-TIOUS! I LOST MY PANTS. AND MY WAY.'],
};
/** Ben, under his breath, at the name. */
export const NAME = ["IT'S BEN.", "BEN. IT'S BEN.", 'MY NAME IS BEN.'];
/** Ben, the wise-master act (the gross-up's line). */
export const RIDDLE: ByPants = {
  clean: ['THE STUDENT ARRIVES WHEN HE TRIPS. NICE TRIP.', 'THE FOOL LOOKS UP. THE MASTER LIVES DOWN. RENT IS CHEAP.'],
  shitty: ['THE RIVER CARRIES MANY THINGS. SO DO YOUR PANTS.', 'A WISE MAN SMELLS THE STUDENT BEFORE HE SEES HIM.'],
  nude: ['THE STUDENT COMES TO THE MASTER WITH NOTHING. NOTHING AT ALL. JESUS.', 'A NAKED MAN HAS NO POCKETS. AND NO SHAME. COVER THAT.'],
};
/** Ben, done teaching: get in the cannon (the owner: "you are encouraged to step into the cannon when you are done"). */
export const NUDGE: ByPants = {
  clean: ['THE CANNON, GRASSHOPPER. I HAVE THINGS TO DO.', 'A WISE MAN KNOWS WHEN TO LEAVE. GET IN THE CANNON.'],
  shitty: ['THE CANNON. PLEASE. THE SMELL IS IN THE MAT NOW.', 'GET IN THE CANNON. TAKE YOUR PANTS WITH YOU.'],
  nude: ['GET IN THE CANNON. AND KEEP THAT AWAY FROM MY MAT.', 'THE CANNON. GO. BE NAKED SOMEWHERE ELSE.'],
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
    trial: ["PASS MY TRIAL AND THEY'RE YOURS. TAKE THE PEBBLE FROM MY HAND, GRASSHOPPER."],
    miss: ['TOO SLOW.', 'NOPE.', 'THE PEBBLE IS PATIENT. I AM NOT.', 'AGAIN. LIKE YOU MEAN IT.', 'YOU GRAB LIKE A GUY ON A FIRST DATE.'],
    hint: ['THE HAND THAT CANNOT REACH HIGH... SHOULD THINK ABOUT LOW.'],
    pass: ['OH. OH GOD. THE STUDENT... HAS LEARNED.', 'RIGHT IN THE... YOU PASS. YOU FUCKING PASS.'],
    passed: {
      clean: ['I WAS GOING FOR THE PEBBLE.'],
      shitty: ['I WAS GOING FOR THE PEBBLE. I SWEAR ON MY PANTS.'],
      nude: ["I WAS GOING FOR THE PEBBLE. MINE ARE OUT TOO, SO WE'RE EVEN."],
    },
    gift: ['SURE YOU WERE. TAKE THE GLOVES. YOU EARNED THEM WITH MY BALLS.'],
    tease: ["TRY DOING A BEATDOWN ON BOSSES OR SUB BOSSES. YOU'LL GET A SURPRISE."],
    enamored: {
      clean: ['A SURPRISE? MAYBE I SHOULD TRY DOING A BEATDOWN ON A BOSS OR SUB BOSS NOW.'],
      shitty: ['A SURPRISE? MAYBE I SHOULD TRY DOING A BEATDOWN ON A BOSS OR SUB BOSS NOW. AFTER I CHANGE.'],
      nude: ['A SURPRISE! MAYBE I SHOULD TRY DOING A BEATDOWN ON A BOSS OR SUB BOSS NOW. NAKED. FOR SPEED.'],
    },
    practice: ["PRACTICE ON THE FAT ONE. THEY DON'T RUN OUT. WHEN YOU'RE DONE, GET IN THE CANNON."],
    good: ['GOOD. NOW DO THAT TO SOMEBODY WHO DESERVES IT.', 'BEAUTIFUL. LIKE WATCHING A BEAR OPEN A COOLER.'],
    idle: {
      clean: ["YOU AGAIN. THE GLOVES DON'T COME IN A SECOND PAIR.", 'THE STUDENT RETURNS. THE MASTER WAS NAPPING.'],
      shitty: ['YOU CAME BACK. AND YOU BROUGHT THAT.', 'THE STUDENT RETURNS. HIS PANTS ARRIVE FIRST.'],
      nude: ['NAKED AGAIN. THIS HOLE IS NOT A NUDE BEACH.', 'YOU AGAIN. STILL NO PANTS. STILL NO SECOND PAIR.'],
    },
  },
};

const pieceBen = (p: PieceLines) => [...p.sell, ...p.trial, ...p.miss, ...p.hint, ...p.pass, ...p.gift, ...p.tease, ...p.practice, ...p.good, ...all(p.idle)];
const pieceMeathead = (p: PieceLines) => [...all(p.ask), ...all(p.passed), ...all(p.enamored)];

export const BEN_VOICE_LINES: Record<string, string[]> = {
  [BEN_VOICE]: [...NAME, ...all(RIDDLE), ...all(NUDGE), ...BYE_BEN, ...Object.values(PIECE_LINES).flatMap(pieceBen)],
  meathead: [...all(MEET), ...BYE_MEATHEAD, ...Object.values(PIECE_LINES).flatMap(pieceMeathead)],
};
