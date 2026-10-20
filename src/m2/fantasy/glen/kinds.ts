// The enchanted glen's new cast (Meathead 2's own kinds, registered when Fairy Land is loaded): more of the park's cast
// members in costume (men and women, every skin, build and hair, seeded per enemy), each with its tell before it hits.
// The town square's (square/kinds.ts) turn up here too (clerks, knights, princesses, an owl, the troll, the dragon).
//
//   huntsman  Snow White's huntsman: a green jerkin, a feathered cap, a loaded crossbow (POINTY: shoulder charging into
//             the bolt out front hurts him); keeps his distance; the crossbow up to the eye and a glint off the bolt's
//             head (the tell), then a bolt, straight and fast, wherever he's aimed it (down a staircase, off a tree
//             stand); up close, the stock in the face
//   cupid     a grown cast member as Cupid (Piper's hired help, sour about it), flown on wires (airborne, low): a
//             diaper, a toga sash, stubby little wings, a laurel or heart headband; drifts, bobs and flutters; draws
//             the heart-tipped bow (the string back, a glint off the heart: the tell), then looses a straight arrow at
//             him (every third draw a volley of three, fanned); the arrow's always nocked out front (POINTY: no
//             shoulder charging into it); close and below it, now and then wings beating hard, up and back (the
//             tell), then it swoops down on him and climbs back to its beat
//   ginger    a gingerbread man (a big foam cookie suit, the performer's face through the mouth): runs at him; squats
//             and shakes, crumbs falling (the tell), then LEAPS onto him; lands in a shower of crumbs and has to get
//             up (his window)
//   dwarf     the mine's dwarfs (adults in dwarf costume: a beard to the belt, a miner's hat with a lit candle on it
//             (SPIKY: dive kicking onto it burns his feet), a pickaxe), a team: from range a rock (a 'gem') wound up and
//             lobbed; up close the pick up over the head (the tell) and down, stuck in the ground after (his window)
//   unicorn   a unicorn mascot (a plush suit, the performer's face in its neck, a rainbow mane, a gold horn (POINTY: no
//             shoulder charging into it)): head down, a hoof pawing, glitter snorted (the tell), then it charges
//             flat out; dizzy after (stars: his window)
//
// What they throw: hazards.ts (updateGlenThrows). Their drawings: kindArt.ts.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine } from '../../../m1/game/platform/speech';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { registerM2Kind, registerHurtLines, registerKindCallouts } from '../../kinds';
import { lookOf } from '../../adventure/temple/people';
import { speak, byPants } from '../section';
import type { ByPants } from '../talk';
import { glenOf, type GThrow } from './state';
import { HURT, KILL_CALLS, GLEN_VOICES, HUNTSMAN_VOICES, HUNTSMAN_BARK, CUPID_BARK, GINGER_BARK, DWARF_BARK, UNICORN_BARK } from './lines';
import { drawHuntsman, drawCupid, drawGinger, drawDwarf, drawUnicorn } from './kindArt';

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
/** A hit in front of it (or all round it: `around`): the damage, its source, a knock. */
const strike = (ctx: FrameContext, e: Enemy, reach: number, dmg: number, source: string, knock = 6, up = -4, around = false) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.inCutscene) return false;
  const x = around ? e.pos.x - reach : e.facing! > 0 ? e.pos.x + e.width - 6 : e.pos.x - reach + 6;
  const w = around ? e.width + reach * 2 : reach;
  if (p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y + 6) {
    hurtPlayer(ctx, dmg, source, { x: (mid(p).x < mid(e).x ? -1 : 1) * knock, y: up });
    return true;
  }
  return false;
};
const level = (state: GameState, e: Enemy, dy = 60) => Math.abs((state.player.pos.y + state.player.height) - (e.pos.y + e.height)) < dy;

/** A bark over its head (rare, one at a time). */
const bark = (state: GameState, e: Enemy, vo: string, pool: ByPants, chance = 0.4) => {
  const g = glenOf(state);
  if (state.frame - g.barkAt < 240 || Math.random() > chance) return;
  g.barkAt = state.frame;
  speak(vo, pickLine(byPants(state, pool)), s => { if (s) g.barks.set(e, s); else g.barks.delete(e); }, false);
};
const spotted = (state: GameState, e: Enemy, vo: string, pool: ByPants, chance = 0.45) => {
  const k = e as { spotted?: boolean };
  if (k.spotted) return;
  k.spotted = true;
  bark(state, e, vo, pool, chance);
};

