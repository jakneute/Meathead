// THE TRAIN: section 2 of Wilderness Land (job 2's to build; the skeleton's stand-in for now). The station scene (the
// wilds' end, wilds/station.ts) leaves Tucker's train speeding off and puts him here. The user's design (frontier-spec.md,
// verbatim there): Meathead jumps on the train from the caboose and makes his way through it to the engine. Cars he can
// go through and cars he can only cross on top of; Tucker now and then uncouples the car he's on (dally and it derails:
// a silly violent death); tunnels go by and darken the view, more and more of them, never quite black; train obstacles
// and enemies. At the front: the engine with a big KILL arrow (as Riggs in Meathead 1); one shot from outside, a
// close-up of the hole through his eye (the mutilation rule: an ANIMATED, multi-frame, gory close-up, tucker.ts
// `drawTuckerCloseup` with `making: { wound: 'eye', k }`), apparently dead; the train crashes into the town's stop.
//
// Checkpoints 10-19. Way back: the left end to the station (DOORS.wilds.end); the crash is one-way (back from the town,
// he's at the wreck: the town's owner keeps the way back walkable).

import { stubSection } from '../stub';

export const train = stubSection({
  id: 'train', cp: 10, name: 'THE TRAIN',
  sign: ['THE TRAIN', 'CABOOSE TO ENGINE'],
  soon: ['ON AT THE CABOOSE', 'CAR BY CAR TO THE ENGINE', 'TUNNELS. UNCOUPLINGS.', 'THE KILL ARROW'],
  more: [[4500, ['MIND THE GAP', 'BETWEEN CARS']], [8500, ['ENGINE AHEAD', 'KILL >']]],
});
