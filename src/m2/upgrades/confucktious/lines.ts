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
  // (trimmed to two, the owner's "he talks too much")
  'I BOLTED JUNK FROM EVERY LAND INTO ARMOR. ONE PIECE IN EACH. FIND ME. PASS MY TEST.',
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
  /** Ben, a follow-up piece: what its follow-up does (after the hidden art's how, the first follow-up piece he gives)... */
  follow?: string[];
  /** ...or, the art already taught, the brief mention with it (in place of ART_AGAIN). */
  followAgain?: string[];
}

export const PIECE_LINES: { hands: PieceLines; pauldrons: PieceLines; helmet: PieceLines; cape: PieceLines; legs: PieceLines; amulet: PieceLines; armguards: PieceLines; sabatons: PieceLines } = {
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
  // Jungle Land: the COCO-NUTS, up the third maintenance shaft over the river. The trial (the owner's "make sure you
  // 'pass' when you do the follow up attack. the shoulder pads do not"): the coco-nuts lent, his tackling dummy on its
  // spring post: shoulder charge it, tap grab, the HEAD PLANT; then punt the head off through his chalk uprights.
  pauldrons: {
    ask: {
      clean: ['ARE THOSE COCONUTS? ON YOUR SHOULDERS?', "COCONUT SHOULDER PADS. I THINK I'M GONNA CRY."],
      shitty: ['COCONUTS! FINALLY SOMETHING ON ME THAT SMELLS NICE.', "COCONUT SHOULDER PADS! I'D TRADE YOU MY PANTS. NOBODY WANTS MY PANTS."],
      nude: ["SHOULDER PADS! I'VE GOT NOTHING ELSE ON. IT'S A START.", 'COCONUTS! THEN I WOULD HAVE FOUR!'],
    },
    sell: ['TWO COCONUT HALVES. GIFT SHOP LEOPARD. A TUSK OFF A FAKE ELEPHANT. YOU HIT A GUY, HE STAYS HIT.'],
    trial: ['MY DUMMY. BORROW THE COCO-NUTS. PLANT HIM, PUNT HIS HEAD THROUGH MY UPRIGHTS.'],
    trialPose: 'fold',
    // (in order: planted, then the head's dug back out before he kicked it)
    more: ['PLANTED. NOW PUNT IT.', 'HE DUG OUT. AGAIN.'],
    miss: ['THAT WAS A SHOVE. PLANT HIM.', 'HE BOUNCED. HE WAS SUPPOSED TO GO IN THE FLOOR.', 'SHOULDER, THEN GRAB. YOU DID HALF.', "HE'S STILL STANDING. THAT'S THE PROBLEM.", 'YOU TACKLE LIKE A GUY HOLDING A DOOR.'],
    hint: ['THE TREE DOES NOT PLANT ITSELF. HOLD THE CHARGE. TAP GRAB.'],
    pass: ['IT IS GOOD. YOU PASS.', 'THROUGH THE UPRIGHTS. YOU PASS. HE DOES NOT.'],
    passed: {
      clean: ['I KICKED HIS HEAD OFF! THE CROWD GOES WILD! THE CROWD IS YOU!'],
      shitty: ['I KICKED IT SO HARD SOMETHING CAME OUT OF ME TOO.'],
      nude: ['I KICKED IT NAKED. EVERYTHING FOLLOWED THROUGH.'],
    },
    gift: ["KEEP THE COCO-NUTS. YOUR SHOULDER'S A TRUCK NOW. HORNS AND SPEARS DON'T STOP A TRUCK."],
    tease: ["HIT A BOSS WITH THAT SHOULDER. THEY'LL FEEL IT IN THEIR TEETH."],
    enamored: {
      clean: ["I'M GONNA SHOULDER EVERYBODY. EVEN PEOPLE I LIKE."],
      shitty: ["I'M GONNA SHOULDER EVERYBODY. THEY'LL SMELL ME COMING. TOO LATE."],
      nude: ["I'M GONNA SHOULDER EVERYBODY. NAKED. THEY'LL NEVER RECOVER."],
    },
    follow: ["THESE DO THE HEAD PLANT. ONE BONK, HE'S IN THE FLOOR TO THE CHIN. THEN YOU PUNT THE HEAD."],
    followAgain: ['ANOTHER ONE FOR THE HIDDEN ART. THE HEAD PLANT: ONE BONK, FLOOR TO THE CHIN. THEN PUNT THE HEAD.'],
    practice: ['NOW A LIVE ONE. THE TOUR GUIDE. THEN THE CANNON.'],
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
    trial: ['HEADBUTT MY KEG THREE TIMES. JUMP UNDER IT, HEAD FIRST. THINKING IS WHAT HURTS.'],
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
  // Hollywood Land: the TROPHY SHIN-DIGS, in the drained tank on top of the HAPPYWOOD WATER TOWER. The trial: slide under
  // his stage curtain, then flash kick his three sandbags down.
  legs: {
    ask: {
      clean: ['ARE THOSE GOLD AWARDS? DUCT-TAPED TO YOUR SHINS?', 'TWO LITTLE GOLD NAKED GUYS ON YOUR LEGS. I NEED THAT.'],
      shitty: ["GOLD SHIN GUARDS! THE SHIT CAN'T REACH THAT HIGH. USUALLY.", 'GIVE ME THOSE. MY SHINS ARE THE ONLY CLEAN PART LEFT.'],
      nude: ["TWO GOLD NAKED GUYS. NOW THERE'S THREE OF US.", "SHIN ARMOR! IT DOESN'T COVER ANYTHING IMPORTANT. I'LL TAKE IT."],
    },
    sell: ["I'D LIKE TO THANK THE GIFT SHOP. FAKE AWARDS, DUCT TAPE, FILM REELS FOR KNEES. YOU SLIDE FURTHER AND YOU TRIP EVERYBODY."],
    trial: ['SLIDE UNDER MY CURTAIN. THEN FLASH KICK MY THREE SANDBAGS.'],
    trialPose: 'fold',
    more: ['ONE. THE ACADEMY IS MOVED.', 'TWO. YOU KICK LIKE A STUNTMAN WITH NO INSURANCE. ONE MORE.'],
    miss: ['THAT WAS A JUMP. FLASH KICK. SLIDE, THEN UP.', "YOU DON'T TOUCH A SANDBAG. YOU MURDER IT.", 'UP WHILE YOU SLIDE. NOT AFTER. NOT BEFORE. WHILE.', 'CUT. AGAIN.', "THAT'S NOT A FLASH KICK. THAT'S A HOP."],
    hint: ['THE BAR GOES UNDER THE CHIN. THE MAN GOES UNDER THE CURTAIN. SLIDE. THEN PUSH UP MID-SLIDE.'],
    pass: ["THAT'S A WRAP. YOU PASS. I'M GETTING CHOKED UP.", 'AND THE AWARD GOES TO... THE IDIOT. YOU PASS.'],
    passed: {
      clean: ["I'D LIKE TO THANK MY MOM. AND YOU, CON-FUCK-TIOUS."],
      shitty: ["I'D LIKE TO THANK MY PANTS. THEY HELD. MOSTLY."],
      nude: ["I'D LIKE TO THANK NOBODY. I'M NAKED ON STAGE."],
    },
    gift: ['TAKE THE TROPHY SHIN-DIGS. TWO GOLD MEN ON YOUR SHINS. MORE THAN YOUR DAD EVER GAVE YOU.'],
    tease: ['SLIDE INTO A BOSS WITH THOSE ON. HE FEELS IT. ANYBODY ELSE JUST GOES ASS OVER HEAD.'],
    enamored: {
      clean: ["I'M GONNA SLIDE EVERYWHERE. THE GROCERY STORE. CHURCH."],
      shitty: ["I'M GONNA SLIDE EVERYWHERE. I'LL LEAVE A TRAIL. LIKE A SNAIL."],
      nude: ["I'M GONNA SLIDE EVERYWHERE. NAKED. IT'S GONNA BURN. WORTH IT."],
    },
    practice: ['PRACTICE ON MY STUNT DOUBLE. TRIP HIM, KICK HIM IN HALF. THE UNION SENDS ANOTHER ONE. THEN THE CANNON.'],
    good: ['CUT! PRINT IT! BEAUTIFUL.', 'IN HALF. LIKE A SANDWICH. GOOD.', 'ARIGATO. GRANDPA SAID IT TO THE MAILMAN. NOBODY ELSE.'],
    idle: {
      clean: ['YOU AGAIN. THE GIFT SHOP HAD TWO AWARDS. YOU GOT BOTH.', 'YOU AGAIN. YOU CLIMBED ALL THAT FOR A HELLO?'],
      shitty: ['YOU CLIMBED A WATER TOWER IN THOSE PANTS. THE TOWN DRINKS THIS.', 'YOU AGAIN. THE TANK ECHOES. SO DOES THE SMELL.'],
      nude: ['YOU CLIMBED UP HERE NAKED. THE WHOLE STUDIO SAW.', 'YOU AGAIN. NAKED IN A WATER TANK. CALL IT A SPONGE BATH.'],
    },
  },
  // Fairy Land: the PISS-OFF PENDANT, in the dragon's lair's old machine room down the service tunnel off the mine shaft.
  // The trial: three inflatable gift shop knights bop him till the pendant's had enough (he's not to hit back), and the
  // yell pops the lot.
  amulet: {
    ask: {
      clean: ["IS THAT A PRINCESS NECKLACE? IT'S BEAUTIFUL.", "A BIG PINK JEWEL. I'VE NEVER WANTED ANYTHING THIS BAD."],
      shitty: ['A PINK JEWEL! PEOPLE WILL LOOK AT MY NECK INSTEAD!', 'GIVE ME THAT. IT DRAWS THE EYE UP. AWAY FROM THE SITUATION.'],
      nude: ["A NECKLACE! NOW I'M WEARING SOMETHING!", 'JEWELRY! NAKED WITH JEWELRY IS A LOOK. RIGHT?'],
    },
    sell: ['FOR AGES FOUR AND UP. YOU TAKE ENOUGH SHIT, YOU SCREAM, AND EVERYBODY ON SCREEN EATS IT.'],
    trial: ["THREE KNIGHTS. DON'T HIT THEM. LET THEM PISS YOU OFF. THEN LET IT OUT."],
    more: ["THAT'S IT. LET IT BUILD.", 'GOOD. YOUR FACE IS DOING THE THING.'],
    miss: ["YOU POPPED IT. THEY PISS YOU OFF. NOT THE OTHER WAY AROUND.", "DON'T HIT BACK. TAKE IT. LIKE A MARRIAGE.", 'HANDS DOWN. LET THE KNIGHT WORK.', "YOU HIT IT. THAT'S THE ONE THING I SAID.", 'STOP PUNCHING THE TOYS.'],
    hint: ["THE PENDANT DOESN'T CARE WHAT YOU DISH OUT. IT CARES WHAT YOU TAKE. STAND THERE. GET BOPPED."],
    pass: ['THERE IT IS. MY EARS ARE BLEEDING. YOU PASS.', 'MOST BEAUTIFUL THING I EVER HEARD. YOU PASS.'],
    passed: {
      clean: ['I FEEL GREAT. I FEEL LIKE I JUST GOT DIVORCED.'],
      shitty: ['I SCREAMED SO HARD SOMETHING ELSE CAME OUT.'],
      nude: ['I SCREAMED SO HARD MY DICK WENT INSIDE.'],
    },
    gift: ['KEEP IT. FOR AGES FOUR AND UP. YOU BARELY QUALIFY.'],
    tease: ["WORKS ON BOSSES. NOTHING TOUCHES YOU FOR A WHILE AFTER. THERE'S AN OFF SWITCH IN YOUR PAUSE MENU. FOR FUNERALS."],
    enamored: {
      clean: ["I'VE BEEN THIS ANGRY MY WHOLE LIFE. NOW IT'S A WEAPON."],
      shitty: ["I'VE BEEN PISSED OFF ALL DAY. NOW IT PAYS."],
      nude: ['NAKED AND SCREAMING. MY TWO BEST TALENTS.'],
    },
    practice: ['THE KNIGHTS BLOW BACK UP. GET MAD AT THEM ALL DAY. THEN THE CANNON.'],
    good: ['LOUDER THAN MY EX. GOOD.', 'THE DRAGON UPSTAIRS HEARD THAT. THE FAKE ONE.', 'URUSAI. GRANDPA YELLED IT AT US KIDS. PRETTY SURE IT MEANS SHUT UP.'],
    idle: {
      clean: ["YOU AGAIN. THE GIFT SHOP HAD ONE PENDANT. YOU'RE WEARING IT.", "YOU AGAIN. I WAS NAPPING IN THE DRAGON'S MOUTH."],
      shitty: ['YOU CAME DOWN HERE IN THOSE? IT ALREADY SMELLS LIKE PROPANE.', "YOU AGAIN. THE DRAGON SMELLS BETTER THAN YOU, AND IT'S ROTTING."],
      nude: ['YOU AGAIN. NAKED IN A SERVICE TUNNEL. THE UNION WILL HEAR ABOUT THIS.', 'YOU AGAIN. STILL NO PANTS. STILL ONE PENDANT.'],
    },
  },
  // Future Land: the BEEF BRACERS, in XENOSCARE's old ride-ops break room under the hatch at the end of the stalker
  // basement's west hallway. The trial: uppercut his sparring alien (a busted animatronic green on a rod in a tire) and
  // ninja drop it head first into his floor (hold the uppercut, tap grab).
  armguards: {
    ask: {
      clean: ['ROBOT ARMS THAT SAY BEEF. THAT IS MY NAME NOW.', 'THEY SAY BEEF! THEY KNOW ME!'],
      shitty: ['BEEF BRACERS! NOBODY LOOKS AT MY PANTS WHEN MY ARMS SAY BEEF.', "THEY LIGHT UP! NOW I CAN SEE WHAT I'M STANDING IN."],
      nude: ["THEY SAY BEEF. THAT'S ALSO WHAT I'VE GOT OUT RIGHT NOW.", 'ARM ARMOR! I START AT THE WRISTS AND WORK MY WAY TO THE MIDDLE.'],
    },
    sell: ['OFF A GIFT SHOP ROBOT. THE LIGHTS SAY BEEF. YOUR UPPERCUT GOES HIGHER, AND IT GOES RIGHT THROUGH SHIELDS.'],
    trial: ['MY SPARRING ALIEN. UPPERCUT HIM, KEEP HOLDING, TAP GRAB. HEAD IN THE FLOOR.'],
    trialPose: 'fold',
    miss: ['UP IS HALF OF IT. NOW BRING HIM DOWN.', 'YOU LET GO. NEVER LET GO.', 'THAT WAS A HIGH FIVE.', 'YOU PUNCHED A GUY IN THE CHIN. MY MOTHER DOES THAT.', 'HE WENT UP. HE CAME DOWN BY HIMSELF. THAT IS GRAVITY, NOT YOU.'],
    hint: ['THE FIST GOES UP. THE HEAD COMES DOWN. HOLD THE UPPERCUT, AND TAP GRAB ON THE WAY UP.'],
    pass: ['HEAD FIRST INTO CONCRETE. THAT IS THE LESSON. YOU PASS.', 'LIKE A LAWN DART. YOU PASS.'],
    passed: {
      clean: ['I PILEDROVE A SPACE MAN. I FEEL LIKE AN ASTRONAUT.'],
      shitty: ['I DROPPED HIM SO HARD I DROPPED SOME TOO.'],
      nude: ['WE WERE UPSIDE DOWN TOGETHER. MY BALLS WERE IN HIS FACE.'],
    },
    gift: ['KEEP THEM. THE BATTERIES DIED IN NINETY-SIX. IT STILL SAYS BEEF. NOBODY KNOWS WHY.'],
    tease: ["UPPERCUT A BOSS IN THOSE. HE FEELS IT IN HIS FILLINGS. GOT A SHIELD? DOESN'T MATTER NOW."],
    enamored: {
      clean: ["I'M GONNA UPPERCUT EVERYBODY. MY LANDLORD. THE MOON."],
      shitty: ["I'M GONNA UPPERCUT EVERYBODY. FROM DOWNWIND."],
      nude: ["I'M GONNA UPPERCUT EVERYBODY. NAKED. FROM BELOW. WORST ANGLE THERE IS."],
    },
    follow: ['THESE DO THE NINJA DROP. UP WITH HIM, FLIP, DOWN HEAD FIRST. HE DOES NOT GET UP.'],
    followAgain: ['ANOTHER ONE FOR THE HIDDEN ART. THE NINJA DROP: UP, FLIP, HEAD FIRST INTO THE FLOOR.'],
    practice: ['PRACTICE ON THE ALIEN. HE COMES BACK. THEY ALWAYS COME BACK. THEN THE CANNON.'],
    good: ['LAWN DART. BEAUTIFUL.', 'RIGHT IN THE FLOOR. GOOD.', 'ITADAKIMASU. GRANDPA SAID IT BEFORE HE ATE. I SAY IT BEFORE I HURT PEOPLE.'],
    idle: {
      clean: ['YOU AGAIN. THE ROBOT ONLY HAD TWO ARMS.', 'YOU AGAIN. I WAS WATCHING MY TAPE.'],
      shitty: ['YOU WALKED PAST HER IN THOSE PANTS? SHE CAN SMELL, YOU KNOW.', 'YOU CAME BACK. THE BREAK ROOM SMELLS LIKE A BREAK ROOM AGAIN.'],
      nude: ['YOU AGAIN. NAKED IN THE BREAK ROOM. THAT IS A WRITE-UP.', 'YOU AGAIN. STILL NO PANTS. STILL TWO BRACERS.'],
    },
  },
  // Wilderness Land: the COWBELL CLODHOPPERS, in the Mother Lode's drowned old ASSAY OFFICE, through the little maze
  // under the flooded shaft's bed. The trial: dive kick his spike-hatted scarecrow (the boots: the spikes don't count),
  // keep holding, tap grab: the MISSILE, into his stack of dud dynamite.
  sabatons: {
    ask: {
      clean: ['ARE THOSE COWBOY BOOTS MADE OUT OF A TRAIN?', 'IRON COWBOY BOOTS WITH A COWBELL. I NEED MORE COWBELL.'],
      shitty: ['IRON BOOTS! FINALLY, SHOES THAT CAN HANDLE WHAT COMES DOWN MY LEG.', "BOOTS! MINE ARE FULL. DON'T ASK WHAT OF."],
      nude: ["BOOTS! NAKED IN BOOTS IS A COWBOY'S WORST NIGHT. I'LL TAKE IT.", 'GIVE ME THOSE. MY FEET ARE THE ONLY PART OF ME NOT FREEZING.'],
    },
    sell: ['RAILROAD IRON, TWO OLD BOOTS, A COWBELL OFF A FAKE COW. YOU DIVE KICK FURTHER, AND SPIKES CAN KISS YOUR SOLE.'],
    trial: ['MY SCARECROW. NAILS IN HIS HAT. DIVE KICK HIM ANYWAY, KEEP HOLDING, TAP GRAB. INTO THE DYNAMITE.'],
    trialPose: 'fold',
    miss: ['THAT WAS A STOMP. NOW THROW HIM.', "YOU KICKED HIM. HE'S STILL HERE. THAT'S THE PROBLEM.", 'HOLD THE KICK. TAP GRAB. HE FLIES.', 'YOU LANDED ON HIM LIKE A HEN ON AN EGG.', 'KICK, GRAB, THROW. YOU DID ONE OF THREE.'],
    hint: ['THE BOOT COMES DOWN. THE SCARECROW GOES ACROSS. HOLD THE DIVE KICK, TAP GRAB ON THE WAY DOWN.'],
    pass: ["STRAIGHT INTO THE DYNAMITE. SO MUCH FOR DUDS. YOU PASS.", 'LIKE A CANNONBALL WITH A HAT ON. YOU PASS.'],
    passed: {
      clean: ['I THREW A SCARECROW. THE CROWS ARE FREE.'],
      shitty: ['I THREW HIM SO HARD I LET SOME FLY TOO.'],
      nude: ['I FLIPPED UPSIDE DOWN NAKED. HIS HAT SAW EVERYTHING.'],
    },
    gift: ['KEEP THEM. THE COWBELL STAYS ON. YOUR ENEMIES HEAR YOU COMING. TOO LATE, BUT THEY HEAR.'],
    tease: ['DIVE KICK A BOSS IN THOSE. HE FEELS IT IN HIS SPURS. AND SPIKES? STEP ON THEM. GO AHEAD.'],
    enamored: {
      clean: ["I'M GONNA DIVE KICK EVERYBODY. OFF ROOFS. OFF THE BUS."],
      shitty: ["I'M GONNA DIVE KICK EVERYBODY. THEY'LL HEAR THE BELL. THEN THEY'LL SMELL ME."],
      nude: ["I'M GONNA DIVE KICK EVERYBODY. NAKED. FROM ABOVE. THEY'LL LOOK UP. BIG MISTAKE."],
    },
    follow: ['THESE DO THE MISSILE. FLIP OVER HIM, GRAB HIS SHOULDERS, HURL HIM. WHOEVER HE HITS GOES DOWN TOO.'],
    followAgain: ['ANOTHER ONE FOR THE HIDDEN ART. THE MISSILE: FLIP OVER HIM, THROW HIM AT HIS FRIENDS.'],
    practice: ['PRACTICE ON THE SCARECROW. I GOT A SHED FULL OF THEM. THEN THE CANNON.'],
    good: ['RIGHT IN THE DYNAMITE. BEAUTIFUL.', 'HE FLEW LIKE A RENT CHECK. GOOD.', 'YOROSHIKU. GRANDPA SAID IT TO EVERY NEW NEIGHBOR. THEY ALL MOVED.'],
    idle: {
      clean: ['YOU AGAIN. THE TRAIN ONLY HAD SO MUCH IRON.', 'YOU AGAIN. I WAS NAPPING ON THE COT.'],
      shitty: ['YOU SWAM HERE IN THOSE? NOW THE WHOLE MINE DRINKS IT.', 'YOU CAME BACK. THE WATER WAS CLEANER BEFORE YOU.'],
      nude: ['YOU AGAIN. SKINNY DIPPING IN A MINE. BOLD.', 'YOU AGAIN. STILL NO PANTS. STILL TWO BOOTS.'],
    },
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Wilderness Land: the drowned ASSAY OFFICE under the flooded shaft (frontier/town/benLair.ts)

/** Meathead, down the hole in the flooded shaft's bed the first time this go at the land. */
export const MH_MAZE: ByPants = {
  clean: ['A HOLE IN THE BOTTOM WITH A LIGHT IN IT. I GOTTA.'],
  shitty: ['A HOLE IN THE BOTTOM. GOOD. THE WATER CAN WASH ME ON THE WAY.'],
  nude: ['A HOLE IN THE BOTTOM. NAKED. I SHOULD NOT. I AM GOING TO.'],
};
/** Meathead's cartoon Japanese after the gift (the hidden art already taught), and Ben, lost. */
export const BOOT_WEEB: ByPants = {
  clean: ['MISSAIRU KIKKU DESU! I KNOW JAPANESE FROM CARTOONS.'],
  shitty: ['MISSAIRU KIKKU... UNKO DESU! I KNOW JAPANESE FROM CARTOONS.'],
  nude: ['MISSAIRU KIKKU... ZENRA DESU! I KNOW JAPANESE FROM CARTOONS.'],
};
export const BOOT_HUH = ["GRANDPA NEVER SAID THAT. GRANDPA MOSTLY SAID GET OFF THE LAWN."];
/** Ben, the scarecrow thrown the other way, away from the dynamite (the owner's: "if i throw the scarecrow not at the
 *  dynamite, he should acknowledge it. there are two directions you can throw it"). */
export const CROW_WRONG: ByPants = {
  clean: ["WRONG WAY. THE DYNAMITE'S BEHIND YOU.", 'YOU THREW HIM AT MY POOL. THE DYNAMITE IS THE OTHER WAY.', 'OTHER WAY. THE RED STICKS. BY THE WALL.'],
  shitty: ['OTHER WAY. AND NOW HE SMELLS LIKE YOU.', 'WRONG WAY. YOU THROW LIKE YOU SHIT. EVERYWHERE.', 'THE DYNAMITE IS THE OTHER WAY. SO IS THE SMELL, HOPEFULLY.'],
  nude: ['OTHER WAY. EYES ON THE DYNAMITE. NOT ON YOURSELF.', 'WRONG WAY. HARD TO AIM WITH EVERYTHING FLAPPING.', 'THE DYNAMITE IS BEHIND YOU. DO NOT TURN AROUND. YES. TURN AROUND.'],
};
/** Ben, thrown toward the dynamite but it never got there. */
export const CROW_SHORT: ByPants = {
  clean: ['RIGHT WAY. NO ARM. AGAIN.', "HE DIDN'T MAKE IT. THROW HIM LIKE HE OWES YOU MONEY."],
  shitty: ["SHORT. HE DIDN'T WANT TO GET CLOSER TO YOU EITHER.", 'RIGHT WAY. NO ARM. ALL GUT, I GUESS.'],
  nude: ['SHORT. LIKE EVERYTHING ELSE ON YOU RIGHT NOW.', 'RIGHT WAY. NO ARM. PUT YOUR BACK INTO IT. YOUR NAKED BACK.'],
};
/** Getting into the cannon: Ben, where it goes (after Meathead's MH_CANNON_ASK). */
export const BEN_CANNON_FR = ["THE LOG RIDE. FRONT OF THE LINE. YOU'RE WELCOME.", 'STRAIGHT TO THE LOG RIDE. SKIP THE LINE. EVERYBODY HATES YOU.'];
/** Meathead, down at the log ride's station. */
export const MH_LANDED_FR: ByPants = {
  clean: ['I SKIPPED THE WHOLE LINE. BEST DAY OF MY LIFE.'],
  shitty: ['SKIPPED THE LINE. NOBODY COMPLAINED. THEY SMELLED ME.'],
  nude: ['SKIPPED THE LINE NAKED. NOBODY STOPPED ME. NOBODY WANTED TO TOUCH ME.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Future Land: the ride-ops break room under the stalker basement's west hallway (space/queen/benLair.ts)

/** Meathead, down the hatch into the break room the first time this go at the land (safe: the stalker's up there). */
export const MH_HATCH_SP: ByPants = {
  clean: ["A WARM LIGHT IN A HOLE IN A HORROR RIDE. THAT'S NEVER BAD."],
  shitty: ["A WARM HOLE. FINALLY, SOMEWHERE SHE CAN'T SMELL ME."],
  nude: ["A WARM HOLE. DON'T SAY IT."],
};
/** Meathead's cartoon Japanese after the gift (the hidden art already taught: the big beat has its own), and Ben, lost. */
export const BRACER_WEEB: ByPants = {
  clean: ['NINJA DROPPU DESU! I KNOW JAPANESE FROM CARTOONS.'],
  shitty: ['NINJA DROPPU... AND POOPU! I KNOW JAPANESE FROM CARTOONS.'],
  nude: ['NINJA DROPPU... NAKED NO KIWAMI! I KNOW JAPANESE FROM CARTOONS.'],
};
export const BRACER_HUH = ['I KNOW THREE WORDS OF JAPANESE. THOSE WERE NOT THEM.'];
/** Getting into the cannon: Ben, where it goes (after Meathead's MH_CANNON_ASK). */
export const BEN_CANNON_SP = ['BACK WHERE YOU FELL IN. GIVE HER A MINUTE BEFORE YOU GO STOMPING AROUND.', "WHERE YOU CAME DOWN. SHE WON'T BE THERE. PROBABLY."];

// ---------------------------------------------------------------------------------------------------------------
// Fairy Land: the dragon's lair's old machine room (fantasy/glen/benLair.ts)

/** Meathead, in through the hole in the mine shaft's wall the first time this go at the land. */
export const MH_TUNNEL: ByPants = {
  clean: ["A SECRET TUNNEL UNDER THE MEADOW. THE UNICORNS DON'T KNOW."],
  shitty: ['A HOLE IN THE WALL. FINALLY, SOMEWHERE TO CHANGE.'],
  nude: ["A TUNNEL. IT'S COLD DOWN HERE. EVERYTHING'S SHRINKING."],
};
/** Meathead's cartoon Japanese, after the gift (the joke's on him), and Ben, lost. */
export const AMULET_WEEB: ByPants = {
  clean: ['OMAE WA MOU... PISSED OFF! I KNOW JAPANESE FROM CARTOONS.'],
  shitty: ['OMAE WA MOU... SHAT DESU! I KNOW JAPANESE FROM CARTOONS.'],
  nude: ['OMAE WA MOU... NAKED DESU! I KNOW JAPANESE FROM CARTOONS.'],
};
export const AMULET_HUH = ["NO IDEA. GRANDPA ONLY TAUGHT ME THE WORD FOR SOY SAUCE. AND I FORGOT IT."];
/** Getting into the cannon: Ben, where it goes (after Meathead's MH_CANNON_ASK). */
export const BEN_CANNON_FY = ["THE DRAGON'S LAIR. UPSTAIRS. MIND THE GUY IN THE SUIT.", "UP. THE DRAGON'S LAIR. DON'T LAND IN THE THORNS."];

// ---------------------------------------------------------------------------------------------------------------
// Hollywood Land: the HAPPYWOOD WATER TOWER (lot/benTower.ts)

/** Ben, the trial: he walked into the curtain instead of sliding under it. */
export const LEGS_CURTAIN = ["UNDER IT. YOU'RE NOT A STAGEHAND.", 'THE CURTAIN DOES NOT GO UP FOR YOU. SLIDE.', 'YOU WALKED INTO A CURTAIN. IN FRONT OF EVERYBODY.'];
/** Meathead, the first time a rig hatch opens over him this go at the land. */
export const MH_HATCH: ByPants = {
  clean: ['THE HATCH OPENS WHEN I RIDE UP. THE TOWER WANTS ME.'],
  shitty: ["THE HATCH OPENS FOR ME. FIRST DOOR ALL DAY THAT DIDN'T SLAM IN MY FACE."],
  nude: ['THE HATCH OPENS. NICE BREEZE UP HERE. EVERYWHERE.'],
};
/** Ben, done teaching: the cannon (it only goes to the bottom of the tower: the owner's "just cause"). */
export const NUDGE_HW: ByPants = {
  clean: ["GET IN THE CANNON. IT GOES TO THE BOTTOM. I DON'T MAKE THE RULES.", "THE CANNON, MEATHEAD. BOTTOM OF THE TOWER. JUST 'CAUSE."],
  shitty: ['THE CANNON. PLEASE. THE TANK HOLDS SMELLS.', 'GET IN THE CANNON. THE TOWN DRINKS FROM THIS TANK.'],
  nude: ['THE CANNON. GO BE NAKED AT THE BOTTOM.', 'GET IN THE CANNON. AND GET OFF MY RAFT.'],
};
/** Getting into the cannon: Meathead asks, Ben answers. */
export const MH_CANNON_ASK = ['WHERE DOES THIS ONE GO?', "WHERE'S THIS ONE SHOOT ME?"];
export const BEN_CANNON = ["THE BOTTOM OF THE TOWER. JUST 'CAUSE.", "BACK TO THE BOTTOM. DON'T ASK."];
/** Meathead, coming down past the whole tower. */
export const MH_FALL = ['THE BOTTOM?! WHY THE BOTTOM?!', 'ALL THE WAY DOWN?! I JUST CLIMBED THIS!'];
/** Meathead, down on the street at its foot. */
export const MH_LANDED: ByPants = {
  clean: ['ALL THAT CLIMBING. FOR THAT.'],
  shitty: ['I SHIT A LITTLE ON THE WAY DOWN. A LITTLE MORE.'],
  nude: ['I LANDED NAKED IN A COWBOY TOWN. YEE-HAW.'],
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
// (trimmed, the owner's: "somewhat trim his dialogue", with what this piece's own follow-up does said after: the piece's
// `follow`. Earlier: "they don't work on bosses" then "more damage on bosses" sounded contradictory: the follow-up's for
// the mid-sized guys; it's the charge move itself the armor makes hit bosses harder)
// (and trimmed again: what the armor does to bosses is each piece's own tease after the gift)
export const ART_HOW = [
  'HOLD A CHARGE MOVE. TAP GRAB, DURING IT OR RIGHT AFTER. NO HIT NEEDED.',
  'MID-SIZED GUYS ONLY. NO BOSSES, NO CRITTERS.',
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
/** Ben, the shins (the flash kick: the one follow-up that isn't a grab): with the big beat (after ART_HOW)... */
export const ART_FLASH = ['THESE ARE THE ODD ONES. NO GRAB. HOLD THE SLIDE, PUSH UP: THE FLASH KICK. WHOEVER IT KILLS COMES APART IN HALVES.'];
/** ...or, the art already taught, instead of ART_AGAIN. */
export const ART_AGAIN_FLASH = ['ANOTHER ONE FOR THE HIDDEN ART. THIS ONE CHEATS: NO GRAB. HOLD THE SLIDE, PUSH UP. IT CUTS GUYS IN HALF.'];

// ---------------------------------------------------------------------------------------------------------------
// Jungle Land: the dummy's head punted the other way (not through the uprights: it still counts)

export const PADS_WIDE = ['WIDE LEFT. STILL COUNTS. YOU PASS.', "NOWHERE NEAR. HEAD'S OFF, THOUGH. YOU PASS."];

// ---------------------------------------------------------------------------------------------------------------
// HIS BACKSTORY, a beat a meeting (the owner's "he slowly reveals his backstory the more times you find him"): the
// 2nd lair he's met in (whichever land) gets the first beat, the 3rd the next, on to the 7th; the 8th is the last
// meeting (AGAIN_LAST, then FINAL_* after the gift). Throwaway gym stuff first, then the real thing. Woven through it,
// the owner's "the fact that meathead knows more japanese than him, even if completely rudimentary and broken and
// terrible, makes him insecure": Meathead's cartoon Japanese gets under his skin (curious, then irritated, then it
// stings), played dry. Said after the later meeting's hello, before Meathead asks about the piece (meetup.ts).
// Ben's lines are text; Meathead's a pool by his pants.
//
// Timeline: the game's now is the mid 2020s, Ben's about sixty (born mid sixties), so the camp was his grandpa's and
// his dad's (born in it), and the no-Japanese rule came down to him.

export type StoryLine = { who: 'ben'; text: string } | { who: 'mh'; lines: ByPants };
const ben = (text: string): StoryLine => ({ who: 'ben', text });
const mh = (lines: ByPants): StoryLine => ({ who: 'mh', lines });

/** The 2nd meeting: the broken nose. */
export const BACKSTORY_NOSE: StoryLine[] = [
  ben('THIS NOSE? EIGHTY-FOUR. SPOTTER FELL ASLEEP.'),
  mh({
    clean: ["YOU NEVER FELL ASLEEP ON ME. YOU'RE A SAINT."],
    shitty: ['YOU NEVER FELL ASLEEP ON ME. NOT EVEN THE TIME I SHAT ON THE BENCH.'],
    nude: ['YOU NEVER FELL ASLEEP ON ME. NOT EVEN NAKED SQUAT DAY.'],
  }),
  ben('YOU SCREAM EVERY REP.'),
];
/** The 3rd: Meathead's cartoon Japanese, first noticed; grandpa's few words. */
export const BACKSTORY_GRANDPA: StoryLine[] = [
  ben('STILL WATCHING THE JAPANESE CARTOONS?'),
  mh({
    clean: ["EVERY EPISODE TWICE! DATTEBAYO! I'M FLUENT!"],
    shitty: ['EVERY EPISODE! ON THE TOILET, MOSTLY! DATTEBAYO!'],
    nude: ['EVERY EPISODE! DRESSED LIKE THIS! DATTEBAYO!'],
  }),
  ben('HUH. GRANDPA SPOKE IT. I GOT A FEW WORDS.'),
];
/** The 4th: he looked it up. Irritated. */
export const BACKSTORY_LOOKED: StoryLine[] = [
  ben("I LOOKED UP DATTEBAYO. IT'S NOTHING. YOU STILL KNOW MORE THAN ME."),
  mh({
    clean: ["I'LL TEACH YOU! KAMEHAMEHA MEANS GOOD MORNING."],
    shitty: ["I'LL TEACH YOU! UNKO MEANS THIS."],
    nude: ["I'LL TEACH YOU! ZENRA MEANS THIS."],
  }),
  ben("DON'T."),
];
/** The 5th: his dad. */
export const BACKSTORY_DAD: StoryLine[] = [
  ben('MY DAD. SAME CANNERY, THIRTY YEARS. TEN WORDS A DINNER.'),
  mh({
    clean: ["MINE NEVER SAID TEN WORDS EITHER. HE WASN'T THERE. WE'RE THE SAME."],
    shitty: ['MINE LEFT AFTER MY CHRISTENING. I DID THIS AT IT.'],
    nude: ["MINE JUST LEFT. I'D HUG YOU, BUT LOOK AT ME."],
  }),
  ben("WE'RE NOT THE SAME."),
];
/** The 6th: the one word he had, and Meathead would've had more. It stings. */
export const BACKSTORY_ARIGATO: StoryLine[] = [
  ben("GUY ASKED ME TO SAY SOMETHING IN JAPANESE. I SAID ARIGATO. HE SAID, THAT'S IT?"),
  mh({
    clean: ["I'D HAVE YELLED DATTEBAYO FOR YOU!"],
    shitty: ["I'D HAVE YELLED DATTEBAYO FOR YOU. AND SHAT. FOR EMPHASIS."],
    nude: ["I'D HAVE YELLED DATTEBAYO FOR YOU. NAKED."],
  }),
  ben("I KNOW. THAT'S THE PROBLEM."),
];
/** The 7th: why he doesn't know Japanese. THE INTERNMENT BEAT (the owner's idea, his question: "would it perhaps be too
 *  dark..."), kept to itself so it pulls in one line (BACKSTORY_CAMP_ON; BACKSTORY_SPARE plays instead). The owner's
 *  tone: "the internment camp lines are so fucked up that even that seems too much even for meathead. that's the joke",
 *  then "still keep it comedic. don't let it get sentimental, just a joke that plays at the idea that those with power
 *  may be more violently corrupt than meathead, even if meathead is more outwardly violent". So: Ben flat and matter of
 *  fact, Meathead (who kills people all day) appalled that it was done on purpose, on paper; Ben shrugs it off and
 *  back to business. The joke's on the people with the power. Never on the people in the camp, never on Ben. */
export const BACKSTORY_CAMP_ON = true;
export const BACKSTORY_CAMP: StoryLine[] = [
  ben("WHY ONLY A FEW WORDS? THE GOVERNMENT PUT GRANDPA'S WHOLE FAMILY IN A CAMP. AFTER THAT, NO JAPANESE IN THE HOUSE."),
  mh({
    clean: ['THE GOVERNMENT DID THAT? ON PURPOSE? I ONLY KILL GUYS TRYING TO KILL ME!'],
    shitty: ['THE GOVERNMENT DID THAT? WITH FORMS? I SHIT MYSELF BY ACCIDENT AND I STILL SAY SORRY!'],
    nude: ["THE GOVERNMENT DID THAT? I'M NAKED WITH A RAY GUN AND I'M THE DECENT ONE?"],
  }),
  ben('YEAH. THERE WAS PAPERWORK. ANYWAY. THE ARMOR.'),
];
/** The 7th's beat if the camp's pulled. */
export const BACKSTORY_SPARE: StoryLine[] = [
  ben('SAME BELT SINCE EIGHTY-SEVEN. OUTLASTED BOTH WIVES.'),
  mh({
    clean: ['CAN I TOUCH IT?'],
    shitty: ["CAN I TOUCH IT? I'LL WIPE FIRST."],
    nude: ['CAN I WEAR IT? I NEED SOMETHING.'],
  }),
  ben('NO.'),
];
/** The beats in order, the 2nd meeting's first. */
export const BACKSTORY: StoryLine[][] = [BACKSTORY_NOSE, BACKSTORY_GRANDPA, BACKSTORY_LOOKED, BACKSTORY_DAD, BACKSTORY_ARIGATO, BACKSTORY_CAMP_ON ? BACKSTORY_CAMP : BACKSTORY_SPARE];

/** The last meeting (the 8th lair, whichever land): his hello (the gross-up's line, in place of AGAIN). */
export const AGAIN_LAST: ByPants = {
  clean: ['LAST HOLE. YOU FOUND THEM ALL.'],
  shitty: ['LAST HOLE. YOU FOUND THEM ALL. I SMELLED THIS ONE COMING.'],
  nude: ['LAST HOLE. YOU FOUND THEM ALL. NAKED. IMPRESSIVE.'],
};
/** ...and after the last gift (the owner's "you got all the pieces"): the full set, proud his way; Meathead; the one
 *  cartoon word Ben finally says back; a word on the road ahead (not what's on it). */
export const FINAL_SET = ["ALL EIGHT. YOU LOOK LIKE A YARD SALE THAT KILLS PEOPLE. I'M PROUD OF YOU."];
export const FINAL_MH: ByPants = {
  clean: ['I NEVER FINISHED ANYTHING! NOT SCHOOL, NOT A SANDWICH! DATTEBAYO, CON-FUCK-TIOUS!'],
  shitty: ['ARMOR ON EVERYTHING BUT THE PART THAT NEEDS IT! DATTEBAYO, CON-FUCK-TIOUS!'],
  nude: ['EIGHT PIECES OF ARMOR AND STILL NO PANTS! DATTEBAYO, CON-FUCK-TIOUS!'],
};
export const FINAL_DATTE = ["...DATTEBAYO. TELL ANYBODY, YOU'RE DEAD."];
export const FINAL_GO = ["WHATEVER'S AT THE END OF THIS DUMP, HIT IT WITH ALL EIGHT."];

const storyBen = (s: StoryLine[]) => s.flatMap(l => (l.who === 'ben' ? [l.text] : []));
const storyMh = (s: StoryLine[]) => s.flatMap(l => (l.who === 'mh' ? all(l.lines) : []));
const STORIES = [BACKSTORY_NOSE, BACKSTORY_GRANDPA, BACKSTORY_LOOKED, BACKSTORY_DAD, BACKSTORY_ARIGATO, BACKSTORY_CAMP, BACKSTORY_SPARE];

const pieceBen = (p: PieceLines) => [...p.sell, ...p.trial, ...p.miss, ...p.hint, ...p.pass, ...p.gift, ...p.tease, ...p.practice, ...p.good, ...all(p.idle), ...(p.more ?? []), ...(p.follow ?? []), ...(p.followAgain ?? [])];
const pieceMeathead = (p: PieceLines) => [...all(p.ask), ...all(p.passed), ...all(p.enamored)];

export const BEN_VOICE_LINES: Record<string, string[]> = {
  [BEN_VOICE]: [...NAME, ...all(RIDDLE), ...PURPOSE, ...FIRST_ASIDE, ...all(AGAIN), ...all(NUDGE), ...all(NUDGE_OUT), ...BYE_BEN, ...ART_OPEN, ...ART_HOW, ...ART_HUH, ...ART_AGAIN, ...ART_FLASH, ...ART_AGAIN_FLASH, ...Object.values(PIECE_LINES).flatMap(pieceBen), ...LEGS_CURTAIN, ...all(NUDGE_HW), ...BEN_CANNON, ...AMULET_HUH, ...BEN_CANNON_FY, ...BRACER_HUH, ...BEN_CANNON_SP, ...BOOT_HUH, ...BEN_CANNON_FR, ...all(CROW_WRONG), ...all(CROW_SHORT), ...PADS_WIDE, ...STORIES.flatMap(storyBen), ...all(AGAIN_LAST), ...FINAL_SET, ...FINAL_DATTE, ...FINAL_GO],
  meathead: [...all(MEET), ...all(FIRST_WHY), ...all(FIRST_REACT), ...all(AGAIN_MH), ...BYE_MEATHEAD, ...all(ART_MH), ...all(ART_WEEB), ...Object.values(PIECE_LINES).flatMap(pieceMeathead), ...all(MH_PASSAGE), ...all(MH_HATCH), ...MH_CANNON_ASK, ...MH_FALL, ...all(MH_LANDED), ...all(MH_TUNNEL), ...all(AMULET_WEEB), ...all(MH_HATCH_SP), ...all(BRACER_WEEB), ...all(MH_MAZE), ...all(BOOT_WEEB), ...all(MH_LANDED_FR), ...STORIES.flatMap(storyMh), ...all(FINAL_MH)],
};
