// THE ENSEMBLE CAST, the sub-boss: the main stage, one screen (the user's playtest notes). Open till he's in; then the
// stage door comes down behind him (the far wall's ahead: both sides locked) till every one of them is dead.
//
// The first of them is always CAPTAIN AMERICANO (a short cutscene: he jumps in shouting REVENGERS: RESEMBLE!, sure he
// can stop this civilian because he plays a super soldier); after him, the rest come in a random order each attempt (a
// share of the thirty: not all of them in any one fight), dropping out of the rafters or lowered on wires, a few at a
// time (a cap on how many are up at once, rising as they die; never more than two coming down at once), the odd one
// with a line from the shared pool (sparse).
//
// They have no moves: they DOGPILE him. Touching him, one's on him like a cockroach (a hold each: his legs, his back,
// round his waist, on his shoulders, across the top: a growing pile), and every one on him slows him; with CRUSH of
// them on him he can't move at all and he's dead under them (piled on: its own hurt and death lines). He shakes them
// off: a charge (any of the charge moves) throws the lot off and hurts them; every shot knocks one loose. Let up, and
// they're all over him. His grab gets one at a time (the rest keep piling on).
//
// Their real health is kept here (cast.ts: the engine's never runs out); dead, they fall over where they stand,
// bloodied, and the bodies stay, piling up where they fell on each other. Never respawned once past (CAST_MEMO, kept
// across his deaths); dying mid-fight, it's all of them again from the refill (checkpoint 25), in a new order.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, takeFreshLine, silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { buffs } from '../../../m1/game/core/buffs';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, PLAYER_MOVE_SPEED, topBand } from '../../../m1/constants';
import type { Controls } from '../../../m1/game/platform/input';
import { solid, meatheadSays, box, label, hands } from '../section';
import { byPants } from '../blvd/kinds';
import type { ByPants } from '../blvd/lines';
import { X, GY, ROOF_Y, ARENA, ARENA_CAM, ARENA_TRIGGER, CAST_MEMO } from './layout';
import { whOf, type Arrival, type Actor } from './state';
import { CAST, ACTOR_KIND, BIG, drawArriving, drawBody, drawClinger } from './cast';
import { CAST_ARRIVE, KILL_QUIPS, HALF, LAST, DEATH, ARRIVE, LATCH, CAP_RESEMBLE, CAP_SURE, CAP_REPLY, AD_CAST, AD_SHRUG } from './lines';
import { adSay, castSay } from './talk';
import { hurtTaken } from '../../../m1/game/core/resist';
import { setHalfHooks } from '../../weapons/half';
import { setDropTable } from '../../../m1/game/core/effects';
import { markBossFight } from '../../bossQuiet';

/** How many of them are in it (CAPTAIN AMERICANO and the rest in a shuffled order: the whole thirty). */
const FIGHT_SIZE = CAST.length;
/** The drops: none in the fight (pure attrition); the park's everywhere else (App.tsx's). */
const NO_DROPS = { health: 0, ammo: 0 }, PARK_DROPS = { health: 0.06, ammo: 0.05 };
/** How many on him and he's down under them, dead. */
export const CRUSH = 6;
/** How many may be up (on the floor, on him, or coming down) at once: a few at first, more as they die. */
const capOf = (killed: number) => Math.min(10, 5 + Math.floor(killed / 2));
const L0 = X(ARENA.a) + 50, R0 = X(ARENA.b) - 50;
const clampX = (x: number) => Math.max(L0, Math.min(R0, x));
const DOOR_H = 700;

const memo = (state: GameState, k: string) => !!state.stageMemo[k];
export const castDone = (state: GameState) => memo(state, CAST_MEMO);
export const fightOn = (state: GameState) => { const ph = whOf(state).fight.phase; return ph === 'on' || ph === 'intro'; };

/**
 * The holds on him (the dogpile), in the order they're taken (the one they came at him from first): where each one's
 * feet go off his feet's middle (dx forward of him, the way he faces; dy up his height, a share of it), how they're
 * turned, whether they face him (or his way), and whether they're drawn in front of him or behind.
 *   0 flat out hugging his front leg · 1 his back leg · 2 up on his back · 3 round his waist from the front ·
 *   4 up on his shoulders · 5 across the top of him · 6+ piled on top of that
 */
