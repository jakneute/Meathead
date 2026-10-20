// THE NEW MEAN MEN of the West Wing (Meathead 2's own kinds, registered when Cartoon Land is loaded): men and women of
// every skin, build and hair (seeded per enemy), each with its tell before it hits; part one's (the goon, the lobbyist,
// the pollster, the spy blimp: whitehouse1/kinds.ts) are about too.
//
//   spindoc   THE SPIN DOCTOR: keeps a middling distance; turns on the spot faster and faster (the tell), then goes off
//             across the floor as a whirlwind (the spin: hurts what it hits, him included), bouncing back off walls once,
//             dizzy after (stars: his window); up close, a slap (a wind up).
//   ditto     THE DITTOHEAD: keeps back; pulls the radio's antenna up and cranks the dial (the tell: notes and static),
//             then blasts it at him: a sound wave rolling along the floor at him (jump it); another dittohead near
//             enough hears it and does the same a moment later ("DITTOS!"); up close, a shove with the radio.
//
// All kills are cartoon puffs while the projection's up (state.cartoonKills).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { registerM2Kind, registerHurtLines, registerKindCallouts } from '../../kinds';
import { hazardHit, hazardVictims, boxHits } from '../../hazardHit';
import { envSound } from '../../bossQuiet';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { lookOf } from '../../adventure/temple/people';
import { speak, byPants } from '../section';
import type { ByPants } from '../talk';
import { wh2Of } from './state';
import { HURT2, KILL_CALLS2, MEAN2, SPIN_BARK, SPIN_GO, DITTO_BARK, DITTO_BLAST } from './lines';
import { drawSpindoc, drawDitto } from './kindArt';

for (const [source, l] of Object.entries(HURT2)) registerHurtLines(source, l.hurt, l.death);
for (const [kind, calls] of Object.entries(KILL_CALLS2)) registerKindCallouts(kind, calls);

const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !state.player.inCutscene && !holdingOff(state) && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
/** Who's in there: the same person every time (where they were put down). */
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
const isWoman = (e: Enemy) => lookOf(seedOf(e)).woman;
const gender = (e: Enemy) => (isWoman(e) ? 'f' : 'm') as 'm' | 'f';
const voice = (e: Enemy, m: string, f: string) => (isWoman(e) ? f : m);

const walkTo = (ctx: FrameContext, e: Enemy, x: number, speed: number, stop = 50) => {
  const d = x - mid(e).x;
  e.facing = (d < 0 ? -1 : 1);
  if (Math.abs(d) < stop || !safeAhead(ctx, e, e.facing, 12)) { e.vel.x = 0; return; }
  e.vel.x = e.facing * speed;
};
const backOff = (ctx: FrameContext, e: Enemy, x: number, speed: number) => {
  const away = (x < mid(e).x ? 1 : -1);
  e.facing = -away as 1 | -1;
  e.vel.x = safeAhead(ctx, e, away, 12) ? away * speed : 0;
};
const keepAt = (ctx: FrameContext, e: Enemy, near: number, far: number, speed: number) => {
  const pm = mid(ctx.state.player), dx = Math.abs(pm.x - mid(e).x);
  if (dx > far) walkTo(ctx, e, pm.x, speed, far - 20);
  else if (dx < near) backOff(ctx, e, pm.x, speed * 0.8);
  else e.vel.x = 0;
  e.facing = dirTo(e, pm.x);
};
const strike = (ctx: FrameContext, e: Enemy, reach: number, dmg: number, source: string, knock = 6, up = -4) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.inCutscene) return false;
  const x = e.facing! > 0 ? e.pos.x + e.width - 6 : e.pos.x - reach + 6;
  if (p.pos.x < x + reach && p.pos.x + p.width > x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y + 6) {
    hurtPlayer(ctx, dmg, source, { x: (mid(p).x < mid(e).x ? -1 : 1) * knock, y: up });
    return true;
  }
  return false;
};
const level = (state: GameState, e: Enemy, dy = 60) => Math.abs((state.player.pos.y + state.player.height) - (e.pos.y + e.height)) < dy;

