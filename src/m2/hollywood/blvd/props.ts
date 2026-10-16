// The boulevard's furniture (peak SNES, each at its depth, painted once for the hour): the old cast-iron lampposts
// (Steve's flier taped round every one, a PA horn on some), the street palms, the AS SEEN IN plaques on their brass
// stands behind velvet ropes (the bench, the hydrant, the trash can), the tip jars and their PHOTOS $20 cards, Steve's
// standees and posters (all of it YELLOW), a poster kiosk, the tram's route sign, the sawhorses at the holes; at the
// play plane, what he stands on (lit along its lips): the planter, the trash can, the movie palace's marquee, the
// awning, the billboard's catwalk, the hotel's scaffold and its deck (the CLOSED SET sandbag wall under it, no way
// through), the bus shelters; and at the end, THRONES OF THE STARS: its queue's switchbacks, its marquee on its posts
// (a gold toilet up on top), the coaster's legs and lift hill going up behind.

import type { Light } from '../../../m1/game/render/lighting';
import { GY } from '../geometry';
import { X, Y, SINK, TRENCH, TRAM, MARQUEE_X, SOLIDS, LEDGES, LAMPS, STEVES, DECK } from './layout';
import { guest } from './paint';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, still, stillAt, seen, timeOfDay, signText, signW,
  FRONT_D, PLY, SAND, BRASS, CONCRETE, IRON, VELVET, STEVE, STEEL, LIP, CORAL, CHAR,
  ramp6, hour, rampH, glassOf, lit, slab, post, ball, board, deco, bulbs, paint, plain, sideBack, topBack, underBack, starPts,
} from './kit';
import { gate } from '../../hub/letters';
import { streetPalm } from './far';

/** Where things stand going back: the lamps by the curb, the plaques and ropes, the palms, the queue. */
export const LAMP_D = 0.965, PROP_D = 0.952, PALM_D = 0.935;

// ---------------------------------------------------------------------------------------------------------------
// Stuntman Steve (all of it yellow, like his stunt suit)

/** His face (the mullet, the cheap gold aviators, the horseshoe mustache, the neck brace), its middle-top at (x, y),
 *  `s` its scale. */
const steveFace = (g: Ctx, x: number, y: number, s: number) => {
  const skin = ['#8A5A3A', '#B8825A', '#E2B48C', '#F2CCA8'], hair = ['#3A2410', '#6A4420', '#8A5A2A', '#A8763A'];
  const P = (dx: number, dy: number, w: number, h: number, col: string) => box(g, x + dx * s, y + dy * s, Math.max(1, w * s), Math.max(1, h * s), col);
  // (the mullet: down the back of his neck; the feathered top)
  P(-9, -1, 19, 7, INK); P(-8, 0, 17, 6, hair[2]); P(-8, 0, 6, 3, hair[3]); P(6, 2, 6, 18, INK); P(7, 3, 4, 16, hair[1]);
  // (the face, stepped: lit left, shaded right)
  P(-8, 4, 15, 17, INK); P(-7, 5, 13, 15, skin[2]); P(-7, 5, 4, 15, skin[3]); P(3, 5, 3, 15, skin[1]);
  // (the aviators: gold frames, dark lenses, a glint)
  P(-7, 9, 13, 1, BRASS[3]); P(-6, 10, 5, 3, '#2A2A3A'); P(0, 10, 5, 3, '#2A2A3A'); P(-5, 10, 1, 1, '#FFFFFF'); P(1, 10, 1, 1, '#FFFFFF');
  // (the horseshoe mustache, the grin)
  P(-5, 15, 9, 2, hair[1]); P(-5, 15, 2, 5, hair[1]); P(2, 15, 2, 5, hair[1]); P(-3, 17, 5, 1, '#F8F2E2');
  // (the neck brace)
  P(-8, 20, 16, 4, INK); P(-7, 21, 14, 2, '#F4F0E8'); P(-7, 21, 14, 1, '#FFFFFF');
};

/** A Steve card (a flier taped up, a poster in a frame), its middle at (x, y), `s` its scale. */
export const steveCard = (g: Ctx, x: number, y: number, s: number, seed: number, kind: 'flier' | 'poster' = 'flier') => {
  const w = Math.round(44 * s), h = Math.round(60 * s), l = Math.round(x - w / 2), t = Math.round(y - h / 2);
  const Y = STEVE, paper = [Y[3], Y[4], Y[3]][seed % 3];
  if (kind === 'poster') { box(g, l - 4, t - 4, w + 8, h + 8, INK); box(g, l - 3, t - 3, w + 6, h + 6, BRASS[2]); box(g, l - 3, t - 3, w + 6, 1, BRASS[5]); box(g, l - 3, t - 3, 1, h + 6, BRASS[4]); }
  box(g, l - 1, t - 1, w + 2, h + 2, INK);
  box(g, l, t, w, h, paper); box(g, l, t, w, Math.max(1, 2 * s), Y[5]); box(g, l, t, Math.max(1, 2 * s), h, Y[5]);
  box(g, l + w - Math.max(1, 2 * s), t, Math.max(1, 2 * s), h, Y[2]); box(g, l, t + h - Math.max(1, 2 * s), w, Math.max(1, 2 * s), Y[2]);
  // (the sunburst behind his head)
  const cx = x, cy = t + 18 * s;
  for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; if (k % 2) continue; poly(g, [[cx, cy], [cx + Math.cos(a - 0.18) * 22 * s, cy + Math.sin(a - 0.18) * 22 * s], [cx + Math.cos(a + 0.18) * 22 * s, cy + Math.sin(a + 0.18) * 22 * s]], Y[5]); }
  steveFace(g, x - 1 * s, t + 6 * s, s);
  // (his thumb up)
  box(g, x - 16 * s, t + 22 * s, 6 * s, 7 * s, INK); box(g, x - 15 * s, t + 23 * s, 4 * s, 5 * s, '#E2B48C'); box(g, x - 14 * s, t + 18 * s, 2 * s, 5 * s, '#E2B48C');
  // (the car behind him going past: a red streak, speed lines)
  box(g, l + 4 * s, t + 34 * s, 22 * s, 6 * s, INK); box(g, l + 5 * s, t + 35 * s, 20 * s, 4 * s, '#C83A2A'); box(g, l + 8 * s, t + 32 * s, 11 * s, 3 * s, '#C83A2A'); box(g, l + 5 * s, t + 35 * s, 20 * s, 1, '#F07A5A');
  for (let i = 0; i < 3; i++) box(g, l + 28 * s, t + (34 + i * 2.5) * s, 10 * s, Math.max(1, s * 0.7), Y[1]);
  // (the show's name, in the park's letters)
  const L = plain(s >= 1.5 ? 2 : 1, s >= 1.5 ? 2 : 1, '#2A1408');
  if (s >= 0.9) { signText(g, 'STUNTMAN', x, t + 50 * s, L); signText(g, 'STEVE', x, t + 58 * s, L); }
  else box(g, l + 4 * s, t + 46 * s, w - 8 * s, Math.max(1, 3 * s), '#2A1408');
  if (kind === 'flier') { box(g, l + 3, t + 1, 3, 1, '#A1A1AA'); box(g, l + w - 6, t + 1, 3, 1, '#A1A1AA'); poly(g, [[l + w, t + h - 7 * s], [l + w - 7 * s, t + h], [l + w, t + h]], '#D6D3D1'); poly(g, [[l + w - 7 * s, t + h - 7 * s], [l + w, t + h - 7 * s], [l + w - 7 * s, t + h]], Y[2]); }
};

/** A Steve standee: him life size on cardboard, in the yellow stunt suit (a red stripe down it), white boots, a thumb
 *  up, his name on a yellow plate at his feet; the cardboard easel behind. Feet at (0, 0). */
