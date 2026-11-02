// The hidden cave behind the gorge's falls (hidden.ts), drawn. Still art painted once, in tiles (stamped: TILE square,
// world-aligned, so they meet without a seam): the rock it's cut out of (stone in a stepped ramp, inked seams, darker
// the deeper; no lit flat tops on the walls: nothing reads as a ledge that isn't), the hollow (a dark back wall, the
// light from the mouth and the falls fading off into it), the things he stands on with their lit lips (the shelf in the
// mouth, the perch, the base, the ledge and the passage's floor), the roots the vines hang off (twisted, dark on top:
// not to stand on), the plunge pool's surface over the gorge's rock, the crack the cannon's shot goes up, the dressing
// (moss, stalactites, a rusted Jungle Cruise pump pipe, a lost skipper's hat). Live over it: the mist drafting out of
// the mouth, a glint in the dark (the tell from the vine), drips, the falls' light rippling on the passage's back wall,
// the heart canister (bobbing, beating, glowing), the cannon; and in front of him, the falls' overflow pouring over the
// passage's front.

import type { GameState } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../../m1/constants';
import { stamp, hazeBands, steppedGlow } from '../../../intro/art/kit';
import { drawCannon, JUNGLE } from '../../../upgrades/returnCannon';
import { CAVE, PASSAGE, OVERHANG, POOL_Y, HEART_X, FALLS, crackX, heartThere, hiddenCannon } from '../hidden';
import { type Ctx, INK, box, checker, mix, hash, poly, leaf, fern, LEAF, BARK, MOSS, ROCK, EARTH, PIX } from './paint';
import { GY } from '../../geometry';

const TILE = 320;
/** What's painted (world): the rock under the overlook and the cavern, under the gorge, under the far bank. */
const AREA = { x0: CAVE.a - 480, x1: PASSAGE.b + 520, y0: CAVE.ceil - 40, y1: 1960 };
const DEEP = 1960;

/** The rock's ramp (a cave's: the jungle's stone, sunk toward a dark green-black), its back wall's (much darker). */
const STONE = ROCK.map(c => mix(c, '#0C1610', 0.26));
const BACK = ROCK.map(c => mix(c, '#030806', 0.8));
const WET = ['#0A1A1E', '#10262C', '#183440', '#22465A', '#3A6A80', '#6AA0B4'];

/** The hollow's pieces (world rects) under the ground line: the cavern, the passage. (Over it, the mouth: mouthPts.) */
const HOLLOW: [number, number, number, number][] = [
  [CAVE.a, GY, CAVE.b, CAVE.base],
  [CAVE.b - 2, PASSAGE.ceil, PASSAGE.b, PASSAGE.floor],
];
/** The cavern over the ground line, open in the cliff's face: its outline (jagged up its left side and along its top,
 *  ragged down to the shelf at the face), from the ground line on its left round to the ground line at the face. */
const mouthPts = (): [number, number][] => {
  const pts: [number, number][] = [[CAVE.a, CAVE.shelf.y]];
  for (let y = GY - 20; y > CAVE.ceil + 10; y -= 22) pts.push([CAVE.a + (hash(y * 0.31) - 0.5) * 16, y]);
  for (let x = CAVE.a; x < CAVE.wall - 30; x += 20) pts.push([x, CAVE.ceil + (hash(x * 0.17) - 0.3) * 18 + Math.sin(x * 0.02) * 4]);
  pts.push([CAVE.wall - 26, CAVE.mouthTop - 6], [CAVE.wall - 12, CAVE.mouthTop + 6], [CAVE.wall, CAVE.mouthTop + 2], [CAVE.wall + 1, CAVE.shelf.y]);
  return pts;
};
/** What's solid inside it, each with its lit top (the shelf, the perch, the ledge). */
const SOLIDS: [number, number, number, number][] = [
  [CAVE.shelf.a, CAVE.shelf.y, CAVE.wall, CAVE.shelf.y + 40],
  [CAVE.a, CAVE.perch.y, CAVE.perch.b, CAVE.perch.y + 40],
  [PASSAGE.ledge, PASSAGE.floor, CAVE.b, CAVE.base],
  [OVERHANG.a, OVERHANG.y, CAVE.b + 2, PASSAGE.ceil],
];
/** The vines' roots: [from x, from y, to x (the vine's top), to y]. */
const ROOTS: [number, number, number, number][] = [
  [CAVE.a + 210, CAVE.ceil, CAVE.a + 220, CAVE.ceil + 15],
  [CAVE.a, 548, CAVE.a + 80, 560],
  [CAVE.b, 776, CAVE.a + 240, 790],
  [CAVE.a, 996, CAVE.a + 80, 1010],
];

