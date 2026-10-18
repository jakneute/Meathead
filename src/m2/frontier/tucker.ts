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
// in his forehead at the log ride), the branch (impaled through his chest in the woods). Only the clean state is drawn
// yet: each job that mutilates him draws its wound here (on the figure: `drawWounds`; on the close-up: its painter).
//
// THE MUTILATION CLOSE-UP RULE (the user's): every mutilation is shown as a graphic, ANIMATED, multi-frame close-up of
// it happening (not a still of the result). `drawTuckerCloseup(c, cx, cy, scale, frame, { making: { wound, k } })`
// draws his face big, then the registered painter for that wound at k 0..1 (registerWoundPainter): the jobs that
// mutilate him register theirs.
//
// drawTucker(c, x, feetY, facing, frame, pose, opts): world (or screen) point of his feet, facing 1 right / -1 left.

import { type Ctx } from '../cast/kit';

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
  | 'hurt';    // hit: reeling back

/** 'manic': the bookkeeper unhinged (the user's model: South Park's Mel Gibson): one eye bulging, the other a pinprick,
 *  a brow up in his cap, a clenched grin of every tooth he's got, the gap and all. */
export type TuckerFace = 'smile' | 'cheer' | 'talk' | 'shock' | 'angry' | 'yell' | 'daze' | 'out' | 'ow' | 'manic';
export type TuckerWound = 'eye' | 'saw' | 'branch';
/** What's been done to him so far (they stack, in this order, through the land). */
export interface TuckerWounds { eye?: boolean; saw?: boolean; branch?: boolean }

export interface TuckerOpts {
  wounds?: TuckerWounds;
  /** Talking: his mouth goes (shapes off the frame count). */
  talking?: boolean;
  /** His face, if not the pose's own. */
  face?: TuckerFace;
  /** His cap's off (knocked off: the caller draws it where it went, drawTuckerCap). */
  capless?: boolean;
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
  run: 'manic', cab: 'manic', whistle: 'manic', hurt: 'ow',
};

export const drawTucker = (c: Ctx, x: number, feetY: number, facing: number, frame: number, pose: TuckerPose = 'stand', opts: TuckerOpts = {}) => {
  const f = frame, face = opts.face ?? FACES[pose], wounds = opts.wounds ?? {};
  c.save();
  c.translate(Math.round(x), Math.round(feetY));
  c.scale(facing < 0 ? -1 : 1, 1);
  // (flat on his back: the whole of him laid down about his hips, head to the back, toes up)
  if (pose === 'flat') { c.translate(-6, -16); c.rotate(-Math.PI / 2); c.translate(0, 26); }
  if (pose === 'sit') c.translate(0, 22);
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
  const [far, near] = armsFor(pose, f);
  drawArm(c, far, false, pose, f);
  drawBody(c, pose, f);
  drawWounds(c, wounds, 'body', f);
  // ---- the head, on his neck
  const hy = pose === 'sit' ? -71 + Math.sin(f * 0.1) * 1.2 : pose === 'hurt' ? -70 : -72;
  const hx = pose === 'sit' ? Math.sin(f * 0.1) * 2 : pose === 'hurt' ? -2 : pose === 'run' ? 1.5 : 0.5;
  const nod = pose === 'hurt' ? -0.25 : pose === 'sit' ? Math.sin(f * 0.1) * 0.14 : pose === 'run' ? 0.08 : pose === 'furious' ? Math.sin(f * 1.3) * 0.05 : pose === 'tip' ? 0.08 : 0;
  c.save(); c.translate(hx, hy); c.rotate(nod); c.scale(HS, HS);
  drawHead(c, face, f, !!opts.talking, opts.capless || pose === 'sit' || pose === 'flat', pose === 'furious' || face === 'yell', wounds);
  c.restore();
  drawArm(c, near, true, pose, f);
  if (pose === 'ticket') drawPunch(c, far.hx, far.hy, f);
  if (pose === 'furious' || pose === 'cab') steam(c, hx, hy, f);
  if (pose === 'sit') stars(c, hx, hy - 18, f);
  c.restore();
};

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
  const out = pose === 'run' ? 9 : pose === 'sit' ? 4 : 0;
  const lo = pose === 'sit' ? -24 : -15;
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

const armsFor = (pose: TuckerPose, f: number): [Arm, Arm] => {
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

const drawHead = (c: Ctx, face: TuckerFace, f: number, talking: boolean, capless: boolean, red: boolean, wounds: TuckerWounds) => {
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
  // ---- the spectacles: round wire rims on his nose, the arm back to his ear, a glint
  specs(c, f);
  // ---- the mouth under the mustache, then the mustache over it
  drawMouth(c, face, f, talking);
  mustache(c, face, f, talking);
  // ---- the cap
  if (!capless) drawCap(c, f);
  drawWounds(c, wounds, 'head', f);
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
// His wounds (they stack): each job that mutilates him draws its own here. Stubbed: only the clean state so far.

/**
 * What's been done to him, drawn on the figure: `layer` 'body' (the branch through his chest: over the coat) or 'head'
 * (the eye hole through his spectacles and out the back; the buzzsaw stuck in his forehead, over the cap's line). The
 * train's job draws `eye`, the log ride's `saw`, the catch-up's `branch`. Until then: nothing.
 */
const drawWounds = (_c: Ctx, w: TuckerWounds, _layer: 'body' | 'head', _f: number) => {
  if (!w.eye && !w.saw && !w.branch) return;
  // (the train's job: the near eye shot clean through: an empty socket, the lens starred, blood down his cheek)
  // (the log ride's job: the buzzsaw buried in his forehead, the cap split round it, his splitting headache)
  // (the catch-up's job: the giant branch through his chest, out the back of his coat, leaves still on it)
};

// ---------------------------------------------------------------------------------------------------------------
// The close-up (the mutilation rule's picture, and any scene's punch-in on his face)

/** A wound being made, painted over the close-up at `k` 0..1 (its own frames: multi-frame, gory, animated). Drawn in
 *  the head's unit space (its middle at the origin, facing right; about 24 across). */
export type WoundPainter = (c: Ctx, k: number, frame: number) => void;
const PAINTERS = new Map<TuckerWound, WoundPainter>();
/** (each mutilating job's: its wound's close-up frames) */
export const registerWoundPainter = (wound: TuckerWound, paint: WoundPainter) => { PAINTERS.set(wound, paint); };

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
  const f = frame, wounds = opts.wounds ?? {}, face = opts.face ?? 'smile';
  const red = !!opts.red || face === 'yell';
  const j = opts.jolt ?? 0;
  c.save();
  c.translate(Math.round(cx + (j ? Math.sin(f * 1.7) * j * scale : 0)), Math.round(cy + (j ? Math.cos(f * 2.3) * j * scale * 0.6 : 0)));
  c.scale(scale, scale);
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
  c.restore();
  // ---- the neck, the head
  fill(c, (red ? RAGE : SKIN)[2], () => c.roundRect(-6, 8, 12, 6, 2));
  drawHead(c, face, f, !!opts.talking, !!opts.capless, red, wounds);
  // ---- the wound being made (the mutilation rule), over all of it
  if (opts.making) PAINTERS.get(opts.making.wound)?.(c, Math.max(0, Math.min(1, opts.making.k)), f);
  c.restore();
};