const push = (state: GameState, t: Omit<GThrow, 't' | 'bounces'>) => glenOf(state).throws.push({ ...t, t: 0, bounces: 0 });
/** Lobbed from its hand to land on him (in `t` frames, under `g` gravity). */
const lobAt = (state: GameState, e: Enemy, kind: GThrow['kind'], t: number, g: number, hx: number, hy: number) => {
  const p = state.player, tx = p.pos.x + p.width / 2 + p.vel.x * t * 0.4, ty = p.pos.y + p.height * 0.6;
  push(state, { kind, x: hx, y: hy, vx: (tx - hx) / t, vy: (ty - hy - 0.5 * g * t * t) / t, from: e });
};

// ---------------------------------------------------------------------------------------------------------------
// The huntsman

const huntsman = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, HUNTSMAN_VOICES.m, HUNTSMAN_VOICES.f);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 620, 420) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, HUNTSMAN_BARK, 0.45); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 56 && level(state, e)) { setState(e, 'bashWind'); e.vel.x = 0; break; }
      keepAt(ctx, e, 220, 420, 1.4);
      if (e.aiTimer! > 70) { setState(e, 'aim'); e.vel.x = 0; playSound('clink', 0.4, -6); }
      break;
    case 'aim': {
      // (the crossbow up to his eye, a glint off the bolt's head: the tell; he keeps it on him)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 40) {
        const hx = mid(e).x + e.facing! * 30, hy = e.pos.y + 26;
        const d = Math.hypot(pm.x - hx, pm.y - hy) || 1;
        push(state, { kind: 'bolt', x: hx, y: hy, vx: ((pm.x - hx) / d) * 10, vy: ((pm.y - hy) / d) * 10, from: e });
        playSound('twang', 0.7, 0);
        setState(e, 'reload');
      }
      break;
    }
    case 'reload':
      e.vel.x = 0;
      if (e.aiTimer! > 50) setState(e, 'near');
      break;
    case 'bashWind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 14) { if (strike(ctx, e, 44, 10, 'm2:fa_huntsman', 7)) playSound('punch', 0.7, -2); setState(e, 'bash'); }
      break;
    case 'bash':
      if (e.aiTimer! > 24) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Cupid on the park's flying rig (flown on wires: moves itself)

type Cupid = Enemy & { shots?: number; toX?: number; toY?: number };
/** Where the arrow comes off the bow (the heart's tip out front). */
const nock = (e: Enemy) => ({ x: mid(e).x + e.facing! * 30, y: e.pos.y + 24 });
const loose = (state: GameState, e: Enemy, spread: number) => {
  const pm = mid(state.player), n = nock(e);
  const a = Math.atan2(pm.y - n.y, pm.x - n.x) + spread;
  push(state, { kind: 'arrow', x: n.x, y: n.y, vx: Math.cos(a) * 8, vy: Math.sin(a) * 8, from: e });
};

