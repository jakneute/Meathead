// THE MEAN MEN: the show's henchmen holding the White House (Meathead 2's own kinds, registered when Cartoon Land is
// loaded): men and women of every skin, build and hair (seeded per enemy), the show's "mean men" all the same. Each
// has its tell before it hits:
//
//   goon      THE HENCHMAN: a black suit, dark glasses, an earpiece, a buzz cut or a bun. Close, cracks his knuckles (the
//             tell) and swings; further off, drops into a crouch, scraping a foot (the tell), then a running tackle at
//             him, sprawled on his face after (his window).
//   lobbyist  THE LOBBYIST: a pinstripe suit, a gold watch, a fat briefcase. Keeps his distance; the briefcase pops open
//             and bills flutter out (the tell), then a bag of money lobbed at him (it bursts in bills: harmless after);
//             up close, the briefcase swung (a wind up).
//   pollster  THE POLLSTER: a sweater vest, a bow tie, a clipboard, a pencil behind the ear. Keeps well back; licks the
//             pencil and ticks a box (the tell), then flings the clipboard flat and spinning straight at him; up close,
//             the clipboard slapped (a wind up).
//   blimp     THE SPY BLIMP: the mean men's little remote control blimp (MEAN MEN on its side, a camera under it). Floats
//             up over him and keeps there; the hatch opens, beeping (the tell), and a stink bomb drops: a green cloud
//             where it lands that hurts while he's in it a moment. The land's airborne threat in here.
//
// What they throw: hazards.ts (updateThrows). Their drawings: kindArt.ts. All kills here are cartoon puffs
// (state.cartoonKills).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { registerM2Kind, registerHurtLines, registerKindCallouts } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { speak, byPants } from '../section';
import type { ByPants } from '../talk';
import { whOf, type Throw } from './state';
import { HURT, KILL_CALLS, MEAN_VOICES, GOON_BARK, GOON_RUSH, LOBBY_BARK, LOBBY_TOSS, POLL_BARK, POLL_TOSS } from './lines';
import { drawGoon, drawLobbyist, drawPollster, drawBlimp } from './kindArt';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);
for (const [kind, calls] of Object.entries(KILL_CALLS)) registerKindCallouts(kind, calls);

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
export const bark = (state: GameState, e: Enemy, vo: string, pool: ByPants | string[], chance = 0.4, force = false) => {
  const s = whOf(state);
  if (!force && (state.frame - s.barkAt < 240 || Math.random() > chance)) return;
  s.barkAt = state.frame;
  speak(vo, pickLine(Array.isArray(pool) ? pool : byPants(state, pool)), x => { if (x) s.barks.set(e, x); else s.barks.delete(e); }, false);
};
const spotted = (state: GameState, e: Enemy, vo: string, pool: ByPants, chance = 0.45) => {
  const k = e as { spotted?: boolean };
  if (k.spotted) return;
  k.spotted = true;
  bark(state, e, vo, pool, chance);
};
const throwIt = (state: GameState, e: Enemy | null, t: Omit<Throw, 'from' | 't'>) => whOf(state).throws.push({ ...t, from: e, t: 0 });

// ---------------------------------------------------------------------------------------------------------------
// The henchman

