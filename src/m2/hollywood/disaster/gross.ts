// The footage's gross-up kit (Ren & Stimpy grade detail on the 1983 stock footage: footage.ts). Every surface rendered
// to the pore: bricks one by one with their mortar, chips and grime runs; clapboard with its grain, knots, nail heads
// and the paint peeling; shingles tab by tab, moss; smoke in dense stepped balls; and the people in the shots, hideous
// at their size: bulging bloodshot eyes (their pupils quivering live), every pore, wrinkles, temple veins, sweat beads,
// stubble, nose hair, cracked lips, gums and each tooth (a gap, a gold one), wrinkled sweat-stained clothes with food
// down them. All painted the once into sprites (kept at the scale they're shown at; fine under rotation too).

import { type Ctx, INK, box, checker, mix, poly, hash, pixelBlob } from '../blvd/kit';
import { elbowFront, halfBone } from '../../art/limb';

// ---------------------------------------------------------------------------------------------------------------
// Sprites: painted once at the scale they're shown at, then put down (rotated, scaled) with one drawImage

const sprites = new Map<string, HTMLCanvasElement>();
/** `paint` (in the current coordinates, inside x, y, w, h) painted once into a canvas at the whole scale it's shown
 *  at, then drawn into that box (under any rotation). */
export const sprite = (c: Ctx, key: string, x: number, y: number, w: number, h: number, paint: (g: Ctx) => void) => {
  if (typeof document === 'undefined') { paint(c); return; }
  const m = c.getTransform(), s = Math.max(1, Math.min(4, Math.ceil(Math.hypot(m.a, m.b) - 1e-3)));
  const id = `${key}@${s}`;
  let cv = sprites.get(id);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = Math.ceil(w * s); cv.height = Math.ceil(h * s);
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false; g.setTransform(s, 0, 0, s, -x * s, -y * s);
    paint(g);
    if (sprites.size > 60) { const first = sprites.keys().next().value; if (first !== undefined) sprites.delete(first); }
    sprites.set(id, cv);
  }
  const was = c.imageSmoothingEnabled;
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(cv, x, y, w, h);
  c.imageSmoothingEnabled = was;
};

// ---------------------------------------------------------------------------------------------------------------
// Ramps and textures

/** Six steps round a color: shadow, shade, under, itself, lit, highlight. */
export const r6 = (col: string) => [mix(col, '#0A0606', 0.62), mix(col, '#0A0606', 0.4), mix(col, '#0A0606', 0.18), col, mix(col, '#FFFFFF', 0.26), mix(col, '#FFFFFF', 0.52)];
const H = (n: number) => hash(n);

