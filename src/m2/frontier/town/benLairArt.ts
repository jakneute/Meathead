// The flooded shaft lit up, and Ben's way and his lair under it, drawn (benLair.ts has the why).
//
// THE FLOODED SHAFT (the owner's "illuminate the dark underwater section"): the old tour's underwater floodlights still
// burning on the bed (squat caged lamps on iron stands, lenses up, a cold cyan-white beam up off each, in bands), so the
// long swim reads; its water a step lighter (paint.ts SUMP, ground.ts's front tint); still murky, still a mine.
// THE WINZE: in the bed at the swim's east end (under the open water): a timber-lined hole, its collar's lip lit, a warm
// light coming up out of it, a plank nailed to the far wall over it (ASSAY OFFICE, an arrow down).
// THE MAZE: the rock under the bed in cross section, the cells and their joins cut in it (the flooded rock's back wall
// behind them in teal bands, inked round, every floor's lip lit: he can stand on them), a caged work light in each cell's
// ceiling, Ben's spray paint (NOPE) in the dead ends.
// THE ASSAY OFFICE: the 1880s office the park dug out for the tour, flooded and forgotten, turned gym-bro hideout: the
// timber sets and plank lagging, the plank floor (its lip lit), the gilt ASSAY OFFICE board over the old counter and
// its brass scales, a cot with a wool blanket, the lantern on its hook over it, an ore cart on a stub of track for a
// plate rack (spare cart wheels stood in it for plates), a pickaxe-handle barbell with a cart wheel each end on a
// rail-tie bench, an anvil (his dumbbell) on a stump, the dud dynamite stacked against the west wall (DUD
// chalked on it: the trial's target), the ore chute up over the cannon, the pool at its east end (the step under its
// west lip lit); drips off the ceiling.
//
// The still art's stamped once in tiles (the town's still(): per hour); the live bits (the beams' shimmer, the drips, the
// lantern, the pool's ripple, the dynamite's jolt) are a few rects a frame.

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { SKIP_AFTER, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { drawBen, benHeadY, drawBenGross, drawBenGrossBack, drawGate, drawCannonChain, gateK } from '../../upgrades/confucktious';
import { drawCannon, WILDERNESS } from '../../upgrades/returnCannon';
import { signText } from '../../signLetters';
import { saidOver } from '../section';
import { type Ctx, box, checker, mix, hash, still, INK, TIMBER, BRASS, IRON, RED, PLANK, STONE, STEEL, MINE, CREAM, GREEN, BLACK, western, signPaint } from './paint';
import { paintRock, lantern } from './mine';
import { X, Y } from './layout';
import { onScreen } from './view';
import {
  lairOf, inLair, underBed, inSump, MAZE_OPEN, MAZE, CELLS, JOINS, NOPES, cellBox, WINZE, ROOM, POOL, CHUTE, TNT, BEN_RX, HATCH_X,
  CELL_Y, OFFICE_DX, UNDER_BOT, TNT_GONE,
} from './benLair';

const MAZE_TOP = MAZE.top;
/** The maze's openings (world boxes), worked out once. */
const OPEN_BOXES = MAZE_OPEN();

const W = (rx: number) => X(rx);
/** The office's own art, where it was first laid out, drawn where it is now (benLair.ts OFFICE_DX). */
const O = (rx: number) => X(rx + OFFICE_DX);
/** The work lamps along the long tunnels between cells (world: x, y of the bulb; `wall`: on a shaft's west wall, not
 *  up in a ceiling), one in the rock gap of each join. */
const JOIN_LAMPS = JOINS.map(([c1, r1, c2, r2]) => {
  const A = cellBox(c1, r1), B = cellBox(c2, r2);
  if (r1 === r2) { const a = Math.min(A.b, B.b), b = Math.max(A.a, B.a); return { x: X((a + b) / 2), y: Y(A.top) + 3, wall: false }; }
  // (the middle of the shaft between the two: halfway from the upper one's floor to the lower one's ceiling)
  return { x: X(A.a) + 3, y: Y((A.bot + B.top) / 2) - 6, wall: true };
});
/** The maze's lights round him (the cells' lamps and the tunnels'), cold. */
const mazeLights = (state: GameState, cx: number, cy: number): Light[] => {
  const out: Light[] = [];
  for (const [c, r] of CELLS) { const b = cellBox(c, r), x = W(b.a) + 50, y = Y(b.top) + 30; if (Math.abs(x - cx) < 700 && Math.abs(y - cy) < 560) out.push({ x, y, r: 95, a: 0.6, color: 'rgba(160, 230, 255, 0.12)' }); }
  for (const l of JOIN_LAMPS) if (Math.abs(l.x - cx) < 700 && Math.abs(l.y - cy) < 560) out.push({ x: l.x + (l.wall ? 20 : 0), y: l.y + (l.wall ? 0 : 26), r: 90, a: 0.55, color: 'rgba(160, 230, 255, 0.12)' });
  void state;
  return out;
};
const FL = () => Y(ROOM.floor);
/** The floodlights on the flooded shaft's bed (x from the section's start). */
const FLOODS = [13160, 13430, 13690, 13960, 14220];
/** The teal of the flooded rock's back wall, in bands (darkest at the walls). */
const FLOOD = ['#04121A', '#08202A', '#0C2C36', '#123A44', '#1A4A52', '#26605E'];
/** Wool blanket, the cot's canvas. */
const WOOL = ['#2A0E0E', '#4A1818', '#6E2422', '#8E3A30', '#B05A44'];
const CANVAS = ['#3A3424', '#5A5238', '#7A704E', '#9A9068', '#BCB28A'];

const seenBox = (state: GameState, x0: number, x1: number, y0: number, y1: number) => {
  const cx = state.camera.x, cy = state.camera.y;
  return x1 > cx - 300 && x0 < cx + CANVAS_WIDTH + 300 && y1 > cy - 300 && y0 < cy + CANVAS_HEIGHT + 300;
};

// ---------------------------------------------------------------------------------------------------------------
// The rock under the bed, the maze cut in it (still: in tiles)

/** The under-bed region (world): from the bed down past the pool's foot, the office's west wall to past the winze. */
const UA = X(12400), UB = X(14760), UT = Y(-886), UBOT = Y(UNDER_BOT + 40), TILE = 416;
/** The rock drawn over it all from up in the flooded shaft (from under the winze down): plain, no cavities. */
const VT = Y(-890);

/** A cavity's back wall: the flooded rock seen through the water, teal in bands anchored to the world (each cell's row
 *  the same: lighter up under its lamp, darker going down), dithered between, the back wall's courses faint. */
const floodBack = (g: Ctx, x: number, y: number, w: number, h: number, y0 = Y(MAZE_TOP)) => {
  const n = 5, BH = 28;
  for (let yy = y; yy < y + h; ) {
    const off = (((yy - y0) % CELL_Y) + CELL_Y) % CELL_Y, k = Math.min(4, Math.floor(off / BH)), next = Math.min(y + h, yy + BH - (off % BH));
    box(g, x, yy, w, next - yy, FLOOD[Math.max(1, n - k)]);
    if (k > 0 && off % BH === 0) checker(g, x, yy, w, 2, FLOOD[Math.max(1, n - k + 1)], k & 1);
    yy = next;
  }
  for (let yy = Math.ceil(y / 26) * 26; yy < y + h; yy += 26) for (let xx = Math.floor(x / 40) * 40 + ((yy / 26) % 2 ? 20 : 0); xx < x + w; xx += 40) {
    const a = Math.max(x, xx), b = Math.min(x + w, xx + 38);
    if (b > a) box(g, a, yy, b - a, 1, mix(FLOOD[3], '#5AA0A0', 0.18));
  }
};

const paintUnder = (g: Ctx, x0: number, y0: number, w: number, h: number) => {
  paintRock(g, x0, w, y0, h);
  const all = MAZE_OPEN(), open = all.filter(o => o.x < x0 + w + 4 && o.x + o.w > x0 - 4 && o.y < y0 + h + 4 && o.y + o.h > y0 - 4);
  const inOpen = (x: number, y: number) => all.some(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
  const R = MINE;
  // (ink round every opening, then each floor's lit lip under it (where it's rock under), then the insides: the joins'
  // insides open the walls between cells)
  for (const o of open) box(g, o.x - 2, o.y - 2, o.w + 4, o.h + 4, INK);
  for (const o of open) for (let x = o.x - 2; x < o.x + o.w + 2; x += 2) if (!inOpen(x, o.y + o.h + 3)) { box(g, x, o.y + o.h, 2, 2, R[6]); box(g, x, o.y + o.h + 2, 2, 2, R[5]); if ((x >> 1) & 1) box(g, x, o.y + o.h + 4, 2, 2, R[4]); }
  for (const o of open) floodBack(g, o.x, o.y, o.w, o.h);
  // (where an opening meets rock: the ceiling's underside shaded, chipped; the walls' faces a step darker; silt and
  // stones along the floors)
  for (const o of open) {
    for (let x = o.x; x < o.x + o.w; x += 2) {
      if (!inOpen(x, o.y - 3)) { box(g, x, o.y, 2, 3, FLOOD[0]); if (hash(x * 1.7 + o.y) > 0.7) box(g, x, o.y + 3, 2, 2, FLOOD[0]); }
      if (!inOpen(x, o.y + o.h + 3)) { box(g, x, o.y + o.h - 3, 2, 3, mix(FLOOD[4], '#6A6A52', 0.4)); if (hash(x * 2.3 + o.y) > 0.82) box(g, x, o.y + o.h - 5, 3, 2, mix(FLOOD[5], '#8A8A6A', 0.4)); }
    }
    for (let y = o.y; y < o.y + o.h; y += 2) {
      if (!inOpen(o.x - 3, y)) box(g, o.x, y, 3, 2, FLOOD[1]);
      if (!inOpen(o.x + o.w + 3, y)) box(g, o.x + o.w - 3, y, 3, 2, FLOOD[1]);
    }
  }
  // (a caged work light up in each cell's ceiling: its bulb, its wire cage, a bracket)
  for (const [c, r] of CELLS) {
    const b = cellBox(c, r), lx = W(b.a) + 50 + Math.round((hash(c * 7 + r) - 0.5) * 40), ly = Y(b.top) + 3;
    if (lx < x0 - 20 || lx > x0 + w + 20 || ly < y0 - 20 || ly > y0 + h + 20) continue;
    box(g, lx - 1, ly - 1, 2, 4, INK);
    box(g, lx - 6, ly + 3, 12, 9, INK);
    box(g, lx - 5, ly + 4, 10, 7, '#BDEFFF'); box(g, lx - 5, ly + 4, 4, 3, '#F2FCFF');
    for (let k = -4; k <= 4; k += 3) box(g, lx + k, ly + 4, 1, 7, STEEL[2]);
    box(g, lx - 6, ly + 7, 12, 1, STEEL[2]);
  }
  // (the long tunnels' own lamps: one up in each crossway's ceiling, one on each shaft's west wall on a bracket)
  for (const l of JOIN_LAMPS) {
    if (l.x < x0 - 20 || l.x > x0 + w + 20 || l.y < y0 - 20 || l.y > y0 + h + 20) continue;
    const lx = l.wall ? l.x + 10 : l.x, ly = l.y;
    if (l.wall) { box(g, l.x - 1, ly + 4, 10, 2, INK); box(g, l.x, ly + 4, 8, 1, STEEL[3]); } else box(g, lx - 1, ly - 1, 2, 4, INK);
    box(g, lx - 6, ly + 3, 12, 9, INK);
    box(g, lx - 5, ly + 4, 10, 7, '#BDEFFF'); box(g, lx - 5, ly + 4, 4, 3, '#F2FCFF');
    for (let k = -4; k <= 4; k += 3) box(g, lx + k, ly + 4, 1, 7, STEEL[2]);
    box(g, lx - 6, ly + 7, 12, 1, STEEL[2]);
  }
  // (Ben's spray paint in the dead ends: NOPE, dripping)
  g.font = '16px "Press Start 2P"'; g.textAlign = 'center';
  for (const [c, r] of NOPES) {
    const b = cellBox(c, r), nx = W(b.a) + 50, ny = Y(b.top) + 64;
    if (nx < x0 - 80 || nx > x0 + w + 80 || ny < y0 - 30 || ny > y0 + h + 30) continue;
    g.fillStyle = '#2A0606'; g.fillText('NOPE', nx + 2, ny + 2);
    g.fillStyle = '#E2505A'; g.fillText('NOPE', nx - 1, ny - 1);
    g.fillStyle = '#B8262E'; g.fillText('NOPE', nx, ny);
    for (const [dx, len] of [[-22, 7], [-4, 11], [14, 5], [26, 9]] as const) box(g, nx + dx, ny + 1, 2, len, '#B8262E');
  }
  g.textAlign = 'left';
};

/** The winze's lining down through the bed and its collar's lit lip (world; over the bed's own rock). */
const paintWinze = (g: Ctx) => {
  const a = W(WINZE.a), b = W(WINZE.b), t = Y(WINZE.top), bt = Y(WINZE.bot);
  const T = TIMBER;
  // (the hole: dark at its top going down to the warm light out of the maze; its timber lining either side)
  box(g, a - 2, t, b - a + 4, bt - t + 2, INK);
  for (let i = 0; i < 5; i++) box(g, a, t + i * 8, b - a, 9, mix('#1A120A', '#7A4A20', i / 5));
  checker(g, a, t + 16, b - a, 2, '#3A2410', 1);
  for (const x of [a - 10, b]) { box(g, x, t - 4, 10, bt - t + 6, INK); box(g, x + 1, t - 3, 8, bt - t + 4, T[3]); box(g, x + 1, t - 3, 2, bt - t + 4, T[5]); for (let y = t + 4; y < bt; y += 12) box(g, x + 4, y, 2, 2, IRON[4]); }
  // (the collar's sills along the bed either side, lit on top: stand on them)
  for (const [x, ww] of [[a - 30, 22], [b + 8, 14]] as const) { box(g, x, t - 5, ww, 6, INK); box(g, x + 1, t - 4, ww - 2, 4, T[4]); box(g, x + 1, t - 4, ww - 2, 1, T[6]); }
};

export const drawSumpBack = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(12400), X(14460))) return;
  const f = state.frame, bed = Y(-880);
  // ---- the floodlights on the bed: an iron stand, a squat caged lamp, its lens up; the beam up off it, banded
  for (const rx of FLOODS) {
    const x = W(rx);
    if (!onScreen(state, x - 80, x + 80)) continue;
    const sh = 0.5 + 0.5 * Math.sin(f * 0.05 + rx);
    // (the beam: three bands, wider and fainter going up)
    for (let k = 0; k < 3; k++) {
      c.globalAlpha = (0.09 - k * 0.025) * (0.85 + 0.15 * sh);
      c.fillStyle = '#CFF6FF';
      c.beginPath(); c.moveTo(x - 10 - k * 6, bed - 22); c.lineTo(x + 10 + k * 6, bed - 22); c.lineTo(x + 40 + k * 26, bed - 300); c.lineTo(x - 40 - k * 26, bed - 300); c.closePath(); c.fill();
    }
    c.globalAlpha = 1;
    box(c, x - 13, bed - 8, 26, 8, INK); box(c, x - 12, bed - 7, 24, 6, IRON[2]); box(c, x - 12, bed - 7, 24, 1, IRON[5]);
    box(c, x - 2, bed - 14, 4, 6, INK); box(c, x - 1, bed - 13, 2, 5, IRON[3]);
    box(c, x - 11, bed - 25, 22, 12, INK); box(c, x - 10, bed - 24, 20, 10, IRON[3]); box(c, x - 10, bed - 24, 20, 2, IRON[5]);
    box(c, x - 8, bed - 26, 16, 3, '#E6FBFF'); box(c, x - 8, bed - 26, 6, 1, '#FFFFFF');
    for (let k = -7; k <= 7; k += 4) box(c, x + k, bed - 27, 1, 4, STEEL[1]);
    // (a little grit drifting through its beam)
    for (let i = 0; i < 3; i++) { const u = ((f * 0.3 + i * 37 + rx) % 120) / 120; box(c, x - 20 + ((i * 17 + rx) % 40), bed - 40 - u * 220, 2, 2, `rgba(220,250,255,${(0.5 * (1 - u)).toFixed(2)})`); }
  }
  // ---- the winze (stamped), the plank over it, the warm light up out of it
  const a = W(WINZE.a), b = W(WINZE.b);
  if (onScreen(state, a - 80, b + 80)) {
    still(c, 'ben-winze', 0, 0, a - 32, Y(WINZE.top) - 8, b - a + 64, Y(WINZE.bot) - Y(WINZE.top) + 14, paintWinze);
    c.globalAlpha = 0.16 + 0.04 * Math.sin(f * 0.07); c.fillStyle = '#FFB86A';
    c.beginPath(); c.moveTo(a + 6, bed); c.lineTo(b - 6, bed); c.lineTo(b + 10, bed - 60); c.lineTo(a - 10, bed - 60); c.closePath(); c.fill();
    c.globalAlpha = 1;
    // (the plank nailed to the far shaft's wall over it: burned letters, an arrow down)
    const px = W(14420) - 2, py = bed - 74;
    box(c, px - 86, py - 1, 86, 26, INK); box(c, px - 85, py, 84, 24, PLANK[3]); box(c, px - 85, py, 84, 2, PLANK[5]); box(c, px - 85, py + 22, 84, 2, PLANK[1]);
    box(c, px - 82, py + 3, 2, 2, IRON[4]); box(c, px - 6, py + 3, 2, 2, IRON[4]);
    signText(c, 'ASSAY OFFICE', px - 43, py + 12, signPaint(1, '#1C1209', '#5E3818'));
    box(c, px - 46, py + 14, 6, 4, '#1C1209'); box(c, px - 48, py + 18, 10, 2, '#1C1209'); box(c, px - 45, py + 20, 4, 2, '#1C1209');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The assay office (still: two halves), its live bits

const paintRoom = (g: Ctx) => {
  const a = W(ROOM.a), b = W(ROOM.b), t = Y(ROOM.top), fl = FL(), T = TIMBER, P = PLANK;
  // ---- the back wall: plank lagging between timber sets, damp, darker going up
  box(g, a, t, b - a, fl - t, T[1]);
  for (let y = t + 8, i = 0; y < fl; y += 14, i++) {
    const col = y < t + 70 ? T[2] : y < t + 170 ? T[3] : T[4];
    box(g, a, y, b - a, 13, col); box(g, a, y, b - a, 1, mix(col, '#FFFFFF', 0.12)); box(g, a, y + 12, b - a, 1, T[0]);
    for (let x = a + (i % 2) * 40; x < b; x += 80) box(g, x, y, 1, 13, T[0]);
  }
  // (water stains down the lagging, the wet sheen)
  for (let k = 0; k < 9; k++) { const x = a + 40 + k * 86 + hash(k) * 30, len = 20 + hash(k * 3) * 50; box(g, x, t + 8, 5, len, mix(T[2], '#1A2A2A', 0.5)); checker(g, x - 2, t + 8 + len, 9, 4, mix(T[2], '#1A2A2A', 0.5), k & 1); }
  // (the sets: posts, a cap across the top of each pair)
  for (let x = a + 4; x < b - 20; x += 170) {
    box(g, x, t, 14, fl - t, INK); box(g, x + 1, t, 12, fl - t, T[4]); box(g, x + 1, t, 3, fl - t, T[6]); box(g, x + 10, t, 2, fl - t, T[2]);
    for (let y = t + 20; y < fl - 10; y += 60) box(g, x + 5, y, 3, 3, IRON[5]);
  }
  box(g, a, t, b - a, 16, INK); box(g, a, t + 1, b - a, 13, T[4]); box(g, a, t + 1, b - a, 3, T[6]); box(g, a, t + 12, b - a, 2, T[1]);
  paintDressWall(g);
  // ---- the ore chute up through the ceiling over the cannon: its timber lining, black up it
  const ca = W(CHUTE.a), cb = W(CHUTE.b);
  box(g, ca, Y(CHUTE.top), cb - ca, t - Y(CHUTE.top) + 16, '#050403');
  for (const x of [ca - 6, cb]) { box(g, x, Y(CHUTE.top), 6, t - Y(CHUTE.top) + 16, INK); box(g, x + 1, Y(CHUTE.top), 4, t - Y(CHUTE.top) + 16, T[3]); box(g, x + 1, Y(CHUTE.top), 1, t - Y(CHUTE.top) + 16, T[5]); }
  // ---- the gilt sign board over the counter
  const sx = O(13390), sy = t + 36;
  box(g, sx - 1, sy - 1, 172, 30, INK); box(g, sx, sy, 170, 28, '#120C08'); box(g, sx, sy, 170, 2, '#3A2A1A'); box(g, sx + 2, sy + 2, 166, 1, BRASS[3]); box(g, sx + 2, sy + 25, 166, 1, BRASS[2]);
  // ---- the cot along the back wall: canvas on a timber frame, the wool blanket, a lumpy pillow (a sack of feed)
  const kx = O(13330), ky = fl - 26;
  box(g, kx - 1, ky - 1, 132, 10, INK); box(g, kx, ky, 130, 8, CANVAS[2]); box(g, kx, ky, 130, 2, CANVAS[4]);
  for (const lx of [kx + 4, kx + 120]) { box(g, lx - 1, ky + 8, 6, 18, INK); box(g, lx, ky + 8, 4, 18, T[4]); }
  box(g, kx + 30, ky - 7, 100, 9, INK); box(g, kx + 31, ky - 6, 98, 8, WOOL[2]); box(g, kx + 31, ky - 6, 98, 2, WOOL[4]);
  for (let x = kx + 36; x < kx + 128; x += 12) box(g, x, ky - 6, 2, 8, WOOL[1]);
  box(g, kx + 1, ky - 10, 30, 11, INK); box(g, kx + 2, ky - 9, 28, 9, CANVAS[3]); box(g, kx + 2, ky - 9, 28, 2, CANVAS[4]);
  // (the counter end beside it: the old assay counter, its brass scales)
  const cx = O(13470);
  box(g, cx - 1, fl - 50, 62, 51, INK); box(g, cx, fl - 49, 60, 49, T[3]); box(g, cx, fl - 49, 60, 4, T[5]); box(g, cx, fl - 45, 60, 1, T[1]);
  for (let y = fl - 38; y < fl; y += 12) box(g, cx + 4, y, 52, 1, T[2]);
  // (the scales: a post, the beam, two pans on chains)
  const bx = cx + 30, by = fl - 82;
  box(g, bx - 1, by, 3, 32, BRASS[1]); box(g, bx - 1, by, 1, 32, BRASS[4]); box(g, bx - 6, fl - 52, 13, 3, BRASS[2]);
  box(g, bx - 22, by - 1, 45, 3, BRASS[3]); box(g, bx - 22, by - 1, 45, 1, BRASS[5]);
  for (const s of [-1, 1]) { const px = bx + s * 20; box(g, px, by + 2, 1, 14, BRASS[2]); box(g, px - 8, by + 16, 17, 3, INK); box(g, px - 7, by + 16, 15, 2, BRASS[4]); }
  // ---- the plate rack: an ore cart on a stub of track, cart wheels stood in it for plates
  box(g, O(13136), fl - 6, 70, 3, STEEL[2]); box(g, O(13136), fl - 6, 70, 1, STEEL[5]);
  for (let k = 0; k < 4; k++) box(g, O(13140) + k * 18, fl - 4, 10, 4, T[2]);
  for (const ox of [13140]) {
    const x = O(ox), y = fl - 46;
    box(g, x - 1, y - 1, 62, 36, INK);
    for (let i = 0; i < 4; i++) box(g, x + i * 15, y, 15, 34, IRON[4 - i] ?? IRON[1]);
    box(g, x, y, 60, 3, IRON[6]); for (let j = 6; j < 60; j += 12) box(g, x + j, y + 8, 2, 2, IRON[6]);
    for (const wx of [x + 12, x + 48]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, fl - 8, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = IRON[3]; g.beginPath(); g.arc(wx, fl - 8, 5, 0, Math.PI * 2); g.fill(); box(g, wx - 1, fl - 9, 2, 2, IRON[6]); }
    // (the wheels stood up in it for plates, their rims over its lip)
    for (let k = 0; k < 3; k++) { const wx = x + 14 + k * 16; g.fillStyle = INK; g.beginPath(); g.arc(wx, y - 4, 12, Math.PI, 0); g.fill(); g.fillStyle = STEEL[3]; g.beginPath(); g.arc(wx, y - 4, 10, Math.PI, 0); g.fill(); g.fillStyle = STEEL[5]; g.beginPath(); g.arc(wx - 2, y - 6, 6, Math.PI, Math.PI * 1.5); g.fill(); box(g, wx - 2, y - 7, 4, 4, INK); }
  }
  // ---- the pickaxe-handle barbell on a bench of rail ties, a cart wheel each end
  const hx = O(13262), hy = fl - 30;
  box(g, hx - 30, hy + 6, 60, 9, INK); box(g, hx - 29, hy + 7, 58, 7, T[3]); box(g, hx - 29, hy + 7, 58, 2, T[5]);
  for (const lx of [hx - 26, hx + 20]) { box(g, lx - 1, hy + 15, 8, 15, INK); box(g, lx, hy + 15, 6, 15, T[2]); }
  for (const s of [-1, 1]) { box(g, hx + s * 22 - 1, hy - 18, 3, 24, INK); box(g, hx + s * 22, hy - 18, 1, 24, T[5]); }
  box(g, hx - 50, hy - 21, 100, 5, INK); box(g, hx - 49, hy - 20, 98, 3, '#B8925A'); box(g, hx - 49, hy - 20, 98, 1, '#E2C48A');
  for (const s of [-1, 1]) {
    const wx = hx + s * 44;
    g.fillStyle = INK; g.beginPath(); g.ellipse(wx, hy - 18, 6, 17, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = IRON[3]; g.beginPath(); g.ellipse(wx, hy - 18, 4.5, 15, 0, 0, Math.PI * 2); g.fill();
    box(g, wx - 3, hy - 30, 2, 8, IRON[6]);
  }
  // ---- the anvil on its stump (his dumbbell: a rope handle knotted round its waist)
  const ax = O(13604);
  box(g, ax - 13, fl - 26, 26, 26, INK); box(g, ax - 12, fl - 25, 24, 25, T[4]); box(g, ax - 12, fl - 25, 24, 3, T[6]); for (let k = 0; k < 3; k++) box(g, ax - 10 + k * 8, fl - 20, 1, 18, T[2]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(ax - 24, fl - 42); g.lineTo(ax + 22, fl - 42); g.lineTo(ax + 16, fl - 36); g.lineTo(ax + 8, fl - 34); g.lineTo(ax + 10, fl - 26); g.lineTo(ax - 10, fl - 26); g.lineTo(ax - 8, fl - 34); g.lineTo(ax - 18, fl - 36); g.closePath(); g.fill();
  box(g, ax - 22, fl - 41, 42, 4, IRON[4]); box(g, ax - 22, fl - 41, 42, 1, IRON[6]); box(g, ax - 8, fl - 37, 16, 10, IRON[3]); box(g, ax - 8, fl - 37, 3, 10, IRON[5]);
  box(g, ax - 9, fl - 35, 18, 2, '#C8A456');
  paintDressFloor(g);
  // ---- the floor: old planks over the rock, its lip lit (stand on it), the rock's face under it to the pool
  const fa = a, fb = W(POOL.a);
  box(g, fa, fl, fb - fa, 2, INK); box(g, fa, fl + 1, fb - fa, 3, P[5]); box(g, fa, fl + 4, fb - fa, 2, P[4]); box(g, fa, fl + 6, fb - fa, 8, P[3]); box(g, fa, fl + 14, fb - fa, 2, P[1]);
  for (let x = fa; x < fb; x += 46) box(g, x, fl + 1, 1, 14, P[1]);
  // ---- the pool's stone kerb and its step (lit: stand on it), the far wall's rock over it
  const pa = W(POOL.a), pb = W(POOL.b), ps = Y(POOL.surface);
  box(g, pa - 6, fl, 8, Y(POOL.bot) - fl, INK); box(g, pa - 5, fl, 6, Y(POOL.bot) - fl, STONE[3]); box(g, pa - 5, fl, 2, Y(POOL.bot) - fl, STONE[5]);
  floodBack(g, pa, fl, pb - pa, Y(POOL.bot) - fl);
  box(g, pa, ps + 25, 46, 1, INK); box(g, pa, ps + 26, 46, 8, STONE[3]); box(g, pa, ps + 26, 46, 2, STONE[5]); box(g, pa, ps + 34, 46, 3, STONE[1]);
};
// ---- Ben's dressing (the owner: "make the details in bens lairs in general more....detailed"): on the lagging between
// the sets, a WANTED poster in his voice, a plank shelf of protein tubs (a candle stub burning on it, over the dynamite),
// his tool board (hammer, wrenches, a hacksaw, tin snips, a welding mask on a nail), a cowboy boot nailed up half
// plated in stolen tin badges with the weld scorch round it, his DIG DEEP poster under the gilt board, a chalk slate of
// tallies, the extension cord he's run down the chute, a towel on a nail, SHOWER over the pool; on the floor his mini
// fridge with a hot plate and a speckled coffee pot on it, a tub and a shaker by the bench, chalk dust, a pickaxe
// leaned on the last set. All background (dimmed a step, nothing lit along a top).

/** A paper poster nailed up: its face, a curl at one corner, four nails. */
const poster = (g: Ctx, x: number, y: number, w: number, h: number, face: string[]) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  box(g, x, y, w, h, face[4]); box(g, x, y, w, 2, face[5]); box(g, x, y + h - 3, w, 3, face[3]);
  checker(g, x, y + h - 10, w, 7, face[3], 1);
  // (the stains, the curled corner)
  for (let k = 0; k < 4; k++) box(g, x + 4 + hash(k * 3.1 + x) * (w - 12), y + 8 + hash(k * 7.3 + y) * (h - 20), 4, 3, face[3]);
  box(g, x + w - 7, y + h - 7, 7, 7, TIMBER[3]); box(g, x + w - 7, y + h - 7, 1, 7, face[2]); box(g, x + w - 7, y + h - 7, 7, 1, face[2]);
  g.fillStyle = face[5]; g.beginPath(); g.moveTo(x + w - 7, y + h - 7); g.lineTo(x + w - 1, y + h - 7); g.lineTo(x + w - 7, y + h - 1); g.closePath(); g.fill();
  for (const [nx, ny] of [[x + 2, y + 2], [x + w - 4, y + 2], [x + 2, y + h - 4]]) { box(g, nx, ny, 2, 2, IRON[5]); box(g, nx + 1, ny + 1, 1, 1, INK); }
};
/** A tub of protein: its banded drum, a lid, a label (WHEY / MASS), a scoop's handle over the rim on one. */
const tub = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], word: string) => {
  box(g, x - 1, y - 1, w + 2, h + 1, INK);
  for (let i = 0; i < 4; i++) box(g, x + (i * w) / 4, y + 3, w / 4 + 1, h - 3, R[5 - i]);
  box(g, x - 1, y - 2, w + 2, 5, INK); box(g, x, y - 1, w, 3, BLACK[4]); box(g, x, y - 1, w, 1, BLACK[6]);
  box(g, x + 2, y + 7, w - 4, h - 14, CREAM[5]); box(g, x + 2, y + 7, w - 4, 1, CREAM[6]);
  signText(g, word, x + w / 2, y + h / 2 + 1, signPaint(1, R[1], 'rgba(0,0,0,0)'));
};

