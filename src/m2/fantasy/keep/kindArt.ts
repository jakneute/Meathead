// The castle's new cast, drawn (the SNES pass) on Spooky Land's person drawer (costume.ts: whoever's in the costume
// shows, their skin, build, face, man or woman; seeded, no two the same; painted once a frame into a stamp), every
// material in its steps, dithered between, inked. Each drawn hurt, knocked about (held, flung, dazed: reaction()) and
// dead, so the engine's special deaths play out on their real sprites; and dead, the costume gives (the guard's helmet
// off and rolled away, the jester's hat off and its bells spilled, the lady's cone hat knocked flat and her veil off it).
// Feet at the origin, facing right (the engine mirrors them).
//
//   guard     mail chausses and a mail shirt (rings dithered in), a tabard quartered in the castle's colors with a gilt
//             heart, a belt and pouch; a kettle helmet in steps, rivets, a pink plume; the halberd (an ash pole
//             wrapped at the grip, a steel axe beveled in steps, its back spike and top spike, langets, a tassel)
//   jester    parti-colored hose (a leg each color), curled bell shoes, a quartered motley with diamonds, a dagged collar
//             of bells, a belled three-point hat; some in white greasepaint with a red nose and a painted diamond; the
//             bladder on a stick (in his belt, or swung)
//   lady      a bell gown (brocade lattice, panels catching the light, a gilt hem), a laced bodice and its square neck, a
//             pearl necklace, hanging sleeves, a gilt girdle down the front; a tall hennin (banded, a gilt circlet) and
//             its veil; the fan (ribs, painted flowers). Men wear the gown too (their own whiskers)

import type { Enemy } from '../../../m1/types';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, partTop, px, ball, dither,
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
const GILT = ['#7A5212', '#B07E22', '#E0AE3A', '#F6D365', '#FFF4B8'];
const STEEL = ['#3A3E48', '#5A5E6A', '#8A8F9C', '#B4B8C4', '#DADDE6', '#FFFFFF'];
/** A clipped region of the torso etc. (paint inside `path` only). */
const inside = (g: Ctx, path: () => void, paint: () => void) => { g.save(); g.beginPath(); path(); g.clip(); paint(); g.restore(); };

// ---------------------------------------------------------------------------------------------------------------
// The guard (a halberd: pointy)

