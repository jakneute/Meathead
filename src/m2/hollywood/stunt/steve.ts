// STUNTMAN STEVE, drawn at the land bosses' grade (Safari Artie's, Donnie Dracula's: adventure/river/artie.ts,
// spooky/donnie.ts): SNES pixel art, every material in its own ramp (light, base, shade, deep, line) in stepped bands with
// a dithered seam between them, every material outlined in its own darkest tone, lit from the upper left.
//
// A washed-up 80s stunt double, a Cliff Booth type gone to seed. The yellow stunt jumpsuit, faded, red racing stripes
// down the seams (a white pinstripe either side), a big pointed 70s collar, zipped to the sternum (gray chest hair out of
// it, a gold rope chain, a little gold horn on it); sweated through at the pits, the chest, under the gut; patches: a
// faded name stitch (STEVE), a flame on the shoulder, a lightning-bolt sponsor down the side, a spark-plug one on the
// gut; a ring worn white in the back pocket by a can of chew. The sleeves shoved up past the elbows: forearms like old
// saddles (tanned, hairy, shiny with forty years of baby oil), a blurry heart tattoo nobody can read, a fake gold watch.
// A gut over a tooled belt and a big gold S buckle. Worn black knee pads (the logo half peeled off), white stunt boots
// (a red flash down the side, a chrome strap, thick lugged soles, scuffed, a tire mark, the near toe duct-taped). A
// neck brace worn like jewelry (rhinestones glued round it, sweat-yellowed). A feathered mullet going gray (silver at
// the temples, streaks through the top, flipped out at the back), a horseshoe mustache, a broken-and-set nose, crow's
// feet, stubble, a gold tooth, a cigarette tucked behind his ear (lit, when the lightning's had him), a toothpick.
// Cheap gold aviators (a gradient lens, a reflection); off, a raccoon tan where they've always been.
//
// He comes apart as his health goes (look.damage 0..1, like Donnie): sweat through everything, grime, a nosebleed, a
// split lip, a lens cracked, a black eye coming up under it, the suit torn at the knee then the elbow (blood through),
// the brace knocked askew, the mullet singed, a tire track over the gut, the zip busted (more gut), the lens gone (the
// shiner in the empty frame), the brace snapped, a gash in the forehead, a tooth gone, blood dripping off him.
//
// drawSteve(c, x, feetY, facing, pose, frame, look): his feet at (x, feetY), facing +x unless facing is -1.
// drawSteveAsh / drawSteveBrace / drawStevePants: what's left of him (the lightning's ash pile with the aviators on
// top; the brace rolled off; the jumpsuit's legs, burning, off in the ring of fire).
//
// His last stunt's poses (the user's: slumped over the burning loop, stomach first; his pants burn off; headfirst to
// the pavement, missing the mat, landing awkwardly): 'drape' folded over the loop at the waist, 'plant' stood on his
// head (drawn the right way up: the fight turns him over), 'heap' where he came down. Their elbows and knees from
// art/limb.ts.

import { type Ctx } from '../../cast/kit';
import { smear, drip, cut, bloodFresh, bloodDark } from '../../../m1/game/render/player/gore';
import { elbow, knee, reachTo } from '../../art/limb';

export type StevePose =
  | 'idle' | 'thumb' | 'wave' | 'angry' | 'flail' | 'slip' | 'hurt' | 'zapped' | 'smoking' | 'towed' | 'getup'
  | 'sidestep' | 'struck' | 'tumble' | 'hoop' | 'down' | 'charred' | 'stagger' | 'brace' | 'drape' | 'plant' | 'heap';

export interface SteveLook {
  /** How singed (0..1: the lightning's left its mark). */
  singe?: number;
  /** The jumpsuit burned off below the waist: star-print briefs, pale hairy legs, the knee pads and boots still on. */
  pantsDown?: boolean;
  /** The aviators off (the raccoon tan where they go). */
  noShades?: boolean;
  /** His hair stood straight up (zapped). */
  frizz?: number;
  /** How beaten up: 0 (fresh) .. 1 (nearly dead). */
  damage?: number;
  /** The STEVE SIDESTEP, and his back goes mid-step: a hand to it, the face, the crick. */
  back?: boolean;
  /** The jumpsuit's legs catching on the loop (0..1): scorched from the knees up, going black, holes burned through,
   *  on fire (till they burn off: pantsDown). */
  scorch?: number;
  /** The neck brace off him (flown off on the landing). */
  noBrace?: boolean;
}

// ---------------------------------------------------------------------------------------------------------------
// Ramps: light, base, shade, deep, line

type Ramp = readonly [string, string, string, string, string];
/** The jumpsuit: stunt yellow, faded by forty summers. */
const SUIT_R: Ramp = ['#FEF3A0', '#F5C518', '#D9A30F', '#A87A08', '#4E3504'];
export const SUIT = SUIT_R[1], SUIT_LIT = SUIT_R[0], SUIT_DK = SUIT_R[2], STRIPE = '#DC2626';
const STRIPE_R: Ramp = ['#F87171', '#DC2626', '#B91C1C', '#7F1D1D', '#3B0A0A'];
/** Tanned to leather. */
const SKIN_R: Ramp = ['#F3BE90', '#D88C5A', '#B66B3F', '#8B4A2A', '#45200F'];
/** Where the sun's never been: his legs, the raccoon mask under the aviators. */
const PALE_R: Ramp = ['#FFF1E4', '#F6D7BF', '#E2B699', '#BC8F74', '#6E4B39'];
const HAIR_R: Ramp = ['#C99A62', '#9A6A36', '#774D24', '#563416', '#2A1808'];
const GRAY_R: Ramp = ['#F5F5F4', '#C9C2BA', '#A39A91', '#7A7169', '#3D3732'];
const STACHE_R: Ramp = ['#9C7550', '#6B4524', '#523318', '#38220E', '#1A0F05'];
const BOOT_R: Ramp = ['#FFFFFF', '#EFEDEA', '#D2CCC4', '#A9A197', '#55504A'];
/** The neck brace: foam, gone a bit yellow-gray. */
const BRACE_R: Ramp = ['#FFFFFF', '#F1F3F0', '#D5D9D0', '#A7AC9F', '#565A50'];
const PAD_R: Ramp = ['#6B6B73', '#3A3A40', '#28282D', '#19191C', '#060607'];
const BELT_R: Ramp = ['#B57A45', '#8A5428', '#6A3D1A', '#4A280E', '#211005'];
const BRIEFS_R: Ramp = ['#93C5FD', '#2563EB', '#1D4ED8', '#1E3A8A', '#0B1A45'];
const PATCH_R: Ramp = ['#FFFFFF', '#F4F1EA', '#D9D3C6', '#B0A897', '#4F4A40'];
/** Gold (the aviators, the buckle, the chain, the watch, the tooth): it survives everything, even the lightning. */
const GOLD: Ramp = ['#FEF9C3', '#FACC15', '#CA8A04', '#A16207', '#5A3A06'];
const TEETH = '#F4F1E6';

/** The materials, swapped wholesale: as he is, burned black (charred), or lit up like an x-ray (zapped). */
interface Pal { suit: Ramp; stripe: Ramp; skin: Ramp; pale: Ramp; hair: Ramp; gray: Ramp; stache: Ramp; boot: Ramp; brace: Ramp; pad: Ramp; belt: Ramp; briefs: Ramp; patch: Ramp }
const NORMAL: Pal = { suit: SUIT_R, stripe: STRIPE_R, skin: SKIN_R, pale: PALE_R, hair: HAIR_R, gray: GRAY_R, stache: STACHE_R, boot: BOOT_R, brace: BRACE_R, pad: PAD_R, belt: BELT_R, briefs: BRIEFS_R, patch: PATCH_R };
const SOOT: Ramp = ['#5C544E', '#2F2925', '#211C19', '#130F0D', '#000000'];
const SOOT_LT: Ramp = ['#7D756E', '#47403B', '#2E2824', '#1C1815', '#000000'];
const CHARRED: Pal = { suit: SOOT, stripe: SOOT, skin: SOOT, pale: SOOT, hair: SOOT_LT, gray: SOOT_LT, stache: SOOT, boot: SOOT_LT, brace: SOOT_LT, pad: SOOT, belt: SOOT, briefs: SOOT, patch: SOOT_LT };
const XR: Ramp = ['#EFFBFF', '#8FE3FF', '#3FC1EE', '#1A86BC', '#08466B'];
const XR_DK: Ramp = ['#9FE6FF', '#3FB4E6', '#2190C6', '#106A9A', '#052E48'];
const XRAY: Pal = { suit: XR, stripe: XR_DK, skin: XR, pale: XR, hair: XR_DK, gray: XR_DK, stache: XR_DK, boot: XR, brace: XR, pad: XR_DK, belt: XR_DK, briefs: XR_DK, patch: XR };
const BONE = '#F8FAFC';

let P: Pal = NORMAL;
let MODE: 'normal' | 'char' | 'xray' = 'normal';

// ---------------------------------------------------------------------------------------------------------------
// Painting helpers (Artie's, Donnie's)

const dithers = new Map<string, CanvasPattern | string>();
const dith = (c: Ctx, color: string): CanvasPattern | string => {
  let p = dithers.get(color);
  if (p) return p;
  if (typeof document === 'undefined') return color;
  const cv = document.createElement('canvas'); cv.width = 2; cv.height = 2;
  const g = cv.getContext('2d')!;
  g.fillStyle = color; g.fillRect(0, 0, 1, 1); g.fillRect(1, 1, 1, 1);
  p = c.createPattern(cv, 'repeat') ?? color;
  dithers.set(color, p);
  return p;
};
/** A shape in its ramp: the base, a lit band down its left, a shade then a deep band down its right, outlined. */
const shape = (c: Ctx, path: () => void, r: Ramp, x0: number, x1: number, lw = 1) => {
  c.beginPath(); path(); c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const w = x1 - x0;
  c.fillStyle = r[0]; c.fillRect(x0 - 4, -999, w * 0.16 + 4, 1998);
  c.fillStyle = dith(c, r[0]); c.fillRect(x0 + w * 0.16, -999, Math.max(1, w * 0.06), 1998);
  c.fillStyle = dith(c, r[2]); c.fillRect(x0 + w * 0.57, -999, Math.max(1, w * 0.07), 1998);
  c.fillStyle = r[2]; c.fillRect(x0 + w * 0.64, -999, w + 4, 1998);
  c.fillStyle = dith(c, r[3]); c.fillRect(x0 + w * 0.8, -999, Math.max(1, w * 0.06), 1998);
  c.fillStyle = r[3]; c.fillRect(x0 + w * 0.86, -999, w + 4, 1998);
  c.restore();
  c.beginPath(); path(); c.strokeStyle = r[4]; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
};
const fill = (c: Ctx, color: string | CanvasPattern, path: () => void) => { c.fillStyle = color; c.beginPath(); path(); c.fill(); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, color: string | CanvasPattern, rot = 0) => fill(c, color, () => c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2));
const px = (c: Ctx, x: number, y: number, w: number, h: number, color: string | CanvasPattern) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
const line = (c: Ctx, pts: number[], w: number, color: string | CanvasPattern, cap: CanvasLineCap = 'round') => {
  c.strokeStyle = color; c.lineWidth = w; c.lineCap = cap; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.stroke();
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const joint = (x1: number, y1: number, x2: number, y2: number, l1: number, l2: number, bend: number): [number, number] => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 0.001;
  const dd = Math.min(d, l1 + l2 - 0.01);
  const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / d, uy = dy / d;
  return [x1 + ux * a + uy * h * bend, y1 + uy * a - ux * h * bend];
};
/** A run of tube (an arm, a leg): outlines first, then the fills, a lit stripe up one side, a shade down the other. */
const tube = (c: Ctx, pts: number[], ws: number[], rs: Ramp[]) => {
  const n = pts.length / 2 - 1;
  for (let i = 0; i < n; i++) line(c, [pts[i * 2], pts[i * 2 + 1], pts[i * 2 + 2], pts[i * 2 + 3]], ws[i] + 2, rs[i][4]);
  for (let i = 0; i < n; i++) {
    const x1 = pts[i * 2], y1 = pts[i * 2 + 1], x2 = pts[i * 2 + 2], y2 = pts[i * 2 + 3], w = ws[i], r = rs[i];
    line(c, [x1, y1, x2, y2], w, r[1]);
    let nx = -(y2 - y1), ny = x2 - x1; const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    if (nx + ny * 0.6 < 0) { nx = -nx; ny = -ny; }
    const sh = w * 0.3, hl = w * 0.32;
    line(c, [x1 + nx * sh, y1 + ny * sh, x2 + nx * sh, y2 + ny * sh], w * 0.36, r[2]);
    line(c, [x1 - nx * hl, y1 - ny * hl, x2 - nx * hl, y2 - ny * hl], Math.max(0.6, w * 0.16), r[0]);
  }
};
const back = (r: Ramp): Ramp => [r[1], r[2], r[3], r[3], r[4]];
/** A little star (the briefs' print, a sparkle): a cross of pixels. */
const star = (c: Ctx, x: number, y: number, s: number, col: string) => { px(c, x - s, y - s * 0.3, s * 2, s * 0.6, col); px(c, x - s * 0.3, y - s, s * 0.6, s * 2, col); };

// ---------------------------------------------------------------------------------------------------------------
// Him: proportions

/** How tall he stands (feet to the top of the mullet). */
export const STEVE_H = 104;
const HIP_Y = -38;
/** Where the soles of his boots sit, from the ankle. */
const ANKLE = -7;
const THIGH = 16, SHIN = 16;
const SH_FAR: [number, number] = [-5, -63], SH_NEAR: [number, number] = [5, -62.6];
const UPPER = 12.4, FORE = 12.2, REACH = UPPER + FORE - 0.3;
/** The middle of his head, in the upper body's space. */
const HEAD_X = 2.5, HEAD_Y = -91.4;

