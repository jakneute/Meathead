// What's said in the dungeon (by voice: spooky/voices.ts gathers these). The PA ('m2.donnie.pa': Donnie as "Dracula")
// three ways every time, clean / shitty pants / naked, each pool the same size; still eating into the mic (castle/lines.ts). The spiked ceiling's a new way to hurt
// him: its hurt callouts and its death lines (and its own death: dungeon/death.ts).

import { PA, type ByPants } from '../castle/lines';

/** In through the dungeon door: the dungeon, then the chamber ahead and Sal (in order; all three ways tell of Sal
 *  testing it himself, so Meathead's say back fits). */
export const PA_DUNGEON: ByPants = {
  clean: [
    '*CRUNCH*. THE DUNGEON. MY GUESTS HANG OUT DOWN HERE. ON THE VALL. FOREVER. LIKE HAMS.',
    'AHEAD, THE DESCENDING CEILINK. BUILT BY A GUY NAMED SAL. SAL TESTED IT HIMSELF. VE KEPT MOST OF SAL.',
  ],
  shitty: [
    '*CRUNCH*. THE DUNGEON. IT SMELLED BETTER DOWN HERE VITH THE BODIES. I ATE DOWN HERE.',
    'AHEAD, THE DESCENDING CEILINK. BUILT BY A GUY NAMED SAL. SAL TESTED IT HIMSELF. HE DIED IN CLEAN PANTS.',
  ],
  nude: [
    '*CRUNCH*. THE DUNGEON. MY GUESTS HANG OUT DOWN HERE. SO DOES YOUR SACK, APPARENTLY. I LOST MY APPETITE.',
    'AHEAD, THE DESCENDING CEILINK. BUILT BY A GUY NAMED SAL. SAL TESTED IT HIMSELF. TUCK EVERYTHING IN.',
  ],
};
/** The stairs down: at the top, and halfway (in order). */
export const PA_STAIRS: ByPants = {
  clean: [
    'DESCEND, MORTAL. INTO THE BOVELS OF MY CASTLE. NINETY-NINE STEPS. VUN FOR EACH VICTIM.',
    'THE LIGHTS GROW DIM. VE ARE OVER BUDGET ON CANDLES. I ATE THE CANDLE BUDGET. *SLURP*. SOMETHING DOWN THERE IS VATCHING YOU.',
  ],
  shitty: [
    'DESCEND, MORTAL. INTO THE BOVELS OF MY CASTLE. YOU KNOW BOVELS. YOURS ARE IN YOUR PANTS.',
    'THE LIGHTS GROW DIM. THANK GOD. *SLURP*. SOMETHING DOWN THERE IS VATCHING YOU. IT CAN SMELL YOU TOO.',
  ],
  nude: [
    'DESCEND, MORTAL. NINETY-NINE STEPS. YOUR BALLS SLAP EVERY VUN. I COUNTED.',
    'THE LIGHTS GROW DIM. A MERCY. *SLURP*. SOMETHING DOWN THERE IS VATCHING YOU. IT VISHES IT VAS BLIND.',
  ],
};

/** The doors shut, and the ceiling starts down: the first said then (it tells him of the lever); one of the others,
 *  a while in. */
