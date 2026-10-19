// The frontier wilds, drawn (the final pass: peak SNES). It's the PARK's wilderness, and it shows: the mountains near
// are painted flats on their 2x4s (the real Rockies are out past them, far off), the boulders and bluffs are
// fiberglass (seams, bolts, a STAFF ONLY hatch, the white gelcoat where the paint's chipped), there are bear-proof trash
// cans and a speaker in a fake rock piping in birdsong. Back to front: the far off (far.ts), the water's surfaces and
// the ground going back (ground.ts, water.ts) with what stands on it back there (painted flats, pines, a split-rail
// fence), the water's body, the floor coming toward him and the raised ground's faces, then at the play plane the
// boulder, the shelves, the hive's oak, the props, the tracks, the signs.

import type { GameState } from '../../../m1/game/core/state';
import { GY } from '../geometry';
import { parkSign } from '../kit';
import { type Ctx, type View, box, checker, mix, hash, at, poly, viewOf, still, atDepth, seen, part, post, ball, pine, clump, fiberglass, timeOfDay, farTint, skyAt, dimmed, near, INK, FAR, FLAT_D, FIBER, FIBER_LIP, STONE, STEEL, PLY, PLANK, NEEDLE, BARK, OAK, DIRT, GRASS } from './paint';
import { GROUND, LEDGES, BOULDERS, SIGNS, HIVES, BED, X, Y } from './layout';
import { drawShelf } from './hazards';
import { drawFar } from './far';
import { drawGoingBack, drawPlayPlane, drawTracks } from './ground';
import { drawWaterTop, drawWaterBack } from './water';

// ---------------------------------------------------------------------------------------------------------------
// The backdrop

export const drawWildsBackdrop = (c: Ctx, state: GameState) => drawFar(c, state);

// ---------------------------------------------------------------------------------------------------------------
// Stood back on the ground going back (dimmed: none of it's somewhere to stand)

/** A painted mountain flat stood up behind the trail: a peak painted on a plywood sheet (too blue, the snow brushed
 *  on with its drips, painted pines along its foot), its raw ply edge, 2x4 braces and sandbags behind it, a stencil. */
const paintFlat = (g: Ctx, seed: number) => {
  const P = dimmed(['#2A2C64', '#3C448A', '#5260AE', '#7280C8', '#A0AADE', '#D8A8C0'], 0.12);
  const SN = dimmed(['#9AA8D0', '#D4DCF0', '#F4F8FF'], 0.1), BR = dimmed(PLY, 0.14), SB = dimmed(['#5A4C38', '#7A6A50', '#9C8C6E', '#BCAE8E'], 0.14);
  const W = 190, Hh = 200;
  const pts: [number, number][] = [[0, 0], [30, -110], [58, -92], [96, -Hh], [134, -120], [160, -136], [W, 0]];
  // (behind: the braces down to the ground, sandbags on their feet)
  for (const bx of [40, 110, 160]) {
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(bx, -90); g.lineTo(bx + 40, 0); g.stroke();
    g.strokeStyle = BR[2]; g.lineWidth = 4; g.beginPath(); g.moveTo(bx, -90); g.lineTo(bx + 40, 0); g.stroke();
    g.strokeStyle = BR[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(bx - 1, -90); g.lineTo(bx + 39, 0); g.stroke();
    box(g, bx + 30, -9, 22, 9, INK); box(g, bx + 31, -8, 20, 8, SB[1]); box(g, bx + 31, -8, 20, 3, SB[2]); box(g, bx + 33, -8, 8, 1, SB[3]); box(g, bx + 40, -8, 1, 8, SB[0]);
  }
  // (the sheet's thickness: the raw ply along its cut edge)
  g.fillStyle = BR[4]; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x + 4, y + 2) : g.moveTo(x + 4, y + 2))); g.closePath(); g.fill();
  g.fillStyle = INK; g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y - 1) : g.moveTo(x - 1, y))); g.closePath(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
  g.save(); g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  for (let i = 0; i < 6; i++) box(g, 0, -Hh + (i * Hh) / 6, W, Hh / 6 + 1, [P[3], P[3], P[2], P[2], P[1], P[0]][i]);
  checker(g, 0, -Hh / 2, W, 2, P[2], 0);
  // (the painted light down the peak's left: brush strokes)
  for (let s = 0; s < 10; s++) { g.strokeStyle = s % 2 ? P[4] : P[5]; g.lineWidth = 3; g.beginPath(); g.moveTo(94 - s * 3, -Hh + 8 + s * 6); g.lineTo(70 - s * 8, -Hh + 50 + s * 10); g.stroke(); }
  // (the snow cap with its drips)
  g.fillStyle = SN[1]; g.beginPath(); g.moveTo(62, -132); g.lineTo(96, -Hh); g.lineTo(128, -128); g.lineTo(112, -138); g.lineTo(100, -124); g.lineTo(84, -140); g.closePath(); g.fill();
  g.fillStyle = SN[2]; g.beginPath(); g.moveTo(68, -136); g.lineTo(95, -Hh + 2); g.lineTo(88, -150); g.closePath(); g.fill();
  for (let d = 0; d < 5; d++) box(g, 70 + d * 11, -134 + (d % 2) * 4, 2, 8 + hash(seed + d) * 12, SN[0]);
  // (painted pines along the foot, too even)
  for (let tx = 8; tx < W; tx += 14) { g.fillStyle = dimmed(['#1A3428'])[0]; g.beginPath(); g.moveTo(tx, -44 - ((tx * 5) % 9)); g.lineTo(tx + 8, -18); g.lineTo(tx - 8, -18); g.closePath(); g.fill(); }
  box(g, 0, -20, W, 20, dimmed(['#1A3428'])[0]);
  g.restore();
  // (the stencil on its face: the park's)
  box(g, 120, -30, 50, 7, P[1]);
  for (let i = 0; i < 8; i++) box(g, 123 + i * 6, -28, 4, 3, P[4]);
};

