// Spooky Land's park staff, in costume: one person underneath every one of them (who they are is by seed, lookOf: a
// man or a woman, their skin, build, hair, face), drawn the one way (the cast kit's proportions: big-headed cartoon
// people about 70 tall, inked round every part), and the park's cheap costumes put on over them. The same costume is
// the same theme-park character wherever it turns up (an igor in the castle and in the tower, a bride, a mummy, a
// witch, a skeleton): the costume department only has the one of each, in a few sizes.
//
// The SNES finish: every material in steps (its shadow, its shade, itself, lit, its highlight), lit from the upper
// left; the seams between the steps dithered; crisp ink round every part. Each frame's painted once into a stamp (by
// costume, person, pose and frame) and put down with one drawImage after that.
//
// All drawn facing right with the feet at the origin (the engine turns them round).

import type { Enemy } from '../../m1/types';
import { stamp } from '../../m1/game/render/stamp';
import { heldHow } from '../held';
import { lookOf, type Look } from '../adventure/temple/people';
import { eyes as kitEyes, mouth as kitMouth, type EyeStyle, type MouthStyle } from '../cast/kit';

type Ctx = CanvasRenderingContext2D;
export const INK = '#1A0B06';

// ---------------------------------------------------------------------------------------------------------------
// Color in steps

const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')}`; };
export const dk = (c: string, k = 0.25) => mix(c, INK, k);
export const lt = (c: string, k = 0.25) => mix(c, '#FFFFFF', k);
/** A material's five steps: its shadow, its shade, itself, lit, its highlight. */
export const ramp = (c: string) => [dk(c, 0.5), dk(c, 0.26), c, lt(c, 0.2), lt(c, 0.42)];

/**
 * A part, in steps: clipped to its shape (`path`), over its box: lit down the left (a highlight in the top corner),
 * shaded down the right (the darkest rim at the edge) and along the bottom; dithered where the steps meet; inked.
 */
export const part = (g: Ctx, path: () => void, col: string, x: number, y: number, w: number, h: number, line = 1.2) => {
  const r = ramp(col);
  g.save(); g.beginPath(); path(); g.clip();
  g.fillStyle = col; g.fillRect(x - 2, y - 2, w + 4, h + 4);
  const lx = Math.round(x + w * 0.27), sx = Math.round(x + w * 0.66), rx = Math.round(x + w * 0.86);
  g.fillStyle = r[3]; g.fillRect(x - 2, y - 2, lx - x + 2, h + 4);
  g.fillStyle = r[4]; g.fillRect(x - 2, y - 2, Math.max(1, Math.round(w * 0.1)) + 2, Math.round(h * 0.55) + 2);
  g.fillStyle = r[1]; g.fillRect(sx, y - 2, w, h + 4);
  g.fillStyle = r[0]; g.fillRect(rx, y - 2, w, h + 4);
  g.fillStyle = r[1]; g.fillRect(x - 2, Math.round(y + h * 0.9), lx - x + 2, h);
  for (let py = Math.floor(y) - 1; py < y + h + 1; py++) {
    if (py & 1) continue;
    g.fillStyle = r[3]; g.fillRect(lx, py, 1, 1);
    g.fillStyle = r[2]; g.fillRect(sx, py + 1, 1, 1);
    g.fillStyle = r[1]; g.fillRect(rx, py, 1, 1);
  }
  g.restore();
  if (line > 0) { g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke(); }
};
/** A part lit from above (a hat's crown, a shell): the top lit, the bottom shaded, dithered between. */
export const partTop = (g: Ctx, path: () => void, col: string, x: number, y: number, w: number, h: number, line = 1.2) => {
  const r = ramp(col);
  g.save(); g.beginPath(); path(); g.clip();
  g.fillStyle = col; g.fillRect(x - 2, y - 2, w + 4, h + 4);
  const ty = Math.round(y + h * 0.3), by = Math.round(y + h * 0.7);
  g.fillStyle = r[3]; g.fillRect(x - 2, y - 2, w + 4, ty - y + 2);
  g.fillStyle = r[4]; g.fillRect(x - 2, y - 2, Math.round(w * 0.35), Math.max(1, Math.round(h * 0.12)) + 2);
  g.fillStyle = r[1]; g.fillRect(x - 2, by, w + 4, h);
  g.fillStyle = r[0]; g.fillRect(Math.round(x + w * 0.8), by, w, h);
  for (let px = Math.floor(x) - 1; px < x + w + 1; px += 2) { g.fillStyle = r[3]; g.fillRect(px, ty, 1, 1); g.fillStyle = r[1]; g.fillRect(px + 1, by - 1, 1, 1); }
  g.restore();
  if (line > 0) { g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke(); }
};
/** A flat inked fill (small things: a button, a buckle). */
export const flat = (g: Ctx, path: () => void, col: string, line = 1) => {
  g.beginPath(); path(); g.fillStyle = col; g.fill();
  if (line > 0) { g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke(); }
};
export const px = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
/** A checker of `col` over a box (a dithered tint: lace, a veil, a shadow). */
export const dither = (g: Ctx, x: number, y: number, w: number, h: number, col: string, odd = 0) => {
  g.fillStyle = col;
  for (let py = Math.round(y); py < y + h; py++) for (let qx = Math.round(x) + ((py + odd) & 1); qx < x + w; qx += 2) g.fillRect(qx, py, 1, 1);
};

