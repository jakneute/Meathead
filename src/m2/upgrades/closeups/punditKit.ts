// The White House pundits' cheap-shot close-ups (Phase F; SPEC.md's hand armor): not an X-ray, a 90s cartoon nut shot,
// the show's flat look with the game's banding. One routine for all five, each pundit's file handing it his pieces:
//
//   0-18   the pundit mid-bluster, full figure (knees up for the tall ones), his boot (drawKick) swinging up from under
//   18     the boot lands: an impact star and the pundit's word (DING! BONG! ...), ring lines, the sunburst; he's lifted
//          off his feet, shaking; his props fly out of his hands; both hands snap to the crotch
//   +0..   the eyes pop and cross (bloodshot), the face goes red then purple, the cheeks puff, veins at the temples,
//          sweat flying, the wheeze (a squeak of H's climbing in pitch), knees knocking
//   +26..  a wobble, then he keels over sideways stiff as a board, THUD, dust, birds tweeting round his head
//
// Still art baked once on first use (bakeOnce): the backdrop, the legs (stood, knock-kneed), the body (props in hand,
// hands cupped), the face (normal, red, purple: tinted once), the hair. Per frame: drawImage of those under a transform,
// plus the face's eyes, brows, mouth and a few drops: shapes only.

import type { CloseUpPaint } from '../closeUp';
import { PANEL_W, PANEL_H, CLOSE_HIT, OPEN, rnd, lerp, clamp, drawKick, bakeOnce } from '../closeUp';
import { toonPart, toonTop, toonFlat, toonLimb, toonRamp, type Rp } from '../../cartoon/whitehouse1/punditArt';
import { INK, mix } from '../../cartoon/kit';
import { dith } from '../../cartoon/amphi/paint';
import { star } from '../../cartoon/whitehouse1/poof';
import { elbowFront } from '../../art/limb';

export type Ctx = CanvasRenderingContext2D;
export { toonPart as part, toonTop as partTop, toonFlat as flat, toonLimb as limb, toonRamp as rp, INK, mix, dith, type Rp };
const part = toonPart, partTop = toonTop, flat = toonFlat, limb = toonLimb;

export const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
export const SHIRT: Rp = ['#FFFFFF', '#F2F2F8', '#D6D6E4', '#ACACC2'];
export const SHOE: Rp = ['#4A4E5E', '#22242E', '#16171E', '#0C0C12'];
export const GOLD: Rp = ['#FFF0A8', '#F2C84A', '#C8961E', '#8A6410'];
export const FONT = (n: number) => `${n}px "Press Start 2P"`;

// ---- the baked canvases' sizes: a figure's (feet at FOX, FOY), a head's (its middle at HOX, HOY)
export const FW = 300, FH = 320, FOX = 150, FOY = 300;
export const HW = 300, HH = 260, HOX = 150, HOY = 130;
const RED_T = 'rgba(236,44,44,0.42)', PURP_T = 'rgba(112,24,168,0.5)';

/** A canvas washed in a color over its own pixels only (the face going red, purple): once. */
export const tinted = (key: string, src: HTMLCanvasElement, col: string) => bakeOnce(key, g => {
  g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = col; g.fillRect(0, 0, src.width, src.height);
}, src.width, src.height);
/** The three: normal, red, purple. */
export const tints3 = (key: string, src: HTMLCanvasElement) => [src, tinted(`${key}R`, src, RED_T), tinted(`${key}P`, src, PURP_T)] as const;
/** Drawn crossfaded: red over normal by kr, purple over that by kp. */
export const drawTints = (c: Ctx, t3: readonly HTMLCanvasElement[], x: number, y: number, kr: number, kp: number) => {
  c.drawImage(t3[0], x, y);
  if (kr > 0) { c.globalAlpha = kr; c.drawImage(t3[1], x, y); }
  if (kp > 0) { c.globalAlpha = kp; c.drawImage(t3[2], x, y); }
  c.globalAlpha = 1;
};
/** A baked canvas drawn at (x, y) turned a, in a context scaled by k (undoing the scale: it was baked at size). */
export const stampAt = (c: Ctx, cv: HTMLCanvasElement, x: number, y: number, a: number, k = 1) => {
  c.save(); c.translate(x, y); c.rotate(a); if (k !== 1) c.scale(1 / k, 1 / k); c.drawImage(cv, -cv.width / 2, -cv.height / 2); c.restore();
};
/** A prop baked at scale k round its middle (w x h canvas). */
export const bakeProp = (key: string, w: number, h: number, k: number, paint: (g: Ctx) => void) =>
  bakeOnce(key, g => { g.translate(w / 2, h / 2); g.scale(k, k); paint(g); }, w, h);

