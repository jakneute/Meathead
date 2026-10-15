// DISASTER: THE RIDE: section 5 of Hollywood Land (owner: the disaster agent). A lame-ass ride: he stands in a room in
// front of a video screen while disasters play and the room shakes, cools, warms up to match. The narrator loops:
// "HERE'S AN EARTHQUAKE." (the room shakes, lightly) "HERE'S A VOLCANO." (marginally warmer) "HERE'S A TORNADO." (fans
// on) "HERE'S A BLIZZARD." (the AC up a bit). In this section, another control booth with another sleeping cast
// member, another lever: REAL DISASTERS (EXPERIMENTAL). Flipped: actual catastrophe (the room's effects go real for a
// beat, the walls go, and out the far side it's havoc's start). Some fighting on the way in (the ride's staff, the
// queue; what fits) so it isn't only a cutscene.
//
// Target: ~6000 px of play, ~1.2 min. Checkpoints 40-49. Indoors.
//
// Revisits differ: the lever stays on REAL; the room's wrecked (the screen cracked, the fans torn off, frost and
// scorch on the walls); the narrator still loops, now over the real thing.

import type { HollywoodSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop, steveFlier } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.disaster;

export const disaster: HollywoodSection = {
  id: 'disaster', x0, x1,
  checkpoints: [{ name: 'DISASTER: THE RIDE', cp: 40, x: DOORS.disaster.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'disaster');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('disaster'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { flat: '#0C0A09', far: '#44403C' }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#292524', '#78716C');
    postSign(c, x0 + 600, GY, 'DISASTER: THE RIDE: PLACEHOLDER');
    steveFlier(c, x0 + 1500, GY - 140, 'flier', 1);
    postSign(c, x0 + 3500, GY, 'REAL DISASTERS (EXPERIMENTAL)');
    postSign(c, x1 - 400, GY, 'THIS WAY');
  },
};
