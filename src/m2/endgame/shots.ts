// The abduction's cutscene pictures (abduction.ts plays them through the gym's scene player, intro/gym/scene.ts: 256 x
// 144 SNES pictures blown up 3x, the words in the box along the bottom). The Iron Pit's way (intro/gym/shots.ts):
// forms pillowed and stepped to color ramps, dithered where the steps meet, inked (m1 scenes/art/raster.ts Painter);
// skies and walls in bands, the seams dithered; what's still is painted once and kept (per hour where the sky's in it),
// only what moves drawn each frame. All of it painted ahead in idle moments while the garage part plays
// (warmAbductionShots), so no shot stops to paint itself the frame it cuts in.
//
//   wife     Zarblax at the controls of her standby saucer: the dome over her, and her gross-up (zarblaxGross.ts)
//   cab      him in the truck's window going up in the beam (the title's bust, glasses on, the cab round him); held up
//            to Satan's face, his claws round the door
//   wide     outside: the parking garage at night, four decks lit sodium orange, the roof over the truck burst open,
//            the saucer over it, him going up in its beam; Happy Land shut and dark behind; the lot ground splits behind
//            the garage, Satan comes up out of it, grabs the saucer, catches the truck, and throws it
//   flight   the truck tumbling over the water park in the dark: its slides' tubes and towers, MOUNT EVEREST BUT BETTER
//            off on the skyline, the wave pool, palms going by underneath
//   crash    the lot outside the water park's gate (HAPPY WATERS): down it comes, onto its roof
//
// No volcanoes. Satan's his own painting from hell (spooky/hell/satanArt.ts) from the shoulders up; under that, his
// chest and his reaching arms painted here in the same skin ramp, lit from under by the fire he's come up out of; the
// arms' elbows off art/limb.ts (elbowFront: out to the sides), each bone painted once and drawn turned.

import { paintSatan, drawSatanFace } from '../spooky/hell/satanArt';
import { drawTitleMeathead, type TitleMood } from '../title/meathead';
import { flies, stink } from '../../m1/game/scenes/shatLook';
import { RAMP } from '../../m1/game/scenes/art/snes';
import { painting, paintingStep, idleJob, type Painter } from '../../m1/game/scenes/art/raster';
import { elbowFront } from '../art/limb';
import { timeOfDay, skyRamp, drawStars, drawMoon, farTint } from '../timeOfDay';
import { ART_W, ART_H } from '../intro/gym/scene';
import { tiny } from '../intro/gym/shots';
import { drawZarblaxGross, warmZarblaxGross, ZARBLAX_CIG } from './zarblaxGross';
import { WATER_PARK_NAME } from './stages';
import type { Dressed } from './lines';

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];
const INK = '#08070C';
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (k: number) => { const t = clamp01(k); return t * t * (3 - 2 * t); };
/** A checker of `col` over a rect (one art pixel a square). */
const dither = (c: Ctx, x: number, y: number, w: number, h: number, col: string, phase = 0) => {
  c.fillStyle = col;
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + phase) & 1; xx < w; xx += 2) c.fillRect(Math.round(x + xx), Math.round(y + yy), 1, 1);
};
/** Flat bands down a rect (`cols` top to bottom), each seam dithered. */
const bands = (c: Ctx, x: number, y: number, w: number, h: number, cols: readonly string[]) => {
  const n = cols.length, bh = h / n;
  for (let i = 0; i < n; i++) R(c, x, y + i * bh, w, Math.ceil(bh) + 1, cols[i]);
  for (let i = 1; i < n; i++) dither(c, x, Math.round(y + i * bh) - 1, w, 2, cols[i], i);
};
/** Bands across a rect (left to right), each seam dithered. */
const bandsX = (c: Ctx, x: number, y: number, w: number, h: number, cols: readonly string[]) => {
  const n = cols.length, bw = w / n;
  for (let i = 0; i < n; i++) R(c, x + i * bw, y, Math.ceil(bw) + 1, h, cols[i]);
  for (let i = 1; i < n; i++) { c.fillStyle = cols[i]; for (let yy = 0; yy < h; yy++) c.fillRect(Math.round(x + i * bw) - 1 - (yy & 1), Math.round(y + yy), 1, 1); }
};
/** Stepped rings of a light (no smooth gradients): `rings` discs from wide and faint to small and strong. */
const glow = (c: Ctx, x: number, y: number, r: number, col: string, a0: number, a1: number, rings = 5, sy = 1) => {
  c.fillStyle = col;
  for (let i = 0; i < rings; i++) {
    const k = i / Math.max(1, rings - 1);
    c.globalAlpha = a0 + (a1 - a0) * k;
    c.beginPath(); c.ellipse(Math.round(x), Math.round(y), Math.max(1, r * (1 - k * 0.8)), Math.max(1, r * (1 - k * 0.8) * sy), 0, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
};
const canvasOf = (w: number, h: number, paint: (g: Ctx) => void) => {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false; paint(g);
  return cv;
};
const baked = new Map<string, HTMLCanvasElement>();
const bake = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  let cv = baked.get(key);
  if (!cv) { cv = canvasOf(w, h, paint); baked.set(key, cv); }
  return cv;
};
const hourKey = () => timeOfDay().key;

// ---------------------------------------------------------------------------------------------------------------
// The clock and the marks: the shots run off the scene's own frame count (abduction.ts ticks it), and what happens when
// in the wide shot is marked by the beats as they start (Satan's grab, the catch, the throw)

export const clip = { t: 0, rise: -1, grab: -1, catch: -1, throw: -1, dress: 'clean' as Dressed };
export const resetClip = (dress: Dressed) => { Object.assign(clip, { t: 0, rise: -1, grab: -1, catch: -1, throw: -1, dress }); };
/** How far along since a mark (frames), or -1 if it's not happened. */
const since = (mark: number) => (mark < 0 ? -1 : clip.t - mark);

// ---------------------------------------------------------------------------------------------------------------
// The night sky (the hour's: it's whatever it was in the park), banded, the stars

const nightSky = (g: Ctx, h: number) => {
  const tod = timeOfDay();
  bands(g, 0, 0, ART_W, h, skyRamp(['#070A1E', '#0C1230', '#131A40', '#1C2550', '#27305E', '#363A6A', '#4A4474', '#5E507C'], tod));
  drawStars(g, 0, 0, ART_W, h * 0.75, 0, 0, tod, 1);
};

/** Happy Land on the skyline, shut for the night: its lands' landmarks dark against the sky (the castle's spires, the
 *  wheel, the coaster's loop, the rocket, the pagoda, the clock tower, the water tower, the curly cartoon tower), a
 *  few lights left on, a haze along its foot. `y` its foot, `s` its scale, `x0` where it starts. */
const skyline = (g: Ctx, x0: number, y: number, s: number, w: number) => {
  const col = farTint('#141A32'), lit = farTint('#1E2644'), haze = farTint('#2A3058');
  g.fillStyle = col;
  const P = (pts: Pt[]) => { g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(x0 + px * s, y - py * s) : g.moveTo(x0 + px * s, y - py * s))); g.closePath(); g.fill(); };
  // (the trees and the low stuff along it all)
  for (let x = 0; x < w / s; x += 4) { const h = 5 + hash(x * 0.31) * 6; g.fillRect(Math.round(x0 + x * s), Math.round(y - h * s), Math.ceil(4 * s), Math.ceil(h * s) + 1); }
  // (Fairy: the castle, its spires)
  P([[20, 0], [20, 30], [26, 30], [30, 52], [34, 30], [44, 30], [44, 40], [50, 62], [56, 40], [56, 30], [66, 30], [70, 50], [74, 30], [80, 30], [80, 0]]);
  // (the Fairy Wheel: rim, spokes, its legs)
  g.strokeStyle = col; g.lineWidth = Math.max(1, 1.4 * s);
  g.beginPath(); g.arc(x0 + 112 * s, y - 38 * s, 26 * s, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.beginPath(); g.moveTo(x0 + 112 * s, y - 38 * s); g.lineTo(x0 + (112 + Math.cos(a) * 26) * s, y - (38 + Math.sin(a) * 26) * s); g.stroke(); }
  P([[100, 0], [112, 38], [124, 0], [121, 0], [112, 30], [103, 0]]);
  // (the coaster: the lift hill and a loop)
  g.lineWidth = Math.max(1, 2 * s);
  g.beginPath(); g.moveTo(x0 + 140 * s, y); g.lineTo(x0 + 168 * s, y - 46 * s); g.quadraticCurveTo(x0 + 176 * s, y - 50 * s, x0 + 182 * s, y - 30 * s); g.lineTo(x0 + 196 * s, y - 6 * s); g.stroke();
  g.beginPath(); g.arc(x0 + 210 * s, y - 18 * s, 14 * s, 0, Math.PI * 2); g.stroke();
  // (Future: the rocket on its gantry; the disc up on a needle)
  P([[236, 0], [236, 44], [240, 58], [244, 44], [244, 0]]); P([[230, 0], [233, 12], [236, 0]]); P([[244, 0], [247, 12], [250, 0]]);
  P([[262, 0], [264, 54], [258, 56], [258, 60], [274, 60], [274, 56], [268, 54], [270, 0]]);
  // (Foreign: the pagoda's roofs; Spooky: the clock tower; Wilderness: the water tower; Cartoon: the curly tower)
  for (let k = 0; k < 4; k++) P([[286 + k * 2, 8 + k * 10], [312 - k * 2, 8 + k * 10], [306 - k * 2, 12 + k * 10], [292 + k * 2, 12 + k * 10]]);
  P([[292, 0], [292, 48], [299, 54], [306, 48], [306, 0]]);
  P([[326, 0], [326, 56], [322, 56], [332, 72], [342, 56], [338, 56], [338, 0]]);
  P([[356, 0], [358, 26], [354, 26], [354, 38], [372, 38], [372, 26], [368, 26], [370, 0]]);
  P([[386, 0], [384, 20], [392, 34], [384, 48], [394, 60], [404, 50], [396, 36], [404, 22], [400, 0]]);
  // (the odd light still on: a window, a red beacon up top)
  for (let i = 0; i < 26; i++) { const x = hash(i * 3.3) * (w - 4), yy = y - (4 + hash(i * 5.1) * 30) * s; g.fillStyle = i % 5 ? '#E8B850' : '#8AB8F0'; g.fillRect(Math.round(x0 + x), Math.round(yy), 1, 1); }
  for (const [bx, by] of [[50, 62], [240, 58], [332, 72]] as const) { g.fillStyle = '#F04040'; g.fillRect(Math.round(x0 + bx * s), Math.round(y - by * s) - 1, 1, 1); }
  // (the haze along its foot)
  g.fillStyle = lit; g.fillRect(x0, Math.round(y - 3 * s), w, Math.ceil(3 * s) + 1);
  dither(g, x0, Math.round(y - 6 * s), w, Math.ceil(3 * s), lit);
  g.fillStyle = haze; g.fillRect(x0, Math.round(y - 1), w, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// The truck (his, red, the government's: its front still crumpled from the pillar this morning): side on, facing
// right, its wheels' bottoms' middle at the origin. Painted at two sizes (the wide shot's, and the flight's and the
// crash's close one), each once; drawn turned as it tumbles.

const TRED = RAMP.red, STEEL = RAMP.steel;
const GLASS = ['#0A1424', '#16284A', '#2A4670', '#4A6E98', '#7EA2C8', '#C8E0F4'];
const TIRE = ['#040406', '#0E0E12', '#1C1C22', '#2C2C34', '#40404A'];
const TRUCK_W = 50, TRUCK_H = 26, TRUCK_OX = 25, TRUCK_OY = 24;
function* paintTruck(p: Painter, k: number) {
  const X = (x: number) => (TRUCK_OX + x) * k, Y = (y: number) => (TRUCK_OY + y) * k;
  const poly = (pts: Pt[]) => (g: Ctx) => { pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)))); g.closePath(); };
  const top: [number, number, number] = [-0.35, -0.75, 0.56];
  // (the bed, the cab, the hood crumpled up at the front)
  p.form(poly([[-24, -4], [-24, -13], [-3, -13], [-3, -4]]), { ramp: TRED, bevel: 2.5 * k, ink: INK, light: top });
  p.form(poly([[-4, -4], [-4, -12], [-2, -19], [8, -19], [12, -12], [12, -4]]), { ramp: TRED, bevel: 3 * k, ink: INK, light: top });
  p.form(poly([[11, -4], [11, -12], [16, -12.5], [18, -10], [21, -13], [22.5, -9], [24, -7], [24, -4]]), { ramp: TRED, bevel: 2 * k, ink: INK, light: top });
  yield;
  // (the window: dark glass, the night's glint across it)
  p.form(poly([[-1, -11.5], [0.5, -17.5], [7, -17.5], [10, -11.5]]), { ramp: GLASS, bevel: 1.5 * k, ink: INK, light: top });
  for (let i = 0; i < 3 * k; i++) p.line(X(1) + i, Y(-12), X(4) + i, Y(-17), GLASS[5], 0.7);
  // (the bed's rail, the side's crease, the door's seam and handle, the tail light, the headlight (one gone), the seal)
  p.line(X(-23.5), Y(-12.5), X(-3.5), Y(-12.5), TRED[5]);
  p.line(X(-23), Y(-8.5), X(23), Y(-8.5), TRED[1]); p.line(X(-23), Y(-9.5), X(23), Y(-9.5), TRED[4]);
  p.line(X(-3), Y(-11), X(-3), Y(-5), TRED[0]); p.line(X(10), Y(-11), X(10), Y(-5), TRED[0]);
  p.rect(X(0), Y(-10.5), Math.max(1, 2 * k), Math.max(1, k * 0.8), STEEL[4]);
  p.rect(X(-24), Y(-12), Math.max(1, k), Math.max(2, 3 * k), '#F8D040'); p.rect(X(-24), Y(-12), Math.max(1, k), Math.max(1, k), '#FFF4C0');
  p.rect(X(22.5), Y(-8), Math.max(1, k), Math.max(1, 1.5 * k), '#2A2A30');
  p.disc(X(4), Y(-7), 1.5 * k, 1.3 * k, '#E8D070'); p.px(X(4), Y(-7), '#1E3A8A');
  // (the hood's crumple: the dents' shadows and their lit lips)
  for (const [x, y] of [[15, -11], [19, -10.5], [21.5, -8]] as Pt[]) { p.line(X(x - 1.5), Y(y), X(x + 1), Y(y + 1.5), TRED[0]); p.line(X(x - 1.5), Y(y - 0.6), X(x + 1), Y(y + 0.9), TRED[5], 0.8); }
  yield;
  // (the wheel wells; the wheels: the tires stepped, the hubs chrome; the bumpers)
  for (const wx of [-14, 14]) p.disc(X(wx), Y(-4), 5.5 * k, 4.5 * k, '#1A0604');
  for (const wx of [-14, 14]) {
    p.form(g => g.arc(X(wx), Y(-3.8), 3.8 * k, 0, Math.PI * 2), { ramp: TIRE, bevel: 1.6 * k, ink: INK });
    p.form(g => g.arc(X(wx), Y(-3.8), 1.8 * k, 0, Math.PI * 2), { ramp: STEEL, bevel: 1 * k, ink: TIRE[0] });
  }
  p.form(poly([[-25, -6], [-25, -3.5], [-21, -3.5], [-21, -6]]), { ramp: STEEL, bevel: k, ink: INK });
  p.form(poly([[22, -6], [25.5, -6.5], [25.5, -3.5], [22, -3.5]]), { ramp: STEEL, bevel: k, ink: INK });
}
const truckArt = (k: 1 | 2) => painting(`abd-truck${k}`, TRUCK_W * k, TRUCK_H * k, p => paintTruck(p, k));
const miniTruck = (c: Ctx, x: number, y: number, s = 1, rot = 0) => {
  const k: 1 | 2 = s > 1.2 ? 2 : 1, cv = truckArt(k), q = s / k;
  c.save(); c.translate(Math.round(x), Math.round(y)); if (rot) c.rotate(rot); c.scale(q, q);
  c.drawImage(cv, -TRUCK_OX * k, -TRUCK_OY * k);
  c.restore();
};

