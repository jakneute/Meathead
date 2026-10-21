// Everything said in the Iron Pit (Meathead 2's opening: gym/index.ts): the opening cutscene, the G-men running from
// him room by room, the padded trainers at the ring, and the closing cutscene. The user's lines are kept word for word
// (the cork line, "let's go to happy land!"). Every one of them is in VOICE_LINES, by voice, for the recordings
// (tools/voices: extract.ts, m2pack.ts) and for lines/consistency.ts (they name the President, and Guantanamo: they
// were written for here).

import type { Dressed } from '../lines';

/** The G-man who does the talking (Meathead 1's agent: the same man, the same voice). */
export const AGENT_VOICE = 'agent';
/** His partner on the courier run (deadpan). */
export const AGENTF_VOICE = 'm2.gmanf';
/** The rest of them: the ones running round the gym, the trainers at the ring, the one he chokes. */
export const GMAN_VOICE = 'm2.gman';
/** The news on the gym's TV. */
export const ANCHOR_VOICE = 'reporter';

// ---- the opening (shots: scene.ts / shots.ts)
export const OPEN_TV = [
  "Day four hundred at Guantanamo Bay for Meathead, the man who killed the President.",
  'Sources say he cries himself to sleep.',
];
export const OPEN_REPS = 'NINETY-EIGHT... NINETY-NINE...';
export const OPEN_AGENT_1 = 'Protein delivery. Forty tubs. Double chocolate.';
export const OPEN_AGENTF_1 = "Sign here. Officially you're rotting in Guantanamo, so sign it Guantanamo.";
export const OPEN_AGENT_2 = "Uncle Sam doesn't lock up his best killer. He feeds him.";
export const OPEN_MH_1 = "IT'S LEG DAY.";
export const OPEN_AGENTF_2 = "We'll be quick.";
export const OPEN_MH_2 = 'YOU INTERRUPTED LEG DAY.';
export const OPEN_MH_3 = 'I MUST DESTROY THEM.';
export const OPEN_AGENT_3 = 'Every goddamn Tuesday.';

// ---- the tutorial: what the G-men say as he comes into each room (one of them, the once, over his head)
export type Room = 'shoot' | 'charge' | 'slide' | 'uppercut' | 'divekick' | 'mix';
export const ROOM_LINES: Record<Room, Record<Dressed, string[]>> = {
  shoot: {
    clean: ["Don't shoot! I just deliver the protein!", "I'm a courier! I have a clipboard!"],
    shitty: ["Don't shoot! And don't come closer! God, the smell!", "I signed up to deliver protein, not this!"],
    nude: ["Don't shoot! And put some pants on!", 'Why is his dick out? Why is it always out?'],
  },
  charge: {
    clean: ['Form a wall! He can\'t get through all of us!', 'Lock arms! Human wall!'],
    shitty: ['Form a wall! Breathe through your mouths!', "Lock arms! Nobody breathe!"],
    nude: ['Form a wall! Eyes up! Eyes UP!', "Lock arms! Don't look down!"],
  },
  slide: {
    clean: ["Stay low! He can't hit us down here!", 'Crawl! Crawl like your pension depends on it!'],
    shitty: ["Stay low! Oh no, it's worse down here!", 'Crawl! Through the... oh God, what is that?'],
    nude: ["Stay low! No, wait, that's the worst view in the building!", "Crawl! Don't look up!"],
  },
  uppercut: {
    clean: ["He can't reach us up here!", 'Nobody jumps that high! Right? RIGHT?'],
    shitty: ["He can't reach us up here! But the smell can!", "Smell rises! Why did we come up here?"],
    nude: ["He can't reach us up here! Great view, though! Wait, no!", "We're safe up here! From most of it!"],
  },
  divekick: {
    clean: ['Huddle up! Strength in numbers!', 'Stay together! He only has two feet!'],
    shitty: ['Huddle up! Upwind! UPWIND!', "Stay together! He's shitting on us from a height!"],
    nude: ['Huddle up! Cover your eyes!', "He's jumping! It's all swinging! Huddle!"],
  },
  mix: {
    clean: ['Somebody call his handler!', "I AM his handler! I'm calling my mom!"],
    shitty: ["Somebody call his handler! And a plumber!", "Get him a diaper! Government issue!"],
    nude: ['Somebody find his pants!', "His pants are in the ring! Don't go in the ring!"],
  },
};

