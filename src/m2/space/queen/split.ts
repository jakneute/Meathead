// THE QUEEN COMING APART AT THE SEAMS: the beat before her weakness death's burst (burst.ts), in slow motion, the
// camera pushed right in on her (the user's: "when breaking apart the alien with the mallet, really sell how it's
// splitting apart at multiple seams at once. slow down to show it then zoom out to show all its parts splayed
// everywhere"). Every seam on her at once: the neck, the shoulders (the arms' side of her chest), the waist, the hips,
// the tail's root. First they crack, lit from inside (her circuits shorting: yellow-white, racing out along each seam
// from its middle, all together); then all six parts of her part along them a few px at a time, the gaps blazing
// inside, her wiring stretched across them and snapping, sparks and her green spraying out of every one; then she
// goes (burst.ts) and the camera pulls back to the whole disco to see where it all lands (fight.ts: blownZoom).
//
// She's painted the once (as she was at the killing blow) into a canvas of her own, then put down a part at a time,
// each clipped to its piece of her and moved off along its seams: six drawImages a frame, not six of her.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { GY } from '../geometry';
import { drawQueen, type QueenDraw } from './art';
import { GREEN } from './paint';

type Ctx = CanvasRenderingContext2D;
type Pt = readonly [number, number];

/** Game frames into her weakness death: the seams cracked open by this (lit, racing out); the parts all apart by
 *  BURST_AT (this far, px), and she bursts. (Slow motion over all of it: fight.ts's queenHoldTick.) */
export const CRACK_T = 10, BURST_AT = 30;
const SEP = 15;
/** The camera's push-in on her while she splits (fight.ts: blownZoom; and the scale she's painted at for it). */
export const PUNCH = 1.75;
/** Her body's lean as she's drawn at the killing blow (sprite.ts: stunned, sag 0.4 x 0.35), about her waist. */
const LEAN = 0.14, PIV_Y = -110;
/** Her, about her middle on the floor (world px): the box she's painted the once into. */
const BOX = { x: -330, y: -390, w: 660, h: 430 };

const B = 600;
/** Her six parts: each a piece of her (in her body's frame: facing right, leaned, from her middle on the floor less
 *  the 36 she stands down on her own feet), which way it parts off her along its seams, its turn as it goes, about
 *  where. The pieces tile the lot between them (shared edges: the seams), so nothing of her is ever left out. */
interface Part { poly: Pt[]; dx: number; dy: number; r: number; pv: Pt }
const PARTS: Part[] = [
  // (the head and crest: up and forward off the neck)
  { poly: [[-B, -B], [B, -B], [B, -196], [64, -196], [42, -212], [24, -220], [18, -224], [4, -238], [-24, -246], [-60, -254], [-B, -262]], dx: 0.4, dy: -1.15, r: -0.14, pv: [30, -246] },
  // (the arms, the small ones and the front of her chest: forward off the shoulders)
  { poly: [[24, -220], [42, -212], [64, -196], [B, -196], [B, -96], [30, -100], [20, -112], [24, -140], [20, -165], [26, -184], [20, -200]], dx: 1.05, dy: 0.12, r: 0.12, pv: [30, -160] },
  // (her chest, the dorsal pipes, her back: up and back off the waist)
  { poly: [[-B, -262], [-60, -254], [-24, -246], [4, -238], [18, -224], [24, -220], [20, -200], [26, -184], [20, -165], [4, -170], [-12, -162], [-30, -168], [-B, -168]], dx: -0.45, dy: -0.8, r: -0.07, pv: [-4, -200] },
  // (her hips: where it all comes away from; a shudder down)
  { poly: [[-30, -168], [-12, -162], [4, -170], [20, -165], [24, -140], [20, -112], [4, -118], [-12, -110], [-28, -116], [-34, -130], [-26, -150]], dx: 0, dy: 0.15, r: 0, pv: [0, -140] },
  // (her legs: splaying off the hips)
  { poly: [[-28, -116], [-12, -110], [4, -118], [20, -112], [30, -100], [B, -96], [B, B], [-46, B], [-46, -90]], dx: 0.25, dy: 0.2, r: 0.05, pv: [0, -80] },
  // (her tail: back off its root)
  { poly: [[-B, -168], [-30, -168], [-26, -150], [-34, -130], [-28, -116], [-46, -90], [-46, B], [-B, B]], dx: -1.1, dy: 0.25, r: 0.09, pv: [-40, -110] },
];
const HEAD = 0, ARMS = 1, CHEST = 2, HIPS = 3, LEGS = 4, TAIL = 5;
/** Her seams, the bits of them that run through her (the gaps drawn between the two parts either side). */
interface Seam { pts: Pt[]; a: number; b: number }
const SEAMS: Seam[] = [
  { pts: [[-88, -258], [-60, -254], [-24, -246], [4, -238], [18, -224], [24, -220]], a: HEAD, b: CHEST },
  { pts: [[24, -220], [42, -212], [64, -196], [76, -196]], a: HEAD, b: ARMS },
  { pts: [[24, -220], [20, -200], [26, -184], [20, -165]], a: ARMS, b: CHEST },
  { pts: [[20, -165], [24, -140], [20, -112]], a: ARMS, b: HIPS },
  { pts: [[20, -112], [30, -100], [58, -97]], a: ARMS, b: LEGS },
  { pts: [[20, -165], [4, -170], [-12, -162], [-30, -168]], a: CHEST, b: HIPS },
  { pts: [[-30, -168], [-42, -168]], a: CHEST, b: TAIL },
  { pts: [[-28, -116], [-12, -110], [4, -118], [20, -112]], a: HIPS, b: LEGS },
  { pts: [[-30, -168], [-26, -150], [-34, -130], [-28, -116]], a: TAIL, b: HIPS },
  { pts: [[-28, -116], [-46, -90], [-46, -60]], a: TAIL, b: LEGS },
];
/** Her wiring, stretched across the gaps (seam, point along it, colour), each snapping this far apart (0..1). */
const WIRES: [number, number, string, number][] = [[0, 2, '#EF4444', 0.55], [0, 4, '#60A5FA', 0.8], [2, 1, '#FACC15', 0.5], [2, 2, '#EF4444', 0.9], [5, 1, '#60A5FA', 0.6], [5, 2, '#FACC15', 0.75], [7, 1, '#EF4444', 0.65], [8, 2, '#60A5FA', 0.7], [1, 1, '#FACC15', 0.85], [3, 1, '#60A5FA', 0.95]];

