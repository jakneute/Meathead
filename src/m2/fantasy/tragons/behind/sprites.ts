// The ride from behind's pictures, painted once (each its own canvas, per hour where the light matters) and put down
// scaled by depth (and turned, through a roll: drawImage under a turned transform, never the stamp cache's):
//   the track's strips (the top of a coaster track seen from over it: two steel rails, a tie or the lane's box spine
//   between, one strip per lane, per haze step, per tie or not, out in the open or in the mountain's dark); a dragon car
//   from behind (its scaled hull, the gilt trim, the side handrails he grabs, its folded wings; the rear one with its
//   tail curled up off the back; the front one's neck and horned head up off it); his car's near panel (drawn over his
//   boots); a ring of fire (four flicker frames); a gantry of icicles; a frozen bar; a pine; the far panorama (snowy
//   hills, the castle on its crag, pine ridges: no volcanoes); the sky by the hour.
// Crude but readable (the first pass); the SNES pass comes later.

import { CANVAS_WIDTH } from '../../../../m1/constants';
import { mix, box, INK, GOLD, IRON, ramp6, polyF, type Ctx } from '../../kit';
import { drawTodSky, timeOfDay, farTint, thisHour } from '../../../timeOfDay';
import { LOOKS } from '../dragon';
import type { Lane } from '../layout';

type Cv = HTMLCanvasElement;
const cache = new Map<string, Cv>();
/** (off out of Fairy Land, or a new hour: everything painted again) */
export const clearBehindSprites = () => cache.clear();

/** A picture `w` x `h` (world units) painted `res` finer, its origin at (ox, oy) inside it; cached by key and hour. */
const pic = (key: string, w: number, h: number, ox: number, oy: number, res: number, paint: (g: Ctx) => void): Cv | null => {
  if (typeof document === 'undefined') return null;
  const id = `${key}@${timeOfDay().key}`;
  let cv = thisHour(cache).get(id);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = Math.ceil(w * res); cv.height = Math.ceil(h * res);
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.setTransform(res, 0, 0, res, ox * res, oy * res);
    paint(g);
    cache.set(id, cv);
  }
  return cv;
};
/** A picture's place about its origin (world units), to put it down by. */
export interface Placed { cv: Cv; x: number; y: number; w: number; h: number }
const placed = (cv: Cv | null, w: number, h: number, ox: number, oy: number): Placed | null => (cv ? { cv, x: -ox, y: -oy, w, h } : null);

// ---------------------------------------------------------------------------------------------------------------
// Haze

/** The haze, by step (0 near .. 5 far): toward the sky's blue-grey out in the open, toward black in the mountain. */
export const HAZE = 6;
export const hazeOf = (col: string, step: number, cave: boolean) => {
  if (step <= 0) return cave ? mix(col, '#000000', 0.35) : col;
  const k = step / (HAZE - 1);
  return cave ? mix(col, '#0A0612', 0.35 + k * 0.6) : mix(col, farTint('#8A9AC4', 0.4), k * 0.62);
};

// ---------------------------------------------------------------------------------------------------------------
// The track

/** The track's top, a strip across (the rails each side, between them a tie or the lane's spine and the dark): 72
 *  wide (TRACK_HW each side), 4 deep (stretched to the step's height). */
export const strip = (lane: Lane, step: number, tie: boolean, cave: boolean) => placed(pic(`strip${lane}${step}${tie ? 1 : 0}${cave ? 1 : 0}`, 72, 4, 0, 0, 1, g => {
  const H = (c: string) => hazeOf(c, step, cave);
  const L = LOOKS[lane];
  if (tie) { box(g, 4, 0, 64, 4, H('#3A2A22')); box(g, 4, 0, 64, 1, H('#5E4632')); }
  else box(g, 26, 0, 20, 4, H(mix(L.body, '#000000', 0.25)));
  if (!tie) box(g, 32, 0, 8, 4, H(L.body));
  // (the rails: steel tubes, lit along their tops)
  for (const x of [0, 62]) { box(g, x, 0, 10, 4, H('#2A2C3A')); box(g, x + 2, 0, 6, 4, H('#8E94AE')); box(g, x + 3, 0, 2, 4, H('#E2E6F4')); }
}), 72, 4, 0, 0);