type Hand = 'fist' | 'thumb' | 'open' | 'claw' | 'flag' | 'hip' | 'grip' | 'back' | 'knee';
type Mood = 'smug' | 'grin' | 'shout' | 'mad' | 'scared' | 'zap' | 'ouch' | 'cough' | 'strain' | 'dead' | 'cool';
interface Arm { sx: number; sy: number; ex: number; ey: number; hx: number; hy: number }
/** A leg: hip, knee, ankle (x, y each), the boot's turn. */
type LegP = [number, number, number, number, number, number, number];
interface Rig {
  legs: [LegP, LegP]; drop: number; lean: number; bob: number;
  far: Arm; near: Arm; fk: Hand; nk: Hand;
  /** The head's nudge off its spot, and its nod. */
  head: [number, number, number]; mood: Mood;
  braceOff?: [number, number];
}

const solve = (sx: number, sy: number, tx: number, ty: number, ux: number, uy: number): Arm => {
  let dx = tx - sx, dy = ty - sy;
  const dist = Math.hypot(dx, dy) || 0.001;
  const k = dist > REACH ? REACH / dist : dist < 5 ? 5 / dist : 1;
  dx *= k; dy *= k;
  const hx = sx + dx, hy = sy + dy, mx = sx + dx / 2, my = sy + dy / 2;
  const a = joint(sx, sy, hx, hy, UPPER, FORE, 1), b = joint(sx, sy, hx, hy, UPPER, FORE, -1);
  const [ex, ey] = (a[0] - mx) * ux + (a[1] - my) * uy >= (b[0] - mx) * ux + (b[1] - my) * uy ? a : b;
  return { sx, sy, ex, ey, hx, hy };
};
/** A leg from its hip to an ankle, the knee found (bend 1: forward). */
const lg = (hx: number, ax: number, ay: number, bend: number, rot: number, drop: number): LegP => {
  const hy = HIP_Y + drop; const [kx, ky] = joint(hx, hy, ax, ay, THIGH, SHIN, bend);
  return [hx, hy, kx, ky, ax, ay, rot];
};
/** A leg with its knee put where it's wanted. */
const lk = (hx: number, kx: number, ky: number, ax: number, ay: number, rot: number, drop = 0): LegP => [hx, HIP_Y + drop, kx, ky, ax, ay, rot];
/** A point in his leg space, in his upper body's (which drops and leans about the hips). */
const toUpper = (wx: number, wy: number, drop: number, lean: number): [number, number] => {
  const y = wy - drop - HIP_Y, cs = Math.cos(-lean), sn = Math.sin(-lean);
  return [wx * cs - y * sn, wx * sn + y * cs + HIP_Y];
};

/** A point in his upper body's space, in his leg space (toUpper the other way). */
const fromUpper = (ux: number, uy: number, drop: number, lean: number): [number, number] => {
  const y = uy - HIP_Y, cs = Math.cos(lean), sn = Math.sin(lean);
  return [ux * cs - y * sn, ux * sn + y * cs + HIP_Y + drop];
};
/** An arm to a hand, the elbow from limb.ts (his own space faces +x). */
const armTo = (sx: number, sy: number, tx: number, ty: number): Arm => {
  const [hx, hy] = reachTo(sx, sy, tx, ty, UPPER, FORE), [ex, ey] = elbow(sx, sy, hx, hy, UPPER, FORE, 1);
  return { sx, sy, ex, ey, hx, hy };
};
/** A leg from its hip to an ankle, the knee from limb.ts, the boot turned along the shin (and `toe` more). */
const legTo = (hx: number, tx: number, ty: number, drop: number, toe = 0): LegP => {
  const hy = HIP_Y + drop, [ax, ay] = reachTo(hx, hy, tx, ty, THIGH, SHIN), [kx, ky] = knee(hx, hy, ax, ay, THIGH, SHIN, 1);
  const ul = Math.hypot(kx - ax, ky - ay) || 1;
  return [hx, hy, kx, ky, ax, ay, Math.atan2((kx - ax) / ul, -(ky - ay) / ul) + toe];
};

