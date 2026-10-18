// The train's cast, drawn (the final pass: peak SNES, on Spooky Land's person drawer, costume.ts, so whoever's in the
// uniform shows: their skin, build and face, man or woman; every material in steps, inked round). Each seeded: no two
// the same. Each drawn hurt (eyes shut), knocked about (held, flung, dazed) and dead (limp, crossed-out eyes), so the
// engine's special deaths all play out on them right. Feet at the origin, facing right (the engine mirrors them). Each
// frame painted once into a cache (paint.ts still(): kept under the grades' tilt).
//
//   porter     the railroad's jacket (maroon, navy, bottle green) with brass buttons and a gold-braided cuff, a pillbox
//              cap with its badge, white gloves, a watch chain; a suitcase (leather, carpetbag, tin trunk) with its
//              straps and stickers
//   brakeman   hickory-striped overalls, a striped cap (or a felt hat), a neckerchief, a lantern hung off the bib on
//              some; the hickory brake club
//   robber     a duster coat over a vest, a hat (a cattleman's crease, a flat brim, a battered slouch), a bandana up over
//              the nose (plain or spotted), a gun belt of cartridges, spurs; the pistol; riding, his horse from the near
//              side: a gallop in four frames, the coat seeded (bay, black, chestnut, gray, a paint), the bridle and reins,
//              the saddle on its blanket, the stirrup
//   cook       a tall white toque, the double-breasted jacket, sleeves rolled, the apron stained (gravy, blood, something
//              green), a dish towel tucked in; the cleaver, the frying pan for up close
//   passenger  a lady in a bustle dress (ruffled hem, a lace collar, a cameo) and a feathered hat with her parasol, or a
//              gent in a frock coat over a waistcoat and a watch chain, a top hat or a bowler, his cane
//   fireman    soot to the eyebrows, an undershirt gone gray, red suspenders, goggles up on the cap, a bandana at the
//              neck; the coal shovel, heaped for the throw
//   steer      a longhorn (the wilds' animals' way: stepped, ticked, inked): the wide horns, hide and patches by seed;
//              standing, walking, pawing, the charge's four-frame gallop, hurt, dead (belly up, tongue out)

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, limb, ball, dither,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';
import { limb as stroke } from '../../../m1/game/render/npc/kit';
import { still } from './paint';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, woman?: boolean, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, woman, v);
};
const BOX: [number, number, number, number] = [-64, -136, 140, 140];
/** Puts a frame down from its cache (painted the once). */
const putFrame = (c: Ctx, id: string, F: Frame, paint: (g: Ctx) => void) =>
  still(c, `trk-${id}-${F.seed}-${F.pose}-${F.fr}-${F.md}-${F.t}-${F.blink ? 1 : 0}-${F.woman === undefined ? 'x' : F.woman ? 'f' : 'm'}-${F.v}`, BOX[0], BOX[1], BOX[2], BOX[3], paint);
const ownFace = (g: Ctx, B: Body, F: Frame, skin: string, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk' | 'frown') => {
  headShape(g, B, skin);
  faceOn(g, B, { skin, eyes, mouth: mouth === 'frown' ? 'flat' : mouth, md: F.md, blink: F.blink });
};
/** Where the hands go for this pose (far, near), knocked about or not. */
const hands = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};
/** A row of brass buttons down a front, each with its glint. */
const buttons = (g: Ctx, x: number, y0: number, n: number, gap: number) => { for (let k = 0; k < n; k++) { px(g, x - 0.5, y0 + k * gap - 0.5, 3, 3, INK); px(g, x, y0 + k * gap, 2, 2, '#D4A017'); px(g, x, y0 + k * gap, 1, 1, '#FFF0A8'); } };
/** A watch chain across a waistcoat, gold. */
const chain = (g: Ctx, B: Body) => { g.strokeStyle = '#E8C25A'; g.lineWidth = 1; g.beginPath(); g.moveTo(-B.hipW / 2 + 3, B.hipY - 8); g.quadraticCurveTo(0, B.hipY - 3, B.hipW / 2 - 3, B.hipY - 9); g.stroke(); px(g, B.hipW / 2 - 4, B.hipY - 10, 2, 2, '#FFF0A8'); };

// ---------------------------------------------------------------------------------------------------------------
// The porter

