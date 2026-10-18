// Sawdust Gulch's townsfolk, drawn (the prototype first pass, on Spooky Land's person drawer, costume.ts, as the train's
// cast is: whoever's in the costume shows: their skin, build and face, man or woman). Each seeded: no two the same.
// Each drawn hurt (eyes shut), knocked about (held, flung, dazed) and dead (limp, crossed-out eyes), so the engine's
// special deaths all play out on them right. Feet at the origin, facing right (the engine mirrors them).
//
//   deputy      a tan shirt, a leather vest with a tin star, a cowboy hat, chaps; the six-shooter
//   sheriff     a black vest and a long duster, a big white hat, a gold star, a mustache you could sweep with; two guns
//   snakeoil    a loud checked suit, a bow tie, a bowler; a bottle of DR. PEABODY'S MIRACLE TONIC
//   barber      the quartet: red-and-white striped vests, straw boaters, sleeve garters, bow ties; a straight razor
//   bouncer     huge: a striped undershirt, suspenders, a bowler two sizes small; fists like hams
//   dancer      the can-can: ruffled skirts (on everybody: the men too), a feather in the hair, striped stockings
//   undertaker  tall, thin, pale: a frock coat and a stovepipe hat; a tape measure, then the spade
//   blacksmith  a leather apron, bare arms, soot; the hammer; a horseshoe glowing in the tongs
//   farmhand    a straw hat, a checked shirt, overalls; the pitchfork (pointy)
//   feller      buffalo-check flannel, suspenders, a felt hat; the felling axe, a hatchet on the belt
//   birler      a striped shirt, rolled trousers, spiked boots; arms out for balance, a pike pole
//   miner       a hard hat with a lit candle on it (spiky), a sooty face, suspenders; the pickaxe
//   prospector  a floppy hat, red long johns, a patched vest, a beard to the belt (or a corncob pipe); the dynamite
//   crate       a TNT crate (not a person): stenciled, a skull on it

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, limb, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, woman?: boolean, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, woman, v);
};
const BOX: [number, number, number, number] = [-64, -140, 140, 144];
const face = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk') => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};
/** Where the hands go for this pose (far, near), knocked about or not. */
const handsAt = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};

// ---------------------------------------------------------------------------------------------------------------
// Hats

