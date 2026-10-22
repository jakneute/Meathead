// What's said in the enchanted glen, by voice (fantasy/voices.ts gathers it; tools/voices records it). In the user's
// voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine. Meathead's lines and everybody
// reacting to him in clean / shitty / naked pools. The cast are the park's cast members in costume (they break
// character to yell at him); Piper's on the PA (her lust is for being fought over: purring over the blood, coy about
// the prize); the rivals in the queue taunt him. Pure data.

import { allOf, PIPER_PA_VOICE, type ByPants, type HurtTable } from '../talk';

/** The glen's new voices (cast.json); the huntsmen use the square's cast voices (a man's, a woman's). */
export const GLEN_VOICES = {
  cupid: 'm2.fantasy.cupid', cupidf: 'm2.fantasy.cupidf',
  ginger: 'm2.fantasy.ginger', gingerf: 'm2.fantasy.gingerf',
  dwarf: 'm2.fantasy.dwarf', dwarff: 'm2.fantasy.dwarff',
  unicorn: 'm2.fantasy.unicorn', unicornf: 'm2.fantasy.unicornf',
  blake: 'm2.fantasy.suitor_blake', rafael: 'm2.fantasy.suitor_rafael', hank: 'm2.fantasy.suitor_hank',
} as const;
/** (the square's, for the huntsmen) */
const CAST_MAN = 'm2.fantasy.castman', CAST_WOMAN = 'm2.fantasy.castwoman';
export const HUNTSMAN_VOICES = { m: CAST_MAN, f: CAST_WOMAN };

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In off the fairy wheel. */
export const ARRIVE: ByPants = {
  clean: ['ONE TRIAL DOWN. PIPER, WARM IT UP.', 'A FOREST. GREAT PLACE TO GET A HANDJOB AND MURDERED.'],
  shitty: ['ONE DOWN. SHE BETTER BE INTO SHIT STUFF.', 'INTO THE WOODS WITH A LOAD IN MY SHORTS.'],
  nude: ['NAKED IN THE WOODS. THIS IS HOW BIGFOOT STARTED.', 'ONE TRIAL DOWN. STILL HARD.'],
};
/** Things he's got to say passing them (once each). */
export const GAGS: Record<'hollow' | 'bounce' | 'briars' | 'bridge' | 'cottage' | 'mine' | 'unicorn' | 'bones' | 'ride', ByPants> = {
  hollow: {
    clean: ['GIANT MUSHROOMS. SOMEBODY IN DESIGN WAS HIGH.', "MUSHROOMS THE SIZE OF A HONDA. I'M NOT EVEN HIGH."],
    shitty: ['GIANT MUSHROOMS. THEY GROW IN SHIT. THEY LOVE ME.', 'MUSHROOMS GROW IN SHIT. I COULD START A FARM.'],
    nude: ['GIANT MUSHROOMS. MINE IS SMALLER. FOR NOW.', 'BIG RED CAPS. I KNOW THE FEELING.'],
  },
  bounce: {
    clean: ['WHOA! BOUNCY!', 'THAT MUSHROOM HAS A TRAMPOLINE IN IT!'],
    shitty: ['BOUNCY! SOMETHING SHIFTED IN THERE!', 'BOUNCING IN SHIT PANTS. SPLASH ZONE.'],
    nude: ['I GOT HANG TIME ON MY BALLS.', 'WHOA! MY BALLS HIT MY CHIN!'],
  },
  briars: {
    clean: ['THORNS. ON THE GROUND. GREAT DESIGN.', "A THORN BUSH ON A KIDS' PATH. LAWSUIT PATCH."],
    shitty: ['THORNS AND SHIT PANTS. INFECTION CITY.', "THORNS IN A SHITTY ASS. THAT'S GANGRENE."],
    nude: ['THORNS. MY NUTSACK SAYS ABSOLUTELY NOT.', 'BRIARS. MY BARE ASS SAYS NO.'],
  },
  bridge: {
    clean: ['THE BRIDGE IS OUT. OF COURSE IT IS.', 'CLOSED FOR REFURBISHMENT. SINCE NINETY-SIX.'],
    shitty: ['BRIDGE OUT. MY BOWELS ARE ALSO OUT.', 'NO BRIDGE. GOTTA CLIMB WITH A CREAMY LOAD.'],
    nude: ['BRIDGE OUT. DICK OUT. MATCHING.', "NO BRIDGE. I'LL JUST SWING MY DICK ACROSS."],
  },
  cottage: {
    clean: ['A CANDY HOUSE. I COULD EAT THE GUTTERS.', "A WITCH EATS KIDS IN THERE. I'D EAT THE HOUSE."],
    shitty: ['A CHOCOLATE HOUSE. LOOKS LIKE MY PANTS.', 'CANDY HOUSE. IT ALL ENDS UP IN MY SHORTS.'],
    nude: ['A CANDY HOUSE. I COULD LICK IT NAKED.', "I'M PUTTING MY DICK IN THE FROSTING."],
  },
  mine: {
    clean: ['SEVEN DWARFS ON THE SIGN. I COUNT THREE.', 'A MINE. SEVEN SHORT GUYS AND ONE WOMAN. SURE.'],
    shitty: ['A MINE SHAFT. I ALREADY MINED MY PANTS.', 'DIGGING FOR GOLD. I STRUCK BROWN.'],
    nude: ['COLD MINE. MY BALLS CRAWLED INSIDE ME.', 'A DEEP DARK HOLE. PIPER, I SEE WHAT YOU DID.'],
  },
  unicorn: {
    clean: ["A UNICORN. THERE'S A SWEATY GUY IN THE ASS END.", "A UNICORN. IT'S A HORSE WITH A DILDO ON ITS HEAD."],
    shitty: ["UNICORNS ONLY LET VIRGINS NEAR. WE'RE GOOD.", 'RAINBOWS OUT ITS ASS. SHIT OUT MINE.'],
    nude: ['A UNICORN. ONE HORN. SO DO I.', "HE'S GOT A HORN ON HIS HEAD. MINE'S LOWER."],
  },
  bones: {
    clean: ['DRAGON BONES. FIBERGLASS. THE TAG IS STILL ON.', "A DRAGON'S LAIR. SMELLS LIKE BONDO."],
    shitty: ['SOMETHING DIED IN HERE. MAYBE ME.', 'THE DRAGON DIED SMELLING SOMETHING LIKE THIS.'],
    nude: ['DRAGON BONES. MY BONE IS ALSO OUT.', 'NAKED IN A DRAGON CAVE. SAINT GEORGE WORE PANTS.'],
  },
  ride: {
    clean: ['THE STAIRS ARE TAKING ME UP! OKAY!', 'MOVING STAIRS! AND A GUY SHOOTING! GREAT!'],
    shitty: ['GOING UP. MY LOAD IS GOING DOWN.', "GOING UP. THE SHIT'S GOING DOWN MY LEG."],
    nude: ['GOING UP! EVERYTHING DANGLES!', 'UP WE GO. BALLS IN THE BREEZE.'],
  },
};
/** His answer to the rivals in the queue. */
export const RETORT: ByPants = {
  clean: ["SAVE ME A SEAT. I'LL THROW YOU OUT OF IT.", 'SEE YOU ON THE RIDE, DICKHEADS. FROM ABOVE.'],
  shitty: ["I'LL SHIT IN YOUR CAR. TERRITORY.", "SMELL THAT? THAT'S YOUR FUNERAL."],
  nude: ['MY DICK HAS A BETTER SHOT THAN YOU.', "SHE'LL PICK THE GUY WHO'S ALREADY UNDRESSED. SCIENCE."],
};