const cupid = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, k = e as Cupid;
  tick(e);
  const pm = mid(state.player), m = mid(e);
  const hx = e.homeX ?? e.pos.x, hy = e.homeY ?? e.pos.y;
  const vo = voice(e, GLEN_VOICES.cupid, GLEN_VOICES.cupidf);
  switch (e.aiState) {
    default: {
      // (drifting back and forth over its beat, bobbing on the wires, fluttering, leaning toward him once it's seen him)
      const t = (state.frame + hx) * 0.018, chase = e.aiState === 'hunt' ? Math.max(-140, Math.min(140, pm.x - hx)) * 0.6 : 0;
      const tx = hx + chase + Math.sin(t) * 150, ty = hy + Math.sin(t * 2.3) * 18;
      e.vel.x = (tx - e.pos.x) * 0.04; e.vel.y = (ty - e.pos.y) * 0.05;
      e.facing = Math.abs(pm.x - m.x) < 500 ? dirTo(e, pm.x) : (e.vel.x < 0 ? -1 : 1);
      if (e.aiState !== 'hunt' && sees(state, e, 520, 520)) { setState(e, 'hunt'); spotted(state, e, vo, CUPID_BARK, 0.5); }
      if (e.aiState === 'hunt' && e.aiTimer! > 90 && sees(state, e, 460, 520)) {
        // (close and over him, every other time: the swoop; else the bow)
        const close = Math.abs(pm.x - m.x) < 240 && pm.y > m.y + 40;
        if (close && (k.shots ?? 0) % 2 === 1) { setState(e, 'rear'); playSound('whoosh', 0.4, 10); }
        else { setState(e, 'draw'); playSound('clink', 0.35, 8); }
        bark(state, e, vo, CUPID_BARK, 0.3);
      }
      break;
    }
    case 'draw':
      // (stops in the air, the string drawn back, a glint off the heart: the tell)
      e.vel.x *= 0.85; e.vel.y *= 0.85; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 20 && e.aiTimer! % 5 === 0) state.particles.push({ pos: { x: nock(e).x, y: nock(e).y }, vel: { x: 0, y: -0.5 }, life: 10, color: '#FBCFE8', size: 2 });
      if (e.aiTimer! > 36) {
        // (every third draw a volley of three, fanned)
        if ((k.shots ?? 0) % 3 === 2) { loose(state, e, -0.2); loose(state, e, 0); loose(state, e, 0.2); }
        else loose(state, e, 0);
        k.shots = (k.shots ?? 0) + 1;
        playSound('twang', 0.6, 10);
        setState(e, 'after');
      }
      break;
    case 'after':
      e.vel.x *= 0.9; e.vel.y *= 0.9;
      if (e.aiTimer! > 28) setState(e, 'hunt');
      break;
    case 'rear':
      // (wings beating hard, up and back: the tell; then it picks its spot (where he is))
      e.facing = dirTo(e, pm.x);
      e.vel.x = -e.facing! * 0.9; e.vel.y = -1.1;
      if (e.aiTimer! % 6 === 0) state.particles.push({ pos: { x: m.x - e.facing! * 14, y: e.pos.y + 14 }, vel: { x: (Math.random() - 0.5), y: 0.8 }, life: 18, color: '#FFFFFF', size: 2 });
      if (e.aiTimer! > 22) { k.toX = pm.x; k.toY = pm.y; k.shots = (k.shots ?? 0) + 1; playSound('whoosh', 0.6, -2); setState(e, 'swoop'); }
      break;
    case 'swoop': {
      const dx = (k.toX ?? pm.x) - m.x, dy = (k.toY ?? pm.y) - m.y, d = Math.hypot(dx, dy) || 1;
      e.vel.x = (dx / d) * 6.5; e.vel.y = (dy / d) * 6.5;
      if (strike(ctx, e, 4, 10, 'm2:fa_cupid', 7, -5, true)) { playSound('thud', 0.7, 2); setState(e, 'rise'); break; }
      if (d < 12 || e.aiTimer! > 45) setState(e, 'rise');
      break;
    }
    case 'rise':
      // (back up to its beat)
      e.vel.x = (hx - e.pos.x) * 0.03; e.vel.y = (hy - e.pos.y) * 0.05;
      if (e.aiTimer! > 60 || Math.abs(hy - e.pos.y) < 10) setState(e, 'hunt');
      break;
  }
  e.pos.x += e.vel.x; e.pos.y += e.vel.y;
  // (never down into the floor: the rig keeps it off the ground (lower in the swoop))
  const floor = floorTopAt(state.blocks, m.x, e.pos.y + e.height, 0), clear = e.aiState === 'swoop' ? 6 : 20;
  if (floor !== null && e.pos.y + e.height > floor - clear) e.pos.y = floor - clear - e.height;
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The gingerbread man

