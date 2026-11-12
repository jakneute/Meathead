// THE MAINTENANCE TUNNELS, drawn: the SNES pass (every material in its steps, banded by the light, dithered where the
// steps meet, inked edges). The grid's painted once, in chunks (stamps: 10 x 10 cells each), only as they come near the
// screen:
//
//   the back wall    each section its own (no going in circles): the service door's institutional green cinder block,
//                    the piss filter's yellowed tile, chemical storage's corrugated steel with a hazard stripe along the
//                    floor, the gangways' riveted plate weeping rust, the shaft's raw form concrete, the pump room's
//                    blue-and-cream paint. Banded by the lamps (dark up under the ceiling, brightest a row down, the
//                    grime at the floor). The conduit and its sagging cable along every ceiling.
//   the junk         against the wall, section by section (lockers, a bulletin board, valves and gauges, shelving of
//                    jugs, a broken safety shower, girders' chains and beacons, junction boxes, a control panel):
//                    dimmed back, no lit tops (nothing back there reads as somewhere to stand).
//   the rock         poured concrete, aggregate dithered in: a lit lip along every top that's stood on (standable reads
//                    standable; the pump room's painted safety yellow), the ceiling's underside in shadow, cracks.
//   the drums        cheap imported chlorine: blue plastic in steps, a skull label, a lit rim on top (they're stood on);
//                    the leaky ones cracked, a yellow-green stain down the side.
//   the vat, the     the piss: yellow, foam along the top, banded darker down; the sludge: a poisonous teal. Their
//   sludge           surfaces' shimmer drawn live over the baked body.
//   the water        (in front of him) a murky green-blue wash over every water cell, its surface lit where there's air;
//                    behind it the pipe's rusty inside, ribbed.
//
// Depth: the backdrop (never seen: all rock round the tunnels); the chunks (the wall, then the junk against it, then the
// rock over both: the junk's cut off by the floor and ceiling it's between); the props (the door in, the break room,
// the filter, the pumps); the GUPPLAX teases; the signs; the ladders; the gangways; the junctions; the hazards' backs;
// the wires; the lamps; then the cast and him; then the pours, the liquids' tops, the hazards' fronts and the water.
//
// The props (the break room, the piss filter's machinery, the door in, the pump room) and the signs: stamped, drawn
// behind the play. The lamps: caged bulbs on the ceilings (some dead: nobody changes them).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { stamp, mix, checker, bandedGradient } from '../../intro/art/kit';
import { CELL, ROWS, COLS, Y0, GRID, at, cellX, cellY, isRock, isWater, SIGNS3, SEC, SEC_X, VAT, VAT_Y, PUMP_ROOM, LADDERS3, type SignDef3 } from './geo';

type Ctx = CanvasRenderingContext2D;
export const INK = '#07090A';
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const h2 = (c: number, r: number) => hash(c * 73.13 + r * 19.7);
export const vis = (state: GameState, a: number, b: number, m = 80) => b > state.camera.x - m && a < state.camera.x + W + m;
const visY = (state: GameState, a: number, b: number, m = 80) => b > state.camera.y - m && a < state.camera.y + H + m;

// The colors (each in steps, darkest first). Each section of the tunnels has its own back wall (the owner's: "I want
// more close background variety. I don't want to make it seem like I'm going in circles"), and its own junk against it.
const CONC = ['#16181A', '#24272A', '#33373A', '#45494C', '#5C6064', '#787C80'];
const PIPE = ['#120E0A', '#2A1E14', '#3E2C1C', '#563C24', '#6E4E30', '#8A6A44'];
export const PISS = ['#5A4A06', '#7C6810', '#A08A18', '#C8AE2A', '#E6D04A', '#FFF29A'];
export const SLUDGE = ['#06302A', '#0A4A40', '#106A58', '#1A8C70', '#34B08A', '#8AF0C8'];
const DRUM = ['#0C1E3A', '#163262', '#20488A', '#3062B0', '#5A8AD0'];
/** The back walls, a ramp each: the break room's institutional green block, the filter vault's piss-yellowed tile,
 *  chemical storage's corrugated steel, the gangways' riveted plate, the shaft's raw concrete, the pump room's paint. */
const WALLS = {
  block: ['#141C18', '#1C2622', '#26332D', '#304038', '#3C4E44', '#4A5E52'],
  tile: ['#2A2410', '#3E3618', '#5A5026', '#7A6E3A', '#9A8E58', '#BAB07A'],
  steel: ['#12161C', '#1C222A', '#283038', '#343E48', '#46525E', '#5E6C7A'],
  plate: ['#1A140E', '#2A2016', '#3A2E20', '#4A3C2A', '#5E4E38', '#7A684C'],
  raw: ['#141414', '#1E1E1C', '#2A2A26', '#363630', '#44443C', '#56564C'],
  paint: ['#0E1A24', '#16283A', '#20384E', '#2C4A64', '#3C5E7C', '#C8C0A8'],
} as const;
type Theme = 'door' | 'piss' | 'chem' | 'gang' | 'shaft' | 'pipes' | 'pump';
const THEME_OF: Theme[] = ['door', 'piss', 'chem', 'gang', 'shaft', 'pipes'];
const PUMP_C = Math.floor(PUMP_ROOM.x / CELL);
const themeAt = (c: number): Theme => {
  if (c >= PUMP_C) return 'pump';
  let i = 0; while (i + 1 < SEC_X.length && c >= SEC_X[i + 1]) i++;
  return THEME_OF[i];
};
const WALL_OF: Record<Theme, readonly string[]> = { door: WALLS.block, piss: WALLS.tile, chem: WALLS.steel, gang: WALLS.plate, shaft: WALLS.raw, pipes: WALLS.raw, pump: WALLS.paint };
/** Pushed back toward the wall's shadow: the junk against the wall (nothing back there reads as somewhere to stand). */
const back = (col: string, k = 0.38) => mix(col, '#121A1C', k);