// ---------------------------------------------------------------------------------------------------------------
// The dragon cars, from behind

/** A car from behind: 124 wide, its feet on the track's top at the origin, 64 up to its handrails, 10 below. */
const CAR_W = 124, CAR_UP = 70, CAR_DN = 12;
/** Where the handrails' tops are (his fists go there): out from the middle, up. */
export const RAIL_X = 46, RAIL_Y = 58;
/** His car's floor (where his boots are), up from the track. */
export const FLOOR_Y = 22;

const hull = (g: Ctx, lane: Lane, which: 0 | 1 | 2, step: number, cave: boolean) => {
  const L = LOOKS[lane], H = (c: string) => hazeOf(c, step, cave);
  const B = ramp6(L.body).map(H), W = ramp6(L.wing).map(H), Bl = ramp6(L.belly).map(H), G = GOLD.map(H), I = IRON.map(H);
  // (the bogie and wheels under it)
  box(g, -40, -2, 80, CAR_DN, I[1]); box(g, -46, 2, 16, 8, I[0]); box(g, 30, 2, 16, 8, I[0]); box(g, -44, 3, 4, 3, I[4]); box(g, 32, 3, 4, 3, I[4]);
  // (the folded wings along its sides, poking out past the hull)
  polyF(g, [[-62, -10], [-70, -40], [-56, -30]], INK); polyF(g, [[-61, -12], [-67, -37], [-57, -30]], W[2]);
  polyF(g, [[62, -10], [70, -40], [56, -30]], INK); polyF(g, [[61, -12], [67, -37], [57, -30]], W[2]);
  // (the hull: a rounded tub, scaled in rows, banded darker toward the bottom)
  g.fillStyle = INK; g.beginPath(); g.roundRect(-58, -44, 116, 46, 10); g.fill();
  const bands = [B[4], B[3], B[3], B[2], B[1]];
  bands.forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.roundRect(-56, -42 + i * 8.6, 112, 46 - 2 - i * 8.6, i === 0 ? 9 : 4); g.fill(); });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) box(g, -50 + c * 12 + (r % 2) * 6, -36 + r * 9, 6, 2, B[r < 2 ? 5 : 2]);
  // (the gilt trim band, the lamps' bezels on it)
  box(g, -56, -18, 112, 4, G[3]); box(g, -56, -18, 112, 1, G[5]); box(g, -56, -15, 112, 1, G[1]);
  for (let k = 0; k < 4; k++) box(g, -42 + k * 26, -18, 6, 4, Bl[4]);
  // (the back's lit lip)
  box(g, -54, -44, 108, 3, B[5]); box(g, -54, -41, 108, 1, B[0]);
  // (the side handrails: gilt posts up off the hull's edges, the bars going on forward along the car (end on: a knob))
  for (const s of [-1, 1]) {
    box(g, s * RAIL_X - 3, -RAIL_Y, 6, RAIL_Y - 40, INK); box(g, s * RAIL_X - 2, -RAIL_Y, 4, RAIL_Y - 40, G[3]); box(g, s * RAIL_X - 2, -RAIL_Y, 1, RAIL_Y - 40, G[5]);
    g.fillStyle = INK; g.beginPath(); g.arc(s * RAIL_X, -RAIL_Y, 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = G[4]; g.beginPath(); g.arc(s * RAIL_X, -RAIL_Y, 3.5, 0, Math.PI * 2); g.fill();
    box(g, s * RAIL_X - 1, -RAIL_Y - 2, 2, 1, G[5]);
  }
  if (which === 0) {
    // (the tail: curled up off the back, its tip a spade in the crest's color)
    const Cr = ramp6(L.crest).map(H);
    g.strokeStyle = INK; g.lineWidth = 12; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, -8); g.quadraticCurveTo(26, 8, 22, -30); g.quadraticCurveTo(18, -52, 2, -46); g.stroke();
    g.strokeStyle = B[3]; g.lineWidth = 8;
    g.beginPath(); g.moveTo(0, -8); g.quadraticCurveTo(26, 8, 22, -30); g.quadraticCurveTo(18, -52, 2, -46); g.stroke();
    g.strokeStyle = B[5]; g.lineWidth = 2;
    g.beginPath(); g.moveTo(4, -6); g.quadraticCurveTo(24, 4, 20, -30); g.stroke();
    g.lineCap = 'butt';
    polyF(g, [[2, -54], [-12, -46], [2, -38], [8, -46]], INK); polyF(g, [[2, -51], [-9, -46], [2, -41], [6, -46]], Cr[3]);
  }
};

