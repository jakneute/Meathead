// The giant atom's people, dressed by job over Spooky Land's one person drawer (spooky/costume.ts: who they are is by
// seed, lookOf: men and women, every skin, build and hair), each frame painted once into a stamp:
//   hand     a stagehand: blacks, a headset, work gloves, a flashlight on the belt
//   rigger   a rigger: a hi-vis vest over grays, a hard hat, a big wrench (the warehouse's workers wear the same, no
//            wrench: `worker`)
//   flag     the moon landing's astronaut: a padded silver suit, a fishbowl helmet, the flag on a pole with a brass
//            spike on the end of it (a real one)
//   martian  a friendly martian: a green bodysuit, green face paint, fins, a headband with two antennae, each one tipped
//            with a spiked ball (welded on: the costume shop's idea of fun)
//   op       the ride's operator: a teal-and-silver jumpsuit with a big collar, a pillbox hat, a rocket badge
//   guest    a guest: their own clothes
// Feet at the origin, facing right.

import {
  type Pose, type Mood, type Body, type Frame, INK, dk, lt, part, partTop, flat, px, limb, ball,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, pickOf,
} from '../../spooky/costume';
import { idleTasks } from '../../../m1/game/scenes/art/raster';

type Ctx = CanvasRenderingContext2D;

export type Outfit = 'hand' | 'rigger' | 'worker' | 'flag' | 'martian' | 'op' | 'guest';
export interface Wear { seed: number; f: number; pose: Pose; md: Mood; t?: number; woman?: boolean; talk?: boolean }

const HIVIS = ['#FACC15', '#F97316', '#A3E635'];
const MARTIAN = ['#4ADE80', '#22C55E', '#84CC16'];

/** Their head, as themselves (or painted green): hair, head, face, whiskers, glasses. */
const ownHead = (g: Ctx, B: Body, F: Frame, eyes: 'open' | 'angry' | 'wide' | 'tired', mouth: 'flat' | 'frown' | 'teeth' | 'grin' | 'o' | 'smile' | 'talk', skin = B.L.skin, hair = true) => {
  if (hair) hairBack(g, B);
  headShape(g, B, skin);
  faceOn(g, B, { skin, eyes, mouth, md: F.md, blink: F.blink });
  whiskers(g, B); glasses(g, B);
  if (hair) hairTop(g, B);
};
const mood = (F: Frame) => (F.pose === 'tell' || F.pose === 'strike' ? 'angry' : F.pose === 'after' ? 'wide' : 'open');

/** A headset: the band over, the cup, the mic round to the mouth. */
const headset = (g: Ctx, B: Body) => {
  const { hx, hy, rx } = B;
  g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.arc(hx, hy - 1, rx + 1, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  part(g, () => g.roundRect(hx - rx - 2, hy - 4, 5, 8, 1.5), '#3F3F46', hx - rx - 2, hy - 4, 5, 8, 1);
  g.strokeStyle = '#3F3F46'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(hx - rx + 1, hy + 3); g.quadraticCurveTo(hx - 1, hy + 10, hx + 5, hy + 8); g.stroke();
  px(g, hx + 4, hy + 7, 2, 2, '#18181B');
};
/** A hard hat, its brim out front. */
const hardHat = (g: Ctx, B: Body, col: string) => {
  const { hx, hy, ry } = B;
  partTop(g, () => { g.moveTo(hx - 10, hy - 3); g.quadraticCurveTo(hx - 9, hy - ry - 6, hx + 1, hy - ry - 6); g.quadraticCurveTo(hx + 11, hy - ry - 6, hx + 11, hy - 3); g.closePath(); }, col, hx - 10, hy - ry - 6, 21, ry + 3);
  part(g, () => g.rect(hx - 11, hy - 4, 26, 3), dk(col, 0.1), hx - 11, hy - 4, 26, 3, 1);
};
/** A big adjustable wrench, held at the hand (turned by `a`). */
export const wrench = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  limb(g, -2, 0, 22, 0, 4.5, '#9CA3AF');
  part(g, () => { g.moveTo(20, -6); g.lineTo(30, -6); g.lineTo(30, -1); g.lineTo(24, -1); g.lineTo(24, 2); g.lineTo(30, 2); g.lineTo(30, 6); g.lineTo(20, 6); g.closePath(); }, '#A1A1AA', 20, -6, 10, 12, 1);
  px(g, 2, -1, 16, 1, '#E5E7EB');
  g.restore();
};
/** The flag on its pole (the brass spike on the end of it: real), held at the hand, turned by `a`. */
const flagPole = (g: Ctx, x: number, y: number, a: number) => {
  g.save(); g.translate(x, y); g.rotate(a);
  limb(g, -20, 0, 44, 0, 3, '#D4D4D8');
  flat(g, () => { g.moveTo(43, -4); g.lineTo(56, 0); g.lineTo(43, 4); g.closePath(); }, '#FBBF24', 1);
  px(g, 46, -1, 6, 1, '#FEF3C7');
  // (the flag, hung off a crossbar near the hand end: stars, and 2010 on it)
  limb(g, -6, 0, -6, -24, 2, '#D4D4D8');
  part(g, () => g.rect(-30, -26, 24, 16), '#F8FAFC', -30, -26, 24, 16, 1);
  px(g, -30, -26, 10, 8, '#1D4ED8'); for (let k = 0; k < 3; k++) px(g, -28 + k * 3, -24 + (k % 2) * 3, 1, 1, '#FFFFFF');
  for (let k = 0; k < 3; k++) px(g, -20, -24 + k * 5, 14, 1.6, '#DC2626');
  g.restore();
};

