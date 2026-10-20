// Sillyville Square's cast, drawn (a first pass: crude but clean, on Spooky Land's person drawer, costume.ts, so
// whoever's in the costume shows: their skin, build and face, man or woman). Each seeded: no two the same. Each drawn
// hurt (eyes shut), knocked about (held, flung, dazed) and dead (limp, crossed-out eyes), so the engine's special deaths
// all play out on their real sprites; and dead, the costume gives (the cat's hat rolled off, the Whatsit's wig off,
// the vendor's balloons away, the painter's beret, the mascot's frosted head come off: the sweaty performer
// underneath). Feet at the origin, facing right (the engine mirrors them). The people's frames painted once into a
// stamp; the mascot and the balloon dogs drawn as they go.
//
//   hatcat     a plum cat suit with a white bib and mitts, the performer's own face with whiskers painted on and cat ears
//              on a band, a tall teal-and-white striped stovepipe hat, an orange bow tie, a closed umbrella (lifted
//              hat: the tell; bareheaded while the hat's out)
//   whatsit    a red jumpsuit, a huge blue fright wig, the number in a white circle on the chest (1 or 2), the kite's
//              string in a fist (crouched: the tell; leaning into the dash; dizzy after)
//   vendor     a red-and-white striped vest, a straw boater, the balloon bunch on its strings over his head (twisting a
//              long balloon: the tell)
//   painter    a paint-spattered smock, a beret, a palette on the far thumb, a brush (dipping it: the tell)
//   mascot     CAPTAIN SPRINKLES: a pleated paper-cup body, a frosting-swirl head with sprinkles and googly eyes, a lit
//              candle on top, the performer's wide eyes in the mouth hole (vibrating: the tell; arms up in a leap;
//              slumped in the crash, the candle out)
//   balloondog three twisted balloons' worth of dog, shiny

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';
import { lookOf } from '../../adventure/temple/people';

/** The balloon dogs' colors (by variant). */
export const DOG_COLORS = ['#EF4444', '#3B82F6', '#FDE047', '#22C55E', '#EC4899'];

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, undefined, v);
};
const BOX: [number, number, number, number] = [-80, -160, 170, 164];
const face = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk') => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};
const handsAt = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};
const dead = (F: Frame) => F.md === 'dead';

// ---------------------------------------------------------------------------------------------------------------
// The hat cat