const cowboyHat = (g: Ctx, B: Body, col: string, band: string, big = 1) => {
  partTop(g, () => { g.moveTo(B.hx - 7 * big, B.hy - 8); g.quadraticCurveTo(B.hx - 6 * big, B.hy - 20 - 3 * big, B.hx + 1, B.hy - 17 - 2 * big); g.quadraticCurveTo(B.hx + 8 * big, B.hy - 20 - 3 * big, B.hx + 9 * big, B.hy - 8); g.closePath(); }, col, B.hx - 8 * big, B.hy - 24, 18 * big, 16, 1);
  part(g, () => g.ellipse(B.hx + 1, B.hy - 8, 15 * big, 3.2, 0, 0, Math.PI * 2), dk(col, 0.1), B.hx - 15 * big, B.hy - 11, 30 * big, 6, 1);
  px(g, B.hx - 7 * big, B.hy - 11, 16 * big, 2, band);
};
const bowler = (g: Ctx, B: Body, col: string, small = 1) => {
  partTop(g, () => g.ellipse(B.hx + 1, B.hy - 10, 9 * small, 8 * small, 0, Math.PI, 0), col, B.hx - 8, B.hy - 18, 18, 9, 1);
  part(g, () => g.ellipse(B.hx + 1, B.hy - 10, 12 * small, 2.4, 0, 0, Math.PI * 2), col, B.hx - 11, B.hy - 13, 24, 5, 1);
};
const boater = (g: Ctx, B: Body, band: string) => {
  partTop(g, () => g.rect(B.hx - 8, B.hy - 17, 18, 7), '#F2D98A', B.hx - 8, B.hy - 17, 18, 7, 1);
  px(g, B.hx - 8, B.hy - 13, 18, 3, band);
  part(g, () => g.ellipse(B.hx + 1, B.hy - 10, 15, 2.6, 0, 0, Math.PI * 2), '#E8C870', B.hx - 14, B.hy - 13, 30, 5, 1);
};
const stovepipe = (g: Ctx, B: Body) => {
  partTop(g, () => g.rect(B.hx - 7, B.hy - 34, 15, 25), '#0C0A09', B.hx - 7, B.hy - 34, 15, 25, 1);
  part(g, () => g.rect(B.hx - 11, B.hy - 11, 23, 3), '#0C0A09', B.hx - 11, B.hy - 11, 23, 3, 1);
  px(g, B.hx - 7, B.hy - 15, 15, 3, '#3F3F46');
};
const strawHat = (g: Ctx, B: Body) => {
  partTop(g, () => g.ellipse(B.hx + 1, B.hy - 11, 8, 7, 0, Math.PI, 0), '#D9B45A', B.hx - 7, B.hy - 18, 16, 8, 1);
  part(g, () => g.ellipse(B.hx + 1, B.hy - 10, 16, 3.4, 0.05, 0, Math.PI * 2), '#E8C870', B.hx - 15, B.hy - 13, 32, 7, 1);
  for (let k = -12; k < 14; k += 4) px(g, B.hx + k, B.hy - 9 + (k % 8 === 0 ? 2 : 1), 1, 2, '#B08A3A');
};
/** A miner's hard hat, the candle on its front lit (the dive kick's undoing: spiky). */
const candleHat = (g: Ctx, B: Body, f: number, lit: boolean) => {
  partTop(g, () => g.ellipse(B.hx, B.hy - 7, 10, 9, 0, Math.PI, 0), '#7A5A2A', B.hx - 10, B.hy - 16, 20, 9, 1);
  part(g, () => g.rect(B.hx - 12, B.hy - 8, 25, 3), '#6A4A20', B.hx - 12, B.hy - 8, 25, 3, 1);
  px(g, B.hx + 2, B.hy - 22, 4, 8, '#F5F0DC'); px(g, B.hx + 1, B.hy - 15, 6, 2, '#A8A29E');
  if (lit) { const w = f % 6 < 3 ? 0 : 1; ball(g, B.hx + 4, B.hy - 26 + w, 2.6, '#FDE047', 0.5); px(g, B.hx + 3, B.hy - 28 + w, 2, 2, '#FFFFFF'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The deputy and the sheriff

const gun = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.rect(0, -3, 15, 4), '#52525B', 0, -3, 15, 4, 0.8); part(g, () => g.rect(-2, -1, 5, 8), '#6B4423', -2, -1, 5, 8, 0.8);
  px(g, 3, -1, 5, 3, '#71717A');
  g.restore();
};
const SHIRTS = ['#C8A878', '#9AA8B8', '#B88A6A', '#D8C8A8'];
const paintDeputy = (g: Ctx, F: Frame, sheriff: boolean) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, shirt = sheriff ? '#E7E5E4' : pickOf(F.seed, 2, SHIRTS);
  if (sheriff) { B.w += 2; }
  legs(g, B, { col: '#4A5A78', shoe: 'boot', shoeCol: '#5A3A1E', detail: (gg, hip, _k, ft, near) => { if (near) px(gg, Math.min(hip[0], ft[0]) - 3, hip[1] + 4, 8, ft[1] - hip[1] - 10, 'rgba(120, 72, 32, 0.55)'); } });
  const aim = F.pose === 'tell' && F.v !== 'whip', sw = F.pose === 'strike' || F.v === 'whip';
  const H = handsAt(B, F, aim && sheriff ? [B.w / 2 + 18, B.shY + 10] : [-B.w / 2 - 2, B.shY + 18], aim ? [B.w / 2 + 22, B.shY + 4] : sw ? [B.w / 2 + 14, B.shY + 2] : [B.w / 2 + 4, B.hipY - 2]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(shirt, 0.1), hand: L.skin });
  if (sheriff) {
    // (the duster, long behind)
    part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 8, -6); g.lineTo(B.hipW / 2 - 2, -10); g.lineTo(B.w / 2 - 2, B.shY + 2); g.closePath(); }, '#57452E', -B.hipW / 2 - 8, B.shY + 2, B.hipW + 6, -B.shY - 6, 1.2);
  }
  torso(g, B, shirt);
  // (the vest, the star, the gunbelt)
  part(g, () => { g.moveTo(-B.w / 2 + 1, B.shY + 2); g.lineTo(-B.hipW / 2 + 1, B.hipY); g.lineTo(-2, B.hipY); g.lineTo(-3, B.shY + 8); g.closePath(); }, sheriff ? '#1C1917' : '#7A4A2A', -B.w / 2, B.shY + 2, B.w / 2, B.hipY - B.shY, 1);
  part(g, () => { g.moveTo(B.w / 2 - 1, B.shY + 2); g.lineTo(B.hipW / 2 - 1, B.hipY); g.lineTo(3, B.hipY); g.lineTo(4, B.shY + 8); g.closePath(); }, sheriff ? '#1C1917' : '#7A4A2A', 2, B.shY + 2, B.w / 2, B.hipY - B.shY, 1);
  const sx = B.w / 2 - 6, sy = B.shY + 10;
  part(g, () => { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 2 : 4.6; g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.closePath(); }, sheriff ? '#EAB308' : '#D4D4D8', sx - 5, sy - 5, 10, 10, 0.7);
  px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 4, '#3F2A14'); px(g, -2, B.hipY - 3, 4, 4, '#CA8A04');
  if (!aim) px(g, B.hipW / 2 - 4, B.hipY - 2, 5, 9, '#5A3A1E');
  hairBack(g, B, L.hair, 14);
  face(g, B, F, aim ? 'angry' : sheriff ? 'smug' : 'open', sw ? 'teeth' : 'flat');
  if (sheriff && !L.woman) part(g, () => { g.moveTo(B.hx - 2, B.hy + 4); g.quadraticCurveTo(B.hx + 4, B.hy + 2, B.hx + 10, B.hy + 4); g.quadraticCurveTo(B.hx + 14, B.hy + 9, B.hx + 13, B.hy + 12); g.quadraticCurveTo(B.hx + 9, B.hy + 7, B.hx + 4, B.hy + 7); g.quadraticCurveTo(B.hx, B.hy + 8, B.hx - 4, B.hy + 12); g.quadraticCurveTo(B.hx - 5, B.hy + 7, B.hx - 2, B.hy + 4); g.closePath(); }, L.hair === '#D6D3D1' ? '#E7E5E4' : L.hair, B.hx - 5, B.hy + 2, 19, 10, 0.8);
  else whiskers(g, B);
  glasses(g, B);
  cowboyHat(g, B, sheriff ? '#F5F0E6' : pickOf(F.seed, 4, ['#8A6A40', '#5A4028', '#A08060']), sheriff ? '#1C1917' : '#3F2A14', sheriff ? 1.25 : 1);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: shirt, hand: L.skin });
  if (!H.held) {
    if (aim) gun(g, H.near[0], H.near[1], 0);
    else if (sw) gun(g, H.near[0], H.near[1], -0.9);
    if (sheriff && aim) gun(g, H.far[0], H.far[1] + 3, 0.05);
  }
};
export const drawDeputy = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const whip = e.aiState === 'whipWind' || e.aiState === 'whip';
  const F = frameFor(e, f, seed, poseOf(e, ['aim', 'whipWind'], ['whip', 'fire']), undefined, whip ? 'whip' : '');
  putFrame(c, 'fr-deputy', F, BOX, g => paintDeputy(g, F, false));
};
export const drawSheriff = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const whip = e.aiState === 'whipWind' || e.aiState === 'whip';
  const F = frameFor(e, f, seed, poseOf(e, ['draw', 'fan', 'whipWind'], ['whip']), undefined, whip ? 'whip' : '');
  putFrame(c, 'fr-sheriff', F, BOX, g => paintDeputy(g, F, true));
};