const paintDressWall = (g: Ctx) => {
  const t = Y(ROOM.top), fl = FL();
  // ---- the WANTED poster (between the first two sets, over the dynamite)
  { const x = O(13064), y = t + 30, w = 66, h = 92;
    poster(g, x, y, w, h, CREAM);
    signText(g, 'WANTED', x + w / 2, y + 10, western(1, RED[2], CREAM[3]));
    // (his drawing: a flexed arm, the bicep up)
    const ax = x + 18, ay = y + 46;
    box(g, ax - 1, ay - 1, 30, 10, INK); box(g, ax, ay, 28, 8, '#C48A5E'); box(g, ax, ay, 28, 2, '#E0AE80');
    box(g, ax + 19, ay - 21, 10, 22, INK); box(g, ax + 20, ay - 20, 8, 21, '#C48A5E'); box(g, ax + 20, ay - 20, 3, 21, '#E0AE80');
    g.fillStyle = INK; g.beginPath(); g.ellipse(ax + 13, ay - 3, 10, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#C48A5E'; g.beginPath(); g.ellipse(ax + 13, ay - 3, 9, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#E0AE80'; g.beginPath(); g.ellipse(ax + 11, ay - 5, 5, 3, 0, 0, Math.PI * 2); g.fill();
    box(g, ax + 19, ay - 25, 10, 6, INK); box(g, ax + 20, ay - 24, 8, 4, '#B07850');
    signText(g, 'MORE REPS', x + w / 2, y + 64, signPaint(1, '#2A1A0C', 'rgba(0,0,0,0)'));
    signText(g, 'REWARD:', x + w / 2, y + 75, signPaint(1, '#2A1A0C', 'rgba(0,0,0,0)'));
    signText(g, 'GAINS', x + w / 2, y + 85, signPaint(1, RED[2], 'rgba(0,0,0,0)'));
  }
  // ---- the shelf: a plank on two iron brackets, three tubs and a coffee can of bolts on it, the candle stub at its end
  { const x = O(13136), y = t + 108, w = 72;
    for (const bx of [x + 8, x + w - 12]) { box(g, bx - 1, y + 4, 5, 16, INK); box(g, bx, y + 4, 3, 14, IRON[3]); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(bx + 2, y + 18); g.lineTo(bx + (bx < x + 30 ? 12 : -8), y + 5); g.stroke(); }
    box(g, x - 1, y - 1, w + 2, 7, INK); box(g, x, y, w, 5, PLANK[3]); box(g, x, y, w, 1, PLANK[4]); box(g, x, y + 4, w, 1, PLANK[1]);
    tub(g, x + 2, y - 30, 28, 30, RED, 'WHEY');
    tub(g, x + 32, y - 26, 28, 26, GREEN, 'MASS');
    // (the candle stub in its drips)
    box(g, x + 62, y - 10, 6, 10, INK); box(g, x + 63, y - 9, 4, 9, CREAM[5]); box(g, x + 63, y - 9, 1, 9, CREAM[6]);
    box(g, x + 60, y - 2, 10, 2, CREAM[4]); box(g, x + 64, y - 12, 1, 3, INK);
  }
  // ---- the tool board: a plank panel, the tools on nails (their outlines painted on, his one tidy habit)
  { const x = O(13232), y = t + 36, w = 74, h = 58;
    box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, PLANK[2]); for (let k = 0; k < h; k += 12) { box(g, x, y + k, w, 1, PLANK[1]); box(g, x, y + k + 1, w, 1, PLANK[3]); }
    // (the hammer)
    box(g, x + 8, y + 10, 3, 32, INK); box(g, x + 9, y + 11, 1, 30, PLANK[5]); box(g, x + 4, y + 7, 12, 6, INK); box(g, x + 5, y + 8, 10, 4, IRON[4]); box(g, x + 5, y + 8, 10, 1, IRON[6]);
    // (two wrenches)
    for (const [wx, l] of [[x + 22, 34], [x + 30, 28]] as const) { box(g, wx - 1, y + 8, 4, l, INK); box(g, wx, y + 9, 2, l - 2, STEEL[4]); box(g, wx - 3, y + 6, 8, 6, INK); box(g, wx - 2, y + 7, 6, 4, STEEL[5]); box(g, wx, y + 6, 2, 3, PLANK[2]); }
    // (the hacksaw: its bow, the blade)
    box(g, x + 40, y + 10, 26, 2, INK); box(g, x + 40, y + 10, 2, 16, INK); box(g, x + 64, y + 10, 2, 16, INK); box(g, x + 41, y + 24, 24, 2, STEEL[5]); for (let k = 0; k < 24; k += 3) box(g, x + 41 + k, y + 26, 1, 1, STEEL[3]);
    box(g, x + 38, y + 22, 5, 9, INK); box(g, x + 39, y + 23, 3, 7, RED[3]);
    // (the tin snips)
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 46, y + 34); g.lineTo(x + 56, y + 52); g.moveTo(x + 54, y + 34); g.lineTo(x + 46, y + 52); g.stroke();
    g.strokeStyle = STEEL[4]; g.lineWidth = 1; g.stroke();
    box(g, x + 44, y + 48, 5, 6, RED[3]); box(g, x + 54, y + 48, 5, 6, RED[3]);
    for (const [nx, ny] of [[x + 9, y + 8], [x + 23, y + 7], [x + 31, y + 7], [x + 53, y + 9]]) box(g, nx, ny, 2, 2, IRON[6]);
  }
  // ---- the welding mask on its nail
  { const x = O(13324), y = t + 48;
    box(g, x - 10, y, 20, 26, INK); box(g, x - 9, y + 1, 18, 24, BLACK[3]); box(g, x - 9, y + 1, 4, 24, BLACK[5]); box(g, x - 9, y + 1, 18, 2, BLACK[5]);
    box(g, x - 6, y + 8, 12, 6, INK); box(g, x - 5, y + 9, 10, 4, '#2E4A1E'); box(g, x - 5, y + 9, 3, 1, '#7AA05A');
    box(g, x - 1, y - 4, 2, 4, IRON[5]);
    for (const s of [-1, 1]) box(g, x + s * 10 - (s < 0 ? 2 : 0), y + 6, 2, 10, BLACK[2]);
  }
  // ---- the boot nailed up, half plated: its tin badges riveted on, the weld scorch round it
  { const x = O(13356), y = t + 46;
    for (let k = 0; k < 4; k++) { g.fillStyle = `rgba(10,6,2,${(0.22 + k * 0.08).toFixed(2)})`; g.beginPath(); g.ellipse(x + 2, y + 32, 26 - k * 5, 30 - k * 6, 0, 0, Math.PI * 2); g.fill(); }
    for (let k = 0; k < 14; k++) box(g, x - 20 + hash(k * 4.3) * 44, y + 6 + hash(k * 2.9) * 52, 1, 1, k % 3 ? BRASS[4] : '#FFF4C8');
    // (the boot: shaft up, toe right)
    box(g, x - 10, y + 2, 20, 40, INK); box(g, x - 9, y + 3, 18, 38, PLANK[2]); box(g, x - 9, y + 3, 4, 38, PLANK[4]);
    box(g, x - 10, y + 40, 34, 16, INK); box(g, x - 9, y + 41, 32, 14, PLANK[2]); box(g, x - 9, y + 41, 32, 2, PLANK[4]);
    box(g, x - 11, y + 54, 36, 4, INK); box(g, x - 10, y + 55, 34, 2, PLANK[1]); box(g, x - 6, y + 56, 8, 3, PLANK[0]);
    for (let k = 0; k < 6; k++) box(g, x - 7 + k * 3, y + 6, 1, 6, PLANK[1]);
    // (the badges: stars and a plate, riveted)
    const star = (sx: number, sy: number, r: number) => { g.fillStyle = INK; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r + 1; g.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } g.closePath(); g.fill(); g.fillStyle = STEEL[5]; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.4 : r; g.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } g.closePath(); g.fill(); box(g, sx - 1, sy - 1, 2, 2, STEEL[3]); };
    star(x, y + 16, 7); star(x + 2, y + 32, 7);
    box(g, x + 2, y + 42, 16, 10, INK); box(g, x + 3, y + 43, 14, 8, STEEL[4]); box(g, x + 3, y + 43, 14, 1, STEEL[6]); for (const rx2 of [x + 4, x + 15]) box(g, rx2, y + 46, 1, 1, INK);
    // (the bead along a seam: fresh, bright)
    for (let k = 0; k < 7; k++) box(g, x - 8 + k * 3, y + 25, 2, 2, k % 2 ? '#FFE8A0' : BRASS[4]);
    box(g, x - 1, y - 2, 2, 4, IRON[6]);
  }
  // ---- the chalk handprints on the lagging by the bar
  for (const [hx, hy] of [[O(13240), fl - 98], [O(13286), fl - 104], [O(13300), fl - 88]] as const) {
    g.fillStyle = 'rgba(236, 232, 220, 0.32)'; g.beginPath(); g.ellipse(hx, hy, 5, 6, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 4; k++) box(g, hx - 5 + k * 3, hy - 12 + Math.abs(k - 1.5) * 2, 2, 6, 'rgba(236, 232, 220, 0.28)');
    box(g, hx + 5, hy - 4, 4, 2, 'rgba(236, 232, 220, 0.28)');
  }
  // ---- DIG DEEP: his poster under the gilt board, a pickaxe crossed on a barbell
  { const x = O(13472), y = t + 74, w = 64, h = 74;
    poster(g, x, y, w, h, ['#2A1C10', '#4A3420', '#6E5032', '#B89868', '#D8C090', '#ECDCB0', '#FFF6D8']);
    signText(g, 'DIG DEEP', x + w / 2, y + 10, signPaint(1, '#3A1A0A', 'rgba(0,0,0,0)'));
    const cx = x + w / 2, cy = y + 38;
    box(g, cx - 22, cy - 1, 44, 3, INK); box(g, cx - 21, cy, 42, 1, STEEL[5]);
    for (const s of [-1, 1]) { box(g, cx + s * 20 - 3, cy - 9, 6, 19, INK); box(g, cx + s * 20 - 2, cy - 8, 4, 17, IRON[3]); }
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 14, cy + 14); g.lineTo(cx + 12, cy - 14); g.stroke(); g.strokeStyle = PLANK[4]; g.lineWidth = 2; g.stroke();
    g.fillStyle = INK; g.beginPath(); g.moveTo(cx + 2, cy - 22); g.quadraticCurveTo(cx + 14, cy - 16, cx + 22, cy - 4); g.lineTo(cx + 12, cy - 12); g.lineTo(cx + 2, cy - 18); g.closePath(); g.fill();
    g.fillStyle = IRON[5]; g.beginPath(); g.moveTo(cx + 4, cy - 20); g.quadraticCurveTo(cx + 14, cy - 15, cx + 19, cy - 7); g.lineTo(cx + 11, cy - 13); g.closePath(); g.fill();
    signText(g, 'LIFT', x + w / 2, y + 58, signPaint(1, '#3A1A0A', 'rgba(0,0,0,0)'));
    signText(g, 'HEAVY', x + w / 2, y + 67, signPaint(1, RED[2], 'rgba(0,0,0,0)'));
  }
  // ---- the chalk slate: REPS, his tallies, a stub of chalk on its ledge
  { const x = O(13574), y = t + 70, w = 50, h = 42;
    box(g, x - 3, y - 3, w + 6, h + 6, INK); box(g, x - 2, y - 2, w + 4, h + 4, PLANK[3]); box(g, x - 2, y - 2, w + 4, 1, PLANK[5]);
    box(g, x, y, w, h, '#1E2622'); checker(g, x, y + h - 8, w, 8, '#18201C', 0);
    signText(g, 'REPS', x + w / 2, y + 7, signPaint(1, '#D8D8CC', 'rgba(0,0,0,0)'));
    for (let row = 0; row < 3; row++) for (let k = 0; k < 2 + (row < 2 ? 1 : 0); k++) {
      const tx = x + 5 + k * 15, ty = y + 15 + row * 9;
      for (let j = 0; j < 4; j++) box(g, tx + j * 3, ty, 1, 7, 'rgba(220,220,208,0.85)');
      g.strokeStyle = 'rgba(220,220,208,0.85)'; g.lineWidth = 1; g.beginPath(); g.moveTo(tx - 1, ty + 6); g.lineTo(tx + 11, ty + 1); g.stroke();
    }
    box(g, x - 2, y + h + 2, w + 4, 3, INK); box(g, x - 1, y + h + 2, w + 2, 2, PLANK[4]); box(g, x + 30, y + h, 6, 2, '#ECEAE0');
    g.fillStyle = 'rgba(236,232,220,0.18)'; g.fillRect(x - 2, y + h + 5, w + 4, 6);
  }
  // ---- the towel on a nail between the chute and the last set
  { const x = O(13706), y = t + 118;
    box(g, x - 1, y - 3, 2, 4, IRON[6]);
    box(g, x - 9, y, 18, 40, INK); box(g, x - 8, y + 1, 16, 38, CREAM[5]); box(g, x - 8, y + 1, 4, 38, CREAM[6]); box(g, x + 4, y + 1, 4, 38, CREAM[4]);
    for (const yy of [y + 8, y + 30]) { box(g, x - 8, yy, 16, 2, RED[3]); }
  }
  // ---- SHOWER, over the pool: a plank nailed up, burned letters, an arrow down at the water
  { const x = O(13748), y = t + 96, w = 84, h = 22;
    box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, PLANK[3]); box(g, x, y, w, 2, PLANK[5]); box(g, x, y + h - 2, w, 2, PLANK[1]);
    box(g, x + 3, y + 3, 2, 2, IRON[5]); box(g, x + w - 5, y + 3, 2, 2, IRON[5]);
    signText(g, 'SHOWER', x + w / 2, y + 11, signPaint(1, '#1C1209', '#5E3818'));
    const ax = x + w / 2; box(g, ax - 2, y + h + 4, 4, 10, '#1C1209'); g.fillStyle = '#1C1209'; g.beginPath(); g.moveTo(ax - 7, y + h + 13); g.lineTo(ax + 7, y + h + 13); g.lineTo(ax, y + h + 20); g.closePath(); g.fill();
  }
  // ---- the extension cord: down out of the chute's lining, along the cap, down the set by the fridge
  { const ca = W(CHUTE.a), x0 = O(13380), y0 = t + 15;
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(ca - 4, y0 - 8); g.lineTo(ca - 8, y0 + 4); g.quadraticCurveTo((ca + x0) / 2, y0 + 16, x0 + 2, y0 + 4); g.lineTo(x0 + 2, fl - 76); g.quadraticCurveTo(x0 + 6, fl - 40, x0 + 36, fl - 46); g.stroke();
    g.strokeStyle = '#D8862A'; g.lineWidth = 2; g.stroke();
    for (let y = y0 + 30; y < fl - 70; y += 40) box(g, x0, y, 6, 2, IRON[5]);
  }
};

