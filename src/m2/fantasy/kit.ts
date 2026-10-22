// Fairy Land's painting kit, crude (the prototype first pass: flat colors in a few steps, simple shapes, readable
// silhouettes; peak-SNES comes later): the land's storybook signs (a carved, painted shingle hung off a wrought-iron
// bracket on a post, the letters in gilt: the park's alphabet, signLetters.ts), the sky by the hour over the far snowy
// hills with the GREAT PIXIE'S CASTLE among them (monument.ts: bigger every section), and small helpers.

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import { mix } from '../../m1/game/render/backdrops/core';
import { drawTodSky, timeOfDay, farTint, hourMix, hourly } from '../timeOfDay';
import { signText, signW, type Look } from '../signLetters';
import { box } from '../adventure/section';
import { stamp, checker } from '../intro/art/kit';
import { at, atDepth, viewOf, type View } from '../spooky/town/paint';
import { drawMonument, type MonumentAt } from './monument';

export type Ctx = CanvasRenderingContext2D;
export { box, mix, checker };

/** A repeatable 0..1 noise off a number. */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Ink (the outline every shape gets). */
export const INK = '#1A1028';

/** Gilt letters (the storybook's): gold in steps, a dark outline, a drop shadow, serifs. `cell` the letters' cell. */
export const gilt = (cell = 2): Look => ({ sx: cell, sy: cell, gap: 2, serif: true, fill: ['#FFF6C8', '#F6D365', '#E0AE3A', '#B07A1E'], dither: true, ink: '#3A2208', shadow: '#120A1E' });
/** Painted on (a warning's): white on red, a shadow. */
export const paintedOn = (cell = 2, col = '#FFF7E8'): Look => ({ sx: cell, sy: cell, fill: [mix(col, '#FFFFFF', 0.3), col, col, mix(col, '#000000', 0.2)], dither: true, shadow: '#2A0A0A' });

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');

/**
 * A storybook sign standing at (x, feetY) (world space): a carved shingle (a scalloped top, a painted field, a gilt
 * border) hung on two chains off a wrought-iron bracket (its scroll, a finial) on a post sunk in a stone footing. The
 * letters in gilt (`warn`: painted white on a red field). `lines` top to bottom, the first big. `board` the field's
 * color. Painted once for the hour (a stamp).
 */