const goon = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, MEAN_VOICES.goon, MEAN_VOICES.goonf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 260) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, GOON_BARK, 0.6); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (dx < 66 && level(state, e)) { setState(e, 'punchWind'); e.vel.x = 0; break; }
      walkTo(ctx, e, pm.x, 1.7, 56);
      if (e.aiTimer! > 80 && dx > 150 && dx < 400 && level(state, e, 70)) { setState(e, 'crouch'); e.vel.x = 0; }
      break;
    }
    case 'punchWind':
      // (cracking his knuckles, the fist drawn back: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! === 4) playSound('click', 0.35, 8);
      if (e.aiTimer! > 18) { if (strike(ctx, e, 46, 10, 'm2:ct_goon', 8)) playSound('punch', 0.7, 2); playSound('whoosh', 0.4, 6); setState(e, 'punch'); }
      break;
    case 'punch':
      if (e.aiTimer! > 22) setState(e, 'near');
      break;
    case 'crouch':
      // (down in a crouch, a foot scraping: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 8 === 0) state.particles.push({ pos: { x: mid(e).x - e.facing! * 12, y: e.pos.y + e.height - 2 }, vel: { x: -e.facing! * 1.5, y: -0.6 }, life: 14, color: '#E5E7EB', size: 3 });
      if (e.aiTimer! > 30) { setState(e, 'rush'); bark(state, e, vo, GOON_RUSH, 0.4); playSound('whoosh', 0.6, -2); }
      break;
    case 'rush':
      e.vel.x = e.facing! * 5.6;
      if (e.aiTimer! % 9 === 0) playSound('stomp', 0.25, 4);
      if (strike(ctx, e, 16, 12, 'm2:ct_goon', 11, -6)) { setState(e, 'sprawl'); e.vel.x = 0; playSound('slam', 0.7, 0); break; }
      if (e.aiTimer! > 42 || !safeAhead(ctx, e, e.facing!, 16)) { setState(e, 'sprawl'); e.vel.x *= 0.5; playSound('thud', 0.5, 4); }
      break;
    case 'sprawl':
      // (on his face, sliding to a stop: his window)
      e.vel.x *= 0.85;
      if (e.aiTimer! > 70) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The lobbyist

