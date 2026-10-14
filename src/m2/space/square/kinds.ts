// The outdoors' enemies (Meathead 2's own kinds, registered when Space Land's loaded): Futureland's cast and security,
// out in the square and on the main drag. Teach, then escalate: each comes in alone first (layout.ts), then they mix.
//
//   rover     ROVER-1, the old show's robot dog, got loose (the critter): trots about, yaps (the tell), rushes his
//             ankles. Tiny: the slide does it. A machine.
//   cadet     a space cadet (the basic grunt, a shooter): keeps a few strides off, raises the toy ray gun (the tell:
//             its nozzle glows) and fires a slow toy bolt. What do they put in those things.
//   guard     park security on the HOVER-PATROL (the rusher): the siren light (the tell), then runs him down flat out,
//             stun baton first, and overshoots. The baton's pointy: charging into it from the front gets him tased.
//   robot     a cardboard robot suit (the bruiser): slow, heavy; both dryer-hose arms up (the tell), then the windmill
//             (DOES NOT COMPUTE). The antenna's live: dive kicking down onto it zaps him (spiky).
//   jetpack   a show performer in a jetpack (the flyer, the thrower): keeps up in the air off to one side and lobs
//             bricks of freeze-dried astronaut ice cream.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { holdingOff, mid, safeAhead } from '../../../m1/game/enemies/kinds';
import { shakeScreen } from '../../../m1/game/core/state';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { speak } from '../section';
import { outOf } from './state';
import { HURT, GUARD_BARK, GUARD_VOICES, type ByPants } from './lines';
import { drawCadet, drawRobot, drawGuard, drawJetpack, drawRover, toyGun, iceCream } from './kindArt';

type Ctx = CanvasRenderingContext2D;

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const dirTo = (e: Enemy, x: number) => (x < mid(e).x ? -1 : 1) as 1 | -1;
const tick = (e: Enemy) => (e.aiTimer = (e.aiTimer || 0) + 1);
const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const alive = (state: GameState) => state.player.health > 0;
/** Who's under the costume: the same person every time (the seed's where it was put down). */
export const seedOf = (e: Enemy) => Math.abs(Math.round(e.initialX || 0)) + (e.variant ?? 0) * 31;
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return alive(state) && !holdingOff(state) && !state.player.inCutscene && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
export const byPants = <T extends ByPants>(state: GameState, r: T) => (isNude(state) ? r.nude : isShat(state) ? r.shitty : r.clean);

// ---------------------------------------------------------------------------------------------------------------
// What's fired and thrown: the cadets' toy bolts (straight, slow), the jetpackers' ice cream (lobbed)

const BOLT_V = 4.2, LOB_G = 0.3;
const DMG = { bolt: 7, icecream: 9 };
const SRC = { bolt: 'm2:space_cadet_shot', icecream: 'm2:space_icecream' };

const fireBolt = (state: GameState, x: number, y: number, dir: number) => {
  outOf(state).shots.push({ x, y, vx: dir * BOLT_V, vy: 0, kind: 'bolt', t: 0 });
  playSound('rayFizzle', 0.45, 6);
};
const lobAt = (state: GameState, x: number, y: number, t: number) => {
  const p = mid(state.player), tx = p.x + state.player.vel.x * t * 0.3;
  outOf(state).shots.push({ x, y, vx: (tx - x) / t, vy: (p.y - y - 0.5 * LOB_G * t * t) / t, kind: 'icecream', t: 0 });
  playSound('whoosh', 0.3, 4);
};
export const updateShots = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, o = outOf(state);
  o.shots = o.shots.filter(s => {
    s.t++;
    if (s.kind === 'icecream') s.vy += LOB_G;
    s.x += s.vx; s.y += s.vy;
    const pop = () => {
      const cols = s.kind === 'bolt' ? ['#A7F3D0', '#FDE047', '#FFFFFF'] : ['#F9A8D4', '#FEF3C7', '#92400E'];
      for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 18, color: cols[i % cols.length], size: 2 + Math.random() * 2 });
    };
    if (p.health > 0 && s.x > p.pos.x + 2 && s.x < p.pos.x + p.width - 2 && s.y > p.pos.y && s.y < p.pos.y + p.height) {
      if (p.invincibilityTimer <= 0) hurtPlayer(ctx, DMG[s.kind], SRC[s.kind], { x: Math.sign(s.vx || 1) * 3, y: -4 }, 16);
      pop(); return false;
    }
    if (state.blocks.some(b => b.type !== 'pit' && !b.oneWay && s.x > b.x && s.x < b.x + b.w && s.y > b.y && s.y < b.y + b.h)) { pop(); return false; }
    return s.t < 260;
  });
};
export const drawShots = (c: Ctx, state: GameState) => {
  for (const s of outOf(state).shots) {
    if (s.kind === 'bolt') {
      // (a fat green ring of toy-gun light, wobbling)
      const r = 5 + Math.sin(s.t * 0.5) * 1.2;
      c.fillStyle = 'rgba(167, 243, 208, 0.45)'; c.beginPath(); c.ellipse(s.x, s.y, r + 4, r + 2, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#ECFCCB'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(s.x, s.y, r * 0.6, r, 0, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#4ADE80'; c.lineWidth = 1; c.beginPath(); c.ellipse(s.x - Math.sign(s.vx) * 6, s.y, r * 0.4, r * 0.7, 0, 0, Math.PI * 2); c.stroke();
    } else {
      c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.2); iceCream(c, 0, 0); c.restore();
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------

const fly = (state: GameState, e: Enemy) => {
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  const m = mid(e), floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0);
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; return true; }
  return false;
};

const rover = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player);
  tick(e);
  switch (e.aiState) {
    default: {
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 60 || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * 1.4;
      if (e.aiTimer > 30 && sees(state, e, 300, 70)) { setState(e, 'yap'); e.facing = dirTo(e, p.x); }
      break;
    }
    case 'yap':
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer % 8 === 1) playSound('beep', 0.25, 10);
      if (e.aiTimer > 22) setState(e, 'rush');
      break;
    case 'rush':
      if (!safeAhead(ctx, e, e.facing!, 16)) { e.vel.x = 0; setState(e, 'recover'); break; }
      e.vel.x = e.facing! * 5.2;
      if (e.aiTimer > 40) setState(e, 'recover');
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 34) { setState(e, 'idle'); e.homeX = e.pos.x; }
      break;
  }
  return false;
};

