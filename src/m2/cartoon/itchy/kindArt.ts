// PUNCHY & KICKY's cast, drawn (a first pass: crude but clean, on Spooky Land's person drawer, costume.ts, so whoever's
// in the costume shows: their build, man or woman; the crew's faces). Each seeded: no two the same. Each drawn hurt,
// knocked about (held, flung, dazed) and dead (limp, crossed-out eyes); dead, the costume gives (the cat's head off,
// the mouse's head off: the sweaty performer underneath; the host's top hat rolled off; the stagehand's headset off).
// Feet at the origin, facing right (the engine mirrors them: no lettering on them). Painted once per frame into a stamp.
//
//   punchy     PUNCHY the cat: a ginger fur suit with darker stripes, white cartoon gloves, the big costume head (a torn
//              ear with a sticking plaster, stitches across the brow, one eye bigger than the other, a grin with a tooth
//              out, whiskers), a tail; the mallet (a wooden barrel of a head, banded, a smear of stage blood). Up over
//              his head: the tell; down in front: the hit; crouched with it cocked back: the leap's tell; stuck in
//              the floor, tugging: his window.
//   kicky      KICKY the mouse: a grey-tan fur suit, a pink tail, red high-tops with striped tube socks, the costume
//              head (huge round pink-lined ears, a long snout, a pink nose, buck teeth, wild eyes); a meat cleaver held
//              out in front (drawn back with a glint: the tell); or (the dynamite one) a bandolier of red sticks, a
//              stick fizzing in his hand (the tell), fingers in his ears after. Up on one foot, knee up: the kick's tell.
//   host       the HOST: a red tailcoat spattered with stage blood, a white shirt, a black bow tie, a top hat, a white
//              bullhorn (up: the tell), a black cane with a silver knob (raised: the other tell).
//   stagehand  a STAGEHAND: all black (a long-sleeve, cargo pants), a headset, tan work gloves, a silver roll of gaffer
//              tape on the belt; a folded portable hole held up (the tell); a sandbag over the shoulder (the other).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, ball, limb,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame,
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
const BOX: [number, number, number, number] = [-110, -190, 230, 196];
const handsAt = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};
const dead = (F: Frame) => F.md === 'dead';
/** The performer's own face (the costume head off): sweaty, the hair flat. */
const performer = (g: Ctx, B: Body, F: Frame, suit = '#A8A29E') => {
  // (the fur suit's neck ring where the head sat, its velcro tab; a towel of sweat on the collar)
  part(g, () => g.ellipse(B.hx - 1, B.shY + 1, B.rx + 3, 4, 0, 0, Math.PI * 2), dk(suit, 0.15), B.hx - B.rx - 4, B.shY - 3, B.rx * 2 + 6, 8, 1);
  px(g, B.hx - 4, B.shY - 1, 8, 2, '#E5E7EB');
  hairBack(g, B);
  headShape(g, B, B.L.skin);
  faceOn(g, B, { skin: B.L.skin, eyes: 'open', mouth: 'o', md: F.md, blink: F.blink });
  whiskers(g, B); hairTop(g, B);
  // (sweat: beads on the brow, the hair matted flat in strands, a flush on the cheek)
  px(g, B.hx + B.rx - 2, B.hy - 4, 2, 3, '#BFE8FF'); px(g, B.hx - 2, B.hy - B.ry * 0.5, 2, 2, '#BFE8FF'); px(g, B.hx + 3, B.hy - B.ry * 0.3, 1, 2, '#E0F4FF');
  for (let k = 0; k < 3; k++) px(g, B.hx - B.rx * 0.6 + k * B.rx * 0.5, B.hy - B.ry * 0.85, 1, 4, dk(B.L.hair, 0.3));
  g.globalAlpha = 0.35; px(g, B.hx + B.rx * 0.2, B.hy + 1, 4, 2, '#F87171'); g.globalAlpha = 1;
};
/** A stage-blood splat (a costume's, a prop's). */
const splat = (g: Ctx, x: number, y: number, r: number) => {
  g.fillStyle = '#B91C1C';
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 5; i++) { const a = i * 1.3 + r; g.beginPath(); g.arc(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3, r * 0.35, 0, Math.PI * 2); g.fill(); }
  px(g, x - r * 0.4, y - r * 0.5, Math.max(1, r * 0.4), 1, '#FCA5A5');
};

// ---------------------------------------------------------------------------------------------------------------
// Punchy

