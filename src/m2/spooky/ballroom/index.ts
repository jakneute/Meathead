// THE BALLROOM: section 8 of Spooky Land, the boss. A tacky ballroom (the theme park's idea of a vampire's), Donnie
// Dracula's arena: the fat balding guy from the control room in his cheap wig, cape (DONNIE on its name tag) and
// plastic fangs. Dracula, legally: only Bram Stoker's novel and generic vampire tropes; never Universal's, Lugosi's,
// Hammer's or Castlevania's specific looks.
//
// The fight's mechanics are TBD: build the arena, Donnie's full character art (as detailed as Safari Artie's, every
// pose the fight might want: idle, talk, run, hurt, dying), his intro, and a placeholder fight (simple, winnable,
// easy to replace). Boss rules: big health + ammo refill before the boss door; boss lines by player state (full
// clean / shitty / naked pools for every line group, intro to death); undignified death; the walk-away after.
//
// PLACEHOLDER (the skeleton's crude first pass): the ballroom's floor and walls, a chandelier, the way back (to the gift
// shop) at the left end. No way on (it's the end of the land). Owned with the control room (see ../OWNERSHIP.md).

import type { SpookySection } from '../section';
import { layOwn, endWalls, endExits, runExits, wallSign, doorway, groundBox, box } from '../section';
import { SECTIONS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

const { x0, x1 } = SECTIONS.ballroom;

export const ballroom: SpookySection = {
  id: 'ballroom', x0, x1,
  checkpoints: [
    { name: 'THE BALLROOM DOOR', cp: 70, x: x0 + 200, y: GY },
    { name: 'DONNIE DRACULA', cp: 71, x: x0 + 900, y: GY, clear: [900, 2200] },
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'parquet' }]);
    endWalls(state, 'ballroom');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('ballroom'));
    return controls;
  },
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#3B0764'); return true; },
  drawBack: (c) => {
    box(c, x0, GY - 500, x1 - x0, 500, '#581C87');
    for (let x = x0 + 300; x < x1; x += 600) box(c, x, GY - 500, 24, 500, '#FACC15');
    // (the chandelier, crude)
    box(c, x0 + 1440, GY - 500, 6, 120, '#A16207');
    box(c, x0 + 1380, GY - 380, 126, 24, '#FDE047');
    groundBox(c, x0 - 200, x1 + 200, GY, '#78350F', '#F59E0B');
    wallSign(c, x0 + 600, GY - 300, 'GRAND BALLROOM', '#3B0764', '#FDE047');
    doorway(c, x0 + 40, GY, 'GIFT SHOP');
  },
};
