// PIPER THE PIXIE, drawn (Fairy Land's boss: everybody draws her from here). Drawn at Meathead 1's boss grade, on par
// with Tucker, Donnie and Artie: color ramps (light, base, shade, deep, line) in stepped bands with a dithered seam
// between them, every material its own darkest tone for an outline.
//
// The joke (the user's): all land long she's a SULTRY VOICE over the park's PA; at the end the door's kicked in and she's
// MORBIDLY OBESE. A pixie the size of a hot tub: a hot-pink satin gown, sequined, straining at every seam (one's split
// up her thigh, another under the arm), her belly in rolls under it, arms with wings of their own, three chins, ankles
// spilling over little glass heels; a towering platinum beehive with a gold tiara jammed in it, false lashes, blue
// eyeshadow to the brows, a beauty mark, a red pout; a gold star wand; and on her back a pair of gossamer pixie wings
// far too small to lift her (they buzz like mad when she's angry, and nothing happens). Glitter comes off her.
//
// Her sin is LUST (the user's), but not for sex: for being FOUGHT OVER. She lures the suitors with the promise of
// herself and gets her kicks watching men kill each other for her (the trials are her bloodsport). So her poses:
// lounging and watching (a chaise, a bonbon), gloating (hands clasped under her chins, delighted, savoring it), the
// sultry talk, and ENRAGED (insulted: red to the roots, the beehive coming down, fists up, the wings buzzing).
//
// drawPiper(c, x, feetY, facing, frame, pose, opts): her feet's point (world or screen), facing 1 right / -1 left.
// drawPiperCloseup(c, cx, cy, scale, frame, opts): her face at close-up size (a portrait: the reveal, the insult's
// reaction, the fight's taunts).
// opts.thin (her fight's flintlock holes, the deflated balloon: bedroom/): 0 her .. 1 a SUPERMODEL .. 2 skin and bone.

import { drawGrossUp } from './piperGross';
import { elbow, reachTo } from '../art/limb';

type Ctx = CanvasRenderingContext2D;

export type PiperPose =
  | 'stand'    // weight on one hip, the wand hand on it, the other hand toying with her hair
  | 'talk'     // purring: the wand hand out, waving it slowly, the other on her hip
  | 'gloat'    // watching men die for her: both hands clasped under her chins, up on her toes, delighted
  | 'lounge'   // sprawled on her side on her heart-shaped chaise, head propped on a hand, a bonbon in the other
  | 'enraged'  // insulted: fists up and shaking, stamping, the beehive coming loose, the wings buzzing
  | 'point'    // jabbing the wand at somebody (a curse, an order)
  | 'hurt'     // hit: reeling, the jiggle going through her
  | 'flat';    // down: on her back, a mountain range of pink, the wings crumpled, the wand rolled away
export type PiperFace = 'sultry' | 'talk' | 'gloat' | 'rage' | 'shock' | 'hurt' | 'out';

export interface PiperOpts {
  /** Talking: her mouth goes (shapes off the frame count). */
  talking?: boolean;
  /** Her face, if not the pose's own. */
  face?: PiperFace;
  /** (lounge) the chaise drawn under her (default yes). */
  chaise?: boolean;
  /** How far her beehive's come down (0 up .. 1 a wreck): the fight's damage, the rage. */
  mess?: number;
  /** (her fight's flintlock holes: the deflated balloon) How much of her's leaked out: 0 her (morbidly obese) .. 1 a
   *  SUPERMODEL (slim, cheekbones, the gown fitting) .. 2 dangerously thin (skin and bone, the gown hanging off her). */
  thin?: number;
  /** (her fight's elemental throws) An overhand throw: `k` 0 .. TOSS_RELEASE the wind-up (the arm drawn back, the
   *  ball in her hand (`grow`: how formed, 0..1; default whole)), the release at TOSS_RELEASE, on to 1 the follow-through; the ball's element. Over the
   *  pose's arms and lean. */
  toss?: { k: number; kind: 'fire' | 'ice' | 'shock'; grow?: number };
}

// ---------------------------------------------------------------------------------------------------------------
// The throw (her fight's fireballs, iceballs, bolts)

/** Where in the throw the ball leaves her hand. */
export const TOSS_RELEASE = 0.5;
const TOSS_UPPER = 27, TOSS_FORE = 25;
const lerpKeys = (keys: readonly (readonly [number, number, number])[], k: number): [number, number] => {
  for (let i = 1; i < keys.length; i++) {
    const [k1, x1, y1] = keys[i], [k0, x0, y0] = keys[i - 1];
    if (k <= k1) { const t = (k - k0) / (k1 - k0 || 1), e = t * t * (3 - 2 * t); return [x0 + (x1 - x0) * e, y0 + (y1 - y0) * e]; }
  }
  const l = keys[keys.length - 1]; return [l[1], l[2]];
};
// (local, facing right, about her feet: the throwing (near) hand drawn back up behind her beehive, whipped over to the
// release up in front, on down across her; the far hand (the wand in it) out at him for the aim, then swung back)
const TOSS_NEAR = [[0, 46, -104], [0.32, -12, -154], [TOSS_RELEASE, 46, -152], [0.75, 70, -104], [1, 54, -72]] as const;
const TOSS_FAR = [[0, 30, -112], [0.32, 50, -122], [TOSS_RELEASE, 20, -116], [0.75, -40, -98], [1, -36, -92]] as const;
const TOSS_LEAN = [[0, 0, 0], [0.32, -0.09, 0], [TOSS_RELEASE, 0.08, 0], [0.75, 0.15, 0], [1, 0.06, 0]] as const;
/** The throw's pose at `k`: her lean, the near shoulder, the throwing hand (in reach), its elbow (bent the way elbows
 *  bend: limb.ts), the far hand. */
const tossPose = (k: number, bw: number, hk: number, sh: number) => {
  const lean = lerpKeys(TOSS_LEAN, k)[0];
  const sx = 38 * bw, [nx, ny] = lerpKeys(TOSS_NEAR, k);
  const hand = reachTo(sx, sh, nx * hk, ny, TOSS_UPPER, TOSS_FORE);
  const elb = elbow(sx, sh, hand[0], hand[1], TOSS_UPPER, TOSS_FORE, 1);
  const [fx, fy] = lerpKeys(TOSS_FAR, k);
  return { lean, sx, hand, elb, far: [fx * hk, fy] as [number, number] };
};
/** Where her throwing hand is at `k` (local to her feet, facing right): the ball's spawn point at the release. */
export const piperTossHand = (k: number, thin = 0): [number, number] => {
  const t = Math.max(0, Math.min(2, thin)), bw = piperBodyW(t), hk = 0.45 + 0.55 * bw;
  const P = tossPose(k, bw, hk, -114);
  const cs = Math.cos(P.lean), sn = Math.sin(P.lean);
  return [P.hand[0] * cs - P.hand[1] * sn, P.hand[0] * sn + P.hand[1] * cs];
};
/** The ball in her hand: an element's orb, forming (`grow` 0..1), glowing. */
const tossBall = (c: Ctx, x: number, y: number, kind: 'fire' | 'ice' | 'shock', grow: number, f: number) => {
  const r = 3 + 6 * grow;
  const R = kind === 'fire' ? ['#7A1A04', '#E0420C', '#F98A1C', '#FDCB4A', '#FFF4C0'] : kind === 'ice' ? ['#1E4A7A', '#4A90C8', '#8ED0F0', '#D4F0FF', '#FFFFFF'] : ['#3A1A6A', '#7A3ACC', '#B47AF4', '#E8D4FF', '#FFFFFF'];
  c.globalAlpha = 0.22 + 0.08 * Math.sin(f * 0.5); ell(c, x, y, r * 2.4, r * 2.4, R[2]); c.globalAlpha = 0.35; ell(c, x, y, r * 1.6, r * 1.6, R[3]); c.globalAlpha = 1;
  ell(c, x, y, r + 1, r + 1, R[0]); ell(c, x, y, r, r, R[1]); ell(c, x - r * 0.15, y - r * 0.15, r * 0.7, r * 0.7, R[2]); ell(c, x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.4, R[3]); px(c, x - r * 0.45, y - r * 0.5, 1.5, 1.5, R[4]);
  if (kind === 'fire') for (let k = 0; k < 3; k++) { const ph = (f + k * 3) % 9; ell(c, x + (k - 1) * r * 0.5, y - r - ph * 0.8, 1.8 - ph * 0.15, 2.6 - ph * 0.2, ph < 4 ? R[3] : R[2]); }
  else if (kind === 'ice') for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + f * 0.05; sparkle(c, x + Math.cos(a) * (r + 3), y + Math.sin(a) * (r + 3), 1.5, R[4]); }
  else for (let k = 0; k < 3; k++) { const a = ((f * 7 + k * 41) % 63) / 10; line(c, [x, y, x + Math.cos(a) * (r + 3), y + Math.sin(a) * (r + 3), x + Math.cos(a + 0.4) * (r + 7), y + Math.sin(a + 0.4) * (r + 7)], 1, k % 2 ? R[3] : R[4]); }
};

/** How wide her body is drawn at `thin` (1 her own width .. 0.45 the supermodel .. 0.23 the bones). */
export const piperBodyW = (thin = 0) => { const t1 = Math.min(1, Math.max(0, thin)), t2 = Math.max(0, Math.min(1, thin - 1)); return 1 - 0.55 * t1 - 0.22 * t2; };