const GINGER = '#EA8A2E', GINGER_DK = '#B45309', MUZZLE = '#FFF4E0', GLOVE = '#FAFAFA';
/** Punchy's costume head (its middle at x, y; r its size), facing right; `a` a tilt. */
export const catHead = (g: Ctx, x: number, y: number, r: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  // (the ears: the near one whole, the far one torn, a sticking plaster across the tear)
  part(g, () => { g.moveTo(-r * 0.9, -r * 0.5); g.lineTo(-r * 0.75, -r * 1.45); g.lineTo(-r * 0.15, -r * 0.85); g.closePath(); }, GINGER, -r, -r * 1.5, r, r, 1.2);
  part(g, () => { g.moveTo(r * 0.1, -r * 0.85); g.lineTo(r * 0.55, -r * 1.55); g.lineTo(r * 0.62, -r * 1.2); g.lineTo(r * 0.78, -r * 1.25); g.lineTo(r * 0.85, -r * 0.5); g.closePath(); }, GINGER, 0, -r * 1.6, r, r, 1.2);
  px(g, -r * 0.62, -r * 1.12, 4, 6, '#F9A8D4');
  g.save(); g.translate(r * 0.62, -r * 1.12); g.rotate(0.5); part(g, () => g.rect(-5, -2, 10, 4), '#F5D0A9', -5, -2, 10, 4, 0.8); px(g, -1, -1, 1, 1, dk('#F5D0A9', 0.3)); px(g, 1, 0, 1, 1, dk('#F5D0A9', 0.3)); g.restore();
  // (the head: a big ginger ball, darker stripes over the top)
  part(g, () => g.ellipse(0, 0, r, r * 0.92, 0, 0, Math.PI * 2), GINGER, -r, -r, r * 2, r * 2, 1.4);
  // (the stripes over the top, each stepped: a dark core, a lit edge; fur tufts at the cheeks)
  for (let i = 0; i < 3; i++) { px(g, -r * 0.5 + i * r * 0.32, -r * 0.88, 2, r * 0.3, GINGER_DK); px(g, -r * 0.5 + i * r * 0.32 - 1, -r * 0.88, 1, r * 0.22, lt(GINGER, 0.3)); }
  for (const [tx, ty] of [[-r * 0.98, r * 0.1], [-r * 0.9, r * 0.32]] as [number, number][]) { g.fillStyle = INK; g.beginPath(); g.moveTo(tx + 2, ty - 3); g.lineTo(tx - 4, ty); g.lineTo(tx + 2, ty + 3); g.closePath(); g.fill(); px(g, tx - 1, ty - 1, 3, 2, GINGER); }
  // (stitches across the brow, a bead of blood at each end)
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(-r * 0.55, -r * 0.42); g.lineTo(r * 0.15, -r * 0.5); g.stroke();
  for (let i = 0; i < 4; i++) { const sx = -r * 0.48 + i * r * 0.2; g.beginPath(); g.moveTo(sx, -r * 0.58); g.lineTo(sx + 1, -r * 0.34); g.stroke(); }
  px(g, -r * 0.58, -r * 0.44, 2, 2, '#B91C1C'); px(g, r * 0.16, -r * 0.52, 2, 2, '#B91C1C'); px(g, r * 0.17, -r * 0.48, 1, 2, '#DC2626');
  // (the muzzle: a white bulge out front)
  part(g, () => g.ellipse(r * 0.45, r * 0.38, r * 0.62, r * 0.45, 0, 0, Math.PI * 2), MUZZLE, -r * 0.2, 0, r * 1.3, r * 0.9, 1);
  ball(g, r * 0.95, r * 0.12, r * 0.16, '#F472B6', 1);
  // (the eyes: the near one big and mad, the far one small; pupils pinned)
  part(g, () => g.ellipse(r * 0.42, -r * 0.18, r * 0.3, r * 0.36, 0, 0, Math.PI * 2), '#FFFFFF', r * 0.1, -r * 0.55, r * 0.64, r * 0.74, 1);
  part(g, () => g.ellipse(-r * 0.1, -r * 0.12, r * 0.18, r * 0.24, 0, 0, Math.PI * 2), '#FFFFFF', -r * 0.3, -r * 0.38, r * 0.4, r * 0.5, 1);
  ball(g, r * 0.5, -r * 0.14, r * 0.1, INK, 0); ball(g, -r * 0.04, -r * 0.1, r * 0.07, INK, 0);
  px(g, r * 0.46, -r * 0.2, Math.max(1, r * 0.06), Math.max(1, r * 0.06), '#FFFFFF');
  // (the mad eye's bloodshot veins)
  g.strokeStyle = '#EF4444'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(r * 0.7, -r * 0.24); g.lineTo(r * 0.58, -r * 0.2); g.moveTo(r * 0.68, -r * 0.02); g.lineTo(r * 0.57, -r * 0.08); g.moveTo(r * 0.2, -r * 0.3); g.lineTo(r * 0.32, -r * 0.22); g.stroke();
  // (the grin: wide, gums, teeth, one out)
  part(g, () => { g.moveTo(r * 0.0, r * 0.45); g.quadraticCurveTo(r * 0.5, r * 0.95, r * 1.0, r * 0.4); g.quadraticCurveTo(r * 0.5, r * 0.62, r * 0.0, r * 0.45); g.closePath(); }, '#7F1D1D', 0, r * 0.4, r, r * 0.55, 1);
  px(g, r * 0.3, r * 0.68, r * 0.4, Math.max(1, r * 0.08), '#F472B6');
  for (let i = 0; i < 5; i++) if (i !== 2) { px(g, r * 0.14 + i * r * 0.17, r * 0.5 + (i === 0 || i === 4 ? -1 : 0), r * 0.13, r * 0.16, '#FFFFFF'); px(g, r * 0.14 + i * r * 0.17 + r * 0.09, r * 0.5, Math.max(1, r * 0.04), r * 0.16, '#D4D4D8'); }
  // (whiskers)
  g.strokeStyle = INK; g.lineWidth = 0.8; for (const s of [-1, 0, 1]) { g.beginPath(); g.moveTo(r * 0.85, r * 0.3); g.lineTo(r * 1.5, r * 0.22 + s * r * 0.18); g.stroke(); }
  g.restore();
};
/** The mallet: its handle's grip at (x, y), pointing at angle `a` (0: straight up), the head on the end. */
export const mallet = (g: Ctx, x: number, y: number, a: number, len = 46, head = 22) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.rect(-2.5, -len, 5, len + 6), '#C2853F', -2.5, -len, 5, len + 6, 1);
  px(g, -1.5, -len, 1.5, len, '#E0B17A');
  // (a grip of tape round the handle's foot)
  for (let k = 0; k < 3; k++) px(g, -2.5, -8 + k * 4, 5, 2, '#7F1D1D');
  // (the head: a barrel across the handle's end, banded (iron hoops, their rivets), a smear of blood on the face)
  part(g, () => g.roundRect(-head * 0.85, -len - head * 0.6, head * 1.7, head * 0.9, 3), '#D9A066', -head * 0.85, -len - head * 0.6, head * 1.7, head * 0.9, 1.2);
  px(g, -head * 0.85, -len - head * 0.6, head * 1.7, 3, '#EBC08E');
  for (const bx of [-head * 0.6, head * 0.45]) { px(g, bx, -len - head * 0.6, 3, head * 0.9, '#5A5A6A'); px(g, bx, -len - head * 0.6, 1, head * 0.9, '#A1A1AA'); px(g, bx + 1, -len - head * 0.35, 1, 1, '#E4E4E7'); }
  for (let k = 0; k < 3; k++) px(g, -head * 0.3 + k * head * 0.25, -len - head * 0.2 + (k % 2) * 3, head * 0.18, 1, '#B07A45');
  splat(g, head * 0.72, -len - head * 0.15, 2.5);
  g.restore();
};
const paintPunchy = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr);
  const up = F.v === 'up', down = F.v === 'down', crouch = F.v === 'crouch', leap = F.v === 'leap', stuck = F.v === 'stuck';
  g.save();
  if (crouch) { g.translate(0, 8); g.scale(1, 0.88); }
  if (stuck) B.lean = 6;
  // (the tail: behind him, a crook in it)
  g.strokeStyle = INK; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-B.hipW / 2 + 2, B.hipY + 2); g.quadraticCurveTo(-26, B.hipY - 4 + (F.fr % 2) * 2, -22, B.hipY - 26); g.stroke();
  g.strokeStyle = GINGER; g.lineWidth = 4.5; g.stroke();
  g.strokeStyle = lt(GINGER, 0.3); g.lineWidth = 1.2; g.beginPath(); g.moveTo(-B.hipW / 2 + 1, B.hipY + 1); g.quadraticCurveTo(-27, B.hipY - 5 + (F.fr % 2) * 2, -23, B.hipY - 25); g.stroke();
  // (the tail's crook bandaged, its tip a dark tuft)
  px(g, -26, B.hipY - 14, 6, 3, '#F5F0E1'); px(g, -26, B.hipY - 14, 6, 1, '#FFFFFF');
  ball(g, -22, B.hipY - 27, 3.5, GINGER_DK, 1);
  legs(g, B, { col: GINGER, shoe: 'paw', shoeCol: GINGER });
  const H = handsAt(B, F,
    up ? [B.hx - 4, B.hy - 30] : down ? [B.w / 2 + 16, B.shY + 26] : crouch ? [-B.w / 2 - 12, B.shY + 4] : leap ? [B.hx - 2, B.hy - 28] : stuck ? [B.w / 2 + 14, B.shY + 22] : [-B.w / 2 - 4, B.shY + 18],
    up ? [B.hx + 6, B.hy - 32] : down ? [B.w / 2 + 24, B.shY + 24] : crouch ? [-B.w / 2 - 4, B.shY + 2] : leap ? [B.hx + 8, B.hy - 30] : stuck ? [B.w / 2 + 22, B.shY + 20] : [B.w / 2 + 8, B.shY + 14]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: GINGER_DK, hand: GLOVE });
  torso(g, B, GINGER, B.shY, B.hipY + 4, 4);
  // (the belly patch, stripes on the sides (lit edges), the suit's zip up the back, a stitched seam, stage blood)
  part(g, () => g.ellipse(3, (B.shY + B.hipY) / 2 + 4, 7, 11, 0, 0, Math.PI * 2), MUZZLE, -4, B.shY + 6, 14, 22, 0.8);
  for (let i = 0; i < 3; i++) { px(g, -B.w / 2, B.shY + 6 + i * 7, 5, 2, GINGER_DK); px(g, -B.w / 2, B.shY + 5 + i * 7, 4, 1, lt(GINGER, 0.3)); }
  for (let k = 0; k < 5; k++) px(g, -B.w / 2 + 1, B.shY + 3 + k * 5, 2, 2, '#A1A1AA');
  g.strokeStyle = GINGER_DK; g.lineWidth = 0.8; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(B.w / 2 - 3, B.shY + 6 + k * 6); g.lineTo(B.w / 2 - 1, B.shY + 8 + k * 6); g.stroke(); }
  splat(g, -4, B.shY + 12, 2); splat(g, 6, B.hipY - 2, 1.5);
  if (dead(F)) { performer(g, B, F, GINGER); catHead(g, B.hx + 40, -14, 13, 1.9); splat(g, B.hx + 30, -3, 2.5); }
  else catHead(g, B.hx + 1, B.hy - 5, 15, crouch ? 0.15 : leap ? -0.12 : 0);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: GINGER, hand: GLOVE });
  g.restore();
  // (the mallet: in both hands (up over his head, down in front, cocked back), in the near hand walking; dead or
  // knocked about, dropped beside him)
  if (dead(F) || H.held) { mallet(g, -36, -4, -1.45, 40, 20); return; }
  if (up || leap) mallet(g, (H.far[0] + H.near[0]) / 2, (H.far[1] + H.near[1]) / 2, -0.25, 46, 24);
  else if (down) mallet(g, H.near[0], H.near[1], 1.75, 44, 24);
  else if (stuck) mallet(g, H.near[0], H.near[1], 2.4, 40, 24);
  else if (crouch) mallet(g, H.near[0], H.near[1] + 8, -1.9, 44, 24);
  else mallet(g, H.near[0], H.near[1], 0.55, 42, 22);
};
export const drawPunchy = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = st === 'slamWind' ? 'up' : st === 'slam' ? 'down' : st === 'crouch' ? 'crouch' : st === 'leap' ? 'leap' : st === 'stuck' ? 'stuck' : '';
  const F = frameFor(e, f, seed, st === 'leap' ? 'fly' : poseOf(e, ['slamWind', 'crouch'], ['slam', 'stuck']), v);
  putFrame(c, 'ct-punchy', { ...F, fr: st === 'stuck' ? Math.floor(f / 7) % 2 : F.fr }, BOX, g => paintPunchy(g, { ...F, fr: st === 'stuck' ? Math.floor(f / 7) % 2 : F.fr }));
};