const air = (ch: string) => !isRock(ch);
/** How far up from the floor (rows of air under this one to rock) and down from the ceiling a cell is. */
const toFloor = (c: number, r: number) => { let k = 0; while (r + k + 1 < ROWS && !isRock(at(c, r + k + 1)) && k < 12) k++; return k; };
const toCeil = (c: number, r: number) => { let k = 0; while (r - k - 1 >= 0 && !isRock(at(c, r - k - 1)) && k < 12) k++; return k; };

// ---------------------------------------------------------------------------------------------------------------
// A cell of back wall, by its section: the material in its steps, lit from the lamps overhead (banded darker up under
// the ceiling, the grime band down at the floor), dithered where the bands meet

const wallCell = (g: Ctx, t: Theme, c: number, r: number, x: number, y: number) => {
  const L = WALL_OF[t], up = toCeil(c, r), dn0 = toFloor(c, r);
  // (the floor bands (grime, the hazard stripe) only down at a real floor: not on the drums stacked up the wall)
  const dn = dn0 === 0 && at(c, r + 1) !== '#' ? 1 : dn0;
  // (the light: the lamps hang under the ceiling; a band of shadow right up under it, the wall brightest a row or two
  // down, falling off toward the floor; the floor's grime)
  const lit = up === 0 ? 1 : up === 1 ? 3 : up <= 3 ? 3 : 2;
  R(g, x, y, CELL, CELL, L[lit]);
  if (up === 0) { R(g, x, y, CELL, 10, L[0]); checker(g, x, y + 10, CELL, 4, L[0], 0, 2); checker(g, x, y + 26, CELL, 4, L[2], 1, 2); }
  if (up === 1) checker(g, x, y, CELL, 4, L[1], 0, 2);
  if (up >= 4 && dn > 0) checker(g, x, y, CELL, 4, L[3], 1, 2);
  switch (t) {
    case 'door': {
      // (cinder block: two courses a cell, staggered; each block bevelled (lit top-left, shaded bottom-right))
      for (let k = 0; k < 2; k++) {
        const by = y + k * 20, off = ((r * 2 + k) % 2) * 20;
        for (const bx of [x - 20 + off, x + off]) {
          const x0 = Math.max(x, bx), x1 = Math.min(x + CELL, bx + 40);
          if (x1 <= x0) continue;
          R(g, x0, by, x1 - x0, 1, L[0]); R(g, x0, by + 1, x1 - x0, 1, mix(L[lit], L[5], 0.35)); R(g, x0, by + 18, x1 - x0, 2, mix(L[lit], L[0], 0.5));
          if (bx >= x && bx < x + CELL) { R(g, bx, by, 1, 20, L[0]); R(g, bx + 1, by + 1, 1, 17, mix(L[lit], L[5], 0.25)); }
        }
      }
      if (h2(c, r) < 0.18) checker(g, x + 8, y + 6, 18, 12, L[Math.max(0, lit - 1)], 1, 2);
      break;
    }
    case 'piss': {
      // (glazed tile gone yellow, 20 px; a glint on each; cracked ones; the stains running down from the grout)
      for (let ty = 0; ty < 2; ty++) for (let tx = 0; tx < 2; tx++) {
        const px = x + tx * 20, py = y + ty * 20, s = h2(c * 2 + tx, r * 2 + ty);
        R(g, px, py, 20, 1, L[0]); R(g, px, py, 1, 20, L[0]);
        R(g, px + 2, py + 2, 4, 1, L[5]); R(g, px + 2, py + 2, 1, 3, L[5]);
        if (s < 0.08) { g.strokeStyle = L[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(px + 4, py + 3); g.lineTo(px + 11, py + 12); g.lineTo(px + 9, py + 19); g.stroke(); }
        else if (s < 0.12) R(g, px + 1, py + 1, 19, 19, mix(L[lit], '#2A2008', 0.45));
      }
      if (h2(r, c) < 0.3) { R(g, x + 6 + Math.floor(h2(c, r + 3) * 26), y, 3, 40, mix(L[lit], '#6A4A08', 0.4)); }
      if (dn === 0) { R(g, x, y + 24, CELL, 16, mix(L[1], '#5A4A06', 0.4)); checker(g, x, y + 20, CELL, 4, mix(L[1], '#5A4A06', 0.4), 0, 2); }
      break;
    }
    case 'chem': {
      // (corrugated steel: a rib every 10 px, lit on its left; a seam between sheets now and then, rivets on it; the
      // hazard stripe along the floor)
      for (let k = 0; k < 4; k++) { R(g, x + k * 10, y, 3, CELL, L[Math.min(5, lit + 1)]); R(g, x + k * 10 + 3, y, 1, CELL, L[Math.max(0, lit - 1)]); }
      if (c % 5 === 0) { R(g, x, y, 2, CELL, L[0]); for (let k = 0; k < 2; k++) R(g, x + 3, y + 8 + k * 20, 2, 2, L[5]); }
      if (h2(c, r) < 0.2) checker(g, x + 4, y + 10, 26, 16, mix(L[lit], '#5A4A1A', 0.4), 0, 2);
      if (dn === 0) {
        R(g, x, y + 26, CELL, 10, '#1A1A10');
        for (let k = -1; k < 4; k++) { g.fillStyle = back('#C8A020', 0.25); g.beginPath(); g.moveTo(x + k * 12, y + 36); g.lineTo(x + k * 12 + 6, y + 26); g.lineTo(x + k * 12 + 12, y + 26); g.lineTo(x + k * 12 + 6, y + 36); g.closePath(); g.fill(); }
        R(g, x, y + 36, CELL, 4, L[0]);
      }
      break;
    }
    case 'gang': {
      // (riveted plate, 40 px sheets: the edges, a ring of rivets, rust weeping from them; the girders' X behind)
      R(g, x, y, CELL, 1, L[0]); R(g, x, y, 1, CELL, L[0]); R(g, x + 1, y + 1, CELL - 1, 1, L[Math.min(5, lit + 1)]);
      for (const [rx, ry] of [[4, 4], [34, 4], [4, 34], [34, 34], [19, 4], [19, 34]] as const) { R(g, x + rx, y + ry, 3, 3, L[0]); R(g, x + rx, y + ry, 2, 2, L[Math.min(5, lit + 2)]); }
      if (h2(c, r) < 0.35) { R(g, x + 5, y + 7, 2, 14 + Math.floor(h2(r, c) * 20), mix(L[lit], '#7A3A10', 0.55)); }
      break;
    }
    case 'shaft':
    case 'pipes': {
      // (raw poured concrete: the form lines every 40, tie holes, aggregate dithered in, rust streaks off the vents)
      R(g, x, y + 39, CELL, 1, L[0]);
      for (const [hx, hy] of [[8, 10], [30, 26]] as const) { R(g, x + hx, y + hy, 3, 3, L[0]); R(g, x + hx, y + hy + 3, 3, 1, L[Math.min(5, lit + 1)]); }
      checker(g, x + 2, y + 2, 36, 36, L[Math.max(0, lit - 1)], (c + r) % 2, 2);
      for (let k = 0; k < 5; k++) R(g, x + Math.floor(h2(c + k, r) * 36), y + Math.floor(h2(c, r + k) * 36), 2, 2, L[Math.min(5, lit + 2)]);
      if (h2(c, r) < 0.25) R(g, x + 16, y, 4, CELL, mix(L[lit], '#6A3A14', 0.4));
      break;
    }
    case 'pump': {
      // (painted concrete: the blue dado up to a meter, the cream above, the stripe between; a bolted panel now and then)
      const dado = dn <= 1;
      R(g, x, y, CELL, CELL, dado ? L[lit + 1] : mix(L[5], L[0], 0.5 - lit * 0.08));
      if (dado) { checker(g, x, y + 30, CELL, 10, L[lit], 0, 2); if (dn === 1) { R(g, x, y, CELL, 3, '#C8A020'); R(g, x, y + 3, CELL, 1, '#5A4A10'); } }
      else if (up === 0) { R(g, x, y, CELL, 10, mix(L[5], L[0], 0.75)); checker(g, x, y + 10, CELL, 4, mix(L[5], L[0], 0.75), 0, 2); }
      if (!dado && c % 7 === 3 && dn === 3) { R(g, x + 4, y + 6, 32, 26, L[1]); R(g, x + 5, y + 7, 30, 24, mix(L[5], L[0], 0.4)); for (const [bx, by] of [[7, 9], [31, 9], [7, 27], [31, 27]] as const) R(g, x + bx, y + by, 2, 2, L[0]); }
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The junk against the back wall, section by section (what's here, where: read off the grid once): stood on the floor
// in front of the wall or fixed to it, behind the play, dimmed back (none of it reads as somewhere to stand: no lit
// tops). Kept off the ladders, the signs, the break room, the filter's housing, the doors, the cast's marks don't
// matter (it's behind them).
//
//   door   lockers (dented, one hanging open), a bulletin board (THE SCHEDULE, a missing cat), a fire extinguisher
//          (empty: its tag says so), a time clock, a mop and a wringer bucket
//   piss   the filter's plumbing: a valve wheel on a riser, a gauge in the red, a drain grate, a hose reel
//   chem   steel shelving of jugs (dimmed), a broken safety shower, an MSDS binder on a hook, a skull placard
//   gang   girder X-braces (dimmed, dark), a red warning beacon, a chain hanging
//   shaft  conduits up the wall, a junction box (open, the wires out)
//   pump   a control panel (lights, a big red button taped over), a pressure gauge, a pipe manifold

interface Junk { x: number; y: number; w: number; h: number; kind: string; seed: number }
const SIGN_XS = SIGNS3.map(s => s.x);
const JUNK: Junk[] = (() => {
  const out: Junk[] = [];
  const kinds: Record<Theme, [string, number, number][]> = {
    door: [['locker', 90, 112], ['board', 64, 46], ['extinguisher', 18, 44], ['clock', 28, 38], ['mop', 40, 84]],
    piss: [['valve', 40, 120], ['gauge', 30, 30], ['reel', 40, 46], ['riser', 22, 160]],
    chem: [['shelf', 96, 124], ['shower', 44, 150], ['binder', 26, 34], ['skull', 30, 30]],
    gang: [['beacon', 22, 26], ['chain', 14, 120]],
    shaft: [['box', 34, 40]],
    pipes: [],
    pump: [['panel', 80, 90], ['gauge', 30, 30], ['manifold', 120, 70]],
  };
  let last = -99;
  for (let c = 2; c < COLS - 2; c++) {
    const t = themeAt(c), list = kinds[t];
    if (!list.length || c - last < 4) continue;
    for (let r = 2; r < ROWS - 1; r++) {
      // (a floor: air here, rock (not a drum) under it; air over it high enough)
      if (!(at(c, r) === '.' && at(c, r + 1) === '#')) continue;
      const hsh = h2(c * 3, r * 5);
      if (hsh < 0.45) continue;
      const [kind, w, h] = list[Math.floor(h2(c, r * 7) * list.length)];
      const x = cellX(c) + 20 - w / 2, floor = cellY(r + 1);
      const wallMount = kind === 'board' || kind === 'clock' || kind === 'gauge' || kind === 'binder' || kind === 'skull' || kind === 'beacon' || kind === 'box' || kind === 'extinguisher';
      const y = wallMount ? floor - (kind === 'beacon' ? 150 : kind === 'extinguisher' ? 70 : 110) - h : kind === 'chain' ? floor - 200 : floor - h;
      // (clear of rock over it, ladders, signs, the break room and the filter's housing and the pump room's pumps)
      let ok = true;
      for (let cc = Math.floor(x / CELL); cc <= Math.floor((x + w - 1) / CELL) && ok; cc++) for (let rr = Math.floor((y - Y0) / CELL); rr <= r && ok; rr++) { const ch = at(cc, rr); if (ch !== '.' && !/[0-9jtgerohaBAs]/.test(ch)) ok = false; }
      if (!ok) continue;
      if (SIGN_XS.some(sx => Math.abs(sx - (x + w / 2)) < w / 2 + 70)) continue;
      if (LADDERS3.some(l => Math.abs(l.x - (x + w / 2)) < w / 2 + 40)) continue;
      if (t === 'door' && c >= 14 && c <= 34) continue;
      if (t === 'pump' && x > PUMP_ROOM.x + 200) continue;
      if (x < 160) continue;
      out.push({ x, y, w, h, kind, seed: c * 31 + r });
      last = c;
      break;
    }
  }
  return out;
})();
/** A box in steps: inked round, lit top and left, shaded bottom and right (pushed back: `k`). */
const bev = (g: Ctx, x: number, y: number, w: number, h: number, col: string, k = 0.38) => {
  R(g, x - 1, y - 1, w + 2, h + 2, INK);
  R(g, x, y, w, h, back(col, k));
  R(g, x, y, w, 2, back(mix(col, '#FFFFFF', 0.25), k + 0.1)); R(g, x, y, 2, h, back(mix(col, '#FFFFFF', 0.15), k + 0.1));
  R(g, x, y + h - 2, w, 2, back(mix(col, '#000000', 0.35), k)); R(g, x + w - 2, y, 2, h, back(mix(col, '#000000', 0.3), k));
};
const paintJunk = (g: Ctx, j: Junk) => {
  const { x, y, w, h } = j, s = hash(j.seed);
  switch (j.kind) {
    case 'locker': for (let k = 0; k < 3; k++) {
      const lx = x + k * 30, open = k === Math.floor(s * 3) && s > 0.4;
      bev(g, lx, y, 28, h, ['#5A6A7A', '#4A5A6A', '#6A5A4A'][k]);
      for (let v = 0; v < 4; v++) R(g, lx + 6, y + 8 + v * 4, 16, 1, back('#1A1E22'));
      R(g, lx + 20, y + 50, 3, 10, back('#AAB0B4'));
      if (open) { R(g, lx + 2, y + 2, 24, h - 4, back('#0A0C0E', 0.1)); R(g, lx + 6, y + 30, 14, 20, back('#7A5A3A')); R(g, lx + 26, y, 8, h, back('#6A7A8A')); }
      else if (k === 1) { g.strokeStyle = back('#2A2E32'); g.lineWidth = 1; g.beginPath(); g.moveTo(lx + 6, y + 70); g.lineTo(lx + 14, y + 78); g.lineTo(lx + 9, y + 86); g.stroke(); }
    } break;
    case 'board': {
      bev(g, x, y, w, h, '#8A6A3A'); R(g, x + 4, y + 4, w - 8, h - 8, back('#B89A6A'));
      R(g, x + 8, y + 7, 22, 16, back('#F0ECE0', 0.3)); for (let v = 0; v < 4; v++) R(g, x + 10, y + 10 + v * 3, 18, 1, back('#4A4A4A', 0.3));
      R(g, x + 34, y + 8, 22, 26, back('#E8E070', 0.3)); R(g, x + 39, y + 12, 12, 9, back('#6A5A4A', 0.3)); R(g, x + 37, y + 25, 16, 1, back('#2A2A2A', 0.3));
      for (const [px, py] of [[19, 7], [45, 8]] as const) R(g, x + px, y + py - 1, 2, 2, back('#C83A2A', 0.2));
      break;
    }
    case 'extinguisher': { bev(g, x + 3, y + 8, 12, h - 8, '#B82A1A', 0.3); R(g, x + 5, y + 2, 8, 7, back('#2A2A2A')); R(g, x + 6, y + 20, 7, 9, back('#E8E4D0', 0.3)); R(g, x + 9, y + 1, 7, 2, back('#2A2A2A')); break; }
    case 'clock': { bev(g, x, y, w, h, '#8A8A80'); R(g, x + 5, y + 5, 18, 12, back('#2A3A2A')); R(g, x + 7, y + 8, 12, 2, back('#8AE07A', 0.25)); R(g, x + 9, y + 22, 10, 12, back('#1A1A1A')); break; }
    case 'mop': {
      R(g, x + 2, y + h - 34, 34, 34, INK); R(g, x + 4, y + h - 32, 30, 30, back('#C8A020', 0.3)); R(g, x + 4, y + h - 32, 30, 3, back('#E8C840', 0.35));
      R(g, x + 30, y, 3, h - 30, back('#8A6A3A')); for (let k = 0; k < 5; k++) R(g, x + 25 + k * 3, y + h - 40, 2, 14, back('#B8B0A0'));
      break;
    }
    case 'valve': case 'riser': {
      bev(g, x + w / 2 - 8, y, 16, h, '#6A5A3A'); for (let yy = y + 20; yy < y + h; yy += 40) R(g, x + w / 2 - 10, yy, 20, 5, back('#4A3E28'));
      if (j.kind === 'valve') { g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(x + w / 2, y + 40, 16, 0, Math.PI * 2); g.stroke(); g.strokeStyle = back('#B83A2A', 0.3); g.lineWidth = 3; g.beginPath(); g.arc(x + w / 2, y + 40, 16, 0, Math.PI * 2); g.stroke(); for (let a = 0; a < 3; a++) R(g, x + w / 2 - 1, y + 26, 2, 28, back('#B83A2A', 0.3)); }
      break;
    }
    case 'gauge': {
      g.fillStyle = INK; g.beginPath(); g.arc(x + 15, y + 15, 15, 0, Math.PI * 2); g.fill();
      g.fillStyle = back('#E8E4D0', 0.3); g.beginPath(); g.arc(x + 15, y + 15, 12, 0, Math.PI * 2); g.fill();
      g.fillStyle = back('#C83A2A', 0.25); g.beginPath(); g.moveTo(x + 15, y + 15); g.arc(x + 15, y + 15, 12, -0.6, 0.3); g.fill();
      g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 15, y + 15); g.lineTo(x + 25, y + 18); g.stroke();
      break;
    }
    case 'reel': { g.fillStyle = INK; g.beginPath(); g.arc(x + 20, y + 22, 20, 0, Math.PI * 2); g.fill(); g.fillStyle = back('#B83A2A'); g.beginPath(); g.arc(x + 20, y + 22, 17, 0, Math.PI * 2); g.fill(); for (let k = 0; k < 4; k++) { g.strokeStyle = back('#7A1A10'); g.lineWidth = 1; g.beginPath(); g.arc(x + 20, y + 22, 6 + k * 3, 0, Math.PI * 2); g.stroke(); } R(g, x + 18, y + 40, 4, 6, back('#3A3A3A')); break; }
    case 'shelf': {
      // (steel shelving: three shelves of jugs and jerry cans, dim; the uprights; nothing lit on top: not a ledge)
      for (const ux of [x, x + w - 6]) R(g, ux, y, 6, h, back('#4A525A', 0.5));
      for (let k = 0; k < 3; k++) {
        const sy = y + 20 + k * 38; R(g, x, sy, w, 4, back('#3A424A', 0.5));
        for (let q = 0; q < 4; q++) { const jx = x + 8 + q * 21, jh = 16 + ((j.seed + q + k) % 3) * 4, col = ['#E8E4D0', '#3A6AB0', '#C8A020', '#B83A2A'][(q + k + j.seed) % 4]; R(g, jx - 1, sy - jh - 1, 16, jh + 1, back(INK, 0.3)); R(g, jx, sy - jh, 14, jh, back(col, 0.5)); R(g, jx + 4, sy - jh - 4, 5, 4, back(col, 0.55)); }
      }
      break;
    }
    case 'shower': {
      R(g, x + 20, y, 4, h, back('#5A6A3A')); R(g, x + 6, y, 32, 4, back('#5A6A3A')); g.fillStyle = back('#3A8A3A'); g.beginPath(); g.ellipse(x + 8, y + 10, 10, 6, 0, 0, Math.PI * 2); g.fill();
      R(g, x + 12, y + 60, 22, 10, back('#E8E070', 0.3)); R(g, x + 14, y + 63, 18, 1, back('#2A2A2A', 0.3)); R(g, x + 14, y + 66, 12, 1, back('#2A2A2A', 0.3));
      g.strokeStyle = back('#C8A020', 0.2); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 23, y + 30); g.lineTo(x + 30, y + 52); g.stroke();
      break;
    }
    case 'binder': { R(g, x + 11, y - 6, 4, 6, back('#8A8A8A')); bev(g, x, y, w, h, '#C83A2A', 0.3); R(g, x + 4, y + 4, w - 8, 8, back('#F0ECE0', 0.3)); R(g, x + 6, y + 7, w - 12, 1, back('#2A2A2A', 0.3)); break; }
    case 'skull': {
      g.fillStyle = INK; g.beginPath(); g.moveTo(x + 15, y - 2); g.lineTo(x + 32, y + 15); g.lineTo(x + 15, y + 32); g.lineTo(x - 2, y + 15); g.closePath(); g.fill();
      g.fillStyle = back('#F0F0E8', 0.25); g.beginPath(); g.moveTo(x + 15, y + 1); g.lineTo(x + 29, y + 15); g.lineTo(x + 15, y + 29); g.lineTo(x + 1, y + 15); g.closePath(); g.fill();
      R(g, x + 10, y + 9, 10, 9, INK); R(g, x + 11, y + 11, 3, 3, back('#F0F0E8', 0.25)); R(g, x + 16, y + 11, 3, 3, back('#F0F0E8', 0.25)); R(g, x + 12, y + 19, 6, 3, INK);
      break;
    }
    case 'beacon': { bev(g, x, y + 14, w, 12, '#3A3A3A'); g.fillStyle = INK; g.beginPath(); g.arc(x + 11, y + 14, 11, Math.PI, 0); g.fill(); g.fillStyle = '#B83A2A'; g.beginPath(); g.arc(x + 11, y + 14, 9, Math.PI, 0); g.fill(); R(g, x + 6, y + 7, 3, 3, '#F08A7A'); break; }
    case 'chain': { for (let k = 0; k < h / 10; k++) { R(g, x + 4 + (k % 2) * 2, y + k * 10, 6, 9, INK); R(g, x + 5 + (k % 2) * 2, y + k * 10 + 1, 4, 7, back('#6A6A62')); } R(g, x, y + h - 6, 14, 10, back('#5A5A52')); break; }
    case 'box': { bev(g, x, y, w, h, '#6A7A6A'); R(g, x + 4, y + 4, w - 8, h - 8, back('#1A1E1A', 0.2)); for (let k = 0; k < 3; k++) { g.strokeStyle = back(['#C83A2A', '#3A6AB0', '#C8A020'][k], 0.2); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 10 + k * 6, y + h - 8); g.quadraticCurveTo(x + 8 + k * 8, y + h + 12, x + 16 + k * 4, y + h + 24); g.stroke(); } break; }
    case 'panel': {
      bev(g, x, y, w, h, '#4A5A6A'); R(g, x + 6, y + 8, w - 12, 30, back('#1A2A2A', 0.2));
      for (let k = 0; k < 6; k++) R(g, x + 10 + k * 11, y + 14 + (k % 2) * 10, 5, 5, ['#86EFAC', '#FDE68A', '#F87171'][k % 3]);
      g.fillStyle = INK; g.beginPath(); g.arc(x + w / 2, y + 62, 13, 0, Math.PI * 2); g.fill(); g.fillStyle = back('#C83A2A', 0.15); g.beginPath(); g.arc(x + w / 2, y + 62, 10, 0, Math.PI * 2); g.fill();
      R(g, x + w / 2 - 16, y + 58, 32, 8, back('#C8B888', 0.3)); R(g, x + w / 2 - 12, y + 61, 24, 1, back('#2A2A2A', 0.3));
      break;
    }
    case 'manifold': {
      for (let k = 0; k < 3; k++) bev(g, x + 10 + k * 40, y, 16, h, '#3A5A6A');
      bev(g, x, y + 20, w, 16, '#3A5A6A'); for (let k = 0; k < 4; k++) R(g, x + 6 + k * 36, y + 18, 6, 20, back('#2A3A44'));
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// A chunk: 10 x 10 cells: the back wall, the junk against it, the rock over their edges, the drums, the vents, the
// liquids' bodies

const CH = 10, CW = CH * CELL;
const paintChunk = (g: Ctx, ci: number, cj: number) => {
  const c0 = ci * CH, r0 = cj * CH;
  for (let r = r0; r < r0 + CH; r++) for (let c = c0; c < c0 + CH; c++) {
    if (r >= ROWS || c >= COLS) continue;
    const ch = GRID[r][c], x = cellX(c), y = cellY(r);
    if (isRock(ch)) continue;
    // ---- what's behind it: the pipe's inside (water: rust in steps, its ribs every two cells, rivets), the wall (air)
    if (isWater(ch)) {
      const up = toCeil(c, r);
      R(g, x, y, CELL, CELL, PIPE[up === 0 ? 1 : 2]);
      if (up === 0) checker(g, x, y + 10, CELL, 6, PIPE[1], 0, 2);
      R(g, x, y + ((r * 7) % 3) * 10 + 6, CELL, 2, PIPE[1]);
      if (c % 2 === 0) { R(g, x, y, 4, CELL, PIPE[3]); R(g, x + 4, y, 2, CELL, PIPE[0]); R(g, x, y, 1, CELL, PIPE[5]); for (let k = 0; k < 3; k++) R(g, x + 1, y + 6 + k * 14, 2, 2, PIPE[5]); }
      if (h2(c, r) < 0.3) checker(g, x + 8, y + 14, 24, 12, PIPE[3], 0, 2);
      if (h2(r, c) < 0.15) R(g, x + 12, y + 4, 10, 6, '#1A3A30');
      continue;
    }
    wallCell(g, themeAt(c), c, r, x, y);
    // (under a ceiling: the conduit along the top, its brackets, a sagging cable)
    if (isRock(at(c, r - 1))) {
      R(g, x, y + 4, CELL, 7, CONC[0]); R(g, x, y + 5, CELL, 5, CONC[2]); R(g, x, y + 5, CELL, 1, CONC[4]);
      if (c % 6 === 0) { R(g, x + 16, y + 1, 6, 12, CONC[1]); R(g, x + 17, y + 2, 4, 10, CONC[3]); }
      const sag = Math.round(4 + Math.sin(c * 0.9) * 3);
      R(g, x, y + 13 + sag, CELL, 2, '#0A0A0A'); R(g, x, y + 13 + sag, CELL, 1, '#3A3A3A');
    }
  }
  // ---- the junk (any of it that reaches into this chunk: the stamp's edge clips the rest)
  const cx0 = c0 * CELL, cx1 = cx0 + CW, cy0 = Y0 + r0 * CELL, cy1 = cy0 + CW;
  for (const j of JUNK) if (j.x < cx1 && j.x + j.w + 20 > cx0 && j.y < cy1 && j.y + j.h + 30 > cy0) paintJunk(g, j);
  // ---- the rock (over the wall's edges), the drums, the vents
  for (let r = r0; r < r0 + CH; r++) for (let c = c0; c < c0 + CH; c++) {
    if (r >= ROWS || c >= COLS) continue;
    const ch = GRID[r][c], x = cellX(c), y = cellY(r);
    if (ch === '#') {
      // (poured concrete: its body dithered with aggregate, a crack now and then, the form's line)
      R(g, x, y, CELL, CELL, CONC[1]);
      checker(g, x, y, CELL, CELL, CONC[2], (c + r) % 2, 4);
      for (let k = 0; k < 4; k++) R(g, x + Math.floor(h2(c + k, r * 3) * 36), y + Math.floor(h2(c * 5, r + k) * 36), 2, 2, k % 2 ? CONC[3] : CONC[0]);
      if (h2(r, c) < 0.12) { R(g, x + 8, y + 12, 18, 1, CONC[0]); R(g, x + 20, y + 13, 10, 1, CONC[0]); R(g, x + 26, y + 14, 6, 1, CONC[0]); }
      const up = at(c, r - 1), dn = at(c, r + 1), lf = at(c - 1, r), rt = at(c + 1, r);
      // (a face to the air: the slab's edge in steps; the top lit (stood on), the underside in shadow)
      if (air(up) && !isWater(up)) {
        R(g, x, y, CELL, 12, CONC[3]); R(g, x, y, CELL, 5, CONC[4]); R(g, x, y, CELL, 2, CONC[5]); checker(g, x, y + 12, CELL, 4, CONC[3], 0, 2);
        // (the pump room's: a yellow safety edge)
        if (themeAt(c) === 'pump') { R(g, x, y + 2, CELL, 3, '#C8A020'); R(g, x, y + 2, CELL, 1, '#F0D060'); }
      }
      else if (air(up)) { R(g, x, y, CELL, 6, CONC[3]); R(g, x, y, CELL, 1, CONC[4]); }
      if (air(dn)) { R(g, x, y + CELL - 10, CELL, 10, CONC[0]); checker(g, x, y + CELL - 14, CELL, 4, CONC[0], 0, 2); R(g, x, y + CELL - 2, CELL, 2, INK); if (h2(c, r + 7) < 0.3) R(g, x + 14, y + CELL - 1, 3, 5, '#1E2A26'); }
      if (air(lf)) { R(g, x, y, 5, CELL, CONC[2]); R(g, x, y, 2, CELL, CONC[3]); R(g, x, y, 1, CELL, INK); }
      if (air(rt)) { R(g, x + CELL - 5, y, 5, CELL, CONC[0]); R(g, x + CELL - 1, y, 1, CELL, INK); }
    } else if (ch === 'd' || ch === 'D') {
      wallCell(g, themeAt(c), c, r, x, y);
      // (a chlorine drum: blue plastic in steps, its ribs, the skull label; the rim on top lit when it's stood on)
      R(g, x + 1, y, CELL - 2, CELL, INK); R(g, x + 3, y + 1, CELL - 6, CELL - 2, DRUM[2]);
      R(g, x + 3, y + 1, 4, CELL - 2, DRUM[3]); R(g, x + 7, y + 1, 2, CELL - 2, DRUM[4]); R(g, x + CELL - 10, y + 1, 7, CELL - 2, DRUM[1]); checker(g, x + CELL - 14, y + 1, 4, CELL - 2, DRUM[1], 0, 2);
      R(g, x + 3, y + 11, CELL - 6, 3, DRUM[0]); R(g, x + 3, y + 11, CELL - 6, 1, DRUM[4]); R(g, x + 3, y + 28, CELL - 6, 3, DRUM[0]); R(g, x + 3, y + 28, CELL - 6, 1, DRUM[4]);
      R(g, x + 12, y + 15, 16, 12, '#E8E4D0'); R(g, x + 12, y + 15, 16, 1, '#FFFFFF'); R(g, x + 17, y + 17, 6, 5, INK); R(g, x + 18, y + 18, 1, 1, '#E8E4D0'); R(g, x + 21, y + 18, 1, 1, '#E8E4D0'); R(g, x + 16, y + 23, 8, 1, INK);
      if (!isRock(at(c, r - 1))) { R(g, x + 1, y, CELL - 2, 4, DRUM[4]); R(g, x + 1, y, CELL - 2, 1, '#C8DCF4'); }
      if (ch === 'D') {
        // (cracked: the split, the stain running down from it)
        g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 30, y + 4); g.lineTo(x + 26, y + 12); g.lineTo(x + 31, y + 18); g.stroke();
        R(g, x + 26, y + 18, 6, CELL - 19, '#8A9A2A'); checker(g, x + 24, y + 22, 10, 14, '#A8B83A', 0, 2); R(g, x + 27, y + 18, 2, CELL - 19, '#C8D85A');
      }
    } else if (ch === 'v') {
      R(g, x, y, CELL, CELL, CONC[1]); checker(g, x, y, CELL, CELL, CONC[2], (c + r) % 2, 4);
      // (a steam vent: a grated nozzle out of the wall, rust weeping round it)
      const dir = air(at(c + 1, r)) ? 1 : -1, nx = dir > 0 ? x + CELL - 14 : x;
      R(g, x + (dir > 0 ? 0 : 14), y + 14, 26, 12, PIPE[2]); R(g, x + (dir > 0 ? 0 : 14), y + 14, 26, 2, PIPE[4]); R(g, x + (dir > 0 ? 0 : 14), y + 24, 26, 2, PIPE[0]);
      R(g, nx, y + 8, 14, 24, INK); R(g, nx + 1, y + 9, 12, 22, CONC[3]); R(g, nx + 1, y + 9, 12, 2, CONC[5]);
      for (let k = 0; k < 4; k++) R(g, nx + 1, y + 11 + k * 5, 12, 2, INK);
      R(g, nx + (dir > 0 ? 2 : 8), y + 32, 4, 8, mix(CONC[1], '#6A3A14', 0.5));
    } else if (ch === 'P' || ch === 'C') {
      // (the liquids, banded darker down, dithered between)
      const L = ch === 'P' ? PISS : SLUDGE, top = !(at(c, r - 1) === ch), deep = at(c, r + 1) !== ch;
      R(g, x, y, CELL, CELL, L[top ? 3 : 2]);
      if (top) { R(g, x, y + 20, CELL, 20, L[2]); checker(g, x, y + 16, CELL, 4, L[2], 0, 2); }
      else { checker(g, x, y, CELL, 6, L[3], 0, 2); if (deep) { R(g, x, y + 20, CELL, 20, L[1]); checker(g, x, y + 16, CELL, 4, L[1], 0, 2); } }
      if (h2(c, r) < 0.3) { R(g, x + 8 + h2(r, c) * 20, y + 14, 4, 4, L[4]); R(g, x + 9 + h2(r, c) * 20, y + 14, 2, 1, L[5]); }
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

/** A box in its steps, full strength (the props stood in the room, not pushed back): inked, lit top-left, shaded. */
const box3 = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => {
  R(g, x - 2, y - 2, w + 4, h + 4, INK);
  R(g, x, y, w, h, col);
  R(g, x, y, w, 3, mix(col, '#FFFFFF', 0.3)); R(g, x, y + 3, w, 2, mix(col, '#FFFFFF', 0.12)); R(g, x, y, 3, h, mix(col, '#FFFFFF', 0.18));
  R(g, x, y + h - 4, w, 4, mix(col, '#000000', 0.35)); checker(g, x, y + h - 8, w, 4, mix(col, '#000000', 0.35), 0, 2);
  R(g, x + w - 4, y, 4, h, mix(col, '#000000', 0.28));
};
const paintDoorIn = (g: Ctx) => {
  // (the way in, behind him: the steel door off the lazy river's landing, propped open with a mop bucket; the frame in
  // steps, the night's blue through it, the push bar)
  const x = 6, y = cellY(13);
  R(g, x - 4, y + 26, 92, 174, INK); R(g, x, y + 30, 84, 170, '#0A1424');
  bandedGradient(g, x + 2, y + 32, 66, 166, ['#1A2A48', '#0E1A30', '#08101E'], 6);
  for (let k = 0; k < 6; k++) R(g, x + 8 + k * 11, y + 60 + (k % 3) * 9, 2, 2, '#FDE68A');
  box3(g, x + 70, y + 30, 16, 170, '#6B7280');
  R(g, x + 74, y + 100, 8, 20, '#3A3E44'); R(g, x + 74, y + 100, 8, 2, '#9CA3AF');
  R(g, x + 10, y + 50, 50, 10, '#2A3A4A'); R(g, x + 10, y + 50, 50, 2, '#4A5A6A');
  // (a mop bucket wedging it, the mop in it)
  box3(g, x + 72, y + 168, 30, 32, '#C8A020'); R(g, x + 74, y + 172, 26, 4, '#5A4A1A');
  R(g, x + 92, y + 118, 4, 54, '#8A6A3A'); R(g, x + 92, y + 118, 1, 54, '#B89A6A');
};
const paintBreakRoom = (g: Ctx, x0: number) => {
  const fy = cellY(18);
  // (the couch: brown plaid, a cushion missing, a blanket balled up)
  box3(g, x0, fy - 52, 150, 52, '#5A3A22');
  R(g, x0 + 4, fy - 48, 142, 12, '#6E4A2C'); R(g, x0 + 4, fy - 48, 142, 2, '#8A6040');
  for (let k = 0; k < 7; k++) { R(g, x0 + 10 + k * 20, fy - 48, 2, 44, '#4A2E1A'); R(g, x0 + 4, fy - 40 + (k % 3) * 12, 142, 1, '#4A2E1A'); }
  R(g, x0 + 4, fy - 30, 50, 12, '#2A180C'); checker(g, x0 + 4, fy - 30, 50, 4, '#4A2E1A', 0, 2);
  box3(g, x0 + 98, fy - 32, 46, 14, '#7A5A3A');
  box3(g, x0 + 110, fy - 46, 30, 14, '#5A6A7A'); R(g, x0 + 116, fy - 42, 18, 2, '#7A8A9A');
  // (the vending machine: half the slots empty, a bag of chips stuck halfway, the glass's glare)
  const vx = x0 + 190;
  box3(g, vx, fy - 150, 70, 150, '#8A1A1A');
  R(g, vx + 8, fy - 140, 40, 100, '#14181E');
  for (let k = 0; k < 5; k++) { R(g, vx + 8, fy - 121 + k * 19, 40, 2, '#3A3E44'); for (let j = 0; j < 3; j++) if (hash(k * 3 + j) > 0.4) { const col = ['#E8C020', '#2A8A3A', '#C83A2A', '#3A5AC8'][(k + j) % 4]; R(g, vx + 11 + j * 12, fy - 136 + k * 19, 9, 12, col); R(g, vx + 11 + j * 12, fy - 136 + k * 19, 9, 2, mix(col, '#FFFFFF', 0.4)); } }
  R(g, vx + 23, fy - 98, 9, 18, '#E8C020');
  g.globalAlpha = 0.18; g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(vx + 10, fy - 140); g.lineTo(vx + 22, fy - 140); g.lineTo(vx + 10, fy - 110); g.closePath(); g.fill(); g.globalAlpha = 1;
  box3(g, vx + 52, fy - 130, 10, 30, '#3A3E44'); R(g, vx + 54, fy - 120, 6, 2, '#E8C020');
  R(g, vx + 8, fy - 30, 40, 16, '#0A0A0A'); R(g, vx + 8, fy - 30, 40, 2, '#2A2A2A');
  // (the table, the microwave (its door open: something exploded in it), a coffee maker gone black, the fridge)
  const tx = x0 + 300;
  R(g, tx, fy - 60, 120, 6, INK); R(g, tx + 2, fy - 58, 116, 3, '#B8A890'); R(g, tx + 2, fy - 58, 116, 1, '#E0D4C0'); R(g, tx + 8, fy - 54, 4, 54, INK); R(g, tx + 108, fy - 54, 4, 54, INK);
  box3(g, tx + 10, fy - 96, 56, 36, '#D8D4C8'); R(g, tx + 16, fy - 90, 32, 24, '#3A2A1A'); checker(g, tx + 16, fy - 90, 32, 24, '#8A5A2A', 0, 2); R(g, tx + 52, fy - 88, 8, 16, '#3A3A3A');
  box3(g, tx + 76, fy - 84, 22, 24, '#2A2A2A'); R(g, tx + 80, fy - 72, 14, 10, '#4A2A10'); R(g, tx + 80, fy - 72, 14, 2, '#7A4A20');
  box3(g, tx + 140, fy - 160, 70, 160, '#C8C8C0'); R(g, tx + 142, fy - 104, 66, 2, INK); R(g, tx + 196, fy - 150, 4, 30, '#7A7A70'); R(g, tx + 196, fy - 92, 4, 40, '#7A7A70');
  R(g, tx + 152, fy - 140, 30, 22, '#F8F4E0'); R(g, tx + 155, fy - 135, 24, 2, '#2A2A2A'); R(g, tx + 155, fy - 129, 18, 2, '#2A2A2A'); R(g, tx + 165, fy - 143, 4, 4, '#C83A2A');
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
  // (clear of the tease tank on its left and the outflow's sign on its right: 200 and 300 in)
  for (const px of [x0 + 205, x0 + 305]) {
    box3(g, px - 28, fy - 108, 56, 70, '#3A5A6A');
    for (let k = 0; k < 4; k++) R(g, px - 24, fy - 98 + k * 14, 46, 2, '#2A4A5A');
    box3(g, px - 34, fy - 38, 68, 38, '#2A3A44');
    R(g, px - 10, fy - 92, 20, 8, '#C8A020'); R(g, px - 10, fy - 92, 20, 2, '#F0D060');
    g.fillStyle = INK; g.beginPath(); g.arc(px, fy - 58, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = '#E8E4D0'; g.beginPath(); g.arc(px, fy - 58, 7, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#C83A2A'; g.lineWidth = 2; g.beginPath(); g.moveTo(px, fy - 58); g.lineTo(px + 5, fy - 62); g.stroke();
    R(g, px - 4, fy - 128, 8, 20, '#2A3A44'); R(g, px - 4, fy - 128, 2, 20, '#4A6A7A');
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
    // (a caged bulb on a box: the glow round it in steps when it's on)
    if (on) { c.globalAlpha = 0.16; c.fillStyle = '#FDE68A'; c.fillRect(l.x - 16, l.y - 2, 32, 26); c.globalAlpha = 0.22; c.fillRect(l.x - 11, l.y + 1, 22, 18); c.globalAlpha = 1; }
    R(c, l.x - 6, l.y - 2, 12, 4, INK); R(c, l.x - 5, l.y - 2, 10, 2, '#5A5E62');
    R(c, l.x - 7, l.y + 2, 14, 14, INK);
    R(c, l.x - 5, l.y + 4, 10, 10, on ? '#F0C850' : '#3A3A30'); R(c, l.x - 5, l.y + 4, 10, 4, on ? '#FDE68A' : '#4A4A40');
    if (on) R(c, l.x - 3, l.y + 5, 3, 3, '#FFFBEB');
    R(c, l.x - 1, l.y + 2, 2, 14, INK); R(c, l.x - 7, l.y + 9, 14, 1, INK);
  }
};
export const tunnelLights = (state: GameState): Light[] => {
  const f = state.frame, out: Light[] = [];
  for (const l of LAMPS) if (lampOn(l, f) && vis(state, l.x - 260, l.x + 260, 0) && visY(state, l.y - 260, l.y + 260, 0)) out.push({ x: l.x, y: l.y + 30, r: 230, a: 0.55, color: '#FDE68A' });
  return out;
};
export { SEC };
