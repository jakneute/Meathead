// The town square's cast, drawn (a first pass: crude but readable, on Spooky Land's person drawer, costume.ts, so
// whoever's in the costume shows: their skin, build and face, man or woman; the princess and the knight on anybody).
// Each seeded: no two the same. Each drawn hurt (eyes shut), knocked about (held, flung, dazed) and dead (limp,
// crossed-out eyes), so the engine's special deaths all play out on their real sprites; and dead, the costume gives
// (the clerk's hat off beside him, the knight's helmet off, the princess's tiara and wig askew, the troll's and the
// dragon's big heads come off: the sweaty performer underneath). Feet at the origin, facing right (the engine
// mirrors them). The people's frames painted once into a stamp; the big mascots and the owl drawn as they go.
//
//   clerk     a black robe with its house's trim (four parody houses' colors), a striped scarf, a pointy hat on some;
//             the wand (its tip sparkling in the tell)
//   princess  a bell-skirted gown (blue, yellow, pink, teal), puffed sleeves, a long wig (on the men too: their own
//             beards and mustaches under it), a tiara; a glass slipper (wound up over the head: the tell)
//   knight    gray foam plate, a tabard in a heraldic color with its stripe, a helmet with the visor up (the face), a
//             plume; the striped foam lance (upright; lowered and couched out front in the tell and the charge)
//   bro       a team jersey with its number, a backwards cap, face paint, a foam finger; a broomball (the tell)
//   troll     a huge green foam suit, a belly, mitts, a horned helmet (the horns are the dive kick's undoing), the foam
//             club (up over the head: the tell); the performer's face in the costume's mouth
//   dragon    a big plush dragon suit (green, purple, red), felt wings, a tail, a snout with nostrils, the
//             performer's face in its mouth; rearing back with smoke (the tell), the mouth wide for the flame
//   owl       a barn owl with a letter in its talons; wings up for the hoot (the tell)
//   keg       BUTTER BREW's keg: a barrel on its side, the brass tap, the $14 tag

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
  moodOf, reaction,
} from '../../spooky/costume';
import { lookOf } from '../../adventure/temple/people';

type Ctx = CanvasRenderingContext2D;

const moving = (e: Enemy, min = 0.3): Pose => (Math.abs(e.vel.x) > min ? 'walk' : 'stand');
const poseOf = (e: Enemy, tells: string[], strikes: string[]): Pose =>
  tells.includes(e.aiState ?? '') ? 'tell' : strikes.includes(e.aiState ?? '') ? 'strike' : moving(e);
const frameFor = (e: Enemy, f: number, seed: number, pose: Pose, v = '') => {
  const r = reaction(e);
  return frameOf(seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, undefined, v);
};
const BOX: [number, number, number, number] = [-80, -150, 170, 154];
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
// The wand clerk