/** Specks: n single pixels of col across the box. */
export const speckle = (g: Ctx, x: number, y: number, w: number, h: number, n: number, col: string, seed: number, sz = 1) => {
  for (let i = 0; i < n; i++) box(g, x + Math.floor(H(seed + i * 1.37) * w), y + Math.floor(H(seed * 2.1 + i * 3.11) * h), sz, sz, col);
};
/** Grime running down from the top of the box, dithered at its foot. */
export const streaks = (g: Ctx, x: number, y: number, w: number, h: number, n: number, col: string, seed: number) => {
  for (let i = 0; i < n; i++) {
    const sx = x + Math.floor(H(seed + i * 5.3) * w), len = Math.floor(h * (0.25 + H(seed + i * 2.9) * 0.75)), wd = 1 + Math.floor(H(seed + i) * 3);
    box(g, sx, y, wd, Math.floor(len * 0.7), col); checker(g, sx, y + Math.floor(len * 0.7), wd, Math.ceil(len * 0.3), col, i & 1, 1);
  }
};
/** A crack: a jagged dark line wandering down (or across), lit along one side, a branch or two. */
export const crack = (g: Ctx, x: number, y: number, len: number, seed: number, across = false, dark = INK, lit = 'rgba(255,255,255,0.35)') => {
  let cx = x, cy = y;
  for (let i = 0; i < len; i++) {
    const j = H(seed + i * 0.77);
    if (across) { cx += 1; cy += j < 0.3 ? -1 : j > 0.7 ? 1 : 0; } else { cy += 1; cx += j < 0.3 ? -1 : j > 0.7 ? 1 : 0; }
    box(g, cx, cy, 1, 1, dark); box(g, cx + (across ? 0 : 1), cy + (across ? 1 : 0), 1, 1, lit);
    if (H(seed * 3 + i) > 0.94 && i > 2) crack(g, cx, cy, Math.floor(len * 0.3), seed + i * 9, !across, dark, lit);
  }
};
/** Brick, one by one: each its own tone, lit along its top, shaded under; the mortar, chips, soot and grime runs, a crack. */
export const bricks = (g: Ctx, x: number, y: number, w: number, h: number, base: string, seed: number) => {
  const B = r6(base);
  box(g, x, y, w, h, '#6A625A');
  checker(g, x, y, w, h, '#4A443E', 0, 1);
  for (let row = 0, yy = y; yy < y + h; row++, yy += 6) {
    for (let xx = x - (row % 2 ? 6 : 0); xx < x + w; xx += 12) {
      const l = Math.max(x, xx), r = Math.min(x + w, xx + 11), t = H(seed + row * 17.3 + xx * 0.31), bh = Math.min(5, y + h - yy);
      if (r <= l || bh <= 0) continue;
      box(g, l, yy, r - l, bh, B[t < 0.2 ? 1 : t < 0.55 ? 2 : t < 0.85 ? 3 : 4]);
      box(g, l, yy, r - l, 1, B[t > 0.6 ? 5 : 4]); box(g, l, yy + bh - 1, r - l, 1, B[0]);
      speckle(g, l, yy + 1, r - l, Math.max(1, bh - 2), 3, B[t > 0.5 ? 1 : 5], seed + row * 7 + xx);
      if (t > 0.9) box(g, r - 3, yy, 3, 2, '#6A625A');
    }
  }
  streaks(g, x, y, w, h, Math.ceil(w / 14), 'rgba(20, 14, 10, 0.3)', seed + 40);
  crack(g, x + Math.floor(H(seed) * w), y, Math.floor(h * 0.6), seed + 3);
};
/** Clapboard (or plank, upright): board by board, its grain in broken lines, knots, nail heads, the paint peeling to the
 *  bare wood, water stains. */