// ---------------------------------------------------------------------------------------------------------------------
// Painting kit (the figure's units: the game's, feet at the origin, front on)

/** Horizontal bands top to bottom, their seams dithered (the backdrop). */
export const bands = (g: Ctx, cols: string[], y0 = 0, y1 = PANEL_H) => {
  const h = (y1 - y0) / cols.length;
  cols.forEach((col, i) => {
    g.fillStyle = col; g.fillRect(0, y0 + i * h, PANEL_W, h + 1);
    if (i > 0) { g.fillStyle = dith(g, col); g.fillRect(0, y0 + i * h - 4, PANEL_W, 4); }
  });
};
/** A dark vignette down both edges, dithered in, so the pundit reads off the backdrop. */
export const vignette = (g: Ctx) => {
  g.fillStyle = 'rgba(10,6,24,0.35)'; g.fillRect(0, 0, 36, PANEL_H); g.fillRect(PANEL_W - 36, 0, 36, PANEL_H);
  g.fillStyle = dith(g, 'rgba(10,6,24,0.5)'); g.fillRect(36, 0, 10, PANEL_H); g.fillRect(PANEL_W - 46, 0, 10, PANEL_H);
};

export const hand = (g: Ctx, x: number, y: number, r: number, skin: Rp) => {
  part(g, () => g.arc(x, y, r, 0, Math.PI * 2), skin, x - r, x + r, 1.4);
  px(g, x - r * 0.5, y - r * 0.6, 1.4, 1.4, skin[0]);
};

export interface LegOpts { r: Rp; hip: number; hipX: number; foot: number; w: number; shoeW: number }
/** The trouser legs front on, shoes turned out; knock-kneed (the knees jammed together, the feet apart). */
export const paintLegs = (g: Ctx, knock: boolean, o: LegOpts) => {
  partTop(g, () => g.roundRect(-o.hipX - o.w / 2 - 1, -o.hip - 5, o.hipX * 2 + o.w + 2, 11, 4), o.r, -o.hip - 5, -o.hip + 6, 1.6);
  for (const s of [-1, 1]) {
    const hx = s * o.hipX, kx = knock ? s * o.w * 0.45 : s * (o.hipX + o.foot) * 0.5, ky = -o.hip * 0.46 + (knock ? 2 : 0), fx = s * o.foot;
    limb(g, kx, ky, fx, -4, o.w * 0.9, o.r, o.w * 0.8, 0);
    limb(g, hx, -o.hip, kx, ky, o.w, o.r, o.w * 0.9, 0);
    const sx = fx + s * 2.5;
    partTop(g, () => g.roundRect(sx - o.shoeW / 2, -6, o.shoeW, 6.5, [3, 3, 1, 1]), SHOE, -6, 0.5, 1.4);
    px(g, sx - o.shoeW / 2 + 2, -5, 3, 1, '#8A8EA0');
  }
  g.strokeStyle = INK; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0.5, -o.hip - 4); g.lineTo(0.5, -o.hip + 5); g.stroke();
};

