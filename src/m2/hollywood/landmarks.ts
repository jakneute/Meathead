// Hollywood Land's landmarks far off, shared by every outdoor section's backdrop so each is the same thing in the same
// place wherever it's glimpsed from (the art pass's "tease the other attractions"):
//
// - the land's own attractions over the rooftops, each where it is along the land: THRONES OF THE STARS (its crimson
//   track and gold rail, the lift hill, the big loop, the top hat, the INSANITY LOOPS getting smaller, the gold crown of
//   its station; a train of toilets clanking up the lift), the secret warehouse (NOTHING TO SEE HERE), the backlot's
//   New York Street (plywood skyscrapers on their 2x4 braces, water tanks) and its western town, DISASTER: THE RIDE (the
//   poured concrete front with its painted cracks, the black marquee, the orange canopy, the show building behind with
//   its murals: a tornado, a wave, a bolt; a fiberglass meteor stuck in its roof), and STUNTMAN STEVE'S STUPENDOUS
//   STUNTERY (the amphitheater's stands rising to both ends in his yellow and stunt red, the truss with the marquee in
//   bulbs, the light towers, his banner, bunting). Things further along the land sit to the right, things behind to the
//   left, each further one smaller and hazier (log-spaced by how many sections away it is), and within a section each
//   slides by its depth; one isn't drawn where the real thing's in the scene (or he's inside it).
// - the park's horizon past the HAPPYWOOD hill: the neighbors' landmarks, small and hazy (America USA's biggest flag in
//   the world, Cartoon Land's rainbow over its hills with faces, Fairy Land's castle and its spires, and across the whole
//   park SPACE NEEDLE 2's shaft going on up out of sight, as Future Land has it).
// - the sky kept busy: high smoggy streaks and flat clouds drifting, Stuntman Steve's blimp going over (yellow: everything
//   of his is), a plane towing a REVENGERS 15 banner, searchlights sweeping after dark (a premiere, every night); once the
//   real disasters are on, a news helicopter circling instead.
//
// Everything still is painted once (for the hour, per scale) into a stamp and put down; only the train, the beams, the
// blimp, the plane and the helicopter move, all cheap. No volcanoes.

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../m1/constants';
import { timeOfDay, farTint, skyAt, hourMix, cloudTint, type TimeOfDay } from '../timeOfDay';
import { type Ctx, INK, box, checker, mix, hash, stamp, poly, pixelBlob, signText, plain, STEVE } from './blvd/kit';
import { SECTIONS, SECTION_ORDER, HWX } from './geometry';
import { drawNeedle } from '../space/square/sky';
import { drawBust } from '../grossBust';
import { steveBust } from './steveBust';

const W = CANVAS_WIDTH;
type T = (c: string) => string;

/** A far color for the hour, then into the sky's haze by k (the boulevard's far layers' own). */
const farCol = (tod: TimeOfDay, k: number): T => (c: string) => mix(farTint(hourMix(c, mix(c, '#8A5A70', 0.2), mix(c, '#141832', 0.45), tod), 1, tod), skyAt(0.86, tod), k);
const ramp = (T: T, c: string) => [mix(c, INK, 0.55), mix(c, INK, 0.3), c, mix(c, '#FFFFFF', 0.22), mix(c, '#FFFFFF', 0.45)].map(T);
const r2 = (v: number) => Math.round(v / 2) * 2;
/** A block lit down its left (a strip, dithered off), shaded down its right (a band, dithered in), inked round. */
const block = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], ink = true) => {
  x = Math.round(x); y = Math.round(y); w = Math.max(2, Math.round(w)); h = Math.max(2, Math.round(h));
  if (ink) box(g, x - 1, y - 1, w + 2, h + 1, R[0]);
  box(g, x, y, w, h, R[2]);
  const lw = Math.max(1, Math.round(w * 0.1)), sw = Math.max(2, Math.round(w * 0.24));
  box(g, x, y, lw, h, R[3]); if (w > 12) checker(g, x + lw, y, 2, h, R[3]);
  box(g, x + w - sw, y, sw, h, R[1]); if (w > 12) checker(g, x + w - sw - 2, y, 2, h, R[1], 1);
};

// ---------------------------------------------------------------------------------------------------------------
// The land's own attractions (each painted at scale s, its foot along y = 0, from x = 0 rightward)

