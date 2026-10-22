// The Jungle Cruise's staff: on break out back, on the dock. They can't be arsed to fight him (harmless: they stand
// there; hit one and they take it). Each one's look from their seed (homeX): man or woman, skin, build, hair.
//
// Drawn (the SNES pass) on Spooky Land's person drawer (costume.ts: every material in its steps, dithered, inked;
// painted once a frame into a stamp): the teal staff polo (its collar, placket, sleeve hems, the HAPPY LAND badge and a
// name tag), khaki work pants with a belt and a radio on it, boots, the teal visor; whatever they're doing instead of
// their job (a cigarette, a phone, sat on an upturned bucket, leant on a push broom, the operator stood with a hand
// on the podium mic). Hurt, knocked about (grabbed, flung, dazed) and dead too, so the engine's special deaths read:
// dead, the visor's knocked crooked (on them: the engine's deaths tip the body over, and a visor on the floor would float).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import { registerM2Kind } from '../../kinds';
import {
  type Pose, type Body, type Frame, INK, dk, lt, part, px, ball, dither, limb, shoe,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, hairTop, hairBack, frameOf, putFrame, moodOf, reaction,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;

const hash = (n: number) => { let h = Math.floor(Math.abs(n)) * 2654435761; h ^= h >>> 13; return (h >>> 0) % 997; };

/** Who they are (their voice goes by it: a woman's or a man's). */
export interface StaffLook { woman: boolean }
export const staffLook = (seed: number): StaffLook => ({ woman: hash(seed) % 2 === 0 });
/** What a staffer's doing (out back): drawn with it. */
export type StaffDoing = 'smoke' | 'phone' | 'sit' | 'broom' | 'stand';
export const staffDoing = new WeakMap<Enemy, StaffDoing>();
/** Their mouth going (they're saying something). */
export const staffTalking = new WeakSet<Enemy>();

const POLO = '#0F766E', PANTS = '#B8A47A', BOOT = '#4A3220', BADGE = '#FDE047';
const BOX: [number, number, number, number] = [-60, -110, 130, 116];

const paintStaffer = (g: Ctx, F: Frame, doing: StaffDoing, talk: boolean) => {
  const B: Body = bodyOf(F.seed, F.pose, F.fr, F.woman), L = B.L;
  const held = !!B.held, sit = doing === 'sit' && !held && F.md !== 'dead';
  const fl = flailHands(B, F.fr);
  // (sat on the bucket: it, and the body brought down onto it)
  if (sit) {
    part(g, () => { g.moveTo(-11, 0); g.lineTo(-9, -19); g.lineTo(9, -19); g.lineTo(11, 0); g.closePath(); }, '#F97316', -11, -19, 22, 19, 1.2);
    px(g, -9, -19, 18, 2, '#FDBA74'); px(g, -10, -12, 20, 1, '#C2410C'); px(g, -7, -9, 3, 6, '#FB923C');
    g.save(); g.translate(0, 12);
  }
  // The legs: khaki work pants, boots (sat: thighs out along the bucket's top, shins down)
  if (sit) {
    for (const s of [0, 1] as const) {
      const near = s === 1, col = near ? PANTS : dk(PANTS, 0.14);
      const hx = (s ? 1 : -1) * B.hipW * 0.22, hip = B.hipY + 2, kx = hx + 15, fx = kx + 3;
      limb(g, hx, hip, kx, hip - 1, B.legW, col); limb(g, kx, hip - 1, fx, -12, B.legW - 0.5, col);
      shoe(g, fx - 1, -12, 'boot', BOOT, L.skin, near);
    }
  } else legs(g, B, { col: PANTS, shoe: 'boot', shoeCol: BOOT, detail: (gg, _h, knee, foot, near) => {
    // (a crease down the front, the cuff over the boot)
    px(gg, knee[0] + 1, knee[1] - 4, 1, 6, near ? lt(PANTS, 0.25) : PANTS);
    px(gg, foot[0] - 4, foot[1] - 3, 9, 2, dk(PANTS, 0.25));
  } });
  // Where the hands go
  const sh = B.shY;
  let far: [number, number] = [-B.w / 2 - 3, sh + 22], near: [number, number] = [B.w / 2 + 3, sh + 22];
  if (!fl) {
    if (doing === 'smoke') { far = [-B.w / 2 - 2, sh + 22]; near = [B.hx + 7, B.hy + 7]; }
    else if (doing === 'phone') { far = [-B.w / 2 - 1, sh + 22]; near = [B.w / 2 + 2, sh + 12]; }
    else if (doing === 'sit') { far = [10, B.hipY + 1]; near = [16, B.hipY]; }
    else if (doing === 'broom') { far = [B.w / 2 + 6, sh + 4]; near = [B.w / 2 + 10, sh + 20]; }
    else { far = [-B.w / 2 + 1, B.hipY - 2]; near = [B.w / 2 + 8, sh + 12]; }
  } else { far = fl[0]; near = fl[1]; }
  // (the broom's handle, behind the near arm: leant on it)
  if (doing === 'broom' && !fl) {
    g.save(); g.translate(B.w / 2 + 8, sh + 2); g.rotate(0.12);
    part(g, () => g.rect(-1.5, -6, 3, 60), '#A0682E', -1.5, -6, 3, 60, 1); px(g, -1, -6, 1, 60, '#C8925A');
    g.restore();
    part(g, () => g.roundRect(B.w / 2 + 2, -8, 26, 6, 1.5), '#3A3A40', B.w / 2 + 2, -8, 26, 6, 1);
    for (let k = 0; k < 12; k++) px(g, B.w / 2 + 3 + k * 2, -2, 1, 2, '#E8D88A');
  }
  arm(g, B, -1, far[0], far[1], { sleeve: dk(POLO, 0.12), hand: L.skin, len: 0.45 });
  // The torso: the polo, stepped; its collar, placket and buttons; the badge and name tag; the belt and its radio
  const tp = torso(g, B, POLO);
  g.save(); g.beginPath(); tp(); g.clip();
  px(g, -B.w / 2 - 2, sh, 3, B.hipY - sh + 4, lt(POLO, 0.25)); px(g, B.w / 2 - 3, sh, 6, B.hipY - sh + 4, dk(POLO, 0.3)); dither(g, B.w / 2 - 5, sh, 2, B.hipY - sh + 4, dk(POLO, 0.3));
  px(g, -B.w / 2, B.hipY - 6, B.w + 4, 2, dk(POLO, 0.18));
  g.restore();
  part(g, () => { g.moveTo(B.hx - 7, sh - 1); g.lineTo(B.hx + 1, sh + 5); g.lineTo(B.hx + 9, sh - 1); g.lineTo(B.hx + 9, sh + 2); g.lineTo(B.hx + 1, sh + 8); g.lineTo(B.hx - 7, sh + 2); g.closePath(); }, lt(POLO, 0.12), B.hx - 7, sh - 1, 16, 9, 0.8);
  px(g, B.hx, sh + 6, 2, 9, dk(POLO, 0.3)); px(g, B.hx, sh + 9, 1, 1, '#E8E8E0'); px(g, B.hx, sh + 13, 1, 1, '#E8E8E0');
  ball(g, -B.w / 2 + 6, sh + 8, 2.4, BADGE, 0.6); px(g, -B.w / 2 + 5, sh + 7, 1, 1, '#FFFBE0');
  part(g, () => g.rect(B.w / 2 - 9, sh + 6, 7, 4), '#F8FAFC', B.w / 2 - 9, sh + 6, 7, 4, 0.6); px(g, B.w / 2 - 8, sh + 8, 5, 1, '#3A3A48');
  px(g, -B.hipW / 2 + 1, B.hipY - 2, B.hipW - 2, 3, INK); px(g, -B.hipW / 2 + 2, B.hipY - 1, B.hipW - 4, 1, '#5A3A22'); px(g, -1, B.hipY - 2, 3, 3, '#C8A040');
  part(g, () => g.roundRect(-B.hipW / 2 - 2, B.hipY - 3, 5, 9, 1), '#26262C', -B.hipW / 2 - 2, B.hipY - 3, 5, 9, 0.8); px(g, -B.hipW / 2 - 1, B.hipY - 7, 1, 4, '#26262C'); px(g, -B.hipW / 2 - 1, B.hipY - 1, 2, 1, '#4ADE80');
  // The head: hair, bored face, the visor (dead: knocked crooked (on them, or let go and gone: never on the floor by them, where it'd float once a death tips the body over))
  hairBack(g, B);
  headShape(g, B, L.skin);
  const mouth = talk ? (F.v.endsWith('1') ? 'o' : 'flat') : doing === 'smoke' ? 'smirk' : 'flat';
  faceOn(g, B, { skin: L.skin, eyes: 'tired', mouth, md: F.md, blink: F.blink });
  whiskers(g, B);
  hairTop(g, B);
  if (F.md === 'dead') {
    g.save(); g.translate(B.hx, B.hy - 6); g.rotate(0.6); g.translate(-B.hx, -B.hy + 6);
    px(g, B.hx - 9, B.hy - 7, 19, 3, INK); px(g, B.hx - 8, B.hy - 6, 17, 2, POLO);
    part(g, () => g.ellipse(B.hx + 10, B.hy - 5, 8, 2.2, 0.08, 0, Math.PI * 2), POLO, B.hx + 2, B.hy - 7, 16, 5, 1);
    g.restore();
  } else {
    px(g, B.hx - 9, B.hy - 7, 19, 3, INK); px(g, B.hx - 8, B.hy - 6, 17, 2, POLO); px(g, B.hx - 8, B.hy - 6, 17, 1, lt(POLO, 0.3));
    part(g, () => g.ellipse(B.hx + 10, B.hy - 5, 8, 2.2, 0.08, 0, Math.PI * 2), POLO, B.hx + 2, B.hy - 7, 16, 5, 1);
    px(g, B.hx + 5, B.hy - 6, 8, 1, lt(POLO, 0.35));
    ball(g, B.hx - 5, B.hy - 6, 1.4, BADGE, 0.4);
  }
  arm(g, B, 1, near[0], near[1], { sleeve: POLO, hand: L.skin, len: 0.45 });
  // What's in their hand
  if (!fl) {
    if (doing === 'smoke') { px(g, near[0] + 1, near[1] - 2, 6, 1.6, '#F8FAFC'); px(g, near[0] + 6, near[1] - 2, 1.5, 1.6, '#F97316'); }
    else if (doing === 'phone') { part(g, () => g.roundRect(near[0] - 3, near[1] - 9, 6, 10, 1), '#18181B', near[0] - 3, near[1] - 9, 6, 10, 0.8); px(g, near[0] - 2, near[1] - 8, 4, 7, '#60A5FA'); px(g, near[0] - 2, near[1] - 8, 4, 1, '#BFDBFE'); }
    else if (doing === 'stand') { part(g, () => g.roundRect(near[0] - 1, near[1] - 12, 3, 12, 1), '#2A2A2E', near[0] - 1, near[1] - 12, 3, 12, 0.8); ball(g, near[0] + 0.5, near[1] - 14, 2.6, '#3A3A40', 0.8); }
  }
  if (sit) g.restore();
};

/** A staffer at the origin (feet), facing right. */
export const drawStaffer = (c: Ctx, e: Enemy, seed: number, f: number, doing: StaffDoing, talk: boolean) => {
  const r = reaction(e), woman = staffLook(seed).woman;
  const pose: Pose = r?.pose ?? 'stand';
  const v = `${doing}${talk ? `-t${(f >> 3) % 2}` : ''}`;
  const F = frameOf(seed, f, pose, r?.md ?? moodOf(e), 0, woman, v);
  putFrame(c, 'q-staff', F, BOX, g => paintStaffer(g, F, doing, talk));
  // (their smoke, live: curling up off the cigarette)
  if (doing === 'smoke' && !r && F.md === 'ok') {
    const B = bodyOf(seed, 'stand', F.fr, woman);
    for (let k = 0; k < 3; k++) {
      const t = (f * 0.4 + k * 12) % 36;
      c.fillStyle = `rgba(226, 232, 240, ${(0.5 - t / 80).toFixed(3)})`;
      c.fillRect(Math.round(B.hx + 14 + Math.sin(t * 0.2) * 3 - 1 - t / 20), Math.round(B.hy + 4 - t), Math.round(2 + t / 8), Math.round(2 + t / 8));
    }
  }
};

registerM2Kind({
  kind: 'm2:staffer',
  stats: { w: 34, h: 62, hp: 60, contact: 0, mass: 180 },
  humanoid: true,
  make: b => ({ ...b, harmless: true, noCrowd: true }),
  // (they don't do anything: that's the joke)
  ai: (_ctx: FrameContext, e: Enemy) => { e.vel.x = 0; return false; },
  draw: (c, e, f) => drawStaffer(c, e, e.homeX ?? 0, f, staffDoing.get(e) ?? 'stand', staffTalking.has(e)),
  head: { x: 0, y: -66, r: 9 },
  gender: e => (staffLook(e.homeX ?? 0).woman ? 'f' : 'm'),
});
