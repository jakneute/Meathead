// The weapons in his fist, done up (each weapon's drawHeld): the painting kit they share. Stepped ramps, ink, dithering,
// rivets, tape, chalk; and the stamp cache that keeps it cheap: the still part of each weapon is painted the once into
// a little canvas at the scale it's shown at (the sprite's own resolution: spriteOutline.ts paints him at the world's
// zoom), and every frame after that it's one drawImage under whatever transform his arm's at (turned, kicked,
// mirrored, squashed). Only the bits with life in them (glows, glints, sloshing, a string humming) are drawn live.

import { mix } from '../../m1/game/render/backdrops/core';

type Ctx = CanvasRenderingContext2D;
export const INK = '#1A0B06';
export { mix };

// ---------------------------------------------------------------------------------------------------------------
// Ramps (dark to light)

export const STEEL = ['#18181B', '#27272A', '#3F3F46', '#52525B', '#71717A', '#A1A1AA', '#D4D4D8', '#F4F4F5'];
export const BRASS = ['#422006', '#713F12', '#A16207', '#CA8A04', '#EAB308', '#FDE68A', '#FEF9C3'];
export const WOOD = ['#2A1003', '#451A03', '#78350F', '#92400E', '#B45309', '#D97706', '#F2C27D'];
export const PURPLE = ['#1E0B3C', '#2E1065', '#4C1D95', '#6D28D9', '#7C3AED', '#A78BFA', '#DDD6FE'];
export const TAPE = ['#4B5563', '#6B7280', '#9CA3AF', '#C4C9D1', '#E5E7EB'];

// ---------------------------------------------------------------------------------------------------------------
// Painting

