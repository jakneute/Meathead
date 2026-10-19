// Disaster: The Ride, the pre-show's TV: CHIP CHADWICK on his 1983 tape as a Ren & Stimpy gross-up. The sudden
// painted, grotesquely over-rendered close-up, held still while only the mouth goes: the fake tan in hard stepped bands
// (plum shadows, a hot orange rim off the set), every pore (blackheads on the nose, a mole with its hair), forehead
// creases arched over the raised brows, liver spots, a tan line under the hair helmet, oily shine, sweat beads and a
// drip, bloodshot bulging eyes (veins from the corners, the hazel ring, wet lower lids, crust in the corners, bags in
// folds, crow's feet), a ruddy bulb of a nose with broken veins and its hairs, deep grin folds, the gummy grin itself
// (receding gums, yellowed teeth with plaque at the gumline, a gap, a chip, a gold one, crooked tartared lowers, the
// tongue, spit strings), a wet cracked lower lip, five o'clock shadow, a zit with a head on his chin, red waxy hairy
// ears, dandruff in the helmet and on his shoulders, and the finger guns either side (hairy knuckles, bitten dirty
// nails, a hangnail, a pinky ring). Three mouth frames (the jaw dropping) and an eye twitch, each painted once.
//
// Round the TV's bezel, chaser bulbs: brass sockets, each glass bulb with its hot core and a halo in banded rings,
// the chase travelling round smooth (each bulb easing through four steps), now and then the lot flashing together; a
// few burned out, a loose one flickering, a tired one dim (the park's). Once it's real, mostly dead, a few sputtering.

import { box, mix, hash, poly, steppedGlow, bandedGradient } from '../blvd/kit';
import { type Ctx, INK, GOLD, still } from './paint';
import { sprite } from './gross';

const H = hash;
const px = (g: Ctx, x: number, y: number, col: string) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
const clamp6 = (n: number) => (n < 0 ? 0 : n > 6 ? 6 : n);
/** Seven hard steps round a color: three shadows (toward `shadow`), itself, three lights. */
const ramp7 = (base: string, shadow: string, hi = '#FFF4E0') =>
  [mix(base, shadow, 0.74), mix(base, shadow, 0.55), mix(base, shadow, 0.36), mix(base, shadow, 0.17), base, mix(base, hi, 0.3), mix(base, hi, 0.58)];

const SKIN = '#D08850';
const S = ramp7(SKIN, '#3A0E1E');
const BLOTCH = ramp7(mix(SKIN, '#C8483A', 0.24), '#3A0E1E');
const RIM = ramp7(mix(SKIN, '#FFB060', 0.4), '#5A1A10', '#FFF0C8');
const NOSE = ramp7(mix(SKIN, '#D0503E', 0.32), '#3A0E1E');
const STUB = ramp7(mix(SKIN, '#5A5A70', 0.42), '#140C1C');
const EAR = ramp7(mix(SKIN, '#D85A48', 0.3), '#3A0E1E', '#FFE0C8');
const PALE = ramp7(mix(SKIN, '#F4DCC4', 0.5), '#3A0E1E');
const LIVER = ramp7(mix(SKIN, '#6A3418', 0.42), '#2A0A0A');
const BAG = ramp7(mix(SKIN, '#8A4A6A', 0.3), '#2A0A1E');
const HAIR = ramp7('#4A2C12', '#080303', '#E8C890');
const LIP = ramp7('#B05A58', '#3A0A14', '#FFE8E0');
const GUM = ramp7('#C85464', '#3A0A14', '#FFE0E4');
const TONGUE = ramp7('#A84858', '#2A0610', '#FFD0D8');
const TOOTH = ['#5A4420', '#8A7038', '#B49A58', '#D2BC7C', '#E6D49A', '#F4E8BC', '#FFF8E0'];
const GOLDT = ramp7('#D8A830', '#3A2408', '#FFF8C0');
const SUIT = ramp7('#1D4ED8', '#060A30', '#C8D8FF');
const SHIRT = ramp7('#E8E4D8', '#3A3020', '#FFFFFF');
const TIE = ramp7('#C02020', '#2A0606', '#FFC0B0');
const DIRT = '#3A2A1A', NAIL = '#E4C0A8', FLAKE = '#F4F0E6', SWEAT = '#FFFFFF';

// ---------------------------------------------------------------------------------------------------------------
// The head (local: x about the screen's middle, y down from the screen's top; the screen's 224 x 150)

interface Geo { jd: number; bcy: number; bry: number; chin: number }
/** The three mouth frames: shut grin, half, wide (the jaw dropping, the chin with it). */
const GEO: Geo[] = [0, 3, 7].map(jd => ({ jd, bcy: 86 + jd * 0.9, bry: 28 + jd * 0.6, chin: Math.round(114 + jd * 1.5) }));
const AX = 50, AY = 54, ACY = 56, BX = 43;
const LX = -0.5, LY = -0.6, LZ = 0.62;

