// THE KAIJU FINALE's landmarks, painted: each land's big attractions as miniatures under giant Meathead's feet (the
// first pass: crude, flat, readable; HOLLYWOOD's done with more care as the reference, the rest stand-ins till each
// land's SNES pass). Each is painted once (stamped: landmarks.ts) about its foot's middle: x -w/2..w/2, y -h..0 (0 the
// ground it stands on). Colors stepped in small ramps, a lit edge along the top of things, ink round the big shapes.
// No volcanoes (the one allowed, MOUNT KABOOMA, is the owner's own fiberglass set piece: kept as fiberglass, seams and
// bolts showing). Signs on boards held up off the ground, readable.

type Ctx = CanvasRenderingContext2D;
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
const star = (g: Ctx, x: number, y: number, r: number, col: string) => {
  g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.5); } g.closePath(); g.fillStyle = col; g.fill();
};
/** Plywood-front braces behind a false front (2x4s, Hollywood's and the frontier's). */
const braces = (g: Ctx, x: number, w: number, h: number) => { for (let k = 0; k < 3; k++) line(g, x + 4 + k * (w / 3), -h + 4, x + 4 + k * (w / 3) + 8, 0, '#8A6A44', 1); };

// ---------------------------------------------------------------------------------------------------------------
// AMERICA USA (the hub's gate land: Main Street USA, flags, a fake capitol dome over the gate)

export const paintAmerica = (g: Ctx) => {
  // (the gate's capitol dome, white, on its drum; the flags down either side; the brick main street)
  for (const [x, w, h, col] of [[-130, 46, 30, '#B4533A'], [-82, 40, 36, '#C8A878'], [40, 44, 34, '#7A9AB4'], [86, 44, 28, '#B4533A']] as const) {
    blockI(g, x, -h, w, h, col, '#FFF1D6', '#5A2A1C'); windows(g, x + 3, -h + 4, w - 6, h - 12, 4, 2, '#24324A', '#FDE68A', x);
    R(g, x - 2, -h - 3, w + 4, 3, '#F8FAFC'); R(g, x + w / 2 - 6, -10, 12, 10, '#3A2414');
  }
  blockI(g, -38, -34, 76, 34, '#F1EDE4', '#FFFFFF', '#A8A094');
  for (let k = 0; k < 6; k++) R(g, -34 + k * 13, -30, 4, 26, '#D8D2C4');
  poly(g, [-40, -34, 0, -44, 40, -34], '#E8E2D6');
  ell(g, 0, -52, 18, 12, '#F8F6F0'); R(g, -18, -52, 36, 8, '#F8F6F0'); R(g, -1, -70, 2, 8, '#E5E7EB'); ell(g, 0, -71, 2, 2, '#FDE047');
  for (const x of [-120, -60, 60, 120]) { R(g, x, -60, 1, 60, '#D4D4D8'); for (let s = 0; s < 4; s++) R(g, x + 1, -60 + s * 2, 12, 1, s % 2 ? '#F8FAFC' : '#DC2626'); R(g, x + 1, -60, 5, 4, '#1D4ED8'); }
  sign(g, 'AMERICA USA', 0, -30, -2, '#1D4ED8', '#F8FAFC', 6, false);
  for (let x = -126; x < 130; x += 14) star(g, x, -1, 3, '#FDE047');
};

// ---------------------------------------------------------------------------------------------------------------
// HOLLYWOOD LAND (the reference: done properly)

/** HAPPYWOOD BOULEVARD: the arch over the start, the one-sheet plywood fronts (deco, mission, brick) braced at the back,
 *  the ROOSEVELT-ISH HOTEL with its rooftop sign, palms, the Walk of Fame's stars along the pavement. */
export const paintBlvd = (g: Ctx) => {
  R(g, -110, -4, 220, 4, '#C9B8A0'); for (let x = -104; x < 110; x += 12) star(g, x, -2, 3, '#E8B4C8');
  // (the fronts: cut-out silhouettes on 2x4s; each a different style)
  const front = (x: number, w: number, h: number, col: string, lit: string, top: 'deco' | 'mission' | 'flat') => {
    braces(g, x, w, h);
    blockI(g, x, -h, w, h, col, lit, '#6A5440');
    if (top === 'deco') { poly(g, [x, -h, x + w * 0.2, -h - 6, x + w * 0.5, -h - 10, x + w * 0.8, -h - 6, x + w, -h], col); R(g, x + w / 2 - 1, -h - 10, 2, 4, '#E8C44A'); }
    if (top === 'mission') { g.beginPath(); g.moveTo(x, -h); g.quadraticCurveTo(x + w / 2, -h - 14, x + w, -h); g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.stroke(); }
    windows(g, x + 3, -h + 5, w - 6, h - 14, 3, 2, '#3A4A5A', '#FDE68A', w);
    R(g, x + w / 2 - 4, -8, 8, 8, '#2A1C14');
  };
  front(-96, 30, 24, '#E8DCC4', '#FFFFFF', 'deco');
  front(-62, 26, 20, '#D9A878', '#F6D0A8', 'mission');
  front(30, 26, 22, '#A8503A', '#D07858', 'flat');
  front(60, 32, 26, '#E0D0A8', '#FFF6D8', 'deco');
  // (the hotel: tall, arched windows, its sign up on the roof on its frame)
  blockI(g, -30, -44, 56, 44, '#E4D4B4', '#FFF8E4', '#7A6444');
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { R(g, -26 + c * 10.6, -40 + r * 9, 5, 6, (c + r) % 4 ? '#3A4A60' : '#FDE68A'); R(g, -26 + c * 10.6, -41 + r * 9, 5, 1, '#B49870'); }
  for (let k = 0; k < 5; k++) R(g, -24 + k * 10, -54, 1, 10, '#4A4040');
  sign(g, 'ROOSEVELT-ISH', -2, -58, -58, '#B91C1C', '#FDE68A', 5, false);
  // (the arch over it all: two pylons and the span with its name)
  for (const x of [-108, 96]) blockI(g, x, -40, 10, 40, '#E0C068', '#FFF0B0', '#8A6A20');
  R(g, -108, -46, 214, 7, INK); R(g, -107, -45, 212, 5, '#F2D27A'); R(g, -107, -45, 212, 1, '#FFF8D0');
  txt(g, 'HAPPYWOOD BLVD', 0, -41, '#7A1A1A', 5);
  for (const x of [-74, 2, 92]) tree(g, x, 34, 'palm', ['#3F8A3A', '#6ABF5A']);
};

/** GROWMAN'S CHINA-ISH THEATRE: the plywood pagoda roof up on red columns, the marquee, the forecourt's concrete. */
export const paintChinaish = (g: Ctx) => {
  R(g, -46, -4, 92, 4, '#B8AC9C');
  for (let k = 0; k < 6; k++) { R(g, -42 + k * 2.6, -2.6 + (k % 2), 2, 1, '#8A7E70'); }
  blockI(g, -34, -30, 68, 30, '#9A2A22', '#D2584A', '#4A0E0A');
  for (const x of [-30, -16, 12, 26]) blockI(g, x, -28, 4, 28, '#C8382C', '#F07860', '#5A1410');
  R(g, -10, -22, 20, 22, '#1A0E0A'); R(g, -9, -21, 18, 1, '#5A2A1A');
  // (the pagoda roof: two tiers, green, up-turned at the ends; the plywood's edge showing at the back)
  const tier = (y: number, hw: number, th: number) => { poly(g, [-hw - 6, y, -hw, y - th, hw, y - th, hw + 6, y, hw + 8, y - 3, -hw - 8, y - 3], '#2E6A4A'); R(g, -hw, y - th, hw * 2, 1, '#7ACB9A'); };
  tier(-30, 34, 8); blockI(g, -22, -46, 44, 9, '#9A2A22', '#D2584A', '#4A0E0A'); tier(-46, 22, 8);
  R(g, -1, -60, 2, 6, '#E8C44A');
  sign(g, "GROWMAN'S", 0, -38, -38, '#FDE68A', '#7A1A1A', 5, false);
};

/** THRONES OF THE STARS: the red steel lattice coaster (the lift hill, the loop, the top hat, the drop), its train of
 *  toilets, the station's fake bathroom (tiled, the gold-star stalls), its sign held up on its frame. */
