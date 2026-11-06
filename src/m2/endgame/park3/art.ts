// THE MAINTENANCE TUNNELS, drawn (a crude first pass, readable: flat colors in a few steps, a dither where they meet).
// The grid's painted once, in chunks (stamps: 10 x 10 cells each), only as they come near the screen:
//
//   the back wall    behind the air: cinder block in a cheap institutional green gone gray with grime, a darker
//                    band at the floor (mop water), stains under the ceiling, a conduit and a sagging cable run along
//                    the top; behind the water (the flooded pipes): the inside of a rusty pipe, its seams.
//   the rock         poured concrete: a lit lip along every top that's stood on (standable reads standable), the
//                    ceiling's underside in shadow with drip stains, cracks and rebar.
//   the drums        cheap imported chlorine: blue plastic, a skull label, a lit rim on top (they're stood on); the
//                    leaky ones cracked, a yellow-green stain down the side.
//   the vat, the     the piss: yellow, foam along the top, darker down; the sludge: a poisonous teal. Their surfaces'
//   sludge           shimmer drawn live over the baked body.
//   the water        (in front of him) a murky green-blue wash over every water cell, its surface lit where there's air.
//
// The props (the break room, the piss filter's machinery, the door in, the pump room) and the signs: stamped, drawn
// behind the play. The lamps: caged bulbs on the ceilings (some dead: nobody changes them).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { stamp, mix, checker } from '../../intro/art/kit';
import { CELL, ROWS, COLS, Y0, GRID, at, cellX, cellY, isRock, isWater, SIGNS3, SEC, SEC_X, VAT, VAT_Y, PUMP_ROOM, type SignDef3 } from './geo';

type Ctx = CanvasRenderingContext2D;
export const INK = '#07090A';
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const h2 = (c: number, r: number) => hash(c * 73.13 + r * 19.7);
export const vis = (state: GameState, a: number, b: number, m = 80) => b > state.camera.x - m && a < state.camera.x + W + m;
const visY = (state: GameState, a: number, b: number, m = 80) => b > state.camera.y - m && a < state.camera.y + H + m;

// The colors (each in steps, darkest first)
const WALL = ['#1C2622', '#26332D', '#304038', '#3C4E44', '#4A5E52'];
const CONC = ['#16181A', '#24272A', '#33373A', '#45494C', '#5C6064', '#787C80'];
const PIPE = ['#120E0A', '#2A1E14', '#3E2C1C', '#563C24', '#6E4E30'];
export const PISS = ['#5A4A06', '#7C6810', '#A08A18', '#C8AE2A', '#E6D04A', '#FFF29A'];
export const SLUDGE = ['#06302A', '#0A4A40', '#106A58', '#1A8C70', '#34B08A', '#8AF0C8'];
const DRUM = ['#0C1E3A', '#163262', '#20488A', '#3062B0', '#5A8AD0'];

const air = (ch: string) => !isRock(ch);

// ---------------------------------------------------------------------------------------------------------------
// A chunk: 10 x 10 cells, the back wall, the rock, the drums, the vents, the liquids' bodies