const SLOTS: { dx: number; dy: number; rot: number; toward: boolean; front: boolean }[] = [
  { dx: 76, dy: -0.1, rot: 1.3, toward: true, front: true },
  { dx: -76, dy: -0.1, rot: 1.3, toward: true, front: false },
  { dx: -15, dy: -0.42, rot: 0.3, toward: true, front: false },
  { dx: 22, dy: -0.05, rot: 0.4, toward: true, front: true },
  { dx: 3, dy: -0.58, rot: -0.15, toward: false, front: true },
  { dx: -38, dy: -0.95, rot: 1.45, toward: false, front: true },
];
const slotOf = (s: number) => SLOTS[s] ?? { dx: s % 2 ? 34 : -34, dy: -0.95 - (s - 5) * 0.22, rot: s % 2 ? -1.45 : 1.45, toward: false, front: true };
/** Where one on him is this frame (feet, world), which way it faces, how it's turned. */
const clingAt = (state: GameState, a: Actor) => {
  const p = state.player, c = a.cling!, s = slotOf(c.slot), f = (p.facing ?? 1) as 1 | -1, h = p.height;
  const px = p.pos.x + p.width / 2, feet = p.pos.y + p.height, fr = state.frame;
  let x = px + f * s.dx + Math.sin(fr * 0.6 + a.i) * 2, y = feet + s.dy * h + Math.cos(fr * 0.5 + a.i) * 1.5;
  // (the jump on: from where they were, onto him)
  const k = Math.min(1, c.t / 8);
  if (k < 1) { x = px + c.fx + (x - px - c.fx) * k; y = feet + c.fy + (y - feet - c.fy) * k - Math.sin(k * Math.PI) * 24; }
  const dir: 1 | -1 = s.toward ? (s.dx * f > 0 ? -1 : s.dx * f < 0 ? 1 : (f === 1 ? -1 : 1)) : f;
  return { x, y, dir, rot: s.rot };
};
export const onHim = (state: GameState) => whOf(state).fight.actors.reduce((n, a) => n + (a.cling ? 1 : 0), 0);

// ---------------------------------------------------------------------------------------------------------------

/** Nobody saying anything just now (the barks wait for quiet: one speaker at a time). */
const quiet = (state: GameState) => { const o = whOf(state); return !o.ad && !o.adBusy && !o.castSaid.size; };
/** One of them says a line from a pool (sparse: only now and then, only into quiet, a line not said lately). */
const castBark = (state: GameState, i: number, pool: ByPants, chance: number, gap = 360) => {
  const F = whOf(state).fight;
  if (state.frame - F.barkAt < gap || !quiet(state) || Math.random() > chance) return;
  const line = takeFreshLine(byPants(state, pool));
  if (!line) return;
  F.barkAt = state.frame;
  castSay(state, i, line, false);
};

const start = (state: GameState) => {
  const F = whOf(state).fight, p = state.player;
  F.phase = 'intro'; F.t = 0; F.killed = 0; F.crushed = false;
  // (who's in it this time: him first, then a shuffled share of the rest)
  const rest = Array.from({ length: CAST.length - 1 }, (_, k) => k + 1);
  for (let k = rest.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [rest[k], rest[j]] = [rest[j], rest[k]]; }
  F.order = [0, ...rest.slice(0, FIGHT_SIZE - 1)]; F.next = 1; F.spawnT = 0;
  // (the stage door down behind him: no backing out)
  F.door = solid(state, X(ARENA.a) - 34, GY - DOOR_H, 34, DOOR_H, { hidden: true, tag: 'hww-lock' });
  if (p.pos.x < X(ARENA.a) + 4) p.pos.x = X(ARENA.a) + 4;
  playSound('slam', 1, -10); playSound('rumble', 0.6, -6); shakeScreen(state, 8, 3);
  // CAPTAIN AMERICANO: in out of the rafters, ahead of him (the side with the room), shouting it on the way down
  const px = p.pos.x + p.width / 2, mid = (X(ARENA.a) + X(ARENA.b)) / 2;
  F.arrivals.push({ i: 0, mode: 'drop', x: clampX(px + (px < mid ? 230 : -230)), y: 0, vy: 0, t: -20 });
  p.inCutscene = true; p.vel.x = 0;
};