const paintStandee = (g: Ctx) => {
  const Y = ramp6(STEVE[3]);
  // (the easel strut behind, going back)
  poly(g, [[6, -96], [26, -2], [20, -2], [2, -90]], PLY[2]);
  // (the cutout's white edge round him: drawn as a fatter silhouette under)
  const body = (o: number, col: string) => {
    box(g, -13 - o, -98 - o, 26 + o * 2, 60 + o * 2, col);
    box(g, -12 - o, -40 - o, 11 + o * 2, 38 + o * 2, col); box(g, 1 - o, -40 - o, 11 + o * 2, 38 + o * 2, col);
    box(g, -22 - o, -96 - o, 10 + o * 2, 30 + o * 2, col); box(g, 12 - o, -96 - o, 10 + o * 2, 20 + o * 2, col);
    box(g, -10 - o, -126 - o, 22 + o * 2, 30 + o * 2, col);
  };
  body(3, INK); body(2, '#F4F0E8');
  // (the suit, stepped; the stripe; the belt and its big buckle)
  box(g, -13, -98, 26, 60, Y[3]); box(g, -13, -98, 6, 60, Y[4]); box(g, 7, -98, 6, 60, Y[2]);
  box(g, -12, -40, 11, 32, Y[3]); box(g, 1, -40, 11, 32, Y[2]); box(g, -12, -40, 3, 32, Y[4]);
  box(g, -3, -98, 3, 92, '#C83A2A'); box(g, -3, -98, 1, 92, '#F07A5A');
  box(g, -13, -44, 26, 4, '#3A2A1A'); box(g, -5, -45, 10, 6, BRASS[3]); box(g, -5, -45, 10, 1, BRASS[5]);
  // (the boots: white, stepped)
  box(g, -13, -10, 12, 10, '#D8D4CC'); box(g, 1, -10, 12, 10, '#C8C4BC'); box(g, -13, -10, 12, 2, '#FFFFFF'); box(g, 1, -10, 12, 2, '#F4F0E8');
  // (an arm on his hip, the other up: the thumb)
  box(g, -22, -96, 9, 28, Y[4]); box(g, -22, -68, 9, 6, '#E2B48C');
  box(g, 13, -96, 9, 14, Y[3]); box(g, 15, -110, 7, 16, Y[3]); box(g, 14, -118, 8, 9, '#E2B48C'); box(g, 16, -126, 3, 8, '#E2B48C');
  steveFace(g, 1, -126, 1.1);
  // (his name on the plate at his feet: yellow)
  board(g, 0, -1, ['STUNTMAN STEVE'], plain(1, 1, '#2A1408'), STEVE[3], STEVE, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// The lamps, the palms, the plaques and ropes, the tip jars, the hydrant, the kiosk

/** An old cast-iron lamppost (a double lantern), its PA horn if `horn`, Steve's flier taped round it. Feet at (0, 0). */
const paintLamp = (g: Ctx, horn: boolean, seed: number) => {
  const I = IRON.map(c => hour(c));
  // (the base: an octagon in steps, a brass star on it)
  box(g, -11, -22, 22, 22, INK); box(g, -10, -21, 20, 21, I[3]); box(g, -10, -21, 5, 21, I[4]); box(g, 5, -21, 5, 21, I[1]);
  box(g, -12, -24, 24, 4, INK); box(g, -11, -23, 22, 2, I[4]);
  poly(g, starPts(0, -11, 4), BRASS[4]); box(g, -1, -12, 1, 1, BRASS[5]);
  // (the fluted shaft: thick low, thin high, a collar between)
  box(g, -6, -84, 12, 62, INK); box(g, -5, -84, 10, 62, I[3]); for (let k = -4; k < 5; k += 3) box(g, k, -84, 1, 62, I[2]); box(g, -5, -84, 2, 62, I[5]);
  box(g, -8, -90, 16, 6, INK); box(g, -7, -89, 14, 4, I[4]); box(g, -7, -89, 14, 1, I[5]);
  post(g, 0, -200, -90, 6, I);
  box(g, -6, -150, 12, 5, INK); box(g, -5, -149, 10, 3, I[4]);
  // (the crossarm: a scroll each way to a lantern)
  for (const s of [-1, 1]) {
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -198); g.quadraticCurveTo(s * 14, -214, s * 24, -204); g.stroke();
    g.strokeStyle = I[4]; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -198); g.quadraticCurveTo(s * 14, -214, s * 24, -204); g.stroke();
    g.strokeStyle = I[3]; g.lineWidth = 2; g.beginPath(); g.arc(s * 8, -196, 4, 0, Math.PI * 2); g.stroke();
    const lx = s * 24, on = lit();
    box(g, lx - 6, -206, 12, 4, INK); box(g, lx - 5, -205, 10, 2, I[4]);
    box(g, lx - 7, -226, 14, 20, INK);
    box(g, lx - 6, -225, 12, 18, on ? '#FFE9A8' : '#E8E0C8'); box(g, lx - 6, -225, 4, 18, on ? '#FFF8E0' : '#F8F4E8'); box(g, lx + 3, -225, 3, 18, on ? '#F2C870' : '#C8BCA0');
    for (const yy of [-219, -213]) box(g, lx - 6, yy, 12, 1, I[2]);
    poly(g, [[lx - 9, -226], [lx, -236], [lx + 9, -226]], INK); poly(g, [[lx - 7, -227], [lx, -234], [lx + 7, -227]], I[3]); poly(g, [[lx - 7, -227], [lx, -234], [lx, -227]], I[4]);
    box(g, lx - 1, -240, 2, 5, I[3]); ball(g, lx, -241, 2, '#4A5250', false);
  }
  // (the PA horn: a gray trumpet bracketed on, pointing out at the street)
  if (horn) {
    box(g, 4, -188, 10, 6, INK); box(g, 5, -187, 8, 4, '#5A5E66');
    poly(g, [[13, -191], [32, -200], [32, -170], [13, -179]], INK); poly(g, [[14, -190], [31, -198], [31, -172], [14, -180]], '#8A8E96'); poly(g, [[14, -190], [31, -198], [31, -192], [14, -186]], '#B4B8C0');
    box(g, 30, -198, 3, 28, '#4A4E56');
  }
  // (Steve's flier taped round the shaft)
  steveCard(g, 0, -116, 0.5, seed);
  box(g, -12, -132, 24, 2, 'rgba(240,240,220,0.6)'); box(g, -12, -102, 24, 2, 'rgba(240,240,220,0.6)');
};

/** A street palm, near (a big one): its trunk ringed and stepped across, its skirt of dead fronds, its head of fans. */
export const paintPalm = (g: Ctx, h: number, seed: number) => {
  const T = (c: string) => hour(c);
  // (the trunk: wide at the foot, ringed, lit down its left, a lean)
  const lean = (hash(seed) - 0.5) * 24;
  for (let k = 0; k < h; k += 3) {
    const t = k / h, px = Math.round(lean * t * t), w = Math.round(14 - t * 4);
    box(g, px - w / 2 - 1, -k - 3, w + 2, 3, INK);
    const ring = (k / 3) % 3 === 0;
    box(g, px - w / 2, -k - 3, w, 3, T(ring ? '#5A4430' : '#7A6048'));
    box(g, px - w / 2, -k - 3, 3, 3, T(ring ? '#7A6048' : '#9A7E62'));
    box(g, px + w / 2 - 3, -k - 3, 3, 3, T('#4A3624'));
  }
  const tx = Math.round(lean), ty = -h;
  // (the skirt: dead fronds hanging down the top of the trunk, in layers)
  for (let k = 0; k < 26; k++) { const sx = tx - 13 + k, len = 22 + hash(seed * 3 + k) * 16; box(g, sx, ty + 2, 1, len, T(k % 3 ? '#8A7050' : '#6A5236')); if (k % 4 === 0) box(g, sx, ty + 2 + len, 1, 2, INK); }
  box(g, tx - 13, ty, 26, 4, T('#5A4430'));
  // (the head: fan fronds out round it, drooping, each a spine of leaflets, lit along the top)
  const F = [T('#1E2E1A'), T('#2E4622'), T('#466A30'), T('#68904A'), T('#8EB466')];
  for (let k = 0; k < 15; k++) {
    const a = Math.PI * 0.95 + (k / 14) * Math.PI * 1.1 + (hash(seed + k) - 0.5) * 0.2, len = 40 + hash(seed * 7 + k) * 22;
    for (let s = 0; s < len; s += 2) {
      const u = s / len, xx = Math.round(tx + Math.cos(a) * s), yy = Math.round(ty + Math.sin(a) * s * 0.75 + u * u * 22);
      box(g, xx - 2, yy - 1, 5, 3, INK);
      box(g, xx - 1, yy, 3, 2, Math.sin(a) < -0.5 ? F[3] : u < 0.5 ? F[2] : F[1]);
      if (s % 4 === 0) { box(g, xx + (Math.cos(a) > 0 ? -2 : 2), yy + 2, 2, 3 + Math.round(u * 4), F[0]); box(g, xx, yy, 1, 1, F[4]); }
    }
  }
  box(g, tx - 5, ty - 3, 10, 7, F[0]); box(g, tx - 4, ty - 3, 5, 3, F[2]);
};

