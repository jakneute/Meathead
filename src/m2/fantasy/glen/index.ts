// THE ENCHANTED GLEN: section 3 of Fairy Land (job 3's to build; the skeleton's stand-in for now). The user's design
// (fantasy-spec.md, verbatim there): when all the suitors are dead, "go through another fantasy themed area with
// escalating platforming/enemy challenges". The staircases (fantasy/stairs.ts) are the land's mechanic: build on them.
//
// Checkpoints 20-29. Way back: the left end to the wheel's end; on: its right end (the ride's queue).

import { stubSection } from '../stub';

export const glen = stubSection({
  id: 'glen', cp: 20, name: 'THE ENCHANTED GLEN',
  sign: ['THE ENCHANTED GLEN', 'MIND THE MUSHROOMS'],
  soon: ['ESCALATING PLATFORMING', 'MORE CAST MEMBERS', 'MORE STAIRCASES'],
});
