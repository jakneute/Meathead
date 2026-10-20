// PUNCHY & KICKY's paint box (the SNES pass): the show's materials in six-step ramps (darkest first, lit from the upper
// left), and the gory-cartoon pieces every layer uses: the show's dripping lettering, a stepped splat of cartoon blood,
// drips off a ledge, a cartoon bone, a skull, the chalk outlines of a cat and a mouse, a riveted steel plate, a plank.
// Used near (for the hour) or as scenery (dimmed: none of it reads as somewhere to stand).

import type { Look } from '../../signLetters';
import { box, mix, hash, checker, dimmed, hour, rampH, INK, type Ctx } from '../kit';

/** The show's materials, darkest first. */
export const BLOOD = ['#2A0406', '#4E080C', '#7A0E14', '#B01C22', '#DC3A3A', '#F88A80'];
export const GORE = ['#3A0408', '#5E0A10', '#8E1218', '#C21E24', '#E8474A', '#FFB0A8'];
export const BONE = ['#6A5A40', '#9A8A68', '#C8B892', '#EADFC0', '#F8F0DA', '#FFFFF4'];
export const MUSTARD = ['#5A3A04', '#8A5E08', '#BC8A12', '#E8B424', '#F8D45A', '#FFF0A8'];
export const TAR = ['#08060A', '#141018', '#201A26', '#2E2636', '#463C50', '#665A72'];
export const CREAM = ['#8A7A60', '#B4A486', '#D8CAA8', '#EEE2C4', '#FAF2DC', '#FFFFF6'];
export const GINGER = ['#5A2606', '#8A3E0C', '#BE5E16', '#EA8A2E', '#F8B060', '#FFDAA4'];
export const MOUSEY = ['#3A3430', '#5A524C', '#7E766E', '#A8A29E', '#CCC8C2', '#EEEBE6'];
export const PLY = ['#4A2E12', '#74481E', '#9E6A30', '#C8924A', '#E2B676', '#F6DAA6'];
export const CRATE = ['#4A2C0A', '#76461A', '#A26A2A', '#C8963E', '#E4BC6E', '#F8E2A6'];
export const CONCRETE = ['#4A4650', '#6A6670', '#8E8A90', '#B0ACAE', '#CECACA', '#EEEAE8'];
export const STEELP = ['#141A24', '#262E3C', '#3C4656', '#5A6474', '#8A94A2', '#C4CCD6'];
export const RUST = ['#3A1606', '#5E260C', '#8A3A14', '#B4561E', '#D47C3E', '#F0AE7A'];
export const GRASSY = ['#0E3A14', '#16561E', '#1E7A2A', '#2E9E3A', '#5EC45A', '#A8E890'];
export const VELOUR = ['#160406', '#2A080C', '#420E14', '#5E141C', '#7E2028', '#A8444A'];
export const NAVY = ['#0A0E24', '#141C40', '#1E2A5E', '#2A3C80', '#4A62A8', '#8AA2D8'];

/** A ramp near (for the hour) or as scenery. */
export const NR = (R: string[]) => rampH(R);
export const DR = (R: string[]) => rampH(R, true);
/** A one-off color's ramp (near or scenery). */
export const r6 = (col: string) => [mix(col, INK, 0.62), mix(col, INK, 0.36), mix(col, INK, 0.14), col, mix(col, '#FFFFFF', 0.3), mix(col, '#FFFFFF', 0.6)];
export const NC = (col: string) => rampH(r6(col));
export const DC = (col: string) => rampH(r6(col), true);
export { hour, dimmed };

// ---------------------------------------------------------------------------------------------------------------
// Lettering

/** The show's lettering: fat, blocky, blood red banded down to dark, white-hot on top, inked, dripping. */
export const pkLetters = (size = 2, seed = 0, dim = false): Look => {
  const T = (col: string) => (dim ? dimmed(col) : col);
  return { sx: size, sy: size, bold: true, fill: [T('#FFFFFF'), T('#FCA5A5'), T('#DC2626'), T('#991B1B')], dither: true, ink: T(INK), shadow: T('#450A0A'), drop: 2, wobble: 2, seed, drip: { col: T('#B91C1C'), tip: T('#7F1D1D'), rate: 0.45, len: 7 } };
};
/** Small inked lettering. */
export const small = (fill: string | string[], ink: string = INK): Look => ({ sx: 1, sy: 1, bold: true, fill, ink });
/** Stenciled crate lettering. */
export const stencil = (fill: string, sx = 1): Look => ({ sx, sy: sx, bold: true, stencil: true, fill });

// ---------------------------------------------------------------------------------------------------------------
// Gore, bones, skulls, chalk