/** A run of the coaster's track: inked, the crimson spine, the gold rail lit along its top (coaster/far.ts's look). */
const track = (g: Ctx, pts: [number, number][], s: number, T: T) => {
  const path = () => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = T(INK); g.lineWidth = Math.max(2, 7 * s); g.beginPath(); path(); g.stroke();
  g.strokeStyle = T('#7A121C'); g.lineWidth = Math.max(1.5, 5 * s); g.beginPath(); path(); g.stroke();
  g.save(); g.translate(0, -Math.max(1, 1.8 * s));
  g.strokeStyle = T('#C8962E'); g.lineWidth = Math.max(1, 2 * s); g.beginPath(); path(); g.stroke();
  g.translate(-0.5, -0.5); g.strokeStyle = T('#FFE89A'); g.lineWidth = Math.max(0.6, 0.8 * s); g.beginPath(); path(); g.stroke();
  g.restore(); g.lineCap = 'butt';
};
const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number, n = 32): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as [number, number]; });
/** A lattice leg down to the ground (two chords and a zigzag). */
const leg = (g: Ctx, x: number, top: number, s: number, T: T) => {
  const w = Math.max(3, Math.round(10 * s)), cw = Math.max(1, Math.round(1.6 * s));
  x = Math.round(x - w / 2); top = Math.round(top);
  box(g, x - 1, top, w + 2, -top, T('#1A1C22')); box(g, x, top, w, -top, T('#3A3E48'));
  box(g, x, top, cw, -top, T('#8890A0')); box(g, x + w - cw, top, cw, -top, T('#4A505C'));
  if (s > 0.3) { g.strokeStyle = T('#626A76'); g.lineWidth = 1; g.beginPath(); for (let y = top + 3; y < -3; y += 14 * s) { g.moveTo(x + cw, y); g.lineTo(x + w - cw, y + 7 * s); g.lineTo(x + cw, y + 14 * s); } g.stroke(); }
};
/** THRONES OF THE STARS' lift hill, in local px (for the train going up it). */
const LIFT = { x0: 70, y0: 40, x1: 330, y1: 540 } as const;
const thrones = (g: Ctx, s: number, T: T) => {
  const X = (v: number) => v * s, Y = (v: number) => -v * s;
  const runs: [number, number][][] = [], legs: [number, number][] = [];
  const push = (pts: [number, number][]) => runs.push(pts.map(([x, y]) => [X(x), Y(y)] as [number, number]));
  push([[LIFT.x0, LIFT.y0], [LIFT.x1, LIFT.y1]]);
  push(arcPts(352, 540, 22, Math.PI, 0, 10));
  push([[374, 540], [520, 40]]);
  for (let k = 0; k <= 8; k++) legs.push([LIFT.x0 + k * 32, LIFT.y0 + k * 62]);
  for (let k = 1; k <= 4; k++) legs.push([374 + k * 29, 540 - k * 100]);
  push([[520, 40], [600, 40]]);
  push(arcPts(660, 180, 140, 0, Math.PI * 2, 48));
  legs.push([660, 40]);
  push([[720, 40], [790, 40], [810, 80], [810, 640]]);
  push(arcPts(850, 640, 40, Math.PI, 0, 14));
  push([[890, 640], [890, 80], [910, 40]]);
  legs.push([810, 330], [890, 330]);
  push([[910, 40], [1170, 40]]);
  let x = 930;
  for (const r of [70, 56, 44, 34, 26, 19, 14]) { push(arcPts(x + r, 40 + r, r, 0, Math.PI * 2, Math.max(14, Math.round(r / 2)))); legs.push([x + r, 40]); x += r * 2 + 6; }
  for (const [lx, ly] of legs) leg(g, X(lx), Y(ly) + 2 * s, s, T);
  // (the station's crown at the lift's foot: crimson, gold points, the name over it)
  const sw = X(110), sh = Math.max(6, X(46));
  box(g, -1, -sh - 1, sw + 2, sh + 1, T(INK)); box(g, 0, -sh, sw, sh, T('#6A0A1E')); box(g, 0, -sh, Math.max(1, X(6)), sh, T('#8A1A2E'));
  for (let k = 0; k < 5; k++) { const px = X(6 + k * 20); poly(g, [[px, -sh], [px + X(10), -sh - X(18)], [px + X(20), -sh]], T('#E8C25A')); }
  box(g, 0, -sh, sw, Math.max(1, X(4)), T('#E8C25A'));
  for (const r of runs) track(g, r, s, T);
  if (s >= 0.34) {
    const bw = 50, by = -sh - X(18) - 16;
    box(g, X(55) - bw / 2 - 1, by - 1, bw + 2, 13, T('#C8962E')); box(g, X(55) - bw / 2, by, bw, 11, T('#1C1014'));
    signText(g, 'THRONES', X(55), by + 9, plain(1, 1, T('#E8C25A')));
  }
  // (bulbs round the big loop after dark)
  if (timeOfDay().lamps > 0.3) for (let k = 0; k < 28; k++) { const a = (k / 28) * Math.PI * 2; box(g, Math.round(X(660 + Math.cos(a) * 146)), Math.round(Y(180 + Math.sin(a) * 146)), 2, 2, k % 2 ? '#FFE8A0' : '#FF8A6A'); }
};
/** The train of toilets clanking up the lift (live). */
const thronesLive = (c: Ctx, x: number, foot: number, s: number, f: number, T: T) => {
  const u = ((f * 0.0012) % 1.25);
  if (u > 1) return;
  for (let k = 0; k < 5; k++) {
    const t = Math.max(0, u - k * 0.022), px = x + (LIFT.x0 + (LIFT.x1 - LIFT.x0) * t) * s, py = foot - (LIFT.y0 + (LIFT.y1 - LIFT.y0) * t) * s - 4 * s;
    const w = Math.max(2, Math.round(9 * s)), h = Math.max(2, Math.round(7 * s));
    box(c, px - w / 2 - 1, py - h - 1, w + 2, h + 2, T(INK)); box(c, px - w / 2, py - h, w, h, T('#F4F2EC')); box(c, px - w / 2, py - h, Math.max(1, w / 3), Math.max(1, h / 2), T('#C8C4BC'));
  }
};

/** The secret warehouse: a big corrugated barn under a low gable, its roll-up doors, a light over each, a sign. */
const warehouse = (g: Ctx, s: number, T: T) => {
  const w = 760 * s, h = 230 * s, R = ramp(T, '#8A929C'), Rr = ramp(T, '#5A626C');
  poly(g, [[-3, -h + 1], [w / 2, -h - 34 * s], [w + 3, -h + 1]], T(INK));
  poly(g, [[-1, -h], [w / 2, -h - 32 * s], [w / 2, -h]], Rr[3]); poly(g, [[w / 2, -h - 32 * s], [w + 1, -h], [w / 2, -h]], Rr[1]);
  block(g, 0, -h, w, h, R);
  for (let x = 4; x < w - 4; x += Math.max(3, 6 * s)) box(g, Math.round(x), Math.round(-h), 1, Math.round(h), R[1]);
  box(g, 0, Math.round(-h), Math.round(w), 2, R[4]); box(g, 0, Math.round(-12 * s - 2), Math.round(w), Math.round(12 * s + 2), R[1]);
  for (let k = 0; k < 4; k++) {
    const dx = r2(w * (0.1 + k * 0.22)), dw = r2(90 * s), dh = r2(130 * s);
    box(g, dx - 1, -dh - 1, dw + 2, dh + 1, T(INK)); box(g, dx, -dh, dw, dh, R[1]);
    for (let y = -dh + 3; y < 0; y += Math.max(2, Math.round(6 * s))) box(g, dx, y, dw, 1, R[0]);
    box(g, dx + dw / 2 - 3, -dh - 8 * s - 3, 6, 3, T('#2A2A2E')); box(g, dx + dw / 2 - 2, -dh - 8 * s - 2, 4, 1, timeOfDay().lamps > 0.3 ? '#FFF2C0' : T('#C8C8B8'));
  }
  if (s >= 0.3) {
    const tw = 6 * 19 + 10, ty = Math.round(-h + 30 * s);
    box(g, Math.round(w / 2 - tw / 2) - 1, ty - 1, tw + 2, 13, T(INK)); box(g, Math.round(w / 2 - tw / 2), ty, tw, 11, T('#E8E2D2'));
    signText(g, 'NOTHING TO SEE HERE', w / 2, ty + 9, plain(1, 1, T('#B4243A')));
  }
};

/** The backlot from afar: New York Street (plywood skyscrapers, their braces sticking out the back, wooden water tanks
 *  up top, cornices) and the western town's false fronts lower down beside it. */