export interface TorsoOpts { r: Rp; top: number; hip: number; sw: number; ww: number; belly: number; tie: Rp; db?: boolean; btn?: string }
/** A suit jacket front on: the shoulders, the belly out, lapels, the shirt's V, the tie, the buttons, a dark hem. */
export const paintTorso = (g: Ctx, o: TorsoOpts) => {
  const mid = (-o.top - o.hip) / 2, x0 = -o.sw - o.belly, x1 = o.sw + o.belly;
  const body = () => { g.moveTo(-o.ww, -o.hip + 2); g.quadraticCurveTo(x0 - 2, mid, -o.sw, -o.top + 3); g.quadraticCurveTo(0, -o.top - 3, o.sw, -o.top + 3); g.quadraticCurveTo(x1 + 2, mid, o.ww, -o.hip + 2); g.closePath(); };
  part(g, body, o.r, x0, x1, 1.8);
  g.save(); g.beginPath(); body(); g.clip();
  g.fillStyle = dith(g, o.r[3]); g.beginPath(); g.ellipse(1, -o.hip - 4, o.ww + o.belly * 0.6, 5, 0, 0, Math.PI); g.fill();
  g.restore();
  const T = -o.top - 1, L = (o.top - o.hip) * 0.5;
  flat(g, () => { g.moveTo(-5, T); g.lineTo(6, T); g.lineTo(0.5, T + L); g.closePath(); }, SHIRT[1], 1.1);
  part(g, () => { g.moveTo(-2, T + 1); g.lineTo(3, T + 1); g.lineTo(4.5, T + L + 4); g.lineTo(0.5, T + L + 9); g.lineTo(-3.5, T + L + 4); g.closePath(); }, o.tie, -3.5, 4.5, 1.1);
  flat(g, () => g.roundRect(-2.5, T - 0.5, 6, 4, 1.5), o.tie[1], 1);
  flat(g, () => { g.moveTo(-5, T); g.lineTo(-11, T + 9); g.lineTo(-2, T + L + 2); g.closePath(); }, o.r[0], 1);
  flat(g, () => { g.moveTo(6, T); g.lineTo(12, T + 9); g.lineTo(3, T + L + 2); g.closePath(); }, o.r[2], 1);
  const btn = o.btn ?? '#2A2A36';
  for (const by of [T + L + 7, T + L + 14]) {
    if (by > -o.hip - 1) continue;
    if (o.db) for (const bx of [-6, 7]) flat(g, () => g.arc(bx, by, 1.2, 0, Math.PI * 2), btn, 0.6);
    else flat(g, () => g.arc(1, by, 1.2, 0, Math.PI * 2), btn, 0.6);
  }
  px(g, -o.ww + 1, -o.hip, o.ww * 2 - 2, 1.6, o.r[3]);
};

/** An arm front on: shoulder (sx, sy) to hand (hx, hy), the elbow out to its side (limb.ts elbowFront), a shirt cuff,
 *  the hand. `out` +1 the screen-right arm, -1 the left. */
export const arm = (g: Ctx, sx: number, sy: number, hx: number, hy: number, w: number, r: Rp, skin: Rp, out: number, bone = 0) => {
  const d = Math.hypot(hx - sx, hy - sy), b = Math.max(bone, d / 2 + 0.5);
  const [ex, ey] = elbowFront(sx, sy, hx, hy, b, b, out);
  limb(g, ex, ey, hx, hy, w * 0.9, r, w * 0.82, 0);
  limb(g, sx, sy, ex, ey, w, r, w * 0.9, 0);
  const dd = Math.hypot(hx - ex, hy - ey) || 1, ux = (hx - ex) / dd, uy = (hy - ey) / dd;
  flat(g, () => g.arc(hx - ux * w * 0.55, hy - uy * w * 0.55, w * 0.42, 0, Math.PI * 2), SHIRT[1], 0.8);
  hand(g, hx, hy, w * 0.48, skin);
};
/** Both hands clapped over the crotch (the after): the elbows out, the fingers over the fly. */
export const cupArms = (g: Ctx, o: { sw: number; top: number; hip: number; w: number; r: Rp; skin: Rp; bone: number }) => {
  for (const s of [-1, 1]) arm(g, s * o.sw, -o.top + 6, s * 3.5, -o.hip + 1, o.w, o.r, o.skin, s, o.bone);
  g.strokeStyle = o.skin[3]; g.lineWidth = 0.7;
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(s * 1.5, -o.hip - 1 + k * 1.6); g.lineTo(s * 5, -o.hip + k * 1.6); g.stroke(); }
};

// ---------------------------------------------------------------------------------------------------------------------
// The routine

