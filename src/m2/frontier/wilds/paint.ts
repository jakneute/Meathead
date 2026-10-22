// The wilds' painting kit (the final pass: peak SNES): the PARK's wilderness in stepped ramps, lit from the upper left,
// inked round: the fiberglass "rock" (a warm painted gray-tan, its seams and bolts), the meadow's grass, the dirt and
// the real rock under it, pine boughs and bark, oak leaves, the park's pine planks and plywood, steel, the water. And
// the view: one eye for the whole scene (the jungle's perspective: anything at depth d stands d of the way from the eye
// to where it'd be at the play plane), the ground going back to FAR, the flats stood back at FLAT_D.
//
// Still art (a sign, a pine, a boulder's face) is painted once into a stamp, keyed by the hour, and put down after that
// (still()); only what moves is drawn live.

import { timeOfDay, farTint, skyAt } from '../../timeOfDay';
import { type Ctx, INK as JINK, box, checker, mix, hash, PIX, at, poly, viewOf, clump, fern, leaf, type View } from '../../adventure/jungle/art/paint';
import { stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow } from '../../intro/art/kit';
import { INK } from '../kit';

export { type Ctx, box, checker, mix, hash, PIX, at, poly, viewOf, clump, fern, leaf, stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow, INK, timeOfDay, farTint, skyAt };
export type { View };
void JINK;

/** How far back the ground strip behind him goes (the brush along its far edge), and where the painted flats stand. */
export const FAR = 0.7, FLAT_D = 0.84;

// ---------------------------------------------------------------------------------------------------------------
// Materials (darkest first)

/** The park's fiberglass "rock": a painted warm gray-tan. */
export const FIBER = ['#1E1A16', '#38322A', '#544C40', '#706654', '#8E8470', '#ACA28A', '#CEC6AA'];
/** Real rock (under the dirt, the ravine's walls): cooler, grayer than the park's. */
export const STONE = ['#141418', '#24242A', '#36363E', '#4C4C54', '#64646C', '#808088', '#A2A2A8'];
/** Dirt and the trail. */
export const DIRT = ['#160E06', '#28190C', '#3C2814', '#54381C', '#6C4A26', '#886034', '#A87C48'];
/** The meadow's grass. */
export const GRASS = ['#122210', '#1C3414', '#284A1A', '#386420', '#4C7E28', '#6C9C34', '#98BE50'];
/** Pine needles (the boughs). */
export const NEEDLE = ['#06120A', '#0C2012', '#14301A', '#1E4222', '#2A562C', '#3C6E38', '#56884A'];
/** Pine bark: red-brown, scaly. */
export const BARK = ['#140A06', '#24140C', '#381E12', '#4E2C1A', '#663C22', '#80502E', '#9E6A40'];
/** Oak leaves (the hive's tree). */
export const OAK = ['#0A1A0A', '#14300F', '#204614', '#2E5E1A', '#427A22', '#5E962E', '#86B444'];
/** The park's pine planks (signs, rails, the platform). */
export const PLANK = ['#2A1608', '#44260E', '#603818', '#7E4E24', '#9C6834', '#BA8448', '#D8A464'];
/** Plywood (the flats' raw edges and backs). */
export const PLY = ['#3A2410', '#5C3A1A', '#80562A', '#A87A3E', '#C99E5C', '#E6C488'];
/** Steel (struts, brackets, the trap, rails). */
export const STEEL = ['#121418', '#22262C', '#363C44', '#505862', '#6C7682', '#909AA6', '#C4CCD6'];
/** Water, deep to the glint. */
export const WATER = ['#081624', '#0E2236', '#14324C', '#1C4662', '#265C7A', '#347692', '#4C92AC', '#78B4C8', '#B4DCE8'];
/** The lit lip along anything he can stand on (grass catching the light). */
export const LIP = ['#2A3A14', '#5A7A2A', '#9CC050', '#D6EC8A'];
/** The fiberglass's lip (a shelf's top edge): paint worn pale where boots go. */
export const FIBER_LIP = ['#5A5040', '#9A8E72', '#DCD2B0', '#F6F0D8'];

