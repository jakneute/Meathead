// THE LAUNCH, from outside (screen space, the whole screen): the giant atom across the way (its nucleus up on its
// stilts, its three electron rings round it), the main drag below it, the rest of the park far off behind. Out through
// the top of its shell they come: the hatch blown off, the shell's panels peeled back, sparks, smoke and bits of it
// raining down: the two from the sled in front, the two sleds, and him (his own sprite, flailing, tumbling end over end,
// a rush of air streaking off him), arcing over the drag, the shot easing up to follow them over the top and back down.
// The two of them land first: a long red smear down the pavement. The sleds after, in bits. Then him: a bounce, a roll,
// flat on his face, and up on his feet.
//
// The still parts (the sky and the far park, the atom, the drag) are painted ahead (prewarmLaunch: from the ride's
// build, a few ms per idle moment) into two layers, at the screen's own resolution, then put down with a drawImage
// each; everything that moves is drawn live over them.
//
// Where it all lands (in the drag's own world: drag/ draws what's left there; see the ride's report): him at
// DOORS.drag.start; the smear from 140 to 460 px right of that, on the pavement; the two sleds' wrecks at 520 and 610.

import type { GameState } from '../../../m1/game/core/state';
import type { Player } from '../../../m1/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RENDER_SCALE } from '../../../m1/constants';
import { drawTodSky, timeOfDay } from '../../timeOfDay';
import { lettering, letterSize } from '../square/lettering';
import { backTint } from '../square/paint';
import { INK, box, mix, hash, slab, rampOf, bandedGradient, hazeBands, steppedGlow, bendFloor, checker, pixelBlob } from '../../intro/art/kit';
import { cyl, sphere } from '../atom/snes';
import { lookOf } from '../../adventure/temple/people';
import { bodyOf, legs, torso, arm, headShape, faceOn, hairTop, hairBack, flailHands } from '../../spooky/costume';
import { drawPlayer } from '../../../m1/game/render/player/player';
import { idleJob } from '../../../m1/game/scenes/art/raster';
import { drawSled, HIS_SLED, FRONT_SLED, type SledLook } from './sled';

type Ctx = CanvasRenderingContext2D;
const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Where the street is on screen, where the hole in the atom is, and where each of them lands. */
const STREET = 500, HOLE: [number, number] = [210, 150];
export const LAND_ME = 470, LAND_A = 560, LAND_B = 640, LAND_SLED: [number, number] = [700, 760];
/** How long it takes: the burst, the flight (each one's), the bounce and up, the hold, the fade. */
export const OUT_FLY = 95, OUT_END = 260, OUT_FADE = 30;
/** When each one hits the pavement (frames into the shot): the two of them, him. */
export const OUT_SPLAT = 6 + OUT_FLY - 10, OUT_LAND_ME = 20 + OUT_FLY + 8;
/** The sky painted on up above the top of the screen, for the shot to ease up into (px). */
const PAD = 130;
/** How big they're drawn: him, the two of them, the sleds. */
const ME_K = 0.9, RIDER_K = 0.82, SLED_K = 0.56;
/** The nucleus's middle; the hole's middle (on its top). */
const ATOM: [number, number] = [210, 250], HOLE_C: [number, number] = [HOLE[0], HOLE[1] + 30];

/** Along an arc from the hole to (lx, STREET), over `len` frames, starting at frame `t0`: where, or null before. */
const arc = (t: number, t0: number, len: number, lx: number, top = 40) => {
  const u = (t - t0) / len;
  if (u < 0) return null;
  const v = Math.min(1, u);
  return { x: HOLE[0] + (lx - HOLE[0]) * v, y: HOLE[1] + (STREET - HOLE[1]) * v - Math.sin(v * Math.PI) * (HOLE[1] - top + 80) * (1 - v * 0.2), done: u >= 1, u };
};
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** How far the shot's eased up (px down the scene's drawn): up over the top with them as they go, back down for the landings. */
const camOf = (t: number) => {
  const u = clamp01((t - 8) / 104);
  return Math.round(PAD * 0.85 * Math.pow(Math.sin(u * Math.PI), 0.9));
};

// ---------------------------------------------------------------------------------------------------------------
// The still layers: painted ahead

const ring3 = [0, 1.05, -1.05];
const ringPt = (th: number, a: number) => {
  const ex = Math.cos(th) * 190, ey = Math.sin(th) * 54;
  return [ATOM[0] + ex * Math.cos(a) - ey * Math.sin(a), ATOM[1] + ex * Math.sin(a) + ey * Math.cos(a)];
};

/** One half of the rings (front or back), banded, its seams and rivets along it; its chaser bulbs off (lit ones live). */
const paintRings = (g: Ctx, front: boolean) => {
  const bands: [number, string][] = front ? [[13, INK], [10, '#64748B'], [7, '#94A3B8'], [4, '#CBD5E1'], [1.5, '#F8FAFC']] : [[13, INK], [10, '#1E293B'], [7, '#334155'], [4, '#475569'], [1.5, '#64748B']];
  const [cx, cy] = ATOM;
  for (const a of ring3) {
    for (const [lw, col] of bands) {
      g.lineWidth = lw; g.strokeStyle = col; g.beginPath(); g.ellipse(cx, cy, 190, 54, a, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); g.stroke();
    }
    // (the seams between its sections, a rivet either side)
    for (let k = 0; k < 10; k++) {
      const th = (front ? 0 : Math.PI) + (k + 0.05) / 10 * Math.PI, [x, y] = ringPt(th, a);
      box(g, x - 1, y - 1, 2, 2, front ? '#334155' : '#0F172A');
      box(g, x + 2, y - 2, 1, 1, front ? '#F8FAFC' : '#64748B');
    }
    for (let k = 0; k < 14; k++) {
      const th = (front ? 0 : Math.PI) + (k + 0.5) / 14 * Math.PI, [x, y] = ringPt(th, a);
      box(g, x - 2, y - 2, 5, 5, INK); box(g, x - 1, y - 1, 3, 3, front ? '#64748B' : '#334155');
    }
  }
};

