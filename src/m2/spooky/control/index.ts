// THE CONTROL ROOM AND THE GIFT SHOP: section 7 of Spooky Land. Up out of hell on the lava geyser, he bursts into the
// control room: a fat balding guy at the PA mic (Donnie: he was the Dracula voice the whole time). Donnie panics, grabs
// a cheap wig, a cape (a DONNIE name tag on it) and plastic fangs, "how did you get in here", and runs out the door.
// Meathead chases him through the hellish gift shop and into the tacky ballroom (the boss: the ballroom section).
//
// Indoors (no time of day). The reveal and the chase are cutscene-ish: HUD hidden from frame one, all-or-nothing skip
// (offerSkip/takeSkip/drawSkipPrompt), SNES framing. Donnie's lines: full clean / shitty / naked pools, every group
// the same size (boss lines by player state). Donnie Dracula is drawn fully (as detailed as Safari Artie), not crude.
//
// PLACEHOLDER (the skeleton's crude first pass): the control room's floor and its sign, the gift shop's floor and its
// sign, the way on (the ballroom's door) at the right end, the way back (down to hell) at the left. Owned with the
// ballroom (see ../OWNERSHIP.md).

import type { SpookySection } from '../section';
import { layOwn, endWalls, endExits, runExits, wallSign, doorway, groundBox, box } from '../section';
import { SECTIONS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

const { x0, x1 } = SECTIONS.control;
const SHOP_X = x0 + 1500;

export const control: SpookySection = {
  id: 'control', x0, x1,
  checkpoints: [
    { name: 'THE CONTROL ROOM', cp: 60, x: x0 + 200, y: GY },
    { name: 'THE GIFT SHOP', cp: 61, x: SHOP_X + 200, y: GY },
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'tile' }]);
    endWalls(state, 'control');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('control'));
    return controls;
  },
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#18181B'); return true; },
  drawBack: (c) => {
    box(c, x0, GY - 400, SHOP_X - x0, 400, '#27272A');
    box(c, SHOP_X, GY - 400, x1 - SHOP_X, 400, '#4C0519');
    // (the PA desk, crude)
    box(c, x0 + 700, GY - 70, 240, 70, '#3F3F46');
    box(c, x0 + 720, GY - 130, 100, 60, '#0EA5E9');
    groundBox(c, x0 - 200, x1 + 200, GY, '#3F3F46', '#A1A1AA');
    wallSign(c, x0 + 400, GY - 260, 'CONTROL ROOM', '#27272A', '#FDE047');
    wallSign(c, SHOP_X + 500, GY - 260, 'GIFT SHOP OF THE DAMNED', '#7F1D1D', '#FEF08A');
    doorway(c, x0 + 40, GY, 'HELL');
    doorway(c, x1 - 60, GY, 'BALLROOM');
  },
};