/** The front car's neck and head from behind: up off its front, the back of a horned head, the crest's spines. */
const headBack = (g: Ctx, lane: Lane, step: number, cave: boolean) => {
  const L = LOOKS[lane], H = (c: string) => hazeOf(c, step, cave);
  const B = ramp6(L.body).map(H), Hn = ramp6(L.horn).map(H), Cr = ramp6(L.crest).map(H);
  // (the neck: up from the hull's middle, leaning on)
  polyF(g, [[-20, -40], [20, -40], [14, -96], [-14, -96]], INK);
  polyF(g, [[-18, -40], [18, -40], [12, -94], [-12, -94]], B[3]);
  polyF(g, [[-18, -40], [-6, -40], [-6, -94], [-12, -94]], B[2]);
  for (let k = 0; k < 4; k++) polyF(g, [[0, -46 - k * 13], [-6, -38 - k * 13], [6, -38 - k * 13]], Cr[k % 2 ? 2 : 4]);
  // (the head: the back of its skull, the jaw's hinges out each side, the horns swept back and up)
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -104, 24, 18, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = B[3]; g.beginPath(); g.ellipse(0, -104, 22, 16, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = B[4]; g.beginPath(); g.ellipse(-4, -110, 14, 8, 0, 0, Math.PI * 2); g.fill();
  for (const s of [-1, 1]) {
    polyF(g, [[s * 12, -114], [s * 38, -146], [s * 20, -110]], INK);
    polyF(g, [[s * 13, -114], [s * 35, -142], [s * 19, -111]], Hn[3]);
    box(g, s * 26 - 1, -128, 2, 4, Hn[5]);
    polyF(g, [[s * 22, -98], [s * 34, -96], [s * 22, -92]], B[2]);
  }
  for (let k = 0; k < 3; k++) polyF(g, [[-6 + k * 6, -120], [-3 + k * 6, -128], [k * 6, -120]], Cr[4]);
};

/** A car from behind (0 the rear: its tail; 1 the middle; 2 the front: its neck and head), at a haze step. */
export const carBack = (lane: Lane, which: 0 | 1 | 2, step: number, cave: boolean) =>
  placed(pic(`car${lane}${which}${step}${cave ? 1 : 0}`, CAR_W + 30, CAR_UP + CAR_DN + 90, (CAR_W + 30) / 2, CAR_UP + 90, 2, g => {
    if (which === 2) headBack(g, lane, step, cave);
    hull(g, lane, which, step, cave);
  }), CAR_W + 30, CAR_UP + CAR_DN + 90, (CAR_W + 30) / 2, CAR_UP + 90);

/** His car's near panel (over his boots, under his knees): the hull's back wall alone, and its tail. */
export const panelBack = (lane: Lane) => placed(pic(`panel${lane}`, CAR_W + 30, 70, (CAR_W + 30) / 2, 58, 2, g => {
  const L = LOOKS[lane], B = ramp6(L.body), G = GOLD;
  g.fillStyle = INK; g.beginPath(); g.roundRect(-58, -30, 116, 32, 8); g.fill();
  [B[3], B[3], B[2], B[1]].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.roundRect(-56, -28 + i * 7, 112, 30 - i * 7, i === 0 ? 7 : 3); g.fill(); });
  box(g, -56, -18, 112, 4, G[3]); box(g, -56, -18, 112, 1, G[5]);
  box(g, -54, -30, 108, 3, B[5]);
  for (let c = 0; c < 9; c++) box(g, -50 + c * 12, -26, 6, 2, B[5]);
  g.strokeStyle = INK; g.lineWidth = 12; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, -8); g.quadraticCurveTo(26, 8, 22, -30); g.quadraticCurveTo(18, -52, 2, -46); g.stroke();
  g.strokeStyle = B[3]; g.lineWidth = 8;
  g.beginPath(); g.moveTo(0, -8); g.quadraticCurveTo(26, 8, 22, -30); g.quadraticCurveTo(18, -52, 2, -46); g.stroke();
  g.lineCap = 'butt';
  const Cr = ramp6(L.crest);
  polyF(g, [[2, -54], [-12, -46], [2, -38], [8, -46]], INK); polyF(g, [[2, -51], [-9, -46], [2, -41], [6, -46]], Cr[3]);
}), CAR_W + 30, 70, (CAR_W + 30) / 2, 58);

