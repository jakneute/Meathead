// Sawdust Gulch's townsfolk, drawn (the final pass: peak SNES, on Spooky Land's person drawer, costume.ts, as the
// train's cast is: whoever's in the costume shows: their skin, build and face, man or woman; every material in steps,
// dithered where they meet, inked round). Each seeded: no two the same. Each drawn hurt (eyes shut), knocked about
// (held, flung, dazed) and dead (limp, crossed-out eyes), so the engine's special deaths all play out on them right.
// Feet at the origin, facing right (the engine mirrors them). Each frame painted once into a stamp.
//
//   deputy      a work shirt (pocket flaps, pearl snaps), a stitched leather vest with the tin star, a bandana, a gun
//               belt with its cartridge loops and holster, chaps on some, spurs; a creased hat; the six-shooter
//   sheriff     a long duster over a black vest and a string tie, the gold star, a big white hat, a mustache you could
//               sweep with (or her braid), gloves; two guns
//   snakeoil    a loud checked suit, a carnation, a bow tie, a watch chain, spats; a bowler with its band; a bottle of
//               DR. PEABODY'S MIRACLE TONIC with its label
//   barber      the quartet: red-and-white striped vests, sleeve garters, straw boaters, bow ties; a straight razor
//   bouncer     huge: a striped undershirt, suspenders, an anchor tattoo, a bowler two sizes small, a broken nose
//   dancer      the can-can: ruffled skirts in tiers with the white petticoat frothing under (on everybody: the men too),
//               a laced bodice, a choker, a feather in the hair, striped stockings; a whiskey bottle
//   patron      a gambler (a brocade vest, a string tie, a flat-brimmed hat with a card in its band, a pocket watch) or
//               a cowpoke (a bandana, a battered hat, chaps); a glass, a chair, a bottle
//   undertaker  tall, thin, pale: a frock coat, gray gloves, a stovepipe hat with its crepe band, a black carnation; a
//               tape measure, then the spade
//   blacksmith  a scorched leather apron with its pocket, bare arms, soot, a bandana round the head; the hammer; a
//               horseshoe glowing in the tongs
//   farmhand    a frayed straw hat, a gingham shirt, overalls with a bib pocket and brass buttons, a stalk of straw in
//               the teeth; the pitchfork (pointy: its tines out front)
//   feller      buffalo-check flannel, suspenders, a felt hat or a knit cap, caulked boots; the felling axe, a hatchet
//   birler      a striped shirt, rolled trousers, spiked boots; arms out for balance, a pike pole
//   miner       a hard hat with a lit candle on its front (spiky: the flame's the dive kick's undoing), a sooty face,
//               a canvas shirt, suspenders, a lunch pail on the belt; the pickaxe
//   prospector  a floppy hat, red long johns (the button flap), a patched vest, a beard to the belt (or a corncob pipe);
//               the dynamite (its fuse sparking) or the gold pan
//   crate       a TNT crate (not a person): planked, rope handles, DANGER stenciled, a skull

import type { Enemy } from '../../../m1/types';
import { stamp } from '../../../m1/game/render/stamp';
import { signText } from '../../signLetters';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, limb, ball, dither,
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
/** A row of buttons down a front, each with its glint. */
const buttons = (g: Ctx, x: number, y0: number, n: number, gap: number, col = '#D4A017', hi = '#FFF0A8') => { for (let k = 0; k < n; k++) { px(g, x - 0.5, y0 + k * gap - 0.5, 3, 3, INK); px(g, x, y0 + k * gap, 2, 2, col); px(g, x, y0 + k * gap, 1, 1, hi); } };
/** A watch chain across a waistcoat, gold. */
const chain = (g: Ctx, B: Body) => { g.strokeStyle = '#E8C25A'; g.lineWidth = 1; g.beginPath(); g.moveTo(-B.hipW / 2 + 3, B.hipY - 8); g.quadraticCurveTo(0, B.hipY - 3, B.hipW / 2 - 3, B.hipY - 9); g.stroke(); px(g, B.hipW / 2 - 4, B.hipY - 10, 2, 2, '#FFF0A8'); };
/** Spurs on the boots. */
const spur = (g: Ctx, ft: number[]) => { px(g, ft[0] - 6, ft[1] - 1, 3, 1, '#A1A1AA'); px(g, ft[0] - 9, ft[1] - 3, 3, 3, INK); px(g, ft[0] - 8, ft[1] - 2, 1, 1, '#E4E4E7'); };
/** A gun belt: leather, cartridges in their loops, the buckle. */
const gunbelt = (g: Ctx, B: Body, holster = true) => {
  px(g, -B.hipW / 2 - 1, B.hipY - 4, B.hipW + 2, 5, INK); px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 3, '#5A3A1E'); px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 1, '#8A5A30');
  for (let x = -B.hipW / 2 + 1; x < B.hipW / 2 - 2; x += 2) px(g, x, B.hipY - 3, 1, 2, '#D4A017');
  px(g, -3, B.hipY - 4, 6, 5, INK); px(g, -2, B.hipY - 3, 4, 3, '#C8962E'); px(g, -1, B.hipY - 2, 2, 1, '#5A3A1E');
  if (holster) { part(g, () => g.roundRect(B.hipW / 2 - 5, B.hipY - 1, 7, 12, 2), '#6B4423', B.hipW / 2 - 5, B.hipY - 1, 7, 12, 0.9); px(g, B.hipW / 2 - 3, B.hipY - 3, 3, 4, '#3A2A1A'); }
};

// ---------------------------------------------------------------------------------------------------------------
// Hats