/** Velvet rope on brass posts, from x0 to x1 (local), standing on y 0. */
const rope = (g: Ctx, x0: number, x1: number) => {
  const n = Math.max(1, Math.round((x1 - x0) / 60)), V = VELVET;
  for (let k = 0; k <= n; k++) {
    const x = x0 + ((x1 - x0) * k) / n;
    if (k < n) {
      const nx = x0 + ((x1 - x0) * (k + 1)) / n;
      const sag = (w: number, col: string, dy: number) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, -30 + dy); g.quadraticCurveTo((x + nx) / 2, -14 + dy, nx, -30 + dy); g.stroke(); };
      sag(5, INK, 0); sag(3, V[2], 0); sag(1, V[4], -1);
    }
    box(g, x - 3, -36, 6, 36, INK); box(g, x - 2, -35, 4, 35, BRASS[3]); box(g, x - 2, -35, 1, 35, BRASS[5]); box(g, x + 1, -35, 1, 35, BRASS[1]);
    box(g, x - 7, -5, 14, 5, INK); box(g, x - 6, -4, 12, 4, BRASS[2]); box(g, x - 6, -4, 12, 1, BRASS[4]);
    ball(g, x, -38, 3.5, BRASS[4]);
  }
};
/** An AS SEEN IN plaque on its brass stand (what it was seen in under it), its middle at x, feet at 0. */
const plaque = (g: Ctx, x: number, seenIn: string) => {
  const L = deco('#F2D27A', '#6A4410', 2), L2 = plain(1, 1, '#FEF3C7', '#3A2408');
  const w = Math.max(signW('AS SEEN IN', L), signW(seenIn, L2)) + 16;
  box(g, x - 2, -46, 4, 46, INK); box(g, x - 1, -46, 2, 46, BRASS[2]);
  box(g, x - 9, -4, 18, 4, INK); box(g, x - 8, -3, 16, 3, BRASS[2]);
  box(g, x - w / 2 - 2, -84, w + 4, 40, INK);
  box(g, x - w / 2 - 1, -83, w + 2, 38, BRASS[1]); box(g, x - w / 2, -82, w, 36, BRASS[3]); box(g, x - w / 2, -82, w, 2, BRASS[5]); box(g, x - w / 2, -82, 2, 36, BRASS[4]); box(g, x + w / 2 - 2, -82, 2, 36, BRASS[1]);
  box(g, x - w / 2 + 3, -79, w - 6, 30, BRASS[2]); box(g, x - w / 2 + 3, -79, w - 6, 1, BRASS[1]);
  signText(g, 'AS SEEN IN', x, -63, L);
  signText(g, seenIn, x, -53, L2);
  for (const sx of [x - w / 2 + 2, x + w / 2 - 4]) { box(g, sx, -81, 2, 2, BRASS[1]); box(g, sx, -81, 1, 1, BRASS[5]); }
};
/** The bench that was seen in something: oak slats on cast-iron ends. Feet at 0, from x to x + 110. */
const bench = (g: Ctx, x: number) => {
  const O = ['#2A160C', '#4A2A16', '#6A4024', '#8A5A34', '#AA7A4A'];
  for (const ex of [x + 6, x + 96]) { box(g, ex - 1, -40, 10, 40, INK); box(g, ex, -39, 8, 39, IRON[3]); box(g, ex, -39, 2, 39, IRON[5]); box(g, ex - 3, -2, 14, 2, IRON[2]); }
  for (const [y, hh] of [[-24, 6], [-17, 6], [-46, 6], [-38, 5]] as const) { box(g, x - 1, y - 1, 112, hh + 2, INK); box(g, x, y, 110, hh, O[3]); box(g, x, y, 110, 1, O[4]); box(g, x, y + hh - 1, 110, 1, O[1]); }
};
/** A tip jar on a crate, and a PHOTOS $20 card leaned on it. Feet at 0. */
const paintTipJar = (g: Ctx) => {
  const O = PLY;
  box(g, -15, -22, 30, 22, INK); box(g, -14, -21, 28, 21, O[2]); box(g, -14, -21, 28, 2, O[4]); for (const y of [-14, -7]) box(g, -14, y, 28, 1, O[1]); box(g, -14, -21, 2, 21, O[3]);
  box(g, -9, -42, 18, 21, INK); box(g, -8, -41, 16, 19, 'rgba(200, 236, 255, 0.55)'); box(g, -8, -41, 2, 19, 'rgba(255,255,255,0.7)');
  box(g, -7, -30, 14, 8, '#3A8A3A'); box(g, -6, -30, 5, 3, '#5AAA5A'); box(g, 1, -27, 4, 2, BRASS[4]);
  box(g, -9, -44, 18, 3, INK);
  board(g, 0, -50, ['TIPS'], plain(1, 1, '#2A1A1A'), '#F2EAD8', PLY, 3);
  g.save(); g.translate(18, -2); g.rotate(-0.25);
  box(g, -1, -27, 32, 26, INK); box(g, 0, -26, 30, 24, '#C8A070'); box(g, 0, -26, 30, 2, '#E2C090');
  signText(g, 'PHOTOS', 15, -15, plain(1, 1, '#2A1408')); signText(g, '$20', 15, -6, plain(1, 1, '#B4243A'));
  g.restore();
};
/** A fire hydrant (it was seen in something): red, stepped, its caps and its bolts. Feet at 0. */
const hydrant = (g: Ctx) => {
  const R = ramp6('#C8302A');
  box(g, -12, -4, 24, 4, INK); box(g, -11, -4, 22, 3, R[1]);
  box(g, -9, -30, 18, 26, INK); box(g, -8, -29, 16, 25, R[3]); box(g, -8, -29, 5, 25, R[4]); box(g, 4, -29, 4, 25, R[1]);
  box(g, -14, -24, 28, 7, INK); box(g, -13, -23, 26, 5, R[3]); box(g, -13, -23, 26, 1, R[5]); box(g, -15, -22, 3, 3, BRASS[3]); box(g, 12, -22, 3, 3, BRASS[3]);
  box(g, -11, -34, 22, 5, INK); box(g, -10, -33, 20, 3, R[2]);
  poly(g, [[-8, -34], [0, -42], [8, -34]], INK); poly(g, [[-7, -34], [0, -40], [7, -34]], R[3]); poly(g, [[-7, -34], [0, -40], [0, -34]], R[4]);
  box(g, -1, -45, 3, 4, BRASS[3]);
};
/** A poster kiosk (a round column, its cap and finial; a Steve poster wrapped on it). Feet at 0. */
const kiosk = (g: Ctx) => {
  const R = ramp6(hour('#2E5A4A'));
  for (let k = 0; k < 40; k++) { const u = k / 40; box(g, -20 + k, -150, 1, 146, u < 0.1 ? R[2] : u < 0.35 ? R[4] : u < 0.55 ? R[3] : u < 0.85 ? R[2] : R[1]); }
  box(g, -21, -150, 1, 146, INK); box(g, 20, -150, 1, 146, INK);
  box(g, -24, -8, 48, 8, INK); box(g, -23, -7, 46, 6, R[2]); box(g, -23, -7, 46, 1, R[4]);
  box(g, -25, -158, 50, 10, INK); box(g, -24, -157, 48, 8, R[3]); box(g, -24, -157, 48, 2, R[5]);
  g.fillStyle = INK; g.beginPath(); g.arc(0, -158, 22, Math.PI, 0); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.arc(0, -158, 20, Math.PI, 0); g.fill(); g.fillStyle = R[4]; g.beginPath(); g.arc(-5, -162, 9, Math.PI, 0); g.fill();
  ball(g, 0, -182, 4, BRASS[3]);
  steveCard(g, 0, -86, 1, 1, 'flier');
  for (let k = 0; k < 2; k++) { box(g, -18, -136 + k * 92, 36, 10, ['#E8E0D0', '#B4243A'][k]); box(g, -18, -136 + k * 92, 36, 1, '#FFFFFF'); }
};

