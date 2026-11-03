// The hidden armor's places, drawn (hidden.ts has the what and why):
//
//   THE OPENING in the trolley pit's balls: a dark hole down through them, the balls rimming it tipping in, and a shaft
//     of light coming down into it from above (wider as it goes, banded, dust in it): readable as "something's down
//     there" from the track, easy to miss from the ground. Painted once (the stamp cache); only the motes move.
//   THE CAVE under the park (the owner: "make sure the level of details inside his lair is also at the same quality
//     level as the rest"): drawn at the rest of the game's grade, in four depths, nearest last:
//       - THE DEEP (screen space, parallax): through a collapsed hole in the back wall, the park's old brick utility
//         tunnel running off into the dark, a caged work lamp way down it, a lost carousel horse fallen in the muck.
//       - THE BACK WALL: packed earth in wavy strata (dithered seams), stones and lost balls and a buried soda can in it,
//         roots down from the ceiling, the park's rusty water main across it (a drip stain under its leaky joint), the
//         rock jutting at both ends; the light painted on in bands (the shaft's beam, the bare bulb's pool) and the dark
//         gathered into the corners.
//       - THE FLOOR: a band of floor going back to the wall, everything of Ben's set on it (dimmed, nothing lit along a
//         top: none of it's stood on): his rusty squat rack and its mismatched plates, the split bench taped up, a plate
//         stack, a chalk bucket and the handprints on the wall, a cracked mirror leaned up, the NO PAIN NO GAIN poster, the
//         protein tubs (one tipped, its powder out), the cot and its blanket, a milk crate with the hot plate and the
//         noodles on it, his extension cord up the shaft (he's stealing the park's power), his cardboard sign (BEN'S
//         HOLE. NO SOLICITING.), and the last kid found in 1997 (a skeleton in a windbreaker, still holding his Game
//         Boy, cobwebs); the rubber mat under Ben; the heap of balls that came down with the light. The walk line at its
//         front is lit along its top (it's stood on); the ground's cut face under it in strata.
//       - IN FRONT: the ceiling's near lip, roots and rock, in silhouette.
//     The static room is painted once in three chunks; only what moves is live: the heavy bag (baked once, swung on its
//     chain: it swings as Ben works it), the bare bulb (a flicker), the hot plate's coil, the dust in the beams. The
//     engine's lighting does the rest (caveLighting: dark down here, the shaft's cone, the bulb's pool, the coil).

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { stamp } from '../../../m1/game/render/stamp';
import { checker } from '../../../m1/game/render/pixelArt';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { shapeR, pxR, lineR, ellR, dith, mixHex, type Ramp } from '../../foreign/heli/harryArt';
import { drawCannon } from '../../upgrades/returnCannon';
import { drawBen, benHeadY, drawCannonChain, gateK } from '../../upgrades/confucktious';
import { saidOver } from '../section';
import { GY } from '../geometry';
import { HOLE } from './layout';
import { CAVE, SHAFT_X, BEN_X, BAG_X, HOLE_X, hiddenOf, cannonHoleX } from './hidden';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A1028';
const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
const poly = (g: Ctx, pts: [number, number][], col: string | CanvasPattern) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
const BALLS = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#F472B6', '#FB923C'];
const ramp = (col: string) => { const m = (a: string, b: string, k: number) => { const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; }; return [m(col, INK, 0.6), m(col, INK, 0.3), col, m(col, '#FFFFFF', 0.4)]; };
const ball = (g: Ctx, x: number, y: number, r: number, col: string) => { const R = ramp(col); ell(g, x, y, r + 1, r + 1, INK); ell(g, x, y, r, r, R[1]); ell(g, x - r * 0.15, y - r * 0.15, r * 0.75, r * 0.75, R[2]); box(g, x - r * 0.5, y - r * 0.55, Math.max(1, r * 0.3), Math.max(1, r * 0.3), R[3]); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');

// ---------------------------------------------------------------------------------------------------------------
// The opening in the pit (world, drawn over the pit's balls in the section's drawBack)

const BEAM_TOP = GY - 760;
const paintHole = (g: Ctx) => {
  const hw = (HOLE.b - HOLE.a) / 2;
  // (the shaft of light coming down into it: widening, in bands, brighter in its middle)
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    const k = i / bands, top = hw * 0.5 + 4 - k * 4, bot = hw + 6 - k * 10;
    g.fillStyle = `rgba(255,246,200,${0.05 + k * 0.035})`;
    g.beginPath(); g.moveTo(-top, BEAM_TOP - GY); g.lineTo(top, BEAM_TOP - GY); g.lineTo(bot, 0); g.lineTo(-bot, 0); g.closePath(); g.fill();
  }
  // (the hole: dark, going down, its far wall lit by the light falling in)
  ell(g, 0, 4, hw + 2, 12, INK);
  ell(g, 0, 4, hw, 10.5, '#120A1E');
  ell(g, 0, 6, hw - 6, 7, '#1E1430');
  ell(g, 0, 2, hw - 4, 5, 'rgba(255,240,190,0.22)');
  checker(g, -hw + 6, -2, hw * 2 - 12, 4, 'rgba(255,240,190,0.18)', 0, 1);
  // (the balls rimming it, tipping in: the back ones higher, the front ones over its lip)
  for (let k = 0; k < 14; k++) {
    const a = Math.PI + (k / 13) * Math.PI;
    ball(g, Math.cos(a) * (hw + 4), 3 + Math.sin(a) * 9, 5.5 + (k % 2), BALLS[(k * 5) % BALLS.length]);
  }
  for (let k = 0; k < 9; k++) {
    const a = (k / 8) * Math.PI;
    ball(g, Math.cos(a) * (hw + 3), 6 + Math.sin(a) * 9, 6, BALLS[(k * 3 + 1) % BALLS.length]);
  }
  // (a glow on the balls nearest the light)
  g.fillStyle = 'rgba(255,246,200,0.16)'; g.beginPath(); g.ellipse(0, 4, hw + 14, 16, 0, 0, Math.PI * 2); g.fill();
};
export const drawHoleBack = (c: Ctx, state: GameState) => {
  const L = state.camera.x - 120, R = state.camera.x + CANVAS_WIDTH + 120;
  if (HOLE_X < L || HOLE_X > R) return;
  c.save(); c.translate(Math.round(HOLE_X), GY);
  stamp(c, 'ct-hole', -70, BEAM_TOP - GY - 4, 140, GY - BEAM_TOP + 30, paintHole);
  c.restore();
  // (dust turning in the light)
  const f = state.frame;
  for (let i = 0; i < 9; i++) {
    const u = ((f * 0.4 + i * 71) % 600) / 600, y = BEAM_TOP + 60 + u * (GY - BEAM_TOP - 70), sp = 10 + u * 22;
    c.fillStyle = `rgba(255,250,220,${0.25 + 0.35 * Math.sin(u * Math.PI)})`;
    c.fillRect(Math.round(HOLE_X + Math.sin(f * 0.02 + i * 2.1) * sp), Math.round(y), 2, 2);
  }
};


// ---------------------------------------------------------------------------------------------------------------
// The cave

const W = CAVE.b - CAVE.a, H = CAVE.floor - CAVE.ceil;
/** Where the back wall meets the floor (the floor's band runs forward from here to the walk line, at 0). */
const BACK = -30;
/** Where Ben's things stand on the floor's band (back off the walk line). */
const PB = -14;
/** Ben's bare bulb (cave coordinates), hung by its cord off the extension cord along the ceiling. */
const BULB = { x: 622, y: -286 };
/** The hot plate's coil. */
const COIL = { x: 1004, y: -42 };
/** The hole through the back wall into the old utility tunnel (cave x), its top. */
const TUN = { a: 254, b: 344, top: -200 };

// (every material its ramp: lit, base, shade, deep, line)
const ROCK: Ramp = ['#7E6872', '#5C4854', '#463440', '#33242E', '#160C14'];
const RUST: Ramp = ['#C27A4C', '#94522E', '#6E3A22', '#4A2616', '#1A0C08'];
const IRONP: Ramp = ['#70707E', '#4A4A56', '#383840', '#26262D', '#0C0C10'];
const BUMPER: Ramp = ['#D25A4C', '#A43A30', '#7E2A24', '#561C18', '#200808'];
const BLUEP: Ramp = ['#6C84C8', '#4A5EA0', '#384A80', '#26335A', '#0C1024'];
const VINYL: Ramp = ['#9A4248', '#702A32', '#561E26', '#3C141A', '#160608'];
const CANVR: Ramp = ['#8E9E66', '#6C7C4C', '#56643A', '#3E4A2A', '#161C0C'];
const CARD: Ramp = ['#E6C08A', '#C8A070', '#A68052', '#7C5C38', '#2E2010'];
const BONE: Ramp = ['#F4ECD6', '#DCD2B8', '#B8AC90', '#8A7E66', '#2E2818'];
const TEAL: Ramp = ['#5EEAD4', '#14B8A6', '#0F8A7E', '#0B5E56', '#042220'];
const PURP: Ramp = ['#B48CF6', '#7C3AED', '#5B21B6', '#3E1680', '#14062E'];
const STEEL: Ramp = ['#D6DAE2', '#9EA4AE', '#767C88', '#50566A', '#1C2028'];
const WOOD: Ramp = ['#B08A5A', '#8A6640', '#6A4C2E', '#4A321C', '#1C120A'];
const TUBA: Ramp = ['#7076B8', '#4A5094', '#383C74', '#272A52', '#0E0F22'];
const TUBB: Ramp = ['#C25A4A', '#8E3A30', '#6E2A24', '#4C1C18', '#1C0808'];
const MILK: Ramp = ['#5A9AE0', '#2E6EC0', '#22549A', '#183C70', '#081428'];
const BRICK: Ramp = ['#B0644A', '#8A4A36', '#6C3A2A', '#4C281E', '#1E0E0A'];
const SNEAK: Ramp = ['#FFFFFF', '#E0E0E8', '#B8B8C4', '#8A8A98', '#2A2A34'];
const CORD = '#E8862A', CORD_D = '#8A4A14';
/** Ben's things on the floor's band: dimmed toward the dark (set dressing, none of it stood on). */
const dimR = (R: Ramp, k = 0.3): Ramp => R.map(c => mixHex(c, '#1C1024', k)) as unknown as Ramp;
const darkR = (R: Ramp, k: number): Ramp => R.map(c => mixHex(c, '#120A12', k)) as unknown as Ramp;

/** The ceiling's underside at x (cave coordinates). */
const ceilAt = (x: number) => -H + Math.sin(x * 0.05) * 6 + Math.sin(x * 0.13) * 4;

/** A plate side-on (a disc on its edge): its face a thin slab, rim and hub. */
const plateSide = (g: Ctx, x: number, cy: number, r: number, R: Ramp, t = 6) => {
  shapeR(g, () => g.roundRect(x - t / 2, cy - r, t, r * 2, 2), R, x - t / 2, x + t / 2, 1);
  pxR(g, x - t / 2 + 1, cy - r + 2, 1, r * 2 - 4, R[0]);
  pxR(g, x - t / 2, cy - 3, t, 6, R[3]); pxR(g, x - t / 2 + 1, cy - 2, t - 2, 4, R[2]);
};

