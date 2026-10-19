// The backlot's people, drawn (peak SNES, on Spooky Land's person-in-a-costume drawer, costume.ts, so whoever's in the
// uniform shows: their skin, build, hair and face, man or woman; the clothes over them, every material in steps,
// inked round). Each is seeded: no two the same.
//   guide      the tour's khaki: a shirt with its pocket flaps and epaulettes, shorts or slacks, a lanyard and its badge,
//              a name tag; a visor, a pith helmet or a ponytail through a cap; shades on some; the red megaphone (its
//              white bell rim, the trigger grip), up to the mouth for the tell
//   cart       backlot security (a navy shirt and its star, a peaked cap, a cap or nothing, shades on some) sat in a
//              white golf cart: its tub in steps, the bench, the windshield, the striped canopy edge, the light bar on
//              the roof (going), the bumper, the wheels and hubcaps, SECURITY on its side
//   legionary  a centurion extra: a cardboard breastplate sprayed gold (its muscles drawn on, duct tape holding it), the
//              helmet's cheek guards and its crest (red or purple), the red tunic's strips, laced sandals, a wristwatch;
//              the spear (its shaft, its foil head) out in front, drawn back for the tell
//   cowboy     a cowboy extra: a ten-gallon hat (black, tan or white, its band), a bandana at the neck, a vest (a tin
//              star on some), the belt and its buckle, chaps with their fringe, boots and spurs; the lasso (a coil at
//              the hip, whirling overhead for the tell)
// Feet at the origin, facing right (the engine mirrors them). Each frame painted once into a stamp (putFrame).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Frame, type Body, INK, dk, lt, part, partTop, px, limb, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;
const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, undefined, v);
};
const BOX: [number, number, number, number] = [-60, -128, 132, 132];
/** The legionary's: wider out front, for the spear's head (it ran past BOX and was cut off but for the thrust: the
 *  playtest). */
const SPEAR_BOX: [number, number, number, number] = [-60, -128, 180, 132];

const ownHead = (g: Ctx, F: Frame, B: Body, eyes: 'open' | 'angry' | 'tired', mouth: 'flat' | 'teeth' | 'o' | 'frown') => {
  hairBack(g, B);
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
  whiskers(g, B); glasses(g, B);
};
/** Shades on the face (or pushed up: `up`). */
const shades = (g: Ctx, B: Body, up = false) => {
  const { hx, hy } = B, y = up ? hy - 10 : hy - 3;
  px(g, hx - 2, y, 13, 1, INK);
  part(g, () => g.roundRect(hx - 1, y, 5, 3, 1), '#1C1C24', hx - 1, y, 5, 3, 0.8); part(g, () => g.roundRect(hx + 5, y, 5, 3, 1), '#1C1C24', hx + 5, y, 5, 3, 0.8);
  px(g, hx, y + 1, 1, 1, '#9AB0D0'); px(g, hx + 6, y + 1, 1, 1, '#9AB0D0');
};
/** A cap (its button, its band's shade, the peak). */
const cap = (g: Ctx, B: Body, col: string) => {
  const { hx, hy } = B;
  partTop(g, () => { g.moveTo(hx - 9, hy - 3); g.quadraticCurveTo(hx - 8, hy - 15, hx + 1, hy - 14); g.quadraticCurveTo(hx + 10, hy - 13, hx + 10, hy - 4); g.closePath(); }, col, hx - 9, hy - 15, 19, 12, 1);
  px(g, hx, hy - 15, 2, 1, lt(col, 0.3)); px(g, hx - 8, hy - 5, 18, 1, dk(col, 0.25));
  part(g, () => g.roundRect(hx + 4, hy - 6, 13, 3, 1), dk(col, 0.2), hx + 4, hy - 6, 13, 3, 0.8); px(g, hx + 5, hy - 6, 10, 1, lt(col, 0.15));
};

// ---------------------------------------------------------------------------------------------------------------
// The tour guide

