// What's said in Sillyville Square (the kiddie rides), by voice (cartoon/voices.ts gathers it; tools/voices records it).
// In the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine. Meathead's
// lines and everybody reacting to him in clean / shitty / naked pools. He hates it here: "there's no good rides here"
// (the user's line, verbatim, in the carousel's pool). The cast are the park's costumed performers: the hat cat talks
// in rhyme (he's paid to), the Whatsits can't stop, the mascot's had the whole cotton candy cart. Pure data.

import { allOf, type ByPants, type HurtTable } from '../talk';

/** The cast's voices (cast.json): a man's and a woman's for each; the mascot's costume head muffles his. */
export const CAST_VOICES = {
  cat: 'm2.cartoon.cat', catf: 'm2.cartoon.catf',
  whatsit: 'm2.cartoon.whatsit', whatsitf: 'm2.cartoon.whatsitf',
  vendor: 'm2.cartoon.vendor', vendorf: 'm2.cartoon.vendorf',
  painter: 'm2.cartoon.painter', painterf: 'm2.cartoon.painterf',
  mascot: 'm2.cartoon.mascot', mascotf: 'm2.cartoon.mascotf',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In off the walk-in, at the gate. */
export const ARRIVE: ByPants = {
  clean: ['KIDDIE RIDES. I CAME ALL THIS WAY FOR KIDDIE RIDES.', 'CARTOON LAND. EVERYTHING HERE LOOKS LIKE IT MELTED.'],
  shitty: ['KIDDIE LAND. NOBODY WILL NOTICE ONE MORE LOADED DIAPER.', 'CARTOON LAND. I FIT RIGHT IN WITH THE TODDLERS.'],
  nude: ['NAKED IN THE KIDDIE AREA. THIS IS HOW YOU GET ON A LIST.', "CARTOON LAND. CARTOONS DON'T WEAR PANTS EITHER."],
};
/** Back on a later visit. */
export const REVISIT: ByPants = {
  clean: ['SILLYVILLE AGAIN. STILL NO GOOD RIDES.', 'BABYTOWN. AGAIN. GREAT.'],
  shitty: ['BACK IN BABYTOWN. THE PANTS FIT THE PLACE.', 'SILLYVILLE. SMELLS LIKE ME NOW.'],
  nude: ['BACK IN THE KIDDIE AREA. STILL NAKED. COPS ARE COMING.', 'SILLYVILLE. FULL MONTY. AGAIN.'],
};
/** Things he's got to say passing them (once each a visit). */
export const GAGS: Record<'height' | 'tower' | 'pit' | 'carousel' | 'fish' | 'train' | 'trolley' | 'mascot' | 'door', ByPants> = {
  /** The YOU MUST BE THIS SHORT TO RIDE sign. */
  height: {
    clean: ["MAXIMUM HEIGHT? I'M TOO TALL FOR THE BABY RIDES. GOOD.", 'YOU MUST BE THIS SHORT. FINALLY A LINE I CAN SKIP.'],
    shitty: ['TOO TALL FOR THE RIDES. NOT TOO OLD FOR THE DIAPER.', 'THIS SHORT TO RIDE. THIS SHITTY TO STAY.'],
    nude: ["TOO TALL TO RIDE. EVERY PART OF ME. EXCEPT ONE.", "THE HEIGHT STICK. DON'T MEASURE ANYTHING ELSE."],
  },
  /** On a tower as it first leans. */
  tower: {
    clean: ['IT LEANS! THE WHOLE STACK LEANS!', 'WHO STACKED THIS? A FOUR YEAR OLD?'],
    shitty: ["IT'S TIPPING! DON'T SQUEEZE, DON'T SQUEEZE!", 'LEANING TOWER OF POOPSA.'],
    nude: ['IT LEANS WHERE I LEAN. LIKE MY DICK IN THE WIND.', 'TIPPING OVER NAKED. GREAT VIEW FOR THE KIDS.'],
  },
  /** The bottomless ball pit's sign. */
  pit: {
    clean: ["BOTTOMLESS BALL PIT. THAT'S WHERE THE MILK CARTON KIDS WENT.", 'LAST KID FOUND 1997. COOL. COOL COOL COOL.'],
    shitty: ['A BALL PIT. I KNOW WHAT KIDS DO IN THOSE. I DID IT TOO.', 'BALL PIT. THE BROWN ONES AREN\'T BALLS.'],
    nude: ['NAKED IN A BALL PIT. THAT IS A CRIME IN FOUR STATES.', "I'M NOT GOING IN THERE NAKED. THEY'D NEVER FIND ME."],
  },
  /** The Wumple-Go-Round (the user's line, verbatim, among them). */
  carousel: {
    clean: ["THERE'S NO GOOD RIDES HERE.", 'A MERRY-GO-ROUND WITH NO HORSES. JUST WHATEVER THE HELL THOSE ARE.'],
    shitty: ["THERE'S NO GOOD RIDES HERE. AND I'M NOT SITTING ON ANYTHING.", "WHY DID I COME HERE? THERE'S NO GOOD RIDES HERE."],
    nude: ["THERE'S NO GOOD RIDES HERE. NOT NAKED. NOT EVER.", "NO SADDLES. NOT ON THAT THING. NOT TODAY."],
  },
  fish: {
    clean: ['FISH THAT GO UP AND DOWN. HOLD ME BACK.', "WHY DID I COME HERE? IT'S A BABY'S SPIN CYCLE."],
    shitty: ['A SPINNING FISH. I WOULD BLOW CHUNKS AND MORE.', 'SPIN ME ONCE AND THE PANTS GO OFF LIKE A SPRINKLER.'],
    nude: ['FISH RIDE. NAKED. MY BALLS WOULD SLAP THE SIDES.', 'NO. NOT NAKED IN A FIBERGLASS FISH. NO.'],
  },
  train: {
    clean: ['A TRAIN THAT GOES FOUR MILES AN HOUR. I CAN WALK FASTER.', 'KIDDIE TRAIN. THE CONDUCTOR IS SIX.'],
    shitty: ['THE CHOO CHOO. I WOULD STINK UP ALL FOUR CARS.', 'A TRAIN FOR TODDLERS. MY PANTS ARE ALREADY ON IT.'],
    nude: ['NAKED ON A KIDDIE TRAIN IS A FELONY. I CHECKED.', 'TODDLER TRAIN. NOT LIKE THIS.'],
  },
  trolley: {
    clean: ['A TROLLEY. THE BEST RIDE HERE IS A FUCKING TROLLEY.', 'A TROLLEY. GRANDPA WOULD LOVE THIS. GRANDPA IS DEAD.'],
    shitty: ['A TROLLEY. SLOW ENOUGH TO SMELL ME COMING.', 'THE BEST RIDE HERE IS A TROLLEY. I SHAT MYSELF. FROM BOREDOM.'],
    nude: ['NOBODY RIDES A TROLLEY NAKED. EXCEPT THAT ONE GUY.', 'SKY TROLLEY. MY JUNK HAS A NICE VIEW.'],
  },
  /** The sugar-crazed mascot, first seen. */
  mascot: {
    clean: ["THAT CUPCAKE IS ON SOMETHING.", 'THE MASCOT ATE THE WHOLE CANDY CART. LOOK AT HIS EYES.'],
    shitty: ['SUGAR GOES THROUGH YOU, BUDDY. TRUST ME.', 'HE ATE ALL THE SUGAR. HE WILL SHIT LIKE ME SOON.'],
    nude: ["THE CUPCAKE'S STARING AT MY CUPCAKE.", 'SUGAR HIGH CUPCAKE. NAKED ME. BAD COMBO.'],
  },
  /** The studio's front door. */
  door: {
    clean: ["A WALK-THROUGH. THAT'S NOT A RIDE. THAT'S A HALLWAY WITH A NARRATOR.", 'HOW CARTOONS ARE MADE. BY GUYS IN A ROOM. DONE.'],
    shitty: ['INDOORS. AIR CONDITIONING. MY ASS NEEDS THAT.', 'A HALLWAY WITH A NARRATOR. AT LEAST IT HAS A BATHROOM.'],
    nude: ['INDOORS. FINALLY. THE AC WILL BE A PROBLEM.', "HOW CARTOONS ARE MADE. NAKED. THEY'LL LEARN SOMETHING TOO."],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The cast (barks: rare, short)

/** The hat cat: rhymes, always (it's in his contract). */
export const CAT_BARK: ByPants = {
  clean: ['YOU CANNOT PASS. YOU CANNOT STAY. I BEAT YOUR ASS THE SILLY WAY.', "I'M NOT A CAT. I'M A GUY NAMED PAT.", 'ONE HIT, TWO HIT, RED HIT, YOU HIT.'],
  shitty: ['YOU STINK, YOU STINK, YOU STINK A LOT. WHAT IS THAT SMELL? OH GOD. IT\'S HOT.', "SOMETHING BROWN IN SILLY TOWN. AND IT'S YOU."],
  nude: ['NO PANTS, NO SHAME, NO CLUE AT ALL. I SEE YOUR THING. IT IS SO SMALL.', 'PUT IT AWAY, OH PUT IT AWAY. THERE ARE CHILDREN HERE TODAY.'],
};
/** ...as the hat goes. */
export const CAT_HAT: ByPants = {
  clean: ['A HAT! A HAT! TAKE THAT, TAKE THAT!', 'HERE IT COMES, YOU BUM!'],
  shitty: ['A HAT IN THE FACE FOR THE SMELLY DISGRACE!', 'HAT FOR THE BRAT WHO SHAT!'],
  nude: ['A HAT FOR YOUR HEAD! NOT THAT ONE, I SAID!', 'HAT! COVER THAT!'],
};
/** The Whatsits (two of them, always, one and two: they never stop). */
export const WHATSIT_BARK: ByPants = {
  clean: ["WE'RE NOT ALLOWED TO TALK! WE'RE TALKING!", 'KITE FIGHT! KITE FIGHT!', 'TAG! YOU ARE DEAD!'],
  shitty: ['HE POOPED! HE POOPED! HE POOPED!', 'SMELL HIM! NO! DON\'T!'],
  nude: ['NAKED MAN! NAKED MAN!', "I SAW IT! I CAN'T UNSEE IT!"],
};
export const VENDOR_BARK: ByPants = {
  clean: ['BALLOONS! FIVE BUCKS! OR FREE, IN YOUR FACE!', "THIS ONE'S A DOG. THIS ONE'S A DOG. THEY'RE ALL DOGS."],
  shitty: ['BALLOONS ARE FOR KIDS, SIR. SO ARE DIAPERS.', 'I GOT A BALLOON THAT SMELLS BETTER THAN YOU. ALL OF THEM.'],
  nude: ["I CAN'T TWIST YOU PANTS. I TRIED. NOBODY CAN.", "THAT'S THE SADDEST BALLOON ANIMAL I EVER SAW."],
};
export const PAINTER_BARK: ByPants = {
  clean: ["SIT STILL! YOU'RE GETTING A BUTTERFLY!", 'FACE PAINTING! YOURS NEEDS IT!'],
  shitty: ["YOU WANT A TIGER? YOU SMELL LIKE A TIGER'S ASS.", "I'M PAINTING YOU BROWN. SAVE ME THE PAINT."],
  nude: ["I'M NOT PAINTING THAT. I DON'T CARE WHAT YOU PAY.", "HOLD STILL. I'LL PAINT YOU SOME UNDERWEAR."],
};
export const MASCOT_BARK: ByPants = {
  clean: ['SPRINKLES! I ATE THE WHOLE CART! THE WHOLE CART!', "I HAVEN'T BLINKED SINCE TUESDAY!", 'MY HEART IS GOING SO FAST! FIGHT ME!'],
  shitty: ['YOU POOPED? I POOPED! IN HERE! IT\'S SO HOT IN HERE!', 'SUGAR MAKES ME POOP TOO, BUDDY!'],
  nude: ["NAKED GUY! I'M SO HAPPY! WHY AM I SO HAPPY!", "I'M NAKED UNDER HERE TOO! IT'S A HUNDRED DEGREES!"],
};
/** The mascot's sugar crash (slumped, done). */
export const MASCOT_CRASH = ['SO... TIRED...', 'I CAN HEAR... COLORS...', 'NEED... MORE... SPRINKLES...'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here, and the death screens (28 characters at most)

export const HURT: HurtTable = {
  'm2:ct_hatcat': { hurt: ['THE CAT HIT ME WITH AN UMBRELLA!', "OW! HE'S RHYMING AND HITTING!", 'BEAT UP BY A HAT!'], death: ['BEATEN BY A RHYMING CAT', 'KILLED BY A GUY NAMED PAT'] },
  'm2:ct_umbrella': { hurt: ['I RAN RIGHT INTO HIS UMBRELLA!', 'UMBRELLA! IN THE GUT!', 'POINTY END! WHY IS THERE A POINTY END!'], death: ['CHARGED INTO AN UMBRELLA', 'SKEWERED BY A CAT'] },
  'm2:ct_hat_shot': { hurt: ['HIS HAT CAME BACK!', 'A HAT! TO THE FACE!', 'BOOMERANG HAT! WHO DOES THAT!'], death: ['KILLED BY A FLYING HAT', 'HAT TRICKED TO DEATH'] },
  'm2:ct_whatsit': { hurt: ['THE BLUE HAIR THING HIT ME!', 'OW! WHAT IS IT!', 'TACKLED BY A JUMPSUIT!'], death: ['KILLED BY A WHATSIT', 'TRAMPLED BY NUMBER TWO'] },
  'm2:ct_kite_shot': { hurt: ['A KITE! IN MY EYE!', 'KITE STRING! MY NECK!', 'DIVE BOMBED BY A KITE!'], death: ['KILLED BY A KITE', 'STRUNG UP BY A KITE'] },
  'm2:ct_vendor': { hurt: ['THE BALLOON GUY KICKED ME!', 'OW! RIGHT IN THE SHIN!', 'KICKED BY A CARNY!'], death: ['KICKED DEAD BY A CARNY', 'DONE IN BY A BALLOON GUY'] },
  'm2:ct_balloondog': { hurt: ['THE BALLOON DOG POPPED ON ME!', 'POP! MY EARS!', 'EXPLODING BALLOON ANIMAL!'], death: ['POPPED BY A BALLOON DOG', 'KILLED BY HOT AIR'] },
  'm2:ct_painter': { hurt: ['PAINT! IN MY EYES!', 'SHE PAINTED MY FACE! WITH A FIST!', 'NOT A BUTTERFLY! NOT A BUTTERFLY!'], death: ['PAINTED TO DEATH', 'KILLED FOR A BUTTERFLY'] },
  'm2:ct_paint_shot': { hurt: ['PAINT BLOB! IN MY MOUTH!', 'IT TASTES LIKE CRAYONS!', 'SPLATTERED!'], death: ['DROWNED IN FACE PAINT', 'SPLATTERED BY A PAINTER'] },
  'm2:ct_mascot': { hurt: ['THE CUPCAKE SQUASHED ME!', 'SUGAR RUSH! FACE FIRST!', 'BODY SLAMMED BY A CUPCAKE!'], death: ['SQUASHED BY A CUPCAKE', 'DIED OF A SUGAR RUSH'] },
  'm2:ct_candle': { hurt: ['THE CANDLE! MY ASS IS ON FIRE!', 'I KICKED A CANDLE! IT WAS LIT!', 'BIRTHDAY CANDLE! UP MY ASS!'], death: ['BLOWN OUT ON A CANDLE', 'HAPPY BIRTHDAY, DUMBASS'] },
  'm2:ct_carousel': { hurt: ['THE MERRY-GO-ROUND HIT ME!', 'TRAMPLED BY A FIBERGLASS WHATEVER!', 'IT GOES ROUND AND IT HITS!'], death: ['RUN DOWN BY A CAROUSEL', 'TRAMPLED AT 3 MPH'] },
  'm2:ct_fish': { hurt: ['A FISH! A FLYING FISH!', 'HIT BY A FIBERGLASS FISH!', 'ONE FISH! IN MY FACE!'], death: ['KILLED BY A KIDDIE FISH', 'SLAPPED DEAD BY A FISH'] },
  'm2:ct_train': { hurt: ['THE BABY TRAIN HIT ME!', 'CHOO CHOO MY ASS!', 'RUN OVER BY TODDLERS!'], death: ['RUN OVER BY A KIDDIE TRAIN', 'DIED UNDER A CHOO CHOO'] },
  'm2:ct_trolley': { hurt: ['THE TROLLEY! FUCKING TROLLEY!', 'HIT BY PUBLIC TRANSIT!', 'DING DING! OW! OW!'], death: ['RUN OVER BY A TROLLEY', 'HIT BY THE SKY TROLLEY'] },
};

// ---------------------------------------------------------------------------------------------------------------
// The announcer's kill callouts, by kind (in place of the engine's where theirs would fit worse)

export const KILL_CALLS: Record<string, Record<string, string[]>> = {
  'm2:ct_hatcat': { charge: ['CAT IN THE SPLAT!', 'HAT GONE!'], uppercut: ['HAT TRICK!'], divekick: ['STOVEPIPED!'] },
  'm2:ct_whatsit': { charge: ['WHAT WAS IT?', 'NUMBER DOWN!'], uppercut: ['GO FLY A KITE!'], divekick: ['WIG SPLIT!'] },
  'm2:ct_vendor': { charge: ['POPPED!', 'DEFLATED!'], uppercut: ['UP UP AND AWAY!'], divekick: ['NO REFUNDS!'] },
  'm2:ct_balloondog': { charge: ['POP!'], uppercut: ['POP!'], divekick: ['POP!'], swim: ['POP!'] },
  'm2:ct_painter': { charge: ['PAINTED INTO A CORNER!'], uppercut: ['MASTERPIECE!'], divekick: ['BRUSHED OFF!'] },
  'm2:ct_mascot': { charge: ['SUGAR CRASH!', 'FROSTED!'], uppercut: ['SPRINKLED!'], divekick: ['BLOWN OUT!'] },
};

const pools = (b: ByPants) => allOf(b);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...[ARRIVE, REVISIT, ...Object.values(GAGS)].flatMap(allOf),
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flatMap(k => Object.values(k).flat()))],
  [CAST_VOICES.cat]: [CAT_BARK, CAT_HAT].flatMap(pools), [CAST_VOICES.catf]: [CAT_BARK, CAT_HAT].flatMap(pools),
  [CAST_VOICES.whatsit]: pools(WHATSIT_BARK), [CAST_VOICES.whatsitf]: pools(WHATSIT_BARK),
  [CAST_VOICES.vendor]: pools(VENDOR_BARK), [CAST_VOICES.vendorf]: pools(VENDOR_BARK),
  [CAST_VOICES.painter]: pools(PAINTER_BARK), [CAST_VOICES.painterf]: pools(PAINTER_BARK),
  [CAST_VOICES.mascot]: [...pools(MASCOT_BARK), ...MASCOT_CRASH], [CAST_VOICES.mascotf]: [...pools(MASCOT_BARK), ...MASCOT_CRASH],
};
