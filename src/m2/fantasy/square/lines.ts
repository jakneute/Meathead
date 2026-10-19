// What's said in the town square (Hogsmeat Village, the storybook square, the Grand Staircase, the bandstand), by voice
// (fantasy/voices.ts gathers it; tools/voices records it). In the user's voice: blunt, short, vulgar, specific; talk
// less; fit the trigger. Picked with pickLine. Meathead's lines and everybody reacting to him in clean / shitty / naked
// pools. The cast are the park's cast members in costume: they break character to yell at him. Pure data.

import { allOf, PIPER_PA_VOICE, type ByPants, type HurtTable } from '../talk';
import { SUITORS } from '../suitors';

/** The cast's voices (cast.json): a man's and a woman's for each sort; the costumes' heads muffle the troll and the
 *  dragon. */
export const CAST_VOICES = {
  man: 'm2.fantasy.castman', woman: 'm2.fantasy.castwoman',
  clerk: 'm2.fantasy.clerk', clerkf: 'm2.fantasy.clerkf',
  bro: 'm2.fantasy.bro', brof: 'm2.fantasy.brof',
  troll: 'm2.fantasy.troll', trollf: 'm2.fantasy.trollf',
  dragon: 'm2.fantasy.dragon', dragonf: 'm2.fantasy.dragonf',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In off the walk-in, at the station. */
export const ARRIVE: ByPants = {
  clean: ['FAIRY LAND. SMELLS LIKE CHURROS AND CHILD SUPPORT.', 'WIZARDS. GREAT. NERDS WITH STICKS.'],
  shitty: ['FAIRY LAND. I BROUGHT MY OWN MAGIC. IN MY PANTS.', 'NOTHING SAYS ENCHANTED LIKE SHIT IN YOUR SHORTS.'],
  nude: ['NAKED IN FAIRY LAND. THE FAIRIES CAN DEAL.', 'FAIRY LAND. MY BALLS ARE FREEZING. IT SNOWS HERE?'],
};
/** Back on a later visit (the loudspeaker's said its piece). */
export const REVISIT: ByPants = {
  clean: ['HOGSMEAT AGAIN. STILL FOURTEEN BUCKS A BUTTER.', 'BACK IN NERD TOWN.'],
  shitty: ['BACK IN HOGSMEAT. SAME SHITTY PANTS.', 'NERD TOWN. NOW WITH MY SMELL.'],
  nude: ['BACK IN HOGSMEAT. STILL NO PANTS. STILL SNOWING.', 'NERD TOWN. FULL FRONTAL.'],
};
/** Things he's got to say passing them (once each). */
export const GAGS: Record<'wall' | 'butter' | 'stairs' | 'carousel' | 'gorge' | 'troll' | 'tower', ByPants> = {
  /** Charged into the PLATFORM 7 5/8 pillar. */
  wall: {
    clean: ["IT'S A WALL. IT'S JUST A WALL.", 'SEVEN AND FIVE EIGHTHS MY ASS.'],
    shitty: ["IT'S A WALL. NOW IT'S A SHITTY WALL.", 'MAGIC WALL MY ASS. MY ASS IS THE MAGIC HERE.'],
    nude: ["IT'S A WALL. I HIT IT WITH MY DICK OUT.", 'NAKED INTO A BRICK WALL. NEW PERSONAL WORST.'],
  },
  butter: {
    clean: ['FOURTEEN BUCKS FOR BUTTER IN A CUP?', 'BUTTER BREW. IT IS CREAM SODA AND LIES.'],
    shitty: ['FOURTEEN BUCKS. GOES RIGHT THROUGH YOU. I CAN TELL.', 'BUTTER BREW. THAT EXPLAINS MY PANTS.'],
    nude: ['FOURTEEN BUCKS AND NO POCKETS TO PAY WITH.', 'BUTTER BREW. I COULD BATHE IN IT. NO PANTS IN THE WAY.'],
  },
  stairs: {
    clean: ['THE STAIRS ARE MOVING. NOBODY ELSE IS FREAKING OUT?', "STAIRS THAT MOVE. THAT'S AN ESCALATOR ON DRUGS."],
    shitty: ['MOVING STAIRS. MOVING BOWELS. FITS.', 'THE STAIRS ARE SWINGING. SO IS MY LOAD.'],
    nude: ['MOVING STAIRS. MY JUNK IS SWINGING WITH THEM.', 'NAKED ON MAGIC STAIRS. WHAT A DAY.'],
  },
  carousel: {
    clean: ["A MERRY-GO-ROUND. I'M NOT MERRY.", 'PLASTIC PONIES. I WANT TO PUNCH ONE.'],
    shitty: ["DON'T SIT ON THE HORSES AFTER ME.", 'MERRY-GO-ROUND. SHITTY-GO-ROUND.'],
    nude: ['NO WAY IN HELL I RIDE A HORSE NAKED.', "A CAROUSEL. SADDLES ARE OFF THE TABLE TODAY."],
  },
  gorge: {
    clean: ['BOTTOMLESS? THEY PAINTED CLOUDS ON A HOLE.', 'WHO PUTS A CANYON IN A GIFT SHOP TOWN?'],
    shitty: ['BOTTOMLESS. LIKE THESE PANTS.', 'A BIG HOLE. I KNOW THE FEELING.'],
    nude: ['FALL IN NAKED AND THEY FIND ME IN THE SPRING.', 'BIG DROP. LITTLE DICK. COLD WIND.'],
  },
  troll: {
    clean: ['A TROLL. PROBABLY HAS A PODCAST.', "THAT'S A GUY IN A TROLL SUIT. HE'S SWEATING THROUGH IT."],
    shitty: ['A TROLL. HE SMELLS WORSE THAN ME. BARELY.', 'TROLL. BRIDGE. SHIT. MY KIND OF TOWN.'],
    nude: ["A TROLL. HE'S NOT LOOKING AT MY FACE.", 'TROLL. AT LEAST HE HAS A COSTUME ON.'],
  },
  tower: {
    clean: ['MORE STAIRS. WHO DESIGNED THIS, A SADIST?', 'A WHOLE TOWER OF STAIRS THAT HATE ME.'],
    shitty: ['CLIMBING WITH A FULL LOAD. GREAT.', 'STAIRS. UP. WITH SHIT. SWINGING.'],
    nude: ['STAIRS. EVERYBODY BELOW GETS A SHOW.', "CLIMBING NAKED. SORRY, PEOPLE UNDERNEATH."],
  },
};
/** The keg burst (him, near it). */
export const KEG_BURST: ByPants = {
  clean: ['FREE REFILLS, ASSHOLES!', 'BUTTER BATH!'],
  shitty: ['BUTTER BREW SHOWER! I NEEDED THAT!', 'HOSE ME DOWN! AGAIN!'],
  nude: ['WARM FOAM. ALL OVER. NO COMPLAINTS.', 'BUTTER BREW BATH! NAKED! FINALLY!'],
};

// ---------------------------------------------------------------------------------------------------------------
// The cast (barks: rare, short, broken character)

/** The wand clerk's spell, shouted as he casts (the tell). */
export const CLERK_CAST: ByPants = {
  clean: ['FLAMBOYANCIA!', 'ZAPPUS MAXIMUS!', 'NO REFUNDIUM!', 'INCINERATUS!', 'SPARKLUS!'],
  shitty: ['SMELLIUS BEGONEUS!', 'DIAPERUS CHANGIUS!', 'FECALIUS!'],
  nude: ['PANTSIUS APPEARIUS!', 'TINY WANDIUS!', 'COVERUS UPPUS!'],
};
export const CLERK_SEEN: ByPants = {
  clean: ['THE WAND CHOOSES THE WIZARD. IT CHOSE VIOLENCE.', 'NO WAND, NO SERVICE.'],
  shitty: ['SIR, YOU CANNOT SHIT IN WANDS AND SONS.', 'SOMETHING DIED IN YOUR ROBES.'],
  nude: ['SIR. YOUR WAND IS OUT.', 'NAKED MUGGLE IN THE STORE!'],
};
export const PRINCESS_BARK: ByPants = {
  clean: ["I'M ON BREAK IN TEN, ASSHOLE!", 'NO PHOTOS. ONLY PAIN.', 'SOMEDAY MY PRINCE WILL COME. YOU WILL GO.'],
  shitty: ['EW! YOU SMELL LIKE THE PETTING ZOO!', 'A PRINCESS DOES NOT SMELL THAT!'],
  nude: ['PUT IT AWAY! THERE ARE KIDS HERE!', "I'VE SEEN BIGGER ON THE CAROUSEL!"],
};
export const KNIGHT_BARK: ByPants = {
  clean: ['HAVE AT THEE! I GET TIME AND A HALF!', 'FOR THE KING! HE SIGNS MY CHECKS!'],
  shitty: ['FOUL KNAVE! LITERALLY FOUL!', 'THOU HAST SHAT! EN GARDE!'],
  nude: ['A NAKED KNAVE! AVERT THINE EYES!', 'SHEATHE THY SWORD! THE LITTLE ONE!'],
};
export const BRO_BARK: ByPants = {
  clean: ['BROOMBALL, BRO! WOOO!', 'YOU WANT SOME, BRO? YOU WANT SOME?', 'GO SPARROWS! GO DIE!'],
  shitty: ['BRO, DID YOU SHIT? BRO! BRO!', 'DUDE SHAT HIMSELF! BALL TO THE FACE!'],
  nude: ['BRO! YOUR BALLS ARE OUT, BRO!', 'NAKED GUY! GET HIM, BRO!'],
};
export const TROLL_BARK: ByPants = {
  clean: ['TROLL TOLL! PAY UP!', 'ME TROLL. ME UNION.', 'NO ONE PASSES. CONTRACTUALLY.'],
  shitty: ['TROLL SMELL SHIT. TROLL SMELL YOU.', 'EVEN TROLL HAS STANDARDS.'],
  nude: ['TROLL SEE TINY THING. TROLL LAUGH.', 'PUT ON PANTS. TROLL BEGS.'],
};
export const DRAGON_BARK: ByPants = {
  clean: ['RAWR. THAT IS IN MY CONTRACT.', 'I HAVE A THEATER DEGREE.', 'THIS FIRE IS REAL. MY PAY IS NOT.'],
  shitty: ['IT SMELLS IN HERE AND OUT THERE.', 'I CAN SMELL YOU THROUGH THE HEAD.'],
  nude: ['YOU ARE NAKED. I AM A DRAGON. WE ARE BOTH SAD.', 'I CAN SEE YOUR DICK THROUGH THE MOUTH HOLE.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The loudspeaker: PIPER THE PIXIE over the town's PA (sultry; her lust is for being fought over: coy about the
// prize, purring over the blood). Then the suitors round the bandstand, then him.

export const PIPER_HELLO = ['HELLO, BOYS. ALL THAT MUSCLE.', 'WELL, HELLO, BIG BOYS.'];
export const PIPER_NAME = ["I'M PIPER. PIPER THE PIXIE.", "IT'S PIPER, BOYS. PIPER THE PIXIE."];
export const PIPER_TRIALS = ['OVERCOME MY TRIALS. WIN AN AUDIENCE WITH ME.', 'OVERCOME MY TRIALS, AND WIN AN AUDIENCE WITH ME.'];
export const PIPER_BLOOD = ['ONLY ONE OF YOU GETS IN. FIGHT FOR ME. HARD.', 'I DO LOVE IT WHEN MEN BLEED OVER ME.', 'THE REST OF YOU? MAKE A MESS. FOR ME.'];
export const PIPER_WHEEL = ['FIRST TRIAL: THE FAIRY WHEEL. MAKE IT MESSY, BOYS.', 'THE FAIRY WHEEL. DON\'T KEEP ME WAITING.'];

/** The suitors, reacting: Braxton and Gunnar about her; Tremaine about Meathead. */
export const BRAXTON_SAY = ['AUDIENCE MEANS SEX, BRO. I ASKED.', 'SHE SAID HARD. I AM HARD.'];
export const GUNNAR_SAY = ["I'VE BEEN BULKING FOR THIS.", 'I SKIPPED LEG DAY FOR THIS. WORTH IT.'];
export const TREMAINE_SAY: ByPants = {
  clean: ['YOU? WITH THAT BODY? SHE WANTS A PRINCE.', 'GO HOME, MEATBALL.'],
  shitty: ['HE SHAT HIMSELF. SHE WANTS A PRINCE, NOT A PAMPER.', 'YOU SMELL LIKE A LOSER. A WET ONE.'],
  nude: ['HE CAME NAKED. DESPERATE MUCH?', "PUT THAT AWAY. IT'S EMBARRASSING. FOR ALL OF US."],
};
/** Him, aroused (the user's lines, verbatim). */
export const PIPE_HER = 'PIPER? I WILL PIPE HER. WITH MY DICK.';
export const WINNING = "I'M WINNING THESE TRIALS, LOSERS.";

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here, and the death screens (28 characters at most)

export const HURT: HurtTable = {
  'm2:fa_clerk': { hurt: ['HE POKED ME WITH A WAND!', 'MY EYE! THE WAND! MY EYE!', 'THAT WAND IS FORTY BUCKS!'], death: ['WANDED TO DEATH', 'POKED DEAD BY A NERD'] },
  'm2:fa_clerk_shot': { hurt: ['MAGIC! IT BURNS!', 'A SPARKLER! IN MY FACE!', 'THAT SPELL WAS REAL!'], death: ['KILLED BY A GIFT SHOP SPELL', 'SPARKLED TO DEATH'] },
  'm2:fa_princess': { hurt: ['THE PRINCESS SLAPPED ME!', 'OW! ROYAL BITCH SLAP!', 'SHE TWIRLED INTO MY FACE!'], death: ['SLAPPED DEAD BY ROYALTY', 'DIED IN A PRINCESS FIGHT'] },
  'm2:fa_princess_shot': { hurt: ['A GLASS SLIPPER! TO THE HEAD!', 'GLASS! IN MY SCALP!', 'IT FIT! MY SKULL!'], death: ['KILLED BY A GLASS SLIPPER', 'IF THE SHOE FITS: DEAD'] },
  'm2:fa_knight': { hurt: ['RUN DOWN BY A KNIGHT!', 'FOAM LANCE! STILL HURTS!', 'JOUSTED! ON FOOT!'], death: ['JOUSTED TO DEATH', 'SLAIN BY AN HOURLY KNIGHT'] },
  'm2:fa_lance': { hurt: ['I RAN INTO HIS LANCE!', 'LANCE! RIGHT IN THE GUT!', 'SHOULDER INTO A POINT. SMART.'], death: ['CHARGED INTO A LANCE', 'SKEWERED ON A FOAM LANCE'] },
  'm2:fa_bro': { hurt: ['CHEST BUMPED! BY A BRO!', 'BRO! MY RIBS, BRO!', 'HE BUMPED ME TO NARNIA!'], death: ['CHEST BUMPED TO DEATH', 'KILLED BY A BRO. BRO.'] },
  'm2:fa_bro_shot': { hurt: ['BROOMBALL TO THE FACE!', 'BALL! IN MY NUTS!', 'HE THROWS LIKE A DICK!'], death: ['BROOMBALLED TO DEATH', 'BALLED OUT'] },
  'm2:fa_troll': { hurt: ['CLUBBED BY A TROLL!', 'THE FOAM CLUB IS NOT FOAM!', 'TROLLED! HARD!'], death: ['CLUBBED BY A TROLL', 'PAID THE TROLL TOLL'] },
  'm2:fa_troll_shot': { hurt: ['THE GROUND HIT ME!', 'SHOCKWAVE! IN MY SHINS!', 'HE SLAMMED THE STREET!'], death: ['FLATTENED BY A TROLL SLAM', 'SHOOK APART BY A TROLL'] },
  'm2:fa_horns': { hurt: ['HORNS! IN MY ASS!', 'I KICKED HIS HORNS! DUMB!', 'MY FEET! HIS HELMET!'], death: ['IMPALED ON A TROLL HAT', 'DIVE KICKED INTO HORNS'] },
  'm2:fa_dragon': { hurt: ["I'M ON FIRE! REAL FIRE!", 'DRAGON BREATH! PROPANE!', 'THE MASCOT TORCHED ME!'], death: ['ROASTED BY A MASCOT', 'BURNED BY A THEATER MAJOR'] },
  'm2:fa_dragon_shot': { hurt: ['FIRE! FROM A PLUSH DRAGON!', 'MY EYEBROWS! GONE!', 'HE BREATHED ON ME!'], death: ['TOASTED BY A DRAGON SUIT', 'FLAMBEED BY A MASCOT'] },
  'm2:fa_owl': { hurt: ['THE OWL GOT MY FACE!', 'OWL! IN MY HAIR!', 'MAIL CALL! OW!'], death: ['KILLED BY A MAIL OWL', 'RETURN TO SENDER'] },
  'm2:fa_snow': { hurt: ['SNOW! OFF THE ROOF!', 'A SNOWBALL THE SIZE OF A CAR!', 'FAKE SNOW! REAL WEIGHT!'], death: ['BURIED UNDER ROOF SNOW', 'DIED UNDER A FAKE SNOWDRIFT'] },
  'm2:fa_keg': { hurt: ['HOT BUTTER BREW! MY FACE!', 'FOAM! SCALDING FOAM!', 'IT BURNS! AND IT TASTES OKAY!'], death: ['DROWNED IN BUTTER BREW', 'BOILED IN A $14 DRINK'] },
};

// ---------------------------------------------------------------------------------------------------------------
// The announcer's kill callouts, by kind (in place of the engine's where theirs would fit worse)

export const KILL_CALLS: Record<string, Record<string, string[]>> = {
  'm2:fa_clerk': { charge: ['EXPELLED!', 'NO REFUNDS!'], uppercut: ['LEVITATED!', 'UP UP AND AWAND!'], divekick: ['WAND SNAPPED!'] },
  'm2:fa_princess': { charge: ['HAPPILY NEVER AFTER!', 'MIDNIGHT!'], uppercut: ['ROYAL LAUNCH!'], divekick: ['DETHRONED!'] },
  'm2:fa_knight': { charge: ['UNHORSED!', 'KNIGHT KNIGHT!'], uppercut: ['SIR LOST-A-LOT!'], divekick: ['TIN CANNED!'] },
  'm2:fa_bro': { charge: ['BRO DOWN!', 'TACKLED, BRO!'], uppercut: ['BALL GAME!'], divekick: ['BENCHED!'] },
  'm2:fa_troll': { charge: ['TOLL PAID!', 'UNDER THE BRIDGE!'], uppercut: ['TROLLED!'], divekick: ['BRIDGE OUT!'] },
  'm2:fa_dragon': { charge: ['DRAGON SLAIN!', 'SNUFFED!'], uppercut: ['PUFF THE TRAGIC DRAGON!'], divekick: ['DE-HEADED!'] },
  'm2:fa_owl': { charge: ['RETURN TO SENDER!', 'HOOT NO MORE!'], uppercut: ['AIR MAIL!'], divekick: ['OWL BE DAMNED!'], swim: ['OWL BE DAMNED!'] },
};

const pools = (b: ByPants) => allOf(b);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...[ARRIVE, REVISIT, KEG_BURST, ...Object.values(GAGS)].flatMap(allOf), PIPE_HER, WINNING,
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flatMap(k => Object.values(k).flat()))],
  [CAST_VOICES.man]: [KNIGHT_BARK, PRINCESS_BARK].flatMap(pools),
  [CAST_VOICES.woman]: [KNIGHT_BARK, PRINCESS_BARK].flatMap(pools),
  [CAST_VOICES.clerk]: [CLERK_CAST, CLERK_SEEN].flatMap(pools),
  [CAST_VOICES.clerkf]: [CLERK_CAST, CLERK_SEEN].flatMap(pools),
  [CAST_VOICES.bro]: pools(BRO_BARK), [CAST_VOICES.brof]: pools(BRO_BARK),
  [CAST_VOICES.troll]: pools(TROLL_BARK), [CAST_VOICES.trollf]: pools(TROLL_BARK),
  [CAST_VOICES.dragon]: pools(DRAGON_BARK), [CAST_VOICES.dragonf]: pools(DRAGON_BARK),
  [PIPER_PA_VOICE]: [...PIPER_HELLO, ...PIPER_NAME, ...PIPER_TRIALS, ...PIPER_BLOOD, ...PIPER_WHEEL],
  [SUITORS.braxton.voice]: BRAXTON_SAY,
  [SUITORS.gunnar.voice]: GUNNAR_SAY,
  [SUITORS.tremaine.voice]: allOf(TREMAINE_SAY),
};
