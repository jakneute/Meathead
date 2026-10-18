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
const VARIANTS: Partial<Record<SprKind, number>> = { pine: 3, oak: 2, bloodtree: 2, cow: 3, deer: 2, bush: 2, boulder: 2, deadcow: 3, deaddeer: 2, teentree: 4, hay: 1, tractor: 2 };

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
  bloodtree: (c, w, h, v, words) => {
    painters.oak(c, w, h, v, words);
    // (where a kid hit it and peeled off: a red splat on the bark at head height, the run down to the roots, a shoe
    // left up in the leaves)
    const y = h - 34;
    ell(c, w / 2, y, 9, 7, '#8A1414'); ell(c, w / 2 - 6, y - 4, 4, 3, '#A51C1C'); ell(c, w / 2 + 7, y + 3, 3, 3, '#A51C1C');
    for (const [dx, len] of [[-3, 26], [1, 32], [4, 20]]) box(c, w / 2 + dx, y, 2, len, '#7F1414');
    box(c, w / 2 + 14, h - 92, 6, 4, '#F5F5F4'); box(c, w / 2 + 14, h - 89, 6, 1, '#18181B');
  },
  bush: (c, w, h, v) => {
    const g = v ?['#2A5226', '#3C6A30'] : ['#3A5E22', '#4E7A2E'];
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
  gore: (c, w, h) => { ell(c, w / 2, h / 2, w / 2, h / 2, '#5A0A0A'); ell(c, w / 2 - 10, h / 2, w / 4, h / 3, '#8A1414'); for (let i = 0; i < 6; i++) box(c, 10 + i * 13, 2 + (i % 3) * 1.5, 3, 2, i % 2 ? '#F0A8B0' : '#F5F5F4'); },
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
  /** Punched (1 just now, easing to 0): recoiling away from him in pain, the head snapped back, the arms flung,
   *  wincing, blood off the face. */
  pain?: number;
  /** Seeing stars (circling over the head). */
  daze?: boolean;
  /** The head squashed down (a bonk on top), 0..1. */
  squash?: number;
  /** Both arms flailing over their head (riding blind). */
  flail?: boolean;
}

