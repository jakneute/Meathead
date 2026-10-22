// The town's painting kit (the final pass): the intro's ramps, dither and ink, so the town comes out of a piece with the
// rest of the park; the town's own materials in stepped ramps (its purple stucco, slate, cobbles, iron, oak, brass);
// and the view: one eye for the whole scene (the vanishing point everything going back goes toward), with the
// perspective the jungle uses: anything at depth d stands d of the way from the eye to where it'd be at the play plane.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { INK as KIT_INK, box, checker, mix, rampOf, hash, PIX, stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow } from '../../intro/art/kit';
import { signAt, signText, signW, signH, haunt, type Look } from '../letters';

export { box, checker, mix, rampOf, hash, PIX, stamp, bandedGradient, hazeBands, pixelBlob, steppedGlow };
export type Ctx = CanvasRenderingContext2D;
/** The town's ink (a purple-black: the crude pass's, kept). */
export const INK = '#0B0710';
void KIT_INK;

// ---------------------------------------------------------------------------------------------------------------
// Palettes (darkest first)

/** The cobbles and flags of the street. */
export const COBBLE = ['#151220', '#211C2C', '#2E2838', '#3F3A4A', '#524B5E', '#6B6478', '#8A8298'];
/** Dressed stone (the plaza, the stairs, the castle): a cool lilac gray. */
export const STONE = ['#18141F', '#262030', '#363042', '#4A4458', '#5E586E', '#7A7390', '#9A93AE'];
/** Slate (the roofs). */
export const SLATE = ['#0F0D17', '#1A1726', '#262236', '#343048', '#454060', '#5A5478'];
/** Black iron (lamps, rails, the gate). */
export const IRON = ['#08070C', '#14121C', '#22202C', '#33303F', '#4A4658', '#6A6680'];
/** Old oak (doors, the gallows, beams). */
export const OAK = ['#140C08', '#24160E', '#3A2416', '#553522', '#6E4A30', '#8C6440', '#AE8458'];
/** Brass (fittings, the carousel's column). */
export const BRASS = ['#3A2408', '#5E3C0E', '#8A5A16', '#B47E24', '#D8A63A', '#F2D27A'];
/** The lit lip on anything to stand on (warm, the balconies'). */
export const LIP = ['#57483A', '#8A7050', '#D6B98A', '#F2DDB0'];

// ---------------------------------------------------------------------------------------------------------------
// The view

export interface View {
  cam: { x: number; y: number };
  /** Where he's looking from (the vanishing point: everything going back goes toward it). */
  eye: { x: number; y: number };
  /** What's on screen (world), with a margin. */
  v0: number; v1: number; top: number; bot: number;
  f: number;
}
export const viewOf = (state: GameState): View => {
  const cam = state.camera;
  return {
    cam: { x: cam.x, y: cam.y },
    eye: { x: cam.x + CANVAS_WIDTH / 2, y: cam.y + CANVAS_HEIGHT * 0.42 },
    v0: cam.x - 120, v1: cam.x + CANVAS_WIDTH + 120, top: cam.y - 40, bot: cam.y + CANVAS_HEIGHT + 40,
    f: state.frame,
  };
};
/** A world point at the play plane, put back (d < 1) or brought forward (d > 1) toward the eye. */
export const at = (eye: { x: number; y: number }, x: number, y: number, d: number): [number, number] => [eye.x + (x - eye.x) * d, eye.y + (y - eye.y) * d];
/** Things drawn at a depth (d of the way from the eye): drawn as if at the play plane, scaled toward the eye. */
export const atDepth = (c: Ctx, eye: { x: number; y: number }, d: number, draw: () => void) => {
  c.save(); c.translate(eye.x, eye.y); c.scale(d, d); c.translate(-eye.x, -eye.y); draw(); c.restore();
};

/** A polygon, filled (no ink). */
export const poly = (c: Ctx, pts: [number, number][], col: string) => {
  c.fillStyle = col; c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath(); c.fill();
};
/** A polygon with an ink line round it. */
export const inked = (c: Ctx, pts: [number, number][], col: string, t = 1) => {
  poly(c, pts, col);
  c.strokeStyle = INK; c.lineWidth = t; c.lineJoin = 'miter'; c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath(); c.stroke();
};

/**
 * The side of a box going back from the play plane at x = e (a building's, a crate's), from `top` to `bottom`, back
 * to depth `d`; seen only from its side (side 1: its face looks right). In steps across, darker the further back.
 */
