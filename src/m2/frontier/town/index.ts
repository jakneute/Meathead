// THE MINING AND LOGGING TOWN, AND THE MINES: section 3 of Wilderness Land (a later job's; the skeleton's stand-in for
// now). The train crashes into its stop (the train's end puts him here). The user's design: a sequence of characters in
// this logging/mining town, through the town and the mines for a bit, till the log ride. Still the PARK's frontier
// (plywood fronts, fake rock, painted backdrops, guests): the real wilderness only comes after the sewer.
//
// The town's name (a fill-in, frontier-spec.md's Decisions): SAWDUST GULCH.
//
// Checkpoints 20-29. Way back: the left end to the train (the crash site).

import { stubSection } from '../stub';

export const town = stubSection({
  id: 'town', cp: 20, name: 'SAWDUST GULCH',
  sign: ['SAWDUST GULCH', 'POP. 40 (PAID STAFF)'],
  soon: ['THE TOWNSFOLK', 'THROUGH TOWN', 'DOWN THE MINES', 'TO THE LOG RIDE'],
  more: [[5600, ['THE MINES', 'HARD HATS NOT PROVIDED']], [9800, ['LOG RIDE', 'THIS WAY >']]],
});