// ---------------------------------------------------------------------------------------------------------------
// Painting the still part (world coordinates)

/** The stones' courses: rows GH tall along wavy seams (shared by the rows either side), blocks about GW long, every
 *  other row half a block on, their ends leaning a little (all from the world position: the same in every tile). */
const GW = 50, GH = 30;
const seam = (k: number, x: number) => k * GH + Math.sin(x * 0.043 + k * 1.7) * 3 + Math.sin(x * 0.011 + k * 0.9) * 4;
const endX = (i: number, k: number, low: number) => i * GW + (k % 2) * GW * 0.5 + (hash(i * 7.13 + k * 3.71 + low * 0.5) - 0.5) * 14;
const corner = (i: number, k: number, low: number): [number, number] => { const x = endX(i, k, low); return [x, seam(k + low, x)]; };
/** Stone over (x0..x1, y0..y1): irregular blocks, each lit at its upper left (never a full lit top), inked between;
 *  `dark(y)`: how far it's sunk into the dark there (0..1). */
/** The tile being painted (world): only the stones near it are (the rest are clipped away anyway). */
let near = { x0: -Infinity, y0: -Infinity, x1: Infinity, y1: Infinity };
const stones = (g: Ctx, x0: number, y0: number, x1: number, y1: number, r: string[], dark: (y: number) => number, seed: number) => {
  box(g, x0, y0, x1 - x0, y1 - y0, mix(r[1], '#020504', dark((y0 + y1) / 2)));
  const cx0 = Math.max(x0, near.x0 - GW), cx1 = Math.min(x1, near.x1 + GW), cy0 = Math.max(y0, near.y0 - GH), cy1 = Math.min(y1, near.y1 + GH);
  if (cx0 >= cx1 || cy0 >= cy1) return;
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
};
/** How far into the dark it is: from the mouth's level down. */
const sunk = (y: number) => Math.max(0, Math.min(0.55, (y - 600) / 1800));
const sunkBack = (y: number) => Math.max(0.15, Math.min(0.8, 0.15 + (y - 360) / 1200));