const cowboyHat = (g: Ctx, B: Body, col: string, band: string, big = 1) => {
  partTop(g, () => { g.moveTo(B.hx - 7 * big, B.hy - 8); g.quadraticCurveTo(B.hx - 6 * big, B.hy - 20 - 3 * big, B.hx + 1, B.hy - 17 - 2 * big); g.quadraticCurveTo(B.hx + 8 * big, B.hy - 20 - 3 * big, B.hx + 9 * big, B.hy - 8); g.closePath(); }, col, B.hx - 8 * big, B.hy - 24, 18 * big, 16, 1);
  px(g, B.hx, B.hy - 17 - 2 * big, 2, 5, dk(col, 0.3));
  part(g, () => g.ellipse(B.hx + 1, B.hy - 8, 15 * big, 3.2, 0, 0, Math.PI * 2), dk(col, 0.1), B.hx - 15 * big, B.hy - 11, 30 * big, 6, 1);
  px(g, B.hx - 14 * big, B.hy - 9, 10 * big, 1, lt(col, 0.3));
  px(g, B.hx - 7 * big, B.hy - 11, 16 * big, 2, band); px(g, B.hx - 7 * big, B.hy - 11, 16 * big, 1, lt(band, 0.3));
};
const bowler = (g: Ctx, B: Body, col: string, small = 1) => {
  partTop(g, () => g.ellipse(B.hx + 1, B.hy - 10, 9 * small, 8 * small, 0, Math.PI, 0), col, B.hx - 8, B.hy - 18, 18, 9, 1);
  part(g, () => g.ellipse(B.hx + 1, B.hy - 10, 12 * small, 2.4, 0, 0, Math.PI * 2), col, B.hx - 11, B.hy - 13, 24, 5, 1);
  px(g, B.hx - 7 * small, B.hy - 12, 16 * small, 1, lt(col, 0.4));
};
const boater = (g: Ctx, B: Body, band: string) => {
  partTop(g, () => g.rect(B.hx - 8, B.hy - 17, 18, 7), '#F2D98A', B.hx - 8, B.hy - 17, 18, 7, 1);
  px(g, B.hx - 8, B.hy - 13, 18, 3, band);
  part(g, () => g.ellipse(B.hx + 1, B.hy - 10, 15, 2.6, 0, 0, Math.PI * 2), '#E8C870', B.hx - 14, B.hy - 13, 30, 5, 1);
  for (let k = -12; k < 14; k += 3) px(g, B.hx + k, B.hy - 11, 1, 1, '#B89A4A');
};
const stovepipe = (g: Ctx, B: Body) => {
  partTop(g, () => g.rect(B.hx - 7, B.hy - 34, 15, 25), '#0C0A09', B.hx - 7, B.hy - 34, 15, 25, 1);
  part(g, () => g.rect(B.hx - 11, B.hy - 11, 23, 3), '#0C0A09', B.hx - 11, B.hy - 11, 23, 3, 1);
  px(g, B.hx - 7, B.hy - 16, 15, 5, '#2A2A30'); px(g, B.hx - 7, B.hy - 16, 15, 1, '#4A4A52');
  px(g, B.hx - 6, B.hy - 33, 2, 16, '#3A3A42');
};
const strawHat = (g: Ctx, B: Body) => {
  partTop(g, () => g.ellipse(B.hx + 1, B.hy - 11, 8, 7, 0, Math.PI, 0), '#D9B45A', B.hx - 7, B.hy - 18, 16, 8, 1);
  part(g, () => g.ellipse(B.hx + 1, B.hy - 10, 16, 3.4, 0.05, 0, Math.PI * 2), '#E8C870', B.hx - 15, B.hy - 13, 32, 7, 1);
  for (let k = -12; k < 14; k += 4) px(g, B.hx + k, B.hy - 9 + (k % 8 === 0 ? 2 : 1), 1, 2, '#B08A3A');
  for (let k = -15; k < 16; k += 5) px(g, B.hx + k, B.hy - 7, 1, 2, '#C8A050');
  px(g, B.hx - 7, B.hy - 13, 16, 1, '#8A6A2A');
};
/** A miner's hard hat, the candle on its front lit (the dive kick's undoing: spiky). */
const candleHat = (g: Ctx, B: Body, f: number, lit: boolean) => {
  partTop(g, () => g.ellipse(B.hx, B.hy - 7, 10, 9, 0, Math.PI, 0), '#7A5A2A', B.hx - 10, B.hy - 16, 20, 9, 1);
  px(g, B.hx - 1, B.hy - 15, 2, 8, '#5A4018');
  part(g, () => g.rect(B.hx - 12, B.hy - 8, 25, 3), '#6A4A20', B.hx - 12, B.hy - 8, 25, 3, 1);
  // (the candle's tin bracket, the candle, its drips)
  px(g, B.hx + 1, B.hy - 15, 6, 3, '#A8A29E'); px(g, B.hx + 1, B.hy - 15, 6, 1, '#E4E4E7');
  part(g, () => g.rect(B.hx + 2, B.hy - 23, 4, 9), '#F5F0DC', B.hx + 2, B.hy - 23, 4, 9, 0.8);
  px(g, B.hx + 5, B.hy - 21, 1, 3, '#E8E0C0');
  if (lit) {
    const w = f % 6 < 3 ? 0 : 1;
    ball(g, B.hx + 4, B.hy - 27 + w, 2.8, '#F97316', 0.5); px(g, B.hx + 3, B.hy - 29 + w, 2, 3, '#FDE047'); px(g, B.hx + 3, B.hy - 30 + w, 1, 1, '#FFFFFF');
    dither(g, B.hx, B.hy - 33 + w, 8, 4, 'rgba(253, 224, 71, 0.5)');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The deputy and the sheriff

const gun = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.rect(0, -3, 16, 4), '#52525B', 0, -3, 16, 4, 0.8); px(g, 1, -3, 14, 1, '#A1A1AA');
  part(g, () => g.rect(3, -4, 6, 6), '#3F3F46', 3, -4, 6, 6, 0.6); px(g, 4, -3, 1, 4, '#71717A');
  part(g, () => { g.moveTo(-3, -2); g.lineTo(3, -2); g.lineTo(2, 8); g.lineTo(-3, 7); g.closePath(); }, '#6B4423', -3, -2, 6, 10, 0.8);
  px(g, 3, 1, 3, 3, INK);
  g.restore();
};
const SHIRTS = ['#C8A878', '#9AA8B8', '#B88A6A', '#D8C8A8', '#8A9A7A'];
const NECKS = ['#B91C1C', '#1D4ED8', '#CA8A04', '#15803D', '#18181B'];
const paintDeputy = (g: Ctx, F: Frame, sheriff: boolean) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, shirt = sheriff ? '#E7E5E4' : pickOf(F.seed, 2, SHIRTS);
  if (sheriff) { B.w += 2; }
  const chaps = !sheriff && F.seed % 3 === 0;
  legs(g, B, { col: '#4A5A78', shoe: 'boot', shoeCol: '#5A3A1E', detail: (gg, hip, _k, ft, near) => {
    if (chaps) { part(gg, () => gg.rect(Math.min(hip[0], ft[0]) - 4, hip[1] + 2, 9, ft[1] - hip[1] - 8), near ? '#7A4A2A' : '#6A3E22', Math.min(hip[0], ft[0]) - 4, hip[1] + 2, 9, ft[1] - hip[1] - 8, 0.8); for (let y = hip[1] + 4; y < ft[1] - 8; y += 3) px(gg, Math.min(hip[0], ft[0]) - 6, y, 2, 1, '#A07848'); }
    spur(gg, ft);
  } });
  const aim = F.pose === 'tell' && F.v !== 'whip', sw = F.pose === 'strike' || F.v === 'whip';
  const H = handsAt(B, F, aim && sheriff ? [B.w / 2 + 18, B.shY + 10] : [-B.w / 2 - 2, B.shY + 18], aim ? [B.w / 2 + 22, B.shY + 4] : sw ? [B.w / 2 + 14, B.shY + 2] : [B.w / 2 + 4, B.hipY - 2]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(shirt, 0.1), hand: sheriff ? '#3A2A1A' : L.skin });
  if (sheriff) {
    // (the duster, long behind, split at the back, its hem flapping)
    const flap = F.pose === 'walk' ? Math.sin(F.fr) * 3 : 0;
    part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 9 + flap, -6); g.lineTo(B.hipW / 2 - 2, -10); g.lineTo(B.w / 2 - 2, B.shY + 2); g.closePath(); }, '#57452E', -B.hipW / 2 - 9, B.shY + 2, B.hipW + 6, -B.shY - 6, 1.2);
    px(g, -B.hipW / 2 - 6 + flap, -16, 2, 10, '#3A2E1E'); dither(g, -B.hipW / 2 - 7, -12, B.hipW + 4, 5, '#3A2E1E');
  }
  torso(g, B, shirt);
  // (the shirt's pocket flaps and snaps)
  px(g, -B.w / 2 + 3, B.shY + 7, 6, 3, dk(shirt, 0.25)); px(g, -B.w / 2 + 5, B.shY + 8, 1, 1, '#F5F5F4');
  // (the vest: stitched along its edges; the star; the bandana at the neck)
  const vest = sheriff ? '#1C1917' : '#7A4A2A';
  part(g, () => { g.moveTo(-B.w / 2 + 1, B.shY + 2); g.lineTo(-B.hipW / 2 + 1, B.hipY); g.lineTo(-2, B.hipY); g.lineTo(-3, B.shY + 8); g.closePath(); }, vest, -B.w / 2, B.shY + 2, B.w / 2, B.hipY - B.shY, 1);
  part(g, () => { g.moveTo(B.w / 2 - 1, B.shY + 2); g.lineTo(B.hipW / 2 - 1, B.hipY); g.lineTo(3, B.hipY); g.lineTo(4, B.shY + 8); g.closePath(); }, vest, 2, B.shY + 2, B.w / 2, B.hipY - B.shY, 1);
  for (let y = B.shY + 10; y < B.hipY - 2; y += 3) { px(g, -4, y, 1, 1, lt(vest, 0.35)); px(g, 5, y, 1, 1, lt(vest, 0.35)); }
  const sx = B.w / 2 - 6, sy = B.shY + 10;
  if (sheriff) part(g, () => { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 2.2 : 5; g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.closePath(); }, '#EAB308', sx - 5, sy - 5, 10, 10, 0.7);
  else { part(g, () => { for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 6, r = k % 2 ? 2.4 : 4.6; g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.closePath(); }, '#D4D4D8', sx - 5, sy - 5, 10, 10, 0.7); for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 3; px(g, sx + Math.cos(a) * 5 - 0.5, sy + Math.sin(a) * 5 - 0.5, 1.5, 1.5, '#F5F5F4'); } }
  px(g, sx - 1, sy - 1, 2, 2, sheriff ? '#FFF0A8' : '#FFFFFF');
  if (sheriff) { px(g, -1, B.shY, 2, 9, '#18181B'); px(g, -2, B.shY + 1, 4, 2, '#C8962E'); }
  else part(g, () => { g.moveTo(-5, B.shY - 1); g.lineTo(6, B.shY - 1); g.lineTo(1, B.shY + 7); g.closePath(); }, pickOf(F.seed, 5, NECKS), -5, B.shY - 1, 11, 8, 0.8);
  gunbelt(g, B, !aim);
  if (sheriff) part(g, () => g.roundRect(-B.hipW / 2 - 2, B.hipY - 1, 7, 12, 2), '#6B4423', -B.hipW / 2 - 2, B.hipY - 1, 7, 12, 0.9);
  hairBack(g, B, L.hair, 14);
  face(g, B, F, aim ? 'angry' : sheriff ? 'smug' : 'open', sw ? 'teeth' : 'flat');
  if (sheriff && !L.woman) part(g, () => { g.moveTo(B.hx - 2, B.hy + 4); g.quadraticCurveTo(B.hx + 4, B.hy + 2, B.hx + 10, B.hy + 4); g.quadraticCurveTo(B.hx + 14, B.hy + 9, B.hx + 13, B.hy + 12); g.quadraticCurveTo(B.hx + 9, B.hy + 7, B.hx + 4, B.hy + 7); g.quadraticCurveTo(B.hx, B.hy + 8, B.hx - 4, B.hy + 12); g.quadraticCurveTo(B.hx - 5, B.hy + 7, B.hx - 2, B.hy + 4); g.closePath(); }, L.hair === '#D6D3D1' ? '#E7E5E4' : L.hair, B.hx - 5, B.hy + 2, 19, 10, 0.8);
  else if (sheriff && L.woman) { part(g, () => g.roundRect(B.hx - 12, B.hy - 2, 5, 22, 2), L.hair, B.hx - 12, B.hy - 2, 5, 22, 0.8); for (let y = B.hy; y < B.hy + 20; y += 4) px(g, B.hx - 12, y, 5, 1, dk(L.hair, 0.3)); }
  else whiskers(g, B);
  glasses(g, B);
  cowboyHat(g, B, sheriff ? '#F5F0E6' : pickOf(F.seed, 4, ['#8A6A40', '#5A4028', '#A08060', '#3A3A3A']), sheriff ? '#1C1917' : '#3F2A14', sheriff ? 1.25 : 1);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: shirt, hand: sheriff ? '#3A2A1A' : L.skin });
  if (!H.held) {
    if (aim) gun(g, H.near[0], H.near[1], 0);
    else if (sw) gun(g, H.near[0], H.near[1], -0.9);
    if (sheriff && aim) gun(g, H.far[0], H.far[1] + 3, 0.05);
  }
};
export const drawDeputy = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const whip = e.aiState === 'whipWind' || e.aiState === 'whip';
  const F = frameFor(e, f, seed, poseOf(e, ['aim', 'whipWind'], ['whip', 'fire']), undefined, whip ? 'whip' : '');
  putFrame(c, 'ft-deputy', F, BOX, g => paintDeputy(g, F, false));
};
export const drawSheriff = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const whip = e.aiState === 'whipWind' || e.aiState === 'whip';
  const F = frameFor(e, f, seed, poseOf(e, ['draw', 'fan', 'whipWind'], ['whip']), undefined, whip ? 'whip' : '');
  putFrame(c, 'ft-sheriff', F, BOX, g => paintDeputy(g, F, true));
};

