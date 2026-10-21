// What's said in PUNCHY & KICKY's part of the park (the cat-and-mouse knockoff, STUPID DAD's extended universe), by
// voice (cartoon/voices.ts gathers it; tools/voices records it). In the user's voice: blunt, short, vulgar, specific;
// talk less; fit the trigger. Picked with pickLine (no line twice within 45 s). Meathead's lines and everybody reacting
// to him in clean / shitty / naked pools.
//
// Meathead's never seen the show (the show inside STUPID DAD: the cartoon the Boy watches), and he's fine with the
// violence: "FINALLY, A CARTOON THAT GETS IT." The Looney Tunes gags (anvils, giant hammers, rakes, bear traps, safes,
// a piano, cannons, dynamite, portable holes) are real here: they hurt for real and they kill for real, him included.
// Never anything about his age (it stays ambiguous). Pure data.

import { allOf, type ByPants, type HurtTable } from '../talk';

/** The area's cast's voices (cast.json): a man's and a woman's each; the costume heads muffle the cat's and the
 *  mouse's (the dynamite mouse is the mouse costume too). */
export const CAST_VOICES = {
  punchy: 'm2.cartoon.punchy', punchyf: 'm2.cartoon.punchyf',
  kicky: 'm2.cartoon.kicky', kickyf: 'm2.cartoon.kickyf',
  host: 'm2.cartoon.host', hostf: 'm2.cartoon.hostf',
  stagehand: 'm2.cartoon.stagehand', stagehandf: 'm2.cartoon.stagehandf',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In under the arch from the big-kid zone (the user's line first: he's fine with the violence). */
export const ARRIVE: ByPants = {
  clean: ['FINALLY, A CARTOON THAT GETS IT.', "A CAT AND A MOUSE KILLING EACH OTHER WITH HAMMERS. NOW THAT'S A SHOW."],
  shitty: ["FINALLY, A CARTOON THAT GETS IT. BLOOD EVERYWHERE. NOBODY'LL SMELL ME.", 'FINALLY, A CARTOON THAT GETS IT. AND A FLOOR THAT HIDES STAINS.'],
  nude: ['FINALLY, A CARTOON THAT GETS IT. THE ANIMALS ARE NAKED TOO.', 'BLOOD, HAMMERS AND ME NAKED. BEST PART OF THE PARK.'],
};
/** Back on a later visit. */
export const REVISIT: ByPants = {
  clean: ['THE GOOD CARTOON AGAIN.', 'PUNCHY AND KICKY. STILL THE BEST THING IN THIS PARK.'],
  shitty: ['BACK. THE BLOOD HIDES THE SMELL. MOSTLY.', 'THE HAMMER PLACE AGAIN. SAME PANTS.'],
  nude: ['BACK AGAIN. STILL NAKED. STILL A FAN.', "THE HAMMER PLACE. NAKED. NOBODY SWING LOW."],
};

/** Things he's got to say passing them (once each a visit). */
export const GAGS: Record<'sign' | 'anvil' | 'rake' | 'merch' | 'tv' | 'killorama' | 'dock' | 'safe' | 'piano' | 'cannon' | 'fuse' | 'canyon' | 'tower' | 'holes' | 'exit', ByPants> = {
  /** The gate's sign: a show inside a show he's never seen. */
  sign: {
    clean: ['PUNCHY AND KICKY. NEVER HEARD OF THEM. ALREADY A FAN.', "A CARTOON FROM STUPID DAD? STUPID DAD HAD A CARTOON?"],
    shitty: ['NEVER SEEN IT. STILL BETTER THAN MY PANTS.', 'PUNCHY AND KICKY. THEY WOULD HAVE A FIELD DAY WITH ME.'],
    nude: ["NEVER SEEN THE SHOW. THE SHOW'S ABOUT TO SEE ME.", 'PUNCHY AND KICKY. NAKED FAN, DAY ONE.'],
  },
  /** The first anvil coming down. */
  anvil: {
    clean: ["A REAL ANVIL. FROM THE SKY. THEY'RE DOING IT RIGHT.", 'REAL ANVILS. THIS PARK FIRED ALL ITS LAWYERS.'],
    shitty: ["ONE OF THOSE ON ME AND IT'S COMING OUT BOTH ENDS.", "AN ANVIL. I'D SHIT MYSELF, BUT I ALREADY DID."],
    nude: ['A REAL ANVIL. AND NOTHING BETWEEN IT AND MY NUTS.', 'ANVILS. NAKED. I WILL BE QUICK.'],
  },
  /** The rakes in the grass. */
  rake: {
    clean: ['RAKES. TEETH UP. THE OLD RAKE BIT.', 'SOMEBODY LEFT RAKES IN THE GRASS. ON PURPOSE.'],
    shitty: ['A RAKE TO THE FACE. THEN THE PANTS FINISH THE JOB.', 'RAKES. ONE MORE THING I DO NOT NEED TODAY.'],
    nude: ['A RAKE IN THE FACE BEATS A RAKE ANYWHERE ELSE.', 'NAKED IN A RAKE PATCH. CAREFUL WHAT SWINGS UP.'],
  },
  /** The merch stand. */
  merch: {
    clean: ['A SAFETY CLEAVER. AGES THREE AND UP. GOOD PARENTING.', 'BLOOD SPLATTER TEES. FINALLY, MERCH I WOULD WEAR.'],
    shitty: ['BLOOD SPLATTER TEES. WHERE ARE THE SHIT SPLATTER PANTS?', 'EVERYTHING BUT PANTS. LIKE EVERY GIFT SHOP.'],
    nude: ['A SHIRT. I COULD WEAR A SHIRT. NO. COMMITTED.', 'SPLATTER TEES. I AM A SPLATTER EVERYTHING.'],
  },
  /** The jumbotron playing the cartoon. */
  tv: {
    clean: ['THE MOUSE TOOK HIS HEAD OFF WITH A HAMMER. FIVE STARS.', 'NO TALKING. NO LESSON. JUST HAMMERS. PERFECT.'],
    shitty: ['HE HIT THE CAT SO HARD HE SHAT. I KNOW THAT ONE.', "BEST THING I'VE SEEN ALL DAY. AND I'VE SEEN MY PANTS."],
    nude: ["THE CAT'S NAKED TOO. NOBODY SAYS SHIT TO HIM.", 'CARTOON ANIMALS ARE ALWAYS NAKED. ROLE MODELS.'],
  },
  /** The KILL-O-RAMA's giant robots swinging. */
  killorama: {
    clean: ['KILL-O-RAMA. BEST RIDE NAME IN THE PARK.', 'GIANT ROBOT CAT. GIANT HAMMER. THESE PEOPLE GET ME.'],
    shitty: ["ONE SWING AND I'M A PANCAKE. WITH A FILLING.", "KILL-O-RAMA. I'M ALREADY HALFWAY THERE."],
    nude: ['A GIANT HAMMER AND NO CUP. GREAT.', 'KILL-O-RAMA. AND HERE COMES THE NAKED GUY.'],
  },
  /** The GENERIC-CO crates. */
  dock: {
    clean: ['GENERIC-CO. NOBODY SUES GENERIC-CO.', 'A WHOLE DOCK OF CRATES THAT WANT TO HURT ME.'],
    shitty: ["GENERIC-CO. DO THEY MAKE PANTS? THEY'D BE THE WORST PANTS.", "A CRATE THAT PUNCHES. AIM HIGH, PAL."],
    nude: ['GENERIC-CO. ONE CRATE OF PANTS, PLEASE.', "A BOXING GLOVE IN A BOX. AND MY BOX OUT IN THE AIR."],
  },
  /** The safe coming down. */
  safe: {
    clean: ['A SAFE. OUT OF NOWHERE. CLASSIC.', 'THEY HANG SAFES OVER THE PATH. ON PURPOSE.'],
    shitty: ["A SAFE. NOT WITH MY PANTS IT ISN'T.", 'A SAFE. I SHOULD KEEP MY UNDERWEAR IN THERE.'],
    nude: ['A SAFE. DROPPED AT A NAKED MAN.', 'A SAFE. NOTHING ON ME IS SAFE.'],
  },
  /** The piano coming down. */
  piano: {
    clean: ['THEY DROPPED A PIANO. AT A GUY. ME.', 'A WHOLE PIANO. THAT WAS A B FLAT.'],
    shitty: ['A PIANO. ALMOST PLAYED ME LIKE ONE.', 'THE PIANO JUST HIT EVERY NOTE IN MY PANTS.'],
    nude: ['A PIANO. NAKED. THAT WAS ALMOST A RECITAL.', 'DROPPED A PIANO ON A NAKED GUY. TOUGH CROWD.'],
  },
  /** The circus cannon lining up. */
  cannon: {
    clean: ['A CIRCUS CANNON. LOADED. POINTED AT ME.', 'THEY AIM THE CANNON AT THE GUESTS. RESPECT.'],
    shitty: ['A CANNON. I KNOW ALL ABOUT BLASTS.', "SHOOT ME AND YOU'LL WISH YOU HADN'T."],
    nude: ['A CANNON. AND ALL OF ME OUT IN THE OPEN.', 'NAKED IN FRONT OF A CANNON. THE CIRCUS LIFE.'],
  },
  /** The long fuse. */
  fuse: {
    clean: ['A FUSE. A LONG ONE. I KNOW HOW THIS ENDS.', 'A GIANT ROBOT MOUSE LIGHTING DYNAMITE. THE DREAM.'],
    shitty: ["DYNAMITE. ONE BOOM AND THE PANTS ARE GONE. I'D WELCOME IT.", 'A FUSE. MY ASS HAS BEEN LIT FOR AN HOUR.'],
    nude: ['DYNAMITE. NAKED. THE EYEBROWS GO FIRST.', 'A LONG FUSE. NOT A WORD.'],
  },
  /** The painted canyon. */
  canyon: {
    clean: ['A CANYON. YOU FALL AND YOU END UP A LITTLE PUFF.', 'A FAKE CANYON. DOWN THERE IS REAL THOUGH.'],
    shitty: ['A BOTTOMLESS CANYON. GREAT PLACE TO DUMP THESE PANTS.', 'A CANYON. ONE GOOD SCARE AND I LEAVE A MARK.'],
    nude: ['A CANYON. NAKED. THE WIND GOES EVERYWHERE.', 'IF I FALL, THE LAST THING THEY SEE IS MY ASS.'],
  },
  /** On one of the area's towers as it first leans. */
  tower: {
    clean: ['THE WOBBLY STACKS. OVER A CANYON. GOOD.', 'SAME STACKS. NOW WITH A CANNON. GREAT.'],
    shitty: ["DON'T LEAN TOO FAR. EVERYTHING LEANS WITH ME.", "IF THIS TIPS, THE CANYON GETS A GIFT."],
    nude: ['A WOBBLY STACK. NAKED. EVERYTHING SWINGS.', 'LEANING NAKED OVER A CANYON. THE VIEW FROM BELOW. SORRY.'],
  },
  /** The floor full of portable holes. */
  holes: {
    clean: ['PORTABLE HOLES. ALL OVER THE FLOOR. WHO LEAVES THOSE OUT?', 'A FLOOR MADE OF HOLES. SO, NO FLOOR.'],
    shitty: ['A HOLE. I COULD DROP THESE PANTS DOWN ONE.', 'HOLES EVERYWHERE. MY PANTS HAVE ONE TOO.'],
    nude: ['A FLOOR OF HOLES. ALL OF ME DANGLING OVER THEM.', 'HOLES. NAKED. NOT THAT KIND OF PARK.'],
  },
  /** On, to the amphitheater (STUPID DAD LIVE). */
  exit: {
    clean: ['STUPID DAD LIVE. HE HAS A LOT TO LIVE UP TO NOW.', 'AFTER THE CAT AND THE MOUSE? GOOD LUCK, STUPID DAD.'],
    shitty: ["STUPID DAD LIVE. I'LL SIT IN THE FRONT ROW. THEY'LL MOVE.", 'A LIVE SHOW. HOPE THE SEATS WIPE CLEAN.'],
    nude: ['STUPID DAD LIVE. HE BETTER NOT HAVE A NO-SHIRT RULE.', 'A LIVE SHOW. NAKED. I AM THE SHOW.'],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The area's cast (barks: rare, short)

/** PUNCHY (the cat costume, a mallet): the show's catchphrases, in character. */
export const PUNCHY_BARK: ByPants = {
  clean: ['PUNCHY PUNCH-PUNCH!', "HOLD STILL! IT'S IN MY CONTRACT!", "YOU'RE THE MOUSE NOW!"],
  shitty: ["EVEN THE CAT WON'T PLAY WITH YOU! YOU STINK!", 'SOMETHING CRAWLED IN YOUR PANTS AND DIED!'],
  nude: ["PUT YOUR TAIL AWAY! THAT'S NOT A TAIL!", "NAKED? THAT'S MY BIT! I'M THE CAT!"],
};
/** KICKY (the mouse costume, a cleaver). */
export const KICKY_BARK: ByPants = {
  clean: ['KICKY KICK-KICK!', 'SAY CHEESE! THEN SAY GOODBYE!', "I'M A MOUSE! I'M CONTRACTUALLY ADORABLE!"],
  shitty: ["THE MOUSE DON'T STEP IN THAT!", 'YOU SMELL LIKE THE CAT CAGE!'],
  nude: ["A NAKED GIANT! KICKY'S GOT A TARGET!", 'I CAN SEE IT FROM DOWN HERE!'],
};
/** KICKY with the dynamite (the same mouse, a bandolier of sticks): lighting one. */
export const BOOM_BARK: ByPants = {
  clean: ['FIRE IN THE HOLE! SQUEAK!', "THIS ONE'S GOT YOUR NAME ON IT!", 'CATCH!'],
  shitty: ["NO MATCHES NEAR HIM! OH, WHAT THE HELL!", 'LIGHT HIM UP! HE SMELLS FLAMMABLE!'],
  nude: ['NOTHING TO BURN BUT YOU!', "EYES UP HERE, BIG GUY! HERE IT COMES!"],
};
/** THE HOST (the live show's ringmaster: tailcoat, top hat, bullhorn): first sight of him. */
export const HOST_BARK: ByPants = {
  clean: ['LADIES AND GENTLEMEN! A VOLUNTEER!', 'GIVE IT UP FOR THE BIG GUY!', 'STAY IN YOUR SEATS, FOLKS!'],
  shitty: ['A VOLUNTEER! WHO HAS HAD AN ACCIDENT!', "FOLKS, DON'T SIT DOWN OVER HERE."],
  nude: ['A VOLUNTEER! NO COSTUME! NO ANYTHING!', "COVER THE CHILDREN'S EYES, FOLKS!"],
};
/** ...calling down an anvil on him (the tell). */
export const HOST_CUE: ByPants = {
  clean: ['AND NOW... THE ANVIL!', 'DRUMROLL! ANVIL!', 'LOOK UP, BIG GUY!'],
  shitty: ['AND NOW... THE ANVIL! SOMEBODY HOSE HIM AFTER!', 'ANVIL! AND A MOP!'],
  nude: ['AND NOW... THE ANVIL! AIM FOR THE MIDDLE!', 'ANVIL! THE CENSOR BAR IS FREE!'],
};
/** A STAGEHAND (black clothes, a headset, gaffer tape; bored). */
export const STAGEHAND_BARK: ByPants = {
  clean: ['GUEST ON THE SET. GREAT.', 'HOLE GOING DOWN.', 'WATCH YOUR STEP. OR DON\'T.'],
  shitty: ['HE SHAT ON MY SET.', "I'M NOT TAPING THAT."],
  nude: ['NAKED GUY ON THE SET. NOT MY DEPARTMENT.', 'SOMEBODY GET HIM A ROBE. NOT ME.'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here, and the death screens (28 characters at most)

export const HURT: HurtTable = {
  'm2:ct_anvil': { hurt: ['AN ANVIL! ON MY HEAD!', 'I SAW THE SHADOW! I SAW IT!', 'MY HEAD! IT\'S ANVIL SHAPED NOW!'], death: ['FLATTENED BY AN ANVIL', 'ANVIL. HEAD. THE END.'] },
  'm2:ct_hammer': { hurt: ['THE ROBOT CAT GOT ME!', 'GIANT HAMMER! ALL OF ME!', 'BONKED! FOR REAL!'], death: ['HAMMERED FLAT', 'BONKED BY A ROBOT CAT'] },
  // (the rake and the bear trap have their own hurt animation (hurtGags.ts), and their lines by the state of him)
  'm2:ct_rake': { hurt: ['RAKE! FACE!', 'THE OLD RAKE BIT! OW!', 'I STEPPED ON A RAKE! ME!', 'MY TEETH! WHERE ARE MY TEETH?'], death: ['RAKED IN THE FACE', 'KILLED BY A RAKE. A RAKE.'] },
  'm2:ct_rake_shitty': { hurt: ['RAKE TO THE FACE! SHIT IN THE PANTS! FULL SET!', 'FACE FULL OF RAKE! PANTS FULL OF SHIT!', 'A RAKE! THAT KNOCKED MORE SHIT OUT!'], death: ['RAKED. SHAT. DONE.', 'RAKED IN SHITTY PANTS'] },
  'm2:ct_rake_nude': { hurt: ['RAKE! THANK GOD IT WAS THE FACE!', 'NAKED ON A RAKE! COULD BE WORSE! BARELY!', 'IT CAME UP RIGHT PAST MY BALLS!'], death: ['NAKED. RAKED. DEAD.', 'RAKED IN THE BUFF'] },
  'm2:ct_beartrap': { hurt: ['BEAR TRAP! MY ANKLE!', 'IT BIT MY LEG!', 'WHO PUTS A BEAR TRAP IN A PARK?', 'OW OW OW OW OW!'], death: ['CAUGHT IN A BEAR TRAP', 'BEAR TRAPPED'] },
  'm2:ct_beartrap_shitty': { hurt: ['BEAR TRAP! I SHAT AGAIN!', 'MY LEG! MY PANTS! MY DAY!', 'IT SQUEEZED THE SHIT OUT OF ME!'], death: ['BEAR TRAPPED, SHITTY', 'TRAPPED IN SHITTY PANTS'] },
  'm2:ct_beartrap_nude': { hurt: ['BEAR TRAP! INCHES FROM MY NUTS!', 'IT GOT MY LEG! KEEP IT DOWN THERE!', 'NAKED IN A BEAR TRAP! HOP! HOP!'], death: ['NAKED IN A BEAR TRAP', 'BEAR TRAPPED, BARE ASS'] },
  'm2:ct_glove': { hurt: ['A CRATE PUNCHED ME!', 'A BOXING GLOVE! OUT OF A BOX!', 'SUCKER PUNCHED BY A CRATE!'], death: ['PUNCHED OUT BY A CRATE', 'KO BY GENERIC-CO'] },
  'm2:ct_safe': { hurt: ['A SAFE! ON ME!', 'THE SAFE! MY SPINE!', 'WHO HANGS A SAFE OVER A PATH?'], death: ['CRUSHED BY A SAFE', 'SAFE. NOT SAFE.'] },
  'm2:ct_piano': { hurt: ['A PIANO! THE WHOLE PIANO!', 'I HEARD EVERY KEY!', 'PIANO! ON MY HEAD!'], death: ['FLATTENED BY A PIANO', 'DIED IN C MINOR'] },
  'm2:ct_cannon': { hurt: ['CANNONBALL! IN THE GUT!', 'THEY SHOT A CANNON AT ME!', 'A CIRCUS CANNON! AT A GUEST!'], death: ['CANNONBALLED', 'SHOT BY A CIRCUS CANNON'] },
  'm2:ct_dynamite': { hurt: ['DYNAMITE! MY EYEBROWS!', 'I SAW THE FUSE! I SAW IT!', 'BLOWN UP! FOR REAL!'], death: ['BLOWN UP BY DYNAMITE', 'KA-BOOM'] },
  'm2:ct_hole': { hurt: ['I FELL IN A HOLE! A PORTABLE HOLE!', 'OUT OF A HOLE! ON MY HEAD!', 'WHERE DID THE FLOOR GO?'], death: ['FELL THROUGH A HOLE', 'HOLED'] },
  // (the canyon kills him: the long fall, the little puff of dust far below; the floor of holes past it: falling
  // through hole after hole, forever (deaths.ts). Their hurt lines never get said (it's a death every time).)
  'm2:ct_canyon': { hurt: ['THAT WAS A LONG WAY DOWN!'], death: ['FELL INTO THE CANYON', 'A LITTLE PUFF OF DUST', 'THE CANYON WON'] },
  'm2:ct_canyon_shitty': { hurt: ['THAT WAS A LONG WAY DOWN!'], death: ['A LITTLE PUFF OF BROWN', 'FELL FAR. SHAT FARTHER.'] },
  'm2:ct_canyon_nude': { hurt: ['THAT WAS A LONG WAY DOWN!'], death: ['A LITTLE NAKED PUFF', 'BARE ASS FIRST, ALL THE WAY'] },
  'm2:ct_blackhole': { hurt: ['WHERE DID THE FLOOR GO?'], death: ['STILL FALLING', 'A HOLE IN A HOLE IN A HOLE', 'FALLING. FOREVER.'] },
  'm2:ct_blackhole_shitty': { hurt: ['WHERE DID THE FLOOR GO?'], death: ['SHITTING THROUGH INFINITY', 'FALLING FOREVER, SHITTY'] },
  'm2:ct_blackhole_nude': { hurt: ['WHERE DID THE FLOOR GO?'], death: ['NAKED, FALLING, FOREVER', 'BARE ASS THROUGH ETERNITY'] },
  'm2:ct_punchy': { hurt: ['THE CAT GOT ME WITH THE MALLET!', 'MALLET! RIGHT IN THE HEAD!', 'PUNCHY PUNCHED ME!'], death: ['MALLETED BY PUNCHY', 'BONKED TO DEATH'] },
  'm2:ct_kicky': { hurt: ['THE MOUSE KICKED ME!', 'KICKED BY A MOUSE! A MOUSE!', 'RIGHT IN THE NUTS! THE MOUSE!'], death: ['KICKED TO DEATH BY A MOUSE', 'KICKED BY KICKY'] },
  'm2:ct_cleaver': { hurt: ['I CHARGED RIGHT INTO HIS CLEAVER!', 'HE WAS HOLDING A CLEAVER OUT!', 'CLEAVER! FRONT! STUPID!'], death: ['CHARGED INTO A CLEAVER', 'CLEAVED'] },
  'm2:ct_cleaver_shot': { hurt: ['HE THREW A CLEAVER!', "A MEAT CLEAVER! I'M THE MEAT!", 'IT STUCK IN ME!'], death: ['CHOPPED BY A MOUSE', 'CLEAVER TO THE HEAD'] },
  'm2:ct_boom_shot': { hurt: ['THE MOUSE THREW DYNAMITE!', 'BLOWN UP BY A MOUSE!', 'MY EARS! MY EVERYTHING!'], death: ['BLOWN UP BY A MOUSE', 'DYNAMITED'] },
  'm2:ct_host': { hurt: ['THE HOST HIT ME WITH HIS CANE!', 'SHOW BUSINESS! IN THE FACE!', 'A CANE! A FANCY CANE!'], death: ['CANED BY THE HOST', 'GOT THE HOOK'] },
  'm2:ct_stagehand': { hurt: ['A SANDBAG! TO THE FACE!', 'THE STAGEHAND SANDBAGGED ME!', 'A BAG OF SAND! WHY!'], death: ['SANDBAGGED', 'STRUCK BY A STAGEHAND'] },
};
/** Which of his deaths each one is (the engine's): the falling weights flatten him; the dynamite burns him black. */
export const DEATH_KIND: Record<string, 'flattened' | 'burnt'> = {
  'm2:ct_anvil': 'flattened', 'm2:ct_hammer': 'flattened', 'm2:ct_safe': 'flattened', 'm2:ct_piano': 'flattened',
  'm2:ct_dynamite': 'burnt', 'm2:ct_boom_shot': 'burnt',
};

// ---------------------------------------------------------------------------------------------------------------
// The announcer's kill callouts, by kind

export const KILL_CALLS: Record<string, Record<string, string[]>> = {
  'm2:ct_punchy': { charge: ['CAT-ASTROPHE!'], uppercut: ['NINE LIVES, ZERO LEFT!'], divekick: ['FLAT CAT!'] },
  'm2:ct_kicky': { charge: ['MOUSETRAPPED!'], uppercut: ['SQUEAK!'], divekick: ['SQUASHED MOUSE!'] },
  'm2:ct_kickyboom': { charge: ['FIZZLED!'], uppercut: ['BLASTOFF!'], divekick: ['DUD!'] },
  'm2:ct_host': { charge: ["SHOW'S OVER!"], uppercut: ['CURTAIN CALL!'], divekick: ['CANCELED!'] },
  'm2:ct_stagehand': { charge: ['STRUCK!'], uppercut: ['FLOWN OUT!'], divekick: ['TAPED DOWN!'] },
};
const pools = (b: ByPants) => allOf(b);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...[ARRIVE, REVISIT, ...Object.values(GAGS)].flatMap(allOf),
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flatMap(k => Object.values(k).flat()))],
  [CAST_VOICES.punchy]: pools(PUNCHY_BARK), [CAST_VOICES.punchyf]: pools(PUNCHY_BARK),
  [CAST_VOICES.kicky]: [KICKY_BARK, BOOM_BARK].flatMap(pools), [CAST_VOICES.kickyf]: [KICKY_BARK, BOOM_BARK].flatMap(pools),
  [CAST_VOICES.host]: [HOST_BARK, HOST_CUE].flatMap(pools), [CAST_VOICES.hostf]: [HOST_BARK, HOST_CUE].flatMap(pools),
  [CAST_VOICES.stagehand]: pools(STAGEHAND_BARK), [CAST_VOICES.stagehandf]: pools(STAGEHAND_BARK),
};