/** A root down from the ceiling: a curving tapered stroke, its lit side, a fork, hairs off its tip. */
const root = (g: Ctx, x: number, y: number, len: number, bend: number, k: number) => {
  const pts: number[] = [];
  for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push(x + Math.sin(t * 2.6 + k) * bend * t, y + t * len); }
  for (let i = 0; i < 6; i++) lineR(g, [pts[i * 2], pts[i * 2 + 1], pts[i * 2 + 2], pts[i * 2 + 3]], 3.6 * (1 - i / 7) + 0.6, '#1E120E');
  for (let i = 0; i < 6; i++) lineR(g, [pts[i * 2], pts[i * 2 + 1], pts[i * 2 + 2], pts[i * 2 + 3]], 2.2 * (1 - i / 7) + 0.4, '#5A3E2A');
  for (let i = 0; i < 4; i++) lineR(g, [pts[i * 2] - 0.8, pts[i * 2 + 1], pts[i * 2 + 2] - 0.8, pts[i * 2 + 3]], 0.7, '#8A6648');
  const fx = pts[6], fy = pts[7];
  lineR(g, [fx, fy, fx + bend * 0.3 + 4, fy + len * 0.22], 1.2, '#4A3222');
  const tx = pts[12], ty = pts[13];
  for (let i = -1; i <= 1; i++) lineR(g, [tx, ty, tx + i * 2, ty + 3 + Math.abs(i)], 0.5, '#6A4E38');
};

/** The back wall, the ceiling and the openings in it (cave coordinates). */
const paintWall = (g: Ctx, sx: number, hx: number) => {
  // ---- strata: wavy bands, each its own wobble; lighter and warmer going down, a dithered seam, a shadow line under
  // each layer's lip and a lit line on top of the next
  // (the hole through to the tunnel's left out of all of it: painted round, never cut, so a first live paint of it
  // can't punch through what's under it)
  const arch = () => {
    g.moveTo(TUN.a, BACK); g.lineTo(TUN.a - 3, -120); g.quadraticCurveTo(TUN.a - 2, TUN.top + 10, (TUN.a + TUN.b) / 2 - 6, TUN.top);
    g.lineTo((TUN.a + TUN.b) / 2 + 8, TUN.top + 4); g.quadraticCurveTo(TUN.b + 4, TUN.top + 14, TUN.b + 2, -110); g.lineTo(TUN.b, BACK); g.closePath();
  };
  g.save(); g.beginPath(); g.rect(-100, -H - 500, W + 200, H + 700); arch(); g.clip('evenodd');
  const STRATA = ['#24141E', '#2E1C28', '#3A2430', '#34202C', '#46303A', '#3E2A34', '#523A44', '#48323C', '#5A424C'];
  const top = -H - 70, bot = BACK + 4, n = STRATA.length, step = (bot - top) / n;
  const seam = (i: number, x: number) => top + i * step + Math.sin(x * 0.011 + i * 1.7) * 7 + Math.sin(x * 0.037 + i * 2.3) * 3;
  const band = (y0: (x: number) => number, y1: (x: number) => number, col: string | CanvasPattern) => {
    g.fillStyle = col; g.beginPath();
    for (let x = -60; x <= W + 60; x += 8) { if (x === -60) g.moveTo(x, y0(x)); else g.lineTo(x, y0(x)); }
    for (let x = W + 60; x >= -60; x -= 8) g.lineTo(x, y1(x));
    g.closePath(); g.fill();
  };
  for (let i = 0; i < n; i++) band(x => seam(i, x), () => bot + 20, STRATA[i]);
  for (let i = 1; i < n; i++) {
    band(x => seam(i, x), x => seam(i, x) + 2, dith(g, STRATA[i - 1]));
    band(x => seam(i, x) + 2, x => seam(i, x) + 3, 'rgba(14,8,20,0.5)');
    band(x => seam(i, x) + 3, x => seam(i, x) + 4, 'rgba(255,220,200,0.07)');
  }
  // (grain: short streaks along each layer; stones in it, each in its ramp; lost balls; a buried soda can; a bone)
  for (let k = 0; k < 220; k++) {
    const x = -50 + hash(k + 1000) * (W + 100), y = top + 10 + hash(k + 1300) * (bot - top - 10), l = 3 + hash(k + 1600) * 9;
    box(g, x, y, l, 1, hash(k + 1900) > 0.5 ? 'rgba(14,8,20,0.35)' : 'rgba(255,220,200,0.06)');
  }
  for (let k = 0; k < 46; k++) {
    const x = hash(k) * W, y = -H + 26 + hash(k + 50) * (H + BACK - 50), r = 2.5 + hash(k + 9) * 6;
    shapeR(g, () => g.ellipse(x, y, r, r * 0.68, (hash(k + 3) - 0.5) * 0.8, 0, Math.PI * 2), ROCK, x - r, x + r, 1);
    pxR(g, x - r * 0.4, y - r * 0.45, Math.max(1, r * 0.5), 1, '#A08A92');
  }
  for (let k = 0; k < 12; k++) ball(g, 40 + hash(k + 200) * (W - 80), -H + 60 + hash(k + 300) * (H + BACK - 110), 5, BALLS[k % BALLS.length]);
  shapeR(g, () => g.rect(930, -262, 9, 15), ['#F87171', '#DC2626', '#A51C1C', '#701414', '#200606'], 930, 939, 1);
  pxR(g, 930, -257, 9, 3, '#F8FAFC'); pxR(g, 931, -262, 7, 1, '#D4D4D8');
  shapeR(g, () => g.roundRect(160, -232, 16, 4, 2), BONE, 160, 176, 0.8); ellR(g, 160, -230, 3, 3, BONE[1]); ellR(g, 176, -230, 3, 3, BONE[1]);
  // (the park's old water main across the wall: rusty, its joints' flanges and bolts; the one that leaks, the stain
  // down the wall under it, wet and dark)
  const py = -342, PR = dimR(RUST, 0.2);
  shapeR(g, () => g.rect(-60, py - 7, W + 120, 14), PR, -60, W + 60, 1);
  pxR(g, -60, py - 5, W + 120, 2, PR[0]); pxR(g, -60, py + 3, W + 120, 2, dith(g, RUST[3]));
  for (let x = 60; x < W; x += 230) {
    shapeR(g, () => g.rect(x - 4, py - 10, 8, 20), dimR(RUST, 0.15), x - 4, x + 4, 1);
    for (let k = 0; k < 3; k++) pxR(g, x - 1, py - 8 + k * 7, 2, 2, RUST[0]);
  }
  const lx = 750;
  g.fillStyle = 'rgba(14,6,16,0.35)'; g.beginPath(); g.moveTo(lx - 5, py + 7); g.quadraticCurveTo(lx - 10, py + 120, lx - 3, BACK); g.lineTo(lx + 7, BACK); g.quadraticCurveTo(lx + 10, py + 110, lx + 6, py + 7); g.closePath(); g.fill();
  pxR(g, lx - 2, py + 9, 2, 60, dith(g, '#6A8AA0'));
  // (the heavy bag's chain looped round it, the hook under; the bag's drawn live, swinging off it)
  const bx0 = BAG_X - CAVE.a;
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k / 4) * Math.PI * 2, x = bx0 + Math.cos(a) * 8, y = py + Math.sin(a) * 9; pxR(g, x - 2.4, y - 2, 4.8, 4, '#121014'); pxR(g, x - 1.4, y - 1, 2.8, 2, k % 2 ? '#7A7A84' : '#5A5A64'); }
  shapeR(g, () => g.rect(bx0 - 2, py + 6, 4, 4), STEEL, bx0 - 2, bx0 + 2, 0.8);
  // ---- the tunnel's hole: knocked through, the old brick of its arch round the break, its edge in shadow
  // (the bricks round it first: the arch's courses, broken off ragged at the hole)
  const ac = (TUN.a + TUN.b) / 2, ar = (TUN.b - TUN.a) / 2 + 12, BR = dimR(BRICK, 0.25);
  for (let ring = 0; ring < 2; ring++) for (let k = 0; k <= 10; k++) {
    const a = Math.PI + (k / 10) * Math.PI, rr = ar + ring * 9, bx = ac + Math.cos(a) * rr, by = -112 + Math.sin(a) * (rr + 40);
    if (hash(k + ring * 20) > 0.82) continue;
    g.save(); g.translate(bx, by); g.rotate(a + Math.PI / 2);
    shapeR(g, () => g.rect(-6, -4, 12, 8), BR, -6, 6, 1); pxR(g, -5, -3, 10, 1, BR[0]);
    g.restore();
  }
  for (const s of [-1, 1]) for (let k = 0; k < 7; k++) {
    const bx = s < 0 ? TUN.a - 12 : TUN.b + 12, by = -110 + k * 11;
    if (hash(k + s * 7 + 40) > 0.75) continue;
    shapeR(g, () => g.rect(bx - 7 + (k % 2) * 3, by, 13, 9), dimR(BRICK, 0.3), bx - 7, bx + 9, 1);
  }
  g.restore();
  g.beginPath(); arch(); g.lineWidth = 6; g.strokeStyle = '#1A0E16'; g.stroke(); g.lineWidth = 2; g.strokeStyle = '#3A2430'; g.stroke();
  // (clods and a snapped pipe stub at its lip)
  for (let k = 0; k < 9; k++) { const t = k / 8, x = TUN.a + t * (TUN.b - TUN.a), y = TUN.top + 4 + Math.abs(t - 0.5) * 34; shapeR(g, () => g.ellipse(x, y, 5, 3.4, 0, 0, Math.PI * 2), ROCK, x - 5, x + 5, 0.9); }
  shapeR(g, () => g.rect(TUN.b - 6, -152, 18, 7), dimR(RUST, 0.2), TUN.b - 6, TUN.b + 12, 1); ellR(g, TUN.b - 6, -148.5, 2.6, 3.6, '#120A0E');
  // ---- the side walls: rock jutting in, in its ramp, cracks down it, a lit edge here and there
  for (const [x0, s] of [[0, 1], [W, -1]] as const) {
    const out = () => { g.moveTo(x0 - s * 70, -H - 70); g.lineTo(x0 + s * 30, -H - 70); g.lineTo(x0 + s * 18, -H * 0.62); g.lineTo(x0 + s * 38, -H * 0.42); g.lineTo(x0 + s * 26, -H * 0.2); g.lineTo(x0 + s * 16, BACK); g.lineTo(x0 + s * 22, 0); g.lineTo(x0 - s * 70, 0); g.closePath(); };
    shapeR(g, out, darkR(ROCK, s > 0 ? 0.45 : 0.55), Math.min(x0 - s * 70, x0 + s * 40), Math.max(x0 - s * 70, x0 + s * 40), 1.2);
    for (let k = 0; k < 7; k++) { const y = -H + 20 + k * 58, x = x0 + s * (10 + hash(k + s * 9) * 10); lineR(g, [x, y, x + s * 8, y + 18, x + s * 3, y + 34], 1, 'rgba(10,4,10,0.6)'); pxR(g, x + Math.min(0, s * 6), y, 6, 1, 'rgba(255,220,200,0.12)'); }
  }
  // ---- the ceiling: a thick slab of rock, strata in it, its underside jagged and in shadow; the shaft he fell down
  // (its far side lit by its own light, balls jammed in it) and the cannon's ragged hole; roots down out of it
  const open = (x: number) => Math.abs(x - sx) < 44 || Math.abs(x - hx) < 34;
  for (let x = -60; x < W + 60; x += 4) {
    if (open(x)) continue;
    const cy = ceilAt(x);
    box(g, x, -H - 460, 4, cy + H + 460, '#140A14');
    box(g, x, -H - 60 + Math.sin(x * 0.02) * 5, 4, 3, '#22141E'); box(g, x, -H - 30 + Math.sin(x * 0.03 + 1) * 4, 4, 2, '#1E1018');
    box(g, x, cy - 7, 4, 4, '#2A1824'); box(g, x, cy - 3, 4, 3, '#0C060C');
    if (hash(x + 7) > 0.7) box(g, x, cy, 4, 2 + hash(x + 8) * 5, '#0C060C');
  }
  for (let k = 0; k < 40; k++) {
    const x = hash(k + 6000) * W, y = -H - 70 + hash(k + 6100) * 56, r = 3 + hash(k + 6200) * 7;
    if (open(x)) continue;
    shapeR(g, () => g.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2), darkR(ROCK, 0.55), x - r, x + r, 1);
  }
  for (const [ox, w0, col, lit] of [[sx, 44, '#3E2834', 0.035], [hx, 34, '#2A1A24', 0.015]] as const) {
    for (let i = 0; i < 8; i++) {
      const y0 = -H - 460 + i * 60;
      box(g, ox - w0, y0, w0 * 2, 61, mixHex(col, '#F4D8A8', (8 - i) * lit));
      if (i) checker(g, ox - w0, y0 - 1, w0 * 2, 2, mixHex(col, '#F4D8A8', (9 - i) * lit), i % 2, 2);
    }
    box(g, ox - w0 - 2, -H - 460, 6, 460 + ceilAt(ox - w0), '#0C060C'); box(g, ox + w0 - 4, -H - 460, 6, 460 + ceilAt(ox + w0), '#0C060C');
  }
  for (let k = 0; k < 12; k++) ball(g, sx - 38 + (k % 2 ? 76 : 0) + (k % 2 ? -1 : 1) * hash(k) * 6, ceilAt(sx) - 26 - k * 22, 5.5, BALLS[k % BALLS.length]);
  for (let k = 0; k < 8; k++) { const x = hx - 30 + (k % 2 ? 60 : 0), y = ceilAt(hx) - 8 - k * 12; shapeR(g, () => g.ellipse(x, y, 7, 5, 0, 0, Math.PI * 2), darkR(ROCK, 0.4), x - 7, x + 7, 0.9); }
  for (let k = 0; k < 34; k++) {
    const x = hash(k + 400) * W;
    if (open(x) || Math.abs(x - (BAG_X - CAVE.a)) < 20 || Math.abs(x - BULB.x) < 14) continue;
    root(g, x, ceilAt(x) - 2, 14 + hash(k + 410) * 56, (hash(k + 420) - 0.5) * 16, k);
  }
  // ---- Ben's extension cord: down out of the shaft, stapled along the ceiling in sagging loops (the bulb's cord off it
  // at the gym), on to the corner by the cot and down the wall to the power strip under it: he's on the park's power
  const cordPts: [number, number][] = [[sx + 40, -H - 200], [sx + 41, ceilAt(sx + 41) + 2], [300, ceilAt(300) + 3], [470, ceilAt(470) + 3], [BULB.x, ceilAt(BULB.x) + 3], [760, ceilAt(760) + 3], [868, ceilAt(868) + 3], [872, -160], [870, PB - 4]];
  for (let i = 0; i < cordPts.length - 1; i++) {
    const [ax, ay] = cordPts[i], [bx, by] = cordPts[i + 1];
    const flat = Math.abs(by - ay) < 20, sag = flat ? 14 : 0;
    for (const [w, col] of [[2.6, CORD_D], [1.4, flat ? CORD : mixHex(CORD, '#1C1024', 0.35)]] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 + sag, bx, by); g.stroke(); }
    if (flat && i) pxR(g, ax - 2, ay - 1, 4, 2, '#C8C8D0');
  }
  // (the bulb's own cord down off it, taped where it's spliced on; the socket's drawn live with the bulb)
  lineR(g, [BULB.x, ceilAt(BULB.x) + 3, BULB.x + 1, BULB.y - 8], 2.2, '#140A0C'); lineR(g, [BULB.x - 0.4, ceilAt(BULB.x) + 3, BULB.x + 0.6, BULB.y - 8], 0.9, '#3A3034');
  pxR(g, BULB.x - 2, ceilAt(BULB.x) + 4, 4, 4, '#2A2A30');
};

