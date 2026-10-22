// CHELSEA AND SOCKS' WACKY WHITE HOUSE, part two, painted (the SNES pass, on part one's kit): the show's West Wing the
// way a 1994 Saturday morning cartoon paints it at peak SNES: flat bright cel colors in stepped ramps, a fat black line
// round everything, dithered seams, nothing quite straight. The rooms (rooms.ts: their back walls painted once for the
// hour, their ceilings and floors going back to the one eye, the house's brick over them; the Oval Office's walls
// curving round); the far off over the Rose Garden is part one's (whitehouse1/far.ts); here, the West Colonnade out of
// doors (its columns and lanterns, the Rose Garden going back: the lawn in mowed stripes, the beds of roses, the
// crabapples and the magnolias, the Residence's west end, the West Wing's end wall with its French door) and the play
// plane.
//
// In the play plane, everything he stands on lit along its top, its top going back to the eye where he can see it: the
// filing cabinets (government steel, label cards, the drawers out of either face: manila folders, a lit lip), the EIB
// broadcast desk (its board, the boom mic, DITTO mug), the studio shelves (tape boxes), the jelly mold (a ring of lime
// gelatin in steps, the fruit set in it, a cherry), the range (stainless, the oven windows, the knobs, the grates; the
// burners' rings and their fire), the pot rack (iron on chains, copper pots), the cabinet table (mahogany, the chairs'
// backs dimmed, name plates and pitchers at the back), the Cabinet Room's shelves, the globe on its carved stand, the
// library step, the map chest (flat drawers, brass label frames, a rolled chart on it), the footstool, the Resolute desk
// (carved oak, the Seal on its kneehole, the green leather, THE BUCK STOPS HERE), the Oval's shelves (a model ship, a
// bust). The lasers' housings dark (nothing to stand on), their beams stepped. Each room's placard on a gilt easel; the
// Oval Office's far wall the house's own brick, cut.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { signText, signW } from '../../signLetters';
import { timeOfDay } from '../../timeOfDay';
import { box, mix, hash, checker, toonLetters, toonSign, onScreen, INK, still, sideBack, boxSides, GRASS, STEEL, BRASS, CHERRY, LICORICE, type Ctx } from '../kit';
import { GY } from '../geometry';
import { wh2Of } from './state';
import { drawerOut, burnerAt, blinkAt, sweepAt, jelloWobble, FIRE_H, FIRE_W } from './hazards';
import {
  CABINETS, DRAWER_W, DRAWER_D, DESK_EIB, JELLO, RANGE, BURNERS, POT_RACK, CAB_TABLE, GLOBE, MAP_STEP, MAP_CAB, MAP_STOOL, RESOLUTE,
  BLINKERS, SWEEP, LIMBAUGH_ARENA, DOLE_ARENA, NEWT_ARENA, OVAL_WALL, CEIL, D_BACK, X, Y, type Cabinet,
} from './layout';
import { R, GILT, MARBLE, NAVY, OAK, VELVET, inkP, slabI, stepsAcross, stepsDown, column, seal, starAt, tinyLetters, cutaway, type R6 } from '../whitehouse1/paint';
import { eyeOf, proj, atDepth, seenAt, quad, type P } from '../whitehouse1/rooms';
import { drawRooms2 } from './rooms';

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** The lit lip along anything he stands on. */
const litTop = (c: Ctx, x: number, y: number, w: number) => { box(c, x + 1, y - 1, w - 2, 1, INK); box(c, x + 2, y, w - 4, 2, '#FFF6E0'); box(c, x + 6, y, w * 0.4, 1, '#FFFFFF'); };
/** Scenery's colors (dimmed toward the air: none of it reads as somewhere to stand). */
const dim = (col: string) => mix(col, '#8E86B4', 0.3);
const dimR = (Rm: R6): R6 => Rm.map(dim);
const STEELG: R6 = ['#2A3430', '#3E4C46', '#56665E', '#728478', '#9AAC9E', '#C8D6CA'];
const CHROME: R6 = ['#3A3E4C', '#5E6476', '#8A90A2', '#B4BACA', '#DCE0EA', '#FFFFFF'];
const MAHOG: R6 = ['#2A0E08', '#4A1A0E', '#6E2814', '#94381E', '#BA5A34', '#DE8A5E'];
const COPPER: R6 = ['#4A1E0A', '#7A3414', '#B05420', '#D8783A', '#F0A464', '#FFD0A0'];
const LIME: R6 = ['#0E4A1E', '#16702E', '#22A040', '#4CCC5C', '#8AE88A', '#D0FAC8'];

// ---------------------------------------------------------------------------------------------------------------
// The West Colonnade (outdoors): the Rose Garden going back, the Residence's west end, the colonnade, the West Wing's
// end wall

