// THE DUNGEON: section 3 of Spooky Land, the last stop of the castle's ghost tour. A room with a spiked ceiling that
// drops (Silent Hill 3's, only here it actually hurts him): the PA (Donnie as Dracula) has his story about it. The
// spiked ceiling is a new hurt source: voiced hurt callouts and death lines for it (registerHurtLines, kinds.ts). On
// out the far end into the red-mist hallway.
//
// Indoors (no time of day). Owned with the castle (see ../OWNERSHIP.md).
//
// PLACEHOLDER (the skeleton's crude first pass): a flat stone floor, a crude ceiling up over it (no spikes yet), the
// way on at the right end, the way back to the castle at the left.

import type { SpookySection } from '../section';
import { layOwn, endWalls, endExits, runExits, wallSign, doorway, groundBox, box } from '../section';
import { SECTIONS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

const { x0, x1 } = SECTIONS.dungeon;

export const dungeon: SpookySection = {
  id: 'dungeon', x0, x1,
  checkpoints: [
    { name: 'THE DUNGEON', cp: 20, x: x0 + 200, y: GY },
    { name: 'THE SPIKED CEILING', cp: 21, x: x0 + 1200, y: GY },
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'stone' }]);
    endWalls(state, 'dungeon');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('dungeon'));
    return controls;
  },
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#141414'); return true; },
  drawBack: (c) => {
    box(c, x0, GY - 420, x1 - x0, 420, '#262626');
    // (the ceiling, crude: where the spikes will hang)
    box(c, x0 + 1000, GY - 420, 1800, 40, '#525252');
    for (let x = x0 + 1000; x < x0 + 2800; x += 30) box(c, x + 10, GY - 380, 10, 20, '#A3A3A3');
    groundBox(c, x0 - 200, x1 + 200, GY, '#3F3F46', '#A1A1AA');
    wallSign(c, x0 + 600, GY - 260, 'THE DUNGEON', '#27272A', '#FCA5A5');
    doorway(c, x0 + 40, GY, 'CASTLE');
    doorway(c, x1 - 60, GY, 'HALLWAY');
  },
};