/** A teen on their bike from behind, at (x, y) (the ground point) at `s` px per art unit. */
export const drawTeenRider = (c: Ctx, k: TeenLook, weapon: Weapon, p: RiderPose, x: number, y: number, s: number, f: number) => {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(p.lean);
  c.scale(0.92, 0.92);
  rearBike(c, k.bike, p.spin);
  const L = k.look, bw = k.heavy ? 15 : 12;
  // (punched: the whole body above the seat thrown away from him (he's on the side their weapon faces), easing back)
  const pain = p.pain ?? 0, away = -p.side;
  if (pain > 0) { c.translate(0, -44); c.rotate(away * 0.42 * pain); c.translate(away * 5 * pain, 44); }
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
  if (p.flail) {
    // (riding blind: both arms waving over their head)
    const a = Math.sin(f * 0.6) * 6;
    armTo(-1, -16 + a, -98 - a); armTo(1, 16 + a, -98 + a);
    rearBars(c);
  } else if (pain > 0.35) {
    // (the arms flung out off the bars, the weapon arm up and away)
    armTo(away, away * 26, -84 - pain * 8); armTo(-away, -away * 14, -60);
    rearBars(c);
    if (p.arm !== 'none') drawWeapon(c, weapon, away * 26, -84 - pain * 8, away > 0 ? -1.1 : Math.PI + 1.1, false, f);
  } else {
    if (p.arm === 'none' || p.arm === 'idle') { armTo(-1, -21, -58); armTo(1, 21, -58); }
    else armTo(-ws, -ws * 21, -58);
    rearBars(c);
    if (p.arm === 'idle') { armTo(ws, ws * 21, -58); drawWeapon(c, weapon, ws * 21, -58, ws > 0 ? 0.3 : Math.PI - 0.3, false, f); }
    else if (p.arm === 'wind') {
      // (the wind-up: the weapon cocked up behind them, quivering a little as they put their back into it: the only tell)
      const q = Math.sin(f * 1.3) * 1.2;
      armTo(ws, ws * 8, -86 + q); drawWeapon(c, weapon, ws * 8, -86 + q, ws > 0 ? -2.2 : -0.94, p.flash, f);
    }
    else if (p.arm === 'swing') { armTo(ws, ws * 30, -66); drawWeapon(c, weapon, ws * 30, -66, ws > 0 ? 0.1 : Math.PI - 0.1, false, f); }
  }
  // (the head from behind: a helmet, or hair (a ponytail flying); turned to look at him, a sliver of face and an eye;
  // snapped back and away when punched; squashed down by a bonk)
  if (pain > 0) { c.translate(away * 4 * pain, -3 * pain); }
  const sq = p.squash ?? 0;
  if (sq > 0) { c.translate(0, -80); c.scale(1 + sq * 0.25, 1 - sq * 0.4); c.translate(0, 80 + sq * 6); }
  const hy = -80;
  box(c, -4, -73, 8, 4, L.skin);
  const look = pain > 0.2 ? p.side : p.look;
  if (k.helmet) {
    ell(c, 0, hy, 10, 10, INK); ell(c, 0, hy, 9, 9, k.helmet); box(c, -2, hy - 9, 4, 18, mix(k.helmet, '#000000', 0.3)); box(c, -9, hy - 1, 18, 2, '#18181B');
    if (look) { box(c, look * 6 - 2, hy, 4, 5, L.skin); box(c, look * 7, hy + 1, 2, 2, INK); }
  } else {
    ell(c, 0, hy, 8.5, 9, L.skin);
    ell(c, 0, hy - 2, 9, 8, L.hair);
    if (L.long || k.woman) box(c, -8, hy - 2, 16, 12, L.hair);
    if (k.pony) { const sw = Math.sin(f * 0.3) * 3; line(c, L.hair, 4, [0, hy - 2, sw, hy + 8, sw * 1.6, hy + 16]); }
    if (look) { box(c, look * 6 - 2, hy - 1, 4, 6, L.skin); box(c, look * 7, hy, 2, 2, INK); }
    box(c, -10, hy - 1, 2, 4, L.skin); box(c, 8, hy - 1, 2, 4, L.skin);
  }
  if (pain > 0.2) {
    // (the wince, turned half round at him: the eye screwed shut, the mouth open in a howl, blood off the nose and lip
    // spraying away from him)
    const fx = p.side * 8;
    box(c, fx - 2, hy - 1, 5, 7, L.skin);
    line(c, INK, 1, [fx - 1, hy, fx + 2, hy + 1.5]);
    box(c, fx - 1, hy + 3.5, 3, 2.5, '#3A0A0A');
    box(c, fx, hy + 2, 2, 4, '#B91C1C');
    for (let i = 0; i < 6; i++) {
      const d = (1 - pain) * 22 + i * 3.4, dy = Math.sin(i * 1.7) * 4 - d * 0.25 + d * d * 0.02;
      box(c, fx + away * d, hy + 3 + dy, i % 2 ? 2 : 3, i % 2 ? 2 : 3, i % 3 ? '#B91C1C' : '#7F1D1D');
    }
  }
  if (p.daze) {
    // (stars round their head)
    for (let i = 0; i < 3; i++) {
      const a = f * 0.25 + (i * Math.PI * 2) / 3, sx = Math.cos(a) * 12, sy = hy - 14 + Math.sin(a) * 3;
      box(c, sx - 0.8, sy - 2.5, 1.6, 5, '#FDE047'); box(c, sx - 2.5, sy - 0.8, 5, 1.6, '#FDE047');
    }
  }
  if (p.hit) { c.globalAlpha = 0.55; ell(c, 0, -50, 22, 40, '#FFFFFF'); c.globalAlpha = 1; }
  c.restore();
};