/** Far off behind it all, as the rest of the park looks right now: the Space Needle 2 and its saucer, a rocket ride on
 *  its gantry, a dome, the trees and lamps of the walks; tinted back toward the sky, hazed. */
const paintFarPark = (g: Ctx) => {
  const T = (c: string, k = 0.55) => backTint(c, k);
  // (trees along the walks, a soft band)
  for (let i = 0; i < 26; i++) { const x = 300 + i * 22 + hash(i) * 10, r = 12 + hash(i * 3) * 8; pixelBlob(g, x, STREET - 40 - hash(i * 7) * 8, r, r * 0.8, T('#166534', 0.62)); pixelBlob(g, x - 3, STREET - 44 - hash(i * 7) * 8, r * 0.6, r * 0.45, T('#22C55E', 0.62)); }
  // (the dome: banded, its ribs)
  g.save(); g.beginPath(); g.ellipse(480, STREET - 40, 64, 70, 0, Math.PI, 0); g.closePath(); g.clip();
  bandedGradient(g, 410, STREET - 112, 140, 74, [T('#E2E8F0'), T('#CBD5E1'), T('#94A3B8'), T('#64748B')], 4);
  for (let k = -3; k <= 3; k++) { g.strokeStyle = T('#475569'); g.lineWidth = 1.5; g.beginPath(); g.ellipse(480, STREET - 40, Math.abs(k) * 20 + 2, 70, 0, Math.PI, 0); g.stroke(); }
  g.restore();
  box(g, 476, STREET - 116, 8, 8, T('#F43F5E'));
  // (the rocket ride: a gantry, the rocket up it, its arms out with the little rockets on them)
  const rx = 590;
  for (const dx of [-10, 10]) box(g, rx + dx - 2, STREET - 220, 4, 180, T('#94A3B8'));
  for (let y = STREET - 210; y < STREET - 40; y += 16) { g.strokeStyle = T('#64748B'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(rx - 10, y); g.lineTo(rx + 10, y + 16); g.moveTo(rx + 10, y); g.lineTo(rx - 10, y + 16); g.stroke(); }
  g.fillStyle = T('#F8FAFC'); g.beginPath(); g.moveTo(rx, STREET - 262); g.lineTo(rx + 12, STREET - 236); g.lineTo(rx + 12, STREET - 190); g.lineTo(rx - 12, STREET - 190); g.lineTo(rx - 12, STREET - 236); g.closePath(); g.fill();
  box(g, rx - 12, STREET - 222, 24, 6, T('#DC2626')); box(g, rx + 4, STREET - 236, 8, 46, T('#CBD5E1'));
  for (const s of [-1, 1]) { g.strokeStyle = T('#94A3B8'); g.lineWidth = 3; g.beginPath(); g.moveTo(rx, STREET - 160); g.lineTo(rx + s * 46, STREET - 176); g.stroke(); box(g, rx + s * 46 - 7, STREET - 184, 14, 8, T(s > 0 ? '#2563EB' : '#F59E0B')); }
  // (the Space Needle 2: its legs, the stalk, the saucer up top, the spire)
  const nx = 735;
  g.fillStyle = T('#E5E7EB', 0.5);
  g.beginPath(); g.moveTo(nx - 26, STREET - 40); g.lineTo(nx - 5, STREET - 250); g.lineTo(nx + 5, STREET - 250); g.lineTo(nx + 26, STREET - 40); g.lineTo(nx + 16, STREET - 40); g.lineTo(nx, STREET - 200); g.lineTo(nx - 16, STREET - 40); g.closePath(); g.fill();
  box(g, nx - 4, STREET - 330, 8, 90, T('#CBD5E1', 0.5)); box(g, nx - 4, STREET - 330, 3, 90, T('#F8FAFC', 0.5));
  for (const [rw, rh, col, dy] of [[52, 12, '#475569', 0], [48, 9, '#94A3B8', -3], [40, 5, '#F1F5F9', -6]] as const) { g.fillStyle = T(col, 0.5); g.beginPath(); g.ellipse(nx, STREET - 336 + dy, rw, rh, 0, 0, Math.PI * 2); g.fill(); }
  box(g, nx - 44, STREET - 334, 88, 3, T('#7DD3FC', 0.5));
  box(g, nx - 1, STREET - 380, 2, 40, T('#CBD5E1', 0.5)); box(g, nx - 2, STREET - 382, 4, 4, T('#F43F5E', 0.4));
  // (lamp posts down the walks)
  for (let x = 330; x < W; x += 58) { box(g, x, STREET - 70, 2, 30, T('#475569')); box(g, x - 3, STREET - 74, 8, 4, T('#FDE68A')); }
  hazeBands(g, 0, STREET - 280, W, 260, skyHaze(), 0.0, 0.3, 6);
};
const skyHaze = () => mix(backTint('#E0F2FE', 0.8), '#FFFFFF', 0.2);

/** The atom's stilts, its plaza, the back half of its rings, the nucleus: everything behind the hole. */
function* paintBack(g: Ctx) {
  drawTodSky(g, 0, -PAD, W, H + PAD, ['#1E3A8A', '#3B82F6', '#93C5FD', '#E0F2FE'], { horizon: STREET, sun: [640, 110], moon: [120, 80] });
  yield;
  paintFarPark(g);
  yield;
  const [cx, cy] = ATOM;
  // (the plaza at its foot: pavers, planters at the stilts' feet)
  bandedGradient(g, 0, STREET - 26, 410, 26, ['#94A3B8', '#A8B4C6', '#CBD5E1'], 3);
  for (let x = 0; x < 410; x += 24) box(g, x, STREET - 26, 1, 26, '#7A869A');
  // (the stilts, braced: steel, banded, bolted at the joints)
  for (const sx of [-80, 0, 80]) {
    cyl(g, cx + sx - 7, cy + 60, 14, STREET - cy - 60, '#94A3B8', 'y');
    for (let y = cy + 90; y < STREET - 20; y += 40) { box(g, cx + sx - 9, y, 18, 4, INK); box(g, cx + sx - 8, y + 1, 16, 2, '#CBD5E1'); }
    slab(g, cx + sx - 16, STREET - 22, 32, 22, '#A1A1AA');
    box(g, cx + sx - 14, STREET - 26, 28, 6, INK); box(g, cx + sx - 13, STREET - 25, 26, 4, '#15803D'); box(g, cx + sx - 13, STREET - 25, 26, 1, '#4ADE80');
    for (let k = 0; k < 4; k++) pixelBlob(g, cx + sx - 10 + k * 7, STREET - 28, 4, 3, k % 2 ? '#F472B6' : '#FDE047');
  }
  for (const [a, b] of [[-80, 0], [0, 80]]) for (const [lw, col] of [[5, INK], [3, '#64748B'], [1, '#94A3B8']] as const) { g.lineWidth = lw; g.strokeStyle = col; g.beginPath(); g.moveTo(cx + a, cy + 90); g.lineTo(cx + b, STREET - 24); g.moveTo(cx + b, cy + 90); g.lineTo(cx + a, STREET - 24); g.stroke(); }
  yield;
  paintRings(g, false);
  yield;
  // (the nucleus: a ball of balls, each stepped, a panel seam or two across each)
  for (const [dx, dy, r, col] of [[-40, 20, 58, '#B91C1C'], [40, 20, 58, '#1D4ED8'], [0, -30, 62, '#DC2626'], [-30, -10, 50, '#2563EB'], [30, -20, 54, '#B91C1C']] as const) {
    sphere(g, cx + dx, cy + dy, r, col);
    g.save(); g.beginPath(); g.arc(cx + dx, cy + dy, r - 1, 0, Math.PI * 2); g.clip();
    g.strokeStyle = mix(col, INK, 0.45); g.lineWidth = 1;
    for (const k of [-0.45, 0.2]) { g.beginPath(); g.ellipse(cx + dx, cy + dy, r, r * 0.35, k, 0, Math.PI * 2); g.stroke(); }
    for (let k = 0; k < 6; k++) { const a = -2.4 + k * 0.32; box(g, cx + dx + Math.cos(a) * r * 0.82, cy + dy + Math.sin(a) * r * 0.82, 2, 2, mix(col, '#FFFFFF', 0.45)); }
    g.restore();
  }
}

/** The front half of its rings, its name plate, the drag (its fronts, their sides in perspective, the pavement bent). */
const EYE = W / 2;
function* paintFront(g: Ctx) {
  paintRings(g, true);
  const [cx] = ATOM;
  // (its name the square's way (square/sky.ts): a dark plate bolted across the middle stilt, the words in neon tubes)
  const [lw, lh] = letterSize('THE GIANT ATOM', 'neon'), py = STREET - 73, plate = '#2A0650';
  box(g, cx - lw / 2 - 6, py - lh / 2 - 4, lw + 12, lh + 8, INK); box(g, cx - lw / 2 - 4, py - lh / 2 - 2, lw + 8, lh + 4, plate); box(g, cx - lw / 2 - 4, py - lh / 2 - 2, lw + 8, 1, '#7A3AAE');
  for (const bx of [cx - lw / 2 - 3, cx + lw / 2 + 1]) { box(g, bx, py - 1, 2, 2, '#4A5A70'); box(g, bx, py - 1, 1, 1, '#CDD6E2'); }
  lettering(g, 'THE GIANT ATOM', cx, py, 'neon', timeOfDay().lamps > 0.3 ? '#F0ABFC' : '#F5D0FE', plate);
  yield;
  const names = ['ROBO BURGER', 'ZAP GIFTS', 'ORBIT ICE', 'PHOTO 2010', 'RAY SHOP'];
  const fronts = [0, 1, 2, 3, 4].map(k => ({ x: 380 + k * 90, h: 70 + (k % 3) * 30, col: ['#F472B6', '#2DD4BF', '#FBBF24', '#A78BFA', '#60A5FA'][k], name: names[k] }));
  // (their sides first, all of them: every front stands in front of every side)
  for (const b of fronts) {
    const near = b.x + 40 < EYE ? b.x + 80 : b.x, sw = Math.round(Math.abs(near - EYE) * 0.12), d = near < EYE ? 1 : -1;
    if (sw < 2) continue;
    const top = STREET - b.h, r = rampOf(b.col);
    g.fillStyle = INK; g.beginPath(); g.moveTo(near, top - 1); g.lineTo(near + d * sw, top + sw * 0.3 - 1); g.lineTo(near + d * sw, STREET); g.lineTo(near, STREET); g.closePath(); g.fill();
    g.fillStyle = r[1]; g.beginPath(); g.moveTo(near, top + 1); g.lineTo(near + d * (sw - 1), top + sw * 0.3 + 1); g.lineTo(near + d * (sw - 1), STREET); g.lineTo(near, STREET); g.closePath(); g.fill();
  }
  for (const b of fronts) {
    const top = STREET - b.h, r = rampOf(b.col);
    slab(g, b.x, top, 80, b.h, b.col);
    // (a band of tile up its middle, dithered into the wall)
    box(g, b.x + 2, top + 38, 76, 3, r[1]); checker(g, b.x + 2, top + 41, 76, 4, r[1], 0, 2);
    // (the shop window: banded glass, its mullions, a sheen, the stuff on show)
    box(g, b.x + 8, top + 12, 64, 22, INK); bandedGradient(g, b.x + 9, top + 13, 62, 20, ['#F0F9FF', '#BAE6FD', '#7DD3FC', '#38BDF8'], 4);
    for (const mx of [29, 50]) box(g, b.x + mx, top + 13, 2, 20, INK);
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(b.x + 14, top + 31); g.lineTo(b.x + 22, top + 15); g.stroke();
    // (the door: framed, a push bar, the step)
    box(g, b.x + 30, STREET - 30, 20, 30, INK); box(g, b.x + 31, STREET - 29, 18, 29, '#0F172A'); bandedGradient(g, b.x + 33, STREET - 27, 14, 14, ['#1E3A5F', '#2B5A8A', '#3B7AB4'], 3);
    box(g, b.x + 33, STREET - 12, 14, 2, '#CBD5E1'); box(g, b.x + 26, STREET - 3, 28, 3, '#E2E8F0');
    // (its sign over the window: little lit letters on a strip)
    g.font = '6px "Press Start 2P"'; g.textAlign = 'center'; g.textBaseline = 'middle';
    box(g, b.x + 8, top + 2, 64, 9, INK); box(g, b.x + 9, top + 3, 62, 7, '#1E1B4B');
    g.fillStyle = mix(b.col, '#FFFFFF', 0.45); g.fillText(b.name, b.x + 40, top + 7);
    // (the googie roof: a boomerang, banded, a ball on a stalk up off it)
    g.save(); g.beginPath(); g.moveTo(b.x - 10, top + 1); g.lineTo(b.x + 40, top - 20); g.lineTo(b.x + 90, top + 1); g.closePath(); g.fillStyle = INK; g.fill(); g.clip();
    bandedGradient(g, b.x - 10, top - 20, 100, 22, ['#FFFFFF', '#E2E8F0', '#94A3B8'], 3);
    g.restore();
    box(g, b.x + 39, top - 34, 2, 14, '#94A3B8'); sphere(g, b.x + 40, top - 36, 4, b.col);
    // (a planter by the door)
    box(g, b.x + 56, STREET - 10, 16, 10, INK); box(g, b.x + 57, STREET - 9, 14, 9, '#78716C'); pixelBlob(g, b.x + 64, STREET - 13, 8, 5, '#16A34A');
  }
  yield;
  hazeBands(g, 0, STREET - 40, W, 40, '#E0F2FE', 0, 0.16, 4);
  // (the pavement: banded, the curb, the gutter, the cracks, the lane's dashes; bent toward the eye)
  bandedGradient(g, 0, STREET, W, H - STREET, ['#64748B', '#56657A', '#475569', '#3B475A', '#334155'], 8);
  box(g, 0, STREET, W, 4, '#CBD5E1'); box(g, 0, STREET + 4, W, 2, '#94A3B8'); box(g, 0, STREET + 6, W, 2, '#3B475A');
  for (let i = 0; i < 40; i++) { const x = hash(i) * W, y = STREET + 12 + hash(i * 3) * 80; box(g, x, y, 4 + hash(i * 5) * 8, 1, '#3A4558'); box(g, x + 2, y + 1, 2, 1, '#6B7A90'); }
  for (let x = 20; x < W; x += 80) { box(g, x, STREET + 50, 40, 4, '#FACC15'); box(g, x, STREET + 50, 40, 1, '#FEF08A'); box(g, x, STREET + 53, 40, 1, '#CA8A04'); }
  checker(g, 0, STREET + 8, W, 4, '#475569', 0, 2);
  yield;
  bendFloor(g, { x: EYE }, STREET, STREET + 6, H);
}

interface Layers { key: string; back: HTMLCanvasElement; front: HTMLCanvasElement; job: Generator<void, void> | null }
let layers: Layers | null = null;
const startLayers = (): Layers => {
  const key = `${timeOfDay().key}-${typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n'}`;
  if (layers && layers.key === key) return layers;
  const mk = (h: number) => { const cv = document.createElement('canvas'); cv.width = W * RENDER_SCALE; cv.height = h * RENDER_SCALE; return cv; };
  const back = mk(H + PAD), front = mk(H);
  const gb = back.getContext('2d')!, gf = front.getContext('2d')!;
  gb.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, PAD * RENDER_SCALE); gf.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
  const job = (function* () { yield* paintBack(gb); yield; yield* paintFront(gf); })();
  return (layers = { key, back, front, job });
};
/** Paints a few ms of it, till `until` (all of it: Infinity): true once it's done. */
const paintOn = (L: Layers, until: number) => {
  while (L.job) { if (L.job.next().done) L.job = null; else if (performance.now() >= until) return false; }
  return true;
};
let warming = false;
/** Paints the shot's still layers ahead (from the ride's build), a few ms per idle moment: no hitch when it cuts in. */
export const prewarmLaunch = () => {
  if (typeof document === 'undefined' || warming) return;
  warming = true;
  idleJob(until => { const done = paintOn(startLayers(), until); if (done) warming = false; return done; });
};

