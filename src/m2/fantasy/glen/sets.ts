// The enchanted glen's set pieces, painted (the SNES pass; art.ts calls them in depth order: what's farthest back
// first). Every face he could stand on is lit along its top; everything else dimmed (scenery).
//
//   THE GATE         an arch of twisted branches over the path, leaves and ivy on it, three lanterns hung under it
//   TOADSTOOL HOLLOW the mossy cliff: rock in strata, boulders, ferns, roots hanging off its lip, moss heaped over the
//                    top (lit); a spring out of a crack running down its face into a pool (live)
//   THE BRIDGE       the gorge going back into the distance (misty depths, cliffs closing in at its far end, a waterfall
//                    pouring (live), clouds a long way down drifting); its faces in strata, roots, ferns; the bridge's
//                    stone abutments, newel posts, planks dangling, rope rails cut; sawhorses and a wheelbarrow (it's
//                    CLOSED FOR REFURBISHMENT); the pier in the middle, its broken arches' springers either side
//   THE COTTAGE      gingerbread in steps, piped icing, sugar-glass windows lit warm, a chocolate-bar door, gumdrops,
//                    candy-cane corners, its roof frosted (lit: it's stood on), a peppermint chimney smoking; a bite
//                    out of a wall; the oaks the cauldrons hang off; the woodpile round the back
//   THE MINE         its hill (rock in steps, moss, pines), the portal in it (timbers, crossed pickaxes, a lantern; the
//                    inside dark: never seen), rails out of it, a cart of fake gems, the buffer at the shaft's lip; the
//                    head frame over the shaft (its wheel turning, a bucket going up and down on its cable); the shaft
//                    (timbered, ladders, lanterns down it); the timbered pillars he crosses by
//   UNICORN MEADOW   the clearing (round trees at its far edge, a hedge), the rainbow (a giant plywood arch on cloud
//                    plinths, its bands lit with bulbs after dark, its struts showing behind), a picket fence, plywood
//                    unicorn photo boards; the huntsman's tree stand (the tree, the ladder, the platform, its rail)
//   THE LAIR         a fiberglass cave (its back wall in panels, the bolts and seams showing, stalactites, fake
//                    crystals glowing, a staff door, torches (live)), its mouth's pillars and arch; the dragon's bones
//                    (ribs on a spine; the skull, its jaw open, THE PRICE TAG STILL ON); foam gold heaped round a chest;
//                    the back wall he goes over; ledges on iron brackets
//   THE QUEUE        TRUELLING TRAGONS' front (castle stone, turrets, banners, arrow slits lit, the three dragon heads
//                    (fire, ice, lightning) breathing (live), the name in gilt, the door's dark arch, the PA horn), its
//                    three tracks swooping over it with their loops and a train on them; the queue's rails and the
//                    crowd in it

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { timeOfDay, skyAt } from '../../timeOfDay';
import { signText } from '../../signLetters';
import { hazeBands, pixelBlob } from '../../intro/art/kit';
import {
  type Ctx, type View, INK, box, mix, hash, checker, onScreen, gilt, at, still, stillAt, seen, polyF, sideBack, topBack, slab, postR, ballR,
  STONE, IRON, GOLD, SLATE, TIMBER, LIP, ramp6, rampH, dimmed, lit, warmGlass,
} from '../kit';
import { GY } from '../geometry';
import { lookOf } from '../../adventure/temple/people';
import { X, Y, GAP1, GAP2, PIL, COT, CLIFF, P1, P2, P3, LAIR_WALL, STAND, LEDGES, CAULDRONS, PA_AT, QUEUE } from './layout';
import {
  GORGE_D, MEADOW_D, LAIR_D, MINE_D, HEAD_D, MEADOW, LAIR, MOSS, ROCKG, FIBER, BONE, BARKS, LEAF, BULB, CAPRED,
  leafy, paintTreeFoot, paintTrunk, paintRoundTree,
} from './paint';

const D = (col: string) => rampH(ramp6(col), true);
const N = (col: string) => rampH(ramp6(col));

/** Moss heaped along a top (x..x+w at y): a lumpy cap in steps, overhanging, tendrils and roots hanging off its lip. */
const mossCap = (g: Ctx, x: number, y: number, w: number, depth: number, seed: number, M: string[]) => {
  const lump = (i: number) => Math.round((hash(seed + i * 1.7) - 0.3) * depth * 0.6);
  box(g, x - 3, y - depth - 1, w + 6, depth + 3, INK);
  for (let k = 0; k < w + 4; k += 6) { const t = depth + lump(k); box(g, x - 2 + k, y - t - 1, Math.min(6, w + 4 - k), t + 1, INK); }
  box(g, x - 2, y - depth, w + 4, depth + 1, M[3]);
  for (let k = 0; k < w + 4; k += 6) { const t = depth + lump(k); box(g, x - 2 + k, y - t, Math.min(6, w + 4 - k), t - depth + 1, M[4]); box(g, x - 2 + k, y - t, Math.min(3, w + 4 - k), 1, M[5]); }
  box(g, x - 2, y - 1, w + 4, 2, M[2]); checker(g, x - 2, y - 3, w + 4, 2, M[2], 0, 1);
  for (let k = 3; k < w - 2; k += 4 + Math.floor(hash(seed + k) * 7)) { const l = 3 + Math.floor(hash(seed * 3 + k) * 12); box(g, x + k, y + 1, 1, l, M[k % 3 ? 2 : 1]); if (l > 8) box(g, x + k - 1, y + l - 2, 3, 2, M[3]); }
};
/** The lit lip along a standable top. */
const lip = (g: Ctx, x: number, y: number, w: number) => { box(g, x, y, w, 2, LIP[2]); box(g, x, y, w, 1, LIP[3]); };

// ---------------------------------------------------------------------------------------------------------------
// The gorges' depths

