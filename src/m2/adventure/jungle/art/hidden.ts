// The hidden cave behind the gorge's falls (hidden.ts), drawn. Still art painted once, in tiles (stamped: TILE square,
// world-aligned, so they meet without a seam): the rock it's cut out of (stone in a stepped ramp, inked seams, darker
// the deeper; no lit flat tops on the walls: nothing reads as a ledge that isn't), the hollow (a dark back wall, the
// light from the mouth and the falls fading off into it, darker the further in), the pits (banded off into black, no
// floor ever showing), the things he stands on with their lit lips (the shelf in the mouth, the gallery's ledges, the
// pillar in the tunnel, the passage's ledge and floor), the roots the vines hang off (twisted, dark on top: not to stand
// on), the thorny roots (caveTraps.ts: dark tangles bristling with pale spikes), the plunge pool's surface over the
// gorge's rock, the crack the cannon's shot goes up, the dressing (moss, little dark stalactites, a rusted Jungle Cruise
// pump pipe, a lost skipper's hat, a skull in the thorns). Live over it: the mist drafting out of the mouth, a glint in
// the dark (the tell from the vine), the stalactites that drop (stamped once: pale and wet, dripping; shaking, falling),
// the falls' light rippling on the passage's back wall, the heart canister (bobbing, beating, glowing), the cannon; and
// in front of him, the falls' overflow pouring over the passage's front, and the spray when it blasts out over the gap.

import type { GameState } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../../m1/constants';
import { stamp, hazeBands, steppedGlow } from '../../../intro/art/kit';
import { drawCannon, JUNGLE } from '../../../upgrades/returnCannon';
import { CAVE, PASSAGE, POOL_Y, HEART_X, FALLS, SHAFT_B, LEDGES_HI, PITS_HI, PILLARS_LO, SPIKE_Y, CAVE_VINES, crackX, heartThere, hiddenCannon, hiddenTraps, hiddenFeeds, FEED_LEN } from '../hidden';
import { DRIPS, THORNS, SPRAY, sprayPhase } from '../caveTraps';
import { drawLeapers, drawRedWater } from '../piranhas';
import { type Ctx, INK, box, checker, mix, hash, poly, leaf, fern, LEAF, BARK, MOSS, ROCK, PIX } from './paint';
import { GY } from '../../geometry';

const TILE = 320, BLEED = 2;
/** What's painted (world): the rock round the cave (the camera's kept to it in there: hidden.ts), under the gorge, under
 *  the far bank. */
const AREA = { x0: CAVE.a - 60, x1: PASSAGE.b + 520, y0: 60, y1: 1960 };
const DEEP = 1960;
/** The tunnel's dark: black from here down (no floor; the tunnel's camera shows a little under its floor: hidden.ts). */
const LO_BLACK = CAVE.lo.floor + 56;
/** The cliff's face round the mouth: its rock's jagged edge out into the gorge, from the overlook's top down to the pool. */
const LIP = { x0: CAVE.wall - 30, x1: CAVE.wall + 26, y0: 90, y1: POOL_Y + 6 };

/** The rock's ramp (a cave's: the jungle's stone, sunk toward a dark green-black), its back wall's (much darker). */
const STONE = ROCK.map(c => mix(c, '#0C1610', 0.26));
const BACK = ROCK.map(c => mix(c, '#030806', 0.8));
const WET = ['#0A1A1E', '#10262C', '#183440', '#22465A', '#3A6A80', '#6AA0B4'];
/** Thorny roots: the root's ramp (a dark wine-brown), the spikes' (old bone). */
const THORN = ['#140A0C', '#26141A', '#3C2028', '#58303A', '#7A4A50'];
const SPIKE = ['#5A4C36', '#9C8C68', '#D8CCA8', '#F4ECD4'];
const VOID = '#010302';

/** The hollow's pieces (world rects) under the ground line: the gallery and the hall down to the ledges' tops, the
 *  shaft, the tunnel (down a way: its dark's painted over it), the passage. (Over the ground line, the mouth: mouthPts.) */
const HOLLOW: [number, number, number, number][] = [
  [CAVE.a, GY, CAVE.shelf.a, CAVE.hi.floor + 4],
  [CAVE.a, CAVE.hi.floor, SHAFT_B, CAVE.lo.ceil],
  ...PITS_HI.map(([a, b]) => [a, CAVE.hi.floor, b, SPIKE_Y + 4] as [number, number, number, number]),
  [CAVE.a, CAVE.lo.ceil, CAVE.b, CAVE.lo.floor],
  [CAVE.b - 2, PASSAGE.ceil, PASSAGE.b, PASSAGE.floor],
];
/** The cave over the ground line, open in the cliff's face: its outline (jagged up its left side, along the gallery's
 *  top, up to the hall's, ragged down to the shelf at the face), from the ground line on its left round to the face. */
const mouthPts = (): [number, number][] => {
  const pts: [number, number][] = [[CAVE.a, GY]];
  for (let y = GY - 20; y > CAVE.hi.ceil + 10; y -= 22) pts.push([CAVE.a + (hash(y * 0.31) - 0.5) * 12, y]);
  for (let x = CAVE.a; x < CAVE.hall - 10; x += 20) pts.push([x, CAVE.hi.ceil + (hash(x * 0.17) - 0.4) * 12 + Math.sin(x * 0.02) * 3]);
  for (let y = CAVE.hi.ceil; y > CAVE.ceil + 10; y -= 16) pts.push([CAVE.hall + (hash(y * 0.7) - 0.5) * 10, y]);
  for (let x = CAVE.hall; x < CAVE.wall - 30; x += 20) pts.push([x, CAVE.ceil + (hash(x * 0.17) - 0.3) * 18 + Math.sin(x * 0.02) * 4]);
  pts.push([CAVE.wall - 26, CAVE.mouthTop - 6], [CAVE.wall - 12, CAVE.mouthTop + 6]);
  // (the opening: ragged down to the shelf, the face's rock biting in and out of it)
  for (let y = CAVE.mouthTop + 4; y < CAVE.shelf.y - 6; y += 14) pts.push([CAVE.wall + 2 + Math.round((hash(y * 0.53) - 0.5) * 14 + Math.sin(y * 0.05) * 4), y]);
  pts.push([CAVE.wall + 6, CAVE.shelf.y]);
  return pts;
};
/** What's solid inside it, each with its lit top: the shelf, the gallery's ledges (down to the pits' dark), the pillar
 *  in the tunnel. (The passage's ledge and floor: footing on its own.) */
const SOLIDS: [number, number, number, number][] = [
  [CAVE.shelf.a, CAVE.shelf.y, CAVE.wall, CAVE.lo.ceil],
  ...LEDGES_HI.map(([a, b]) => [a, CAVE.hi.floor, b, CAVE.lo.ceil] as [number, number, number, number]),
];
/** The vines' roots: from the rock (a little along the ceiling) to where each swinging vine hangs. */
const ROOTS: [number, number, number, number][] = CAVE_VINES.filter(v => v.kind === 'swing').map((v, i) => {
  const ceil = v.y > CAVE.lo.ceil - 20 ? CAVE.lo.ceil : CAVE.hi.ceil, side = i % 2 ? 1 : -1;
  return [v.x + side * 34, ceil, v.x, v.y];
});

// ---------------------------------------------------------------------------------------------------------------
// Painting the still part (world coordinates)

/** The stones' courses: level rows GH tall, blocks about GW long (their lengths vary a little), every other row half a
 *  block on, their ends square (all from the world position: the same in every tile, and in every patch of rock painted,
 *  so patches meet without a seam). */
const GW = 50, GH = 30;
const endX = (i: number, k: number) => i * GW + (((k % 2) + 2) % 2) * GW * 0.5 + Math.round((hash(i * 7.13 + k * 3.71) - 0.5) * 12);
const corner = (i: number, k: number, low: number): [number, number] => [endX(i, k), (k + low) * GH];
/** Stone over (x0..x1, y0..y1): irregular blocks, each lit at its upper left (never a full lit top), inked between;
 *  `dark(y)`: how far it's sunk into the dark there (0..1). */