// ---------------------------------------------------------------------------------------------------------------
// The live parts

/** The hole: the shell torn open, its panels peeled back round it, the light of the ride inside; the hatch lid
 *  blown off up into the sky; the shell's chunks; the sparks off the torn edges; the smoke pouring out of it. */
const drawHole = (c: Ctx, t: number) => {
  if (t <= 4) return;
  const [hx, hy] = HOLE_C, open = Math.min(1, (t - 4) / 4);
  // (the petals of shell, bent up and back round the rim: red steel, lit along their edges, their insides dark)
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.2, len = (7 + hash(k * 11) * 8) * open, wid = 0.36;
    const bx = hx + Math.cos(a) * 33, by = hy + Math.sin(a) * 18;
    const tx = hx + Math.cos(a) * (33 + len), ty = hy + Math.sin(a) * (18 + len * 0.55) - len * 0.6;
    const pts = [[hx + Math.cos(a - wid) * 34, hy + Math.sin(a - wid) * 19], [tx, ty], [hx + Math.cos(a + wid) * 34, hy + Math.sin(a + wid) * 19]];
    c.fillStyle = INK; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0] + 1, pts[1][1] - 1); c.lineTo(pts[2][0], pts[2][1]); c.closePath(); c.fill();
    c.fillStyle = k % 3 === 1 ? '#1D4ED8' : '#991B1B'; c.beginPath(); c.moveTo(pts[0][0] + 1, pts[0][1]); c.lineTo(pts[1][0], pts[1][1]); c.lineTo(pts[2][0] - 1, pts[2][1]); c.closePath(); c.fill();
    c.strokeStyle = k % 3 === 1 ? '#93C5FD' : '#F87171'; c.lineWidth = 1; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]); c.stroke();
    box(c, bx - 1, by - 1, 2, 2, '#CBD5E1');
  }
  // (the opening: jagged, the dark inside, the ride's light coming up out of it)
  c.save();
  c.beginPath();
  for (let k = 0; k <= 18; k++) { const a = (k / 18) * Math.PI * 2, r = 1 - (k % 2) * 0.12 - hash(k) * 0.08; const x = hx + Math.cos(a) * 36 * r, y = hy + Math.sin(a) * 20 * r; k ? c.lineTo(x, y) : c.moveTo(x, y); }
  c.closePath(); c.fillStyle = INK; c.fill(); c.clip();
  bandedGradient(c, hx - 36, hy - 20, 72, 40, ['#020617', '#1C1917', '#431407', '#7C2D12'], 4);
  const fl = 0.55 + 0.2 * Math.sin(t * 0.7) + 0.1 * ((t >> 1) % 2);
  steppedGlow(c, hx, hy + 10, 30, '#F97316', fl * 0.7, 0.05, 4);
  steppedGlow(c, hx, hy + 12, 14, '#FDE68A', fl * 0.6, 0.1, 3);
  c.restore();
  // (the torn rim: bright bare metal, glowing hot a while)
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.ellipse(hx, hy, 35, 19.5, 0, 0, Math.PI * 2); c.stroke();
  const hot = clamp01(1 - (t - 4) / 90);
  c.strokeStyle = mix('#E2E8F0', '#FB923C', hot); c.lineWidth = 1.5; c.beginPath(); c.ellipse(hx, hy, 34, 19, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
};

