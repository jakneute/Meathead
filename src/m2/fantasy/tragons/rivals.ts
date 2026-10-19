// The rivals on the ride (the glen's queue: BLAKE, RAFAEL, HANK, glen/rivals.ts's RIVALS), as cast (kinds of their
// own, `m2:fa_rival_<id>`): sat on their dragons' backs at the station (Blake on the FIRE dragon, Rafael on the
// LIGHTNING one); up out of their seats when the ride says (ride.ts: Blake at the first near miss, Rafael later), Hank
// in on a spare dragon. On another dragon: they throw at him (a wind-up, the thing up in the hand: Blake's protein
// shakers, Rafael's dumbbells, Hank's turkey legs), and after a while hop over onto his (a leap, as his hops). On his:
// at him, a fist cocked (the tell), a punch that knocks him back. No guns here: fists, the charge, the grabs work on
// them; knocked off a dragon, they go all the way down (ride.ts: splat). The ride's hazards hit them too; now and then
// they duck or jump one (they're not that bright). Shot at (at the station): it bounces off.

import type { Enemy, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { makeKindEnemy, mid, safeAhead, holdingOff } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { registerM2Kind, registerHurtLines, registerKindCallouts } from '../../kinds';
import { drawSuitor } from '../suitors';
import { speak, byPants } from '../section';
import { RIVALS } from '../glen/rivals';
import { rearX, TL, GY, type Lane } from './layout';
import { tragonsOf, type RivalId, type Thrown } from './state';
import { trainUnder, standsOn, trainOn } from './cars';
import { HURT, KILL_CALLS, RIVAL_VOICES, RIVAL_THROW, RIVAL_HOP, RIVAL_WAKE } from './lines';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);
for (const [kind, calls] of Object.entries(KILL_CALLS)) registerKindCallouts(kind, calls);

export const RIVAL_KIND = (id: RivalId) => `m2:fa_rival_${id}` as EnemyKind;
export const rivalOf = (e: Enemy): RivalId | null => (e.kind?.startsWith('m2:fa_rival_') ? (e.kind.slice(12) as RivalId) : null);
const LOOK = (id: RivalId) => RIVALS.find(r => r.id === id)!.look;
/** What each throws, its hurt source. */
export const ITEM: Record<RivalId, Thrown['item']> = { blake: 'shaker', rafael: 'dumbbell', hank: 'turkey' };
export const ITEM_SRC: Record<Thrown['item'], string> = { shaker: 'm2:fa_shaker', dumbbell: 'm2:fa_dumbbell', turkey: 'm2:fa_turkey' };

/** A rival's own: his hop (as his: from, to which lane, how far), crouched under something (frames), sat. */
interface RivalE extends Enemy { rHop?: { fx: number; fy: number; to: Lane; t: number; dur: number }; rDuck?: number; rSat?: boolean; rThrows?: number; rPanic?: number }

const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };

/** One of them, put on a lane's dragon (sat, or up), his feet on its roof at `x`. */
export const putRival = (state: GameState, id: RivalId, lane: Lane, x: number, sat: boolean) => {
  const t = tragonsOf(state), tr = trainOn(t, lane);
  const e = makeKindEnemy(RIVAL_KIND(id), x, tr.y) as RivalE;
  e.facing = -1; e.rSat = sat; e.homeX = e.pos.x; e.homeY = e.pos.y;
  setState(e, sat ? 'seat' : 'ride');
  state.enemies.push(e);
  t.rivals[id] = e;
  return e;
};
/** Up out of his seat (the ride's cue): his say at him. */
export const wakeRival = (state: GameState, id: RivalId) => {
  const e = tragonsOf(state).rivals[id] as RivalE | undefined;
  if (!e || e.health <= 0) return;
  e.rSat = false; setState(e, 'ride');
  bark(state, e, id, pickLine(byPants(state, RIVAL_WAKE[id])), true);
};

/** Words over him (in turn: never over anybody else's). */
export const bark = (state: GameState, e: Enemy, id: RivalId, line: string, queue = false) => {
  const t = tragonsOf(state);
  speak(RIVAL_VOICES[id], line, s => { if (s) t.barks.set(e, s); else t.barks.delete(e); }, queue);
};