/** A ramp for the hour, near (barely into the haze: the engine lights the scene). */
export const near = (R: string[], k = 0.2) => { const tod = timeOfDay(); return R.map(c => farTint(c, k, tod)); };
/** Scenery stood back (dimmed a step toward the hazy air, so none of it reads as somewhere to stand). */
export const dimmed = (R: string[], k = 0.22) => { const tod = timeOfDay(), haze = skyAt(0.92, tod); return R.map(c => mix(mix(farTint(c, 0.5, tod), '#2A3440', 0.12), haze, k)); };
/** A five-or-more-step ramp round one color. */
export const rampOf = (c: string) => [mix(c, INK, 0.62), mix(c, INK, 0.38), mix(c, INK, 0.16), c, mix(c, '#FFFFFF', 0.24), mix(c, '#FFFFFF', 0.48)];

// ---------------------------------------------------------------------------------------------------------------
// Stills

const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
/** Still art at world (x, y): painted once for this hour (local coordinates, the box bx, by, bw, bh about (x, y)). */
export const still = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `fw-${key}-${timeOfDay().key}-${fontIn()}`, bx, by, bw, bh, paint);
  c.restore();
};
/** Things drawn at a depth (d of the way from the eye): drawn as if at the play plane, scaled toward the eye. */
export const atDepth = (c: Ctx, eye: { x: number; y: number }, d: number, draw: () => void) => {
  c.save(); c.translate(eye.x, eye.y); c.scale(d, d); c.translate(-eye.x, -eye.y); draw(); c.restore();
};
/** On screen, a thing at world x a..b at depth d (by where it's drawn: no pop-in). */
export const seen = (v: View, a: number, b: number, d = 1, pad = 60) => {
  const [sa] = at(v.eye, a, 0, d), [sb] = at(v.eye, b, 0, d);
  return sb > v.cam.x - pad && sa < v.cam.x + 800 + pad;
};

/** A solid's thickness going back (a rock, a stump: anything drawn as a flat front): its outline `pts` (world, convex,
 *  clockwise on screen: up its left, across its top, down its right; the foot's edge is skipped) extruded from the play
 *  plane back to depth `d` toward the one eye, each edge's face a cheap polygon: the tops lit (`top`), the sides shaded
 *  (`side`). Drawn before the front (which covers the faces turned away: only the ones he's looking at show, opening
 *  up as the camera moves off to a side, gone head-on). */
