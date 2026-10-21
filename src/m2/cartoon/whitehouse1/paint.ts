// The cartoon White House's painting kit (part one's SNES pass): the show's house the way a 1994 Saturday morning
// cartoon paints it at peak SNES: flat bright cel colors in stepped ramps (lit, itself, shade, deep, an ink line round
// everything), dithered seams where two steps meet, nothing quite straight (columns bulge, frames lean a hair, doors
// squash). Everything here paints in local coordinates into a stamp (painted once for the hour, kit.ts still()):
// columns and pilasters with their capitals, gilt frames, the presidents' cartoon portraits, the Seal, sconces, swagged
// drapes, windows with the grounds outside them by the hour, doors, wainscots and crown moldings, wallpapers, busts,
// flags, clocks, vases, bookcases, the cutaway of the house's own brick above the ceilings.

import { box, mix, hash, checker, ramp6, BRASS, INK, type Ctx } from '../kit';
import { signText, type Look } from '../../signLetters';
import { bust as grossBust, drawBust, SKIN, HAIR, CLOTH, IRIS, LIPSTICK, type BustSpec } from '../../grossBust';
import { timeOfDay, skyAt } from '../../timeOfDay';

export type R6 = string[];
/** A ramp round a color (darkest first, kit.ts's six steps). */
export const R = (col: string): R6 => ramp6(col);
export const GILT = BRASS;
export const MARBLE: R6 = ['#5E5A7A', '#8A86A6', '#B8B4CE', '#E2DEEE', '#F6F4FC', '#FFFFFF'];
export const VELVET: R6 = ['#3A0612', '#640C20', '#94162E', '#C42640', '#E25A6A', '#F6A0A8'];
export const NAVY: R6 = ['#0C1638', '#172A62', '#22408E', '#2F58B8', '#5A84D8', '#9CBCF0'];
export const OAK: R6 = ['#3A1E0A', '#5E3416', '#864E22', '#AE6E34', '#D2985A', '#EEC896'];
export const PLUM: R6 = ['#1C0E26', '#2C1638', '#3E2050', '#523068', '#704A86', '#9A78AE'];

/** Fills a path, inks it. */
export const inkP = (g: Ctx, path: () => void, fill: string | CanvasPattern, w = 2) => { g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = w; g.stroke(); };
/** An inked box in steps (`Rm` darkest first): lit top and left edge, shaded right and bottom, dithered seams. */
export const slabI = (g: Ctx, x: number, y: number, w: number, h: number, Rm: R6, t = 2) => {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  box(g, x, y, w, h, Rm[3]);
  if (w > 6 && h > 6) {
    box(g, x, y, w, Math.max(1, Math.round(t)), Rm[4]); box(g, x, y, Math.max(1, Math.round(t)), h, Rm[4]);
    box(g, x + 1, y, Math.max(1, Math.round(w * 0.3)), 1, Rm[5]);
    box(g, x + w - 3, y + 1, 3, h - 1, Rm[2]); checker(g, x + w - 5, y + 1, 2, h - 1, Rm[2], 0, 1);
    box(g, x + 1, y + h - 2, w - 1, 2, Rm[2]);
  }
};
/** A face lit from the upper left in vertical steps (a shaft, a drape's fold, a column), clipped to its path. */
export const stepsAcross = (g: Ctx, path: () => void, x: number, y: number, w: number, h: number, Rm: R6, line = 2) => {
  g.save(); g.beginPath(); path(); g.clip();
  box(g, x - 2, y - 2, w + 4, h + 4, Rm[3]);
  const cut = (k: number) => Math.round(x + w * k);
  box(g, x - 2, y - 2, cut(0.12) - x + 2, h + 4, Rm[5]); checker(g, cut(0.12), y - 2, 2, h + 4, Rm[5], 0, 1);
  box(g, cut(0.14), y - 2, cut(0.3) - cut(0.14), h + 4, Rm[4]); checker(g, cut(0.3), y - 2, 2, h + 4, Rm[4], 1, 1);
  box(g, cut(0.66), y - 2, x + w - cut(0.66) + 2, h + 4, Rm[2]); checker(g, cut(0.66) - 2, y - 2, 2, h + 4, Rm[2], 0, 1);
  box(g, cut(0.86), y - 2, x + w - cut(0.86) + 2, h + 4, Rm[1]); checker(g, cut(0.86) - 2, y - 2, 2, h + 4, Rm[1], 1, 1);
  g.restore();
  if (line) { g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke(); }
};
/** A face lit from above in horizontal steps (a cushion, a slab's front, a drape's swag), clipped to its path. */
export const stepsDown = (g: Ctx, path: () => void, x: number, y: number, w: number, h: number, Rm: R6, line = 2) => {
  g.save(); g.beginPath(); path(); g.clip();
  const cut = (k: number) => Math.round(y + h * k);
  box(g, x - 2, y - 2, w + 4, h + 4, Rm[3]);
  box(g, x - 2, y - 2, w + 4, cut(0.18) - y + 2, Rm[4]); checker(g, x - 2, cut(0.18), w + 4, 2, Rm[4], 0, 1);
  box(g, x - 2, y - 2, w + 4, Math.max(1, cut(0.05) - y + 2), Rm[5]);
  box(g, x - 2, cut(0.64), w + 4, y + h - cut(0.64) + 2, Rm[2]); checker(g, x - 2, cut(0.64) - 2, w + 4, 2, Rm[2], 1, 1);
  box(g, x - 2, cut(0.86), w + 4, y + h - cut(0.86) + 2, Rm[1]);
  g.restore();
  if (line) { g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke(); }
};
/** A dithered shadow over a box (a cast shadow, the dark under a ledge). */
export const shadowBox = (g: Ctx, x: number, y: number, w: number, h: number, col = INK) => checker(g, x, y, w, h, col, 0, 1);

/** The show's letters (small, stepped, inked). */
export const tinyLetters = (fill: string[] = ['#FFFFFF', '#FFF7C2', '#FDE047', '#F59E0B']): Look => ({ sx: 1, sy: 1, bold: true, gap: 1, fill, dither: true, ink: INK });
/** Plaque letters (engraved: dark in brass). */
export const ENGRAVED: Look = { sx: 1, sy: 1, gap: 1, fill: ['#3A2408', '#5A3A10'] };

// ---------------------------------------------------------------------------------------------------------------
// Architecture

/** A wobbly cartoon column (Ionic: a torus base on a plinth, the shaft bulging and fluted, volutes on the capital) at x,
 *  its foot at `foot`, its top at `top` (local y, up is minus), `w` across. */
