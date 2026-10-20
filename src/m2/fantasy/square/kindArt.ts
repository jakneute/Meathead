// The town square's cast, drawn (the SNES pass: Spooky Land's person drawer, costume.ts, every material in its steps,
// dithered between, inked; so whoever's in the costume shows: their skin, build and face, man or woman; the princess
// and the knight on anybody). Each seeded: no two the same. Each drawn hurt (eyes shut), knocked about (held, flung,
// dazed) and dead (limp, crossed-out eyes), so the engine's special deaths all play out on their real sprites; and dead,
// the costume gives (the clerk's hat off beside him, the knight's helmet off, the princess's tiara knocked crooked, the
// bro's cap off, the troll's and the dragon's big heads off: the sweaty performer underneath, the zip down the back
// showing). Feet at the origin, facing right (the engine mirrors them). Every frame's painted once into a stamp.
//
//   clerk     a black robe with its house's trim and crest, folds down it, a striped scarf, a pointy hat with its band
//             and buckle on some; the wand (its tip sparkling in the tell)
//   princess  a bell-skirted gown (blue, yellow, pink, teal, lilac): its bodice laced, its panels catching the light,
//             a gilt hem, a petticoat's frill; puffed sleeves, a long wig (on the men too: their own beards under it),
//             a tiara; the glass slipper wound up over the head (the tell)
//   knight    gray foam plate, riveted, its pauldrons; a tabard in a heraldic color with its chevron, a belt; a helmet
//             with the visor up (the face), a plume; the striped foam lance (upright; couched out front in the charge)
//   bro       a team jersey with its number and sleeve stripes, a backwards cap, face paint, a foam finger; a broomball
//   troll     a huge green foam suit (felt fur tufts, the zip up its back), a belly, mitts, a horned helmet (the horns
//             are the dive kick's undoing), tusks, googly felt eyes, the foam club with its painted knots; the
//             performer's face in the costume's mouth
//   dragon    a big plush dragon suit: belly plates, felt spines down its back, felt wings on their ribs, a tail; a snout,
//             felt teeth, the performer's face in its mouth; rearing back with smoke (the tell), the mouth wide for
//             the flame
//   owl       a barn owl: the heart face, its wings in layered feathers, a letter in its talons; wings up (the tell)
//   keg       BUTTER BREW's keg: staves, hoops, the brass tap, the $14 tag

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, ball, limb, dither,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
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
const face = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk') => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};
const handsAt = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};
const dead = (F: Frame) => F.md === 'dead';
const GILT = ['#7A5212', '#B07E22', '#E0AE3A', '#F6D365', '#FFF4B8'];

/** A tiny pixel number (3x5 digits) for a jersey. */
const DIGITS = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001010010010', '111101111101111', '111101111001111'];
const digits = (g: Ctx, n: string, x: number, y: number, col: string) => {
  [...n].forEach((ch, i) => { const d = DIGITS[+ch] ?? DIGITS[0]; for (let k = 0; k < 15; k++) if (d[k] === '1') px(g, x + i * 4 + (k % 3), y + Math.floor(k / 3), 1, 1, col); });
};

// ---------------------------------------------------------------------------------------------------------------
// The wand clerk