const CH = 10, CW = CH * CELL;
const paintChunk = (g: Ctx, ci: number, cj: number) => {
  const c0 = ci * CH, r0 = cj * CH;
  for (let r = r0; r < r0 + CH; r++) for (let c = c0; c < c0 + CH; c++) {
    if (r >= ROWS || c >= COLS) continue;
    const ch = GRID[r][c], x = cellX(c), y = cellY(r);
    if (isRock(ch)) continue;
    // ---- what's behind it: the pipe's inside (water), the block wall (air)
    if (isWater(ch)) {
      R(g, x, y, CELL, CELL, PIPE[1]);
      R(g, x, y + ((r * 7) % 3) * 10 + 6, CELL, 2, PIPE[2]);
      if ((c + r) % 3 === 0) { R(g, x + 6, y + 6, 3, 3, PIPE[3]); R(g, x + 30, y + 26, 3, 3, PIPE[3]); }
      if (h2(c, r) < 0.25) checker(g, x + 4, y + 14, 30, 10, PIPE[3], 0, 2);
      continue;
    }
    R(g, x, y, CELL, CELL, WALL[2]);
    // (the blocks: two rows a cell, staggered)
    for (let k = 0; k < 2; k++) {
      const by = y + k * 20, off = ((r * 2 + k) % 2) * 20;
      R(g, x, by, CELL, 1, WALL[1]);
      R(g, x + ((off + 0) % 40), by, 1, 20, WALL[1]);
      R(g, x + ((off + 0) % 40) + 1, by + 1, 18, 1, WALL[3]);
    }
    // (the grime: a darker band low down (the mop water, where there's floor), stains under a ceiling)
    if (isRock(at(c, r + 1))) { R(g, x, y + 22, CELL, 18, WALL[1]); checker(g, x, y + 18, CELL, 4, WALL[1], 0, 2); R(g, x, y + 36, CELL, 4, WALL[0]); }
    if (isRock(at(c, r - 1))) {
      R(g, x, y, CELL, 10, WALL[1]);
      // (the conduit along the top, a sagging cable)
      R(g, x, y + 4, CELL, 6, CONC[1]); R(g, x, y + 4, CELL, 2, CONC[3]);
      if (c % 6 === 0) R(g, x + 16, y + 2, 6, 10, CONC[2]);
      const sag = Math.round(4 + Math.sin(c * 0.9) * 3);
      R(g, x, y + 12 + sag, CELL, 2, '#101010');
      if (h2(c, r) < 0.35) { R(g, x + 10 + h2(r, c) * 20, y + 10, 4, 14 + h2(c + 1, r) * 16, mix(WALL[1], '#3A2A10', 0.4)); }
    }
    if (h2(c, r) > 0.8) checker(g, x + 6, y + 8, 20, 14, WALL[1], 1, 2);
  }
  // ---- the rock (over the wall's edges), the drums, the vents
  for (let r = r0; r < r0 + CH; r++) for (let c = c0; c < c0 + CH; c++) {
    if (r >= ROWS || c >= COLS) continue;
    const ch = GRID[r][c], x = cellX(c), y = cellY(r);
    if (ch === '#') {
      R(g, x, y, CELL, CELL, CONC[1]);
      if (h2(c, r) < 0.3) checker(g, x + 4, y + 6, 30, 26, CONC[2], 0, 2);
      if (h2(r, c) < 0.12) { R(g, x + 8, y + 12, 18, 1, CONC[0]); R(g, x + 20, y + 13, 10, 1, CONC[0]); }
      const up = at(c, r - 1), dn = at(c, r + 1), lf = at(c - 1, r), rt = at(c + 1, r);
      // (a face to the air: the slab's edge in steps; the top lit (stood on), the underside in shadow)
      if (air(up) && !isWater(up)) { R(g, x, y, CELL, 10, CONC[3]); R(g, x, y, CELL, 4, CONC[4]); R(g, x, y, CELL, 1, CONC[5]); checker(g, x, y + 10, CELL, 4, CONC[3], 0, 2); }
      else if (air(up)) { R(g, x, y, CELL, 6, CONC[3]); R(g, x, y, CELL, 1, CONC[4]); }
      if (air(dn)) { R(g, x, y + CELL - 8, CELL, 8, CONC[0]); R(g, x, y + CELL - 2, CELL, 2, INK); if (h2(c, r + 7) < 0.3) R(g, x + 14, y + CELL - 1, 3, 5, '#1E2A26'); }
      if (air(lf)) { R(g, x, y, 4, CELL, CONC[2]); R(g, x, y, 1, CELL, INK); }
      if (air(rt)) { R(g, x + CELL - 4, y, 4, CELL, CONC[0]); R(g, x + CELL - 1, y, 1, CELL, INK); }
    } else if (ch === 'd' || ch === 'D') {
      R(g, x, y, CELL, CELL, WALL[2]);
      // (a chlorine drum: blue plastic, its ribs, the skull label; the rim on top lit when it's stood on)
      R(g, x + 1, y, CELL - 2, CELL, INK); R(g, x + 3, y + 1, CELL - 6, CELL - 2, DRUM[2]);
      R(g, x + 3, y + 1, 6, CELL - 2, DRUM[3]); R(g, x + CELL - 9, y + 1, 6, CELL - 2, DRUM[1]);
      R(g, x + 3, y + 12, CELL - 6, 2, DRUM[1]); R(g, x + 3, y + 28, CELL - 6, 2, DRUM[1]);
      R(g, x + 12, y + 15, 16, 12, '#E8E4D0'); R(g, x + 17, y + 17, 6, 5, INK); R(g, x + 18, y + 18, 1, 1, '#E8E4D0'); R(g, x + 21, y + 18, 1, 1, '#E8E4D0'); R(g, x + 16, y + 23, 8, 1, INK);
      if (!isRock(at(c, r - 1))) { R(g, x + 1, y, CELL - 2, 4, DRUM[4]); R(g, x + 1, y, CELL - 2, 1, '#C8DCF4'); }
      if (ch === 'D') {
        // (cracked: the split, the stain running down from it)
        g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 30, y + 4); g.lineTo(x + 26, y + 12); g.lineTo(x + 31, y + 18); g.stroke();
        R(g, x + 26, y + 18, 6, CELL - 19, '#8A9A2A'); checker(g, x + 24, y + 22, 10, 14, '#A8B83A', 0, 2);
      }
    } else if (ch === 'v') {
      R(g, x, y, CELL, CELL, CONC[1]);
      // (a steam vent: a grated nozzle out of the wall, rust round it)
      const dir = air(at(c + 1, r)) ? 1 : -1, nx = dir > 0 ? x + CELL - 14 : x;
      R(g, nx, y + 8, 14, 24, INK); R(g, nx + 1, y + 9, 12, 22, CONC[3]);
      for (let k = 0; k < 4; k++) R(g, nx + 1, y + 11 + k * 5, 12, 2, INK);
      R(g, x + (dir > 0 ? 0 : 14), y + 14, 26, 12, PIPE[2]); R(g, x + (dir > 0 ? 0 : 14), y + 14, 26, 2, PIPE[4]);
    } else if (ch === 'P' || ch === 'C') {
      const L = ch === 'P' ? PISS : SLUDGE, top = !(at(c, r - 1) === ch);
      R(g, x, y, CELL, CELL, L[top ? 3 : 2]);
      if (!top) { checker(g, x, y, CELL, 6, L[3], 0, 2); if (at(c, r + 1) !== ch) R(g, x, y + 20, CELL, 20, L[1]); }
      else R(g, x, y + 24, CELL, 16, L[2]);
      if (h2(c, r) < 0.3) R(g, x + 8 + h2(r, c) * 20, y + 14, 4, 4, L[4]);
    }
  }
};
const chunkKey = (ci: number, cj: number) => `wp3-ch-${ci}-${cj}`;
/** The back wall and the rock round the screen (world space). */
export const drawTunnels = (c: Ctx, state: GameState) => {
  const ci0 = Math.max(0, Math.floor((state.camera.x - 20) / CW)), ci1 = Math.min(Math.ceil(COLS / CH) - 1, Math.floor((state.camera.x + W + 20) / CW));
  const cj0 = Math.max(0, Math.floor((state.camera.y - 20 - Y0) / CW)), cj1 = Math.min(Math.ceil(ROWS / CH) - 1, Math.floor((state.camera.y + H + 20 - Y0) / CW));
  for (let ci = ci0; ci <= ci1; ci++) for (let cj = cj0; cj <= cj1; cj++) stamp(c, chunkKey(ci, cj), ci * CW, Y0 + cj * CW, CW, CW, g => paintChunk(g, ci, cj));
};