const paint = (g: Ctx, F: Frame, outfit: Outfit, talk: boolean) => {
  const B = bodyOf(F.seed, F.pose, F.fr, F.woman), L = B.L;
  const fl = flailHands(B, F.fr);
  const sw = F.pose === 'walk' ? Math.sin((F.fr / 6) * Math.PI * 2) * 4 : 0;
  let far: [number, number] = [-B.w / 2 - 1 - sw, -33], near: [number, number] = [B.w / 2 + 1 + sw, -33];
  const m = mood(F);
  switch (outfit) {
    case 'hand': case 'worker': case 'rigger': {
      const blacks = outfit === 'hand';
      const top = blacks ? '#1F1F23' : '#6B7280', bottom = blacks ? '#18181B' : '#374151';
      // (working the controls: both hands out at a console; cowering: hands up; the rigger's wind-up and throw)
      if (F.pose === 'tell' && outfit !== 'rigger') { far = [B.w / 2 + 5, -42 + (F.fr % 2)]; near = [B.w / 2 + 12, -41 - (F.fr % 2)]; }
      if (F.pose === 'after') { far = [B.hx - 2, B.hy + 4]; near = [B.hx + 9, B.hy + 2]; }
      if (outfit === 'rigger' && F.pose === 'tell') near = [-B.w / 2 - 6, B.shY - 10];
      if (outfit === 'rigger' && F.pose === 'strike') near = [B.w / 2 + 16, B.shY - 4];
      if (fl) [far, near] = fl;
      legs(g, B, { col: bottom, shoe: 'boot', shoeCol: blacks ? '#111827' : '#78350F' });
      arm(g, B, -1, far[0], far[1], { sleeve: top, hand: blacks ? '#27272A' : L.skin, len: blacks ? 0.5 : 0.45 });
      const path = torso(g, B, top);
      if (!blacks) {
        // (the hi-vis vest, its reflective stripes)
        const vest = pickOf(F.seed, 4, HIVIS);
        g.save(); g.beginPath(); path(); g.clip();
        part(g, () => g.rect(-B.w / 2 - 2, B.shY, B.w + 6, -B.shY + B.hipY), vest, -B.w / 2 - 2, B.shY, B.w + 6, -B.shY + B.hipY, 0);
        px(g, -B.w / 2 - 2, B.shY + 12, B.w + 6, 2, '#E5E7EB'); px(g, -B.w / 2 - 2, B.shY + 18, B.w + 6, 2, '#E5E7EB');
        g.restore();
      } else {
        // (the flashlight on the belt, the gaff tape round the wrist)
        px(g, -B.hipW / 2 - 1, B.hipY - 1, B.hipW + 2, 2, '#3F3F46');
        part(g, () => g.rect(B.hipW / 2 - 4, B.hipY - 2, 4, 9), '#52525B', B.hipW / 2 - 4, B.hipY - 2, 4, 9, 1);
      }
      ownHead(g, B, F, m, F.pose === 'after' ? 'o' : talk ? 'talk' : F.pose === 'strike' ? 'teeth' : 'flat', L.skin, outfit === 'hand' || L.long);
      if (blacks) headset(g, B); else hardHat(g, B, outfit === 'rigger' ? '#F8FAFC' : pickOf(F.seed, 6, ['#FACC15', '#F8FAFC', '#3B82F6']));
      if (outfit === 'rigger' && !fl) wrench(g, near[0], near[1], F.pose === 'tell' ? -2.2 : F.pose === 'strike' ? 0.3 : -0.9);
      arm(g, B, 1, near[0], near[1], { sleeve: top, hand: blacks ? '#27272A' : L.skin, len: blacks ? 0.5 : 0.45 });
      break;
    }
    case 'flag': {
      const suit = '#D4D4D8';
      const thrust = F.pose === 'strike' ? 18 : F.pose === 'tell' ? -14 : 0;
      far = [B.w / 2 + 2 + thrust, -40]; near = [B.w / 2 + 12 + thrust, -41];
      if (fl) [far, near] = fl;
      legs(g, B, { col: suit, shoe: 'boot', shoeCol: '#E5E7EB', detail: (gg, _h, knee, _f, n) => px(gg, knee[0] - 3, knee[1] - 1, 7, 2, n ? '#A1A1AA' : '#71717A') });
      arm(g, B, -1, far[0], far[1], { sleeve: suit, hand: '#F5F5F4', w: B.armW + 1.5 });
      torso(g, B, suit, B.shY, B.hipY + 2, 5);
      // (the life-support pack on the back, the chest box, the mission patch)
      part(g, () => g.roundRect(-B.w / 2 - 9, B.shY + 1, 9, 22, 2), '#E7E5E4', -B.w / 2 - 9, B.shY + 1, 9, 22, 1);
      part(g, () => g.rect(-3, B.shY + 7, 11, 8), '#A1A1AA', -3, B.shY + 7, 11, 8, 1);
      px(g, -1, B.shY + 9, 2, 2, '#EF4444'); px(g, 3, B.shY + 9, 2, 2, '#22C55E');
      ownHead(g, B, F, m, F.pose === 'strike' ? 'teeth' : talk ? 'talk' : 'grin');
      // (the fishbowl: a glass bubble over the head, a glint on it, the collar ring)
      const { hx, hy } = B;
      g.save(); g.globalAlpha = 1; g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.arc(hx + 1, hy - 1, 15, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = '#BAE6FD'; g.lineWidth = 1; g.beginPath(); g.arc(hx + 1, hy - 1, 13.6, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); g.restore();
      px(g, hx - 8, hy - 10, 3, 2, '#F0F9FF'); px(g, hx - 9, hy - 7, 1.5, 3, '#F0F9FF');
      part(g, () => g.rect(hx - 12, hy + 12, 26, 4), '#9CA3AF', hx - 12, hy + 12, 26, 4, 1);
      if (!fl) flagPole(g, near[0] - 6, near[1] + 1, F.pose === 'tell' ? -0.15 : 0);
      arm(g, B, 1, near[0], near[1], { sleeve: suit, hand: '#F5F5F4', w: B.armW + 1.5 });
      break;
    }
    case 'martian': {
      const body = pickOf(F.seed, 3, MARTIAN), paintSkin = '#86EFAC';
      // (the head down and forward for the ram: antennae first)
      if (F.pose === 'tell') { B.lean = -3; far = [-B.w / 2 - 6, -30]; near = [-B.w / 2 - 2, -32]; }
      if (F.pose === 'strike') { B.lean = 8; B.hx += 8; B.hy += 8; far = [-B.w / 2 - 8, -42]; near = [-B.w / 2 - 4, -44]; }
      if (fl) [far, near] = fl;
      legs(g, B, { col: body, shoe: 'boot', shoeCol: '#14532D' });
      arm(g, B, -1, far[0], far[1], { sleeve: body, hand: '#166534' });
      torso(g, B, body);
      // (the fins down the back, the silver belt with the ray-gun holster: empty, it's a prop)
      flat(g, () => { g.moveTo(-B.w / 2 + B.lean, B.shY + 4); g.lineTo(-B.w / 2 - 10 + B.lean, B.shY - 4); g.lineTo(-B.w / 2 + B.lean, B.shY + 16); g.closePath(); }, '#15803D', 1);
      px(g, -B.hipW / 2 - 1, B.hipY - 2, B.hipW + 2, 3, '#D4D4D8');
      ownHead(g, B, F, F.pose === 'strike' ? 'angry' : m, F.pose === 'strike' ? 'teeth' : talk ? 'talk' : 'grin', paintSkin, false);
      // (the headband, its two springy antennae, a spiked ball on each)
      const { hx, hy, ry } = B;
      px(g, hx - 9, hy - 6, 19, 2.5, '#A1A1AA');
      const wob = F.fr % 2 ? 1 : -1;
      for (const s of [-1, 1]) {
        const tx = hx + s * 7 + wob + (F.pose === 'strike' ? 10 : 0), ty = hy - ry - 14 + (F.pose === 'strike' ? 8 : 0);
        limb(g, hx + s * 4, hy - ry + 1, tx, ty, 1.5, '#71717A');
        ball(g, tx, ty, 4, '#9CA3AF', 1);
        for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; flat(g, () => { g.moveTo(tx + Math.cos(a - 0.35) * 3.6, ty + Math.sin(a - 0.35) * 3.6); g.lineTo(tx + Math.cos(a) * 8.5, ty + Math.sin(a) * 8.5); g.lineTo(tx + Math.cos(a + 0.35) * 3.6, ty + Math.sin(a + 0.35) * 3.6); g.closePath(); }, '#E5E7EB', 0.7); }
      }
      arm(g, B, 1, near[0], near[1], { sleeve: body, hand: '#166534' });
      break;
    }
    case 'op': {
      const suit = '#0F766E', trim = '#E5E7EB';
      if (F.pose === 'tell') { near = [B.w / 2 + 12, -44]; far = [B.w / 2 + 4, -45]; }
      if (F.pose === 'strike') near = [B.w / 2 + 8, B.shY - 14];
      if (fl) [far, near] = fl;
      legs(g, B, { col: suit, shoe: 'boot', shoeCol: '#F8FAFC' });
      arm(g, B, -1, far[0], far[1], { sleeve: suit, hand: L.skin, len: 0.8 });
      torso(g, B, suit);
      // (the big silver collar, the rocket badge, the stripe down)
      flat(g, () => { g.moveTo(-B.w / 2 - 3, B.shY - 1); g.lineTo(B.w / 2 + 3, B.shY - 1); g.lineTo(B.w / 2 - 2, B.shY + 6); g.lineTo(0, B.shY + 3); g.lineTo(-B.w / 2 + 2, B.shY + 6); g.closePath(); }, trim, 1);
      px(g, -1, B.shY + 4, 2, B.hipY - B.shY - 2, trim);
      flat(g, () => { g.moveTo(5, B.shY + 9); g.lineTo(7, B.shY + 15); g.lineTo(3, B.shY + 15); g.closePath(); }, '#FBBF24', 0.8);
      ownHead(g, B, F, m, talk ? 'talk' : F.pose === 'after' ? 'o' : 'smile');
      partTop(g, () => g.roundRect(B.hx - 6, B.hy - B.ry - 5, 13, 6, 1), suit, B.hx - 6, B.hy - B.ry - 5, 13, 6, 1);
      px(g, B.hx - 6, B.hy - B.ry - 1, 13, 1.5, trim);
      arm(g, B, 1, near[0], near[1], { sleeve: suit, hand: L.skin, len: 0.8 });
      break;
    }
    case 'guest': {
      if (fl) [far, near] = fl;
      if (F.pose === 'after') { far = [B.hx - 2, B.hy + 4]; near = [B.hx + 9, B.hy + 2]; }
      legs(g, B, { col: L.pants, shoe: 'sneaker', shoeCol: pickOf(F.seed, 5, ['#F8FAFC', '#1F2937', '#B91C1C']) });
      arm(g, B, -1, far[0], far[1], { sleeve: L.shirt, hand: L.skin, len: 0.4 });
      torso(g, B, L.shirt);
      // (a souvenir: the park's mouse-free ears, a lanyard, a fanny pack; by seed)
      const extra = F.seed % 4;
      if (extra === 1) px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 4, '#7C3AED');
      if (extra === 2) { px(g, -2, B.shY + 1, 1, 12, '#EF4444'); px(g, -4, B.shY + 12, 5, 6, '#F8FAFC'); }
      ownHead(g, B, F, m, talk ? 'talk' : F.pose === 'after' ? 'o' : F.md === 'ok' ? 'flat' : 'o');
      if (extra === 3) { ball(g, B.hx - 6, B.hy - B.ry - 2, 4, '#1E3A8A', 1); ball(g, B.hx + 7, B.hy - B.ry - 2, 4, '#1E3A8A', 1); }
      arm(g, B, 1, near[0], near[1], { sleeve: L.shirt, hand: L.skin, len: 0.4 });
      break;
    }
  }
};