/** The hatch lid: a round door, blown straight up off the top and spinning, end over end, down behind it all. */
const drawLid = (c: Ctx, t: number) => {
  const u = t - 4;
  if (u <= 0) return;
  const x = HOLE_C[0] - u * 2.6, y = HOLE_C[1] - 8 - u * 11 + 0.3 * u * u;
  if (y > STREET - 30) return;
  const spin = Math.cos(u * 0.35), tilt = u * 0.08;
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(1, Math.max(0.12, Math.abs(spin)));
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 22, 22, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = spin > 0 ? '#B91C1C' : '#52525B'; c.beginPath(); c.ellipse(0, 0, 20, 20, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = spin > 0 ? '#DC2626' : '#71717A'; c.beginPath(); c.ellipse(-3, -3, 14, 14, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#CBD5E1'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 18, 18, 0, 0, Math.PI * 2); c.stroke();
  if (spin > 0) { box(c, -8, -2, 16, 4, INK); box(c, -7, -1, 14, 2, '#FACC15'); }
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; box(c, Math.cos(a) * 16 - 1, Math.sin(a) * 16 - 1, 2, 2, '#E2E8F0'); }
  c.restore();
};

/** Chunks of the shell: curved panels, each stepped, bolts along an edge, tumbling up and out and down. */
const drawChunks = (c: Ctx, t: number) => {
  if (t <= 4) return;
  for (let k = 0; k < 14; k++) {
    const u = (t - 4) * (0.9 + hash(k) * 0.6);
    const px = HOLE_C[0] + (hash(k * 3) - 0.42) * u * 3.4, py = HOLE_C[1] - u * (3 + hash(k * 7) * 3.4) + 0.045 * u * u;
    if (py > H + 20) continue;
    const col = k % 3 === 1 ? '#2563EB' : '#DC2626', r = rampOf(col), w = 8 + Math.floor(hash(k * 5) * 4) * 2, h = 5 + (k % 3) * 2;
    c.save(); c.translate(px, py); c.rotate(u * (0.12 + hash(k * 9) * 0.2) * (k % 2 ? 1 : -1));
    box(c, -w / 2 - 1, -h / 2 - 1, w + 2, h + 2, INK); box(c, -w / 2, -h / 2, w, h, r[2]); box(c, -w / 2, -h / 2, w, 2, r[3]); box(c, -w / 2, h / 2 - 1, w, 1, r[0]);
    box(c, -w / 2 + 1, -h / 2 + 1, 1, 1, '#E2E8F0'); box(c, w / 2 - 2, -h / 2 + 1, 1, 1, '#E2E8F0');
    c.restore();
  }
};

/** Sparks off the torn edges: hot streaks, white to yellow to orange as they cool, falling. */
const drawSparks = (c: Ctx, t: number) => {
  for (let k = 0; k < 40; k++) {
    const born = 4 + hash(k * 13) * (k < 24 ? 10 : 70), age = t - born, life = 14 + hash(k * 17) * 16;
    if (age < 0 || age > life) continue;
    const a = -Math.PI / 2 + (hash(k * 19) - 0.5) * 2.6, sp = 4 + hash(k * 23) * 6;
    const ox = HOLE_C[0] + Math.cos(a) * 30, oy = HOLE_C[1] + Math.sin(a) * 14;
    const vx = Math.cos(a) * sp, vy = Math.sin(a) * sp, g = 0.35;
    const x = ox + vx * age, y = oy + vy * age + g * age * age / 2, dvy = vy + g * age;
    const k2 = age / life, col = k2 < 0.3 ? '#FFFFFF' : k2 < 0.6 ? '#FDE047' : '#FB923C';
    c.strokeStyle = col; c.lineWidth = k2 < 0.5 ? 2 : 1;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - vx * 1.6, y - dvy * 1.6); c.stroke();
  }
};

