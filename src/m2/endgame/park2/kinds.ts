// THE LAZY RIVER's own cast (new kinds, registered as this is loaded), on top of level 1's possessed guests and
// Zorblax's troopers and hover aliens still crashing the party (park1/kinds.ts). Harder: the endgame's step up. Each
// has its tell before it hurts him.
//
//   wp2_burnout  one of his crew: a goth stoner kid. Slouches about; sees him: the lighter up and clicked (the tell),
//                then a lit joint lobbed in an arc at where he is (a patch of fire where it lands, a while). Up close:
//                the joint to the lips, a long drag, cheeks puffing (the tell), then a cloud of hot smoke in his face.
//                Hits back if he's in its face. Not possessed: a person, the grabs work on them in full.
//   wp2_imp      a little fire devil up out of the river: hangs in the air, bobbing; flares up white-hot, arms up
//                (the tell), and either throws a fireball at him or dives at him on a line, then climbs back.

import type { Enemy, EnemyKind } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { holdingOff, mid, safeAhead, makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { speak, type Said } from '../../adventure/section';
import { byPants, KIND_OF } from '../park1/kinds';
import { heard } from '../../bossQuiet';
import { drawBurnout, burnLook, drawImp, type BurnPose, type ImpPose } from './kindArt';
import { fireball, lob, shoot2 } from './fire';
import type { Who2 } from './geo';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
for (const [source, l] of Object.entries(L.HURT2)) registerHurtLines(source, l.hurt, l.death);

export const BURNOUT = 'm2:wp2_burnout', IMP = 'm2:wp2_imp';
export const KIND2_OF: Record<Who2, string> = { dguest: KIND_OF.dguest, aguest: KIND_OF.aguest, trooper: KIND_OF.trooper, hover: KIND_OF.hover, imp: IMP, burnout: BURNOUT };

const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const set = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !holdingOff(state) && !state.player.inCutscene && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};

// ---------------------------------------------------------------------------------------------------------------
// Barks (a burnout, now and then; never over anybody)

const BARKS = new WeakMap<GameState, { at: number; on: Map<Enemy, Said> }>();
const barksOf = (state: GameState) => { let b = BARKS.get(state); if (!b) { b = { at: -999, on: new Map() }; BARKS.set(state, b); } return b; };
const bark = (state: GameState, e: Enemy) => {
  const b = barksOf(state);
  if (state.frame - b.at < 480 || Math.random() > 0.45) return;
  b.at = state.frame;
  const v = burnLook(seedOf(e)).woman ? L.BURNOUT_VOICE.f : L.BURNOUT_VOICE.m;
  speak(v, pickLine(byPants(state, L.BURN_BARK)), s => { if (s) b.on.set(e, s); else b.on.delete(e); }, false);
};
export const drawBarks2 = (c: Ctx, state: GameState, saidOver: (c: Ctx, s: string, x: number, y: number, col?: string, wide?: number) => void) => {
  for (const [e, s] of barksOf(state).on) if (e.health > 0) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 20, '#D8B4FE', 220);
};

// ---------------------------------------------------------------------------------------------------------------
// The burnout

const BO = { see: 560, flick: 30, lobT: 44, inhale: 26, near: 90, dmg: 14, joint: 12, smoke: 11 };
const burnout = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default: {
      // (slouching about its spot)
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 50 || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * 0.6;
      if (e.aiTimer > 40 && sees(state, e, BO.see, 160)) { set(e, 'watch'); bark(state, e); }
      break;
    }
    case 'watch':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 300 && safeAhead(ctx, e, e.facing) ? e.facing * 0.9 : 0;
      if (e.aiTimer > 50 && !holdingOff(state)) set(e, Math.abs(dx) < BO.near && Math.abs(p.y - m.y) < 70 ? 'inhale' : 'flick');
      break;
    case 'flick':
      // (the tell: the lighter up, clicked; a spark)
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer % 10 === 1 && heard(state, m.x)) playSound('click', 0.5, 6);
      if (e.aiTimer > BO.flick) {
        lob(state, m.x + e.facing * 16, e.pos.y + 14, p.x + pl.vel.x * 12, pl.pos.y + pl.height, BO.lobT, 'm2:wp2_burnjoint', BO.joint);
        playSound('whoosh', 0.4, 6);
        set(e, 'throw');
      }
      break;
    case 'throw':
      e.vel.x = 0;
      if (e.aiTimer > 24) set(e, 'watch');
      break;
    case 'inhale':
      // (the tell: the long drag, cheeks puffing)
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > BO.inhale) {
        shoot2(state, { kind: 'puff', x: m.x + e.facing * 22, y: e.pos.y + 10, vx: e.facing * 3.4, vy: 0, src: 'm2:wp2_smoke', dmg: BO.smoke, life: 46, r: 18 });
        playSound('whoosh', 0.5, -8);
        set(e, 'blow');
      }
      break;
    case 'blow':
      e.vel.x = 0;
      if (e.aiTimer > 30) set(e, 'watch');
      break;
  }
  // (shoved up against: a punch back)
  if (e.aiState !== 'idle' && Math.abs(dx) < 34 && Math.abs(p.y - m.y) < 50 && pl.health > 0 && pl.invincibilityTimer <= 0 && !pl.isCharging && e.aiTimer % 40 === 20) { hurtPlayer(ctx, BO.dmg, BURNOUT, { x: e.facing! * 6, y: -4 }, 18); shakeScreen(state, 5, 2); }
  return false;
};
const burnPose = (e: Enemy): BurnPose => {
  if ((e.hitFlash ?? 0) > 0) return 'hurt';
  switch (e.aiState) { case 'flick': return 'flick'; case 'throw': return 'throw'; case 'inhale': return 'inhale'; case 'blow': return 'blow'; default: return Math.abs(e.vel.x) > 0.2 ? 'walk' : 'stand'; }
};