/** The tractor beam: stepped columns of pink light down from (x, y0) to y1, widening; rings sliding down it; sparkles
 *  going up. */
const beam = (c: Ctx, x: number, y0: number, y1: number, w0: number, w1: number, t: number, k = 1) => {
  if (k <= 0) return;
  const cols = ['rgba(255, 110, 215, 0.15)', 'rgba(255, 160, 235, 0.18)', 'rgba(255, 225, 250, 0.24)'];
  c.globalAlpha = k;
  for (let i = 0; i < 3; i++) {
    const f = 1 - i * 0.3;
    c.fillStyle = cols[i];
    c.beginPath(); c.moveTo(x - (w0 / 2) * f, y0); c.lineTo(x + (w0 / 2) * f, y0); c.lineTo(x + (w1 / 2) * f, y1); c.lineTo(x - (w1 / 2) * f, y1); c.closePath(); c.fill();
  }
  // (the rings: bands of brighter pink sliding down it, every so often)
  for (let i = 0; i < 3; i++) {
    const v = ((t * 0.02 + i / 3) % 1), yy = Math.round(y0 + (y1 - y0) * v), ww = w0 + (w1 - w0) * v;
    c.fillStyle = 'rgba(255, 200, 245, 0.3)'; c.fillRect(Math.round(x - ww / 2), yy, Math.round(ww), 1);
  }
  for (let i = 0; i < 14; i++) {
    const u = (hash(i) - 0.5) * 0.8, v = 1 - (((t * 0.012 + hash(i + 9)) % 1));
    const yy = y0 + (y1 - y0) * v, ww = w0 + (w1 - w0) * v;
    R(c, x + u * ww, yy, 1, 1, i % 3 ? '#FFD6F4' : '#FFFFFF');
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// wife: the cockpit of the standby saucer: the dome over her, the night through it; her gross-up filling the picture

const DOMEF = ['#120C1C', '#22182E', '#342642', '#4A3A5C', '#6A5880', '#9682AE'];
const paintCockpit = (g: Ctx) => {
  // (the dome's glass: the night through it, banded; a purple tint over it in steps; the glare's arcs)
  nightSky(g, ART_H);
  g.fillStyle = 'rgba(150, 90, 200, 0.12)'; g.fillRect(0, 0, ART_W, ART_H);
  dither(g, 0, 0, ART_W, 30, 'rgba(120, 70, 170, 0.2)');
  // (the dome's frame: the ring round its rim and the struts up it, stepped metal, inked, riveted)
  const ring = (rx: number, ry: number, col: string, lw: number) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.ellipse(128, 160, rx, ry, 0, Math.PI, 0); g.stroke(); };
  ring(176, 146, INK, 9); ring(176, 146, DOMEF[2], 7); ring(178, 148, DOMEF[4], 2); ring(173, 143, DOMEF[1], 2); ring(176, 146, DOMEF[5], 1);
  for (const x of [22, 234]) {
    R(g, x - 5, 0, 10, ART_H, INK); bandsX(g, x - 4, 0, 8, ART_H, [DOMEF[4], DOMEF[3], DOMEF[2], DOMEF[1]]); R(g, x - 3, 0, 1, ART_H, DOMEF[5]);
    for (let y = 6; y < ART_H; y += 14) { R(g, x - 1, y, 2, 2, DOMEF[5]); R(g, x - 1, y + 2, 2, 1, INK); }
  }
  // (the glare up the glass: two stepped arcs, catching the beam's pink)
  g.strokeStyle = 'rgba(255, 220, 250, 0.22)'; g.lineWidth = 3; g.beginPath(); g.ellipse(128, 160, 160, 132, 0, Math.PI * 1.12, Math.PI * 1.3); g.stroke();
  g.strokeStyle = 'rgba(255, 255, 255, 0.14)'; g.lineWidth = 1; g.beginPath(); g.ellipse(128, 160, 152, 124, 0, Math.PI * 1.14, Math.PI * 1.26); g.stroke();
  // (the console along the bottom, behind her: a sick lilac, banks of buttons, a screen each side)
  bands(g, 0, 112, ART_W, 32, ['#5A4468', '#4A3858', '#3A2C48', '#2A2036', '#1C1426']);
  R(g, 0, 112, ART_W, 1, '#9A82B0'); R(g, 0, 113, ART_W, 1, '#2A2036');
  for (let i = 0; i < 28; i++) { const x = 4 + i * 9.2, y = 118 + (i % 3) * 7; R(g, x, y, 6, 4, INK); R(g, x + 1, y, 4, 3, ['#F472B6', '#FDE047', '#4ADE80', '#60A5FA'][i % 4]); R(g, x + 1, y, 4, 1, '#FFFFFF'); }
  for (const x of [8, 206]) {
    R(g, x - 1, 92, 44, 24, INK); bands(g, x, 93, 42, 22, ['#0E2418', '#0C1E14', '#0A1810']);
    for (let k = 0; k < 4; k++) { R(g, x + 3, 96 + k * 5, 8 + hash(x + k) * 24, 2, '#34D399'); R(g, x + 3, 96 + k * 5, 2, 2, '#A7F3D0'); }
    for (let yy = 93; yy < 115; yy += 2) { g.fillStyle = 'rgba(0, 0, 0, 0.25)'; g.fillRect(x, yy, 42, 1); }
  }
  // (the fuzzy dice off the strut, pink, stepped)
  R(g, 232, 28, 1, 16, '#C8CCD2');
  for (const [dx, dy] of [[-5, 44], [1, 50]]) {
    R(g, 232 + dx - 1, dy - 1, 9, 9, INK); bands(g, 232 + dx, dy, 7, 7, ['#FBCFE8', '#F9A8D4', '#F472B6', '#DB2777']);
    dither(g, 232 + dx, dy, 7, 7, '#FDE7F3', 1); R(g, 232 + dx + 1, dy + 1, 1, 1, INK); R(g, 232 + dx + 5, dy + 5, 1, 1, INK); R(g, 232 + dx + 3, dy + 3, 1, 1, INK);
  }
};
/** (the shot) Her middle in the picture; a bob (she's driving with her knees). */
const WIFE_AT: Pt = [118, 80];
export const shotWife = (c: Ctx, t: number, talking: boolean) => {
  c.drawImage(bake(`abd-cockpit-${hourKey()}`, ART_W, ART_H, paintCockpit), 0, 0);
  const bob = Math.round(Math.sin(t * 0.08) * 1.5), open = talking && (t >> 3) % 2 === 0;
  drawZarblaxGross(c, WIFE_AT[0], WIFE_AT[1] + bob, 1 / 3, t, open);
  // (the cigarette's smoke, curling up off it while it's in her mouth)
  if (!open) {
    const sx = WIFE_AT[0] + ZARBLAX_CIG[0] - 136, sy = WIFE_AT[1] + bob + ZARBLAX_CIG[1] - 112;
    for (let k = 0; k < 5; k++) {
      const a = ((t * 0.5 + k * 11) % 50) / 50, x = sx + Math.sin(t * 0.05 + k * 1.7) * (2 + a * 6) - a * 10, y = sy - a * 40;
      R(c, x, y, 2 + a * 3, 2, `rgba(214, 214, 226, ${(0.5 * (1 - a)).toFixed(2)})`);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// cab: him in the truck's window, going up: the cab's inside behind him (the seat's back, the far window, the night and
// the beam out of it), the door round the window; the glass's glare over him. Held up by Satan: his claws round the door.

const paintCabInside = (g: Ctx) => {
  // (the far window: the night, the beam's pink down through it)
  nightSky(g, ART_H);
  g.fillStyle = 'rgba(255, 140, 230, 0.16)'; g.fillRect(70, 0, 130, ART_H);
  dither(g, 64, 0, 6, ART_H, 'rgba(255, 140, 230, 0.16)'); dither(g, 200, 0, 6, ART_H, 'rgba(255, 140, 230, 0.16)');
  // (the far door's frame across it, the headliner along the top)
  R(g, 0, 0, ART_W, 14, '#2A2420'); bands(g, 0, 0, ART_W, 14, ['#3A322C', '#2E2824', '#221C18']);
  R(g, 0, 14, ART_W, 1, INK);
  // (the bench seat's back: red vinyl, tufted, stepped, a split in it taped over)
  bands(g, 0, 70, ART_W, 74, ['#7A1810', '#661410', '#52100C', '#3E0C08', '#2A0806']);
  R(g, 0, 70, ART_W, 1, '#B23A2A'); R(g, 0, 71, ART_W, 1, '#8E2418');
  for (let x = 10; x < ART_W; x += 32) for (let y = 84; y < 144; y += 22) { R(g, x, y, 2, 2, '#2A0806'); R(g, x, y - 1, 2, 1, '#9A2C1E'); }
  R(g, 176, 90, 26, 5, '#B8B4A8'); R(g, 176, 90, 26, 1, '#E8E4D8'); R(g, 176, 94, 26, 1, '#6A665C');
};
const paintDoor = (g: Ctx) => {
  // (the door, red, everything but the window: banded, the window's chrome trim, the rubber seal, the mirror)
  const win = (h: Ctx) => { h.moveTo(66, 6); h.lineTo(178, 6); h.lineTo(206, 70); h.lineTo(206, 112); h.lineTo(66, 112); h.closePath(); };
  g.save(); g.beginPath(); g.rect(0, 0, ART_W, ART_H); win(g); g.clip('evenodd');
  bands(g, 0, 0, ART_W, ART_H, [TRED[4], TRED[3], TRED[3], TRED[2], TRED[2], TRED[1], TRED[0]]);
  // (the body's crease line, lit along its top; the door's seam; a ding with the paint chipped off it)
  R(g, 0, 118, ART_W, 2, TRED[5]); R(g, 0, 120, ART_W, 1, TRED[1]); dither(g, 0, 121, ART_W, 2, TRED[1]);
  R(g, 30, 0, 2, ART_H, TRED[0]); R(g, 32, 0, 1, ART_H, TRED[4]);
  R(g, 228, 128, 6, 3, '#8A8E98'); R(g, 229, 129, 3, 1, '#C8CCD2'); R(g, 227, 127, 8, 1, TRED[0]);
  g.restore();
  // (the trim: rubber seal, then chrome stepped round the opening)
  const edge = (col: string, lw: number) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); win(g); g.stroke(); };
  edge(INK, 8); edge('#5C636E', 6); edge('#B6BEC8', 4); edge('#E8EEF4', 1.5); edge('#18181C', 1);
  // (the mirror: its arm, the chrome housing stepped, the glass showing the beam's pink)
  R(g, 206, 74, 12, 6, INK); R(g, 207, 75, 10, 4, '#868E9A');
  R(g, 214, 58, 30, 36, INK); bands(g, 216, 60, 26, 32, ['#E8EEF4', '#B6BEC8', '#868E9A', '#5C636E']);
  R(g, 219, 63, 20, 26, INK); bands(g, 220, 64, 18, 24, ['#F0A8E0', '#C878C0', '#7A4A90', '#3A2A5A']); R(g, 220, 64, 18, 2, '#FFE0F8');
  // (the handle, chrome; the lock's button)
  R(g, 88, 124, 34, 8, INK); bands(g, 89, 125, 32, 6, ['#FFFFFF', '#E8EEF4', '#B6BEC8', '#5C636E']);
  R(g, 74, 112, 4, 3, '#3A3F48');
};
/** Satan's claws round the door (held up to his face): three over the roof's edge, his thumb up the pillar. */
const paintCabClaws = (g: Ctx) => {
  const SKs = ['#260404', '#4A0A08', '#721410', '#982018', '#BE3424', '#DE5838'];
  for (const [x, y, w] of [[96, -6, 22], [132, -8, 24], [166, -5, 20]] as const) {
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y + 6, w / 2 + 1, 11, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.ellipse(x, y + 6, w / 2, 10, 0, 0, Math.PI * 2); g.clip();
    bands(g, x - w / 2, y - 4, w, 21, [SKs[2], SKs[3], SKs[4], SKs[5]]); g.restore();
    // (the claw, black, curled down over the glass's top)
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 5, y + 14); g.quadraticCurveTo(x + 2, y + 30, x - 3, y + 34); g.quadraticCurveTo(x + 8, y + 24, x + 5, y + 14); g.closePath(); g.fill();
    g.fillStyle = '#4A403A'; g.fillRect(x - 1, y + 18, 2, 6); g.fillStyle = '#7A6C60'; g.fillRect(x - 1, y + 18, 1, 2);
  }
};
export const shotCab = (mood: TitleMood, heldBySatan = false) => (c: Ctx, t: number, talking: boolean) => {
  // (behind him: the cab's inside, the night out of the far window; or Satan's red glare through it, held to his face)
  c.drawImage(bake(`abd-cabIn-${hourKey()}`, ART_W, ART_H, paintCabInside), 0, 0);
  if (heldBySatan) { c.fillStyle = 'rgba(200, 30, 10, 0.45)'; c.fillRect(0, 15, ART_W, 55); dither(c, 0, 15, ART_W, 55, 'rgba(250, 120, 40, 0.25)', (t >> 3) & 1); }
  else beam(c, 136, 0, 70, 120, 130, t, 0.6);
  const shake = Math.round(Math.sin(t * 0.9) * (heldBySatan ? 1 : 0.6));
  c.save(); c.translate(shake, 8);
  drawTitleMeathead(c, t, mood, t, true);
  if (talking && t % 8 < 4) { R(c, 116, 86, 24, 3, '#3a0606'); R(c, 118, 86, 20, 1, '#f4ecdc'); }
  c.restore();
  if (clip.dress === 'shitty') { flies(c, 96, 84, 18, 3); stink(c, 170, 100, 3, 26, 9); }
  // (the glass's glare over him: two stepped streaks, sliding as it goes up)
  const gx = ((t * 0.6) % 220) - 40;
  c.save(); c.beginPath(); c.moveTo(66, 6); c.lineTo(178, 6); c.lineTo(206, 70); c.lineTo(206, 112); c.lineTo(66, 112); c.closePath(); c.clip();
  for (const [o, w, a] of [[0, 10, 0.1], [16, 4, 0.14]] as const) { c.fillStyle = `rgba(255, 240, 255, ${a})`; c.beginPath(); c.moveTo(gx + o, 6); c.lineTo(gx + o + w, 6); c.lineTo(gx + o + w - 50, 112); c.lineTo(gx + o - 50, 112); c.closePath(); c.fill(); }
  c.restore();
  c.drawImage(bake('abd-door', ART_W, ART_H, paintDoor), 0, 0);
  if (heldBySatan) c.drawImage(bake('abd-cabClaws', ART_W, ART_H, paintCabClaws), 0, Math.round(Math.sin(t * 0.7)));
  // (the pink of the beam over it all, or the hellfire's red)
  c.fillStyle = heldBySatan ? 'rgba(255, 60, 20, 0.1)' : 'rgba(255, 140, 230, 0.08)'; c.fillRect(0, 0, ART_W, ART_H);
};

// ---------------------------------------------------------------------------------------------------------------
// wide: the parking garage from outside, at night; the saucer; Satan

/** The ground: the lot's far edge (Satan comes up out of it, behind the garage) and the garage's foot. The eye's at
 *  the far edge (the horizon, about), in the middle: the stall lines run in to it. */
const HORIZ = 106, FISSURE = 110, GROUND = 124, EYE_X = 128;
/** The garage: its front from GX to GX + GW, the parapet's top at GTOP; the stair tower at its right end. */
const GX = 16, GW = 172, GTOP = 72, TOWER = GX + GW, TOWER_W = 16;
/** The roof over his truck, burst: the gap through the parapet and the top deck's slab. */
const HOLE_X0 = 52, HOLE_X1 = 100;
/** Its broken edge, along the parapet's front: left to right. */
const HOLE_JAG: Pt[] = [[HOLE_X0 - 2, GTOP], [HOLE_X0 + 3, GTOP + 5], [HOLE_X0 + 8, GTOP + 3], [HOLE_X0 + 14, GTOP + 9], [HOLE_X0 + 22, GTOP + 7], [HOLE_X0 + 30, GTOP + 11], [HOLE_X0 + 38, GTOP + 6], [HOLE_X0 + 44, GTOP + 8], [HOLE_X1 + 2, GTOP]];
/** Concrete, sodium light. */
const CON = ['#2E3036', '#44474E', '#5C5F66', '#74777E', '#8E9198', '#AAACB2', '#C8CACE'];
const SOD = ['#2A1A0C', '#4A2E12', '#7A4C18', '#A86A20', '#D08A2C', '#F0B04A', '#FCD88A'];

/** A row of parking stalls' lines from y0 to y1, `gap` apart: each leaning out from the eye, the way the ground does. */
const stalls = (g: Ctx, y0: number, y1: number, gap: number) => {
  for (let x = -gap; x < ART_W + gap; x += gap) {
    const a = x + (x - EYE_X) * 0.04, b = x + (x - EYE_X) * 0.16;
    g.strokeStyle = '#6A6C74'; g.lineWidth = 1; g.beginPath(); g.moveTo(Math.round(a) + 0.5, y0); g.lineTo(Math.round(b) + 0.5, y1); g.stroke();
  }
};
const paintWide = (g: Ctx) => {
  nightSky(g, HORIZ + 2);
  // (off to the right of the garage, where it's not up behind the roof's hole)
  skyline(g, 196, HORIZ, 0.62, ART_W - 196);
  // (the lot: asphalt in bands going off toward the horizon, the stall lines running in to the eye, a few oil stains)
  bands(g, 0, HORIZ, ART_W, ART_H - HORIZ, ['#2A2C34', '#24262E', '#202128', '#1B1C22', '#17181D', '#131418']);
  stalls(g, 126, 132, 18); stalls(g, 137, 144, 22);
  R(g, 0, 134, ART_W, 1, '#4A4C54'); dither(g, 0, 135, ART_W, 1, '#3A3C44');
  for (let i = 0; i < 9; i++) { const x = hash(i * 7.1) * ART_W, y = 128 + hash(i * 3.7) * 14; g.fillStyle = 'rgba(0, 0, 0, 0.3)'; g.beginPath(); g.ellipse(x, y, 6, 1.5, 0, 0, Math.PI * 2); g.fill(); }
};
/** The garage on its own (Satan comes up behind it): its decks, each slab's edge lit along its lip; the openings between
 *  them lit sodium orange, the ceilings over the eye and the floors under it, a car or two left; the pillars; the stair
 *  tower, its windows lit; the P sign mounted up on the tower; the roof over the truck burst open. */
const paintGarage = (g: Ctx) => {
  const decks = [GTOP, GTOP + 17, GTOP + 34], OPEN = 11, SLAB = 6;
  R(g, GX - 1, GTOP - 1, GW + 2, GROUND - GTOP + 1, INK);
  for (let d = 0; d < 3; d++) {
    const y = decks[d];
    // (the slab's edge (the parapet up top): its lit lip, the face in steps, a shadow under it; rust streaks down it)
    R(g, GX, y, GW, SLAB, CON[3]); R(g, GX, y, GW, 1, CON[6]); R(g, GX, y + 1, GW, 1, CON[5]); dither(g, GX, y + 2, GW, 2, CON[4]); R(g, GX, y + SLAB - 1, GW, 1, CON[1]);
    for (let k = 0; k < 14; k++) { const x = GX + 4 + hash(d * 13 + k) * (GW - 8); R(g, x, y + 2, 1, SLAB - 2, '#6A4A30'); if (k % 3 === 0) R(g, x, y + SLAB, 1, 2, '#4A3020'); }
    // (the opening: the ceiling's underside lit near the front (over the eye) or the floor (under it), the sodium
    // falling off into the dark at the back; the tubes along the ceiling)
    const oy = y + SLAB;
    bands(g, GX, oy, GW, OPEN, oy < HORIZ ? [SOD[5], SOD[4], SOD[3], SOD[2], SOD[1]] : [SOD[3], SOD[2], SOD[1], SOD[2], SOD[4]]);
    R(g, GX, oy, GW, 1, oy < HORIZ ? SOD[6] : SOD[1]);
    for (let x = GX + 6; x < GX + GW - 6; x += 16) R(g, x, oy + 1, 6, 1, '#FFF4D0');
    // (a car or two left in it at closing: dark shapes, a glint off each windshield)
    for (let k = 0; k < 8; k++) if (hash(d * 17 + k * 3) > 0.72) {
      const cx = GX + 8 + k * 20;
      R(g, cx, oy + 5, 14, 5, '#1C1208'); R(g, cx + 3, oy + 3, 8, 3, '#1C1208'); R(g, cx + 4, oy + 3, 3, 1, '#C8A060'); R(g, cx + 1, oy + 9, 3, 2, '#0A0604'); R(g, cx + 10, oy + 9, 3, 2, '#0A0604');
    }
    // (the pillars between the openings: lit down the left, dark down the right, inked)
    for (let k = 0; k <= 10; k++) { const x = GX + 2 + k * 16.6; R(g, x - 1, oy, 5, OPEN, INK); R(g, x, oy, 3, OPEN, CON[3]); R(g, x, oy, 1, OPEN, CON[5]); R(g, x + 2, oy, 1, OPEN, CON[1]); }
  }
  // (the street level: the entry, its barrier arm, ENTER over it; the base's curb)
  const by = GTOP + 51;
  R(g, GX, by, GW, GROUND - by, CON[2]); R(g, GX, by, GW, 1, CON[4]);
  R(g, GX + 120, by + 1, 26, GROUND - by - 1, SOD[1]); bands(g, GX + 121, by + 1, 24, GROUND - by - 1, [SOD[3], SOD[2], SOD[1]]);
  R(g, GX + 118, by + 3, 30, 1, '#F8FAFC'); for (let x = GX + 120; x < GX + 146; x += 6) R(g, x, by + 3, 3, 1, '#DC2626');
  R(g, GX + 122, by - 5, 20, 5, INK); R(g, GX + 123, by - 4, 18, 3, '#14532D'); tiny(g, 'ENTER', GX + 123, by - 4, '#BBF7D0', 1);
  R(g, GX - 1, GROUND - 2, GW + 2, 2, CON[4]); R(g, GX - 1, GROUND - 1, GW + 2, 1, CON[1]);
  // (the stair tower at its end: up past the roof, its glass lit up the stairs, inked; the P sign on it, lit)
  const ty = GTOP - 14;
  R(g, TOWER - 1, ty - 1, TOWER_W + 2, GROUND - ty + 1, INK);
  bandsX(g, TOWER, ty, TOWER_W, GROUND - ty, [CON[5], CON[4], CON[3], CON[2]]);
  R(g, TOWER, ty, TOWER_W, 2, CON[6]); R(g, TOWER - 1, ty - 3, TOWER_W + 2, 3, INK); R(g, TOWER, ty - 2, TOWER_W, 1, CON[4]);
  for (let y = ty + 18; y < GROUND - 8; y += 10) { R(g, TOWER + 4, y, 8, 6, INK); bands(g, TOWER + 5, y + 1, 6, 4, [SOD[6], SOD[5], SOD[4]]); }
  // (the P: a blue box on two brackets off the tower, white letter, its rim lit)
  const px = TOWER + 2, py = ty + 2;
  R(g, px - 1, py - 1, 14, 14, INK); bands(g, px, py, 12, 12, ['#2D51B0', '#1E3A8A', '#14205C']); R(g, px, py, 12, 1, '#4570D0');
  R(g, px + 3, py + 2, 2, 8, '#F8FAFC'); R(g, px + 5, py + 2, 3, 1, '#F8FAFC'); R(g, px + 7, py + 3, 1, 2, '#F8FAFC'); R(g, px + 5, py + 5, 3, 1, '#F8FAFC');
  // (the roof over his truck, burst: a gap bitten down through the parapet into the top deck, its broken faces inked,
  // the slab's thickness showing, rebar bent up out of it; the deck under it dark where its lights went)
  g.fillStyle = INK; g.beginPath();
  const jag = HOLE_JAG;
  g.moveTo(HOLE_X0 - 2, GTOP - 1); jag.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(HOLE_X1 + 2, GTOP - 1); g.closePath(); g.fill();
  g.fillStyle = '#1A1020'; g.beginPath(); g.moveTo(HOLE_X0, GTOP); jag.slice(1, -1).forEach(([x, y]) => g.lineTo(x, y - 1)); g.lineTo(HOLE_X1, GTOP); g.closePath(); g.fill();
  for (let i = 1; i < jag.length - 1; i++) { const [x, y] = jag[i]; R(g, x - 1, y, 3, 1, CON[5]); R(g, x - 1, y + 1, 3, 1, CON[2]); }
  for (let k = 0; k < 7; k++) { const x = HOLE_X0 + 4 + k * 6.5, h = 3 + hash(k * 2.3) * 5, lean = (hash(k * 5.1) - 0.5) * 4; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, GTOP + 6); g.lineTo(x + lean, GTOP + 6 - h); g.stroke(); g.strokeStyle = '#A0502A'; g.lineWidth = 0.7; g.stroke(); }
  // (cracks running off it through the slab's face; the top deck's lights under it out)
  for (const [x0, dir] of [[HOLE_X0 - 2, -1], [HOLE_X1 + 2, 1]] as const) { g.strokeStyle = CON[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, GTOP + 2); g.lineTo(x0 + dir * 6, GTOP + 4); g.lineTo(x0 + dir * 10, GTOP + 3); g.lineTo(x0 + dir * 14, GTOP + 5); g.stroke(); }
  R(g, HOLE_X0, GTOP + SLAB, HOLE_X1 - HOLE_X0, 2, SOD[1]);
  // (the rubble down on the lot under it: chunks stepped, inked)
  for (let k = 0; k < 9; k++) { const x = HOLE_X0 + 2 + hash(k * 9.7) * (HOLE_X1 - HOLE_X0 - 4), s = 2 + Math.floor(hash(k * 4.3) * 3); R(g, x - 1, GROUND - s - 1, s + 2, s + 1, INK); R(g, x, GROUND - s, s, s, CON[4]); R(g, x, GROUND - s, s, 1, CON[6]); }
};
/** The light poles out in the lot, in front of everything: steel, the sodium heads, their light down in steps. */
const paintPoles = (g: Ctx) => {
  for (const [x, foot, h] of [[214, 132, 58], [250, 140, 72], [6, 138, 66]] as const) {
    g.fillStyle = 'rgba(253, 220, 140, 0.07)'; g.beginPath(); g.moveTo(x - 3, foot - h + 3); g.lineTo(x + 5, foot - h + 3); g.lineTo(x + 18, foot); g.lineTo(x - 16, foot); g.closePath(); g.fill();
    g.fillStyle = 'rgba(253, 220, 140, 0.07)'; g.beginPath(); g.moveTo(x - 1, foot - h + 3); g.lineTo(x + 3, foot - h + 3); g.lineTo(x + 10, foot); g.lineTo(x - 8, foot); g.closePath(); g.fill();
    g.fillStyle = 'rgba(253, 220, 140, 0.12)'; g.beginPath(); g.ellipse(x + 1, foot, 14, 2.5, 0, 0, Math.PI * 2); g.fill();
    R(g, x - 1, foot - h, 4, h, INK); R(g, x, foot - h, 2, h, '#5C636E'); R(g, x, foot - h, 1, h, '#868E9A');
    R(g, x - 6, foot - h - 2, 14, 4, INK); R(g, x - 5, foot - h - 1, 12, 2, '#3A3F48'); R(g, x - 4, foot - h + 1, 10, 1, '#FDE68A'); R(g, x - 2, foot - h + 1, 6, 1, '#FFFBEA');
    R(g, x - 2, foot - 2, 6, 2, '#2A2C34');
  }
};