/** How tall she is (feet to the top of her beehive), for words over her; how wide. */
export const PIPER_H = 176;
export const PIPER_W = 118;

// ---------------------------------------------------------------------------------------------------------------
// Ramps: light, base, shade, deep, line

type Ramp = readonly [string, string, string, string, string];
const SKIN: Ramp = ['#FFEADC', '#F8CDB4', '#E8A68C', '#C47E6A', '#6E3A30'];
const RAGE: Ramp = ['#FFB4A0', '#F47A6A', '#D8524C', '#AE3638', '#5A1418'];
const BLUSH = '#F49AA0';
const GOWN: Ramp = ['#FFB6DE', '#F45AAE', '#D23488', '#A01E64', '#4E0830'];
const SATIN_HI = '#FFE4F4';
const HAIR: Ramp = ['#FFFCEC', '#F6E8B0', '#DCC67E', '#B09A54', '#5A4A1E'];
const GOLD: Ramp = ['#FFF8C4', '#F6D24E', '#D0A02C', '#946E16', '#4A3608'];
const WING: Ramp = ['#F8F4FF', '#DCD0FF', '#B8A4F0', '#8A74D0', '#4A3A8A'];
const SHOE: Ramp = ['#FFFFFF', '#D8F4FF', '#A8DCF4', '#78B4D8', '#2A4A6A'];
const LIPS = '#D21E4A', LIPS_HI = '#FF7090', SHADOW_EYE = '#5A8AE8', LASH = '#120A10';
/** (dangerously thin) Her skin gone gray and papery. */
const GAUNT: Ramp = ['#F2E4DA', '#D8C2B4', '#B49C8E', '#8A7266', '#3E2E28'];
const CHAISE: Ramp =['#FFD0E8', '#E880B8', '#C0508E', '#8E2E66', '#3E0C2A'];

// ---------------------------------------------------------------------------------------------------------------
// Painting helpers

const dithers = new Map<string, CanvasPattern | string>();
/** A 2x2 checker of a color (the dither between two bands of a ramp), made the once per color. */
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
/** Her textures, painted the once each as a little tile and laid over a shape (clipped to it) as a pattern: the
 *  cellulite's dimples, the stubble on her legs, the sequins on the satin, the glitter stuck in her sweat. */
const textures = new Map<string, CanvasPattern | null>();
const tex = (c: Ctx, key: string, w: number, h: number, paint: (g: Ctx) => void): CanvasPattern | null => {
  if (textures.has(key)) return textures.get(key)!;
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  paint(cv.getContext('2d')!);
  const p = c.createPattern(cv, 'repeat');
  textures.set(key, p);
  return p;
};
const dots = (g: Ctx, col: string, pts: number[]) => { g.fillStyle = col; for (let i = 0; i < pts.length; i += 2) g.fillRect(pts[i], pts[i + 1], 1, 1); };
const CELLULITE = (c: Ctx) => tex(c, 'cellulite', 9, 7, (g) => { dots(g, 'rgba(110, 50, 42, 0.42)', [1, 1, 2, 1, 6, 4, 3, 5, 4, 5]); dots(g, 'rgba(255, 244, 232, 0.4)', [1, 2, 2, 2, 6, 5, 3, 6, 4, 6]); });
const STUBBLE = (c: Ctx) => tex(c, 'stubble', 5, 4, (g) => { dots(g, 'rgba(50, 26, 18, 0.55)', [0, 0, 3, 2]); dots(g, 'rgba(50, 26, 18, 0.3)', [1, 3, 4, 0]); });
const SEQUINS = (c: Ctx) => tex(c, 'sequins', 6, 6, (g) => { dots(g, 'rgba(255, 214, 238, 0.6)', [0, 0, 3, 3]); dots(g, 'rgba(110, 8, 56, 0.35)', [1, 1, 4, 4]); dots(g, 'rgba(255, 255, 255, 0.55)', [3, 0]); });
const GREASE = (c: Ctx) => tex(c, 'grease', 11, 9, (g) => { dots(g, '#FFFFFF', [2, 1]); dots(g, '#FFE070', [8, 4]); dots(g, '#FFB0E0', [5, 7]); dots(g, 'rgba(255, 255, 255, 0.45)', [9, 0, 0, 5]); });
/** A texture laid over a shape (`k` how strongly). */
const overlay = (c: Ctx, path: () => void, pat: CanvasPattern | null, k = 1) => {
  if (!pat || k <= 0) return;
  c.save(); c.beginPath(); path(); c.clip(); c.globalAlpha *= k; c.fillStyle = pat; c.fillRect(-400, -400, 800, 800); c.restore();
};

/** A shape in its ramp: the base, a lit band down its left, a shade band then a deep one down its right (stepped, a
 *  dithered seam between each), outlined in its line tone. */
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
  if (lw > 0) { c.beginPath(); path(); c.strokeStyle = r[4]; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); }
};
/** A shape lit from above (a roll of belly, a chin): lit across its top, shaded across its bottom. */
const shapeTop = (c: Ctx, path: () => void, r: Ramp, y0: number, y1: number, lw = 1) => {
  c.beginPath(); path(); c.fillStyle = r[1]; c.fill();
  c.save(); c.clip();
  const h = y1 - y0;
  c.fillStyle = r[0]; c.fillRect(-999, y0 - 4, 1998, h * 0.2 + 4);
  c.fillStyle = dith(c, r[0]); c.fillRect(-999, y0 + h * 0.2, 1998, Math.max(1, h * 0.08));
  c.fillStyle = dith(c, r[2]); c.fillRect(-999, y0 + h * 0.6, 1998, Math.max(1, h * 0.08));
  c.fillStyle = r[2]; c.fillRect(-999, y0 + h * 0.68, 1998, h + 4);
  c.fillStyle = r[3]; c.fillRect(-999, y0 + h * 0.88, 1998, h + 4);
  c.restore();
  if (lw > 0) { c.beginPath(); path(); c.strokeStyle = r[4]; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); }
};
const fill = (c: Ctx, color: string | CanvasPattern, path: () => void) => { c.fillStyle = color; c.beginPath(); path(); c.fill(); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, color: string | CanvasPattern, rot = 0) => fill(c, color, () => c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2));
const px = (c: Ctx, x: number, y: number, w: number, h: number, color: string | CanvasPattern) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
const line = (c: Ctx, pts: number[], w: number, color: string, cap: CanvasLineCap = 'round') => {
  c.strokeStyle = color; c.lineWidth = w; c.lineCap = cap; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.stroke();
};
/** A fat limb (an upper arm with its own wing of flab, a calf): a tapered tube from (x1, y1) r1 to (x2, y2) r2, in its
 *  ramp, `sag` the flab hanging off its underside. */
const limbPath = (c: Ctx, x1: number, y1: number, r1: number, x2: number, y2: number, r2: number, sag = 0) => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
  // (the side facing down: the flab hangs off that one, whichever way the limb points)
  let nx = -uy, ny = ux;
  if (ny < 0 || (ny === 0 && nx < 0)) { nx = -nx; ny = -ny; }
  const upA = Math.atan2(-ny, -nx), dnA = Math.atan2(ny, nx);
  // (round the far end from the up side to the down side through the limb's direction: which way the sweep goes)
  const ccw = !(ny * ux - nx * uy > 0);
  return () => {
    c.moveTo(x1 - nx * r1, y1 - ny * r1);
    c.lineTo(x2 - nx * r2, y2 - ny * r2);
    c.arc(x2, y2, r2, upA, dnA, ccw);
    const rm = (r1 + r2) / 2;
    c.quadraticCurveTo((x1 + x2) / 2 + nx * (rm + sag * 1.5), (y1 + y2) / 2 + ny * (rm + sag * 1.5), x1 + nx * r1, y1 + ny * r1);
    c.arc(x1, y1, r1, dnA, upA, ccw);
    c.closePath();
  };
};
/** Where the elbow (the knee) goes between a root and its end, `L1`, `L2` the two bones' lengths, bent the way that
 *  scores best on (`ox`, `oy`) (out to the side, down): the arm stays one length whatever the hand does. */
const joint = (sx: number, sy: number, hx: number, hy: number, L1: number, L2: number, ox: number, oy: number): [number, number] => {
  const dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy) || 1;
  if (d >= L1 + L2 - 0.5) {
    // (at full stretch: nearly straight, a hair of bend so the elbow still shows)
    const t = L1 / (L1 + L2), px0 = -dy / d, py0 = dx / d, s = px0 * ox + py0 * oy >= 0 ? 1 : -1;
    return [sx + dx * t + px0 * s * 2.5, sy + dy * t + py0 * s * 2.5];
  }
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const mx = sx + (dx * a) / d, my = sy + (dy * a) / d, px0 = -dy / d, py0 = dx / d;
  const e1: [number, number] = [mx + px0 * h, my + py0 * h], e2: [number, number] = [mx - px0 * h, my - py0 * h];
  const sc = (e: [number, number]) => (e[0] - sx) * ox + (e[1] - sy) * oy;
  return sc(e1) >= sc(e2) ? e1 : e2;
};
/** A star (the wand's, the glitter's). */
const star = (c: Ctx, x: number, y: number, r: number, col: string, rot = 0) => fill(c, col, () => {
  for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; i ? c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath();
});
const sparkle = (c: Ctx, x: number, y: number, s: number, col: string) => { px(c, x - 0.5, y - s, 1, s * 2 + 1, col); px(c, x - s, y - 0.5, s * 2 + 1, 1, col); };