export const paintThrones = (g: Ctx) => {
  const W = 150;
  // (the station: a fake bathroom out of doors, tiled white, a STAFF ONLY door)
  blockI(g, -W, -22, 50, 22, '#E8EEF0', '#FFFFFF', '#98A4A8');
  for (let x = -W + 2; x < -W + 50; x += 4) for (let y = -20; y < 0; y += 4) R(g, x, y, 3, 3, (x + y) % 8 ? '#F4F8FA' : '#D4DEE2');
  for (let k = 0; k < 3; k++) { R(g, -W + 6 + k * 14, -16, 9, 16, '#C49A3A'); star(g, -W + 10.5 + k * 14, -11, 2.5, '#FFF2A0'); }
  // (the track: up the lift, over the top hat, down the drop, round the loop, the corkscrew's hump, back in)
  const pts: number[] = [];
  const add = (x: number, y: number) => pts.push(x, y);
  add(-100, -14); add(-70, -70); add(-58, -84); add(-46, -80); add(-36, -20); add(-26, -8);
  for (let k = 0; k <= 20; k++) { const a = Math.PI / 2 - (k / 20) * Math.PI * 2; add(4 + Math.cos(a) * 22, -34 - Math.sin(a) * 26); }
  add(30, -10); add(60, -40); add(84, -46); add(104, -24); add(126, -30); add(146, -12);
  const topAt = (x: number) => { let best = 0; for (let i = 0; i < pts.length; i += 2) if (Math.abs(pts[i] - x) < 6) best = Math.min(best, pts[i + 1]); return best; };
  lattice(g, -98, 146, topAt, 8, '#6A1410');
  track(g, pts, '#C81E1E', '#FF7A6A', 3);
  // (the train: toilets on the lift, their seats up, a guest's head in one)
  for (let k = 0; k < 4; k++) {
    const x = -94 + k * 7, y = -18 - k * 12;
    R(g, x - 3, y - 5, 6, 5, INK); R(g, x - 2, y - 4, 4, 3, '#F8FAFC'); R(g, x - 2, y - 7, 4, 3, '#E5E7EB'); if (k === 1) R(g, x - 1, y - 9, 2, 2, '#E8B48A');
  }
  sign(g, 'THRONES OF THE STARS', -62, -104, -88, '#7C3AED', '#FDE68A', 6, true);
  for (const x of [-136, 134]) tree(g, x, 30, 'palm', ['#3F8A3A', '#6ABF5A']);
};

/** The REVENGERS' secret warehouse: corrugated siding, red-oxide I-beams, the clerestory, the poster banner, the
 *  green-screen glimpsed through the bay door, the craft-services tent. */
export const paintWarehouse = (g: Ctx) => {
  const W = 76, H = 48;
  blockI(g, -W, -H, W * 2, H, '#8E969C', '#C4CCD2', '#4A5258');
  for (let x = -W + 2; x < W; x += 3) R(g, x, -H + 1, 1, H - 2, '#7A8288');
  for (const x of [-W, -W / 2, 0, W / 2, W - 4]) R(g, x, -H, 4, H, '#8A3A22');
  R(g, -W, -H - 6, W * 2, 6, '#8A3A22'); R(g, -W + 4, -H - 5, W * 2 - 8, 3, '#B4BCC4');
  for (let k = 0; k < 10; k++) R(g, -W + 8 + k * 15, -H - 5, 8, 3, '#C8E2F2');
  // (the bay door up: the green screen behind it, a mocap suit, a light stand)
  R(g, -20, -30, 40, 30, '#1A1A1A'); R(g, -18, -28, 36, 28, '#2FBF4A'); R(g, -18, -28, 36, 2, '#6AE07A');
  R(g, -6, -16, 3, 14, '#111827'); ell(g, -4.5, -18, 2, 2, '#111827', false); for (let k = 0; k < 4; k++) R(g, -6, -15 + k * 4, 1, 1, '#F8FAFC');
  R(g, 10, -24, 1, 22, '#4B5563'); R(g, 7, -26, 7, 4, '#E5E7EB');
  // (the banner: REVENGERS: END-OF-THE-WORLD'S-DAY)
  sign(g, 'REVENGERS', -44, -42, -42, '#7F1D1D', '#FDE047', 6, false);
  txt(g, "END-OF-THE-WORLD'S-DAY", -44, -24, '#F8FAFC', 4);
  // (craft services: a striped tent, a table of donuts)
  poly(g, [52, -16, 64, -26, 76, -16], '#F8FAFC'); for (let k = 0; k < 4; k++) poly(g, [52 + k * 6, -16, 58 + k * 6, -16, 64, -26], k % 2 ? '#DC2626' : '#F8FAFC', false);
  R(g, 54, -10, 20, 2, '#A16207'); for (let k = 0; k < 4; k++) ell(g, 57 + k * 5, -11, 1.5, 1, '#F9A8D4', false);
};

/** The backlot: NEW YORK STREET's brick tenements (DELI, PAWN with its gold balls), THE WESTERN TOWN's saloon false
 *  front, the fake suburb's one house over and over; the flood tank's dry concrete. */
export const paintBacklot = (g: Ctx) => {
  // (New York: two tenements, fire escapes, a deli awning, the pawn shop's balls)
  for (const [x, w, h, col] of [[-86, 34, 38, '#8A3A2A'], [-50, 30, 32, '#7A4636']] as const) {
    braces(g, x, w, h); blockI(g, x, -h, w, h, col, '#C07060', '#3A1A12'); windows(g, x + 3, -h + 4, w - 6, h - 14, 3, 3, '#26303C', '#FDE68A', w);
    for (let r = 0; r < 2; r++) R(g, x + 4, -h + 12 + r * 9, w - 8, 1, '#1A1A1A');
  }
  for (let k = 0; k < 4; k++) R(g, -84 + k * 8, -10, 8, 3, k % 2 ? '#F8FAFC' : '#15803D'); txt(g, 'DELI', -70, -12, '#FDE047', 4);
  for (const dx of [-2, 2]) ell(g, -38 + dx, -18, 1.5, 1.5, '#E8C44A'); ell(g, -38, -21, 1.5, 1.5, '#E8C44A');
  // (the western town: the saloon's false front, the board-and-batten, swinging doors)
  braces(g, -10, 36, 34); blockI(g, -10, -34, 36, 34, '#9A6A3A', '#D0A06A', '#4A2E14');
  for (let x = -8; x < 26; x += 3) R(g, x, -32, 1, 32, '#7E5630');
  R(g, -10, -40, 36, 6, '#9A6A3A'); txt(g, 'SALOON', 8, -35, '#2A1A0A', 4); R(g, 3, -12, 10, 10, '#3A2414');
  // (the suburb: the one clapboard house, three times)
  for (let k = 0; k < 3; k++) { const x = 34 + k * 20; blockI(g, x, -14, 16, 14, '#E8E0C8', '#FFFFFF', '#8A8270'); poly(g, [x - 2, -14, x + 8, -22, x + 18, -14], '#5A6A7A'); R(g, x + 6, -8, 4, 8, '#7A2A1A'); }
};

/** THE HAPPYWOOD WATER TOWER: about 300 ft of enclosed scaffold, the tank up top with its HW. Topples. */
export const paintHwTower = (g: Ctx) => {
  for (const x of [-14, 12]) { R(g, x, -64, 3, 64, '#4A5058'); R(g, x, -64, 1, 64, '#8A9098'); }
  for (let y = -60; y < 0; y += 10) { line(g, -13, y, 14, y + 10, '#5A6068'); line(g, 14, y, -13, y + 10, '#5A6068'); }
  // (the scaffold's netting round the legs, Ben's climb)
  g.fillStyle = 'rgba(40, 60, 90, 0.35)'; g.fillRect(-16, -64, 32, 64);
  ell(g, 0, -74, 20, 13, '#9AA4AC'); R(g, -20, -74, 40, 7, '#9AA4AC'); ell(g, 0, -67, 20, 4, '#7A848C', false);
  ell(g, 0, -86, 14, 5, '#B4BEC6'); R(g, -1, -94, 2, 5, '#4A5058');
  txt(g, 'HW', 0, -68, '#1E3A8A', 8);
};

/** DISASTER: THE RIDE: poured concrete with its cracks painted on, the marquee, the mural, the cow on its wire. */
export const paintDisaster = (g: Ctx) => {
  blockI(g, -52, -36, 104, 36, '#A8A29A', '#D8D2CA', '#5A544E');
  for (const [x, y, l] of [[-40, -30, 8], [-12, -22, 10], [20, -32, 7], [36, -14, 9]] as const) { line(g, x, y, x + 4, y + l * 0.5, '#3A3634'); line(g, x + 4, y + l * 0.5, x + 1, y + l, '#3A3634'); }
  // (the mural: a tornado, a wave, an earthquake's crack: painted, a projection's worth)
  R(g, -46, -30, 30, 20, '#5A7A9A'); poly(g, [-36, -28, -26, -28, -30, -12], '#C8C8D0'); R(g, -46, -14, 30, 4, '#2A6AA8');
  R(g, -8, -12, 16, 12, '#1A1414');
  // (the marquee: DISASTER: THE RIDE, bulbs round it)
  R(g, -40, -48, 80, 12, INK); R(g, -39, -47, 78, 10, '#F8E8B0'); txt(g, 'DISASTER: THE RIDE', 0, -39, '#B91C1C', 5);
  for (let k = 0; k < 14; k++) R(g, -38 + k * 5.6, -49, 2, 1, k % 2 ? '#FDE047' : '#FFFFFF');
  // (the cow, flying, on its wire)
  line(g, 30, -62, 46, -40, '#E5E7EB'); ell(g, 44, -46, 6, 3.5, '#F8FAFC'); R(g, 40, -47, 3, 2, INK); R(g, 46, -45, 2, 2, INK); ell(g, 50, -47, 2, 2, '#F8FAFC');
};