/** The light painted on: the shaft's beam and its pool, the cannon's hole's fainter one, the bulb's pool on the wall,
 *  the dark gathered into the corners (all in bands: the SNES way). */
const paintLight = (g: Ctx, sx: number, hx: number) => {
  for (const [x, w0, w1, a] of [[sx, 34, 104, 0.05], [hx, 24, 64, 0.03]] as const) {
    for (let i = 0; i < 6; i++) {
      const k = i / 6;
      g.fillStyle = `rgba(255,240,190,${a + k * 0.028})`;
      g.beginPath(); g.moveTo(x - w0 * (1 - k * 0.55), -H - 460); g.lineTo(x + w0 * (1 - k * 0.55), -H - 460); g.lineTo(x + w1 * (1 - k * 0.62), 0); g.lineTo(x - w1 * (1 - k * 0.62), 0); g.closePath(); g.fill();
    }
  }
  for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(255,240,190,${0.06 + i * 0.03})`; g.beginPath(); g.ellipse(sx, -10, 130 - i * 26, 22 - i * 4, 0, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(255,196,120,${0.03 + i * 0.012})`; g.beginPath(); g.ellipse(BULB.x + 20, BULB.y + 70 + i * 12, 230 - i * 40, 200 - i * 34, 0, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < 4; i++) {
    g.fillStyle = `rgba(10,4,12,${0.08 + i * 0.04})`;
    g.fillRect(-60, -H - 60, W + 120, 30 + (3 - i) * 22);
    g.fillRect(-60, -H - 60, 60 + (3 - i) * 26, H + 60); g.fillRect(W - (3 - i) * 26, -H - 60, 60 + (3 - i) * 26, H + 60);
  }
};

/** The floor: its band going back to the wall, the walk line along its front lit (it's stood on), the cut face under. */
const paintFloor = (g: Ctx) => {
  const FL = ['#3C2832', '#46303A', '#503842', '#5A404A'];
  FL.forEach((col, i) => { const y = BACK + (i * -BACK) / FL.length; box(g, -60, y, W + 120, -BACK / FL.length + 1, col); if (i) checker(g, -60, y - 1, W + 120, 2, FL[i - 1], i % 2, 2); });
  box(g, -60, BACK, W + 120, 2, 'rgba(10,4,12,0.55)'); box(g, -60, BACK + 2, W + 120, 2, dith(g, 'rgba(10,4,12,0.55)'));
  for (let k = 0; k < 70; k++) { const x = hash(k + 2000) * W, y = BACK + 4 + hash(k + 2100) * (-BACK - 8); box(g, x, y, 2 + hash(k + 2200) * 3, 1, hash(k + 2300) > 0.5 ? '#2A1A22' : '#6E5660'); }
  for (let k = 0; k < 14; k++) { const x = 560 + k * 26 + hash(k + 2400) * 8, y = BACK + 8 + (k % 2) * 8; box(g, x, y, 6, 3, 'rgba(20,10,16,0.35)'); for (let j = 0; j < 3; j++) box(g, x + j * 2, y + 1, 1, 1, 'rgba(110,86,96,0.4)'); }
  // ---- the cut face under the walk line: strata, stones, root ends; the lit lip along its top
  const FF = ['#2E1C26', '#28161F', '#22121A', '#1C0E16', '#160A12'];
  FF.forEach((col, i) => { box(g, -60, 4 + i * 32, W + 120, 33, col); if (i) checker(g, -60, 3 + i * 32, W + 120, 2, FF[i - 1], i % 2, 2); });
  for (let k = 0; k < 40; k++) { const x = hash(k + 700) * W, y = 14 + hash(k + 800) * 120, r = 2 + hash(k + 850) * 4; shapeR(g, () => g.ellipse(x, y, r, r * 0.66, 0, 0, Math.PI * 2), darkR(ROCK, 0.4), x - r, x + r, 0.9); }
  for (let k = 0; k < 16; k++) { const x = hash(k + 900) * W; lineR(g, [x, 6, x + 3, 20 + hash(k + 950) * 30], 1.6, '#3A2618'); }
  box(g, -60, 0, W + 120, 4, '#8A6A72'); box(g, -60, 0, W + 120, 2, '#B8949C'); box(g, -60, 0, W + 120, 1, '#E2C4C8');
  checker(g, -60, 4, W + 120, 2, '#8A6A72', 0, 2);
};