/** The liquids' surfaces, live (the vat's foam drifting, the sludge's slow roll): one band a cell, cheap. */
export const drawLiquidTops = (c: Ctx, state: GameState) => {
  const f = state.frame;
  const c0 = Math.max(0, Math.floor(state.camera.x / CELL) - 1), c1 = Math.min(COLS - 1, Math.ceil((state.camera.x + W) / CELL) + 1);
  const r0 = Math.max(1, Math.floor((state.camera.y - Y0) / CELL)), r1 = Math.min(ROWS - 1, Math.ceil((state.camera.y + H - Y0) / CELL));
  for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) {
    const ch = GRID[r][cc];
    if ((ch !== 'P' && ch !== 'C') || at(cc, r - 1) === ch) continue;
    const L = ch === 'P' ? PISS : SLUDGE, x = cellX(cc), y = cellY(r);
    const k = (Math.floor(f / 8) + cc) % 4;
    R(c, x, y - 2, CELL, 4, L[4]);
    R(c, x + k * 10, y - 3, 8, 2, L[5]);
    if (ch === 'P' && (cc + Math.floor(f / 20)) % 5 === 0) { R(c, x + 12, y - 6, 10, 4, '#FFFBE0'); R(c, x + 24, y - 4, 6, 3, '#FFF6C0'); }
    if (ch === 'C' && (cc * 3 + Math.floor(f / 14)) % 7 === 0) { c.fillStyle = L[5]; c.beginPath(); c.arc(x + 20, y - 3 - (f % 14) * 0.4, 3, 0, Math.PI * 2); c.fill(); }
  }
};