export interface Frame { t: number; hit: number; S: number; H: number; hx: number; hy: number; kr: number; kp: number; lift: number }

export interface PunditCU {
  id: string;
  /** The body's scale and the head's (bigger: the cartoon close-up's). */
  S: number; H: number;
  /** His head's middle in the game's figure (feet at the origin), its chin and its top below and above that. */
  head: [number, number]; chin: number; top: number;
  /** His crotch's height (the boot's target). */
  hip: number;
  /** Which way he keels over. */
  fall: 1 | -1;
  skin: Rp;
  bg: (g: Ctx) => void;
  legs: (g: Ctx, knock: boolean) => void;
  /** Torso and arms: props in hand (false), or hands to the crotch (true). */
  body: (g: Ctx, cup: boolean) => void;
  /** The skin (it tints), and the hair over it (it doesn't), head-local, the game's units. */
  face: (g: Ctx) => void;
  hair: (g: Ctx) => void;
  eyes: [[number, number], [number, number]]; eyeR: number;
  brow: string; browY: number;
  mouth: [number, number];
  /** His mouth before (head-local, scaled). */
  mouthPre: (c: Ctx, t: number) => void;
  glasses?: boolean;
  bang: string; bangCol: string;
  squeak?: string;
  /** The hair layer's offset in head units (dx, dy, turn). */
  hairOff?: (f: Frame) => [number, number, number];
  /** Head space, unscaled px (the head's middle at 0, 0): behind the face; over the face (after the mouth). */
  behindHead?: (c: Ctx, f: Frame) => void;
  overHead?: (c: Ctx, f: Frame) => void;
  /** Figure space px (feet at 0, 0, turned with him): after the head. */
  front?: (c: Ctx, f: Frame) => void;
}

const RING = ['#FDE047', '#F97316'];
const burst = () => bakeOnce('pundit-burst', g => {
  for (let i = 0; i < 16; i++) {
    g.fillStyle = RING[i % 2];
    g.beginPath(); g.moveTo(200, 200);
    const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 1) / 16) * Math.PI * 2;
    g.lineTo(200 + Math.cos(a0) * 300, 200 + Math.sin(a0) * 300); g.lineTo(200 + Math.cos(a1) * 300, 200 + Math.sin(a1) * 300); g.fill();
  }
  g.fillStyle = '#FFFBEB'; g.beginPath(); g.arc(200, 200, 26, 0, Math.PI * 2); g.fill();
}, 400, 400);

/** A cartoon impact star: spikes, inked, a white heart. */
const impactStar = (c: Ctx, x: number, y: number, r: number) => {
  const spikes = (rr: number) => { c.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2 + 0.1, k = i % 2 ? 0.48 : 1 - (i % 4 === 0 ? 0.18 : 0); c.lineTo(x + Math.cos(a) * rr * k, y + Math.sin(a) * rr * k * 0.8); } c.closePath(); };
  spikes(r); c.fillStyle = '#FDE047'; c.fill(); c.strokeStyle = INK; c.lineWidth = 4; c.lineJoin = 'round'; c.stroke();
  spikes(r * 0.55); c.fillStyle = '#FFFFFF'; c.fill();
};

/** A word, chunky: the ink drop shadow, the color, a lit top. */
export const shout = (c: Ctx, s: string, x: number, y: number, size: number, col: string, a = 0) => {
  c.save(); c.translate(x, y); c.rotate(a); c.font = FONT(size); c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = INK; c.fillText(s, 3, 3); c.fillText(s, -2, 0); c.fillText(s, 2, 0); c.fillText(s, 0, -2);
  c.fillStyle = '#FFFFFF'; c.fillText(s, 0, -1); c.fillStyle = col; c.fillText(s, 0, 0.5);
  c.restore();
};