const lobbyist = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, MEAN_VOICES.lobbyist, MEAN_VOICES.lobbyistf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 580, 280) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, LOBBY_BARK, 0.6); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 70 && level(state, e)) { setState(e, 'swingWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 190, 340, 1.4);
      if (e.aiTimer! > 90 && Math.abs(pm.y - mid(e).y) < 220) { setState(e, 'open'); e.vel.x = 0; playSound('click', 0.5, 2); }
      break;
    case 'open': {
      // (the briefcase popped open, bills fluttering out: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 5 === 0) state.particles.push({ pos: { x: mid(e).x + e.facing! * 14, y: e.pos.y + 40 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() }, life: 30, color: Math.random() < 0.5 ? '#86EFAC' : '#4ADE80', size: 3 });
      if (e.aiTimer! > 30) {
        const p = state.player, t = 34, g = 0.32, tx = p.pos.x + p.width / 2 + p.vel.x * t * 0.4, ty = p.pos.y + p.height * 0.5;
        const hx = mid(e).x + e.facing! * 14, hy = e.pos.y + 26;
        throwIt(state, e, { kind: 'moneybag', x: hx, y: hy, vx: (tx - hx) / t, vy: (ty - hy - 0.5 * g * t * t) / t });
        bark(state, e, vo, LOBBY_TOSS, 0.3); playSound('whoosh', 0.45, 6);
        setState(e, 'after');
      }
      break;
    }
    case 'after':
      if (e.aiTimer! > 34) setState(e, 'near');
      break;
    case 'swingWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 16) { if (strike(ctx, e, 52, 10, 'm2:ct_lobbyist', 8)) playSound('slam', 0.6, 8); playSound('whoosh', 0.5, 2); setState(e, 'swing'); }
      break;
    case 'swing':
      if (e.aiTimer! > 24) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The pollster

const boardOut = (state: GameState, e: Enemy) => whOf(state).throws.some(t => t.kind === 'clipboard' && t.from === e && !t.dead);
const pollster = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, MEAN_VOICES.pollster, MEAN_VOICES.pollsterf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 620, 300) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, POLL_BARK, 0.6); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 64 && level(state, e)) { setState(e, 'slapWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 250, 420, 1.3);
      if (e.aiTimer! > 100 && !boardOut(state, e) && Math.abs(pm.y - mid(e).y) < 150) { setState(e, 'tick'); e.vel.x = 0; }
      break;
    case 'tick':
      // (licking the pencil, ticking a box: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! === 14) playSound('click', 0.4, 12);
      if (e.aiTimer! > 30) {
        const hy = e.pos.y + 30, ty = state.player.pos.y + state.player.height * 0.45;
        throwIt(state, e, { kind: 'clipboard', x: mid(e).x + e.facing! * 16, y: hy, vx: e.facing! * 6.2, vy: Math.max(-1.2, Math.min(1.2, (ty - hy) / 60)) });
        bark(state, e, vo, POLL_TOSS, 0.35); playSound('whoosh', 0.5, 10);
        setState(e, 'after');
      }
      break;
    case 'after':
      if (e.aiTimer! > 30) setState(e, 'near');
      break;
    case 'slapWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { if (strike(ctx, e, 44, 8, 'm2:ct_pollster', 7)) playSound('slam', 0.5, 14); playSound('whoosh', 0.4, 8); setState(e, 'slap'); }
      break;
    case 'slap':
      if (e.aiTimer! > 22) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The spy blimp

const blimp = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player, pm = mid(p);
  tick(e);
  e.vel.y = 0;
  const bob = Math.sin((state.frame + e.initialX) * 0.05) * 0.4;
  switch (e.aiState) {
    default:
      e.vel.x = 0; e.pos.y += bob;
      if (sees(state, e, 600, 420) && e.aiTimer! > 20) setState(e, 'near');
      break;
    case 'near': {
      // (up over him, a bit ahead, drifting)
      const tx = pm.x + (p.facing ?? 1) * 30, ty = p.pos.y - 170;
      const dx = tx - mid(e).x, dy = ty - mid(e).y;
      e.vel.x = Math.max(-1.6, Math.min(1.6, dx * 0.02));
      e.pos.y += Math.max(-1.2, Math.min(1.2, dy * 0.03)) + bob;
      e.facing = dx < 0 ? -1 : 1;
      if (state.frame % 30 === 0) playSound('engine', 0.08, 24);
      if (e.aiTimer! > 120 && Math.abs(dx) < 60) { setState(e, 'hatch'); e.vel.x = 0; }
      break;
    }
    case 'hatch':
      // (the hatch open, beeping: the tell)
      e.vel.x *= 0.9; e.pos.y += bob;
      if (e.aiTimer! % 8 === 0) playSound('beep', 0.3, 18);
      if (e.aiTimer! > 30) {
        throwIt(state, e, { kind: 'stinkbomb', x: mid(e).x, y: e.pos.y + e.height, vx: e.vel.x, vy: 0.5 });
        playSound('click', 0.5, 0);
        setState(e, 'near');
      }
      break;
  }
  e.pos.x += e.vel.x;
  return true;
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
const person = (kind: `m2:ct_${string}`, stats: Reg['stats'], ai: (ctx: FrameContext, e: Enemy) => boolean, draw: (c: CanvasRenderingContext2D, e: Enemy, f: number, seed: number) => void, extra: Partial<Reg> = {}) =>
  registerM2Kind({ kind, stats, humanoid: true, gender, head: { x: 1, y: -66, r: 10 }, ai: leashed(ai), draw: (c, e, f) => draw(c, e, f, seedOf(e)), ...extra });

person('m2:ct_goon', { w: 40, h: 78, hp: 115, contact: 5, mass: 210 }, goon, drawGoon);
person('m2:ct_lobbyist', { w: 38, h: 76, hp: 95, contact: 4, mass: 180 }, lobbyist, drawLobbyist);
person('m2:ct_pollster', { w: 34, h: 72, hp: 75, contact: 4, mass: 150 }, pollster, drawPollster);
registerM2Kind({
  kind: 'm2:ct_blimp', stats: { w: 64, h: 30, hp: 45, contact: 0, mass: 20, air: true }, ai: leashed(blimp),
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }), draw: (c, e, f) => drawBlimp(c, e, f),
  head: { x: 4, y: -16, r: 12 }, gender: 'n', robot: true, grab: 'critter',
});
