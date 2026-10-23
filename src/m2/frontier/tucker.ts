// TUCKER THE TRAIN CONDUCTOR, drawn (Wilderness Land's boss: everybody draws him from here). Drawn at Meathead 1's boss
// grade, on par with Safari Artie and Donnie: color ramps (light, base, shade, deep, line) in stepped bands with a
// dithered seam between them, every material its own darkest tone for an outline (no ink).
//
// The 1800s railroad man the park dressed up (the user: "cheery", "chipper"): portly and pink, a big round belly in a
// burgundy vest, a brass watch chain swagged across it to the fob; a navy frock coat with two rows of brass buttons and
// gold piping round the cuffs, its tails flapping when he runs; a stiff white collar and a black bow tie; a brass
// TUCKER badge on his lapel; the conductor's cap (navy, a brass band, the patent-leather visor, the CONDUCTOR plate);
// white cotton gloves; gray pinstriped trousers, polished black boots; the ticket punch always on him. His face: round
// and jowly, rosy apple cheeks, a button nose gone red at the tip, little twinkly eyes behind round wire spectacles,
// ginger muttonchops that run down his cheeks into a waxed handlebar mustache, its ends curled up; a gap-toothed grin.
//
// The user's inspiration: a character in Cannibal! The Musical who just can't seem to die. Every "death" sold as final;
// every comeback more mangled and more stubbornly chipper (or indignant); never explained. His WOUNDS STACK through the
// land and carry into his fight (`TuckerWounds`): the eye (shot through it from outside the engine), the buzzsaw (stuck
// in his forehead at the log ride), the branch (impaled through his chest in the woods), the split (his arena entry: a
// felled tree drove the saw down through his skull, his face split in half to his nose, both eyes gone); and between them the woods'
// `grime` (EXTRA BLOODIED: blood, chips, sewer muck, leaves; no new wound, so no close-up). Each job that mutilates him
// draws its wound here (on the figure: `drawWounds`; on the close-up: its painter).
//
// THE MUTILATION CLOSE-UP RULE (the user's): every mutilation is shown as a graphic, ANIMATED, multi-frame close-up of
// it happening (not a still of the result). `drawTuckerCloseup(c, cx, cy, scale, frame, { making: { wound, k } })`
// draws his face big, then the registered painter for that wound at k 0..1 (registerWoundPainter): the jobs that
// mutilate him register theirs.
//
// drawTucker(c, x, feetY, facing, frame, pose, opts): world (or screen) point of his feet, facing 1 right / -1 left.

import { type Ctx } from '../cast/kit';
import { drawGrossBody, drawGrossHead, drawGoreGap, drawGoreMaking, grossCloseupsOn, splitStep } from './tuckerCloseGross';

export type TuckerPose =
  | 'stand'    // thumbs hooked in his vest pockets, rocking on his heels, beaming
  | 'talk'     // going on: the near hand up and waving with it, the far one patting his belly
  | 'ticket'   // TICKET, PLEASE: the near hand out, palm up; the ticket punch up in the far one, clicking
  | 'tip'      // tipping his cap
  | 'sit'      // knocked on his backside, legs out, his head swimming (the caller draws his cap where it fell)
  | 'flat'     // flat on his back, apparently dead (each "death"): arms out, toes up
  | 'furious'  // red to the ears, fists up and shaking, stamping
  | 'point'    // jabbing a finger at somebody, the other fist on his hip
  | 'run'      // running for it, manic: coat tails flying, knees high, both fists pumping up by his ears, the face
  | 'cab'      // leaning out of his engine's cab: waist up (the caller clips him at the sill), shaking a fist
  | 'whistle'  // in the cab, hauling on the whistle cord over his head
  | 'hurt'     // hit: reeling back
  | 'shove'    // both hands out flat in front of him, shoving somebody out of his way (the log ride's booth)
  | 'slam'     // a fist up high over a button, about to bring it down
  | 'press'    // the fist brought down on it, leaning on it
  | 'pop'      // bursting up out of something (the woods' leaf pile): arms flung up, legs wide, screaming
  | 'pounce'   // diving at somebody head first, both hands out to grab (tipped forward about his hips)
  | 'ride'     // sat astride a dirt bike, both fists on the bars, boots on the pegs (feetY: the seat + 30)
  | 'ridepoint' // ...one fist on the bars, jabbing a finger with the other
  | 'impaled'   // hung on the tree's branch through his chest: tipped forward over it, arms and legs dangling, head lolled
  | 'grope'     // blind (the split): both hands out in front of him, feeling the air, shuffling, chin up, listening
  // (his fight's: the flintlock. `opts.aim`: the pistol's angle off straight ahead, + down)
  | 'aim'       // the flintlock out at arm's length in the near hand, the far hand cupped behind his ear, listening
  | 'cock'      // the flintlock up by his face, muzzle up, the far thumb hauling the hammer back
  | 'reload'    // the flintlock muzzle up at his belly in the far hand, the near hand ramming the rod down it
  | 'mauled';   // flat on his back under the cats, thrashing: arms and legs everywhere

/** 'manic': the bookkeeper unhinged (the user's model: South Park's Mel Gibson): one eye bulging, the other a pinprick,
 *  a brow up in his cap, a clenched grin of every tooth he's got, the gap and all. */
export type TuckerFace = 'smile' | 'cheer' | 'talk' | 'shock' | 'angry' | 'yell' | 'daze' | 'out' | 'ow' | 'manic';
export type TuckerWound = 'eye' | 'saw' | 'branch' | 'split' | 'maul' | 'lions';
/** What's been done to him so far (they stack, in this order, through the land). `grime`: the woods' EXTRA BLOODIED
 *  look (his trip after Meathead, never explained: fresh blood, wood chips, sewer muck, leaves; a torn shoulder).
 *  `split`: the arena entry's felled tree drove the saw down through his skull, his face split in half to his nose, both
 *  eyes gone (blind); a number 0..1 is how far it's been driven (the close-up's frames), true is all the way. */
export interface TuckerWounds {
  eye?: boolean; saw?: boolean; branch?: boolean; grime?: boolean; split?: boolean | number;
  /** (his fight's) the mountain lions' rakes so far: one set more for each mauling (0 none .. 4+), across his coat,
   *  his trousers and his face. */
  clawed?: number;
  /** (his fight's) the soul sucker's blood all over him, 0..1 (the scent the cats come for). */
  bloody?: number;
}

export interface TuckerOpts {
  wounds?: TuckerWounds;
  /** Talking: his mouth goes (shapes off the frame count). */
  talking?: boolean;
  /** His face, if not the pose's own. */
  face?: TuckerFace;
  /** His cap's off (knocked off: the caller draws it where it went, drawTuckerCap). */
  capless?: boolean;
  /** Still skewered on the tree (the catch-up's): the branch's broken-off front end isn't drawn (the caller draws the
   *  branch on from his chest to the trunk). */
  onBranch?: boolean;
  /** 'aim': the flintlock's angle off straight ahead (radians, + down). */
  aim?: number;
  /** 'aim': the flash in the pan going (the priming's sparked: the shot's a beat off). */
  pan?: boolean;
  /** 'grope' (his fight's): the flintlock in his near hand as he feels his way about. */
  pistol?: boolean;
  /** No head on him (his fight's grizzly: it's in the bear; arena/gore.ts draws the stump). */
  headless?: boolean;
}

/** How tall he is (feet to the top of his cap), for putting words over him. */
export const TUCKER_H = 96;

// ---------------------------------------------------------------------------------------------------------------
// Ramps: light, base, shade, deep, line

type Ramp = readonly [string, string, string, string, string];
const SKIN: Ramp = ['#FFE8D2', '#F6C9A6', '#E0A280', '#BC7A5C', '#6E3C28'];
/** His cheeks and the tip of his nose: pink as a ham. */
const ROSY: Ramp = ['#FFC2AE', '#F49A86', '#DE7868', '#BC5A50', '#6E2A26'];
/** Furious: the whole of him red to the ears. */
const RAGE: Ramp = ['#FFB09A', '#F27A66', '#D85848', '#B03A34', '#5E1A16'];
const GINGER: Ramp = ['#F6B884', '#DC8A4E', '#B4642E', '#86441C', '#42200C'];
const COAT: Ramp = ['#5A6CA2', '#36467E', '#283662', '#1A2446', '#0A0F22'];
const VEST: Ramp = ['#C25A58', '#982F35', '#76222A', '#54161C', '#28080C'];
const SHIRT: Ramp = ['#FFFFFF', '#F4F0E6', '#D8D2C4', '#B2AA9A', '#5E5A50'];
const TROUSER: Ramp = ['#9C9CA4', '#7A7A84', '#5E5E68', '#46464E', '#202024'];
const BOOT: Ramp = ['#6A6A74', '#3C3C44', '#28282E', '#18181C', '#050507'];
const BRASS: Ramp = ['#FFF6BE', '#F4CC4E', '#CC9E2C', '#926E16', '#4A3608'];
const GLOVE: Ramp = ['#FFFFFF', '#F6F4EE', '#DCD8CC', '#B8B2A2', '#605A4E'];
const PATENT: Ramp = ['#7A7A86', '#2A2A32', '#1A1A20', '#101014', '#020203'];
const STEEL: Ramp = ['#FFFFFF', '#E2E4E8', '#A6AAB2', '#72767E', '#3A3C42'];
const WIRE = '#A88A3C';

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
  c.beginPath(); path(); c.strokeStyle = r[4]; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke();
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
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** The knee or elbow of a two-part limb between its ends, bent to one side. */
const joint = (x1: number, y1: number, x2: number, y2: number, l1: number, l2: number, bend: number): [number, number] => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 0.001;
  const dd = Math.min(d, l1 + l2 - 0.01);
  const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / d, uy = dy / d;
  return [x1 + ux * a + uy * h * bend, y1 + uy * a - ux * h * bend];
};
/** A run of tube (an arm, a leg): the outlines first, then the fills, each with a lit stripe and a shade. */
const tube = (c: Ctx, pts: number[], ws: number[], rs: Ramp[]) => {
  const n = pts.length / 2 - 1;
  for (let i = 0; i < n; i++) line(c, [pts[i * 2], pts[i * 2 + 1], pts[i * 2 + 2], pts[i * 2 + 3]], ws[i] + 2, rs[i][4]);
  for (let i = 0; i < n; i++) {
    const x1 = pts[i * 2], y1 = pts[i * 2 + 1], x2 = pts[i * 2 + 2], y2 = pts[i * 2 + 3], w = ws[i], r = rs[i];
    line(c, [x1, y1, x2, y2], w, r[1]);
    let nx = -(y2 - y1), ny = x2 - x1; const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    if (nx + ny * 0.6 < 0) { nx = -nx; ny = -ny; }
    line(c, [x1 + nx * w * 0.3, y1 + ny * w * 0.3, x2 + nx * w * 0.3, y2 + ny * w * 0.3], w * 0.36, r[2]);
    line(c, [x1 - nx * w * 0.32, y1 - ny * w * 0.32, x2 - nx * w * 0.32, y2 - ny * w * 0.32], Math.max(0.6, w * 0.16), r[0]);
  }
};
/** A ramp a step darker (the far arm, the far leg). */
const back = (r: Ramp): Ramp => [r[1], r[2], r[3], r[3], r[4]];
/** A brass button: domed, a glint. */
const button = (c: Ctx, x: number, y: number, r = 1.1) => { ell(c, x, y, r + 0.4, r + 0.4, BRASS[4]); ell(c, x, y, r, r, BRASS[2]); ell(c, x - r * 0.3, y - r * 0.3, r * 0.55, r * 0.55, BRASS[1]); px(c, x - r * 0.5, y - r * 0.6, 0.6, 0.6, BRASS[0]); };

// ---------------------------------------------------------------------------------------------------------------
// The figure

const HS = 1.1;
const FACES: Record<TuckerPose, TuckerFace> = {
  stand: 'smile', talk: 'talk', ticket: 'cheer', tip: 'cheer', sit: 'daze', flat: 'out', furious: 'manic', point: 'angry',
  run: 'manic', cab: 'manic', whistle: 'manic', hurt: 'ow', shove: 'manic', slam: 'manic', press: 'manic',
  pop: 'yell', pounce: 'manic', ride: 'smile', ridepoint: 'manic', impaled: 'out', grope: 'shock',
  aim: 'manic', cock: 'manic', reload: 'talk', mauled: 'yell',
};
/** 'impaled': how far he's tipped forward over the branch (about his chest, where it goes in). */
export const IMPALED_TILT = 0.22;
/** A point on his figure (x, y from his feet, facing right, in drawTucker's units) where it ends up for `pose` (the
 *  poses that tip him about: 'impaled'; the rest as given). The caller mirrors x for facing left. */
export const tuckerPoint = (pose: TuckerPose, x: number, y: number): [number, number] => {
  if (pose !== 'impaled') return [x, y];
  const cs = Math.cos(IMPALED_TILT), sn = Math.sin(IMPALED_TILT), yy = y + 50;
  return [x * cs - yy * sn, x * sn + yy * cs - 50];
};
const seated = (pose: TuckerPose) => pose === 'sit' || pose === 'ride' || pose === 'ridepoint';

export const drawTucker = (c: Ctx, x: number, feetY: number, facing: number, frame: number, pose: TuckerPose = 'stand', opts: TuckerOpts = {}) => {
  const f = frame, face = opts.face ?? FACES[pose], wounds = opts.wounds ?? {};
  c.save();
  c.translate(Math.round(x), Math.round(feetY));
  c.scale(facing < 0 ? -1 : 1, 1);
  // (flat on his back: the whole of him laid down about his hips, head to the back, toes up)
  if (pose === 'flat') { c.translate(-6, -16); c.rotate(-Math.PI / 2); c.translate(0, 26); }
  // (mauled: laid down the same, thrashing about under them)
  if (pose === 'mauled') { c.translate(-6 + Math.sin(f * 0.7) * 1.5, -16 - Math.abs(Math.sin(f * 0.45)) * 2); c.rotate(-Math.PI / 2 + Math.sin(f * 0.55) * 0.08); c.translate(0, 26); }
  if (pose === 'sit') c.translate(0, 22);
  // (diving head first: tipped forward about his hips)
  if (pose === 'pounce') { c.translate(0, -31); c.rotate(1.15); c.translate(0, 31); }
  // (hung on the branch: tipped forward over it about his chest)
  if (pose === 'impaled') { c.translate(0, -50); c.rotate(IMPALED_TILT); c.translate(0, 50); }
  const shake = pose === 'furious' ? Math.sin(f * 1.3) * 0.8 : 0;
  // (rocking on his heels, pleased with himself; bobbing at the run)
  const b = pose === 'run' ? -Math.abs(Math.sin(f * 0.34)) * 2.4 : pose === 'stand' || pose === 'ticket' ? Math.sin(f * 0.06) * 0.8 - 0.4 : pose === 'talk' ? Math.sin(f * 0.12) * 0.6 : 0;
  c.translate(shake, 0);
  // ---- the coat's tails, behind everything (flying out behind him at the run)
  if (pose !== 'cab' && pose !== 'whistle') drawTails(c, pose, f, b);
  // ---- the legs
  if (pose !== 'cab' && pose !== 'whistle') drawLegs(c, pose, f);
  c.translate(0, b);
  // ---- the arms (the far one behind his body), the body, the near arm over it
  const [far, near] = armsFor(pose, f, opts.aim ?? 0);
  drawArm(c, far, false, pose, f);
  drawBody(c, pose, f);
  drawWounds(c, wounds, 'body', f, false, !!opts.onBranch);
  // ---- the head, on his neck
  const hy = pose === 'sit' ? -71 + Math.sin(f * 0.1) * 1.2 : pose === 'hurt' ? -70 : pose === 'impaled' ? -70 : -72;
  const hx = pose === 'sit' ? Math.sin(f * 0.1) * 2 : pose === 'hurt' ? -2 : pose === 'run' ? 1.5 : pose === 'impaled' ? 2.5 : pose === 'grope' ? 1.5 : 0.5;
  const nod = pose === 'impaled' ? 0.5 : pose === 'hurt' ? -0.25 : pose === 'grope' ? -0.2 + Math.sin(f * 0.07) * 0.08 : pose === 'sit' ? Math.sin(f * 0.1) * 0.14 : pose === 'run' ? 0.08 : pose === 'furious' ? Math.sin(f * 1.3) * 0.05 : pose === 'tip' ? 0.08
    : pose === 'aim' ? -0.16 : pose === 'cock' ? -0.1 : pose === 'reload' ? 0.12 : pose === 'mauled' ? Math.sin(f * 0.9) * 0.3 : 0;
  if (!opts.headless) {
    c.save(); c.translate(hx, hy); c.rotate(nod); c.scale(HS, HS);
    drawHead(c, face, f, !!opts.talking, opts.capless || pose === 'sit' || pose === 'flat', pose === 'furious' || face === 'yell', wounds);
    c.restore();
  }
  // (the flintlock: behind the near hand's fist in the aim and the cock; up in the far hand for the reload, the rod down
  // it from the near one)
  if (pose === 'grope' && opts.pistol) drawFlintlock(c, near.hx, near.hy, 0.55, { cocked: false, f });
  if (pose === 'aim' || pose === 'cock') drawFlintlock(c, near.hx, near.hy, pose === 'aim' ? (opts.aim ?? 0) : -1.3, { cocked: true, pan: !!opts.pan, f });
  if (pose === 'reload') {
    drawFlintlock(c, far.hx, far.hy, -1.5, { cocked: false, f });
    line(c, [near.hx, near.hy + 2, far.hx + 1.4, far.hy - 14], 1.2, '#3B2412'); line(c, [near.hx, near.hy + 2, far.hx + 1.4, far.hy - 14], 0.5, '#A0703C');
  }
  drawArm(c, near, true, pose, f);
  if (pose === 'ticket') drawPunch(c, far.hx, far.hy, f);
  if (pose === 'furious' || pose === 'cab') steam(c, hx, hy, f);
  if (pose === 'sit') stars(c, hx, hy - 18, f);
  c.restore();
};

