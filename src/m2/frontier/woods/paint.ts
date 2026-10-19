// The woods' painting kit (the final pass: peak SNES). The woods carry straight on from the log ride's REAL side (the
// real river, the crew's clearing: logride/realArt.ts, far.ts), so it's the same kit: the same ramps for the hour
// (logride/paint.ts hr), the same dirt, grass, needles, bark, granite, moss, the same firs, spruce, aspens and snags.
// Then the woods' own: duff and leaf litter, aspen gold (the leaf pile's), poison ivy's toxic green, rusted steel,
// creosoted poles, the burnt couch's char and ash, the kids' spray paint. And the view: one eye for the scene (the
// wilds' and the jungle's: anything at depth d stands d of the way from the eye to where it'd be at the play plane).
//
// No park lettering out here: real-world signs are printed, stenciled, hand-painted with a brush, or sprayed.

import type { Look } from '../../signLetters';
import {
  type Ctx, box, checker, mix, hash, stillAt, still, pine, clump, pixelBlob, bandedGradient, hazeBands, INK, hr, bands, handPainted,
  RIVER, GRANITE, DIRT, GRASS, NEEDLE, BARK, MOSS, OAK, STEEL, PLY, RUST, CONCRETE, ORANGE, RINGS, LIP, timeOfDay, farTint, skyAt, hourMix,
} from '../logride/paint';
import { viewOf, at, atDepth, seen, poly, ball, post, part, FAR, type View } from '../wilds/paint';

export {
  type Ctx, box, checker, mix, hash, stillAt, still, pine, clump, pixelBlob, bandedGradient, hazeBands, INK, hr, bands, handPainted,
  RIVER, GRANITE, DIRT, GRASS, NEEDLE, BARK, MOSS, OAK, STEEL, PLY, RUST, CONCRETE, ORANGE, RINGS, LIP, timeOfDay, farTint, skyAt, hourMix,
  viewOf, at, atDepth, seen, poly, ball, post, part, FAR,
};
export type { View };

// ---------------------------------------------------------------------------------------------------------------
// The woods' own materials (darkest first)

/** Duff: the forest floor's needles and old leaves over the dirt. */
export const DUFF = ['#120C06', '#20160C', '#2E2012', '#40301A', '#544024', '#6C5430', '#88703E'];
/** Turned aspen and cottonwood leaves (the leaf pile, the litter, the turning crowns). */
export const GOLD = ['#3A1C04', '#5E2E06', '#8A4A0A', '#B46A10', '#D88E1C', '#ECB232', '#F8D45A'];
/** Dead brown leaves. */
export const BROWN = ['#1E0E06', '#34180A', '#4C2610', '#663618', '#804A22', '#9C602E'];
/** Poison ivy: glossy, a toxic green (the playtest's: an obvious trap). */
export const IVY = ['#0C2404', '#1A4208', '#2E640E', '#4C8A14', '#74B21C', '#A6DC34', '#DAFA7A'];
/** A power pole: creosoted, weathered gray-brown. */
export const POLE = ['#120E0A', '#221A14', '#342A20', '#483C2E', '#5E503E', '#766650', '#928266'];
/** Char (the burnt couch, the fire ring's black). */
export const CHAR = ['#060504', '#0E0C0A', '#181512', '#24201C', '#322C26', '#443C34', '#5A5048'];
/** Ash. */
export const ASH = ['#3A3634', '#54504C', '#706A66', '#8E8884', '#ACA6A2', '#CCC8C4'];
/** Cinder block. */
export const BLOCK = ['#2A2A2C', '#3E3E42', '#55555A', '#6C6C72', '#86868C', '#A2A2A6', '#C2C2C4'];
/** Aspen bark: chalky white, black eyes. */
export const ASPEN = ['#2A2620', '#5A564C', '#8E8A7E', '#B8B2A4', '#D8D4C8', '#E8E4D8', '#FFFFFF'];
/** Snag gray (deadwood). */
export const SNAG = ['#2A2824', '#4A4640', '#6E6860', '#8E887E', '#B0AAA0', '#D0CAC0'];

/** The firs' and the spruces' needles (the log ride's real bank's mixes). */
export const firOf = (N: string[]) => N.map(col => mix(col, '#0A1A0A', 0.12));
export const spruceOf = (N: string[]) => N.map(col => mix(col, '#2A4A5A', 0.2));

// ---------------------------------------------------------------------------------------------------------------
// Real-world lettering

/** Printed (a store-bought sign): crisp, solid, a hair of shadow. */
export const printed = (col: string, cell = 1, shadow?: string): Look => ({ sx: cell, sy: cell, fill: col, bold: cell > 1, shadow });
/** Stenciled on (spray through a stencil): bridges in the bars, a little overspray. */
export const stenciled = (col: string, cell = 1): Look => ({ sx: cell, sy: cell, fill: [col, col, mix(col, '#000000', 0.2)], stencil: true, worn: 0.08, wornCol: mix(col, '#FFFFFF', 0.2), seed: 3 });
/** Sprayed freehand (the kids' tags): fat, wobbly, dripping, an outline in a second can. */
export const sprayed = (col: string, cell = 2, outline?: string, seed = 5): Look => ({ sx: cell, sy: cell, fill: [mix(col, '#FFFFFF', 0.25), col, col, mix(col, '#000000', 0.2)], bold: true, ink: outline, wobble: 2, seed, drip: { col: mix(col, '#000000', 0.1), rate: 0.5, len: 7 } });
export { handPainted as brush };