const paintResidenceEnd = (g: Ctx) => {
  // (local: x from X(-560), feet at 0: the Residence's west end over the garden: white ashlar, two storeys of windows
  // under pediments, the roof's balustrade, a lantern by the door)
  const w = 700, h = 640, M = MARBLE;
  slabI(g, 0, -h, w, h, M);
  for (let y = -h + 40; y < 0; y += 24) { box(g, 0, y, w, 1, M[2]); for (let k = ((y / 24) & 1) * 30; k < w; k += 60) box(g, k, y, 1, 24, M[2]); }
  const tod = timeOfDay(), glass = tod.lamps > 0.3 ? ['#8A4A10', '#D08A24', '#F6BE48'] : ['#2E5A86', '#4A84B4', '#74AED8'];
  for (let x = 50; x < w - 60; x += 120) for (const [wy, wh] of [[-500, 130], [-260, 120]] as [number, number][]) {
    box(g, x - 4, wy - 4, 62, wh + 8, INK); box(g, x - 3, wy - 3, 60, wh + 6, M[4]);
    box(g, x, wy, 54, wh, glass[1]); box(g, x, wy, 54, wh * 0.3, glass[2]); box(g, x + 26, wy, 2, wh, M[4]); for (let k = 1; k < 4; k++) box(g, x, wy + (wh * k) / 4, 54, 2, M[4]);
    box(g, x - 11, wy, 9, wh, '#2E5A3E'); box(g, x + 56, wy, 9, wh, '#2E5A3E'); for (let k = 4; k < wh; k += 6) { box(g, x - 10, wy + k, 7, 1, '#1E4A2E'); box(g, x + 57, wy + k, 7, 1, '#1E4A2E'); }
    inkP(g, () => { g.moveTo(x - 12, wy - 6); g.lineTo(x + 27, wy - 24); g.lineTo(x + 66, wy - 6); g.closePath(); }, M[4], 1.6);
  }
  slabI(g, 0, -h - 34, w, 34, M);
  for (let x = 6; x < w; x += 12) { box(g, x, -h - 28, 6, 22, M[4]); box(g, x + 4, -h - 28, 2, 22, M[2]); }
  slabI(g, -6, -h - 42, w + 12, 10, M);
  slabI(g, -6, -330, w + 12, 16, M);
};
const paintHedge2 = (g: Ctx, w: number, seed: number) => {
  // (local: x 0..w, the hedge's foot at 0: clipped boxwood in steps, roses along its foot)
  const G = GRASS;
  stepsDown(g, () => g.roundRect(0, -64, w, 64, [22, 22, 4, 4]), 0, -64, w, 64, G, 2);
  for (let k = 0; k < w; k += 9) { const x = k + hash(k + seed) * 4; box(g, x, -58 + hash(k * 3 + seed) * 26, 3, 2, G[5]); box(g, x + 2, -30 + hash(k * 7) * 16, 3, 2, G[1]); }
  for (let k = 8; k < w - 6; k += 14) { const col = ['#E11D48', '#F472B6', '#FFFFFF', '#FB7185'][Math.floor(hash(k * 1.3 + seed) * 4)]; box(g, k, -14, 2, 12, G[1]); box(g, k - 4, -10, 4, 2, G[3]); inkP(g, () => g.arc(k + 1, -17, 4.5, 0, Math.PI * 2), col, 1); g.strokeStyle = mix(col, INK, 0.35); g.lineWidth = 1; g.beginPath(); g.arc(k + 1, -17, 2, 0.4, Math.PI * 1.6); g.stroke(); box(g, k - 1, -20, 2, 1, mix(col, '#FFFFFF', 0.6)); }
};
const paintTree2 = (g: Ctx, seed: number, magnolia: boolean) => {
  // (a crabapple in bloom or a magnolia (white and pink cups): a crooked trunk, a cloud of blossom in steps)
  const P = magnolia ? ['#6A3A5A', '#B48AA8', '#E8C8DE', '#F8E8F2', '#FFFFFF'] : ['#7A2A4A', '#B44A7A', '#E07AA8', '#F6A8CA', '#FFD2E6'];
  g.strokeStyle = INK; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-10, -50, 6, -96); g.stroke();
  g.strokeStyle = '#5A3A2A'; g.lineWidth = 7; g.stroke(); g.strokeStyle = '#7A5A3E'; g.lineWidth = 2; g.beginPath(); g.moveTo(-3, -4); g.quadraticCurveTo(-11, -50, 3, -92); g.stroke(); g.lineCap = 'butt';
  for (const [dx, dy, r, k] of [[0, -118, 50, 0], [-36, -100, 34, 0], [36, -104, 36, 0], [0, -122, 44, 1], [-32, -104, 26, 1], [32, -108, 28, 1], [-12, -134, 30, 2], [-22, -140, 14, 3]] as [number, number, number, number][]) {
    if (k === 0) { g.fillStyle = INK; g.beginPath(); g.arc(dx, dy, r + 2, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = P[k + 1]; g.beginPath(); g.arc(dx, dy, r, 0, Math.PI * 2); g.fill();
  }
  for (let k = 0; k < 30; k++) { const a = hash(seed + k) * Math.PI * 2, d = hash(seed + k * 3) * 46, x = Math.cos(a) * d, y = -118 + Math.sin(a) * d * 0.8; if (magnolia) { inkP(g, () => g.ellipse(x, y, 3.5, 4.5, 0, 0, Math.PI * 2), k % 3 ? '#FFFFFF' : '#F6C6DE', 0.8); box(g, x - 1, y - 3, 2, 2, '#FFFFFF'); } else box(g, x - 1, y, 2, 2, k % 3 ? P[4] : '#FFFFFF'); }
};
const paintRoseBed = (g: Ctx, w: number, seed: number) => {
  // (local: a bed of tree roses in a boxwood border, the soil, a little brass plaque)
  box(g, 0, -10, w, 10, '#5A3A22'); checker(g, 0, -10, w, 10, '#4A2A16', 0, 1);
  for (let x = 20; x < w - 10; x += 46) {
    box(g, x - 1, -56, 3, 50, '#3A5A2A');
    stepsDown(g, () => g.arc(x, -64, 18, 0, Math.PI * 2), x - 18, -82, 36, 36, GRASS, 1.6);
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + hash(x + seed), rx = x + Math.cos(a) * 11, ry = -66 + Math.sin(a) * 10, col = ['#E11D48', '#F472B6', '#FFFFFF', '#FB7185'][(Math.floor(hash(x * 0.3 + seed) * 4) + k) % 4]; inkP(g, () => g.arc(rx, ry, 4, 0, Math.PI * 2), col, 0.9); box(g, rx - 1, ry - 2, 2, 1, mix(col, '#FFFFFF', 0.6)); }
  }
  stepsDown(g, () => g.roundRect(-2, -18, w + 4, 18, 6), -2, -18, w + 4, 18, GRASS, 1.6);
};
const paintColonnadeRun = (g: Ctx, w: number, last: boolean) => {
  // (local: x 0..w, the terrace at 0: the colonnade's columns (Doric, white), the entablature with its triglyphs, the
  // cornice, the flat roof's edge; the lanterns' brackets. The last run stops flush at the West Wing's end)
  const r = last ? w : w + 10, rr = last ? w : w + 16;
  slabI(g, -8, -10, rr + 8, 10, MARBLE);
  for (let x = 60; x < w; x += 150) column(g, x, -10, -370, 28, MARBLE, false);
  slabI(g, -10, -404, r + 10, 34, MARBLE);
  for (let x = 6; x < r - 8; x += 40) { box(g, x, -398, 12, 22, MARBLE[2]); box(g, x + 4, -398, 1, 22, MARBLE[1]); box(g, x + 8, -398, 1, 22, MARBLE[1]); }
  slabI(g, -16, -420, rr + 16, 16, MARBLE);
  for (let x = -12; x < rr - 4; x += 8) box(g, x, -406, 5, 3, MARBLE[2]);
  box(g, -16, -424, rr + 16, 4, '#5A8A7A'); box(g, -16, -424, rr + 16, 1, '#8ABCAA');
  for (let x = 135; x < w; x += 150) { box(g, x - 1, -370, 3, 28, INK); box(g, x, -370, 1, 28, BRASS[4]); }
};
const colonnade = (c: Ctx, state: GameState, E: P) => {
  const a = X(-600), b = X(1100);
  if (!onScreen(state, a - 300, b + 300) && !seenAt(state, E, a, b, 0.7)) return;
  // (the Residence's west end, far back over the garden)
  if (seenAt(state, E, X(-560), X(140), 0.7)) atDepth(c, E, 0.7, () => still(c, 'wh2-residence', X(-560), GY, -12, -700, 724, 704, paintResidenceEnd));
  // (the lawn going back: banded, mowed stripes, the garden's limestone walk)
  const dk = (k: number) => 0.7 + 0.3 * k, G = GRASS;
  for (let i = 0; i < 5; i++) quad(c, [proj(E, a, GY, dk(i / 5)), proj(E, b, GY, dk(i / 5)), proj(E, b, GY, dk((i + 1) / 5)), proj(E, a, GY, dk((i + 1) / 5))], G[1 + Math.min(3, i)]);
  for (let x = -600; x < 1100; x += 80) quad(c, [proj(E, X(x), GY, dk(0.05)), proj(E, X(x + 40), GY, dk(0.05)), proj(E, X(x + 40), GY, dk(0.82)), proj(E, X(x), GY, dk(0.82))], 'rgba(174,234,156,0.2)');
  const walk = (k0: number, k1: number, col: string) => quad(c, [proj(E, a, GY, dk(k0)), proj(E, b, GY, dk(k0)), proj(E, b, GY, dk(k1)), proj(E, a, GY, dk(k1))], col);
  walk(0.84, 1, '#E8DCC2'); walk(0.84, 0.86, '#F6EEDC'); walk(0.98, 1, '#C8B894');
  for (let x = -600; x < 1100; x += 40) { const p0 = proj(E, X(x), GY, dk(0.84)), p1 = proj(E, X(x), GY, dk(1)); c.strokeStyle = '#C8B894'; c.lineWidth = 1; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  // (at the garden's back: the trees, then the hedge with its roses; nearer, the beds of tree roses)
  atDepth(c, E, 0.76, () => {
    for (let x = -520; x < 1100; x += 260) if (seenAt(state, E, X(x) - 70, X(x) + 70, 0.76)) still(c, `wh2-tree-${(x / 260) & 1}`, X(x), GY - 50, -80, -196, 160, 198, g => paintTree2(g, x, ((x / 260) & 1) === 1));
    for (let x = -600; x < 1100; x += 170) if (seenAt(state, E, X(x), X(x + 170), 0.76)) still(c, 'wh2-hedge', X(x), GY, -4, -70, 170, 74, g => paintHedge2(g, 166, 7));
  });
  atDepth(c, E, 0.86, () => {
    for (let x = -540; x < 1050; x += 320) if (seenAt(state, E, X(x), X(x + 240), 0.86)) still(c, 'wh2-rosebed', X(x), GY, -6, -90, 252, 92, g => paintRoseBed(g, 240, 3));
  });
  // (the colonnade's own floor going back to its columns: limestone pavers)
  for (let i = 0; i < 2; i++) quad(c, [proj(E, a, GY, 0.94 + i * 0.03), proj(E, b, GY, 0.94 + i * 0.03), proj(E, b, GY, 0.97 + i * 0.03), proj(E, a, GY, 0.97 + i * 0.03)], i ? '#EDE4D0' : '#DDD2BA');
  // (the colonnade: its columns, entablature and roof, its ceiling going back, its lanterns (lit after dark))
  const cy = Y(420);
  quad(c, [proj(E, a, Y(370), 0.94), proj(E, b, Y(370), 0.94), proj(E, b, Y(370), 1), proj(E, a, Y(370), 1)], '#E2DCCC');
  for (let x = -600; x < 1100; x += 30) { const p0 = proj(E, X(x), Y(370), 0.94), p1 = proj(E, X(x), Y(370), 1); c.strokeStyle = '#C8BEA8'; c.lineWidth = 1; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  atDepth(c, E, 0.94, () => {
    for (let x = -600; x < 1100; x += 600) {
      const w = Math.min(600, 1100 - x), last = x + 600 >= 1100;
      if (seenAt(state, E, X(x) - 30, X(x + w + 30), 0.94)) still(c, `wh2-colrun-${w}`, X(x), GY, -20, -430, w + 40, 432, g => paintColonnadeRun(g, w, last));
    }
    const night = timeOfDay().lamps > 0.3;
    for (let x = -465; x < 1060; x += 150) {
      const lx = X(x), ly = Y(342);
      if (!seenAt(state, E, lx - 20, lx + 20, 0.94)) continue;
      const sw = Math.sin(state.frame * 0.03 + x) * 1.5;
      inkP(c, () => { c.moveTo(lx - 9 + sw, ly); c.lineTo(lx + 9 + sw, ly); c.lineTo(lx + 7 + sw, ly + 24); c.lineTo(lx - 7 + sw, ly + 24); c.closePath(); }, '#1A1A24', 1.6);
      box(c, lx - 5 + sw, ly + 3, 10, 18, night ? '#FFE08A' : '#E8E4D0'); box(c, lx - 5 + sw, ly + 3, 3, 18, night ? '#FFF8D8' : '#FFFFFF');
      inkP(c, () => { c.moveTo(lx - 11 + sw, ly); c.lineTo(lx + sw, ly - 8); c.lineTo(lx + 11 + sw, ly); c.closePath(); }, '#2A2A36', 1.2);
    }
  });
  void cy;
};
const dAt = (k: number) => 1 - (1 - D_BACK) * k;
/** The West Wing's end wall at the colonnade's end, going back (drawn over the rooms): from out in the colonnade its
 *  white outside (a French door, windows, the cornice); from inside the offices its inner face (the office's paper, a
 *  light switch, a fire extinguisher). */
const wingEnd = (c: Ctx, state: GameState, E: P) => {
  const ew = X(1100);
  if (!onScreen(state, ew - 400, ew + 400)) return;
  const q = (k0: number, k1: number, y0: number, y1: number, col: string) => quad(c, [proj(E, ew, Y(y0), dAt(k0)), proj(E, ew, Y(y0), dAt(k1)), proj(E, ew, Y(y1), dAt(k1)), proj(E, ew, Y(y1), dAt(k0))], col);
  if (E.x < ew - 1) {
    const M = MARBLE;
    sideBack(c, E, ew, -1, Y(CEIL + 140), GY, 1, D_BACK, [M[1], M[2], M[3], M[3], M[5], M[5]], 3);
    for (let y = 24; y < CEIL + 140; y += 24) q(0, 1, y, y + 1, M[2]);
    q(0.35, 0.65, 0, 210, M[1]); q(0.38, 0.62, 0, 196, '#2A3A5A'); q(0.38, 0.62, 140, 196, '#4A84B4'); q(0.495, 0.505, 0, 196, M[4]);
    q(0.35, 0.65, 210, 222, M[4]); q(0.4, 0.6, 222, 236, M[3]);
    q(0.12, 0.26, 230, 330, '#2A3A5A'); q(0.13, 0.25, 290, 330, '#4A84B4'); q(0.74, 0.88, 230, 330, '#2A3A5A'); q(0.75, 0.87, 290, 330, '#4A84B4');
    q(0.12, 0.26, 330, 338, M[4]); q(0.74, 0.88, 330, 338, M[4]);
    q(0, 1, CEIL - 6, CEIL + 6, M[4]); q(0, 1, CEIL + 6, CEIL + 10, M[1]);
    if (timeOfDay().lamps > 0.3) { q(0.385, 0.615, 4, 190, '#8A4A10'); q(0.385, 0.615, 140, 190, '#F6BE48'); }
  } else if (E.x > ew + 1) {
    const W = R('#CFE8D8');
    sideBack(c, E, ew, 1, Y(CEIL), GY, 1, D_BACK, W, 3);
    q(0, 1, 0, 110, R('#8EAE9C')[2]); q(0, 1, 104, 112, R('#8EAE9C')[5]);
    q(0, 1, CEIL - 30, CEIL, W[4]); q(0, 1, CEIL - 20, CEIL - 14, GILT[3]);
    q(0.3, 0.38, 140, 170, '#B91C1C'); q(0.31, 0.37, 164, 170, '#2A2A36'); q(0.6, 0.64, 150, 162, '#F8F8F0');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane: what he stands on

const placard = (c: Ctx, x: number, feet: number, words: string[]) => {
  still(c, `wh2-placard-${words.join('|')}`, x, feet, -84, -156, 168, 160, g => {
    for (const [ax, bx] of [[-28, -6], [28, 6]] as [number, number][]) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(ax, 0); g.lineTo(bx, -124); g.stroke(); g.strokeStyle = GILT[3]; g.lineWidth = 3; g.stroke(); g.strokeStyle = GILT[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(ax - 1, 0); g.lineTo(bx - 1, -124); g.stroke(); }
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -60); g.stroke(); g.strokeStyle = GILT[1]; g.lineWidth = 2; g.stroke();
    slabI(g, -74, -78, 148, 8, GILT);
    slabI(g, -72, -144, 144, 66, GILT);
    box(g, -64, -136, 128, 50, INK); box(g, -63, -135, 126, 48, '#FFF6E2'); box(g, -63, -135, 126, 12, '#FFFFFF'); checker(g, -63, -123, 126, 2, '#FFFFFF', 0, 1); box(g, -63, -95, 126, 8, '#F2E2C2');
    for (const [cx, cy] of [[-68, -140], [68, -140], [-68, -82], [68, -82]]) { box(g, cx - 3, cy - 3, 6, 6, INK); box(g, cx - 2, cy - 2, 4, 4, GILT[5]); }
    words.forEach((w, i) => { const big = signW(w, toonLetters(2)) <= 118 ? 2 : 1; signText(g, w, 0, -112 + i * 20 + (words.length === 1 ? 8 : 0), toonLetters(big, i ? ['#C4B5FD', '#A78BFA', '#7C3AED', '#5B21B6'] : ['#FCA5A5', '#F87171', '#DC2626', '#991B1B'])); });
  });
};
const PLACARDS: [number, string[]][] = [
  [1160, ['THE WEST WING', 'OFFICES']], [2330, ['THE ROOSEVELT', 'ROOM']], [3640, ['THE KITCHENS']], [5040, ['THE CABINET', 'ROOM']],
  [6460, ['THE MAP ROOM']], [7860, ['THE SITUATION', 'ROOM']], [9340, ['THE OUTER', 'OVAL']],
];

/** A filing cabinet: government steel, drawer fronts all up it (label cards, chrome pulls), its top going back (a mug,
 *  a stack of files), the live drawers out of either face. */
const cabinetArt = (c: Ctx, E: P, C: Cabinet, f: number, ci: number) => {
  const a = X(C.a), w = C.b - C.a, t = Y(C.h);
  boxSides(c, E, a, a + w, t, GY, 0.9, STEELG, { lines: [t + 8, ...Array.from({ length: Math.max(0, Math.floor((GY - t - 46) / 40)) }, (_, k) => t + 14 + k * 40), GY - 10] });
  { const p = proj(E, a + w * 0.7, t, 0.93); inkP(c, () => c.roundRect(p.x - 5, p.y - 12, 10, 12, 2), '#F8F8F0', 1.2); box(c, p.x - 4, p.y - 8, 8, 2, '#DC2626'); const q = proj(E, a + w * 0.3, t, 0.94); for (let k = 0; k < 3; k++) box(c, q.x - 12, q.y - 3 - k * 3, 24, 3, k % 2 ? '#E8C890' : '#D8B070'); }
  still(c, `wh2-cab-${ci}`, a, GY, -4, -(GY - t) - 4, w + 8, GY - t + 6, g => {
    const h = GY - t;
    slabI(g, 0, -h, w, h, STEELG);
    box(g, 2, -h + 2, w - 4, 6, STEELG[4]); box(g, 2, -h + 8, w - 4, 2, STEELG[1]);
    for (let y = -h + 16; y < -30; y += 40) {
      box(g, 7, y, w - 14, 34, INK); box(g, 8, y + 1, w - 16, 32, STEELG[3]); box(g, 8, y + 1, w - 16, 2, STEELG[4]); box(g, 8, y + 31, w - 16, 2, STEELG[1]);
      slabI(g, w / 2 - 12, y + 6, 24, 10, GILT, 1); box(g, w / 2 - 9, y + 8, 18, 6, '#F8F8F0'); box(g, w / 2 - 7, y + 10, 12, 1, '#6A6A7A');
      slabI(g, w / 2 - 10, y + 20, 20, 6, CHROME, 1);
    }
    box(g, 0, -10, w, 10, STEELG[1]); box(g, 4, -10, w - 8, 2, STEELG[2]);
  });
  litTop(c, a, t, w);
  // (the live drawers out of either face: steel boxes in steps, their pull and card, manila folders standing in them)
  C.drawers.forEach((h, k) => {
    const out = drawerOut(ci, k, f), y = Y(h);
    if (out <= 0) { for (const s of [-1, 1]) { const x = s < 0 ? a - 3 : a + w; box(c, x, y, 3, DRAWER_D, INK); box(c, x + (s < 0 ? 1 : 0), y + 1, 2, DRAWER_D - 2, STEELG[2]); } return; }
    for (const s of [-1, 1]) {
      const dw = Math.max(2, DRAWER_W * out), x = s < 0 ? a - dw : a + w;
      // (the folders standing in it, behind its top edge)
      if (dw > 14) for (let p = 0; p < Math.floor(dw / 9); p++) { const fx = x + 4 + p * 9; box(c, fx, y - 4, 7, 5, p % 3 === 1 ? '#F8F8F0' : '#E8C890'); box(c, fx, y - 4, 7, 1, '#FFF2D0'); if (p % 2) box(c, fx + 1, y - 6, 3, 2, '#E8C890'); }
      box(c, x - 1, y - 1, dw + 2, DRAWER_D + 2, INK);
      box(c, x, y, dw, DRAWER_D, STEELG[3]); box(c, x, y, dw, 2, STEELG[4]); box(c, x, y + DRAWER_D - 3, dw, 3, STEELG[1]);
      checker(c, x, y + DRAWER_D - 5, dw, 2, STEELG[2], 0, 1);
      // (the drawer's front at its outer end)
      const fx = s < 0 ? x : x + dw - 6;
      box(c, fx, y, 6, DRAWER_D, STEELG[s < 0 ? 4 : 2]);
      if (dw > 22) { const px0 = s < 0 ? x + 8 : x + dw - 26; slabI(c, px0, y + 6, 18, 8, GILT, 1); box(c, px0 + 3, y + 8, 12, 4, '#F8F8F0'); slabI(c, px0 + 2, y + 18, 14, 5, CHROME, 1); }
      if (out > 0.6) litTop(c, x, y, dw);
    }
  });
};
/** Limbaugh's broadcast desk: the console in navy, the EIB plate, the board's faders going back, the boom mic, a mug. */
const eibDesk = (c: Ctx, E: P, f: number) => {
  const a = X(DESK_EIB.a), w = DESK_EIB.b - DESK_EIB.a, t = Y(DESK_EIB.h);
  boxSides(c, E, a, a + w, t, GY, 0.88, LICORICE, { sideR: NAVY, lines: [t + 8, GY - 8] });
  // (the board on the top going back: faders, VU meters (live), the cough button)
  const p0 = proj(E, a + 10, t, 0.93), p1 = proj(E, a + w - 10, t, 0.93);
  if (E.y < t) { for (let k = 0; k < 8; k++) { const x = p0.x + (k / 7) * (p1.x - p0.x); box(c, x - 1, p0.y - 1, 3, 3, INK); box(c, x - 2, p0.y - 2 + ((k * 3 + (f >> 4)) % 3), 4, 2, k % 3 ? '#E5E7EB' : '#DC2626'); } }
  const mp = proj(E, a + w - 22, t, 0.92);
  inkP(c, () => c.roundRect(mp.x - 6, mp.y - 14, 12, 14, 2), '#F8F8F0', 1.4); box(c, mp.x - 4, mp.y - 10, 8, 3, '#DC2626'); c.strokeStyle = INK; c.lineWidth = 1.4; c.beginPath(); c.arc(mp.x + 7, mp.y - 8, 3, -1.2, 1.2); c.stroke();
  still(c, 'wh2-eibdesk', a, t, -8, -6, w + 16, GY - t + 10, g => {
    const h = GY - t;
    stepsAcross(g, () => { g.moveTo(-4, 0); g.lineTo(w + 4, 0); g.lineTo(w, h); g.lineTo(0, h); g.closePath(); }, -4, 0, w + 8, h, NAVY, 2.6);
    slabI(g, -6, 0, w + 12, 8, LICORICE);
    for (const k of [0.25, 0.75]) box(g, Math.round(w * k), 12, 1, h - 18, NAVY[1]);
    // (the EIB plate: a gold mic, the letters)
    slabI(g, w / 2 - 34, 22, 68, 40, GILT);
    box(g, w / 2 - 30, 26, 60, 32, NAVY[1]);
    stepsAcross(g, () => g.ellipse(w / 2 - 16, 40, 6, 8, 0, 0, Math.PI * 2), w / 2 - 22, 32, 12, 16, GILT, 1.2); box(g, w / 2 - 17, 48, 2, 6, GILT[2]);
    signText(g, 'EIB', w / 2 + 8, 46, toonLetters(1, ['#FFF0A8', '#F2C84A', '#D09A30', '#A06C1C']));
    slabI(g, 2, h - 8, w - 4, 8, LICORICE);
  });
  litTop(c, a, t, w);
};
const studioShelf = (c: Ctx, E: P, a0: number, b0: number, h: number, k: number) => {
  const a = X(a0), b = X(b0), y = Y(h), w = b - a;
  boxSides(c, E, a, b, y, y + 14, 0.94, OAK);
  { const p = proj(E, a + 14, y, 0.95); for (let j = 0; j < 4; j++) { box(c, p.x + j * 13, p.y - 18, 11, 18, INK); box(c, p.x + j * 13 + 1, p.y - 17, 9, 16, ['#F8F4EC', '#E8C890', '#BFDBFE', '#F8F4EC'][(j + k) % 4]); box(c, p.x + j * 13 + 2, p.y - 13, 7, 2, '#DC2626'); } }
  still(c, `wh2-sshelf-${w}-${k}`, a, y, -4, -2, w + 8, 46, g => {
    slabI(g, 0, 0, w, 14, OAK); box(g, 3, 10, w - 6, 2, OAK[1]);
    for (const x of [12, w - 22]) { inkP(g, () => { g.moveTo(x, 14); g.lineTo(x + 10, 14); g.quadraticCurveTo(x + 10, 34, x + 2, 38); g.quadraticCurveTo(x - 2, 26, x, 14); g.closePath(); }, OAK[2], 1.4); inkP(g, () => g.arc(x + 4, 32, 3.5, 0, Math.PI * 2), GILT[4], 1); }
    for (let x = 8; x < w - 8; x += 12) box(g, x, 3, 6, 1, OAK[5]);
  });
  litTop(c, a, y, w);
};
/** THE JELLY MOLD: a ring of lime gelatin, stepped, the fruit set in it, a cherry on top, on a doily'd plate; wobbling. */
const jello = (c: Ctx, E: P, f: number) => {
  const a = X(JELLO.a), w = JELLO.b - JELLO.a, t = Y(JELLO.h), wob = jelloWobble.t > 0 ? Math.sin(f * 0.8) * (jelloWobble.t / 40) * 8 : Math.sin(f * 0.1) * 1;
  // (the plate and its doily)
  inkP(c, () => c.ellipse(a + w / 2, GY - 2, w / 2 + 16, 6, 0, 0, Math.PI * 2), '#F8FAFC', 2.4);
  for (let k = 0; k < 14; k++) { const ang = (k / 14) * Math.PI * 2; box(c, a + w / 2 + Math.cos(ang) * (w / 2 + 10) - 1, GY - 2 + Math.sin(ang) * 4 - 1, 3, 2, '#E8E4F0'); }
  const body = () => { c.moveTo(a, GY - 3); c.quadraticCurveTo(a - 6 - wob, t + 20, a + 8, t + wob * 0.5); c.lineTo(a + w - 8, t - wob * 0.5); c.quadraticCurveTo(a + w + 6 + wob, t + 20, a + w, GY - 3); c.closePath(); };
  stepsAcross(c, body, a - 8, t - 4, w + 16, GY - t, LIME, 3);
  // (the mold's ridges, the fruit set in it: cherries, pineapple bits, grapes)
  c.save(); c.beginPath(); body(); c.clip();
  for (let k = 1; k < 5; k++) { const x = a + (k * w) / 5 + wob * 0.3; box(c, x - 1, t + 4, 2, GY - t - 8, LIME[1]); box(c, x + 1, t + 4, 1, GY - t - 8, LIME[5]); }
  for (const [dx, dy, col] of [[16, 18, '#DC2626'], [44, 28, '#FDE047'], [70, 16, '#7C3AED'], [30, 36, '#F97316'], [82, 32, '#DC2626']] as [number, number, string][]) { c.fillStyle = mix(col, LIME[3], 0.35); c.beginPath(); c.arc(a + dx + wob * 0.2, t + dy, 4, 0, Math.PI * 2); c.fill(); box(c, a + dx - 1, t + dy - 2, 2, 1, '#FFFFFF'); }
  box(c, a, t + 4, w, 3, LIME[5]); checker(c, a, t + 7, w, 2, LIME[4], 0, 1);
  c.restore();
  c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.ellipse(a + 16, t + 14, 4, 9, 0.2, 0, Math.PI * 2); c.fill();
  // (the cherry and its stem)
  c.fillStyle = INK; c.beginPath(); c.arc(a + w / 2, t - 6 + wob * 0.3, 8, 0, Math.PI * 2); c.fill();
  c.fillStyle = CHERRY[3]; c.beginPath(); c.arc(a + w / 2, t - 6 + wob * 0.3, 6.6, 0, Math.PI * 2); c.fill();
  c.fillStyle = CHERRY[1]; c.beginPath(); c.arc(a + w / 2 + 2, t - 4 + wob * 0.3, 4, 0, Math.PI * 2); c.fill();
  box(c, a + w / 2 - 3, t - 10 + wob * 0.3, 2, 2, '#FFFFFF');
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(a + w / 2, t - 12 + wob * 0.3); c.quadraticCurveTo(a + w / 2 + 4, t - 22, a + w / 2 + 10, t - 24); c.stroke(); c.strokeStyle = '#5A8A2A'; c.lineWidth = 1; c.stroke();
  void E;
  litTop(c, a + 6, t, w - 12);
};
/** THE RANGE: a big commercial range in stainless, its top (grates, the burners live) going back. */
const range = (c: Ctx, E: P, f: number) => {
  const a = X(RANGE.a), w = RANGE.b - RANGE.a, t = Y(RANGE.h);
  boxSides(c, E, a, a + w, t, GY, 0.9, LICORICE, { sideR: CHROME, lines: [t + 12, GY - 12] });
  if (E.y < t) for (let x = a + 30; x < a + w - 20; x += 36) { const p0 = proj(E, x, t, 1), p1 = proj(E, x, t, 0.9); c.strokeStyle = '#4A4A58'; c.lineWidth = 1; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  still(c, 'wh2-range', a, t, -4, -2, w + 8, GY - t + 6, g => {
    const h = GY - t;
    slabI(g, 0, 0, w, h, CHROME);
    slabI(g, -2, 0, w + 4, 12, CHROME); box(g, 2, 10, w - 4, 2, CHROME[1]);
    // (the knobs along the front: black, a white tick)
    for (let x = 22; x < w - 10; x += 30) { inkP(g, () => g.arc(x, 22, 6, 0, Math.PI * 2), LICORICE[2], 1.4); box(g, x - 1, 16, 2, 4, '#FFFFFF'); box(g, x - 3, 19, 2, 2, LICORICE[4]); }
    // (the oven doors: windows dark (a turkey in one), chrome handles)
    for (let k = 0; k < 3; k++) {
      const ox = 14 + k * ((w - 28) / 3), ow = (w - 28) / 3 - 12;
      slabI(g, ox, 36, ow, h - 46, CHROME); slabI(g, ox + 6, 38, ow - 12, 6, R('#E8ECF2'));
      box(g, ox + 12, 50, ow - 24, h - 74, INK); box(g, ox + 13, 51, ow - 26, h - 76, '#2A1A14'); box(g, ox + 13, 51, ow - 26, 6, '#4A2A1A');
      if (k === 1) { inkP(g, () => g.ellipse(ox + ow / 2, h - 34, 20, 9, 0, Math.PI, 0), '#C2410C', 1.2); box(g, ox + ow / 2 - 14, h - 40, 6, 3, '#FDBA74'); }
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(ox + 16, 54, 6, h - 84);
    }
    box(g, 0, h - 8, w, 8, INK); box(g, 2, h - 7, w - 4, 6, CHROME[1]);
  });
  BURNERS.forEach((rx, k) => {
    const x = X(rx), bn = burnerAt(k, f);
    // (the ring and its grate; glowing and ticking in the tell)
    inkP(c, () => c.ellipse(x, t - 2, 22, 5, 0, 0, Math.PI * 2), '#2A2A36', 1.6);
    box(c, x - 24, t - 3, 48, 2, '#3A3A48'); box(c, x - 1, t - 7, 2, 6, '#3A3A48');
    if (bn.st === 'tell') { c.fillStyle = f % 8 < 4 ? '#FB923C' : '#F97316'; c.beginPath(); c.ellipse(x, t - 2, 16 * bn.k + 4, 3, 0, 0, Math.PI * 2); c.fill(); if (f % 8 < 4) box(c, x - 2, t - 4, 4, 1, '#FDE68A'); }
    if (bn.st === 'fire') {
      const h = FIRE_H * Math.min(1, bn.k * 6), wob = Math.sin(f * 0.7 + k) * 3;
      const flame = (pad: number, k2: number) => { c.beginPath(); c.moveTo(x - FIRE_W / 2 + pad, t); c.quadraticCurveTo(x - FIRE_W / 2 - 4 + wob + pad, t - h * 0.6 * k2, x + wob, t - h * k2); c.quadraticCurveTo(x + FIRE_W / 2 + 4 + wob - pad, t - h * 0.6 * k2, x + FIRE_W / 2 - pad, t); c.closePath(); };
      c.fillStyle = INK; flame(-2, 1.02); c.fill();
      c.fillStyle = '#DC2626'; flame(0, 1); c.fill();
      c.fillStyle = '#F97316'; flame(5, 0.86); c.fill();
      c.fillStyle = '#FDE047'; flame(11, 0.62); c.fill();
      c.fillStyle = '#FFFBEB'; flame(17, 0.3); c.fill();
      for (let j = 0; j < 3; j++) { const ty = t - h * (0.4 + ((f * 0.05 + j * 0.3) % 0.6)); box(c, x - 8 + j * 7 + wob, ty, 3, 4, j % 2 ? '#FDE047' : '#FFFFFF'); }
    }
  });
  litTop(c, a, t, w);
};
/** THE POT RACK: an iron bar hung off the ceiling on chains, copper pots swaying under it. */
const potRack = (c: Ctx, E: P, f: number) => {
  const a = X(POT_RACK.a), w = POT_RACK.b - POT_RACK.a, t = Y(POT_RACK.h);
  for (const x of [a + 20, a + w - 20]) { for (let y = Y(CEIL); y < t; y += 8) { box(c, x - 2, y, 5, 6, INK); box(c, x - 1, y + 1, 3, 4, (y / 8) % 2 ? STEEL[3] : STEEL[4]); } }
  for (let x = a + 40; x < a + w - 20; x += 64) {
    const sw = Math.sin(f * 0.05 + x) * 0.1, pot = (x / 64) % 3 | 0;
    c.save(); c.translate(x, t + 10); c.rotate(sw);
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -2); c.quadraticCurveTo(4, 6, 0, 12); c.stroke(); c.strokeStyle = STEEL[4]; c.lineWidth = 1.2; c.stroke();
    if (pot === 0) { stepsAcross(c, () => c.roundRect(-16, 12, 32, 20, [2, 2, 8, 8]), -16, 12, 32, 20, COPPER, 2); box(c, -18, 12, 36, 3, COPPER[4]); }
    else if (pot === 1) { stepsAcross(c, () => c.ellipse(0, 24, 16, 9, 0, 0, Math.PI * 2), -16, 15, 32, 18, LICORICE, 2); box(c, -1, 2, 3, 14, LICORICE[2]); }
    else { stepsAcross(c, () => c.roundRect(-12, 12, 24, 26, [2, 2, 6, 6]), -12, 12, 24, 26, CHROME, 2); box(c, -14, 12, 28, 3, CHROME[4]); }
    c.restore();
  }
  boxSides(c, E, a, a + w, t, t + 10, 0.94, R('#3A3A48'));
  slabI(c, a, t, w, 10, R('#3A3A48'));
  for (let x = a + 12; x < a + w - 6; x += 32) { box(c, x, t + 10, 2, 4, INK); }
  litTop(c, a, t, w);
};
/** The cabinet table: mahogany, the chairs' backs along the back (dimmed), name plates, pitchers, leather blotters. */
const cabinetTable = (c: Ctx, E: P) => {
  const a = X(CAB_TABLE.a), w = CAB_TABLE.b - CAB_TABLE.a, t = Y(CAB_TABLE.h);
  still(c, 'wh2-cabchairs', a, t, 0, -64, w, 66, g => { for (let x = 26; x < w - 30; x += 62) { stepsAcross(g, () => g.roundRect(x, -62, 36, 62, [14, 14, 0, 0]), x, -62, 36, 62, dimR(R('#3A2418')), 1.8); for (let k = 0; k < 4; k++) box(g, x + 4 + k * 9, -54, 2, 2, dim(GILT[4])); slabI(g, x + 10, -38, 16, 6, dimR(GILT), 1); } });
  boxSides(c, E, a, a + w, t, GY, 0.86, MAHOG, { apron: 28, leg: 12, lines: [t + 10] });
  if (E.y < t) {
    for (let x = a + 40; x < a + w - 30; x += 62) { const p = proj(E, x + 4, t, 0.93); box(c, p.x - 12, p.y - 2, 24, 4, '#2E5A3E'); box(c, p.x - 12, p.y - 2, 24, 1, '#4A8A5E'); }
    for (const dx of [80, 250]) { const p = proj(E, a + dx, t, 0.9); inkP(c, () => { c.moveTo(p.x - 5, p.y); c.lineTo(p.x - 6, p.y - 16); c.quadraticCurveTo(p.x, p.y - 22, p.x + 6, p.y - 16); c.lineTo(p.x + 5, p.y); c.closePath(); }, 'rgba(219,234,254,0.85)', 1.2); box(c, p.x - 3, p.y - 12, 2, 8, '#FFFFFF'); }
  }
  still(c, 'wh2-cabtable', a, t, -6, -12, w + 12, GY - t + 16, g => {
    const h = GY - t;
    // (the name plates along the near edge, the apron carved, turned legs)
    for (let k = 0; k < 5; k++) { slabI(g, 30 + k * 64, -8, 26, 8, GILT, 1); box(g, 34 + k * 64, -6, 18, 3, GILT[1]); }
    slabI(g, -4, 0, w + 8, 10, MAHOG);
    stepsDown(g, () => g.rect(4, 10, w - 8, 18), 4, 10, w - 8, 18, MAHOG, 2);
    for (let x = 14; x < w - 14; x += 20) { box(g, x, 16, 8, 6, MAHOG[2]); box(g, x, 16, 8, 1, MAHOG[4]); }
    for (const x of [14, w / 2 - 6, w - 26]) stepsAcross(g, () => { g.moveTo(x, 28); g.lineTo(x + 12, 28); g.quadraticCurveTo(x + 16, (h + 28) / 2, x + 10, h - 4); g.lineTo(x + 2, h - 4); g.quadraticCurveTo(x - 4, (h + 28) / 2, x, 28); g.closePath(); }, x - 4, 28, 20, h - 32, MAHOG, 2);
    for (const x of [20, w / 2, w - 20]) inkP(g, () => g.ellipse(x, h - 3, 8, 3, 0, 0, Math.PI * 2), GILT[3], 1.2);
  });
  litTop(c, a, t, w);
};
const giltShelf = (c: Ctx, E: P, a0: number, b0: number, h: number, what: 'books' | 'ship' | 'bust') => {
  const a = X(a0), b = X(b0), y = Y(h), w = b - a;
  boxSides(c, E, a, b, y, y + 12, 0.94, GILT);
  const p = proj(E, a + w / 2, y, 0.95);
  if (what === 'books') for (let j = 0; j < 5; j++) { const bx = p.x - 24 + j * 10; box(c, bx, p.y - 20 + (j % 2) * 2, 8, 20 - (j % 2) * 2, INK); box(c, bx + 1, p.y - 19 + (j % 2) * 2, 6, 18 - (j % 2) * 2, ['#7A1E2E', '#1E3A8A', '#2E6A3A', '#7A5A1E', '#5A2E6A'][j]); box(c, bx + 1, p.y - 15, 6, 1, GILT[4]); }
  else if (what === 'ship') { stepsDown(c, () => { c.moveTo(p.x - 24, p.y - 10); c.lineTo(p.x + 24, p.y - 10); c.lineTo(p.x + 16, p.y - 2); c.lineTo(p.x - 18, p.y - 2); c.closePath(); }, p.x - 24, p.y - 10, 48, 8, OAK, 1.4); for (const mx of [-10, 6]) { box(c, p.x + mx, p.y - 40, 2, 30, OAK[1]); inkP(c, () => { c.moveTo(p.x + mx + 2, p.y - 38); c.quadraticCurveTo(p.x + mx + 14, p.y - 28, p.x + mx + 2, p.y - 14); c.closePath(); }, '#F8F4EC', 1); } box(c, p.x - 12, p.y - 44, 6, 4, '#DC2626'); }
  else { slabI(c, p.x - 8, p.y - 14, 16, 14, MARBLE); inkP(c, () => g2(c, p.x, p.y - 26), MARBLE[4], 1.2); box(c, p.x - 4, p.y - 28, 2, 2, MARBLE[1]); box(c, p.x + 2, p.y - 28, 2, 2, MARBLE[1]); }
  still(c, `wh2-gshelf-${w}`, a, y, -4, -2, w + 8, 46, g => {
    slabI(g, 0, 0, w, 12, GILT); box(g, 3, 9, w - 6, 2, GILT[1]);
    for (let x = 6; x < w - 6; x += 7) box(g, x, 5, 3, 2, GILT[5]);
    for (const x of [12, w - 22]) { inkP(g, () => { g.moveTo(x, 12); g.lineTo(x + 10, 12); g.quadraticCurveTo(x + 12, 30, x + 2, 38); g.quadraticCurveTo(x - 4, 26, x, 12); g.closePath(); }, GILT[2], 1.4); inkP(g, () => g.arc(x + 4, 30, 3.5, 0, Math.PI * 2), GILT[4], 1); }
  });
  litTop(c, a, y, w);
};
const g2 = (c: Ctx, x: number, y: number) => c.ellipse(x, y, 7, 9, 0, 0, Math.PI * 2);
/** THE GLOBE on its carved stand: the ocean in steps, continents turning, the latitude lines, the brass meridian. */
const globeArt = (c: Ctx, state: GameState) => {
  const g = wh2Of(state).globe, sx = X(GLOBE.stand), f = state.frame;
  // (the stand: three cabriole legs, a stretcher, the cradle ring)
  still(c, 'wh2-globestand', sx, GY, -46, -GLOBE.standH - 14, 92, GLOBE.standH + 16, gg => {
    const h = GLOBE.standH;
    for (const s of [-1, 0, 1]) stepsAcross(gg, () => { gg.moveTo(s * 10 - 4, -h + 14); gg.quadraticCurveTo(s * 34, -h * 0.5, s * 38 - 3, -2); gg.lineTo(s * 38 + 5, -2); gg.quadraticCurveTo(s * 34 + 8, -h * 0.5, s * 10 + 4, -h + 14); gg.closePath(); }, s * 10 - 8, -h + 14, 50, h - 12, OAK, 1.8);
    for (const s of [-1, 1]) inkP(gg, () => g2(gg, s * 38, -4), BRASS[3], 1);
    slabI(gg, -24, -h * 0.35, 48, 6, OAK);
    stepsDown(gg, () => gg.ellipse(0, -h + 12, 34, 8, 0, 0, Math.PI * 2), -34, -h + 4, 68, 16, OAK, 2);
    box(gg, -26, -h + 8, 30, 2, OAK[5]);
  });
  if (g.st === 'split') {
    for (const [i, h] of g.halves.entries()) {
      c.save(); c.translate(h.x, GY); c.rotate(h.rock);
      // (a hemisphere: the ocean's outside in steps, a continent, the inside showing hollow at the cut)
      stepsAcross(c, () => { c.arc(0, 0, GLOBE.r, Math.PI, 0); c.closePath(); }, -GLOBE.r, -GLOBE.r, GLOBE.r * 2, GLOBE.r, SKYR, 3);
      c.save(); c.beginPath(); c.arc(0, 0, GLOBE.r - 2, Math.PI, 0); c.clip();
      stepsDown(c, () => c.ellipse(i ? -14 : 16, -28, 18, 12, 0.3, 0, Math.PI * 2), (i ? -14 : 16) - 18, -40, 36, 24, GRASS, 1.4);
      c.restore();
      inkP(c, () => c.ellipse(0, -2, GLOBE.r, 9, 0, 0, Math.PI * 2), '#2A3A5A', 2.4);
      inkP(c, () => c.ellipse(0, -2, GLOBE.r - 6, 6, 0, 0, Math.PI * 2), '#1A2440', 1);
      for (let k = -2; k <= 2; k++) box(c, k * 18 - 4, -6, 6, 2, '#F8F4EC');
      c.restore();
    }
    return;
  }
  const wob = g.st === 'tell' ? Math.sin(g.t * 1.1) * 0.12 : 0, x = g.x + (g.st === 'tell' ? Math.sin(g.t * 1.1) * 3 : 0), y = g.y, r = GLOBE.r;
  c.save(); c.translate(x, y); c.rotate(wob);
  c.fillStyle = INK; c.beginPath(); c.arc(0, 0, r + 2, 0, Math.PI * 2); c.fill();
  c.save(); c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.clip();
  for (let i = 0; i < 6; i++) { c.fillStyle = SKYR[5 - Math.min(5, i)]; c.beginPath(); c.arc(-r * 0.3 + i * r * 0.07, -r * 0.3 + i * r * 0.07, r * (1.4 - i * 0.18), 0, Math.PI * 2); c.fill(); }
  c.fillStyle = SKYR[1]; c.beginPath(); c.arc(r * 0.5, r * 0.5, r * 0.9, 0, Math.PI * 2); c.fill();
  c.fillStyle = SKYR[2]; c.beginPath(); c.arc(r * 0.2, r * 0.2, r * 0.9, 0, Math.PI * 2); c.fill();
  c.fillStyle = SKYR[3]; c.beginPath(); c.arc(-r * 0.1, -r * 0.1, r * 0.8, 0, Math.PI * 2); c.fill();
  for (const [lx, ly, w, h] of [[-30, -22, 36, 30], [8, -32, 30, 52], [26, 12, 28, 22], [-22, 22, 24, 16], [-58, 6, 22, 30]] as [number, number, number, number][]) {
    const ox = ((lx + g.spin * 30) % 150 + 150) % 150 - 75, sq = Math.cos((ox / r) * 1.2);
    if (sq <= 0.05) continue;
    c.fillStyle = INK; c.beginPath(); c.ellipse(ox, ly, (w / 2) * sq + 1, h / 2 + 1, 0.3, 0, Math.PI * 2); c.fill();
    c.fillStyle = ox < 0 ? GRASS[4] : GRASS[3]; c.beginPath(); c.ellipse(ox, ly, (w / 2) * sq, h / 2, 0.3, 0, Math.PI * 2); c.fill();
    box(c, ox - 4, ly - h / 4, 4, 2, GRASS[5]);
  }
  c.strokeStyle = 'rgba(26,16,40,0.35)'; c.lineWidth = 1; for (const k of [-0.5, 0, 0.5]) { c.beginPath(); c.ellipse(0, k * r * 0.8, r * Math.sqrt(1 - k * k * 0.64), 3, 0, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  box(c, -r * 0.5, -r * 0.62, 10, 4, '#FFFFFF'); box(c, -r * 0.62, -r * 0.45, 4, 8, '#FFFFFF');
  c.restore();
  if (g.st !== 'roll') { c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.arc(sx, y, r + 8, Math.PI * 0.75, Math.PI * 2.25); c.stroke(); c.strokeStyle = BRASS[3]; c.lineWidth = 3; c.stroke(); c.strokeStyle = BRASS[5]; c.lineWidth = 1; c.beginPath(); c.arc(sx, y, r + 7, Math.PI * 1.1, Math.PI * 1.5); c.stroke(); for (let k = 0; k < 9; k++) { const a = Math.PI * 0.8 + k * 0.17; box(c, sx + Math.cos(a) * (r + 8) - 1, y + Math.sin(a) * (r + 8) - 1, 2, 2, BRASS[1]); } }
  void f;
};
const SKYR: R6 = ['#0E3460', '#18568E', '#2A80C4', '#4CA8E8', '#86CAF4', '#C6E8FC'];
/** The library step, the map chest, the footstool. */
const mapFurniture = (c: Ctx, E: P) => {
  const sa = X(MAP_STEP.a), sw = MAP_STEP.b - MAP_STEP.a, st = Y(MAP_STEP.h);
  boxSides(c, E, sa, sa + sw, st, GY, 0.92, OAK, { lines: [st + 10] });
  still(c, 'wh2-mapstep', sa, st, -4, -2, sw + 8, GY - st + 6, g => {
    const h = GY - st;
    slabI(g, 0, 0, sw, 10, OAK); stepsAcross(g, () => g.rect(4, 10, sw - 8, h - 10), 4, 10, sw - 8, h - 10, OAK, 2);
    box(g, 10, 22, sw - 20, 3, OAK[1]); inkP(g, () => g.arc(sw / 2, 34, 3, 0, Math.PI * 2), GILT[4], 1);
  });
  litTop(c, sa, st, sw);
  const ma = X(MAP_CAB.a), mw = MAP_CAB.b - MAP_CAB.a, mt = Y(MAP_CAB.h);
  boxSides(c, E, ma, ma + mw, mt, GY, 0.88, OAK, { lines: [mt + 10, ...[0, 1, 2, 3].map(k => mt + 14 + k * ((GY - mt - 30) / 4)), GY - 8] });
  if (E.y < mt) { const p = proj(E, ma + mw * 0.6, mt, 0.92); stepsAcross(c, () => c.roundRect(p.x - 40, p.y - 9, 80, 9, 4), p.x - 40, p.y - 9, 80, 9, R('#F2E2B8'), 1.4); box(c, p.x - 2, p.y - 9, 4, 9, '#DC2626'); const q = proj(E, ma + 30, mt, 0.95); inkP(c, () => c.arc(q.x, q.y - 6, 6, 0, Math.PI * 2), 'rgba(219,234,254,0.7)', 1.6); box(c, q.x + 4, q.y - 3, 10, 3, OAK[2]); }
  still(c, 'wh2-mapcab', ma, mt, -6, -2, mw + 12, GY - mt + 6, g => {
    const h = GY - mt;
    slabI(g, -4, 0, mw + 8, 10, OAK);
    slabI(g, 0, 10, mw, h - 18, OAK);
    for (let k = 0; k < 4; k++) { const y = 16 + k * ((h - 30) / 4), dh = (h - 30) / 4 - 4; box(g, 8, y, mw - 16, dh, OAK[2]); box(g, 10, y + 1, mw - 20, dh - 2, OAK[3]); box(g, 10, y + 1, mw - 20, 1, OAK[4]); slabI(g, mw / 2 - 14, y + 3, 28, 8, GILT, 1); box(g, mw / 2 - 11, y + 5, 22, 4, '#F8F4EC'); for (const s of [-1, 1]) slabI(g, mw / 2 + s * 44 - 7, y + dh / 2 - 2, 14, 5, GILT, 1); }
    slabI(g, -2, h - 8, mw + 4, 8, OAK);
  });
  litTop(c, ma, mt, mw);
  const fa = X(MAP_STOOL.a), fw = MAP_STOOL.b - MAP_STOOL.a, ft = Y(MAP_STOOL.h);
  boxSides(c, E, fa - 2, fa + fw + 2, ft, GY, 0.93, VELVET, { apron: 24, leg: 6, sideR: OAK });
  still(c, 'wh2-stool', fa, ft, -4, -2, fw + 8, GY - ft + 6, g => {
    const h = GY - ft;
    stepsDown(g, () => g.roundRect(-2, 0, fw + 4, 22, [8, 8, 3, 3]), -2, 0, fw + 4, 22, VELVET, 2.2);
    for (let x = 4; x < fw - 2; x += 10) inkP(g, () => g.arc(x + 2, 10, 1.6, 0, Math.PI * 2), GILT[4], 0.8);
    for (let x = 2; x < fw; x += 4) box(g, x, 20, 2, 4, GILT[3]);
    for (const x of [4, fw - 10]) stepsAcross(g, () => { g.moveTo(x, 24); g.lineTo(x + 6, 24); g.quadraticCurveTo(x + 8, h - 10, x + 3, h); g.quadraticCurveTo(x - 2, h - 10, x, 24); g.closePath(); }, x - 2, 24, 10, h - 24, GILT, 1.4);
  });
  litTop(c, fa, ft, fw);
};
/** THE LASERS: housings off the ceiling and the floor (dark, nothing to stand on), the beams stepped. */
const lasers = (c: Ctx, state: GameState) => {
  const f = state.frame;
  const housing = (x: number, y: number, down: boolean, on: boolean) => {
    box(c, x - 15, y - 1, 30, 18, INK); box(c, x - 14, y, 28, 16, STEEL[1]); box(c, x - 14, y + (down ? 0 : 13), 28, 3, STEEL[0]); box(c, x - 12, y + (down ? 3 : 2), 6, 1, STEEL[3]);
    box(c, x - 4, down ? y + 14 : y - 2, 8, 4, INK); box(c, x - 3, down ? y + 15 : y - 1, 6, 2, on ? '#FCA5A5' : '#7F1D1D');
    box(c, x + 8, y + 6, 3, 3, (f >> 3) % 2 ? '#22C55E' : '#14532D');
  };
  const beam = (x0: number, y0: number, x1: number, y1: number, vert: boolean) => {
    const w = vert ? 0 : 1;
    const band = (r: number, col: string) => { c.fillStyle = col; if (vert) c.fillRect(x0 - r, y0, r * 2, y1 - y0); else c.fillRect(x0, y0 - r, x1 - x0, r * 2); };
    band(7, 'rgba(239,68,68,0.18)'); band(4.5, 'rgba(239,68,68,0.45)'); band(2.5, '#EF4444'); band(1, '#FFE4E4');
    for (let k = 0; k < 5; k++) { const t = ((f * 0.02 + k * 0.21) % 1); if (vert) box(c, x0 - 1 + Math.sin(f * 0.1 + k) * 2, y0 + t * (y1 - y0), 2, 2, '#FFFFFF'); else box(c, x0 + t * (x1 - x0), y0 - 1 + Math.sin(f * 0.1 + k) * 2, 2, 2, '#FFFFFF'); }
    void w;
  };
  for (const [rx, ph] of BLINKERS) {
    const x = X(rx), st = blinkAt(ph, f);
    if (!onScreen(state, x - 40, x + 40)) continue;
    if (st === 'tell' && f % 6 < 3) { c.fillStyle = 'rgba(239,68,68,0.55)'; c.fillRect(x - 1, Y(CEIL) + 16, 2, CEIL - 32); }
    if (st === 'on') beam(x, Y(CEIL) + 16, x, GY - 16, true);
    housing(x, Y(CEIL), true, st !== 'off'); housing(x, GY - 16, false, st !== 'off');
  }
  const a = X(SWEEP.a), b = X(SWEEP.b);
  if (!onScreen(state, a, b)) return;
  const y = Y(sweepAt(f));
  for (const [x, s] of [[a - 16, 1], [b + 2, -1]] as [number, number][]) {
    slabI(c, x, Y(SWEEP.hi + 20), 14, SWEEP.hi + 20, STEELR);
    box(c, x + 3, Y(SWEEP.hi + 14), 8, SWEEP.hi + 6, STEEL[0]);
    box(c, x + 2, y - 5, 10, 10, INK); box(c, x + 3, y - 4, 8, 8, '#B91C1C'); box(c, x + (s > 0 ? 9 : 2), y - 2, 3, 4, '#FECACA');
  }
  beam(a, y, b, y, false);
};
const STEELR: R6 = ['#1C1A2C', '#2E2C44', '#46445E', '#64627E', '#8A88A4', '#B8B6CE'];
/** THE RESOLUTE DESK: carved oak, the Seal carved on the kneehole's panel, wreaths on the pedestals; its top going back
 *  (the green leather, the phones, a pen set, the name plate, THE BUCK STOPS HERE). */
const resolute = (c: Ctx, E: P) => {
  const a = X(RESOLUTE.a), w = RESOLUTE.b - RESOLUTE.a, t = Y(RESOLUTE.h);
  boxSides(c, E, a - 6, a + w + 6, t, GY, 0.86, OAK, { lines: [t + 10, GY - 8] });
  if (E.y < t) {
    const bl = [proj(E, a + 18, t, 0.97), proj(E, a + w - 18, t, 0.97), proj(E, a + w - 18, t, 0.9), proj(E, a + 18, t, 0.9)];
    quad(c, bl, '#2E5A3E'); quad(c, [bl[0], bl[1], { x: bl[1].x, y: bl[1].y - 1 }, { x: bl[0].x, y: bl[0].y - 1 }], '#4A8A5E');
  }
  const ph = proj(E, a + w - 16, t, 0.9); inkP(c, () => c.roundRect(ph.x - 9, ph.y - 8, 18, 8, 2), '#DC2626', 1.4); box(c, ph.x - 7, ph.y - 11, 14, 3, INK);
  const ps = proj(E, a + 18, t, 0.9); slabI(c, ps.x - 8, ps.y - 4, 16, 4, MARBLE, 1); for (const s of [-1, 1]) { box(c, ps.x + s * 4, ps.y - 14, 1, 10, INK); box(c, ps.x + s * 4 - 1, ps.y - 16, 3, 3, GILT[3]); }
  const bs = proj(E, a + w / 2, t, 0.95); slabI(c, bs.x - 36, bs.y - 20, 72, 20, OAK, 1); box(c, bs.x - 33, bs.y - 18, 66, 16, '#F8F4EC'); signText(c, 'THE BUCK', bs.x, bs.y - 11, tinyLetters(['#3A2408', '#2A1A08'])); signText(c, 'STOPS HERE', bs.x, bs.y - 3, tinyLetters(['#3A2408', '#2A1A08']));
  still(c, 'wh2-resolute', a, t, -8, -6, w + 16, GY - t + 10, g => {
    const h = GY - t;
    slabI(g, -6, 0, w + 12, 10, OAK); for (let x = -2; x < w + 4; x += 8) box(g, x, 6, 4, 2, OAK[2]);
    for (const [x0, pw] of [[0, 34], [w - 34, 34]] as [number, number][]) {
      slabI(g, x0, 10, pw, h - 18, OAK);
      box(g, x0 + 5, 18, pw - 10, h - 34, OAK[2]); box(g, x0 + 7, 20, pw - 14, h - 38, OAK[3]);
      g.strokeStyle = OAK[1]; g.lineWidth = 2; g.beginPath(); g.arc(x0 + pw / 2, 18 + (h - 34) / 2, 9, 0, Math.PI * 2); g.stroke(); g.strokeStyle = OAK[5]; g.lineWidth = 1; g.beginPath(); g.arc(x0 + pw / 2 - 1, 17 + (h - 34) / 2, 9, Math.PI, Math.PI * 1.6); g.stroke();
    }
    stepsAcross(g, () => g.rect(34, 10, w - 68, h - 18), 34, 10, w - 68, h - 18, OAK, 2);
    seal(g, w / 2, 10 + (h - 18) / 2, 18);
    slabI(g, -4, h - 8, w + 8, 8, OAK);
  });
  litTop(c, a, t, w);
};
/** The Oval Office's far wall, at the play plane: the house's own brick, cut (the end of the show's White House). */
const ovalEnd = (c: Ctx, state: GameState) => {
  const w = X(OVAL_WALL);
  if (!onScreen(state, w - 40, w + 420)) return;
  still(c, 'wh2-ovalend', w, GY, -6, -1300, 420, 1304, g => {
    cutaway(g, 0, 414, 0, 1300);
    // (the cut face of the wall: plaster, the lath, the brick; inked fat; a baseboard)
    box(g, -6, -1300, 18, 1300, INK); box(g, -4, -1300, 14, 1300, '#F2E2C8'); box(g, -4, -1300, 4, 1300, '#FFF6E2'); box(g, 6, -1300, 4, 1300, '#C8B494');
    for (let y = -1290; y < 0; y += 22) box(g, -2, y, 10, 3, '#B89A74');
    slabI(g, 10, -40, 404, 40, R('#EED8A4'));
  });
};

/** The floor's cut edge along the play plane (the cartoon's cutaway: the slab end on, inked fat; the terrace's stone out
 *  of doors). */
const floorEdge = (c: Ctx, state: GameState) => {
  const v0 = Math.max(X(-600), state.camera.x - 20), v1 = Math.min(X(OVAL_WALL + 420), state.camera.x + CANVAS_WIDTH + 20);
  if (v0 >= v1) return;
  const m = Math.max(v0, Math.min(v1, X(1100)));
  if (m > v0) {
    // (the terrace: limestone blocks, their lit tops)
    box(c, v0, GY, m - v0, 70, '#A8987A');
    for (let x = Math.floor(v0 / 40) * 40; x < m; x += 40) { box(c, x, GY + 2, 38, 20, '#D8CCB0'); box(c, x, GY + 2, 38, 2, '#F2EAD8'); box(c, x + 37, GY + 2, 1, 20, '#988868'); }
    box(c, v0, GY + 24, m - v0, 46, GRASS[1]); checker(c, v0, GY + 22, m - v0, 4, GRASS[1], 0, 1);
  }
  if (v1 > m) {
    const M = MARBLE;
    box(c, m, GY, v1 - m, 70, M[1]); box(c, m, GY + 4, v1 - m, 10, '#C89A6A'); box(c, m, GY + 4, v1 - m, 2, '#E8C29A');
    box(c, m, GY + 14, v1 - m, 3, INK);
    for (let x = Math.floor(m / 48) * 48; x < v1; x += 48) { box(c, Math.max(m, x + 6), GY + 20, 16, 14, '#6A4020'); box(c, Math.max(m, x + 6), GY + 20, 16, 2, '#8A5A30'); }
    checker(c, m, GY + 17, v1 - m, 2, M[2], 0, 1);
  }
  box(c, v0, GY, v1 - v0, 3, '#FFF6E0'); box(c, v0, GY - 1, v1 - v0, 1, INK);
};

// ---------------------------------------------------------------------------------------------------------------

/** World space, behind him: the colonnade, the rooms, everything he stands on, the hazards. */
export const drawWh2Back = (c: Ctx, state: GameState) => {
  const E = eyeOf(state), f = state.frame;
  colonnade(c, state, E);
  drawRooms2(c, state, E);
  wingEnd(c, state, E);
  floorEdge(c, state);
  CABINETS.forEach((C, ci) => { if (onScreen(state, X(C.a) - 90, X(C.b) + 90)) cabinetArt(c, E, C, f, ci); });
  if (onScreen(state, X(LIMBAUGH_ARENA.a), X(LIMBAUGH_ARENA.b))) {
    eibDesk(c, E, f);
    LIMBAUGH_ARENA.ledges.forEach(([a, b, h], k) => studioShelf(c, E, a, b, h, k));
  }
  if (onScreen(state, X(JELLO.a) - 60, X(POT_RACK.b) + 60)) { potRack(c, E, f); range(c, E, f); jello(c, E, f); }
  if (onScreen(state, X(DOLE_ARENA.a), X(DOLE_ARENA.b))) {
    cabinetTable(c, E);
    DOLE_ARENA.ledges.forEach(([a, b, h]) => giltShelf(c, E, a, b, h, 'books'));
  }
  if (onScreen(state, X(GLOBE.stand) - 120, X(MAP_STOOL.b) + 60)) { globeArt(c, state); mapFurniture(c, E); }
  lasers(c, state);
  if (onScreen(state, X(NEWT_ARENA.a), X(OVAL_WALL) + 60)) {
    resolute(c, E);
    NEWT_ARENA.ledges.forEach(([a, b, h], k) => giltShelf(c, E, a, b, h, k ? 'bust' : 'ship'));
  }
  ovalEnd(c, state);
  for (const [x, words] of PLACARDS) if (onScreen(state, X(x) - 90, X(x) + 90)) placard(c, X(x), GY, words);
  if (onScreen(state, X(700), X(1050))) toonSign(c, X(880), GY, ['THE WEST WING >', 'NO CATS'], { board: '#1D4ED8' });
};
export { Y };
void starAt; void BRASS;
