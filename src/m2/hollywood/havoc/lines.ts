// What's said in the havoc (every disaster at once, the flood climb, the tornado, the fling), by voice (recorded with
// the rest: hollywood/voices.ts gathers these; tools/voices). In the user's voice (hollywood-spec.md): blunt, short;
// pick lines with pickLine; clean / shitty / naked pools where people react to him. Every new way to hurt him here
// (lava, the wind's junk, what falls, the facades, the flood, the wrecking ball, the avalanche, the tornado and what it
// throws, the hail, the new kinds) gets hurt lines and death lines (registered in kinds.ts).

import type { ByPants } from '../blvd/lines';
import { PA_VOICE } from '../blvd/lines';
import { NARR } from '../disaster/lines';

export { PA_VOICE, NARR };

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Out the hole into it (once). */
export const ARRIVE = ['LAVA, SNOW AND FIRE. CALIFORNIA\'S FINALLY HONEST.', "THE SKY'S ON FIRE AND IT'S SNOWING. SOUNDS LIKE MY WEDDING."];
export const GAG: Record<'lava' | 'facade' | 'bridge' | 'wind' | 'quake' | 'billboard' | 'flood' | 'ball' | 'top' | 'tornado' | 'coverSign' | 'inCover' | 'rip' | 'everything' | 'refill' | 'surge', string[]> = {
  lava: ['LAVA. IN THE STREET. DON\'T STEP IN THE LAVA, DUMBASS.', "A LAVA RIVER ON A BACKLOT. SOMEBODY'S GETTING SUED. NOT ME."],
  facade: ['THE WHOLE STREET\'S FAKE. AND IT\'S FALLING ON ME.', "NOTHING BEHIND IT. LIKE MY COUSIN'S HEAD."],
  bridge: ['THE LIGHT TOWER FELL OVER. NOW IT\'S A BRIDGE.', 'A TWO-BY-FOUR BRIDGE. UNION SCALE.'],
  wind: ['THE WIND\'S THROWING TRASH CANS. JUMP, IDIOT.', 'WINDY. MY NIPPLES COULD CUT GLASS.'],
  quake: ['EARTHQUAKE. WATCH THE SHADOWS. SHIT FALLS. LIKE MY CAREER.', 'THE GROUND\'S SHAKING. SO ARE MY BALLS.'],
  billboard: ['REVENGERS: RESEMBLE. RESEMBLE A PILE OF SHIT.', 'THE REVENGERS BILLBOARD. FINALLY, A GOOD REVIEW.'],
  flood: ['FLOOD! UP! FAT GUYS FLOAT BUT NOT THAT WELL!', 'THE WATER\'S COMING. CLIMB, FAT ASS!'],
  ball: ['A WRECKING BALL. THEY\'RE DEMOLISHING IT. WITH ME ON IT.', 'WHO RUNS A WRECKING BALL IN A FLOOD? A UNION GUY ON OVERTIME.'],
  top: ['THE HAPPYWOOD SIGN. UP CLOSE IT\'S PLYWOOD TOO.', "TOP OF THE WORLD. I'D WHIP IT OUT BUT IT'S COLD."],
  tornado: ['AND NOW A TORNADO. RUN!', 'TORNADO! RUN, YOU FAT FUCK!'],
  coverSign: ['AVALANCHE ZONE. IN HOLLYWOOD. NEXT TO A PALM TREE.', 'A BUNKER. GET IN THE BUNKER, DUMBASS.'],
  inCover: ['IN HERE. COME ON, SNOW.', "SMELLS LIKE A PORTA-POTTY IN HERE. WAIT. THAT'S ME."],
  rip: ['IT\'S EATING THE WHOLE STREET!', 'IT ATE A WHOLE BUILDING. WITH A SUBWAY IN IT.'],
  everything: ['ALL OF IT AT ONCE. LIKE A BUFFET OF DEATH.', 'LAVA, HAIL, WIND AND A TORNADO. PICK A DEATH.'],
  refill: ['FIRST AID. NOBODY\'S MANNING IT. MINE.', 'FREE BANDAIDS. THE APOCALYPSE HAS BETTER BENEFITS THAN MY JOB.'],
  surge: ['IT\'S FASTER! IT\'S WAY FASTER!', 'FUCK THIS. FUCK THIS. FUCK THIS.'],
};