// ---------------------------------------------------------------------------------------------------------------
// Pieces

/** A stepped leaf (a turned aspen leaf, a dead one), its middle at (x, y), turned by `a`, `r` long. */
export const leafAt = (g: Ctx, x: number, y: number, r: number, a: number, R: string[]) => {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(a);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, r + 1, r * 0.55 + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[2]; g.beginPath(); g.ellipse(0, 0, r, r * 0.55, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[4]; g.beginPath(); g.ellipse(-r * 0.2, -r * 0.15, r * 0.65, r * 0.32, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[Math.min(R.length - 1, 5)]; g.fillRect(-r * 0.5, -r * 0.25, Math.max(1, r * 0.4), 1);
  g.fillStyle = R[1]; g.fillRect(-r * 0.8, 0, r * 1.6, 1);
  g.restore();
};

/** A real tree of the clearing's kind (the log ride's real bank's, the same painters), its foot at (0, 0). */
export type TreeKind = 'fir' | 'spruce' | 'aspen' | 'gold' | 'snag' | 'lean';
export const paintTree = (g: Ctx, k: TreeKind, seed: number, h: number) => {
  const N = hr('needle', NEEDLE, 0.2), B = hr('bark', BARK, 0.2), O = hr('oak', OAK, 0.2);
  switch (k) {
    case 'fir': pine(g, 0, 0, h, h * 0.36, seed, firOf(N), B); return;
    case 'spruce': pine(g, 0, 0, h * 0.9, h * 0.3, seed, spruceOf(N), B); return;
    case 'lean': g.save(); g.rotate(-0.12 - hash(seed) * 0.1); pine(g, 0, 0, h * 0.85, h * 0.3, seed, N, B); g.restore(); return;
    case 'snag': {
      // (a dead snag: bare silver trunk, its top snapped, stubs of limbs, a woodpecker's holes, a conk)
      const sh = h * 0.7, S = SNAG.map(col => farTint(col, 0.2));
      box(g, -6, -sh, 12, sh, INK); box(g, -5, -sh, 10, sh, S[3]); box(g, -5, -sh, 3, sh, S[5]); box(g, 2, -sh, 3, sh, S[1]);
      for (let y = -sh + 8; y < -4; y += 7) box(g, -3 + ((y * 3) & 3), y, 1, 4, S[2]);
      g.fillStyle = INK; g.beginPath(); g.moveTo(-6, -sh); g.lineTo(-2, -sh - 16); g.lineTo(1, -sh - 6); g.lineTo(6, -sh - 20); g.lineTo(6, -sh); g.closePath(); g.fill();
      g.fillStyle = S[2]; g.beginPath(); g.moveTo(-4, -sh); g.lineTo(-2, -sh - 12); g.lineTo(1, -sh - 3); g.lineTo(4, -sh - 15); g.lineTo(4, -sh); g.closePath(); g.fill();
      for (let i = 0; i < 6; i++) { const y = -sh * 0.9 + i * sh * 0.13, s = i % 2 ? 1 : -1; box(g, s > 0 ? 5 : -15, y, 10, 3, INK); box(g, s > 0 ? 5 : -14, y + 1, 9, 1, S[4]); }
      for (let i = 0; i < 3; i++) box(g, -1, -sh * 0.5 + i * 8, 2, 2, INK);
      box(g, 4, -sh * 0.32, 7, 3, INK); box(g, 5, -sh * 0.32, 5, 2, '#C8A060');
      return;
    }
    case 'aspen': case 'gold': {
      // (an aspen: a chalky trunk with black eyes in its bark, a round crown of small leaves; turned gold, or still green)
      const th = h * 0.75, A = ASPEN.map(col => farTint(col, 0.2));
      box(g, -5, -th, 10, th, INK); box(g, -4, -th, 8, th, A[4]); box(g, -4, -th, 2, th, A[6]); box(g, 2, -th, 2, th, A[2]);
      for (let i = 0; i < 10; i++) { const y = -th + 10 + i * th / 11; box(g, -4 + (i % 2) * 3, y, 3, 2, '#2A2620'); box(g, -3 + (i % 2) * 3, y + 2, 1, 1, A[1]); }
      const L = k === 'gold' ? hr('gold', GOLD, 0.2) : O.map(col => mix(col, '#9AB040', 0.25));
      clump(g, 0, -th - 10, 34, 30, seed, L, 0); clump(g, -18, -th + 12, 22, 18, seed + 3, L, 1); clump(g, 16, -th + 8, 24, 18, seed + 5, L, 0);
      return;
    }
  }
};
/** The box a tree paints into (about its foot). */
export const treeBox = (k: TreeKind, h: number): [number, number, number, number] =>
  (k === 'fir' || k === 'spruce' || k === 'lean' ? [-h * 0.3 - 20, -h - 8, h * 0.6 + 40, h + 12] : k === 'snag' ? [-24, -h * 0.7 - 26, 48, h * 0.7 + 30] : [-60, -h * 0.75 - 50, 120, h * 0.75 + 54]);

/** A bush or a thicket clump (the log ride's bank's), its foot at (x, y). */
export const bush = (g: Ctx, x: number, y: number, w: number, h: number, seed: number, dark = 0.25) =>
  clump(g, x, y - h * 0.6, w, h, seed, hr('oak', OAK, 0.2).map(col => mix(col, '#1A2A1A', dark)), 0);
