// THE TOWN: section 1 of Spooky Land. A gothic Victorian town square that tries hard to look the part, with the modern
// conveniences showing through (an ATM in a crypt, vending machines, a Wi-Fi sign on the gallows...). Wildlife out to
// kill him on the way: bats (of course there's bats), and park staff in cheap classic-monster costumes (generic,
// theme-park takes: a flatheaded stitched-up monster in platform boots, a toilet-paper mummy, a rented-fur wolfman,
// a witch, a skeleton bodysuit, a bedsheet ghost, an Igor, a vampire bride; mixed people under them). The haunted
// kiddie rides along the way (Meathead mocks them in passing, and wants the ELEVATOR TO HELL, the clock tower ride in
// the far background). At the end, a long flight of stairs up, the sign at the bottom: DRACULA'S OTHER CASTLE; at the
// top, the castle's door (on into the castle section).
//
// Outdoors: follows the time of day (timeOfDay.ts), gloomy as it likes, but it reads the hour.
//
// PLACEHOLDER (the skeleton's crude first pass): flat ground, the stairs as a slope up to a landing, crude signs, a
// far-off clock tower in the backdrop, the castle door at the top (walk into it). Owner: see ../OWNERSHIP.md.

import type { SpookySection } from '../section';
import { layOwn, endWalls, endExits, runExits, postSign, doorway, groundBox, box } from '../section';
import { SECTIONS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

const { x0, x1 } = SECTIONS.town;
/** The stairs up to the castle: where they start and end, and how high the landing at the top is. */
const STAIRS_X0 = x0 + 9200, STAIRS_X1 = x0 + 11000, TOP = GY - 600;

export const town: SpookySection = {
  id: 'town', x0, x1,
  checkpoints: [
    { name: 'THE TOWN SQUARE', cp: 0, x: x0 + 200, y: GY },
    { name: 'THE CASTLE STAIRS', cp: 1, x: x0 + 8800, y: GY },
  ],
  build: (state) => {
    layOwn(state, [
      { x1: x0 - 200, y1: GY, x2: STAIRS_X0, y2: GY, surface: 'cobbles' },
      { x1: STAIRS_X0, y1: GY, x2: STAIRS_X1, y2: TOP, surface: 'stairs', steps: { n: 40 } },
      { x1: STAIRS_X1, y1: TOP, x2: x1 + 40, y2: TOP, surface: 'stone' },
    ]);
    endWalls(state, 'town');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('town'));
    return controls;
  },
  drawBackdrop: (c) => {
    box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#1E1036');
    // (the ELEVATOR TO HELL's clock tower, far off in the background)
    box(c, 560, 90, 90, 420, '#2A1B45');
    box(c, 585, 120, 40, 40, '#D9C98A');
    box(c, 603, 124, 4, 18, '#1E1036');
    box(c, 548, 70, 114, 24, '#3B2A5C');
    return true;
  },
  drawBack: (c) => {
    groundBox(c, x0 - 200, STAIRS_X0, GY, '#3F3A4A', '#8B85A0');
    // (the stairs, stepped, crude)
    const n = 40, dx = (STAIRS_X1 - STAIRS_X0) / n, dy = (GY - TOP) / n;
    for (let i = 0; i < n; i++) { box(c, STAIRS_X0 + i * dx, GY - (i + 1) * dy, dx + 1, (i + 1) * dy + 400, '#4A4458'); box(c, STAIRS_X0 + i * dx, GY - (i + 1) * dy, dx + 1, 3, '#8B85A0'); }
    groundBox(c, STAIRS_X1, x1, TOP, '#4A4458', '#8B85A0');
    postSign(c, x0 + 400, GY, 'SPOOKY LAND');
    postSign(c, x0 + 2200, GY, 'TOWN SQUARE');
    postSign(c, x0 + 5200, GY, 'HAUNTED KIDDIE RIDES');
    postSign(c, STAIRS_X0 - 150, GY, "DRACULA'S OTHER CASTLE");
    doorway(c, x1 - 60, TOP, 'CASTLE');
  },
  outdoors: () => 1,
};