// ---------------------------------------------------------------------------------------------------------------
// The imp

const IM = { see: 600, tell: 30, ball: 5.4, dive: 7.5, dmg: 12, ballDmg: 11 };
const imp = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e);
  tick(e);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  switch (e.aiState) {
    default: {
      const awake = sees(state, e, IM.see, 520);
      const tx = awake ? Math.max(hx - 240, Math.min(hx + 240, p.x - e.width / 2 + (m.x < p.x ? -150 : 150))) : hx;
      e.vel.x = Math.max(-2.6, Math.min(2.6, (tx - e.pos.x) * 0.03));
      e.vel.y = Math.max(-2.4, Math.min(2.4, (hy + Math.sin((state.frame + seedOf(e)) * 0.07) * 16 - e.pos.y) * 0.05));
      e.facing = dirTo(e, p.x);
      if (awake && e.aiTimer > 90 + (seedOf(e) % 40) && !holdingOff(state)) { set(e, 'tell'); if (heard(state, m.x)) playSound('ignite', 0.4, 14); }
      break;
    }
    case 'tell':
      e.vel.x *= 0.85; e.vel.y *= 0.85; e.facing = dirTo(e, p.x);
      if (e.aiTimer > IM.tell) {
        // (a fireball, or a dive: its own mind, every other time a dive)
        e.aiX = ((e.aiX ?? 0) + 1) % 2;
        if (e.aiX === 1 || Math.abs(p.x - m.x) > 420) { fireball(state, m.x, m.y - 10, p.x + pl.vel.x * 10, p.y, IM.ball, 'm2:wp2_impfire', IM.ballDmg); set(e, 'throw'); }
        else { const d = Math.hypot(p.x - m.x, p.y - m.y) || 1; e.aiY = ((p.x - m.x) / d) * IM.dive; e.homeY = hy; (e as Enemy & { diveVy?: number }).diveVy = ((p.y - m.y) / d) * IM.dive; set(e, 'dive'); playSound('whoosh', 0.5, 8); }
      }
      break;
    case 'throw':
      e.vel.x *= 0.9; e.vel.y *= 0.9;
      if (e.aiTimer > 26) set(e, 'idle');
      break;
    case 'dive':
      e.vel.x = e.aiY ?? 0; e.vel.y = (e as Enemy & { diveVy?: number }).diveVy ?? 4;
      if (Math.abs(p.x - m.x) < 26 && Math.abs(p.y - m.y) < 30 && pl.health > 0 && pl.invincibilityTimer <= 0) { hurtPlayer(ctx, IM.dmg, IMP, { x: Math.sign(e.vel.x || 1) * 4, y: -4 }, 16); set(e, 'climb'); }
      if (e.aiTimer > 60 || e.pos.y + e.height > pl.pos.y + pl.height + 10) set(e, 'climb');
      break;
    case 'climb':
      e.vel.x *= 0.95; e.vel.y = Math.max(-3.5, (hy - e.pos.y) * 0.05);
      if (e.aiTimer > 70) set(e, 'idle');
      break;
  }
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  return true;
};
const impPose = (e: Enemy): ImpPose => ((e.hitFlash ?? 0) > 0 ? 'hurt' : e.aiState === 'tell' ? 'tell' : e.aiState === 'throw' ? 'throw' : e.aiState === 'dive' ? 'dive' : 'fly');

const flyer = (b: Enemy): Enemy => ({ ...b, enemyType: 'flyer', initialY: b.pos.y });
registerM2Kind({
  kind: BURNOUT, stats: { w: 32, h: 72, hp: 150, contact: 8, mass: 170 }, ai: burnout, humanoid: true,
  gender: e => (burnLook(seedOf(e)).woman ? 'f' : 'm'), head: { x: 4, y: -68, r: 9 },
  draw: (c, e, f) => drawBurnout(c, seedOf(e), burnLook(seedOf(e)), burnPose(e), f),
});
registerM2Kind({
  kind: IMP, stats: { w: 30, h: 34, hp: 40, contact: 10, mass: 18, air: true }, ai: imp, make: flyer, gender: 'n', grab: 'critter', blood: '#7F1D1D',
  head: { x: 3, y: -26, r: 7 },
  draw: (c, e, f) => drawImp(c, impPose(e), f),
});

/** One of the level's cast (any kind), at (x, feet y). */
export const makeCast2 = (who: Who2, x: number, y: number, i: number) => {
  const e = makeKindEnemy(KIND2_OF[who] as EnemyKind, x, y);
  e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y; e.variant = (i * 7 + Math.floor(x / 10)) % 23;
  return e;
};