/** A bark over its head (rare, one at a time). */
const bark = (state: GameState, e: Enemy, vo: string, pool: ByPants | string[], chance = 0.4) => {
  const s = wh2Of(state);
  if (state.frame - s.barkAt < 240 || Math.random() > chance) return;
  s.barkAt = state.frame;
  speak(vo, pickLine(Array.isArray(pool) ? pool : byPants(state, pool)), x => { if (x) s.barks.set(e, x); else s.barks.delete(e); }, false);
};
const spotted = (state: GameState, e: Enemy, vo: string, pool: ByPants, chance = 0.45) => {
  const k = e as { spotted?: boolean };
  if (k.spotted) return;
  k.spotted = true;
  bark(state, e, vo, pool, chance);
};

// ---------------------------------------------------------------------------------------------------------------
// The spin doctor

const SPIN_SPEED = 6.4;
const spindoc = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, MEAN2.spindoc, MEAN2.spindocf);
  const k = e as { bounced?: boolean };
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, SPIN_BARK, 0.6); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (dx < 62 && level(state, e)) { setState(e, 'slapWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 160, 330, 1.5);
      if (e.aiTimer! > 70 && dx > 120 && dx < 460 && level(state, e, 70)) { setState(e, 'wind'); e.vel.x = 0; e.facing = dirTo(e, pm.x); }
      break;
    }
    case 'wind':
      // (turning on the spot, faster and faster: the tell)
      e.vel.x = 0;
      if (e.aiTimer! % 8 === 0) envSound(state, mid(e).x, 'whoosh', 0.2 + e.aiTimer! * 0.008, 4 + e.aiTimer! * 0.3);
      if (e.aiTimer! > 36) { e.facing = dirTo(e, pm.x); k.bounced = false; setState(e, 'spin'); bark(state, e, vo, SPIN_GO, 0.5); playSound('whirl', 0.6, 4); }
      break;
    case 'spin': {
      // (the whirlwind across the floor: hurts him; bounces back off a wall once; gives out dizzy)
      e.vel.x = e.facing! * SPIN_SPEED;
      if (e.aiTimer! % 10 === 0) envSound(state, mid(e).x, 'whirl', 0.25, 6);
      if (e.aiTimer! % 3 === 0) state.particles.push({ pos: { x: mid(e).x - e.facing! * 16, y: e.pos.y + e.height - 4 }, vel: { x: -e.facing! * 1.5, y: -0.8 }, life: 16, color: '#E5E7EB', size: 3 });
      if (strike(ctx, e, 18, 11, 'm2:ct_spindoc', 9, -6)) playSound('slam', 0.6, 4);
      // (the other mean men in his way get spun too)
      for (const o of hazardVictims(state)) if (o !== e && boxHits(o, e.pos.x - 6, e.pos.y, e.width + 12, e.height) && !(o as { spunBy?: Enemy }).spunBy) { (o as { spunBy?: Enemy }).spunBy = e; hazardHit(ctx, o, 30, mid(e).x, 'SPUN!', { knock: 9 }); }
      if (!safeAhead(ctx, e, e.facing!, 18)) {
        if (!k.bounced) { k.bounced = true; e.facing = (-e.facing!) as 1 | -1; playSound('boing', 0.5, 6); }
        else { setState(e, 'dizzy'); e.vel.x = 0; break; }
      }
      if (e.aiTimer! > 75) { setState(e, 'dizzy'); e.vel.x *= 0.4; }
      break;
    }
    case 'dizzy':
      // (stars round his head, swaying: his window)
      e.vel.x *= 0.85;
      if (e.aiTimer! > 80) { setState(e, 'near'); for (const o of hazardVictims(state)) delete (o as { spunBy?: Enemy }).spunBy; }
      break;
    case 'slapWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 15) { if (strike(ctx, e, 46, 9, 'm2:ct_spindoc', 7)) playSound('slam', 0.5, 12); playSound('whoosh', 0.4, 8); setState(e, 'slap'); }
      break;
    case 'slap':
      if (e.aiTimer! > 22) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The dittohead

const WAVE_SPEED = 3.3;
const dittoBlast = (state: GameState, e: Enemy) => {
  const s = wh2Of(state);
  s.waves.push({ x: mid(e).x + e.facing! * 24, y: e.pos.y + e.height - 26, vx: e.facing! * WAVE_SPEED, t: 0, from: e });
  envSound(state, mid(e).x, 'alarm', 0.25, 10); envSound(state, mid(e).x, 'rumble', 0.3, 12);
};
const ditto = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, MEAN2.ditto, MEAN2.dittof);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 280) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, DITTO_BARK, 0.6); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 64 && level(state, e)) { setState(e, 'shoveWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 220, 400, 1.3);
      if (e.aiTimer! > 110 && level(state, e, 90)) { setState(e, 'tune'); e.vel.x = 0; }
      break;
    case 'tune':
      // (the antenna up, the dial cranked: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 6 === 0) envSound(state, mid(e).x, 'beep', 0.15, 16 + (e.aiTimer! % 12));
      if (e.aiTimer! > 32) { dittoBlast(state, e); bark(state, e, vo, DITTO_BLAST, 0.35); setState(e, 'blast');
        // (any other dittohead near enough hears it: dittos)
        for (const o of state.enemies) if (o !== e && o.kind === 'm2:ct_ditto' && o.health > 0 && o.aiState === 'near' && Math.abs(mid(o).x - mid(e).x) < 420) { setState(o, 'tune'); o.aiTimer = 10; }
      }
      break;
    case 'blast':
      if (e.aiTimer! > 30) setState(e, 'near');
      break;
    case 'shoveWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { if (strike(ctx, e, 44, 8, 'm2:ct_ditto', 8)) playSound('clang', 0.4, 8); playSound('whoosh', 0.4, 6); setState(e, 'shove'); }
      break;
    case 'shove':
      if (e.aiTimer! > 24) setState(e, 'near');
      break;
  }
  return false;
};