export const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
export const ell = (g: Ctx, cx: number, cy: number, rx: number, ry: number, col: string) => {
  g.fillStyle = col; g.beginPath(); g.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); g.fill();
};
export const poly = (g: Ctx, pts: readonly (readonly [number, number])[], col: string) => {
  g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath(); g.fill();
};
/** A checker of `col` over the box, one art pixel a cell (`ph`: which half). The SNES's dither between two shades. */
export const dither = (g: Ctx, x: number, y: number, w: number, h: number, col: string, ph = 0) => {
  g.fillStyle = col;
  for (let j = 0; j < h; j++) for (let i = (j + ph) & 1; i < w; i += 2) g.fillRect(x + i, y + j, 1, 1);
};
/** A sparse scatter of single pixels (a 4x4 ordered pattern's lightest cells: about one in `of`), for grime and grain. */
export const speckle = (g: Ctx, x: number, y: number, w: number, h: number, col: string, seed = 0, of = 6) => {
  g.fillStyle = col;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (hash(i * 7 + j * 13 + seed) * of < 1) g.fillRect(x + i, y + j, 1, 1);
};
/** A rivet or a screw head: a dark pixel, its lit corner (`slot`: a screw's slot across it). */
export const rivet = (g: Ctx, x: number, y: number, dark = '#27272A', lit = '#E4E4E7', slot = false) => {
  box(g, x, y, 1, 1, dark); box(g, x, y, 0.5, 0.5, lit);
  if (slot) box(g, x, y + 0.4, 1, 0.25, INK);
};
/** A wrap of duct tape round something w x h: silver, inked, crinkled, a ragged edge. */
export const tape = (g: Ctx, x: number, y: number, w: number, h: number, seed = 0) => {
  box(g, x, y, w, h, TAPE[2]);
  box(g, x, y, w, 1, TAPE[4]); box(g, x, y + h - 1, w, 1, TAPE[0]);
  for (let j = 1; j < h - 1; j++) if (hash(j + seed) > 0.45) box(g, x + Math.floor(hash(j * 3 + seed) * (w - 1)), y + j, 1, 1, hash(j * 5 + seed) > 0.5 ? TAPE[3] : TAPE[1]);
  box(g, x + w - 0.5, y + 1, 0.5, h - 2, TAPE[1]);
};
export const hash = (k: number) => { const s = Math.sin(k * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** A 3x5 pixel font, just the letters the weapons need (chalk on the slate). */
const GLYPHS: Record<string, string> = {
  A: '010101111101101', C: '011100100100011', E: '111100110100111', K: '101110100110101', M: '101111101101101',
  N: '110101101101101', O: '010101101101010', S: '011100010001110', T: '111010010010010', '1': '010110010010111',
  '3': '110001010001110', '6': '111100111101111', '9': '111101111001111', '#': '101111101111101', ' ': '000000000000000',
};
/** Chalked words (wobbly: each pixel's edges a touch off). Reads right whichever way he faces when `mir` says the art's
 *  being drawn mirrored (the letters flipped back round in place). */
export const chalk = (g: Ctx, text: string, x: number, y: number, col: string, mir = false, seed = 0) => {
  const w = text.length * 4 - 1;
  g.save();
  if (mir) { g.translate(x * 2 + w, 0); g.scale(-1, 1); }
  g.fillStyle = col;
  for (let i = 0; i < text.length; i++) {
    const gl = GLYPHS[text[i]] ?? GLYPHS[' '];
    for (let k = 0; k < 15; k++) if (gl[k] === '1') {
      const jx = hash(i * 31 + k + seed) * 0.3 - 0.15, jy = hash(i * 17 + k * 3 + seed) * 0.3 - 0.15;
      g.fillRect(x + i * 4 + (k % 3) + jx, y + Math.floor(k / 3) + jy, 1, 1);
    }
  }
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Live bits

/** A glint sweeping along a band (x0 to x0 + len, rows y to y + h), slanted, every `period` frames. */
export const glint = (c: Ctx, frame: number, x0: number, len: number, y: number, h: number, period = 150, phase = 0, col = 'rgba(255,255,255,0.8)') => {
  const t = (frame + phase) % period;
  if (t > 16) return;
  const x = x0 + (t / 16) * len;
  c.fillStyle = col;
  for (let j = 0; j < h; j++) c.fillRect(x - j * 0.5, y + j, 1.5, 1);
};
/** A four-pointed twinkle catching the light at (x, y), every `period` frames, `size` its arms at the peak. */
export const twinkle = (c: Ctx, frame: number, x: number, y: number, period = 120, phase = 0, size = 2, col = '#FFFFFF') => {
  const t = (frame + phase) % period;
  if (t > 12) return;
  const k = Math.sin((t / 12) * Math.PI), a = Math.max(0.5, size * k);
  c.fillStyle = col;
  c.fillRect(x - 0.5, y - a, 1, a * 2); c.fillRect(x - a, y - 0.5, a * 2, 1);
  if (k > 0.6) { c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x - 1, y - 1, 2, 2); }
};

// ---------------------------------------------------------------------------------------------------------------
// The stamp cache

interface Held { cv: HTMLCanvasElement; x: number; y: number; s: number }
const cache = new Map<string, Held>();
const MAX = 96;

/** The scale it's painted at for this transform: the sprite's own (half steps, like spriteOutline's), at least 1. */
const scaleOf = (m: DOMMatrix) => Math.max(1, Math.min(8, Math.round(Math.max(Math.hypot(m.a, m.b), Math.hypot(m.c, m.d)) * 2) / 2));

/**
 * Puts down the still art `paint` draws inside the box (x, y, w, h) of the current coordinates, from a stamp of it.
 * `key` names what it looks like (the same key, the same picture). `text`: there's lettering in it (paint is told when
 * it's being drawn mirrored, to flip the letters back round). Turned or squashed, the stamp's put down smoothed (like
 * the live art's edges); flat, pixel for pixel on the screen's grid.
 */
export const heldStamp = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx, mir: boolean) => void, text = false) => {
  if (typeof document === 'undefined') { paint(c, false); return; }
  const m = c.getTransform();
  const s = scaleOf(m), mir = text && m.a * m.d - m.b * m.c < 0;
  const id = `${key}@${s}${mir ? 'm' : ''}`;
  let st = cache.get(id);
  if (st) { cache.delete(id); cache.set(id, st); }
  else {
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(w * s) + 2; cv.height = Math.ceil(h * s) + 2;
    const g = cv.getContext('2d');
    if (!g) { paint(c, mir); return; }
    g.setTransform(s, 0, 0, s, 1 - x * s, 1 - y * s);
    g.lineJoin = 'round'; g.lineCap = 'round';
    paint(g, mir);
    st = { cv, x: x - 1 / s, y: y - 1 / s, s };
    cache.set(id, st);
    if (cache.size > MAX) cache.delete(cache.keys().next().value!);
  }
  const W = st.cv.width / s, H = st.cv.height / s, sm = c.imageSmoothingEnabled;
  if (m.b === 0 && m.c === 0 && Math.abs(Math.abs(m.a) - s) < 1e-3 && Math.abs(Math.abs(m.d) - s) < 1e-3) {
    // (flat, at the scale it was painted at: onto whole pixels, one for one)
    const dx = Math.round(m.a * st.x + m.e), dy = Math.round(m.d * st.y + m.f);
    c.imageSmoothingEnabled = false;
    c.drawImage(st.cv, (dx - m.e) / m.a, (dy - m.f) / m.d, W, H);
  } else {
    c.imageSmoothingEnabled = true;
    c.drawImage(st.cv, st.x, st.y, W, H);
  }
  c.imageSmoothingEnabled = sm;
};

/** Where it's drawn flat, its origin snapped onto the screen's pixel grid (the stamp and the live bits over it land in
 *  register, pixel for pixel). Inside a save. */
export const snapOrigin = (c: Ctx) => {
  if (typeof document === 'undefined') return;
  const m = c.getTransform();
  if (m.b !== 0 || m.c !== 0 || m.a === 0 || m.d === 0) return;
  c.translate((Math.round(m.e) - m.e) / m.a, (Math.round(m.f) - m.f) / m.d);
};