export const column = (g: Ctx, x: number, foot: number, top: number, w = 30, Rm: R6 = MARBLE, gilt = true) => {
  const h = foot - top, sh0 = top + 26, sh1 = foot - 24;
  // (the plinth, the torus)
  slabI(g, x - w / 2 - 9, foot - 12, w + 18, 12, Rm);
  inkP(g, () => g.roundRect(x - w / 2 - 6, foot - 24, w + 12, 12, 5), Rm[3]);
  box(g, x - w / 2 - 4, foot - 22, w + 4, 2, Rm[5]); box(g, x - w / 2 - 4, foot - 16, w + 8, 3, Rm[2]);
  // (the shaft: a bulge, stepped across, its flutes)
  const shaft = () => { g.moveTo(x - w / 2, sh1); g.quadraticCurveTo(x - w / 2 - 4, (sh0 + sh1) / 2, x - w / 2 + 2, sh0); g.lineTo(x + w / 2 - 2, sh0); g.quadraticCurveTo(x + w / 2 + 4, (sh0 + sh1) / 2, x + w / 2, sh1); g.closePath(); };
  stepsAcross(g, shaft, x - w / 2 - 4, sh0, w + 8, sh1 - sh0, Rm, 2.4);
  for (const k of [-0.3, 0, 0.3]) { const fx = Math.round(x + k * w); box(g, fx, sh0 + 6, 1, sh1 - sh0 - 12, Rm[k > 0 ? 1 : 2]); box(g, fx + 1, sh0 + 6, 1, sh1 - sh0 - 12, Rm[k < 0 ? 5 : 4]); }
  // (the capital: the echinus, the volutes curled each side, the abacus slab on top)
  slabI(g, x - w / 2 - 10, top, w + 20, 8, Rm);
  inkP(g, () => g.roundRect(x - w / 2 - 4, top + 8, w + 8, 12, 3), gilt ? GILT[3] : Rm[3]);
  box(g, x - w / 2 - 2, top + 9, w + 4, 2, gilt ? GILT[5] : Rm[5]); box(g, x - w / 2 - 2, top + 16, w + 4, 3, gilt ? GILT[1] : Rm[2]);
  for (const s of [-1, 1]) {
    const vx = x + s * (w / 2 + 3), vy = top + 15;
    inkP(g, () => g.arc(vx, vy, 6, 0, Math.PI * 2), gilt ? GILT[3] : Rm[4]);
    g.strokeStyle = gilt ? GILT[0] : Rm[1]; g.lineWidth = 1.2; g.beginPath(); for (let a = 0; a < Math.PI * 3; a += 0.3) { const r = 5 * (1 - a / (Math.PI * 3.4)); g.lineTo(vx + Math.cos(a * s) * r, vy + Math.sin(a * s) * r); } g.stroke();
    box(g, vx - 3, vy - 4, 2, 2, gilt ? GILT[5] : Rm[5]);
  }
  void h;
};
/** A flat pilaster on a wall (a shallow column: base, fluted face, a gilt capital). */
export const pilaster = (g: Ctx, x: number, foot: number, top: number, w: number, Rm: R6) => {
  slabI(g, x - w / 2 - 4, foot - 16, w + 8, 16, Rm);
  slabI(g, x - w / 2, top + 14, w, foot - top - 30, Rm);
  for (const k of [-0.25, 0.25]) { box(g, Math.round(x + k * w), top + 20, 1, foot - top - 42, Rm[2]); box(g, Math.round(x + k * w) + 1, top + 20, 1, foot - top - 42, Rm[5]); }
  slabI(g, x - w / 2 - 6, top, w + 12, 14, GILT);
  for (let k = 0; k < 3; k++) box(g, x - w / 2 - 2 + k * (w / 2 + 2), top + 5, 3, 3, GILT[1]);
};
/** Crown molding along the top of a wall (from x0 to x1, its top at y): gilt, dentils, a shadow under it. */
export const crown = (g: Ctx, x0: number, x1: number, y: number, Rm: R6) => {
  box(g, x0, y, x1 - x0, 30, INK);
  box(g, x0, y, x1 - x0, 10, Rm[4]); box(g, x0, y + 1, x1 - x0, 2, Rm[5]);
  box(g, x0, y + 11, x1 - x0, 6, GILT[3]); box(g, x0, y + 11, x1 - x0, 1, GILT[5]); box(g, x0, y + 16, x1 - x0, 1, GILT[1]);
  box(g, x0, y + 18, x1 - x0, 9, Rm[3]);
  for (let x = x0 + 2; x < x1 - 4; x += 8) { box(g, x, y + 19, 5, 6, Rm[4]); box(g, x + 4, y + 19, 1, 6, Rm[1]); }
  box(g, x0, y + 27, x1 - x0, 2, Rm[1]);
  shadowBox(g, x0, y + 30, x1 - x0, 4, Rm[1]);
};
/** Wainscot along a wall's foot (x0..x1, its top at `top`, the floor at `foot`): a chair rail, raised panels, a
 *  skirting board. */
export const wainscot = (g: Ctx, x0: number, x1: number, top: number, foot: number, Rm: R6, panel = 90) => {
  box(g, x0, top, x1 - x0, foot - top, Rm[2]);
  box(g, x0, top - 2, x1 - x0, 8, INK); box(g, x0, top - 1, x1 - x0, 3, Rm[5]); box(g, x0, top + 2, x1 - x0, 3, Rm[3]);
  const n = Math.max(1, Math.round((x1 - x0) / panel)), pw = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const px = Math.round(x0 + i * pw + 8), w = Math.round(pw - 16), py = top + 14, h = foot - top - 34;
    if (h < 8 || w < 8) continue;
    box(g, px - 1, py - 1, w + 2, h + 2, Rm[1]);
    box(g, px, py, w, h, Rm[3]); box(g, px, py, w, 2, Rm[1]); box(g, px, py, 2, h, Rm[1]);
    box(g, px + 2, py + h - 2, w - 2, 2, Rm[4]); box(g, px + w - 2, py + 2, 2, h - 2, Rm[4]);
    box(g, px + 6, py + 6, w - 12, h - 12, Rm[3]); checker(g, px + 6, py + 6, w - 12, 2, Rm[4], 0, 1);
  }
  box(g, x0, foot - 14, x1 - x0, 14, INK); box(g, x0, foot - 13, x1 - x0, 12, Rm[1]); box(g, x0, foot - 13, x1 - x0, 2, Rm[3]);
};

/** Wallpaper over a box: stripes, damask fleurs, polka dots, stars, diamonds (two tones off the wall's ramp). */
export const wallpaper = (g: Ctx, x0: number, y0: number, w: number, h: number, kind: string, Rm: R6) => {
  box(g, x0, y0, w, h, Rm[3]);
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  if (kind === 'stripe') {
    for (let x = x0 + 8; x < x0 + w; x += 36) { box(g, x, y0, 12, h, Rm[4]); box(g, x + 12, y0, 1, h, Rm[2]); box(g, x + 22, y0, 2, h, Rm[2]); box(g, x - 1, y0, 1, h, Rm[5]); }
  } else if (kind === 'fleur') {
    for (let y = y0 + 20, row = 0; y < y0 + h; y += 44, row++) for (let x = x0 + 18 + (row % 2) * 30; x < x0 + w; x += 60) {
      g.fillStyle = Rm[2]; g.beginPath(); g.moveTo(x, y - 12); g.quadraticCurveTo(x + 9, y - 2, x + 2, y + 8); g.lineTo(x, y + 4); g.lineTo(x - 2, y + 8); g.quadraticCurveTo(x - 9, y - 2, x, y - 12); g.fill();
      box(g, x - 6, y + 2, 12, 2, Rm[2]); box(g, x - 1, y - 9, 1, 3, Rm[4]); box(g, x - 4, y - 3, 2, 2, Rm[4]);
    }
  } else if (kind === 'dots') {
    for (let y = y0 + 16, row = 0; y < y0 + h; y += 32, row++) for (let x = x0 + 14 + (row % 2) * 16; x < x0 + w; x += 32) { box(g, x - 3, y - 3, 6, 6, Rm[4]); box(g, x - 2, y - 4, 4, 8, Rm[4]); box(g, x - 2, y - 3, 2, 2, Rm[5]); box(g, x + 1, y + 1, 2, 2, Rm[2]); }
  } else if (kind === 'stars') {
    for (let y = y0 + 22, row = 0; y < y0 + h; y += 46, row++) for (let x = x0 + 20 + (row % 2) * 26; x < x0 + w; x += 52) { starAt(g, x, y, 6, Rm[4]); box(g, x - 1, y - 3, 1, 2, Rm[5]); }
  } else if (kind === 'diamond') {
    g.strokeStyle = Rm[2]; g.lineWidth = 1;
    for (let k = -h; k < w + h; k += 40) { g.beginPath(); g.moveTo(x0 + k, y0); g.lineTo(x0 + k + h, y0 + h); g.moveTo(x0 + k, y0 + h); g.lineTo(x0 + k + h, y0); g.stroke(); }
    for (let y = y0 + 20, row = 0; y < y0 + h; y += 20, row++) for (let x = x0 + (row % 2) * 20; x < x0 + w; x += 40) box(g, x - 1, y - 1, 3, 3, Rm[4]);
  }
  g.restore();
};
/** A five-point star, filled. */
export const starAt = (g: Ctx, x: number, y: number, r: number, col: string, inked = false) => {
  g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  g.fillStyle = col; g.fill(); if (inked) { g.strokeStyle = INK; g.lineWidth = 1.2; g.stroke(); }
};

/** The house's own fill above a ceiling (the cartoon's cutaway: the slab, then brick going up), x0..x1, from `y` up h. */
export const cutaway = (g: Ctx, x0: number, x1: number, y: number, h: number) => {
  const B = ['#24142E', '#33203F', '#432A50', '#553762'];
  box(g, x0, y - h, x1 - x0, h, B[1]);
  // (the brick, coursed, a lit edge on each)
  for (let row = 0, yy = y - 30; yy > y - h; row++, yy -= 14) for (let x = x0 - (row % 2) * 16; x < x1; x += 32) {
    const k = hash(x * 0.37 + row * 7.1);
    box(g, x + 1, yy - 12, 30, 12, k < 0.3 ? B[2] : k < 0.85 ? B[1] : B[3]);
    box(g, x + 1, yy - 12, 30, 1, B[3]); box(g, x + 1, yy - 12, 1, 12, B[3]); box(g, x + 1, yy - 1, 30, 1, B[0]);
  }
  // (the slab: plaster, joists end on, the cartoon's cut edge inked fat)
  box(g, x0, y - 30, x1 - x0, 30, '#D8C4A8'); box(g, x0, y - 30, x1 - x0, 3, '#F2E2C8');
  for (let x = x0 + 10; x < x1; x += 48) { box(g, x, y - 24, 14, 18, '#8A5A30'); box(g, x, y - 24, 14, 2, '#B07A44'); box(g, x + 4, y - 18, 6, 6, '#6A4020'); }
  box(g, x0, y - 4, x1 - x0, 4, INK); box(g, x0, y - 33, x1 - x0, 3, INK);
};