/** Everything of Ben's (dimmed: set dressing; the mat and the heap of balls aren't: they're down on the walk line). */
const paintProps = (g: Ctx, sx: number) => {
  // ---- the chalk bucket and the chalky handprints slapped on the wall over it; a plate stack by the rack
  const cb = 418;
  for (const [x, y] of [[cb - 14, -92], [cb + 6, -104], [cb + 18, -86]] as const) {
    g.fillStyle = dith(g, 'rgba(236,232,224,0.55)'); g.beginPath(); g.ellipse(x, y, 4, 5, 0, 0, Math.PI * 2); g.fill();
    for (let f = 0; f < 4; f++) box(g, x - 4 + f * 2.4, y - 10 + Math.abs(f - 1.5), 1.4, 5, dith(g, 'rgba(236,232,224,0.55)'));
  }
  shapeR(g, () => { g.moveTo(cb - 9, PB - 22); g.lineTo(cb + 9, PB - 22); g.lineTo(cb + 7, PB); g.lineTo(cb - 7, PB); g.closePath(); }, dimR(STEEL), cb - 9, cb + 9, 1);
  ellR(g, cb, PB - 22, 9, 2.6, '#E8E4DC'); pxR(g, cb - 6, PB - 23, 6, 1, '#FFFFFF'); lineR(g, [cb - 9, PB - 22, cb, PB - 34, cb + 9, PB - 22], 0.8, '#50566A');
  pxR(g, cb - 8, PB - 2, 18, 2, dith(g, 'rgba(236,232,224,0.5)'));
  for (let i = 0; i < 5; i++) { const R = dimR([IRONP, BUMPER, IRONP, BLUEP, IRONP][i]); const w = 38 - i * 3, x = 600 - w / 2 + (i % 2) * 2; shapeR(g, () => g.roundRect(x, PB - 6 - i * 6, w, 6, 2), R, x, x + w, 1); pxR(g, x + 2, PB - 5 - i * 6, w - 4, 1, R[0]); pxR(g, x + w / 2 - 2, PB - 5 - i * 6, 4, 4, R[3]); }
  // ---- the rusty squat rack: its uprights (the holes up them, rust run down), the base, the top bar; the J-hooks, the
  // bar on them (its knurling, the collars), mismatched plates on each end; the safeties
  const rk = 470, RR = dimR(RUST, 0.3), SR = dimR(STEEL, 0.32);
  for (const ux of [rk, rk + 90]) {
    shapeR(g, () => g.rect(ux - 4, -172, 8, 172 + PB), RR, ux - 4, ux + 4, 1);
    for (let y = -164; y < PB - 12; y += 10) { pxR(g, ux - 1, y, 2, 2, '#120806'); pxR(g, ux - 1, y + 2, 2, 1, RR[0]); }
    for (let k = 0; k < 4; k++) pxR(g, ux - 3 + (k % 2) * 3, -150 + k * 34, 1, 10 + k * 3, dith(g, RUST[0]));
    shapeR(g, () => g.rect(ux - 12, PB - 4, 24, 4), RR, ux - 12, ux + 12, 1);
  }
  shapeR(g, () => g.rect(rk - 4, -176, 98, 6), RR, rk - 4, rk + 94, 1);
  for (const ux of [rk, rk + 90]) { shapeR(g, () => g.rect(ux - 8, -64, 16, 4), RR, ux - 8, ux + 8, 0.9); shapeR(g, () => g.rect(ux + (ux === rk ? -8 : 2), -138, 6, 8), SR, ux - 8, ux + 8, 0.8); }
  lineR(g, [rk - 2, -62, rk + 92, -62], 3, RR[4]); lineR(g, [rk - 2, -62.6, rk + 92, -62.6], 1.4, RR[1]);
  lineR(g, [rk - 34, -132, rk + 124, -132], 4.4, SR[4]); lineR(g, [rk - 34, -132.6, rk + 124, -132.6], 2.6, SR[1]); lineR(g, [rk - 34, -133.4, rk + 124, -133.4], 0.8, SR[0]);
  for (let x = rk + 8; x < rk + 82; x += 3) pxR(g, x, -133, 1, 2, SR[3]);
  for (const [px, r, R] of [[rk - 22, 26, IRONP], [rk - 15, 20, BUMPER], [rk - 9, 12, BLUEP], [rk + 103, 26, BLUEP], [rk + 110, 15, IRONP]] as const) plateSide(g, px, -132, r, dimR(R, 0.3), 7);
  for (const cx of [rk - 4, rk + 96]) shapeR(g, () => g.rect(cx - 2, -137, 4, 10), SR, cx - 2, cx + 2, 0.8);
  // (the bench under it: the frame, the pad's vinyl split, yellow foam out of the split, the duct tape over half of it)
  const VR = dimR(VINYL, 0.28);
  shapeR(g, () => g.rect(rk + 16, -40, 6, 40 + PB), SR, rk + 16, rk + 22, 0.9); shapeR(g, () => g.rect(rk + 68, -40, 6, 40 + PB), SR, rk + 68, rk + 74, 0.9);
  shapeR(g, () => g.rect(rk + 8, PB - 3, 74, 3), SR, rk + 8, rk + 82, 0.9);
  shapeR(g, () => g.roundRect(rk + 4, -50, 82, 11, 3), VR, rk + 4, rk + 86, 1);
  lineR(g, [rk + 30, -49, rk + 34, -45, rk + 31, -41], 2, '#C8A848'); lineR(g, [rk + 30, -49, rk + 34, -45, rk + 31, -41], 0.6, VR[4]);
  shapeR(g, () => { g.moveTo(rk + 46, -51); g.lineTo(rk + 60, -50); g.lineTo(rk + 58, -38); g.lineTo(rk + 44, -39); g.closePath(); }, dimR(STEEL, 0.4), rk + 44, rk + 60, 0.8);
  shapeR(g, () => { g.moveTo(rk + 56, -51); g.lineTo(rk + 62, -38); g.lineTo(rk + 57, -38); g.lineTo(rk + 52, -51); g.closePath(); }, dimR(STEEL, 0.45), rk + 52, rk + 62, 0.6);
  pxR(g, rk + 6, -49, 22, 1, VR[0]);
  // ---- the mirror leaned on the wall (a gym rat's got to have one): its wood frame, the glass dull in bands, cracked
  const mx0 = 632, GL = ['#5A6474', '#4E5868', '#444C5C', '#3A4250', '#323844'];
  shapeR(g, () => { g.moveTo(mx0, PB); g.lineTo(mx0 + 26, PB); g.lineTo(mx0 + 34, -128); g.lineTo(mx0 + 8, -128); g.closePath(); }, dimR(WOOD, 0.3), mx0, mx0 + 34, 1.1);
  g.save(); g.beginPath(); g.moveTo(mx0 + 4, PB - 3); g.lineTo(mx0 + 23, PB - 3); g.lineTo(mx0 + 30, -124); g.lineTo(mx0 + 11, -124); g.closePath(); g.clip();
  GL.forEach((col, i) => { box(g, mx0, -128 + i * 24, 40, 25, col); if (i) checker(g, mx0, -129 + i * 24, 40, 2, GL[i - 1], i % 2, 2); });
  lineR(g, [mx0 + 8, -122, mx0 + 30, -40], 2.4, 'rgba(220,230,240,0.18)');
  lineR(g, [mx0 + 20, -70, mx0 + 12, -56, mx0 + 16, -40], 0.7, '#C8D0DC'); lineR(g, [mx0 + 20, -70, mx0 + 28, -60], 0.7, '#C8D0DC'); lineR(g, [mx0 + 20, -70, mx0 + 26, -84, mx0 + 24, -100], 0.7, '#C8D0DC');
  g.restore();
  // ---- the poster taped to the dirt: NO PAIN NO GAIN under a bodybuilder flexing, sun-faded, water-stained, a corner
  // curled down
  const poX = BEN_X - CAVE.a - 16, pt = -300, pw = 62, ph = 88;
  shapeR(g, () => g.rect(poX - pw / 2, pt, pw, ph), dimR(['#E8D8B8', '#C8B898', '#A89878', '#7A6A52', '#241C14'], 0.2), poX - pw / 2, poX + pw / 2, 1);
  ['#A23A2A', '#8E3226', '#7A2A22', '#66241E'].forEach((col, i) => box(g, poX - pw / 2 + 3, pt + 3 + i * 14, pw - 6, 15, mixHex(col, '#1C1024', 0.25)));
  const BB: Ramp = dimR(['#E8A878', '#C47E4E', '#9A5A34', '#6E3C20', '#2A140A'], 0.2);
  const bcx = poX, bcy = pt + 30;
  for (const s of [-1, 1]) { lineR(g, [bcx + s * 8, bcy, bcx + s * 19, bcy - 2, bcx + s * 16, bcy - 15], 6.4, BB[4]); lineR(g, [bcx + s * 8, bcy, bcx + s * 19, bcy - 2, bcx + s * 16, bcy - 15], 4.4, BB[1]); ellR(g, bcx + s * 14, bcy - 4, 3, 2.4, BB[0]); }
  shapeR(g, () => { g.moveTo(bcx - 10, bcy - 3); g.lineTo(bcx + 10, bcy - 3); g.lineTo(bcx + 6, bcy + 20); g.lineTo(bcx - 6, bcy + 20); g.closePath(); }, BB, bcx - 10, bcx + 10, 0.9);
  shapeR(g, () => g.ellipse(bcx, bcy - 9, 4.4, 5, 0, 0, Math.PI * 2), BB, bcx - 4.4, bcx + 4.4, 0.8);
  pxR(g, bcx - 7, bcy + 4, 14, 1, BB[3]); pxR(g, bcx - 0.5, bcy + 6, 1, 12, BB[3]); for (let r = 0; r < 3; r++) pxR(g, bcx - 4, bcy + 8 + r * 4, 8, 1, BB[2]);
  shapeR(g, () => g.rect(bcx - 6, bcy + 20, 12, 5), dimR(['#7AA8F0', '#3B6FD8', '#2A52A8', '#1C3878', '#0A1430'], 0.25), bcx - 6, bcx + 6, 0.8);
  if (fontReady()) { g.font = '7px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#1A0E0A'; g.fillText('NO PAIN', poX + 1, pt + 74); g.fillText('NO GAIN', poX - 1, pt + 84); g.fillStyle = '#D8B840'; g.fillText('NO PAIN', poX, pt + 73); g.fillText('NO GAIN', poX - 2, pt + 83); g.textAlign = 'left'; }
  g.fillStyle = 'rgba(90,60,30,0.28)'; g.beginPath(); g.ellipse(poX + 16, pt + 18, 12, 9, 0.3, 0, Math.PI * 2); g.fill();
  poly(g, [[poX + pw / 2 + 1, pt + ph + 1], [poX + pw / 2 + 1, pt + ph - 18], [poX + pw / 2 - 16, pt + ph + 1]], '#2A1E24');
  poly(g, [[poX + pw / 2, pt + ph - 18], [poX + pw / 2 - 16, pt + ph], [poX + pw / 2 - 12, pt + ph - 12]], mixHex('#D8CCB0', '#1C1024', 0.2));
  for (const [x, y, r] of [[poX - pw / 2 - 2, pt - 2, -0.3], [poX + pw / 2 - 8, pt - 2, 0.3], [poX - pw / 2 - 2, pt + ph - 6, 0.25]] as const) { g.save(); g.translate(x + 5, y + 3); g.rotate(r); box(g, -6, -2.5, 12, 5, 'rgba(210,206,180,0.75)'); box(g, -6, -2.5, 12, 1, 'rgba(255,255,240,0.6)'); g.restore(); }
  // ---- the protein tubs: big plastic tubs, their labels, lids; one tipped over, its powder out, the scoop
  for (const [tx, R, label] of [[812, TUBA, 'MASS'], [836, TUBB, 'WHEY']] as const) {
    const D = dimR(R, 0.25);
    shapeR(g, () => g.roundRect(tx - 10, PB - 32, 20, 32, 2), D, tx - 10, tx + 10, 1);
    shapeR(g, () => g.roundRect(tx - 11, PB - 36, 22, 6, 2), dimR(IRONP, 0.2), tx - 11, tx + 11, 1);
    shapeR(g, () => g.rect(tx - 10, PB - 24, 20, 10), dimR(['#F4F0E4', '#D8D2C2', '#B4AE9E', '#8A8476', '#2A2822'], 0.25), tx - 10, tx + 10, 0.8);
    for (let i = 0; i < label.length; i++) pxR(g, tx - 7 + i * 4, PB - 21, 3, 4, D[3]);
    pxR(g, tx - 8, PB - 16, 16, 1, D[2]);
  }
  g.save(); g.translate(862, PB - 10); g.rotate(Math.PI / 2 - 0.15);
  shapeR(g, () => g.roundRect(-10, -16, 20, 28, 2), dimR(['#8ADA9A', '#4AAA62', '#38844A', '#265E34', '#0C2412'], 0.25), -10, 10, 1);
  g.restore();
  g.fillStyle = mixHex('#E2D6C0', '#1C1024', 0.2); g.beginPath(); g.ellipse(880, PB - 1, 16, 4, 0, 0, Math.PI * 2); g.fill();
  pxR(g, 870, PB - 4, 10, 1, '#F8F0E0'); shapeR(g, () => g.roundRect(884, PB - 6, 7, 5, 2), dimR(SNEAK, 0.2), 884, 891, 0.8); lineR(g, [890, PB - 4, 898, PB - 6], 1.4, '#A8A8B4');
  // ---- the cot: green canvas on a steel frame, its X legs; the pillow (a stain on it), the wool blanket rumpled off
  // the end; his spare sneakers under it; the power strip
  const CR = dimR(CANVR, 0.3), FR = dimR(STEEL, 0.4);
  for (const lx of [892, 950]) { lineR(g, [lx, PB, lx + 18, -30], 3, FR[4]); lineR(g, [lx + 18, PB, lx, -30], 3, FR[4]); lineR(g, [lx, PB, lx + 18, -30], 1.4, FR[1]); lineR(g, [lx + 18, PB, lx, -30], 1.4, FR[1]); }
  shapeR(g, () => g.rect(886, -36, 92, 7), CR, 886, 978, 1); pxR(g, 887, -35, 90, 1, CR[0]); lineR(g, [886, -32, 978, -32], 0.6, CR[3]);
  shapeR(g, () => g.ellipse(898, -40, 11, 5, -0.1, 0, Math.PI * 2), dimR(['#F4F2F8', '#DCD8E4', '#B8B2C4', '#8C86A0', '#2A2634'], 0.25), 887, 909, 0.9);
  ellR(g, 902, -40, 3, 2, 'rgba(160,130,60,0.4)');
  shapeR(g, () => { g.moveTo(930, -37); g.quadraticCurveTo(950, -44, 976, -37); g.lineTo(982, -18); g.quadraticCurveTo(972, -14, 966, -20); g.lineTo(962, -31); g.closePath(); }, dimR(['#B87A6A', '#8E4E44', '#703A34', '#4E2824', '#1E0C0A'], 0.3), 930, 982, 0.9);
  for (let k = 0; k < 3; k++) lineR(g, [936 + k * 14, -38, 940 + k * 14, -33], 0.6, '#3A1E1A');
  for (const [x, d] of [[904, 0], [918, 2]] as const) { shapeR(g, () => g.roundRect(x, PB - 7 + d * 0.5, 13, 6, 2), dimR(SNEAK, 0.4), x, x + 13, 0.8); pxR(g, x + 1, PB - 2 + d * 0.5, 12, 1, '#5A5A64'); }
  shapeR(g, () => g.roundRect(860, PB - 6, 18, 5, 1.4), dimR(['#E8E8EC', '#C4C4CC', '#9C9CA6', '#74747E', '#26262C'], 0.3), 860, 878, 0.8);
  for (let k = 0; k < 3; k++) pxR(g, 863 + k * 5, PB - 5, 2, 2, '#26262C');
  pxR(g, 875, PB - 5, 2, 2, '#DC2626');
  // ---- the milk crate with the hot plate on it (its coil's drawn live), the noodle cup and the chopsticks; the hot
  // plate's cord to the strip
  const MR = dimR(MILK, 0.3);
  shapeR(g, () => g.rect(988, -36, 32, 36 + PB), MR, 988, 1020, 1);
  for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) { pxR(g, 991 + k * 10, -33 + j * 9, 6, 6, '#0E1428'); pxR(g, 991 + k * 10, -33 + j * 9, 6, 1, MR[3]); }
  shapeR(g, () => g.roundRect(990, -44, 28, 8, 1.6), dimR(IRONP, 0.15), 990, 1018, 1);
  ellR(g, COIL.x, COIL.y + 0.6, 9, 2.6, '#1A0A08'); lineR(g, [990, -40, 980, -30, 960, PB + 1, 878, PB - 2], 1.2, '#141418');
  shapeR(g, () => { g.moveTo(1008, -56); g.lineTo(1018, -56); g.lineTo(1017, -46); g.lineTo(1009, -46); g.closePath(); }, dimR(['#FFFDF6', '#EAE4D4', '#C8C0AC', '#9A927C', '#2E2A20'], 0.2), 1008, 1018, 0.8);
  pxR(g, 1008, -52, 10, 3, '#B4282A'); pxR(g, 1010, -51, 6, 1, '#F4D040');
  lineR(g, [1012, -54, 1016, -68], 0.9, '#D8C08A'); lineR(g, [1014, -54, 1019, -67], 0.9, '#C8B07A');
  // ---- his cardboard sign, leaned on the wall: the corrugation, a torn top, a coffee ring, the marker letters
  const sgX = 1062;
  shapeR(g, () => { g.moveTo(sgX - 40, PB); g.lineTo(sgX + 40, PB - 2); g.lineTo(sgX + 44, PB - 56); g.lineTo(sgX + 30, PB - 60); g.lineTo(sgX + 22, PB - 56); g.lineTo(sgX - 36, PB - 60); g.closePath(); }, dimR(CARD, 0.18), sgX - 40, sgX + 44, 1.1);
  for (let k = 0; k < 9; k++) lineR(g, [sgX - 34 + k * 9, PB - 58, sgX - 37 + k * 9.4, PB - 2], 0.5, 'rgba(90,60,30,0.25)');
  g.strokeStyle = 'rgba(80,50,20,0.35)'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(sgX + 28, PB - 12, 7, 5, 0, 0, Math.PI * 2); g.stroke();
  if (fontReady()) { g.font = '7px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#1C1008'; g.fillText("BEN'S HOLE.", sgX + 3, PB - 40); g.fillText('NO', sgX + 3, PB - 28); g.fillText('SOLICITING.', sgX + 3, PB - 17); g.textAlign = 'left'; }
  // ---- the last kid found, 1997: a skeleton sat against the wall in his teal-and-purple windbreaker, his light-up
  // sneakers, still holding his Game Boy; his cap fallen off; cobwebs from his skull to the wall
  const kx = 1146, ky = PB;
  const TR = dimR(TEAL, 0.3), PR = dimR(PURP, 0.3), BR = dimR(BONE, 0.2);
  for (const [lx, d] of [[kx + 2, 0], [kx + 8, 3]] as const) { lineR(g, [lx, ky - 10, lx + 18, ky - 4 + d * 0.3], 3, BR[4]); lineR(g, [lx, ky - 10, lx + 18, ky - 4 + d * 0.3], 1.6, BR[1]); shapeR(g, () => g.roundRect(lx + 16, ky - 8 + d * 0.3, 10, 7, 2), dimR(SNEAK, 0.35), lx + 16, lx + 26, 0.8); pxR(g, lx + 17, ky - 2 + d * 0.3, 8, 1, '#E04A8A'); }
  shapeR(g, () => g.roundRect(kx - 8, ky - 16, 22, 9, 2), PR, kx - 8, kx + 14, 0.9);
  const jacket = () => { g.moveTo(kx - 10, ky - 12); g.lineTo(kx + 12, ky - 12); g.lineTo(kx + 12, ky - 38); g.quadraticCurveTo(kx + 2, ky - 44, kx - 10, ky - 38); g.closePath(); };
  shapeR(g, jacket, TR, kx - 10, kx + 12, 1);
  g.save(); g.beginPath(); jacket(); g.clip(); box(g, kx + 2, ky - 44, 12, 34, PR[1]); box(g, kx + 9, ky - 44, 4, 34, PR[2]);
  g.strokeStyle = '#C85A90'; g.lineWidth = 2; g.beginPath(); g.moveTo(kx - 10, ky - 28); for (let k = 0; k < 6; k++) g.lineTo(kx - 8 + k * 4, ky - 28 + (k % 2 ? -4 : 0)); g.stroke(); g.restore();
  box(g, kx, ky - 38, 4, 22, '#120A10');
  for (let k = 0; k < 4; k++) lineR(g, [kx - 1, ky - 34 + k * 4, kx + 5, ky - 33 + k * 4], 0.9, BR[1]);
  lineR(g, [kx + 10, ky - 34, kx + 16, ky - 22, kx + 12, ky - 18], 3, PR[4]); lineR(g, [kx + 10, ky - 34, kx + 16, ky - 22, kx + 12, ky - 18], 1.8, PR[1]);
  shapeR(g, () => g.roundRect(kx + 8, ky - 30, 10, 14, 1.6), dimR(['#E2E0D8', '#BCB8AC', '#98948A', '#727066', '#24221E'], 0.2), kx + 8, kx + 18, 0.9);
  pxR(g, kx + 10, ky - 28, 6, 5, '#7E9A34'); pxR(g, kx + 10, ky - 28, 6, 1, '#A8C060');
  pxR(g, kx + 10, ky - 21, 3, 1, '#2A2824'); pxR(g, kx + 11, ky - 22, 1, 3, '#2A2824'); pxR(g, kx + 15, ky - 21, 1.4, 1.4, '#9A2A5A');
  for (const fx of [kx + 8, kx + 18]) for (let k = 0; k < 3; k++) pxR(g, fx - 1, ky - 26 + k * 2, 2, 1, BR[0]);
  shapeR(g, () => g.ellipse(kx + 1, ky - 50, 9, 9.4, 0.2, 0, Math.PI * 2), BR, kx - 8, kx + 10, 1);
  shapeR(g, () => g.roundRect(kx - 3, ky - 45, 10, 6, 2), BR, kx - 3, kx + 7, 0.8);
  ellR(g, kx - 2, ky - 51, 2.6, 3, '#120A0C'); ellR(g, kx + 5, ky - 50, 2.6, 3, '#120A0C'); pxR(g, kx + 1, ky - 47, 2, 2, '#120A0C');
  for (let k = 0; k < 4; k++) pxR(g, kx - 2 + k * 2.4, ky - 43, 1, 2, '#3A3026');
  lineR(g, [kx - 4, ky - 58, kx - 1, ky - 54, kx - 3, ky - 52], 0.6, BR[3]);
  shapeR(g, () => { g.moveTo(kx - 26, ky); g.quadraticCurveTo(kx - 26, ky - 10, kx - 16, ky - 10); g.lineTo(kx - 8, ky - 8); g.lineTo(kx - 6, ky); g.closePath(); }, dimR(['#FB7185', '#E11D48', '#BE123C', '#881337', '#2A0410'], 0.3), kx - 26, kx - 6, 0.9);
  g.strokeStyle = 'rgba(220,220,230,0.35)'; g.lineWidth = 0.6;
  for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(kx + 8, ky - 54); g.lineTo(kx + 30, ky - 74 + k * 7); g.stroke(); }
  for (let r = 1; r < 4; r++) { g.beginPath(); g.moveTo(kx + 8 + r * 5, ky - 54 - r * 4.4); g.quadraticCurveTo(kx + 10 + r * 6, ky - 52 + r, kx + 8 + r * 5, ky - 54 + r * 3); g.stroke(); }
  // ---- the rubber mat under Ben: interlocking tiles, their teeth, scuffs, chalk dust; a rolled towel at its end
  const mx = BEN_X - CAVE.a;
  shapeR(g, () => g.rect(mx - 112, -9, 224, 9), ['#4E4E58', '#34343C', '#2A2A30', '#202026', '#0C0C10'], mx - 112, mx + 112, 1);
  pxR(g, mx - 111, -8, 222, 1, '#5A5A66');
  for (let x = mx - 112 + 37; x < mx + 110; x += 37) { lineR(g, [x, -8, x, 0], 1, '#141418'); for (let k = 0; k < 2; k++) pxR(g, x - 1 + (k % 2) * 2, -6 + k * 3, 2, 2, '#2A2A30'); }
  for (let k = 0; k < 16; k++) pxR(g, mx - 100 + hash(k + 3000) * 200, -7 + hash(k + 3100) * 5, 2 + hash(k + 3200) * 4, 1, k % 3 ? '#44444E' : 'rgba(236,232,224,0.3)');
  shapeR(g, () => g.roundRect(mx + 84, -16, 24, 8, 4), ['#FFFFFF', '#DCE8F4', '#B4C4D8', '#8494AC', '#2A3240'], mx + 84, mx + 108, 0.9);
  for (let k = 0; k < 3; k++) lineR(g, [mx + 90 + k * 6, -16, mx + 90 + k * 6, -8], 0.6, '#8494AC');
  // ---- the heap of balls that came down with the light (and him); a few rolled off across the floor
  for (let row = 0; row < 3; row++) for (let k = 0; k < 9 - row * 2; k++) ball(g, sx - 52 + row * 13 + k * 13 + (row % 2) * 2, -5 - row * 10, 6.5, BALLS[(k * 7 + row * 3) % BALLS.length]);
  for (let k = 0; k < 7; k++) ball(g, sx + 60 + hash(k + 3300) * 160, -5 - hash(k + 3400) * 6, 6, BALLS[(k * 5 + 2) % BALLS.length]);
};

