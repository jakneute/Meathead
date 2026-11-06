// Ned's summons (his fight: park4/ned.ts): weak-ass skeletons (the owner's: "he summons weak ass skeletons who die in
// one hit (crumble on throws) ... they shoot arrows and throw fire/ice balls, but still crumble in one hit and mostly
// just stand there. they are extra easy"). All one hit; picked up, they come apart in his hand and he's left throwing
// a skull (the crumble on throws: 'critter', dead in the fist).
//
//   wp4_archer  stands there; every few seconds the bow up, a slow draw (the tell, a long one), an arrow, flat and slow.
//   wp4_mage    stands there; every few seconds the wand up, its hand lit (red: fire, blue: ice; the tell), a ball
//               lobbed at him, slow; it alternates.
//   wp4_dog     a dog's bones: sits, barks; now and then trots at him and nips (it wags).
//   wp4_bones   just a skeleton (Ned running low): stands there, the jaw going. Hits nobody.
// Any of them can come out the party store one (plastic, a price tag on) or a dud (falls apart as soon as it's up).
// Every hit of theirs is a chip (the owner's "don't do much damage").
// Their shots are their own (a few, slow, kept here, drawn here), and every one of them hurts the skeletons too.

import type { Enemy, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { heard } from '../../bossQuiet';
import { drawSkel, type SkelKind, type SkelPose, SKEL_H } from './skelArt';
import { HURT4 } from './lines/ned';

type Ctx = CanvasRenderingContext2D;
for (const [source, l] of Object.entries(HURT4)) registerHurtLines(source, l.hurt, l.death);

export const ARCHER = 'm2:wp4_archer', MAGE = 'm2:wp4_mage', DOG = 'm2:wp4_dog', BONES = 'm2:wp4_bones';
const KIND_ART: Record<string, SkelKind> = { [ARCHER]: 'archer', [MAGE]: 'mage', [DOG]: 'dog', [BONES]: 'plain' };
export const isSkel = (e: Enemy) => !!KIND_ART[e.kind as string];

/** How long one takes to climb up out of the ground (frames: harmless meanwhile). */
export const RISE = 46;
// (the owner, 2026-11-06: "all he has are pathetic skeletons who die in one hit and don't do much damage if they hit
// you": a chip each, a quarter of a regular water park enemy's hit (those are 11 to 14); one hit of anything kills one)
const ARROW = { tell: 60, every: 220, v: 3.6, dmg: 3 };
const BALL = { tell: 56, every: 240, t: 70, dmg: 3 };
const DOGB = { every: 200, v: 2.4, dmg: 2 };
/** A summon's own flags (ned.ts sets them): the party store one (plastic, the price tag), the dud (falls to bits as
 *  soon as it's up: frames from up), crumbled (done with). */
export type SkelE = Enemy & { party?: boolean; dud?: number; crumbled?: boolean };

interface Shot { kind: 'arrow' | 'fire' | 'ice'; x: number; y: number; vx: number; vy: number; life: number; dead: boolean }
const SHOTS = new WeakMap<GameState, Shot[]>();
export const shotsOf = (state: GameState) => { let s = SHOTS.get(state); if (!s) { s = []; SHOTS.set(state, s); } return s; };
export const clearShots4 = (state: GameState) => { shotsOf(state).length = 0; };

const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const set = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const rising = (e: Enemy) => (e.aiState === 'rise' || e.aiState === undefined) && (e.aiTimer ?? 0) < RISE;
const faceHim = (state: GameState, e: Enemy) => { e.facing = (mid(state.player).x < mid(e).x ? -1 : 1) as 1 | -1; };
const seed = (e: Enemy) => (e.variant ?? 0) * 37;

const archer = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  tick(e); e.vel.x = 0;
  if (rising(e)) return false;
  if (e.aiState === 'rise') set(e, 'stand');
  faceHim(state, e);
  if (e.aiState === 'stand' && e.aiTimer > ARROW.every + (seed(e) % 60) && state.player.health > 0 && !state.player.inCutscene) set(e, 'draw');
  if (e.aiState === 'draw' && e.aiTimer === 1 && heard(state, mid(e).x)) playSound('scratch', 0.35, 6);
  if (e.aiState === 'draw' && e.aiTimer > ARROW.tell) {
    shotsOf(state).push({ kind: 'arrow', x: mid(e).x + e.facing! * 22, y: e.pos.y + e.height - 58, vx: e.facing! * ARROW.v, vy: 0, life: 260, dead: false });
    playSound('whoosh', 0.35, 10); set(e, 'shoot');
  }
  if (e.aiState === 'shoot' && e.aiTimer > 20) set(e, 'stand');
  return false;
};
const mage = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx;
  tick(e); e.vel.x = 0;
  if (rising(e)) return false;
  if (e.aiState === 'rise') set(e, 'stand');
  faceHim(state, e);
  if (e.aiState === 'stand' && e.aiTimer > BALL.every + (seed(e) % 70) && state.player.health > 0 && !state.player.inCutscene) { set(e, 'cast'); e.aiX = ((e.aiX ?? (e.variant ?? 0)) + 1) % 2; if (heard(state, mid(e).x)) playSound('ignite', 0.3, e.aiX ? -6 : 12); }
  if (e.aiState === 'cast' && e.aiTimer > BALL.tell) {
    // (lobbed: it comes down where he was, slowly; he's all day to step out of it)
    const p = mid(state.player), x0 = mid(e).x + e.facing! * 20, y0 = e.pos.y + e.height - 76, T = BALL.t;
    const vx = (p.x - x0) / T, vy = (state.player.pos.y + state.player.height - 10 - y0) / T - 0.5 * 0.16 * T;
    shotsOf(state).push({ kind: e.aiX ? 'fire' : 'ice', x: x0, y: y0, vx, vy, life: 200, dead: false });
    playSound('whoosh', 0.35, e.aiX ? -4 : 8); set(e, 'after');
  }
  if (e.aiState === 'after' && e.aiTimer > 24) set(e, 'stand');
  return false;
};
const dog = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e);
  tick(e);
  if (rising(e)) { e.vel.x = 0; return false; }
  if (e.aiState === 'rise') set(e, 'sit');
  faceHim(state, e);
  if (e.aiState === 'sit') { e.vel.x = 0; if (e.aiTimer % 70 === 30 && heard(state, m.x)) playSound('clink', 0.35, 8); if (e.aiTimer > DOGB.every + (seed(e) % 80) && pl.health > 0 && !pl.inCutscene) set(e, 'trot'); }
  if (e.aiState === 'trot') {
    e.vel.x = e.facing! * DOGB.v;
    if (Math.abs(p.x - m.x) < 26 && Math.abs(p.y - m.y) < 50 && pl.invincibilityTimer <= 0 && pl.health > 0) { hurtPlayer(ctx, DOGB.dmg, 'm2:wp4_dog', { x: e.facing! * 3, y: -2 }, 10); set(e, 'sit'); }
    if (e.aiTimer > 80) set(e, 'sit');
  }
  return false;
};
const bones = (_ctx: FrameContext, e: Enemy) => { tick(e); e.vel.x = 0; if (!rising(e) && e.aiState === 'rise') set(e, 'stand'); return false; };