const TABARDS: [string, string][] = [['#D8609E', '#F4F0FA'], ['#2E52A8', '#F6D365'], ['#7A3AAA', '#F4F0FA'], ['#C81E3A', '#F6D365']];
const MAIL = '#8A8F9C';
const halberd = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  // (the pole: ash in steps, wrapped in leather at the grip, an iron butt cap)
  part(g, () => g.rect(-34, -2.2, 82, 4.4), '#9A6A3A', -34, -2.2, 82, 4.4, 1);
  px(g, -34, -2, 82, 1, '#C8965A'); px(g, -34, 1, 82, 1, '#6A4422');
  for (let k = -10; k < 6; k += 3) { px(g, k, -2, 2, 4, '#4A2A14'); px(g, k, -2, 1, 1, '#7A4A28'); }
  px(g, -36, -2.5, 4, 5, STEEL[1]); px(g, -36, -2.5, 4, 1, STEEL[3]);
  // (the langets down the pole, the axe blade beveled in steps, the back spike, the top spike)
  px(g, 30, -3, 12, 1, STEEL[2]); px(g, 30, 2, 12, 1, STEEL[1]);
  part(g, () => { g.moveTo(36, -2); g.lineTo(42, -16); g.quadraticCurveTo(52, -3, 44, 12); g.lineTo(36, 2); g.closePath(); }, STEEL[3], 36, -16, 16, 28, 1);
  g.fillStyle = STEEL[4]; g.beginPath(); g.moveTo(42, -14); g.quadraticCurveTo(50, -3, 44, 10); g.lineTo(46, 9); g.quadraticCurveTo(51, -3, 44, -14); g.closePath(); g.fill();
  px(g, 38, -6, 3, 8, STEEL[2]); px(g, 41, -14, 1, 2, STEEL[5]);
  part(g, () => { g.moveTo(36, -2); g.lineTo(28, -10); g.lineTo(31, -2); g.closePath(); }, STEEL[2], 28, -10, 8, 8, 0.8);
  part(g, () => { g.moveTo(46, -3); g.lineTo(68, 0); g.lineTo(46, 3); g.closePath(); }, STEEL[4], 46, -3, 22, 6, 1);
  px(g, 47, -1, 18, 1, STEEL[5]);
  // (the tassel: pink, bound with gold)
  px(g, 31, -7, 4, 3, GILT[3]); for (let k = 0; k < 4; k++) px(g, 31 + k, -4, 1, 6 + (k % 2), k % 2 ? '#F49AC8' : '#D8609E');
  g.restore();
};
const paintGuard = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, [tab, tab2] = pickOf(F.seed, 2, TABARDS);
  const lvl = F.v === 'level', thrust = F.v === 'thrust', chop = F.v === 'chop', rec = F.v === 'recover';
  legs(g, B, { col: '#6E727E', shoe: 'boot', shoeCol: '#4A2E1A', detail: (gg, _h, knee, foot, near) => {
    // (mail rings on the chausses, a knee cop, the boot's cuff)
    for (let k = 0.2; k < 0.9; k += 0.25) { const yy = knee[1] + (foot[1] - knee[1]) * k, xx = knee[0] + (foot[0] - knee[0]) * k; px(gg, xx - 2, yy, 1, 1, '#4A4E58'); px(gg, xx + 1, yy + 1, 1, 1, '#A8ACB8'); }
    ball(gg, knee[0], knee[1], 3, near ? STEEL[3] : STEEL[2], 0.8); px(gg, knee[0] - 1, knee[1] - 2, 1, 1, STEEL[5]);
    px(gg, foot[0] - 4, foot[1] - 6, 11, 3, INK); px(gg, foot[0] - 3, foot[1] - 5, 9, 1, near ? '#7A5232' : '#5A3A22');
  } });
  const near: [number, number] = lvl ? [B.w / 2 + 4, B.shY + 12] : thrust ? [B.w / 2 + 16, B.shY + 10] : chop ? [B.hx + 2, B.hy - 22] : rec ? [B.w / 2 + 8, B.shY + 22] : [B.w / 2 + 6, B.shY + 14];
  const H = handsAt(B, F, lvl || thrust ? [B.w / 2 - 8, B.shY + 12] : [-B.w / 2 - 4, B.shY + 16], near);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(MAIL, 0.1), hand: '#5A3A22' });
  const tp = torso(g, B, MAIL);
  inside(g, tp, () => { for (let y = B.shY; y < B.hipY + 4; y += 2) for (let x = -B.w / 2 - 2; x < B.w / 2 + 6; x += 3) px(g, x + ((y / 2) % 2) * 1.5, y, 1, 1, (y + x) % 6 < 3 ? '#5E626E' : '#B4B8C4'); });
  // (the tabard: quartered, stepped (lit down its left, shaded down its right), dagged at the hem; a gilt heart)
  const tl = -B.w / 2 + 3, tw = B.w - 6, tt = B.shY + 2, th = B.hipY - B.shY + 12;
  const tPath = () => { g.moveTo(tl, tt); g.lineTo(tl + tw, tt); g.lineTo(tl + tw, tt + th - 3); for (let k = 0; k <= 4; k++) g.lineTo(tl + tw - (k * tw) / 4, tt + th - (k % 2 ? 0 : 3)); g.closePath(); };
  part(g, tPath, tab, tl, tt, tw, th, 1);
  inside(g, tPath, () => {
    px(g, tl + tw / 2, tt, tw / 2, th / 2, tab2); px(g, tl, tt + th / 2, tw / 2, th / 2, tab2);
    px(g, tl, tt, 2, th, lt(tab, 0.3)); px(g, tl + tw - 3, tt, 3, th, dk(tab, 0.3)); dither(g, tl + tw - 5, tt, 2, th, dk(tab, 0.3));
    px(g, tl, tt, tw, 1, lt(tab, 0.35));
  });
  ball(g, -2, B.shY + 12, 2.6, GILT[3], 0.6); ball(g, 2, B.shY + 12, 2.6, GILT[3], 0.6); px(g, -3, B.shY + 13, 6, 3, GILT[3]); px(g, -1, B.shY + 16, 2, 2, GILT[3]); px(g, -3, B.shY + 11, 1, 1, GILT[4]);
  // (the belt, its buckle, a pouch)
  px(g, -B.w / 2 + 1, B.hipY - 3, B.w - 2, 4, INK); px(g, -B.w / 2 + 2, B.hipY - 2, B.w - 4, 2, '#5A3A22'); px(g, -2, B.hipY - 3, 4, 4, GILT[3]); px(g, -1, B.hipY - 2, 2, 2, INK);
  part(g, () => g.roundRect(-B.w / 2 + 1, B.hipY, 6, 7, 1.5), '#6A4428', -B.w / 2 + 1, B.hipY, 6, 7, 0.8);
  // (pauldrons)
  for (const s of [-1, 1]) { part(g, () => g.ellipse(s * (B.w / 2 - 1), B.shY + 3, 5.5, 4, 0, 0, Math.PI * 2), s > 0 ? STEEL[3] : STEEL[2], s * (B.w / 2 - 1) - 5.5, B.shY - 1, 11, 8, 1); px(g, s * (B.w / 2 - 1) - 3, B.shY + 1, 2, 1, STEEL[5]); }
  hairBack(g, B);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: lvl || thrust || chop ? 'angry' : 'open', mouth: lvl ? 'teeth' : thrust ? 'o' : 'flat', md: F.md, blink: F.blink });
  whiskers(g, B);
  if (dead(F)) {
    hairTop(g, B);
    // (the helmet's off, rolled away by his feet, its plume squashed)
    partTop(g, () => g.ellipse(B.hx + 30, -6, 12, 7, 0.3, Math.PI, 0), STEEL[3], B.hx + 18, -13, 24, 8, 1);
    px(g, B.hx + 16, -6, 28, 2, STEEL[1]); px(g, B.hx + 24, -12, 4, 2, STEEL[5]); px(g, B.hx + 40, -10, 6, 3, '#F49AC8');
  } else {
    // (the mail coif round the face; the kettle helmet: a dome in steps, a wide brim, rivets, a plume)
    part(g, () => g.ellipse(B.hx - 1, B.hy + 2, B.rx + 1.5, B.ry + 2, 0, Math.PI * 0.95, Math.PI * 2.05), dk(MAIL, 0.1), B.hx - B.rx - 2, B.hy - B.ry, B.rx * 2 + 3, B.ry + 6, 1);
    partTop(g, () => g.ellipse(B.hx, B.hy - 6, 10.5, 9.5, 0, Math.PI, 0), STEEL[3], B.hx - 10.5, B.hy - 15.5, 21, 10, 1);
    px(g, B.hx - 8, B.hy - 13, 4, 6, STEEL[4]); px(g, B.hx - 7, B.hy - 14, 2, 2, STEEL[5]); px(g, B.hx + 5, B.hy - 12, 4, 6, STEEL[2]);
    part(g, () => g.rect(B.hx - 16, B.hy - 7, 32, 3.5), STEEL[2], B.hx - 16, B.hy - 7, 32, 3.5, 1);
    px(g, B.hx - 15, B.hy - 7, 30, 1, STEEL[4]);
    for (const rx of [-12, -4, 4, 12]) px(g, B.hx + rx, B.hy - 6, 1, 1, STEEL[5]);
    part(g, () => { g.moveTo(B.hx - 1, B.hy - 15); g.quadraticCurveTo(B.hx - 10, B.hy - 30, B.hx - 18, B.hy - 22); g.quadraticCurveTo(B.hx - 8, B.hy - 22, B.hx + 2, B.hy - 14); g.closePath(); }, '#F49AC8', B.hx - 18, B.hy - 30, 20, 16, 1);
    px(g, B.hx - 12, B.hy - 24, 4, 1, '#FFD0E8');
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: MAIL, hand: '#6A4428' });
  if (!H.held) halberd(g, H.near[0], H.near[1], lvl || thrust ? 0 : chop ? -1.35 : rec ? 0.5 : -1.2);
};
export const drawGuard = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const s = e.aiState ?? '', v = s === 'level' ? 'level' : s === 'thrust' ? 'thrust' : s === 'chopWind' ? 'chop' : s === 'recover' ? 'recover' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['level', 'chopWind'], ['thrust', 'recover']), v);
  putFrame(c, 'fa-guard2', F, BOX, g => paintGuard(g, F));
};

