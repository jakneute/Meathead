// Meathead 2's cast, drawn: the pieces every one of them is built from. Big-headed cartoon people (about 70 tall),
// inked round every shape, lit from the left (a lighter edge), shaded down the right; feet at (0, 0), facing right
// (the caller mirrors them). Each character (people.ts) is these, put together and dressed their own way.

import { mix } from '../../m1/game/render/backdrops/core';

export type Ctx = CanvasRenderingContext2D;
export const INK = '#1A0B06';

/** A color darker (toward ink) or lighter. */
const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
// (the engine's mix (fast, the same colors) for the usual 0..1; anything else the old way)
const mixc = (a: string, b: string, k: number) => { if (k >= 0 && k <= 1) return mix(a, b, k); const A = hex(a), B = hex(b); return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')}`; };
export const dk = (c: string, k = 0.25) => mixc(c, '#1A0B06', k);
export const lt = (c: string, k = 0.25) => mixc(c, '#FFFFFF', k);

/** A shape filled and inked, lit down its left and shaded down its right (`x0..x1` its extent across). */
export const blob = (c: Ctx, path: () => void, color: string, x0: number, x1: number, line = 1.2) => {
  c.beginPath(); path(); c.fillStyle = color; c.fill();
  c.save(); c.beginPath(); path(); c.clip();
  const w = x1 - x0;
  c.fillStyle = dk(color, 0.22); c.fillRect(x0 + w * 0.68, -400, w, 800);
  c.fillStyle = lt(color, 0.18); c.fillRect(x0, -400, Math.max(1.2, w * 0.12), 800);
  c.restore();
  c.beginPath(); path(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke();
};
export const rect = (c: Ctx, x: number, y: number, w: number, h: number, color: string, r = 2) => blob(c, () => c.roundRect(x, y, w, h, r), color, x, x + w);
export const dot = (c: Ctx, x: number, y: number, w: number, h: number, color: string) => { c.fillStyle = color; c.fillRect(x, y, w, h); };

/** Two legs from the hips down: trousers, shorts (skin below the knee), or under a skirt (`style`), and the shoes. */
export const legs = (c: Ctx, hipY: number, gap: number, w: number, color: string, skin: string, shoe: string, style: 'pants' | 'shorts' | 'skirt' = 'pants', shoeL = 9) => {
  for (const s of [-1, 1]) {
    const x = s * gap - w / 2, knee = hipY * 0.45;
    if (style === 'pants') rect(c, x, hipY, w, -hipY - 3, s < 0 ? dk(color, 0.12) : color, 1.5);
    else {
      rect(c, x + 0.5, knee, w - 1, -knee - 3, skin, 1.5);
      if (style === 'shorts') rect(c, x - 0.5, hipY, w + 1, knee - hipY + 2, s < 0 ? dk(color, 0.12) : color, 1.5);
    }
    blob(c, () => c.roundRect(x - 1 + (s > 0 ? 1 : 0), -4.5, shoeL, 5, [2, 3, 1, 1]), shoe, x - 1, x + shoeL);
  }
};

/** A torso from the hips up to the shoulders, `w` across at the shoulders, `hipW` at the hips (a pear, an apple, a box). */
export const torso = (c: Ctx, hipY: number, shY: number, w: number, hipW: number, color: string) =>
  blob(c, () => { c.moveTo(-hipW / 2, hipY + 2); c.lineTo(-w / 2, shY + 4); c.quadraticCurveTo(-w / 2, shY, -w / 2 + 4, shY); c.lineTo(w / 2 - 4, shY); c.quadraticCurveTo(w / 2, shY, w / 2, shY + 4); c.lineTo(hipW / 2, hipY + 2); c.closePath(); }, color, -w / 2, w / 2);

/** An arm from the shoulder to the hand: the sleeve down `sleeve` of it (0 bare, 1 to the wrist), the hand round. */
export const arm = (c: Ctx, sx: number, sy: number, hx: number, hy: number, sleeveColor: string, skin: string, sleeve: number, w = 5.5) => {
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2.4; c.beginPath(); c.moveTo(sx, sy); c.lineTo(hx, hy); c.stroke();
  c.strokeStyle = skin; c.lineWidth = w; c.beginPath(); c.moveTo(sx, sy); c.lineTo(hx, hy); c.stroke();
  if (sleeve > 0) { c.strokeStyle = sleeveColor; c.lineWidth = w + 0.8; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + (hx - sx) * sleeve, sy + (hy - sy) * sleeve); c.stroke(); }
  c.lineCap = 'butt';
  blob(c, () => c.arc(hx, hy, w * 0.62, 0, Math.PI * 2), skin, hx - w * 0.62, hx + w * 0.62, 1);
};

/** A head: an oval at (x, y), its shading, its ears. */
export const head = (c: Ctx, x: number, y: number, rx: number, ry: number, skin: string, ears = true) => {
  if (ears) for (const s of [-1, 1]) blob(c, () => c.ellipse(x + s * rx * 0.98, y + 1, 2.4, 3.4, 0, 0, Math.PI * 2), skin, x + s * rx - 2, x + s * rx + 2, 1);
  blob(c, () => c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2), skin, x - rx, x + rx);
};