/**
 * A limb (an arm, a leg, a pole), a thick stroke in steps: inked round, its color, a shaded side (lower right) and a
 * lit side (upper left).
 */
export const limb = (g: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string, inked = true) => {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
  let nx = -dy / d, ny = dx / d;
  if (nx < -0.01 || (Math.abs(nx) <= 0.01 && ny < 0)) { nx = -nx; ny = -ny; }
  g.lineCap = 'round';
  if (inked) { g.strokeStyle = INK; g.lineWidth = w + 2.4; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  g.lineCap = 'butt';
  const o = w * 0.3;
  g.strokeStyle = dk(col, 0.26); g.lineWidth = w * 0.36; g.beginPath(); g.moveTo(x1 + nx * o, y1 + ny * o); g.lineTo(x2 + nx * o, y2 + ny * o); g.stroke();
  g.strokeStyle = lt(col, 0.22); g.lineWidth = Math.max(1, w * 0.2); g.beginPath(); g.moveTo(x1 - nx * o, y1 - ny * o); g.lineTo(x2 - nx * o, y2 - ny * o); g.stroke();
};
/**
 * A jointed limb (shoulder or hip, elbow or knee, wrist or ankle): the bones' strokes inked as ONE piece (the ink round
 * the lot first, then every bone's color over it, so no ink line cuts across a joint), a round cap filling each joint,
 * each bone shaded and lit, the crook of each bend creased and its point catching the light. `pts` the joints in order,
 * `ws` each bone's width, `cols` each bone's color.
 */
export const jointed = (g: Ctx, pts: number[][], ws: number[], cols: string[], inked = true) => {
  const n = pts.length - 1;
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (inked) {
    g.strokeStyle = INK;
    for (let i = 0; i < n; i++) { g.lineWidth = ws[i] + 2.4; g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i + 1][0], pts[i + 1][1]); g.stroke(); }
  }
  for (let i = 0; i < n; i++) { g.strokeStyle = cols[i]; g.lineWidth = ws[i]; g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i + 1][0], pts[i + 1][1]); g.stroke(); }
  for (let i = 0; i < n; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], w = ws[i], col = cols[i];
    const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
    let nx = -dy / d, ny = dx / d;
    if (nx < -0.01 || (Math.abs(nx) <= 0.01 && ny < 0)) { nx = -nx; ny = -ny; }
    const o = w * 0.3;
    // (shade and light stopped short of the joints, so each joint's round cap reads as its own knob)
    const a = Math.min(0.3, (w * 0.4) / d), b = 1 - a;
    const ax = x1 + dx * a, ay = y1 + dy * a, bx = x1 + dx * b, by = y1 + dy * b;
    g.lineCap = 'butt';
    g.strokeStyle = dk(col, 0.26); g.lineWidth = w * 0.36; g.beginPath(); g.moveTo(ax + nx * o, ay + ny * o); g.lineTo(bx + nx * o, by + ny * o); g.stroke();
    g.strokeStyle = lt(col, 0.22); g.lineWidth = Math.max(1, w * 0.2); g.beginPath(); g.moveTo(ax - nx * o, ay - ny * o); g.lineTo(bx - nx * o, by - ny * o); g.stroke();
  }
  // (the bends: a crease in the crook, a lit point on the outside)
  for (let i = 1; i < n; i++) {
    const [px0, py0] = pts[i - 1], [jx, jy] = pts[i], [qx, qy] = pts[i + 1];
    const mx = (px0 + qx) / 2 - jx, my = (py0 + qy) / 2 - jy, md = Math.hypot(mx, my);
    if (md < 0.8) continue;
    const ux = mx / md, uy = my / md, w = Math.min(ws[i - 1], ws[i]);
    g.fillStyle = dk(cols[i], 0.4); g.fillRect(Math.round(jx + ux * w * 0.32), Math.round(jy + uy * w * 0.32), 1, 1);
    g.fillStyle = dk(cols[i], 0.26); g.fillRect(Math.round(jx + ux * w * 0.32 - uy), Math.round(jy + uy * w * 0.32 + ux), 1, 1);
    g.fillStyle = lt(cols[i], 0.3); g.fillRect(Math.round(jx - ux * w * 0.3), Math.round(jy - uy * w * 0.3), 1, 1);
  }
  g.lineCap = 'butt';
};
/** A round thing (a hand, a knob, an eyeball) in steps. */
export const ball = (g: Ctx, x: number, y: number, r: number, col: string, line = 1) => part(g, () => g.arc(x, y, r, 0, Math.PI * 2), col, x - r, y - r, r * 2, r * 2, line);

