// Sillyville Square's cast, drawn (the SNES pass, on Spooky Land's person drawer, costume.ts: every part in stepped
// ramps, lit down its left and shaded down its right, dithered where the steps meet, inked; whoever's in the costume
// shows: their skin, build and face, man or woman). Each seeded: no two the same. Each drawn hurt (eyes shut), knocked
// about (held, flung, dazed) and dead (limp, crossed-out eyes), so the engine's special deaths all play out on their
// real sprites; and dead, the costume gives (the cat's hat rolled off, the Whatsit's wig off, the vendor's balloons
// away, the painter's beret, the mascot's frosted head come off: the sweaty performer underneath). Feet at the origin,
// facing right (the engine mirrors them). The frames painted once into a stamp (the mascot's too, by pose and walk
// frame: live only while he's tumbling, his googly pupils and his candle's flame live over it).
//
//   hatcat     a plum cat suit with a white bib and mitts, the performer's own face with whiskers painted on and cat ears
//              on a band, a tall teal-and-white striped stovepipe hat (its stripes stepped round it, the brim lit), an
//              orange bow tie, a furled red umbrella with its strap and J-handle (lifted hat: the tell; bareheaded while
//              the hat's out)
//   whatsit    a red jumpsuit (zip, pocket, cuffs), a huge blue fright wig in stepped curls, the number in a white circle
//              on the chest (1 or 2), the kite's string in a fist (crouched: the tell; leaning into the dash; dizzy
//              after)
//   vendor     a red-and-white striped vest (the stripes shaded round him), a bow tie, a straw boater with its weave and
//              red band, the balloon bunch glossy on its strings over his head (twisting a long balloon: the tell)
//   painter    a paint-spattered smock with a pocket of brushes, a beret, a palette on the far thumb, a brush (dipping
//              it: the tell)
//   mascot     CAPTAIN SPRINKLES: a pleated paper-cup body (its pleats in steps, a scalloped rim), a frosting-swirl head
//              in three stepped tiers with sprinkles and googly eyes, a lit candle on top (striped, dripping wax), the
//              performer's wide eyes in the mouth hole (vibrating: the tell; arms up in a leap; slumped in the crash,
//              the candle out). Dead, laid out on his side: the cup tipped over, the stumpy legs up, the head rolled
//              off, the performer's own sweaty head out of the cup's top
//   balloondog three twisted balloons' worth of dog, glossy, the twists pinched in, the knot at its tail

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, ball, limb, dither,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';
import { lookOf } from '../../adventure/temple/people';
import { stamp } from '../../../m1/game/render/stamp';

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

const SUIT = '#5B4A78', BIB = '#F8F4EC', TEAL = '#14B8A6';
/** The stovepipe hat, its foot at (x, y) (tilted a): the crown stepped round, its teal stripes shaded with it, the
 *  brim lit along its top, a shine down the left. */