/** The lane he's stood on (or was last). */
const laneOf = (state: GameState, e: Enemy): Lane | null => trainUnder(e, tragonsOf(state), 6)?.lane ?? null;

const startHop = (state: GameState, e: RivalE, to: Lane) => {
  e.rHop = { fx: mid(e).x, fy: e.pos.y + e.height, to, t: 0, dur: 24 };
  e.vel.x = 0; e.vel.y = 0;
  playSound('jump', 0.6, -4);
};

/** Thrown at him from the hand: lobbed to come down on him in `T` frames. */
const throwAt = (state: GameState, e: Enemy, id: RivalId) => {
  const t = tragonsOf(state), p = state.player, T = 42, g = 0.35;
  const hx = mid(e).x + (e.facing ?? -1) * 14, hy = e.pos.y + 16;
  const tx = p.pos.x + p.width / 2, ty = p.pos.y + p.height * 0.4;
  t.thrown.push({ item: ITEM[id], x: hx, y: hy, vx: (tx - hx) / T, vy: (ty - hy - 0.5 * g * T * T) / T, spin: 0, from: e });
  playSound('whoosh', 0.6, 2);
};

const ai = (id: RivalId) => (ctx: FrameContext, en: Enemy): boolean => {
  const { state } = ctx, e = en as RivalE, t = tragonsOf(state), p = state.player, pm = mid(p);
  tick(e);
  if (e.rDuck && e.rDuck > 0) e.rDuck--;
  // A hop over to another dragon: his to make, scripted (as his: a leap, carried to its roof)
  if (e.rHop) {
    const h = e.rHop, tr = trainOn(t, h.to);
    h.t++;
    const u = Math.min(1, h.t / h.dur), x = Math.max(rearX(t.dist) + 30, Math.min(rearX(t.dist) + TL - 40, h.fx));
    const ty = tr.phase === 'ok' ? tr.y : h.fy + 200;
    e.pos.x = x - e.width / 2;
    e.pos.y = h.fy + (ty - h.fy) * u - Math.sin(Math.PI * u) * (ty < h.fy ? 80 : 40) - e.height;
    e.vel.x = 0; e.vel.y = 0;
    if (h.t >= h.dur) { e.rHop = undefined; e.pos.y = ty - e.height - 0.5; e.vel.y = 1; setState(e, 'ride'); playSound('land', 0.6, -6); }
    return true;
  }
  const mine = laneOf(state, e);
  const his = p.health > 0 ? trainUnder(p, t, 6)?.lane ?? null : null;
  const free = p.health > 0 && !p.inCutscene && !holdingOff(state) && t.phase === 'ride';
  if (e.pauseTimer && e.pauseTimer > 0) return false;
  switch (e.aiState) {
    case 'seat':
      // (sat on his dragon's back, gripping its crest: till the ride says he's up)
      e.vel.x = 0; e.facing = pm.x < mid(e).x ? -1 : 1;
      return false;
    case 'ride': {
      e.vel.x = 0; e.facing = pm.x < mid(e).x ? -1 : 1;
      if (mine === null || !free) break;
      if (his === mine) { setState(e, 'fight'); break; }
      // (his own dragon's about to go off a broken end: over to another, sharpish (he panics))
      const doomed = t.gaps.find(g => g.lane === mine && g.a > t.dist + TL && (g.a - (t.dist + TL)) / Math.max(t.v, 1) < 70);
      if (doomed && e.rPanic !== doomed.a) {
        e.rPanic = doomed.a;
        if (Math.random() < 0.6) {
          const to = ([0, 1, 2] as Lane[]).filter(l => l !== mine && trainOn(t, l).phase === 'ok' && !t.gaps.some(g => g.lane === l && g.a < t.dist + TL + 500 && g.b > t.dist)).sort((a, b) => Math.abs(a - mine) - Math.abs(b - mine))[0];
          if (to !== undefined) { startHop(state, e, to); return true; }
        }
      }
      // (over onto his, after a few throws: close enough to make it)
      if (his !== null && (e.rThrows ?? 0) >= 2 && e.aiTimer! > 60 && Math.abs(trainOn(t, his).y - trainOn(t, mine).y) < 330 && Math.random() < 0.02) {
        e.rThrows = 0;
        bark(state, e, id, pickLine(RIVAL_HOP[id]));
        startHop(state, e, his);
        return true;
      }
      if (his !== null && e.aiTimer! > 100 + (id === 'hank' ? 30 : 0)) { setState(e, 'wind'); playSound('whoosh', 0.3, -8); }
      break;
    }
    case 'wind':
      // (the thing up in his hand, wound back: the tell)
      e.vel.x = 0; e.facing = pm.x < mid(e).x ? -1 : 1;
      if (e.aiTimer! >= 28) {
        if (free) { throwAt(state, e, id); e.rThrows = (e.rThrows ?? 0) + 1; if (Math.random() < 0.35) bark(state, e, id, pickLine(RIVAL_THROW[id])); }
        setState(e, 'ride');
      }
      break;
    case 'fight': {
      if (!free || his !== mine || mine === null) { setState(e, 'ride'); e.vel.x = 0; break; }
      const dx = pm.x - mid(e).x, dir = (dx < 0 ? -1 : 1) as 1 | -1;
      e.facing = dir;
      if (Math.abs(dx) > 44) e.vel.x = safeAhead(ctx, e, dir, 10) ? dir * (id === 'hank' ? 1.3 : 1.8) : 0;
      else { e.vel.x = 0; if (e.aiTimer! > 30) setState(e, 'cock'); }
      break;
    }
    case 'cock':
      // (the fist cocked back: the tell)
      e.vel.x = 0;
      if (e.aiTimer! >= (id === 'hank' ? 26 : 20)) {
        const reach = 52, x = e.facing! > 0 ? e.pos.x + e.width - 8 : e.pos.x - reach + 8;
        if (p.invincibilityTimer <= 0 && p.health > 0 && p.pos.x < x + reach && p.pos.x + p.width > x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y + 8) {
          hurtPlayer(ctx, id === 'hank' ? 16 : 12, 'm2:fa_rival', { x: e.facing! * 8, y: -5 });
          playSound('punch', 1, -4);
        } else playSound('whoosh', 0.5, -2);
        setState(e, 'after');
      }
      break;
    case 'after':
      e.vel.x = 0;
      if (e.aiTimer! > 36) setState(e, 'fight');
      break;
    case 'leave':
      // (pulled in at the unload: off the front, along the deck, down and out the exit ahead of him)
      e.rSat = false; e.facing = 1; e.vel.x = 2.2;
      break;
    default:
      setState(e, 'ride');
  }
  return false;
};