/** One of them down on the floor and on: an enemy now (a hero landing's a beat on one knee first). */
// (the special weapons' say over them, at half: their real health; dead of a headshot, or into the soul sucker)
setHalfHooks(ACTOR_KIND, {
  max: e => (CAST[e.variant ?? 0]?.hp ?? 100),
  kill: (ctx, e, how) => { const a = whOf(ctx.state).fight.actors.find(q => q.e === e); if (a) fall(ctx, a, how); else e.health = 0; },
});

const appear = (state: GameState, a: Arrival) => {
  const F = whOf(state).fight, c = CAST[a.i], p = state.player;
  const e = makeKindEnemy(ACTOR_KIND as EnemyKind, a.x, a.y);
  e.variant = a.i; e.health = BIG; e.maxHealth = BIG; e.seen = true;
  // (pure attrition: no beatdown or air grab heals off them, no ammo shaken out of them)
  e.noHeal = true;
  e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
  e.facing = a.x > p.pos.x + p.width / 2 ? -1 : 1;
  e.aiState = a.mode === 'drop' ? 'land' : 'approach'; e.aiTimer = 0; e.leapCd = 20;
  state.enemies.push(e);
  F.actors.push({ i: a.i, hp: c.hp, max: c.hp, e, lx: a.x, ly: a.y, flash: 0, cling: null, heldT: 0 });
};

/** Dead: down where they stood (bloodied), the body staying; onto the heap if there's one there. `headless`: the
 *  flintlock had the head off (the body stays, without it); `gone`: into the soul sucker (no body: it's in the bag). */
const fall = (ctx: FrameContext, a: Actor, how?: 'headless' | 'gone') => {
  const { state } = ctx, o = whOf(state), F = o.fight, p = state.player;
  if (a.e) { const e = a.e; e.health = 0; state.enemies = state.enemies.filter(q => q !== e); o.barks.delete(e); }
  a.e = null; a.hp = 0; a.cling = null;
  const x = Math.max(X(ARENA.a) + 20, Math.min(X(ARENA.b) - 20, a.lx)), y = Math.min(GY, floorTopAt(state.blocks, x, a.ly - 4) ?? GY);
  const under = F.bodies.filter(b => Math.abs(b.x - x) < 48 && Math.abs(b.y + b.lift - y) < 30).length;
  const lift = Math.min(4, under) * 13;
  const dir: 1 | -1 = p.pos.x + p.width / 2 < x ? -1 : 1;
  if (how !== 'gone') F.bodies.push({ i: a.i, x, y: y - lift, dir, t: 0, fall: 0, pool: 0, lift, headless: how === 'headless' });
  F.killed++;
  if (how !== 'gone') { playSound('splat', 0.9, -2); playSound('thud', 0.6, -6); }
  // (the head off: it all comes up out of the neck)
  if (how === 'headless') for (let k = 0; k < 26; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 8, y: y - 68 }, vel: { x: (Math.random() - 0.5) * 5, y: -3 - Math.random() * 7 }, life: 30 + Math.random() * 30, color: ['#B91C1C', '#7F1D1D', '#DC2626'][k % 3], size: 2 + Math.random() * 3, grav: 0.35 });
  if (how !== 'gone') for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: y - 30 - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 5 }, life: 30 + Math.random() * 20, color: ['#B91C1C', '#7F1D1D', '#DC2626'][k % 3], size: 2 + Math.random() * 3, grav: 0.35 });
  // (what's said: sparse, one at a time; the AD shrugs a couple of times, they own the scans)
  const total = F.order.length, left = total - F.killed;
  if ((F.killed === 6 || F.killed === 20) && quiet(state)) adSay(state, AD_SHRUG, undefined, false);
  else castBark(state, a.i, DEATH, 0.3, 240);
  if (F.killed === Math.floor(total / 2)) meatheadSays(state, pickLine(HALF), true);
  else if (left === 1 && F.next >= total && !F.arrivals.length) meatheadSays(state, pickLine(LAST), true);
  else if (left > 0 && Math.random() < 0.12) meatheadSays(state, pickLine(KILL_QUIPS), false);
};