/** Smoke pouring up out of the hole the whole shot, and drifting off on the wind: dark and thick at first, greying. */
const drawSmoke = (c: Ctx, t: number) => {
  if (t <= 4) return;
  for (let s = 5; s <= t; s += 3) {
    const a = t - s;
    if (a > 100) continue;
    const k = a / 100, j = hash(s * 7);
    const x = HOLE_C[0] + (j - 0.5) * 18 + a * (0.55 + j * 0.3) + Math.sin(a * 0.08 + s) * 4;
    const y = HOLE_C[1] - 6 - Math.sqrt(a) * 13 - a * 0.25;
    const r = 7 + a * 0.32 + j * 4;
    const v = Math.round(mixN(s < 40 ? 40 : 70, 150, k));
    pixelBlob(c, x, y, r, r * 0.82, `rgba(${v}, ${v}, ${v + 6}, ${(0.75 * (1 - k)).toFixed(3)})`);
    pixelBlob(c, x - r * 0.25, y - r * 0.25, r * 0.55, r * 0.45, `rgba(${v + 40}, ${v + 40}, ${v + 46}, ${(0.5 * (1 - k)).toFixed(3)})`);
  }
};
const mixN = (a: number, b: number, k: number) => a + (b - a) * k;

/** The chaser bulbs on the rings' front halves (running). */
const drawBulbs = (c: Ctx, t: number) => {
  const lampy = timeOfDay().lamps > 0.3;
  for (const [ri, a] of ring3.entries()) for (let k = 0; k < 14; k++) {
    if ((k + ri + (t >> 2)) % 3) continue;
    const [x, y] = ringPt((k + 0.5) / 14 * Math.PI, a);
    if (lampy) box(c, x - 2, y - 2, 5, 5, 'rgba(254, 249, 195, 0.45)');
    box(c, x - 1, y - 1, 3, 3, '#FEF9C3'); box(c, x - 1, y - 1, 1, 1, '#FFFFFF');
  }
};