/** Drawn: the glen's look of him (suitors.ts), the pose for what he's doing (sat on the dragon's back, wound up to
 *  throw with the thing in his hand, the fist cocked, crouched under something). */
const draw = (id: RivalId) => (c: CanvasRenderingContext2D, en: Enemy, f: number, state: GameState) => {
  const e = en as RivalE, look = LOOK(id), t = tragonsOf(state);
  const talking = t.barks.has(e);
  const st = e.aiState;
  if (e.health <= 0) { drawSuitor(c, 0, 0, 1, f, look, 'dead'); return; }
  if (e.rSat) {
    // (astride the dragon's back: sat down on it, his legs hung either side, behind its crest)
    drawSuitor(c, 0, 20, 1, f, look, 'sit', { talking });
    return;
  }
  if (e.rDuck && e.rDuck > 0) { c.save(); c.translate(0, 4); c.scale(1, 0.62); drawSuitor(c, 0, 0, 1, f, look, 'hurt', { talking }); c.restore(); return; }
  const pose = e.pauseTimer && e.pauseTimer > 0 ? 'hurt' : st === 'wind' ? 'throw' : st === 'cock' ? 'throw' : talking ? 'talk' : st === 'fight' ? 'stand' : 'point';
  drawSuitor(c, 0, 0, 1, f, look, pose, { talking });
  // (the thing up in his hand, wound back; or the fist, glowing red as it's cocked)
  if (st === 'wind') drawItem(c, ITEM[id], -18, -96, f * 0.1);
  if (st === 'cock' && f % 6 < 3) { c.fillStyle = '#EF4444'; c.beginPath(); c.arc(-16, -70, 7, 0, Math.PI * 2); c.fill(); }
};

