// The dirt-bike chase's art, crude (the prototype first pass: flat colors, simple shapes, readable silhouettes; banded
// a little, the Genesis way): the roadside things, each painted once onto a little canvas and drawn scaled (cropped at
// the crest of a hill in front of it), and the riders seen from behind, Road Rash's way (Meathead, the teens, Tucker),
// drawn straight onto the low-res road canvas at their scale.
//
// Riders are drawn in "art units": the bike's ground point at the origin, about 80 units to the top of the rider's
// head; px per unit is the slot's scale times ART (world units per art unit) times K.

import { mix } from '../kit';
import { lookOf, type Look } from '../../adventure/temple/people';
import { teenOf, bikeColor, type Teen } from '../woods/teens';
import { drawTuckerCloseup, type TuckerWounds } from '../tucker';
import { signText, signW } from '../../signLetters';
import { painted } from '../kit';
import { SPR, type SprKind } from './road';

type Ctx = CanvasRenderingContext2D;
export const INK = '#140C06';
/** World units per art unit (a rider's 80 units is 440 world units tall). */
export const ART = 5.5;

const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); c.fill(); };
const poly = (c: Ctx, col: string, pts: number[]) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
const line = (c: Ctx, col: string, w: number, pts: number[]) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke(); c.lineCap = 'butt'; };

// ---------------------------------------------------------------------------------------------------------------
// The roadside things: painted once each (per variant), at `res` world units per px, their feet at the bottom middle

const cache = new Map<string, HTMLCanvasElement>();
/** World units per canvas px, by kind (the signs finer, for their words). */
const RES: Partial<Record<SprKind, number>> = { slow: 5, sign: 4, health: 5, mailbox: 6, post: 6 };
const resOf = (k: SprKind) => RES[k] ?? 10;
/** How many looks each kind has (by its seed). */
const VARIANTS: Partial<Record<SprKind, number>> = { pine: 3, oak: 2, cow: 3, deer: 2, bush: 2, boulder: 2, deadcow: 3, deaddeer: 2, teentree: 4, hay: 1, tractor: 2 };

