import { type Ctx, INK, R, poly } from './kit';

// ---------------------------------------------------------------------------------------------------------------
// The second pass's brushes (the SNES look: ramps, stepped shading from one light up and to the right: the sunrise's
// side, dither where two steps meet, ink round the outside)

const h2 = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
/** Two hex colors mixed (k: how much of b). */
export const mixc = (a: string, b: string, k: number) => { const A = h2(a), B = h2(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
/** A five-step ramp off one color: [deep shade, shade, base, lit, highlight]. `cool`: what the shade leans to. */
export const rampOf = (c: string, cool = '#1A1030', warm = '#FFF4D8'): string[] => [mixc(c, cool, 0.6), mixc(c, cool, 0.32), c, mixc(c, warm, 0.34), mixc(c, warm, 0.66)];
/** A checker dither over a rect (every other art pixel), `ph` its phase. */
export const dith = (g: Ctx, x: number, y: number, w: number, h: number, col: string, ph = 0) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  g.fillStyle = col;
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + ph + x + y) & 1; xx < w; xx += 2) g.fillRect(x + xx, y + yy, 1, 1);
};
/** A flat-faced block in a ramp: inked, shade down its left (dithered in), a lit strip down its right, a lit top
 *  edge, a dark foot. */
export const sBlock = (g: Ctx, x: number, y: number, w: number, h: number, r: readonly string[], ink = true) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  if (ink) R(g, x - 1, y - 1, w + 2, h + 1, INK);
  R(g, x, y, w, h, r[2]);
  const sw = Math.max(1, Math.round(w * 0.28)), lw = Math.max(1, Math.round(w * 0.12));
  R(g, x, y, sw, h, r[1]); if (w > 9) dith(g, x + sw, y, 2, h, r[1]);
  R(g, x + w - lw, y, lw, h, r[3]); if (w > 9) dith(g, x + w - lw - 2, y, 2, h, r[3], 1);
  R(g, x, y, w, 1, r[4]); if (h > 5) R(g, x, y + h - 1, w, 1, r[0]);
};
/** A round column (a tank, a tower, a pipe) in a ramp: stepped across, its highlight right of the middle. */
export const sCol = (g: Ctx, x: number, y: number, w: number, h: number, r: readonly string[], ink = true) => {
  x = Math.round(x); y = Math.round(y); w = Math.max(2, Math.round(w)); h = Math.round(h);
  if (ink) R(g, x - 1, y - 1, w + 2, h + 1, INK);
  const steps = [0, 1, 1, 2, 2, 3, 4, 3, 2, 1];
  for (let i = 0; i < w; i++) { const k = steps[Math.min(steps.length - 1, Math.floor((i / w) * steps.length))]; R(g, x + i, y, 1, h, r[k]); }
  if (w >= 10) for (let s = 1; s < steps.length; s++) if (steps[s] !== steps[s - 1]) dith(g, x + Math.round((s / steps.length) * w) - 1, y, 1, h, r[steps[s]], s);
};
/** A ball (or an egg) in a ramp: stepped shells toward the light up and to the right, dithered rims, inked. */
export const sBall = (g: Ctx, cx: number, cy: number, rx: number, ry: number, r: readonly string[], ink = true) => {
  const x0 = Math.floor(cx - rx) - 1, x1 = Math.ceil(cx + rx) + 1, y0 = Math.floor(cy - ry) - 1, y1 = Math.ceil(cy + ry) + 1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
    if (d > 1) { if (ink && ((x + 0.5 - cx) / (rx + 1)) ** 2 + ((y + 0.5 - cy) / (ry + 1)) ** 2 <= 1) { g.fillStyle = INK; g.fillRect(x, y, 1, 1); } continue; }
    // (lit from up and to the right: the light's dot with the ball's own roundness)
    const nz = Math.sqrt(Math.max(0, 1 - d)), l = dx * 0.5 - dy * 0.62 + nz * 0.6;
    let k = l > 0.9 ? 4 : l > 0.62 ? 3 : l > 0.25 ? 2 : l > -0.12 ? 1 : 0;
    const edge = l > 0.9 ? l - 0.9 : l > 0.62 ? l - 0.62 : l > 0.25 ? l - 0.25 : l > -0.12 ? l + 0.12 : 1;
    if (k > 0 && edge < 0.07 && ((x + y) & 1)) k--;
    g.fillStyle = r[k]; g.fillRect(x, y, 1, 1);
  }
};
/** A filled polygon in two tones split down a ridge line (a roof, a spire): its left in shade, its right lit. */
export const sRoof = (g: Ctx, xl: number, xr: number, yb: number, xt: number, yt: number, r: readonly string[]) => {
  poly(g, [xl, yb, xt, yt, xr, yb], r[1]);
  poly(g, [xt, yb, xt, yt, xr, yb], r[3], false);
  g.strokeStyle = r[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(xt, yt + 1); g.lineTo(xr - 1, yb); g.stroke();
  g.strokeStyle = INK; g.beginPath(); g.moveTo(xl, yb); g.lineTo(xt, yt); g.lineTo(xr, yb); g.closePath(); g.stroke();
};
/** Courses of stone (or brick, or boards) over a rect: joints every `ch` down, staggered every `cw` across. */
export const courses = (g: Ctx, x: number, y: number, w: number, h: number, cw: number, ch: number, col: string) => {
  g.fillStyle = col;
  for (let r = 0, yy = y; yy < y + h; yy += ch, r++) {
    if (r) g.fillRect(Math.round(x), Math.round(yy), Math.round(w), 1);
    for (let xx = x + (r % 2 ? cw / 2 : 0) + cw; xx < x + w - 1; xx += cw) g.fillRect(Math.round(xx), Math.round(yy), 1, Math.round(Math.min(ch, y + h - yy)));
  }
};
/** A mound of ground (a crag, a berm, a hill) under a line of points, banded down from its top and dithered. */
export const mound = (g: Ctx, pts: number[], r: readonly string[], band = 7) => {
  g.save(); g.beginPath(); g.moveTo(pts[0], 0); for (let i = 0; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.lineTo(pts[pts.length - 2], 0); g.closePath(); g.clip();
  let x0 = 1e9, x1 = -1e9, top = 0; for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); top = Math.min(top, pts[i + 1]); }
  R(g, x0, top, x1 - x0, -top, r[3]);
  for (let k = 0; k < 3; k++) { const y = top + band * (k + 1); R(g, x0, y, x1 - x0, -y, r[2 - k]); dith(g, x0, y - 1, x1 - x0, 1, r[2 - k], k); dith(g, x0, y - 2, x1 - x0, 1, r[2 - k], k + 1); }
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < pts.length; i += 2) (i ? g.lineTo(pts[i], pts[i + 1]) : g.moveTo(pts[i], pts[i + 1])); g.stroke();
  g.strokeStyle = r[4]; g.beginPath(); for (let i = 0; i < pts.length; i += 2) (i ? g.lineTo(pts[i], pts[i + 1] + 1) : g.moveTo(pts[i], pts[i + 1] + 1)); g.stroke();
};
/** An ellipse's arc, stroked as a tube: inked, a body, a lit line along its upper side. */
export const tube = (g: Ctx, cx: number, cy: number, rx: number, ry: number, rot: number, a0: number, a1: number, w: number, r: readonly string[]) => {
  g.save(); g.translate(cx, cy); g.rotate(rot); g.lineCap = 'butt';
  g.strokeStyle = INK; g.lineWidth = w + 2; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, a0, a1); g.stroke();
  g.strokeStyle = r[1]; g.lineWidth = w; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, a0, a1); g.stroke();
  g.strokeStyle = r[3]; g.lineWidth = Math.max(1, w * 0.55); g.beginPath(); g.ellipse(0, -w * 0.15, rx, ry, 0, a0, a1); g.stroke();
  g.strokeStyle = r[4]; g.lineWidth = Math.max(0.5, w * 0.2); g.beginPath(); g.ellipse(0, -w * 0.3, rx, ry, 0, a0, a1); g.stroke();
  g.restore();
};
