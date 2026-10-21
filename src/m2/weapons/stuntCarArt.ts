// The clapperboard's stunt cars and stuntmen, drawn at Meathead 2's SNES grade (weapons/stuntCar.ts runs them; STUPID
// DAD's fight borrows them). A big-block muscle car, the long hood out front the way it's going, a fastback, a rear
// wing: stepped bands of its paint (lit top, base, shade, deep), chrome bumpers, side pipes and a shaker scoop, the
// racing stripe, its number on a roundel, sponsor decals, the roll cage through the glass, the stunt driver in his
// helmet. Dents pile up with every one it goes through (a scuff, a crack across the windshield, the nose crumpled, the
// meat on the bonnet). The wreck: on its roof, crushed, scorched, its belly and a bare axle to the sky.
//
// Still art is cached: the car's body painted the once per paint job / dents / driver into a sprite of its own (it
// flies rotated, so it's put down as an image); the wrecks are stamps. Only what moves is drawn live (the wheels, the
// exhaust flames, the tire smoke, drips, the stuntman).

import { stamp } from '../../m1/game/render/stamp';

type Ctx = CanvasRenderingContext2D;
export interface CarPaint { body: string; top: string; low: string; stripe: string }

/** How much bigger the car's drawn than the box it hits with (art only: the hit box is the weapon's own). */
export const ART_K = 1.35;
const INK = '#140A06';

// ---------------------------------------------------------------------------------------------------------------
// Helpers

const hexOf = (h: string) => { const n = parseInt(h.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const mixC = (a: string, b: string, k: number) => {
  const A = hexOf(a), B = hexOf(b);
  return '#' + A.map((v, i) => Math.max(0, Math.min(255, Math.round(v + (B[i] - v) * k))).toString(16).padStart(2, '0')).join('');
};
const dithers = new Map<string, CanvasPattern | string>();
/** A 2x2 checker of a color (the seam between two bands), made the once per color. */
const dith = (c: Ctx, color: string): CanvasPattern | string => {
  let p = dithers.get(color);
  if (p) return p;
  if (typeof document === 'undefined') return color;
  const cv = document.createElement('canvas'); cv.width = 2; cv.height = 2;
  const g = cv.getContext('2d')!;
  g.fillStyle = color; g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1);
  p = c.createPattern(cv, 'repeat') ?? color;
  dithers.set(color, p);
  return p;
};
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string | CanvasPattern, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2); c.fill(); };
const poly = (c: Ctx, pts: number[], col: string | CanvasPattern) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
const ln = (c: Ctx, pts: number[], w: number, col: string) => {
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke();
};
/** A cheap repeatable "random" (the same picture every time it's painted). */
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** A 3x5 pixel font for the decals (only the letters they use). */
const GLYPH: Record<string, string> = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
  '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
  A: '010101111101101', B: '110101110101110', C: '111100100100111', H: '101101111101101', K: '101101110101101',
  M: '101111111101101', O: '111101101101111', R: '110101110101101', S: '111100111001111', T: '111010010010010', U: '101101101101111',
};
export const pixText = (c: Ctx, s: string, x: number, y: number, cell: number, col: string) => {
  c.fillStyle = col;
  for (let i = 0; i < s.length; i++) {
    const g = GLYPH[s[i]]; if (!g) continue;
    for (let k = 0; k < 15; k++) if (g[k] === '1') c.fillRect(x + i * cell * 4 + (k % 3) * cell, y + Math.floor(k / 3) * cell, cell + 0.02, cell + 0.02);
  }
};
export const pixTextW = (s: string, cell: number) => s.length * cell * 4 - cell;

const CHROME = ['#FFFFFF', '#E2E6EC', '#AEB5BF', '#6B7380', '#2E333B'];
/** A chrome bar: bands down it (sky, a hard horizon, the ground's dark), outlined. */
const chromeBar = (c: Ctx, x: number, y: number, w: number, h: number) => {
  px(c, x - 0.5, y - 0.5, w + 1, h + 1, INK);
  px(c, x, y, w, h * 0.3, CHROME[0]); px(c, x, y + h * 0.3, w, h * 0.2, CHROME[1]);
  px(c, x, y + h * 0.5, w, h * 0.12, CHROME[4]); px(c, x, y + h * 0.62, w, h * 0.38, CHROME[2]);
  px(c, x, y + h * 0.88, w, h * 0.12, CHROME[3]);
};
const NUMS = ['7', '13', '69', '88', '42', '3', '99', '77'];
const SPONSOR_A = ['KABOOM', 'CRASH', 'KABOOM', 'SMASH', 'CRASH', 'KABOOM', 'SMASH', 'CRASH'];

// ---------------------------------------------------------------------------------------------------------------
// The car's body (front +x; the wheels' middles at y 4, the ground under them at 15)

const bodyPath = (c: Ctx, crumple: number) => {
  c.beginPath();
  c.moveTo(-60, -15);
  c.lineTo(-63, -10); c.lineTo(-63, 0); c.lineTo(-60, 6);
  c.lineTo(-49, 6); c.arc(-36, 4, 13, Math.PI, Math.PI * 2);
  c.lineTo(-23, 6); c.lineTo(23, 6); c.arc(36, 4, 13, Math.PI, Math.PI * 2);
  c.lineTo(49, 6); c.lineTo(61 - crumple * 3, 6);
  c.lineTo(64 - crumple * 6, 0); c.lineTo(62 - crumple * 4, -4); c.lineTo(64 - crumple * 7, -9); c.lineTo(58 - crumple * 5, -14);
  c.lineTo(34, -16 - crumple * 4); c.lineTo(26, -16 + crumple);
  c.lineTo(14, -17); c.lineTo(3, -31); c.lineTo(-20, -32); c.lineTo(-47, -19);
  c.closePath();
};
const glassPath = (c: Ctx) => { c.beginPath(); c.moveTo(12, -18); c.lineTo(2.5, -29.5); c.lineTo(-19, -30.5); c.lineTo(-43, -19); c.closePath(); };

interface BodyOpts { dents: number; driver: boolean; wreck?: boolean; num: string; sponsor: string }