// ---------------------------------------------------------------------------------------------------------------
// Furnishings

/** A gilt frame (outer edge x, y, w, h), stepped: a fat bevel, beads along it, corner rosettes. */
export const giltFrame = (g: Ctx, x: number, y: number, w: number, h: number, t = 7) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  box(g, x, y, w, h, GILT[3]);
  box(g, x, y, w, 2, GILT[5]); box(g, x, y, 2, h, GILT[4]); box(g, x + w - 2, y, 2, h, GILT[1]); box(g, x, y + h - 2, w, 2, GILT[1]);
  box(g, x + t - 2, y + t - 2, w - 2 * t + 4, h - 2 * t + 4, GILT[1]); box(g, x + t - 1, y + t - 1, w - 2 * t + 2, h - 2 * t + 2, INK);
  for (let k = x + 4; k < x + w - 4; k += 5) { box(g, k, y + 3, 2, 2, GILT[5]); box(g, k, y + h - 5, 2, 2, GILT[2]); }
  for (let k = y + 4; k < y + h - 4; k += 5) { box(g, x + 3, k, 2, 2, GILT[4]); box(g, x + w - 5, k, 2, 2, GILT[2]); }
  for (const [cx, cy] of [[x + 3, y + 3], [x + w - 4, y + 3], [x + 3, y + h - 4], [x + w - 4, y + h - 4]]) { box(g, cx - 2, cy - 2, 5, 5, GILT[5]); box(g, cx - 1, cy - 1, 3, 3, GILT[2]); }
};
/** A brass plaque under a portrait: its name engraved. */
export const plaque = (g: Ctx, x: number, y: number, words: string) => {
  const w = Math.max(30, words.length * 6 + 10);
  slabI(g, x - w / 2, y, w, 11, GILT, 1);
  signText(g, words, x, y + 8, ENGRAVED);
};

export type Who = 'washington' | 'lincoln' | 'teddy' | 'nixon' | 'firstlady' | 'beagle' | 'jefferson' | 'taft' | 'jfk' | 'fdr';
const PRES_NAME: Record<Who, string> = { washington: 'G.WASHINGTON', lincoln: 'A.LINCOLN', teddy: 'T.ROOSEVELT', nixon: 'R.NIXON', firstlady: 'A FIRST LADY', beagle: 'HIM', jefferson: 'T.JEFFERSON', taft: 'W.H.TAFT', jfk: 'J.F.KENNEDY', fdr: 'F.D.ROOSEVELT' };
/** The presidents (and a first lady) as gross-ups: each the caricature's own tells, grossed up. */
const PRES_BUST: Record<Exclude<Who, 'beagle'>, BustSpec> = {
  washington: { seed: 1732, skin: SKIN.pale, hair: 'wig', hairRamp: HAIR.white, iris: IRIS.gray, mouth: 'grimace', coat: CLOTH.navy, extras: ['ruff', 'zits'], jowl: 1.25, nose: 1.2, look: [0.4, 0] },
  lincoln: { seed: 1809, skin: SKIN.olive, hair: 'crew', hairRamp: HAIR.black, beard: 'curtain', beardRamp: HAIR.black, iris: IRIS.gray, mouth: 'smirk', coat: CLOTH.black, extras: ['mole', 'bowtie'], tall: 1.14, wide: 0.86, nose: 1.15 },
  teddy: { seed: 1858, skin: SKIN.pink, hair: 'crew', hairRamp: HAIR.brown, beard: 'stache', beardRamp: HAIR.brown, iris: IRIS.blue, mouth: 'grin', coat: CLOTH.mustard, extras: ['glasses', 'sweaty'], jowl: 1.2, look: [0.3, -0.2] },
  nixon: { seed: 1913, skin: SKIN.tan, hair: 'slick', hairRamp: HAIR.brown, beard: 'stubble', iris: IRIS.brown, mouth: 'grin', coat: CLOTH.navy, extras: ['sweaty', 'tie'], jowl: 1.6, nose: 1.55, bulge: 1.3, look: [-0.5, 0.3] },
  firstlady: { seed: 1929, skin: SKIN.pale, hair: 'beehive', hairRamp: HAIR.brown, iris: IRIS.brown, mouth: 'pout', lips: LIPSTICK, coat: CLOTH.red, extras: ['lashes', 'pearls', 'earring'], wide: 0.92, look: [0.2, 0] },
  jefferson: { seed: 1743, skin: SKIN.pink, hair: 'wig', hairRamp: HAIR.ginger, iris: IRIS.green, mouth: 'smirk', coat: CLOTH.green, extras: ['ruff', 'wart'], nose: 1.25 },
  taft: { seed: 1857, skin: SKIN.red, hair: 'crew', hairRamp: HAIR.brown, beard: 'stache', beardRamp: HAIR.brown, iris: IRIS.blue, mouth: 'gape', coat: CLOTH.black, extras: ['sweaty', 'drool', 'bowtie'], wide: 1.2, jowl: 1.7, bulge: 1.2 },
  jfk: { seed: 1917, skin: SKIN.tan, hair: 'slick', hairRamp: HAIR.ginger, iris: IRIS.blue, mouth: 'grin', coat: CLOTH.gray, extras: ['tie', 'zits'], look: [0.4, -0.1] },
  fdr: { seed: 1882, skin: SKIN.pale, hair: 'slick', hairRamp: HAIR.gray, iris: IRIS.blue, mouth: 'grin', coat: CLOTH.gray, extras: ['glasses', 'cigar', 'tie'], jowl: 1.2, tall: 1.06 },
};
const SKIN_P: R6 = ['#6A3A2A', '#9A5E46', '#C98A6A', '#F2BC98', '#FAD8BE', '#FFF0E2'];
/** A president's cartoon portrait (the show's caricatures, played straight) in a gilt frame: its middle at (cx, cy),
 *  w × h; a plaque under it unless `bare`. */
