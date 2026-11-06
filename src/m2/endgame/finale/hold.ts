// THE KAIJU FINALE's mobile beatdown (the owner's: "change it from a standard beat down grab to a new kind of beat down
// grab where you hold them up by the neck in one hand, can move left and right while holding them and pressing X to
// punch, B to knee and Y to headbutt. Jumping won't be allowed and you cannot break the block. It's like a special
// 'mobile beat down' just for this boss"). The finale's own: the normal beatdown (moves/grab.ts) is untouched.
//
// Y + B on a stunned one in reach: he's got them up by the throat in his left hand (the near one: the sprite mirrors
// facing left, as it always does), their feet off the ground, legs curled, clawing at his wrist. LEFT / RIGHT walk with
// them, slower than his walk (the other one's still at him: that's what the walking's for). No jump. They can't get
// loose. X a punch with the free fist, B a knee, Y a headbutt: each its own pose, its impact (a shake, a crunch, a hurt
// noise out of them). The owner's: "you can do zero damage or a lot. The more damage you do, the less you will need
// to stagger the boss on the next cycle, but a beat down will always throw them": it runs HOLD_T, always, then he
// heaves them overhead and pitches them at the section's next throw target from wherever he's walked to (throw.ts
// takes it from the heave). What the blows did (DMG: the punch quickest, the headbutt hardest) is that boss's head
// start on its meter next section (headStart: none for none, up to HEAD_MAX for a great one).

import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { drawLeg, drawArmTo, drawTorsoFromHips } from '../../../m1/game/render/player/body';
import { drawPoseSprite, drawPoseHead } from '../../moves/grab';
import { btn, pollM2 } from '../../input';
import { elbow, knee, reachTo } from '../../art/limb';
import { floorY } from './geo';
import { type Boss, bossSays } from './bosses';
import { drawSatanBody, drawWidowBody, SATAN_NECK, WIDOW_NECK } from './bossArt';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
export type Blow = 'punch' | 'knee' | 'head';

/** How long it lasts at most (frames), how many blows; his walk with them (px a frame); a blow's length, its impact. */
export const HOLD_T = 270, HOLD_WALK = 2.7, BLOW_HIT = 5, GRACE = 14;
/** Each blow's length (frames) and what it does: about the same a second whichever's mashed, the headbutt the most a
 *  blow, the punch the quickest. */
export const BLOW_T: Record<Blow, number> = { punch: 11, knee: 16, head: 22 };
export const DMG: Record<Blow, number> = { punch: 4, knee: 6, head: 9 };
/** The head start (meter points out of 100) a beatdown's damage buys next section, and its ceiling. */
export const HEAD_K = 0.55, HEAD_MAX = 65;
export const headStart = (dmg: number) => Math.min(HEAD_MAX, Math.round(dmg * HEAD_K));

export interface Hold {
  b: Boss;
  t: number; hits: number; dmg: number;
  blow: Blow | null; blowT: number;
  face: 1 | -1; walkPh: number;
  /** What was held last frame (presses are the edges). */
  was: { x: boolean; b: boolean; y: boolean };
  /** Done: time to hurl. */
  done: boolean;
}

export const startHold = (state: GameState, b: Boss): Hold => {
  const p = state.player;
  b.mode = 'carried'; b.vx = 0; b.air = false;
  const face: 1 | -1 = b.x >= p.pos.x + p.width / 2 ? 1 : -1;
  p.facing = face;
  playSound('crunch', 0.7, -8); playSound('slam', 0.5, -12);
  bossSays(state, b, b.who === 'satan' ? L.SATAN_NECK : L.WIDOW_NECK);
  return { b, t: 0, hits: 0, dmg: 0, blow: null, blowT: 0, face, walkPh: 0, was: { x: true, b: true, y: true }, done: false };
};