const backlot = (g: Ctx, s: number, T: T) => {
  const towers: [number, number, number, string][] = [[0, 130, 300, '#9A5A44'], [140, 160, 370, '#B8AA92'], [310, 120, 260, '#8A6A58'], [440, 150, 330, '#A89A8A']];
  for (const [x0, w0, h0, col] of towers) {
    const x = x0 * s, w = w0 * s, h = h0 * s, R = ramp(T, col);
    // (the braces behind, sticking out past its right edge: raw 2x4s)
    g.strokeStyle = T('#80562A'); g.lineWidth = Math.max(1, 3 * s); g.beginPath();
    for (let k = 0; k < 3; k++) { g.moveTo(x + w - 2, -h + h * (0.15 + k * 0.3)); g.lineTo(x + w + 26 * s, 0); }
    g.stroke();
    block(g, x, -h, w, h, R);
    for (let wy = -h + 14 * s; wy < -10 * s; wy += Math.max(4, 16 * s)) for (let wx = x + 8 * s; wx < x + w - 10 * s; wx += Math.max(4, 14 * s)) box(g, Math.round(wx), Math.round(wy), Math.max(1, Math.round(6 * s)), Math.max(1, Math.round(8 * s)), timeOfDay().lamps > 0.35 && hash(wx * 3 + wy) > 0.55 ? '#FFD88A' : T('#3A4258'));
    box(g, Math.round(x - 3 * s), Math.round(-h - 6 * s), Math.round(w + 6 * s), Math.max(2, Math.round(6 * s)), R[3]);
    // (a wooden water tank up top on its legs)
    if (w0 > 125) { const tx = x + w * 0.62, tw = 30 * s, th = 28 * s; for (const lx of [tx + 3 * s, tx + tw - 5 * s]) box(g, Math.round(lx), Math.round(-h - 18 * s), Math.max(1, Math.round(2 * s)), Math.round(12 * s), T('#3A2A1E')); block(g, tx, -h - 18 * s - th, tw, th, ramp(T, '#7A5A3A')); poly(g, [[tx - 2, -h - 18 * s - th], [tx + tw / 2, -h - 30 * s - th], [tx + tw + 2, -h - 18 * s - th]], T('#4A3424')); }
  }
  // (the western town: false fronts, their tops stepped and scrolled, SALOON on the biggest)
  let x = 600 * s;
  const fronts: [number, number, string][] = [[70, 110, '#B8865A'], [90, 140, '#C8A070'], [60, 96, '#9A6A44']];
  for (const [w0, h0, col] of fronts) {
    const w = w0 * s, h = h0 * s, R = ramp(T, col);
    block(g, x, -h, w, h, R);
    box(g, Math.round(x + w * 0.3), Math.round(-h - 10 * s), Math.round(w * 0.4), Math.round(10 * s), R[2]);
    for (let k = x + 2; k < x + w; k += Math.max(3, 8 * s)) box(g, Math.round(k), Math.round(-h), 1, Math.round(h), R[1]);
    box(g, Math.round(x), Math.round(-h * 0.45), Math.round(w), Math.max(2, Math.round(5 * s)), R[0]);
    x += w + 6 * s;
  }
  if (s >= 0.3) signText(g, 'SALOON', 600 * s + 70 * s + 6 * s + 45 * s, Math.round(-140 * s + 22 * s), plain(1, 1, T('#3A1E10')));
};

/** DISASTER: THE RIDE: the show building (a windowless box, its panels, its murals: a tornado, a wave, a bolt; AC units,
 *  a fiberglass meteor stuck in its roof, its flames painted on), and in front of it the poured concrete front with the
 *  cracks painted on, the black marquee (DISASTER: in orange, THE RIDE in yellow), the orange canopy over black doors. */
const DIS = { a: 40, fw: 520, fh: 400, bw: 980, bh: 300 } as const;
const disaster = (g: Ctx, s: number, T: T) => {
  const C = ramp(T, '#6A625E'), B = ramp(T, '#7E7670'), O = ramp(T, '#C2410C');
  const bx = 180 * s, bw = (DIS.bw - 180) * s, bh = DIS.bh * s;
  block(g, bx, -bh, bw, bh, B);
  for (let x = bx + 40 * s; x < bx + bw; x += 80 * s) box(g, Math.round(x), Math.round(-bh), 1, Math.round(bh), B[1]);
  box(g, Math.round(bx), Math.round(-bh), Math.round(bw), 2, B[4]);
  // (the murals on its side: a tornado, a wave curling, a bolt)
  const mx = bx + bw * 0.42, my = -bh + 50 * s, mw = 130 * s, mh = 140 * s;
  for (let k = 0; k < 3; k++) {
    const x0 = mx + k * (mw + 20 * s);
    if (x0 + mw > bx + bw - 10 * s) break;
    box(g, Math.round(x0) - 1, Math.round(my) - 1, Math.round(mw) + 2, Math.round(mh) + 2, T(INK));
    const sky = [T('#2A1A3A'), T('#5A2A3A'), T('#A8442A')];
    for (let i = 0; i < 3; i++) box(g, Math.round(x0), Math.round(my + (i * mh) / 3), Math.round(mw), Math.ceil(mh / 3), sky[i]);
    if (k === 0) for (let i = 0; i < 9; i++) { const ww = (60 - i * 6) * s; box(g, Math.round(x0 + mw / 2 - ww / 2 + Math.sin(i) * 4 * s), Math.round(my + 10 * s + i * 13 * s), Math.round(ww), Math.max(1, Math.round(13 * s)), T(i % 2 ? '#8A8A9A' : '#6A6A7A')); }
    else if (k === 1) { poly(g, [[x0, my + mh], [x0 + mw * 0.2, my + mh * 0.45], [x0 + mw * 0.55, my + mh * 0.3], [x0 + mw * 0.8, my + mh * 0.5], [x0 + mw * 0.6, my + mh * 0.55], [x0 + mw, my + mh]], T('#2A5A9A')); poly(g, [[x0 + mw * 0.2, my + mh * 0.45], [x0 + mw * 0.55, my + mh * 0.3], [x0 + mw * 0.8, my + mh * 0.5], [x0 + mw * 0.55, my + mh * 0.38]], T('#E8F0F8')); }
    else poly(g, [[x0 + mw * 0.55, my + 6 * s], [x0 + mw * 0.3, my + mh * 0.55], [x0 + mw * 0.5, my + mh * 0.55], [x0 + mw * 0.35, my + mh - 6 * s], [x0 + mw * 0.75, my + mh * 0.42], [x0 + mw * 0.55, my + mh * 0.42], [x0 + mw * 0.7, my + 6 * s]], T('#FDE047'));
  }
  // (AC units along its roof; the meteor stuck in the far corner, its flames painted on)
  for (let k = 0; k < 4; k++) block(g, bx + bw * (0.3 + k * 0.1), -bh - 14 * s, 26 * s, 14 * s, ramp(T, '#A8ACB0'));
  const mtx = bx + bw * 0.86, mty = -bh;
  for (const [dx, dy, r, col] of [[22, -40, 22, '#F97316'], [34, -58, 14, '#FDE047'], [10, -30, 16, '#C2410C']] as const) pixelBlob(g, mtx + dx * s, mty + dy * s, r * s, r * s * 0.8, T(col));
  pixelBlob(g, mtx, mty - 14 * s, 34 * s, 28 * s, T('#3A2E2A')); pixelBlob(g, mtx - 8 * s, mty - 22 * s, 20 * s, 14 * s, T('#5A4A44')); pixelBlob(g, mtx - 12 * s, mty - 28 * s, 8 * s, 6 * s, T('#7A6A62'));
  // (the front)
  const fx = DIS.a * s, fw = DIS.fw * s, fh = DIS.fh * s;
  block(g, fx, -fh, fw, fh, C);
  for (let y = -fh + 40 * s; y < 0; y += 40 * s) box(g, Math.round(fx), Math.round(y), Math.round(fw), 1, C[1]);
  g.strokeStyle = T(INK); g.lineWidth = Math.max(1, 2 * s);
  for (let k = 0; k < 6; k++) { let x = fx + (40 + k * 86) * s, y = -fh + 10 * s; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 6; q++) { x += (hash(k * 7 + q) - 0.5) * 30 * s; y += (16 + hash(k + q * 3) * 14) * s; g.lineTo(x, y); } g.stroke(); }
  // (the marquee: black, banded orange under it; DISASTER: THE RIDE)
  const mqx = fx + 20 * s, mqy = -fh + 18 * s, mqw = 480 * s, mqh = 96 * s;
  box(g, Math.round(mqx) - 1, Math.round(mqy) - 1, Math.round(mqw) + 2, Math.round(mqh) + 2, T(INK)); box(g, Math.round(mqx), Math.round(mqy), Math.round(mqw), Math.round(mqh), T('#1C1917'));
  box(g, Math.round(mqx), Math.round(mqy + mqh), Math.round(mqw), Math.max(2, Math.round(4 * s)), O[3]);
  const big = s >= 0.5 ? 2 : 1;
  signText(g, 'DISASTER:', mqx + mqw / 2, Math.round(mqy + mqh * 0.45), plain(big, big + (s >= 0.34 ? 1 : 0), T('#F97316'), T('#3A1004')));
  signText(g, 'THE RIDE', mqx + mqw / 2, Math.round(mqy + mqh * 0.9), plain(big, big + (s >= 0.34 ? 1 : 0), T('#FDE047'), T('#3A1004')));
  // (the canopy, the doors)
  box(g, Math.round(fx + 190 * s), Math.round(-150 * s), Math.round(220 * s), Math.max(2, Math.round(14 * s)), O[3]); box(g, Math.round(fx + 190 * s), Math.round(-150 * s), Math.round(220 * s), 1, O[4]);
  box(g, Math.round(fx + 248 * s), Math.round(-132 * s), Math.round(104 * s), Math.round(132 * s), T('#0C0A09'));
  box(g, Math.round(fx + 299 * s), Math.round(-132 * s), Math.max(1, Math.round(3 * s)), Math.round(132 * s), T('#57534E'));
};

