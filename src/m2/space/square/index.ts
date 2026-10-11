// THE SQUARE: section 1 of Space Land (owner: the outdoors agent). Walking in through a tacky, retro-futurist
// 'Futureland' street square (the future as imagined in 1962, still loading): chrome, fins, googie roofs, atomic
// starbursts, rocket-shaped trash cans, monorail pylons. Outdoor platforming (mobility plus offense), teach then
// escalate, themed new M2 enemies (Futureland's costumed staff and whatever else fits). Over it all, ahead the whole
// way: the giant atom (a building shaped like one: a parody of EPCOT's narrated future rides and Space Mountain, never
// their names or looks). At the end, the giant atom's doors: in, to the atom section's start.
//
// Target: ~10000 px of play, ~2 min. Checkpoints 0-9. Outdoors: the time of day's light (timeOfDay.ts).

import type { SpaceSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop } from '../section';
import { SECTIONS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.square;

export const square: SpaceSection = {
  id: 'square', x0, x1,
  checkpoints: [{ name: 'FUTURELAND SQUARE', cp: 0, x: x0 + 150, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'square');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('square'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { sky: ['#1E3A8A', '#3B82F6', '#93C5FD', '#E0F2FE'], far: '#6366F1' }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#64748B', '#CBD5E1');
    postSign(c, x0 + 600, GY, 'FUTURELAND: PLACEHOLDER');
    postSign(c, x1 - 400, GY, 'THIS WAY');
  },
  outdoors: () => 1,
};