// ---------------------------------------------------------------------------------------------------------------
// The snake-oil salesman

const tonicBottle = (g: Ctx, x: number, y: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-4, -12, 9, 13, 2), '#3E7A3A', -4, -12, 9, 13, 0.8);
  px(g, -1, -17, 3, 5, '#3E7A3A'); px(g, -1, -19, 3, 2, '#8A5A30'); px(g, -3, -9, 7, 5, '#F5E6C0'); px(g, -2, -8, 5, 1, '#7F1D1D');
  g.restore();
};
const paintSalesman = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, suit = pickOf(F.seed, 2, ['#A85A2A', '#6A3A8A', '#2A6A5A']);
  const check = (gg: Ctx, x: number, y: number, w: number, h: number) => { for (let yy = y + 1; yy < y + h; yy += 4) for (let xx = x + ((yy / 4) % 2 ? 2 : 0); xx < x + w; xx += 4) px(gg, xx, yy, 2, 2, lt(suit, 0.35)); };
  legs(g, B, { col: suit, shoe: 'shoe', shoeCol: '#F5F5F4', detail: (gg, hip, _k, ft) => check(gg, Math.min(hip[0], ft[0]) - 3, hip[1], 7, ft[1] - hip[1] - 4) });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = handsAt(B, F, [-B.w / 2 - 6, B.shY + 8], up ? [B.hx - 2, B.hy - 18] : sw ? [B.w / 2 + 16, B.shY + 6] : [B.w / 2 + 8, B.shY + 10]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: suit, hand: L.skin });
  torso(g, B, suit);
  check(g, -B.w / 2 + 2, B.shY + 2, B.w - 4, B.hipY - B.shY);
  px(g, -3, B.shY, 7, 9, '#F5F5F4'); part(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(0, B.shY + 4); g.lineTo(5, B.shY + 1); g.lineTo(5, B.shY + 7); g.lineTo(0, B.shY + 4); g.lineTo(-5, B.shY + 7); g.closePath(); }, '#B91C1C', -5, B.shY + 1, 10, 6, 0.6);
  hairBack(g, B, L.hair, 12);
  face(g, B, F, up ? 'wide' : 'smug', sw ? 'teeth' : 'grin');
  whiskers(g, B); glasses(g, B);
  bowler(g, B, '#3A2A1A');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: suit, hand: L.skin });
  if (!H.held) tonicBottle(g, H.near[0] + 2, H.near[1] + 2, up ? -0.4 : sw ? 1.4 : 0.1);
};
export const drawSalesman = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'smashWind'], ['smash']));
  putFrame(c, 'fr-snakeoil', F, BOX, g => paintSalesman(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The barbershop quartet

const paintBarber = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose === 'after' ? 'stand' : F.pose, F.fr), L = B.L;
  legs(g, B, { col: '#F5F5F4', shoe: 'shoe', shoeCol: '#1C1917', stripe: '#D4D4D8' });
  const up = F.pose === 'tell', sw = F.pose === 'strike', sing = F.v === 'sing';
  const H = handsAt(B, F, sing ? [-B.w / 2 - 8, B.shY + 4] : [-B.w / 2 - 2, B.shY + 18], up ? [B.hx + 6, B.hy - 12] : sw ? [B.w / 2 + 20, B.shY + 14] : sing ? [B.w / 2 + 10, B.shY + 2] : [B.w / 2 + 4, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#F5F5F4', hand: L.skin });
  torso(g, B, '#F5F5F4');
  // (the striped vest)
  for (let k = -B.w / 2 + 3; k < B.w / 2 - 2; k += 4) px(g, k, B.shY + 3, 2, B.hipY - B.shY - 2, '#DC2626');
  px(g, -B.w / 2 + 2, B.shY + 12, 4, 2, '#1C1917'); px(g, B.w / 2 - 6, B.shY + 12, 4, 2, '#1C1917');
  part(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(0, B.shY + 4); g.lineTo(5, B.shY + 1); g.lineTo(5, B.shY + 7); g.lineTo(0, B.shY + 4); g.lineTo(-5, B.shY + 7); g.closePath(); }, '#1C1917', -5, B.shY + 1, 10, 6, 0.6);
  hairBack(g, B, L.hair, 12);
  face(g, B, F, up || sw ? 'angry' : 'smug', sing ? 'o' : sw ? 'teeth' : 'smile');
  whiskers(g, B); glasses(g, B);
  boater(g, B, pickOf(F.seed, 3, ['#DC2626', '#1D4ED8', '#1C1917']));
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#F5F5F4', hand: L.skin });
  if (!H.held) {
    // (the straight razor: open, the blade catching the light)
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -1.8 : sw ? 0.2 : sing ? -0.6 : 0.9);
    px(g, -2, -2, 9, 4, '#1C1917'); part(g, () => { g.moveTo(6, -3); g.lineTo(20, -2); g.lineTo(20, 2); g.lineTo(6, 2); g.closePath(); }, '#E4E4E7', 6, -3, 14, 5, 0.7); px(g, 7, -3, 12, 1, '#FFFFFF');
    g.restore();
  }
};
export const drawBarber = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const sing = e.aiState === 'quartet' && Math.abs(e.vel.x) < 0.1;
  const F = frameFor(e, f, seed, poseOf(e, ['wind'], ['slash']), undefined, sing ? 'sing' : '');
  putFrame(c, 'fr-barber', F, BOX, g => paintBarber(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The bouncer

const paintBouncer = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  B.w += 12; B.hipW += 8; B.legW += 2; B.armW += 3; B.rx += 1;
  legs(g, B, { col: '#2A2622', shoe: 'boot', shoeCol: '#1C1917' });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = handsAt(B, F, up ? [-B.w / 2 - 10, B.shY - 6] : sw ? [B.w / 2 + 6, B.shY - 10] : [-B.w / 2 + 6, B.shY + 14], up ? [B.w / 2 + 10, B.shY - 6] : sw ? [B.w / 2 + 22, B.shY - 14] : [B.w / 2 - 6, B.shY + 14]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: L.skin, len: 0.2 });
  torso(g, B, '#F5F5F4');
  for (let y = B.shY + 4; y < B.hipY; y += 5) px(g, -B.w / 2 + 2, y, B.w - 4, 2, '#1E3A8A');
  px(g, -B.w / 2 + 5, B.shY, 3, B.hipY - B.shY, '#18181B'); px(g, B.w / 2 - 8, B.shY, 3, B.hipY - B.shY, '#18181B');
  hairBack(g, B, L.hair, 10);
  face(g, B, F, 'angry', up ? 'teeth' : 'flat');
  whiskers(g, B);
  bowler(g, B, '#1C1917', 0.75);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: L.skin, len: 0.2 });
};
export const drawBouncer = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['grabWind'], ['grab']));
  putFrame(c, 'fr-bouncer', F, BOX, g => paintBouncer(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The can-can dancers

const SKIRTS = ['#DC2626', '#DB2777', '#7C3AED', '#0F766E', '#1D4ED8'];
const paintDancer = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, skirt = pickOf(F.seed, 3, SKIRTS);
  const kick = F.pose === 'strike', up = F.pose === 'tell';
  // (the legs: striped stockings; the near one up high for the kick)
  if (kick || up) {
    limb(g, -2, B.hipY + 2, -3, -12, B.legW, '#F5F5F4'); px(g, -7, -5, 10, 5, '#1C1917');
    const tx = kick ? 30 : 14, ty = kick ? B.shY - 4 : B.hipY - 6;
    limb(g, 4, B.hipY + 2, tx, ty, B.legW, '#F5F5F4');
    for (let k = 0.2; k < 1; k += 0.25) px(g, 4 + (tx - 4) * k - 2, B.hipY + 2 + (ty - B.hipY - 2) * k - 1, 4, 2, '#1C1917');
    part(g, () => g.roundRect(tx - 2, ty - 5, 10, 7, 2), '#1C1917', tx - 2, ty - 5, 10, 7, 1);
  } else legs(g, B, { col: '#F5F5F4', shoe: 'boot', shoeCol: '#1C1917', stripe: '#1C1917' });
  const H = handsAt(B, F, [-B.w / 2 - 8, B.shY + 2], up ? [B.hx + 2, B.hy - 16] : [B.w / 2 + 8, B.shY + 6]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: L.skin, len: 0.3 });
  // (the ruffled skirt: layers, lifted on the kick side)
  const lift = kick ? 10 : up ? 5 : 0;
  part(g, () => { g.moveTo(-B.hipW / 2 + 1, B.hipY - 4); g.lineTo(-B.hipW / 2 - 10, B.hipY + 18); g.lineTo(B.hipW / 2 + 10, B.hipY + 18 - lift); g.lineTo(B.hipW / 2 - 1, B.hipY - 4); g.closePath(); }, skirt, -B.hipW / 2 - 10, B.hipY - 4, B.hipW + 20, 22, 1.1);
  for (let k = 0; k < 6; k++) px(g, -B.hipW / 2 - 9 + k * ((B.hipW + 18) / 6), B.hipY + 15 - (lift * k) / 6, 5, 4, '#F5F5F4');
  torso(g, B, skirt, B.shY + 2);
  px(g, -B.w / 2 + 2, B.shY + 1, B.w - 4, 3, '#1C1917');
  hairBack(g, B, L.hair, 16); hairTop(g, B);
  face(g, B, F, up || kick ? 'angry' : 'smug', kick ? 'teeth' : 'smile');
  whiskers(g, B);
  // (the feather)
  part(g, () => { g.moveTo(B.hx - 4, B.hy - 9); g.quadraticCurveTo(B.hx - 12, B.hy - 30, B.hx - 2, B.hy - 34); g.quadraticCurveTo(B.hx - 4, B.hy - 22, B.hx, B.hy - 10); g.closePath(); }, pickOf(F.seed, 5, ['#F9A8D4', '#FDE047', '#F8FAFC', '#18181B']), B.hx - 12, B.hy - 34, 12, 25, 0.8);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: L.skin, len: 0.3 });
  // (a whiskey bottle, up for the throw)
  if (!H.held && up) { part(g, () => g.roundRect(H.near[0] - 3, H.near[1] - 16, 7, 13, 2), '#8A5A20', H.near[0] - 3, H.near[1] - 16, 7, 13, 0.8); px(g, H.near[0] - 1, H.near[1] - 20, 3, 4, '#8A5A20'); }
};
export const drawDancer = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'kickWind'], ['kick']));
  putFrame(c, 'fr-dancer', F, BOX, g => paintDancer(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The undertaker

const paintUndertaker = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, pale = lt(L.skin, 0.3);
  B.shY -= 6; B.hy -= 6; B.w -= 3; B.hipW -= 2;
  legs(g, B, { col: '#18181B', shoe: 'pointy', shoeCol: '#0C0A09' });
  const meas = F.v === 'measure', up = F.pose === 'tell' && !meas, sw = F.pose === 'strike';
  const H = handsAt(B, F, meas ? [B.w / 2 + 6, B.shY + 4] : [-B.w / 2 - 2, B.shY + 22], meas ? [B.w / 2 + 30, B.shY + 6] : up ? [-B.w / 2, B.shY - 12] : sw ? [B.w / 2 + 18, B.shY + 10] : [B.w / 2 + 3, B.shY + 22]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#18181B', hand: pale });
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 4, -14); g.lineTo(B.hipW / 2 + 2, -14); g.lineTo(B.w / 2, B.shY + 2); g.closePath(); }, '#18181B', -B.hipW / 2 - 4, B.shY + 2, B.hipW + 6, -B.shY - 16, 1.2);
  torso(g, B, '#18181B');
  px(g, -2, B.shY, 5, 10, '#E7E5E4'); px(g, -1, B.shY + 2, 3, 3, '#18181B');
  hairBack(g, B, L.hair, 10);
  headShape(g, B, pale);
  faceOn(g, B, { skin: pale, eyes: meas ? 'tired' : up || sw ? 'angry' : 'tired', mouth: 'flat', md: F.md, blink: F.blink });
  whiskers(g, B); glasses(g, B);
  stovepipe(g, B);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#18181B', hand: pale });
  if (!H.held) {
    if (meas) {
      // (the tape stretched out between his hands, numbered)
      px(g, H.far[0], H.far[1] - 1, H.near[0] - H.far[0], 3, '#FDE047');
      for (let x = H.far[0] + 3; x < H.near[0]; x += 4) px(g, x, H.far[1] - 1, 1, 2, '#1C1917');
    } else {
      // (the spade)
      g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -2.5 : sw ? 0.15 : 1.25);
      px(g, -6, -1, 30, 3, '#6B4423');
      part(g, () => { g.moveTo(22, -6); g.lineTo(34, -6); g.quadraticCurveTo(38, 0, 34, 6); g.lineTo(22, 6); g.closePath(); }, '#71717A', 22, -6, 16, 12, 1);
      g.restore();
    }
  }
};
export const drawUndertaker = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const meas = e.aiState === 'measure';
  const F = frameFor(e, f, seed, meas ? 'tell' : poseOf(e, ['swingWind'], ['swing']), undefined, meas ? 'measure' : '');
  putFrame(c, 'fr-undertaker', F, BOX, g => paintUndertaker(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The blacksmith

const paintSmith = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  B.w += 6; B.armW += 2;
  legs(g, B, { col: '#44403C', shoe: 'boot', shoeCol: '#1C1917' });
  const up = F.pose === 'tell', sw = F.pose === 'strike', toss = F.v === 'toss';
  const H = handsAt(B, F, toss ? [B.w / 2 + 4, B.shY + 4] : [-B.w / 2 - 2, B.shY + 20], up && !toss ? [-B.w / 2 + 2, B.shY - 18] : sw ? [B.w / 2 + 16, B.shY + 14] : toss ? [B.w / 2 + 18, B.shY - 2] : [B.w / 2 + 4, B.shY + 22]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: L.skin, len: 0 });
  torso(g, B, '#A8A29E');
  // (the leather apron, scorched)
  part(g, () => g.roundRect(-B.hipW / 2, B.shY + 6, B.hipW, -B.shY - 18, 3), '#6B3A1E', -B.hipW / 2, B.shY + 6, B.hipW, -B.shY - 18, 1);
  px(g, -4, B.shY + 18, 5, 4, '#3F2412'); px(g, 3, B.hipY + 6, 4, 3, '#3F2412');
  hairBack(g, B, L.hair, 12);
  face(g, B, F, up || sw ? 'angry' : 'tired', sw ? 'teeth' : 'flat');
  px(g, B.hx - 8, B.hy + 1, 6, 3, 'rgba(39, 39, 42, 0.4)');
  whiskers(g, B); hairTop(g, B);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: L.skin, len: 0 });
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]);
    if (toss) {
      // (the tongs, a horseshoe glowing in them)
      g.rotate(-0.3); px(g, 0, -1, 18, 2, '#3F3F46');
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(24, 0, 5, Math.PI * 0.4, Math.PI * 1.6, true); g.stroke();
      g.strokeStyle = F.fr % 2 ? '#F97316' : '#FDBA74'; g.lineWidth = 2.4; g.stroke();
    } else {
      g.rotate(up ? -2.4 : sw ? 0.3 : 1.3);
      px(g, -4, -1, 24, 3, '#6B4423'); part(g, () => g.rect(18, -6, 9, 12), '#52525B', 18, -6, 9, 12, 1); px(g, 18, -6, 9, 2, '#A1A1AA');
    }
    g.restore();
  }
};
export const drawSmith = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const toss = e.aiState === 'wind';
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'hammerWind'], ['hammer']), undefined, toss ? 'toss' : '');
  putFrame(c, 'fr-smith', F, BOX, g => paintSmith(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The farmhand

const paintFarmhand = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, shirt = pickOf(F.seed, 2, ['#B91C1C', '#1D4ED8', '#15803D', '#A16207']);
  legs(g, B, { col: '#3B5B8A', shoe: 'boot', shoeCol: '#5A3A1E' });
  const up = F.pose === 'tell', jab = F.pose === 'strike';
  const H = handsAt(B, F, up ? [-B.w / 2 - 8, B.shY + 14] : jab ? [B.w / 2 + 2, B.shY + 14] : [-B.w / 2 + 4, B.shY + 18], up ? [-B.w / 2 + 6, B.shY + 12] : jab ? [B.w / 2 + 20, B.shY + 12] : [B.w / 2 + 6, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: shirt, hand: L.skin });
  torso(g, B, shirt);
  for (let y = B.shY + 3; y < B.hipY; y += 5) px(g, -B.w / 2 + 2, y, B.w - 4, 1, dk(shirt, 0.3));
  part(g, () => g.rect(-B.hipW / 2 + 2, B.shY + 12, B.hipW - 4, B.hipY - B.shY - 10), '#3B5B8A', -B.hipW / 2 + 2, B.shY + 12, B.hipW - 4, B.hipY - B.shY - 10, 1);
  px(g, -B.w / 2 + 4, B.shY, 3, 13, '#3B5B8A'); px(g, B.w / 2 - 7, B.shY, 3, 13, '#3B5B8A');
  hairBack(g, B, L.hair, 14);
  face(g, B, F, up || jab ? 'angry' : 'open', jab ? 'teeth' : 'flat');
  px(g, B.hx + 7, B.hy + 6, 4, 1, '#D9B45A');
  whiskers(g, B); glasses(g, B);
  strawHat(g, B);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: shirt, hand: L.skin });
  if (!H.held) {
    // (the pitchfork: the tines out front)
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -0.25 : jab ? 0 : -1.2);
    px(g, -26, -1, 50, 3, '#9A6A3A');
    px(g, 24, -6, 2, 12, '#71717A');
    for (const ty of [-6, -2, 2, 6]) part(g, () => g.rect(24, ty - 1, 14, 2), '#A1A1AA', 24, ty - 1, 14, 2, 0.5);
    g.restore();
  }
};
export const drawFarmhand = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind'], ['jab']));
  putFrame(c, 'fr-farmhand', F, BOX, g => paintFarmhand(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The feller and the birler

const axe = (g: Ctx, x: number, y: number, a: number, small = false) => {
  g.save(); g.translate(x, y); g.rotate(a);
  const L = small ? 16 : 32;
  px(g, -4, -1.5, L, 3, '#9A6A3A');
  part(g, () => { g.moveTo(L - 6, -2); g.lineTo(L + 2, -9); g.quadraticCurveTo(L + 7, 0, L + 2, 9); g.lineTo(L - 6, 2); g.closePath(); }, '#A1A1AA', L - 6, -9, 14, 18, 1);
  px(g, L + 1, -7, 2, 14, '#E4E4E7');
  g.restore();
};
const plaid = (g: Ctx, x: number, y: number, w: number, h: number, base: string) => {
  for (let yy = y; yy < y + h; yy += 6) px(g, x, yy, w, 3, dk(base, 0.45));
  for (let xx = x + 1; xx < x + w; xx += 6) px(g, xx, y, 3, h, 'rgba(0, 0, 0, 0.3)');
};
const paintFeller = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, check = pickOf(F.seed, 2, ['#B91C1C', '#1F7A3A', '#C2410C']);
  legs(g, B, { col: '#3F4A5A', shoe: 'boot', shoeCol: '#3F2A14' });
  const chop = F.v === 'chop', toss = F.v === 'toss', up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = handsAt(B, F, chop ? [B.w / 2 + 4, B.shY + (F.fr % 2 ? 2 : 14)] : [-B.w / 2 - 2, B.shY + 18], chop ? [B.w / 2 + 14, B.shY + (F.fr % 2 ? -6 : 12)] : up ? [-B.w / 2 + 2, B.shY - 16] : sw ? [B.w / 2 + 16, B.shY + 12] : [B.w / 2 + 4, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: check, hand: L.skin });
  torso(g, B, check);
  plaid(g, -B.w / 2 + 1, B.shY + 1, B.w - 2, B.hipY - B.shY, check);
  px(g, -B.w / 2 + 4, B.shY, 3, B.hipY - B.shY, '#1C1917'); px(g, B.w / 2 - 7, B.shY, 3, B.hipY - B.shY, '#1C1917');
  hairBack(g, B, L.hair, 14);
  face(g, B, F, up || sw || chop ? 'angry' : 'open', chop || sw ? 'teeth' : 'flat');
  whiskers(g, B);
  cowboyHat(g, B, pickOf(F.seed, 4, ['#3F3F46', '#57452E', '#1C1917']), '#7F1D1D', 0.85);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: check, hand: L.skin });
  if (!H.held) axe(g, H.near[0], H.near[1], chop ? (F.fr % 2 ? -1.2 : 0.4) : up ? (toss ? -2.2 : -2.4) : sw ? 0.2 : 1.2, toss);
};
export const drawFeller = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const chop = e.aiState === 'chop', toss = e.aiState === 'wind';
  const F = frameFor(e, chop ? Math.floor(f / 7) * 7 : f, seed, chop ? 'tell' : poseOf(e, ['wind', 'swingWind'], ['swing']), undefined, chop ? 'chop' : toss ? 'toss' : '');
  // (chopping: the swing every 14 frames)
  if (chop) F.fr = Math.floor(f / 7) % 2;
  putFrame(c, 'fr-feller', F, BOX, g => paintFeller(g, F));
};