const poseOf = (e: Enemy): SkelPose => {
  if (e.kind === DOG) return e.aiState === 'trot' ? 'walk' : (e.aiTimer ?? 0) % 70 > 30 && (e.aiTimer ?? 0) % 70 < 44 ? 'bark' : 'stand';
  if (e.aiState === 'draw') return 'draw';
  if (e.aiState === 'shoot') return 'shoot';
  if (e.aiState === 'cast') return 'cast';
  if (e.kind === BONES && Math.floor((e.aiTimer ?? 0) / 20) % 2) return 'bark';
  return 'stand';
};
const drawOne = (c: Ctx, e: Enemy, f: number) => {
  const k = KIND_ART[e.kind as string];
  const rise = e.aiState === 'rise' || e.aiState === undefined ? Math.min(1, (e.aiTimer ?? 0) / RISE) : 1;
  // (the engine's drawn us at the feet, facing right, turned for it: drawSkel turns by itself, so face right here)
  drawSkel(c, k, 0, 0, 1, poseOf(e), Math.floor(f / 8) % 8, rise, e.kind !== MAGE || e.aiX !== 0, !!(e as SkelE).party);
};
for (const [kind, w, h, ai] of [[ARCHER, 26, SKEL_H, archer], [MAGE, 26, SKEL_H, mage], [DOG, 40, 34, dog], [BONES, 26, SKEL_H, bones]] as const) {
  registerM2Kind({
    kind, stats: { w, h, hp: 1, contact: 0, mass: kind === DOG ? 30 : 60 },
    ai, humanoid: kind !== DOG, gender: 'n', grab: 'critter', blood: '#E4D8B8',
    head: kind === DOG ? { x: 16, y: -30, r: 6 } : { x: 5, y: -68, r: 6 },
    draw: (c, e, f) => drawOne(c, e, f),
  });
}