// ---------------------------------------------------------------------------------------------------------------
// The person underneath

export type Pose = 'stand' | 'walk' | 'tell' | 'strike' | 'after' | 'fly'
  /** Taken hold of, knocked about: pinned on the back (guarding the face, kicking), held up by the neck (clawing at
   *  his hands, legs going), flung (arms and legs everywhere), dazed (arms hanging), a body (limp). */
  | 'pinned' | 'shaken' | 'thrown' | 'stun' | 'limp';
export type Mood = 'ok' | 'hurt' | 'dead';
export const moodOf = (e: Enemy): Mood => (e.health <= 0 ? 'dead' : (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok');
const HELD: readonly Pose[] = ['pinned', 'shaken', 'thrown', 'stun', 'limp'];
export const isHeldPose = (p: Pose) => HELD.includes(p);

/**
 * How it's being knocked about, if it is (the pose for it, and the face): in Meathead's grab (held.ts), flung loose,
 * knocked back and dazed by a hit or a charge, blown away, or a body (the death drawing's stand-in has no id).
 */
export const reaction = (e: Enemy): { pose: Pose; md: Mood } | null => {
  const how = heldHow(e);
  const md = moodOf(e);
  if (how) return { pose: how === 'pinned' ? 'pinned' : how === 'neck' ? 'shaken' : 'thrown', md: md === 'ok' ? 'hurt' : md };
  if (!e.id) return { pose: Math.abs(e.vel.x) > 0.01 ? 'thrown' : 'limp', md: 'dead' };
  if (e.aiState === 'loose' || e.isBlownAway || e.meleeFlung || e.uppercutFlung) return { pose: 'thrown', md: md === 'ok' ? 'hurt' : md };
  if ((e.pauseTimer ?? 0) > 4 && !e.puppet) return { pose: Math.abs(e.vel.y) > 0.6 || Math.abs(e.vel.x) > 2 ? 'thrown' : 'stun', md: md === 'ok' ? 'hurt' : md };
  return null;
};

export interface Body {
  L: Look; seed: number;
  /** Shoulders across, hips across, a limb's width. */
  w: number; hipW: number; legW: number; armW: number;
  hipY: number; shY: number;
  /** The head: its middle, its size. */
  hx: number; hy: number; rx: number; ry: number;
  /** The feet: how far forward each is (far, near), how far up off the floor. */
  feet: [number, number]; lift: [number, number];
  /** Leaning in (the shoulders this far forward of the hips). */
  lean: number;
  /** Knocked about (a held pose): the face shows it. */
  held: Pose | null;
}

/** Who's in there, and how they're stood: the walk's in six frames (`fr`). */
export const bodyOf = (seed: number, pose: Pose, fr: number, woman?: boolean): Body => {
  const L = lookOf(seed, woman);
  const tall = (Math.floor(seed / 3) % 3) - 1;
  const heavy = L.heavy;
  let feet: [number, number] = [-1, 1], lift: [number, number] = [0, 0], bob = 0;
  if (pose === 'walk') {
    const a = (fr / 6) * Math.PI * 2, s = Math.sin(a) * 6;
    feet = [-s, s]; lift = [Math.max(0, -Math.cos(a)) * 2.5, Math.max(0, Math.cos(a)) * 2.5];
    bob = Math.abs(Math.sin(a)) > 0.7 ? 0 : -1;
  } else if (pose === 'stand') bob = fr % 2 ? -1 : 0;
  else if (pose === 'tell') { feet = [-5, 4]; bob = 1; }
  else if (pose === 'strike') { feet = [-8, 8]; bob = 2; }
  else if (pose === 'pinned') { const k = fr % 2; feet = [k ? 1 : -5, k ? 0 : 7]; lift = [k ? 6 : 1, k ? 1 : 7]; }
  else if (pose === 'shaken') { const k = fr % 2; feet = [k ? -5 : 0, k ? 4 : -1]; lift = [k ? 4 : 0, k ? 0 : 5]; }
  else if (pose === 'thrown') { const k = fr % 2; feet = [-9, 9]; lift = [4 + k * 3, 7 - k * 3]; }
  else if (pose === 'stun' || pose === 'limp') { feet = [-2, 2]; }
  const hipY = -31 - tall + bob, shY = -55 - tall * 2 + bob;
  return {
    L, seed,
    w: heavy ? 28 : L.woman ? 20 : 23, hipW: heavy ? 28 : L.woman ? 22 : 20,
    legW: heavy ? 8.5 : L.woman ? 6.5 : 7.5, armW: heavy ? 7 : L.woman ? 5.5 : 6,
    hipY, shY, hx: 1, hy: shY - 11, rx: heavy ? 9.2 : 8.6, ry: 9.6,
    feet, lift, lean: pose === 'strike' ? 3 : pose === 'tell' ? -1 : 0,
    held: isHeldPose(pose) ? pose : null,
  };
};

/**
 * Where the hands go knocked about (far, near), or null if it's not: up guarding the face pinned (one shoving at him
 * now and then), clawing at his grip round the neck, flung out flailing, hanging dazed or dead.
 */
export const flailHands = (B: Body, fr: number): [[number, number], [number, number]] | null => {
  const k = fr % 2, w = [0, 4, 0, -4][fr % 4];
  switch (B.held) {
    case 'pinned': return fr % 4 === 3 ? [[B.hx - 3, B.hy + 7], [B.w / 2 + 12, B.shY - 8]] : [[B.hx - 3, B.hy + 7 - k * 2], [B.hx + 9, B.hy + 3 + k * 2]];
    case 'shaken': return [[B.hx - 4, B.hy + 9 + k * 2], [B.hx + 7, B.hy + 11 - k * 2]];
    case 'thrown': return [[-B.w / 2 - 11, B.shY - 12 + w], [B.w / 2 + 11, B.shY - 14 - w]];
    case 'stun': return [[-B.w / 2 - 3, -30 + k], [B.w / 2 + 4, -31 - k]];
    case 'limp': return [[-B.w / 2 - 6, -27], [B.w / 2 + 7, -27]];
    default: return null;
  }
};

export type Shoe = 'shoe' | 'boot' | 'pointy' | 'sandal' | 'paw' | 'platform' | 'sneaker';
/** A foot's shoe (or the foot itself), its heel at (x, y). */
export const shoe = (g: Ctx, x: number, y: number, kind: Shoe, col: string, skin: string, near: boolean) => {
  const c = near ? col : dk(col, 0.12);
  if (kind === 'pointy') part(g, () => { g.moveTo(x - 3, y); g.lineTo(x - 3, y - 6); g.lineTo(x + 4, y - 5); g.quadraticCurveTo(x + 10, y - 3, x + 13, y - 7); g.quadraticCurveTo(x + 12, y, x + 6, y); g.closePath(); }, c, x - 3, y - 7, 16, 7, 1);
  else if (kind === 'boot') part(g, () => g.roundRect(x - 3, y - 9, 11, 9, [2, 3, 1, 1]), c, x - 3, y - 9, 11, 9, 1.1);
  else if (kind === 'platform') { part(g, () => g.roundRect(x - 5, y - 13, 16, 13, 2), c, x - 5, y - 13, 16, 13, 1.4); px(g, x - 4, y - 4, 14, 1, lt(c, 0.25)); }
  else if (kind === 'sandal') { part(g, () => g.roundRect(x - 2, y - 4, 10, 4, [2, 3, 1, 1]), skin, x - 2, y - 4, 10, 4, 1); px(g, x - 2, y - 1.5, 10, 1.5, '#5B3A1E'); px(g, x + 2, y - 4, 2, 3, '#5B3A1E'); }
  else if (kind === 'paw') { part(g, () => g.roundRect(x - 3, y - 6, 13, 6, [3, 4, 1, 1]), c, x - 3, y - 6, 13, 6, 1); for (let k = 0; k < 3; k++) px(g, x + 9 + k * 0.4, y - 4 + k * 1.5, 2, 1, '#E7E5E4'); }
  else {
    part(g, () => g.roundRect(x - 2, y - 5, 11, 5, [2, 3, 1, 1]), c, x - 2, y - 5, 11, 5, 1);
    if (kind === 'sneaker') { px(g, x - 2, y - 1.5, 11, 1.5, '#F5F5F4'); px(g, x + 3, y - 4, 1, 1, '#F5F5F4'); }
  }
};

export interface LegOpts { col: string; shoe: Shoe; shoeCol: string; skin?: string; /** shins bare below the knee (a robe, shorts) */ bareBelow?: boolean; stripe?: string; detail?: (g: Ctx, hip: number[], knee: number[], foot: number[], near: boolean) => void }
/** The two legs: hips to knees to feet, the far one darker. */
export const legs = (g: Ctx, B: Body, o: LegOpts) => {
  for (const s of [0, 1] as const) {
    const side = s ? 1 : -1, near = s === 1;
    const hip = [side * B.hipW * 0.22, B.hipY + 2], foot = [side * 3 + B.feet[s], -4 - B.lift[s]];
    const knee = [(hip[0] + foot[0]) / 2 + 1.5, (hip[1] + foot[1]) / 2];
    const col = near ? o.col : dk(o.col, 0.14), skin = o.skin ?? B.L.skin;
    // (hip, knee, ankle as one jointed leg: the knee's cap, its crease behind)
    jointed(g, [hip, knee, foot], [B.legW, B.legW - 0.5], [col, o.bareBelow ? (near ? skin : dk(skin, 0.12)) : col]);
    if (o.stripe) {
      // (striped tights: bands across the shin)
      g.save(); g.strokeStyle = near ? o.stripe : dk(o.stripe, 0.14); g.lineWidth = 1.6;
      for (let k = 0.15; k < 0.95; k += 0.28) { const yy = knee[1] + (foot[1] - knee[1]) * k, xx = knee[0] + (foot[0] - knee[0]) * k; g.beginPath(); g.moveTo(xx - B.legW / 2 + 0.6, yy); g.lineTo(xx + B.legW / 2 - 0.6, yy + 0.6); g.stroke(); }
      g.restore();
    }
    o.detail?.(g, hip, knee, foot, near);
    shoe(g, foot[0] - 1, 0 - B.lift[s], o.shoe, o.shoeCol, skin, near);
  }
};

/** The torso, shoulders to hips (a heavy one's belly out front; a woman's waist in). */
export const torso = (g: Ctx, B: Body, col: string, top = B.shY, bottom = B.hipY + 2, extraW = 0) => {
  const w = B.w + extraW, hw = B.hipW + extraW, belly = B.L.heavy ? 5 : B.L.woman ? -1.5 : 0, ln = B.lean;
  const path = () => {
    g.moveTo(-hw / 2, bottom); g.lineTo(-w / 2 + ln, top + 4); g.quadraticCurveTo(-w / 2 + ln, top, -w / 2 + 4 + ln, top);
    g.lineTo(w / 2 - 4 + ln, top); g.quadraticCurveTo(w / 2 + ln, top, w / 2 + ln, top + 4);
    g.quadraticCurveTo(w / 2 + belly + ln / 2, (top + bottom) / 2 + 4, hw / 2, bottom); g.closePath();
  };
  part(g, path, col, -w / 2 - 2, top, w + 8, bottom - top);
  return path;
};

export interface ArmOpts { sleeve: string; hand: string; w?: number; /** how far down the arm the sleeve comes (1: to the wrist) */ len?: number; /** the hand drawn as a mitt/claw/glove of this kind */ claw?: boolean; elbow?: number }
/** An arm from its shoulder (`side` -1 far, 1 near) to the hand at (hx, hy), bent at the elbow (it sags). */
export const arm = (g: Ctx, B: Body, side: -1 | 1, hx: number, hy: number, o: ArmOpts) => {
  const w = o.w ?? B.armW;
  const sx = side * (B.w / 2 - 3) + B.lean, sy = B.shY + 3;
  const mx = (sx + hx) / 2, my = (sy + hy) / 2, dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy) || 1;
  // (the elbow: out from the shoulder-to-hand line, a bit, to the outside of the body (the far arm's to the back, the
  // near arm's to the front) and down. Which of the two ways off the line that is depends on which arm it is: picking
  // it by the line's own slope alone bent a hanging far arm's elbow in across the body and a near one's the other way)
  // (the arm's bones a set length (longer only when it's reaching), so a hand in near the body bends the elbow right
  // out instead of folding the arm into a stick)
  const L = Math.max(10.5, (d / 2) * 1.04);
  const bend = Math.sqrt(Math.max(0, L * L - (d / 2) * (d / 2))) * (o.elbow ?? 1);
  let nx = -dy / d, ny = dx / d; if (side * nx * 0.7 + ny < 0) { nx = -nx; ny = -ny; }
  const ex = mx + nx * bend, ey = my + ny * bend;
  const len = o.len ?? 1;
  const upCol = len > 0 ? o.sleeve : o.hand, foreCol = len >= 1 ? o.sleeve : o.hand;
  // (the shoulder: a round cap of deltoid over the top of the arm, joining it to the torso; inked with the arm as one)
  const cr = w * 0.64, cx = sx + side * 0.5, cy = sy - 0.5;
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, cr + 1.2, 0, Math.PI * 2); g.fill();
  jointed(g, [[sx, sy], [ex, ey], [hx, hy]], [w, w - 0.5], [upCol, foreCol]);
  partTop(g, () => g.arc(cx, cy, cr, 0, Math.PI * 2), upCol, cx - cr, cy - cr, cr * 2, cr * 2, 0);
  // (its seam into the arm below: a short shadow under the cap)
  const ua = Math.atan2(ey - sy, ex - sx);
  g.strokeStyle = dk(upCol, 0.3); g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, cr - 0.5, ua - 0.7, ua + 0.7); g.stroke();
  if (len > 0 && len < 1) { px(g, ex - w / 2, ey - 1, w, 2, dk(o.sleeve, 0.2)); }
  else if (len >= 1 && o.sleeve !== o.hand) {
    // (the cuff at the wrist, the hand coming out of it)
    const fx = hx - ex, fy = hy - ey, fd = Math.hypot(fx, fy) || 1, wx = hx - (fx / fd) * (w * 0.75), wy = hy - (fy / fd) * (w * 0.75);
    g.strokeStyle = dk(o.sleeve, 0.3); g.lineWidth = 1.2; g.beginPath(); g.moveTo(wx - (fy / fd) * w * 0.45, wy + (fx / fd) * w * 0.45); g.lineTo(wx + (fy / fd) * w * 0.45, wy - (fx / fd) * w * 0.45); g.stroke();
  }
  if (o.claw) {
    ball(g, hx, hy, w * 0.66, o.hand, 1);
    for (let k = -1; k <= 1; k++) flat(g, () => { g.moveTo(hx + 2, hy + k * 2 - 0.8); g.lineTo(hx + 7, hy + k * 2.4); g.lineTo(hx + 2, hy + k * 2 + 0.8); g.closePath(); }, '#ECE7DC', 0.6);
  } else ball(g, hx, hy, w * 0.62, o.hand, 1);
  return { sx, sy, ex, ey };
};