const paintDressFloor = (g: Ctx) => {
  const fl = FL();
  // ---- the mini fridge at the cot's foot (a dorm fridge, avocado, SNACK on tape: the snack shack's), the hot plate on
  // it, a speckled enamel coffee pot on that
  { const x = O(13418), w = 40, h = 52, y = fl - h;
    box(g, x - 1, y - 1, w + 2, h + 1, INK);
    const AV = ['#2A3010', '#3E4618', '#566024', '#6E7A32', '#8A9644', '#A6B25E', '#C4CE80'];
    for (let i = 0; i < 4; i++) box(g, x + (i * w) / 4, y, w / 4 + 1, h, AV[5 - i]);
    box(g, x, y, w, 2, AV[6]); box(g, x, y + 16, w, 2, AV[1]); box(g, x + w - 6, y + 22, 3, 16, AV[0]); box(g, x + w - 6, y + 22, 1, 16, AV[5]);
    box(g, x + 4, y + 26, 24, 8, '#E8DCB0'); signText(g, 'SNACK', x + 16, y + 30, signPaint(1, '#3A2A1A', 'rgba(0,0,0,0)'));
    box(g, x + 2, y + h - 4, w - 4, 4, AV[0]);
    // (the hot plate: black, its coil (its glow live), its knob)
    box(g, x + 1, y - 7, w - 2, 7, INK); box(g, x + 2, y - 6, w - 4, 5, BLACK[3]); box(g, x + 2, y - 6, w - 4, 1, BLACK[5]); box(g, x + w - 8, y - 4, 3, 3, STEEL[5]);
    // (the coffee pot: blue speckled enamel, the spout, the handle, the lid's knob)
    const px = x + 14, py = y - 7;
    g.fillStyle = INK; g.beginPath(); g.moveTo(px - 10, py); g.lineTo(px + 10, py); g.lineTo(px + 6, py - 20); g.lineTo(px - 6, py - 20); g.closePath(); g.fill();
    g.fillStyle = '#2E5A9A'; g.beginPath(); g.moveTo(px - 9, py - 1); g.lineTo(px + 9, py - 1); g.lineTo(px + 5, py - 19); g.lineTo(px - 5, py - 19); g.closePath(); g.fill();
    box(g, px - 7, py - 16, 3, 14, '#5A86C8');
    for (let k = 0; k < 9; k++) box(g, px - 6 + hash(k * 2.7) * 12, py - 17 + hash(k * 5.1) * 15, 1, 1, '#E8EEF8');
    box(g, px - 5, py - 23, 10, 4, INK); box(g, px - 4, py - 22, 8, 2, '#3E6EB0'); box(g, px - 1, py - 26, 2, 3, INK);
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(px - 8, py - 12); g.lineTo(px - 15, py - 18); g.stroke(); g.strokeStyle = '#2E5A9A'; g.lineWidth = 1; g.stroke();
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(px + 6, py - 16); g.quadraticCurveTo(px + 15, py - 12, px + 7, py - 4); g.stroke();
    // (the plug in the cord off the wall)
    box(g, x - 3, y + 4, 4, 5, INK); box(g, x - 2, y + 5, 2, 3, '#D8862A');
  }
  // ---- a tub tipped by the bench, its powder out; a shaker
  { const x = O(13316);
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + 6, fl - 9, 10, 9, 0, 0, Math.PI * 2); g.fill();
    box(g, x - 4, fl - 18, 14, 18, INK); for (let i = 0; i < 3; i++) box(g, x - 3, fl - 17 + i * 6, 12, 6, RED[4 - i]);
    g.fillStyle = CREAM[5]; g.beginPath(); g.ellipse(x + 8, fl - 9, 7, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = CREAM[3]; g.beginPath(); g.ellipse(x + 9, fl - 9, 4, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(236,224,196,0.7)'; g.beginPath(); g.ellipse(x + 22, fl - 1, 14, 2, 0, 0, Math.PI * 2); g.fill();
  }
  // ---- chalk dust on the planks round the bench; a block of chalk
  for (let k = 0; k < 34; k++) box(g, O(13212) + hash(k * 1.9) * 100, fl - 3 + hash(k * 3.3) * 3, 2, 1, `rgba(236,232,220,${(0.3 + hash(k) * 0.4).toFixed(2)})`);
  box(g, O(13300) - 1, fl - 6, 10, 6, INK); box(g, O(13300), fl - 5, 8, 5, '#ECEAE0'); box(g, O(13300), fl - 5, 8, 1, '#FFFFFF');
  // ---- the pickaxe leaned on the last set
  { const x = O(13712);
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 8, fl - 1); g.lineTo(x + 6, fl - 78); g.stroke(); g.strokeStyle = PLANK[4]; g.lineWidth = 3; g.stroke(); g.strokeStyle = PLANK[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 9, fl - 2); g.lineTo(x + 5, fl - 78); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 16, fl - 70); g.quadraticCurveTo(x + 4, fl - 88, x + 26, fl - 76); g.lineTo(x + 22, fl - 72); g.quadraticCurveTo(x + 4, fl - 80, x - 12, fl - 66); g.closePath(); g.fill();
    g.fillStyle = IRON[4]; g.beginPath(); g.moveTo(x - 13, fl - 70); g.quadraticCurveTo(x + 4, fl - 85, x + 23, fl - 76); g.lineTo(x + 4, fl - 80); g.closePath(); g.fill();
  }
};

