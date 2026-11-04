// The ride from behind's pictures, painted once (each its own canvas, per hour: the haze and the light follow it) and
// put down scaled by depth (and turned, through a roll: drawImage under a turned transform, never the stamp cache's).
// At the classic ride's fidelity (steel.ts, the obstacles of art.ts): ramps, inked edges, dithered seams.
//
//   the track, a step of it at a time (one SEG of track seen from over it: the lane's box spine down the middle in its
//   colors (lit left, shaded right, its stripe along the top), the two steel running rails either side (tubes: inked,
//   stepped, a hot highlight), a tie across at its far end (an I-beam, lit along its top), the gaps between open; on the
//   lift hill, the chain up the middle); per lane, haze step and light;
//   the supports' lattice (steel.ts's: two chords and the lacing, a batten now and then), cut to length when it's put
//   down, on a concrete footing;
//   the obstacles (keeping their shapes and heights exactly: the hit tests are locked): a ring of fire on its posts
//   (four flicker frames, in halves), the dragon's head on its post that blasts fire across the FIRE track, a gantry of
//   icicles across the ICE track, a frozen bar, the wizard's crystal pylon over the LIGHTNING track;
//   the park's things along the lawn below the ride (pines, a turret, a gift shop, lamp posts, hedges and flower beds).

import { mix, box, INK, GOLD, IRON, ramp6, polyF, checker, PINE, SNOW, type Ctx } from '../../kit';
import { farTint, timeOfDay, thisHour } from '../../../timeOfDay';
import { LANE_COL, type Lane } from '../layout';

type Cv = HTMLCanvasElement;
const cache = new Map<string, Cv>();
/** (off out of Fairy Land, or a new hour: everything painted again) */
export const clearBehindSprites = () => cache.clear();

/** A picture `w` x `h` (world units) painted `res` finer, its origin at (ox, oy) inside it; cached by key and hour. */
export const pic = (key: string, w: number, h: number, ox: number, oy: number, res: number, paint: (g: Ctx) => void): Cv | null => {
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
export const placed = (cv: Cv | null, w: number, h: number, ox: number, oy: number): Placed | null => (cv ? { cv, x: -ox, y: -oy, w, h } : null);

const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };

// ---------------------------------------------------------------------------------------------------------------
// Haze

/** The haze, by step (0 near .. 5 far): toward the sky's blue-grey out in the open, toward black in the mountain. */
export const HAZE = 6;
export const hazeOf = (col: string, step: number, cave: boolean) => {
  if (step <= 0) return cave ? mix(col, '#000000', 0.3) : col;
  const k = step / (HAZE - 1);
  return cave ? mix(col, '#0A0612', 0.3 + k * 0.6) : mix(col, farTint('#8A9AC4', 0.4), k * 0.6);
};

// ---------------------------------------------------------------------------------------------------------------
// The track

/** A step of track, as a picture: 80 across (the rails' middles TRACK_HW (36) each side), ST deep (one SEG, its far end
 *  at the top). Put down stretched to the step's place on screen. */