/** The skull and the jaw: the surface's normal at (x, y), or null off the head. */
const normal = (x: number, y: number, G: Geo): [number, number, number] | null => {
  const ax = x / AX, ay = (y - ACY) / AY, ra = ax * ax + ay * ay;
  const bx = x / BX, by = (y - G.bcy) / G.bry, rb = bx * bx + by * by;
  if (ra >= 1 && rb >= 1) return null;
  const za = ra < 1 ? Math.sqrt(1 - ra) : -1, zb = rb < 1 ? Math.sqrt(1 - rb) : -1;
  const [nx, ny, nz] = za >= zb ? [ax, ay * 0.85, za] : [bx, by * 0.85, zb];
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
};
const onHead = (x: number, y: number, G: Geo) => { const ax = x / AX, ay = (y - ACY) / AY, bx = x / BX, by = (y - G.bcy) / G.bry; return ax * ax + ay * ay < 1 || bx * bx + by * by < 1; };
const blob = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => { const a = (x - cx) / rx, b = (y - cy) / ry, r = a * a + b * b; return r < 1 ? 1 - r : 0; };
/** The face's form over the ball: the sockets, the brow ridges, the grin's cheeks pushed up, the temples, the jaw's hollow. */
const form = (x: number, y: number, G: Geo) => {
  let d = 0;
  for (let s = -1; s <= 1; s += 2) {
    d -= 0.3 * blob(x, y, s * 20, 57, 17, 12);
    d += 0.14 * blob(x, y, s * 20, 44, 17, 5);
    d += 0.2 * blob(x, y, s * 27, 73, 13, 9);
    d -= 0.14 * blob(x, y, s * 43, 46, 8, 13);
    d -= 0.18 * blob(x, y, s * 36, 98 + G.jd, 9, 14);
  }
  if (x > -14 && x < 14 && y >= 83 && y <= 87) d -= 0.28;
  return d + 0.12 * blob(x, y, -12, 30, 18, 8);
};
/** The skin's color at (x, y), `dl` steps lighter (or darker), in a ramp (by default the tan, blotchy, rimmed). */
const skin = (x: number, y: number, G: Geo, dl = 0, R?: string[]): string | null => {
  const n = normal(x, y, G);
  if (!n) return null;
  const lit = Math.max(0, n[0] * LX + n[1] * LY + n[2] * LZ);
  const b = 0.12 + 0.92 * lit + form(x, y, G);
  const lv = clamp6(Math.floor(b * 6.2 + ((x + y) & 1 ? 0.22 : -0.22)) + dl);
  const ramp = R ?? (n[0] > 0.7 && n[1] < 0.5 ? RIM : H(Math.floor(x / 6) * 3.1 + Math.floor(y / 5) * 7.3) > 0.8 ? BLOTCH : S);
  return ramp[lv];
};
const sk = (g: Ctx, x: number, y: number, G: Geo, dl = 0, R?: string[]) => { const c = skin(x, y, G, dl, R); if (c) px(g, x, y, c); };
/** A small lit ball (a nose's bulb, its wings, an ear): hard steps of R by its own normal. */
const ballAt = (x: number, y: number, cx: number, cy: number, rx: number, ry: number, R: string[], dl = 0): string | null => {
  const a = (x - cx) / rx, b = (y - cy) / ry, r = a * a + b * b;
  if (r >= 1) return null;
  const lit = Math.max(0, a * LX + b * LY + Math.sqrt(1 - r) * LZ);
  return R[clamp6(Math.floor((0.15 + 0.9 * lit) * 6.2 + ((x + y) & 1 ? 0.22 : -0.22)) + dl)];
};
/** A crease along y = yf(x): its shade above, the cut, lit under; broken here and there. */
const crease = (g: Ctx, G: Geo, x0: number, x1: number, yf: (x: number) => number, depth: number, seed: number) => {
  for (let x = x0; x <= x1; x++) {
    if (H(x * 0.37 + seed) > 0.9) continue;
    const y = Math.round(yf(x));
    sk(g, x, y - 1, G, -1); sk(g, x, y, G, -depth); sk(g, x, y + 1, G, 1);
  }
};
/** Oily shine: a stepped patch, a hot core. */
const shine = (g: Ctx, G: Geo, cx: number, cy: number, rx: number, ry: number) => {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
    const k = blob(x, y, cx, cy, rx, ry);
    if (!k || (k < 0.25 && (x + y) & 1)) continue;
    if (k > 0.78) px(g, x, y, '#FFFFFF'); else if (k > 0.45) px(g, x, y, '#FFF2DC'); else sk(g, x, y, G, 2);
  }
};
/** A sweat bead: its body lit through, a white catchlight, the dark rim under. */
const bead = (g: Ctx, G: Geo, x: number, y: number, big: boolean) => {
  const w = big ? 3 : 2, h = big ? 4 : 3;
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) sk(g, x + dx, y + dy, G, dy === h - 1 ? 3 : dx === 0 && dy > 0 ? -1 : 1);
  for (let dx = 0; dx < w; dx++) sk(g, x + dx, y + h, G, -3);
  px(g, x, y, SWEAT); if (big) px(g, x + 1, y, '#F4FBFF');
};
/** A zit: the angry ring, a yellow head (or none), its glint. */
const zit = (g: Ctx, G: Geo, x: number, y: number, head: boolean) => {
  for (let dx = -3; dx <= 3; dx++) sk(g, x + dx, y + 3, G, -2);
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    const r = dx * dx + dy * dy;
    if (r > 10) continue;
    px(g, x + dx, y + dy, r > 6 ? '#B8483A' : r > 2 ? '#D86452' : head ? (r > 0 ? '#F0E0A8' : '#FFF8E0') : '#E87A64');
  }
  px(g, x - 1, y - 1, head ? '#FFFFFF' : '#F8B8A8');
};

const hairline = (x: number) => 21 + 0.0075 * x * x;
const inHelmet = (x: number, y: number) => { const a = (x + 3) / 63, b = (y - 12) / 30; return a * a + b * b < 1; };
const inHair = (x: number, y: number, G: Geo) =>
  (inHelmet(x, y) && (y < hairline(x) || !onHead(x, y, G))) || (onHead(x, y, G) && Math.abs(x) >= 42 && y < 64 && y >= 24);

/** The neck, the collar (its ring), the tie and its stain, the suit's shoulders and lapels, dandruff on them. */
const paintBody = (g: Ctx, G: Geo) => {
  // (the suit's shoulders, each its own shade: lit on the left, the right in shadow; the folds)
  for (let s = -1; s <= 1; s += 2) {
    const R = s < 0 ? [SUIT[3], SUIT[5], SUIT[1]] : [SUIT[2], SUIT[3], SUIT[0]];
    poly(g, [[s * 28, 110], [s * 112, 122], [s * 112, 150], [s * 8, 150]], INK);
    poly(g, [[s * 28, 111], [s * 111, 123], [s * 111, 150], [s * 9, 150]], R[0]);
    poly(g, [[s * 28, 111], [s * 111, 123], [s * 111, 126], [s * 30, 114]], R[1]);
    for (let k = 0; k < 4; k++) { const fx = s * (50 + k * 15); for (let i = 0; i < 9; i++) px(g, fx + s * Math.floor(i / 3), 122 + k + i, R[2]); }
    // (the lapel: darker, a lit edge)
    poly(g, [[s * 22, 112], [s * 8, 150], [s * 20, 150], [s * 42, 120]], INK);
    poly(g, [[s * 23, 113], [s * 10, 150], [s * 19, 150], [s * 40, 121]], s < 0 ? SUIT[2] : SUIT[1]);
    for (let i = 0; i < 37; i++) px(g, s * Math.round(23 - i * 0.37), 113 + i, s < 0 ? SUIT[5] : SUIT[3]);
  }
  // (the shirt in the V, the tie: its knot, its stripes, a mustard stain)
  poly(g, [[-14, 120], [14, 120], [9, 150], [-9, 150]], SHIRT[4]);
  poly(g, [[-7, 121], [7, 121], [5, 132], [-5, 132]], INK); poly(g, [[-6, 122], [6, 122], [4, 131], [-4, 131]], TIE[4]);
  box(g, -6, 122, 4, 2, TIE[6]); box(g, 2, 124, 3, 6, TIE[2]);
  poly(g, [[-5, 132], [5, 132], [8, 150], [-8, 150]], INK); poly(g, [[-4, 133], [4, 133], [7, 150], [-7, 150]], TIE[3]);
  for (let k = 0; k < 4; k++) for (let i = 0; i < 6; i++) px(g, -5 + i + (k % 2), 135 + k * 4 + Math.floor(i / 2), '#E8C25A');
  box(g, 1, 140, 3, 2, '#D8A820'); px(g, 2, 142, '#D8A820'); px(g, 1, 140, '#F8D860');
  // (the neck: lit left, the jaw's shadow under it, its folds; the collar over it, ring-around-the-collar)
  for (let y = 88; y < 132; y++) for (let x = -31; x <= 31; x++) {
    if (onHead(x, y, G) || y > 112 + Math.abs(x) * 0.2) continue;
    const under = onHead(x, y - 5, G);
    const lv = under ? 1 : clamp6(Math.floor(4.6 - (x + 31) / 14 + ((x + y) & 1 ? 0.3 : -0.3)));
    px(g, x, y, S[lv]);
  }
  for (const [y0, dy] of [[G.chin + 3, 0], [G.chin + 6, 1]]) for (let x = -18; x <= 18; x++) { const y = Math.round(y0 + dy + x * x * 0.008); if (!onHead(x, y, G) && y < 118) { px(g, x, y, S[1]); px(g, x, y + 1, S[5]); } }
  for (let s = -1; s <= 1; s += 2) {
    poly(g, [[s * 34, 108], [s * 2, 126], [s * 22, 134], [s * 40, 118]], INK);
    poly(g, [[s * 33, 109], [s * 4, 125], [s * 21, 132], [s * 38, 118]], SHIRT[s < 0 ? 4 : 3]);
    for (let i = 0; i < 30; i++) { const x = s * Math.round(33 - i * 0.97), y = Math.round(109 + i * 0.53); px(g, x, y, '#C8B060'); if (i % 3) px(g, x, y + 1, '#D8C890'); }
    poly(g, [[s * 4, 125], [s * 21, 132], [s * 18, 133], [s * 6, 127]], SHIRT[1]);
  }
  for (let i = 0; i < 60; i++) {
    const s = i % 2 ? 1 : -1, t = H(i * 3.17 + 5), x = s * Math.round(36 + t * 72), y = Math.round(113 + (Math.abs(x) - 28) * 0.14 + H(i * 1.9) * 6);
    px(g, x, y, FLAKE); if (H(i * 7.7) > 0.7) px(g, x + 1, y, '#D8D4CC');
  }
};

