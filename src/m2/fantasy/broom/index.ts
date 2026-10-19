// THE BROOMSTICK DEATHMATCH: section 6 of Fairy Land, the final trial (job 6's to build; the skeleton's stand-in for
// now). The user's design (fantasy-spec.md, verbatim there): he hops on a broomstick into a "free range" arena,
// mode-7 style trickery, behind the back (as the Road Rash chase: frontier/dirtbike/). Y / alternate fire toggles
// inverted up/down; X fires. Fly round and kill all the other suitors. All dead: he flies into the castle's highest
// window (monument.ts PIPER_WINDOW), a rapid zoom in, a fancy SHATTERING GLASS effect, then outside the great pixie's
// bedroom (the next section).
//
// Checkpoints 50-59. Way back: the left end to the runway (DOORS.keep.end); on: its right end (the bedroom).

import { stubSection } from '../stub';

export const broom = stubSection({
  id: 'broom', cp: 50, name: 'BROOMSTICK DEATHMATCH',
  sign: ['BROOMSTICK DEATHMATCH', 'TRIAL THREE'],
  soon: ['BEHIND THE BACK', 'FLY. KILL EVERY SUITOR.', 'IN THROUGH THE TOP WINDOW'],
});
