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
export const ARRIVE = ['LAVA, SNOW AND FIRE. CALIFORNIA\'S FINALLY HONEST.', 'THE SKY\'S ON FIRE AND IT\'S SNOWING. PERFECT.'];
export const GAG: Record<'lava' | 'facade' | 'bridge' | 'wind' | 'quake' | 'billboard' | 'flood' | 'ball' | 'top' | 'tornado' | 'coverSign' | 'inCover' | 'rip' | 'everything' | 'refill' | 'surge', string[]> = {
  lava: ['LAVA. IN THE STREET. DON\'T STEP IN THE LAVA, DUMBASS.', 'A LAVA RIVER. ON A BACKLOT. SURE.'],
  facade: ['THE WHOLE STREET\'S FAKE. AND IT\'S FALLING ON ME.', 'THERE\'S NOTHING BEHIND IT. THERE NEVER WAS.'],
  bridge: ['THE LIGHT TOWER FELL OVER. NOW IT\'S A BRIDGE.', 'TWO-BY-FOUR BRIDGE. HOLLYWOOD QUALITY.'],
  wind: ['THE WIND\'S THROWING TRASH CANS. JUMP, IDIOT.', 'WINDY. MY NIPPLES CAN TELL.'],
  quake: ['EARTHQUAKE. WATCH THE SHADOWS. SHIT FALLS.', 'THE GROUND\'S SHAKING. SO ARE MY BALLS.'],
  billboard: ['REVENGERS: RESEMBLE. RESEMBLE A PILE OF SHIT.', 'THE REVENGERS BILLBOARD. FINALLY, A GOOD REVIEW.'],
  flood: ['FLOOD! UP! GO UP!', 'THE WATER\'S COMING. CLIMB, FAT ASS!'],
  ball: ['A WRECKING BALL. THEY\'RE DEMOLISHING IT. WITH ME ON IT.', 'WHO RUNS A WRECKING BALL IN A FLOOD?'],
  top: ['THE HAPPYWOOD SIGN. UP CLOSE IT\'S PLYWOOD TOO.', 'MADE IT. TOP OF THE WORLD. NOW WHAT.'],
  tornado: ['AND NOW A TORNADO. RUN!', 'TORNADO! RUN, LEGS!'],
  coverSign: ['AVALANCHE ZONE. IN HOLLYWOOD. SURE.', 'A BUNKER. GET IN THE BUNKER, DUMBASS.'],
  inCover: ['IN HERE. COME ON, SNOW.', 'HIDE. LET IT GO OVER.'],
  rip: ['IT\'S EATING THE WHOLE STREET!', 'IT TOOK THE BUILDING. THE WHOLE BUILDING.'],
  everything: ['ALL OF IT AT ONCE. AGAIN.', 'LAVA, HAIL, WIND AND A TORNADO. PICK A DEATH.'],
  refill: ['FIRST AID. NOBODY\'S MANNING IT. MINE.', 'FREE BANDAIDS. THE END OF THE WORLD HAS PERKS.'],
  surge: ['IT\'S FASTER! IT\'S WAY FASTER!', 'NOPE. NOPE. NOPE.'],
};