/** The water's wash, in front of him: murky green-blue over every water cell (the grid's water read once into runs:
 *  a few fills a frame, no big see-through images), its surface lit where there's air over it. */
const WATER_RUNS: { x: number; y: number; w: number; h: number; top: boolean }[] = (() => {
  const out: { x: number; y: number; w: number; h: number; top: boolean }[] = [];
  for (let r = 0; r < ROWS; r++) {
    let c = 0;
    while (c < COLS) {
      if (!isWater(GRID[r][c])) { c++; continue; }
      const a = c; while (c < COLS && isWater(GRID[r][c])) c++;
      out.push({ x: cellX(a), y: cellY(r), w: (c - a) * CELL, h: CELL, top: false });
      // (its surface: the stretches of it with air over them)
      let k = a;
      while (k < c) { if (isWater(at(k, r - 1)) || isRock(at(k, r - 1))) { k++; continue; } const s0 = k; while (k < c && !isWater(at(k, r - 1)) && !isRock(at(k, r - 1))) k++; out.push({ x: cellX(s0), y: cellY(r), w: (k - s0) * CELL, h: 3, top: true }); }
    }
  }
  return out;
})();
export const drawWater = (c: Ctx, state: GameState) => {
  const x0 = state.camera.x - 20, x1 = state.camera.x + W + 20, y0 = state.camera.y - 20, y1 = state.camera.y + H + 20;
  c.fillStyle = 'rgba(34, 110, 128, 0.4)';
  for (const q of WATER_RUNS) if (!q.top && q.x < x1 && q.x + q.w > x0 && q.y < y1 && q.y + q.h > y0) c.fillRect(q.x, q.y, q.w, q.h);
  c.fillStyle = 'rgba(150, 230, 210, 0.55)';
  for (const q of WATER_RUNS) if (q.top && q.x < x1 && q.x + q.w > x0 && q.y < y1 && q.y + q.h > y0) c.fillRect(q.x, q.y, q.w, q.h);
};

// ---------------------------------------------------------------------------------------------------------------
// The props: the door in, the break room, the piss filter's machinery, the pump room's pumps, the outflow's grate