const JACKETS = ['#7F1D1D', '#6B2138', '#1E3A5F', '#1F4A36'];
const CASES = ['#8A5A30', '#6B2A3A', '#5A6A4A', '#3A4A5A'];
const paintPorter = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, coat = pickOf(F.seed, 3, JACKETS), trouser = dk(coat, 0.45);
  legs(g, B, { col: trouser, shoe: 'shoe', shoeCol: '#111111', detail: (gg, hip, _k, ft) => px(gg, (hip[0] + ft[0]) / 2 + 2, hip[1] + 2, 1, ft[1] - hip[1] - 6, '#D4A017') });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = hands(B, F, up ? [-4, B.hy - 18] : [-B.w / 2 - 3, B.shY + 20], up ? [8, B.hy - 18] : sw ? [B.w / 2 + 18, B.shY + 8] : [B.w / 2 + 4, B.hipY + 2]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: coat, hand: '#F8FAFC' });
  torso(g, B, coat, B.shY, B.hipY + 6, 1);
  // (the jacket's front, its lapels, the brass buttons, the collar and tie, the watch chain; the hem)
  part(g, () => { g.moveTo(-3, B.shY); g.lineTo(1, B.shY + 12); g.lineTo(5, B.shY); g.closePath(); }, '#F8FAFC', -3, B.shY, 8, 12, 0.6);
  px(g, 0, B.shY + 2, 2, 7, dk(coat, 0.5));
  px(g, -6, B.shY + 1, 3, 10, lt(coat, 0.2)); px(g, 5, B.shY + 1, 3, 10, dk(coat, 0.2));
  buttons(g, 3, B.shY + 12, 3, 6);
  chain(g, B);
  px(g, -B.hipW / 2 - 1, B.hipY + 4, B.hipW + 3, 2, dk(coat, 0.3));
  hairBack(g, B, L.hair, 12);
  ownFace(g, B, F, L.skin, up || sw ? 'angry' : 'tired', up ? 'teeth' : 'flat');
  whiskers(g, B); glasses(g, B);
  // (the pillbox cap: its crown lit, the gold band, the badge, the stiff peak)
  partTop(g, () => g.roundRect(B.hx - 8, B.hy - 16, 18, 9, 1), coat, B.hx - 8, B.hy - 16, 18, 9, 1);
  px(g, B.hx - 8, B.hy - 10, 18, 2, '#D4A017'); px(g, B.hx - 8, B.hy - 10, 18, 1, '#F2D27A');
  px(g, B.hx, B.hy - 15, 4, 4, INK); px(g, B.hx + 0.5, B.hy - 14.5, 3, 3, '#E8C25A');
  part(g, () => { g.moveTo(B.hx + 6, B.hy - 8); g.lineTo(B.hx + 14, B.hy - 7); g.lineTo(B.hx + 9, B.hy - 5); g.closePath(); }, '#18181B', B.hx + 6, B.hy - 8, 8, 3, 0.8);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: coat, hand: '#F8FAFC' });
  px(g, H.near[0] - 4, H.near[1] - 5, 3, 3, '#D4A017');
  // (the suitcase: in his near hand, up over his head for the throw, swung for the hit; its straps, corners, stickers)
  if (!H.held) {
    const [sx, sy] = up ? [B.hx - 12, B.hy - 36] : sw ? [H.near[0] - 2, H.near[1] - 6] : [H.near[0] - 10, H.near[1] + 2];
    const cc = pickOf(F.seed, 5, CASES);
    part(g, () => g.roundRect(sx, sy, 25, 18, 2), cc, sx, sy, 25, 18, 1);
    px(g, sx + 10, sy - 3, 6, 3, INK); px(g, sx + 11, sy - 2, 4, 1, '#5A3A1E');
    px(g, sx + 6, sy, 2, 18, dk(cc, 0.35)); px(g, sx + 17, sy, 2, 18, dk(cc, 0.35));
    px(g, sx, sy + 8, 25, 1, '#D6A84E');
    for (const [cx, cy] of [[sx, sy], [sx + 22, sy], [sx, sy + 15], [sx + 22, sy + 15]]) px(g, cx, cy, 3, 3, '#C8962E');
    px(g, sx + 9, sy + 11, 6, 4, pickOf(F.seed, 2, ['#F2E8C8', '#E86A4A', '#6AA8D8'])); px(g, sx + 9, sy + 11, 6, 1, '#FFFFFF');
  }
};
export const drawPorter = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'swingWind'], ['swing']));
  putFrame(c, 'porter', F, g => paintPorter(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The brakeman

const NECKS = ['#DC2626', '#1D4ED8', '#CA8A04', '#15803D'];
const paintBrakeman = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, denim = pickOf(F.seed, 2, ['#3B5B8A', '#2F4B73', '#4A6A9A']), neck = pickOf(F.seed, 4, NECKS);
  const stripes = (gg: Ctx, x: number, y: number, w: number, h: number) => { for (let k = x + 1; k < x + w; k += 3) px(gg, k, y, 1, h, lt(denim, 0.55)); };
  legs(g, B, { col: denim, shoe: 'boot', shoeCol: '#3F2A14', detail: (gg, hip, _k, ft) => { stripes(gg, Math.min(hip[0], ft[0]) - 3, hip[1], 7, ft[1] - hip[1] - 6); px(gg, ft[0] - 4, ft[1] - 7, 8, 2, dk(denim, 0.3)); } });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = hands(B, F, [-B.w / 2 - 2, B.shY + 18], up ? [-B.w / 2 + 2, B.shY - 14] : sw ? [B.w / 2 + 16, B.shY + 12] : [B.w / 2 + 3, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(L.shirt, 0.2), hand: L.skin, len: 0.5 });
  torso(g, B, L.shirt);
  // (the shirt's sleeves rolled, its buttons; the overalls' bib and straps, hickory-striped, the brass buckles, the
  // pocket with a pencil; the neckerchief)
  part(g, () => g.rect(-B.hipW / 2 + 2, B.shY + 10, B.hipW - 4, B.hipY - B.shY - 8), denim, -B.hipW / 2 + 2, B.shY + 10, B.hipW - 4, B.hipY - B.shY - 8, 1);
  stripes(g, -B.hipW / 2 + 3, B.shY + 11, B.hipW - 6, B.hipY - B.shY - 10);
  px(g, -4, B.shY + 14, 8, 6, dk(denim, 0.25)); px(g, 2, B.shY + 11, 1, 5, '#E8C25A');
  px(g, -B.w / 2 + 4, B.shY, 3, 12, denim); px(g, B.w / 2 - 7, B.shY, 3, 12, denim);
  px(g, -B.w / 2 + 4, B.shY + 9, 3, 3, '#C8962E'); px(g, B.w / 2 - 7, B.shY + 9, 3, 3, '#C8962E');
  part(g, () => { g.moveTo(-5, B.shY - 1); g.lineTo(6, B.shY - 1); g.lineTo(1, B.shY + 8); g.closePath(); }, neck, -5, B.shY - 1, 11, 9, 0.8);
  if (F.seed % 3 === 0 && F.pose !== 'strike') {
    // (a lantern hung off the bib: red glass)
    px(g, B.hipW / 2 - 3, B.hipY - 16, 1, 4, '#3A3A3A');
    part(g, () => g.roundRect(B.hipW / 2 - 6, B.hipY - 12, 8, 10, 1), '#B91C1C', B.hipW / 2 - 6, B.hipY - 12, 8, 10, 0.8);
    px(g, B.hipW / 2 - 4, B.hipY - 10, 2, 5, '#FCA5A5');
  }
  hairBack(g, B, L.hair, 12);
  ownFace(g, B, F, L.skin, up || sw ? 'angry' : 'open', sw ? 'teeth' : 'flat');
  whiskers(g, B);
  if (F.seed % 2) {
    // (the striped cap)
    partTop(g, () => { g.moveTo(B.hx - 9, B.hy - 6); g.quadraticCurveTo(B.hx, B.hy - 18, B.hx + 9, B.hy - 7); g.lineTo(B.hx + 16, B.hy - 5); g.lineTo(B.hx + 9, B.hy - 4); g.closePath(); }, denim, B.hx - 9, B.hy - 18, 25, 14, 1);
    for (let k = -7; k < 8; k += 3) px(g, B.hx + k, B.hy - 14 + Math.abs(k) * 0.3, 1, 8, lt(denim, 0.55));
  } else {
    // (a battered felt hat)
    const hat = pickOf(F.seed, 6, ['#4A3A2A', '#2A2622', '#5A4A3A']);
    partTop(g, () => { g.moveTo(B.hx - 7, B.hy - 7); g.quadraticCurveTo(B.hx - 6, B.hy - 19, B.hx + 1, B.hy - 17); g.quadraticCurveTo(B.hx + 8, B.hy - 19, B.hx + 9, B.hy - 7); g.closePath(); }, hat, B.hx - 7, B.hy - 19, 16, 12, 1);
    part(g, () => g.ellipse(B.hx + 1, B.hy - 7, 13, 2.6, -0.05, 0, Math.PI * 2), dk(hat, 0.1), B.hx - 12, B.hy - 10, 26, 5, 1);
    px(g, B.hx - 6, B.hy - 10, 14, 2, '#1A1410');
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: dk(L.shirt, 0.2), hand: L.skin, len: 0.5 });
  // (the brake club: a hickory stick, back over the shoulder for the tell, swung out for the hit; its grain, the
  // worn grip, the leather thong)
  if (!H.held) {
    const a = up ? -2.4 : sw ? 0.1 : -1.2;
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(a);
    part(g, () => g.roundRect(-3, -3, 36, 6, 3), '#A8783E', -3, -3, 36, 6, 1);
    for (let k = 4; k < 30; k += 6) px(g, k, -1, 3, 1, '#7A5228');
    px(g, 26, -3, 7, 6, '#6B4423'); px(g, -6, 1, 4, 1, '#3A2410'); px(g, -7, 2, 2, 3, '#3A2410');
    g.restore();
  }
};
export const drawBrakeman = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind'], ['swing']));
  putFrame(c, 'brakeman', F, g => paintBrakeman(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The robber (and his horse)

const DUSTERS = ['#A88A5A', '#6B4F2A', '#2A2622', '#8A7A62', '#5A4A3A'];
const BANDANAS = ['#B91C1C', '#1D4ED8', '#18181B', '#A16207', '#7E22CE'];
const VESTS = ['#3A2A1A', '#5A1A1A', '#2A3A2A', '#4A4A52'];
const paintRobber = (g: Ctx, F: Frame) => {
  const riding = F.v === 'ride';
  const B = bodyOf(F.seed, riding ? 'stand' : F.pose, F.fr), L = B.L, duster = pickOf(F.seed, 2, DUSTERS), band = pickOf(F.seed, 5, BANDANAS), vest = pickOf(F.seed, 7, VESTS);
  const aim = F.pose === 'tell', sw = F.pose === 'strike';
  const spur = (gg: Ctx, ft: number[]) => { px(gg, ft[0] - 6, ft[1] - 1, 3, 1, '#A1A1AA'); px(gg, ft[0] - 8, ft[1] - 2, 2, 2, '#D4D4D8'); };
  if (!riding) legs(g, B, { col: '#57534E', shoe: 'boot', shoeCol: '#3F2A14', detail: (gg, _h, _k, ft) => spur(gg, ft) });
  else {
    // (astride: the near leg forward and down the horse's flank, the boot in the stirrup, its spur)
    limb(g, 2, B.hipY + 2, 12, B.hipY + 12, B.legW, '#57534E'); limb(g, 12, B.hipY + 12, 10, B.hipY + 28, B.legW - 0.5, '#57534E');
    part(g, () => g.roundRect(6, B.hipY + 26, 12, 8, 2), '#3F2A14', 6, B.hipY + 26, 12, 8, 1);
    spur(g, [6, B.hipY + 32]);
  }
  const H = hands(B, F, [-B.w / 2 - 2, B.shY + 18], aim ? [B.w / 2 + 22, B.shY + 4] : sw ? [B.w / 2 + 14, B.shY + 2] : [B.w / 2 + 4, B.shY + 18]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: duster, hand: '#6B4423' });
  // (the duster: long, split at the back, flapping (riding, streaming back))
  const flap = F.pose === 'walk' ? Math.sin(F.fr) * 3 : riding ? -6 : 0;
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 7 + flap, riding ? B.hipY + 10 : -6); g.lineTo(B.hipW / 2 + 4, riding ? B.hipY + 10 : -8); g.lineTo(B.w / 2, B.shY + 2); g.closePath(); }, duster, -B.hipW / 2 - 7, B.shY + 2, B.hipW + 12, riding ? B.hipY - B.shY + 8 : -B.shY - 6, 1.2);
  if (!riding) { px(g, -B.hipW / 2 - 4 + flap, -14, 2, 8, dk(duster, 0.3)); dither(g, -B.hipW / 2 - 4, -16, B.hipW + 6, 6, dk(duster, 0.15)); }
  torso(g, B, duster);
  // (the vest under it, its buttons; the gun belt slung, cartridges round it, the buckle, the holster)
  part(g, () => g.rect(-5, B.shY + 2, 10, B.hipY - B.shY - 4), vest, -5, B.shY + 2, 10, B.hipY - B.shY - 4, 0.8);
  for (let k = 0; k < 3; k++) px(g, 0, B.shY + 6 + k * 5, 1, 1, '#C8962E');
  px(g, -1, B.shY + 2, 2, 3, '#E8E0D0');
  px(g, -B.hipW / 2 - 1, B.hipY - 3, B.hipW + 2, 4, '#3F2A14');
  for (let x = -B.hipW / 2; x < B.hipW / 2 - 1; x += 2) px(g, x, B.hipY - 2, 1, 2, '#D4A017');
  px(g, -2, B.hipY - 3, 4, 4, '#CA8A04'); px(g, -1, B.hipY - 2, 2, 2, '#3F2A14');
  if (!riding) part(g, () => g.roundRect(B.hipW / 2 - 5, B.hipY, 6, 10, 1), '#5A3A1E', B.hipW / 2 - 5, B.hipY, 6, 10, 0.8);
  hairBack(g, B, L.hair, 16);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: aim ? 'angry' : 'smug', mouth: 'flat', md: F.md, blink: F.blink });
  // (the bandana up over his nose and mouth, spotted on some, its knot behind; slipped down dead)
  const spots = F.seed % 2 === 0;
  if (F.md !== 'dead') {
    part(g, () => { g.moveTo(B.hx - 9, B.hy + 1); g.lineTo(B.hx + 10, B.hy + 1); g.lineTo(B.hx + 8, B.hy + 9); g.lineTo(B.hx + 1, B.hy + 13); g.lineTo(B.hx - 8, B.hy + 8); g.closePath(); }, band, B.hx - 9, B.hy + 1, 19, 12, 1);
    if (spots) for (const [dx, dy] of [[-5, 4], [0, 3], [5, 4], [-2, 8], [3, 8]]) px(g, B.hx + dx, B.hy + dy, 1.5, 1.5, '#F5F5F4');
    px(g, B.hx - 8, B.hy + 2, 17, 1, lt(band, 0.3));
  } else part(g, () => g.rect(B.hx - 8, B.hy + 9, 17, 4), band, B.hx - 8, B.hy + 9, 17, 4, 0.8);
  px(g, B.hx - 12, B.hy + 2, 3, 5, band); px(g, B.hx - 13, B.hy + 6, 2, 4, dk(band, 0.2));
  // (the hat: seeded: a cattleman's crease, a flat brim, a battered slouch; a band, a feather on one)
  const hk = F.seed % 3, hat = pickOf(F.seed, 9, ['#2A1A10', '#4A3A28', '#1A1614', '#6A5238']);
  if (hk === 0) partTop(g, () => { g.moveTo(B.hx - 7, B.hy - 8); g.quadraticCurveTo(B.hx - 6, B.hy - 22, B.hx + 1, B.hy - 18); g.quadraticCurveTo(B.hx + 8, B.hy - 22, B.hx + 9, B.hy - 8); g.closePath(); }, hat, B.hx - 7, B.hy - 22, 16, 14, 1);
  else if (hk === 1) partTop(g, () => g.roundRect(B.hx - 7, B.hy - 19, 16, 11, [3, 3, 0, 0]), hat, B.hx - 7, B.hy - 19, 16, 11, 1);
  else partTop(g, () => { g.moveTo(B.hx - 8, B.hy - 8); g.quadraticCurveTo(B.hx - 9, B.hy - 18, B.hx - 1, B.hy - 20); g.quadraticCurveTo(B.hx + 9, B.hy - 17, B.hx + 8, B.hy - 8); g.closePath(); }, hat, B.hx - 8, B.hy - 20, 17, 12, 1);
  const droop = hk === 2 ? 2 : 0;
  part(g, () => { g.moveTo(B.hx - 16, B.hy - 7 + droop); g.quadraticCurveTo(B.hx + 1, B.hy - 12, B.hx + 18, B.hy - 7 + droop); g.quadraticCurveTo(B.hx + 1, B.hy - 5, B.hx - 16, B.hy - 7 + droop); g.closePath(); }, dk(hat, 0.05), B.hx - 16, B.hy - 12, 34, 7, 1);
  px(g, B.hx - 7, B.hy - 11, 16, 2, pickOf(F.seed, 4, ['#A16207', '#7F1D1D', '#E7E5E4']));
  if (F.seed % 5 === 1) part(g, () => { g.moveTo(B.hx - 6, B.hy - 11); g.quadraticCurveTo(B.hx - 14, B.hy - 22, B.hx - 10, B.hy - 26); g.quadraticCurveTo(B.hx - 8, B.hy - 18, B.hx - 4, B.hy - 11); g.closePath(); }, '#E7E5E4', B.hx - 14, B.hy - 26, 10, 15, 0.7);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: duster, hand: '#6B4423' });
  // (the pistol: out level for the shot; reversed for the whip: its cylinder, the walnut grip, the blued barrel)
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(sw ? -0.9 : aim ? 0 : 0.7);
    part(g, () => g.rect(0, -3, 16, 4), '#52525B', 0, -3, 16, 4, 0.8); px(g, 1, -3, 14, 1, '#A1A1AA');
    part(g, () => g.roundRect(2, -5, 6, 6, 1), '#71717A', 2, -5, 6, 6, 0.8);
    part(g, () => g.roundRect(-2, -1, 5, 9, 1), '#6B4423', -2, -1, 5, 9, 0.8); px(g, -1, 1, 1, 5, '#9A6A3A');
    if (aim) px(g, 15, -4, 2, 1, '#18181B');
    g.restore();
  }
};
export const drawRobber = (c: Ctx, e: Enemy, f: number, seed: number) => {
  // (riding, or leaping off the horse onto the train: the train draws him, in the near lane in front of the cars:
  // passers.ts)
  if (e.health > 0 && (e.aiState === 'ride' || e.aiState === 'rideAim' || e.aiState === 'leap')) return;
  const F = frameFor(e, f, seed, poseOf(e, ['aim', 'whipWind'], ['whip']));
  putFrame(c, 'robber', F, g => paintRobber(g, F));
};
/** A robber on foot, wherever the caller's put the origin (his feet): leaping off his horse onto the train. */
export const drawRobberAt = (c: Ctx, e: Enemy, f: number, seed: number) => {
  if ((e.facing ?? 1) < 0) c.scale(-1, 1);
  const F = frameOf(seed, f, 'walk', (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok', 0);
  putFrame(c, 'robber', F, g => paintRobber(g, F));
};
/** A robber on his horse (world: feet at (x, feetY), facing): the horse galloping under him. `aim`: the pistol up. */
export const drawRider = (c: Ctx, e: Enemy, x: number, feetY: number, f: number, seed: number) => {
  const aim = e.aiState === 'rideAim';
  drawHorse(c, x, feetY + 50, e.facing ?? 1, f, seed);
  c.save(); c.translate(Math.round(x), Math.round(feetY + 14 + horseBob(f))); if ((e.facing ?? 1) < 0) c.scale(-1, 1);
  if ((e.hitFlash ?? 0) > 0) c.filter = 'brightness(2)';
  const F = frameOf(seed, f, aim ? 'tell' : 'stand', (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok', 0, undefined, 'ride');
  putFrame(c, 'robber', F, g => paintRobber(g, F));
  c.restore();
};

// ---- the horse

const COATS = [
  { coat: '#6B4423', mane: '#1C1209', sock: false }, // a bay
  { coat: '#2A1A10', mane: '#0E0806', sock: true }, // black, a white sock
  { coat: '#A0603A', mane: '#6A3A1A', sock: false }, // chestnut
  { coat: '#B8B4AE', mane: '#5A5650', sock: false }, // gray
  { coat: '#E7E5E4', mane: '#8A8680', sock: false, paint: '#6B4423' }, // a paint
];
const GALLOP: [number, number][][] = [
  // [front far, front near, hind far, hind near]: [knee dx, foot dx]; then lift
  [[10, 20], [6, 14], [-8, -18], [-4, -12]],
  [[4, 2], [8, 10], [2, 6], [-6, -10]],
  [[-4, -10], [0, -4], [8, 16], [4, 10]],
  [[2, 10], [-2, -6], [6, 2], [8, 16]],
];
const LIFT = [[6, 2, 4, 0], [0, 6, 0, 4], [2, 0, 6, 2], [4, 0, 2, 6]];
const horseBob = (f: number) => [0, -3, -1, -2][Math.floor(f / 4) % 4];
const paintHorse = (g: Ctx, seed: number, fr: number) => {
  const C = COATS[seed % COATS.length], coat = C.coat, mane = C.mane, blanket = pickOf(seed, 4, ['#B91C1C', '#1D4ED8', '#CA8A04', '#15803D']);
  const leg = (hx: number, hy: number, kx: number, fx: number, lift: number, far: boolean, sock: boolean) => {
    const col = far ? dk(coat, 0.22) : coat, ky = -20 - lift * 0.5, fy = -3 - lift;
    stroke(g, hx, hy, hx + kx * 0.5, ky, far ? 7 : 8, col);
    stroke(g, hx + kx * 0.5, ky, hx + fx, fy, far ? 4.5 : 5, sock ? '#F2EEE6' : col);
    px(g, hx + fx - 3.5, fy - 1, 7, 4, INK); px(g, hx + fx - 2.5, fy, 5, 2, '#3A3A3A');
  };
  const G = GALLOP[fr], Lf = LIFT[fr];
  leg(18, -42, G[0][0], G[0][1], Lf[0], true, false); leg(-22, -44, G[2][0], G[2][1], Lf[2], true, false);
  // (the tail streaming back)
  part(g, () => { g.moveTo(-30, -54); g.quadraticCurveTo(-50, -50 + fr * 2, -56, -30 + fr); g.lineTo(-48, -34); g.quadraticCurveTo(-42, -46, -28, -46); g.closePath(); }, mane, -56, -54, 28, 24, 1);
  for (let k = 0; k < 4; k++) px(g, -48 + k * 3, -44 + k * 3, 3, 1, lt(mane, 0.25));
  // (the barrel, the hindquarters and the chest, the patches of a paint)
  part(g, () => { g.moveTo(-34, -48); g.quadraticCurveTo(-36, -62, -20, -62); g.lineTo(18, -62); g.quadraticCurveTo(34, -62, 34, -48); g.quadraticCurveTo(32, -36, 18, -34); g.lineTo(-20, -34); g.quadraticCurveTo(-34, -36, -34, -48); g.closePath(); }, coat, -36, -62, 70, 28, 1.2);
  if (C.paint) { g.save(); g.beginPath(); g.ellipse(0, -48, 33, 14, 0, 0, Math.PI * 2); g.clip(); part(g, () => g.ellipse(-12, -50, 12, 9, 0.3, 0, Math.PI * 2), C.paint!, -24, -59, 24, 18, 0); part(g, () => g.ellipse(14, -40, 9, 6, -0.2, 0, Math.PI * 2), C.paint!, 5, -46, 18, 12, 0); g.restore(); }
  px(g, -24, -61, 40, 2, lt(coat, 0.3));
  for (let k = 0; k < 4; k++) px(g, -6 + k * 5, -50 + (k % 2) * 3, 1, 8, dk(coat, 0.12));
  // (the neck up, the mane down its crest, the head, the ears, the eye, the nostril, the blaze on some)
  part(g, () => { g.moveTo(18, -58); g.lineTo(32, -82); g.lineTo(44, -80); g.lineTo(36, -50); g.closePath(); }, coat, 18, -82, 26, 32, 1.2);
  part(g, () => { g.moveTo(36, -84); g.lineTo(47, -92); g.lineTo(60, -82); g.lineTo(62, -75); g.quadraticCurveTo(56, -72, 48, -75); g.closePath(); }, coat, 36, -92, 26, 20, 1.2);
  part(g, () => { g.moveTo(40, -88); g.lineTo(38, -97); g.lineTo(44, -90); g.closePath(); }, dk(coat, 0.1), 38, -97, 6, 9, 0.8);
  for (let k = 0; k < 5; k++) { px(g, 26 + k * 3, -80 + k * 6, 5, 7, mane); px(g, 27 + k * 3, -80 + k * 6, 2, 3, lt(mane, 0.25)); }
  px(g, 36, -88, 6, 4, mane);
  if (seed % 3 === 1) px(g, 52, -86, 3, 9, '#F2EEE6');
  px(g, 47, -86, 3, 3, INK); px(g, 47, -86, 1, 1, '#FFFFFF'); px(g, 58, -78, 2, 2, INK);
  // (the bridle and the reins back to the rider's hand)
  g.strokeStyle = '#3A2410'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(44, -90); g.lineTo(50, -76); g.moveTo(44, -84); g.lineTo(60, -80); g.moveTo(52, -76); g.quadraticCurveTo(36, -70, 22, -66); g.stroke();
  px(g, 51, -77, 2, 2, '#A1A1AA');
  // (the blanket and the saddle: its horn, the skirt, the cinch, the stirrup leather)
  part(g, () => g.roundRect(-18, -64, 32, 12, 2), blanket, -18, -64, 32, 12, 1);
  for (let x = -16; x < 12; x += 4) px(g, x, -55, 2, 2, lt(blanket, 0.4));
  part(g, () => { g.moveTo(-16, -62); g.quadraticCurveTo(-14, -70, -6, -68); g.lineTo(8, -68); g.lineTo(12, -74); g.lineTo(15, -73); g.lineTo(13, -62); g.closePath(); }, '#6A3018', -16, -74, 31, 12, 1);
  px(g, -10, -66, 16, 1, '#9A5A2A');
  px(g, -2, -60, 3, 14, '#3A2410');
  // (the near legs over it all)
  leg(24, -42, G[1][0], G[1][1], Lf[1], false, C.sock); leg(-16, -44, G[3][0], G[3][1], Lf[3], false, false);
};
/** A horse galloping (world: hooves at (x, groundY)), a saddle on it. */
export const drawHorse = (c: Ctx, x: number, groundY: number, facing: number, f: number, seed: number) => {
  const fr = Math.floor(f / 4) % 4;
  c.save(); c.translate(Math.round(x), Math.round(groundY + horseBob(f))); if (facing < 0) c.scale(-1, 1);
  still(c, `trk-horse-${seed % COATS.length}-${seed % 3}-${pickOf(seed, 4, [0, 1, 2, 3])}-${fr}`, -62, -102, 130, 106, g => paintHorse(g, seed, fr));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The cook

const paintCook = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  B.w += 4; B.hipW += 4;
  legs(g, B, { col: '#57534E', shoe: 'shoe', shoeCol: '#1C1917', stripe: '#78716C' });
  const st = F.v; // 'pan' or 'cleaver'
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = hands(B, F, [-B.w / 2 - 2, B.shY + 20], up ? [B.hx - 2, B.hy - 16] : sw ? [B.w / 2 + 18, B.shY + 10] : [B.w / 2 + 4, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#F5F5F4', hand: L.skin, len: 0.55 });
  torso(g, B, '#F5F5F4');
  // (the double-breasted front, its cloth buttons; the neckerchief)
  for (let k = 0; k < 3; k++) { px(g, -5, B.shY + 5 + k * 6, 2, 2, '#A8A29E'); px(g, 4, B.shY + 5 + k * 6, 2, 2, '#A8A29E'); }
  px(g, -1, B.shY + 2, 1, B.hipY - B.shY - 2, '#D6D3D1');
  part(g, () => { g.moveTo(-5, B.shY - 1); g.lineTo(6, B.shY - 1); g.lineTo(1, B.shY + 5); g.closePath(); }, pickOf(F.seed, 3, ['#DC2626', '#1D4ED8', '#F5F5F4']), -5, B.shY - 1, 11, 6, 0.6);
  // (the apron, stained: gravy, blood, something green; a dish towel tucked in its strings)
  part(g, () => g.rect(-B.hipW / 2 + 1, B.shY + 14, B.hipW - 2, B.hipY - B.shY + 12), '#E7E5E4', -B.hipW / 2 + 1, B.shY + 14, B.hipW - 2, B.hipY - B.shY + 12, 1);
  px(g, -B.hipW / 2 + 1, B.hipY - 4, B.hipW - 2, 1, '#A8A29E');
  px(g, -3, B.shY + 22, 5, 4, '#92400E'); px(g, -2, B.shY + 26, 3, 2, '#7A3A0E'); px(g, 4, B.hipY, 4, 3, '#991B1B'); px(g, 5, B.hipY + 3, 2, 3, '#7F1D1D'); px(g, -6, B.hipY + 6, 3, 3, '#65A30D');
  part(g, () => g.rect(B.hipW / 2 - 6, B.hipY - 4, 5, 12), '#93C5FD', B.hipW / 2 - 6, B.hipY - 4, 5, 12, 0.6); for (let y = B.hipY - 3; y < B.hipY + 8; y += 3) px(g, B.hipW / 2 - 6, y, 5, 1, '#F5F5F4');
  hairBack(g, B, L.hair, 10);
  ownFace(g, B, F, L.skin, 'angry', up || sw ? 'teeth' : 'frown');
  whiskers(g, B);
  // (the toque: tall, pleated, puffed at the top; its band)
  const tall = F.seed % 2 ? 6 : 0;
  partTop(g, () => { g.moveTo(B.hx - 8, B.hy - 7); g.lineTo(B.hx - 9, B.hy - 22 - tall); g.quadraticCurveTo(B.hx - 13, B.hy - 32 - tall, B.hx - 2, B.hy - 31 - tall); g.quadraticCurveTo(B.hx + 4, B.hy - 37 - tall, B.hx + 9, B.hy - 29 - tall); g.quadraticCurveTo(B.hx + 14, B.hy - 24 - tall, B.hx + 9, B.hy - 21 - tall); g.lineTo(B.hx + 9, B.hy - 7); g.closePath(); }, '#FAFAF9', B.hx - 13, B.hy - 37 - tall, 27, 30 + tall, 1);
  for (let k = -5; k <= 6; k += 4) px(g, B.hx + k, B.hy - 20 - tall, 1, 10 + tall, '#D6D3D1');
  px(g, B.hx - 8, B.hy - 11, 17, 4, '#E7E5E4'); px(g, B.hx - 8, B.hy - 11, 17, 1, '#FFFFFF');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#F5F5F4', hand: L.skin, len: 0.55 });
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -2.2 : sw ? 0.2 : -0.6);
    if (st === 'pan') {
      part(g, () => g.rect(0, -2, 15, 4), '#3F3F46', 0, -2, 15, 4, 0.8);
      part(g, () => g.ellipse(24, 0, 11, 7.5, 0, 0, Math.PI * 2), '#27272A', 13, -7.5, 22, 15, 1);
      px(g, 18, -4, 8, 1, '#71717A'); px(g, 22, -1, 4, 3, '#F2E8B0'); px(g, 23, 0, 2, 1, '#E8A020');
    } else {
      part(g, () => g.rect(-2, -2, 9, 4), '#6B4423', -2, -2, 9, 4, 0.8); px(g, 1, -1, 1, 2, '#C8962E');
      part(g, () => g.rect(6, -8, 14, 12), '#D4D4D8', 6, -8, 14, 12, 1); px(g, 6, -8, 14, 2, '#F4F4F5'); px(g, 17, -6, 2, 2, INK); px(g, 8, 2, 11, 1, '#991B1B');
    }
    g.restore();
  }
};
export const drawCook = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const pan = e.aiState === 'panWind' || e.aiState === 'pan';
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'panWind'], ['pan']), undefined, pan ? 'pan' : 'cleaver');
  putFrame(c, 'cook', F, g => paintCook(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The passengers

const DRESSES = ['#6B21A8', '#166534', '#1E3A8A', '#9F1239', '#A16207', '#0F766E'];
const COATS_M = ['#1C1917', '#3A2A20', '#2A3040', '#4A3A2A'];
const paintPassenger = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, lady = L.woman;
  const cloth = pickOf(F.seed, 3, DRESSES), coatM = pickOf(F.seed, 5, COATS_M);
  const up = F.pose === 'tell', jab = F.pose === 'strike';
  if (lady) {
    // (a long bustle dress to the floor, the bustle behind, a ruffled hem, pleats; the toes of her boots)
    part(g, () => { g.moveTo(-B.hipW / 2, B.hipY - 2); g.lineTo(-B.hipW / 2 - 9, -1); g.lineTo(B.hipW / 2 + 6, -1); g.lineTo(B.hipW / 2, B.hipY - 2); g.closePath(); }, cloth, -B.hipW / 2 - 9, B.hipY - 2, B.hipW + 15, -B.hipY + 1, 1.2);
    part(g, () => g.ellipse(-B.hipW / 2 - 4, B.hipY + 6, 9, 11, 0, 0, Math.PI * 2), dk(cloth, 0.15), -B.hipW / 2 - 13, B.hipY - 5, 18, 22, 1);
    px(g, -B.hipW / 2 - 9, B.hipY + 4, 6, 1, lt(cloth, 0.3));
    for (let k = -2; k <= 2; k++) px(g, k * 5, B.hipY + 8, 1, -B.hipY - 10, dk(cloth, 0.22));
    for (let x = -B.hipW / 2 - 8; x < B.hipW / 2 + 6; x += 3) px(g, x, -5 + ((x & 2) ? 1 : 0), 2, 3, lt(cloth, 0.35));
    px(g, B.feet[1] + 2, -3, 6, 3, '#1C1917');
  } else legs(g, B, { col: '#3F3F46', shoe: 'shoe', shoeCol: '#0C0A09', stripe: '#52525B' });
  const H = hands(B, F, [-B.w / 2 - 2, B.shY + 18], up ? [-2, B.shY + 10] : jab ? [B.w / 2 + 22, B.shY + 14] : [B.w / 2 + 6, B.shY + 18]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: lady ? cloth : coatM, hand: lady ? '#F5F5F4' : L.skin });
  if (!lady) {
    // (the frock coat's tails behind)
    part(g, () => { g.moveTo(-B.hipW / 2, B.hipY - 4); g.lineTo(-B.hipW / 2 - 4, B.hipY + 18); g.lineTo(-B.hipW / 2 + 6, B.hipY + 18); g.lineTo(-2, B.hipY - 2); g.closePath(); }, dk(coatM, 0.1), -B.hipW / 2 - 4, B.hipY - 4, B.hipW / 2 + 2, 22, 1);
  }
  torso(g, B, lady ? cloth : coatM);
  if (lady) {
    // (the bodice's buttons, the lace collar, the cameo)
    for (let k = 0; k < 4; k++) px(g, 0, B.shY + 4 + k * 5, 2, 2, '#FDE68A');
    for (let x = -5; x < 6; x += 2) px(g, x, B.shY - 1 + ((x & 2) ? 1 : 0), 2, 3, '#F5F5F4');
    px(g, -1, B.shY + 3, 4, 4, INK); px(g, -0.5, B.shY + 3.5, 3, 3, '#F2D2B8'); px(g, 0, B.shY + 4, 1, 1, '#FFFFFF');
  } else {
    // (the shirt front and tie, the waistcoat, the watch chain, the lapels)
    part(g, () => { g.moveTo(-4, B.shY); g.lineTo(0, B.shY + 14); g.lineTo(5, B.shY); g.closePath(); }, '#F5F5F4', -4, B.shY, 9, 14, 0.6);
    px(g, -1, B.shY + 1, 3, 4, pickOf(F.seed, 6, ['#7F1D1D', '#1E3A8A', '#18181B']));
    part(g, () => g.rect(-5, B.shY + 10, 10, B.hipY - B.shY - 10), pickOf(F.seed, 8, ['#A16207', '#4A3A2A', '#7A6A5A', '#5A1A2A']), -5, B.shY + 10, 10, B.hipY - B.shY - 10, 0.6);
    chain(g, B);
    px(g, -7, B.shY + 1, 3, 12, lt(coatM, 0.2)); px(g, 5, B.shY + 1, 3, 12, dk(coatM, 0.3));
  }
  hairBack(g, B, L.hair, lady ? 16 : 10);
  ownFace(g, B, F, L.skin, up || jab ? 'angry' : 'smug', jab ? 'o' : 'flat');
  if (!lady) whiskers(g, B);
  glasses(g, B);
  if (lady) {
    // (the feathered hat, tipped forward, its ribbon, a plume curling back; her bun)
    hairTop(g, B);
    ball(g, B.hx - 7, B.hy - 2, 4, L.hair, 0.8);
    part(g, () => g.ellipse(B.hx + 2, B.hy - 9, 14, 3.4, -0.1, 0, Math.PI * 2), dk(cloth, 0.1), B.hx - 12, B.hy - 13, 28, 7, 1);
    partTop(g, () => g.roundRect(B.hx - 5, B.hy - 18, 14, 9, 3), cloth, B.hx - 5, B.hy - 18, 14, 9, 1);
    px(g, B.hx - 5, B.hy - 12, 14, 2, pickOf(F.seed, 9, ['#F5F5F4', '#FDE68A', '#18181B']));
    part(g, () => { g.moveTo(B.hx - 3, B.hy - 16); g.quadraticCurveTo(B.hx - 16, B.hy - 32, B.hx - 23, B.hy - 18); g.quadraticCurveTo(B.hx - 12, B.hy - 23, B.hx - 1, B.hy - 13); g.closePath(); }, pickOf(F.seed, 6, ['#F8FAFC', '#F9A8D4', '#18181B', '#7DD3FC']), B.hx - 23, B.hy - 32, 22, 19, 0.8);
    for (let k = 0; k < 4; k++) px(g, B.hx - 16 + k * 3, B.hy - 26 + k * 3, 2, 1, '#FFFFFF');
  } else if (F.seed % 2) {
    // (a top hat: its silk sheen, a band)
    partTop(g, () => g.rect(B.hx - 7, B.hy - 27, 15, 18), '#18181B', B.hx - 7, B.hy - 27, 15, 18, 1);
    px(g, B.hx - 5, B.hy - 26, 2, 15, '#52525B');
    part(g, () => g.rect(B.hx - 11, B.hy - 11, 23, 3), '#18181B', B.hx - 11, B.hy - 11, 23, 3, 1); px(g, B.hx - 7, B.hy - 14, 15, 2, '#7F1D1D');
  } else {
    // (a bowler)
    partTop(g, () => g.ellipse(B.hx + 1, B.hy - 11, 9, 8, 0, Math.PI, 0), '#292524', B.hx - 8, B.hy - 19, 18, 9, 1);
    part(g, () => g.ellipse(B.hx + 1, B.hy - 10, 13, 2.4, 0, 0, Math.PI * 2), '#292524', B.hx - 12, B.hy - 13, 26, 5, 1);
    px(g, B.hx - 7, B.hy - 12, 16, 1, '#4A4440'); px(g, B.hx - 4, B.hy - 18, 3, 2, '#57534E');
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: lady ? cloth : coatM, hand: lady ? '#F5F5F4' : L.skin });
  // (the parasol, furled, point first, lace at its edge; or the cane, ferrule first, a gold knob)
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -0.5 : jab ? 0 : 1.1);
    if (lady) {
      const pc = pickOf(F.seed, 8, ['#FDF2F8', '#FEF3C7', '#E0E7FF']);
      part(g, () => { g.moveTo(-6, -4); g.lineTo(26, -1); g.lineTo(26, 1); g.lineTo(-6, 4); g.closePath(); }, pc, -6, -4, 32, 8, 0.8);
      for (let x = -4; x < 22; x += 3) px(g, x, 3 - (x + 6) * 0.08, 2, 1, '#FFFFFF');
      px(g, 26, -1, 9, 2, '#A8A29E'); part(g, () => g.arc(-8, 0, 3, Math.PI * 0.5, Math.PI * 1.5), '#6B4423', -11, -3, 4, 6, 0.8);
    } else {
      px(g, -4, -1, 34, 3, '#2A1A10'); px(g, -4, -1, 34, 1, '#5A3A20'); px(g, 28, -1, 4, 3, '#D4D4D8');
      part(g, () => g.arc(-5, -3, 4, Math.PI * 0.6, Math.PI * 1.9), '#CA8A04', -9, -7, 8, 8, 0.8);
    }
    g.restore();
  }
};
export const drawPassenger = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind'], ['jab']));
  putFrame(c, 'passenger', F, g => paintPassenger(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The fireman

const paintFireman = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const soot = '#3F3F46';
  legs(g, B, { col: '#44403C', shoe: 'boot', shoeCol: '#1C1917', detail: (gg, hip, _k, ft) => px(gg, (hip[0] + ft[0]) / 2 - 2, (hip[1] + ft[1]) / 2, 4, 3, '#27272A') });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = hands(B, F, up ? [-B.w / 2 - 10, B.shY + 16] : [-B.w / 2 + 2, B.shY + 22], up ? [-B.w / 2 - 2, B.shY + 4] : sw ? [B.w / 2 + 18, B.shY + 10] : [B.w / 2 + 6, B.shY + 22]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: soot, len: 0 });
  torso(g, B, '#A8A29E');
  // (the undershirt gone gray, sweat and soot; the red suspenders and their buttons; the bandana at the neck)
  px(g, -B.w / 2 + 5, B.shY, 3, B.hipY - B.shY, '#991B1B'); px(g, B.w / 2 - 8, B.shY, 3, B.hipY - B.shY, '#991B1B');
  px(g, -B.w / 2 + 5, B.shY, 1, B.hipY - B.shY, '#DC2626'); px(g, B.w / 2 - 8, B.shY, 1, B.hipY - B.shY, '#DC2626');
  px(g, -4, B.shY + 10, 6, 5, '#78716C'); px(g, 3, B.shY + 18, 5, 4, '#57534E'); dither(g, -B.w / 2 + 2, B.shY + 14, B.w - 4, 8, '#6E6A64');
  part(g, () => { g.moveTo(-5, B.shY - 1); g.lineTo(6, B.shY - 1); g.lineTo(1, B.shY + 6); g.closePath(); }, pickOf(F.seed, 3, ['#1D4ED8', '#18181B', '#B91C1C']), -5, B.shY - 1, 11, 7, 0.6);
  hairBack(g, B, L.hair, 10);
  headShape(g, B, L.skin);
  // (soot to the eyebrows: the face dark but round the eyes, where the goggles were)
  px(g, B.hx - 9, B.hy - 2, 18, 11, 'rgba(39, 39, 42, 0.55)');
  px(g, B.hx - 1, B.hy - 3, 8, 4, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: up || sw ? 'angry' : 'tired', mouth: sw ? 'teeth' : 'flat', md: F.md, blink: F.blink });
  whiskers(g, B);
  // (the cap, the goggles pushed up on it: brass rims, green glass)
  partTop(g, () => { g.moveTo(B.hx - 9, B.hy - 6); g.quadraticCurveTo(B.hx, B.hy - 17, B.hx + 9, B.hy - 7); g.lineTo(B.hx + 15, B.hy - 5); g.lineTo(B.hx + 8, B.hy - 4); g.closePath(); }, '#292524', B.hx - 9, B.hy - 17, 24, 13, 1);
  px(g, B.hx - 8, B.hy - 11, 16, 2, '#3F2A14');
  for (const gx of [B.hx - 5, B.hx + 2]) { px(g, gx - 0.5, B.hy - 13.5, 6, 6, INK); px(g, gx, B.hy - 13, 5, 5, '#C8962E'); px(g, gx + 1, B.hy - 12, 3, 3, '#2E6A4A'); px(g, gx + 1, B.hy - 12, 1, 1, '#9AE8C8'); }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: soot, len: 0 });
  // (the coal shovel: back and heaped for the tell, swung for the hit; its D grip, the scoop's lip)
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -2.8 : sw ? 0.15 : 1.2);
    px(g, -6, -1, 30, 3, '#6B4423'); px(g, -6, -1, 30, 1, '#9A6A3A');
    part(g, () => g.roundRect(-11, -3, 6, 7, 2), '#6B4423', -11, -3, 6, 7, 0.8);
    part(g, () => { g.moveTo(22, -7); g.lineTo(37, -6); g.lineTo(37, 6); g.lineTo(22, 7); g.closePath(); }, '#52525B', 22, -7, 15, 14, 1);
    px(g, 36, -6, 1, 12, '#A1A1AA');
    if (up) for (let k = 0; k < 4; k++) ball(g, 26 + k * 3, -8 - (k % 2) * 2, 2.6, '#18181B', 0.6);
    g.restore();
  }
};
export const drawFireman = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'swingWind'], ['swing']));
  putFrame(c, 'fireman', F, g => paintFireman(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The steer (a longhorn, the wilds' animals' way)

type Mood = 'ok' | 'hurt' | 'dead';
const HIDES = ['#8A4A22', '#A0703C', '#5A3A22', '#C8A070'];
const PATCHES = ['#F5F5F4', '#2A1A10', '#E7D8B8', '#7A2E14'];
const ink = (g: Ctx, path: () => void, fill: string, line = 1) => { g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke(); };
const tick = (g: Ctx, x: number, y: number, w: number, h: number, col: string, n: number, seed: number) => {
  for (let i = 0; i < n; i++) {
    const a = Math.sin(seed * 12.9 + i * 78.2) * 43758.5, k = a - Math.floor(a), b = Math.sin(seed * 3.1 + i * 19.7) * 1e4, k2 = b - Math.floor(b);
    g.fillStyle = k2 < 0.5 ? dk(col, 0.2) : lt(col, 0.22); g.fillRect(x + k * w, y + k2 * h, 1, 2);
  }
};
const paintSteer = (g: Ctx, hide: string, patch: string, pv: number, pose: string, fr: number, md: Mood) => {
  g.save();
  if (md === 'dead') { g.translate(0, -60); g.scale(1, -1); }
  if (md === 'hurt') g.translate(-2, 2);
  const charge = pose === 'charge', paw = pose === 'paw';
  const sw = (k: number) => (charge ? [9, 3, -9, -3][(fr + k) % 4] : pose === 'walk' ? [4, -4][(fr + k) % 2] : 0);
  const legAt = (x: number, k: number, far: boolean, front: boolean) => {
    const col = far ? dk(hide, 0.25) : hide, hy = -28;
    let s = sw(k), lift = 0;
    if (md === 'dead') { s = front ? 6 : -6; }
    if (paw && front && !far) { s = [6, 2, -4][fr % 3]; lift = [6, 2, 0][fr % 3]; }
    stroke(g, x, hy, x + s * 0.5, hy + 13 - lift * 0.5, far ? 6 : 7, col);
    stroke(g, x + s * 0.5, hy + 13 - lift * 0.5, x + s, -3 - lift, far ? 5 : 5.5, col);
    ink(g, () => g.ellipse(x + s + 0.5, -2 - lift, 3.6, 1.8, 0, 0, Math.PI * 2), '#1A120C', 0.8);
  };
  legAt(22, 1, true, true); legAt(-28, 0, true, false);
  // (the tail, a switch at its end)
  g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.moveTo(-34, -44); g.quadraticCurveTo(-42, -38, -40, -22 + (fr % 2)); g.stroke();
  g.strokeStyle = dk(hide, 0.2); g.lineWidth = 1.6; g.stroke();
  ink(g, () => g.ellipse(-40, -20 + (fr % 2), 2.6, 4.4, 0.1, 0, Math.PI * 2), '#2A1A10', 0.8);
  // (the body: lean through the flank, the hump at the withers; the patches; the hide ticked; the ribs a shade)
  const body = () => { g.moveTo(-36, -40); g.quadraticCurveTo(-36, -52, -22, -52); g.lineTo(18, -54); g.quadraticCurveTo(30, -58, 36, -48); g.quadraticCurveTo(38, -34, 26, -26); g.lineTo(-26, -26); g.quadraticCurveTo(-37, -28, -36, -40); g.closePath(); };
  part(g, body, hide, -37, -58, 76, 32, 1.2);
  g.save(); g.beginPath(); body(); g.clip();
  const P = patch, NO = 0.01;
  if (pv % 2 === 0) { part(g, () => g.ellipse(-12, -44, 13, 9, 0.3, 0, Math.PI * 2), P, -25, -53, 26, 18, NO); part(g, () => g.ellipse(18, -34, 8, 7, -0.2, 0, Math.PI * 2), P, 10, -41, 16, 14, NO); }
  else { part(g, () => g.ellipse(4, -46, 18, 8, 0, 0, Math.PI * 2), P, -14, -54, 36, 16, NO); part(g, () => g.ellipse(-26, -32, 9, 8, 0, 0, Math.PI * 2), P, -35, -40, 18, 16, NO); }
  tick(g, -32, -50, 64, 22, hide, 30, pv + 3);
  g.fillStyle = dk(hide, 0.18);
  for (let k = 0; k < 4; k++) g.fillRect(-6 + k * 5, -40, 1, 9);
  g.restore();
  px(g, -22, -52, 34, 1, lt(hide, 0.35));
  legAt(30, 3, false, true); legAt(-20, 2, false, false);
  // (the head: long-faced, low for the charge; the muzzle, the nostril, the ear; the longhorns out wide (pointy), banded
  // pale to dark tips)
  const hy = charge || paw ? -32 : -44;
  g.save(); g.translate(36, hy); g.rotate(charge ? 0.35 : 0);
  ink(g, () => { g.moveTo(-6, -6); g.lineTo(6, -9); g.quadraticCurveTo(14, -6, 18, 4); g.quadraticCurveTo(16, 10, 10, 10); g.lineTo(-2, 6); g.closePath(); }, hide, 1.1);
  px(g, -4, -6, 8, 2, lt(hide, 0.3));
  ink(g, () => g.ellipse(14, 6, 5.5, 4.4, 0, 0, Math.PI * 2), '#D6A8A0', 1);
  px(g, 15, 5, 2, 2, INK); px(g, 17, 6, 1, 1, INK);
  ink(g, () => g.ellipse(-6, -4, 5, 2.4, -0.5, 0, Math.PI * 2), dk(hide, 0.1), 0.9);
  for (const [col, wd] of [[INK, 5.6], ['#C8B898', 3.6], ['#F5EBD8', 1.6]] as [string, number][]) {
    g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.beginPath();
    g.moveTo(-1, -7); g.quadraticCurveTo(-18, -12, -28, -26);
    g.moveTo(4, -8); g.quadraticCurveTo(22, -15, 32, -28); g.stroke();
  }
  g.strokeStyle = '#3A2A1A'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(-25, -22); g.lineTo(-28, -26); g.moveTo(29, -24); g.lineTo(32, -28); g.stroke();
  g.lineCap = 'butt';
  // (an eye: shut hurt, crossed out dead (the tongue out), angry otherwise)
  if (md === 'dead') { g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(2, -4); g.lineTo(6, 0); g.moveTo(2, 0); g.lineTo(6, -4); g.stroke(); ink(g, () => g.ellipse(12, 13, 2, 4.5, 0.2, 0, Math.PI * 2), '#E87A90', 0.8); }
  else if (md === 'hurt') { g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(2, -3); g.lineTo(6, -2); g.lineTo(2, -1); g.stroke(); }
  else { ink(g, () => g.ellipse(4, -2.4, 1.8, 1.6, 0, 0, Math.PI * 2), '#3A1A0A', 0.7); px(g, 3, -3.5, 1, 1, '#FFFFFF'); if (paw || charge) { g.strokeStyle = INK; g.lineWidth = 1.3; g.beginPath(); g.moveTo(0, -6); g.lineTo(7, -4); g.stroke(); } }
  g.restore();
  g.restore();
};
const cycSt = (f: number, e: Enemy, n: number, per: number) => Math.floor((f + (e.variant ?? 0) * 7) / per) % n;
export const drawSteer = (c: Ctx, e: Enemy, f: number) => {
  const md: Mood = moodOf(e), st = e.aiState ?? '', seed = Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0);
  const hi = Math.abs(Math.floor(seed / 3) + 6) % HIDES.length, pi = Math.abs(Math.floor(seed / 4) + 21) % PATCHES.length, pv = seed % 4;
  let pose = 'stand', fr = 0;
  if (st === 'charge') { pose = 'charge'; fr = cycSt(f, e, 4, 4); }
  else if (st === 'paw') { pose = 'paw'; fr = cycSt(f, e, 3, 8); }
  else if (Math.abs(e.vel.x) > 0.25) { pose = 'walk'; fr = cycSt(f, e, 2, 12); }
  if (md !== 'ok') { pose = md === 'dead' ? 'stand' : pose; fr = md === 'dead' ? 0 : fr; }
  still(c, `trk-steer-${hi}-${pi}-${pv}-${pose}-${fr}-${md}`, -72, -96, 150, 104, g => paintSteer(g, HIDES[hi], PATCHES[pi], pv, pose, fr, md));
  // (the snort: steam out of the nose, pawing)
  if (st === 'paw' && md === 'ok' && f % 20 < 10) { c.globalAlpha = 0.6; for (let i = 0; i < 3; i++) { c.fillStyle = '#F1F5F9'; c.fillRect(58 + i * 4, -28 - i * 2, 3, 3); } c.globalAlpha = 1; }
};
void hairTop;
