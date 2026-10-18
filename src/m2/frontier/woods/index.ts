// THE WOODS: section 5 of Wilderness Land (a later job's; the skeleton's stand-in for now). Out of the woodchipper and
// into real woods, outside the park's bounds (the land's turn: "Wilderness Land" ends up in the ACTUAL wilderness; a
// busted perimeter fence, a PARK PROPERTY ENDS sign). Kids on dirt bikes riding around. The user's design: Meathead
// callously kicks a teenager off his bike: "MINE". Right after, Tucker (extra bloodied) pops out of a leaf pile,
// knocks another rider off and hijacks his bike, apologizes, and makes the teens an offer: "20 BUCKS FOR THE FIRST ONE TO
// GIVE ME THAT MEATHEAD'S HEAD". They happily oblige: on into the dirt-bike chase.
//
// Checkpoints 40-49. Way back: the left end to the log ride's river bank (before the woodchipper).

import { stubSection } from '../stub';

export const woods = stubSection({
  id: 'woods', cp: 40, name: 'THE WOODS',
  sign: ['PARK PROPERTY ENDS', 'NOT OUR PROBLEM PAST HERE'],
  soon: ['REAL WOODS', 'KIDS ON DIRT BIKES', '"MINE."', 'TUCKER IN THE LEAF PILE', '$20 FOR HIS HEAD'],
  ground: ['#4A3420', '#6B8A3A'],
});