export const stovepipe = (g: Ctx, x: number, y: number, a = 0, h = 34) => {
  g.save(); g.translate(x, y); g.rotate(a);
  const crown = () => { g.moveTo(-9, -2); g.quadraticCurveTo(-11, -h / 2, -8, -h); g.quadraticCurveTo(0, -h - 2, 8, -h); g.quadraticCurveTo(11, -h / 2, 9, -2); g.closePath(); };
  part(g, crown, BIB, -11, -h - 2, 22, h);
  g.save(); g.beginPath(); crown(); g.clip();
  for (let k = 0; k < 4; k++) { const sy = -6 - k * (h / 4) - h / 8; px(g, -12, sy, 24, h / 8, TEAL); px(g, -12, sy, 6, h / 8, lt(TEAL, 0.3)); px(g, 3, sy, 4, h / 8, dk(TEAL, 0.26)); px(g, 7, sy, 5, h / 8, dk(TEAL, 0.48)); px(g, -12, sy, 24, 1, lt(TEAL, 0.4)); }
  px(g, -7, -h + 2, 2, h - 6, '#FFFFFF');
  g.restore();
  g.beginPath(); crown(); g.strokeStyle = INK; g.lineWidth = 1.3; g.stroke();
  partTop(g, () => g.ellipse(0, -1, 15, 3.4, 0, 0, Math.PI * 2), BIB, -15, -4.4, 30, 6.8, 1.2);
  px(g, -12, -3, 10, 1, '#FFFFFF');
  g.restore();
};
const umbrella = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  // (furled: a long red canopy tight round the shaft, its folds, the strap and its snap, the ferrule out front (pointy),
  // a J-handle back)
  part(g, () => { g.moveTo(-6, -3.4); g.lineTo(34, -2.2); g.lineTo(45, 0); g.lineTo(34, 2.2); g.lineTo(-6, 3.4); g.closePath(); }, '#E11D48', -6, -3.4, 51, 6.8, 1);
  for (const fx of [4, 14, 24]) { px(g, fx, -2, 7, 1, dk('#E11D48', 0.35)); px(g, fx + 2, 1, 6, 1, lt('#E11D48', 0.25)); }
  px(g, 18, -3, 3, 6, '#3A1A2A'); px(g, 18, -3, 1, 6, '#6A3A4A'); px(g, 19, -1, 1, 1, '#E8E4F0');
  px(g, 45, -0.7, 7, 1.4, '#E7E5E4'); px(g, 45, -0.7, 7, 0.6, '#FFFFFF');
  g.strokeStyle = INK; g.lineWidth = 3.2; g.beginPath(); g.moveTo(-6, 0); g.lineTo(-12, 0); g.arc(-12, 4, 4, -Math.PI / 2, Math.PI / 2, true); g.stroke();
  g.strokeStyle = '#7C2D12'; g.lineWidth = 1.6; g.stroke();
  g.strokeStyle = '#B45A2A'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(-6, -0.6); g.lineTo(-12, -0.6); g.stroke();
  g.restore();
};
const paintHatCat = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr);
  const wind = F.pose === 'tell', jab = F.pose === 'strike', hatless = F.v === 'nohat';
  legs(g, B, { col: SUIT, shoe: 'paw', shoeCol: BIB });
  const H = handsAt(B, F, wind ? [B.hx - 4, B.hy - 28] : [-B.w / 2 - 5, B.shY + 16], jab ? [B.w / 2 + 20, B.shY + 12] : [B.w / 2 + 7, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: SUIT, hand: BIB });
  // (the tail: a long curl out behind, stepped, a white tip)
  limb(g, -B.hipW / 2, B.hipY + 2, -B.hipW / 2 - 16, B.hipY - 6, 3.6, SUIT);
  limb(g, -B.hipW / 2 - 16, B.hipY - 6, -B.hipW / 2 - 12, B.hipY - 24, 3.4, SUIT);
  ball(g, -B.hipW / 2 - 11, B.hipY - 26, 2.6, BIB, 1);
  torso(g, B, SUIT);
  part(g, () => g.ellipse(2, B.shY + 14, B.w * 0.28, 12, 0, 0, Math.PI * 2), BIB, 2 - B.w * 0.28, B.shY + 2, B.w * 0.56, 24, 1);
  for (let k = 0; k < 3; k++) ball(g, 2, B.shY + 10 + k * 6, 1.3, '#2A2440', 0.6);
  // (the bow tie: two stepped wings, the knot)
  part(g, () => { g.moveTo(-9, B.shY); g.lineTo(0, B.shY + 4); g.lineTo(-9, B.shY + 8); g.closePath(); }, '#F97316', -9, B.shY, 9, 8, 1);
  part(g, () => { g.moveTo(9, B.shY); g.lineTo(0, B.shY + 4); g.lineTo(9, B.shY + 8); g.closePath(); }, '#F97316', 0, B.shY, 9, 8, 1);
  ball(g, 0, B.shY + 4, 1.8, dk('#F97316', 0.2), 0.8);
  hairBack(g, B);
  face(g, B, F, wind ? 'smug' : jab ? 'angry' : 'smug', wind ? 'grin' : jab ? 'teeth' : 'smile');
  // (whiskers painted on, a black nose dot; cat ears on a band)
  px(g, B.hx + 5, B.hy + 1.5, 3, 2, INK);
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 0.8; g.beginPath(); g.moveTo(B.hx + 8, B.hy + 3); g.lineTo(B.hx + 15, B.hy + 3 + s * 2); g.stroke(); }
  glasses(g, B);
  hairTop(g, B);
  for (const s of [-1, 1]) { part(g, () => { g.moveTo(B.hx + s * 7 - 4, B.hy - 7); g.lineTo(B.hx + s * 9, B.hy - 16); g.lineTo(B.hx + s * 7 + 4, B.hy - 7); g.closePath(); }, SUIT, B.hx + s * 7 - 4, B.hy - 16, 8, 9, 1); px(g, B.hx + s * 8 - 1, B.hy - 12, 2, 4, '#F4A6C0'); }
  // (the hat: on, or lifted in the far hand (the tell), or off and gone (out flying), or rolled off dead)
  if (dead(F)) stovepipe(g, B.hx + 30, -2, 1.45, 30);
  else if (wind && !H.held) stovepipe(g, H.far[0] + 2, H.far[1] + 2, -0.5);
  else if (!hatless) stovepipe(g, B.hx, B.hy - 8, 0.05);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: SUIT, hand: BIB });
  if (!H.held) umbrella(g, H.near[0], H.near[1], jab ? 0 : wind ? 0.2 : 0.35);
};
export const drawHatCat = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['hatWind', 'jabWind'], ['jab']), (e as { hatless?: boolean }).hatless ? 'nohat' : '');
  putFrame(c, 'ct-hatcat2', F, BOX, g => paintHatCat(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The Whatsits

const JUMP = '#DC2626', WIG = '#2563EB';
const digit = (g: Ctx, n: number, x: number, y: number) => {
  // (a fat 1 or 2 in a white circle, stepped)
  ball(g, x, y, 6, '#FFFFFF', 1);
  g.fillStyle = INK;
  if (n === 1) { g.fillRect(x - 0.5, y - 4, 2, 8); g.fillRect(x - 2, y - 3, 2, 1.5); g.fillRect(x - 2, y + 3, 5, 1.5); }
  else { g.fillRect(x - 2.5, y - 4, 5, 1.5); g.fillRect(x + 1.5, y - 4, 1.5, 4); g.fillRect(x - 2.5, y - 0.5, 5, 1.5); g.fillRect(x - 2.5, y, 1.5, 4); g.fillRect(x - 2.5, y + 2.5, 5.5, 1.5); }
};
const fright = (g: Ctx, x: number, y: number, r: number) => {
  // (a fright wig: a big blue puff of curls, each stepped, the shade under it, a sheen up top)
  for (let k = 0; k < 8; k++) { const a = Math.PI + (k / 7) * Math.PI; ball(g, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.75, r * 0.45, k > 3 ? dk(WIG, 0.12) : WIG, 1); }
  ball(g, x, y - r * 0.3, r * 0.7, WIG, 1);
  for (let k = 0; k < 6; k++) { const a = Math.PI * 1.1 + k * 0.32; px(g, x + Math.cos(a) * r * 0.5, y - r * 0.3 + Math.sin(a) * r * 0.45, 2, 1, lt(WIG, 0.4)); }
  px(g, x - r * 0.5, y - r * 0.9, 3, 2, lt(WIG, 0.55));
  dither(g, x - r * 0.6, y + r * 0.1, r * 1.2, 2, dk(WIG, 0.4));
};
const paintWhatsit = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), n = F.v.startsWith('2') ? 2 : 1;
  const crouch = F.pose === 'tell', dash = F.pose === 'strike', dizzy = F.v.endsWith('z');
  g.save();
  if (crouch) { g.translate(0, 6); g.scale(1, 0.92); }
  if (dash) { g.translate(4, 0); g.rotate(0.2); }
  legs(g, B, { col: JUMP, shoe: 'sneaker', shoeCol: '#F8FAFC', detail: (g2, _h, knee, _f, near) => { if (near) px(g2, knee[0] - 3, knee[1] + 8, 6, 1, dk(JUMP, 0.4)); } });
  const H = handsAt(B, F, dash ? [-B.w / 2 - 12, B.shY + 4] : [-B.w / 2 - 4, B.shY + 18], dash ? [B.w / 2 + 14, B.shY + 4] : [B.w / 2 + 8, B.shY - 4]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: JUMP, hand: B.L.skin, len: 0.85 });
  torso(g, B, JUMP);
  // (the zip down the front, a pocket, the belt seam)
  px(g, -1, B.shY + 3, 1, B.hipY - B.shY - 2, dk(JUMP, 0.45)); px(g, -1, B.shY + 3, 2, 2, '#D8D8E0');
  px(g, B.w / 2 - 9, B.hipY - 12, 6, 5, dk(JUMP, 0.2)); px(g, B.w / 2 - 9, B.hipY - 12, 6, 1, lt(JUMP, 0.2));
  digit(g, n, -6, B.shY + 12);
  px(g, -B.w / 2 + 2, B.hipY - 1, B.w - 4, 2, dk(JUMP, 0.3));
  face(g, B, F, crouch ? 'wide' : dizzy ? 'tired' : 'wide', crouch ? 'grin' : dash ? 'teeth' : 'grin');
  whiskers(g, B); glasses(g, B);
  if (dead(F)) {
    // (dead: the wig's come off, lying by him; their own hair (or none) under it)
    hairTop(g, B);
    g.save(); g.translate(B.hx + 32, -6); fright(g, 0, 0, 9); g.restore();
  } else fright(g, B.hx, B.hy - 4, 13);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: JUMP, hand: B.L.skin, len: 0.85 });
  g.restore();
};
export const drawWhatsit = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const n = (e.variant ?? 1) === 2 ? '2' : '1';
  const F = frameFor(e, f, seed, poseOf(e, ['crouch'], ['dash']), n + (e.aiState === 'dizzy' ? 'z' : ''));
  putFrame(c, 'ct-whatsit2', F, BOX, g => paintWhatsit(g, F));
  // (dizzy: birdies round the wig)
  if (e.aiState === 'dizzy' && e.health > 0) {
    for (let i = 0; i < 3; i++) { const a = f * 0.2 + (i / 3) * Math.PI * 2, bx = Math.round(Math.cos(a) * 14), by = -84 + Math.round(Math.sin(a) * 4); c.fillStyle = INK; c.fillRect(bx - 3, by - 2, 7, 5); c.fillStyle = '#FDE047'; c.fillRect(bx - 2, by - 1, 5, 3); c.fillStyle = '#FFF6B0'; c.fillRect(bx - 2, by - 1, 2, 1); c.fillStyle = '#F97316'; c.fillRect(bx + 3, by, 2, 1); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The balloon vendor

const balloon = (g: Ctx, x: number, y: number, col: string, sx: number, sy: number) => {
  g.strokeStyle = '#E7E5E4'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y + 9); g.quadraticCurveTo((x + sx) / 2 + 3, (y + sy) / 2, sx, sy); g.stroke();
  part(g, () => g.ellipse(x, y, 7, 9, 0, 0, Math.PI * 2), col, x - 7, y - 9, 14, 18, 1);
  px(g, x - 4, y - 6, 2, 4, '#FFFFFF'); px(g, x - 2, y - 7, 1, 1, '#FFFFFF');
  px(g, x - 1.5, y + 9, 3, 2, dk(col, 0.25));
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
  const path = torso(g, B, '#F8FAFC');
  // (the striped vest over the shirt: its stripes shaded round him with the body, an opening down the front, buttons)
  g.save(); g.beginPath(); path(); g.clip();
  for (let k = -B.w / 2 - 2; k < B.w / 2 + 2; k += 6) { const u = (k + B.w / 2) / B.w; px(g, k, B.shY + 2, 3, B.hipY - B.shY + 2, u < 0.25 ? lt('#DC2626', 0.18) : u > 0.68 ? dk('#DC2626', 0.3) : '#DC2626'); }
  px(g, B.w * 0.18, B.shY, B.w, B.hipY - B.shY + 4, 'rgba(26,16,40,0.14)');
  g.restore();
  px(g, -2, B.shY + 2, 4, B.hipY - B.shY + 2, '#F8FAFC'); px(g, 1, B.shY + 2, 1, B.hipY - B.shY + 2, '#D8D8E0');
  for (let k = 0; k < 3; k++) px(g, 2, B.shY + 8 + k * 7, 2, 2, '#F2C84A');
  part(g, () => { g.moveTo(-6, B.shY); g.lineTo(0, B.shY + 3); g.lineTo(-6, B.shY + 6); g.closePath(); g.moveTo(6, B.shY); g.lineTo(0, B.shY + 3); g.lineTo(6, B.shY + 6); g.closePath(); }, '#1E3A8A', -6, B.shY, 12, 6, 0.8);
  hairBack(g, B);
  face(g, B, F, twist ? 'smug' : kick ? 'angry' : 'open', twist ? 'smirk' : kick ? 'teeth' : 'smile');
  whiskers(g, B); glasses(g, B);
  // (the boater: straw in steps, its weave, a red band; dead: knocked off by him)
  const boater = (x: number, y: number, a: number) => {
    g.save(); g.translate(x, y); g.rotate(a);
    partTop(g, () => g.ellipse(0, 0, 14, 3, 0, 0, Math.PI * 2), '#EAB308', -14, -3, 28, 6, 1);
    part(g, () => g.rect(-8, -8, 16, 8), '#EAB308', -8, -8, 16, 8, 1);
    for (let k = -7; k < 8; k += 3) px(g, k, -7, 1, 4, dk('#EAB308', 0.2));
    px(g, -8, -4, 16, 3, '#DC2626'); px(g, -8, -4, 16, 1, lt('#DC2626', 0.3));
    g.restore();
  };
  if (dead(F)) { hairTop(g, B); boater(B.hx + 30, -4, 0.3); } else boater(B.hx, B.hy - 8, -0.05);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#F8FAFC', hand: L.skin });
  // (twisting: a long squeaky balloon between his fists, glossy)
  if (twist && !H.held) { g.save(); g.translate(H.near[0] - 6, H.near[1] - 4); g.rotate(-0.7 + (F.fr % 2) * 0.2); const col = pickOf(F.seed, 9, DOG_COLORS); part(g, () => g.roundRect(-14, -3, 28, 6, 3), col, -14, -3, 28, 6, 1); px(g, -10, -2, 8, 1, '#FFFFFF'); px(g, 1, -3, 1, 6, dk(col, 0.35)); g.restore(); }
};
export const drawVendor = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['twist', 'kickWind'], ['kick']));
  putFrame(c, 'ct-vendor2', F, BOX, g => paintVendor(g, F));
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
  // (the palette on the far thumb: a kidney of wood, its thumb hole, blobs of paint (each with a shine))
  if (!H.held) {
    part(g, () => g.ellipse(H.far[0] - 4, H.far[1] - 2, 11, 7, -0.2, 0, Math.PI * 2), '#D6A35C', H.far[0] - 15, H.far[1] - 9, 22, 14, 1);
    px(g, H.far[0] + 1, H.far[1] - 1, 3, 3, dk('#D6A35C', 0.5));
    for (const [dx, dy, col] of [[-10, -4, '#EF4444'], [-5, -7, '#FDE047'], [1, -6, '#3B82F6'], [3, -1, '#22C55E']] as [number, number, string][]) { px(g, H.far[0] + dx, H.far[1] + dy, 3, 3, col); px(g, H.far[0] + dx, H.far[1] + dy, 1, 1, '#FFFFFF'); px(g, H.far[0] + dx + 2, H.far[1] + dy + 2, 1, 1, dk(col, 0.35)); }
  }
  // (the smock, down to the knees, spattered; a pocket of brushes)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(B.w / 2, B.shY + 2); g.lineTo(B.w / 2 + 5, -18); g.lineTo(-B.w / 2 - 5, -18); g.closePath(); }, SMOCK, -B.w / 2 - 5, B.shY + 2, B.w + 10, -20 - B.shY);
  const spots = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#EC4899'];
  for (let k = 0; k < 9; k++) { const sx = -B.w / 2 + ((k * 11 + F.seed) % (B.w - 2)), sy = B.shY + 6 + ((k * 13 + F.seed * 3) % 34), col = spots[((Math.floor(k + F.seed) % 5) + 5) % 5]; px(g, sx, sy, 3, 2, col); px(g, sx + 1, sy + 2, 1, 2, col); }
  px(g, B.w / 2 - 10, B.hipY - 4, 8, 7, dk(SMOCK, 0.12)); px(g, B.w / 2 - 10, B.hipY - 4, 8, 1, dk(SMOCK, 0.3));
  for (let k = 0; k < 3; k++) { px(g, B.w / 2 - 9 + k * 3, B.hipY - 12, 1, 9, '#92400E'); px(g, B.w / 2 - 9 + k * 3, B.hipY - 13, 1, 2, spots[(k + 2) % 5]); }
  hairBack(g, B);
  face(g, B, F, dip ? 'smug' : smear ? 'angry' : 'open', dip ? 'smirk' : smear ? 'teeth' : 'smile');
  whiskers(g, B); glasses(g, B);
  // (a butterfly painted on their own cheek, the beret (dead: off))
  px(g, B.hx - 4, B.hy + 2, 2, 2, '#EC4899'); px(g, B.hx - 2, B.hy + 2, 2, 2, '#3B82F6'); px(g, B.hx - 3, B.hy + 2, 1, 3, INK);
  const beret = (x: number, y: number, a: number) => { g.save(); g.translate(x, y); g.rotate(a); partTop(g, () => g.ellipse(0, 0, 12, 5, 0, 0, Math.PI * 2), '#BE123C', -12, -5, 24, 10, 1); px(g, -1, -7, 2, 3, INK); px(g, -9, -2, 6, 1, lt('#BE123C', 0.35)); g.restore(); };
  if (dead(F)) { hairTop(g, B); beret(B.hx + 28, -3, 0.2); } else { hairTop(g, B); beret(B.hx - 1, B.hy - 9, -0.25); }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: SMOCK, hand: L.skin });
  // (the brush: its handle stepped, the ferrule, its tip loaded)
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(dip ? 2.4 : smear ? 0.1 : -0.8);
    part(g, () => g.rect(-2, -1.5, 14, 3), '#92400E', -2, -1.5, 14, 3, 0.8);
    part(g, () => g.rect(12, -1.8, 4, 3.6), '#C8C8D0', 12, -1.8, 4, 3.6, 0.6);
    const tip = spots[((Math.floor(F.seed + F.fr) % 5) + 5) % 5];
    part(g, () => { g.moveTo(16, -2); g.lineTo(23, 0); g.lineTo(16, 2); g.closePath(); }, tip, 16, -2, 7, 4, 0.8);
    g.restore();
  }
};
export const drawPainter = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['dip', 'smearWind'], ['smear']));
  putFrame(c, 'ct-painter2', F, BOX, g => paintPainter(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Captain Sprinkles (stamped by pose and walk frame; live while he's tumbling)

const seedOfE = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
/** A performer's face, small, sweaty, wide-eyed on sugar, in the mouth hole (or out of the cup, dead). */
const performer = (g: Ctx, seed: number, x: number, y: number, r: number, md: 'ok' | 'hurt' | 'dead', crash: boolean, own = false) => {
  const L = lookOf(seed);
  part(g, () => g.ellipse(x, y, r, r * 0.84, 0, 0, Math.PI * 2), L.skin, x - r, y - r, r * 2, r * 1.7, 1.2);
  if (own && !L.bald) { partTop(g, () => { g.moveTo(x - r, y - 1); g.quadraticCurveTo(x - r, y - r * 1.1, x, y - r * 0.95); g.quadraticCurveTo(x + r, y - r, x + r, y - 2); g.lineTo(x + 2, y - r * 0.5); g.closePath(); }, L.hair, x - r, y - r * 1.1, r * 2, r, 1); for (let k = 0; k < 3; k++) px(g, x - r + 2 + k * 3, y - r * 0.5, 1, 2, dk(L.hair, 0.3)); }
  if (md === 'dead') { for (const o of [-4, 3]) { px(g, x + o - 1, y - 3, 3, 1, INK); px(g, x + o, y - 4, 1, 3, INK); } }
  else if (md === 'hurt' || crash) { px(g, x - 5, y - 2, 3, 1, INK); px(g, x + 2, y - 2, 3, 1, INK); }
  else { for (const o of [-4, 3]) { px(g, x + o - 1, y - 5, 4, 4, '#FFFFFF'); px(g, x + o, y - 4, 2, 2, INK); px(g, x + o - 1, y - 6, 4, 1, dk(L.skin, 0.25)); } }
  px(g, x - 2, y + 2, 5, crash || md === 'dead' ? 1 : 3, INK); if (md === 'ok' && !crash) px(g, x - 1, y + 2, 3, 1, '#FFFFFF');
  px(g, x + r - 3, y - r * 0.4, 2, 3, '#BFE8FF'); px(g, x - r + 1, y, 2, 2, '#BFE8FF'); px(g, x + r - 3, y - r * 0.4, 1, 1, '#FFFFFF');
};
const SPRINKLES = ['#F472B6', '#FDE047', '#60A5FA', '#34D399', '#FB923C', '#FFFFFF'];
/** The frosted head: a swirl in three stepped tiers, sprinkles, googly eyes (their pupils drawn live: `look` null),
 *  the candle's wick and stick (its flame live). */
const frostedHead = (g: Ctx, x: number, y: number, k: number, frost: string, candle: 'lit' | 'out' | 'none', look: number | null, rot = 0) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  partTop(g, () => g.ellipse(0, 0, 30, 18, 0, 0, Math.PI * 2), frost, -30, -18, 60, 36, 1.4);
  partTop(g, () => g.ellipse(0, -14, 23, 13, 0, 0, Math.PI * 2), frost, -23, -27, 46, 26, 1.3);
  partTop(g, () => g.ellipse(2, -26, 14, 9, 0, 0, Math.PI * 2), frost, -12, -35, 28, 18, 1.2);
  // (the swirl's curl lines, the drips over the cup)
  g.strokeStyle = dk(frost, 0.22); g.lineWidth = 1; g.beginPath(); g.arc(-4, -10, 16, Math.PI * 0.1, Math.PI * 0.85); g.stroke(); g.beginPath(); g.arc(4, -22, 10, Math.PI * 0.1, Math.PI * 0.8); g.stroke();
  for (let i = 0; i < 18; i++) { const a = i * 2.4, rr = 6 + (i % 4) * 6, sx = Math.cos(a) * rr * 1.3, sy = -10 + Math.sin(a) * rr * 0.6 - (i % 3) * 6, col = SPRINKLES[i % SPRINKLES.length]; px(g, sx, sy, i % 2 ? 4 : 1.5, i % 2 ? 1.5 : 4, col); px(g, sx, sy, 1, 1, lt(col, 0.5)); }
  // (googly eyes, up top)
  for (const ex of [-9, 9]) { ball(g, ex, -12, 6, '#F8F8F0', 1); if (look !== null) { const a = look + ex; px(g, ex + Math.cos(a) * 2.5 - 1.6, -12 + Math.sin(a) * 2.5 - 1.6, 3.4, 3.4, INK); } }
  // (the candle: striped, wax dripping; the wick)
  if (candle !== 'none') {
    part(g, () => g.rect(-1, -52, 8, 20), '#F8FAFC', -1, -52, 8, 20, 1);
    for (let s = 0; s < 4; s++) { px(g, 0, -49 + s * 5, 6, 2, '#EF4444'); px(g, 4, -49 + s * 5, 2, 2, '#B91C1C'); }
    px(g, 0, -52, 2, 6, '#FFFFFF'); px(g, 6, -51, 2, 5, '#F8FAFC'); px(g, 7, -47, 1, 3, '#F8FAFC');
    px(g, 2.5, -56, 1, 4, INK);
  }
  g.restore();
};
/** The candle's flame (live), the head at (x, y) scaled k; or a curl of smoke when it's out. */
const flame = (c: Ctx, x: number, y: number, k: number, f: number, lit: boolean) => {
  if (lit) { const fl = Math.sin(f * 0.5) * 1.5; c.fillStyle = '#F97316'; c.beginPath(); c.ellipse(x + (3 + fl * 0.4) * k, y - 60 * k, 4 * k, 7 * k, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FDE047'; c.beginPath(); c.ellipse(x + (3 + fl * 0.4) * k, y - 59 * k, 2 * k, 4 * k, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(x + 2.5 * k), Math.round(y - 58 * k), 1, 2); }
  else { c.fillStyle = 'rgba(160,160,170,0.7)'; c.beginPath(); c.arc(x + 4 * k, y - (58 + (f % 20) * 0.6) * k, (2 + (f % 20) * 0.1) * k, 0, Math.PI * 2); c.fill(); }
};
/** The pleated paper cup (its body): flaring up from (bottom) to (top), stepped across, pleats, a scalloped rim. */
const cup = (g: Ctx, col: string, x0: number, yb: number, yt: number, wb: number, wt: number) => {
  const path = () => { g.moveTo(x0 - wb, yb); g.lineTo(x0 - wt, yt); g.lineTo(x0 + wt, yt); g.lineTo(x0 + wb, yb); g.closePath(); };
  part(g, path, col, x0 - wt, yt, wt * 2, yb - yt, 1.4);
  g.save(); g.beginPath(); path(); g.clip();
  for (let k = -wt; k <= wt; k += 8) { const kb = (k / wt) * wb; g.strokeStyle = dk(col, 0.3); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0 + kb, yb); g.lineTo(x0 + k, yt); g.stroke(); g.strokeStyle = lt(col, 0.3); g.lineWidth = 1; g.beginPath(); g.moveTo(x0 + kb - 2, yb); g.lineTo(x0 + k - 2.5, yt); g.stroke(); }
  g.restore();
  for (let k = -wt; k < wt; k += 8) { g.fillStyle = INK; g.beginPath(); g.arc(x0 + k + 4, yt, 5, 0, Math.PI); g.fill(); g.fillStyle = lt(col, 0.15); g.beginPath(); g.arc(x0 + k + 4, yt, 3.8, 0, Math.PI); g.fill(); }
};
export const drawMascot = (c: Ctx, e: Enemy, f: number) => {
  const r = reaction(e), md = r?.md ?? moodOf(e), isDead = md === 'dead';
  const seed = seedOfE(e);
  const CUP = ['#F9A8D4', '#93C5FD', '#C4B5FD'][((Math.floor(seed) % 3) + 3) % 3], FROST = ['#FBCFE8', '#FEF3C7', '#BFDBFE'][((Math.floor(seed >> 1) % 3) + 3) % 3];
  const crash = e.aiState === 'crash', rev = e.aiState === 'rev', air = e.aiState === 'leap';
  const pose = r?.pose ?? (rev ? 'tell' : moving(e));
  const isFlat = pose === 'limp' || (isDead && !r);
  const wf = pose === 'walk' ? Math.floor(f / 5) % 6 : 0, walk = pose === 'walk' ? Math.sin((wf / 6) * Math.PI * 2) * 5 : 0;
  const hurt = md === 'hurt';
  const paint = (g: Ctx) => {
    if (isFlat) {
      // (laid out on his side on the cobbles: the cup tipped over (its rim to the left), the stumpy legs up in the air,
      // the frosted head rolled off beside him, candle out, the performer's own sweaty head out of the cup's top)
      for (const [x1, y1, x2, y2] of [[28, -46, 38, -70], [32, -28, 52, -48]] as const) { limb(g, x1, y1, x2, y2, 12, '#F8FAFC'); for (let k = 0.2; k < 0.9; k += 0.3) px(g, x1 + (x2 - x1) * k - 5, y1 + (y2 - y1) * k - 1, 10, 2, '#EF4444'); part(g, () => g.ellipse(x2 + 2, y2 - 4, 7, 11, 0.5, 0, Math.PI * 2), '#7C3AED', x2 - 6, y2 - 15, 16, 22, 1.2); }
      // (the cup on its side: turned so its side lies flat along the ground)
      g.save(); g.translate(0, -30); g.rotate(-Math.PI / 2 + 0.16); cup(g, CUP, 0, 30, -26, 24, 33); g.restore();
      limb(g, -14, -14, -26, -4, 11, FROST); ball(g, -28, -5, 7, '#F8FAFC', 1.2);
      performer(g, seed, -42, -36, 9, 'dead', false, true);
      frostedHead(g, 70, -16, 0.72, FROST, 'out', 2.2, 1.2);
      return;
    }
    // (the legs: stubby, striped tights, big shoes; crashed: sat, out in front)
    if (crash) {
      limb(g, -12, -22, 10, -6, 12, '#F8FAFC'); limb(g, 10, -22, 30, -4, 12, '#F8FAFC');
      for (const [x1, y1, x2, y2] of [[-12, -22, 10, -6], [10, -22, 30, -4]] as const) for (let k = 0.25; k < 0.9; k += 0.3) px(g, x1 + (x2 - x1) * k - 2, y1 + (y2 - y1) * k - 4, 3, 8, '#EF4444');
      part(g, () => g.ellipse(14, -5, 11, 6, 0, 0, Math.PI * 2), '#7C3AED', 3, -11, 22, 12, 1.2); part(g, () => g.ellipse(34, -3, 11, 6, 0, 0, Math.PI * 2), '#7C3AED', 23, -9, 22, 12, 1.2);
    } else {
      limb(g, -12, -30, -14 - walk, -6, 12, '#F8FAFC'); limb(g, 12, -30, 14 + walk, -6, 12, '#F8FAFC');
      for (const [lx, yy] of [[-13 - walk / 2, -22], [13 + walk / 2, -22], [-13.5 - walk * 0.8, -14], [13.5 + walk * 0.8, -14]] as const) { px(g, lx - 6, yy, 12, 3, '#EF4444'); px(g, lx + 3, yy, 3, 3, '#B91C1C'); }
      part(g, () => g.ellipse(-12 - walk, -5, 12, 6, 0, 0, Math.PI * 2), dk('#7C3AED', 0.12), -24 - walk, -11, 24, 12, 1.2);
      part(g, () => g.ellipse(18 + walk, -5, 12, 6, 0, 0, Math.PI * 2), '#7C3AED', 6 + walk, -11, 24, 12, 1.2);
    }
    const sit = crash ? 18 : 0;
    // (the far arm: up in a leap, hanging in the crash, else out)
    const fx = air ? -40 : crash ? -38 : -34, fy = air ? -104 : crash ? -30 + sit * 0.4 : -44;
    limb(g, -26, -70 + sit, fx, fy, 11, dk(FROST, 0.1)); ball(g, fx, fy - 1, 8, '#F8FAFC', 1.2); px(g, fx - 3, fy - 5, 2, 2, '#FFFFFF');
    // (the cup)
    cup(g, CUP, 0, -24 + sit, -80 + sit, 26, 34);
    // (the head on top, the mouth hole, the performer's face in it)
    const hy = -96 + sit + (crash ? 6 : 0);
    frostedHead(g, 0, hy, 1, FROST, crash ? 'out' : 'lit', null);
    part(g, () => g.roundRect(-15, hy + 1, 32, 16, 5), '#2A1A2A', -15, hy + 1, 32, 16, 1.2);
    performer(g, seed, 1, hy + 9, 8, hurt ? 'hurt' : 'ok', crash);
    // (the near arm: waving, up in a leap, hanging in the crash)
    const nx = air ? 42 : crash ? 38 : 36 + (rev ? 4 : 0), ny = air ? -108 : crash ? -28 + sit * 0.4 : -52;
    limb(g, 26, -70 + sit, nx, ny, 11, FROST); ball(g, nx, ny, 8, '#F8FAFC', 1.2); px(g, nx - 3, ny - 4, 2, 2, '#FFFFFF');
  };
  // (stamped by its look while it's stood or laid flat; live while it's being flung about)
  const spin = pose === 'thrown' ? Math.sin(f * 0.6) * 0.3 : 0;
  c.save();
  if (rev) c.translate(f % 2 ? 1.5 : -1.5, 0);
  if (spin) { c.rotate(spin); paint(c); }
  else stamp(c, `ct-mascot2-${seed}-${pose}-${wf}-${md}-${crash ? 1 : 0}-${air ? 1 : 0}-${rev ? 1 : 0}-${isFlat ? 1 : 0}`, -100, -170, 220, 176, paint);
  // (live over it: the googly pupils rolling, the flame)
  if (!isFlat) {
    const sit = crash ? 18 : 0, hy = -96 + sit + (crash ? 6 : 0);
    for (const ex of [-9, 9]) { const a = f * 0.3 + ex; c.fillStyle = INK; c.fillRect(Math.round(ex + Math.cos(a) * 2.5 - 1.7), Math.round(hy - 12 + Math.sin(a) * 2.5 - 1.7), 3, 3); }
    flame(c, 0, hy, 1, f, !crash);
  }
  c.restore();
  // (the crash: Zs)
  if (crash && !isDead) { const t = f % 60; c.fillStyle = INK; c.font = '8px "Press Start 2P"'; c.fillText('Z', 14 + t * 0.3, -110 - t * 0.5); c.fillStyle = '#FFFFFF'; c.fillText('Z', 13 + t * 0.3, -111 - t * 0.5); }
};

// ---------------------------------------------------------------------------------------------------------------
// The balloon dog

export const drawBalloonDog = (c: Ctx, e: Enemy, f: number) => {
  const col = DOG_COLORS[(e.variant ?? 0) % DOG_COLORS.length], bob = Math.sin(f * 0.1 + (e.initialX || 0)) * 1.5;
  c.save(); c.translate(0, bob);
  stamp(c, `ct-bdog2-${col}`, -24, -40, 50, 60, g => {
    const sausage = (x: number, y: number, rx: number, ry: number, a = 0) => {
      g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, rx + 1.5, ry + 1.5, a, 0, Math.PI * 2); g.fill();
      g.fillStyle = dk(col, 0.25); g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); g.fill();
      g.fillStyle = col; g.beginPath(); g.ellipse(x - rx * 0.1, y - ry * 0.12, rx * 0.86, ry * 0.8, a, 0, Math.PI * 2); g.fill();
      g.fillStyle = lt(col, 0.3); g.beginPath(); g.ellipse(x - rx * 0.25, y - ry * 0.3, rx * 0.5, ry * 0.42, a, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(x - rx * 0.35, y - ry * 0.45, Math.max(0.6, rx * 0.22), Math.max(0.6, ry * 0.2), a, 0, Math.PI * 2); g.fill();
    };
    // (legs, body, tail, neck, head, snout, ears; the twists pinched in between them)
    sausage(-8, -4, 3, 5); sausage(8, -4, 3, 5);
    sausage(0, -11, 11, 4.5);
    sausage(-13, -16, 2.5, 5, -0.6);
    sausage(10, -18, 3, 6, 0.3);
    sausage(13, -24, 5, 4);
    sausage(19, -23, 4, 2.6);
    sausage(11, -30, 2.4, 4, -0.3); sausage(15, -30, 2.4, 4, 0.3);
    for (const [tx, ty] of [[-8, -8], [8, -8], [-11, -12], [10, -13], [12, -21], [17, -23]] as const) { g.fillStyle = dk(col, 0.45); g.fillRect(tx - 1, ty - 1, 2, 2); }
    g.fillStyle = INK; g.fillRect(14, -26, 2, 2); g.fillStyle = '#FFFFFF'; g.fillRect(14, -26, 1, 1);
    g.fillStyle = dk(col, 0.4); g.beginPath(); g.moveTo(-15, -21); g.lineTo(-17, -24); g.lineTo(-13, -23); g.closePath(); g.fill();
  });
  // (its string, dangling)
  c.strokeStyle = '#E7E5E4'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-14, -21); c.quadraticCurveTo(-18, -6 + Math.sin(f * 0.08) * 2, -12, 10); c.stroke();
  c.restore();
};