const painters: Record<SprKind, (c: Ctx, w: number, h: number, v: number, words?: string) => void> = {
  pine: (c, w, h, v) => {
    box(c, w / 2 - 3, h - 26, 6, 26, '#4A2E18'); box(c, w / 2 - 3, h - 26, 2, 26, '#6A4424');
    const g = [['#1E4A26', '#2C6034', '#173A1E'], ['#24522A', '#346A38', '#1A4020'], ['#1C4424', '#2A5A30', '#14361C']][v];
    for (let k = 0; k < 4; k++) {
      const y0 = h - 22 - k * (h - 30) / 4.4, hw = (w / 2 - 2) * (1 - k * 0.2), th = (h - 30) / 3;
      poly(c, g[2], [w / 2 - hw, y0, w / 2, y0 - th, w / 2 + hw, y0]);
      poly(c, g[0], [w / 2 - hw + 2, y0 - 1, w / 2, y0 - th + 2, w / 2 + hw - 4, y0 - 1]);
      poly(c, g[1], [w / 2 - hw + 4, y0 - 2, w / 2 - 1, y0 - th + 4, w / 2 - hw * 0.3, y0 - 2]);
    }
  },
  oak: (c, w, h, v) => {
    box(c, w / 2 - 5, h - 50, 10, 50, '#4A3020'); box(c, w / 2 - 5, h - 50, 3, 50, '#6A4830');
    const g = v ? ['#2E5A22', '#3E7030', '#22461A'] : ['#3A6626', '#4C7E34', '#2A501C'];
    for (const [x, y, r] of [[-22, -70, 26], [20, -74, 28], [0, -96, 32], [-8, -60, 22], [14, -56, 20]]) ell(c, w / 2 + x, h + y, r, r * 0.9, g[2]);
    for (const [x, y, r] of [[-22, -72, 22], [20, -76, 24], [0, -98, 28], [-8, -62, 18]]) ell(c, w / 2 + x, h + y, r, r * 0.85, g[0]);
    for (const [x, y, r] of [[-26, -80, 10], [12, -84, 12], [-6, -106, 14]]) ell(c, w / 2 + x, h + y, r, r * 0.8, g[1]);
  },
  teentree: (c, w, h, v, words) => {
    painters.oak(c, w, h, 0, words);
    // (a kid folded backward round the trunk, bat and all: the legs one side, the head the other, blood down the bark)
    const L = lookOf(1000 + v * 37, v % 2 === 0), y = h - 30;
    box(c, w / 2 - 6, y - 4, 12, 34, '#8A1414');
    line(c, L.pants, 6, [w / 2 - 6, y, w / 2 - 16, y + 6, w / 2 - 22, y + 2]);
    line(c, L.pants, 6, [w / 2 - 6, y + 2, w / 2 - 14, y + 12, w / 2 - 24, y + 12]);
    box(c, w / 2 - 28, y - 1, 6, 5, '#18181B'); box(c, w / 2 - 30, y + 10, 6, 5, '#18181B');
    box(c, w / 2 - 7, y - 8, 14, 10, L.shirt);
    ell(c, w / 2 + 12, y + 4, 6, 6, L.skin);
    box(c, w / 2 + 6, y - 2, 12, 4, v % 2 === 0 ? L.hair : '#DC2626');
    box(c, w / 2 + 10, y + 3, 2, 2, INK); box(c, w / 2 + 14, y + 3, 2, 2, INK);
    line(c, L.skin, 3, [w / 2 + 6, y + 8, w / 2 + 12, y + 18]);
    box(c, w / 2 - 2, y + 4, 3, 26, '#A01818');
  },
  bush: (c, w, h, v) => {
    const g = v ? ['#2A5226', '#3C6A30'] : ['#3A5E22', '#4E7A2E'];
    ell(c, w / 2 - 10, h - 12, 14, 12, g[0]); ell(c, w / 2 + 10, h - 12, 14, 12, g[0]); ell(c, w / 2, h - 20, 15, 13, g[0]);
    ell(c, w / 2 - 6, h - 22, 7, 6, g[1]); ell(c, w / 2 + 8, h - 16, 6, 5, g[1]);
  },
  boulder: (c, w, h, v) => {
    poly(c, '#4E4E52', [2, h, 6, h - 26, 18, h - 40, 40, h - 44, 56, h - 30, w - 2, h]);
    poly(c, v ? '#7A7A80' : '#6E6A64', [6, h - 2, 9, h - 25, 20, h - 37, 38, h - 40, 52, h - 29, w - 6, h - 2]);
    poly(c, v ? '#9A9AA0' : '#8E8A82', [12, h - 24, 22, h - 34, 36, h - 36, 30, h - 28]);
  },
  post: (c, w, h) => { box(c, 1, 0, w - 2, h, '#4A321E'); box(c, 1, 0, 3, h, '#6E4E30'); box(c, 0, 6, w, 2, '#9CA3AF'); box(c, 0, 20, w, 2, '#9CA3AF'); },
  mailbox: (c, w, h) => {
    box(c, w / 2 - 2, 14, 4, h - 14, '#4A321E');
    box(c, 2, 2, w - 4, 14, '#6B7280'); ell(c, w / 2, 4, w / 2 - 2, 3, '#9CA3AF'); box(c, 3, 6, w - 6, 2, '#D1D5DB');
    box(c, w - 5, 0, 3, 8, '#DC2626');
  },
  hay: (c, w, h) => {
    ell(c, w / 2, h - 16, 19, 16, '#B08A30'); ell(c, w / 2, h - 16, 16, 13, '#D8B04A');
    c.strokeStyle = '#A0802C'; c.lineWidth = 1; c.beginPath(); for (let a = 0; a < 14; a += 0.4) { const r = a * 1.1; c.lineTo(w / 2 + Math.cos(a) * r, h - 16 + Math.sin(a) * r * 0.85); } c.stroke();
  },
  outhouse: (c, w, h) => {
    poly(c, '#5A3A1E', [0, 10, w / 2, 0, w, 10]);
    box(c, 2, 10, w - 4, h - 10, '#7A5430'); for (let x = 4; x < w - 4; x += 6) box(c, x, 10, 1, h - 10, '#5A3C20');
    box(c, 7, 18, w - 14, h - 20, '#8A6038');
    c.fillStyle = '#F5E6A0'; c.beginPath(); c.arc(w / 2, 26, 4, 0.6, Math.PI * 1.7); c.arc(w / 2 + 2, 25, 3, Math.PI * 1.6, 0.7, true); c.fill();
    box(c, w - 12, h / 2 + 6, 2, 3, '#D4D4D8');
  },
  tractor: (c, w, h, v) => {
    const body = v ? '#B91C1C' : '#3F7A2A', dk = mix(body, '#000000', 0.35);
    ell(c, 24, h - 22, 22, 22, '#1C1C1C'); ell(c, 24, h - 22, 12, 12, '#E4B020'); ell(c, 24, h - 22, 4, 4, '#1C1C1C');
    ell(c, w - 16, h - 12, 12, 12, '#1C1C1C'); ell(c, w - 16, h - 12, 6, 6, '#E4B020');
    box(c, 30, h - 40, w - 46, 18, body); box(c, 30, h - 40, w - 46, 3, mix(body, '#FFFFFF', 0.3)); box(c, 30, h - 25, w - 46, 3, dk);
    box(c, 10, h - 62, 26, 4, dk); box(c, 12, h - 58, 3, 18, '#1C1C1C'); box(c, 32, h - 58, 3, 18, '#1C1C1C');
    box(c, w - 34, h - 52, 3, 14, '#3A3A3A');
  },
  slow: (c, w, h) => {
    box(c, w / 2 - 2, 40, 4, h - 40, '#9CA3AF');
    box(c, 0, 0, w, 42, '#111111'); box(c, 2, 2, w - 4, 38, '#FACC15');
    const L = painted(1, '#111111', 'transparent');
    signText(c, 'SLOW', w / 2, 17, { ...L, shadow: undefined });
    signText(c, 'CHILDREN', w / 2, 33, { ...L, shadow: undefined });
  },
  sign: (c, w, h, _v, words) => {
    const text = words ?? '';
    for (const px of [w * 0.22, w * 0.72]) { box(c, px, 50, 8, h - 50, '#4A321E'); box(c, px, 50, 3, h - 50, '#6E4E30'); }
    // (a county's brown sign, routed white letters: real-world, not the park's)
    box(c, 2, 4, w - 4, 56, '#2A1A0E'); box(c, 4, 6, w - 8, 52, '#6B4423'); box(c, 7, 9, w - 14, 46, '#7A4E28');
    const L = { ...painted(text.length > 10 ? 2 : 3, '#F4EAD0', '#2A1A0E') };
    const sw = signW(text, L);
    const look = sw > w - 20 ? { ...painted(2, '#F4EAD0', '#2A1A0E') } : L;
    signText(c, text, w / 2, 42, look);
  },
  cow: (c, w, h, v) => {
    const hide = v === 2 ? '#7A4A26' : '#F4F1EA', spot = v === 2 ? '#5A3418' : '#1C1C1C';
    for (const x of [10, 18, w - 18, w - 12]) box(c, x, h - 14, 4, 14, hide);
    box(c, 6, h - 34, w - 18, 22, hide);
    if (v !== 2) { ell(c, 20, h - 26, 8, 6, spot); ell(c, 40, h - 22, 7, 7, spot); ell(c, 30, h - 30, 5, 3, spot); }
    ell(c, 26, h - 12, 5, 3, '#F0A8B0');
    box(c, w - 16, h - 40, 14, 14, hide); box(c, w - 4, h - 32, 4, 6, '#F0A8B0');
    box(c, w - 13, h - 36, 2, 2, INK); box(c, w - 18, h - 42, 3, 3, hide); box(c, w - 6, h - 42, 3, 3, hide);
    line(c, spot, 1.5, [6, h - 32, 2, h - 20]);
  },
  deadcow: (c, w, h, v) => {
    // (on its back, legs straight up, tongue out, an X for an eye, a puddle)
    const hide = v === 2 ? '#7A4A26' : '#F4F1EA', spot = v === 2 ? '#5A3418' : '#1C1C1C';
    ell(c, w / 2, h - 3, w / 2, 4, '#8A1010');
    box(c, 6, h - 20, w - 18, 16, hide);
    if (v !== 2) { ell(c, 20, h - 12, 7, 5, spot); ell(c, 40, h - 14, 6, 5, spot); }
    for (const x of [12, 20, w - 24, w - 16]) box(c, x, h - 38, 3, 18, hide);
    box(c, w - 14, h - 16, 12, 12, hide);
    line(c, INK, 1, [w - 11, h - 13, w - 8, h - 10]); line(c, INK, 1, [w - 8, h - 13, w - 11, h - 10]);
    box(c, w - 3, h - 9, 4, 2, '#E87890');
    ell(c, 26, h - 22, 5, 3, '#F0A8B0');
  },
  deer: (c, w, h, v) => {
    const hide = '#9A6A3A', lt = '#C8A070';
    for (const x of [10, 16, w - 16, w - 11]) box(c, x, h - 18, 3, 18, hide);
    box(c, 6, h - 34, w - 18, 18, hide); box(c, 8, h - 20, w - 22, 4, lt);
    box(c, 2, h - 34, 6, 6, '#F4F1EA');
    box(c, w - 16, h - 46, 8, 14, hide); box(c, w - 14, h - 50, 12, 8, hide); box(c, w - 4, h - 46, 3, 3, INK); box(c, w - 10, h - 48, 2, 2, INK);
    if (v) { line(c, '#D8C8A0', 1.5, [w - 12, h - 50, w - 16, h - 58, w - 20, h - 62]); line(c, '#D8C8A0', 1.5, [w - 8, h - 50, w - 6, h - 58, w - 2, h - 62]); line(c, '#D8C8A0', 1.5, [w - 16, h - 58, w - 12, h - 62]); }
  },
  deaddeer: (c, w, h, v) => {
    const hide = '#9A6A3A';
    ell(c, w / 2, h - 3, w / 2, 4, '#8A1010');
    box(c, 6, h - 18, w - 16, 14, hide);
    for (const x of [12, 18, w - 20, w - 14]) box(c, x, h - 32, 2, 14, hide);
    box(c, w - 12, h - 14, 10, 8, hide);
    line(c, INK, 1, [w - 9, h - 13, w - 6, h - 10]); line(c, INK, 1, [w - 6, h - 13, w - 9, h - 10]);
    if (v) line(c, '#D8C8A0', 1.5, [w - 6, h - 14, w + 0, h - 20]);
  },
  pylon: (c, w, h) => {
    c.strokeStyle = '#5A5E62'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(4, h); c.lineTo(w / 2 - 4, 30); c.moveTo(w - 4, h); c.lineTo(w / 2 + 4, 30); c.stroke();
    c.lineWidth = 1; c.beginPath();
    for (let y = h; y > 40; y -= 24) { const k = (h - y) / (h - 30), hw = (w / 2 - 4) * (1 - k) + 4; c.moveTo(w / 2 - hw, y); c.lineTo(w / 2 + hw * 0.9, y - 24); c.moveTo(w / 2 + hw, y); c.lineTo(w / 2 - hw * 0.9, y - 24); }
    c.stroke();
    c.lineWidth = 3; c.beginPath(); c.moveTo(4, 34); c.lineTo(w - 4, 34); c.moveTo(14, 60); c.lineTo(w - 14, 60); c.stroke();
    for (const x of [6, w - 8, 16, w - 18]) box(c, x, x < w / 2 && x > 10 ? 60 : 34, 2, 8, '#B8C0C8');
  },
  pole: (c, w, h) => { box(c, w / 2 - 3, 0, 6, h, '#5A3E26'); box(c, w / 2 - 3, 0, 2, h, '#7A5634'); box(c, 0, 10, w, 3, '#4A3220'); box(c, 1, 6, 2, 4, '#9CC'); box(c, w - 3, 6, 2, 4, '#9CC'); },
  barn: (c, w, h) => {
    poly(c, '#5A1A12', [0, 60, w / 2, 0, w, 60]);
    box(c, 6, 56, w - 12, h - 56, '#9A2A1E'); box(c, 6, 56, w - 12, 4, '#B8402E');
    box(c, w / 2 - 30, h - 70, 60, 70, '#7A1E14'); line(c, '#E8E0D0', 3, [w / 2 - 30, h - 70, w / 2 + 30, h, w / 2 + 30, h - 70, w / 2 - 30, h, w / 2 - 30, h - 70, w / 2 + 30, h - 70]);
    box(c, w / 2 - 10, 30, 20, 18, '#E8E0D0');
  },
  house: (c, w, h) => {
    poly(c, '#3A3A44', [0, 50, w / 2, 4, w, 50]);
    box(c, 10, 48, w - 20, h - 48, '#E8E4DC'); for (let y = 54; y < h; y += 6) box(c, 10, y, w - 20, 1, '#C8C4BC');
    for (const x of [30, w - 60]) { box(c, x, 70, 28, 30, '#3A5A7A'); box(c, x, 70, 28, 2, '#FFFFFF'); }
    box(c, w / 2 - 12, h - 44, 24, 44, '#7A3A2A');
    box(c, w - 50, 0, 14, 30, '#7A3A2A');
  },
  reeds: (c, w, h) => { for (let i = 0; i < 7; i++) { const x = 3 + i * 4; line(c, i % 2 ? '#4A7A2E' : '#5E8E36', 1.5, [x, h, x + (i - 3), 6 + (i % 3) * 4]); if (i % 3 === 0) box(c, x + (i - 3) - 1, 4 + (i % 3) * 4, 3, 7, '#6A3E1E'); } },
  rock: (c, w, h) => { poly(c, '#5A5A5E', [1, h, 4, 4, 14, 0, w - 4, 3, w - 1, h]); poly(c, '#8A8A90', [5, h - 2, 7, 5, 14, 3, 18, 6, 10, h - 2]); },
  log: (c, w, h) => {
    box(c, 6, 1, w - 12, h - 2, '#5A3A1E'); box(c, 6, 2, w - 12, 3, '#7A5430'); box(c, 6, h - 4, w - 12, 2, '#3E2612');
    for (let x = 20; x < w - 20; x += 23) box(c, x, 4, 6, 1, '#4A2E16');
    ell(c, 6, h / 2, 6, h / 2, '#4A2E16'); ell(c, 6, h / 2, 4, h / 2 - 2, '#C8A070'); ell(c, w - 6, h / 2, 6, h / 2, '#C8A070');
  },
  stump: (c, w, h) => { box(c, 2, 4, w - 4, h - 4, '#5A3A1E'); ell(c, w / 2, 4, w / 2 - 2, 3, '#C8A070'); ell(c, w / 2, 4, 4, 1.5, '#8A6A40'); },
  health: (c, w, h) => {
    // (a first-aid kit somebody dropped: white, the red cross, a handle)
    box(c, 2, 8, w - 4, h - 8, '#1C1C1C'); box(c, 4, 10, w - 8, h - 12, '#F4F4F4'); box(c, 4, 10, w - 8, 3, '#FFFFFF');
    box(c, w / 2 - 3, 13, 6, h - 18, '#DC2626'); box(c, w / 2 - 10, h / 2 + 1, 20, 6, '#DC2626');
    box(c, w / 2 - 6, 3, 12, 6, '#1C1C1C'); box(c, w / 2 - 4, 5, 8, 3, '#F4F4F4');
  },
  scorch: (c, w, h) => { ell(c, w / 2, h / 2, w / 2, h / 2, '#1A1410'); ell(c, w / 2 - 10, h / 2, w / 4, h / 3, '#2E241A'); for (let i = 0; i < 6; i++) box(c, 10 + i * 13, 2 + (i % 3) * 1.5, 2, 2, '#F97316'); },
};