/** The ears: red, inked, their whorls, the canal and its wax, the hair out of it, the lobe. */
const paintEars = (g: Ctx) => {
  for (let s = -1; s <= 1; s += 2) {
    const cx = s * 53, cy = 66;
    for (let y = cy - 16; y <= cy + 16; y++) for (let x = cx - 9; x <= cx + 9; x++) {
      const a = (x - cx) / 8.5, b = (y - cy) / 15.5, r = a * a + b * b;
      if (r >= 1) continue;
      if (r > 0.84) { px(g, x, y, INK); continue; }
      const outer = s * (x - cx) > 0 && r > 0.5;
      px(g, x, y, outer ? EAR[y < cy ? 5 : 4] : ballAt(x, y, cx, cy, 8.5, 15.5, EAR) ?? EAR[3]);
    }
    for (let y = cy - 9; y <= cy + 6; y++) for (let x = cx - 4; x <= cx + 4; x++) { const k = blob(x, y, cx - s, cy - 1, 4, 8); if (k) px(g, x, y, k > 0.5 ? EAR[1] : EAR[2]); }
    for (let y = cy - 1; y <= cy + 3; y++) for (let x = cx - 2; x <= cx + 2; x++) if (blob(x, y, cx - s, cy + 1, 2.2, 2.6)) px(g, x, y, INK);
    box(g, cx - s - 1, cy + 3, 3, 1, '#C8A030'); px(g, cx - s, cy + 2, '#8A6A18'); px(g, cx - s * 2, cy + 3, '#E8C850');
    for (let k = 0; k < 4; k++) for (let i = 0; i < 3 + (k % 2); i++) px(g, cx - s + s * i, cy - k + 1 - (i > 1 ? 1 : 0), HAIR[1 + (k % 2)]);
    for (let x = cx - 3; x <= cx + 3; x++) { px(g, x, cy + 10, EAR[1]); px(g, x, cy + 11, EAR[5]); }
    for (let i = 0; i < 6; i++) px(g, cx + s * 5, cy - 10 + i * 3, EAR[1]);
  }
};

/** The skin, the ball: banded by the light, blotchy, the rim off the set; then every pore, deep ones lit under. */
const paintSkin = (g: Ctx, G: Geo) => {
  for (let y = 0; y <= G.chin + 1; y++) for (let x = -50; x <= 50; x++) { const c = skin(x, y, G); if (c) px(g, x, y, c); }
  for (let y = 18; y <= G.chin; y++) for (let x = -49; x <= 49; x++) {
    if (!onHead(x, y, G)) continue;
    const w = 0.07 + 0.18 * blob(x, y, 0, 74, 14, 14) + 0.1 * (blob(x, y, -28, 76, 14, 12) + blob(x, y, 28, 76, 14, 12)), h = H(x * 12.9898 + y * 78.233);
    if (h < w) { sk(g, x, y, G, h < w * 0.5 ? -2 : -1); if (h < w * 0.35) sk(g, x, y + 1, G, 1); }
  }
};

/** The forehead: the tan line, the creases arched over the raised brows, liver spots, a zit, the oil, the frown's pair. */
const paintForehead = (g: Ctx, G: Geo) => {
  for (let x = -38; x <= 38; x++) for (let k = 1; k <= 3; k++) { const y = Math.round(hairline(x)) + k; if (k < 3 || (x + y) & 1) sk(g, x, y, G, 0, PALE); }
  for (let k = 0; k < 4; k++) crease(g, G, -32 + k * 3, 32 - k * 3, x => 27 + k * 4.4 + 2.2 * Math.cos((x * Math.PI) / 20) + 0.6 * Math.sin(x * 0.7 + k), k > 1 ? 3 : 2, k * 11);
  for (const [sx, sy, r, sd] of [[-30, 33, 3.2, 1], [33, 39, 2.6, 2], [-39, 47, 2.2, 3], [15, 28, 1.8, 4], [-21, 25, 1.6, 5]]) {
    for (let y = Math.floor(sy - r - 1); y <= sy + r + 1; y++) for (let x = Math.floor(sx - r - 1); x <= sx + r + 1; x++) {
      const d = Math.hypot(x - sx, (y - sy) * 1.2) + (H(x * 3.3 + y * 1.7 + sd) - 0.5) * 1.6;
      if (d < r) sk(g, x, y, G, 0, LIVER);
    }
  }
  zit(g, G, 22, 31, true);
  shine(g, G, -12, 31, 7, 2.6); shine(g, G, 6, 36, 3, 1.5);
};