const cadet = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 200)) { setState(e, 'walk'); e.shootTimer = 40 + (seedOf(e) % 40); }
      break;
    case 'walk': {
      e.facing = dirTo(e, p.x);
      // (keeps a few strides off: in, if he's far; back, if he's close)
      const want = Math.abs(dx) > 300 ? e.facing : Math.abs(dx) < 130 ? -e.facing : 0;
      e.vel.x = want && safeAhead(ctx, e, want) ? want * 1.1 : 0;
      e.shootTimer++;
      if (e.shootTimer > 110 && Math.abs(dx) < 460 && Math.abs(p.y - m.y) < 80 && !holdingOff(state)) setState(e, 'aim');
      break;
    }
    case 'aim':
      // (the gun up, its nozzle glowing: the tell)
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer > 28) { setState(e, 'fire'); fireBolt(state, m.x + e.facing * 30, e.pos.y + e.height - 54, e.facing); }
      break;
    case 'fire':
      if (e.aiTimer > 24) { e.shootTimer = Math.floor(Math.random() * 30); setState(e, 'walk'); }
      break;
  }
  return false;
};

/** A guard's bark (rare), over the scooter: clean, shat or naked, in their own voice. */
const bark = (state: GameState, e: Enemy) => {
  const o = outOf(state);
  if (state.frame - o.paAt < 200 || Math.random() > 0.34) return;
  o.paAt = state.frame;
  const v = lookOf(seedOf(e)).woman ? GUARD_VOICES.f : GUARD_VOICES.m;
  speak(v, pickLine(byPants(state, GUARD_BARK)), s => { if (s) o.barks.set(e, s); else o.barks.delete(e); }, false);
};
const guard = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e);
  tick(e);
  switch (e.aiState) {
    default: {
      const home = e.homeX ?? e.pos.x;
      e.facing ??= -1;
      if (Math.abs(e.pos.x - home) > 70 || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * 0.8;
      if (e.aiTimer > 20 && sees(state, e, 540, 110)) { setState(e, 'siren'); bark(state, e); }
      break;
    }
    case 'siren':
      // (the light going, the baton out: the tell)
      e.vel.x = 0; e.facing = dirTo(e, p.x);
      if (e.aiTimer === 4) playSound('siren', 0.25, 6);
      if (e.aiTimer > 34) setState(e, 'rush');
      break;
    case 'rush': {
      const ahead = safeAhead(ctx, e, e.facing!, 44);
      e.vel.x = ahead ? e.facing! * 7 : 0;
      const past = (p.x - m.x) * e.facing! < -150;
      if (!ahead || past || e.aiTimer > 80) setState(e, 'skid');
      break;
    }
    case 'skid':
      e.vel.x *= 0.9;
      if (e.aiTimer > 36) { e.homeX = e.pos.x; setState(e, sees(state, e, 540, 110) ? 'siren' : 'idle'); }
      break;
  }
  return false;
};