/** The near framing in front of it all: the nearest cap and its two sets at the room's ends, in silhouette (rim lit
 *  from the lantern's side); a gap in the cap where the chute goes up. */
const paintNear = (g: Ctx) => {
  const a = W(ROOM.a), b = W(ROOM.b), t = Y(ROOM.top), fl = FL(), ca = W(CHUTE.a), cb = W(CHUTE.b);
  const N = ['#060402', '#0E0906', '#18100A', '#24180E'];
  for (const [x0, x1] of [[a - 20, ca - 8], [cb + 8, b + 20]] as const) {
    box(g, x0, t - 14, x1 - x0, 16, N[0]); box(g, x0, t, x1 - x0, 2, N[2]); box(g, x0, t + 2, x1 - x0, 1, N[3]);
    for (let x = x0 + 30; x < x1 - 10; x += 120) { box(g, x, t + 3, 3, 6 + Math.round(hash(x) * 8), N[1]); }
  }
  for (const [x, rim] of [[a - 20, 1], [b + 2, -1]] as const) {
    box(g, x, t - 14, 18, fl - t + 14, N[0]); box(g, rim > 0 ? x + 16 : x, t + 2, 2, fl - t - 2, N[3]);
    for (let y = t + 40; y < fl; y += 64) box(g, x + 7, y, 4, 4, N[2]);
  }
};