const paintGuide = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const khaki = pickOf(F.seed, 2, ['#C8B88A', '#BCAA7A', '#D2C49A']), shorts = F.seed % 3 !== 0;
  legs(g, B, { col: dk(khaki, 0.12), shoe: shorts ? 'sneaker' : 'shoe', shoeCol: shorts ? '#F5F5F4' : '#5A3A1E', bareBelow: shorts, detail: shorts ? (gg, h, k, ft, near) => { if (near) px(gg, k[0] - 3, k[1] - 2, 7, 2, dk(khaki, 0.3)); px(gg, ft[0] - 3, ft[1] - 4, 6, 2, '#F5F5F4'); } : undefined });
  const fl = flailHands(B, F.fr);
  const up = F.pose === 'tell' || F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : up ? [B.hx + 8, B.hy + 6] : [B.w / 2 + 3, B.shY + 18];
  arm(g, B, -1, far[0], far[1], { sleeve: dk(khaki, 0.08), hand: L.skin, len: 0.4 });
  torso(g, B, khaki);
  // (the shirt: its placket and buttons, the two pocket flaps, the epaulettes, the belt)
  px(g, 0, B.shY + 3, 1, B.hipY - B.shY - 3, dk(khaki, 0.3)); for (let y = B.shY + 7; y < B.hipY - 2; y += 6) px(g, 1, y, 1, 1, lt(khaki, 0.4));
  for (const s of [-1, 1]) { px(g, s < 0 ? -B.w / 2 + 4 : 3, B.shY + 7, 7, 5, dk(khaki, 0.12)); px(g, s < 0 ? -B.w / 2 + 4 : 3, B.shY + 7, 7, 1, dk(khaki, 0.35)); }
  px(g, -B.w / 2 + 1, B.shY + 1, 6, 2, dk(khaki, 0.25)); px(g, B.w / 2 - 7, B.shY + 1, 6, 2, dk(khaki, 0.25));
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 3, '#3A2414'); px(g, -2, B.hipY - 2, 4, 3, '#C8962E');
  // (the lanyard, the badge on it (HAPPYWOOD's red), the name tag)
  limb(g, -4, B.shY + 1, 0, B.shY + 16, 1.4, '#1D4ED8', false); limb(g, 6, B.shY + 1, 0, B.shY + 16, 1.4, '#1D4ED8', false);
  part(g, () => g.rect(-4, B.shY + 15, 8, 10), '#F8FAFC', -4, B.shY + 15, 8, 10, 0.8); px(g, -3, B.shY + 17, 6, 2, '#DC2626'); px(g, -3, B.shY + 21, 6, 1, '#78716C');
  px(g, B.w / 2 - 9, B.shY + 14, 6, 3, '#18181B'); px(g, B.w / 2 - 8, B.shY + 15, 4, 1, '#F8FAFC');
  const hat = F.seed % 4;
  ownHead(g, F, B, up ? 'angry' : 'open', F.pose === 'strike' ? 'o' : 'flat');
  if (hat === 0) {
    // (a green visor, its band)
    hairTop(g, B);
    part(g, () => { g.moveTo(B.hx - 9, B.hy - 7); g.lineTo(B.hx + 9, B.hy - 7); g.lineTo(B.hx + 17, B.hy - 3); g.lineTo(B.hx - 9, B.hy - 3); g.closePath(); }, '#15803D', B.hx - 9, B.hy - 7, 26, 4, 0.9);
    px(g, B.hx - 9, B.hy - 8, 19, 2, '#166534');
  } else if (hat === 1) {
    // (a pith helmet: the safari tour's)
    partTop(g, () => { g.moveTo(B.hx - 11, B.hy - 4); g.quadraticCurveTo(B.hx - 9, B.hy - 18, B.hx + 1, B.hy - 18); g.quadraticCurveTo(B.hx + 11, B.hy - 18, B.hx + 12, B.hy - 4); g.closePath(); }, '#E8DCB8', B.hx - 11, B.hy - 18, 23, 14, 1);
    part(g, () => g.roundRect(B.hx - 14, B.hy - 5, 30, 3, 1), '#D8CCA8', B.hx - 14, B.hy - 5, 30, 3, 0.9);
    px(g, B.hx - 10, B.hy - 8, 21, 2, '#8A6A3A');
  } else if (hat === 2) {
    // (a cap, the park's, a ponytail through the back on some)
    hairTop(g, B);
    if (L.woman || L.long) part(g, () => { g.moveTo(B.hx - 8, B.hy - 7); g.quadraticCurveTo(B.hx - 18, B.hy - 5, B.hx - 15, B.hy + 9); g.lineTo(B.hx - 11, B.hy + 8); g.quadraticCurveTo(B.hx - 12, B.hy - 2, B.hx - 6, B.hy - 3); g.closePath(); }, L.hair, B.hx - 18, B.hy - 8, 13, 18, 1);
    cap(g, B, '#B91C1C');
  } else hairTop(g, B);
  if (F.seed % 5 === 1) shades(g, B, hat === 3);
  arm(g, B, 1, near[0], near[1], { sleeve: khaki, hand: L.skin, len: 0.4 });
  // (the megaphone: red, its white bell rim, the grip and trigger; at the hip, or up at the mouth)
  if (!fl) {
    const mx = up ? B.hx + 10 : near[0], my = up ? B.hy + 4 : near[1] - 4;
    part(g, () => { g.moveTo(mx, my - 3); g.lineTo(mx + 18, my - 9); g.lineTo(mx + 18, my + 9); g.lineTo(mx, my + 3); g.closePath(); }, '#DC2626', mx, my - 9, 18, 18, 1);
    px(g, mx + 2, my - 3, 14, 1, '#F87171');
    part(g, () => g.roundRect(mx + 16, my - 10, 4, 20, 1), '#F8FAFC', mx + 16, my - 10, 4, 20, 0.9);
    px(g, mx + 3, my + 3, 3, 5, '#27272A'); px(g, mx + 6, my + 3, 1, 3, '#FACC15');
  }
};
export const drawGuide = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['raise'], ['blast']));
  putFrame(c, 'hw-guide2', F, BOX, g => paintGuide(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Backlot security in a golf cart

const paintCart = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, 'stand', 0), L = B.L;
  const dead = F.md === 'dead', mad = F.pose === 'tell' || F.pose === 'strike';
  // (the bench's back behind him)
  part(g, () => g.roundRect(-36, -66, 14, 30, 3), '#27272A', -36, -66, 14, 30, 1);
  px(g, -34, -64, 10, 2, '#4A4A54');
  // (the guard: sat, head and shoulders up under the canopy, behind the wheel)
  const sx = -10, sy = -6;
  g.save(); g.translate(sx, sy);
  torso(g, B, '#1E3A8A');
  px(g, 0, B.shY + 3, 1, 12, '#14286A');
  // (the star on his chest, stepped; the shoulder patch)
  part(g, () => { const cx = -5, cy = B.shY + 10; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 1.6 : 4; if (k) g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); else g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); }, '#FACC15', -9, B.shY + 6, 8, 8, 0.8);
  px(g, B.w / 2 - 6, B.shY + 3, 4, 5, '#FACC15'); px(g, B.w / 2 - 5, B.shY + 4, 2, 2, '#1E3A8A');
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: mad ? 'angry' : 'tired', mouth: F.pose === 'strike' ? 'teeth' : 'flat', md: F.md, blink: F.blink });
  whiskers(g, B);
  const hat = F.seed % 3;
  if (hat === 0) {
    // (the peaked cap: its badge, its patent peak)
    partTop(g, () => g.roundRect(B.hx - 10, B.hy - 15, 20, 9, 2), '#1E3A8A', B.hx - 10, B.hy - 15, 20, 9, 1);
    px(g, B.hx - 10, B.hy - 7, 20, 2, '#14286A'); px(g, B.hx - 2, B.hy - 13, 4, 4, '#FACC15');
    part(g, () => g.roundRect(B.hx + 2, B.hy - 7, 14, 3, 1), '#18181B', B.hx + 2, B.hy - 7, 14, 3, 0.8); px(g, B.hx + 4, B.hy - 7, 8, 1, '#5A5A64');
  } else if (hat === 1) cap(g, B, '#1E3A8A');
  else hairTop(g, B);
  if (F.seed % 4 === 2) shades(g, B);
  g.restore();
  // (the cart's tub, in front of his lap and legs; the wheels under it)
  for (const wx of [-30, 30]) { ball(g, wx, -9, 9, '#18181B', 1.2); ball(g, wx, -9, 5, '#A1A1AA', 0.8); px(g, wx - 1, -10, 2, 2, '#E4E4E7'); for (let k = 0; k < 4; k++) px(g, wx - 9 + k * 5, -1, 3, 1, '#3F3F46'); }
  part(g, () => g.roundRect(-44, -42, 88, 30, 6), '#F8FAFC', -44, -42, 88, 30, 1.4);
  px(g, -42, -40, 84, 2, '#FFFFFF');
  px(g, -42, -26, 84, 4, '#1D4ED8'); px(g, -42, -26, 84, 1, '#60A5FA');
  part(g, () => g.roundRect(-46, -16, 92, 5, 2), '#27272A', -46, -16, 92, 5, 1);
  // (SECURITY on its side)
  px(g, -32, -37, 52, 9, '#1E3A8A'); px(g, -30, -35, 48, 5, '#F8FAFC');
  for (let k = 0; k < 8; k++) px(g, -28 + k * 6, -34, 4, 3, '#1E3A8A');
  // (the dash, the column, the wheel; his near arm out to it, fist on the rim)
  part(g, () => g.roundRect(26, -52, 16, 12, 3), '#E4E4E7', 26, -52, 16, 12, 1);
  limb(g, 30, -46, 22, -62, 2.5, '#27272A');
  part(g, () => g.ellipse(21, -64, 3, 7, 0.35, 0, Math.PI * 2), '#27272A', 17, -71, 8, 14, 0.9);
  g.save(); g.translate(sx, sy);
  arm(g, B, 1, 21 - sx, -66 - sy, { sleeve: '#1E3A8A', hand: L.skin, len: 0.45 });
  g.restore();
  // (the windshield: glass going up to the canopy, its glint)
  g.fillStyle = 'rgba(186, 230, 253, 0.32)'; g.fillRect(32, -96, 6, 46);
  px(g, 33, -92, 1, 30, 'rgba(255,255,255,0.6)');
  // (the canopy's posts, the canopy (its striped edge), the light bar on the roof)
  px(g, -41, -96, 5, 56, INK); px(g, -40, -96, 3, 56, '#A1A1AA'); px(g, 33, -96, 5, 46, INK); px(g, 34, -96, 3, 46, '#A1A1AA');
  partTop(g, () => g.rect(-46, -104, 92, 9), '#F8FAFC', -46, -104, 92, 9, 1.2);
  for (let k = 0; k < 92; k += 8) px(g, -46 + k, -97, 4, 2, '#1E3A8A');
  const lit = mad && F.fr % 2 === 0;
  part(g, () => g.roundRect(-14, -112, 28, 8, 3), '#27272A', -14, -112, 28, 8, 1);
  part(g, () => g.roundRect(-12, -111, 11, 6, 2), lit ? '#EF4444' : '#7F1D1D', -12, -111, 11, 6, 0.8);
  part(g, () => g.roundRect(1, -111, 11, 6, 2), !lit && mad ? '#3B82F6' : '#1E3A8A', 1, -111, 11, 6, 0.8);
  if (mad) { g.fillStyle = lit ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'; g.fillRect(lit ? -22 : -2, -118, 26, 18); g.fillStyle = lit ? 'rgba(239, 68, 68, 0.18)' : 'rgba(59, 130, 246, 0.18)'; g.fillRect(lit ? -28 : -8, -122, 38, 26); }
  if (dead) px(g, -42, -42, 84, 2, INK);
};
export const drawCart = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState === 'siren' ? 'tell' : e.aiState === 'rush' ? 'strike' : 'stand';
  const F = frameOf(seed, f, st as Pose, moodOf(e), 0, undefined, `c${Math.floor(f / 8) % 2}`);
  F.fr = Math.floor(f / 8) % 2;
  putFrame(c, 'hw-cart2', F, [-60, -130, 120, 134], g => paintCart(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The centurion extra

const paintLegionary = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const gold = pickOf(F.seed, 2, ['#CA8A04', '#D4A017', '#B8860B']), red = '#B91C1C', crest = pickOf(F.seed, 3, ['#B91C1C', '#7E22CE', '#DC2626']);
  legs(g, B, { col: L.skin, shoe: 'sandal', shoeCol: '#78350F', detail: (gg, h, k, ft) => { for (let t = 0.35; t < 0.95; t += 0.2) { const yy = k[1] + (ft[1] - k[1]) * t, xx = k[0] + (ft[0] - k[0]) * t; px(gg, xx - B.legW / 2, yy, B.legW, 1, '#5B3A1E'); } } });
  const fl = flailHands(B, F.fr);
  const back = F.pose === 'tell', thrust = F.pose === 'strike';
  const far: [number, number] = fl ? fl[0] : back ? [-B.w / 2 - 14, B.shY + 14] : thrust ? [B.w / 2 + 8, B.shY + 12] : [-B.w / 2 + 2, B.shY + 18];
  const near: [number, number] = fl ? fl[1] : back ? [-B.w / 2 + 4, B.shY + 12] : thrust ? [B.w / 2 + 24, B.shY + 12] : [B.w / 2 + 8, B.shY + 14];
  arm(g, B, -1, far[0], far[1], { sleeve: L.skin, hand: L.skin });
  // (the red tunic's skirt, its strips (pteruges), their gold ends)
  part(g, () => g.rect(-B.hipW / 2 - 2, B.hipY - 4, B.hipW + 4, 13), red, -B.hipW / 2 - 2, B.hipY - 4, B.hipW + 4, 13, 1);
  for (let k = 0; k < 6; k++) { const x = -B.hipW / 2 - 1 + k * ((B.hipW + 2) / 6); px(g, x, B.hipY + 1, 3, 8, dk(red, 0.3)); px(g, x, B.hipY + 8, 3, 2, gold); }
  torso(g, B, gold);
  // (the breastplate's muscles drawn on, the duct tape holding it together, the sprayed-on drips)
  px(g, -B.w / 2 + 4, B.shY + 9, 7, 1, dk(gold, 0.4)); px(g, 2, B.shY + 9, 7, 1, dk(gold, 0.4));
  px(g, -1, B.shY + 4, 1, 18, dk(gold, 0.35));
  for (let y = B.shY + 14; y < B.hipY - 3; y += 5) { px(g, -B.w / 2 + 5, y, 5, 1, dk(gold, 0.3)); px(g, 2, y, 5, 1, dk(gold, 0.3)); }
  px(g, -B.w / 2 + 2, B.shY + 2, 3, 6, lt(gold, 0.35));
  const tape = F.seed % 3;
  px(g, B.w / 2 - 6 - tape * 2, B.shY + 5, 6, 8, '#A8A8B0'); px(g, B.w / 2 - 6 - tape * 2, B.shY + 5, 6, 1, '#D4D4D8');
  if (tape === 1) { px(g, -B.w / 2 + 1, B.hipY - 8, 8, 4, '#A8A8B0'); px(g, -B.w / 2 + 1, B.hipY - 8, 8, 1, '#D4D4D8'); }
  px(g, 4, B.shY + 18, 1, 4, lt(gold, 0.2));
  // (his own head under the helmet)
  ownHead(g, F, B, back || thrust ? 'angry' : 'open', thrust ? 'teeth' : 'flat');
  // (the helmet: its bowl lit on top, the brow band, the cheek guard, the neck guard; the crest on its holder)
  partTop(g, () => { g.moveTo(B.hx - 10, B.hy - 1); g.quadraticCurveTo(B.hx - 9, B.hy - 14, B.hx + 1, B.hy - 13); g.quadraticCurveTo(B.hx + 11, B.hy - 13, B.hx + 10, B.hy - 1); g.lineTo(B.hx + 6, B.hy - 4); g.lineTo(B.hx - 6, B.hy - 4); g.closePath(); }, gold, B.hx - 10, B.hy - 14, 21, 14, 1);
  px(g, B.hx - 9, B.hy - 5, 19, 2, dk(gold, 0.3));
  part(g, () => { g.moveTo(B.hx - 2, B.hy - 3); g.lineTo(B.hx + 3, B.hy - 3); g.lineTo(B.hx + 2, B.hy + 6); g.lineTo(B.hx - 2, B.hy + 4); g.closePath(); }, gold, B.hx - 2, B.hy - 3, 5, 9, 0.8);
  part(g, () => g.rect(B.hx - 12, B.hy - 3, 4, 6), gold, B.hx - 12, B.hy - 3, 4, 6, 0.8);
  px(g, B.hx - 1, B.hy - 16, 2, 3, dk(gold, 0.3));
  partTop(g, () => g.roundRect(B.hx - 11, B.hy - 23, 20, 8, 4), crest, B.hx - 11, B.hy - 23, 20, 8, 1);
  for (let k = 0; k < 6; k++) px(g, B.hx - 9 + k * 3, B.hy - 22, 1, 6, dk(crest, 0.3));
  if (F.seed % 4 === 3) shades(g, B);
  arm(g, B, 1, near[0], near[1], { sleeve: L.skin, hand: L.skin });
  // (a wristwatch: the extra forgot to take it off)
  if (!fl) { px(g, near[0] - 5, near[1] - 2, 3, 4, '#18181B'); px(g, near[0] - 5, near[1] - 1, 2, 2, '#D4D4D8'); }
  // (the spear: level, out in front, through both hands; its foil head)
  if (!fl) {
    const sx = Math.min(far[0], near[0]) - 18, ex = Math.max(far[0], near[0]) + 50 + (thrust ? 10 : 0), y = near[1] - 1;
    limb(g, sx, y, ex, y, 3, '#92400E');
    px(g, sx + 6, y - 1, ex - sx - 12, 1, '#C2722A');
    px(g, ex - 3, y - 2, 4, 4, '#A8A8B0');
    part(g, () => { g.moveTo(ex, y - 5); g.lineTo(ex + 14, y); g.lineTo(ex, y + 5); g.closePath(); }, '#D4D4D8', ex, y - 5, 14, 10, 1);
    px(g, ex + 1, y - 3, 8, 1, '#FFFFFF');
  }
};
export const drawLegionary = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['draw'], ['thrust']));
  putFrame(c, 'hw-legion3', F, SPEAR_BOX, g => paintLegionary(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The cowboy extra

const paintCowboy = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const vest = pickOf(F.seed, 3, ['#78350F', '#1C1917', '#7F1D1D', '#3F3F46']), shirt = pickOf(F.seed, 4, ['#DBEAFE', '#FEF3C7', '#FCA5A5', '#E7E5E4']);
  const hatCol = pickOf(F.seed, 5, ['#A16207', '#1C1917', '#E7E5E4', '#78350F']), kerchief = pickOf(F.seed, 6, ['#DC2626', '#1D4ED8', '#15803D']);
  const chaps = '#92400E';
  legs(g, B, { col: '#1E3A8A', shoe: 'boot', shoeCol: '#78350F', detail: (gg, h, k, ft, near) => {
    limb(gg, h[0], h[1] + 2, k[0], k[1], B.legW + 1, near ? chaps : dk(chaps, 0.14));
    limb(gg, k[0], k[1], ft[0], ft[1] - 6, B.legW + 0.5, near ? chaps : dk(chaps, 0.14));
    for (let t = 0.1; t < 0.95; t += 0.16) { const yy = h[1] + (ft[1] - 6 - h[1]) * t, xx = h[0] + (ft[0] - h[0]) * t; px(gg, xx - B.legW / 2 - 3, yy, 3, 1, '#C2722A'); }
    // (the spur at the heel)
    px(gg, ft[0] - 6, ft[1] - 3, 4, 1, '#A8A8B0'); px(gg, ft[0] - 7, ft[1] - 4, 2, 2, '#D4D4D8');
  } });
  const fl = flailHands(B, F.fr);
  const whirl = F.pose === 'tell', toss = F.pose === 'strike';
  const a = F.fr * 1.6;
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, B.hipY - 2];
  const near: [number, number] = fl ? fl[1] : whirl ? [B.hx + 4, B.hy - 22] : toss ? [B.w / 2 + 20, B.shY + 2] : [B.w / 2 + 3, B.shY + 18];
  arm(g, B, -1, far[0], far[1], { sleeve: shirt, hand: L.skin });
  torso(g, B, shirt);
  // (the shirt's yoke, its snaps)
  px(g, -B.w / 2 + 2, B.shY + 5, B.w - 4, 1, dk(shirt, 0.25)); for (let y = B.shY + 8; y < B.hipY - 3; y += 5) px(g, 0, y, 1, 1, '#E8E0D0');
  // (the vest's two fronts, their pockets; a tin star on some)
  part(g, () => g.rect(-B.w / 2, B.shY + 1, 8, B.hipY - B.shY), vest, -B.w / 2, B.shY + 1, 8, B.hipY - B.shY, 1);
  part(g, () => g.rect(B.w / 2 - 8, B.shY + 1, 8, B.hipY - B.shY), vest, B.w / 2 - 8, B.shY + 1, 8, B.hipY - B.shY, 1);
  px(g, -B.w / 2 + 2, B.hipY - 10, 5, 1, lt(vest, 0.2)); px(g, B.w / 2 - 7, B.hipY - 10, 5, 1, lt(vest, 0.2));
  if (F.seed % 3 === 0) part(g, () => { const cx = B.w / 2 - 4, cy = B.shY + 9; for (let k = 0; k < 10; k++) { const an = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 1.5 : 3.6; if (k) g.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); else g.moveTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); } g.closePath(); }, '#D4D4D8', B.w / 2 - 8, B.shY + 5, 8, 8, 0.8);
  // (the belt, its big buckle)
  px(g, -B.hipW / 2, B.hipY - 3, B.hipW + 2, 4, '#451A03'); part(g, () => g.roundRect(-4, B.hipY - 5, 9, 7, 1), '#EAB308', -4, B.hipY - 5, 9, 7, 0.8); px(g, -2, B.hipY - 3, 5, 3, '#A16207');
  ownHead(g, F, B, whirl ? 'angry' : 'open', toss ? 'teeth' : 'flat');
  // (the kerchief at the neck: tied, its point down)
  part(g, () => { g.moveTo(B.hx - 7, B.hy + 8); g.lineTo(B.hx + 8, B.hy + 8); g.lineTo(B.hx + 1, B.hy + 15); g.closePath(); }, kerchief, B.hx - 7, B.hy + 8, 15, 7, 0.9);
  for (let k = 0; k < 3; k++) px(g, B.hx - 4 + k * 4, B.hy + 9, 1, 1, '#F8FAFC');
  // (the ten-gallon hat: the brim curled up its sides, the crown's crease, the band)
  part(g, () => { g.moveTo(B.hx - 17, B.hy - 12); g.quadraticCurveTo(B.hx - 15, B.hy - 7, B.hx, B.hy - 7); g.quadraticCurveTo(B.hx + 15, B.hy - 7, B.hx + 18, B.hy - 12); g.quadraticCurveTo(B.hx + 14, B.hy - 9, B.hx, B.hy - 10); g.quadraticCurveTo(B.hx - 14, B.hy - 9, B.hx - 17, B.hy - 12); g.closePath(); }, hatCol, B.hx - 17, B.hy - 12, 35, 5, 1);
  partTop(g, () => { g.moveTo(B.hx - 8, B.hy - 9); g.lineTo(B.hx - 8, B.hy - 19); g.quadraticCurveTo(B.hx - 4, B.hy - 23, B.hx, B.hy - 20); g.quadraticCurveTo(B.hx + 4, B.hy - 23, B.hx + 9, B.hy - 19); g.lineTo(B.hx + 9, B.hy - 9); g.closePath(); }, hatCol, B.hx - 8, B.hy - 23, 17, 14, 1);
  px(g, B.hx - 8, B.hy - 13, 17, 2, hatCol === '#1C1917' ? '#B91C1C' : '#451A03'); px(g, B.hx - 1, B.hy - 20, 2, 7, dk(hatCol, 0.3));
  arm(g, B, 1, near[0], near[1], { sleeve: shirt, hand: L.skin });
  // (the lasso: a coil at the hip, or a loop whirling over the head, its rope in steps)
  if (!fl && !toss) {
    const loop = (x: number, y: number, rx: number, ry: number) => {
      g.strokeStyle = INK; g.lineWidth = 3.5; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = '#CA8A04'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = '#FDE68A'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 0.5, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.7); g.stroke();
    };
    if (whirl) loop(near[0] + Math.cos(a) * 6, near[1] - 6, 22, 6);
    else { loop(far[0] + 2, far[1] - 6, 8, 8); loop(far[0] + 3, far[1] - 5, 6, 6); }
  }
};
export const drawCowboy = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['swing'], ['throw']));
  putFrame(c, 'hw-cowboy2', F, BOX, g => paintCowboy(g, F));
};
