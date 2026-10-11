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
import { meatheadSays } from '../section';
import { INK, box, checker, plaque, rockFill, blockFill, stoneLedge, torch, STONE, IRON } from './paint';
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
  // (lit for the way back up once he's well into the dungeon, out of sight of them: the dark there never jumps)
  if (cx >= CELLS + 1200) descended = true;
  if (cx < S || cx > CELLS + 100) return;
  // The PA's narration (two lines: at the top, and halfway down)
  if (told === 0 && cx > S + 260) { told = 1; paStory(state, [byPants(state, L.PA_STAIRS)[0]]); }
  if (told === 1 && cx > S + 1100) { told = 2; paStory(state, [byPants(state, L.PA_STAIRS)[1]]); }
  // Meathead, in the dark (one at a time, when the PA's quiet)
  if (saidDark === 0 && cx > S + 1250 && !paBusy(state)) { saidDark = 1; meatheadSays(state, pick(L.MH_DARK)); }
  if (saidDark === 1 && cx > S + 1700 && !paBusy(state)) { saidDark = 2; meatheadSays(state, pick(L.MH_EYES)); }
};

/** How dark it is where he is (0 the top, 1 the bottom), going down the first time. */
const depth = (state: GameState) => { const p = state.player, cx = p.pos.x + p.width / 2; return Math.max(0, Math.min(1, (cx - S) / (CELLS - S))); };