/** A splat of cartoon blood (decor: paint), stepped: its dark rim, the body, a wet glint; droplets flung round it. */
export const gore = (c: Ctx, x: number, y: number, r: number, seed: number, R: string[] = BLOOD.map(s => hour(s))) => {
  const blob = (dx: number, dy: number, rr: number, col: string) => { if (rr <= 0.4) return; c.fillStyle = col; c.beginPath(); c.arc(x + dx, y + dy, rr, 0, Math.PI * 2); c.fill(); };
  const drops: [number, number, number][] = [];
  for (let i = 0; i < 8; i++) { const a = hash(seed + i) * Math.PI * 2, d = r * (1 + hash(seed * 3 + i) * 1.0); drops.push([Math.cos(a) * d, Math.sin(a) * d * 0.8, r * (0.16 + hash(seed + i * 5) * 0.3)]); }
  blob(0, 0, r + 0.8, R[1]); for (const [dx, dy, rr] of drops) blob(dx, dy, rr + 0.6, R[1]);
  blob(0, 0, r, R[3]); for (const [dx, dy, rr] of drops) blob(dx, dy, rr, R[3]);
  blob(r * 0.15, r * 0.2, r * 0.7, R[2]);
  blob(-r * 0.3, -r * 0.3, r * 0.34, R[4]);
  if (r > 3) box(c, x - r * 0.45, y - r * 0.5, Math.max(1, r * 0.2), Math.max(1, r * 0.14), R[5]);
};
/** Blood running off a ledge at y from x0 to x1: drips of their own lengths, each with its bead; seeded. */
export const drips = (c: Ctx, x0: number, x1: number, y: number, seed: number, R: string[], n = 8, len = 30) => {
  for (let k = 0; k < n; k++) {
    const dx = x0 + hash(seed + k * 1.7) * (x1 - x0), l = 6 + hash(seed * 2 + k * 3.1) * len, w = 3 + Math.round(hash(seed + k) * 2);
    box(c, dx - 1, y, w + 2, l, R[0]);
    box(c, dx, y, w, l, R[2]); box(c, dx, y, 1, l - 2, R[4]);
    c.fillStyle = R[0]; c.beginPath(); c.arc(dx + w / 2, y + l, w / 2 + 2, 0, Math.PI * 2); c.fill();
    c.fillStyle = R[3]; c.beginPath(); c.arc(dx + w / 2, y + l, w / 2 + 1, 0, Math.PI * 2); c.fill();
    box(c, dx + w / 2 - 1, y + l - 2, 1, 1, R[5]);
  }
};
/** A cartoon bone from (x0, y0) to (x1, y1): the shaft, two knobs at each end; stepped, inked. `w` the shaft's width. */
export const bone = (c: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, R: string[]) => {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), k = w * 0.62;
  c.save(); c.translate(x0, y0); c.rotate(a);
  const knobs = (col: string, grow: number, dy = 0) => {
    c.fillStyle = col;
    for (const ex of [0, L]) for (const s of [-1, 1]) { c.beginPath(); c.arc(ex + (ex ? k * 0.3 : -k * 0.3), s * k * 0.8 + dy, k + grow, 0, Math.PI * 2); c.fill(); }
    c.fillRect(0, -w / 2 - grow + dy, L, w + grow * 2);
  };
  knobs(INK, 1.4); knobs(R[2], 0); knobs(R[3], -1.2, -0.8);
  c.fillStyle = R[4]; c.fillRect(0, -w / 2 + 1, L, Math.max(1, w * 0.22));
  for (const ex of [0, L]) { c.fillStyle = R[4]; c.beginPath(); c.arc(ex + (ex ? k * 0.3 : -k * 0.3) - k * 0.3, -k * 0.8 - k * 0.3, k * 0.36, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = R[1]; c.fillRect(0, w / 2 - Math.max(1, w * 0.2), L, Math.max(1, w * 0.2));
  c.restore();
};
/** A cartoon skull (its middle at x, y, r its size): the dome, the cheekbones, the eye sockets, the nose, the teeth. */
export const skull = (c: Ctx, x: number, y: number, r: number, R: string[], eyes = R[0], grin = true) => {
  const el = (dx: number, dy: number, a: number, b: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x + dx, y + dy, Math.max(0.5, a), Math.max(0.5, b), 0, 0, Math.PI * 2); c.fill(); };
  el(0, 0, r + 1.5, r * 0.92 + 1.5, INK); box(c, x - r * 0.6 - 1.5, y + r * 0.3, r * 1.2 + 3, r * 0.75 + 1.5, INK);
  el(0, 0, r, r * 0.92, R[2]); box(c, x - r * 0.6, y + r * 0.3, r * 1.2, r * 0.72, R[2]);
  el(-r * 0.12, -r * 0.16, r * 0.82, r * 0.72, R[3]); el(-r * 0.32, -r * 0.4, r * 0.3, r * 0.22, R[4]);
  box(c, x - r * 0.5, y - r * 0.62, Math.max(1, r * 0.16), Math.max(1, r * 0.12), R[5]);
  el(-r * 0.38, r * 0.08, r * 0.27, r * 0.3, eyes); el(r * 0.38, r * 0.08, r * 0.27, r * 0.3, eyes);
  c.fillStyle = R[0]; c.beginPath(); c.moveTo(x, y + r * 0.34); c.lineTo(x - r * 0.12, y + r * 0.56); c.lineTo(x + r * 0.12, y + r * 0.56); c.closePath(); c.fill();
  if (grin) { const ty = y + r * 0.72; box(c, x - r * 0.5, ty, r, Math.max(1, r * 0.14), R[0]); for (let k = -2; k <= 2; k++) box(c, x + k * r * 0.2 - 0.5, ty - r * 0.12, 1, r * 0.34, R[0]); }
};
/** The chalk outline of a cat (kind 0) or a mouse (1) on the floor (y its line), a little splat beside it. */
export const chalk = (c: Ctx, x: number, y: number, kind: number, col = 'rgba(255,255,255,0.8)') => {
  c.strokeStyle = col; c.lineWidth = 1; c.beginPath();
  if (kind === 0) { c.ellipse(x, y, 16, 3.5, 0, 0, Math.PI * 2); c.moveTo(x + 24, y); c.ellipse(x + 20, y, 5, 3, 0, 0, Math.PI * 2); c.moveTo(x + 18, y - 3); c.lineTo(x + 20, y - 7); c.lineTo(x + 22, y - 3); c.moveTo(x - 16, y); c.quadraticCurveTo(x - 28, y - 4, x - 34, y + 2); for (const s of [-1, 1]) { c.moveTo(x + s * 8, y + 3); c.lineTo(x + s * 11, y + 6); } }
  else { c.ellipse(x, y, 10, 2.6, 0, 0, Math.PI * 2); c.moveTo(x + 17, y); c.ellipse(x + 14, y, 4, 2.4, 0, 0, Math.PI * 2); c.moveTo(x + 18, y - 2); c.arc(x + 16, y - 4, 3, 0, Math.PI * 2); c.moveTo(x - 10, y); c.quadraticCurveTo(x - 20, y + 4, x - 26, y - 1); }
  c.stroke();
};
/** A riveted steel plate, stepped (lit down its left and along its top, shaded right, dithered; rivets round it). */
export const plate = (c: Ctx, x: number, y: number, w: number, h: number, R: string[], rivets = true) => {
  box(c, x, y, w, h, R[3]); box(c, x, y, 2, h, R[4]); box(c, x, y, w, 2, R[4]); box(c, x, y, 1, 1, R[5]);
  box(c, x + w - 3, y, 3, h, R[1]); checker(c, x + w - 6, y, 3, h, R[2], 0, 1); box(c, x, y + h - 2, w, 2, R[1]);
  if (rivets) for (const [rx, ry] of [[x + 3, y + 3], [x + w - 5, y + 3], [x + 3, y + h - 5], [x + w - 5, y + h - 5]]) { box(c, rx, ry, 2, 2, R[1]); box(c, rx, ry, 1, 1, R[5]); }
};
/** Planks (a crate's, a flat's back), stepped: a board each its own shade, grain, nails. */
export const planks = (c: Ctx, x: number, y: number, w: number, h: number, R: string[], board = 10, across = true, seed = 0) => {
  const n = Math.ceil((across ? h : w) / board);
  for (let i = 0; i < n; i++) {
    const col = R[2 + (hash(seed + i * 3.3) > 0.5 ? 1 : 0)];
    if (across) { const y0 = y + i * board, bh = Math.min(board, y + h - y0); box(c, x, y0, w, bh, col); box(c, x, y0, w, 1, R[4]); box(c, x, y0 + bh - 1, w, 1, R[1]); for (let k = 0; k < 3; k++) box(c, x + hash(seed + i + k * 7) * (w - 12), y0 + 2 + k * 2, 8 + hash(i + k) * 10, 1, R[2]); box(c, x + 2, y0 + bh / 2, 1, 1, R[0]); box(c, x + w - 3, y0 + bh / 2, 1, 1, R[0]); }
    else { const x0 = x + i * board, bw = Math.min(board, x + w - x0); box(c, x0, y, bw, h, col); box(c, x0, y, 1, h, R[4]); box(c, x0 + bw - 1, y, 1, h, R[1]); for (let k = 0; k < 3; k++) box(c, x0 + 2 + k * 2, y + hash(seed + i + k * 7) * (h - 12), 1, 8 + hash(i + k) * 10, R[2]); }
  }
};
/** Hazard stripes (black and mustard) across a box. */
export const hazard = (c: Ctx, x: number, y: number, w: number, h: number, A: string, B: string, band = 8) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  box(c, x, y, w, h, A);
  c.fillStyle = B; for (let k = -h; k < w + h; k += band * 2) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + band, y + h); c.lineTo(x + k + band + h, y); c.lineTo(x + k + h, y); c.closePath(); c.fill(); }
  c.restore();
};
/** A dimmed haze over a painted thing (a mural, a poster: scenery), clipped to a rect. */
export const haze = (c: Ctx, x: number, y: number, w: number, h: number, a = 0.22) => {
  c.fillStyle = dimmed('#8E86B4'); c.globalAlpha = a; c.fillRect(x, y, w, h); c.globalAlpha = 1;
};