/** STUNTMAN STEVE'S STUPENDOUS STUNTERY from outside: the stands' backs rising to both ends (the bowl), banded in his
 *  yellow and stunt red, the seat rows up the rakes at the ends; the truss on its two towers over the middle with the
 *  marquee hung off it in bulbs; three light towers; his banner; bunting strung between. */
const STU = { w: 1100, h: 470 } as const;
const STU_TOWERS = [90, 550, 1010] as const;
const stuntery = (g: Ctx, s: number, T: T) => {
  const Y = STEVE.map(T), Rd = ramp(T, '#B4243A'), Cn = ramp(T, '#B8B0A4'), St = ramp(T, '#626A76'), lamps = timeOfDay().lamps > 0.3;
  const X = (v: number) => v * s;
  // (the light towers, behind)
  for (const tx of STU_TOWERS) {
    const top = -X(440);
    box(g, Math.round(X(tx)) - 3, Math.round(top), 6, Math.round(-top), St[0]); box(g, Math.round(X(tx)) - 2, Math.round(top), 4, Math.round(-top), St[2]); box(g, Math.round(X(tx)) - 2, Math.round(top), 1, Math.round(-top), St[4]);
    const lw = Math.max(8, Math.round(X(40))), lh = Math.max(4, Math.round(X(20)));
    box(g, Math.round(X(tx) - lw / 2) - 1, Math.round(top - lh) - 1, lw + 2, lh + 2, T(INK));
    for (let k = 0; k < lw; k += Math.max(3, Math.round(lw / 4))) box(g, Math.round(X(tx) - lw / 2 + k), Math.round(top - lh), Math.max(2, Math.round(lw / 4) - 1), lh, lamps ? '#FFF2C8' : T('#C8C8B8'));
  }
  // (the truss on its towers, the marquee off it)
  const t0 = X(330), t1 = X(770), ty = -X(370);
  for (const tx of [t0, t1]) { box(g, Math.round(tx) - 4, Math.round(ty), 8, Math.round(-ty), St[0]); box(g, Math.round(tx) - 3, Math.round(ty), 6, Math.round(-ty), St[2]); checker(g, Math.round(tx) - 3, Math.round(ty), 6, Math.round(-ty), St[3], 0, 2); }
  box(g, Math.round(t0) - 6, Math.round(ty) - 1, Math.round(t1 - t0) + 12, Math.max(4, Math.round(X(18))) + 2, T(INK));
  box(g, Math.round(t0) - 5, Math.round(ty), Math.round(t1 - t0) + 10, Math.max(4, Math.round(X(18))), St[2]);
  g.strokeStyle = St[4]; g.lineWidth = 1; g.beginPath(); for (let x = t0; x < t1; x += Math.max(4, X(18))) { g.moveTo(x, ty + 1); g.lineTo(x + X(9), ty + X(17)); g.lineTo(x + X(18), ty + 1); } g.stroke();
  const mw = X(420), mh = Math.max(10, X(54)), mx = X(550) - mw / 2, my = ty + X(26);
  box(g, Math.round(mx) - 1, Math.round(my) - 1, Math.round(mw) + 2, Math.round(mh) + 2, T(INK)); box(g, Math.round(mx), Math.round(my), Math.round(mw), Math.round(mh), T('#0E0C10'));
  const bs = Math.max(2, Math.round(X(5)));
  for (let x = mx + 3; x < mx + mw - 3; x += bs * 2) for (const y of [my + 2, my + mh - 2 - bs]) box(g, Math.round(x), Math.round(y), bs, bs, lamps ? '#FFF2B0' : T('#A08A4A'));
  const big = s >= 0.5 ? 2 : 1;
  signText(g, s >= 0.3 ? "STEVE'S STUNTERY" : 'STUNTS', X(550), Math.round(my + mh / 2 + 4 * big), plain(big, big, Y[4], T('#3A2404')));
  // (the stands' backs: a wall rising to both ends, banded yellow and red, the seat rows up the rakes at the ends)
  const prof = (x: number) => { const u = Math.abs(x / STU.w - 0.5) * 2; return 150 + Math.pow(u, 1.6) * 170; };
  for (let x = 40; x < STU.w - 40; x += 2 / s) {
    const h = prof(x), px = Math.round(X(x)), ph = Math.round(X(h)), u = x / STU.w;
    const R = u < 0.15 ? Cn[3] : u > 0.82 ? Cn[1] : Cn[2];
    box(g, px, -ph, Math.max(1, Math.ceil(2)), ph, R);
    box(g, px, -ph, 2, Math.max(1, Math.round(X(4))), T(INK));
    box(g, px, Math.round(-ph * 0.55), 2, Math.max(2, Math.round(X(14))), Y[3]);
    box(g, px, Math.round(-ph * 0.55 + X(14)), 2, Math.max(1, Math.round(X(6))), Rd[2]);
    box(g, px, Math.round(-X(20)), 2, Math.round(X(20)), Cn[1]);
  }
  // (the rakes' rows at each end: yellow and red seats in steps)
  for (const side of [-1, 1]) {
    for (let r = 0; r < 7; r++) {
      const x0 = side < 0 ? 40 + r * 18 : STU.w - 40 - r * 18 - 60, y = prof(side < 0 ? 40 + r * 18 : STU.w - 40 - r * 18) - 8;
      box(g, Math.round(X(x0)), Math.round(-X(y)), Math.round(X(60)), Math.max(1, Math.round(X(5))), r % 2 ? Rd[3] : Y[3]);
    }
  }
  // (his banner, down the right end)
  const bx = X(860), by = -X(300), bw = Math.max(8, X(64)), bh = Math.max(14, X(110));
  box(g, Math.round(bx) - 1, Math.round(by) - 1, Math.round(bw) + 2, Math.round(bh) + 2, T(INK)); box(g, Math.round(bx), Math.round(by), Math.round(bw), Math.round(bh), Y[3]);
  box(g, Math.round(bx), Math.round(by), Math.max(1, Math.round(bw * 0.15)), Math.round(bh), Y[4]); box(g, Math.round(bx + bw * 0.82), Math.round(by), Math.max(1, Math.round(bw * 0.18)), Math.round(bh), Y[2]);
  const fx = bx + bw * 0.25, fy = by + bh * 0.18, fw = bw * 0.5, fh = bh * 0.38;
  box(g, Math.round(fx), Math.round(fy), Math.round(fw), Math.round(fh), T('#E2B48C')); box(g, Math.round(fx - 1), Math.round(fy - 2), Math.round(fw + 2), Math.max(1, Math.round(fh * 0.25)), T('#8A5A2A'));
  box(g, Math.round(fx + fw * 0.1), Math.round(fy + fh * 0.4), Math.round(fw * 0.8), Math.max(1, Math.round(fh * 0.12)), T('#2A2228'));
  box(g, Math.round(bx), Math.round(by + bh * 0.72), Math.round(bw), Math.max(2, Math.round(bh * 0.14)), Rd[2]);
  // (bunting: pennants strung tower to tower, in his colors)
  for (let k = 0; k < 2; k++) {
    const a = X(STU_TOWERS[k]), b = X(STU_TOWERS[k + 1]), y0 = -X(420);
    const n = Math.max(6, Math.round((b - a) / Math.max(5, X(16))));
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, px = a + (b - a) * u, py = y0 + Math.sin(u * Math.PI) * X(50);
      poly(g, [[px - X(5), py], [px + X(5), py], [px, py + Math.max(3, X(10))]], [Y[3], Rd[3], T('#F4EEE2')][i % 3]);
    }
  }
};

