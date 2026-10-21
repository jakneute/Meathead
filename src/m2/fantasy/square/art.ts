// The town square, painted (the SNES pass): one eye over the whole scene (kit.ts's view), the far off cached per hour
// (far.ts), the shopfronts back at FRONT_D with their sides and the pavement going back to them (fronts.ts), and in the
// play plane, everything he can stand on lit along its top (standable reads standable), everything else dimmed:
//
//   THE STATION    the FAIRY LAND EXPRESS at its platform (a scarlet engine, brass and gold lining, its coaches lit
//                  warm with people in them, steam off the stack), PLATFORM 7 5/8's brick pillar (a wall: its plaque)
//   THE STREET     the cobbles coming toward him (scanline-bent: their joints fan out), slush in the ruts; the BUTTER
//                  BREW cart (spoked wheels, its striped awning, the copper urn steaming, the price board); the
//                  balconies on their brackets
//   WANDS & SONS   a tall narrow front stacked to the ceiling with wand boxes, its sides and its roof going back (the
//                  roof's the way on)
//   THE CAROUSEL   the Prancing Pony: its deck and canopy round (their tops going back as drums), the rounding board's
//                  mirrors and bulbs, the scalloped valance, the horses rising and falling on their brass poles
//   THE GORGE      a chasm going back into the distance: its cliffs' faces (strata, icicles, frozen roots), a frozen
//                  waterfall at its far end, clouds drifting a long way down; the old carved columns he crosses by
//   GINGERBREAD    the porches on their candy-cane posts, the troll's humpback bridge over the frozen brook
//   THE TOWER      the Grand Staircase's hall: its back wall in courses (arched windows on the snow, portraits whose
//                  eyes follow him, house banners, torches), its side walls, its floor; the stone landings on their
//                  corbels, the pier, the beam out over the wall; the enchanted stepping slabs down the far side
//   THE BANDSTAND  white posts and fretwork, a green roof and its gold finial, bunting, the floor
//
// Signs: the storybook shingles on their posts (kit.ts storySign). The castle's in the sky (monument.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { timeOfDay, skyAt } from '../../timeOfDay';
import { signText } from '../../signLetters';
import { bendFloor, hazeBands } from '../../intro/art/kit';
import { tilePattern } from '../../../m1/game/render/pixelArt';
import {
  type Ctx, type View, INK, box, mix, hash, checker, onScreen, storySign, gilt, viewOf, at, still, stillAt, seen, polyF, sideBack, topBack, slab, postR, ballR, snowCap,
  COBBLE, FLAG, STONE, BRICK, IRON, GOLD, GINGER, ICING, PINE, SNOW, TIMBER, SLATE, LIP, ramp6, rampH, dimmed, hour, lit, warmGlass,
} from '../kit';
import { GY } from '../geometry';
import { drawSquareFar } from './far';
import { drawAlley, drawFronts, drawPavement, drawProps, frontLamps, setNoPave } from './fronts';
import {
  X, Y, GORGE, FAR_BANK, LEDGES, SHOP, SHOP_ROOF, CAROUSEL, CANOPY, DECK, PILLAR, PORCH, TOWER, LA, PIER, RB, TL, SPEAKER, CART, C1, C2, x1, x0,
} from './layout';

export const drawSquareBackdrop = (c: Ctx, state: GameState) => { drawSquareFar(c, state); return true; };

const TRAIN_D = 0.9, TOWER_D = 0.92, GORGE_D = 0.7, SET_D = 0.9;
setNoPave([[X(GORGE.a), X(FAR_BANK)], [X(TOWER.a), X(TOWER.b)]]);

// ---------------------------------------------------------------------------------------------------------------
// The street coming toward him: cobbles, bent

const cobbles = (c: Ctx, key: string, R: string[], S: string[], flags: boolean) => tilePattern(c, `fa-sq-${key}-${timeOfDay().key}`, 96, 40, g => {
  box(g, 0, 0, 96, 40, R[1]);
  if (flags) {
    for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) { const x = k * 32 + (r % 2) * 16, y = r * 20; for (const ox of [0, -96, 96]) { box(g, x + ox + 1, y + 1, 30, 18, R[3]); box(g, x + ox + 1, y + 1, 30, 1, R[4]); box(g, x + ox + 1, y + 1, 1, 18, R[4]); box(g, x + ox + 1, y + 17, 30, 2, R[2]); if (hash(x + y) > 0.5) box(g, x + ox + 8, y + 8, 4, 1, R[2]); } }
    return;
  }
  for (let r = 0; r < 4; r++) {
    let x = (r % 2) * 7;
    while (x < 96) {
      const w = 12 + Math.floor(hash(r * 31 + x * 0.7) * 6), y = r * 10;
      for (const ox of [0, -96, 96]) {
        const bx = x + ox;
        box(g, bx + 1, y + 1, w - 1, 8, R[3]);
        box(g, bx + 1, y + 1, w - 1, 1, R[4]); box(g, bx + 1, y + 1, 1, 7, R[4]); box(g, bx + 2, y + 2, 2, 1, R[5]);
        box(g, bx + 1, y + 7, w - 1, 2, R[2]); box(g, bx + w - 1, y + 2, 1, 7, R[2]);
        if (hash(r * 7 + x) > 0.72) { box(g, bx + 2, y, w - 3, 1, S[3]); checker(g, bx + 1, y + 1, w - 1, 2, S[2], 0, 1); }
      }
      x += w;
    }
  }
});