const HOUSES: [string, string][] = [['#9B1C1C', '#E0AE3A'], ['#166534', '#C8CCD4'], ['#1E3A8A', '#B07A4A'], ['#CA8A04', '#18181B']];
const wand = (g: Ctx, x: number, y: number, a: number, lit: boolean) => {
  g.save(); g.translate(x, y); g.rotate(a);
  px(g, -1, -1, 19, 4, INK); px(g, 0, 0, 17, 2, '#6A4424'); px(g, 0, 0, 17, 1, '#9A6A3E'); px(g, 0, 0, 6, 2, '#3A2410'); px(g, 2, 0, 1, 2, '#C8A040');
  if (lit) { ball(g, 19, 1, 3.4, '#FDE047', 0.6); px(g, 18, 0, 2, 2, '#FFFFFF'); px(g, 23, -3, 1, 3, '#FFF6C8'); px(g, 22, -2, 3, 1, '#FFF6C8'); }
  g.restore();
};
const paintClerk = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, [robe, trim] = HOUSES[F.seed % 4];
  const robeCol = '#24222E';
  legs(g, B, { col: '#3A3440', shoe: 'shoe', shoeCol: '#18181B' });
  const cast = F.pose === 'tell', poke = F.pose === 'strike';
  const H = handsAt(B, F, [-B.w / 2 - 5, B.shY + 14], cast ? [B.hx + 10, B.hy - 22] : poke ? [B.w / 2 + 18, B.shY + 10] : [B.w / 2 + 6, B.shY + 18]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: robeCol, hand: L.skin });
  // (the robe: shoulders to the shins, flaring; its folds; its trim down the front and round the hem; the crest)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 2); g.lineTo(B.w / 2, B.shY + 2); g.lineTo(B.w / 2 + 7, -12); g.quadraticCurveTo(0, -9, -B.w / 2 - 7, -12); g.closePath(); }, robeCol, -B.w / 2 - 7, B.shY + 2, B.w + 14, -10 - B.shY);
  for (const fx of [-B.w / 2 + 3, -2, B.w / 2 - 6]) px(g, fx, B.hipY - 2, 1, -10 - B.hipY, dk(robeCol, 0.4));
  for (const fx of [-B.w / 2 + 4, B.w / 2 - 5]) px(g, fx, B.hipY, 1, -14 - B.hipY, lt(robeCol, 0.18));
  px(g, -1, B.shY + 4, 3, -16 - B.shY, trim); px(g, -1, B.shY + 4, 1, -16 - B.shY, lt(trim, 0.3));
  px(g, -B.w / 2 - 6, -15, B.w + 12, 2, trim);
  px(g, -B.w / 2 + 3, B.shY + 8, 6, 5, robe); px(g, -B.w / 2 + 4, B.shY + 13, 4, 1, robe); px(g, -B.w / 2 + 5, B.shY + 9, 2, 2, trim);
  // (the scarf, striped in the house's colors, an end hanging, a fringe)
  for (let k = 0; k < 4; k++) px(g, -B.w / 2 + 3 + k * 5, B.shY - 1, 5, 5, k % 2 ? trim : robe);
  px(g, -B.w / 2 + 3, B.shY - 1, 20, 1, lt(robe, 0.3));
  for (let k = 0; k < 4; k++) px(g, B.w / 2 - 8, B.shY + 4 + k * 4, 5, 4, k % 2 ? trim : robe);
  for (let k = 0; k < 3; k++) px(g, B.w / 2 - 8 + k * 2, B.shY + 20, 1, 2, trim);
  hairBack(g, B);
  face(g, B, F, cast ? 'wide' : 'smug', cast ? 'o' : poke ? 'teeth' : 'smirk');
  whiskers(g, B); glasses(g, B);
  const hat = (F.seed >> 2) % 3 !== 0;
  const hatPath = (ox: number, oy: number) => () => { g.moveTo(ox - 11, oy - 7); g.lineTo(ox + 13, oy - 7); g.lineTo(ox + 6, oy - 30); g.quadraticCurveTo(ox + 4, oy - 38, ox - 6, oy - 34); g.lineTo(ox - 3, oy - 28); g.closePath(); };
  if (dead(F)) {
    // (dead: the hat's come off, lying by him)
    if (hat) { partTop(g, () => { g.moveTo(B.hx + 16, -2); g.lineTo(B.hx + 36, -2); g.lineTo(B.hx + 42, -18); g.quadraticCurveTo(B.hx + 44, -22, B.hx + 38, -20); g.closePath(); }, '#2A2440', B.hx + 16, -22, 28, 20, 1); px(g, B.hx + 18, -5, 16, 2, trim); }
    hairTop(g, B);
  } else if (hat) {
    partTop(g, hatPath(B.hx, B.hy), '#2A2440', B.hx - 11, B.hy - 38, 24, 31, 1);
    px(g, B.hx - 13, B.hy - 9, 28, 3, INK); px(g, B.hx - 12, B.hy - 8, 26, 2, '#3A3456');
    px(g, B.hx - 9, B.hy - 12, 20, 3, trim); px(g, B.hx - 1, B.hy - 12, 4, 3, GILT[3]); px(g, B.hx, B.hy - 11, 2, 1, INK);
    px(g, B.hx + 3, B.hy - 22, 2, 2, GILT[4]); px(g, B.hx - 2, B.hy - 28, 1, 1, GILT[4]);
  } else hairTop(g, B);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: robeCol, hand: L.skin });
  if (!H.held) wand(g, H.near[0], H.near[1], cast ? -1.3 : poke ? 0 : -0.5, cast);
};
export const drawClerk = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['cast', 'pokeWind'], ['poke', 'after']));
  putFrame(c, 'fa-clerk2', F, BOX, g => paintClerk(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The princess (on anybody)

const GOWNS = ['#3B82F6', '#FACC15', '#F472B6', '#2DD4BF', '#A78BFA'];
const WIGS = ['#1A1A1A', '#F2D58A', '#C2501E', '#6A3A1A'];
const slipper = (g: Ctx, x: number, y: number) => { part(g, () => { g.moveTo(x - 6, y); g.lineTo(x + 7, y); g.lineTo(x + 8, y - 4); g.quadraticCurveTo(x + 2, y - 7, x - 2, y - 5); g.closePath(); }, '#CFF4FF', x - 6, y - 7, 14, 7, 0.8); px(g, x - 4, y - 4, 2, 1, '#FFFFFF'); px(g, x + 5, y - 2, 1, 1, '#FFFFFF'); };
const paintPrincess = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, gown = pickOf(F.seed, 3, GOWNS), wig = pickOf(F.seed, 5, WIGS);
  const wind = F.pose === 'tell', slap = F.pose === 'strike';
  // (the skirt: a bell to the floor (the feet peeking), its panels catching the light, a gilt hem, the petticoat's frill)
  legs(g, B, { col: L.skin, shoe: 'pointy', shoeCol: '#CFF4FF' });
  const sk = () => { g.moveTo(-B.hipW / 2 - 2, B.hipY - 4); g.lineTo(B.hipW / 2 + 2, B.hipY - 4); g.quadraticCurveTo(B.hipW / 2 + 16, -8, B.hipW / 2 + 18, -3); g.lineTo(-B.hipW / 2 - 18, -3); g.quadraticCurveTo(-B.hipW / 2 - 16, -8, -B.hipW / 2 - 2, B.hipY - 4); g.closePath(); };
  for (let k = -B.hipW / 2 - 12; k < B.hipW / 2 + 14; k += 6) px(g, k, -5, 4, 2, '#FFFFFF');
  part(g, sk, gown, -B.hipW / 2 - 18, B.hipY - 4, B.hipW + 36, -B.hipY + 1);
  g.save(); g.beginPath(); sk(); g.clip();
  for (const k of [-0.6, -0.1, 0.4]) { const x0 = k * B.hipW; g.strokeStyle = lt(gown, 0.32); g.lineWidth = 1; g.beginPath(); g.moveTo(x0, B.hipY - 2); g.lineTo(x0 * 2.2, -3); g.stroke(); g.strokeStyle = dk(gown, 0.22); g.beginPath(); g.moveTo(x0 + 3, B.hipY - 2); g.lineTo(x0 * 2.2 + 5, -3); g.stroke(); }
  px(g, -B.hipW / 2 - 20, -7, B.hipW + 40, 2, GILT[2]); for (let k = -B.hipW / 2 - 16; k < B.hipW / 2 + 18; k += 5) px(g, k, -7, 1, 1, GILT[4]);
  g.restore();
  const H = handsAt(B, F, [-B.w / 2 - 6, B.shY + 16], wind ? [B.hx - 2, B.hy - 22] : slap ? [B.w / 2 + 18, B.shY + 6] : [B.w / 2 + 6, B.shY + 18]);
  hairBack(g, { ...B, L: { ...L, long: true, woman: true, bald: false } }, wig, 26);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: L.skin });
  torso(g, B, gown);
  // (the bodice laced up its front, puffed sleeves, the neckline, a pendant)
  for (let y = B.shY + 6; y < B.hipY - 1; y += 3) { px(g, -2, y, 1, 1, '#FFFFFF'); px(g, 1, y + 1, 1, 1, '#FFFFFF'); }
  px(g, -B.w / 2 + 2, B.hipY - 2, B.w - 4, 2, GILT[2]);
  for (const s of [-1, 1]) { ball(g, s * (B.w / 2 - 2), B.shY + 3, 5, lt(gown, 0.25), 1); px(g, s * (B.w / 2 - 2) - 2, B.shY + 1, 2, 1, '#FFFFFF'); }
  px(g, -6, B.shY, 12, 3, L.skin); px(g, -1, B.shY + 3, 2, 2, GILT[3]);
  face(g, B, F, slap ? 'angry' : 'open', wind ? 'teeth' : slap ? 'teeth' : 'smile');
  whiskers(g, B);
  // (the wig's top; the tiara (dead: knocked crooked off the wig))
  hairTop(g, { ...B, L: { ...L, bald: false } }, wig);
  if (dead(F)) { g.save(); g.translate(B.hx + 12, B.hy - 12); g.rotate(0.7); px(g, -7, -1, 14, 4, INK); px(g, -6, 0, 12, 2, GILT[3]); px(g, -2, -4, 4, 4, GILT[3]); px(g, -1, -3, 2, 2, '#F472B6'); g.restore(); }
  else { px(g, B.hx - 7, B.hy - 13, 15, 3, INK); px(g, B.hx - 6, B.hy - 12, 13, 2, GILT[3]); px(g, B.hx - 6, B.hy - 12, 13, 1, GILT[4]); for (const k of [-5, 0, 5]) { px(g, B.hx + k - 2, B.hy - 17, 4, 5, INK); px(g, B.hx + k - 1, B.hy - 16, 2, 4, GILT[3]); } px(g, B.hx - 1, B.hy - 15, 2, 2, '#60A5FA'); px(g, B.hx - 1, B.hy - 15, 1, 1, '#FFFFFF'); }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: L.skin });
  if (wind && !H.held) slipper(g, H.near[0], H.near[1] - 3);
};
export const drawPrincess = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'twirl'], ['slap', 'after']));
  putFrame(c, 'fa-princess2', F, BOX, g => paintPrincess(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The knight (foam plate; the lance pointy out front)

const TABARDS: [string, string][] = [['#1E40AF', '#F6D365'], ['#B91C1C', '#F8FAFC'], ['#166534', '#F6D365'], ['#7C3AED', '#F8FAFC']];
const PLATE = '#A8AEB8';
const paintKnight = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), [tab, stripe] = TABARDS[(F.seed >> 1) % 4];
  const couched = F.v === 'couch';
  legs(g, B, { col: PLATE, shoe: 'boot', shoeCol: '#6A707A', detail: (g2, _h, knee) => { ball(g2, knee[0], knee[1], 3, PLATE, 1); px(g2, knee[0] - 1, knee[1] - 1, 1, 1, '#FFFFFF'); } });
  const H = handsAt(B, F, [-B.w / 2 - 4, B.shY + 16], couched ? [B.w / 2 + 6, B.shY + 14] : [B.w / 2 + 8, B.shY + 12]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: PLATE, hand: '#6A707A' });
  // (the lance, behind the near arm: upright, or couched and pointing out front; its grip, its vamplate)
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(couched ? 0 : -1.35);
    part(g, () => { g.moveTo(-14, -3); g.lineTo(52, -1.5); g.quadraticCurveTo(64, 0, 52, 1.5); g.lineTo(-14, 3); g.closePath(); }, '#F2EEE6', -14, -3, 78, 6, 1);
    for (let k = -6; k < 50; k += 10) { px(g, k, -2, 4, 4, '#C81E3A'); px(g, k, -2, 4, 1, '#E8506A'); }
    px(g, -12, -3, 8, 6, '#5A3A24'); for (let k = -12; k < -4; k += 2) px(g, k, -3, 1, 6, '#3A2414');
    part(g, () => { g.moveTo(-2, -8); g.lineTo(6, -8); g.lineTo(8, 8); g.lineTo(-4, 8); g.closePath(); }, '#8A8F98', -4, -8, 12, 16, 1);
    px(g, 0, -6, 1, 12, '#C8CCD4');
    g.restore();
  }
  torso(g, B, PLATE);
  // (the tabard over the plate: its chevron, a belt and buckle; the pauldrons; rivets)
  const tp = () => g.rect(-B.w / 2 + 3, B.shY + 2, B.w - 6, B.hipY - B.shY + 10);
  part(g, tp, tab, -B.w / 2 + 3, B.shY + 2, B.w - 6, B.hipY - B.shY + 10, 1);
  g.save(); g.beginPath(); tp(); g.clip();
  g.strokeStyle = stripe; g.lineWidth = 3; g.beginPath(); g.moveTo(-B.w / 2, B.shY + 18); g.lineTo(0, B.shY + 9); g.lineTo(B.w / 2, B.shY + 18); g.stroke();
  g.strokeStyle = lt(stripe, 0.3); g.lineWidth = 1; g.beginPath(); g.moveTo(-B.w / 2, B.shY + 17); g.lineTo(0, B.shY + 8); g.stroke();
  for (let y = B.hipY + 4; y < B.hipY + 12; y += 2) px(g, -B.w / 2 + 3, y, B.w - 6, 1, dk(tab, 0.2));
  g.restore();
  px(g, -B.w / 2 + 3, B.hipY - 2, B.w - 6, 3, '#4A3020'); px(g, -2, B.hipY - 2, 4, 3, GILT[3]);
  for (const s of [-1, 1]) { part(g, () => g.ellipse(s * (B.w / 2 - 1), B.shY + 3, 6, 4.5, 0, 0, Math.PI * 2), PLATE, s * (B.w / 2 - 1) - 6, B.shY - 2, 12, 9, 1); px(g, s * (B.w / 2 - 1) - 3, B.shY + 1, 1, 1, '#FFFFFF'); px(g, s * (B.w / 2 - 1) + 2, B.shY + 4, 1, 1, '#5A5E66'); }
  face(g, B, F, couched ? 'angry' : 'open', couched ? 'teeth' : 'flat');
  whiskers(g, B);
  if (dead(F)) {
    // (dead: the helmet's off, rolled away; their own hair)
    hairTop(g, B);
    partTop(g, () => g.ellipse(B.hx + 26, -9, 10, 9, 0.4, 0, Math.PI * 2), PLATE, B.hx + 16, -18, 20, 18, 1);
    px(g, B.hx + 20, -12, 10, 2, '#5A5E66');
  } else {
    // (the helmet round the face, the visor up, its rivets, the plume)
    part(g, () => { g.moveTo(B.hx - 11, B.hy + 9); g.lineTo(B.hx - 11, B.hy - 6); g.quadraticCurveTo(B.hx, B.hy - 16, B.hx + 11, B.hy - 6); g.lineTo(B.hx + 11, B.hy - 3); g.lineTo(B.hx - 3, B.hy - 3); g.lineTo(B.hx - 3, B.hy + 9); g.closePath(); }, PLATE, B.hx - 11, B.hy - 16, 22, 25, 1);
    px(g, B.hx - 2, B.hy - 12, 13, 3, '#6A707A'); px(g, B.hx - 2, B.hy - 12, 13, 1, '#C8CCD4');
    for (const ry of [B.hy - 4, B.hy + 3]) px(g, B.hx - 9, ry, 1, 1, '#E8ECF2');
    part(g, () => { g.moveTo(B.hx - 4, B.hy - 13); g.quadraticCurveTo(B.hx - 16, B.hy - 28, B.hx - 24, B.hy - 12); g.quadraticCurveTo(B.hx - 12, B.hy - 18, B.hx - 2, B.hy - 11); g.closePath(); }, stripe === '#F8FAFC' ? '#C81E3A' : stripe, B.hx - 24, B.hy - 28, 22, 17, 1);
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: PLATE, hand: '#6A707A' });
};
export const drawKnight = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const couch = e.aiState === 'lower' || e.aiState === 'charge';
  const F = frameFor(e, f, seed, e.aiState === 'charge' ? 'walk' : poseOf(e, ['lower'], ['winded']), couch ? 'couch' : '');
  putFrame(c, 'fa-knight2', F, BOX, g => paintKnight(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The broomball bro

const JERSEYS: [string, string][] = [['#DC2626', '#F8FAFC'], ['#1D4ED8', '#FACC15'], ['#15803D', '#F8FAFC'], ['#7E22CE', '#FACC15'], ['#EA580C', '#18181B']];
const paintBro = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, [jer, num] = JERSEYS[(F.seed >> 2) % 5];
  const wind = F.pose === 'tell', bump = F.pose === 'strike', fin = num === '#18181B' ? '#FACC15' : num;
  legs(g, B, { col: '#3F3F46', shoe: 'sneaker', shoeCol: '#F4F4F5', bareBelow: true, detail: (g2, _h, knee, _f, near) => { if (near) px(g2, knee[0] - 3, knee[1] + 3, 6, 2, '#F4F4F5'); } });
  const H = handsAt(B, F, wind ? [-B.w / 2 - 14, B.shY + 2] : [-B.w / 2 - 8, B.shY - 10], wind ? [-B.w / 2 - 2, B.shY - 8] : bump ? [B.w / 2 + 4, B.shY + 4] : [B.w / 2 + 6, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: L.skin, hand: L.skin });
  // (the foam finger up on the far hand: #1 on it)
  if (!H.held) { part(g, () => g.roundRect(H.far[0] - 5, H.far[1] - 22, 10, 22, 3), fin, H.far[0] - 5, H.far[1] - 22, 10, 22, 1); part(g, () => g.roundRect(H.far[0] - 2, H.far[1] - 34, 5, 14, 2), fin, H.far[0] - 2, H.far[1] - 34, 5, 14, 1); digits(g, '1', H.far[0] - 1, H.far[1] - 16, jer); }
  torso(g, B, jer, B.shY, B.hipY + 2, bump ? 4 : 0);
  // (the jersey's number, its sleeve stripes, its hem)
  digits(g, String(10 + (F.seed % 89)), -4, B.shY + 8, num);
  for (const s of [-1, 1]) { px(g, s * (B.w / 2 - 1) - 3, B.shY + 3, 6, 1, num); px(g, s * (B.w / 2 - 1) - 3, B.shY + 5, 6, 1, num); }
  px(g, -B.w / 2 + 1, B.hipY - 1, B.w - 2, 2, dk(jer, 0.3));
  face(g, B, F, bump ? 'angry' : 'open', wind || bump ? 'teeth' : 'grin');
  // (face paint: two stripes on the cheek)
  px(g, B.hx + 1, B.hy + 1, 5, 1, jer); px(g, B.hx + 1, B.hy + 3, 5, 1, fin);
  whiskers(g, B); glasses(g, B);
  // (the cap on backwards (off when dead), its peak out behind, its button)
  if (dead(F)) { hairTop(g, B); partTop(g, () => g.ellipse(B.hx - 24, -6, 9, 5, 0, Math.PI, 0), jer, B.hx - 33, -11, 18, 6, 1); px(g, B.hx - 36, -7, 6, 2, dk(jer, 0.3)); }
  else { partTop(g, () => g.ellipse(B.hx, B.hy - 7, 10, 7, 0, Math.PI, 0), jer, B.hx - 10, B.hy - 14, 20, 8, 1); px(g, B.hx - 16, B.hy - 9, 8, 3, dk(jer, 0.3)); px(g, B.hx - 16, B.hy - 9, 8, 1, lt(jer, 0.2)); px(g, B.hx, B.hy - 14, 2, 1, fin); }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: L.skin, hand: L.skin });
  if (wind && !H.held) { ball(g, H.far[0] - 4, H.far[1] - 4, 5, '#F97316', 1); px(g, H.far[0] - 8, H.far[1] - 5, 8, 1, '#7C2D12'); }
};
export const drawBro = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['wind', 'bumpWind'], ['bump', 'after']));
  putFrame(c, 'fa-bro2', F, BOX, g => paintBro(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The big mascots: their performers' faces in the costumes' mouths. Painted per pose and walk frame into a stamp (live
// while they're tumbling).

const seedOfE = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
/** A performer's face, small, sweaty, in its hole. */
const performer = (g: Ctx, seed: number, x: number, y: number, r: number, hurt: boolean, isDead: boolean, own = false) => {
  const L = lookOf(seed);
  part(g, () => g.ellipse(x, y, r, r * 0.86, 0, 0, Math.PI * 2), L.skin, x - r, y - r, r * 2, r * 1.8, 1.2);
  if (own && !L.bald) { partTop(g, () => { g.moveTo(x - r, y - 1); g.quadraticCurveTo(x - r, y - r * 1.1, x, y - r * 0.95); g.quadraticCurveTo(x + r, y - r, x + r, y - 2); g.lineTo(x + 2, y - r * 0.5); g.closePath(); }, L.hair, x - r, y - r * 1.1, r * 2, r, 1); for (let k = 0; k < 3; k++) px(g, x - r + 2 + k * 3, y - r * 0.5, 1, 2, dk(L.hair, 0.3)); }
  if (isDead) { for (const o of [-4, 3]) { px(g, x + o - 1, y - 3, 3, 1, INK); px(g, x + o, y - 4, 1, 3, INK); } }
  else if (hurt) { px(g, x - 5, y - 3, 3, 1, INK); px(g, x + 2, y - 3, 3, 1, INK); }
  else { for (const o of [-4, 3]) { px(g, x + o - 1, y - 4, 3, 3, '#FFFFFF'); px(g, x + o, y - 3, 2, 2, INK); } }
  px(g, x - 2, y + 2, 5, 2, INK); if (!isDead && !hurt) px(g, x - 1, y + 2, 3, 1, '#FFFFFF');
  px(g, x + r - 3, y - r * 0.4, 2, 3, '#BFE8FF'); px(g, x - r + 1, y, 2, 2, '#BFE8FF'); px(g, x + r - 3, y - r * 0.4, 1, 1, '#FFFFFF');
  px(g, x + 3, y + 1, 3, 1, dk(L.skin, 0.12));
};
/** A googly felt eye, its pupil rolled where it fell. */
const googly = (g: Ctx, x: number, y: number, r: number, a: number) => { ball(g, x, y, r, '#F8F8F0', 1); px(g, x + Math.cos(a) * r * 0.4 - 1.5, y + Math.sin(a) * r * 0.4 - 1.5, 3, 3, INK); };
/** Puts a mascot down: stamped by its look while it's stood flat, live while it's being knocked about. */
const mascot = (c: Ctx, key: string, spin: number, box: [number, number, number, number], paint: (g: Ctx) => void) => {
  if (spin) { c.save(); c.rotate(spin); paint(c); c.restore(); return; }
  stamp(c, key, box[0], box[1], box[2], box[3], paint);
};

export const drawTroll = (c: Ctx, e: Enemy, f: number) => {
  const r = reaction(e), md = r?.md ?? moodOf(e), isDead = md === 'dead';
  const pose = r?.pose ?? (e.aiState === 'raise' ? 'tell' : e.aiState === 'winded' ? 'strike' : moving(e));
  const FOAM = '#5E9A3A', DARK = '#3E6A24', isFlat = pose === 'limp' || (isDead && !r), seed = seedOfE(e);
  const wf = pose === 'walk' ? Math.floor(f / 5) % 6 : 0, walk = pose === 'walk' ? Math.sin((wf / 6) * Math.PI * 2) * 5 : 0;
  const raise = pose === 'tell', after = pose === 'strike', hurt = md === 'hurt';
  const paint = (g: Ctx) => {
    if (isFlat) {
      // (laid out on his back on the cobbles: the big foam body belly-up, the stumpy legs in the air, the mitts flopped
      // out, the costume's head rolled off beside him, the performer's own sweaty head out the neck hole)
      for (const [x1, y1, x2, y2, col] of [[24, -22, 40, -40, DARK], [30, -16, 50, -26, FOAM]] as const) { limb(g, x1, y1, x2, y2, 15, col); part(g, () => g.ellipse(x2 + 2, y2 - 3, 7, 11, 0.5, 0, Math.PI * 2), dk(FOAM, 0.3), x2 - 6, y2 - 14, 16, 22, 1.2); }
      limb(g, -18, -30, -26, -48, 13, DARK); ball(g, -27, -50, 8, DARK, 1.2);
      part(g, () => g.ellipse(0, -22, 40, 22, 0, 0, Math.PI * 2), FOAM, -40, -44, 80, 44, 1.4);
      part(g, () => g.ellipse(4, -30, 26, 12, 0, 0, Math.PI * 2), lt(FOAM, 0.18), -22, -42, 52, 24, 1);
      part(g, () => g.rect(14, -42, 8, 40), '#7A5A34', 14, -42, 8, 40, 1); for (let y = -40; y < -4; y += 6) px(g, 22, y, 3, 4, '#5A3E20');
      for (let x = -34; x < 30; x += 3) px(g, x, -3 + Math.abs(x) * 0.02, 1, 2, '#A8AEB8');
      limb(g, 6, -36, 12, -56, 13, FOAM); ball(g, 12, -58, 8, FOAM, 1.2);
      px(g, -46, -24, 8, 10, dk(FOAM, 0.3));
      performer(g, seed, -50, -18, 9, true, true, true);
      part(g, () => g.ellipse(70, -15, 20, 15, 0.5, 0, Math.PI * 2), FOAM, 50, -30, 40, 30, 1.2);
      px(g, 62, -20, 14, 7, INK); googly(g, 66, -24, 4, 2.2); googly(g, 76, -18, 3.5, 0.2);
      part(g, () => { g.moveTo(80, -24); g.quadraticCurveTo(96, -34, 92, -48); g.lineTo(86, -30); g.closePath(); }, '#F2EAD0', 80, -48, 16, 24, 1);
      return;
    }
    // (the legs: short, stumpy, foam feet with felt toes)
    limb(g, -14, -32, -16 - walk, -8, 16, DARK); limb(g, 14, -32, 16 + walk, -8, 16, FOAM);
    for (const [fx, col] of [[-14 - walk, dk(FOAM, 0.35)], [18 + walk, dk(FOAM, 0.2)]] as const) { part(g, () => g.ellipse(fx, -5, 13, 6, 0, 0, Math.PI * 2), col, fx - 13, -11, 26, 12, 1.2); for (let k = 0; k < 3; k++) ball(g, fx + 6 + k * 3, -4 + (k - 1) * 0.5, 2, lt(col, 0.1), 0.8); }
    // (the far arm, long, a mitt with its thumb)
    limb(g, -24, -78, -36, raise ? -110 : -40, 14, DARK); ball(g, -36, raise ? -112 : -38, 9, DARK, 1.2); ball(g, -30, raise ? -116 : -42, 3.5, DARK, 1);
    // (the body: a belly like a beanbag, felt fur tufts, the zip up its back, a loincloth with a fur fringe and its bone)
    part(g, () => g.ellipse(0, -60, 34, 36, 0, 0, Math.PI * 2), FOAM, -34, -96, 68, 72, 1.4);
    part(g, () => g.ellipse(6, -46, 22, 18, 0, 0, Math.PI * 2), lt(FOAM, 0.18), -16, -64, 44, 36, 1);
    px(g, 8, -44, 3, 2, dk(FOAM, 0.3));
    for (let k = 0; k < 9; k++) { const a = -2.4 + k * 0.35, tx = Math.cos(a) * 33, ty = -60 + Math.sin(a) * 35; px(g, tx - 1, ty - 2, 3, 4, DARK); px(g, tx, ty - 3, 1, 2, lt(FOAM, 0.2)); }
    for (let y = -88; y < -38; y += 3) { px(g, -31 + (y + 88) * 0.04, y, 2, 1, '#A8AEB8'); }
    px(g, -30, -90, 3, 4, '#C8CCD4');
    part(g, () => { g.moveTo(-26, -34); g.lineTo(26, -34); g.lineTo(26, -26); g.lineTo(-26, -26); g.closePath(); }, '#7A5A34', -26, -34, 52, 8, 1);
    for (let k = -24; k < 26; k += 6) { px(g, k, -26, 4, 4, '#5A3E20'); px(g, k + 1, -26, 2, 1, '#9A7A54'); }
    part(g, () => g.roundRect(-6, -35, 12, 4, 2), '#F2EAD0', -6, -35, 12, 4, 0.8);
    // (the costume's head (dead: off, lying at his feet, and there's the performer's own head, small, on the big body))
    if (isDead) {
      part(g, () => g.ellipse(48, -18, 22, 18, 0.4, 0, Math.PI * 2), FOAM, 26, -36, 44, 36, 1.2);
      px(g, 40, -24, 16, 8, INK); googly(g, 44, -28, 4, 2); googly(g, 54, -24, 3.5, 0.4);
      px(g, -6, -104, 12, 6, dk(FOAM, 0.3));
      performer(g, seed, 2, -110, 9, true, true, true);
    } else {
      part(g, () => g.ellipse(4, -96, 26, 22, 0, 0, Math.PI * 2), FOAM, -22, -118, 52, 44, 1.4);
      // (pointed felt ears, warts, a brow like a shelf, googly eyes)
      for (const s of [-1, 1]) part(g, () => { g.moveTo(4 + s * 22, -100); g.lineTo(4 + s * 36, -110); g.lineTo(4 + s * 24, -92); g.closePath(); }, DARK, s < 0 ? -32 : 26, -110, 14, 18, 1);
      ball(g, -12, -92, 2.5, dk(FOAM, 0.15), 0.8); ball(g, 22, -100, 2, dk(FOAM, 0.15), 0.8);
      px(g, 4, -112, 26, 3, dk(FOAM, 0.35));
      googly(g, 12, -105, 5, hurt ? 1.2 : 0.3 + Math.sin(f * 0.1) * 0.2); googly(g, 24, -105, 4.5, hurt ? 2.4 : 0.6);
      // (the mouth hole, the performer in it; tusks up off the lower lip)
      part(g, () => g.roundRect(-2, -97, 30, 17, 4), '#2A1A1A', -2, -97, 30, 17, 1.2);
      performer(g, seed, 13, -88, 8, hurt, false);
      for (let k = 0; k < 4; k++) { px(g, k * 7 + 1, -97, 4, 4, INK); px(g, k * 7 + 2, -97, 2, 3, '#F5F0DC'); }
      for (const tx of [0, 24]) { part(g, () => { g.moveTo(tx, -80); g.lineTo(tx + 5, -80); g.lineTo(tx + 3, -89); g.closePath(); }, '#F5F0DC', tx, -89, 5, 9, 0.8); }
      // (the horned helmet: iron, a riveted band, the horns up (spiky))
      partTop(g, () => g.ellipse(4, -114, 22, 10, 0, Math.PI, 0), '#8A8F98', -18, -124, 44, 10, 1.2);
      px(g, -18, -115, 44, 3, '#5A5E66'); for (let k = -14; k < 26; k += 6) px(g, k, -114, 1, 1, '#E8ECF2');
      for (const s of [-1, 1]) part(g, () => { g.moveTo(4 + s * 16, -118); g.quadraticCurveTo(4 + s * 34, -122, 4 + s * 30, -142); g.lineTo(4 + s * 24, -124); g.lineTo(4 + s * 10, -120); g.closePath(); }, '#F2EAD0', s < 0 ? -30 : 14, -142, 20, 24, 1.2);
    }
    // (the near arm and the club: up over his head (the tell), down in front (after the slam), else carried)
    const cx = raise ? 6 : after ? 54 : 36, cy = raise ? -128 : after ? -14 : -50, ca = raise ? -1.9 : after ? 0.1 : -0.6;
    limb(g, 24, -78, cx, cy, 15, FOAM); ball(g, cx, cy, 10, FOAM, 1.2);
    if (!r || !isDead) {
      g.save(); g.translate(cx, cy); g.rotate(ca);
      part(g, () => { g.moveTo(-4, -6); g.lineTo(58, -14); g.quadraticCurveTo(72, 0, 58, 14); g.lineTo(-4, 6); g.closePath(); }, '#8A5A30', -4, -14, 76, 28, 1.4);
      for (const [kx, ky] of [[22, -4], [40, 6], [50, -6]] as const) { ball(g, kx, ky, 2.5, '#6A4020', 0.8); px(g, kx - 1, ky - 1, 1, 1, '#B07A48'); }
      for (const [nx, ny] of [[56, -10], [62, 2], [54, 10]] as const) { px(g, nx, ny, 3, 3, '#5A5E66'); px(g, nx, ny, 1, 1, '#E8ECF2'); }
      g.restore();
    }
  };
  const spin = pose === 'thrown' ? Math.sin(f * 0.6) * 0.3 : 0;
  // (big enough for the club at every swing: over his head on the tell (to ~-200 up), out in front after the slam (to ~+130))
  mascot(c, `fa-troll2-${seed}-${pose}-${wf}-${md}-${isFlat ? 1 : 0}-${r ? 1 : 0}`, spin, [-120, -225, 270, 236], paint);
};

export const drawDragon = (c: Ctx, e: Enemy, f: number) => {
  const r = reaction(e), md = r?.md ?? moodOf(e), isDead = md === 'dead';
  const pose = r?.pose ?? moving(e);
  const seed = seedOfE(e);
  const SUIT = ['#4CA84A', '#8A4ACF', '#D0402E'][seed % 3], BELLY = '#F2D98A', WING = ['#6A2E8A', '#E07A2A', '#2E6A8A'][seed % 3];
  const isFlat = pose === 'limp' || (isDead && !r), hurt = md === 'hurt';
  const rear = e.aiState === 'rear', breathe = e.aiState === 'breathe';
  const wf = pose === 'walk' ? Math.floor(f / 5) % 6 : 0, walk = pose === 'walk' ? Math.sin((wf / 6) * Math.PI * 2) * 5 : 0;
  const flap = Math.floor(f / 15) % 2;
  const paint = (g: Ctx) => {
    if (isFlat) {
      // (flat on its back: the plush body belly-up, its legs and little arms in the air, the wings squashed out under it,
      // the tail flopped out behind, the costume's head rolled away, the performer's own head out the neck hole)
      part(g, () => { g.moveTo(-30, -10); g.quadraticCurveTo(-56, -6, -70, -2); g.lineTo(-68, -8); g.quadraticCurveTo(-52, -14, -30, -20); g.closePath(); }, SUIT, -70, -20, 40, 18, 1.2);
      part(g, () => { g.moveTo(-20, -4); g.lineTo(-44, -2); g.lineTo(-34, -14); g.closePath(); }, dk(WING, 0.2), -44, -14, 24, 12, 1);
      for (const [x1, y1, x2, y2, col] of [[18, -22, 30, -40, dk(SUIT, 0.2)], [24, -16, 40, -28, SUIT]] as const) { limb(g, x1, y1, x2, y2, 13, col); part(g, () => g.ellipse(x2 + 2, y2 - 2, 5, 9, 0.5, 0, Math.PI * 2), dk(SUIT, 0.3), x2 - 4, y2 - 12, 12, 20, 1); }
      part(g, () => g.ellipse(0, -20, 34, 20, 0, 0, Math.PI * 2), SUIT, -34, -40, 68, 40, 1.4);
      part(g, () => g.ellipse(2, -28, 22, 10, 0, 0, Math.PI * 2), BELLY, -20, -38, 44, 20, 1);
      for (let k = 0; k < 4; k++) px(g, -14 + k * 9, -36, 1, 14, dk(BELLY, 0.3));
      limb(g, 6, -36, 10, -50, 9, SUIT); ball(g, 10, -52, 5, SUIT, 1);
      px(g, -40, -24, 8, 10, dk(SUIT, 0.3));
      performer(g, seed, -44, -18, 9, true, true, true);
      part(g, () => g.ellipse(58, -14, 20, 14, 0.3, 0, Math.PI * 2), SUIT, 38, -28, 40, 28, 1.2);
      px(g, 50, -20, 14, 8, INK); googly(g, 54, -26, 3.5, 1.6); for (let k = 0; k < 3; k++) px(g, 51 + k * 4, -20, 2, 2, '#FFFFFF');
      return;
    }
    // (the tail, out behind, felt spines along it, an arrowhead tip)
    part(g, () => { g.moveTo(-18, -34); g.quadraticCurveTo(-56, -30, -60, -8); g.lineTo(-50, -10); g.quadraticCurveTo(-46, -24, -16, -22); g.closePath(); }, SUIT, -60, -34, 44, 26, 1.2);
    part(g, () => { g.moveTo(-60, -8); g.lineTo(-70, -4); g.lineTo(-62, -18); g.closePath(); }, WING, -70, -18, 10, 14, 1);
    for (let k = 0; k < 4; k++) { const t = 0.2 + k * 0.2, tx = -18 - 40 * t, ty = -34 + 24 * t * t; part(g, () => { g.moveTo(tx - 3, ty); g.lineTo(tx, ty - 6); g.lineTo(tx + 3, ty); g.closePath(); }, WING, tx - 3, ty - 6, 6, 6, 0.8); }
    // (the legs, felt claws)
    limb(g, -10, -28, -12 - walk, -6, 15, dk(SUIT, 0.2)); limb(g, 12, -28, 14 + walk, -6, 15, SUIT);
    for (const [fx, col] of [[-10 - walk, dk(SUIT, 0.3)], [17 + walk, dk(SUIT, 0.15)]] as const) { part(g, () => g.ellipse(fx, -5, 11, 5, 0, 0, Math.PI * 2), col, fx - 11, -10, 22, 10, 1); for (let k = 0; k < 3; k++) px(g, fx + 6 + k * 2, -4 + k, 2, 2, '#F2EAD0'); }
    g.save(); if (rear) { g.translate(0, -40); g.rotate(-0.18); g.translate(0, 40); }
    // (the felt wings on their ribs)
    for (const s of [0, 1]) {
      const tip = flap && s ? -4 : 0, ox = s ? -4 : 0;
      part(g, () => { g.moveTo(-8 + ox, -70); g.lineTo(-30 + ox, -102 + tip); g.lineTo(-40 + ox, -86); g.lineTo(-44 + ox, -72); g.lineTo(-36 + ox, -66); g.closePath(); }, s ? WING : dk(WING, 0.25), -44 + ox, -102 + tip, 36, 36, 1);
      g.strokeStyle = dk(WING, 0.45); g.lineWidth = 1; g.beginPath(); g.moveTo(-8 + ox, -70); g.lineTo(-38 + ox, -86); g.moveTo(-8 + ox, -70); g.lineTo(-42 + ox, -72); g.stroke();
    }
    part(g, () => g.ellipse(0, -54, 28, 30, 0, 0, Math.PI * 2), SUIT, -28, -84, 56, 60, 1.4);
    // (the belly plates in rows, the zip up the back)
    part(g, () => g.ellipse(8, -50, 15, 22, 0, 0, Math.PI * 2), BELLY, -7, -72, 30, 44, 1);
    for (let k = 0; k < 5; k++) { px(g, -4, -68 + k * 8, 24, 1, dk(BELLY, 0.3)); px(g, -2, -67 + k * 8, 8, 1, lt(BELLY, 0.4)); }
    for (let y = -78; y < -32; y += 3) px(g, -27 + Math.abs(y + 55) * 0.12, y, 2, 1, '#A8AEB8');
    for (let k = 0; k < 4; k++) { const tx = -14 - k * 4, ty = -82 + k * 10; part(g, () => { g.moveTo(tx, ty + 3); g.lineTo(tx - 6, ty - 3); g.lineTo(tx + 2, ty - 2); g.closePath(); }, WING, tx - 6, ty - 3, 8, 6, 0.8); }
    // (the head: on a neck up front; dead: off, rolled on the ground, the performer's own head on the body)
    if (isDead) {
      part(g, () => g.ellipse(46, -14, 20, 14, 0.3, 0, Math.PI * 2), SUIT, 26, -28, 40, 28, 1.2);
      px(g, 38, -20, 14, 8, INK); googly(g, 42, -26, 3.5, 1.6);
      for (let k = 0; k < 3; k++) px(g, 39 + k * 4, -20, 2, 2, '#FFFFFF');
      px(g, -6, -82, 12, 6, dk(SUIT, 0.3));
      performer(g, seed, 6, -90, 9, true, true, true);
    } else {
      const hx = rear ? 4 : 18, hy = rear ? -98 : -86;
      limb(g, 4, -74, hx, hy + 6, 16, SUIT);
      part(g, () => g.ellipse(hx + 4, hy, 22, 17, 0, 0, Math.PI * 2), SUIT, hx - 18, hy - 17, 44, 34, 1.4);
      // (the snout out front, the nostrils, googly eyes up top, little horns, felt spines down the neck)
      part(g, () => g.ellipse(hx + 24, hy + 4, 14, 10, 0, 0, Math.PI * 2), SUIT, hx + 10, hy - 6, 28, 20, 1.2);
      px(g, hx + 32, hy - 1, 3, 2, INK); px(g, hx + 36, hy, 2, 2, INK);
      googly(g, hx + 4, hy - 12, 5, hurt ? 1.4 : 0.2 + Math.sin(f * 0.08) * 0.3); googly(g, hx + 13, hy - 13, 4, hurt ? 2.6 : 0.5);
      for (const k of [-6, 4]) part(g, () => { g.moveTo(hx + k, hy - 15); g.lineTo(hx + k - 3, hy - 27); g.lineTo(hx + k + 4, hy - 16); g.closePath(); }, BELLY, hx + k - 3, hy - 27, 7, 12, 1);
      for (let k = 0; k < 3; k++) part(g, () => { g.moveTo(hx - 14 + k * 2, hy + 4 + k * 7); g.lineTo(hx - 21 + k * 2, hy + k * 7); g.lineTo(hx - 13 + k * 2, hy - 1 + k * 7); g.closePath(); }, WING, hx - 21, hy - 1 + k * 7, 8, 6, 0.8);
      // (the mouth: open wide for the flame, the performer's face in it; felt teeth)
      const open = breathe ? 12 : rear ? 9 : 7;
      part(g, () => g.roundRect(hx + 4, hy + 2, 26, open + 2, 3), '#2A1418', hx + 4, hy + 2, 26, open + 2, 1);
      performer(g, seed, hx + 15, hy + 6 + open / 2, 6.5, hurt, false);
      for (let k = 0; k < 4; k++) { px(g, hx + 6 + k * 6, hy + 2, 3, 3, '#FFFFFF'); px(g, hx + 8 + k * 6, hy + 2, 1, 3, '#D8D8D0'); }
      if (rear) for (let k = 0; k < 3; k++) { const t = ((f + k * 9) % 27) / 27; g.globalAlpha = 0.7 * (1 - t); g.fillStyle = t < 0.4 ? '#E4E4EC' : '#B8B8C4'; g.beginPath(); g.ellipse(hx + 36 + t * 6, hy - 2 - t * 14, 3 + t * 4, 2.5 + t * 3, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
    }
    g.restore();
    // (the arms: little, in front, felt claws)
    limb(g, 14, -66, 28, rear ? -76 : -52, 10, SUIT); ball(g, 28, rear ? -77 : -51, 6, SUIT, 1);
    for (let k = 0; k < 3; k++) px(g, 32, (rear ? -80 : -54) + k * 2, 2, 1, '#F2EAD0');
  };
  const spin = pose === 'thrown' ? Math.sin(f * 0.6) * 0.3 : 0;
  // (rearing, the smoke's live: no stamp)
  if (rear && !isDead) { if (spin) { c.save(); c.rotate(spin); paint(c); c.restore(); } else paint(c); return; }
  mascot(c, `fa-dragon-${seed}-${pose}-${wf}-${md}-${breathe ? 1 : 0}-${flap}-${isFlat ? 1 : 0}-${r ? 1 : 0}`, spin, [-80, -140, 170, 146], paint);
};

// ---------------------------------------------------------------------------------------------------------------
// The mail owl, and the keg

export const drawOwl = (c: Ctx, e: Enemy, f: number) => {
  const isDead = e.health <= 0 || !e.id, hurt = (e.hitFlash ?? 0) > 0;
  const hoot = e.aiState === 'hoot', swoop = e.aiState === 'swoop', flap = hoot ? -1 : swoop ? 2 : Math.floor(f / 4) % 2;
  const paint = (g: Ctx) => {
    if (isDead) { g.save(); g.rotate(Math.PI); g.translate(0, 18); }
    // (the wings in layered feathers: up for the hoot, swept back in the swoop, beating otherwise)
    for (const s of [-1, 1]) {
      const tipY = flap < 0 ? -36 : flap === 2 ? -14 : flap ? -28 : -6, tipX = flap === 2 ? s * 12 - 14 : s * 22 - 2;
      const col = s < 0 ? '#9A6A3A' : '#C08A50';
      part(g, () => { g.moveTo(-2, -16); g.lineTo(tipX, tipY); g.lineTo(s * 10 - 2, -5); g.closePath(); }, col, Math.min(-2, tipX), Math.min(-16, tipY), Math.abs(tipX + 2) + 12, 14 + Math.abs(tipY + 5), 1);
      for (let k = 1; k < 4; k++) { const t = k / 4; px(g, -2 + (tipX + 2) * t, -16 + (tipY + 16) * t, 2, 3, dk(col, 0.3)); px(g, -2 + (tipX + 2) * t, -15 + (tipY + 16) * t, 1, 1, '#F5EEDC'); }
    }
    ball(g, 0, -13, 11, '#C8A070', 1.2);
    for (let k = 0; k < 6; k++) px(g, -6 + (k % 3) * 5, -8 + Math.floor(k / 3) * 4, 1, 2, '#8A5A30');
    // (the heart-shaped face, the eyes, the beak)
    part(g, () => { g.moveTo(4, -12); g.quadraticCurveTo(-6, -16, -3, -24); g.quadraticCurveTo(2, -27, 4, -22); g.quadraticCurveTo(6, -27, 11, -24); g.quadraticCurveTo(14, -16, 4, -12); g.closePath(); }, '#F5EEDC', -6, -27, 20, 15, 1);
    if (isDead) { for (const o of [0, 6]) { px(g, o, -20, 3, 1, INK); px(g, o + 1, -21, 1, 3, INK); } }
    else if (hurt) { px(g, 0, -20, 3, 1, INK); px(g, 6, -20, 3, 1, INK); }
    else { for (const o of [0, 6]) { px(g, o, -21, 3, 3, INK); px(g, o, -21, 1, 1, '#FFFFFF'); } }
    px(g, 4, -17, 2, 3, '#E0AE3A'); px(g, 4, -17, 1, 1, '#FFF4B8');
    // (the letter in its talons, its red wax seal; the talons)
    part(g, () => g.rect(-4, -3, 14, 9), '#F5F0DC', -4, -3, 14, 9, 1); px(g, -3, 0, 12, 1, '#C8C0A8'); px(g, 2, 0, 3, 3, '#B91C1C'); px(g, 2, 0, 1, 1, '#E8506A');
    for (const tx of [-1, 6]) px(g, tx, -4, 2, 2, '#4A3A2A');
    if (isDead) g.restore();
  };
  stamp(c, `fa-owl-${flap}-${isDead ? 1 : 0}-${hurt ? 1 : 0}`, -30, -42, 60, 54, paint);
};

export const drawKeg = (c: Ctx, e: Enemy) => {
  if (e.health <= 0 || !e.id) return;
  stamp(c, 'fa-keg', -24, -40, 52, 42, g => {
    // (on its side, in its cradle: oak staves, iron hoops, the brass tap, the tag)
    part(g, () => g.ellipse(0, -17, 18, 17, 0, 0, Math.PI * 2), '#9A6A3A', -18, -34, 36, 34, 1.4);
    for (const x of [-11, -4, 4, 11]) px(g, x, -32, 1, 30, '#6A4424');
    for (const x of [-9, 0, 9]) { px(g, x - 1, -33, 3, 32, INK); px(g, x, -33, 1, 32, '#8A8F98'); px(g, x, -33, 1, 4, '#E8ECF2'); }
    part(g, () => g.roundRect(14, -19, 9, 5, 1), GILT[3], 14, -19, 9, 5, 0.8); part(g, () => g.rect(19, -18, 3, 9), GILT[2], 19, -18, 3, 9, 0.8);
    px(g, 20, -10, 1, 2, '#FFF6C8');
    part(g, () => g.rect(-7, -25, 13, 8), '#F5F0DC', -7, -25, 13, 8, 0.8);
    px(g, -5, -23, 9, 1, '#9B1C1C'); px(g, -5, -21, 7, 1, '#9B1C1C');
    for (const x of [-16, 10]) { px(g, x - 1, -6, 8, 6, INK); px(g, x, -5, 6, 5, '#5A3A24'); }
    dither(g, -14, -10, 28, 4, dk('#9A6A3A', 0.3));
  });
};
