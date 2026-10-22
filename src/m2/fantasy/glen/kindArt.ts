// The enchanted glen's new cast, drawn (the SNES pass: every material in its steps, dithered between, inked; every
// frame painted once into a stamp, live only while it's being spun about). The huntsman and the dwarfs on Spooky Land's
// person drawer (costume.ts: whoever's in the costume shows, their skin, build, face, man or woman; seeded, no two the
// same); Cupid, the gingerbread man and the unicorn in the same steps (the performers' sweaty faces through the
// costumes). Each drawn hurt (eyes shut), knocked about (held, flung, dazed: reaction()) and dead (limp, crossed-out
// eyes), so the engine's special deaths play out on their real sprites; and dead, the costume gives (the huntsman's cap
// off, the dwarf's hat off and the candle out, Cupid's wings torn off beside it and its wire snapped, the cookie's head
// bitten and off, the unicorn's head off and its horn snapped). Feet at the origin, facing right (the engine mirrors).
//
//   huntsman  a hooded green capelet over a laced leather jerkin, a belt with its buckle and knife, a bracer, folded
//             boot cuffs, a quiver of red-fletched bolts, the feathered cap; the crossbow (a walnut stock, a steel prod,
//             the bolt's head out front: pointy), its glint in the aim
//   dwarf     a grown-up in a dwarf suit: a hooded tunic and its belt, a big fake beard in strands (the elastic over the
//             ears), a rosy putty nose; the miner's helmet, the candle stuck on top (wax down it, the flame flickering:
//             spiky); the pickaxe (an ash haft, a steel head)
//   cupid     flown on wires: a grown cast member in a bulky diaper (its folds, a gold safety pin) and a toga sash,
//             stubby feathered wings (rows of them, flapping), a belly, curls or no hair, a laurel or a heart
//             headband; the gilt recurve bow, the heart-tipped arrow always nocked out front (pointy)
//   ginger    a foam gingerbread suit: cookie in steps (its baked edge darker), piped icing (zigzags at the cuffs, a
//             smile, the eyes), gumdrop buttons, a candy bow tie; the performer's face in the mouth hole
//   unicorn   a plush suit: the coat in steps, a rainbow mane and tail in strands, lilac hooves, the gilt spiral horn
//             out front (pointy), a felt eye with lashes; the performer's face out the neck

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, ball, limb, dither,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';
import { lookOf } from '../../adventure/temple/people';
import { stamp } from '../../../m1/game/render/stamp';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, undefined, v);
};
const BOX: [number, number, number, number] = [-80, -150, 170, 154];
const handsAt = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};
const dead = (F: Frame) => F.md === 'dead';
const GILT = '#E0AE3A', STEEL = '#A8AEB8';

const seedOfE = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
/** A performer's face, small, sweaty, in its hole. */
const performer = (g: Ctx, seed: number, x: number, y: number, r: number, hurt: boolean, isDead: boolean, own = false) => {
  const L = lookOf(seed);
  part(g, () => g.ellipse(x, y, r, r * 0.86, 0, 0, Math.PI * 2), L.skin, x - r, y - r, r * 2, r * 1.8, 1.2);
  if (own && !L.bald) { partTop(g, () => { g.moveTo(x - r, y - 1); g.quadraticCurveTo(x - r, y - r * 1.1, x, y - r * 0.95); g.quadraticCurveTo(x + r, y - r, x + r, y - 2); g.lineTo(x + 2, y - r * 0.5); g.closePath(); }, L.hair, x - r, y - r * 1.1, r * 2, r, 1); }
  if (isDead) { for (const o of [-4, 3]) { px(g, x + o - 1, y - 3, 3, 1, INK); px(g, x + o, y - 4, 1, 3, INK); } }
  else if (hurt) { px(g, x - 5, y - 3, 3, 1, INK); px(g, x + 2, y - 3, 3, 1, INK); }
  else { for (const o of [-4, 3]) { px(g, x + o - 1, y - 4, 3, 3, '#FFFFFF'); px(g, x + o, y - 3, 2, 2, INK); } }
  px(g, x - 2, y + 2, 5, 2, INK); if (!isDead && !hurt) px(g, x - 1, y + 2, 3, 1, '#FFFFFF');
  px(g, x + r - 3, y - r * 0.4, 2, 3, '#BFE8FF'); px(g, x - r + 1, y, 2, 2, '#BFE8FF'); px(g, x + r - 3, y - r * 0.4, 1, 1, '#FFFFFF');
  px(g, x + 3, y + 1, 3, 1, dk(L.skin, 0.12));
};
/** Dizzy stars round a head. */
const stars = (g: Ctx, x: number, y: number, f: number) => {
  for (let k = 0; k < 3; k++) { const a = f * 0.15 + (k * Math.PI * 2) / 3; const sx = x + Math.cos(a) * 16, sy = y + Math.sin(a) * 5; px(g, sx - 3, sy - 1, 7, 3, INK); px(g, sx - 1, sy - 3, 3, 7, INK); px(g, sx - 2, sy - 0.5, 5, 2, '#FDE047'); px(g, sx - 0.5, sy - 2, 2, 5, '#FDE047'); }
};
/** Puts a costume down: stamped while it's still, or live while it's spun (a stamp can't be turned). */
const mascot = (c: Ctx, key: string, spin: number, bx: [number, number, number, number], paint: (g: Ctx) => void) => {
  if (spin) { c.save(); c.rotate(spin); paint(c); c.restore(); return; }
  stamp(c, key, bx[0], bx[1], bx[2], bx[3], paint);
};
/** How a costume stands: flung, or stood. Never flat by itself, dead or not: the engine's deaths and body drawers lay a body
 * down themselves (keeled over, rolled, sprawled), so lying down here as well turned it on end; and a body in a death
 * animation (no id) doesn't wobble, the animation turns it. */
const layOf = (e: Enemy) => {
  const r = reaction(e), md = r?.md ?? moodOf(e), isDead = md === 'dead', pose = r?.pose ?? null;
  const flung = !!e.id && (pose === 'thrown' || pose === 'shaken' || pose === 'pinned');
  return { r, md, isDead, pose, flung };
};

// ---------------------------------------------------------------------------------------------------------------
// The huntsman (a loaded crossbow out front: pointy)