const HOUSES: [string, string][] = [['#9B1C1C', '#E0AE3A'], ['#166534', '#C8CCD4'], ['#1E3A8A', '#B07A4A'], ['#CA8A04', '#18181B']];
const wand = (g: Ctx, x: number, y: number, a: number, lit: boolean) => {
  g.save(); g.translate(x, y); g.rotate(a);
  px(g, -1, -1, 18, 4, INK); px(g, 0, 0, 16, 2, '#5A3A1E'); px(g, 0, 0, 5, 2, '#3A2410');
  if (lit) { ball(g, 18, 1, 3, '#FDE047', 0.6); px(g, 17, 0, 2, 2, '#FFFFFF'); }
  g.restore();
};
const paintClerk = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, [robe, trim] = HOUSES[F.seed % 4];
  const robeCol = '#22202A';
  legs(g, B, { col: '#3A3440', shoe: 'shoe', shoeCol: '#18181B' });
  const cast = F.pose === 'tell', poke = F.pose === 'strike';
  const H = handsAt(B, F, [-B.w / 2 - 5, B.shY + 14], cast ? [B.hx + 10, B.hy - 22] : poke ? [B.w / 2 + 18, B.shY + 10] : [B.w / 2 + 6, B.shY + 18]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: robeCol, hand: L.skin });
  // (the robe: shoulders to the shins, flaring; its trim down the front)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(B.w / 2, B.shY + 2); g.lineTo(B.w / 2 + 6, -12); g.lineTo(-B.w / 2 - 6, -12); g.closePath(); }, robeCol, -B.w / 2 - 6, B.shY + 2, B.w + 12, -12 - B.shY);
  px(g, -1, B.shY + 4, 3, -16 - B.shY, trim);
  // (the scarf, striped in the house's colors, an end hanging)
  for (let k = 0; k < 4; k++) px(g, -B.w / 2 + 3 + k * 5, B.shY - 1, 5, 5, k % 2 ? trim : robe);
  for (let k = 0; k < 4; k++) px(g, B.w / 2 - 8, B.shY + 4 + k * 4, 5, 4, k % 2 ? trim : robe);
  hairBack(g, B);
  face(g, B, F, cast ? 'wide' : 'smug', cast ? 'o' : poke ? 'teeth' : 'smirk');
  whiskers(g, B); glasses(g, B);
  const hat = (F.seed >> 2) % 3 !== 0;
  if (dead(F)) {
    // (dead: the hat's come off, lying by him)
    if (hat) partTop(g, () => { g.moveTo(B.hx + 16, -2); g.lineTo(B.hx + 34, -2); g.lineTo(B.hx + 40, -18); g.closePath(); }, '#2A2440', B.hx + 16, -18, 24, 16, 1);
    hairTop(g, B);
  } else if (hat) {
    partTop(g, () => { g.moveTo(B.hx - 11, B.hy - 7); g.lineTo(B.hx + 13, B.hy - 7); g.lineTo(B.hx + 6, B.hy - 34); g.lineTo(B.hx - 4, B.hy - 26); g.closePath(); }, '#2A2440', B.hx - 11, B.hy - 34, 24, 27, 1);
    px(g, B.hx - 11, B.hy - 9, 24, 3, trim);
  } else hairTop(g, B);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: robeCol, hand: L.skin });
  if (!H.held) wand(g, H.near[0], H.near[1], cast ? -1.3 : poke ? 0 : -0.5, cast);
};
export const drawClerk = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['cast', 'pokeWind'], ['poke', 'after']));
  putFrame(c, 'fa-clerk', F, BOX, g => paintClerk(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The princess (on anybody)

const GOWNS = ['#3B82F6', '#FACC15', '#F472B6', '#2DD4BF', '#A78BFA'];
const WIGS = ['#1A1A1A', '#F2D58A', '#C2501E', '#6A3A1A'];
const slipper = (g: Ctx, x: number, y: number) => { part(g, () => { g.moveTo(x - 6, y); g.lineTo(x + 7, y); g.lineTo(x + 8, y - 4); g.lineTo(x - 2, y - 5); g.closePath(); }, '#CFF4FF', x - 6, y - 5, 14, 5, 0.8); px(g, x - 4, y - 4, 2, 1, '#FFFFFF'); };
const paintPrincess = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, gown = pickOf(F.seed, 3, GOWNS), wig = pickOf(F.seed, 5, WIGS);
  const wind = F.pose === 'tell', slap = F.pose === 'strike';
  // (the skirt: a bell to the floor (the feet peeking), hoops in it)
  legs(g, B, { col: L.skin, shoe: 'pointy', shoeCol: '#CFF4FF' });
  part(g, () => { g.moveTo(-B.hipW / 2 - 2, B.hipY - 4); g.lineTo(B.hipW / 2 + 2, B.hipY - 4); g.quadraticCurveTo(B.hipW / 2 + 16, -8, B.hipW / 2 + 18, -3); g.lineTo(-B.hipW / 2 - 18, -3); g.quadraticCurveTo(-B.hipW / 2 - 16, -8, -B.hipW / 2 - 2, B.hipY - 4); g.closePath(); }, gown, -B.hipW / 2 - 18, B.hipY - 4, B.hipW + 36, -B.hipY + 1);
  for (const y of [-18, -10]) px(g, -B.hipW / 2 - 12, y, B.hipW + 24, 1, lt(gown, 0.35));
  const H = handsAt(B, F, [-B.w / 2 - 6, B.shY + 16], wind ? [B.hx - 2, B.hy - 22] : slap ? [B.w / 2 + 18, B.shY + 6] : [B.w / 2 + 6, B.shY + 18]);
  hairBack(g, { ...B, L: { ...L, long: true, woman: true, bald: false } }, wig, 26);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: L.skin });
  torso(g, B, gown);
  // (puffed sleeves, the neckline)
  for (const s of [-1, 1]) ball(g, s * (B.w / 2 - 2), B.shY + 3, 5, lt(gown, 0.25), 1);
  px(g, -6, B.shY, 12, 3, L.skin);
  face(g, B, F, slap ? 'angry' : 'open', wind ? 'teeth' : slap ? 'teeth' : 'smile');
  whiskers(g, B);
  // (the wig's top; the tiara (dead: knocked crooked off the wig))
  hairTop(g, { ...B, L: { ...L, bald: false } }, wig);
  if (dead(F)) { g.save(); g.translate(B.hx + 10, B.hy - 12); g.rotate(0.6); px(g, -6, 0, 12, 3, '#E0AE3A'); px(g, -2, -4, 4, 4, '#E0AE3A'); px(g, -1, -3, 2, 2, '#F472B6'); g.restore(); }
  else { px(g, B.hx - 7, B.hy - 13, 15, 3, INK); px(g, B.hx - 6, B.hy - 12, 13, 2, '#F6D365'); for (const k of [-5, 0, 5]) px(g, B.hx + k - 1, B.hy - 16, 3, 4, '#F6D365'); px(g, B.hx - 1, B.hy - 15, 2, 2, '#60A5FA'); }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: L.skin });
  if (wind && !H.held) slipper(g, H.near[0], H.near[1] - 3);
};
export const drawPrincess = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'twirl'], ['slap', 'after']));
  putFrame(c, 'fa-princess', F, BOX, g => paintPrincess(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The knight (foam plate; the lance pointy out front)

const TABARDS: [string, string][] = [['#1E40AF', '#F6D365'], ['#B91C1C', '#F8FAFC'], ['#166534', '#F6D365'], ['#7C3AED', '#F8FAFC']];
const PLATE = '#A8AEB8';
const paintKnight = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), [tab, stripe] = TABARDS[(F.seed >> 1) % 4];
  const couched = F.v === 'couch';
  legs(g, B, { col: PLATE, shoe: 'boot', shoeCol: '#6A707A' });
  const H = handsAt(B, F, [-B.w / 2 - 4, B.shY + 16], couched ? [B.w / 2 + 6, B.shY + 14] : [B.w / 2 + 8, B.shY + 12]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: PLATE, hand: '#6A707A' });
  // (the lance, behind the near arm: upright, or couched and pointing out front)
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(couched ? 0 : -1.35);
    part(g, () => { g.moveTo(-14, -3); g.lineTo(52, -1.5); g.lineTo(62, 0); g.lineTo(52, 1.5); g.lineTo(-14, 3); g.closePath(); }, '#F2EEE6', -14, -3, 76, 6, 1);
    for (let k = -6; k < 50; k += 10) px(g, k, -2, 4, 4, '#C81E3A');
    part(g, () => { g.moveTo(-2, -7); g.lineTo(6, -7); g.lineTo(8, 7); g.lineTo(-4, 7); g.closePath(); }, '#8A8F98', -4, -7, 12, 14, 1);
    g.restore();
  }
  torso(g, B, PLATE);
  // (the tabard over the plate, its stripe)
  part(g, () => g.rect(-B.w / 2 + 3, B.shY + 2, B.w - 6, B.hipY - B.shY + 10), tab, -B.w / 2 + 3, B.shY + 2, B.w - 6, B.hipY - B.shY + 10, 1);
  px(g, -2, B.shY + 2, 4, B.hipY - B.shY + 10, stripe);
  face(g, B, F, couched ? 'angry' : 'open', couched ? 'teeth' : 'flat');
  whiskers(g, B);
  if (dead(F)) {
    // (dead: the helmet's off, rolled away; their own hair)
    hairTop(g, B);
    partTop(g, () => g.ellipse(B.hx + 26, -9, 10, 9, 0.4, 0, Math.PI * 2), PLATE, B.hx + 16, -18, 20, 18, 1);
  } else {
    // (the helmet round the face, the visor up, the plume)
    part(g, () => { g.moveTo(B.hx - 11, B.hy + 9); g.lineTo(B.hx - 11, B.hy - 6); g.quadraticCurveTo(B.hx, B.hy - 16, B.hx + 11, B.hy - 6); g.lineTo(B.hx + 11, B.hy - 3); g.lineTo(B.hx - 3, B.hy - 3); g.lineTo(B.hx - 3, B.hy + 9); g.closePath(); }, PLATE, B.hx - 11, B.hy - 16, 22, 25, 1);
    px(g, B.hx - 2, B.hy - 12, 13, 3, '#6A707A');
    part(g, () => { g.moveTo(B.hx - 4, B.hy - 13); g.quadraticCurveTo(B.hx - 16, B.hy - 26, B.hx - 22, B.hy - 12); g.quadraticCurveTo(B.hx - 12, B.hy - 18, B.hx - 2, B.hy - 11); g.closePath(); }, stripe === '#F8FAFC' ? '#C81E3A' : stripe, B.hx - 22, B.hy - 26, 20, 15, 1);
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: PLATE, hand: '#6A707A' });
};
export const drawKnight = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const couch = e.aiState === 'lower' || e.aiState === 'charge';
  const F = frameFor(e, f, seed, e.aiState === 'charge' ? 'walk' : poseOf(e, ['lower'], ['winded']), couch ? 'couch' : '');
  putFrame(c, 'fa-knight', F, BOX, g => paintKnight(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The broomball bro

const JERSEYS: [string, string][] = [['#DC2626', '#F8FAFC'], ['#1D4ED8', '#FACC15'], ['#15803D', '#F8FAFC'], ['#7E22CE', '#FACC15'], ['#EA580C', '#18181B']];
const paintBro = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, [jer, num] = JERSEYS[(F.seed >> 2) % 5];
  const wind = F.pose === 'tell', bump = F.pose === 'strike';
  legs(g, B, { col: '#3F3F46', shoe: 'sneaker', shoeCol: '#F4F4F5', bareBelow: true });
  const H = handsAt(B, F, wind ? [-B.w / 2 - 14, B.shY + 2] : [-B.w / 2 - 8, B.shY - 10], wind ? [-B.w / 2 - 2, B.shY - 8] : bump ? [B.w / 2 + 4, B.shY + 4] : [B.w / 2 + 6, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: L.skin });
  // (the foam finger up on the far hand)
  if (!H.held) { part(g, () => g.roundRect(H.far[0] - 5, H.far[1] - 22, 10, 22, 3), num === '#18181B' ? '#FACC15' : num, H.far[0] - 5, H.far[1] - 22, 10, 22, 1); part(g, () => g.roundRect(H.far[0] - 2, H.far[1] - 34, 5, 14, 2), num === '#18181B' ? '#FACC15' : num, H.far[0] - 2, H.far[1] - 34, 5, 14, 1); }
  torso(g, B, jer, B.shY, B.hipY + 2, bump ? 4 : 0);
  // (the number, crude)
  px(g, -4, B.shY + 8, 3, 10, num); px(g, 2, B.shY + 8, 3, 10, num); px(g, -4, B.shY + 8, 9, 2, num);
  face(g, B, F, bump ? 'angry' : 'open', wind || bump ? 'teeth' : 'grin');
  // (face paint: two stripes on the cheek)
  px(g, B.hx + 1, B.hy + 1, 5, 1, jer); px(g, B.hx + 1, B.hy + 3, 5, 1, num === '#18181B' ? '#FACC15' : num);
  whiskers(g, B); glasses(g, B);
  // (the cap on backwards (off when dead), its peak out behind)
  if (dead(F)) { hairTop(g, B); partTop(g, () => g.ellipse(B.hx - 24, -6, 9, 5, 0, Math.PI, 0), jer, B.hx - 33, -11, 18, 6, 1); }
  else { partTop(g, () => g.ellipse(B.hx, B.hy - 7, 10, 7, 0, Math.PI, 0), jer, B.hx - 10, B.hy - 14, 20, 8, 1); px(g, B.hx - 16, B.hy - 9, 8, 3, dk(jer, 0.3)); }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: L.skin });
  if (wind && !H.held) ball(g, H.far[0] - 4, H.far[1] - 4, 5, '#F97316', 1);
};
export const drawBro = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'bumpWind'], ['bump', 'after']));
  putFrame(c, 'fa-bro', F, BOX, g => paintBro(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The big mascots: drawn as they go (crude), their performers' faces in the costumes' mouths

const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const oval = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, rx + 1.5, ry + 1.5, rot, 0, Math.PI * 2); c.fill();
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); c.fill();
  c.fillStyle = lt(col, 0.25); c.beginPath(); c.ellipse(x - rx * 0.35, y - ry * 0.35, Math.max(0.5, rx * 0.4), Math.max(0.5, ry * 0.3), rot, 0, Math.PI * 2); c.fill();
};
const stub = (c: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, col: string) => {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
};
/** A performer's face, small, sweaty, in a hole (`open`: the mouth hole). */
const performer = (c: Ctx, e: Enemy, x: number, y: number, r: number, hurt: boolean, isDead: boolean) => {
  const L = lookOf(Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31);
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, r + 2, r * 0.8 + 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = L.skin; c.beginPath(); c.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); c.fill();
  if (isDead) { box(c, x - 5, y - 3, 3, 1, INK); box(c, x - 4, y - 4, 1, 3, INK); box(c, x + 2, y - 3, 3, 1, INK); box(c, x + 3, y - 4, 1, 3, INK); }
  else if (hurt) { box(c, x - 5, y - 3, 3, 1, INK); box(c, x + 2, y - 3, 3, 1, INK); }
  else { box(c, x - 4, y - 4, 2, 3, INK); box(c, x + 3, y - 4, 2, 3, INK); }
  box(c, x - 2, y + 2, 5, 2, INK);
  box(c, x + r - 3, y - r * 0.4, 2, 3, '#BFE8FF');
};