/** A teen hoisted off their bike by the underwear (the crowbar's wedgie), from behind: hung from the hook at (x, y),
 *  the waistband stretched up over their head to it, legs kicking, arms flailing. */
export const drawTeenDangle = (c: Ctx, k: TeenLook, x: number, y: number, s: number, f: number, stretch: number) => {
  c.save(); c.translate(x, y); c.scale(s, s);
  const L = k.look, sw = Math.sin(f * 0.5) * 0.12;
  c.rotate(sw);
  // (hung upright under the hook, sagging lower the more it stretches: the head, the shirt, the pants, kicking legs)
  const top = 8 + stretch * 12, wy = top + 30;
  const kick = Math.sin(f * 0.8) * 6, a = Math.sin(f * 0.7) * 5;
  line(c, L.pants, 5, [-5, wy + 8, -8 - kick * 0.4, wy + 22]); line(c, L.pants, 5, [5, wy + 8, 8 + kick * 0.4, wy + 20 - kick * 0.3]);
  box(c, -11 - kick * 0.4, wy + 21, 6, 4, '#F5F5F4'); box(c, 5 + kick * 0.4, wy + 19 - kick * 0.3, 6, 4, '#F5F5F4');
  box(c, -9, wy, 18, 10, L.pants);
  poly(c, L.shirt, [-11, wy + 1, 11, wy + 1, 12, top + 10, -12, top + 10]);
  line(c, L.skin, 3.4, [-10, top + 13, -19, top + 2 + a]); line(c, L.skin, 3.4, [10, top + 13, 19, top + 2 - a]);
  ell(c, 0, top + 4, 8, 8, k.helmet ?? L.skin); if (!k.helmet) ell(c, 0, top + 2, 8, 5, L.hair);
  // (the underwear yanked up out of the pants, up the back, over the head to the hook: white, stretched thin)
  box(c, -8, wy - 3, 16, 4, '#F4F4F4');
  line(c, '#F4F4F4', 2.6 - stretch, [-6, wy - 2, -3, top - 2, 0, 0]); line(c, '#F4F4F4', 2.6 - stretch, [6, wy - 2, 3, top - 2, 0, 0]);
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
  /** Punching (-1 left, 1 right, 0 not) and the punch's frame (PUNCH_WIND to cock it, then the blow, PUNCH_LEN in all). */
  punch: number; pt: number;
  /** A parry under way: its weapon and frame (the flourish's own arms). */
  parry: { w: Weapon; t: number; side: number } | null;
  shat: boolean; nude: boolean;
  /** Flicker (just back on after a bail). */
  blink: boolean;
  bike: string;
  /** How beaten up he is this chase (0 fresh .. 1 near dead): scrapes, then blood, torn jeans, a gash, dripping. */
  blood: number;
}

/** His punch: the cock back (frames), and the whole thing (the blow lands at PUNCH_WIND). */
export const PUNCH_WIND = 7, PUNCH_LEN = 24;
/** The punch's shape at frame t (no allocation: one shared out): wind (the cock back, 0..1), out (the arm's reach),
 *  turn (his head round in profile at the target, 0..1). */
const PSH = { wind: 0, out: 0, turn: 0 };
const punchShape = (t: number) => {
  if (t < PUNCH_WIND) { const k = t / PUNCH_WIND; PSH.wind = k; PSH.out = 0; PSH.turn = Math.min(1, k * 1.6); return PSH; }
  const u = t - PUNCH_WIND, rest = PUNCH_LEN - PUNCH_WIND - 10;
  PSH.out = u < 2 ? (u + 1) / 2 : u < 10 ? 1 : Math.max(0, 1 - (u - 10) / rest);
  PSH.wind = Math.max(0, 1 - u / 2);
  PSH.turn = u < 12 ? 1 : PSH.out;
  return PSH;
};

