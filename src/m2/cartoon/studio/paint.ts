// The studio's painting kit (the SNES pass): a 1994 animation studio's materials in six-step ramps (darkest first, lit
// from the upper left) and its furniture painted the one way everywhere: fake-wood paneling (grooved planks, grain,
// a chair rail), real walnut, cork, beige office plastic, steel, institutional paint over cinder block, egg-crate foam,
// velvet and blackout drape in stepped folds, theater carpet. The office kit of the year: CRTs (curved glass, a
// banded screen, scanlines, knobs), fax machines, desk phones, water coolers, filing cabinets, a ficus, wall clocks,
// motivational posters, pinned-up sheets, fluorescent troffers. Every box inked, lit along its top and left, shaded
// along its right and foot, the seams dithered. Shared by the studio's rooms (rooms.ts) and its play plane (art.ts).

import { box, mix, hash, INK, type Ctx } from '../kit';
import { checker } from '../../../m1/game/render/pixelArt';
import { signText, type Look } from '../../signLetters';

export { box, mix, hash, INK, checker, type Ctx };

// ---------------------------------------------------------------------------------------------------------------
// Materials (six steps, darkest first)

/** Six steps round any color. */
export const R6 = (col: string) => [mix(col, INK, 0.62), mix(col, INK, 0.36), mix(col, INK, 0.14), col, mix(col, '#FFFFFF', 0.3), mix(col, '#FFFFFF', 0.6)];

export const PANEL = ['#2A1608', '#4A2A12', '#6E421E', '#8E5A2C', '#AE7840', '#D09E62'];
export const WALNUT = ['#1A0C06', '#32180C', '#4E2814', '#6A3A1E', '#8A522C', '#B07442'];
export const CORK = ['#4A2A10', '#6E4220', '#946032', '#B47E48', '#CC9C64', '#E4BE8A'];
export const BEIGE = ['#4A4436', '#6E6754', '#948C74', '#B8B096', '#D4CCB2', '#ECE6D0'];
export const PAPER = ['#8E8676', '#B4AC9A', '#D2CCBA', '#E8E4D6', '#F6F4EC', '#FFFFFF'];
export const STEEL = ['#1E2028', '#33363F', '#4C5058', '#686C76', '#8A8E98', '#B4B8C2'];
export const CHARCOAL = ['#0C0C10', '#16161C', '#22222A', '#30303A', '#44444F', '#5E5E6A'];
export const TEAL = ['#06302E', '#0C4A46', '#14665F', '#1E857B', '#3AA89A', '#74CCBE'];
export const PURPLE = ['#1A0A2E', '#2C1448', '#42206A', '#5A2E8C', '#7A4CAE', '#A27ED0'];
export const VELVET = ['#2A040C', '#4E0A18', '#7A1226', '#A41C34', '#C83A4E', '#E8707E'];
export const GOLD = ['#3A2408', '#6A4410', '#A06C1C', '#D09A30', '#F2C84A', '#FFF0A8'];
export const CHROME = ['#2A2E38', '#4A505E', '#727A8A', '#A0A8B6', '#CCD2DC', '#F4F6FA'];
export const GREENWALL = ['#24301F', '#3A4A33', '#55654D', '#728468', '#90A284', '#B4C4A6'];
export const CREAMWALL = ['#6E6850', '#948C6E', '#B8B092', '#D2CAAC', '#E6E0C6', '#F6F2E0'];
export const FOAM = ['#14161C', '#20232C', '#2E323C', '#3E434E', '#515664', '#6A7080'];
export const BLACKOUT = ['#060608', '#0E0E12', '#18181E', '#24242C', '#32323C', '#46464F'];
export const NAVYWALL = ['#0A0E22', '#121A3A', '#1C2856', '#283A74', '#3A5296', '#5A74B8'];
export const LEAF = ['#0A2412', '#123A1C', '#1C5428', '#2A7036', '#44904A', '#6EB466'];
export const TERRA = ['#3A160A', '#5E2612', '#863A1C', '#A8522A', '#C8744A', '#E4A07A'];
export const SLATE = ['#1A1E26', '#2A303C', '#3C4452', '#525C6C', '#6E7888', '#96A0B0'];
export const BLUEPLAS = ['#0A1A3A', '#122C5E', '#1C428A', '#2A5AB4', '#4A80D4', '#86B2EC'];
export const REDPLAS = ['#3A0606', '#600C0C', '#8E1616', '#BA2222', '#DC4A40', '#F4887A'];
/** The lit lip along anything he can stand on. */
export const LIP = ['#5A3A20', '#B08A5A', '#FFF2D6', '#FFFFFF'];