// ---------------------------------------------------------------------------------------------------------------
// At the play plane: what he stands on

/** The planter (stand on its rim): concrete, a band of tile, the soil, a palm and agapanthus in it. */
const paintPlanter = (g: Ctx, w: number, h: number) => {
  const C = CONCRETE.map(c => hour(c)), T = rampH('#2E6A8A');
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  slab(g, 0, -h, w, h, ramp6(C[4]));
  box(g, 0, -h + 18, w, 10, INK); for (let x = 1; x < w - 1; x += 10) { box(g, x, -h + 19, 9, 8, T[(x / 10) % 2 ? 3 : 2]); box(g, x, -h + 19, 9, 1, T[5]); }
  for (let x = 30; x < w; x += 60) box(g, x, -h + 30, 1, h - 30, C[2]);
  // (the rim: lit, he stands on it)
  box(g, -3, -h - 2, w + 6, 8, INK); box(g, -2, -h - 1, w + 4, 6, C[5]); box(g, -2, -h - 1, w + 4, 3, LIP[2]); box(g, -2, -h - 1, w + 4, 1, LIP[3]);
};
const paintPlanterTop = (g: Ctx, w: number) => {
  // (the agapanthus along it: strappy leaves, blue heads on stalks)
  for (let k = 0; k < w / 8; k++) { const x = 6 + k * 8; for (let l = -2; l <= 2; l++) { g.strokeStyle = l % 2 ? hour('#3A6A2A') : hour('#5A8A3A'); g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + l * 4, -10, x + l * 7, -6); g.stroke(); } if (k % 3 === 0) { box(g, x, -22, 1, 20, hour('#4A7A2A')); ball(g, x, -24, 3, hour('#5A6AD8'), false); } }
};
/** The trash can (stand on its lid): green steel slats, a dome lid, the flap. */
const paintCan = (g: Ctx, w: number, h: number) => {
  const R = ramp6(hour('#2E5A3A'));
  box(g, -1, -h + 8, w + 2, h - 8, INK);
  for (let x = 0; x < w; x += 5) { const u = x / w; box(g, x, -h + 8, 4, h - 8, u < 0.25 ? R[4] : u < 0.6 ? R[3] : R[2]); box(g, x + 4, -h + 8, 1, h - 8, R[1]); }
  for (const y of [-h + 14, -10]) { box(g, 0, y, w, 4, INK); box(g, 0, y + 1, w, 2, R[2]); }
  box(g, -4, -h - 1, w + 8, 10, INK); box(g, -3, -h, w + 6, 8, R[3]); box(g, -3, -h, w + 6, 3, LIP[2]); box(g, -3, -h, w + 6, 1, LIP[3]);
  box(g, w / 2 - 8, -h + 3, 16, 4, R[0]);
};
/** The movie palace's marquee: its canopy's fascia, chaser bulbs along it (live), its lit lip; the letter board set
 *  back on top (NOW SHOWING). */
const paintMarqueeFront = (g: Ctx, w: number) => {
  const R = ramp6(hour('#7A1A1A')), G = BRASS;
  box(g, -3, -1, w + 6, 18, INK); box(g, -2, 0, w + 4, 16, R[3]); box(g, -2, 0, w + 4, 2, R[4]); box(g, -2, 13, w + 4, 3, R[1]);
  box(g, -2, 4, w + 4, 2, G[3]); box(g, -2, 10, w + 4, 1, G[2]);
  box(g, -3, -2, w + 6, 4, LIP[2]); box(g, -3, -2, w + 6, 1, LIP[3]);
};
const paintLetterBoard = (g: Ctx, w: number) => {
  const bw = w - 20;
  box(g, -bw / 2 - 3, -56, bw + 6, 56, INK); box(g, -bw / 2 - 2, -55, bw + 4, 55, '#2A1A1A');
  for (let x = -bw / 2; x < bw / 2; x += 8) { box(g, x, -54, 2, 2, lit() ? '#FFF2C0' : '#8A7A5A'); box(g, x, -4, 2, 2, lit() ? '#FFF2C0' : '#8A7A5A'); }
  box(g, -bw / 2 + 4, -48, bw - 8, 40, '#F8F2E2'); box(g, -bw / 2 + 4, -48, bw - 8, 2, '#FFFFFF'); for (let y = -36; y < -8; y += 12) box(g, -bw / 2 + 4, y, bw - 8, 1, '#D8D0C0');
  signText(g, 'NOW SHOWING', 0, -40, plain(1, 1, '#7F1D1D'));
  signText(g, 'REVENGERS 14', 0, -21, paint(12, '#1A1418'));
  signText(g, 'RESEMBLE', 0, -10, plain(1, 1, '#1E3A8A'));
};
/** The awning (stand on its front edge): striped canvas, its scalloped valance, a lit tube along the front. */
const paintValance = (g: Ctx, w: number) => {
  const A = ramp6(hour('#B4243A')), Wt = ramp6(hour('#F4EEE2'));
  box(g, -2, -2, w + 4, 16, INK);
  for (let x = 0; x < w; x += 20) { box(g, x, 0, 10, 12, A[3]); box(g, x + 10, 0, 10, 12, Wt[3]); box(g, x, 9, 10, 3, A[1]); box(g, x + 10, 9, 10, 3, Wt[1]); }
  for (let x = 0; x < w; x += 10) { g.fillStyle = (x / 10) % 2 ? Wt[2] : A[2]; g.beginPath(); g.moveTo(x, 12); g.lineTo(x + 10, 12); g.lineTo(x + 5, 18); g.fill(); }
  box(g, -2, -2, w + 4, 4, LIP[2]); box(g, -2, -2, w + 4, 1, LIP[3]);
};
/** The bus shelter's roof edge (stand on it), and its ad (Steve's yellow, or the franchise's). */
const paintShelterRoof = (g: Ctx, w: number) => {
  const S = STEEL.map(c => hour(c));
  box(g, -4, -2, w + 8, 14, INK); box(g, -3, -1, w + 6, 12, S[3]); box(g, -3, 7, w + 6, 4, S[2]); box(g, -3, -1, w + 6, 3, LIP[2]); box(g, -3, -1, w + 6, 1, LIP[3]);
  signText(g, 'BUS', w / 2, 9, plain(1, 1, S[0]));
};
const paintShelterBack = (g: Ctx, w: number, h: number, steve: boolean) => {
  const S = STEEL.map(c => hour(c)), glass = glassOf();
  // (the back panel: glass either end, the lit ad in the middle; the bench in front of it)
  for (const px of [4, w - 8]) { box(g, px - 1, -h, 6, h, INK); box(g, px, -h, 4, h, S[3]); box(g, px, -h, 1, h, S[5]); }
  box(g, 8, -h + 14, w - 16, h - 40, glass[1]); box(g, 8, -h + 14, w - 16, 8, glass[2]); checker(g, 8, -h + 22, w - 16, 2, glass[2], 0, 2);
  const ax = w / 2 - 26, ay = -h + 20;
  box(g, ax - 2, ay - 2, 56, 72, INK);
  if (steve) { box(g, ax, ay, 52, 68, STEVE[3]); steveCard(g, w / 2, ay + 34, 1.05, 2, 'poster'); }
  else {
    box(g, ax, ay, 52, 68, '#1E3A8A'); for (let k = 0; k < 4; k++) box(g, ax + 6 + k * 11, ay + 20, 9, 30, ['#B4243A', '#3A6AB8', '#2A8A4A', '#C8962E'][k]);
    signText(g, 'REVENGERS', w / 2, ay + 12, plain(1, 1, '#FDE047')); signText(g, 'RESEMBLE', w / 2, ay + 62, plain(1, 1, '#F8FAFC'));
  }
  box(g, 10, -26, w - 20, 5, INK); box(g, 11, -25, w - 22, 3, S[4]); box(g, 16, -21, 3, 21, S[2]); box(g, w - 19, -21, 3, 21, S[2]);
};
/** The billboard up behind the catwalk: REVENGERS: RESEMBLE, the team posed, its lamps on their arms. Its foot (the
 *  catwalk) at (0, 0), across -30..w+30. */