/** On the way in: dropping (the shadow under them), or lowered on a wire. Down: true. */
const arrive = (ctx: FrameContext, a: Arrival) => {
  const { state } = ctx, F = whOf(state).fight, p = state.player;
  a.t++;
  if (a.t < 1) return false;
  if (a.t === 1) {
    a.y = a.mode === 'drop' ? state.camera.y - 60 : ROOF_Y + 40;
    playSound(a.mode === 'drop' ? 'whoosh' : 'click', 0.5, a.mode === 'drop' ? -6 : 8);
    if (a.i === 0) castSay(state, 0, CAP_RESEMBLE, true, () => { F.said.shout = true; });
    else castBark(state, a.i, ARRIVE, 0.4);
  }
  const ground = floorTopAt(state.blocks, a.x, a.y, 0) ?? GY;
  if (a.mode === 'drop') { a.vy = Math.min(22, a.vy + 0.8); a.y += a.vy; }
  else a.y = Math.min(ground, a.y + 5);
  if (a.y < ground) return false;
  a.y = ground;
  if (a.mode === 'drop') {
    // (the hero landing: on him, it's on him)
    playSound('slam', 0.9, -8); shakeScreen(state, 7, 4);
    for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: a.x + (Math.random() - 0.5) * 50, y: ground - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -0.5 - Math.random() * 2 }, life: 30, color: 'rgba(168, 162, 158, 0.7)', size: 4 + Math.random() * 5 });
    const pcx = p.pos.x + p.width / 2;
    if (p.health > 0 && Math.abs(pcx - a.x) < 40 && p.pos.y + p.height > ground - 90 && p.invincibilityTimer <= 0 && !p.inCutscene) hurtPlayer(ctx, 10, 'm2:hww_flop', { x: Math.sign(pcx - a.x || 1) * 8, y: -6 }, 20);
  } else playSound('clink', 0.5, 4);
  if (a.i === 0) F.said.capDown = true;
  else if (!F.said.arrived) { F.said.arrived = true; meatheadSays(state, pickLine(CAST_ARRIVE), true); }
  appear(state, a);
  return true;
};

/** Where the next one comes in: somewhere on the stage well clear of him. */
const spawnX = (state: GameState) => {
  const p = state.player, px = p.pos.x + p.width / 2;
  for (let k = 0; k < 8; k++) { const x = L0 + Math.random() * (R0 - L0); if (Math.abs(x - px) > 170) return x; }
  return px < (L0 + R0) / 2 ? R0 : L0;
};

// ---------------------------------------------------------------------------------------------------------------
// The dogpile

/** On him: off the floor and onto a hold (the side they came at him from first). */
const latch = (ctx: FrameContext, a: Actor) => {
  const { state } = ctx, o = whOf(state), F = o.fight, p = state.player, e = a.e!;
  const px = p.pos.x + p.width / 2, feet = p.pos.y + p.height, ex = e.pos.x + e.width / 2;
  const fromFront = Math.sign(ex - px || 1) === (p.facing ?? 1);
  const used = new Set(F.actors.filter(q => q.cling).map(q => q.cling!.slot));
  const pref = fromFront ? [0, 3, 4, 5, 1, 2] : [1, 2, 5, 4, 0, 3];
  let slot = pref.find(s => !used.has(s)) ?? 6;
  while (used.has(slot)) slot++;
  state.enemies = state.enemies.filter(q => q !== e); o.barks.delete(e);
  e.vel.x = 0; e.vel.y = 0;
  a.cling = { slot, t: 0, fx: ex - px, fy: e.pos.y + e.height - feet };
  playSound('thud', 0.6, 4 + (a.i % 4)); shakeScreen(state, 3, 2);
  // (jumped on: it hurts a little; it's what they're doing that's the danger)
  if (p.invincibilityTimer <= 0 && p.health > 0) hurtPlayer(ctx, 3, 'm2:hww_pile', undefined, 0);
  castBark(state, a.i, LATCH, 0.35, 300);
};
/** Off him: thrown (a charge), or knocked loose (a shot): back on the engine's list, off the side of him they were on,
 *  dazed a while; hurt by it. */