export const PA_CEILING: ByPants = {
  clean: [
    'THE DOORS ARE LOCKED. THE LEVER IS UP AT THE FAR END. RUN, SHITHEAD.',
    'LOVER... LOVER... THE CEILINK IS COMING DOWN TO MEET YOU.',
    'DO NOT DUCK. I VANT TO SEE.',
  ],
  shitty: [
    'THE DOORS ARE LOCKED. THE LEVER IS UP AT THE FAR END. THE SMELL STAYS DOWN HERE. FOREVER.',
    'LOVER... LOVER... THE CEILINK VILL SEAL IN THE SMELL. LIKE A TOILET LID.',
    'DO NOT DUCK. VHEN YOU DUCK, IT SQUISHES OUT.',
  ],
  nude: [
    'THE DOORS ARE LOCKED. THE LEVER IS UP AT THE FAR END. DO NOT CLIMB. I CAN SEE YOUR ASSHOLE VHEN YOU CLIMB.',
    'LOVER... LOVER... THE SPIKES ARE AIMING. THEY ARE AIMING LOW.',
    'DO NOT DUCK. NOT NAKED. NOT TOVARD THE CAMERA.',
  ],
};
/** He got out. */
export const PA_ESCAPED: ByPants = {
  clean: ['HE GOT OUT. SAL, YOU USELESS DEAD FUCK. I DROPPED MY SANDVICH.', 'IMPRESSIVE. THE CEILINK IS DISAPPOINTED IN YOU. SO AM I.'],
  shitty: ['HE GOT OUT. AND HE LEFT A STAIN. SAL, GET A MOP. SAL IS DEAD. GET A MOP ANYVAY.', 'YOU ESCAPED. THE SMELL DID NOT. IT LIVES THERE NOV.'],
  nude: ['HE GOT OUT. THE SPIKES MISSED EVERY DANGLING THING. HOV?', 'YOU ESCAPED. THE CEILINK IS RELIEVED. IT DID NOT VANT TO TOUCH YOU EITHER.'],
};

/** Meathead, going down into the dark. */
export const MH_DARK = ["I CAN'T SEE SHIT.", 'WHO RUNS THE LIGHTS DOWN HERE? I WANNA PUNCH HIM.'];
export const MH_EYES = ['THERE ARE EYES. WHY ARE THERE EYES?', 'I SEE YOU TOO, CREEP.'];
/** Meathead, back at the dungeon's story (Sal). */
export const MH_DUNGEON = ['SAL SOUNDS LIKE A DUMBASS.', 'A SPIKE CEILING. IN A KIDS PARK. GOOD JOB, SAL.'];
export const MH_CEILING = ["THE CEILING'S MOVING!", 'OH, FUCK ME. A SPIKE ROOM.'];
export const MH_LEVER = ['DOOR! DOOR! DOOR!', 'LEVER! GO GO GO!'];
export const MH_ESCAPED = ['SUCK IT, SAL.', 'TOO SLOW, CEILING.'];

/** His first rope. */
export const MH_ROPE = ['ROPES OVER SPIKES. THANKS, SAL.', "I'M A NATURAL. I'M A NATURAL AT EVERYTHING."];
export const HURT_SPIKEPIT = ['SPIKES IN MY EVERYTHING!', 'MY FEET ARE KEBABS!', 'MY TAINT! MY TAINT!'];
export const DEATH_SPIKEPIT = ['FELL ON THE POINTY END', 'PINCUSHIONED', 'SPIKE KEBAB', 'HOLEY MEATHEAD'];
export const HURT_VAT = ['HOT LARD! HOT LARD!', "I'M DEEP FRIED!", 'MY BALLS ARE CRACKLINGS!'];
export const DEATH_VAT = ['DEEP FRIED IN LARD', 'RENDERED', 'EXTRA CRISPY', 'BATTERED AND FRIED'];
export const HURT_CEILING = ['SPIKES IN MY HEAD!', 'IT GOT MY SCALP!', "I'M GETTING SHORTER!"];
export const DEATH_CEILING = ['SKEWERED BY THE CEILING', 'KEBABED', 'MOST OF MEATHEAD'];

const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  [PA]: [...all(PA_DUNGEON), ...all(PA_STAIRS), ...all(PA_CEILING), ...all(PA_ESCAPED)],
  meathead: [...MH_DARK, ...MH_EYES, ...MH_DUNGEON, ...MH_CEILING, ...MH_LEVER, ...MH_ESCAPED, ...HURT_CEILING, ...MH_ROPE, ...HURT_SPIKEPIT, ...HURT_VAT],
  death: [...DEATH_CEILING, ...DEATH_SPIKEPIT, ...DEATH_VAT],
};