// ---------------------------------------------------------------------------------------------------------------
// The snake-oil salesman

const tonicBottle = (g: Ctx, x: number, y: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-4, -12, 9, 13, 2), '#3E7A3A', -4, -12, 9, 13, 0.8);
  px(g, -1, -17, 3, 5, '#3E7A3A'); px(g, -1, -19, 3, 2, '#8A5A30'); px(g, -3, -9, 7, 6, '#F5E6C0'); px(g, -3, -9, 7, 1, '#B91C1C'); px(g, -2, -7, 5, 1, '#7F1D1D'); px(g, -2, -5, 3, 1, '#7F1D1D');
  px(g, -3, -11, 1, 8, '#9AE09A');
  g.restore();
};
const paintSalesman = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, suit = pickOf(F.seed, 2, ['#A85A2A', '#6A3A8A', '#2A6A5A', '#8A7A2A']);
  const check = (gg: Ctx, x: number, y: number, w: number, h: number) => { for (let yy = y + 1; yy < y + h; yy += 4) for (let xx = x + ((yy / 4) % 2 ? 2 : 0); xx < x + w; xx += 4) px(gg, xx, yy, 2, 2, lt(suit, 0.35)); for (let yy = y + 3; yy < y + h; yy += 8) px(gg, x, yy, w, 1, dk(suit, 0.3)); };
  legs(g, B, { col: suit, shoe: 'shoe', shoeCol: '#1C1917', detail: (gg, hip, _k, ft) => { check(gg, Math.min(hip[0], ft[0]) - 3, hip[1], 7, ft[1] - hip[1] - 4); px(gg, ft[0] - 3, ft[1] - 6, 9, 3, '#F5F5F4'); } });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = handsAt(B, F, [-B.w / 2 - 6, B.shY + 8], up ? [B.hx - 2, B.hy - 18] : sw ? [B.w / 2 + 16, B.shY + 6] : [B.w / 2 + 8, B.shY + 10]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: suit, hand: L.skin });
  torso(g, B, suit);
  check(g, -B.w / 2 + 2, B.shY + 2, B.w - 4, B.hipY - B.shY);
  // (the lapels, the shirt front, the bow tie, a red carnation, the watch chain)
  part(g, () => { g.moveTo(-6, B.shY); g.lineTo(0, B.shY + 14); g.lineTo(6, B.shY); g.closePath(); }, '#F5F5F4', -6, B.shY, 12, 14, 0.6);
  px(g, -6, B.shY + 1, 3, 12, dk(suit, 0.3)); px(g, 4, B.shY + 1, 3, 12, lt(suit, 0.2));
  buttons(g, 0, B.shY + 15, 2, 5, '#E8E0D0', '#FFFFFF');
  part(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(0, B.shY + 4); g.lineTo(5, B.shY + 1); g.lineTo(5, B.shY + 7); g.lineTo(0, B.shY + 4); g.lineTo(-5, B.shY + 7); g.closePath(); }, '#B91C1C', -5, B.shY + 1, 10, 6, 0.6);
  ball(g, B.w / 2 - 6, B.shY + 6, 2.4, '#DC2626', 0.6); px(g, B.w / 2 - 7, B.shY + 9, 1, 3, '#15803D');
  chain(g, B);
  hairBack(g, B, L.hair, 12);
  face(g, B, F, up ? 'wide' : 'smug', sw ? 'teeth' : 'grin');
  whiskers(g, B); glasses(g, B);
  if (!L.woman && L.face === 0) part(g, () => g.roundRect(B.hx + 2, B.hy + 4, 9, 2, 1), L.hair, B.hx + 2, B.hy + 4, 9, 2, 0.6);
  bowler(g, B, '#3A2A1A'); px(g, B.hx - 7, B.hy - 13, 16, 2, '#7F1D1D');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: suit, hand: L.skin });
  if (!H.held) tonicBottle(g, H.near[0] + 2, H.near[1] + 2, up ? -0.4 : sw ? 1.4 : 0.1);
};
export const drawSalesman = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'smashWind'], ['smash']));
  putFrame(c, 'ft-snakeoil', F, BOX, g => paintSalesman(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The barbershop quartet

const paintBarber = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose === 'after' ? 'stand' : F.pose, F.fr), L = B.L;
  legs(g, B, { col: '#F5F5F4', shoe: 'shoe', shoeCol: '#1C1917', stripe: '#D4D4D8' });
  const up = F.pose === 'tell', sw = F.pose === 'strike', sing = F.v === 'sing';
  const H = handsAt(B, F, sing ? [-B.w / 2 - 8, B.shY + 4] : [-B.w / 2 - 2, B.shY + 18], up ? [B.hx + 6, B.hy - 12] : sw ? [B.w / 2 + 20, B.shY + 14] : sing ? [B.w / 2 + 10, B.shY + 2] : [B.w / 2 + 4, B.shY + 20]);
  const gart = (hx: number, hy: number, side: -1 | 1) => { const sx = side * (B.w / 2 - 3) + B.lean, sy = B.shY + 3; px(g, sx + (hx - sx) * 0.35 - 3, sy + (hy - sy) * 0.35 - 1, 6, 2, '#DC2626'); };
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#F5F5F4', hand: L.skin }); gart(H.far[0], H.far[1], -1);
  torso(g, B, '#F5F5F4');
  // (the striped vest, its buttons, the collar and bow tie)
  part(g, () => g.rect(-B.w / 2 + 2, B.shY + 3, B.w - 4, B.hipY - B.shY - 1), '#F5F5F4', -B.w / 2 + 2, B.shY + 3, B.w - 4, B.hipY - B.shY - 1, 0.8);
  for (let k = -B.w / 2 + 3; k < B.w / 2 - 2; k += 4) { px(g, k, B.shY + 4, 2, B.hipY - B.shY - 3, '#DC2626'); px(g, k, B.shY + 4, 1, B.hipY - B.shY - 3, '#F87171'); }
  buttons(g, 0, B.shY + 8, 3, 5, '#1C1917', '#71717A');
  part(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(0, B.shY + 4); g.lineTo(5, B.shY + 1); g.lineTo(5, B.shY + 7); g.lineTo(0, B.shY + 4); g.lineTo(-5, B.shY + 7); g.closePath(); }, '#1C1917', -5, B.shY + 1, 10, 6, 0.6);
  hairBack(g, B, L.hair, 12);
  face(g, B, F, up || sw ? 'angry' : 'smug', sing ? 'o' : sw ? 'teeth' : 'smile');
  // (a handlebar mustache on the men without a beard)
  if (!L.woman && L.face !== 2) part(g, () => { g.moveTo(B.hx + 1, B.hy + 5); g.quadraticCurveTo(B.hx + 5, B.hy + 3, B.hx + 9, B.hy + 5); g.quadraticCurveTo(B.hx + 13, B.hy + 5, B.hx + 13, B.hy + 1); g.quadraticCurveTo(B.hx + 11, B.hy + 7, B.hx + 5, B.hy + 7); g.quadraticCurveTo(B.hx - 1, B.hy + 7, B.hx - 3, B.hy + 1); g.quadraticCurveTo(B.hx - 3, B.hy + 5, B.hx + 1, B.hy + 5); g.closePath(); }, L.hair, B.hx - 3, B.hy + 1, 16, 6, 0.6);
  else whiskers(g, B);
  glasses(g, B);
  boater(g, B, pickOf(F.seed, 3, ['#DC2626', '#1D4ED8', '#1C1917']));
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#F5F5F4', hand: L.skin }); gart(H.near[0], H.near[1], 1);
  if (!H.held) {
    // (the straight razor: open, the blade catching the light, its tortoiseshell handle)
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -1.8 : sw ? 0.2 : sing ? -0.6 : 0.9);
    part(g, () => g.rect(-3, -2, 10, 4), '#8A5A20', -3, -2, 10, 4, 0.7); px(g, -1, -1, 2, 1, '#C89040'); px(g, 3, 0, 2, 1, '#5A3010');
    part(g, () => { g.moveTo(6, -3); g.lineTo(21, -2); g.lineTo(21, 2); g.lineTo(6, 2); g.closePath(); }, '#E4E4E7', 6, -3, 15, 5, 0.7); px(g, 7, -3, 13, 1, '#FFFFFF'); px(g, 7, 1, 13, 1, '#A1A1AA');
    g.restore();
  }
};
export const drawBarber = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const sing = e.aiState === 'quartet' && Math.abs(e.vel.x) < 0.1;
  const F = frameFor(e, f, seed, poseOf(e, ['wind'], ['slash']), undefined, sing ? 'sing' : '');
  putFrame(c, 'ft-barber', F, BOX, g => paintBarber(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The bouncer

const paintBouncer = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  B.w += 12; B.hipW += 8; B.legW += 2; B.armW += 3; B.rx += 1;
  legs(g, B, { col: '#2A2622', shoe: 'boot', shoeCol: '#1C1917', detail: (gg, hip, _k, ft) => px(gg, Math.min(hip[0], ft[0]), hip[1] + 4, 1, ft[1] - hip[1] - 10, '#3A3632') });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = handsAt(B, F, up ? [-B.w / 2 - 10, B.shY - 6] : sw ? [B.w / 2 + 6, B.shY - 10] : [-B.w / 2 + 6, B.shY + 14], up ? [B.w / 2 + 10, B.shY - 6] : sw ? [B.w / 2 + 22, B.shY - 14] : [B.w / 2 - 6, B.shY + 14]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: L.skin, len: 0.2 });
  torso(g, B, '#F5F5F4');
  for (let y = B.shY + 4; y < B.hipY; y += 5) { px(g, -B.w / 2 + 2, y, B.w - 4, 2, '#1E3A8A'); px(g, -B.w / 2 + 2, y, B.w - 4, 1, '#3A5AAA'); }
  // (the suspenders, their brass clips; the belt)
  px(g, -B.w / 2 + 5, B.shY, 3, B.hipY - B.shY, '#18181B'); px(g, B.w / 2 - 8, B.shY, 3, B.hipY - B.shY, '#18181B');
  px(g, -B.w / 2 + 5, B.hipY - 4, 3, 3, '#C8962E'); px(g, B.w / 2 - 8, B.hipY - 4, 3, 3, '#C8962E');
  px(g, -B.hipW / 2, B.hipY, B.hipW, 3, '#3A2A1A');
  hairBack(g, B, L.hair, 10);
  face(g, B, F, 'angry', up ? 'teeth' : 'flat');
  // (the broken nose's tape, a scar through the brow)
  px(g, B.hx + 4, B.hy + 1, 4, 2, '#F5F0E6'); px(g, B.hx + 1, B.hy - 6, 1, 6, dk(L.skin, 0.35));
  whiskers(g, B);
  bowler(g, B, '#1C1917', 0.75);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: L.skin, len: 0.2 });
  // (an anchor tattoo on the near arm)
  if (!H.held) { const ax = (B.w / 2 - 3 + H.near[0]) / 2, ay = (B.shY + 3 + H.near[1]) / 2 - 4; px(g, ax, ay, 1, 5, '#1E3A6A'); px(g, ax - 2, ay + 1, 5, 1, '#1E3A6A'); px(g, ax - 2, ay + 4, 1, 1, '#1E3A6A'); px(g, ax + 2, ay + 4, 1, 1, '#1E3A6A'); }
};
export const drawBouncer = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['grabWind'], ['grab']));
  putFrame(c, 'ft-bouncer', F, BOX, g => paintBouncer(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The can-can dancers

const SKIRTS = ['#DC2626', '#DB2777', '#7C3AED', '#0F766E', '#1D4ED8'];
const paintDancer = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, skirt = pickOf(F.seed, 3, SKIRTS);
  const kick = F.pose === 'strike', up = F.pose === 'tell';
  // (the legs: striped stockings, a garter; the near one up high for the kick)
  if (kick || up) {
    limb(g, -2, B.hipY + 2, -3, -12, B.legW, '#F5F5F4'); part(g, () => g.roundRect(-7, -6, 11, 6, 2), '#1C1917', -7, -6, 11, 6, 1);
    const tx = kick ? 30 : 14, ty = kick ? B.shY - 4 : B.hipY - 6;
    limb(g, 4, B.hipY + 2, tx, ty, B.legW, '#F5F5F4');
    for (let k = 0.2; k < 1; k += 0.2) px(g, 4 + (tx - 4) * k - 2, B.hipY + 2 + (ty - B.hipY - 2) * k - 1, 4, 2, '#1C1917');
    px(g, 4 + (tx - 4) * 0.25 - 3, B.hipY + 2 + (ty - B.hipY - 2) * 0.25 - 1, 6, 2, skirt);
    part(g, () => g.roundRect(tx - 2, ty - 5, 11, 7, 2), '#1C1917', tx - 2, ty - 5, 11, 7, 1);
  } else legs(g, B, { col: '#F5F5F4', shoe: 'boot', shoeCol: '#1C1917', stripe: '#1C1917' });
  const H = handsAt(B, F, [-B.w / 2 - 8, B.shY + 2], up ? [B.hx + 2, B.hy - 16] : [B.w / 2 + 8, B.shY + 6]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: L.skin, len: 0.3 });
  // (the skirt in ruffled tiers, the white petticoat frothing under, lifted on the kick side)
  const lift = kick ? 10 : up ? 5 : 0;
  part(g, () => { g.moveTo(-B.hipW / 2 - 6, B.hipY + 12); g.lineTo(-B.hipW / 2 - 12, B.hipY + 22); g.lineTo(B.hipW / 2 + 12, B.hipY + 22 - lift); g.lineTo(B.hipW / 2 + 6, B.hipY + 12 - lift); g.closePath(); }, '#F5F5F4', -B.hipW / 2 - 12, B.hipY + 12 - lift, B.hipW + 24, 10 + lift, 0.9);
  for (let k = 0; k < 8; k++) px(g, -B.hipW / 2 - 11 + k * ((B.hipW + 22) / 8), B.hipY + 19 - (lift * k) / 8, 3, 3, '#E4E4E7');
  for (let t = 0; t < 2; t++) {
    const y0 = B.hipY - 4 + t * 8, sp = 6 + t * 4;
    part(g, () => { g.moveTo(-B.hipW / 2 + 1 - t * 3, y0); g.lineTo(-B.hipW / 2 - sp, y0 + 12); g.lineTo(B.hipW / 2 + sp, y0 + 12 - lift * (0.6 + t * 0.4)); g.lineTo(B.hipW / 2 - 1 + t * 3, y0); g.closePath(); }, t ? dk(skirt, 0.12) : skirt, -B.hipW / 2 - sp, y0, B.hipW + sp * 2, 12, 1);
    for (let k = 0; k < 7; k++) px(g, -B.hipW / 2 - sp + 1 + k * ((B.hipW + sp * 2) / 7), y0 + 9 - (lift * (0.6 + t * 0.4) * k) / 7, 4, 3, lt(skirt, 0.35));
  }
  torso(g, B, skirt, B.shY + 2);
  // (the bodice's lacing, its trim, the choker with its cameo)
  for (let y = B.shY + 6; y < B.hipY - 2; y += 3) { px(g, -2, y, 1, 1, '#F5F5F4'); px(g, 2, y + 1, 1, 1, '#F5F5F4'); }
  px(g, -B.w / 2 + 2, B.shY + 1, B.w - 4, 3, '#1C1917'); px(g, -B.w / 2 + 2, B.shY + 1, B.w - 4, 1, '#3A3A42');
  px(g, B.hx - 4, B.hy + 9, 9, 2, '#1C1917'); px(g, B.hx, B.hy + 9, 2, 2, '#F2E2C8');
  hairBack(g, B, L.hair, 16); hairTop(g, B);
  face(g, B, F, up || kick ? 'angry' : 'smug', kick ? 'teeth' : 'smile');
  px(g, B.hx + 5, B.hy + 3, 2, 1, '#F87171');
  whiskers(g, B);
  // (the feather, its quill and barbs)
  const fc = pickOf(F.seed, 5, ['#F9A8D4', '#FDE047', '#F8FAFC', '#18181B']);
  part(g, () => { g.moveTo(B.hx - 4, B.hy - 9); g.quadraticCurveTo(B.hx - 12, B.hy - 30, B.hx - 2, B.hy - 34); g.quadraticCurveTo(B.hx - 4, B.hy - 22, B.hx, B.hy - 10); g.closePath(); }, fc, B.hx - 12, B.hy - 34, 12, 25, 0.8);
  g.strokeStyle = dk(fc, 0.3); g.lineWidth = 1; g.beginPath(); g.moveTo(B.hx - 2, B.hy - 10); g.quadraticCurveTo(B.hx - 8, B.hy - 24, B.hx - 3, B.hy - 32); g.stroke();
  px(g, B.hx - 5, B.hy - 11, 5, 3, '#C8962E');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: L.skin, len: 0.3 });
  // (a whiskey bottle, up for the throw)
  if (!H.held && up) { part(g, () => g.roundRect(H.near[0] - 3, H.near[1] - 16, 7, 13, 2), '#8A5A20', H.near[0] - 3, H.near[1] - 16, 7, 13, 0.8); px(g, H.near[0] - 1, H.near[1] - 20, 3, 4, '#8A5A20'); px(g, H.near[0] - 2, H.near[1] - 11, 5, 4, '#E8DCB0'); }
};
export const drawDancer = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'kickWind'], ['kick']));
  putFrame(c, 'ft-dancer', F, BOX, g => paintDancer(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The saloon's drinkers: a gambler or a cowpoke; a glass up at the calm, a chair up over the head for the swing, a
// bottle back for the throw

const VESTS = ['#7F1D1D', '#1E3A5F', '#3F3F46', '#5B3A1A', '#14532D'];
const paintPatron = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, gambler = F.seed % 2 === 0;
  const shirt = gambler ? '#F5F0E6' : pickOf(F.seed, 2, ['#B88A6A', '#9AA8B8', '#C8A878', '#8A5A3A']), vest = pickOf(F.seed, 3, VESTS);
  legs(g, B, { col: gambler ? '#2A2622' : '#4A5A78', shoe: 'boot', shoeCol: '#3F2A14', detail: (gg, hip, _k, ft, near) => { if (gambler) px(gg, Math.min(hip[0], ft[0]) + 1, hip[1] + 2, 1, ft[1] - hip[1] - 8, '#4A4642'); else { spur(gg, ft); if (near && F.seed % 4 === 1) part(gg, () => gg.rect(Math.min(hip[0], ft[0]) - 4, hip[1] + 2, 9, ft[1] - hip[1] - 8), '#7A4A2A', Math.min(hip[0], ft[0]) - 4, hip[1] + 2, 9, ft[1] - hip[1] - 8, 0.8); } } });
  const chair = F.v === 'chair', drink = F.v === 'drink', toss = F.v === 'toss', up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = handsAt(B, F,
    chair && up ? [-B.w / 2 + 2, B.shY - 18] : chair && sw ? [B.w / 2 + 12, B.shY - 2] : [-B.w / 2 - 2, B.shY + 18],
    drink ? [B.hx + 4, B.hy + 6] : chair && up ? [B.w / 2 - 2, B.shY - 20] : chair && sw ? [B.w / 2 + 22, B.shY + 4] : toss ? [-B.w / 2 - 6, B.shY - 10] : up ? [B.w / 2 - 2, B.shY + 2] : sw ? [B.w / 2 + 22, B.shY + 2] : [B.w / 2 + 4, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: shirt, hand: L.skin });
  torso(g, B, shirt);
  part(g, () => { g.moveTo(-B.w / 2 + 1, B.shY + 2); g.lineTo(-B.hipW / 2 + 1, B.hipY); g.lineTo(B.hipW / 2 - 1, B.hipY); g.lineTo(B.w / 2 - 1, B.shY + 2); g.lineTo(3, B.shY + 9); g.lineTo(-3, B.shY + 9); g.closePath(); }, vest, -B.w / 2, B.shY + 2, B.w, B.hipY - B.shY, 1);
  if (gambler) {
    // (brocade: a little figure in it; the string tie; the pocket watch's chain; a card up the sleeve)
    for (let y = B.shY + 11; y < B.hipY - 1; y += 4) for (let x = -B.w / 2 + 3 + ((y / 4) % 2) * 2; x < B.w / 2 - 3; x += 4) px(g, x, y, 1, 1, lt(vest, 0.4));
    px(g, -1, B.shY + 1, 2, 8, '#1C1917'); px(g, -2, B.shY + 1, 4, 2, '#C8962E');
    buttons(g, 0, B.shY + 12, 3, 5, '#C8962E');
    chain(g, B);
  } else part(g, () => { g.moveTo(-5, B.shY - 1); g.lineTo(6, B.shY - 1); g.lineTo(1, B.shY + 8); g.closePath(); }, pickOf(F.seed, 5, ['#B91C1C', '#1D4ED8', '#CA8A04']), -5, B.shY - 1, 11, 9, 0.8);
  hairBack(g, B, L.hair, 14);
  face(g, B, F, up || sw ? 'angry' : drink ? 'tired' : 'open', sw ? 'teeth' : drink ? 'o' : 'flat');
  if (drink || F.md !== 'ok') px(g, B.hx + 3, B.hy + 1, 4, 2, '#E87A6A');
  whiskers(g, B); glasses(g, B);
  if (gambler) {
    part(g, () => g.rect(B.hx - 8, B.hy - 15, 18, 6), '#1C1917', B.hx - 8, B.hy - 15, 18, 6, 1);
    part(g, () => g.ellipse(B.hx + 1, B.hy - 9, 14, 2.6, 0, 0, Math.PI * 2), '#1C1917', B.hx - 13, B.hy - 12, 28, 5, 1);
    px(g, B.hx - 8, B.hy - 11, 18, 2, '#7F1D1D'); px(g, B.hx + 4, B.hy - 17, 4, 6, '#F5F5F4'); px(g, B.hx + 5, B.hy - 15, 2, 2, '#DC2626');
  } else cowboyHat(g, B, pickOf(F.seed, 4, ['#8A6A40', '#5A4028', '#A08060', '#3F3F46']), '#3F2A14', 0.9);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: shirt, hand: L.skin });
  if (H.held) return;
  if (drink) { part(g, () => g.rect(H.near[0] - 2, H.near[1] - 8, 6, 8), '#E8C890', H.near[0] - 2, H.near[1] - 8, 6, 8, 0.6); px(g, H.near[0] - 1, H.near[1] - 6, 4, 4, '#B45309'); px(g, H.near[0] - 1, H.near[1] - 7, 1, 5, '#FFF8E0'); }
  else if (chair) {
    // (a saloon chair: up over the head, then down across a back)
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(sw ? 0.9 : -0.3);
    part(g, () => g.rect(-14, -4, 28, 4), '#8A5A30', -14, -4, 28, 4, 0.8);
    for (const lx of [-13, 10]) { px(g, lx - 0.5, -0.5, 4, 17, INK); px(g, lx, 0, 3, 16, '#6B4423'); px(g, lx, 0, 1, 16, '#9A6A3A'); }
    px(g, 9.5, -22.5, 4, 19, INK); px(g, 10, -22, 3, 18, '#6B4423'); px(g, -2, -20, 14, 3, '#8A5A30'); px(g, -2, -12, 14, 2, '#8A5A30'); px(g, -2, -20, 14, 1, '#B07A48');
    g.restore();
  } else if (toss) { part(g, () => g.roundRect(H.near[0] - 3, H.near[1] - 16, 7, 13, 2), '#8A5A20', H.near[0] - 3, H.near[1] - 16, 7, 13, 0.8); px(g, H.near[0] - 1, H.near[1] - 20, 3, 4, '#8A5A20'); px(g, H.near[0] - 2, H.near[1] - 11, 5, 4, '#E8DCB0'); }
};
export const drawPatron = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const chair = !!(e as { chair?: boolean }).chair && e.aiState !== 'calm' && e.aiState !== 'drink';
  const v = e.aiState === 'drink' ? 'drink' : e.aiState === 'toss' ? 'toss' : chair ? 'chair' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'chairWind', 'toss'], ['swing', 'chair']), undefined, v);
  putFrame(c, 'ft-patron', F, BOX, g => paintPatron(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The undertaker

const paintUndertaker = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, pale = lt(L.skin, 0.3);
  B.shY -= 6; B.hy -= 6; B.w -= 3; B.hipW -= 2;
  legs(g, B, { col: '#18181B', shoe: 'pointy', shoeCol: '#0C0A09', detail: (gg, hip, _k, ft) => px(gg, Math.min(hip[0], ft[0]) + 1, hip[1] + 2, 1, ft[1] - hip[1] - 8, '#3A3A42') });
  const meas = F.v === 'measure', up = F.pose === 'tell' && !meas, sw = F.pose === 'strike';
  const H = handsAt(B, F, meas ? [B.w / 2 + 6, B.shY + 4] : [-B.w / 2 - 2, B.shY + 22], meas ? [B.w / 2 + 30, B.shY + 6] : up ? [-B.w / 2, B.shY - 12] : sw ? [B.w / 2 + 18, B.shY + 10] : [B.w / 2 + 3, B.shY + 22]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#18181B', hand: '#8A8A92' });
  // (the frock coat's tails, long)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 4, -14); g.lineTo(B.hipW / 2 + 2, -14); g.lineTo(B.w / 2, B.shY + 2); g.closePath(); }, '#18181B', -B.hipW / 2 - 4, B.shY + 2, B.hipW + 6, -B.shY - 16, 1.2);
  px(g, -B.hipW / 2 - 2, -28, 1, 14, '#3A3A42');
  torso(g, B, '#18181B');
  // (the lapels, the shirt and black cravat, a black carnation, the coat's buttons)
  px(g, -3, B.shY, 7, 12, '#E7E5E4'); px(g, -1, B.shY + 2, 3, 4, '#18181B'); px(g, -2, B.shY + 6, 5, 2, '#18181B');
  px(g, -6, B.shY + 1, 3, 14, '#2A2A30'); px(g, 4, B.shY + 1, 3, 14, '#3A3A42');
  ball(g, B.w / 2 - 5, B.shY + 6, 2.2, '#2A1A2A', 0.6);
  buttons(g, 2, B.shY + 16, 3, 5, '#3A3A42', '#71717A');
  hairBack(g, B, L.hair, 10);
  headShape(g, B, pale);
  faceOn(g, B, { skin: pale, eyes: meas ? 'tired' : up || sw ? 'angry' : 'tired', mouth: 'flat', md: F.md, blink: F.blink });
  px(g, B.hx - 2, B.hy + 2, 1, 4, dk(pale, 0.2)); px(g, B.hx + 7, B.hy + 2, 1, 3, dk(pale, 0.2));
  whiskers(g, B); glasses(g, B);
  stovepipe(g, B);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#18181B', hand: '#8A8A92' });
  if (!H.held) {
    if (meas) {
      // (the tape stretched out between his hands, numbered)
      px(g, H.far[0], H.far[1] - 1, H.near[0] - H.far[0], 3, '#FDE047'); px(g, H.far[0], H.far[1] - 1, H.near[0] - H.far[0], 1, '#FFF8B0');
      for (let x = H.far[0] + 3; x < H.near[0]; x += 4) px(g, x, H.far[1] - 1, 1, 2, '#1C1917');
    } else {
      // (the spade: its ash handle, the D grip, the iron blade with dirt on it)
      g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -2.5 : sw ? 0.15 : 1.25);
      part(g, () => g.rect(-6, -1.5, 30, 3), '#9A6A3A', -6, -1.5, 30, 3, 0.8);
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(-8, 0, 4, Math.PI * 0.5, Math.PI * 1.5); g.stroke(); g.strokeStyle = '#9A6A3A'; g.lineWidth = 1.5; g.stroke();
      part(g, () => { g.moveTo(22, -6); g.lineTo(34, -6); g.quadraticCurveTo(38, 0, 34, 6); g.lineTo(22, 6); g.closePath(); }, '#71717A', 22, -6, 16, 12, 1);
      px(g, 30, -3, 4, 6, '#5A3A1E');
      g.restore();
    }
  }
};
export const drawUndertaker = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const meas = e.aiState === 'measure';
  const F = frameFor(e, f, seed, meas ? 'tell' : poseOf(e, ['swingWind'], ['swing']), undefined, meas ? 'measure' : '');
  putFrame(c, 'ft-undertaker', F, BOX, g => paintUndertaker(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The blacksmith

const paintSmith = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  B.w += 6; B.armW += 2;
  legs(g, B, { col: '#44403C', shoe: 'boot', shoeCol: '#1C1917' });
  const up = F.pose === 'tell', sw = F.pose === 'strike', toss = F.v === 'toss';
  const H = handsAt(B, F, toss ? [B.w / 2 + 4, B.shY + 4] : [-B.w / 2 - 2, B.shY + 20], up && !toss ? [-B.w / 2 + 2, B.shY - 18] : sw ? [B.w / 2 + 16, B.shY + 14] : toss ? [B.w / 2 + 18, B.shY - 2] : [B.w / 2 + 4, B.shY + 22]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: '#3A2A1A', len: 0 });
  torso(g, B, '#A8A29E');
  // (the leather apron, scorched, its pocket with tongs' handles, the neck strap)
  part(g, () => g.roundRect(-B.hipW / 2, B.shY + 6, B.hipW, -B.shY - 18, 3), '#6B3A1E', -B.hipW / 2, B.shY + 6, B.hipW, -B.shY - 18, 1);
  px(g, -B.hipW / 2 + 3, B.shY + 2, 2, 6, '#4A2814'); px(g, B.hipW / 2 - 5, B.shY + 2, 2, 6, '#4A2814');
  part(g, () => g.rect(-6, B.hipY - 2, 12, 8), '#5A2E16', -6, B.hipY - 2, 12, 8, 0.7); px(g, -4, B.hipY - 5, 1, 4, '#3F3F46'); px(g, 2, B.hipY - 5, 1, 4, '#3F3F46');
  px(g, -4, B.shY + 18, 5, 4, '#2A1408'); px(g, 3, B.hipY + 8, 4, 3, '#2A1408'); dither(g, -B.hipW / 2 + 2, B.hipY + 10, B.hipW - 4, 6, '#3F2412');
  hairBack(g, B, L.hair, 12);
  face(g, B, F, up || sw ? 'angry' : 'tired', sw ? 'teeth' : 'flat');
  px(g, B.hx - 8, B.hy + 1, 6, 3, 'rgba(39, 39, 42, 0.4)'); px(g, B.hx + 4, B.hy - 3, 4, 2, 'rgba(39, 39, 42, 0.35)');
  whiskers(g, B); hairTop(g, B);
  // (a bandana round the head)
  part(g, () => g.rect(B.hx - 9, B.hy - 9, 19, 4), '#B91C1C', B.hx - 9, B.hy - 9, 19, 4, 0.8); px(g, B.hx - 12, B.hy - 7, 4, 5, '#B91C1C');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: '#3A2A1A', len: 0 });
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]);
    if (toss) {
      // (the tongs, a horseshoe glowing in them)
      g.rotate(-0.3); px(g, 0, -2, 20, 2, '#3F3F46'); px(g, 0, 1, 20, 2, '#3F3F46');
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(25, 0, 5, Math.PI * 0.4, Math.PI * 1.6, true); g.stroke();
      g.strokeStyle = F.fr % 2 ? '#F97316' : '#FDBA74'; g.lineWidth = 2.4; g.stroke();
      g.strokeStyle = '#FDE047'; g.lineWidth = 1; g.beginPath(); g.arc(25, 0, 5, Math.PI * 1.0, Math.PI * 1.5, false); g.stroke();
    } else {
      g.rotate(up ? -2.4 : sw ? 0.3 : 1.3);
      part(g, () => g.rect(-4, -1.5, 24, 3), '#9A6A3A', -4, -1.5, 24, 3, 0.8);
      part(g, () => g.rect(18, -7, 10, 14), '#52525B', 18, -7, 10, 14, 1); px(g, 18, -7, 10, 2, '#A1A1AA'); px(g, 26, -7, 2, 14, '#3F3F46');
    }
    g.restore();
  }
};
export const drawSmith = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const toss = e.aiState === 'wind';
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'hammerWind'], ['hammer']), undefined, toss ? 'toss' : '');
  putFrame(c, 'ft-smith', F, BOX, g => paintSmith(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The farmhand

const paintFarmhand = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, shirt = pickOf(F.seed, 2, ['#B91C1C', '#1D4ED8', '#15803D', '#A16207']);
  const denim = '#3B5B8A';
  legs(g, B, { col: denim, shoe: 'boot', shoeCol: '#5A3A1E', detail: (gg, hip, _k, ft) => { px(gg, Math.min(hip[0], ft[0]) + 2, hip[1] + 4, 1, ft[1] - hip[1] - 10, lt(denim, 0.3)); px(gg, ft[0] - 4, ft[1] - 8, 8, 2, dk(denim, 0.3)); } });
  const up = F.pose === 'tell', jab = F.pose === 'strike';
  const H = handsAt(B, F, up ? [-B.w / 2 - 8, B.shY + 14] : jab ? [B.w / 2 + 2, B.shY + 14] : [-B.w / 2 + 4, B.shY + 18], up ? [-B.w / 2 + 6, B.shY + 12] : jab ? [B.w / 2 + 20, B.shY + 12] : [B.w / 2 + 6, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: shirt, hand: L.skin });
  torso(g, B, shirt);
  // (gingham: a check of the shirt's color and white, the overalls' bib, its pocket, its brass buttons)
  for (let y = B.shY + 3; y < B.hipY; y += 4) { px(g, -B.w / 2 + 2, y, B.w - 4, 1, lt(shirt, 0.5)); for (let x = -B.w / 2 + 2; x < B.w / 2 - 2; x += 4) px(g, x, B.shY + 2, 1, B.hipY - B.shY - 2, lt(shirt, 0.35)); }
  part(g, () => g.rect(-B.hipW / 2 + 2, B.shY + 12, B.hipW - 4, B.hipY - B.shY - 10), denim, -B.hipW / 2 + 2, B.shY + 12, B.hipW - 4, B.hipY - B.shY - 10, 1);
  px(g, -4, B.shY + 15, 8, 6, dk(denim, 0.25)); px(g, -4, B.shY + 15, 8, 1, lt(denim, 0.3)); px(g, 1, B.shY + 13, 1, 4, '#F5F5F4');
  px(g, -B.w / 2 + 4, B.shY, 3, 13, denim); px(g, B.w / 2 - 7, B.shY, 3, 13, denim);
  buttons(g, -B.w / 2 + 4.5, B.shY + 11, 1, 0, '#C8962E'); buttons(g, B.w / 2 - 6.5, B.shY + 11, 1, 0, '#C8962E');
  hairBack(g, B, L.hair, 14);
  face(g, B, F, up || jab ? 'angry' : 'open', jab ? 'teeth' : 'flat');
  // (a stalk of straw in the teeth)
  px(g, B.hx + 7, B.hy + 6, 6, 1, '#D9B45A'); px(g, B.hx + 12, B.hy + 5, 2, 1, '#F2D98A');
  whiskers(g, B); glasses(g, B);
  strawHat(g, B);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: shirt, hand: L.skin });
  if (!H.held) {
    // (the pitchfork: its ash shaft, the iron ferrule, the tines out front, sharp and lit)
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -0.25 : jab ? 0 : -1.2);
    part(g, () => g.rect(-26, -1.5, 52, 3), '#9A6A3A', -26, -1.5, 52, 3, 0.8); px(g, -24, -1, 46, 1, '#C8965A');
    part(g, () => g.rect(22, -3, 5, 6), '#52525B', 22, -3, 5, 6, 0.6);
    part(g, () => g.rect(25, -7, 3, 14), '#71717A', 25, -7, 3, 14, 0.6);
    for (const ty of [-6, -2, 2, 6]) { part(g, () => { g.moveTo(27, ty - 1); g.lineTo(42, ty - 0.3); g.lineTo(42, ty + 0.3); g.lineTo(27, ty + 1); g.closePath(); }, '#A1A1AA', 27, ty - 1, 15, 2, 0.5); px(g, 28, ty - 1, 12, 1, '#E4E4E7'); }
    g.restore();
  }
};
export const drawFarmhand = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind'], ['jab']));
  putFrame(c, 'ft-farmhand', F, BOX, g => paintFarmhand(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The feller and the birler

const axe = (g: Ctx, x: number, y: number, a: number, small = false) => {
  g.save(); g.translate(x, y); g.rotate(a);
  const L = small ? 16 : 32;
  part(g, () => g.rect(-4, -1.5, L, 3), '#9A6A3A', -4, -1.5, L, 3, 0.8); px(g, -3, -1, L - 2, 1, '#C8965A');
  part(g, () => { g.moveTo(L - 6, -2); g.lineTo(L + 2, -9); g.quadraticCurveTo(L + 7, 0, L + 2, 9); g.lineTo(L - 6, 2); g.closePath(); }, '#A1A1AA', L - 6, -9, 14, 18, 1);
  px(g, L + 1, -7, 2, 14, '#F4F4F5'); px(g, L - 4, -2, 3, 4, '#52525B');
  g.restore();
};
const plaid = (g: Ctx, x: number, y: number, w: number, h: number, base: string) => {
  for (let yy = y; yy < y + h; yy += 6) px(g, x, yy, w, 3, dk(base, 0.45));
  for (let xx = x + 1; xx < x + w; xx += 6) px(g, xx, y, 3, h, 'rgba(0, 0, 0, 0.3)');
  for (let yy = y + 1; yy < y + h; yy += 6) for (let xx = x + 1; xx < x + w; xx += 6) px(g, xx, yy, 1, 1, 'rgba(0, 0, 0, 0.25)');
};
const paintFeller = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, check = pickOf(F.seed, 2, ['#B91C1C', '#1F7A3A', '#C2410C', '#1E3A8A']);
  legs(g, B, { col: '#3F4A5A', shoe: 'boot', shoeCol: '#3F2A14', detail: (gg, _h, _k, ft) => { px(gg, ft[0] - 3, ft[1] - 10, 9, 2, '#7A6A5A'); for (let k = 0; k < 3; k++) px(gg, ft[0] - 2 + k * 3, ft[1], 1, 1, '#A1A1AA'); } });
  const chop = F.v === 'chop', toss = F.v === 'toss', up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = handsAt(B, F, chop ? [B.w / 2 + 4, B.shY + (F.fr % 2 ? 2 : 14)] : [-B.w / 2 - 2, B.shY + 18], chop ? [B.w / 2 + 14, B.shY + (F.fr % 2 ? -6 : 12)] : up ? [-B.w / 2 + 2, B.shY - 16] : sw ? [B.w / 2 + 16, B.shY + 12] : [B.w / 2 + 4, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: check, hand: L.skin });
  torso(g, B, check);
  plaid(g, -B.w / 2 + 1, B.shY + 1, B.w - 2, B.hipY - B.shY, check);
  px(g, -B.w / 2 + 4, B.shY, 3, B.hipY - B.shY, '#1C1917'); px(g, B.w / 2 - 7, B.shY, 3, B.hipY - B.shY, '#1C1917');
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 3, '#3A2A1A');
  // (the hatchet in his belt)
  if (!toss) { px(g, -B.hipW / 2 - 2, B.hipY - 8, 2, 14, '#9A6A3A'); px(g, -B.hipW / 2 - 6, B.hipY - 10, 6, 5, '#A1A1AA'); }
  hairBack(g, B, L.hair, 14);
  face(g, B, F, up || sw || chop ? 'angry' : 'open', chop || sw ? 'teeth' : 'flat');
  whiskers(g, B);
  if (F.seed % 3 === 1) {
    // (a knit cap, its cuff and bobble)
    partTop(g, () => g.ellipse(B.hx, B.hy - 7, 10, 9, 0, Math.PI, 0), check, B.hx - 10, B.hy - 16, 20, 9, 1);
    part(g, () => g.rect(B.hx - 10, B.hy - 9, 20, 4), dk(check, 0.3), B.hx - 10, B.hy - 9, 20, 4, 0.8);
    ball(g, B.hx, B.hy - 17, 3, '#F5F5F4', 0.6);
  } else cowboyHat(g, B, pickOf(F.seed, 4, ['#3F3F46', '#57452E', '#1C1917']), '#7F1D1D', 0.85);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: check, hand: L.skin });
  if (!H.held) axe(g, H.near[0], H.near[1], chop ? (F.fr % 2 ? -1.2 : 0.4) : up ? (toss ? -2.2 : -2.4) : sw ? 0.2 : 1.2, toss);
};
export const drawFeller = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const chop = e.aiState === 'chop', toss = e.aiState === 'wind';
  const F = frameFor(e, chop ? Math.floor(f / 7) * 7 : f, seed, chop ? 'tell' : poseOf(e, ['wind', 'swingWind'], ['swing']), undefined, chop ? 'chop' : toss ? 'toss' : '');
  // (chopping: the swing every 14 frames)
  if (chop) F.fr = Math.floor(f / 7) % 2;
  putFrame(c, 'ft-feller', F, BOX, g => paintFeller(g, F));
};