/** Where things are in the wide shot this frame. Satan stands at SAT.x, his painting at SAT.s. */
const SAT = { x: 204, s: 0.2 };
const UFO0 = { x: (HOLE_X0 + HOLE_X1) / 2, y: 30 };
const satanTop = () => { const k = ease(since(clip.rise) / 110); return FISSURE + 24 - k * (FISSURE + 24 - 6); };
const ufoNow = (t: number) => {
  const g = since(clip.grab);
  if (g < 0) return { x: UFO0.x + Math.sin(t * 0.03) * 2, y: UFO0.y + Math.sin(t * 0.05) * 1.5, held: false };
  const k = ease(g / 16), hx = UFO0.x + 8, hy = UFO0.y + 6;
  const shake = g > 16 ? Math.round(Math.sin(g * 1.3) * 1) : 0;
  return { x: UFO0.x + (hx - UFO0.x) * k + shake, y: UFO0.y + (hy - UFO0.y) * k, held: true };
};
/** The truck in the wide shot: in the beam going up; dropping as the beam goes; in Satan's hand; thrown. */
const truckNow = (t: number) => {
  const g = since(clip.grab), cat = since(clip.catch), th = since(clip.throw);
  const up = { x: UFO0.x, y: GTOP + 2 - Math.min(24, t * 0.12) };
  if (th >= 0) { const k = th / 40; return { x: 236 + k * 120, y: 36 - k * 70 + k * k * 30, rot: th * 0.4, s: 1 }; }
  if (cat >= 0) { const k = ease(cat / 14); const hand = { x: 238, y: 42 }; return { x: up.x + (hand.x - up.x) * k, y: up.y + 6 + (hand.y - up.y - 6) * k, rot: 0.3 * k, s: 1 }; }
  if (g >= 0) return { x: up.x, y: up.y + Math.min(6, g * 0.4), rot: Math.sin(g * 0.3) * 0.1, s: 1 };
  return { ...up, rot: Math.sin(t * 0.05) * 0.06, s: 1 };
};