/** His head on its own (off him: the grizzly's), its middle at (x, y), facing right turned `rot` (mirrored for -1);
 *  capless unless `capped`. The skull's about 26 across, its crown at (0, -15), under the jaw (0, 13) (scaled in). */
export const drawTuckerHead = (c: Ctx, x: number, y: number, facing: number, rot: number, frame: number, face: TuckerFace, wounds: TuckerWounds = {}, capped = false) => {
  c.save(); c.translate(x, y); c.scale(facing < 0 ? -1 : 1, 1); c.rotate(rot); c.scale(HS, HS);
  drawHead(c, face, frame, false, !capped, face === 'yell', wounds);
  c.restore();
};
/** How far his head's scaled (its units to the figure's). */
export const TUCKER_HEAD_SCALE = HS;

/** His cap on its own (knocked off: lying where it fell), its middle at (x, y), turned `rot`. */
export const drawTuckerCap = (c: Ctx, x: number, y: number, rot = 0, scale = HS) => {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(scale, scale); c.translate(0, 10);
  drawCap(c, 0);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The tails and the legs

const drawTails = (c: Ctx, pose: TuckerPose, f: number, b: number) => {
  const flap = pose === 'run' ? Math.sin(f * 0.34) * 3 : Math.sin(f * 0.05) * 0.5;
  const out = pose === 'run' || pose === 'pounce' ? 9 : seated(pose) ? 4 : 0;
  const lo = seated(pose) ? -24 : -15;
  shape(c, () => {
    c.moveTo(-11, -40 + b); c.lineTo(-13 - out * 0.4, -30 + b);
    c.quadraticCurveTo(-15 - out, lo + 6, -14 - out - flap, lo); c.lineTo(-9 - out * 0.6 - flap * 0.6, lo + 2);
    c.lineTo(-5 - out * 0.2, lo - 1); c.lineTo(-4, -32 + b); c.closePath();
  }, back(COAT), -16 - out, -4, 0.9);
  // (the vent between the tails, the two buttons at its top)
  line(c, [-9.5, -32 + b, -10 - out * 0.4 - flap * 0.4, lo + 1], 0.7, COAT[4]);
  button(c, -11.5, -31 + b, 0.8); button(c, -8, -31 + b, 0.8);
};

const drawLegs = (c: Ctx, pose: TuckerPose, f: number) => {
  // [hipX, hipY, kneeX, kneeY, ankleX, ankleY, boot angle] for the far leg, then the near one
  let L: number[][];
  if (pose === 'sit') L = [[-3, -30, 7, -28, 18, -26, -1.3], [3, -30, 12, -27, 23, -26, -1.45]];
  else if (pose === 'run') {
    const k = Math.sin(f * 0.34);
    L = [-1, 1].map(s => {
      const sw = s * k, hx = s * 3.5, hy = -31;
      const ax = sw * 10, ay = -5 - (sw < 0 ? -sw * 12 : 0);
      const [kx, ky] = joint(hx, hy, ax, ay, 13.4, 13.2, 1);
      return [hx, hy, kx, ky, ax, ay, sw < 0 ? -sw * 0.55 : -sw * 0.15];
    });
  } else if (pose === 'furious') {
    // (stamping: one boot up and down)
    const up = Math.max(0, Math.sin(f * 0.45)) * 7;
    L = [[-4, -31, -4.5, -18, -5, -5, 0], [4, -31, 6, -18 - up * 0.6, 5.5, -5 - up, -0.1]];
  } else if (pose === 'hurt') L = [[-4, -31, -6, -18, -8, -5, 0.1], [4, -31, 5, -18, 7, -5, -0.1]];
  else if (pose === 'flat') L = [[-3.5, -31, -3.5, -18, -3.5, -5, -1.4], [3.5, -31, 3.5, -18, 3.5, -5, -1.4]];
  // (mauled: on his back, kicking at them)
  else if (pose === 'mauled') { const k = Math.sin(f * 0.6), k2 = Math.cos(f * 0.5); L = [[-3.5, -31, -3.5 + k * 5, -19, -3.5 + k * 9, -6, -1.4 + k * 0.5], [3.5, -31, 3.5 - k2 * 5, -19, 3.5 - k2 * 9, -6, -1.4 - k2 * 0.5]]; }
  // (the reload and the aim: feet planted, braced; the cock the same)
  else if (pose === 'aim' || pose === 'cock' || pose === 'reload') L = [[-5, -31, -6, -18, -7, -5, 0], [5, -31, 6.5, -18, 8, -5, 0]];
  // (astride the bike: thighs along the seat, knees forward, shins down to the pegs)
  else if (pose === 'ride' || pose === 'ridepoint') L = [[-3, -30, 8, -32, 10, -19, 0.1], [3, -30, 13, -31, 14, -18, 0.05]];
  // (bursting up: legs wide, kicking; diving: trailing straight, toes pointed)
  else if (pose === 'pop') { const k = Math.sin(f * 0.8) * 1.5; L = [[-4, -31, -9, -18 + k, -13, -6, 0.3], [4, -31, 9, -18 - k, 13, -6, -0.3]]; }
  else if (pose === 'pounce') L = [[-4, -31, -5, -18, -6, -5, 0.7], [4, -31, 2, -18, 0, -6, 0.9]];
  // (hung on the branch: dangling, toes down, swaying a hair)
  else if (pose === 'impaled') { const sw = Math.sin(f * 0.05) * 0.8; L = [[-4, -31, -3 + sw, -18, -1 + sw * 1.4, -5, 0.9], [4, -31, 6 + sw, -18, 8 + sw * 1.4, -5, 1.1]]; }
  // (blind: a feeling-his-way shuffle, one boot sliding out ahead of the other, the toes testing the ground)
  else if (pose === 'grope') { const k = Math.sin(f * 0.16); L = [[-4, -31, -4 + k * 2, -18, -5 + k * 5, -5 - Math.max(0, k) * 2.5, -Math.max(0, k) * 0.3], [4, -31, 5 - k * 2, -18, 6 - k * 5, -5 - Math.max(0, -k) * 2.5, -Math.max(0, -k) * 0.3]]; }
  else {
    // (rocking on his heels: the toes up a touch)
    const rock = pose === 'stand' || pose === 'ticket' ? Math.max(0, Math.sin(f * 0.06)) * 0.12 : 0;
    L = [[-4, -31, -4.5, -18, -5, -5, -rock], [4, -31, 4.5, -18, 5, -5, -rock]];
  }
  for (let i = 0; i < 2; i++) leg(c, L[i], i === 1, pose, f);
};

const leg = (c: Ctx, P: number[], near: boolean, pose: TuckerPose, f: number) => {
  const [hx, hy, kx, ky, ax, ay, rot] = P;
  const tr = near ? TROUSER : back(TROUSER);
  tube(c, [hx, hy, kx, ky, ax, ay], [7.4, 6.4], [tr, tr]);
  // (the pinstripes, down the thigh and the shin)
  for (const k of [-0.25, 0.25]) {
    const ox = k * 6;
    line(c, [hx + ox, hy, kx + ox * 0.9, ky], 0.4, tr[3]);
    line(c, [kx + ox * 0.8, ky, ax + ox * 0.7, ay], 0.4, tr[3]);
  }
  // (the crease at the knee, the trouser hem breaking over the boot)
  line(c, [kx - 2.4, ky - 0.4, kx + 2.2, ky + 0.6], 0.6, tr[3]);
  ell(c, ax, ay - 0.6, 4, 1.4, tr[2]);
  boot(c, ax, ay, rot, near, pose === 'run' ? f : 0);
};

/** A polished black boot, its ankle at (x, y), toe forward, tipped by `rot`: the shine along its toe. */
const boot = (c: Ctx, x: number, y: number, rot: number, near: boolean, _f: number) => {
  const r = near ? BOOT : back(BOOT);
  c.save(); c.translate(x, y); c.rotate(rot);
  shape(c, () => { c.moveTo(-3.6, -2.4); c.lineTo(2.4, -2.4); c.lineTo(3, 0.6); c.quadraticCurveTo(8.4, 0.8, 8.6, 3.4); c.lineTo(8.6, 4.8); c.lineTo(-3.8, 4.8); c.lineTo(-3.8, -1); c.closePath(); }, r, -3.8, 8.6);
  px(c, -4, 4.2, 12.8, 1.2, '#050505');
  px(c, -3.6, 3.4, 2.4, 1, '#3A2414');
  // (the shine: a lit streak along the toe cap, a glint)
  line(c, [3.6, 1.6, 7, 2.2], 0.8, r[0]); px(c, 6.4, 1.4, 0.8, 0.6, '#FFFFFF');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The body: the vest over the belly, the shirt and bow tie, the frock coat open over it, the badge

const drawBody = (c: Ctx, pose: TuckerPose, f: number) => {
  const breathe = Math.sin(f * 0.05) * 0.4;
  // ---- the vest, over a belly like a barrel (a bit lower and rounder sat down)
  const by = pose === 'sit' ? -43 : -45, bry = 13.4 + breathe;
  shape(c, () => {
    c.moveTo(-8, -59); c.lineTo(8.5, -59);
    c.quadraticCurveTo(15.5, -52, 14.6, by); c.quadraticCurveTo(14, by + 10, 9, by + bry - 1.5);
    c.lineTo(4.5, by + bry + 2); c.lineTo(1.5, by + bry - 0.5); c.lineTo(-1.5, by + bry + 2); c.lineTo(-6, by + bry - 1.5);
    c.quadraticCurveTo(-12.6, by + 9, -12.6, by); c.quadraticCurveTo(-12.8, -52, -8, -59); c.closePath();
  }, VEST, -12.8, 15.5);
  // (the belly's roundness: a lit curve up high, the shade under it)
  line(c, [-6, by - 7, 0, by - 10, 7, by - 8.4], 0.8, VEST[0]);
  line(c, [-7, by + 8, 1, by + 10.6, 9, by + 8.4], 0.8, VEST[3]);
  // (the vest's buttons down its front, straining; the gap between two of them)
  for (let i = 0; i < 5; i++) { const yy = -55 + i * 4.6, xx = 1.6 + Math.sin(((yy - by) / 14) * 1.4) * 1.4; button(c, xx, yy, 0.85); }
  fill(c, SHIRT[2], () => c.ellipse(2.4, by + 2.3, 1.1, 0.8, 0, 0, Math.PI * 2));
  // (the welt pockets, the watch chain swagged across between them, the fob hanging)
  px(c, -9, by - 3, 5, 1, VEST[4]); px(c, 7, by - 3, 5, 1, VEST[4]);
  c.strokeStyle = BRASS[4]; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-6.6, by - 3); c.quadraticCurveTo(1, by + 4, 9.4, by - 3); c.stroke();
  c.strokeStyle = BRASS[1]; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-6.6, by - 3.2); c.quadraticCurveTo(1, by + 3.6, 9.4, by - 3.2); c.stroke();
  for (let k = 0.15; k < 1; k += 0.14) { const t = k, qx = (1 - t) * (1 - t) * -6.6 + 2 * (1 - t) * t * 1 + t * t * 9.4, qy = (1 - t) * (1 - t) * (by - 3) + 2 * (1 - t) * t * (by + 4) + t * t * (by - 3); px(c, qx - 0.3, qy - 0.3, 0.6, 0.6, BRASS[0]); }
  const swing = Math.sin(f * 0.09) * 0.8;
  line(c, [1, by + 0.6, 1 + swing, by + 4], 0.6, BRASS[3]); ell(c, 1 + swing, by + 5, 1.3, 1.5, BRASS[2]); px(c, 0.6 + swing, by + 4.4, 0.6, 0.6, BRASS[0]);
  // ---- the shirt front and its stiff collar, the bow tie
  fill(c, SHIRT[1], () => { c.moveTo(-4, -60.5); c.lineTo(5, -60.5); c.lineTo(1, -52.5); c.closePath(); });
  shape(c, () => c.roundRect(-4.4, -63.6, 9.4, 3.6, 1), SHIRT, -4.4, 5, 0.6);
  fill(c, SHIRT[0], () => { c.moveTo(-1.5, -60.4); c.lineTo(-4.6, -60); c.lineTo(-3.6, -58.2); c.closePath(); });
  fill(c, SHIRT[0], () => { c.moveTo(2.5, -60.4); c.lineTo(5.6, -60); c.lineTo(4.6, -58.2); c.closePath(); });
  // (the bow tie: two wings, a knot)
  const tie: Ramp = ['#4A4A52', '#1E1E24', '#141418', '#0C0C10', '#000000'];
  shape(c, () => { c.moveTo(0.4, -60.4); c.lineTo(-4, -62.4); c.lineTo(-4.2, -58); c.closePath(); }, tie, -4.2, 0.4, 0.5);
  shape(c, () => { c.moveTo(1, -60.4); c.lineTo(5.4, -62.4); c.lineTo(5.6, -58); c.closePath(); }, tie, 1, 5.6, 0.5);
  ell(c, 0.7, -60.2, 1.1, 1.2, tie[1]); px(c, 0.2, -60.9, 0.6, 0.5, tie[0]);
  // ---- the frock coat, open: its two fronts down from the shoulders past his hips, the lapels turned back
  const hem = pose === 'sit' ? -26 : -24;
  // (the far front: behind the belly's far side)
  shape(c, () => { c.moveTo(-6, -61); c.lineTo(-12, -60); c.quadraticCurveTo(-15.4, -56, -15, -48); c.lineTo(-14.6, hem + 6); c.quadraticCurveTo(-13.4, hem, -9.6, hem); c.lineTo(-8.4, -40); c.quadraticCurveTo(-11.6, -48, -9.4, -55); c.closePath(); }, COAT, -15.4, -6);
  // (the near front: over the belly's near side, its edge curving out round it)
  shape(c, () => { c.moveTo(7, -61); c.lineTo(13, -60); c.quadraticCurveTo(17, -55, 17.2, -47); c.lineTo(16.6, hem + 5); c.quadraticCurveTo(15.6, hem, 12, hem); c.lineTo(13.6, -38); c.quadraticCurveTo(16.4, -46, 11.4, -55); c.closePath(); }, COAT, 7, 17.2);
  // (the lapels: notched, a step lighter where they turn)
  shape(c, () => { c.moveTo(-5, -61); c.lineTo(-9.6, -55); c.lineTo(-8.8, -52); c.lineTo(-11, -50); c.lineTo(-9.6, -59.6); c.closePath(); }, COAT, -11, -5, 0.7);
  shape(c, () => { c.moveTo(6, -61); c.lineTo(11.4, -55); c.lineTo(10.4, -52); c.lineTo(12.8, -50); c.lineTo(11, -59.6); c.closePath(); }, COAT, 6, 12.8, 0.7);
  // (two rows of brass buttons down the fronts; the gold piping along their edges)
  for (let i = 0; i < 3; i++) { button(c, -12, -53 + i * 6.4); button(c, 14.6, -52 + i * 6.4); }
  line(c, [-9.4, -55, -11.4, -48, -8.6, -40], 0.5, BRASS[2]);
  line(c, [11.4, -55, 16, -46, 13.6, -38], 0.5, BRASS[2]);
  // (his badge on the near lapel: a brass plate, TUCKER stamped in it (dots at this size), its pin)
  shape(c, () => c.roundRect(8.6, -50.4, 6, 2.6, 0.6), BRASS, 8.6, 14.6, 0.5);
  for (let i = 0; i < 6; i++) px(c, 9.3 + i * 0.85, -49.5, 0.5, 0.9, BRASS[4]);
  // (the coat's shoulders: a step of shade where the sleeve sets in; the fabric's fold under the arm)
  line(c, [-12, -60, -14.6, -56], 0.6, COAT[3]); line(c, [13, -60, 16, -56], 0.6, COAT[0]);
};