const sprCanvas = (k: SprKind, seed: number, words?: string) => {
  const v = (VARIANTS[k] ?? 1) > 1 ? Math.abs(seed) % (VARIANTS[k] ?? 1) : 0;
  const key = k + v + (words ?? '');
  let cv = cache.get(key);
  if (!cv) {
    const d = SPR[k], res = resOf(k);
    cv = document.createElement('canvas');
    cv.width = Math.max(4, Math.round(d.w / res)); cv.height = Math.max(4, Math.round(d.h / res));
    const c = cv.getContext('2d')!;
    painters[k](c, cv.width, cv.height, v, words);
    cache.set(key, cv);
  }
  return cv;
};

/** A roadside thing at screen (sx, sy) (its feet), at slot scale sc, cropped at the clip line. `flip` mirrors it. */
export const drawSpr = (c: Ctx, k: SprKind, seed: number, sx: number, sy: number, sc: number, clip: number, words?: string, flip = false) => {
  const cv = sprCanvas(k, seed, words), d = SPR[k];
  const dw = d.w * sc * 200, dh = d.h * sc * 200;
  if (dw < 0.6 || dh < 0.6) return;
  let x = sx - dw / 2, y = sy - dh, srcH = cv.height, hh = dh;
  if (y + dh > clip) { const over = y + dh - clip; if (over >= dh) return; hh = dh - over; srcH = Math.max(1, cv.height * (hh / dh)); }
  if (flip) { c.save(); c.translate(sx, 0); c.scale(-1, 1); x = -dw / 2; c.drawImage(cv, 0, 0, cv.width, srcH, x, y, dw, hh); c.restore(); }
  else c.drawImage(cv, 0, 0, cv.width, srcH, x, y, dw, hh);
};