// ---------------------------------------------------------------------------------------------------------------
// The jester (motley, a belled hat, juggling)

const MOTLEY: [string, string][] = [['#D8306E', '#F6D365'], ['#2E52A8', '#E07A1E'], ['#1E8A4A', '#7A3AAA'], ['#C81E3A', '#22C0D8']];
const pin = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  part(g, () => g.ellipse(0, 2, 3.6, 6, 0, 0, Math.PI * 2), '#F4F4F5', -3.6, -4, 7.2, 12, 1);
  part(g, () => g.rect(-1.2, -10, 2.4, 7), '#F4F4F5', -1.2, -10, 2.4, 7, 0.8);
  px(g, -2, -1, 4, 2, '#D8306E'); px(g, -2, 3, 4, 1, '#2E52A8'); px(g, -2, -11, 4, 2, '#D8306E');
  px(g, -2, 0, 1, 5, '#FFFFFF'); px(g, 2, 1, 1, 4, '#B4B4C0');
  g.restore();
};
const bell = (g: Ctx, x: number, y: number, r = 2.5) => { ball(g, x, y, r, GILT[3], 0.6); px(g, x - r * 0.5, y - r * 0.5, 1, 1, GILT[4]); px(g, x - 0.5, y + r * 0.4, 1, 1, INK); };
const paintJester = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, [m1, m2] = pickOf(F.seed, 2, MOTLEY);
  const jug = F.v === 'juggle' || F.v === 'idle', bonk = F.v === 'bonk', flip = F.v === 'flip';
  const painted = (F.seed >> 1) % 3 === 0, face = painted ? '#F4F0F0' : L.skin;
  // (parti-colored hose: a leg each color, stepped; curled shoes with bells on the toes)
  for (const s of [0, 1] as const) {
    const side = s ? 1 : -1, nearL = s === 1, col = nearL ? m1 : dk(m2, 0.12);
    const hip = [side * B.hipW * 0.22, B.hipY + 2], foot = [side * 3 + B.feet[s], -4 - B.lift[s]], knee = [(hip[0] + foot[0]) / 2 + 1.5, (hip[1] + foot[1]) / 2];
    g.strokeStyle = INK; g.lineWidth = B.legW + 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(hip[0], hip[1]); g.lineTo(knee[0], knee[1]); g.lineTo(foot[0], foot[1]); g.stroke();
    g.strokeStyle = col; g.lineWidth = B.legW; g.stroke();
    g.strokeStyle = lt(col, 0.3); g.lineWidth = 1.4; g.beginPath(); g.moveTo(hip[0] - B.legW / 2 + 1.5, hip[1]); g.lineTo(knee[0] - B.legW / 2 + 1.5, knee[1]); g.lineTo(foot[0] - B.legW / 2 + 1.5, foot[1]); g.stroke(); g.lineCap = 'butt';
    const fx = foot[0] - 1, fy = -B.lift[s];
    part(g, () => { g.moveTo(fx - 3, fy); g.lineTo(fx - 3, fy - 6); g.lineTo(fx + 5, fy - 5); g.quadraticCurveTo(fx + 12, fy - 3, fx + 13, fy - 10); g.quadraticCurveTo(fx + 15, fy - 1, fx + 6, fy); g.closePath(); }, nearL ? m2 : dk(m1, 0.12), fx - 3, fy - 10, 18, 10, 1);
    bell(g, fx + 13, fy - 11, 2);
  }
  const H = handsAt(B, F, jug ? [-B.w / 2 + 2, B.shY + 6 + (F.fr % 2) * 3] : [-B.w / 2 - 4, B.shY + 16], jug ? [B.w / 2 + 2, B.shY + 6 + ((F.fr + 1) % 2) * 3] : bonk ? [B.w / 2 + 16, B.shY + 2] : [B.w / 2 + 6, B.shY + 14]);
  arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(m2, 0.1), hand: L.skin });
  const tp = torso(g, B, m1);
  // (the motley: quartered, diamonds down it, stepped; a belt with a bell)
  inside(g, tp, () => {
    px(g, 0, B.shY, B.w, (B.hipY - B.shY) / 2 + 1, m2); px(g, -B.w, B.shY + (B.hipY - B.shY) / 2, B.w, B.hipY - B.shY, m2);
    for (const [dx, dy, c2] of [[-6, 9, m2], [5, 18, m1], [-6, 23, m1], [5, 8, m1]] as const) { g.fillStyle = INK; g.beginPath(); g.moveTo(dx, B.shY + dy - 4); g.lineTo(dx + 3, B.shY + dy); g.lineTo(dx, B.shY + dy + 4); g.lineTo(dx - 3, B.shY + dy); g.closePath(); g.fill(); g.fillStyle = c2; g.beginPath(); g.moveTo(dx, B.shY + dy - 3); g.lineTo(dx + 2, B.shY + dy); g.lineTo(dx, B.shY + dy + 3); g.lineTo(dx - 2, B.shY + dy); g.closePath(); g.fill(); }
    px(g, -B.w / 2 - 2, B.shY, 3, B.hipY - B.shY + 4, lt(m1, 0.3)); px(g, B.w / 2 - 3, B.shY, 6, B.hipY - B.shY + 4, dk(m2, 0.3)); dither(g, B.w / 2 - 5, B.shY, 2, B.hipY - B.shY + 4, dk(m2, 0.3));
  });
  px(g, -B.w / 2 + 1, B.hipY - 2, B.w - 2, 3, INK); px(g, -B.w / 2 + 2, B.hipY - 1, B.w - 4, 1, '#5A3A22'); bell(g, 0, B.hipY + 3, 2);
  // (the dagged collar: points out over the shoulders, a bell on each)
  for (let k = 0; k < 5; k++) {
    const cx = -B.w / 2 + 2 + (k * (B.w - 4)) / 4, col = k % 2 ? m1 : m2;
    part(g, () => { g.moveTo(cx - 4, B.shY - 1); g.lineTo(cx + 4, B.shY - 1); g.lineTo(cx, B.shY + 7); g.closePath(); }, col, cx - 4, B.shY - 1, 8, 8, 0.8);
    bell(g, cx, B.shY + 8, 1.8);
  }
  hairBack(g, B);
  headShape(g, B, face);
  faceOn(g, B, { skin: face, eyes: bonk ? 'angry' : 'open', mouth: 'grin', md: F.md, blink: F.blink, noseCol: painted ? '#E02040' : undefined });
  if (painted) { px(g, B.hx + 1, B.hy - 7, 3, 1, INK); px(g, B.hx + 5, B.hy - 7, 3, 1, INK); g.fillStyle = m1; g.beginPath(); g.moveTo(B.hx - 3, B.hy - 2); g.lineTo(B.hx - 1, B.hy + 1); g.lineTo(B.hx - 3, B.hy + 4); g.lineTo(B.hx - 5, B.hy + 1); g.closePath(); g.fill(); px(g, B.hx + 2, B.hy + 6, 6, 2, '#E02040'); }
  else whiskers(g, B);
  if (dead(F)) {
    hairTop(g, B);
    // (the hat's off on the floor, its points flopped, its bells spilled)
    partTop(g, () => { g.moveTo(B.hx + 14, -2); g.lineTo(B.hx + 46, -2); g.quadraticCurveTo(B.hx + 52, -10, B.hx + 56, -4); g.lineTo(B.hx + 40, -10); g.lineTo(B.hx + 30, -14); g.lineTo(B.hx + 20, -9); g.quadraticCurveTo(B.hx + 10, -10, B.hx + 14, -2); g.closePath(); }, m1, B.hx + 10, -14, 46, 12, 1);
    px(g, B.hx + 28, -13, 10, 6, m2);
    for (const [bx, by] of [[B.hx + 12, -3], [B.hx + 58, -3], [B.hx + 64, -2], [B.hx + 34, -2]]) bell(g, bx, by, 2.2);
  } else {
    // (the belled hat: three floppy points in the two colors, stepped, a bell on each; its band)
    const fl = Math.sin(F.fr) * 2;
    const pt = (path: () => void, col: string, x: number, y: number, w: number, h: number) => partTop(g, path, col, x, y, w, h, 1);
    pt(() => { g.moveTo(B.hx - 10, B.hy - 5); g.quadraticCurveTo(B.hx - 24, B.hy - 16 + fl, B.hx - 19, B.hy - 27); g.quadraticCurveTo(B.hx - 14, B.hy - 18, B.hx - 3, B.hy - 12); g.closePath(); }, m2, B.hx - 24, B.hy - 27, 21, 22);
    pt(() => { g.moveTo(B.hx + 8, B.hy - 12); g.quadraticCurveTo(B.hx + 16, B.hy - 18, B.hx + 21, B.hy - 25 - fl); g.quadraticCurveTo(B.hx + 22, B.hy - 12, B.hx + 11, B.hy - 5); g.closePath(); }, m2, B.hx + 8, B.hy - 25, 15, 20);
    pt(() => { g.moveTo(B.hx - 9, B.hy - 5); g.quadraticCurveTo(B.hx - 6, B.hy - 22, B.hx + 1, B.hy - 34); g.quadraticCurveTo(B.hx + 6, B.hy - 22, B.hx + 11, B.hy - 5); g.closePath(); }, m1, B.hx - 9, B.hy - 34, 20, 29);
    px(g, B.hx - 5, B.hy - 20, 2, 12, lt(m1, 0.3)); px(g, B.hx + 5, B.hy - 18, 3, 12, dk(m1, 0.25));
    px(g, B.hx - 18, B.hy - 22, 2, 6, lt(m2, 0.3));
    for (const [bx, by] of [[B.hx - 19, B.hy - 28], [B.hx + 1, B.hy - 35], [B.hx + 21, B.hy - 26 - fl]]) bell(g, bx, by, 2.6);
    part(g, () => g.rect(B.hx - 11, B.hy - 7, 23, 3), dk(m1, 0.2), B.hx - 11, B.hy - 7, 23, 3, 1);
    for (let k = -9; k < 11; k += 4) px(g, B.hx + k, B.hy - 6, 2, 1, GILT[3]);
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: m1, hand: L.skin });
  // (the bladder on a stick, in his belt or swung)
  const bladder = (x: number, y: number, a: number) => {
    g.save(); g.translate(x, y); g.rotate(a);
    part(g, () => g.rect(0, -1.6, 19, 3.2), '#8A5A30', 0, -1.6, 19, 3.2, 0.8); px(g, 0, -1, 19, 1, '#B8864A');
    for (const k of [6, 12]) px(g, k, -2, 2, 4, m2);
    ball(g, 25, 0, 6.5, '#F49AC8', 1); ball(g, 24, -1, 4.5, '#F8B8D8', 0); px(g, 22, -4, 2, 2, '#FFFFFF'); px(g, 18, -2, 2, 4, '#D8609E');
    g.restore();
  };
  if (!H.held && (bonk || flip)) bladder(H.near[0], H.near[1], bonk ? -0.3 : -1.2);
  else if (!H.held) bladder(-B.w / 2 - 2, B.hipY - 4, -1.5);
};
export const drawJester = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const s = e.aiState ?? '', alive = e.health > 0 && !reaction(e);
  const v = s === 'juggle' ? 'juggle' : s === 'bonkWind' ? 'bonk' : s === 'flip' ? 'flip' : s === 'after' ? 'after' : alive ? 'idle' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['juggle', 'bonkWind'], ['flip']), v);
  if (v === 'juggle' || (v === 'idle' && F.pose === 'stand')) F.fr = Math.floor(f / (v === 'juggle' ? 4 : 9)) % 2;
  // (a cartwheel: the whole of him turned)
  if (v === 'flip') { c.save(); c.translate(0, -36); c.rotate(-(e.aiTimer ?? 0) * 0.26); c.translate(0, 36); }
  putFrame(c, 'fa-jester2', F, BOX, g => paintJester(g, F));
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
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 14, -Math.PI / 2 - open, -Math.PI / 2 + open); g.closePath(); g.fill();
  g.fillStyle = dk(col, 0.12); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 13, -Math.PI / 2 - open, -Math.PI / 2 + open); g.closePath(); g.fill();
  // (the pleats: lit and shaded by turns, the ribs, painted flowers along the edge, the guard sticks)
  const n = 8;
  for (let k = 0; k < n; k++) { const t0 = -Math.PI / 2 - open + (k * 2 * open) / n, t1 = t0 + (2 * open) / n; if (k % 2) continue; g.fillStyle = lt(col, 0.3); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 13, t0, t1); g.closePath(); g.fill(); }
  g.strokeStyle = dk(col, 0.35); g.lineWidth = 0.8; for (let k = 0; k <= n; k++) { const t = -Math.PI / 2 - open + (k * 2 * open) / n; g.beginPath(); g.moveTo(Math.cos(t) * 3, Math.sin(t) * 3); g.lineTo(Math.cos(t) * 13, Math.sin(t) * 13); g.stroke(); }
  for (let k = 1; k < n; k += 2) { const t = -Math.PI / 2 - open + (k * 2 * open) / n; px(g, Math.cos(t) * 10 - 1, Math.sin(t) * 10 - 1, 2, 2, k % 4 === 1 ? '#E11D48' : '#7AC860'); }
  g.strokeStyle = GILT[2]; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, 12.5, -Math.PI / 2 - open, -Math.PI / 2 + open); g.stroke();
  ball(g, 0, 0, 1.6, GILT[3], 0.6);
  g.restore();
};
const paintCourtier = (g: Ctx, F: Frame) => {
  const B = bodyOf(F.seed, F.pose, F.fr), L = B.L, gown = pickOf(F.seed, 2, GOWNS);
  const flut = F.v === 'flutter', slap = F.v === 'slap', wait = F.v === 'wait';
  // (the gown: a bell to the floor over the legs, its panels catching the light, a brocade lattice, a gilt hem)
  const sk = () => { g.moveTo(-B.hipW / 2, B.hipY - 4); g.lineTo(B.hipW / 2, B.hipY - 4); g.quadraticCurveTo(B.hipW / 2 + 12, -8, B.hipW / 2 + 14, -1); g.lineTo(-B.hipW / 2 - 14, -1); g.quadraticCurveTo(-B.hipW / 2 - 12, -8, -B.hipW / 2, B.hipY - 4); g.closePath(); };
  part(g, sk, gown, -B.hipW / 2 - 14, B.hipY - 4, B.hipW + 28, -B.hipY + 3, 1.2);
  inside(g, sk, () => {
    for (let y = B.hipY; y < 0; y += 6) for (let x = -B.hipW / 2 - 14 + ((y / 6) % 2) * 3; x < B.hipW / 2 + 14; x += 6) { px(g, x, y, 1, 1, dk(gown, 0.22)); px(g, x + 3, y + 3, 1, 1, lt(gown, 0.35)); }
    for (const k of [-0.6, -0.15, 0.3]) { const x0 = k * B.hipW; g.strokeStyle = lt(gown, 0.32); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, B.hipY - 2); g.lineTo(x0 * 2.1, -1); g.stroke(); g.strokeStyle = dk(gown, 0.25); g.lineWidth = 1; g.beginPath(); g.moveTo(x0 + 3, B.hipY - 2); g.lineTo(x0 * 2.1 + 5, -1); g.stroke(); }
    px(g, B.hipW / 2 + 4, B.hipY, 12, -B.hipY, dk(gown, 0.2)); dither(g, B.hipW / 2, B.hipY, 4, -B.hipY, dk(gown, 0.2));
    px(g, -B.hipW / 2 - 16, -5, B.hipW + 32, 3, GILT[2]); for (let k = -B.hipW / 2 - 14; k < B.hipW / 2 + 14; k += 4) px(g, k, -5, 1, 1, GILT[4]);
  });
  // (the gilt girdle hanging down the front)
  for (let y = B.hipY; y < -14; y += 3) px(g, 2 + Math.sin(y * 0.3), y, 2, 2, (y / 3) % 2 ? GILT[3] : GILT[2]);
  ball(g, 3, -12, 2, GILT[3], 0.6);
  const H = handsAt(B, F, [-B.w / 2 - 2, B.shY + 18], flut ? [B.hx + 10, B.hy + 10 + (F.fr % 2) * 4] : slap ? [B.w / 2 + 16, B.shY + 4] : wait ? [B.w / 2 + 12, B.shY + 6] : [B.w / 2 + 4, B.shY + 16]);
  // (the far arm's hanging sleeve)
  const fa = arm(g, B, -1, H.far[0], H.far[1], { sleeve: dk(gown, 0.12), hand: L.skin });
  part(g, () => { g.moveTo(fa.ex - 3, fa.ey); g.lineTo(fa.ex + 3, fa.ey); g.lineTo(fa.ex - 2, fa.ey + 22); g.lineTo(fa.ex - 8, fa.ey + 18); g.closePath(); }, dk(gown, 0.2), fa.ex - 8, fa.ey, 11, 22, 1);
  const tp = torso(g, B, gown);
  // (the bodice: laced, stepped, a gilt trim round the square neck; pearls)
  inside(g, tp, () => { px(g, -B.w / 2, B.shY, 3, 40, lt(gown, 0.3)); px(g, B.w / 2 - 4, B.shY, 6, 40, dk(gown, 0.25)); dither(g, B.w / 2 - 6, B.shY, 2, 40, dk(gown, 0.25)); });
  px(g, -B.w / 2 + 3, B.shY + 1, B.w - 6, 2, GILT[3]); px(g, -5, B.shY + 1, 10, 6, L.skin); px(g, -5, B.shY + 6, 10, 1, GILT[3]);
  for (let y = B.shY + 9; y < B.hipY - 1; y += 3) { px(g, -2, y, 1, 1, '#FFFFFF'); px(g, 1, y + 1, 1, 1, '#FFFFFF'); }
  for (let k = -4; k <= 4; k += 2) px(g, k, B.shY + 2 + Math.abs(k) * 0.3, 1.5, 1.5, '#FFF8F0');
  hairBack(g, B, B.L.hair, 18);
  headShape(g, B, L.skin);
  faceOn(g, B, { skin: L.skin, eyes: flut || slap ? 'angry' : 'open', mouth: slap ? 'teeth' : 'flat', md: F.md, blink: F.blink });
  whiskers(g, B);
  hairTop(g, B);
  if (dead(F)) {
    // (the cone hat knocked off, flat on the floor, the veil off it)
    partTop(g, () => { g.moveTo(B.hx + 14, -2); g.lineTo(B.hx + 52, -6); g.lineTo(B.hx + 16, -11); g.closePath(); }, gown, B.hx + 14, -11, 38, 9, 1);
    px(g, B.hx + 16, -6, 6, 4, GILT[3]); for (let k = 0; k < 4; k++) px(g, B.hx + 22 + k * 7, -7 + k * 0.3, 2, 2, lt(gown, 0.35));
    g.save(); g.globalAlpha = 0.6; g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(B.hx + 50, -6); g.quadraticCurveTo(B.hx + 64, -2, B.hx + 70, -1); g.lineTo(B.hx + 52, -1); g.closePath(); g.fill(); g.restore();
  } else {
    // (the hennin: a tall cone back off the head, banded in steps, a gilt circlet; its veil streaming)
    const cone = () => { g.moveTo(B.hx - 8, B.hy - 6); g.lineTo(B.hx + 6, B.hy - 9); g.lineTo(B.hx - 17, B.hy - 46); g.closePath(); };
    partTop(g, cone, gown, B.hx - 17, B.hy - 46, 23, 40, 1);
    inside(g, cone, () => { for (let k = 0; k < 5; k++) px(g, B.hx - 18, B.hy - 40 + k * 7, 26, 2, k % 2 ? lt(gown, 0.35) : dk(gown, 0.15)); px(g, B.hx - 2, B.hy - 46, 10, 40, dk(gown, 0.22)); });
    g.save(); g.globalAlpha = 0.55; g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(B.hx - 17, B.hy - 46); g.quadraticCurveTo(B.hx - 32, B.hy - 20, B.hx - 24, B.hy + 12); g.lineTo(B.hx - 16, B.hy + 10); g.quadraticCurveTo(B.hx - 22, B.hy - 18, B.hx - 14, B.hy - 40); g.closePath(); g.fill();
    g.globalAlpha = 0.35; g.beginPath(); g.moveTo(B.hx - 16, B.hy - 44); g.quadraticCurveTo(B.hx - 26, B.hy - 24, B.hx - 20, B.hy + 4); g.lineTo(B.hx - 18, B.hy + 4); g.closePath(); g.fill(); g.restore();
    px(g, B.hx - 9, B.hy - 8, 16, 3, INK); px(g, B.hx - 8, B.hy - 7, 14, 1, GILT[3]); px(g, B.hx - 2, B.hy - 9, 3, 3, '#F472B6');
  }
  arm(g, B, 1, H.near[0], H.near[1], { sleeve: gown, hand: L.skin });
  if (!H.held && !wait) fanAt(g, H.near[0] + 2, H.near[1] - 2, flut ? 0.9 + (F.fr % 2) * 0.2 : 0.7, flut ? (F.fr % 2 ? -0.5 : 0.2) : 0.3, lt(gown, 0.35));
};
export const drawCourtier = (c: Ctx, e: Enemy, f: number, seed: number) => {
  const s = e.aiState ?? '', v = s === 'flutter' ? 'flutter' : s === 'slapWind' ? 'slap' : s === 'wait' ? 'wait' : '';
  const F = frameFor(e, f, seed, poseOf(e, ['flutter', 'slapWind'], ['after']), v);
  if (v === 'flutter') F.fr = Math.floor(f / 3) % 2;
  putFrame(c, 'fa-courtier2', F, BOX, g => paintCourtier(g, F));
};

/** A fan in flight (hazards.ts): spinning flat, open. */
export const drawFan = (c: Ctx, x: number, y: number, t: number) => fanAt(c, x, y, 0.9, t * 0.7, '#FFE4F0');
/** A juggling pin in flight. */
export const drawPin = (c: Ctx, x: number, y: number, t: number) => pin(c, x, y, t * 0.5);