// ---- the ring: the two padded trainers (they teach the grabs; they can't be killed)
export const RING_HELLO = "Okay, big guy. We're padded. Show us the new stuff.";
export const RING_SHOVE = ['Time! Get off me!', "That's enough! Off!", 'Okay! OKAY! Off!', 'Tap! I tapped! Get off!'];
export const RING_THROWN = ['Ow. Good one.', "I'm fine! The padding's fine!", 'Nailed it. Again, I guess.'];
export const RING_JET = ["Can't reach me up here!", 'Jetpack, baby! Come and get me!'];
export const RING_DONE = "That's everything. Exit's that way. Please use it.";

// ---- the closing (scene.ts / shots.ts)
export const CLOSE_MH_CORK = 'YOU GUYS KEEP INTERRUPTING MY SETS. GIVE ME SOMEONE TO KILL OR I POP YOUR HEAD OFF LIKE A CORK.';
export const CLOSE_NO_CONTRACT: Record<Dressed, string> = {
  clean: 'We have... no active contract... right now.',
  shitty: 'No active contract... right now. And you shit yourself.',
  nude: 'No active contract... right now. And your dick is on my back.',
};
export const CLOSE_TICKET = 'Wait! All-day pass! Happy Land!';
export const CLOSE_MH_HAPPY = 'HAPPY LAND?! THE ONE WITH THE RIDES?!';
export const CLOSE_TRUCK: Record<Dressed, string> = {
  clean: 'And a government-issued truck.',
  shitty: 'And a government-issued truck. Sit on a towel.',
  nude: 'And a government-issued truck. And government-issued pants.',
};
export const CLOSE_MH_TRUCK = 'A TRUCK?! FOR ME?!';
// (the disguise: he's meant to be in Guantanamo, and he's off to a theme park in public; the nerd glasses he wears from
// here on, every sprite of him)
export const CLOSE_GUANTANAMO = "One problem. The whole country thinks you're in Guantanamo.";
export const CLOSE_DISGUISE: Record<Dressed, string> = {
  clean: 'So you wear a disguise.',
  shitty: 'So you wear a disguise. And take a shower.',
  nude: 'So you wear a disguise. And pants.',
};
export const CLOSE_MH_GLASSES = 'I CAN READ NOW.';
export const CLOSE_NOT_HOW = "That's not how glasses work.";
export const CLOSE_MH_GO = "LET'S GO TO HAPPY LAND!";

/** Every line, by voice. */
const all = (v: Record<Dressed, string[] | string>) => Object.values(v).flat();
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [OPEN_REPS, OPEN_MH_1, OPEN_MH_2, OPEN_MH_3, CLOSE_MH_CORK, CLOSE_MH_HAPPY, CLOSE_MH_TRUCK, CLOSE_MH_GLASSES, CLOSE_MH_GO],
  [ANCHOR_VOICE]: OPEN_TV,
  [AGENT_VOICE]: [OPEN_AGENT_1, OPEN_AGENT_2, OPEN_AGENT_3, ...all(CLOSE_TRUCK), ...all(CLOSE_DISGUISE)],
  // (the women among the G-men say the rooms' lines in her voice)
  [AGENTF_VOICE]: [OPEN_AGENTF_1, OPEN_AGENTF_2, CLOSE_GUANTANAMO, CLOSE_NOT_HOW, ...Object.values(ROOM_LINES).flatMap(all)],
  [GMAN_VOICE]: [...Object.values(ROOM_LINES).flatMap(all), RING_HELLO, ...RING_SHOVE, ...RING_THROWN, ...RING_JET, RING_DONE, ...all(CLOSE_NO_CONTRACT), CLOSE_TICKET],
};
