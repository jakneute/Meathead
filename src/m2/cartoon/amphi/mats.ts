// DAD MAN LIVE!'s paint box (the SNES pass): a sad, faded 90s outdoor amphitheater's materials in six-step ramps
// (darkest first, lit from the upper left) and the pieces every layer of it uses: weathered poured concrete, aluminum
// bleacher plank, the band shell's cream and blue panels (sun-faded, peeling to the gray primer, rust bleeding off the
// bolts), the stage's deck boards, the set's cheap flats (mustard diamond wallpaper, fake-wood paneling, raw plywood
// edges), steel, brass, the banner's red, the couch's orange; water streaks, peeling paint, rust runs, gum, marquee
// bulbs (some dead), stenciled lettering. Used near (for the hour) or as scenery (dimmed: none of it reads as
// somewhere to stand). The studio's kit (studio/paint.ts) lends its paneling, rails, baseboards and slabs.

import type { Look } from '../../signLetters';
import { box, mix, hash, checker, hour, dimmed, rampH, INK, type Ctx } from '../kit';
import { slab, bands, paneling, rail, baseboard, drape, footShadow } from '../studio/paint';

export { box, mix, hash, checker, hour, dimmed, rampH, INK, slab, bands, paneling, rail, baseboard, drape, footShadow, type Ctx };

/** Six steps round any color. */
export const r6 = (col: string) => [mix(col, INK, 0.62), mix(col, INK, 0.36), mix(col, INK, 0.14), col, mix(col, '#FFFFFF', 0.3), mix(col, '#FFFFFF', 0.6)];
/** A ramp near (for the hour) or as scenery (dimmed). */
export const NR = (R: string[]) => rampH(R);
export const DR = (R: string[]) => rampH(R, true);
export const NC = (col: string) => rampH(r6(col));
export const DC = (col: string) => rampH(r6(col), true);

// ---------------------------------------------------------------------------------------------------------------
// Materials (darkest first)

/** Poured concrete gone gray-beige in the weather. */
export const CONC = ['#3A363A', '#57524F', '#7A7369', '#9E968A', '#C0B8AA', '#E0D9CA'];
/** Bleacher aluminum (the planks: dull, scratched). */
export const ALU = ['#2A303C', '#46505E', '#68727F', '#8E98A4', '#B8C0C8', '#E4EAEE'];
/** The band shell: its cream panels, its blue ones (both sun-faded), the gray primer under the paint. */
export const SHELLC = ['#5E5444', '#8A7E68', '#B4A68A', '#D6C9A8', '#ECE2C6', '#FAF5E4'];
export const SHELLB = ['#1E3048', '#2E4A6A', '#46688C', '#6488AA', '#8EAEC8', '#C2D6E4'];
export const PRIMER = ['#3A3A40', '#55555C', '#74747A', '#929298', '#B2B2B6', '#D2D2D4'];
/** The stage's deck boards (painted brown, worn to the grain). */
export const DECK = ['#24140A', '#3E2412', '#5C381C', '#7A4C28', '#9A683A', '#BE8E58'];
/** The set: the mustard diamond wallpaper, its pattern, the paneling, the raw plywood of the flats' edges. */
export const WALLP = ['#4A3608', '#76580E', '#A07C1C', '#C9A238', '#E2C060', '#F4E09C'];
export const PANELS = ['#2A1608', '#4A2A12', '#6E421E', '#8E5A2C', '#AE7840', '#D09E62'];
export const PLY = ['#4A3014', '#74501E', '#9C7032', '#C2964E', '#DCB878', '#F2DCA8'];
/** Steel (posts, masts, chairs), brass (stanchions), rust. */
export const STEEL = ['#1A1E26', '#2C323C', '#444C58', '#626C78', '#8A94A0', '#BCC4CC'];
export const BRASS = ['#3A2408', '#6A4410', '#A06C1C', '#D09A30', '#F2C84A', '#FFF0A8'];
export const RUST = ['#3A1606', '#5E260C', '#8A3A14', '#B4561E', '#D47C3E', '#F0AE7A'];
/** The banner's red, the show's navy and purple, the awning's green, the grass. */
export const RED = ['#3A0608', '#600C10', '#8E141A', '#B91C1C', '#DC4A40', '#F4887A'];
export const NAVY = ['#0A0E24', '#141C40', '#1E2A5E', '#2A3C80', '#4A62A8', '#8AA2D8'];
export const PURP = ['#1E0A36', '#341454', '#4E2278', '#6A34A0', '#8E5CC4', '#BC9AE2'];
export const AWNG = ['#06301A', '#0C4A28', '#14683A', '#1E8A4E', '#46AE6E', '#8ED4A4'];
export const GRASS = ['#0E3418', '#185224', '#227032', '#348E42', '#5AAE5A', '#9CD48C'];
export const HEDGE = ['#0A2412', '#123A1C', '#1C5228', '#286A34', '#3E8846', '#68AA64'];
export const BARK = ['#1E120A', '#342014', '#4E321E', '#6A462C', '#8A6040', '#AE8460'];
/** Velvet (the rope), orange plaid (the couch). */
export const VELV = ['#2A040C', '#4E0A18', '#7A1226', '#A41C34', '#C83A4E', '#E8707E'];