/** A split-rail fence along the back (the park's: it keeps the guests on the trail), zigzag rails on stakes. */
const paintFence = (g: Ctx, len: number) => {
  const R = dimmed(PLANK, 0.1);
  for (let x = 0; x <= len; x += 46) {
    box(g, x - 3, -34, 6, 34, INK); box(g, x - 2, -33, 4, 33, R[3]); box(g, x - 2, -33, 1, 33, R[5]);
    if (x < len) for (const y of [-28, -14]) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 46, y + 4); g.stroke(); g.strokeStyle = R[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 46, y + 4); g.stroke(); g.strokeStyle = R[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 1); g.lineTo(x + 46, y + 3); g.stroke(); }
  }
};

/** What stands back on the ground going back: [x from the section's start, what, depth]. Placed on long flat runs,
 *  clear of the raised ground (nothing back there may show over anything nearer). */
const BACK: [number, 'flat' | 'pine' | 'fence', number][] = [
  [880, 'flat', FLAT_D], [600, 'pine', 0.8], [1150, 'fence', 0.86], [4300, 'flat', FLAT_D], [4120, 'pine', 0.78], [5100, 'pine', 0.8],
  [5900, 'fence', 0.86], [9500, 'pine', 0.8], [10150, 'pine', 0.76], [13100, 'flat', FLAT_D], [13650, 'fence', 0.86], [13950, 'pine', 0.8],
  [18200, 'flat', FLAT_D], [18500, 'pine', 0.78], [18900, 'fence', 0.86],
];