// ---------------------------------------------------------------------------------------------------------------
// Her parts (all facing right, about her feet; a frame's `j` is the jiggle (0..1) going through her)

/** The wings: little gossamer things on her back (`buzz`: blurred, beating; `crumple`: bent, down). */
const wings = (c: Ctx, x: number, y: number, f: number, buzz: boolean, crumple = false) => {
  // (straining: a tremble in them even at rest, like they're holding her up)
  const beat = buzz ? Math.sin(f * 2.2) * 0.5 : Math.sin(f * 0.08) * 0.08 + Math.sin(f * 0.9) * 0.025;
  for (const [k, sc] of [[0, 1], [1, 0.8]] as const) {
    c.save(); c.translate(x - k * 4, y + k * 6); c.rotate(-0.5 - beat - k * 0.3 + (crumple ? 1.1 : 0)); c.scale(sc, sc);
    c.globalAlpha = buzz ? 0.55 : 0.85;
    const path = () => { c.moveTo(0, 0); c.bezierCurveTo(-8, -18, -26, -26, -30, -12); c.bezierCurveTo(-30, -2, -14, 4, 0, 0); };
    shape(c, path, WING, -30, 0);
    // (an oil-slick sheen across the membrane)
    c.save(); c.beginPath(); path(); c.clip(); c.globalAlpha *= 0.4;
    ell(c, -18, -13, 10, 3, '#B8F4FF', -0.4); ell(c, -21, -8, 8, 2.5, '#FFC8F0', -0.4); ell(c, -10, -6, 6, 2, '#FFF4B8', -0.4);
    c.restore();
    c.globalAlpha = 1;
    // (the veins, branching, the cells between them; a ragged tear in the near one; glitter stuck on; a glint)
    line(c, [0, 0, -18, -14, -26, -14], 0.7, WING[3]); line(c, [-8, -4, -20, -4], 0.6, WING[3]);
    line(c, [-10, -8, -12, -18], 0.5, WING[3]); line(c, [-18, -14, -22, -21], 0.5, WING[3]); line(c, [-14, -4, -17, 0], 0.5, WING[3]); line(c, [-22, -4, -28, -8], 0.5, WING[3]);
    line(c, [-5, -7, -9, -12], 0.4, WING[4]);
    if (!k) { line(c, [-29, -9, -25, -9, -27, -6, -24, -5], 0.6, WING[4]); px(c, -26, -8, 1, 1, '#FFFFFF'); }
    for (let i = 0; i < 5; i++) { const gx = -5 - ((i * 7) % 22), gy = -3 - ((i * 5) % 14); px(c, gx, gy, 1, 1, (f + i * 11 + k * 5) % 30 < 4 ? '#FFFFFF' : i % 2 ? '#FFD6F4' : '#FFF0A0'); }
    px(c, -22, -18, 2, 1, '#FFFFFF');
    c.restore();
  }
  if (buzz) for (let i = 0; i < 3; i++) line(c, [x - 34 - i * 4, y - 24 + i * 8, x - 40 - i * 4, y - 22 + i * 8], 1, '#FFFFFF');
};

/** The heels: little glass slippers, the ankles spilling over them. */
const foot = (c: Ctx, x: number, y: number, near: boolean) => {
  const r = near ? SHOE : ([SHOE[1], SHOE[2], SHOE[3], SHOE[3], SHOE[4]] as const);
  shape(c, () => { c.moveTo(x - 6, y); c.lineTo(x - 6, y - 5); c.quadraticCurveTo(x + 2, y - 8, x + 12, y - 3); c.lineTo(x + 12, y); c.closePath(); }, r, x - 6, x + 12, 0.8);
  px(c, x - 6, y - 1, 2, 4, r[3]);
  px(c, x - 2, y - 6, 4, 1, '#FFFFFF');
  // (the glass cracking under her: a crack up the side, the heel bowed)
  line(c, [x + 4, y - 5, x + 6, y - 3, x + 5, y - 1], 0.5, '#FFFFFF'); line(c, [x + 4.6, y - 5, x + 6.6, y - 3], 0.4, r[4]);
  // (the ankle spilling over the top, its fat hanging in a ring)
  const ankle = () => c.ellipse(x + 2, y - 8, 8, 4, 0, 0, Math.PI * 2);
  shapeTop(c, ankle, near ? SKIN : ([SKIN[1], SKIN[2], SKIN[3], SKIN[3], SKIN[4]] as const), y - 12, y - 4, 0.8);
  overlay(c, ankle, STUBBLE(c), 0.8);
};