interface Mark { id: string; at: number; w: number; h: number; pad: number; paint: (g: Ctx, s: number, T: T) => void; hide: number[] }
/** The land's own attractions, by where each is along the land (its section's index), and where they're not drawn. */
const MARKS: Mark[] = [
  { id: 'thrones', at: 1, w: 1190, h: 700, pad: 40, paint: thrones, hide: [1] },
  { id: 'ware', at: 2, w: 770, h: 280, pad: 20, paint: warehouse, hide: [2, 3] },
  { id: 'backlot', at: 3, w: 820, h: 420, pad: 20, paint: backlot, hide: [3] },
  { id: 'disaster', at: 3.8, w: 990, h: 430, pad: 30, paint: disaster, hide: [3, 4] },
  { id: 'stuntery', at: 6, w: 1110, h: 480, pad: 20, paint: stuntery, hide: [6] },
];
/** Which section he's in, by the camera. */
const sectionAt = (x: number) => { let at = 0; SECTION_ORDER.forEach((id, i) => { if (x >= SECTIONS[id].x0 - 1500) at = i; }); return at; };

/**
 * The land's own attractions far off over the rooftops (screen space), each standing on `foot` (its layer's ground on
 * screen, where the section's far layers put depth ~0.03). `skip`: ids not to draw here (one the scene has up close).
 */