const drawNearGround = (c: Ctx, state: GameState, v: View) => {
  const L = state.camera.x - 40, R = state.camera.x + 840;
  const C = rampH(COBBLE), F = rampH(FLAG), S = rampH(SNOW), K = rampH(STONE);
  const runs: [number, number][] = [[X(-600), X(GORGE.a)], [X(FAR_BANK), X(x1 - x0 + 600)]];
  for (const [a, b] of runs) {
    const s = Math.max(a, L), e = Math.min(b, R);
    if (e <= s) continue;
    // (the kerb's face; the road: the platform's flags at the station, cobbles after, slush in the ruts)
    box(c, s, GY, e - s, 700, C[0]);
    const plat = Math.min(e, X(PILLAR.b));
    if (plat > s) { c.fillStyle = cobbles(c, 'plat', F, S, true); c.fillRect(s, GY + 8, plat - s, 600); }
    if (e > Math.max(s, plat)) { c.fillStyle = cobbles(c, 'cob', C, S, false); c.fillRect(Math.max(s, plat), GY + 8, e - Math.max(s, plat), 600); }
    for (const [y, h] of [[GY + 34, 10], [GY + 74, 14]] as const) { checker(c, s, y, e - s, h, S[2], 0, 2); box(c, s, y + 2, e - s, h - 4, mix(C[2], S[2], 0.5)); for (let x = Math.floor(s / 9) * 9; x < e; x += 9) if (hash(x * 0.3 + y) > 0.6) box(c, x, y + 1 + Math.floor(hash(x) * (h - 3)), 3, 1, S[4]); }
    bendFloor(c, v.eye, GY, GY, GY + 140, a, b);
    box(c, s, GY, e - s, 8, K[2]); box(c, s, GY + 6, e - s, 2, K[1]);
    for (let x = Math.floor(s / 40) * 40; x < e; x += 40) box(c, x, GY + 1, 1, 6, K[1]);
    box(c, s, GY, e - s, 2, LIP[2]); box(c, s, GY, e - s, 1, LIP[3]);
    for (let x = Math.floor(s / 6) * 6; x < e; x += 6) if (hash(x * 0.17) > 0.55) box(c, x, GY - 1, 4 + Math.floor(hash(x) * 4), 2, S[5]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The gorge: the chasm going back, the cliffs, the clouds a long way down, the columns

const ROCK = ['#1E1A2C', '#302A42', '#463E5C', '#5E5676', '#7A7294', '#9C94B4'];
const gorgeVoid = (c: Ctx, v: View) => {
  const a = X(GORGE.a), b = X(FAR_BANK);
  const pts: [number, number][] = [at(v.eye, a, GY, 1), at(v.eye, a, GY, GORGE_D), at(v.eye, b, GY, GORGE_D), at(v.eye, b, GY, 1), [b, GY + 900], [a, GY + 900]];
  const tod = timeOfDay(), top = Math.min(...pts.map(p => p[1]));
  c.save(); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  // (the depths: the sky's own colors banded down into a pale mist)
  const bands = 12, x0 = Math.min(a, pts[1][0]) - 20, w = Math.max(b, pts[2][0]) + 20 - x0;
  for (let i = 0; i < bands; i++) { const y = top + i * 60; box(c, x0, y, w, 61, mix(skyAt(0.55 + i * 0.04, tod), '#E8ECF8', i / bands * 0.5)); if (i) checker(c, x0, y - 2, w, 2, mix(skyAt(0.55 + i * 0.04, tod), '#E8ECF8', i / bands * 0.5), 0, 2); }
  // (the far end: cliffs closing in, a frozen waterfall down them into the mist)
  const [fa, fy] = at(v.eye, a, GY, GORGE_D), [fb] = at(v.eye, b, GY, GORGE_D), R = rampH(ROCK, true), Ic = rampH(['#4A6A9A', '#6E90C0', '#94B4DC', '#B8D2EE', '#DCEAFA', '#FFFFFF'], true);
  polyF(c, [[fa, fy], [fa + (fb - fa) * 0.38, fy + 30], [fa + (fb - fa) * 0.5, fy + 220], [fa, fy + 260]], R[2]);
  polyF(c, [[fb, fy], [fa + (fb - fa) * 0.62, fy + 30], [fa + (fb - fa) * 0.52, fy + 220], [fb, fy + 260]], R[1]);
  // (their rock: strata across them, a ledge or two in snow, cracks)
  c.save(); c.beginPath(); c.moveTo(fa, fy); c.lineTo(fa + (fb - fa) * 0.38, fy + 30); c.lineTo(fa + (fb - fa) * 0.5, fy + 220); c.lineTo(fa + (fb - fa) * 0.52, fy + 220); c.lineTo(fa + (fb - fa) * 0.62, fy + 30); c.lineTo(fb, fy); c.lineTo(fb, fy + 260); c.lineTo(fa, fy + 260); c.closePath(); c.clip();
  for (let y = fy + 8; y < fy + 260; y += 9) { box(c, fa, y, fb - fa, 1, (y - fy) % 27 < 9 ? R[3] : R[0]); }
  for (let k = 0; k < 6; k++) { const lx = fa + hash(k * 2.3) * (fb - fa), ly = fy + 30 + hash(k * 4.7) * 180; box(c, lx, ly, 14 + hash(k) * 16, 2, Ic[4]); box(c, lx, ly + 2, 14 + hash(k) * 16, 1, R[0]); }
  c.restore();
  const wx = fa + (fb - fa) * 0.5;
  for (let k = 0; k < 7; k++) { const x = wx - 30 + k * 9; box(c, x, fy + 20, 8, 160 + (k % 3) * 20, Ic[2 + (k % 3)]); box(c, x, fy + 20, 2, 150, Ic[5]); }
  for (let k = 0; k < 12; k++) box(c, wx - 34 + k * 6, fy + 16 + (k % 2) * 3, 4, 10, Ic[4]);
  hazeBands(c, x0, fy + 120, w, 200, '#F0F4FC', 0, 0.85, 6);
  // (clouds a long way down, drifting)
  const f = v.f;
  for (let i = 0; i < 9; i++) {
    const d = 0.75 + (i % 3) * 0.12, cx = a + ((hash(i * 3.1) * (b - a) + f * 0.12 * (1 + (i % 3))) % (b - a + 300)) - 150, cy = GY + 260 + (i % 3) * 90;
    const [sx, sy] = at(v.eye, cx, cy, d), r = 50 * d + hash(i) * 30;
    for (const [col, dy, k] of [['#B8C4E0', 6, 1], ['#DCE4F4', 0, 0.85], ['#FFFFFF', -5, 0.5]] as const) { c.fillStyle = mix(col, skyAt(0.8, tod), 0.25); c.beginPath(); c.ellipse(sx, sy + dy, r * k, r * 0.28 * k, 0, 0, Math.PI * 2); c.fill(); }
  }
  c.restore();
  // (the rim at the far end: snowy pines on it, a ruined stone arch)
  const P = rampH(PINE, true), Sn = rampH(SNOW, true);
  for (let k = 0; k < 6; k++) { const [px, py] = at(v.eye, a - 40 + k * ((b - a + 80) / 5), GY, GORGE_D), h = 30 + hash(k * 3) * 24; for (let t = 0; t < 3; t++) { const y = py - h + t * (h / 3), half = 5 + t * 5; polyF(c, [[px, y - 4], [px + half, y + h / 3], [px - half, y + h / 3]], P[2 + (t % 2)]); box(c, px - half * 0.6, y + h / 3 - 2, half * 1.2, 2, Sn[4]); } }
  const [ax, ay] = at(v.eye, a + (b - a) * 0.72, GY, GORGE_D), St = rampH(STONE, true);
  box(c, ax - 22, ay - 52, 8, 52, St[2]); box(c, ax + 14, ay - 40, 8, 40, St[1]); c.strokeStyle = St[2]; c.lineWidth = 6; c.beginPath(); c.arc(ax, ay - 46, 18, Math.PI, Math.PI * 1.6); c.stroke(); box(c, ax - 24, ay - 54, 12, 3, Sn[4]);
};
/** The cliffs' faces (the banks' ends, from right in front of him back to the far end), stepped in strata. */
const cliffFaces = (c: Ctx, v: View) => {
  const R = rampH(ROCK, true), S = rampH(SNOW, true);
  for (const [e, side] of [[X(GORGE.a), 1], [X(FAR_BANK), -1]] as const) {
    if (!sideBack(c, v.eye, e, side, GY, GY + 900, 1.3, GORGE_D, R, 6)) continue;
    // (strata running back, icicles under the lip, frozen roots)
    for (let k = 1; k < 9; k++) { const y = GY + k * 34 + (k % 2) * 8; const [p0, q0] = at(v.eye, e, y, 1.25), [p1, q1] = at(v.eye, e, y, GORGE_D); c.strokeStyle = k % 2 ? R[0] : R[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); }
    for (let t = 0; t < 1; t += 0.035) { const d = 1.25 - t * (1.25 - GORGE_D), [p, q] = at(v.eye, e, GY, d), l = (3 + hash(t * 97) * 10) * d; box(c, p, q + 1, Math.max(1, 2 * d), l, S[3]); box(c, p, q + 1, 1, l * 0.7, S[5]); }
    for (let k = 0; k < 4; k++) { const d = 1.1 - k * 0.1, [p, q] = at(v.eye, e, GY + 30 + k * 14, d); c.strokeStyle = R[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(p, q); c.quadraticCurveTo(p + side * 6, q + 10, p + side * 2, q + 22); c.stroke(); }
    // (finer bedding between the strata, crevices down the face (dark, a lit edge), ledges with snow along them and
    // icicles off their lips, a boulder jutting here and there: each pinned to a depth and a height, so it holds still)
    for (let k = 0; k < 26; k++) { const y = GY + 12 + k * 13, d0 = 1.25 - hash(k * 1.7) * 0.2, d1 = GORGE_D + hash(k * 2.3) * 0.25; const [p0, q0] = at(v.eye, e, y, d0), [p1, q1] = at(v.eye, e, y, d1); c.strokeStyle = k % 3 ? R[1] : R[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); }
    for (let k = 0; k < 9; k++) {
      const d = 1.2 - hash(k * 3.9 + side) * (1.2 - GORGE_D - 0.04), y0 = GY + 20 + hash(k * 5.3) * 200, len = 30 + hash(k * 7.1) * 70;
      const [p0, q0] = at(v.eye, e, y0, d), [p1, q1] = at(v.eye, e, y0 + len, d);
      c.strokeStyle = R[0]; c.lineWidth = 2 * d; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1 + side * 2, (q0 + q1) / 2); c.lineTo(p1, q1); c.stroke();
      c.strokeStyle = R[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0 + side, q0); c.lineTo(p1 + side * 3, (q0 + q1) / 2); c.stroke();
    }
    for (let k = 0; k < 5; k++) {
      const y = GY + 60 + k * 52, da = 1.2 - hash(k * 2.9 + side * 5) * 0.15, db = da - 0.12 - hash(k * 4.1) * 0.2;
      const [p0, q0] = at(v.eye, e, y, da), [p1, q1] = at(v.eye, e, y, db);
      c.strokeStyle = R[4]; c.lineWidth = 3; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke();
      c.strokeStyle = S[4]; c.lineWidth = 2; c.beginPath(); c.moveTo(p0, q0 - 2); c.lineTo(p1, q1 - 2); c.stroke();
      for (let t = 0.1; t < 1; t += 0.22) { const px = p0 + (p1 - p0) * t, py = q0 + (q1 - q0) * t, l = 4 + hash(t * 31 + k) * 8; box(c, px, py + 1, 2, l, S[3]); box(c, px, py + 1, 1, l * 0.6, S[5]); }
    }
    for (let k = 0; k < 4; k++) {
      const d = 1.15 - k * 0.12, y = GY + 110 + hash(k * 6.1 + side) * 160, [p, q] = at(v.eye, e, y, d), r = 9 * d;
      c.fillStyle = INK; c.beginPath(); c.ellipse(p + side * r * 0.6, q, r + 1.5, r * 0.75 + 1.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = R[3]; c.beginPath(); c.ellipse(p + side * r * 0.6, q, r, r * 0.75, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = R[4]; c.beginPath(); c.ellipse(p + side * r * 0.4, q - r * 0.25, r * 0.6, r * 0.35, 0, 0, Math.PI * 2); c.fill();
      box(c, p + side * r * 0.2 - 2, q - r * 0.75, 6, 2, S[4]);
    }
  }
};
/** The columns he crosses by: old carved pillars up out of the depths, snow on top (lit: stood on), faint runes. */
const column = (c: Ctx, v: View, a: number, b: number, top: number) => {
  const R = rampH(STONE), S = rampH(SNOW), y = Y(top);
  sideBack(c, v.eye, X(a), -1, y, GY + 900, 1, SET_D, R, 3);
  sideBack(c, v.eye, X(b), 1, y, GY + 900, 1, SET_D, R, 3);
  topBack(c, v.eye, X(a), X(b), y, 1, SET_D, rampH(SNOW), 3);
  still(c, `sqcol-${a}`, X(a), y, -4, -10, b - a + 8, 940, g => {
    const w = b - a;
    box(g, -1, 0, w + 2, 920, INK);
    slab(g, 0, 0, w, 920, R);
    for (let yy = 10; yy < 920; yy += 22) { box(g, 0, yy, w, 1, R[1]); box(g, 0, yy + 1, w, 1, R[4]); }
    // (a capital under the top, carved rings, a rune band, the shaft cracked)
    box(g, -4, 0, w + 8, 12, INK); box(g, -3, 1, w + 6, 10, R[4]); box(g, -3, 1, w + 6, 2, R[5]); box(g, -3, 9, w + 6, 2, R[2]);
    for (let k = 0; k < 3; k++) { const ry = 40 + k * 120; box(g, 2, ry, w - 4, 10, R[2]); for (let q = 6; q < w - 6; q += 10) box(g, q, ry + 3, 5, 4, '#9CD8F4'); }
    g.strokeStyle = R[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(w * 0.3, 20); g.lineTo(w * 0.45, 70); g.lineTo(w * 0.35, 110); g.lineTo(w * 0.5, 170); g.stroke();
    box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
    snowCap(g, -3, 0, w + 6, 4, a, S, true);
    box(g, -3, -4, w + 6, 1, LIP[3]);
  });
  // (the runes' faint glow, breathing)
  const k = 0.5 + 0.5 * Math.sin(v.f * 0.05 + a);
  c.globalAlpha = 0.25 * k; c.fillStyle = '#B8ECFF';
  for (let q = 0; q < 3; q++) c.fillRect(X(a) + 2, y + 40 + q * 120, b - a - 4, 10);
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// THE STATION: the FAIRY LAND EXPRESS, PLATFORM 7 5/8

const paintCoach = (g: Ctx, w: number, seed: number) => {
  // (a scarlet coach: cream-lined panels, its windows lit with people in them, doors, a curved roof under snow, bogies)
  const R = rampH(ramp6('#A8182A'), true), Gd = rampH(GOLD, true), I = rampH(IRON, true), S = rampH(SNOW, true), Sl = rampH(SLATE, true);
  box(g, -1, -101, w + 2, 88, INK);
  box(g, 0, -100, w, 86, R[3]); box(g, 0, -100, w, 3, R[4]); box(g, 0, -24, w, 10, R[2]); checker(g, 0, -27, w, 3, R[2], 0, 1);
  box(g, 0, -86, w, 2, Gd[3]); box(g, 0, -40, w, 2, Gd[3]);
  const G = warmGlass();
  for (let k = 0; k < Math.floor((w - 20) / 34); k++) {
    const wx = 12 + k * 34;
    if (k % 3 === 2) { box(g, wx - 1, -82, 22, 58, INK); box(g, wx, -81, 20, 56, R[2]); box(g, wx + 4, -76, 12, 18, G[3]); box(g, wx + 15, -50, 2, 3, Gd[4]); continue; }
    box(g, wx - 1, -79, 26, 32, INK);
    for (let i = 0; i < 3; i++) box(g, wx, -78 + i * 10, 24, 11, G[4 - i]);
    // (somebody in the window: a head, shoulders, a hat on some)
    if (hash(seed + k) > 0.3) { const px = wx + 7 + Math.floor(hash(seed * 2 + k) * 10); g.fillStyle = D2('#3A2A2A'); g.beginPath(); g.arc(px, -62, 4, 0, Math.PI * 2); g.fill(); box(g, px - 5, -58, 10, 11, D2('#3A2A2A')); if (hash(seed + k * 3) > 0.6) polyF(g, [[px - 5, -65], [px + 5, -65], [px + 1, -76]], D2('#2A2440')); }
    box(g, wx + 11, -78, 2, 30, R[1]); box(g, wx, -78, 2, 30, G[5]);
  }
  // (the roof: curved, under snow; its vents)
  polyF(g, [[-3, -100], [w + 3, -100], [w - 4, -112], [4, -112]], INK);
  polyF(g, [[-2, -101], [w + 2, -101], [w - 5, -111], [5, -111]], Sl[3]);
  snowCap(g, 4, -111, w - 8, 4, seed, S, true);
  for (let k = 30; k < w - 20; k += 60) { box(g, k, -118, 8, 6, Sl[2]); box(g, k - 1, -120, 10, 2, S[4]); }
  // (the bogies)
  for (const bx of [24, w - 64]) { box(g, bx, -16, 40, 6, I[2]); for (const wx of [bx + 8, bx + 32]) { ballR(g, wx, -8, 8, I); ballR(g, wx, -8, 3, rampH(ramp6('#A8182A'), true)); } }
  box(g, -6, -30, 6, 6, I[3]); box(g, w, -30, 6, 6, I[3]);
};
const D2 = (col: string) => dimmed(col);
const paintEngine = (g: Ctx) => {
  // (the engine, facing right: the scarlet cab, the boiler banded in brass, the smokebox and its door, the stack, the
  // steam dome, the big driving wheels and their rods, the buffer beam, the lamp; FAIRY LAND EXPRESS along it)
  const R = rampH(ramp6('#B01C24'), true), Gd = rampH(GOLD, true), I = rampH(IRON, true), K = rampH(ramp6('#22202E'), true), S = rampH(SNOW, true);
  // (the running board, the frame)
  box(g, -1, -44, 252, 14, INK); box(g, 0, -43, 250, 12, R[2]); box(g, 0, -43, 250, 2, R[4]); box(g, 0, -33, 250, 2, Gd[3]);
  // (the cab: windows, its roof)
  box(g, -1, -131, 72, 90, INK); slab(g, 0, -130, 70, 88, R);
  box(g, 10, -118, 22, 26, INK); box(g, 11, -117, 20, 24, warmGlass()[4]); box(g, 40, -118, 22, 26, INK); box(g, 41, -117, 20, 24, warmGlass()[3]);
  box(g, -6, -138, 82, 10, INK); box(g, -5, -137, 80, 8, K[3]); box(g, -5, -137, 80, 2, K[5]);
  snowCap(g, -5, -137, 80, 4, 3, S, true);
  box(g, 6, -86, 58, 2, Gd[4]);
  // (the boiler: a cylinder lying down, banded light to dark top to bottom, brass bands round it)
  const bx = 70, bw = 150, by = -112, bh = 66;
  box(g, bx, by - 1, bw, bh + 2, INK);
  const bands = [R[4], R[3], R[3], R[2], R[1]];
  for (let i = 0; i < 5; i++) box(g, bx, by + (bh * i) / 5, bw, bh / 5 + 1, bands[i]);
  box(g, bx, by + 6, bw, 2, R[5]);
  for (const k of [10, 52, 96, 140]) { box(g, bx + k, by, 4, bh, Gd[3]); box(g, bx + k, by, 1, bh, Gd[5]); }
  // (the smokebox and its round door, the stack, the dome, the whistle)
  box(g, bx + bw - 1, by - 3, 34, bh + 6, INK); box(g, bx + bw, by - 2, 32, bh + 4, K[3]); box(g, bx + bw, by - 2, 32, 4, K[5]);
  ballR(g, bx + bw + 28, by + bh / 2, 20, K); ballR(g, bx + bw + 30, by + bh / 2, 4, Gd);
  const sx = bx + bw + 10;
  box(g, sx - 1, by - 40, 18, 40, INK); box(g, sx, by - 39, 16, 39, K[3]); box(g, sx, by - 39, 4, 39, K[5]);
  box(g, sx - 5, by - 46, 26, 8, INK); box(g, sx - 4, by - 45, 24, 6, K[4]); box(g, sx - 4, by - 45, 24, 1, K[5]);
  snowCap(g, sx - 4, by - 45, 24, 2, 7, S, false);
  g.fillStyle = INK; g.beginPath(); g.ellipse(bx + 70, by, 15, 12, 0, Math.PI, 0); g.fill();
  g.fillStyle = Gd[3]; g.beginPath(); g.ellipse(bx + 70, by, 13, 10, 0, Math.PI, 0); g.fill(); box(g, bx + 62, by - 8, 4, 6, Gd[5]);
  box(g, bx + 30, by - 14, 4, 14, Gd[3]); box(g, bx + 28, by - 16, 8, 3, Gd[4]);
  // (the name along the boiler)
  signText(g, 'FAIRY LAND EXPRESS', bx + bw / 2, by + bh / 2 + 5, gilt(1));
  // (the cylinder, the buffer beam, the lamp, the cowcatcher's bars)
  box(g, bx + bw - 30, -48, 44, 18, INK); box(g, bx + bw - 29, -47, 42, 16, K[3]); box(g, bx + bw - 29, -47, 42, 2, K[5]);
  box(g, 250, -50, 20, 22, INK); box(g, 251, -49, 18, 20, R[3]); for (const y of [-46, -36]) { box(g, 270, y, 8, 5, I[3]); ballR(g, 279, y + 2, 3, I); }
  box(g, 256, -64, 10, 12, INK); box(g, 257, -63, 8, 10, lit() ? '#FFF4C8' : D2('#F2E2B8'));
  for (let k = 0; k < 5; k++) { g.strokeStyle = I[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(258 + k * 2, -28); g.lineTo(278 + k * 3, -4); g.stroke(); }
  // (the driving wheels: red, spoked, brass hubs; the coupling rod; the little leading wheels)
  for (const wx of [30, 92, 154]) {
    ballR(g, wx, -24, 23, I); ballR(g, wx, -24, 19, R);
    for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; g.strokeStyle = R[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(wx, -24); g.lineTo(wx + Math.cos(a) * 17, -24 + Math.sin(a) * 17); g.stroke(); }
    ballR(g, wx, -24, 5, Gd);
  }
  box(g, 26, -34, 134, 6, INK); box(g, 27, -33, 132, 4, I[4]); box(g, 27, -33, 132, 1, I[5]);
  for (const wx of [210, 236]) { ballR(g, wx, -12, 11, I); ballR(g, wx, -12, 8, R); ballR(g, wx, -12, 2, Gd); }
};
const drawStation = (c: Ctx, state: GameState, v: View) => {
  if (seen(v, X(-560), X(700), TRAIN_D, 80)) {
    // (the track bed past the platform's edge: ballast, sleepers, the rails; the coaches, the engine on it)
    const I = rampH(IRON, true), Bl = rampH(FLAG, true), Tm = rampH(TIMBER, true);
    polyF(c, [at(v.eye, X(-900), GY, TRAIN_D + 0.012), at(v.eye, X(560), GY, TRAIN_D + 0.012), at(v.eye, X(560), GY, TRAIN_D - 0.01), at(v.eye, X(-900), GY, TRAIN_D - 0.01)], Bl[1]);
    polyF(c, [at(v.eye, X(-900), GY, TRAIN_D + 0.016), at(v.eye, X(560), GY, TRAIN_D + 0.016), at(v.eye, X(560), GY, TRAIN_D + 0.012), at(v.eye, X(-900), GY, TRAIN_D + 0.012)], rampH(STONE)[4]);
    for (let x = -900; x < 560; x += 24) { const [p0, q0] = at(v.eye, X(x), GY, TRAIN_D + 0.008), [p1, q1] = at(v.eye, X(x), GY, TRAIN_D - 0.006); c.strokeStyle = Tm[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); }
    for (const d of [TRAIN_D + 0.004, TRAIN_D - 0.003]) { const [ra, ry] = at(v.eye, X(-900), GY, d), [rb] = at(v.eye, X(560), GY, d); box(c, ra, ry - 1, rb - ra, 2, I[4]); box(c, ra, ry - 1, rb - ra, 1, I[5]); }
    stillAt(c, v, TRAIN_D, 'sq-coach1', X(-560), GY, -10, -130, 360, 134, g => paintCoach(g, 340, 11));
    stillAt(c, v, TRAIN_D, 'sq-coach2', X(-210), GY, -10, -130, 360, 134, g => paintCoach(g, 340, 23));
    stillAt(c, v, TRAIN_D, 'sq-engine', X(140), GY, -10, -190, 300, 194, paintEngine);
    // (steam off the stack, hissing round the cylinders)
    const [sx, sy] = at(v.eye, X(140 + 238), GY - 158, TRAIN_D), f = state.frame;
    for (let k = 0; k < 6; k++) { const t = ((f * 0.6 + k * 22) % 130) / 130, r = 6 + t * 22; c.globalAlpha = 0.75 * (1 - t); c.fillStyle = t < 0.3 ? '#FFFFFF' : '#E4E8F2'; c.beginPath(); c.ellipse(sx - t * 70 + Math.sin(t * 6 + k) * 6, sy - t * 120, r, r * 0.8, 0, 0, Math.PI * 2); c.fill(); }
    const [hx, hy] = at(v.eye, X(140 + 236), GY - 36, TRAIN_D);
    for (let k = 0; k < 3; k++) { const t = ((f * 1.3 + k * 17) % 50) / 50; c.globalAlpha = 0.5 * (1 - t); c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(hx + t * 30, hy - t * 10, 4 + t * 10, 3 + t * 6, 0, 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 1;
  }
  // (PLATFORM 7 5/8's pillar: brick, its sides going back, its top; the plaque fixed to it)
  const p = PILLAR, B = rampH(BRICK);
  if (!seen(v, X(p.a) - 40, X(p.b) + 40)) return;
  sideBack(c, v.eye, X(p.a), -1, Y(p.h), GY, 1, SET_D, B, 3); sideBack(c, v.eye, X(p.b), 1, Y(p.h), GY, 1, SET_D, B, 3);
  topBack(c, v.eye, X(p.a), X(p.b), Y(p.h), 1, SET_D, rampH(STONE), 3);
  still(c, 'sq-pillar', X(p.a), Y(p.h), -4, -8, p.b - p.a + 8, p.h + 10, g => {
    const w = p.b - p.a, h = p.h, St = rampH(STONE);
    box(g, -1, -1, w + 2, h + 1, INK); slab(g, 0, 0, w, h, B);
    for (let y = 4, r = 0; y < h; y += 6, r++) { box(g, 0, y, w, 1, B[1]); for (let x = (r % 2) * 8; x < w; x += 16) box(g, x, y - 5, 1, 5, B[2]); }
    box(g, -3, 0, w + 6, 6, INK); box(g, -2, 1, w + 4, 4, St[4]); box(g, -2, 1, w + 4, 1, St[5]);
    box(g, 4, 22, w - 8, 22, INK); box(g, 5, 23, w - 10, 20, '#1E3A6E'); box(g, 5, 23, w - 10, 1, '#4A6AA0'); box(g, 6, 24, 2, 2, GOLD[4]); box(g, w - 8, 24, 2, 2, GOLD[4]);
    signText(g, '7 5/8', w / 2, 38, gilt(1));
    box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
    snowCap(g, -2, 0, w + 4, 3, 5, rampH(SNOW), true);
    box(g, -2, -4, w + 4, 1, LIP[3]);
  });
  storySign(c, X(140), GY, ['FAIRY LAND', 'HOGSMEAT VILLAGE >']);
};

// ---------------------------------------------------------------------------------------------------------------
// THE BUTTER BREW CART

const drawCart = (c: Ctx, state: GameState) => {
  const x = X(CART);
  if (!onScreen(state, x - 120, x + 120)) return;
  still(c, 'sq-cart', x, GY, -80, -140, 160, 144, g => {
    const T = rampH(TIMBER), Gd = rampH(GOLD), I = rampH(IRON), Cu = rampH(ramp6('#C06A3A')), Aw = [rampH(ramp6('#E0AE3A'), true), rampH(ramp6('#A01C2A'), true)];
    // (the awning on its poles: striped, scalloped; dimmed: not somewhere to stand)
    for (const px of [-56, 52]) postR(g, px, -116, -30, 4, rampH(TIMBER, true));
    box(g, -63, -124, 126, 14, INK);
    for (let k = 0; k < 6; k++) { const A = Aw[k % 2]; box(g, -62 + k * 21, -123, 21, 12, A[3]); box(g, -62 + k * 21, -123, 21, 2, A[4]); g.fillStyle = INK; g.beginPath(); g.arc(-51.5 + k * 21, -111, 11, 0, Math.PI); g.fill(); g.fillStyle = A[3]; g.beginPath(); g.arc(-51.5 + k * 21, -112, 10, 0, Math.PI); g.fill(); }
    snowCap(g, -63, -124, 126, 4, 21, rampH(SNOW, true), true);
    // (the body: painted panels, gold scrolls, BUTTER BREW on its side)
    box(g, -61, -35, 122, 23, INK); slab(g, -60, -34, 120, 21, rampH(ramp6('#2A3A6A')));
    box(g, -60, -34, 120, 3, T[4]); box(g, -60, -15, 120, 3, T[2]);
    for (const px of [-52, 8]) { box(g, px, -29, 44, 12, Gd[2]); box(g, px + 1, -28, 42, 10, rampH(ramp6('#22305A'))[3]); }
    signText(g, 'BUTTER', -30, -20, gilt(1)); signText(g, 'BREW', 30, -20, gilt(1));
    // (the copper urn, its tap, the mugs on the counter)
    box(g, -51, -60, 26, 26, INK); slab(g, -50, -59, 24, 25, Cu); box(g, -50, -52, 24, 2, Cu[1]); box(g, -50, -42, 24, 2, Cu[1]);
    polyF(g, [[-48, -59], [-38, -68], [-28, -59]], Cu[3]); ballR(g, -38, -68, 2, Gd);
    box(g, -26, -46, 6, 3, Gd[4]); box(g, -22, -46, 2, 6, Gd[4]);
    for (const mx of [22, 32, 42]) { box(g, mx - 1, -45, 9, 11, INK); box(g, mx, -44, 7, 10, rampH(ramp6('#E8D8B8'))[4]); box(g, mx, -44, 7, 2, '#FFF6D8'); box(g, mx + 7, -41, 2, 5, rampH(ramp6('#E8D8B8'))[2]); }
    // (the price board, on its iron stand)
    box(g, 46, -76, 2, 30, I[3]); box(g, 28, -96, 40, 24, INK); box(g, 29, -95, 38, 22, '#1E3A6E'); box(g, 29, -95, 38, 1, '#4A6AA0');
    signText(g, '$14', 48, -80, gilt(1));
    // (the wheels: spoked, iron-tyred; the shafts down to the cobbles)
    for (const wx of [-34, 34]) { ballR(g, wx, -12, 13, I); ballR(g, wx, -12, 10, T); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.strokeStyle = T[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(wx, -12); g.lineTo(wx + Math.cos(a) * 9, -12 + Math.sin(a) * 9); g.stroke(); } ballR(g, wx, -12, 3, Gd); }
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(60, -22); g.lineTo(76, -2); g.stroke(); g.strokeStyle = T[3]; g.lineWidth = 2; g.stroke();
    // (the lantern hung off the awning's pole)
    box(g, 50, -104, 2, 6, I[3]); box(g, 46, -98, 10, 12, INK); box(g, 47, -97, 8, 10, lit() ? '#FFF4C8' : hour('#F2D79A'));
  });
  // (the urn's steam, curling up; foam on the keg's tap drips)
  const f = state.frame;
  for (let k = 0; k < 5; k++) { const t = ((f * 0.5 + k * 19) % 90) / 90, r = 3 + t * 10; c.globalAlpha = 0.6 * (1 - t); c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(x - 38 + Math.sin(t * 7 + k) * 5 + t * 8, GY - 72 - t * 70, r, r * 0.8, 0, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// Ledges: balconies on brackets, the enchanted floating slabs, the tower's stone landings

/** A timber balcony: its floor lit along its top, its rail behind (dim), brackets and a post down to the street. */
const balcony = (c: Ctx, v: View, a: number, b: number, h: number) => {
  const y = Y(h), T = rampH(TIMBER), Td = rampH(TIMBER, true);
  topBack(c, v.eye, X(a), X(b), y, 1, 0.95, T, 2);
  still(c, `sq-balc-${a}`, X(a), y, -6, -30, b - a + 12, h + 34, g => {
    const w = b - a;
    // (the rail behind: dim)
    box(g, 0, -24, w, 3, Td[3]); for (let k = 4; k < w; k += 10) box(g, k, -22, 2, 22, Td[2]);
    for (const px of [6, w - 10]) { box(g, px - 1, 12, 6, h - 12, INK); box(g, px, 12, 4, h - 12, Td[3]); box(g, px, 12, 1, h - 12, Td[4]); }
    box(g, -1, -1, w + 2, 14, INK); box(g, 0, 0, w, 12, T[3]); box(g, 0, 9, w, 3, T[1]); for (let k = 12; k < w; k += 18) box(g, k, 2, 1, 7, T[2]);
    for (let k = 10; k < w - 6; k += 34) { polyF(g, [[k, 12], [k + 4, 12], [k + 14, 30], [k + 10, 30]], INK); polyF(g, [[k + 1, 12], [k + 3, 12], [k + 13, 29], [k + 11, 29]], Td[3]); }
    box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
    for (let k = 0; k < w; k += 7) if (hash(a + k) > 0.5) box(g, k, -1, 5, 1, rampH(SNOW)[5]);
  });
};
/** An enchanted stone slab hung in the air (Fairy Land's way): lit along its top, a rune glowing under it, sparkles. */
const floater = (c: Ctx, v: View, a: number, b: number, h: number) => {
  const y = Y(h), R = rampH(STONE);
  topBack(c, v.eye, X(a), X(b), y, 1, 0.94, R, 2);
  still(c, `sq-float-${a}-${h}`, X(a), y, -6, -8, b - a + 12, 32, g => {
    const w = b - a;
    polyF(g, [[-1, -1], [w + 1, -1], [w - 6, 16], [w / 2, 24], [6, 16]], INK);
    polyF(g, [[0, 0], [w, 0], [w - 7, 15], [w / 2, 22], [7, 15]], R[2]);
    polyF(g, [[0, 0], [w, 0], [w - 3, 8], [3, 8]], R[3]); box(g, 0, 0, w, 2, R[4]);
    for (let k = 10; k < w - 10; k += 12) box(g, k, 12, 6, 2, '#9CD8F4');
    box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
    snowCap(g, 1, 0, w - 2, 2, a, rampH(SNOW), true);
    box(g, 1, -3, w - 2, 1, LIP[3]);
  });
  const f = v.f, k = 0.5 + 0.5 * Math.sin(f * 0.07 + a);
  c.globalAlpha = 0.35 * k; c.fillStyle = '#B8ECFF'; c.fillRect(X(a) + 10, y + 12, b - a - 20, 3); c.globalAlpha = 1;
  if (f % 9 === 0 && seen(v, X(a), X(b))) {
    const sx = X(a) + ((f * 13 + a) % (b - a)), sy = y + 16 + ((f / 9) % 3) * 4;
    c.fillStyle = (f / 9) % 2 ? '#FFF6C8' : '#B8ECFF'; c.fillRect(sx, sy, 1, 3); c.fillRect(sx - 1, sy + 1, 3, 1);
  }
};
/** A stone landing on corbels (the tower's): lit along its top. */
const landing = (c: Ctx, v: View, a: number, b: number, h: number, under = 0) => {
  const y = Y(h), R = rampH(STONE);
  topBack(c, v.eye, X(a), X(b), y, 1, TOWER_D, R, 2);
  still(c, `sq-land-${a}-${h}`, X(a), y, -6, -6, b - a + 12, 44 + under, g => {
    const w = b - a;
    box(g, -1, -1, w + 2, 15, INK); slab(g, 0, 0, w, 14, R); box(g, 0, 11, w, 3, R[1]);
    for (let k = 20; k < w; k += 40) box(g, k, 2, 1, 9, R[2]);
    for (let k = 8; k < w - 10; k += 30) { polyF(g, [[k - 1, 14], [k + 13, 14], [k + 9, 30], [k + 3, 30]], INK); polyF(g, [[k, 14], [k + 12, 14], [k + 8, 29], [k + 4, 29]], R[2]); box(g, k + 1, 14, 3, 14, R[3]); }
    box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// WANDS & SONS

const drawShop = (c: Ctx, state: GameState, v: View) => {
  const a = X(SHOP.a), b = X(SHOP.b), top = Y(SHOP_ROOF);
  if (!onScreen(state, a - 120, b + 120)) return;
  const Wd = rampH(ramp6('#3A2448'));
  sideBack(c, v.eye, a, -1, top, GY, 1, SET_D, Wd, 3); sideBack(c, v.eye, b, 1, top, GY, 1, SET_D, Wd, 3);
  topBack(c, v.eye, a, b, top, 1, SET_D, rampH(SNOW), 3);
  still(c, 'sq-shop', a, top, -12, -40, b - a + 24, SHOP_ROOF + 44, g => {
    const w = b - a, h = SHOP_ROOF, Gd = rampH(GOLD), T = rampH(TIMBER), St = rampH(STONE), S = rampH(SNOW);
    box(g, -1, -1, w + 2, h + 1, INK); slab(g, 0, 0, w, h, Wd);
    for (let k = 0; k < w; k += 20) box(g, k, 6, 1, h - 6, Wd[2]);
    // (pilasters with gilt capitals, the stone plinth)
    for (const px of [0, 130, 270, w - 14]) { box(g, px, 0, 14, h, Wd[4]); box(g, px + 10, 0, 4, h, Wd[2]); box(g, px - 2, 44, 18, 6, Gd[3]); box(g, px - 2, 44, 18, 1, Gd[5]); }
    box(g, 0, h - 16, w, 16, St[2]); box(g, 0, h - 16, w, 2, St[4]);
    // (the windows, two floors, stacked to the ceiling with wand boxes; a single wand on a cushion in the lower)
    const G = warmGlass();
    for (const [wy, wh] of [[56, 70], [140, 90]] as const) for (const wx of [24, 154]) {
      const ww = 100;
      box(g, wx - 2, wy - 2, ww + 4, wh + 4, INK);
      for (let i = 0; i < 4; i++) box(g, wx, wy + (wh * i) / 4, ww, wh / 4 + 1, G[4 - i]);
      for (let r = 0; r < Math.floor(wh / 7) - (wy > 100 ? 3 : 0); r++) for (let q = 0; q < 10; q++) {
        const bx = wx + 2 + q * 10 - (r % 2), by = wy + 2 + r * 7;
        box(g, bx, by, 9, 6, ['#3A2A4A', '#5A3A24', '#2A3A4A', '#4A2A2A', '#2A2A2A'][(r * 3 + q) % 5]); box(g, bx, by, 9, 1, '#6A5A6A');
        box(g, bx, by + 1, 2, 4, ['#C8A040', '#A8A8B8', '#C83A3A', '#3A8A5A', '#E8E0D0'][(r + q * 2) % 5]);
      }
      if (wy > 100) { box(g, wx + 30, wy + wh - 16, 40, 10, '#7A1A3A'); box(g, wx + 30, wy + wh - 16, 40, 2, '#B83A5A'); g.save(); g.translate(wx + 50, wy + wh - 18); g.rotate(-0.15); box(g, -16, -1, 32, 3, '#4A2A14'); box(g, -16, -1, 8, 3, '#2A1408'); g.restore(); }
      for (let q = 1; q < 3; q++) box(g, wx + (ww * q) / 3 - 1, wy, 2, wh, T[2]);
      box(g, wx, wy + 18, ww, 2, T[2]);
      box(g, wx - 6, wy + wh + 2, ww + 12, 4, St[3]); box(g, wx - 6, wy + wh + 2, ww + 12, 1, St[5]); snowCap(g, wx - 6, wy + wh + 2, ww + 12, 3, wx + wy, S, true);
    }
    // (the door: tall, a bell over it, a step, BACK IN 5 MIN on a card)
    box(g, 290, 140, 70, h - 140, INK); box(g, 292, 142, 66, h - 142, T[2]); box(g, 296, 150, 26, 50, G[3]); box(g, 328, 150, 26, 50, G[2]);
    box(g, 300, 210, 50, 22, '#F2EAD0'); signText(g, 'BACK IN 5', 325, 224, { sx: 1, sy: 1, fill: '#3A2A1A' });
    ballR(g, 325, 132, 5, Gd); box(g, 324, 124, 2, 4, Gd[2]);
    box(g, 284, h - 6, 82, 6, St[3]); box(g, 284, h - 6, 82, 1, St[5]);
    // (the name board up top)
    box(g, 50, 12, w - 100, 26, INK); box(g, 52, 14, w - 104, 22, '#1E2A4A'); box(g, 52, 14, w - 104, 2, '#3A4A7A'); box(g, 50, 12, w - 100, 1, Gd[4]);
    signText(g, 'WANDS & SONS', w / 2, 32, gilt(2));
    box(g, 60, 40, w - 120, 1, Gd[3]);
    // (the roof's edge: a cornice, lit along its top (it's stood on); snow back along its far edge)
    box(g, -6, -2, w + 12, 10, INK); box(g, -5, -1, w + 10, 8, Wd[4]); box(g, -5, 5, w + 10, 2, Wd[2]);
    for (let k = -2; k < w + 4; k += 12) { box(g, k, 7, 6, 4, Wd[3]); box(g, k, 7, 6, 1, Wd[5]); }
    box(g, -5, -1, w + 10, 2, LIP[2]); box(g, -5, -1, w + 10, 1, LIP[3]);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// THE PRANCING PONY CAROUSEL

/** A drum's top going back (the deck's, the canopy's): a half ellipse from its front edge back to depth d. */
const drumTop = (c: Ctx, v: View, a: number, b: number, y: number, d: number, R: string[]) => {
  if (v.eye.y >= y - 1) return;
  const cx = (a + b) / 2, rx = (b - a) / 2, pts: [number, number][] = [];
  for (let i = 0; i <= 16; i++) { const t = (i / 16) * Math.PI; pts.push(at(v.eye, cx - Math.cos(t) * rx, y, 1 - (1 - d) * Math.sin(t))); }
  polyF(c, pts, R[3]);
  // (a lighter ring in from the rim: the boards worn by feet)
  const [mx, my] = at(v.eye, cx, y, 1 - (1 - d) * 0.5);
  polyF(c, pts.map(([px, py]) => [px + (mx - px) * 0.25, py + (my - py) * 0.25] as [number, number]), R[4]);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke();
};
const horse = (c: Ctx, x: number, y: number, col: string, saddle: string, f: number, k: number) => {
  const R = ramp6(hour(col)), Sd = ramp6(hour(saddle)), Gd = rampH(GOLD);
  const leg = Math.sin(f * 0.1 + k) * 3;
  // (legs in a gallop, the body, the neck and head, mane and tail, the saddle and its gold)
  for (const [lx, a] of [[-14, -0.5], [-8, 0.3], [10, -0.4], [16, 0.5]] as const) { c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(x + lx, y + 6); c.lineTo(x + lx + Math.sin(a) * 10 + leg, y + 20); c.stroke(); c.strokeStyle = R[2]; c.lineWidth = 3; c.stroke(); }
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, 22, 11, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[3]; c.beginPath(); c.ellipse(x, y, 21, 10, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[4]; c.beginPath(); c.ellipse(x - 4, y - 4, 14, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = R[2]; c.beginPath(); c.ellipse(x + 2, y + 6, 16, 3, 0, 0, Math.PI * 2); c.fill();
  polyF(c, [[x + 14, y - 6], [x + 26, y - 22], [x + 32, y - 18], [x + 22, y + 2]], INK);
  polyF(c, [[x + 15, y - 6], [x + 26, y - 20], [x + 30, y - 17], [x + 21, y + 1]], R[3]);
  c.fillStyle = INK; c.beginPath(); c.ellipse(x + 32, y - 18, 8, 5, 0.5, 0, Math.PI * 2); c.fill(); c.fillStyle = R[3]; c.beginPath(); c.ellipse(x + 32, y - 18, 7, 4, 0.5, 0, Math.PI * 2); c.fill();
  box(c, x + 31, y - 21, 2, 2, INK); box(c, x + 24, y - 27, 3, 5, R[3]);
  for (let m = 0; m < 4; m++) box(c, x + 16 + m * 3, y - 18 + m * -1, 3, 8, hour(mix(saddle, '#FFFFFF', 0.2)));
  polyF(c, [[x - 20, y - 4], [x - 32, y + 4], [x - 28, y + 14], [x - 20, y + 2]], hour(mix(saddle, '#FFFFFF', 0.2)));
  box(c, x - 8, y - 11, 16, 8, INK); box(c, x - 7, y - 10, 14, 6, Sd[3]); box(c, x - 7, y - 10, 14, 2, Sd[4]); box(c, x - 6, y - 4, 12, 2, Gd[4]);
  box(c, x + 18, y - 16, 10, 2, Gd[4]);
};
const drawCarousel = (c: Ctx, state: GameState, v: View) => {
  const a = X(CAROUSEL.a), b = X(CAROUSEL.b), f = state.frame;
  if (!onScreen(state, a - 80, b + 80)) return;
  const Gd = rampH(GOLD), R = rampH(ramp6('#C81E3A')), Cr = rampH(ramp6('#F6E6C0')), M = warmGlass();
  // (the deck's top going back, round)
  drumTop(c, v, a, b, Y(DECK), 0.88, rampH(ramp6('#7A4A5A')));
  // (the center column: mirrored panels, painted scenes, brass; behind the horses)
  const cx = (a + b) / 2, ct = Y(CANOPY) + 30, cb = Y(DECK);
  still(c, 'sq-carcol', cx, cb, -46, -(cb - ct) - 2, 92, cb - ct + 4, g => {
    const hgt = cb - ct;
    box(g, -45, -hgt, 90, hgt, INK); box(g, -44, -hgt, 88, hgt, Cr[2]);
    for (let k = 0; k < 4; k++) { const px = -42 + k * 22; box(g, px, -hgt + 8, 18, hgt - 16, Gd[2]); box(g, px + 2, -hgt + 10, 14, hgt - 20, k % 2 ? M[3] : '#A8C8E8'); box(g, px + 2, -hgt + 10, 3, hgt - 20, '#FFFFFF'); }
    box(g, -44, -hgt, 88, 6, Gd[3]); box(g, -44, -8, 88, 8, Gd[2]);
  });
  // (the poles and the horses on them, rising and falling)
  const cols = ['#F4F0E8', '#E8C8A0', '#C8B4E8', '#2A2430', '#F4F0E8', '#B8D8F0'], saddles = ['#C81E3A', '#2E5AAE', '#E0AE3A', '#2E8A5A', '#B04A9A', '#C86A2A'];
  for (let k = 0; k < 6; k++) {
    const px = a + 40 + k * 72, bob = Math.sin(f * 0.05 + k * 1.3) * 10;
    box(c, px - 2, Y(CANOPY) + 30, 4, CANOPY - DECK - 30, INK); box(c, px - 1, Y(CANOPY) + 30, 2, CANOPY - DECK - 30, Gd[4]);
    for (let y = Y(CANOPY) + 34; y < Y(DECK); y += 8) box(c, px - 1, y, 2, 2, Gd[2]);
    horse(c, px, Y(DECK) - 64 + bob, cols[k], saddles[k], f, k);
  }
  // (the deck: its skirt of painted panels, lit along its top)
  still(c, 'sq-cardeck', a, Y(DECK), -4, -4, b - a + 8, DECK + 8, g => {
    const w = b - a, P = rampH(ramp6('#7A4A5A'));
    box(g, -1, -1, w + 2, DECK + 1, INK); slab(g, 0, 0, w, DECK, P);
    for (let k = 6; k < w - 30; k += 44) { box(g, k, 6, 36, DECK - 10, Gd[2]); box(g, k + 1, 7, 34, DECK - 12, P[2]); g.strokeStyle = Gd[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(k + 4, DECK / 2 + 2); g.quadraticCurveTo(k + 18, 6, k + 32, DECK / 2 + 2); g.stroke(); }
    box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
  });
  // (the canopy: a drum's top going back (lit lip at its front), the rounding board with its mirrors and bulbs, the
  // scalloped valance in red and gold, a gold finial and its PRANCING PONY pennant behind)
  const cy = Y(CANOPY);
  box(c, cx - 2, cy - 64, 4, 64, dimmed(GOLD[3])); polyF(c, [[cx + 2, cy - 64], [cx + 34, cy - 58], [cx + 2, cy - 50]], dimmed('#C81E3A'));
  drumTop(c, v, a - 20, b + 20, cy, 0.86, rampH(ramp6('#C81E3A')));
  still(c, 'sq-canopy', a - 20, cy, -4, -6, b - a + 48, 60, g => {
    const w = b - a + 40;
    box(g, -1, -1, w + 2, 30, INK);
    box(g, 0, 0, w, 28, R[3]); box(g, 0, 0, w, 3, R[4]); box(g, 0, 24, w, 4, R[1]);
    for (let k = 10; k < w - 10; k += 36) { box(g, k, 5, 22, 16, Gd[3]); box(g, k + 2, 7, 18, 12, '#A8C8E8'); box(g, k + 2, 7, 4, 12, '#FFFFFF'); }
    for (let k = 4; k < w; k += 9) { box(g, k, 2, 3, 3, lit() ? '#FFF4C8' : Gd[4]); }
    for (let x = 0, k = 0; x < w; x += 22, k++) { g.fillStyle = INK; g.beginPath(); g.arc(x + 11, 28, 11, 0, Math.PI); g.fill(); g.fillStyle = k % 2 ? R[3] : Gd[4]; g.beginPath(); g.arc(x + 11, 28, 10, 0, Math.PI); g.fill(); g.fillStyle = k % 2 ? R[4] : Gd[5]; g.fillRect(x + 4, 28, 6, 2); }
    box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
  });
  if (lit()) { c.globalAlpha = 0.5 + 0.3 * Math.sin(f * 0.2); for (let k = 0; k < b - a + 40; k += 18) { c.fillStyle = '#FFF4C8'; c.fillRect(a - 20 + k + 4, cy + 2, 3, 3); } c.globalAlpha = 1; }
};

// ---------------------------------------------------------------------------------------------------------------
// GINGERBREAD LANE

const drawGingerbread = (c: Ctx, state: GameState, v: View) => {
  for (const [a, b, h] of [[PORCH.a, PORCH.b, PORCH.h], [9200, 9350, 130]] as const) {
    if (!onScreen(state, X(a) - 60, X(b) + 60)) continue;
    const G = rampH(GINGER), I = rampH(ICING);
    topBack(c, v.eye, X(a), X(b), Y(h), 1, 0.94, I, 2);
    still(c, `sq-porch-${a}`, X(a), Y(h), -14, -16, b - a + 28, h + 18, g => {
      const w = b - a, Gd = rampH(GINGER, true);
      // (the little house's wall behind the porch (dim), its door and a window)
      box(g, 10, 12, w - 20, h - 12, Gd[3]); for (let i = 0; i < 60; i++) box(g, 10 + hash(a + i) * (w - 20), 12 + hash(a * 2 + i) * (h - 14), 1, 1, Gd[2]);
      box(g, w / 2 - 14, h - 46, 28, 46, dimmed('#4A2410')); box(g, w / 2 - 12, h - 44, 24, 6, dimmed('#6A3418'));
      box(g, 20, 30, 24, 22, dimmed(lit() ? '#FFE07A' : '#E8344A')); box(g, 31, 30, 2, 22, rampH(ICING, true)[3]);
      // (candy-cane posts)
      for (const px of [6, w - 12]) { box(g, px - 1, 12, 8, h - 12, INK); box(g, px, 12, 6, h - 12, '#FFFFFF'); for (let y = 14; y < h; y += 8) polyF(g, [[px, y], [px + 6, y - 4], [px + 6, y], [px, y + 4]], '#E8344A'); }
      // (the porch roof: gingerbread, icing dripping off its edge, gumdrops; lit along its top)
      box(g, -1, -1, w + 2, 14, INK); slab(g, 0, 0, w, 12, G);
      box(g, 0, 10, w, 3, I[3]); for (let x = 2; x < w; x += 7) box(g, x, 12, 3, 2 + ((x + a) % 5), I[3]);
      for (let x = 10; x < w - 6; x += 20) ballR(g, x, 6, 3, ramp6(['#E8344A', '#4ADE80', '#FDE047', '#60A5FA'][(x / 20) % 4 | 0]));
      box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
      snowCap(g, 0, 0, w, 2, a, I, false);
      box(g, 0, -3, w, 1, LIP[3]);
    });
  }
  // (the troll's humpback bridge over the frozen brook: scenery, back a step)
  const bx = X(9420);
  if (seen(v, bx - 140, bx + 140, 0.95)) stillAt(c, v, 0.95, 'sq-bridge', bx, GY, -130, -70, 260, 74, g => {
    const St = rampH(STONE, true), Ic = rampH(['#4A6A9A', '#6E90C0', '#94B4DC', '#B8D2EE', '#DCEAFA', '#FFFFFF'], true), S = rampH(SNOW, true);
    box(g, -120, -6, 240, 6, Ic[3]); box(g, -120, -6, 240, 1, Ic[5]); for (let k = -110; k < 110; k += 17) box(g, k, -4, 8, 1, Ic[5]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(-104, 0); g.quadraticCurveTo(0, -78, 104, 0); g.lineTo(84, 0); g.quadraticCurveTo(0, -44, -84, 0); g.closePath(); g.fill();
    g.fillStyle = St[3]; g.beginPath(); g.moveTo(-102, 0); g.quadraticCurveTo(0, -75, 102, 0); g.lineTo(86, 0); g.quadraticCurveTo(0, -46, -86, 0); g.closePath(); g.fill();
    for (let k = -90; k <= 90; k += 15) { const t = (k + 100) / 200, y = -(1 - (2 * t - 1) ** 2) * 37; box(g, k, y - 2, 1, 14, St[1]); }
    g.strokeStyle = S[4]; g.lineWidth = 3; g.beginPath(); g.moveTo(-102, -2); g.quadraticCurveTo(0, -78, 102, -2); g.stroke();
    // (a sign on the troll's side: TOLL 1 GOAT)
    box(g, 70, -40, 2, 30, rampH(TIMBER, true)[2]); box(g, 54, -52, 36, 14, INK); box(g, 55, -51, 34, 12, rampH(TIMBER, true)[4]);
    signText(g, 'TOLL', 72, -42, { sx: 1, sy: 1, fill: INK });
  });
};

// ---------------------------------------------------------------------------------------------------------------
// THE GRAND STAIRCASE: the hall's walls and floor, its landings

const WALL_W = 325;
const paintHallWall = (g: Ctx, k: number) => {
  // (one bay of the back wall: stone in courses, an arched window on the snow, a portrait or a banner, a torch)
  const R = rampH(STONE, true), H = 900, Gd = rampH(GOLD, true), tod = timeOfDay();
  box(g, 0, -H, WALL_W, H, R[3]);
  for (let y = -H + 6, r = 0; y < 0; y += 14, r++) { box(g, 0, y, WALL_W, 1, R[1]); box(g, 0, y + 1, WALL_W, 1, R[4]); for (let x = (r % 2) * 18; x < WALL_W; x += 36) box(g, x, y - 13, 1, 13, R[2]); }
  for (let i = 0; i < 160; i++) { const x = Math.floor(hash(k * 31 + i) * 9) * 36 + ((Math.floor(hash(k * 17 + i * 3) * 64) % 2) * 18), y = -H + 7 + Math.floor(hash(k * 13 + i * 7) * 64) * 14; box(g, x + 1, y, 35, 13, hash(i * 1.3) > 0.5 ? R[2] : mix(R[3], R[4], 0.4)); }
  // (the top: a corbelled parapet, its merlons against the sky, snow on them)
  box(g, 0, -H, WALL_W, 14, R[2]); box(g, 0, -H + 12, WALL_W, 3, R[1]);
  for (let x = 0; x < WALL_W; x += 13) { box(g, x + 2, -H + 14, 7, 6, R[2]); box(g, x + 2, -H + 19, 7, 1, R[1]); }
  for (let x = 4; x < WALL_W; x += 26) { box(g, x - 1, -H - 15, 15, 16, INK); box(g, x, -H - 14, 13, 14, R[3]); box(g, x, -H - 14, 3, 14, R[4]); snowCap(g, x, -H - 14, 13, 3, k * 9 + x, rampH(SNOW, true), false); }
  // (the windows: tall, arched, the snowy sky in them, snow on the sills)
  for (const wy of [-560, -300]) {
    const wx = 60 + (k % 2) * 120, ww = 60, wh = 150;
    g.fillStyle = INK; g.beginPath(); g.arc(wx + ww / 2, wy, ww / 2 + 4, Math.PI, 0); g.fill(); box(g, wx - 4, wy, ww + 8, wh + 4, INK);
    g.save(); g.beginPath(); g.arc(wx + ww / 2, wy, ww / 2, Math.PI, 0); g.rect(wx, wy, ww, wh); g.clip();
    for (let i = 0; i < 6; i++) box(g, wx, wy - ww / 2 + (i * (wh + ww / 2)) / 6, ww, (wh + ww / 2) / 6 + 1, skyAt(0.3 + i * 0.1, tod));
    for (let i = 0; i < 20; i++) box(g, wx + hash(k * 9 + i) * ww, wy - 20 + hash(k * 7 + i * 3) * (wh + 10), 1, 1, '#FFFFFF');
    polyF(g, [[wx, wy + wh], [wx + 20, wy + wh - 30], [wx + 34, wy + wh - 18], [wx + ww, wy + wh - 40], [wx + ww, wy + wh]], dimmed('#E8EEF8'));
    for (let q = 1; q < 3; q++) box(g, wx + (ww * q) / 3 - 1, wy - ww / 2, 2, wh + ww / 2, R[1]);
    for (let q = 1; q < 5; q++) box(g, wx, wy + q * 30, ww, 1, R[1]);
    g.restore();
    box(g, wx - 8, wy + wh, ww + 16, 6, R[4]); box(g, wx - 8, wy + wh, ww + 16, 1, R[5]);
    snowCap(g, wx - 8, wy + wh, ww + 16, 3, k + wy, rampH(SNOW, true), true);
  }
  // (a portrait (its sitter: seeded) or a house banner, between the windows)
  const px = 180 - (k % 2) * 120;
  if (k % 3 !== 1) {
    for (const py of [-470, -200]) {
      box(g, px - 2, py - 2, 64, 80, INK); box(g, px, py, 60, 76, Gd[3]); box(g, px, py, 60, 2, Gd[5]); box(g, px + 54, py, 6, 76, Gd[2]);
      box(g, px + 6, py + 6, 48, 64, dimmed(['#2A3A2A', '#3A2A2A', '#2A2A3A', '#3A3424'][(k + py) % 4 & 3]));
      const skin = dimmed(['#F0D0B0', '#C8946A', '#8A5A36', '#5A3A24'][(k * 3 + (py & 3)) % 4]);
      box(g, px + 18, py + 46, 24, 24, dimmed(['#7A1A2A', '#1A3A6A', '#2A5A2A', '#5A2A6A'][k % 4]));
      g.fillStyle = skin; g.beginPath(); g.ellipse(px + 30, py + 32, 10, 12, 0, 0, Math.PI * 2); g.fill();
      box(g, px + 20, py + 18, 20, 6, dimmed(['#E8E0D0', '#2A1A10', '#8A3A1A', '#C8C8D0'][(k + 1) % 4]));
      if ((k + py) % 2) polyF(g, [[px + 18, py + 22], [px + 42, py + 22], [px + 32, py + 2]], dimmed('#2A2440'));
    }
  } else {
    const [m, t] = [['#9B1C1C', '#E0AE3A'], ['#166534', '#C8CCD4'], ['#1E3A8A', '#B07A4A'], ['#CA8A04', '#18181B']][(k >> 1) % 4];
    const Bn = rampH(ramp6(m), true);
    box(g, px - 4, -520, 68, 4, Gd[3]);
    box(g, px - 1, -516, 62, 300, INK); box(g, px, -516, 60, 298, Bn[3]); box(g, px, -516, 12, 298, Bn[4]); box(g, px + 48, -516, 12, 298, Bn[2]);
    polyF(g, [[px, -218], [px + 30, -240], [px + 60, -218], [px + 60, -200], [px + 30, -222], [px, -200]], Bn[3]);
    box(g, px + 6, -510, 4, 286, dimmed(t)); box(g, px + 50, -510, 4, 286, dimmed(t));
    ballR(g, px + 30, -420, 14, rampH(ramp6(t), true));
  }
  // (a torch on its iron sconce (the flame drawn live))
  const tx = 30 + (k % 2) * 270;
  box(g, tx - 4, -228, 8, 4, rampH(IRON, true)[3]); box(g, tx - 2, -250, 4, 24, rampH(TIMBER, true)[2]); box(g, tx - 4, -254, 8, 6, rampH(IRON, true)[2]);
};
/** Where the portraits' eyes are (world), so they follow him; the torches' flames. */
const hallBits = (k: number) => {
  const px = 180 - (k % 2) * 120, x = X(TOWER.a) + k * WALL_W;
  return { eyes: k % 3 !== 1 ? [[x + px + 30, GY - 470 + 32], [x + px + 30, GY - 200 + 32]] : [], torch: [x + 30 + (k % 2) * 270, GY - 256] };
};
const drawTowerHall = (c: Ctx, state: GameState, v: View) => {
  const a = X(TOWER.a), b = X(TOWER.b);
  if (!seen(v, a - 60, b + 60, TOWER_D, 120)) return;
  const F = rampH(FLAG), St = rampH(STONE, true), f = state.frame;
  // (the floor: flags in a hall's checker going back, the walls' feet)
  for (let i = 0; i < 4; i++) { const d0 = 1 - ((1 - TOWER_D) * i) / 4, d1 = 1 - ((1 - TOWER_D) * (i + 1)) / 4; polyF(c, [at(v.eye, a, GY, d0), at(v.eye, b, GY, d0), at(v.eye, b, GY, d1), at(v.eye, a, GY, d1)], i % 2 ? F[3] : F[4]); }
  c.strokeStyle = F[1]; c.lineWidth = 1; c.beginPath();
  for (let x = a; x <= b; x += 50) { const [p0, q0] = at(v.eye, x, GY, 1), [p1, q1] = at(v.eye, x, GY, TOWER_D); c.moveTo(p0, q0); c.lineTo(p1, q1); }
  c.stroke();
  // (the back wall, in bays, back at its depth; its side walls coming forward to the play plane)
  for (let k = 0; k * WALL_W < b - a; k++) {
    const x = a + k * WALL_W;
    if (!seen(v, x - 20, x + WALL_W + 20, TOWER_D, 60)) continue;
    stillAt(c, v, TOWER_D, `sq-hall-${k}`, x, GY, 0, -930, Math.min(WALL_W, b - x), 932, g => { g.save(); g.beginPath(); g.rect(0, -930, Math.min(WALL_W, b - x), 932); g.clip(); paintHallWall(g, k); g.restore(); });
  }
  sideBack(c, v.eye, a, v.eye.x > a ? 1 : -1, GY - 900, GY, 1, TOWER_D, St, 3);
  sideBack(c, v.eye, b, v.eye.x > b ? 1 : -1, GY - 900, GY, 1, TOWER_D, St, 3);
  // (the live bits: the portraits' eyes following him, the torches' flames)
  const p = state.player, pmx = p.pos.x + p.width / 2, pmy = p.pos.y + 20;
  for (let k = 0; k * WALL_W < b - a; k++) {
    const { eyes, torch } = hallBits(k);
    for (const [ex, ey] of eyes) {
      const [sx, sy] = at(v.eye, ex, ey, TOWER_D), dx = Math.max(-1, Math.min(1, (pmx - ex) / 300)), dy = Math.max(-1, Math.min(1, (pmy - ey) / 300));
      for (const o of [-4, 3]) { box(c, sx + o - 1, sy - 2, 3, 3, dimmed('#F4F0E8')); box(c, sx + o + Math.round(dx), sy - 2 + Math.round(dy), 1, 2, INK); }
    }
    const [tx, ty] = at(v.eye, torch[0], torch[1], TOWER_D), fl = Math.sin(f * 0.4 + k) * 2;
    for (const [col, r, dy] of [['#DC2626', 6, 0], ['#F97316', 5, -2], ['#FDE047', 3, -4]] as const) { c.fillStyle = col; c.beginPath(); c.moveTo(tx - r, ty + 2); c.quadraticCurveTo(tx + fl, ty - r * 2.4 + dy, tx + r, ty + 2); c.closePath(); c.fill(); }
  }
};
const drawTowerBits = (c: Ctx, state: GameState, v: View) => {
  if (!onScreen(state, X(TOWER.a) - 100, X(13300) + 100)) return;
  // (the landings and the pier: stone on corbels; the pier's column down to the floor)
  const St = rampH(STONE);
  for (const [px, w] of [[PIER.a + 70, 60], [LA.a, 30], [RB.b - 30, 30], [TL.a, 26]] as const) {
    const L = [PIER, LA, RB, TL].find(l => px >= l.a && px <= l.b)!;
    if (!seen(v, X(px) - 20, X(px) + w + 20)) continue;
    sideBack(c, v.eye, X(px), -1, Y(L.h) + 12, GY, 1, 0.96, St, 2); sideBack(c, v.eye, X(px + w), 1, Y(L.h) + 12, GY, 1, 0.96, St, 2);
    still(c, `sq-pier-${px}`, X(px), Y(L.h) + 12, -2, -2, w + 4, L.h - 8, g => { box(g, -1, 0, w + 2, L.h - 12, INK); slab(g, 0, 0, w, L.h - 12, St); for (let y = 10; y < L.h - 12; y += 16) box(g, 0, y, w, 1, St[1]); });
  }
  for (const L of [LA, PIER, RB, TL]) landing(c, v, L.a, L.b, L.h);
  // (the far wall: stone, crenellated, its top lit (it's stood on); its side going back)
  const a = X(TOWER.b), b = a + 60;
  sideBack(c, v.eye, b, 1, Y(600), GY, 1, SET_D, St, 3);
  topBack(c, v.eye, a, b, Y(600), 1, SET_D, St, 2);
  still(c, 'sq-farwall', a, Y(600), -6, -16, 72, 620, g => {
    box(g, -1, 0, 62, 600, INK); slab(g, 0, 0, 60, 600, St);
    for (let y = 8, r = 0; y < 600; y += 14, r++) { box(g, 0, y, 60, 1, St[1]); box(g, (r % 2) * 20 + 10, y - 13, 1, 13, St[2]); }
    for (let k = 0; k < 3; k++) { box(g, k * 22 - 1, -12, 18, 12, INK); box(g, k * 22, -11, 16, 11, St[4]); box(g, k * 22, -11, 16, 2, St[5]); }
    box(g, 0, 0, 60, 2, LIP[2]); box(g, 0, 0, 60, 1, LIP[3]);
    box(g, 22, 120, 10, 30, INK); box(g, 23, 121, 8, 28, warmGlass()[3]);
  });
  // (the beam out over the wall: oak, iron straps, lit along its top)
  const ba = TL.b + 60, bb = TOWER.b + 260;
  topBack(c, v.eye, X(ba), X(bb), Y(TOWER.top), 1, 0.96, rampH(TIMBER), 2);
  still(c, 'sq-beam', X(ba), Y(TOWER.top), -4, -4, bb - ba + 8, 22, g => {
    const w = bb - ba, T = rampH(TIMBER), I = rampH(IRON);
    box(g, -1, -1, w + 2, 16, INK); slab(g, 0, 0, w, 14, T); box(g, 0, 11, w, 3, T[1]);
    for (let k = 0; k < w; k += 4) if (hash(k) > 0.7) box(g, k, 4 + hash(k * 3) * 6, 6, 1, T[2]);
    for (let k = 20; k < w; k += 60) { box(g, k, 0, 6, 14, I[3]); box(g, k, 0, 1, 14, I[5]); box(g, k + 2, 6, 2, 2, I[1]); }
    box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
  });
  // (down the far side: enchanted stepping slabs)
  for (const [a2, b2, h] of [[12600, 12740, 500], [12780, 12920, 370], [12960, 13100, 240], [13140, 13280, 110]] as const) floater(c, v, a2, b2, h);
};

// ---------------------------------------------------------------------------------------------------------------
// THE BANDSTAND

const drawBandstand = (c: Ctx, state: GameState, v: View) => {
  const a = X(SPEAKER.stand.a), b = X(SPEAKER.stand.b);
  if (!onScreen(state, a - 100, b + 100)) return;
  // (the floor's top going back, octagonal; the gazebo behind and over it (dim: not somewhere to stand))
  drumTop(c, v, a, b, Y(24), 0.9, rampH(ramp6('#E8D8B8')));
  stillAt(c, v, 0.97, 'sq-gazebo', (a + b) / 2, Y(24), -220, -250, 440, 252, g => {
    const W = (b - a) / 2 + 10, Wh = rampH(ramp6('#F2EAD0'), true), Gr = rampH(ramp6('#3A7A5A'), true), Gd = rampH(GOLD, true), S = rampH(SNOW, true);
    // (the back rail between the posts)
    box(g, -W, -34, W * 2, 3, Wh[3]); for (let k = -W + 6; k < W; k += 9) box(g, k, -31, 2, 31, Wh[2]);
    // (the posts, white, fretwork brackets between their tops)
    for (const px of [-W, -W / 3, W / 3, W]) { postR(g, px, -150, 0, 7, Wh); for (const s of [-1, 1]) { g.strokeStyle = Wh[3]; g.lineWidth = 2; g.beginPath(); g.arc(px + s * 16, -150, 16, s > 0 ? Math.PI : Math.PI * 1.5, s > 0 ? Math.PI * 1.5 : Math.PI * 2); g.stroke(); } }
    // (the roof: a green tent in steps, scalloped trim, snow on it, bunting, the gold finial)
    polyF(g, [[-W - 24, -146], [0, -226], [W + 24, -146]], INK);
    polyF(g, [[-W - 22, -148], [0, -224], [W + 22, -148]], Gr[3]);
    polyF(g, [[-W - 22, -148], [0, -224], [-W * 0.3, -148]], Gr[4]);
    polyF(g, [[W * 0.35, -148], [0, -224], [W + 22, -148]], Gr[2]);
    for (let k = 0.25; k < 1; k += 0.25) { const y = -148 - 76 * k, hw = (W + 22) * (1 - k); box(g, -hw, y, hw * 2, 2, Gd[3]); }
    polyF(g, [[-W - 22, -150], [0, -226], [-W * 0.1, -150]], S[3]);
    box(g, -W - 24, -150, W * 2 + 48, 6, Wh[3]); for (let x = -W - 24; x < W + 24; x += 10) { g.fillStyle = Wh[3]; g.beginPath(); g.arc(x + 5, -144, 5, 0, Math.PI); g.fill(); }
    box(g, -2, -246, 4, 22, Gd[3]); ballR(g, 0, -248, 5, Gd);
    for (let x = -W - 20; x < W + 20; x += 12) { const y = -136 + Math.sin(((x + W) / (W * 2 + 40)) * Math.PI) * 10; polyF(g, [[x, y], [x + 10, y], [x + 5, y + 8]], dimmed(['#C81E3A', '#F2C84A', '#2E5AAE', '#F472B6'][Math.abs(Math.round(x / 12)) % 4])); }
  });
  // (the floor itself: a step, latticed skirt, lit along its top)
  still(c, 'sq-bandfloor', a, Y(24), -4, -4, b - a + 8, 30, g => {
    const w = b - a, P = rampH(ramp6('#E8D8B8'));
    box(g, -1, -1, w + 2, 25, INK); slab(g, 0, 0, w, 24, P);
    g.strokeStyle = P[1]; g.lineWidth = 1; g.beginPath(); for (let k = -24; k < w; k += 8) { g.moveTo(k, 8); g.lineTo(k + 16, 24); g.moveTo(k + 16, 8); g.lineTo(k, 24); } g.stroke();
    box(g, 0, 0, w, 7, P[3]); box(g, 0, 5, w, 2, P[1]);
    box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
  });
};

// ---------------------------------------------------------------------------------------------------------------

/** Behind everything that moves. */
export const drawSquareBack = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  drawAlley(c, v);
  drawFronts(c, v);
  if (seen(v, X(GORGE.a) - 200, X(FAR_BANK) + 200, GORGE_D, 200)) gorgeVoid(c, v);
  drawPavement(c, v);
  drawTowerHall(c, state, v);
  drawProps(c, v);
  drawStation(c, state, v);
  drawNearGround(c, state, v);
  if (seen(v, X(GORGE.a) - 200, X(FAR_BANK) + 200, GORGE_D, 200)) { cliffFaces(c, v); column(c, v, C1.a, C1.a + 88, C1.top); column(c, v, C2.a, C2.a + 80, C2.top); }
  drawCart(c, state);
  drawBandstand(c, state, v);
  drawShop(c, state, v);
  drawCarousel(c, state, v);
  drawGingerbread(c, state, v);
  drawTowerBits(c, state, v);
  for (const [a, b, h] of LEDGES) {
    if (!onScreen(state, X(a) - 20, X(b) + 20)) continue;
    // (the carousel's, the porches', the tower's, the descent's are drawn with their set pieces)
    if ((a >= CAROUSEL.a - 20 && b <= CAROUSEL.b + 20) || a === PORCH.a || a === 9200 || [LA.a, PIER.a, RB.a, TL.a].includes(a) || h === TOWER.top || (a >= 12600 && a <= 13140)) continue;
    if (h < 200) balcony(c, v, a, b, h); else floater(c, v, a, b, h);
  }
  // (the signs, on their posts)
  const signs: [number, string[], object?][] = [
    [3300, ['WANDS & SONS', 'MIND THE STAIRS']], [4980, ['THE PRANCING PONY', 'CAROUSEL']], [6560, ['THE WISHING GORGE', 'BOTTOMLESS. PROBABLY.'], { warn: true }],
    [8780, ['GINGERBREAD LANE']], [10800, ['THE GRAND STAIRCASE', 'STAIRS MAY MOVE']], [13360, ['THE BANDSTAND', 'ANNOUNCEMENTS TODAY']],
  ];
  for (const [x, words, o] of signs) if (onScreen(state, X(x) - 120, X(x) + 120)) storySign(c, X(x), GY, words, o as { warn?: boolean });
};

/** In front of everything: the near snow coming down. */
export const drawSquareSnow = (c: Ctx, state: GameState) => {
  c.save(); c.translate(state.camera.x, state.camera.y);
  snowNear(c, state);
  c.restore();
};
const snowNear = (c: Ctx, state: GameState) => {
  const f = state.frame;
  c.fillStyle = '#FFFFFF';
  for (let i = 0; i < 26; i++) {
    const h1 = hash(i * 3.17 + 5), h2 = hash(i * 1.91 + 2), h3 = hash(i * 0.77 + 9), fall = f * (0.7 + h3 * 0.5);
    const x = ((h1 * 860 + Math.sin(fall * 0.02 + i) * 18 - state.camera.x) % 860 + 860) % 860 - 30, y = ((h2 * 660 + fall - state.camera.y) % 660 + 660) % 660 - 30;
    c.globalAlpha = 0.75; c.fillRect(Math.round(x), Math.round(y), 2, 2);
  }
  c.globalAlpha = 1;
};

/** The lamps after dark: the street's, the fronts', the cart's, the station's, the hall's torches, the bandstand's. */
export const squareLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const v = viewOf(state), out = frontLamps(state, v);
  const add = (x: number, y: number, r: number, a: number, color = '#FFD08A') => { if (x > state.camera.x - 200 && x < state.camera.x + 1000) out.push({ x, y, r, a, color }); };
  add(X(CART) + 50, GY - 92, 110, 0.55);
  add(X(SPEAKER.post), Y(SPEAKER.hornH) + 40, 130, 0.6);
  for (let k = 0; k * WALL_W < TOWER.b - TOWER.a; k++) { const [x, y] = at(v.eye, hallBits(k).torch[0], hallBits(k).torch[1], TOWER_D); add(x, y, 120, 0.6, '#FFB060'); }
  for (const x of [X(-300), X(0), X(260)]) add(at(v.eye, x, GY - 120, TRAIN_D)[0], at(v.eye, x, GY - 120, TRAIN_D)[1], 120, 0.5);
  return out;
};