// ---------------------------------------------------------------------------------------------------------------
// Basics

/** A box in steps: inked round, its face, lit along its top and left, shaded down its right and along its foot,
 *  the seams dithered. */
export const slab = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], ink = true) => {
  if (ink) box(g, x - 1, y - 1, w + 2, h + 2, INK);
  box(g, x, y, w, h, R[3]);
  if (w > 6 && h > 6) {
    box(g, x, y, Math.max(1, Math.round(w * 0.12)), h, R[4]);
    box(g, x + w - Math.max(2, Math.round(w * 0.1)), y, Math.max(2, Math.round(w * 0.1)), h, R[2]);
    box(g, x, y + h - 2, w, 2, R[1]);
    checker(g, x + w - Math.max(2, Math.round(w * 0.1)) - 2, y, 2, h - 2, R[2], 0, 1);
    checker(g, x, y + h - 4, w, 2, R[2], 1, 1);
  }
  box(g, x, y, w, 1, R[5]);
};
/** A vertical run of steps top to bottom (`cols` in order), each seam dithered. */
export const bands = (g: Ctx, x: number, y: number, w: number, h: number, cols: string[]) => {
  const n = cols.length, bh = h / n;
  for (let i = 0; i < n; i++) box(g, x, y + i * bh, w, Math.ceil(bh) + 1, cols[i]);
  for (let i = 1; i < n; i++) { const ys = Math.round(y + i * bh); checker(g, x, ys - 2, w, 2, cols[i], 0, 1); checker(g, x, ys, w, 2, cols[i - 1], 1, 1); }
};
/** A lit lip along a top he can stand on. */
export const lip = (g: Ctx, x: number, y: number, w: number) => {
  box(g, x, y, w, 3, LIP[2]); box(g, x, y, w, 1, LIP[3]); box(g, x, y + 3, w, 1, LIP[1]); checker(g, x, y + 4, w, 2, LIP[0], 0, 1);
};
/** A soft shadow under a thing on the floor (dithered out at the ends). */
export const footShadow = (g: Ctx, x: number, y: number, w: number) => {
  box(g, x + 4, y - 2, w - 8, 3, 'rgba(10,6,20,0.45)'); checker(g, x, y - 2, w, 3, 'rgba(10,6,20,0.45)', 0, 1);
};
/** Small print and a marker's scrawl. */
export const PRINT = (col = '#2A1A0E'): Look => ({ sx: 1, sy: 1, fill: col });
export const MARKER = (col: string, seed = 0): Look => ({ sx: 1, sy: 1, fill: col, wobble: 1, seed });
export const BIGPRINT = (col: string, ink?: string): Look => ({ sx: 2, sy: 2, fill: col, ink, gap: 1 });
export const txt = (g: Ctx, s: string, x: number, y: number, L: Look, align: 'left' | 'center' | 'right' = 'center') => signText(g, s, x, y, L, align);

// ---------------------------------------------------------------------------------------------------------------
// Walls

