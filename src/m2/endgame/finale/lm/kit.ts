// THE KAIJU FINALE's landmarks, painted: each land's big attractions as miniatures under giant Meathead's feet (the
// first pass: crude, flat, readable; HOLLYWOOD's done with more care as the reference, the rest stand-ins till each
// land's SNES pass). Each is painted once (stamped: landmarks.ts) about its foot's middle: x -w/2..w/2, y -h..0 (0 the
// ground it stands on). Colors stepped in small ramps, a lit edge along the top of things, ink round the big shapes.
// No volcanoes (the one allowed, MOUNT KABOOMA, is the owner's own fiberglass set piece: kept as fiberglass, seams and
// bolts showing). Signs on boards held up off the ground, readable.

export type Ctx = CanvasRenderingContext2D;
export const INK = '#0B0A10';

export const R = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** A rect inked round, with a lit top edge and a dark foot (the stepped look). */
export const blockI = (g: Ctx, x: number, y: number, w: number, h: number, base: string, lit: string, dark: string) => {
  R(g, x - 1, y - 1, w + 2, h + 2, INK); R(g, x, y, w, h, base); R(g, x, y, w, 1, lit); R(g, x, y + h - 2, w, 2, dark); R(g, x, y, 1, h, lit);
};
/** Bands down a rect, top to bottom. */
export const bands = (g: Ctx, x: number, y: number, w: number, h: number, cols: readonly string[]) => {
  const n = cols.length, bh = h / n;
  for (let i = 0; i < n; i++) R(g, x, y + i * bh, w, Math.ceil(bh) + 1, cols[i]);
  for (let i = 1; i < n; i++) { g.fillStyle = cols[i]; const yy = Math.round(y + i * bh) - 1; for (let xx = i & 1; xx < w; xx += 2) g.fillRect(Math.round(x + xx), yy, 1, 1); }
};
export const poly = (g: Ctx, pts: number[], col: string, ink = true) => {
  g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath();
  g.fillStyle = col; g.fill(); if (ink) { g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); }
};
export const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string, ink = true) => {
  g.beginPath(); g.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); g.fillStyle = col; g.fill(); if (ink) { g.strokeStyle = INK; g.lineWidth = 1; g.stroke(); }
};
export const line = (g: Ctx, x0: number, y0: number, x1: number, y1: number, col: string, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
/** Text, centered on x (the game's font), at `size` px. */
export const txt = (g: Ctx, s: string, x: number, y: number, col: string, size = 6) => {
  g.font = `${size}px "Press Start 2P"`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = col; g.fillText(s, Math.round(x), Math.round(y)); g.textAlign = 'left';
};
/** A sign: a board (inked, lit edge) with words on it, on two posts down to `foot` (held up off the ground). */
export const sign = (g: Ctx, s: string, x: number, y: number, foot: number, board: string, ink: string, size = 6, posts = true) => {
  g.font = `${size}px "Press Start 2P"`;
  const w = Math.ceil(g.measureText(s).width) + 6, h = size + 5;
  if (posts) { R(g, x - w / 2 + 3, y + h, 2, foot - y - h, '#3A2A1C'); R(g, x + w / 2 - 5, y + h, 2, foot - y - h, '#3A2A1C'); }
  R(g, x - w / 2 - 1, y - 1, w + 2, h + 2, INK); R(g, x - w / 2, y, w, h, board); R(g, x - w / 2, y, w, 1, '#FFFFFF55');
  txt(g, s, x + 0.5, y + h - 3, ink, size);
};
/** Rows of windows over a facade (some lit). */
export const windows = (g: Ctx, x: number, y: number, w: number, h: number, cols: number, rows: number, glass: string, lit: string, seed = 1) => {
  const cw = w / cols, rh = h / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const on = ((c * 7 + r * 13 + seed * 5) % 5) === 0;
    R(g, x + c * cw + cw * 0.25, y + r * rh + rh * 0.2, Math.max(1, cw * 0.5), Math.max(1, rh * 0.55), on ? lit : glass);
  }
};
/** A little tree (round or pine), its foot at (x, 0). */
export const tree = (g: Ctx, x: number, h: number, kind: 'round' | 'pine' | 'palm' | 'lolly' | 'dead', cols: [string, string]) => {
  if (kind === 'palm') { R(g, x, -h, 2, h, '#7C5A36'); for (const a of [-1.2, -0.5, 0.2, 0.9, 2.2, 2.8]) line(g, x + 1, -h, x + 1 + Math.cos(a) * 8, -h + Math.sin(a) * 4 + 3, cols[0], 2); return; }
  if (kind === 'dead') { R(g, x, -h, 2, h, '#3A3036'); line(g, x + 1, -h * 0.7, x - 5, -h, '#3A3036'); line(g, x + 1, -h * 0.5, x + 6, -h * 0.85, '#3A3036'); return; }
  if (kind === 'lolly') { R(g, x, -h, 1, h, '#F8FAFC'); ell(g, x, -h - 3, 5, 5, cols[0]); ell(g, x - 1, -h - 4, 2, 2, cols[1], false); return; }
  R(g, x, -h * 0.4, 2, h * 0.4, '#5A3E24');
  if (kind === 'pine') { poly(g, [x + 1, -h, x - 5, -h * 0.35, x + 7, -h * 0.35], cols[0]); poly(g, [x + 1, -h * 0.98, x - 2, -h * 0.6, x + 3, -h * 0.6], cols[1], false); return; }
  ell(g, x + 1, -h * 0.66, h * 0.34, h * 0.34, cols[0]); ell(g, x - 1, -h * 0.74, h * 0.14, h * 0.14, cols[1], false);
};
/** Steel lattice down from a line to the ground (a coaster's or a tower's bents): verticals every `step`, X braces. */
export const lattice = (g: Ctx, x0: number, x1: number, top: (x: number) => number, step: number, col: string) => {
  g.strokeStyle = col; g.lineWidth = 1;
  for (let x = x0; x <= x1; x += step) {
    const t = top(x); if (t > -3) continue;
    g.beginPath(); g.moveTo(x, t); g.lineTo(x, 0); g.stroke();
    const n = top(x + step);
    if (x + step <= x1 && n < -3) { g.beginPath(); g.moveTo(x, t); g.lineTo(x + step, 0); g.moveTo(x + step, n); g.lineTo(x, 0); g.stroke(); }
  }
};
/** A coaster's track along a curve (pts, local), thick, a lit rail over it. */
export const track = (g: Ctx, pts: number[], col: string, lit: string, w = 3) => {
  g.lineJoin = 'round'; g.lineCap = 'round';
  for (const [c, lw] of [[INK, w + 2], [col, w], [lit, 1]] as [string, number][]) {
    g.strokeStyle = c; g.lineWidth = lw; g.beginPath(); g.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
    g.stroke();
  }
  g.lineCap = 'butt'; g.lineJoin = 'miter';
};
/** A star in the pavement, a Walk of Fame one. */
export const star = (g: Ctx, x: number, y: number, r: number, col: string) => {
  g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.5); } g.closePath(); g.fillStyle = col; g.fill();
};
/** Plywood-front braces behind a false front (2x4s, Hollywood's and the frontier's). */
export const braces = (g: Ctx, x: number, w: number, h: number) => { for (let k = 0; k < 3; k++) line(g, x + 4 + k * (w / 3), -h + 4, x + 4 + k * (w / 3) + 8, 0, '#8A6A44', 1); };