// ---------------------------------------------------------------------------------------------------------------
// The arms: navy sleeves with gold piping round the cuffs, white cotton gloves

interface Arm { sx: number; sy: number; hx: number; hy: number; bend: number; fist: boolean; palm?: boolean; point?: boolean; thumbIn?: boolean; grip?: boolean }

/** 'aim': the near hand's reach from his shoulder, out along the pistol's angle. */
const AIM_REACH = 22;
/** 'aim': where the flintlock's muzzle is (x, y from his feet, facing right; drawTucker's units) at `aim`. */
export const tuckerMuzzle = (aim: number): [number, number] => {
  const cs = Math.cos(aim), sn = Math.sin(aim), L = FLINT_BARREL + 0.8, up = -4.2;
  return [13 + cs * AIM_REACH + cs * L - sn * up, -58 + sn * AIM_REACH + sn * L + cs * up];
};

const armsFor = (pose: TuckerPose, f: number, aim = 0): [Arm, Arm] => {
  const FS = { sx: -12, sy: -58 }, NS = { sx: 13, sy: -58 };
  const sh = Math.sin(f * 1.3) * 1.6;
  switch (pose) {
    case 'talk': {
      const wave = Math.sin(f * 0.16) * 4;
      return [{ ...FS, hx: -4, hy: -43, bend: -1, fist: false }, { ...NS, hx: 22, hy: -60 + wave, bend: 1, fist: false, palm: true }];
    }
    case 'ticket':
      return [{ ...FS, hx: 2, hy: -66 + Math.abs(Math.sin(f * 0.25)) * 1.5, bend: -1, fist: true, grip: true }, { ...NS, hx: 25, hy: -47, bend: 1, fist: false, palm: true }];
    case 'tip':
      return [{ ...FS, hx: -4, hy: -43, bend: -1, fist: false }, { ...NS, hx: 9, hy: -88, bend: -1, fist: false, grip: true }];
    case 'sit':
      return [{ ...FS, hx: -18, hy: -36, bend: 1, fist: false }, { ...NS, hx: 22, hy: -36, bend: -1, fist: false }];
    case 'flat':
      return [{ ...FS, hx: -24, hy: -66, bend: 1, fist: false }, { ...NS, hx: 26, hy: -66, bend: -1, fist: false }];
    case 'furious':
      return [{ ...FS, hx: -15, hy: -70 + sh, bend: 1, fist: true }, { ...NS, hx: 17, hy: -72 - sh, bend: -1, fist: true }];
    case 'point':
      return [{ ...FS, hx: -15, hy: -40, bend: 1, fist: true }, { ...NS, hx: 30, hy: -62, bend: 0.2, fist: true, point: true }];
    case 'run': {
      // (manic: both fists pumping high, up by his ears in turn, elbows out)
      const k = Math.sin(f * 0.34);
      return [{ ...FS, hx: -14 + k * 6, hy: -66 - Math.max(0, k) * 10, bend: 1, fist: true }, { ...NS, hx: 18 - k * 6, hy: -66 - Math.max(0, -k) * 10, bend: -1, fist: true }];
    }
    case 'cab':
      return [{ ...FS, hx: -4, hy: -38, bend: -1, fist: false, grip: true }, { ...NS, hx: 26, hy: -74 + sh, bend: -1, fist: true }];
    case 'whistle':
      return [{ ...FS, hx: -4, hy: -38, bend: -1, fist: false, grip: true }, { ...NS, hx: 9, hy: -106 + Math.max(0, Math.sin(f * 0.2)) * 6, bend: -1, fist: true, grip: true }];
    case 'hurt':
      return [{ ...FS, hx: -24, hy: -70, bend: 1, fist: false }, { ...NS, hx: 18, hy: -76, bend: -1, fist: false, palm: true }];
    case 'shove':
      return [{ ...FS, hx: 18, hy: -60, bend: 0.3, fist: false, palm: true }, { ...NS, hx: 34, hy: -58, bend: 0.2, fist: false, palm: true }];
    case 'slam':
      return [{ ...FS, hx: -15, hy: -40, bend: 1, fist: true }, { ...NS, hx: 20, hy: -98 + Math.sin(f * 0.5) * 1.5, bend: -1, fist: true }];
    case 'press':
      return [{ ...FS, hx: -15, hy: -40, bend: 1, fist: true }, { ...NS, hx: 28, hy: -48, bend: 1, fist: true }];
    case 'pop': {
      const w = Math.sin(f * 0.9) * 2;
      return [{ ...FS, hx: -22, hy: -92 + w, bend: 1, fist: false, palm: true }, { ...NS, hx: 24, hy: -95 - w, bend: -1, fist: false, palm: true }];
    }
    case 'pounce':
      return [{ ...FS, hx: 0, hy: -97, bend: -0.4, fist: false, palm: true }, { ...NS, hx: 12, hy: -98, bend: 0.4, fist: false, palm: true }];
    case 'ride':
      return [{ ...FS, hx: 19, hy: -51, bend: 1, fist: true, grip: true }, { ...NS, hx: 23, hy: -53, bend: 1, fist: true, grip: true }];
    case 'ridepoint':
      return [{ ...FS, hx: 19, hy: -51, bend: 1, fist: true, grip: true }, { ...NS, hx: 31, hy: -66, bend: 0.2, fist: true, point: true }];
    case 'impaled': {
      // (limp: both arms hanging straight down off the branch, swaying with him)
      const sw = Math.sin(f * 0.05) * 1.2;
      return [{ ...FS, hx: -7 + sw, hy: -35, bend: 1, fist: false }, { ...NS, hx: 18 + sw, hy: -34, bend: -1, fist: false }];
    }
    case 'grope': {
      // (blind: both hands out in front of him, open, feeling the air in slow circles)
      const w = Math.sin(f * 0.13) * 4, w2 = Math.cos(f * 0.11) * 3.5;
      return [{ ...FS, hx: 20 + w, hy: -64 + w2, bend: -0.5, fist: false, palm: true }, { ...NS, hx: 30 - w, hy: -60 - w2, bend: 0.4, fist: false, palm: true }];
    }
    case 'aim': {
      // (the pistol out at arm's length, the arm all but straight, trembling (more the madder he gets: the caller wobbles
      // `aim`); the far hand cupped behind his ear)
      return [{ ...FS, hx: -6, hy: -74, bend: 1, fist: false, palm: true }, { ...NS, hx: NS.sx + Math.cos(aim) * AIM_REACH, hy: NS.sy + Math.sin(aim) * AIM_REACH, bend: 0.12, fist: true, grip: true }];
    }
    case 'cock':
      return [{ ...FS, hx: 15, hy: -71, bend: -0.6, fist: true }, { ...NS, hx: 17, hy: -66, bend: -1, fist: true, grip: true }];
    case 'reload': {
      // (the rod rammed down, drawn up, rammed down)
      const r = Math.abs(Math.sin(f * 0.2)) * 9;
      return [{ ...FS, hx: 8, hy: -44, bend: -1, fist: true, grip: true }, { ...NS, hx: 10, hy: -78 + r, bend: -1, fist: true, grip: true }];
    }
    case 'mauled': {
      // (on his back: arms flailing up at them, slapping, shielding his face)
      const k = Math.sin(f * 0.7), k2 = Math.cos(f * 0.8);
      return [{ ...FS, hx: -22 + k * 8, hy: -70 - k2 * 10, bend: 1, fist: false, palm: true }, { ...NS, hx: 24 - k2 * 8, hy: -72 + k * 10, bend: -1, fist: false, palm: true }];
    }
    default:
      // (thumbs hooked in his vest pockets)
      return [{ ...FS, hx: -7, hy: -47, bend: -1, fist: false, thumbIn: true }, { ...NS, hx: 9, hy: -47, bend: 1, fist: false, thumbIn: true }];
  }
};

const drawArm = (c: Ctx, A: Arm, near: boolean, _pose: TuckerPose, _f: number) => {
  const r = near ? COAT : back(COAT);
  const [ex, ey] = joint(A.sx, A.sy, A.hx, A.hy, 12, 11.4, A.bend * (near ? 1 : -1));
  // (the forearm stops short of the hand: the cuff)
  const cx = lerp(ex, A.hx, 0.8), cy = lerp(ey, A.hy, 0.8);
  tube(c, [A.sx, A.sy, ex, ey, cx, cy], [6.8, 6], [r, r]);
  // (the elbow's crease)
  ell(c, ex, ey, 1.2, 0.8, r[3]);
  // (the cuff: a band of gold piping, two little buttons)
  const ang = Math.atan2(A.hy - ey, A.hx - ex);
  c.save(); c.translate(cx, cy); c.rotate(ang);
  px(c, -1.6, -3.4, 2.2, 6.8, r[2]); line(c, [-1.2, -3.4, -1.2, 3.4], 0.6, BRASS[2]); line(c, [0.4, -3.4, 0.4, 3.4], 0.4, BRASS[1]);
  px(c, -1, 2.2, 0.8, 0.8, BRASS[1]);
  c.restore();
  hand(c, A, near, ang);
};

/** A white cotton glove: a fist, an open palm, a pointing finger, or the thumb hooked in a pocket. */
const hand = (c: Ctx, A: Arm, near: boolean, ang: number) => {
  const g = near ? GLOVE : back(GLOVE);
  c.save(); c.translate(A.hx, A.hy); c.rotate(ang);
  if (A.thumbIn) {
    // (the fingers splayed over the vest, the thumb out of sight in the pocket)
    shape(c, () => c.roundRect(-1.6, -2.6, 4.6, 5.2, 1.6), g, -1.6, 3, 0.7);
    for (let i = 0; i < 3; i++) line(c, [2.2, -1.6 + i * 1.6, 3.6, -1.4 + i * 1.6], 0.5, g[3]);
  } else if (A.point) {
    shape(c, () => c.roundRect(-2.2, -2.6, 5, 5.2, 1.8), g, -2.2, 2.8, 0.7);
    shape(c, () => c.roundRect(2, -1.6, 6.4, 2, 1), g, 2, 8.4, 0.6);
    line(c, [0, -2.4, 1.2, -3.4], 1.4, g[2]);
  } else if (A.fist || A.grip) {
    shape(c, () => c.roundRect(-2.4, -2.8, 5.4, 5.6, 2), g, -2.4, 3, 0.7);
    for (let i = 0; i < 3; i++) line(c, [1.6, -1.6 + i * 1.6, 3, -1.6 + i * 1.6], 0.45, g[3]);
    line(c, [-1, -2.6, 1.4, -1.6], 1.2, g[2]);
  } else {
    // (open: the palm up and out, the fingers together, the thumb up)
    shape(c, () => { c.moveTo(-2.4, -2.4); c.lineTo(5.6, -2); c.quadraticCurveTo(7.4, -0.2, 5.6, 1.6); c.lineTo(-2.2, 2.6); c.closePath(); }, g, -2.4, 7.4, 0.7);
    shape(c, () => c.roundRect(0.6, -5, 1.8, 3.6, 0.9), g, 0.6, 2.4, 0.5);
    for (let i = 0; i < 2; i++) line(c, [2.4, -0.6 + i * 1.3, 5.6, -0.4 + i * 1.3], 0.4, g[3]);
    if (A.palm) px(c, -0.4, 0.4, 3.2, 1, g[2]);
  }
  c.restore();
};

/** The ticket punch, up in his fist and clicking: steel jaws, a spring, the handles. */
const drawPunch = (c: Ctx, x: number, y: number, f: number) => {
  const open = (f >> 3) % 2 ? 0.25 : 0;
  c.save(); c.translate(x, y - 2);
  line(c, [0, 2, -1.6, -7], 1.6, STEEL[4]); line(c, [0, 2, -1.6, -7], 0.8, STEEL[2]);
  c.save(); c.rotate(open);
  line(c, [0.6, 2, 2.6, -7], 1.6, STEEL[4]); line(c, [0.6, 2, 2.6, -7], 0.8, STEEL[1]);
  c.restore();
  ell(c, 0.6, -8, 2.4, 1.6, STEEL[3]); ell(c, 0.4, -8.4, 1.4, 0.9, STEEL[1]);
  px(c, -0.2, -9.6, 1.4, 1, '#B91C1C');
  c.restore();
};

/** The flintlock's barrel: from his fist to the muzzle (the figure's units). */
const FLINT_BARREL = 16;
const WALNUT: Ramp = ['#B07A46', '#7A4A24', '#5E3618', '#42240E', '#1E1006'];
const IRON: Ramp = ['#C8CCD4', '#7C8088', '#5A5E66', '#3A3E46', '#16181C'];
/**
 * His flintlock pistol, in a fist at (x, y), pointing along `ang` (radians; 0 straight ahead): a long octagonal iron
 * barrel to a flared muzzle, the walnut stock under it down to a brass-capped bird's-head grip (in his fist), the lock
 * plate, the cock (its jaws holding the flint: hauled back when `cocked`, down on the frizzen when not), the pan; the
 * pan flashing when `pan` (the priming's caught: the shot's a beat off).
 */
