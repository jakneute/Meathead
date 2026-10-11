// THE RIDE: section 3 of Space Land (owner: the atom agent). The hijacked train (like Adventure Land's mine cart, not
// the same): the ride's PA (a cheesy upbeat 1990 corporate narrator, never updated) tells him what 2010 will bring, all
// of it wrong and over-optimistic (flying cars, meal pills, the paperless office, robot butlers, the Soviet moon base,
// a fax in every pocket...). Space-themed obstacles to jump and dodge. He hits a power breaker: the lights come up, the
// smoke and mirrors are gone, it's a cheap warehouse. He crashes into the brake controls; pulling back into the station
// he rams the car in front, sending its riders and him flying out of the giant atom and back out over the main drag
// (they're a grotesque smear; he's fine): on to the drag section's start.
//
// Target: ~14000 px of riding, ~2.5 min. Checkpoints 20-29. Indoors (the lights-up reveal is the ride's own lighting).
// One-way set piece: give the way back a sane answer (say, walking back left from the drag puts him at the atom's
// end) or note it.

import type { SpaceSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.ride;

export const ride: SpaceSection = {
  id: 'ride', x0, x1,
  checkpoints: [{ name: 'THE RIDE', cp: 20, x: DOORS.ride.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'metal' }]);
    endWalls(state, 'ride');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('ride'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { flat: '#05050F', far: '#312E81' }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#1F2937', '#6B7280');
    postSign(c, x0 + 600, GY, 'THE RIDE: PLACEHOLDER');
    postSign(c, x1 - 400, GY, 'THIS WAY');
  },
};