const gorgeVoid = (c: Ctx, v: View, ra: number, rb: number, mine: boolean) => {
  const a = X(ra), b = X(rb);
  if (!seen(v, a - 200, b + 200, GORGE_D, 200)) return;
  const pts: [number, number][] = [at(v.eye, a, GY, 1), at(v.eye, a, GY, GORGE_D), at(v.eye, b, GY, GORGE_D), at(v.eye, b, GY, 1), [b, GY + 900], [a, GY + 900]];
  const tod = timeOfDay(), top = Math.min(...pts.map(p => p[1])), f = v.f;
  const x0 = Math.min(a, pts[1][0]) - 20, w = Math.max(b, pts[2][0]) + 20 - x0;
  const [fa, fy] = at(v.eye, a, GY, GORGE_D), [fb] = at(v.eye, b, GY, GORGE_D);
  c.save(); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  if (!mine) {
    // (the depths: the sky's colors banded down into a pale green mist)
    for (let i = 0; i < 12; i++) { const y = top + i * 60, col = mix(skyAt(0.55 + i * 0.04, tod), '#DCEEDC', (i / 12) * 0.55); box(c, x0, y, w, 61, col); if (i) checker(c, x0, y - 2, w, 2, col, 0, 2); }
    // (the far end: mossy cliffs closing in, a waterfall pouring down between them into the mist)
    const R = rampH(ROCKG, true), M = rampH(MOSS, true);
    polyF(c, [[fa, fy], [fa + (fb - fa) * 0.36, fy + 26], [fa + (fb - fa) * 0.46, fy + 230], [fa, fy + 280]], R[2]);
    polyF(c, [[fa, fy], [fa + (fb - fa) * 0.36, fy + 26], [fa + (fb - fa) * 0.3, fy + 60], [fa, fy + 50]], M[2]);
    polyF(c, [[fb, fy], [fa + (fb - fa) * 0.64, fy + 26], [fa + (fb - fa) * 0.54, fy + 230], [fb, fy + 280]], R[1]);
    polyF(c, [[fb, fy], [fa + (fb - fa) * 0.64, fy + 26], [fa + (fb - fa) * 0.7, fy + 54], [fb, fy + 46]], M[1]);
    for (let k = 0; k < 6; k++) { const y = fy + 50 + k * 34; box(c, fa + 4, y, (fb - fa) * (0.3 + k * 0.025), 1, R[0]); box(c, fb - (fb - fa) * (0.3 + k * 0.02), y + 10, (fb - fa) * (0.28 + k * 0.02), 1, R[3]); }
    const wx = fa + (fb - fa) * 0.5, Wt = ['#6E9ACC', '#94BCE4', '#BCD8F2', '#E2F0FC', '#FFFFFF'];
    for (let k = 0; k < 8; k++) {
      const x = wx - 26 + k * 7;
      box(c, x, fy + 24, 7, 210, mix(Wt[1 + (k % 3)], skyAt(0.7, tod), 0.2));
      for (let y = ((f * 3 + k * 11) % 26); y < 210; y += 26) box(c, x + 1, fy + 24 + y, 3, 10, mix(Wt[4], skyAt(0.7, tod), 0.15));
    }
    for (let k = 0; k < 10; k++) box(c, wx - 30 + k * 6, fy + 20 + (k % 2) * 2, 5, 6, mix(Wt[4], skyAt(0.7, tod), 0.1));
    hazeBands(c, x0, fy + 140, w, 200, '#EEF6EE', 0, 0.85, 6);
    // (clouds a long way down, drifting)
    for (let i = 0; i < 9; i++) {
      const d = 0.75 + (i % 3) * 0.12, cx = a + ((hash(i * 3.1) * (b - a) + f * 0.12 * (1 + (i % 3))) % (b - a + 300)) - 150, cy = GY + 260 + (i % 3) * 90;
      const [sx, sy] = at(v.eye, cx, cy, d), r = 50 * d + hash(i) * 30;
      for (const [col, dy, k] of [['#B8C8D8', 6, 1], ['#DCE8EE', 0, 0.85], ['#FFFFFF', -5, 0.5]] as const) { c.fillStyle = mix(col, skyAt(0.8, tod), 0.25); c.beginPath(); c.ellipse(sx, sy + dy, r * k, r * 0.28 * k, 0, 0, Math.PI * 2); c.fill(); }
    }
    // (a bird or two down there, circling)
    for (let i = 0; i < 2; i++) { const t = f * 0.01 + i * 3, [sx, sy] = at(v.eye, (a + b) / 2 + Math.cos(t) * 160, GY + 140 + Math.sin(t) * 30, 0.8); box(c, sx - 3, sy, 3, 1, '#3A4A5A'); box(c, sx + 1, sy, 3, 1, '#3A4A5A'); box(c, sx, sy + (Math.floor(f / 8) % 2), 1, 1, '#3A4A5A'); }
  } else {
    // (the shaft: dark going down, timber cribbing round its walls, ladders, lanterns hung down it)
    for (let i = 0; i < 12; i++) { const y = top + i * 60, col = mix('#2A2018', '#040304', Math.min(1, i / 8)); box(c, x0, y, w, 61, col); if (i) checker(c, x0, y - 2, w, 2, col, 0, 2); }
    const T = rampH(TIMBER, true);
    for (let k = 0; k < 18; k++) {
      const y = GY + 10 + k * 40, [p, q] = at(v.eye, a, y, GORGE_D), [r] = at(v.eye, b, y, GORGE_D), fade = Math.min(0.9, k / 14);
      box(c, p, q, r - p, 6, mix(T[2], '#040304', fade)); box(c, p, q, r - p, 1, mix(T[4], '#040304', fade));
    }
    for (let x = a + 60; x < b; x += 160) { const [p, q] = at(v.eye, x, GY, GORGE_D); box(c, p, q, 6, 560, T[1]); box(c, p, q, 2, 560, T[3]); checker(c, p, q + 300, 6, 260, '#040304', 0, 1); }
    for (const lx of [a + 210, b - 260]) { const [p, q] = at(v.eye, lx, GY, GORGE_D); box(c, p, q, 2, 420, T[3]); box(c, p + 12, q, 2, 420, T[3]); for (let y = 6; y < 420; y += 12) box(c, p, q + y, 14, 2, T[2]); }
    for (let k = 0; k < 6; k++) {
      const lx = a + 100 + ((k * 263) % Math.max(1, b - a - 160)), ly = GY + 40 + (k % 3) * 110, [p, q] = at(v.eye, lx, ly, GORGE_D), fl = 0.75 + 0.25 * Math.sin(f * 0.3 + k * 2);
      c.globalAlpha = 0.18 * fl; c.fillStyle = '#FFB060'; c.fillRect(p - 18, q - 14, 36, 34); c.globalAlpha = 0.3 * fl; c.fillRect(p - 9, q - 6, 18, 18); c.globalAlpha = 1;
      box(c, p - 3, q - 8, 6, 2, '#18120E'); box(c, p - 3, q - 6, 6, 8, '#18120E'); box(c, p - 2, q - 5, 4, 6, fl > 0.85 ? '#FFE8A0' : '#FFB050');
    }
  }
  c.restore();
  // (the rim at the far end)
  if (!mine) {
    const L = rampH(LEAF, true), Bk = rampH(BARKS.oak, true);
    for (let k = 0; k < 7; k++) { const [px, py] = at(v.eye, a - 60 + k * ((b - a + 120) / 6), GY, GORGE_D), s = 0.8 + hash(k * 3) * 0.5; box(c, px - 3, py - 40 * s, 6, 40 * s, Bk[2]); leafy(c, px, py - 50 * s, 26 * s, L, k + ra); }
    const [ax, ay] = at(v.eye, a + (b - a) * 0.7, GY, GORGE_D), St = rampH(STONE, true);
    box(c, ax - 22, ay - 52, 8, 52, St[2]); box(c, ax + 14, ay - 40, 8, 40, St[1]); c.strokeStyle = St[2]; c.lineWidth = 6; c.beginPath(); c.arc(ax, ay - 46, 18, Math.PI, Math.PI * 1.6); c.stroke();
  } else {
    const T = rampH(TIMBER, true);
    const [p0, y0] = at(v.eye, a, GY, GORGE_D), [p1] = at(v.eye, b, GY, GORGE_D);
    box(c, p0, y0 - 3, p1 - p0, 4, T[3]); for (let x = p0; x < p1; x += 30) { box(c, x, y0 - 16, 2, 14, T[2]); } box(c, p0, y0 - 14, p1 - p0, 2, T[3]);
  }
};
/** A gorge's faces, from right in front of him back to its far end: in strata (the shaft's timbered). */
const gorgeFaces = (c: Ctx, v: View, ra: number, rb: number, mine: boolean) => {
  if (!seen(v, X(ra) - 200, X(rb) + 200, GORGE_D, 200)) return;
  const R = rampH(mine ? ramp6('#5A5048') : ROCKG, true), M = rampH(MOSS, true), T = rampH(TIMBER, true);
  for (const [e, side] of [[X(ra), 1], [X(rb), -1]] as const) {
    if (!sideBack(c, v.eye, e, side, GY, GY + 900, 1.3, GORGE_D, R, 6)) continue;
    for (let k = 1; k < 10; k++) { const y = GY + k * 32 + (k % 2) * 8; const [p0, q0] = at(v.eye, e, y, 1.25), [p1, q1] = at(v.eye, e, y, GORGE_D); c.strokeStyle = mine ? T[k % 2 ? 2 : 1] : k % 2 ? R[0] : R[3]; c.lineWidth = mine ? 3 : 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); }
    if (mine) { for (let t = 0; t < 1; t += 0.2) { const d = 1.25 - t * (1.25 - GORGE_D), [p, q] = at(v.eye, e, GY, d); box(c, p - 2, q, 4 * d, 500 * d, T[2]); box(c, p - 2, q, 1, 500 * d, T[4]); } continue; }
    // (moss over the lip, roots and ferns hanging off it)
    for (let t = 0; t < 1; t += 0.04) { const d = 1.25 - t * (1.25 - GORGE_D), [p, q] = at(v.eye, e, GY, d), l = (4 + hash(t * 97) * 14) * d; box(c, p, q, Math.max(1, 3 * d), 4 * d, M[3]); box(c, p, q + 3 * d, 1, l, M[1]); if (hash(t * 31) > 0.7) box(c, p - 1, q + l, 3, 2, M[3]); }
    for (let k = 0; k < 4; k++) { const d = 1.1 - k * 0.1, [p, q] = at(v.eye, e, GY + 30 + k * 14, d); c.strokeStyle = R[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(p, q); c.quadraticCurveTo(p + side * 6, q + 10, p + side * 2, q + 22); c.stroke(); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// THE GATE

const drawGate = (c: Ctx, v: View) => {
  const cx = X(135);
  if (!seen(v, cx - 180, cx + 180, 0.97, 60)) return;
  stillAt(c, v, 0.97, 'gl-gate', cx, GY, -160, -320, 320, 324, g => {
    const B = rampH(BARKS.oak, true), L = rampH(LEAF, true), Ir = rampH(IRON, true), G = warmGlass();
    // (two gnarled trunks, twisted round each other into the arch)
    for (const s of [-1, 1] as const) {
      for (const [lw, col, o] of [[22, INK, 0], [18, B[2], 0], [6, B[4], -4]] as const) {
        g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(s * 96, 0); g.bezierCurveTo(s * 110, -90, s * 80 + o, -170, s * 92 + o, -220); g.quadraticCurveTo(s * 70, -280, 0, -276); g.stroke();
      }
      for (const [lw, col] of [[12, INK], [9, B[3]]] as const) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(s * 80, 0); g.bezierCurveTo(s * 70, -80, s * 112, -150, s * 84, -230); g.quadraticCurveTo(s * 50, -270, s * 6, -262); g.stroke(); }
      g.lineCap = 'butt';
      // (roots, ivy, toadstools at the foot)
      polyF(g, [[s * 70, 0], [s * 86, -24], [s * 108, -24], [s * 132, 0]], B[2]); polyF(g, [[s * 76, 0], [s * 88, -20], [s * 96, -20], [s * 92, 0]], B[4]);
      for (let y = -10; y > -220; y -= 7) box(g, s * (96 + Math.sin(y * 0.07) * 10) - 2, y, 4, 4, L[(y / 7) & 1 ? 2 : 4]);
      leafy(g, s * 100, -240, 30, L, s + 3); leafy(g, s * 50, -286, 26, L, s + 7);
      ballR(g, s * 118, -6, 5, rampH(CAPRED, true));
    }
    leafy(g, 0, -292, 30, L, 11);
    // (an owl up on top)
    g.fillStyle = INK; g.beginPath(); g.ellipse(-20, -306, 9, 11, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = D('#B08A5A')[3]; g.beginPath(); g.ellipse(-20, -306, 8, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = D('#F2E6D0')[3]; g.beginPath(); g.ellipse(-20, -308, 6, 5, 0, 0, Math.PI * 2); g.fill(); box(g, -24, -310, 2, 2, INK); box(g, -18, -310, 2, 2, INK); box(g, -21, -306, 2, 2, D('#E0A040')[3]);
    // (three lanterns hung off the arch on chains)
    for (const [lx, ly, len] of [[-56, -246, 20], [0, -262, 34], [56, -246, 20]] as const) {
      for (let y = ly; y < ly + len; y += 4) box(g, lx, y, 1, 3, Ir[3]);
      polyF(g, [[lx - 6, ly + len], [lx + 7, ly + len], [lx + 4, ly + len - 4], [lx - 3, ly + len - 4]], Ir[2]);
      box(g, lx - 6, ly + len, 13, 16, INK); for (let i = 0; i < 3; i++) box(g, lx - 5, ly + len + 1 + i * 5, 11, 5, G[5 - i]); box(g, lx, ly + len + 1, 1, 14, Ir[3]);
      box(g, lx - 7, ly + len + 15, 15, 3, Ir[2]);
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// TOADSTOOL HOLLOW: the cliff and its spring

const SPRING = { x: 290, y: 40 };
const drawCliff = (c: Ctx, v: View) => {
  const a = X(CLIFF.a), b = X(CLIFF.b), top = Y(CLIFF.top), w = CLIFF.b - CLIFF.a, h = CLIFF.top;
  if (!seen(v, a - 60, b + 60, 1, 80)) return;
  const R = N('#6E7864'), M = N('#4E7E3A');
  sideBack(c, v.eye, a, -1, top, GY, 1, 0.88, R, 3); sideBack(c, v.eye, b, 1, top, GY, 1, 0.88, R, 3);
  topBack(c, v.eye, a, b, top, 1, 0.88, M, 3);
  still(c, 'gl-cliff', a, top, -8, -14, w + 16, h + 16, g => {
    box(g, -1, 0, w + 2, h, INK); slab(g, 0, 0, w, h, R);
    // (strata, boulders in it, cracks)
    for (let k = 0; k < 9; k++) { const y = 22 + k * 28 + (k % 2) * 6; box(g, 0, y, w, 1, R[1]); box(g, 0, y + 1, w, 1, R[4]); for (let x = (k * 37) % 50; x < w; x += 40 + ((x * 7) % 30)) box(g, x, y - 26, 1, 26, R[2]); }
    for (let k = 0; k < 8; k++) { const bx = 20 + hash(k * 3.3) * (w - 40), by = 40 + hash(k * 5.1) * (h - 70), r = 10 + hash(k) * 14; pixelBlob(g, bx, by, r, r * 0.7, R[1]); pixelBlob(g, bx - 2, by - 2, r * 0.85, r * 0.55, R[3]); pixelBlob(g, bx - r * 0.3, by - r * 0.3, r * 0.35, r * 0.2, R[4]); }
    g.strokeStyle = R[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(w * 0.4, 30); g.lineTo(w * 0.46, 90); g.lineTo(w * 0.4, 140); g.lineTo(w * 0.5, 210); g.stroke();
    // (moss patches down it, ferns in the ledges, flowers, a little cave at its foot with eyes in it)
    for (let k = 0; k < 10; k++) { const mx = hash(k * 7.1) * (w - 30), my = 30 + hash(k * 2.3) * (h - 60); box(g, mx, my, 20 + hash(k) * 20, 4, M[2]); box(g, mx, my, 12, 2, M[4]); checker(g, mx, my + 4, 20, 2, M[2], 0, 1); }
    for (let k = 0; k < 6; k++) { const fx = 30 + k * 64, fy = 52 + (k % 3) * 76; for (let fr = -2; fr <= 2; fr++) polyF(g, [[fx, fy], [fx + fr * 8, fy - 14 + Math.abs(fr) * 3], [fx + fr * 6 + 2, fy]], M[3 + (fr & 1)]); }
    for (let k = 0; k < 12; k++) box(g, 10 + hash(k * 9.3) * (w - 20), 20 + hash(k * 4.7) * (h - 30), 2, 2, ['#F49AC8', '#FDE68A', '#FFFFFF', '#A8C8FF'][k % 4]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(80, h, 26, 30, 0, Math.PI, 0); g.fill(); g.fillStyle = '#0A0808'; g.beginPath(); g.ellipse(80, h, 22, 26, 0, Math.PI, 0); g.fill();
    box(g, 72, h - 14, 3, 3, '#F2D24A'); box(g, 84, h - 14, 3, 3, '#F2D24A');
    // (the spring's crack, wet below it)
    polyF(g, [[SPRING.x - 6, SPRING.y], [SPRING.x + 6, SPRING.y], [SPRING.x + 2, SPRING.y + 8], [SPRING.x - 2, SPRING.y + 8]], R[0]);
    box(g, SPRING.x - 5, SPRING.y + 6, 10, h - SPRING.y - 6, mix(R[2], '#3A5A7A', 0.35)); checker(g, SPRING.x - 7, SPRING.y + 6, 2, h - SPRING.y - 6, mix(R[2], '#3A5A7A', 0.35), 0, 1);
    // (roots off the lip, the moss heaped over the top (it's stood on: lit))
    for (let k = 0; k < 7; k++) { const rx = 20 + k * 58 + hash(k) * 20; g.strokeStyle = N('#5A3E2C')[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(rx, 2); g.quadraticCurveTo(rx + 8, 20, rx + 2, 34 + hash(k * 3) * 30); g.stroke(); }
    mossCap(g, 0, 6, w, 6, 1900, M);
    lip(g, 0, 0, w);
  });
  // (the spring running down the face into its pool (live))
  const f = v.f, sx = a + SPRING.x, sy = top + SPRING.y + 4, Wt = ['#5A8ABC', '#8AB8E4', '#C8E4FA', '#FFFFFF'];
  box(c, sx - 3, sy, 6, GY - sy, Wt[1]);
  for (let y = ((f * 3) % 18); y < GY - sy; y += 18) { box(c, sx - 2, sy + y, 2, 7, Wt[3]); box(c, sx + 1, sy + y + 8, 1, 5, Wt[2]); }
  c.fillStyle = INK; c.beginPath(); c.ellipse(sx, GY + 2, 28, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = Wt[0]; c.beginPath(); c.ellipse(sx, GY + 2, 26, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = Wt[1]; c.beginPath(); c.ellipse(sx - 4, GY + 1, 18, 3, 0, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 3; k++) { const r = ((f * 0.3 + k * 6) % 18); c.strokeStyle = Wt[2]; c.lineWidth = 1; c.beginPath(); c.ellipse(sx, GY + 2, 4 + r, 1 + r * 0.2, 0, 0, Math.PI * 2); c.stroke(); }
  box(c, sx - 4, GY - 3, 8, 3, Wt[3]);
};

// ---------------------------------------------------------------------------------------------------------------
// THE STORYBOOK BRIDGE (out)

const drawBridgeBits = (c: Ctx, v: View) => {
  if (!seen(v, X(GAP1.a) - 360, X(GAP1.b) + 360, 0.95, 80)) return;
  // (the sawhorses, the wheelbarrow, the stones: it's CLOSED FOR REFURBISHMENT)
  for (const [rx, s] of [[GAP1.a - 150, 1], [GAP1.b + 150, -1]] as const) {
    stillAt(c, v, 0.95, `gl-saw-${rx}`, X(rx), GY, -110, -70, 220, 74, g => {
      const W = D('#C8B08A'), Rd = D('#C42828'), Wh = D('#F2F0E8'), St = D('#9A94AE'), Ir = rampH(IRON, true);
      for (const lx of [-46, 46]) { polyF(g, [[lx - 10, 0], [lx - 2, -40], [lx + 2, -40], [lx - 4, 0]], INK); polyF(g, [[lx + 10, 0], [lx + 2, -40], [lx - 2, -40], [lx + 4, 0]], INK); g.strokeStyle = W[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(lx - 8, 0); g.lineTo(lx, -40); g.lineTo(lx + 8, 0); g.stroke(); }
      box(g, -60, -48, 120, 14, INK); for (let k = 0; k < 8; k++) box(g, -59 + k * 15, -47, 15, 12, k % 2 ? Wh[3] : Rd[3]); box(g, -59, -47, 118, 2, Wh[5]);
      // (stones off the bridge stacked by it, a wheelbarrow of mortar)
      for (let k = 0; k < 4; k++) { const bx = s * (76 + (k % 2) * 16), by = -8 - Math.floor(k / 2) * 12; box(g, bx - 9, by - 1, 18, 12, INK); box(g, bx - 8, by, 16, 10, St[3]); box(g, bx - 8, by, 16, 2, St[5]); }
      if (s > 0) { polyF(g, [[-100, -22], [-70, -22], [-64, -8], [-96, -8]], INK); polyF(g, [[-99, -21], [-71, -21], [-66, -9], [-95, -9]], Ir[3]); box(g, -96, -24, 26, 3, D('#B8B0A0')[3]); ballR(g, -64, -6, 5, Ir); g.strokeStyle = W[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(-98, -14); g.lineTo(-112, -6); g.stroke(); }
    });
  }
  // (the newel posts at each bank, their rope rails cut and hanging into the gorge)
  for (const [rx, dir] of [[GAP1.a, 1], [GAP1.b, -1]] as const) {
    stillAt(c, v, 0.97, `gl-newel-${rx}`, X(rx), GY, -60, -90, 120, 300, g => {
      const St = D('#9E96B4'), Rp = D('#B89A6A');
      box(g, -dir * 20 - 9, -70, 18, 70, INK); slab(g, -dir * 20 - 8, -69, 16, 69, St); ballR(g, -dir * 20, -76, 8, St);
      for (let y = -60; y < 0; y += 12) box(g, -dir * 20 - 8, y, 16, 1, St[1]);
      for (const [y0, sag] of [[-56, 1], [-34, 0.7]] as const) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-dir * 14, y0); g.quadraticCurveTo(dir * 20, y0 + 60 * sag, dir * 14, y0 + 180 * sag); g.stroke(); g.strokeStyle = Rp[3]; g.lineWidth = 1.5; g.stroke(); }
    });
    // (the deck's planks broken off at the edge, dangling)
    stillAt(c, v, 0.99, `gl-planks-${rx}`, X(rx), GY, -50, -6, 100, 120, g => {
      const W = D('#8A5A30');
      for (let k = 0; k < 4; k++) { g.save(); g.translate(dir * (6 + k * 11), 2 + k * 3); g.rotate(dir * (0.25 + k * 0.28)); box(g, -6, 0, 12, 34 - k * 4, INK); box(g, -5, 1, 10, 32 - k * 4, W[3]); box(g, -5, 1, 3, 32 - k * 4, W[4]); box(g, -1, 4, 2, 2, rampH(IRON, true)[4]); g.restore(); }
    });
  }
};
/** The pier in the middle: dressed stone, its broken arches' springers out either side under the deck's level. */
const drawPier = (c: Ctx, v: View) => {
  const a = X(PIL.a), b = X(PIL.b), w = PIL.b - PIL.a;
  if (!seen(v, a - 80, b + 80, 1, 60)) return;
  const St = N('#8E86A8'), M = N('#4E7E3A');
  sideBack(c, v.eye, a, -1, GY, GY + 900, 1, 0.9, St, 3); sideBack(c, v.eye, b, 1, GY, GY + 900, 1, 0.9, St, 3);
  topBack(c, v.eye, a, b, GY, 1, 0.9, M, 3);
  still(c, 'gl-pier', a, GY, -60, -10, w + 120, 920, g => {
    box(g, -1, 0, w + 2, 900, INK); slab(g, 0, 0, w, 900, St);
    for (let y = 14, r = 0; y < 900; y += 18, r++) { box(g, 0, y, w, 1, St[1]); box(g, 0, y + 1, w, 1, St[4]); box(g, (r % 2) * 25 + 20, y - 17, 1, 17, St[2]); box(g, (r % 2) * 25 + 70, y - 17, 1, 17, St[2]); }
    // (the springers of the old arches, broken off, either side)
    for (const s of [-1, 1] as const) {
      const ex = s < 0 ? 0 : w;
      g.fillStyle = INK; g.beginPath(); g.moveTo(ex, 8); g.quadraticCurveTo(ex + s * 40, 10, ex + s * 52, 30); g.lineTo(ex + s * 44, 44); g.lineTo(ex + s * 50, 54); g.quadraticCurveTo(ex + s * 24, 50, ex, 110); g.closePath(); g.fill();
      g.fillStyle = St[2]; g.beginPath(); g.moveTo(ex, 10); g.quadraticCurveTo(ex + s * 38, 12, ex + s * 49, 30); g.lineTo(ex + s * 42, 43); g.lineTo(ex + s * 47, 52); g.quadraticCurveTo(ex + s * 22, 50, ex, 106); g.closePath(); g.fill();
      for (let k = 0; k < 3; k++) box(g, ex + s * (10 + k * 12) - 1, 12 + k * 4, 2, 30 - k * 6, St[1]);
    }
    // (ivy up it, a carved crest)
    for (let y = 10; y < 300; y += 6) box(g, 14 + Math.sin(y * 0.06) * 8, y, 4, 4, M[(y / 6) & 1 ? 2 : 4]);
    box(g, w / 2 - 12, 40, 24, 28, St[1]); box(g, w / 2 - 10, 42, 20, 24, St[4]); ballR(g, w / 2, 54, 6, rampH(GOLD, true));
    mossCap(g, 0, 4, w, 4, 4640, M);
    lip(g, 0, 0, w);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// THE WITCH'S COTTAGE, its oaks

/** Where the oaks stand (the first two cauldrons hang off the one big oak, a limb either side; none inside the cottage). */
const TRUNK_X = [5975, 5975, 6830, 7170];
const drawOaks = (c: Ctx, state: GameState, v: View) => {
  const B = rampH(BARKS.oak, true), Md = rampH(MOSS, true), L = rampH(LEAF, true);
  for (let i = 0; i < CAULDRONS.length; i++) {
    const [px, ph] = CAULDRONS[i], tx = X(TRUNK_X[i]), py = Y(ph);
    if (!onScreen(state, Math.min(tx, X(px)) - 200, Math.max(tx, X(px)) + 200)) continue;
    if (!i || TRUNK_X[i] !== TRUNK_X[i - 1]) {
      still(c, `gl-oakfoot-${i}`, tx, GY, -140, -424, 280, 428, g => paintTreeFoot(g, 64, 'oak', 40 + i * 4 + 1, B, Md));
      for (let k = 0; k < 10; k++) { const y = GY - 420 - k * 300; if (y + 300 < state.camera.y - 10) break; still(c, `gl-oaktrunk-${i % 2}`, tx, y, -34, -302, 68, 304, g => paintTrunk(g, 64, 'oak', 41 + (i % 2) * 3, B)); }
    }
    // (its limb out to the cauldron's branch, leaves along it)
    const s = Math.sign(tx - X(px)) || 1, ex = X(px) + s * 76, len = tx - ex;
    still(c, `gl-oaklimb-${i}`, ex, py, Math.min(0, len) - 60, -120, Math.abs(len) + 120, 180, g => {
      const sy = -50;
      for (const [lw, col, o] of [[18, INK, 0], [14, B[2], 0], [4, B[4], -4]] as const) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(len, sy + o); g.quadraticCurveTo(len * 0.5, sy - 20 + o, 0, o); g.stroke(); }
      g.lineCap = 'butt';
      for (let k = 0; k < 3; k++) { const t = 0.25 + k * 0.25, lx = len * t, ly = sy * (1 - t) - 20 * 2 * t * (1 - t); leafy(g, lx, ly - 26, 26 + k * 3, L, i * 7 + k); }
    });
  }
};
const drawCottage = (c: Ctx, state: GameState, v: View) => {
  const a = X(COT.a), b = X(COT.b), top = Y(COT.top), w = COT.b - COT.a, h = COT.top;
  if (!onScreen(state, a - 200, b + 260)) return;
  const Gn = N('#A8642E'), Ic = N('#F4F0FA');
  // (behind, on the roof: the peppermint chimney, gumdrops along the far edge, a candy-cane weathervane (dimmed))
  stillAt(c, v, 0.9, 'gl-cotback', (a + b) / 2, top, -200, -150, 400, 154, g => {
    const Pm = D('#F2F0E8'), Rd = D('#D02A2A'), Gc = ['#E04040', '#40B060', '#4080E0', '#E0C040', '#C060E0'];
    box(g, 70, -110, 30, 110, INK); box(g, 71, -109, 28, 109, Pm[3]); for (let y = -106; y < 0; y += 14) polyF(g, [[71, y], [99, y - 10], [99, y - 4], [71, y + 6]], Rd[3]);
    box(g, 66, -118, 38, 10, INK); box(g, 67, -117, 36, 8, D('#F4F0FA')[4]);
    for (let k = 0; k < 9; k++) { const gx = -170 + k * 40; g.fillStyle = INK; g.beginPath(); g.ellipse(gx, -2, 10, 8, 0, Math.PI, 0); g.fill(); g.fillStyle = D(Gc[k % 5])[3]; g.beginPath(); g.ellipse(gx, -2, 9, 7, 0, Math.PI, 0); g.fill(); box(g, gx - 4, -7, 2, 2, D(Gc[k % 5])[5]); }
    box(g, -60, -120, 3, 120, INK); box(g, -59, -120, 1, 118, Pm[3]); g.strokeStyle = Rd[3]; g.lineWidth = 3; g.beginPath(); g.arc(-52, -122, 8, Math.PI, 0); g.stroke();
    polyF(g, [[-74, -100], [-46, -100], [-50, -94], [-70, -94]], rampH(IRON, true)[3]);
  });
  // (the chimney's smoke (live): green-tinged, curling)
  const [cx, cy] = at(v.eye, (a + b) / 2 + 85, top - 118, 0.9), f = state.frame;
  for (let k = 0; k < 6; k++) { const t = ((f * 0.35 + k * 16) % 96) / 96, r = 3 + t * 9; c.globalAlpha = 0.5 * (1 - t); c.fillStyle = k % 2 ? '#C8E8C0' : '#E8F2E4'; c.fillRect(Math.round(cx + Math.sin(t * 5 + k) * 4 + t * 18 - r), Math.round(cy - t * 80 - r * 0.7), Math.round(r * 2), Math.round(r * 1.4)); }
  c.globalAlpha = 1;
  sideBack(c, v.eye, a, -1, top, GY, 1, 0.88, Gn, 3); sideBack(c, v.eye, b, 1, top, GY, 1, 0.88, Gn, 3);
  topBack(c, v.eye, a, b, top, 1, 0.88, Ic, 3);
  still(c, 'gl-cottage', a, top, -20, -20, w + 40, h + 24, g => {
    const Ch = N('#5A2E14'), Rd = N('#D02A2A'), Wh = N('#F8F4F0'), Pk = N('#F4A8C8'), G = warmGlass(), Gc = ['#E04040', '#40B060', '#4080E0', '#E0C040', '#C060E0'];
    // (the walls: gingerbread in steps, piped icing in scallops between the courses)
    box(g, -1, 0, w + 2, h, INK); slab(g, 0, 0, w, h, Gn);
    for (let k = 0; k < 40; k++) box(g, hash(k * 3.7) * w, hash(k * 1.9) * h, 2, 1, Gn[1]);
    for (let y = 44; y < h; y += 44) { for (let x = 0; x < w; x += 16) { g.strokeStyle = Ic[3]; g.lineWidth = 2; g.beginPath(); g.arc(x + 8, y - 3, 7, 0.2, Math.PI - 0.2); g.stroke(); box(g, x + 7, y + 3, 2, 2, Ic[4]); } }
    // (a bite out of the wall, the cake inside showing)
    g.fillStyle = INK; for (const [bx, by] of [[16, 120], [26, 112], [24, 128]]) { g.beginPath(); g.arc(bx, by, 9, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = N('#F2D8A8')[3]; for (const [bx, by] of [[16, 120], [26, 112], [24, 128]]) { g.beginPath(); g.arc(bx, by, 7.5, 0, Math.PI * 2); g.fill(); }
    for (let k = 0; k < 5; k++) box(g, 10 + k * 5, 116 + (k % 2) * 6, 2, 2, N('#C89858')[2]);
    // (two sugar-glass windows, lit, their icing frames, chocolate shutters, a gumdrop over each)
    for (const wx of [56, w - 116]) {
      box(g, wx - 12, 50, 10, 52, INK); box(g, wx - 11, 51, 8, 50, Ch[3]); box(g, wx + 62, 50, 10, 52, INK); box(g, wx + 63, 51, 8, 50, Ch[3]);
      for (const sx of [wx - 11, wx + 63]) for (let y = 56; y < 98; y += 10) box(g, sx + 1, y, 6, 1, Ch[1]);
      box(g, wx - 2, 48, 64, 56, INK); for (let i = 0; i < 4; i++) box(g, wx, 50 + i * 13, 60, 14, G[5 - i]);
      box(g, wx + 29, 50, 2, 52, Pk[3]); box(g, wx, 75, 60, 2, Pk[3]);
      box(g, wx - 4, 46, 68, 4, Ic[4]); box(g, wx - 4, 102, 68, 4, Ic[4]); for (let x = wx - 4; x < wx + 64; x += 8) { g.fillStyle = Ic[4]; g.beginPath(); g.arc(x + 4, 106, 3, 0, Math.PI); g.fill(); }
      g.fillStyle = INK; g.beginPath(); g.ellipse(wx + 30, 44, 10, 9, 0, Math.PI, 0); g.fill(); g.fillStyle = Rd[3]; g.beginPath(); g.ellipse(wx + 30, 44, 9, 8, 0, Math.PI, 0); g.fill(); box(g, wx + 26, 38, 2, 2, Rd[5]);
      // (a flower box of lollipops)
      box(g, wx - 2, 108, 64, 10, INK); box(g, wx - 1, 109, 62, 8, Ch[3]); for (let k = 0; k < 5; k++) { const lx = wx + 6 + k * 12; box(g, lx, 98, 1, 11, Wh[3]); ballR(g, lx, 96, 4, N(Gc[k % 5])); }
    }
    // (the door: a chocolate bar in squares, a peppermint knob, a candy wreath; its icing arch)
    const dx = w / 2 - 26, dh = 96;
    box(g, dx - 4, h - dh - 4, 60, dh + 4, INK); box(g, dx - 3, h - dh - 3, 58, dh + 3, Ic[4]);
    box(g, dx - 1, h - dh, 54, dh, INK); for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { const qx = dx + 2 + k * 26, qy = h - dh + 3 + r * 23; box(g, qx, qy, 24, 21, Ch[3]); box(g, qx, qy, 24, 2, Ch[5]); box(g, qx, qy, 2, 21, Ch[4]); box(g, qx + 20, qy, 4, 21, Ch[1]); }
    ballR(g, dx + 44, h - 46, 5, Wh); box(g, dx + 42, h - 48, 4, 1, Rd[3]); box(g, dx + 44, h - 50, 1, 8, Rd[3]);
    g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(dx + 26, h - 70, 12, 0, Math.PI * 2); g.stroke(); for (let k = 0; k < 10; k++) { const a2 = (k / 10) * Math.PI * 2; ballR(g, dx + 26 + Math.cos(a2) * 12, h - 70 + Math.sin(a2) * 12, 3, N(Gc[k % 5]), false); }
    // (gumdrops along the foot; candy canes up the corners)
    for (let x = 6; x < w - 6; x += 22) { g.fillStyle = INK; g.beginPath(); g.ellipse(x + 6, h, 8, 8, 0, Math.PI, 0); g.fill(); g.fillStyle = N(Gc[(x / 22) % 5 | 0])[3]; g.beginPath(); g.ellipse(x + 6, h, 7, 7, 0, Math.PI, 0); g.fill(); box(g, x + 3, h - 5, 2, 2, '#FFFFFF'); }
    for (const x of [-8, w]) { box(g, x - 1, -6, 10, h + 6, INK); box(g, x, -6, 8, h + 6, Wh[3]); box(g, x, -6, 2, h + 6, Wh[5]); for (let y = -4; y < h; y += 16) polyF(g, [[x, y], [x + 8, y - 6], [x + 8, y + 2], [x, y + 8]], Rd[3]); }
    // (the roof's edge: frosting thick over the top, drips down, sprinkles; lit along the top (it's stood on))
    box(g, -12, -10, w + 24, 14, INK); box(g, -11, -9, w + 22, 12, Ic[3]); box(g, -11, -9, w + 22, 3, Ic[5]);
    for (let x = -10; x < w + 10; x += 13) { const dl = 6 + Math.floor(hash(x * 0.7) * 12); box(g, x, 2, 9, dl, INK); box(g, x + 1, 2, 7, dl - 1, Ic[3]); box(g, x + 1, 2, 2, dl - 2, Ic[5]); g.fillStyle = Ic[3]; g.beginPath(); g.arc(x + 4.5, 2 + dl - 1, 3.5, 0, Math.PI); g.fill(); }
    for (let k = 0; k < 26; k++) box(g, -8 + hash(k * 5.7) * (w + 16), -7 + hash(k * 2.1) * 6, 2, 1, N(Gc[k % 5])[4]);
    lip(g, -11, -10, w + 22);
  });
  // (the woodpile round the back: the way back up onto the roof from the garden (lit along its top))
  const wa = X(6690), wb = X(6770);
  still(c, 'gl-woodpile', wa, GY, -4, -118, wb - wa + 8, 122, g => {
    const W = N('#8A5A30'), E = N('#D8B07A');
    box(g, 0, -105, wb - wa, 105, INK); box(g, 1, -104, wb - wa - 2, 104, W[1]);
    for (let r = 0; r < 5; r++) for (let k = 0; k < 4; k++) { const lx = 10 + k * 20 + (r % 2) * 6, ly = -11 - r * 21; if (lx > wb - wa - 6) continue; g.fillStyle = INK; g.beginPath(); g.arc(lx, ly, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = W[3]; g.beginPath(); g.arc(lx, ly, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = E[3]; g.beginPath(); g.arc(lx - 1, ly - 1, 6, 0, Math.PI * 2); g.fill(); g.strokeStyle = E[1]; g.lineWidth = 1; g.beginPath(); g.arc(lx - 1, ly - 1, 3, 0, Math.PI * 2); g.stroke(); }
    box(g, -2, -108, wb - wa + 4, 6, INK); box(g, -1, -107, wb - wa + 2, 4, W[3]);
    lip(g, -1, -107, wb - wa + 2);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// THE DWARF MINE

const MINE_X = 7820;
const drawMineHill = (c: Ctx, v: View) => {
  const cx = X(MINE_X);
  if (!seen(v, cx - 460, cx + 460, MINE_D, 60)) return;
  stillAt(c, v, MINE_D, 'gl-minehill', cx, GY, -440, -380, 880, 384, g => {
    const R = rampH(ROCKG, true), M = rampH(MOSS, true), T = rampH(TIMBER, true), Ir = rampH(IRON, true), P = D('#2A5A4C'), G = warmGlass();
    // (its right foot stops short of the shaft's lip)
    const hill: [number, number][] = [[-420, 0], [-330, -120], [-230, -240], [-110, -310], [0, -334], [140, -300], [250, -210], [320, -100], [355, 0]];
    polyF(g, hill.map(([x, y]) => [x * 1.005, y - 2] as [number, number]), INK);
    polyF(g, hill, R[2]);
    polyF(g, [[-420, 0], [-330, -120], [-230, -240], [-110, -310], [-60, -320], [-140, -200], [-260, -60], [-300, 0]], R[3]);
    polyF(g, [[250, -210], [320, -100], [355, 0], [200, 0], [235, -120]], R[1]);
    for (let k = 0; k < 14; k++) { const bx = -360 + hash(k * 3.1) * 660, by = -30 - hash(k * 7.3) * 220, r = 12 + hash(k) * 20; if (Math.abs(bx) < 110 && by > -200) continue; pixelBlob(g, bx, by, r, r * 0.66, R[1]); pixelBlob(g, bx - 2, by - 2, r * 0.8, r * 0.5, R[3]); pixelBlob(g, bx - r * 0.3, by - r * 0.3, r * 0.3, r * 0.16, R[4]); }
    // (moss and grass over its crown; pines on it)
    polyF(g, [[-250, -220], [-110, -310], [0, -334], [140, -300], [250, -218], [140, -276], [0, -312], [-120, -290]], M[3]);
    for (let x = -240; x < 240; x += 6) box(g, x, -230 - Math.max(0, 100 - Math.abs(x) * 0.42) + hash(x) * 8, 2, 4, M[4]);
    for (const [px, ph] of [[-170, 90], [-120, 120], [110, 110], [170, 80], [210, 70]] as const) {
      const py = -260 - Math.max(0, 70 - Math.abs(px) * 0.25);
      box(g, px - 2, py - 10, 4, 12, T[2]);
      for (let t = 0; t < 4; t++) { const y = py - ph + (t * ph) / 4, half = 4 + (t + 1) * (ph / 9); polyF(g, [[px, y - 4], [px + half, y + ph / 4], [px - half, y + ph / 4]], P[2 + (t % 2)]); polyF(g, [[px, y - 4], [px, y + ph / 4], [px - half, y + ph / 4]], P[4]); }
    }
    // (the portal: timber posts and lintel, crossed pickaxes over it, the dark inside (never seen), rails going in)
    g.fillStyle = INK; g.beginPath(); g.moveTo(-72, 0); g.lineTo(-72, -150); g.quadraticCurveTo(0, -176, 72, -150); g.lineTo(72, 0); g.closePath(); g.fill();
    for (let i = 0; i < 6; i++) { g.fillStyle = mix('#1E1610', '#030202', i / 5); g.beginPath(); const s = 1 - i * 0.14; g.moveTo(-68 * s, 0); g.lineTo(-68 * s, -146 * s); g.quadraticCurveTo(0, -170 * s, 68 * s, -146 * s); g.lineTo(68 * s, 0); g.closePath(); g.fill(); }
    for (const s of [-1, 1]) { g.strokeStyle = mix(Ir[3], '#030202', 0.4); g.lineWidth = 2; g.beginPath(); g.moveTo(s * 30, 0); g.lineTo(s * 6, -60); g.stroke(); }
    for (const px of [-84, 66]) { box(g, px - 1, -170, 20, 170, INK); box(g, px, -169, 18, 169, T[3]); box(g, px, -169, 4, 169, T[4]); box(g, px + 13, -169, 5, 169, T[1]); for (let y = -160; y < 0; y += 22) box(g, px + 2, y, 14, 1, T[2]); box(g, px + 7, -100, 3, 3, Ir[4]); box(g, px + 7, -40, 3, 3, Ir[4]); }
    box(g, -98, -192, 196, 24, INK); box(g, -97, -191, 194, 22, T[3]); box(g, -97, -191, 194, 4, T[5]); box(g, -97, -173, 194, 4, T[1]);
    for (const x of [-80, 76]) box(g, x, -184, 4, 4, Ir[4]);
    for (const s of [-1, 1]) { g.save(); g.translate(0, -214); g.rotate(s * 0.7); box(g, -2, -24, 5, 48, INK); box(g, -1, -23, 3, 46, T[4]); polyF(g, [[-14, -24], [0, -32], [14, -24], [0, -26]], INK); polyF(g, [[-12, -25], [0, -31], [12, -25], [0, -27]], Ir[4]); g.restore(); }
    // (a lantern on the post)
    box(g, 84, -130, 10, 2, Ir[2]); box(g, 92, -128, 1, 6, INK); box(g, 87, -122, 12, 14, INK); for (let i = 0; i < 3; i++) box(g, 88, -121 + i * 4, 10, 4, G[5 - i]);
    // (timbers stacked by the portal, a bucket, a sledgehammer)
    for (let k = 0; k < 4; k++) { box(g, -200, -10 - k * 9, 96, 9, INK); box(g, -199, -9 - k * 9, 94, 7, T[2 + (k % 2)]); box(g, -199, -9 - k * 9, 94, 1, T[5]); }
    box(g, 120, -24, 22, 24, INK); box(g, 121, -23, 20, 23, Ir[3]); box(g, 121, -23, 20, 3, Ir[5]); g.strokeStyle = Ir[2]; g.lineWidth = 2; g.beginPath(); g.arc(131, -24, 10, Math.PI, 0); g.stroke();
  });
};
const drawRails = (c: Ctx, v: View) => {
  if (!seen(v, X(MINE_X) - 60, X(GAP2.a) + 60, 0.9, 60)) return;
  const Ir = rampH(IRON), T = rampH(TIMBER, true);
  // (out of the portal, and along to the shaft's lip)
  const q = (x: number, d: number) => at(v.eye, X(x), GY, d);
  for (let t = 0; t <= 1.0001; t += 0.125) { const d = 0.9 + t * 0.075, [l] = q(MINE_X - 26 + t * 10, d), [r, y] = q(MINE_X + 26 + t * 10, d); box(c, l - 3, y - 1, r - l + 6, 2, T[2]); }
  for (let x = MINE_X + 60; x < GAP2.a - 20; x += 22) { const [l, y] = q(x, 0.966), [, y2] = q(x, 0.984); box(c, l - 1, y, 4, y2 - y + 1, T[2]); }
  c.strokeStyle = Ir[3]; c.lineWidth = 2; c.beginPath();
  for (const [ox, dd] of [[-22, 0.966], [22, 0.984]] as const) { const [s0, t0] = q(MINE_X + ox, 0.9), [s1, t1] = q(MINE_X + ox + 10, dd); c.moveTo(s0, t0); c.quadraticCurveTo(s1, t1, q(MINE_X + 120, dd)[0], t1); c.lineTo(q(GAP2.a - 10, dd)[0], t1); }
  c.stroke();
  c.strokeStyle = Ir[5]; c.lineWidth = 1; c.beginPath(); for (const dd of [0.966, 0.984]) { const [s0, t0] = q(MINE_X + 120, dd), [s1] = q(GAP2.a - 10, dd); c.moveTo(s0, t0 - 1); c.lineTo(s1, t0 - 1); } c.stroke();
  // (the buffer at the end, the cart of fake gems on the rails)
  stillAt(c, v, 0.975, 'gl-buffer', X(GAP2.a - 26), GY, -30, -44, 60, 48, g => {
    const W = N('#6A4A2E'), Rd = N('#D02A2A');
    box(g, -21, -30, 42, 30, INK); box(g, -20, -29, 40, 29, W[3]); box(g, -20, -29, 40, 3, W[5]);
    for (let k = 0; k < 5; k++) box(g, -20 + k * 8, -20, 8, 8, k % 2 ? Rd[3] : '#F2F0E8');
  });
  stillAt(c, v, 0.975, 'gl-gemcart', X(8040), GY, -50, -70, 100, 74, g => {
    const Ir2 = N('#5A5866'), Gs = ['#A78BFA', '#F472B6', '#60A5FA', '#4ADE80', '#FDE047'];
    polyF(g, [[-36, -42], [36, -42], [30, -12], [-30, -12]], INK); polyF(g, [[-35, -41], [35, -41], [29, -13], [-29, -13]], Ir2[3]); box(g, -35, -41, 70, 3, Ir2[5]); box(g, 20, -38, 9, 25, Ir2[1]);
    for (let k = -28; k < 30; k += 14) box(g, k, -40, 2, 28, Ir2[2]);
    for (let k = 0; k < 9; k++) { const gx = -28 + k * 7, gy = -46 - (k % 3) * 5, col = N(Gs[k % 5]); polyF(g, [[gx - 5, gy], [gx, gy - 7], [gx + 5, gy], [gx, gy + 6]], INK); polyF(g, [[gx - 4, gy], [gx, gy - 6], [gx + 4, gy], [gx, gy + 5]], col[3]); box(g, gx - 2, gy - 3, 2, 2, col[5]); }
    for (const wx of [-20, 20]) ballR(g, wx, -8, 7, rampH(IRON));
  });
};
const drawHeadFrame = (c: Ctx, v: View) => {
  const hx = X(8080);
  if (!seen(v, hx - 200, hx + 300, HEAD_D, 60)) return;
  stillAt(c, v, HEAD_D, 'gl-headframe', hx, GY, -110, -420, 280, 424, g => {
    const T = rampH(TIMBER, true), Ir = rampH(IRON, true);
    // (the A-frame: two legs, braced, the back stay; the platform up top)
    for (const [x1, x2] of [[-90, 20], [70, 40], [-30, 30]] as const) { g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(x1, 0); g.lineTo(x2, -350); g.stroke(); g.strokeStyle = T[3]; g.lineWidth = 9; g.stroke(); g.strokeStyle = T[5]; g.lineWidth = 2; g.beginPath(); g.moveTo(x1 - 3, 0); g.lineTo(x2 - 3, -350); g.stroke(); }
    for (let k = 1; k < 6; k++) { const y = -k * 58, t = k / 6; const l = -90 + 110 * t, r = 70 - 30 * t; g.strokeStyle = T[2]; g.lineWidth = 5; g.beginPath(); g.moveTo(l, y); g.lineTo(r, y); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(l, y); g.lineTo(r, y - 58); g.stroke(); }
    box(g, 0, -362, 160, 14, INK); box(g, 1, -361, 158, 12, T[3]); box(g, 1, -361, 158, 2, T[5]);
    box(g, 130, -380, 6, 20, Ir[2]);
    // (a lamp hung off the platform)
    box(g, 30, -346, 1, 12, INK); box(g, 26, -334, 9, 10, INK); box(g, 27, -333, 7, 8, warmGlass()[4]);
  });
  // (the wheel turning, the cable down into the shaft, the bucket going up and down on it (live))
  const f = v.f, [wx, wy] = at(v.eye, hx + 133, GY - 380, HEAD_D), r = 26 * HEAD_D, Ir = rampH(IRON, true);
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(wx, wy, r, 0, Math.PI * 2); c.stroke(); c.strokeStyle = Ir[3]; c.lineWidth = 2; c.stroke();
  for (let k = 0; k < 6; k++) { const a = f * 0.03 + (k / 6) * Math.PI * 2; c.strokeStyle = Ir[2]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(a) * r, wy + Math.sin(a) * r); c.stroke(); }
  ballR(c, wx, wy, 4, Ir);
  const depth = 260 + Math.sin(f * 0.006) * 220, [bx, by] = at(v.eye, hx + 159, GY - 380 + depth, HEAD_D);
  c.strokeStyle = Ir[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(wx + r, wy); c.lineTo(bx, by - 18); c.stroke();
  box(c, bx - 9, by - 18, 18, 18, INK); box(c, bx - 8, by - 17, 16, 16, Ir[3]); box(c, bx - 8, by - 17, 16, 2, Ir[5]); box(c, bx - 8, by - 10, 16, 2, Ir[1]);
  for (let k = 0; k < 3; k++) box(c, bx - 6 + k * 5, by - 21, 4, 4, ['#A78BFA', '#F472B6', '#60A5FA'][k]);
};
/** The timbered pillars across the shaft (stood on: lit along their planked tops). */
const drawShaftPillar = (c: Ctx, v: View, P: { a: number; w: number; top: number }) => {
  const a = X(P.a), b = a + P.w, top = Y(P.top);
  if (!seen(v, a - 60, b + 60, 1, 60)) return;
  const R = N('#6A5E52'), T = N('#6E4A30');
  sideBack(c, v.eye, a, -1, top, GY + 900, 1, 0.92, R, 3); sideBack(c, v.eye, b, 1, top, GY + 900, 1, 0.92, R, 3);
  topBack(c, v.eye, a, b, top, 1, 0.92, T, 2);
  still(c, `gl-shaftpil-${P.a}`, a, top, -6, -6, P.w + 12, P.top + 920, g => {
    const h = P.top + 900, w = P.w;
    box(g, -1, 0, w + 2, h, INK); slab(g, 0, 0, w, h, R);
    for (let k = 0; k < 20; k++) { const bx = hash(k * 3.1 + P.a) * w, by = 20 + hash(k * 5.3 + P.a) * (h - 40), r = 6 + hash(k) * 8; pixelBlob(g, bx, by, r, r * 0.6, R[1]); pixelBlob(g, bx - 1, by - 1, r * 0.7, r * 0.4, R[4]); }
    // (cribbing: posts at its edges, beams across)
    for (const px of [-3, w - 7]) { box(g, px - 1, 0, 12, h, INK); box(g, px, 0, 10, h, T[3]); box(g, px, 0, 3, h, T[4]); box(g, px + 7, 0, 3, h, T[1]); }
    for (let y = 30; y < h; y += 70) { box(g, -4, y - 1, w + 8, 12, INK); box(g, -3, y, w + 6, 10, T[3]); box(g, -3, y, w + 6, 2, T[5]); box(g, 2, y + 3, 2, 2, rampH(IRON)[4]); box(g, w - 4, y + 3, 2, 2, rampH(IRON)[4]); }
    box(g, -4, -2, w + 8, 10, INK); box(g, -3, -1, w + 6, 8, T[3]); for (let x = 2; x < w; x += 12) box(g, x, -1, 1, 8, T[1]);
    lip(g, -3, -1, w + 6);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// UNICORN MEADOW

const RAINBOW = { x: 10300, r: 440 };
const drawMeadowFar = (c: Ctx, v: View) => {
  if (!seen(v, X(MEADOW.a) - 200, X(MEADOW.b) + 200, MEADOW_D, 100)) return;
  // (the hedge along the clearing's far edge)
  for (let rx = MEADOW.a; rx < MEADOW.b; rx += 400) {
    const x = X(rx);
    if (!seen(v, x - 40, x + 440, MEADOW_D, 40)) continue;
    stillAt(c, v, MEADOW_D, `gl-hedge-${rx}`, x, GY, -40, -80, 480, 82, g => { const L = rampH(ramp6('#3E7A34'), true); for (let k = 0; k < 9; k++) leafy(g, k * 50 + hash(rx + k) * 20, -30, 34, L, rx + k); for (let k = 0; k < 16; k++) box(g, hash(rx * 0.1 + k) * 440, -50 + hash(rx + k * 3) * 40, 2, 2, ['#F49AC8', '#FFFFFF', '#FDE68A'][k % 3]); });
  }
  // (the round trees at its edges; the middle open: the castle over the trees beyond)
  for (const rx of [MEADOW.a + 60, MEADOW.a + 190, MEADOW.a + 330, MEADOW.a + 470, MEADOW.b - 470, MEADOW.b - 330, MEADOW.b - 200, MEADOW.b - 70]) {
    const x = X(rx);
    if (!seen(v, x - 120, x + 120, MEADOW_D, 40)) continue;
    stillAt(c, v, MEADOW_D, `gl-roundtree-${rx}`, x, GY, -120, -270, 240, 274, g => paintRoundTree(g, Math.round(rx)));
  }
  // (THE RAINBOW: a giant plywood arch on its cloud plinths, scaffold struts behind it, its bands lit with bulbs)
  const rx = X(RAINBOW.x), R = RAINBOW.r;
  if (seen(v, rx - R - 60, rx + R + 60, 0.66, 40)) stillAt(c, v, 0.66, 'gl-rainbow', rx, GY, -R - 80, -R - 40, R * 2 + 160, R + 44, g => {
    const BANDS = ['#E8403A', '#F28A2A', '#F6D23A', '#4EBE4E', '#3A8AE0', '#5A4ACE', '#9A5AD6'], Wd = D('#8A7A6A'), on = lit();
    // (the struts behind)
    for (let k = -3; k <= 3; k++) { const a = Math.PI * (0.5 + k * 0.13), sx = Math.cos(a) * (R - 40), sy = -Math.sin(a) * (R - 40); box(g, sx - 2, sy, 4, -sy, Wd[1]); if (k) { g.strokeStyle = Wd[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, sy + 20); g.lineTo(sx - Math.sign(k) * 40, 0); g.stroke(); } }
    const bw = 12;
    for (let i = 0; i < BANDS.length; i++) {
      const Rb = D(BANDS[i]), r0 = R - i * bw;
      g.strokeStyle = INK; g.lineWidth = bw + 2; g.beginPath(); g.arc(0, 0, r0 - bw / 2, Math.PI, 0); g.stroke();
      g.strokeStyle = Rb[3]; g.lineWidth = bw; g.stroke();
      g.strokeStyle = Rb[4]; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r0 - 2, Math.PI, 0); g.stroke();
      g.strokeStyle = Rb[2]; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r0 - bw + 1, Math.PI, 0); g.stroke();
    }
    // (the bulbs along its crown and its inner edge)
    for (const [rr, n] of [[R + 1, 60], [R - BANDS.length * bw - 1, 44]] as const) for (let k = 0; k <= n; k++) { const a = Math.PI + (k / n) * Math.PI, bx = Math.cos(a) * rr, by = Math.sin(a) * rr; box(g, bx - 1, by - 1, 3, 3, INK); box(g, bx, by, 2, 2, on ? BULB[k % 5] : D(BULB[k % 5])[2]); }
    // (the cloud plinths at its feet)
    for (const s of [-1, 1]) {
      const cx = s * (R - BANDS.length * bw / 2), Cl = D('#F4F6FC');
      for (const [dx, dy, r] of [[-30, -16, 24], [0, -30, 30], [30, -18, 24], [-46, -6, 16], [46, -6, 16]] as const) { g.fillStyle = INK; g.beginPath(); g.arc(cx + dx, dy, r + 1.5, 0, Math.PI * 2); g.fill(); }
      for (const [dx, dy, r] of [[-30, -16, 24], [0, -30, 30], [30, -18, 24], [-46, -6, 16], [46, -6, 16]] as const) { g.fillStyle = Cl[3]; g.beginPath(); g.arc(cx + dx, dy, r, 0, Math.PI * 2); g.fill(); g.fillStyle = Cl[5]; g.beginPath(); g.arc(cx + dx - r * 0.3, dy - r * 0.3, r * 0.4, 0, Math.PI * 2); g.fill(); }
      box(g, cx - 60, -6, 120, 6, Cl[1]);
    }
  });
};
const drawMeadowMid = (c: Ctx, v: View) => {
  if (!seen(v, X(MEADOW.a) - 200, X(MEADOW.b) + 200, 0.8, 100)) return;
  // (plywood unicorn photo boards, a face hole in each)
  for (const rx of [9900, 10900]) {
    const x = X(rx);
    if (!seen(v, x - 80, x + 80, 0.8, 40)) continue;
    stillAt(c, v, 0.8, `gl-photo-${rx}`, x, GY, -80, -170, 160, 174, g => {
      const Wh = D('#FCE7F3'), Mn = ['#F87171', '#FBBF24', '#4ADE80', '#60A5FA', '#A78BFA'], Wd = D('#8A6A44');
      for (const px of [-30, 30]) { box(g, px - 3, -40, 6, 40, INK); box(g, px - 2, -40, 4, 40, Wd[3]); }
      polyF(g, [[-60, -40], [-60, -110], [-30, -130], [10, -126], [40, -150], [60, -140], [50, -110], [60, -40]], INK);
      polyF(g, [[-58, -42], [-58, -108], [-29, -128], [10, -124], [40, -148], [58, -140], [48, -110], [58, -42]], Wh[3]);
      polyF(g, [[-58, -42], [-58, -108], [-40, -120], [-44, -42]], Wh[4]);
      for (let k = 0; k < 5; k++) box(g, -20 + k * 7, -136 + k * 3, 6, 30, D(Mn[k])[3]);
      polyF(g, [[40, -150], [52, -168], [46, -146]], D('#F6D365')[3]);
      box(g, 36, -136, 3, 3, INK);
      g.fillStyle = INK; g.beginPath(); g.ellipse(0, -96, 13, 15, 0, 0, Math.PI * 2); g.fill();
    });
  }
  // (the picket fence along the path)
  for (let rx = MEADOW.a + 140; rx < MEADOW.b - 160; rx += 320) {
    const x = X(rx);
    if (!seen(v, x - 20, x + 340, 0.9, 40)) continue;
    stillAt(c, v, 0.9, `gl-fence-${rx}`, x, GY, -4, -46, 328, 50, g => {
      const Wh = D('#F2EEE4');
      box(g, 0, -30, 320, 4, INK); box(g, 0, -29, 320, 2, Wh[3]); box(g, 0, -14, 320, 4, INK); box(g, 0, -13, 320, 2, Wh[3]);
      for (let px = 4; px < 316; px += 14) { if (rx === MEADOW.a + 140 + 640 && px > 120 && px < 190) continue; polyF(g, [[px - 1, 0], [px - 1, -36], [px + 4, -42], [px + 9, -36], [px + 9, 0]], INK); polyF(g, [[px, 0], [px, -35], [px + 4, -40], [px + 8, -35], [px + 8, 0]], Wh[3]); box(g, px, -35, 2, 35, Wh[5]); box(g, px + 6, -34, 2, 34, Wh[2]); }
      for (let k = 0; k < 10; k++) { const fx = 10 + k * 32 + hash(rx + k) * 10; box(g, fx, -8, 1, 8, D('#4E8A3A')[3]); box(g, fx - 1, -10, 3, 3, D(['#F49AC8', '#FDE68A', '#A8C8FF', '#FFFFFF'][k % 4])[4]); }
    });
  }
};
/** The huntsman's tree stand: the tree it's built round (scenery), the ladder up it. */
const drawStandTree = (c: Ctx, state: GameState) => {
  const tx = X((STAND.a + STAND.b) / 2);
  if (!onScreen(state, tx - 180, tx + 180)) return;
  const B = rampH(BARKS.oak, true), Md = rampH(MOSS, true);
  still(c, 'gl-standfoot', tx, GY, -150, -424, 300, 428, g => paintTreeFoot(g, 70, 'oak', 62, B, Md));
  for (let k = 0; k < 10; k++) { const y = GY - 420 - k * 300; if (y + 300 < state.camera.y - 10) break; still(c, 'gl-standtrunk', tx, y, -38, -302, 76, 304, g => paintTrunk(g, 70, 'oak', 63, B)); }
  still(c, 'gl-standladder', X(STAND.a) + 40, Y(STAND.h), -4, 0, 40, STAND.h + 4, g => { const W = D('#9A6A3A'); for (let y = 30; y < STAND.h - 10; y += 30) { box(g, 0, y, 32, 6, INK); box(g, 1, y + 1, 30, 4, W[3]); box(g, 1, y + 1, 30, 1, W[5]); box(g, 4, y + 2, 2, 2, rampH(IRON, true)[4]); box(g, 26, y + 2, 2, 2, rampH(IRON, true)[4]); } });
};

// ---------------------------------------------------------------------------------------------------------------
// THE DRAGON'S LAIR

const BAY = 330;
const paintLairWall = (g: Ctx, k: number) => {
  const F = rampH(FIBER, true), Cr = D('#B08AE8');
  box(g, 0, -1000, BAY, 1000, F[2]);
  // (big rounded "boulders" moulded in, in steps)
  for (let i = 0; i < 16; i++) { const bx = hash(k * 31 + i * 3.1) * BAY, by = -40 - hash(k * 17 + i * 5.7) * 900, r = 30 + hash(k + i) * 50; pixelBlob(g, bx, by + 4, r, r * 0.7, F[1]); pixelBlob(g, bx - 3, by, r * 0.92, r * 0.62, F[2]); pixelBlob(g, bx - r * 0.3, by - r * 0.28, r * 0.5, r * 0.3, F[3]); pixelBlob(g, bx - r * 0.42, by - r * 0.4, r * 0.18, r * 0.1, F[4]); }
  // (the panel's seam down its edge, bolted)
  box(g, 0, -1000, 2, 1000, F[0]); box(g, 2, -1000, 1, 1000, F[4]); for (let y = -990; y < 0; y += 24) { box(g, 4, y, 3, 3, F[0]); box(g, 4, y, 1, 1, F[5]); }
  box(g, 0, -500 + (k % 3) * 60, BAY, 2, F[0]); for (let x = 10; x < BAY; x += 24) box(g, x, -496 + (k % 3) * 60, 3, 3, F[0]);
  // (stalactites from the top; fake crystals in clusters)
  for (let x = 6; x < BAY; x += 18 + Math.floor(hash(k * 7 + x) * 20)) { const l = 30 + hash(k + x) * 90; polyF(g, [[x - 8, -1000], [x + 8, -1000], [x, -1000 + l]], F[1]); polyF(g, [[x - 8, -1000], [x - 2, -1000], [x, -1000 + l]], F[3]); }
  for (let i = 0; i < 2; i++) { const cx = 60 + hash(k * 5 + i) * (BAY - 120), cy = -120 - hash(k * 9 + i) * 600; for (let q = 0; q < 4; q++) { const qx = cx + (q - 1.5) * 9, h = 14 + (q % 2) * 10; polyF(g, [[qx - 5, cy], [qx, cy - h], [qx + 5, cy]], INK); polyF(g, [[qx - 4, cy - 1], [qx, cy - h + 1], [qx + 4, cy - 1]], Cr[3]); box(g, qx - 2, cy - h * 0.6, 1, h * 0.4, Cr[5]); } }
  // (the staff door, in one bay: its green EXIT box)
  if (k === 3) { box(g, 140, -110, 50, 110, INK); box(g, 141, -109, 48, 109, D('#5A5A6A')[3]); box(g, 141, -109, 48, 2, D('#5A5A6A')[5]); box(g, 180, -60, 4, 8, D('#C8C8D0')[4]); box(g, 148, -130, 34, 12, INK); box(g, 149, -129, 32, 10, '#3A9A5A'); }
  // (a torch bracket in some)
  if (k % 2 === 0) { box(g, 160, -250, 12, 4, rampH(IRON, true)[3]); box(g, 163, -276, 6, 28, rampH(TIMBER, true)[2]); box(g, 160, -280, 12, 6, rampH(IRON, true)[2]); }
};
const torchOf = (k: number): [number, number] => [X(LAIR.a - 80) + k * BAY + 166, GY - 288];
const drawLairBack = (c: Ctx, v: View) => {
  if (!seen(v, X(LAIR.a) - 200, X(LAIR.b) + 200, LAIR_D, 100)) return;
  for (let k = 0; X(LAIR.a - 80) + k * BAY < X(LAIR.b + 80); k++) {
    const x = X(LAIR.a - 80) + k * BAY;
    if (!seen(v, x - 20, x + BAY + 20, LAIR_D, 40)) continue;
    stillAt(c, v, LAIR_D, `gl-lairwall-${k}`, x, GY, 0, -1000, BAY, 1002, g => paintLairWall(g, k));
    if (k % 2 === 0) {
      const [tx, ty] = at(v.eye, torchOf(k)[0], torchOf(k)[1], LAIR_D), fl = Math.sin(v.f * 0.4 + k) * 2;
      for (const [col, r, dy] of [['#DC2626', 6, 0], ['#F97316', 5, -2], ['#FDE047', 3, -4]] as const) { c.fillStyle = col; c.beginPath(); c.moveTo(tx - r, ty + 2); c.quadraticCurveTo(tx + fl, ty - r * 2.4 + dy, tx + r, ty + 2); c.closePath(); c.fill(); }
    }
  }
  // (the fake crystals' glow, breathing)
  c.globalAlpha = 0.12 + 0.06 * Math.sin(v.f * 0.05); c.fillStyle = '#C8A8FF';
  for (let k = 0; X(LAIR.a - 80) + k * BAY < X(LAIR.b + 80); k++) for (let i = 0; i < 2; i++) { const [sx, sy] = at(v.eye, X(LAIR.a - 80) + k * BAY + 60 + hash(k * 5 + i) * (BAY - 120), GY - 130 - hash(k * 9 + i) * 600, LAIR_D); c.fillRect(Math.round(sx) - 14, Math.round(sy) - 20, 28, 24); }
  c.globalAlpha = 1;
};
const drawLairMid = (c: Ctx, v: View) => {
  if (!seen(v, X(LAIR.a) - 200, X(LAIR.b) + 200, 0.9, 100)) return;
  // (the ribs, arching up off the spine: fiberglass, a seam and its bolts showing)
  if (seen(v, X(11440), X(12060), 0.9, 40)) stillAt(c, v, 0.9, 'gl-ribs', X(11440), GY, -40, -360, 680, 364, g => {
    const Bn = rampH(BONE, true);
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(0, -250); g.quadraticCurveTo(300, -320, 620, -230); g.stroke();
    g.strokeStyle = Bn[3]; g.lineWidth = 12; g.stroke(); g.strokeStyle = Bn[5]; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -255); g.quadraticCurveTo(300, -325, 620, -235); g.stroke();
    for (let k = 0; k < 7; k++) {
      const x = 40 + k * 90, topY = -258 - Math.sin((k / 6) * Math.PI) * 50;
      for (const [lw, col, o] of [[14, INK, 0], [10, Bn[3], 0], [3, Bn[5], -3], [2, Bn[1], 4]] as const) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x + o, topY); g.bezierCurveTo(x + 70 + o, topY + 40, x + 80 + o, -60, x + 30 + o, 0); g.stroke(); }
      box(g, x - 8, topY - 12, 16, 14, INK); box(g, x - 7, topY - 11, 14, 12, Bn[4]);
    }
    box(g, 300, -306, 3, 30, Bn[1]); for (let y = -300; y < -278; y += 8) box(g, 304, y, 2, 2, Bn[0]);
  });
  // (the foam gold heaped round a chest, a goblet, a crown)
  if (seen(v, X(12000), X(12260), 0.9, 40)) stillAt(c, v, 0.9, 'gl-gold', X(12130), GY, -160, -110, 320, 114, g => {
    const Gl = rampH(GOLD, true), W = rampH(TIMBER, true), Gs = ['#E04060', '#40A0E0', '#40C070'];
    pixelBlob(g, 0, -10, 150, 34, Gl[1]); pixelBlob(g, -10, -18, 120, 26, Gl[2]); pixelBlob(g, -24, -26, 70, 16, Gl[3]);
    for (let k = 0; k < 50; k++) { const x = -130 + hash(k * 3.1) * 260, y = -6 - hash(k * 1.7) * (40 - Math.abs(x) * 0.2); box(g, x - 3, y - 1, 6, 3, INK); box(g, x - 2, y, 4, 2, Gl[3 + (k % 2)]); box(g, x - 2, y, 2, 1, Gl[5]); }
    box(g, 30, -70, 70, 44, INK); box(g, 31, -69, 68, 43, W[3]); box(g, 31, -69, 68, 3, W[5]); box(g, 31, -52, 68, 4, Gl[3]); box(g, 60, -56, 10, 12, Gl[4]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(65, -70, 36, 14, 0, Math.PI, 0); g.fill(); g.fillStyle = W[2]; g.beginPath(); g.ellipse(65, -70, 34, 12, 0, Math.PI, 0); g.fill();
    box(g, -60, -62, 14, 4, Gl[3]); box(g, -56, -58, 6, 16, Gl[3]); polyF(g, [[-64, -62], [-42, -62], [-48, -80], [-58, -80]], Gl[4]);
    polyF(g, [[-110, -36], [-110, -50], [-102, -42], [-96, -54], [-90, -42], [-82, -50], [-82, -36]], Gl[4]); box(g, -110, -38, 28, 3, Gl[2]);
    for (let k = 0; k < 3; k++) box(g, -102 + k * 8, -44, 3, 3, D(Gs[k])[4]);
  });
  // (the cave's mouth: its pillars and arch (fiberglass), in front of the back wall)
  for (const [rx, w] of [[LAIR.a - 40, 140], [LAIR.b - 100, 140]] as const) {
    const x = X(rx);
    if (!seen(v, x - 40, x + w + 40, 0.92, 40)) continue;
    stillAt(c, v, 0.92, `gl-lairpil-${rx}`, x, GY, -20, -1000, w + 40, 1002, g => {
      const F = rampH(FIBER, true);
      box(g, -1, -1000, w + 2, 1000, INK); slab(g, 0, -1000, w, 1000, F);
      for (let i = 0; i < 14; i++) { const bx = hash(rx + i * 3.1) * w, by = -30 - hash(rx + i * 5.7) * 940, r = 20 + hash(rx + i) * 30; pixelBlob(g, bx, by, r, r * 0.7, F[1]); pixelBlob(g, bx - 2, by - 2, r * 0.85, r * 0.55, F[3]); pixelBlob(g, bx - r * 0.3, by - r * 0.3, r * 0.3, r * 0.16, F[4]); }
      box(g, w / 2, -1000, 2, 1000, F[0]); for (let y = -990; y < 0; y += 26) box(g, w / 2 + 3, y, 2, 2, F[0]);
    });
  }
  for (let rx = LAIR.a - 40; rx < LAIR.b + 40; rx += BAY) {
    const x = X(rx);
    if (!seen(v, x - 20, x + BAY + 20, 0.92, 40)) continue;
    stillAt(c, v, 0.92, `gl-lairarch-${rx}`, x, GY - 820, 0, -200, BAY, 330, g => {
      const F = rampH(FIBER, true);
      box(g, 0, -200, BAY, 200, F[2]);
      for (let k = 0; k < BAY; k += 14) { const l = 20 + hash(rx + k) * 90; polyF(g, [[k - 2, -2], [k + 16, -2], [k + 7, l]], F[1]); polyF(g, [[k - 2, -2], [k + 4, -2], [k + 7, l]], F[3]); }
      box(g, 0, -4, BAY, 4, F[1]);
    });
  }
  // (the skull: on the floor by the way in, jaw open, horns, THE PRICE TAG on a string off a horn)
  const sx = X(11250);
  if (seen(v, sx - 200, sx + 160, 0.95, 40)) stillAt(c, v, 0.95, 'gl-skull', sx, GY, -200, -180, 360, 184, g => {
    const Bn = rampH(BONE, true);
    const skull: [number, number][] = [[-80, 0], [-92, -64], [-60, -112], [0, -118], [50, -96], [118, -56], [112, -32], [-10, -40]];
    polyF(g, skull.map(([x, y]) => [x + (x < 0 ? -1 : 1), y - 1] as [number, number]), INK); polyF(g, skull, Bn[3]);
    polyF(g, [[-80, 0], [-92, -64], [-60, -112], [-40, -112], [-70, -60], [-60, -10]], Bn[4]);
    polyF(g, [[50, -96], [118, -56], [112, -32], [40, -44]], Bn[2]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(-28, -76, 15, 12, -0.2, 0, Math.PI * 2); g.fill(); g.fillStyle = '#1A1418'; g.beginPath(); g.ellipse(-27, -75, 12, 9, -0.2, 0, Math.PI * 2); g.fill();
    box(g, 96, -54, 6, 4, INK); box(g, 104, -50, 4, 3, INK);
    polyF(g, [[-60, 0], [104, -10], [96, 0]], INK); polyF(g, [[-58, -1], [102, -10], [94, -1]], Bn[2]);
    for (let k = 0; k < 7; k++) { polyF(g, [[-6 + k * 16, -40], [2 + k * 16, -40], [-2 + k * 16, -28]], INK); polyF(g, [[-5 + k * 16, -40], [1 + k * 16, -40], [-2 + k * 16, -30]], Bn[5]); polyF(g, [[-2 + k * 16, -6], [6 + k * 16, -6], [2 + k * 16, -16]], Bn[5]); }
    for (const [lw, col] of [[11, INK], [8, Bn[3]], [2, Bn[5]]] as const) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(-56, -106); g.quadraticCurveTo(-110, -150, -150, -138); g.stroke(); g.beginPath(); g.moveTo(-20, -116); g.quadraticCurveTo(-40, -168, -80, -170); g.stroke(); }
    g.lineCap = 'butt';
    box(g, 20, -92, 3, 20, Bn[1]); for (let y = -90; y < -74; y += 6) box(g, 24, y, 2, 2, Bn[0]);
    // (the tag: a string off the horn's tip, a white card, its red price)
    g.strokeStyle = '#D8D0C0'; g.lineWidth = 1; g.beginPath(); g.moveTo(-150, -138); g.lineTo(-156, -118); g.stroke();
    box(g, -182, -120, 52, 22, INK); box(g, -181, -119, 50, 20, '#FBF6E8'); box(g, -181, -119, 50, 2, '#FFFFFF'); box(g, -178, -116, 3, 3, INK);
    signText(g, '$4,999', -152, -104, { sx: 1, sy: 1, fill: ['#B81C1C', '#B81C1C', '#8A1010', '#6A0A0A'] });
  });
};

// ---------------------------------------------------------------------------------------------------------------
// THE QUEUE: Truelling Tragons' front, its tracks, the crowd

const RIDE_A = QUEUE.a - 40, RIDE_B = QUEUE.b + 260, RIDE_TOP = 360;
const drawTracks = (c: Ctx, v: View) => {
  const cx = X(QUEUE.door);
  if (!seen(v, cx - 560, cx + 560, 0.7, 60)) return;
  stillAt(c, v, 0.7, 'gl-tracks', cx, GY, -560, -850, 1120, 854, g => {
    const T = (col: string) => dimmed(col), Lt = D('#6A6488');
    const ty = (k: number, x: number) => -440 - Math.sin(x * 0.009 + k * 2.1) * 120 - Math.sin(x * 0.021 + k) * 40 - k * 30;
    for (let x = -540; x < 540; x += 24) for (let k = 0; k < 3; k++) { const y = ty(k, x); box(g, x, y, 3, -y, Lt[2]); box(g, x, y, 1, -y, Lt[4]); if ((x / 24) % 2 === 0) { g.strokeStyle = Lt[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 10); g.lineTo(x + 24, 0); g.stroke(); } }
    const TR = ['#D8402E', '#7AC8F0', '#F2D24A'];
    for (let k = 0; k < 3; k++) {
      for (const [col, lw, dy] of [[INK, 9, 1], [mix(TR[k], INK, 0.35), 7, 1], [TR[k], 4, 0], [mix(TR[k], '#FFFFFF', 0.5), 1, -2]] as const) {
        g.strokeStyle = T(col); g.lineWidth = lw; g.beginPath();
        for (let x = -540; x <= 540; x += 6) (x === -540 ? g.moveTo(x, ty(k, x) + dy) : g.lineTo(x, ty(k, x) + dy));
        g.stroke();
      }
      const lx = -300 + k * 300, ly = ty(k, lx) - 70;
      for (const [col, lw] of [[INK, 9], [mix(TR[k], INK, 0.35), 7], [TR[k], 4]] as const) { g.strokeStyle = T(col); g.lineWidth = lw; g.beginPath(); g.ellipse(lx, ly, 50, 70, 0, 0, Math.PI * 2); g.stroke(); }
      box(g, lx - 2, ly + 70, 5, -ly - 70, Lt[2]);
    }
    // (a train on the ice track: dragon cars, a head at the front)
    for (let n = 0; n < 4; n++) { const x = 120 + n * 26, y = ty(1, x); box(g, x - 11, y - 14, 22, 12, INK); box(g, x - 10, y - 13, 20, 10, T('#4AA8E0')); box(g, x - 10, y - 13, 20, 2, T('#BCE6FA')); for (let q = 0; q < 2; q++) box(g, x - 6 + q * 8, y - 19, 4, 5, T(['#E8B890', '#8A5A36'][(n + q) % 2])); }
    const hx = 120 + 4 * 26, hy = ty(1, hx); polyF(g, [[hx - 12, hy - 4], [hx + 14, hy - 18], [hx + 10, hy - 6]], T('#2E7AB0')); box(g, hx + 6, hy - 15, 2, 2, T('#FFFFFF'));
  });
};
const drawCrowd = (c: Ctx, v: View) => {
  const a = X(QUEUE.a), b = X(QUEUE.door) - 60;
  if (!seen(v, a - 60, b + 60, 0.95, 40)) return;
  stillAt(c, v, 0.95, 'gl-crowd', a, GY, -20, -134, b - a + 40, 138, g => {
    const w = b - a, Br = D('#E0AE3A'), Vel = D('#8A1A4A');
    // (the guests: seeded, every sort, some kids up on shoulders, a balloon)
    for (let k = 0; k * 22 < w; k++) {
      const L = lookOf(k * 13 + 5), x = 8 + k * 22 + hash(k) * 6, h = 54 + hash(k * 3) * 16 - (k % 5 === 2 ? 14 : 0), Sk = D(L.skin), Sh = D(L.shirt), Hr = D(L.hair);
      box(g, x - 6, -h + 14, 12, h - 30, INK); box(g, x - 5, -h + 15, 10, h - 31, Sh[3]); box(g, x - 5, -h + 15, 3, h - 31, Sh[4]);
      box(g, x - 5, -18, 4, 18, D(L.pants)[2]); box(g, x + 1, -18, 4, 18, D(L.pants)[3]);
      g.fillStyle = INK; g.beginPath(); g.arc(x, -h + 8, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = Sk[3]; g.beginPath(); g.arc(x, -h + 8, 6, 0, Math.PI * 2); g.fill();
      if (!L.bald) { box(g, x - 6, -h + 1, 12, 4, Hr[3]); if (L.long) box(g, x - 7, -h + 3, 3, 12, Hr[2]); }
      if (k % 7 === 3) { g.fillStyle = INK; g.beginPath(); g.arc(x, -h - 10, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = D(lookOf(k * 7).skin)[3]; g.beginPath(); g.arc(x, -h - 10, 4, 0, Math.PI * 2); g.fill(); box(g, x - 5, -h - 5, 10, 6, D(['#F472B6', '#60A5FA'][k % 2])[3]); }
      if (k % 9 === 5) { box(g, x + 6, -h - 30, 1, 34, D('#D8D0C0')[3]); g.fillStyle = INK; g.beginPath(); g.ellipse(x + 6, -h - 38, 8, 10, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = D(['#E04060', '#4080E0', '#E0C040'][k % 3])[3]; g.beginPath(); g.ellipse(x + 6, -h - 38, 7, 9, 0, 0, Math.PI * 2); g.fill(); box(g, x + 3, -h - 43, 2, 3, '#FFFFFF'); }
    }
    // (the rails in front of them: brass posts, velvet ropes sagging between)
    for (let x = 0; x <= w; x += 40) { box(g, x - 3, -36, 6, 36, INK); box(g, x - 2, -35, 4, 35, Br[3]); box(g, x - 2, -35, 1, 35, Br[5]); ballR(g, x, -38, 3, Br); box(g, x - 5, -3, 10, 3, Br[2]); }
    for (let x = 0; x < w; x += 40) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x, -32); g.quadraticCurveTo(x + 20, -22, x + 40, -32); g.stroke(); g.strokeStyle = Vel[3]; g.lineWidth = 2; g.stroke(); }
  });
};
const HEADS: [number, string, 'fire' | 'ice' | 'bolt'][] = [[-160, '#C42828', 'fire'], [10, '#3A9AD8', 'ice'], [180, '#E0B020', 'bolt']];
const paintHead = (g: Ctx, col: string, kind: 'fire' | 'ice' | 'bolt') => {
  const R = D(col), Hn = D('#F2EAD0'), M = D('#2A1A1A');
  // (a sculpted dragon's head out over the door, facing right: its snout, a jaw open, horns back, the brow, scales)
  const head: [number, number][] = [[-46, -30], [10, -38], [54, -18], [60, -4], [52, 4], [20, 6], [50, 18], [44, 28], [-6, 22], [-44, 36]];
  polyF(g, head.map(([x, y]) => [x + (x < 0 ? -1 : 1), y + (y < 0 ? -1 : 1)] as [number, number]), INK);
  polyF(g, head, R[3]);
  polyF(g, [[-46, -30], [10, -38], [30, -30], [-30, -18]], R[4]);
  polyF(g, [[-6, 22], [44, 28], [50, 18], [20, 6], [10, 14]], R[1]);
  polyF(g, [[20, 4], [52, 4], [48, 16], [22, 12]], M[2]);
  for (let k = 0; k < 4; k++) { polyF(g, [[24 + k * 7, 4], [28 + k * 7, 4], [26 + k * 7, 9]], Hn[5]); polyF(g, [[24 + k * 6, 16], [28 + k * 6, 16], [26 + k * 6, 11]], Hn[5]); }
  for (let k = 0; k < 6; k++) { box(g, -36 + k * 10, -8 + (k % 2) * 6, 5, 3, R[2]); box(g, -36 + k * 10, -8 + (k % 2) * 6, 3, 1, R[5]); }
  box(g, 10, -26, 12, 8, INK); box(g, 11, -25, 10, 6, '#FFF4C8'); box(g, 16, -24, 3, 5, INK);
  box(g, 48, -10, 3, 3, INK);
  // (horns back off it; the ice one icicles, the lightning one a jagged crest)
  for (const s of [-1, 1]) polyF(g, [[-30, -24 + s * 4], [-68, -54 + s * 8], [-24, -30 + s * 4]], s < 0 ? Hn[3] : Hn[2]);
  if (kind === 'ice') for (let k = 0; k < 5; k++) { polyF(g, [[-30 + k * 12, 30], [-24 + k * 12, 30], [-27 + k * 12, 42 + (k % 2) * 8]], D('#E0F2FE')[4]); }
  if (kind === 'bolt') for (let k = 0; k < 4; k++) polyF(g, [[-40 + k * 14, -32], [-34 + k * 14, -48], [-30 + k * 14, -36], [-26 + k * 14, -34]], D('#FFF08A')[3]);
  if (kind === 'fire') for (let k = 0; k < 4; k++) polyF(g, [[-40 + k * 14, -30], [-36 + k * 14, -44], [-28 + k * 14, -32]], D('#F6A02A')[3]);
};
const drawRide = (c: Ctx, state: GameState, v: View) => {
  const a = X(RIDE_A), b = X(RIDE_B), top = GY - RIDE_TOP;
  if (!onScreen(state, a - 200, b + 200)) return;
  const St = N('#8A7EA8');
  sideBack(c, v.eye, a, -1, top, GY, 1, 0.8, St, 3);
  still(c, 'gl-ride', a, GY, -60, -RIDE_TOP - 150, b - a + 120, RIDE_TOP + 154, g => {
    const w = b - a, Sd = rampH(ramp6('#8A7EA8'), true), Sl = rampH(SLATE, true), G = warmGlass(), Gd = rampH(GOLD, true), Ir = rampH(IRON, true);
    // (the front: castle stone in courses, crenellated (dim: not somewhere to stand))
    box(g, -1, -RIDE_TOP, w + 2, RIDE_TOP, INK); slab(g, 0, -RIDE_TOP, w, RIDE_TOP, Sd);
    for (let y = -RIDE_TOP + 16, r = 0; y < 0; y += 18, r++) { box(g, 0, y, w, 1, Sd[1]); for (let x = (r % 2) * 22; x < w; x += 44) box(g, x, y - 17, 1, 17, Sd[2]); }
    for (let x = 0; x < w; x += 40) { box(g, x - 1, -RIDE_TOP - 26, 26, 26, INK); box(g, x, -RIDE_TOP - 25, 24, 25, Sd[3]); box(g, x, -RIDE_TOP - 25, 4, 25, Sd[4]); box(g, x + 19, -RIDE_TOP - 25, 5, 25, Sd[1]); }
    // (a turret at its left end: higher, a cone roof, a pennant)
    box(g, -41, -RIDE_TOP - 100, 82, RIDE_TOP + 100, INK); slab(g, -40, -RIDE_TOP - 100, 80, RIDE_TOP + 100, Sd);
    for (let y = -RIDE_TOP - 84; y < 0; y += 18) box(g, -40, y, 80, 1, Sd[1]);
    polyF(g, [[-50, -RIDE_TOP - 100], [0, -RIDE_TOP - 146], [50, -RIDE_TOP - 100]], INK); polyF(g, [[-48, -RIDE_TOP - 101], [0, -RIDE_TOP - 144], [48, -RIDE_TOP - 101]], Sl[3]); polyF(g, [[-48, -RIDE_TOP - 101], [0, -RIDE_TOP - 144], [-10, -RIDE_TOP - 101]], Sl[4]);
    for (let k = 0; k < 4; k++) box(g, -10, -RIDE_TOP - 80 + k * 60, 20, 30, INK), box(g, -8, -RIDE_TOP - 78 + k * 60, 16, 26, G[3 + (k % 2)]);
    // (arrow slits, lit)
    for (let x = 80; x < w - 20; x += 120) for (const y of [-RIDE_TOP + 40, -RIDE_TOP + 110]) { box(g, x - 4, y, 8, 26, INK); box(g, x - 2, y + 2, 4, 22, G[3]); }
    // (the banners between the heads: fire red, ice blue, lightning yellow, each its emblem)
    const d = X(QUEUE.door) - a;
    for (const [ox, col] of [[-80, '#B01C24'], [96, '#1E5AA8'], [270, '#C89A10']] as const) {
      const Bn = rampH(ramp6(col), true), bx = d + ox - 22;
      box(g, bx - 4, -RIDE_TOP + 4, 52, 4, Gd[3]);
      box(g, bx - 1, -RIDE_TOP + 8, 46, 170, INK); box(g, bx, -RIDE_TOP + 8, 44, 168, Bn[3]); box(g, bx, -RIDE_TOP + 8, 8, 168, Bn[4]); box(g, bx + 36, -RIDE_TOP + 8, 8, 168, Bn[2]);
      polyF(g, [[bx, -RIDE_TOP + 176], [bx + 22, -RIDE_TOP + 160], [bx + 44, -RIDE_TOP + 176], [bx + 44, -RIDE_TOP + 190], [bx + 22, -RIDE_TOP + 174], [bx, -RIDE_TOP + 190]], Bn[3]);
      box(g, bx + 4, -RIDE_TOP + 12, 2, 160, Gd[3]); box(g, bx + 38, -RIDE_TOP + 12, 2, 160, Gd[3]);
      ballR(g, bx + 22, -RIDE_TOP + 70, 10, Gd);
    }
    // (the door: an iron-studded arch, the portcullis up, the dark way in)
    g.fillStyle = INK; g.beginPath(); g.moveTo(d - 56, 0); g.lineTo(d - 56, -116); g.quadraticCurveTo(d + 10, -172, d + 76, -116); g.lineTo(d + 76, 0); g.closePath(); g.fill();
    g.fillStyle = Sd[4]; g.beginPath(); g.moveTo(d - 54, 0); g.lineTo(d - 54, -116); g.quadraticCurveTo(d + 10, -168, d + 74, -116); g.lineTo(d + 74, 0); g.lineTo(d + 64, 0); g.lineTo(d + 64, -110); g.quadraticCurveTo(d + 10, -156, d - 44, -110); g.lineTo(d - 44, 0); g.closePath(); g.fill();
    for (let i = 0; i < 5; i++) { g.fillStyle = mix('#1A1028', '#040208', i / 4); const s = 1 - i * 0.12; g.beginPath(); g.moveTo(d + 10 - 54 * s, 0); g.lineTo(d + 10 - 54 * s, -110 * s); g.quadraticCurveTo(d + 10, -156 * s, d + 10 + 54 * s, -110 * s); g.lineTo(d + 10 + 54 * s, 0); g.closePath(); g.fill(); }
    for (let x = d - 40; x < d + 64; x += 12) { box(g, x, -150, 3, 26, Ir[2]); polyF(g, [[x - 1, -124], [x + 4, -124], [x + 1.5, -118]], Ir[3]); }
    box(g, d - 44, -150, 108, 4, Ir[2]);
    // (the PA horn over the door: Piper calls trial two out of it)
    polyF(g, [[d + 4, -182], [d + 38, -200], [d + 38, -162]], INK); polyF(g, [[d + 6, -182], [d + 36, -197], [d + 36, -165]], rampH(ramp6('#F472B6'), true)[3]); polyF(g, [[d + 6, -182], [d + 36, -197], [d + 36, -190]], rampH(ramp6('#F472B6'), true)[5]);
    box(g, d - 2, -188, 8, 12, Ir[2]);
    // (the three dragon heads)
    for (const [ox, col, kind] of HEADS) { g.save(); g.translate(d + ox, -250); paintHead(g, col, kind); g.restore(); }
    // (the name, fixed across the front on its board, in gilt)
    const sx = d + 10, sy = -330;
    box(g, sx - 222, sy - 24, 444, 48, INK); box(g, sx - 220, sy - 22, 440, 44, rampH(ramp6('#3B0764'), true)[3]); box(g, sx - 220, sy - 22, 440, 3, Gd[3]); box(g, sx - 220, sy + 19, 440, 3, Gd[2]);
    for (const x of [sx - 214, sx + 210]) ballR(g, x, sy, 3, Gd);
    signText(g, 'TRUELLING TRAGONS', sx, sy + 9, gilt(3));
  });
  // (their breath (live): fire flickering, ice glittering, lightning sparking)
  const f = state.frame, d = X(QUEUE.door);
  for (const [ox, , kind] of HEADS) {
    const mx = d + ox + 58, my = GY - 250 + 8;
    if (kind === 'fire') for (let k = 0; k < 4; k++) { const fx = mx + k * 8, fy = my - 4 + ((f + k * 3) % 6) - 3; box(c, fx, fy, 8 - k, 6 - (k >> 1), ['#FDE047', '#F97316', '#DC2626', '#7A1A1A'][(Math.floor(f / 4) + k) % 4]); }
    if (kind === 'ice') for (let k = 0; k < 5; k++) { box(c, mx + k * 7, my + 6 + ((f * 0.5 + k * 7) % 14), 2, 2, '#E0F2FE'); if ((f + k * 9) % 30 < 4) { box(c, mx + k * 7 - 1, my - 2, 4, 1, '#FFFFFF'); box(c, mx + k * 7, my - 3, 1, 3, '#FFFFFF'); } }
    if (kind === 'bolt' && f % 40 < 8) { c.strokeStyle = '#FEF08A'; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + 10, my + 8); c.lineTo(mx + 4, my + 12); c.lineTo(mx + 18, my + 22); c.stroke(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.stroke(); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The shelves (one-way ledges: lit along their tops), Piper's PA horns

const drawShelves = (c: Ctx, state: GameState, v: View) => {
  for (const [ra, rb, h] of LEDGES) {
    if (!onScreen(state, X(ra) - 30, X(rb) + 30) || ra === 6690) continue;
    const a = X(ra), b = X(rb), y = Y(h), w = rb - ra;
    if (ra === STAND.a) {
      // (the tree stand: planks on joists, a rail round it, a camo tarp over it)
      topBack(c, v.eye, a, b, y, 1, 0.95, N('#8A6A44'), 2);
      still(c, 'gl-stand', a, y, -10, -90, w + 20, 130, g => {
        const W = N('#8A6A44'), Cm = D('#4A6A34');
        box(g, -1, -1, w + 2, 14, INK); box(g, 0, 0, w, 12, W[3]); for (let x = 8; x < w; x += 16) box(g, x, 0, 1, 12, W[1]); box(g, 0, 9, w, 3, W[1]);
        for (const x of [10, w - 16]) { box(g, x, 12, 6, 26, INK); box(g, x + 1, 12, 4, 25, W[2]); }
        for (const x of [2, w - 6]) { box(g, x - 1, -24, 6, 24, INK); box(g, x, -23, 4, 23, W[3]); }
        box(g, 0, -24, w, 4, INK); box(g, 1, -23, w - 2, 2, W[4]);
        for (const x of [2, w - 4]) { box(g, x, -86, 3, 62, D('#6A4A2E')[2]); }
        polyF(g, [[-8, -78], [w + 8, -78], [w + 2, -66], [-2, -66]], Cm[3]); for (let k = 0; k < 8; k++) box(g, hash(k * 3.1) * w, -76 + hash(k) * 8, 8, 3, Cm[k % 2 ? 1 : 4]);
        lip(g, 0, 0, w);
      });
      continue;
    }
    // (a fiberglass rock shelf on iron brackets bolted into the wall)
    topBack(c, v.eye, a, b, y, 1, 0.95, N('#6E6476'), 2);
    still(c, `gl-shelf-${ra}`, a, y, -6, -4, w + 12, 40, g => {
      const F = N('#6E6476'), Ir = rampH(IRON);
      box(g, -2, -1, w + 4, 14, INK); slab(g, -1, 0, w + 2, 12, F); box(g, -1, 9, w + 2, 3, F[1]);
      for (let x = 4; x < w; x += 9) box(g, x, 2 + hash(x + ra) * 6, 4, 2, F[2]);
      for (const x of [12, w - 20]) { polyF(g, [[x, 12], [x + 8, 12], [x + 8, 34], [x, 14]], INK); polyF(g, [[x + 1, 12], [x + 7, 12], [x + 7, 32], [x + 1, 14]], Ir[3]); box(g, x + 3, 16, 2, 2, Ir[5]); }
      lip(g, -1, 0, w + 2);
    });
  }
};
/** The lair's back wall (a solid: he goes over it): fiberglass rock, its seam and bolts, lit along its top. */
const drawLairWall = (c: Ctx, v: View) => {
  const a = X(LAIR_WALL.a), b = X(LAIR_WALL.b), top = Y(LAIR_WALL.top), w = LAIR_WALL.b - LAIR_WALL.a;
  if (!seen(v, a - 60, b + 60, 1, 60)) return;
  const F = N('#6E6476');
  sideBack(c, v.eye, a, -1, top, GY, 1, 0.9, F, 3); sideBack(c, v.eye, b, 1, top, GY, 1, 0.9, F, 3);
  topBack(c, v.eye, a, b, top, 1, 0.9, F, 2);
  still(c, 'gl-lairwall', a, top, -4, -4, w + 8, LAIR_WALL.top + 8, g => {
    const h = LAIR_WALL.top;
    box(g, -1, 0, w + 2, h, INK); slab(g, 0, 0, w, h, F);
    for (let i = 0; i < 12; i++) { const bx = hash(i * 3.1) * w, by = 20 + hash(i * 5.7) * (h - 40), r = 10 + hash(i) * 12; pixelBlob(g, bx, by, r, r * 0.7, F[1]); pixelBlob(g, bx - 2, by - 2, r * 0.8, r * 0.5, F[3]); }
    box(g, w / 2, 0, 2, h, F[0]); for (let y = 10; y < h; y += 24) box(g, w / 2 + 3, y, 2, 2, F[0]);
    lip(g, 0, 0, w);
  });
};
const paPost = (c: Ctx, x: number, talking: boolean, f: number) => {
  still(c, 'gl-papost', x, GY, -30, -250, 80, 254, g => {
    const W = D('#5A4030'), Ir = rampH(IRON, true), Cap = rampH(CAPRED, true), Pk = rampH(ramp6('#F472B6'), true);
    // (a wooden post bound in iron, a toadstool cap on top (dim: not a trampoline), the pink horn off it, its cable)
    postR(g, 0, -220, 0, 8, W);
    for (const y of [-200, -120, -40]) box(g, -5, y, 10, 3, Ir[3]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -222, 27, 15, 0, Math.PI, 0); g.fill();
    g.fillStyle = Cap[3]; g.beginPath(); g.ellipse(0, -222, 25, 13, 0, Math.PI, 0); g.fill(); g.fillStyle = Cap[2]; g.beginPath(); g.ellipse(8, -224, 14, 8, 0, Math.PI, 0); g.fill();
    box(g, -24, -224, 48, 2, Cap[1]);
    for (const [dx, dy] of [[-12, -230], [2, -232], [14, -228]]) box(g, dx - 2, dy, 4, 3, D('#F5EEDC')[3]);
    polyF(g, [[2, -196], [34, -214], [34, -176]], INK); polyF(g, [[4, -196], [32, -211], [32, -179]], Pk[3]); polyF(g, [[4, -196], [32, -211], [32, -204]], Pk[5]); box(g, 30, -211, 2, 32, Pk[1]);
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(-4, -190); g.quadraticCurveTo(-12, -100, -4, 0); g.stroke();
  });
  if (talking) { c.save(); c.globalAlpha = 0.35 + 0.2 * Math.sin(f * 0.5); c.strokeStyle = '#F9A8D4'; c.lineWidth = 2; for (let k = 1; k <= 3; k++) { c.beginPath(); c.arc(x + 34, GY - 195, 6 + k * 8 + (f % 8), -0.6, 0.6); c.stroke(); } c.restore(); }
};

// ---------------------------------------------------------------------------------------------------------------

/** The farthest back: the gorges' depths, the meadow's far edge and its rainbow, the lair's back wall, the ride's tracks. */
export const drawSetsBack = (c: Ctx, state: GameState, v: View) => {
  gorgeVoid(c, v, GAP1.a, GAP1.b, false);
  gorgeVoid(c, v, GAP2.a, GAP2.b, true);
  drawMeadowFar(c, v);
  drawLairBack(c, v);
  drawTracks(c, v);
};
/** Behind the undergrowth: the mine's head frame. */
export const drawSetsFar = (c: Ctx, _state: GameState, v: View) => { drawHeadFrame(c, v); };
/** In front of the undergrowth: the mine's hill and rails; the meadow's fence and photo boards; the lair's bones, gold
 *  and mouth; the queue's crowd; the gate; the bridge's bits. */
export const drawSetsMid = (c: Ctx, _state: GameState, v: View) => {
  drawMeadowMid(c, v);
  drawMineHill(c, v);
  drawLairMid(c, v);
  drawCrowd(c, v);
  drawGate(c, v);
  drawBridgeBits(c, v);
  drawRails(c, v);
};
/** At the play plane: the gorges' faces, the solids, the cottage and its oaks, the stand, the ride's front, the
 *  shelves, the PA horns. */
export const drawSetsNear = (c: Ctx, state: GameState, v: View, piperX: number | null) => {
  gorgeFaces(c, v, GAP1.a, GAP1.b, false);
  gorgeFaces(c, v, GAP2.a, GAP2.b, true);
  drawPier(c, v);
  for (const P of [P1, P2, P3]) drawShaftPillar(c, v, P);
  drawCliff(c, v);
  drawOaks(c, state, v);
  drawCottage(c, state, v);
  drawStandTree(c, state);
  drawLairWall(c, v);
  drawRide(c, state, v);
  drawShelves(c, state, v);
  for (const [x] of PA_AT) if (onScreen(state, X(x) - 60, X(x) + 80)) paPost(c, X(x), piperX === X(x), state.frame);
};

/** The set pieces' lamps after dark. */
export const setLamps = (state: GameState, v: View): Light[] => {
  const out: Light[] = [];
  const add = (x: number, y: number, r: number, a: number, color = '#FFD08A') => { if (x > state.camera.x - 200 && x < state.camera.x + 1000) out.push({ x, y, r, a, color }); };
  const p = (x: number, y: number, d: number) => at(v.eye, x, y, d);
  for (const lx of [-56, 0, 56]) { const [x, y] = p(X(135) + lx, GY - 230, 0.97); add(x, y, 90, 0.5); }
  add(X(COT.a) + 86, Y(COT.top) + 76, 110, 0.5); add(X(COT.b) - 86, Y(COT.top) + 76, 110, 0.5);
  { const [x, y] = p(X(MINE_X) + 93, GY - 115, MINE_D); add(x, y, 120, 0.55); }
  { const [x, y] = p(X(8080) + 30, GY - 330, HEAD_D); add(x, y, 90, 0.45); }
  for (let k = 0; X(LAIR.a - 80) + k * BAY < X(LAIR.b + 80); k += 2) { const [x, y] = p(torchOf(k)[0], torchOf(k)[1], LAIR_D); add(x, y, 130, 0.6, '#FFB060'); }
  add(X(QUEUE.door) + 10, GY - 80, 130, 0.5, '#F0ABFC');
  add(X(QUEUE.door) - 160 + 58, GY - 242, 80, 0.4, '#FF8A3A');
  { const [x, y] = p(X(RAINBOW.x), GY - RAINBOW.r * 0.8, 0.66); if (lit()) add(x, y, 220, 0.3, '#FFE0F0'); }
  if (onScreen(state, X(CLIFF.a), X(CLIFF.b))) add(X(CLIFF.a) + 80, GY - 14, 50, 0.4, '#F2D24A');
  return out;
};