export const ST_W = 80, ST_H = 40;
const STEEL = ['#1E2030', '#2E3242', '#4A5068', '#7A84A0', '#B8C2D8', '#E8EEF8'];
export const strip = (lane: Lane, step: number, cave: boolean, lift: boolean, m = 1) => placed(pic(`strip${lane}${step}${cave ? 1 : 0}${lift ? 1 : 0}x${m}`, ST_W, ST_H * m, ST_W / 2, 0, 1, g => {
  for (let j = 0; j < m; j++) { g.save(); g.translate(0, j * ST_H); stripStep(g, lane, step, cave, lift); g.restore(); }
}), ST_W, ST_H * m, ST_W / 2, 0);
const stripStep = (g: Ctx, lane: Lane, step: number, cave: boolean, lift: boolean) => {
  const H = (c: string) => hazeOf(c, step, cave);
  const [main, light, dark] = LANE_COL[lane];
  const S = STEEL.map(H), Sp = [mix(dark, INK, 0.45), mix(dark, '#000000', 0.12), main, mix(main, light, 0.55), mix(light, '#FFFFFF', 0.4)].map(H);
  // (the box spine: inked, its left face lit, its right in shade, the lane's stripe down its top, the highlight)
  box(g, -12, 0, 24, ST_H, H(INK));
  box(g, -11, 0, 22, ST_H, Sp[1]);
  box(g, -11, 0, 5, ST_H, Sp[2]); box(g, 6, 0, 5, ST_H, Sp[0]);
  box(g, -5, 0, 10, ST_H, Sp[2]); box(g, -4, 0, 4, ST_H, Sp[3]); box(g, -3, 0, 1, ST_H, Sp[4]);
  checker(g, 4, 0, 2, ST_H, Sp[1], 0, 1);
  // (its bolted seams across now and then)
  box(g, -11, 22, 22, 1, Sp[0]); box(g, -11, 23, 22, 1, Sp[3]);
  if (lift) {
    // (the lift's chain up the middle: dark links, each lit on its top, the dogs that catch the trains)
    for (let y = 0; y < ST_H; y += 5) { box(g, -3, y, 6, 4, H(INK)); box(g, -2, y + 1, 4, 2, S[2]); box(g, -2, y + 1, 4, 1, S[4]); }
    box(g, -5, 12, 10, 3, H(INK)); box(g, -4, 12, 8, 2, S[3]);
  }
  // (the tie across at the far end: an I-beam rail to rail, lit along its top, its web in shade, down to the spine)
  box(g, -40, 0, 80, 6, H(INK)); box(g, -39, 1, 78, 4, S[2]); box(g, -39, 1, 78, 1, S[4]); box(g, -39, 4, 78, 1, S[0]);
  for (const x of [-30, -20, 20, 30]) box(g, x, 2, 2, 2, S[1]);
  // (the rails: steel tubes either side, inked, stepped, a hot highlight down them; the brackets onto the ties)
  for (const s of [-1, 1]) {
    const x = s * 36;
    box(g, x - 5, 0, 10, ST_H, H(INK));
    box(g, x - 4, 0, 8, ST_H, S[2]); box(g, x - 4, 0, 3, ST_H, S[3]); box(g, x + 2, 0, 2, ST_H, S[1]);
    box(g, x - 3, 0, 1, ST_H, S[5]);
    box(g, x - 6, 0, 12, 3, H(INK)); box(g, x - 5, 0, 10, 2, S[3]);
  }
};

