// The train's cast, drawn (the prototype first pass, on Spooky Land's person drawer, costume.ts, so whoever's in the
// uniform shows: their skin, build and face, man or woman). Each seeded: no two the same. Each drawn hurt (eyes shut),
// knocked about (held, flung, dazed) and dead (limp, crossed-out eyes), so the engine's special deaths all play out on
// them right. Feet at the origin, facing right (the engine mirrors them).
//
//   porter     the railroad's maroon jacket with brass buttons, a pillbox cap, white gloves; a brown suitcase
//   brakeman   hickory-striped overalls, a striped cap, a red neckerchief; the brake club
//   robber     a duster coat, a wide-brimmed hat, a bandana up over the nose; the pistol (and, riding, his horse)
//   cook       a tall white toque, the white jacket and an apron (stained); the cleaver, the frying pan for up close
//   passenger  a lady in a bustle dress and a feathered hat with her parasol, or a gent in a frock coat and a top hat
//              or a bowler with his cane
//   fireman    soot to the eyebrows, an undershirt, suspenders, a cap; the coal shovel
//   steer      a longhorn (crude, as the wilds' animals are): the wide horns, patches by seed

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
const BOX: [number, number, number, number] = [-60, -130, 132, 134];
const ownFace = (g: Ctx, B: Body, F: Frame, skin: string, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk' | 'frown') => {
  headShape(g, B, skin);
  faceOn(g, B, { skin, eyes, mouth: mouth === 'frown' ? 'flat' : mouth, md: F.md, blink: F.blink });
};
/** Where the hands go for this pose (far, near), knocked about or not. */
const hands = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};

// ---------------------------------------------------------------------------------------------------------------
// The porter

