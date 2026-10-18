// THE LOG RIDE: section 4 of Wilderness Land (a later job's; the skeleton's stand-in for now). The user's design: as
// Meathead cuts ahead, Tucker (a hole through his head, somehow still alive) is at the ride controls, shoves the real
// ride operator out of the way: "TIME TO ENGAGE THE BUZZSAWS". He presses it; a buzzsaw falls from the ceiling and cuts a
// huge hole in his forehead (the mutilation rule: an ANIMATED close-up of it happening, tucker.ts `making: { wound:
// 'saw', k }`: his missing eye and his splitting headache), he falls over, apparently dead. Then a tracked log ride with
// buzzsaw obstacles. In order (the user's): the tracked ride, its LAST stretch in a SEWER (he's veered way off the
// intended track), then the theme-park log flies out into an ACTUAL river (out of the park: the real wilderness starts
// here), and that river ends at the WOODCHIPPER: jump out at that moment or a funny death.
//
// Checkpoints 30-39. Way back: the left end to the town. The woodchipper's a one-way cut into the woods (back from the
// woods, he's put on the river bank before it).

import { stubSection } from '../stub';

export const logride = stubSection({
  id: 'logride', cp: 30, name: 'THE LOG RIDE',
  sign: ['TIMBER TUMBLE', 'LOG RIDE'],
  soon: ['TUCKER AT THE CONTROLS', 'THE BUZZSAWS', 'THE SEWER', 'A REAL RIVER', 'THE WOODCHIPPER'],
  more: [[2600, ['THE RIDE', 'KEEP ARMS INSIDE']], [4800, ['THE SEWER', '(OFF THE TRACK)']], [6700, ['A REAL RIVER', '(OUT OF THE PARK)']], [8300, ['WOODCHIPPER', 'JUMP!']]],
  ground: ['#4A3A2A', '#8AA06A'],
});