const shakeOff = (ctx: FrameContext, a: Actor, how: 'charge' | 'shot', dmg: number) => {
  const { state } = ctx, p = state.player, e = a.e!, s = slotOf(a.cling!.slot), f = (p.facing ?? 1) as 1 | -1;
  const side = (Math.sign(s.dx) || (a.i % 2 ? 1 : -1)) * f;
  const px = p.pos.x + p.width / 2;
  e.pos.x = Math.max(X(ARENA.a) + 2, Math.min(X(ARENA.b) - e.width - 2, px + side * (p.width / 2 + e.width / 2 + 2) - e.width / 2));
  e.pos.y = Math.min(GY, p.pos.y + p.height) - e.height - 2;
  e.vel = how === 'charge' ? { x: side * 8, y: -7 } : { x: side * 4.5, y: -4 };
  e.pauseTimer = how === 'charge' ? 40 : 22; e.leapCd = how === 'charge' ? 40 : 30;
  e.health = BIG; e.aiState = 'approach'; e.aiTimer = 0; e.facing = (-side) as 1 | -1;
  state.enemies.push(e);
  a.cling = null;
  a.lx = e.pos.x + e.width / 2; a.ly = e.pos.y + e.height;
  a.hp -= dmg; a.flash = 6;
  for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: a.lx, y: a.ly - 50 }, vel: { x: side * (1 + Math.random() * 3), y: -2 - Math.random() * 2 }, life: 20, color: '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 });
  if (a.hp <= 0) fall(ctx, a);
};

/** Each frame of the fight: the door, the order, the arrivals, the hits, the dogpile, the bodies. Returns the controls
 *  while CAPTAIN AMERICANO's cutscene has them. */