const paintBirler = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.fr % 2 ? 'walk' : 'stand', F.fr * 3), L = B.L, shirt = pickOf(F.seed, 2, ['#1D4ED8', '#B91C1C', '#0F766E']);
  legs(g, B, { col: '#6B5A44', shoe: 'boot', shoeCol: '#3F2A14', detail: (gg, _h, knee, ft) => { px(gg, knee[0] - 4, knee[1] + 2, 9, 3, '#8A7A62'); for (let k = 0; k < 3; k++) px(gg, ft[0] - 2 + k * 3, ft[1], 1, 2, '#D4D4D8'); } });
  const H = handsAt(B, F, [-B.w / 2 - 16, B.shY + 2 + (F.fr % 2) * 4], [B.w / 2 + 16, B.shY + 2 - (F.fr % 2) * 4]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: shirt, hand: L.skin, len: 0.6 });
  torso(g, B, shirt);
  for (let y = B.shY + 3; y < B.hipY; y += 5) { px(g, -B.w / 2 + 2, y, B.w - 4, 2, '#F5F5F4'); px(g, -B.w / 2 + 2, y, B.w - 4, 1, '#FFFFFF'); }
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 3, '#3A2A1A');
  hairBack(g, B, L.hair, 14);
  face(g, B, F, 'smug', 'grin');
  whiskers(g, B); hairTop(g, B);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: shirt, hand: L.skin, len: 0.6 });
  // (the pike pole, across for balance: its shaft, the iron spike and hook)
  if (!H.held) { px(g, H.far[0] - 10, H.far[1] - 2, H.near[0] - H.far[0] + 30, 4, INK); px(g, H.far[0] - 10, H.far[1] - 1, H.near[0] - H.far[0] + 30, 2, '#9A6A3A'); px(g, H.far[0] - 10, H.far[1] - 1, H.near[0] - H.far[0] + 30, 1, '#C8965A'); part(g, () => { g.moveTo(H.near[0] + 18, H.near[1] - 4); g.lineTo(H.near[0] + 28, H.near[1] - 1); g.lineTo(H.near[0] + 18, H.near[1] + 2); g.closePath(); }, '#71717A', H.near[0] + 18, H.near[1] - 4, 10, 6, 0.8); px(g, H.near[0] + 20, H.near[1] - 8, 2, 5, '#71717A'); }
};
export const drawBirler = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const r = reaction(e);
  const F = r ? frameOf(seed, f, r.pose, r.md) : frameOf(seed, f, 'stand', moodOf(e));
  if (!r) F.fr = Math.floor(f / 8) % 2;
  putFrame(c, 'ft-birler', F, BOX, g => (r ? paintFeller(g, F) : paintBirler(g, F)));
};