/** The dud dynamite against the west wall (its own stamp: jolted when he's hit it with the scarecrow). */
const paintTnt = (g: Ctx) => {
  const fl = FL(), a = W(TNT.a);
  const crate = (x: number, y: number, w: number, h: number) => {
    box(g, x - 1, y - 1, w + 2, h + 2, INK);
    for (let i = 0; i < 4; i++) box(g, x + (i * w) / 4, y, w / 4 + 1, h, PLANK[5 - i]);
    box(g, x, y, w, 2, PLANK[6]); box(g, x, y + h / 2, w, 2, PLANK[2]);
    signText(g, 'TNT', x + w / 2, y + h / 2 - 2, western(1, RED[3], '#1C0806'));
    // (DUD chalked across it)
    g.font = '8px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#EDEBE2'; g.fillText('DUD', x + w / 2 + 2, y + h - 4); g.textAlign = 'left';
  };
  crate(a + 2, fl - 30, 80, 30);
  crate(a + 8, fl - 60, 70, 29);
  crate(a + 4, fl - 88, 60, 27);
  // (loose sticks on the top one, a fuse curling off one)
  for (let k = 0; k < 4; k++) { box(g, a + 12 + k * 9, fl - 96, 7, 8, INK); box(g, a + 13 + k * 9, fl - 95, 5, 6, RED[3]); box(g, a + 13 + k * 9, fl - 95, 5, 1, RED[5]); }
  g.strokeStyle = '#D8C8A0'; g.lineWidth = 1; g.beginPath(); g.moveTo(a + 15, fl - 96); g.quadraticCurveTo(a + 10, fl - 108, a + 22, fl - 110); g.stroke();
};

