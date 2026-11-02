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
/** The shard, out of the panel's coin return. */
export const MH_SHARD: ByPants = {
  clean: ['JACKPOT.', 'IT PAYS OUT? SWEET.'],
  shitty: ['JACKPOT. LIKE MY PANTS.', 'IT PAYS OUT. FINALLY SOMETHING GOOD CAME OUT OF ME.'],
  nude: ['JACKPOT. NO POCKETS. I KNOW WHERE IT GOES.', 'IT PAYS OUT. HOLD THIS, BUTTCHEEKS.'],
};
/** After the massacre (back on him up the tree). */
export const MH_AFTER: ByPants = {
  clean: ["HUH. THAT'S ON WHOEVER WROTE THE PASSWORD.", 'THEY DID SAY REMAIN SEATED.', 'WORTH IT. SHINY ROCK.'],
  shitty: ['SOMEBODY DOWN THERE SHIT WORSE THAN ME.', "NOBODY'S LOOKING AT MY PANTS NOW."],
  nude: ["GOOD NEWS: NOBODY SAW ME NAKED. NOBODY'S LEFT.", "I'M NOT THE WORST THING THEY SAW TODAY."],
};

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
  meathead: [...flat(MH_PANEL), ...flat(MH_QUIT), ...flat(MH_SHARD), ...flat(MH_AFTER)],
  [PA_VOICE]: [PA_SEATED, ...PA_MORE],
};