// ---------------------------------------------------------------------------------------------------------------
// The miner and the prospector

const paintMiner = (g: Ctx, F: Frame, f: number) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, canvas = '#8A7A62';
  legs(g, B, { col: '#57534E', shoe: 'boot', shoeCol: '#1C1917', detail: (gg, hip, _k, ft) => { px(gg, Math.min(hip[0], ft[0]) - 2, (hip[1] + ft[1]) / 2, 6, 4, '#6A6560'); dither(gg, Math.min(hip[0], ft[0]) - 3, ft[1] - 14, 8, 8, 'rgba(30, 24, 18, 0.5)'); } });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = handsAt(B, F, up ? [-B.w / 2 - 4, B.shY - 10] : [-B.w / 2 - 2, B.shY + 18], up ? [-B.w / 2 + 6, B.shY - 18] : sw ? [B.w / 2 + 18, B.shY + 14] : [B.w / 2 + 4, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: canvas, hand: L.skin });
  torso(g, B, canvas);
  // (the canvas shirt's seams, soot down its front, suspenders, the lunch pail hung off the belt)
  px(g, 0, B.shY + 2, 1, B.hipY - B.shY - 2, dk(canvas, 0.25)); dither(g, -B.w / 2 + 3, B.shY + 10, B.w - 6, 10, 'rgba(30, 24, 18, 0.45)');
  px(g, -B.w / 2 + 4, B.shY, 3, B.hipY - B.shY, '#3F2A14'); px(g, B.w / 2 - 7, B.shY, 3, B.hipY - B.shY, '#3F2A14');
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 3, '#2A1E14');
  part(g, () => g.roundRect(-B.hipW / 2 - 6, B.hipY - 2, 8, 8, 2), '#8A8A92', -B.hipW / 2 - 6, B.hipY - 2, 8, 8, 0.8); px(g, -B.hipW / 2 - 5, B.hipY - 4, 6, 1, '#52525B');
  hairBack(g, B, L.hair, 12);
  face(g, B, F, up || sw ? 'angry' : 'tired', sw ? 'teeth' : 'flat');
  px(g, B.hx - 8, B.hy + 3, 16, 5, 'rgba(39, 39, 42, 0.45)'); px(g, B.hx - 6, B.hy - 4, 5, 2, 'rgba(39, 39, 42, 0.3)');
  whiskers(g, B);
  candleHat(g, B, f, F.md !== 'dead');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: canvas, hand: L.skin });
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -2.6 : sw ? 0.4 : 1.2);
    part(g, () => g.rect(-4, -1.5, 30, 3), '#9A6A3A', -4, -1.5, 30, 3, 0.8); px(g, -3, -1, 28, 1, '#C8965A');
    part(g, () => { g.moveTo(24, -12); g.quadraticCurveTo(30, -2, 26, 12); g.lineTo(28, 12); g.quadraticCurveTo(34, -2, 28, -14); g.closePath(); }, '#71717A', 24, -14, 10, 26, 1);
    px(g, 27, -12, 1, 6, '#D4D4D8');
    g.restore();
  }
};
export const drawMiner = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind'], ['swing']));
  // (the candle's flicker: in the stamp's key, two frames of it)
  F.v = String(Math.floor(f / 3) % 2);
  putFrame(c, 'ft-miner', F, BOX, g => paintMiner(g, F, F.v === '1' ? 0 : 3));
};