const paintBody = (g: Ctx, P: CarPaint, o: BodyOpts) => {
  const HI = mixC(P.top, '#FFFFFF', 0.5), LT = P.top, BASE = P.body, SH = P.low, DP = mixC(P.low, '#000000', 0.45);
  const crumple = o.dents >= 3 ? 1 : 0;
  // (the rear wing behind it all: its struts, the plate)
  ln(g, [-55, -16, -57, -25], 2.6, INK); ln(g, [-55, -16, -57, -25], 1.4, DP);
  ln(g, [-48, -18, -50, -25], 2.6, INK); ln(g, [-48, -18, -50, -25], 1.4, DP);
  poly(g, [-67, -28.5, -45, -26.5, -45, -23, -67, -24.5], INK);
  poly(g, [-66, -27.6, -46, -25.8, -46, -24, -66, -25.4], BASE); px(g, -66, -27.6, 20, 0.9, LT);
  // (the outline, then the body)
  bodyPath(g, crumple); g.strokeStyle = INK; g.lineWidth = 2.4; g.lineJoin = 'round'; g.stroke();
  bodyPath(g, crumple); g.fillStyle = BASE; g.fill();
  g.save(); bodyPath(g, crumple); g.clip();
  // (the bands, top to bottom: lit, a dithered seam, the base, the shade, the deep along the rocker)
  px(g, -70, -40, 140, 24, LT); px(g, -70, -16, 140, 1, dith(g, LT));
  px(g, -70, -4, 140, 1, dith(g, SH)); px(g, -70, -3, 140, 6, SH);
  px(g, -70, 3, 140, 1, dith(g, DP)); px(g, -70, 4, 140, 6, DP);
  // (the shoulder's crease: a hard highlight, its shadow under it)
  ln(g, [-60, -14.4, 58, -14.4], 0.9, HI); ln(g, [-60, -13.4, 58, -13.4], 0.6, SH);
  // (the roof's and the hood's sheen)
  px(g, -17, -31.2, 16, 1.3, HI); px(g, 18, -16.6, 34, 1, HI); px(g, -45, -19.6, 12, 1, HI);
  // (the racing stripes: along the top (hood, roof, deck), and down the side)
  px(g, 14, -18, 46, 1.7, P.stripe); px(g, -20, -33, 23, 1.6, P.stripe); px(g, -60, -16.4, 14, 1.5, P.stripe);
  px(g, -70, -6.8, 140, 3.4, P.stripe); px(g, -70, -6.8, 140, 0.6, mixC(P.stripe, INK, 0.45)); px(g, -70, -3.8, 140, 0.6, mixC(P.stripe, INK, 0.45));
  // (the door's seams, its handle; the fuel cap; the side marker lights)
  ln(g, [11, -16.5, 11, 5], 0.7, DP); ln(g, [-26, -18, -26, 5], 0.7, DP);
  ln(g, [11.6, -16.5, 11.6, 5], 0.4, LT);
  chromeBar(g, -23, -12.4, 5, 1.6);
  ell(g, -53, -13, 1.8, 1.6, INK); ell(g, -53, -13, 1.3, 1.1, CHROME[1]); px(g, -53.6, -13.6, 0.8, 0.5, '#FFFFFF');
  px(g, 54, -10.5, 3, 1.6, '#F59E0B'); px(g, -60, -10.5, 2.4, 1.6, '#DC2626');
  // (the number on its roundel, on the door)
  ell(g, -7, -8.5, 6.8, 6.8, INK); ell(g, -7, -8.5, 6, 6, '#F8FAFC'); ell(g, -6, -7.6, 5.2, 5.2, '#E2E8F0'); ell(g, -7.4, -8.9, 5.2, 5.2, '#F8FAFC');
  const nw = pixTextW(o.num, 1.2);
  pixText(g, o.num, -7 - nw / 2, -11.5, 1.2, INK);
  // (the sponsors: the rear quarter's, the front fender's, a little contingency decal under the window)
  const sw = pixTextW(o.sponsor, 0.7);
  px(g, 26.5, -14.6, sw + 2.4, 5, INK); px(g, 27, -14.1, sw + 1.4, 4, '#FDE047'); pixText(g, o.sponsor, 27.7, -13.4, 0.7, '#B91C1C');
  px(g, -61.5, -14.6, 13.6, 5, '#F8FAFC'); px(g, -61.5, -14.6, 13.6, 0.6, INK); pixText(g, 'BOOM', -60.8, -13.4, 0.7, INK);
  px(g, -24, -17.6, 9, 2.4, INK); px(g, -23.6, -17.2, 4, 1.6, '#22C55E'); px(g, -19.4, -17.2, 4, 1.6, '#F97316');
  // (the dents, the scuffs to the primer, what it went through (meat on the bonnet))
  if (o.dents >= 1) {
    ell(g, -31, -9, 4, 2.4, SH); ell(g, -31.6, -9.8, 3, 1.2, DP); g.strokeStyle = HI; g.lineWidth = 0.6; g.beginPath(); g.ellipse(-31, -9, 4.4, 2.8, 0, Math.PI * 1.05, Math.PI * 1.75); g.stroke();
    for (let k = 0; k < 4; k++) ln(g, [-18 + k * 3, -3 + (k % 2), -13 + k * 3, -6 + (k % 2)], 0.5, '#A8A29E');
    ell(g, 58, -8, 3.4, 4, '#7F1D1D'); ell(g, 57, -9, 2, 2, '#B91C1C'); px(g, 59, -5, 1.2, 4, '#991B1B'); px(g, 56, -4, 1, 2.6, '#7F1D1D');
    for (let k = 0; k < 7; k++) ell(g, 40 + k * 3, -16 + hash(k) * 3, 0.9 + hash(k + 9) * 0.8, 0.7, k % 2 ? '#991B1B' : '#7F1D1D');
  }
  if (o.dents >= 2) {
    ell(g, 41, -11, 4.6, 2.6, SH); ell(g, 40.4, -11.6, 3, 1.4, DP); ln(g, [37, -13.6, 45, -13.6], 0.5, HI);
    px(g, -45, -1, 8, 2.2, '#9CA3AF'); px(g, -44, -0.6, 5, 1, '#D1D5DB');
    ln(g, [18, -15, 44, -17, 50, -14], 1.4, '#7F1D1D'); ln(g, [24, -15.4, 36, -16.6], 0.6, '#B91C1C');
  }
  if (o.dents >= 3) {
    ln(g, [50, -14, 53, -9, 51, -5, 55, -1, 53, 3], 1, DP); ln(g, [51, -14, 54, -9, 52, -5, 56, -1], 0.5, HI);
    ln(g, [28, -16.6, 34, -20, 40, -16.4], 0.6, HI);
    px(g, 4, -4, 6, 3, dith(g, '#9CA3AF')); px(g, -40, -12, 5, 3, dith(g, '#9CA3AF'));
  }
  // (scorched, for a wreck: black soot dithered over it in patches, the paint blistered)
  if (o.wreck) {
    for (let k = 0; k < 9; k++) { const sx = -58 + hash(k * 3.1) * 116, sy = -26 + hash(k * 7.7) * 28; ell(g, sx, sy, 7 + hash(k) * 9, 3 + hash(k + 2) * 4, dith(g, '#1C1917')); ell(g, sx, sy, 3 + hash(k) * 4, 1.6 + hash(k + 2) * 2, '#292524'); }
    for (let k = 0; k < 12; k++) ell(g, -50 + hash(k * 5.3) * 100, -20 + hash(k * 2.9) * 22, 0.9, 0.9, mixC(BASE, '#FFFFFF', 0.3));
  }
  g.restore();
  // (the glass: sky in it, a glint across; the roll cage through it; the driver in his helmet)
  g.save(); glassPath(g); g.clip();
  if (o.wreck) {
    px(g, -50, -34, 70, 20, '#0C0A09'); px(g, -50, -22, 70, 6, '#1C1917');
    poly(g, [12, -18, 9, -22, 7, -18], '#BAE6FD'); poly(g, [-43, -19, -36, -22, -37, -19], '#BAE6FD'); poly(g, [2, -29.5, -2, -24, -4, -29.6], '#BAE6FD');
  } else {
    px(g, -50, -34, 70, 20, '#3B82B8'); px(g, -50, -34, 70, 6.6, '#9ED8F4'); px(g, -50, -27.4, 70, 1, dith(g, '#9ED8F4'));
    px(g, -50, -21, 70, 3, '#2A5C86');
    // (the cage: the main hoop, a diagonal, the door bars)
    ln(g, [-10, -31, -10, -18], 2.2, '#27272A'); ln(g, [-10, -31, -10, -18], 0.8, '#A1A1AA');
    ln(g, [-10, -30, -34, -19], 2, '#27272A'); ln(g, [-10, -30, -34, -19], 0.7, '#A1A1AA');
    ln(g, [-34, -20.6, 10, -20.6], 1.4, '#27272A');
    if (o.driver) {
      // (his shoulders, the harness; the helmet: white, the car's color in a stripe over the top, the visor down)
      ell(g, -1, -17, 7, 3.6, '#B91C1C'); ln(g, [-4, -20, -2, -16], 1, '#F8FAFC'); ln(g, [2, -20, 0, -16], 1, '#F8FAFC');
      ell(g, -1, -23.6, 6.6, 6.4, INK); ell(g, -1, -23.6, 5.8, 5.6, '#F8FAFC'); ell(g, -2, -24.4, 4.4, 4.2, '#FFFFFF');
      g.save(); g.beginPath(); g.ellipse(-1, -23.6, 5.8, 5.6, 0, 0, Math.PI * 2); g.clip();
      px(g, -8, -30, 16, 2.4, BASE); px(g, 1.6, -30, 6, 12, '#CBD5E1');
      px(g, 0.6, -25.4, 6, 3.6, '#0F172A'); px(g, 1.2, -25, 3, 0.8, '#7DD3FC');
      g.restore();
    } else ell(g, -2, -21, 5, 3, '#1C1917');
    // (the glint)
    poly(g, [-6, -30.5, -2, -30.5, -14, -18, -18, -18], 'rgba(255,255,255,0.55)'); poly(g, [-28, -26, -26, -27, -34, -18, -36, -18], 'rgba(255,255,255,0.35)');
    if (o.dents >= 2) { ln(g, [6, -24, 2, -27, 0, -29], 0.5, '#FFFFFF'); ln(g, [6, -24, 10, -20], 0.5, '#FFFFFF'); ln(g, [6, -24, 4, -19], 0.5, '#FFFFFF'); ln(g, [6, -24, 0, -22], 0.5, '#FFFFFF'); }
  }
  g.restore();
  // (the window's chrome frame, the B-pillar, the mirror)
  glassPath(g); g.strokeStyle = CHROME[2]; g.lineWidth = 0.8; g.stroke();
  px(g, -13.6, -30.6, 3, 12.6, DP); px(g, -13.6, -30.6, 0.8, 12.6, SH);
  px(g, 8, -21, 4, 2.4, INK); px(g, 8.5, -20.6, 3, 1.6, CHROME[1]);
  // (the shaker scoop on the hood: its intake black, a chrome rim)
  if (!crumple) {
    poly(g, [27, -16, 30, -22.4, 45, -22.4, 47, -16], INK);
    poly(g, [28, -16, 30.6, -21.6, 44.4, -21.6, 46, -16], BASE); px(g, 30.6, -21.6, 13.8, 1.2, HI);
    px(g, 42.4, -21, 2.6, 4, '#0C0A09'); ln(g, [42, -21.4, 45, -21.4], 0.7, CHROME[1]);
  } else { poly(g, [26, -16, 30, -24, 38, -19, 44, -23, 47, -16], INK); poly(g, [27, -16, 30.4, -23, 38, -18.2, 44, -22, 46, -16], BASE); }
  // (the bumpers, the headlight, the taillight; the side pipes, the twin tips out the back)
  if (crumple) { g.save(); g.translate(59, -4); g.rotate(0.25); chromeBar(g, -2, -2.5, 7, 5); g.restore(); }
  else chromeBar(g, 58, -6.6, 7, 5);
  chromeBar(g, -65.5, -6.6, 6, 5);
  if (crumple) { ell(g, 61, -10.4, 2, 2.4, INK); ln(g, [60, -12, 62, -9], 0.5, '#E2E8F0'); }
  else { ell(g, 62, -10.4, 2.4, 2.8, INK); ell(g, 62, -10.4, 1.8, 2.2, '#FEF9C3'); px(g, 61.6, -11.8, 0.8, 1, '#FFFFFF'); }
  px(g, -64, -13.4, 2.8, 4.6, INK); px(g, -63.6, -13, 2, 3.8, '#DC2626'); px(g, -63.6, -13, 0.8, 1.4, '#FCA5A5');
  chromeBar(g, -21, 6.2, 40, 2.8);
  for (let k = 0; k < 6; k++) ell(g, -16 + k * 6.4, 7.6, 0.7, 0.6, '#3F3F46');
  chromeBar(g, -67, 1, 5, 2); chromeBar(g, -67, 4, 5, 2);
  px(g, -67, 1.4, 0.8, 1.2, '#18181B'); px(g, -67, 4.4, 0.8, 1.2, '#18181B');
};