const paintBirler = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.fr % 2 ? 'walk' : 'stand', F.fr * 3), L = B.L, shirt = pickOf(F.seed, 2, ['#1D4ED8', '#B91C1C', '#0F766E']);
  legs(g, B, { col: '#6B5A44', shoe: 'boot', shoeCol: '#3F2A14' });
  const H = handsAt(B, F, [-B.w / 2 - 16, B.shY + 2 + (F.fr % 2) * 4], [B.w / 2 + 16, B.shY + 2 - (F.fr % 2) * 4]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: shirt, hand: L.skin });
  torso(g, B, shirt);
  for (let y = B.shY + 3; y < B.hipY; y += 5) px(g, -B.w / 2 + 2, y, B.w - 4, 2, '#F5F5F4');
  hairBack(g, B, L.hair, 14);
  face(g, B, F, 'smug', 'grin');
  whiskers(g, B); hairTop(g, B);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: shirt, hand: L.skin });
  // (the pike pole, across for balance)
  if (!H.held) { px(g, H.far[0] - 10, H.far[1] - 1, H.near[0] - H.far[0] + 30, 3, '#9A6A3A'); px(g, H.near[0] + 18, H.near[1] - 3, 6, 5, '#71717A'); }
};
export const drawBirler = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const r = reaction(e);
  const F = r ? frameOf(seed, f, r.pose, r.md) : frameOf(seed, f, 'stand', moodOf(e));
  if (!r) F.fr = Math.floor(f / 8) % 2;
  putFrame(c, 'fr-birler', F, BOX, g => (r ? paintFeller(g, F) : paintBirler(g, F)));
};