/** The supports' lattice, a strip SUP_W across, SUP_H long (cut to length when it's put down). */
export const SUP_W = 22, SUP_H = 1200;
export const lattice = (step: number) => pic(`lattice${step}`, SUP_W, SUP_H, 0, 0, 2, g => {
  const S = ['#2A2C3C', '#3E4256', '#566078', '#7A86A0', '#A4B0C8'].map(c => hazeOf(c, step, false));
  box(g, 0, 0, 5, SUP_H, S[0]); box(g, 1, 0, 3, SUP_H, S[3]); box(g, 1, 0, 1, SUP_H, S[4]);
  box(g, SUP_W - 5, 0, 5, SUP_H, S[0]); box(g, SUP_W - 4, 0, 3, SUP_H, S[2]); box(g, SUP_W - 2, 0, 1, SUP_H, S[1]);
  g.lineWidth = 2;
  for (let y = 0; y < SUP_H; y += 24) {
    g.strokeStyle = S[0]; g.beginPath(); g.moveTo(4, y); g.lineTo(SUP_W - 4, y + 12); g.lineTo(4, y + 24); g.stroke();
    g.strokeStyle = S[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(4, y + 0.6); g.lineTo(SUP_W - 4, y + 12.6); g.lineTo(4, y + 24.6); g.stroke(); g.lineWidth = 2;
    if (y % 96 === 0) { box(g, 3, y, SUP_W - 6, 3, S[0]); box(g, 3, y, SUP_W - 6, 1, S[3]); }
  }
});
/** A support's foot: a concrete footing, lit along its top (44 across, 12 tall, its foot at the origin). */
export const footing = (step: number) => placed(pic(`foot${step}`, 48, 16, 24, 14, 2, g => {
  const C = ['#4A4640', '#6A645A', '#8A847A', '#B4AEA2', '#D4CEC2'].map(c => hazeOf(c, step, false));
  box(g, -23, -13, 46, 14, INK); box(g, -22, -12, 44, 12, C[2]); box(g, -22, -12, 44, 2, C[4]); box(g, -22, -10, 4, 10, C[3]); box(g, 14, -10, 8, 10, C[1]);
  checker(g, -18, -6, 32, 4, C[1], 0, 1);
  for (const x of [-12, 8]) { box(g, x, -15, 4, 3, INK); box(g, x + 1, -14, 2, 2, C[3]); }
}), 48, 16, 24, 14);

// ---------------------------------------------------------------------------------------------------------------
// The obstacles (their shapes and heights are the hit tests': keep them)

const FIRE = ['#450A0A', '#7A1A1A', '#DC2626', '#F97316', '#FDE047', '#FFF6B0'];

/** A ring of fire hung over the FIRE track on two iron posts (four flicker frames): its burning bottom edge RING_BOTTOM
 *  up (over the car's hull, at his shins: he jumps it, the car goes under), its inside RING_IN round, so a good jump
 *  carries him through its middle. Painted in halves (he's seen inside it as it goes by): 'back' (its top half, its
 *  posts: drawn behind him), 'front' (its bottom half: in front of him), or 'all'. */
export const RING_BOTTOM = 48, RING_IN = 74, RING_T = 13;
const RING_CY = -(RING_BOTTOM + RING_IN), RING_OUT = RING_IN + RING_T;
export const ring = (frame: number, step: number, cave: boolean, half: 'all' | 'back' | 'front' = 'all') =>
  placed(pic(`ring${frame}${step}${cave ? 1 : 0}${half}`, 230, 262, 115, 246, 2, g => {
    const F = FIRE.map(c => hazeOf(c, Math.max(0, step - 1), false));
    const I = IRON.map(c => hazeOf(c, step, cave)), G = GOLD.map(c => hazeOf(c, step, cave));
    const cy = RING_CY, rm = RING_IN + RING_T / 2;
    if (half !== 'front') {
      // (the posts each side up to its middle: iron, banded, riveted, a gilt cap and a bracket onto the hoop)
      for (const s of [-1, 1]) {
        const x = s * (RING_OUT + 5);
        box(g, x - 5, cy, 10, -cy, INK); box(g, x - 4, cy, 8, -cy, I[3]); box(g, x - 4, cy, 3, -cy, I[5]); box(g, x + 2, cy, 2, -cy, I[1]);
        for (let y = cy + 16; y < -4; y += 22) { box(g, x - 4, y, 8, 2, I[1]); box(g, x - 1, y - 3, 2, 2, I[4]); }
        box(g, x - 7, cy - 6, 14, 8, INK); box(g, x - 6, cy - 5, 12, 6, G[3]); box(g, x - 6, cy - 5, 12, 2, G[5]);
        box(g, x - 8, -4, 16, 5, INK); box(g, x - 7, -3, 14, 3, I[2]);
      }
    }
    g.save();
    if (half !== 'all') { g.beginPath(); if (half === 'back') g.rect(-130, cy - 130, 260, 130); else g.rect(-130, cy, 260, 140); g.clip(); }
    // (the iron hoop, inked, banded, its rivets; then the flames licking up off all of it, outer to inner, in steps)
    g.strokeStyle = INK; g.lineWidth = RING_T + 4; g.beginPath(); g.arc(0, cy, rm, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = I[2]; g.lineWidth = RING_T; g.beginPath(); g.arc(0, cy, rm, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = I[4]; g.lineWidth = 2; g.beginPath(); g.arc(0, cy, rm - RING_T / 2 + 2, Math.PI * 0.9, Math.PI * 1.6); g.stroke();
    g.strokeStyle = F[2]; g.lineWidth = RING_T - 6; g.beginPath(); g.arc(0, cy, rm, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; box(g, Math.cos(a) * rm - 1, cy + Math.sin(a) * rm - 1, 2, 2, I[5]); }
    for (let L = 0; L < 5; L++) {
      const n = 30;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + L * 0.1, lick = (7 + 12 * (0.5 + 0.5 * Math.sin(i * 2.3 + frame * 1.7 + L))) * (1 - L * 0.17);
        const x = Math.cos(a) * rm, y = cy + Math.sin(a) * rm, w = 10 - L * 1.6;
        box(g, x - w / 2, y - lick - L * 2, w, lick + 4, F[1 + L]);
        if (L === 4 && (i + frame) % 4 === 0) box(g, x - 1, y - lick - 14 - ((i * 7 + frame * 5) % 9), 2, 2, F[4]);
      }
    }
    // (smoke curling off the top)
    if (half !== 'front') for (let i = 0; i < 6; i++) { const x = -40 + i * 16 + ((frame * 3 + i * 5) % 7), y = cy - rm - 28 - ((i * 11 + frame * 4) % 16); g.globalAlpha = 0.35; ell(g, x, y, 8, 5, hazeOf('#44403C', step, cave)); g.globalAlpha = 1; }
    g.restore();
  }), 230, 262, 115, 246);

/** The obstacles read by their shapes: the ducks hang HIGH, their undersides at DUCK_LOW (over him ducked, into him stood
 *  up), a clear bright gap under them; the jumps sit LOW, at his shins, JUMP_TOP their tops (over the car's hull, so the
 *  car goes under and he must jump). All of them inked thick against anything behind. */
export const DUCK_LOW = 92, JUMP_TOP = 50;

const ICE = ['#1E3A6E', '#3A6AA8', '#6CA2DA', '#A8D2F4', '#DCF0FE', '#FFFFFF'];
/** A gantry of icicles across the ICE track: frosted posts each side, the beam high (snow along its top), the icicles
 *  hanging down to DUCK_LOW (duck), see-through, lit down one edge. */
export const icicles = (step: number, cave: boolean) => placed(pic(`icicles${step}${cave ? 1 : 0}`, 180, 196, 90, 184, 2, g => {
  const H = (c: string) => hazeOf(c, step, cave);
  const S = ICE.map(H), Wd = ['#2A1A14', '#4A3020', '#6A4630', '#8A6044'].map(H), Sn = SNOW.map(H);
  // (the posts: timber, iced over, frost dithered on)
  for (const s of [-1, 1]) {
    const x = s * 74;
    box(g, x - 7, -176, 14, 176, INK); box(g, x - 6, -176, 12, 176, Wd[2]); box(g, x - 6, -176, 4, 176, Wd[3]); box(g, x + 3, -176, 3, 176, Wd[1]);
    checker(g, x - 6, -176, 12, 120, S[4], 0, 1);
    box(g, x - 6, -176, 2, 176, S[4]);
    box(g, x - 9, -6, 18, 6, INK); box(g, x - 8, -5, 16, 4, Wd[1]);
  }
  // (the beam: timber under a sheath of ice, a drift of snow along its top)
  box(g, -84, -178, 168, 20, INK); box(g, -83, -177, 166, 18, Wd[2]); box(g, -83, -170, 166, 2, Wd[1]);
  g.globalAlpha = 0.7; box(g, -83, -177, 166, 18, S[3]); g.globalAlpha = 1;
  box(g, -83, -177, 166, 3, S[5]); box(g, -83, -162, 166, 2, S[1]);
  polyF(g, [[-84, -178], [84, -178], [80, -184], [40, -186], [0, -183], [-46, -187], [-80, -183]], Sn[4]); box(g, -78, -184, 120, 1, Sn[5]);
  // (the icicles: in pairs of steps, see-through, lit down their left, their tips the bright gap's edge)
  for (let k = 0; k < 12; k++) {
    const x = -66 + k * 12, tip = -DUCK_LOW - ((k * 7) % 3) * 3, top = -158;
    polyF(g, [[x - 7, top], [x + 7, top], [x, tip + 3]], INK);
    g.globalAlpha = 0.8; polyF(g, [[x - 5.5, top], [x + 5.5, top], [x, tip]], S[2]); g.globalAlpha = 1;
    polyF(g, [[x - 5.5, top], [x - 1, top], [x - 0.5, tip + 8]], S[4]);
    polyF(g, [[x + 2, top], [x + 5.5, top], [x + 0.5, tip + 10]], S[1]);
    box(g, x - 3, top + 4, 1, (tip - top) * 0.5, S[5]);
    if (k % 3 === 1) { polyF(g, [[x + 4, top], [x + 8, top], [x + 6, top + 22]], S[3]); }
  }
}), 180, 196, 90, 184);

/** A frozen bar across the ICE track at his shins, on stubby posts: its top at JUMP_TOP (jump it; the car goes under). */
export const iceBar = (step: number, cave: boolean) => placed(pic(`bar${step}${cave ? 1 : 0}`, 140, 80, 70, 74, 2, g => {
  const H = (c: string) => hazeOf(c, step, cave), S = ICE.map(H), I = IRON.map(H);
  for (const s of [-1, 1]) {
    const x = s * 58;
    box(g, x - 6, -JUMP_TOP, 12, JUMP_TOP, INK); box(g, x - 5, -JUMP_TOP, 10, JUMP_TOP, I[3]); box(g, x - 5, -JUMP_TOP, 3, JUMP_TOP, I[5]);
    g.globalAlpha = 0.6; box(g, x - 5, -JUMP_TOP, 10, JUMP_TOP, S[3]); g.globalAlpha = 1;
    box(g, x - 8, -5, 16, 5, INK); box(g, x - 7, -4, 14, 3, I[2]);
  }
  // (the iron bar inside, the ice round it: banded, see-through at the edges, frost on top, a crack)
  box(g, -64, -JUMP_TOP - 4, 128, 24, INK);
  box(g, -63, -JUMP_TOP - 3, 126, 22, S[2]);
  box(g, -60, -JUMP_TOP + 4, 120, 8, I[2]); box(g, -60, -JUMP_TOP + 4, 120, 2, I[4]);
  g.globalAlpha = 0.65; box(g, -63, -JUMP_TOP + 2, 126, 12, S[3]); g.globalAlpha = 1;
  box(g, -63, -JUMP_TOP - 3, 126, 5, S[4]); box(g, -63, -JUMP_TOP - 3, 126, 1, S[5]); box(g, -63, -JUMP_TOP + 15, 126, 4, S[1]);
  checker(g, -63, -JUMP_TOP + 2, 126, 2, S[4], 0, 1);
  for (let k = 0; k < 8; k++) box(g, -56 + k * 16, -JUMP_TOP + 1, 2, 10, S[5]);
  g.strokeStyle = S[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(10, -JUMP_TOP - 2); g.lineTo(16, -JUMP_TOP + 6); g.lineTo(12, -JUMP_TOP + 12); g.lineTo(20, -JUMP_TOP + 18); g.stroke();
  for (let k = 0; k < 6; k++) { const x = -50 + k * 20, l = 4 + (k % 3) * 2; polyF(g, [[x - 2, -JUMP_TOP + 19], [x + 2, -JUMP_TOP + 19], [x, -JUMP_TOP + 19 + l]], S[3]); }
}), 140, 80, 70, 74);

/** The FIRE track's duck: a carved dragon's head on an iron post beside the track (the park's dragons: scaled, horned,
 *  its jaws wide), breathing a gout of fire across at head height (the flame's drawn live: draw.ts), its bottom at
 *  DUCK_LOW. */
export const JET_Y = 120, JET_HH = 18;
export const jetPost = (step: number, cave: boolean) => placed(pic(`jet${step}${cave ? 1 : 0}`, 80, 190, -44, 176, 2, g => {
  const H = (c: string) => hazeOf(c, step, cave);
  const I = IRON.map(H), B = ramp6('#C42828').map(H), Bl = ramp6('#F2902E').map(H), Hn = ramp6('#F2E6C8').map(H), G = GOLD.map(H);
  // (the post beside the track's right rail: iron, banded, a gilt collar under the head, its foot bolted down)
  box(g, 90, -136, 14, 136, INK); box(g, 91, -134, 12, 134, I[3]); box(g, 91, -134, 4, 134, I[5]); box(g, 100, -134, 3, 134, I[1]);
  for (let y = -120; y < -6; y += 20) box(g, 91, y, 12, 2, I[1]);
  box(g, 86, -6, 22, 6, INK); box(g, 87, -5, 20, 4, I[2]); box(g, 87, -5, 20, 1, I[4]);
  box(g, 87, -140, 20, 8, INK); box(g, 88, -139, 18, 6, G[3]); box(g, 88, -139, 18, 2, G[5]);
  // (the head, turned across the track: the skull, its brow and horn, the snout, the jaws wide on the fire)
  const skull: [number, number][] = [[114, -160], [96, -162], [80, -152], [66, -JET_Y - 22], [62, -JET_Y - 8], [80, -JET_Y - 10], [110, -134]];
  polyF(g, skull.map(([x, y]) => [x + (x < 90 ? -1.5 : 1.5), y - 1.5] as [number, number]), INK);
  polyF(g, skull, B[3]);
  polyF(g, [[112, -158], [96, -160], [82, -151], [70, -JET_Y - 20], [86, -146], [110, -150]], B[4]);
  box(g, 88, -158, 14, 1, B[5]);
  for (let k = 0; k < 4; k++) for (let r = 0; r < 2; r++) box(g, 88 + k * 6 + r * 3, -150 + r * 5, 3, 1, B[1]);
  const jaw: [number, number][] = [[64, -JET_Y + 4], [82, -JET_Y + 2], [108, -128], [106, -120], [78, -JET_Y + 16], [62, -JET_Y + 14]];
  polyF(g, jaw.map(([x, y]) => [x - 1.5, y + 1.5] as [number, number]), INK);
  polyF(g, jaw, B[2]); polyF(g, [[64, -JET_Y + 10], [80, -JET_Y + 10], [104, -124], [106, -120], [78, -JET_Y + 16], [62, -JET_Y + 14]], Bl[3]);
  // (the mouth's glowing inside, its teeth, the brow ridge and its burning eye, the horn swept back)
  polyF(g, [[64, -JET_Y - 7], [82, -JET_Y - 9], [96, -JET_Y - 6], [84, -JET_Y + 3], [64, -JET_Y + 4]], '#FDE047');
  polyF(g, [[70, -JET_Y - 4], [84, -JET_Y - 6], [84, -JET_Y + 1], [70, -JET_Y + 1]], '#FFF6B0');
  for (let k = 0; k < 4; k++) { const x = 66 + k * 6; polyF(g, [[x, -JET_Y - 8], [x + 3, -JET_Y - 8], [x + 1.5, -JET_Y - 3]], Hn[5]); polyF(g, [[x + 1, -JET_Y + 4], [x + 4, -JET_Y + 4], [x + 2.5, -JET_Y]], Hn[4]); }
  polyF(g, [[80, -152], [100, -156], [102, -150], [84, -148]], B[1]);
  box(g, 86, -150, 8, 5, INK); box(g, 87, -149, 6, 3, '#FDE047'); box(g, 87, -149, 2, 1, '#FFFFFF');
  polyF(g, [[104, -160], [116, -184], [122, -182], [112, -158]], INK); polyF(g, [[106, -160], [117, -181], [119, -180], [111, -158]], Hn[3]); box(g, 112, -172, 3, 1, Hn[1]);
  for (let k = 0; k < 3; k++) polyF(g, [[112, -146 + k * 6], [124 + k * 2, -150 + k * 8], [112, -140 + k * 6]], Bl[3 + (k % 2)]);
  box(g, 64, -JET_Y - 18, 3, 2, INK);
}), 80, 190, -44, 176);

/** The wizard's crystal pylon over the LIGHTNING track (what charges the dragon): two stone legs PYLON_LEG out each
 *  side, an iron crossbeam 230 up with gilt studs, a big violet crystal hung under it (its middle PYLON_CRYSTAL up),
 *  over the car and him (it never hits him: it's the dragon it charges). */
export const PYLON_LEG = 92, PYLON_CRYSTAL = 196;
export const pylon = (step: number, cave: boolean) => placed(pic(`pylon${step}${cave ? 1 : 0}`, 240, 290, 120, 278, 2, g => {
  const H = (c: string) => hazeOf(c, step, cave);
  const St = ['#1E1A2C', '#2A2438', '#4A4060', '#6A6088', '#9088B0', '#B4ACD0'].map(H), G = GOLD.map(H), I = IRON.map(H);
  const C = ['#2A0650', '#3B0764', '#6D28D9', '#A78BFA', '#E9D5FF', '#FFFFFF'].map(H);
  // (the legs: stone blocks in courses, lit left, shaded right, a gilt cap with a rune; a plinth at the foot)
  for (const sd of [-1, 1]) {
    const x = sd * PYLON_LEG;
    box(g, x - 10, -238, 20, 238, INK); box(g, x - 9, -238, 18, 238, St[2]); box(g, x - 9, -238, 5, 238, St[3]); box(g, x + 5, -238, 4, 238, St[1]);
    for (let k = 0; k < 8; k++) { const y = -24 - k * 28; box(g, x - 9, y, 18, 2, St[0]); box(g, x - 9, y + 2, 18, 1, St[4]); box(g, x - 9 + ((k % 2) ? 9 : 3), y - 26, 1, 26, St[1]); }
    box(g, x - 14, -12, 28, 12, INK); box(g, x - 13, -11, 26, 10, St[2]); box(g, x - 13, -11, 26, 2, St[4]);
    box(g, x - 12, -248, 24, 12, INK); box(g, x - 11, -247, 22, 10, G[3]); box(g, x - 11, -247, 22, 2, G[5]); box(g, x - 3, -244, 6, 4, C[3]);
  }
  // (the crossbeam: iron, studded in gilt, banded)
  box(g, -PYLON_LEG - 6, -240, PYLON_LEG * 2 + 12, 16, INK); box(g, -PYLON_LEG - 5, -239, PYLON_LEG * 2 + 10, 14, I[2]); box(g, -PYLON_LEG - 5, -239, PYLON_LEG * 2 + 10, 3, I[4]); box(g, -PYLON_LEG - 5, -228, PYLON_LEG * 2 + 10, 3, I[0]);
  for (let k = -4; k <= 4; k++) { box(g, k * 20 - 2, -234, 4, 4, G[4]); box(g, k * 20 - 1, -234, 1, 1, G[5]); }
  // (the crystal's cradle: gilt claws round its top)
  for (const s of [-1, 1]) { polyF(g, [[s * 6, -226], [s * 26, -224], [s * 20, -206], [s * 12, -214]], INK); polyF(g, [[s * 7, -225], [s * 24, -223], [s * 19, -208], [s * 12, -215]], G[3]); }
  // (the crystal: a long violet point, faceted, in steps, a hard glint)
  const cy = -PYLON_CRYSTAL;
  polyF(g, [[0, -230], [22, cy - 8], [0, cy + 36], [-22, cy - 8]], INK);
  polyF(g, [[0, -227], [19, cy - 8], [0, cy + 32], [-19, cy - 8]], C[2]);
  polyF(g, [[0, -227], [0, cy + 32], [-19, cy - 8]], C[3]);
  polyF(g, [[0, -227], [-19, cy - 8], [-8, cy - 6]], C[4]);
  polyF(g, [[0, -227], [19, cy - 8], [8, cy - 4]], C[1]);
  polyF(g, [[8, cy - 4], [19, cy - 8], [0, cy + 32]], C[1]);
  box(g, -10, -220, 2, 14, C[5]); box(g, -6, -214, 1, 6, C[5]);
  // (more crystals budding off the beam's ends)
  for (const s of [-1, 1]) { polyF(g, [[s * (PYLON_LEG - 22), -226], [s * (PYLON_LEG - 16), -226], [s * (PYLON_LEG - 19), -210]], C[2]); box(g, s * (PYLON_LEG - 20), -224, 1, 8, C[4]); }
}), 240, 290, 120, 278);

// ---------------------------------------------------------------------------------------------------------------
// The park's things along the lawn below the ride (dimmed: scenery, not to stand on)

const dim = (c: string, step: number) => hazeOf(mix(c, '#4A4660', 0.1), step, false);

/** A pine (the park's, stood on the lawn): 90 tall, snow on its boughs. */
export const pine = (step: number, v: number) => placed(pic(`pine${step}${v}`, 70, 104, 35, 100, 1, g => {
  const H = (c: string) => dim(c, step), P = PINE.map(H), Sn = SNOW.map(H);
  box(g, -4, -16, 8, 16, H('#2A1A12')); box(g, -4, -16, 3, 16, H('#4A3020'));
  const n = 4 + v;
  for (let k = 0; k < n; k++) {
    const w = 30 - k * (26 / n), y = -14 - k * (76 / n), h = 30 - k * 2;
    polyF(g, [[-w - 2, y + 2], [w + 2, y + 2], [0, y - h - 2]], INK);
    polyF(g, [[-w, y], [w, y], [0, y - h]], P[2 + (k % 2)]);
    polyF(g, [[-w, y], [-w * 0.2, y], [0, y - h]], P[4]);
    polyF(g, [[w * 0.4, y], [w, y], [0, y - h]], P[1]);
    checker(g, -w * 0.6, y - 4, w * 1.2, 2, P[1], 0, 1);
    box(g, -w * 0.7, y - 3, w * 0.9, 2, Sn[4]); box(g, -w * 0.5, y - 4, w * 0.4, 1, Sn[5]);
  }
}), 70, 104, 35, 100);

/** A turret off the park's paths: plaster, a slate cone with a pennant, lit windows after dark. */
export const turret = (step: number, roof: number) => placed(pic(`turret${step}${roof}`, 70, 190, 35, 186, 1, g => {
  const H = (c: string) => dim(c, step), Pl = ramp6('#CDBCA6').map(H), R = ramp6(['#4A78D4', '#C8508E', '#6A4A9A'][roof]).map(H), lamps = timeOfDay().lamps > 0.3;
  box(g, -17, -110, 34, 110, INK); box(g, -16, -110, 32, 110, Pl[3]); box(g, -16, -110, 8, 110, Pl[4]); box(g, 8, -110, 8, 110, Pl[2]);
  checker(g, 4, -110, 4, 110, Pl[2], 0, 1);
  for (let y = -96; y < -10; y += 26) { box(g, -4, y, 8, 12, INK); box(g, -3, y + 1, 6, 10, lamps ? '#FFD88A' : H('#3A3456')); box(g, -3, y + 1, 6, 1, H(lamps ? '#FFF4C8' : '#5A5476')); }
  for (let x = -18; x < 18; x += 7) { box(g, x, -118, 5, 8, INK); box(g, x + 1, -117, 3, 7, Pl[3]); }
  box(g, -18, -112, 36, 3, Pl[1]);
  polyF(g, [[-22, -118], [22, -118], [0, -172]], INK); polyF(g, [[-20, -119], [20, -119], [0, -170]], R[3]); polyF(g, [[-20, -119], [-6, -119], [0, -170]], R[4]); polyF(g, [[8, -119], [20, -119], [0, -170]], R[2]);
  for (let k = 0; k < 4; k++) box(g, -18 + k * 3, -126 - k * 12, 36 - k * 6, 1, R[1]);
  polyF(g, [[-22, -119], [22, -119], [16, -123], [-16, -123]], H(SNOW[4]));
  box(g, 0, -184, 1, 14, H('#4A4060')); polyF(g, [[1, -184], [14, -180], [1, -176]], H(roof === 1 ? '#F6D365' : '#F49AC8'));
}), 70, 190, 35, 186);

/** A gift shop: a half-timbered front, a slate roof with snow, a lit shop window and its awning (dimmed: not a ledge). */
export const shop = (step: number, v: number) => placed(pic(`shop${step}${v}`, 150, 130, 75, 126, 1, g => {
  const H = (c: string) => dim(c, step), Pl = ramp6(['#CDBCA6', '#C8B8C8', '#D8C8A8'][v]).map(H), T = ramp6('#4A3020').map(H), R = ramp6(['#3E4058', '#4A3E4A', '#344A5A'][v]).map(H), lamps = timeOfDay().lamps > 0.3;
  box(g, -61, -70, 122, 70, INK); box(g, -60, -70, 120, 70, Pl[3]); box(g, -60, -70, 6, 70, Pl[4]); box(g, 52, -70, 8, 70, Pl[2]);
  box(g, -60, -40, 120, 4, T[2]); for (let x = -52; x < 60; x += 18) box(g, x, -70, 3, 70, T[2]);
  for (let k = 0; k < 4; k++) { box(g, -44 + k * 26, -64, 12, 16, INK); box(g, -43 + k * 26, -63, 10, 14, lamps ? '#FFD88A' : H('#3A3456')); box(g, -43 + k * 26, -63, 10, 2, H('#7A74A0')); }
  box(g, -30, -32, 60, 32, INK); box(g, -29, -31, 58, 31, lamps ? '#FFC870' : H('#E8C890')); box(g, -29, -31, 58, 4, H('#FFF0C8'));
  for (let x = -26; x < 28; x += 10) box(g, x, -20, 6, 8, H(['#F472B6', '#FDE047', '#A78BFA', '#4ADE80', '#F97316', '#60A5FA'][(x / 10 + 3 | 0) % 6]));
  for (let k = 0; k < 8; k++) polyF(g, [[-34 + k * 8.5, -34], [-30 + k * 8.5, -40], [-25.5 + k * 8.5, -34]], H(k % 2 ? '#FFF4F8' : ['#E0408A', '#2E5AAE', '#2E8A5A'][v]));
  polyF(g, [[-68, -70], [68, -70], [0, -122]], INK); polyF(g, [[-66, -71], [66, -71], [0, -120]], R[3]); polyF(g, [[-66, -71], [-20, -71], [0, -120]], R[4]); polyF(g, [[20, -71], [66, -71], [0, -120]], R[2]);
  for (let k = 1; k < 5; k++) box(g, -66 + k * 13, -71 - k * 10, 132 - k * 26, 1, R[1]);
  polyF(g, [[-66, -71], [0, -120], [66, -71], [60, -76], [0, -112], [-60, -76]], H(SNOW[4]));
  box(g, 30, -112, 8, 18, INK); box(g, 31, -111, 6, 17, H('#6A4A3A')); box(g, 29, -114, 10, 3, H(SNOW[5]));
}), 150, 130, 75, 126);

/** A lamp post (lit after dark), 70 tall. */
export const lampPost = (step: number) => placed(pic(`lamp${step}`, 24, 80, 12, 76, 1, g => {
  const H = (c: string) => dim(c, step), lamps = timeOfDay().lamps > 0.3;
  box(g, -2, -62, 4, 62, INK); box(g, -1, -62, 2, 62, H('#3A3850')); box(g, -5, -4, 10, 4, INK);
  box(g, -6, -74, 12, 12, INK); box(g, -5, -73, 10, 10, lamps ? '#FFE9A8' : H('#E8D8A8')); box(g, -5, -73, 10, 2, H('#4A4060')); box(g, -1, -73, 2, 10, H('#4A4060'));
}), 24, 80, 12, 76);

/** A hedge with a flower bed (topiary in a dragon's shape now and then), 120 across. */
export const hedge = (step: number, v: number) => placed(pic(`hedge${step}${v}`, 130, 70, 65, 66, 1, g => {
  const H = (c: string) => dim(c, step), P = ['#142C1A', '#1E4226', '#2E5A34', '#3E7244', '#5A9050'].map(H);
  ell(g, 0, -12, 60, 14, INK); ell(g, 0, -12, 58, 12, P[2]); ell(g, -10, -16, 44, 7, P[3]); ell(g, -20, -18, 20, 4, P[4]);
  checker(g, -50, -10, 100, 3, P[1], 0, 1);
  for (let k = 0; k < 14; k++) box(g, -52 + k * 8, -4 + (k % 2) * 2, 3, 3, H(['#F472B6', '#FDE047', '#A78BFA', '#F87171'][k % 4]));
  if (v === 1) {
    // (dragon topiary: a body, a neck, a head, a tail, cut in the hedge)
    ell(g, 0, -30, 22, 14, INK); ell(g, 0, -30, 20, 12, P[2]); ell(g, -4, -34, 12, 6, P[3]);
    ell(g, 20, -48, 7, 14, INK); ell(g, 20, -48, 5, 12, P[2]); ell(g, 26, -60, 10, 6, INK); ell(g, 26, -60, 8, 4, P[3]);
    polyF(g, [[-20, -30], [-40, -40], [-36, -28]], P[2]);
  }
}), 130, 70, 65, 66);

