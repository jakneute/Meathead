// THE DRAG: section 4 of Space Land (owner: the outdoors agent). Landing on the main drag (launched out of the giant
// atom with the smear of the car in front), then outdoor platforming on down Futureland's main drag, up to Space
// Needle 2 (a parody of the Space Needle that goes way higher: into actual space), its base and lift at the end: on to
// the needle section's start.
//
// Target: ~7500 px of play, ~1.5 min. Checkpoints 30-39. Outdoors: the time of day's light (timeOfDay.ts).

import type { SpaceSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.drag;

export const drag: SpaceSection = {
  id: 'drag', x0, x1,
  checkpoints: [{ name: 'THE MAIN DRAG', cp: 30, x: DOORS.drag.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'drag');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('drag'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { sky: ['#1E3A8A', '#3B82F6', '#93C5FD', '#E0F2FE'], far: '#7C3AED' }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#475569', '#E2E8F0');
    postSign(c, x0 + 600, GY, 'THE MAIN DRAG: PLACEHOLDER');
    postSign(c, x1 - 400, GY, 'THIS WAY');
  },
  outdoors: () => 1,
};