/** One up out of the ground at (x, the floor), facing him. */
export const summon = (state: GameState, kind: string, x: number, floor: number, i: number) => {
  const e = makeKindEnemy(kind as EnemyKind, x, floor);
  e.aiState = 'rise'; e.aiTimer = 0; e.variant = i; e.seen = true;
  e.facing = (mid(state.player).x < x ? -1 : 1) as 1 | -1;
  state.enemies.push(e);
  for (let k = 0; k < 8; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 30, y: floor - 4 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 30, color: k % 2 ? '#5A4A3A' : '#86EFAC', size: 3 + Math.random() * 3 });
  return e;
};
/** The live ones (not crumbled). */
export const skelsOf = (state: GameState) => state.enemies.filter(e => isSkel(e) && e.health > 0 && !e.isBlownAway);
/** Crumbled: a heap of bones and a skull, rolling (particles), gone. */
export const crumble = (state: GameState, e: Enemy) => {
  const m = mid(e);
  for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: m.x + (Math.random() - 0.5) * 16, y: m.y + (Math.random() - 0.5) * 30 }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 4 }, life: 50, color: k % 3 ? '#E4D8B8' : '#B4A47E', size: 3 + Math.random() * 4, grav: 0.35 });
  playSound('crunch', 0.5, 8);
};

/** The shots, a frame: flying, hitting him (and the skeletons: one hit), gone on the floor or off the arena. */
export const updateShots4 = (ctx: FrameContext, floor: number, l: number, r: number) => {
  const { state } = ctx, pl = state.player, shots = shotsOf(state);
  for (const s of shots) {
    if (s.dead) continue;
    s.life--;
    if (s.kind !== 'arrow') s.vy += 0.16;
    s.x += s.vx; s.y += s.vy;
    if (s.life <= 0 || s.x < l - 60 || s.x > r + 60 || s.y > floor + 4) { s.dead = true; if (s.kind !== 'arrow' && s.y > floor) for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: s.x, y: floor - 4 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 24, color: s.kind === 'fire' ? '#F97316' : '#BAE6FD', size: 3 + Math.random() * 3 }); continue; }
    const hitP = s.x > pl.pos.x && s.x < pl.pos.x + pl.width && s.y > pl.pos.y && s.y < pl.pos.y + pl.height;
    if (hitP && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.inCutscene) {
      hurtPlayer(ctx, s.kind === 'arrow' ? ARROW.dmg : BALL.dmg, s.kind === 'arrow' ? 'm2:wp4_arrow' : s.kind === 'fire' ? 'm2:wp4_fire' : 'm2:wp4_ice', { x: Math.sign(s.vx || 1) * 3, y: -2 }, 10);
      s.dead = true; continue;
    }
    // (into one of theirs on the way: it crumbles too)
    for (const e of skelsOf(state)) if (s.x > e.pos.x && s.x < e.pos.x + e.width && s.y > e.pos.y && s.y < e.pos.y + e.height && !rising(e) && Math.sign(s.vx) === Math.sign(mid(e).x - s.x + s.vx * 3)) { e.health = 0; s.dead = true; break; }
  }
  for (let i = shots.length - 1; i >= 0; i--) if (shots[i].dead) shots.splice(i, 1);
};
export const drawShots4 = (c: Ctx, state: GameState) => {
  for (const s of shotsOf(state)) {
    if (s.kind === 'arrow') {
      const d = Math.sign(s.vx) || 1;
      c.fillStyle = '#2A1E10'; c.fillRect(Math.round(s.x - 12 * d), Math.round(s.y - 1), 24 * d, 2);
      c.fillStyle = '#A88A5A'; c.fillRect(Math.round(s.x - 11 * d), Math.round(s.y - 1), 22 * d, 1);
      c.fillStyle = '#9CA3AF'; c.beginPath(); c.moveTo(s.x + 12 * d, s.y - 3); c.lineTo(s.x + 17 * d, s.y); c.lineTo(s.x + 12 * d, s.y + 3); c.closePath(); c.fill();
      c.fillStyle = '#F5F5F4'; c.fillRect(Math.round(s.x - 13 * d), Math.round(s.y - 3), 3 * d, 6);
    } else {
      const fire = s.kind === 'fire', f = state.frame;
      c.fillStyle = fire ? '#B91C1C' : '#0EA5E9'; c.beginPath(); c.arc(s.x, s.y, 9, 0, Math.PI * 2); c.fill();
      c.fillStyle = fire ? '#F97316' : '#7DD3FC'; c.beginPath(); c.arc(s.x - 1, s.y - 1, 6.4, 0, Math.PI * 2); c.fill();
      c.fillStyle = fire ? '#FDE047' : '#F0F9FF'; c.beginPath(); c.arc(s.x - 2, s.y - 2, 3, 0, Math.PI * 2); c.fill();
      if (f % 3 === 0) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: -s.vx * 0.2, y: -0.4 }, life: 14, color: fire ? '#F97316' : '#E0F2FE', size: 3 });
    }
  }
};