/** The brows: bushy, raised high, hair by hair, strays curling up, the unibrow's fuzz. */
const paintBrows = (g: Ctx) => {
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i < 90; i++) {
      const t = H(i * 1.7 + s * 31), x = Math.round(s * (7 + t * 27)), thick = 2.5 + (1 - t) * 2.5;
      const y = Math.round(48 - 4.4 * Math.sin(t * Math.PI) + (H(i * 2.3 + s) - 0.5) * thick);
      const col = HAIR[H(i * 3.1) > 0.85 ? 5 : 1 + Math.floor(H(i * 4.7) * 3)];
      px(g, x, y, col); px(g, x + (H(i * 5.1) > 0.5 ? s : 0), y - 1, HAIR[2]);
    }
    for (let k = 0; k < 3; k++) { const x0 = s * (12 + k * 8), y0 = Math.round(45 - 4.4 * Math.sin(((12 + k * 8 - 7) / 27) * Math.PI)); for (let i = 0; i < 6; i++) px(g, x0 + s * Math.floor(i / 2), y0 - i, HAIR[1]); }
    px(g, s * 30, 40, FLAKE); px(g, s * 18, 42, FLAKE);
  }
  for (let i = 0; i < 12; i++) px(g, Math.round(-6 + H(i * 9.1) * 12), 46 + Math.floor(H(i * 3.9) * 3), HAIR[2]);
};

/** An eye: the hooded lid, the bulging bloodshot white, the iris and its ring, the wet lower lid, the crust, the bags,
 *  crow's feet. */
const paintEye = (g: Ctx, G: Geo, s: number) => {
  const ex = s * 20, ey = 58, RX = 11.5;
  const sp = (x: number) => { const k = 1 - ((x - ex) / RX) ** 2; return k > 0 ? Math.sqrt(k) : 0; };
  const top = (x: number) => ey - 6.5 * sp(x), bot = (x: number) => ey + 5 * sp(x);
  // (the lid's fold, heavy, the skin bulging over)
  for (let x = ex - 12; x <= ex + 12; x++) { const t = Math.round(top(x)); sk(g, x, t - 5, G, -3); sk(g, x, t - 4, G, -1); sk(g, x, t - 3, G, 1); sk(g, x, t - 2, G, 2); sk(g, x, t - 1, G, 0); }
  // (the white: shaded under the lid, the corners pink)
  for (let x = ex - 11; x <= ex + 11; x++) {
    const t = Math.round(top(x)), b = Math.round(bot(x));
    for (let y = t; y <= b; y++) {
      const rel = (y - t) / Math.max(1, b - t), side = Math.abs(x - ex) > 8;
      px(g, x, y, rel < 0.22 ? '#A89880' : rel < 0.4 && (x + y) & 1 ? '#C8BCA4' : side ? '#E4B4A4' : rel > 0.82 ? '#D8C4B0' : '#F0E8D4');
    }
  }
  // (the veins: in from both corners, wandering, branching)
  const ix = ex - s, iy = ey;
  for (let v = 0; v < 9; v++) {
    const fromOut = v < 5, sx0 = fromOut ? ex + s * 11 : ex - s * 11, dir = fromOut ? -s : s;
    let x = sx0, y = ey + Math.round((H(v * 4.1 + s) - 0.5) * 6);
    const len = 5 + Math.floor(H(v * 2.7 + s * 3) * 5);
    for (let i = 0; i < len; i++) {
      x += dir; const j = H(v * 13 + i * 1.7 + s);
      y += j < 0.3 ? -1 : j > 0.7 ? 1 : 0;
      if (Math.hypot(x - ix, y - iy) < 5.5 || y <= top(x) + 1 || y > bot(x)) break;
      px(g, x, y, i < 2 ? '#A81818' : '#C02828');
      if (j > 0.82 && y + 1 <= bot(x)) px(g, x, y + 1, '#D85A5A');
    }
  }
  // (the iris: its dark ring, hazel round the pupil, streaked; under the lid's shadow on top; the catchlights)
  for (let y = iy - 6; y <= iy + 6; y++) for (let x = ix - 6; x <= ix + 6; x++) {
    if (y <= top(x) || y > bot(x)) continue;
    const d = Math.hypot(x - ix, y - iy);
    if (d > 5.2) continue;
    const ang = Math.floor(((Math.atan2(y - iy, x - ix) + Math.PI) / (Math.PI * 2)) * 14);
    px(g, x, y, d > 4.4 ? '#1A2430' : d < 2.2 ? '#08080C' : d < 3 ? '#8A7A3A' : y < iy - 2 ? '#2A5A74' : H(ang * 3.3 + s) > 0.55 ? '#6AAAC8' : '#3E7E9C');
  }
  box(g, ix - 2, iy - 2, 2, 2, '#FFFFFF'); px(g, ix + 2, iy + 1, '#E8F4FF');
  // (the lids' ink, the lashes; the wet waterline under, its glints, the lower lashes)
  for (let x = ex - 11; x <= ex + 11; x++) {
    const t = Math.round(top(x)), b = Math.round(bot(x));
    px(g, x, t, INK); px(g, x, t + 1, '#3A1A14');
    if ((x - ex) % 2 === 0 && Math.abs(x - ex) < 11) { const o = Math.sign(x - ex) || s; px(g, x, t - 1, INK); px(g, x + o, t - 2, INK); if (Math.abs(x - ex) > 3) px(g, x + o * 2, t - 3, INK); }
    px(g, x, b + 1, '#C86A6A');
    if (H(x * 2.1 + s) > 0.6) px(g, x, b + 1, '#F8D0D0');
    if ((x - ex) % 3 === 0) px(g, x, b + 2, '#3A1A14');
  }
  // (the inner corner: the red caruncle, the crust)
  const cx = ex - s * 11;
  box(g, cx - (s > 0 ? 1 : 0), ey - 1, 2, 3, '#C04848'); px(g, cx, ey - 1, '#E07070');
  box(g, cx - s * 2, ey + 1, 2, 2, '#E8D070'); px(g, cx - s * 2, ey + 2, '#C8A040'); px(g, cx - s, ey + 3, '#E8D070');
  // (the bags: two puffy folds, plum)
  for (let x = ex - 10; x <= ex + 10; x++) {
    const b = Math.round(bot(x));
    sk(g, x, b + 3, G, 1, BAG); sk(g, x, b + 4, G, -1, BAG);
    if (Math.abs(x - ex) < 8) { sk(g, x, b + 5, G, -3, BAG); sk(g, x, b + 6, G, 1); }
    if (Math.abs(x - ex) < 6) { sk(g, x, b + 8, G, -2); sk(g, x, b + 9, G, 1); }
  }
  // (crow's feet, fanning out from the outer corner)
  for (const a of [-0.55, -0.18, 0.2, 0.55]) {
    let x = ex + s * 12, y = ey + 0.5;
    for (let i = 0; i < 8; i++) { x += s; y += Math.tan(a) + (H(i + a * 10) - 0.5) * 0.6; sk(g, x, Math.round(y), G, -2); sk(g, x, Math.round(y) + 1, G, 1); }
  }
};

