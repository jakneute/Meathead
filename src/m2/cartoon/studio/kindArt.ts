// The studio's staff, drawn (a first pass: crude but clean, on Spooky Land's person drawer, costume.ts, so whoever's in
// the uniform shows: their skin, build and face, man or woman). Each seeded: no two the same. Each drawn hurt (eyes
// shut), knocked about (held, flung, dazed) and dead (limp, crossed-out eyes), so the engine's special deaths all play
// out on their real sprites; dead, what they carried's dropped by them (the flag, the tray and cups, the binder, the
// pencil's point snapped off, the guard's cap). Feet at the origin, facing right (the engine mirrors them). Each frame
// painted once into a stamp.
//
//   guide   a red blazer over a white shirt, a name tag, a headset mic, the tour flag on its pole held out front
//           (leveled and drawn back: the tell; jabbed; a souvenir plate up over her shoulder: the other tell)
//   intern  a rumpled blue shirt, a loosened tie, a lanyard, khakis, bags under the eyes; the cardboard tray of coffees
//           (as many as are left; wobbling: the tell); out of coffee, arms out
//   exec    a big-shouldered suit, a red power tie, a brick phone in the breast pocket, slicked hair; a binder; the
//           laser pointer out at arm's length (aiming); the binder up (the tell) and swung
//   pencil  PENCIL PETE: a yellow six-sided foam pencil from the knees up, the wooden cone and the lead on top, the pink
//           eraser and its band at the bottom, NO. 2 on the side, the performer's face in a hole (rocking: the tell;
//           a corkscrew blur in the spin; dizzy)
//   guard   a gray-blue uniform shirt, a badge, a shoulder radio, a duty belt, a peaked cap, a long black flashlight
//           (up overhead: the tell; the whistle, cheeks out: the other tell; head down in the rush; winded after)

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, ball, flat, limb,
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
const BOX: [number, number, number, number] = [-84, -170, 178, 174];
const face = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired' | 'smug' | 'droopy', mouth: 'flat' | 'grin' | 'smile' | 'teeth' | 'o' | 'smirk' | 'frown') => {
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes, mouth, md: F.md, blink: F.blink });
};
const handsAt = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};
const dead = (F: Frame) => F.md === 'dead';

// ---------------------------------------------------------------------------------------------------------------
// The tour guide