/** A little cartoon bird (the tweeting after he's down). */
const bird = (c: Ctx, x: number, y: number, f: number, dir: number) => {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  flat(c, () => c.ellipse(0, 0, 7, 5.5, 0, 0, Math.PI * 2), '#FDE047', 2);
  flat(c, () => { c.moveTo(6, -1); c.lineTo(11, 0.5); c.lineTo(6, 2); c.closePath(); }, '#F97316', 1.5);
  c.fillStyle = INK; c.fillRect(2, -3, 2, 2);
  const w = (f >> 2) % 2 ? -7 : 2;
  flat(c, () => { c.moveTo(-3, -1); c.lineTo(-9, w); c.lineTo(1, 1); c.closePath(); }, '#FACC15', 1.5);
  c.restore();
};

export const punditCloseUp = (d: PunditCU): CloseUpPaint => (c, t) => {
  const hit = t - CLOSE_HIT, S = d.S, H = d.H;
  const key = (k: string) => `${d.id}-cu-${k}`;
  const fig = (k: string, paint: (g: Ctx) => void) => bakeOnce(key(k), g => { g.translate(FOX, FOY); g.scale(S, S); paint(g); }, FW, FH);
  const bg = bakeOnce(key('bg'), d.bg);
  const legs = hit >= 6 && (hit >= 24 || (hit >> 1) % 2 === 0) ? fig('legsK', g => d.legs(g, true)) : fig('legs', g => d.legs(g, false));
  const body = hit >= 0 ? fig('bodyC', g => d.body(g, true)) : fig('body', g => d.body(g, false));
  const face = tints3(key('faceT'), bakeOnce(key('face'), g => { g.translate(HOX, HOY); g.scale(H, H); d.face(g); }, HW, HH));
  const hair = bakeOnce(key('hair'), g => { g.translate(HOX, HOY); g.scale(H, H); d.hair(g); }, HW, HH);

  // (where he stands: his head's top just under the panel's, his feet where that leaves them, knees up if he's tall)
  const hx = d.head[0] * S, hy0 = (d.head[1] + d.chin) * S - d.chin * H;
  const floor = 10 - hy0 + d.top * H, feetX = d.fall < 0 ? 300 : 222;
  const lift = hit >= 0 && hit < 10 ? Math.sin((hit / 10) * Math.PI) * 26 : 0;
  const shake = hit >= 0 && hit < 14 ? (hit % 2 ? 1 : -1) * (14 - hit) * 0.7 : 0;
  const crush = hit >= 6 ? 4 : 0, hy = hy0 + crush;
  const kr = hit < 0 ? 0 : clamp(hit / 10), kp = clamp((hit - 12) / 16);
  // (the keel over: a wobble, then down stiff as a board, a bounce)
  const sway = hit >= 22 && hit < 42 ? Math.sin((hit - 22) * 0.4) * 0.05 * Math.min(1, (hit - 22) / 6) : 0;
  const fk = clamp((hit - 38) / 14);
  const bounce = hit > 52 ? Math.sin((hit - 52) * 0.9) * 0.1 * Math.exp(-(hit - 52) * 0.25) : 0;
  const ang = d.fall * (1.5 * fk * fk - bounce) + sway;
  const crotchY = floor - d.hip * S - lift, ox = feetX + shake, oy = floor - lift;

  c.drawImage(bg, 0, 0);
  if (hit >= 0 && hit < 16) {
    c.save(); c.globalAlpha = 1 - hit / 16; c.translate(feetX, crotchY); c.rotate(hit * 0.04); c.scale(1.6, 1.6); c.drawImage(burst(), -200, -200); c.restore();
  }

  const f: Frame = { t, hit, S, H, hx, hy, kr, kp, lift };
  c.save(); c.translate(ox, oy); c.rotate(ang);
  c.drawImage(legs, -FOX, -FOY);
  c.drawImage(body, -FOX, -FOY + crush);
  // (the head: wobbling on the hit)
  c.save(); c.translate(hx, hy); c.rotate(hit >= 0 && hit < 22 ? Math.sin(hit * 0.9) * 0.07 : hit >= 22 ? Math.sin(hit * 0.3) * 0.04 : 0);
  d.behindHead?.(c, f);
  drawTints(c, face, -HOX, -HOY, kr, kp);
  const [mx, my] = d.mouth;
  c.save(); c.scale(H, H);
  const puff = hit < 8 ? 0 : clamp((hit - 8) / 5) * (1 - clamp((hit - 32) / 6));
  if (puff > 0) {
    const cheek = mix(mix(d.skin[1], '#E85050', kr * 0.75), '#9A40C8', kp * 0.7);
    for (const s of [-1, 1]) flat(c, () => c.ellipse(mx + s * 9, my - 2, 3 + puff * 4.5, 2.6 + puff * 3.6, 0, 0, Math.PI * 2), cheek, 0.8);
  }
  if (hit > 10) {
    // (veins up the temples, throbbing)
    c.strokeStyle = '#6B21A8'; c.lineWidth = 0.9 + Math.sin(hit * 0.8) * 0.35; c.lineCap = 'round';
    for (const s of [-1, 1]) { const vx = s * 13, vy = -9; c.beginPath(); c.moveTo(vx, vy + 6); c.lineTo(vx + s * 1.5, vy + 1); c.lineTo(vx, vy - 3); c.moveTo(vx + s * 1.5, vy + 1); c.lineTo(vx + s * 4, vy - 1); c.stroke(); }
    c.lineCap = 'butt';
  }
  c.restore();
  // (the hair: over the forehead, maybe off it)
  const ho = d.hairOff?.(f) ?? [0, 0, 0];
  if (ho[0] || ho[1] || ho[2]) { c.save(); c.translate(ho[0] * H, ho[1] * H); c.rotate(ho[2]); c.drawImage(hair, -HOX, -HOY); c.restore(); }
  else c.drawImage(hair, -HOX, -HOY);
  c.save(); c.scale(H, H);
  faceFx(c, d, t, hit);
  c.restore();
  d.overHead?.(c, f);
  c.restore();
  d.front?.(c, f);
  c.restore();

  // (his boot: up from under, fast; it stays a beat, lifting him, then drops away)
  const bk = clamp((t - OPEN) / (CLOSE_HIT - OPEN));
  const by = hit < 0 ? lerp(PANEL_H + 140, crotchY + 2, bk * bk) : hit < 5 ? crotchY + 2 : crotchY + 2 + (hit - 5) * (hit - 5) * 3;
  if (by - 34 < PANEL_H) drawKick(c, feetX, by, t);

  // (the impact: the star, ring lines, the word)
  if (hit >= 0 && hit < 12) impactStar(c, feetX, crotchY - 4, (hit < 3 ? (hit + 1) / 3 : 1 - (hit - 3) / 9) * 64);
  if (hit >= 0 && hit < 20) {
    c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = 'round';
    for (let k = 0; k < 3; k++) { const rr = 40 + k * 16 + hit * 4; for (const s of [-1, 1]) { c.beginPath(); c.arc(feetX, crotchY, rr, s > 0 ? -0.5 : Math.PI - 0.5 + 0, s > 0 ? 0.5 : Math.PI + 0.5); c.stroke(); } }
    c.lineCap = 'butt';
  }
  if (hit >= 1 && hit < 30) {
    const sz = 26 * Math.min(1, hit / 3) * (1 + Math.max(0, 5 - hit) * 0.08);
    shout(c, d.bang, feetX - d.fall * 130, crotchY - 36 - hit * 0.6, sz, d.bangCol, -0.15 * d.fall);
  }
  // (the wheeze: a squeak of H's climbing off his mouth, each higher, smaller)
  const sq = d.squeak ?? 'HHHHHHHH';
  if (hit >= 10 && hit < 40) {
    const n = Math.min(sq.length, Math.floor((hit - 10) / 2) + 1);
    const wx = ox + hx + 20 * H, wy = oy + hy + my * H;
    c.font = FONT(14); c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < n; i++) {
      const sz = Math.max(7, 15 - i * 1.1), lx = wx + i * (sz + 3), ly = wy - 6 - i * 7 + Math.sin(hit * 1.7 + i) * 1.2;
      c.font = FONT(Math.round(sz));
      c.fillStyle = INK; c.fillText(sq[i], lx + 2, ly + 2); c.fillStyle = '#F5D0FE'; c.fillText(sq[i], lx, ly);
    }
  }
  // (down: the THUD, dust, the birds round his head)
  if (hit >= 50) {
    const a = d.fall * 1.5, ca = Math.cos(a), sa = Math.sin(a);
    const headX = feetX + hx * ca - hy0 * sa, headY = Math.min(PANEL_H - 44, floor + hx * sa + hy0 * ca);
    const k = hit - 50;
    if (k < 22) {
      for (let i = 0; i < 9; i++) {
        const u = i / 8, dx = lerp(feetX, headX, u) + (rnd(i) - 0.5) * 20, r = 8 + k * 1.6 + rnd(i + 3) * 8;
        c.fillStyle = `rgba(226,220,236,${(0.85 * (1 - k / 22)).toFixed(2)})`; c.beginPath(); c.arc(dx, PANEL_H - 6 - k * 0.8 - rnd(i * 2) * 8, r, 0, Math.PI * 2); c.fill();
      }
    }
    if (k < 24) shout(c, 'THUD!', lerp(feetX, headX, 0.55), PANEL_H - 70 - k, Math.min(24, 10 + k * 4), '#FB923C', d.fall * 0.08);
    if (k > 2) {
      for (let i = 0; i < 3; i++) {
        const ba = hit * 0.16 + (i / 3) * Math.PI * 2, bx = headX + Math.cos(ba) * 54, byy = headY - 34 + Math.sin(ba) * 12;
        if (Math.sin(ba) < 0) bird(c, bx, byy, hit + i * 3, Math.cos(ba + Math.PI / 2) > 0 ? 1 : -1);
        else star(c, bx, byy, 6, i % 2 ? '#FFFFFF' : '#FDE047');
      }
      if ((hit >> 3) % 2 === 0) shout(c, 'TWEET', headX + 30, headY - 66, 9, '#FDE047');
    }
  }
};