/** The stairs' dark (as if he were at `at`, if given: the dungeon fades out of the foot of them). */
export const stairsLighting = (state: GameState, at?: number) => {
  const p = state.player, k = descended ? 0.2 : at !== undefined ? Math.max(0, Math.min(1, (at - S) / (CELLS - S))) : depth(state), lights: Light[] = [];
  SCONCES.forEach((x, i) => { if (descended || i < LIT) lights.push({ x, y: floorAt(x) - 170, r: 230, a: 0.85, color: 'rgba(249, 115, 22, 0.10)' }); });
  // (right round him: smaller the deeper he goes)
  lights.push({ x: p.pos.x + p.width / 2, y: p.pos.y + 30, r: 190 - 70 * k, a: 0.7 });
  // (whatever's down here with him glows a little: no hitting him out of the black)
  for (const e of state.enemies) if (e.health > 0 && e.pos.x > S - 100 && e.pos.x < CELLS + 100) lights.push({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2, r: 70, a: 0.55, color: 'rgba(248, 113, 113, 0.12)' });
  if (!descended) for (const [x, y] of EYES) lights.push({ x, y, r: 14, a: 0.9, color: 'rgba(250, 204, 21, 0.3)' });
  return { dark: 0.5 + 0.43 * k, shade: [10, 6, 6] as [number, number, number], lights };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (the final pass: paint.ts). The dark itself is the lighting's (stairsLighting); every tread's nosing is lit
// so the way down still reads in it.

const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + 900;
const tunnel = (c: CanvasRenderingContext2D) => {
  c.beginPath(); c.moveTo(PTS[0][0], PTS[0][1] - HEAD);
  for (const [x, y] of PTS) c.lineTo(x, y - HEAD);
  for (let i = PTS.length - 1; i >= 0; i--) c.lineTo(PTS[i][0], PTS[i][1]);
  c.closePath();
};
export const drawStairs = (c: CanvasRenderingContext2D, state: GameState) => {
  if (!seen(state, S, CELLS)) return;
  const f = state.frame, a = Math.max(S, state.camera.x - 40), b = Math.min(CELLS, state.camera.x + 900);
  const top = STAIR_TOP - HEAD - 200, bot = GY + 400;
  // The rock it's cut through
  c.fillStyle = rockFill(c); c.fillRect(a, top, b - a, bot - top);
  // The tunnel down it: dressed stone, darker toward its roof; its roof's edge in shadow
  c.save(); tunnel(c); c.clip();
  c.fillStyle = blockFill(c, 'stairs', '#322C27'); c.fillRect(a, top, b - a, bot - top);
  c.restore();
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(PTS[0][0], PTS[0][1] - HEAD); for (const [x, y] of PTS) c.lineTo(x, y - HEAD); c.stroke();
  c.strokeStyle = STONE[0]; c.lineWidth = 2; c.beginPath(); c.moveTo(PTS[0][0], PTS[0][1] - HEAD + 5); for (const [x, y] of PTS) c.lineTo(x, y - HEAD + 5); c.stroke();
  // The steps: each tread's nosing lit (somewhere to put his feet), its riser in shade; the landings flat, lit along
  // the top; worn hollows in the middle of each
  for (let i = 1; i < PTS.length; i++) {
    const [ax, ay] = PTS[i - 1], [bx, by] = PTS[i];
    if (!seen(state, ax, bx)) continue;
    if (ay === by) { stoneLedge(c, ax, ay, bx - ax, '#57504A'); box(c, ax, ay + 16, bx - ax, 44, STONE[0]); continue; }
    const n = Math.round((bx - ax) / 25), sw = (bx - ax) / n;
    for (let k = 0; k < n; k++) {
      const x = Math.round(ax + sw * k), y = Math.round(ay + (by - ay) * (k + 0.5) / n), w = Math.round(sw) + 1;
      box(c, x, y, w, 60, STONE[1]); box(c, x + w - 3, y, 3, 60, STONE[0]);
      box(c, x, y, w, 2, STONE[4]); box(c, x, y + 2, w, 2, STONE[3]); checker(c, x, y + 4, w, 2, STONE[2]);
      box(c, x + 6, y + 1, w - 12, 1, STONE[2]);
    }
  }
  // (a skull on the second landing, for the look of it)
  { const x = S + 1110, y = STAIR_TOP + 500; if (seen(state, x - 20, x + 20)) { box(c, x - 1, y - 13, 16, 13, INK); box(c, x, y - 12, 14, 12, '#C8C2B4'); box(c, x, y - 12, 4, 12, '#E2DDD0'); box(c, x + 3, y - 8, 3, 3, INK); box(c, x + 8, y - 8, 3, 3, INK); box(c, x + 4, y - 3, 6, 2, INK); } }
  // The sconces: lit ones (torches), and the burnt-out ones (a wisp of smoke off them)
  SCONCES.forEach((x, i) => {
    if (!seen(state, x - 20, x + 20)) return;
    const y = floorAt(x) - 166;
    if (descended || i < LIT) torch(c, x, y, f);
    else {
      box(c, x - 6, y, 12, 6, INK); box(c, x - 5, y + 1, 10, 4, IRON[2]); box(c, x - 3, y + 2, 6, 24, INK); box(c, x - 2, y + 2, 4, 22, '#2A1A10');
      box(c, x - 3, y - 4, 6, 6, '#1C1917'); box(c, x - 2, y - 4, 2, 2, '#3A2A20');
      if ((f + i * 20) % 60 < 30) box(c, x - 1 + (((f + i * 20) >> 3) % 2), y - 12 - ((f + i * 20) % 30) * 0.4, 2, 4, '#4A4440');
    }
  });
  // Eyes in the dark (blinking)
  if (!descended) EYES.forEach(([x, y], i) => { if ((f + i * 53) % 170 < 160) { box(c, x - 6, y, 4, 3, '#FDE047'); box(c, x + 3, y, 4, 3, '#FDE047'); box(c, x - 5, y + 1, 1, 1, INK); box(c, x + 4, y + 1, 1, 1, INK); } });
  plaque(c, S + 120, STAIR_TOP - 200, 'TO THE DUNGEON');
  if (descended) plaque(c, S + 250, STAIR_TOP - 130, 'SORRY ABOUT THE DARK. - MGMT', '#3F3F46', '#E4E4E7');
};