/** The fling. Caught; spun round in it (the SAFE TORNADO LAUNCHING ZONE: how is a tornado launcher SAFE); flung. */
export const CAUGHT = ['OH SHIIIIT!', 'IT GOT MEEEE!'];
export const SPIN = ['I\'M IN THE TORNADO! THERE\'S A COW IN HERE!', 'WHEEE! FUCK! WHEEE!'];
/** The user's line, verbatim. */
export const FOURTH_WALL = 'NORMALLY YOU KILL ME, BUT BECAUSE THIS IS A CUTSCENE I JUST MOVE TO THE NEXT SCRIPTED SET PIECE. OKAY. MAKES PERFECT SENSE.';
export const FLUNG = ['WHERE AM I GOIIIING?!', 'PUT ME DOWN SOMEWHERE SOFT!'];

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
  clean: ['ATTENTION, GUESTS. THE PARK IS EXPERIENCING EVERY DISASTER AT ONCE. STUNTMAN STEVE\'S SHOW WILL GO ON AS SCHEDULED.'],
  shitty: ['ATTENTION. THERE ARE NOW SEVEN DISASTERS IN THE PARK. ONE OF THEM IS A MAN\'S PANTS.'],
  nude: ['ATTENTION. EVERY DISASTER IS NOW HAPPENING. ALSO A NAKED MAN. THAT ONE WE CAN\'T EXPLAIN.'],
};
/** Once, early: every disaster at once, and still not the worst thing that happened today. */
export const PA_LEAK_HAVOC = [
  'ATTENTION. THE PARK IS ON FIRE, UNDERWATER AND IN A TORNADO. IT IS STILL NOT AS BAD AS THE SCRIPT LEAK.',
  'IN A WORLD... WHERE THE REVENGERS SCRIPT GOT OUT... NOTHING ELSE MATTERS. NOT EVEN THE LAVA.',
];
export const PA_STEVE_HAVOC = [
  'STUNTMAN STEVE HAS SURVIVED A TORNADO! ON FILM! FOR A SECOND!',
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
  clean: ['IT\'S THE APOCALYPSE! THE PLUSHIES ARE FREE!', 'BACK OFF! THIS SNOW GLOBE IS MINE!', 'END OF THE WORLD SALE!'],
  shitty: ['TAKE SOME PANTS! THE GIFT SHOP\'S OPEN!', 'THE APOCALYPSE SMELLS BETTER THAN YOU!'],
  nude: ['THE GIFT SHOP HAS SHIRTS! TAKE A SHIRT!', 'HE\'S NAKED! HE\'S NOT EVEN LOOTING!'],
};
/** The park's storm crew in their slickers, leaf blowers against the end of the world. */
export const CREW_BARK: ByPants = {
  clean: ['STORM CREW! WE\'RE HANDLING IT!', 'STAND BACK! I\'M BLOWING THE TORNADO AWAY!', 'I MAKE NINE AN HOUR!'],
  shitty: ['I\'LL BLOW THAT SMELL INTO THE NEXT COUNTY!', 'HAZMAT! WE HAVE A HUMAN HAZMAT!'],
  nude: ['BLOW IT BACK INTO ITS PANTS!', 'I\'M NOT TRAINED FOR NAKED!'],
};
/** POPPY, the park's popcorn-bucket mascot (somebody in the foam bucket), gone feral. */
export const POPPY_BARK: ByPants = {
  clean: ['POPPY\'S POPPIN\'! POPPY\'S POPPIN\'!', 'THE WORLD\'S ENDING! POPPY WANTS A HUG!', 'EXTRA BUTTER! EXTRA DEATH!'],
  shitty: ['POPPY SMELLS BURNT BUTTER! IT\'S YOU!', 'NOT THAT KIND OF BUTTER!'],
  nude: ['POPPY SEES A WIENER!', 'COVER THAT KERNEL!'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him in the havoc (by source), and the death screen

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:hwh_lava': {
    hurt: ['LAVA! IN MY SHOES!', 'MY ASS IS ON FIRE! ACTUALLY!', 'HOT HOT HOT! FUCK!'],
    death: ['MELTED IN A LAVA RIVER ON A STUDIO BACKLOT', 'HE WENT IN THE LAVA. THE LAVA WON.', 'BURNED DOWN TO THE BELT BUCKLE'],
  },
  'm2:hwh_debris': {
    hurt: ['A TRASH CAN TO THE SHIN!', 'THE WIND THREW A DOOR AT ME!', 'WHO THROWS PLYWOOD? THE SKY?'],
    death: ['KILLED BY WINDBLOWN TRASH', 'HIT BY A FLYING PORTA-POTTY DOOR', 'GONE WITH THE WIND'],
  },
  'm2:hwh_falling': {
    hurt: ['SOMETHING FELL ON MY HEAD!', 'A BRICK! A REAL ONE!', 'THE SET\'S FALLING ON ME!'],
    death: ['A STUDIO LIGHT FELL ON HIM', 'CRUSHED BY A FALLING BRICK', 'BROUGHT DOWN WITH THE SET'],
  },
  'm2:hwh_facade': {
    hurt: ['A WHOLE BUILDING FELL ON ME! A FAKE ONE!', 'FLATTENED BY PLYWOOD!', 'IT WAS ONLY A FRONT! IT STILL HURT!'],
    death: ['FLATTENED BY A FACADE', 'A FAKE BUILDING. A REAL DEATH.'],
  },
  'm2:hwh_billboard': {
    hurt: ['THE REVENGERS BILLBOARD FELL ON ME!', 'RESEMBLED! I GOT RESEMBLED!'],
    death: ['CRUSHED BY A REVENGERS BILLBOARD', 'REVENGERS: RESEMBLE. HE RESEMBLES A PANCAKE.'],
  },
  'm2:hwh_flood': {
    hurt: ['THE FLOOD! IT\'S UP MY ASS!', 'WATER IN MY EVERYTHING!', 'I SWALLOWED A FISH! A PLASTIC ONE!'],
    death: ['SWEPT AWAY ON A BACKLOT', 'THE FLOOD GOT HIM'],
  },
  'm2:hwh_drown': {
    hurt: ['GLUB GLUB GLUB!', 'I CAN\'T SWIM IN JEANS!'],
    death: ['DROWNED ON A BACKLOT', 'SLEEPS WITH THE PROP FISHES', 'THE FLOOD WAS REAL. HIS SWIMMING WASN\'T.'],
  },
  'm2:hwh_ball': {
    hurt: ['A WRECKING BALL! RIGHT IN THE NUTS!', 'DEMOLISHED! ME!', 'GET THAT BALL AWAY FROM MY BALLS!'],
    death: ['HIT BY A WRECKING BALL', 'DEMOLISHED WITH THE HOTEL'],
  },
  'm2:hwh_avalanche': {
    hurt: ['AVALANCHE! SNOW IN MY CRACK!', 'BURIED! I\'M A SNOWMAN!', 'FROZE MY NUTS OFF! ALMOST!'],
    death: ['BURIED BY AN AVALANCHE IN LOS ANGELES', 'FOUND IN THE SPRING', 'SHOULDA GOT IN THE BUNKER'],
  },
  'm2:hwh_snowslide': {
    hurt: ['SNOW IN MY SHORTS!', 'THE TORNADO\'S THROWING SNOW!', 'COLD! COLD BALLS!'],
    death: ['RUN OVER BY A SNOWDRIFT', 'SNOWED UNDER'],
  },
  'm2:hwh_tornado': {
    hurt: ['THE TORNADO\'S GOT ME!', 'IT\'S SUCKING ME UP!'],
    death: [
      'TAKEN BY THE TORNADO',
      'TWISTED LIKE A PRETZEL. A DEAD ONE.',
      'DON\'T STAND NEXT TO THE TORNADO',
      'SKINNED BY THE WIND',
      'STRIPPED TO THE BONE BY A TORNADO',
      'THE TORNADO KEPT THE MEAT. IT DIDN\'T WANT THE BONES.',
    ],
  },
  'm2:hwh_thrown': {
    hurt: ['THE TORNADO THREW A COW AT ME!', 'HIT BY A LETTER! A BIG ONE!', 'THAT WAS A PORTA-POTTY! IT WAS FULL!'],
    death: ['KILLED BY A FLYING COW', 'HIT BY A LETTER OFF THE HAPPYWOOD SIGN', 'CRUSHED BY TORNADO JUNK'],
  },
  'm2:hwh_hail': {
    hurt: ['HAIL! ON MY BALD SPOT!', 'ICE CUBES! FROM THE SKY!', 'OW! OW! HAIL!'],
    death: ['PELTED TO DEATH BY HAIL', 'HAILED'],
  },
  'm2:hwh_looter': {
    hurt: ['THE LOOTER HIT ME!', 'GET YOUR FANNY PACK OFF ME!'],
    death: ['BEATEN TO DEATH BY A LOOTER', 'LOOTED'],
  },
  'm2:hwh_loot': {
    hurt: ['A SNOW GLOBE! IN MY EYE!', 'A REVENGERS MUG! TO THE HEAD!', 'THAT PLUSHIE HAD A ROCK IN IT!'],
    death: ['KILLED BY A SOUVENIR', 'HIT BY A STOLEN SNOW GLOBE'],
  },
  'm2:hwh_crew': {
    hurt: ['THE STORM CREW HIT ME!', 'OW! YOUR SLICKER\'S WET!'],
    death: ['KILLED BY THE STORM CREW', 'MANAGED'],
  },
  'm2:hwh_blower': {
    hurt: ['A LEAF BLOWER! IN MY FACE!', 'STOP BLOWING ME!', 'MY CHEEKS ARE FLAPPING!'],
    death: ['BLOWN AWAY BY A LEAF BLOWER', 'LEAF BLOWN'],
  },
  'm2:hwh_poppy': {
    hurt: ['THE POPCORN MASCOT JUMPED ME!', 'HOT BUTTER! HOT BUTTER!', 'POPPY, YOU FUCK!'],
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