// ---------------------------------------------------------------------------------------------------------------
// The miner and the prospector

const paintMiner = (g: Ctx, F: Frame, f: number) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  legs(g, B, { col: '#57534E', shoe: 'boot', shoeCol: '#1C1917' });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = handsAt(B, F, up ? [-B.w / 2 - 4, B.shY - 10] : [-B.w / 2 - 2, B.shY + 18], up ? [-B.w / 2 + 6, B.shY - 18] : sw ? [B.w / 2 + 18, B.shY + 14] : [B.w / 2 + 4, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#8A7A62', hand: L.skin });
  torso(g, B, '#8A7A62');
  px(g, -B.w / 2 + 4, B.shY, 3, B.hipY - B.shY, '#3F2A14'); px(g, B.w / 2 - 7, B.shY, 3, B.hipY - B.shY, '#3F2A14');
  px(g, -5, B.shY + 12, 6, 5, '#57534E');
  hairBack(g, B, L.hair, 12);
  face(g, B, F, up || sw ? 'angry' : 'tired', sw ? 'teeth' : 'flat');
  px(g, B.hx - 8, B.hy + 3, 16, 5, 'rgba(39, 39, 42, 0.45)');
  whiskers(g, B);
  candleHat(g, B, f, F.md !== 'dead');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#8A7A62', hand: L.skin });
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -2.6 : sw ? 0.4 : 1.2);
    px(g, -4, -1.5, 30, 3, '#9A6A3A');
    part(g, () => { g.moveTo(24, -12); g.quadraticCurveTo(30, -2, 26, 12); g.lineTo(28, 12); g.quadraticCurveTo(34, -2, 28, -14); g.closePath(); }, '#71717A', 24, -14, 10, 26, 1);
    g.restore();
  }
};
export const drawMiner = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind'], ['swing']));
  // (the candle's flicker: in the stamp's key, two frames of it)
  F.v = String(Math.floor(f / 3) % 2);
  putFrame(c, 'fr-miner', F, BOX, g => paintMiner(g, F, F.v === '1' ? 0 : 3));
};