// ---------------------------------------------------------------------------------------------------------------
// Kicky

const MOUSE = '#A8A29E', MOUSE_DK = '#78716C', PINK = '#F9A8D4', SNEAK = '#DC2626';
/** Kicky's costume head (its middle at x, y), facing right; `a` a tilt. */
export const mouseHead = (g: Ctx, x: number, y: number, r: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  // (the ears: two huge round ones, pink inside)
  for (const [ex, ey, er] of [[-r * 0.75, -r * 0.95, r * 0.72], [r * 0.35, -r * 1.12, r * 0.78]] as [number, number, number][]) {
    ball(g, ex, ey, er, MOUSE, 1.3); ball(g, ex + 1, ey + 1, er * 0.62, PINK, 0);
  }
  part(g, () => g.ellipse(0, 0, r, r * 0.88, 0, 0, Math.PI * 2), MOUSE, -r, -r, r * 2, r * 2, 1.4);
  px(g, -r * 0.7, -r * 0.6, r * 0.4, 2, lt(MOUSE, 0.3));
  // (the snout: long, out front, a pink nose on the end; whiskers)
  part(g, () => { g.moveTo(r * 0.2, -r * 0.1); g.quadraticCurveTo(r * 1.5, -r * 0.05, r * 1.55, r * 0.3); g.quadraticCurveTo(r * 1.2, r * 0.62, r * 0.1, r * 0.55); g.closePath(); }, lt(MOUSE, 0.18), r * 0.1, -r * 0.1, r * 1.5, r * 0.75, 1.2);
  ball(g, r * 1.55, r * 0.22, r * 0.17, '#EC4899', 1);
  g.strokeStyle = INK; g.lineWidth = 0.8; for (const s of [-1, 0, 1]) { g.beginPath(); g.moveTo(r * 1.25, r * 0.35); g.lineTo(r * 1.85, r * 0.3 + s * r * 0.2); g.stroke(); }
  // (the eyes: big, wild, close together)
  part(g, () => g.ellipse(r * 0.45, -r * 0.3, r * 0.24, r * 0.34, 0, 0, Math.PI * 2), '#FFFFFF', r * 0.2, -r * 0.65, r * 0.5, r * 0.7, 1);
  part(g, () => g.ellipse(r * 0.05, -r * 0.28, r * 0.2, r * 0.3, 0, 0, Math.PI * 2), '#FFFFFF', -r * 0.15, -r * 0.6, r * 0.4, r * 0.6, 1);
  ball(g, r * 0.55, -r * 0.24, r * 0.1, INK, 0); ball(g, r * 0.14, -r * 0.22, r * 0.09, INK, 0);
  px(g, r * 0.5, -r * 0.3, Math.max(1, r * 0.06), Math.max(1, r * 0.06), '#FFFFFF');
  // (mean brows slanted in; a scar across the snout, a bandage on the far ear)
  g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(r * 0.24, -r * 0.62); g.lineTo(r * 0.66, -r * 0.5); g.moveTo(-r * 0.12, -r * 0.6); g.lineTo(r * 0.16, -r * 0.54); g.stroke();
  g.strokeStyle = '#7F1D1D'; g.lineWidth = 1; g.beginPath(); g.moveTo(r * 0.8, -r * 0.05); g.lineTo(r * 1.0, r * 0.25); g.stroke();
  for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(r * (0.82 + k * 0.07), r * (0.04 + k * 0.09)); g.lineTo(r * (0.9 + k * 0.07), r * (0.0 + k * 0.09)); g.stroke(); }
  g.save(); g.translate(-r * 0.75, -r * 1.2); g.rotate(-0.6); part(g, () => g.rect(-6, -2, 12, 4), '#F5D0A9', -6, -2, 12, 4, 0.8); g.restore();
  // (the grin under the snout: buck teeth)
  part(g, () => { g.moveTo(r * 0.3, r * 0.55); g.quadraticCurveTo(r * 0.75, r * 0.85, r * 1.15, r * 0.55); g.closePath(); }, '#7F1D1D', r * 0.3, r * 0.5, r * 0.85, r * 0.3, 1);
  part(g, () => g.rect(r * 0.62, r * 0.55, r * 0.26, r * 0.3), '#FFFFFF', r * 0.62, r * 0.55, r * 0.26, r * 0.3, 0.8);
  px(g, r * 0.74, r * 0.55, 1, r * 0.3, INK);
  g.restore();
};
/** A meat cleaver: its grip at (x, y), the blade up along angle `a`. */
export const cleaver = (g: Ctx, x: number, y: number, a: number, glint = false) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-2.5, -2, 5, 12, 2), '#7C2D12', -2.5, -2, 5, 12, 1);
  part(g, () => { g.moveTo(-3, -2); g.lineTo(-3, -22); g.lineTo(13, -24); g.lineTo(13, -2); g.closePath(); }, '#D4D4D8', -3, -24, 16, 22, 1.2);
  px(g, 10, -23, 3, 21, '#F4F4F5');
  ball(g, 0, -18, 2, '#52525B', 0);
  splat(g, 6, -8, 2);
  if (glint) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(12, -28); g.lineTo(13.5, -24); g.lineTo(17, -23); g.lineTo(13.5, -22); g.lineTo(12, -18); g.lineTo(10.5, -22); g.lineTo(7, -23); g.lineTo(10.5, -24); g.closePath(); g.fill(); }
  g.restore();
};
/** A stick of dynamite: its middle at (x, y), tilted; its fuse lit (sparking) or not. */
export const dynamiteStick = (g: Ctx, x: number, y: number, a: number, lit: boolean, f: number, fuse = 1) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-3.5, -11, 7, 22, 2), '#DC2626', -3.5, -11, 7, 22, 1);
  px(g, -2.5, -10, 2, 20, '#F87171');
  px(g, -3.5, -2, 7, 3, '#FEF3C7');
  g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -11); g.quadraticCurveTo(3, -15, 1 + fuse * 2, -11 - fuse * 7); g.stroke();
  if (lit) { const sx = 1 + fuse * 2, sy = -11 - fuse * 7; g.fillStyle = (f >> 1) % 2 ? '#FDE047' : '#FFFFFF'; g.beginPath(); for (let i = 0; i < 8; i++) { const ra = i % 2 ? 1.6 : 4, an = (i / 8) * Math.PI * 2 + f * 0.4; g.lineTo(sx + Math.cos(an) * ra, sy + Math.sin(an) * ra); } g.closePath(); g.fill(); }
  g.restore();
};
const paintKicky = (g: Ctx, F: Frame, boom: boolean) => {
  const B = bodyOf(F.seed, F.pose, F.fr);
  const wind = F.v === 'wind', empty = F.v === 'empty', kickUp = F.v === 'kickUp', kicked = F.v === 'kick', light = F.v === 'light', ears = F.v === 'ears';
  if (kickUp) { B.feet = [-3, 6]; B.lift = [0, 20]; B.lean = -3; }
  if (kicked) { B.feet = [-6, 26]; B.lift = [0, 26]; B.lean = -5; }
  // (the tail: long, pink, a curl)
  g.strokeStyle = INK; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-B.hipW / 2 + 2, B.hipY + 4); g.bezierCurveTo(-30, B.hipY + 10, -34, B.hipY - 20, -22 + (F.fr % 2) * 2, B.hipY - 22); g.stroke();
  g.strokeStyle = PINK; g.lineWidth = 2; g.stroke();
  g.setLineDash([1, 3]); g.strokeStyle = '#DB7AA8'; g.lineWidth = 2; g.beginPath(); g.moveTo(-B.hipW / 2 + 2, B.hipY + 4); g.bezierCurveTo(-30, B.hipY + 10, -34, B.hipY - 20, -22 + (F.fr % 2) * 2, B.hipY - 22); g.stroke(); g.setLineDash([]);
  legs(g, B, { col: MOUSE, shoe: 'sneaker', shoeCol: SNEAK, bareBelow: true, skin: '#F5F5F4', stripe: '#DC2626' });
  const H = handsAt(B, F,
    wind ? [-B.w / 2 - 10, B.shY + 10] : light ? [B.w / 2 - 2, B.shY + 6] : ears ? [B.hx - 12, B.hy - 2] : kicked ? [-B.w / 2 - 12, B.shY + 2] : [-B.w / 2 - 4, B.shY + 18],
    wind ? [-B.w / 2 - 14, B.shY - 16] : light ? [B.w / 2 + 12, B.shY + 4] : ears ? [B.hx + 14, B.hy - 2] : kicked ? [B.w / 2 + 10, B.shY + 4] : boom ? [B.w / 2 + 6, B.shY + 18] : [B.w / 2 + 14, B.shY + 12]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: MOUSE_DK, hand: GLOVE });
  torso(g, B, MOUSE, B.shY, B.hipY + 4, 2);
  part(g, () => g.ellipse(3, (B.shY + B.hipY) / 2 + 3, 6, 10, 0, 0, Math.PI * 2), '#F5F5F4', -3, B.shY + 7, 12, 20, 0.8);
  if (boom) {
    // (the bandolier of sticks across his chest)
    g.save(); g.translate(0, (B.shY + B.hipY) / 2); g.rotate(-0.6);
    part(g, () => g.rect(-16, -3, 32, 6), '#57534E', -16, -3, 32, 6, 1);
    for (let i = 0; i < 4; i++) part(g, () => g.roundRect(-12 + i * 7, -7, 5, 14, 1.5), '#DC2626', -12 + i * 7, -7, 5, 14, 0.8);
    g.restore();
  }
  splat(g, 5, B.shY + 16, 1.8);
  // (the belt and the cleaver pouch on it (his spares' handles sticking up); the dynamite one's matchbox)
  part(g, () => g.rect(-B.hipW / 2 - 1, B.hipY - 3, B.hipW + 2, 4), '#3F2A1A', -B.hipW / 2 - 1, B.hipY - 3, B.hipW + 2, 4, 0.8);
  px(g, -1, B.hipY - 3, 3, 4, '#D4D4D8');
  part(g, () => g.roundRect(-B.hipW / 2 - 3, B.hipY - 2, 8, 10, 1.5), '#5A3A1E', -B.hipW / 2 - 3, B.hipY - 2, 8, 10, 0.8);
  if (boom) { part(g, () => g.rect(B.hipW / 2 - 6, B.hipY - 1, 7, 5), '#FDE047', B.hipW / 2 - 6, B.hipY - 1, 7, 5, 0.8); px(g, B.hipW / 2 - 5, B.hipY + 1, 5, 1, '#DC2626'); for (let k = 0; k < 3; k++) px(g, -8 + k * 6, B.shY + 4 + k * 5, 3, 2, '#3F3F46'); }
  else for (let k = 0; k < 2; k++) px(g, -B.hipW / 2 - 1 + k * 3, B.hipY - 7, 2, 6, '#7C2D12');
  if (dead(F)) { performer(g, B, F, MOUSE); mouseHead(g, B.hx + 42, -16, 12, 1.7); splat(g, B.hx + 30, -3, 2.5); }
  else mouseHead(g, B.hx + 1, B.hy - 4, 14, kickUp ? -0.1 : kicked ? -0.18 : 0);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: MOUSE, hand: GLOVE });
  if (dead(F) || H.held) { if (!boom) cleaver(g, 30, -2, 1.5); return; }
  if (boom) { if (light) dynamiteStick(g, H.near[0] + 2, H.near[1] - 8, 0.3, true, F.fr * 3 + F.seed, 0.7); return; }
  // (the cleaver: out in front (pointy), drawn back with a glint (the tell); empty-handed digging in the pouch)
  if (empty) return;
  if (wind) cleaver(g, H.near[0], H.near[1], -2.2, true);
  else cleaver(g, H.near[0], H.near[1], 1.15);
};
export const drawKicky = (c: Ctx, e: Enemy, f: number, seed: number, boom: boolean) => {
  const st = e.aiState ?? '';
  const v = st === 'throwWind' ? 'wind' : st === 'empty' ? 'empty' : st === 'kickWind' ? 'kickUp' : st === 'kick' ? 'kick' : st === 'light' ? 'light' : st === 'after' && boom ? 'ears' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['throwWind', 'kickWind', 'light'], ['kick']), v);
  const F2 = st === 'light' ? { ...F, fr: Math.floor(f / 3) % 4 } : F;
  putFrame(c, boom ? 'ct-kickyb' : 'ct-kicky', F2, BOX, g => paintKicky(g, F2, boom));
};

