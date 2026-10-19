// TRUELLING TRAGONS: section 4 of Fairy Land (job 4's to build; the skeleton's stand-in for now). The user's design
// (fantasy-spec.md, verbatim there): a parody of Dueling Dragons with three cars, not two: a FIRE car, an ICE car and a
// LIGHTNING car. No firing here; next / previous weapon (the mouse wheel, LB / RB) hops him between cars, with a little
// cooldown. The track goes away now and then and he has to hop to another car; sometimes only one car's safe to stand
// on; each car has its own obstacles. All three always shown (zoom in and out as needed), side view, readable in the
// chaos; a warning before every hole in his car's track.
//
// Checkpoints 30-39. Way back: the left end to the glen's end; on: its right end (the castle's base).

import { stubSection } from '../stub';

export const tragons = stubSection({
  id: 'tragons', cp: 30, name: 'TRUELLING TRAGONS',
  sign: ['TRUELLING TRAGONS', 'FIRE. ICE. LIGHTNING.'],
  soon: ['THREE COASTER CARS', 'NO FIRING', 'HOP CARS: NEXT / PREV WEAPON'],
});
