// THE STAIRS DOWN: from the arch at the end of the castle's gallery, a long stone stairway down into the dungeon, four
// flights and their landings, 1000 down, and darker all the way: the sconces fewer and further apart, then out, till
// it's black but for right round him (and what's down there with him: its eyes, the glow on it). On the way down: bats
// off the ceiling, a skeleton lurking on a landing, an igor at the bottom, eyes in the dark. The PA narrates it
// (ominous, and stupid); Meathead can't see shit. At the bottom, the dungeon's cells.
// Back up them later: the staff have been round and lit every sconce (and left a note).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GroundRun } from '../../../m1/game/core/terrain';
import type { Light } from '../../../m1/game/render/lighting';
import { box, wallSign, meatheadSays } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnStaff } from '../castle/staff';
import { paStory, paBusy, byPants, pick } from '../castle/pa';
import * as L from './lines';

const S = SECTIONS.dungeon.x0;
/** Where the cells start (the foot of the stairs). */
export const CELLS = S + 1950;
export const STAIR_TOP = GY - 1000;
/** The stairway's line, his feet's: the top landing, then flight, landing, flight... down to the cells' floor. */
const PTS: [number, number][] = [
  // (from the section's own start: a run reaching back past it would be a solid block in the castle's way)
  [S, STAIR_TOP], [S + 200, STAIR_TOP], [S + 550, STAIR_TOP + 250], [S + 650, STAIR_TOP + 250], [S + 1000, STAIR_TOP + 500],
  [S + 1150, STAIR_TOP + 500], [S + 1500, STAIR_TOP + 750], [S + 1600, STAIR_TOP + 750], [CELLS, GY],
];
export const stairRuns = (): GroundRun[] => PTS.slice(1).map((b, i) => ({ x1: PTS[i][0], y1: PTS[i][1], x2: b[0], y2: b[1], surface: 'hard' }));
const floorAt = (x: number) => {
  for (let i = 1; i < PTS.length; i++) if (x <= PTS[i][0]) { const [ax, ay] = PTS[i - 1], [bx, by] = PTS[i]; return ay + (by - ay) * Math.max(0, Math.min(1, (x - ax) / (bx - ax))); }
  return GY;
};
/** The tunnel's height over the steps. */
const HEAD = 300;
/** The sconces down it (fewer and further apart as it goes); the first so many lit, the rest burnt out. */
const SCONCES = [S + 60, S + 280, S + 560, S + 900, S + 1320, S + 1760];
const LIT = 4;
/** Eyes in the dark (only on the way down, first time). */
const EYES: [number, number][] = [[S + 1220, STAIR_TOP + 360], [S + 1430, STAIR_TOP + 560], [S + 1700, STAIR_TOP + 700], [S + 1860, GY - 190]];

/** Been down them (the way back up's lit); kept across his deaths, fresh from the start of the land. */
let descended = false, told = 0, saidDark = 0;
export const resetStairs = (state: GameState) => { if (state.checkpoint < 10) { descended = false; told = 0; saidDark = 0; } };
export const initStairs = (state: GameState) => { if (state.checkpoint >= 21) { descended = true; told = 2; saidDark = 2; } };

export const buildStairs = (state: GameState) => {
  spawnStaff(state, 'bat', S + 720, STAIR_TOP + 120, 71); spawnStaff(state, 'bat', S + 1320, STAIR_TOP + 430, 72);
  // (the skeleton lurking on the second landing, the igor at the foot)
  spawnStaff(state, 'skeleton', S + 1080, STAIR_TOP + 500, 73);
  spawnStaff(state, 'igor', S + 1560, STAIR_TOP + 750, 74);
};

export const runStairs = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  if (cx < S || cx > CELLS + 100) return;
  // The PA's narration (two lines: at the top, and halfway down)
  if (told === 0 && cx > S + 260) { told = 1; paStory(state, [byPants(state, L.PA_STAIRS)[0]]); }
  if (told === 1 && cx > S + 1100) { told = 2; paStory(state, [byPants(state, L.PA_STAIRS)[1]]); }
  // Meathead, in the dark (one at a time, when the PA's quiet)
  if (saidDark === 0 && cx > S + 1250 && !paBusy(state)) { saidDark = 1; meatheadSays(state, pick(L.MH_DARK)); }
  if (saidDark === 1 && cx > S + 1700 && !paBusy(state)) { saidDark = 2; meatheadSays(state, pick(L.MH_EYES)); }
  if (cx >= CELLS) descended = true;
};

/** How dark it is where he is (0 the top, 1 the bottom), going down the first time. */
const depth = (state: GameState) => { const p = state.player, cx = p.pos.x + p.width / 2; return Math.max(0, Math.min(1, (cx - S) / (CELLS - S))); };