export const drawFlintlock = (c: Ctx, x: number, y: number, ang: number, o: { cocked?: boolean; pan?: boolean; f?: number } = {}) => {
  const f = o.f ?? 0;
  c.save(); c.translate(x, y); c.rotate(ang);
  // ---- the grip, down and back out of his fist, a brass cap on its butt
  shape(c, () => { c.moveTo(-1.6, -2.4); c.lineTo(2.6, -2.6); c.quadraticCurveTo(1.6, 2, -1.2, 5.6); c.lineTo(-4.4, 5); c.quadraticCurveTo(-2.4, 2, -1.6, -2.4); c.closePath(); }, WALNUT, -4.4, 2.6, 0.5);
  ell(c, -2.8, 5.6, 2, 1.2, BRASS[2]); px(c, -3.8, 5, 1, 0.5, BRASS[0]);
  // ---- the stock forward under the barrel, its brass nose cap
  shape(c, () => { c.moveTo(1.2, -3.6); c.lineTo(FLINT_BARREL - 3, -3); c.lineTo(FLINT_BARREL - 3, -1.6); c.lineTo(1.6, -0.8); c.closePath(); }, WALNUT, 1.2, FLINT_BARREL - 3, 0.4);
  px(c, FLINT_BARREL - 4, -3.1, 1.2, 1.5, BRASS[2]);
  // ---- the barrel: iron, octagonal (a lit flat along its top), a flared muzzle, the sight
  shape(c, () => { c.moveTo(1, -5.4); c.lineTo(FLINT_BARREL, -5); c.lineTo(FLINT_BARREL + 0.8, -5.6); c.lineTo(FLINT_BARREL + 0.8, -2.4); c.lineTo(FLINT_BARREL, -3); c.lineTo(1, -3.4); c.closePath(); }, IRON, 1, FLINT_BARREL + 0.8, 0.45);
  line(c, [2, -5, FLINT_BARREL - 0.4, -4.7], 0.35, IRON[0]);
  px(c, FLINT_BARREL - 1.4, -6, 0.6, 0.7, BRASS[1]);
  ell(c, FLINT_BARREL + 0.8, -4, 0.35, 1.1, '#050505');
  // ---- the lock: its plate on the stock's side, the pan and the frizzen, the cock with its flint
  shape(c, () => c.roundRect(-1.2, -4.6, 5, 2.6, 0.6), IRON, -1.2, 3.8, 0.35);
  px(c, 2.8, -6, 1.6, 1.4, IRON[2]); px(c, 3, -7.4, 0.8, 1.6, IRON[1]);
  c.save(); c.translate(-0.6, -4.6); c.rotate(o.cocked ? -0.9 : 0.25);
  line(c, [0, 0, 1.6, -2.6, 3, -3], 0.9, IRON[4]); line(c, [0, 0, 1.6, -2.6, 3, -3], 0.45, IRON[1]);
  px(c, 2.4, -3.8, 1.4, 1.2, '#4A4A52');
  c.restore();
  // ---- the flash in the pan: sparks off the frizzen, the priming fizzing up in a puff
  if (o.pan) {
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + Math.sin(f * 1.7 + i * 2.1) * 1.1, r = 2 + ((f * 3 + i * 5) % 7); px(c, 3.4 + Math.cos(a) * r, -6.2 + Math.sin(a) * r, 0.7, 0.7, i % 2 ? '#FDE047' : '#FFFFFF'); }
    ell(c, 3.6, -7.4, 1.8 + (f % 4) * 0.3, 1.4, 'rgba(255, 240, 180, 0.9)');
    c.globalAlpha = 0.6; ell(c, 3, -10 - (f % 6) * 0.6, 2.6, 2, '#D6D3D1'); c.globalAlpha = 1;
  }
  c.restore();
};

const steam = (c: Ctx, hx: number, hy: number, f: number) => {
  for (let i = 0; i < 2; i++) {
    const t = ((f * 0.04 + i * 0.5) % 1), s = i ? 1 : -1;
    const x = hx + s * (12 + t * 6), y = hy - 6 - t * 16;
    c.globalAlpha = 0.6 * (1 - t);
    ell(c, x, y, 2.6 + t * 4, 2 + t * 3, '#F1F5F9');
    c.globalAlpha = 1;
  }
};