/** The fling. Caught; spun round in it (the SAFE TORNADO LAUNCHING ZONE: how is a tornado launcher SAFE); flung. */
export const CAUGHT = ['OH SHIIIIT!', 'NOT THE ASSHOLE! NOT THE ASSHOLE!'];
export const SPIN = [
  'A SAFE TORNADO LAUNCHING ZONE! THEY PAINTED A BOX ON THE STREET AND CALLED IT SAFE!',
  "SAFE?! IT SAID SAFE! IN BIG LETTERS! THERE'S A COW IN HERE!",
  'SAFE TORNADO LAUNCHING ZONE?! WHO SIGNED OFF ON THIS?! I WANT HIS NAME!',
  "THIS IS THE SAFE ONE?! I'D HATE TO SEE THE OTHER ZONE!",
];
export const FLUNG = ['WHERE AM I GOIIIING?!', 'LAND ME ON SOMETHING SOFT! LIKE A FAT GUY!'];

// ---------------------------------------------------------------------------------------------------------------
// The narrator (Disaster: The Ride's, on the park's horns now: the same deadpan over the real thing). His recorded
// loop lines (disaster/lines.ts LOOP, REAL) are used as they are; these are his new ones.

export const NARR_HAVOC = {
  wind: 'HERE\'S SOME WIND.',
  lava: 'HERE\'S A LAVA RIVER. DON\'T TOUCH IT.',
  tornado: 'HERE\'S A TORNADO. IT\'S BEHIND YOU.',
  avalanche: 'HERE\'S AN AVALANCHE. GET IN THE BUNKER.',
  hail: 'HERE\'S SOME HAIL.',
  surge: 'HERE\'S THE TORNADO AGAIN. IT GOT YOU.',
};

// ---------------------------------------------------------------------------------------------------------------
// The park's PA (the trailer voice)

export const PA_HAVOC: ByPants = {
  clean: ["ATTENTION. EVERY DISASTER IS HAPPENING AT ONCE. STUNTMAN STEVE'S SHOW IS STILL ON. NO REFUNDS."],
  shitty: ["ATTENTION. THERE ARE NOW SEVEN DISASTERS IN THE PARK. THE WORST ONE IS IN A MAN'S PANTS."],
  nude: ['ATTENTION. EVERY DISASTER IS NOW HAPPENING. ALSO A NAKED MAN. INSURANCE DOES NOT COVER HIM.'],
};
/** Once, early: every disaster at once, and still not the worst thing that happened today. */
export const PA_LEAK_HAVOC = [
  'ATTENTION. THE PARK IS ON FIRE, UNDERWATER AND IN A TORNADO. IT IS STILL NOT AS BAD AS THE SCRIPT LEAK.',
  'IN A WORLD... WHERE THE REVENGERS SCRIPT GOT OUT... NOTHING ELSE MATTERS. NOT EVEN THE LAVA.',
];
export const PA_STEVE_HAVOC = [
  'STUNTMAN STEVE SURVIVED A TORNADO! IN A MOVIE! FOR TWO SECONDS!',
  'REMINDER: STUNTMAN STEVE\'S STUPENDOUS STUNTERY IS INDOORS. MOSTLY.',
];

// ---------------------------------------------------------------------------------------------------------------
// The havoc's people (new kinds: kinds.ts), men's and women's voices by seed