/** The head: the ears, the head in steps. */
export const headShape = (g: Ctx, B: Body, skin: string, ears = true) => {
  const { hx, hy, rx, ry } = B;
  if (ears) for (const s of [-1, 1]) part(g, () => g.ellipse(hx + s * rx * 0.96, hy + 1, 2.4, 3.4, 0, 0, Math.PI * 2), skin, hx + s * rx - 2.4, hy - 2.4, 4.8, 6.8, 1);
  part(g, () => g.ellipse(hx, hy, rx, ry, 0, 0, Math.PI * 2), skin, hx - rx, hy - ry, rx * 2, ry * 2);
  // (the cheek blush and the jaw's shadow, a step each)
  px(g, hx + 3, hy + 3, 3, 1, dk(skin, 0.08));
};

export interface FaceOpts { skin: string; eyes?: EyeStyle; mouth?: MouthStyle; md?: Mood; blink?: boolean; nose?: boolean; noseCol?: string; brows?: string; look?: number; skipEyes?: boolean }
/** Their face: the eyes (shut, crossed out), the nose, the mouth; a man's mustache or beard, glasses, by seed. */
export const faceOn = (g: Ctx, B: Body, o: FaceOpts) => {
  const { hx, hy } = B;
  const md = o.md ?? 'ok';
  const shock = B.held && B.held !== 'limp' && md === 'hurt';
  const es: EyeStyle = md === 'dead' ? 'dead' : shock ? (B.held === 'stun' ? 'tired' : 'wide') : md === 'hurt' || o.blink ? 'closed' : o.eyes ?? 'open';
  if (!o.skipEyes) kitEyes(g, hx + 2.5, hy - 1, 3.6, es, 100, o.look ?? 0.6, 2.2, dk(o.skin, 0.12));
  if (o.brows && es !== 'angry' && md === 'ok') { px(g, hx - 2.5, hy - 5.5, 3.5, 1.2, o.brows); px(g, hx + 4.5, hy - 5.5, 3.5, 1.2, o.brows); }
  if (o.nose !== false) part(g, () => g.ellipse(hx + 6, hy + 2.5, 2, 1.6, 0, 0, Math.PI * 2), o.noseCol ?? dk(o.skin, 0.08), hx + 4, hy + 1, 4, 3.2, 1);
  const ms: MouthStyle = md === 'dead' || md === 'hurt' ? 'o' : o.mouth ?? 'flat';
  kitMouth(g, hx + 4, hy + 6.5, 5, ms, 100);
};
/** A man's mustache or beard (by seed), in their own hair. */
export const whiskers = (g: Ctx, B: Body) => {
  const { L, hx, hy } = B;
  if (L.woman) return;
  if (L.face === 1) part(g, () => g.roundRect(hx + 1.5, hy + 4.2, 8, 2.4, 1), L.hair, hx + 1.5, hy + 4, 8, 3, 1);
  if (L.face === 2) part(g, () => { g.moveTo(hx - 6, hy + 2); g.quadraticCurveTo(hx + 1, hy + 14, hx + 9, hy + 3); g.lineTo(hx + 8, hy + 6); g.quadraticCurveTo(hx + 2, hy + 10, hx - 3, hy + 5); g.closePath(); }, L.hair, hx - 6, hy + 2, 15, 10, 1);
};
export const glasses = (g: Ctx, B: Body) => {
  if (B.L.face !== 3) return;
  const { hx, hy } = B;
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 2.2; g.strokeRect(hx + 2.5 + s * 3.6 - 2.8, hy - 3, 5.6, 4); g.strokeStyle = '#3F3F46'; g.lineWidth = 1; g.strokeRect(hx + 2.5 + s * 3.6 - 2.8, hy - 3, 5.6, 4); }
};
/** Their own hair: the top of it (a cap of it), unless bald. */
export const hairTop = (g: Ctx, B: Body, col = B.L.hair) => {
  if (B.L.bald) return;
  const { hx, hy } = B;
  part(g, () => { g.moveTo(hx - 9, hy); g.quadraticCurveTo(hx - 8, hy - 12, hx + 1, hy - 11.5); g.quadraticCurveTo(hx + 9.5, hy - 11, hx + 10, hy - 4); g.lineTo(hx + 4, hy - 6); g.quadraticCurveTo(hx - 2, hy - 6, hx - 5, hy + 1); g.closePath(); }, col, hx - 9, hy - 12, 19, 13, 1);
};
/** Long hair, down the back of the head (a woman's, mostly). */
export const hairBack = (g: Ctx, B: Body, col = B.L.hair, len = B.L.long ? 18 : 10) => {
  if (B.L.bald || !(B.L.long || B.L.woman)) return;
  const { hx, hy } = B;
  part(g, () => { g.moveTo(hx - 5, hy - 9); g.quadraticCurveTo(hx - 14, hy - 4, hx - 12, hy + len); g.lineTo(hx - 6, hy + len - 2); g.quadraticCurveTo(hx - 7, hy + 3, hx - 2, hy - 2); g.closePath(); }, col, hx - 14, hy - 9, 12, len + 9, 1);
};