const stars = (c: Ctx, x: number, y: number, f: number) => {
  for (let i = 0; i < 3; i++) {
    const a = f * 0.08 + (i * Math.PI * 2) / 3, sx = x + Math.cos(a) * 12, sy = y + Math.sin(a) * 4;
    fill(c, '#FDE047', () => { for (let k = 0; k < 10; k++) { const r = k % 2 ? 1.1 : 2.8, aa = -Math.PI / 2 + (k * Math.PI) / 5; c.lineTo(sx + Math.cos(aa) * r, sy + Math.sin(aa) * r); } c.closePath(); });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The head (a unit space about 24 across and 26 tall, its middle at the origin, facing right; scaled HS on him)

const EYE_Y = -2.6, FAR_EYE = -1.2, NEAR_EYE = 6.4;

/** The mouth's shape while he talks (off the frame count): how open, how wide. */
const viseme = (f: number) => {
  const k = Math.floor(f / 5) % 8;
  return [{ o: 0.4, w: 0.8 }, { o: 2.2, w: 1 }, { o: 1.2, w: 1.2 }, { o: 3, w: 0.9 }, { o: 0.6, w: 1.3 }, { o: 2.6, w: 1 }, { o: 1.6, w: 0.7 }, { o: 0.2, w: 1 }][k];
};

/** How far the felled tree's driven the saw down and split his face: 0 (not yet) .. 1 (all the way; `split: true`). */
const splitOf = (w: TuckerWounds) => (w.split === true ? 1 : typeof w.split === 'number' ? Math.max(0, Math.min(1, w.split)) : 0);
/** From this far into the split on, both his eyes are gone (the far one burst out of its socket: the close-up's). */
export const SPLIT_EYES_AT = 0.45;
/** The split (head units): the cut's x down his face, where it stops (the top of his nose), and how far each half's
 *  sheared out from it at full (the gap opens wider the higher up: a V, the saw wedged in it). */
const SPLIT = { x: 4.2, py: -0.6, shear: 0.15 };
/** Where the saw's hub sits: up in his forehead (the log ride's) .. driven down to his nose (the split's). */
const sawHubY = (d: number) => lerp(-17, -10.8, d);

/** His head: as it is, or split (the two halves sheared apart up from the top of his nose, the gap and the saw in it). */
const drawHead = (c: Ctx, face: TuckerFace, f: number, talking: boolean, capless: boolean, red: boolean, wounds: TuckerWounds) => {
  const d = splitOf(wounds);
  if (d <= 0) { headInner(c, face, f, talking, capless, red, wounds); return; }
  const s = SPLIT.shear * d, { x: cx, py } = SPLIT;
  // (below the split: as he is; above it, each half sheared out away from the cut, more the higher up)
  for (const side of [0, -1, 1] as const) {
    c.save();
    if (side) { c.translate(0, py); c.transform(1, 0, -side * s, 1, 0, 0); c.translate(0, -py); }
    c.beginPath();
    if (side === 0) c.rect(-40, py, 80, 60);
    else if (side < 0) c.rect(-40, -60, 40 + cx, 60 + py);
    else c.rect(cx, -60, 40, 60 + py);
    c.clip();
    headInner(c, face, f, talking, capless, red, wounds);
    c.restore();
  }
  drawSplitGap(c, d, f, capless);
};

const headInner = (c: Ctx, face: TuckerFace, f: number, talking: boolean, capless: boolean, red: boolean, wounds: TuckerWounds) => {
  const S = red ? RAGE : SKIN;
  // ---- the back of his neck, the jowls over his collar
  // ---- the skull: round and jowly, a double chin
  const skull = () => {
    c.moveTo(-10.4, -5); c.quadraticCurveTo(-10.8, -13.6, -0.6, -13.8); c.quadraticCurveTo(9.4, -13.8, 10.6, -5.6);
    c.quadraticCurveTo(12, 1, 11.4, 5.4); c.quadraticCurveTo(10.6, 10.8, 6, 12.6); c.quadraticCurveTo(1.4, 14.2, -3.2, 12.8);
    c.quadraticCurveTo(-9.4, 10.6, -10.6, 4); c.quadraticCurveTo(-11.2, -0.4, -10.4, -5); c.closePath();
  };
  c.beginPath(); skull(); c.fillStyle = S[1]; c.fill();
  c.save(); c.clip();
  // (the back of his head in shade, stepped; under the jowls; the cap's shadow across his brow)
  px(c, -12, -20, 4.6, 40, S[2]); px(c, -7.4, -20, 1, 40, dith(c, S[2])); px(c, -12, -20, 2.2, 40, S[3]);
  ell(c, 2, 13.6, 10, 3.6, S[2]); ell(c, 2, 15, 9, 2.6, S[3]);
  if (!capless) { px(c, -12, -11, 24, 2.6, S[2]); px(c, -12, -8.4, 24, 1, dith(c, S[2])); }
  // (his apple cheeks: rosy, round, a lit spot on each)
  ell(c, 7.4, 3, 3.8, 3, (red ? RAGE : ROSY)[1]); ell(c, 7.4, 3, 4.6, 3.7, dith(c, (red ? RAGE : ROSY)[1])); ell(c, 6.6, 2, 1.2, 0.8, (red ? RAGE : ROSY)[0]);
  ell(c, -3.4, 3.6, 2.4, 2, dith(c, (red ? RAGE : ROSY)[1]));
  // (the brow catching the light, the temple)
  px(c, 0, -8, 7, 1, S[0]); px(c, 9.2, -6, 1, 3.4, S[0]);
  c.restore();
  c.beginPath(); skull(); c.strokeStyle = S[4]; c.lineWidth = 0.8; c.stroke();
  // (the double chin's line)
  line(c, [-1.4, 11.2, 2.4, 12.4, 6.6, 11], 0.6, S[3]);
  // ---- the ear
  shape(c, () => c.ellipse(-9.4, 0.4, 3, 4.2, -0.1, 0, Math.PI * 2), S, -12.4, -6.4, 0.8);
  fill(c, S[2], () => c.ellipse(-9.2, 0.6, 1.5, 2.6, -0.1, 0, Math.PI * 2)); px(c, -9.4, -0.6, 0.8, 2, S[3]);
  // ---- the muttonchops: ginger, bushy, down his cheeks from under the cap to the mustache
  shape(c, () => { c.moveTo(-6.4, -8.4); c.lineTo(-3.4, -8.6); c.quadraticCurveTo(-2.2, -1, 0.6, 5.4); c.quadraticCurveTo(-3, 9.6, -6.4, 7.6); c.quadraticCurveTo(-8.2, 0, -6.4, -8.4); c.closePath(); }, GINGER, -8.2, 0.6, 0.7);
  for (let i = 0; i < 6; i++) line(c, [-5.6 + (i % 3) * 1.2, -6 + i * 2.2, -4.8 + (i % 3) * 1.2, -4.4 + i * 2.2], 0.45, GINGER[i % 2 ? 0 : 3]);
  // (the near chop, round the front of his jaw, under the cheek)
  shape(c, () => { c.moveTo(10.6, -4); c.quadraticCurveTo(12.2, 2, 10.8, 7); c.quadraticCurveTo(8.6, 8.6, 7.6, 6.6); c.quadraticCurveTo(10, 2, 9.4, -3.6); c.closePath(); }, GINGER, 7.6, 12.2, 0.6);
  // ---- the eyes behind the spectacles, the brows
  drawEyes(c, face, f, wounds);
  drawBrows(c, face, f);
  // ---- the nose: a button gone red at the tip
  shape(c, () => { c.moveTo(3.2, -1.6); c.quadraticCurveTo(4.8, 0.6, 7.2, 2); c.quadraticCurveTo(8.4, 3.8, 6.4, 4.4); c.lineTo(3.6, 4.2); c.quadraticCurveTo(2.2, 3.4, 3, 1.2); c.closePath(); }, S, 2.2, 8.4, 0.7);
  ell(c, 6.4, 2.8, 1.6, 1.3, (red ? RAGE : ROSY)[1]); px(c, 5.8, 1.8, 0.8, 0.6, '#FFF4EC');
  ell(c, 4.8, 4, 0.8, 0.4, S[4]);
  // ---- the spectacles: round wire rims on his nose, the arm back to his ear, a glint (split: snapped at the bridge, the
  // far half gone with his eye, the near lens hanging crooked and starred)
  if (splitOf(wounds) >= SPLIT_EYES_AT) brokenSpecs(c);
  else specs(c, f);
  // ---- the mouth under the mustache, then the mustache over it
  drawMouth(c, face, f, talking);
  mustache(c, face, f, talking);
  // ---- the cap
  if (!capless) drawCap(c, f);
  drawWounds(c, wounds, 'head', f, capless);
};

const specs = (c: Ctx, f: number) => {
  for (const [ex, r] of [[FAR_EYE, 2.6], [NEAR_EYE, 3]] as const) {
    c.strokeStyle = '#5E4A1C'; c.lineWidth = 1; c.beginPath(); c.ellipse(ex, EYE_Y + 0.2, r, r * 0.92, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = WIRE; c.lineWidth = 0.5; c.beginPath(); c.ellipse(ex, EYE_Y + 0.2, r, r * 0.92, 0, Math.PI * 1.05, Math.PI * 1.7); c.stroke();
    // (the glass: a pale glint across its top)
    c.globalAlpha = 0.5; line(c, [ex - r * 0.5, EYE_Y - r * 0.5, ex + r * 0.1, EYE_Y - r * 0.75], 0.6, '#FFFFFF'); c.globalAlpha = 1;
  }
  line(c, [FAR_EYE + 2.6, EYE_Y - 0.2, NEAR_EYE - 3, EYE_Y - 0.2], 0.6, WIRE);
  line(c, [FAR_EYE - 2.6, EYE_Y, -8.6, -1.4], 0.6, WIRE);
  if (f % 240 < 10) px(c, NEAR_EYE + 0.6, EYE_Y - 1.8, 1.2, 1.2, '#FFFFFF');
};
/** The spectacles after the split: the bridge snapped (a stub of wire), the near lens slipped down his cheek, crooked,
 *  its glass starred and smeared red. */
const brokenSpecs = (c: Ctx) => {
  const lx = NEAR_EYE + 1.2, ly = EYE_Y + 3.6;
  c.strokeStyle = '#5E4A1C'; c.lineWidth = 1; c.beginPath(); c.ellipse(lx, ly, 3, 2.7, 0.5, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = WIRE; c.lineWidth = 0.5; c.beginPath(); c.ellipse(lx, ly, 3, 2.7, 0.5, Math.PI * 1.05, Math.PI * 1.7); c.stroke();
  c.globalAlpha = 0.75;
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.9; line(c, [lx + 0.3, ly - 0.2, lx + Math.cos(a) * 2.6, ly + Math.sin(a) * 2.3], 0.22, '#E8F0F8'); }
  c.globalAlpha = 0.5; ell(c, lx - 0.6, ly + 0.8, 1.6, 1, '#991B1B'); c.globalAlpha = 1;
  line(c, [lx - 2.9, ly - 0.9, lx - 4.4, ly - 2.6], 0.6, WIRE);
};

const eye = (c: Ctx, x: number, y: number, r: number, look: number, lid: number) => {
  ell(c, x, y, r + 0.4, r * 0.86 + 0.4, SKIN[4]);
  ell(c, x, y, r, r * 0.86, '#FBF8F0');
  px(c, x - r, y + r * 0.3, r * 2, r * 0.56, '#E2DDD0');
  ell(c, x + look, y + 0.1, r * 0.55, r * 0.6, '#4A7AB0');
  ell(c, x + look, y + 0.1, r * 0.3, r * 0.3, '#0B0B0F');
  px(c, x + look + 0.2, y - 0.8, 0.6, 0.6, '#FFFFFF');
  if (lid > 0) {
    c.save(); c.beginPath(); c.ellipse(x, y, r + 0.5, r * 0.86 + 0.5, 0, 0, Math.PI * 2); c.clip();
    px(c, x - r - 1, y - r - 1, r * 2 + 2, (r * 2 + 1) * lid, SKIN[2]);
    c.restore();
  }
};

const drawEyes = (c: Ctx, face: TuckerFace, f: number, wounds: TuckerWounds) => {
  const happy = (x: number, w: number) => line(c, [x - w, EYE_Y + 0.6, x, EYE_Y - 1.2, x + w, EYE_Y + 0.6], 0.9, '#2A1508');
  const blink = f % 210 < 5;
  // (the eye he loses: the near one. Once it's shot through, its painter draws the hole: `drawWounds`)
  const nearOk = !wounds.eye;
  // (the split: both gone; the sockets are its wound's)
  if (splitOf(wounds) >= SPLIT_EYES_AT) return;
  switch (face) {
    case 'cheer': happy(FAR_EYE, 1.6); if (nearOk) happy(NEAR_EYE, 1.9); return;
    case 'out':
      for (const ex of [FAR_EYE, NEAR_EYE]) { if (ex === NEAR_EYE && !nearOk) continue; line(c, [ex - 1.4, EYE_Y - 1.4, ex + 1.4, EYE_Y + 1.4], 0.8, '#2A1508'); line(c, [ex - 1.4, EYE_Y + 1.4, ex + 1.4, EYE_Y - 1.4], 0.8, '#2A1508'); }
      return;
    case 'daze': {
      // (spirals, swimming)
      for (const [ex, r] of [[FAR_EYE, 1.6], [NEAR_EYE, 1.9]] as const) {
        if (ex === NEAR_EYE && !nearOk) continue;
        c.strokeStyle = '#2A1508'; c.lineWidth = 0.6; c.beginPath();
        for (let k = 0; k < 18; k++) { const a = k * 0.7 + f * 0.2, rr = (k / 18) * r; c.lineTo(ex + Math.cos(a) * rr, EYE_Y + Math.sin(a) * rr); }
        c.stroke();
      }
      return;
    }
    case 'ow': line(c, [FAR_EYE - 1.6, EYE_Y - 1.2, FAR_EYE + 1, EYE_Y, FAR_EYE - 1.6, EYE_Y + 1.2], 0.9, '#2A1508'); if (nearOk) line(c, [NEAR_EYE + 1.8, EYE_Y - 1.2, NEAR_EYE - 1, EYE_Y, NEAR_EYE + 1.8, EYE_Y + 1.2], 0.9, '#2A1508'); return;
    case 'shock': eye(c, FAR_EYE, EYE_Y, 1.9, 0.4, 0); if (nearOk) eye(c, NEAR_EYE, EYE_Y, 2.3, 0.5, 0); return;
    case 'manic': {
      // (the far one squeezed to a pinprick, the near one bulging out of his spectacles, both twitching)
      const j = Math.sin(f * 0.9) * 0.3;
      ell(c, FAR_EYE, EYE_Y + 0.4, 1.4, 0.7, SKIN[4]); ell(c, FAR_EYE, EYE_Y + 0.4, 1.1, 0.45, '#FBF8F0'); px(c, FAR_EYE - 0.3 + j, EYE_Y + 0.2, 0.6, 0.5, '#0B0B0F');
      if (nearOk) {
        ell(c, NEAR_EYE, EYE_Y - 0.4, 3, 3.2, SKIN[4]); ell(c, NEAR_EYE, EYE_Y - 0.4, 2.7, 2.9, '#FBF8F0');
        line(c, [NEAR_EYE - 2.6, EYE_Y - 0.2, NEAR_EYE - 1.4, EYE_Y + 0.2], 0.35, '#DC2626'); line(c, [NEAR_EYE + 2.6, EYE_Y - 0.8, NEAR_EYE + 1.6, EYE_Y - 0.2], 0.35, '#DC2626');
        ell(c, NEAR_EYE + 0.4 + j, EYE_Y - 0.4, 0.55, 0.55, '#0B0B0F');
      }
      return;
    }
    case 'angry': case 'yell': eye(c, FAR_EYE, EYE_Y + 0.3, 1.6, 0.6, 0.3); if (nearOk) eye(c, NEAR_EYE, EYE_Y + 0.3, 1.9, 0.7, 0.3); return;
    default:
      if (blink) { happy(FAR_EYE, 1.4); if (nearOk) happy(NEAR_EYE, 1.7); return; }
      // (little and twinkly, the lids smiling up under them)
      eye(c, FAR_EYE, EYE_Y, 1.5, 0.5, 0.1); if (nearOk) eye(c, NEAR_EYE, EYE_Y, 1.8, 0.6, 0.1);
      line(c, [FAR_EYE - 1.4, EYE_Y + 1.6, FAR_EYE + 1.4, EYE_Y + 1.6], 0.5, SKIN[3]);
      if (nearOk) line(c, [NEAR_EYE - 1.6, EYE_Y + 1.9, NEAR_EYE + 1.6, EYE_Y + 1.9], 0.5, SKIN[3]);
  }
};

const drawBrows = (c: Ctx, face: TuckerFace, f: number) => {
  const by = EYE_Y - 4.2;
  const brow = (x: number, tilt: number, lift: number) => { line(c, [x - 2.4, by - lift + tilt, x + 2.4, by - lift - tilt], 1.4, GINGER[3]); line(c, [x - 2, by - lift + tilt - 0.4, x + 2, by - lift - tilt - 0.4], 0.5, GINGER[1]); };
  switch (face) {
    case 'angry': case 'yell': brow(FAR_EYE, -1.1, -0.6); brow(NEAR_EYE, 1.3, -0.6); return;
    case 'shock': brow(FAR_EYE, 0, 1.6); brow(NEAR_EYE, 0, 1.8); return;
    case 'manic': brow(FAR_EYE, -1.4, -0.8); brow(NEAR_EYE, -0.8, 2.6 + Math.sin(f * 0.9) * 0.4); return;
    case 'daze': case 'out': brow(FAR_EYE, 0.6, 0); brow(NEAR_EYE, -0.6, 0); return;
    case 'ow': brow(FAR_EYE, 0.8, 0.4); brow(NEAR_EYE, -0.8, 0.4); return;
    default: { const lift = face === 'talk' ? Math.max(0, Math.sin(f * 0.21)) * 0.8 : 0.6; brow(FAR_EYE, 0.3, lift); brow(NEAR_EYE, -0.3, lift); }
  }
};

const drawMouth = (c: Ctx, face: TuckerFace, f: number, talking: boolean) => {
  const mx = 5.2, my = 8;
  const S = SKIN;
  const open = (o: number, w: number) => {
    // (open: dark inside, the tongue, his top teeth with the gap in the middle)
    fill(c, '#5A1A14', () => c.ellipse(mx, my + o * 0.4, 3.2 * w, 0.6 + o * 0.7, 0, 0, Math.PI * 2));
    if (o > 1) ell(c, mx + 0.4, my + o * 0.8, 2 * w, 0.8 + o * 0.25, '#D45A5A');
    if (o > 0.6) { px(c, mx - 2.4 * w, my - 0.4, 2 * w, 1.1, '#FBF7EA'); px(c, mx + 0.6 * w, my - 0.4, 2 * w, 1.1, '#FBF7EA'); }
  };
  switch (face) {
    case 'yell': open(4.2 + Math.sin(f * 0.6) * 0.5, 1.15); return;
    case 'manic': {
      if (talking) { const v = viseme(f); open(v.o + 1.2, 1.2); return; }
      // (the clenched grin: every tooth, the gap in the middle, stretched up into the cheeks, a fleck of spit)
      fill(c, '#5A1A14', () => c.roundRect(mx - 4.6, my - 1.2, 9.2, 3.4, 1.2));
      px(c, mx - 4.2, my - 0.9, 8.4, 2.8, '#FBF7EA');
      for (let i = -3; i <= 3; i++) if (i !== 0) px(c, mx + i * 1.2, my - 0.9, 0.35, 2.8, '#B8B0A0');
      px(c, mx - 0.2, my - 0.9, 0.7, 2.8, '#5A1A14');
      px(c, mx - 4.6, my + 0.4, 9.2, 0.4, '#B8B0A0');
      line(c, [mx - 5, my - 2, mx - 4.4, my - 0.4], 0.7, S[3]); line(c, [mx + 5, my - 2.2, mx + 4.4, my - 0.6], 0.7, S[3]);
      if (f % 50 < 20) px(c, mx + 5.4, my + 0.6 + (f % 50) * 0.2, 0.7, 0.7, '#E0F2FE');
      return;
    }
    case 'shock': open(3.4, 0.7); return;
    case 'ow': open(1.6, 1.1); line(c, [mx - 3, my + 1.2, mx + 3, my + 1.2], 0.6, S[4]); return;
    case 'out': fill(c, '#5A1A14', () => c.ellipse(mx, my + 0.6, 2.4, 1.2, 0.2, 0, Math.PI * 2)); ell(c, mx + 1.6, my + 2, 1.2, 1.6, '#D45A5A'); return;
    case 'daze': line(c, [mx - 2.8, my + 0.6, mx, my + 1.6, mx + 2.8, my + 0.2], 0.8, S[4]); return;
    case 'angry': line(c, [mx - 3, my + 1.2, mx, my + 0.2, mx + 3, my + 1.2], 1, S[4]); return;
    default: {
      if (talking || face === 'talk') { const v = viseme(f); open(v.o + 0.6, v.w); return; }
      // (the gap-toothed grin, up into the cheeks)
      fill(c, '#5A1A14', () => { c.moveTo(mx - 3.8, my - 0.6); c.quadraticCurveTo(mx, my + (face === 'cheer' ? 3.6 : 2.6), mx + 3.8, my - 0.8); c.closePath(); });
      px(c, mx - 3, my - 0.5, 2.6, 1, '#FBF7EA'); px(c, mx + 0.4, my - 0.6, 2.6, 1, '#FBF7EA');
      line(c, [mx - 4.2, my - 1, mx - 3.6, my - 0.2], 0.6, S[3]); line(c, [mx + 4.2, my - 1.2, mx + 3.6, my - 0.4], 0.6, S[3]);
    }
  }
};

/** The waxed handlebar: ginger, thick, its ends curled up (they droop when he's out, bristle when he's furious). */
const mustache = (c: Ctx, face: TuckerFace, f: number, talking: boolean) => {
  const twitch = talking ? Math.sin(f * 0.6) * 0.4 : 0;
  const curl = face === 'out' || face === 'daze' ? 2.4 : face === 'manic' ? -2 + Math.sin(f * 0.9) * 0.3 : face === 'yell' || face === 'angry' ? -1.4 : -0.8;
  const my = 5.6 + twitch;
  shape(c, () => {
    c.moveTo(0.6, my - 0.6); c.quadraticCurveTo(3, my - 1.8, 5.4, my - 0.6); c.quadraticCurveTo(7.8, my - 1.8, 10.4, my - 0.4);
    c.quadraticCurveTo(12.6, my + 0.4 + curl * 0.3, 13.4, my - 1.6 + curl); c.quadraticCurveTo(13.8, my - 3 + curl, 12.8, my - 3.2 + curl);
    c.quadraticCurveTo(12.6, my - 1.6 + curl, 11.2, my + 1.4); c.quadraticCurveTo(8, my + 2.4, 5.4, my + 1.4); c.quadraticCurveTo(2.6, my + 2.6, -0.6, my + 1.6);
    c.quadraticCurveTo(-2.6, my + 1 + curl * 0.3, -3.4, my - 1.2 + curl); c.quadraticCurveTo(-3.4, my - 2.6 + curl, -2.4, my - 2.6 + curl); c.quadraticCurveTo(-2.4, my - 1, 0.6, my - 0.6); c.closePath();
  }, GINGER, -3.6, 13.8, 0.7);
  for (let i = 0; i < 7; i++) line(c, [0.8 + i * 1.5, my - 0.2, 0.4 + i * 1.5, my + 1.2], 0.4, GINGER[i % 2 ? 3 : 0]);
  px(c, 5, my - 1, 0.8, 2, GINGER[3]);
};

/** The conductor's cap: a navy drum, the brass band and its CONDUCTOR plate, the patent-leather visor out front. */
const drawCap = (c: Ctx, _f: number) => {
  // (the drum, a little wider at its flat top)
  shape(c, () => { c.moveTo(-10.8, -9.6); c.lineTo(-11.6, -19.6); c.quadraticCurveTo(0, -21.6, 11.8, -19.8); c.lineTo(11, -9.6); c.quadraticCurveTo(0, -8.2, -10.8, -9.6); c.closePath(); }, COAT, -11.6, 11.8, 0.9);
  // (its flat top's lit rim)
  line(c, [-11.2, -19.6, 0, -21.2, 11.4, -19.8], 0.8, COAT[0]);
  // (the brass band round it, and the plate on the front: CONDUCTOR in dots)
  shape(c, () => { c.moveTo(-11, -12.6); c.quadraticCurveTo(0, -11.2, 11.2, -12.6); c.lineTo(11.1, -10.4); c.quadraticCurveTo(0, -9, -10.9, -10.4); c.closePath(); }, BRASS, -11, 11.2, 0.5);
  shape(c, () => c.roundRect(-1, -17.6, 9.4, 4, 0.8), BRASS, -1, 8.4, 0.5);
  for (let i = 0; i < 9; i++) px(c, -0.2 + i * 0.95, -16.2, 0.55, 1.2, BRASS[4]);
  // (a brass button either side where the chin strap's fixed, the cord across the front)
  button(c, -9.4, -11.6, 0.8); button(c, 10.4, -11.6, 0.8);
  line(c, [-9.4, -11.2, 0, -10.2, 10.4, -11.2], 0.5, BRASS[3]);
  // (the visor: black patent, out over his brow, a hard white shine along it)
  shape(c, () => { c.moveTo(1, -10); c.quadraticCurveTo(8, -10.8, 15.4, -8.4); c.quadraticCurveTo(14.6, -6.4, 9, -6.8); c.quadraticCurveTo(4, -7.4, 1, -8.4); c.closePath(); }, PATENT, 1, 15.4, 0.6);
  line(c, [4, -9.2, 9, -9.4, 13.6, -8.4], 0.6, '#C8C8D2');
};

// ---------------------------------------------------------------------------------------------------------------
// His wounds (they stack): each job that mutilates him draws its own here (the eye, the saw, the grime, the branch).

/**
 * What's been done to him, drawn on the figure: `layer` 'body' (the branch through his chest: over the coat) or 'head'
 * (the eye hole through his spectacles and out the back; the buzzsaw stuck in his forehead, over the cap's line). The
 * train's job draws `eye`, the log ride's `saw`, the catch-up's `branch`. Until then: nothing.
 */
const drawWounds = (c: Ctx, w: TuckerWounds, layer: 'body' | 'head', f: number, capless = false, onBranch = false) => {
  if (!w.eye && !w.saw && !w.branch && !w.grime && !w.split && !w.clawed && !w.bloody) return;
  const sd = splitOf(w);
  // (the train's job: the near eye shot clean through: an empty socket, the lens starred, blood down his cheek)
  if (w.eye && layer === 'head') {
    // (the socket: a ragged ring of meat, and clean through the hole, light from the far side of his head)
    ell(c, NEAR_EYE, EYE_Y, 2.7, 2.5, '#4A0A0A');
    ell(c, NEAR_EYE, EYE_Y, 2.1, 1.9, '#7A1212');
    ell(c, NEAR_EYE + 0.2, EYE_Y + 0.1, 1.3, 1.15, '#1A0303');
    ell(c, NEAR_EYE + 0.25, EYE_Y + 0.1, 0.75, 0.65, '#BFE0F8');
    px(c, NEAR_EYE - 1.6, EYE_Y - 1.2, 0.8, 0.6, '#B02A2A');
    // (the lens starred round the hole)
    c.globalAlpha = 0.8;
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.4; line(c, [NEAR_EYE + Math.cos(a) * 1.4, EYE_Y + Math.sin(a) * 1.3, NEAR_EYE + Math.cos(a) * 2.9, EYE_Y + Math.sin(a) * 2.7], 0.22, '#E8F0F8'); }
    c.globalAlpha = 1;
    // (the blood run down his cheek and over the chop, dried dark, a fresh drip now and then)
    line(c, [NEAR_EYE - 0.5, EYE_Y + 2, NEAR_EYE - 0.8, EYE_Y + 5.5, NEAR_EYE - 0.2, EYE_Y + 10], 1.1, '#7A1212');
    line(c, [NEAR_EYE - 0.3, EYE_Y + 2.2, NEAR_EYE - 0.6, EYE_Y + 5.5, NEAR_EYE, EYE_Y + 9.6], 0.35, '#C83232');
    line(c, [NEAR_EYE + 1.2, EYE_Y + 2.2, NEAR_EYE + 1.6, EYE_Y + 6.4], 0.7, '#7A1212');
    const d = (f % 90) / 90;
    if (d < 0.6) ell(c, NEAR_EYE, EYE_Y + 10.4 + d * 4, 0.45, 0.65, '#991B1B');
    // (the way out: a ragged hole at the back of his head, blood matted round it)
    ell(c, -10.4, -3.4, 1.5, 2, '#4A0A0A'); ell(c, -10.6, -3.4, 0.8, 1.2, '#1A0303');
    line(c, [-10.6, -1.6, -10.9, 1.8], 0.7, '#7A1212');
  }
  // (the log ride's job: the buzzsaw buried in his forehead, the cap split round it, his splitting headache)
  // (split, the saw's the split's: drawGap draws it driven down in the gap)
  if (w.saw && layer === 'head' && sd <= 0) {
    // (the slot down through the cap's crown (or, the cap off, his scalp) into his forehead: meat, bone at its lips)
    const top = capless ? -13.6 : -21.4;
    fill(c, '#4A0A0A', () => { c.moveTo(1.2, top); c.lineTo(7.4, top + 0.8); c.lineTo(5.6, -8); c.lineTo(3.2, -8.4); c.closePath(); });
    fill(c, '#8A1414', () => { c.moveTo(2, top + 0.4); c.lineTo(6.6, top + 1); c.lineTo(5, -9); c.lineTo(3.6, -9.2); c.closePath(); });
    line(c, [1.4, top + 0.2, 3.2, -8.6], 0.35, '#F5F0E6'); line(c, [7.2, top + 0.8, 5.6, -8.2], 0.35, '#F5F0E6');
    ell(c, 4.4, (top - 8) / 2, 0.8, Math.max(1, (-8 - top) * 0.3), '#F2A8B0');
    // (the blade: what's out of him, above the cap's crown (his scalp) and out in front of his brow; stopped, a tooth gone)
    c.save();
    c.beginPath(); c.rect(-20, -40, 40, top + 41.4 - 1.4); c.rect(capless ? 9.8 : 11.6, top + 0.4, 20, -9 - top); c.clip();
    const R = 10, sx = 4.4, sy = -17;
    ell(c, sx, sy, R + 1.4, R + 1.4, STEEL[4]);
    fill(c, STEEL[2], () => { for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2 + 0.2, rr = i % 2 ? R - 0.4 : R + 1.1; c.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } c.closePath(); });
    ell(c, sx, sy, R * 0.8, R * 0.8, STEEL[3]);
    fill(c, STEEL[1], () => { c.moveTo(sx, sy); c.arc(sx, sy, R * 0.75, -2.4, -1.9); c.closePath(); });
    ell(c, sx, sy, 2.4, 2.4, BRASS[2]); ell(c, sx, sy, 1, 1, STEEL[4]);
    // (blood dried on its teeth)
    for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.5; ell(c, sx + Math.cos(a) * R * 0.9, sy + Math.sin(a) * R * 0.9, 0.8, 0.6, '#7A1212'); }
    c.restore();
    // (the hanger's arm, snapped off short, up out of it)
    line(c, [sx, sy, sx - 1.4, sy - 13], 1.4, STEEL[4]); line(c, [sx, sy, sx - 1.4, sy - 13], 0.7, STEEL[2]);
    // (the blood down his brow from under the visor, over the spectacles, off his jaw; a fresh drip now and then)
    line(c, [5.6, -8, 6, -4, 5.2, 2, 5.6, 9], 1, '#7A1212'); line(c, [5.7, -8, 6.1, -4, 5.3, 2, 5.7, 9], 0.35, '#C83232');
    line(c, [3.4, -8.2, 2.6, -3, 1.6, 2], 0.8, '#7A1212');
    const d = ((f + 45) % 80) / 80;
    if (d < 0.6) ell(c, 5.6, 9.6 + d * 4, 0.45, 0.65, '#991B1B');
  }
  // (the woods' job: EXTRA BLOODIED. Wherever he's been since the booth (never said): the sewer's muck smeared up his
  // trousers' line and his coat, the chipper's wood chips stuck all over him, fresh blood splashed down his front, the
  // near shoulder torn open, leaves off the pile in his chops and on his cap)
  if (w.grime) drawGrime(c, layer, f, capless);
  // (the arena entry's job: the split. On each half (drawn sheared apart): the blood sheeting down from the cut over his
  // brow, either side of his nose, off his jaw; the far eye's socket empty, its blood run down the cheek)
  if (sd > 0 && layer === 'head') {
    const x = SPLIT.x, run = Math.min(1, sd * 1.6);
    line(c, [x - 0.6, -10, x - 1.2, -6, x - 1.6, -6 + 9 * run, x - 2.6, -6 + 16 * run], 1.3, '#7A0E0E');
    line(c, [x - 0.5, -10, x - 1.1, -6, x - 1.5, -6 + 8 * run], 0.45, '#C42A2A');
    line(c, [x + 0.8, -10, x + 1.4, -5, x + 1.2, -5 + 7 * run, x + 2.2, -5 + 13 * run], 1.1, '#7A0E0E');
    line(c, [x - 3, -12, x - 3.6, -9, x - 3.2, -9 + 6 * run], 0.7, '#7A0E0E');
    if (sd >= SPLIT_EYES_AT) {
      ell(c, FAR_EYE, EYE_Y, 2.5, 2.3, '#4A0A0A'); ell(c, FAR_EYE, EYE_Y, 1.9, 1.7, '#7A1212'); ell(c, FAR_EYE + 0.1, EYE_Y + 0.1, 1.15, 1.05, '#1A0303');
      px(c, FAR_EYE - 0.3, EYE_Y + 0.2, 0.7, 0.5, '#E89AA6');
      line(c, [FAR_EYE - 0.4, EYE_Y + 2, FAR_EYE - 0.9, EYE_Y + 6, FAR_EYE - 0.3, EYE_Y + 11], 1.2, '#7A1212');
      line(c, [FAR_EYE - 0.2, EYE_Y + 2.2, FAR_EYE - 0.7, EYE_Y + 6, FAR_EYE - 0.1, EYE_Y + 10], 0.4, '#C83232');
      const dd = ((f + 31) % 70) / 70;
      if (dd < 0.6) ell(c, FAR_EYE - 0.3, EYE_Y + 11.4 + dd * 4, 0.45, 0.65, '#991B1B');
    }
  }
  // (...and down his front, off his chin onto his collar and shirt)
  if (sd >= 1 && layer === 'body') {
    line(c, [2.2, -63, 1.8, -58, 2.6, -52, 2, -46], 1.8, '#7A0E0E'); line(c, [2.4, -63, 2, -58, 2.8, -52], 0.5, '#C42A2A');
    ell(c, 4.6, -61.6, 2, 1.2, '#7A0E0E');
  }
  // (the catch-up's job: the giant branch through his chest, out the back of his coat, a twig and its leaves still on
  // it; over the grime)
  if (w.branch && layer === 'body') drawBranchWound(c, f, onBranch);
  // (...and the blood he's coughed up since, out of the corner of his mouth and off his chin)
  if (w.branch && layer === 'head') {
    line(c, [8.8, 8.4, 9.2, 10.6, 8.6, 13.4], 0.9, '#7A0E0E'); line(c, [8.9, 8.6, 9.3, 10.6], 0.3, '#C42A2A');
    const d = ((f + 13) % 64) / 64;
    if (d < 0.6) ell(c, 8.6, 13.8 + d * 5, 0.4, 0.6, '#991B1B');
  }
  drawFightWounds(c, w, layer, f);
};