export const portrait = (g: Ctx, cx: number, cy: number, who: Who, w = 68, h = 86, bare = false) => {
  const x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
  // (hung a hair crooked, the cartoon way: nothing in this house is quite straight; its wire up to a nail)
  g.save(); g.translate(cx, y); g.rotate((hash(cx * 0.37 + w) - 0.5) * 0.07); g.translate(-cx, -y);
  g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 6, y + 2); g.lineTo(cx, y - 14); g.lineTo(x + w - 6, y + 2); g.stroke();
  box(g, cx - 2, y - 16, 4, 4, GILT[4]);
  giltFrame(g, x, y, w, h);
  const ix = x + 8, iy = y + 8, iw = w - 16, ih = h - 16;
  // (the canvas: a dark varnished ground, banded, a dither of brushwork)
  const ground = { washington: '#3E4A2E', lincoln: '#4A2A22', teddy: '#2A3A4E', nixon: '#3A2E4A', firstlady: '#4A2E3E', beagle: '#4E3A22', jefferson: '#2E4A44', taft: '#4A3E2A', jfk: '#2A3A5A', fdr: '#3A4A3A' }[who];
  const G = R(ground);
  box(g, ix, iy, iw, ih, G[2]); box(g, ix, iy, iw, Math.round(ih * 0.35), G[3]); checker(g, ix, iy + Math.round(ih * 0.35), iw, 2, G[3], 0, 1);
  box(g, ix, iy + ih - 8, iw, 8, G[1]);
  if (who !== 'beagle') {
    // (the sitter: a gross-up in oils (grossBust.ts), every pore of the office)
    drawBust(g, grossBust(`wh-${who}`, PRES_BUST[who], 'oil'), ix + 1, iy + 1, iw - 2, ih - 1, ih > iw * 1.6 ? 200 : 150);
  } else {
    g.save(); g.beginPath(); g.rect(ix, iy, iw, ih); g.clip();
    const hx = cx, hy = cy - h * 0.1, s = Math.min(iw / 52, ih / 70);
    g.translate(hx, hy); g.scale(s, s);
    paintSitter(g, who);
    g.restore();
  }
  // (the varnish's sheen across a corner)
  box(g, ix + 2, iy + 2, Math.round(iw * 0.3), 1, 'rgba(255,255,255,0.35)'); box(g, ix + 2, iy + 2, 1, Math.round(ih * 0.2), 'rgba(255,255,255,0.35)');
  if (!bare) plaque(g, cx, y + h + 3, PRES_NAME[who]);
  g.restore();
};
/** The sitter (about (0, 0): the head's middle; shoulders down past +20). */
const paintSitter = (g: Ctx, who: Who) => {
  const suit = (col: string) => {
    const S = R(col);
    stepsAcross(g, () => { g.moveTo(-26, 40); g.quadraticCurveTo(-26, 16, 0, 14); g.quadraticCurveTo(26, 16, 26, 40); g.closePath(); }, -26, 14, 52, 26, S, 1.6);
  };
  const head = (rx = 11, ry = 13, skin = SKIN_P) => {
    inkP(g, () => g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2), skin[3], 1.6);
    g.save(); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.clip();
    box(g, rx * 0.35, -ry, rx, ry * 2, skin[2]); checker(g, rx * 0.25, -ry, 2, ry * 2, skin[2], 0, 1);
    box(g, -rx, -ry, rx * 0.5, ry * 0.8, skin[4]);
    g.restore();
  };
  const eyes = (y = -2, gap = 4.5, col = INK) => { box(g, -gap - 1, y, 2, 2, col); box(g, gap - 1, y, 2, 2, col); box(g, -gap - 1, y, 1, 1, '#FFFFFF'); box(g, gap - 1, y, 1, 1, '#FFFFFF'); };
  switch (who) {
    case 'washington': {
      // (the white powdered wig, the black ribbon, the jabot; the stern set mouth)
      suit('#2A2A3A');
      inkP(g, () => { g.moveTo(-6, 14); g.lineTo(6, 14); g.lineTo(0, 30); g.closePath(); }, '#FFFFFF', 1.2);
      head(11, 13);
      for (const s of [-1, 1]) { inkP(g, () => g.ellipse(s * 11, 2, 5, 7, 0, 0, Math.PI * 2), MARBLE[4], 1.2); box(g, s * 11 - 2, -2, 2, 2, MARBLE[5]); box(g, s * 11 - 1, 4, 3, 1, MARBLE[2]); }
      inkP(g, () => { g.moveTo(-12, -2); g.quadraticCurveTo(-13, -17, 0, -16); g.quadraticCurveTo(13, -17, 12, -2); g.quadraticCurveTo(6, -10, -6, -10); g.closePath(); }, MARBLE[4], 1.2);
      box(g, -6, -15, 6, 2, MARBLE[5]);
      eyes(-2); box(g, -6, -5, 4, 1, MARBLE[1]); box(g, 3, -5, 4, 1, MARBLE[1]);
      box(g, -1, 1, 3, 4, SKIN_P[2]); box(g, -4, 7, 8, 1, SKIN_P[0]);
      box(g, -12, 8, 3, 6, INK);
      break;
    }
    case 'lincoln': {
      // (the stovepipe hat, the chin beard, the bow tie, the long gaunt face)
      suit('#1A1A22');
      inkP(g, () => { g.moveTo(-4, 14); g.lineTo(4, 14); g.lineTo(0, 22); g.closePath(); }, '#F2F2F2', 1);
      box(g, -6, 14, 12, 3, INK);
      head(10, 14);
      inkP(g, () => { g.moveTo(-10, 2); g.quadraticCurveTo(-11, 18, 0, 20); g.quadraticCurveTo(11, 18, 10, 2); g.quadraticCurveTo(4, 9, 0, 9); g.quadraticCurveTo(-4, 9, -10, 2); g.closePath(); }, '#2A1A12', 1.2);
      box(g, -3, 11, 6, 1, '#4A3020');
      inkP(g, () => g.rect(-9, -38, 18, 26), '#111118', 1.4); box(g, -8, -37, 3, 24, '#2E2E3A'); box(g, -9, -18, 18, 3, '#3A3A48');
      inkP(g, () => g.rect(-15, -13, 30, 3), '#111118', 1.2);
      eyes(-3); box(g, -7, -6, 5, 1, INK); box(g, 3, -6, 5, 1, INK);
      box(g, 0, -1, 2, 5, SKIN_P[2]); box(g, 5, 4, 1, 3, SKIN_P[1]);
      break;
    }
    case 'teddy': {
      // (the pince-nez, the walrus mustache, the big grin of teeth: BULLY!)
      suit('#5A4A2A');
      head(12, 12);
      box(g, -9, -14, 18, 4, '#5A3A22'); box(g, -10, -12, 3, 6, '#5A3A22');
      for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.arc(s * 5, -2, 3.5, 0, Math.PI * 2); g.stroke(); box(g, s * 5 - 1, -3, 2, 2, INK); }
      box(g, -1, -2, 2, 1, INK);
      inkP(g, () => { g.moveTo(-10, 4); g.quadraticCurveTo(0, 0, 10, 4); g.quadraticCurveTo(6, 8, 0, 6); g.quadraticCurveTo(-6, 8, -10, 4); g.closePath(); }, '#7A4A2A', 1);
      inkP(g, () => g.rect(-6, 6, 12, 5), '#FFFFFF', 1); for (let k = -4; k <= 4; k += 2) box(g, k, 6, 1, 5, '#C8C4B8');
      break;
    }
    case 'nixon': {
      // (the ski-jump nose, the jowls, the five o'clock shadow, the hair swept back; two fingers up in Vs)
      suit('#2A3448');
      head(12, 13);
      inkP(g, () => { g.moveTo(-12, -4); g.quadraticCurveTo(-12, -17, 2, -16); g.quadraticCurveTo(13, -15, 12, -5); g.quadraticCurveTo(4, -12, -12, -4); g.closePath(); }, '#3A2A22', 1);
      checker(g, -9, 3, 18, 9, '#6A5A6A', 0, 1);
      inkP(g, () => { g.moveTo(0, -3); g.quadraticCurveTo(7, 3, 4, 5); g.lineTo(0, 4); g.closePath(); }, SKIN_P[3], 1);
      eyes(-4, 5); box(g, -8, -7, 5, 2, INK); box(g, 4, -7, 5, 2, INK);
      box(g, -4, 9, 8, 1, INK); box(g, -11, 5, 2, 6, SKIN_P[1]); box(g, 10, 5, 2, 6, SKIN_P[1]);
      for (const s of [-1, 1]) { inkP(g, () => g.rect(s * 22 - 3, -2, 6, 14), SKIN_P[3], 1); for (const d of [-2, 2]) inkP(g, () => g.rect(s * 22 + d - 1, -14, 3, 13), SKIN_P[3], 1); }
      break;
    }
    case 'firstlady': {
      // (a bouffant, pearls, a pillbox hat)
      suit('#B4486A');
      inkP(g, () => g.ellipse(0, -6, 16, 13, 0, 0, Math.PI * 2), '#5A3A26', 1.4); box(g, -10, -14, 8, 3, '#7A5236');
      head(10, 12);
      inkP(g, () => g.roundRect(-9, -20, 18, 6, 2), '#E86A9A', 1.2);
      eyes(-2, 4); box(g, -6, -5, 4, 1, INK); box(g, 3, -5, 4, 1, INK);
      inkP(g, () => g.ellipse(0, 6, 4, 2, 0, 0, Math.PI * 2), '#D8344E', 1);
      for (let k = -8; k <= 8; k += 3) { box(g, k - 1, 15 + Math.abs(k) * 0.25, 3, 3, '#FFFFFF'); box(g, k - 1, 16 + Math.abs(k) * 0.25, 1, 1, MARBLE[2]); }
      break;
    }
    case 'beagle': {
      // (the presidential beagle, in a bow tie, very serious)
      inkP(g, () => g.ellipse(0, 26, 22, 14, 0, 0, Math.PI * 2), '#E8C9A0', 1.4);
      inkP(g, () => g.ellipse(0, 2, 13, 12, 0, 0, Math.PI * 2), '#E8C9A0', 1.4);
      box(g, -5, -10, 10, 8, '#FFFFFF'); box(g, 4, -6, 6, 10, '#B47A3E');
      for (const s of [-1, 1]) inkP(g, () => g.ellipse(s * 13, 4, 5, 11, s * -0.25, 0, Math.PI * 2), '#7C4A1E', 1.2);
      eyes(-1, 4); inkP(g, () => g.ellipse(0, 7, 4, 3, 0, 0, Math.PI * 2), INK, 1); box(g, -1, 6, 2, 1, '#6A6A7A');
      inkP(g, () => { g.moveTo(-7, 16); g.lineTo(0, 19); g.lineTo(7, 16); g.lineTo(7, 22); g.lineTo(0, 19); g.lineTo(-7, 22); g.closePath(); }, '#DC2626', 1);
      break;
    }
    case 'jefferson': {
      // (red hair queued back, a yellow waistcoat, a quill)
      suit('#4A2E22'); box(g, -6, 16, 12, 20, '#E8C440');
      head(10, 12);
      inkP(g, () => { g.moveTo(-11, 2); g.quadraticCurveTo(-13, -15, 0, -14); g.quadraticCurveTo(12, -15, 11, 0); g.quadraticCurveTo(6, -8, -6, -8); g.closePath(); }, '#C8582A', 1.2);
      eyes(-1, 4); box(g, -3, 6, 6, 1, INK);
      g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(16, 34); g.quadraticCurveTo(22, 18, 30, 10); g.stroke(); box(g, 24, 12, 4, 6, '#FFFFFF');
      break;
    }
    case 'taft': {
      // (vast, the handlebar mustache waxed to points)
      suit('#3A3A44');
      head(15, 14);
      box(g, -10, -14, 20, 3, '#5A4A3A');
      eyes(-3, 6);
      inkP(g, () => { g.moveTo(-18, 2); g.quadraticCurveTo(-8, 8, 0, 3); g.quadraticCurveTo(8, 8, 18, 2); g.quadraticCurveTo(10, 3, 0, 1); g.quadraticCurveTo(-10, 3, -18, 2); g.closePath(); }, '#5A4A3A', 1);
      box(g, -6, 10, 12, 4, SKIN_P[2]);
      break;
    }
    case 'jfk': {
      suit('#26304A');
      head(11, 13);
      inkP(g, () => { g.moveTo(-12, -2); g.quadraticCurveTo(-14, -18, 2, -18); g.quadraticCurveTo(16, -16, 10, -6); g.quadraticCurveTo(0, -14, -12, -2); g.closePath(); }, '#8A5A2E', 1.2);
      eyes(-2, 4.5); inkP(g, () => g.rect(-6, 5, 12, 3), '#FFFFFF', 1);
      break;
    }
    case 'fdr': {
      suit('#4A4A52'); box(g, -24, 18, 48, 18, '#3A3A48');
      head(11, 13);
      box(g, -9, -14, 18, 3, '#9A9AA4');
      for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(s * 4.5, -2, 3, 0, Math.PI * 2); g.stroke(); }
      eyes(-3, 4.5); box(g, -4, 6, 8, 1, INK);
      g.strokeStyle = '#1A1A1A'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(3, 6); g.lineTo(20, -4); g.stroke(); box(g, 19, -6, 3, 3, '#F8F4EC');
      break;
    }
  }
};

