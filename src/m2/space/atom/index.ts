// THE ATOM: section 2 of Space Land (owner: the atom agent). Inside the giant atom: Meathead callously cuts through
// the backstage of a stylish dark ride (it looks like one in the background: the starfields, the neon, the
// smoke-and-mirrors sets), murdering stagehands (mixed people, seeded: see spooky/costume.ts) among space-specific
// obstacles. Then the queue: he cuts to the front of the line (the way he does on the Mayan ride in Adventure Land)
// and hijacks a train: on to the ride section's start.
//
// Target: ~7500 px of play, ~1.5 min. Checkpoints 10-19. Indoors (no time of day).

import type { SpaceSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.atom;

export const atom: SpaceSection = {
  id: 'atom', x0, x1,
  checkpoints: [{ name: 'THE GIANT ATOM', cp: 10, x: DOORS.atom.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'metal' }]);
    endWalls(state, 'atom');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('atom'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { flat: '#0F0A1E', far: '#1E1B4B' }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#27272A', '#A1A1AA');
    postSign(c, x0 + 600, GY, 'THE GIANT ATOM: PLACEHOLDER');
    postSign(c, x1 - 400, GY, 'THIS WAY');
  },
};