/** (his fight's) The mountain lions' rakes, a set more for each mauling: three torn parallel gashes (the cloth ripped,
 *  the meat red under it, blood run down from them) across his vest and coat, his trousers, and his face; and the soul
 *  sucker's blood sheeted all over him (the scent the cats come for). */
const RAKES_BODY: [number, number, number][] = [[-8, -56, 0.9], [6, -44, -0.7], [-6, -36, 0.6], [10, -58, -1.1], [-2, -22, 0.4]];
const RAKES_HEAD: [number, number, number][] = [[-5, 4, 0.8], [7, 6, -0.6], [0, -8, 0.3], [-7, -6, -0.9], [3, 9, 1.2]];
const drawFightWounds = (c: Ctx, w: TuckerWounds, layer: 'body' | 'head', f: number) => {
  const n = Math.min(5, Math.floor(w.clawed ?? 0));
  const rakes = layer === 'body' ? RAKES_BODY : RAKES_HEAD, s = layer === 'body' ? 1 : 0.55;
  for (let i = 0; i < n; i++) {
    const [x, y, a] = rakes[i];
    c.save(); c.translate(x, y); c.rotate(a);
    for (let k = -1; k <= 1; k++) {
      const yy = k * 2.2 * s;
      line(c, [-5 * s, yy - 0.4, 5 * s, yy + 0.6], 1.5 * s, '#4A0A0A');
      line(c, [-4.6 * s, yy - 0.3, 4.6 * s, yy + 0.5], 0.8 * s, '#B91C1C');
      line(c, [-3 * s, yy - 0.1, 2 * s, yy + 0.3], 0.3 * s, '#F4A0A0');
    }
    c.restore();
    // (the blood run down from it)
    line(c, [x, y + 2 * s, x + 0.4, y + 6 * s + ((f + i * 17) % 40) / 40 * 2 * s], 0.7 * s, '#7A0E0E');
  }
  const b = Math.max(0, Math.min(1, w.bloody ?? 0));
  if (b > 0) {
    c.globalAlpha = 0.75 * b;
    if (layer === 'body') {
      ell(c, 2, -50, 13, 10, '#8A1010'); ell(c, -4, -38, 9, 7, '#7A0E0E'); ell(c, 8, -32, 6, 5, '#991B1B');
      line(c, [-10, -42, -10.6, -28], 2, '#7A0E0E'); line(c, [12, -40, 12.6, -24], 1.8, '#7A0E0E'); line(c, [-2, -28, -2.4, -12], 1.6, '#8A1010');
      for (const [x, y] of [[-4, -20], [5, -14], [-6, -8]] as const) ell(c, x, y, 1.6, 1.2, '#991B1B');
    } else {
      ell(c, 1, -10, 11, 5, '#8A1010'); ell(c, -4, 2, 5, 4, '#7A0E0E'); ell(c, 7, 4, 4, 3, '#991B1B');
      line(c, [-8, -4, -8.4, 8], 1.4, '#7A0E0E'); line(c, [9, -6, 9.4, 6], 1.2, '#7A0E0E');
    }
    c.globalAlpha = 1;
    // (dripping off him)
    const dd = ((f * 1.3) % 30) / 30;
    if (layer === 'body') { ell(c, -9, -24 + dd * 18, 0.7, 1, '#991B1B'); ell(c, 11, -20 + ((dd + 0.5) % 1) * 16, 0.7, 1, '#991B1B'); }
  }
};

/**
 * The split's gap, over both halves of his head (drawHead draws them sheared apart), `d` 0..1 how far it's driven: a V
 * from his crown (through the cap) down to the top of his nose, raw meat down in it, the skull's bone white at its lips
 * and his brains bulging at them; the buzzsaw driven down in it (its hub from his forehead to between his eyes), seen in
 * the gap, out in front of his brow, and its snapped hanger up out of the top; the blood welling at the V's foot and
 * running off down his nose.
 */
const drawSplitGap = (c: Ctx, d: number, f: number, capless: boolean, drip = true) => {
  const s = SPLIT.shear * d, { x: cx, py } = SPLIT;
  const g = (y: number) => s * (py - y);
  const top = capless ? -13.9 : -21.8;
  const yb = lerp(-8.4, py, Math.min(1, d * 1.3));
  const TL = [cx - 2.2 - g(top), top - 0.3] as const, TR = [cx + 2.6 + g(top), top - 0.3] as const, B = [cx + 0.3, yb] as const;
  const L = (t: number): [number, number] => [lerp(TL[0], B[0], t), lerp(TL[1], B[1], t)];
  const Rt = (t: number): [number, number] => [lerp(TR[0], B[0], t), lerp(TR[1], B[1], t)];
  const gap = () => { c.moveTo(TL[0], TL[1]); c.lineTo(TR[0], TR[1]); c.lineTo(B[0], B[1]); c.closePath(); };
  // ---- the gap: raw meat down in it, wet
  fill(c, '#3A0606', gap);
  fill(c, '#7A1212', () => { const a = L(0.06), b = Rt(0.06); c.moveTo(a[0] + 0.6, a[1]); c.lineTo(b[0] - 0.6, b[1]); c.lineTo(B[0], B[1] - 1.2); c.closePath(); });
  // ---- the saw, driven down in it: seen in the gap, above his head, out in front of his brow (stopped, a tooth gone)
  const sx = cx + 0.2, sy = sawHubY(d), R = 10;
  c.save();
  c.beginPath();
  c.rect(-40, -60, 80, 60 + top);
  gap();
  const fy = -10, fx = (y: number) => (capless ? 9.8 : 11.6) + g(y);
  c.moveTo(fx(top), top); c.lineTo(40, top); c.lineTo(40, fy); c.lineTo(fx(fy), fy); c.closePath();
  c.clip();
  ell(c, sx, sy, R + 1.4, R + 1.4, STEEL[4]);
  fill(c, STEEL[2], () => { for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2 + 0.2, rr = i % 2 ? R - 0.4 : R + 1.1; c.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } c.closePath(); });
  ell(c, sx, sy, R * 0.8, R * 0.8, STEEL[3]);
  fill(c, STEEL[1], () => { c.moveTo(sx, sy); c.arc(sx, sy, R * 0.75, -2.4, -1.9); c.closePath(); });
  ell(c, sx, sy, 2.4, 2.4, BRASS[2]); ell(c, sx, sy, 1, 1, STEEL[4]);
  // (blood on its teeth, and smeared over the part that's been down through him: more the further it's gone)
  for (let i = 0; i < 9; i++) { const a = -2.8 + i * 0.7; ell(c, sx + Math.cos(a) * R * 0.88, sy + Math.sin(a) * R * 0.88, 0.9, 0.7, i % 2 ? '#7A1212' : '#B91C1C'); }
  c.globalAlpha = 0.6 * d; ell(c, sx, sy + R * 0.55, R * 0.75, R * 0.4, '#7A1212'); c.globalAlpha = 1;
  px(c, sx - 4, sy + R * 0.3, 8, 0.5, '#C42A2A');
  c.restore();
  // (the hanger's arm, snapped off short, up out of the top of him)
  line(c, [sx, sy, sx - 1.4, sy - 13], 1.4, STEEL[4]); line(c, [sx, sy, sx - 1.4, sy - 13], 0.7, STEEL[2]);
  // ---- the lips of it: the skull's bone, white and chipped, down to his brow; his brains bulging out at them; the meat
  // of his face below that
  const tS = Math.max(0, Math.min(1, (-8 - TL[1]) / (B[1] - TL[1] || 1)));
  const [l1x, l1y] = L(tS), [r1x, r1y] = Rt(tS);
  line(c, [TL[0], TL[1], l1x, l1y], 0.6, '#F5F0E6'); line(c, [TR[0], TR[1], r1x, r1y], 0.6, '#F5F0E6');
  for (let i = 0; i < 4; i++) { const t = tS * (0.15 + i * 0.22), [lx, ly] = L(t), [rx, ry] = Rt(t); px(c, lx - 0.1, ly, 0.7, 0.5, '#E8E0D0'); px(c, rx - 0.6, ry, 0.7, 0.5, '#E8E0D0'); }
  if (d > 0.3) {
    for (const t of [0.14, 0.34, 0.56]) {
      const tt = t * tS, [lx, ly] = L(tt), [rx, ry] = Rt(tt), q = Math.min(1, (d - 0.3) * 2);
      ell(c, lx + 0.7, ly + 0.4, 0.9 * q, 1.3 * q, '#E8A0A8'); ell(c, lx + 0.6, ly, 0.4 * q, 0.6 * q, '#F8C8D0');
      ell(c, rx - 0.7, ry + 0.6, 0.8 * q, 1.2 * q, '#E8A0A8'); line(c, [rx - 1, ry, rx - 0.4, ry + 0.8], 0.25, '#B86070');
    }
  }
  line(c, [l1x, l1y, B[0], B[1]], 0.5, '#4A0A0A'); line(c, [r1x, r1y, B[0], B[1]], 0.5, '#4A0A0A');
  // ---- the blood welling up at the foot of it and running off down his nose, dripping off the tip
  ell(c, B[0], B[1] + 0.2, 1 + d * 0.6, 0.6, '#B91C1C');
  if (d > 0.5) {
    line(c, [B[0], B[1], B[0] + 1.2, 1.4, 6.2, 3.6], 0.8, '#7A0E0E'); line(c, [B[0] + 0.2, B[1], B[0] + 1.3, 1.4], 0.3, '#C42A2A');
    const dd = ((f + 7) % 46) / 46;
    if (drip && dd < 0.65) ell(c, 6.4, 4.8 + dd * 6, 0.45, 0.7, '#991B1B');
  }
};