/** Each frame: him walking with them, the blows. Moves him itself (the engine gets no controls). */
export const updateHold = (state: GameState, h: Hold, c: Controls, auto: boolean) => {
  const p = state.player;
  h.t++;
  pollM2(state.frame);
  // (the buttons: the engine's (X shoot, B special, Y secondary) and the pad's own, as edges)
  const now = { x: !!c.shoot || btn('x'), b: !!c.special || btn('b'), y: !!c.secondary || btn('y') };
  const edge = { x: now.x && !h.was.x, b: now.b && !h.was.b, y: now.y && !h.was.y };
  h.was = now;
  if (auto && h.t % 18 === 0) edge[(['x', 'b', 'y'] as const)[(h.t / 18) % 3]] = true;
  // (the walk: slower than his own, the way he's facing kept unless he turns)
  const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
  if (dir) { h.face = dir as 1 | -1; p.facing = h.face; p.pos.x += dir * HOLD_WALK; h.walkPh += 0.22; }
  p.vel.x = 0; if (p.vel.y < 0) p.vel.y = 0;
  p.pos.y = Math.min(p.pos.y, floorY(p.pos.x + p.width / 2) - p.height);
  // (a blow)
  if (h.blow) {
    h.blowT++;
    if (h.blowT === BLOW_HIT) impact(state, h);
    if (h.blowT >= BLOW_T[h.blow]) h.blow = null;
  } else if (h.t > GRACE) {
    const pick: Blow | null = edge.x ? 'punch' : edge.b ? 'knee' : edge.y ? 'head' : null;
    if (pick) { h.blow = pick; h.blowT = 0; playSound('whoosh', 0.45, pick === 'head' ? -6 : 2); }
  }
  if (h.t >= HOLD_T) h.done = true;
};

/** Where on the boss each blow lands (from his feet, facing right): the gut (punch), between the legs (knee), the
 *  face (headbutt). */