const SPIN_REACH = 96, SPIN_DMG = 18;
const robot = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pl = state.player, p = mid(pl), m = mid(e), dx = p.x - m.x;
  tick(e);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 160)) setState(e, 'walk');
      break;
    case 'walk':
      e.facing = dirTo(e, p.x);
      e.vel.x = Math.abs(dx) > 70 && safeAhead(ctx, e, e.facing) ? e.facing * 0.75 : 0;
      if (Math.abs(dx) < 120 && Math.abs(p.y - m.y) < 90 && !holdingOff(state)) setState(e, 'raise');
      break;
    case 'raise':
      e.vel.x = 0;
      if (e.aiTimer === 2) playSound('beep', 0.4, -6);
      if (e.aiTimer > 36) { setState(e, 'spin'); playSound('whoosh', 0.6, -4); }
      break;
    case 'spin':
      // (the windmill: both ways at once; twice through)
      e.vel.x = 0;
      if (e.aiTimer === 8 || e.aiTimer === 22) {
        if (Math.abs(dx) < SPIN_REACH && Math.abs(p.y - m.y) < 70 && pl.health > 0 && pl.invincibilityTimer <= 0) {
          hurtPlayer(ctx, SPIN_DMG, 'm2:space_robot', { x: Math.sign(dx || 1) * 7, y: -6 }, 20);
          shakeScreen(state, 8, 4);
        }
        playSound('whoosh', 0.4, 2);
      }
      if (e.aiTimer > 30) setState(e, 'recover');
      break;
    case 'recover':
      if (e.aiTimer > 46) setState(e, 'walk');
      break;
  }
  return false;
};

const jetpack = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e);
  tick(e);
  const hy = e.homeY ?? e.pos.y, home = e.homeX ?? e.pos.x;
  const awake = sees(state, e, 640, 700);
  const side = m.x < p.x ? -1 : 1;
  // (its own patch of sky: it won't follow him down the street)
  const tx = awake ? Math.max(home - 240, Math.min(home + 240, p.x + side * 230 - e.width / 2)) : home;
  const ty = Math.min(hy, awake ? p.y - 190 : hy) + Math.sin((state.frame + seedOf(e)) * 0.06) * 12;
  e.vel.x = Math.max(-3, Math.min(3, (tx - e.pos.x) * 0.03));
  e.vel.y = Math.max(-3, Math.min(3, (ty - e.pos.y) * 0.04));
  e.facing = dirTo(e, p.x);
  switch (e.aiState) {
    default:
      if (awake && e.aiTimer > 120 && Math.abs(p.x - m.x) < 380) setState(e, 'windup');
      break;
    case 'windup':
      e.vel.x *= 0.3; e.vel.y *= 0.3;
      if (e.aiTimer === 18) lobAt(state, m.x + e.facing! * 12, m.y - 14, Math.max(34, Math.min(60, Math.abs(p.x - m.x) / 5)));
      if (e.aiTimer > 30) { setState(e, 'idle'); e.aiTimer = -Math.floor(Math.random() * 30); }
      break;
  }
  fly(state, e);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------

const flyer = (b: Enemy): Enemy => ({ ...b, enemyType: 'flyer', initialY: b.pos.y });
const personGender = (e: Enemy) => (lookOf(seedOf(e)).woman ? 'f' : 'm') as 'm' | 'f';

registerM2Kind({ kind: 'm2:space_rover', stats: { w: 34, h: 28, hp: 14, contact: 7, mass: 6 }, ai: rover, draw: (c, e, f) => drawRover(c, e, f), head: { x: 16, y: -22, r: 6 }, gender: 'n', grab: 'critter', robot: true });
registerM2Kind({ kind: 'm2:space_cadet', stats: { w: 38, h: 70, hp: 90, contact: 7, mass: 180 }, ai: cadet, humanoid: true, gender: personGender, head: { x: 1, y: -66, r: 13 }, draw: (c, e, f) => drawCadet(c, e, f, seedOf(e)) });
registerM2Kind({
  kind: 'm2:space_guard', stats: { w: 46, h: 82, hp: 160, contact: 14, mass: 260 }, ai: guard, humanoid: true, gender: personGender, head: { x: 1, y: -78, r: 10 },
  pointy: { source: 'm2:space_guard_baton', label: 'TASED!', damage: 14 },
  draw: (c, e, f) => drawGuard(c, e, f, seedOf(e)),
});
registerM2Kind({
  kind: 'm2:space_robot', stats: { w: 50, h: 92, hp: 340, contact: 12, mass: 400 }, ai: robot, humanoid: true, gender: personGender, head: { x: 1, y: -84, r: 13 },
  spiky: { source: 'm2:space_robot_antenna', label: 'ZAPPED!', damage: 12 },
  draw: (c, e, f) => drawRobot(c, e, f, seedOf(e)),
});
registerM2Kind({ kind: 'm2:space_jetpack', stats: { w: 42, h: 66, hp: 100, contact: 10, mass: 160, air: true }, ai: jetpack, make: flyer, humanoid: true, gender: personGender, head: { x: 1, y: -66, r: 9 }, draw: (c, e, f) => drawJetpack(c, e, f, seedOf(e)) });

/** A guard's bark, over them (world space, after the enemies: drawFront). */
export const drawBarks = (c: Ctx, state: GameState, saidOver: (c: Ctx, s: string, x: number, y: number, col?: string, wide?: number) => void) => {
  const o = outOf(state);
  for (const e of state.enemies) { const s = o.barks.get(e); if (s && e.health > 0) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 18, '#BFDBFE', 220); }
};

export { toyGun };