/** The box about their feet they're painted in. */
const PERSON_BOX: [number, number, number, number] = [-64, -112, 150, 118];
/** One of them, from its stamp. */
export const drawAtomPerson = (c: Ctx, outfit: Outfit, w: Wear) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, w.t ?? 0, w.woman, `${outfit}${w.talk ? 't' : ''}`);
  putFrame(c, `atom-${outfit}`, F, PERSON_BOX, g => paint(g, F, outfit, !!w.talk));
};
/** One of them turned (`rot`, about the feet): sent flying, spinning. The stamp cache won't take a turned transform, so
 *  this was painted live every frame for each of them (the Voyage's brake run, two dozen at once: the user's "frame
 *  rate drops to around 45 during the new brake run carnage"). Painted once, flat, into its own canvas at the scale
 *  it's showing at (stepped up in doubles), then put down turned. */
const turned = new Map<string, HTMLCanvasElement>();
const turnedId = (outfit: Outfit, w: Wear, c: Ctx) => {
  const F = frameOf(w.seed, w.f, w.pose, w.md, w.t ?? 0, w.woman, `${outfit}${w.talk ? 't' : ''}`);
  const m = c.getTransform(), sc = Math.hypot(m.a, m.b);
  const res = Math.min(8, 2 ** Math.ceil(Math.log2(Math.max(1, sc))));
  return { F, res, id: `${outfit}|${F.seed}|${F.pose}|${F.fr}|${F.md}|${F.t}|${F.blink ? 1 : 0}|${F.woman}|${F.v}@${res}` };
};
const bakeTurned = (outfit: Outfit, w: Wear, F: Frame, res: number, id: string) => {
  const [bx, by, bw, bh] = PERSON_BOX;
  if (turned.size > 200) turned.clear();
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(bw * res); cv.height = Math.ceil(bh * res);
  const g = cv.getContext('2d')!;
  g.scale(res, res); g.translate(-bx, -by);
  g.beginPath(); g.rect(bx, by, bw, bh); g.clip();
  paint(g, F, outfit, !!w.talk);
  turned.set(id, cv);
  return cv;
};
export const drawAtomPersonTurned = (c: Ctx, outfit: Outfit, w: Wear, rot: number) => {
  if (typeof document === 'undefined') { c.rotate(rot); drawAtomPerson(c, outfit, w); return; }
  const { F, res, id } = turnedId(outfit, w, c);
  const cv = turned.get(id) ?? bakeTurned(outfit, w, F, res, id);
  const [bx, by, bw, bh] = PERSON_BOX;
  c.rotate(rot);
  c.drawImage(cv, bx, by, bw, bh);
};
/** ...painted ahead, in idle moments, at the scale `c` is drawing at now (a crowd about to be flung all at once: not
 *  a dozen painted in the one frame). */
const primedTurn = new Set<string>();
export const primeAtomPersonTurned = (c: Ctx, outfit: Outfit, w: Wear) => {
  if (typeof document === 'undefined') return;
  const { F, res, id } = turnedId(outfit, w, c);
  if (turned.has(id) || primedTurn.has(id)) return;
  if (primedTurn.size > 512) primedTurn.clear();
  primedTurn.add(id);
  idleTasks([() => { if (!turned.has(id)) bakeTurned(outfit, w, F, res, id); }]);
};
/** Just their top half, sat in something (a ride's sled), from the waist up: the rest of them is the sled's. */
export const drawSeated = (c: Ctx, outfit: Outfit, w: Wear, sink = 30) => {
  c.save(); c.translate(0, sink); drawAtomPerson(c, outfit, w); c.restore();
};
export { lt as lighten, dk as darken };