/** THE SEAL (the show's cartoon Presidential Seal): a navy disc, a gilt ring of stars, the eagle (a cartoon one, its
 *  wings up, the shield on its chest), a banner. About its middle, radius r. `squash` across the y (a floor's). */
export const seal = (g: Ctx, cx: number, cy: number, r: number) => {
  inkP(g, () => g.arc(cx, cy, r, 0, Math.PI * 2), GILT[2], 2);
  inkP(g, () => g.arc(cx, cy, r - 3, 0, Math.PI * 2), GILT[4], 0);
  box(g, cx - r * 0.6, cy - r + 2, r * 0.5, 2, GILT[5]);
  inkP(g, () => g.arc(cx, cy, r * 0.8, 0, Math.PI * 2), NAVY[2], 1.4);
  g.save(); g.beginPath(); g.arc(cx, cy, r * 0.8, 0, Math.PI * 2); g.clip(); box(g, cx - r, cy - r, r * 0.6, r * 2, NAVY[3]); checker(g, cx - r * 0.4, cy - r, 2, r * 2, NAVY[3], 0, 1); box(g, cx + r * 0.4, cy - r, r, r * 2, NAVY[1]); g.restore();
  for (let i = 0; i < 13; i++) { const a = -Math.PI / 2 + (i / 13) * Math.PI * 2; starAt(g, cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9, Math.max(1.5, r * 0.06), GILT[5]); }
  const k = r / 40;
  // (the eagle: wings up and out, the white head, the shield, the arrows and olive branch)
  for (const s of [-1, 1]) inkP(g, () => { g.moveTo(cx + s * 4 * k, cy - 2 * k); g.quadraticCurveTo(cx + s * 26 * k, cy - 22 * k, cx + s * 28 * k, cy - 6 * k); g.lineTo(cx + s * 22 * k, cy - 4 * k); g.lineTo(cx + s * 24 * k, cy + 2 * k); g.lineTo(cx + s * 16 * k, cy + 2 * k); g.quadraticCurveTo(cx + s * 10 * k, cy + 8 * k, cx + s * 4 * k, cy + 6 * k); g.closePath(); }, '#8A5A2A', 1);
  inkP(g, () => g.ellipse(cx, cy - 12 * k, 5 * k, 5 * k, 0, 0, Math.PI * 2), '#FFFFFF', 1);
  box(g, cx + 2 * k, cy - 13 * k, 4 * k, 2 * k, '#F2B830');
  inkP(g, () => { g.moveTo(cx - 7 * k, cy - 5 * k); g.lineTo(cx + 7 * k, cy - 5 * k); g.lineTo(cx + 7 * k, cy + 4 * k); g.quadraticCurveTo(cx, cy + 14 * k, cx - 7 * k, cy + 4 * k); g.closePath(); }, '#FFFFFF', 1);
  box(g, cx - 7 * k, cy - 5 * k, 14 * k, 4 * k, NAVY[2]);
  for (let s = -5; s <= 5; s += 3.4) box(g, cx + s * k, cy - 1 * k, 1.6 * k, 9 * k, '#C8202E');
  box(g, cx - 14 * k, cy + 10 * k, 28 * k, 3 * k, '#FFFFFF');
};