const paintDoorIn = (g: Ctx) => {
  // (the way in, behind him: the steel door off the lazy river's landing, propped open with a mop bucket)
  const x = 6, y = cellY(13);
  R(g, x - 4, y + 26, 92, 174, INK); R(g, x, y + 30, 84, 170, '#0A0C10');
  R(g, x + 70, y + 30, 16, 170, '#6B7280'); R(g, x + 70, y + 30, 3, 170, '#9CA3AF');
  R(g, x + 10, y + 50, 50, 10, '#2A3A4A');
  // (a mop bucket wedging it)
  R(g, x + 72, y + 168, 30, 32, INK); R(g, x + 74, y + 170, 26, 28, '#C8A020'); R(g, x + 74, y + 170, 26, 4, '#E8C840');
  R(g, x + 92, y + 120, 3, 52, '#8A6A3A');
};
const paintBreakRoom = (g: Ctx, x0: number) => {
  const fy = cellY(18);
  // (the couch: brown plaid, a cushion missing, a blanket balled up)
  R(g, x0, fy - 52, 150, 52, INK); R(g, x0 + 2, fy - 50, 146, 48, '#5A3A22'); R(g, x0 + 2, fy - 50, 146, 14, '#6E4A2C');
  for (let k = 0; k < 7; k++) R(g, x0 + 10 + k * 20, fy - 50, 2, 48, '#4A2E1A');
  R(g, x0 + 2, fy - 30, 50, 12, '#3A2414'); R(g, x0 + 98, fy - 32, 48, 14, '#7A5A3A');
  R(g, x0 + 110, fy - 44, 30, 14, '#5A6A7A');
  // (the vending machine: half the slots empty, a bag of chips stuck halfway)
  const vx = x0 + 190;
  R(g, vx, fy - 150, 70, 150, INK); R(g, vx + 3, fy - 147, 64, 144, '#8A1A1A'); R(g, vx + 8, fy - 140, 40, 100, '#1A1E24');
  for (let k = 0; k < 5; k++) for (let j = 0; j < 3; j++) if (hash(k * 3 + j) > 0.4) R(g, vx + 11 + j * 12, fy - 136 + k * 19, 9, 12, ['#E8C020', '#2A8A3A', '#C83A2A', '#3A5AC8'][(k + j) % 4]);
  R(g, vx + 23, fy - 98, 9, 18, '#E8C020');
  R(g, vx + 52, fy - 130, 10, 30, '#3A3E44'); R(g, vx + 8, fy - 30, 40, 16, '#0A0A0A');
  // (the table, the microwave (its door open: something exploded in it), a coffee maker, the fridge)
  const tx = x0 + 300;
  R(g, tx, fy - 60, 120, 6, INK); R(g, tx + 2, fy - 58, 116, 3, '#B8A890'); R(g, tx + 8, fy - 54, 4, 54, INK); R(g, tx + 108, fy - 54, 4, 54, INK);
  R(g, tx + 10, fy - 96, 56, 36, INK); R(g, tx + 12, fy - 94, 52, 32, '#D8D4C8'); R(g, tx + 16, fy - 90, 32, 24, '#3A2A1A'); checker(g, tx + 16, fy - 90, 32, 24, '#8A5A2A', 0, 2);
  R(g, tx + 76, fy - 84, 22, 24, INK); R(g, tx + 78, fy - 82, 18, 20, '#2A2A2A'); R(g, tx + 80, fy - 72, 14, 10, '#4A2A10');
  R(g, tx + 140, fy - 160, 70, 160, INK); R(g, tx + 142, fy - 158, 66, 156, '#C8C8C0'); R(g, tx + 142, fy - 104, 66, 2, INK); R(g, tx + 196, fy - 150, 4, 30, '#7A7A70'); R(g, tx + 196, fy - 92, 4, 40, '#7A7A70');
  R(g, tx + 152, fy - 140, 30, 22, '#F8F4E0'); R(g, tx + 155, fy - 135, 24, 2, '#2A2A2A'); R(g, tx + 155, fy - 129, 18, 2, '#2A2A2A');
};
const POUR_X = () => [cellX(SEC_X[1] + 18), cellX(SEC_X[1] + 46), cellX(SEC_X[1] + 58)];
const paintFilter = (g: Ctx, pipes: boolean, only = 0) => {
  if (!pipes) {
  // (the piss filter: the housing a big riveted drum stood up out of the vat, a gauge stuck in the red, pipes pouring in
  // off the ceiling (yellow, steady), a hand-lettered card taped on it)
  // (painted over the housing's own block: its top's the lid he stands on, lit)
  const x0 = cellX(SEC_X[1] + VAT.housing[0]), x1 = cellX(SEC_X[1] + VAT.housing[1] + 1), top = cellY(VAT.housingTop), bot = VAT_Y;
  R(g, x0, top, x1 - x0, bot - top, INK); R(g, x0 + 2, top + 2, x1 - x0 - 4, bot - top - 2, '#6A6A5A');
  R(g, x0 + 2, top + 2, 10, bot - top - 2, '#8A8A78'); R(g, x1 - 14, top + 2, 12, bot - top - 2, '#4A4A3E');
  R(g, x0, top, x1 - x0, 6, '#B8B8A0'); R(g, x0, top, x1 - x0, 2, '#E8E8D0');
  for (let y = top + 16; y < bot - 6; y += 22) for (let x = x0 + 8; x < x1 - 4; x += 20) R(g, x, y, 3, 3, '#A8A898');
  R(g, x0 + 60, top + 30, 50, 50, INK); g.fillStyle = '#E8E4D0'; g.beginPath(); g.arc(x0 + 85, top + 55, 22, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#C83A2A'; g.beginPath(); g.moveTo(x0 + 85, top + 55); g.arc(x0 + 85, top + 55, 22, -0.4, 0.4); g.fill();
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 85, top + 55); g.lineTo(x0 + 104, top + 62); g.stroke();
  return; }
  // (the pipes in off the ceiling, pouring)
  for (const px of [only]) {
    const py = cellY(6);
    R(g, px - 18, py, 36, 60, INK); R(g, px - 16, py, 32, 58, PIPE[3]); R(g, px - 16, py, 6, 58, PIPE[4]);
    R(g, px - 22, py + 50, 44, 16, INK); R(g, px - 20, py + 52, 40, 12, PIPE[2]);
  }
};
/** The pouring streams (live, cheap): off the pipes down into the vat. */
export const drawPours = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const px of [cellX(SEC_X[1] + 18), cellX(SEC_X[1] + 46), cellX(SEC_X[1] + 58)]) {
    if (!vis(state, px - 20, px + 20)) continue;
    const y0 = cellY(6) + 66, y1 = VAT_Y;
    R(c, px - 6, y0, 12, y1 - y0, PISS[3]); R(c, px - 3, y0, 3, y1 - y0, PISS[5]);
    for (let y = y0 + ((f * 6) % 30); y < y1; y += 30) R(c, px - 6, y, 12, 6, PISS[4]);
    for (let k = 0; k < 3; k++) R(c, px - 14 + ((f * 3 + k * 9) % 28), y1 - 6 - ((f + k * 5) % 8), 4, 4, '#FFFBE0');
  }
};
const paintPumpRoom = (g: Ctx) => {
  const x0 = PUMP_ROOM.x, fy = PUMP_ROOM.floor;
  // (two big pumps, rust, their motors; the outflow's grate in the floor, the pipe off it down)
  for (const px of [x0 + 260, x0 + 380]) {
    R(g, px - 30, fy - 110, 60, 110, INK); R(g, px - 28, fy - 108, 56, 106, '#3A5A6A'); R(g, px - 28, fy - 108, 10, 106, '#4A7A8A');
    R(g, px - 34, fy - 40, 68, 40, INK); R(g, px - 32, fy - 38, 64, 36, '#2A3A44');
    g.fillStyle = '#C8A020'; g.fillRect(px - 10, fy - 90, 20, 8);
  }
  R(g, x0 + 470, fy - 150, 300, 6, '#202428');
};
/** The outflow's intake (the boss's door: walked into): a grated hole in the pump room's floor, water swirling in it.
 *  `open`: the grate's gone (he's gone down it). */
