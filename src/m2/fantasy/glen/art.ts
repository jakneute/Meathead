// The enchanted glen, painted (the SNES pass): one eye over the whole scene (kit.ts's view), the far off cached per hour
// (far.ts), and behind the play plane a deep storybook forest, every depth of it full:
//
//   THE GIANTS     the back row (ROW_D): huge oaks, beeches and birches, their roots spread over the moss, their trunks
//                  going on up out of the picture (stamp over stamp), moss up their shaded sides, ivy, bracket fungi,
//                  fairy doors lit inside, hollows with an owl's eyes in them, carved hearts; boughs off some; fairy
//                  lights strung between them (twinkling, brighter after dark)
//   UNDERGROWTH    in front of their feet (UNDER_D): bushes in flower, ferns, stones, little toadstools, and something
//                  in every stretch (a stump with a door and a lit window, a lawn gnome, a frog with a crown, a picnic
//                  basket, a glass slipper somebody lost, a nest of eggs, an old boot with a chimney); in the mine's
//                  yard ore and crates, in the lair foam rubble and fake gold
//   THE PATH       the forest floor going back from the play plane: a trodden path, stones in it, moss in bands going
//                  dark under the trees, flowers and tufts; and the near floor coming toward him (bent: scanline)
//   PROPS          along the path (PROP_D): lanterns on crooked posts, a wishing well, a frog-prince fountain, a
//                  spinning wheel (DO NOT TOUCH), log benches, a pumpkin coach, a shoe house, the witch's cookie
//                  gravestones, signposts
//
// The set pieces (sets.ts): the glen's gate, the cliff in toadstool hollow and its spring, the storybook bridge's gorge
// (out), the witch's candy cottage and its oaks, the dwarf mine (its hill and portal (the inside dark: never seen),
// the head frame, the shaft), unicorn meadow (the clearing, the rainbow arch, the tree stand), the dragon's lair
// (fiberglass bones, the price tag still on), TRUELLING TRAGONS' front and its queue; Piper's PA horns. The signs:
// storybook shingles on posts (kit.ts storySign).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { timeOfDay } from '../../timeOfDay';
import { bendFloor, pixelBlob } from '../../intro/art/kit';
import { tilePattern } from '../../../m1/game/render/pixelArt';
import {
  type Ctx, type View, INK, box, mix, hash, checker, onScreen, storySign, viewOf, at, stillAt, seen, polyF, ballR,
  IRON, GOLD, TIMBER, LIP, ramp6, rampH, lit, warmGlass,
} from '../kit';
import { GY } from '../geometry';
import { drawGlenFar } from './far';
import { X, x0, GAP1, GAP2, PA_AT } from './layout';
import {
  ROW_D, UNDER_D, PROP_D, MEADOW_D, LAIR_D, MEADOW, LAIR, MINE, RIDE, END, MOSS, GRASS, PATH, SOIL, FIBER, BARKS, LEAF, BULB, CAPRED,
  Q, clipAt, leafy, paintTreeFoot, paintTrunk, paintBough, GIANTS, giantX,
} from './paint';
import { drawSetsBack, drawSetsFar, drawSetsMid, drawSetsNear, setLamps } from './sets';

export const drawGlenBackdrop = (c: Ctx, state: GameState) => drawGlenFar(c, state);

// ---------------------------------------------------------------------------------------------------------------
// The forest floor going back

/** The runs of floor (x from the section's start): [from, to, how far back it goes, what it is]. The gorges between. */
type Floor = 'wood' | 'mine' | 'meadow' | 'lair';
const FLOORS: [number, number, number, Floor][] = [
  [-300, GAP1.a, ROW_D, 'wood'],
  [GAP1.b, MINE.a, ROW_D, 'wood'],
  [MINE.a, GAP2.a, ROW_D, 'mine'],
  [GAP2.b, LAIR.a, MEADOW_D, 'meadow'],
  [LAIR.a, LAIR.b, LAIR_D, 'lair'],
  [LAIR.b, END, ROW_D, 'wood'],
];
const FLOWERS = ['#F49AC8', '#FDE68A', '#FFFFFF', '#A8C8FF', '#E8A8FF', '#FF9A7A'];