// ---------------------------------------------------------------------------------------------------------------
// The host

const COAT = '#B91C1C';
const topHat = (g: Ctx, x: number, y: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.roundRect(-12, -2, 24, 4, 2), '#18181B', -12, -2, 24, 4, 1);
  part(g, () => g.rect(-8, -20, 16, 18), '#18181B', -8, -20, 16, 18, 1);
  px(g, -8, -6, 16, 3, COAT); px(g, -8, -6, 16, 1, '#EF4444');
  px(g, -6, -19, 2, 12, '#3F3F46'); px(g, -5, -19, 1, 6, '#52525B');
  // (a little skull pin on the band)
  ball(g, 3, -5, 2, '#F5F0E1', 0.6); px(g, 2, -5, 1, 1, INK); px(g, 4, -5, 1, 1, INK);
  g.restore();
};
const bullhorn = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => { g.moveTo(0, -3); g.lineTo(20, -9); g.lineTo(20, 9); g.lineTo(0, 3); g.closePath(); }, '#F4F4F5', 0, -9, 20, 18, 1.2);
  px(g, 10, -6, 3, 12, COAT);
  part(g, () => g.rect(-4, 0, 4, 9), '#27272A', -4, 0, 4, 9, 1);
  g.restore();
};
const cane = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  limb(g, 0, 0, 0, -38, 3, '#18181B');
  ball(g, 0, -40, 3.2, '#D4D4D8', 1);
  g.restore();
};
const paintHost = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const cue = F.v === 'cue', caneUp = F.v === 'caneUp', whack = F.v === 'cane';
  // (the coat's tails behind him)
  part(g, () => { g.moveTo(-B.hipW / 2, B.hipY - 8); g.lineTo(-B.hipW / 2 - 6, B.hipY + 18); g.lineTo(-B.hipW / 2 + 6, B.hipY + 14); g.lineTo(-2, B.hipY - 4); g.closePath(); }, dk(COAT, 0.15), -B.hipW / 2 - 6, B.hipY - 8, B.hipW / 2 + 4, 26, 1);
  legs(g, B, { col: '#18181B', shoe: 'shoe', shoeCol: '#0A0A0A', stripe: '#3F3F46' });
  const H = handsAt(B, F,
    cue ? [-B.w / 2 - 6, B.shY - 24] : [-B.w / 2 - 4, B.shY + 18],
    cue ? [B.hx + 14, B.hy + 2] : caneUp ? [B.w / 2 + 2, B.shY - 18] : whack ? [B.w / 2 + 20, B.shY + 8] : [B.w / 2 + 8, B.shY + 18]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: COAT, hand: '#FFFFFF' });
  torso(g, B, COAT);
  // (the shirt front, the bow tie, the coat's lapels; stage blood flecks)
  part(g, () => { g.moveTo(-4, B.shY); g.lineTo(6, B.shY); g.lineTo(3, B.hipY - 4); g.lineTo(-1, B.hipY - 4); g.closePath(); }, '#F8FAFC', -4, B.shY, 10, B.hipY - B.shY - 4, 0.8);
  part(g, () => { g.moveTo(-4, B.shY + 2); g.lineTo(1, B.shY + 4); g.lineTo(6, B.shY + 2); g.lineTo(6, B.shY + 7); g.lineTo(1, B.shY + 5); g.lineTo(-4, B.shY + 7); g.closePath(); }, '#18181B', -4, B.shY + 2, 10, 5, 0.8);
  for (const [sx, sy] of [[-8, 10], [8, 18], [-5, 24], [10, 6]] as [number, number][]) px(g, sx, B.shY + sy, 2, 2, '#7F1D1D');
  // (the coat's lapels (black satin, a lit edge), a red carnation, a gold watch chain across the waistcoat, brass buttons)
  for (const s of [-1, 1]) part(g, () => { g.moveTo(1 + s * 3, B.shY); g.lineTo(1 + s * 9, B.shY + 2); g.lineTo(1 + s * 5, B.shY + 16); g.closePath(); }, '#18181B', Math.min(1 + s * 3, 1 + s * 9), B.shY, 6, 16, 0.6);
  px(g, -7, B.shY + 3, 1, 10, '#52525B');
  ball(g, -7, B.shY + 6, 2.2, '#DC2626', 0.6); px(g, -8, B.shY + 5, 1, 1, '#FCA5A5'); px(g, -6, B.shY + 8, 2, 2, '#16A34A');
  g.strokeStyle = '#FACC15'; g.lineWidth = 1; g.beginPath(); g.moveTo(-3, B.shY + 18); g.quadraticCurveTo(2, B.shY + 22, 7, B.shY + 18); g.stroke();
  for (let k = 0; k < 3; k++) px(g, 6, B.shY + 8 + k * 5, 2, 2, '#FACC15');
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: cue ? 'wide' : caneUp ? 'angry' : 'smug', mouth: cue ? 'o' : caneUp ? 'teeth' : 'grin', md: F.md, blink: F.blink });
  whiskers(g, B); glasses(g, B);
  if (dead(F)) topHat(g, B.hx - 30, -2, -1.2);
  else { hairTop(g, B); topHat(g, B.hx, B.hy - 7, -0.08); }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: COAT, hand: '#FFFFFF' });
  if (dead(F) || H.held) { cane(g, 26, -2, 1.5); return; }
  if (cue) { bullhorn(g, H.near[0], H.near[1], -0.15); return; }
  if (caneUp) cane(g, H.near[0], H.near[1], -0.3);
  else if (whack) cane(g, H.near[0], H.near[1], 1.4);
  else cane(g, H.near[0], H.near[1] + 2, 0.08);
};
export const drawHost = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = st === 'cue' ? 'cue' : st === 'caneWind' ? 'caneUp' : st === 'cane' ? 'cane' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['cue', 'caneWind'], ['cane']), v);
  putFrame(c, 'ct-host', F, BOX, g => paintHost(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The stagehand

const BLACK = '#27272A';
const headset = (g: Ctx, x: number, y: number, a = 0) => {
  g.save(); g.translate(x, y); g.rotate(a);
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 10, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  part(g, () => g.ellipse(-6, 2, 3.5, 4.5, 0, 0, Math.PI * 2), '#18181B', -9.5, -2.5, 7, 9, 1);
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(-5, 5); g.quadraticCurveTo(0, 12, 8, 9); g.stroke();
  part(g, () => g.ellipse(9, 9, 2.5, 2, 0, 0, Math.PI * 2), '#3F3F46', 6.5, 7, 5, 4, 0.6);
  px(g, -8, 0, 2, 2, '#71717A');
  g.restore();
};
/** A folded portable hole (a black disc, a sheen on it), held up. */
export const foldedHole = (g: Ctx, x: number, y: number, a: number, w = 24) => {
  g.save(); g.translate(x, y); g.rotate(a);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, w / 2 + 1, w / 2.6 + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#050505'; g.beginPath(); g.ellipse(0, 0, w / 2, w / 2.6, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(160,160,200,0.6)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, 0, w / 2 - 2, w / 2.6 - 2, 0, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
  g.strokeStyle = 'rgba(235,235,255,0.55)'; g.lineWidth = 1; g.beginPath(); g.ellipse(0, 0, w / 2 - 2, w / 2.6 - 2, 0, Math.PI * 1.2, Math.PI * 1.35); g.stroke();
  // (folded: a crease across it)
  g.strokeStyle = 'rgba(120,120,170,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-w / 2 + 3, 1); g.lineTo(w / 2 - 3, -1); g.stroke();
  g.restore();
};
const sandbag = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 10); g.stroke();
  part(g, () => g.roundRect(-9, 10, 18, 22, 6), '#C8B48A', -9, 10, 18, 22, 1.2);
  px(g, -6, 14, 4, 14, '#DCCBA6');
  px(g, -9, 14, 18, 1, '#8A7A5A'); px(g, -5, 22, 10, 1, '#8A7A5A');
  g.strokeStyle = '#A1A1AA'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 9, 2.5, 0, Math.PI * 2); g.stroke();
  g.restore();
};
const paintStagehand = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L;
  const hole = F.v === 'hole', bagUp = F.v === 'bagUp', swing = F.v === 'bag';
  legs(g, B, { col: BLACK, shoe: 'boot', shoeCol: '#18181B' });
  const H = handsAt(B, F,
    hole ? [B.w / 2 - 2, B.shY - 6] : bagUp ? [-B.w / 2 + 2, B.shY - 6] : [-B.w / 2 - 4, B.shY + 18],
    hole ? [B.w / 2 + 12, B.shY - 14 + (F.fr % 2) * 3] : bagUp ? [B.w / 2 - 6, B.shY - 10] : swing ? [B.w / 2 + 22, B.shY + 10] : [B.w / 2 + 7, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: BLACK, hand: '#C8A97E' });
  torso(g, B, BLACK);
  // (the tool belt: the gaffer tape on it, a flashlight, a carabiner of keys, a crescent wrench; tape stuck on a sleeve;
  // knee pads)
  part(g, () => g.rect(-B.hipW / 2 - 2, B.hipY - 3, B.hipW + 4, 4), '#44403C', -B.hipW / 2 - 2, B.hipY - 3, B.hipW + 4, 4, 0.8);
  ball(g, -B.hipW / 2 + 1, B.hipY + 2, 4.5, '#A1A1AA', 1); ball(g, -B.hipW / 2 + 1, B.hipY + 2, 1.8, '#52525B', 0);
  part(g, () => g.roundRect(B.hipW / 2 - 4, B.hipY - 2, 4, 11, 1), '#27272A', B.hipW / 2 - 4, B.hipY - 2, 4, 11, 0.8); px(g, B.hipW / 2 - 4, B.hipY + 8, 4, 1, '#FDE047');
  g.strokeStyle = '#A1A1AA'; g.lineWidth = 1; g.beginPath(); g.arc(2, B.hipY + 3, 2.5, 0, Math.PI * 2); g.stroke(); px(g, 1, B.hipY + 5, 1, 4, '#D4D4D8'); px(g, 3, B.hipY + 5, 1, 3, '#FACC15');
  px(g, -B.w / 2 + 2, B.shY + 10, 6, 3, '#D4D4D8'); px(g, -B.w / 2 + 2, B.shY + 10, 6, 1, '#F4F4F5');
  for (const kx of [-4, 4]) px(g, kx - 3, B.hipY + (-B.hipY) * 0.45, 7, 6, '#3F3F46');
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: hole || bagUp ? 'angry' : 'tired', mouth: bagUp ? 'teeth' : 'flat', md: F.md, blink: F.blink });
  whiskers(g, B); glasses(g, B); hairTop(g, B);
  if (dead(F)) headset(g, B.hx + 30, -6, 2.6); else headset(g, B.hx, B.hy, 0);
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: BLACK, hand: '#C8A97E' });
  if (dead(F) || H.held) return;
  if (hole) foldedHole(g, H.near[0] + 4, H.near[1] - 8, -0.3);
  else if (bagUp) sandbag(g, (H.far[0] + H.near[0]) / 2, Math.min(H.far[1], H.near[1]) - 30, 0.3);
  else if (swing) sandbag(g, H.near[0], H.near[1], -1.4);
};
export const drawStagehand = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const st = e.aiState ?? '';
  const v = st === 'hole' ? 'hole' : st === 'bagWind' ? 'bagUp' : st === 'bag' ? 'bag' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['hole', 'bagWind'], ['bag']), v);
  putFrame(c, 'ct-stagehand', F, BOX, g => paintStagehand(g, F));
};