/** A shadow on the street under something up in the air (gone if it's too high). */
const shadow = (c: Ctx, x: number, y: number, w: number) => {
  const up = STREET - y, k = 1 - up / 320;
  if (k <= 0) return;
  c.fillStyle = `rgba(15, 23, 42, ${(0.35 * k).toFixed(3)})`;
  c.beginPath(); c.ellipse(x, STREET + 8, w * (0.5 + k * 0.5), 3 + k * 2, 0, 0, Math.PI * 2); c.fill();
};

/** The rush of air off something flying: streaks back along the way it came, fading. */
const streaks = (c: Ctx, pts: { x: number; y: number }[], spread: number, col: string) => {
  for (let lane = -1; lane <= 1; lane++) {
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, n = Math.hypot(dx, dy) || 1, ox = -dy / n * lane * spread, oy = dx / n * lane * spread;
      c.strokeStyle = col; c.globalAlpha = (0.55 - i * 0.08) * (lane ? 0.6 : 1);
      if (c.globalAlpha <= 0) continue;
      c.lineWidth = lane ? 1 : 2; c.beginPath(); c.moveTo(a.x + ox, a.y + oy); c.lineTo(b.x + ox, b.y + oy); c.stroke();
    }
  }
  c.globalAlpha = 1;
};

/** One of the two from the sled in front, tumbling: a guest in a T-shirt and shorts, flailing (middle at x, y). */
const rider = (c: Ctx, x: number, y: number, rot: number, seed: number, f: number) => {
  const B = bodyOf(seed, 'thrown', f >> 2), Lk = lookOf(seed);
  c.save(); c.translate(x, y); c.scale(RIDER_K, RIDER_K); c.rotate(rot); c.translate(0, 36);
  hairBack(c, B);
  legs(c, B, { col: Lk.pants, shoe: 'sneaker', shoeCol: '#F5F5F4', bareBelow: true });
  const fl = flailHands(B, f >> 2)!;
  arm(c, B, -1, fl[0][0], fl[0][1], { sleeve: Lk.shirt, hand: Lk.skin, len: 0.4 });
  torso(c, B, Lk.shirt);
  headShape(c, B, Lk.skin);
  faceOn(c, B, { skin: Lk.skin, eyes: 'wide', mouth: 'o', md: 'ok' });
  hairTop(c, B);
  arm(c, B, 1, fl[1][0], fl[1][1], { sleeve: Lk.shirt, hand: Lk.skin, len: 0.4 });
  c.restore();
};