/** A thing he stands on: rock, its top lit (moss along the lip, a stone highlight, grass), its face going down dark. */
const footing = (g: Ctx, x0: number, y0: number, x1: number, y1: number) => {
  stones(g, x0, y0, x1, y1, STONE, y => sunk(y) * 0.8, 5);
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
 *  dark gathered round its edges. */
const hollow = (g: Ctx) => {
  const mp = mouthPts();
  const trace = (pts: [number, number][]) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); };
  // (the cavern over the ground line: the back wall inside its outline, the dark under its ragged top)
  g.save(); trace(mp); g.closePath(); g.clip();
  stones(g, CAVE.a - 20, CAVE.ceil - 24, CAVE.wall + 2, CAVE.shelf.y + 2, BACK, sunkBack, 11);
  hazeBands(g, CAVE.a - 20, CAVE.ceil - 10, CAVE.wall - CAVE.a + 22, 56, '#020504', 0.7, 0.0, 5);
  g.restore();
  for (const [a, b, c, d] of HOLLOW) stones(g, a, b, c, d, BACK, sunkBack, 11);
  // (light in at the mouth: banded, falling off into the cavern)
  g.save(); trace(mp); g.closePath(); g.rect(CAVE.a, GY, CAVE.b - CAVE.a, CAVE.base - GY); g.clip();
  for (let i = 0; i < 6; i++) {
    g.fillStyle = `rgba(150, 190, 140, ${0.035 + i * 0.012})`;
    g.beginPath(); g.ellipse(CAVE.wall, (CAVE.mouthTop + CAVE.shelf.y) / 2, 300 - i * 46, 170 - i * 24, 0, 0, Math.PI * 2); g.fill();
  }
  g.restore();
  // (light from the falls along the passage, blue)
  g.save(); g.beginPath(); g.rect(CAVE.b - 2, PASSAGE.ceil, PASSAGE.b - CAVE.b + 2, PASSAGE.floor - PASSAGE.ceil); g.clip();
  for (let i = 0; i < 6; i++) {
    g.fillStyle = `rgba(120, 190, 220, ${0.03 + i * 0.012})`;
    g.beginPath(); g.ellipse((FALLS.a + FALLS.b) / 2, (PASSAGE.ceil + PASSAGE.floor) / 2, 320 - i * 46, 110 - i * 14, 0, 0, Math.PI * 2); g.fill();
  }
  g.restore();
  // (the base, deep down: darker, banded)
  hazeBands(g, CAVE.a, CAVE.base - 380, CAVE.b - CAVE.a, 380, '#020504', 0.0, 0.5, 6);
  // (dark gathered along its walls and under the passage's ceiling)
  hazeBands(g, CAVE.b - 2, PASSAGE.ceil, PASSAGE.b - CAVE.b + 2, 26, '#020504', 0.55, 0.0, 4);
  for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(2,5,4,${0.14 - i * 0.03})`; g.fillRect(CAVE.a, GY, 10 + i * 8, CAVE.base - GY); g.fillRect(CAVE.b - 10 - i * 8, CAVE.shelf.y + 40, 10 + i * 8, PASSAGE.ceil - CAVE.shelf.y - 40); g.fillRect(PASSAGE.b - 10 - i * 8, PASSAGE.ceil, 10 + i * 8, PASSAGE.floor - PASSAGE.ceil); }
  // (inked round it: the mouth's ragged edge (not down the face: it's open there), the walls under the ground line)
  g.strokeStyle = INK; g.lineWidth = 3; g.lineJoin = 'round';
  trace(mp.slice(0, -2)); g.stroke();
  const seg = (x0: number, y0: number, x1: number, y1: number) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  seg(CAVE.a, CAVE.shelf.y, CAVE.a, CAVE.base);
  seg(CAVE.b, CAVE.shelf.y + 40, CAVE.b, PASSAGE.ceil); seg(CAVE.b, PASSAGE.ceil, PASSAGE.b, PASSAGE.ceil); seg(PASSAGE.b, PASSAGE.ceil, PASSAGE.b, PASSAGE.floor);
  g.lineJoin = 'miter';
};

/** The plunge pool's surface over the gorge's rock (the falls come down into it far back), and its rock's top. */
const pool = (g: Ctx) => {
  const a = PASSAGE.a, b = PASSAGE.b, y = POOL_Y;
  box(g, a, y - 8, b - a, 14, WET[2]); box(g, a, y - 8, b - a, 3, WET[4]); box(g, a, y - 8, b - a, 1, WET[5]);
  for (let x = a; x < b; x += 9) if (hash(x * 0.21) > 0.4) box(g, x, y - 7 + Math.floor(hash(x) * 4), 6, 1, '#E6F4F8');
  box(g, a, y + 6, b - a, 2, INK);
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

/** The cavern's dressing: moss and ferns round the mouth where the light gets in, stalactites, puddles at the base. */
const cavern = (g: Ctx) => {
  for (let x = CAVE.a + 20; x < CAVE.b; x += 34) stalactite(g, x + hash(x) * 14, CAVE.ceil + 12, 14 + hash(x * 1.7) * 30, 10 + hash(x * 2.3) * 8);
  // (ferns and moss at the mouth, in the light)
  for (let k = 0; k < 5; k++) fern(g, CAVE.wall - 6 - k * 22, CAVE.mouthTop + 4, -(16 + hash(k) * 10), k + 3, 0.2, LEAF, 3);
  for (let y = CAVE.mouthTop + 10; y < CAVE.shelf.y - 10; y += 12) leaf(g, CAVE.wall - 2, y, 12, Math.PI * 0.85 + hash(y) * 0.4, LEAF, 3);
  fern(g, CAVE.shelf.a + 14, CAVE.shelf.y, 22, 9, 0.1, LEAF, 3);
  // (the base's puddles)
  for (let x = CAVE.a + 40; x < PASSAGE.ledge - 30; x += 60) { g.fillStyle = INK; g.beginPath(); g.ellipse(x, CAVE.base + 6, 18, 4, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = WET[1]; g.beginPath(); g.ellipse(x, CAVE.base + 6, 17, 3, 0, 0, Math.PI * 2); g.fill(); }
  // (bones of something that missed a vine, at the base)
  box(g, CAVE.a + 130, CAVE.base - 4, 20, 3, '#B8B0A0'); box(g, CAVE.a + 128, CAVE.base - 6, 4, 6, '#D0C8B8'); box(g, CAVE.a + 148, CAVE.base - 6, 4, 6, '#D0C8B8');
};

const paintAll = (g: Ctx) => {
  // (the rock: everything in the area, the gorge's only below its pool)
  const L = AREA.x0, R = AREA.x1;
  stones(g, L, GY, PASSAGE.a, DEEP, STONE, sunk, 0);
  stones(g, PASSAGE.a, POOL_Y, R, DEEP, STONE, sunk, 0);
  // (where it meets the cliff's face over the ground line: a band of earth, roots through it)
  box(g, L, GY, CAVE.a - L, 12, EARTH[2]); box(g, L, GY, CAVE.a - L, 2, INK); box(g, L, GY + 12, CAVE.a - L, 2, EARTH[0]);
  for (let x = L + 6; x < CAVE.a; x += 26) box(g, x, GY + 2, 2, 8 + hash(x) * 14, BARK[2]);
  pool(g);
  hollow(g);
  crack(g);
  for (const s of SOLIDS) footing(g, s[0], s[1], s[2], s[3]);
  footing(g, CAVE.a, CAVE.base, PASSAGE.ledge, DEEP);
  footing(g, PASSAGE.ledge, PASSAGE.floor, PASSAGE.b, DEEP);
  ROOTS.forEach((r, i) => root(g, r, i * 2.3));
  cavern(g);
  passage(g);
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
      stamp(c, `jg-hid-${tx}-${ty}`, 0, 0, TILE, TILE, g => {
        g.save(); g.translate(-tx, -ty);
        g.beginPath(); areaPath(g); g.clip();
        g.beginPath(); g.rect(tx, ty, TILE, TILE); g.clip();
        near = { x0: tx, y0: ty, x1: tx + TILE, y1: ty + TILE };
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
  // (drips down the cavern)
  if (onScreen(state, CAVE.a, CAVE.ceil, CAVE.b, CAVE.base)) for (let k = 0; k < 6; k++) {
    const x = CAVE.a + 30 + hash(k * 9.1) * (CAVE.b - CAVE.a - 60), per = 140 + Math.floor(hash(k) * 120), t = (f + k * 37) % per;
    const y0 = CAVE.ceil + 20, y = y0 + t * t * 0.03;
    if (y < CAVE.base) box(c, x, y, 1, 4, WET[4]);
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

/** In front of him: the falls' overflow pouring over the passage's front (he's behind it), its foam at the floor. */
export const drawHiddenFront = (c: Ctx, state: GameState) => {
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
  if (tx >= PASSAGE.a && y1 <= POOL_Y - 10) return false;
  return true;
};
/** The area painted: under the overlook (from just over the cavern's ceiling, only round it: the overlook's face over the
 *  ground line is the jungle's elsewhere), and the gorge and the far bank from the pool down. */
const areaPath = (g: Ctx) => {
  g.rect(AREA.x0, 550, CAVE.a - AREA.x0, DEEP - 550);
  g.rect(CAVE.a - 30, AREA.y0, PASSAGE.a - CAVE.a + 30, DEEP - AREA.y0);
  g.rect(PASSAGE.a, POOL_Y - 10, AREA.x1 - PASSAGE.a, DEEP - POOL_Y + 10);
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