// ---- Ben's dressing, more of it (the owner: "make the details in bens lairs in general more....detailed"): his
// workbench along the wall by the cot (a plank on angle iron over the tubs: a vise with a foam mascot glove in it, the
// next glove half plated with hubcaps and bolts, a rivet gun, a can of bolts, a mascot's googly eye), the pegboard over
// it (a hammer, wrenches, a hacksaw, the welding mask), the weld scorch on the dirt behind; a stolen SNOOZLE CHOO ride
// sign nailed up crooked; his second poster (YOUR MOM CALLED. SHE SAID DO LEGS.) on notebook paper; a mini fridge by the
// ball heap with a magnet and a SILLYVILLE sticker. All set dressing (dimmed: none of it's stood on).
const paintDress = (g: Ctx) => {
  const W8 = dimR(WOOD, 0.3), S8 = dimR(STEEL, 0.34), I8 = dimR(IRONP, 0.2);
  // ---- the pegboard over the bench, the tools on its hooks
  { const x = 792, y = -176, w = 92, h = 64, PG: Ramp = dimR(['#C8A070', '#A68052', '#8A6640', '#6A4C2E', '#2E2010'], 0.3);
    shapeR(g, () => g.rect(x, y, w, h), PG, x, x + w, 1);
    for (let yy = y + 5; yy < y + h - 2; yy += 6) for (let xx = x + 4; xx < x + w - 2; xx += 6) pxR(g, xx, yy, 1, 1, PG[3]);
    // (the hammer, two wrenches, the hacksaw, the mask)
    shapeR(g, () => g.rect(x + 9, y + 12, 3, 30), W8, x + 9, x + 12, 0.8); shapeR(g, () => g.rect(x + 4, y + 8, 13, 6), I8, x + 4, x + 17, 0.8);
    for (const [wx, l] of [[x + 24, 34], [x + 31, 26]] as const) { shapeR(g, () => g.rect(wx, y + 10, 3, l), S8, wx, wx + 3, 0.7); shapeR(g, () => g.roundRect(wx - 3, y + 6, 9, 6, 2), S8, wx - 3, wx + 6, 0.7); }
    lineR(g, [x + 40, y + 12, x + 64, y + 12, x + 64, y + 26, x + 40, y + 26, x + 40, y + 12], 1.6, S8[4]); lineR(g, [x + 41, y + 25, x + 63, y + 25], 1, S8[0]);
    shapeR(g, () => g.rect(x + 37, y + 22, 5, 9), dimR(BUMPER, 0.3), x + 37, x + 42, 0.7);
    shapeR(g, () => g.roundRect(x + 68, y + 10, 18, 24, 3), dimR(['#4A4A56', '#34343C', '#2A2A30', '#202026', '#0C0C10'], 0.1), x + 68, x + 86, 0.9);
    pxR(g, x + 71, y + 17, 12, 5, '#1E3A22'); pxR(g, x + 71, y + 17, 4, 1, '#5A8A5A');
    for (const [nx, ny] of [[x + 10, y + 10], [x + 25, y + 8], [x + 32, y + 8], [x + 52, y + 10], [x + 77, y + 8]]) pxR(g, nx, ny, 2, 2, '#B8B8C4');
  }
  // ---- the weld scorch on the dirt behind the bench: a sooty bloom, spatter
  for (let k = 0; k < 4; k++) { g.fillStyle = `rgba(10,4,10,${(0.14 + k * 0.07).toFixed(2)})`; g.beginPath(); g.ellipse(846, -86, 44 - k * 9, 20 - k * 4, 0, 0, Math.PI * 2); g.fill(); }
  for (let k = 0; k < 18; k++) pxR(g, 810 + hash(k + 7100) * 76, -104 + hash(k + 7200) * 34, 1, 1, k % 3 ? 'rgba(240,190,110,0.7)' : 'rgba(255,244,200,0.8)');
  // ---- the bench: a scaffold plank on angle-iron legs, a shelf rail under (the tubs stand under it)
  { const x = 784, w = 104;
    for (const lx of [x + 2, x + w - 6]) { shapeR(g, () => g.rect(lx, -66, 4, 66 + PB), S8, lx, lx + 4, 0.9); }
    shapeR(g, () => g.rect(x, -72, w, 7), W8, x, x + w, 1); pxR(g, x + 1, -71, w - 2, 1, W8[0]);
    for (let k = 0; k < 4; k++) pxR(g, x + 12 + k * 24, -70, 1, 4, W8[3]);
    // (the vise at its west end, a foam mascot glove in its jaws: big, white, four fingers)
    shapeR(g, () => g.rect(x + 4, -84, 22, 12), dimR(BLUEP, 0.2), x + 4, x + 26, 0.9); shapeR(g, () => g.rect(x + 13, -90, 4, 6), S8, x + 13, x + 17, 0.7);
    const GL: Ramp = dimR(['#FFFFFF', '#E4E6EE', '#BEC2CE', '#8E92A2', '#2A2C36'], 0.18);
    shapeR(g, () => { g.moveTo(x + 2, -88); g.quadraticCurveTo(x + 2, -108, x + 14, -110); g.quadraticCurveTo(x + 30, -112, x + 30, -96); g.lineTo(x + 28, -86); g.closePath(); }, GL, x + 2, x + 30, 1);
    for (let k = 0; k < 3; k++) lineR(g, [x + 8 + k * 7, -110 + Math.abs(k - 1) * 2, x + 8 + k * 7, -100], 0.7, GL[3]);
    // (the next glove lying on the bench, half plated: hubcaps and bolts on its back, a fresh bead)
    shapeR(g, () => g.ellipse(x + 52, -80, 18, 8, -0.1, 0, Math.PI * 2), GL, x + 34, x + 70, 1);
    for (const [fx, fy] of [[x + 66, -86], [x + 70, -80], [x + 68, -74]] as const) shapeR(g, () => g.ellipse(fx, fy, 5, 3.4, 0, 0, Math.PI * 2), GL, fx - 5, fx + 5, 0.8);
    shapeR(g, () => g.ellipse(x + 48, -82, 8, 5, 0, 0, Math.PI * 2), S8, x + 40, x + 56, 0.9); ellR(g, x + 48, -82, 2.4, 1.6, S8[3]); pxR(g, x + 44, -85, 3, 1, S8[0]);
    for (let k = 0; k < 5; k++) pxR(g, x + 38 + k * 6, -74, 2, 2, S8[2]);
    for (let k = 0; k < 6; k++) pxR(g, x + 56 + k * 2, -88 + (k & 1), 2, 1, 'rgba(255,220,140,0.85)');
    // (the rivet gun, a can of bolts, the googly eye off a mascot's head)
    shapeR(g, () => { g.moveTo(x + 74, -84); g.lineTo(x + 92, -84); g.lineTo(x + 92, -78); g.lineTo(x + 82, -78); g.lineTo(x + 80, -72); g.lineTo(x + 76, -72); g.closePath(); }, dimR(BUMPER, 0.25), x + 74, x + 92, 0.9);
    pxR(g, x + 92, -82, 4, 2, S8[1]);
    shapeR(g, () => g.rect(x + 94, -88, 9, 16), S8, x + 94, x + 103, 0.8); for (let k = 0; k < 3; k++) pxR(g, x + 95 + k * 3, -90, 2, 2, I8[1]);
    ellR(g, x + 30, -76, 5, 5, '#1A1028'); ellR(g, x + 30, -76, 4, 4, '#E8E8F0'); ellR(g, x + 31, -75, 2, 2, '#1A1028');
  }
  // ---- the SNOOZLE CHOO ride sign, stolen, nailed up crooked: candy-striped plywood, a cloud cut out at one end
  { const x = 404, y = -296;
    g.save(); g.translate(x, y); g.rotate(-0.06);
    const SG: Ramp = dimR(['#FDE68A', '#FACC15', '#D4A60E', '#8A6A08', '#2A2004'], 0.25);
    shapeR(g, () => g.roundRect(-58, -14, 116, 28, 10), SG, -58, 58, 1.2);
    for (let k = -50; k < 50; k += 14) pxR(g, k, -12, 6, 2, dimR(BUMPER, 0.25)[1]);
    for (let k = -50; k < 50; k += 14) pxR(g, k + 7, 10, 6, 2, dimR(BLUEP, 0.25)[1]);
    shapeR(g, () => { g.ellipse(64, -6, 10, 8, 0, 0, Math.PI * 2); g.ellipse(72, 2, 8, 7, 0, 0, Math.PI * 2); }, dimR(['#FFFFFF', '#E4E6EE', '#BEC2CE', '#8E92A2', '#2A2C36'], 0.25), 54, 80, 1);
    for (const [nx, ny] of [[-52, -8], [52, -8]] as const) pxR(g, nx, ny, 2, 2, '#9A9AA6');
    if (fontReady()) { g.font = '7px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#2A1408'; g.fillText('SNOOZLE CHOO', 1, 5); g.fillStyle = mixHex('#B4282A', '#1C1024', 0.2); g.fillText('SNOOZLE CHOO', 0, 4); g.textAlign = 'left'; }
    g.restore();
  }
  // ---- his second poster, on notebook paper: YOUR MOM CALLED. SHE SAID DO LEGS.
  { const x = 924, y = -284, w = 68, h = 66, NP: Ramp = dimR(['#F8F8F0', '#E4E4DA', '#C8C8BC', '#9A9A8E', '#2A2A24'], 0.22);
    shapeR(g, () => g.rect(x, y, w, h), NP, x, x + w, 1);
    for (let yy = y + 12; yy < y + h - 2; yy += 7) pxR(g, x + 2, yy, w - 4, 1, 'rgba(90,130,200,0.35)');
    pxR(g, x + 10, y + 2, 1, h - 4, 'rgba(210,80,80,0.4)');
    for (let k = 0; k < 4; k++) ellR(g, x + 5, y + 10 + k * 15, 1.6, 1.6, '#3A2A30');
    if (fontReady()) { g.font = '6px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#2A2A44'; [['YOUR MOM', 18], ['CALLED.', 26], ['SHE SAID', 40], ['DO LEGS.', 49]].forEach(([t, dy]) => g.fillText(t as string, x + w / 2 + 3, y + (dy as number))); g.fillStyle = '#B4282A'; g.fillRect(x + 18, y + 51, 40, 1); g.textAlign = 'left'; }
    for (const [tx, ty, r] of [[x - 2, y - 2, -0.3], [x + w - 8, y - 2, 0.3]] as const) { g.save(); g.translate(tx + 5, ty + 3); g.rotate(r); box(g, -6, -2.5, 12, 5, 'rgba(210,206,180,0.75)'); g.restore(); }
  }
  // ---- the mini fridge by the ball heap: a dorm fridge, a magnet, a sticker; its cord to the cord on the wall
  { const x = 200, w = 38, h = 48, y = PB - h, FR: Ramp = dimR(['#E8E8EC', '#C4C4CC', '#9C9CA6', '#74747E', '#26262C'], 0.28);
    shapeR(g, () => g.roundRect(x, y, w, h, 2), FR, x, x + w, 1.1);
    pxR(g, x + 1, y + 15, w - 2, 1, FR[3]); shapeR(g, () => g.rect(x + w - 7, y + 20, 3, 16), FR, x + w - 7, x + w - 4, 0.6);
    shapeR(g, () => g.roundRect(x + 4, y + 24, 22, 10, 3), dimR(['#F9A8D4', '#F472B6', '#DB2777', '#9D174D', '#2A0418'], 0.25), x + 4, x + 26, 0.8);
    if (fontReady()) { g.font = '4px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#FDF2F8'; g.fillText('SILLYVILLE', x + 15, y + 31); g.textAlign = 'left'; }
    ellR(g, x + 10, y + 7, 4, 4, dimR(BUMPER, 0.2)[1]); ellR(g, x + 9, y + 6, 1.4, 1.4, '#FFFFFF');
    pxR(g, x + 2, y + h - 4, w - 4, 3, FR[3]);
    lineR(g, [x + w, y + 10, x + w + 4, y + 6, x + w + 5, ceilAt(x + w + 5) + 3], 1.6, CORD_D); lineR(g, [x + w, y + 10, x + w + 4, y + 6, x + w + 5, ceilAt(x + w + 5) + 3], 0.8, mixHex(CORD, '#1C1024', 0.35));
  }
};

