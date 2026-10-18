// THE DIRT-BIKE CHASE: section 6 of Wilderness Land, the TEENAGERS sub-boss (a later job's; the skeleton's stand-in for
// now). The user's design (frontier-spec.md, verbatim there): made to look like Road Rash on the Genesis, not Mode 7,
// with the effects Genesis games used to fake a turning road. X / left click (shoot) attacks left, B / right click
// (charge) attacks right, A jumps. Trees, cows and other wildlife by the roadside to bail into (heavy damage, a quick
// respawn; it only kills him low on health). The teens have weapons; instead of stealing them, he PARRIES: attack as
// they swing and they're done (grab the bike chain, swing the teen over his head and toss him forward: a little human
// bomb ahead of him; a couple more funny punch parries). Sub-boss rules: both sides locked once it's on, never respawned
// once past, the refill before it, clean / shitty / naked pools for every line group.
//
// Checkpoints 50-59. Way back: the left end to the woods.

import { stubSection } from '../stub';

export const dirtbike = stubSection({
  id: 'dirtbike', cp: 50, name: 'TEENAGERS',
  sign: ['DIRT TRAIL', 'NO MOTOR VEHICLES (LOL)'],
  soon: ['THE TEENAGERS', 'A GENESIS ROAD RACER', 'X LEFT  B RIGHT  A JUMP', 'PUNCH PARRIES'],
  ground: ['#6B4A2A', '#8A6A3A'],
});