/** The tile being painted (world): only the stones near it are (the rest are clipped away anyway). */
let near = { x0: -Infinity, y0: -Infinity, x1: Infinity, y1: Infinity };
const stones = (g: Ctx, x0: number, y0: number, x1: number, y1: number, r: string[], dark: (y: number) => number, seed: number) => {
  const cx0 = Math.max(x0, near.x0 - GW), cx1 = Math.min(x1, near.x1 + GW), cy0 = Math.max(y0, near.y0 - GH), cy1 = Math.min(y1, near.y1 + GH);
  if (cx0 >= cx1 || cy0 >= cy1) return;
  // (kept to its own patch: a course never spills over a ledge's lip or into the next patch)
  g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  box(g, x0, y0, x1 - x0, y1 - y0, mix(r[1], '#020504', dark((y0 + y1) / 2)));
  for (let k = Math.floor(cy0 / GH) - 1; k <= Math.ceil(cy1 / GH); k++) for (let i = Math.floor(cx0 / GW) - 2; i <= Math.ceil(cx1 / GW) + 1; i++) {
    const q = [corner(i, k, 0), corner(i + 1, k, 0), corner(i + 1, k, 1), corner(i, k, 1)];
    if (q[1][0] < x0 - 4 || q[0][0] > x1 + 4) continue;
    const cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, cy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4;
    const dk = dark(cy), h = hash(i * 1.37 + k * 5.11 + seed);
    const col = (n: number) => mix(r[Math.max(0, Math.min(r.length - 1, n))], '#020504', dk);
    const sh = (s: number, dx = 0, dy = 0) => q.map(([px, py]) => [cx + (px - cx) * s + dx, cy + (py - cy) * s + dy] as [number, number]);
    poly(g, q, mix(INK, '#000000', 0.3));
    poly(g, sh(0.9), col(2 + Math.floor(h * 2)));
    // (lit at the upper left, inside the stone; shaded at the lower right)
    poly(g, sh(0.62, -3, -3), col(3 + Math.floor(h * 2)));
    poly(g, sh(0.3, -6, -5), col(5));
    poly(g, [sh(0.9)[2], sh(0.9)[3], [cx, cy + GH * 0.22]], col(1));
    if (h > 0.86) checker(g, cx - 10, cy - 4, 18, PIX, col(4));
    // (moss in the seams now and then, wet stains)
    if (hash(i * 4.4 + k * 0.7 + seed) > 0.8) { box(g, q[0][0] + 2, q[0][1] - 1, 12, 3, mix(MOSS[2], '#020504', dk)); box(g, q[0][0] + 4, q[0][1] + 2, 2, 4 + h * 6, mix(MOSS[1], '#020504', dk)); }
  }
  g.restore();
};
/** Darker toward one side, in banded steps (a dither column at each step): from a0 at x0 to a1 at x1 (x1 may be left of
 *  x0). */
const sideBands = (g: Ctx, x0: number, y0: number, x1: number, y1: number, a0: number, a1: number, bands: number) => {
  const w = (x1 - x0) / bands;
  for (let i = 0; i < bands; i++) {
    const a = a0 + (a1 - a0) * (i / (bands - 1)), bx0 = Math.round(x0 + i * w), bx1 = Math.round(x0 + (i + 1) * w);
    g.fillStyle = `rgba(2, 5, 4, ${a.toFixed(3)})`; g.fillRect(Math.min(bx0, bx1), y0, Math.abs(bx1 - bx0), y1 - y0);
    if (i + 1 < bands && a > 0) checker(g, bx1 - (bx1 > bx0 ? PIX : 0), y0, PIX, y1 - y0, `rgba(2, 5, 4, ${Math.min(1, a).toFixed(3)})`);
  }
};
/** How far into the dark it is: from the mouth's level down. */
const sunk = (y: number) => Math.max(0, Math.min(0.55, (y - 600) / 1800));
const sunkBack = (y: number) => Math.max(0.15, Math.min(0.8, 0.15 + (y - 360) / 1200));

/** A thing he stands on: rock, its top lit (moss along the lip, a stone highlight, grass), its face going down dark. */
const footing = (g: Ctx, x0: number, y0: number, x1: number, y1: number) => {
  stones(g, x0, y0, x1, y1, STONE, sunk, 0);
  // (the shade under the lip and down its face)
  hazeBands(g, x0, y0 + 6, x1 - x0, Math.min(60, y1 - y0 - 6), '#020504', 0.0, 0.35, 4);
  box(g, x0, y0 - 1, x1 - x0, 6, mix(MOSS[2], '#000000', sunk(y0) * 0.5));
  box(g, x0, y0 - 1, x1 - x0, 3, mix(MOSS[4], '#000000', sunk(y0) * 0.5));
  box(g, x0, y0 - 1, x1 - x0, 1, mix(MOSS[5], '#000000', sunk(y0) * 0.4));
  for (let x = x0 + 3; x < x1 - 3; x += 5) if (hash(x * 0.37) > 0.45) box(g, x, y0 - 3 - Math.floor(hash(x) * 3), 1, 3, mix(MOSS[4], '#000000', sunk(y0) * 0.5));
  box(g, x0, y0 + 5, x1 - x0, 1, INK);
};

/** A root out of the rock to where a vine hangs off it: twisted, thick at the rock, bark dark on top (lit underneath,
 *  from the cave below: never a lit top, it's not to stand on); a knot where the vine's tied on. */
const root = (g: Ctx, [x0, y0, x1, y1]: [number, number, number, number], seed: number) => {
  const n = 10, pts: [number, number][] = [];
  for (let k = 0; k <= n; k++) { const t = k / n; pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + Math.sin(t * Math.PI * 2 + seed) * 4 * (1 - t) - Math.sin(t * Math.PI) * 6]); }
  const line = (col: string, w0: number, w1: number, dy: number) => {
    g.strokeStyle = col; g.lineCap = 'round';
    for (let k = 1; k <= n; k++) { g.lineWidth = w0 + (w1 - w0) * (k / n); g.beginPath(); g.moveTo(pts[k - 1][0], pts[k - 1][1] + dy); g.lineTo(pts[k][0], pts[k][1] + dy); g.stroke(); }
  };
  line(INK, 15, 8, 0); line(BARK[1], 12, 6, 0); line(BARK[3], 6, 2.5, 2.5); line(BARK[0], 5, 2, -3);
  g.lineCap = 'butt';
  // (rootlets dangling off it)
  for (let k = 2; k < n; k += 2) { const [px, py] = pts[k]; const len = 8 + hash(seed + k) * 22; for (let d = 0; d < len; d += 2) box(g, px + Math.sin(d * 0.3 + k) * 1.5, py + 4 + d, 1, 2, BARK[2]); }
  // (the knot the vine hangs off)
  g.fillStyle = INK; g.beginPath(); g.ellipse(x1, y1, 8, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BARK[2]; g.beginPath(); g.ellipse(x1, y1, 6.5, 4.5, 0, 0, Math.PI * 2); g.fill();
  box(g, x1 - 3, y1 + 1, 5, 2, BARK[4]);
};

/** A stalactite down off a ceiling. */
const stalactite = (g: Ctx, x: number, y: number, h: number, w: number) => {
  poly(g, [[x - w / 2 - 1, y], [x + w / 2 + 1, y], [x + 1, y + h + 1]], INK);
  poly(g, [[x - w / 2, y], [x + w / 2, y], [x, y + h]], STONE[2]);
  poly(g, [[x - w / 2, y], [x - w / 6, y], [x - 1, y + h * 0.8]], STONE[4]);
  box(g, x - 1, y + h - 2, 2, 2, WET[4]);
};

/** The hollow: the back wall far behind (dark stone, light from the mouth up top, from the falls along the passage),
 *  darker the further in from the mouth, dark gathered round its edges. */