/** A star sled, tumbling (its middle at x, y); or what's left of it on the street, in two (`wreck`). */
const sled = (c: Ctx, x: number, y: number, rot: number, look: SledLook, wreck: boolean, t: number, seed: number) => {
  if (!wreck) { c.save(); c.translate(x, y); c.scale(SLED_K, SLED_K); drawSled(c, 0, 20, 0, look, false, rot); c.restore(); return; }
  // (snapped in two: the nose end over on its side, the tail end upside down past it; smoke off the break)
  for (const [half, dx, r] of [[-1, -20, 0.5], [1, 22, -2.8]] as const) {
    c.save(); c.translate(x + dx, STREET - 4); c.scale(SLED_K, SLED_K); c.rotate(r * (seed % 2 ? 1 : -1) * 0.3 + (half > 0 ? Math.PI * 0.08 : 0));
    c.beginPath(); c.rect(half < 0 ? -90 : 0, -120, 90, 140); c.clip();
    drawSled(c, 0, 10, 0, look, false, 0);
    c.restore();
  }
  for (let i = 0; i < 4; i++) { const u = ((t * 0.8 + i * 30 + seed * 7) % 120) / 120, v = Math.round(70 + u * 60); pixelBlob(c, x + Math.sin(t * 0.05 + i) * 5, STREET - 14 - u * 90, 5 + u * 14, 4 + u * 11, `rgba(${v}, ${v}, ${v + 6}, ${(0.6 * (1 - u)).toFixed(3)})`); }
  if ((t >> 2) % 3) { box(c, x - 3, STREET - 16, 5, 7, '#EA580C'); box(c, x - 2, STREET - 14, 2, 4, '#FDE68A'); }
};

/** Him, his own sprite (drawPlayer, the freefall's poses: windmilling and bicycling in the air, flat on his face, up
 *  again), his pants as they are (clean, shitty, gone), his glasses on; `ff` the pose, feet at (x, y). */