const drawFloor = (c: Ctx, v: View) => {
  const Pn = rampH(PATH), Pd = rampH(PATH, true), Md = rampH(MOSS, true), Gd = rampH(GRASS, true), Fd = rampH(FIBER, true), Sd = rampH(SOIL, true);
  for (const [ra, rb, dFar, kind] of FLOORS) {
    const [a, b] = clipAt(v, X(ra), X(rb), dFar);
    if (b <= a) continue;
    if (kind === 'lair') {
      // (the cave's floor: fiberglass rock in bands, darker going back, foam rubble in it)
      const n = 6;
      for (let i = 0; i < n; i++) { const d0 = 1 - ((1 - dFar) * i) / n, d1 = 1 - ((1 - dFar) * (i + 1)) / n; Q(c, v, a, b, d0, d1, Fd[Math.max(0, 4 - i)]); if (i) { const [p, y] = at(v.eye, a, GY, d0), [q] = at(v.eye, b, GY, d0); checker(c, p, Math.round(y), q - p, 2, Fd[Math.max(0, 5 - i)], 0, 1); } }
      for (let x = Math.floor(a / 29) * 29; x < b; x += 29) { const t = hash(x * 0.37), d = dFar + 0.02 + t * (0.96 - dFar), [sx, sy] = at(v.eye, x, GY, d), r = Math.max(1, 4 * d); box(c, sx - r, sy - r * 0.6, r * 2, r, Fd[1]); box(c, sx - r, sy - r * 0.6, r, 1, Fd[4]); }
      continue;
    }
    // (the path: trodden earth along the play plane, its edges ragged into the moss)
    Q(c, v, a, b, 1, 0.975, Pn[4]); Q(c, v, a, b, 0.975, 0.955, Pn[3]);
    const [p0, ye] = at(v.eye, a, GY, 0.955), [p1] = at(v.eye, b, GY, 0.955);
    const back = kind === 'meadow' ? Gd : kind === 'mine' ? Pd : Md;
    const bands = kind === 'meadow' ? 7 : 4;
    for (let i = 0; i < bands; i++) {
      const d0 = 0.955 - ((0.955 - dFar) * i) / bands, d1 = 0.955 - ((0.955 - dFar) * (i + 1)) / bands;
      Q(c, v, a, b, d0, d1, back[Math.max(1, 4 - Math.floor((i * 4) / bands))]);
      const [q0, y] = at(v.eye, a, GY, d1), [q1] = at(v.eye, b, GY, d1);
      checker(c, q0, Math.round(y), q1 - q0, 2, back[Math.max(1, 3 - Math.floor((i * 4) / bands))], i & 1, 1);
    }
    checker(c, p0, Math.round(ye) - 1, p1 - p0, 2, back[4], 0, 1);
    // (stones in the path, ruts in the mine's yard)
    for (let x = Math.floor(a / 31) * 31; x < b; x += 31) {
      const t = hash(x * 0.71 + 3);
      if (t < 0.45) continue;
      const d = 0.958 + t * 0.04, [sx, sy] = at(v.eye, x, GY, d), r = 2 + Math.floor(hash(x) * 3);
      box(c, sx - r - 1, sy - 1, r * 2 + 2, r + 1, INK); box(c, sx - r, sy - 1, r * 2, r, rampH(ramp6('#9A94AE'))[3]); box(c, sx - r, sy - 1, r, 1, rampH(ramp6('#9A94AE'))[5]);
    }
    // (flowers and tufts in the moss (thick in the meadow); in the mine's yard gravel)
    const step = kind === 'meadow' ? 9 : 17;
    for (let x = Math.floor(a / step) * step; x < b; x += step) {
      const t = hash(x * 0.53 + 9), d = dFar + 0.01 + hash(x * 1.7) * (0.94 - dFar), [sx, sy] = at(v.eye, x, GY, d);
      if (kind === 'mine') { if (t > 0.5) box(c, sx, sy, 2, 1, Sd[t > 0.8 ? 4 : 2]); continue; }
      if (t > 0.55) { const col = FLOWERS[Math.floor(hash(x * 3.3) * FLOWERS.length)]; box(c, sx, sy - 3 * d, 1, 3 * d, back[2]); box(c, sx - 1, sy - 4 * d, 3, 2, mix(col, back[2], 0.2)); }
      else if (t > 0.25) { box(c, sx - 2, sy - 3 * d, 1, 3 * d, back[4]); box(c, sx, sy - 4 * d, 1, 4 * d, back[3]); box(c, sx + 2, sy - 3 * d, 1, 3 * d, back[4]); }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The giants, their boughs, the lights strung between them

const giantRamps = (kind: keyof typeof BARKS) => rampH(BARKS[kind], true);
const drawGiants = (c: Ctx, v: View) => {
  const Md = rampH(MOSS, true);
  for (const t of GIANTS) {
    const x = giantX(t);
    if (!seen(v, x - t.w - 200, x + t.w + 200, ROW_D, 40)) continue;
    const R = giantRamps(t.kind);
    stillAt(c, v, ROW_D, `gl-gfoot-${t.rx}`, x, GY, -t.w - 70, -424, t.w * 2 + 140, 428, g => paintTreeFoot(g, t.w, t.kind, t.seed, R, Md));
    // (the trunk on up, stretch over stretch, as high as the picture goes)
    for (let k = 0; k < 10; k++) {
      const y = GY - 420 - k * 300;
      if (at(v.eye, x, y, ROW_D)[1] < v.cam.y - 10) break;
      stillAt(c, v, ROW_D, `gl-gtrunk-${t.kind}-${Math.round(t.w)}-${t.seed % 3}`, x, y, -t.w / 2 - 2, -302, t.w + 4, 304, g => paintTrunk(g, t.w, t.kind, t.seed, R));
    }
    if (t.bough) stillAt(c, v, ROW_D, `gl-gbough-${t.rx}`, x + (t.w / 2 - 4) * t.bough, GY - 470, -200, -160, 400, 200, g => paintBough(g, t.bough as 1 | -1, 150, R, t.seed));
  }
};
/** The fairy lights strung giant to giant (live: they twinkle; brighter after dark). */
const drawLights = (c: Ctx, v: View) => {
  const night = lit(), f = v.f;
  for (let i = 0; i < GIANTS.length - 1; i++) {
    const A = GIANTS[i], B = GIANTS[i + 1];
    if (B.rx - A.rx > 520) continue;
    const ax = giantX(A) + A.w / 2, bx = giantX(B) - B.w / 2, y0 = GY - 300 - (i % 3) * 40;
    if (!seen(v, ax, bx, ROW_D, 20)) continue;
    const n = Math.max(4, Math.floor((bx - ax) / 22)), sag = 40 + (i % 2) * 20;
    // (the wire)
    c.strokeStyle = mix('#2A2430', '#000000', 0.2); c.lineWidth = 1; c.beginPath();
    for (let k = 0; k <= n; k++) { const t = k / n, [sx, sy] = at(v.eye, ax + (bx - ax) * t, y0 + 4 * sag * t * (1 - t), ROW_D); if (k) c.lineTo(sx, sy); else c.moveTo(sx, sy); }
    c.stroke();
    for (let k = 1; k < n; k++) {
      const t = k / n, [sx, sy] = at(v.eye, ax + (bx - ax) * t, y0 + 4 * sag * t * (1 - t), ROW_D);
      const col = BULB[(k + i) % BULB.length], on = Math.sin(f * 0.05 + k * 1.7 + i) > -0.3;
      if (night && on) { c.globalAlpha = 0.28; c.fillStyle = col; c.fillRect(Math.round(sx) - 3, Math.round(sy) - 1, 7, 7); c.globalAlpha = 1; }
      box(c, sx - 1, sy + 1, 3, 3, INK); box(c, sx, sy + 2, 1 + (on ? 1 : 0), 1 + (on ? 1 : 0), on ? (night ? col : mix(col, '#7A7A8A', 0.35)) : mix(col, '#2A2A3A', 0.6));
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The undergrowth in front of the giants' feet

const CHUNK = 480;
type Under = 'wood' | 'mine' | 'lair';
const underOf = (i: number): Under | null => {
  const m = i * CHUNK + CHUNK / 2;
  if (m > RIDE.a - 300 || (m > MEADOW.a - 80 && m < MEADOW.b)) return null;
  if (m > LAIR.a && m < LAIR.b) return 'lair';
  if (m > MINE.a - 100 && m < MINE.b + 100) return 'mine';
  return 'wood';
};
const SPECIALS = ['stump', 'gnome', 'frog', 'basket', 'slipper', 'nest', 'boot'] as const;
const paintUnder = (g: Ctx, i: number, kind: Under) => {
  const L = rampH(LEAF, true), Gd = rampH(GRASS, true), Cap = rampH(CAPRED, true), St = rampH(ramp6('#8A849E'), true);
  if (kind === 'lair') {
    // (fiberglass rubble and foam gold coins, a fake gem or two, a dropped mop)
    const F = rampH(FIBER, true), Gl = rampH(GOLD, true);
    for (let k = 0; k < 9; k++) { const x = 20 + k * 52 + hash(i * 9 + k) * 20, r = 10 + hash(i + k) * 14; pixelBlob(g, x, -r * 0.5, r, r * 0.6, F[1]); pixelBlob(g, x - r * 0.2, -r * 0.6, r * 0.7, r * 0.4, F[3]); box(g, x - r * 0.5, -r * 0.9, r * 0.3, 1, F[5]); }
    for (let k = 0; k < 14; k++) { const x = 10 + hash(i * 5 + k) * 460, y = -2 - hash(i * 3 + k) * 6; box(g, x - 4, y - 2, 8, 3, INK); box(g, x - 3, y - 1, 6, 2, Gl[3]); box(g, x - 3, y - 1, 3, 1, Gl[5]); }
    for (let k = 0; k < 3; k++) { const x = 60 + hash(i * 7 + k) * 380, col = rampH(ramp6(['#A78BFA', '#F472B6', '#60A5FA'][k]), true); polyF(g, [[x - 5, -6], [x, -13], [x + 5, -6], [x, 0]], INK); polyF(g, [[x - 4, -6], [x, -12], [x + 4, -6], [x, -1]], col[3]); box(g, x - 2, -9, 2, 2, col[5]); }
    return;
  }
  if (kind === 'mine') {
    // (ore heaps, crates of fake gems, a barrow, timber stacked)
    const T = rampH(TIMBER, true);
    for (let k = 0; k < 4; k++) { const x = 40 + k * 120 + hash(i + k) * 30; pixelBlob(g, x, -10, 26, 12, St[1]); pixelBlob(g, x - 4, -14, 18, 8, St[3]); for (let q = 0; q < 4; q++) box(g, x - 12 + q * 7, -16 + (q % 2) * 3, 3, 2, rampH(ramp6(['#A78BFA', '#F472B6', '#60A5FA', '#FDE047'][q]), true)[4]); }
    for (const x of [100, 330]) { box(g, x - 1, -41, 42, 42, INK); box(g, x, -40, 40, 40, T[3]); box(g, x, -40, 40, 2, T[5]); for (const y of [-28, -14]) box(g, x, y, 40, 2, T[1]); box(g, x + 36, -40, 4, 40, T[1]); }
    for (let k = 0; k < 5; k++) { box(g, 200 - 1, -6 - k * 8, 92, 8, INK); box(g, 200, -5 - k * 8, 90, 6, T[2 + (k % 2)]); box(g, 200, -5 - k * 8, 90, 1, T[4]); }
    return;
  }
  // (bushes in flower, ferns, stones, little toadstools)
  for (let k = 0; k < 6; k++) {
    const x = 10 + k * 82 + hash(i * 11 + k) * 30, r = 22 + hash(i * 3 + k) * 18;
    leafy(g, x, -r * 0.6, r, k % 3 === 2 ? rampH(ramp6('#4E8A3A'), true) : L, i * 31 + k);
    if (hash(i * 5 + k) > 0.4) { const col = mix(FLOWERS[(i + k) % FLOWERS.length], '#5A5A7A', 0.25); for (let q = 0; q < 7; q++) { const fx = x - r * 0.7 + hash(i * 13 + k * 7 + q) * r * 1.4, fy = -r * 1.1 + hash(i * 17 + k + q) * r * 0.8; box(g, fx, fy, 2, 2, col); box(g, fx, fy, 1, 1, mix(col, '#FFFFFF', 0.4)); } }
  }
  for (let k = 0; k < 5; k++) { const x = 40 + k * 100 + hash(i * 19 + k) * 30; for (let fr = -3; fr <= 3; fr++) { polyF(g, [[x, 0], [x + fr * 9, -20 + Math.abs(fr) * 3], [x + fr * 7 + 2, 0]], Gd[2 + (fr & 1)]); box(g, x + fr * 8, -18 + Math.abs(fr) * 3, 2, 1, Gd[4]); } }
  for (let k = 0; k < 4; k++) { const x = 70 + k * 110 + hash(i * 23 + k) * 40, r = 5 + hash(i + k * 3) * 6; pixelBlob(g, x, -r * 0.5, r, r * 0.55, St[1]); pixelBlob(g, x - 1, -r * 0.6, r * 0.7, r * 0.35, St[3]); box(g, x - r * 0.4, -r * 0.9, 2, 1, St[5]); }
  for (let k = 0; k < 3; k++) {
    const mx = 120 + k * 140 + hash(i * 29 + k) * 30, s = 0.8 + hash(i * 31 + k) * 0.5;
    box(g, mx - 3 * s, -12 * s, 6 * s, 12 * s, INK); box(g, mx - 2 * s, -12 * s, 4 * s, 12 * s, rampH(ramp6('#EAE0C6'), true)[3]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(mx, -12 * s, 10 * s, 7 * s, 0, Math.PI, 0); g.fill();
    g.fillStyle = Cap[3]; g.beginPath(); g.ellipse(mx, -12.5 * s, 9 * s, 6 * s, 0, Math.PI, 0); g.fill();
    box(g, mx - 4 * s, -16 * s, 2, 2, '#F2E8DA'); box(g, mx + 2 * s, -15 * s, 2, 2, '#F2E8DA');
  }
  // (and one thing to find in every stretch)
  const sp = SPECIALS[i % SPECIALS.length], sx = 240 + (hash(i * 37) - 0.5) * 120;
  const D = (col: string) => rampH(ramp6(col), true);
  if (sp === 'stump') {
    const W = D('#6A4A34'), G = warmGlass();
    box(g, sx - 25, -46, 50, 46, INK); box(g, sx - 24, -45, 48, 45, W[3]); box(g, sx - 24, -45, 10, 45, W[4]); box(g, sx + 14, -45, 10, 45, W[2]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(sx, -46, 26, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = D('#C8A070')[3]; g.beginPath(); g.ellipse(sx, -46, 24, 6, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = D('#8A6040')[2]; g.lineWidth = 1; for (const r of [6, 12, 18]) { g.beginPath(); g.ellipse(sx, -46, r, r * 0.25, 0, 0, Math.PI * 2); g.stroke(); }
    box(g, sx - 8, -24, 12, 24, INK); box(g, sx - 7, -23, 10, 23, D('#2A6A6A')[3]); box(g, sx + 1, -12, 1, 1, '#F6D365');
    box(g, sx + 8, -34, 10, 9, INK); box(g, sx + 9, -33, 8, 7, G[4]); box(g, sx + 12, -33, 1, 7, INK);
    box(g, sx + 12, -64, 6, 16, INK); box(g, sx + 13, -63, 4, 15, D('#9A5A3A')[3]);
  } else if (sp === 'gnome') {
    const R = D('#C42828'), B = D('#2E5AAE'), S = D('#E8B890');
    polyF(g, [[sx - 9, -32], [sx + 9, -32], [sx + 2, -58]], INK); polyF(g, [[sx - 8, -33], [sx + 8, -33], [sx + 2, -56]], R[3]); polyF(g, [[sx - 8, -33], [sx - 2, -33], [sx + 2, -56]], R[4]);
    box(g, sx - 8, -33, 16, 10, INK); box(g, sx - 7, -32, 14, 9, S[3]); box(g, sx + 1, -29, 3, 2, S[4]);
    polyF(g, [[sx - 8, -26], [sx + 8, -26], [sx + 4, -12], [sx - 4, -12]], D('#F2F0E8')[3]);
    box(g, sx - 9, -14, 18, 12, INK); box(g, sx - 8, -13, 16, 11, B[3]); box(g, sx - 8, -13, 4, 11, B[4]); box(g, sx - 9, -3, 7, 3, INK); box(g, sx + 2, -3, 7, 3, INK);
    box(g, sx - 3, -30, 1, 1, INK); box(g, sx + 3, -30, 1, 1, INK);
  } else if (sp === 'frog') {
    const F = D('#4E9A3A'), St2 = St, Gl = D('#E0AE3A');
    pixelBlob(g, sx, -8, 22, 9, St2[1]); pixelBlob(g, sx - 2, -10, 16, 6, St2[3]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(sx, -22, 13, 9, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = F[3]; g.beginPath(); g.ellipse(sx, -22, 12, 8, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = F[4]; g.beginPath(); g.ellipse(sx - 4, -25, 5, 3, 0, 0, Math.PI * 2); g.fill();
    for (const o of [-6, 6]) { ballR(g, sx + o, -30, 4, F); box(g, sx + o - 1, -31, 2, 2, INK); }
    box(g, sx - 6, -19, 12, 1, F[0]);
    polyF(g, [[sx - 6, -34], [sx - 6, -40], [sx - 3, -37], [sx, -41], [sx + 3, -37], [sx + 6, -40], [sx + 6, -34]], Gl[3]); box(g, sx - 6, -35, 12, 1, Gl[5]);
  } else if (sp === 'basket') {
    const W = D('#A8804A'), Ck = D('#C83A3A');
    box(g, sx - 18, -20, 36, 20, INK); box(g, sx - 17, -19, 34, 19, W[3]); for (let y = -17; y < 0; y += 4) box(g, sx - 17, y, 34, 1, W[1]); for (let x = sx - 15; x < sx + 17; x += 5) box(g, x, -19, 1, 19, W[4]);
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(sx, -20, 13, Math.PI, 0); g.stroke(); g.strokeStyle = W[3]; g.lineWidth = 1.5; g.stroke();
    for (let k = 0; k < 4; k++) box(g, sx - 30 + k * 8, -2, 8, 3, k % 2 ? Ck[3] : D('#F2F0E8')[3]);
    box(g, sx - 6, -24, 10, 5, D('#E04040')[3]); box(g, sx + 4, -24, 3, 2, D('#4E9A3A')[3]);
  } else if (sp === 'slipper') {
    const Gl = D('#C8F0FF');
    polyF(g, [[sx - 12, -2], [sx + 10, -2], [sx + 12, -8], [sx + 2, -12], [sx - 4, -9]], INK); polyF(g, [[sx - 11, -3], [sx + 9, -3], [sx + 11, -8], [sx + 2, -11], [sx - 4, -8]], Gl[3]);
    box(g, sx - 8, -6, 3, 1, Gl[5]); box(g, sx + 6, -6, 1, 1, '#FFFFFF'); box(g, sx + 9, -8, 2, 6, Gl[1]);
    box(g, sx + 4, -18, 1, 3, '#FFFFFF'); box(g, sx + 3, -17, 3, 1, '#FFFFFF');
  } else if (sp === 'nest') {
    const N = D('#8A6A40');
    g.fillStyle = INK; g.beginPath(); g.ellipse(sx, -6, 18, 8, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = N[3]; g.beginPath(); g.ellipse(sx, -6, 17, 7, 0, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 10; k++) box(g, sx - 15 + k * 3, -9 + (k % 3), 4, 1, N[k % 2 ? 1 : 4]);
    for (const [ex, col] of [[-6, '#E8D8F0'], [0, '#A8E0F0'], [6, '#F6E0A8']] as const) { g.fillStyle = INK; g.beginPath(); g.ellipse(sx + ex, -12, 4, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = D(col)[3]; g.beginPath(); g.ellipse(sx + ex, -12, 3, 4, 0, 0, Math.PI * 2); g.fill(); box(g, sx + ex - 1, -15, 1, 1, '#FFFFFF'); }
  } else {
    const B = D('#6A4A2E'), G = warmGlass();
    polyF(g, [[sx - 26, 0], [sx - 26, -18], [sx - 10, -22], [sx - 8, -50], [sx + 12, -50], [sx + 14, -20], [sx + 26, -8], [sx + 26, 0]], INK);
    polyF(g, [[sx - 25, -1], [sx - 25, -17], [sx - 9, -21], [sx - 7, -49], [sx + 11, -49], [sx + 13, -19], [sx + 25, -7], [sx + 25, -1]], B[3]);
    box(g, sx - 7, -49, 4, 30, B[4]); box(g, sx - 25, -4, 50, 3, B[1]);
    for (let k = 0; k < 4; k++) { box(g, sx - 6 + k * 4, -46 + k * 8, 3, 2, D('#E8E0D0')[3]); }
    box(g, sx + 2, -40, 7, 7, INK); box(g, sx + 3, -39, 5, 5, G[4]);
    box(g, sx - 18, -14, 6, 12, INK); box(g, sx - 17, -13, 4, 11, D('#8A2A2A')[3]);
    box(g, sx + 4, -62, 6, 14, INK); box(g, sx + 5, -61, 4, 13, D('#8A5A4A')[3]);
  }
};
const drawUnder = (c: Ctx, v: View) => {
  for (let i = Math.max(0, Math.floor((v.eye.x + (v.cam.x - 200 - v.eye.x) / UNDER_D - x0) / CHUNK)); i * CHUNK < END; i++) {
    const a = X(i * CHUNK), b = a + CHUNK;
    if (at(v.eye, a, GY, UNDER_D)[0] > v.cam.x + 900) break;
    const kind = underOf(i);
    if (!kind) continue;
    // (clipped where a gorge cuts through)
    const cuts: [number, number][] = [];
    for (const [ga, gb] of [[GAP1.a, GAP1.b], [GAP2.a, GAP2.b]]) if (X(gb) > a && X(ga) < b) cuts.push([X(ga), X(gb)]);
    c.save();
    if (cuts.length) {
      c.beginPath(); let from = a - 400;
      for (const [ga, gb] of cuts) { const [sa] = at(v.eye, ga, GY, UNDER_D), [sf] = at(v.eye, from, GY, UNDER_D); c.rect(sf, v.cam.y - 400, sa - sf, 1600); from = gb; }
      const [sf] = at(v.eye, from, GY, UNDER_D), [sb] = at(v.eye, b + 400, GY, UNDER_D); c.rect(sf, v.cam.y - 400, sb - sf, 1600); c.clip();
    }
    stillAt(c, v, UNDER_D, `gl-under-${i}-${kind}`, a, GY, -40, -90, CHUNK + 80, 92, g => paintUnder(g, i, kind));
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The props along the path

type Prop = 'lantern' | 'well' | 'frog' | 'spindle' | 'bench' | 'pumpkin' | 'shoe' | 'graves' | 'crates' | 'signpost';
/** [x from the section's start, what]. Where there's room (not in a gorge, nor in front of a set piece). */
export const PROPS: [number, Prop][] = [
  [330, 'lantern'], [560, 'shoe'], [900, 'well'], [1320, 'lantern'], [1560, 'signpost'],
  [2480, 'lantern'], [2900, 'spindle'], [3300, 'bench'], [3560, 'lantern'], [3900, 'frog'],
  [5240, 'lantern'], [5420, 'pumpkin'], [5860, 'graves'], [7080, 'graves'], [7330, 'lantern'],
  [7560, 'crates'], [8112, 'lantern'],
  [13180, 'lantern'], [13420, 'signpost'],
];
const paintProp = (g: Ctx, kind: Prop, seed: number) => {
  const D = (col: string) => rampH(ramp6(col), true), I = rampH(IRON, true), T = rampH(TIMBER, true), St = D('#9A94AE'), G = warmGlass();
  switch (kind) {
    case 'lantern': {
      // (a crooked wooden post, an iron arm, a lantern hung off it, its glass lit)
      g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-6, -70, 2, -140); g.stroke();
      g.strokeStyle = T[3]; g.lineWidth = 6; g.stroke(); g.strokeStyle = T[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(-8, -70, 0, -140); g.stroke();
      box(g, -2, -142, 30, 4, INK); box(g, -1, -141, 28, 2, I[3]); g.strokeStyle = I[2]; g.lineWidth = 2; g.beginPath(); g.arc(8, -128, 10, -Math.PI / 2, 0); g.stroke();
      box(g, 22, -138, 1, 8, INK);
      polyF(g, [[16, -130], [30, -130], [27, -126], [19, -126]], I[2]);
      box(g, 17, -126, 12, 16, INK); for (let i = 0; i < 3; i++) box(g, 18, -125 + i * 5, 10, 5, G[5 - i]); box(g, 22, -125, 2, 15, I[3]);
      box(g, 16, -110, 14, 3, I[2]);
      for (let k = 0; k < 3; k++) { box(g, -10 + k * 6, -4, 4, 4, St[3]); }
      break;
    }
    case 'well': {
      // (a wishing well: round stone, a little shingled roof on posts, the bucket on its rope, coins round it)
      const W = D('#7A5A3A'), Rf = D('#8A3A3A');
      box(g, -34, -40, 68, 40, INK); box(g, -33, -39, 66, 39, St[3]); box(g, -33, -39, 14, 39, St[4]); box(g, 20, -39, 13, 39, St[2]);
      for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) box(g, -33 + k * 12 + (r % 2) * 6, -39 + r * 10, 1, 10, St[1]);
      for (let r = 1; r < 4; r++) box(g, -33, -39 + r * 10, 66, 1, St[1]);
      g.fillStyle = INK; g.beginPath(); g.ellipse(0, -40, 34, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = St[4]; g.beginPath(); g.ellipse(0, -40, 32, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#081018'; g.beginPath(); g.ellipse(0, -40, 26, 4, 0, 0, Math.PI * 2); g.fill();
      for (const px of [-28, 26]) { box(g, px - 1, -110, 6, 70, INK); box(g, px, -110, 4, 70, W[3]); box(g, px, -110, 1, 70, W[5]); }
      box(g, -30, -96, 60, 3, W[2]);
      polyF(g, [[-44, -104], [0, -136], [44, -104]], INK); polyF(g, [[-42, -105], [0, -134], [42, -105]], Rf[3]); polyF(g, [[-42, -105], [0, -134], [-8, -105]], Rf[4]);
      for (let k = 1; k < 4; k++) { const y = -105 - k * 7, hw = 42 * (1 - k * 0.24); box(g, -hw, y, hw * 2, 1, Rf[1]); }
      box(g, -1, -96, 1, 30, D('#C8B080')[3]); box(g, -6, -66, 11, 10, INK); box(g, -5, -65, 9, 8, W[3]); box(g, -5, -65, 9, 1, I[4]);
      for (let k = 0; k < 6; k++) box(g, -30 + hash(seed + k) * 60, -2, 3, 2, D('#E0AE3A')[4]);
      break;
    }
    case 'frog': {
      // (the frog-prince fountain: a basin, the frog on a lily pad in a crown, water arcing out of its mouth (live))
      const F = D('#4E9A3A'), Wt = D('#7AB8E0'), Gl = D('#E0AE3A');
      box(g, -40, -24, 80, 24, INK); box(g, -39, -23, 78, 23, St[3]); box(g, -39, -23, 78, 3, St[5]); box(g, 26, -23, 13, 23, St[2]);
      box(g, -36, -20, 72, 4, Wt[3]); box(g, -36, -20, 72, 1, Wt[5]);
      box(g, -5, -46, 10, 24, INK); box(g, -4, -45, 8, 23, St[3]); box(g, -4, -45, 2, 23, St[5]);
      g.fillStyle = INK; g.beginPath(); g.ellipse(0, -48, 18, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = D('#3E7A34')[3]; g.beginPath(); g.ellipse(0, -48, 17, 4, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = INK; g.beginPath(); g.ellipse(0, -60, 13, 11, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = F[3]; g.beginPath(); g.ellipse(0, -60, 12, 10, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = F[4]; g.beginPath(); g.ellipse(-4, -63, 5, 4, 0, 0, Math.PI * 2); g.fill();
      for (const o of [-6, 6]) { ballR(g, o, -70, 4, F); box(g, o - 1, -71, 2, 2, INK); }
      box(g, 4, -58, 8, 4, INK); box(g, 5, -57, 6, 2, '#E04060');
      polyF(g, [[-7, -74], [-7, -82], [-3, -78], [0, -84], [3, -78], [7, -82], [7, -74]], Gl[3]); box(g, -7, -75, 14, 1, Gl[5]);
      break;
    }
    case 'spindle': {
      // (a spinning wheel on a stump, its spindle up (it's what pricked her), roped off, a little warning card)
      const W = D('#8A5A30');
      box(g, -30, -30, 60, 30, INK); box(g, -29, -29, 58, 29, W[2]); box(g, -29, -29, 58, 3, D('#C8A070')[3]);
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(-6, -64, 26, 0, Math.PI * 2); g.stroke(); g.strokeStyle = W[4]; g.lineWidth = 2; g.stroke();
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.strokeStyle = W[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(-6, -64); g.lineTo(-6 + Math.cos(a) * 25, -64 + Math.sin(a) * 25); g.stroke(); }
      ballR(g, -6, -64, 4, W);
      box(g, 14, -30, 4, -50 + 30 + 30, INK); polyF(g, [[18, -60], [32, -86], [34, -84], [20, -58]], INK); polyF(g, [[19, -60], [32, -85], [33, -84], [20, -59]], D('#E0D8C8')[4]); box(g, 31, -88, 2, 2, D('#E04040')[3]);
      for (const px of [-48, 48]) { box(g, px - 2, -40, 5, 40, INK); box(g, px - 1, -39, 3, 39, I[4]); ballR(g, px, -42, 3, rampH(GOLD, true)); }
      g.strokeStyle = D('#B42A3A')[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(-48, -34); g.quadraticCurveTo(0, -20, 48, -34); g.stroke();
      break;
    }
    case 'bench': {
      // (a log bench: half a trunk on two stumps, bark on its back, moss)
      const W = rampH(BARKS.oak, true), Md = rampH(MOSS, true);
      for (const px of [-38, 26]) { box(g, px - 1, -22, 16, 22, INK); box(g, px, -21, 14, 21, W[3]); box(g, px, -21, 4, 21, W[4]); }
      box(g, -50, -32, 100, 12, INK); box(g, -49, -31, 98, 10, W[3]); box(g, -49, -31, 98, 3, D('#C8A070')[3]); box(g, -49, -23, 98, 2, W[1]);
      for (let k = -40; k < 44; k += 12) box(g, k, -28, 6, 1, W[2]);
      box(g, -49, -31, 20, 2, Md[3]);
      break;
    }
    case 'pumpkin': {
      // (the pumpkin coach: a giant pumpkin on gilt wheels, a curtained window, a little door, the stalk curled)
      const P = D('#E07A20'), Gl = rampH(GOLD, true);
      for (const wx of [-38, 38]) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(wx, -20, 18, 0, Math.PI * 2); g.stroke(); g.strokeStyle = Gl[3]; g.lineWidth = 3; g.stroke(); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; g.strokeStyle = Gl[2]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(wx, -20); g.lineTo(wx + Math.cos(a) * 17, -20 + Math.sin(a) * 17); g.stroke(); } ballR(g, wx, -20, 3, Gl); }
      g.fillStyle = INK; g.beginPath(); g.ellipse(0, -64, 52, 40, 0, 0, Math.PI * 2); g.fill();
      for (let k = 0; k < 5; k++) { g.fillStyle = P[[2, 3, 4, 3, 1][k]]; g.beginPath(); g.ellipse(-36 + k * 18, -64, 18, 38, 0, 0, Math.PI * 2); g.fill(); }
      for (let k = 0; k < 4; k++) box(g, -27 + k * 18, -96, 1, 64, P[1]);
      box(g, -12, -80, 24, 22, INK); box(g, -11, -79, 22, 20, G[3]); box(g, -11, -79, 22, 6, D('#C83A6A')[3]); for (let k = 0; k < 4; k++) box(g, -11 + k * 6, -73, 3, 2, D('#C83A6A')[2]);
      g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -102); g.quadraticCurveTo(10, -118, 20, -110); g.stroke(); g.strokeStyle = D('#4E7A2A')[3]; g.lineWidth = 3; g.stroke();
      box(g, -40, -32, 80, 4, Gl[3]); box(g, -40, -32, 80, 1, Gl[5]);
      break;
    }
    case 'shoe': {
      // (the old woman's shoe house: a big boot, windows up its side lit, a door at the heel, a chimney, laces)
      const B = D('#7A3A2A'), Rf = D('#3A4A6A');
      polyF(g, [[-50, 0], [-50, -60], [-36, -66], [-30, -120], [10, -120], [14, -60], [48, -34], [56, -14], [56, 0]], INK);
      polyF(g, [[-49, -1], [-49, -59], [-35, -65], [-29, -119], [9, -119], [13, -59], [47, -33], [55, -13], [55, -1]], B[3]);
      box(g, -29, -119, 10, 60, B[4]); box(g, -49, -6, 104, 5, B[1]); box(g, 0, -119, 9, 60, B[2]);
      for (let k = 0; k < 4; k++) { box(g, -10, -108 + k * 12, 14, 2, D('#E8E0D0')[3]); }
      for (const [wx, wy] of [[-24, -100], [-24, -76], [24, -40]] as const) { box(g, wx - 1, wy - 1, 12, 12, INK); box(g, wx, wy, 10, 10, G[3]); box(g, wx + 4, wy, 1, 10, INK); box(g, wx, wy + 4, 10, 1, INK); }
      box(g, -44, -30, 14, 30, INK); box(g, -43, -29, 12, 29, D('#2A5A3A')[3]); box(g, -34, -16, 1, 1, '#F6D365');
      polyF(g, [[-34, -120], [-12, -140], [12, -120]], Rf[3]); box(g, -34, -122, 46, 3, Rf[1]);
      box(g, 0, -148, 8, 22, INK); box(g, 1, -147, 6, 21, D('#8A5A4A')[3]);
      break;
    }
    case 'graves': {
      // (the witch's garden: gingerbread gravestones in a row, a bite out of one, icing R.I.P.s, a candy fence)
      const Gn = D('#A8642E'), Ic = D('#F4F0FA');
      for (let k = 0; k < 3; k++) {
        const gx = -40 + k * 40, h = 30 + (k % 2) * 8;
        g.fillStyle = INK; g.beginPath(); g.moveTo(gx - 13, 0); g.lineTo(gx - 13, -h + 12); g.arc(gx, -h + 12, 13, Math.PI, 0); g.lineTo(gx + 13, 0); g.closePath(); g.fill();
        g.fillStyle = Gn[3]; g.beginPath(); g.moveTo(gx - 12, -1); g.lineTo(gx - 12, -h + 12); g.arc(gx, -h + 12, 12, Math.PI, 0); g.lineTo(gx + 12, -1); g.closePath(); g.fill();
        box(g, gx - 12, -h + 8, 4, h - 9, Gn[4]); box(g, gx + 8, -h + 8, 4, h - 9, Gn[2]);
        box(g, gx - 7, -h + 10, 14, 1, Ic[3]); box(g, gx - 1, -h + 6, 2, 14, Ic[3]); box(g, gx - 5, -h + 18, 10, 1, Ic[3]);
        if (k === 1) { g.fillStyle = INK; for (const [bx, by] of [[10, -h + 4], [13, -h + 10]]) { g.beginPath(); g.arc(gx + bx, by, 4, 0, Math.PI * 2); g.fill(); } }
      }
      for (let px = -62; px <= 62; px += 14) { box(g, px - 2, -26, 5, 26, INK); for (let y = -25; y < 0; y += 6) { box(g, px - 1, y, 3, 3, D('#F2F0E8')[3]); box(g, px - 1, y + 3, 3, 3, D('#D02A2A')[3]); } }
      break;
    }
    case 'crates': {
      const W = T;
      for (const [cx, cy, s] of [[-30, 0, 34], [10, 0, 30], [-12, -34, 28]] as const) { box(g, cx - 1, cy - s - 1, s + 2, s + 2, INK); box(g, cx, cy - s, s, s, W[3]); box(g, cx, cy - s, s, 2, W[5]); box(g, cx + s - 4, cy - s, 4, s, W[1]); g.strokeStyle = W[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + 2, cy - 2); g.lineTo(cx + s - 2, cy - s + 2); g.stroke(); }
      for (let k = 0; k < 4; k++) box(g, -26 + k * 8, -38, 5, 4, D(['#A78BFA', '#F472B6', '#60A5FA', '#FDE047'][k])[4]);
      break;
    }
    case 'signpost': {
      // (a crooked signpost, its fingers pointing every which way, a lantern hung off it)
      const W = D('#8A6A44');
      box(g, -4, -130, 8, 130, INK); box(g, -3, -129, 6, 129, W[3]); box(g, -3, -129, 2, 129, W[5]);
      for (const [y, dir, len, col] of [[-120, 1, 54, '#2E5AAE'], [-100, -1, 46, '#8A2A5A'], [-80, 1, 40, '#2E6A3A'], [-62, -1, 50, '#7A5A2A']] as const) {
        const Cc = D(col), x2 = dir * len;
        polyF(g, [[0, y - 1], [x2 - dir * 8, y - 1], [x2, y + 5], [x2 - dir * 8, y + 11], [0, y + 11]], INK);
        polyF(g, [[0, y], [x2 - dir * 8, y], [x2 - dir, y + 5], [x2 - dir * 8, y + 10], [0, y + 10]], Cc[3]);
        box(g, Math.min(0, x2 - dir * 8), y, Math.abs(x2 - dir * 8), 1, Cc[5]);
        for (let k = 0; k < Math.floor(len / 9) - 1; k++) box(g, dir * (6 + k * 7), y + 4, 4, 2, rampH(GOLD, true)[4]);
      }
      ballR(g, 0, -134, 5, rampH(GOLD, true));
      break;
    }
  }
};
const drawProps = (c: Ctx, v: View) => {
  for (const [rx, kind] of PROPS) {
    const x = X(rx);
    if (!seen(v, x - 80, x + 80, PROP_D, 60)) continue;
    stillAt(c, v, PROP_D, `gl-prop-${kind}-${rx}`, x, GY, -80, -160, 160, 164, g => paintProp(g, kind, rx));
    if (kind === 'frog') {
      // (the water out of its mouth, arcing into the basin)
      const f = v.f;
      for (let k = 0; k < 6; k++) { const t = ((f * 0.04 + k / 6) % 1), [sx, sy] = at(v.eye, x + 12 + t * 22, GY - 56 + t * t * 36 - t * 6, PROP_D); box(c, sx, sy, 2, 2, k % 2 ? '#C8E8FF' : '#8AC0F0'); }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The near floor coming toward him (bent), and the lit lip along the ground he walks on

const nearTile = (c: Ctx) => {
  const G = rampH(GRASS), M = rampH(MOSS);
  // (the grass coming toward him: tufts, clover, a flower here and there; the path's drawn over it, along the edge)
  return tilePattern(c, `fa-gl-near-${timeOfDay().key}`, 96, 64, g => {
    box(g, 0, 0, 96, 64, G[2]);
    for (let k = 0; k < 10; k++) { const x = hash(k * 3.1) * 92, y = hash(k * 7.7) * 60; box(g, x, y, 6, 3, G[1]); checker(g, x - 2, y, 10, 3, G[1], 0, 1); }
    for (let k = 0; k < 46; k++) { const x = Math.floor(hash(k * 1.9 + 4) * 95), y = Math.floor(hash(k * 4.3) * 62); box(g, x, y, 1, 3, G[k % 3 ? 4 : 1]); box(g, x + 1, y + 1, 1, 2, M[3]); }
    for (let k = 0; k < 6; k++) { const x = hash(k * 5.3 + 1) * 92, y = 4 + hash(k * 2.9) * 56; box(g, x, y, 2, 2, FLOWERS[k % FLOWERS.length]); box(g, x, y, 1, 1, '#FFFFFF'); }
  });
};
/** The path along the edge, in front of him: trodden earth, pebbles in it, its far edge ragged into the grass. */
const nearPath = (c: Ctx, s: number, e: number) => {
  const P = rampH(PATH), G = rampH(GRASS);
  box(c, s, GY + 10, e - s, 26, P[3]); box(c, s, GY + 10, e - s, 3, P[2]); checker(c, s, GY + 36, e - s, 2, P[3], 0, 1); checker(c, s, GY + 13, e - s, 2, P[2], 1, 1);
  for (let x = Math.floor(s / 11) * 11; x < e; x += 11) {
    const t = hash(x * 0.61 + 7), y = GY + 15 + Math.floor(hash(x * 1.3) * 16), w = 3 + Math.floor(hash(x) * 5);
    if (t > 0.5) { box(c, x, y, w, 2, P[1]); box(c, x, y, w, 1, P[5]); }
    else if (t < 0.12) { box(c, x, GY + 34, 2, 3, G[4]); box(c, x + 2, GY + 33, 1, 4, G[3]); }
  }
};
const drawNearGround = (c: Ctx, state: GameState, v: View) => {
  const L = state.camera.x - 40, R = state.camera.x + 840, M = rampH(MOSS), S = rampH(SOIL);
  const runs: [number, number][] = [[X(-300), X(GAP1.a)], [X(GAP1.b), X(GAP2.a)], [X(GAP2.b), X(END)]];
  for (const [a, b] of runs) {
    const s = Math.max(a, L), e = Math.min(b, R);
    if (e <= s) continue;
    box(c, s, GY, e - s, 700, M[1]);
    c.fillStyle = nearTile(c); c.fillRect(s, GY + 10, e - s, 600);
    nearPath(c, s, e);
    bendFloor(c, v.eye, GY, GY, GY + 140, a, b);
    // (the edge he walks along: moss over the soil's lip, lit (standable reads standable); roots and pebbles in it)
    box(c, s, GY, e - s, 10, M[3]); box(c, s, GY + 7, e - s, 3, S[2]); checker(c, s, GY + 5, e - s, 2, M[2], 0, 1);
    for (let x = Math.floor(s / 14) * 14; x < e; x += 14) { const t = hash(x * 0.29); if (t > 0.6) box(c, x, GY + 3, 4, 2, M[4]); else if (t < 0.15) { box(c, x, GY + 6, 6, 2, S[1]); box(c, x, GY + 6, 3, 1, S[4]); } }
    box(c, s, GY, e - s, 2, LIP[2]); box(c, s, GY, e - s, 1, LIP[3]);
    for (let x = Math.floor(s / 6) * 6; x < e; x += 6) { const t = hash(x * 0.17); if (t > 0.55) { box(c, x, GY - 2, 1, 2, M[4]); box(c, x + 2, GY - 3, 1, 3, M[5]); } if (t > 0.93) { box(c, x + 1, GY - 5, 3, 2, FLOWERS[Math.floor(hash(x) * FLOWERS.length)]); box(c, x + 2, GY - 3, 1, 3, M[3]); } }
  }
};

// ---------------------------------------------------------------------------------------------------------------

/** Behind everything that moves. `piperX`: the horn she's talking out of, if she is. */
export const drawGlenBack = (c: Ctx, state: GameState, piperX: number | null) => {
  const v = viewOf(state);
  drawSetsBack(c, state, v);     // (the gorges' depths, the meadow's far edge and its rainbow, the lair's back wall)
  drawFloor(c, v);
  drawGiants(c, v);
  drawLights(c, v);
  drawSetsFar(c, state, v);      // (the mine's head frame)
  drawUnder(c, v);
  drawSetsMid(c, state, v);      // (the mine's hill, its rails and cart; the lair's bones and gold; the queue's crowd)
  drawProps(c, v);
  drawNearGround(c, state, v);
  drawSetsNear(c, state, v, piperX); // (the gorges' faces, the solids, the cottage, the ride's front, the shelves, the PA horns)
  // (the signs, on their posts)
  const signs: [number, string[], object?][] = [
    [470, ['THE ENCHANTED GLEN', 'MIND THE MUSHROOMS']], [1580, ['TOADSTOOL HOLLOW']], [2620, ['THE BRIAR PATCH', 'PLEASE STAY ON THE PATH']],
    [4080, ['THE STORYBOOK BRIDGE', 'CLOSED FOR REFURBISHMENT'], { warn: true }], [5420, ["THE WITCH'S COTTAGE", 'DO NOT EAT THE HOUSE']],
    [7540, ['THE DWARF MINE', 'HARD HATS REQUIRED']], [GAP2.b + 80, ['UNICORN MEADOW', 'NO RIDING THE UNICORNS']],
    [11120, ["THE DRAGON'S LAIR", 'THE BONES ARE FIBERGLASS']], [13250, ['WAIT TIME', '3 SUITORS'], { board: '#3B0764' }],
  ];
  for (const [x, words, o] of signs) if (onScreen(state, X(x) - 160, X(x) + 160)) storySign(c, X(x), GY, words, o as { warn?: boolean });
};

/** The lamps after dark: the lanterns along the path, the set pieces' (the gate's, the cottage's windows, the mine's,
 *  the lair's torches, the ride's door), the toadstools' glow. */
export const glenLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const v = viewOf(state), out: Light[] = [];
  const add = (x: number, y: number, r: number, a: number, color = '#FFD08A') => { if (x > state.camera.x - 200 && x < state.camera.x + 1000) out.push({ x, y, r, a, color }); };
  for (const [rx, kind] of PROPS) if (kind === 'lantern') { const [x, y] = at(v.eye, X(rx) + 23, GY - 118, PROP_D); add(x, y, 120, 0.55); }
  for (const x of [1760, 2430, 2900, 3150, 3400, 10420, 10660, 11560]) add(X(x), GY - 90, 90, 0.35, '#FBCFE8');
  for (const [x] of PA_AT) add(X(x), GY - 220, 70, 0.3, '#F9A8D4');
  out.push(...setLamps(state, v));
  return out;
};
