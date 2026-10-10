// THE CASTLE: section 2 of Spooky Land, DRACULA'S OTHER CASTLE. In through the door at the top of the stairs, and a PA
// greets him: Dracula (it's Donnie, the fat balding guy in the control room, doing a pompous fake-Transylvanian voice
// over his Jersey one; never revealed here), a real pretentious prick spouting spooky insidious stuff: survive the
// ordeals and you might gain an audience with him. Then a ghost tour (Silent Hill 3's haunted manor, as a theme-park
// walkthrough): a run of absurdly spacious rooms, the dining room, the study, the kitchen, the bedroom and a few
// more, and in each the PA's spooky but stupid story of the unfortunate circumstances that happened there. Threats in
// every room (costumed park staff among them: Monster Mash characters, mixed people under them). On into the dungeon.
//
// Indoors (no time of day). PA lines: full clean / shitty / naked pools, every group the same size.
//
// PLACEHOLDER (the skeleton's crude first pass): one long flat floor, each room's name on a plaque on the wall, the
// way on at the right end (walk into it), the way back out to the stairs at the left. Owner: see ../OWNERSHIP.md.

import type { SpookySection } from '../section';
import { layOwn, endWalls, endExits, runExits, wallSign, doorway, groundBox, box } from '../section';
import { SECTIONS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

const { x0, x1 } = SECTIONS.castle;
const ROOMS: [x: number, name: string][] = [[0, 'THE FOYER'], [1500, 'THE DINING ROOM'], [3500, 'THE STUDY'], [5500, 'THE KITCHEN'], [7500, 'THE BEDROOM'], [9500, 'THE NURSERY']];

export const castle: SpookySection = {
  id: 'castle', x0, x1,
  checkpoints: [
    { name: 'THE CASTLE FOYER', cp: 10, x: x0 + 200, y: GY },
    { name: 'THE BEDROOM', cp: 11, x: x0 + 7600, y: GY },
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'carpet' }]);
    endWalls(state, 'castle');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('castle'));
    return controls;
  },
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#2B0F14'); return true; },
  drawBack: (c) => {
    // (the rooms' walls, alternating, a pillar between each)
    ROOMS.forEach(([rx, name], i) => {
      const a = x0 + rx, b = i + 1 < ROOMS.length ? x0 + ROOMS[i + 1][0] : x1;
      box(c, a, GY - 600, b - a, 600, i % 2 ? '#3A1820' : '#44202A');
      box(c, a, GY - 600, 40, 600, '#1C0A0E');
      wallSign(c, a + 300, GY - 320, name, '#4A0E0E', '#FDE68A');
    });
    groundBox(c, x0 - 200, x1 + 200, GY, '#5A1A1A', '#B45353');
    doorway(c, x0 + 40, GY, 'OUT');
    doorway(c, x1 - 60, GY, 'DUNGEON');
  },
};