/** Bark: light, base, shade, deep, line (a real tree's: gray-brown, the furrows dark). */
const BARK: Ramp = ['#A8865A', '#7A5634', '#5A3C20', '#3E2812', '#1E1208'];
/**
 * A length of tree branch from xa to xb (xa < xb) along the line `ly(x)`, `r(x)` its half thickness (a taper to a
 * point where r gets to 0): bark in stepped bands, lit along its top, its furrows; `bloodTo` coats it red from xa up to
 * there (the part that's been through somebody); `jag` splinters its xb end (snapped off). Any units (the figure's,
 * the close-up's head units, the world's); `step` the bands' width in them.
 */
export const drawBough = (c: Ctx, xa: number, xb: number, ly: (x: number) => number, r: (x: number) => number, opts: { bloodTo?: number; jag?: boolean; step?: number; seed?: number } = {}) => {
  const st = opts.step ?? 0.5, seed = opts.seed ?? 0;
  const path = () => {
    c.moveTo(xa, ly(xa) - r(xa));
    for (let x = xa; x < xb; x += st) c.lineTo(x, ly(x) - r(x));
    c.lineTo(xb, ly(xb) - r(xb));
    if (opts.jag) {
      // (the snapped end: splinters out past it, top to bottom)
      const rr = r(xb), y = ly(xb);
      c.lineTo(xb + rr * 0.7, y - rr * 0.6); c.lineTo(xb + rr * 0.15, y - rr * 0.2); c.lineTo(xb + rr * 0.9, y + rr * 0.15);
      c.lineTo(xb + rr * 0.2, y + rr * 0.45); c.lineTo(xb + rr * 0.5, y + rr * 0.85);
    }
    c.lineTo(xb, ly(xb) + r(xb));
    for (let x = xb; x > xa; x -= st) c.lineTo(x, ly(x) + r(x));
    c.lineTo(xa, ly(xa) + r(xa)); c.closePath();
  };
  c.beginPath(); path(); c.fillStyle = BARK[1]; c.fill();
  c.save(); c.clip();
  for (let x = Math.floor(xa / st) * st; x <= xb + 2 * r(xb); x += st) {
    const xx = Math.min(x, xb), y = ly(xx), rr = Math.max(0.2, r(xx)), k = Math.round(x / st);
    // (stepped bands: lit along the top, a dithered seam, the shade and the deep along the bottom)
    px(c, x, y - rr - 1, st * 1.05, rr * 0.5 + 1, BARK[0]);
    if (k % 2 === 0) px(c, x, y - rr * 0.5, st * 1.05, rr * 0.12, BARK[0]);
    px(c, x, y + rr * 0.28, st * 1.05, rr * 0.45, BARK[2]);
    if (k % 2 === 1) px(c, x, y + rr * 0.18, st * 1.05, rr * 0.12, BARK[2]);
    px(c, x, y + rr * 0.66, st * 1.05, rr * 0.5, BARK[3]);
    // (the furrows: short dark runs along it)
    const h = Math.sin((k + seed) * 91.7) * 43758.5453, n = h - Math.floor(h);
    if (n < 0.3) px(c, x, y - rr * 0.35 + n * rr * 2.2, st * 3, Math.max(0.25, rr * 0.1), BARK[3]);
    else if (n > 0.9) px(c, x, y - rr * 0.7, st * 2, Math.max(0.2, rr * 0.08), BARK[0]);
  }
  // (a knot)
  const kx = xa + (xb - xa) * 0.62, kr = r(kx) * 0.38;
  if (kr > 0.3) { ell(c, kx, ly(kx) - r(kx) * 0.1, kr * 1.3, kr, BARK[4]); ell(c, kx - kr * 0.2, ly(kx) - r(kx) * 0.15, kr * 0.8, kr * 0.55, BARK[3]); }
  if (opts.jag) {
    // (the raw wood at the break: pale, splintered)
    const rr = r(xb), y = ly(xb);
    fill(c, '#D8B886', () => { c.moveTo(xb - rr * 0.3, y - rr); c.lineTo(xb + rr * 0.7, y - rr * 0.6); c.lineTo(xb + rr * 0.15, y - rr * 0.2); c.lineTo(xb + rr * 0.9, y + rr * 0.15); c.lineTo(xb + rr * 0.2, y + rr * 0.45); c.lineTo(xb + rr * 0.5, y + rr * 0.85); c.lineTo(xb - rr * 0.3, y + rr); c.closePath(); });
    line(c, [xb - rr * 0.2, y - rr * 0.3, xb + rr * 0.5, y - rr * 0.4], Math.max(0.2, rr * 0.08), '#A88A5A');
    line(c, [xb - rr * 0.2, y + rr * 0.3, xb + rr * 0.6, y + rr * 0.5], Math.max(0.2, rr * 0.08), '#A88A5A');
  }
  if (opts.bloodTo !== undefined && opts.bloodTo > xa) {
    // (the blood on it: dark, wet, a lit streak along the top, runs off the bottom)
    const bt = Math.min(xb + 2 * r(xb), opts.bloodTo);
    c.globalAlpha = 0.88; px(c, xa - 1, -9999, bt - xa + 1, 19998, '#7A0E0E'); c.globalAlpha = 1;
    for (let x = xa; x < bt; x += st * 2) { const rr = r(x); px(c, x, ly(x) - rr * 0.7, st * 2, Math.max(0.2, rr * 0.18), '#C42A2A'); }
  }
  c.restore();
  c.beginPath(); path(); c.strokeStyle = BARK[4]; c.lineWidth = Math.max(0.4, r((xa + xb) / 2) * 0.12); c.lineJoin = 'round'; c.stroke();
};

/** The branch's line through him on the figure: in at the front of his chest (14, -50), out his back, sloped a touch. */
const BR = { x: 14, y: -50, dy: 0.12 };
const brY = (x: number) => BR.y + (x - BR.x) * BR.dy;
/** Its half thickness: a point out behind him, thick as his arm and more at the front. */
const brR = (x: number) => Math.max(0, Math.min(5, 0.3 + (x + 34) * 0.1));

/** On the figure: the giant branch through his chest (the catch-up's). */
const drawBranchWound = (c: Ctx, f: number, onBranch: boolean) => {
  const BLOOD = '#7A0E0E', BLOOD_L = '#C42A2A', MEAT = '#4A0A0A';
  // ---- the hole out his back: the coat torn open round it, blood down the back of it
  ell(c, -13, brY(-13), 3.2, 3.8, MEAT); ell(c, -13, brY(-13), 2.4, 3, '#8A1414');
  line(c, [-13.6, brY(-13) + 3, -14.6, -44, -14.2, -36, -15, -29], 1.2, BLOOD);
  fill(c, COAT[3], () => { c.moveTo(-14.6, brY(-13) - 3.6); c.lineTo(-18, brY(-13) - 5.4); c.lineTo(-15.6, brY(-13) - 1.2); c.closePath(); });
  // ---- the point out behind him: all of it red, dripping
  drawBough(c, -34, -12.6, brY, brR, { bloodTo: -12.6, step: 0.5, seed: 3 });
  const d = (f % 54) / 54;
  if (d < 0.7) ell(c, -32 + 0.4, brY(-32) + 1 + d * 9, 0.45, 0.7, '#991B1B');
  // ---- the hole in his chest: the vest torn open round it in a ragged star, the shirt red, the blood pumped down
  // his front to the belt and over it
  fill(c, VEST[3], () => { for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, rr = i % 2 ? 6.4 : 8.6; c.lineTo(BR.x + Math.cos(a) * rr * 0.8, BR.y + Math.sin(a) * rr); } c.closePath(); });
  ell(c, BR.x, BR.y, 6, 6.4, MEAT); ell(c, BR.x - 0.4, BR.y + 0.4, 5.2, 5.6, '#8A1414');
  line(c, [12.4, -44, 11.4, -38, 12.6, -32, 11.8, -26], 2.6, BLOOD); line(c, [12.8, -44, 11.8, -38, 13, -32], 0.8, BLOOD_L);
  line(c, [15.6, -45, 16, -38, 15.2, -31], 1.6, BLOOD);
  ell(c, 12.4, -25.6, 2.4, 1.2, BLOOD);
  const d2 = ((f + 27) % 70) / 70;
  if (d2 < 0.6) ell(c, 11.8, -25 + d2 * 7, 0.5, 0.75, '#991B1B');
  // ---- the front of it: snapped off the tree (a twig and its leaves still on it), or on the tree still (the caller
  // draws the branch on to the trunk)
  if (!onBranch) {
    drawBough(c, BR.x - 5, 31, brY, brR, { bloodTo: BR.x + 3, jag: true, step: 0.5, seed: 11 });
    // (the twig, up off it, and its leaves: turning)
    line(c, [24, brY(24) - 4, 26.6, brY(24) - 10, 29.4, brY(24) - 13], 1.1, BARK[4]); line(c, [24, brY(24) - 4, 26.6, brY(24) - 10, 29.4, brY(24) - 13], 0.6, BARK[1]);
    for (const [lx, ly, rot, col] of [[27, brY(24) - 11.6, -0.6, '#D97706'], [30, brY(24) - 14, 0.4, '#B45309'], [25.4, brY(24) - 8.4, -1.4, '#CA8A04']] as const) {
      c.save(); c.translate(lx, ly); c.rotate(rot); ell(c, 0, 0, 2.4, 1.1, '#6E2A08'); ell(c, -0.2, -0.1, 2, 0.8, col); line(c, [-2.2, 0, 2, 0], 0.3, '#6E2A08'); c.restore();
    }
  }
};