/** THE HAPPYWOOD SIGN up its hill: the letters on their posts, plywood (up close), the scrub. */
export const paintHwSign = (g: Ctx) => {
  g.beginPath(); g.moveTo(-110, 0); g.quadraticCurveTo(-60, -34, 0, -38); g.quadraticCurveTo(60, -34, 110, 0); g.closePath(); g.fillStyle = '#9A8A5A'; g.fill(); g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.moveTo(-100, -2); g.quadraticCurveTo(-60, -30, 0, -34); g.quadraticCurveTo(60, -30, 100, -2); g.strokeStyle = '#C8B880'; g.stroke();
  for (let k = 0; k < 14; k++) ell(g, -90 + k * 13, -6 - Math.sin((k / 13) * Math.PI) * 20, 3, 2, '#5A6A2A', false);
  const L = 'HAPPYWOOD';
  for (let i = 0; i < L.length; i++) {
    const x = -72 + i * 18, y = -36 - Math.sin((i / (L.length - 1)) * Math.PI) * 6;
    R(g, x - 1, y + 2, 1, 14, '#5A4A34'); R(g, x + 6, y + 2, 1, 14, '#5A4A34');
    R(g, x - 4, y - 14, 14, 16, INK); R(g, x - 3, y - 13, 12, 14, '#F8FAFC');
    txt(g, L[i], x + 3, y, '#1A1A1A', 10);
  }
};

/** STUNTMAN STEVE'S STUPENDOUS STUNTERY: the extra-wide amphitheater, stands up both ends, the asphalt floor with its
 *  skid marks and STEVE stenciled on his mark, the box truss with its PAR cans, the STEVE-O-VISION jumbotron, the
 *  ramp, the hoops, the crash mats; the street-set backdrop (pawnshop, diner, gas canopy, bank and its clock). */
export const paintStunt = (g: Ctx) => {
  const W = 150;
  // (the street set at the back)
  for (const [x, w, h, col] of [[-90, 30, 30, '#8A3A2A'], [-58, 34, 24, '#2DA3A0'], [-20, 38, 20, '#E5E7EB'], [22, 34, 32, '#C8A878'], [60, 28, 22, '#6A5A8A']] as const) {
    braces(g, x, w, h); blockI(g, x, -h - 8, w, h, col, '#FFFFFF66', '#2A1A14'); windows(g, x + 3, -h - 4, w - 6, h - 10, 3, 2, '#26303C', '#FDE68A', w);
  }
  ell(g, 39, -36, 4, 4, '#F8FAFC');
  // (the floor: asphalt, the skid marks, the big faded star, STEVE)
  R(g, -W + 30, -8, (W - 30) * 2, 8, '#3A3A40'); for (let k = 0; k < 5; k++) { g.strokeStyle = '#1A1A1E'; g.beginPath(); g.arc(-40 + k * 22, -2, 10, Math.PI, Math.PI * 1.8); g.stroke(); }
  star(g, 0, -4, 8, '#8A7A4A'); txt(g, 'STEVE', 40, -2, '#E8E0C0', 4);
  // (the stands: both ends, rising, packed with tiny heads)
  for (const s of [-1, 1]) {
    const x0 = s * W, x1 = s * (W - 34);
    poly(g, [x0, 0, x0, -42, x1, -8, x1, 0], '#6A6E78');
    for (let r = 0; r < 6; r++) { const y = -6 - r * 6, xa = x1 + (x0 - x1) * (r / 6); line(g, xa, y, x0, y, '#9AA0AA'); for (let k = 0; k < 6; k++) R(g, Math.min(xa, x0) + k * 5 + 1, y - 2, 2, 2, ['#F87171', '#FDE047', '#60A5FA', '#E8B48A'][(k + r) % 4]); }
  }
  // (the truss over the floor, its PAR cans; the jumbotron)
  R(g, -W + 34, -62, (W - 34) * 2, 3, '#4B5563'); for (let x = -W + 36; x < W - 34; x += 10) { line(g, x, -62, x + 5, -59, '#6B7280'); R(g, x, -59, 3, 3, '#111827'); R(g, x + 1, -57, 1, 1, '#FDE047'); }
  for (const x of [-W + 34, W - 37]) R(g, x, -62, 3, 54, '#4B5563');
  R(g, -24, -88, 48, 26, INK); R(g, -22, -86, 44, 20, '#0F172A'); txt(g, 'STEVE-O-VISION', 0, -70, '#F59E0B', 4); R(g, -18, -84, 36, 9, '#1E40AF'); txt(g, 'STEVE!', 0, -77, '#FDE047', 5);
  // (the ramp and the hoops, a crash mat)
  poly(g, [-60, -8, -30, -8, -30, -22], '#2563EB');
  for (const x of [-4, 16]) { g.strokeStyle = '#F9A8D4'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, -24, 6, 10, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#F8FAFC'; g.lineWidth = 1; g.stroke(); }
  R(g, 50, -14, 30, 6, '#DC2626'); R(g, 50, -14, 30, 1, '#FCA5A5');
  sign(g, 'STUPENDOUS STUNTERY', 0, -104, -88, '#F59E0B', '#7A1A1A', 5, false);
};

// ---------------------------------------------------------------------------------------------------------------
// FAIRY LAND (stand-ins)

export const paintHogsmeat = (g: Ctx) => {
  for (let k = 0; k < 6; k++) {
    const x = -88 + k * 30, h = 22 + (k % 3) * 6, w = 26;
    blockI(g, x, -h, w, h, ['#E8D8B8', '#D8C0A0', '#C8B0D0'][k % 3], '#FFFFFF', '#6A5A4A');
    for (let b = 0; b < 3; b++) R(g, x + 2 + b * 8, -h + 2, 1, h - 4, '#5A3A24');
    poly(g, [x - 3, -h, x + w / 2 + (k % 2 ? 3 : -2), -h - 12, x + w + 3, -h], '#4A3A5A'); poly(g, [x - 1, -h - 1, x + w / 2, -h - 9, x + w + 1, -h - 1], '#F8FAFC', false);
    R(g, x + 9, -9, 7, 9, '#4A2A14');
  }
  sign(g, 'HOGSMEAT', 0, -46, -40, '#7C3AED', '#FDE68A', 5);
  for (const x of [-96, 94]) tree(g, x, 26, 'pine', ['#1F5A3A', '#F8FAFC']);
};
export const paintFairyWheel = (g: Ctx) => {
  const cy = -60, r = 46;
  for (const s of [-1, 1]) { line(g, s * 30, 0, 0, cy, '#9A8AB4', 3); line(g, s * 30, 0, 0, cy, '#D8CCEE', 1); }
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(0, cy, r, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#E0B4F0'; g.lineWidth = 2; g.stroke();
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; line(g, 0, cy, Math.cos(a) * r, cy + Math.sin(a) * r, '#C8B0E0'); }
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2, x = Math.cos(a) * r, y = cy + Math.sin(a) * r; ell(g, x, y + 5, 5, 3, k % 2 ? '#F472B6' : '#F8FAFC'); R(g, x - 3, y + 6, 6, 3, '#C084FC'); }
  ell(g, 0, cy, 7, 7, '#F9A8D4'); R(g, -24, -6, 48, 6, '#8A7AA4');
  sign(g, 'THE FAIRY WHEEL', 0, -12, -2, '#F472B6', '#F8FAFC', 5, false);
};
export const paintGlen = (g: Ctx) => {
  for (const [x, h, col] of [[-56, 18, '#DC2626'], [-36, 12, '#F472B6'], [44, 22, '#DC2626'], [60, 10, '#A855F7']] as const) { R(g, x - 2, -h, 4, h, '#F5E6C8'); ell(g, x, -h, 10, 6, col); for (let k = 0; k < 3; k++) ell(g, x - 5 + k * 5, -h - 2, 1.5, 1, '#F8FAFC', false); }
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(0, 8, 34, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.strokeStyle = '#A8784A'; g.lineWidth = 2; g.stroke();
  for (let k = 0; k < 9; k++) R(g, -28 + k * 7, -20 - Math.sin((k / 8) * Math.PI) * 6, 1, 10, '#6A4A2A');
  R(g, -20, -8, 40, 8, '#60A5FA'); R(g, -20, -8, 40, 1, '#BFDBFE');
  sign(g, 'STORYBOOK BRIDGE', 0, -46, -30, '#FDE68A', '#4A2A14', 4);
};
export const paintTragons = (g: Ctx) => {
  const loop = (cx: number, col: string, lit: string) => { const pts: number[] = []; for (let k = 0; k <= 24; k++) { const a = Math.PI / 2 - (k / 24) * Math.PI * 2; pts.push(cx + Math.cos(a) * 20, -30 - Math.sin(a) * 24); } track(g, pts, col, lit, 3); lattice(g, cx - 20, cx + 20, () => -8, 10, '#4A4A5A'); };
  loop(-60, '#E8B020', '#FFF0A0'); loop(0, '#DC2626', '#FCA5A5'); loop(60, '#3B82F6', '#BFDBFE');
  blockI(g, -100, -24, 30, 24, '#8A8494', '#C8C0D0', '#4A4454'); for (const [x, c] of [[-95, '#E8B020'], [-86, '#DC2626'], [-77, '#3B82F6']] as const) R(g, x, -18, 6, 10, c);
  sign(g, 'TRUELLING TRAGONS', 0, -72, -58, '#4C1D95', '#FDE68A', 5);
};
export const paintBroomPort = (g: Ctx) => {
  for (const s of [-1, 1]) { poly(g, [s * 76, 0, s * 76, -40, s * 40, -10, s * 40, 0], '#7A6A8A'); for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++) R(g, Math.min(s * 76, s * 40) + k * 7 + 2, -8 - r * 6, 2, 2, ['#DC2626', '#16A34A', '#2563EB', '#FDE047'][(k + r) % 4]); }
  for (const x of [-30, 30]) { R(g, x, -44, 2, 44, '#C8B870'); ell(g, x + 1, -46, 5, 5, '#E8C44A'); }
  R(g, -24, -60, 48, 16, INK); R(g, -23, -59, 46, 14, '#1E1B4B'); txt(g, 'HIGHEST WINDOW', 0, -49, '#FDE68A', 3);
  sign(g, 'THE BROOM PORT', 0, -76, -62, '#4C1D95', '#F8FAFC', 5, false);
};
export const paintPixieCastle = (g: Ctx) => {
  poly(g, [-100, 0, -70, -40, -20, -56, 30, -50, 80, -34, 100, 0], '#E8EEF6');
  const tower = (x: number, w: number, h: number) => { blockI(g, x - w / 2, -h, w, h - 40, '#C8B8E0', '#F0E8FF', '#6A5A8A'); poly(g, [x - w / 2 - 3, -h, x, -h - w * 1.4, x + w / 2 + 3, -h], '#3B5BBF'); R(g, x - w / 2 - 3, -h - 1, w + 6, 2, '#E8C44A'); R(g, x, -h - w * 1.4 - 6, 1, 6, '#9A8A70'); R(g, x + 1, -h - w * 1.4 - 6, 5, 3, '#F472B6'); };
  blockI(g, -60, -76, 120, 30, '#C8B8E0', '#F0E8FF', '#6A5A8A');
  for (let k = 0; k < 12; k++) R(g, -60 + k * 10, -80, 6, 4, '#C8B8E0');
  tower(-56, 16, 96); tower(56, 16, 92); tower(-22, 14, 110); tower(22, 14, 106); tower(0, 18, 136);
  R(g, -4, -128, 8, 10, '#F472B6'); R(g, -3, -127, 6, 8, '#FBCFE8');
  R(g, -10, -60, 20, 14, '#3A2A4A');
  sign(g, "THE GREAT PIXIE'S CASTLE", 0, -22, -2, '#4C1D95', '#FDE68A', 5, false);
};

