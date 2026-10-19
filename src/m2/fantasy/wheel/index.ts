// THE FAIRY WHEEL: section 2 of Fairy Land, trial 1 (job 2's to build; the skeleton's stand-in for now). The
// loudspeaker's scene (the town square's end, square/speaker.ts) puts him here. The user's design (fantasy-spec.md,
// verbatim there): a GIGANTIC, fairy-themed Ferris wheel. The other suitors (always male, beefy too) sit in their
// carts and throw crap at him and at each other, trying to stop him. He can't shoot them: he jumps to their cart, and a
// QTE starts (various ones); win it and a funny animation of him killing that suitor in his cart (smashed into the
// wall, thrown off...); lose it and he's knocked away for heavy damage (not killed, unless it takes him to zero). All
// the suitors dead: on to the fantasy area.
//
// Checkpoints 10-19. Way back: the left end to the square's end (DOORS.square.end); on: its right end (the glen).

import { stubSection } from '../stub';

export const wheel = stubSection({
  id: 'wheel', cp: 10, name: 'THE FAIRY WHEEL',
  sign: ['THE FAIRY WHEEL', 'TRIAL ONE'],
  soon: ['A GIGANTIC FERRIS WHEEL', 'SUITORS IN THE CARTS', 'JUMP IN. WIN. KILL.'],
});