export const HAVOC_VOICES = {
  looter: 'm2.hollywood.looter', looterf: 'm2.hollywood.looterf',
  crew: 'm2.hollywood.crew', crewf: 'm2.hollywood.crewf',
  poppy: 'm2.hollywood.poppy', poppyf: 'm2.hollywood.poppyf',
} as const;
/** A guest turned looter, arms full of the gift shop. */
export const LOOTER_BARK: ByPants = {
  clean: ['IT\'S THE APOCALYPSE! THE PLUSHIES ARE FREE!', 'BACK OFF! THIS SNOW GLOBE IS MINE!', "END OF THE WORLD! I'M TAKING ALL THE FUDGE!"],
  shitty: ['TAKE SOME PANTS! THE GIFT SHOP\'S OPEN!', "THE WORLD'S ENDING AND YOU STILL SHIT YOURSELF FIRST!"],
  nude: ['THE GIFT SHOP HAS SHIRTS! TAKE A SHIRT!', "HE'S NAKED! WHERE'S HE GONNA PUT THE LOOT?!"],
};
/** The park's storm crew in their slickers, leaf blowers against the end of the world. */
export const CREW_BARK: ByPants = {
  clean: ["STORM CREW! WE'RE HANDLING IT! WE ARE NOT HANDLING IT!", 'STAND BACK! I\'M BLOWING THE TORNADO AWAY!', 'I MAKE NINE AN HOUR!'],
  shitty: ['I\'LL BLOW THAT SMELL INTO THE NEXT COUNTY!', "THIS BLOWER'S NOT RATED FOR ASS!"],
  nude: ['BLOW IT BACK INTO ITS PANTS!', 'THE TRAINING VIDEO SAID NOTHING ABOUT A DICK!'],
};
/** POPPY, the park's popcorn-bucket mascot (somebody in the foam bucket), gone feral. */
export const POPPY_BARK: ByPants = {
  clean: ['POPPY\'S POPPIN\'! POPPY\'S POPPIN\'!', 'THE WORLD\'S ENDING! POPPY WANTS A HUG!', "POPPY'S ON BATH SALTS!"],
  shitty: ['POPPY SMELLS BURNT BUTTER! IT\'S YOU!', "THAT'S NOT BUTTER! THAT'S NOT BUTTER!"],
  nude: ['POPPY SEES A WIENER!', "POPPY'S SEEN BIGGER KERNELS!"],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him in the havoc (by source), and the death screen

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:hwh_lava': {
    hurt: ['LAVA! IN MY SHOES!', 'MY ASS IS ON FIRE! ACTUALLY!', 'MY TOES ARE SOUP!'],
    death: ['MELTED IN BACKLOT LAVA', 'WENT IN THE LAVA. LAVA WON.', 'MELTED TO THE BELT BUCKLE'],
  },
  'm2:hwh_debris': {
    hurt: ['A TRASH CAN TO THE SHIN!', 'THE WIND THREW A DOOR AT ME!', "THE SKY'S THROWING PLYWOOD!"],
    death: ['KILLED BY WINDBLOWN TRASH', 'HIT BY A PORTA-POTTY DOOR', 'GONE WITH THE WIND'],
  },
  'm2:hwh_falling': {
    hurt: ['SOMETHING FELL ON MY HEAD!', 'A BRICK! A REAL ONE! ON A FAKE STREET!', 'THE SET\'S FALLING ON ME!'],
    death: ['A STUDIO LIGHT FELL ON HIM', 'CRUSHED BY A FALLING BRICK', 'BROUGHT DOWN WITH THE SET'],
  },
  'm2:hwh_facade': {
    hurt: ['A WHOLE BUILDING FELL ON ME! A FAKE ONE!', 'FLATTENED BY PLYWOOD!', 'IT WAS ONLY A FRONT! IT STILL HURT!'],
    death: ['FLATTENED BY A FACADE', 'FAKE BUILDING. REAL DEATH.'],
  },
  'm2:hwh_billboard': {
    hurt: ['THE REVENGERS BILLBOARD FELL ON ME!', 'RESEMBLED! I GOT RESEMBLED!'],
    death: ['FLATTENED BY THE REVENGERS', 'RESEMBLED. INTO A PANCAKE.'],
  },
  'm2:hwh_flood': {
    hurt: ['THE FLOOD! IT\'S UP MY ASS!', "WATER IN MY EVERYTHING! MY BUTTHOLE'S A SPONGE!", 'I SWALLOWED A FISH! A PLASTIC ONE!'],
    death: ['SWEPT AWAY ON A BACKLOT', 'THE FLOOD GOT HIM'],
  },
  'm2:hwh_drown': {
    hurt: ['GLUB GLUB GLUB!', 'I CAN\'T SWIM IN JEANS!'],
    death: ['DROWNED ON A BACKLOT', 'SLEEPS WITH THE PROP FISHES', 'REAL FLOOD. FAKE SWIMMER.'],
  },
  'm2:hwh_ball': {
    hurt: ['A WRECKING BALL! RIGHT IN THE NUTS!', "DEMOLISHED! I'M NOT EVEN ZONED FOR THIS!", 'GET THAT BALL AWAY FROM MY BALLS!'],
    death: ['HIT BY A WRECKING BALL', 'DEMOLISHED WITH THE HOTEL'],
  },
  'm2:hwh_avalanche': {
    hurt: ['AVALANCHE! SNOW IN MY CRACK!', 'BURIED! MY BALLS ARE INSIDE ME NOW!', 'FROZE MY NUTS OFF! ALMOST!'],
    death: ['BURIED BY AN L.A. AVALANCHE', 'FOUND IN THE SPRING', 'SHOULDA GOT IN THE BUNKER'],
  },
  'm2:hwh_snowslide': {
    hurt: ['SNOW IN MY SHORTS!', 'THE TORNADO\'S THROWING SNOW!', "COLD! MY DICK'S A THUMBTACK!"],
    death: ['RUN OVER BY A SNOWDRIFT', 'SNOWED UNDER'],
  },
  'm2:hwh_tornado': {
    hurt: ['THE TORNADO\'S GOT ME!', "IT'S SUCKING ME UP! NOT THE FUN KIND!"],
    death: [
      'TAKEN BY THE TORNADO',
      'TWISTED LIKE A PRETZEL',
      'DON\'T STAND BY THE TORNADO',
      'SKINNED BY THE WIND',
      'STRIPPED TO THE BONE',
      'THE TORNADO KEPT THE MEAT',
    ],
  },
  'm2:hwh_thrown': {
    hurt: ['THE TORNADO THREW A COW AT ME!', 'HIT BY A LETTER! A BIG ONE!', 'THAT WAS A PORTA-POTTY! IT WAS FULL!'],
    death: ['KILLED BY A FLYING COW', 'HIT BY THE HAPPYWOOD SIGN', 'CRUSHED BY TORNADO JUNK'],
  },
  'm2:hwh_hail': {
    hurt: ['HAIL! ON MY BALD SPOT!', 'ICE CUBES! FROM THE SKY!', "THE SKY'S THROWING ICE AT ME! FUCK YOU, SKY!"],
    death: ['PELTED TO DEATH BY HAIL', 'STONED BY THE SKY'],
  },
  'm2:hwh_looter': {
    hurt: ['HE HIT ME WITH A LOOTED TV!', 'GET YOUR FANNY PACK OFF ME!'],
    death: ['BEATEN TO DEATH BY A LOOTER', 'LOOTED. WALLET AND ALL.'],
  },
  'm2:hwh_loot': {
    hurt: ['A SNOW GLOBE! IN MY EYE!', 'A REVENGERS MUG! TO THE HEAD!', 'THAT PLUSHIE HAD A ROCK IN IT!'],
    death: ['KILLED BY A SOUVENIR', 'HIT BY A STOLEN SNOW GLOBE'],
  },
  'm2:hwh_crew': {
    hurt: ['THE STORM CREW HIT ME!', 'GET YOUR WET SLICKER OFF ME, YOU NINE-DOLLAR FUCK!'],
    death: ['KILLED BY THE STORM CREW', 'MOPPED UP BY THE STORM CREW'],
  },
  'm2:hwh_blower': {
    hurt: ['A LEAF BLOWER! IN MY FACE!', 'STOP BLOWING ME! AT LEAST BUY ME DINNER!', 'MY CHEEKS ARE FLAPPING!'],
    death: ['BLOWN AWAY BY A LEAF BLOWER', 'BLOWN. NOT THE GOOD WAY.'],
  },
  'm2:hwh_poppy': {
    hurt: ['THE POPCORN BUCKET JUMPED ME!', 'HOT BUTTER! HOT BUTTER!', 'POPPY, YOU FUCK!'],
    death: ['KILLED BY POPPY THE POPCORN', 'BUTTERED'],
  },
};

const pools = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...ARRIVE, ...Object.values(GAG).flat(), ...CAUGHT, ...SPIN, ...FLUNG,
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [NARR]: Object.values(NARR_HAVOC),
  [PA_VOICE]: [...pools(PA_HAVOC), ...PA_LEAK_HAVOC, ...PA_STEVE_HAVOC],
  [HAVOC_VOICES.looter]: pools(LOOTER_BARK), [HAVOC_VOICES.looterf]: pools(LOOTER_BARK),
  [HAVOC_VOICES.crew]: pools(CREW_BARK), [HAVOC_VOICES.crewf]: pools(CREW_BARK),
  [HAVOC_VOICES.poppy]: pools(POPPY_BARK), [HAVOC_VOICES.poppyf]: pools(POPPY_BARK),
};