export const drawOutflow = (c: Ctx, state: GameState, swirl: number) => {
  const a = PUMP_ROOM.outA, b = PUMP_ROOM.outB, fy = PUMP_ROOM.floor, f = state.frame;
  if (!vis(state, a - 40, b + 40)) return;
  R(c, a - 6, fy - 6, b - a + 12, 8, INK); R(c, a - 4, fy - 4, b - a + 8, 4, '#C8A020');
  for (let k = 0; k < 4; k++) R(c, a + 2 + k * 20, fy - 4, 6, 4, INK);
  // (the swirl down in it)
  c.strokeStyle = 'rgba(160, 220, 210, 0.6)'; c.lineWidth = 2;
  for (let k = 0; k < 3; k++) { c.beginPath(); c.arc((a + b) / 2, fy + 40, 10 + k * 10, f * 0.12 * swirl + k * 2, f * 0.12 * swirl + k * 2 + 2.4); c.stroke(); }
};

export const drawProps = (c: Ctx, state: GameState) => {
  if (vis(state, 0, 140)) stamp(c, 'wp3-doorin', 0, cellY(13), 140, 210, paintDoorIn);
  const br = cellX(16);
  if (vis(state, br, br + 640)) stamp(c, 'wp3-break', br, cellY(9), 640, cellY(18) - cellY(9), g => paintBreakRoom(g, br + 30));
  // (the filter's housing, and the pipes in off the ceiling: each its own small stamp, not one the size of the vault)
  const hx0 = cellX(SEC_X[1] + VAT.housing[0]) - 4, hx1 = cellX(SEC_X[1] + VAT.housing[1] + 1) + 4;
  if (vis(state, hx0, hx1)) stamp(c, 'wp3-filter', hx0, cellY(VAT.housingTop) - 4, hx1 - hx0, VAT_Y - cellY(VAT.housingTop) + 8, g => paintFilter(g, false));
  for (const px of POUR_X()) if (vis(state, px - 30, px + 30)) stamp(c, `wp3-pipe-${px}`, px - 24, cellY(6), 48, 70, g => paintFilter(g, true, px));
  if (vis(state, PUMP_ROOM.x, PUMP_ROOM.right)) stamp(c, 'wp3-pump', PUMP_ROOM.x, cellY(3), PUMP_ROOM.right - PUMP_ROOM.x, PUMP_ROOM.floor - cellY(3), paintPumpRoom);
};

// ---------------------------------------------------------------------------------------------------------------
// The signs: stenciled steel boards on a stand (stood on the floor, at its depth), or plates screwed to the wall