const paintBillboard = (g: Ctx, w: number) => {
  const S = STEEL.map(c => hour(c)), bw = w + 60, bx = -30, top = -138;
  box(g, bx - 3, top - 3, bw + 6, 132, INK);
  const sky = ['#121A4A', '#1A2A6A', '#24388A', '#3A2A7A', '#5A2A6A'].map(c => hour(c));
  for (let k = 0; k < 5; k++) box(g, bx, top + k * 25, bw, 26, sky[k]);
  for (let k = 0; k < 5; k++) checker(g, bx, top + k * 25 + 24, bw, 2, sky[Math.min(4, k + 1)], 0, 2);
  // (the team, posed: seven of them in a line, stepped, capes and shields; one of them pointing)
  for (let k = 0; k < 7; k++) {
    const cx = bx + 26 + k * ((bw - 52) / 6), foot = top + 120, hh = 46 + (k % 3) * 6, col = ['#B4243A', '#3A6AB8', '#2A8A4A', '#8A3AB8', '#C8962E', '#DC2626', '#0E7490'][k];
    const R = ramp6(hour(col));
    box(g, cx - 9, foot - hh, 18, hh, INK); box(g, cx - 8, foot - hh + 1, 16, hh - 1, R[3]); box(g, cx - 8, foot - hh + 1, 5, hh - 1, R[4]); box(g, cx + 4, foot - hh + 1, 4, hh - 1, R[1]);
    ball(g, cx, foot - hh - 7, 7, hour(['#E2B48C', '#8A5A36', '#C8946A', '#F0D0B0', '#5A3A24', '#D8A880', '#B8825A'][k]));
    box(g, cx - 5, foot - hh - 9, 10, 3, INK);
    if (k % 2) poly(g, [[cx - 8, foot - hh + 2], [cx - 22, foot - 4], [cx - 8, foot - 10]], R[1]);
    if (k === 3) box(g, cx + 8, foot - hh + 4, 18, 4, R[3]);
  }
  signText(g, 'REVENGERS', w / 2, top + 32, gate({ sx: 3, sy: 3 }, '#FDE047', '#1E3A8A'));
  signText(g, 'RESEMBLE', w / 2, top + 56, gate({ sx: 2, sy: 2 }, '#F8FAFC', '#1E3A8A'));
  board(g, w / 2, top + 116, ['PART 14: THE RE-SEMBLING'], plain(1, 1, '#FDE68A'), '#1A1418', STEEL, 4);
  // (its frame's edge, the lamps over it on their arms)
  box(g, bx - 3, top - 3, bw + 6, 3, S[4]);
  for (let x = bx + 20; x < bx + bw; x += 50) { box(g, x, top - 18, 2, 16, S[2]); box(g, x - 5, top - 22, 12, 5, INK); box(g, x - 4, top - 21, 10, 3, lit() ? '#FFF2C8' : S[4]); }
};
/** The catwalk (stand on it): a steel grating, its lit lip, the railing behind. */
const paintCatwalk = (g: Ctx, w: number) => {
  const S = STEEL.map(c => hour(c));
  box(g, -2, -2, w + 4, 12, INK); box(g, -1, -1, w + 2, 10, S[2]);
  for (let x = 0; x < w; x += 4) box(g, x, 2, 2, 6, S[1]);
  box(g, -1, -1, w + 2, 3, LIP[2]); box(g, -1, -1, w + 2, 1, LIP[3]);
};
/** A scaffold's planks (stand on them): boards laid across, their ends, a toe board; the lit lip. */
const paintPlanks = (g: Ctx, w: number) => {
  box(g, -2, -2, w + 4, 14, INK);
  for (let x = 0, k = 0; x < w; x += 46, k++) { const pw = Math.min(46, w - x); box(g, x, 0, pw - 1, 10, PLY[3 + (k % 2)]); box(g, x, 7, pw - 1, 3, PLY[2]); box(g, x + pw - 2, 0, 1, 10, PLY[1]); for (let n = 6; n < pw - 4; n += 18) box(g, x + n, 4, 1, 1, PLY[0]); }
  box(g, -1, -1, w + 2, 3, LIP[2]); box(g, -1, -1, w + 2, 1, LIP[3]);
};
/** The CLOSED SET wall under the deck: sandbags stacked to the deck, 2x4s braced across it, the sign bolted on. */
const paintClosedSet = (g: Ctx, w: number, h: number) => {
  const S = SAND.map(c => hour(c));
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  for (let y = 0, row = 0; y < h; y += 13, row++) for (let x = row % 2 ? -12 : 0; x < w; x += 24) {
    const bx = Math.max(0, x), bw = Math.min(x + 24, w) - bx;
    g.fillStyle = INK; g.beginPath(); g.roundRect(bx, -y - 13, bw, 13, 4); g.fill();
    g.fillStyle = S[2 + ((row + x) % 2)]; g.beginPath(); g.roundRect(bx + 1, -y - 12, bw - 2, 11, 3); g.fill();
    box(g, bx + 3, -y - 11, Math.max(1, bw - 10), 2, S[5]); box(g, bx + 2, -y - 4, bw - 4, 2, S[1]);
  }
  // (the 2x4s across it, an X)
  g.lineCap = 'butt';
  for (const [x0, y0, x1, y1] of [[-6, 0, w + 6, -h], [-6, -h, w + 6, 0]] as const) { g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = PLY[3]; g.lineWidth = 6; g.stroke(); g.strokeStyle = PLY[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0 - 2); g.lineTo(x1, y1 - 2); g.stroke(); }
  // (the sign: white, red stencil, bolted to it)
  board(g, w / 2, -150, ['CLOSED', 'SET'], { sx: 2, sy: 2, fill: '#C8302A', stencil: true }, '#F4F0E8', STEEL, 6);
};
/** A sawhorse barricade (orange and white rails, a blinker), its sign on it. Feet at 0. */
export const paintSawhorse = (g: Ctx, text: string) => {
  const O = ['#4A1404', '#7C2408', '#B83C0C', '#EA6214', '#FB9440', '#FFC48A'];
  for (const lx of [-26, 22]) { box(g, lx - 1, -36, 6, 36, INK); box(g, lx, -36, 4, 36, O[3]); box(g, lx, -36, 1, 36, O[5]); poly(g, [[lx - 6, 0], [lx + 1, -12], [lx + 3, -12], [lx + 10, 0]], O[1]); }
  for (const by of [-34, -21]) { box(g, -33, by - 1, 66, 9, INK); for (let k = 0; k < 64; k += 8) box(g, -32 + k, by, Math.min(8, 64 - k), 7, (k / 8) % 2 ? '#F8FAFC' : O[3]); box(g, -32, by, 64, 1, 'rgba(255,255,255,0.5)'); }
  board(g, 0, -42, [text], { sx: 1, sy: 1, fill: '#1A1418' }, '#FACC15', STEEL, 4);
  box(g, -4, -55, 8, 6, INK); box(g, -1, -50, 2, 2, INK);
};
/** A sign on a post (a stake, a pole), its board up top. Feet at 0. */
export const paintPostSign = (g: Ctx, lines: string[], bg: string, ink: string, h = 120) => {
  const S = STEEL.map(c => hour(c));
  post(g, 0, -h, 0, 5, S);
  board(g, 0, -h - 8, lines, plain(1, 1, ink), bg, S, 6);
};

// ---------------------------------------------------------------------------------------------------------------
// THRONES OF THE STARS (the end)

const THRONE_D = 0.8;
/** The coaster's legs, its lift hill and a loop going up behind the queue plaza (painted once at its depth). Foot
 *  (the plaza's middle) at (0, 0). */
