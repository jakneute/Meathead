// THE CLOCK TOWER: section 5 of Spooky Land. Out of the red-mist hallway into the ELEVATOR TO HELL's loading bay: the
// ride operator won't let him on. How the ride works: riders are loaded into an elevator-shaped car on a track, it
// goes up the clock tower, then drops to a level below to a facsimile of hell (with a hell-themed gift shop right after).
// So he climbs the clock tower himself, clock-tower enemies and humans in spooky costumes (Monster Mash characters,
// mixed people under them) trying to stop him; the elevator going up alongside him (a background flourish). Support
// beams all the way up, to be charged into (shoulder charge, slide, uppercut, dive kick: not shot); each one broken,
// the tower wobbles more (Super Metroid's opening, Castlevania Bloodlines' leaning tower). With them all broken, at
// the top, the elevator drops so hard it blasts through the floor into the real hell; he's free to jump down after it
// from the top of the tower (into the hell section). Riders keep getting boarded and dropping into real hell after
// that too: nobody cares, and there's no end of elevator cars.
//
// The ride operator reacts to how he is (clean / shitty / naked). Clock-tower enemies are a new hurt source: hurt
// callouts and death lines.
//
// PLACEHOLDER (the skeleton's crude first pass): the loading bay's floor, then ledges up the tower 2400 high, then the
// top floor, the way on at its right end (feet at GY - 2400; the drop to hell, crude: walk into it). Owner: see
// ../OWNERSHIP.md.

import type { SpookySection } from '../section';
import { layOwn, ledge, endWalls, endExits, runExits, postSign, wallSign, doorway, groundBox, ledgeBox, box } from '../section';
import { SECTIONS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

const { x0, x1 } = SECTIONS.tower;
/** The tower: where its shaft is, how high the top floor is, each ledge's rise. */
const SHAFT_X0 = x0 + 1500, SHAFT_X1 = x0 + 2700, TOP = GY - 2400, RISE = 110;
const N = Math.round((GY - TOP) / RISE) - 1;
const LEDGES: [number, number, number][] = Array.from({ length: N }, (_, i) => {
  // (the top one on the right, against the top floor's edge: up onto it from there)
  const right = (N - 1 - i) % 2 === 0;
  return [right ? SHAFT_X0 + 550 : SHAFT_X0 + 100, GY - RISE * (i + 1), right ? SHAFT_X1 - SHAFT_X0 - 550 : 550];
});

export const tower: SpookySection = {
  id: 'tower', x0, x1,
  checkpoints: [
    { name: 'THE LOADING BAY', cp: 40, x: x0 + 200, y: GY },
    { name: 'THE CLOCK TOWER', cp: 41, x: SHAFT_X0 + 60, y: GY },
  ],
  build: (state) => {
    layOwn(state, [
      { x1: x0 - 200, y1: GY, x2: SHAFT_X1, y2: GY, surface: 'stone' },
      { x1: SHAFT_X1, y1: TOP, x2: x1 + 200, y2: TOP, surface: 'wood' },
    ]);
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w, { hidden: true });
    endWalls(state, 'tower');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('tower'));
    return controls;
  },
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0F172A'); return true; },
  drawBack: (c) => {
    box(c, SHAFT_X0 - 100, TOP - 400, x1 - SHAFT_X0 + 100, GY - TOP + 400, '#1E293B');
    groundBox(c, x0 - 200, SHAFT_X1, GY, '#334155', '#94A3B8');
    box(c, SHAFT_X1, TOP, x1 + 200 - SHAFT_X1, GY - TOP, '#334155');
    groundBox(c, SHAFT_X1, x1 + 200, TOP, '#3F2A14', '#A16207');
    for (const [x, y, w] of LEDGES) ledgeBox(c, x, y, w, '#3F2A14', '#CA8A04');
    postSign(c, x0 + 600, GY, 'ELEVATOR TO HELL', '#450A0A', '#FDBA74');
    wallSign(c, SHAFT_X0 + 600, GY - 300, 'CLOCK TOWER', '#1E293B', '#E2E8F0');
    doorway(c, x0 + 40, GY, 'HALLWAY');
    doorway(c, x1 - 60, TOP, 'DROP');
  },
};