/** The face's moving parts (head-local, the game's units, the context scaled): the eyes popping and crossing,
 *  bloodshot; the brows knotted up; the mouth (his own before; an O, the wheeze, the tongue after); sweat flying. */
const faceFx = (c: Ctx, d: PunditCU, t: number, hit: number) => {
  const [mx, my] = d.mouth;
  const pop = hit < 0 ? 0 : Math.min(1, hit / 3) * (1 + (hit < 10 ? 0.22 * Math.sin(hit * 1.4) : 0));
  const r0 = d.eyeR, r = r0 * (1 + 1.25 * pop), cross = clamp((hit - 3) / 6);
  const look = hit < 0 && t > 9 ? 1 : 0;
  for (let i = 0; i < 2; i++) {
    const [ex, ey0] = d.eyes[i], ey = ey0 - pop * 2.5, nose = i === 0 ? 1 : -1;
    c.fillStyle = INK; c.beginPath(); c.ellipse(ex, ey, r + 0.8, r * 1.12 + 0.8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = hit > 2 ? '#FFF1F1' : '#FFFFFF'; c.beginPath(); c.ellipse(ex, ey, r, r * 1.12, 0, 0, Math.PI * 2); c.fill();
    if (hit > 1) {
      c.strokeStyle = '#DC2626'; c.lineWidth = 0.35; c.beginPath();
      for (let k = 0; k < 6; k++) { const a = rnd(k + i * 7) * Math.PI * 2, rr = r * 0.98; c.moveTo(ex + Math.cos(a) * rr, ey + Math.sin(a) * rr * 1.1); const m = 0.62 + rnd(k * 3 + i) * 0.1; c.lineTo(ex + Math.cos(a + 0.25) * rr * m, ey + Math.sin(a + 0.25) * rr * m); c.lineTo(ex + Math.cos(a + 0.05) * rr * 0.45, ey + Math.sin(a + 0.05) * rr * 0.45); }
      c.stroke();
    }
    const pr = hit < 0 ? r0 * 0.5 : lerp(r0 * 0.5, r0 * 0.3, cross);
    const ppx = ex + nose * cross * r * 0.55 + (hit < 0 ? 0.6 : 0), ppy = ey + look * r0 * 0.45 + (hit >= 0 ? r * 0.08 : 0);
    c.fillStyle = INK; c.beginPath(); c.arc(ppx, ppy, pr, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFFFFF'; c.fillRect(ppx - pr * 0.2, ppy - pr * 0.7, Math.max(0.5, pr * 0.4), Math.max(0.5, pr * 0.4));
    // (the brow: flat before, knotted up in the middle after)
    c.strokeStyle = d.brow; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath();
    if (hit < 0) { c.moveTo(ex - r0 - 0.5, d.browY); c.lineTo(ex + r0 + 0.5, d.browY - 0.6); }
    else { const by = ey - r * 1.12 - 1.4; c.moveTo(ex - nose * (r + 0.5), by + 0.6); c.lineTo(ex + nose * (r * 0.7), by - 2.4 - Math.sin(hit * 0.6) * 0.4); }
    c.stroke(); c.lineCap = 'butt';
  }
  if (d.glasses) {
    // (his glasses jump on the hit and sit crooked after; the eyes bulge past the lenses)
    const gy = hit < 0 ? 0 : hit < 6 ? -3 * Math.sin((hit / 6) * Math.PI) - 1 : -1, tilt = hit >= 6 ? 0.12 : 0;
    const ly = d.eyes[0][1];
    c.save(); c.translate(0, ly + gy); c.rotate(tilt);
    for (const [ex] of d.eyes) { c.beginPath(); c.roundRect(ex - 5, -4, 10, 8, 2); c.fillStyle = 'rgba(219,234,254,0.3)'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(ex - 4, -3, 3, 1); }
    c.beginPath(); c.moveTo(d.eyes[0][0] + 5, 0); c.lineTo(d.eyes[1][0] - 5, 0); c.stroke();
    c.restore();
  }
  // (the mouth)
  if (hit < 0) d.mouthPre(c, t);
  else if (hit < 8) {
    // (the shock: a howling O, the teeth, the tongue)
    const o = Math.min(1, (hit + 1) / 3);
    flat(c, () => c.ellipse(mx, my + 1, 5.5 * o + 1, 7 * o + 1, 0, 0, Math.PI * 2), '#5A0E14', 1.4);
    px(c, mx - 4 * o, my - 5 * o, 8 * o, 1.6, '#FFFFFF');
    c.fillStyle = '#E25A78'; c.beginPath(); c.ellipse(mx, my + 1 + 5 * o, 3.6 * o, 2 * o + 0.3, 0, 0, Math.PI * 2); c.fill();
  } else if (hit < 34) {
    // (the wheeze: lips pursed to a little O, quivering)
    const q = 1.6 + Math.sin(hit * 1.3) * 0.5;
    flat(c, () => c.ellipse(mx, my, q + 1.6, q + 2.2, 0, 0, Math.PI * 2), '#C8344A', 1.2);
    flat(c, () => c.ellipse(mx, my, q * 0.6, q * 0.9, 0, 0, Math.PI * 2), '#3A0810', 0);
  } else {
    // (slack, the tongue lolled out)
    const lol = Math.min(9, (hit - 34) * 0.6);
    flat(c, () => c.ellipse(mx, my + 1, 5, 3.5, 0, 0, Math.PI * 2), '#5A0E14', 1.4);
    flat(c, () => c.roundRect(mx - 3.2, my + 1, 6.4, 3 + lol, [1, 1, 3.2, 3.2]), '#EC6A8C', 1.1);
    c.strokeStyle = '#B83A5A'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(mx, my + 2); c.lineTo(mx, my + 1 + lol); c.stroke();
  }
  // (sweat flying off)
  if (hit > 4) {
    for (let i = 0; i < 6; i++) {
      const ph = ((hit * 1.4 + i * 11) % 26) / 26, s = i % 2 ? 1 : -1, a = -1.2 - rnd(i) * 0.9;
      const sx = s * (16 + ph * 16 + Math.cos(a) * 2), sy = -10 + Math.sin(a) * 14 * ph + ph * ph * 22;
      flat(c, () => { c.moveTo(sx, sy - 2.6); c.quadraticCurveTo(sx + 2, sy + 0.8, sx, sy + 1.8); c.quadraticCurveTo(sx - 2, sy + 0.8, sx, sy - 2.6); c.closePath(); }, '#93C5FD', 0.6);
    }
  }
};