/** The nose: the bridge, the ruddy bulb and its wings, the blackheads and broken veins, the nostrils and their hairs. */
const paintNose = (g: Ctx, G: Geo) => {
  for (let y = 48; y <= 72; y++) { for (let x = -3; x <= -1; x++) if (x > -3 || (x + y) & 1) sk(g, x, y, G, 2); for (let x = 4; x <= 6; x++) sk(g, x, y, G, x === 4 ? -2 : -1); }
  for (let s = -1; s <= 1; s += 2) {
    for (let y = 75; y <= 88; y++) for (let x = s * 11 - 7; x <= s * 11 + 7; x++) { const c = ballAt(x, y, s * 11, 81, 6, 4.8, NOSE, s > 0 ? -1 : 0); if (c) px(g, x, y, c); }
    for (let i = 0; i <= 14; i++) { const a = (i / 14) * Math.PI * 1.1 - 0.05, x = Math.round(s * 11 + s * Math.cos(a) * 6.4), y = Math.round(81 - Math.sin(a) * 5); sk(g, x, y, G, -3); }
  }
  for (let y = 66; y <= 86; y++) for (let x = -13; x <= 13; x++) { const c = ballAt(x, y, 0, 76, 12.5, 9.5, NOSE); if (c) px(g, x, y, c); }
  for (let y = 66; y <= 88; y++) for (let x = -16; x <= 16; x++) {
    const on = blob(x, y, 0, 76, 12.5, 9.5) || blob(x, y, -11, 81, 6, 4.8) || blob(x, y, 11, 81, 6, 4.8);
    if (!on) continue;
    const h = H(x * 7.31 + y * 3.77 + 9);
    if (h < 0.07) px(g, x, y, '#2A1810'); else if (h < 0.16) px(g, x, y, NOSE[2]); else if (h > 0.97) px(g, x, y, NOSE[6]);
  }
  for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 2; k++) {
    let x = s * (9 + k * 3), y = 78 + k * 2;
    for (let i = 0; i < 6; i++) { px(g, x, y, '#B8383A'); x += s * (H(i + k * 5 + s) > 0.5 ? 1 : 0); y += H(i * 2 + k + s) > 0.5 ? 1 : -1; if (i === 3) px(g, x + s, y, '#C84848'); }
  }
  shine(g, G, -4, 72, 4.5, 2.6); shine(g, G, -12, 79, 1.6, 1.2);
  // (the nostrils, flared; the septum lit; the hairs out of them, one long gray one)
  for (let s = -1; s <= 1; s += 2) {
    for (let y = 82; y <= 86; y++) for (let x = s * 6 - 4; x <= s * 6 + 4; x++) { const k = blob(x, y, s * 6, 84, 3.4, 1.9); if (k) px(g, x, y, k > 0.4 ? '#1E0608' : '#5A1A1A'); }
    for (let k = 0; k < 4; k++) { const hx = s * 6 + k - 2, l = 2 + Math.floor(H(k * 3.3 + s) * 3); for (let i = 0; i < l; i++) px(g, hx + (i > 1 ? s : 0), 85 + i, HAIR[1 + (k % 2)]); }
    for (let i = 0; i < 6; i++) px(g, s * 7 + (i > 3 ? s : 0), 85 + i, '#B8B0A8');
  }
  for (let y = 82; y <= 86; y++) { px(g, -1, y, NOSE[4]); px(g, 0, y, NOSE[3]); }
};

/** The grin's folds, cut deep from the nose's wings down past the mouth's corners, the cheeks lit over them. */
const paintFolds = (g: Ctx, G: Geo) => {
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i <= 44; i++) {
      const t = i / 44, x = Math.round((1 - t) * (1 - t) * s * 15 + 2 * (1 - t) * t * s * 29 + t * t * s * 35), y = Math.round((1 - t) * (1 - t) * 80 + 2 * (1 - t) * t * 81 + t * t * (94 + G.jd * 0.5));
      sk(g, x + s, y - 1, G, 1); sk(g, x, y, G, -3); sk(g, x, y + 1, G, -2); sk(g, x - s, y + 1, G, -1);
    }
  }
};

/** Five o'clock shadow: the beard's dithered shade over the upper lip, chin and jaw, its stubble, hair by hair. */
const paintStubble = (g: Ctx, G: Geo) => {
  for (let y = 84; y <= G.chin + 1; y++) for (let x = -50; x <= 50; x++) {
    const ax = Math.abs(x);
    if (!((y >= 86 && ax <= 22) || (y >= 95 && ax <= 37) || (ax > 37 && y >= 70))) continue;
    if (!onHead(x, y, G) || (y < 89 && ax < 17)) continue;
    const edge = (y < 89 && ax <= 22) || (y < 98 && ax > 22 && ax <= 37) || (ax > 37 && y < 74);
    if (edge && H(x * 1.3 + y * 2.9) > 0.5) continue;
    if ((x + y) & 1) sk(g, x, y, G, 0, STUB);
    const h = H(x * 5.1 + y * 9.7 + 3);
    if (h < 0.16) px(g, x, y, '#2A1C1C');
    if (h < 0.04) { px(g, x, y, '#1A1010'); px(g, x + (x < 0 ? -1 : 1), y + 1, '#1A1010'); }
  }
};

/** The gummy grin: the lips, the gums, every yellowed tooth (plaque, a gap, a chip, a gold crown), the crooked lowers
 *  and their tartar, the tongue, spit strings; the wet cracked lower lip; the fold under it. */