export const boards = (g: Ctx, x: number, y: number, w: number, h: number, paint: string, seed: number, bh = 6, upright = false) => {
  const P = r6(paint), wood = r6('#8A6A44');
  if (upright) {
    for (let xx = x, i = 0; xx < x + w; xx += bh, i++) {
      const bw = Math.min(bh, x + w - xx), t = H(seed + i * 3.7);
      box(g, xx, y, bw, h, P[t < 0.3 ? 2 : 3]); box(g, xx, y, 1, h, P[4]); box(g, xx + bw - 1, y, 1, h, P[0]);
      for (let k = 0; k < 3; k++) { const gx = xx + 1 + Math.floor(H(seed + i + k * 9) * (bw - 2)); for (let yy = y; yy < y + h; yy += 3) if (H(gx * 1.3 + yy) > 0.3) box(g, gx, yy, 1, 2, P[1]); }
      if (t > 0.6) { const ky = y + Math.floor(H(seed + i * 5) * h); box(g, xx + 1, ky, 2, 3, P[0]); box(g, xx + 1, ky, 1, 1, P[4]); }
      for (let yy = y + 4; yy < y + h; yy += 24) { box(g, xx + 1, yy, 1, 1, '#2A2420'); box(g, xx + bw - 2, yy, 1, 1, '#2A2420'); }
    }
  } else {
    for (let yy = y, i = 0; yy < y + h; yy += bh, i++) {
      const bb = Math.min(bh, y + h - yy), t = H(seed + i * 3.7);
      box(g, x, yy, w, bb, P[t < 0.3 ? 2 : 3]); box(g, x, yy, w, 1, P[4]); box(g, x, yy + bb - 1, w, 1, P[0]); box(g, x, yy + bb - 2, w, 1, P[1]);
      for (let xx = x; xx < x + w; xx += 2) if (H(xx * 0.7 + i * 11 + seed) > 0.72) box(g, xx, yy + 2 + (xx % 3 === 0 ? 1 : 0), 2, 1, P[2]);
      for (let xx = x + 8 + (i % 2) * 16; xx < x + w; xx += 32) box(g, xx, yy + 2, 1, 1, '#2A2420');
    }
  }
  // (the paint peeling: bare wood patches, their lifted lit edges)
  for (let i = 0; i < Math.ceil((w * h) / 900); i++) {
    const px = x + Math.floor(H(seed + i * 7.1) * (w - 8)), py = y + Math.floor(H(seed + i * 4.3) * (h - 5)), pw = 3 + Math.floor(H(seed + i) * 7), ph = 2 + Math.floor(H(seed + i * 2) * 3);
    box(g, px, py, pw, ph, wood[3]); box(g, px, py, pw, 1, wood[1]); box(g, px - 1, py - 1, pw + 1, 1, P[5]); speckle(g, px, py, pw, ph, 2, wood[4], seed + i);
  }
  streaks(g, x, y, w, Math.min(h, 40), Math.ceil(w / 30), 'rgba(60, 46, 30, 0.22)', seed + 77);
};
/** Shingles tab by tab: each its tone, its butt shaded, a few gone (the felt black under), moss. */
export const shingles = (g: Ctx, x: number, y: number, w: number, h: number, base: string, seed: number) => {
  const S = r6(base);
  for (let row = 0, yy = y; yy < y + h; row++, yy += 5) {
    for (let xx = x - (row % 2 ? 4 : 0); xx < x + w; xx += 8) {
      const t = H(seed + row * 13.1 + xx * 0.71), l = Math.max(x, xx), r = Math.min(x + w, xx + 7);
      if (r <= l) continue;
      if (t > 0.95) { box(g, l, yy, r - l, 5, '#141010'); continue; }
      box(g, l, yy, r - l, 5, S[t < 0.3 ? 2 : t < 0.7 ? 3 : 4]); box(g, l, yy + 4, r - l, 1, S[0]); box(g, l, yy, 1, 4, S[1]);
      if (H(t * 99) > 0.85) { box(g, l + 2, yy + 2, 3, 2, '#4A6A2A'); box(g, l + 2, yy + 2, 1, 1, '#7A9A4A'); }
    }
  }
};
/** A dense ball of smoke (or cloud): stepped shells, lit up its upper left, specks through it. */
export const puff = (g: Ctx, cx: number, cy: number, r: number, T: string[], seed: number) => {
  pixelBlob(g, cx, cy, r, r * 0.8, T[0]);
  pixelBlob(g, cx - r * 0.12, cy - r * 0.12, r * 0.8, r * 0.64, T[1]);
  pixelBlob(g, cx - r * 0.25, cy - r * 0.25, r * 0.55, r * 0.44, T[2]);
  pixelBlob(g, cx - r * 0.38, cy - r * 0.36, r * 0.28, r * 0.22, T[3]);
  speckle(g, cx - r * 0.7, cy - r * 0.5, r * 1.4, r, Math.ceil(r * 0.8), T[0], seed);
  speckle(g, cx - r * 0.6, cy - r * 0.6, r, r * 0.6, Math.ceil(r * 0.4), T[3], seed + 5);
};
/** Grass blades over a lawn's top band. */
export const blades = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed: number) => {
  for (let i = 0; i < Math.ceil(w * h / 6); i++) {
    const bx = x + Math.floor(H(seed + i * 1.91) * w), by = y + Math.floor(H(seed + i * 2.73) * h), bl = 2 + Math.floor(H(seed + i) * 4);
    box(g, bx, by - bl, 1, bl, R[1 + Math.floor(H(seed + i * 4.1) * (R.length - 1))]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// People, grossed up

export interface Gross {
  skin: string; hair: string; seed: number;
  shirt: string; pants: string; shoes?: string;
  /** arms up (screaming), clutching (forward), or one up (pointing, running). */
  pose: 'up' | 'clutch' | 'run';
  hawaiian?: boolean; overalls?: boolean; hat?: 'straw' | 'ranger' | 'beanie'; soot?: boolean; frost?: boolean; camera?: boolean;
}
/** The head: 22 x 26 from (cx - 11, top). Pupils are drawn live (pupils()). */
export const grossHead = (g: Ctx, cx: number, top: number, o: Gross) => {
  const S = r6(o.skin), sd = o.seed, my = top + 13, HR = r6(o.hair);
  // (the ears: their whorls, the hair out of them)
  for (const s of [-1, 1]) {
    const ex = s < 0 ? cx - 13 : cx + 10;
    box(g, ex - 1, my - 4, 5, 9, INK); box(g, ex, my - 3, 3, 7, S[3]); box(g, ex + (s < 0 ? 1 : 0), my - 2, 2, 5, S[1]); box(g, ex + (s < 0 ? 1 : 1), my - 1, 1, 2, '#B04A4A');
    box(g, ex + (s < 0 ? 0 : 2), my - 3, 1, 1, S[5]); box(g, s < 0 ? ex - 1 : ex + 3, my, 1, 1, HR[1]); box(g, s < 0 ? ex - 2 : ex + 4, my - 1, 1, 1, HR[1]);
  }
  // (the head: inked, lit up its left, shaded down its right and under the jaw)
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, my, 11, 13.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = S[3]; g.beginPath(); g.ellipse(cx, my, 10, 12.5, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.ellipse(cx, my, 10, 12.5, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = S[2]; g.beginPath(); g.ellipse(cx + 6, my + 2, 6, 13, 0, 0, Math.PI * 2); g.fill();
  checker(g, cx + 1, top, 4, 26, S[2], 0, 1);
  g.fillStyle = S[4]; g.beginPath(); g.ellipse(cx - 4, my - 4, 5, 7, 0, 0, Math.PI * 2); g.fill();
  checker(g, cx - 9, my - 10, 9, 14, S[4], 1, 1);
  box(g, cx - 10, my + 7, 20, 6, S[2]); checker(g, cx - 10, my + 5, 20, 2, S[2], 0, 1); box(g, cx - 10, my + 10, 20, 3, S[1]);
  // (every pore; red blotches; a mole with its hair)
  for (let py = -12; py <= 12; py++) for (let px = -10; px <= 10; px++) {
    const h = H(sd + px * 13.1 + py * 7.7);
    if (h < 0.13) box(g, cx + px, my + py, 1, 1, S[1]); else if (h > 0.965) box(g, cx + px, my + py, 1, 1, S[5]); else if (h > 0.94) box(g, cx + px, my + py, 1, 1, '#C25A5A');
  }
  box(g, cx + 6, my + 4, 2, 2, '#4A2A1A'); box(g, cx + 7, my + 2, 1, 2, INK);
  // (the forehead's wrinkles, waving, lit under each; the temple's vein, throbbing blue)
  for (const wy of [top + 4, top + 6, top + 8]) for (let x = cx - 7; x <= cx + 7; x++) { const up = H(x * 0.9 + wy) > 0.62 ? 1 : 0; box(g, x, wy + up, 1, 1, S[1]); box(g, x, wy + up + 1, 1, 1, S[5]); }
  for (let i = 0; i < 6; i++) box(g, cx - 9 + (i % 2), top + 4 + i, 1, 1, '#5A6A9A');
  for (let i = 0; i < 5; i++) box(g, cx + 8 - (i % 2), top + 5 + i, 1, 1, '#5A6A9A');
  // (the cheeks' folds down to the mouth corners; crow's feet)
  for (let i = 0; i < 6; i++) { box(g, cx - 6 + Math.floor(i / 3), top + 15 + i, 1, 1, S[0]); box(g, cx + 5 - Math.floor(i / 3), top + 15 + i, 1, 1, S[0]); }
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) box(g, cx + s * 9, top + 9 + i * 2, 1, 1, S[1]);
  // (stubble: the jaw dotted, darker under)
  for (let py = 3; py <= 12; py++) for (let px = -9; px <= 9; px++) if (H(sd * 0.7 + px * 3.3 + py * 9.1) < (py > 7 ? 0.5 : 0.25) && Math.abs(px) + py * 0.6 > 6) box(g, cx + px, my + py, 1, 1, mix(o.hair, S[2], 0.35));
  // (soot, or frost)
  if (o.soot) { for (let i = 0; i < 9; i++) pixelBlob(g, cx - 8 + H(sd + i) * 16, my - 8 + H(sd * 2 + i) * 18, 2 + H(i) * 3, 2 + H(i * 3) * 2, 'rgba(20, 12, 8, 0.55)'); }
  if (o.frost) { checker(g, cx - 10, top, 20, 26, 'rgba(200, 230, 255, 0.35)', 0, 1); speckle(g, cx - 10, top, 20, 26, 40, '#F4FBFF', sd + 9); }
  g.restore();
  // (the brows: bushy, raised in the middle, hair by hair)
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { const bx = cx + s * (2 + i), by = top + 7 + Math.floor(i * 0.5) - (i < 2 ? 1 : 0); box(g, bx, by, 1, 2, HR[i % 2 ? 1 : 2]); if (i % 3 === 0) box(g, bx + s, by - 1, 1, 1, HR[1]); }
  // (the eyes: bulging whites, inked, bloodshot from their corners, the bags under, dark rings)
  for (const s of [-1, 1]) {
    const ex = s < 0 ? cx - 8 : cx + 2, ey = top + 9;
    box(g, ex - 1, ey - 1, 8, 7, INK); box(g, ex, ey, 6, 5, '#F2EEDC'); box(g, ex, ey + 3, 6, 2, '#E2D2C0'); box(g, ex + 1, ey, 3, 1, '#FFFFFF');
    const outer = s < 0 ? ex : ex + 5, inner = s < 0 ? ex + 5 : ex;
    box(g, outer, ey + 2, 1, 1, '#C8282A'); box(g, outer + (s < 0 ? 1 : -1), ey + 1, 1, 1, '#C8282A'); box(g, outer + (s < 0 ? 1 : -1), ey + 3, 1, 1, '#D8484A'); box(g, outer + (s < 0 ? 2 : -2), ey + 4, 1, 1, '#C8282A');
    box(g, inner, ey + 3, 1, 1, '#E07A80'); box(g, inner, ey + 1, 1, 1, '#D8484A');
    box(g, ex, ey + 6, 6, 1, S[1]); box(g, ex + 1, ey + 7, 4, 1, '#6A4A5A'); box(g, ex + 1, ey + 6, 4, 1, '#7A5A6A');
  }
  // (the nose: a bulb, its veins, the nostrils and the hair out of them)
  box(g, cx - 1, top + 12, 2, 4, S[2]); box(g, cx - 1, top + 12, 1, 4, S[4]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, top + 17, 3.5, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = mix(S[3], '#C25A5A', 0.3); g.beginPath(); g.ellipse(cx, top + 17, 2.5, 2.2, 0, 0, Math.PI * 2); g.fill();
  box(g, cx - 2, top + 15, 2, 1, S[5]); box(g, cx + 1, top + 17, 1, 1, '#A03A3A');
  box(g, cx - 2, top + 18, 1, 1, INK); box(g, cx + 1, top + 18, 1, 1, INK); box(g, cx - 2, top + 19, 1, 1, HR[1]); box(g, cx + 2, top + 19, 1, 1, HR[1]);
  // (the mouth: screaming wide, lips cracked, the gums, each tooth (one gone, one gold), the tongue, the uvula, drool)
  const mx = cx, mt = top + 20;
  g.fillStyle = INK; g.beginPath(); g.ellipse(mx, mt + 3, 5.5, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#A8505A'; g.beginPath(); g.ellipse(mx, mt + 3, 5, 3.6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2A0606'; g.beginPath(); g.ellipse(mx, mt + 3, 4, 2.6, 0, 0, Math.PI * 2); g.fill();
  box(g, mx - 3, mt + 1, 7, 1, '#E07A88');
  for (let t = -3; t <= 3; t++) { const gone = (sd + t) % 7 === 0, gold = (sd + t) % 5 === 0; box(g, mx + t, mt + 2, 1, 2, gone ? '#2A0606' : gold ? '#E8C25A' : t % 2 ? '#F2E8C8' : '#D8C890'); }
  for (let t = -2; t <= 2; t++) box(g, mx + t, mt + 5, 1, 1, t % 2 ? '#E8DCB0' : '#C8B880');
  box(g, mx - 2, mt + 4, 4, 1, '#C0505A'); box(g, mx, mt + 2, 1, 1, '#E07A88');
  box(g, mx - 4, mt + 1, 1, 1, '#E8B0B0'); box(g, mx + 2, mt + 6, 1, 1, '#E8B0B0'); box(g, mx + 4, mt + 3, 1, 1, '#E8B0B0');
  box(g, mx + 5, mt + 4, 1, 3, 'rgba(200, 224, 240, 0.8)');
  // (sweat beads: lit, dark under; a run or two)
  for (let i = 0; i < 8; i++) {
    const bx = cx - 8 + Math.floor(H(sd + i * 2.3) * 16), by = top + 3 + Math.floor(H(sd + i * 4.1) * (i < 5 ? 6 : 14));
    box(g, bx, by, 2, 2, '#CFE4EE'); box(g, bx, by, 1, 1, '#FFFFFF'); box(g, bx + 1, by + 2, 1, 1, S[1]);
    if (i % 3 === 0) box(g, bx + 1, by + 2, 1, 3, 'rgba(207, 228, 238, 0.6)');
  }
  // (the hair: a greasy comb-over strand by strand, the scalp shining between; or the hat)
  if (o.hat === 'beanie') {
    box(g, cx - 12, top - 3, 24, 9, INK); box(g, cx - 11, top - 2, 22, 7, '#B91C1C'); for (let k = -10; k < 11; k += 2) box(g, cx + k, top - 2, 1, 7, '#8A1414'); box(g, cx - 11, top + 3, 22, 2, '#E8E0D0'); box(g, cx - 3, top - 6, 6, 4, '#E8E0D0');
  } else {
    box(g, cx - 5, top + 1, 6, 2, S[5]);
    for (let i = 0; i < 9; i++) { const sy = top - 1 + Math.floor(i / 3); g.fillStyle = HR[i % 3 === 0 ? 3 : 1]; g.fillRect(cx - 10 + i, sy, 14 - i, 1); }
    for (let i = 0; i < 5; i++) box(g, cx - 11, top + 2 + i * 2, 2, 2, HR[i % 2 ? 1 : 2]);
    box(g, cx + 9, top + 2, 2, 6, HR[1]);
    if (o.hat === 'straw') {
      box(g, cx - 17, top + 1, 34, 3, INK); box(g, cx - 16, top + 1, 32, 2, '#D8B860'); for (let k = -16; k < 16; k += 3) box(g, cx + k, top + 1, 1, 2, '#A88838');
      box(g, cx - 10, top - 8, 20, 10, INK); box(g, cx - 9, top - 7, 18, 8, '#E8C870'); for (let k = -9; k < 9; k += 2) box(g, cx + k, top - 7, 1, 8, '#C8A850'); box(g, cx - 9, top - 1, 18, 2, '#8A2A1A');
      speckle(g, cx - 16, top - 7, 32, 10, 6, '#3A2A10', sd + 31);
    } else if (o.hat === 'ranger') {
      box(g, cx - 17, top + 1, 34, 3, INK); box(g, cx - 16, top + 1, 32, 2, '#7A6A3A'); box(g, cx - 16, top + 1, 32, 1, '#9A8A5A');
      poly(g, [[cx - 10, top + 2], [cx - 6, top - 9], [cx, top - 6], [cx + 6, top - 9], [cx + 10, top + 2]], INK);
      poly(g, [[cx - 9, top + 1], [cx - 6, top - 8], [cx, top - 5], [cx + 6, top - 8], [cx + 9, top + 1]], '#8A7A4A'); box(g, cx - 9, top - 1, 18, 2, '#4A3A1A');
      speckle(g, cx - 10, top - 8, 20, 10, 8, '#3A2E14', sd + 33);
    }
  }
};
/** Where a head's pupils go (from its top-middle). */
export const eyesOf = (cx: number, top: number): [number, number][] => [[cx - 5, top + 11], [cx + 5, top + 11]];
/** The pupils, live: pinpricks, quivering. */
export const pupils = (c: Ctx, cx: number, top: number, f: number, seed: number) => {
  for (const [ex, ey] of eyesOf(cx, top)) {
    const jx = H(Math.floor(f / 2) + seed + ex) > 0.5 ? 1 : 0, jy = H(Math.floor(f / 3) * 1.7 + seed) > 0.6 ? 1 : 0;
    box(c, ex - 1 + jx, ey - 1 + jy, 2, 2, INK); box(c, ex - 2 + jx, ey - 1 + jy, 1, 2, '#6A4A20');
  }
  // (a drip off his brow, falling)
  const t = (f + seed * 7) % 40;
  if (t < 24) box(c, cx - 6 + (seed % 5) * 2, top + 6 + t, 1, 2, '#CFE4EE');
};
/** A whole person, feet at (cx, foot): the head's top at foot - 76. Clothes wrinkled, sweat-stained, food down them. */
export const grossPerson = (g: Ctx, cx: number, foot: number, o: Gross) => {
  const SK = r6(o.skin), SH = r6(o.shirt), PA = r6(o.pants), sd = o.seed, tt = foot - 50, hip = foot - 26;
  // (the legs: the pants' creases, knee wrinkles, a stain; the shoes, scuffed, laces)
  for (const s of [-1, 1]) {
    const lx = s < 0 ? cx - 9 : cx + 1, sp = o.pose === 'run' ? s * 3 : 0;
    box(g, lx - 1 + sp, hip, 9, 23, INK); box(g, lx + sp, hip, 7, 22, PA[3]); box(g, lx + sp, hip, 2, 22, PA[4]); box(g, lx + 5 + sp, hip, 2, 22, PA[1]);
    for (const ky of [hip + 9, hip + 11, hip + 18]) { box(g, lx + 1 + sp, ky, 5, 1, PA[1]); box(g, lx + 2 + sp, ky + 1, 3, 1, PA[5]); }
    box(g, lx + 3 + sp, hip + 2, 1, 6, PA[2]);
    const sh = o.shoes ?? '#3A2A1E';
    box(g, lx - 2 + sp + (s < 0 ? -1 : 0), foot - 5, 11, 5, INK); box(g, lx - 1 + sp + (s < 0 ? -1 : 0), foot - 4, 9, 4, sh); box(g, lx - 1 + sp + (s < 0 ? -1 : 0), foot - 4, 9, 1, mix(sh, '#FFFFFF', 0.3));
    box(g, lx + 1 + sp, foot - 3, 3, 1, '#E8E0D0'); box(g, lx + 5 + sp, foot - 2, 2, 1, mix(sh, '#FFFFFF', 0.5));
  }
  speckle(g, cx - 9, hip + 2, 18, 18, 10, PA[1], sd + 3);
  pixelBlob(g, cx - 5, hip + 4, 3, 2, 'rgba(40, 30, 20, 0.45)');
  // (the torso: the shirt over the gut, its folds pulling from the pits, the pit stains, food down it, the buttons straining)
  box(g, cx - 12, tt - 1, 24, 27, INK);
  box(g, cx - 11, tt, 22, 26, SH[3]); box(g, cx - 11, tt, 4, 26, SH[4]); box(g, cx + 7, tt, 4, 26, SH[1]); checker(g, cx + 4, tt, 3, 26, SH[2], 0, 1);
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx + 1, tt + 18, 12, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = SH[3]; g.beginPath(); g.ellipse(cx + 1, tt + 18, 11, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = SH[4]; g.beginPath(); g.ellipse(cx - 3, tt + 15, 6, 4, 0, 0, Math.PI * 2); g.fill();
  box(g, cx - 10, tt + 23, 22, 3, SH[1]);
  for (let i = 0; i < 6; i++) { box(g, cx - 9 + i * 2, tt + 3 + i, 2, 1, SH[1]); box(g, cx - 9 + i * 2, tt + 4 + i, 2, 1, SH[5]); box(g, cx + 9 - i * 2, tt + 3 + i, 2, 1, SH[1]); }
  for (let i = 0; i < 4; i++) { box(g, cx - 6 + i * 4, tt + 12 + (i % 2), 3, 1, SH[1]); }
  for (const s of [-1, 1]) { pixelBlob(g, cx + s * 9, tt + 5, 4, 5, mix(SH[1], '#6A5A20', 0.3)); checker(g, cx + s * 9 - 5, tt + 9, 10, 3, SH[1], 0, 1); }
  if (o.hawaiian) for (let i = 0; i < 14; i++) { const fx = cx - 10 + Math.floor(H(sd + i * 3.1) * 20), fy = tt + 1 + Math.floor(H(sd + i * 5.7) * 24); box(g, fx, fy, 3, 1, '#F8E060'); box(g, fx + 1, fy - 1, 1, 3, '#F8E060'); box(g, fx + 1, fy, 1, 1, '#E04A2A'); box(g, fx + 3, fy + 1, 2, 1, '#2A8A3A'); }
  if (o.overalls) { box(g, cx - 8, tt + 10, 16, 16, PA[3]); box(g, cx - 8, tt + 10, 16, 1, PA[4]); for (const s of [-1, 1]) box(g, cx + s * 6 - 1, tt, 2, 10, PA[3]); box(g, cx - 3, tt + 13, 6, 4, PA[2]); box(g, cx - 7, tt + 11, 1, 1, '#E8C25A'); box(g, cx + 6, tt + 11, 1, 1, '#E8C25A'); }
  for (let i = 0; i < 4; i++) box(g, cx, tt + 4 + i * 5, 1, 1, '#E8E0D0');
  pixelBlob(g, cx - 4, tt + 14, 2, 2, '#D8A820'); box(g, cx - 4, tt + 15, 1, 3, '#D8A820'); pixelBlob(g, cx + 5, tt + 8, 2, 1, '#9A1A12'); box(g, cx + 5, tt + 9, 1, 2, '#9A1A12');
  if (o.soot) checker(g, cx - 11, tt, 22, 26, 'rgba(20, 12, 8, 0.4)', 0, 1);
  if (o.frost) { speckle(g, cx - 11, tt, 22, 26, 30, '#F4FBFF', sd + 4); box(g, cx - 11, tt, 22, 2, '#E8F4FC'); }
  // (the collar, the neck: its folds, its Adam's apple)
  poly(g, [[cx - 6, tt], [cx, tt + 6], [cx + 6, tt]], SH[5]); poly(g, [[cx - 4, tt], [cx, tt + 4], [cx + 4, tt]], SK[2]);
  box(g, cx - 4, tt - 4, 8, 5, INK); box(g, cx - 3, tt - 4, 6, 5, SK[2]); box(g, cx - 1, tt - 2, 2, 2, SK[4]); box(g, cx - 3, tt - 1, 6, 1, SK[1]);
  if (o.camera) { box(g, cx - 6, tt + 8, 10, 7, INK); box(g, cx - 5, tt + 9, 8, 5, '#2A2A2E'); box(g, cx - 2, tt + 10, 3, 3, '#6A8AAA'); box(g, cx - 1, tt + 10, 1, 1, '#FFFFFF'); for (const s of [-1, 1]) box(g, cx + s * 4, tt, 1, 9, '#1A1A1A'); }
  // (the arms: sleeves to the elbow, the forearms hairy, the hands splayed, finger by finger, knuckles)
  const arm = (sx: number, sy: number, hx: number, hy: number) => {
    // (front-on: the elbow out to his side, never in toward his head or chest: src/m2/art/limb.ts)
    const bone = halfBone(sx, sy, hx, hy, 6, 1.01), [ex, ey] = elbowFront(sx, sy, hx, hy, bone, bone, sx < cx ? -1 : 1);
    g.lineCap = 'round';
    g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke();
    g.strokeStyle = SH[3]; g.lineWidth = 5; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
    g.strokeStyle = SK[3]; g.beginPath(); g.moveTo(ex, ey); g.lineTo(hx, hy); g.stroke();
    g.strokeStyle = SK[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(ex - 1, ey); g.lineTo(hx - 1, hy); g.stroke();
    g.lineCap = 'butt';
    for (let i = 0; i < 6; i++) { const t = 0.15 + i * 0.13; box(g, ex + (hx - ex) * t + (i % 2 ? 1 : -1), ey + (hy - ey) * t, 1, 1, mix(o.hair, SK[2], 0.2)); }
    box(g, hx - 4, hy - 4, 8, 8, INK); box(g, hx - 3, hy - 3, 6, 6, SK[3]); box(g, hx - 3, hy - 3, 2, 2, SK[4]);
    for (let i = 0; i < 4; i++) { const fx = hx - 4 + i * 2 + (i > 1 ? 1 : 0), fy = hy - 6 - (i === 1 || i === 2 ? 1 : 0); box(g, fx - 1, fy - 1, 2, 4, INK); box(g, fx, fy, 1, 3, SK[3]); box(g, fx, fy + 3, 1, 1, SK[1]); }
    box(g, hx + 4, hy - 1, 2, 2, SK[3]); box(g, hx - 2, hy - 1, 1, 1, SK[1]); box(g, hx, hy - 1, 1, 1, SK[1]);
  };
  if (o.pose === 'up') { arm(cx - 10, tt + 2, cx - 20, tt - 26); arm(cx + 10, tt + 2, cx + 21, tt - 24); }
  else if (o.pose === 'clutch') { arm(cx - 10, tt + 2, cx + 12, tt + 12); arm(cx + 10, tt + 2, cx + 16, tt + 6); }
  else { arm(cx - 10, tt + 2, cx - 22, tt - 20); arm(cx + 10, tt + 2, cx + 18, tt + 16); }
  grossHead(g, cx, foot - 76, o);
};