// ---------------------------------------------------------------------------------------------------------------
// Putting them down

/** A frame's look, everything that changes what's painted. */
export interface Frame { seed: number; pose: Pose; fr: number; md: Mood; t: number; blink: boolean; woman?: boolean; v: string }

/** The walk's frame (six), the idle's (two), a tell's progress (`t`, 0..1, in quarters). */
export const frameOf = (seed: number, f: number, pose: Pose, md: Mood, t = 0, woman?: boolean, v = ''): Frame => ({
  seed, pose, md, woman, v,
  fr: pose === 'walk' ? Math.floor((f + seed) / 6) % 6 : pose === 'fly' ? Math.floor((f + seed) / 5) % 4 : pose === 'stand' ? Math.floor((f + seed) / 45) % 2
    : pose === 'limp' ? 0 : pose === 'stun' ? Math.floor((f + seed) / 12) % 2 : isHeldPose(pose) ? Math.floor((f + seed) / 4) % 4 : 0,
  t: Math.round(Math.max(0, Math.min(1, t)) * 4) / 4,
  blink: md === 'ok' && (f + seed * 7) % 173 < 6,
});

/** Puts a frame down from its stamp (painted the once), in the box (x, y, w, h) about the feet. */
export const putFrame = (c: Ctx, id: string, F: Frame, box: [number, number, number, number], paint: (g: Ctx) => void) =>
  stamp(c, `spk-${id}-${F.seed}-${F.pose}-${F.fr}-${F.md}-${F.t}-${F.blink ? 1 : 0}-${F.woman === undefined ? 'x' : F.woman ? 'f' : 'm'}-${F.v}`, box[0], box[1], box[2], box[3], paint);

/** A seeded pick (the same one every time for this seed and salt). */
export const pickOf = <T>(seed: number, salt: number, list: readonly T[]): T => list[Math.abs(Math.floor(seed / (salt + 1)) + salt * 7) % list.length];