// ---------------------------------------------------------------------------------------------------------------
// Piper on the PA (by the horn he's passing), and in the queue

export const PIPER_GLEN: Record<string, string[]> = {
  gate: ["ONE TRIAL DOWN, BOYS. I'M STILL TINGLING.", 'ALL THAT BLOOD ON MY WHEEL. DELICIOUS.'],
  cottage: ['I CAN HEAR YOU OUT THERE. HIT HARDER.', 'EVERY BROKEN BONE GETS ME WET, BOYS.'],
  meadow: ['MMM. KEEP FIGHTING. I LIKE THE GRUNTING.', "MORE BLOOD, BOYS. I'M NEARLY THERE."],
  lair: ['THE STRONG ONES GET TO MY RIDE. THE REST FEED THE CROWS.', 'ALMOST THERE. SPILL SOMETHING ON THE WAY.'],
  queue: ['TRIAL TWO, BOYS. TRUELLING TRAGONS. THREE CARS. ONE WINNER.', 'TRIAL TWO. RIDE IT. SHOVE EACH OTHER OFF IT.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The rivals in the queue (new beefy suitors: the rivals through the ride and the broomsticks)

export const RIVAL_SAY: Record<'blake' | 'rafael' | 'hank', ByPants> = {
  blake: {
    clean: ['YOU MADE IT PAST THE WHEEL? THE FAT KID?', "PIPER'S MINE, MEATSACK."],
    shitty: ['YOU SHIT YOURSELF ON THE WHEEL, BRO?', 'SHE WANTS A MAN. NOT A HUGGIES.'],
    nude: ['BRO. PANTS. PLEASE.', "PUT THAT AWAY. IT'S NOT A TRIAL SIZE. WAIT. IT IS."],
  },
  rafael: {
    clean: ["SHE WANTS ROYALTY. YOU'RE A SNACK BAR.", "MY DAD OWNS THREE CAR WASHES. YOU'RE DONE."],
    shitty: ['A PRINCE DOES NOT SMELL LIKE THAT.', "SHE'LL SMELL YOU COMING. FROM ORLANDO."],
    nude: ['NAKED? DESPERATE AND SMALL.', 'NICE PENIS. LOOKS LIKE A BABY CARROT.'],
  },
  hank: {
    clean: ["I'LL SHOVE YOU OFF THE TRACK MYSELF.", "I'LL SHOVE YOU OFF THAT TRACK AND PISS ON YOU."],
    shitty: ['STAY OUT OF MY CAR. YOU STINK.', 'SIT IN THE BACK, SHIT BOY. LIKE THE BUS.'],
    nude: ['NOT IN MY CAR WITH THAT OUT.', 'KEEP IT AWAY FROM THE LAP BAR.'],
  },
};
/** Shot at in the queue: it bounces off them. */
export const RIVAL_BOUNCE = ['HA! TICKLES!', "SAVE IT FOR THE RIDE, LOSER!"];

// ---------------------------------------------------------------------------------------------------------------
// The cast (barks: rare, short, broken character)

export const HUNTSMAN_BARK: ByPants = {
  clean: ['THE QUEEN WANTS YOUR HEART. IN A BOX.', "HOLD STILL. MY MANAGER'S WATCHING.", 'I HUNT FOR TIPS. NOBODY TIPS A HUNTSMAN.'],
  shitty: ['I TRACKED YOU THROUGH THREE LANDS BY SMELL.', 'SOMETHING DIED IN YOUR PANTS. I HUNT THAT.'],
  nude: ['NAKED GAME! OPEN SEASON!', 'I SEE A SMALL ANIMAL. AND THE REST OF YOU.'],
};
/** Cupid: Piper's hired help, in a diaper on a wire, and sour about it. */
export const CUPID_BARK: ByPants = {
  clean: ['PIPER PAYS ME IN EXPOSURE. HOLD STILL.', 'I WEAR A DIAPER FOR TWELVE BUCKS AN HOUR.', 'I GOT A YEAST INFECTION IN THIS DIAPER. HOLD STILL.'],
  shitty: ['I WEAR THE DIAPER. YOU NEED IT.', 'I SMELL YOU FROM THE WIRE! THE WIRE!'],
  nude: ["NAKED? THAT'S MY BIT!", "PUT IT AWAY. I'M AIMING FOR THE HEART."],
};
export const GINGER_BARK: ByPants = {
  clean: ['RUN, RUN, AS FAST AS YOU CAN!', "YOU CAN'T CATCH ME! I'LL CATCH YOU!", 'THIS SUIT IS A HUNDRED DEGREES!'],
  shitty: ['YOU SMELL WORSE THAN BURNT COOKIES!', "THE FOX WOULDN'T EAT YOU WITH A FORK!"],
  nude: ["NAKED? I'M THE GINGERBREAD MAN, NOT YOU!", 'MY GUMDROP BUTTONS ARE BIGGER THAN THAT!'],
};
export const DWARF_BARK: ByPants = {
  clean: ["HEIGH-HO! YOU'RE DEAD, BRO!", 'WE DIG, WE DIG, WE STAB, WE DRINK!', 'SEVEN ON THE POSTER. THREE ON THE BUDGET.'],
  shitty: ['HEIGH-HO! HE SMELLS! HEIGH-HO!', 'HE STRUCK A VEIN! A BROWN ONE!'],
  nude: ['HEIGH-HO! HE HAS NO CLOTHES!', "THAT'S A SMALLER PICKAXE THAN DOPEY'S!"],
};
export const UNICORN_BARK: ByPants = {
  clean: ['NEIGH. THAT IS IN MY CONTRACT.', 'MAGIC IS REAL! SO IS THIS HORN!', 'I DID TWO YEARS AT JUILLIARD.'],
  shitty: ['EVEN UNICORNS DO NOT SHIT LIKE THAT.', 'I SHIT RAINBOWS. YOU SHIT REGULAR.'],
  nude: ['I HAVE THE BIGGER HORN HERE.', 'YOU CALL THAT A HORN?'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here, and the death screens (28 characters at most)

export const HURT: HurtTable = {
  'm2:fa_huntsman': { hurt: ['CLUBBED WITH A CROSSBOW!', "THE HUNTSMAN'S GOT A HEFTY SWING!", 'STOCK TO THE FACE!'], death: ['CLUBBED BY A HUNTSMAN', 'BAGGED BY A HUNTSMAN'] },
  'm2:fa_huntsman_shot': { hurt: ['A CROSSBOW BOLT! IN ME!', 'BOLTED! RIGHT IN THE ASS!', "THAT'S NOT FOAM!"], death: ['SHOT BY A HUNTSMAN', 'BOLTED TO DEATH'] },
  'm2:fa_bolted': { hurt: ['I RAN INTO HIS CROSSBOW!', 'WHO CHARGES A CROSSBOW? ME! I DO!', 'BOLT IN THE SHOULDER! DUMB!'], death: ['CHARGED A LOADED CROSSBOW', 'RAN ONTO A BOLT'] },
  'm2:fa_cupid': { hurt: ['A DIAPER! IN MY FACE!', 'CUPID BODY-SLAMMED ME!', 'A GROWN MAN IN A DIAPER! ON MY FACE!'], death: ['SAT ON BY CUPID', 'KILLED BY A GROWN-UP CUPID'] },
  'm2:fa_cupid_shot': { hurt: ['ARROW! IN MY ASS!', "IT'S A HEART! IT STILL STABS!", "I'M IN LOVE WITH THE PAIN!"], death: ['SHOT BY CUPID', 'LOVE HURTS. ARROWS TOO.'] },
  'm2:fa_pricked': { hurt: ['I CHARGED A LOVE ARROW!', 'HEART ARROW! IN MY PEC!', 'RAN ONTO CUPID! DUMB!'], death: ['CHARGED A LOADED BOW', 'SKEWERED BY LOVE'] },
  'm2:fa_ginger': { hurt: ['THE GINGERBREAD MAN SAT ON ME!', 'CRUSHED BY A COOKIE!', 'HE SMELLS LIKE NUTMEG AND FEET!'], death: ['CRUSHED BY A COOKIE', 'FLATTENED BY GINGERBREAD'] },
  'm2:fa_dwarf': { hurt: ['PICKAXE! IN MY SHIN!', 'THE DWARF GOT ME!', 'HE PICKAXED ME IN THE CROTCH!'], death: ['PICKAXED BY A DWARF', 'MINED TO DEATH'] },
  'm2:fa_dwarf_shot': { hurt: ['A ROCK! TO THE HEAD!', 'HE THREW A GEM AT ME!', 'A ROCK! THE SHORT FUCK THREW A ROCK!'], death: ['STONED BY DWARFS', 'KILLED BY A FAKE GEM'] },
  'm2:fa_candle': { hurt: ['THE CANDLE! MY FEET!', 'HOT WAX! ON MY TOES!', 'I DIVE KICKED A FUCKING CANDLE!'], death: ['DIVE KICKED A CANDLE', 'BURNED ON A DWARF HAT'] },
  'm2:fa_unicorn': { hurt: ['RUN OVER BY A UNICORN!', 'THE UNICORN TRAMPLED ME!', 'THE ASS END KICKED ME!'], death: ['TRAMPLED BY A UNICORN', 'KILLED BY A MAGIC HORSE'] },
  'm2:fa_horn': { hurt: ['I CHARGED THE HORN!', 'UNICORN HORN! IN MY GUT!', 'HORN! RIGHT IN THE PECS!'], death: ['GORED BY A UNICORN', 'SKEWERED ON A UNICORN'] },
  'm2:fa_briars': { hurt: ['THORNS! IN MY ASS!', 'A THORN IN MY TAINT!', 'OW! OW! THORNS!'], death: ['DIED IN A BRIAR PATCH', 'THORNED TO DEATH'] },
  'm2:fa_cauldron': { hurt: ['A CAULDRON! TO THE FACE!', 'A POT! FULL OF WITCH PISS!', 'THE POT HIT ME!'], death: ['HIT BY A CAULDRON', 'DIED IN WITCH SOUP'] },
};

// ---------------------------------------------------------------------------------------------------------------
// The announcer's kill callouts, by kind

export const KILL_CALLS: Record<string, Record<string, string[]>> = {
  'm2:fa_huntsman': { charge: ['HUNTED!', 'OPEN SEASON!'], uppercut: ['TROPHY!'], divekick: ['BAGGED!'] },
  'm2:fa_cupid': { charge: ['HEARTBREAK!', 'LOVE STINKS!'], uppercut: ['WINGS CLIPPED!'], divekick: ['LOVE DOWN!'], swim: ['WASHED UP!'] },
  'm2:fa_ginger': { charge: ['CRUMBLED!', 'OH SNAP!'], uppercut: ['FRESH OUT THE OVEN!'], divekick: ['DUNKED!'] },
  'm2:fa_dwarf': { charge: ['HEIGH-NO!', 'SHAFTED!'], uppercut: ['OFF TO WORK!'], divekick: ['MINED OUT!'] },
  'm2:fa_unicorn': { charge: ['DEHORNED!', 'GLUE FACTORY!'], uppercut: ['OVER THE RAINBOW!'], divekick: ['NO MORE MAGIC!'] },
};

const pools = (b: ByPants) => allOf(b);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...[ARRIVE, RETORT, ...Object.values(GAGS)].flatMap(allOf), ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flatMap(k => Object.values(k).flat()))],
  [CAST_MAN]: pools(HUNTSMAN_BARK), [CAST_WOMAN]: pools(HUNTSMAN_BARK),
  [GLEN_VOICES.cupid]: pools(CUPID_BARK), [GLEN_VOICES.cupidf]: pools(CUPID_BARK),
  [GLEN_VOICES.ginger]: pools(GINGER_BARK), [GLEN_VOICES.gingerf]: pools(GINGER_BARK),
  [GLEN_VOICES.dwarf]: pools(DWARF_BARK), [GLEN_VOICES.dwarff]: pools(DWARF_BARK),
  [GLEN_VOICES.unicorn]: pools(UNICORN_BARK), [GLEN_VOICES.unicornf]: pools(UNICORN_BARK),
  [GLEN_VOICES.blake]: [...pools(RIVAL_SAY.blake), RIVAL_BOUNCE[0]],
  [GLEN_VOICES.rafael]: [...pools(RIVAL_SAY.rafael), ...RIVAL_BOUNCE],
  [GLEN_VOICES.hank]: [...pools(RIVAL_SAY.hank), RIVAL_BOUNCE[1]],
  [PIPER_PA_VOICE]: Object.values(PIPER_GLEN).flat(),
};