export const sideFace = (c: Ctx, eye: { x: number; y: number }, e: number, side: 1 | -1, top: number, bottom: number, d0: number, d1: number, cols: string[]) => {
  if ((eye.x - e) * side <= 1) return false;
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    const a = d0 + ((d1 - d0) * i) / n, b = d0 + ((d1 - d0) * (i + 1)) / n;
    poly(c, [at(eye, e, top, a), at(eye, e, top, b), at(eye, e, bottom, b), at(eye, e, bottom, a)], cols[i]);
  }
  const [x1, t1] = at(eye, e, top, d1), [, b1] = at(eye, e, bottom, d1);
  c.strokeStyle = INK; c.lineWidth = 1;
  c.beginPath(); c.moveTo(e, top); c.lineTo(x1, t1); c.lineTo(x1, b1); c.stroke();
  return true;
};
/**
 * The top (or underside) of a box going back from the play plane at height y, from x0 to x1, back to depth d; seen only
 * from above it (a top) or below it (an underside), whichever the eye is. In bands, darker going back.
 */
export const flatFace = (c: Ctx, eye: { x: number; y: number }, x0: number, x1: number, y: number, d0: number, d1: number, cols: string[]) => {
  if (Math.abs(eye.y - y) < 1) return;
  const n = cols.length;
  for (let i = 0; i < n; i++) {
    const a = d0 + ((d1 - d0) * i) / n, b = d0 + ((d1 - d0) * (i + 1)) / n;
    poly(c, [at(eye, x0, y, a), at(eye, x1, y, a), at(eye, x1, y, b), at(eye, x0, y, b)], cols[i]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Words and boards

/** Words, centered, painted on in the town's lettering (spooky/letters.ts: serifed, ramped; a look of its own if given). */
export const words = (c: Ctx, s: string, x: number, y: number, col: string, size = 8, shadow: string | null = null, look?: Look) =>
  signAt(c, s, x, y, size, look ?? { ...haunt(size, col), shadow: shadow ?? undefined });
/** How wide a line of the town's lettering sets (the board's words at `size`). */
export const textW = (_c: Ctx | null, s: string, size: number) => signW(s, haunt(size, '#000000'));

/**
 * A town board (the shop sign, the warning): painted wood or enamel in its ramp, inked, a lit top edge and a shaded
 * bottom one, a beveled frame, two screws; the words with a drop shadow. Its middle at (x, y). Returns its width.
 */
export const board = (c: Ctx, x: number, y: number, s: string, col: string, ink: string, size = 8) => {
  const r = rampOf(col);
  const L = haunt(size, ink, col), w = Math.round(signW(s, L) + 16), h = signH(L) + 12;
  const x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2);
  box(c, x0 - 1, y0 - 1, w + 2, h + 2, INK);
  box(c, x0, y0, w, h, r[2]);
  box(c, x0, y0, w, 1, r[4]); box(c, x0, y0 + 1, w, 1, r[3]);
  box(c, x0, y0 + h - 2, w, 2, r[1]); box(c, x0 + w - 1, y0, 1, h, r[1]);
  checker(c, x0 + 1, y0 + h - 3, w - 2, 1, r[1]);
  // (the frame's inner line, the screws)
  box(c, x0 + 2, y0 + 2, w - 4, 1, r[1]); box(c, x0 + 2, y0 + h - 4, w - 4, 1, r[3]);
  for (const sx of [x0 + 3, x0 + w - 5]) { box(c, sx, y0 + h / 2 - 1, 2, 2, r[0]); box(c, sx, y0 + h / 2 - 1, 1, 1, r[4]); }
  signText(c, s, x, Math.round(y0 + h / 2 + signH(L) / 2), L);
  return w;
};

/** An iron post (a sign's, a lamp's): round, stepped across, inked, a cap and a foot. */
export const ironPost = (c: Ctx, x: number, top: number, foot: number, w = 6) => {
  box(c, x - w / 2 - 1, top, w + 2, foot - top, INK);
  box(c, x - w / 2, top, w, foot - top, IRON[3]);
  box(c, x - w / 2, top, Math.max(1, w / 3), foot - top, IRON[4]);
  box(c, x + w / 2 - 2, top, 2, foot - top, IRON[1]);
  box(c, x - w / 2 - 2, foot - 4, w + 4, 4, INK); box(c, x - w / 2 - 1, foot - 3, w + 2, 3, IRON[2]); box(c, x - w / 2 - 1, foot - 3, w + 2, 1, IRON[4]);
  box(c, x - w / 2 - 1, top - 3, w + 2, 3, INK); box(c, x - w / 2, top - 2, w, 1, IRON[5]);
};

/** A board on a post (or two, wide), standing on the ground at (x, feetY), the board's middle `up` above it. */
export const signPost = (c: Ctx, x: number, feetY: number, up: number, s: string, col: string, ink: string, size = 8) => {
  const w = textW(c, s, size) + 16;
  if (w > 160) { ironPost(c, x - w / 2 + 14, feetY - up, feetY); ironPost(c, x + w / 2 - 14, feetY - up, feetY); }
  else ironPost(c, x, feetY - up, feetY);
  board(c, x, feetY - up, s, col, ink, size);
};

// ---------------------------------------------------------------------------------------------------------------
// Stonework, windows

/**
 * A wall of stucco (or dressed stone) over (x, y, w, h) in its ramp: stepped across from the lit left, grime stippled up
 * from the foot, cracks, a stain under each sill. `blocks`: dressed stone (coursed, the joints inked).
 */
export const wall = (c: Ctx, x: number, y: number, w: number, h: number, r: string[], seed: number, blocks = false) => {
  box(c, x, y, w, h, r[2]);
  box(c, x, y, 3, h, r[3]); box(c, x + 3, y, 2, h, mix(r[2], r[3], 0.5));
  box(c, x + w - 4, y, 4, h, r[1]);
  checker(c, x + w - 6, y, 2, h, r[1]);
  if (blocks) {
    for (let yy = y, row = 0; yy < y + h; yy += 14, row++) {
      box(c, x, yy, w, 1, r[1]);
      box(c, x, yy + 1, w, 1, mix(r[2], r[3], 0.6));
      for (let xx = x + (row % 2) * 13; xx < x + w; xx += 26) box(c, xx, yy, 1, Math.min(14, y + h - yy), r[1]);
    }
  } else {
    // (the stucco's texture: flecks, a crack or two, patches fallen off showing brick)
    for (let i = 0; i < (w * h) / 160; i++) box(c, x + hash(seed + i * 1.3) * w, y + hash(seed + i * 2.9) * h, 2, 1, i % 3 ? r[1] : r[3]);
    for (let k = 0; k < 2; k++) {
      const bx = x + 10 + hash(seed * 3 + k) * (w - 40), by = y + 20 + hash(seed * 5 + k) * (h - 60);
      box(c, bx - 1, by - 1, 22, 12, r[1]);
      for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) box(c, bx + i * 10 + (j % 2) * 5, by + j * 4, 9, 3, j % 2 ? '#5A2E2A' : '#6E3A32');
    }
    for (let k = 0; k < 2; k++) {
      let cx = x + 16 + hash(seed + k * 7.7) * (w - 32), cy = y + hash(seed + k * 4.4) * h * 0.5;
      for (let s = 0; s < 14; s++) { box(c, cx, cy, 1, 3, r[0]); cx += hash(seed + s + k) > 0.5 ? 1 : -1; cy += 3; }
    }
  }
  // (grime up from the foot: stippled, darker lower)
  checker(c, x, y + h - 30, w, 14, r[1]);
  box(c, x, y + h - 16, w, 16, r[1]);
  checker(c, x, y + h - 8, w, 8, r[0]);
};

/**
 * A pointed (gothic) window at (x, y) w by h: inked, a stone surround lit at its upper left, mullions, its glass dark
 * (or lamplit after dark, by `glow`: dim, warm, stepped), a sill under it.
 */
export const gothicWindow = (c: Ctx, x: number, y: number, w: number, h: number, trim: string[], glass: string[]) => {
  const ar = Math.min(w * 0.6, h * 0.35);
  const outline = (dx: number): [number, number][] => [[x - dx, y + h + dx], [x - dx, y + ar], [x + w / 2, y - dx * 1.4], [x + w + dx, y + ar], [x + w + dx, y + h + dx]];
  poly(c, outline(3), INK);
  poly(c, outline(2), trim[2]);
  poly(c, [[x - 2, y + h + 2], [x - 2, y + ar], [x + w / 2, y - 3], [x + w / 2, y], [x, y + ar], [x, y + h + 2]], trim[3]);
  poly(c, outline(0), INK);
  poly(c, outline(-1), glass[1]);
  // (the glass: banded down it, the panes leaded)
  box(c, x + 1, y + ar, w - 2, (h - ar) * 0.4, glass[2]);
  box(c, x + 1, y + ar, 2, h - ar, glass[3]);
  box(c, x + w / 2 - 1, y + 2, 2, h - 2, INK);
  for (let yy = y + ar + 6; yy < y + h - 2; yy += 9) box(c, x + 1, yy, w - 2, 1, INK);
  // (the sill)
  box(c, x - 4, y + h + 2, w + 8, 4, INK); box(c, x - 3, y + h + 2, w + 6, 2, trim[4]); box(c, x - 3, y + h + 4, w + 6, 1, trim[1]);
};