const ginger = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, GLEN_VOICES.ginger, GLEN_VOICES.gingerf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 540, 240) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, GINGER_BARK, 0.55); }
      break;
    case 'near': {
      walkTo(ctx, e, pm.x, 1.9, 80);
      const dx = Math.abs(pm.x - mid(e).x);
      if (e.aiTimer! > 40 && dx < 230 && dx > 40 && Math.abs(pm.y - mid(e).y) < 140) { setState(e, 'crouch'); e.vel.x = 0; playSound('rumble', 0.3, 14); }
      break;
    }
    case 'crouch':
      // (squats and shakes, crumbs off him: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 5 === 0) state.particles.push({ pos: { x: mid(e).x + (Math.random() - 0.5) * 30, y: e.pos.y + 30 }, vel: { x: (Math.random() - 0.5), y: 1 }, life: 20, color: '#B87A44', size: 2 });
      if (e.aiTimer! > 30) {
        const dx = pm.x - mid(e).x;
        e.vel.x = Math.max(-6.5, Math.min(6.5, dx / 34)); e.vel.y = -10;
        playSound('whoosh', 0.6, -2);
        setState(e, 'leap');
      }
      break;
    case 'leap': {
      if (strike(ctx, e, 6, 14, 'm2:fa_ginger', 7, -6, true)) playSound('thud', 0.9, -6);
      const under = floorTopAt(state.blocks, mid(e).x, e.pos.y + e.height - 4, 8);
      if (e.aiTimer! > 8 && e.vel.y >= 0 && under !== null && Math.abs(under - (e.pos.y + e.height)) < 6) {
        e.vel.x = 0; playSound('slam', 0.7, 2); shakeScreen(state, 4, 3);
        for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: mid(e).x + (Math.random() - 0.5) * 40, y: e.pos.y + e.height - 4 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 26, color: ['#B87A44', '#8A5A30', '#F5F0DC'][i % 3], size: 3 });
        setState(e, 'down');
      } else if (e.aiTimer! > 90) setState(e, 'down');
      break;
    }
    case 'down':
      e.vel.x *= 0.7;
      if (e.aiTimer! > 52) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The dwarf

const dwarf = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, GLEN_VOICES.dwarf, GLEN_VOICES.dwarff);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 560, 300) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, DWARF_BARK, 0.5); }
      break;
    case 'near':
      if (Math.abs(pm.x - mid(e).x) < 52 && level(state, e)) { setState(e, 'pickWind'); e.vel.x = 0; break; }
      if (Math.abs(pm.x - mid(e).x) < 200) walkTo(ctx, e, pm.x, 1.6, 30);
      else keepAt(ctx, e, 120, 280, 1.4);
      // (a third of them throw; the rest come in with the pick)
      if (e.aiTimer! > 75 + (seedOf(e) % 3) * 20 && Math.abs(pm.x - mid(e).x) > 110) { setState(e, 'wind'); e.vel.x = 0; }
      break;
    case 'wind':
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 26) { lobAt(state, e, 'rock', 30, 0.32, mid(e).x + e.facing! * 10, e.pos.y + 4); playSound('whoosh', 0.5, 8); setState(e, 'after'); }
      break;
    case 'after':
      if (e.aiTimer! > 22) setState(e, 'near');
      break;
    case 'pickWind':
      // (the pick up over his head: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 20) {
        if (strike(ctx, e, 46, 12, 'm2:fa_dwarf', 6)) playSound('crunch', 0.7, 4); else playSound('clang', 0.5, 6);
        for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: mid(e).x + e.facing! * 34, y: e.pos.y + e.height - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 16, color: '#A8A29E', size: 2 });
        setState(e, 'stuck');
      }
      break;
    case 'stuck':
      // (the pick stuck in the ground: tugging at it)
      e.vel.x = 0;
      if (e.aiTimer! > 34) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// The unicorn