const paintMouth = (g: Ctx, G: Geo) => {
  const W = 31, cyM = 87, open = 12 + G.jd * 1.6;
  const q = (x: number) => Math.max(0, 1 - (x / W) ** 2);
  const yU = (x: number) => cyM + 4 * q(x), yL = (x: number) => yU(x) + open * q(x) ** 0.6;
  // (the philtrum's ridges over it)
  for (let y = 84; y <= 87; y++) { sk(g, -4, y, G, 1); sk(g, 4, y, G, 1); sk(g, 0, y, G, -1); }
  // (the upper lip: in its own shadow, its border lit; the cupid's bow)
  for (let x = -W; x <= W; x++) {
    const u = Math.round(yU(x)), th = Math.round(1 + 3 * q(x)) + (Math.abs(x) < 2 ? 0 : Math.abs(x) < 6 ? 1 : 0);
    for (let k = 1; k <= th; k++) px(g, x, u - k, k === th ? LIP[4] : k === 1 ? LIP[1] : Math.abs(x) > W - 5 ? LIP[1] : LIP[2]);
    px(g, x, u - th - 1, skin(x, u - th - 1, G, -2) ?? LIP[1]);
  }
  // (inside, column by column)
  for (let x = -W + 1; x <= W - 1; x++) {
    const t = Math.round(yU(x)), b = Math.round(yL(x)), qq = q(x);
    if (b - t < 2) { px(g, x, t, INK); continue; }
    const n = b - t, gum = Math.round(1 + 2.6 * qq), upH = Math.max(1, Math.round(7.5 * Math.sqrt(qq))), loH = Math.max(1, Math.round(4 * Math.sqrt(qq)));
    const tH = G.jd ? Math.round((2 + G.jd * 0.6) * qq) : 0;
    const u = Math.asin(Math.max(-1, Math.min(1, x / (W + 1)))) / (Math.PI / 2), tf = (u + 1) * 5, ti = Math.floor(tf), fr = tf - ti;
    const tl = Math.floor(tf + 0.5), frL = tf + 0.5 - tl, lv = 4 - Math.round(Math.abs(u) * 2.5);
    const gap = fr < 0.12 || fr > 0.9, gumRows = gum + (gap ? 1 : 0);
    for (let y = t; y < b; y++) {
      const r = y - t;
      let col: string;
      if (r < gumRows) col = r === 0 ? GUM[1] : gap ? GUM[2] : r === gumRows - 1 && fr > 0.3 && fr < 0.7 ? GUM[5] : GUM[3];
      else if (r < gum + upH) {
        const rr = r - gum;
        if (ti === 2) col = r === gumRows ? GUM[2] : '#1A0606';
        else if (ti === 6 && rr >= upH - 2 && fr > 0.4) col = '#1A0606';
        else if (ti === 7) col = gap ? GOLDT[1] : GOLDT[clamp6(lv + (rr < 2 ? 1 : 0) + (fr < 0.35 ? 1 : 0))];
        else if (gap) col = '#4A3018';
        else if (rr === 0) col = '#A88A40';
        else if (rr === 1) col = '#C8B060';
        else if (rr === upH - 1) col = '#B8B49C';
        else if ((ti === 4 || ti === 5) && fr > 0.28 && fr < 0.4) col = TOOTH[6];
        else if (H(ti * 3.3) > 0.7 && fr > 0.5 && fr < 0.68) col = '#8A6A2A';
        else col = TOOTH[clamp6(lv - (fr > 0.82 ? 2 : 0))];
      } else if (r >= n - loH) {
        const rr = r - (n - loH), gapL = frL < 0.14 || frL > 0.88;
        if (tl === 3 && rr === 0) col = '#240606';
        else if (rr === loH - 1 && loH > 1) col = '#8A7A48';
        else if (gapL) col = '#3A2410';
        else col = TOOTH[clamp6(lv - 1 - (frL > 0.8 ? 1 : 0) + (rr === 0 ? 1 : 0))];
      } else if (tH && r >= n - loH - tH) {
        const rr = r - (n - loH - tH);
        col = Math.abs(x) < 1 ? TONGUE[1] : rr === 0 ? TONGUE[5] : H(x * 3.7 + y * 1.3) < 0.16 ? TONGUE[4] : TONGUE[3];
      } else col = r === gum + upH ? '#3A0A0A' : '#240606';
      px(g, x, y, col);
    }
  }
  // (spit: strings from top to bottom teeth, a bubble at the corner; the corners' ink and wet)
  if (G.jd) {
    for (const sx of [-9, 14]) { const t = Math.round(yU(sx)) + Math.round(1 + 2.6 * q(sx)) + Math.round(7.5 * Math.sqrt(q(sx))), b = Math.round(yL(sx)) - Math.round(4 * Math.sqrt(q(sx))); for (let y = t; y < b; y++) if (y % 3 !== 1) px(g, sx + (y > (t + b) / 2 ? 1 : 0), y, '#D8E8F0'); }
    const bx = 22, by = Math.round(yL(22)) - 3;
    px(g, bx, by - 1, '#E8F4F8'); px(g, bx - 1, by, '#E8F4F8'); px(g, bx + 1, by, '#E8F4F8'); px(g, bx, by + 1, '#C8D8E0'); px(g, bx - 1, by - 1, '#FFFFFF');
  }
  for (let s = -1; s <= 1; s += 2) { box(g, s > 0 ? W - 1 : -W, cyM - 1, 2, 2, INK); px(g, s * (W - 2), cyM + 1, '#F0F4F8'); }
  // (the lower lip: fat, wet, cracked, a dry flake; the fold under it)
  for (let x = -W + 2; x <= W - 2; x++) {
    const b = Math.round(yL(x)), lh = Math.round(1 + 5 * Math.sqrt(q(x)));
    for (let k = 0; k < lh; k++) {
      let col = k === 0 ? LIP[2] : k === 1 ? LIP[4] : k === lh - 1 ? LIP[2] : LIP[3];
      if (k > 0 && k < lh - 1 && H(x * 1.7) > 0.8) col = LIP[1];
      if ((k === 1 || k === 2) && x >= -13 && x <= -3) col = H(x * 4.1 + k) > 0.55 ? '#FFFFFF' : '#FFF0EC';
      px(g, x, b + k, col);
    }
    sk(g, x, b + lh, G, -3); sk(g, x, b + lh + 1, G, -1);
  }
  box(g, 6, Math.round(yL(6)) + 2, 2, 1, '#F0D0C0');
};

/** The chin: its cleft, a lit knob, the zit; the mole on the cheek with its hair; a red bump. */
const paintChin = (g: Ctx, G: Geo) => {
  for (let y = G.chin - 9; y <= G.chin - 3; y++) { sk(g, 0, y, G, -2); sk(g, -1, y, G, 1); sk(g, 1, y, G, -1); }
  shine(g, G, -7, G.chin - 6, 3, 1.6);
  zit(g, G, 10, G.chin - 7, true);
  box(g, -35, 77, 3, 3, '#4A2A1A'); px(g, -35, 77, '#6A4A2A'); for (let i = 0; i < 5; i++) px(g, -34 + (i > 2 ? 1 : 0) - (i === 4 ? 2 : 0), 76 - i, HAIR[1]);
  zit(g, G, 18, 68, false);
};

/** Sweat: beads across the brow, the temples, the upper lip, the nose; one drip running down into the brow. */
const paintSweat = (g: Ctx, G: Geo) => {
  for (const [x, y, b] of [[-24, 29, 1], [-8, 26, 1], [4, 30, 0], [12, 25, 1], [26, 34, 1], [-34, 40, 0], [-16, 37, 0], [18, 40, 0], [-2, 39, 1], [38, 50, 1], [-39, 58, 0], [37, 64, 0]]) bead(g, G, x, y, !!b);
  for (const [x, y] of [[-14, 85], [-7, 86], [8, 86], [15, 85], [20, 86]]) bead(g, G, x, y, false);
  bead(g, G, 7, 70, false); bead(g, G, -6, 64, false);
  for (let y = 34; y < 47; y++) { sk(g, 8, y, G, 2); if (y % 4 === 0) px(g, 8, y, SWEAT); }
  bead(g, G, 7, 46, true);
};

/** The helmet: sprayed stiff, banded over its swell, strand by strand, a greasy shine down the swoop, the part's scalp,
 *  thin hairs over the hairline, sideburns, dandruff. */