export const drawTroll = (c: Ctx, e: Enemy, f: number) => {
  const r = reaction(e), md = r?.md ?? moodOf(e), isDead = md === 'dead';
  const pose = r?.pose ?? (e.aiState === 'raise' ? 'tell' : e.aiState === 'winded' ? 'strike' : moving(e));
  const FOAM = '#5E9A3A', DARK = '#3E6A24', isFlat = pose === 'limp' || (isDead && !r);
  c.save();
  if (isFlat) { c.translate(0, -2); c.rotate(-Math.PI / 2 + 0.05); c.translate(-30, -10); }
  else if (pose === 'thrown') c.rotate(Math.sin(f * 0.6) * 0.3);
  const walk = pose === 'walk' ? Math.sin(f * 0.25) * 5 : 0;
  // (the legs: short, stumpy, foam feet)
  stub(c, -14, -30, -16 - walk, -6, 16, DARK); stub(c, 14, -30, 16 + walk, -6, 16, FOAM);
  oval(c, -14 - walk, -5, 12, 6, '#4A3A24'); oval(c, 18 + walk, -5, 12, 6, '#4A3A24');
  // (the far arm, long, a mitt; the club in the near hand)
  const raise = pose === 'tell', after = pose === 'strike';
  stub(c, -24, -78, -36, raise ? -110 : -40, 14, DARK); oval(c, -36, raise ? -112 : -38, 9, 9, DARK);
  // (the body: a belly like a beanbag, a loincloth)
  oval(c, 0, -60, 34, 36, FOAM);
  oval(c, 6, -46, 22, 18, lt(FOAM, 0.15));
  box(c, -26, -34, 52, 10, INK); box(c, -25, -33, 50, 8, '#7A5A34');
  for (let k = -22; k < 24; k += 8) box(c, k, -27, 4, 4, '#5A3E20');
  // (the costume's head, its mouth hole, the performer in it; dead: the head's come off, lying at his feet, and
  // there's the performer's own head, small, on the big body)
  if (isDead) {
    oval(c, 48, -18, 22, 18, FOAM, 0.4);
    box(c, 40, -24, 16, 8, INK);
    performer(c, e, 2, -100, 9, true, true);
  } else {
    oval(c, 4, -96, 26, 22, FOAM);
    box(c, 8, -108, 7, 4, INK); box(c, 20, -108, 6, 4, INK); box(c, 10, -107, 2, 2, '#FDE047'); box(c, 21, -107, 2, 2, '#FDE047');
    box(c, -2, -96, 30, 16, INK);
    performer(c, e, 13, -88, 8, md === 'hurt', false);
    for (let k = 0; k < 4; k++) box(c, k * 7, -97, 4, 5, '#F5F0DC');
    // (the horned helmet: iron, the horns up (spiky))
    oval(c, 4, -114, 22, 10, '#8A8F98');
    for (const s of [-1, 1]) { c.fillStyle = INK; c.beginPath(); c.moveTo(4 + s * 16, -118); c.lineTo(4 + s * 30, -140); c.lineTo(4 + s * 10, -120); c.closePath(); c.fill(); c.fillStyle = '#F2EAD0'; c.beginPath(); c.moveTo(4 + s * 16, -119); c.lineTo(4 + s * 28, -137); c.lineTo(4 + s * 11, -121); c.closePath(); c.fill(); }
  }
  // (the near arm and the club: up over his head (the tell), down in front (after the slam), else carried)
  const cx = raise ? 6 : after ? 54 : 36, cy = raise ? -128 : after ? -14 : -50, ca = raise ? -1.9 : after ? 0.1 : -0.6;
  stub(c, 24, -78, cx, cy, 15, FOAM); oval(c, cx, cy, 10, 10, FOAM);
  if (!r || !isDead) {
    c.save(); c.translate(cx, cy); c.rotate(ca);
    c.fillStyle = INK; c.beginPath(); c.moveTo(-4, -6); c.lineTo(58, -14); c.quadraticCurveTo(70, 0, 58, 14); c.lineTo(-4, 6); c.closePath(); c.fill();
    c.fillStyle = '#8A5A30'; c.beginPath(); c.moveTo(-3, -4); c.lineTo(57, -12); c.quadraticCurveTo(67, 0, 57, 12); c.lineTo(-3, 4); c.closePath(); c.fill();
    box(c, 20, -4, 30, 2, '#B07A48');
    c.restore();
  }
  c.restore();
};