const paintProspector = (g: Ctx, F: Frame, f: number) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  B.shY += 2; B.hy += 2; B.lean = F.pose === 'walk' ? 2 : B.lean;
  legs(g, B, { col: '#B91C1C', shoe: 'boot', shoeCol: '#3F2A14' });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = handsAt(B, F, up ? [B.w / 2 + 2, B.shY - 2] : [-B.w / 2 - 2, B.shY + 18], up ? [-B.w / 2 + 2, B.shY - 16] : sw ? [B.w / 2 + 16, B.shY + 8] : [B.w / 2 + 4, B.shY + 18]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#B91C1C', hand: L.skin });
  torso(g, B, '#B91C1C');
  for (let k = 0; k < 4; k++) px(g, -1, B.shY + 4 + k * 5, 2, 2, '#F5F5F4');
  part(g, () => { g.moveTo(-B.w / 2 + 1, B.shY + 2); g.lineTo(-B.hipW / 2, B.hipY); g.lineTo(-3, B.hipY); g.lineTo(-3, B.shY + 6); g.closePath(); }, '#6B5A44', -B.w / 2, B.shY + 2, B.w / 2, B.hipY - B.shY, 1);
  px(g, -B.w / 2 + 3, B.shY + 14, 5, 5, '#8A7A62');
  hairBack(g, B, '#D6D3D1', 12);
  face(g, B, F, up ? 'wide' : 'angry', sw ? 'teeth' : 'grin');
  if (!L.woman) {
    // (the beard: down to the belt, gray)
    part(g, () => { g.moveTo(B.hx - 7, B.hy + 2); g.quadraticCurveTo(B.hx - 6, B.hy + 26, B.hx + 3, B.hy + 30); g.quadraticCurveTo(B.hx + 12, B.hy + 20, B.hx + 10, B.hy + 3); g.quadraticCurveTo(B.hx + 3, B.hy + 9, B.hx - 7, B.hy + 2); g.closePath(); }, '#D6D3D1', B.hx - 8, B.hy + 2, 20, 28, 1);
  } else {
    // (a corncob pipe)
    px(g, B.hx + 8, B.hy + 6, 7, 2, '#8A5A30'); part(g, () => g.rect(B.hx + 13, B.hy + 1, 5, 7), '#D9B45A', B.hx + 13, B.hy + 1, 5, 7, 0.8);
  }
  // (the floppy hat)
  partTop(g, () => { g.moveTo(B.hx - 9, B.hy - 7); g.quadraticCurveTo(B.hx - 4, B.hy - 22, B.hx + 4, B.hy - 18); g.quadraticCurveTo(B.hx + 12, B.hy - 16, B.hx + 11, B.hy - 7); g.closePath(); }, '#6B5A44', B.hx - 9, B.hy - 22, 20, 15, 1);
  part(g, () => { g.moveTo(B.hx - 15, B.hy - 5); g.quadraticCurveTo(B.hx + 1, B.hy - 11, B.hx + 17, B.hy - 4); g.quadraticCurveTo(B.hx + 1, B.hy - 7, B.hx - 15, B.hy - 5); g.closePath(); }, '#5A4A34', B.hx - 15, B.hy - 11, 32, 7, 1);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#B91C1C', hand: L.skin });
  if (!H.held) {
    if (up) {
      // (the dynamite, the fuse sparking)
      part(g, () => g.rect(H.near[0] - 3, H.near[1] - 16, 6, 16), '#DC2626', H.near[0] - 3, H.near[1] - 16, 6, 16, 1);
      px(g, H.near[0], H.near[1] - 22, 1, 6, '#E7E5E4');
      if (f % 4 < 2) { px(g, H.near[0] - 2, H.near[1] - 25, 5, 3, '#FDE047'); px(g, H.near[0] + 2, H.near[1] - 27, 2, 2, '#F97316'); }
    } else {
      // (the gold pan)
      part(g, () => g.ellipse(H.near[0] + (sw ? 8 : 0), H.near[1] + 2, 9, sw ? 4 : 7, sw ? 0 : 1.2, 0, Math.PI * 2), '#8A8A8A', H.near[0] - 9, H.near[1] - 6, 18, 14, 1);
      px(g, H.near[0] - 2 + (sw ? 8 : 0), H.near[1] + 1, 3, 2, '#FDE047');
    }
  }
};
export const drawProspector = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['light', 'whackWind'], ['whack']));
  if (F.pose === 'tell') F.v = String(Math.floor(f / 2) % 2);
  putFrame(c, 'fr-prospector', F, BOX, g => paintProspector(g, F, F.v === '1' ? 0 : 3));
};