const paintCoaster = (g: Ctx) => {
  const S = ['#1A1028', '#2A1A40', '#3E2A5A', '#5A3E7A', '#7A5A9A', '#A07AC0'].map(c => hour(c)), Gd = BRASS.map(c => hour(c));
  const lattice = (x: number, top: number) => {
    for (const lx of [x - 8, x + 8]) { box(g, lx - 2, top, 5, -top, INK); box(g, lx - 1, top, 3, -top, S[3]); box(g, lx - 1, top, 1, -top, S[5]); }
    g.strokeStyle = S[2]; g.lineWidth = 1; g.beginPath(); for (let y = top + 4; y < -8; y += 16) { g.moveTo(x - 8, y); g.lineTo(x + 8, y + 16); g.moveTo(x + 8, y); g.lineTo(x - 8, y + 16); } g.stroke();
    box(g, x - 12, -4, 24, 4, INK); box(g, x - 11, -4, 22, 3, S[2]);
  };
  for (let k = 0; k < 6; k++) lattice(-300 + k * 140, -(300 + (k % 3) * 110));
  const rail = (path: () => void, w = 6) => {
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = INK; g.lineWidth = w + 3; g.beginPath(); path(); g.stroke();
    g.strokeStyle = Gd[2]; g.lineWidth = w; g.beginPath(); path(); g.stroke();
    g.strokeStyle = Gd[4]; g.lineWidth = 2; g.save(); g.translate(-1, -2); g.beginPath(); path(); g.stroke(); g.restore();
  };
  // (the lift hill, its chain dogs; a train going up it, gold thrones for seats)
  rail(() => { g.moveTo(-420, -190); g.lineTo(200, -560); });
  for (let k = 0; k < 30; k++) { const t = k / 30, x = -420 + 620 * t, y = -190 - 370 * t; box(g, x - 1, y + 1, 3, 3, S[1]); }
  for (let k = 0; k < 4; k++) {
    const t = 0.38 + k * 0.05, x = -420 + 620 * t, y = -190 - 370 * t;
    g.save(); g.translate(x, y - 8); g.rotate(-0.54);
    box(g, -12, -6, 24, 10, INK); box(g, -11, -5, 22, 8, Gd[3]); box(g, -11, -5, 22, 2, Gd[5]); box(g, -4, -12, 10, 7, '#F4F0E8'); box(g, -4, -12, 10, 1, '#FFFFFF');
    g.restore();
  }
  rail(() => { g.moveTo(200, -560); g.quadraticCurveTo(260, -600, 300, -520); g.lineTo(380, -280); });
  rail(() => g.arc(300, -300, 120, 0, Math.PI * 2));
  rail(() => g.arc(470, -230, 80, 0, Math.PI * 2), 5);
};