// ---------------------------------------------------------------------------------------------------------------
// JUNGLE LAND (stand-ins)

export const paintBigTree = (g: Ctx) => {
  poly(g, [-12, 0, -8, -60, 8, -60, 12, 0, 20, 0, 6, -8, -6, -8, -20, 0], '#6A4424');
  for (const [x, y, r] of [[0, -78, 30], [-26, -64, 18], [26, -66, 20], [0, -92, 18]] as const) ell(g, x, y, r, r * 0.8, '#2E7A3A');
  for (const [x, y, r] of [[-8, -86, 8], [18, -72, 6]] as const) ell(g, x, y, r, r * 0.7, '#5AB04A', false);
  blockI(g, -14, -52, 28, 12, '#A8784A', '#D8A878', '#5A3A1C'); poly(g, [-16, -52, 0, -60, 16, -52], '#7A5030'); R(g, -3, -48, 6, 8, '#2A1A0A');
  for (let k = 0; k < 4; k++) line(g, -30 + k * 20, -60, -30 + k * 20 + 2, -30, '#3A7A2A');
};
export const paintCruise = (g: Ctx) => {
  R(g, -84, -6, 168, 6, '#2E6A5A'); for (let k = 0; k < 8; k++) R(g, -80 + k * 21, -5, 8, 1, '#7ACBB4');
  blockI(g, -84, -18, 46, 12, '#A8784A', '#D8A878', '#5A3A1C'); for (let k = 0; k < 6; k++) R(g, -82 + k * 8, -18, 1, 12, '#5A3A1C');
  blockI(g, -20, -16, 60, 10, '#F8FAFC', '#FFFFFF', '#9AA0A8'); R(g, -20, -9, 60, 2, '#15803D');
  R(g, -16, -30, 52, 3, '#F8FAFC'); for (let k = 0; k < 9; k++) R(g, -16 + k * 6, -27, 6, 3, k % 2 ? '#F8FAFC' : '#15803D'); for (const x of [-14, 32]) R(g, x, -27, 1, 11, '#9AA0A8');
  sign(g, 'JUNGLE CRUISE', -60, -40, -18, '#FDE68A', '#14532D', 5);
  for (const x of [56, 74]) tree(g, x, 30, 'palm', ['#2E7A3A', '#5AB04A']);
};
export const paintTemple = (g: Ctx) => {
  const tiers = 5;
  for (let k = 0; k < tiers; k++) { const w = 160 - k * 28, h = 14; blockI(g, -w / 2, -(k + 1) * h, w, h, k % 2 ? '#8A8A80' : '#9A9A8E', '#C8C8BA', '#4A4A42'); for (let m = 0; m < 4; m++) R(g, -w / 2 + 4 + m * (w / 4), -(k + 1) * h + 2, 6, 2, '#4A7A3A'); }
  R(g, -6, -14 * tiers, 12, 14 * tiers, '#7A7A70'); for (let k = 0; k < tiers * 3; k++) R(g, -6, -k * 4.6, 12, 1, '#5A5A52');
  poly(g, [-18, -70, -10, -84, 4, -80, 18, -70], '#7A7A70');
  R(g, -8, -16, 16, 16, '#1A1A14');
  sign(g, 'TEMPLE OF THE JAGUAR', 0, -100, -86, '#A16207', '#F8FAFC', 5, false);
};
export const paintDinoPark = (g: Ctx) => {
  for (let x = -96; x < 60; x += 8) { R(g, x, -30, 2, 30, '#6A6A6A'); }
  R(g, -96, -30, 156, 2, '#4A4A4A'); for (let x = -96; x < 60; x += 16) R(g, x, -22, 8, 2, '#FDE047');
  blockI(g, -30, -50, 10, 50, '#8A6A3A', '#C8A06A', '#4A3A1A'); blockI(g, 20, -50, 10, 50, '#8A6A3A', '#C8A06A', '#4A3A1A');
  R(g, -34, -58, 68, 10, INK); R(g, -33, -57, 66, 8, '#FDE047'); txt(g, 'PRE-HYSTERIC PARK', 0, -51, '#1A1A1A', 4);
  R(g, 40, -44, 64, 4, '#9CA3AF'); for (const x of [50, 90]) R(g, x, -40, 3, 40, '#6B7280'); blockI(g, 60, -52, 26, 8, '#F8FAFC', '#FFFFFF', '#9CA3AF');
  txt(g, 'CLOSED SINCE 1997', 73, -56, '#DC2626', 3);
};
export const paintRexPaddock = (g: Ctx) => {
  for (let x = -70; x < 70; x += 6) R(g, x, -40, 1, 40, '#7A7A7A');
  R(g, -70, -40, 140, 2, '#5A5A5A'); R(g, -70, -20, 140, 1, '#5A5A5A');
  // (the rex, looking over: head and neck)
  poly(g, [10, -34, 16, -60, 26, -70, 46, -70, 52, -62, 40, -60, 30, -58, 24, -34], '#4A6A3A'); R(g, 34, -68, 2, 2, '#FDE047'); for (let k = 0; k < 4; k++) R(g, 40 + k * 3, -61, 1, 2, '#F8FAFC');
  for (const x of [-74, 66]) { blockI(g, x, -54, 8, 54, '#6A5A4A', '#A89A8A', '#3A2A1A'); ell(g, x + 4, -58, 4, 4, '#F59E0B'); }
  sign(g, 'T. REX PADDOCK', -34, -60, -40, '#FDE047', '#1A1A1A', 4);
};
export const paintKabooma = (g: Ctx) => {
  // (fiberglass: panels and bolts showing; the fake lava painted on and cycling; the schedule board)
  poly(g, [-100, 0, -40, -86, -20, -96, 20, -96, 40, -86, 100, 0], '#7A5A4A');
  for (let k = 0; k < 6; k++) line(g, -80 + k * 30, -4, -30 + k * 12, -88, '#5A3E30');
  for (let k = 0; k < 14; k++) R(g, -70 + k * 10, -20 - (k % 3) * 12, 1, 1, '#C8B0A0');
  poly(g, [-14, -96, 14, -96, 10, -60, 20, -30, 6, -40, -2, -10, -8, -50], '#F97316'); poly(g, [-8, -94, 8, -94, 4, -70, -4, -60], '#FDBA74', false);
  R(g, 60, -30, 30, 18, INK); R(g, 61, -29, 28, 16, '#1E293B'); txt(g, 'ERUPTS', 75, -22, '#FDE047', 3); txt(g, 'HOURLY', 75, -15, '#FDE047', 3);
  sign(g, 'MOUNT KABOOMA', -50, -60, -30, '#FDE68A', '#7A2A0A', 5);
};