export const storySign = (c: Ctx, x: number, feetY: number, lines: string[], opts: { board?: string; warn?: boolean; tall?: number; big?: number; seed?: number } = {}) => {
  const big = opts.big ?? 2, warn = !!opts.warn;
  const looks = lines.map((_, i) => (warn ? paintedOn(i ? 1 : big) : gilt(i ? 1 : big)));
  const w = Math.max(80, ...lines.map((l, i) => signW(l, looks[i]) + 26)), lh = lines.map((_, i) => 7 * (i ? 1 : big) + (i ? 6 : 8));
  const h = lh.reduce((a, b) => a + b, 0) + 14, tall = opts.tall ?? 120;
  const board = opts.board ?? (warn ? '#9B1C1C' : '#1E3A6E');
  const key = `fasign-${lines.join('|')}-${warn ? 1 : 0}-${board}-${tall}-${big}-${timeOfDay().key}-${fontReady() ? 'f' : 'n'}`;
  // (the post stands at the left; the shingle hangs off the bracket out to the right of it, centered on x)
  const postX = -w / 2 - 14, top = -tall, hangY = top + 26;
  c.save(); c.translate(Math.round(x), Math.round(feetY));
  stamp(c, key, postX - 16, top - 20, w + 60, tall + 24, g => {
    const tod = timeOfDay(), T = (col: string) => farTint(col, 0.15, tod);
    // (the stone footing, the post: an iron lamp-post sort of thing, fluted, a ball finial)
    box(g, postX - 9, -10, 22, 10, INK); box(g, postX - 8, -9, 20, 9, T('#8A8494')); box(g, postX - 8, -9, 20, 2, T('#B8B2C2'));
    box(g, postX - 1, top - 6, 8, tall - 4, INK); box(g, postX, top - 5, 6, tall - 6, T('#2E2A3A')); box(g, postX, top - 5, 2, tall - 6, T('#5A546A'));
    g.fillStyle = INK; g.beginPath(); g.arc(postX + 3, top - 9, 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = T('#E0AE3A'); g.beginPath(); g.arc(postX + 3, top - 9, 4, 0, Math.PI * 2); g.fill(); box(g, postX + 1, top - 12, 2, 2, '#FFF6C8');
    // (the bracket: an iron arm out to the right, a curl under it)
    box(g, postX + 6, top + 6, w + 14, 4, INK); box(g, postX + 6, top + 7, w + 13, 2, T('#3A3448'));
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(postX + 6, top + 26); g.quadraticCurveTo(postX + 30, top + 26, postX + 34, top + 9); g.stroke();
    g.strokeStyle = T('#4A445A'); g.lineWidth = 1.4; g.beginPath(); g.moveTo(postX + 6, top + 26); g.quadraticCurveTo(postX + 30, top + 26, postX + 34, top + 9); g.stroke();
    // (the two chains)
    for (const cx of [-w / 2 + 10, w / 2 - 10]) for (let y = top + 10; y < hangY; y += 4) { box(g, cx - 1, y, 3, 3, INK); box(g, cx, y + 1, 1, 1, T('#A8A2B4')); }
    // (the shingle: a scalloped top, the field, a gilt border, the shade under)
    const sy = hangY, B = T(board);
    g.fillStyle = INK; g.beginPath(); g.moveTo(-w / 2 - 1, sy + 7); g.quadraticCurveTo(-w / 4, sy - 5, 0, sy + 1); g.quadraticCurveTo(w / 4, sy - 5, w / 2 + 1, sy + 7); g.lineTo(w / 2 + 1, sy + h + 1); g.lineTo(-w / 2 - 1, sy + h + 1); g.closePath(); g.fill();
    g.fillStyle = mix(B, '#000000', 0.25); g.beginPath(); g.moveTo(-w / 2, sy + 7); g.quadraticCurveTo(-w / 4, sy - 4, 0, sy + 2); g.quadraticCurveTo(w / 4, sy - 4, w / 2, sy + 7); g.lineTo(w / 2, sy + h); g.lineTo(-w / 2, sy + h); g.closePath(); g.fill();
    box(g, -w / 2 + 3, sy + 8, w - 6, h - 11, B); box(g, -w / 2 + 3, sy + 8, w - 6, 2, mix(B, '#FFFFFF', 0.25));
    const gold = T(warn ? '#F2E8D0' : '#E0AE3A');
    box(g, -w / 2 + 3, sy + 6, w - 6, 1, gold); box(g, -w / 2 + 3, sy + h - 3, w - 6, 1, gold); box(g, -w / 2 + 3, sy + 6, 1, h - 9, gold); box(g, w / 2 - 4, sy + 6, 1, h - 9, gold);
    // (a gilt star at the scallop's dip, little rivets at the corners)
    g.fillStyle = gold; g.beginPath(); g.moveTo(0, sy - 3); g.lineTo(2, sy + 1); g.lineTo(0, sy + 5); g.lineTo(-2, sy + 1); g.closePath(); g.fill();
    for (const [rx, ry] of [[-w / 2 + 6, sy + 10], [w / 2 - 8, sy + 10], [-w / 2 + 6, sy + h - 6], [w / 2 - 8, sy + h - 6]]) box(g, rx, ry, 2, 2, gold);
    // (the letters)
    let ly = sy + 10;
    lines.forEach((l, i) => { signText(g, l, 0, Math.round(ly + lh[i] / 2 + (7 * (i ? 1 : big)) / 2 - 1), looks[i]); ly += lh[i]; });
  });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The SNES kit (the town square's pass brought it in; every section's to use): the land's materials in six-step ramps
// (darkest first), lit from the upper left; colors for the hour (near, or dimmed for scenery so nothing back there reads
// as somewhere to stand); and the view: one eye for the whole scene (Spooky Land's perspective: a thing at depth d stands
// d of the way from the eye to where it'd be at the play plane). Still art is painted once for the hour into a stamp.

/** A material's ramp round a color: shadow, shade, a touch under, itself, lit, highlight. */
export const ramp6 = (col: string) => [mix(col, INK, 0.62), mix(col, INK, 0.36), mix(col, INK, 0.14), col, mix(col, '#FFFFFF', 0.28), mix(col, '#FFFFFF', 0.56)];
/** Hogsmeat's plaster (warm cream), its oak timbers, its slate, the snow on everything. */
export const PLASTER = ['#4A3A34', '#7A6658', '#A89482', '#CDBCA6', '#E6D9C4', '#FAF2E2'];
export const TIMBER = ['#1C100C', '#301E16', '#462C20', '#5E3E2A', '#7C5638', '#9E744E'];
export const SLATE = ['#151526', '#24263E', '#363A58', '#4E5474', '#6C7494', '#929ABA'];
export const SNOW = ['#6E7AA0', '#94A0C4', '#B8C4E0', '#D6E0F2', '#ECF2FC', '#FFFFFF'];
/** The street's cobbles, the pavement's flags, dressed castle stone (a cool lilac), brick. */
export const COBBLE = ['#221E32', '#36304A', '#4C4564', '#655E80', '#837C9E', '#A8A2C0'];
export const FLAG = ['#2C2838', '#454058', '#5E5874', '#79738F', '#9A94AE', '#C0BAD0'];
export const STONE = ['#272140', '#3E375A', '#585076', '#766E94', '#968EB4', '#BEB8D8'];
export const BRICK = ['#2E0E0C', '#511A16', '#7A2A22', '#A03C2E', '#C25A44', '#E08A6E'];
/** Black iron, gilt, gingerbread, royal icing, pine. */
export const IRON = ['#0C0A14', '#18162A', '#26243C', '#36344E', '#4C4A66', '#6C6A88'];
export const GOLD = ['#3A2408', '#6A4410', '#A06C1C', '#D09A30', '#F2C84A', '#FFF0A8'];
export const GINGER = ['#3A1A08', '#5E2E12', '#86461E', '#A8642E', '#C88446', '#E8AC6E'];
export const ICING = ['#9C8CB4', '#C2B6D6', '#E0D8EE', '#F4F0FA', '#FFFFFF', '#FFFFFF'];
export const PINE = ['#0A1816', '#142C28', '#1E423A', '#2A5A4C', '#3E7660', '#62967C'];
/** The lit lip along anything he can stand on: warm, catching the light. */
export const LIP = ['#5A4630', '#A08058', '#F2D79A', '#FFF6D8'];

/** A color for the hour, near (barely into the haze). */
export const hour = hourly((col: string, k = 0.12) => farTint(hourMix(col, mix(col, '#7A4A6A', 0.14), mix(col, '#141832', 0.34)), k));
/** Scenery's (dimmed a step toward the cold air: none of it reads as somewhere to stand). */
export const dimmed = hourly((col: string) => { const tod = timeOfDay(); return mix(mix(farTint(hourMix(col, mix(col, '#5A3A5A', 0.16), mix(col, '#0E1024', 0.4), tod), 0.35, tod), '#4A4660', 0.16), tod.haze, 0.06); });
/** A ramp for the hour, near or dimmed. */
export const rampH = (R: string[], scenery = false) => R.map(scenery ? dimmed : (col: string) => hour(col));
/** After dark (the lamps, the windows). */
export const lit = () => timeOfDay().lamps > 0.35;
/** A warm shop window (lit inside all day: it's winter; brighter after dark). Darkest first. */
export const warmGlass = () => (lit() ? ['#3A1C08', '#7A3E10', '#C0701E', '#F0A83E', '#FFD87A', '#FFF4C8'] : ['#2A1A1A', '#5A3420', '#8E5A2E', '#C0864A', '#E8B874', '#FFF0C8']);
/** The view (the one eye). */
export { at, atDepth, viewOf, type View };
/** Where the shopfronts stand (back from the play plane), and where their sides run back to. */
export const FRONT_D = 0.86, BACK_D = 0.76;

const fontKey = () => (fontReady() ? 'f' : 'n');
/** Still art at world (x, y): painted once (in local coordinates, the box bx, by, bw, bh about (x, y)) for the hour. */
export const still = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `fa-${key}-${timeOfDay().key}-${fontKey()}`, bx, by, bw, bh, paint);
  c.restore();
};
/** Still art standing at world x at depth d (scaled toward the eye). */
export const stillAt = (c: Ctx, v: View, d: number, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  if (d === 1) { still(c, key, x, y, bx, by, bw, bh, paint); return; }
  atDepth(c, v.eye, d, () => still(c, key, x, y, bx, by, bw, bh, paint));
};
/** Is a thing at world x a..b at depth d on screen (by where it's drawn: no pop-in)? */
export const seen = (v: View, a: number, b: number, d = 1, pad = 60) => {
  const [sa] = at(v.eye, a, 0, d), [sb] = at(v.eye, b, 0, d);
  return sb > v.cam.x - pad && sa < v.cam.x + CANVAS_WIDTH + pad;
};
/** A filled polygon (screen or world points). */
export const polyF = (c: Ctx, pts: [number, number][], col: string) => {
  c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
};
/** A wall's side going back from x = e (top..bottom at depth d0) to depth d1, if the eye's past that end: in steps,
 *  darker going back, inked along its far edge, a lit sliver on its corner. `R` a ramp6. */