const paintProspector = (g: Ctx, F: Frame, f: number) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  B.shY += 2; B.hy += 2; B.lean = F.pose === 'walk' ? 2 : B.lean;
  legs(g, B, { col: '#B91C1C', shoe: 'boot', shoeCol: '#3F2A14', detail: (gg, hip, knee, ft) => { px(gg, knee[0] - 3, knee[1] - 2, 7, 6, '#8A6A40'); px(gg, knee[0] - 2, knee[1] - 1, 1, 1, '#F5F5F4'); px(gg, Math.min(hip[0], ft[0]) + 2, hip[1] + 2, 1, ft[1] - hip[1] - 8, '#DC3A3A'); } });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = handsAt(B, F, up ? [B.w / 2 + 2, B.shY - 2] : [-B.w / 2 - 2, B.shY + 18], up ? [-B.w / 2 + 2, B.shY - 16] : sw ? [B.w / 2 + 16, B.shY + 8] : [B.w / 2 + 4, B.shY + 18]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#B91C1C', hand: L.skin });
  torso(g, B, '#B91C1C');
  buttons(g, -1, B.shY + 4, 4, 5, '#F5F5F4', '#FFFFFF');
  // (the patched vest: a patch in another cloth, stitched round)
  part(g, () => { g.moveTo(-B.w / 2 + 1, B.shY + 2); g.lineTo(-B.hipW / 2, B.hipY); g.lineTo(-3, B.hipY); g.lineTo(-3, B.shY + 6); g.closePath(); }, '#6B5A44', -B.w / 2, B.shY + 2, B.w / 2, B.hipY - B.shY, 1);
  px(g, -B.w / 2 + 3, B.shY + 14, 6, 6, '#8A7A62'); for (let k = 0; k < 6; k += 2) { px(g, -B.w / 2 + 3 + k, B.shY + 13, 1, 1, '#E8DCB0'); px(g, -B.w / 2 + 3 + k, B.shY + 20, 1, 1, '#E8DCB0'); }
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 3, '#3A2A1A'); px(g, B.hipW / 2 - 7, B.hipY, 6, 7, '#8A6A40');
  hairBack(g, B, '#D6D3D1', 12);
  face(g, B, F, up ? 'wide' : 'angry', sw ? 'teeth' : 'grin');
  if (!L.woman) {
    // (the beard: down to the belt, gray, in its strands)
    part(g, () => { g.moveTo(B.hx - 7, B.hy + 2); g.quadraticCurveTo(B.hx - 6, B.hy + 26, B.hx + 3, B.hy + 30); g.quadraticCurveTo(B.hx + 12, B.hy + 20, B.hx + 10, B.hy + 3); g.quadraticCurveTo(B.hx + 3, B.hy + 9, B.hx - 7, B.hy + 2); g.closePath(); }, '#D6D3D1', B.hx - 8, B.hy + 2, 20, 28, 1);
    for (let k = 0; k < 4; k++) px(g, B.hx - 3 + k * 3, B.hy + 10 + (k % 2) * 4, 1, 12, '#A8A29E');
  } else {
    // (a corncob pipe, a curl of smoke)
    px(g, B.hx + 8, B.hy + 6, 7, 2, '#8A5A30'); part(g, () => g.rect(B.hx + 13, B.hy + 1, 5, 7), '#D9B45A', B.hx + 13, B.hy + 1, 5, 7, 0.8);
    for (let k = 0; k < 3; k++) px(g, B.hx + 15 + (k % 2) * 2, B.hy - 2 - k * 3, 2, 2, '#D4D4D8');
  }
  // (the floppy hat, a hole in its crown)
  partTop(g, () => { g.moveTo(B.hx - 9, B.hy - 7); g.quadraticCurveTo(B.hx - 4, B.hy - 22, B.hx + 4, B.hy - 18); g.quadraticCurveTo(B.hx + 12, B.hy - 16, B.hx + 11, B.hy - 7); g.closePath(); }, '#6B5A44', B.hx - 9, B.hy - 22, 20, 15, 1);
  px(g, B.hx + 2, B.hy - 15, 3, 2, '#2A1E14');
  part(g, () => { g.moveTo(B.hx - 15, B.hy - 5); g.quadraticCurveTo(B.hx + 1, B.hy - 11, B.hx + 17, B.hy - 4); g.quadraticCurveTo(B.hx + 1, B.hy - 7, B.hx - 15, B.hy - 5); g.closePath(); }, '#5A4A34', B.hx - 15, B.hy - 11, 32, 7, 1);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#B91C1C', hand: L.skin });
  if (!H.held) {
    if (up) {
      // (the dynamite, the fuse sparking)
      part(g, () => g.rect(H.near[0] - 3, H.near[1] - 16, 6, 16), '#DC2626', H.near[0] - 3, H.near[1] - 16, 6, 16, 1);
      px(g, H.near[0] - 3, H.near[1] - 12, 6, 2, '#1C1917'); px(g, H.near[0] - 2, H.near[1] - 15, 1, 12, '#F87171');
      px(g, H.near[0], H.near[1] - 22, 1, 6, '#E7E5E4');
      if (f % 4 < 2) { px(g, H.near[0] - 2, H.near[1] - 25, 5, 3, '#FDE047'); px(g, H.near[0] + 2, H.near[1] - 27, 2, 2, '#F97316'); px(g, H.near[0] - 3, H.near[1] - 28, 1, 1, '#FFFFFF'); }
    } else {
      // (the gold pan, a glint of "gold" in it)
      part(g, () => g.ellipse(H.near[0] + (sw ? 8 : 0), H.near[1] + 2, 9, sw ? 4 : 7, sw ? 0 : 1.2, 0, Math.PI * 2), '#8A8A8A', H.near[0] - 9, H.near[1] - 6, 18, 14, 1);
      px(g, H.near[0] - 2 + (sw ? 8 : 0), H.near[1] + 1, 3, 2, '#FDE047'); px(g, H.near[0] - 2 + (sw ? 8 : 0), H.near[1] + 1, 1, 1, '#FFFFFF');
    }
  }
};
export const drawProspector = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['light', 'whackWind'], ['whack']));
  if (F.pose === 'tell') F.v = String(Math.floor(f / 2) % 2);
  putFrame(c, 'ft-prospector', F, BOX, g => paintProspector(g, F, F.v === '1' ? 0 : 3));
};