/** Where his working fist is in a parry's flourish, frame t, toward side sd (art units; shared by the arm and the
 *  weapon drawn in his hand). One shared out. */
export const PH = { x: 0, y: 0, a: 0 };
export const parryHand = (w: Weapon, t: number, sd: number) => {
  let x = sd * 38, y = -70, a = sd > 0 ? 0 : Math.PI;
  const toward = (ang: number) => (sd > 0 ? ang : Math.PI - ang);
  switch (w) {
    case 'chain': if (t >= 8 && t < 34) { x = sd * 4; y = -100; } break;
    case 'bat':
      if (t < 6) { const k = t / 6; x = sd * (38 - k * 14); y = -70 - k * 30; a = toward(-1.3 * k); }
      else if (t < 22) {
        // (three bonks on the head, BONK BONK BONK: up, down on it, up again)
        const l = (t - 6) % 5, up = l < 2 ? 1 - l / 2 : (l - 2) / 3;
        x = sd * 26; y = -80 - up * 22; a = toward(0.45 - up * 1.6);
      } else if (t < 28) { const k = (t - 22) / 6; x = sd * (26 - k * 34); y = -80 + k * 4; a = toward(-2.6 - k * 0.4); }
      else { const k = Math.min(1, (t - 28) / 3); x = sd * (-8 + k * 50); y = -76 + k * 8; a = toward(-3 + k * 3.2); }
      break;
    case 'crowbar':
      if (t < 5) { x = sd * 38; y = -70; a = toward(0); }
      else if (t < 10) { const k = (t - 5) / 5; x = sd * (38 + k * 12); y = -70 + k * 6; a = toward(0.6); }
      else if (t < 26) { const k = Math.min(1, (t - 10) / 6); x = sd * (50 - k * 10); y = -64 - k * 56 + Math.sin(t * 0.9) * 2; a = toward(-0.4); }
      else { const k = Math.min(1, (t - 26) / 3); x = sd * (40 - k * 20); y = -120 + k * 20; a = toward(-1.2 * k); }
      break;
    case 'nunchucks':
      if (t < 4) { x = sd * 38; y = -70; }
      else if (t < 22) { const l = (t - 4) % 4; x = sd * (30 + (l < 2 ? l * 6 : (4 - l) * 6)); y = -82 + (l % 2) * 4; a = toward(l < 2 ? -0.6 : 0.6); }
      else if (t < 30) { x = sd * 34; y = -72; }
      else { const k = Math.min(1, (t - 30) / 6); x = sd * (34 - k * 24); y = -72 + k * 14; }
      break;
    case 'hockey':
      if (t < 4) { x = sd * 38; y = -70; a = toward(0); }
      else { x = sd * 40; y = -64; a = toward(0.9); }
      break;
    case 'skateboard':
      if (t < 6) { const k = t / 6; x = sd * (38 - k * 10); y = -70 - k * 20; a = toward(-0.4); }
      else if (t < 16) { const l = (t - 6) % 5, up = l < 2 ? 1 - l / 2 : (l - 2) / 3; x = sd * 32; y = -84 - up * 18; a = toward(0.3 - up * 1.2); }
      else if (t < 20) { const k = (t - 16) / 4; x = sd * 32; y = -104 + k * 18; a = toward(0); }
      else { x = sd * 34; y = -78; a = toward(0.4); }
      break;
  }
  PH.x = x; PH.y = y; PH.a = a;
  return PH;
};

/** An arm from his shoulder to the fist at (hx, hy): the elbow cocked out when the fist's up by his head, the fist
 *  bigger thrown (`big`), scraped and bloody by `blood`. */