// ---------------------------------------------------------------------------------------------------------------
// The obstacles

/** A ring of fire stood on the FIRE track (four flicker frames): 120 across, its burning bottom on the track; through
 *  its middle (jump). */
export const RING_R = 58;
export const ring = (frame: number, step: number, cave: boolean) => placed(pic(`ring${frame}${step}${cave ? 1 : 0}`, 150, 150, 75, 140, 2, g => {
  const F = ['#7A1A1A', '#DC2626', '#F97316', '#FDE047', '#FFF6B0'].map(c => hazeOf(c, Math.max(0, step - 1), false));
  const cy = -RING_R - 6;
  // (the iron hoop, then flames licking up all round it, outer to inner, in steps)
  g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.arc(0, cy, RING_R, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = hazeOf('#3A2A2A', step, cave); g.lineWidth = 8; g.beginPath(); g.arc(0, cy, RING_R, 0, Math.PI * 2); g.stroke();
  for (let L = 0; L < 4; L++) {
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, lick = 6 + 10 * (0.5 + 0.5 * Math.sin(i * 2.3 + frame * 1.7 + L)) * (1 - L * 0.2);
      const x = Math.cos(a) * RING_R, y = cy + Math.sin(a) * RING_R;
      const w = 9 - L * 1.6;
      // (flames go up, whatever side of the hoop)
      box(g, x - w / 2, y - lick - L * 2, w, lick + 4, F[1 + L]);
    }
  }
  // (the burning bottom, on the track: what he must jump)
  box(g, -RING_R + 6, -14, (RING_R - 6) * 2, 12, F[1]); box(g, -RING_R + 10, -12, (RING_R - 10) * 2, 6, F[3]);
}), 150, 150, 75, 140);

/** A gantry of icicles across the ICE track: frosted posts each side, the beam 104 up, icicles hanging to 52 (under
 *  them ducked; standing: in the face). */
export const ICICLE_LOW = 52;
export const icicles = (step: number, cave: boolean) => placed(pic(`icicles${step}${cave ? 1 : 0}`, 160, 124, 80, 116, 2, g => {
  const H = (c: string) => hazeOf(c, step, cave);
  const S = ['#4A6AA0', '#8CB8E8', '#C8E4FC', '#F0F9FF'].map(H);
  for (const s of [-1, 1]) { box(g, s * 70 - 5, -112, 10, 112, INK); box(g, s * 70 - 4, -112, 8, 112, S[1]); box(g, s * 70 - 4, -112, 3, 112, S[3]); }
  box(g, -76, -114, 152, 14, INK); box(g, -75, -113, 150, 12, S[1]); box(g, -75, -113, 150, 4, S[3]);
  for (let k = 0; k < 12; k++) {
    const x = -66 + k * 12, len = 40 + ((k * 7) % 3) * 6 + (k % 2 ? 0 : 6);
    polyF(g, [[x - 5, -101], [x + 5, -101], [x, -101 + len]], INK);
    polyF(g, [[x - 4, -101], [x + 4, -101], [x, -102 + len]], S[2]);
    polyF(g, [[x - 4, -101], [x - 1, -101], [x, -104 + len]], S[3]);
  }
}), 160, 124, 80, 116);

