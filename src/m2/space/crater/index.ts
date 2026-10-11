// THE CRATER: section 7 of Space Land (owner: the haunted-house agent). The UFO's impact site: many dead aliens,
// many more escaping. Then in to a 'space' haunted house (a parody of Alien Encounter, never its name or look): cheap
// animatronics pop out and go 'boo' (jumpscares, no threat) while real aliens fight him, complaining the attraction
// stereotypes aliens as violent invaders (they're violent invaders). On to the queen section's start.
//
// Target: ~12500 px of play, ~2.5 min. Checkpoints 60-69. The impact site is outdoors (the time of day's light,
// outdoors()); the haunted house indoors (return 0 from outdoors() there).

import type { SpaceSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.crater;

export const crater: SpaceSection = {
  id: 'crater', x0, x1,
  checkpoints: [{ name: 'THE IMPACT SITE', cp: 60, x: DOORS.crater.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'dirt' }]);
    endWalls(state, 'crater');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('crater'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { sky: ['#1E3A8A', '#3B82F6', '#93C5FD', '#E0F2FE'], far: '#57534E' }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#57534E', '#A8A29E');
    postSign(c, x0 + 600, GY, 'IMPACT SITE: PLACEHOLDER');
    postSign(c, x1 - 400, GY, 'THIS WAY');
  },
  outdoors: () => 1,
};
