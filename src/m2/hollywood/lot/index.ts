// THE LOT: section 4 of Hollywood Land (owner: the outdoors agent). Out of the warehouse onto the studio backlot (where
// nothing's been filmed in decades): another Hollywood-themed outdoor platforming stretch. Facade streets (a New York
// street that's one plank deep, a Western town, a fake suburb), soundstage doors, a water tower, the old studio-tour
// attractions done badly, franchise fatigue (knock-off banners, absurd sequel numbers, COMING SOON for old things,
// Revengers merch carts), exit-through-the-gift-shop. The stunt wires again, escalated past the blvd's. Stuntman
// Steve's fliers and standees thicker here. At its end, the doors of DISASTER: THE RIDE.
//
// Target: ~9000 px of play, ~1.8 min. Checkpoints 30-39. Outdoors: the time of day's light.
//
// Revisits differ: once the real disasters are on (disaster's lever), the lot shows the weather (wind, ash, puddles)
// even before havoc's own stretch.

import type { HollywoodSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop, steveFlier } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.lot;

export const lot: HollywoodSection = {
  id: 'lot', x0, x1,
  checkpoints: [{ name: 'THE BACKLOT', cp: 30, x: DOORS.lot.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'lot');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('lot'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { sky: ['#1E3A8A', '#3B82F6', '#93C5FD', '#FDE68A'], far: '#A8A29E', hill: true }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#57534E', '#D6D3D1');
    postSign(c, x0 + 600, GY, 'THE BACKLOT: PLACEHOLDER');
    steveFlier(c, x0 + 1500, GY - 60, 'standee');
    steveFlier(c, x0 + 4200, GY - 140, 'poster');
    steveFlier(c, x0 + 7000, GY - 120, 'flier', 2);
    postSign(c, x1 - 400, GY, 'DISASTER: THE RIDE THIS WAY');
  },
  outdoors: () => 1,
  wires: () => [],
};
