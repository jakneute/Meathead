// CHELSEA AND SOCKS' WACKY WHITE HOUSE, part one, painted (the SNES pass): the show's White House the way a 1994
// Saturday morning cartoon paints it at peak SNES: flat bright cel colors in stepped ramps, a fat black line round
// everything, dithered seams, nothing quite straight. The rooms (rooms.ts: their back walls painted once for the hour,
// their ceilings and floors going back to the one eye, the house's brick over them); the far off past the balcony
// (far.ts); here, the outdoors behind the play plane (the South Portico, the lawn going back, the hedges and crabapples,
// the West Colonnade) and the play plane itself.
//
// In the play plane, everything he stands on lit along its top, its top going back to the eye where he can see it:
// the Steinway (black lacquer, its lid propped (dimmed), the keys), the chair stack (gilt ballroom chairs, red cushions)
// and the bandstand risers (blue skirting, stars), the podium (the Seal on it, a gooseneck mic), the press gallery's
// ledges, the sideboard (its tea service at the back) and the banquet table (a white cloth to the floor, gold fringe,
// the feast eaten through, candelabra lit), the Grand Staircase (marble treads, the red runner, brass rods, the
// banister and its newel lamp: scenery), the second floor's lip, the Lincoln bed (the carved footboard, the coverlet),
// the Lincoln Bedroom's shelves on corbels, the Truman Balcony's balustrade (dimmed), the garden bench and the arbor
// (roses up it). Each room's placard on a gilt easel; the entrance's title banner off the ceiling; the CAUTION JUST
// WAXED A-frame; TO THE WEST WING. The hazards: the runaway Hoover, the swinging chandelier, the ball return and the
// balls, the rose bushes, the sprinklers.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { signText, signW } from '../../signLetters';
import { timeOfDay } from '../../timeOfDay';
import { box, mix, hash, checker, toonLetters, toonSign, onScreen, INK, still, boxSides, ramp6, LICORICE, CHERRY, GRASS, STEEL, BRASS, type Ctx } from '../kit';
import { GY } from '../geometry';
import { whOf } from './state';
import { chandelierAt, sprinklerAt, BALL_R, SPRAY_H, SPRAY_W, ROSE_H } from './hazards';
import {
  F2, CEIL1, PIANO, CHAIRS, RISER, PODIUM, SIDEBOARD, TABLE, BED, BENCH, ARBOR, STAIRS, BALCONY_EDGE, WAX,
  CHANDELIER, BALL_RETURN, BALL_GRATE, ROSES, SPRINKLERS, PEROT_ARENA, FALWELL_ARENA, X, Y,
} from './layout';
import { R, GILT, MARBLE, NAVY, OAK, VELVET, inkP, slabI, stepsAcross, stepsDown, column, seal, candleFlames, starAt, tinyLetters, wallpaper } from './paint';
import { drawRooms, drawUnderDeck, eyeOf, proj, atDepth, seenAt, quad, type P } from './rooms';
import { drawWhFar } from './far';

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** The lit lip along anything he stands on. */
const litTop = (c: Ctx, x: number, y: number, w: number) => { box(c, x + 1, y - 1, w - 2, 1, INK); box(c, x + 2, y, w - 4, 2, '#FFF6E0'); box(c, x + 6, y, w * 0.4, 1, '#FFFFFF'); };
/** Scenery's colors (dimmed toward the air: none of it reads as somewhere to stand). */
const dim = (col: string) => mix(col, '#8E86B4', 0.3);
const dimR = (Rm: string[]) => Rm.map(dim);

// ---------------------------------------------------------------------------------------------------------------
// The outdoors: the South Portico behind the balcony and the garden, the lawn going back, the hedges, the colonnade

