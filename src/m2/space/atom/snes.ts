// The giant atom's and the ride's painting kit (on top of the intro's: kit.ts), the SNES way: every rounded thing in
// stepped bands of its ramp (lit from the upper left), the steps dithered where they meet, an ink line round it; neon in
// stepped halos (no smooth gradients anywhere).

import { INK, box, text, rampOf, mix, lite, dark, checker, steppedGlow, PIX } from '../../intro/art/kit';

type Ctx = CanvasRenderingContext2D;

/** Bands down a cylinder (fractions of its width): highlight off-center toward the light, shade round the far side. */
const CYL: [number, number, number][] = [[0, 0.1, 1], [0.1, 0.2, 3], [0.2, 0.32, 4], [0.32, 0.5, 3], [0.5, 0.7, 2], [0.7, 0.86, 1], [0.86, 1, 0]];

/** A cylinder (a pipe, a barrel, a rocket's body, a tube): lying along x (`axis` 'x': its bands run along it, lit along
 *  the top) or standing up ('y': lit down the left). Stepped, each seam dithered; ink round it. */
export const cyl = (c: Ctx, x: number, y: number, w: number, h: number, col: string, axis: 'x' | 'y' = 'x', ink = true) => {
  const r = rampOf(col);
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  if (ink) box(c, x - 2, y - 2, w + 4, h + 4, INK);
  const span = axis === 'x' ? h : w;
  let prev: string | null = null;
  for (const [a, b, k] of CYL) {
    const p0 = Math.round(span * a), p1 = Math.round(span * b), col_ = r[k];
    if (p1 <= p0) continue;
    if (axis === 'x') box(c, x, y + p0, w, p1 - p0, col_); else box(c, x + p0, y, p1 - p0, h, col_);
    // (the seam: the last band's color dithered a cell into this one)
    if (prev && span > 10) { if (axis === 'x') checker(c, x, y + p0, w, PIX, prev); else checker(c, x + p0, y, PIX, h, prev); }
    prev = col_;
  }
};

/** A sphere (a planet, a ball, a lamp): stepped crescents of its ramp toward the upper left, each edge dithered into the
 *  one under it, an ink rim (unless `ink` is false). */
export const sphere = (c: Ctx, x: number, y: number, R: number, col: string, ink = true, steps = 4) => {
  const r = rampOf(col);
  if (ink) { c.fillStyle = INK; c.beginPath(); c.arc(x, y, R + 2, 0, Math.PI * 2); c.fill(); }
  c.save(); c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.clip();
  box(c, x - R - 2, y - R - 2, R * 2 + 4, R * 2 + 4, r[0]);
  for (let i = 1; i <= steps; i++) {
    const k = i / steps, ox = x - R * 0.34 * k, oy = y - R * 0.34 * k, rr = R * (1.02 - 0.62 * k);
    const ci = r[Math.min(4, i)];
    // (the step's skirt: a ring of dither a cell or two out)
    c.save(); c.beginPath(); c.arc(ox, oy, rr + Math.max(2, R * 0.06), 0, Math.PI * 2); c.clip();
    checker(c, Math.floor(ox - rr - 6), Math.floor(oy - rr - 6), rr * 2 + 12, rr * 2 + 12, ci, i % 2);
    c.restore();
    c.fillStyle = ci; c.beginPath(); c.arc(ox, oy, rr, 0, Math.PI * 2); c.fill();
  }
  c.restore();
};

/** Words in neon (tubes on a backing): a wide stepped halo of the tube's color, its dark outline, the tube, a hot core
 *  line through it. Off (`on` false): dead gray tubes. */
export const neonText = (c: Ctx, s: string, x: number, y: number, col: string, size = 12, on = true, halo = true) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center';
  if (on && halo) {
    // (the halo: the words fattened out in rings, fainter outward)
    for (const [d, a] of [[3, 0.1], [2, 0.16]] as const) {
      c.globalAlpha = a; c.fillStyle = col;
      for (const [dx, dy] of [[-d, 0], [d, 0], [0, -d], [0, d], [-d, -d], [d, d], [-d, d], [d, -d]]) c.fillText(s, x + dx, y + dy);
    }
    c.globalAlpha = 1;
  }
  const tube = on ? col : '#3F3F46', edge = on ? dark(col, 0.45) : '#18181B';
  c.fillStyle = edge;
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) c.fillText(s, x + dx, y + dy);
  c.fillStyle = tube; c.fillText(s, x, y);
  if (on) {
    // (the hot core: the top half of each stroke near white)
    c.save(); c.beginPath(); c.rect(x - 2000, y - size, 4000, size * 0.45); c.clip();
    c.fillStyle = lite(col, 0.6); c.fillText(s, x, y);
    c.restore();
  }
  c.textAlign = 'left';
};

/** A neon tube (a straight run of it, lit or dead), w x h, with a stepped glow round it while lit. */
export const neonBar = (c: Ctx, x: number, y: number, w: number, h: number, col: string, on = true) => {
  if (on) for (const [d, a] of [[8, 0.1], [5, 0.16], [2, 0.26]] as const) { c.globalAlpha = a; box(c, x - d, y - d, w + d * 2, h + d * 2, col); }
  c.globalAlpha = 1;
  box(c, x - 1, y - 1, w + 2, h + 2, on ? dark(col, 0.4) : '#18181B');
  box(c, x, y, w, h, on ? col : '#3F3F46');
  if (on) box(c, x + (w > h ? 0 : Math.floor(w / 3)), y + (w > h ? Math.floor(h / 3) : 0), w > h ? w : Math.max(1, Math.floor(w / 3)), w > h ? Math.max(1, Math.floor(h / 3)) : h, lite(col, 0.65));
};