// ---------------------------------------------------------------------------------------------------------------
// The TNT crate (gone, it's gone: the blast is what's left)

export const drawCrate = (c: Ctx, e: Enemy) => {
  if (e.health <= 0) return;
  const w = 34, h = 30;
  c.fillStyle = INK; c.fillRect(-w / 2 - 1, -h - 1, w + 2, h + 2);
  c.fillStyle = '#B07A48'; c.fillRect(-w / 2, -h, w, h);
  c.fillStyle = '#D6A06A'; c.fillRect(-w / 2, -h, w, 3);
  c.fillStyle = '#8A5A32'; for (let y = -h + 9; y < 0; y += 9) c.fillRect(-w / 2, y, w, 2);
  c.strokeStyle = '#6A4224'; c.lineWidth = 2; c.beginPath(); c.moveTo(-w / 2 + 2, -h + 2); c.lineTo(w / 2 - 2, -2); c.stroke();
  // (TNT stenciled red; a skull)
  c.fillStyle = '#B91C1C';
  const T = (x: number) => { c.fillRect(x, -22, 7, 2); c.fillRect(x + 2.5, -22, 2, 10); };
  T(-14); c.fillRect(-5, -22, 2, 10); c.fillRect(1, -22, 2, 10); for (let k = 0; k < 4; k++) c.fillRect(-4 + k * 1.3, -21 + k * 2.2, 2, 2); T(5);
  c.fillStyle = '#F5F5F4'; c.beginPath(); c.arc(0, -6, 3, 0, Math.PI * 2); c.fill(); c.fillStyle = INK; c.fillRect(-2, -7, 1, 1); c.fillRect(1, -7, 1, 1);
  if ((e.hitFlash ?? 0) > 0) { c.fillStyle = 'rgba(255, 255, 255, 0.5)'; c.fillRect(-w / 2, -h, w, h); }
};
void lt;