export type EyeStyle = 'open' | 'droopy' | 'tired' | 'wide' | 'smug' | 'angry' | 'closed' | 'dead';
/** A pair of cartoon eyes about (x, y), `gap` apart: whites, pupils looking `look` (-1..1), lids by `style`. */
export const eyes = (c: Ctx, x: number, y: number, gap: number, style: EyeStyle, f: number, look = 0.4, r = 2.6, lidColor = '#D9A877') => {
  const blink = (f + Math.round(x * 7)) % 211 < 5 && style !== 'closed';
  for (const s of [-1, 1]) {
    const ex = x + s * gap;
    if (style === 'closed' || blink) { c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ex - r, y); c.quadraticCurveTo(ex, y + 1.5, ex + r, y); c.stroke(); continue; }
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(ex, y, r, r * (style === 'wide' ? 1.35 : 1.15), 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
    c.fillStyle = style === 'dead' ? '#57534E' : INK; c.beginPath(); c.arc(ex + look * r * 0.45, y + (style === 'tired' ? 0.6 : 0.2), r * 0.5, 0, Math.PI * 2); c.fill();
    if (style !== 'dead') { c.fillStyle = '#FFFFFF'; c.fillRect(ex + look * r * 0.45 - 0.8, y - 0.9, 0.9, 0.9); }
    // (the lids)
    const lid = style === 'droopy' ? 0.55 : style === 'tired' || style === 'dead' ? 0.7 : style === 'smug' ? 0.45 : 0;
    if (lid) {
      // (a lid of his own skin down over it, its edge inked)
      c.save(); c.beginPath(); c.ellipse(ex, y, r + 0.4, r * 1.25, 0, 0, Math.PI * 2); c.clip();
      c.fillStyle = lidColor; c.fillRect(ex - r - 1, y - r * 1.3, r * 2 + 2, r * 2.5 * lid);
      c.restore();
      c.strokeStyle = INK; c.lineWidth = 1.1; c.beginPath(); c.moveTo(ex - r, y - r * 1.25 + r * 2.5 * lid); c.lineTo(ex + r, y - r * 1.25 + r * 2.5 * lid); c.stroke();
    }
    if (style === 'angry') { c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(ex - s * r - 0.5, y - r - 2.2); c.lineTo(ex + s * r * 0.6, y - r); c.stroke(); }
  }
};

export type MouthStyle = 'smile' | 'grin' | 'frown' | 'flat' | 'o' | 'smirk' | 'teeth' | 'talk';
/** A mouth about (x, y), `w` wide. 'talk' flaps with the frame. */
export const mouth = (c: Ctx, x: number, y: number, w: number, style: MouthStyle, f: number) => {
  c.strokeStyle = INK; c.lineWidth = 1.3; c.lineCap = 'round';
  const st = style === 'talk' ? (Math.floor(f / 6) % 3 === 0 ? 'o' : 'flat') : style;
  c.beginPath();
  if (st === 'smile') { c.moveTo(x - w / 2, y); c.quadraticCurveTo(x, y + w * 0.45, x + w / 2, y); c.stroke(); }
  else if (st === 'frown') { c.moveTo(x - w / 2, y + 1.5); c.quadraticCurveTo(x, y - w * 0.3, x + w / 2, y + 1.5); c.stroke(); }
  else if (st === 'flat') { c.moveTo(x - w / 2, y); c.lineTo(x + w / 2, y); c.stroke(); }
  else if (st === 'smirk') { c.moveTo(x - w / 2, y + 0.5); c.quadraticCurveTo(x + w * 0.2, y + 1, x + w / 2, y - 1.6); c.stroke(); }
  else if (st === 'o') { c.fillStyle = '#4A1D1D'; c.ellipse(x, y + 0.5, w * 0.22, w * 0.28, 0, 0, Math.PI * 2); c.fill(); c.stroke(); }
  else { // grin / teeth: an open grin, the top teeth
    c.fillStyle = '#4A1D1D'; c.moveTo(x - w / 2, y - 0.5); c.quadraticCurveTo(x, y + w * 0.6, x + w / 2, y - 0.5); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#FFFFFF'; c.fillRect(x - w / 2 + 1.2, y - 0.4, w - 2.4, st === 'teeth' ? 2.2 : 1.4);
  }
  c.lineCap = 'butt';
};

/** A nose: a dot of shade under a bump, `size` big (a long one if `long`). */
export const nose = (c: Ctx, x: number, y: number, size: number, skin: string, long = 0) =>
  blob(c, () => c.ellipse(x + long * 0.5, y, size * 0.7 + long * 0.5, size * 0.6, 0, 0, Math.PI * 2), dk(skin, 0.1), x - size, x + size + long, 1);

/** Glasses: round or square frames over the eyes. */
export const specs = (c: Ctx, x: number, y: number, gap: number, r: number, color: string, shape: 'round' | 'square' = 'round', tint?: string) => {
  for (const s of [-1, 1]) {
    c.beginPath();
    if (shape === 'round') c.arc(x + s * gap, y, r, 0, Math.PI * 2); else c.rect(x + s * gap - r, y - r * 0.8, r * 2, r * 1.6);
    if (tint) { c.fillStyle = tint; c.fill(); }
    c.strokeStyle = INK; c.lineWidth = 2.6; c.stroke(); c.strokeStyle = color; c.lineWidth = 1.3; c.stroke();
  }
  c.strokeStyle = color; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - gap + r, y); c.lineTo(x + gap - r, y); c.stroke();
};

/** The idle sway (a breath, a weight shift), different for each so the crowd doesn't move in step. */
export const breathe = (f: number, seed: number) => Math.sin(f * 0.05 + seed) * 0.7;
