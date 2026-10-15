// The giant atom's people as enemies (Meathead 2's own kinds), dressed in people.ts:
//   hand     a stagehand at a rig's controls (`variant`: the post): harmless; works the rig, cowers when he's close.
//            Dead, the rig stops (and stays stopped: the section keeps it in state.stageMemo).
//   rigger   up on a catwalk: keeps his distance and lobs wrenches.
//   flag     POINTY: the moon landing's astronaut, the flag's pole out in front with a brass spike on the end (don't
//            shoulder charge one from the front): the wind-up, the lunge.
//   martian  SPIKY: a friendly martian, two antennae with spiked balls on (dive kick one and it's your feet): the head
//            goes down (the tell), then the ram.
//   worker   (the ride, from the warehouse's side) somebody working on the track, in the way: harmless; looks up as the
//            sled comes. `variant` 0 in blacks (a stagehand), 1 in a hi-vis vest.
// Men and women, every look, by seed. Now and then one has something to say (barks: drawn by the section).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { safeAhead } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { isTalking, pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { BOTTLE_GRAVITY } from '../../../m1/constants';
import { lookOf } from '../../adventure/temple/people';
import { moodOf, reaction, type Pose } from '../../spooky/costume';
import { speak, saidOver, type Said } from '../section';
import { drawAtomPerson, type Outfit } from './people';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;

export const ATOM = { hand: 'm2:atom_hand', rigger: 'm2:atom_rigger', flag: 'm2:atom_flag', martian: 'm2:atom_martian', worker: 'm2:ride_worker' } as const;

const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.homeX || 0)) + (e.variant ?? 0) * 31;
const live = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return live(state) && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
const pBox = (state: GameState) => {
  const p = state.player, low = p.isDucking || p.isSliding ? 28 : 0;
  return { x: p.pos.x, y: p.pos.y + low, w: p.width, h: p.height - low };
};
/** A swing (or a lunge) out in front of it: `reach` past its middle, `top..bot` up from its feet. */
const strike = (ctx: FrameContext, e: Enemy, reach: number, top: number, bot: number, dmg: number, source: string) => {
  const { state } = ctx, p = state.player;
  if (p.invincibilityTimer > 0 || !live(state)) return false;
  const cx = e.pos.x + e.width / 2, f = e.facing === -1 ? -1 : 1, feet = e.pos.y + e.height;
  const x0 = f > 0 ? cx : cx - reach, x1 = f > 0 ? cx + reach : cx, b = pBox(state);
  if (b.x < x1 && b.x + b.w > x0 && b.y < feet - bot && b.y + b.h > feet - top) { hurtPlayer(ctx, dmg, source, { x: f * 6, y: -5 }); return true; }
  return false;
};
const go = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const walk = (ctx: FrameContext, e: Enemy, dir: number, speed: number) => { e.vel.x = safeAhead(ctx, e, dir, 10) ? dir * speed : 0; };
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
export const isWoman = (e: Enemy) => lookOf(seedOf(e)).woman;
/** The way each one faces at work (its rig, the track). */
export const homeFacing = new WeakMap<Enemy, 1 | -1>();

// ---------------------------------------------------------------------------------------------------------------
// Barks: one at a time, never over anybody; drawn over their head while said (drawBarks)

const barks = new Map<Enemy, Said>();
const barked = new WeakSet<Enemy>();
/** Once per one of them, sometimes: `pool` by how he is, in their voice (a man's or a woman's). */
const bark = (state: GameState, e: Enemy, pool: L.ByPants, chance: number) => {
  if (barked.has(e)) return;
  barked.add(e);
  if (Math.random() > chance || isTalking()) return;
  const text = pickLine(pool[dressed(state)]);
  speak(isWoman(e) ? 'm2.space.handf' : 'm2.space.hand', text, s => { if (s && e.health > 0) barks.set(e, s); else barks.delete(e); }, false);
};
/** World space: what they're saying, over their heads. */
export const drawBarks = (c: Ctx) => {
  for (const [e, s] of barks) {
    if (e.health <= 0 || e.isBlownAway) { barks.delete(e); continue; }
    saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 34, '#FDE68A');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Their AIs

const handAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  const p = mid(state.player), m = mid(e), home = e.homeX ?? e.pos.x;
  e.harmless = true;
  const near = Math.abs(p.x - m.x) < 140 && Math.abs(p.y - m.y) < 130 && live(state);
  e.aiState = near ? 'cower' : 'work';
  if (near) bark(state, e, L.HAND_COWERS, 0.6);
  // (cowering: a step or two back from him, never far from the post)
  const away = p.x < m.x ? 1 : -1;
  e.vel.x = near && Math.abs(e.pos.x + away * 1.2 - home) < 50 && safeAhead(ctx, e, away, 8) ? away * 1.2 : 0;
  if (!near && Math.abs(e.pos.x - home) > 2) e.vel.x = Math.sign(home - e.pos.x) * 0.8;
  if (!near) e.facing = homeFacing.get(e) ?? e.facing;
  return false;
};

const workerAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.harmless = true; e.vel.x = 0;
  // (the sled coming: they look up, and freeze. That's all they've got time for)
  const p = mid(state.player), m = mid(e);
  e.aiState = p.x < m.x && m.x - p.x < 330 && Math.abs(p.y - m.y) < 160 ? 'look' : 'work';
  e.facing = e.aiState === 'look' ? -1 : homeFacing.get(e) ?? -1;
  return false;
};

/** A wrench, lobbed: up and over, coming down where he's stood. */
const lobWrench = (ctx: FrameContext, e: Enemy) => {
  const p = ctx.state.player;
  const x = e.pos.x + e.width / 2 + (e.facing ?? 1) * 10, y = e.pos.y + e.height - 60;
  const tx = p.pos.x + p.width / 2 + p.vel.x * 10, ty = p.pos.y + p.height / 2;
  const t = Math.max(24, Math.min(46, Math.abs(tx - x) / 7));
  const vx = (tx - x) / t, vy = (ty - y - 0.5 * BOTTLE_GRAVITY * t * t) / t;
  playSound('whoosh', 0.5, 2);
  ctx.state.projectiles.push({ id: `wrench-${ctx.state.frame}-${Math.random()}`, pos: { x: x - 8, y: y - 8 }, vel: { x: vx, y: vy }, width: 16, height: 16, health: 1, maxHealth: 1, type: 'projectile', damage: 10, owner: 'enemy', shooterKind: e.kind ?? 'enemy', thrown: 'wrench', rotation: 0 });
};
const riggerAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx);
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 600, 360)) go(e, 'keep'); break;
    case 'keep':
      e.facing = dir as 1 | -1;
      if (adx < 200) walk(ctx, e, -dir, 1.4); else if (adx > 420) walk(ctx, e, dir, 1.1); else e.vel.x = 0;
      if (e.aiTimer > 75 && adx < 620 && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; e.facing = dir as 1 | -1; if (e.aiTimer > 20) { go(e, 'throw'); lobWrench(ctx, e); } break;
    case 'throw': if (e.aiTimer > 12) { go(e, 'keep'); e.aiTimer = Math.floor(Math.random() * 25); } break;
  }
  return false;
};

const flagAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 80;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 520, 200)) { go(e, 'walk'); bark(state, e, L.CAST_BARKS, 0.3); } break;
    case 'walk':
      e.facing = dir as 1 | -1;
      if (adx > 74) walk(ctx, e, dir, 1.5); else e.vel.x = 0;
      if (adx < 118 && level && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; if (e.aiTimer > 22) { go(e, 'thrust'); playSound('whoosh', 0.6, 2); } break;
    case 'thrust':
      e.vel.x = e.aiTimer < 8 ? e.facing! * 6 : 0;
      if (e.aiTimer < 12) strike(ctx, e, 78, 50, 30, 12, `${ATOM.flag}_pole`);
      if (e.aiTimer > 16) go(e, 'recover');
      break;
    case 'recover': e.vel.x *= 0.8; if (e.aiTimer > 36) go(e, 'walk'); break;
  }
  return false;
};

const martianAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const p = mid(state.player), m = mid(e), dx = p.x - m.x, adx = Math.abs(dx), level = Math.abs(p.y - m.y) < 90;
  const dir = dx < 0 ? -1 : 1;
  switch (e.aiState) {
    default: e.vel.x = 0; if (sees(state, e, 540, 220)) { go(e, 'walk'); bark(state, e, L.CAST_BARKS, 0.3); } break;
    case 'walk':
      e.facing = dir as 1 | -1;
      if (adx > 60) walk(ctx, e, dir, 1.3); else e.vel.x = 0;
      if (adx < 210 && level && live(state)) go(e, 'wind');
      break;
    case 'wind': e.vel.x = 0; e.facing = dir as 1 | -1; if (e.aiTimer === 2) playSound('snort', 0.5, 14); if (e.aiTimer > 26) { go(e, 'ram'); playSound('whoosh', 0.7, -2); } break;
    case 'ram':
      e.vel.x = safeAhead(ctx, e, e.facing!, 16) ? e.facing! * 6.5 : 0;
      strike(ctx, e, 40, 72, 30, 13, ATOM.martian);
      if (e.aiTimer > 20 || e.vel.x === 0) go(e, 'recover');
      break;
    case 'recover': e.vel.x *= 0.82; if (e.aiTimer > 40) go(e, 'walk'); break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// How they're drawn

const poseOf = (e: Enemy): Pose => {
  const s = e.aiState;
  if (s === 'work') return 'tell';
  if (s === 'cower' || s === 'look') return 'after';
  if (s === 'wind') return 'tell';
  if (s === 'thrust' || s === 'ram' || s === 'throw') return 'strike';
  return Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand';
};
const wear = (e: Enemy, f: number) => ({ seed: seedOf(e), f, talk: barks.has(e), ...(reaction(e) ?? { pose: poseOf(e), md: moodOf(e) }) });
const human = (e: Enemy) => (isWoman(e) ? 'f' : 'm');
const dress = (outfit: Outfit) => (c: Ctx, e: Enemy, f: number) => drawAtomPerson(c, outfit, wear(e, f));

registerM2Kind({
  kind: ATOM.hand, stats: { w: 36, h: 66, hp: 60, contact: 0, mass: 190 }, ai: handAI, humanoid: true,
  make: b => ({ ...b, harmless: true }), gender: human, head: { x: 1, y: -66, r: 9 }, draw: dress('hand'),
});
registerM2Kind({
  kind: ATOM.worker, stats: { w: 36, h: 66, hp: 60, contact: 0, mass: 190 }, ai: workerAI, humanoid: true,
  make: b => ({ ...b, harmless: true }), gender: human, head: { x: 1, y: -66, r: 9 },
  draw: (c, e, f) => drawAtomPerson(c, e.variant ? 'worker' : 'hand', wear(e, f)),
});
registerM2Kind({
  kind: ATOM.rigger, stats: { w: 38, h: 66, hp: 120, contact: 6, mass: 200 }, ai: riggerAI, humanoid: true,
  // (he keeps to his catwalk)
  pathing: false,
  gender: human, head: { x: 1, y: -68, r: 10 }, draw: dress('rigger'),
});
registerM2Kind({
  kind: ATOM.flag, stats: { w: 42, h: 68, hp: 170, contact: 8, mass: 230 }, ai: flagAI, humanoid: true,
  pointy: { source: `${ATOM.flag}_pole`, label: 'PLANTED!' },
  gender: human, head: { x: 1, y: -67, r: 14 }, draw: dress('flag'),
});
registerM2Kind({
  kind: ATOM.martian, stats: { w: 40, h: 66, hp: 160, contact: 9, mass: 200 }, ai: martianAI, humanoid: true,
  spiky: { source: `${ATOM.martian}_spikes`, label: 'SPIKED!' },
  gender: human, head: { x: 1, y: -67, r: 9 }, draw: dress('martian'),
});

registerHurtLines(ATOM.rigger, L.HURT_RIGGER, L.DEATH_RIGGER);
registerHurtLines(`${ATOM.rigger}_shot`, L.HURT_WRENCH, L.DEATH_WRENCH);
registerHurtLines(ATOM.flag, L.HURT_FLAG, L.DEATH_FLAG);
registerHurtLines(`${ATOM.flag}_pole`, L.HURT_FLAGPOLE, L.DEATH_FLAGPOLE);
registerHurtLines(ATOM.martian, L.HURT_MARTIAN, L.DEATH_MARTIAN);
registerHurtLines(`${ATOM.martian}_spikes`, L.HURT_ANTENNAE, L.DEATH_ANTENNAE);