const SUIT = '#5B4A78', BIB = '#F8F4EC';
/** The stovepipe hat, its foot at (x, y) (tilted a). */
export const stovepipe = (g: Ctx, x: number, y: number, a = 0, h = 34) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-14, -3, 28, 5, 2), '#F8F4EC', -14, -3, 28, 5, 1.2);
  g.save(); g.beginPath(); g.moveTo(-9, -2); g.quadraticCurveTo(-11, -h / 2, -8, -h); g.lineTo(9, -h); g.quadraticCurveTo(11, -h / 2, 9, -2); g.closePath(); g.clip();
  g.fillStyle = '#F8F4EC'; g.fillRect(-12, -h - 2, 24, h + 2);
  g.fillStyle = '#14B8A6'; for (let k = 0; k < 4; k++) g.fillRect(-12, -6 - k * (h / 4) - h / 8, 24, h / 8);
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(4, -h - 2, 8, h + 2);
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-9, -2); g.quadraticCurveTo(-11, -h / 2, -8, -h); g.lineTo(9, -h); g.quadraticCurveTo(11, -h / 2, 9, -2); g.stroke();
  g.restore();
};
const umbrella = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  // (furled: a long red canopy tight round the shaft, the ferrule out front (pointy), a J-handle back)
  part(g, () => { g.moveTo(-6, -3); g.lineTo(34, -2); g.lineTo(44, 0); g.lineTo(34, 2); g.lineTo(-6, 3); g.closePath(); }, '#E11D48', -6, -3, 50, 6, 1);
  px(g, 44, -0.6, 7, 1.4, '#E7E5E4');
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-6, 0); g.lineTo(-12, 0); g.arc(-12, 4, 4, -Math.PI / 2, Math.PI / 2, true); g.stroke();
  g.strokeStyle = '#7C2D12'; g.lineWidth = 1.5; g.stroke();
  g.restore();
};
const paintHatCat = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr);
  const wind = F.pose === 'tell', jab = F.pose === 'strike', hatless = F.v === 'nohat';
  legs(g, B, { col: SUIT, shoe: 'paw', shoeCol: BIB });
  const H = handsAt(B, F, wind ? [B.hx - 4, B.hy - 28] : [-B.w / 2 - 5, B.shY + 16], jab ? [B.w / 2 + 20, B.shY + 12] : [B.w / 2 + 7, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: SUIT, hand: BIB });
  // (the tail: a long curl out behind)
  g.strokeStyle = INK; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-B.hipW / 2, B.hipY + 2); g.bezierCurveTo(-B.hipW / 2 - 22, B.hipY, -B.hipW / 2 - 20, B.hipY - 30, -B.hipW / 2 - 8, B.hipY - 26); g.stroke();
  g.strokeStyle = SUIT; g.lineWidth = 3.5; g.stroke();
  torso(g, B, SUIT);
  part(g, () => g.ellipse(2, B.shY + 14, B.w * 0.28, 12, 0, 0, Math.PI * 2), BIB, 2 - B.w * 0.28, B.shY + 2, B.w * 0.56, 24, 1);
  // (the bow tie)
  part(g, () => { g.moveTo(-8, B.shY + 1); g.lineTo(0, B.shY + 4); g.lineTo(-8, B.shY + 8); g.closePath(); g.moveTo(8, B.shY + 1); g.lineTo(0, B.shY + 4); g.lineTo(8, B.shY + 8); g.closePath(); }, '#F97316', -8, B.shY + 1, 16, 7, 1);
  hairBack(g, B);
  face(g, B, F, wind ? 'smug' : jab ? 'angry' : 'smug', wind ? 'grin' : jab ? 'teeth' : 'smile');
  // (whiskers painted on, a black nose dot; cat ears on a band)
  px(g, B.hx + 5, B.hy + 1.5, 3, 2, INK);
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 0.8; g.beginPath(); g.moveTo(B.hx + 8, B.hy + 3); g.lineTo(B.hx + 15, B.hy + 3 + s * 2); g.stroke(); }
  glasses(g, B);
  hairTop(g, B);
  for (const s of [-1, 1]) part(g, () => { g.moveTo(B.hx + s * 7 - 4, B.hy - 7); g.lineTo(B.hx + s * 9, B.hy - 16); g.lineTo(B.hx + s * 7 + 4, B.hy - 7); g.closePath(); }, SUIT, B.hx + s * 7 - 4, B.hy - 16, 8, 9, 1);
  // (the hat: on, or lifted in the far hand (the tell), or off and gone (out flying), or rolled off dead)
  if (dead(F)) stovepipe(g, B.hx + 30, -2, 1.45, 30);
  else if (wind && !H.held) stovepipe(g, H.far[0] + 2, H.far[1] + 2, -0.5);
  else if (!hatless) stovepipe(g, B.hx, B.hy - 8, 0.05);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: SUIT, hand: BIB });
  if (!H.held) umbrella(g, H.near[0], H.near[1], jab ? 0 : wind ? 0.2 : 0.35);
};
export const drawHatCat = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['hatWind', 'jabWind'], ['jab']), (e as { hatless?: boolean }).hatless ? 'nohat' : '');
  putFrame(c, 'ct-hatcat', F, BOX, g => paintHatCat(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The Whatsits

const JUMP = '#DC2626', WIG = '#2563EB';
const digit = (g: Ctx, n: number, x: number, y: number) => {
  // (a fat 1 or 2 in a white circle)
  part(g, () => g.arc(x, y, 6, 0, Math.PI * 2), '#FFFFFF', x - 6, y - 6, 12, 12, 1);
  g.fillStyle = INK;
  if (n === 1) { g.fillRect(x - 0.5, y - 4, 2, 8); g.fillRect(x - 2, y - 3, 2, 1.5); g.fillRect(x - 2, y + 3, 5, 1.5); }
  else { g.fillRect(x - 2.5, y - 4, 5, 1.5); g.fillRect(x + 1.5, y - 4, 1.5, 4); g.fillRect(x - 2.5, y - 0.5, 5, 1.5); g.fillRect(x - 2.5, y, 1.5, 4); g.fillRect(x - 2.5, y + 2.5, 5.5, 1.5); }
};
const fright = (g: Ctx, B: Body, x: number, y: number, r: number) => {
  // (a fright wig: a big blue puff of curls)
  for (let k = 0; k < 8; k++) { const a = Math.PI + (k / 7) * Math.PI; ball(g, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.75, r * 0.45, WIG, 1); }
  ball(g, x, y - r * 0.3, r * 0.7, WIG, 1);
  px(g, x - r * 0.5, y - r * 0.9, 3, 2, lt(WIG, 0.45));
  void B;
};
const paintWhatsit = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), n = F.v === '2' ? 2 : 1;
  const crouch = F.pose === 'tell', dash = F.pose === 'strike', dizzy = F.v.endsWith('z');
  g.save();
  if (crouch) { g.translate(0, 6); g.scale(1, 0.92); }
  if (dash) { g.translate(4, 0); g.rotate(0.2); }
  legs(g, B, { col: JUMP, shoe: 'sneaker', shoeCol: '#F8FAFC' });
  const H = handsAt(B, F, dash ? [-B.w / 2 - 12, B.shY + 4] : [-B.w / 2 - 4, B.shY + 18], dash ? [B.w / 2 + 14, B.shY + 4] : [B.w / 2 + 8, B.shY - 4]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: JUMP, hand: B.L.skin });
  torso(g, B, JUMP);
  digit(g, n, 1, B.shY + 12);
  px(g, -B.w / 2 + 2, B.hipY - 1, B.w - 4, 2, dk(JUMP, 0.3));
  face(g, B, F, crouch ? 'wide' : dizzy ? 'tired' : 'wide', crouch ? 'grin' : dash ? 'teeth' : 'grin');
  whiskers(g, B); glasses(g, B);
  if (dead(F)) {
    // (dead: the wig's come off, lying by him; their own hair (or none) under it)
    hairTop(g, B);
    g.save(); g.translate(B.hx + 32, -6); fright(g, B, 0, 0, 9); g.restore();
  } else fright(g, B, B.hx, B.hy - 4, 13);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: JUMP, hand: B.L.skin });
  g.restore();
};
export const drawWhatsit = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const n = (e.variant ?? 1) === 2 ? '2' : '1';
  const F = frameFor(e, f, seed, poseOf(e, ['crouch'], ['dash']), n + (e.aiState === 'dizzy' ? 'z' : ''));
  putFrame(c, 'ct-whatsit', F, BOX, g => paintWhatsit(g, F));
  // (dizzy: birdies round the wig)
  if (e.aiState === 'dizzy' && e.health > 0) {
    for (let i = 0; i < 3; i++) { const a = f * 0.2 + (i / 3) * Math.PI * 2; c.fillStyle = INK; c.fillRect(Math.round(Math.cos(a) * 14) - 2, -84 + Math.round(Math.sin(a) * 4) - 2, 5, 5); c.fillStyle = '#FDE047'; c.fillRect(Math.round(Math.cos(a) * 14) - 1, -84 + Math.round(Math.sin(a) * 4) - 1, 3, 3); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The balloon vendor

const balloon = (g: Ctx, x: number, y: number, col: string, sx: number, sy: number) => {
  g.strokeStyle = '#E7E5E4'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y + 9); g.quadraticCurveTo((x + sx) / 2 + 3, (y + sy) / 2, sx, sy); g.stroke();
  part(g, () => g.ellipse(x, y, 7, 9, 0, 0, Math.PI * 2), col, x - 7, y - 9, 14, 18, 1);
  px(g, x - 3, y - 5, 2, 3, '#FFFFFF');
  px(g, x - 1, y + 9, 2, 2, dk(col, 0.2));
};
const paintVendor = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const twist = F.pose === 'tell', kick = F.pose === 'strike';
  if (kick) { B.feet = [-6, 14]; B.lift = [0, 10]; }
  legs(g, B, { col: '#1F2937', shoe: 'shoe', shoeCol: '#3F2A14' });
  const H = handsAt(B, F, twist ? [B.w / 2 + 2, B.shY + 10] : [-B.w / 2 - 4, B.shY + 4], twist ? [B.w / 2 + 14, B.shY + 8] : [B.w / 2 + 6, B.shY + 18]);
  // (the bunch: on their strings from the far fist, up over his head; dead: they're away (none))
  if (!dead(F) && !H.held) {
    const fx = H.far[0], fy = H.far[1];
    const cols = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#EC4899', '#F97316'];
    for (let k = 0; k < 6; k++) balloon(g, fx - 16 + (k % 3) * 14 + (k > 2 ? 7 : 0), -128 + (k > 2 ? 16 : 0) + ((k * 7) % 5), pickOf(F.seed, k, cols), fx, fy);
  }
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#F8FAFC', hand: L.skin });
  torso(g, B, '#F8FAFC');
  // (the striped vest over the shirt)
  g.save(); g.beginPath(); g.rect(-B.w / 2, B.shY + 2, B.w, B.hipY - B.shY + 2); g.clip();
  for (let k = -B.w / 2; k < B.w / 2; k += 6) px(g, k, B.shY + 2, 3, B.hipY - B.shY + 2, '#DC2626');
  g.restore();
  px(g, -2, B.shY + 2, 4, B.hipY - B.shY + 2, '#F8FAFC');
  hairBack(g, B);
  face(g, B, F, twist ? 'smug' : kick ? 'angry' : 'open', twist ? 'smirk' : kick ? 'teeth' : 'smile');
  whiskers(g, B); glasses(g, B);
  // (the boater: straw, a red band; dead: knocked off by him)
  const boater = (x: number, y: number, a: number) => { g.save(); g.translate(x, y); g.rotate(a); part(g, () => g.ellipse(0, 0, 14, 3, 0, 0, Math.PI * 2), '#EAB308', -14, -3, 28, 6, 1); part(g, () => g.rect(-8, -8, 16, 8), '#EAB308', -8, -8, 16, 8, 1); px(g, -8, -4, 16, 3, '#DC2626'); g.restore(); };
  if (dead(F)) { hairTop(g, B); boater(B.hx + 30, -4, 0.3); } else boater(B.hx, B.hy - 8, -0.05);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#F8FAFC', hand: L.skin });
  // (twisting: a long squeaky balloon between his fists)
  if (twist && !H.held) { g.save(); g.translate(H.near[0] - 6, H.near[1] - 4); g.rotate(-0.7 + (F.fr % 2) * 0.2); part(g, () => g.roundRect(-14, -3, 28, 6, 3), pickOf(F.seed, 9, DOG_COLORS), -14, -3, 28, 6, 1); g.restore(); }
};
export const drawVendor = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['twist', 'kickWind'], ['kick']));
  putFrame(c, 'ct-vendor', F, BOX, g => paintVendor(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The face painter

const SMOCK = '#F1F5F9';
const paintPainter = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const dip = F.pose === 'tell', smear = F.pose === 'strike';
  legs(g, B, { col: '#334155', shoe: 'sneaker', shoeCol: '#7C3AED' });
  const H = handsAt(B, F, [-B.w / 2 - 2, B.shY + 14], dip ? [-B.w / 2 + 4, B.shY + 12] : smear ? [B.w / 2 + 18, B.shY + 4] : [B.w / 2 + 8, B.shY + 10]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: SMOCK, hand: L.skin });
  // (the palette on the far thumb: a kidney of wood, blobs of paint)
  if (!H.held) {
    part(g, () => g.ellipse(H.far[0] - 4, H.far[1] - 2, 11, 7, -0.2, 0, Math.PI * 2), '#D6A35C', H.far[0] - 15, H.far[1] - 9, 22, 14, 1);
    for (const [dx, dy, col] of [[-10, -4, '#EF4444'], [-5, -7, '#FDE047'], [1, -6, '#3B82F6'], [3, -1, '#22C55E']] as [number, number, string][]) px(g, H.far[0] + dx, H.far[1] + dy, 3, 3, col);
  }
  // (the smock, down to the knees, spattered)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(B.w / 2, B.shY + 2); g.lineTo(B.w / 2 + 5, -18); g.lineTo(-B.w / 2 - 5, -18); g.closePath(); }, SMOCK, -B.w / 2 - 5, B.shY + 2, B.w + 10, -20 - B.shY);
  const spots = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#EC4899'];
  for (let k = 0; k < 7; k++) px(g, -B.w / 2 + ((k * 11 + F.seed) % (B.w - 2)), B.shY + 6 + ((k * 13 + F.seed * 3) % 30), 3, 2, spots[(k + F.seed) % 5]);
  hairBack(g, B);
  face(g, B, F, dip ? 'smug' : smear ? 'angry' : 'open', dip ? 'smirk' : smear ? 'teeth' : 'smile');
  whiskers(g, B); glasses(g, B);
  // (a butterfly painted on their own cheek, the beret (dead: off))
  px(g, B.hx - 4, B.hy + 2, 2, 2, '#EC4899'); px(g, B.hx - 2, B.hy + 2, 2, 2, '#3B82F6');
  const beret = (x: number, y: number, a: number) => { g.save(); g.translate(x, y); g.rotate(a); part(g, () => g.ellipse(0, 0, 12, 5, 0, 0, Math.PI * 2), '#BE123C', -12, -5, 24, 10, 1); px(g, -1, -7, 2, 3, INK); g.restore(); };
  if (dead(F)) { hairTop(g, B); beret(B.hx + 28, -3, 0.2); } else { hairTop(g, B); beret(B.hx - 1, B.hy - 9, -0.25); }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: SMOCK, hand: L.skin });
  // (the brush, its tip loaded)
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(dip ? 2.4 : smear ? 0.1 : -0.8);
    part(g, () => g.rect(-2, -1.5, 18, 3), '#92400E', -2, -1.5, 18, 3, 0.8);
    part(g, () => { g.moveTo(16, -2); g.lineTo(22, 0); g.lineTo(16, 2); g.closePath(); }, spots[(F.seed + F.fr) % 5], 16, -2, 6, 4, 0.8);
    g.restore();
  }
};
export const drawPainter = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['dip', 'smearWind'], ['smear']));
  putFrame(c, 'ct-painter', F, BOX, g => paintPainter(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Captain Sprinkles (drawn as he goes)

const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const oval = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, rx + 1.5, ry + 1.5, rot, 0, Math.PI * 2); c.fill();
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); c.fill();
  c.fillStyle = lt(col, 0.3); c.beginPath(); c.ellipse(x - rx * 0.35, y - ry * 0.35, Math.max(0.5, rx * 0.4), Math.max(0.5, ry * 0.3), rot, 0, Math.PI * 2); c.fill();
};
const stub = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string) => {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
};
/** A performer's face, small, sweaty, wide-eyed on sugar, in the mouth hole. */
const performer = (c: Ctx, e: Enemy, x: number, y: number, r: number, md: 'ok' | 'hurt' | 'dead', crash: boolean) => {
  const L = lookOf(Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31);
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, r + 2, r * 0.8 + 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = L.skin; c.beginPath(); c.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); c.fill();
  if (md === 'dead') { box(c, x - 5, y - 3, 3, 1, INK); box(c, x - 4, y - 4, 1, 3, INK); box(c, x + 2, y - 3, 3, 1, INK); box(c, x + 3, y - 4, 1, 3, INK); }
  else if (md === 'hurt' || crash) { box(c, x - 5, y - 2, 3, 1, INK); box(c, x + 2, y - 2, 3, 1, INK); }
  else { box(c, x - 5, y - 5, 4, 4, '#FFFFFF'); box(c, x + 2, y - 5, 4, 4, '#FFFFFF'); box(c, x - 4, y - 4, 2, 2, INK); box(c, x + 3, y - 4, 2, 2, INK); }
  box(c, x - 2, y + 2, 5, crash ? 1 : 3, INK);
  box(c, x + r - 3, y - r * 0.4, 2, 3, '#BFE8FF');
};
const SPRINKLES = ['#F472B6', '#FDE047', '#60A5FA', '#34D399', '#FB923C', '#FFFFFF'];
/** The frosted head: a swirl in three tiers, sprinkles, googly eyes, the mouth hole; `candle` lit or out. */
const frostedHead = (c: Ctx, x: number, y: number, k: number, f: number, frost: string, candle: 'lit' | 'out' | 'none') => {
  c.save(); c.translate(x, y); c.scale(k, k);
  oval(c, 0, 0, 30, 18, frost); oval(c, 0, -14, 23, 13, frost); oval(c, 2, -26, 14, 9, frost);
  for (let i = 0; i < 16; i++) { const a = i * 2.4, rr = 6 + (i % 4) * 6; box(c, Math.cos(a) * rr * 1.3, -10 + Math.sin(a) * rr * 0.6 - (i % 3) * 6, 4, 1.5, SPRINKLES[i % SPRINKLES.length]); }
  // (googly eyes, up top, looking every way)
  for (const ex of [-9, 9]) { c.fillStyle = INK; c.beginPath(); c.arc(ex, -12, 6.5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(ex, -12, 5.5, 0, Math.PI * 2); c.fill(); const a = f * 0.3 + ex; c.fillStyle = INK; c.beginPath(); c.arc(ex + Math.cos(a) * 2.5, -12 + Math.sin(a) * 2.5, 2.4, 0, Math.PI * 2); c.fill(); }
  // (the candle: striped, the flame)
  if (candle !== 'none') {
    box(c, -1, -52, 8, 20, INK); box(c, 0, -51, 6, 19, '#F8FAFC');
    for (let s = 0; s < 4; s++) box(c, 0, -49 + s * 5, 6, 2, '#EF4444');
    if (candle === 'lit') { const fl = Math.sin(f * 0.5) * 1.5; c.fillStyle = '#F97316'; c.beginPath(); c.ellipse(3 + fl * 0.4, -58, 4, 7, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FDE047'; c.beginPath(); c.ellipse(3 + fl * 0.4, -57, 2, 4, 0, 0, Math.PI * 2); c.fill(); }
    else { c.fillStyle = 'rgba(160,160,170,0.7)'; c.beginPath(); c.arc(4, -58 - (f % 20) * 0.6, 2 + (f % 20) * 0.1, 0, Math.PI * 2); c.fill(); }
  }
  c.restore();
};
export const drawMascot = (c: Ctx, e: Enemy, f: number) => {
  const r = reaction(e), md = r?.md ?? moodOf(e), isDead = md === 'dead';
  const seed = Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
  const CUP = ['#F9A8D4', '#93C5FD', '#C4B5FD'][seed % 3], FROST = ['#FBCFE8', '#FEF3C7', '#BFDBFE'][(seed >> 1) % 3];
  const crash = e.aiState === 'crash', rev = e.aiState === 'rev', air = e.aiState === 'leap';
  const pose = r?.pose ?? (rev ? 'tell' : moving(e));
  const isFlat = pose === 'limp' || (isDead && !r);
  c.save();
  if (isFlat) { c.translate(0, -2); c.rotate(-Math.PI / 2 + 0.05); c.translate(-32, -10); }
  else if (pose === 'thrown') c.rotate(Math.sin(f * 0.6) * 0.3);
  if (rev) c.translate((f % 2 ? 1.5 : -1.5), 0);
  if (crash && !isDead) c.translate(0, 18);
  const walk = pose === 'walk' ? Math.sin(f * 0.4) * 5 : 0;
  // (the legs: stubby, striped tights, big shoes; crashed: sat, out in front)
  if (crash && !isDead) { stub(c, -12, -22, 10, -6, 13, '#F8FAFC'); stub(c, 10, -22, 30, -4, 13, '#F8FAFC'); oval(c, 14, -5, 11, 6, '#7C3AED'); oval(c, 34, -3, 11, 6, '#7C3AED'); }
  else {
    stub(c, -12, -30, -14 - walk, -6, 13, '#F8FAFC'); stub(c, 12, -30, 14 + walk, -6, 13, '#F8FAFC');
    for (const [lx, yy] of [[-13 - walk / 2, -18], [13 + walk / 2, -18]]) box(c, lx - 6, yy, 12, 3, '#EF4444');
    oval(c, -12 - walk, -5, 12, 6, '#7C3AED'); oval(c, 18 + walk, -5, 12, 6, '#7C3AED');
  }
  // (the far arm)
  const up = air;
  stub(c, -26, -70, up ? -40 : crash ? -38 : -34, up ? -104 : crash ? -30 : -44, 12, FROST); oval(c, up ? -40 : crash ? -38 : -34, up ? -106 : crash ? -28 : -42, 8, 8, '#F8FAFC');
  // (the cup: pleated paper, flaring up)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-26, -24); c.lineTo(-34, -80); c.lineTo(34, -80); c.lineTo(26, -24); c.closePath(); c.fill();
  c.fillStyle = CUP; c.beginPath(); c.moveTo(-24, -26); c.lineTo(-32, -78); c.lineTo(32, -78); c.lineTo(24, -26); c.closePath(); c.fill();
  for (let k = -24; k <= 24; k += 8) { c.strokeStyle = dk(CUP, 0.22); c.lineWidth = 2; c.beginPath(); c.moveTo(k * 0.78, -27); c.lineTo(k * 1.04, -77); c.stroke(); }
  c.fillStyle = lt(CUP, 0.35); c.beginPath(); c.moveTo(-22, -28); c.lineTo(-29, -76); c.lineTo(-22, -76); c.lineTo(-16, -28); c.closePath(); c.fill();
  // (the head: on top; dead: off, lying by him, and there's the performer's own head, small, on the big cup)
  if (isDead) {
    frostedHead(c, 52, -14, 0.8, f, FROST, 'out');
    performer(c, e, 0, -88, 9, 'dead', false);
    box(c, -8, -100, 16, 4, lookOf(seed).hair);
  } else {
    const hy = -96 + (crash ? 6 : 0);
    frostedHead(c, 0, hy, 1, f, FROST, crash ? 'out' : 'lit');
    // (the mouth hole, the performer's face in it)
    box(c, -14, hy + 2, 30, 14, INK);
    performer(c, e, 1, hy + 9, 8, md === 'hurt' ? 'hurt' : 'ok', crash);
  }
  // (the near arm: waving, up in a leap, hanging in the crash)
  const nx = up ? 42 : crash ? 38 : 36 + Math.sin(f * 0.5) * (rev ? 6 : 2), ny = up ? -108 : crash ? -28 : -52;
  stub(c, 26, -70, nx, ny, 12, FROST); oval(c, nx, ny, 8, 8, '#F8FAFC');
  c.restore();
  // (the sugar shakes: sprinkles off him; crashed: Zs)
  if (crash && !isDead) { const t = f % 60; c.fillStyle = INK; c.font = '8px "Press Start 2P"'; c.fillText('Z', 14 + t * 0.3, -110 - t * 0.5); }
};

// ---------------------------------------------------------------------------------------------------------------
// The balloon dog

export const drawBalloonDog = (c: Ctx, e: Enemy, f: number) => {
  const col = DOG_COLORS[(e.variant ?? 0) % DOG_COLORS.length], bob = Math.sin(f * 0.1 + (e.initialX || 0)) * 1.5;
  c.save(); c.translate(0, bob);
  const sausage = (x: number, y: number, rx: number, ry: number, a = 0) => {
    c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, rx + 1.5, ry + 1.5, a, 0, Math.PI * 2); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.ellipse(x - rx * 0.3, y - ry * 0.4, rx * 0.3, ry * 0.25, a, 0, Math.PI * 2); c.fill();
  };
  // (legs, body, tail, neck, head, snout, ears)
  sausage(-8, -4, 3, 5); sausage(8, -4, 3, 5);
  sausage(0, -11, 11, 4.5);
  sausage(-13, -16, 2.5, 5, -0.6);
  sausage(10, -18, 3, 6, 0.3);
  sausage(13, -24, 5, 4);
  sausage(19, -23, 4, 2.6);
  sausage(11, -30, 2.4, 4, -0.3); sausage(15, -30, 2.4, 4, 0.3);
  c.fillStyle = INK; c.fillRect(14, -26, 2, 2);
  // (its string, dangling)
  c.strokeStyle = '#E7E5E4'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -7); c.quadraticCurveTo(-4, 4, 2, 14); c.stroke();
  c.restore();
};
