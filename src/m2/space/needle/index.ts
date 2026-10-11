// THE NEEDLE: section 5 of Space Land (owner: the needle agent). Space Needle 2, up into actual outer space. Meathead
// finds it boring: all it does is spin slowly. A stylish cylinder rotation (the engine's cylinder: the Section's
// cylinder hook; the user wants this one pretty and stylish NOW, not crude), a start point and an end point. No threats.
// On the far left a 'real' astronaut suit; on the far right a window to crash through: without the suit, he and
// everyone inside get sucked out into the vacuum and die (a special death animation); with it, they all still get
// sucked out, but he lives: on to the orbit section's start.
//
// Target: ~4000 px (mostly the cylinder), ~1 min. Checkpoints 40-49. Indoors; out the window is space.

import type { SpaceSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.needle;

export const needle: SpaceSection = {
  id: 'needle', x0, x1,
  checkpoints: [{ name: 'SPACE NEEDLE 2', cp: 40, x: DOORS.needle.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'metal' }]);
    endWalls(state, 'needle');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('needle'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { flat: '#0B1026', far: '#1E293B', stars: true }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#334155', '#94A3B8');
    postSign(c, x0 + 600, GY, 'SPACE NEEDLE 2: PLACEHOLDER');
    postSign(c, x1 - 400, GY, 'THIS WAY');
  },
};