const clamp = (u: number) => Math.max(0, Math.min(1, u));
/** How far apart she's come (0..1) at `t`: none till CRACK_T, all of it by BURST_AT, quick at first. */
export const splitK = (t: number) => { const u = clamp((t - CRACK_T) / (BURST_AT - CRACK_T)); return 1 - (1 - u) * (1 - u); };
/** A part's move off her, at `d` px. */
const offOf = (p: Part, d: number) => ({ dx: p.dx * d, dy: p.dy * d, r: p.r * (d / SEP) });
/** A point of a part, moved with it. */
const moved = (q: Pt, p: Part, o: { dx: number; dy: number; r: number }): [number, number] => {
  const cs = Math.cos(o.r), sn = Math.sin(o.r), x = q[0] - p.pv[0], y = q[1] - p.pv[1];
  return [p.pv[0] + x * cs - y * sn + o.dx, p.pv[1] + x * sn + y * cs + o.dy];
};
/** Her body's frame (facing right, leaned) to the world, about her at x. */
const toWorld = (x: number, facing: 1 | -1, ext: number, q: Pt): [number, number] => {
  const cs = Math.cos(LEAN), sn = Math.sin(LEAN), ry = q[1] - PIV_Y;
  const bx = q[0] * cs - ry * sn, by = q[0] * sn + ry * cs + PIV_Y;
  return [x + facing * (ext + bx), GY + 36 + by];
};
const bodyFrame = (c: Ctx, x: number, facing: 1 | -1, ext: number) => {
  c.translate(Math.round(x), GY); c.scale(facing, 1); c.translate(ext, 36);
  c.translate(0, PIV_Y); c.rotate(LEAN); c.translate(0, -PIV_Y);
};
const unBodyFrame = (c: Ctx, x: number, facing: 1 | -1, ext: number) => {
  c.translate(0, PIV_Y); c.rotate(-LEAN); c.translate(0, -PIV_Y);
  c.translate(-ext, -36); c.scale(facing, 1); c.translate(-Math.round(x), -GY);
};
/** A point `u` (0..1) of the way along a seam. */
const along = (pts: Pt[], u: number): [number, number] => {
  const f = clamp(u) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), k = f - i;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
};

// ---------------------------------------------------------------------------------------------------------------
// Her, painted the once

let snap: { c: HTMLCanvasElement; key: number } | null = null;
const snapOf = (c: Ctx, key: number, x: number, facing: 1 | -1, qd: QueenDraw) => {
  if (snap && snap.key === key) return snap.c;
  // (at the scale she'll be seen at, pushed in: the screen's own resolution times the push-in, rounded up a bit)
  const s = Math.min(4, Math.max(2, Math.ceil((c.canvas.width / CANVAS_WIDTH) * PUNCH * 2) / 2));
  const cv = snap?.c ?? document.createElement('canvas');
  cv.width = Math.ceil(BOX.w * s); cv.height = Math.ceil(BOX.h * s);
  const g = cv.getContext('2d')!;
  g.setTransform(s, 0, 0, s, 0, 0); g.translate(-(x + BOX.x), -(GY + BOX.y));
  drawQueen(g, x, facing, qd);
  snap = { c: cv, key };
  return cv;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const poly = (c: Ctx, pts: readonly Pt[]) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); };