// ---------------------------------------------------------------------------------------------------------------
// The car, cached

const RES = 4, BX = -70, BY = -36, BW = 140, BH = 48;
const sprites = new Map<string, HTMLCanvasElement | null>();
const spriteOf = (P: CarPaint, o: BodyOpts): HTMLCanvasElement | null => {
  const key = `${P.body}|${P.stripe}|${o.dents}|${o.driver ? 1 : 0}|${o.num}`;
  if (sprites.has(key)) return sprites.get(key)!;
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas'); cv.width = BW * RES; cv.height = BH * RES;
  const g = cv.getContext('2d');
  if (!g) { sprites.set(key, null); return null; }
  g.setTransform(RES, 0, 0, RES, -BX * RES, -BY * RES);
  paintBody(g, P, o);
  sprites.set(key, cv);
  return cv;
};

/** A wheel: its well dark behind it, the tire (raised white letters going round with it), the mag (five spokes). */
const wheelAt = (c: Ctx, wx: number, spin: number, bent = 0) => {
  c.fillStyle = '#0B0B0D'; c.beginPath(); c.arc(wx, 4, 12.6, Math.PI, Math.PI * 2); c.fill();
  c.save(); c.translate(wx, 4); if (bent) c.scale(1, 1 - bent * 0.35);
  ell(c, 0, 0, 11.2, 11.2, INK); ell(c, 0, 0, 10.2, 10.2, '#2A2A30'); ell(c, -1, -1, 9.4, 9.4, '#34343C'); ell(c, 0.6, 0.6, 8.2, 8.2, '#2A2A30');
  for (let k = 0; k < 3; k++) { const a = spin + k * 2.1; ln(c, [Math.cos(a) * 8.6, Math.sin(a) * 8.6, Math.cos(a + 0.35) * 8.6, Math.sin(a + 0.35) * 8.6], 1, '#E7E5E4'); }
  ell(c, 0, 0, 6.6, 6.6, '#4B5563'); ell(c, -0.4, -0.4, 6, 6, CHROME[2]); ell(c, -1, -1, 4.4, 4.4, CHROME[1]);
  for (let k = 0; k < 5; k++) { const a = spin + k * (Math.PI * 2 / 5); ln(c, [0, 0, Math.cos(a) * 5.8, Math.sin(a) * 5.8], 1.6, '#6B7280'); ln(c, [0, 0, Math.cos(a) * 5.6, Math.sin(a) * 5.6], 0.6, '#F8FAFC'); }
  ell(c, 0, 0, 1.9, 1.9, INK); ell(c, -0.3, -0.3, 1.3, 1.3, '#F8FAFC');
  c.restore();
};