const BLAZER = '#B91C1C';
/** A souvenir plate (white, a blue rim, the studio's star in the middle), its middle at (x, y). */
const plate = (g: Ctx, x: number, y: number, rx = 9, ry = 9) => {
  part(g, () => g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2), '#F8FAFC', x - rx, y - ry, rx * 2, ry * 2, 1);
  g.strokeStyle = '#2563EB'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, rx * 0.75, ry * 0.75, 0, 0, Math.PI * 2); g.stroke();
  px(g, x - 1, y - 1, 3, 3, '#F59E0B');
};
/** The tour flag on its pole, from the hand (hx, hy) out at angle a (the tip's the pointy end). */
const flagPole = (g: Ctx, hx: number, hy: number, a: number, len = 62) => {
  const ca = Math.cos(a), sa = Math.sin(a);
  const bx = hx - ca * 14, by = hy - sa * 14, tx = hx + ca * (len - 14), ty = hy + sa * (len - 14);
  limb(g, bx, by, tx, ty, 2.6, '#E7E5E4');
  // (the tip: a brass point)
  flat(g, () => { g.moveTo(tx + ca * 7, ty + sa * 7); g.lineTo(tx - sa * 2.5, ty + ca * 2.5); g.lineTo(tx + sa * 2.5, ty - ca * 2.5); g.closePath(); }, '#EAB308', 0.8);
  // (the pennant, just under the tip, hanging off it: yellow, a red film reel on it)
  const fx = tx - ca * 6, fy = ty - sa * 6;
  part(g, () => { g.moveTo(fx, fy); g.lineTo(fx - ca * 18 + 2, fy - sa * 18 + 14); g.lineTo(fx - ca * 20, fy - sa * 20); g.closePath(); }, '#FACC15', fx - 22, fy - 20, 26, 36, 1);
  ball(g, fx - ca * 12 + 1, fy - sa * 12 + 5, 2.2, '#DC2626', 0.6);
};
const paintGuide = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const plateUp = F.v === 'plate', pokeBack = F.pose === 'tell' && !plateUp, poke = F.pose === 'strike';
  legs(g, B, { col: '#1E293B', shoe: 'shoe', shoeCol: '#111827' });
  const H = handsAt(B, F, plateUp ? [-B.w / 2 - 8, B.shY - 16] : [-B.w / 2 - 4, B.shY + 18], poke ? [B.w / 2 + 22, B.shY + 12] : pokeBack ? [B.w / 2 - 4, B.shY + 12] : [B.w / 2 + 7, B.shY + 14]);
  if (plateUp && !H.held) plate(g, H.far[0] - 4, H.far[1] - 6);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: BLAZER, hand: L.skin });
  torso(g, B, BLAZER);
  // (the white shirt's V, the lapels, the name tag)
  flat(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(5, B.shY + 1); g.lineTo(0, B.shY + 13); g.closePath(); }, '#F8FAFC', 0.8);
  px(g, -9, B.shY + 2, 4, 12, dk(BLAZER, 0.25)); px(g, 5, B.shY + 2, 4, 12, dk(BLAZER, 0.25));
  px(g, 3, B.shY + 15, 8, 5, '#F8FAFC'); px(g, 4, B.shY + 16, 6, 1, '#DC2626');
  hairBack(g, B);
  face(g, B, F, poke || pokeBack ? 'angry' : 'smug', poke || pokeBack ? 'teeth' : 'grin');
  whiskers(g, B); glasses(g, B); hairTop(g, B);
  // (the headset: over the head, the mic boom round to the mouth)
  g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.arc(B.hx, B.hy - 1, B.rx + 1.5, Math.PI * 1.1, Math.PI * 1.95); g.stroke();
  g.strokeStyle = '#3F3F46'; g.lineWidth = 1.2; g.stroke();
  px(g, B.hx - B.rx - 1, B.hy - 2, 3, 6, '#27272A');
  g.strokeStyle = '#27272A'; g.lineWidth = 1; g.beginPath(); g.moveTo(B.hx - B.rx + 1, B.hy + 3); g.quadraticCurveTo(B.hx + 2, B.hy + 10, B.hx + 6, B.hy + 7); g.stroke();
  px(g, B.hx + 5, B.hy + 6, 2.5, 2.5, '#18181B');
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: BLAZER, hand: L.skin });
  // (the flag: out front and up (its point's always out at him), leveled and drawn back, jabbed; dead: dropped by her)
  if (dead(F)) flagPole(g, B.hx + 6, -3, -0.05, 60);
  else if (!H.held) flagPole(g, H.near[0], H.near[1], pokeBack || poke ? -0.05 : -0.75);
};
export const drawGuide = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['pokeWind', 'plateWind'], ['poke']), e.aiState === 'plateWind' ? 'plate' : '');
  putFrame(c, 'ct-guide', F, BOX, g => paintGuide(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The intern

const SHIRT = '#BFDBFE', KHAKI = '#C8B48A';
const cup = (g: Ctx, x: number, y: number) => {
  part(g, () => { g.moveTo(x - 3.5, y); g.lineTo(x - 2.5, y + 9); g.lineTo(x + 2.5, y + 9); g.lineTo(x + 3.5, y); g.closePath(); }, '#F5F5F4', x - 4, y, 8, 9, 0.8);
  px(g, x - 4, y - 2, 8, 2.5, '#5B3A1E');
  px(g, x - 3, y + 3, 6, 2, '#B45309');
};
const paintIntern = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const cups = Number(F.v[1] ?? 4), wobble = F.pose === 'tell' && F.v[0] === 'c', shove = F.pose === 'strike', shoveBack = F.pose === 'tell' && F.v[0] === 's';
  legs(g, B, { col: KHAKI, shoe: 'sneaker', shoeCol: '#57534E' });
  const empty = cups <= 0;
  const H = handsAt(B, F, empty ? (shove ? [B.w / 2 + 14, B.shY + 8] : [-B.w / 2 - 6, B.shY + 12]) : [B.w / 2 - 2, B.shY + 22],
    empty ? (shove ? [B.w / 2 + 20, B.shY + 12] : shoveBack ? [B.w / 2 - 6, B.shY + 14] : [B.w / 2 + 10, B.shY + 10]) : [B.w / 2 + 14, B.shY + 22]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: SHIRT, hand: L.skin, len: 0.5 });
  torso(g, B, SHIRT);
  // (the tie, loosened, askew; the lanyard and its badge)
  flat(g, () => { g.moveTo(-1, B.shY + 3); g.lineTo(3, B.shY + 3); g.lineTo(5, B.shY + 19); g.lineTo(1, B.shY + 21); g.closePath(); }, '#7C2D12', 0.8);
  g.strokeStyle = '#2563EB'; g.lineWidth = 1; g.beginPath(); g.moveTo(-5, B.shY + 1); g.lineTo(-3, B.shY + 16); g.lineTo(3, B.shY + 1); g.stroke();
  px(g, -6, B.shY + 15, 6, 8, '#F8FAFC'); px(g, -5, B.shY + 16, 4, 2, '#1E3A8A');
  px(g, -B.w / 2 + 2, B.hipY - 3, 5, 3, '#F8FAFC');
  hairBack(g, B);
  face(g, B, F, wobble || shoveBack ? 'wide' : 'tired', wobble ? 'o' : shove ? 'teeth' : 'flat');
  // (bags under the eyes)
  if (!dead(F)) { px(g, B.hx, B.hy + 2, 3, 1, dk(L.skin, 0.25)); px(g, B.hx + 5, B.hy + 2, 3, 1, dk(L.skin, 0.25)); }
  whiskers(g, B); glasses(g, B); hairTop(g, B);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: SHIRT, hand: L.skin, len: 0.5 });
  // (the tray of coffees, held out in both hands; wobbling; dead: down and spilled by him)
  const tray = (x: number, y: number, a: number, n: number) => {
    g.save(); g.translate(x, y); g.rotate(a);
    part(g, () => g.rect(-14, 0, 28, 4), '#A47148', -14, 0, 28, 4, 1);
    for (let k = 0; k < n; k++) cup(g, -10 + k * 6.6, -9);
    g.restore();
  };
  if (dead(F)) { tray(B.hx + 26, -4, 0.5, 1); px(g, B.hx + 16, -2, 22, 2, '#7C4A1E'); }
  else if (!empty && !H.held) tray((H.far[0] + H.near[0]) / 2, H.near[1] - 2, wobble ? (F.fr % 2 ? 0.22 : -0.22) : 0.03, cups);
};
export const drawIntern = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const cups = (e as { cups?: number }).cups ?? 4;
  const tell = e.aiState === 'wobble' ? 'c' : e.aiState === 'shoveWind' ? 's' : 'c';
  // (the wobble's two frames)
  const F0 = frameFor(e, f, seed, poseOf(e, ['wobble', 'shoveWind'], ['shove']), `${tell}${cups}`);
  const F = F0.pose === 'tell' ? { ...F0, fr: (f >> 3) % 2 } : F0;
  putFrame(c, 'ct-intern', F, BOX, g => paintIntern(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The pitch exec

const SUITS = ['#374151', '#1E3A5F', '#3F3F46', '#4A3B2A'];
/** The binder, its middle at (x, y), turned a. */
const binder = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-8, -11, 16, 22, 1.5), '#1D4ED8', -8, -11, 16, 22, 1);
  px(g, -8, -11, 3, 22, '#1E3A8A'); px(g, -2, -5, 8, 4, '#F8FAFC');
  g.restore();
};
const paintExec = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, SUIT = pickOf(F.seed, 3, SUITS);
  const aim = F.v === 'aim' || F.v === 'lock', swatBack = F.pose === 'tell', swat = F.pose === 'strike';
  legs(g, B, { col: SUIT, shoe: 'shoe', shoeCol: '#1C1917' });
  const H = handsAt(B, F, swatBack ? [B.hx - 6, B.hy - 22] : swat ? [B.w / 2 + 18, B.shY + 4] : [-B.w / 2 + 2, B.shY + 14],
    aim ? [B.w / 2 + 24, B.shY + 4] : [B.w / 2 + 6, B.shY + 18]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: SUIT, hand: L.skin });
  if (!H.held) binder(g, H.far[0] + 2, H.far[1] - 4, swatBack ? -1.2 : swat ? 0.4 : 0.1);
  // (the suit: shoulders out to here; the lapels, the white V, the power tie, the brick phone)
  torso(g, B, SUIT, B.shY - 1, B.hipY + 2, 6);
  flat(g, () => { g.moveTo(-5, B.shY + 1); g.lineTo(5, B.shY + 1); g.lineTo(0, B.shY + 16); g.closePath(); }, '#F8FAFC', 0.8);
  flat(g, () => { g.moveTo(-1.5, B.shY + 3); g.lineTo(1.5, B.shY + 3); g.lineTo(2.5, B.shY + 15); g.lineTo(0, B.shY + 18); g.lineTo(-2.5, B.shY + 15); g.closePath(); }, '#DC2626', 0.7);
  px(g, -12, B.shY + 2, 5, 14, dk(SUIT, 0.3)); px(g, 7, B.shY + 2, 5, 14, dk(SUIT, 0.3));
  px(g, -10, B.shY + 8, 4, 7, '#18181B'); px(g, -9, B.shY + 2, 1.5, 6, '#18181B');
  hairBack(g, B);
  face(g, B, F, swatBack || swat ? 'angry' : aim ? 'smug' : 'smug', swat ? 'teeth' : aim ? 'smirk' : 'smirk');
  whiskers(g, B); glasses(g, B);
  // (slicked back: a shine down it)
  hairTop(g, B); if (!B.L.bald) px(g, B.hx - 4, B.hy - 9, 7, 1, lt(L.hair, 0.4));
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: SUIT, hand: L.skin });
  // (the laser pointer: a silver pen, its red end lit when it's on)
  if (!H.held) {
    g.save(); g.translate(H.near[0], H.near[1]); g.rotate(aim ? -0.08 : 0.9);
    px(g, -2, -1.2, 11, 2.4, '#D4D4D8'); px(g, 8, -1.2, 2, 2.4, aim ? '#FF3B3B' : '#7F1D1D');
    g.restore();
  }
  if (dead(F)) binder(g, B.hx + 28, -4, 1.4);
};
export const drawExec = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const F = frameFor(e, f, seed, poseOf(e, ['swatWind'], ['swat']), e.aiState === 'aim' || e.aiState === 'lock' ? 'aim' : '');
  putFrame(c, 'ct-exec', F, BOX, g => paintExec(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// Pencil Pete

const YEL = '#F2C230', WOOD = '#E8C28A', LEAD = '#3F3F46', ERASER = '#F49AB0', FERRULE = '#C0C4CC';
/** The foam pencil from its eraser (y0, at the bottom) up to the lead's tip; `sq` squashed across (the spin's turn),
 *  `face` drawn on the side we see; `snapped` the point's broken off. */
const foamPencil = (g: Ctx, B: Body, F: Frame, sq: number, faceOn_: boolean, snapped: boolean) => {
  const w = 22 * sq, top = -100, cone = -122, tip = -132;
  // (the eraser and its band)
  part(g, () => g.roundRect(-w + 2, -30, (w - 2) * 2, 12, 5), ERASER, -w + 2, -30, (w - 2) * 2, 12, 1.2);
  part(g, () => g.rect(-w, -42, w * 2, 13), FERRULE, -w, -42, w * 2, 13, 1.2);
  for (let k = 0; k < 3; k++) px(g, -w, -40 + k * 4, w * 2, 1, dk(FERRULE, 0.3));
  // (the six sides: three we can see, the middle one widest)
  part(g, () => g.rect(-w, top, w * 2, -42 - top), YEL, -w, top, w * 2, -42 - top, 1.4);
  if (sq > 0.5) { px(g, -w * 0.35, top + 1, 1.5, -44 - top, dk(YEL, 0.2)); px(g, w * 0.35, top + 1, 1.5, -44 - top, dk(YEL, 0.3)); }
  // (NO. 2 on the side, in its gold foil; PENCIL PETE down the side)
  if (sq > 0.7 && !faceOn_) { px(g, -6, -60, 12, 2, '#B45309'); }
  if (sq > 0.7) {
    g.fillStyle = INK; g.font = '5px "Press Start 2P"'; g.textAlign = 'center';
    g.fillText('NO.2', w * 0.45, -48); g.textAlign = 'left';
  }
  // (the wooden cone, shaved, and the lead)
  if (!snapped) {
    part(g, () => { g.moveTo(-w, top); g.lineTo(w, top); g.lineTo(w * 0.28, cone); g.lineTo(-w * 0.28, cone); g.closePath(); }, WOOD, -w, cone, w * 2, top - cone, 1.2);
    for (let k = -2; k <= 2; k++) { g.strokeStyle = dk(WOOD, 0.18); g.lineWidth = 0.8; g.beginPath(); g.moveTo(k * w * 0.4, top - 1); g.quadraticCurveTo(k * w * 0.25, top - 6, k * w * 0.14, cone + 2); g.stroke(); }
    part(g, () => { g.moveTo(-w * 0.28, cone); g.lineTo(w * 0.28, cone); g.lineTo(0, tip); g.closePath(); }, LEAD, -w * 0.28, tip, w * 0.56, cone - tip, 1.2);
    px(g, -1, tip + 2, 1.5, 4, lt(LEAD, 0.4));
  } else {
    // (snapped: a jagged stump of wood)
    part(g, () => { g.moveTo(-w, top); g.lineTo(w, top); g.lineTo(w * 0.7, top - 8); g.lineTo(w * 0.2, top - 4); g.lineTo(-w * 0.3, top - 9); g.lineTo(-w * 0.8, top - 5); g.closePath(); }, WOOD, -w, top - 9, w * 2, 9, 1.2);
  }
  // (the face hole, the performer in it)
  if (faceOn_) {
    const hx = 3, hy = -76;
    flat(g, () => g.ellipse(hx, hy, 11, 12, 0, 0, Math.PI * 2), INK, 0);
    const FB = { ...B, hx, hy, rx: 9, ry: 10 };
    part(g, () => g.ellipse(hx, hy, 9, 10, 0, 0, Math.PI * 2), B.L.skin, hx - 9, hy - 10, 18, 20, 1);
    faceOn(g, FB, { skin: B.L.skin, eyes: F.pose === 'tell' ? 'wide' : F.v === 'z' ? 'tired' : 'open', mouth: F.pose === 'tell' ? 'teeth' : F.v === 'z' ? 'o' : 'grin', md: F.md, blink: F.blink });
    // (sweat: it's a hundred degrees in there)
    px(g, hx + 8, hy - 6, 2, 3, '#BFE8FF');
  }
};
const paintPencil = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const spin = F.pose === 'strike', rock = F.pose === 'tell', bumpy = F.v === 'b';
  const sq = spin ? [1, 0.55, 0.2, 0.55][F.fr % 4] : 1;
  const faceSide = !spin || F.fr % 4 === 0;
  // (the performer's legs out the bottom: black tights, big sneakers)
  legs(g, B, { col: '#1F2937', shoe: 'sneaker', shoeCol: '#F8FAFC' });
  g.save();
  if (rock) { g.translate(0, -20); g.rotate(F.fr % 2 ? 0.14 : -0.14); g.translate(0, 20); }
  if (bumpy) { g.translate(0, -20); g.rotate(0.22); g.translate(0, 20); }
  if (dead(F)) { /* (the engine lays him down) */ }
  // (the far arm out its hole)
  const H = handsAt(B, F, spin ? [-30 * sq, -76] : [-30, -54], spin ? [30 * sq, -76] : bumpy ? [26, -60] : [28, -54 + (F.fr % 2) * 2]);
  if (sq > 0.3) limb(g, -18 * sq, -66, H.far[0], H.far[1], 6, YEL);
  if (sq > 0.3) ball(g, H.far[0], H.far[1], 4.5, '#F8FAFC', 1);
  foamPencil(g, B, F, sq, faceSide, dead(F));
  if (sq > 0.3) { limb(g, 18 * sq, -66, H.near[0], H.near[1], 6, YEL); ball(g, H.near[0], H.near[1], 4.5, '#F8FAFC', 1); }
  g.restore();
  // (dead: the point lying snapped off by him)
  if (dead(F)) {
    g.save(); g.translate(40, -6); g.rotate(1.5);
    part(g, () => { g.moveTo(-8, 0); g.lineTo(8, 0); g.lineTo(2, -18); g.lineTo(-2, -18); g.closePath(); }, WOOD, -8, -18, 16, 18, 1);
    part(g, () => { g.moveTo(-2, -18); g.lineTo(2, -18); g.lineTo(0, -26); g.closePath(); }, LEAD, -2, -26, 4, 8, 1);
    g.restore();
  }
  void L;
};
export const drawPencil = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const F0 = frameFor(e, f, seed, poseOf(e, ['wind'], ['spin']), st === 'dizzy' ? 'z' : st === 'bumpWind' || st === 'bump' ? 'b' : '');
  // (the spin's turn and the rocking: their own frames)
  const F = F0.pose === 'strike' ? { ...F0, fr: (f >> 1) % 4 } : F0.pose === 'tell' ? { ...F0, fr: (f >> 3) % 2 } : F0;
  putFrame(c, 'ct-pencil', F, [-90, -200, 190, 204], g => paintPencil(g, F));
  if (st === 'spin' && e.health > 0) {
    // (the blur lines either side)
    c.strokeStyle = 'rgba(26,11,6,0.6)'; c.lineWidth = 2;
    for (let k = 0; k < 3; k++) { const y = -96 + k * 26; c.beginPath(); c.moveTo(-34, y); c.quadraticCurveTo(-40, y + 8, -34, y + 16); c.stroke(); c.beginPath(); c.moveTo(34, y); c.quadraticCurveTo(40, y + 8, 34, y + 16); c.stroke(); }
  }
  if (st === 'dizzy' && e.health > 0) {
    for (let i = 0; i < 3; i++) { const a = f * 0.2 + (i / 3) * Math.PI * 2; c.fillStyle = INK; c.fillRect(Math.round(Math.cos(a) * 16) - 2, -142 + Math.round(Math.sin(a) * 4) - 2, 5, 5); c.fillStyle = '#FDE047'; c.fillRect(Math.round(Math.cos(a) * 16) - 1, -142 + Math.round(Math.sin(a) * 4) - 1, 3, 3); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Studio security

const UNIFORM = '#8FA3BF', NAVY = '#1F2937';
const cap = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => { g.moveTo(-9, 0); g.lineTo(-10, -7); g.quadraticCurveTo(0, -12, 11, -7); g.lineTo(10, 0); g.closePath(); }, NAVY, -10, -12, 21, 12, 1);
  part(g, () => g.roundRect(-2, -1, 16, 3.5, 1.5), '#0B0F19', -2, -1, 16, 3.5, 0.9);
  px(g, 0, -7, 4, 4, '#E5E7EB');
  g.restore();
};
const flashlight = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-6, -2.5, 28, 5, 1.5), '#18181B', -6, -2.5, 28, 5, 1);
  part(g, () => g.roundRect(20, -4, 7, 8, 1.5), '#27272A', 20, -4, 7, 8, 1);
  px(g, 26, -2.5, 1.5, 5, '#E5E7EB');
  g.restore();
};
const paintGuard = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const raise = F.v === 'raise', whistle = F.v === 'whistle', rush = F.v === 'rush', bonk = F.pose === 'strike' && !rush, winded = F.v === 'winded';
  g.save();
  if (rush) { g.translate(0, -4); g.rotate(0.2); }
  if (winded) { B.feet = [-6, 6]; }
  legs(g, B, { col: NAVY, shoe: 'boot', shoeCol: '#0B0F19' });
  if (winded) { g.translate(4, -32); g.rotate(0.42); g.translate(-4, 32); }
  const H = handsAt(B, F,
    winded ? [B.w / 2 - 2, -12] : rush ? [B.w / 2 + 10, B.shY + 8] : raise ? [B.hx + 2, B.hy - 26] : [-B.w / 2 - 6, B.shY + 18],
    winded ? [B.w / 2 + 10, -14] : rush ? [B.w / 2 + 16, B.shY + 14] : raise ? [B.hx + 8, B.hy - 24] : bonk ? [B.w / 2 + 18, B.shY + 8] : whistle ? [B.hx + 8, B.hy + 7] : [B.w / 2 + 6, B.shY + 20]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: UNIFORM, hand: L.skin, len: 0.55 });
  // (the shirt: a belly on him, the epaulettes, the badge, the pocket flaps, the duty belt)
  torso(g, B, UNIFORM, B.shY, B.hipY + 2, 6);
  part(g, () => g.ellipse(4, B.hipY - 8, B.w * 0.5, 10, 0, 0, Math.PI * 2), UNIFORM, 4 - B.w * 0.5, B.hipY - 18, B.w, 20, 1);
  px(g, -B.w / 2 - 2, B.shY, 8, 3, NAVY); px(g, B.w / 2 - 4, B.shY, 8, 3, NAVY);
  flat(g, () => { g.moveTo(5, B.shY + 6); g.lineTo(11, B.shY + 6); g.lineTo(11, B.shY + 11); g.lineTo(8, B.shY + 14); g.lineTo(5, B.shY + 11); g.closePath(); }, '#E5C158', 0.8);
  px(g, -10, B.shY + 7, 7, 4, dk(UNIFORM, 0.18));
  part(g, () => g.rect(-B.hipW / 2 - 3, B.hipY - 2, B.hipW + 8, 5), '#111827', -B.hipW / 2 - 3, B.hipY - 2, B.hipW + 8, 5, 1);
  px(g, 0, B.hipY - 2, 5, 5, '#D4D4D8');
  // (the radio on his shoulder)
  part(g, () => g.roundRect(-B.w / 2 + 1, B.shY - 4, 6, 9, 1), '#18181B', -B.w / 2 + 1, B.shY - 4, 6, 9, 0.9);
  px(g, -B.w / 2 + 2, B.shY - 10, 1, 6, '#18181B');
  hairBack(g, B);
  face(g, B, F, whistle ? 'wide' : raise || bonk || rush ? 'angry' : winded ? 'tired' : 'droopy', whistle ? 'o' : raise || bonk || rush ? 'teeth' : winded ? 'o' : 'frown');
  whiskers(g, B); glasses(g, B);
  // (the whistle in, his cheeks out)
  if (whistle && !dead(F)) { px(g, B.hx + 7, B.hy + 5, 6, 3, '#D4D4D8'); ball(g, B.hx + 1, B.hy + 3, 2.6, lt(L.skin, 0.1), 0.6); }
  if (dead(F)) { hairTop(g, B); cap(g, B.hx + 30, -3, 0.25); } else cap(g, B.hx, B.hy - 7, -0.04);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: UNIFORM, hand: L.skin, len: 0.55 });
  if (!H.held && !whistle) flashlight(g, H.near[0], H.near[1], raise ? -2.3 : bonk ? 0.7 : rush ? -0.3 : winded ? 1.4 : 1.35);
  if (!H.held && whistle) flashlight(g, H.far[0], H.far[1], 1.4);
  g.restore();
};
export const drawGuard = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = st === 'raise' ? 'raise' : st === 'whistle' ? 'whistle' : st === 'rush' ? 'rush' : st === 'winded' ? 'winded' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['raise', 'whistle'], ['bonk', 'rush']), v);
  putFrame(c, 'ct-guard', F, BOX, g => paintGuard(g, F));
  // (winded: little puffs of breath)
  if (st === 'winded' && e.health > 0 && (f >> 4) % 2) { c.fillStyle = 'rgba(241,245,249,0.7)'; c.beginPath(); c.arc(30 + (f % 16), -46 - (f % 16) * 0.4, 3, 0, Math.PI * 2); c.fill(); }
};