export const drawDragon = (c: Ctx, e: Enemy, f: number) => {
  const r = reaction(e), md = r?.md ?? moodOf(e), isDead = md === 'dead';
  const pose = r?.pose ?? moving(e);
  const seed = Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
  const SUIT = ['#4CA84A', '#8A4ACF', '#D0402E'][seed % 3], BELLY = '#F2D98A';
  const isFlat = pose === 'limp' || (isDead && !r);
  c.save();
  if (isFlat) { c.rotate(-Math.PI / 2 + 0.05); c.translate(-28, -12); }
  else if (pose === 'thrown') c.rotate(Math.sin(f * 0.6) * 0.3);
  const rear = e.aiState === 'rear', breathe = e.aiState === 'breathe';
  const walk = pose === 'walk' ? Math.sin(f * 0.22) * 5 : 0;
  // (the tail, out behind, its spikes)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-18, -34); c.quadraticCurveTo(-56, -30, -60, -8); c.lineTo(-50, -10); c.quadraticCurveTo(-46, -24, -16, -22); c.closePath(); c.fill();
  c.fillStyle = SUIT; c.beginPath(); c.moveTo(-18, -33); c.quadraticCurveTo(-54, -29, -58, -9); c.lineTo(-51, -11); c.quadraticCurveTo(-46, -25, -16, -23); c.closePath(); c.fill();
  // (the legs)
  stub(c, -10, -28, -12 - walk, -6, 15, dk(SUIT, 0.2)); stub(c, 12, -28, 14 + walk, -6, 15, SUIT);
  oval(c, -10 - walk, -5, 11, 5, dk(SUIT, 0.3)); oval(c, 17 + walk, -5, 11, 5, dk(SUIT, 0.3));
  // (the body, the belly plates, the felt wings)
  c.save(); if (rear) { c.translate(0, -40); c.rotate(-0.18); c.translate(0, 40); }
  for (const s of [-1, 1]) { c.fillStyle = INK; c.beginPath(); c.moveTo(-8, -70); c.lineTo(-30 - s * 4, -100 - (f % 30 < 15 ? 4 : 0)); c.lineTo(-38, -70); c.closePath(); c.fill(); }
  c.fillStyle = '#6A2E8A'; c.beginPath(); c.moveTo(-9, -70); c.lineTo(-30, -98); c.lineTo(-36, -71); c.closePath(); c.fill();
  oval(c, 0, -54, 28, 30, SUIT);
  oval(c, 8, -50, 15, 22, BELLY);
  for (let k = 0; k < 4; k++) box(c, -2, -66 + k * 9, 20, 1, dk(BELLY, 0.3));
  // (the head: on a neck up front; dead: off, rolled on the ground, the performer's own head on the body)
  if (isDead) {
    oval(c, 46, -14, 20, 14, SUIT, 0.3);
    box(c, 38, -20, 14, 8, INK);
    performer(c, e, 6, -86, 9, true, true);
  } else {
    const hx = rear ? 4 : 18, hy = rear ? -98 : -86;
    stub(c, 4, -74, hx, hy + 6, 16, SUIT);
    oval(c, hx + 4, hy, 22, 17, SUIT);
    // (the snout out front, the nostrils, the eyes up top, little horns)
    oval(c, hx + 24, hy + 4, 14, 10, SUIT);
    box(c, hx + 32, hy - 1, 3, 2, INK); box(c, hx + 36, hy, 2, 2, INK);
    oval(c, hx + 6, hy - 12, 5, 5, '#FFFFFF'); box(c, hx + 7, hy - 13, 3, 4, INK);
    for (const k of [-6, 4]) { c.fillStyle = BELLY; c.beginPath(); c.moveTo(hx + k, hy - 15); c.lineTo(hx + k - 3, hy - 26); c.lineTo(hx + k + 4, hy - 16); c.closePath(); c.fill(); }
    // (the mouth: open wide for the flame, the performer's face in it)
    const open = breathe ? 12 : rear ? 9 : 7;
    box(c, hx + 4, hy + 2, 26, open + 2, INK);
    performer(c, e, hx + 15, hy + 6 + open / 2, 6.5, md === 'hurt', false);
    for (let k = 0; k < 4; k++) box(c, hx + 6 + k * 6, hy + 2, 3, 3, '#FFFFFF');
  }
  c.restore();
  // (the arms: little, in front)
  stub(c, 14, -66, 28, rear ? -76 : -52, 10, SUIT); oval(c, 28, rear ? -77 : -51, 6, 6, SUIT);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The mail owl, and the keg

export const drawOwl = (c: Ctx, e: Enemy, f: number) => {
  const isDead = e.health <= 0 || !e.id;
  c.save();
  if (isDead) { c.rotate(Math.PI); c.translate(0, 18); }
  const hoot = e.aiState === 'hoot', flap = hoot ? -1 : Math.floor(f / 4) % 2;
  // (the wings: up for the hoot, beating otherwise)
  for (const s of [-1, 1]) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(-2, -16); c.lineTo(s * 22 - 2, flap < 0 ? -34 : flap ? -26 : -8); c.lineTo(s * 8 - 2, -6); c.closePath(); c.fill();
    c.fillStyle = s < 0 ? '#9A6A3A' : '#B8844A'; c.beginPath(); c.moveTo(-2, -15); c.lineTo(s * 20 - 2, flap < 0 ? -32 : flap ? -25 : -9); c.lineTo(s * 8 - 2, -7); c.closePath(); c.fill();
  }
  oval(c, 0, -13, 11, 12, '#C8A070');
  // (the heart-shaped face, the eyes, the beak)
  oval(c, 4, -18, 8, 7, '#F5EEDC');
  if (isDead) { box(c, 0, -20, 3, 1, INK); box(c, 1, -21, 1, 3, INK); box(c, 6, -20, 3, 1, INK); box(c, 7, -21, 1, 3, INK); }
  else { box(c, 0, -21, 3, 3, INK); box(c, 6, -21, 3, 3, INK); }
  box(c, 4, -17, 2, 3, '#E0AE3A');
  // (the letter in its talons, a red wax seal)
  box(c, -4, -3, 14, 9, INK); box(c, -3, -2, 12, 7, '#F5F0DC'); box(c, 2, 0, 3, 3, '#B91C1C');
  c.restore();
};

export const drawKeg = (c: Ctx, e: Enemy) => {
  if (e.health <= 0 || !e.id) return;
  // (on its side: staves, hoops, the brass tap, the tag)
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, -17, 18, 17, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#9A6A3A'; c.beginPath(); c.ellipse(0, -17, 16.5, 15.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#B8844A'; c.fillRect(-14, -28, 8, 22);
  for (const x of [-8, 8]) { c.fillStyle = '#5A5A62'; c.fillRect(x - 1, -32, 3, 30); }
  c.fillStyle = '#E0AE3A'; c.fillRect(14, -18, 8, 4); c.fillRect(19, -18, 3, 8);
  c.fillStyle = '#F5F0DC'; c.fillRect(-6, -24, 12, 7); c.fillStyle = '#9B1C1C'; c.fillRect(-4, -22, 8, 1); c.fillRect(-4, -20, 6, 1);
};
