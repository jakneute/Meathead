// What's said at the paddock gate control panel (hack.ts) and in the massacre it lets out (hackMassacre.ts). Meathead's
// three ways, by the state of his pants (clean, shitty, naked). Recorded with the rest of the land's (adventure/voices.ts).

import type { ByPants } from './lines';

/** UP at the panel, before the ask. */
export const MH_PANEL: ByPants = {
  clean: ['A COMPUTER. IN A TREE. I KNOW COMPUTERS.', 'DO NOT TOUCH. CHALLENGE ACCEPTED.', 'I SAW A MOVIE ABOUT THIS. I GOT THIS.'],
  shitty: ['DO NOT TOUCH. TOO LATE, I GOT SHIT ON IT.', 'LET ME WIPE MY HANDS. ...ON THE KEYPAD.', 'I HACK BETTER WITH A LOAD IN MY PANTS.'],
  nude: ['HACKING NAKED. LIKE A REAL HACKER.', 'NOTHING TO WIPE ON. KEYPAD IT IS.', 'DON\'T LOOK AT MY DONGLE. LOOK AT THE SCREEN.'],
};
/** Backed out of the ask, or quit the terminal. */
export const MH_QUIT: ByPants = {
  clean: ['FUCK COMPUTERS.', "I'LL COME BACK WITH A HAMMER.", 'NERD SHIT. LATER.'],
  shitty: ['FUCK COMPUTERS. AND MY PANTS.', "I'LL COME BACK WITH A HAMMER. AND A WIPE."],
  nude: ['FUCK COMPUTERS. I GOT NO POCKETS FOR THIS.', "I'LL COME BACK WITH A HAMMER. AND PANTS."],
};
/** The cut back to him at the panel after the massacre: the shard pulled out of the fuse box (the owner: "he goes
 *  'worth it'"). */
export const MH_WORTH: ByPants = {
  clean: ['WORTH IT.'],
  shitty: ['WORTH IT. ...I SHIT MYSELF, BUT WORTH IT.'],
  nude: ['WORTH IT.'],
};

/** The guests in the massacre, screaming one at a time (the owner: "they scream things like 'oh god, why? why would
 *  anyone release all these dinosaurs? all this life. lost. is it worth it.'"). Woman's voice, man's voice. The
 *  owner's three are fixed, in order (the last the setup for his "worth it"); a couple more from the rest go between. */
export const GUEST_F = 'm2.guest', GUEST_M = 'm2.guest2';
export const GUEST_WHY = 'OH GOD, WHY? WHY WOULD ANYONE RELEASE ALL THESE DINOSAURS?';
export const GUEST_LOST = 'ALL THIS LIFE. LOST.';
export const GUEST_WORTH = 'IS IT WORTH IT?';
export const GUEST_MORE_F = [
  "MY HUSBAND! THAT WAS MY HUSBAND'S LEG!",
  'WHO OPENS THE GATES ON PURPOSE? WHO DOES THAT?',
  'TELL MY KIDS THE CHURROS WERE STALE!',
  'WE HAD FAST PASSES! WE HAD FAST PASSES!',
];
export const GUEST_MORE_M = [
  "THEY'RE NOT EVEN REAL! WHY DOES IT HURT SO MUCH?",
  'I JUST WANTED TO WATCH IT EAT A GOAT!',
  'WE PAID NINETY DOLLARS A HEAD FOR THIS! A HEAD!',
  'THE BROCHURE SAID FAMILY FRIENDLY!',
];

/** The park's PA in the massacre: first the owner's line, then one of the rest. */
export const PA_SEATED = 'PLEASE REMAIN SEATED.';
export const PA_MORE = [
  'KEEP HANDS, ARMS AND LEGS INSIDE THE BLEACHERS. WHILE YOU HAVE THEM.',
  'THE PARK IS NOT RESPONSIBLE FOR LOST ITEMS. OR LIMBS.',
  'GUESTS IN THE SPLASH ZONE WILL GET WET. WITH GUESTS.',
];
export const PA_VOICE = 'm2.pa';

const flat = (b: ByPants) => [...b.clean, ...b.shitty, ...b.nude];
export const HACK_VOICE_LINES: Record<string, string[]> = {
  meathead: [...flat(MH_PANEL), ...flat(MH_QUIT), ...flat(MH_WORTH)],
  [PA_VOICE]: [PA_SEATED, ...PA_MORE],
  [GUEST_F]: [GUEST_WHY, GUEST_WORTH, ...GUEST_MORE_F],
  [GUEST_M]: [GUEST_LOST, ...GUEST_MORE_M],
};