/** A lamp: a little stepped glow, its bulb (a ball), lit or dark. */
export const lamp = (c: Ctx, x: number, y: number, r: number, col: string, on: boolean, glow = 3) => {
  if (on && glow > 0) steppedGlow(c, x, y, r * glow, col, 0.42, 0.06, 4);
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1.5, 0, Math.PI * 2); c.fill();
  const rp = rampOf(on ? col : mix(col, '#18181B', 0.72));
  c.fillStyle = rp[2]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = rp[3]; c.beginPath(); c.arc(x - r * 0.25, y - r * 0.25, r * 0.6, 0, Math.PI * 2); c.fill();
  box(c, x - r * 0.5, y - r * 0.55, Math.max(1, r * 0.35), Math.max(1, r * 0.35), on ? '#FFFFFF' : rp[4]);
};

/** A steel lattice (a truss, a gantry's leg): two chords and zig-zag webbing between, lying along x (or up, `up`). */
export const truss = (c: Ctx, x: number, y: number, w: number, h: number, col: string, up = false) => {
  const r = rampOf(col), t = 4;
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  const len = up ? h : w, dep = up ? w : h, bay = Math.max(16, dep);
  c.lineWidth = 4; c.strokeStyle = INK; c.beginPath();
  for (let p = 0; p < len - 1; p += bay) {
    const q = Math.min(len, p + bay);
    if (up) { c.moveTo(x + t, y + p); c.lineTo(x + w - t, y + q); } else { c.moveTo(x + p, y + h - t); c.lineTo(x + q, y + t); }
  }
  c.stroke();
  c.lineWidth = 2; c.strokeStyle = r[1]; c.stroke();
  // (the chords)
  if (up) {
    box(c, x - 1, y, t + 2, h, INK); box(c, x + w - t - 1, y, t + 2, h, INK);
    box(c, x, y, t, h, r[3]); box(c, x, y, 1, h, r[4]); box(c, x + w - t, y, t, h, r[2]); box(c, x + w - 1, y, 1, h, r[1]);
  } else {
    box(c, x, y - 1, w, t + 2, INK); box(c, x, y + h - t - 1, w, t + 2, INK);
    box(c, x, y, w, t, r[3]); box(c, x, y, w, 1, r[4]); box(c, x, y + h - t, w, t, r[2]); box(c, x, y + h - 1, w, 1, r[1]);
  }
};

/** A row of rivets (a seam's), `step` apart along x from x0 to x1 at y. */
export const rivets = (c: Ctx, x0: number, x1: number, y: number, col: string, step = 12) => {
  const r = rampOf(col);
  for (let x = x0; x <= x1; x += step) { box(c, x, y, 2, 2, r[0]); box(c, x, y, 1, 1, r[4]); }
};

/** Hazard stripes (yellow and black, leaning), clipped to x, y, w, h. */
export const hazard = (c: Ctx, x: number, y: number, w: number, h: number, a = '#FACC15', b = '#1C1917', step = 12) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  box(c, x, y, w, h, b);
  c.fillStyle = a;
  for (let k = -h; k < w + h; k += step * 2) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + step, y + h); c.lineTo(x + k + step + h, y); c.lineTo(x + k + h, y); c.closePath(); c.fill(); }
  // (a lit edge along the top of the lot)
  box(c, x, y, w, 1, lite(a, 0.5));
  c.restore();
};

/** A screen (a TV, a monitor) showing `col`: its bezel, its glass in bands (brighter at the top), scanlines, a glint. */
export const screenGlass = (c: Ctx, x: number, y: number, w: number, h: number, col: string, f: number, bezel = '#27272A') => {
  const b = rampOf(bezel), g = rampOf(col);
  box(c, x - 6, y - 6, w + 12, h + 12, INK);
  box(c, x - 5, y - 5, w + 10, h + 10, b[2]); box(c, x - 5, y - 5, w + 10, 2, b[4]); box(c, x - 5, y - 5, 2, h + 10, b[3]);
  box(c, x - 5, y + h + 3, w + 10, 2, b[0]);
  const band = Math.max(4, Math.round(h / 5));
  box(c, x, y, w, h, g[2]);
  box(c, x, y, w, band, g[3]); checker(c, x, y + band, w, PIX, g[3]);
  box(c, x, y + h - band, w, band, g[1]); checker(c, x, y + h - band - PIX, w, PIX, g[1], 1);
  // (the scanlines, rolling)
  c.globalAlpha = 0.22; for (let yy = y + ((f >> 2) % 4); yy < y + h; yy += 4) box(c, x, yy, w, 1, g[0]); c.globalAlpha = 1;
  box(c, x + 4, y + 3, Math.max(4, w * 0.18), 2, '#FFFFFF'); box(c, x + 4, y + 5, 2, Math.max(2, h * 0.16), lite(g[3], 0.5));
};

/** Words stenciled on (a crate's, a flat's), worn: the paint broken up by a dither of what's under it (`under`). */
export const stencil = (c: Ctx, s: string, x: number, y: number, col: string, under: string, size = 6) => {
  text(c, s, x, y, col, size, 'center', null);
  c.font = `${size}px "Press Start 2P"`;
  const w = c.measureText(s).width;
  c.save(); c.beginPath(); c.rect(x - w / 2, y - size, w, size * 0.5); c.clip();
  checker(c, Math.floor((x - w / 2) / 2) * 2, y - size, w + 2, size, under, 1, 2);
  c.restore();
};