const paintPortico = (g: Ctx) => {
  // (local: x from X(9600), y from GY; the house's south front: white, its windows under pediments, the bowed portico's
  // columns two storeys up past the balcony, the balustrade round the roof, the flag)
  const w = 1300, h = CEIL1 + 380, M = MARBLE;
  slabI(g, 0, -h, w, h, M);
  for (let x = 6; x < w; x += 22) box(g, x, -h + 40, 1, h - 40, M[2]);
  for (let x = 40; x < w - 40; x += 110) for (const [wy, wh] of [[-(F2 + 250), 120], [-170, 110]] as [number, number][]) {
    box(g, x - 4, wy - 4, 58, wh + 8, INK); box(g, x - 3, wy - 3, 56, wh + 6, M[4]);
    const tod = timeOfDay(), glass = tod.lamps > 0.3 ? ['#8A4A10', '#D08A24', '#F6BE48'] : ['#2E5A86', '#4A84B4', '#74AED8'];
    box(g, x, wy, 50, wh, glass[1]); box(g, x, wy, 50, wh * 0.3, glass[2]); box(g, x + 24, wy, 2, wh, M[4]); for (let k = 1; k < 4; k++) box(g, x, wy + (wh * k) / 4, 50, 2, M[4]);
    box(g, x - 10, wy, 9, wh, '#2E5A3E'); box(g, x + 51, wy, 9, wh, '#2E5A3E'); for (let k = 4; k < wh; k += 6) { box(g, x - 9, wy + k, 7, 1, '#1E4A2E'); box(g, x + 52, wy + k, 7, 1, '#1E4A2E'); }
    inkP(g, () => { g.moveTo(x - 10, wy - 6); g.lineTo(x + 25, wy - 22); g.lineTo(x + 60, wy - 6); g.closePath(); }, M[4], 1.6);
  }
  // (the bowed portico: two storeys of Ionic columns, the balcony's floor between, the entablature and balustrade)
  const pa = 360, pb = 760;
  box(g, pa - 20, -(F2 + 6), pb - pa + 40, 14, INK); box(g, pa - 19, -(F2 + 5), pb - pa + 38, 12, M[3]);
  for (let x = pa; x <= pb; x += 66) column(g, x, 0, -(CEIL1 + 300), 34, M);
  slabI(g, pa - 40, -(CEIL1 + 340), pb - pa + 80, 40, M);
  for (let x = pa - 34; x < pb + 34; x += 10) { box(g, x, -(CEIL1 + 362), 6, 22, M[4]); box(g, x + 4, -(CEIL1 + 362), 2, 22, M[2]); }
  slabI(g, pa - 40, -(CEIL1 + 368), pb - pa + 80, 8, M);
  // (the roof's balustrade all along, the flag up top)
  slabI(g, 0, -h - 30, w, 30, M);
  for (let x = 6; x < w; x += 12) { box(g, x, -h - 24, 6, 18, M[4]); box(g, x + 4, -h - 24, 2, 18, M[2]); }
  box(g, 648, -h - 130, 4, 100, INK); box(g, 649, -h - 130, 2, 100, '#E2E8F0');
  for (let k = 0; k < 7; k++) box(g, 652, -h - 128 + k * 6, 60, 6, k % 2 ? '#FFFFFF' : '#C8202E');
  box(g, 652, -h - 128, 26, 22, NAVY[2]); for (let k = 0; k < 6; k++) box(g, 655 + (k % 3) * 8, -h - 124 + Math.floor(k / 3) * 9, 2, 2, '#FFFFFF');
};
const paintHedge = (g: Ctx, w: number) => {
  // (local: x 0..w, the hedge's foot at 0: clipped boxwood in steps, a tulip bed along its foot)
  const G = GRASS;
  stepsDown(g, () => g.roundRect(0, -78, w, 78, [26, 26, 4, 4]), 0, -78, w, 78, G, 2);
  for (let k = 0; k < w; k += 9) { const x = k + hash(k) * 4; box(g, x, -70 + hash(k * 3) * 30, 3, 2, G[5]); box(g, x + 2, -36 + hash(k * 7) * 20, 3, 2, G[1]); }
  for (let k = 6; k < w - 4; k += 11) { const col = ['#E11D48', '#FDE047', '#F472B6', '#FFFFFF'][Math.floor(hash(k * 1.3) * 4)]; box(g, k, -12, 2, 10, G[1]); inkP(g, () => g.ellipse(k + 1, -14, 3.5, 4.5, 0, 0, Math.PI * 2), col, 1); box(g, k, -17, 1, 2, mix(col, '#FFFFFF', 0.5)); }
};
const paintCrabapple = (g: Ctx, seed: number) => {
  // (a crabapple in bloom: a crooked trunk, a cloud of pink in steps, petals)
  const P = ['#7A2A4A', '#B44A7A', '#E07AA8', '#F6A8CA', '#FFD2E6'];
  g.strokeStyle = INK; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-8, -40, 4, -80); g.stroke();
  g.strokeStyle = '#5A3A2A'; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#7A5A3E'; g.lineWidth = 2; g.beginPath(); g.moveTo(-2, -4); g.quadraticCurveTo(-9, -40, 2, -76); g.stroke(); g.lineCap = 'butt';
  for (const [dx, dy, r, k] of [[0, -100, 44, 0], [-30, -86, 30, 0], [30, -88, 32, 0], [0, -104, 38, 1], [-28, -90, 24, 1], [28, -92, 26, 1], [-10, -114, 26, 2], [-18, -120, 12, 3]] as [number, number, number, number][]) {
    if (k === 0) { g.fillStyle = INK; g.beginPath(); g.arc(dx, dy, r + 2, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = P[k + 1]; g.beginPath(); g.arc(dx, dy, r, 0, Math.PI * 2); g.fill();
  }
  for (let k = 0; k < 24; k++) { const a = hash(seed + k) * Math.PI * 2, d = hash(seed + k * 3) * 40; box(g, Math.cos(a) * d - 1, -100 + Math.sin(a) * d * 0.8, 2, 2, k % 3 ? P[4] : '#FFFFFF'); }
};
const outdoors = (c: Ctx, state: GameState, E: P) => {
  const a = X(9950), b = X(12200);
  if (!onScreen(state, a - 300, b + 300) && !seenAt(state, E, a, b, 0.7)) return;
  if (seenAt(state, E, X(9600), X(10900), 0.7)) atDepth(c, E, 0.7, () => still(c, 'wh1-portico', X(9600), GY, -10, -(CEIL1 + 520), 1320, CEIL1 + 530, paintPortico));
  // (the lawn going back: banded, mowed stripes, a gravel path, the beds)
  const dAt = (k: number) => 0.7 + 0.3 * k, G = GRASS;
  for (let i = 0; i < 5; i++) quad(c, [proj(E, X(10300), GY, dAt(i / 5)), proj(E, b, GY, dAt(i / 5)), proj(E, b, GY, dAt((i + 1) / 5)), proj(E, X(10300), GY, dAt((i + 1) / 5))], G[1 + Math.min(3, i)]);
  for (let x = 10300; x < 12200; x += 90) { quad(c, [proj(E, X(x), GY, dAt(0)), proj(E, X(x + 45), GY, dAt(0)), proj(E, X(x + 45), GY, dAt(1)), proj(E, X(x), GY, dAt(1))], 'rgba(174,234,156,0.22)'); }
  const path = (k0: number, k1: number, col: string) => quad(c, [proj(E, X(10300), GY, dAt(k0)), proj(E, b, GY, dAt(k0)), proj(E, b, GY, dAt(k1)), proj(E, X(10300), GY, dAt(k1))], col);
  path(0.42, 0.56, '#E8DCC2'); path(0.44, 0.46, '#F6EEDC'); path(0.54, 0.56, '#C8B894');
  for (let x = 10320; x < 12200; x += 24) { const p = proj(E, X(x + hash(x) * 20), GY, dAt(0.49)); box(c, p.x, p.y, 2, 1, '#B8A884'); }
  // (the hedges and the crabapples at the garden's back; the West Colonnade at the far end)
  atDepth(c, E, 0.82, () => {
    // (the crabapples stand behind the hedges: drawn first)
    for (let x = 10470; x < 11700; x += 300) if (onScreenAt(state, E, 0.82, X(x) - 60, X(x) + 60)) still(c, `wh1-crab-${x % 600}`, X(x), GY - 70, -60, -170, 120, 172, g => paintCrabapple(g, x));
    for (let x = 10400; x < 11760; x += 150) if (onScreenAt(state, E, 0.82, X(x), X(x + 150))) still(c, `wh1-hedge`, X(x), GY, -4, -84, 150, 90, g => paintHedge(g, 142));
    if (onScreenAt(state, E, 0.82, X(11740), X(12260))) still(c, 'wh1-colonnade', X(11740), GY, -10, -330, 500, 336, g => paintColonnade(g));
  });
};
const onScreenAt = (state: GameState, E: P, d: number, a: number, b: number) => seenAt(state, E, a, b, d, 60);
const paintColonnade = (g: Ctx) => {
  // (local: x from X(11740), feet at 0: the West Colonnade: white columns, lanterns hung between, its roof, the arches
  // into the West Wing's shade behind)
  box(g, 0, -260, 480, 260, '#3A2E4A'); for (let k = 0; k < 6; k++) box(g, 0, -260 + k * 44, 480, 44, ['#2E2440', '#36294A', '#3E3054', '#46365E', '#4E3C66', '#56426E'][k]);
  for (let x = 30; x < 480; x += 70) { inkP(g, () => g.roundRect(x + 6, -150, 30, 150, [15, 15, 0, 0]), '#5A4A70', 1.6); box(g, x + 10, -140, 4, 140, '#6A5A80'); }
  slabI(g, -6, -10, 492, 10, MARBLE);
  for (let x = 20; x < 480; x += 70) column(g, x, -10, -260, 26, MARBLE, false);
  slabI(g, -10, -296, 500, 36, MARBLE);
  for (let x = -4; x < 490; x += 9) { box(g, x, -296, 5, 6, MARBLE[4]); box(g, x + 3, -296, 2, 6, MARBLE[2]); }
  slabI(g, -14, -306, 508, 10, MARBLE);
  for (let x = 55; x < 480; x += 70) { box(g, x - 1, -250, 2, 40, INK); inkP(g, () => g.roundRect(x - 7, -212, 14, 20, 3), '#1A1A24', 1.4); box(g, x - 4, -208, 8, 12, timeOfDay().lamps > 0.3 ? '#FFE08A' : '#E8E4D0'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane: what he stands on

const placard = (c: Ctx, x: number, feet: number, words: string[]) => {
  still(c, `wh1-placard-${words.join('|')}`, x, feet, -84, -156, 168, 160, g => {
    // (a gilt easel: three legs, a ledge, the card on it in the show's fat letters)
    for (const [ax, bx] of [[-28, -6], [28, 6]] as [number, number][]) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(ax, 0); g.lineTo(bx, -124); g.stroke(); g.strokeStyle = GILT[3]; g.lineWidth = 3; g.stroke(); g.strokeStyle = GILT[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(ax - 1, 0); g.lineTo(bx - 1, -124); g.stroke(); }
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -60); g.stroke(); g.strokeStyle = GILT[1]; g.lineWidth = 2; g.stroke();
    slabI(g, -74, -78, 148, 8, GILT);
    slabI(g, -72, -144, 144, 66, GILT);
    box(g, -64, -136, 128, 50, INK); box(g, -63, -135, 126, 48, '#FFF6E2'); box(g, -63, -135, 126, 12, '#FFFFFF'); checker(g, -63, -123, 126, 2, '#FFFFFF', 0, 1); box(g, -63, -95, 126, 8, '#F2E2C2');
    for (const [cx, cy] of [[-68, -140], [68, -140], [-68, -82], [68, -82]]) { box(g, cx - 3, cy - 3, 6, 6, INK); box(g, cx - 2, cy - 2, 4, 4, GILT[5]); }
    words.forEach((w, i) => { const big = signW(w, toonLetters(2)) <= 118 ? 2 : 1; signText(g, w, 0, -112 + i * 20 + (words.length === 1 ? 8 : 0), toonLetters(big, i ? ['#C4B5FD', '#A78BFA', '#7C3AED', '#5B21B6'] : ['#FCA5A5', '#F87171', '#DC2626', '#991B1B'])); });
  });
};
const PLACARDS: [number, number, string[]][] = [
  [1160, 0, ['THE CROSS HALL']], [2300, 0, ['THE EAST ROOM']], [3760, 0, ['THE PRESS ROOM']], [5100, 0, ['THE STATE', 'DINING ROOM']],
  [6420, 0, ['THE GRAND', 'STAIRCASE']], [7640, F2, ['THE CENTER HALL']], [8470, F2, ['THE LINCOLN', 'BEDROOM']], [9400, F2, ['THE WEST', 'SITTING HALL']],
];

const piano = (c: Ctx, E: P) => {
  const a = X(PIANO.a), b = X(PIANO.b), t = Y(PIANO.h), L = LICORICE;
  boxSides(c, E, a, b, t, GY, 0.9, L, { apron: 34, leg: 10, lines: [t + 30] });
  still(c, 'wh1-piano', a, t, -6, -84, b - a + 12, GY - t + 90, g => {
    const w = b - a;
    // (the lid propped up behind (scenery: dimmed), its prop stick; the music stand)
    inkP(g, () => { g.moveTo(10, 0); g.lineTo(w - 30, -74); g.lineTo(w - 22, -70); g.lineTo(22, 0); g.closePath(); }, dim(L[3]), 2);
    box(g, w * 0.55, -40, 2, 40, dim(GILT[3]));
    inkP(g, () => g.rect(20, -26, 40, 22), dim(L[2]), 1.4);
    // (the case: black lacquer in steps, a gilt rim, the curve at its tail)
    stepsDown(g, () => g.roundRect(0, 0, w, 34, [4, 30, 4, 4]), 0, 0, w, 34, L, 2.4);
    box(g, 2, 2, w * 0.6, 1, L[5]); box(g, 0, 30, w, 2, GILT[2]);
    signText(g, 'STEINWAY', w - 34, 18, tinyLetters([GILT[5], GILT[4], GILT[3]]));
    // (the keyboard along the front, the keys, the cheek blocks)
    box(g, 4, 22, 66, 12, INK); box(g, 5, 23, 64, 10, '#FFFFFF'); box(g, 5, 31, 64, 2, '#D8D4E4');
    for (let k = 0; k < 9; k++) { box(g, 9 + k * 7, 23, 1, 10, '#B8B4C8'); if (k % 7 !== 2 && k % 7 !== 6) box(g, 11 + k * 7, 23, 3, 6, INK); }
    // (the legs: fat turned legs, brass casters)
    for (const x of [12, w - 20]) { stepsAcross(g, () => g.roundRect(x, 34, 10, GY - t - 40, 3), x, 34, 10, GY - t - 40, L, 2); inkP(g, () => g.arc(x + 5, GY - t - 3, 4, 0, Math.PI * 2), GILT[3], 1.2); }
    // (the pedal lyre)
    box(g, w * 0.45 - 4, 34, 8, GY - t - 46, INK); box(g, w * 0.45 - 3, 34, 6, GY - t - 46, L[2]); for (const k of [-6, 0, 6]) box(g, w * 0.45 + k - 2, GY - t - 12, 4, 3, GILT[4]);
  });
  litTop(c, a, t, b - a);
};
const chairStack = (c: Ctx, E: P) => {
  const a = X(CHAIRS.a), w = CHAIRS.b - CHAIRS.a, t = Y(CHAIRS.h);
  boxSides(c, E, a, a + w, t, GY, 0.92, CHERRY, { cut: [null, Y(RISER.h)], sideR: GILT, lines: Array.from({ length: 9 }, (_, i) => t + ((i + 1) * (GY - t)) / 10) });
  still(c, 'wh1-chairs', a, GY, -10, -(GY - t) - 6, w + 20, GY - t + 10, g => {
    // (gilt ballroom chairs, stacked too high to jump: each a gilt frame, a red cushion, staggered as they're piled)
    const n = 10, hh = (GY - t) / n;
    for (let i = 0; i < n; i++) {
      const y = -(i + 1) * hh, lean = Math.round((hash(i * 7.3) - 0.5) * 6);
      slabI(g, lean, y, w, hh, i % 2 ? GILT : R('#E6B840'));
      stepsDown(g, () => g.roundRect(lean + 5, y + 3, w - 10, hh - 9, 3), lean + 5, y + 3, w - 10, hh - 9, CHERRY, 1.4);
      for (const lx of [lean + 4, lean + w - 8]) box(g, lx, y + hh - 6, 4, 6, GILT[1]);
      for (let k = lean + 10; k < lean + w - 10; k += 8) box(g, k, y + 3, 2, 1, CHERRY[5]);
    }
  });
  litTop(c, a, t, w);
  // (the bandstand risers down the far side: blue skirting with stars, carpeted tops)
  const ra = X(RISER.a), rw = RISER.b - RISER.a, rt = Y(RISER.h);
  boxSides(c, E, ra, ra + rw, rt, GY, 0.9, NAVY, { cut: [rt, null], lines: [rt + 8] });
  still(c, 'wh1-riser', ra, rt, -2, -2, rw + 4, GY - rt + 6, g => {
    slabI(g, 0, 0, rw, GY - rt, NAVY);
    for (let x = 4; x < rw - 4; x += 12) { box(g, x, 10, 6, GY - rt - 14, NAVY[2]); box(g, x, 10, 1, GY - rt - 14, NAVY[4]); }
    box(g, 0, 0, rw, 8, '#C8202E'); box(g, 0, 0, rw, 2, '#F06A72'); box(g, 0, 7, rw, 1, '#7A0E1C');
    for (let k = 0; k < 3; k++) starAt(g, 14 + k * 30, 30 + (k % 2) * 30, 6, '#FFFFFF', true);
  });
  litTop(c, ra, rt, rw);
};
const podium = (c: Ctx, E: P) => {
  const a = X(PODIUM.a), w = PODIUM.b - PODIUM.a, t = Y(PODIUM.h);
  boxSides(c, E, a, a + w, t, GY, 0.94, OAK, { lines: [t + 8, GY - 8] });
  still(c, 'wh1-podium', a, t, -8, -34, w + 16, GY - t + 40, g => {
    // (the lectern: oak in steps, tapering, the Seal on its front, a gooseneck mic)
    stepsAcross(g, () => { g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w - 6, GY - t); g.lineTo(6, GY - t); g.closePath(); }, 0, 0, w, GY - t, OAK, 2.4);
    slabI(g, -4, 0, w + 8, 8, OAK);
    for (const k of [0.3, 0.7]) box(g, Math.round(w * k), 14, 1, GY - t - 20, OAK[1]);
    seal(g, w / 2, 44, 20);
    slabI(g, 2, GY - t - 8, w - 4, 8, OAK);
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2 + 10, 0); g.quadraticCurveTo(w / 2 + 16, -14, w / 2 + 12, -24); g.stroke(); g.strokeStyle = '#8A88A4'; g.lineWidth = 1.4; g.stroke();
    inkP(g, () => g.ellipse(w / 2 + 11, -27, 4, 5, -0.3, 0, Math.PI * 2), '#2A2A36', 1.2); box(g, w / 2 + 9, -30, 2, 2, '#6A6A80');
  });
  litTop(c, a, t, w);
};
const arenaLedges = (c: Ctx, E: P, ledges: [number, number, number][], kind: 'gallery' | 'shelf') => {
  for (const [a0, b0, h] of ledges) {
    const a = X(a0), b = X(b0), y = Y(h), w = b - a;
    boxSides(c, E, a, b, y, y + 14, 0.94, kind === 'gallery' ? GILT : OAK);
    still(c, `wh1-ledge-${kind}-${w}`, a, y, -4, -2, w + 8, 46, g => {
      if (kind === 'gallery') {
        // (the press gallery's ledge: a gilt-edged board on brass brackets, bunting under it)
        slabI(g, 0, 0, w, 14, GILT);
        box(g, 4, 6, w - 8, 2, GILT[1]);
        for (const x of [10, w - 16]) { inkP(g, () => { g.moveTo(x, 14); g.lineTo(x + 6, 14); g.lineTo(x + 6, 40); g.quadraticCurveTo(x + 3, 30, x, 18); g.closePath(); }, GILT[2], 1.4); }
        for (let k = 0; k < 3; k++) { const bx = 16 + k * ((w - 32) / 3), bw = (w - 32) / 3; stepsDown(g, () => { g.moveTo(bx, 14); g.quadraticCurveTo(bx + bw / 2, 30, bx + bw, 14); g.closePath(); }, bx, 14, bw, 16, R(['#DC2626', '#FFFFFF', '#1D4ED8'][k]), 1.2); }
      } else {
        // (a carved walnut shelf on scrolled corbels)
        slabI(g, 0, 0, w, 14, OAK); box(g, 3, 10, w - 6, 2, OAK[1]);
        for (const x of [12, w - 22]) { inkP(g, () => { g.moveTo(x, 14); g.lineTo(x + 10, 14); g.quadraticCurveTo(x + 10, 34, x + 2, 38); g.quadraticCurveTo(x - 2, 26, x, 14); g.closePath(); }, OAK[2], 1.4); inkP(g, () => g.arc(x + 4, 32, 3.5, 0, Math.PI * 2), OAK[3], 1); }
        for (let k = 8; k < w - 8; k += 12) box(g, k, 3, 6, 1, OAK[5]);
      }
    });
    litTop(c, a, y, w);
  }
};
const dining = (c: Ctx, E: P, state: GameState) => {
  const sa = X(SIDEBOARD.a), sw = SIDEBOARD.b - SIDEBOARD.a, st = Y(SIDEBOARD.h);
  const ta = X(TABLE.a), tw = TABLE.b - TABLE.a, tt = Y(TABLE.h);
  // (the chairs' backs along the back of the table: scenery, dimmed)
  still(c, 'wh1-chairbacks', ta, tt, 0, -52, tw, 54, g => { for (let x = 30; x < tw - 20; x += 80) { stepsAcross(g, () => g.roundRect(x, -50, 32, 50, [12, 12, 0, 0]), x, -50, 32, 50, dimR(OAK), 1.6); stepsDown(g, () => g.roundRect(x + 5, -44, 22, 26, [8, 8, 2, 2]), x + 5, -44, 22, 26, dimR(VELVET), 1); } });
  boxSides(c, E, sa, sa + sw, st, GY, 0.92, OAK, { lines: [st + 6, st + 50] });
  boxSides(c, E, ta, ta + tw, tt, GY, 0.86, ['#C8C4D6', '#D8D4E4', '#E8E4F0', '#F4F2FA', '#FFFFFF', '#FFFFFF'], { sideR: ['#6A6684', '#9A96B4', '#C2BED6', '#E2DEEE', '#F6F4FC', '#FFFFFF'], lines: [GY - 9] });
  // (the place settings and the feast on the cloth going back (behind where he walks), eaten through)
  const back = (x: number) => proj(E, x, tt, 0.9);
  for (let x = ta + 40; x < ta + tw - 20; x += 80) { const p = back(x); c.fillStyle = INK; c.beginPath(); c.ellipse(p.x, p.y, 11, 3.5, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(p.x, p.y, 10, 2.6, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = GILT[3]; c.fillRect(p.x - 6, p.y - 1, 12, 1); box(c, p.x + 13, p.y - 2, 1, 5, '#C8CCD8'); box(c, p.x - 14, p.y - 2, 1, 5, '#C8CCD8'); }
  still(c, 'wh1-sideboard', sa, st, -4, -2, sw + 8, GY - st + 6, g => {
    slabI(g, 0, 0, sw, GY - st, OAK);
    for (const [x, y, w, h] of [[8, 14, sw / 2 - 12, 34], [sw / 2 + 4, 14, sw / 2 - 12, 34], [8, 54, sw - 16, GY - st - 66]] as [number, number, number, number][]) { box(g, x, y, w, h, OAK[2]); box(g, x + 2, y + 2, w - 4, h - 4, OAK[3]); box(g, x + 2, y + 2, w - 4, 1, OAK[1]); inkP(g, () => g.arc(x + w / 2, y + h / 2, 2.5, 0, Math.PI * 2), GILT[4], 1); }
    slabI(g, -4, 0, sw + 8, 6, OAK);
  });
  litTop(c, sa, st, sw);
  still(c, 'wh1-table', ta, tt, -4, -2, tw + 8, GY - tt + 6, g => {
    // (a white cloth to the floor in folds, a gold fringe, a swag of red bunting along it)
    stepsDown(g, () => g.rect(0, 0, tw, GY - tt), 0, 0, tw, GY - tt, ['#9A96B4', '#C2BED6', '#E2DEEE', '#F6F4FC', '#FFFFFF', '#FFFFFF'], 2.4);
    for (let x = 30; x < tw; x += 46) { box(g, x, 14, 2, GY - tt - 22, '#D6D2E4'); box(g, x + 2, 14, 1, GY - tt - 22, '#FFFFFF'); }
    for (let x = 4; x < tw - 4; x += 6) { box(g, x, GY - tt - 9, 3, 9, GILT[3]); box(g, x, GY - tt - 9, 1, 9, GILT[5]); }
    for (let k = 0; k < Math.floor(tw / 108); k++) { const bx = 4 + k * 108; stepsDown(g, () => { g.moveTo(bx, 6); g.quadraticCurveTo(bx + 54, 30, bx + 108, 6); g.lineTo(bx + 108, 2); g.quadraticCurveTo(bx + 54, 22, bx, 2); g.closePath(); }, bx, 2, 108, 26, CHERRY, 1.2); inkP(g, () => g.arc(bx, 4, 4, 0, Math.PI * 2), GILT[4], 1); }
  });
  // (the feast along the front edge, eaten through: a carved turkey to the bones, candelabra (lit), a cake gone at)
  const f = state.frame;
  for (const [dx, what] of [[60, 0], [200, 1], [330, 2], [470, 1], [590, 3]] as [number, number][]) {
    const x = ta + dx, y = tt;
    if (what === 0) { inkP(c, () => c.ellipse(x, y - 3, 22, 5, 0, 0, Math.PI * 2), '#F4F2FA', 1.6); stepsDown(c, () => c.ellipse(x, y - 12, 14, 10, 0, Math.PI, 0), x - 14, y - 22, 28, 10, R('#B45309'), 1.6); for (const k of [-6, 0, 6]) box(c, x + k - 1, y - 18, 2, 6, '#F8F4EC'); box(c, x + 12, y - 24, 3, 10, '#FFFFFF'); }
    if (what === 1) { inkP(c, () => c.rect(x - 2, y - 30, 4, 30), '#D8DCE6', 1.4); box(c, x - 12, y - 32, 24, 3, '#D8DCE6'); for (const s of [-10, 0, 10]) { inkP(c, () => c.rect(x + s - 1.5, y - 44, 3, 12), '#FFFDF2', 1); } candleFlames(c, [[x - 10, y - 46], [x, y - 46], [x + 10, y - 46]], f); }
    if (what === 2) { stepsDown(c, () => c.roundRect(x - 16, y - 18, 32, 18, 6), x - 16, y - 18, 32, 18, R('#A16207'), 1.4); box(c, x - 10, y - 16, 8, 3, '#FDE68A'); box(c, x + 4, y - 14, 6, 2, '#FDE68A'); }
    if (what === 3) { stepsDown(c, () => c.rect(x - 16, y - 22, 32, 22), x - 16, y - 22, 32, 22, R('#F9A8D4'), 1.4); box(c, x - 16, y - 22, 32, 4, '#FFFFFF'); box(c, x + 2, y - 22, 14, 22, '#7C2D12'); box(c, x + 2, y - 22, 14, 3, '#F8F4EC'); box(c, x - 12, y - 28, 2, 6, '#FDE047'); }
  }
  litTop(c, ta, tt, tw);
};
const stairs = (c: Ctx, state: GameState) => {
  const a = X(STAIRS.a), b = X(STAIRS.b), n = STAIRS.steps, stepW = (b - a) / n, rise = F2 / n;
  if (!onScreen(state, a - 200, X(BALCONY_EDGE) + 50)) return;
  // (the banister along the back: dimmed (scenery): a mahogany rail, white balusters, the newel post and its lamp)
  const rail = (x: number) => GY - 92 - ((x - a) / (b - a)) * F2;
  for (let k = 0; k <= n * 2; k++) { const x = a + (k * stepW) / 2, y0 = GY - Math.ceil(k / 2) * rise; box(c, x - 2, rail(x), 5, y0 - rail(x), INK); box(c, x - 1, rail(x), 3, y0 - rail(x), dim('#FFFFFF')); box(c, x + 1, rail(x), 1, y0 - rail(x), dim(MARBLE[2])); }
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(a, rail(a)); c.lineTo(b, rail(b)); c.stroke();
  c.strokeStyle = dim(OAK[2]); c.lineWidth = 4; c.stroke(); c.strokeStyle = dim(OAK[4]); c.lineWidth = 1; c.beginPath(); c.moveTo(a, rail(a) - 1.5); c.lineTo(b, rail(b) - 1.5); c.stroke(); c.lineCap = 'butt';
  still(c, 'wh1-newel', a, GY, -14, -160, 28, 162, g => {
    slabI(g, -10, -96, 20, 96, dimR(OAK)); slabI(g, -13, -102, 26, 8, dimR(OAK));
    box(g, -2, -138, 4, 36, INK); box(g, -1, -138, 2, 36, dim(GILT[3]));
    inkP(g, () => g.ellipse(0, -144, 10, 13, 0, 0, Math.PI * 2), timeOfDay().lamps > 0.3 ? '#FFE8A0' : dim('#FFF4D0'), 1.6); box(g, -5, -150, 3, 6, '#FFFFFF');
  });
  // (the stairs: marble treads lit along their noses, risers in shade, the red runner up them on brass rods)
  c.beginPath(); c.moveTo(a, GY);
  for (let k = 1; k <= n; k++) { c.lineTo(a + (k - 1) * stepW, GY - k * rise); c.lineTo(a + k * stepW, GY - k * rise); }
  c.lineTo(b, GY); c.closePath(); c.fillStyle = MARBLE[2]; c.fill(); c.strokeStyle = INK; c.lineWidth = 3; c.stroke();
  // (the stringer's molding, wainscot panels under the flight)
  for (let k = 2; k <= n; k += 3) { const x = a + (k - 1) * stepW, y = GY - k * rise; box(c, x + 6, y + rise + 10, stepW * 2.4, Math.max(0, GY - y - rise - 18), MARBLE[1]); box(c, x + 8, y + rise + 12, stepW * 2.4 - 4, Math.max(0, GY - y - rise - 22), MARBLE[2]); }
  for (let k = 1; k <= n; k++) {
    const x = a + (k - 1) * stepW, y = GY - k * rise;
    box(c, x, y, stepW, rise, MARBLE[3]); box(c, x, y + rise - 3, stepW, 3, MARBLE[1]);
    box(c, x + stepW * 0.2, y, stepW * 0.6, rise, CHERRY[2]); box(c, x + stepW * 0.2, y, stepW * 0.6, 3, CHERRY[4]); box(c, x + stepW * 0.2, y, 2, rise, CHERRY[3]);
    box(c, x + stepW * 0.15, y + rise - 3, stepW * 0.7, 2, BRASS[4]);
    box(c, x, y - 1, stepW, 1, INK); box(c, x + 1, y, stepW - 1, 2, '#FFF6E0');
    box(c, x - 1, y, 2, rise, INK);
  }
};
const bed = (c: Ctx, E: P) => {
  const a = X(BED.a), w = BED.b - BED.a, t = Y(BED.h), fl = Y(F2);
  boxSides(c, E, a - 4, a + w + 4, t, fl, 0.86, LILACISH, { sideR: R('#5B2E1A'), lines: [t + 22] });
  // (the pillows at the head, back on the bed (behind where he stands))
  const p = proj(E, a + w - 30, t, 0.9);
  inkP(c, () => c.roundRect(p.x - 26, p.y - 12, 44, 14, 6), '#F8F6FF', 1.6); box(c, p.x - 22, p.y - 10, 20, 2, '#FFFFFF');
  still(c, 'wh1-bed', a, t, -14, -30, w + 28, fl - t + 34, g => {
    // (the rosewood frame, carved, the coverlet (Mary Todd's purple), the bedposts, the carved footboard's crest)
    stepsDown(g, () => g.rect(0, 10, w, fl - t - 10), 0, 10, w, fl - t - 10, R('#5B2E1A'), 2.4);
    for (let k = 0; k < 4; k++) { const px = 14 + k * ((w - 28) / 4); box(g, px, 24, (w - 28) / 4 - 8, fl - t - 34, '#4A2414'); box(g, px + 2, 26, (w - 28) / 4 - 12, fl - t - 38, '#6B3820'); box(g, px + 2, 26, (w - 28) / 4 - 12, 1, '#8A4A2A'); }
    stepsDown(g, () => g.roundRect(-4, 0, w + 8, 22, 8), -4, 0, w + 8, 22, LILACISH, 2.2);
    for (let x = 6; x < w; x += 14) { box(g, x, 3, 6, 1, '#E0D6FC'); box(g, x + 3, 12, 6, 1, '#9476DE'); }
    for (let x = 2; x < w; x += 5) box(g, x, 20, 2, 4, GILT[3]);
    for (const x of [-6, w - 2]) { stepsAcross(g, () => g.roundRect(x, -20, 8, fl - t + 20, 3), x, -20, 8, fl - t + 20, R('#5B2E1A'), 2); inkP(g, () => g.arc(x + 4, -22, 5, 0, Math.PI * 2), '#7C3A1E', 1.4); }
  });
  litTop(c, a - 4, t, w + 8);
};
const LILACISH = ['#2E1A5A', '#4A2E8A', '#6C4CBC', '#8E6ED6', '#B4A0EC', '#DED2FA'];
const garden = (c: Ctx, state: GameState, E: P) => {
  const f = state.frame;
  // (the Truman Balcony's balustrade along its edge: dimmed, scenery)
  const ba = X(9950), bb = X(BALCONY_EDGE);
  if (onScreen(state, ba, bb)) still(c, 'wh1-balustrade', ba, Y(F2), 0, -52, bb - ba, 54, g => {
    const w = bb - ba, M = dimR(MARBLE);
    slabI(g, 0, -52, w, 8, M);
    for (let x = 8; x < w - 6; x += 18) { inkP(g, () => { g.moveTo(x, -44); g.quadraticCurveTo(x - 4, -30, x + 1, -22); g.quadraticCurveTo(x - 4, -12, x, -4); g.lineTo(x + 10, -4); g.quadraticCurveTo(x + 14, -12, x + 9, -22); g.quadraticCurveTo(x + 14, -30, x + 10, -44); g.closePath(); }, M[3], 1.4); box(g, x + 2, -40, 2, 30, M[5]); }
    slabI(g, 0, -6, w, 6, M);
  });
  // (the bench: a white teak garden bench, its slats; the arbor: white posts, roses climbing, its crossbeams)
  const ka = X(BENCH.a), kw = BENCH.b - BENCH.a, kt = Y(BENCH.h);
  if (onScreen(state, ka - 40, ka + kw + 40)) {
    boxSides(c, E, ka - 2, ka + kw + 2, kt, GY, 0.93, MARBLE, { apron: 12, leg: 6 });
    still(c, 'wh1-bench', ka, kt, -6, -40, kw + 12, GY - kt + 44, g => {
      for (const x of [2, kw - 8]) { box(g, x, -34, 6, 34, INK); box(g, x + 1, -34, 4, 34, MARBLE[3]); }
      for (let k = 0; k < 3; k++) { box(g, 0, -32 + k * 9, kw, 6, INK); box(g, 1, -31 + k * 9, kw - 2, 4, MARBLE[4]); box(g, 1, -31 + k * 9, kw - 2, 1, MARBLE[5]); }
      slabI(g, -2, 0, kw + 4, 12, MARBLE);
      for (const x of [6, kw - 12]) { slabI(g, x, 12, 6, GY - kt - 12, MARBLE); }
    });
    litTop(c, ka - 2, kt, kw + 4);
  }
  const aa = X(ARBOR.a), aw = ARBOR.b - ARBOR.a, at = Y(ARBOR.h);
  if (onScreen(state, aa - 60, aa + aw + 60)) {
    boxSides(c, E, aa - 6, aa + aw + 6, at, GY, 0.93, MARBLE, { apron: 12, leg: 8 });
    still(c, 'wh1-arbor', aa, at, -24, -16, aw + 48, GY - at + 20, g => {
      for (const x of [4, aw - 12]) slabI(g, x, 0, 8, GY - at, MARBLE);
      slabI(g, -6, 0, aw + 12, 12, MARBLE);
      for (let x = -4; x < aw + 6; x += 12) { box(g, x, 12, 6, 5, MARBLE[2]); }
      // (the climbing roses: vines up the posts, leaves in steps, roses)
      for (const px of [8, aw - 8]) for (let y = 10; y < GY - at - 4; y += 10) { const sx = px + Math.sin(y * 0.2) * 6; box(g, sx - 3, y, 6, 4, GRASS[2]); box(g, sx - 3, y, 3, 2, GRASS[4]); if ((y / 10) % 3 === 1) { inkP(g, () => g.arc(sx + 3, y + 2, 3.5, 0, Math.PI * 2), CHERRY[3], 1); box(g, sx + 2, y + 1, 1, 1, CHERRY[5]); } }
      for (let k = 0; k < 8; k++) { const rx = 2 + k * (aw / 7), ry = 16 + (k % 3) * 5; box(g, rx - 4, ry - 2, 8, 4, GRASS[2]); inkP(g, () => g.arc(rx, ry + 3, 3.5, 0, Math.PI * 2), k % 2 ? CHERRY[3] : '#F472B6', 1); }
    });
    litTop(c, aa - 6, at, aw + 12);
  }
  // (the rose bushes: round, dark green in steps, thorns, red roses)
  for (const [a0, b0] of ROSES) {
    const x = X(a0), w = b0 - a0;
    if (!onScreen(state, x - 40, x + w + 40)) continue;
    still(c, `wh1-roses-${w}`, x, GY, -6, -ROSE_H - 24, w + 12, ROSE_H + 26, g => {
      const bush = () => { g.moveTo(0, 0); for (let k = 0; k <= 4; k++) g.quadraticCurveTo((k - 0.5) * (w / 4), -ROSE_H - 12 - (k % 2) * 6, k * (w / 4), -ROSE_H + 6); g.lineTo(w, 0); g.closePath(); };
      stepsDown(g, bush, -4, -ROSE_H - 18, w + 8, ROSE_H + 18, ['#062A16', '#0E3A1E', '#16582A', '#1F6E36', '#3C8A4C', '#6CAA6A'], 3);
      for (let k = 0; k < 18; k++) { const lx = 6 + hash(k * 3.1) * (w - 12), ly = -ROSE_H + 6 + hash(k * 5.7) * (ROSE_H - 10); box(g, lx, ly, 4, 2, GRASS[4]); box(g, lx + 1, ly + 2, 3, 1, GRASS[1]); }
      for (let k = 0; k < 12; k++) { const tx = 6 + k * (w - 12) / 11, ty = -ROSE_H + 2 + (k % 3) * 8; g.fillStyle = INK; g.beginPath(); g.moveTo(tx - 2.5, ty); g.lineTo(tx, ty - 7); g.lineTo(tx + 2.5, ty); g.fill(); g.fillStyle = '#E8E0D0'; g.fillRect(tx - 0.5, ty - 4, 1, 3); }
      for (let k = 0; k < 6; k++) { const rx = 12 + k * (w - 24) / 5, ry = -ROSE_H + 10 + (k % 2) * 10; inkP(g, () => g.arc(rx, ry, 6, 0, Math.PI * 2), CHERRY[3], 1.4); g.strokeStyle = CHERRY[1]; g.lineWidth = 1; g.beginPath(); g.arc(rx, ry, 3, 0.5, Math.PI * 1.7); g.stroke(); box(g, rx - 3, ry - 4, 2, 2, CHERRY[5]); }
    });
  }
  // (the sprinklers: a brass head in the lawn, up and sputtering (the tell), then the column of water)
  for (const [rx, ph] of SPRINKLERS) {
    const x = X(rx);
    if (!onScreen(state, x - 60, x + 60)) continue;
    const s = sprinklerAt(ph, f), up = s.st === 'off' ? 0 : 1;
    inkP(c, () => c.ellipse(x, GY, 13, 4, 0, 0, Math.PI * 2), STEEL[2], 1.6); box(c, x - 9, GY - 2, 8, 1, STEEL[4]);
    inkP(c, () => c.rect(x - 4, GY - 4 - up * 12, 8, 4 + up * 12), BRASS[3], 1.6); box(c, x - 3, GY - 3 - up * 12, 2, 2 + up * 12, BRASS[5]); box(c, x + 2, GY - 3 - up * 12, 1, 2 + up * 12, BRASS[1]);
    if (up) inkP(c, () => c.ellipse(x, GY - 17, 6, 2.5, 0, 0, Math.PI * 2), BRASS[4], 1.2);
    if (s.st === 'tell' && f % 6 < 3) { box(c, x + (f % 4) - 3, GY - 26, 3, 3, '#BAE6FD'); box(c, x + 3 - (f % 3), GY - 30, 2, 2, '#E0F2FE'); }
    if (s.st === 'spray') {
      const h = SPRAY_H * Math.min(1, s.k * 5), wob = Math.sin(f * 0.6) * 2;
      const col = (dx: number, pad: number) => { c.beginPath(); c.moveTo(x - 6 + pad, GY - 14); c.quadraticCurveTo(x - SPRAY_W / 2 + wob + pad, GY - h * 0.6, x - SPRAY_W / 2 - 4 + pad + dx, GY - h + pad); c.lineTo(x + SPRAY_W / 2 + 4 - pad + dx, GY - h + pad); c.quadraticCurveTo(x + SPRAY_W / 2 + wob - pad, GY - h * 0.6, x + 6 - pad, GY - 14); c.closePath(); };
      c.fillStyle = INK; col(0, 0); c.fill();
      c.fillStyle = '#4CA8E8'; col(0, 2); c.fill();
      c.fillStyle = '#86CAF4'; col(-2, 5); c.fill();
      for (let k = 0; k < 4; k++) { const yy = GY - h + 8 + ((f * 4 + k * 30) % Math.max(1, h - 30)); box(c, x - 2 + wob, yy, 3, 10, '#E0F2FE'); }
      for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * 0.5, d = 10 + ((f + k * 7) % 14); box(c, x + Math.cos(a) * d * 1.4, GY - h + Math.sin(a) * d * 0.6, 3, 3, k % 2 ? '#C6E8FC' : '#FFFFFF'); }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The hazards in the play plane (behind him): the vacuum, the chandelier, the ball return and the balls

const hazards = (c: Ctx, state: GameState) => {
  const E = eyeOf(state);
  const s = whOf(state), f = state.frame;
  // The vacuum: a 1990s upright, nobody pushing it: its bag puffing, its headlamp, the cord whipping behind it
  const v = s.vac;
  if (v.x && onScreen(state, v.x - 120, v.x + 120)) {
    const d = v.dir, bag = 0.7 + v.bag * 0.3 + (v.pause ? Math.sin(f * 0.3) * 0.05 : Math.sin(f * 0.9) * 0.04);
    c.save(); c.translate(v.x, GY); c.scale(d, 1);
    c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(-18, -20); for (let k = 1; k <= 7; k++) c.lineTo(-18 - k * 13, -5 + Math.sin(f * 0.5 + k) * 5); c.stroke();
    c.strokeStyle = '#E8E4D0'; c.lineWidth = 2; c.stroke(); c.lineCap = 'butt';
    inkP(c, () => c.rect(-112, -9 + Math.sin(f * 0.5 + 7) * 5, 8, 6), '#2A2A36', 1.2);
    // (the handle up, its grip)
    stepsAcross(c, () => c.roundRect(-10, -100, 8, 54, 3), -10, -100, 8, 54, STEEL, 2);
    stepsDown(c, () => c.roundRect(-16, -108, 20, 10, 4), -16, -108, 20, 10, LICORICE, 1.6);
    // (the bag, puffed, plaid)
    const B = R('#3B82F6');
    c.save(); c.translate(-6, -58); c.scale(bag, bag);
    stepsAcross(c, () => c.ellipse(0, 0, 16, 25, -0.1, 0, Math.PI * 2), -16, -25, 32, 50, B, 2.4);
    c.strokeStyle = B[1]; c.lineWidth = 1; for (const k of [-8, 0, 8]) { c.beginPath(); c.moveTo(k, -22); c.lineTo(k, 22); c.stroke(); c.beginPath(); c.moveTo(-15, k); c.lineTo(15, k); c.stroke(); }
    c.restore();
    // (the head: red, chrome trim, HOOVER, the headlamp, the wheels; the nozzle's brush)
    stepsDown(c, () => c.roundRect(-26, -28, 54, 24, 6), -26, -28, 54, 24, CHERRY, 2.4);
    box(c, -24, -10, 50, 3, STEEL[4]); box(c, -24, -10, 50, 1, '#FFFFFF');
    // (the word never mirrored, whichever way it's going)
    c.save(); c.translate(-1, -15); if (c.getTransform().a < 0) c.scale(-1, 1);
    signText(c, 'HOOVER', 0, 0, tinyLetters(['#FFFFFF', '#F4F2FA']));
    c.restore();
    inkP(c, () => c.rect(14, -16, 16, 12), LICORICE[2], 1.6);
    c.fillStyle = v.pause ? '#7F1D1D' : '#FDE047'; c.beginPath(); c.arc(24, -22, 4.5, 0, Math.PI * 2); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
    if (!v.pause) { c.fillStyle = 'rgba(253,224,71,0.3)'; c.beginPath(); c.moveTo(28, -24); c.lineTo(70, -36); c.lineTo(70, -8); c.closePath(); c.fill(); }
    for (let k = -22; k < 26; k += 4) box(c, k, -4, 2, 4, '#6A5A3A');
    for (const wx of [-16, 16]) { inkP(c, () => c.arc(wx, -4, 5.5, 0, Math.PI * 2), LICORICE[3], 1.6); box(c, wx - 2, -6, 2, 2, STEEL[4]); }
    c.restore();
    // (the suction: streaks into its nozzle, dust)
    if (!v.pause) for (let k = 0; k < 4; k++) { const t = ((f * 6 + k * 40) % 120) / 120, x = v.x + d * (30 + (1 - t) * 160); box(c, Math.min(x, x + d * 14), GY - 8 - k * 7, 14, 2, 'rgba(255,255,255,0.75)'); if (k % 2) box(c, x + d * 20, GY - 12 - k * 6, 3, 3, '#C8C0B0'); }
  }
  // The chandelier: its chain from the ceiling rose, the gilt ring (lit along the top: he stands there), tiers of crystal
  const ch = chandelierAt(f), px = X(CHANDELIER.x), py = Y(CHANDELIER.pivotH);
  if (onScreen(state, px - 320, px + 320)) {
    const n = 18;
    for (let k = 0; k <= n; k++) { const t = k / n, lx = px + (ch.x - px) * t, ly = py + (ch.y - py) * t; c.save(); c.translate(lx, ly); c.rotate(ch.a + (k % 2 ? Math.PI / 2 : 0)); inkP(c, () => c.ellipse(0, 0, 3, 6, 0, 0, Math.PI * 2), k % 2 ? GILT[2] : GILT[4], 1.2); c.restore(); }
    c.save(); c.translate(ch.x, ch.y); c.rotate(ch.a * 0.5);
    const w = CHANDELIER.w;
    for (let k = -3; k <= 3; k++) { inkP(c, () => c.rect(k * 13 - 2, -12, 4, 12), '#FFFDF2', 1.2); box(c, k * 13 - 1, -12, 1, 12, '#FFFFFF'); }
    candleFlames(c, [-3, -2, -1, 0, 1, 2, 3].map(k => [k * 13, -14] as [number, number]), f);
    stepsDown(c, () => c.roundRect(-w / 2, 0, w, 12, 5), -w / 2, 0, w, 12, GILT, 2.4);
    for (let k = -w / 2 + 6; k < w / 2 - 4; k += 7) box(c, k, 6, 3, 2, GILT[1]);
    stepsAcross(c, () => { c.moveTo(-w / 2 + 6, 12); c.quadraticCurveTo(0, 62, w / 2 - 6, 12); c.closePath(); }, -w / 2, 12, w, 40, GILT, 2.4);
    for (let k = -4; k <= 4; k++) {
      const cx = k * 9, cy = 14 + (16 - Math.abs(k) * 3), sw = Math.sin(f * 0.2 + k) * 0.6;
      c.fillStyle = INK; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx - 4.5 + sw, cy + 10); c.lineTo(cx + sw, cy + 16); c.lineTo(cx + 4.5 + sw, cy + 10); c.closePath(); c.fill();
      c.fillStyle = '#A8D4F0'; c.beginPath(); c.moveTo(cx, cy + 2); c.lineTo(cx - 3 + sw, cy + 10); c.lineTo(cx + sw, cy + 14); c.lineTo(cx + 3 + sw, cy + 10); c.closePath(); c.fill();
      box(c, cx - 1 + sw, cy + 5, 1, 4, '#FFFFFF'); box(c, cx + 1 + sw, cy + 10, 1, 2, '#E2F4FE');
    }
    inkP(c, () => c.arc(0, 50, 5, 0, Math.PI * 2), '#C6E8FC', 1.4); box(c, -2, 47, 2, 2, '#FFFFFF');
    box(c, -w / 2 + 3, 0, w - 6, 2, '#FFF6E0');
    c.restore();
    // (the ceiling rose it hangs off)
    stepsDown(c, () => c.ellipse(px, py + 2, 22, 8, 0, 0, Math.PI), px - 22, py, 44, 10, GILT, 2);
    inkP(c, () => c.arc(px, py + 4, 6, 0, Math.PI * 2), GILT[4], 1.6);
  }
  // The ball return up on the landing (its light, the pins rattling in its rack in the tell), the grate, the balls
  const rx = X(BALL_RETURN), ry = Y(F2);
  if (onScreen(state, rx - 80, rx + 120)) {
    const tell = s.ballTell > 0;
    boxSides(c, E, rx - 10, rx + 80, ry - 48, ry, 0.94, NAVY, { noTop: true, lines: [ry - 16] });
    still(c, 'wh1-ballreturn', rx, ry, -14, -76, 100, 78, g => {
      stepsAcross(g, () => g.roundRect(-10, -70, 90, 70, [22, 22, 0, 0]), -10, -70, 90, 70, NAVY, 2.4);
      box(g, -8, -16, 86, 4, STEEL[4]); box(g, -8, -16, 86, 1, '#FFFFFF');
      inkP(g, () => g.ellipse(20, -32, 22, 16, 0, 0, Math.PI * 2), '#0C0A14', 2.4);
      box(g, 4, -40, 30, 3, '#2A2440');
      signText(g, 'RETURN', 48, -54, tinyLetters(['#FDE047', '#F59E0B']));
      for (let k = 0; k < 6; k++) box(g, -4 + k * 14, -6, 8, 3, STEEL[2]);
    });
    c.fillStyle = INK; c.beginPath(); c.arc(rx + 64, ry - 40, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = tell && f % 6 < 3 ? '#FDE047' : '#7F1D1D'; c.beginPath(); c.arc(rx + 64, ry - 40, 5.5, 0, Math.PI * 2); c.fill();
    if (tell && f % 6 < 3) box(c, rx + 61, ry - 43, 2, 2, '#FFFFFF');
    for (let k = 0; k < 3; k++) { const jig = tell ? Math.sin(f * 1.4 + k) * 2 : 0; c.save(); c.translate(rx + 50 + k * 9 + jig, ry - 14); c.rotate(jig * 0.05); inkP(c, () => c.ellipse(0, 0, 4.5, 12, 0, 0, Math.PI * 2), '#FFFFFF', 1.6); box(c, -3, -6, 6, 2, '#DC2626'); box(c, -3, -10, 2, 4, '#FFFFFF'); box(c, 1, -2, 2, 8, '#D8D4E4'); c.restore(); }
  }
  const ga = X(BALL_GRATE[0]), gb = X(BALL_GRATE[1]);
  if (onScreen(state, ga, gb)) { inkP(c, () => c.rect(ga, GY - 4, gb - ga, 6), STEEL[1], 1.6); for (let x = ga + 5; x < gb - 4; x += 7) { box(c, x, GY - 3, 3, 4, INK); box(c, x + 3, GY - 3, 1, 4, STEEL[4]); } }
  for (const b of s.balls) {
    c.save(); c.translate(b.x, b.y);
    c.fillStyle = INK; c.beginPath(); c.arc(0, 0, BALL_R + 1.5, 0, Math.PI * 2); c.fill();
    const Bb = ['#0C0A2E', '#1E1B4B', '#312E81', '#4338CA', '#6366F1', '#C7D2FE'];
    for (const [dx, dy, r, k] of [[0, 0, 1, 1], [-0.1, -0.1, 0.84, 2], [-0.22, -0.22, 0.58, 3], [-0.36, -0.36, 0.26, 4]] as [number, number, number, number][]) { c.fillStyle = Bb[k]; c.beginPath(); c.arc(dx * BALL_R, dy * BALL_R, r * BALL_R, 0, Math.PI * 2); c.fill(); }
    c.rotate(b.spin);
    c.fillStyle = '#C084FC'; for (let k = 0; k < 5; k++) { const a = k * 1.3; c.fillRect(Math.cos(a) * 7 - 1, Math.sin(a) * 7 - 1, 2, 2); }
    c.fillStyle = INK; for (const [hx, hy] of [[3, -5], [6, -1], [2, 0]]) { c.beginPath(); c.arc(hx, hy, 1.9, 0, Math.PI * 2); c.fill(); }
    c.rotate(-b.spin);
    box(c, -6, -7, 3, 2, Bb[5]);
    c.restore();
  }
};

/** The wax's shine (glints sliding over the parquet), the A-frame. */
const wax = (c: Ctx, state: GameState) => {
  const a = X(WAX[0]), b = X(WAX[1]), f = state.frame;
  if (!onScreen(state, a, b)) return;
  for (let k = 0; k < 7; k++) { const x = a + ((k * 173 + f * 2) % (b - a)), w = 30 + (k % 3) * 20; box(c, x, GY + 3, w, 2, 'rgba(255,255,255,0.6)'); box(c, x + 6, GY + 7, w * 0.6, 1, 'rgba(255,255,255,0.45)'); if (k % 2 && (f + k * 13) % 40 < 8) { box(c, x + w / 2 - 1, GY - 2, 2, 8, '#FFFFFF'); box(c, x + w / 2 - 4, GY + 1, 8, 2, '#FFFFFF'); } }
  still(c, 'wh1-waxsign', X(WAX[0] - 30), GY, -34, -78, 68, 80, g => {
    // (a yellow A-frame: CAUTION JUST WAXED, a cartoon man slipping on it)
    for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(s * 26, 0); g.lineTo(s * 6, -74); g.stroke(); }
    stepsDown(g, () => { g.moveTo(-28, -2); g.lineTo(-22, -74); g.lineTo(22, -74); g.lineTo(28, -2); g.closePath(); }, -28, -74, 56, 72, LEMONY, 2.4);
    box(g, -22, -72, 44, 8, INK);
    signText(g, 'CAUTION', 0, -66, tinyLetters(['#FDE047', '#F59E0B']));
    signText(g, 'JUST', 0, -50, { sx: 1, sy: 1, fill: '#111827' }); signText(g, 'WAXED', 0, -40, { sx: 1, sy: 1, fill: '#111827' });
    // (the slipping man: legs up, a splat)
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(-6, -24, 3, 0, Math.PI * 2); g.moveTo(-4, -22); g.lineTo(4, -14); g.moveTo(4, -14); g.lineTo(10, -24); g.moveTo(4, -14); g.lineTo(12, -16); g.moveTo(0, -18); g.lineTo(-6, -14); g.stroke();
    box(g, -14, -9, 28, 2, '#111827');
  });
};
const LEMONY = ['#6A4A06', '#A6760E', '#D8A818', '#F6D23A', '#FCE880', '#FFF8C8'];

/** The floor's cut edge along the play plane (the cartoon's cutaway: the floor slab on end, inked fat). */
const floorEdge = (c: Ctx, state: GameState, a: number, b: number, M: string[], col: string) => {
  const v0 = Math.max(a, state.camera.x - 20), v1 = Math.min(b, state.camera.x + CANVAS_WIDTH + 20);
  if (v0 >= v1) return;
  box(c, v0, GY, v1 - v0, 70, M[1]); box(c, v0, GY + 4, v1 - v0, 10, col); box(c, v0, GY + 4, v1 - v0, 2, mix(col, '#FFFFFF', 0.3));
  box(c, v0, GY + 14, v1 - v0, 3, INK);
  for (let x = Math.floor(v0 / 48) * 48; x < v1; x += 48) { box(c, x + 6, GY + 20, 16, 14, '#6A4020'); box(c, x + 6, GY + 20, 16, 2, '#8A5A30'); }
  checker(c, v0, GY + 17, v1 - v0, 2, M[2], 0, 1);
  box(c, v0, GY, v1 - v0, 4, '#FFF6E0'); box(c, v0, GY - 1, v1 - v0, 1, INK);
};

// ---------------------------------------------------------------------------------------------------------------

/** Screen space: the sky and the far off (the garden and the balcony are outdoors; the rooms cover it). */
export const drawWhBackdrop = (c: Ctx, state: GameState) => drawWhFar(c, state);

/** World space, behind him: the outdoors, the rooms, everything he stands on, the hazards. */
export const drawWhBack = (c: Ctx, state: GameState) => {
  const E = eyeOf(state);
  outdoors(c, state, E);
  drawRooms(c, state, E);
  // (the floor's front edges: the ground floor's slab end on, the garden's turf)
  floorEdge(c, state, X(-200), X(BALCONY_EDGE), MARBLE, '#C89A6A');
  const ga = Math.max(X(BALCONY_EDGE), state.camera.x - 20), gb = Math.min(X(12200), state.camera.x + CANVAS_WIDTH + 20);
  if (ga < gb) { box(c, ga, GY, gb - ga, 70, GRASS[1]); box(c, ga, GY + 6, gb - ga, 64, '#5A3A22'); box(c, ga, GY + 30, gb - ga, 40, '#4A2E1A'); checker(c, ga, GY + 29, gb - ga, 2, '#4A2E1A', 0, 1); box(c, ga, GY + 6, gb - ga, 1, INK); checker(c, ga, GY + 4, gb - ga, 4, GRASS[1], 0, 1); for (let x = Math.floor(ga / 14) * 14; x < gb; x += 14) box(c, x, GY + 14 + (x % 28 ? 6 : 0), 4, 3, '#7A5A3E');
    for (let x = Math.floor(ga / 40) * 40; x < gb; x += 40) { box(c, x + 20, GY + 36 + (x % 80 ? 0 : 10), 6, 4, '#2E1C10'); box(c, x + 21, GY + 36 + (x % 80 ? 0 : 10), 3, 1, '#8A6A4A'); c.strokeStyle = '#2E1C10'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 4, GY + 7); c.quadraticCurveTo(x + 8, GY + 16, x + 2, GY + 24); c.stroke(); } box(c, ga, GY, gb - ga, 3, GRASS[5]); for (let x = Math.floor(ga / 6) * 6; x < gb; x += 6) box(c, x, GY - 2 - (x % 18 ? 0 : 2), 2, 2 + (x % 18 ? 0 : 2), GRASS[4]); }
  drawUnderDeck(c, state);
  stairs(c, state);
  if (onScreen(state, X(PIANO.a) - 300, X(RISER.b) + 100)) { piano(c, E); chairStack(c, E); }
  wax(c, state);
  if (onScreen(state, X(PEROT_ARENA.a) - 100, X(PEROT_ARENA.b) + 100)) { podium(c, E); arenaLedges(c, E, PEROT_ARENA.ledges, 'gallery'); }
  if (onScreen(state, X(SIDEBOARD.a) - 100, X(TABLE.b) + 100)) dining(c, E, state);
  if (onScreen(state, X(FALWELL_ARENA.a) - 100, X(FALWELL_ARENA.b) + 100)) { bed(c, E); arenaLedges(c, E, FALWELL_ARENA.ledges, 'shelf'); }
  garden(c, state, E);
  for (const [x, h, words] of PLACARDS) if (onScreen(state, X(x) - 90, X(x) + 90)) placard(c, X(x), Y(h), words);
  if (onScreen(state, X(11700), X(12100))) toonSign(c, X(11920), GY, ['TO THE', 'WEST WING >'], { board: '#1D4ED8' });
  hazards(c, state);
};

/** World space, in front: the entrance's title banner, hung off the ceiling on its ropes. */
export const drawWhFront = (c: Ctx, state: GameState) => {
  const x = X(560), t = Y(CEIL1);
  if (!onScreen(state, x - 220, x + 220)) return;
  still(c, 'wh1-banner', x, t, -214, -4, 428, 150, g => {
    // (the ropes off two brass hooks, the banner: a navy field in steps, a red one inside, gold fringe, stars, the
    // show's name in its fat letters)
    for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(s * 170, 0); g.lineTo(s * 160, 40); g.stroke(); g.strokeStyle = '#D8C49A'; g.lineWidth = 2; g.stroke(); inkP(g, () => g.arc(s * 170, 2, 4, 0, Math.PI * 2), GILT[4], 1.2); }
    const outer = () => { g.moveTo(-196, 40); g.quadraticCurveTo(0, 30, 196, 40); g.lineTo(186, 120); g.quadraticCurveTo(0, 132, -186, 120); g.closePath(); };
    const inner = () => { g.moveTo(-184, 48); g.quadraticCurveTo(0, 39, 184, 48); g.lineTo(176, 112); g.quadraticCurveTo(0, 123, -176, 112); g.closePath(); };
    stepsDown(g, outer, -196, 30, 392, 102, NAVY, 4);
    stepsDown(g, inner, -184, 39, 368, 84, CHERRY, 2);
    for (let k = -180; k <= 180; k += 6) { const y = 121 + (1 - (k / 186) ** 2) * 10; box(g, k, y, 3, 7, GILT[3]); box(g, k, y, 1, 7, GILT[5]); }
    signText(g, "CHELSEA & SOCKS'", 0, 74, toonLetters(2));
    signText(g, 'WACKY WHITE HOUSE ADVENTURES!', 0, 102, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDE68A', '#FDE047']));
    for (const s of [-1, 1]) { starAt(g, s * 162, 86, 10, '#FFFFFF', true); starAt(g, s * 140, 60, 5, '#FDE047', true); }
  });
};
void wallpaper; void hash; void ramp6;