/** Fake-wood paneling (the 4x8 sheets every 1994 office had): grooved planks of uneven tone, grain streaks, knots. */
export const paneling = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed: number, plank = 22) => {
  box(g, x, y, w, h, R[3]);
  let k = 0;
  for (let px0 = x; px0 < x + w; px0 += plank, k++) {
    const t = hash(seed + k * 1.7), pw = Math.min(plank, x + w - px0);
    if (t > 0.72) box(g, px0, y, pw, h, R[4]); else if (t < 0.25) box(g, px0, y, pw, h, R[2]);
    // (grain: long streaks, a wave in them)
    for (let s = 0; s < 4; s++) {
      const gx = px0 + 3 + Math.floor(hash(seed + k * 3.3 + s) * (pw - 6));
      const g0 = y + Math.floor(hash(seed + k + s * 9.1) * h * 0.5), gl = 20 + Math.floor(hash(k + s + seed * 0.3) * h * 0.5);
      box(g, gx, g0, 1, gl, t > 0.72 ? R[3] : R[2]);
      box(g, gx + 1, g0 + gl * 0.4, 1, gl * 0.3, t > 0.72 ? R[3] : R[2]);
    }
    if (hash(seed * 0.7 + k * 5.1) > 0.82) { const ky = y + 20 + hash(k * 2.2 + seed) * (h - 40); box(g, px0 + pw / 2 - 2, ky, 4, 6, R[1]); box(g, px0 + pw / 2 - 1, ky + 1, 2, 3, R[0]); }
    // (the groove, its lit lip)
    box(g, px0, y, 1, h, R[0]); box(g, px0 + 1, y, 1, h, R[5]);
  }
};
/** A chair rail / picture rail moulding across at y. */
export const rail = (g: Ctx, x: number, y: number, w: number, R: string[]) => {
  box(g, x, y - 1, w, 7, INK); box(g, x, y, w, 5, R[3]); box(g, x, y, w, 1, R[5]); box(g, x, y + 1, w, 1, R[4]); box(g, x, y + 4, w, 1, R[1]);
};
/** A baseboard along the wall's foot (y its top). */
export const baseboard = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  box(g, x, y - 1, w, h + 1, INK); box(g, x, y, w, h, R[2]); box(g, x, y, w, 2, R[4]); box(g, x, y + 2, w, 1, R[3]); box(g, x, y + h - 2, w, 2, R[0]);
};
/** Painted cinder block (courses, staggered joints, the paint's sheen). */
export const cinder = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed: number) => {
  box(g, x, y, w, h, R[3]);
  let row = 0;
  for (let cy = y; cy < y + h; cy += 16, row++) {
    box(g, x, cy + 15, w, 1, R[1]); box(g, x, cy, w, 1, R[4]);
    for (let bx = x - (row % 2) * 20; bx < x + w; bx += 40) {
      if (bx > x) { box(g, bx, cy, 1, 15, R[1]); box(g, bx + 1, cy, 1, 15, R[4]); }
      if (hash(seed + bx * 0.13 + row) > 0.86) box(g, Math.max(x, bx + 6), cy + 4, 10, 6, R[2]);
    }
  }
};
/** The 1994 lobby: purple with teal and yellow squiggles, zigzags, confetti (the Memphis look), in steps. */
export const memphis = (g: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  box(g, x, y, w, h, PURPLE[2]);
  checker(g, x, y, w, h, PURPLE[1], 0, 2);
  for (let k = 0; k < (w * h) / 2600; k++) {
    const t = hash(seed + k * 1.31), u = hash(seed + k * 7.7), sx = x + t * w, sy = y + u * h, kind = Math.floor(hash(k * 3.1 + seed) * 5);
    if (kind === 0) { for (let i = 0; i < 4; i++) { box(g, sx + i * 6, sy + (i % 2 ? 0 : 5), 6, 2, TEAL[4]); box(g, sx + i * 6, sy + (i % 2 ? 2 : 7), 6, 1, TEAL[2]); } }
    else if (kind === 1) { box(g, sx, sy, 7, 7, '#F2C94C'); box(g, sx, sy, 7, 1, '#FFF0A8'); box(g, sx + 6, sy, 1, 7, '#A07A1C'); }
    else if (kind === 2) { g.strokeStyle = '#EC4899'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + 6, sy - 8, sx + 12, sy); g.quadraticCurveTo(sx + 18, sy + 8, sx + 24, sy); g.stroke(); }
    else if (kind === 3) { g.fillStyle = TEAL[3]; g.beginPath(); g.moveTo(sx, sy + 8); g.lineTo(sx + 5, sy); g.lineTo(sx + 10, sy + 8); g.closePath(); g.fill(); box(g, sx + 4, sy + 1, 2, 2, TEAL[5]); }
    else { box(g, sx, sy, 3, 3, '#60A5FA'); box(g, sx + 9, sy + 5, 3, 3, '#F472B6'); box(g, sx + 4, sy + 10, 3, 3, '#FDE047'); }
  }
};
/** Egg-crate acoustic foam in staggered wedges. */
export const eggCrate = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  box(g, x, y, w, h, R[1]);
  for (let cy = y; cy < y + h; cy += 12) for (let cx = x + ((cy - y) / 12 % 2) * 6; cx < x + w; cx += 12) {
    box(g, cx + 1, cy + 1, 9, 9, R[2]); box(g, cx + 2, cy + 2, 5, 5, R[3]); box(g, cx + 2, cy + 2, 3, 2, R[4]); box(g, cx + 7, cy + 7, 3, 3, R[0]);
  }
};
/** A drape (velvet, blackout) in stepped vertical folds, top to bottom. */
export const drape = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], fold = 18) => {
  box(g, x, y, w, h, R[2]);
  for (let fx = x; fx < x + w; fx += fold) {
    box(g, fx, y, fold * 0.25, h, R[1]); box(g, fx + fold * 0.25, y, fold * 0.2, h, R[2]);
    box(g, fx + fold * 0.45, y, fold * 0.25, h, R[3]); box(g, fx + fold * 0.55, y, fold * 0.12, h, R[4]);
    box(g, fx + fold * 0.85, y, fold * 0.15, h, R[0]);
    checker(g, fx + fold * 0.7, y, 2, h, R[3], 0, 1);
  }
  // (the hem: weighted, a shadow along the floor)
  box(g, x, y + h - 5, w, 5, R[1]); box(g, x, y + h - 5, w, 1, R[3]);
};
/** A swag of velvet over the top of a wall (x..x+w at y), gold tassels. */
export const swag = (g: Ctx, x: number, y: number, w: number, d: number, R: string[]) => {
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 2, y - 2); g.quadraticCurveTo(x + w / 2, y + d * 2 + 4, x + w + 2, y - 2); g.closePath(); g.fill();
  for (let i = 0; i < 4; i++) { g.fillStyle = R[4 - i]; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y + (d * 2) * (1 - i * 0.18), x + w, y); g.closePath(); g.fill(); }
  for (const tx of [x, x + w]) { box(g, tx - 2, y, 4, 14, INK); box(g, tx - 1, y, 2, 13, GOLD[4]); box(g, tx - 3, y + 12, 6, 6, INK); box(g, tx - 2, y + 12, 4, 5, GOLD[3]); }
};