const paintHair = (g: Ctx, G: Geo) => {
  for (let y = -20; y <= 64; y++) for (let x = -66; x <= 62; x++) {
    if (!inHair(x, y, G)) continue;
    const helm = inHelmet(x, y);
    const a = (x + 3) / 63, b = (y - 12) / 30, r = Math.min(0.99, a * a + b * b), z = Math.sqrt(1 - r);
    if (helm && r > 0.93) { px(g, x, y, INK); continue; }
    let lv = helm ? Math.floor((0.1 + 0.9 * Math.max(0, a * LX + b * LY + z * LZ)) * 5.2 + ((x + y) & 1 ? 0.25 : -0.25)) : x < 0 ? 2 : 1;
    const p = helm ? (x + 0.02 * (y - 10) * (y - 10)) * 0.45 : y * 0.6;
    if (p - Math.floor(p) < 0.2) lv -= 1;
    if (helm && Math.abs(y - (2 + 0.004 * (x + 10) * (x + 10))) < 2.4) lv += 2;
    px(g, x, y, HAIR[clamp6(lv)]);
    if (helm && Math.abs(x - (-24 - (y - 10) * 0.15)) < 0.8 && y > -6) px(g, x, y, (y & 1) ? HAIR[0] : '#E0A880');
  }
  for (let x = -38; x <= 38; x++) { const y = Math.round(hairline(x)); if (H(x * 2.3) < 0.45) { px(g, x, y, HAIR[1]); if (H(x * 5.7) < 0.4) px(g, x + 1, y + 1, HAIR[2]); } }
  for (let i = 0; i < 46; i++) {
    const x = Math.round(-58 + H(i * 2.71 + 1) * 116), y = Math.round(-10 + H(i * 1.93 + 4) * 44);
    if (!inHair(x, y, G) || !inHelmet(x, y)) continue;
    px(g, x, y, FLAKE); if (H(i * 4.3) > 0.7) { px(g, x + 1, y, '#D8D4CC'); px(g, x, y + 1, '#D8D4CC'); }
  }
};

/** A finger gun (the left: the right's mirrored): the sleeve and cuff, the fist's curled fingers with hairy knuckles and
 *  dirty nails, the pinky ring, the cocked thumb's bitten nail and hangnail, the pointing finger's creases and nail. */
const paintHand = (g: Ctx) => {
  const K = S;
  box(g, -16, 14, 30, 16, INK); box(g, -15, 15, 28, 15, SUIT[3]); box(g, -15, 15, 6, 15, SUIT[4]); box(g, 8, 15, 5, 15, SUIT[1]);
  box(g, -13, 8, 24, 8, INK); box(g, -12, 9, 22, 6, SHIRT[4]); box(g, -12, 9, 22, 1, SHIRT[6]); box(g, -12, 14, 22, 1, SHIRT[2]); box(g, -3, 10, 3, 3, GOLD[3]); px(g, -3, 10, GOLD[5]);
  // (the fist)
  box(g, -14, -12, 26, 22, INK); box(g, -13, -11, 24, 20, K[4]); box(g, -13, -11, 5, 20, K[5]); box(g, 6, -11, 5, 20, K[2]); box(g, -13, 6, 24, 3, K[2]);
  for (let i = 0; i < 3; i++) {
    const fy = -9 + i * 6;
    box(g, -9, fy, 6, 1, K[6]); box(g, -8, fy + 5, 18, 1, K[1]); box(g, -8, fy + 4, 18, 1, K[3]);
    box(g, 7, fy + 1, 3, 3, NAIL); px(g, 9, fy + 1, DIRT); px(g, 9, fy + 2, DIRT);
    for (let k = 0; k < 5; k++) if (H(i * 7 + k * 1.3) > 0.35) { px(g, -7 + k * 3, fy + 1, HAIR[1]); px(g, -6 + k * 3, fy, HAIR[1]); }
  }
  box(g, -1, 7, 6, 2, GOLD[3]); px(g, 0, 7, GOLD[5]); px(g, 4, 8, GOLD[1]);
  for (let i = 0; i < 8; i++) px(g, -12 + Math.floor(H(i * 5.3) * 20), -10 + Math.floor(H(i * 3.1) * 18), K[6]);
  // (the thumb, cocked)
  box(g, -15, -28, 9, 18, INK); box(g, -14, -27, 7, 17, K[4]); box(g, -14, -27, 2, 17, K[5]); box(g, -9, -27, 2, 17, K[2]);
  box(g, -14, -18, 7, 1, K[1]); box(g, -14, -17, 7, 1, K[6]);
  box(g, -13, -27, 5, 5, NAIL); box(g, -13, -27, 5, 1, DIRT); px(g, -10, -26, DIRT); box(g, -13, -23, 5, 1, '#C88070'); px(g, -8, -23, '#D89080'); px(g, -7, -24, '#D89080');
  // (the pointing finger, up and in)
  poly(g, [[-2, -11], [8, -11], [15, -40], [5, -40]], INK);
  poly(g, [[-1, -11], [7, -11], [14, -39], [6, -39]], K[4]);
  poly(g, [[-1, -11], [2, -11], [9, -39], [6, -39]], K[5]);
  poly(g, [[5, -11], [7, -11], [14, -39], [12, -39]], K[2]);
  for (const cy of [-20, -30]) { const o = Math.round((-11 - cy) * 0.24); box(g, o, cy, 8, 1, K[1]); box(g, o + 1, cy + 1, 6, 1, K[6]); box(g, o + 1, cy - 1, 6, 1, K[3]); }
  for (let k = 0; k < 5; k++) { const y = -13 - k * 1.5, o = Math.round((-11 - y) * 0.24); px(g, o + 1 + k, Math.round(y), HAIR[1]); px(g, o + 2 + k, Math.round(y) - 1, HAIR[1]); }
  box(g, 7, -39, 6, 5, NAIL); box(g, 7, -39, 6, 1, DIRT); px(g, 8, -38, DIRT); px(g, 11, -38, '#F8F0E0'); box(g, 7, -35, 6, 1, '#C88070');
};

/** Chip, the whole close-up for one mouth frame. */
const paintChip = (g: Ctx, m: number) => {
  const G = GEO[m];
  paintBody(g, G);
  paintEars(g);
  paintSkin(g, G);
  paintForehead(g, G);
  paintStubble(g, G);
  paintFolds(g, G);
  paintBrows(g);
  paintEye(g, G, -1); paintEye(g, G, 1);
  paintNose(g, G);
  paintMouth(g, G);
  paintChin(g, G);
  paintSweat(g, G);
  paintHair(g, G);
  for (let s = -1; s <= 1; s += 2) { g.save(); g.translate(s * 88, 100); g.scale(-s, 1); paintHand(g); g.restore(); }
};
const CHIP_PAINT = [0, 1, 2].map(m => (g: Ctx) => paintChip(g, m));
/** The twitch: his left eye's lower lid jumping up, the tic's creases under it. */
const paintTwitch = (g: Ctx) => {
  const G = GEO[0], ex = -20, ey = 58;
  for (let x = ex - 10; x <= ex + 10; x++) {
    const k = 1 - ((x - ex) / 11.5) ** 2, b = Math.round(ey + 5 * Math.sqrt(Math.max(0, k)));
    for (let y = ey + 1; y <= b + 1; y++) sk(g, x, y, G, y === ey + 1 ? -2 : 0);
    px(g, x, ey + 1, '#3A1A14'); if ((x - ex) % 3 === 0) px(g, x, ey + 2, INK);
    sk(g, x, b + 3, G, -3); sk(g, x, b + 4, G, 1);
  }
};

