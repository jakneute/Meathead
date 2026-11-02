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
// All land-agnostic but PIECE_LINES (each armor piece's own set): the hand armor's (Cartoon Land) and the pauldrons'
// (Jungle Land) so far.
//
// THE HIDDEN ART OF FOLLOW-UPS (the owner, 2026-11-01): the first follow-up piece he's given (whichever land), Ben
// teaches him how follow-ups work as a bigger beat (ART_*); every follow-up piece after that, he just brings it up
// (ART_AGAIN). The flash kick (the shins) is the one follow-up that isn't a grab: Ben only hints at it.

/** Clean, shat, naked: a pool for each. */
export interface ByPants { clean: string[]; shitty: string[]; nude: string[] }
const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

/** His voice (tools/voices/cast.json). */
export const BEN_VOICE = 'm2.ben';

// ---------------------------------------------------------------------------------------------------------------
// Every meetup

/** Meathead, first sight of him. */
export const MEET: ByPants = {
  clean: ['CON-FUCK-TIOUS! IN A SECRET HIDEOUT! LIKE BATMAN!', 'HOLY SHIT! CON-FUCK-TIOUS! MY SPOTTER!'],
  shitty: ["CON-FUCK-TIOUS! DON'T LOOK AT MY PANTS. LOOK AT MY EYES.", 'CON-FUCK-TIOUS! I SHAT MYSELF, BUT LIKE A WARRIOR.'],
  nude: ["CON-FUCK-TIOUS! IT'S OKAY, YOU'VE SEEN IT IN THE GYM SHOWERS.", 'CON-FUCK-TIOUS! I LOST MY PANTS. AND MY WAY.'],
};
/** Ben, under his breath, at the name. */
export const NAME = ["IT'S BEN.", "BEN. IT'S BEN.", "MY NAME IS BEN. IT'S ON MY LOCKER."];
/** Ben, the fake-riddle act for Meathead's benefit, gym-bro style (the gross-up's line). */
export const RIDDLE: ByPants = {
  clean: ['THE BAR DOES NOT LIFT ITSELF. ALSO, YOU FOUND MY HOLE.', 'HE WHO SKIPS LEG DAY NEVER FINDS MY HOLE.'],
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
/** Ben, done teaching, where there's no cannon (Foreign Lands: out the way he came in). */
export const NUDGE_OUT: ByPants = {
  clean: ['REST BETWEEN SETS. NOT FOREVER. THE DOOR, MEATHEAD.', "THE DOOR'S WHERE YOU LEFT IT. I GOT A NAP SCHEDULED."],
  shitty: ['THE DOOR. PLEASE. THE SMELL IS IN THE MATS NOW.', 'OUT THE DOOR. TAKE YOUR PANTS WITH YOU.'],
  nude: ['OUT THE DOOR. AND KEEP THAT OFF MY THRONE.', 'THE DOOR. GO. BE NAKED SOMEWHERE ELSE.'],
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
  /** Ben, a try at the trial that got somewhere but isn't done (in order). */
  more?: string[];
  /** His pose for the trial's set (default 'offer': holding the thing out). */
  trialPose?: 'offer' | 'brace' | 'fold';
}

export const PIECE_LINES: { hands: PieceLines; pauldrons: PieceLines; helmet: PieceLines; cape: PieceLines } = {
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
  // Jungle Land: the COCO-NUTS, up the third maintenance shaft over the river. The trial: knock him on his ass, shoulder
  // first, through his tackling sled (three shoulder charges).
  pauldrons: {
    ask: {
      clean: ['ARE THOSE COCONUTS? ON YOUR SHOULDERS?', "COCONUT SHOULDER PADS. I THINK I'M GONNA CRY."],
      shitty: ['COCONUTS! FINALLY SOMETHING ON ME THAT SMELLS NICE.', "COCONUT SHOULDER PADS! I'D TRADE YOU MY PANTS. NOBODY WANTS MY PANTS."],
      nude: ["SHOULDER PADS! I'VE GOT NOTHING ELSE ON. IT'S A START.", 'COCONUTS! THEN I WOULD HAVE FOUR!'],
    },
    sell: ['TWO COCONUT HALVES. GIFT SHOP LEOPARD. A TUSK OFF A FAKE ELEPHANT. YOU HIT A GUY, HE STAYS HIT.'],
    trial: ["KNOCK ME ON MY ASS AND THEY'RE YOURS. SHOULDER FIRST. I'LL HOLD THE SLED."],
    trialPose: 'brace',
    more: ['OOF. AGAIN.', 'GOOD. MY KIDNEY MOVED. AGAIN.'],
    miss: ['THAT WAS A HUG.', "DON'T LEAN ON IT. HIT IT.", 'I SAID SHOULDER, NOT SNUGGLE.', 'MY MOTHER PUSHES HARDER. SHE USES A WALKER.', 'YOU PUSH LIKE A GUY HOLDING A DOOR.'],
    hint: ['THE BULL DOES NOT KNOCK. THE BULL COMES THROUGH THE DOOR. SHOULDER CHARGE, MEATHEAD.'],
    pass: ['OH. THERE IT IS. YOU PASS. I NEED A MINUTE.', 'GOOD. MY SPLEEN SAYS GOOD. YOU PASS.'],
    passed: {
      clean: ['DID I HURT YOU? I DID IT LIKE YOU SHOWED ME.'],
      shitty: ['SORRY. SOME OF MY PANTS GOT ON YOUR SLED.'],
      nude: ['SORRY. MY EVERYTHING WAS FLAPPING THE WHOLE TIME.'],
    },
    gift: ["TAKE THE COCO-NUTS. YOUR SHOULDER'S A TRUCK NOW. HORNS AND SPEARS DON'T STOP A TRUCK."],
    tease: ["HIT A BOSS WITH THAT SHOULDER. THEY'LL FEEL IT IN THEIR TEETH."],
    enamored: {
      clean: ["I'M GONNA SHOULDER EVERYBODY. EVEN PEOPLE I LIKE."],
      shitty: ["I'M GONNA SHOULDER EVERYBODY. THEY'LL SMELL ME COMING. TOO LATE."],
      nude: ["I'M GONNA SHOULDER EVERYBODY. NAKED. THEY'LL NEVER RECOVER."],
    },
    practice: ["PRACTICE ON THE TOUR GUIDE. PLANT HIM, THEN KICK HIS HEAD THROUGH THE UPRIGHTS. THE PARK'S GOT PLENTY. THEN THE CANNON."],
    good: ['RAIL SPIKE. BEAUTIFUL.', 'PLANTED LIKE A TOMATO. GOOD.', 'YOSHI. GRANDPA SAID THAT. MOSTLY TO THE LAWNMOWER.'],
    idle: {
      clean: ['YOU AGAIN. I ONLY HAD THE TWO COCONUTS.', 'YOU AGAIN. I WAS MID-NAP IN THE HAMMOCK.'],
      shitty: ['YOU CLIMBED ALL THE WAY UP HERE IN THOSE?', 'YOU CAME BACK. THE SHAFT SMELLS LIKE YOU NOW.'],
      nude: ['YOU CLIMBED UP THAT SHAFT NAKED. THE FISH SAW EVERYTHING.', 'YOU AGAIN. STILL NO PANTS. STILL NO MORE COCONUTS.'],
    },
  },
  helmet: {
    ask: {
      clean: ['IS THAT A BEER HELMET? WITH HORNS? IT LOOKS LIKE MY WHOLE PERSONALITY.', 'A VIKING HELMET THAT HOLDS BEER. I THINK I JUST GOT HARD.'],
      shitty: ['A BEER HELMET! I NEED A DRINK. I JUST LOST A LOT OF FLUIDS.', 'GIVE ME THAT. IT GOES ON MY HEAD. FAR AWAY FROM MY PANTS.'],
      nude: ["A HELMET! NOW I'M ONLY NAKED FROM THE EYEBROWS DOWN!", 'A HELMET! FINALLY SOMETHING TO COVER! WRONG HEAD, BUT STILL!'],
    },
    sell: ['GIFT SHOP HELMET. TWO CANS, ONE STRAW, HORNS HOT-GLUED ON. WHATEVER THEY THROW AT YOUR HEAD BOUNCES OFF.'],
    trial: ["HEADBUTT THE KEG THREE TIMES AND IT'S YOURS. JUMP UNDER IT, HEAD FIRST. DON'T THINK. THINKING IS WHAT HURTS."],
    trialPose: 'fold',
    more: ['ONE. YOUR SKULL IS THICKER THAN I REMEMBERED.', 'TWO. I HEARD SOMETHING RATTLE. KEEP GOING.'],
    miss: ['WITH YOUR HEAD.', "THAT WASN'T YOUR HEAD.", 'HEAD. THE THING YOUR GLASSES SIT ON.', "YOU DON'T SHOOT A KEG. YOU'RE NOT A COWARD.", 'SKULL, MEATHEAD. THE BONE ONE.'],
    hint: ['THE KEG DOES NOT COME DOWN TO YOU. YOU GO UP TO THE KEG. JUMP UNDER IT. HEAD FIRST.'],
    pass: ['THERE IT GOES. FREE BEER AND A CONCUSSION. YOU PASS.', 'IT POPPED. YOUR HEAD WON. YOU PASS.'],
    passed: {
      clean: ['I SEE THREE OF YOU. ALL THREE ARE PROUD OF ME.'],
      shitty: ['MY HEAD IS RINGING. MY PANTS ARE... ALSO DOING SOMETHING.'],
      nude: ['I HIT IT SO HARD MY DICK FELT IT.'],
    },
    gift: ['TAKE THE KEGGER HELMET. THE STRAW GOES AROUND THE GLASSES. NOT THROUGH THEM. I TRIED.'],
    tease: ["DUCK AND IT COVERS MORE OF YOU. BOSSES, THOUGH, THEIR SHIT STILL GETS THROUGH. IT JUST HURTS LESS."],
    enamored: {
      clean: ['I CAN DRINK AND GET HIT IN THE HEAD AT THE SAME TIME. THAT IS MY WHOLE WEEKEND.'],
      shitty: ['A HAT THAT HOLDS BEER. NOW I NEED PANTS THAT HOLD... THE OTHER THING.'],
      nude: ['NAKED, BUT HELMETED. LIKE A REAL VIKING.'],
    },
    practice: ["PRACTICE ON THE INTERN. HE THROWS FOAM AXES AT YOUR HEAD. HE KEEPS COMING BACK. HE'S GOT NOWHERE ELSE TO BE. THEN OUT THE DOOR."],
    good: ['BONK. BEAUTIFUL.', 'IT BOUNCES. LIKE YOUR RENT CHECKS.', 'GANBATTE. GRANDPA YELLED THAT AT THE TV. BOWLING, MOSTLY.'],
    idle: {
      clean: ['YOU AGAIN. THE GIFT SHOP ONLY HAD THE ONE HELMET.', 'YOU AGAIN. I WAS NAPPING IN THE BOAT.'],
      shitty: ['YOU CAME BACK. THE FOG MACHINE CAN ONLY HIDE SO MUCH.', 'YOU AGAIN. VALHALLA HAS A NO SHIT POLICY. LITERALLY.'],
      nude: ['YOU AGAIN. NAKED IN VALHALLA. VERY TRADITIONAL, ACTUALLY.', 'YOU AGAIN. STILL NO PANTS. STILL ONE HELMET.'],
    },
  },
  // Spooky Land: the CLEARANCE CAPE, in the castle's forgotten RESTRICTED SECTION up behind the library's top left shelf.
  // The trial: wear it, snuff his three candles (the high one on the bookcase, the far one on the pillar: float to it off
  // the bookcase, the one in the wheel over the coffin).
  cape: {
    ask: {
      clean: ['A VAMPIRE CAPE! HAVE YOU BEEN DRACULA THIS WHOLE TIME?', "A CAPE. I ALWAYS WANTED A CAPE. MOM SAID I WASN'T SPECIAL ENOUGH."],
      shitty: ['A CAPE! IT COVERS THE BACK! IT COVERS MY WHOLE SITUATION!', 'GIVE ME THE CAPE. NOBODY HAS TO SEE THE BACK OF MY PANTS EVER AGAIN.'],
      nude: ['A CAPE! FINALLY I CAN BE NAKED, BUT CLASSY!', "A CAPE. IT'S NOT PANTS, BUT IT'S IN THE NEIGHBORHOOD."],
    },
    sell: ['BLAH. HALLOWEEN STORE, NOVEMBER FIRST, SEVENTY PERCENT OFF. YOU RUN FASTER, YOU JUMP HIGHER, HOLD JUMP AND YOU FLOAT.'],
    trial: ['PUT IT ON. SNUFF MY THREE CANDLES. THE HIGH ONE, THE FAR ONE, THE ONE OVER THE COFFIN.'],
    more: ['ONE. THE CAPE DOES THE WORK. YOU DO THE SWEATING.', 'TWO. YOU LOOK LIKE A BAT WITH A MORTGAGE. ONE MORE.'],
    miss: ['YOU FELL. THAT IS THE OPPOSITE OF FLOATING.', 'HOLD THE JUMP. HOLD IT LIKE A GRUDGE.', 'GRAVITY ONE, MEATHEAD ZERO.', 'YOU DROPPED LIKE MY RETIREMENT FUND.', "THAT'S NOT FLYING. THAT'S FALLING IN A BLANKET."],
    hint: ['THE BAT DOES NOT JUMP AND PRAY. JUMP OFF THE BOOKCASE AND HOLD JUMP ALL THE WAY DOWN.'],
    pass: ['ALL THREE. THE DARKNESS WELCOMES YOU. THE DARKNESS IS MY ROOM WITH THE LIGHTS OFF.', "LIGHTS OUT. YOU PASS. I CAN'T SEE A THING, BUT YOU PASS."],
    passed: {
      clean: ['I WAS FLYING. I WAS A BAT. A HUGE, BEAUTIFUL BAT.'],
      shitty: ['I WAS FLYING. SOMETHING WAS FLYING OFF ME TOO.'],
      nude: ['I WAS FLYING. EVERYTHING WAS FLAPPING. EVERYTHING.'],
    },
    gift: ['KEEP IT. THE TAG STAYS ON. IF YOU DIE IN IT, I WANT MY NINE NINETY-NINE BACK.'],
    tease: ["IT DOESN'T STOP A BULLET. IT JUST HELPS YOU NOT BE WHERE THE BULLET IS."],
    enamored: {
      clean: ["I'M WEARING IT TO EVERYTHING. FUNERALS. COURT. LEG DAY."],
      shitty: ['NOW WHEN I SHIT MYSELF, IT FLAPS DRAMATICALLY.'],
      nude: ["A CAPE AND NOTHING ELSE. I'M A SUPERHERO FROM THE BACK AND A CRIME FROM THE FRONT."],
    },
    practice: ['THE CANDLES COME BACK ON. FLOAT AROUND TILL YOU GET BORED. THEN THE CANNON.'],
    good: ['LIKE A BAT. A BIG, STUPID BAT. BEAUTIFUL.', 'FLOATING. YOUR MOTHER WOULD BE PROUD. SHE THREW YOU OFF A PORCH ONCE.', "OYASUMI. GRANDPA SAID IT EVERY NIGHT. I THOUGHT IT MEANT SHUT UP."],
    idle: {
      clean: ['YOU AGAIN. THE CLEARANCE RACK HAD ONE CAPE.', "YOU AGAIN. I WAS READING. NOT REALLY. I WAS LOOKING AT THE PICTURES."],
      shitty: ['YOU AGAIN. THE CAPE WAS SUPPOSED TO HIDE THAT.', 'YOU CAME BACK. THE BOOKS ARE GONNA SMELL LIKE YOU FOREVER.'],
      nude: ['YOU AGAIN. NAKED IN A LIBRARY. SHH.', 'YOU AGAIN. CAPE ON, PANTS OFF. YOU LOOK LIKE A FLASHER.'],
    },
  },
};

/** Spooky Land: Meathead through the false shelf into the passage, the first time this go at the land. */
export const MH_PASSAGE: ByPants = {
  clean: ['A SECRET PASSAGE! I KNEW BOOKS WERE GOOD FOR SOMETHING.'],
  shitty: ['A SECRET PASSAGE. GOOD. NOBODY FOLLOWS A SMELL INTO A WALL.'],
  nude: ['A SECRET PASSAGE! THERE IS A DRAFT. ON EVERYTHING.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Foreign Lands: the KEGGER HELMET, in the HALLS OF VALHALLA under Norway's troll toll bridge (the doorman raises it).
// The trial: three headbutts on the keg hung from the ceiling (jump under it, head first).

// ---------------------------------------------------------------------------------------------------------------
// The hidden art of follow-ups (the first follow-up piece: the big beat, in order; later ones: ART_AGAIN)

/** Ben, the gross-up: here comes the secret. */
export const ART_OPEN = ['NOW THE REAL SECRET. THE HIDDEN ART OF FOLLOW-UPS.'];
/** Meathead, thrilled. */
export const ART_MH: ByPants = {
  clean: ['THE HIDDEN ART! I KNEW THERE WAS ONE! WHAT IS IT?'],
  shitty: ["THE HIDDEN ART! I WON'T TELL ANYBODY. NOBODY COMES NEAR ME ANYWAY."],
  nude: ['THE HIDDEN ART! I HAVE NOTHING TO HIDE IT IN!'],
};
/** Ben, how it goes (the buttons on screen while he says it). */
export const ART_HOW = [
  "START A CHARGE. KEEP HOLDING IT. TAP GRAB. YOU DON'T EVEN HAVE TO HIT THE GUY.",
  'DURING THE CHARGE, THE BOUNCE BACK, OR RIGHT AFTER. THAT IS THE WHOLE ART.',
  "NOT ON BOSSES. NOT ON SUB BOSSES. NOT ON LITTLE CRITTERS. THOSE YOU JUST THROW. AND ONE PIECE OUT THERE DOESN'T USE THE GRAB AT ALL.",
];
/** Meathead's Japanese, from cartoons (the joke's on him: weeb nonsense). */
export const ART_WEEB: ByPants = {
  clean: ['DATTEBAYO! HIDDEN ART NO JUTSU! I KNOW JAPANESE FROM CARTOONS.'],
  shitty: ['DATTEBAYO! HIDDEN ART NO SHARTSU! I KNOW JAPANESE FROM CARTOONS.'],
  nude: ['DATTEBAYO! NAKED NO JUTSU! I KNOW JAPANESE FROM CARTOONS.'],
};
/** Ben, lost (English only: three words from his grandpa is all he's got). */
export const ART_HUH = ['I GREW UP BEHIND A BOWLING ALLEY. NO IDEA WHAT YOU JUST SAID.'];
/** Ben, a later follow-up piece: it's the art again. */
export const ART_AGAIN = ['ANOTHER ONE FOR THE HIDDEN ART. HOLD THE CHARGE, TAP GRAB. SAME AS ALWAYS.'];

const pieceBen = (p: PieceLines) => [...p.sell, ...p.trial, ...p.miss, ...p.hint, ...p.pass, ...p.gift, ...p.tease, ...p.practice, ...p.good, ...all(p.idle), ...(p.more ?? [])];
const pieceMeathead = (p: PieceLines) => [...all(p.ask), ...all(p.passed), ...all(p.enamored)];

export const BEN_VOICE_LINES: Record<string, string[]> = {
  [BEN_VOICE]: [...NAME, ...all(RIDDLE), ...PURPOSE, ...FIRST_ASIDE, ...all(AGAIN), ...all(NUDGE), ...all(NUDGE_OUT), ...BYE_BEN, ...ART_OPEN, ...ART_HOW, ...ART_HUH, ...ART_AGAIN, ...Object.values(PIECE_LINES).flatMap(pieceBen)],
  meathead: [...all(MEET), ...all(FIRST_WHY), ...all(FIRST_REACT), ...all(AGAIN_MH), ...BYE_MEATHEAD, ...all(ART_MH), ...all(ART_WEEB), ...Object.values(PIECE_LINES).flatMap(pieceMeathead), ...all(MH_PASSAGE)],
};