/** The saucer, small (the wide shot's): her standby, the same make as Zorblax's: the dark mirrored dome, the hull's
 *  rings stepped, the rim's light strip, the hatch under it. Its lights go round live. 76 x 36, its middle at (38, 20). */
const HULL = ['#16141E', '#26222F', '#3A3546', '#544E62', '#746E84', '#9C96AC', '#CCC8DA'];
const DOME = ['#0C0A26', '#16123C', '#211A54', '#2E246C', '#3E3484', '#5A4EA2', '#8478C4'];
function* paintMiniSaucer(p: Painter) {
  p.form(g => g.ellipse(38, 13, 14, 11, 0, Math.PI, 0), { ramp: DOME, bevel: 6, ink: INK, spec: '#FFFFFF', wet: 0.5 });
  yield;
  p.form(g => g.ellipse(38, 18, 26, 5, 0, 0, Math.PI * 2), { ramp: HULL, bevel: 3, ink: INK });
  p.form(g => g.ellipse(38, 21, 37, 5.5, 0, 0, Math.PI * 2), { ramp: HULL, bevel: 3, ink: INK });
  p.form(g => g.ellipse(38, 25, 20, 4, 0, 0, Math.PI * 2), { ramp: HULL.slice(0, 5), bevel: 2, ink: INK, light: [0, 0.6, 0.8] });
  for (let x = 4; x <= 72; x++) p.px(x, 20, HULL[6], 0.6);
  p.disc(38, 28, 6, 2, INK); p.disc(38, 28, 5, 1.5, '#C89A20'); p.rect(36, 28, 4, 1, '#FDE68A');
  // (the antenna)
  p.line(46, 3, 46, 8, INK); p.px(46, 2, '#F472B6');
}
const LIGHT_X = Array.from({ length: 9 }, (_, i) => 8 + i * 7.5);
const drawMiniSaucer = (c: Ctx, x: number, y: number, t: number, red: boolean) => {
  const cv = painting('abd-saucer', 76, 36, paintMiniSaucer);
  const X = Math.round(x) - 38, Y = Math.round(y) - 20;
  c.drawImage(cv, X, Y);
  for (let i = 0; i < LIGHT_X.length; i++) {
    const lit = (i + (t >> 2)) % 3 === 0, lx = X + LIGHT_X[i], ly = Y + 21 + Math.round(Math.sin((i / 8) * Math.PI) * 2);
    R(c, lx, ly, 2, 1, red ? (lit ? '#FCA5A5' : '#B91C1C') : lit ? '#FFD6F4' : '#C8389A');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Satan in the wide shot: his painting from the shoulders up (the folded arms below that left off), his chest painted
// on under it, his reaching arms: each bone painted once, drawn turned from joint to joint

const SK = ['#260404', '#4A0A08', '#721410', '#982018', '#BE3424', '#DE5838'];
const CLAW = ['#0C0A0A', '#2A2422', '#4A403A', '#7A6C60'];
/** Lit from under, by the fire he's come up out of (and a little from the front). */
const UNDER: [number, number, number] = [0.15, 0.62, 0.77];
/** (and kept dark, like his painting: the fire's a rim, not a floodlight) */
const SKIN_O = { ramp: SK, ink: INK, light: UNDER, amb: 0.04, gain: 0.8 };
/** His painting's local y where it's cut (above where its folded arms start) and its scale-down, baked the once. */
const CUT_Y = 372;
const satanUpper = () => bake('abd-satan-upper', 176, Math.round((CUT_Y + 90) * SAT.s), g => {
  const big = canvasOf(880, CUT_Y + 90, h => { h.translate(440, 90); paintSatan(h); });
  g.imageSmoothingEnabled = false; g.drawImage(big, 0, 0, 176, Math.round((CUT_Y + 90) * SAT.s));
});
/** His chest below the cut: the pecs' heavy undersides, the abs, the obliques, all lit hot from under; 130 x 50, his
 *  middle at x 65, its top on the cut. */
function* paintSatanChest(p: Painter) {
  p.form(g => { g.moveTo(4, 0); g.lineTo(126, 0); g.lineTo(118, 50); g.lineTo(12, 50); g.closePath(); }, { ...SKIN_O, bevel: 10, gain: 0.6 });
  yield;
  for (const s of [-1, 1]) p.form(g => { g.moveTo(65, 0); g.lineTo(65 + s * 52, 0); g.quadraticCurveTo(65 + s * 50, 14, 65 + s * 30, 16); g.quadraticCurveTo(65 + s * 6, 16, 65 + s * 2, 8); g.closePath(); }, { ...SKIN_O, bevel: 6 });
  yield;
  for (let r = 0; r < 3; r++) for (const s of [-1, 1]) p.form(g => g.roundRect(65 + (s < 0 ? -15 : 2), 19 + r * 10, 13, 9, 3), { ...SKIN_O, bevel: 3 });
  for (const s of [-1, 1]) p.form(g => { g.moveTo(65 + s * 20, 18); g.lineTo(65 + s * 50, 14); g.lineTo(65 + s * 46, 50); g.lineTo(65 + s * 20, 50); g.closePath(); }, { ...SKIN_O, ramp: [SK[0], ...SK.slice(0, 5)], bevel: 6, gain: 0.65 });
}
/** An arm's bone, along +x from (0, h/2) to (len, h/2): its outline thick in the middle (`fat(t)`, t 0..1 along it). */
const bonePath = (len: number, h: number, fat: (t: number) => number) => (g: Ctx) => {
  const n = 16;
  for (let i = 0; i <= n; i++) { const t = i / n, x = 2 + t * (len - 4), w = fat(t); i ? g.lineTo(x, h / 2 - w) : g.moveTo(x, h / 2 - w); }
  for (let i = n; i >= 0; i--) { const t = i / n, x = 2 + t * (len - 4), w = fat(t) * 0.92; g.lineTo(x, h / 2 + w); }
  g.closePath();
};
const UP = 44, FORE = 40, BONE_H = 24;
function* paintUpperArm(p: Painter) {
  p.form(bonePath(UP + 6, BONE_H, t => 10 - t * 3 + Math.sin(Math.min(1, t * 1.3) * Math.PI) * 2.2), { ...SKIN_O, bevel: 7 });
  yield;
  // (the deltoid's seam, the biceps' line)
  p.line(12, 5, 20, 12, SK[1]); p.line(13, 5, 21, 12, SK[4], 0.6);
  p.line(24, 15, 46, 15, SK[1]); p.line(24, 16, 46, 16, SK[5], 0.6);
}
function* paintForearm(p: Painter) {
  p.form(bonePath(FORE + 6, BONE_H, t => 7.5 + Math.sin(Math.min(1, t * 2) * Math.PI) * 2.6 - t * 2.2), { ...SKIN_O, bevel: 6 });
  yield;
  p.line(8, 9, 30, 10, SK[1]); p.line(8, 10, 30, 11, SK[5], 0.6);
  for (const x of [14, 26, 38]) p.line(x, 6, x + 2, 9, SK[1]);
}
/** A hand, along +x from the wrist at (2, 15): open (the claws out, reaching) or a fist (round what it's got). */
function* paintHand(p: Painter, open: boolean) {
  if (open) {
    p.form(g => g.ellipse(9, 15, 8, 7, 0, 0, Math.PI * 2), { ...SKIN_O, bevel: 4 });
    for (const [a, l] of [[-0.9, 12], [-0.35, 15], [0.15, 15], [0.6, 13], [1.4, 9]] as const) {
      const x0 = 9 + Math.cos(a) * 5, y0 = 15 + Math.sin(a) * 5, x1 = 9 + Math.cos(a) * l, y1 = 15 + Math.sin(a) * l;
      p.form(p.strokeMask(g => { g.moveTo(x0, y0); g.lineTo(x1, y1); }, 4), { ...SKIN_O, bevel: 2 });
      p.form(g => { g.moveTo(x1 - 1.5, y1 - 1.5); g.lineTo(x1 + Math.cos(a + 0.6) * 6, y1 + Math.sin(a + 0.6) * 6); g.lineTo(x1 + 1.5, y1 + 1.5); g.closePath(); }, { ramp: CLAW, bevel: 1, ink: INK });
    }
  } else {
    p.form(g => g.ellipse(10, 15, 9, 8, 0, 0, Math.PI * 2), { ...SKIN_O, bevel: 5 });
    yield;
    for (let k = 0; k < 4; k++) { const y = 9 + k * 4; p.form(g => g.ellipse(17, y, 3.4, 2.4, 0, 0, Math.PI * 2), { ...SKIN_O, bevel: 2 }); p.px(20, y + 1, CLAW[0]); p.px(19, y + 2, CLAW[2]); }
  }
}
const ART = {
  upper: () => painting('abd-arm-up', UP + 6, BONE_H, paintUpperArm),
  fore: () => painting('abd-arm-fore', FORE + 6, BONE_H, paintForearm),
  open: () => painting('abd-hand-open', 28, 30, p => paintHand(p, true)),
  fist: () => painting('abd-hand-fist', 24, 30, p => paintHand(p, false)),
  chest: () => painting('abd-satan-chest', 130, 50, paintSatanChest),
};
/** A bone from (x0, y0) to (x1, y1): its painting turned along it, stretched to fit, turned over so the lit side's
 *  always the bottom. */
const boneAt = (c: Ctx, cv: HTMLCanvasElement, x0: number, y0: number, x1: number, y1: number, len: number) => {
  const a = Math.atan2(y1 - y0, x1 - x0), d = Math.hypot(x1 - x0, y1 - y0);
  c.save(); c.translate(Math.round(x0), Math.round(y0)); c.rotate(a); c.scale(d / len, Math.cos(a) < 0 ? -1 : 1);
  c.drawImage(cv, -2, -BONE_H / 2);
  c.restore();
};
const handAt = (c: Ctx, cv: HTMLCanvasElement, x: number, y: number, a: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(a); if (Math.cos(a) < 0) c.scale(1, -1);
  c.drawImage(cv, -2, -15);
  c.restore();
};
/** One of his arms: shoulder to hand, the elbow out to the side (limb.ts). Returns where the wrist is. */
const satanArm = (c: Ctx, sx: number, sy: number, hx: number, hy: number, out: number, hand: 'open' | 'fist' | 'none') => {
  const [ex, ey] = elbowFront(sx, sy, hx, hy, UP, FORE, out);
  boneAt(c, ART.fore(), ex, ey, hx, hy, FORE + 6);
  boneAt(c, ART.upper(), sx, sy, ex, ey, UP + 6);
  if (hand !== 'none') handAt(c, hand === 'open' ? ART.open() : ART.fist(), hx, hy, Math.atan2(hy - ey, hx - ex));
};

export const shotWide = (c: Ctx, t: number, talking: boolean) => {
  const T = clip.t;
  c.drawImage(bake(`abd-wide-${hourKey()}`, ART_W, ART_H, paintWide), 0, 0);
  // (the moon off to the left, clear of him: his painting's got gaps between the horns it'd show through)
  drawMoon(c, 14, 14, 7);
  const rise = since(clip.rise), u = ufoNow(T), tr = truckNow(T), g = since(clip.grab), cat = since(clip.catch), th = since(clip.throw);
  // (the hellfire's light up the sky behind the garage, stepped, harder as he comes)
  if (rise >= 0) { const k = clamp01(rise / 30); glow(c, SAT.x, FISSURE, 120, '#F97316', 0.03 * k, 0.12 * k, 5, 0.75); }
  // Satan, up out of the fissure behind the garage (clipped to above it)
  if (rise >= 0) {
    const top = satanTop(), x = SAT.x, s = SAT.s;
    c.save(); c.beginPath(); c.rect(0, 0, ART_W, FISSURE); c.clip();
    const up = satanUpper();
    c.drawImage(up, Math.round(x - 88), Math.round(top - 90 * s));
    c.drawImage(ART.chest(), Math.round(x - 65), Math.round(top + CUT_Y * s) - 1);
    c.save(); c.translate(x, top); c.scale(s, s); drawSatanFace(c, T, talking); c.restore();
    // (his arms: his right (screen left) up to the saucer once he grabs, else down at his side; his left, the truck)
    const shY = top + 66;
    const reachL: Pt = g >= 0 ? [u.x + 6, u.y + 3] : [x - 70, top + 118];
    satanArm(c, x - 54, shY, reachL[0], reachL[1], -1, g >= 0 && g < 14 ? 'open' : g >= 14 ? 'none' : 'open');
    const reachR: Pt = th >= 0 ? (th < 10 ? [258, 18] : [262, 62]) : cat >= 0 ? [tr.x + 2, tr.y + 2] : [x + 70, top + 118];
    satanArm(c, x + 54, shY, reachR[0], reachR[1], 1, cat >= 0 && th < 0 ? 'none' : 'open');
    c.restore();
    // (the fissure: the lot split open behind the garage, the fire up out of it in steps)
    const k = clamp01(rise / 24);
    c.fillStyle = INK; c.beginPath(); c.moveTo(120, FISSURE); for (let i = 0; i <= 14; i++) c.lineTo(120 + i * 10, FISSURE + (i % 2 ? 2 : -1) * k); c.lineTo(ART_W, FISSURE + 3 * k); c.lineTo(120, FISSURE + 2 * k); c.closePath(); c.fill();
    R(c, 122, FISSURE, 134 * k, 1, (T >> 2) % 2 ? '#F97316' : '#FBBF24'); dither(c, 122, FISSURE - 2, 134 * k, 2, 'rgba(251, 191, 36, 0.5)', (T >> 2) & 1);
  }
  c.drawImage(bake('abd-garage', ART_W, ART_H, paintGarage), 0, 0);
  // (the beam's pink up the hole's broken edges, and down into the top deck)
  if (!u.held) { R(c, HOLE_X0 + 2, GTOP + 6, HOLE_X1 - HOLE_X0 - 4, 11, 'rgba(255, 140, 230, 0.22)'); dither(c, HOLE_X0, GTOP + 1, HOLE_X1 - HOLE_X0, 5, 'rgba(255, 170, 240, 0.4)', (T >> 3) & 1); }
  // The saucer (her standby: the same make), its beam down into the roof (cut once he's got it)
  drawMiniSaucer(c, u.x, u.y, T, u.held);
  if (!u.held) beam(c, u.x, u.y + 9, GTOP + 6, 12, 50, T);
  else if (g < 8 && (g >> 1) % 2 === 0) beam(c, u.x, u.y + 9, GTOP + 6, 12, 50, T, 0.5);
  // The truck: going up, dropping, in his hand, thrown (tumbling off out of the picture)
  // (still coming up out of the hole: only what's above the parapet, or up through the gap bitten out of it)
  if (tr.x < ART_W + 30) {
    const inHole = cat < 0 && th < 0;
    if (inHole) { c.save(); c.beginPath(); c.rect(0, 0, ART_W, GTOP); c.moveTo(HOLE_X0, GTOP - 1); HOLE_JAG.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(HOLE_X1, GTOP - 1); c.closePath(); c.clip(); }
    miniTruck(c, tr.x, tr.y, tr.s, tr.rot);
    if (inHole) c.restore();
  }
  // (his fists over what they've got: the saucer's rim, the truck)
  if (rise >= 0 && g >= 14) { const top = satanTop(), [ex, ey] = elbowFront(SAT.x - 54, top + 66, u.x + 6, u.y + 3, UP, FORE, -1); handAt(c, ART.fist(), u.x + 6, u.y + 3, Math.atan2(u.y + 3 - ey, u.x + 6 - ex)); }
  if (rise >= 0 && cat >= 0 && th < 0) { const top = satanTop(), [ex, ey] = elbowFront(SAT.x + 54, top + 66, tr.x + 2, tr.y + 2, UP, FORE, 1); handAt(c, ART.fist(), tr.x + 2, tr.y + 2, Math.atan2(tr.y + 2 - ey, tr.x + 2 - ex)); }
  // (the light poles out front of it all)
  c.drawImage(bake('abd-poles', ART_W, ART_H, paintPoles), 0, 0);
  // (the throw: speed lines after it)
  if (th >= 0 && th < 30) for (let k = 0; k < 5; k++) R(c, 200 + k * 9 - th * 2, 20 + k * 6, 22, 1, 'rgba(255, 255, 255, 0.5)');
};

// ---------------------------------------------------------------------------------------------------------------
// flight: over the water park in the dark, the truck tumbling; and the crash in the lot outside its gate

const TUBES = [['#0E5A6A', '#13809A', '#18A8C4', '#3CCCE4', '#8AEAF8', '#E0FCFF'], ['#7A1450', '#A81E6E', '#D63A8E', '#F06AAE', '#F8A8D0', '#FFE4F2'], ['#7A5A08', '#A87C0C', '#D4A517', '#F0C83A', '#F8E080', '#FFF8D0'], ['#14582A', '#1C7A3A', '#28A050', '#4AC46E', '#8AE4A2', '#E0FCE8']];
const WP_W = 640;
/** The water park, below, scrolling: the far layer (MOUNT EVEREST BUT BETTER, the drop tower, far slides) dark and
 *  hazed; the near layer (the slides' towers, their tubes pillowed and stepped, the pool, the palms) colored. */
const paintWaterFar = (g: Ctx) => {
  const Y = 104, col = farTint('#1A2038'), lit = farTint('#26304E');
  g.fillStyle = col;
  // (the fake mountain: snow on its peak, its scaffold showing through at the foot; no smoke, no fire: a ride)
  g.beginPath(); g.moveTo(120, Y); g.lineTo(168, Y - 62); g.lineTo(176, Y - 56); g.lineTo(186, Y - 70); g.lineTo(236, Y); g.closePath(); g.fill();
  g.fillStyle = farTint('#10142A'); g.beginPath(); g.moveTo(186, Y - 70); g.lineTo(236, Y); g.lineTo(178, Y); g.lineTo(190, Y - 40); g.closePath(); g.fill();
  g.fillStyle = farTint('#242C4C'); g.beginPath(); g.moveTo(168, Y - 62); g.lineTo(150, Y - 30); g.lineTo(132, Y); g.lineTo(122, Y); g.closePath(); g.fill();
  g.fillStyle = farTint('#8A92B8'); g.beginPath(); g.moveTo(160, Y - 52); g.lineTo(168, Y - 62); g.lineTo(176, Y - 56); g.lineTo(186, Y - 70); g.lineTo(198, Y - 52); g.lineTo(186, Y - 56); g.lineTo(176, Y - 50); g.lineTo(168, Y - 54); g.closePath(); g.fill();
  g.strokeStyle = lit; g.lineWidth = 1; for (let x = 128; x < 230; x += 8) { g.beginPath(); g.moveTo(x, Y); g.lineTo(x + 4, Y - 12); g.lineTo(x + 8, Y); g.stroke(); }
  g.fillStyle = col;
  for (const [x, h, w] of [[30, 40, 10], [300, 76, 8], [420, 30, 40], [520, 48, 10], [600, 36, 14]] as const) g.fillRect(x, Y - h, w, h);
  g.fillRect(296, Y - 80, 16, 6);
  for (const [x, y] of [[186, Y - 71], [304, Y - 81]] as const) { g.fillStyle = '#F04040'; g.fillRect(x, y, 1, 1); }
  g.fillStyle = lit; g.fillRect(0, Y - 3, WP_W, 3); dither(g, 0, Y - 6, WP_W, 3, lit);
};
function* paintWaterNear(p: Painter) {
  const Y = 116;
  // (the towers: steel, stepped, a deck on each; the tubes curling off them, pillowed)
  for (let i = 0; i < 5; i++) {
    const x = 40 + i * 128 + hash(i) * 20, h = 34 + hash(i + 3) * 26, ramp = TUBES[i % 4];
    p.form(g => g.rect(x, Y - h, 6, h + 30), { ramp: STEEL.slice(0, 4), bevel: 2, ink: INK });
    p.form(g => g.rect(x - 6, Y - h - 5, 18, 5), { ramp: ['#5A1A0C', '#8A2A10', '#C2410C', '#E86A2A'], bevel: 2, ink: INK });
    const tube = (mx: number) => p.form(p.strokeMask(g => { g.moveTo(x + 8, Y - h + 2); g.bezierCurveTo(x + 46 * mx, Y - h, x + 12 * mx, Y - 14, x + 64 * mx, Y + 4); }, 7), { ramp, bevel: 3.5, ink: INK, spec: '#FFFFFF', wet: 0.6 });
    tube(1);
    yield;
  }
  // (the wave pool along the bottom: deep, banded, its crests lit)
  p.form(g => g.rect(0, Y + 2, WP_W, 30), { ramp: ['#061A2E', '#0A2640', '#103656', '#18486E', '#2A6A94'], bevel: 3, ink: null, light: [0, -0.8, 0.6] });
  for (let x = 0; x < WP_W; x += 9) { p.line(x, Y + 4 + (x % 2), x + 4, Y + 4 + (x % 2), '#6AB4DA'); p.px(x + 1, Y + 3 + (x % 2), '#C8ECFA'); }
  yield;
  // (the palms along it: trunks ringed, fronds stepped)
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 72 + hash(i * 7) * 30, h = 20 + hash(i * 2.1) * 10;
    p.form(g => { g.moveTo(x, Y + 4); g.quadraticCurveTo(x + 4, Y - h / 2, x + 2, Y - h); g.lineTo(x + 5, Y - h); g.quadraticCurveTo(x + 7, Y - h / 2, x + 4, Y + 4); g.closePath(); }, { ramp: RAMP.wood, bevel: 2, ink: INK });
    for (let k = 0; k < 5; k++) { const a = -Math.PI + (k / 4) * Math.PI; p.form(g => { g.ellipse(x + 3 + Math.cos(a) * 7, Y - h + Math.sin(a) * 3 + 2, 7, 2.5, a * 0.6, 0, Math.PI * 2); }, { ramp: ['#062A12', '#0C3E1C', '#145A28', '#20783A'], bevel: 2, ink: INK }); }
  }
}
export const shotFlight = (c: Ctx, t: number) => {
  c.drawImage(bake(`abd-flightSky-${hourKey()}`, ART_W, ART_H, g => { nightSky(g, 110); drawMoon(g, 40, 22, 8); }), 0, 0);
  const far = bake(`abd-wpFar-${hourKey()}`, WP_W, ART_H, paintWaterFar), near = painting('abd-wpNear', WP_W, ART_H, paintWaterNear);
  // (each layer round and round: two copies end to end, so it never jumps)
  for (const [cv, v] of [[far, 0.7], [near, 2]] as const) { const x = -Math.round((t * v) % WP_W); c.drawImage(cv, x, 0); if (x + WP_W < ART_W) c.drawImage(cv, x + WP_W, 0); }
  miniTruck(c, 128 + Math.sin(t * 0.05) * 10, 56 + Math.sin(t * 0.08) * 6, 2, t * 0.18);
  for (let k = 0; k < 6; k++) R(c, ((k * 53 - t * 6) % 300 + 300) % 300 - 20, 20 + k * 18, 30, 1, 'rgba(255, 255, 255, 0.35)');
};

/** The lot outside the gate: asphalt, the light poles, the gate's two towers and its arch, HAPPY WATERS across it, its
 *  bars shut; the water park's rides up behind it; the truck coming down out of the sky into the lot. */
const paintCrashLot = (g: Ctx) => {
  nightSky(g, 104);
  g.drawImage(canvasOf(WP_W, ART_H, paintWaterFar), -150, 0);
  bands(g, 0, 104, ART_W, 40, ['#2C2E36', '#26282F', '#212229', '#1C1D23', '#17181D']);
  stalls(g, 112, 118, 16); stalls(g, 128, 138, 24); R(g, 0, 123, ART_W, 1, '#3A3C44');
  // (the gate: the bars, shut; the towers either side, stepped blue, their cyan caps; the arch; the name across it)
  const X = 198, B = 106;
  for (let x = X - 26; x <= X + 24; x += 4) { R(g, x, B - 30, 2, 30, INK); R(g, x, B - 30, 1, 30, '#8A8E98'); }
  R(g, X - 28, B - 32, 56, 2, '#A4A8B2'); R(g, X - 28, B - 14, 56, 2, '#A4A8B2');
  for (const tx of [X - 40, X + 28]) {
    R(g, tx - 1, B - 52, 14, 52, INK); bandsX(g, tx, B - 51, 12, 51, ['#3A7AB8', '#2A62A0', '#1E4A7A', '#14345A']);
    for (let k = 0; k < 6; k++) R(g, tx, B - 46 + k * 8, 12, 1, '#0E2A48');
    R(g, tx - 3, B - 57, 18, 6, INK); bands(g, tx - 2, B - 56, 16, 4, ['#A5F3FC', '#22D3EE', '#0891B2']);
  }
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(X, B - 40, 32, Math.PI, 0); g.stroke();
  g.strokeStyle = '#0891B2'; g.lineWidth = 4; g.stroke(); g.strokeStyle = '#22D3EE'; g.lineWidth = 2; g.stroke(); g.strokeStyle = '#A5F3FC'; g.lineWidth = 1; g.beginPath(); g.arc(X, B - 41, 32, Math.PI * 1.1, Math.PI * 1.5); g.stroke();
  const name = WATER_PARK_NAME, w = name.length * 4 + 3;
  R(g, X - w / 2 - 1, B - 78, w + 2, 11, INK); bands(g, X - w / 2, B - 77, w, 9, ['#1E3A8A', '#14205C']); R(g, X - w / 2, B - 77, w, 1, '#4570D0');
  tiny(g, name, Math.round(X - w / 2) + 2, B - 75, '#FDE68A', 1);
  R(g, X - 1, B - 67, 2, 5, INK);
  // (the light poles: one near, one out by the gate; their light down in steps)
  for (const [x, foot, h] of [[30, 140, 70], [140, 116, 34]] as const) {
    g.fillStyle = 'rgba(253, 220, 140, 0.08)'; g.beginPath(); g.moveTo(x - 2, foot - h + 3); g.lineTo(x + 4, foot - h + 3); g.lineTo(x + 16, foot); g.lineTo(x - 14, foot); g.closePath(); g.fill();
    g.fillStyle = 'rgba(253, 220, 140, 0.12)'; g.beginPath(); g.ellipse(x + 1, foot, 12, 2, 0, 0, Math.PI * 2); g.fill();
    R(g, x - 1, foot - h, 3, h, INK); R(g, x, foot - h, 1, h, '#868E9A');
    R(g, x - 5, foot - h - 2, 12, 3, INK); R(g, x - 4, foot - h, 10, 1, '#FDE68A');
  }
};
export const shotCrash = (c: Ctx, t: number) => {
  c.drawImage(bake(`abd-crashLot-${hourKey()}`, ART_W, ART_H, paintCrashLot), 0, 0);
  const fall = 26, k = clamp01(t / fall);
  if (t < fall) miniTruck(c, 40 + k * 50, -20 + k * 124, 1.6, 2.2 + k * 1.6);
  else {
    // (down: on its roof, smashed, rocking; the bits going up and coming down; the dust rolling out in steps)
    const u = t - fall, sh = u < 10 ? (u % 2 ? 2 : -2) : 0, rock = u < 30 ? Math.sin(u * 0.5) * 0.08 * (1 - u / 30) : 0;
    c.fillStyle = 'rgba(0, 0, 0, 0.4)'; c.beginPath(); c.ellipse(92, 108, 30, 3, 0, 0, Math.PI * 2); c.fill();
    miniTruck(c, 92 + sh, 104, 1.6, Math.PI * 0.97 + rock);
    for (let i = 0; i < 12; i++) {
      const a = Math.PI + (i / 11) * Math.PI, sp = 1 + hash(i) * 2, tt = Math.min(u, 30);
      const x = 92 + Math.cos(a) * sp * tt, y = 102 + Math.sin(a) * sp * tt + 0.08 * tt * tt;
      if (y < 112) R(c, x, y, 2, 2, i % 3 ? '#9A9CA2' : '#C82A22');
    }
    const d = clamp01(1 - u / 60);
    if (d > 0) for (let i = 0; i < 7; i++) {
      const x = 66 + i * 9, y = 104 - (1 - d) * 18 - (i % 3) * 3, r = 6 + (1 - d) * 10;
      glow(c, x, y, r, '#B4B0AA', 0.2 * d, 0.4 * d, 3, 0.6);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Painted ahead: every picture above, in idle moments a slice at a time, from when he gets in the truck (abduction.ts)

let warmed = false;
export const warmAbductionShots = () => {
  if (warmed || typeof document === 'undefined') return;
  warmed = true;
  warmZarblaxGross();
  const paints: [string, number, number, (p: Painter) => Iterator<unknown> | void][] = [
    ['abd-truck1', TRUCK_W, TRUCK_H, p => paintTruck(p, 1)], ['abd-truck2', TRUCK_W * 2, TRUCK_H * 2, p => paintTruck(p, 2)],
    ['abd-saucer', 76, 36, paintMiniSaucer], ['abd-satan-chest', 130, 50, paintSatanChest],
    ['abd-arm-up', UP + 6, BONE_H, paintUpperArm], ['abd-arm-fore', FORE + 6, BONE_H, paintForearm],
    ['abd-hand-open', 28, 30, p => paintHand(p, true)], ['abd-hand-fist', 24, 30, p => paintHand(p, false)],
    ['abd-wpNear', WP_W, ART_H, paintWaterNear],
  ];
  const flat: (() => void)[] = [
    () => bake(`abd-cockpit-${hourKey()}`, ART_W, ART_H, paintCockpit), () => bake(`abd-cabIn-${hourKey()}`, ART_W, ART_H, paintCabInside),
    () => bake('abd-door', ART_W, ART_H, paintDoor), () => bake('abd-cabClaws', ART_W, ART_H, paintCabClaws),
    () => bake(`abd-wide-${hourKey()}`, ART_W, ART_H, paintWide), () => bake('abd-garage', ART_W, ART_H, paintGarage), () => bake('abd-poles', ART_W, ART_H, paintPoles),
    () => satanUpper(), () => bake(`abd-flightSky-${hourKey()}`, ART_W, ART_H, g => { nightSky(g, 110); drawMoon(g, 40, 22, 8); }),
    () => bake(`abd-wpFar-${hourKey()}`, WP_W, ART_H, paintWaterFar), () => bake(`abd-crashLot-${hourKey()}`, ART_W, ART_H, paintCrashLot),
  ];
  let i = 0, j = 0;
  idleJob(until => {
    while (i < paints.length) { const [k, w, h, f] = paints[i]; if (!paintingStep(k, w, h, f, until)) return false; i++; if (performance.now() >= until) return false; }
    while (j < flat.length) { flat[j++](); if (performance.now() >= until) return false; }
    return true;
  });
};