// ---------------------------------------------------------------------------------------------------------------
// FOREIGN LANDS (stand-ins): the pavilions (one landmark), the world monuments (two)

const paintMonumentsA = (g: Ctx) => {
  // (THE EIFFEL TOWER 3X, PISA leaning, BIG BEN BIGGER, THE COLOSSEUM)
  poly(g, [-140, 0, -122, -40, -116, -110, -112, -110, -106, -40, -88, 0, -98, 0, -114, -24, -130, 0], '#8A6A4A');
  R(g, -126, -44, 24, 3, '#6A4A2A'); R(g, -120, -80, 12, 2, '#6A4A2A'); txt(g, '3X', -114, -6, '#FDE68A', 4);
  for (let k = 0; k < 6; k++) R(g, -64 + k * 1.6, -14 - k * 10, 16, 10, k % 2 ? '#F1EDE4' : '#E2DCD0');
  blockI(g, 4, -86, 18, 86, '#C8A06A', '#F0D09A', '#6A4A1A'); ell(g, 13, -70, 6, 6, '#F8FAFC'); poly(g, [2, -86, 13, -104, 24, -86], '#3A5A4A');
  for (let k = 0; k < 4; k++) { R(g, 60, -12 - k * 12, 80, 11, k % 2 ? '#D8C49A' : '#C8B48A'); for (let a = 0; a < 8; a++) R(g, 63 + a * 10, -10 - k * 12, 5, 7, '#5A4A2A'); }
  poly(g, [120, -48, 140, -48, 140, 0, 132, 0], '#A8946A', false);
};
export const paintPavilions = (g: Ctx) => {
  // (left to right: MEXICO's pyramid, NORWAY's stave church, CHINA's pagoda, GERMANY's castle, ITALY's bell tower,
  // JAPAN's pagoda, MOROCCO's tower, FRANCE's arc, the UK's phone box, CANADA's falls)
  let x = -200;
  const gap = 40;
  for (let k = 0; k < 4; k++) R(g, x - 16 + k * 8, -(k + 1) * 8, 32 - k * 16 + 16 * 1, 8, '#C89A5A'); x += gap;
  poly(g, [x - 10, 0, x - 10, -20, x, -38, x + 10, -20, x + 10, 0], '#7A3A22'); x += gap;
  for (let k = 0; k < 4; k++) { R(g, x - 10 + k * 2, -10 - k * 10, 20 - k * 4, 8, '#C81E1E'); poly(g, [x - 14 + k * 2, -10 - k * 10, x, -16 - k * 10, x + 14 - k * 2, -10 - k * 10], '#E8C44A', false); } x += gap;
  blockI(g, x - 14, -28, 28, 28, '#E8E0D0', '#FFFFFF', '#8A8270'); poly(g, [x - 16, -28, x - 8, -42, x, -28], '#3B5BBF'); poly(g, [x, -28, x + 8, -46, x + 16, -28], '#3B5BBF'); x += gap;
  blockI(g, x - 5, -50, 10, 50, '#D8A878', '#F8D0A0', '#7A5A30'); x += gap;
  for (let k = 0; k < 3; k++) { R(g, x - 8 + k * 2, -8 - k * 12, 16 - k * 4, 10, '#2A2A2A'); poly(g, [x - 14 + k * 3, -8 - k * 12, x, -14 - k * 12, x + 14 - k * 3, -8 - k * 12], '#DC2626', false); } x += gap;
  blockI(g, x - 6, -44, 12, 44, '#E8C08A', '#FFE0B0', '#8A6A3A'); R(g, x - 7, -48, 14, 4, '#15803D'); x += gap;
  blockI(g, x - 14, -30, 28, 30, '#E8E0D0', '#FFFFFF', '#8A8270'); R(g, x - 6, -18, 12, 18, '#3A3A4A'); x += gap;
  blockI(g, x - 3, -20, 6, 20, '#DC2626', '#FCA5A5', '#7F1D1D'); x += gap;
  R(g, x - 14, -24, 28, 24, '#6A7A5A'); for (let k = 0; k < 4; k++) R(g, x - 10 + k * 6, -24, 3, 24, '#BFDBFE');
  for (let k = 0; k < 10; k++) { const fx = -200 + k * gap; R(g, fx - 1, -58, 1, 10, '#9CA3AF'); R(g, fx, -58, 6, 4, ['#16A34A', '#DC2626', '#E8C44A', '#111827', '#15803D', '#F8FAFC', '#DC2626', '#2563EB', '#1D4ED8', '#DC2626'][k]); }
  sign(g, 'WORLD SHOWCASE', 0, -76, -62, '#0EA5E9', '#F8FAFC', 6);
};
/** AMERICA, under construction (the owner's "in construction america land"): a half-built pavilion, its steel frame
 *  up two floors, scaffolding round it, a tower crane over it with a beam on its hook, the hoarding along the front
 *  with its sign: AMERICA: COMING SOON. */
export const paintLibertyDig = (g: Ctx) => {
  R(g, -96, -8, 192, 8, '#8A6A4A'); ell(g, -20, -4, 40, 4, '#3A2A1A');
  // (the frame: columns and beams, red-oxide; the half-poured floor)
  for (let k = 0; k < 6; k++) R(g, -70 + k * 22, -64, 3, 56, '#8A3A22');
  for (const y of [-64, -40]) R(g, -70, y, 114, 3, '#8A3A22');
  R(g, -70, -42, 70, 4, '#A8A090');
  // (the scaffold round it: poles, boards, X braces, a tarp)
  g.strokeStyle = '#C8C4B4'; g.lineWidth = 1;
  for (let k = 0; k < 4; k++) { const x = -80 + k * 44; g.beginPath(); g.moveTo(x, -8); g.lineTo(x, -74); g.moveTo(x, -40); g.lineTo(x + 44, -74); g.stroke(); }
  for (const y of [-74, -52, -30]) R(g, -82, y, 134, 2, '#B8945A');
  R(g, 20, -70, 26, 30, 'rgba(30, 80, 160, 0.55)');
  // (the tower crane: its mast, the jib out over the site, the hook and a beam on it)
  R(g, 60, -108, 4, 100, '#E8C44A'); for (let y = -104; y < -10; y += 8) line(g, 60, y, 64, y + 8, '#8A6A20');
  R(g, 0, -110, 96, 3, '#E8C44A'); R(g, 54, -118, 14, 8, '#E8C44A'); R(g, 76, -108, 16, 6, '#5A5A5A');
  line(g, 16, -107, 16, -84, '#2A2A2A'); R(g, 4, -84, 24, 3, '#8A3A22');
  // (the hoarding along the front, the sign on it)
  R(g, -96, -22, 150, 14, '#E5E7EB'); for (let k = 0; k < 10; k++) R(g, -96 + k * 15, -22, 1, 14, '#9CA3AF');
  sign(g, 'AMERICA: COMING SOON', -22, -38, -22, '#1D4ED8', '#F8FAFC', 5);
  for (const x of [-90, 50]) { R(g, x, -30, 2, 22, '#F97316'); R(g, x - 2, -32, 6, 2, '#F8FAFC'); }
};
const paintMonumentsB = (g: Ctx) => {
  // (THE SYDNEY OPERA HOUSE, CHRIST THE REDEEMER, THE TAJ MAHAL, THE GREAT PYRAMID, THE EASTER ISLAND HEAD)
  for (let k = 0; k < 3; k++) poly(g, [-150 + k * 14, 0, -140 + k * 14, -24 - k * 4, -126 + k * 14, 0], '#F1EDE4');
  R(g, -88, -60, 4, 60, '#D8D0C0'); R(g, -104, -56, 36, 4, '#D8D0C0'); ell(g, -86, -64, 4, 4, '#D8D0C0');
  blockI(g, -50, -30, 60, 30, '#F1EDE4', '#FFFFFF', '#A8A094'); ell(g, -20, -40, 14, 14, '#F8F6F0'); R(g, -21, -60, 2, 8, '#E8C44A'); for (const x of [-50, 8]) R(g, x, -46, 2, 46, '#F1EDE4');
  poly(g, [30, 0, 80, -66, 130, 0], '#D8B878'); for (let k = 1; k < 6; k++) line(g, 30 + k * 8.3, -k * 11, 130 - k * 8.3, -k * 11, '#B89858');
  poly(g, [138, 0, 136, -40, 142, -50, 156, -50, 158, -16, 154, 0], '#6A6A62'); R(g, 142, -38, 10, 3, '#3A3A34');
};