export interface CarOpts { driver?: boolean; dents?: number; num?: number; trail?: boolean }

/** The car in flight, its middle at (x, y) (its wheels' middles 4 under), `s` its scale, `dir` the way it's going, `rot`
 *  its nose's tip. */
export const drawCarArt = (c: Ctx, x: number, y: number, s: number, dir: number, wheel: number, rot: number, paint: number, P: CarPaint, o: CarOpts = {}) => {
  const dents = Math.max(0, Math.min(3, o.dents ?? 0)), f = Math.floor(wheel / 1.2);
  c.save(); c.translate(x, y); c.scale(dir * s, s); c.rotate(rot);
  const trail = o.trail !== false && Math.abs(rot) < Math.PI / 2;
  if (trail) {
    // (speed lines; the tire smoke boiling off the back wheel; the exhaust's flames out the tips)
    for (let i = 0; i < 4; i++) px(c, -98 - i * 12 - ((f * 5 + i * 7) % 10), -26 + i * 8, 26, 1.6, 'rgba(255,255,255,0.55)');
    for (let k = 3; k >= 0; k--) {
      const sx = -52 - k * 10 - ((f * 3) % 10), sy = 12 - k * 3, r = 4.4 + k * 2 + ((f + k) % 3) * 0.6;
      ell(c, sx + 1, sy + 1, r, r * 0.8, 'rgba(87,83,78,0.45)'); ell(c, sx, sy, r * 0.9, r * 0.72, 'rgba(231,229,228,0.6)');
    }
    const L = 9 + ((f * 7) % 5) * 2.2;
    for (const ty of [2, 5]) {
      poly(c, [-67, ty - 2, -67 - L, ty + 0.2, -67, ty + 2.2], '#EA580C');
      poly(c, [-67, ty - 1.2, -67 - L * 0.68, ty + 0.2, -67, ty + 1.6], '#FDE047');
      poly(c, [-67, ty - 0.4, -67 - L * 0.3, ty + 0.2, -67, ty + 0.8], '#FFFFFF');
    }
  }
  wheelAt(c, -36, wheel); wheelAt(c, 36, wheel);
  const cv = spriteOf(P, { dents, driver: o.driver !== false, num: NUMS[paint % NUMS.length], sponsor: SPONSOR_A[paint % SPONSOR_A.length] });
  if (cv) {
    const sm = c.imageSmoothingEnabled, q = c.imageSmoothingQuality;
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(cv, BX, BY, BW, BH);
    c.imageSmoothingEnabled = sm; c.imageSmoothingQuality = q;
  }
  // (crumpled: steam out of the radiator)
  if (dents >= 3) for (let k = 0; k < 3; k++) ell(c, 60 + k * 3, -18 - ((f * 2 + k * 6) % 14), 2.4 + k, 2 + k * 0.8, 'rgba(241,245,249,0.5)');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The wreck: on its roof, the roof crushed down, scorched, its belly to the sky (the exhaust, the driveshaft, the oil
// pan, the muffler), the front wheel bent and still on, the back one gone (the bare brake disc, the caliper); glass all
// round it, oil out from under it. `bloody`: what it came down on was a man (the grille dripping, a tooth in it).

const paintWreck = (g: Ctx, P: CarPaint, paint: number, bloody: boolean) => {
  // (the shadow, the oil out from under it, the glass)
  ell(g, 0, 0, 74, 3.6, 'rgba(0,0,0,0.35)');
  ell(g, -14, 0.6, 44, 3, '#0C0A09'); ell(g, -18, 0.2, 30, 1.6, '#292524'); px(g, -30, -0.2, 8, 0.6, '#7C3AED'); px(g, -22, -0.2, 6, 0.6, '#0EA5E9'); px(g, -16, -0.2, 5, 0.6, '#EAB308');
  for (let k = 0; k < 16; k++) { const gx = -80 + hash(k * 4.7) * 160, gy = -0.6 + hash(k * 1.9) * 2.2; poly(g, [gx, gy, gx + 1.6 + hash(k) * 1.6, gy - 1.4, gx + 2.6, gy + 0.6], k % 3 ? '#BAE6FD' : '#F0F9FF'); }
  g.save(); g.translate(0, -26); g.scale(1, -0.8);
  paintBody(g, P, { dents: 3, driver: false, wreck: true, num: NUMS[paint % NUMS.length], sponsor: SPONSOR_A[paint % SPONSOR_A.length] });
  // (the belly: the floor pan, the driveshaft, the exhaust back to the muffler, the oil pan)
  px(g, -58, 5.4, 116, 3.6, '#27272A'); px(g, -58, 5.4, 116, 0.8, '#3F3F46');
  px(g, -30, 7.2, 58, 1.8, '#52525B'); px(g, -30, 7.2, 58, 0.6, '#A1A1AA');
  ln(g, [-60, 8.4, -44, 8.6, 18, 8.6], 1.6, '#78716C'); ell(g, -44, 8.8, 7, 2.2, '#57534E'); ell(g, -45, 8.2, 5, 1, '#78716C');
  ell(g, 30, 8.6, 9, 2.4, '#3F3F46'); ell(g, 29, 8, 6, 1, '#71717A');
  // (the front wheel, bent; the back one gone)
  wheelAt(g, 36, 0.7, 1);
  g.fillStyle = '#0B0B0D'; g.beginPath(); g.arc(-36, 4, 12.6, Math.PI, Math.PI * 2); g.fill();
  ell(g, -36, 4, 7.4, 7.4, INK); ell(g, -36, 4, 6.6, 6.6, '#78716C'); ell(g, -36.6, 3.4, 5, 5, '#A8A29E'); ell(g, -36, 4, 2.6, 2.6, '#57534E');
  for (let k = 0; k < 5; k++) { const a = k * 1.256; ell(g, -36 + Math.cos(a) * 1.8, 4 + Math.sin(a) * 1.8, 0.5, 0.5, '#E7E5E4'); }
  px(g, -42, -1.6, 4.6, 4.4, INK); px(g, -41.6, -1.2, 3.8, 3.6, '#DC2626'); px(g, -41.6, -1.2, 3.8, 0.8, '#F87171');
  g.restore();
  if (bloody) {
    // (the grille: red all over, a tooth stuck in it, a scrap of his tank top on the bumper; the pool under it)
    ell(g, 62, -22, 5.6, 9, '#4A0508'); ell(g, 62, -22, 4.6, 8, '#7F1D1D'); ell(g, 61, -25, 2.6, 3, '#B91C1C'); ell(g, 63, -18, 2, 2.4, '#991B1B'); px(g, 60.4, -27, 1, 1, '#FCA5A5');
    for (let k = 0; k < 5; k++) px(g, 58.6 + k * 1.6, -15 + (k % 2) * 2, 1.1, 5 + hash(k) * 8, k % 2 ? '#7F1D1D' : '#991B1B');
    px(g, 60, -24, 1.6, 2.2, '#FEFCE8'); px(g, 60, -22.2, 1.6, 0.6, '#D6D3D1');
    poly(g, [56, -31, 66, -30, 64, -25, 60, -23, 57, -26], '#F5F5F4'); for (let k = 0; k < 4; k++) px(g, 57.6 + k * 2, -30.4, 0.6, 5, '#D6D3D1'); ell(g, 61, -27, 2.4, 1.6, '#A16207');
    ell(g, 62, 0, 18, 2.6, '#4A0508'); ell(g, 61, -0.3, 13, 1.7, '#7F1D1D'); px(g, 55, -0.8, 6, 0.6, '#DC2626');
  }
};

/** A wreck lying on its roof, its middle at x, the floor at `floorY`; `t` how long it's lain there (it burns a while,
 *  then just smokes); `bloody`: the grille dripping. Stamped (the burning and the drips live over it). */
export const drawWreckArt = (c: Ctx, x: number, floorY: number, s: number, dir: number, paint: number, P: CarPaint, o: { t: number; f: number; bloody?: boolean; burn?: number }) => {
  c.save(); c.translate(x, floorY); c.scale(dir * s, s);
  const bloody = !!o.bloody;
  stamp(c, `m2-scw-${paint}-${bloody ? 1 : 0}`, -84, -60, 168, 66, g => paintWreck(g, P, paint, bloody));
  const f = o.f, burn = o.burn ?? (o.t < 140 ? 1 : o.t < 260 ? 0.5 : 0);
  if (burn > 0) {
    // (stepped flames off the belly and out of the engine bay, flickering)
    const n = burn >= 1 ? 6 : 3;
    for (let k = 0; k < n; k++) {
      const fx = -46 + k * (92 / (n - 1 || 1)) + Math.sin(f * 0.3 + k) * 2, fy = -34 + Math.abs(fx) * 0.04, h = (9 + ((f * 3 + k * 17) % 11)) * (0.6 + burn * 0.4);
      poly(c, [fx - 5, fy, fx - 2, fy - h * 0.6, fx, fy - h, fx + 2.4, fy - h * 0.55, fx + 5, fy], '#DC2626');
      poly(c, [fx - 3.6, fy, fx, fy - h * 0.78, fx + 3.6, fy], '#F97316');
      poly(c, [fx - 2, fy, fx, fy - h * 0.45, fx + 2, fy], '#FDE047');
    }
    if (burn >= 1) for (let k = 0; k < 2; k++) { const h = 8 + ((f * 5 + k * 7) % 9); poly(c, [62, -24 + k * 6, 62 + h, -26 + k * 6 - h * 0.3, 63, -20 + k * 6], '#F97316'); poly(c, [62, -23 + k * 6, 62 + h * 0.5, -24 + k * 6 - h * 0.2, 62.6, -21 + k * 6], '#FDE047'); }
  }
  if (bloody) for (let k = 0; k < 3; k++) { const u = ((f * 0.7 + k * 11) % 16) / 16; ell(c, 59.6 + k * 1.8, -14 + u * 13, 0.8, 1.2 + u, '#991B1B'); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The stuntman: a red jumpsuit (white stripes down the arms and legs, a star on the chest, a sponsor patch, the zip, a
// black belt, its buckle), black boots and gloves, a white helmet with a red stripe. Tumbling or diving he's got it
// on, the visor up, his goofy face in it; up on his feet he's got it under his arm: a mullet, a shiner, a band-aid on
// his forehead, a scrape down his cheek, a grin with a tooth gone, a thumbs-up and a wave to the house.

const SUIT = ['#FCA5A5', '#DC2626', '#B91C1C', '#7F1D1D', '#3B0A0A'];
const SKIN = ['#FBD9BC', '#F2C29B', '#D9A27A', '#A8714F', '#4A2A18'];
/** A limb: an inked tube, its color, a lit seam down one side, a stripe down the other. */
const limbOf = (c: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, col: string[], stripe = true) => {
  ln(c, [x0, y0, x1, y1], w + 1.8, INK); ln(c, [x0, y0, x1, y1], w, col[1]);
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  ln(c, [x0 - nx * w * 0.28, y0 - ny * w * 0.28, x1 - nx * w * 0.28, y1 - ny * w * 0.28], w * 0.28, col[0]);
  ln(c, [x0 + nx * w * 0.3, y0 + ny * w * 0.3, x1 + nx * w * 0.3, y1 + ny * w * 0.3], w * 0.22, col[2]);
  if (stripe) ln(c, [x0 + nx * w * 0.05, y0 + ny * w * 0.05, x1 + nx * w * 0.05, y1 + ny * w * 0.05], 0.9, '#F8FAFC');
};
const glove = (c: Ctx, x: number, y: number, r = 2.6) => { ell(c, x, y, r + 0.8, r + 0.8, INK); ell(c, x, y, r, r, '#27272A'); ell(c, x - r * 0.3, y - r * 0.3, r * 0.45, r * 0.4, '#52525B'); };
const boot = (c: Ctx, x: number, y: number, dir = 1) => { c.save(); c.translate(x, y); c.scale(dir, 1); px(c, -3.4, -4.4, 8.4, 5.2, INK); px(c, -2.8, -3.8, 7.2, 3.8, '#27272A'); px(c, -2.8, -3.8, 7.2, 1, '#52525B'); px(c, -2.8, -0.6, 7.6, 1, '#A8A29E'); c.restore(); };
const star = (c: Ctx, x: number, y: number, r: number, col: string) => { const pts: number[] = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; pts.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } poly(c, pts, col); };

/** The torso, its hips at y0, its shoulders at y1 (about x 0). */
const torso = (c: Ctx, y0: number, y1: number) => {
  poly(c, [-6.6, y1 - 0.6, 6.6, y1 - 0.6, 6, y0 + 0.6, -6, y0 + 0.6], INK);
  poly(c, [-5.8, y1, 5.8, y1, 5.2, y0, -5.2, y0], SUIT[1]);
  px(c, -5.6, y1, 2.4, y0 - y1, SUIT[0]); px(c, 2.6, y1, 3, y0 - y1, SUIT[2]); px(c, 4.4, y1, 1.2, y0 - y1, SUIT[3]);
  px(c, 4.6, y1 + 1, 0.9, y0 - y1 - 1, '#F8FAFC'); px(c, -5.2, y1 + 1, 0.9, y0 - y1 - 1, '#F8FAFC');
  ln(c, [0.4, y1 + 0.5, 0.4, y0 - 2.6], 0.5, SUIT[3]);
  // (the chest's star, the sponsor patch, the belt and its buckle)
  ell(c, -2.4, y1 + 4.4, 2.6, 2.6, INK); ell(c, -2.4, y1 + 4.4, 2.1, 2.1, '#FDE047'); star(c, -2.4, y1 + 4.4, 1.7, '#B91C1C');
  px(c, 1.4, y1 + 3, 3.4, 2.6, '#F8FAFC'); px(c, 1.8, y1 + 3.6, 2.6, 0.6, '#2563EB'); px(c, 1.8, y1 + 4.6, 1.8, 0.5, '#2563EB');
  px(c, -5.6, y0 - 2.6, 11.2, 2.4, INK); px(c, -5.2, y0 - 2.4, 10.4, 1.4, '#27272A'); px(c, -1.4, y0 - 2.8, 3, 2.8, '#A1A1AA'); px(c, -1, y0 - 2.4, 1, 1, '#F8FAFC');
};
/** His bare head (the helmet under his arm): the mullet, the shiner, the band-aid, the scrape, the grin. */
const bareHead = (c: Ctx, hx: number, hy: number, f: number) => {
  // (the mullet down his neck behind)
  poly(c, [hx - 7, hy - 3, hx - 2, hy - 2, hx - 1, hy + 9, hx - 7.6, hy + 7.4], INK); poly(c, [hx - 6.4, hy - 2, hx - 2, hy - 1.6, hx - 1.6, hy + 8, hx - 6.8, hy + 6.6], '#7A4A1C'); px(c, hx - 6, hy + 1, 1, 5, '#A0682E');
  ell(c, hx, hy, 7.2, 7.4, INK); ell(c, hx, hy, 6.4, 6.6, SKIN[1]); ell(c, hx - 1.4, hy - 1.6, 4.4, 4.4, SKIN[0]); ell(c, hx + 3, hy + 2.6, 3, 3, SKIN[2]);
  ell(c, hx - 2.6, hy + 0.4, 1.6, 2, SKIN[2]); ell(c, hx - 2.8, hy + 0.2, 0.8, 1, '#E07A7A');
  // (the hair on top: a feathered sweep)
  poly(c, [hx - 7, hy - 2, hx - 5, hy - 7.6, hx, hy - 8.4, hx + 5.6, hy - 6.4, hx + 6.6, hy - 3, hx + 2, hy - 5, hx - 3, hy - 4], INK);
  poly(c, [hx - 6.4, hy - 2.4, hx - 4.6, hy - 7, hx, hy - 7.8, hx + 5, hy - 6, hx + 5.6, hy - 3.6, hx + 2, hy - 4.6, hx - 3, hy - 3.6], '#7A4A1C');
  ln(c, [hx - 3, hy - 6.6, hx + 3.6, hy - 6], 0.6, '#A0682E');
  // (the band-aid, the scrape, the shiner round his far eye, the eyes)
  c.save(); c.translate(hx + 1.6, hy - 4.4); c.rotate(0.5); px(c, -2.6, -0.8, 5.2, 1.6, '#E8C39E'); px(c, -0.8, -0.8, 1.6, 1.6, '#D4A882'); c.restore();
  c.save(); c.translate(hx + 1.6, hy - 4.4); c.rotate(-0.5); px(c, -2.6, -0.8, 5.2, 1.6, '#E8C39E'); c.restore();
  for (let k = 0; k < 3; k++) ln(c, [hx - 4.6 + k * 0.8, hy + 1.6, hx - 3 + k * 0.8, hy + 4], 0.4, '#C2410C');
  ell(c, hx + 3.6, hy - 1, 2.4, 2, '#7C3AED'); ell(c, hx + 3.6, hy - 1, 1.8, 1.5, '#A78BFA');
  const blink = f % 90 < 4;
  if (blink) { ln(c, [hx + 2.4, hy - 1, hx + 4.8, hy - 1], 0.7, INK); ln(c, [hx - 1.6, hy - 1.2, hx + 0.6, hy - 1.2], 0.7, INK); }
  else { ell(c, hx + 3.6, hy - 1, 1.2, 1.3, '#FFFFFF'); px(c, hx + 3.8, hy - 1.4, 0.9, 1.1, INK); ell(c, hx - 0.6, hy - 1.2, 1.3, 1.4, '#FFFFFF'); px(c, hx - 0.2, hy - 1.6, 0.9, 1.1, INK); }
  ln(c, [hx - 1.8, hy - 3.4, hx + 0.6, hy - 3.8], 0.6, '#5A3410'); ln(c, [hx + 2.4, hy - 3.6, hx + 5, hy - 3], 0.6, '#5A3410');
  // (the nose; the grin: wide, every tooth, one gone)
  ell(c, hx + 6.2, hy + 0.8, 1.6, 1.3, SKIN[2]); px(c, hx + 6, hy + 0.2, 0.8, 0.6, SKIN[0]);
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 1.4, hy + 2.4); c.quadraticCurveTo(hx + 2.6, hy + 7.4, hx + 6.4, hy + 2.6); c.closePath(); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(hx - 0.8, hy + 2.8); c.quadraticCurveTo(hx + 2.6, hy + 5, hx + 5.8, hy + 3); c.closePath(); c.fill();
  px(c, hx + 2.2, hy + 2.8, 1, 1.8, INK); ln(c, [hx + 0.6, hy + 2.9, hx + 0.6, hy + 4], 0.3, '#A8A29E'); ln(c, [hx + 4, hy + 2.9, hx + 4, hy + 3.8], 0.3, '#A8A29E');
  ell(c, hx - 4, hy + 0.6, 1.4, 2, SKIN[2]);
};
/** His helmet: white, the red stripe over it, the visor up (his face in the opening when he's in it). */
const helmet = (c: Ctx, hx: number, hy: number, worn: boolean, f: number) => {
  ell(c, hx, hy, 7.6, 7.6, INK); ell(c, hx, hy, 6.8, 6.8, '#E2E8F0'); ell(c, hx - 1.2, hy - 1.4, 5.4, 5.4, '#F8FAFC'); ell(c, hx - 2.4, hy - 3, 1.6, 1, '#FFFFFF');
  c.save(); c.beginPath(); c.ellipse(hx, hy, 6.8, 6.8, 0, 0, Math.PI * 2); c.clip();
  px(c, hx - 1.6, hy - 8, 3.2, 16, '#DC2626'); px(c, hx + 0.8, hy - 8, 0.8, 16, '#991B1B'); px(c, hx + 3.6, hy - 8, 4, 16, '#CBD5E1');
  // (the face opening: him in it, or the dark inside)
  if (worn) {
    poly(c, [hx + 1.4, hy - 2.6, hx + 7, hy - 2.6, hx + 7, hy + 5, hx + 1.4, hy + 4], SKIN[1]);
    px(c, hx + 2, hy - 2.4, 5, 1.2, SKIN[2]);
    const blink = f % 80 < 4;
    if (!blink) { ell(c, hx + 3.4, hy - 0.4, 1, 1.1, '#FFFFFF'); px(c, hx + 3.6, hy - 0.8, 0.8, 1, INK); ell(c, hx + 5.8, hy - 0.4, 1, 1.1, '#FFFFFF'); px(c, hx + 6, hy - 0.8, 0.8, 1, INK); }
    else ln(c, [hx + 2.6, hy - 0.4, hx + 6.6, hy - 0.4], 0.6, INK);
    poly(c, [hx + 2.4, hy + 1.8, hx + 6.6, hy + 1.6, hx + 5, hy + 3.6], INK); px(c, hx + 3, hy + 1.9, 3.2, 0.8, '#FFFFFF');
  } else ell(c, hx + 3.6, hy + 1, 3.6, 4, '#1C1917');
  c.restore();
  // (the visor flipped up over the brow; the chin strap)
  poly(c, [hx - 2, hy - 7.6, hx + 6.6, hy - 5.4, hx + 7.6, hy - 3.2, hx - 1, hy - 5.2], INK); poly(c, [hx - 1.4, hy - 7, hx + 6.2, hy - 5, hx + 6.8, hy - 3.8, hx - 1, hy - 5.8], '#1E293B'); px(c, hx + 1, hy - 6.4, 3, 0.6, '#7DD3FC');
  ln(c, [hx - 1, hy + 5, hx + 1.4, hy + 7.6], 0.6, '#27272A');
};

export type StuntPose = 'tumble' | 'down' | 'up' | 'dive';
/** The stuntman, about (x, y), at scale `s`, facing `dir`, turned `rot`; `f` the frame (his wave). `up` is stood on his
 *  feet (y the floor), the others about his middle as before. */
export const drawStuntmanArt = (c: Ctx, x: number, y: number, s: number, dir: number, rot: number, pose: StuntPose, f = 0) => {
  c.save(); c.translate(x, y); c.scale(dir * s, s); c.rotate(rot);
  if (pose === 'dive') {
    // (Superman: arms out straight ahead, fists together, legs together trailing; head first along -y)
    limbOf(c, -2.6, 8, -3.4, 19, 4, SUIT); limbOf(c, 2.6, 8, 3.4, 19, 4, SUIT);
    boot(c, -3.4, 22, 1); boot(c, 3.6, 22, 1);
    torso(c, 9, -8);
    limbOf(c, -4, -6, -2, -22, 3.6, SUIT); limbOf(c, 4, -6, 2, -22, 3.6, SUIT);
    glove(c, -1.6, -23.6, 2.4); glove(c, 1.6, -23.6, 2.4);
    c.save(); c.translate(0, -12); c.rotate(-Math.PI / 2); helmet(c, 0, 0, true, f); c.restore();
  } else if (pose === 'down') {
    // (flat out, face down, every limb the wrong way; blood out from under his helmet)
    ell(c, -16, 2, 10, 2.4, '#7F1D1D'); ell(c, -18, 1.4, 6, 1.4, '#B91C1C');
    limbOf(c, 8, -2, 20, 1, 4, SUIT); limbOf(c, 8, -3, 16, -9, 4, SUIT); boot(c, 23, 0, 1); boot(c, 18, -10, 1);
    c.save(); c.translate(-2, -1); c.rotate(Math.PI / 2); torso(c, 7, -9); c.restore();
    limbOf(c, -6, -4, -2, -12, 3.6, SUIT); glove(c, -1.6, -13.4, 2.2); limbOf(c, -8, 0, -14, 4, 3.6, SUIT); glove(c, -15, 4.6, 2.2);
    helmet(c, -15, -4, false, f);
  } else if (pose === 'tumble') {
    limbOf(c, -2.6, -12, -10, -2, 4, SUIT); limbOf(c, 2.6, -12, 12, -4, 4, SUIT);
    boot(c, -10.6, 1, -1); boot(c, 13, -1.6, 1);
    torso(c, -11, -28);
    limbOf(c, -5, -25, -14, -32, 3.6, SUIT); glove(c, -14.6, -32.6, 2.2);
    limbOf(c, 5, -25, 14, -18, 3.6, SUIT); glove(c, 14.8, -17.4, 2.2);
    helmet(c, 0, -35, true, f);
  } else {
    // (up on his feet: legs planted, the helmet under his near arm, the other arm a thumbs-up, then the wave)
    const cyc = f % 72, waving = cyc >= 24, ph = Math.floor((cyc - 24) / 6) % 4, bob = waving && ph % 2 ? -0.5 : 0;
    c.translate(0, bob);
    boot(c, -4.4, 0, -1); boot(c, 4.4, 0, 1);
    limbOf(c, -2.6, -18, -4, -4, 4.4, SUIT); limbOf(c, 2.6, -18, 4, -4, 4.4, SUIT);
    // (the knee's torn out: a scrape on it)
    ell(c, -3.4, -10, 1.6, 1.4, SKIN[1]); ell(c, -3.4, -10, 1, 0.8, '#C2410C');
    torso(c, -17, -34);
    // (the near arm holding the helmet against his hip)
    limbOf(c, -5.4, -32, -8.6, -24, 3.6, SUIT); helmet(c, -9, -20, false, f); limbOf(c, -8.6, -24, -4, -19, 3.4, SUIT); glove(c, -3.6, -18.6, 2.2);
    // (the far arm: thumbs up, held; then a wave, the forearm rocking in steps)
    const ex = 9, ey = -40;
    limbOf(c, 5.4, -32, ex, ey, 3.6, SUIT);
    if (!waving) {
      limbOf(c, ex, ey, ex + 2, ey - 7, 3.4, SUIT);
      glove(c, ex + 2.2, ey - 8.4, 2.6); px(c, ex + 1.2, ey - 14.6, 2.2, 4.4, INK); px(c, ex + 1.6, ey - 14.2, 1.4, 3.6, '#27272A'); px(c, ex + 1.6, ey - 14.2, 0.6, 1.4, '#52525B');
    } else {
      const a = [-0.55, -0.05, 0.45, -0.05][ph], hx = ex + Math.sin(a) * 8, hy = ey - Math.cos(a) * 8;
      limbOf(c, ex, ey, hx, hy, 3.4, SUIT);
      c.save(); c.translate(hx, hy); c.rotate(a);
      ell(c, 0, -1.6, 3.4, 3, INK); ell(c, 0, -1.6, 2.7, 2.3, '#27272A');
      for (let k = 0; k < 4; k++) { px(c, -2.4 + k * 1.5, -6.4, 1.3, 4, INK); px(c, -2.2 + k * 1.5, -6.2, 0.9, 3.6, k === 0 ? '#52525B' : '#27272A'); }
      px(c, 2.6, -3.4, 2.4, 1.3, INK);
      c.restore();
      // (motion ticks off the waving hand)
      ln(c, [hx - 5, hy - 4, hx - 7, hy - 6], 0.6, '#F8FAFC'); ln(c, [hx + 5, hy - 4, hx + 7, hy - 6], 0.6, '#F8FAFC');
    }
    bareHead(c, 0, -41, f);
  }
  c.restore();
};