const hollow = (g: Ctx) => {
  const mp = mouthPts();
  const trace = (pts: [number, number][]) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); };
  // (the cave over the ground line: the back wall inside its outline, the dark under its ragged top)
  g.save(); trace(mp); g.closePath(); g.clip();
  stones(g, CAVE.a - 20, CAVE.ceil - 24, CAVE.wall + 20, CAVE.shelf.y + 2, BACK, sunkBack, 11);
  hazeBands(g, CAVE.a - 20, CAVE.ceil - 10, CAVE.wall - CAVE.a + 22, 56, '#020504', 0.7, 0.0, 5);
  hazeBands(g, CAVE.a - 20, CAVE.hi.ceil - 6, CAVE.hall - CAVE.a + 20, 50, '#020504', 0.7, 0.0, 5);
  g.restore();
  for (const [a, b, c, d] of HOLLOW) stones(g, a, b, c, d, BACK, sunkBack, 11);
  // (light in at the mouth: banded, falling off into the hall)
  g.save(); trace(mp); g.closePath(); g.rect(CAVE.a, GY, CAVE.shelf.a - CAVE.a, CAVE.hi.floor + 4 - GY);
  for (const [a, b] of PITS_HI) g.rect(a, CAVE.hi.floor, b - a, SPIKE_Y + 4 - CAVE.hi.floor);
  g.clip();
  for (let i = 0; i < 6; i++) {
    g.fillStyle = `rgba(150, 190, 140, ${0.035 + i * 0.012})`;
    g.beginPath(); g.ellipse(CAVE.wall, (CAVE.mouthTop + CAVE.shelf.y) / 2, 300 - i * 46, 170 - i * 24, 0, 0, Math.PI * 2); g.fill();
  }
  // (and the further along the gallery from it, the darker, in steps)
  sideBands(g, CAVE.a - 20, CAVE.ceil - 30, CAVE.hall - 60, SPIKE_Y + 10, 0.47, 0, 8);
  g.restore();
  // (light from the falls along the passage, blue; a little of it out into the tunnel's end)
  g.save(); g.beginPath(); g.rect(CAVE.a, CAVE.lo.ceil, CAVE.b - CAVE.a, CAVE.lo.floor - CAVE.lo.ceil); g.rect(CAVE.b - 2, PASSAGE.ceil, PASSAGE.b - CAVE.b + 2, PASSAGE.floor - PASSAGE.ceil); g.clip();
  for (let i = 0; i < 6; i++) {
    g.fillStyle = `rgba(120, 190, 220, ${0.03 + i * 0.012})`;
    g.beginPath(); g.ellipse((FALLS.a + FALLS.b) / 2, (PASSAGE.ceil + PASSAGE.floor) / 2, 320 - i * 46, 110 - i * 14, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = `rgba(110, 170, 200, ${0.02 + i * 0.008})`;
    g.beginPath(); g.ellipse(PASSAGE.ledge + 40, PASSAGE.floor - 70, 260 - i * 40, 120 - i * 18, 0, 0, Math.PI * 2); g.fill();
  }
  // (the tunnel darker the further from the passage's mouth, in steps)
  sideBands(g, CAVE.a, CAVE.lo.ceil, PASSAGE.ledge - 160, CAVE.lo.floor, 0.41, 0, 8);
  // (the back wall goes on down past the floor's level into the dark: banded off toward black at it, the same all along)
  hazeBands(g, CAVE.a, CAVE.lo.floor - 120, PASSAGE.b - CAVE.a, 120, '#010302', 0, 0.86, 6);
  g.restore();
  // (dark gathered along its walls and under its ceilings)
  hazeBands(g, CAVE.b - 2, PASSAGE.ceil, PASSAGE.b - CAVE.b + 2, 26, '#020504', 0.55, 0.0, 4);
  hazeBands(g, CAVE.a, CAVE.lo.ceil, CAVE.b - CAVE.a, 40, '#020504', 0.6, 0.0, 4);
  sideBands(g, CAVE.a, GY, CAVE.a + 40, CAVE.lo.floor, 0.4, 0, 4);
  sideBands(g, PASSAGE.b, PASSAGE.ceil, PASSAGE.b - 40, PASSAGE.floor, 0.4, 0, 4);
  // (inked round it: the mouth's ragged edge (not down the face: it's open there), the walls under the ground line)
  g.strokeStyle = INK; g.lineWidth = 3; g.lineJoin = 'round';
  trace(mp.slice(0, -2)); g.stroke();
  const seg = (x0: number, y0: number, x1: number, y1: number) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  seg(CAVE.a, GY, CAVE.a, CAVE.lo.floor);
  seg(SHAFT_B, CAVE.lo.ceil, CAVE.b, CAVE.lo.ceil); seg(CAVE.b, CAVE.lo.ceil, CAVE.b, PASSAGE.ceil);
  seg(CAVE.b, PASSAGE.ceil, PASSAGE.b, PASSAGE.ceil); seg(PASSAGE.b, PASSAGE.ceil, PASSAGE.b, PASSAGE.floor);
  g.lineJoin = 'miter';
};

/** The gallery's spike pits (hidden.ts SPIKE_Y): the back wall down into each, shadowed deeper in and along its sides,
 *  their walls inked, and the floor: a mat of thorny roots bristling up with pale spikes, bones caught in it. Nothing lit
 *  along it: it's not footing. */
const spikePits = (g: Ctx) => {
  PITS_HI.forEach(([a, b], n) => {
    const top = CAVE.hi.floor, y = SPIKE_Y;
    hazeBands(g, a, top + 4, b - a, y - top, '#020504', 0.1, 0.6, 5);
    sideBands(g, a, top + 4, a + 18, y + 4, 0.55, 0, 3);
    sideBands(g, b, top + 4, b - 18, y + 4, 0.55, 0, 3);
    box(g, a - 1, top + 5, 2, y - top, INK); box(g, b - 1, top + 5, 2, y - top, INK);
    // (the mat: roots wound along the floor, over the rock)
    box(g, a, y + 2, b - a, 18, THORN[0]);
    for (let k = 0; k < 4; k++) {
      const pts: [number, number][] = [];
      for (let x = a - 4; x <= b + 4; x += 10) pts.push([x, y + 3 + k * 4 + Math.sin(x * 0.07 + k * 2.1 + n) * 3]);
      stem(g, pts, 6 - k);
    }
    // (bones in it: a skull, a long bone, ribs)
    const sx = Math.round(a + (b - a) * (0.3 + hash(n * 3.3) * 0.4));
    skull(g, sx, y - 2);
    poly(g, [[sx + 30, y + 1], [sx + 62, y - 6], [sx + 63, y - 3], [sx + 31, y + 4]], INK);
    poly(g, [[sx + 31, y], [sx + 61, y - 6], [sx + 62, y - 4], [sx + 32, y + 2]], '#B8B0A0');
    box(g, sx + 28, y - 3, 5, 6, '#DCD4C4'); box(g, sx + 58, y - 9, 5, 6, '#DCD4C4');
    for (let r = 0; r < 4; r++) { g.beginPath(); g.arc(sx - 34 + r * 6, y + 2, 9, Math.PI * 1.05, Math.PI * 1.75); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.strokeStyle = '#B8B0A0'; g.lineWidth = 1.5; g.stroke(); }
    // (the spikes, up out of it, thick)
    for (let x = a + 3; x < b - 3; x += 6) {
      const h = hash(x * 0.29 + n);
      spike(g, x, y + 4, -Math.PI / 2 + (h - 0.5) * 0.9, 12 + h * 10);
    }
    for (let x = a + 6; x < b - 6; x += 17) spike(g, x, y + 10, -Math.PI / 2 + (hash(x) - 0.5) * 1.4, 8);
  });
};
/** The tunnel's dark: under its floor's level, black (nothing under it); the cave's left wall banded off into it. */
const tunnelDark = (g: Ctx) => {
  const F = CAVE.lo.floor;
  hazeBands(g, CAVE.a, F - 2, PASSAGE.ledge - CAVE.a, 16, '#010302', 0.9, 1, 3);
  box(g, CAVE.a, F + 14, PASSAGE.ledge - CAVE.a, DEEP - F - 14, VOID);
  hazeBands(g, AREA.x0, F - 70, CAVE.a - AREA.x0, LO_BLACK - F + 70, '#010302', 0, 1, 6);
  box(g, AREA.x0, LO_BLACK, CAVE.a - AREA.x0, DEEP - LO_BLACK, VOID);
};
/** A pillar or a ledge down out of the tunnel: its sides inked and shaded, sunk into the black under its lip (`open`:
 *  its right side drops into the dark too, not just its left). */
const sinkInto = (g: Ctx, x0: number, x1: number, open: boolean) => {
  const F = CAVE.lo.floor;
  sideBands(g, x0, F + 6, x0 + 16, LO_BLACK, 0.5, 0, 3);
  if (open) sideBands(g, x1, F + 6, x1 - 16, LO_BLACK, 0.5, 0, 3);
  hazeBands(g, x0, F + 8, x1 - x0, LO_BLACK - F - 8, '#010302', 0.1, 1, 6);
  box(g, x0, LO_BLACK, x1 - x0, DEEP - LO_BLACK, VOID);
  box(g, x0 - 1, F + 6, 2, LO_BLACK - F - 6, INK);
  if (open) box(g, x1 - 1, F + 6, 2, LO_BLACK - F - 6, INK);
};

/** The cliff's face round the mouth: a jagged edge of the gorge's rock (the outside's, lit) out over the cut between the
 *  cave and the gorge, from the overlook's top down to the pool; round the opening only its lip over it and the shelf's
 *  end under it (the opening stays open), a shadowed rim just inside. */
const mouthLip = (g: Ctx) => {
  const W = CAVE.wall, R = ROCK;
  g.save(); g.beginPath(); g.rect(W - 46, CAVE.mouthTop - 10, 50, CAVE.shelf.y - CAVE.mouthTop + 10); g.clip();
  sideBands(g, W + 4, CAVE.mouthTop - 10, W - 46, CAVE.shelf.y, 0.5, 0, 4);
  g.restore();
  const chunk = (cx: number, cy: number, w: number, h: number, seed: number) => {
    const pts: [number, number][] = [];
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.2, r = 0.82 + hash(seed + k) * 0.3; pts.push([cx + Math.cos(a) * w * 0.5 * r, cy + Math.sin(a) * h * 0.5 * r]); }
    const sc = (s: number, dx: number, dy: number) => pts.map(([x, y]) => [cx + (x - cx) * s + dx, cy + (y - cy) * s + dy] as [number, number]);
    poly(g, sc(1.14, 0, 0), INK);
    poly(g, pts, R[3]);
    poly(g, sc(0.7, -w * 0.08, -h * 0.1), R[4]);
    poly(g, sc(0.36, -w * 0.16, -h * 0.2), R[5]);
    box(g, cx - w * 0.3, cy + h * 0.24, w * 0.6, 2, R[2]);
    if (hash(seed * 1.7) > 0.5) { box(g, cx - w * 0.3, cy - h * 0.46, w * 0.4, 3, MOSS[2]); box(g, cx - w * 0.25, cy - h * 0.46, w * 0.25, 1, MOSS[4]); }
  };
  const run = (y0: number, y1: number) => {
    for (let y = y0; y < y1; y += 22) {
      const h = hash(y * 0.71);
      chunk(W + 2 + (h - 0.5) * 12, y + 11, 26 + h * 14, 24 + hash(y * 1.3) * 10, y);
    }
  };
  run(LIP.y0, CAVE.mouthTop - 8);
  run(CAVE.shelf.y + 24, LIP.y1 - 10);
  // (the shelf's end: rounded off, mossy, in the light)
  chunk(W + 4, CAVE.shelf.y + 14, 22, 22, 3.3);
};