const mhArm = (c: Ctx, side: number, hx: number, hy: number, blood: number, big = false) => {
  const sx = side * 14, sy = -66;
  const near = Math.abs(hx - sx) < 14 && hy < sy;
  const ex = near ? sx + side * 13 : (sx + hx) / 2 + side * 3, ey = near ? sy + 5 : (sy + hy) / 2 + 3;
  line(c, SKIN_DK, big ? 9 : 7.5, [sx, sy, ex, ey, hx, hy]); line(c, SKIN, big ? 7 : 5.6, [sx, sy, ex, ey, hx, hy]);
  if (blood > 0.2) { line(c, 'rgba(185,40,40,0.55)', 2.2, [(sx * 2 + ex) / 3, (sy * 2 + ey) / 3, ex, ey]); }
  if (blood > 0.4) { line(c, '#991B1B', 1.4, [ex, ey, (ex + hx) / 2, (ey + hy) / 2 + 1]); box(c, ex - 1, ey - 1, 3, 2, '#7F1D1D'); }
  const r = big ? 4.8 : 3.6;
  ell(c, hx, hy, r, r * 0.95, SKIN); box(c, hx - r * 0.7, hy + 1, r * 1.4, 2, '#09090B');
  if (blood > 0.3) box(c, hx - 2, hy - 2, 3, 2, '#B91C1C');
};

/** His head: from behind (the flat-top, the ears), or swung round to `turn` toward sd in profile: the brow crushed down
 *  over the eye, the nose, the jaw out, the teeth bared: he wants you dead. */
const mhHead = (c: Ctx, turn: number, sd: number, blood: number, f: number) => {
  box(c, -7, -80, 14, 8, SKIN_DK); box(c, -5, -79, 10, 7, SKIN);
  if (turn < 0.35) {
    box(c, -12, -88, 3, 7, SKIN); box(c, 9, -88, 3, 7, SKIN);
    box(c, -9, -96, 18, 16, SKIN); box(c, -9, -97, 18, 9, HAIR); box(c, -10, -99, 20, 4, HAIR); box(c, -9, -99, 18, 1, '#3F3F46');
  } else {
    c.save(); c.translate(sd * 2, 0); c.scale(sd, 1);
    // (the skull side on, the face to +x; the ear back toward us, the flat-top over it)
    box(c, -9, -96, 18, 16, SKIN);
    box(c, -9, -88, 4, 8, SKIN_DK); box(c, -8, -87, 3, 5, SKIN);
    box(c, -10, -99, 19, 4, HAIR); box(c, -9, -97, 14, 7, HAIR); box(c, -9, -99, 18, 1, '#3F3F46');
    // (the brow ridge crushed down at the nose, the eye a slit under it, the vein up his temple)
    poly(c, HAIR, [3, -93, 11, -90, 11, -88.5, 3, -91]);
    box(c, 6, -89, 3, 1.6, '#F4F4F4'); box(c, 8, -89, 1.2, 1.6, INK);
    line(c, '#B4532A', 0.9, [0, -95, 1.5, -91, 0.5, -88]);
    // (the nose out, the nostril flared, the jaw jutting, the mouth pulled back off his teeth: bared, clenched)
    poly(c, SKIN, [9, -90, 13, -85, 9, -84]); box(c, 10, -85.5, 2, 1, SKIN_DK);
    box(c, 3, -82, 9, 3, SKIN_DK); box(c, 3, -81, 8, 2, SKIN);
    box(c, 5, -84, 7, 3, '#3A0A0A'); box(c, 5.5, -84, 6, 1.2, '#F4F4F4'); box(c, 5.5, -82.4, 6, 1.1, '#F4F4F4');
    box(c, 7, -84, 0.6, 2.8, '#9CA3AF'); box(c, 9, -84, 0.6, 2.8, '#9CA3AF');
    box(c, 11, -84.5, 1.4, 3.5, '#7F1D1D');
    if (blood > 0.5) { box(c, 11, -86, 1.5, 4 + ((f >> 3) % 3), '#B91C1C'); }
    c.restore();
  }
  // (beaten up: a gash in the scalp, blood down the back of his neck; dripping off his ear at the worst)
  if (blood > 0.55) { box(c, -4, -96, 7, 2, '#991B1B'); box(c, -1, -94, 2, 14, 'rgba(153,27,27,0.85)'); }
  if (blood > 0.75) { const d = (f * 0.7) % 14; box(c, 9.5, -82 + d, 1.5, 2, '#B91C1C'); }
};