const signSize = (s: SignDef3) => {
  const w = Math.max(...s.lines.map(l => l.length)) * 8 + 16, h = s.lines.length * 11 + 14;
  return { w, h };
};
const paintSign = (g: Ctx, s: SignDef3) => {
  const { w, h } = signSize(s), x0 = Math.round(s.x - w / 2);
  const top = s.wall ? s.y : s.y - 84;
  if (!s.wall) {
    // (its stand: two legs off a weighted foot)
    for (const lx of [x0 + 8, x0 + w - 12]) { R(g, lx - 1, top + h, 6, s.y - top - h, INK); R(g, lx, top + h, 4, s.y - top - h, '#5A5E62'); R(g, lx, top + h, 1, s.y - top - h, '#8A8E92'); }
    R(g, x0 + 2, s.y - 5, w - 4, 5, INK); R(g, x0 + 4, s.y - 4, w - 8, 3, '#3A3E42');
  }
  R(g, x0 - 2, top - 2, w + 4, h + 4, INK);
  R(g, x0, top, w, h, '#D8C838'); R(g, x0, top, w, 2, '#F0E070'); R(g, x0, top + h - 3, w, 3, '#A89820');
  // (scuffed: a dither of grime across it, a corner bent)
  checker(g, x0 + w - 24, top + h - 9, 20, 6, '#8A7A18', 0, 2);
  for (const sx of [x0 + 1, x0 + w - 3]) R(g, sx, top + 1, 2, 2, '#5A5010');
  g.font = '7px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = INK;
  s.lines.forEach((l, i) => g.fillText(l, s.x, top + 13 + i * 11));
  g.textAlign = 'left';
};
export const drawSigns = (c: Ctx, state: GameState, list: SignDef3[] = SIGNS3) => {
  for (const s of list) {
    const { w, h } = signSize(s);
    if (!vis(state, s.x - w, s.x + w)) continue;
    const top = s.wall ? s.y : s.y - 84;
    stamp(c, `wp3-sign-${s.x}-${s.y}`, Math.round(s.x - w / 2) - 4, top - 4, w + 8, (s.wall ? h : s.y - top) + 8, g => paintSign(g, s));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space): only ever seen past the grid's edges (it's all rock round the tunnels)

export const drawTunnelBackdrop = (c: Ctx) => { R(c, 0, 0, W, H, CONC[0]); };

// ---------------------------------------------------------------------------------------------------------------
// The lamps: caged bulbs on the ceilings, one every so often along each run of ceiling; a few dead, a few flickering

interface Lamp { x: number; y: number; dead: boolean; flicker: boolean }
export const LAMPS: Lamp[] = (() => {
  const out: Lamp[] = [];
  for (let r = 1; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!isRock(at(c, r - 1)) || isRock(at(c, r)) || isWater(at(c, r)) || isWater(at(c, r + 1))) continue;
    if ((c * 7 + r * 3) % 9 !== 0) continue;
    const k = h2(c, r);
    out.push({ x: cellX(c) + 20, y: cellY(r) + 4, dead: k < 0.15, flicker: k > 0.82 });
  }
  return out;
})();
const lampOn = (l: Lamp, f: number) => !l.dead && (!l.flicker || (Math.floor(f / 5 + l.x) % 11 !== 0 && Math.floor(f / 3 + l.x) % 17 > 1));
export const drawLamps = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const l of LAMPS) {
    if (!vis(state, l.x - 20, l.x + 20) || !visY(state, l.y - 20, l.y + 20)) continue;
    const on = lampOn(l, f);
    R(c, l.x - 7, l.y, 14, 14, INK);
    R(c, l.x - 5, l.y + 2, 10, 10, on ? '#FDE68A' : '#3A3A30');
    if (on) R(c, l.x - 3, l.y + 3, 3, 3, '#FFFBEB');
    R(c, l.x - 1, l.y, 2, 14, INK); R(c, l.x - 7, l.y + 7, 14, 1, INK);
  }
};
export const tunnelLights = (state: GameState): Light[] => {
  const f = state.frame, out: Light[] = [];
  for (const l of LAMPS) if (lampOn(l, f) && vis(state, l.x - 260, l.x + 260, 0) && visY(state, l.y - 260, l.y + 260, 0)) out.push({ x: l.x, y: l.y + 30, r: 230, a: 0.55, color: '#FDE68A' });
  return out;
};
export { SEC };