/** A brass wall sconce: a backplate, two curled arms, candle bulbs in drip cups (the flames are live: candleFlames). */
export const sconce = (g: Ctx, x: number, y: number) => {
  inkP(g, () => g.ellipse(x, y, 6, 12, 0, 0, Math.PI * 2), GILT[3], 1.4); box(g, x - 3, y - 8, 2, 8, GILT[5]); box(g, x + 2, y, 2, 8, GILT[1]);
  for (const s of [-1, 1]) {
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y + 4); g.quadraticCurveTo(x + s * 16, y + 10, x + s * 16, y - 4); g.stroke();
    g.strokeStyle = GILT[3]; g.lineWidth = 2; g.stroke();
    inkP(g, () => g.ellipse(x + s * 16, y - 4, 5, 2.5, 0, 0, Math.PI * 2), GILT[4], 1);
    inkP(g, () => g.rect(x + s * 16 - 2, y - 15, 4, 11), '#FFFDF2', 1); box(g, x + s * 16 - 2, y - 15, 1, 11, '#FFFFFF');
  }
};
/** Where a sconce's candles' flames go (for the live flicker). */
export const sconceFlames = (x: number, y: number): [number, number][] => [[x - 16, y - 18], [x + 16, y - 18]];
/** Live: candle flames flickering at their points (world). */
export const candleFlames = (c: Ctx, pts: [number, number][], f: number) => {
  for (const [x, y] of pts) {
    const k = Math.sin(f * 0.31 + x * 0.7) * 0.8;
    c.fillStyle = INK; c.beginPath(); c.ellipse(x, y - 1, 3.6, 5.6 + k, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F59E0B'; c.beginPath(); c.ellipse(x, y - 1, 2.6, 4.6 + k, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FDE68A'; c.beginPath(); c.ellipse(x, y, 1.5, 2.6, 0, 0, Math.PI * 2); c.fill();
  }
};

/** Swagged drapes framing a window or a stage (x the middle, top y, w the opening, h down to the floor): a swag across
 *  the top on a gilt pelmet, jabots falling either side in stepped folds, tassels, tiebacks. */
export const drapes = (g: Ctx, x: number, top: number, w: number, h: number, col: string) => {
  const D = R(col);
  for (const s of [-1, 1]) {
    const ox = x + s * (w / 2 + 8), path = () => { g.moveTo(ox - s * 2, top); g.quadraticCurveTo(ox - s * 20, top + h * 0.45, ox - s * 6, top + h * 0.6); g.quadraticCurveTo(ox - s * 2, top + h * 0.8, ox - s * 10, top + h); g.lineTo(ox + s * 22, top + h); g.lineTo(ox + s * 22, top); g.closePath(); };
    stepsAcross(g, path, Math.min(ox - s * 20, ox + s * 22), top, 42, h, s < 0 ? D : [D[0], D[0], D[1], D[2], D[3], D[4]], 2);
    // (the folds: deep creases down it)
    for (const k of [0.3, 0.65]) { const fx = Math.round(ox + s * 22 * k - s * 2); box(g, fx, top + 20, 1, h * 0.5, D[1]); box(g, fx + s, top + 20, 1, h * 0.5, D[4]); }
    // (the tieback: a gilt rope and a tassel)
    const ty = top + h * 0.6;
    inkP(g, () => g.ellipse(ox + s * 6, ty, 12, 3, 0, 0, Math.PI * 2), GILT[3], 1.2);
    inkP(g, () => { g.moveTo(ox + s * 14, ty); g.lineTo(ox + s * 10, ty + 16); g.lineTo(ox + s * 18, ty + 16); g.closePath(); }, GILT[4], 1);
    box(g, ox + s * 14 - 1, ty + 16, 2, 4, GILT[2]);
  }
  // (the swag: three scallops across, stepped from above, fringed)
  const sw = w + 60, sx = x - sw / 2;
  for (let k = 0; k < 3; k++) {
    const a = sx + (k * sw) / 3, b = a + sw / 3;
    const path = () => { g.moveTo(a, top + 4); g.quadraticCurveTo((a + b) / 2, top + 46, b, top + 4); g.lineTo(b, top); g.lineTo(a, top); g.closePath(); };
    stepsDown(g, path, a, top, b - a, 32, D, 2);
    for (let fx = a + 6; fx < b - 4; fx += 5) { const fy = top + 4 + Math.sin(((fx - a) / (b - a)) * Math.PI) * 30; box(g, fx, fy, 2, 5, GILT[3]); box(g, fx, fy + 4, 2, 1, GILT[1]); }
  }
  // (the pelmet: a gilt rail along the top, finials)
  slabI(g, sx - 6, top - 10, sw + 12, 10, GILT);
  for (const fx of [sx - 10, sx + sw + 6]) inkP(g, () => g.arc(fx, top - 5, 6, 0, Math.PI * 2), GILT[4], 1.4);
};

/** A window (its middle x, its sill y, w × h, an arched top), the grounds outside it by the hour: the sky banded, the
 *  lawn, trees, the Washington Monument far off; mullions, a lit pane. */
export const windowAt = (g: Ctx, x: number, sill: number, w: number, h: number, view = 0) => {
  const tod = timeOfDay(), x0 = Math.round(x - w / 2), y0 = Math.round(sill - h);
  // (the casing: a white stepped surround, a keystone)
  inkP(g, () => g.roundRect(x0 - 8, y0 - 8, w + 16, h + 14, [w / 2 + 8, w / 2 + 8, 2, 2]), MARBLE[4], 2);
  box(g, x0 - 6, y0 + w / 2, 2, h - w / 2, MARBLE[5]); box(g, x0 + w + 4, y0 + w / 2, 3, h - w / 2, MARBLE[2]);
  slabI(g, x - 7, y0 - 12, 14, 14, MARBLE);
  // (the outside)
  const pane = () => g.roundRect(x0, y0, w, h, [w / 2, w / 2, 0, 0]);
  g.save(); g.beginPath(); pane(); g.clip();
  for (let i = 0; i < 6; i++) box(g, x0, y0 + (i * h * 0.75) / 6, w, h * 0.75 / 6 + 1, skyAt(0.15 + i * 0.13, tod));
  const lawnY = y0 + h * 0.72;
  // (far off: the obelisk, a dome, a treeline)
  const far = mix(skyAt(0.85, tod), '#5A6A8A', 0.35);
  if (view % 3 === 0) { box(g, x + w * 0.18 - 3, lawnY - h * 0.42, 6, h * 0.42, far); g.fillStyle = far; g.beginPath(); g.moveTo(x + w * 0.18 - 3, lawnY - h * 0.42); g.lineTo(x + w * 0.18, lawnY - h * 0.47); g.lineTo(x + w * 0.18 + 3, lawnY - h * 0.42); g.fill(); if (tod.lamps > 0.3) box(g, x + w * 0.18 - 1, lawnY - h * 0.44, 2, 2, '#FF5A5A'); }
  else if (view % 3 === 1) { g.fillStyle = far; g.beginPath(); g.ellipse(x - w * 0.15, lawnY - 6, 14, 10, 0, Math.PI, 0); g.fill(); box(g, x - w * 0.15 - 16, lawnY - 6, 32, 6, far); }
  for (let k = 0; k < 7; k++) { const tx = x0 + (k / 6) * w, tr = 6 + hash(k + view * 3) * 6; g.fillStyle = mix('#3A7A4A', skyAt(0.9, tod), 0.25); g.beginPath(); g.arc(tx, lawnY - tr * 0.6, tr, 0, Math.PI * 2); g.fill(); }
  box(g, x0, lawnY, w, h, mix('#5AB45A', tod.haze, 0.15)); box(g, x0, lawnY, w, 2, mix('#8AD47A', tod.haze, 0.1));
  // (a glint across the glass by day; warm reflections of the room after dark)
  if (tod.lamps > 0.3) { checker(g, x0, y0, w, h, '#FFE8A0', 0, 2); }
  else { g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(x0 + 6, y0 + h); g.lineTo(x0 + 20, y0 + h); g.lineTo(x0 + w * 0.7, y0 + 10); g.lineTo(x0 + w * 0.6, y0 + 10); g.closePath(); g.fill(); }
  g.restore();
  // (the mullions and muntins: white, inked)
  g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath(); g.moveTo(x, y0); g.lineTo(x, sill); for (let k = 1; k < 4; k++) { const yy = y0 + w / 2 + ((h - w / 2) * k) / 4; g.moveTo(x0, yy); g.lineTo(x0 + w, yy); } g.stroke();
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 1.4; g.stroke();
  g.beginPath(); pane(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke();
  // (the sill)
  slabI(g, x0 - 12, sill, w + 24, 8, MARBLE);
};

/** A paneled door (its middle x, foot y, w × h), a fanlight over it, brass knobs; `double` two leaves. */
export const door = (g: Ctx, x: number, foot: number, w: number, h: number, col: string, double = true, label?: string) => {
  const D = R(col), x0 = Math.round(x - w / 2), y0 = Math.round(foot - h);
  // (the surround: a pediment over it)
  slabI(g, x0 - 12, y0 - 12, w + 24, h + 12, MARBLE);
  inkP(g, () => { g.moveTo(x0 - 18, y0 - 12); g.lineTo(x, y0 - 40); g.lineTo(x0 + w + 18, y0 - 12); g.closePath(); }, MARBLE[3], 2);
  box(g, x0 - 10, y0 - 15, w / 2, 2, MARBLE[5]);
  // (the fanlight)
  inkP(g, () => { g.moveTo(x0, y0 + 26); g.arc(x, y0 + 26, w / 2, Math.PI, 0); g.closePath(); }, '#2A3A5A', 1.4);
  g.strokeStyle = GILT[3]; g.lineWidth = 1.2; for (let k = 1; k < 6; k++) { const a = Math.PI + (k / 6) * Math.PI; g.beginPath(); g.moveTo(x, y0 + 26); g.lineTo(x + Math.cos(a) * w / 2, y0 + 26 + Math.sin(a) * w / 2); g.stroke(); }
  // (the leaves)
  const n = double ? 2 : 1, lw = w / n;
  for (let i = 0; i < n; i++) {
    const lx = x0 + i * lw, ly = y0 + 26;
    slabI(g, lx, ly, lw, foot - ly, D);
    for (const [py, ph] of [[ly + 10, (foot - ly) * 0.42], [ly + 18 + (foot - ly) * 0.42, (foot - ly) * 0.42]]) { box(g, lx + 7, py, lw - 14, ph, D[2]); box(g, lx + 9, py + 2, lw - 18, ph - 4, D[3]); box(g, lx + 9, py + 2, lw - 18, 1, D[1]); box(g, lx + 9, py + ph - 3, lw - 18, 1, D[4]); }
    inkP(g, () => g.arc(i ? lx + 7 : lx + lw - 7, foot - h * 0.42, 3, 0, Math.PI * 2), GILT[4], 1);
  }
  if (label) plaque(g, x, y0 - 4 - 40 - 8, label);
};

/** A marble fireplace (its middle x, foot y): the mantel shelf, columns, the firebox dark (the fire's live: fireAt). */
export const fireplace = (g: Ctx, x: number, foot: number, w = 130, h = 110) => {
  const x0 = x - w / 2;
  slabI(g, x0, foot - h, w, h, MARBLE);
  box(g, x0 + 22, foot - h + 24, w - 44, h - 24, INK); box(g, x0 + 24, foot - h + 26, w - 48, h - 26, '#1A0E14');
  for (let k = 0; k < 6; k++) box(g, x0 + 26 + k * ((w - 52) / 6), foot - h + 28, 2, h - 30, '#2A1620');
  slabI(g, x0 - 10, foot - h - 12, w + 20, 12, MARBLE);
  slabI(g, x0 - 4, foot - 8, w + 8, 8, MARBLE);
  for (const s of [x0 + 10, x0 + w - 10]) { box(g, s - 5, foot - h + 4, 10, h - 12, MARBLE[4]); box(g, s + 3, foot - h + 4, 2, h - 12, MARBLE[2]); }
  // (andirons, logs)
  inkP(g, () => g.roundRect(x - 30, foot - 18, 60, 9, 4), OAK[2], 1.2); inkP(g, () => g.roundRect(x - 24, foot - 26, 44, 9, 4), OAK[3], 1.2);
  for (const s of [-1, 1]) inkP(g, () => g.arc(x + s * 34, foot - 14, 4, 0, Math.PI * 2), GILT[4], 1);
};
/** Live: a fire in a firebox (its middle x, foot y). */
export const fireAt = (c: Ctx, x: number, foot: number, f: number) => {
  for (let k = -2; k <= 2; k++) {
    const h = 26 + Math.sin(f * 0.3 + k * 1.7) * 6 - Math.abs(k) * 4, fx = x + k * 9;
    c.fillStyle = '#C2410C'; c.beginPath(); c.moveTo(fx - 7, foot - 22); c.quadraticCurveTo(fx - 6, foot - 22 - h * 0.6, fx + Math.sin(f * 0.2 + k) * 3, foot - 22 - h); c.quadraticCurveTo(fx + 6, foot - 22 - h * 0.6, fx + 7, foot - 22); c.closePath(); c.fill();
    c.fillStyle = '#F59E0B'; c.beginPath(); c.moveTo(fx - 4, foot - 22); c.quadraticCurveTo(fx - 3, foot - 22 - h * 0.4, fx, foot - 22 - h * 0.7); c.quadraticCurveTo(fx + 3, foot - 22 - h * 0.4, fx + 4, foot - 22); c.closePath(); c.fill();
    c.fillStyle = '#FDE68A'; c.fillRect(fx - 1, foot - 26 - h * 0.2, 2, 4);
  }
};

/** A marble bust on a fluted plinth (a founding father, white-wigged, stern) at x, foot. */
export const bust = (g: Ctx, x: number, foot: number) => {
  slabI(g, x - 18, foot - 90, 36, 90, MARBLE);
  for (const k of [-8, 0, 8]) { box(g, x + k, foot - 82, 1, 72, MARBLE[2]); box(g, x + k + 1, foot - 82, 1, 72, MARBLE[5]); }
  slabI(g, x - 22, foot - 96, 44, 8, MARBLE);
  inkP(g, () => { g.moveTo(x - 20, foot - 96); g.quadraticCurveTo(x - 20, foot - 116, x, foot - 118); g.quadraticCurveTo(x + 20, foot - 116, x + 20, foot - 96); g.closePath(); }, MARBLE[3], 1.6);
  inkP(g, () => g.ellipse(x, foot - 132, 11, 14, 0, 0, Math.PI * 2), MARBLE[4], 1.6);
  for (const s of [-1, 1]) inkP(g, () => g.ellipse(x + s * 11, foot - 128, 4, 6, 0, 0, Math.PI * 2), MARBLE[3], 1.2);
  box(g, x + 2, foot - 140, 8, 20, MARBLE[2]); box(g, x - 7, foot - 136, 3, 1, MARBLE[1]); box(g, x + 3, foot - 136, 3, 1, MARBLE[1]); box(g, x - 3, foot - 124, 7, 1, MARBLE[1]);
};
/** A flag on a staff in a stand (x, foot): the stars and stripes, or the President's (navy, the seal), a gilt eagle
 *  finial, a fringe. Hangs in folds. */
export const flagStand = (g: Ctx, x: number, foot: number, pres = false) => {
  inkP(g, () => g.roundRect(x - 12, foot - 10, 24, 10, 3), GILT[3], 1.4);
  box(g, x - 2, foot - 230, 4, 222, INK); box(g, x - 1, foot - 230, 2, 222, OAK[4]);
  inkP(g, () => { g.moveTo(x - 7, foot - 232); g.lineTo(x, foot - 246); g.lineTo(x + 7, foot - 232); g.closePath(); }, GILT[4], 1.2);
  const fx = x + 2, fy = foot - 222, fw = 40, fh = 110;
  const fold = (t: number) => Math.sin(t * Math.PI * 3) * 4;
  g.save(); g.beginPath(); g.moveTo(fx, fy); for (let t = 0; t <= 1; t += 0.1) g.lineTo(fx + fw + fold(t), fy + t * fh); g.lineTo(fx, fy + fh); g.closePath(); g.clip();
  if (pres) { box(g, fx, fy, fw + 6, fh, NAVY[2]); seal(g, fx + fw / 2, fy + fh * 0.4, 13); }
  else {
    for (let k = 0; k < 13; k++) box(g, fx, fy + (k * fh) / 13, fw + 6, fh / 13 + 1, k % 2 ? '#FFFFFF' : '#C8202E');
    box(g, fx, fy, fw * 0.6, fh * 0.46, NAVY[2]);
    for (let k = 0; k < 12; k++) box(g, fx + 3 + (k % 4) * 6, fy + 4 + Math.floor(k / 4) * 14, 2, 2, '#FFFFFF');
  }
  for (let k = 0; k < 6; k++) { box(g, fx + (k * fw) / 6 + 2, fy, 3, fh, 'rgba(26,16,40,0.18)'); box(g, fx + (k * fw) / 6, fy, 2, fh, 'rgba(255,255,255,0.2)'); }
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(fx, fy); for (let t = 0; t <= 1; t += 0.1) g.lineTo(fx + fw + fold(t), fy + t * fh); g.lineTo(fx, fy + fh); g.stroke();
  for (let t = 0; t <= 1; t += 0.06) box(g, fx + fw + fold(t), fy + t * fh, 3, 2, GILT[4]);
};
/** A grandfather clock (x, foot): walnut, a gilt face, a brass pendulum behind glass (it swings: clockPendulum). */
export const grandfatherClock = (g: Ctx, x: number, foot: number) => {
  const W: R6 = OAK;
  slabI(g, x - 22, foot - 30, 44, 30, W);
  slabI(g, x - 16, foot - 150, 32, 120, W);
  box(g, x - 9, foot - 140, 18, 96, INK); box(g, x - 8, foot - 139, 16, 94, '#2A1A10');
  slabI(g, x - 24, foot - 210, 48, 60, W);
  inkP(g, () => { g.moveTo(x - 26, foot - 210); g.quadraticCurveTo(x, foot - 240, x + 26, foot - 210); g.closePath(); }, W[3], 1.6);
  inkP(g, () => g.arc(x, foot - 182, 18, 0, Math.PI * 2), '#FFF8E0', 1.6);
  g.strokeStyle = GILT[2]; g.lineWidth = 2; g.beginPath(); g.arc(x, foot - 182, 18, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(g, x + Math.cos(a) * 14 - 1, foot - 182 + Math.sin(a) * 14 - 1, 2, 2, INK); }
  g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, foot - 182); g.lineTo(x + 6, foot - 190); g.moveTo(x, foot - 182); g.lineTo(x - 2, foot - 172); g.stroke();
};
/** Live: a pendulum swinging (the clock's at x, foot). */
export const clockPendulum = (c: Ctx, x: number, foot: number, f: number) => {
  const a = Math.sin(f * 0.07) * 0.25, px = x + Math.sin(a) * 70, py = foot - 140 + Math.cos(a) * 70;
  c.strokeStyle = '#A06C1C'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, foot - 138); c.lineTo(px, py); c.stroke();
  c.fillStyle = INK; c.beginPath(); c.arc(px, py, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F2C84A'; c.beginPath(); c.arc(px, py, 4.6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFF0A8'; c.fillRect(px - 2, py - 3, 2, 2);
};
/** A vase of flowers on a console table (x, foot). */
export const consoleVase = (g: Ctx, x: number, foot: number, flowers = '#F472B6') => {
  slabI(g, x - 40, foot - 70, 80, 8, OAK);
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x + s * 32, foot - 62); g.quadraticCurveTo(x + s * 40, foot - 30, x + s * 30, foot); g.stroke(); g.strokeStyle = GILT[3]; g.lineWidth = 2; g.stroke(); }
  inkP(g, () => { g.moveTo(x - 9, foot - 70); g.quadraticCurveTo(x - 16, foot - 86, x - 7, foot - 96); g.lineTo(x + 7, foot - 96); g.quadraticCurveTo(x + 16, foot - 86, x + 9, foot - 70); g.closePath(); }, '#F8FAFC', 1.4);
  box(g, x - 6, foot - 90, 3, 14, '#FFFFFF'); box(g, x - 8, foot - 84, 16, 2, NAVY[3]);
  for (let k = 0; k < 9; k++) { const a = -Math.PI * 0.95 + (k / 8) * Math.PI * 0.9, fx = x + Math.cos(a) * 18, fy = foot - 100 + Math.sin(a) * 18; box(g, fx - 1, fy, 2, foot - 96 - fy, '#2E7A3A'); const F = R(k % 3 === 1 ? '#FDE047' : flowers); inkP(g, () => g.arc(fx, fy, 4, 0, Math.PI * 2), F[3], 1); box(g, fx - 2, fy - 2, 2, 2, F[5]); }
};
/** A bookcase (x0..x0+w, foot, h): stepped shelves of books, spines in a row. */
export const bookcase = (g: Ctx, x0: number, foot: number, w: number, h: number, seed = 0) => {
  slabI(g, x0, foot - h, w, h, OAK);
  const n = Math.max(2, Math.floor((h - 20) / 44));
  for (let s = 0; s < n; s++) {
    const sy = foot - h + 14 + s * 44;
    box(g, x0 + 6, sy, w - 12, 36, OAK[0]);
    let bx = x0 + 8;
    for (let i = 0; bx < x0 + w - 12; i++) {
      const bw = 4 + Math.floor(hash(seed + s * 31 + i) * 5), bh = 22 + Math.floor(hash(seed + s * 17 + i * 3) * 12), B = R(['#8A1E2E', '#1E4A8A', '#2E6A3A', '#7A5A1E', '#5A2E6A', '#E2B33C'][Math.floor(hash(seed + i * 7 + s) * 6)]);
      box(g, bx, sy + 36 - bh, bw, bh, B[3]); box(g, bx, sy + 36 - bh, 1, bh, B[4]); box(g, bx + bw - 1, sy + 36 - bh, 1, bh, B[1]); box(g, bx, sy + 36 - bh + 4, bw, 1, GILT[4]);
      bx += bw + 1;
    }
    box(g, x0 + 4, sy + 36, w - 8, 4, OAK[4]); box(g, x0 + 4, sy + 39, w - 8, 1, OAK[1]);
  }
};
/** A potted palm (x, foot). */
export const pottedPalm = (g: Ctx, x: number, foot: number, h = 120) => {
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI / 2 + (k - 3) * 0.42, len = h * (0.55 + hash(k + x) * 0.3), ex = x + Math.cos(a) * len, ey = foot - 40 + Math.sin(a) * len * 0.8;
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, foot - 36); g.quadraticCurveTo((x + ex) / 2, ey - 20, ex, ey); g.stroke();
    g.strokeStyle = '#2E8A4A'; g.lineWidth = 1.5; g.stroke();
    for (let t = 0.3; t < 1; t += 0.12) { const lx = x + (ex - x) * t, ly = foot - 36 + (ey - foot + 36) * t - Math.sin(t * Math.PI) * 14; box(g, lx - 6, ly, 6, 2, '#3CAA5A'); box(g, lx + 1, ly + 1, 6, 2, '#22803A'); }
  }
  inkP(g, () => { g.moveTo(x - 18, foot - 40); g.lineTo(x + 18, foot - 40); g.lineTo(x + 13, foot); g.lineTo(x - 13, foot); g.closePath(); }, '#C8582A', 1.6);
  box(g, x - 16, foot - 40, 32, 5, '#E27A40'); box(g, x - 14, foot - 30, 4, 26, '#E8904E'); box(g, x + 8, foot - 34, 4, 30, '#A0401E');
};
/** A camelback sofa against a wall (x0, foot, w), stepped velvet, gilt legs, cushions. Scenery: drawn dimmed by the
 *  caller's colors. */