// ---------------------------------------------------------------------------------------------------------------
/** The world monuments, the whole row (the owner's one throw target): EIFFEL 3X to the EASTER ISLAND HEAD, one sign
 *  over the lot. They go over like dominoes (sections.ts: 'domino'). */
export const paintMonuments = (g: Ctx) => {
  g.save(); g.translate(-160, 0); paintMonumentsA(g); g.restore();
  g.save(); g.translate(150, 0); paintMonumentsB(g); g.restore();
  sign(g, 'THE WORLD MONUMENTS', 0, -96, -80, '#0EA5E9', '#F8FAFC', 6);
};

// ---------------------------------------------------------------------------------------------------------------
// FUTURE LAND (stand-ins), and SPACE NEEDLE 2 (the throw: it reaches space, so it's tall)

export const paintFutureSquare = (g: Ctx) => {
  for (const [x, w, h] of [[-90, 40, 22], [-40, 36, 28], [40, 44, 24]] as const) { blockI(g, x, -h, w, h, '#F1F5F9', '#FFFFFF', '#94A3B8'); poly(g, [x - 6, -h, x + w + 8, -h - 8, x + w + 8, -h - 5, x - 6, -h + 2], '#14B8A6'); R(g, x + 4, -h + 6, w - 8, 3, '#A5F3FC'); }
  R(g, -100, -36, 200, 3, '#CBD5E1'); for (const x of [-80, -20, 40, 90]) R(g, x, -33, 2, 33, '#94A3B8'); for (let k = 0; k < 5; k++) blockI(g, -60 + k * 12, -42, 10, 6, '#F97316', '#FDBA74', '#9A3412');
  sign(g, 'PEOPLE MOVER', 0, -58, -42, '#14B8A6', '#F8FAFC', 5, false);
};
export const paintAtom = (g: Ctx) => {
  R(g, -2, -52, 4, 52, '#CBD5E1'); R(g, -12, -4, 24, 4, '#94A3B8');
  for (const [ry, rot] of [[14, -0.5], [14, 0.5], [12, 1.57]] as const) { g.save(); g.translate(0, -70); g.rotate(rot); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 40, ry, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#E5E7EB'; g.lineWidth = 1; g.stroke(); g.restore(); }
  ell(g, 0, -70, 18, 18, '#C4B5FD'); ell(g, -5, -75, 6, 5, '#EDE9FE', false); R(g, -18, -71, 36, 2, '#7C3AED');
  sign(g, 'THE GIANT ATOM', 0, -24, -4, '#7C3AED', '#F8FAFC', 5);
};
export const paintVoyage = (g: Ctx) => {
  blockI(g, -60, -30, 120, 30, '#E2E8F0', '#FFFFFF', '#94A3B8'); g.beginPath(); g.ellipse(0, -30, 60, 14, 0, Math.PI, 0); g.fillStyle = '#CBD5E1'; g.fill(); g.strokeStyle = INK; g.stroke();
  poly(g, [-20, -40, 20, -40, 30, -34, -10, -34], '#F97316'); R(g, -40, -16, 80, 6, '#0EA5E9');
  sign(g, 'VOYAGE TO 2010', 0, -60, -44, '#0EA5E9', '#F8FAFC', 5, false);
};
export const paintMonorail = (g: Ctx) => {
  R(g, -120, -26, 240, 4, '#CBD5E1'); R(g, -120, -26, 240, 1, '#FFFFFF'); for (let x = -110; x < 120; x += 40) R(g, x, -22, 4, 22, '#94A3B8');
  blockI(g, -60, -38, 90, 12, '#F8FAFC', '#FFFFFF', '#94A3B8'); poly(g, [30, -38, 44, -32, 30, -26], '#DC2626'); R(g, -56, -35, 84, 3, '#38BDF8');
  R(g, -110, -4, 220, 4, '#0EA5E9');
  sign(g, 'LAGOON MONORAIL', -80, -56, -40, '#DC2626', '#F8FAFC', 5);
};
export const paintXenoscare = (g: Ctx) => {
  blockI(g, -50, -36, 100, 36, '#3F3F46', '#71717A', '#18181B');
  for (let k = 0; k < 8; k++) { g.strokeStyle = '#D6D3D1'; g.lineWidth = 2; g.beginPath(); g.arc(-40 + k * 11, -14, 8, Math.PI, 0); g.stroke(); }
  R(g, -10, -24, 20, 24, '#0A0A0A'); g.fillStyle = 'rgba(200, 200, 210, 0.4)'; g.fillRect(-14, -8, 28, 8);
  sign(g, 'XENOSCARE', 0, -52, -38, '#16A34A', '#0A0A0A', 6);
};
/** SPACE NEEDLE 2: three white legs to a waist, the shaft "up forever", saucer decks getting smaller, a beacon. Its box
 *  runs off the top of the screen (it reaches space). */
export const NEEDLE_H = 640;
export const paintNeedle = (g: Ctx) => {
  for (const s of [-1, 0, 1]) poly(g, [s * 30 - 3, 0, s * 30 + 3, 0, s * 3 + 2, -90, s * 3 - 2, -90], '#F1F5F9');
  R(g, -3, -NEEDLE_H + 20, 6, NEEDLE_H - 100, '#E2E8F0'); R(g, -3, -NEEDLE_H + 20, 2, NEEDLE_H - 100, '#FFFFFF'); R(g, 2, -NEEDLE_H + 20, 1, NEEDLE_H - 100, '#94A3B8');
  for (let k = 0; k < 5; k++) { const y = -110 - k * 110, w = 34 - k * 5; ell(g, 0, y, w, 5, '#F8FAFC'); R(g, -w, y, w * 2, 2, '#38BDF8'); }
  ell(g, 0, -NEEDLE_H + 16, 3, 3, '#EF4444');
  sign(g, 'SPACE NEEDLE 2', 0, -60, -60, '#0EA5E9', '#F8FAFC', 5, false);
};

// ---------------------------------------------------------------------------------------------------------------
// WILDERNESS LAND (stand-ins)

export const paintStation = (g: Ctx) => {
  blockI(g, -70, -22, 50, 22, '#9A6A3A', '#D0A06A', '#4A2E14'); poly(g, [-74, -22, -45, -32, -16, -22], '#5A3A24'); txt(g, 'LONESOME PINE', -45, -25, '#F8FAFC', 3);
  for (const x of [-4, 14]) R(g, x, -40, 2, 40, '#5A3A24'); ell(g, 6, -46, 14, 8, '#8A6A3A'); R(g, -8, -46, 28, 6, '#8A6A3A');
  blockI(g, 30, -18, 40, 14, '#1F2937', '#4B5563', '#0A0A0A'); R(g, 60, -30, 6, 12, '#1F2937'); ell(g, 63, -34, 4, 3, '#9CA3AF', false); for (const x of [36, 48, 62]) ell(g, x, -3, 4, 4, '#DC2626');
  R(g, -76, -2, 160, 2, '#5A4A3A');
};
export const paintRockies = (g: Ctx) => {
  poly(g, [-100, 0, -60, -64, -30, -30, 10, -76, 50, -24, 80, -56, 100, 0], '#7A8AA0'); poly(g, [-60, -64, -50, -50, -70, -50], '#F8FAFC', false); poly(g, [10, -76, 22, -58, -2, -58], '#F8FAFC', false);
  for (const x of [-60, 10, 80]) { line(g, x, -10, x + 8, 0, '#8A6A44'); line(g, x + 12, -10, x + 4, 0, '#8A6A44'); }
  sign(g, 'THE ROCKIES (PAINTED)', 0, -20, -2, '#FDE68A', '#4A2A14', 4, false);
};
export const paintGulch = (g: Ctx) => {
  const names = ['SALOON', 'SHERIFF', 'HOTEL', 'OPERA', 'GENERAL', 'BANK'];
  for (let k = 0; k < 6; k++) { const x = -126 + k * 36, h = 26 + (k % 3) * 6; braces(g, x, 32, h); blockI(g, x, -h, 32, h, ['#9A6A3A', '#8A5A30', '#B07A44'][k % 3], '#D0A06A', '#4A2E14'); R(g, x, -h - 6, 32, 6, ['#9A6A3A', '#8A5A30', '#B07A44'][k % 3]); txt(g, names[k], x + 16, -h - 1, '#2A1A0A', 3); R(g, x + 12, -10, 8, 10, '#3A2414'); }
  blockI(g, 92, -36, 26, 36, '#F8FAFC', '#FFFFFF', '#9CA3AF'); poly(g, [96, -36, 105, -66, 114, -36], '#F8FAFC'); R(g, 104, -76, 2, 10, '#5A5A5A'); R(g, 101, -72, 8, 2, '#5A5A5A');
  sign(g, 'SAWDUST GULCH', -30, -62, -42, '#FDE68A', '#4A2A14', 6);
};
/** THE TRAIN CRASH (Wilderness Land's, the end of the line at Sawdust Gulch: town/crash.ts): the depot with a hole
 *  stove in its front, boards everywhere; the engine through the buffer stop, nosed down into the dirt, its back end
 *  up; the tender ridden up onto the cab; the coach behind jackknifed the other way; the rails torn up and curled;
 *  steam and smoke off it. */
export const paintTrainCrash = (g: Ctx) => {
  // (the rails, torn up, curling)
  R(g, -110, -4, 220, 2, '#5A4A3A'); for (let x = -108; x < 110; x += 9) R(g, x, -4, 5, 4, '#6A4A2A');
  g.strokeStyle = '#8A8A90'; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, -4); g.quadraticCurveTo(-20, -30, 4, -14); g.moveTo(-36, -4); g.quadraticCurveTo(-10, -22, 10, -24); g.stroke();
  // (the depot: board-and-batten, its canopy down, the hole in its front)
  blockI(g, 30, -46, 78, 46, '#9A6A3A', '#D0A06A', '#4A2E14'); for (let x = 32; x < 106; x += 4) R(g, x, -44, 1, 42, '#7E5630');
  poly(g, [24, -46, 70, -58, 114, -46], '#5A3A24'); txt(g, 'SAWDUST GULCH', 70, -49, '#F8FAFC', 3);
  poly(g, [30, -40, 64, -30, 62, 0, 30, 0], '#1A1008');
  for (let k = 0; k < 8; k++) { g.save(); g.translate(16 + k * 7, -6 - (k % 3) * 8); g.rotate(k * 0.7); R(g, -6, -1, 12, 3, '#B07A44'); g.restore(); }
  // (the engine: nosed down into the depot, its back up; the stack, the cowcatcher buried, the cab)
  g.save(); g.translate(20, -16); g.rotate(-0.42);
  blockI(g, -56, -16, 50, 18, '#1F2937', '#4B5563', '#0A0A0A'); R(g, -56, -12, 50, 2, '#B91C1C');
  blockI(g, -66, -30, 16, 30, '#111827', '#374151', '#000000');
  R(g, -18, -26, 8, 12, '#111827'); R(g, -20, -28, 12, 3, '#374151');
  for (const x of [-48, -32, -16]) ell(g, x, 4, 6, 6, '#B91C1C');
  poly(g, [-6, -10, 6, 2, -6, 2], '#4B5563');
  g.restore();
  // (the tender up onto the cab; the coach jackknifed back the other way)
  g.save(); g.translate(-58, -28); g.rotate(0.5); blockI(g, -14, -10, 28, 14, '#374151', '#6B7280', '#111827'); R(g, -12, -12, 24, 3, '#111111'); g.restore();
  g.save(); g.translate(-86, -10); g.rotate(-0.35); blockI(g, -24, -16, 48, 16, '#7F1D1D', '#B91C1C', '#3A0A0A'); for (let k = 0; k < 4; k++) R(g, -20 + k * 11, -12, 7, 6, '#FDE68A'); g.restore();
  // (the steam and smoke, painted still: the live dust and fire go over it)
  for (const [x, y, r] of [[-30, -62, 10], [-20, -78, 13], [-6, -92, 15]] as const) ell(g, x, y, r, r * 0.8, '#C8C4C8', false);
};
export const paintMine = (g: Ctx) => {
  poly(g, [-110, 0, -70, -50, -30, -40, 0, 0], '#7A6A54'); R(g, -60, -20, 18, 20, '#1A1410'); for (const x of [-62, -44]) R(g, x, -22, 2, 22, '#6A4A2A'); R(g, -62, -22, 20, 2, '#6A4A2A');
  txt(g, 'MOTHER LODE', -52, -26, '#FDE68A', 3);
  R(g, 0, -30, 100, 3, '#6A4A2A'); for (let x = 4; x < 100; x += 12) { line(g, x, -27, x + 6, 0, '#6A4A2A'); line(g, x + 12, -27, x + 6, 0, '#6A4A2A'); }
  blockI(g, 60, -60, 10, 30, '#8A3A2A', '#C06050', '#3A1A12');
  sign(g, 'THE TRESTLE', 40, -50, -30, '#FDE68A', '#4A2A14', 4);
};
export const paintTimber = (g: Ctx) => {
  poly(g, [-110, 0, -60, -80, -20, -90, 30, -70, 80, -30, 110, 0], '#8A7A5A'); for (let k = 0; k < 10; k++) tree(g, -90 + k * 20, 14 + (k % 3) * 4, 'pine', ['#1F5A3A', '#3A8A4A']);
  const pts = [-80, -60, -40, -70, 0, -40, 40, -50, 80, -14]; track(g, pts, '#7A5A3A', '#BFDBFE', 4);
  ell(g, 86, -6, 20, 5, '#60A5FA'); for (const x of [-100, 96]) { R(g, x, -40, 2, 40, '#5A3A24'); for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2; line(g, x + 1, -40, x + 1 + Math.cos(a) * 9, -40 + Math.sin(a) * 9, '#9A8A70', 2); } }
  sign(g, 'TIMBER TUMBLE', 0, -110, -92, '#FDE68A', '#4A2A14', 6);
};