/** Square tiles over the box (world), each painted once the first time it's on screen (lazily: nothing at load; small
 *  enough that each is a short paint). */
const tiles = (c: Ctx, state: GameState, key: string, y0: number, paint: (g: Ctx, x: number, y: number, w: number, h: number) => void) => {
  for (let x = UA, i = 0; x < UB; x += TILE, i++) for (let y = y0, j = 0; y < UBOT; y += TILE, j++) {
    const w = Math.min(TILE, UB - x), hh = Math.min(TILE, UBOT - y);
    if (!seenBox(state, x, x + w, y, y + hh)) continue;
    still(c, `${key}-${i}-${j}`, 0, 0, x, y, w, hh, g => { g.save(); g.beginPath(); g.rect(x, y, w, hh); g.clip(); paint(g, x, y, w, hh); g.restore(); });
  }
};

export const drawBenLairBack = (c: Ctx, state: GameState) => {
  const seen = seenBox(state, UA, UB, UT, UBOT);
  // ---- the rock and the maze, in tiles (under the flooded shaft's floodlights and the winze: they're over the bed)
  if (seen) tiles(c, state, 'ben-under', UT, (g, x, y, w, hh) => paintUnder(g, x, y, w, hh));
  drawSumpBack(c, state);
  if (!seen) return;
  const f = state.frame, h = lairOf(state);
  // ---- the office
  const a = W(ROOM.a), b = W(ROOM.b), t = Y(CHUTE.top), fl = FL();
  if (!seenBox(state, a, b, t, Y(POOL.bot))) return;
  for (let i = 0; i < 2; i++) {
    const L = a + i * 400, w = i ? b - L : 400;
    still(c, `ben-office2-${i}`, 0, 0, L, t, w, Y(POOL.bot) - t + 4, g => { g.save(); g.beginPath(); g.rect(L, t, w, Y(POOL.bot) - t + 4); g.clip(); paintRoom(g); g.restore(); });
  }
  signText(c, 'ASSAY OFFICE', O(13390) + 85, Y(ROOM.top) + 56, western(2, BRASS[4], '#120C08'));
  // (the dynamite: gone a moment after the scarecrow's blown it, a scorch on the wall and the floor where it stood; then
  // a fresh stack set down, settling)
  const jt = f - h.tntAt;
  if (jt >= TNT_GONE) {
    const st = jt - TNT_GONE, jy = st < 8 ? Math.round((8 - st) * 0.6) : 0;
    still(c, 'ben-tnt', 0, -jy, W(TNT.a) - 4, fl - 114, 96, 118, paintTnt);
  } else {
    c.globalAlpha = 0.5 * (1 - jt / TNT_GONE) + 0.15;
    c.fillStyle = '#120A06'; c.beginPath(); c.ellipse((W(TNT.a) + W(TNT.b)) / 2, fl - 40, 60, 44, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }
  // (the candle stub on the shelf over the dynamite, its flame; the hot plate's coil, the coffee pot's steam)
  { const cx = O(13136) + 64, cy = Y(ROOM.top) + 108 - 12, fk = (f >> 2) % 3;
    box(c, cx - 1, cy - 6 + (fk === 1 ? 1 : 0), 3, 5, '#F97316'); box(c, cx, cy - 4, 1, 3, '#FFF4C8'); if (fk === 2) box(c, cx - 1, cy - 8, 1, 2, '#FDBA74'); }
  { const hx = O(13418), hy = fl - 52 - 6, on = 0.6 + 0.4 * Math.sin(f * 0.11);
    c.fillStyle = `rgba(248,113,62,${on.toFixed(2)})`; c.fillRect(hx + 4, hy + 4, 8, 1); c.fillRect(hx + 22, hy + 4, 10, 1);
    for (let i = 0; i < 3; i++) { const u = ((f * 0.5 + i * 33) % 100) / 100; box(c, hx + 14 + Math.sin(f * 0.05 + i * 2) * 3 - 15 * u, hy - 24 - u * 34, 3 + u * 3, 3 + u * 3, `rgba(230,228,220,${(0.35 * (1 - u)).toFixed(2)})`); } }
  // (the lantern over the cot, swaying; drips off the ceiling into the floor, and into the pool)
  const sw = Math.sin(f * 0.025) * 2;
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(O(13440), Y(ROOM.top) + 14); c.lineTo(O(13440) + sw, Y(ROOM.top) + 76); c.stroke();
  lantern(c, O(13440) + sw, Y(ROOM.top) + 94, f);
  for (let i = 0; i < 5; i++) {
    const per = 70 + i * 13, u = ((f + i * 29) % per) / per, dx = W(ROOM.a + 60 + i * 150 + (i === 4 ? 40 : 0));
    const top = Y(ROOM.top) + 16, end = i === 4 ? Y(POOL.surface) : fl;
    if (u < 0.75) box(c, dx, top + (u / 0.75) ** 2 * (end - top), 2, 3, '#9ADCE8');
    else { const k = (u - 0.75) / 0.25; box(c, dx - 3 - k * 3, end - 2 - k * 3, 2, 2, '#9ADCE8'); box(c, dx + 3 + k * 3, end - 2 - k * 3, 2, 2, '#9ADCE8'); }
  }
  // (the pool's surface, lit and rippling)
  const ps = Y(POOL.surface), pa = W(POOL.a), pb = W(POOL.b);
  for (let x = pa; x < pb; x += 4) { const y = Math.round(ps - Math.sin(f * 0.07 + x * 0.05) * 1.2); box(c, x, y - 1, 4, 1, INK); box(c, x, y, 4, 2, '#7AC6C4'); box(c, x, y + 2, 4, 2, '#3A8A8C'); }
  drawCannon(c, h.cannon, WILDERNESS);
  drawCannonChain(c, h.cannon, gateK(state, h.gate));
  drawGate(c, state, h.gate, 'planks');
  drawBen(c, W(BEN_RX), fl, h.ben.facing, h.ben.pose, Math.floor(f / 8) % 3, h.ben.piece);
};

/** World space, over him: the maze's water (see-through: he's in it), Ben's words over his head (in play: plain text). */
export const drawBenLairFront = (c: Ctx, state: GameState) => {
  const rv = lairOf(state).reveal;
  // (the dynamite going up: a flash there, white-hot to orange, in stepped rings, a few frames)
  const bt = state.frame - lairOf(state).tntAt;
  if (bt >= 0 && bt < 12) {
    const x = (W(TNT.a) + W(TNT.b)) / 2, y = FL() - 50, k = 1 - bt / 12;
    for (const [r, col, a] of [[130, '#F97316', 0.35], [90, '#FDBA74', 0.5], [50, '#FEF9C3', 0.8]] as const) {
      c.globalAlpha = a * k; c.fillStyle = col; c.beginPath(); c.arc(x, y, r * (0.7 + 0.3 * (1 - k)), 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
  // (from up in the flooded shaft: solid rock under the bed, faded away going down the winze)
  if (rv < 1 && seenBox(state, UA, UB, VT, UBOT)) {
    c.globalAlpha = 1 - rv;
    // (all but the winze itself: that's the tell)
    c.save(); c.beginPath(); c.rect(UA, VT, UB - UA, UBOT - VT); c.rect(W(WINZE.a) - 12, VT - 2, WINZE.b - WINZE.a + 24, Y(WINZE.bot) - VT + 4); c.clip('evenodd');
    tiles(c, state, 'ben-veil', VT, (g, x, y, w, hh) => paintRock(g, x, w, y, hh));
    c.restore();
    c.globalAlpha = 1;
  }
  if (rv > 0 && seenBox(state, UA, UB, UT, UBOT)) {
    c.globalAlpha = 0.28; c.fillStyle = '#0C3A44';
    for (const o of OPEN_BOXES) if (seenBox(state, o.x, o.x + o.w, o.y, o.y + o.h)) c.fillRect(o.x, o.y, o.w, o.h);
    c.fillRect(W(POOL.a), Y(POOL.surface) + 3, W(POOL.b) - W(POOL.a), Y(POOL.bot) - Y(POOL.surface) - 3);
    c.globalAlpha = 1;
  }
  // (the near framing: the nearest cap and the end sets in silhouette, once the office is in view)
  if (rv > 0 && seenBox(state, W(ROOM.a) - 30, W(ROOM.b) + 30, Y(ROOM.top) - 10, FL() + 10)) {
    c.globalAlpha = rv;
    still(c, 'ben-near', 0, 0, W(ROOM.a) - 22, Y(ROOM.top) - 16, W(ROOM.b) - W(ROOM.a) + 44, FL() - Y(ROOM.top) + 18, paintNear);
    c.globalAlpha = 1;
  }
  const h = lairOf(state);
  if (!h.ben.said || h.script?.gross || !seenBox(state, W(BEN_RX) - 100, W(BEN_RX) + 100, FL() - 200, FL() + 10)) return;
  saidOver(c, h.ben.said.text, W(BEN_RX), benHeadY(FL()), '#FFFFFF', 220);
};

/** Screen space: his gross-up while it's up; SKIP >> while the scene can be skipped. */
export const drawBenLairHud = (c: Ctx, state: GameState) => {
  if (!inLair(state)) return;
  const h = lairOf(state), sc = h.script;
  if ((h.phase === 'meet' || h.phase === 'gift') && sc?.gross) {
    drawBenGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBenGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, 0.9 + 0.1 * Math.min(1, sc.grossT / 10), state.frame, h.phase === 'meet' ? 'sabatons' : null, !!h.ben.said);
    // (his words over it, in a bubble: it's a skippable scene)
    if (h.ben.said) saidOver(c, h.ben.said.text, CANVAS_WIDTH / 2 - 60, 120);
  }
  if ((h.phase === 'meet' || h.phase === 'gift') && h.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};

// ---------------------------------------------------------------------------------------------------------------
// The light

/** The flooded shaft's floodlights and the winze's warm glow (on whenever they're near). */
const sumpLights = (state: GameState): Light[] => {
  const out: Light[] = [], f = state.frame, bed = Y(-880);
  for (const rx of FLOODS) { const x = W(rx); if (onScreen(state, x - 260, x + 260)) out.push({ x, y: bed - 60, r: 250, a: 0.7, color: 'rgba(170, 236, 255, 0.12)' }); }
  const wx = (W(WINZE.a) + W(WINZE.b)) / 2;
  if (onScreen(state, wx - 300, wx + 300)) out.push({ x: wx, y: bed - 10, r: 150, a: 0.55 + 0.05 * Math.sin(f * 0.07), color: 'rgba(255, 184, 110, 0.12)' });
  return out;
};

/** The office's warm lights: its pool, the lantern over the cot, the glow by the cannon. */
const officeLights = (f: number): Light[] => {
  const sw = Math.sin(f * 0.025) * 2;
  return [
    { x: (W(POOL.a) + W(POOL.b)) / 2, y: Y(POOL.surface) + 20, r: 140, a: 0.55, color: 'rgba(255, 190, 120, 0.10)' },
    { x: O(13440) + sw, y: Y(ROOM.top) + 94, r: 340, a: 0.85 + 0.05 * Math.sin(f * 0.4), color: 'rgba(255, 200, 130, 0.12)' },
    { x: O(13700), y: Y(ROOM.top) + 130, r: 240, a: 0.45, color: 'rgba(255, 200, 130, 0.08)' },
    { x: O(13136) + 64, y: Y(ROOM.top) + 92, r: 120, a: 0.45 + 0.06 * Math.sin(f * 0.9), color: 'rgba(255, 180, 100, 0.10)' },
    { x: O(13438), y: Y(ROOM.floor) - 60, r: 70, a: 0.4, color: 'rgba(248, 113, 62, 0.12)' },
  ];
};

/** The town's light, and down here: the flooded shaft lit (the dark eased off by how far under he is: no pop going in),
 *  the maze's work lights (cold), the office's lantern (warm). */
export const benLighting = (state: GameState, base: SceneLight | null): SceneLight | null => {
  const f = state.frame, p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (underBed(state)) {
    const lights: Light[] = [...sumpLights(state), { x: cx, y: p.pos.y + 24, r: 130, a: 0.3 }];
    if (!inLair(state)) lights.push(...mazeLights(state, cx, p.pos.y));
    lights.push(...officeLights(f));
    // (the dynamite going up lights the room a moment)
    const bt = f - lairOf(state).tntAt;
    if (bt >= 0 && bt < 30) lights.push({ x: (W(TNT.a) + W(TNT.b)) / 2, y: FL() - 50, r: 420, a: 1 - bt / 30, color: 'rgba(253, 186, 116, 0.2)' });
    return { dark: inLair(state) ? 0.52 : 0.5, shade: inLair(state) ? [12, 8, 4] : [4, 10, 14], lights, rim: 0.4 };
  }
  if (!onScreen(state, X(12400), X(14460))) return base;
  // (swimming the flooded shaft: the maze's lamps and the office's lantern lit too, all of it in view from the water)
  const extra = inSump(state) ? [...sumpLights(state), ...mazeLights(state, cx, p.pos.y + 300), ...officeLights(f)] : sumpLights(state);
  if (!inSump(state)) return base ? { ...base, lights: [...base.lights, ...extra] } : base;
  // (in the water: the mine's murk eased off by how far under he is)
  const k = Math.max(0, Math.min(1, (feet - (Y(-420) + 16)) / 140)), d0 = base?.dark ?? 0.78;
  return { ...(base ?? { lights: [] }), dark: d0 + (0.46 - d0) * k, shade: [4, 12, 16], rim: 0.4, lights: [...(base?.lights ?? []), ...extra] };
};

/** For a still look (the contact sheet): the under-bed region and the office painted at once (world space). */
export const paintBenSheet = (g: Ctx) => {
  paintUnder(g, UA, UT, UB - UA, UBOT - UT);
  paintRoom(g);
  paintTnt(g);
  paintWinze(g);
};
export { UA, UB, UT, UBOT, HATCH_X, MINE, paintNear as paintBenNear };