/** The beehive: platinum, towering, the tiara jammed in its front (`mess` brings it down in loose loops). */
const beehive = (c: Ctx, hx: number, hy: number, mess: number, f: number) => {
  const tilt = mess * 0.5;
  c.save(); c.translate(hx, hy - 10); c.rotate(-tilt * 0.6);
  const path = () => { c.moveTo(-17, 6); c.bezierCurveTo(-24, -14, -20, -46 + mess * 20, -2, -52 + mess * 22); c.bezierCurveTo(16, -54 + mess * 22, 24, -30, 18, 4); c.closePath(); };
  shape(c, path, HAIR, -24, 24);
  // (the swirl lines of the backcombing)
  for (let k = 0; k < 4; k++) { c.strokeStyle = HAIR[3]; c.lineWidth = 0.8; c.beginPath(); c.arc(0, -16 - k * 8 + mess * 10, 14 - k * 2, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  px(c, -10, -40 + mess * 20, 6, 2, HAIR[0]);
  c.save(); c.beginPath(); path(); c.clip();
  // (the backcombed strands; the hairspray's sheen, dithered; the black roots coming through the bleach at its base)
  for (let k = 0; k < 7; k++) line(c, [-17 + k * 6, 4, -15 + k * 5, -14 - (k % 3) * 9 + mess * 10, -12 + k * 4, -26 - (k % 2) * 8 + mess * 14], 0.5, k % 2 ? HAIR[2] : HAIR[0]);
  c.fillStyle = dith(c, HAIR[0]); c.fillRect(-13, -47 + mess * 20, 7, 12);
  c.fillStyle = dith(c, '#6A4A26'); c.fillRect(-24, 0, 48, 3); px(c, -24, 3, 48, 4, '#5A3E1E');
  c.restore();
  // (frizz flying off it; bobby pins jammed in, a couple working loose)
  line(c, [-21, -26 + mess * 12, -26, -30 + mess * 12, -25, -35 + mess * 12], 0.5, HAIR[1]); line(c, [20, -18, 25, -22, 24, -27], 0.5, HAIR[1]);
  line(c, [-18, -8, -12, -13], 0.9, '#1A1A22'); line(c, [13, -24, 19, -19], 0.9, '#1A1A22'); line(c, [-4, -44 + mess * 20, 2, -48 + mess * 20], 0.9, '#1A1A22');
  // (loose loops falling out of it, the worse it's got)
  if (mess > 0.2) for (let k = 0; k < Math.round(mess * 5); k++) { c.strokeStyle = HAIR[2]; c.lineWidth = 1.4; c.beginPath(); c.arc(-14 + k * 7, 2 + (k % 2) * 6, 5, 0, Math.PI * 1.6); c.stroke(); c.strokeStyle = HAIR[4]; c.lineWidth = 0.5; c.beginPath(); c.arc(-14 + k * 7, 2 + (k % 2) * 6, 3.6, 0.3, Math.PI * 1.4); c.stroke(); }
  // (the tiara, jammed in the front of it: gold, three points, a pink heart stone, a blue one, a socket gone empty)
  c.save(); c.translate(6, -2); c.rotate(0.15 + mess * 0.6);
  shape(c, () => { c.moveTo(-10, 0); c.lineTo(-10, -6); c.lineTo(-6, -3); c.lineTo(-2, -11); c.lineTo(2, -3); c.lineTo(6, -7); c.lineTo(8, 0); c.closePath(); }, GOLD, -10, 8, 0.8);
  ell(c, -2, -4, 2, 2, '#F43F8E'); px(c, -3, -5, 1, 1, '#FFFFFF');
  ell(c, -8, -2, 1, 1, '#4AB4F4'); ell(c, 5, -2, 1, 1, '#2A1A08');
  for (let k = 0; k < 4; k++) px(c, -9 + k * 5, -1, 1, 1, GOLD[0]);
  if ((f + 7) % 26 < 4) sparkle(c, -2, -11, 1.5, '#FFFFFF');
  c.restore();
  c.restore();
  // (glitter coming off it)
  if (f % 18 < 9) sparkle(c, hx + 14 - (f % 7), hy - 50 + (f % 11), 1.5, '#FFFFFF');
};

/** Her head: a round face in a ring of chins, the beauty mark, the lashes and the eyeshadow, the pout; `face` the look,
 *  `talking` the mouth going. (hx, hy) the middle of her face. */
const head = (c: Ctx, hx: number, hy: number, face: PiperFace, f: number, talking: boolean, mess: number, thin = 0) => {
  const t1 = Math.min(1, Math.max(0, thin)), t2 = Math.max(0, Math.min(1, thin - 1));
  const sk = face === 'rage' ? RAGE : t2 > 0.3 ? GAUNT : SKIN;
  // (the chins: three rolls, under and round the jaw; leaked away one by one; a neck under them once they're gone)
  const chins = Math.round(3 * (1 - t1));
  if (chins < 3) {
    // (the neck: flaring into her shoulders at its foot, inked down its sides only (no line across where it meets her),
    // the tendons down it, the hollow of the throat)
    const nw = 6 - t2 * 2, nb = nw + 4;
    const neck = () => { c.moveTo(hx - nw, hy + 8); c.lineTo(hx + nw, hy + 8); c.lineTo(hx + nw, hy + 22); c.quadraticCurveTo(hx + nw, hy + 27, hx + nb + 2, hy + 29); c.lineTo(hx - nb - 2, hy + 29); c.quadraticCurveTo(hx - nw, hy + 27, hx - nw, hy + 22); c.closePath(); };
    shape(c, neck, sk, hx - nb, hx + nb, 0);
    line(c, [hx - nw, hy + 8, hx - nw, hy + 22], 0.9, sk[4]); line(c, [hx + nw, hy + 8, hx + nw, hy + 22], 0.9, sk[4]);
    line(c, [hx - nw + 2, hy + 14, hx - 1, hy + 26], 0.5, sk[2]); line(c, [hx + nw - 2, hy + 14, hx + 1, hy + 26], 0.5, sk[2]);
    ell(c, hx, hy + 26.5, 1.6, 1, sk[2]);
  }
  for (let k = chins - 1; k >= 0; k--) {
    const chin = () => c.ellipse(hx + 2, hy + 12 + k * 6, 16 + k * 2, 7, 0, 0, Math.PI * 2);
    shapeTop(c, chin, sk, hy + 5 + k * 6, hy + 19 + k * 6, 0.9);
    // (stubble on them; a sweat crease in the fold)
    overlay(c, chin, STUBBLE(c), 0.7);
    line(c, [hx - 8 - k * 2, hy + 17 + k * 6, hx + 2, hy + 18.5 + k * 6, hx + 12 + k * 2, hy + 17 + k * 6], 0.5, sk[3]);
  }
  // (a long hair off the bottom chin)
  if (chins) line(c, [hx + 8, hy + 12 + chins * 6, hx + 9, hy + 15 + chins * 6, hx + 7, hy + 17 + chins * 6], 0.5, '#3A1A10');
  // (the face itself: round, the cheeks puffing out; slimmer as she leaks, a jaw, then hollow)
  const fw = 17 - t1 * 4 - t2 * 3;
  const faceP = () => c.ellipse(hx, hy, fw, 16 - t2 * 1, 0, 0, Math.PI * 2);
  shape(c, faceP, sk, hx - fw, hx + fw);
  // (the foundation caked on, stopping in a line at her jaw; cracking; glitter stuck in the grease)
  if (face !== 'rage' && t2 < 0.3) line(c, [hx - fw + 3, hy + 9, hx - 4, hy + 14, hx + 6, hy + 14, hx + fw - 3, hy + 9], 0.6, '#E8A878');
  line(c, [hx - 8, hy - 12, hx - 5, hy - 13, hx - 4, hy - 11], 0.4, sk[3]); line(c, [hx + 10, hy + 1, hx + 12, hy + 3], 0.4, sk[3]);
  overlay(c, faceP, GREASE(c), 0.9);
  // (sweat: beads on her temple and her forehead, catching the light)
  ell(c, hx - 12, hy - 7 + ((f >> 3) % 12) * 0.5, 0.9, 1.3, 'rgba(255, 255, 255, 0.75)');
  ell(c, hx + 2, hy - 13, 0.8, 1, 'rgba(255, 255, 255, 0.7)'); ell(c, hx + 9, hy - 12, 0.7, 0.9, 'rgba(255, 255, 255, 0.7)');
  if (face === 'rage') { line(c, [hx - 3, hy - 15, hx - 5, hy - 12, hx - 3, hy - 9], 1, '#9A3A8A'); line(c, [hx - 3.5, hy - 15, hx - 5.5, hy - 12], 0.4, '#F0A0D8'); line(c, [hx + 14, hy - 10, hx + 15, hy - 6], 0.9, '#9A3A8A'); }
  if (t1 > 0.6) line(c, [hx - fw + 3, hy + 6, hx + 2, hy + 14, hx + fw - 2, hy + 7], 0.8, sk[3]);
  if (t2 > 0) {
    // (sunken: the cheeks hollowed under the bones, the eyes in pits)
    c.globalAlpha = t2;
    ell(c, hx + 8, hy + 6, 4, 4, sk[3]); ell(c, hx - 6, hy + 6, 3, 4, sk[3]);
    ell(c, hx + 7, hy - 3, 6, 5, sk[3]); ell(c, hx - 5, hy - 3, 5, 5, sk[3]);
    c.globalAlpha = 1;
  }
  ell(c, hx + 9, hy + 5, 5 - t1 * 2, 3, face === 'rage' ? '#E83A3A' : BLUSH);
  ell(c, hx - 7, hy + 5, 4 - t1 * 2, 2.5, face === 'rage' ? '#E83A3A' : BLUSH);
  // (the eyes: the eyeshadow up to the brows, the lashes, the irises (bulging when she's furious))
  const eye = (ex: number, near: boolean) => {
    const sh = face === 'rage' ? '#3A5AC8' : SHADOW_EYE, o = near ? 1 : -1;
    // (the eyeshadow: violet troweled up to the brows, blue in the crease, dithered off at the edges)
    ell(c, ex, hy - 7, near ? 5.5 : 4.5, 3.4, '#A868D8'); ell(c, ex, hy - 9.5, near ? 5 : 4, 1.6, dith(c, '#A868D8'));
    ell(c, ex, hy - 4, near ? 5 : 4, 4, sh); ell(c, ex - o * 1.5, hy - 6, 2.4, 1.2, '#8AB4F8');
    // (the mascara smudged under it)
    px(c, ex - 3, hy + 1, 7, 1, dith(c, '#3A2A48'));
    if (face === 'out') { line(c, [ex - 3, hy - 6, ex + 3, hy - 2], 1.2, LASH); line(c, [ex - 3, hy - 2, ex + 3, hy - 6], 1.2, LASH); return; }
    const shut = face === 'hurt' || (face === 'sultry' && f % 200 < 8);
    if (shut) { line(c, [ex - 4, hy - 3, ex + 4, hy - 3], 1.4, LASH); for (let k = -1; k <= 1; k++) line(c, [ex + k * 2.5, hy - 3, ex + k * 3, hy - 1], 0.8, LASH); return; }
    const bulge = face === 'rage' || face === 'shock' ? 1.3 : 1;
    const lid = face === 'sultry' || face === 'gloat' ? 1.6 : 0;
    ell(c, ex, hy - 3, 3.4 * bulge, 3 * bulge, '#FFFFFF');
    // (bloodshot: red threads in from the corners)
    px(c, ex - 3 * bulge, hy - 3, 1.4, 0.6, '#E0404A'); px(c, ex + 2 * bulge, hy - 2, 1.4, 0.6, '#E0404A');
    if (bulge > 1) { px(c, ex - 2, hy - 5, 0.6, 1.4, '#C8303A'); px(c, ex + 3, hy - 4, 0.6, 1.4, '#C8303A'); }
    ell(c, ex + 1, hy - 3 + lid * 0.4, 1.8, 2, face === 'rage' ? '#7A1E1E' : '#2A6A4A');
    px(c, ex + 1, hy - 3 + lid * 0.4, 0.9, 0.9, '#0A0A0A');
    px(c, ex + 1, hy - 4, 1, 1, '#FFFFFF');
    if (lid) { px(c, ex - 4, hy - 7, 8, lid + 2, sh); px(c, ex - 3, hy - 6, 3, 1, '#B8D8FF'); }
    // (the liner, flicked out past the outer corner)
    line(c, [ex - 4, hy - 5 + lid, ex + 4, hy - 5 + lid, ex + o * 6.5, hy - 8 + lid], 0.9, LASH);
    // (the lashes: long false ones, clumped with mascara at the tips)
    for (let k = -1; k <= 1; k++) { line(c, [ex + k * 2, hy - 6 + lid, ex + k * 3 + 1, hy - 10 + lid], 1, LASH); ell(c, ex + k * 3 + 1, hy - 10 + lid, 0.8, 0.8, LASH); }
    line(c, [ex + o * 4, hy - 5 + lid, ex + o * 6, hy - 9 + lid], 0.8, LASH);
  };
  eye(hx + 7, true); eye(hx - 5, false);
  // (the brows: drawn on, arched; down in a V when she's furious)
  if (face === 'rage') { line(c, [hx + 2, hy - 9, hx + 11, hy - 13], 1.6, HAIR[4]); line(c, [hx - 1, hy - 9, hx - 9, hy - 12], 1.6, HAIR[4]); }
  else { line(c, [hx + 3, hy - 11, hx + 8, hy - 13, hx + 12, hy - 11], 1.2, HAIR[4]); line(c, [hx - 2, hy - 11, hx - 6, hy - 12, hx - 9, hy - 10], 1.2, HAIR[4]); }
  // (the button nose, the beauty mark)
  ell(c, hx + 4, hy + 2, 2.4, 2, sk[2]); px(c, hx + 3, hy + 1, 1, 1, sk[0]);
  ell(c, hx + 12, hy + 8, 1, 1, '#3A1A1A'); line(c, [hx + 12, hy + 8, hx + 14, hy + 5, hx + 13.5, hy + 3.5], 0.4, '#2A1008');
  // (the nose: a blackhead or two, a nostril)
  px(c, hx + 3, hy + 3, 0.8, 0.8, '#3A1A12'); px(c, hx + 5.5, hy + 2, 0.8, 0.8, '#3A1A12'); px(c, hx + 5, hy + 3.4, 1.2, 0.8, sk[4]);
  // (the mouth: the hairs on her upper lip over it)
  const mx = hx + 3, my = hy + 9;
  for (const dx of [-3, -1, 1.5, 3.5]) px(c, mx + dx, my - 3 - (dx > 0 ? 0.4 : 0), 0.6, 1.1, 'rgba(70, 40, 26, 0.75)');
  const open = talking ? [0, 2, 4, 1][Math.floor(f / 5) % 4] : 0;
  if (face === 'rage' || face === 'shock') {
    const h = face === 'rage' ? 7 + open : 5;
    ell(c, mx, my + h / 2, 6, h / 2 + 1, '#3A0A14'); px(c, mx - 5, my, 10, 2, '#F4EAC0'); ell(c, mx, my + h - 1, 3, 1.4, '#E8607A');
    // (gaps, a gold one, her lipstick on them)
    px(c, mx - 1, my, 1, 2, '#3A0A14'); px(c, mx + 3, my, 1.4, 2, GOLD[1]); px(c, mx - 4, my, 2, 0.8, LIPS);
    line(c, [mx - 6, my - 1, mx + 6, my - 1], 1.4, LIPS);
    // (spit flying off it in the rage)
    if (face === 'rage') for (let k = 0; k < 3; k++) { const t = (f + k * 5) % 15; px(c, mx + 6 + t * 0.8, my + 1 - t * 0.5 + k * 2, 1, 1, '#E8F0FA'); }
  } else if (face === 'gloat') {
    // (a grin, delighted, her tongue at her teeth, lipstick on them)
    fill(c, LIPS, () => { c.moveTo(mx - 7, my); c.quadraticCurveTo(mx, my + 7, mx + 7, my - 1); c.quadraticCurveTo(mx, my + 3, mx - 7, my); });
    px(c, mx - 4, my + 1, 8, 2, '#F8F0D0'); px(c, mx - 2, my + 1, 2, 1, LIPS); px(c, mx + 2, my + 1, 1, 2, '#5A0A14'); px(c, mx - 4, my + 1, 1, 2, GOLD[1]);
  } else if (face === 'out' || face === 'hurt') { ell(c, mx, my + 1, 3, 2.4, '#3A0A14'); line(c, [mx - 4, my - 1, mx + 4, my - 1], 1.2, LIPS); }
  else {
    // (the pout: full red lips, a highlight; parted when she talks)
    ell(c, mx, my, 5.5, 2.2 + open * 0.3, LIPS); ell(c, mx, my + 2.4 + open * 0.6, 5, 2.4, LIPS);
    if (open) { ell(c, mx, my + 1.2 + open * 0.3, 3.2, open * 0.6, '#3A0A14'); px(c, mx - 2, my + 0.4, 4, 1, '#F4EAC0'); px(c, mx - 1, my + 0.4, 1.4, 0.8, LIPS); }
    px(c, mx - 2, my - 1, 3, 1, LIPS_HI); px(c, mx - 1, my + 3.4 + open * 0.6, 2, 0.8, LIPS_HI);
  }
  // (the lipstick smeared past her lips, off a corner and up over the bow)
  if (face !== 'out') { ell(c, mx + 6, my + 1.5, 2.2, 1.2, dith(c, LIPS)); px(c, mx - 4, my - 2.4, 3, 0.8, dith(c, LIPS)); }
  // (her earrings: gold hoops, the lobe dragged down by them)
  ell(c, hx - 15, hy + 5, 1.4, 2, sk[2]);
  c.strokeStyle = GOLD[3]; c.lineWidth = 1.4; c.beginPath(); c.arc(hx - 15, hy + 9, 3, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = GOLD[1]; c.lineWidth = 0.7; c.beginPath(); c.arc(hx - 15, hy + 9, 3, Math.PI * 0.9, Math.PI * 1.6); c.stroke();
  void mess;
};

/** The body: the gown (bodycon pink satin, sequined, straining: the seams, a split up her thigh), the rolls under it,
 *  the chest, the shoulders. `j` the jiggle. Feet at 0, hips about y -44. */
const body = (c: Ctx, j: number, f: number, thin = 0) => {
  if (thin > 0) { bodyThin(c, f, thin); return; }
  const jig = Math.sin(j * Math.PI * 6) * 2 * (1 - j);
  yoke(c, SKIN, 1);
  // (the gown's hem, flaring a little at her shins)
  const path = () => {
    c.moveTo(-34, -18); c.quadraticCurveTo(-58 - jig, -50, -50, -82); c.quadraticCurveTo(-46, -106, -30, -114);
    c.lineTo(34, -114); c.quadraticCurveTo(56, -104, 60 + jig, -76); c.quadraticCurveTo(66 + jig, -46, 40, -18); c.closePath();
  };
  shape(c, path, GOWN, -58, 66, 1.4);
  // (the rolls of belly under the satin: three soft ridges, lit along their tops, shaded under)
  for (let k = 0; k < 3; k++) {
    const y = -86 + k * 16 + jig * (k + 1) * 0.5, w = 52 - k * 4;
    c.save(); c.beginPath(); path(); c.clip();
    shapeTop(c, () => c.ellipse(8, y, w, 9, 0, 0, Math.PI * 2), GOWN, y - 9, y + 9, 0.8);
    px(c, -30 + k * 6, y - 7, 18, 1, SATIN_HI);
    c.restore();
  }
  // (the satin's sequins all over it; the belly button dented through it; a sweat stain spreading under the arm)
  overlay(c, path, SEQUINS(c));
  c.save(); c.beginPath(); path(); c.clip();
  c.strokeStyle = GOWN[3]; c.lineWidth = 0.9; c.beginPath(); c.arc(10, -71 + jig * 0.8, 2.2, Math.PI * 0.1, Math.PI * 0.9); c.stroke();
  px(c, 9, -69 + jig * 0.8, 2, 1, GOWN[4]);
  ell(c, 46, -104, 9, 7, dith(c, GOWN[3])); ell(c, 46, -106, 6, 4, GOWN[3]);
  c.restore();
  // (the seams, straining: stitches pulled into ladders, both sides; one split up her near thigh, skin in it (dimpled,
  // stretch marks); another under her arm, a roll bulging out of it)
  line(c, [44, -114, 58, -78, 46, -26], 0.8, GOWN[4]);
  for (let y = -104; y < -34; y += 6) line(c, [52 - (y + 80) * 0.05, y, 56 - (y + 80) * 0.05, y + 2], 0.6, GOWN[0]);
  line(c, [-36, -114, -50, -80, -40, -26], 0.8, GOWN[4]);
  for (let y = -104; y < -34; y += 7) line(c, [-46 + (y + 80) * 0.04, y, -42 + (y + 80) * 0.04, y + 2], 0.6, GOWN[0]);
  fill(c, SKIN[4], () => { c.moveTo(24, -18); c.lineTo(30, -46); c.lineTo(38, -18); c.closePath(); });
  const split = () => { c.moveTo(25, -19); c.lineTo(30, -44); c.lineTo(36, -19); c.closePath(); };
  fill(c, SKIN[1], split);
  overlay(c, split, CELLULITE(c)); overlay(c, split, STUBBLE(c), 0.5);
  line(c, [28, -26, 29, -32], 0.5, '#F8E0D8'); line(c, [32, -24, 33, -30], 0.5, '#F8E0D8');
  for (let y = -40; y < -20; y += 4) line(c, [28 + (y + 46) * 0.05, y, 33 - (y + 46) * 0.05, y + 1], 0.4, GOWN[4]);
  shapeTop(c, () => c.ellipse(52, -98, 5, 4, 0.4, 0, Math.PI * 2), SKIN, -102, -94, 0.7);
  line(c, [48, -103, 50, -101, 48, -99], 0.5, GOWN[4]); line(c, [56, -96, 54, -94, 56, -92], 0.5, GOWN[4]);
  // (the sequins: a scatter that twinkles in turn)
  for (let i = 0; i < 16; i++) {
    const sx = -40 + ((i * 37) % 96), sy = -104 + ((i * 53) % 82);
    const on = (f + i * 9) % 48 < 6;
    px(c, sx, sy, 1, 1, on ? '#FFFFFF' : GOWN[0]);
    if (on) sparkle(c, sx, sy, 1.5, '#FFFFFF');
  }
  // (the chest: the neckline, cleavage like a canyon, the straps biting into her shoulders)
  const chest = () => { c.moveTo(-26, -112); c.quadraticCurveTo(-10, -122, 4, -114); c.quadraticCurveTo(18, -124, 36, -112); c.quadraticCurveTo(14, -106, 4, -110); c.quadraticCurveTo(-10, -104, -26, -112); };
  shapeTop(c, chest, SKIN, -124, -104, 1);
  overlay(c, chest, GREASE(c));
  line(c, [4, -114, 4, -108], 1, SKIN[3]);
  // (stretch marks over the top; a bead of sweat running down into the canyon)
  for (const [sx, sy] of [[-14, -116], [-10, -117], [20, -118], [24, -117]]) line(c, [sx, sy, sx + 2, sy - 2], 0.4, '#F8E2DA');
  ell(c, 4, -116 + ((f >> 2) % 8) * 0.8, 0.8, 1.1, 'rgba(255, 255, 255, 0.8)');
  // (the straps biting into her shoulders, flesh bulging either side)
  for (const sx of [-24, 30]) { line(c, [sx - 2, -126, sx, -112], 0.6, SKIN[3]); line(c, [sx + 4, -126, sx + 4, -112], 0.6, SKIN[0]); line(c, [sx, -126, sx + 2, -112], 2, GOWN[2]); line(c, [sx - 0.6, -126, sx + 1.4, -112], 0.5, SATIN_HI); }
};

/** Her bare shoulders: the yoke of flesh from the base of her neck out to each arm (the gown's top cuts across it, the
 *  arms' deltoids round off its ends), lit across the top. */
const yoke = (c: Ctx, sk: Ramp, lw: number) => {
  const p = () => { c.moveTo(-44, -102); c.quadraticCurveTo(-46, -118, -36, -122); c.quadraticCurveTo(-22, -128, -8, -129); c.lineTo(18, -129); c.quadraticCurveTo(34, -128, 44, -122); c.quadraticCurveTo(54, -117, 54, -102); c.closePath(); };
  shapeTop(c, p, sk, -130, -104, lw);
  // (the collarbones' shadow, the dip at the base of the throat)
  line(c, [-30, -122, -14, -124, -2, -123], 0.6, sk[2]); line(c, [10, -123, 24, -124, 40, -121], 0.6, sk[2]);
  overlay(c, p, STUBBLE(c), 0.3);
};

/** The body leaking down (`thin` 0..2): the gown taken in to her (the rolls going flat, the seams easing), a slim
 *  supermodel's at 1 (a waist, hips, the gown fitting her like it was cut for her); past it, the gown hanging off a
 *  frame of bones (the folds of empty satin, the ribs up her chest, the collarbones, the hip bones through it). */
const bodyThin = (c: Ctx, f: number, thin: number) => {
  const t1 = Math.min(1, thin), t2 = Math.max(0, Math.min(1, thin - 1));
  const bw = piperBodyW(thin), sk = t2 > 0.3 ? GAUNT : SKIN;
  c.save(); c.scale(bw, 1);
  yoke(c, sk, 1 / bw);
  // (the gown: her shape scaled in; a waist pinched in as it goes; empty satin hanging off the bones past it)
  const waist = t1 * 12 * (1 - t2);
  const path = () => {
    c.moveTo(-34, -18); c.quadraticCurveTo(-58 + waist * 0.4, -50, -50 + waist, -82); c.quadraticCurveTo(-46, -106, -30, -114);
    c.lineTo(34, -114); c.quadraticCurveTo(56, -104, 60 - waist, -76); c.quadraticCurveTo(66 - waist * 0.4, -46, 40, -18); c.closePath();
  };
  shape(c, path, GOWN, -58, 66, 1.4 / bw);
  overlay(c, path, SEQUINS(c));
  // (the rolls going flat)
  if (t1 < 1) for (let k = 0; k < 3; k++) {
    const y = -86 + k * 16, w = 52 - k * 4;
    c.save(); c.beginPath(); path(); c.clip(); c.globalAlpha = 1 - t1;
    shapeTop(c, () => c.ellipse(8, y, w, 9, 0, 0, Math.PI * 2), GOWN, y - 9, y + 9, 0.8);
    c.restore();
  }
  // (the satin's sheen down her, and the sequins)
  line(c, [-20, -108, -24, -30], 2, SATIN_HI);
  for (let i = 0; i < 10; i++) { const on = (f + i * 9) % 48 < 6; const sx = -36 + ((i * 37) % 80), sy = -104 + ((i * 53) % 82); px(c, sx, sy, 1 / bw, 1, on ? '#FFFFFF' : GOWN[0]); }
  // (past the supermodel: the empty satin hanging in folds, a crumpled hem round her ankles)
  if (t2 > 0) for (let k = 0; k < 5; k++) line(c, [-40 + k * 18, -100, -44 + k * 18 + Math.sin(f * 0.05 + k) * 2, -20], 1.4 / bw, GOWN[3]);
  // (the chest: the neckline; at the supermodel, a decent cleavage; at the bones, a sternum and ribs)
  shapeTop(c, () => { c.moveTo(-26, -112); c.quadraticCurveTo(-10, -120 + t1 * 4, 4, -114); c.quadraticCurveTo(18, -120 + t1 * 4, 36, -112); c.quadraticCurveTo(14, -108, 4, -110); c.quadraticCurveTo(-10, -106, -26, -112); }, sk, -122, -104, 1 / bw);
  for (const sx of [-24, 30]) line(c, [sx, -126, sx + 2, -112], 2 / bw, GOWN[2]);
  c.restore();
  if (t2 > 0) {
    // (the bones: collarbones, the ribs up out of the neckline, the hip bones poking the satin)
    c.globalAlpha = t2;
    line(c, [-14 * bw - 6, -118, 0, -114, 14 * bw + 8, -118], 1.2, sk[3]);
    for (let k = 0; k < 3; k++) line(c, [-8, -112 + k * 3, 0, -110 + k * 3, 8, -112 + k * 3], 0.8, sk[3]);
    for (const hx of [-30, 34]) ell(c, hx * bw, -44, 2.5, 3, GOWN[0]);
    c.globalAlpha = 1;
  }
};

/** An arm: the upper arm fat with a wing hanging off it, the forearm, the hand (a fist, open, holding the wand, at the
 *  chin). From the shoulder (sx, sy) to the hand (hx, hy). */
const armTo = (c: Ctx, sx: number, sy: number, hx: number, hy: number, near: boolean, hand: 'open' | 'fist' | 'wand' | 'clasp' | 'bonbon', f: number, enraged: boolean, thin = 0, elb?: readonly [number, number]) => {
  const t1 = Math.min(1, Math.max(0, thin)), t2 = Math.max(0, Math.min(1, thin - 1));
  const sk = enraged ? RAGE : t2 > 0.3 ? GAUNT : SKIN, r = near ? sk : ([sk[1], sk[2], sk[3], sk[3], sk[4]] as const);
  const o = near ? 1 : -1;
  // (one arm, the same length whatever the hand's doing: the elbow found between, bent out and down)
  const [ex, ey] = elb ?? joint(sx, sy, hx, hy, 27, 25, o, 0.8);
  const lf = 1 - 0.45 * t1 - 0.3 * t2;
  const rs = Math.max(3, 11.5 * lf), r1 = Math.max(2.6, 10 * lf), re = Math.max(2.4, 7.5 * lf), rw = Math.max(2, 5 * lf);
  // (the deltoid: a round cap of shoulder over the top of the arm, joining it to her)
  const dX = sx + o * 1.5, dY = sy + 1;
  const delt = () => c.ellipse(dX, dY, rs * 1.12, rs, o * 0.35, 0, Math.PI * 2);
  const upper = limbPath(c, sx + o * 1.5, sy + 3, r1, ex, ey, re, 7 * (1 - t1));
  const elbow = () => c.arc(ex, ey, re + 0.4, 0, Math.PI * 2);
  const fore = limbPath(c, ex, ey, re, hx, hy, rw, 2 * (1 - t1));
  const x0 = Math.min(dX, ex, hx) - rs, x1 = Math.max(dX, ex, hx) + rs;
  // (inked as one piece: the outline round the lot, then the lot filled over the inside seams)
  c.strokeStyle = r[4]; c.lineWidth = 2.2; c.lineJoin = 'round';
  for (const p of [upper, elbow, fore]) { c.beginPath(); p(); c.stroke(); }
  for (const p of [upper, elbow, fore]) shape(c, p, r, x0, x1, 0);
  // (the flab hanging off it dimpled with cellulite; stubble down the forearm)
  overlay(c, upper, CELLULITE(c), 1 - t1);
  overlay(c, fore, STUBBLE(c), 0.35);
  // (the elbow: the crease in the crook of it, the point of it catching the light, dimpled; the bones knobbing out
  // when she's leaked down to them)
  const mx0 = (sx + hx) / 2 - ex, my0 = (sy + hy) / 2 - ey, md = Math.hypot(mx0, my0) || 1, mux = mx0 / md, muy = my0 / md;
  const ca = Math.atan2(-muy, -mux);
  c.strokeStyle = r[3]; c.lineWidth = 0.8; c.beginPath(); c.arc(ex + mux * re * 1.25, ey + muy * re * 1.25, re * 0.75, ca - 0.7, ca + 0.7); c.stroke();
  c.strokeStyle = r[4]; c.lineWidth = 0.5; c.beginPath(); c.arc(ex + mux * re * 1.25, ey + muy * re * 1.25, re * 0.75, ca - 0.3, ca + 0.3); c.stroke();
  px(c, ex - mux * re * 0.55 - 0.5, ey - muy * re * 0.55 - 0.5, 1.4, 1.2, r[0]);
  if (t1 < 0.6) line(c, [ex - mux * re * 0.2 - 0.8, ey - muy * re * 0.2, ex - mux * re * 0.2 + 0.8, ey - muy * re * 0.2 + 1], 0.6, r[3]);
  if (t2 > 0.2) ell(c, ex - mux * re * 0.3, ey - muy * re * 0.3, re * 0.55, re * 0.5, r[0]);
  // (the wrist: a fat ring round it where the hand starts)
  const fdx = hx - ex, fdy = hy - ey, fd = Math.hypot(fdx, fdy) || 1, wx = hx - (fdx / fd) * (rw + 2.5), wy = hy - (fdy / fd) * (rw + 2.5);
  line(c, [wx + (-fdy / fd) * rw * 0.9, wy + (fdx / fd) * rw * 0.9, wx - (-fdy / fd) * rw * 0.9, wy - (fdx / fd) * rw * 0.9], 0.6, r[3]);
  // (the deltoid over the top: lit across its crown, a crease where it rounds into the arm, the strap's dent)
  shapeTop(c, delt, r, dY - rs, dY + rs, 0);
  overlay(c, delt, CELLULITE(c), 0.5 * (1 - t1));
  const ua = Math.atan2(ey - sy, ex - sx);
  c.strokeStyle = r[3]; c.lineWidth = 0.7; c.beginPath(); c.ellipse(dX, dY, rs * 1.12, rs, o * 0.35, ua - 0.9, ua + 0.9); c.stroke();
  // (its ink: round the outside only, not where it melts into the arm nor in toward her neck)
  const angD = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
  const inA = o > 0 ? Math.PI : 0;
  c.strokeStyle = r[4]; c.lineWidth = 1; c.beginPath();
  let on = false;
  for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.12) {
    const ok = angD(a, ua) > 0.85 && angD(a, inA) > 1.15;
    const qx = dX + Math.cos(a) * rs * 1.12, qy = dY + Math.sin(a) * rs;
    if (ok) { if (on) c.lineTo(qx, qy); else c.moveTo(qx, qy); }
    on = ok;
  }
  c.stroke();
  px(c, dX - rs * 0.4, dY - rs * 0.75, rs * 0.6, 1, r[0]);
  // (the hand: sausage fingers, the nails long and pink, chipped)
  const POLISH = '#E8287A';
  if (hand === 'fist') {
    shape(c, () => c.ellipse(hx, hy, 6.5, 6, 0, 0, Math.PI * 2), r, hx - 7, hx + 7); line(c, [hx - 2, hy - 3, hx - 2, hy + 3], 0.8, r[3]); line(c, [hx + 2, hy - 3, hx + 2, hy + 3], 0.8, r[3]);
    for (const kx of [-4, 0, 4]) px(c, hx + kx - 0.5, hy - 5.4, 1, 1, r[0]);
    px(c, hx + 4, hy + 1, 2, 1.6, POLISH); px(c, hx + 5, hy + 1, 1, 0.8, r[1]);
  } else {
    shape(c, () => c.ellipse(hx, hy, 6, 5, 0, 0, Math.PI * 2), r, hx - 6, hx + 6);
    for (let k = -1; k <= 1; k++) {
      fill(c, r[1], () => c.ellipse(hx + 6, hy + k * 2.4, 3, 1.3, 0, 0, Math.PI * 2));
      line(c, [hx + 4, hy + k * 2.4 + 1.2, hx + 8, hy + k * 2.4 + 1.2], 0.4, r[3]);
      px(c, hx + 8.4, hy + k * 2.4 - 0.9, 1.8, 1.4, POLISH);
      if (k === 0) px(c, hx + 9.4, hy - 0.9, 0.8, 0.8, r[1]); // (a chip out of it)
      if (k === 1) px(c, hx + 8.4, hy + 2.4 - 0.9, 0.6, 0.6, '#FFFFFF');
    }
  }
  // (the rings, sunk in her fingers, the flesh bulging either side: gold, a pink stone, a blue)
  px(c, hx + 1.4, hy - 1.4, 0.6, 3.4, r[0]); px(c, hx + 4, hy - 1.4, 0.6, 3.4, r[3]);
  px(c, hx + 2, hy - 1, 2, 3, GOLD[1]); px(c, hx + 2, hy - 1, 1, 1, '#F43F8E'); px(c, hx + 3.4, hy, 0.6, 2, GOLD[3]);
  px(c, hx + 5, hy + 1.6, 1.2, 1.6, GOLD[2]); px(c, hx + 5, hy + 1.6, 0.8, 0.8, '#4AB4F4');
  if (hand === 'wand') {
    line(c, [hx, hy, hx + 22, hy - 26], 2.6, GOLD[4]); line(c, [hx, hy, hx + 22, hy - 26], 1.6, GOLD[1]);
    line(c, [hx + 2, hy - 3, hx + 20, hy - 24], 0.5, GOLD[0]);
    // (a pink ribbon off the star, trailing)
    const rw = Math.sin(f * 0.12) * 2;
    line(c, [hx + 21, hy - 25, hx + 16 + rw, hy - 18, hx + 19 - rw, hy - 11, hx + 15 + rw, hy - 5], 1.2, '#FF7AC0'); line(c, [hx + 21, hy - 25, hx + 26 - rw, hy - 17, hx + 24 + rw, hy - 11], 1, '#E04A9A');
    star(c, hx + 24, hy - 29, 7.5, GOLD[4], f * 0.03); star(c, hx + 24, hy - 29, 6, GOLD[1], f * 0.03); star(c, hx + 23, hy - 30, 2.6, GOLD[0], f * 0.03);
    if (f % 20 < 10) sparkle(c, hx + 30 + (f % 6), hy - 36 - (f % 5), 2, '#FFFFFF');
  }
  if (hand === 'bonbon') { ell(c, hx + 5, hy - 5, 4, 4, '#5A2A12'); px(c, hx + 3, hy - 8, 3, 1, '#F6D365'); px(c, hx + 6, hy - 4, 1, 1, '#8A4A22'); px(c, hx + 7, hy + 1, 2, 1, '#5A2A12'); px(c, hx + 6, hy + 3, 1, 1, '#5A2A12'); }
};

/** The legs: thick, the knees dimpled, the calves (hidden by the gown down to the shins), the ankles, the heels. */
const legs = (c: Ctx, step: number, thin = 0) => {
  const bw = piperBodyW(thin), t2 = Math.max(0, Math.min(1, thin - 1)), sk = t2 > 0.3 ? GAUNT : SKIN;
  for (const [lx0, near] of [[-18, false], [22, true]] as const) {
    const lx = lx0 * bw, w = bw < 1 ? 0.5 + bw * 0.5 : 1;
    const lift = near ? Math.max(0, step) * 4 : Math.max(0, -step) * 4;
    const r = near ? sk : ([sk[1], sk[2], sk[3], sk[3], sk[4]] as const);
    const leg = () => { c.moveTo(lx - 12 * w, -22); c.quadraticCurveTo(lx - 14 * w, -12 - lift, lx - 4 * w, -8 - lift); c.lineTo(lx + 8 * w, -8 - lift); c.quadraticCurveTo(lx + 16 * w, -14 - lift, lx + 12 * w, -22); c.closePath(); };
    shape(c, leg, r, lx - 14 * w, lx + 16 * w);
    // (stubble: a week since she shaved; the cellulite; a varicose vein up the near shin)
    overlay(c, leg, STUBBLE(c)); overlay(c, leg, CELLULITE(c), bw);
    if (near) line(c, [lx + 6 * w, -9 - lift, lx + 4 * w, -13 - lift, lx + 7 * w, -16 - lift, lx + 5 * w, -21], 0.6, '#7A86C8');
    foot(c, lx - 2, -lift, near);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The figure

const FACES: Record<PiperPose, PiperFace> = { stand: 'sultry', talk: 'talk', gloat: 'gloat', lounge: 'sultry', enraged: 'rage', point: 'talk', hurt: 'hurt', flat: 'out' };

/** Her, whole, in a pose. */
export const drawPiper = (c: Ctx, x: number, feetY: number, facing: 1 | -1, f: number, pose: PiperPose, opts: PiperOpts = {}) => {
  const face = opts.face ?? FACES[pose];
  const enraged = pose === 'enraged';
  const mess = Math.max(opts.mess ?? 0, enraged ? 0.35 : 0);
  const talking = !!opts.talking;
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale(facing, 1);
  if (pose === 'lounge') { lounge(c, f, face, talking, mess, opts.chaise !== false); c.restore(); return; }
  if (pose === 'flat') { flat(c, f); c.restore(); return; }
  // (the jiggle: going through her as she stamps, as she's hit; a breath otherwise)
  const j = enraged ? (f % 16) / 16 : pose === 'hurt' ? (f % 24) / 24 : 0;
  const breathe = Math.sin(f * 0.06) * 1;
  const stamp = enraged ? (Math.floor(f / 8) % 2 ? 1 : -1) : pose === 'gloat' ? 0.5 + Math.sin(f * 0.2) * 0.5 : 0;
  const shake = enraged ? (f % 4 < 2 ? 1 : -1) : 0;
  // (leaked down: the body drawn in to bw of her width, the arms and the hands in with it)
  const thin = Math.max(0, Math.min(2, opts.thin ?? 0)), bw = piperBodyW(thin), hk = 0.45 + 0.55 * bw;
  const toss = opts.toss ? tossPose(Math.max(0, Math.min(1, opts.toss.k)), bw, hk, -114) : null;
  const lean = toss ? toss.lean : pose === 'hurt' ? -0.12 : 0;
  c.translate(shake, pose === 'gloat' ? -Math.abs(stamp) * 3 : 0); c.rotate(lean);
  // the wings, behind her
  wings(c, -30 * bw, -112, f, enraged || pose === 'gloat');
  // the far arm, behind her
  const sh = -114 + breathe;
  const farHand: [number, number, 'open' | 'fist' | 'wand' | 'clasp' | 'bonbon'] =
    enraged ? [-38, -150 + (f % 8 < 4 ? 0 : 6), 'fist'] : pose === 'gloat' ? [-4, -112, 'clasp'] : pose === 'talk' || pose === 'point' ? [-48, -70, 'open'] : [-26, -150, 'open'];
  if (toss) armTo(c, -34 * bw, sh, toss.far[0], toss.far[1], false, 'wand', f, enraged, thin);
  else armTo(c, -34 * bw, sh, farHand[0] * hk, farHand[1], false, farHand[2], f, enraged, thin);
  legs(c, stamp, thin);
  body(c, j, f, thin);
  // the head (its beehive behind it)
  const hx = 8 * hk, hy = -138 + breathe;
  beehive(c, hx, hy - 4, mess, f);
  head(c, hx, hy, face, f, talking, mess, thin);
  // the near arm, in front
  const nearHand: [number, number, 'open' | 'fist' | 'wand' | 'clasp' | 'bonbon'] =
    enraged ? [52, -146 - (f % 8 < 4 ? 6 : 0), 'fist']
      : pose === 'gloat' ? [12, -112, 'clasp']
        : pose === 'talk' ? [56, -96 + Math.sin(f * 0.08) * 6, 'wand']
          : pose === 'point' ? [70, -108, 'wand']
            : pose === 'hurt' ? [60, -126, 'open']
              : [50, -62, 'wand'];
  if (toss && opts.toss) {
    // (the throwing arm, its elbow from limb.ts (breath and all: the shoulder's where the pose has it); the ball in the
    // hand till it's let go, forming as she draws back)
    const dy = sh + 114;
    armTo(c, toss.sx, sh, toss.hand[0], toss.hand[1] + dy, true, 'open', f, enraged, thin, [toss.elb[0], toss.elb[1] + dy]);
    if (opts.toss.k < TOSS_RELEASE) tossBall(c, toss.hand[0], toss.hand[1] + dy, opts.toss.kind, Math.max(0, Math.min(1, opts.toss.grow ?? 1)), f);
  } else armTo(c, 38 * bw, sh, nearHand[0] * hk, nearHand[1], true, nearHand[2], f, enraged, thin);
  // (steam off her when she's furious)
  if (enraged) for (let k = 0; k < 3; k++) { const t = (f * 2 + k * 20) % 60; c.globalAlpha = 1 - t / 60; ell(c, hx - 10 + k * 12, hy - 60 - t * 0.6, 4 + t * 0.1, 3 + t * 0.08, '#FFFFFF'); c.globalAlpha = 1; }
  c.restore();
};

/** Sprawled on her heart-shaped chaise, head propped on her hand, a bonbon; watching. */
const lounge = (c: Ctx, f: number, face: PiperFace, talking: boolean, mess: number, chaise: boolean) => {
  if (chaise) {
    // (the chaise: a pink velvet heart on gold claw feet, buttoned)
    shape(c, () => { c.moveTo(-92, -14); c.lineTo(92, -14); c.lineTo(92, -40); c.quadraticCurveTo(92, -60, 70, -62); c.lineTo(-60, -62); c.bezierCurveTo(-90, -100, -130, -70, -104, -40); c.lineTo(-92, -14); c.closePath(); }, CHAISE, -112, 92, 1.4);
    for (let i = 0; i < 6; i++) ell(c, -70 + i * 28, -36, 1.6, 1.6, CHAISE[3]);
    for (const fx of [-84, 84]) { shape(c, () => c.rect(fx - 4, -14, 8, 14), GOLD, fx - 4, fx + 4, 0.8); }
  }
  // (her, on her side along it: the hip a hill, the gown, the rolls spilling toward the cushion)
  const breathe = Math.sin(f * 0.06);
  c.save(); c.translate(0, -56);
  wings(c, -10, -46 + breathe, f, false);
  const gown = () => { c.moveTo(-60, 4); c.quadraticCurveTo(-64, -30, -30, -42 - breathe); c.quadraticCurveTo(10, -60 - breathe, 50, -34); c.quadraticCurveTo(86, -26, 96, -4); c.lineTo(96, 6); c.closePath(); };
  shape(c, gown, GOWN, -64, 96, 1.4);
  for (let k = 0; k < 3; k++) shapeTop(c, () => c.ellipse(-14 + k * 26, -8, 18, 10, 0, 0, Math.PI * 2), GOWN, -18, 2, 0.8);
  overlay(c, gown, SEQUINS(c));
  // (the seam over the hip straining in ladders)
  line(c, [-20, -46, 20, -50, 60, -30], 0.8, GOWN[4]);
  for (let x = -16; x < 56; x += 6) line(c, [x, -48 + (x > 20 ? (x - 20) * 0.45 : 0) - 1, x + 1, -46 + (x > 20 ? (x - 20) * 0.45 : 0)], 0.6, GOWN[0]);
  for (let i = 0; i < 10; i++) { const on = (f + i * 11) % 44 < 6; const sx = -40 + i * 12, sy = -30 + ((i * 7) % 20); px(c, sx, sy, 1, 1, on ? '#FFFFFF' : GOWN[0]); if (on) sparkle(c, sx, sy, 1.5, '#FFFFFF'); }
  // (the legs out the end, the heels crossed: stubbled, dimpled)
  const shin = () => { c.moveTo(90, -6); c.lineTo(112, -4); c.lineTo(112, 4); c.lineTo(90, 6); c.closePath(); };
  shape(c, shin, SKIN, 90, 112);
  overlay(c, shin, STUBBLE(c)); overlay(c, shin, CELLULITE(c));
  foot(c, 114, 4, true);
  // (the far arm propping her head; the head; the near arm with the bonbon)
  armTo(c, -42, -32, -64, -58, false, 'open', f, false, 0, [-66, -16]);
  beehive(c, -50, -78, mess, f);
  head(c, -50, -74, face, f, talking, mess);
  armTo(c, -30, -38, 4, -60 + Math.sin(f * 0.05) * 4, true, 'bonbon', f, false, 0, [-4, -30]);
  c.restore();
};

/** Down: on her back, a mountain range of pink, the wings crumpled, the wand rolled off. */
const flat = (c: Ctx, f: number) => {
  wings(c, -40, -10, f, false, true);
  const gown = () => { c.moveTo(-70, 0); c.quadraticCurveTo(-60, -40, -20, -52); c.quadraticCurveTo(20, -66, 50, -40); c.quadraticCurveTo(76, -28, 80, 0); c.closePath(); };
  shape(c, gown, GOWN, -70, 80, 1.4);
  for (let k = 0; k < 3; k++) shapeTop(c, () => c.ellipse(-10 + k * 22, -40 + k * 6, 16, 8, 0, 0, Math.PI * 2), GOWN, -48 + k * 6, -32 + k * 6, 0.8);
  overlay(c, gown, SEQUINS(c));
  for (const [lx, ly] of [[78, -10], [86, -2]] as const) { const leg = () => c.ellipse(lx, ly, 10, 6, 0.3, 0, Math.PI * 2); shape(c, leg, SKIN, lx - 10, lx + 10); overlay(c, leg, STUBBLE(c)); overlay(c, leg, CELLULITE(c)); foot(c, lx + 14, ly - 6, true); }
  beehive(c, -78, -14, 0.9, f);
  head(c, -78, -12, 'out', f, false, 0.9);
  // (the near arm flopped over the mountain of her, the hand limp on her belly)
  armTo(c, -54, -26, -18, -52, true, 'open', f, false, 0, [-44, -46]);
  star(c, 30, -2, 6, GOLD[1], 0.4);
};

// ---------------------------------------------------------------------------------------------------------------
// The close-up

/** Her face close up, the REN & STIMPY GROSS-UP (piperGross.ts: painted, cached): (cx, cy) the middle of her face on
 *  screen, `scale` 3.6 the hold (the whole screen her face), less as it lurches in. 'rage' her furious face; any other
 *  the sultry one (`talking` her mouth going). For the reveal (the door kicked in) and the insult landing. */
export const drawPiperCloseup = (c: Ctx, cx: number, cy: number, scale: number, f: number, opts: { face?: PiperFace; talking?: boolean; mess?: number; jolt?: number } = {}) =>
  drawGrossUp(c, cx, cy, scale / 3.6, f, opts.face === 'rage', !!opts.talking, opts.jolt ?? 0);
