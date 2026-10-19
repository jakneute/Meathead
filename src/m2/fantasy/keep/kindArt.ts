// The castle's new cast, drawn (a first pass: crude but readable) on Spooky Land's person drawer (costume.ts: whoever's
// in the costume shows, their skin, build, face, man or woman; seeded, no two the same; painted once a frame into a
// stamp). Each drawn hurt, knocked about (held, flung, dazed: reaction()) and dead, so the engine's special deaths play
// out on their real sprites; and dead, the costume gives (the guard's helmet off, the jester's hat off and its bells
// spilled, the lady's cone hat knocked flat). Feet at the origin, facing right (the engine mirrors them).

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, hairTop, hairBack, frameOf, putFrame, pickOf,
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
const BOX: [number, number, number, number] = [-90, -160, 190, 164];
const handsAt = (B: Body, F: Frame, far: [number, number], near: [number, number]): { far: [number, number]; near: [number, number]; held: boolean } => {
  const fl = flailHands(B, F.fr);
  return fl ? { far: fl[0], near: fl[1], held: true } : { far, near, held: false };
};
const dead = (F: Frame) => F.md === 'dead';

// ---------------------------------------------------------------------------------------------------------------
// The guard (a halberd: pointy)

const TABARDS = ['#D8609E', '#2E52A8', '#7A3AAA', '#C81E3A'];
const halberd = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  // (the pole, the axe blade, the spike out the end, a pink tassel)
  part(g, () => g.rect(-30, -2, 78, 4), '#8A5A30', -30, -2, 78, 4, 1);
  part(g, () => { g.moveTo(36, -2); g.lineTo(44, -14); g.quadraticCurveTo(50, -2, 44, 10); g.lineTo(36, 2); g.closePath(); }, '#C8C8D4', 36, -14, 14, 24, 1);
  part(g, () => { g.moveTo(46, -3); g.lineTo(64, 0); g.lineTo(46, 3); g.closePath(); }, '#E4E4EC', 46, -3, 18, 6, 1);
  px(g, 30, -6, 3, 3, '#F49AC8'); px(g, 31, -3, 1, 6, '#F49AC8');
  g.restore();
};
const paintGuard = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, tab = pickOf(F.seed, 2, TABARDS);
  const lvl = F.v === 'level', thrust = F.v === 'thrust', chop = F.v === 'chop', rec = F.v === 'recover';
  legs(g, B, { col: '#5A5A64', shoe: 'boot', shoeCol: '#3A2A1A' });
  const near: [number, number] = lvl ? [B.w / 2 + 4, B.shY + 12] : thrust ? [B.w / 2 + 16, B.shY + 10] : chop ? [B.hx + 2, B.hy - 22] : rec ? [B.w / 2 + 8, B.shY + 22] : [B.w / 2 + 6, B.shY + 14];
  const H = handsAt(B, F, lvl || thrust ? [B.w / 2 - 8, B.shY + 12] : [-B.w / 2 - 4, B.shY + 16], near);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: '#8A8A94', hand: L.skin });
  torso(g, B, '#8A8A94');
  // (the tabard over the mail, a gold heart on it, a belt)
  part(g, () => g.rect(-B.w / 2 + 3, B.shY + 2, B.w - 6, B.hipY - B.shY + 10), tab, -B.w / 2 + 3, B.shY + 2, B.w - 6, B.hipY - B.shY + 10, 1);
  px(g, -2, B.shY + 10, 5, 4, '#F6D365'); px(g, -1, B.shY + 14, 3, 2, '#F6D365');
  px(g, -B.w / 2 + 2, B.hipY - 3, B.w - 4, 3, '#3A2A1A');
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: lvl || thrust || chop ? 'angry' : 'open', mouth: lvl ? 'teeth' : thrust ? 'o' : 'flat', md: F.md, blink: F.blink });
  whiskers(g, B);
  if (dead(F)) {
    hairTop(g, B);
    // (the helmet's off, rolled away by his feet)
    partTop(g, () => g.ellipse(B.hx + 30, -5, 12, 6, 0.3, Math.PI, 0), '#B8B8C4', B.hx + 18, -11, 24, 7, 1);
  } else {
    // (the kettle helmet: a dome and a wide brim)
    partTop(g, () => g.ellipse(B.hx, B.hy - 6, 10, 9, 0, Math.PI, 0), '#B8B8C4', B.hx - 10, B.hy - 15, 20, 10, 1);
    part(g, () => g.rect(B.hx - 15, B.hy - 7, 30, 3), '#9A9AA8', B.hx - 15, B.hy - 7, 30, 3, 1);
    px(g, B.hx - 1, B.hy - 18, 3, 4, '#F49AC8');
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: '#8A8A94', hand: L.skin });
  if (!H.held) halberd(g, H.near[0], H.near[1], lvl || thrust ? 0 : chop ? -1.35 : rec ? 0.5 : -1.2);
};
export const drawGuard = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const s = e.aiState ?? '', v = s === 'level' ? 'level' : s === 'thrust' ? 'thrust' : s === 'chopWind' ? 'chop' : s === 'recover' ? 'recover' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['level', 'chopWind'], ['thrust', 'recover']), v);
  putFrame(c, 'fa-guard', F, BOX, g => paintGuard(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The jester (motley, a belled hat, juggling)

const MOTLEY: [string, string][] = [['#D8306E', '#F6D365'], ['#2E52A8', '#E07A1E'], ['#1E8A4A', '#7A3AAA'], ['#C81E3A', '#22C0D8']];
const pin = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.ellipse(0, 2, 3.5, 6, 0, 0, Math.PI * 2), '#F4F4F5', -3.5, -4, 7, 12, 1);
  px(g, -1, -9, 2, 6, '#F4F4F5'); px(g, -1.5, 0, 3, 2, '#D8306E');
  g.restore();
};
const paintJester = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, [m1, m2] = pickOf(F.seed, 2, MOTLEY);
  const jug = F.v === 'juggle' || F.v === 'idle', bonk = F.v === 'bonk', flip = F.v === 'flip';
  legs(g, B, { col: m1, shoe: 'pointy', shoeCol: m2, detail: (gg, _h, _k, foot, near) => { if (!near) px(gg, foot[0] - 3, foot[1] - 10, 6, 6, m2); } });
  const H = handsAt(B, F, jug ? [-B.w / 2 + 2, B.shY + 6 + (F.fr % 2) * 3] : [-B.w / 2 - 4, B.shY + 16], jug ? [B.w / 2 + 2, B.shY + 6 + ((F.fr + 1) % 2) * 3] : bonk ? [B.w / 2 + 16, B.shY + 2] : [B.w / 2 + 6, B.shY + 14]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: m2, hand: L.skin });
  torso(g, B, m1);
  // (the motley: the other color down one side, diamonds, a ruff)
  part(g, () => g.rect(0, B.shY + 1, B.w / 2 - 1, B.hipY - B.shY + 1), m2, 0, B.shY + 1, B.w / 2, B.hipY - B.shY + 1, 0.6);
  for (const [dx, dy] of [[-6, 12], [5, 20], [-6, 26]]) px(g, dx, B.shY + dy, 4, 4, dx < 0 ? m2 : m1);
  for (let k = -B.w / 2; k < B.w / 2; k += 5) ball(g, k + 2, B.shY + 1, 3, '#F4F4F5', 0.6);
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: bonk ? 'angry' : 'open', mouth: 'grin', md: F.md, blink: F.blink });
  if (dead(F)) {
    hairTop(g, B);
    // (the hat's off on the floor, its bells spilled)
    partTop(g, () => { g.moveTo(B.hx + 16, -2); g.lineTo(B.hx + 44, -2); g.lineTo(B.hx + 30, -12); g.closePath(); }, m1, B.hx + 16, -12, 28, 10, 1);
    for (const bx of [B.hx + 14, B.hx + 46]) ball(g, bx, -3, 2.5, '#F6D365', 0.6);
  } else {
    // (the belled hat: three floppy points, a bell on each)
    const fl = Math.sin(F.fr) * 2;
    partTop(g, () => { g.moveTo(B.hx - 10, B.hy - 5); g.quadraticCurveTo(B.hx - 22, B.hy - 18 + fl, B.hx - 18, B.hy - 26); g.lineTo(B.hx - 4, B.hy - 13); g.lineTo(B.hx + 1, B.hy - 32); g.lineTo(B.hx + 6, B.hy - 13); g.lineTo(B.hx + 20, B.hy - 24 - fl); g.quadraticCurveTo(B.hx + 20, B.hy - 12, B.hx + 11, B.hy - 5); g.closePath(); }, m1, B.hx - 22, B.hy - 32, 42, 27, 1);
    part(g, () => { g.moveTo(B.hx - 4, B.hy - 13); g.lineTo(B.hx + 1, B.hy - 32); g.lineTo(B.hx + 6, B.hy - 13); g.closePath(); }, m2, B.hx - 4, B.hy - 32, 10, 19, 0.6);
    for (const [bx, by] of [[B.hx - 18, B.hy - 26], [B.hx + 1, B.hy - 33], [B.hx + 20, B.hy - 24 - fl]]) ball(g, bx, by, 2.5, '#F6D365', 0.6);
    px(g, B.hx - 10, B.hy - 6, 22, 2, dk(m1, 0.2));
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: m1, hand: L.skin });
  // (the bladder on a stick, in his belt or swung)
  if (!H.held && (bonk || flip)) { g.save(); g.translate(H.near[0], H.near[1]); g.rotate(bonk ? -0.3 : -1.2); part(g, () => g.rect(0, -1.5, 18, 3), '#8A5A30', 0, -1.5, 18, 3, 0.8); ball(g, 22, 0, 6, '#F49AC8', 1); g.restore(); }
  else if (!H.held) { part(g, () => g.rect(-B.w / 2 - 2, B.hipY - 18, 3, 16), '#8A5A30', -B.w / 2 - 2, B.hipY - 18, 3, 16, 0.8); ball(g, -B.w / 2, B.hipY - 22, 5, '#F49AC8', 1); }
};
export const drawJester = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const s = e.aiState ?? '', alive = e.health > 0 && !reaction(e);
  const v = s === 'juggle' ? 'juggle' : s === 'bonkWind' ? 'bonk' : s === 'flip' ? 'flip' : s === 'after' ? 'after' : alive ? 'idle' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['juggle', 'bonkWind'], ['flip']), v);
  if (v === 'juggle' || (v === 'idle' && F.pose === 'stand')) F.fr = Math.floor(f / (v === 'juggle' ? 4 : 9)) % 2;
  // (a cartwheel: the whole of him turned)
  if (v === 'flip') { c.save(); c.translate(0, -36); c.rotate(-(e.aiTimer ?? 0) * 0.26); c.translate(0, 36); }
  putFrame(c, 'fa-jester', F, BOX, g => paintJester(g, F));
  if (v === 'flip') c.restore();
  // (the pins, juggled live over his hands: higher and faster on the tell)
  if (v === 'idle' || v === 'juggle') {
    const fast = v === 'juggle', sp = fast ? 0.32 : 0.14, hi = fast ? 46 : 30;
    for (let k = 0; k < 3; k++) {
      const a = f * sp + (k * Math.PI * 2) / 3;
      const x = Math.cos(a) * 10 + 2, y = -66 - Math.max(0, Math.sin(a)) * hi;
      pin(c, x, y, a * 1.5);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lady-in-waiting (a gown, a cone hat with its veil, a fan)

const GOWNS = ['#F49AC8', '#A8C8F0', '#C8A8F0', '#F6D365', '#9AE6B4'];
const fanAt = (g: Ctx, x: number, y: number, open: number, a: number, col: string) => {
  g.save(); g.translate(x, y); g.rotate(a);
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 13, -Math.PI / 2 - open, -Math.PI / 2 + open); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 12, -Math.PI / 2 - open, -Math.PI / 2 + open); g.closePath(); g.fill();
  g.strokeStyle = dk(col, 0.3); g.lineWidth = 0.8; for (let k = -2; k <= 2; k++) { const t = -Math.PI / 2 + (k / 2) * open; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(t) * 12, Math.sin(t) * 12); g.stroke(); }
  g.restore();
};
const paintCourtier = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, gown = pickOf(F.seed, 2, GOWNS);
  const flut = F.v === 'flutter', slap = F.v === 'slap', wait = F.v === 'wait';
  // (the gown: a bell to the floor over the legs, panels)
  part(g, () => { g.moveTo(-B.hipW / 2, B.hipY - 4); g.lineTo(B.hipW / 2, B.hipY - 4); g.lineTo(B.hipW / 2 + 12, -1); g.lineTo(-B.hipW / 2 - 12, -1); g.closePath(); }, gown, -B.hipW / 2 - 12, B.hipY - 4, B.hipW + 24, -B.hipY + 4, 1.2);
  for (const k of [-0.5, 0, 0.5]) px(g, k * B.hipW, B.hipY + 2, 1, -B.hipY - 4, dk(gown, 0.15));
  px(g, -B.hipW / 2 - 12, -4, B.hipW + 24, 3, lt(gown, 0.3));
  const H = handsAt(B, F, [-B.w / 2 - 2, B.shY + 18], flut ? [B.hx + 10, B.hy + 10 + (F.fr % 2) * 4] : slap ? [B.w / 2 + 16, B.shY + 4] : wait ? [B.w / 2 + 12, B.shY + 6] : [B.w / 2 + 4, B.shY + 16]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(gown, 0.1), hand: L.skin });
  torso(g, B, gown);
  // (the bodice: a gold trim, a square neck)
  px(g, -B.w / 2 + 4, B.shY + 2, B.w - 8, 2, '#F6D365'); px(g, -4, B.shY + 2, 8, 6, L.skin);
  hairBack(g, B, B.L.hair, 18);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: flut || slap ? 'angry' : 'open', mouth: slap ? 'teeth' : 'flat', md: F.md, blink: F.blink });
  whiskers(g, B);
  if (dead(F)) {
    hairTop(g, B);
    // (the cone hat knocked off, flat on the floor, the veil off it)
    partTop(g, () => { g.moveTo(B.hx + 14, -2); g.lineTo(B.hx + 50, -6); g.lineTo(B.hx + 16, -10); g.closePath(); }, gown, B.hx + 14, -10, 36, 8, 1);
  } else {
    hairTop(g, B);
    // (the hennin: a tall cone back off the head, its veil streaming)
    partTop(g, () => { g.moveTo(B.hx - 8, B.hy - 6); g.lineTo(B.hx + 6, B.hy - 9); g.lineTo(B.hx - 16, B.hy - 44); g.closePath(); }, gown, B.hx - 16, B.hy - 44, 22, 38, 1);
    g.save(); g.globalAlpha = 0.6; g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(B.hx - 16, B.hy - 44); g.quadraticCurveTo(B.hx - 30, B.hy - 20, B.hx - 22, B.hy + 10); g.lineTo(B.hx - 16, B.hy + 8); g.quadraticCurveTo(B.hx - 22, B.hy - 18, B.hx - 14, B.hy - 40); g.closePath(); g.fill(); g.restore();
    px(g, B.hx - 8, B.hy - 7, 14, 2, '#F6D365');
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: gown, hand: L.skin });
  if (!H.held && !wait) fanAt(g, H.near[0] + 2, H.near[1] - 2, flut ? 0.9 + (F.fr % 2) * 0.2 : 0.7, flut ? (F.fr % 2 ? -0.5 : 0.2) : 0.3, lt(gown, 0.35));
};
export const drawCourtier = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const s = e.aiState ?? '', v = s === 'flutter' ? 'flutter' : s === 'slapWind' ? 'slap' : s === 'wait' ? 'wait' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['flutter', 'slapWind'], ['after']), v);
  if (v === 'flutter') F.fr = Math.floor(f / 3) % 2;
  putFrame(c, 'fa-courtier', F, BOX, g => paintCourtier(g, F));
};

/** A fan in flight (hazards.ts): spinning flat, open. */
export const drawFan = (c: Ctx, x: number, y: number, t: number) => fanAt(c, x, y, 0.9, t * 0.7, '#FFE4F0');
/** A juggling pin in flight. */
export const drawPin = (c: Ctx, x: number, y: number, t: number) => pin(c, x, y, t * 0.5);