/** The marquee's frame and board (static), on its two posts: its bulbs and letters are live. */
const paintThroneBoard = (g: Ctx) => {
  const S = STEEL.map(c => hour(c)), Gd = BRASS;
  for (const px of [-206, 206]) { box(g, px - 6, -262, 12, 262, INK); box(g, px - 5, -262, 10, 262, S[3]); box(g, px - 5, -262, 3, 262, S[5]); box(g, px + 3, -262, 2, 262, S[1]); box(g, px - 10, -8, 20, 8, INK); box(g, px - 9, -7, 18, 7, S[2]); }
  box(g, -232, -384, 464, 124, INK); box(g, -230, -382, 460, 120, Gd[2]); box(g, -230, -382, 460, 2, Gd[5]); box(g, -230, -382, 2, 120, Gd[4]);
  box(g, -224, -376, 448, 108, '#3A0418'); for (let y = -376; y < -268; y += 18) box(g, -224, y, 448, 9, '#4C0519');
  box(g, -220, -284, 440, 18, '#1A0A10');
  signText(g, 'SIT WHERE THE STARS SAT', 0, -270, plain(1, 1, '#FEF3C7'));
  // (a gold toilet up on top: the throne of the stars)
  const T = BRASS;
  box(g, -24, -394, 48, 10, INK); box(g, -23, -393, 46, 8, T[2]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, -404, 26, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = T[3]; g.beginPath(); g.ellipse(0, -404, 24, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = T[5]; g.beginPath(); g.ellipse(-6, -406, 10, 2, 0, 0, Math.PI * 2); g.fill();
  box(g, -14, -430, 30, 24, INK); box(g, -13, -429, 28, 22, T[3]); box(g, -13, -429, 8, 22, T[4]); box(g, 9, -429, 6, 22, T[1]);
  box(g, -16, -434, 34, 6, INK); box(g, -15, -433, 32, 4, T[4]);
  box(g, -10, -394, 20, 4, T[1]);
};
/** WAIT FROM HERE: a board on a post. Feet at 0. */
const paintWaitSign = (g: Ctx) => {
  const S = STEEL.map(c => hour(c));
  post(g, 0, -100, 0, 5, S);
  board(g, 0, -118, ['WAIT FROM HERE'], plain(1, 1, '#18181B'), '#F8FAFC', S, 6);
  board(g, 0, -96, ['4 HOURS'], { sx: 2, sy: 2, fill: ['#FFF0A8', '#E8C25A', '#C8962E', '#9A6A1C'], dither: true, shadow: '#3A2408' }, '#2A1A1A', BRASS, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// Putting it all down

/** Every thing standing on the pavement going back: [x (world), depth, key, box, paint]. The farthest first. */
interface Standing { x: number; d: number; key: string; bx: number; by: number; bw: number; bh: number; paint: (g: Ctx) => void; live?: (c: Ctx) => void }

const PALMS = [1150, 2450, 4300, 7100, 9050];
const TIPS = [1250, 2650, 4700, 6050, 10250];
const ONLOOKERS: [number, number][] = [[1800, 5], [3250, 8], [4800, 14], [6100, 19], [10650, 27], [10880, 30]];

const standing = (f: number): Standing[] => {
  const out: Standing[] = [];
  for (const rx of PALMS) { const h = 240 + (rx % 3) * 30; out.push({ x: X(rx), d: PALM_D, key: `palm-${rx}`, bx: -80, by: -h - 70, bw: 160, bh: h + 72, paint: g => paintPalm(g, h, rx) }); }
  for (const [rx, horn] of LAMPS) out.push({ x: X(rx), d: LAMP_D, key: `lamp-${horn ? 1 : 0}-${rx % 3}`, bx: -40, by: -250, bw: 80, bh: 252, paint: g => paintLamp(g, horn, rx) });
  for (const rx of TIPS) out.push({ x: X(rx), d: 0.972, key: 'tipjar', bx: -20, by: -62, bw: 60, bh: 64, paint: paintTipJar });
  for (const [rx, kind] of STEVES) {
    if (kind === 'standee') out.push({ x: X(rx), d: 0.958, key: 'standee', bx: -52, by: -140, bw: 104, bh: 152, paint: paintStandee });
    else if (rx === 7640) out.push({ x: X(rx), d: 0.95, key: 'kiosk', bx: -30, by: -190, bw: 60, bh: 192, paint: kiosk });
  }
  // (the AS SEEN IN bench, roped off; the hydrant; the trash can's plaque)
  out.push({ x: X(815), d: PROP_D, key: 'bench', bx: -90, by: -90, bw: 240, bh: 92, paint: g => { bench(g, -55); rope(g, -75, 75); plaque(g, 92, 'A BENCH (1979)'); } });
  out.push({ x: X(5123), d: PROP_D, key: 'hydrant', bx: -70, by: -90, bw: 190, bh: 92, paint: g => { hydrant(g); rope(g, -40, 40); plaque(g, 70, 'A HYDRANT'); } });
  out.push({ x: X(2895), d: 0.96, key: 'canplaque', bx: -50, by: -90, bw: 100, bh: 92, paint: g => plaque(g, 0, 'A TRASH CAN') });
  // (the tram route's sign by the curb; the sinkhole's stake at its far edge; the trench's)
  out.push({ x: X(TRAM.b) - 220, d: 0.962, key: 'tramsign', bx: -90, by: -160, bw: 180, bh: 162, paint: g => paintPostSign(g, ['TRAM ROUTE', 'IT DOES NOT STOP'], '#FACC15', '#18181B', 110) });
  out.push({ x: X((SINK.a + SINK.b) / 2), d: FRONT_D - 0.006, key: 'starsoon', bx: -80, by: -110, bw: 160, bh: 112, paint: g => paintPostSign(g, ['STAR', 'COMING SOON'], '#F8F2E2', '#7F1D1D', 60) });
  // (the queue's switchbacks, the waiting sign)
  const mx = X(MARQUEE_X);
  for (let k = 0; k < 3; k++) out.push({ x: mx - 220, d: 0.97 - k * 0.022, key: 'queue', bx: -170, by: -50, bw: 340, bh: 52, paint: g => rope(g, -160, 160) });
  out.push({ x: mx + 305, d: 0.965, key: 'wait', bx: -70, by: -140, bw: 140, bh: 142, paint: paintWaitSign });
  out.push({ x: mx, d: 0.95, key: 'throneboard', bx: -240, by: -440, bw: 480, bh: 442, paint: paintThroneBoard, live: c => {
    // (THRONES OF THE STARS in bulbs, chasing)
    signText(c, 'THRONES', mx, GY - 324, bulbs(4, 4, '#FBBF24', f % 30 < 24));
    signText(c, 'OF THE STARS', mx, GY - 290, bulbs(3, 3, '#FDE68A', f % 30 >= 6));
  } });
  void SAND; void CORAL; void CHAR;
  return out;
};

/** The far things at the end (the coaster's structure, behind everything else on the street). */
export const drawThroneCoaster = (c: Ctx, v: View) => {
  const mx = X(MARQUEE_X);
  if (!seen(v, mx - 520, mx + 600, THRONE_D)) return;
  stillAt(c, v, THRONE_D, 'throne-coaster', mx, GY, -520, -640, 1120, 642, paintCoaster);
};

/** Posters pasted on the fronts (Steve's, framed). */
export const drawPosters = (c: Ctx, v: View) => {
  for (const [rx, kind] of STEVES) {
    if (kind !== 'poster' || rx === 7640) continue;
    if (!seen(v, X(rx) - 60, X(rx) + 60, FRONT_D)) continue;
    stillAt(c, v, FRONT_D, `poster-${rx % 3}`, X(rx), GY - 150, -60, -70, 120, 140, g => steveCard(g, 0, 0, 1.8, rx, 'poster'));
  }
};

/** The things standing on the pavement, and the onlookers among them (live), the farthest first. */
export const drawStanding = (c: Ctx, v: View, f: number) => {
  const all = standing(f).filter(s => seen(v, s.x + s.bx, s.x + s.bx + s.bw, s.d));
  all.sort((a, b) => a.d - b.d);
  // (the guests: photographing the plaques, standing about bored or filming)
  type Guest = { x: number; d: number; seed: number; pose: 'photo' | 'stand'; face: 1 | -1 };
  const people: Guest[] = ([
    { x: X(700), d: 0.958, seed: 11, pose: 'photo', face: 1 }, { x: X(940), d: 0.958, seed: 24, pose: 'photo', face: -1 },
    { x: X(5240), d: 0.958, seed: 37, pose: 'photo', face: -1 },
    ...ONLOOKERS.map(([rx, seed]) => ({ x: X(rx), d: 0.955, seed, pose: (seed % 2 ? 'photo' : 'stand') as 'photo' | 'stand', face: (seed % 3 ? 1 : -1) as 1 | -1 })),
  ] as Guest[]).filter(p => seen(v, p.x - 30, p.x + 30, p.d));
  let pi = 0;
  people.sort((a, b) => a.d - b.d);
  for (const s of all) {
    while (pi < people.length && people[pi].d <= s.d) { const p = people[pi++]; atDepth(c, v.eye, p.d, () => guest(c, p.x, GY, p.seed, f, p.pose, p.face)); }
    stillAt(c, v, s.d, s.key, s.x, GY, s.bx, s.by, s.bw, s.bh, s.paint);
    if (s.live) atDepth(c, v.eye, s.d, () => s.live!(c));
  }
  while (pi < people.length) { const p = people[pi++]; atDepth(c, v.eye, p.d, () => guest(c, p.x, GY, p.seed, f, p.pose, p.face)); }
};

/** The hotel's scaffold at the play plane: its uprights front and back, ledgers, transoms going back to the hotel,
 *  braces; drawn before what's stood on it. */
const scaffold = (c: Ctx, v: View) => {
  const eye = v.eye, S = STEEL.map(col => hour(col)), x0 = X(7760), x1 = X(DECK.b), back = FRONT_D + 0.012;
  if (!seen(v, x0 - 40, x1 + 40)) return;
  const tube = (ax: number, ay: number, bx: number, by: number, w: number, col: string, hi: string) => {
    c.lineCap = 'butt'; c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
    c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
    c.strokeStyle = hi; c.lineWidth = 1; c.beginPath(); c.moveTo(ax - w / 3, ay); c.lineTo(bx - w / 3, by); c.stroke();
  };
  const xs: number[] = []; for (let px = x0; px <= x1; px += 130) xs.push(px);
  const top = Y(DECK.h);
  // (the back row first, its ledgers; the transoms going back from the front to it)
  for (const px of xs) { const [bx, by0] = at(eye, px + 3, GY, back), [, by1] = at(eye, px + 3, top, back); tube(bx, by0, bx, by1, 3, S[2], S[4]); }
  for (let y = GY - 110; y >= top; y -= 110) { const [ax, ay] = at(eye, x0, y, back), [bx] = at(eye, x1, y, back); tube(ax, ay, bx, ay, 2, S[2], S[3]); }
  for (const px of xs) for (let y = GY - 110; y >= top; y -= 110) { const [bx, by] = at(eye, px + 3, y, back); tube(px + 3, y, bx, by, 2, S[3], S[5]); }
  // (the front row: uprights, ledgers, braces in each bay)
  for (const px of xs) { box(c, px - 2, top, 9, GY - top, INK); box(c, px - 1, top, 7, GY - top, S[3]); box(c, px - 1, top, 2, GY - top, S[5]); box(c, px + 4, top, 2, GY - top, S[1]); box(c, px - 6, GY - 6, 17, 6, INK); box(c, px - 5, GY - 5, 15, 5, S[2]); }
  for (let y = GY - 110; y >= top; y -= 110) tube(x0, y, x1, y, 3, S[3], S[5]);
  for (let i = 0; i + 1 < xs.length; i++) for (let y = GY; y - 110 >= top; y -= 110) tube(xs[i] + 3, y, xs[i + 1] + 3, y - 110, 2, S[2], S[4]);
};

/** At the play plane (behind him): the solids and the ledges, each drawn going back first, then its front. */
export const drawPlayThings = (c: Ctx, v: View, f: number) => {
  const eye = v.eye;
  scaffold(c, v);
  for (const [rx, h, w, what] of SOLIDS) {
    const x = X(rx), y = Y(h);
    if (!seen(v, x - 40, x + w + 40)) continue;
    if (what === 'planter') {
      const R = ramp6(hour(CONCRETE[4]));
      topBack(c, eye, x, x + w, y, 1, 0.93, ramp6(hour('#4A3424')));
      sideBack(c, eye, eye.x > x + w ? x + w : x, eye.x > x + w ? 1 : -1, y, GY, 1, 0.93, R);
      atDepth(c, eye, 0.965, () => { still(c, `planterpalm`, x + w / 2, y, -80, -250, 160, 252, g => paintPalm(g, 170, 3)); still(c, `plantertop-${w}`, x, y, -10, -30, w + 20, 32, g => paintPlanterTop(g, w)); });
      still(c, `planter-${w}-${h}`, x, GY, -6, -h - 6, w + 12, h + 8, g => paintPlanter(g, w, h));
    } else if (what === 'trashcan') {
      const R = ramp6(hour('#2E5A3A'));
      topBack(c, eye, x - 3, x + w + 3, y, 1, 0.95, R);
      sideBack(c, eye, eye.x > x + w ? x + w : x, eye.x > x + w ? 1 : -1, y + 8, GY, 1, 0.95, R);
      atDepth(c, eye, 0.95, () => still(c, 'canrope', x + w / 2, GY, -50, -42, 100, 44, g => rope(g, -40, 40)));
      still(c, `can-${w}-${h}`, x, GY, -6, -h - 4, w + 12, h + 6, g => paintCan(g, w, h));
    } else {
      // (the CLOSED SET wall: sandbags from the street to the deck, going back to the hotel)
      const R = ramp6(hour(SAND[3]));
      sideBack(c, eye, eye.x > x + w ? x + w : x, eye.x > x + w ? 1 : -1, y, GY, 1, FRONT_D + 0.01, R, 4);
      still(c, `closedset-${w}-${h}`, x, GY, -10, -h - 4, w + 20, h + 6, g => paintClosedSet(g, w, h));
    }
  }
  for (const [rx, h, w, what] of LEDGES) {
    const x = X(rx), y = Y(h);
    if (!seen(v, x - 70, x + w + 70)) continue;
    if (what === 'marquee') {
      const R = ramp6(hour('#3A1010'));
      topBack(c, eye, x, x + w, y, 1, FRONT_D, ramp6(hour('#4A3A3A')));
      underBack(c, eye, x, x + w, y + 16, 1, FRONT_D, R);
      for (const [e, s] of [[x, -1], [x + w, 1]] as const) sideBack(c, eye, e, s, y, y + 16, 1, FRONT_D, R, 3, false);
      atDepth(c, eye, 0.94, () => still(c, `letterboard-${w}`, x + w / 2, y, -w / 2 - 6, -60, w + 12, 62, g => paintLetterBoard(g, w)));
      still(c, `marquee-${w}`, x, y, -6, -4, w + 12, 22, g => paintMarqueeFront(g, w));
      // (the chaser bulbs along its fascia: live)
      const on = lit();
      for (let bx = x + 2, k = 0; bx < x + w - 1; bx += 8, k++) { const chase = (k + (f >> 3)) % 3 === 0; box(c, bx, y + 6, 3, 3, INK); box(c, bx, y + 6, 2, 2, chase ? '#FFFFFF' : on ? '#FFE070' : '#C8A040'); }
    } else if (what === 'awning') {
      // (the slope back to the front's wall, striped; its brackets; the valance at the play plane)
      const A = ramp6(hour('#B4243A')), Wt = ramp6(hour('#F4EEE2')), back = y - 26;
      for (let sx = 0, k = 0; sx < w; sx += 10, k++) poly(c, [at(eye, x + sx, y, 1), at(eye, x + sx + 10, y, 1), at(eye, x + sx + 10, back, FRONT_D), at(eye, x + sx, back, FRONT_D)], (k % 2 ? Wt : A)[eye.y < y ? 4 : 1]);
      for (const bx of [x + 10, x + w - 10]) { const [px, py] = at(eye, bx, y + 50, FRONT_D); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(px, py); c.lineTo(bx, y + 14); c.stroke(); c.strokeStyle = IRON[4]; c.lineWidth = 1; c.stroke(); }
      still(c, `valance-${w}`, x, y, -6, -4, w + 12, 26, g => paintValance(g, w));
    } else if (what === 'shelter') {
      const S = ramp6(hour(STEEL[3])), D = 0.95;
      const steve = rx < 9600;
      atDepth(c, eye, D, () => still(c, `shelterback-${steve ? 1 : 0}`, x, GY, -4, -h - 4, w + 8, h + 6, g => paintShelterBack(g, w, h, steve)));
      topBack(c, eye, x - 3, x + w + 3, y, 1, D, S);
      underBack(c, eye, x - 3, x + w + 3, y + 12, 1, D, S);
      for (const px of [x + 4, x + w - 8]) { box(c, px - 1, y + 10, 7, GY - y - 10, INK); box(c, px, y + 10, 5, GY - y - 10, S[3]); box(c, px, y + 10, 1, GY - y - 10, S[5]); }
      // (the side's glass, going back)
      const e = eye.x > x + w ? x + w - 4 : x + 4, [ax, ay] = at(eye, e, y + 14, D), [, by] = at(eye, e, GY - 26, D);
      c.fillStyle = 'rgba(190, 220, 240, 0.25)'; c.beginPath(); c.moveTo(e, y + 14); c.lineTo(ax, ay); c.lineTo(ax, by); c.lineTo(e, GY - 26); c.closePath(); c.fill();
      still(c, `shelterroof-${w}`, x, y, -6, -4, w + 12, 18, g => paintShelterRoof(g, w));
    } else if (what === 'catwalk') {
      const S = ramp6(hour(STEEL[3])), D = 0.975;
      atDepth(c, eye, D, () => {
        still(c, `billboard-${w}`, x, y, -40, -170, w + 80, 172, g => paintBillboard(g, w));
        for (const lx of [x + 20, x + w - 28]) { box(c, lx - 1, y, 10, GY - y, INK); box(c, lx, y, 8, GY - y, S[3]); box(c, lx, y, 2, GY - y, S[5]); }
        c.strokeStyle = S[2]; c.lineWidth = 2; c.beginPath(); for (let yy = y + 10; yy < GY - 30; yy += 50) { c.moveTo(x + 24, yy); c.lineTo(x + w - 24, yy + 50); c.moveTo(x + w - 24, yy); c.lineTo(x + 24, yy + 50); } c.stroke();
      });
      topBack(c, eye, x, x + w, y, 1, D, S);
      still(c, `catwalk-${w}`, x, y, -4, -4, w + 8, 16, g => paintCatwalk(g, w));
    } else {
      // (the scaffold's lift and its deck: planks, their tops going back to the hotel; a guard rail along the back)
      const P = ramp6(hour(PLY[3]));
      const d1 = what === 'deck' ? FRONT_D + 0.004 : FRONT_D + 0.012;
      topBack(c, eye, x, x + w, y, 1, d1, P);
      underBack(c, eye, x, x + w, y + 12, 1, d1, ramp6(hour(PLY[2])));
      if (what === 'deck') { const [ax, ay] = at(eye, x, y - 36, d1), [bx] = at(eye, x + w, y - 36, d1); box(c, ax, ay - 1, bx - ax, 4, INK); box(c, ax, ay, bx - ax, 2, hour(STEEL[4])); }
      still(c, `planks-${w}`, x, y, -4, -4, w + 8, 18, g => paintPlanks(g, w));
    }
  }
  // (the sawhorses at the holes)
  for (const [px, text] of [[X(SINK.a) - 50, 'SINKHOLE'], [X(TRENCH.a) - 50, 'ROAD WORK SINCE 1994']] as const) {
    if (!seen(v, px - 80, px + 80)) continue;
    still(c, `saw-${text}`, px, GY, -80, -70, 160, 72, g => paintSawhorse(g, text));
    const on = (f >> 4) % 2 === 0;
    box(c, px - 3, GY - 54, 6, 4, on ? '#FBBF24' : '#78350F');
  }
};

/** The lamps' light (after dark), the arch's sign, the marquee's bulbs, the theatre's. */
export const lampLights = (v: View): Light[] => {
  const eye = v.eye, out: Light[] = [];
  for (const [rx] of LAMPS) { if (X(rx) < v.cam.x - 300 || X(rx) > v.cam.x + 1100) continue; const [x, y] = at(eye, X(rx), GY - 214, LAMP_D); out.push({ x, y, r: 150, a: 0.85, color: '#FFE9A8' }); }
  const [mx, my] = at(eye, X(MARQUEE_X), GY - 320, 0.95);
  out.push({ x: mx, y: my, r: 300, a: 0.9, color: '#FBBF24' });
  out.push({ x: X(3070), y: Y(150) - 20, r: 160, a: 0.8, color: '#FFE070' });
  return out;
};

/** Shared with the coaster (its queue's standee, its shrines' ropes). */
export { paintStandee, rope as velvetRopePaint };

void checker; void mix; void timeOfDay; void PLY; void LIP; void glassOf; void slab; void post; void deco; void paint; void hash; void streetPalm;
