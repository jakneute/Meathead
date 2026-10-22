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
    shitty: ["Don't shoot! Oh God, he's crusty!", "I signed up to deliver protein, not this!"],
    nude: ["Don't shoot! And put some pants on!", 'Why is his dick out? Why is it always out?'],
  },
  charge: {
    clean: ["Form a wall! He can't get through six federal employees!", 'Lock arms! Human wall!'],
    shitty: ['Form a wall! Breathe through your mouths!', "Lock arms! Nobody breathe!"],
    nude: ['Form a wall! Eyes up! Eyes UP!', "Lock arms! Don't look down!"],
  },
  slide: {
    clean: ["Stay low! He can't hit us down here!", 'Crawl! Crawl like your pension depends on it!'],
    shitty: ["Stay low! Oh no, it's worse down here!", 'Crawl! Through the... oh God, what is that?'],
    nude: ['Stay low! No! Not under him!', "Crawl! Don't look up!"],
  },
  uppercut: {
    clean: ["He can't reach us up here!", 'Nobody jumps that high! Right? RIGHT?'],
    shitty: ["He can't reach us up here! But the smell can!", "Smell rises! Why did we come up here?"],
    nude: ["He can't reach us up here! Oh God, it's bouncing!", "We're safe up here! From most of it!"],
  },
  divekick: {
    clean: ['Huddle up! He can only stomp one of us!', 'Stay together! He only has two feet!'],
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
// (by the state of him: he can shit himself in the gym, or blow his pants clean off, and they notice)
export const RING_HELLO: Record<Dressed, string> = {
  clean: "Okay, big guy. We're padded. Show us the new stuff.",
  shitty: "Okay, big guy. We're padded. Not for that smell, though.",
  nude: "Okay, big guy. We're padded. You are not. At all.",
};
export const RING_SHOVE: Record<Dressed, string[]> = {
  clean: ['Time! Get off me!', "That's enough! Off!", 'Okay! OKAY! Off!', 'Tap! I tapped! Get off!'],
  shitty: ["Off! You're leaking on me!", "Get off! It's in the padding now!", "Tap! I tap! Oh God, it's warm!"],
  nude: ["Off! Your balls are on my chest pad!", "Get off! Something's slapping my face!", 'Tap! I tap! Put it away!'],
};
export const RING_THROWN: Record<Dressed, string[]> = {
  clean: ['Ow. Good one.', "I'm fine! The padding's fine!", 'I felt that in my fillings.'],
  shitty: ["I'm fine. The padding's getting burned.", 'Ow. And now I smell like you.'],
  nude: ['Ow. I saw everything on the way down.', "I'm fine. I'll never be fine."],
};
export const RING_JET: Record<Dressed, string[]> = {
  clean: ["Can't reach me up here!", 'Jetpack, baby! Come and get me!'],
  shitty: ["Can't smell you up here! Barely!", 'Jetpack, baby! Above the stink!'],
  nude: ["Can't reach me up here! Stop jumping! It flaps!", 'Jetpack, baby! Great view! Horrible view!'],
};
export const RING_DONE: Record<Dressed, string> = {
  clean: "That's everything. Exit's that way. Please use it.",
  shitty: "That's everything. Exit's that way. Please, God, use it.",
  nude: "That's everything. Exit's that way. Your pants aren't.",
};

// ---- the closing (scene.ts / shots.ts)
export const CLOSE_MH_CORK = 'YOU GUYS KEEP INTERRUPTING MY SETS. GIVE ME SOMEONE TO KILL OR I POP YOUR HEAD OFF LIKE A CORK.';
export const CLOSE_NO_CONTRACT: Record<Dressed, string> = {
  clean: 'We have... no active contract... right now.',
  shitty: 'No active contract... right now. And you shit yourself.',
  nude: 'No active contract... right now. And your dick is on my back.',
};
/** (the user's) The choked one, wheezing it into his earpiece as the arm tightens: then the ticket's the contingency. */
export const CLOSE_CONTINGENCY = 'Asset is extra unstable. Activate contingency protocol.';
export const CLOSE_TICKET: Record<Dressed, string> = {
  clean: 'Wait! All-day pass! Happy Land!',
  shitty: "Wait! All-day pass! Happy Land! Take it by the corner! Don't touch me!",
  nude: "Wait! All-day pass! Happy Land! Don't ask where I kept it. Don't put it anywhere.",
};
export const CLOSE_MH_HAPPY = 'HAPPY LAND?! THE ONE WITH THE RIDES?!';
/** (his state, noticed: after he's taken the pass, before the truck's offered; nothing said clean) */
export const CLOSE_NOTICED: Record<Dressed, string | null> = {
  clean: null,
  shitty: "Sir, you've soiled yourself. Again. On government time.",
  nude: 'Put something on, asset. Your balls are on my shoe.',
};
export const CLOSE_TRUCK: Record<Dressed, string> = {
  clean: 'And a government-issued truck.',
  shitty: 'And a government-issued truck. Sit on a towel.',
  nude: 'And a government-issued truck. And government-issued pants.',
};
export const CLOSE_MH_TRUCK: Record<Dressed, string> = {
  clean: 'A TRUCK?! FOR ME?!',
  shitty: 'A TRUCK?! FOR ME?! I ALREADY WENT, SO NO STOPS!',
  nude: "A TRUCK?! FOR ME?! I'M DRIVING NAKED!",
};
/** (the truck's seats, after he's seen it: nothing said clean) */
export const CLOSE_UPHOLSTERY: Record<Dressed, string | null> = {
  clean: null,
  shitty: 'Sit on the trash bags. That upholstery is government property.',
  nude: 'Towel on the seat. That upholstery is government property.',
};
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
const all = (v: Record<Dressed, string[] | string | null>) => Object.values(v).flat().filter((s): s is string => !!s);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [OPEN_REPS, OPEN_MH_1, OPEN_MH_2, OPEN_MH_3, CLOSE_MH_CORK, CLOSE_MH_HAPPY, ...all(CLOSE_MH_TRUCK), CLOSE_MH_GLASSES, CLOSE_MH_GO],
  [ANCHOR_VOICE]: OPEN_TV,
  [AGENT_VOICE]: [OPEN_AGENT_1, OPEN_AGENT_2, OPEN_AGENT_3, ...all(CLOSE_TRUCK), ...all(CLOSE_DISGUISE)],
  // (the women among the G-men say the rooms' lines in her voice)
  [AGENTF_VOICE]: [OPEN_AGENTF_1, OPEN_AGENTF_2, CLOSE_GUANTANAMO, CLOSE_NOT_HOW, ...all(CLOSE_NOTICED), ...all(CLOSE_UPHOLSTERY),...Object.values(ROOM_LINES).flatMap(all)],
  [GMAN_VOICE]: [...Object.values(ROOM_LINES).flatMap(all), ...all(RING_HELLO), ...all(RING_SHOVE), ...all(RING_THROWN), ...all(RING_JET), ...all(RING_DONE), ...all(CLOSE_NO_CONTRACT), CLOSE_CONTINGENCY, ...all(CLOSE_TICKET)],
};