/** Him, from behind, on his bike, at (x, y) (its ground point), `s` px per art unit. */
export const drawMeathead = (c: Ctx, p: MhPose, x: number, y: number, s: number, f: number) => {
  if (p.blink && (f >> 2) % 2) return;
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(p.lean);
  rearBike(c, p.bike, p.spin);
  const b = p.blood;
  // (his legs down to the pegs, his boots)
  const leg = p.nude ? SKIN : JEANS;
  line(c, p.nude ? SKIN_DK : JEANS_DK, 7, [-9, -40, -16, -28, -15, -16]); line(c, p.nude ? SKIN_DK : JEANS_DK, 7, [9, -40, 16, -28, 15, -16]);
  line(c, leg, 5.5, [-9, -40, -16, -28, -15, -16]); line(c, leg, 5.5, [9, -40, 16, -28, 15, -16]);
  box(c, -19, -18, 8, 5, '#18181B'); box(c, 11, -18, 8, 5, '#18181B');
  // (torn through at the knees, the skin under them skinned raw)
  if (b > 0.55) for (const sx of [-1, 1]) { box(c, sx * 16 - 2.5, -31, 5, 4, p.nude ? '#C2413A' : SKIN); box(c, sx * 16 - 1.5, -30, 3, 2, '#B91C1C'); }
  // (the seat of his jeans (or his bare backside), the belt)
  if (p.nude) {
    ell(c, -5.5, -42, 6.5, 5.5, '#F3D0AC'); ell(c, 5.5, -42, 6.5, 5.5, '#F3D0AC'); box(c, -0.5, -46, 1, 7, '#8A5A3A');
    box(c, -12, -49, 24, 3, '#F3D0AC');
    if (p.shat) ell(c, 0, -40, 4, 3, 'rgba(92,58,22,0.85)');
    if (b > 0.35) { ell(c, -7, -42, 3.5, 2.5, 'rgba(185,40,40,0.6)'); }
    if (b > 0.55) { ell(c, 7, -41, 3, 2.5, 'rgba(185,40,40,0.7)'); }
  } else {
    box(c, -12.5, -49, 25, 11, JEANS); box(c, -0.6, -47, 1.2, 9, JEANS_DK);
    if (p.shat) { ell(c, 0, -42, 8, 4.5, 'rgba(92,58,22,0.8)'); ell(c, 0, -41, 4.5, 3, 'rgba(64,38,12,0.85)'); box(c, -2, -38, 2, 3 + ((f >> 4) % 3), 'rgba(92,58,22,0.8)'); }
    // (a seat pocket torn off, the jeans ripped, his cheek showing scraped through)
    if (b > 0.55) { poly(c, '#F3D0AC', [-10, -45, -4, -46, -3, -40, -9, -39]); box(c, -8, -44, 3, 2, '#B91C1C'); }
    box(c, -13, -50, 26, 5, '#78350F'); for (const bx of [-8, -3, 2, 7]) box(c, bx, -48.5, 1.5, 1.5, '#E5E7EB');
    if (b > 0.75) box(c, -13, -50, 26, 2, 'rgba(127,29,29,0.7)');
  }
  // (above the seat he twists into the punch: back from it as he cocks it, then into it hard, shoulder and all)
  const pr = p.parry;
  const sh = p.punch && !pr ? punchShape(p.pt) : null;
  const sd = pr ? pr.side : p.punch;
  const twist = sh ? sd * (-0.12 * sh.wind + 0.24 * sh.out) : 0, shift = sh ? sd * (-3 * sh.wind + 6 * sh.out) : 0;
  c.save();
  c.translate(shift, -46); c.rotate(twist); c.translate(0, 46);
  // (his bare back: the lats, the spine, the shoulder blades, the traps)
  poly(c, SKIN, [-16, -70, 16, -70, 18, -62, 13, -50, -13, -50, -18, -62]);
  box(c, -16, -66, 4, 14, 'rgba(150,90,35,0.3)'); box(c, -0.6, -68, 1.2, 17, SKIN_DK);
  ell(c, -7, -63, 4.5, 3.5, SKIN_LT); ell(c, 7, -63, 4.5, 3.5, SKIN_LT);
  poly(c, SKIN, [-13, -69, -5, -76, 5, -76, 13, -69]);
  // (beaten up, by stages: road rash on the shoulder blades; bruises and blood smeared down his back; streaks running
  // to his belt; at the worst, the lot of it dripping)
  if (b > 0.15) { ell(c, -8, -64, 4, 2.5, 'rgba(200,70,60,0.55)'); for (let i = 0; i < 3; i++) box(c, -11 + i * 2, -65 + i, 3, 0.8, 'rgba(255,200,190,0.6)'); }
  if (b > 0.35) { ell(c, 9, -60, 3.5, 3, 'rgba(110,60,140,0.45)'); line(c, '#991B1B', 1.6, [-8, -63, -9, -56, -8, -51]); ell(c, 6, -66, 3, 2, 'rgba(200,70,60,0.6)'); }
  if (b > 0.55) { line(c, '#7F1D1D', 2, [5, -66, 6, -58, 4, -51]); line(c, '#991B1B', 1.2, [-2, -70, -3, -60]); ell(c, -12, -58, 3, 4, 'rgba(185,40,40,0.6)'); box(c, -6, -70, 12, 2, 'rgba(153,27,27,0.6)'); }
  if (b > 0.75) {
    for (let i = 0; i < 3; i++) { const d = (f * 0.6 + i * 9) % 14; box(c, -8 + i * 7, -51 + d, 1.5, 2, '#B91C1C'); }
    ell(c, 0, -60, 7, 5, 'rgba(153,27,27,0.35)');
  }
  // (his arms: to the bars, or the punch, or the parry's flourish)
  if (pr) {
    if (pr.w === 'chain' && pr.t >= 8 && pr.t < 34) { mhArm(c, -1, -4, -100, b); mhArm(c, 1, 4, -100, b); }
    else { const h = parryHand(pr.w, pr.t, sd); mhArm(c, -sd, -sd * 21, -58, b); mhArm(c, sd, h.x, h.y, b, true); }
  } else if (sh) {
    // (cocked back by his ear, then thrown right out at them, overreaching, and back)
    const cx = sd * 7, cy = -82, ex = sd * 54, ey = -68, rx = sd * 21, ry = -58;
    let hx: number, hy: number;
    if (p.pt < PUNCH_WIND) { hx = rx + (cx - rx) * sh.wind; hy = ry + (cy - ry) * sh.wind; }
    else if (p.pt < PUNCH_WIND + 2) { hx = cx + (ex - cx) * sh.out; hy = cy + (ey - cy) * sh.out; }
    else { hx = rx + (ex - rx) * sh.out; hy = ry + (ey - ry) * sh.out; }
    mhArm(c, -sd, -sd * 21, -58, b);
    // (the blur behind the fist as it goes out)
    if (p.pt >= PUNCH_WIND && p.pt < PUNCH_WIND + 4) for (let i = 1; i <= 3; i++) line(c, 'rgba(255,255,255,0.5)', 1, [hx - sd * (6 + i * 5), hy - 3 + i * 2, hx - sd * (14 + i * 6), hy - 3 + i * 2]);
    mhArm(c, sd, hx, hy, b, sh.out > 0.5);
  } else { mhArm(c, -1, -21, -58, b); mhArm(c, 1, 21, -58, b); }
  // (the head: round in profile at whoever he's hitting)
  mhHead(c, pr ? 1 : sh ? sh.turn : 0, sd || 1, b, f);
  c.restore();
  rearBars(c);
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