// ---------------------------------------------------------------------------------------------------------------
// The TNT crate (gone, it's gone: the blast is what's left)

const paintCrate = (g: Ctx) => {
  const w = 34, h = 30, P = ['#3A2410', '#5C3A1A', '#80562A', '#A87A3E', '#C99E5C', '#E6C488'];
  g.fillStyle = INK; g.fillRect(-w / 2 - 1, -h - 1, w + 2, h + 2);
  g.fillStyle = P[3]; g.fillRect(-w / 2, -h, w, h);
  // (planks laid along, their grain, the end boards, nail heads)
  for (let y = -h; y < 0; y += 10) { g.fillStyle = P[4]; g.fillRect(-w / 2, y, w, 1); g.fillStyle = P[1]; g.fillRect(-w / 2, y + 9, w, 1); g.fillStyle = P[2]; g.fillRect(-w / 2 + 4 + ((y * 7) & 7), y + 4, 12, 1); }
  g.fillStyle = P[2]; g.fillRect(-w / 2, -h, 4, h); g.fillRect(w / 2 - 4, -h, 4, h);
  g.fillStyle = P[5]; g.fillRect(-w / 2, -h, w, 1); g.fillRect(-w / 2, -h, 1, h);
  g.fillStyle = INK; for (const nx of [-w / 2 + 1, w / 2 - 3]) for (const ny of [-h + 2, -h + 12, -h + 22]) g.fillRect(nx, ny, 2, 2);
  // (TNT stenciled red, DANGER under it, a skull and bones)
  signText(g, 'TNT', 0, -15, { sx: 2, sy: 2, fill: '#B91C1C', stencil: true });
  signText(g, 'DANGER', 0, -2, { sx: 1, sy: 1, fill: '#7F1D1D' });
  g.fillStyle = '#F5F5F4'; g.beginPath(); g.arc(11, -25, 2.5, 0, Math.PI * 2); g.fill(); g.fillStyle = INK; g.fillRect(10, -26, 1, 1); g.fillRect(12, -26, 1, 1);
  g.fillStyle = '#F5F5F4'; g.fillRect(8, -22, 7, 1); g.fillRect(10, -23, 3, 3);
  // (rope handles at the ends)
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(-w / 2, -16, 4, Math.PI * 0.5, Math.PI * 1.5); g.stroke(); g.beginPath(); g.arc(w / 2, -16, 4, -Math.PI * 0.5, Math.PI * 0.5); g.stroke();
  g.strokeStyle = '#C8A870'; g.lineWidth = 1.5; g.beginPath(); g.arc(-w / 2, -16, 4, Math.PI * 0.5, Math.PI * 1.5); g.stroke(); g.beginPath(); g.arc(w / 2, -16, 4, -Math.PI * 0.5, Math.PI * 0.5); g.stroke();
};
export const drawCrate = (c: Ctx, e: Enemy) => {
  if (e.health <= 0) return;
  stamp(c, 'ft-tnt', -24, -34, 48, 36, paintCrate);
  if ((e.hitFlash ?? 0) > 0) { c.fillStyle = 'rgba(255, 255, 255, 0.5)'; c.fillRect(-17, -30, 34, 30); }
};
void lt;