// ---------------------------------------------------------------------------------------------------------------
// Bikes from behind

/** A dirt bike from behind (art units, ground point at the origin): the rear knobby, the fender up over it, the side
 *  panels, the seat, the exhaust out the right, the bars wide at the top. `spin` turns the tread. */
export const rearBike = (c: Ctx, color: string, spin: number, wreck = false) => {
  const dk = mix(color, '#000000', 0.35), lt = mix(color, '#FFFFFF', 0.3);
  // (the tire, the tread knobs going round)
  box(c, -7, -22, 14, 22, INK); box(c, -6, -21, 12, 20, '#2A2A2E');
  const o = (spin * 6) % 4;
  for (let y = -20 + o; y < 0; y += 4) box(c, -5, y, 10, 1.5, '#4A4A50');
  // (the exhaust out the right, the swingarm)
  box(c, 6, -30, 6, 4, INK); box(c, 7, -29, 4, 2, '#A1A1AA'); ell(c, 12, -28, 2, 2, '#18181B');
  box(c, -9, -24, 18, 3, '#3F3F46');
  // (the side panels and the rear fender up over the wheel, the number plate under the seat)
  poly(c, INK, [-14, -36, 14, -36, 10, -24, -10, -24]); poly(c, color, [-13, -35, 13, -35, 9.5, -25, -9.5, -25]);
  box(c, -13, -35, 26, 2, lt); box(c, -9, -27, 18, 2, dk);
  poly(c, INK, [-6, -40, 6, -40, 8, -28, -8, -28]); poly(c, wreck ? dk : color, [-5, -39, 5, -39, 7, -29, -7, -29]);
  box(c, -3, -33, 6, 3, '#DC2626');
  // (the seat on top)
  box(c, -7, -42, 14, 4, '#18181B');
};
/** The bars, wide, the grips (drawn over the rider's hands). */
export const rearBars = (c: Ctx, y = -58) => { line(c, INK, 2.6, [-22, y, -8, y + 3, 8, y + 3, 22, y]); line(c, '#3F3F46', 1.4, [-22, y, -8, y + 3, 8, y + 3, 22, y]); box(c, -24, y - 2, 5, 4, '#18181B'); box(c, 19, y - 2, 5, 4, '#18181B'); };

