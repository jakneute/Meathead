// THE RED MIST HALLWAY: section 4 of Spooky Land, the end of the castle. A hallway with a weird red mist chasing him
// (straight out of Silent Hill 3's: the user's own exception to the no-reference rule). If it reaches him it kills him
// outright: his organs turn inside out and he becomes liquid shit (a special death animation; voiced death lines for
// it). Gotta go fast. Long, winding and vertical. At its end, out into the ELEVATOR TO HELL's loading bay (the
// tower section).
//
// Indoors (no time of day).
//
// PLACEHOLDER (the skeleton's crude first pass): a stretch of floor, then switchback ledges climbing 1500 up (the
// winding vertical part, rough), then a long top corridor to the way on at its right end (feet at GY - 1500). No mist
// yet. Owner: see ../OWNERSHIP.md.

import type { SpookySection } from '../section';
import { layOwn, ledge, endWalls, endExits, runExits, wallSign, doorway, groundBox, ledgeBox, box } from '../section';
import { SECTIONS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

const { x0, x1 } = SECTIONS.mist;
/** The climb: where it is, how high it goes (the top corridor's floor), each ledge's rise. */
const CLIMB_X0 = x0 + 1600, CLIMB_X1 = x0 + 2800, TOP = GY - 1500, RISE = 110;
/** The switchback ledges: [x, y, w] (alternating sides, overlapping a little in the middle). */
const N = Math.round((GY - TOP) / RISE) - 1;
const LEDGES: [number, number, number][] = Array.from({ length: N }, (_, i) => {
  // (the top one on the right, against the top floor's edge: up onto it from there)
  const right = (N - 1 - i) % 2 === 0;
  return [right ? CLIMB_X0 + 550 : CLIMB_X0 + 100, GY - RISE * (i + 1), right ? CLIMB_X1 - CLIMB_X0 - 550 : 550];
});

export const mist: SpookySection = {
  id: 'mist', x0, x1,
  checkpoints: [
    { name: 'THE RED MIST HALLWAY', cp: 30, x: x0 + 200, y: GY },
    { name: 'THE TOP OF THE HALLWAY', cp: 31, x: CLIMB_X1 + 200, y: TOP },
  ],
  build: (state) => {
    layOwn(state, [
      { x1: x0 - 200, y1: GY, x2: CLIMB_X1, y2: GY, surface: 'stone' },
      { x1: CLIMB_X1, y1: TOP, x2: x1 + 200, y2: TOP, surface: 'stone' },
    ]);
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w, { hidden: true });
    endWalls(state, 'mist');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('mist'));
    return controls;
  },
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#1A0606'); return true; },
  drawBack: (c) => {
    box(c, x0, TOP - 500, x1 - x0, GY - TOP + 500, '#2A0C0C');
    groundBox(c, x0 - 200, CLIMB_X1, GY, '#3B1414', '#B45353');
    box(c, CLIMB_X1, TOP, x1 + 200 - CLIMB_X1, GY - TOP, '#3B1414');
    groundBox(c, CLIMB_X1, x1 + 200, TOP, '#3B1414', '#B45353');
    for (const [x, y, w] of LEDGES) ledgeBox(c, x, y, w, '#4A1A1A', '#D97777');
    wallSign(c, x0 + 600, GY - 260, 'EMERGENCY EXIT', '#7F1D1D', '#FECACA');
    doorway(c, x0 + 40, GY, 'DUNGEON');
    doorway(c, x1 - 60, TOP, 'LOADING BAY');
  },
};