// ---------------------------------------------------------------------------------------------------------------
// Furniture and the office kit

/** A CRT (x, y its case's top left; w across): a beige (or black) case, curved glass in a bezel, the screen painted by
 *  `screen` (else dark glass), scanlines, a glint, knobs and a vent. */
export const crt = (g: Ctx, x: number, y: number, w: number, screen?: (g: Ctx, sx: number, sy: number, sw: number, sh: number) => void, R: string[] = BEIGE) => {
  const h = Math.round(w * 0.82);
  slab(g, x, y, w, h, R);
  const sx = x + Math.round(w * 0.08), sy = y + Math.round(h * 0.1), sw = Math.round(w * 0.68), sh = Math.round(h * 0.7);
  g.fillStyle = INK; g.beginPath(); g.roundRect(sx - 2, sy - 2, sw + 4, sh + 4, 5); g.fill();
  g.save(); g.beginPath(); g.roundRect(sx, sy, sw, sh, 4); g.clip();
  if (screen) screen(g, sx, sy, sw, sh); else bands(g, sx, sy, sw, sh, ['#1E2A2E', '#16201F', '#0E1614']);
  for (let ly = sy; ly < sy + sh; ly += 2) box(g, sx, ly, sw, 1, 'rgba(0,0,0,0.22)');
  box(g, sx + 3, sy + 3, Math.round(sw * 0.3), 2, 'rgba(255,255,255,0.35)'); box(g, sx + 3, sy + 3, 2, Math.round(sh * 0.35), 'rgba(255,255,255,0.25)');
  g.restore();
  // (the control strip: knobs, a power lamp, the vent slots)
  const kx = x + Math.round(w * 0.8);
  for (let i = 0; i < 2; i++) { box(g, kx - 1, y + 6 + i * 9, 7, 7, INK); box(g, kx, y + 7 + i * 9, 5, 5, R[1]); box(g, kx, y + 7 + i * 9, 2, 2, R[4]); }
  box(g, kx + 1, y + h - 10, 3, 2, '#5CF06A');
  for (let i = 0; i < 4; i++) box(g, kx - 1, y + 26 + i * 4, 7, 1, R[1]);
  return { sx, sy, sw, sh, h };
};
/** SMPTE color bars (a CRT with nothing on). */
export const colorBars = (g: Ctx, sx: number, sy: number, sw: number, sh: number) => {
  const cols = ['#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0'];
  for (let i = 0; i < 7; i++) box(g, sx + (i * sw) / 7, sy, sw / 7 + 1, sh * 0.72, cols[i]);
  box(g, sx, sy + sh * 0.72, sw, sh * 0.28, '#101018'); box(g, sx + sw * 0.1, sy + sh * 0.76, sw * 0.2, sh * 0.2, '#F0F0F0');
};
/** A fax machine (feet at x..x+44, y the desk's top): beige, a paper tray, a handset, a page curling out. */
export const fax = (g: Ctx, x: number, y: number, page = 0) => {
  slab(g, x, y - 18, 44, 18, BEIGE);
  slab(g, x + 4, y - 24, 30, 6, BEIGE);
  box(g, x + 28, y - 14, 12, 6, INK); box(g, x + 29, y - 13, 10, 4, '#3A4A36'); box(g, x + 30, y - 12, 4, 1, '#9AE68C');
  for (let i = 0; i < 6; i++) box(g, x + 6 + (i % 3) * 5, y - 12 + Math.floor(i / 3) * 4, 3, 2, BEIGE[1]);
  // (the handset in its cradle along the side)
  box(g, x - 4, y - 20, 6, 16, INK); box(g, x - 3, y - 19, 4, 14, BEIGE[2]);
  // (the paper tray behind, a page in it; the page coming out the front)
  box(g, x + 8, y - 34, 24, 12, INK); box(g, x + 9, y - 33, 22, 10, PAPER[4]);
  if (page > 0) { box(g, x + 10, y - 6, 22, page, INK); box(g, x + 11, y - 6, 20, page - 1, PAPER[5]); for (let l = 4; l < page - 2; l += 3) box(g, x + 13, y - 6 + l, 14 - (l % 6), 1, '#5A6070'); }
};
/** A desk phone (y its desk's top). */
export const deskPhone = (g: Ctx, x: number, y: number, R: string[] = BEIGE) => {
  slab(g, x, y - 8, 22, 8, R);
  box(g, x - 1, y - 13, 24, 6, INK); box(g, x, y - 12, 22, 4, R[3]); box(g, x, y - 12, 22, 1, R[5]);
  for (let i = 0; i < 6; i++) box(g, x + 4 + (i % 3) * 5, y - 6 + Math.floor(i / 3) * 2, 2, 1, R[1]);
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 22, y - 4); g.bezierCurveTo(x + 30, y + 2, x + 26, y - 6, x + 32, y); g.stroke();
};
/** A water cooler (its feet's middle at x, on y): the jug, the taps, the cabinet. */
export const cooler = (g: Ctx, x: number, y: number) => {
  slab(g, x - 12, y - 44, 24, 44, PAPER);
  box(g, x - 9, y - 40, 4, 3, '#2A5AB4'); box(g, x + 4, y - 40, 4, 3, '#BA2222');
  box(g, x - 8, y - 30, 16, 10, INK); box(g, x - 7, y - 29, 14, 8, PAPER[1]);
  g.fillStyle = INK; g.beginPath(); g.roundRect(x - 12, y - 78, 24, 34, 8); g.fill();
  g.fillStyle = '#7CC4F0'; g.beginPath(); g.roundRect(x - 11, y - 77, 22, 32, 7); g.fill();
  box(g, x - 11, y - 64, 22, 19, '#4A9AD8'); box(g, x - 8, y - 74, 3, 24, '#C8ECFC'); box(g, x - 4, y - 70, 1, 4, '#E8F8FF'); box(g, x - 2, y - 58, 1, 3, '#E8F8FF');
  box(g, x - 13, y - 64, 26, 1, '#2E6A9E');
  footShadow(g, x - 14, y, 28);
};
/** A filing cabinet (x its left, y the floor): `n` drawers, beige or steel, labels, handles. */
export const fileCab = (g: Ctx, x: number, y: number, w: number, n: number, R: string[] = BEIGE, seed = 0) => {
  const h = n * 24;
  slab(g, x, y - h, w, h, R);
  for (let i = 0; i < n; i++) {
    const dy = y - h + i * 24;
    box(g, x + 3, dy + 3, w - 6, 19, R[2]); box(g, x + 3, dy + 3, w - 6, 1, R[1]); box(g, x + 3, dy + 21, w - 6, 1, R[4]);
    box(g, x + w / 2 - 6, dy + 13, 12, 3, INK); box(g, x + w / 2 - 5, dy + 13, 10, 2, CHROME[4]);
    box(g, x + w / 2 - 5, dy + 6, 10, 5, INK); box(g, x + w / 2 - 4, dy + 7, 8, 3, PAPER[4]);
    if (hash(seed + i) > 0.7) { box(g, x + 4, dy + 22, w - 8, 2, INK); box(g, x + 5, dy + 21, w - 10, 2, PAPER[4]); }
  }
  footShadow(g, x - 2, y, w + 4);
};
/** A potted ficus (or a fake one): its pot's middle at x, on y, `h` tall. */
export const ficus = (g: Ctx, x: number, y: number, h: number, seed: number, pot: string[] = TERRA) => {
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 15, y - 26); g.lineTo(x + 15, y - 26); g.lineTo(x + 11, y); g.lineTo(x - 11, y); g.closePath(); g.fill();
  g.fillStyle = pot[3]; g.beginPath(); g.moveTo(x - 13, y - 25); g.lineTo(x + 13, y - 25); g.lineTo(x + 10, y - 1); g.lineTo(x - 10, y - 1); g.closePath(); g.fill();
  box(g, x - 12, y - 25, 6, 23, pot[4]); box(g, x + 5, y - 25, 6, 23, pot[2]); box(g, x - 15, y - 28, 30, 5, INK); box(g, x - 14, y - 27, 28, 3, pot[4]);
  // (the trunk, braided; the leaves in clumps, dark under, lit on top)
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y - 26); g.quadraticCurveTo(x - 4, y - h * 0.5, x + 2, y - h * 0.7); g.stroke();
  g.strokeStyle = '#6A4A2A'; g.lineWidth = 2; g.stroke();
  for (let i = 0; i < 16; i++) {
    const a = hash(seed + i * 1.9) * Math.PI * 2, rr = hash(seed + i * 4.1) * h * 0.32;
    const lx = x + Math.cos(a) * rr * 1.1, ly = y - h * 0.68 + Math.sin(a) * rr * 0.8;
    g.fillStyle = INK; g.beginPath(); g.ellipse(lx, ly, 8, 6, a, 0, Math.PI * 2); g.fill();
    g.fillStyle = LEAF[ly < y - h * 0.68 ? 4 : 2]; g.beginPath(); g.ellipse(lx, ly, 7, 5, a, 0, Math.PI * 2); g.fill();
    box(g, lx - 2, ly - 2, 2, 1, LEAF[5]);
  }
  footShadow(g, x - 16, y, 32);
};
/** A wall clock (its middle at x, y; r round), showing hh:mm. */
export const wallClock = (g: Ctx, x: number, y: number, r: number, hh: number, mm: number, R: string[] = CHARCOAL) => {
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 2, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[3]; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[5]; g.beginPath(); g.arc(x - 1, y - 1, r + 1, Math.PI * 1.05, Math.PI * 1.5); g.lineTo(x, y); g.fill();
  g.fillStyle = PAPER[4]; g.beginPath(); g.arc(x, y, r - 2, 0, Math.PI * 2); g.fill();
  g.fillStyle = PAPER[2]; g.beginPath(); g.arc(x, y, r - 2, 0, Math.PI); g.fill();
  for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; box(g, x + Math.cos(a) * (r - 5) - 1, y + Math.sin(a) * (r - 5) - 1, i % 3 ? 1 : 2, i % 3 ? 1 : 2, INK); }
  const ha = -Math.PI / 2 + ((hh % 12) + mm / 60) * (Math.PI / 6), ma = -Math.PI / 2 + mm * (Math.PI / 30);
  g.strokeStyle = INK; g.lineCap = 'round';
  g.lineWidth = 2.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5); g.stroke();
  g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ma) * r * 0.78, y + Math.sin(ma) * r * 0.78); g.stroke();
  g.lineCap = 'butt';
  box(g, x - 1, y - 1, 2, 2, '#BA2222');
};
/** A motivational poster: a black frame, a photo (banded sky and a motif), the WORD in caps, a line of smug under it. */
export const motivator = (g: Ctx, x: number, y: number, w: number, word: string, line: string, motif: 'eagle' | 'peak' | 'rowers' | 'sunset' | 'bulb') => {
  const h = Math.round(w * 1.3), ph = Math.round(h * 0.6);
  box(g, x - 3, y - 3, w + 6, h + 6, '#8A7A4A'); box(g, x - 2, y - 2, w + 4, h + 4, INK); box(g, x, y, w, h, '#0A0A0E');
  const px0 = x + 5, py0 = y + 5, pw = w - 10;
  box(g, px0 - 1, py0 - 1, pw + 2, ph + 2, '#E8E4D6');
  const sky = motif === 'sunset' ? ['#2A1A4A', '#6A2A5A', '#C24A4A', '#F28A3A', '#FCD26A'] : motif === 'bulb' ? ['#0A0A12', '#12121E', '#1A1A2A'] : ['#2A5A9E', '#4A80C4', '#7AAAE0', '#B0D2F2'];
  bands(g, px0, py0, pw, ph, sky);
  if (motif === 'eagle') {
    g.fillStyle = '#2A1A10'; g.beginPath(); g.moveTo(px0 + pw * 0.1, py0 + ph * 0.45); g.quadraticCurveTo(px0 + pw * 0.35, py0 + ph * 0.25, px0 + pw * 0.5, py0 + ph * 0.48); g.quadraticCurveTo(px0 + pw * 0.65, py0 + ph * 0.25, px0 + pw * 0.9, py0 + ph * 0.42); g.lineTo(px0 + pw * 0.52, py0 + ph * 0.58); g.closePath(); g.fill();
    box(g, px0 + pw * 0.48, py0 + ph * 0.42, 4, 4, '#F6F4EC'); box(g, px0 + pw * 0.52, py0 + ph * 0.45, 2, 1, '#F2C84A');
    bands(g, px0, py0 + ph * 0.8, pw, ph * 0.2, ['#3A5A3A', '#2A4A2A']);
  } else if (motif === 'peak') {
    g.fillStyle = '#3A4A6A'; g.beginPath(); g.moveTo(px0, py0 + ph); g.lineTo(px0 + pw * 0.45, py0 + ph * 0.2); g.lineTo(px0 + pw, py0 + ph); g.closePath(); g.fill();
    g.fillStyle = '#F6F4EC'; g.beginPath(); g.moveTo(px0 + pw * 0.33, py0 + ph * 0.42); g.lineTo(px0 + pw * 0.45, py0 + ph * 0.2); g.lineTo(px0 + pw * 0.58, py0 + ph * 0.44); g.lineTo(px0 + pw * 0.5, py0 + ph * 0.38); g.lineTo(px0 + pw * 0.42, py0 + ph * 0.46); g.closePath(); g.fill();
    box(g, px0 + pw * 0.45 - 1, py0 + ph * 0.17, 1, 5, INK); box(g, px0 + pw * 0.45, py0 + ph * 0.17, 4, 3, '#BA2222');
  } else if (motif === 'rowers') {
    bands(g, px0, py0 + ph * 0.55, pw, ph * 0.45, ['#4A80C4', '#2A5A9E', '#1A3A6E']);
    box(g, px0 + pw * 0.15, py0 + ph * 0.58, pw * 0.7, 3, INK);
    for (let i = 0; i < 4; i++) { box(g, px0 + pw * (0.22 + i * 0.16), py0 + ph * 0.5, 3, 5, INK); g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(px0 + pw * (0.23 + i * 0.16), py0 + ph * 0.56); g.lineTo(px0 + pw * (0.16 + i * 0.16), py0 + ph * 0.7); g.stroke(); }
  } else if (motif === 'sunset') {
    g.fillStyle = '#FFF0A8'; g.beginPath(); g.arc(px0 + pw / 2, py0 + ph * 0.72, pw * 0.16, Math.PI, 0); g.fill();
    box(g, px0, py0 + ph * 0.72, pw, ph * 0.28, '#1A1030'); for (let i = 0; i < 4; i++) box(g, px0 + pw * 0.3 + i * 3, py0 + ph * (0.76 + i * 0.05), pw * 0.4 - i * 6, 1, '#F28A3A');
  } else {
    g.fillStyle = INK; g.beginPath(); g.arc(px0 + pw / 2, py0 + ph * 0.42, pw * 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FCE880'; g.beginPath(); g.arc(px0 + pw / 2, py0 + ph * 0.42, pw * 0.18, 0, Math.PI * 2); g.fill();
    box(g, px0 + pw / 2 - pw * 0.08, py0 + ph * 0.58, pw * 0.16, ph * 0.12, '#8A8E98');
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; box(g, px0 + pw / 2 + Math.cos(a) * pw * 0.3 - 1, py0 + ph * 0.42 + Math.sin(a) * pw * 0.3 - 1, 2, 2, '#FCE880'); }
  }
  txt(g, word, x + w / 2, py0 + ph + 14, { sx: 1, sy: 2, fill: '#F6F4EC', gap: 2 });
  txt(g, line, x + w / 2, py0 + ph + 26, PRINT('#B8B096'));
};
/** A sheet pinned to the wall (a drawing on it by `draw`), a pushpin, its curled corner. */
export const pinned = (g: Ctx, x: number, y: number, w: number, h: number, col = PAPER[4], pin = '#DC2626', draw?: (g: Ctx) => void) => {
  box(g, x + 2, y + 2, w, h, 'rgba(10,6,20,0.35)');
  box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, col); box(g, x, y, w, 1, '#FFFFFF');
  box(g, x + w - 5, y + h - 5, 5, 5, mix(col, INK, 0.2)); box(g, x + w - 5, y + h - 5, 1, 5, INK);
  if (draw) draw(g);
  box(g, x + w / 2 - 2, y - 2, 4, 4, INK); box(g, x + w / 2 - 1, y - 1, 2, 2, pin);
};
/** A brass picture light over a frame (x the frame's middle, y its top). */
export const pictureLight = (g: Ctx, x: number, y: number, w: number) => {
  box(g, x - 2, y - 14, 4, 12, INK); box(g, x - 1, y - 14, 2, 11, GOLD[3]);
  g.fillStyle = INK; g.beginPath(); g.roundRect(x - w / 2 - 1, y - 18, w + 2, 7, 3); g.fill();
  g.fillStyle = GOLD[3]; g.beginPath(); g.roundRect(x - w / 2, y - 17, w, 5, 2); g.fill();
  box(g, x - w / 2 + 2, y - 17, w - 4, 1, GOLD[5]); box(g, x - w / 2 + 2, y - 13, w - 4, 1, GOLD[1]);
};
/** A gilt frame round x, y, w, h (its inside left to `inner`). */
export const gilt = (g: Ctx, x: number, y: number, w: number, h: number, inner?: string) => {
  box(g, x - 9, y - 9, w + 18, h + 18, INK);
  box(g, x - 8, y - 8, w + 16, h + 16, GOLD[3]);
  box(g, x - 8, y - 8, w + 16, 2, GOLD[5]); box(g, x - 8, y - 8, 2, h + 16, GOLD[4]);
  box(g, x - 8, y + h + 6, w + 16, 2, GOLD[1]); box(g, x + w + 6, y - 8, 2, h + 16, GOLD[2]);
  for (let k = 0; k < (w + 16) / 6; k++) { box(g, x - 6 + k * 6, y - 5, 3, 2, GOLD[4]); box(g, x - 6 + k * 6, y + h + 3, 3, 2, GOLD[2]); }
  box(g, x - 3, y - 3, w + 6, h + 6, GOLD[1]); box(g, x - 2, y - 2, w + 4, h + 4, INK);
  if (inner) box(g, x, y, w, h, inner);
};
/** A metal shelf on two brackets (x..x+w at y). */
export const shelf = (g: Ctx, x: number, y: number, w: number, R: string[] = WALNUT) => {
  for (const bx of [x + 10, x + w - 14]) { box(g, bx - 1, y + 5, 5, 16, INK); box(g, bx, y + 5, 3, 14, STEEL[3]); }
  box(g, x - 1, y - 1, w + 2, 7, INK); box(g, x, y, w, 5, R[3]); box(g, x, y, w, 1, R[5]); box(g, x, y + 4, w, 1, R[1]);
  checker(g, x, y + 6, w, 4, 'rgba(10,6,20,0.4)', 0, 1);
};
/** A fluorescent tube fixture hung on chains (x its middle, y its tube; lit or not). */
export const tubeLamp = (g: Ctx, x: number, y: number, w: number, on: boolean, chain = 0) => {
  if (chain > 0) for (const cx of [x - w / 2 + 6, x + w / 2 - 6]) for (let k = 0; k < chain; k += 5) box(g, cx - 1, y - chain - 6 + k, 2, 3, STEEL[3]);
  box(g, x - w / 2 - 1, y - 7, w + 2, 9, INK); box(g, x - w / 2, y - 6, w, 4, STEEL[3]); box(g, x - w / 2, y - 6, w, 1, STEEL[5]);
  box(g, x - w / 2 + 2, y - 2, w - 4, 3, on ? '#F4FFF8' : '#8A9890'); if (on) box(g, x - w / 2 + 2, y + 1, w - 4, 1, '#C8F0DA');
};
/** A shelf of VHS tapes (x..x+w, y the shelf's top) in their sleeves, spines out. */
export const tapes = (g: Ctx, x: number, y: number, w: number, seed: number) => {
  let tx = x + 2;
  while (tx < x + w - 6) {
    const t = hash(seed + tx * 0.31), tw = 5 + Math.round(t * 2), th = 22 + Math.round(t * 4);
    const col = ['#18181E', '#F6F4EC', '#2A5AB4', '#BA2222', '#18181E', '#F2C84A'][Math.floor(t * 6)];
    box(g, tx, y - th, tw, th, INK); box(g, tx + 1, y - th + 1, tw - 2, th - 1, col); box(g, tx + 1, y - th + 6, tw - 2, 4, col === '#F6F4EC' ? '#BA2222' : '#F6F4EC');
    tx += tw + (t > 0.9 ? 6 : 0);
  }
};
/** A hanging sign's chains or wires down from the ceiling to y at each x. */
export const wires = (g: Ctx, xs: number[], from: number, to: number) => { for (const x of xs) { box(g, x - 1, from, 2, to - from, INK); box(g, x, from, 1, to - from, STEEL[4]); } };