// ---------------------------------------------------------------------------------------------------------------
// SPOOKY LAND (stand-ins)

export const paintSpookyTown = (g: Ctx) => {
  for (let k = 0; k < 5; k++) { const x = -90 + k * 36, h = 26 + (k % 2) * 8; blockI(g, x, -h, 32, h, ['#5A5468', '#4A4458', '#6A6478'][k % 3], '#9A94A8', '#1A1824'); poly(g, [x - 2, -h, x + 16, -h - 14, x + 34, -h], '#3A2A4A'); windows(g, x + 3, -h + 4, 26, h - 12, 3, 2, '#1A1A2A', '#A3E635', k); }
  sign(g, 'APOTHECARY - NOW WITH DRIVE-THRU', 0, -54, -40, '#4C1D95', '#A3E635', 4);
  for (const x of [-100, 96]) tree(g, x, 30, 'dead', ['#000', '#000']);
};
export const paintKiddie = (g: Ctx) => {
  ell(g, -40, -6, 30, 6, '#3A2A4A'); for (let k = 0; k < 4; k++) { const x = -58 + k * 12; blockI(g, x, -18, 9, 12, '#1F1A24', '#4A4458', '#000000'); R(g, x + 3, -16, 3, 1, '#9A94A8'); }
  R(g, 40, -40, 2, 34, '#4A4458'); poly(g, [20, -40, 41, -52, 62, -40], '#7C3AED'); for (let k = 0; k < 4; k++) { const x = 26 + k * 10; line(g, x, -40, x, -24, '#9A94A8'); ell(g, x, -22, 4, 2, '#1A1A1A'); }
  sign(g, 'SPINNING COFFIN CUPS', -40, -40, -20, '#A3E635', '#1A1824', 3);
  sign(g, 'BAT-O-ROUND', 42, -70, -54, '#A3E635', '#1A1824', 4, false);
};
export const paintDracula = (g: Ctx) => {
  poly(g, [-100, 0, -80, -30, 80, -30, 100, 0], '#3A3448');
  blockI(g, -60, -70, 120, 40, '#8A8098', '#B8B0C8', '#3A3448');
  for (const x of [-60, -30, 30, 60]) { blockI(g, x - 8, -90, 16, 60, '#7A7088', '#B0A8C0', '#3A3448'); poly(g, [x - 10, -90, x, -108, x + 10, -90], '#4A3A6A'); }
  blockI(g, -12, -110, 24, 40, '#7A7088', '#B0A8C0', '#3A3448'); poly(g, [-14, -110, 0, -138, 14, -110], '#4A3A6A'); R(g, 0, -150, 1, 12, '#5A5A5A'); R(g, 1, -150, 8, 4, '#B91C1C');
  for (const x of [-40, -20, 20, 40]) R(g, x - 2, -60, 4, 8, '#DC2626');
  R(g, -8, -44, 16, 14, '#1A1424');
  sign(g, "DRACULA'S OTHER CASTLE", 0, -22, -2, '#4C1D95', '#FCA5A5', 5, false);
};
export const paintFirstCastle = (g: Ctx) => {
  poly(g, [-80, 0, -60, -40, -30, -50, 10, -42, 60, -48, 80, 0], '#4A4458');
  for (const x of [-40, 0, 40]) { blockI(g, x - 7, -80, 14, 34, '#6A6478', '#9A94A8', '#2A2438'); poly(g, [x - 9, -80, x, -96, x + 9, -80], '#3A2A4A'); }
  R(g, -40, -58, 80, 10, '#6A6478');
  sign(g, "DRACULA'S FIRST CASTLE", 0, -22, -4, '#4C1D95', '#FCA5A5', 4, false);
};
export const paintGiftShop = (g: Ctx) => {
  poly(g, [-50, 0, -44, -30, -10, -38, 30, -34, 50, 0], '#6A3A2A'); for (let k = 0; k < 6; k++) poly(g, [-40 + k * 15, 0, -34 + k * 15, -14 - (k % 2) * 8, -28 + k * 15, 0], '#F97316');
  R(g, -12, -20, 24, 20, '#1A0A08');
  sign(g, 'HELL GIFT SHOP', 0, -56, -40, '#B91C1C', '#FDE68A', 5);
};
export const paintHellevator = (g: Ctx) => {
  blockI(g, -24, -130, 48, 130, '#8A8098', '#B8B0C8', '#3A3448'); for (let k = 0; k < 10; k++) R(g, -24, -120 + k * 12, 48, 1, '#5A5468');
  poly(g, [-28, -130, 0, -160, 28, -130], '#4A3A6A');
  ell(g, 0, -106, 13, 13, '#F8F6F0'); line(g, 0, -106, 0, -114, INK, 2); line(g, 0, -106, 6, -104, INK, 2);
  R(g, -10, -30, 20, 30, '#7F1D1D'); R(g, -9, -29, 18, 28, '#DC2626'); R(g, -1, -29, 2, 28, '#7F1D1D');
  sign(g, 'ELEVATOR TO HELL', 0, -60, -60, '#7F1D1D', '#FDE68A', 5, false);
};