const MAROON = ['#7F1D1D', '#6B2138', '#1E3A5F'];
const paintPorter = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, coat = pickOf(F.seed, 3, MAROON);
  legs(g, B, { col: '#1F2937', shoe: 'shoe', shoeCol: '#111111' });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = hands(B, F, up ? [-4, B.hy - 18] : [-B.w / 2 - 3, B.shY + 20], up ? [8, B.hy - 18] : sw ? [B.w / 2 + 18, B.shY + 8] : [B.w / 2 + 4, B.hipY + 2]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: coat, hand: '#F8FAFC' });
  torso(g, B, coat);
  for (let k = 0; k < 4; k++) px(g, 1, B.shY + 5 + k * 6, 2, 2, '#EAB308');
  px(g, -2, B.shY, 5, 4, '#F8FAFC');
  hairBack(g, B, L.hair, 12);
  ownFace(g, B, F, L.skin, up || sw ? 'angry' : 'tired', up ? 'teeth' : 'flat');
  whiskers(g, B); glasses(g, B);
  // (the pillbox cap: maroon, a gold band, PORTER in dots)
  partTop(g, () => g.roundRect(B.hx - 8, B.hy - 15, 17, 8, 1), coat, B.hx - 8, B.hy - 15, 17, 8, 1);
  px(g, B.hx - 8, B.hy - 9, 17, 2, '#EAB308'); for (let k = 0; k < 5; k++) px(g, B.hx - 5 + k * 3, B.hy - 13, 1, 2, '#FDE68A');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: coat, hand: '#F8FAFC' });
  // (the suitcase: in his near hand, up over his head for the throw, swung for the hit)
  if (!H.held) {
    const [sx, sy] = up ? [B.hx - 12, B.hy - 34] : sw ? [H.near[0] - 2, H.near[1] - 6] : [H.near[0] - 10, H.near[1] + 2];
    part(g, () => g.roundRect(sx, sy, 24, 17, 2), '#8A5A30', sx, sy, 24, 17, 1);
    px(g, sx + 10, sy - 3, 5, 3, INK); px(g, sx, sy + 7, 24, 2, '#D6A84E'); px(g, sx + 6, sy, 2, 17, '#5A3A1E'); px(g, sx + 16, sy, 2, 17, '#5A3A1E');
  }
};
export const drawPorter = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'swingWind'], ['swing']));
  putFrame(c, 'fr-porter', F, BOX, g => paintPorter(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The brakeman

const paintBrakeman = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, denim = pickOf(F.seed, 2, ['#3B5B8A', '#2F4B73', '#4A6A9A']);
  const stripes = (gg: Ctx, x: number, y: number, w: number, h: number) => { for (let k = x + 1; k < x + w; k += 3) px(gg, k, y, 1, h, lt(denim, 0.55)); };
  legs(g, B, { col: denim, shoe: 'boot', shoeCol: '#3F2A14', detail: (gg, hip, _k, ft) => stripes(gg, Math.min(hip[0], ft[0]) - 3, hip[1], 7, ft[1] - hip[1] - 6) });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = hands(B, F, [-B.w / 2 - 2, B.shY + 18], up ? [-B.w / 2 + 2, B.shY - 14] : sw ? [B.w / 2 + 16, B.shY + 12] : [B.w / 2 + 3, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(L.shirt, 0.2), hand: L.skin, len: 0.5 });
  torso(g, B, L.shirt);
  // (the overalls' bib and straps, hickory-striped)
  part(g, () => g.rect(-B.hipW / 2 + 2, B.shY + 10, B.hipW - 4, B.hipY - B.shY - 8), denim, -B.hipW / 2 + 2, B.shY + 10, B.hipW - 4, B.hipY - B.shY - 8, 1);
  stripes(g, -B.hipW / 2 + 3, B.shY + 11, B.hipW - 6, B.hipY - B.shY - 10);
  px(g, -B.w / 2 + 4, B.shY, 3, 12, denim); px(g, B.w / 2 - 7, B.shY, 3, 12, denim);
  px(g, -3, B.shY + 1, 8, 4, '#DC2626'); px(g, -1, B.shY + 4, 3, 5, '#B91C1C');
  hairBack(g, B, L.hair, 12);
  ownFace(g, B, F, L.skin, up || sw ? 'angry' : 'open', sw ? 'teeth' : 'flat');
  whiskers(g, B);
  // (the striped cap)
  partTop(g, () => { g.moveTo(B.hx - 9, B.hy - 6); g.quadraticCurveTo(B.hx, B.hy - 18, B.hx + 9, B.hy - 7); g.lineTo(B.hx + 16, B.hy - 5); g.lineTo(B.hx + 9, B.hy - 4); g.closePath(); }, denim, B.hx - 9, B.hy - 18, 25, 14, 1);
  for (let k = -7; k < 8; k += 3) px(g, B.hx + k, B.hy - 14 + Math.abs(k) * 0.3, 1, 8, lt(denim, 0.55));
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: dk(L.shirt, 0.2), hand: L.skin, len: 0.5 });
  // (the brake club: a hickory stick, back over the shoulder for the tell, swung out for the hit)
  if (!H.held) {
    const a = up ? -2.4 : sw ? 0.1 : -1.2;
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(a);
    part(g, () => g.roundRect(-2, -3, 34, 6, 3), '#9A6A3A', -2, -3, 34, 6, 1); px(g, 26, -3, 6, 6, '#6B4423');
    g.restore();
  }
};
export const drawBrakeman = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind'], ['swing']));
  putFrame(c, 'fr-brakeman', F, BOX, g => paintBrakeman(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The robber (and his horse)

const DUSTERS = ['#A88A5A', '#6B4F2A', '#2A2622', '#8A7A62'];
const BANDANAS = ['#B91C1C', '#1D4ED8', '#18181B', '#A16207'];
const paintRobber = (g: Ctx, F: Frame) => {
  const riding = F.v === 'ride';
  const B = bodyOf(F.seed, riding ? 'stand' : F.pose, F.fr), L = B.L, duster = pickOf(F.seed, 2, DUSTERS), band = pickOf(F.seed, 5, BANDANAS);
  const aim = F.pose === 'tell', sw = F.pose === 'strike';
  if (!riding) legs(g, B, { col: '#57534E', shoe: 'boot', shoeCol: '#3F2A14' });
  else {
    // (astride: the near leg forward and down the horse's flank, the boot in the stirrup)
    limb(g, 2, B.hipY + 2, 12, B.hipY + 12, B.legW, '#57534E'); limb(g, 12, B.hipY + 12, 10, B.hipY + 28, B.legW - 0.5, '#57534E');
    part(g, () => g.roundRect(6, B.hipY + 26, 11, 8, 2), '#3F2A14', 6, B.hipY + 26, 11, 8, 1);
  }
  const H = hands(B, F, [-B.w / 2 - 2, B.shY + 18], aim ? [B.w / 2 + 22, B.shY + 4] : sw ? [B.w / 2 + 14, B.shY + 2] : [B.w / 2 + 4, B.shY + 18]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: duster, hand: '#6B4423' });
  // (the duster: long, split at the back, flapping)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(-B.hipW / 2 - 6, riding ? B.hipY + 10 : -6); g.lineTo(B.hipW / 2 + 4, riding ? B.hipY + 10 : -8); g.lineTo(B.w / 2, B.shY + 2); g.closePath(); }, duster, -B.hipW / 2 - 6, B.shY + 2, B.hipW + 10, riding ? B.hipY - B.shY + 8 : -B.shY - 6, 1.2);
  torso(g, B, duster);
  px(g, -1, B.shY + 2, 3, B.hipY - B.shY - 4, dk(duster, 0.3));
  px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 3, '#3F2A14'); px(g, -2, B.hipY - 3, 4, 3, '#CA8A04');
  hairBack(g, B, L.hair, 16);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: aim ? 'angry' : 'smug', mouth: 'flat', md: F.md, blink: F.blink });
  // (the bandana up over his nose and mouth, its knot behind)
  if (F.md !== 'dead') part(g, () => { g.moveTo(B.hx - 9, B.hy + 1); g.lineTo(B.hx + 10, B.hy + 1); g.lineTo(B.hx + 8, B.hy + 9); g.lineTo(B.hx + 1, B.hy + 12); g.lineTo(B.hx - 8, B.hy + 8); g.closePath(); }, band, B.hx - 9, B.hy + 1, 19, 11, 1);
  px(g, B.hx - 11, B.hy + 2, 3, 5, band);
  // (the hat: a wide brim, a dented crown)
  partTop(g, () => { g.moveTo(B.hx - 7, B.hy - 8); g.quadraticCurveTo(B.hx - 6, B.hy - 22, B.hx + 1, B.hy - 18); g.quadraticCurveTo(B.hx + 8, B.hy - 22, B.hx + 9, B.hy - 8); g.closePath(); }, '#2A1A10', B.hx - 7, B.hy - 22, 16, 14, 1);
  part(g, () => g.ellipse(B.hx + 1, B.hy - 8, 17, 3.2, 0, 0, Math.PI * 2), '#3A2414', B.hx - 16, B.hy - 11, 34, 6, 1);
  px(g, B.hx - 7, B.hy - 11, 16, 2, '#A16207');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: duster, hand: '#6B4423' });
  // (the pistol: out level for the shot; reversed for the whip)
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(sw ? -0.9 : aim ? 0 : 0.7);
    part(g, () => g.rect(0, -3, 14, 4), '#52525B', 0, -3, 14, 4, 0.8); part(g, () => g.rect(-2, -1, 5, 8), '#6B4423', -2, -1, 5, 8, 0.8);
    g.restore();
  }
};
export const drawRobber = (c: Ctx, e: Enemy, f: number, seed: number) => {
  // (riding, or leaping off the horse onto the train: the train draws him, in the near lane in front of the cars:
  // passers.ts)
  if (e.health > 0 && (e.aiState === 'ride' || e.aiState === 'rideAim' || e.aiState === 'leap')) return;
  const F = frameFor(e, f, seed, poseOf(e, ['aim', 'whipWind'], ['whip']));
  putFrame(c, 'fr-robber', F, BOX, g => paintRobber(g, F));
};
/** A robber on foot, wherever the caller's put the origin (his feet): leaping off his horse onto the train. */
export const drawRobberAt = (c: Ctx, e: Enemy, f: number, seed: number) => {
  if ((e.facing ?? 1) < 0) c.scale(-1, 1);
  paintRobber(c, frameOf(seed, f, 'walk', (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok', 0));
};
/** A robber on his horse (world: feet at (x, feetY), facing): the horse galloping under him. `aim`: the pistol up. */
export const drawRider = (c: Ctx, e: Enemy, x: number, feetY: number, f: number, seed: number) => {
  const aim = e.aiState === 'rideAim';
  drawHorse(c, x, feetY + 50, e.facing ?? 1, f, seed);
  c.save(); c.translate(Math.round(x), Math.round(feetY + 14)); if ((e.facing ?? 1) < 0) c.scale(-1, 1);
  if ((e.hitFlash ?? 0) > 0) c.filter = 'brightness(2)';
  paintRobber(c, frameOf(seed, f, aim ? 'tell' : 'stand', (e.hitFlash ?? 0) > 0 ? 'hurt' : 'ok', 0, undefined, 'ride'));
  c.restore();
};
/** A horse galloping (world: hooves at (x, groundY)), a saddle on it. */
export const drawHorse = (c: Ctx, x: number, groundY: number, facing: number, f: number, seed: number) => {
  const coat = pickOf(seed, 3, ['#6B4423', '#2A1A10', '#A0703C', '#E7E5E4']), mane = coat === '#E7E5E4' ? '#A8A29E' : '#1C1209';
  c.save(); c.translate(Math.round(x), Math.round(groundY)); if (facing < 0) c.scale(-1, 1);
  const ph = f * 0.35, bob = Math.abs(Math.sin(ph)) * 3;
  c.translate(0, -bob);
  // (legs: a gallop, the far pair darker)
  for (const [lx, k, far] of [[-22, 0, true], [-16, 1.4, false], [18, 2.2, true], [24, 3.6, false]] as const) {
    const sw = Math.sin(ph + k) * 12;
    limb(c, lx, -40, lx + sw * 0.6, -18, 5, far ? dk(coat, 0.2) : coat); limb(c, lx + sw * 0.6, -18, lx + sw, -2, 4, far ? dk(coat, 0.2) : coat);
    px(c, lx + sw - 3, -3, 6, 3, INK);
  }
  // (the tail streaming back, the barrel of the body, the neck and head up, the mane)
  part(c, () => { c.moveTo(-30, -52); c.quadraticCurveTo(-48, -48 + Math.sin(ph) * 4, -50, -30); c.lineTo(-44, -32); c.quadraticCurveTo(-40, -44, -28, -46); c.closePath(); }, mane, -50, -52, 22, 22, 1);
  part(c, () => c.ellipse(0, -48, 32, 13, 0, 0, Math.PI * 2), coat, -32, -61, 64, 26, 1.2);
  part(c, () => { c.moveTo(20, -56); c.lineTo(34, -80); c.lineTo(44, -78); c.lineTo(34, -50); c.closePath(); }, coat, 20, -80, 24, 30, 1.2);
  part(c, () => g2(c), coat, 36, -90, 24, 16, 1.2);
  for (let k = 0; k < 4; k++) px(c, 26 + k * 3, -78 + k * 6, 4, 6, mane);
  px(c, 48, -84, 2, 2, INK); px(c, 56, -78, 2, 1, INK);
  // (the saddle and its blanket, the stirrup strap)
  part(c, () => c.roundRect(-14, -62, 26, 8, 3), '#5A2A1A', -14, -62, 26, 8, 1);
  px(c, -16, -56, 30, 4, pickOf(seed, 4, ['#B91C1C', '#1D4ED8', '#CA8A04']));
  c.restore();
};
const g2 = (c: Ctx) => { c.moveTo(36, -82); c.lineTo(46, -90); c.lineTo(58, -80); c.lineTo(60, -74); c.lineTo(48, -74); c.closePath(); };

// ---------------------------------------------------------------------------------------------------------------
// The cook

const paintCook = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  B.w += 4; B.hipW += 4;
  legs(g, B, { col: '#57534E', shoe: 'shoe', shoeCol: '#1C1917', stripe: '#78716C' });
  const st = F.v; // 'pan' or 'cleaver'
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = hands(B, F, [-B.w / 2 - 2, B.shY + 20], up ? [B.hx - 2, B.hy - 16] : sw ? [B.w / 2 + 18, B.shY + 10] : [B.w / 2 + 4, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#F5F5F4', hand: L.skin });
  torso(g, B, '#F5F5F4');
  for (let k = 0; k < 3; k++) { px(g, -4, B.shY + 5 + k * 6, 2, 2, '#A8A29E'); px(g, 4, B.shY + 5 + k * 6, 2, 2, '#A8A29E'); }
  // (the apron, stained: gravy, blood, something)
  part(g, () => g.rect(-B.hipW / 2 + 1, B.shY + 14, B.hipW - 2, B.hipY - B.shY + 10), '#E7E5E4', -B.hipW / 2 + 1, B.shY + 14, B.hipW - 2, B.hipY - B.shY + 10, 1);
  px(g, -3, B.shY + 22, 5, 4, '#92400E'); px(g, 4, B.hipY, 4, 3, '#991B1B'); px(g, -6, B.hipY + 6, 3, 3, '#65A30D');
  hairBack(g, B, L.hair, 10);
  ownFace(g, B, F, L.skin, 'angry', up || sw ? 'teeth' : 'frown');
  whiskers(g, B);
  // (the toque: tall, puffed at the top)
  partTop(g, () => { g.moveTo(B.hx - 8, B.hy - 7); g.lineTo(B.hx - 9, B.hy - 22); g.quadraticCurveTo(B.hx - 12, B.hy - 32, B.hx - 2, B.hy - 31); g.quadraticCurveTo(B.hx + 4, B.hy - 36, B.hx + 9, B.hy - 29); g.quadraticCurveTo(B.hx + 14, B.hy - 24, B.hx + 9, B.hy - 21); g.lineTo(B.hx + 9, B.hy - 7); g.closePath(); }, '#FAFAF9', B.hx - 12, B.hy - 36, 26, 29, 1);
  px(g, B.hx - 8, B.hy - 10, 17, 3, '#E7E5E4');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#F5F5F4', hand: L.skin });
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -2.2 : sw ? 0.2 : -0.6);
    if (st === 'pan') { part(g, () => g.rect(0, -2, 14, 4), '#3F3F46', 0, -2, 14, 4, 0.8); part(g, () => g.ellipse(22, 0, 10, 7, 0, 0, Math.PI * 2), '#27272A', 12, -7, 20, 14, 1); }
    else { part(g, () => g.rect(-1, -2, 8, 4), '#6B4423', -1, -2, 8, 4, 0.8); part(g, () => g.rect(6, -7, 13, 11), '#D4D4D8', 6, -7, 13, 11, 1); px(g, 6, -7, 13, 2, '#F4F4F5'); }
    g.restore();
  }
};
export const drawCook = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const pan = e.aiState === 'panWind' || e.aiState === 'pan';
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'panWind'], ['pan']), undefined, pan ? 'pan' : 'cleaver');
  putFrame(c, 'fr-cook', F, BOX, g => paintCook(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The passengers

const DRESSES = ['#6B21A8', '#166534', '#1E3A8A', '#9F1239', '#A16207'];
const paintPassenger = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, lady = L.woman;
  const cloth = pickOf(F.seed, 3, DRESSES);
  const up = F.pose === 'tell', jab = F.pose === 'strike';
  if (lady) {
    // (a long bustle dress to the floor: no legs showing, the toes of her boots)
    part(g, () => { g.moveTo(-B.hipW / 2, B.hipY - 2); g.lineTo(-B.hipW / 2 - 9, -1); g.lineTo(B.hipW / 2 + 6, -1); g.lineTo(B.hipW / 2, B.hipY - 2); g.closePath(); }, cloth, -B.hipW / 2 - 9, B.hipY - 2, B.hipW + 15, -B.hipY + 1, 1.2);
    part(g, () => g.ellipse(-B.hipW / 2 - 4, B.hipY + 6, 8, 10, 0, 0, Math.PI * 2), dk(cloth, 0.15), -B.hipW / 2 - 12, B.hipY - 4, 16, 20, 1);
    for (let k = -2; k <= 2; k++) px(g, k * 5, B.hipY + 8, 1, -B.hipY - 10, dk(cloth, 0.22));
    px(g, B.feet[1] + 2, -3, 6, 3, '#1C1917');
  } else legs(g, B, { col: '#3F3F46', shoe: 'shoe', shoeCol: '#0C0A09', stripe: '#52525B' });
  const H = hands(B, F, [-B.w / 2 - 2, B.shY + 18], up ? [-2, B.shY + 10] : jab ? [B.w / 2 + 22, B.shY + 14] : [B.w / 2 + 6, B.shY + 18]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: lady ? cloth : '#1C1917', hand: lady ? '#F5F5F4' : L.skin });
  torso(g, B, lady ? cloth : '#1C1917');
  if (lady) { for (let k = 0; k < 4; k++) px(g, 0, B.shY + 4 + k * 5, 2, 2, '#FDE68A'); px(g, -3, B.shY, 7, 3, '#F5F5F4'); }
  else { part(g, () => { g.moveTo(-3, B.shY); g.lineTo(0, B.shY + 12); g.lineTo(4, B.shY); g.closePath(); }, '#F5F5F4', -3, B.shY, 7, 12, 0.6); px(g, -1, B.shY + 1, 3, 2, '#7F1D1D'); px(g, -B.w / 2 + 3, B.shY + 14, 3, 1, '#CA8A04'); }
  hairBack(g, B, L.hair, lady ? 16 : 10);
  ownFace(g, B, F, L.skin, up || jab ? 'angry' : 'smug', jab ? 'o' : 'flat');
  if (!lady) whiskers(g, B);
  glasses(g, B);
  if (lady) {
    // (the feathered hat, tipped forward, a plume curling back)
    hairTop(g, B);
    part(g, () => g.ellipse(B.hx + 2, B.hy - 9, 13, 3.4, -0.1, 0, Math.PI * 2), dk(cloth, 0.1), B.hx - 11, B.hy - 13, 26, 7, 1);
    partTop(g, () => g.roundRect(B.hx - 5, B.hy - 17, 13, 8, 3), cloth, B.hx - 5, B.hy - 17, 13, 8, 1);
    part(g, () => { g.moveTo(B.hx - 3, B.hy - 15); g.quadraticCurveTo(B.hx - 16, B.hy - 30, B.hx - 22, B.hy - 18); g.quadraticCurveTo(B.hx - 12, B.hy - 22, B.hx - 1, B.hy - 13); g.closePath(); }, pickOf(F.seed, 6, ['#F8FAFC', '#F9A8D4', '#18181B']), B.hx - 22, B.hy - 30, 21, 17, 0.8);
  } else if (F.seed % 2) {
    // (a top hat)
    partTop(g, () => g.rect(B.hx - 7, B.hy - 26, 15, 17), '#18181B', B.hx - 7, B.hy - 26, 15, 17, 1);
    part(g, () => g.rect(B.hx - 11, B.hy - 11, 23, 3), '#18181B', B.hx - 11, B.hy - 11, 23, 3, 1); px(g, B.hx - 7, B.hy - 14, 15, 2, '#7F1D1D');
  } else {
    // (a bowler)
    partTop(g, () => g.ellipse(B.hx + 1, B.hy - 11, 9, 8, 0, Math.PI, 0), '#292524', B.hx - 8, B.hy - 19, 18, 9, 1);
    part(g, () => g.ellipse(B.hx + 1, B.hy - 10, 13, 2.4, 0, 0, Math.PI * 2), '#292524', B.hx - 12, B.hy - 13, 26, 5, 1);
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: lady ? cloth : '#1C1917', hand: lady ? '#F5F5F4' : L.skin });
  // (the parasol, furled, point first; or the cane, ferrule first)
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -0.5 : jab ? 0 : 1.1);
    if (lady) {
      part(g, () => { g.moveTo(-6, -4); g.lineTo(26, -1); g.lineTo(26, 1); g.lineTo(-6, 4); g.closePath(); }, pickOf(F.seed, 8, ['#FDF2F8', '#FEF3C7', '#E0E7FF']), -6, -4, 32, 8, 0.8);
      px(g, 26, -1, 8, 2, '#A8A29E'); part(g, () => g.arc(-8, 0, 3, Math.PI * 0.5, Math.PI * 1.5), '#6B4423', -11, -3, 4, 6, 0.8);
    } else {
      px(g, -4, -1, 34, 3, '#2A1A10'); px(g, 28, -1, 4, 3, '#D4D4D8'); part(g, () => g.arc(-5, -3, 4, Math.PI * 0.6, Math.PI * 1.9), '#CA8A04', -9, -7, 8, 8, 0.8);
    }
    g.restore();
  }
};
export const drawPassenger = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind'], ['jab']));
  putFrame(c, 'fr-passenger', F, BOX, g => paintPassenger(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The fireman

const paintFireman = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const soot = '#3F3F46';
  legs(g, B, { col: '#44403C', shoe: 'boot', shoeCol: '#1C1917' });
  const up = F.pose === 'tell', sw = F.pose === 'strike';
  const H = hands(B, F, up ? [-B.w / 2 - 10, B.shY + 16] : [-B.w / 2 + 2, B.shY + 22], up ? [-B.w / 2 - 2, B.shY + 4] : sw ? [B.w / 2 + 18, B.shY + 10] : [B.w / 2 + 6, B.shY + 22]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: soot, len: 0 });
  torso(g, B, '#A8A29E');
  // (the undershirt gone gray, sweat and soot; the suspenders)
  px(g, -B.w / 2 + 5, B.shY, 3, B.hipY - B.shY, '#7F1D1D'); px(g, B.w / 2 - 8, B.shY, 3, B.hipY - B.shY, '#7F1D1D');
  px(g, -4, B.shY + 10, 6, 5, '#78716C'); px(g, 3, B.shY + 18, 5, 4, '#57534E');
  hairBack(g, B, L.hair, 10);
  headShape(g, B, L.skin);
  // (soot to the eyebrows: the face dark but round the eyes, where the goggles were)
  px(g, B.hx - 9, B.hy - 2, 18, 11, 'rgba(39, 39, 42, 0.55)');
  faceOn(g, B, { skin: L.skin, eyes: up || sw ? 'angry' : 'tired', mouth: sw ? 'teeth' : 'flat', md: F.md, blink: F.blink });
  whiskers(g, B);
  partTop(g, () => { g.moveTo(B.hx - 9, B.hy - 6); g.quadraticCurveTo(B.hx, B.hy - 17, B.hx + 9, B.hy - 7); g.lineTo(B.hx + 15, B.hy - 5); g.lineTo(B.hx + 8, B.hy - 4); g.closePath(); }, '#292524', B.hx - 9, B.hy - 17, 24, 13, 1);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: soot, len: 0 });
  // (the coal shovel: back and heaped for the tell, swung for the hit)
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(up ? -2.8 : sw ? 0.15 : 1.2);
    px(g, -6, -1, 30, 3, '#6B4423');
    part(g, () => { g.moveTo(22, -7); g.lineTo(36, -6); g.lineTo(36, 6); g.lineTo(22, 7); g.closePath(); }, '#52525B', 22, -7, 14, 14, 1);
    if (up) for (let k = 0; k < 3; k++) ball(g, 27 + k * 3, -8 - (k % 2) * 2, 2.6, '#18181B', 0.6);
    g.restore();
  }
};
export const drawFireman = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'swingWind'], ['swing']));
  putFrame(c, 'fr-fireman', F, BOX, g => paintFireman(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The steer (a longhorn: crude, flat colors with a lit and shaded tone, inked)

const blob = (c: Ctx, path: () => void, col: string, lw = 1.2) => { c.beginPath(); path(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); };
export const drawSteer = (c: Ctx, e: Enemy, f: number) => {
  const md = moodOf(e), st = e.aiState, seed = Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0);
  const hide = pickOf(seed, 2, ['#8A4A22', '#A0703C', '#5A3A22', '#C8A070']), patch = pickOf(seed, 3, ['#F5F5F4', '#2A1A10', '#E7D8B8']);
  c.save();
  if (md === 'dead') { c.translate(0, -4); c.rotate(0.06); c.translate(0, 12); }
  const run = st === 'charge' && md !== 'dead', ph = f * (run ? 0.42 : 0.12);
  // (legs: stout; stiff and out when dead)
  for (const [lx, k] of [[-28, 0], [-20, 1.5], [22, 3], [30, 4.5]] as const) {
    const sw = run ? Math.sin(ph + k) * 9 : md === 'dead' ? 6 : 0;
    limb(c, lx, -28, lx + sw, md === 'dead' ? -6 : -3, 6, dk(hide, lx % 2 ? 0 : 0.15));
    px(c, lx + sw - 3, -4, 7, 4, INK);
  }
  // (the body, its patches, the tail)
  blob(c, () => c.ellipse(0, -36, 36, 15, 0, 0, Math.PI * 2), hide);
  c.save(); c.beginPath(); c.ellipse(0, -36, 36, 15, 0, 0, Math.PI * 2); c.clip();
  blob(c, () => c.ellipse(-10 + (seed % 3) * 6, -40, 12, 8, 0.3, 0, Math.PI * 2), patch, 0);
  blob(c, () => c.ellipse(16, -30, 8, 6, -0.2, 0, Math.PI * 2), patch, 0);
  px(c, -30, -48, 50, 3, lt(hide, 0.25));
  c.restore();
  limb(c, -34, -42, -40, -24 + Math.sin(f * 0.1) * 2, 2, dk(hide, 0.2)); px(c, -43, -24, 5, 6, INK);
  // (the head, low for the charge; the longhorns out wide either side: pointy)
  const hy = st === 'charge' || st === 'paw' ? -30 : -42;
  c.save(); c.translate(36, hy); c.rotate(st === 'charge' ? 0.35 : 0);
  blob(c, () => c.ellipse(4, 0, 11, 9, 0.2, 0, Math.PI * 2), hide);
  blob(c, () => c.ellipse(12, 5, 6, 5, 0, 0, Math.PI * 2), '#D6A8A0');
  px(c, 13, 4, 2, 2, INK); px(c, 16, 5, 2, 2, INK);
  // (the horns)
  c.strokeStyle = INK; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-2, -6); c.quadraticCurveTo(-18, -12, -26, -24); c.moveTo(4, -7); c.quadraticCurveTo(22, -14, 30, -26); c.stroke();
  c.strokeStyle = '#F5EBD8'; c.lineWidth = 3; c.stroke();
  // (an eye: shut hurt, crossed out dead, angry otherwise)
  if (md === 'dead') { c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(1, -4); c.lineTo(5, 0); c.moveTo(1, 0); c.lineTo(5, -4); c.stroke(); c.strokeStyle = '#E86A7A'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(12, 9); c.quadraticCurveTo(14, 14, 12, 18); c.stroke(); }
  else if (md === 'hurt') { c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(1, -3); c.lineTo(5, -2); c.stroke(); }
  else { px(c, 2, -4, 3, 3, INK); if (st === 'paw' || st === 'charge') { c.strokeStyle = INK; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, -7); c.lineTo(6, -5); c.stroke(); } }
  c.restore();
  // (the snort: steam out of the nose, pawing)
  if (st === 'paw' && f % 20 < 10) { c.globalAlpha = 0.6; blob(c, () => c.ellipse(58, hy + 6, 5, 3, 0, 0, Math.PI * 2), '#F1F5F9', 0); c.globalAlpha = 1; }
  c.restore();
};
void hairTop;