export const sideBack = (c: Ctx, eye: View['eye'], e: number, side: 1 | -1, top: number, bottom: number, d0: number, d1: number, R: string[], steps = 3) => {
  if ((eye.x - e) * side <= 1) return false;
  // (each step runs a quarter step into the next (painted over by it): shared edges left an antialiased hairline that
  // shimmered as he walked)
  for (let i = 0; i < steps; i++) {
    const a = d0 - ((d0 - d1) * i) / steps, b = d0 - ((d0 - d1) * (i + (i < steps - 1 ? 1.25 : 1))) / steps;
    polyF(c, [at(eye, e, top, a), at(eye, e, top, b), at(eye, e, bottom, b), at(eye, e, bottom, a)], R[Math.max(0, 2 - i)]);
  }
  const [x0, t0] = at(eye, e, top, d0), [, b0] = at(eye, e, bottom, d0), [x1, t1] = at(eye, e, top, d1), [, b1] = at(eye, e, bottom, d1);
  box(c, x0 - (side > 0 ? 0 : 1), t0, 1, b0 - t0, R[4]);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, t0); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
  return true;
};
/** A top going back from x0..x1 at height y (depth d0) to d1, if the eye's above it: in bands, lighter at the front. */
export const topBack = (c: Ctx, eye: View['eye'], x0: number, x1: number, y: number, d0: number, d1: number, R: string[], n = 3) => {
  if (eye.y >= y - 1) return false;
  for (let i = 0; i < n; i++) {
    const a = d0 - ((d0 - d1) * i) / n, b = d0 - ((d0 - d1) * (i + (i < n - 1 ? 1.25 : 1))) / n;
    polyF(c, [at(eye, x0, y, a), at(eye, x1, y, a), at(eye, x1, y, b), at(eye, x0, y, b)], R[Math.max(0, 4 - i)]);
  }
  const [ax, ay] = at(eye, x0, y, d1), [bx, by] = at(eye, x1, y, d1);
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  return true;
};
/** A slab (a wall's face), stepped: lit down its left and along its top, shaded down its right (dithered in). */
export const slab = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  box(g, x, y, w, h, R[3]);
  box(g, x, y, 2, h, R[4]); box(g, x, y, w, 2, R[4]);
  box(g, x + w - 4, y, 4, h, R[2]); checker(g, x + w - 8, y, 4, h, R[2], 0, 1);
};
/** A round post, stepped across, inked (`R` a ramp6). */
export const postR = (g: Ctx, x: number, top: number, foot: number, w: number, R: string[]) => {
  const x0 = Math.round(x - w / 2), t = Math.max(1, Math.round(w * 0.3));
  box(g, x0 - 1, top, w + 2, foot - top, INK);
  box(g, x0, top, w, foot - top, R[3]); box(g, x0, top, t, foot - top, R[4]);
  if (w > 3) box(g, x0 + 1, top, 1, foot - top, R[5]);
  box(g, x0 + w - t, top, t, foot - top, R[1]);
};
/** A ball, stepped (`R` a ramp6): ink, shade, itself up and left, lit, a glint. */
export const ballR = (g: Ctx, x: number, y: number, r: number, R: string[], ink = true) => {
  const disc = (dx: number, dy: number, rr: number, col: string) => { if (rr <= 0) return; g.fillStyle = col; g.beginPath(); g.arc(x + dx, y + dy, rr, 0, Math.PI * 2); g.fill(); };
  if (ink) disc(0, 0, r + 1, INK);
  disc(0, 0, r, R[1]); disc(-r * 0.1, -r * 0.1, r * 0.86, R[2]); disc(-r * 0.22, -r * 0.22, r * 0.62, R[3]); disc(-r * 0.35, -r * 0.35, r * 0.3, R[4]);
  if (r > 2) box(g, x - r * 0.45, y - r * 0.5, Math.max(1, r * 0.2), Math.max(1, r * 0.2), R[5]);
};
/** Snow heaped along a top (x..x+w at y): a lumpy cap in steps, overhanging a little, icicles under its lip. */
export const snowCap = (g: Ctx, x: number, y: number, w: number, depth: number, seed: number, S = SNOW, icicles = true) => {
  const lump = (i: number) => Math.round((hash(seed + i * 1.7) - 0.3) * depth * 0.6);
  box(g, x - 3, y - depth - 1, w + 6, depth + 3, INK);
  for (let k = 0; k < w + 4; k += 6) { const t = depth + lump(k); box(g, x - 2 + k, y - t - 1, Math.min(6, w + 4 - k), t + 1, INK); }
  box(g, x - 2, y - depth, w + 4, depth + 1, S[3]);
  for (let k = 0; k < w + 4; k += 6) { const t = depth + lump(k); box(g, x - 2 + k, y - t, Math.min(6, w + 4 - k), t - depth + 1, S[4]); box(g, x - 2 + k, y - t, Math.min(3, w + 4 - k), 1, S[5]); }
  box(g, x - 2, y - depth, w + 4, 1, S[5]);
  box(g, x - 2, y - 1, w + 4, 2, S[2]); checker(g, x - 2, y - 3, w + 4, 2, S[2], 0, 1);
  if (icicles) for (let k = 3; k < w - 2; k += 5 + Math.floor(hash(seed + k) * 6)) { const l = 2 + Math.floor(hash(seed * 3 + k) * 7); box(g, x + k, y + 1, 2, l, S[2]); box(g, x + k, y + 1, 1, l - 1, S[5]); }
};