export const extrude = (c: Ctx, eye: { x: number; y: number }, pts: [number, number][], d: number, top: string, side: string) => {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [px, py] = pts[i], [qx, qy] = pts[i + 1], dx = qx - px, dy = qy - py, len = Math.hypot(dx, dy) || 1;
    const ny = -dx / len;
    if (ny > 0.5) continue;
    // (facing away from the eye: hidden behind the front anyway, skipped)
    const nx = dy / len, mx = (px + qx) / 2, my = (py + qy) / 2;
    if (nx * (eye.x - mx) + ny * (eye.y - my) <= 0) continue;
    poly(c, [[px, py], [qx, qy], at(eye, qx, qy, d), at(eye, px, py, d)], ny < -0.5 ? top : side);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Pieces

/** A filled shape in steps: clipped to `path`, its color, a lit band up and left, a shade down and right (and the
 *  darkest rim), dithered where the light meets the color; inked round. `R`: a ramp (>= 6 steps; mid at R[3]). */
export const part = (g: Ctx, path: () => void, R: string[], x: number, y: number, w: number, h: number, line = 1) => {
  g.save(); g.beginPath(); path(); g.clip();
  g.fillStyle = R[3]; g.fillRect(x, y, w, h);
  g.fillStyle = R[2]; g.beginPath(); g.ellipse(x + w * 0.8, y + h * 0.82, w * 0.56, h * 0.52, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[1]; g.beginPath(); g.ellipse(x + w * 0.98, y + h * 1.02, w * 0.4, h * 0.3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[4]; g.beginPath(); g.ellipse(x + w * 0.3, y + h * 0.26, w * 0.42, h * 0.34, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[5]; g.beginPath(); g.ellipse(x + w * 0.22, y + h * 0.18, w * 0.16, h * 0.12, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = R[4];
  for (let px = Math.floor(x); px < x + w; px += 2) g.fillRect(px, Math.round(y + h * 0.54) + ((px >> 1) % 2), 1, 1);
  g.restore();
  if (line > 0) { g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke(); }
};

/** A slab (a board's face, a wall), stepped: lit down its left edge and along its top, shaded down its right (dithered
 *  in), darker along its foot. */
export const slab = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  box(g, x, y, w, h, R[3]);
  box(g, x, y, 2, h, R[4]); box(g, x, y, w, 2, R[4]); box(g, x, y, w, 1, R[5]);
  box(g, x + w - 3, y, 3, h, R[2]); checker(g, x + w - 7, y, 4, h, R[2], 0, 1);
  box(g, x, y + h - 2, w, 2, R[1]);
};

/** A round post (split rail, a peeled log), stepped across, inked; from `top` down to `foot`. */
export const post = (g: Ctx, x: number, top: number, foot: number, w: number, R: string[]) => {
  const x0 = Math.round(x - w / 2), t = Math.max(1, Math.round(w * 0.28));
  box(g, x0 - 1, top - 1, w + 2, foot - top + 1, INK);
  box(g, x0, top, w, foot - top, R[3]);
  box(g, x0, top, t, foot - top, R[4]);
  if (w > 3) box(g, x0 + 1, top, 1, foot - top, R[5]);
  box(g, x0 + w - t, top, t, foot - top, R[2]);
  if (w > 5) for (let y = top + 6; y < foot - 4; y += 9) box(g, x0 + t + ((y * 3) % (w - 2 * t)), y, 1, 4, R[1]);
};

/** A ball, stepped (a cone's body, a stone): ink, its shade, itself up and left, lit, a glint. */
export const ball = (g: Ctx, x: number, y: number, rx: number, ry: number, R: string[], ink = true) => {
  const disc = (dx: number, dy: number, k: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x + dx, y + dy, Math.max(0.5, rx * k), Math.max(0.5, ry * k), 0, 0, Math.PI * 2); g.fill(); };
  if (ink) { g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + 1, ry + 1, 0, 0, Math.PI * 2); g.fill(); }
  disc(0, 0, 1, R[1]);
  disc(-rx * 0.1, -ry * 0.1, 0.86, R[2]);
  disc(-rx * 0.2, -ry * 0.22, 0.64, R[3]);
  disc(-rx * 0.34, -ry * 0.36, 0.32, R[4]);
  if (rx > 2) box(g, x - rx * 0.46, y - ry * 0.52, Math.max(1, rx * 0.2), Math.max(1, ry * 0.18), R[5]);
};

/**
 * A pine, standing at (x, foot): a scaly trunk and tiers of drooping boughs, stepped (the shade under each tier, its
 * body, the lit left flank, needle tufts along its edge, dithered where they meet), inked. `h` its height, `w` its
 * spread at the bottom tier. For the hazard pines and the ones stood about.
 */
export const pine = (g: Ctx, x: number, foot: number, h: number, w: number, seed: number, N = NEEDLE, B = BARK) => {
  const top = foot - h;
  // (the trunk: down from the crown to the ground, flaring at its foot; its bark in scales)
  const tw = Math.max(4, w * 0.12);
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - tw / 2 - 1, top + h * 0.2); g.lineTo(x + tw / 2 + 1, top + h * 0.2); g.lineTo(x + tw * 0.9 + 1, foot + 1); g.lineTo(x - tw * 0.9 - 1, foot + 1); g.closePath(); g.fill();
  g.fillStyle = B[3]; g.beginPath(); g.moveTo(x - tw / 2, top + h * 0.2); g.lineTo(x + tw / 2, top + h * 0.2); g.lineTo(x + tw * 0.9, foot); g.lineTo(x - tw * 0.9, foot); g.closePath(); g.fill();
  box(g, x - tw * 0.5, top + h * 0.2, tw * 0.35, h * 0.8, B[4]); box(g, x + tw * 0.2, top + h * 0.2, tw * 0.3, h * 0.8, B[2]);
  for (let y = top + h * 0.24; y < foot - 3; y += 5) box(g, x - tw * 0.4 + hash(seed + y) * tw * 0.6, y, 3, 2, (y >> 2) % 2 ? B[1] : B[5]);
  // (the tiers: from the bottom (widest, darkest) up to the spire)
  const tiers = Math.max(4, Math.round(h / 34));
  for (let k = tiers - 1; k >= 0; k--) {
    const t = k / (tiers - 1), ty = top + 6 + t * h * 0.78, half = 6 + t * w * 0.5, th = h * 0.2 + t * 6;
    const droop = th * 0.25, jag = (i: number) => (hash(seed + k * 13 + i) - 0.5) * 4;
    const edge: [number, number][] = [];
    for (let i = 0; i <= 8; i++) { const u = i / 8, ex = x - half + u * half * 2; edge.push([ex + jag(i), ty + th - Math.sin(u * Math.PI) * droop * 0.4 + (i % 2) * 3]); }
    const shape = () => { g.moveTo(x, ty - 2); g.lineTo(x + half * 0.5, ty + th * 0.45); for (let i = edge.length - 1; i >= 0; i--) g.lineTo(edge[i][0], edge[i][1]); g.lineTo(x - half * 0.5, ty + th * 0.45); g.closePath(); };
    // (ink round it, its shade, its body, the lit left flank, the needle tufts)
    g.save(); g.fillStyle = INK; g.translate(0, 1.5); g.beginPath(); shape(); g.fill(); g.restore();
    g.fillStyle = N[2]; g.beginPath(); shape(); g.fill();
    g.save(); g.beginPath(); shape(); g.clip();
    box(g, x - half - 2, ty + th * 0.55, half * 2 + 4, th, N[1]);
    g.fillStyle = N[3]; g.beginPath(); g.moveTo(x, ty); g.lineTo(x - half - 2, ty + th + 4); g.lineTo(x + half * 0.2, ty + th + 4); g.closePath(); g.fill();
    g.fillStyle = N[4]; g.beginPath(); g.moveTo(x - 1, ty); g.lineTo(x - half - 2, ty + th * 0.9); g.lineTo(x - half * 0.4, ty + th * 0.9); g.closePath(); g.fill();
    checker(g, x - half, ty + th * 0.55, half * 1.2, 2, N[3], k % 2);
    for (let i = 0; i < half / 3; i++) { const nx = x - half + hash(seed + k * 7 + i) * half * 1.6, ny = ty + 4 + hash(seed + k * 3 + i * 1.7) * th * 0.7; box(g, nx, ny, 2, 3, nx < x ? N[5] : N[2]); }
    g.restore();
    for (let i = 0; i < edge.length; i += 2) box(g, edge[i][0] - 1, edge[i][1] - 1, 2, 3, edge[i][0] < x ? N[4] : N[1]);
  }
  // (the spire)
  g.fillStyle = INK; g.beginPath(); g.moveTo(x, top - 3); g.lineTo(x + 5, top + 12); g.lineTo(x - 5, top + 12); g.closePath(); g.fill();
  g.fillStyle = N[4]; g.beginPath(); g.moveTo(x, top - 1); g.lineTo(x + 3, top + 10); g.lineTo(x - 3, top + 10); g.closePath(); g.fill();
};

/** The fiberglass's surface over a box: the color in steps, its molded "rock" lumps lit up-left, the panel seams with
 *  their bolts, a paint chip showing the white gelcoat. `R` FIBER (or its hour). */
export const fiberglass = (g: Ctx, x: number, y: number, w: number, h: number, R: string[], seed = 0, seams = true) => {
  box(g, x, y, w, h, R[3]);
  // (molded lumps: fake strata running across, each lit along its top, shaded under)
  for (let yy = y + 10 + hash(seed) * 10, row = 0; yy < y + h - 4; yy += 16 + hash(seed + row) * 14, row++) {
    for (let xx = x - 20 + hash(seed + row * 3) * 30; xx < x + w; xx += 34 + hash(seed + row * 7 + xx) * 30) {
      const lw = 22 + hash(seed + xx * 0.3 + row) * 34, lh = 8 + hash(seed + xx + row * 5) * 8;
      box(g, xx, yy, lw, lh, R[2]); box(g, xx, yy, lw, 2, R[4]); box(g, xx + 2, yy + 2, lw * 0.5, 1, R[5]);
      box(g, xx, yy + lh, lw, 2, R[1]); checker(g, xx, yy + lh - 2, lw, 2, R[2], row % 2);
    }
  }
  if (seams) for (let sx = x + 60 + hash(seed * 2) * 40; sx < x + w - 10; sx += 90 + hash(seed + sx) * 50) {
    box(g, sx, y + 4, 1, h - 4, R[1]); box(g, sx + 1, y + 4, 1, h - 4, R[4]);
    for (let by = y + 14; by < y + h - 6; by += 28) { box(g, sx - 2, by, 5, 5, STEEL[1]); box(g, sx - 1, by, 3, 3, STEEL[4]); box(g, sx - 1, by, 1, 1, STEEL[6]); }
  }
  // (a chip in the paint: the white gelcoat under it)
  if (w > 60 && h > 30) { const cx = x + 20 + hash(seed * 3.3) * (w - 40), cy = y + 10 + hash(seed * 5.1) * (h - 20); box(g, cx, cy, 6, 3, '#E8E2D2'); box(g, cx + 1, cy + 3, 4, 1, R[1]); }
};