const rig = (pose: StevePose, f: number, L: SteveLook): Rig => {
  const far = (x: number, y: number, ux: number, uy: number) => solve(SH_FAR[0], SH_FAR[1], x, y, ux, uy);
  const near = (x: number, y: number, ux: number, uy: number) => solve(SH_NEAR[0], SH_NEAR[1], x, y, ux, uy);
  const stand = (drop = 0): [LegP, LegP] => [lg(-4, -8, ANKLE, 1, 0, drop), lg(4, 9, ANKLE, 1, 0, drop)];
  const breathe = Math.sin(f * 0.06) * 0.6;
  const onHip = far(-12, -44, -1, -0.2);
  switch (pose) {
    case 'thumb': case 'charred':
      // (the thumb up, the grin: the gold tooth catches the light)
      return { legs: stand(), drop: 0, lean: -0.08, bob: breathe, far: onHip, near: near(19, -74, 0, 1), fk: 'hip', nk: 'thumb', head: [0, 0, -0.08], mood: 'grin' };
    case 'wave': {
      // (waving the checkered flag over his head: whistling the tow car over)
      const k = Math.sin(f * 0.35);
      return { legs: stand(), drop: 0, lean: -0.04, bob: breathe, far: onHip, near: near(13 + k * 4, -90, 1, 0.3), fk: 'hip', nk: 'flag', head: [0, 0, -0.12], mood: 'shout' };
    }
    case 'angry': {
      // (both fists up, shaking; stamping a boot)
      const k = Math.sin(f * 0.8) * 2.4, st = Math.max(0, Math.sin(f * 0.4)) * 5;
      return { legs: [lg(-4, -8, ANKLE, 1, 0, 0), lg(4, 10, ANKLE - st, 1, -st * 0.04, 0)], drop: 0, lean: 0.08, bob: 0, far: far(-13, -76 + k, -1, 0.5), near: near(20, -78 - k, 1, 0.5), fk: 'fist', nk: 'fist', head: [0, 0, 0.05], mood: 'mad' };
    }
    case 'flail': {
      // (windmilling, going over backward)
      const t = f * 0.3, k = Math.sin(f * 0.6) * 4;
      return {
        legs: [lg(-4, -9 + k, ANKLE, 1, 0, 2), lg(4, 9 - k, ANKLE - Math.max(0, -k), 1, 0, 2)], drop: 2, lean: -0.18 + Math.sin(t) * 0.05, bob: 0,
        far: far(-5 + Math.cos(t) * 21, -63 + Math.sin(t) * 21, -1, 0), near: near(5 + Math.cos(t + Math.PI) * 21, -63 + Math.sin(t + Math.PI) * 21, 1, 0),
        fk: 'open', nk: 'open', head: [0, 0, -0.15], mood: 'scared',
      };
    }
    case 'slip':
      // (squirted out of the grab: up in the air, ta-da, jazz hands, a knee up)
      return { legs: [lg(-4, -6, ANKLE + 1, 1, 0.5, 0), lk(4, 19.5, -42, 17, -26, 0.3)], drop: 0, lean: -0.12, bob: 0, far: far(-15, -90, -1, 0.3), near: near(19, -90, 1, 0.3), fk: 'open', nk: 'open', head: [0, 0, -0.1], mood: 'grin' };
    case 'hurt':
      return { legs: [lg(-4, -6, ANKLE, 1, 0, 3), lg(4, 7, ANKLE, 1, 0, 3)], drop: 3, lean: -0.22, bob: 0, far: far(-15, -78, -1, 0.6), near: near(16, -80, 1, 0.6), fk: 'open', nk: 'open', head: [-1, 1, -0.25], mood: 'ouch' };
    case 'zapped':
      // (stiff as a board, spread out, every finger out)
      return { legs: [lg(-4, -14, ANKLE, 1, -0.1, 0), lg(4, 15, ANKLE, 1, 0.1, 0)], drop: 0, lean: 0, bob: 0, far: far(-25, -82, -1, 0.3), near: near(27, -84, 1, 0.3), fk: 'open', nk: 'open', head: [0, -1, 0], mood: 'zap' };
    case 'smoking': {
      // (bent over, hands on his knees, coughing up smoke)
      const drop = 5, lean = 0.42, legs: [LegP, LegP] = [lg(-4, -7, ANKLE, 1, 0, drop), lg(4, 9, ANKLE, 1, 0, drop)];
      const [fx, fy] = toUpper(legs[0][2] + 1, legs[0][3] - 2, drop, lean), [nx, ny] = toUpper(legs[1][2] + 1.5, legs[1][3] - 2, drop, lean);
      return { legs, drop, lean, bob: Math.sin(f * 0.5) * 0.8, far: far(fx, fy, 0, 1), near: near(nx, ny, 0, 1), fk: 'knee', nk: 'knee', head: [2, 1, -0.45], mood: 'cough' };
    }
    case 'getup': {
      // (up off the floor: a knee down on it, a hand pushing off the other knee, a hand flat on the floor)
      const drop = 16, lean = 0.5, legs: [LegP, LegP] = [lk(-4, 2, -4.6, -13, -6.4, 1.45, drop), lg(4, 13, ANKLE, 1, 0, drop)];
      const [nx, ny] = toUpper(legs[1][2] + 1, legs[1][3] - 2.4, drop, lean), [fx, fy] = toUpper(22, -1.5, drop, lean);
      return { legs, drop, lean, bob: 0, far: far(fx, fy, 0, -1), near: near(nx, ny, 0, 1), fk: 'knee', nk: 'knee', head: [2, 0, -0.5], mood: 'strain' };
    }
    case 'sidestep':
      if (L.back) {
        // (mid-step, and his back's gone: hunched, a hand round to it, the other out for balance)
        return { legs: [lg(-4, -17, ANKLE, 1, -0.1, 6), lg(4, 15, ANKLE, 1, 0.1, 6)], drop: 6, lean: 0.28, bob: 0, far: far(-22, -70, -1, 0.4), near: near(-14, -46, 0, 1), fk: 'open', nk: 'back', head: [0, 0, 0.1], mood: 'ouch' };
      }
      // (THE STEVE SIDESTEP: one big step out of the car's way, arms out like a matador, cool as you like)
      return { legs: [lg(-4, -17, ANKLE, 1, -0.1, 4), lg(4, 17, ANKLE, 1, 0.1, 4)], drop: 4, lean: -0.05, bob: 0, far: far(-24, -58, -1, 0.4), near: near(24, -62, 1, 0.4), fk: 'open', nk: 'open', head: [0, 0, -0.05], mood: 'cool' };
    case 'stagger': {
      // (out to center stage on his last legs: knees gone soft, feet dragging, arms out for balance, the face screwed up)
      const s = Math.sin(f * 0.22), drop = 6;
      return {
        legs: [lg(-4, -7 + s * 7, ANKLE - Math.max(0, s) * 3, 1, 0, drop), lg(4, 8 - s * 7, ANKLE - Math.max(0, -s) * 3, 1, 0, drop)], drop, lean: 0.16, bob: Math.abs(s) * 1.4,
        far: far(-23, -54 + s * 5, -1, 0.5), near: near(23, -56 - s * 5, 1, 0.5), fk: 'open', nk: 'open', head: [1, 1, 0.18 + s * 0.06], mood: 'strain',
      };
    }
    case 'brace':
      // (putting his neck brace straight for the crowd, both hands to it, chin up: composure)
      return { legs: stand(2), drop: 2, lean: -0.04, bob: 0, far: far(-3, -77, -1, 0.4), near: near(9, -78, 1, 0.4), fk: 'grip', nk: 'grip', head: [0, -1, -0.2], mood: 'strain' };
    case 'tumble': case 'struck':
      return { legs: [lk(-4, -14, -26, -20, -12, -0.8), lk(4, 15, -30, 23, -19, 0.6)], drop: 0, lean: 0, bob: 0, far: far(-20, -88, -1, 0.3), near: near(24, -86, 1, 0.3), fk: 'open', nk: 'open', head: [0, 0, 0], mood: pose === 'struck' ? 'ouch' : 'scared' };
    case 'hoop': {
      // (stuck in the burning hoop at the waist: kicking, flapping)
      const k = Math.sin(f * 0.7);
      return { legs: [lk(-4, -6 + k * 4, -23, -9 - k * 6, -9, 0.3), lk(4, 9 - k * 4, -24, 11 + k * 6, -10, 0.2)], drop: 0, lean: 0, bob: 0, far: far(-25, -66 + k * 10, -1, 0.3), near: near(27, -68 - k * 10, 1, 0.3), fk: 'open', nk: 'open', head: [0, 0, -0.1], mood: 'scared' };
    }
    case 'towed': {
      // (on his belly, drawn in his own upright space and laid down: fists out over his head on the rope, chin up,
      //  heels kicking)
      const k = Math.sin(f * 0.5) * 3;
      return {
        legs: [lk(-4, -1, -22, -12 + k, -12, 0.5), lk(4, 3, -22, -10 - k, -10, 0.5)], drop: 0, lean: 0, bob: 0,
        far: far(3, -87, -1, 0), near: near(7, -86, 1, 0), fk: 'grip', nk: 'grip', head: [-7, 6, -1.25], mood: 'scared', braceOff: [-3.5, 3],
      };
    }
    case 'down': {
      // (face down, laid out; a leg twitching)
      const tw = Math.sin(f * 0.6) > 0.8 ? 1 : 0;
      return { legs: [lg(-4, 8, ANKLE, 1, 0, 0), lg(4, 10 - tw * 6, ANKLE - tw * 3, 1, -tw * 0.4, 0)], drop: 0, lean: 0, bob: 0, far: far(-2, -42, -1, 0), near: near(16, -50, 1, 0), fk: 'knee', nk: 'open', head: [4, 3, 0.25], mood: 'dead', braceOff: [2, 1] };
    }
    case 'drape': {
      // (slumped over the burning loop, stomach first: folded at the waist over it (the loop's in the fold, (-4, -24)
      //  here), the legs hanging down behind it, the top half down the front, the arms and the head dangling; a limp sway)
      const drop = 0, lean = 2.45, sw = Math.sin(f * 0.07) * 1.5;
      const legs: [LegP, LegP] = [legTo(-4, -17 + sw, -2, drop, 0.35), legTo(4, -11 + sw, 0, drop, 0.25)];
      // (the arms straight down off the shoulders, wherever the lean's put those)
      const hang = (sh: readonly [number, number], dx: number) => {
        const [wx, wy] = fromUpper(sh[0], sh[1], drop, lean), [ux, uy] = toUpper(wx + dx + sw, wy + REACH - 1, drop, lean);
        return armTo(sh[0], sh[1], ux, uy);
      };
      return { legs, drop, lean, bob: 0, far: hang(SH_FAR, -2), near: hang(SH_NEAR, 2), fk: 'open', nk: 'open', head: [0, 2, 0.45], mood: L.pantsDown ? 'strain' : 'ouch', braceOff: [0, 1] };
    }
    case 'plant':
      // (headfirst into the pavement, stood on it: stiff as a post, the arms flopped out past his head, the legs
      //  straight and apart, the head pushed down into the neck)
      return {
        legs: [legTo(-4, -10, ANKLE, 0), legTo(4, 12, ANKLE, 0)], drop: 0, lean: 0.05, bob: 0,
        far: armTo(SH_FAR[0], SH_FAR[1], -17, -82), near: armTo(SH_NEAR[0], SH_NEAR[1], 19, -84), fk: 'open', nk: 'open', head: [0, 2, 0.35], mood: 'dead', braceOff: [0, -2],
      };
    case 'heap': {
      // (where he came down, laid out face down as 'down' is: the head folded under him at the neck (the crown on the
      //  floor), the gut propping him up, the knees bent and both boots up in the air, one flopped over the other; an
      //  arm flung out toward the mat he missed; a boot twitching)
      const tw = Math.sin(f * 0.6) > 0.85 ? 1 : 0;
      return {
        legs: [legTo(-4, -7, -27, 0, -0.1), legTo(4, tw, -22 - tw * 2, 0, 0.3)], drop: 0, lean: 0, bob: 0,
        far: armTo(SH_FAR[0], SH_FAR[1], 4, -40), near: armTo(SH_NEAR[0], SH_NEAR[1], 12, -86), fk: 'open', nk: 'open', head: [4, 8, 1.3], mood: 'dead', braceOff: [3, -2],
      };
    }
    default:
      // (idle: a cocky wide stance, chest out, a fist on his hip, a thumb hooked in his belt by the buckle, the toothpick going)
      return { legs: [lg(-4, -9, ANKLE, 1, 0, 0), lg(4, 10, ANKLE, 1, 0, 0)], drop: 0, lean: -0.05, bob: breathe, far: onHip, near: near(8, -42, -1, 0), fk: 'hip', nk: 'hip', head: [0, 0, -0.06], mood: 'smug' };
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The whole of him

export const drawSteve = (c: Ctx, x: number, feetY: number, facing: 1 | -1, pose: StevePose, f: number, look: SteveLook = {}) => {
  const charred = pose === 'charred';
  MODE = charred ? 'char' : pose === 'zapped' && f % 4 < 2 ? 'xray' : 'normal';
  P = MODE === 'char' ? CHARRED : MODE === 'xray' ? XRAY : NORMAL;
  // (charred: the aviators come through it whole; nothing else matters now)
  const d = charred ? 0.3 : Math.max(0, Math.min(1, look.damage ?? 0));
  const L: SteveLook = charred ? { ...look, frizz: 1, noShades: false } : look;
  const R = rig(pose, f, L);
  c.save();
  c.translate(Math.round(x), Math.round(feetY));
  c.scale(facing, 1);
  c.save();
  if (pose === 'zapped') c.translate(f % 2 ? 1.5 : -1.5, 0);
  if (pose === 'tumble' || pose === 'struck') { c.translate(0, -50); c.rotate(pose === 'struck' ? -0.5 : f * 0.25); c.translate(0, 50); }
  else if (pose === 'towed') { c.translate(-2.5, -19); c.rotate(Math.PI / 2); c.translate(0, -HIP_Y); }
  else if (pose === 'down' || pose === 'heap') { c.translate(-8, -18); c.rotate(Math.PI / 2 + 0.06); c.translate(0, -HIP_Y); }
  figure(c, R, pose, f, d, L);
  c.restore();
  aftermath(c, pose, f, L, R);
  c.restore();
  MODE = 'normal'; P = NORMAL;
};

const figure = (c: Ctx, R: Rig, pose: StevePose, f: number, d: number, L: SteveLook) => {
  const bare = !!L.pantsDown;
  const sc = bare ? 0 : L.scorch ?? 0;
  drawLeg(c, R.legs[0], false, d, bare, f, sc);
  drawLeg(c, R.legs[1], true, d, bare, f, sc);
  c.save();
  c.translate(0, R.drop + R.bob);
  c.translate(0, HIP_Y); c.rotate(R.lean); c.translate(0, -HIP_Y);
  drawArm(c, R.far, false, R.fk, d, f);
  drawBody(c, f, d, L, bare);
  const late = R.near.hy < -72;
  if (!late) drawArm(c, R.near, true, R.nk, d, f);
  const [hdx, hdy, nod] = R.head, bo = R.braceOff ?? [0, 0];
  if (!L.noBrace) { c.save(); c.translate(bo[0], bo[1]); drawBrace(c, d, f); c.restore(); }
  c.save(); c.translate(HEAD_X + hdx, HEAD_Y + hdy); c.rotate(nod); drawHead(c, R.mood, f, d, L, pose); c.restore();
  if (late) drawArm(c, R.near, true, R.nk, d, f);
  if (pose === 'sidestep' && L.back) crick(c, f);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Legs: the jumpsuit's (a stripe down each), the knee pads, the boots; or bare (pale, hairy, star-print briefs)

const drawLeg = (c: Ctx, G: LegP, near: boolean, d: number, bare: boolean, f: number, scorch = 0) => {
  const [hx, hy, kx, ky, ax, ay, rot] = G;
  const N = MODE === 'normal';
  if (bare) {
    const sk = near ? P.pale : back(P.pale);
    tube(c, [hx, hy, kx, ky, ax, ay], [9.6, 7.8], [sk, sk]);
    if (N) for (let i = 0; i < 6; i++) {
      const k = 0.15 + i * 0.13;
      px(c, lerp(kx, ax, k) + (i % 2 ? 1.2 : -1.6), lerp(ky, ay, k), 0.5, 1.2, P.hair[3]);
      px(c, lerp(hx, kx, 0.35 + i * 0.1) + (i % 2 ? 1.8 : -2), lerp(hy, ky, 0.35 + i * 0.1), 0.5, 1, P.hair[3]);
    }
    // (the briefs' leg round the top of the thigh, a star on it)
    const br = near ? P.briefs : back(P.briefs);
    tube(c, [hx, hy - 1, lerp(hx, kx, 0.28), lerp(hy, ky, 0.28)], [11.4], [br]);
    if (N && near) star(c, lerp(hx, kx, 0.16), lerp(hy, ky, 0.16), 0.9, '#FFFFFF');
  } else {
    const su = near ? P.suit : back(P.suit), st = near ? P.stripe : back(P.stripe);
    tube(c, [hx, hy, kx, ky, ax, ay], [10.6, 9], [su, su]);
    // (the racing stripe down the outside seam, a white pinstripe either side of it)
    line(c, [hx - 1.6, hy + 2, kx - 1.6, ky, ax - 1.4, ay - 4], 0.5, P.patch[near ? 1 : 2]);
    line(c, [hx + 1.6, hy + 2, kx + 1.6, ky, ax + 1.4, ay - 4], 0.5, P.patch[near ? 1 : 2]);
    line(c, [hx, hy + 2, kx, ky, ax, ay - 4], 2.4, st[1]);
    line(c, [hx - 0.6, hy + 2, kx - 0.6, ky, ax - 0.6, ay - 4], 0.5, st[0]);
    // (the crease behind the knee; the seat's fold)
    line(c, [kx - 3, ky + 1.4, kx - 0.6, ky + 0.2], 0.6, su[3]);
    // (torn at the knee, above the pad: skin and blood through it)
    if (near && N && d >= 0.45) {
      const tx = lerp(kx, hx, 0.3), ty = lerp(ky, hy, 0.3);
      fill(c, su[4], () => { c.moveTo(tx - 3, ty - 1.2); c.lineTo(tx + 0.6, ty - 2.4); c.lineTo(tx + 3, ty + 0.4); c.lineTo(tx + 0.4, ty + 2.4); c.lineTo(tx - 2.6, ty + 1.4); c.closePath(); });
      fill(c, P.skin[1], () => { c.moveTo(tx - 2.2, ty - 0.8); c.lineTo(tx + 0.5, ty - 1.6); c.lineTo(tx + 2.2, ty + 0.4); c.lineTo(tx + 0.3, ty + 1.6); c.lineTo(tx - 1.9, ty + 1); c.closePath(); });
      cut(c, tx - 1, ty, tx + 1.2, ty + 0.4);
      if (d >= 0.7) drip(c, tx + 0.6, ty + 1, 2 + d * 3);
    }
    // (catching on the loop: soot up the shin, then the thigh, dithered in then solid; then holes burned through to
    // his pale legs, rimmed in embers)
    if (scorch > 0 && N) {
      const soot = '#1C1917';
      if (scorch > 0.15) line(c, [kx, ky, ax, ay - 4], 8, scorch > 0.4 ? soot : dith(c, soot));
      if (scorch > 0.4) line(c, [hx, hy + 2, kx, ky], 9.4, scorch > 0.65 ? soot : dith(c, soot));
      if (scorch > 0.6) for (let i = 0; i < 3; i++) {
        const k = 0.25 + i * 0.3, bx = i === 1 ? lerp(kx, ax, 0.4) : lerp(hx, kx, k), by = i === 1 ? lerp(ky, ay, 0.4) : lerp(hy, ky, k);
        const r = 1.2 + (scorch - 0.6) * 4;
        ell(c, bx, by, r + 0.7, r * 0.8 + 0.6, (f + i * 3) % 6 < 3 ? '#F97316' : '#B91C1C'); ell(c, bx, by, r, r * 0.8, P.pale[2]);
      }
    }
  }
  kneePad(c, kx, ky, ax, ay, near);
  boot(c, ax, ay, rot, near, d, f);
  if (MODE === 'xray') { line(c, [hx, hy, kx, ky, ax, ay], 2.2, BONE); ell(c, kx, ky, 1.8, 1.8, BONE); }
};

/** The knee pad: worn black, strapped on, scuffed gray, the logo (a white star) half peeled off. */
const kneePad = (c: Ctx, kx: number, ky: number, ax: number, ay: number, near: boolean) => {
  const r = near ? P.pad : back(P.pad);
  c.save(); c.translate(kx, ky); c.rotate(Math.atan2(ay - ky, ax - kx) - Math.PI / 2);
  px(c, -5, -4.8, 9.6, 1.4, r[4]); px(c, -5, 3.6, 9.6, 1.4, r[4]);
  px(c, -4.8, -4.6, 9.2, 0.9, r[3]); px(c, -4.8, 3.8, 9.2, 0.9, r[3]);
  shape(c, () => c.ellipse(1.6, 0.4, 3.9, 4.6, 0, 0, Math.PI * 2), r, -2.3, 5.5, 0.8);
  line(c, [0.4, -2.4, 2.8, -0.6], 0.6, r[0]);              // the scuff
  line(c, [1, -3.4, 2.2, -1.2, 1.6, 0.8], 0.4, r[4]);      // a crack in it
  if (MODE === 'normal') { px(c, 2.4, 1.4, 1, 1, '#D4D4D8'); px(c, 3.2, 2, 0.6, 0.6, '#A1A1AA'); px(c, 2, 2.4, 0.5, 0.5, '#A1A1AA'); }
  c.restore();
};

/** A white stunt boot, its ankle at (x, y), toe forward. */
const boot = (c: Ctx, x: number, y: number, rot: number, near: boolean, d: number, f: number) => {
  const r = near ? P.boot : back(P.boot), N = MODE === 'normal', st = P.stripe;
  c.save(); c.translate(x, y); c.rotate(rot);
  const path = () => { c.moveTo(-4.8, -10.4); c.lineTo(4.2, -10.4); c.lineTo(4.6, -2.4); c.quadraticCurveTo(10.6, -2, 11, 2.4); c.lineTo(10.8, 4.6); c.lineTo(-5.2, 4.6); c.lineTo(-5.4, -2); c.closePath(); };
  shape(c, path, r, -5.4, 11, 0.9);
  // (the cuff at the top, a red band round it)
  px(c, -4.4, -10, 8.4, 1.6, r[2]); line(c, [-4.6, -8, 4.2, -8], 1, st[1], 'butt');
  // (the red flash down the side, heel to toe)
  line(c, [-4.8, -4, 0.6, -5, 4.6, -0.6, 9.6, 1.2], 1.2, st[1]); line(c, [-4.8, -4.7, 0.6, -5.7], 0.4, st[0]);
  // (the ankle strap, its chrome buckle)
  px(c, -5, -7, 9.4, 1.4, r[3]); px(c, 1.6, -7.4, 2, 2.2, '#9CA3AF'); px(c, 2, -7, 1.2, 1.4, r[1]);
  // (the sole: thick, lugged, worn down at the heel)
  px(c, -5.6, 4.4, 16.8, 2.2, '#2A2A2E'); px(c, -5.6, 4.4, 16.8, 0.5, '#52525B');
  for (let i = 0; i < 5; i++) px(c, -4.6 + i * 3.2, 6, 1.6, 0.6, '#0E0E10');
  if (N) {
    // (scuffed: gray drags over the toe, a black tire mark across the side)
    line(c, [6, -0.4, 9, 1], 0.6, '#A8A29E'); line(c, [3, 1.6, 6.4, 2.4], 0.5, '#A8A29E');
    line(c, [-4, -3, -1, -1.4, 2, -2.6], 0.8, 'rgba(30, 30, 30, 0.5)');
    // (the near toe duct-taped, peeling)
    if (near) { c.save(); c.translate(7.6, 0.8); c.rotate(0.5); px(c, -1.8, -1.2, 3.6, 2.6, '#C7CBD1'); px(c, -1.8, -1.2, 3.6, 0.5, '#E5E7EB'); px(c, 1.2, 1, 1, 0.6, '#9CA3AF'); c.restore(); }
    // (beaten: the sole coming away at the toe, flapping)
    if (near && d >= 0.5) { const fl = Math.abs(Math.sin(f * 0.3)) * 1.4; fill(c, '#0B0B0D', () => { c.moveTo(4, 4.6); c.lineTo(11, 4.4); c.lineTo(11, 5.2 + fl); c.closePath(); }); }
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The body: the jumpsuit over the gut, the patches, the open collar (chest hair, the chain), the zip, the belt, the S

/** How far out the front of him is at height y (the chest, the gut): for the zip. */
const FRONT: [number, number][] = [[-70, 3], [-66, 8], [-62, 12], [-58, 15.3], [-54, 17.4], [-50, 18.5], [-46, 18.4], [-43, 17], [-40, 14.2], [-37.5, 8]];
const frontAt = (y: number) => {
  if (y <= FRONT[0][0]) return FRONT[0][1];
  for (let i = 1; i < FRONT.length; i++) if (y <= FRONT[i][0]) { const [y0, x0] = FRONT[i - 1], [y1, x1] = FRONT[i]; return lerp(x0, x1, (y - y0) / (y1 - y0)); }
  return FRONT[FRONT.length - 1][1];
};
const zx = (y: number) => frontAt(y) - 2.6;

const torsoPath = (c: Ctx) => {
  c.moveTo(-5, -69.5); c.quadraticCurveTo(-13, -69, -13.4, -59);
  c.lineTo(-13, -45); c.quadraticCurveTo(-13, -37.4, -6, -37);
  c.lineTo(4, -37.2); c.bezierCurveTo(12, -37.4, 18.5, -41.5, 18.6, -48);
  c.bezierCurveTo(18.6, -55, 15.4, -61, 10, -64.6); c.quadraticCurveTo(7, -69.5, 3, -70); c.closePath();
};

const drawBody = (c: Ctx, f: number, d: number, L: SteveLook, bare: boolean) => {
  const N = MODE === 'normal', S = P.suit;
  shape(c, () => torsoPath(c), S, -13.4, 18.6);
  c.save(); c.beginPath(); torsoPath(c); c.clip();
  // (the gut: its underside in shade, the fold where it meets the chest, a shine on its peak)
  ell(c, 8, -37.6, 14, 4.8, dith(c, S[3])); ell(c, 8, -37, 12, 3.4, S[3]);
  ell(c, 14.2, -51, 2.6, 4.6, dith(c, S[0])); ell(c, 14, -52, 1.4, 2.8, S[0]);
  line(c, [3, -61, 9, -62, 13.6, -59.6], 0.7, S[2]);
  // (the side seam: the racing stripe, a white pinstripe down each side)
  line(c, [-5.2, -70, -4.6, -54, -3.6, -36], 0.6, P.patch[1]); line(c, [-1.6, -70, -1, -54, 0, -36], 0.6, P.patch[1]);
  line(c, [-3.4, -70, -2.8, -54, -1.8, -36], 2.8, P.stripe[1]); line(c, [-4, -70, -3.4, -54, -2.4, -36], 0.6, P.stripe[0]);
  // (the back pocket, a ring worn white in it by a can of chew)
  px(c, -13.4, -47.4, 6.4, 0.6, S[4]); line(c, [-7, -47.4, -7, -41.6, -13.4, -41.6], 0.5, S[4]);
  c.beginPath(); c.arc(-10.2, -44.4, 2.1, 0, Math.PI * 2); c.strokeStyle = S[0]; c.lineWidth = 0.7; c.stroke();
  c.beginPath(); c.arc(-10.2, -44.4, 1.5, 0, Math.PI * 2); c.strokeStyle = S[2]; c.lineWidth = 0.4; c.stroke();
  if (N) {
    // (sweated through: the pits, the chest, down the back, under the gut; a dithered rim round each)
    const sw = 0.65 + d * 0.7;
    for (const [sx, sy, rx, ry] of [[-6, -61, 3.2, 4.4], [-11, -52, 2.4, 7], [9, -39.5, 7, 2.6], [6, -66, 3, 1.8]] as const) {
      ell(c, sx, sy, rx * sw, ry * sw, dith(c, S[2])); ell(c, sx, sy, rx * sw * 0.72, ry * sw * 0.72, S[2]);
    }
    // (grime: the floor of every stunt he's taken today)
    const grime = 'rgba(92, 70, 40, 0.3)';
    if (d >= 0.2) { ell(c, -8, -48, 3, 2, grime); ell(c, 12, -45, 2.6, 1.6, grime); }
    if (d >= 0.4) { ell(c, 4, -58, 2.4, 1.4, grime); ell(c, -2, -42, 3.4, 1.8, grime); }
    // (a tire track over the gut: a car's been over him)
    if (d >= 0.5) for (let i = 0; i < 6; i++) { const ty = -56 + i * 2.6; px(c, lerp(2, 9, i / 6), ty, 6, 1.2, 'rgba(24, 24, 27, 0.5)'); }
  }
  // (singed: soot over the suit where the lightning went through him)
  if (L.singe && MODE === 'normal') { c.fillStyle = `rgba(28, 25, 23, ${(0.4 * L.singe).toFixed(2)})`; c.fillRect(-16, -72, 36, 38); ell(c, 2, -50, 6 * L.singe, 9 * L.singe, dith(c, '#1C1917')); }
  if (N) patches(c);
  // The collar open to the sternum: the chest (tanned), the hair out of it, the chain
  const vx = zx(-60);
  const V = () => { c.moveTo(4.4, -70); c.lineTo(vx, -60); c.lineTo(frontAt(-63) + 2, -63); c.lineTo(frontAt(-69) + 2, -70.6); c.closePath(); };
  shape(c, V, P.skin, 4.4, frontAt(-63));
  // (the big pointed 70s collar, lying open over it)
  shape(c, () => { c.moveTo(-3.4, -70.4); c.lineTo(5.6, -62.4); c.lineTo(7, -66.2); c.lineTo(4.2, -70.6); c.closePath(); }, S, -3.4, 7, 0.7);
  // (the zip, brass, down the front of the gut to the belt; busted open low, more gut out of it)
  for (let y = -60; y < -42; y += 1.3) px(c, zx(y) - 0.5, y, 1, 0.7, Math.round(y / 1.3) % 2 ? GOLD[2] : GOLD[3]);
  const bust = d >= 0.6;
  if (bust) {
    const top = -55, bot = -42.6, mid = (top + bot) / 2, w = 2.6 + (d - 0.6) * 4;
    const gap = () => { c.moveTo(zx(top), top); c.quadraticCurveTo(zx(mid) - w, mid, zx(bot) - 0.6, bot); c.quadraticCurveTo(zx(mid) + w * 0.9, mid, zx(top), top); c.closePath(); };
    shape(c, gap, P.skin, zx(mid) - w, zx(mid) + w, 0.8);
    if (N) {
      ell(c, zx(-47) + 0.4, -47, 0.8, 0.6, P.skin[4]);
      for (let i = 0; i < 6; i++) px(c, zx(mid) - 1 + ((i * 2.3) % 2.6), -53 + i * 1.6, 0.4, 1, P.gray[2]);
    }
  }
  // (the belt: tooled brown leather, the loops; burned off with the trousers, if they're gone)
  if (!bare) {
    px(c, -14, -41.8, 34, 4.8, P.belt[4]); px(c, -14, -41.2, 34, 3.6, P.belt[1]); px(c, -14, -41.2, 34, 0.8, P.belt[0]); px(c, -14, -38.4, 34, 0.8, P.belt[2]);
    for (let i = 0; i < 8; i++) px(c, -12 + i * 3.2, -39.8, 1, 1, P.belt[3]);
    for (const lx of [-10, -3]) { px(c, lx, -42.4, 1.6, 6, S[3]); px(c, lx + 0.3, -42, 1, 5.2, S[1]); }
  } else briefs(c, f);
  // Beaten: blood on the suit (it shows on yellow)
  if (N) suitBlood(c, d, f);
  // (the seat catching with the legs, below the belt)
  if (N && !bare && (L.scorch ?? 0) > 0.3) { px(c, -16, -37.4, 40, 1.2, dith(c, '#1C1917')); if ((L.scorch ?? 0) > 0.6) px(c, -16, -36.2, 40, 3, '#1C1917'); }
  // X-rayed: his ribs, his spine, the pelvis (no bones in the gut, just the gut)
  if (MODE === 'xray') {
    line(c, [-4, -38, -5, -50, -3, -62, 0, -70], 2.6, BONE);
    for (let i = 0; i < 5; i++) { const y = -66 + i * 3.4; line(c, [-4.6, y, 4, y - 1.2, 11 - i * 0.6, y + 2.4], 1.1, BONE); }
    ell(c, -1, -40.5, 6, 3.4, BONE);
  }
  c.restore();
  // (the hair out of the collar: curls, gray and brown, some over the edges of it)
  if (MODE !== 'xray') {
    for (let i = 0; i < 14; i++) {
      const k = hash(i * 3.1), yy = lerp(-69.4, -61.4, hash(i * 5.7)), x0 = lerp(4.4, vx, (yy + 70) / 10), x1 = frontAt(yy) + 0.6;
      px(c, lerp(x0, x1, k) - 0.4, yy, 0.8, 0.8, i % 3 ? P.gray[1] : P.hair[3]);
      if (i % 2) px(c, lerp(x0, x1, k) + 0.4, yy + 0.8, 0.5, 0.5, P.gray[3]);
    }
    for (const [hx, hy] of [[frontAt(-66) + 1, -66], [frontAt(-68) + 1.4, -68.6], [5, -69.8]]) { px(c, hx, hy, 0.7, 0.7, P.gray[1]); px(c, hx + 0.6, hy - 0.6, 0.6, 0.6, P.gray[2]); }
    // (the gold rope chain, a little gold horn on it)
    for (let i = 0; i <= 8; i++) { const t = i / 8; px(c, lerp(5.2, 9.6, t) - 0.4, lerp(-69.6, -62.8, t) + Math.sin(t * Math.PI) * 0.8 - 0.4, 0.8, 0.8, i % 2 ? GOLD[1] : GOLD[3]); }
    fill(c, GOLD[3], () => { c.moveTo(9.4, -62.6); c.quadraticCurveTo(10.8, -61.6, 10.4, -59.4); c.quadraticCurveTo(9.8, -61, 8.8, -62); c.closePath(); });
    px(c, 9.6, -62.2, 0.5, 0.5, GOLD[0]);
  }
  // (the zip pull, dangling: off the top of the bust, if it's busted)
  const pullY = bust ? -55 : -60;
  px(c, zx(pullY) - 0.8, pullY, 1.6, 2.8, GOLD[4]); px(c, zx(pullY) - 0.5, pullY + 0.3, 1, 2.2, GOLD[1]);
  // (the buckle: big, gold, an S on it, hung out under the gut; the gut over the top of it)
  if (!bare) {
    shape(c, () => c.ellipse(11.8, -39.4, 5, 3.8, 0, 0, Math.PI * 2), GOLD, 6.8, 16.8, 0.9);
    for (let i = 0; i < 12; i++) { const t = (i / 12) * Math.PI * 2; px(c, 11.8 + Math.cos(t) * 4.2 - 0.3, -39.4 + Math.sin(t) * 3.1 - 0.3, 0.6, 0.6, GOLD[3]); }
    line(c, [13.8, -41.4, 10.6, -41.6, 10, -40.4, 13.4, -38.8, 13, -37.4, 9.8, -37.4], 1.1, GOLD[4]);
    line(c, [13.6, -41.7, 10.6, -41.9, 10, -40.7], 0.4, GOLD[0]);
    c.save(); c.beginPath(); torsoPath(c); c.clip();
    fill(c, S[2], () => { c.moveTo(4, -46); c.lineTo(19, -46); c.lineTo(18.4, -43.4); c.quadraticCurveTo(11, -40.8, 4.4, -42.8); c.closePath(); });
    c.restore();
    line(c, [4.4, -42.8, 11, -41.4, 18.2, -43.6, 18.6, -46], 0.9, S[4]);
  }
};

/** The patches: a faded name stitch, the sponsor down the side (a lightning bolt, ha), a spark plug on the gut. */
const patches = (c: Ctx) => {
  // STEVE: a white oval, red stitching, faded to pink in places
  shape(c, () => c.roundRect(-2.8, -64.6, 11, 4.4, 2), PATCH_R, -2.8, 8.2, 0.6);
  stitch(c, 'STEVE', -1.9, -63.6, 0.48);
  // BOLT: a red side patch, a white zigzag on it, a yellow border
  c.save(); c.translate(-8.6, -53.4); c.rotate(0.06);
  fill(c, '#FDE047', () => c.roundRect(-3.9, -2.4, 7.8, 4.8, 1.4)); fill(c, STRIPE_R[1], () => c.roundRect(-3.4, -1.9, 6.8, 3.8, 1.1));
  line(c, [-2.4, 0.8, -0.6, -0.8, 0.4, 0.8, 2.4, -0.9], 0.7, '#FFFFFF');
  c.restore();
  // The spark plug: white, a red border, the plug in black, a spark off its tip
  c.save(); c.translate(10.8, -50.6); c.rotate(-0.18);
  px(c, -3.6, -2.6, 7.2, 5.2, STRIPE_R[3]); px(c, -3.1, -2.1, 6.2, 4.2, PATCH_R[1]); px(c, -3.1, 1.3, 6.2, 0.8, PATCH_R[2]);
  px(c, -2.2, -0.6, 2.4, 1.4, '#18181B'); px(c, 0.2, -0.3, 1.4, 0.8, '#A1A1AA'); px(c, 1.6, -0.1, 0.8, 0.4, '#3F3F46');
  px(c, 2.2, -0.9, 0.6, 0.6, '#F97316'); px(c, 2.6, 0.3, 0.5, 0.5, '#FDE047');
  c.restore();
};

/** STEVE, in red stitching on his name patch: a little pixel lettering (`s` a pixel), faded where it's been washed. */
const GLYPHS: Record<string, number[]> = {
  S: [1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
  T: [1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  E: [1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1],
  V: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0],
};
const stitch = (c: Ctx, word: string, x: number, y: number, s: number) => {
  [...word].forEach((ch, i) => {
    const g = GLYPHS[ch];
    for (let k = 0; k < 15; k++) if (g[k]) { c.fillStyle = (i * 7 + k * 3) % 5 === 0 ? STRIPE_R[0] : STRIPE_R[2]; c.fillRect(x + (i * 4 + (k % 3)) * s, y + Math.floor(k / 3) * s, s, s); }
  });
};

/** The jumpsuit burned off below the waist: star-print briefs, the crisped black edge of what's left, embers in it. */
const briefs = (c: Ctx, f: number) => {
  const B = P.briefs;
  px(c, -16, -44.6, 40, 10, B[1]);
  px(c, -16, -44.6, 3.6, 10, B[0]); px(c, -12.4, -44.6, 1, 10, dith(c, B[0]));
  px(c, 9, -44.6, 1, 10, dith(c, B[2])); px(c, 10, -44.6, 10, 10, B[2]);
  px(c, -16, -38.6, 40, 2, B[3]);
  if (MODE === 'normal') for (const [sx, sy] of [[-9, -41.4], [-3, -39.4], [3, -42], [8, -39.8], [-6, -38.4], [13, -41.4], [0, -43]]) star(c, sx, sy, 0.9, '#FFFFFF');
  // (the waistband glued with rhinestones, like the brace: who's looking? he is. One catching the light)
  if (MODE === 'normal') {
    px(c, -16, -44.6, 40, 1.6, B[3]);
    const tw = Math.floor(f / 5) % 9;
    for (let i = 0; i < 9; i++) { const x = -12.6 + i * 3.4; px(c, x - 0.5, -44.4, 1, 1, '#DBEAFE'); px(c, x - 0.2, -44.2, 0.4, 0.4, '#FFFFFF'); if (i === tw) star(c, x, -44, 1.4, '#FFFFFF'); }
  }
  // (the burnt edge: ragged, black, glowing in bits)
  const pts: number[] = [];
  for (let i = 0; i <= 15; i++) pts.push(-14 + i * 2.2, i % 2 ? -43.8 : -45.6);
  line(c, pts, 1.6, '#1C1917');
  if (MODE === 'normal') for (let i = 0; i < 4; i++) if ((f + i * 5) % 14 < 8) px(c, -10 + i * 7, -45 + (i % 2), 1, 0.8, '#F97316');
};

const SPOTS: [number, number, number][] = [[14, -50, 3], [6, -57, 2.4], [10, -44, 2.6], [-6, -52, 2.2], [16, -55, 2], [2, -46, 2.8], [-9, -60, 2], [8, -63, 1.8]];
const suitBlood = (c: Ctx, d: number, f: number) => {
  if (d < 0.3) return;
  const n = Math.min(SPOTS.length, Math.ceil(((d - 0.25) / 0.75) * SPOTS.length));
  for (let i = 0; i < n; i++) {
    const [x, y, s] = SPOTS[i];
    smear(c, x, y, s * 1.5, s * 1.05, i % 3 === 2 ? bloodDark : bloodFresh);
    if (i % 2 === 0) drip(c, x + s * 0.2, y + s * 0.3, s * (0.6 + d * 1.6));
  }
  if (d > 0.85) { const t = (f % 30) / 30; ell(c, 15, -44 + t * 40, 0.9, 1.4, bloodFresh); }
};

/** The neck brace, worn like jewelry: white foam, a velcro strap round the back, rhinestones glued all round it
 *  (one twinkling). Knocked askew as he's beaten, then snapped (the front hanging off it, the foam showing). */
const drawBrace = (c: Ctx, d: number, f: number) => {
  const R = P.brace, N = MODE === 'normal', snapped = d >= 0.75;
  c.save(); c.translate(1.6, -75.4); c.rotate(d >= 0.4 ? 0.22 + (snapped ? 0.12 : 0) : 0.04);
  const body = () => c.roundRect(-8.8, -5.6, snapped ? 14 : 18.6, 11, 3.4);
  shape(c, body, R, -8.8, 9.8, 0.9);
  line(c, [-7.6, -4.4, 8.4, -4.4], 0.7, R[0]); line(c, [-7.6, 3.8, 8.4, 3.8], 0.8, R[2]);
  // (the velcro strap round the back, fraying)
  px(c, -8.4, -1.6, 6, 3.2, MODE === 'normal' ? '#6B7280' : R[3]); px(c, -8.4, -1.6, 6, 0.6, MODE === 'normal' ? '#9CA3AF' : R[2]);
  for (let i = 0; i < 3; i++) px(c, -3 + i * 0.6, 1.6, 0.4, 0.8 + (i % 2) * 0.6, R[3]);
  if (N) {
    // (sweat-yellowed round the top where his chins sit)
    ell(c, 2, -4.6, 6, 1, 'rgba(202, 160, 40, 0.35)');
    // (the rhinestones, glued on in a row; one twinkling)
    const tw = Math.floor(f / 6) % 5;
    for (let i = 0; i < (snapped ? 3 : 5); i++) {
      const x = -1 + i * 2.2;
      ell(c, x, 0.2, 0.8, 0.8, '#94A3B8'); ell(c, x - 0.1, 0.1, 0.55, 0.55, '#DBEAFE'); px(c, x - 0.4, -0.3, 0.4, 0.4, '#FFFFFF');
      if (i === tw) star(c, x, 0, 1.4, '#FFFFFF');
    }
  }
  if (snapped) {
    // (snapped through at the front: a jagged split, the front piece hanging off it, the foam yellow inside)
    line(c, [5.2, -5.4, 4.4, -2.6, 5.6, 0, 4.6, 2.8, 5.4, 5.4], 1, R[4]);
    c.save(); c.translate(6.6, -4.4); c.rotate(0.7);
    shape(c, () => c.roundRect(0, 0, 4.4, 9.4, 1.6), R, 0, 4.4, 0.8);
    px(c, 0.2, 0.4, 1, 8.6, N ? '#E9D8A6' : R[2]);
    c.restore();
    if (N) { px(c, 4.6, -1, 1, 1, '#E9D8A6'); px(c, 5, 1.6, 0.8, 0.8, '#E9D8A6'); }
  }
  c.restore();
};

/** His back going: a spike of stars at the base of it, the spine zigzagging. */
const crick = (c: Ctx, f: number) => {
  if (f % 6 >= 4) return;
  const x = -14, y = -45;
  for (let i = 0; i < 5; i++) { const a = Math.PI * (0.6 + i * 0.2); line(c, [x + Math.cos(a) * 2.4, y + Math.sin(a) * 2.4, x + Math.cos(a) * 6.4, y + Math.sin(a) * 6.4], 1.2, i % 2 ? '#FDE047' : '#FFFFFF'); }
  line(c, [-13, -52, -15, -49, -12.6, -46.6, -15.4, -43.4], 1, '#DC2626');
};

// ---------------------------------------------------------------------------------------------------------------
// Arms: the jumpsuit sleeves shoved up past the elbow, the forearms (leather, hair, oil, a tattoo), the watch, the hands

const drawArm = (c: Ctx, A: Arm, near: boolean, kind: Hand, d: number, f: number) => {
  const { sx, sy, ex, ey, hx, hy } = A;
  const N = MODE === 'normal';
  const sl = near ? P.suit : back(P.suit), sk = near ? P.skin : back(P.skin), st = near ? P.stripe : back(P.stripe);
  const ux = hx - ex, uy = hy - ey, ul = Math.hypot(ux, uy) || 1, nx = -uy / ul, ny = ux / ul;
  const cx = ex + ux * 0.24, cy = ey + uy * 0.24;
  // (the forearm: tanned to leather, hairy, shining with baby oil)
  tube(c, [ex, ey, hx, hy], [6.6], [sk]);
  if (N) {
    for (let i = 0; i < 5; i++) { const k = 0.35 + i * 0.12, o = i % 2 ? 1.6 : -1.2; px(c, lerp(ex, hx, k) + nx * o, lerp(ey, hy, k) + ny * o, 0.5, 1, P.hair[3]); }
    line(c, [lerp(ex, hx, 0.4) - nx * 1.6, lerp(ey, hy, 0.4) - ny * 1.6, lerp(ex, hx, 0.72) - nx * 1.6, lerp(ey, hy, 0.72) - ny * 1.6], 0.6, '#FFF4E0');
    if (near) tattoo(c, lerp(ex, hx, 0.56), lerp(ey, hy, 0.56), Math.atan2(uy, ux));
  }
  // (the sleeve, to the elbow, the stripe down its outside)
  tube(c, [sx, sy, ex, ey, cx, cy], [8.8, 8.2], [sl, sl]);
  line(c, [lerp(sx, ex, 0.12), lerp(sy, ey, 0.12), ex, ey], 2, st[1]);
  if (near && N) flamePatch(c, lerp(sx, ex, 0.32), lerp(sy, ey, 0.32));
  // (the roll of the sleeve: a fat band of it round the top of the forearm)
  line(c, [cx + nx * 4.8, cy + ny * 4.8, cx - nx * 4.8, cy - ny * 4.8], 3.6, sl[4], 'butt');
  line(c, [cx + nx * 4.1, cy + ny * 4.1, cx - nx * 4.1, cy - ny * 4.1], 2.4, sl[2], 'butt');
  line(c, [cx + nx * 4.1 - ux / ul * 0.7, cy + ny * 4.1 - uy / ul * 0.7, cx - nx * 4.1 - ux / ul * 0.7, cy - ny * 4.1 - uy / ul * 0.7], 0.7, sl[0], 'butt');
  // (beaten: the elbow torn through, blood)
  if (near && N && d >= 0.55) { ell(c, ex, ey, 2.4, 2, sk[1]); cut(c, ex - 1.2, ey - 0.4, ex + 1, ey + 0.8); smear(c, ex + 1, ey + 2, 2.4, 1.6); }
  // (the watch: a big fake gold one)
  if (near) {
    const wx = lerp(ex, hx, 0.84), wy = lerp(ey, hy, 0.84);
    line(c, [wx + nx * 3.7, wy + ny * 3.7, wx - nx * 3.7, wy - ny * 3.7], 2.6, GOLD[4], 'butt');
    line(c, [wx + nx * 3.3, wy + ny * 3.3, wx - nx * 3.3, wy - ny * 3.3], 1.6, GOLD[1], 'butt');
    ell(c, wx - nx * 1.4, wy - ny * 1.4, 1.1, 1.1, GOLD[3]); ell(c, wx - nx * 1.4, wy - ny * 1.4, 0.7, 0.7, '#1C1917');
    if ((f >> 3) % 9 === 0) px(c, wx - nx * 1.8, wy - ny * 1.8, 0.5, 0.5, '#FFFFFF');
  }
  if (MODE === 'xray') { line(c, [sx, sy, ex, ey, hx, hy], 1.8, BONE); ell(c, ex, ey, 1.5, 1.5, BONE); }
  hand(c, A, near, kind, f, d);
};

/** A blurry heart with a banner across it (MOM? MARGE? nobody can read it now): faded blue-green, gone soft. */
const tattoo = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  const ink = 'rgba(46, 90, 110, 0.7)';
  ell(c, -0.8, -0.6, 1, 0.9, ink); ell(c, 0.8, -0.6, 1, 0.9, ink);
  fill(c, ink, () => { c.moveTo(-1.7, -0.3); c.lineTo(1.7, -0.3); c.lineTo(0, 1.8); c.closePath(); });
  px(c, -2.1, -0.5, 4.2, 0.8, 'rgba(120, 60, 80, 0.7)');
  c.restore();
};

/** The flame patch on his shoulder: black, an orange-and-yellow flame, red stitching round it. */
const flamePatch = (c: Ctx, x: number, y: number) => {
  ell(c, x, y, 2.9, 2.9, '#3B0A0A'); ell(c, x, y, 2.4, 2.4, '#18181B');
  fill(c, '#F97316', () => { c.moveTo(x - 1.4, y + 1.4); c.lineTo(x - 1.2, y - 0.4); c.lineTo(x - 0.4, y + 0.2); c.lineTo(x, y - 1.8); c.lineTo(x + 0.6, y - 0.2); c.lineTo(x + 1.2, y - 1); c.lineTo(x + 1.4, y + 1.4); c.closePath(); });
  fill(c, '#FDE047', () => { c.moveTo(x - 0.6, y + 1.3); c.lineTo(x, y - 0.4); c.lineTo(x + 0.7, y + 1.3); c.closePath(); });
  c.beginPath(); c.arc(x, y, 2.6, 0, Math.PI * 2); c.strokeStyle = '#DC2626'; c.lineWidth = 0.5; c.stroke();
};

/** A hand: a big mitt. A fist (knuckles, the thumb over them), open (fingers spread), clawing, flat on something. */
const hand = (c: Ctx, A: Arm, near: boolean, kind: Hand, f: number, d: number) => {
  const r = near ? P.skin : back(P.skin), N = MODE === 'normal', X = MODE === 'xray';
  const { hx, hy, ex, ey } = A;
  c.save(); c.translate(hx, hy); c.rotate(Math.atan2(hy - ey, hx - ex));
  if (kind === 'open' || kind === 'claw') {
    for (let i = 0; i < 4; i++) {
      const t = -0.6 + i * 0.4 + (kind === 'open' ? Math.sin(f * 0.5 + i) * 0.05 : 0);
      if (kind === 'claw') tube(c, [2.4, -1.8 + i * 1.2, 5.2, -2.2 + i * 1.4, 6.2, -0.8 + i * 1.3], [1.5, 1.3], [r, r]);
      else tube(c, [2.4, (i - 1.5) * 1.1, 2.4 + Math.cos(t) * 4.8, (i - 1.5) * 1.1 + Math.sin(t) * 4.8], [1.6], [r]);
    }
    shape(c, () => c.ellipse(0.8, 0, 3.4, 3.2, 0, 0, Math.PI * 2), r, -2.6, 4.2, 0.8);
    tube(c, [0.6, -2.6, 2.4, -5.6], [1.8], [r]);
    if (X) for (let i = 0; i < 4; i++) { const t = -0.6 + i * 0.4; line(c, [0, (i - 1.5) * 0.8, 2.4 + Math.cos(t) * 4.4, (i - 1.5) * 1.1 + Math.sin(t) * 4.4], 0.6, BONE); }
  } else if (kind === 'back' || kind === 'knee') {
    shape(c, () => c.ellipse(0.8, 0, 3.4, 3, 0, 0, Math.PI * 2), r, -2.6, 4.2, 0.8);
    for (let i = 0; i < 4; i++) tube(c, [3, -1.6 + i * 1.1, 6.6, -1.2 + i * 1.2], [1.4], [r]);
  } else {
    shape(c, () => c.roundRect(-2.6, -3.4, 7, 6.8, 2.4), r, -2.6, 4.4, 0.8);
    for (let i = 0; i < 4; i++) px(c, 3.4, -2.6 + i * 1.5, 0.8, 0.8, r[3]);
    for (let i = 0; i < 3; i++) line(c, [1.4, -1.9 + i * 1.5, 4.2, -1.9 + i * 1.5], 0.4, r[3]);
    if (kind !== 'thumb') line(c, [-0.4, -2.8, 2.6, -3.2, 3.6, -1.6], 1.1, r[2]);
    if (N && near && d >= 0.4) px(c, 3.4, -1.2, 1, 2.2, bloodFresh);   // (the knuckles skinned)
    if (X) for (let i = 0; i < 3; i++) line(c, [-1, -1.6 + i * 1.5, 3.4, -1.6 + i * 1.5], 0.6, BONE);
  }
  c.restore();
  if (kind === 'thumb') {
    // (the thumb straight up out of the top of the fist)
    tube(c, [hx + 0.4, hy - 2.4, hx + 0.8, hy - 8.4], [2.8], [r]);
    px(c, hx + 0.7, hy - 8.6, 1.4, 1.2, r[0]);
  }
  if (kind === 'flag') flag(c, hx, hy, f);
};

/** The checkered flag on a stick (taped on), rippling, a corner torn off. */
const flag = (c: Ctx, x: number, y: number, f: number) => {
  line(c, [x - 0.4, y + 3, x + 1.2, y - 26], 2.2, '#1C1917'); line(c, [x - 0.4, y + 3, x + 1.2, y - 26], 1.2, '#78716C');
  px(c, x + 0.1, y - 7.6, 1.8, 1.4, '#9CA3AF');
  for (let i = 0; i < 5; i++) {
    const wv = Math.sin(f * 0.3 - i * 0.9) * 1.4, qx = x + 1.6 + i * 3.4;
    for (let j = 0; j < 3; j++) {
      if (i === 4 && j === 2) continue;
      px(c, qx, y - 26 + j * 3.4 + wv, 3.5, 3.5, (i + j) % 2 ? '#F5F5F4' : '#18181B');
    }
    px(c, qx, y - 26.6 + wv, 3.5, 0.6, '#0A0A0A'); px(c, qx, y - 26 + (i === 4 ? 6.8 : 10.2) + wv, 3.5, 0.6, '#0A0A0A');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The head, in its own space: (0, 0) its middle, the face toward +x; the chin at about (8, 12.6)

const skullPath = (c: Ctx) => {
  c.moveTo(-10, -2);
  c.quadraticCurveTo(-10.6, -12.6, 0, -12.8);
  c.quadraticCurveTo(9.2, -12.6, 10.2, -5);
  c.lineTo(10.6, -1.2); c.lineTo(11.2, 4);
  c.quadraticCurveTo(12.2, 11.4, 7.6, 12.6);
  c.quadraticCurveTo(2, 13.4, -3, 10.2);
  c.quadraticCurveTo(-8, 7, -10, -2); c.closePath();
};
const nearLens = (c: Ctx) => { c.moveTo(4.8, -3.8); c.lineTo(11.4, -4); c.quadraticCurveTo(11.9, 0.8, 9.8, 2.6); c.quadraticCurveTo(6.6, 3.8, 5.2, 0.8); c.closePath(); };
const farLens = (c: Ctx) => { c.moveTo(12.4, -3.8); c.lineTo(14.4, -3.8); c.quadraticCurveTo(14.6, 0.2, 13.6, 1.8); c.quadraticCurveTo(12.6, 1.6, 12.4, -1); c.closePath(); };

const drawHead = (c: Ctx, mood: Mood, f: number, d: number, L: SteveLook, pose: StevePose) => {
  const N = MODE === 'normal', X = MODE === 'xray';
  const singed = d >= 0.55 || (L.singe ?? 0) >= 0.5 || MODE === 'char';
  // ---- the mullet down the back (party in the back): feathered, flipped out at the ends, gray coming through
  const mullet = () => {
    c.moveTo(-1, -13); c.quadraticCurveTo(-11.6, -12.6, -12.6, -3); c.quadraticCurveTo(-13.2, 6, -12.6, 13);
    c.lineTo(-14.6, 16.4); c.lineTo(-11.4, 14.8); c.lineTo(-11, 18); c.lineTo(-8.4, 14.6); c.lineTo(-6.6, 16.6); c.lineTo(-5.6, 12.4);
    c.quadraticCurveTo(-5, 6, -4, 2); c.lineTo(-2, -6); c.closePath();
  };
  shape(c, mullet, P.hair, -14.6, -2, 0.8);
  if (!X) {
    line(c, [-8, -8, -10.6, 2, -11.6, 12, -13.4, 15.6], 0.6, P.hair[3]);
    line(c, [-6, -6, -7.6, 4, -8.8, 14.4], 0.6, P.hair[3]);
    line(c, [-9.6, -6, -11.6, 6, -11.2, 16.6], 0.6, P.gray[1]);
    line(c, [-5.4, 0, -6.4, 9, -6.8, 15.4], 0.5, P.gray[2]);
  }
  if (singed) for (const [tx, ty] of [[-14.6, 16.4], [-11, 18], [-6.6, 16.6]]) { ell(c, tx + 0.6, ty - 0.8, 1.4, 1.2, '#18120E'); if (N && (f + tx) % 10 < 5) px(c, tx + 0.4, ty - 0.8, 0.6, 0.6, '#F97316'); }
  // ---- the skull
  c.beginPath(); skullPath(c); c.fillStyle = P.skin[1]; c.fill();
  c.save(); c.clip();
  px(c, -12, -14, 5, 30, P.skin[2]); px(c, -7, -14, 1, 30, dith(c, P.skin[2])); px(c, -12, -14, 2.4, 30, P.skin[3]);
  ell(c, 2, 13.6, 10, 3.2, P.skin[2]); ell(c, 2, 14.4, 9, 2, P.skin[3]);
  if (!X) {
    ell(c, 6.6, 3.4, 2.2, 1.1, P.skin[0]); ell(c, 4.4, -9, 3, 1.1, dith(c, P.skin[0]));
    // (stubble, down the jaw and round the chin)
    for (let i = 0; i < 24; i++) px(c, 1 + ((i * 3.7) % 11), 6 + ((i * 2.3) % 6.4), 0.6, 0.6, 'rgba(50, 35, 25, 0.35)');
    // (the lines: the forehead, crow's feet off the aviators, the folds by the mustache, the jowl)
    line(c, [3, -7.6, 5.4, -8, 8.4, -7.4], 0.5, P.skin[3]); line(c, [3.4, -6.2, 6, -6.6, 8.6, -6.2], 0.4, P.skin[2]);
    line(c, [4.6, 0.4, 2.6, 0], 0.4, P.skin[3]); line(c, [4.8, 1.4, 2.8, 1.8], 0.4, P.skin[3]); line(c, [4.6, -0.8, 2.8, -1.6], 0.4, P.skin[3]);
    line(c, [9.6, 3.4, 7.6, 7.6], 0.5, P.skin[3]); line(c, [5, 8.4, 6, 11.6], 0.5, P.skin[3]);
    // (the raccoon tan: pale where forty years of aviators kept the sun off)
    if (L.noShades || d >= 0.65) { c.save(); c.beginPath(); nearLens(c); c.fillStyle = P.pale[1]; c.fill(); c.restore(); }
    // (the black eye, coming up: under the lens, then all round the eye once the lens is gone)
    if (N && d >= 0.5) {
      if (L.noShades || d >= 0.65) { ell(c, 8.2, -0.2, 3.4, 2.8, dith(c, '#7E22CE')); ell(c, 8.2, -0.2, 2.8, 2.2, '#6B21A8'); ell(c, 8.4, 0.8, 2, 1, '#4C1D95'); }
      else { ell(c, 7.8, 3.2, 3, 1.2, dith(c, '#7E22CE')); ell(c, 7.8, 3.4, 2.2, 0.8, '#6B21A8'); }
    }
  }
  c.restore();
  c.beginPath(); skullPath(c); c.strokeStyle = P.skin[4]; c.lineWidth = 0.8; c.stroke();
  // ---- the feathered top: swept back, a wave over the forehead, silver streaks, gray at the temples
  const top = () => { c.moveTo(-9.4, -3); c.quadraticCurveTo(-10.4, -14.6, -0.4, -16.4); c.quadraticCurveTo(8.4, -17.6, 11.6, -11); c.quadraticCurveTo(9.4, -11.4, 7.6, -9.8); c.quadraticCurveTo(5.4, -11.8, 2, -10.6); c.quadraticCurveTo(-2.4, -9.6, -3.4, -5.6); c.lineTo(-4.6, -1.4); c.closePath(); };
  shape(c, top, P.hair, -10.4, 11.6, 0.8);
  if (!X) {
    line(c, [10, -11.6, 4, -14.6, -3, -14.4, -8, -9.6], 0.6, P.hair[0]);
    line(c, [8.4, -10.6, 3, -12.6, -2.4, -12, -6.4, -7], 0.6, P.hair[3]);
    line(c, [6.4, -13.6, 1, -15.6, -5, -13.4], 0.7, P.gray[1]);
    line(c, [2, -11.4, -3, -11, -7, -6], 0.5, P.gray[2]);
  }
  shape(c, () => { c.moveTo(-3.4, -5.6); c.lineTo(-1, -9); c.lineTo(0.8, -7.4); c.lineTo(-0.4, -1.6); c.lineTo(-2.2, -0.4); c.closePath(); }, P.gray, -3.4, 0.8, 0.6);
  if (singed) { ell(c, 10.8, -11.2, 1.4, 0.9, '#18120E'); ell(c, -1, -16.2, 1.6, 0.8, '#18120E'); }
  // ---- frizzed: the lot of it straight up and out (the lightning)
  const frizz = L.frizz ?? 0;
  if (frizz > 0.05) {
    for (let i = 0; i < 11; i++) {
      const a = -Math.PI + 0.25 + i * 0.27, w = Math.sin(f * 0.9 + i) * frizz * 0.08;
      const r1 = 13 + frizz * 11 + (i % 3) * 2.4, x0 = Math.cos(a) * 9, y0 = -4 + Math.sin(a) * 9, x1 = Math.cos(a + w) * r1, y1 = -4 + Math.sin(a + w) * r1;
      tube(c, [x0, y0, lerp(x0, x1, 0.55) + (i % 2 ? 1 : -1), lerp(y0, y1, 0.55), x1, y1], [2.6 - (i % 2) * 0.6, 1.8], [i % 3 === 1 ? P.gray : P.hair, i % 3 === 1 ? P.gray : P.hair]);
      if (singed) ell(c, x1, y1, 1.1, 1.1, '#18120E');
    }
  }
  if (X) {
    // The x-ray: his skull lit up through him (the aviators still on it)
    ell(c, 0.6, -2, 9.8, 10.4, BONE); fill(c, BONE, () => c.roundRect(1, 4, 10.4, 7.2, 2.4));
    ell(c, 8, -0.4, 2.4, 2.2, '#0B4F75'); ell(c, 1, -1, 2.4, 2, '#BAE6FD');
    fill(c, '#0B4F75', () => { c.moveTo(10.6, 1.6); c.lineTo(12, 4.4); c.lineTo(10.2, 4.4); c.closePath(); });
    const ch = f % 2 ? 0.6 : 0;
    px(c, 5, 6.2, 6.4, 1.2, BONE); px(c, 5, 7.6 + ch, 6.4, 1.2, BONE);
    for (let i = 0; i < 5; i++) { px(c, 5.8 + i * 1.2, 6.2, 0.3, 1.2, '#7DD3FC'); px(c, 5.8 + i * 1.2, 7.6 + ch, 0.3, 1.2, '#7DD3FC'); }
    aviators(c, f, d);
    return;
  }
  // ---- the ear, the cigarette tucked behind it (lit, if the lightning's had him)
  shape(c, () => c.ellipse(-3.2, 1.2, 2.3, 3.2, 0.1, 0, Math.PI * 2), P.skin, -5.5, -0.9, 0.7);
  line(c, [-3.6, -0.6, -2.4, 1, -3.4, 2.8], 0.6, P.skin[3]);
  const lit = MODE === 'char' || pose === 'smoking' || (L.singe ?? 0) > 0.3;
  line(c, [-6.4, -2.4, 0.8, -4.2], 2.2, MODE === 'char' ? '#000000' : '#78716C');
  line(c, [-6.4, -2.4, 0.8, -4.2], 1.3, MODE === 'char' ? '#57534E' : '#F5F5F0');
  if (MODE !== 'char') px(c, -6.8, -3, 1.8, 1.2, '#D9A066');
  px(c, 0.4, -4.8, 1, 1.2, lit ? ((f >> 2) % 2 ? '#F97316' : '#FDBA74') : '#A8A29E');
  // ---- the nose: big, broken a few times and set by a stunt coordinator; red at the end
  shape(c, () => { c.moveTo(10.4, -2.4); c.quadraticCurveTo(12, -0.4, 12.6, 1); c.lineTo(13.8, 3.6); c.quadraticCurveTo(13.6, 5.2, 11.8, 5); c.lineTo(10.6, 4.6); c.closePath(); }, P.skin, 10.4, 13.8, 0.7);
  px(c, 11.5, 4.1, 1, 0.6, P.skin[4]); px(c, 11.6, -0.2, 0.8, 0.8, P.skin[0]);
  if (N) ell(c, 12.8, 3.4, 1.1, 0.9, 'rgba(200, 70, 60, 0.4)');
  // ---- the eyes (off the aviators, or once the lens is gone)
  if (L.noShades || d >= 0.65) eye(c, 8.2, -0.6, mood, d);
  // ---- the brows: thick, gray coming through
  const brow = mood === 'mad' || mood === 'strain' ? [4.6, -6.8, 11, -4.6] : mood === 'scared' || mood === 'zap' || mood === 'ouch' ? [4.6, -5.2, 11, -7.4] : [4.6, -5.8, 11, -5.6];
  line(c, brow, 1.8, P.stache[3]); line(c, [brow[0], brow[1] - 0.4, brow[2], brow[3] - 0.4], 0.6, P.gray[1]);
  // ---- the aviators
  if (!L.noShades) aviators(c, f, d);
  // ---- the horseshoe mustache, gray flecks in it
  const stache = () => { c.moveTo(7.2, 5.6); c.quadraticCurveTo(10, 4.2, 13.6, 5.2); c.lineTo(13.4, 7); c.lineTo(12.9, 11.8); c.lineTo(11.8, 12); c.lineTo(11.6, 7.4); c.quadraticCurveTo(10, 6.8, 8.8, 7.4); c.lineTo(8.7, 11.8); c.lineTo(7.4, 11.6); c.lineTo(7, 7); c.closePath(); };
  shape(c, stache, P.stache, 7, 13.6, 0.7);
  if (MODE === 'normal') for (const [gx, gy] of [[9, 5.2], [11.6, 5.4], [12.6, 8.6], [7.8, 9.4], [13, 6]]) px(c, gx, gy, 0.6, 0.6, P.gray[1]);
  // ---- the mouth
  mouth(c, mood, f, d);
  // (idle: a toothpick, going)
  if (pose === 'idle') { const a = Math.sin(f * 0.15) * 0.25; line(c, [11.2, 8.2, 11.2 + Math.cos(-0.3 + a) * 4.6, 8.2 + Math.sin(-0.3 + a) * 4.6], 1.4, '#7A5A2E'); line(c, [11.2, 8.2, 11.2 + Math.cos(-0.3 + a) * 4.6, 8.2 + Math.sin(-0.3 + a) * 4.6], 0.6, '#E8C590'); }
  // ---- beaten
  if (N) headGore(c, f, d);
};

/** The cheap gold aviators: gold wire, a double bridge, gradient lenses (dark over amber), the arena lights in them.
 *  Beaten: the near lens cracked, then gone (the empty frame round the shiner). */
const aviators = (c: Ctx, f: number, d: number) => {
  const crack = d >= 0.35, gone = d >= 0.65;
  line(c, [5, -3.4, 0.6, -2.6, -1.8, -1.6], 0.9, GOLD[3]); line(c, [5, -3.6, 0.6, -2.8], 0.4, GOLD[1]);
  lens(c, farLens, 12.4, 14.6, false);
  if (!gone) lens(c, nearLens, 4.8, 11.9, crack);
  for (const p of [nearLens, farLens]) { c.beginPath(); p(c); c.strokeStyle = GOLD[4]; c.lineWidth = 1.2; c.stroke(); c.strokeStyle = GOLD[1]; c.lineWidth = 0.6; c.stroke(); }
  line(c, [11.4, -4, 12.4, -3.8], 0.8, GOLD[2]); line(c, [5.2, -4.6, 14.2, -4.6], 0.6, GOLD[2]);
  px(c, 6, -4.2, 2, 0.4, GOLD[0]);
  if (!gone && (f >> 4) % 7 === 0) star(c, 6.4, -2.4, 1.3, '#FFFFFF');
};
const lens = (c: Ctx, p: (c: Ctx) => void, x0: number, x1: number, crack: boolean) => {
  c.save(); c.beginPath(); p(c); c.clip();
  const w = x1 - x0 + 2;
  px(c, x0 - 1, -6, w, 10, '#5C3518'); px(c, x0 - 1, -0.4, w, 1.2, '#3A2214');
  px(c, x0 - 1, -6, w, 4.6, '#1C1917'); px(c, x0 - 1, -1.4, w, 1, dith(c, '#1C1917'));
  line(c, [x0 + 0.6, -2.4, x0 + 3, -4.4], 0.9, 'rgba(255, 255, 255, 0.7)'); px(c, x0 + 3.4, 0.8, 1.4, 0.5, '#A16207');
  if (crack) { const cx = x0 + 3.6, cy = -0.8; for (const [dx, dy] of [[-3, -2], [2.6, -2.6], [3, 1.6], [-1.4, 3], [-3.4, 1]]) line(c, [cx, cy, cx + dx * 0.5 + 0.3, cy + dy * 0.5, cx + dx, cy + dy], 0.4, '#E5E7EB'); }
  c.restore();
};

const eye = (c: Ctx, x: number, y: number, mood: Mood, d: number) => {
  if (mood === 'dead') { line(c, [x - 1.4, y - 1, x + 1.4, y + 1], 0.7, P.skin[4]); line(c, [x - 1.4, y + 1, x + 1.4, y - 1], 0.7, P.skin[4]); return; }
  const wide = mood === 'scared' || mood === 'zap' ? 1.4 : mood === 'mad' || mood === 'strain' || mood === 'ouch' ? 0.7 : 1;
  ell(c, x, y, 1.9, 1.3 * wide, '#F5F1E6');
  if (d >= 0.5 && MODE === 'normal') px(c, x - 1.5, y - 0.1, 1, 0.4, '#DC2626');
  px(c, x + 0.3, y - 0.7 * wide, 1, 1.4 * wide, '#41657A'); px(c, x + 0.6, y - 0.3, 0.5, 0.6, '#0A0A0A');
  line(c, [x - 2, y - 1.3 * wide, x + 2, y - 1.5 * wide], 0.8, P.skin[4]);
  line(c, [x - 1.6, y + 1.6, x + 1.2, y + 2], 0.5, P.skin[3]);
};

const mouth = (c: Ctx, mood: Mood, f: number, d: number) => {
  const ink = P.skin[4], gap = d >= 0.85 && MODE === 'normal';
  switch (mood) {
    case 'smug': case 'cool':
      line(c, [8.9, 8.4, 10.4, 8.6, 11.6, 7.8], 0.8, ink); px(c, 9.4, 9.1, 1.8, 0.5, P.skin[2]);
      break;
    case 'grin':
      // (the big grin: the gold tooth in it, catching the light)
      fill(c, ink, () => c.roundRect(8.6, 7.2, 3.4, 2.2, 0.8));
      px(c, 8.9, 7.4, 2.8, 0.9, TEETH); px(c, 10.2, 7.4, 0.8, 0.9, GOLD[1]);
      if (gap) px(c, 9.2, 7.4, 0.7, 0.9, '#1A0B06');
      px(c, 9, 8.6, 2.6, 0.5, '#7F1D1D');
      if (f % 80 < 6) star(c, 10.6, 7.6, 1.2, '#FFFFFF');
      break;
    case 'shout':
      ell(c, 10.3, 8.8, 1.7, 1.9, ink); px(c, 9, 7.1, 2.6, 0.6, TEETH); px(c, 10.2, 7.1, 0.7, 0.6, GOLD[1]); ell(c, 10.3, 9.8, 1.2, 0.6, '#DC2626');
      break;
    case 'mad': case 'strain':
      fill(c, ink, () => c.roundRect(8.7, 7.4, 3.2, 1.8, 0.4)); px(c, 8.9, 7.6, 2.8, 1.3, TEETH);
      px(c, 9.8, 7.6, 0.3, 1.3, '#A8A29E'); px(c, 10.8, 7.6, 0.3, 1.3, '#A8A29E'); px(c, 10.2, 7.6, 0.6, 0.6, GOLD[1]);
      break;
    case 'scared': ell(c, 10.4, 8.6, 1.1, 1.5, ink); px(c, 10, 7.4, 0.8, 0.4, TEETH); break;
    case 'zap': {
      const ch = f % 2 ? 0.5 : 0;
      fill(c, ink, () => c.roundRect(8.4, 6.8, 3.8, 3.6, 0.6)); px(c, 8.6, 7, 3.4, 0.9, TEETH); px(c, 8.6, 9.1 - ch, 3.4, 0.9, TEETH);
      break;
    }
    case 'ouch':
      fill(c, ink, () => { c.moveTo(8.6, 8.6); c.lineTo(12, 7.4); c.lineTo(12, 8.8); c.lineTo(8.8, 9.6); c.closePath(); });
      px(c, 9.2, 8.1, 2.6, 0.7, TEETH);
      break;
    case 'cough': ell(c, 10.6, 8.6, 1.4, 1.2 + (f % 10 < 5 ? 0.4 : 0), ink); break;
    case 'dead':
      ell(c, 10.2, 8.4, 1.4, 0.9, ink);
      fill(c, MODE === 'char' ? '#57534E' : '#E11D48', () => c.ellipse(11.4, 10, 1.2, 1.8, -0.3, 0, Math.PI * 2)); line(c, [11.2, 9, 11.6, 11], 0.4, '#9F1239');
      break;
  }
};

/** His face as it goes: sweat, grime, a nosebleed, a split lip, a gash in the forehead, blood off his chin. */
const headGore = (c: Ctx, f: number, d: number) => {
  if (d >= 0.12) for (let i = 0; i < 3; i++) { const sx = 3.4 + i * 2.6, sy = -7.8 + (i % 2) * 0.8 + ((f * 0.04 + i * 0.3) % 1) * 1.2; ell(c, sx, sy, 0.5, 0.8, '#E0F2FE'); px(c, sx - 0.2, sy + 0.4, 0.5, 0.4, '#7DD3FC'); }
  if (d >= 0.2) { ell(c, 4, 5, 2.4, 1.6, 'rgba(70, 50, 30, 0.3)'); ell(c, -6, -3, 2, 3, 'rgba(70, 50, 30, 0.25)'); }
  if (d >= 0.25) { line(c, [11.8, 4.8, 12.2, 5.6], 0.9, bloodFresh); px(c, 12.2, 7, 0.9, 2 + d * 3, bloodFresh); drip(c, 12.6, 11.6, 1 + d * 3); }
  if (d >= 0.35) { cut(c, 9.8, 9.4, 10.8, 9.9); }
  if (d >= 0.7) { cut(c, 3.6, -8.6, 7.6, -9.6); drip(c, 5.6, -8.8, 2 + d * 3); }
  if (d >= 0.85) { const t = (f % 26) / 26; ell(c, 10.4, 12.8 + t * 9, 0.7, 1.1, bloodFresh); smear(c, 4, 10, 2.4, 1.6, bloodDark); }
};

// ---------------------------------------------------------------------------------------------------------------
// What comes off him (in his own unrotated space: feet at 0)

const aftermath = (c: Ctx, pose: StevePose, f: number, L: SteveLook, R: Rig) => {
  switch (pose) {
    case 'slip': {
      // (squirted out: drops of baby oil flung off him, amber, glinting; the shine on him)
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI + (i + 0.5) * (Math.PI / 10), dist = ((f * 2.4 + i * 7) % 26) + 6;
        const ox = Math.cos(a) * dist * 1.3, oy = -46 + Math.sin(a) * dist + dist * dist * 0.012;
        ell(c, ox, oy, 1.4, 1.8, '#B45309'); ell(c, ox, oy, 0.9, 1.3, '#FCD34D'); px(c, ox - 0.5, oy - 0.8, 0.5, 0.5, '#FFFFFF');
      }
      for (const [sx, sy, k] of [[-8, -60, 0], [14, -52, 3], [4, -84, 6], [-12, -30, 8]] as const) if ((f + k) % 10 < 5) star(c, sx, sy, 1.6, '#FFFFFF');
      break;
    }
    case 'zapped': {
      // (crackling: little arcs off his fingers, his hair, his boots)
      for (const [x0, y0, i] of [[-30, -84, 1], [32, -86, 2], [2, -118, 3], [-14, 0, 4], [16, 0, 5], [-10, -112, 6]] as const) {
        const pts: number[] = [x0, y0]; let x: number = x0, y: number = y0;
        for (let k = 0; k < 3; k++) { x += (hash(f * 13 + i * 7 + k) - 0.5) * 10; y += (hash(f * 17 + i * 3 + k) - 0.5) * 10; pts.push(x, y); }
        line(c, pts, 1.6, '#38BDF8'); line(c, pts, 0.7, '#FFFFFF');
      }
      break;
    }
    case 'charred': {
      // (smoking off the top of him in stepped puffs; embers in the cracks)
      for (let i = 0; i < 3; i++) {
        const t = ((f * 0.6 + i * 20) % 60) / 60, y = -112 - t * 30, x = 2 + Math.sin(t * 6 + i) * 4, r = 2 + t * 4;
        ell(c, x, y, r, r, t > 0.6 ? dith(c, '#78716C') : '#57534E'); ell(c, x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.4, '#A8A29E');
      }
      for (const [ex, ey, i] of [[-6, -50, 0], [10, -46, 1], [-2, -24, 2], [6, -70, 3], [-9, -12, 4], [14, -60, 5]] as const) px(c, ex, ey, 1.2, 1.2, (f + i * 7) % 12 < 6 ? '#F97316' : '#7F1D1D');
      break;
    }
    case 'smoking': {
      for (let i = 0; i < 2; i++) { const t = ((f * 0.5 + i * 30) % 60) / 60, r = 1.5 + t * 3; ell(c, 26 + Math.sin(t * 5 + i) * 3, -96 - t * 22, r, r, t > 0.5 ? dith(c, '#A8A29E') : '#78716C'); }
      break;
    }
    case 'towed': {
      // (dust kicked up off the floor under him, trailing off behind)
      for (let i = 0; i < 3; i++) { const t = ((f * 0.06) + i / 3) % 1, r = 2 + t * 5; ell(c, 20 - t * 60, -3 - t * 6, r, r * 0.7, t > 0.5 ? dith(c, '#A8A29E') : '#D6D3D1'); }
      break;
    }
    case 'hoop': {
      // (the suit still burning off him at the waist)
      if (!L.pantsDown) break;
      for (let i = 0; i < 4; i++) {
        const fx = -10 + i * 7, h = 4 + Math.sin(f * 0.6 + i * 2) * 2 + (i % 2) * 2;
        fill(c, '#DC2626', () => { c.moveTo(fx - 2.4, -44); c.lineTo(fx, -44 - h - 2); c.lineTo(fx + 2.4, -44); c.closePath(); });
        fill(c, '#F97316', () => { c.moveTo(fx - 1.6, -44); c.lineTo(fx, -44 - h); c.lineTo(fx + 1.6, -44); c.closePath(); });
        fill(c, '#FDE047', () => { c.moveTo(fx - 0.8, -44); c.lineTo(fx, -44 - h * 0.5); c.lineTo(fx + 0.8, -44); c.closePath(); });
      }
      break;
    }
    case 'drape': {
      // (on fire where the loop's got him: stepped tongues up off his legs while the suit goes, bigger as it catches;
      //  smoke off him the whole time, black while it's the suit, thin once it's gone)
      const sc = L.pantsDown ? 0 : L.scorch ?? 0;
      if (sc > 0) R.legs.forEach((G, j) => {
        for (let i = 0; i < 3; i++) {
          const k = i * 0.35, fx = i < 2 ? lerp(G[0], G[2], 0.3 + k) : lerp(G[2], G[4], 0.45), fy = i < 2 ? lerp(G[1], G[3], 0.3 + k) : lerp(G[3], G[5], 0.45);
          const h = (3 + sc * 7) * (0.8 + 0.3 * Math.sin(f * 0.7 + i * 2 + j * 3)), w = 1.6 + sc * 1.4;
          fill(c, '#DC2626', () => { c.moveTo(fx - w, fy); c.lineTo(fx + 0.6, fy - h - 2); c.lineTo(fx + w, fy); c.closePath(); });
          fill(c, '#F97316', () => { c.moveTo(fx - w * 0.66, fy); c.lineTo(fx + 0.4, fy - h); c.lineTo(fx + w * 0.66, fy); c.closePath(); });
          fill(c, '#FDE047', () => { c.moveTo(fx - w * 0.33, fy); c.lineTo(fx, fy - h * 0.5); c.lineTo(fx + w * 0.33, fy); c.closePath(); });
        }
      });
      for (let i = 0; i < 3; i++) {
        const t = ((f * 0.5 + i * 20) % 60) / 60, r = 1.6 + t * 4, x = -8 + Math.sin(t * 5 + i) * 3, y = -30 - t * 34;
        const col = L.pantsDown ? '#A8A29E' : '#44403C';
        ell(c, x, y, r, r, t > 0.5 ? dith(c, col) : col);
      }
      break;
    }
    case 'heap':
      // (the briefs' burnt edge still smoking, thin)
      for (let i = 0; i < 2; i++) { const t = ((f * 0.4 + i * 30) % 60) / 60, r = 1.2 + t * 3; ell(c, -10 + Math.sin(t * 5 + i) * 2, -26 - t * 22, r, r, t > 0.5 ? dith(c, '#A8A29E') : '#78716C'); }
      break;
    default: break;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What's left of him

const ASH: Ramp = ['#A8A29E', '#78716C', '#57534E', '#3F3A36', '#1C1917'];

/** His ash, in a heap on the floor (k 0..1: how much of it's come down yet), the aviators perched on top, untouched;
 *  the S buckle sticking out of the side, the cigarette butt, embers. */
export const drawSteveAsh = (c: Ctx, x: number, groundY: number, k: number, f: number) => {
  const w = 44 * k + 4, h = 16 * k + 2;
  c.save(); c.translate(Math.round(x), Math.round(groundY));
  const pile = () => { c.moveTo(-w, 0); c.quadraticCurveTo(-w * 0.7, -h * 0.9, -w * 0.15, -h); c.quadraticCurveTo(w * 0.2, -h * 1.08, w * 0.45, -h * 0.7); c.quadraticCurveTo(w * 0.85, -h * 0.45, w, 0); c.closePath(); };
  shape(c, pile, ASH, -w, w);
  c.save(); c.beginPath(); pile(); c.clip();
  // (stepped bands down it; lumps; flecks of white ash)
  px(c, -w, -h * 0.35, w * 2, 1, dith(c, ASH[2])); px(c, -w, -h * 0.3, w * 2, h, ASH[2]);
  px(c, -w, -h * 0.12, w * 2, 1, dith(c, ASH[3])); px(c, -w, -h * 0.08, w * 2, h, ASH[3]);
  for (let i = 0; i < 9; i++) { const lx = (hash(i) - 0.5) * w * 1.6, ly = -hash(i + 9) * h * 0.8; ell(c, lx, ly, 2.4, 1.4, ASH[0]); px(c, lx - 1.2, ly + 0.8, 2.4, 0.6, ASH[3]); }
  for (let i = 0; i < 14; i++) px(c, (hash(i * 3) - 0.5) * w * 1.8, -hash(i * 5) * h, 0.8, 0.8, '#E7E5E4');
  c.restore();
  if (k > 0.5) {
    // (the S buckle out the side of it, gold, fine; the cigarette butt)
    c.save(); c.translate(w * 0.55, -h * 0.4); c.rotate(0.5);
    shape(c, () => c.ellipse(0, 0, 4.4, 3.4, 0, 0, Math.PI * 2), GOLD, -4.4, 4.4, 0.8);
    line(c, [1.8, -1.8, -1, -2, -1.4, -0.8, 1.6, 0.4, 1.2, 1.6, -1.6, 1.6], 1, GOLD[4]);
    c.restore();
    line(c, [-w * 0.5, -h * 0.5, -w * 0.5 + 5, -h * 0.5 - 1], 1.6, '#D9A066'); px(c, -w * 0.5 + 4.4, -h * 0.5 - 1.8, 1.2, 1.2, '#57534E');
  }
  for (let i = 0; i < 5; i++) if ((f + i * 5) % 16 < 8) px(c, (hash(i * 7) - 0.5) * w * 1.4, -hash(i * 11) * h * 0.7 - 1, 1.2, 1, i % 2 ? '#F97316' : '#DC2626');
  if (k > 0.3) aviatorsOnTop(c, -w * 0.15, -h - 1, f);
  c.restore();
};

/** The aviators, folded, sat on the heap: front on, two gold teardrops, a glint (the last of him, still cool). */
const aviatorsOnTop = (c: Ctx, x: number, y: number, f: number) => {
  c.save(); c.translate(x, y);
  for (const s of [-1, 1]) {
    const p = () => { c.moveTo(s * 1.2, -4.2); c.lineTo(s * 8.6, -4.4); c.quadraticCurveTo(s * 9.4, 0.6, s * 6.6, 1.4); c.quadraticCurveTo(s * 2.4, 2, s * 1.4, -1); c.closePath(); };
    c.save(); c.beginPath(); p(); c.clip();
    px(c, -10, -6, 20, 8, '#5C3518'); px(c, -10, -6, 20, 3.6, '#1C1917'); px(c, -10, -2.4, 20, 1, dith(c, '#1C1917'));
    line(c, [s * 3, -1, s * 5, -3.6], 0.8, 'rgba(255, 255, 255, 0.7)');
    c.restore();
    c.beginPath(); p(); c.strokeStyle = GOLD[4]; c.lineWidth = 1.2; c.stroke(); c.strokeStyle = GOLD[1]; c.lineWidth = 0.6; c.stroke();
    line(c, [s * 8.4, -4, s * 6, -1.4], 0.7, GOLD[3]);      // the arms, folded in behind
  }
  line(c, [-1.4, -4.2, 1.4, -4.2], 0.8, GOLD[2]); line(c, [-8.6, -5, 8.6, -5], 0.6, GOLD[2]); px(c, -6, -5.3, 2.4, 0.4, GOLD[0]);
  if ((f >> 3) % 5 === 0) star(c, -5, -2.4, 1.6, '#FFFFFF');
  c.restore();
};

/** The neck brace, rolled off by itself: on its side, smudged with soot, a rhinestone twinkling. */
export const drawSteveBrace = (c: Ctx, x: number, groundY: number, f: number) => {
  c.save(); c.translate(Math.round(x), Math.round(groundY));
  shape(c, () => c.roundRect(-9, -9.4, 18, 9.4, 3.6), BRACE_R, -9, 9, 0.9);
  ell(c, 0, -4.8, 6.4, 2.6, BRACE_R[3]); ell(c, 0, -4.6, 5.4, 1.8, BRACE_R[4]);   // (its hole, seen into)
  ell(c, -4, -7, 3, 1.4, dith(c, '#3F3A36')); ell(c, 5, -2, 2.4, 1.2, dith(c, '#3F3A36'));
  px(c, -9, -3, 5, 2.4, '#6B7280'); px(c, -11.6, -1.6, 3, 1.2, '#6B7280');   // (the velcro strap, trailing)
  for (let i = 0; i < 3; i++) { const sx = 2 + i * 2.2; ell(c, sx, -1.4, 0.7, 0.7, '#DBEAFE'); if ((Math.floor(f / 8) % 3) === i) star(c, sx, -1.6, 1.3, '#FFFFFF'); }
  c.restore();
};

/** The jumpsuit's legs, burned off him: a crumpled heap of yellow (the stripe through it), crisped black, on fire. */
export const drawStevePants = (c: Ctx, x: number, groundY: number, f: number) => {
  c.save(); c.translate(Math.round(x), Math.round(groundY));
  const heap = () => { c.moveTo(-13, 0); c.quadraticCurveTo(-13, -7, -6, -8); c.quadraticCurveTo(0, -10, 5, -7.4); c.quadraticCurveTo(12, -7, 13, 0); c.closePath(); };
  shape(c, heap, SUIT_R, -13, 13);
  line(c, [-10, -3, -3, -6.6, 4, -4, 10, -5.6], 1.8, STRIPE_R[1]);
  line(c, [-6, -1, -2, -4], 0.6, SUIT_R[3]); line(c, [3, -1.4, 7, -4.6], 0.6, SUIT_R[3]);
  // (crisped: black ragged holes, the edges glowing)
  for (const [hx, hy, r] of [[-7, -5, 2.4], [6, -4, 2], [0, -7.6, 1.8]] as const) { ell(c, hx, hy, r, r * 0.7, '#1C1917'); if ((f + hx) % 8 < 4) px(c, hx + r * 0.6, hy, 0.8, 0.8, '#F97316'); }
  // (the fire on it: stepped tongues, flickering)
  for (let i = 0; i < 3; i++) {
    const fx = -6 + i * 6, h = 6 + Math.sin(f * 0.5 + i * 2.1) * 2.4 + (i % 2) * 2, by = -6 - (i === 1 ? 2 : 0);
    fill(c, '#DC2626', () => { c.moveTo(fx - 3, by); c.lineTo(fx, by - h - 2); c.lineTo(fx + 3, by); c.closePath(); });
    fill(c, '#F97316', () => { c.moveTo(fx - 2, by); c.lineTo(fx, by - h); c.lineTo(fx + 2, by); c.closePath(); });
    fill(c, '#FDE047', () => { c.moveTo(fx - 1, by); c.lineTo(fx, by - h * 0.5); c.lineTo(fx + 1, by); c.closePath(); });
  }
  c.restore();
};