/** What they throw (at the origin): a protein shaker (a big plastic cup, its lid), a dumbbell, a turkey leg. */
export const drawItem = (c: CanvasRenderingContext2D, item: Thrown['item'], x: number, y: number, rot: number) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  const INK = '#1A1028';
  if (item === 'shaker') {
    c.fillStyle = INK; c.fillRect(-7, -11, 14, 22); c.fillStyle = '#1E1E1E'; c.fillRect(-6, -10, 12, 6);
    c.fillStyle = '#E5E7EB'; c.fillRect(-6, -4, 12, 14); c.fillStyle = '#7C4A2A'; c.fillRect(-5, 2, 10, 7);
    c.fillStyle = '#EF4444'; c.fillRect(-5, -2, 10, 3);
  } else if (item === 'dumbbell') {
    c.fillStyle = INK; c.fillRect(-12, -7, 7, 14); c.fillRect(5, -7, 7, 14); c.fillRect(-6, -2, 12, 4);
    c.fillStyle = '#52525B'; c.fillRect(-11, -6, 5, 12); c.fillRect(6, -6, 5, 12); c.fillStyle = '#A1A1AA'; c.fillRect(-5, -1, 10, 2);
  } else {
    c.fillStyle = INK; c.beginPath(); c.ellipse(3, 0, 10, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#B45309'; c.beginPath(); c.ellipse(3, 0, 9, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F59E0B'; c.fillRect(0, -4, 6, 2);
    c.fillStyle = INK; c.fillRect(-10, -2, 6, 4); c.fillStyle = '#F5F5F4'; c.fillRect(-10, -1, 6, 2);
  }
  c.restore();
};

const STATS: Record<RivalId, { w: number; h: number; hp: number; contact: number; mass: number }> = {
  blake: { w: 40, h: 90, hp: 200, contact: 0, mass: 260 },
  rafael: { w: 40, h: 90, hp: 220, contact: 0, mass: 260 },
  hank: { w: 46, h: 92, hp: 340, contact: 0, mass: 400 },
};
for (const id of ['blake', 'rafael', 'hank'] as RivalId[]) {
  registerM2Kind({
    kind: `m2:fa_rival_${id}`, stats: STATS[id], ai: ai(id), draw: draw(id), humanoid: true, gender: 'm',
    head: { x: 2, y: -82, r: 11 }, grab: 'body', pathing: false,
  });
}

/** (ride.ts's, each frame) What they've thrown: flying, at him. */
export const updateThrown = (ctx: FrameContext) => {
  const { state } = ctx, t = tragonsOf(state), p = state.player;
  for (const q of t.thrown) {
    q.x += q.vx; q.y += q.vy; q.vy += 0.35; q.spin += 0.3;
    if (q.y > GY + 20) { q.dead = true; continue; }
    if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && q.x > p.pos.x - 8 && q.x < p.pos.x + p.width + 8 && q.y > p.pos.y - 6 && q.y < p.pos.y + p.height) {
      hurtPlayer(ctx, 9, ITEM_SRC[q.item], { x: Math.sign(q.vx || -1) * 5, y: -4 });
      playSound(q.item === 'shaker' ? 'splat' : 'thud', 0.8, 2);
      for (let k = 0; k < 8; k++) state.particles.push({ pos: { x: q.x, y: q.y }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 20, color: q.item === 'shaker' ? '#7C4A2A' : q.item === 'turkey' ? '#B45309' : '#A1A1AA', size: 3 });
      q.dead = true;
    }
  }
  t.thrown = t.thrown.filter(q => !q.dead);
};

/** Who's on which dragon (for the hazards and the derails): the rivals stood on `lane`'s. */
export const rivalsOn = (state: GameState, lane: Lane) => {
  const t = tragonsOf(state);
  return Object.values(t.rivals).filter((e): e is Enemy => !!e && e.health > 0 && !e.isBlownAway && standsOn(e, t, trainOn(t, lane), 8));
};
/** Crouches him under something coming (he's not that bright: now and then). */
export const rivalDucks = (e: Enemy, frames: number) => { (e as RivalE).rDuck = frames; };
export const rivalHopping = (e: Enemy) => !!(e as RivalE).rHop;
export const rivalSat = (e: Enemy) => !!(e as RivalE).rSat;
/** Off the ride at the unload (gone on to the castle: not a kill). */
export const rivalLeaves = (e: Enemy) => { (e as RivalE).rHop = undefined; setState(e, 'leave'); };