/** Is world x0..x1 on screen (with a margin)? */
export const onScreen = (state: GameState, x0: number, x1: number, m = 60) => x1 > state.camera.x - m && x0 < state.camera.x + CANVAS_WIDTH + m;

/**
 * Screen space: the sky by the hour (a storybook blue, a pink blush low down), far snowy hills, THE GREAT PIXIE'S
 * CASTLE on its crag among them (monument.ts: at this section's size, `castle`), nearer pine-dark hills, scrolling slow.
 * For the stubs and as the sections' far layers.
 */
export const fairySky = (c: Ctx, state: GameState, castle: MonumentAt | null, opts: { near?: string } = {}) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  drawTodSky(c, 0, 0, W, H, ['#23307A', '#3A55B4', '#6E8EDC', '#A8C4F0', '#E8D4F0', '#F8C8D8'], { horizon: 430, sun: [620, 120], moon: [170, 90] });
  const tod = timeOfDay();
  // (far hills: rounded, snow along their tops)
  const far = farTint('#7C86B4', 0.8, tod), snow = farTint('#EEF2FA', 0.6, tod);
  const off = -((state.camera.x * 0.04) % 560);
  for (let k = -1; k < 3; k++) {
    const bx = off + k * 560;
    c.fillStyle = far; c.beginPath(); c.moveTo(bx, 440);
    for (let i = 0; i <= 14; i++) c.lineTo(bx + i * 40, 360 - Math.sin(i * 0.7 + k) * 26 - (i % 3) * 8);
    c.lineTo(bx + 560, 440); c.closePath(); c.fill();
    c.fillStyle = snow;
    for (let i = 0; i < 14; i++) { const x = bx + i * 40, y = 360 - Math.sin(i * 0.7 + k) * 26 - (i % 3) * 8; c.fillRect(Math.round(x - 6), Math.round(y), 22, 4); }
  }
  // (the castle, on its crag, between the far hills and the near ones)
  if (castle) drawMonument(c, state, castle);
  // (nearer: dark pine hills, snow caught on them)
  const near = farTint(opts.near ?? '#2A3E4A', 0.5, tod);
  const off2 = -((state.camera.x * 0.12) % 640);
  for (let k = -1; k < 3; k++) {
    const bx = off2 + k * 640;
    c.fillStyle = near; c.beginPath(); c.moveTo(bx, 460);
    for (let i = 0; i <= 32; i++) c.lineTo(bx + i * 20, 412 + Math.sin(i * 0.9 + k * 2) * 10 - (i % 2) * 14);
    c.lineTo(bx + 640, 460); c.closePath(); c.fill();
    c.fillStyle = farTint('#DCE4F2', 0.5, tod);
    for (let i = 0; i < 32; i += 2) c.fillRect(Math.round(bx + i * 20 - 2), Math.round(412 + Math.sin(i * 0.9 + k * 2) * 10 - 14), 4, 2);
  }
  box(c, 0, 454, W, H - 454, mix(near, '#000000', 0.25));
  return true;
};