export const updateFight = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, o = whOf(state), F = o.fight, p = state.player;
  F.doorK += ((F.phase === 'on' || F.phase === 'intro' ? 1 : 0) - F.doorK) * 0.2;
  // (pure attrition: nothing drops while it's on, health or ammo; the park's drops back once it's over)
  setDropTable(F.phase === 'on' || F.phase === 'intro' ? NO_DROPS : PARK_DROPS);
  // (the set's own gear quiet and still meanwhile: bossQuiet.ts)
  if (F.phase === 'on' || F.phase === 'intro') markBossFight(state, 'ensemble-cast');
  // (the bodies: going over, the pool spreading under them)
  for (const b of F.bodies) { b.t++; b.fall = Math.min(1, b.fall + 1 / 16); if (b.fall >= 1) b.pool = Math.min(1, b.pool + 1 / 110); }
  if (F.phase === 'wait') {
    if (!castDone(state) && p.health > 0 && !p.inCutscene && p.pos.x + p.width / 2 > X(ARENA_TRIGGER)) start(state);
    else return null;
  }
  if (F.phase === 'done') return null;
  F.t++;
  F.arrivals = F.arrivals.filter(a => !arrive(ctx, a));

  // CAPTAIN AMERICANO's piece (a cutscene: SKIP >> for it all)
  if (F.phase === 'intro') {
    p.inCutscene = true;
    const finish = (skipped: boolean) => {
      if (skipped) { silenceAll(); o.castSaid.clear(); }
      for (const a of F.arrivals) { a.y = GY; appear(state, a); }
      F.arrivals = [];
      F.phase = 'on'; F.spawnT = 100; p.inCutscene = false;
      adSay(state, AD_CAST, undefined, true);
    };
    if (F.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finish(true); return hands(); } }
    if (F.said.capDown && F.said.shout && !F.said.capSure) {
      F.said.capSure = true;
      castSay(state, 0, CAP_SURE, true, () => meatheadSays(state, pickLine(CAP_REPLY), true, () => { F.said.introDone = true; }));
    }
    if (F.said.introDone || F.t > 1200) finish(false);
    return hands();
  }

  // The hits: what came off the engine's health is the hit; theirs is kept here (no breather). One in his grab is off
  // the engine's list a while (he's got it): it still takes his hits
  for (const a of F.actors) {
    const e = a.e;
    if (!e || a.cling) continue;
    const inE = state.enemies.includes(e);
    let dead = e.isBlownAway || e.health <= 0;
    if (!dead && !inE) dead = !e.wasGrabbed || ++a.heldT > 900;
    else a.heldT = 0;
    if (dead) { fall(ctx, a); continue; }
    const dealt = Math.max(0, BIG - e.health);
    e.health = BIG; e.maxHealth = BIG;
    if (inE) { a.lx = e.pos.x + e.width / 2; a.ly = e.pos.y + e.height; }
    else { a.lx = p.pos.x + p.width / 2 + (p.facing ?? 1) * 30; a.ly = GY; }
    if (a.flash > 0) a.flash--;
    if (dealt <= 0) continue;
    a.hp -= dealt; a.flash = 6;
    if (Math.random() < 0.5) state.particles.push({ pos: { x: a.lx, y: a.ly - 50 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 2 }, life: 20, color: '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 });
    if (a.hp <= 0) fall(ctx, a);
  }

  // The dogpile. Shaking them off: any charge move throws the lot (each move once); each shot knocks one loose
  const alive = p.health > 0;
  const attacking = p.isCharging || p.isUppercutting || !!p.isDivekicking;
  let on = F.actors.filter(a => a.cling);
  if (alive && attacking && on.length && p.moveId !== F.moveId) {
    F.moveId = p.moveId ?? -1;
    const dmg = p.isCharging ? 20 : 35;
    for (const a of on) shakeOff(ctx, a, 'charge', dmg);
    playSound('punch', 0.9, -4); playSound('whoosh', 0.8, -6); shakeScreen(state, 8, 4);
  }
  let fired = false;
  for (const pr of state.projectiles) if (pr.owner === 'player' && !F.seen.has(pr)) { F.seen.add(pr); fired = true; }
  const cd = p.shootCooldown ?? 0;
  if (cd > F.lastCd) fired = true;
  F.lastCd = cd;
  on = F.actors.filter(a => a.cling);
  if (alive && fired && on.length && state.frame - F.knockAt >= 6) {
    F.knockAt = state.frame;
    // (the ones in front of him first: that's where he's shooting; the last on, first off)
    const pick = [...on].sort((u, v) => (+slotOf(v.cling!.slot).front - +slotOf(u.cling!.slot).front) || (u.cling!.t - v.cling!.t))[0];
    shakeOff(ctx, pick, 'shot', 15);
    playSound('punch', 0.5, 6);
  }
  // Getting on him: anyone touching him (a little reach: they jump at him), not dazed off a shove, not mid-landing
  if (alive && !p.inCutscene && !attacking) for (const a of F.actors) {
    const e = a.e;
    if (!e || a.cling || e.health <= 0 || (e.leapCd ?? 0) > 0 || e.aiState === 'land') continue;
    if ((e.pauseTimer ?? 0) > 0 && Math.abs(e.vel.x) > 1) continue;
    // (in no state to: puking, panicking in the soul sucker's pull, frozen, tased)
    if (e.harmless || (e.frozenTimer ?? 0) > 0 || e.isTased) continue;
    if (!state.enemies.includes(e)) continue;
    const gx = 30;
    if (e.pos.x + e.width + gx < p.pos.x || e.pos.x - gx > p.pos.x + p.width) continue;
    if (e.pos.y > p.pos.y + p.height + 4 || e.pos.y + e.height < p.pos.y - 8) continue;
    latch(ctx, a);
  }
  // On him: carried along (their enemy kept with him, for when they come off), the pile slowing him; CRUSH and he's
  // down under them
  on = F.actors.filter(a => a.cling);
  for (const a of on) {
    a.cling!.t++;
    const e = a.e!;
    e.pos.x = p.pos.x + p.width / 2 - e.width / 2; e.pos.y = p.pos.y + p.height - e.height;
    a.lx = p.pos.x + p.width / 2; a.ly = p.pos.y + p.height;
    if (a.flash > 0) a.flash--;
  }
  const n = on.length;
  if (n > 0 && alive) {
    const k = Math.max(0, 1 - n / CRUSH);
    if (!attacking && p.pushbackTimer <= 0) { const max = PLAYER_MOVE_SPEED * buffs.speed * k; if (Math.abs(p.vel.x) > max) p.vel.x = Math.sign(p.vel.x) * max; }
    if (p.vel.y < 0 && !attacking) p.vel.y += 0.1 * n;
    // (they hurt, piled on: a little every half second, more the more of them; i-frames don't stop it, it's weight)
    if (n >= CRUSH || state.frame % 30 === 0) {
      const dmg = n >= CRUSH ? 0 : n * 2;
      if (dmg > 0 && !ctx.cheats.invincible) { p.health = Math.max(0, p.health - hurtTaken(ctx.stageId, dmg)); state.lastHurt = { source: 'm2:hww_pile', at: state.frame }; playSound('punch', 0.4, -4 + n); }
    }
    if ((n >= CRUSH || p.health <= 0) && !F.crushed && !ctx.cheats.invincible) {
      F.crushed = true; p.health = Math.max(1, p.health); p.invincibilityTimer = 0;
      playSound('crunch', 1, -6); playSound('thud', 1, -10); shakeScreen(state, 14, 6);
      ctx.fx.spawnDamageNumber({ x: p.pos.x - 20, y: p.pos.y - 70 }, 'PILED ON', true, '#FCA5A5');
      hurtPlayer(ctx, 9999, 'm2:hww_pile', undefined, 0);
    }
  }
  if (n < CRUSH) F.crushed = false;

  // The next of them: while there's room for another up, a beat apart, never more than two coming down at once
  if (F.spawnT > 0) F.spawnT--;
  const up = F.actors.filter(a => a.e).length + F.arrivals.length;
  if (alive && F.next < F.order.length && up < capOf(F.killed) && F.arrivals.length < 2 && (F.spawnT <= 0 || up === 0)) {
    F.arrivals.push({ i: F.order[F.next++], mode: Math.random() < 0.7 ? 'drop' : 'wire', x: spawnX(state), y: 0, vy: 0, t: 0 });
    F.spawnT = 40 + Math.floor(Math.random() * 35);
  }
  // All of them dead
  if (F.next >= F.order.length && F.killed >= F.order.length && !F.arrivals.length) {
    F.phase = 'done';
    state.stageMemo[CAST_MEMO] = '1';
    // (the stage door goes back up)
    if (F.door) F.door.x = -1e7;
  }
  return null;
};

/** The camera kept on the main stage while they're at him: the whole of it, held still. */
export const fightCam = (state: GameState) => (fightOn(state) ? { min: X(ARENA_CAM), max: X(ARENA_CAM) } : undefined);

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The bodies (behind the living), the drop shadows of the ones coming down, the ones on his back. */
export const drawFightBack = (c: CanvasRenderingContext2D, state: GameState) => {
  const F = whOf(state).fight, cam = state.camera.x;
  for (const b of F.bodies) if (b.x > cam - 160 && b.x < cam + 960) drawBody(c, b.i, b.x, b.y, b.dir, b.fall, b.lift > 0 ? b.pool * 0.4 : b.pool, b.headless);
  for (const a of F.arrivals) {
    if (a.mode !== 'drop' || a.t < 1) continue;
    const k = Math.max(0.15, Math.min(1, 1 - (GY - a.y) / 600));
    c.fillStyle = `rgba(0, 0, 0, ${0.18 + 0.2 * k})`; c.beginPath(); c.ellipse(a.x, GY - 2, 16 + 28 * k, 5 + 3 * k, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = `rgba(0, 0, 0, ${0.2 + 0.25 * k})`; c.beginPath(); c.ellipse(a.x, GY - 2, 9 + 18 * k, 3 + 2 * k, 0, 0, Math.PI * 2); c.fill();
  }
  for (const a of F.actors) if (a.cling && !slotOf(a.cling.slot).front) { const w = clingAt(state, a); drawClinger(c, a.i, w.x, w.y, w.rot, w.dir, state.frame); }
};
/** The ones coming down, the ones on him (in front), and what any of them is saying. */
export const drawFightFront = (c: CanvasRenderingContext2D, state: GameState, saidOver: (c: CanvasRenderingContext2D, s: string, x: number, y: number, col: string, w: number) => void) => {
  const o = whOf(state), F = o.fight, f = state.frame, p = state.player;
  for (const a of F.arrivals) {
    if (a.t < 1) continue;
    const dir: 1 | -1 = a.x > p.pos.x + p.width / 2 ? -1 : 1;
    if (a.mode === 'wire') {
      // (the stunt wire down from the grid: the cable (a glint down it), the pulley, the spreader bar and its clips)
      box(c, a.x - 1, ROOF_Y + 30, 3, a.y - 84 - ROOF_Y - 30, '#0A0A0E'); box(c, a.x, ROOF_Y + 30, 1, a.y - 84 - ROOF_Y - 30, '#6A6A76');
      box(c, a.x - 7, ROOF_Y + 22, 14, 12, '#0A0A0E'); box(c, a.x - 6, ROOF_Y + 23, 12, 10, '#36363E'); box(c, a.x - 6, ROOF_Y + 23, 3, 10, '#5A5A66');
      box(c, a.x - 12, a.y - 86, 24, 5, '#0A0A0E'); box(c, a.x - 11, a.y - 85, 22, 3, '#C8962E'); box(c, a.x - 11, a.y - 85, 22, 1, '#F2D27A');
      for (const s of [-1, 1]) { box(c, a.x + s * 9 - 1, a.y - 82, 3, 8, '#0A0A0E'); box(c, a.x + s * 9, a.y - 81, 1, 6, '#A8A8B0'); }
    }
    drawArriving(c, a.i, a.x, a.y, f, a.mode === 'drop', dir);
  }
  // (the pile on him: the low ones first, the top of it last)
  const front = F.actors.filter(a => a.cling && slotOf(a.cling.slot).front).sort((u, v) => u.cling!.slot - v.cling!.slot);
  for (const a of front) { const w = clingAt(state, a); drawClinger(c, a.i, w.x, w.y, w.rot, w.dir, f); }
  // (who's saying what: over them on the way in, up, on him, or lying there)
  for (const [i, s] of o.castSaid) {
    const act = F.actors.find(a => a.i === i), arr = F.arrivals.find(a => a.i === i), body = F.bodies.find(b => b.i === i);
    let x: number, y: number;
    if (act?.cling) { x = p.pos.x + p.width / 2; y = p.pos.y - 70; }
    else if (act?.e) { x = act.e.pos.x + act.e.width / 2; y = act.e.pos.y - 18; }
    else if (arr) { x = arr.x; y = arr.y - 100; }
    else if (body) { x = body.x; y = body.y - 40; }
    else continue;
    saidOver(c, s.text, x, y, '#FBCFE8', 220);
  }
};
/** Their bar: the lot of them (top band, clear of the HUD); SKIP >> in CAPTAIN AMERICANO's piece. */
export const drawFightHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const F = whOf(state).fight;
  if (F.phase === 'intro' && F.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  if (F.phase !== 'on' || state.player.inCutscene) return;
  const band = topBand(), w = band.x2 - band.x1, total = F.order.length;
  let hp = 0, all = 0;
  for (const i of F.order) all += CAST[i].hp;
  for (const a of F.actors) hp += Math.max(0, a.hp);
  for (let k = F.next; k < F.order.length; k++) hp += CAST[F.order[k]].hp;
  for (const a of F.arrivals) hp += CAST[a.i].hp;
  const flash = F.actors.some(a => a.flash > 0);
  box(c, band.x1, 18, w, 14, '#18181B'); box(c, band.x1 + 2, 20, (w - 4) * Math.max(0, Math.min(1, hp / Math.max(1, all))), 10, flash ? '#FECACA' : '#DC2626');
  label(c, `THE ENSEMBLE CAST: ${total - F.killed} OF ${total}`, band.mid, 44, '#FDE68A', 8);
};