// ---------------------------------------------------------------------------------------------------------------
// The teens' weapons

export type Weapon = 'chain' | 'bat' | 'crowbar' | 'nunchucks' | 'hockey' | 'skateboard';
/** A weapon in a fist at (x, y), pointing along `a` (radians, 0 = right), `flash` white (the tell). */
export const drawWeapon = (c: Ctx, w: Weapon, x: number, y: number, a: number, flash: boolean, f: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  const W = flash ? '#FFFFFF' : null;
  switch (w) {
    case 'chain': {
      // (a greasy bike chain, swinging: links in a sagging arc)
      for (let i = 0; i < 9; i++) { const t = i / 8, px = t * 26, py = Math.sin(t * Math.PI) * 5 * Math.sin(f * 0.4); box(c, px - 1.5, py - 1.5, 3, 3, W ?? (i % 2 ? '#52525B' : '#A1A1AA')); }
      break;
    }
    case 'bat': poly(c, INK, [0, -2, 26, -3.5, 27, 3.5, 0, 2]); poly(c, W ?? '#C0C4CC', [1, -1.2, 25.5, -2.6, 26, 2.6, 1, 1.2]); box(c, -2, -2, 4, 4, W ?? '#18181B'); box(c, 14, -2, 10, 1, '#FFFFFF'); break;
    case 'crowbar': line(c, INK, 3.4, [0, 0, 22, 0, 26, -4, 24, -6]); line(c, W ?? '#B91C1C', 2, [0, 0, 22, 0, 26, -4, 24, -6]); break;
    case 'nunchucks': {
      box(c, -1, -1.5, 12, 3, W ?? '#3A2A1A'); const sw = Math.sin(f * 0.5) * 0.8;
      line(c, '#A1A1AA', 1, [11, 0, 15, Math.sin(sw) * 3]);
      c.save(); c.translate(15, Math.sin(sw) * 3); c.rotate(sw); box(c, 0, -1.5, 12, 3, W ?? '#3A2A1A'); c.restore();
      break;
    }
    case 'hockey': line(c, INK, 3, [0, 0, 26, 0, 28, 5, 36, 6]); line(c, W ?? '#D6B07A', 1.8, [0, 0, 26, 0, 28, 5, 36, 6]); box(c, 8, -1, 5, 2, '#111111'); break;
    case 'skateboard': poly(c, INK, [0, -4, 28, -4, 31, 0, 28, 4, 0, 4, -3, 0]); poly(c, W ?? '#7C3AED', [0, -3, 28, -3, 30, 0, 28, 3, 0, 3, -2, 0]); box(c, 4, 4, 3, 2, '#F5F5F4'); box(c, 21, 4, 3, 2, '#F5F5F4'); break;
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// A teen from behind, on their bike

export interface TeenLook extends Teen { look: Look; bike: string; heavy: boolean; pony: boolean }
const TEEN_HAIR = ['#1F1611', '#4A2E1A', '#A16207', '#F5D27A', '#7F1D1D', '#111827', '#E8C070'];
export const teenLookOf = (seed: number): TeenLook => {
  const t = teenOf(seed), look = lookOf(seed, t.woman);
  return { ...t, look: { ...look, hair: TEEN_HAIR[Math.floor(seed / 7) % TEEN_HAIR.length], kid: true, bald: false }, bike: bikeColor(seed), heavy: look.heavy, pony: t.woman && Math.floor(seed / 13) % 2 === 0 };
};

export interface RiderPose {
  /** Leaning into a bend (radians). */
  lean: number;
  /** Which side their weapon's on (-1 left, 1 right), and how it's held: down, wound up (the tell), swung out. */
  side: number; arm: 'idle' | 'wind' | 'swing' | 'none';
  /** The tell: flashing white. */
  flash: boolean;
  /** Turned to look at him (-1 left, 0 ahead, 1 right). */
  look: number;
  /** Hit just now: a white flash over the lot. */
  hit: boolean;
  spin: number;
}

/** A teen on their bike from behind, at (x, y) (the ground point) at `s` px per art unit. */
export const drawTeenRider = (c: Ctx, k: TeenLook, weapon: Weapon, p: RiderPose, x: number, y: number, s: number, f: number) => {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(p.lean);
  c.scale(0.92, 0.92);
  rearBike(c, k.bike, p.spin);
  const L = k.look, bw = k.heavy ? 15 : 12;
  // (legs down to the pegs, their shoes)
  line(c, L.pants, 5, [-8, -40, -14, -28, -13, -18]); line(c, L.pants, 5, [8, -40, 14, -28, 13, -18]);
  box(c, -17, -19, 7, 4, '#F5F5F4'); box(c, 10, -19, 7, 4, '#F5F5F4');
  // (the seat of their pants, their back in their shirt)
  box(c, -10, -46, 20, 7, L.pants); box(c, -1, -46, 1, 7, mix(L.pants, '#000000', 0.3));
  poly(c, L.shirt, [-bw, -70, bw, -70, bw - 2, -46, -bw + 2, -46]);
  box(c, -bw, -70, bw * 2, 2, mix(L.shirt, '#FFFFFF', 0.25)); box(c, -1, -66, 2, 18, mix(L.shirt, '#000000', 0.15));
  // (the arms out to the bars; the weapon arm up behind (the wind-up), out at him (the swing), or down at their side)
  const armTo = (side: number, hx: number, hy: number) => { line(c, L.shirt, 5, [side * (bw - 2), -68, (side * (bw - 2) + hx) / 2, (-68 + hy) / 2 + 2]); line(c, L.skin, 3.6, [(side * (bw - 2) + hx) / 2, (-68 + hy) / 2 + 2, hx, hy]); };
  const ws = p.side;
  if (p.arm === 'none' || p.arm === 'idle') { armTo(-1, -21, -58); armTo(1, 21, -58); }
  else armTo(-ws, -ws * 21, -58);
  rearBars(c);
  if (p.arm === 'idle') { armTo(ws, ws * 21, -58); drawWeapon(c, weapon, ws * 21, -58, ws > 0 ? 0.3 : Math.PI - 0.3, false, f); }
  else if (p.arm === 'wind') { armTo(ws, ws * 8, -86); drawWeapon(c, weapon, ws * 8, -86, ws > 0 ? -2.2 : -0.94, p.flash, f); }
  else if (p.arm === 'swing') { armTo(ws, ws * 30, -66); drawWeapon(c, weapon, ws * 30, -66, ws > 0 ? 0.1 : Math.PI - 0.1, false, f); }
  // (the head from behind: a helmet, or hair (a ponytail flying); turned to look at him, a sliver of face and an eye)
  const hy = -80;
  box(c, -4, -73, 8, 4, L.skin);
  if (k.helmet) {
    ell(c, 0, hy, 10, 10, INK); ell(c, 0, hy, 9, 9, k.helmet); box(c, -2, hy - 9, 4, 18, mix(k.helmet, '#000000', 0.3)); box(c, -9, hy - 1, 18, 2, '#18181B');
    if (p.look) { box(c, p.look * 6 - 2, hy, 4, 5, L.skin); box(c, p.look * 7, hy + 1, 2, 2, INK); }
  } else {
    ell(c, 0, hy, 8.5, 9, L.skin);
    ell(c, 0, hy - 2, 9, 8, L.hair);
    if (L.long || k.woman) box(c, -8, hy - 2, 16, 12, L.hair);
    if (k.pony) { const sw = Math.sin(f * 0.3) * 3; line(c, L.hair, 4, [0, hy - 2, sw, hy + 8, sw * 1.6, hy + 16]); }
    if (p.look) { box(c, p.look * 6 - 2, hy - 1, 4, 6, L.skin); box(c, p.look * 7, hy, 2, 2, INK); }
    box(c, -10, hy - 1, 2, 4, L.skin); box(c, 8, hy - 1, 2, 4, L.skin);
  }
  if (p.hit) { c.globalAlpha = 0.55; ell(c, 0, -50, 22, 40, '#FFFFFF'); c.globalAlpha = 1; }
  c.restore();
};

/** A teen off their bike, tumbling or lying face down with their backside up (the undignified way), at `s`. */
export const drawTeenBody = (c: Ctx, k: TeenLook, x: number, y: number, s: number, rot: number, lying: boolean, flat = 0) => {
  c.save(); c.translate(x, y); c.scale(s, s);
  const L = k.look;
  if (lying) {
    // (face down in the dirt, backside up, the underwear riding up out of their pants; flattened if run over)
    c.scale(1, 1 - flat * 0.55);
    ell(c, 0, -2, 20, 4, 'rgba(120,10,10,0.75)');
    box(c, -18, -8, 36, 8, L.shirt);
    ell(c, 8, -12, 9, 8, L.pants); box(c, 3, -20, 10, 3, '#F4F4F4');
    line(c, L.pants, 5, [12, -10, 22, -4, 26, -2]); line(c, L.pants, 5, [6, -8, 18, 0]);
    ell(c, -20, -5, 6, 5, k.helmet ?? L.hair);
    line(c, L.skin, 3, [-12, -6, -22, 2]); line(c, L.skin, 3, [-6, -6, -2, 2]);
  } else {
    c.rotate(rot);
    box(c, -8, -14, 16, 18, L.shirt);
    line(c, L.pants, 5, [-4, 4, -10, 16]); line(c, L.pants, 5, [4, 4, 12, 14]);
    line(c, L.skin, 3.4, [-8, -10, -18, -18]); line(c, L.skin, 3.4, [8, -10, 18, -4]);
    ell(c, 0, -22, 8, 8, k.helmet ?? L.skin); if (!k.helmet) ell(c, 0, -25, 8, 5, L.hair);
    box(c, -2, -20, 2, 2, INK); box(c, 2, -20, 2, 2, INK); box(c, -2, -16, 5, 3, '#5A0A0A');
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead from behind, on his bike (shirtless, the flat-top, his jeans: clean, shitty, or bare)

const SKIN = '#E0AC69', SKIN_DK = '#C68B45', SKIN_LT = '#F5D0A9', JEANS = '#1E3A8A', JEANS_DK = '#172554', HAIR = '#18181B';
export interface MhPose {
  lean: number; spin: number;
  /** Punching (-1 left, 1 right, 0 not) and how far out (0..1). */
  punch: number; reach: number;
  /** A parry under way: its weapon and frame (the flourish's own arms). */
  parry: { w: Weapon; t: number; side: number } | null;
  shat: boolean; nude: boolean;
  /** Flicker (just back on after a bail). */
  blink: boolean;
  bike: string;
}

const mhArm = (c: Ctx, side: number, hx: number, hy: number) => {
  const sx = side * 14, sy = -66, ex = (sx + hx) / 2 + side * 3, ey = (sy + hy) / 2 + 3;
  line(c, SKIN_DK, 7.5, [sx, sy, ex, ey, hx, hy]); line(c, SKIN, 5.6, [sx, sy, ex, ey, hx, hy]);
  ell(c, hx, hy, 3.6, 3.4, SKIN); box(c, hx - 2.5, hy + 1, 5, 2, '#09090B');
};

/** Him, from behind, on his bike, at (x, y) (its ground point), `s` px per art unit. */
export const drawMeathead = (c: Ctx, p: MhPose, x: number, y: number, s: number, f: number) => {
  if (p.blink && (f >> 2) % 2) return;
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(p.lean);
  rearBike(c, p.bike, p.spin);
  // (his legs down to the pegs, his boots)
  const leg = p.nude ? SKIN : JEANS;
  line(c, p.nude ? SKIN_DK : JEANS_DK, 7, [-9, -40, -16, -28, -15, -16]); line(c, p.nude ? SKIN_DK : JEANS_DK, 7, [9, -40, 16, -28, 15, -16]);
  line(c, leg, 5.5, [-9, -40, -16, -28, -15, -16]); line(c, leg, 5.5, [9, -40, 16, -28, 15, -16]);
  box(c, -19, -18, 8, 5, '#18181B'); box(c, 11, -18, 8, 5, '#18181B');
  // (the seat of his jeans (or his bare backside), the belt)
  if (p.nude) {
    ell(c, -5.5, -42, 6.5, 5.5, '#F3D0AC'); ell(c, 5.5, -42, 6.5, 5.5, '#F3D0AC'); box(c, -0.5, -46, 1, 7, '#8A5A3A');
    box(c, -12, -49, 24, 3, '#F3D0AC');
    if (p.shat) ell(c, 0, -40, 4, 3, 'rgba(92,58,22,0.85)');
  } else {
    box(c, -12.5, -49, 25, 11, JEANS); box(c, -0.6, -47, 1.2, 9, JEANS_DK);
    if (p.shat) { ell(c, 0, -42, 8, 4.5, 'rgba(92,58,22,0.8)'); ell(c, 0, -41, 4.5, 3, 'rgba(64,38,12,0.85)'); box(c, -2, -38, 2, 3 + ((f >> 4) % 3), 'rgba(92,58,22,0.8)'); }
    box(c, -13, -50, 26, 5, '#78350F'); for (const bx of [-8, -3, 2, 7]) box(c, bx, -48.5, 1.5, 1.5, '#E5E7EB');
  }
  // (his bare back: the lats, the spine, the shoulder blades, the traps)
  poly(c, SKIN, [-16, -70, 16, -70, 18, -62, 13, -50, -13, -50, -18, -62]);
  box(c, -16, -66, 4, 14, 'rgba(150,90,35,0.3)'); box(c, -0.6, -68, 1.2, 17, SKIN_DK);
  ell(c, -7, -63, 4.5, 3.5, SKIN_LT); ell(c, 7, -63, 4.5, 3.5, SKIN_LT);
  poly(c, SKIN, [-13, -69, -5, -76, 5, -76, 13, -69]);
  // (his arms: to the bars, or a punch out to a side, or the parry's flourish)
  const pr = p.parry;
  if (pr) {
    const t = pr.t, sd = pr.side;
    if (pr.w === 'chain' && t >= 8 && t < 34) {
      // (both fists up over his head, whirling the chain)
      mhArm(c, -1, -4, -100); mhArm(c, 1, 4, -100);
    } else if (pr.w === 'nunchucks' && t >= 8) { mhArm(c, sd, sd * 10, -64 + Math.min(1, (t - 8) / 6) * 6); mhArm(c, -sd, -sd * 21, -58); }
    else if (pr.w === 'bat' && t >= 6 && t < 16) { mhArm(c, sd, sd * 24, -96 + (t - 6) * 3); mhArm(c, -sd, -sd * 21, -58); }
    else { mhArm(c, sd, sd * 38, -70); mhArm(c, -sd, -sd * 21, -58); }
  } else if (p.punch) {
    const r = Math.sin(Math.min(1, p.reach) * Math.PI);
    mhArm(c, p.punch, p.punch * (21 + r * 22), -58 - r * 10);
    mhArm(c, -p.punch, -p.punch * 21, -58);
  } else { mhArm(c, -1, -21, -58); mhArm(c, 1, 21, -58); }
  rearBars(c);
  // (the back of his head: the thick neck, the ears, the flat-top)
  box(c, -7, -80, 14, 8, SKIN_DK); box(c, -5, -79, 10, 7, SKIN);
  box(c, -12, -88, 3, 7, SKIN); box(c, 9, -88, 3, 7, SKIN);
  box(c, -9, -96, 18, 16, SKIN); box(c, -9, -97, 18, 9, HAIR); box(c, -10, -99, 20, 4, HAIR); box(c, -9, -99, 18, 1, '#3F3F46');
  c.restore();
};

/** Him and his bike apart (the bail): him tumbling (`rot`), the bike cartwheeling. */
export const drawMhTumble = (c: Ctx, x: number, y: number, s: number, rot: number, nude: boolean, shat: boolean) => {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(rot);
  box(c, -12, -16, 24, 18, SKIN); box(c, -12, 2, 24, 8, nude ? '#F3D0AC' : JEANS);
  if (shat && !nude) ell(c, 0, 6, 6, 3, 'rgba(92,58,22,0.8)');
  line(c, nude ? SKIN : JEANS, 6, [-6, 10, -14, 24]); line(c, nude ? SKIN : JEANS, 6, [6, 10, 16, 20]);
  line(c, SKIN, 5, [-12, -12, -24, -22]); line(c, SKIN, 5, [12, -12, 24, -4]);
  box(c, -8, -32, 16, 16, SKIN); box(c, -9, -34, 18, 6, HAIR);
  box(c, -4, -24, 2, 2, INK); box(c, 3, -24, 2, 2, INK); box(c, -3, -20, 6, 3, '#5A0A0A');
  c.restore();
};
export const drawBikeTumble = (c: Ctx, x: number, y: number, s: number, rot: number, color: string) => {
  c.save(); c.translate(x, y - 20 * s); c.scale(s, s); c.rotate(rot); c.translate(0, 20);
  rearBike(c, color, rot, true);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Tucker on his stolen bike: from behind (the conductor's coat, the tails flapping), twisted round in the seat to yell
// back at Meathead (his face: the eye hole, the buzzsaw, the grime: tucker.ts's close-up, small)

export const drawTuckerRider = (c: Ctx, x: number, y: number, s: number, lean: number, wounds: TuckerWounds, talking: boolean, f: number) => {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(lean);
  rearBike(c, '#2563EB', f * 0.3);
  // (black trousers to the pegs, polished boots)
  line(c, '#1A1A22', 5.5, [-8, -40, -15, -28, -14, -17]); line(c, '#1A1A22', 5.5, [8, -40, 15, -28, 14, -17]);
  box(c, -18, -19, 8, 5, '#0C0C10'); box(c, 10, -19, 8, 5, '#0C0C10');
  // (the coat's tails flapping out behind him)
  const fl = Math.sin(f * 0.5) * 3;
  poly(c, '#1E2A4A', [-12, -50, 12, -50, 14 + fl, -34, -14 - fl, -34]);
  poly(c, '#16203A', [-1, -50, 1, -50, 1, -36, -1, -36]);
  c.restore();
  // (twisted round: his head and shoulders, facing back at us)
  drawTuckerCloseup(c, x + Math.sin(lean) * -60 * s, y - 70 * s, s * 0.75, f, { wounds, talking, face: talking ? 'manic' : 'angry' });
};