const IMPACT: Record<Blow, P> = { punch: [36, -64], knee: [28, -40], head: [24, -84] };
const impact = (state: GameState, h: Hold) => {
  h.hits++; h.dmg += DMG[h.blow!];
  const p = state.player, x = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const [ix, iy] = IMPACT[h.blow!];
  const wx = x + h.face * ix, wy = feet + iy;
  h.b.flash = 6;
  shakeScreen(state, h.blow === 'head' ? 10 : 7, h.blow === 'head' ? 3 : 2);
  playSound(h.blow === 'punch' ? 'punch' : h.blow === 'knee' ? 'crunch' : 'slam', 0.8, -4 + Math.random() * 4);
  playSound(h.b.who === 'satan' ? 'bellow' : 'snort', 0.45, h.b.who === 'satan' ? -6 : 10);
  for (let k = 0; k < 8; k++) state.particles.push({ pos: { x: wx, y: wy }, vel: { x: h.face * (1 + Math.random() * 3), y: -1 - Math.random() * 3 }, life: 22, color: k % 3 ? (h.b.who === 'satan' ? '#7F1D1D' : '#3FA34D') : '#FDE047', size: 2 + Math.random() * 2 } as never);
  state.damageNumbers.push({ id: `fin-blow-${state.frame}`, text: h.blow === 'punch' ? 'POW!' : h.blow === 'knee' ? 'CRUNCH!' : 'BONK!', pos: { x: wx, y: wy - 20 }, vel: { x: 0, y: -2 }, life: 34, maxLife: 34, isCritical: true, isCallout: true, color: '#F8FAFC' } as never);
  if (Math.random() < 0.3) bossSays(state, h.b, h.b.who === 'satan' ? L.SATAN_NECK : L.WIDOW_NECK);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the boss dangling from his left hand (behind him), then him (his own sprite, outlined, over them)

const UPPER = 20, FORE = 20, THIGH = 13, SHIN = 13;
/** His holding hand, from his feet facing right (up and out in front, high: their feet clear of the ground). */
export const HOLD_HAND: P = [20, -92];
/** His pose holding them (facing right, feet at the origin): `blow` and how far into it (0..1), the walk's phase. */
export const neckPose = (g: Ctx, f: number, blow: Blow | null, k: number, walkPh: number, moving: boolean) => {
  const swing = Math.sin(k * Math.PI);
  const lean = blow === 'head' ? 0.42 * swing : blow === 'punch' ? 0.12 * swing : -0.08;
  const stride = moving ? Math.sin(walkPh) * 9 : 0;
  // (the legs: braced under the weight, walking; the knee up in front for the knee)
  const hipY = -23;
  const backFoot: P = [-12 - stride, 0], frontFoot: P = blow === 'knee' ? [18 - 6 * (1 - swing), -10 * swing - 2 * (1 - swing)] : [12 + stride, 0];
  for (const [hip, ft, back] of [[[-5, hipY], backFoot, true], [[5, hipY], frontFoot, false]] as [P, P, boolean][]) {
    const fo = reachTo(hip[0], hip[1], ft[0], ft[1], THIGH, SHIN), kn = knee(hip[0], hip[1], fo[0], fo[1], THIGH, SHIN, 1);
    drawLeg(g, hip, kn, fo, 0, back);
  }
  g.save(); g.translate(0, hipY); g.rotate(lean);
  // (the hand on their throat, kept where it is in the world as he leans: undone from the lean)
  const hx = HOLD_HAND[0], hy = HOLD_HAND[1] - hipY, c = Math.cos(-lean), s = Math.sin(-lean);
  const hold: P = [hx * c - hy * s, hx * s + hy * c];
  // (the free fist: up at his chest, guarding; thrown into their gut for the punch)
  const fist: P = blow === 'punch' ? [12 + 22 * swing, -34 - 6 * swing] : [8, -30];
  { const sh: P = [-8, -22], hd = reachTo(sh[0], sh[1], fist[0], fist[1], UPPER, FORE), el = elbow(sh[0], sh[1], hd[0], hd[1], UPPER, FORE, 1); drawArmTo(g, sh, el, hd, true); }
  drawTorsoFromHips(g);
  drawPoseHead(g, blow === 'head' ? 6 + 4 * swing : 3, -37, blow === 'head' ? -0.2 * swing : -0.1, blow ? 'roar' : 'grit', f);
  { const sh: P = [11, -22], hd = reachTo(sh[0], sh[1], hold[0], hold[1], UPPER, FORE), el = elbow(sh[0], sh[1], hd[0], hd[1], UPPER, FORE, 1); drawArmTo(g, sh, el, hd, false, 6); }
  g.restore();
};

/** The boss dangling by the neck from his hand (feet at (x, feet), facing `face`), kicking. */
export const drawDangle = (c: Ctx, f: number, who: 'satan' | 'widow', x: number, feet: number, face: 1 | -1, hit: boolean, flash = 0) => {
  const neck = who === 'satan' ? SATAN_NECK : WIDOW_NECK;
  c.save();
  c.translate(Math.round(x + face * HOLD_HAND[0]), Math.round(feet + HOLD_HAND[1]));
  // (they face him: turned the other way from him; a sway off his grip)
  c.scale(-face, 1); c.rotate(Math.sin(f * 0.15) * 0.05);
  c.translate(-neck[0], -neck[1]);
  if (who === 'satan') drawSatanBody(c, hit ? 'dangleHit' : 'dangle', f, false, flash);
  else drawWidowBody(c, hit ? 'dangleHit' : 'dangle', f, false, flash);
  c.restore();
};

export const drawHold = (c: Ctx, state: GameState, h: Hold, moving: boolean) => {
  const p = state.player, x = p.pos.x + p.width / 2, feet = p.pos.y + p.height, f = state.frame;
  const hit = !!h.blow && h.blowT >= BLOW_HIT && h.blowT < BLOW_HIT + 6;
  drawDangle(c, f, h.b.who, x, feet, h.face, hit, h.b.flash);
  drawPoseSprite(c, x, feet, h.face, g => neckPose(g, f, h.blow, h.blow ? h.blowT / BLOW_T[h.blow] : 0, h.walkPh, moving));
  // (what it's worth next time: the head start, filling over them; the time left under it)
  const k = headStart(h.dmg) / 100, bx = Math.round(x + h.face * HOLD_HAND[0]) - 30, by = Math.round(feet + HOLD_HAND[1]) - 92;
  c.fillStyle = '#000'; c.fillRect(bx - 1, by - 1, 62, 8); c.fillStyle = '#3A1A1A'; c.fillRect(bx, by, 60, 6);
  c.fillStyle = '#FDE047'; c.fillRect(bx, by, Math.round(60 * k / (HEAD_MAX / 100)), 6);
  c.fillStyle = '#F8FAFC'; c.fillRect(bx, by + 7, Math.round(60 * (1 - h.t / HOLD_T)), 2);
  c.font = '6px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText(`HEAD START ${headStart(h.dmg)}%`, bx + 31, by - 3); c.fillStyle = '#FDE047'; c.fillText(`HEAD START ${headStart(h.dmg)}%`, bx + 30, by - 4); c.textAlign = 'left';
};
