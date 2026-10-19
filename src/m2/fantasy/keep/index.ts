// THE GREAT PIXIE'S CASTLE, ITS BASE AND THE RUNWAY: section 5 of Fairy Land (job 5's to build; the skeleton's
// stand-in for now). The user's design (fantasy-spec.md, verbatim there): "eventually you enter the base of the great
// pixie's castle. go through more standard platforming stuff until you reach a 'fantasy' themed runway outside for the
// final trial". The castle looms over it (monument.ts: the biggest it's been).
//
// Checkpoints 40-49. Way back: the left end to the ride's end; on: its right end (the broomsticks).

import { stubSection } from '../stub';

export const keep = stubSection({
  id: 'keep', cp: 40, name: "THE GREAT PIXIE'S CASTLE",
  sign: ["THE GREAT PIXIE'S CASTLE", 'STAFF AND SUITORS ONLY'],
  soon: ['STANDARD PLATFORMING', 'THE RUNWAY', 'BROOMSTICKS'],
  more: [[9500, ['THE RUNWAY', 'BROOMSTICK DEATHMATCH >']]],
});