/** The waves rolling along (each frame: part two's update). They hurt him; they stop at a wall or a drop. */
export const updateWaves = (ctx: FrameContext) => {
  const { state } = ctx, s = wh2Of(state), p = state.player;
  for (const w of s.waves) {
    w.t++; w.x += w.vx;
    if (w.t % 14 === 0) envSound(state, w.x, 'rumble', 0.12, 18);
    if (p.health > 0 && !p.inCutscene && p.invincibilityTimer <= 0 && p.pos.x < w.x + 14 && p.pos.x + p.width > w.x - 14 && p.pos.y < w.y + 22 && p.pos.y + p.height > w.y - 22) {
      hurtPlayer(ctx, 8, 'm2:ct_wave_shot', { x: Math.sign(w.vx) * 6, y: -5 }); w.dead = true; continue;
    }
    const under = floorTopAt(state.blocks, w.x, w.y + 10, 30);
    const wall = state.blocks.some(b => !b.oneWay && b.type !== 'platform' && w.x > b.x && w.x < b.x + b.w && w.y > b.y && w.y < b.y + b.h);
    if (wall || under === null || w.t > 120) w.dead = true;
  }
  s.waves = s.waves.filter(w => !w.dead);
};

// ---------------------------------------------------------------------------------------------------------------

/** Out of aggro range: this far off, anybody after him gives up and goes back to standing about. */
const LEASH_X = 820, LEASH_Y = 460;
const leashed = (ai: (ctx: FrameContext, e: Enemy) => boolean) => (ctx: FrameContext, e: Enemy) => {
  if (e.aiState && e.aiState !== 'idle') {
    const p = mid(ctx.state.player), m = mid(e);
    if (Math.abs(p.x - m.x) > LEASH_X || Math.abs(p.y - m.y) > LEASH_Y) { setState(e, 'idle'); e.vel.x = 0; }
  }
  return ai(ctx, e);
};
type Reg = Parameters<typeof registerM2Kind>[0];
const person = (kind: `m2:ct_${string}`, stats: Reg['stats'], ai: (ctx: FrameContext, e: Enemy) => boolean, draw: (c: CanvasRenderingContext2D, e: Enemy, f: number, seed: number) => void) =>
  registerM2Kind({ kind, stats, humanoid: true, gender, head: { x: 1, y: -66, r: 10 }, ai: leashed(ai), draw: (c, e, f) => draw(c, e, f, seedOf(e)) });

person('m2:ct_spindoc', { w: 38, h: 78, hp: 100, contact: 5, mass: 190 }, spindoc, drawSpindoc);
person('m2:ct_ditto', { w: 38, h: 76, hp: 90, contact: 4, mass: 190 }, ditto, drawDitto);