/** The woods' extra-bloodied look, on the figure (`layer` as drawWounds). */
const drawGrime = (c: Ctx, layer: 'body' | 'head', f: number, capless: boolean) => {
  const MUCK = '#4A4A26', MUCK_D = '#2E2E16', CHIP = '#D6A060', CHIP_D = '#8A6030', BLOOD = '#8A1414', BLOOD_L = '#C42A2A', LEAF = '#D9741E', LEAF_D = '#8A3A10';
  const chip = (x: number, y: number, r: number) => { c.save(); c.translate(x, y); c.rotate(r); px(c, -1.1, -0.5, 2.2, 1, CHIP_D); px(c, -0.9, -0.4, 1.8, 0.6, CHIP); c.restore(); };
  const leaf = (x: number, y: number, r: number, s = 1) => { c.save(); c.translate(x, y); c.rotate(r); c.scale(s, s); ell(c, 0, 0, 2.2, 1.1, LEAF_D); ell(c, -0.1, -0.1, 1.8, 0.8, LEAF); line(c, [-2.2, 0, 2, 0], 0.3, LEAF_D); c.restore(); };
  if (layer === 'body') {
    // (the sewer's muck: up the coat fronts' hems and across the vest's belly, in ragged smears)
    fill(c, MUCK_D, () => { c.moveTo(-15, -30); c.quadraticCurveTo(-12, -36, -9, -31); c.lineTo(-9.6, -24); c.lineTo(-14.6, -24); c.closePath(); });
    fill(c, MUCK, () => { c.moveTo(-14.6, -29); c.quadraticCurveTo(-12, -34, -9.6, -30); c.lineTo(-10, -25); c.lineTo(-14, -25); c.closePath(); });
    fill(c, MUCK_D, () => { c.moveTo(12.4, -24); c.lineTo(16.6, -24); c.lineTo(16.8, -33); c.quadraticCurveTo(14, -29, 12.6, -31); c.closePath(); });
    fill(c, MUCK, () => { c.moveTo(13, -25); c.lineTo(16, -25); c.lineTo(16.2, -31); c.quadraticCurveTo(14, -28, 13.2, -30); c.closePath(); });
    ell(c, -3, -36, 5, 1.6, MUCK_D, 0.15); ell(c, -2.6, -36.3, 4, 1, MUCK, 0.15);
    // (fresh blood: down the shirt front and the vest from the collar, splashed across the near lapel, spattered)
    line(c, [0.6, -58, 0.2, -52, 1.4, -46, 0.8, -40], 1.6, BLOOD); line(c, [0.8, -58, 0.4, -52, 1.6, -46, 1, -41], 0.5, BLOOD_L);
    fill(c, BLOOD, () => { c.moveTo(7, -60); c.lineTo(12, -57); c.lineTo(10, -52); c.lineTo(8.4, -55); c.closePath(); });
    for (const [x, y, r] of [[-7, -50, 1], [5, -44, 0.8], [11, -46, 1.1], [-10, -42, 0.7], [3, -36, 0.9], [14, -38, 0.6]] as const) { ell(c, x, y, r, r * 0.8, BLOOD); px(c, x - r * 0.3, y - r * 0.4, 0.5, 0.5, BLOOD_L); }
    // (the near shoulder torn open: a flap of the coat hanging, the shirt and a scrape showing)
    fill(c, SHIRT[2], () => { c.moveTo(12, -60); c.lineTo(16.4, -58); c.lineTo(15.6, -53); c.lineTo(12.6, -55); c.closePath(); });
    line(c, [13, -58, 15, -55], 0.8, BLOOD);
    fill(c, COAT[3], () => { c.moveTo(15.6, -57); c.lineTo(18.6, -53); c.lineTo(16.4, -50); c.closePath(); });
    // (the chipper's chips, stuck all over the coat)
    for (let i = 0; i < 9; i++) chip(-13 + ((i * 7.3) % 29), -58 + ((i * 11.7) % 32), i * 0.9);
    // (a drip off the hem now and then)
    const d = ((f + 20) % 70) / 70;
    if (d < 0.5) ell(c, -12, -23 + d * 6, 0.45, 0.65, '#991B1B');
  } else {
    // (blood fresh across his near cheek and up his brow; a smear of muck across his forehead)
    for (const [x, y, r] of [[8.6, 4.6, 0.9], [9.8, 2.2, 0.6], [2.4, 6, 0.5], [-4.8, 2.6, 0.7], [-2, -6.4, 0.6]] as const) ell(c, x, y, r, r * 0.8, BLOOD);
    line(c, [9.4, -2, 10, 3, 9.2, 8], 0.7, BLOOD);
    if (!capless) { ell(c, -4, -7.6, 3.6, 0.9, MUCK, 0.1); ell(c, -4.4, -7.8, 2.4, 0.5, MUCK_D, 0.1); }
    // (chips in his muttonchops and his mustache)
    chip(-5.4, -2, 0.4); chip(-4.6, 4, -0.6); chip(11, 1, 1.1); chip(9, 6.4, 0.2);
    // (leaves off the pile: one on his cap (or his scalp), one caught in his far chop, one in his collar)
    leaf(capless ? -4 : -6, capless ? -13 : -20.6, -0.4, 1.1);
    leaf(-7.4, 6.4, 0.9, 0.8);
    leaf(10.6, 11.6, -0.3, 0.9);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The close-up (the mutilation rule's picture, and any scene's punch-in on his face)

/** The branch on the close-up (head units): its line in at the vest (6, 30), sloped up toward the point behind him. */
export const CLOSE_BRANCH = { x: 6, y: 30, dy: 0.18, exit: -21.5 };
/** Where its point ends up behind him once it's all the way through (the painter slides it there). */
export const CLOSE_BRANCH_TIP = -40;
export const closeBranchY = (x: number) => CLOSE_BRANCH.y + (x - CLOSE_BRANCH.x) * CLOSE_BRANCH.dy;
/** Its half thickness, by how far along from its point. */
export const closeBranchR = (tip: number) => (x: number) => Math.max(0, Math.min(7, 0.3 + (x - tip) * 0.1));

/**
 * The branch through his chest on the close-up, its point at `tip` (head units; through him once it's past
 * CLOSE_BRANCH.exit): the part out behind his far shoulder, the hole in his vest, the part out in front (snapped off a
 * way out when `snapped`, else on out of the frame). The mutilation close-up's painter (the catch-up's) draws its frames
 * with this; the stacked wound draws its last.
 */
export const drawCloseupBranch = (c: Ctx, f: number, tip: number, snapped: boolean, opts: { open?: number } = {}) => {
  const B = CLOSE_BRANCH, r = closeBranchR(tip), open = opts.open ?? 1;
  const through = tip < B.exit;
  // ---- out behind his far shoulder: the coat burst open round it, the point all red
  if (through) {
    ell(c, B.exit, closeBranchY(B.exit), r(B.exit) + 1.6, r(B.exit) + 2, '#4A0A0A');
    drawBough(c, tip, B.exit + 0.5, closeBranchY, r, { bloodTo: B.exit + 0.5, step: 0.5, seed: 5 });
    fill(c, COAT[2], () => { const y = closeBranchY(B.exit); c.moveTo(B.exit + 0.6, y - r(B.exit) - 2.4); c.lineTo(B.exit - 3.4, y - r(B.exit) - 3.6); c.lineTo(B.exit - 0.6, y - r(B.exit) - 0.6); c.closePath(); });
    fill(c, COAT[3], () => { const y = closeBranchY(B.exit); c.moveTo(B.exit + 0.6, y + r(B.exit) + 2); c.lineTo(B.exit - 2.6, y + r(B.exit) + 4); c.lineTo(B.exit - 0.4, y + r(B.exit) + 0.6); c.closePath(); });
    const d = (f % 50) / 50;
    if (d < 0.7) ell(c, tip + 1, closeBranchY(tip) + 1 + d * 16, 0.5, 0.9, '#991B1B');
  }
  // ---- the hole in the vest: torn open in a ragged star round it, meat, the blood down his front
  if (tip < B.x) {
    const rr = r(B.x) * (0.4 + 0.6 * open);
    fill(c, VEST[3], () => { for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, q = i % 2 ? 1.25 : 1.75; c.lineTo(B.x + Math.cos(a) * rr * q, B.y + Math.sin(a) * rr * q); } c.closePath(); });
    ell(c, B.x, B.y, rr + 1.4, rr + 1.6, '#4A0A0A'); ell(c, B.x - 0.3, B.y + 0.3, rr + 0.6, rr + 0.8, '#8A1414');
    line(c, [B.x - 1, B.y + rr, B.x - 1.6, B.y + rr + 4 * open, B.x - 0.8, 40], 2.2 * open + 0.4, '#7A0E0E');
    line(c, [B.x - 0.7, B.y + rr, B.x - 1.3, B.y + rr + 4 * open, B.x - 0.5, 40], 0.7 * open + 0.2, '#C42A2A');
    line(c, [B.x + 2.6, B.y + rr, B.x + 3.4, 40], 1.4 * open, '#7A0E0E');
  }
  // ---- the part out in front of him (or all of it, not into him yet)
  const from = Math.max(tip, B.x - 2);
  if (snapped) drawBough(c, from, 25, closeBranchY, r, { bloodTo: tip < B.x ? B.x + 2.4 : undefined, jag: true, step: 0.5, seed: 9 });
  else drawBough(c, from, 90, closeBranchY, r, { bloodTo: tip < B.x ? B.x + 2.4 : undefined, step: 0.5, seed: 9 });
  // (its twig and its leaves)
  const tx = snapped ? 17 : 24;
  if (tx > from + 2) {
    const ty = closeBranchY(tx) - r(tx) + 0.4;
    line(c, [tx, ty, tx + 2.4, ty - 5, tx + 5.4, ty - 7], 1.2, BARK[4]); line(c, [tx, ty, tx + 2.4, ty - 5, tx + 5.4, ty - 7], 0.6, BARK[1]);
    for (const [lx, ly, rot, col] of [[tx + 3, ty - 6, -0.5, '#D97706'], [tx + 6.4, ty - 7.6, 0.5, '#B45309']] as const) {
      c.save(); c.translate(lx, ly); c.rotate(rot); ell(c, 0, 0, 2.6, 1.2, '#6E2A08'); ell(c, -0.2, -0.1, 2.2, 0.9, col); line(c, [-2.4, 0, 2.2, 0], 0.3, '#6E2A08'); c.restore();
    }
  }
};

/** A wound being made, painted over the close-up at `k` 0..1 (its own frames: multi-frame, gory, animated). Drawn in
 *  the head's unit space (its middle at the origin, facing right; about 24 across). */
export type WoundPainter = (c: Ctx, k: number, frame: number) => void;
const PAINTERS = new Map<TuckerWound, WoundPainter>();
const DRIVES = new Map<TuckerWound, (k: number) => number>();
/** (each mutilating job's: its wound's close-up frames. `drive`, for a wound drawn on his head as it's made (the split):
 *  how far it's gone at k, handed to the head's own drawing as the wound's 0..1) */
export const registerWoundPainter = (wound: TuckerWound, paint: WoundPainter, drive?: (k: number) => number) => {
  PAINTERS.set(wound, paint);
  if (drive) DRIVES.set(wound, drive);
};

export interface CloseupOpts extends TuckerOpts {
  /** A wound being made right now (the mutilation rule): its painter at k 0..1, over the face. */
  making?: { wound: TuckerWound; k: number };
  /** Red to the ears (furious), whatever the face. */
  red?: boolean;
  /** A shake to it (the shout, the hit): px in the head's space. */
  jolt?: number;
}

/**
 * His head and shoulders, big: (cx, cy) the middle of his face, `scale` px per head unit (about 24 units across: 6
 * gives a face ~150 px wide). Drawn as he is (the stacked wounds), then the wound being made if any.
 */
export const drawTuckerCloseup = (c: Ctx, cx: number, cy: number, scale: number, frame: number, opts: CloseupOpts = {}) => {
  const f = frame, face = opts.face ?? 'smile';
  // (a wound being made that's drawn on his head as it goes (the split): how far it's gone, from its drive)
  const mk = opts.making, drive = mk ? DRIVES.get(mk.wound) : undefined;
  const wounds: TuckerWounds = mk && drive ? { ...(opts.wounds ?? {}), [mk.wound]: drive(Math.max(0, Math.min(1, mk.k))) } : opts.wounds ?? {};
  const red = !!opts.red || face === 'yell';
  const j = opts.jolt ?? 0;
  c.save();
  c.translate(Math.round(cx + (j ? Math.sin(f * 1.7) * j * scale : 0)), Math.round(cy + (j ? Math.cos(f * 2.3) * j * scale * 0.6 : 0)));
  c.scale(scale, scale);
  // (at close-up size: the gross-up, tuckerCloseGross.ts; a figure-sized head (the dirt bike's sprite) stays as drawn here)
  if (Math.abs(scale) >= 2 && grossCloseupsOn()) { drawCloseGross(c, f, face, !!opts.talking, !!opts.capless, red, wounds, mk); c.restore(); return; }
  // ---- his shoulders: the coat, its lapels and buttons, the collar and the bow tie, the badge (in the head's units)
  c.save(); c.translate(0, 0);
  shape(c, () => { c.moveTo(-26, 40); c.quadraticCurveTo(-24, 18, -12, 14); c.lineTo(14, 14); c.quadraticCurveTo(26, 18, 28, 40); c.closePath(); }, COAT, -26, 28, 0.6);
  fill(c, VEST[1], () => { c.moveTo(-6, 15); c.lineTo(8, 15); c.lineTo(10, 40); c.lineTo(-8, 40); c.closePath(); });
  px(c, -8, 15, 2, 25, VEST[0]); px(c, 6, 15, 4, 25, VEST[2]);
  for (let i = 0; i < 3; i++) button(c, 1, 22 + i * 6, 1.2);
  fill(c, SHIRT[1], () => { c.moveTo(-4, 13.4); c.lineTo(6, 13.4); c.lineTo(1, 22); c.closePath(); });
  shape(c, () => c.roundRect(-5.6, 10.4, 12.4, 4, 1.2), SHIRT, -5.6, 6.8, 0.4);
  const tie: Ramp = ['#4A4A52', '#1E1E24', '#141418', '#0C0C10', '#000000'];
  shape(c, () => { c.moveTo(0.6, 15.6); c.lineTo(-5.4, 13); c.lineTo(-5.6, 18.6); c.closePath(); }, tie, -5.6, 0.6, 0.4);
  shape(c, () => { c.moveTo(1.4, 15.6); c.lineTo(7.4, 13); c.lineTo(7.6, 18.6); c.closePath(); }, tie, 1.4, 7.6, 0.4);
  ell(c, 1, 15.8, 1.4, 1.6, tie[1]);
  shape(c, () => { c.moveTo(-6, 14); c.lineTo(-13, 22); c.lineTo(-11.4, 26); c.lineTo(-15, 29); c.lineTo(-13, 16); c.closePath(); }, COAT, -15, -6, 0.4);
  shape(c, () => { c.moveTo(8, 14); c.lineTo(15, 22); c.lineTo(13.4, 26); c.lineTo(17, 29); c.lineTo(15, 16); c.closePath(); }, COAT, 8, 17, 0.4);
  for (let i = 0; i < 2; i++) { button(c, -17, 30 + i * 6, 1.3); button(c, 19, 30 + i * 6, 1.3); }
  shape(c, () => c.roundRect(14, 22.4, 9, 3.4, 0.8), BRASS, 14, 23, 0.4);
  for (let i = 0; i < 6; i++) px(c, 15 + i * 1.2, 23.4, 0.7, 1.4, BRASS[4]);
  // (the woods' extra-bloodied look: muck and blood down his shoulders, chips stuck in the cloth, the torn shoulder)
  if (wounds.grime) {
    ell(c, -18, 34, 6, 3, '#2E2E16', 0.3); ell(c, -18.4, 33.6, 4.6, 2, '#4A4A26', 0.3);
    line(c, [1, 16, 0.4, 24, 1.6, 32, 1, 40], 2.2, '#8A1414'); line(c, [1.3, 16, 0.7, 24, 1.9, 32], 0.7, '#C42A2A');
    for (const [x, y, r] of [[-10, 26, 1.4], [12, 30, 1.1], [20, 20, 1.6], [-20, 24, 0.9], [6, 36, 1]] as const) ell(c, x, y, r, r * 0.8, '#8A1414');
    fill(c, SHIRT[2], () => { c.moveTo(18, 16); c.lineTo(25, 20); c.lineTo(23, 27); c.lineTo(19, 23); c.closePath(); });
    line(c, [19.6, 18.6, 22.4, 23], 1.2, '#8A1414');
    for (let i = 0; i < 8; i++) { const x = -22 + ((i * 9.1) % 44), y = 20 + ((i * 7.7) % 18); px(c, x - 1.6, y - 0.7, 3.2, 1.4, '#8A6030'); px(c, x - 1.2, y - 0.5, 2.4, 0.8, '#D6A060'); }
  }
  // (the catch-up's branch, through his chest: in at the vest, the point out behind his far shoulder, snapped off in
  // front; as the close-up of it being done left it)
  if (wounds.branch) drawCloseupBranch(c, f, CLOSE_BRANCH_TIP, true);
  // (the split's blood, sheeted down off his chin over the collar and the shirt front)
  const sd = splitOf(wounds);
  if (sd > 0.3) {
    const q = Math.min(1, (sd - 0.3) * 1.6);
    line(c, [3, 12, 2.6, 12 + 6 * q, 3.4, 12 + 14 * q, 2.8, 12 + 26 * q], 2.4, '#7A0E0E'); line(c, [3.3, 12, 2.9, 12 + 6 * q, 3.7, 12 + 14 * q], 0.7, '#C42A2A');
    line(c, [6.4, 12, 7, 12 + 9 * q], 1.4, '#7A0E0E');
    ell(c, 4.2, 12.6, 3.4 * q, 1.4 * q, '#7A0E0E');
  }
  c.restore();
  // ---- the neck, the head
  fill(c, (red ? RAGE : SKIN)[2], () => c.roundRect(-6, 8, 12, 6, 2));
  drawHead(c, face, f, !!opts.talking, !!opts.capless, red, wounds);
  // ---- the wound being made (the mutilation rule), over all of it
  if (opts.making) PAINTERS.get(opts.making.wound)?.(c, Math.max(0, Math.min(1, opts.making.k)), f);
  c.restore();
};

/** The close-up as a gross-up (tuckerCloseGross.ts's stamps): his shoulders, his head (split: its halves sheared apart,
 *  the gap between them), the live drips and glints, then the wound being made (its frames through the gore pass). */
const drawCloseGross = (c: Ctx, f: number, face: TuckerFace, talking: boolean, capless: boolean, red: boolean, wounds: TuckerWounds, mk: CloseupOpts['making']) => {
  const sd = splitOf(wounds);
  drawGrossBody(c, red, wounds, sd);
  const h = { face, f, talking, capless, red, wounds, sd };
  if (sd <= 0) drawGrossHead(c, h);
  else {
    const s = SPLIT.shear * splitStep(sd), { x: cx, py } = SPLIT;
    for (const side of [0, -1, 1] as const) {
      c.save();
      if (side) { c.translate(0, py); c.transform(1, 0, -side * s, 1, 0, 0); c.translate(0, -py); }
      c.beginPath();
      if (side === 0) c.rect(-40, py, 80, 60);
      else if (side < 0) c.rect(-40, -60, 40 + cx, 60 + py);
      else c.rect(cx, -60, 40, 60 + py);
      c.clip();
      drawGrossHead(c, h);
      c.restore();
    }
    drawGoreGap(c, sd, capless, g => drawSplitGap(g, splitStep(sd), f, capless, false));
  }
  // ---- live: the drips off his wounds, a glint off his spectacles, a fleck of spit
  const drip = (x: number, y0: number, len: number, period: number, off: number, upto = 0.6) => {
    const d = ((f + off) % period) / period;
    if (d >= upto) return;
    const y = Math.round((y0 + d * len) * 4) / 4, xx = Math.round(x * 4) / 4;
    px(c, xx - 0.25, y - 0.25, 0.75, 1, '#5A0808'); px(c, xx, y, 0.5, 0.75, '#B01C1C'); px(c, xx, y, 0.25, 0.25, '#F46A6A');
  };
  if (wounds.eye) drip(NEAR_EYE - 0.2, EYE_Y + 10.8, 4, 90, 0);
  if (wounds.saw && sd <= 0) drip(5.6, 9.8, 4, 80, 45);
  if (sd >= SPLIT_EYES_AT) drip(FAR_EYE - 0.3, EYE_Y + 11.6, 4, 70, 31);
  if (sd > 0.5) drip(6.4, 4.8, 6, 46, 7, 0.65);
  if (wounds.branch) { drip(8.7, 13.8, 5, 64, 13); drip(CLOSE_BRANCH_TIP + 1.5, closeBranchY(CLOSE_BRANCH_TIP + 1.5) + 0.6, 16, 50, 0, 0.7); }
  if ((wounds.bloody ?? 0) > 0) { drip(-8.4, 8, 6, 30, 0); drip(9.4, 6, 6, 30, 15); }
  if (!wounds.eye && sd < SPLIT_EYES_AT && f % 240 < 10) px(c, NEAR_EYE - 1.5, EYE_Y - 1.5, 0.75, 0.75, '#FFFFFF');
  if (face === 'manic' && !talking && f % 50 < 20) px(c, 5.2 + 5.6, 8.6 + (f % 50) * 0.2, 0.5, 0.5, '#E0F2FE');
  // ---- the wound being made (the mutilation rule), over all of it
  if (mk) { const paint = PAINTERS.get(mk.wound), k = Math.max(0, Math.min(1, mk.k)); if (paint) drawGoreMaking(c, mk.wound, k, f, g => paint(g, k, f)); }
};