// ---------------------------------------------------------------------------------------------------------------
// Lettering

/** The show's lettering (the posters', the gate's): slanted, banded yellow to orange, a purple drop shadow. */
export const SHOWL = (size = 2, T: (c: string) => string = c => c): Look => ({ sx: size, sy: size, bold: true, slant: 1, fill: [T('#FFFFFF'), T('#FDE047'), T('#F59E0B')], dither: true, ink: T(INK), shadow: T('#3B0764'), drop: 2 });
/** Small inked lettering; a stencil (row numbers, road cases). */
export const small = (fill: string | string[], ink?: string): Look => ({ sx: 1, sy: 1, bold: true, fill, ink });
export const tiny = (fill: string | string[]): Look => ({ sx: 1, sy: 1, fill, gap: 1 });
export const stencil = (fill: string, sx = 1): Look => ({ sx, sy: sx, bold: true, stencil: true, fill });

// ---------------------------------------------------------------------------------------------------------------
// Weather: streaks, peeling paint, rust runs, gum, cracks

/** Water streaks down a face (from its top): long dithered runs of a darker tone. */
export const streaks = (g: Ctx, x: number, y: number, w: number, h: number, seed: number, col: string, n = 6) => {
  for (let i = 0; i < n; i++) {
    const sx = Math.round(x + hash(seed + i * 3.7) * w), len = Math.round(h * (0.25 + hash(seed * 2 + i) * 0.7)), sw = 2 + Math.floor(hash(seed + i) * 3) * 2;
    checker(g, sx, y, sw, len, col, i % 2, 1);
    box(g, sx + 1, y, 1, Math.round(len * 0.6), col);
  }
};
/** Paint peeled off in flakes (the `under` showing, a dark rim along each flake's lower edge, a lit curl). */
export const peel = (g: Ctx, x: number, y: number, w: number, h: number, seed: number, under: string, rim: string, curl: string, n = 5) => {
  for (let i = 0; i < n; i++) {
    const px = Math.round(x + hash(seed + i * 1.9) * (w - 10)), py = Math.round(y + hash(seed * 3 + i * 2.3) * (h - 8)), pw = 4 + Math.floor(hash(seed + i * 5.1) * 9), ph = 3 + Math.floor(hash(seed + i * 7.3) * 5);
    box(g, px, py, pw, ph, under); box(g, px + 1, py + ph, pw - 1, 1, rim); box(g, px + pw, py + 1, 1, ph - 1, rim);
    box(g, px, py - 1, Math.max(2, pw - 3), 1, curl);
  }
};
/** A run of rust down from a bolt at (x, y). */
export const rustRun = (g: Ctx, x: number, y: number, len: number, R: string[] = RUST) => {
  box(g, x - 1, y - 1, 3, 3, R[1]); box(g, x, y, 1, 1, R[4]);
  box(g, x, y + 2, 1, len, R[2]); checker(g, x - 1, y + 2, 3, Math.round(len * 0.7), R[3], 0, 1);
};
/** Old gum, a stain, a crack (on a floor, flattened). */
export const gum = (g: Ctx, x: number, y: number, col: string) => { box(g, x, y, 3, 2, col); box(g, x, y, 1, 1, mix(col, '#FFFFFF', 0.4)); };
export const crack = (g: Ctx, x: number, y: number, len: number, seed: number, col: string) => {
  let cx = x, cy = y;
  for (let i = 0; i < len; i += 2) { box(g, cx, cy, 2, 1, col); cx += 2; cy += hash(seed + i) > 0.6 ? 1 : hash(seed + i * 1.3) < 0.3 ? -1 : 0; }
};

// ---------------------------------------------------------------------------------------------------------------
// Bulbs