export const drawHwLandmarks = (c: Ctx, state: GameState, foot: number, skip: string[] = []) => {
  const tod = timeOfDay(), cam = state.camera.x + W / 2, at = sectionAt(cam), id = SECTION_ORDER[at], f = state.frame;
  const mid = (SECTIONS[id].x0 + SECTIONS[id].x1) / 2;
  const list = MARKS.filter(m => !m.hide.includes(at) && !skip.includes(m.id)).map(m => ({ m, d: m.at - at })).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
  for (const { m, d } of list) {
    const ad = Math.abs(d), s = Math.round((ad < 1 ? 0.6 : 0.55 / (1 + 0.55 * (ad - 1))) * 100) / 100;
    // (across the section it slides by its depth: the nearer, the more; the same distance whatever the section's length)
    const T = farCol(tod, Math.min(0.55, 0.16 + 0.07 * ad)), u = Math.max(-0.5, Math.min(0.5, (cam - mid) / (SECTIONS[id].x1 - SECTIONS[id].x0)));
    const cx = W / 2 + Math.sign(d) * 170 * Math.log2(1 + ad) - u * 200 * (s / 0.55);
    const x = Math.round(cx - (m.w * s) / 2), y = Math.round(foot - (ad - 1) * 3);
    if (x + m.w * s < -20 || x > W + 20) continue;
    c.save(); c.translate(x, y);
    stamp(c, `hwlm-${m.id}-${s}-${tod.key}`, -m.pad, -m.h * s - m.pad, m.w * s + m.pad * 2, m.h * s + m.pad + 4, g => m.paint(g, s, T));
    c.restore();
    if (m.id === 'thrones') thronesLive(c, x, y, s, f, T);
    if (m.id === 'stuntery' && tod.lamps > 0.3) for (const tx of STU_TOWERS) beam(c, x + tx * s, y - 450 * s, f * 0.008 + tx, 0.05 * tod.lamps, 240 + 300 * s);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The park's horizon past the HAPPYWOOD hill: the neighbors (painted once for the hour, small and hazy)

/** America USA's: the biggest flag in the world on the biggest pole, its stripes stepped where it folds. */
const flag = (g: Ctx, T: T) => {
  const ph = 260, fw = 120, fh = 66;
  box(g, -2, -ph, 4, ph, T('#4A4E58')); box(g, -2, -ph, 1, ph, T('#B8BCC8')); box(g, -4, -ph - 6, 8, 6, T('#C8A040'));
  for (let x = 0; x < fw; x += 2) {
    const fold = Math.sin(x * 0.09) * 4, dark = Math.cos(x * 0.09) < -0.3;
    for (let k = 0; k < 13; k++) box(g, 2 + x, -ph + 4 + fold + k * (fh / 13), 2, Math.ceil(fh / 13), T(mix(k % 2 ? '#F4F0E8' : '#B4243A', '#1C1430', dark ? 0.25 : 0)));
    if (x < fw * 0.42) box(g, 2 + x, -ph + 4 + fold, 2, Math.ceil((fh * 7) / 13), T(mix('#2A3A7A', '#1C1430', dark ? 0.25 : 0)));
  }
  for (let i = 0; i < 18; i++) box(g, 6 + (i % 6) * 8, -ph + 8 + Math.floor(i / 6) * 9 + Math.sin((6 + (i % 6) * 8) * 0.09) * 4, 2, 2, T('#F4F0E8'));
};
/** Cartoon Land: its rainbow over two-tone hills with faces, lollipop trees. */
const toon = (g: Ctx, T: T) => {
  const bands = ['#E84A5A', '#F59A3A', '#F8D84A', '#5AC85A', '#4A8AE8', '#9A5AD8'];
  bands.forEach((col, i) => { g.strokeStyle = T(col); g.lineWidth = 6; g.beginPath(); g.arc(150, -20, 120 - i * 6, Math.PI, 0); g.stroke(); });
  const hill = (cx: number, r: number, a: string, b: string) => {
    pixelBlob(g, cx, -2, r, r * 0.62, T(a)); pixelBlob(g, cx - r * 0.25, -r * 0.3, r * 0.5, r * 0.25, T(b));
    box(g, cx - r * 0.25, -r * 0.42, 4, 6, T(INK)); box(g, cx + r * 0.15, -r * 0.42, 4, 6, T(INK));
    g.strokeStyle = T(INK); g.lineWidth = 2; g.beginPath(); g.arc(cx - r * 0.05, -r * 0.3, r * 0.18, 0.3, Math.PI - 0.3); g.stroke();
  };
  hill(90, 70, '#F49AC8', '#FBC8E2'); hill(220, 84, '#8AD86A', '#B8F08E');
  for (const [lx, col] of [[30, '#E84A9A'], [300, '#F8D84A'], [160, '#4AC8E8']] as const) { box(g, lx - 1, -40, 2, 40, T('#F4F0E8')); pixelBlob(g, lx, -46, 9, 9, T(col)); pixelBlob(g, lx - 3, -49, 4, 4, T('#FFFFFF')); }
};
/** Fairy Land: the castle, white stone, blue spires tipped in gold, its pennants; the fairy wheel beside it. */
const castle = (g: Ctx, T: T) => {
  const S = ramp(T, '#E4E2EE'), B = ramp(T, '#3A6AD8'), G = T('#F2C84A');
  // (the wheel, behind)
  g.strokeStyle = T('#B89AE0'); g.lineWidth = 2; g.beginPath(); g.arc(250, -70, 56, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.beginPath(); g.moveTo(250, -70); g.lineTo(250 + Math.cos(a) * 56, -70 + Math.sin(a) * 56); g.stroke(); box(g, 250 + Math.cos(a) * 56 - 3, -70 + Math.sin(a) * 56 - 2, 6, 5, T(['#F49AC8', '#F8D84A', '#8AD8F0'][k % 3])); }
  poly(g, [[230, 0], [250, -70], [270, 0]], T('#8A7AB0'));
  const tower = (x: number, w: number, h: number, ch: number) => {
    block(g, x - w / 2, -h, w, h, S);
    for (let k = 0; k < w; k += 6) box(g, x - w / 2 + k, -h - 4, 3, 4, S[2]);
    poly(g, [[x - w / 2 - 3, -h], [x, -h - ch], [x + w / 2 + 3, -h]], B[2]); poly(g, [[x - w / 2 - 3, -h], [x, -h - ch], [x - w / 6, -h]], B[3]);
    box(g, x - 1, -h - ch - 8, 2, 8, G); poly(g, [[x + 1, -h - ch - 8], [x + 10, -h - ch - 5], [x + 1, -h - ch - 2]], T('#E84A5A'));
    for (let wy = -h + 12; wy < -14; wy += 18) box(g, x - 2, wy, 4, 7, timeOfDay().lamps > 0.3 ? '#FFE8A0' : T('#3A4A7A'));
  };
  block(g, 20, -70, 180, 70, S);
  tower(30, 24, 120, 50); tower(190, 24, 110, 46); tower(70, 30, 150, 64); tower(150, 30, 140, 60); tower(110, 40, 190, 84);
  box(g, 100, -30, 20, 30, T('#3A2A4A'));
};
interface Hz { id: string; bx: number; w: number; h: number; paint: (g: Ctx, T: T) => void; x0: number }
/** The neighbors, by where each sits on screen when he walks in (they slide at the horizon's depth after that). */
const HORIZON: Hz[] = [
  { id: 'flag', bx: 120, w: 130, h: 280, x0: 0, paint: flag },
  { id: 'toon', bx: 330, w: 320, h: 150, x0: 0, paint: toon },
  { id: 'castle', bx: 860, w: 320, h: 290, x0: 0, paint: castle },
];
const HZ_K = 0.0035;
/** The park's horizon past the hill (screen space): the neighbors standing on `foot` (under the hill's foot, so they're
 *  drawn after the mountains and before the hill), and SPACE NEEDLE 2 far across the park, its shaft going up out of
 *  sight (cut at `shaftTop` where clouds hang low). */
export const drawHwHorizon = (c: Ctx, state: GameState, foot: number, shaftTop = 0) => {
  const tod = timeOfDay(), slide = (state.camera.x - HWX) * HZ_K, T = farCol(tod, 0.56);
  for (const h of HORIZON) {
    // (painted at twice its size on the 2 px grid, put down at half: every cell a pixel)
    const x = Math.round(h.bx - slide - h.w / 4);
    if (x + h.w / 2 < -10 || x > W + 10) continue;
    c.save(); c.translate(x, Math.round(foot)); c.scale(0.5, 0.5);
    stamp(c, `hwhz-${h.id}-${tod.key}`, -10, -h.h - 10, h.w + 20, h.h + 14, g => h.paint(g, T));
    c.restore();
  }
  // (off the hill's right shoulder, clear of its letters)
  const nx = Math.round(790 - slide);
  if (nx > -40 && nx < W + 40) {
    c.save();
    if (shaftTop > 0) { c.beginPath(); c.rect(nx - 60, shaftTop, 120, foot - shaftTop + 10); c.clip(); }
    drawNeedle(c, nx, Math.round(foot) + 6, 0.12, state.frame);
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The sky, kept busy

/** A searchlight's beam (live): a long thin wedge up from (x, y), swinging, banded (a wide faint one, a narrow one). */
const beam = (c: Ctx, x: number, y: number, ph: number, a: number, len: number) => {
  const ang = -Math.PI / 2 + Math.sin(ph) * 0.5;
  for (const [wd, k] of [[0.07, 1], [0.03, 1.6]] as const) {
    c.fillStyle = `rgba(255, 246, 214, ${(a * k).toFixed(3)})`;
    c.beginPath(); c.moveTo(x - 2, y); c.lineTo(x + Math.cos(ang - wd) * len, y + Math.sin(ang - wd) * len); c.lineTo(x + Math.cos(ang + wd) * len, y + Math.sin(ang + wd) * len); c.lineTo(x + 2, y); c.closePath(); c.fill();
  }
};
const CW = 1024, CH = 200;
/** High smoggy streaks and flat little clouds, stepped (lit tops, shaded feet). */
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const dk = cloudTint(mix('#C8C0B8', '#C8A88A', 0.3), tod), body = cloudTint('#EAE4DC', tod), top = cloudTint('#FFFFFF', tod);
  for (let i = 0; i < 7; i++) {
    const y = 18 + hash(i * 5.5) * 40, x0 = (i * CW) / 7 + hash(i * 1.3) * 60, w = 120 + hash(i * 2.9) * 140;
    for (const xx of [x0, x0 - CW]) { box(g, xx, y, w, 2, body); checker(g, xx - 24, y, 24, 2, body, 0, 2); checker(g, xx + w, y, 30, 2, body, 1, 2); box(g, xx + w * 0.2, y + 4, w * 0.5, 2, dk); }
  }
  for (let i = 0; i < 6; i++) {
    const x = (i * CW) / 6 + hash(i * 3.1) * 90, y = 100 + hash(i * 1.7) * 70, w = 70 + hash(i * 2.3) * 80;
    for (const xx of x > CW - 120 ? [x, x - CW] : [x]) {
      pixelBlob(g, xx, y + 6, w * 0.55, 7, dk); pixelBlob(g, xx - w * 0.12, y, w * 0.28, 11, body); pixelBlob(g, xx + w * 0.2, y + 2, w * 0.2, 8, body);
      pixelBlob(g, xx - w * 0.18, y - 5, w * 0.14, 5, top); box(g, xx - w * 0.5, y + 11, w, 2, dk);
    }
  }
};
/** Stuntman Steve's blimp: yellow, round in stepped bands (lit up top, shaded under, its gores' seams), red fins, the
 *  nose cap, the gondola with its two props; on its side his face in a roundel, a gross-up the size of a house
 *  (steveBust.ts: the oiled tan, the aviators, the stained grin, sweating), the print curving round the envelope with
 *  it; STEVE, and STILL GOT IT (he hasn't). */
const paintBlimp = (g: Ctx, tod: TimeOfDay) => {
  const P = (c2: string) => farTint(c2, 0.5, tod), Y = STEVE.map(P), Rd = P('#B4243A'), RdD = P('#7A1424');
  const cx = 98, cy = 32, rx = 84, ry = 26;
  const ell = (x: number, y: number, a: number, b: number) => { g.beginPath(); g.ellipse(x, y, a, b, 0, 0, Math.PI * 2); };
  // (the fins, behind: inked, red, a lit edge)
  for (const s2 of [-1, 1]) {
    poly(g, [[30, cy + s2 * 4], [4, cy + s2 * 25], [16, cy + s2 * 2]], INK);
    poly(g, [[28, cy + s2 * 4], [7, cy + s2 * 22], [17, cy + s2 * 2]], Rd);
    poly(g, [[28, cy + s2 * 4], [7, cy + s2 * 22], [12, cy + s2 * 14]], s2 < 0 ? P('#D84A5A') : RdD);
  }
  // (the envelope: stepped bands, light from the upper left)
  g.fillStyle = INK; ell(cx, cy, rx + 1, ry + 1); g.fill();
  g.fillStyle = Y[1]; ell(cx, cy, rx, ry); g.fill();
  g.fillStyle = Y[2]; ell(cx - 2, cy - 2, rx - 2, ry - 3); g.fill();
  g.fillStyle = Y[3]; ell(cx - 5, cy - 4, rx - 7, ry - 7); g.fill();
  g.fillStyle = Y[4]; ell(cx - 12, cy - 10, rx - 26, ry - 17); g.fill();
  g.fillStyle = Y[5]; ell(cx - 22, cy - 15, 30, 3); g.fill();
  g.save(); ell(cx, cy, rx, ry); g.clip();
  checker(g, cx - rx, cy + 14, rx * 2, 2, Y[1], 0, 1); checker(g, cx - rx, cy - 8, rx * 2, 2, Y[3], 1, 1);
  // (the gores' seams: lines round it, dithered, closer toward its ends)
  for (const k of [-0.86, -0.66, -0.4, 0.4, 0.66, 0.86]) checker(g, Math.round(cx + k * rx), cy - ry, 1, ry * 2, Y[0], 0, 1);
  box(g, cx - rx, cy, rx * 2, 1, Y[1]);
  // (his roundel: inked, the red ring, his face (cream behind), the print bent round with the envelope)
  const fx = 60, fy = 31, fr = 19;
  g.fillStyle = INK; ell(fx, fy, fr + 3, fr + 2); g.fill();
  g.fillStyle = Rd; ell(fx, fy, fr + 2, fr + 1); g.fill();
  g.fillStyle = P('#D84A5A'); ell(fx - 1, fy - 1, fr + 1, fr); g.fill();
  g.fillStyle = P('#FFF4C8'); ell(fx, fy, fr, fr - 1); g.fill();
  g.save(); ell(fx, fy, fr, fr - 1); g.clip();
  for (let k = 0; k < 16; k += 2) { const a0 = (k / 16) * Math.PI * 2; poly(g, [[fx, fy], [fx + Math.cos(a0) * 30, fy + Math.sin(a0) * 30], [fx + Math.cos(a0 + 0.39) * 30, fy + Math.sin(a0 + 0.39) * 30]], P('#FCE6A0')); }
  drawBust(g, steveBust('poster', P('#FFFFFF')), fx - 20, fy - 21, 40, 42, 150);
  g.globalAlpha = 0.28; checker(g, fx - fr, fy + 9, fr * 2, 10, P('#3A2408'), 0, 1); box(g, fx - fr, fy + 14, fr * 2, 6, P('#3A2408'));
  g.globalAlpha = 0.16; box(g, fx - fr, fy - fr, fr * 2, 4, P('#FFFFFF')); g.globalAlpha = 1;
  g.restore();
  // (his name, and the claim)
  signText(g, 'STEVE', 130, 34, { sx: 2, sy: 2, gap: 1, fill: ['#FFFFFF', '#FFE8C8', '#E83A2A', '#B4243A', '#7A1424'].map(P), dither: true, ink: P('#2A1408'), shadow: P('#3A1E04'), drop: 1 });
  signText(g, 'STILL GOT IT', 128, 45, plain(1, 1, P('#5A2A08')));
  // (the envelope's shade over everything printed on its underside)
  g.globalAlpha = 0.22; box(g, cx - rx, cy + 16, rx * 2, 12, P('#3A2408')); g.globalAlpha = 1;
  g.restore();
  // (the nose cap: its battens, the mooring cone)
  g.fillStyle = INK; ell(cx + rx - 4, cy, 6, 10); g.fill(); g.fillStyle = Y[1]; ell(cx + rx - 4, cy, 5, 9); g.fill();
  box(g, cx + rx - 3, cy - 6, 2, 3, Y[3]); box(g, cx + rx + 1, cy - 1, 2, 2, P('#5A5E66'));
  // (the gondola: inked, lit along its top, its windows (lit after dark), the props out either side, blurred)
  box(g, 82, 56, 34, 10, INK); box(g, 83, 57, 32, 8, Y[2]); box(g, 83, 57, 32, 1, Y[4]); box(g, 83, 63, 32, 2, Y[0]);
  for (let k = 0; k < 5; k++) { box(g, 85 + k * 6, 59, 4, 3, tod.lamps > 0.3 ? '#FFE8A0' : P('#3A4A6A')); box(g, 85 + k * 6, 59, 1, 1, tod.lamps > 0.3 ? '#FFFBEA' : P('#9AB4D0')); }
  for (const ex of [76, 118]) { box(g, ex - 3, 58, 7, 5, INK); box(g, ex - 2, 59, 5, 3, P('#8A8E96')); box(g, ex - 2, 59, 5, 1, P('#C8CCD4')); checker(g, ex + (ex < 98 ? -5 : 4), 55, 2, 10, P('#C8CCD4'), 0, 1); }
  box(g, 82, 54, 34, 2, Y[0]);
};
/** A little prop plane towing a banner: REVENGERS 15 (SOON). */
const paintPlane = (g: Ctx, tod: TimeOfDay) => {
  const P = (c2: string) => farTint(c2, 0.5, tod);
  g.strokeStyle = P('#5A5A5A'); g.lineWidth = 1; g.beginPath(); g.moveTo(132, 9); g.lineTo(146, 8); g.stroke();
  box(g, 0, 2, 132, 15, INK); box(g, 1, 3, 130, 13, P('#F4F0E8')); box(g, 1, 3, 130, 2, P('#FFFFFF')); box(g, 1, 14, 130, 2, P('#C8C0B4'));
  for (let x = 0; x < 132; x += 22) box(g, x, 15, 6, 2, P('#C8C0B4'));
  signText(g, 'REVENGERS 15', 66, 14, plain(1, 1, P('#B4243A')));
  box(g, 146, 6, 18, 5, INK); box(g, 147, 7, 16, 3, P('#D8DCE4')); box(g, 152, 3, 4, 10, P('#8A929C')); box(g, 146, 4, 3, 4, P('#B4243A')); box(g, 163, 6, 2, 5, P('#3A3A3A'));
};
/**
 * The sky kept busy (screen space), drawn just after the sky (before anything on the ground): the clouds drifting,
 * Steve's blimp, the banner plane, searchlights after dark; `mode` 'real' (the real disasters: a news helicopter circling
 * instead of the blimp and the plane; the havoc has its own storm clouds, so `clouds` false there).
 */
export const drawHwSky = (c: Ctx, state: GameState, hz: number, mode: 'calm' | 'real' = 'calm', clouds = true) => {
  const tod = timeOfDay(), f = state.frame, cam = state.camera.x;
  const ct = Math.max(-60, Math.round(hz - 340));
  if (clouds) for (let x = -((((cam * 0.01 + f * 0.02) % CW) + CW) % CW); x < W; x += CW) { c.save(); c.translate(Math.round(x), ct); stamp(c, `hwsky-cl-${tod.key}`, 0, 0, CW, CH, g => paintClouds(g, tod)); c.restore(); }
  if (tod.lamps > 0.25 && mode === 'calm') for (let k = 0; k < 4; k++) {
    const bx = ((k * 263 + 120 - cam * 0.022) % 1050 + 1050) % 1050 - 120;
    beam(c, bx, hz + 8, f * 0.006 + k * 1.7, 0.045 * tod.lamps, 520);
  }
  const top = Math.max(30, Math.round(hz - 300));
  if (mode === 'calm') {
    const bx = Math.round((((f * 0.1 - cam * 0.02) % 1900) + 1900) % 1900 - 300), by = top + Math.round(Math.sin(f * 0.01) * 3);
    if (bx > -210 && bx < W + 10) { c.save(); c.translate(bx, by); stamp(c, `hwsky-blimp-${tod.key}`, -4, -4, 208, 76, g => paintBlimp(g, tod)); c.restore(); if (tod.lamps > 0.3 && (f >> 4) % 2) box(c, bx + 184, by + 31, 3, 3, '#FF4A4A'); }
    const px = Math.round((((-f * 0.35 - cam * 0.03) % 2600) + 2600) % 2600 - 400), py = top + 70 + Math.round(Math.sin(f * 0.02) * 2);
    if (px > -180 && px < W + 10) { c.save(); c.translate(px, py); stamp(c, `hwsky-plane-${tod.key}`, -2, -2, 172, 22, g => paintPlane(g, tod)); c.restore(); box(c, px + 164, py + 2 + ((f >> 1) % 2) * 6, 1, 4, '#E8E8E8'); }
  } else {
    // (a news helicopter circling the disaster, its light blinking)
    const a = f * 0.006, hx = Math.round(W * 0.55 + Math.cos(a) * 260), hy = Math.round(top + 40 + Math.sin(a * 2) * 24), d = Math.sin(a) > 0 ? 1 : -1;
    box(c, hx - 9, hy - 3, 18, 8, INK); box(c, hx - 8, hy - 2, 14, 6, '#3A4A6A'); box(c, hx + d * 3 - 2, hy - 1, 4, 3, '#9AC8E8');
    box(c, hx - d * 8 - (d > 0 ? 14 : 0), hy, 14, 2, INK);
    const r = (f >> 1) % 2 ? 14 : 6; box(c, hx - r, hy - 5, r * 2, 1, '#2A2A2A'); box(c, hx - 1, hy - 5, 2, 2, INK);
    if ((f >> 3) % 2) box(c, hx - 1, hy + 5, 2, 2, '#FF4A4A');
  }
};