const JERKINS = ['#7A4A26', '#5E3A1E', '#8A5A30', '#4A3424', '#6A4A34'];
const CAPES = ['#3F6212', '#4D7C0F', '#166534', '#3A5A2A', '#2E5A3A'];
const crossbow = (g: Ctx, x: number, y: number, a: number, glint: boolean) => {
  g.save(); g.translate(x, y); g.rotate(a);
  // (the stock: walnut, its butt, the trigger; the steel prod across its front, the string, the bolt loaded)
  part(g, () => { g.moveTo(-16, -2); g.lineTo(18, -2); g.lineTo(18, 3); g.lineTo(-6, 3); g.lineTo(-16, 7); g.closePath(); }, '#6A3E1E', -16, -2, 34, 9, 1);
  px(g, -4, 3, 2, 4, INK); px(g, 0, -1, 14, 1, '#A8784A');
  part(g, () => { g.moveTo(14, -13); g.quadraticCurveTo(21, 0, 14, 13); g.lineTo(12, 13); g.quadraticCurveTo(18, 0, 12, -13); g.closePath(); }, STEEL, 12, -13, 9, 26, 1);
  px(g, 13, -12, 1, 2, '#FFFFFF');
  g.strokeStyle = '#E7E5E4'; g.lineWidth = 1; g.beginPath(); g.moveTo(13, -12); g.lineTo(3, 0); g.lineTo(13, 12); g.stroke();
  px(g, 3, -1, 23, 2, '#C8A070'); px(g, 3, -1, 23, 1, '#E8C898');
  for (const s of [-1, 1]) px(g, 3, -1 + s * 2, 4, 1, '#B91C1C');
  g.fillStyle = INK; g.beginPath(); g.moveTo(25, -4); g.lineTo(34, 0); g.lineTo(25, 4); g.closePath(); g.fill();
  g.fillStyle = '#9CA3AF'; g.beginPath(); g.moveTo(26, -2.5); g.lineTo(32, 0); g.lineTo(26, 2.5); g.closePath(); g.fill(); px(g, 26, -2, 3, 1, '#F1F5F9');
  if (glint) { px(g, 30, -5, 2, 10, '#FFFFFF'); px(g, 26, -1, 10, 2, '#FFFFFF'); }
  g.restore();
};
const paintHuntsman = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, jerkin = pickOf(F.seed, 2, JERKINS), cape = pickOf(F.seed, 5, CAPES);
  const aim = F.pose === 'tell', bash = F.pose === 'strike', reload = F.v === 'reload';
  // (the legs, and the boots' folded cuffs)
  legs(g, B, { col: '#57534E', shoe: 'boot', shoeCol: '#3A2A1A', detail: (gg, _h, _k, foot, near) => { px(gg, foot[0] - 5, foot[1] - 8, 11, 5, INK); px(gg, foot[0] - 4, foot[1] - 7, 9, 3, near ? '#6A4A2E' : '#5A3E26'); px(gg, foot[0] - 4, foot[1] - 7, 9, 1, '#8A6A4A'); } });
  const H = handsAt(B, F, aim ? [B.w / 2 + 2, B.shY + 6] : [-B.w / 2 - 4, B.shY + 16], aim ? [B.w / 2 + 12, B.shY + 2] : bash ? [B.w / 2 + 16, B.shY + 4] : reload ? [B.w / 2 + 2, B.shY + 20] : [B.w / 2 + 8, B.shY + 14]);
  // (the quiver over the back: leather, its bolts' red fletching up out of it)
  part(g, () => g.roundRect(-B.w / 2 - 8, B.shY - 4, 8, 26, 2), '#5A3A1E', -B.w / 2 - 8, B.shY - 4, 8, 26, 1);
  for (const k of [0, 3, 6]) { px(g, -B.w / 2 - 7 + k * 0.8, B.shY - 11, 1, 7, '#D6D3D1'); px(g, -B.w / 2 - 8 + k * 0.8, B.shY - 13, 3, 3, k === 3 ? '#EF4444' : '#B91C1C'); }
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(jerkin, 0.1), hand: L.skin });
  torso(g, B, jerkin);
  // (the jerkin's laced front, its stitched seams; the belt, buckle, a knife in its sheath)
  for (let y = B.shY + 4; y < B.hipY - 6; y += 4) { px(g, 1, y, 3, 1, '#E8D8B0'); px(g, 2, y + 2, 1, 1, dk(jerkin, 0.4)); }
  dither(g, -B.w / 2 + 2, B.shY + 6, 2, B.hipY - B.shY - 10, dk(jerkin, 0.3));
  px(g, -B.w / 2 + 1, B.hipY - 5, B.w - 2, 4, INK); px(g, -B.w / 2 + 2, B.hipY - 4, B.w - 4, 2, '#3A2A1A'); px(g, -B.w / 2 + 2, B.hipY - 4, B.w - 4, 1, '#5A4430');
  part(g, () => g.rect(-2, B.hipY - 6, 6, 6), GILT, -2, B.hipY - 6, 6, 6, 0.8); px(g, 0, B.hipY - 4, 2, 2, '#3A2208');
  part(g, () => { g.moveTo(B.w / 2 - 8, B.hipY - 2); g.lineTo(B.w / 2 - 2, B.hipY - 2); g.lineTo(B.w / 2 - 4, B.hipY + 12); g.closePath(); }, '#4A3020', B.w / 2 - 8, B.hipY - 2, 6, 14, 0.8);
  px(g, B.w / 2 - 6, B.hipY - 5, 2, 3, '#C8CCD4');
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: aim ? 'angry' : 'open', mouth: bash ? 'teeth' : aim ? 'flat' : 'smirk', md: F.md, blink: F.blink });
  whiskers(g, B);
  // (the hooded capelet: over the shoulders, its hood down behind the neck, a clasp)
  partTop(g, () => { g.moveTo(-B.w / 2 - 4, B.shY + 12); g.quadraticCurveTo(-B.w / 2 - 2, B.shY - 4, B.hx - 8, B.shY - 2); g.lineTo(B.w / 2 + 2, B.shY); g.quadraticCurveTo(B.w / 2 + 4, B.shY + 8, B.w / 2, B.shY + 14); g.lineTo(-B.w / 2 - 4, B.shY + 14); g.closePath(); }, cape, -B.w / 2 - 4, B.shY - 4, B.w + 8, 18, 1);
  for (let x = -B.w / 2 - 2; x < B.w / 2; x += 5) px(g, x, B.shY + 12, 3, 2, dk(cape, 0.3));
  part(g, () => g.ellipse(B.hx - 10, B.shY - 2, 8, 6, 0, 0, Math.PI * 2), cape, B.hx - 18, B.shY - 8, 16, 12, 1);
  part(g, () => g.arc(2, B.shY + 2, 2.5, 0, Math.PI * 2), GILT, -1, B.shY - 1, 6, 6, 0.8);
  if (dead(F)) {
    // (dead: the cap knocked crooked, down over an ear, its feather bent (on him, so it goes down with him, never left
    // floating where the floor was))
    hairTop(g, B);
    g.save(); g.translate(B.hx, B.hy - 6); g.rotate(0.55); g.translate(-B.hx, -B.hy + 6);
    partTop(g, () => { g.moveTo(B.hx - 12, B.hy - 6); g.lineTo(B.hx + 14, B.hy - 6); g.lineTo(B.hx + 4, B.hy - 19); g.lineTo(B.hx - 7, B.hy - 15); g.closePath(); }, cape, B.hx - 12, B.hy - 19, 26, 13, 1);
    px(g, B.hx - 11, B.hy - 9, 24, 2, dk(cape, 0.45));
    part(g, () => { g.moveTo(B.hx - 4, B.hy - 13); g.quadraticCurveTo(B.hx - 12, B.hy - 24, B.hx - 22, B.hy - 14); g.lineTo(B.hx - 4, B.hy - 11); g.closePath(); }, '#DC2626', B.hx - 22, B.hy - 24, 18, 13, 0.8);
    g.restore();
  } else {
    hairTop(g, B);
    // (the feathered cap: a peaked felt hat, its band, a long red feather back off it)
    partTop(g, () => { g.moveTo(B.hx - 12, B.hy - 6); g.lineTo(B.hx + 14, B.hy - 6); g.lineTo(B.hx + 4, B.hy - 19); g.lineTo(B.hx - 7, B.hy - 15); g.closePath(); }, cape, B.hx - 12, B.hy - 19, 26, 13, 1);
    px(g, B.hx - 11, B.hy - 9, 24, 2, dk(cape, 0.45));
    part(g, () => { g.moveTo(B.hx - 4, B.hy - 13); g.quadraticCurveTo(B.hx - 18, B.hy - 27, B.hx - 28, B.hy - 23); g.quadraticCurveTo(B.hx - 16, B.hy - 18, B.hx - 4, B.hy - 11); g.closePath(); }, '#DC2626', B.hx - 28, B.hy - 27, 24, 16, 1);
    for (let k = 0; k < 4; k++) px(g, B.hx - 8 - k * 5, B.hy - 15 - k * 2, 1, 2, '#7A1010');
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: jerkin, hand: L.skin });
  // (a leather bracer on the near forearm)
  if (!H.held) { const bx = (B.w / 2 + H.near[0]) / 2 + 2, by = (B.shY + H.near[1]) / 2 + 4; part(g, () => g.roundRect(bx - 4, by - 3, 8, 7, 2), '#4A3020', bx - 4, by - 3, 8, 7, 0.8); px(g, bx - 3, by, 6, 1, '#C8A070'); }
  if (!H.held) crossbow(g, H.near[0] - 4, H.near[1], aim ? 0 : bash ? -0.2 : reload ? 0.9 : 0.15, aim && F.fr % 2 === 0);
};
export const drawHuntsman = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['aim'], ['bashWind', 'bash']), e.aiState === 'reload' ? 'reload' : '');
  // (the glint flickers through the aim)
  if (F.pose === 'tell' && e.aiState === 'aim') F.fr = Math.floor(f / 3) % 2;
  putFrame(c, 'fa-huntsman2', F, BOX, g => paintHuntsman(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The dwarf (an adult in dwarf costume, a miner's hat and its candle (spiky), the beard, the pickaxe)

const TUNICS = ['#B91C1C', '#1D4ED8', '#CA8A04', '#7C3AED', '#15803D', '#C2410C'];
const BEARDS = ['#F5F5F4', '#A8A29E', '#78350F', '#1C1917', '#B45309'];
const pickaxe = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.rect(-4, -2.5, 36, 5), '#9A6A3A', -4, -2.5, 36, 5, 1);
  for (let k = 2; k < 28; k += 6) px(g, k, -1, 3, 1, '#C89A64');
  part(g, () => g.rect(-4, -3, 7, 6), '#5A3A1E', -4, -3, 7, 6, 0.8);
  part(g, () => { g.moveTo(26, -15); g.quadraticCurveTo(37, -2, 31, 15); g.lineTo(27, 14); g.quadraticCurveTo(31, -1, 22, -11); g.closePath(); }, STEEL, 22, -15, 15, 30, 1);
  px(g, 27, -12, 2, 4, '#FFFFFF'); px(g, 28, 3, 1, 4, dk(STEEL, 0.4));
  part(g, () => g.rect(25, -4, 7, 8), '#6A6E78', 25, -4, 7, 8, 0.8);
  g.restore();
};
const paintDwarf = (g: Ctx, F: Frame) => {
  g.save(); g.scale(0.78, 0.78);
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, tunic = pickOf(F.seed, 3, TUNICS), beard = pickOf(F.seed, 4, BEARDS);
  const raise = F.pose === 'tell' && F.v !== 'wind', stuck = F.v === 'stuck', wind = F.v === 'wind';
  legs(g, B, { col: '#57534E', shoe: 'boot', shoeCol: '#3A2A1A' });
  const H = handsAt(B, F, wind ? [-B.w / 2 - 10, B.shY - 14] : [-B.w / 2 - 4, B.shY + 16], raise ? [B.hx - 4, B.hy - 24] : stuck ? [B.w / 2 + 12, B.shY + 24] : [B.w / 2 + 6, B.shY + 12]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(tunic, 0.1), hand: L.skin });
  if (wind && !H.held) { part(g, () => { g.moveTo(H.far[0] - 8, H.far[1] - 5); g.lineTo(H.far[0] - 3, H.far[1] - 12); g.lineTo(H.far[0] + 4, H.far[1] - 9); g.lineTo(H.far[0] + 5, H.far[1] - 2); g.lineTo(H.far[0] - 2, H.far[1] + 2); g.closePath(); }, '#7C4ACF', H.far[0] - 8, H.far[1] - 12, 13, 14, 1); px(g, H.far[0] - 4, H.far[1] - 9, 2, 2, '#F1EBFF'); }
  torso(g, B, tunic);
  // (the tunic's hood down its back, a patch, its hem in points; the belt and its big buckle)
  partTop(g, () => g.ellipse(-B.w / 2 + 4, B.shY + 2, 9, 6, 0, 0, Math.PI * 2), dk(tunic, 0.15), -B.w / 2 - 5, B.shY - 4, 18, 12, 1);
  part(g, () => g.rect(-B.w / 2 + 4, B.shY + 14, 7, 7), lt(tunic, 0.25), -B.w / 2 + 4, B.shY + 14, 7, 7, 0.8);
  for (let k = 0; k < 3; k++) { px(g, -B.w / 2 + 5 + k * 2, B.shY + 15 + k * 2, 1, 1, INK); }
  for (let x = -B.w / 2; x < B.w / 2; x += 6) { g.fillStyle = INK; g.beginPath(); g.moveTo(x, B.hipY + 1); g.lineTo(x + 6, B.hipY + 1); g.lineTo(x + 3, B.hipY + 6); g.closePath(); g.fill(); g.fillStyle = dk(tunic, 0.1); g.beginPath(); g.moveTo(x + 1, B.hipY + 1); g.lineTo(x + 5, B.hipY + 1); g.lineTo(x + 3, B.hipY + 4); g.closePath(); g.fill(); }
  px(g, -B.w / 2 + 1, B.hipY - 4, B.w - 2, 4, INK); px(g, -B.w / 2 + 2, B.hipY - 3, B.w - 4, 2, '#3A2A1A');
  part(g, () => g.rect(-4, B.hipY - 6, 9, 7), '#CA8A04', -4, B.hipY - 6, 9, 7, 0.8); px(g, -1, B.hipY - 4, 3, 3, '#3A2208');
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: raise ? 'angry' : 'open', mouth: raise ? 'teeth' : 'grin', md: F.md, blink: F.blink });
  // (the costume's beard: big, fake, in strands down to the belt (askew, dead), the elastic over the ears; a putty nose)
  const bx = dead(F) ? 4 : 0;
  part(g, () => { g.moveTo(B.hx - 7 + bx, B.hy + 4); g.quadraticCurveTo(B.hx + 17 + bx, B.hy + 1, B.hx + 11 + bx, B.hy + 31); g.quadraticCurveTo(B.hx + 2 + bx, B.hy + 40, B.hx - 7 + bx, B.hy + 29); g.closePath(); }, beard, B.hx - 7, B.hy + 1, 24, 39, 1);
  for (let k = 0; k < 5; k++) { g.strokeStyle = dk(beard, 0.28); g.lineWidth = 1; g.beginPath(); g.moveTo(B.hx - 3 + k * 3 + bx, B.hy + 8); g.quadraticCurveTo(B.hx - 1 + k * 3 + bx, B.hy + 20, B.hx - 4 + k * 3 + bx, B.hy + 30 - Math.abs(k - 2) * 2); g.stroke(); }
  for (let k = 0; k < 3; k++) px(g, B.hx + k * 4 + bx, B.hy + 10 + k * 5, 1, 4, lt(beard, 0.35));
  px(g, B.hx - 9, B.hy - 2, 5, 1, '#E7E5E4'); px(g, B.hx - 9, B.hy - 1, 5, 1, '#A8A29E');
  ball(g, B.hx + 9, B.hy + 1, 3.2, '#E88A7A', 0.8);
  if (dead(F)) {
    hairTop(g, B);
    // (the helmet knocked crooked on his head, the candle out: a wisp off it (on him, so it goes down with him))
    g.save(); g.translate(B.hx, B.hy - 7); g.rotate(0.6);
    partTop(g, () => g.ellipse(0, 0, 13, 9, 0, Math.PI, 0), '#CA8A04', -13, -9, 26, 10, 1);
    part(g, () => g.rect(-15, -1, 30, 3), dk('#CA8A04', 0.15), -15, -1, 30, 3, 1);
    px(g, -2, -16, 4, 8, INK); px(g, -1, -15, 2, 7, '#F5F5F4'); px(g, 0, -20, 1, 3, '#A8A29E'); px(g, 1, -23, 1, 2, '#D6D3D1');
    g.restore();
  } else {
    // (the miner's helmet: brass, a brim, a riveted band; the candle stuck on top, wax down it, the flame flickering)
    partTop(g, () => g.ellipse(B.hx, B.hy - 7, 13, 9, 0, Math.PI, 0), '#CA8A04', B.hx - 13, B.hy - 16, 26, 10, 1);
    part(g, () => g.rect(B.hx - 15, B.hy - 8, 30, 3), dk('#CA8A04', 0.15), B.hx - 15, B.hy - 8, 30, 3, 1);
    for (let k = -10; k < 12; k += 5) px(g, B.hx + k, B.hy - 11, 1, 1, '#FFF4B8');
    part(g, () => g.rect(B.hx - 2.5, B.hy - 25, 6, 10), '#F5F5F4', B.hx - 2.5, B.hy - 25, 6, 10, 0.8);
    px(g, B.hx + 2, B.hy - 22, 2, 5, '#E7E5E4'); px(g, B.hx - 3, B.hy - 18, 2, 4, '#F5F5F4');
    px(g, B.hx, B.hy - 28, 1, 3, INK);
    const fl = F.fr % 2;
    g.fillStyle = '#F97316'; g.beginPath(); g.moveTo(B.hx - 3, B.hy - 27); g.quadraticCurveTo(B.hx + 0.5 + fl, B.hy - 38 - fl, B.hx + 4, B.hy - 27); g.closePath(); g.fill();
    g.fillStyle = '#FDE047'; g.beginPath(); g.moveTo(B.hx - 1.5, B.hy - 27); g.quadraticCurveTo(B.hx + 0.5 + fl, B.hy - 34 - fl, B.hx + 2.5, B.hy - 27); g.closePath(); g.fill();
    px(g, B.hx, B.hy - 29, 1, 2, '#FFFFFF');
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: tunic, hand: L.skin });
  if (!H.held) pickaxe(g, H.near[0], H.near[1], raise ? -1.9 : stuck ? 0.9 : -0.9);
  g.restore();
};
export const drawDwarf = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const v = e.aiState === 'stuck' ? 'stuck' : e.aiState === 'wind' ? 'wind' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['pickWind', 'wind'], ['stuck', 'after']), v);
  putFrame(c, 'fa-dwarf2', F, BOX, g => paintDwarf(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Cupid, flown on wires: a grown cast member in a diaper and a toga sash, stubby wings, a laurel or a heart headband,
// a heart-tipped bow with the arrow always nocked out front (pointy)

const SASHES = ['#F9A8D4', '#FFFFFF', '#FCA5A5', '#F5D0FE'];
/** A little inked heart, its point `a` (radians) the way it points (0: forward); a lit lobe. */
export const heart = (c: Ctx, x: number, y: number, r: number, col: string, a = Math.PI / 2) => {
  c.save(); c.translate(x, y); c.rotate(a - Math.PI / 2);
  c.beginPath(); c.moveTo(0, r * 1.1);
  c.bezierCurveTo(-r * 1.7, -r * 0.1, -r * 0.9, -r * 1.5, 0, -r * 0.5);
  c.bezierCurveTo(r * 0.9, -r * 1.5, r * 1.7, -r * 0.1, 0, r * 1.1); c.closePath();
  c.lineWidth = 2.5; c.strokeStyle = INK; c.stroke(); c.fillStyle = col; c.fill();
  c.fillStyle = dk(col, 0.3); c.beginPath(); c.moveTo(0, r * 1.1); c.bezierCurveTo(r * 1.7, -r * 0.1, r * 0.9, -r * 1.5, 0, -r * 0.5); c.lineTo(r * 0.2, r * 0.4); c.closePath(); c.fill();
  c.fillStyle = lt(col, 0.5); c.fillRect(Math.round(-r * 0.75), Math.round(-r * 0.75), Math.max(1, Math.round(r * 0.4)), Math.max(1, Math.round(r * 0.35)));
  c.restore();
};
/** A heart-tipped arrow pointing along `a` from (x, y) (its tip there): pink fletching, a red heart for a head. */
export const heartArrow = (c: Ctx, x: number, y: number, a: number, len = 26) => {
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = INK; c.fillRect(-len, -1.5, len - 4, 3); c.fillStyle = '#E8C898'; c.fillRect(-len + 1, -0.5, len - 6, 1);
  // (the fletching: two pink vanes, stepped)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-len - 2, -5); c.lineTo(-len + 7, -1); c.lineTo(-len + 7, 1); c.lineTo(-len - 2, 5); c.closePath(); c.fill();
  c.fillStyle = '#F472B6'; c.beginPath(); c.moveTo(-len - 1, -3.5); c.lineTo(-len + 6, -0.5); c.lineTo(-len + 6, 0); c.lineTo(-len - 1, 0); c.closePath(); c.fill();
  c.fillStyle = '#DB2777'; c.beginPath(); c.moveTo(-len - 1, 0); c.lineTo(-len + 6, 0); c.lineTo(-len + 6, 0.5); c.lineTo(-len - 1, 3.5); c.closePath(); c.fill();
  heart(c, -4, 0, 4.5, '#EF4444', 0);
  c.restore();
};
/** A stubby little wing off the back: fat, white, rows of feathers in steps, flapping. */
const wing = (g: Ctx, x: number, y: number, flap: number, col: string) => {
  g.save(); g.translate(x, y); g.rotate(-0.6 - flap);
  part(g, () => g.ellipse(-9, 0, 12, 7, 0, 0, Math.PI * 2), col, -21, -7, 24, 14, 1.2);
  for (let k = 0; k < 4; k++) part(g, () => g.ellipse(-19 + k * 5, 5, 3.2, 3, 0, 0, Math.PI * 2), dk(col, 0.06), -22 + k * 5, 2, 7, 6, 1);
  for (let k = 0; k < 3; k++) px(g, -15 + k * 5, -2, 3, 1, dk(col, 0.18));
  px(g, -14, -4, 6, 1, '#FFFFFF');
  g.restore();
};
/** The bow: a gilt recurve, held upright out front; its string pulled back to `sx`; the arrow nocked on it. */
const bow = (g: Ctx, bx: number, by: number, sx: number, glint: boolean) => {
  g.lineCap = 'round';
  for (const [w, col, o] of [[5, INK, 0], [3, '#B07A1E', 0], [1.2, '#F6D365', -1]] as const) {
    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(bx - 4 + o, by - 18); g.quadraticCurveTo(bx - 1 + o, by - 15, bx + 3 + o, by - 10); g.quadraticCurveTo(bx + 9 + o, by, bx + 3 + o, by + 10); g.quadraticCurveTo(bx - 1 + o, by + 15, bx - 4 + o, by + 18); g.stroke();
  }
  g.lineCap = 'butt';
  ball(g, bx + 6, by, 2.4, '#F472B6', 0.8);
  g.strokeStyle = '#F5F5F4'; g.lineWidth = 1; g.beginPath(); g.moveTo(bx - 4, by - 17); g.lineTo(sx, by); g.lineTo(bx - 4, by + 17); g.stroke();
  heartArrow(g, bx + 12, by, 0, bx + 12 - sx);
  if (glint) { px(g, bx + 10, by - 7, 2, 14, '#FFFFFF'); px(g, bx + 4, by - 1, 14, 2, '#FFFFFF'); }
};
interface CupidLook { seed: number; isDead: boolean; md: string; pose: string | null; onWire: boolean; draw: boolean; swoop: boolean; rear: boolean; flap: number; kick: number; pull: number; glint: boolean }
const paintCupid = (g: Ctx, P: CupidLook) => {
  const L = lookOf(P.seed), sash = SASHES[((Math.floor(P.seed) % SASHES.length) + SASHES.length) % SASHES.length], hearts = Math.floor(P.seed / 5) % 2 === 0;
  const fat = L.heavy ? 4 : 0, man = !L.woman, { isDead, md, pose } = P;
  // (the wings on its back: up alive; dead, torn half off and hanging down its back (on it, so they go down with it))
  if (!isDead) { wing(g, -6, -43, P.flap + 0.25, '#E5E7EB'); wing(g, -9, -38, P.flap, '#FFFFFF'); }
  else { wing(g, -5, -42, 0.8, '#E5E7EB'); wing(g, -8, -38, 1.05, '#FFFFFF'); }
  // (the harness between the wings, the wire's ring)
  if (P.onWire) { px(g, -9, -45, 6, 3, INK); px(g, -8, -44, 4, 1, '#A8AEB8'); px(g, -7, -48, 2, 3, '#A8AEB8'); }
  // (the legs dangling, bare, knees bent, kicking a little; little feet)
  const kick = P.kick, lw = 6 + fat / 2;
  limb(g, -4, -18, -8 + kick, -3, lw, dk(L.skin, 0.12)); limb(g, 4, -18, 9 - kick, -5, lw, L.skin);
  part(g, () => g.ellipse(-6 + kick, -2, 4.5, 2.6, 0, 0, Math.PI * 2), dk(L.skin, 0.12), -11 + kick, -5, 9, 5, 1); part(g, () => g.ellipse(11 - kick, -4, 4.5, 2.6, 0, 0, Math.PI * 2), L.skin, 6 - kick, -7, 9, 5, 1);
  // (the body, bare: a belly on the heavy ones, a navel, chest hair on the hairy men; a woman's in a toga top)
  part(g, () => g.ellipse(0, -32, 10 + fat, 13, 0, 0, Math.PI * 2), L.skin, -10 - fat, -45, 20 + fat * 2, 26, 1.2);
  if (fat) part(g, () => g.ellipse(3, -27, 8 + fat * 0.6, 6, 0, 0, Math.PI * 2), lt(L.skin, 0.06), -5 - fat, -33, 16 + fat, 12, 0.8);
  px(g, 3, -28, 2, 1, dk(L.skin, 0.35));
  if (man && L.face >= 1) for (const [x, y] of [[-3, -38], [1, -36], [4, -39], [-1, -33], [3, -32], [0, -40]]) px(g, x, y, 2, 2, dk(L.hair, 0.1));
  // (the diaper: white, bulky, in steps, its folds, a gold safety pin)
  part(g, () => g.roundRect(-12 - fat, -27, 24 + fat * 2, 13, [3, 3, 7, 7]), '#F4F2EE', -12 - fat, -27, 24 + fat * 2, 13, 1.4);
  px(g, -11 - fat, -26, 22 + fat * 2, 1, '#FFFFFF'); for (const x of [-6, 0, 6]) px(g, x, -22, 1, 6, '#C8C4BC');
  px(g, -8 - fat, -18, 16 + fat * 2, 1, '#D8D4CC');
  px(g, 5 + fat, -25, 5, 1, '#B07A1E'); px(g, 8 + fat, -26, 1, 4, '#F6D365'); px(g, 5 + fat, -23, 4, 1, '#F6D365');
  // (the toga sash over a shoulder, across the chest; a woman's wide enough to cover)
  limb(g, -7, -44, 9 + fat, -24, L.woman ? 8 : 5, sash);
  if (L.woman) part(g, () => g.rect(-10 - fat, -41, 20 + fat * 2, 7), sash, -10 - fat, -41, 20 + fat * 2, 7, 1);
  // (the arms: the far one out with the bow, the near one at the string, pulled back in the draw)
  const bx = 18, by = -34, sx = bx - 6 - P.pull * 12;
  if (!isDead) {
    limb(g, 4, -40, bx - 2, by, 4, dk(L.skin, 0.08));
    if (!pose) bow(g, bx, by, sx, P.glint);
    limb(g, -2, -40, pose ? -14 : sx, pose ? -58 : by, 4, L.skin);
    ball(g, pose ? -14 : sx, pose ? -58 : by, 2.6, L.skin, 0.8);
  } else limb(g, 2, -40, 14, -22, 4, L.skin);
  // (the head: whoever's under the headband; long hair down the back or curls, a beard or a mustache on the men)
  if (L.long) part(g, () => g.roundRect(-11, -57, 7, 21, 3), L.hair, -11, -57, 7, 21, 1);
  part(g, () => g.ellipse(1, -50, 8.5, 9, 0, 0, Math.PI * 2), L.skin, -7.5, -59, 17, 18, 1.2);
  dither(g, 4, -48, 4, 3, '#F49AB0');
  if (!L.bald) {
    if (L.long || L.woman) partTop(g, () => g.roundRect(-8, -61, 17, 6, [4, 4, 1, 1]), L.hair, -8, -61, 17, 6, 1);
    else for (let k = 0; k < 4; k++) part(g, () => g.arc(-5 + k * 4, -58, 3, 0, Math.PI * 2), L.hair, -8 + k * 4, -61, 6, 6, 0.8);
  }
  if (man && L.face === 2) part(g, () => g.roundRect(-5, -46, 13, 6, 3), L.hair, -5, -46, 13, 6, 1);
  if (man && L.face === 1) px(g, 1, -46, 7, 2, L.hair);
  if (md === 'dead') { px(g, 0, -53, 3, 1, INK); px(g, 1, -54, 1, 3, INK); px(g, 5, -53, 3, 1, INK); px(g, 6, -54, 1, 3, INK); }
  else if (md === 'hurt') { px(g, 0, -53, 3, 1, INK); px(g, 5, -53, 3, 1, INK); }
  else { px(g, 0, -55, 3, 3, '#FFFFFF'); px(g, 5, -55, 3, 3, '#FFFFFF'); px(g, 1, -54, 2, 2, INK); px(g, 6, -54, 2, 2, INK); if (P.draw) px(g, 0, -57, 9, 1, INK); }
  if (!(man && L.face === 2)) { px(g, 2, -45, P.draw || P.swoop ? 5 : 4, P.draw ? 1 : 2, INK); if (!P.draw && md !== 'dead') px(g, 3, -45, 2, 1, '#FFFFFF'); }
  px(g, 8, -51, 2, 2, dk(L.skin, 0.15));
  // (the headband: a laurel wreath, or pink with a heart on the front; askew, dead)
  const tilt = isDead ? 3 : 0;
  if (hearts) { part(g, () => g.rect(-8, -57 + tilt, 18, 4), '#F472B6', -8, -57 + tilt, 18, 4, 1); heart(g, 7, -57 + tilt, 3.5, '#EF4444'); }
  else for (let k = 0; k < 5; k++) part(g, () => g.ellipse(-7 + k * 4, -57 + tilt + (k % 2), 2.6, 1.6, -0.5 + k * 0.25, 0, Math.PI * 2), '#4D7C0F', -10 + k * 4, -60 + tilt, 6, 5, 0.8);
  if (isDead) {
    // (dead: the bow dropped, the wire snapped: a curl of it on the harness)
    g.strokeStyle = 'rgba(200, 200, 220, 0.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-6, -40); g.bezierCurveTo(-18, -48, -20, -30, -10, -32); g.bezierCurveTo(-2, -34, -14, -22, -22, -26); g.stroke();
  }
};
export const drawCupid = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { md, isDead, pose, flung } = layOf(e);
  const onWire = !isDead && !pose;
  const draw = e.aiState === 'draw', rear = e.aiState === 'rear', swoop = e.aiState === 'swoop';
  const ff = Math.floor(f / (rear || swoop ? 3 : 5)) % 4;
  const flap = onWire ? [0, 0.35, 0.5, 0.35][ff] - 0.2 : 0.2, kick = onWire ? [0, 2, 3, 2][Math.floor(f / 7) % 4] - 1 : 0;
  const pull = draw ? Math.min(1, Math.floor(Math.min(1, (e.aiTimer ?? 0) / 18) * 4) / 4) : 0;
  const glint = draw && (e.aiTimer ?? 0) > 20 && f % 4 < 2;
  // (the wire it's flown on, up out of the picture from the harness between the wings: thin, dim)
  if (onWire) { c.strokeStyle = 'rgba(200, 200, 220, 0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-6, -46); c.lineTo(-6, -700); c.stroke(); }
  c.save();
  const spin = flung ? Math.sin(f * 0.6) * 0.3 : onWire ? (swoop ? 0.35 : rear ? -0.25 : 0) : 0;
  const P: CupidLook = { seed, isDead, md, pose, onWire, draw, swoop, rear, flap, kick, pull, glint };
  mascot(c, `fa-cupid-${seed}-${isDead ? 1 : 0}-${md}-${pose ?? '-'}-${onWire ? ff : 9}-${kick}-${pull}-${glint ? 1 : 0}-${draw ? 1 : 0}${swoop ? 's' : ''}`, spin, [-40, -76, 110, 90], g => paintCupid(g, P));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The gingerbread man (a foam cookie suit, the performer's face through its mouth)

const COOKIE = '#B8743A', ICE = '#FFF7ED';
/** Piped icing along a line (a zigzag, a little raised: lit along its top). */
const piping = (g: Ctx, x: number, y: number, w: number) => {
  for (let k = 0; k < w; k += 3) { const yy = y + (Math.floor(k / 3) % 2 ? 1 : -1); px(g, x + k, yy, 3, 2, ICE); px(g, x + k, yy + 2, 3, 1, '#D8CCBC'); }
};
const paintGinger = (g: Ctx, seed: number, pose: { crouch: boolean; leap: boolean; down: boolean; walk: number; hurt: boolean; isDead: boolean }, f: number) => {
  const { crouch, leap, down, walk, hurt, isDead } = pose, edge = dk(COOKIE, 0.2);
  // (the legs: stubby cookie legs, their baked edges, icing zigzags at the ankles)
  limb(g, -10, -30, -12 - walk, -8, 15, edge); limb(g, -10, -30, -12 - walk, -8, 12, dk(COOKIE, 0.12), false);
  limb(g, 10, -30, 12 + walk, -8, 15, COOKIE);
  for (const x of [-12 - walk, 12 + walk]) { part(g, () => g.ellipse(x, -5, 9, 6, 0, 0, Math.PI * 2), x < 0 ? dk(COOKIE, 0.12) : COOKIE, x - 9, -11, 18, 12, 1.2); piping(g, x - 6, -13, 12); }
  // (the far arm)
  const ay = leap ? -84 : crouch ? -56 : -52;
  limb(g, -18, -58, -34, ay, 14, dk(COOKIE, 0.15)); part(g, () => g.arc(-35, ay, 7, 0, Math.PI * 2), dk(COOKIE, 0.15), -42, ay - 7, 14, 14, 1.2); piping(g, -38, ay - 10, 8);
  // (the body: cookie in steps, its rim darker, three gumdrop buttons, a candy bow tie, flecks of sugar)
  part(g, () => g.ellipse(0, -44, 25, 23, 0, 0, Math.PI * 2), COOKIE, -25, -67, 50, 46, 1.6);
  g.strokeStyle = edge; g.lineWidth = 2; g.beginPath(); g.ellipse(0, -44, 22, 20, 0, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 8; k++) px(g, -16 + ((k * 37 + seed) % 30), -60 + ((k * 23) % 30), 1, 1, '#FFF6E0');
  for (const [k, col] of [[0, '#EF4444'], [1, '#22C55E'], [2, '#3B82F6']] as const) { ball(g, 2, -54 + k * 10, 3.8, col, 1); px(g, 0, -56 + k * 10, 1, 1, '#FFFFFF'); }
  part(g, () => { g.moveTo(-8, -70); g.lineTo(-1, -66); g.lineTo(-8, -62); g.closePath(); }, '#DB2777', -8, -70, 7, 8, 1); part(g, () => { g.moveTo(10, -70); g.lineTo(3, -66); g.lineTo(10, -62); g.closePath(); }, '#DB2777', 3, -70, 7, 8, 1);
  ball(g, 1, -66, 2.4, '#F9A8D4', 0.8);
  piping(g, -18, -30, 36);
  if (isDead) {
    // (dead: the cookie head knocked off, hanging down his chest by the neck, a bite out of it; the performer's own head,
    // small, on the big body (all on him, so it goes down with him, never left floating where the floor was))
    px(g, -6, -70, 12, 4, dk(COOKIE, 0.4));
    performer(g, seed, 2, -76, 9, true, true, true);
    g.save(); g.translate(14, -46); g.rotate(1.15);
    part(g, () => g.ellipse(0, 0, 17, 15, 0, 0, Math.PI * 2), COOKIE, -17, -15, 34, 30, 1.4);
    g.fillStyle = '#4A2A14'; for (const [bx, by, r] of [[13, -9, 6], [16, 0, 5]] as const) { g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#E8C898'; for (const [bx, by, r] of [[12, -9, 4], [15, 0, 3]] as const) { g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.fill(); }
    ball(g, -5, -6, 2.5, ICE, 0.8); ball(g, 5, -6, 2.5, ICE, 0.8);
    g.restore();
  } else {
    // (the cookie head, round; its baked rim; icing eyes and an icing smile round the face hole)
    part(g, () => g.ellipse(2, -88, 22, 21, 0, 0, Math.PI * 2), COOKIE, -20, -109, 44, 42, 1.6);
    g.strokeStyle = edge; g.lineWidth = 2; g.beginPath(); g.ellipse(2, -88, 19, 18, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(2, -88, 16, 0.25, Math.PI - 0.25); g.stroke();
    g.strokeStyle = ICE; g.lineWidth = 2.4; g.beginPath(); g.arc(2, -88, 16, 0.25, Math.PI - 0.25); g.stroke();
    ball(g, -6, -98, 3.2, ICE, 1); ball(g, 10, -98, 3.2, ICE, 1); px(g, -6, -98, 2, 2, INK); px(g, 10, -98, 2, 2, INK);
    part(g, () => g.roundRect(-10, -92, 24, 15, 4), '#2A1408', -10, -92, 24, 15, 1.2);
    performer(g, seed, 2, -85, 7, hurt, false);
  }
  // (the near arm, out at him (up in the leap))
  const nx = leap ? 34 : 30, ny = leap ? -86 : crouch ? -52 : -40;
  limb(g, 18, -58, nx, ny, 14, COOKIE); part(g, () => g.arc(nx + 1, ny, 7, 0, Math.PI * 2), COOKIE, nx - 6, ny - 7, 14, 14, 1.2); piping(g, nx - 3, ny - 10, 8);
  if (down) stars(g, 2, -112, f);
};
export const drawGinger = (c: Ctx, e: Enemy, f: number) => {
  const { md, isDead, pose, flung } = layOf(e), seed = seedOfE(e);
  const crouch = e.aiState === 'crouch', leap = e.aiState === 'leap', down = e.aiState === 'down' && !pose;
  const wf = Math.abs(e.vel.x) > 0.3 ? Math.floor(f / 5) % 6 : 0, walk = wf ? Math.round(Math.sin((wf / 6) * Math.PI * 2) * 6) : 0;
  c.save();
  if (crouch) c.scale(1.08, 0.86);
  if (down) c.translate(6, 4);
  const spin = flung ? Math.sin(f * 0.6) * 0.3 : down ? 0.35 : 0;
  const P = { crouch, leap, down, walk, hurt: md === 'hurt', isDead };
  mascot(c, `fa-ginger-${seed}-${md}-${pose ?? '-'}-${crouch ? 'c' : leap ? 'l' : '-'}-${wf}`, spin, [-50, -130, 120, 134], g => paintGinger(g, seed, P, f));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The unicorn mascot (a plush suit, a rainbow mane, a gold horn out front: pointy)

const COATS = ['#FFFFFF', '#FCE7F3', '#EDE9FE', '#E0F2FE'];
const MANE = ['#F87171', '#FBBF24', '#4ADE80', '#60A5FA', '#A78BFA'];
const horn = (g: Ctx, x: number, y: number, a: number, len = 26) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => { g.moveTo(0, -5); g.lineTo(len, 0); g.lineTo(0, 5); g.closePath(); }, '#F6D365', 0, -5, len, 10, 1.2);
  for (let k = 3; k < len - 3; k += 4) { g.strokeStyle = '#B07A1E'; g.lineWidth = 1; g.beginPath(); g.moveTo(k, -4 + k * 0.15); g.lineTo(k + 3, 4 - k * 0.15); g.stroke(); px(g, k + 1, -3 + k * 0.15, 1, 1, '#FFF4B8'); }
  g.restore();
};
const paintUnicorn = (g: Ctx, seed: number, P: { paw: boolean; charge: boolean; dizzy: boolean; walk: number; pawK: number; hurt: boolean; isDead: boolean; tail: number }, f: number) => {
  const coat = COATS[((Math.floor(seed) % COATS.length) + COATS.length) % COATS.length], { paw, charge, dizzy, walk, pawK, hurt, isDead } = P;
  // (the tail: a rainbow swish out behind, in strands)
  for (let k = 0; k < 5; k++) { for (const [w, col] of [[5, INK], [3, MANE[k]]] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(-22, -50 + k * 2); g.quadraticCurveTo(-46, -44 + k * 3 + P.tail, -40, -22 + k * 3); g.stroke(); } }
  for (let k = 0; k < 5; k++) { g.strokeStyle = lt(MANE[k], 0.4); g.lineWidth = 1; g.beginPath(); g.moveTo(-24, -51 + k * 2); g.quadraticCurveTo(-46, -46 + k * 3 + P.tail, -41, -24 + k * 3); g.stroke(); }
  // (the legs, plush, lilac hooves; one pawing in the tell)
  limb(g, -10, -30, -12 - walk, -8, 16, dk(coat, 0.12)); limb(g, 12, -30, 14 + walk + pawK * 0.5, -8 - pawK, 16, coat);
  part(g, () => g.ellipse(-12 - walk, -4, 9, 5, 0, 0, Math.PI * 2), '#A78BFA', -21 - walk, -9, 18, 10, 1.2); part(g, () => g.ellipse(16 + walk + pawK * 0.5, -4 - pawK, 9, 5, 0, 0, Math.PI * 2), '#A78BFA', 7 + walk + pawK * 0.5, -9 - pawK, 18, 10, 1.2);
  // (the body: plush in steps, a pale belly, a few sparkles stitched on)
  part(g, () => g.ellipse(0, -52, 27, 29, 0, 0, Math.PI * 2), coat, -27, -81, 54, 58, 1.6);
  part(g, () => g.ellipse(7, -46, 13, 18, 0, 0, Math.PI * 2), lt(coat, 0.4), -6, -64, 26, 36, 0.8);
  for (const [sx, sy] of [[-12, -62], [-4, -40], [-16, -46]] as const) { px(g, sx - 2, sy, 5, 1, '#F6D365'); px(g, sx, sy - 2, 1, 5, '#F6D365'); }
  if (isDead) {
    // (dead: the head knocked off, hanging down its chest by the neck, the horn snapped short; the performer's own head
    // on the plush body (all on it, so it goes down with it, never left floating where the floor was))
    px(g, -6, -82, 12, 6, dk(coat, 0.3));
    performer(g, seed, 4, -88, 9, true, true, true);
    g.save(); g.translate(20, -54); g.rotate(1.2);
    horn(g, 2, -10, -0.9, 10);
    part(g, () => g.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2), coat, -18, -12, 36, 24, 1.4);
    for (let k = 0; k < 5; k++) px(g, -12 + k * 3, -12 + k, 4, 9, MANE[k]);
    px(g, 10, -3, 2, 2, INK);
    g.restore();
  } else {
    // (the neck up front, the performer's face through a hole in it; the horse head, its felt eye, the mane, the horn)
    const hd = charge || paw ? 10 : 0;
    limb(g, 6, -72, 18, -88 + hd, 19, coat);
    part(g, () => g.ellipse(10, -76, 9, 8, 0, 0, Math.PI * 2), '#2A1A2A', 1, -84, 18, 16, 1);
    performer(g, seed, 10, -76, 7, hurt || dizzy, false);
    part(g, () => g.ellipse(26, -92 + hd, 19, 14, 0, 0, Math.PI * 2), coat, 7, -106 + hd, 38, 28, 1.4);
    part(g, () => g.ellipse(41, -88 + hd, 10, 8, 0, 0, Math.PI * 2), lt(coat, 0.15), 31, -96 + hd, 20, 16, 1);
    px(g, 44, -91 + hd, 2, 2, INK); px(g, 40, -84 + hd, 6, 1, dk(coat, 0.3));
    ball(g, 24, -97 + hd, 4, '#FFFFFF', 1); px(g, 24, -98 + hd, 2, 3, INK); px(g, 23, -99 + hd, 1, 1, '#FFFFFF');
    for (let k = 0; k < 3; k++) px(g, 20 + k * 2, -102 + hd - (k % 2), 1, 2, INK);
    part(g, () => { g.moveTo(14, -100 + hd); g.lineTo(18, -112 + hd); g.lineTo(22, -101 + hd); g.closePath(); }, coat, 14, -112 + hd, 8, 12, 1);
    for (let k = 0; k < 5; k++) { part(g, () => g.roundRect(4 + k * 3, -106 + hd + k * 2, 5, 16 + (k % 2) * 3, 2), MANE[k], 4 + k * 3, -106 + hd + k * 2, 5, 19, 0.8); }
    horn(g, 30, -104 + hd, charge || paw ? -0.05 : -0.9);
  }
  // (the arms, little, in front)
  limb(g, 14, -66, 28, paw ? -56 : -50, 11, coat); part(g, () => g.arc(28, paw ? -55 : -49, 5, 0, Math.PI * 2), '#A78BFA', 23, (paw ? -55 : -49) - 5, 10, 10, 1);
  if (dizzy) stars(g, 10, -120, f);
};
export const drawUnicorn = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const { md, isDead, pose, flung } = layOf(e);
  const paw = e.aiState === 'paw', charge = e.aiState === 'charge', dizzy = e.aiState === 'dizzy';
  const wf = charge ? Math.floor(f / 3) % 6 : Math.abs(e.vel.x) > 0.3 ? Math.floor(f / 5) % 6 : 0;
  const walk = wf || charge ? Math.round(Math.sin((wf / 6) * Math.PI * 2) * (charge ? 9 : 5)) : 0;
  const pf = paw ? Math.floor(f / 4) % 4 : 0, pawK = paw ? [0, 5, 10, 5][pf] : 0, tf = Math.floor(f / 8) % 4, tail = [0, 2, 3, 1][tf];
  const lean = charge ? 0.2 : paw ? 0.12 : 0;
  c.save();
  const spin = flung ? Math.sin(f * 0.6) * 0.3 : lean;
  const P = { paw, charge, dizzy, walk, pawK, hurt: md === 'hurt', isDead, tail };
  // (leaning into a charge: tipped from the hips)
  if (spin && !flung) { c.translate(0, -40); }
  mascot(c, `fa-unicorn-${seed}-${md}-${pose ?? '-'}-${wf}-${pf}-${tf}-${dizzy ? Math.floor(f / 3) % 8 : 0}`, spin, [-60, -130, 140, 134], g => { if (spin && !flung) g.translate(0, 40); paintUnicorn(g, seed, P, f); });
  c.restore();
};