export const stairsLighting = (state: GameState) => {
  const p = state.player, k = descended ? 0.2 : depth(state), lights: Light[] = [];
  SCONCES.forEach((x, i) => { if (descended || i < LIT) lights.push({ x, y: floorAt(x) - 170, r: 230, a: 0.85, color: 'rgba(249, 115, 22, 0.10)' }); });
  // (right round him: smaller the deeper he goes)
  lights.push({ x: p.pos.x + p.width / 2, y: p.pos.y + 30, r: 190 - 70 * k, a: 0.7 });
  // (whatever's down here with him glows a little: no hitting him out of the black)
  for (const e of state.enemies) if (e.health > 0 && e.pos.x > S - 100 && e.pos.x < CELLS + 100) lights.push({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2, r: 70, a: 0.55, color: 'rgba(248, 113, 113, 0.12)' });
  if (!descended) for (const [x, y] of EYES) lights.push({ x, y, r: 14, a: 0.9, color: 'rgba(250, 204, 21, 0.3)' });
  return { dark: 0.5 + 0.43 * k, shade: [10, 6, 6] as [number, number, number], lights };
};

// ---------------------------------------------------------------------------------------------------------------

const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + 900;
export const drawStairs = (c: CanvasRenderingContext2D, state: GameState) => {
  if (!seen(state, S, CELLS)) return;
  const f = state.frame;
  // The rock it's cut through, and the tunnel down it (stone blocks)
  box(c, S, STAIR_TOP - HEAD - 200, CELLS - S, GY - STAIR_TOP + HEAD + 600, '#0A0807');
  c.fillStyle = '#26221F'; c.beginPath(); c.moveTo(PTS[0][0], PTS[0][1] - HEAD);
  for (const [x, y] of PTS) c.lineTo(x, y - HEAD);
  for (let i = PTS.length - 1; i >= 0; i--) c.lineTo(PTS[i][0], PTS[i][1]);
  c.closePath(); c.fill();
  for (let x = S; x < CELLS; x += 80) if (seen(state, x, x + 80)) { const fl = floorAt(x + 40); for (let y = fl - HEAD + 20; y < fl - 30; y += 44) box(c, x + ((y / 44) % 2 ? 0 : 20), y, 72, 38, '#2E2925'); }
  // The steps: the flights in steps (each one's tread lit), the landings flat (lit along the top), the rock under them
  for (let i = 1; i < PTS.length; i++) {
    const [ax, ay] = PTS[i - 1], [bx, by] = PTS[i];
    if (!seen(state, ax, bx)) continue;
    if (ay === by) { box(c, ax, ay, bx - ax, 60, '#3A3430'); box(c, ax, ay, bx - ax, 4, '#A8A29E'); continue; }
    const n = Math.round((bx - ax) / 25);
    for (let k = 0; k < n; k++) { const x = ax + (bx - ax) * k / n, y = ay + (by - ay) * (k + 0.5) / n; box(c, x, y, (bx - ax) / n + 1, 60, '#3A3430'); box(c, x, y, (bx - ax) / n + 1, 3, '#A8A29E'); }
  }
  // The sconces: lit ones, and the burnt-out ones (a wisp of smoke off them)
  SCONCES.forEach((x, i) => {
    if (!seen(state, x - 20, x + 20)) return;
    const y = floorAt(x) - 170;
    box(c, x - 8, y + 16, 16, 4, '#57534E'); box(c, x - 2, y + 4, 4, 14, '#57534E');
    if (descended || i < LIT) { box(c, x - 6, y - 12 - ((f + x) % 7 < 3 ? 2 : 0), 12, 16, '#F97316'); box(c, x - 3, y - 6, 6, 8, '#FDE047'); }
    else { box(c, x - 3, y - 2, 6, 6, '#1C1917'); if ((f + i * 20) % 60 < 30) box(c, x - 1, y - 12 - ((f + i * 20) % 30) * 0.4, 2, 6, '#57534E'); }
  });
  // Eyes in the dark (blinking)
  if (!descended) EYES.forEach(([x, y], i) => { if ((f + i * 53) % 170 < 160) { box(c, x - 6, y, 4, 3, '#FDE047'); box(c, x + 3, y, 4, 3, '#FDE047'); } });
  wallSign(c, S + 120, STAIR_TOP - 200, 'TO THE DUNGEON', '#27272A', '#FCA5A5');
  if (descended) wallSign(c, S + 340, STAIR_TOP - 190, 'SORRY ABOUT THE DARK. - MGMT', '#3F3F46', '#E4E4E7');
};