/** Thorny roots (caveTraps.ts THORNS): a tangle of dark twisted roots bristling with pale spikes, poking out. Down a
 *  ledge's face ('face': rooted in the rock, spikes out over the pit) or up out of the dark ('rise': stems up out of
 *  the black, a crown of tangle at the top). Painted with the rock (they don't move). */
const spike = (g: Ctx, x: number, y: number, ang: number, len: number) => {
  const ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa * 2.6, ny = ca * 2.6;
  const tip: [number, number] = [x + ca * len, y + sa * len];
  poly(g, [[x + nx * 1.5, y + ny * 1.5], [x - nx * 1.5, y - ny * 1.5], [tip[0] + ca * 1.5, tip[1] + sa * 1.5]], INK);
  poly(g, [[x + nx, y + ny], [x - nx, y - ny], tip], SPIKE[1]);
  poly(g, [[x + nx, y + ny], [x, y], tip], SPIKE[2]);
  box(g, Math.round(tip[0]) - 1, Math.round(tip[1]) - 1, 2, 2, SPIKE[3]);
};
const stem = (g: Ctx, pts: [number, number][], w: number) => {
  const line = (col: string, ww: number, dx: number, dy: number) => { g.strokeStyle = col; g.lineWidth = ww; g.lineCap = 'round'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy))); g.stroke(); };
  line(INK, w + 3, 0, 0); line(THORN[2], w, 0, 0); line(THORN[3], Math.max(1, w - 4), -1, -1); line(THORN[1], Math.max(1, w - 5), 1.5, 1.5);
  g.lineCap = 'butt';
};
/** A skull lying with its jaw's bottom at (kx, y). */
const skull = (g: Ctx, kx: number, y: number) => {
  const ky = y - 8;
  g.fillStyle = INK; g.beginPath(); g.ellipse(kx, ky, 9, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#B8B0A0'; g.beginPath(); g.ellipse(kx, ky, 7.5, 6.5, 0, 0, Math.PI * 2); g.fill();
  box(g, kx - 4, ky + 4, 8, 4, '#B8B0A0'); box(g, kx - 4, ky - 2, 3, 3, INK); box(g, kx + 1, ky - 2, 3, 3, INK); box(g, kx - 1, ky + 2, 2, 2, INK);
  box(g, kx - 3, ky + 6, 1, 2, INK); box(g, kx, ky + 6, 1, 2, INK); box(g, kx - 5, ky - 5, 4, 2, '#DCD4C4');
};
const thorns = (g: Ctx, t: (typeof THORNS)[number], seed: number) => {
  const sp = (x: number, y: number, ang: number, len: number) => spike(g, x, y, ang, len);
  const st = (pts: [number, number][], w: number) => stem(g, pts, w);
  if (t.kind === 'face') {
    // (roots down the face: rooted in the rock, wound over each other, spikes out over the pit and up and down it)
    const x0 = t.x, x1 = t.x + t.w, y0 = t.y, y1 = SPIKE_Y + 6;
    for (let k = 0; k < 4; k++) {
      const pts: [number, number][] = [];
      for (let y = y0 - 6; y <= y1; y += 12) pts.push([x0 + 2 + (Math.sin(y * 0.05 + k * 1.9) * 0.5 + 0.5) * (x1 - x0 - 2) - k, y]);
      st(pts, 6 - k);
    }
    for (let y = y0; y < y1 - 6; y += 9) {
      const h = hash(seed + y * 0.37);
      sp(x0 + 6 + h * (x1 - x0 - 4), y + h * 4, -0.2 + (h - 0.5) * 1.2, 9 + h * 6);
      if (h > 0.5) sp(x0 + 4, y + 4, (h > 0.75 ? -1 : 1) * 1.1, 6);
    }
    // (sunk into the pit's dark with it)
    hazeBands(g, x0 - 4, y0 + 30, x1 - x0 + 24, y1 - y0 - 36, '#010302', 0, 0.45, 4);
    return;
  }
  // (rising: stems up out of the black, a tangle crowning them, spikes all over it, a skull caught in it)
  const x0 = t.x, x1 = t.x + t.w, top = t.y, cxm = (x0 + x1) / 2;
  for (let k = 0; k < 5; k++) {
    const bx = x0 + 6 + (k / 4) * (t.w - 12), pts: [number, number][] = [];
    for (let y = LO_BLACK + 60; y >= top + 8; y -= 12) pts.push([bx + Math.sin(y * 0.04 + k * 2.3) * 9, y]);
    st(pts, 9 - (k % 2) * 2);
  }
  for (let k = 0; k < 7; k++) {
    const a0 = x0 - 4 + hash(seed + k) * (t.w + 8), y = top + 6 + hash(seed + k * 3.1) * 26, pts: [number, number][] = [];
    for (let i = 0; i <= 6; i++) pts.push([a0 + (i - 3) * 7, y + Math.sin(i * 1.3 + k) * 5]);
    st(pts, 5);
  }
  for (let k = 0; k < 26; k++) {
    const h = hash(seed + k * 1.71), sx = x0 - 6 + h * (t.w + 12), sy = top + 2 + hash(seed + k * 2.9) * 70;
    const ang = sy < top + 18 ? -Math.PI / 2 + (h - 0.5) * 1.6 : (sx < cxm ? Math.PI : 0) + (h - 0.5) * 1.4;
    sp(sx, sy, ang, 8 + h * 7);
  }
  // (a skull caught in it: something that came in low)
  skull(g, cxm + 8, top + 38);
  // (into the black with the stems)
  hazeBands(g, x0 - 16, top + 60, t.w + 32, LO_BLACK - top - 60, '#010302', 0, 1, 5);
};

/** The plunge pool's surface over the gorge's rock (the falls come down into it far back), and its rock's top. */
const pool = (g: Ctx) => {
  const a = PASSAGE.a, b = PASSAGE.b, y = POOL_Y;
  // (the pool's depth, cut away: deep green-blue water down to the rock it lies on, darker the deeper, the piranhas
  // dark shapes in it)
  const DEPTH = ['#1E4C5A', '#173E4C', '#11303C', '#0C242E', '#081A22', '#051216'];
  DEPTH.forEach((col, k) => { box(g, a, y + k * 20, b - a, 20, col); if (k) checker(g, a, y + k * 20, b - a, PIX, DEPTH[k - 1]); });
  for (let k = 0; k < 40; k++) {
    const fx = a + 20 + hash(k * 3.7) * (b - a - 40), fy = y + 22 + hash(k * 1.9) * 80, dir = hash(k * 5.3) < 0.5 ? -1 : 1, col = DEPTH[Math.min(5, 2 + Math.floor((fy - y) / 30))];
    poly(g, [[fx - 6 * dir, fy - 3], [fx + 5 * dir, fy - 2], [fx + 7 * dir, fy], [fx + 5 * dir, fy + 2], [fx - 6 * dir, fy + 3], [fx - 9 * dir, fy - 3], [fx - 9 * dir, fy + 3]], mix(col, '#000000', 0.45));
    box(g, fx + 3 * dir, fy - 1, 1, 1, mix('#C82A26', col, 0.6));
  }
  box(g, a, y + 120, b - a, 2, INK);
  box(g, a, y - 8, b - a, 14, WET[2]); box(g, a, y - 8, b - a, 3, WET[4]); box(g, a, y - 8, b - a, 1, WET[5]);
  for (let x = a; x < b; x += 9) if (hash(x * 0.21) > 0.4) box(g, x, y - 7 + Math.floor(hash(x) * 4), 6, 1, '#E6F4F8');
};

/** The crack the cannon's shot goes up: through the passage's ceiling and the slab, narrowing up to the pool; daylight
 *  down it, in bands. */
const crack = (g: Ctx) => {
  const gx = crackX();
  const pts: [number, number][] = [[gx - 44, PASSAGE.ceil + 2], [gx - 30, PASSAGE.slabTop], [gx - 18, 920], [gx - 8, POOL_Y + 8], [gx + 10, POOL_Y + 8], [gx + 22, 930], [gx + 34, PASSAGE.slabTop], [gx + 46, PASSAGE.ceil + 2]];
  poly(g, pts.map(([x, y]) => [x + (x < gx ? -2 : 2), y] as [number, number]), INK);
  poly(g, pts, BACK[1]);
  for (let i = 0; i < 5; i++) {
    const k = i / 5;
    g.fillStyle = `rgba(210, 240, 230, ${0.05 + k * 0.05})`;
    g.beginPath(); g.moveTo(gx - 6 * (1 - k), POOL_Y + 8); g.lineTo(gx + 8 * (1 - k), POOL_Y + 8); g.lineTo(gx + 60 - k * 40, PASSAGE.floor); g.lineTo(gx - 64 + k * 40, PASSAGE.floor); g.closePath(); g.fill();
  }
};

/** The passage's dressing: puddles on its floor, the rusted pump pipe along its back wall (JUNGLE CRUISE PUMP 2), a lost
 *  skipper's hat on a stone, a low mossy rock for the heart (round, dark: not a step), drips of moss down the ceiling. */
const passage = (g: Ctx) => {
  const F = PASSAGE.floor, a = PASSAGE.a;
  // (the pipe, on brackets, down the back wall, rust bleeding down from its joints; a valve wheel; stenciled)
  const py = PASSAGE.ceil + 44;
  box(g, a - 60, py - 1, 620, 14, INK); box(g, a - 60, py, 620, 12, '#5A3A22'); box(g, a - 60, py, 620, 3, '#8A5A32'); box(g, a - 60, py + 9, 620, 3, '#3A2414');
  for (let x = a - 40; x < a + 560; x += 90) { box(g, x, py - 3, 8, 18, INK); box(g, x + 1, py - 2, 6, 16, '#6A4A2E'); box(g, x + 2, py + 14, 2, 10 + hash(x) * 20, 'rgba(120, 60, 24, 0.5)'); box(g, x - 2, py + 14, 12, 26, 'rgba(10, 8, 6, 0.4)'); }
  const vx = a + 300;
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(vx, py - 10, 11, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = '#9A2A1A'; g.lineWidth = 3; g.beginPath(); g.arc(vx, py - 10, 11, 0, Math.PI * 2); g.stroke();
  box(g, vx - 11, py - 11, 22, 2, '#9A2A1A'); box(g, vx - 1, py - 21, 2, 22, '#9A2A1A'); box(g, vx - 2, py - 3, 4, 6, INK);
  g.font = '6px "Press Start 2P"'; g.textAlign = 'left'; g.fillStyle = 'rgba(220, 200, 150, 0.55)'; g.fillText('JUNGLE CRUISE PUMP 2', a + 40, py + 9);
  g.textAlign = 'left';
  // (the floor: wet stone, puddles holding the falls' light)
  for (let x = a + 30; x < PASSAGE.b - 60; x += 70) {
    if (hash(x * 0.11) < 0.45) continue;
    const w = 26 + hash(x) * 40;
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, F + 6, w / 2 + 1, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = WET[2]; g.beginPath(); g.ellipse(x, F + 6, w / 2, 3, 0, 0, Math.PI * 2); g.fill();
    box(g, x - w / 4, F + 5, w / 3, 1, WET[4]);
  }
  // (the lost skipper's hat on a stone: a khaki pith helmet, its band, JUNGLE CRUISE on it)
  const hx = a + 150, hy = F - 14;
  g.fillStyle = INK; g.beginPath(); g.ellipse(hx, F - 6, 18, 8, 0, Math.PI, 0); g.fill();
  g.fillStyle = BACK[3]; g.beginPath(); g.ellipse(hx, F - 6, 16, 6, 0, Math.PI, 0); g.fill();
  g.fillStyle = INK; g.beginPath(); g.ellipse(hx + 2, hy, 17, 5, -0.15, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8A7A4E'; g.beginPath(); g.ellipse(hx + 2, hy, 15.5, 4, -0.15, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK; g.beginPath(); g.ellipse(hx + 2, hy - 5, 10, 9, -0.15, Math.PI, 0); g.fill();
  g.fillStyle = '#A8986A'; g.beginPath(); g.ellipse(hx + 2, hy - 5, 8.5, 7.5, -0.15, Math.PI, 0); g.fill();
  g.fillStyle = '#C8B888'; g.beginPath(); g.ellipse(hx - 1, hy - 8, 3.5, 2.5, -0.15, 0, Math.PI * 2); g.fill();
  box(g, hx - 7, hy - 4, 18, 2, '#5A3A1A');
  // (the heart's rock: low, round, mossy, dark)
  const rx = HEART_X;
  g.fillStyle = INK; g.beginPath(); g.ellipse(rx, F, 26, 15, 0, Math.PI, 0); g.fill();
  g.fillStyle = BACK[4]; g.beginPath(); g.ellipse(rx, F, 24, 13, 0, Math.PI, 0); g.fill();
  g.fillStyle = BACK[5]; g.beginPath(); g.ellipse(rx - 7, F - 7, 9, 4, 0, 0, Math.PI * 2); g.fill();
  for (let x = rx - 18; x < rx + 18; x += 4) box(g, x, F - 12 + Math.abs(x - rx) * 0.3, 3, 2, mix(MOSS[2], '#000000', 0.45));
  // (moss and roots hanging off the passage's ceiling)
  for (let x = a + 10; x < PASSAGE.b - 10; x += 22) { const len = 4 + hash(x * 0.3) * 18; box(g, x, PASSAGE.ceil, 3, len, mix(MOSS[1], '#000000', 0.4)); if (hash(x) > 0.6) box(g, x + 1, PASSAGE.ceil + len, 1, 3, WET[3]); }
  for (let x = a + 40; x < PASSAGE.b - 40; x += 61) if (hash(x * 0.7) > 0.5) stalactite(g, x, PASSAGE.ceil, 10 + hash(x) * 16, 8 + hash(x * 2) * 6);
};

/** The cave's dressing: little dark stalactites along its ceilings (dull and dry, short: not the pale wet ones that
 *  drop, and never near one), moss and ferns round the mouth where the light gets in, a puddle or two on the ledges. */
const cavern = (g: Ctx) => {
  const clear = (x: number) => DRIPS.every(d => Math.abs(d.x - x) > 46) && CAVE_VINES.every(v => v.kind !== 'swing' || Math.abs(v.x - x) > 30);
  const row = (x0: number, x1: number, y: number) => { for (let x = x0 + 20; x < x1 - 10; x += 34) { const sx = x + hash(x) * 14; if (clear(sx)) stalactite(g, sx, y, 10 + hash(x * 1.7) * 16, 8 + hash(x * 2.3) * 6); } };
  row(CAVE.hall, CAVE.b, CAVE.ceil + 12);
  row(CAVE.a, CAVE.hall, CAVE.hi.ceil + 8);
  row(SHAFT_B, CAVE.b, CAVE.lo.ceil);
  // (ferns and moss at the mouth, in the light)
  for (let k = 0; k < 5; k++) fern(g, CAVE.wall - 6 - k * 22, CAVE.mouthTop + 4, -(16 + hash(k) * 10), k + 3, 0.2, LEAF, 3);
  for (let y = CAVE.mouthTop + 10; y < CAVE.shelf.y - 10; y += 12) leaf(g, CAVE.wall - 2, y, 12, Math.PI * 0.85 + hash(y) * 0.4, LEAF, 3);
  fern(g, CAVE.shelf.a + 14, CAVE.shelf.y, 22, 9, 0.1, LEAF, 3);
  // (puddles on the ledges)
  for (const [a, b] of LEDGES_HI) { const x = (a + b) / 2 + (hash(a) - 0.5) * 30; g.fillStyle = INK; g.beginPath(); g.ellipse(x, CAVE.hi.floor + 7, 16, 3.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = WET[2]; g.beginPath(); g.ellipse(x, CAVE.hi.floor + 7, 15, 2.5, 0, 0, Math.PI * 2); g.fill(); box(g, x - 6, CAVE.hi.floor + 6, 6, 1, WET[4]); }
};

const paintAll = (g: Ctx) => {
  // (the rock: everything in the area, the gorge's only below its pool; all one rock, the same courses everywhere)
  const L = AREA.x0, R = AREA.x1;
  stones(g, L, CAVE.hi.ceil - 30, CAVE.a, GY, STONE, sunk, 0);
  stones(g, L, GY, PASSAGE.a, DEEP, STONE, sunk, 0);
  stones(g, PASSAGE.a, POOL_Y, R, DEEP, STONE, sunk, 0);
  hollow(g);
  for (const s of SOLIDS) footing(g, s[0], s[1], s[2], s[3]);
  // (the rock under the gallery (the tunnel's roof) darker the deeper, the same all along: no seams between its ledges,
  // nor where it meets the rock under the gorge (darkened the same, down to the passage's ceiling))
  const shade = (x0: number, x1: number, ya: number, yb: number, y0: number, y1: number, col: string, dither: boolean) => {
    const t = Math.max(ya, y0), u = Math.min(yb, y1);
    if (u <= t) return;
    g.fillStyle = col; g.fillRect(x0, t, x1 - x0, u - t);
    if (dither && t === y0) checker(g, x0, t, x1 - x0, PIX, col);
  };
  for (let k = 0; k < 10; k++) {
    const y0 = CAVE.hi.floor + 40 + k * 44, y1 = y0 + 44, col = `rgba(1, 3, 2, ${Math.min(0.55, (k + 1) * 0.07).toFixed(3)})`;
    shade(SHAFT_B, CAVE.b, CAVE.hi.floor, CAVE.lo.ceil, y0, y1, col, k > 0);
    shade(CAVE.b, CAVE.wall, CAVE.hi.floor, PASSAGE.ceil, y0, y1, col, k > 0);
    shade(CAVE.wall, AREA.x1, POOL_Y, PASSAGE.ceil, y0, y1, col, k > 0);
  }
  crack(g);
  pool(g);
  // (the step down off the shelf onto the first ledge: its face inked, shaded)
  box(g, CAVE.shelf.a - 1, CAVE.shelf.y + 5, 2, CAVE.hi.floor - CAVE.shelf.y - 5, INK);
  sideBands(g, CAVE.shelf.a + 1, CAVE.shelf.y + 6, CAVE.shelf.a + 15, CAVE.hi.floor, 0.3, 0, 3);
  spikePits(g);
  // (the shaft's rim: the far ledge's end where the shaft goes down past it, inked)
  box(g, SHAFT_B - 1, CAVE.hi.floor + 6, 2, CAVE.lo.ceil - CAVE.hi.floor - 6, INK);
  tunnelDark(g);
  for (const [a, b] of PILLARS_LO) { footing(g, a, CAVE.lo.floor, b, LO_BLACK + 10); sinkInto(g, a, b, true); }
  footing(g, PASSAGE.ledge, PASSAGE.floor, PASSAGE.b, LO_BLACK + 10);
  sinkInto(g, PASSAGE.ledge, AREA.x1, false);
  THORNS.forEach((t, i) => thorns(g, t, i * 7.7 + 3));
  ROOTS.forEach((r, i) => root(g, r, i * 2.3));
  cavern(g);
  passage(g);
  mouthLip(g);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const onScreen = (state: GameState, x0: number, y0: number, x1: number, y1: number) => {
  const cam = state.camera;
  return x1 > cam.x - 40 && x0 < cam.x + CANVAS_WIDTH + 40 && y1 > cam.y - 40 && y0 < cam.y + CANVAS_HEIGHT + 40;
};

/** World space, after the jungle's own (and before the vines). */
export const drawHiddenBack = (c: Ctx, state: GameState) => {
  const cam = state.camera, f = state.frame;
  // (only where it's on screen: and the overlook's face above the cavern stays the jungle's)
  if (!onScreen(state, AREA.x0, AREA.y0, AREA.x1, AREA.y1)) return;
  for (let ty = Math.floor(Math.max(AREA.y0, cam.y - 20) / TILE) * TILE; ty < Math.min(AREA.y1, cam.y + CANVAS_HEIGHT + 20); ty += TILE) {
    for (let tx = Math.floor(Math.max(AREA.x0, cam.x - 20) / TILE) * TILE; tx < Math.min(AREA.x1, cam.x + CANVAS_WIDTH + 20); tx += TILE) {
      // (what of the tile's in the area: the gorge above its pool and the open air over the overlook aren't painted)
      if (!tileWanted(tx, ty)) continue;
      c.save(); c.translate(tx, ty);
      // (each tile painted a little past its edges, overlapping its neighbors': no hairline seam between them when the
      // camera's between pixels)
      stamp(c, `jg-hid-${tx}-${ty}`, -BLEED, -BLEED, TILE + BLEED * 2, TILE + BLEED * 2, g => {
        g.save(); g.translate(-tx, -ty);
        g.beginPath(); areaPath(g); g.clip();
        g.beginPath(); g.rect(tx - BLEED, ty - BLEED, TILE + BLEED * 2, TILE + BLEED * 2); g.clip();
        near = { x0: tx - BLEED, y0: ty - BLEED, x1: tx + TILE + BLEED, y1: ty + TILE + BLEED };
        paintAll(g);
        near = { x0: -Infinity, y0: -Infinity, x1: Infinity, y1: Infinity };
        g.restore();
      });
      c.restore();
    }
  }
  // ---- Live
  // (mist drafting out of the mouth into the gorge)
  if (onScreen(state, CAVE.b - 100, CAVE.mouthTop - 60, CAVE.wall + 260, CAVE.shelf.y + 40)) {
    for (let k = 0; k < 9; k++) {
      const t = ((f * 0.004 + hash(k * 3.3)) % 1), mx = CAVE.wall - 40 + t * 230, my = CAVE.mouthTop + 60 + hash(k) * 140 - t * 60;
      const a = Math.sin(t * Math.PI) * 0.16;
      c.fillStyle = `rgba(214, 232, 224, ${a.toFixed(3)})`;
      c.beginPath(); c.ellipse(Math.round(mx), Math.round(my), 26 + t * 30, 9 + t * 8, 0, 0, Math.PI * 2); c.fill();
    }
    // (the glint in the dark: something wet catching the light, now and then)
    const gl = (f % 150) / 150, gx = CAVE.wall - 70, gy = CAVE.mouthTop + 92;
    if (gl < 0.24) {
      const s = Math.sin((gl / 0.24) * Math.PI) * 7;
      box(c, gx - s, gy, s * 2 + 1, 1, '#FFFDE8'); box(c, gx, gy - s, 1, s * 2 + 1, '#FFFDE8');
      box(c, gx - 1, gy - 1, 3, 3, '#FFFFFF');
    }
  }
  // (the stalactites that drop (caveTraps.ts): hanging, now and then a drip off the tip; shaking at the tell, cracked at
  // the root, dripping hard; falling)
  const traps = hiddenTraps(state);
  DRIPS.forEach((d, i) => {
    const s = traps.drips[i];
    if (s.st === 'gone' || !onScreen(state, d.x - 30, (s.st === 'fall' ? s.fy : d.y) - 10, d.x + 30, (s.st === 'fall' ? s.fy : d.y) + d.len + 140)) return;
    const y = s.st === 'fall' ? s.fy : d.y, dx = s.st === 'shake' ? ((f >> 1) % 2 ? 1 : -1) * (s.t > TELL_SHOW ? 2 : 1) : 0;
    c.save(); c.translate(Math.round(d.x + dx), Math.round(y));
    stamp(c, `jg-hid-drip-${d.len}-${s.st === 'hang' ? 0 : 1}`, -14, -8, 28, d.len + 12, g => paintDrip(g, d.len, s.st !== 'hang'));
    c.restore();
    if (s.st === 'hang') { const t = (f + i * 29) % 100; if (t < 40) box(c, d.x, d.y + d.len + 2 + t * t * 0.05, 1, 3, WET[5]); }
  });
  // (the falls' runoff, along the passage's floor and over its ledge's lip, pouring down into the tunnel's dark and gone)
  if (onScreen(state, PASSAGE.ledge - 30, PASSAGE.floor - 10, PASSAGE.ledge + 20, LO_BLACK + 60)) {
    const px = PASSAGE.ledge - 7, y0 = PASSAGE.floor - 3;
    // (a sheet of it, banded off into the black: painted once)
    c.save(); c.translate(px - 4, y0);
    stamp(c, 'jg-hid-pour', -4, 0, 24, 124, g => {
      for (let k = 0; k < 8; k++) { const w = 12 - Math.floor(k / 3) * 2; g.fillStyle = `rgba(150, 205, 228, ${(0.62 - k * 0.075).toFixed(3)})`; g.fillRect(2 + (12 - w) / 2, k * 15, w, 15); if (k < 7) checker(g, 2 + (12 - w) / 2, k * 15 + 13, w, 2, 'rgba(1, 3, 2, 0.35)'); }
      g.fillStyle = 'rgba(232, 248, 252, 0.7)'; g.fillRect(3, 0, 3, 60); g.fillRect(10, 0, 2, 34);
      g.fillStyle = 'rgba(210, 240, 250, 0.8)'; g.fillRect(-2, 0, 20, 3); g.fillRect(0, 3, 16, 2);
    });
    c.restore();
    for (let i = 0; i < 8; i++) {
      const t = ((f * 0.035 + hash(i * 4.1)) % 1), y = y0 + t * 120;
      c.fillStyle = `rgba(236, 250, 255, ${((1 - t) * 0.85).toFixed(3)})`; c.fillRect(px - 2 + (i % 4) * 3, Math.round(y), 2, 10);
    }
  }
  // (from down in the tunnel, the gallery's rock and spike pits overhead are dimmed: scenery, up there in the dark)
  const up = Math.max(0, Math.min(1, (cam.y - 420) / 260));
  if (up > 0 && onScreen(state, SHAFT_B, CAVE.hi.floor, CAVE.wall, CAVE.lo.ceil)) {
    // (off toward the passage in steps, so it never ends in an edge)
    const top = Math.max(cam.y - 10, CAVE.hi.floor - 40), x1 = CAVE.b - 160;
    c.fillStyle = `rgba(1, 3, 2, ${(up * 0.45).toFixed(3)})`;
    c.fillRect(SHAFT_B, top, x1 - SHAFT_B, CAVE.lo.ceil - top);
    for (let k = 1; k <= 4; k++) { c.fillStyle = `rgba(1, 3, 2, ${(up * 0.45 * (1 - k / 5)).toFixed(3)})`; c.fillRect(x1 + (k - 1) * 40, top, 40, CAVE.lo.ceil - top); }
  }
  // (the falls' light rippling on the passage's back wall, behind the overflow)
  if (onScreen(state, FALLS.a - 200, PASSAGE.ceil, FALLS.b + 200, PASSAGE.floor)) {
    c.save(); c.beginPath(); c.rect(FALLS.a - 200, PASSAGE.ceil + 4, FALLS.b - FALLS.a + 400, PASSAGE.floor - PASSAGE.ceil - 4); c.clip();
    for (let k = 0; k < 7; k++) {
      const y = PASSAGE.ceil + 16 + k * 24;
      for (let x = FALLS.a - 190; x < FALLS.b + 190; x += 6) {
        const w = Math.sin(x * 0.045 + f * 0.09 + k * 1.3) + Math.sin(x * 0.021 - f * 0.05 + k);
        if (w < 0.9) continue;
        const fall = 1 - Math.min(1, Math.abs(x - (FALLS.a + FALLS.b) / 2) / 260);
        c.fillStyle = `rgba(170, 225, 245, ${(0.1 + fall * 0.22).toFixed(3)})`;
        c.fillRect(x, Math.round(y + Math.sin(x * 0.07 + f * 0.06) * 3), 6, 2);
      }
    }
    c.restore();
  }
  // (the heart canister)
  if (heartThere() && onScreen(state, HEART_X - 60, PASSAGE.floor - 140, HEART_X + 60, PASSAGE.floor)) drawHeart(c, HEART_X, PASSAGE.floor - 64 + Math.round(Math.sin(f * 0.06) * 4), f);
  // (the cannon)
  const cn = hiddenCannon(state);
  if (onScreen(state, cn.x - 120, cn.y - 160, cn.x + 120, cn.y + 10) || cn.phase !== 'rest') drawCannon(c, cn, JUNGLE);
};

/** A stalactite that drops: long, pale and wet (not the little dull ones), in steps, a wet shine down it, a bead at the
 *  tip; `cracked`: split round the root where it's coming away. Hangs from (0, 0). */
const DRIP = ['#2E3E3C', '#4E6662', '#7C9690', '#AEC4BC', '#DCEAE4'];
const paintDrip = (g: Ctx, len: number, cracked: boolean) => {
  const w = 18;
  // (its root: a lump of the ceiling it comes out of)
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, w / 2 + 5, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = DRIP[1]; g.beginPath(); g.ellipse(0, -1, w / 2 + 3, 4.5, 0, 0, Math.PI * 2); g.fill();
  poly(g, [[-w / 2 - 1, 0], [w / 2 + 1, 0], [1, len + 1]], INK);
  poly(g, [[-w / 2, 0], [w / 2, 0], [0, len]], DRIP[2]);
  poly(g, [[w / 6, 0], [w / 2, 0], [0, len]], DRIP[1]);
  poly(g, [[-w / 2 + 2, 0], [-w / 6, 0], [-1, len * 0.85]], DRIP[3]);
  // (rings down it, the way it grew; the wet shine)
  for (let y = 8; y < len - 8; y += 9) { const hw = (w / 2) * (1 - y / len); box(g, -hw, y, hw * 2, 1, DRIP[1]); }
  box(g, -4, 3, 2, len * 0.55, DRIP[4]); box(g, -3, len * 0.6, 1, len * 0.15, DRIP[4]);
  // (the bead at its tip)
  box(g, -1, len - 1, 3, 3, INK); box(g, -1, len - 1, 2, 2, WET[5]); box(g, -1, len - 1, 1, 1, '#FFFFFF');
  if (cracked) {
    // (split round the root, chips coming off it)
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(-w / 2, 5); g.lineTo(-3, 9); g.lineTo(1, 5); g.lineTo(5, 10); g.lineTo(w / 2, 6); g.stroke();
    g.strokeStyle = DRIP[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(-w / 2 + 1, 7); g.lineTo(-3, 11); g.lineTo(1, 7); g.lineTo(5, 12); g.stroke();
    box(g, -w / 2 - 3, 4, 2, 2, DRIP[2]); box(g, w / 2 + 2, 8, 2, 2, DRIP[2]);
  }
};
/** The last part of the tell: shaking harder. */
const TELL_SHOW = 25;

/** In front of him: the spray when it blasts out of the passage over the last gap (a hiss and a mist first), and the
 *  falls' overflow pouring over the passage's front (he's behind it), its foam at the floor. */
export const drawHiddenFront = (c: Ctx, state: GameState) => {
  drawSpray(c, state);
  drawOverflow(c, state);
  drawFeeds(c, state);
};

/** Whatever else went into the plunge pool, being eaten: the boil, the red, a bone or two flung up out of it. */
const drawFeeds = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const fd of hiddenFeeds(state)) {
    const u = f - fd.at, k = 1 - u / FEED_LEN;
    if (!onScreen(state, fd.x - 80, POOL_Y - 80, fd.x + 80, POOL_Y + 20)) continue;
    drawRedWater(c, fd.x, POOL_Y, 20 + u * 0.8, k);
    if (u < FEED_LEN - 10) drawLeapers(c, fd.x, POOL_Y, f, u < 40 ? 10 : 4, 24, fd.at);
    if (u > 24 && u < 54) { const v = u - 24, bx = fd.x + v * 0.8, by = POOL_Y - 6 - v * 3 + v * v * 0.1; box(c, bx - 6, by - 1, 12, 3, INK); box(c, bx - 5, by, 10, 1, '#E2DACA'); box(c, bx - 7, by - 2, 3, 4, '#E2DACA'); box(c, bx + 4, by - 2, 3, 4, '#E2DACA'); }
  }
};

const drawSpray = (c: Ctx, state: GameState) => {
  const f = state.frame, { a, top, bot } = SPRAY;
  if (!onScreen(state, a - 40, top - 40, FALLS.a, bot + 20)) return;
  const sp = sprayPhase(f);
  if (sp.ph === 'calm') return;
  const mouth = PASSAGE.ledge + 50;
  if (sp.ph === 'tell') {
    // (the tell: spits of water out of the passage's mouth, a mist starting to roll out, more as it builds)
    const n = Math.floor(3 + sp.k * 9);
    for (let i = 0; i < n; i++) {
      const t = ((f * 0.05 + hash(i * 2.7)) % 1), sx = mouth - t * (60 + sp.k * 120), sy = top + 30 + hash(i * 5.3) * (bot - top - 50) + t * t * 30;
      box(c, Math.round(sx), Math.round(sy), 3, 2, 'rgba(220, 244, 252, 0.8)');
    }
    for (let k = 0; k < 3; k++) {
      c.fillStyle = `rgba(210, 236, 244, ${(0.06 + sp.k * 0.1).toFixed(3)})`;
      c.beginPath(); c.ellipse(mouth - 20 - k * 40 * sp.k, top + 70 + k * 30, 40 + k * 16, 16 + k * 6, 0, 0, Math.PI * 2); c.fill();
    }
    return;
  }
  // (the gust: streaks of spray tearing out left over the gap, thickest at the mouth, a wall of mist with them; dying
  // off at the end)
  const fade = sp.k > 0.8 ? 1 - (sp.k - 0.8) * 5 : Math.min(1, sp.k * 8);
  c.save(); c.beginPath(); c.rect(a - 40, top - 30, FALLS.a - a + 40, bot - top + 50); c.clip();
  for (let k = 0; k < 4; k++) {
    c.fillStyle = `rgba(214, 238, 246, ${((0.1 - k * 0.018) * fade).toFixed(3)})`;
    c.beginPath(); c.ellipse(mouth - 80 - k * 90, (top + bot) / 2 + Math.sin(f * 0.07 + k) * 6, 150 - k * 10, (bot - top) / 2 + 10 - k * 8, 0, 0, Math.PI * 2); c.fill();
  }
  // (sheets of it, banded)
  for (let k = 0; k < 3; k++) {
    const y = top + 18 + k * 42 + Math.sin(f * 0.11 + k * 2) * 5;
    c.fillStyle = `rgba(226, 244, 250, ${((0.16 - k * 0.03) * fade).toFixed(3)})`;
    c.fillRect(a, Math.round(y), FALLS.a - a, 14 - k * 3);
  }
  for (let i = 0; i < 60; i++) {
    const sp0 = 10 + hash(i * 1.9) * 8, span = FALLS.a - a + 120, x = FALLS.a - ((f * sp0 + hash(i * 3.3) * 2000) % span);
    const y = top + 6 + hash(i * 7.1) * (bot - top - 12) + Math.sin(f * 0.2 + i) * 2, len = 26 + hash(i * 4.4) * 46;
    const near = Math.max(0, Math.min(1, (x - a) / (mouth - a)));
    c.fillStyle = `rgba(${i % 3 ? '206, 236, 246' : '252, 255, 255'}, ${((0.4 + near * 0.5) * fade).toFixed(3)})`;
    c.fillRect(Math.round(x), Math.round(y), Math.round(len), i % 4 ? 2 : 3);
  }
  c.restore();
  // (and what it carries out over the gap rains down into the dark under it, fading out as it goes)
  for (let i = 0; i < 16; i++) {
    const t = (f * (0.012 + hash(i * 2.3) * 0.01) + hash(i * 5.1)) % 1, x = a + 20 + hash(i * 3.7) * (PASSAGE.ledge - a - 40) - t * 40;
    const y = bot - 40 + t * 150, al = (1 - t) * 0.7 * fade;
    c.fillStyle = `rgba(206, 236, 246, ${al.toFixed(3)})`; c.fillRect(Math.round(x), Math.round(y), 2, 4 + Math.round(t * 6));
  }
};

const drawOverflow = (c: Ctx, state: GameState) => {
  const f = state.frame, a = FALLS.a, b = FALLS.b, top = PASSAGE.ceil - 34, bot = PASSAGE.floor + 30;
  if (!onScreen(state, a - 40, top, b + 40, bot + 40)) return;
  // (the lip it pours over: a crack along the front of the passage's ceiling, water curling out of it)
  const W = ['rgba(60, 120, 150, 0.30)', 'rgba(110, 170, 200, 0.30)', 'rgba(170, 215, 235, 0.38)', 'rgba(230, 248, 252, 0.6)'];
  for (let i = 0; i < 12; i++) {
    const x = a + (i * (b - a)) / 12;
    c.fillStyle = W[(i * 7 + 1) % 3]; c.fillRect(Math.round(x), top + 26, Math.ceil((b - a) / 12) + 1, bot - top - 26);
  }
  // (streaks falling through it)
  c.save(); c.beginPath(); c.rect(a, top + 26, b - a, bot - top - 26); c.clip();
  for (let i = 0; i < 30; i++) {
    const sx = a + hash(i * 3.1) * (b - a - 3), sp = 6 + hash(i) * 4, len = 18 + hash(i * 5.7) * 40, span = bot - top + 80;
    for (let k = 0; k < 3; k++) {
      const sy = top + ((f * sp + hash(i * 9 + k) * 4000) % span) - 40;
      c.fillStyle = k % 2 ? W[2] : W[3]; c.fillRect(Math.round(sx), Math.round(sy), 2, len);
    }
  }
  c.restore();
  for (let x = a; x < b; x += 6) box(c, x, top + 22 + Math.round(Math.sin(f * 0.2 + x) * 1.5), 6, 6, (x / 6) % 2 ? 'rgba(235, 250, 255, 0.85)' : 'rgba(190, 228, 242, 0.75)');
  // (foam where it hits, spray up off it)
  for (let k = 0; k < 3; k++) {
    c.fillStyle = k === 0 ? 'rgba(250, 254, 255, 0.8)' : k === 1 ? 'rgba(220, 240, 248, 0.45)' : 'rgba(200, 230, 240, 0.22)';
    c.beginPath(); c.ellipse((a + b) / 2, PASSAGE.floor + 8 - k * 8, (b - a) / 2 + 10 + k * 22 + Math.sin(f * 0.12 + k) * 3, 7 + k * 6, 0, 0, Math.PI * 2); c.fill();
  }
};

/** Which tiles have anything painted in them. */
const tileWanted = (tx: number, ty: number) => {
  const x1 = tx + TILE, y1 = ty + TILE;
  if (x1 <= AREA.x0 || tx >= AREA.x1 || y1 <= AREA.y0 || ty >= AREA.y1) return false;
  // (the gorge's and the far bank's only from the pool down; the overlook's from the cavern's ceiling)
  const lip = x1 > LIP.x0 && tx < LIP.x1 && y1 > LIP.y0 && ty < LIP.y1;
  if (tx >= PASSAGE.a && y1 <= POOL_Y - 10 && !lip) return false;
  if (y1 <= CAVE.ceil - 40 && !lip && !(tx < CAVE.a && y1 > CAVE.hi.ceil - 30)) return false;
  return true;
};
/** The area painted: under the overlook (from just over the cavern's ceiling, only round it: the overlook's face over the
 *  ground line is the jungle's elsewhere), and the gorge and the far bank from the pool down. */
const areaPath = (g: Ctx) => {
  g.rect(AREA.x0, CAVE.hi.ceil - 30, CAVE.a - AREA.x0, DEEP - CAVE.hi.ceil + 30);
  g.rect(CAVE.a - 30, AREA.y0, PASSAGE.a - CAVE.a + 30, DEEP - AREA.y0);
  g.rect(PASSAGE.a, POOL_Y - 10, AREA.x1 - PASSAGE.a, DEEP - POOL_Y + 10);
  g.rect(LIP.x0, LIP.y0, LIP.x1 - LIP.x0, LIP.y1 - LIP.y0);
};

// ---------------------------------------------------------------------------------------------------------------
// The heart canister: a fat glass jar, brass capped, a big red meaty heart in it (it beats), the glow off it; painted
// once (two frames of the beat), the glow in three steps

const drawHeart = (c: Ctx, x: number, y: number, f: number) => {
  const beat = (f % 50) < 7 ? 1 : 0, gl = Math.floor((Math.sin(f * 0.08) * 0.5 + 0.5) * 2.99);
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `jg-hid-glow-${gl}`, -70, -70, 140, 140, g => {
    steppedGlow(g, 0, 0, 52 + gl * 8, '#FF3A4A', 0.0, 0.16 + gl * 0.03, 6);
    steppedGlow(g, 0, 0, 26 + gl * 3, '#FFB0A0', 0.0, 0.18, 4);
  });
  stamp(c, `jg-hid-heart-${beat}`, -24, -34, 48, 68, g => paintCanister(g, beat));
  c.restore();
  // (sparkles round it)
  for (let k = 0; k < 4; k++) {
    const a = f * 0.03 + (k * Math.PI) / 2, r = 30 + Math.sin(f * 0.05 + k) * 4, sx = Math.round(x + Math.cos(a) * r), sy = Math.round(y + Math.sin(a) * r * 0.6);
    if ((f + k * 11) % 40 < 20) { box(c, sx - 2, sy, 5, 1, '#FFF4C8'); box(c, sx, sy - 2, 1, 5, '#FFF4C8'); }
  }
};
const paintCanister = (g: Ctx, beat: number) => {
  const BR = ['#3A2406', '#6A4410', '#A06C1C', '#D09A30', '#F2CC60', '#FFF0B0'];
  const H = ['#3A040C', '#6A0A16', '#A0141E', '#D02A2E', '#F2605A', '#FFB0A0'];
  // (the glass: a fat jar, faintly pink with the glow, lit down its left)
  box(g, -17, -22, 34, 44, INK);
  box(g, -16, -22, 32, 44, 'rgba(255, 190, 190, 0.28)');
  // (the heart inside: fat, meaty, its stubs of artery; a little bigger on the beat)
  const s = beat ? 1.12 : 1;
  g.save(); g.scale(s, s);
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, 14); g.bezierCurveTo(-18, 2, -16, -14, -6, -12); g.bezierCurveTo(-2, -12, 0, -9, 0, -7); g.bezierCurveTo(0, -9, 3, -13, 8, -12); g.bezierCurveTo(17, -11, 17, 4, 0, 14); g.fill();
  g.fillStyle = H[2]; g.beginPath(); g.moveTo(0, 12); g.bezierCurveTo(-15, 2, -14, -12, -6, -10.5); g.bezierCurveTo(-2, -10.5, 0, -8, 0, -5.5); g.bezierCurveTo(0, -8, 3, -11.5, 8, -10.5); g.bezierCurveTo(15, -9.5, 15, 4, 0, 12); g.fill();
  g.fillStyle = H[3]; g.beginPath(); g.ellipse(-5, -4, 7, 5, -0.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = H[4]; g.beginPath(); g.ellipse(-7, -6, 3.5, 2.5, -0.4, 0, Math.PI * 2); g.fill();
  box(g, -8, -8, 2, 1, H[5]);
  g.fillStyle = H[1]; g.beginPath(); g.ellipse(6, 4, 5, 4, 0.4, 0, Math.PI * 2); g.fill();
  // (the arteries up top, a vein down it)
  box(g, -4, -17, 5, 7, INK); box(g, -3, -16, 3, 6, H[3]); box(g, -3, -16, 1, 5, H[4]);
  box(g, 3, -16, 5, 5, INK); box(g, 4, -15, 3, 4, '#5A6AB0'); box(g, 4, -15, 1, 3, '#8A9AD8');
  g.strokeStyle = '#6A0A16'; g.lineWidth = 1; g.beginPath(); g.moveTo(2, -6); g.quadraticCurveTo(5, 0, 1, 8); g.stroke();
  g.restore();
  // (the glass's shine over it)
  box(g, -13, -19, 3, 36, 'rgba(255, 255, 255, 0.45)'); box(g, -9, -19, 1, 30, 'rgba(255, 255, 255, 0.25)'); box(g, 11, -16, 2, 26, 'rgba(255, 220, 220, 0.2)');
  // (the brass caps, banded, a plus on the lid)
  for (const [cy, h] of [[-30, 9], [22, 9]] as [number, number][]) {
    box(g, -20, cy - 1, 40, h + 2, INK);
    box(g, -19, cy, 38, h, BR[3]); box(g, -19, cy, 38, 2, BR[5]); box(g, -19, cy + 2, 38, 1, BR[4]); box(g, -19, cy + h - 2, 38, 2, BR[1]);
    for (let k = -15; k < 19; k += 6) box(g, k, cy + 3, 1, h - 5, BR[2]);
  }
  box(g, -6, -36, 12, 7, INK); box(g, -5, -35, 10, 5, BR[3]); box(g, -5, -35, 10, 1, BR[5]);
  box(g, -2, -34, 4, 3, '#E02A2A'); box(g, -1, -35, 2, 5, '#E02A2A');
  checker(g, -19, 26, 38, PIX, BR[2]);
};