// ---------------------------------------------------------------------------------------------------------------
// CARTOON LAND (stand-ins)

export const paintSilly = (g: Ctx) => {
  for (let k = 0; k < 7; k++) tree(g, -90 + k * 28, 24 + (k % 3) * 6, 'lolly', [['#F472B6', '#FBCFE8'], ['#A855F7', '#E9D5FF'], ['#FDE047', '#FEF9C3']][k % 3] as [string, string]);
  R(g, -30, -8, 60, 8, '#F9A8D4'); ell(g, 0, -10, 26, 6, '#C084FC'); for (let k = 0; k < 6; k++) R(g, -22 + k * 9, -24, 2, 14, '#F8FAFC'); poly(g, [-28, -24, 0, -40, 28, -24], '#F472B6');
  sign(g, 'WUMPLE-GO-ROUND', 0, -60, -44, '#FDE047', '#9D174D', 4);
};
export const paintCwTower = (g: Ctx) => {
  for (const [x0, x1] of [[-18, -8], [18, 8], [-6, -3], [6, 3]] as const) { g.strokeStyle = '#C084FC'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, 0); g.quadraticCurveTo(x0 * 1.6, -30, x1, -52); g.stroke(); }
  ell(g, 0, -68, 22, 18, '#F472B6'); R(g, -22, -66, 44, 7, '#7C3AED'); txt(g, 'CARTOON LAND', 0, -60, '#FDE047', 3);
  ell(g, -8, -76, 5, 5, '#F8FAFC'); ell(g, 8, -76, 5, 5, '#F8FAFC'); R(g, -7, -76, 3, 3, INK); R(g, 7, -75, 3, 3, INK);
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(0, -70, 8, 0.2, Math.PI - 0.2); g.stroke(); R(g, -3, -63, 3, 3, '#F8FAFC'); R(g, 1, -63, 3, 3, '#F8FAFC');
  ell(g, 0, -88, 10, 4, '#FDE047'); line(g, 0, -92, 0, -96, INK); line(g, -6, -96, 6, -96, '#60A5FA', 2);
};
export const paintStudio = (g: Ctx) => {
  blockI(g, -60, -40, 120, 40, '#FDE68A', '#FFFBEB', '#A16207'); for (let k = 0; k < 6; k++) R(g, -56 + k * 20, -34, 12, 12, '#60A5FA');
  R(g, -14, -20, 28, 20, '#7C2D12');
  sign(g, 'THE MAGIC OF CARTOONS', 0, -56, -42, '#DB2777', '#FDE68A', 5, false); txt(g, 'EST. 1994', 0, -44, '#7C2D12', 3);
};
export const paintWhiteHouse = (g: Ctx) => {
  blockI(g, -80, -36, 160, 36, '#F8FAFC', '#FFFFFF', '#A8A8B0'); for (let k = 0; k < 12; k++) R(g, -76 + k * 13, -30, 5, 10, '#94A3B8');
  blockI(g, -30, -44, 60, 44, '#F8FAFC', '#FFFFFF', '#A8A8B0'); poly(g, [-34, -44, 0, -58, 34, -44], '#F1F5F9'); for (let k = 0; k < 6; k++) R(g, -26 + k * 10, -40, 3, 40, '#E5E7EB');
  R(g, -1, -70, 2, 12, '#9CA3AF'); for (let s = 0; s < 4; s++) R(g, 1, -70 + s * 2, 10, 1, s % 2 ? '#F8FAFC' : '#DC2626');
  ell(g, 50, -46, 6, 6, '#9CA3AF'); R(g, 47, -44, 2, 2, '#F8FAFC'); txt(g, 'SOCKS', 50, -52, '#111827', 3);
  sign(g, 'THE WACKY WHITE HOUSE', 0, -14, -2, '#1D4ED8', '#F8FAFC', 5, false);
};
export const paintBigKid = (g: Ctx) => {
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(-40, -30, 30, 0.2, Math.PI - 0.2); g.stroke(); g.strokeStyle = '#22D3EE'; g.lineWidth = 3; g.stroke();
  R(g, 40, -40, 4, 40, '#A3E635'); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; line(g, 42, -40, 42 + Math.cos(a) * 26, -40 + Math.sin(a) * 10, '#F0ABFC', 2); ell(g, 42 + Math.cos(a) * 26, -36 + Math.sin(a) * 10, 4, 3, '#FDE047'); }
  sign(g, 'THE BIG-KID ZONE', 0, -66, -48, '#111827', '#A3E635', 5);
};
export const paintPunchy = (g: Ctx) => {
  blockI(g, -60, -40, 120, 40, '#FDE047', '#FEF9C3', '#A16207'); R(g, -14, -24, 28, 24, '#111827');
  for (const s of [-1, 1]) { R(g, s * 50 - 2, -70, 4, 30, '#7C2D12'); R(g, s * 50 - 12, -80, 24, 12, '#9CA3AF'); R(g, s * 50 - 12, -80, 24, 2, '#E5E7EB'); }
  sign(g, 'PUNCHY & KICKY', 0, -52, -42, '#DC2626', '#F8FAFC', 5, false); txt(g, 'KILL-O-RAMA', 0, -30, '#DC2626', 4);
};
export const paintAmphi = (g: Ctx) => {
  g.beginPath(); g.moveTo(-90, 0); g.quadraticCurveTo(-90, -70, 0, -70); g.quadraticCurveTo(90, -70, 90, 0); g.closePath(); g.fillStyle = '#E5E7EB'; g.fill(); g.strokeStyle = INK; g.stroke();
  for (let k = 1; k < 5; k++) { g.strokeStyle = '#9CA3AF'; g.beginPath(); g.ellipse(0, 0, 90 - k * 14, 70 - k * 12, 0, Math.PI, 0); g.stroke(); }
  R(g, -40, -24, 80, 24, '#7C2D12'); R(g, -30, -18, 26, 10, '#16A34A'); R(g, 6, -18, 10, 14, '#A16207'); ell(g, 22, -10, 5, 4, '#F8FAFC');
  sign(g, 'STUPID DAD LIVE!', 0, -84, -70, '#DC2626', '#FDE047', 6, false);
};