const mouthAt = (f: number) => { const h = H(Math.floor(f / 4) * 3.71); return h < 0.22 ? 0 : h < 0.58 ? 1 : 2; };
const twitchAt = (f: number) => { const t = f % 230; return t >= 170 && t < 196 && ((t >> 1) & 1) === 0; };

// (the set behind him: its rays, banded, turning slow; sparkles)
const RAY_A = ['rgba(253, 230, 138, 0.10)', 'rgba(253, 230, 138, 0.16)', 'rgba(255, 247, 214, 0.26)'];
const RAY_B = ['rgba(251, 146, 60, 0.14)', 'rgba(251, 146, 60, 0.2)', 'rgba(254, 215, 170, 0.3)'];
const RAY_W = [0.2, 0.13, 0.06];

/** The tape's picture: the sunburst set, Chip grossed up (his mouth going while `talking`), the lower third. In the
 *  screen's box (x, y, w, h); clips itself. */
export const drawChip = (c: Ctx, x: number, y: number, w: number, h: number, f: number, talking: boolean) => {
  const cx = x + w / 2, oy = y + 46;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  bandedGradient(c, x, y, w, h, ['#7C2D12', '#C2410C', '#F97316', '#FDBA74'], 8);
  steppedGlow(c, cx, oy, 150, '#FDE68A', 0.32, 0.02, 6);
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6 + f * 0.005, C = k % 2 ? RAY_B : RAY_A;
    for (let j = 0; j < 3; j++) {
      c.fillStyle = C[j]; c.beginPath(); c.moveTo(cx, oy);
      c.lineTo(cx + Math.cos(a - RAY_W[j]) * 230, oy + Math.sin(a - RAY_W[j]) * 230); c.lineTo(cx + Math.cos(a + RAY_W[j]) * 230, oy + Math.sin(a + RAY_W[j]) * 230);
      c.closePath(); c.fill();
    }
  }
  for (let i = 0; i < 6; i++) {
    const t = (f + i * 23) % 60, sx = x + 10 + ((i * 53) % (w - 20)), sy = y + 8 + ((i * 37) % 40);
    if (t < 20) { const r = t < 10 ? 1 : 2; box(c, sx - r, sy, r * 2 + 1, 1, '#FFF7D6'); box(c, sx, sy - r, 1, r * 2 + 1, '#FFF7D6'); }
  }
  const m = talking ? mouthAt(f) : 0;
  c.translate(Math.round(cx), Math.round(y));
  sprite(c, `chip-${m}`, -112, -20, 224, 170, CHIP_PAINT[m]);
  if (twitchAt(f)) sprite(c, 'chip-tw', -34, 56, 30, 18, paintTwitch);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The chaser bulbs round the bezel

/** The bulbs' places on the TV's case (from its top-middle), clockwise from the top left. */
const BULBS: [number, number][] = [];
{
  const C: [number, number][] = [[-123, 6], [123, 6], [123, 176], [-123, 176]], N = [18, 12, 18, 12];
  for (let s = 0; s < 4; s++) {
    const [ax, ay] = C[s], [bx, by] = C[(s + 1) % 4];
    for (let i = 0; i < N[s]; i++) BULBS.push([Math.round(ax + ((bx - ax) * i) / N[s]), Math.round(ay + ((by - ay) * i) / N[s])]);
  }
}
/** The sockets, painted into the TV's case: brass cups, lit up their top left, dark where the glass sits. */
export const paintSockets = (g: Ctx) => {
  for (const [bx, by] of BULBS) for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
    const r = dx * dx + dy * dy;
    if (r > 26) continue;
    px(g, bx + dx, by + dy, r > 18 ? INK : r > 8 ? (dx + dy < -2 ? GOLD[5] : dx + dy > 2 ? GOLD[1] : GOLD[3]) : '#120C06');
  }
};
/** A bulb at four brightnesses (and dead): edge, glass, hot core; the halo in banded rings. */
const BULB = [['#2A2018', '#4A3E30', '#3A3024'], ['#5A4428', '#8A6A40', '#9A7A50'], ['#9A5A20', '#D8923A', '#F8C060'], ['#C8802A', '#F8C060', '#FFF0C0'], ['#E8A848', '#FFE8A8', '#FFFFFF']];
const HALO: [number, number][] = [[0, 0], [0, 0], [7, 0.2], [9, 0.28], [11, 0.4]];
const paintBulb = (g: Ctx, l: number) => {
  const [R, a] = HALO[l], [E, B, C] = BULB[l];
  if (R) steppedGlow(g, 0, 0, R, '#FFC870', a, 0.04, 4);
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    const r = dx * dx + dy * dy;
    if (r > 10) continue;
    px(g, dx, dy, r > 6 ? E : r > (l === 4 ? 2 : 1) ? B : C);
  }
  px(g, -1, -2, l ? '#FFFFFF' : '#8A8070');
  if (!l) { px(g, 0, 0, '#1A1410'); px(g, 1, 1, '#1A1410'); }
};
const BULB_PAINT = [0, 1, 2, 3, 4].map(l => (g: Ctx) => paintBulb(g, l));

/** The bulbs, lit: the chase going round (each easing through its steps), the lot flashing together now and then; a
 *  few burned out, a loose one flickering, a tired one dim. Real: mostly dead, a few sputtering. (tx, top): the case's
 *  top-middle. */
export const tvBulbs = (c: Ctx, tx: number, top: number, f: number, real: boolean) => {
  const show = f % 420, fan = show >= 360;
  for (let i = 0; i < BULBS.length; i++) {
    const [bx, by] = BULBS[i], h = H(i * 7.31 + 2);
    let l: number;
    if (real) l = h > 0.55 ? (H(Math.floor(f / 4) * 1.7 + i) > 0.5 ? 3 : 1) : h > 0.3 ? 1 : 0;
    else if (h > 0.94) l = 0;
    else {
      if (fan) l = ((show - 360) >> 3) % 2 ? 1 : 4;
      else { const ph = Math.cos((i / 6 - f / 45) * Math.PI * 2); l = ph > 0.7 ? 4 : ph > 0.25 ? 3 : ph > -0.3 ? 2 : 1; }
      if (h > 0.86 && H(Math.floor(f / 3) * 1.3 + i) > 0.55) l = Math.min(l, 1);
      if (h < 0.08) l = Math.max(1, l - 1);
    }
    still(c, `tvbulb-${l}`, tx + bx, top + by, -11, -11, 22, 22, BULB_PAINT[l]);
  }
};