/** A frozen bar across the ICE track: a block of ice 20 high (jump it). */
export const BAR_H = 20;
export const iceBar = (step: number, cave: boolean) => placed(pic(`bar${step}${cave ? 1 : 0}`, 100, 30, 50, 26, 2, g => {
  const H = (c: string) => hazeOf(c, step, cave);
  box(g, -46, -BAR_H - 2, 92, BAR_H + 3, INK);
  box(g, -45, -BAR_H - 1, 90, BAR_H + 1, H('#7DB8E8')); box(g, -45, -BAR_H - 1, 90, 5, H('#E0F2FE')); box(g, -45, -6, 90, 5, H('#3A78C0'));
  for (let k = 0; k < 6; k++) box(g, -40 + k * 15, -BAR_H + 3, 2, 8, H('#FFFFFF'));
}), 100, 30, 50, 26);

/** A pine (the park's, stood on the lawn): 70 tall. */
export const pine = (step: number) => placed(pic(`pine${step}`, 60, 92, 30, 88, 1, g => {
  const H = (c: string) => hazeOf(c, step, false);
  box(g, -4, -14, 8, 14, H('#3A2418'));
  for (let k = 0; k < 4; k++) {
    const w = 26 - k * 5, y = -14 - k * 16;
    polyF(g, [[-w - 2, y + 2], [w + 2, y + 2], [0, y - 26]], INK);
    polyF(g, [[-w, y], [w, y], [0, y - 24]], H(['#1E423A', '#2A5A4C', '#3E7660', '#4E8A70'][k]));
    polyF(g, [[-w, y], [-w * 0.3, y], [0, y - 24]], H(['#142C28', '#1E423A', '#2A5A4C', '#3E7660'][k]));
  }
}), 60, 92, 30, 88);

// ---------------------------------------------------------------------------------------------------------------
// The sky and the far panorama

/** The sky by the hour (bands down to the horizon): 900 x 700, the horizon 520 down it. */
export const SKY_H = 700, SKY_HORIZON = 520;
export const sky = () => pic('sky', 900, SKY_H, 0, 0, 1, g => {
  drawTodSky(g, 0, 0, 900, SKY_H, ['#23307A', '#3A55B4', '#6E8EDC', '#A8C4F0', '#E8D4F0', '#F8C8D8'], { horizon: SKY_HORIZON, sun: [640, 160], moon: [200, 120] });
});

/** The far off, round the horizon: snowy hills, the GREAT PIXIE'S CASTLE on its crag, a pine ridge; 1600 wide, 150
 *  tall, its foot on the horizon. Repeats sideways. */
export const PANO_W = 1600, PANO_H = 150;
export const pano = () => pic('pano', PANO_W, PANO_H, 0, PANO_H, 1, g => {
  const T = (c: string, k = 0.7) => farTint(c, k);
  // (the far hills, snow on their tops)
  for (let k = 0; k < 9; k++) {
    const x = k * 200 - 40, h = 70 + ((k * 37) % 50);
    g.fillStyle = T('#7C86B4'); g.beginPath(); g.ellipse(x + 100, -2, 130, h, 0, Math.PI, 0); g.fill();
    g.fillStyle = T('#EEF2FA', 0.5); g.beginPath(); g.ellipse(x + 100, -h + 14, 44, 16, 0, Math.PI, 0); g.fill();
  }
  // (the castle on its crag: spires in steps)
  const cx = 1020;
  polyF(g, [[cx - 90, 0], [cx - 40, -70], [cx + 40, -74], [cx + 100, 0]], T('#5A6488'));
  for (const [dx, w, h] of [[-36, 18, 108], [-12, 22, 136], [14, 20, 120], [36, 14, 96]] as const) {
    box(g, cx + dx - w / 2, -h, w, h - 60, T('#C8C0E0'));
    polyF(g, [[cx + dx - w / 2 - 3, -h], [cx + dx + w / 2 + 3, -h], [cx + dx, -h - 30]], T('#5A4AA0'));
  }
  // (the near ridge: dark pines, a stepped edge)
  g.fillStyle = T('#2A4A48', 0.45);
  g.beginPath(); g.moveTo(0, 0);
  for (let x = 0; x <= PANO_W; x += 16) g.lineTo(x, -14 - ((x * 13) % 22) - (x % 32 === 0 ? 10 : 0));
  g.lineTo(PANO_W, 0); g.closePath(); g.fill();
});

/** The panorama's width on screen. */
export const PANO_SCREEN = CANVAS_WIDTH * 2;