export const sofa = (g: Ctx, x0: number, foot: number, w: number, col: string) => {
  const S = R(col);
  stepsDown(g, () => { g.moveTo(x0, foot - 40); g.quadraticCurveTo(x0 + w * 0.25, foot - 70, x0 + w / 2, foot - 64); g.quadraticCurveTo(x0 + w * 0.75, foot - 70, x0 + w, foot - 40); g.lineTo(x0 + w, foot - 20); g.lineTo(x0, foot - 20); g.closePath(); }, x0, foot - 70, w, 50, S);
  stepsDown(g, () => g.roundRect(x0 + 6, foot - 34, w - 12, 18, 6), x0, foot - 34, w, 18, S);
  for (const s of [x0 - 4, x0 + w - 14]) stepsAcross(g, () => g.roundRect(s, foot - 46, 18, 32, 8), s, foot - 46, 18, 32, S);
  for (const s of [x0 + 6, x0 + w - 12]) { box(g, s - 1, foot - 16, 6, 16, INK); box(g, s, foot - 16, 4, 15, GILT[3]); }
};
/** A brass stanchion and a red velvet rope (the visitors' line), x0 to x1 at foot. */
export const ropeLine = (g: Ctx, x0: number, x1: number, foot: number) => {
  const n = Math.max(1, Math.round((x1 - x0) / 90));
  for (let i = 0; i < n; i++) {
    const a = x0 + ((x1 - x0) * i) / n, b = x0 + ((x1 - x0) * (i + 1)) / n;
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(a, foot - 56); g.quadraticCurveTo((a + b) / 2, foot - 30, b, foot - 56); g.stroke();
    g.strokeStyle = VELVET[3]; g.lineWidth = 4; g.stroke(); g.strokeStyle = VELVET[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(a + 4, foot - 56); g.quadraticCurveTo((a + b) / 2, foot - 32, b - 4, foot - 57); g.stroke();
  }
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    inkP(g, () => g.ellipse(x, foot - 3, 10, 4, 0, 0, Math.PI * 2), GILT[3], 1.4);
    box(g, x - 3, foot - 58, 6, 56, INK); box(g, x - 2, foot - 58, 4, 55, GILT[3]); box(g, x - 2, foot - 58, 1, 55, GILT[5]);
    inkP(g, () => g.arc(x, foot - 62, 5, 0, Math.PI * 2), GILT[4], 1.2);
  }
};
/** A hanging chandelier against the back (scenery, dimmed a touch): a chain, gilt arms, candles, crystal drops in steps. */
export const chandelierArt = (g: Ctx, x: number, top: number, drop: number, w = 70) => {
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, top); g.lineTo(x, top + drop); g.stroke();
  for (let y = top + 4; y < top + drop; y += 6) box(g, x - 1, y, 3, 3, GILT[3]);
  const cy = top + drop;
  inkP(g, () => g.ellipse(x, cy + 6, w / 2, 8, 0, 0, Math.PI * 2), GILT[3], 2);
  box(g, x - w / 2 + 6, cy + 1, w * 0.4, 2, GILT[5]);
  for (let k = -3; k <= 3; k++) {
    const ax = x + (k * w) / 7;
    inkP(g, () => g.rect(ax - 2, cy - 12, 4, 12), '#FFFDF2', 1); box(g, ax - 3, cy - 1, 6, 2, GILT[4]);
  }
  inkP(g, () => { g.moveTo(x - w / 2 + 6, cy + 10); g.quadraticCurveTo(x, cy + 52, x + w / 2 - 6, cy + 10); g.closePath(); }, GILT[3], 2);
  for (let k = -4; k <= 4; k++) {
    const dx = x + k * (w / 10), dy = cy + 12 + (16 - Math.abs(k) * 3);
    g.fillStyle = INK; g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx - 4, dy + 10); g.lineTo(dx, dy + 15); g.lineTo(dx + 4, dy + 10); g.closePath(); g.fill();
    g.fillStyle = '#C6E8FC'; g.beginPath(); g.moveTo(dx, dy + 2); g.lineTo(dx - 2.5, dy + 10); g.lineTo(dx, dy + 13); g.lineTo(dx + 2.5, dy + 10); g.closePath(); g.fill();
    box(g, dx - 1, dy + 5, 1, 3, '#FFFFFF');
  }
};
/** The candles' flame points on a chandelierArt (live flicker). */
export const chandelierFlames = (x: number, top: number, drop: number, w = 70): [number, number][] => [-3, -2, -1, 0, 1, 2, 3].map(k => [x + (k * w) / 7, top + drop - 15]);