/** A marquee bulb at (x, y) (its middle), r 2..4: a socket ring, the glass in steps (lit, off, or dead: black). */
export const bulb = (g: Ctx, x: number, y: number, r: number, state: 'on' | 'off' | 'dead') => {
  const R = Math.round(r);
  box(g, x - R - 1, y - R - 1, R * 2 + 2, R * 2 + 2, INK);
  if (state === 'dead') { box(g, x - R, y - R, R * 2, R * 2, '#2A2420'); box(g, x - R, y - R, 1, 1, '#5A524A'); return; }
  const C = state === 'on' ? ['#F8C060', '#FFE8A8', '#FFFBEA', '#FFFFFF'] : ['#6A3A16', '#9A5A22', '#C08040', '#E8B878'];
  box(g, x - R, y - R, R * 2, R * 2, C[0]); box(g, x - R, y - R, R * 2 - 1, R * 2 - 1, C[1]); box(g, x - R, y - R, Math.max(1, R), Math.max(1, R), C[2]);
  if (R > 1) box(g, x - R, y - R, 1, 1, C[3]);
};
/** Whether bulb i of a run is dead (a fixed few: the place can't afford new ones). */
export const deadBulb = (i: number, seed = 0, k = 0.18) => hash(i * 1.37 + seed * 9.1) < k;

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** A steel post (a round tube) in steps, inked. */
export const tube = (g: Ctx, x: number, top: number, foot: number, w: number, R: string[]) => {
  const x0 = Math.round(x - w / 2);
  box(g, x0 - 1, top, w + 2, foot - top, INK);
  box(g, x0, top, w, foot - top, R[3]); box(g, x0, top, Math.max(1, Math.round(w * 0.3)), foot - top, R[4]);
  if (w > 3) box(g, x0 + 1, top, 1, foot - top, R[5]);
  box(g, x0 + w - Math.max(1, Math.round(w * 0.3)), top, Math.max(1, Math.round(w * 0.3)), foot - top, R[1]);
};
/** A lattice mast (two rails, zigzag bracing) from (x, top) to foot, w wide, in a ramp. */
export const lattice = (g: Ctx, x: number, top: number, foot: number, w: number, R: string[]) => {
  for (const s of [-1, 1]) { box(g, x + s * w / 2 - 1, top, 3, foot - top, INK); box(g, x + s * w / 2, top, 1, foot - top, s < 0 ? R[4] : R[2]); }
  g.strokeStyle = R[2]; g.lineWidth = 1;
  g.beginPath();
  for (let y = top; y < foot; y += w) { g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y + w); g.moveTo(x - w / 2, y + w); g.lineTo(x + w / 2, y); }
  g.stroke();
  for (let y = top; y < foot; y += w * 3) box(g, x - w / 2, y, w, 1, R[3]);
};
/** A plastic beer cup (its foot at x, y): clear, the beer in it, foam. */
export const cupAt = (g: Ctx, x: number, y: number, full = true) => {
  box(g, x - 3, y - 9, 7, 9, INK); box(g, x - 2, y - 8, 5, 8, '#E8EEF2'); box(g, x - 2, y - 8, 1, 8, '#FFFFFF');
  if (full) { box(g, x - 2, y - 6, 5, 6, '#E8A632'); box(g, x - 2, y - 6, 5, 1, '#FFF4D8'); box(g, x + 2, y - 5, 1, 5, '#B87A1C'); }
};
/** A crushed SWILL LITE can lying on its side (feet at x, y). */
export const deadCan = (g: Ctx, x: number, y: number, seed: number) => {
  const w = 8 + Math.floor(hash(seed) * 3);
  box(g, x - w / 2 - 1, y - 5, w + 2, 5, INK); box(g, x - w / 2, y - 4, w, 4, '#B01C2C'); box(g, x - w / 2, y - 4, w, 1, '#F06A72');
  box(g, x - 1, y - 4, 3, 3, '#F4F1E8'); box(g, x + w / 2 - 1, y - 4, 1, 4, '#C9CDD4'); box(g, x - w / 2 + 2, y - 2, 2, 1, '#7A0E1C');
};
/** A soft stepped shadow on the ground under a thing (x..x+w at y). */
export const shadowAt = (g: Ctx, x: number, y: number, w: number, a = 0.35) => {
  const col = `rgba(14,8,24,${a})`;
  box(g, x + 4, y - 2, w - 8, 3, col); checker(g, x, y - 2, 4, 3, col, 0, 1); checker(g, x + w - 4, y - 2, 4, 3, col, 1, 1);
};