const line = (c: Ctx, pts: readonly Pt[], w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; poly(c, pts); c.stroke(); };

/** Her splitting at `t` (game frames, smoothed through the slow motion): `key` one per death (her painting). */
export const drawSplit = (c: Ctx, x: number, facing: 1 | -1, ext: number, t: number, key: number, qd: QueenDraw, fr: number) => {
  const img = snapOf(c, key, x, facing, qd);
  const k = splitK(t), d = k * SEP;
  // (shuddering: the whole of her, harder the further it's gone; each part a beat out of step with the next)
  const shake = 0.8 + k * 1.6;
  const offs = PARTS.map((p, i) => { const o = offOf(p, d), j = (Math.floor(t * 3) + i) % 2 ? shake : -shake; return { dx: o.dx + j * (i % 3 === 0 ? 1 : 0.5), dy: o.dy + j * (i % 3 === 1 ? 0.6 : 0.2), r: o.r }; });
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  bodyFrame(c, x, facing, ext);
  // (1) The gaps, behind her parts: her insides between them, dark, blazing at both lips, her wiring across
  if (k > 0) for (const s of SEAMS) {
    const pa = PARTS[s.a], pb = PARTS[s.b], A = s.pts.map(q => moved(q, pa, offs[s.a])), Bq = s.pts.map(q => moved(q, pb, offs[s.b]));
    const gap = [...A, ...Bq.slice().reverse()];
    c.fillStyle = '#0B0C10'; poly(c, gap); c.closePath(); c.fill();
    // (the inside lit: a hot core down the middle, flickering)
    const mid = A.map((q, i): Pt => [(q[0] + Bq[i][0]) / 2, (q[1] + Bq[i][1]) / 2]);
    line(c, mid, 1 + k * 3, fr % 4 < 2 ? '#F97316' : '#FB923C');
    line(c, mid, 0.5 + k * 1.2, fr % 3 ? '#FEF08A' : '#FFFFFF');
  }
  if (k > 0) for (const [si, pi, col, snapAt] of WIRES) {
    if (k >= snapAt) continue;
    const s = SEAMS[si], q = s.pts[Math.min(pi, s.pts.length - 1)];
    const a = moved(q, PARTS[s.a], offs[s.a]), b = moved(q, PARTS[s.b], offs[s.b]);
    // (stretched taut, thinning; lit along one side)
    const sag = (1 - k / snapAt) * 3;
    c.strokeStyle = '#06070B'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2 + sag, (a[1] + b[1]) / 2 + sag, b[0], b[1]); c.stroke();
    c.strokeStyle = col; c.lineWidth = 1.4; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2 + sag, (a[1] + b[1]) / 2 + sag, b[0], b[1]); c.stroke();
  }
  // (2) Her parts: each clipped to its piece of her, moved off along its seams
  for (let i = 0; i < PARTS.length; i++) {
    const p = PARTS[i], o = offs[i];
    c.save();
    c.translate(o.dx, o.dy); c.translate(p.pv[0], p.pv[1]); c.rotate(o.r); c.translate(-p.pv[0], -p.pv[1]);
    poly(c, p.poly); c.closePath(); c.clip();
    unBodyFrame(c, x, facing, ext);
    c.drawImage(img, x + BOX.x, GY + BOX.y, BOX.w, BOX.h);
    c.restore();
  }
  // (3) Over her: the cracks, racing out along every seam from its middle at once, ink with a hot core; and once
  // she's parting, both lips of every gap lit hot, arcs jumping it
  for (const s of SEAMS) {
    const pa = PARTS[s.a], pb = PARTS[s.b];
    if (k <= 0) {
      const u = clamp(t / (CRACK_T - 2)), n = 8, pts: Pt[] = [];
      for (let j = 0; j <= n; j++) pts.push(along(s.pts, 0.5 + (j / n - 0.5) * u));
      line(c, pts, 3, '#06070B');
      line(c, pts, 1.5, (fr + s.a) % 4 < 2 ? '#FDE047' : '#FFFFFF');
      continue;
    }
    const A = s.pts.map(q => moved(q, pa, offs[s.a])), Bq = s.pts.map(q => moved(q, pb, offs[s.b]));
    line(c, A, 1.2, '#FDBA74'); line(c, Bq, 1.2, '#FDBA74');
    if ((fr + s.b * 3) % 7 < 3) {
      // (an arc across: zigzag, white on blue)
      const u = ((fr * 0.37 + s.a * 0.29) % 1), a = along(A, u), b = along(Bq, u), mx = (a[0] + b[0]) / 2 + (fr % 2 ? 3 : -3), my = (a[1] + b[1]) / 2 + (fr % 3 ? -2 : 2);
      const arc: Pt[] = [a, [mx, my], b];
      line(c, arc, 2.4, '#60A5FA'); line(c, arc, 1, '#FFFFFF');
    }
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The spray, the noise (every game frame of it)

/** A spark or a squirt out of a seam, at a point of it, out along its normal (either side). */
const spray = (state: GameState, x: number, facing: 1 | -1, ext: number, s: Seam, u: number, k: number, green: boolean) => {
  const q = along(s.pts, u), a = along(s.pts, Math.max(0, u - 0.1)), b = along(s.pts, Math.min(1, u + 0.1));
  let nx = -(b[1] - a[1]), ny = b[0] - a[0];
  const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
  if (Math.random() < 0.5) { nx = -nx; ny = -ny; }
  const cs = Math.cos(LEAN), sn = Math.sin(LEAN), wx = (nx * cs - ny * sn) * facing, wy = nx * sn + ny * cs;
  const [px, py] = toWorld(x, facing, ext, q), v = green ? 3 + Math.random() * 5 : 4 + Math.random() * 9;
  const along2 = (Math.random() - 0.5) * 3;
  state.particles.push(green
    ? { pos: { x: px, y: py }, vel: { x: wx * v + along2, y: wy * v - 1.5 }, life: 40 + Math.random() * 30, color: Math.random() < 0.25 ? '#7F1D1D' : GREEN[1 + Math.floor(Math.random() * 3)], size: 2 + Math.random() * 3 + k * 2, grav: 0.3 }
    : { pos: { x: px, y: py }, vel: { x: wx * v + along2, y: wy * v - 1 }, life: 10 + Math.random() * 14, color: Math.random() < 0.5 ? '#FDE047' : '#FFFFFF', size: 1.5 + Math.random() * 2, grav: 0.22 });
};

/** Her splitting, a game frame on: the sparks, her green out of the gaps, the noise. All the seams at once. */
export const tickSplit = (state: GameState, x: number, facing: 1 | -1, ext: number, t: number) => {
  if (t >= BURST_AT) return;
  const k = splitK(t);
  if (t < CRACK_T) {
    // (cracking: a spark here and there along every seam as it races out; her circuits frying)
    for (const s of SEAMS) if (Math.random() < 0.6) spray(state, x, facing, ext, s, 0.5 + (Math.random() - 0.5) * (t / CRACK_T), 0, false);
    if (t % 2 === 0) playSound('rayFizzle', 0.6, 2 + t);
    if (t % 3 === 0) playSound('clang', 0.3, 8 + t);
    return;
  }
  if (t === CRACK_T) {
    // (every seam on her giving at once: a crack like a gunshot, all of them spitting sparks and her green)
    for (const s of SEAMS) for (let i = 0; i < 9; i++) spray(state, x, facing, ext, s, Math.random(), 0.5, i % 3 === 0);
    playSound('crash', 1, 2); playSound('clang', 0.9, -4); playSound('gush', 0.9, 2); playSound('rayFizzle', 1, -6);
    shakeScreen(state, 6, 8);
    return;
  }
  // (parting: sparks out of every gap, her green spraying out in jets, the wiring snapping as it goes)
  for (const s of SEAMS) {
    spray(state, x, facing, ext, s, Math.random(), k, false);
    if (Math.random() < 0.45) spray(state, x, facing, ext, s, 0.3 + (s.a * 0.17) % 0.4, k, true);
  }
  for (const w of WIRES) { const at = CRACK_T + (BURST_AT - CRACK_T) * (1 - Math.sqrt(1 - w[3])); if (Math.floor(at) === t) { playSound('bonk', 0.35, 10 + Math.random() * 6); spray(state, x, facing, ext, SEAMS[w[0]], 0.5, k, false); } }
  if (t % 3 === 0) playSound('rayFizzle', 0.5 + k * 0.3, 6 - k * 10);
  if (t % 4 === 0) playSound('gush', 0.35, 4);
};

/** Her seams' glow on the hall while she splits (the lighting pass). */
export const splitLights = (x: number, facing: 1 | -1, ext: number, t: number): Light[] => {
  if (t >= BURST_AT) return [];
  const k = splitK(t), on = clamp(t / CRACK_T);
  const at: Pt[] = [[10, -230], [26, -170], [-8, -165], [-4, -114], [-34, -130]];
  return at.map(q => {
    const [lx, ly] = toWorld(x, facing, ext, q);
    return { x: lx, y: ly, r: 50 + 70 * k, a: 0.35 + 0.45 * on, color: 'rgba(253, 224, 71, 0.24)' };
  });
};