const unicorn = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, pm = mid(state.player);
  tick(e);
  const vo = voice(e, GLEN_VOICES.unicorn, GLEN_VOICES.unicornf);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 600, 200) && e.aiTimer! > 20) { setState(e, 'near'); spotted(state, e, vo, UNICORN_BARK, 0.6); }
      break;
    case 'near': {
      const dx = Math.abs(pm.x - mid(e).x);
      if (dx > 360) walkTo(ctx, e, pm.x, 1.1, 340); else e.vel.x = 0;
      e.facing = dirTo(e, pm.x);
      if (e.aiTimer! > 45 && dx < 420 && level(state, e, 90)) { setState(e, 'paw'); e.vel.x = 0; playSound('snort', 0.6, 6); }
      break;
    }
    case 'paw':
      // (head down, a hoof pawing the ground, glitter snorted: the tell)
      e.vel.x = 0; e.facing = dirTo(e, pm.x);
      if (e.aiTimer! % 11 === 0) playSound('stomp', 0.35, 4);
      if (e.aiTimer! % 4 === 0) state.particles.push({ pos: { x: mid(e).x + e.facing! * 40, y: e.pos.y + 30 }, vel: { x: e.facing! * 0.8, y: -0.6 }, life: 22, color: ['#F9A8D4', '#A5F3FC', '#FEF08A', '#C4B5FD'][e.aiTimer! % 4], size: 3 });
      if (e.aiTimer! > 44) setState(e, 'charge');
      break;
    case 'charge':
      e.vel.x = e.facing! * 6.6;
      if (e.aiTimer! % 7 === 0) playSound('stomp', 0.35, 2);
      if (e.aiTimer! % 2 === 0) state.particles.push({ pos: { x: mid(e).x - e.facing! * 30, y: e.pos.y + e.height - 30 }, vel: { x: -e.facing! * 1.5, y: 0 }, life: 18, color: ['#F87171', '#FBBF24', '#4ADE80', '#60A5FA', '#A78BFA'][e.aiTimer! % 5], size: 4 });
      if (strike(ctx, e, 34, 16, 'm2:fa_unicorn', 10, -6)) { setState(e, 'dizzy'); e.vel.x = 0; break; }
      if (e.aiTimer! > 80 || !safeAhead(ctx, e, e.facing!, 16)) { setState(e, 'dizzy'); e.vel.x = 0; playSound('thud', 0.6, -6); }
      break;
    case 'dizzy':
      e.vel.x *= 0.8;
      if (e.aiTimer! > 70) setState(e, 'near');
      break;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------

/** Out of aggro range: this far off, anybody after him gives up and goes back to standing about. */
const LEASH_X = 820, LEASH_Y = 460;
const leashed = (ai: (ctx: FrameContext, e: Enemy) => boolean) => (ctx: FrameContext, e: Enemy) => {
  if (e.aiState && e.aiState !== 'idle' && e.aiState !== 'hunt') {
    const p = mid(ctx.state.player), m = mid(e);
    if (Math.abs(p.x - m.x) > LEASH_X || Math.abs(p.y - m.y) > LEASH_Y) { setState(e, 'idle'); e.vel.x = 0; }
  }
  return ai(ctx, e);
};
type Reg = Parameters<typeof registerM2Kind>[0];
const person = (kind: `m2:fa_${string}`, stats: Reg['stats'], ai: (ctx: FrameContext, e: Enemy) => boolean, draw: (c: CanvasRenderingContext2D, e: Enemy, f: number, seed: number) => void, extra: Partial<Reg> = {}) =>
  registerM2Kind({ kind, stats, humanoid: true, gender, head: { x: 1, y: -66, r: 10 }, ai: leashed(ai), draw: (c, e, f) => draw(c, e, f, seedOf(e)), ...extra });

person('m2:fa_huntsman', { w: 38, h: 76, hp: 110, contact: 4, mass: 200 }, huntsman, drawHuntsman, { pointy: { source: 'm2:fa_bolted', label: 'BOLTED!', damage: 14 } });
person('m2:fa_dwarf', { w: 34, h: 58, hp: 85, contact: 4, mass: 150 }, dwarf, drawDwarf, { head: { x: 1, y: -50, r: 9 }, spiky: { source: 'm2:fa_candle', label: 'SINGED!', damage: 10 } });
person('m2:fa_ginger', { w: 46, h: 82, hp: 150, contact: 6, mass: 260 }, ginger, drawGinger, { head: { x: 2, y: -70, r: 14 }, grab: 'body' });
person('m2:fa_unicorn', { w: 64, h: 92, hp: 280, contact: 7, mass: 400 }, unicorn, drawUnicorn, { head: { x: 18, y: -78, r: 13 }, pointy: { source: 'm2:fa_horn', label: 'GORED!', damage: 16 }, grab: 'none' });
registerM2Kind({
  kind: 'm2:fa_cupid', stats: { w: 40, h: 58, hp: 80, contact: 6, mass: 130, air: true }, ai: leashed(cupid),
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y }), draw: (c, e, f) => drawCupid(c, e, f, seedOf(e)),
  head: { x: 1, y: -50, r: 9 }, gender, grab: 'critter',
  pointy: { source: 'm2:fa_pricked', label: 'PRICKED!', damage: 12 },
});