const drawStoodBack = (c: Ctx, v: View) => {
  // (the deepest first)
  for (const [rx, k, d] of [...BACK].sort((p, q) => p[2] - q[2])) {
    const x = X(rx), w = k === 'flat' ? 240 : k === 'fence' ? 280 : 80;
    if (!seen(v, x - 40, x + w, d)) continue;
    atDepth(c, v.eye, d, () => {
      if (k === 'flat') still(c, `flat-${rx}`, x, GY, -10, -214, 260, 218, g => paintFlat(g, rx));
      else if (k === 'fence') still(c, 'fence', x, GY, -6, -40, 290, 42, g => paintFence(g, 276));
      else still(c, `bpine-${rx % 3}`, x, GY, -50, -190, 100, 192, g => pine(g, 0, 0, 170 + (rx % 3) * 10, 70, rx % 3 + 21, dimmed(NEEDLE, 0.16), dimmed(BARK, 0.16)));
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane

/** The fiberglass boulder: its face (molded lumps, seams and bolts, the STAFF ONLY hatch, a vent), its rounded top lit
 *  (standable), its top going back, its sides going back on the side he's looking at. */
const boulder = (c: Ctx, v: View, a: number, b: number, h: number) => {
  const xa = X(a), xb = X(b), top = Y(h), w = xb - xa, eye = v.eye;
  const F = near(FIBER), L = near(FIBER_LIP), D = 0.84;
  // (its sides going back)
  for (const [e, side] of [[xa, -1], [xb, 1]] as const) {
    if ((eye.x - e) * side <= 1) continue;
    const pt = (k: number, y: number) => at(eye, e, y, 1 - (1 - D) * k);
    for (let j = 0; j < 3; j++) poly(c, [pt(j / 3, top + 18), pt((j + 1) / 3, top + 18), pt((j + 1) / 3, GY), pt(j / 3, GY)], F[2 - j > 0 ? 2 - j : 1]);
    const [x1, t1] = pt(1, top + 18), [, b1] = pt(1, GY);
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(e, top + 18); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
  }
  // (its top going back: banded lighter at the front)
  if (eye.y < top - 1) {
    for (let i = 0; i < 3; i++) { const d0 = 1 - ((1 - D) * i) / 3, d1 = 1 - ((1 - D) * (i + 1)) / 3; poly(c, [at(eye, xa + 14, top, d0), at(eye, xb - 14, top, d0), at(eye, xb - 14, top, d1), at(eye, xa + 14, top, d1)], [F[5], F[4], F[4]][i]); }
  }
  still(c, `boulder-${a}`, xa, top, -4, -4, w + 8, GY - top + 8, g => {
    const shape = () => g.roundRect(0, 0, w, GY - top + 2, [26, 26, 0, 0]);
    g.fillStyle = INK; g.beginPath(); g.roundRect(-2, -2, w + 4, GY - top + 6, [28, 28, 0, 0]); g.fill();
    g.save(); g.beginPath(); shape(); g.clip();
    fiberglass(g, 0, 0, w, GY - top + 2, F, a);
    // (shaded down its right, darker toward the foot)
    box(g, w * 0.72, 0, w * 0.28, GY - top, F[2]); checker(g, w * 0.72 - 4, 0, 4, GY - top, F[2], 0);
    box(g, w - 8, 0, 8, GY - top, F[1]);
    for (let i = 0; i < 4; i++) box(g, 0, GY - top - 40 + i * 10, w, 10, mix(F[3], INK, 0.1 + i * 0.08));
    g.restore();
    // (the lit lip round its top)
    g.strokeStyle = L[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(2, 26); g.arcTo(2, 2, 26, 2, 24); g.lineTo(w - 26, 2); g.arcTo(w - 2, 2, w - 2, 26, 24); g.stroke();
    g.strokeStyle = L[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(14, 4); g.lineTo(w - 26, 3); g.stroke();
    // (the hatch: a steel door in the rock, STAFF ONLY on its plate, a padlock; a louvered vent above it)
    const hx = Math.round(w * 0.4), hh = 72, hy = GY - top - hh;
    box(g, hx - 2, hy - 2, 48, hh + 2, INK); box(g, hx, hy, 44, hh, F[1]);
    box(g, hx + 2, hy + 2, 40, hh - 2, mix(F[2], STEEL[3], 0.5)); box(g, hx + 2, hy + 2, 2, hh - 2, mix(F[4], STEEL[5], 0.5)); box(g, hx + 38, hy + 2, 4, hh - 2, mix(F[1], STEEL[2], 0.5));
    box(g, hx + 6, hy + 8, 32, 10, STEEL[5]); box(g, hx + 7, hy + 9, 30, 8, '#E8E4D8');
    for (let i = 0; i < 6; i++) box(g, hx + 9 + i * 5, hy + 11, 3, 4, '#3F3F46');
    box(g, hx + 34, hy + 36, 6, 8, INK); box(g, hx + 35, hy + 37, 4, 6, '#C8A040'); box(g, hx + 35, hy + 37, 1, 2, '#F2D27A');
    box(g, hx + 4, hy - 26, 36, 16, INK); box(g, hx + 5, hy - 25, 34, 14, STEEL[2]);
    for (let i = 0; i < 4; i++) { box(g, hx + 6, hy - 23 + i * 3, 32, 2, STEEL[4]); box(g, hx + 6, hy - 22 + i * 3, 32, 1, STEEL[1]); }
  });
};

/** A bear-proof trash can (the park's: steel, a latched lid, PACK IT IN, PACK IT OUT on its plate). */
const trashCan = (c: Ctx, x: number) => still(c, 'trash', x, GY, -18, -50, 36, 52, g => {
  const S = near(['#142014', '#1E3020', '#2C422C', '#3A563A', '#4E6E4C', '#6A8A66', '#94B08E']);
  box(g, -14, -42, 28, 42, INK); box(g, -13, -41, 26, 41, S[3]); box(g, -13, -41, 5, 41, S[4]); box(g, -12, -41, 1, 41, S[5]); box(g, 8, -41, 5, 41, S[2]);
  for (const y of [-34, -12]) { box(g, -13, y, 26, 2, S[1]); box(g, -13, y - 1, 26, 1, S[5]); }
  box(g, -16, -48, 32, 8, INK); box(g, -15, -47, 30, 6, S[2]); box(g, -15, -47, 30, 2, S[4]);
  box(g, -5, -45, 10, 3, STEEL[4]); box(g, -4, -44, 8, 1, STEEL[6]);
  box(g, -10, -29, 20, 12, INK); box(g, -9, -28, 18, 10, PLANK[4]); box(g, -9, -28, 18, 1, PLANK[6]);
  for (let i = 0; i < 4; i++) box(g, -7 + i * 4, -26, 2, 2, PLANK[1]);
  for (let i = 0; i < 3; i++) box(g, -6 + i * 4, -22, 2, 2, PLANK[1]);
  box(g, -15, -2, 30, 2, S[0]);
});

/** A fake rock with a speaker grille in it (birdsong, piped in), and the notes coming out of it. */
const speakerRock = (c: Ctx, x: number, f: number) => {
  still(c, 'speaker', x, GY, -30, -28, 60, 30, g => {
    const F = near(FIBER);
    part(g, () => g.ellipse(0, 0, 26, 22, 0, Math.PI, 0), F, -26, -22, 52, 22, 1.5);
    box(g, -10, -14, 20, 10, INK); box(g, -9, -13, 18, 8, STEEL[2]);
    for (let i = 0; i < 5; i++) { box(g, -8 + i * 4, -12, 2, 6, STEEL[0]); box(g, -7 + i * 4, -12, 1, 6, STEEL[4]); }
    box(g, 12, -4, 10, 2, '#18181B'); box(g, 20, -2, 6, 2, '#18181B');
  });
  if (f % 120 < 60) {
    const t = f % 60, nx = x + 12 + t * 0.3, ny = GY - 26 - t * 0.35;
    box(c, nx - 1, ny - 1, 5, 4, INK); box(c, nx, ny, 3, 2, '#F8FAFC'); box(c, nx + 3, ny - 8, 1, 9, '#F8FAFC');
    if (t > 20) { box(c, nx + 9, ny - 10, 3, 2, '#F8FAFC'); box(c, nx + 12, ny - 17, 1, 8, '#F8FAFC'); box(c, nx + 12, ny - 17, 4, 1, '#F8FAFC'); }
  }
};

/** The hive's tree: a big oak, its trunk in stepped bark, a bough out over the hive's spot, its crown in leaf clumps
 *  (the far ones darker). Stood behind the play plane's things. */
const hiveTree = (c: Ctx, hx: number, hy: number, h: number) => still(c, `oak-${h}`, hx, hy, -230, -260, 330, GY - hy + 270, g => {
  const B = near(BARK), O = near(OAK), bottom = GY - hy;
  // (the trunk: flaring at its roots, bark in stepped ridges, lit down the left)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-104, -170); g.lineTo(-62, -170); g.lineTo(-54, bottom - 10); g.lineTo(-40, bottom + 1); g.lineTo(-126, bottom + 1); g.lineTo(-110, bottom - 10); g.closePath(); g.fill();
  g.save(); g.beginPath(); g.moveTo(-102, -170); g.lineTo(-64, -170); g.lineTo(-56, bottom - 10); g.lineTo(-44, bottom); g.lineTo(-122, bottom); g.lineTo(-108, bottom - 10); g.closePath(); g.clip();
  box(g, -130, -170, 90, bottom + 172, B[3]); box(g, -130, -170, 34, bottom + 172, B[4]); box(g, -78, -170, 40, bottom + 172, B[2]);
  for (let y = -166; y < bottom; y += 7) for (let x = -120; x < -48; x += 10) box(g, x + ((y * 3) % 6), y, 2, 5, x < -90 ? B[5] : B[1]);
  g.restore();
  // (the bough out over the hive, tapering, lit along its top)
  for (const [col, lw, dy] of [[INK, 16, 0], [B[3], 12, 0], [B[5], 3, -4]] as [string, number, number][]) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(-74, -70 + dy); g.quadraticCurveTo(-30, -44 + dy, 8, -34 + dy); g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(4, -35); g.lineTo(26, -30); g.stroke(); g.strokeStyle = B[3]; g.lineWidth = 3; g.stroke();
  // (the crown: leaf clumps, the back ones darker)
  const crown: [number, number, number, number, number][] = [[-150, -170, 52, 40, 2], [-20, -160, 46, 36, 2], [-84, -214, 66, 50, 1], [-130, -130, 48, 34, 0], [-36, -120, 44, 30, 0], [-84, -150, 56, 40, 0], [14, -74, 30, 22, 0]];
  for (const [cx, cy, rw, rh, sh] of crown) clump(g, cx, cy, rw, rh, cx * 3 + cy, O, sh);
  g.lineCap = 'butt';
}, );

/** The long river's overhang: the shelf of fake rock out over the water on its steel strut down into it. */
const overhang = (c: Ctx, v: View, a: number, b: number, h: number) => {
  const S = near(STEEL), x = X(a) + 12, top = Y(h) + 22, foot = GY + 120;
  box(c, x - 1, top, 10, foot - top, INK); box(c, x, top, 8, foot - top, S[3]); box(c, x, top, 2, foot - top, S[5]); box(c, x + 6, top, 2, foot - top, S[1]);
  for (let y = top + 10; y < foot; y += 24) box(c, x - 2, y, 12, 3, S[2]);
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 8, top + 50); c.lineTo(x + 60, top + 4); c.stroke(); c.strokeStyle = S[3]; c.lineWidth = 3; c.stroke();
  drawShelf(c, X(a), X(b), Y(h), false, 0, 0, v.eye);
};

/** The flat ground a sign at rx (on ground of height h) stands on: its run (world x); null in the water. */
const signGround = (rx: number, h: number): [number, number] | null => {
  const run = GROUND.find(([a, b, h1, h2]) => h1 === h && h2 === h && rx >= a && rx <= b);
  return run ? [X(run[0]), X(run[1])] : null;
};

/** Props of the park's, along the way: [x, what]. */
const PROPS: [number, 'trash' | 'speaker'][] = [
  [380, 'trash'], [1300, 'speaker'], [3950, 'trash'], [6000, 'speaker'],
  [9350, 'trash'], [12950, 'speaker'], [14060, 'trash'], [17850, 'trash'],
];

export const drawWildsBack = (c: Ctx, state: GameState) => {
  const v = viewOf(state), f = state.frame;
  // Going back: the water's surfaces, the ground strips and their faces, what stands back there
  drawWaterTop(c, v);
  drawGoingBack(c, v);
  drawStoodBack(c, v);
  // The play plane: the water's body, the floor coming toward him, the raised ground
  drawWaterBack(c, state);
  drawPlayPlane(c, v);
  // (the hives' oaks: behind everything else at the play plane)
  for (const [rx, h] of HIVES) if (rx < 10000 && seen(v, X(rx) - 240, X(rx) + 120)) hiveTree(c, X(rx), Y(h), h);
  for (const [a, b, h] of BOULDERS) if (seen(v, X(a) - 60, X(b) + 60)) boulder(c, v, a, b, h);
  for (const [a, b, h] of LEDGES) {
    if (!seen(v, X(a) - 40, X(b) + 40)) continue;
    if (a >= 15900 && a <= 17000) overhang(c, v, a, b, h); else drawShelf(c, X(a), X(b), Y(h), false, 0, 0, v.eye);
  }
  for (const [rx, k] of PROPS) {
    if (!seen(v, X(rx) - 40, X(rx) + 40)) continue;
    if (k === 'trash') trashCan(c, X(rx)); else speakerRock(c, X(rx), f);
  }
  // (the tracks, from the last mile on to the station)
  drawTracks(c, v, X(18700), X(19440));
  // (the signs: planks on posts, burned in (the park's), painted on (its warnings))
  for (const [rx, h, words, warn] of SIGNS) {
    if (!seen(v, X(rx) - 150, X(rx) + 150)) continue;
    const on = signGround(rx, h);
    parkSign(c, X(rx), Y(h), words, { warn, seed: rx, cap: rx === 260, ...(on ? { within: on } : { wade: BED }) });
  }
  void ball; void post; void hash; void skyAt; void farTint; void timeOfDay; void STONE; void DIRT; void GRASS; void FAR;
};