const him = (c: Ctx, state: GameState, x: number, y: number, ff: NonNullable<Player['freefall']>, alpha = 1) => {
  const p = state.player;
  const q = {
    ...p, pos: { x: -p.width / 2, y: -p.height }, vel: { x: 0, y: 0 }, hidden: false, freefall: ff, facing: 1, inCutscene: true,
    spriteRot: undefined, spriteScaleX: undefined, spriteScaleY: undefined, squash: undefined, stance: undefined,
    invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, hurtForm: undefined, hurtFormTimer: 0, filthShieldTimer: 0, headless: undefined,
    gut: p.gut ? { t: 0, stage: p.gut.stage, washed: p.gut.washed } : undefined,
  } as Player;
  c.save(); c.globalAlpha = alpha; c.translate(x, y); c.scale(ME_K, ME_K);
  drawPlayer(c, q, state, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  c.restore();
};
/** (feet from his middle, turned about his middle: where to put his feet for his middle to be at x, y) */
const MID = 35 * ME_K;

/** The smear: from where the first of them hit, skidding on to where the last of them stops (k: how far it's got). */
const BLOOD = ['#2A0606', '#4A0A0A', '#6E1010', '#991B1B', '#C02626', '#E04848', '#F8A0A0'];
const drawSmear = (c: Ctx, t: number) => {
  if (t <= OUT_SPLAT) return;
  const k = Math.min(1, (t - OUT_SPLAT) / 14), a = LAND_A - 14, b = a + (LAND_B + 70 - a) * k;
  for (let x = a; x < b; x += 4) {
    const v = (x - a) / (LAND_B + 70 - a), th = 4 + Math.sin(x * 0.09) * 2 + v * 6;
    box(c, x, STREET + 9 - th / 2, 4, th, (x >> 2) % 3 ? BLOOD[3] : BLOOD[2]);
    box(c, x, STREET + 9 - th / 2, 4, 1, BLOOD[4]);
    if ((x >> 2) % 5 === 1) box(c, x + 1, STREET + 9 - th / 2, 2, 1, BLOOD[6]);
  }
  for (let j = 0; j < 16; j++) { const x = a + hash(j) * (b - a), y = STREET + 2 + hash(j * 5) * 16; box(c, x, y, 2 + hash(j * 2) * 4, 2, BLOOD[1 + (j % 5)]); }
  // (the heap at the far end, and the bits: a sneaker, a fanny pack, somebody's ears hat)
  if (k >= 1) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(LAND_B + 64, STREET + 8, 14, 7, 0, Math.PI, 0); c.fill();
    for (let s = 0; s < 3; s++) { c.fillStyle = BLOOD[2 + s]; c.beginPath(); c.ellipse(LAND_B + 64 - s, STREET + 8 - s, 12 - s * 3, 6 - s * 1.5, 0, Math.PI, 0); c.fill(); }
    box(c, LAND_B + 58, STREET + 1, 1, 4, '#F4EAD0'); box(c, LAND_B + 62, STREET, 1, 4, '#F4EAD0');
    box(c, LAND_B + 30, STREET + 3, 9, 5, INK); box(c, LAND_B + 31, STREET + 4, 7, 3, '#F8FAFC'); box(c, LAND_B + 31, STREET + 6, 7, 1, '#9CA3AF');
    box(c, LAND_A + 28, STREET + 5, 11, 6, INK); box(c, LAND_A + 29, STREET + 6, 9, 4, '#7C3AED'); box(c, LAND_A + 29, STREET + 6, 9, 1, '#A78BFA');
    for (const ex of [0, 10]) { c.fillStyle = INK; c.beginPath(); c.arc(LAND_B + 6 + ex, STREET + 6, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#1E3A8A'; c.beginPath(); c.arc(LAND_B + 6 + ex, STREET + 6, 4, 0, Math.PI * 2); c.fill(); }
  }
  // (the burst of it as they hit: red flying up and out, coming down)
  for (const [x0, t0] of [[LAND_A, OUT_SPLAT], [LAND_B, 10 + OUT_FLY - 6]] as const) {
    const u = t - t0;
    if (u < 0 || u > 26) continue;
    for (let j = 0; j < 14; j++) {
      const vx = (hash(j * 3 + x0) - 0.3) * 7, vy = -3 - hash(j * 7 + x0) * 6, x = x0 + vx * u, y = STREET + vy * u + 0.4 * u * u;
      if (y > STREET + 12) continue;
      box(c, x, y, 3, 3, BLOOD[2 + (j % 4)]);
    }
  }
};

/** The whole outside shot, `t` frames in (0..OUT_END). */
export const drawLaunchOutside = (c: Ctx, state: GameState, t: number) => {
  const Ls = startLayers();
  paintOn(Ls, Infinity);
  const cam = camOf(t);
  c.save();
  c.translate(0, cam);
  c.drawImage(Ls.back, 0, -PAD, W, H + PAD);
  drawHole(c, t);
  c.drawImage(Ls.front, 0, 0, W, H);
  drawBulbs(c, t);
  drawSmoke(c, t);
  drawLid(c, t);
  drawChunks(c, t);
  drawSparks(c, t);
  // (the flash as it goes)
  if (t > 4 && t < 40) steppedGlow(c, HOLE[0], HOLE[1] + 20, 30 + t * 1.6, '#FDE047', 0.7 * (1 - t / 40), 0.05, 5);
  drawSmear(c, t);
  // The two of them (first out, first down: the smear), the sleds (in bits), him (a bounce, a roll, up)
  const a = arc(t, 6, OUT_FLY - 10, LAND_A), b = arc(t, 10, OUT_FLY - 6, LAND_B);
  const trail = (t0: number, len: number, lx: number) => { const out: { x: number; y: number }[] = []; for (let k = 0; k < 7; k++) { const p = arc(t - k * 2, t0, len, lx); if (p) out.push(p); } return out; };
  if (a && !a.done) { shadow(c, a.x, a.y, 14); streaks(c, trail(6, OUT_FLY - 10, LAND_A), 7, '#F8FAFC'); rider(c, a.x, a.y, t * 0.3, 8811, t); }
  if (b && !b.done) { shadow(c, b.x, b.y, 14); streaks(c, trail(10, OUT_FLY - 6, LAND_B), 7, '#F8FAFC'); rider(c, b.x, b.y, -t * 0.35, 9922, t + 7); }
  const s1 = arc(t, 14, OUT_FLY, LAND_SLED[0]), s2 = arc(t, 18, OUT_FLY, LAND_SLED[1]);
  if (s1) { if (!s1.done) { shadow(c, s1.x, s1.y, 30); streaks(c, trail(14, OUT_FLY, LAND_SLED[0]), 10, '#E0F2FE'); } sled(c, s1.x, s1.y, t * 0.2, HIS_SLED, s1.done, t, 1); }
  if (s2) { if (!s2.done) { shadow(c, s2.x, s2.y, 30); streaks(c, trail(18, OUT_FLY, LAND_SLED[1]), 10, '#E0F2FE'); } sled(c, s2.x, s2.y, -t * 0.25, FRONT_SLED, s2.done, t, 2); }
  // (him: windmilling all the way over; a bounce off the pavement, a roll, flat on his face; up on his feet)
  const m = arc(t, 20, OUT_FLY + 8, LAND_ME);
  if (m) {
    const down = OUT_LAND_ME, air = (rot: number, tt: number) => ({ style: 'flail' as const, t: 20 + tt, rot, land: 0 });
    if (!m.done) {
      shadow(c, m.x, m.y, 18);
      const tr = trail(20, OUT_FLY + 8, LAND_ME);
      streaks(c, tr, 11, '#FFFFFF');
      // (a ghost or two of him back along it: the blur of him going)
      for (const [k, al] of [[4, 0.18], [2, 0.32]] as const) { const g = arc(t - k, 20, OUT_FLY + 8, LAND_ME); if (g && t - k >= 20) him(c, state, g.x, g.y + MID, air((t - k) * 0.4, t - k - 20), al); }
      him(c, state, m.x, m.y + MID, air(t * 0.4, t - 20));
    } else {
      const u = t - down;
      if (u < 26) {
        const x = LAND_ME - u * 1.2, y = STREET - 12 - Math.sin((u / 26) * Math.PI) * 40;
        shadow(c, x, y, 18);
        // (the thump off the pavement: dust)
        if (u < 12) for (let j = 0; j < 6; j++) pixelBlob(c, LAND_ME + (j - 2.5) * (6 + u), STREET + 2 - u * 0.6, 4 + u * 0.5, 3 + u * 0.3, `rgba(203, 213, 225, ${(0.6 * (1 - u / 12)).toFixed(3)})`);
        him(c, state, x, y + MID, air(down * 0.4 + u * 0.5, down - 20 + u));
      } else if (u < 40) {
        // (rolling along the street to a stop, face down)
        const v = (u - 26) / 14, r0 = down * 0.4 + 13, r1 = Math.ceil((r0 - Math.PI / 2) / (Math.PI * 2)) * Math.PI * 2 + Math.PI / 2 + Math.PI * 2;
        const x = LAND_ME - 31 - (u - 26), y = STREET - 14 * ME_K - Math.abs(Math.sin(v * Math.PI * 2)) * 4;
        him(c, state, x, y + MID, air(r0 + (r1 - r0) * (1 - (1 - v) * (1 - v)), down - 20 + u));
      } else {
        // (flat on his face a moment, then up stiff as a board, a shake of the head)
        him(c, state, LAND_ME - 45, STREET, { style: 'flail', t: 0, rot: 0, land: Math.min(100, 50 + (u - 40)) });
      }
    }
  }
  c.restore();
  // (the white of the blast, a few frames)
  if (t > 4 && t < 12) { c.fillStyle = `rgba(255, 251, 235, ${(0.4 * (1 - (t - 4) / 8)).toFixed(3)})`; c.fillRect(0, 0, W, H); }
  if (t > OUT_END - OUT_FADE) { c.fillStyle = `rgba(0,0,0,${Math.min(1, (t - (OUT_END - OUT_FADE)) / OUT_FADE)})`; c.fillRect(0, 0, W, H); }
};