/** The whole cave in its own coordinates (x from its left end, y up from its floor: the ceiling at -H). */
const paintCave = (g: Ctx, holeX: number) => {
  const sx = SHAFT_X - CAVE.a, hx = holeX - CAVE.a;
  paintWall(g, sx, hx);
  paintFloor(g);
  paintDress(g);
  paintProps(g, sx);
  paintLight(g, sx, hx);
};

// ---- the deep: the old utility tunnel through the hole (screen space, behind the cave, a parallax step back)

const DEEP_W = 720, DEEP_H = 320;
/** The tunnel in its own coordinates, its vanishing point in the middle: brick rings going off smaller into the dark,
 *  the pipes down its side, the gutter down its floor, a caged work lamp way down, a carousel horse lost in the muck. */
const paintDeep = (g: Ctx) => {
  const vx = DEEP_W / 2, vy = DEEP_H / 2 - 10;
  ['#0A0610', '#0E0814', '#120A18', '#160C1C'].forEach((col, i) => box(g, 0, i * (DEEP_H / 4), DEEP_W, DEEP_H / 4 + 1, col));
  const ringAt = (i: number) => { const k = 1 / (1 + i * 0.55); return { k, rw: 150 * k, rh: 190 * k, cy: vy + 70 * k }; };
  const ring = (r: { rw: number; rh: number; cy: number }) => { g.beginPath(); g.moveTo(vx - r.rw, r.cy + r.rh * 0.5); g.lineTo(vx - r.rw, r.cy - r.rh * 0.25); g.quadraticCurveTo(vx - r.rw, r.cy - r.rh * 0.75, vx, r.cy - r.rh * 0.75); g.quadraticCurveTo(vx + r.rw, r.cy - r.rh * 0.75, vx + r.rw, r.cy - r.rh * 0.25); g.lineTo(vx + r.rw, r.cy + r.rh * 0.5); g.closePath(); };
  for (let i = 9; i >= 0; i--) {
    const r = ringAt(i), lit = Math.max(0, 0.55 - i * 0.07);
    ring(r); g.fillStyle = mixHex('#2A1610', BRICK[2], lit); g.fill();
    g.strokeStyle = mixHex('#1A0C08', BRICK[3], lit * 0.6); g.lineWidth = Math.max(0.5, 1.4 * r.k); g.stroke();
    ring(ringAt(i + 0.6)); g.fillStyle = mixHex('#140A0C', '#2A1A18', lit); g.fill();
    for (let b = 0; b < 8; b++) { const t = b / 7; pxR(g, vx - r.rw + t * r.rw * 2 - 1, r.cy - r.rh * 0.25, Math.max(1, 3 * r.k), Math.max(1, 1.4 * r.k), mixHex('#1A0C08', BRICK[1], lit * 0.7)); }
  }
  const lx = vx + 6, ly = vy + 12;
  for (let r = 4; r > 0; r--) { g.fillStyle = `rgba(255,214,120,${0.05 * (5 - r)})`; g.beginPath(); g.ellipse(lx, ly, r * 7, r * 6, 0, 0, Math.PI * 2); g.fill(); }
  pxR(g, lx - 1, ly - 2, 3, 4, '#FDE68A'); pxR(g, lx - 2, ly - 3, 5, 1, '#3A3020'); pxR(g, lx - 2, ly + 2, 5, 1, '#3A3020');
  poly(g, [[vx - 150, DEEP_H], [vx + 150, DEEP_H], [vx + 14, vy + 30], [vx - 14, vy + 30]], '#1A1014');
  poly(g, [[vx - 18, DEEP_H], [vx + 18, DEEP_H], [vx + 2, vy + 30], [vx - 2, vy + 30]], '#22303A');
  poly(g, [[vx - 4, DEEP_H], [vx + 2, DEEP_H], [vx + 1, vy + 34]], 'rgba(160,190,210,0.25)');
  for (const [o, col] of [[0, '#4A2A1C'], [12, '#3A2418']] as const) { g.strokeStyle = col; g.lineWidth = 6 - o * 0.2; g.beginPath(); g.moveTo(vx - 150 + o, vy - 40 + o * 1.4); g.lineTo(vx - 16, vy + 2); g.stroke(); g.strokeStyle = 'rgba(200,120,70,0.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(vx - 150 + o, vy - 43 + o * 1.4); g.lineTo(vx - 16, vy); g.stroke(); }
  // (a carousel horse fallen in the muck, its pole snapped, its paint gone dull)
  const hx = vx + 30, hy = DEEP_H - 70;
  const HR: Ramp = ['#C8B8C0', '#9A8A94', '#76666E', '#52444C', '#1E1418'];
  for (const [a, b] of [[-14, 8], [-4, 10], [8, 9], [16, 7]] as const) { lineR(g, [hx + a, hy + 4, hx + a + b * 0.6, hy + 18], 4, HR[4]); lineR(g, [hx + a, hy + 4, hx + a + b * 0.6, hy + 18], 2.4, HR[2]); }
  shapeR(g, () => g.ellipse(hx, hy, 24, 10, -0.15, 0, Math.PI * 2), HR, hx - 24, hx + 24, 1);
  shapeR(g, () => { g.moveTo(hx + 16, hy - 6); g.lineTo(hx + 30, hy - 22); g.lineTo(hx + 40, hy - 18); g.lineTo(hx + 34, hy - 10); g.lineTo(hx + 22, hy + 2); g.closePath(); }, HR, hx + 16, hx + 40, 1);
  shapeR(g, () => g.rect(hx - 10, hy - 10, 12, 5), ['#E8C060', '#C89A30', '#A07820', '#6E5014', '#2A1E06'], hx - 10, hx + 2, 0.8);
  lineR(g, [hx - 3, hy - 10, hx + 2, hy - 34], 2.4, '#8A7A40'); lineR(g, [hx - 3, hy - 10, hx + 2, hy - 34], 1, '#D8C068');
  g.fillStyle = 'rgba(10,6,12,0.5)'; g.fillRect(hx - 34, hy + 8, 80, 14);
};

/** Screen space, behind everything while he's down there: the deep, a parallax step back behind the tunnel's hole
 *  (only that hole shows it), earth in dark bands round it. */
export const drawCaveBackdrop = (c: Ctx, state: GameState) => {
  const cols = ['#0E0814', '#140C1C', '#1A1024', '#20142A', '#261830'];
  const bh = CANVAS_HEIGHT / cols.length;
  cols.forEach((col, i) => { box(c, 0, i * bh, CANVAS_WIDTH, bh + 1, col); if (i) checker(c, 0, i * bh - 1, CANVAS_WIDTH, 2, col, i % 2, 2); });
  // (where the hole is on the screen; the tunnel's set back behind it: it slides by slower than the wall does)
  const hsx = CAVE.a + (TUN.a + TUN.b) / 2 - state.camera.x, hsy = CAVE.floor - 120 - state.camera.y;
  if (hsx < -200 || hsx > CANVAS_WIDTH + 200) return;
  const fx = CANVAS_WIDTH / 2 + (hsx - CANVAS_WIDTH / 2) * 0.72;
  c.save(); c.translate(Math.round(fx - DEEP_W / 2), Math.round(hsy - DEEP_H / 2));
  stamp(c, 'ct-cave-deep', 0, 0, DEEP_W, DEEP_H, paintDeep);
  c.restore();
};

// ---- the near lip of the ceiling (in front of everything)

const paintLip = (g: Ctx, sx: number, hx: number) => {
  const open = (x: number) => Math.abs(x - sx) < 52 || Math.abs(x - hx) < 40;
  for (let x = -60; x < W + 60; x += 3) {
    if (open(x)) continue;
    const y = -H - 34 + Math.sin(x * 0.07) * 6 + Math.sin(x * 0.19 + 2) * 4 + (hash(x + 77) > 0.84 ? 10 + hash(x + 78) * 26 : 0);
    box(g, x, -H - 120, 3, y + H + 120, '#0A050A');
    box(g, x, y - 2, 3, 2, '#1E1018');
  }
  // (a few roots and teeth of rock hanging off it, in silhouette; the ones nearest the shaft caught by its light)
  for (let k = 0; k < 16; k++) {
    const x = hash(k + 5000) * W;
    if (open(x)) continue;
    const y = ceilAt(x) + 8, len = 16 + hash(k + 5100) * 28;
    if (k % 3 === 0) poly(g, [[x - 6, y], [x + 6, y], [x + 1, y + len * 0.7]], '#0A050A');
    else { lineR(g, [x, y, x + 3, y + len * 0.5, x - 1, y + len], 2.6, '#0A050A'); lineR(g, [x + 3, y + len * 0.5, x + 7, y + len * 0.8], 1.2, '#0A050A'); }
    if (Math.abs(x - sx) < 140) lineR(g, [x + (x < sx ? 2 : -2), y, x + (x < sx ? 4 : -1), y + len * 0.5], 0.7, 'rgba(255,230,180,0.3)');
  }
};

// ---- the live bits: the heavy bag on its chain, the bare bulb, the coil

/** The heavy bag and its chain, painted once (at the scale it's shown at), then swung: the stamp cache won't take a
 *  turned picture, so it's its own canvas, turned about the chain's hook (looped round the water main). */
const BAG_TOP = -120, BAG_H = 94, BAG_W = 40;
/** The bag's hook: a chain looped round the water main (cave y). */
const BAG_HOOK = -334;
let bagCv: { cv: HTMLCanvasElement; res: number } | null = null;
const bagLen = () => BAG_TOP - BAG_HOOK;
const paintBag = (g: Ctx) => {
  // (local: the hook at 0,0; the chain down to the swivel; the straps; the bag: red vinyl gone brown, the duct tape
  // round its middle, its seams, a split; its bottom)
  const L = bagLen();
  for (let y = 2; y < L - 10; y += 6) { pxR(g, -2.4, y, 4.8, 5, '#121014'); pxR(g, -1.4, y + 1, 2.8, 3, (y / 6) % 2 < 1 ? '#7A7A84' : '#5A5A64'); pxR(g, -1.4, y + 1, 1, 1, '#B8B8C4'); }
  shapeR(g, () => g.ellipse(0, L - 8, 3.4, 3.4, 0, 0, Math.PI * 2), STEEL, -3.4, 3.4, 0.9);
  for (const s of [-1, 1]) { lineR(g, [0, L - 6, s * 12, L + 2], 2, '#121014'); lineR(g, [0, L - 6, s * 12, L + 2], 0.9, '#6A6A74'); }
  const VR: Ramp = ['#9A4A3A', '#7A2E26', '#5E2020', '#421616', '#1A0606'];
  shapeR(g, () => g.roundRect(-15, L, 30, BAG_H, 5), VR, -15, 15, 1.2);
  shapeR(g, () => g.roundRect(-15, L, 30, 6, 3), dimR(VR, 0.2), -15, 15, 1);
  for (const y of [L + 30, L + 62]) lineR(g, [-14, y, 14, y], 0.7, VR[3]);
  lineR(g, [-5, L + 8, -5, L + BAG_H - 6], 0.6, VR[3]);
  shapeR(g, () => g.rect(-15.4, L + 40, 30.8, 12), ['#D4D4DA', '#A8A8B0', '#86868E', '#62626A', '#26262C'], -15.4, 15.4, 0.9);
  for (let k = 0; k < 4; k++) lineR(g, [-14 + k * 8, L + 40, -12 + k * 8, L + 52], 0.5, '#62626A');
  pxR(g, 4, L + 18, 6, 1, '#2A0808'); pxR(g, 3, L + 17, 1, 3, '#2A0808'); pxR(g, 10, L + 17, 1, 3, '#2A0808');
  pxR(g, -12, L + 4, 3, BAG_H - 12, 'rgba(255,220,200,0.12)');
  ellR(g, 0, L + BAG_H - 2, 13, 3, VR[3]);
};
const drawBag = (c: Ctx, x: number, y: number, ang: number) => {
  if (typeof document === 'undefined') return;
  const m = c.getTransform(), sc = Math.hypot(m.a, m.b);
  const res = Math.min(4, 2 ** Math.ceil(Math.log2(Math.max(1, sc))));
  const h = bagLen() + BAG_H + 4;
  if (!bagCv || bagCv.res !== res) {
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(BAG_W * res); cv.height = Math.ceil(h * res);
    const g = cv.getContext('2d')!; g.scale(res, res); g.translate(BAG_W / 2, 0); paintBag(g);
    bagCv = { cv, res };
  }
  c.save(); c.translate(x, y); c.rotate(ang); c.drawImage(bagCv.cv, -BAG_W / 2, 0, BAG_W, h); c.restore();
};
/** The bulb's flicker (about 1, on; dips now and then: bad wiring). */
const flick = (f: number) => (hash(Math.floor(f / 6)) > 0.94 ? 0.45 : 0.92 + Math.sin(f * 0.7) * 0.04 + Math.sin(f * 2.3) * 0.03);
/** How the heavy bag's swinging (radians): worked by his flurry, barely moving otherwise. */
const swing = (state: GameState) => {
  const b = hiddenOf(state).ben, f = state.frame;
  return b.pose === 'flurry' ? 0.03 + Math.sin(f * 0.18) * 0.025 : Math.sin(f * 0.04) * 0.006;
};

export const drawCaveBack = (c: Ctx, state: GameState) => {
  const h = hiddenOf(state);
  const hx = Math.round(cannonHoleX(state));
  // (painted once, in three chunks so no one canvas is huge)
  const font = fontReady() ? 'f' : 'n';
  c.save(); c.translate(CAVE.a, CAVE.floor);
  for (let i = 0; i < 3; i++) {
    const bx = -60 + i * ((W + 120) / 3), bw = (W + 120) / 3;
    if (CAVE.a + bx + bw < state.camera.x - 20 || CAVE.a + bx > state.camera.x + CANVAS_WIDTH + 20) continue;
    stamp(c, `ct-cave3-${i}-${hx}-${font}`, bx, -H - 460, bw, H + 620, g => {
      g.save(); g.beginPath(); g.rect(bx, -H - 460, bw, H + 620); g.clip(); paintCave(g, hx); g.restore();
    });
  }
  c.restore();
  const f = state.frame;
  // (the bare bulb: its socket, the glass, the filament glowing, a halo in rings; dimmer when it flickers)
  const bx = CAVE.a + BULB.x, by = CAVE.floor + BULB.y, k = flick(f);
  for (let r = 3; r > 0; r--) { c.fillStyle = `rgba(255,214,140,${0.05 * k * (4 - r)})`; c.beginPath(); c.arc(bx, by + 4, 6 + r * 7, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#121014'; c.fillRect(bx - 3, by - 9, 7, 6); c.fillStyle = '#4A4A52'; c.fillRect(bx - 2, by - 8, 5, 4);
  c.fillStyle = k > 0.6 ? '#FFF4C8' : '#C8B888'; c.beginPath(); c.ellipse(bx + 0.5, by + 3, 4.4, 5.4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = k > 0.6 ? '#FFFFFF' : '#E8D8A8'; c.fillRect(bx - 1, by + 1, 3, 3);
  c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(bx - 3, by, 1, 3);
  // (the hot plate's coil, glowing, its heat breathing)
  const cx = CAVE.a + COIL.x, cy = CAVE.floor + COIL.y, ht = 0.75 + Math.sin(f * 0.05) * 0.25;
  c.fillStyle = `rgba(255,${Math.round(90 + 60 * ht)},40,${0.55 + 0.35 * ht})`; c.fillRect(cx - 8, cy - 1, 16, 2);
  c.fillStyle = `rgba(255,220,140,${0.4 * ht})`; c.fillRect(cx - 5, cy - 1, 3, 1); c.fillRect(cx + 2, cy - 1, 3, 1);
  // (dust turning in the shaft's light, and in the bulb's)
  for (let i = 0; i < 10; i++) {
    const u = ((f * 0.3 + i * 53) % 500) / 500, y = CAVE.ceil + u * H;
    c.fillStyle = `rgba(255,250,220,${0.2 + 0.35 * Math.sin(u * Math.PI)})`;
    c.fillRect(Math.round(SHAFT_X + Math.sin(f * 0.015 + i * 1.7) * (20 + u * 60)), Math.round(y), 2, 2);
  }
  for (let i = 0; i < 5; i++) {
    const u = ((f * 0.2 + i * 97) % 400) / 400;
    c.fillStyle = `rgba(255,224,170,${(0.15 + 0.3 * Math.sin(u * Math.PI)) * k})`;
    c.fillRect(Math.round(bx + Math.sin(f * 0.01 + i * 2.4) * 70), Math.round(by + 20 + u * 140), 1, 1);
  }
  drawCannon(c, h.cannon);
  drawCannonChain(c, h.cannon, gateK(state, h.gate));
  // (the heavy bag on its chain, swinging when he works it)
  drawBag(c, BAG_X, CAVE.floor + BAG_HOOK, swing(state));
  const b = h.ben;
  drawBen(c, BEN_X, CAVE.floor - 4, b.facing, b.pose, Math.floor(b.poseT / 5), b.piece);
  // (his shaker, knocked out of his hand by the kick: tumbling, then lying on its side)
  const sk = h.shaker;
  if (sk) {
    const down = sk.vx === 0 && sk.vy === 0;
    c.save(); c.translate(Math.round(sk.x), Math.round(sk.y)); c.rotate(down ? Math.PI / 2 : state.frame * 0.3);
    c.fillStyle = '#1A1028'; c.fillRect(-5, -16, 10, 18); c.fillStyle = '#2563EB'; c.fillRect(-4, -15, 8, 14); c.fillStyle = '#BFDBFE'; c.fillRect(-4, -15, 2, 14);
    c.fillStyle = '#F8FAFC'; c.fillRect(-4, -10, 8, 3); c.fillStyle = '#111827'; c.fillRect(-3, -19, 6, 4);
    c.restore();
  }
};
export const drawCaveFront = (c: Ctx, state: GameState) => {
  const h = hiddenOf(state);
  // (the ceiling's near lip, in front of everything)
  const sx = SHAFT_X - CAVE.a, hx = Math.round(cannonHoleX(state)) - CAVE.a;
  c.save(); c.translate(CAVE.a, CAVE.floor);
  for (let i = 0; i < 3; i++) {
    const bx = -60 + i * ((W + 120) / 3), bw = (W + 120) / 3;
    if (CAVE.a + bx + bw < state.camera.x - 20 || CAVE.a + bx > state.camera.x + CANVAS_WIDTH + 20) continue;
    stamp(c, `ct-cave-lip-${i}-${hx}`, bx, -H - 120, bw, 200, g => { g.save(); g.beginPath(); g.rect(bx, -H - 120, bw, 200); g.clip(); paintLip(g, sx, hx); g.restore(); });
  }
  c.restore();
  // (his words over his head, only while they're said; not while his gross-up's got them)
  if (h.ben.said && !(h.phase === 'meet' && h.script?.gross)) saidOver(c, h.ben.said.text, BEN_X, benHeadY(CAVE.floor - 4), '#FFFFFF', 220);
};

/** Down here: dark, the shaft's cone of daylight, the bare bulb's warm pool (flickering), the cannon's hole a fainter
 *  cone, the coil's red; a soft glow about him so he's never lost in it. */
export const caveLighting = (state: GameState): SceneLight => {
  const f = state.frame, p = state.player, k = flick(f);
  const lights: Light[] = [
    { x: SHAFT_X, y: CAVE.ceil - 30, r: H + 30, cone: 140, a: 0.95, color: 'rgba(255,236,180,0.16)' },
    { x: cannonHoleX(state), y: CAVE.ceil - 20, r: H + 20, cone: 70, a: 0.45, color: 'rgba(255,236,180,0.08)' },
    { x: CAVE.a + BULB.x, y: CAVE.floor + BULB.y + 6, r: 330, a: 0.9 * k, color: `rgba(255,190,110,${(0.15 * k).toFixed(3)})` },
    { x: CAVE.a + COIL.x, y: CAVE.floor + COIL.y, r: 70, a: 0.6, color: 'rgba(255,90,40,0.14)' },
    { x: p.pos.x + p.width / 2, y: p.pos.y + 20, r: 150, a: 0.4 },
  ];
  return { dark: 0.55, shade: [16, 6, 20], rim: 0.5, lights };
};
