// THE ENSEMBLE CAST, the sub-boss: the main stage. Open till he's in; then the stage door comes down behind him (the far
// wall's ahead: both sides locked) till every one of the thirty is dead. They come in waves of five: hero landings out
// of the rafters (a shadow on the floor first: don't be under one), down on wires, walking on from the wings, and two
// whose wires aren't hooked up (they come down, and that's that). Each wave's first says their bit (clean, shat or
// naked, as he is). Their real health is kept here (cast.ts: the engine's never runs out); dead, they fall over where
// they stand, bloodied, and the bodies stay, piling up where they fell on each other. Never respawned once past
// (CAST_MEMO, kept across his deaths); dying mid-fight, it's all of them again from the refill (checkpoint 25).
//
// No breather between hits (the sub-bosses' rule): every hit counts. Every weapon hits them its mid-boss way.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { CANVAS_WIDTH, topBand } from '../../../m1/constants';
import { solid, meatheadSays, box, label } from '../section';
import { X, GY, ROOF_Y, ARENA, ARENA_TRIGGER, CAST_MEMO } from './layout';
import { whOf, type Arrival, type Actor } from './state';
import { CAST, ACTOR_KIND, BIG, TOTAL_HP, drawArriving, drawBody } from './cast';
import { CASE, CAST_ARRIVE, KILL_QUIPS, UNHOOKED_QUIP, HALF, LAST, ENTRANCES, DEATH, UNHOOKED, AD_CAST, AD_WAVE } from './lines';
import { adSay, castSay } from './talk';

/** The waves: [who, how they come in, where (off him: a signed distance; walk: which wing)]. */
const WAVES: [number, Arrival['mode'], number][][] = [
  [[0, 'drop', -220], [1, 'drop', 250], [2, 'drop', -380], [3, 'drop', 400], [4, 'wire', 130]],
  [[5, 'wire', -270], [6, 'wire', 300], [7, 'walk', -1], [8, 'walk', 1], [9, 'unhooked', 170]],
  [[10, 'drop', -300], [11, 'drop', 270], [12, 'walk', 1], [13, 'wire', -150], [14, 'drop', 360]],
  [[15, 'drop', -210], [16, 'unhooked', -130], [17, 'drop', 310], [18, 'wire', 230], [19, 'walk', -1]],
  [[20, 'drop', -260], [21, 'drop', 240], [22, 'wire', -370], [23, 'walk', 1], [24, 'wire', 370]],
  [[25, 'drop', -290], [26, 'drop', 300], [27, 'wire', -190], [28, 'walk', 1], [29, 'walk', -1]],
];
const L0 = X(ARENA.a) + 70, R0 = X(ARENA.b) - 70;
const clampX = (x: number) => Math.max(L0, Math.min(R0, x));
const DOOR_H = 700;

const memo = (state: GameState, k: string) => !!state.stageMemo[k];
export const castDone = (state: GameState) => memo(state, CAST_MEMO);
export const fightOn = (state: GameState) => whOf(state).fight.phase === 'on';

// ---------------------------------------------------------------------------------------------------------------

const start = (state: GameState) => {
  const F = whOf(state).fight;
  F.phase = 'on'; F.t = 0; F.wave = -1; F.waveT = 0;
  // (the stage door down behind him: no backing out)
  F.door = solid(state, X(ARENA.a) - 34, GY - DOOR_H, 34, DOOR_H, { hidden: true, tag: 'hww-lock' });
  const p = state.player;
  if (p.pos.x < X(ARENA.a) + 4) p.pos.x = X(ARENA.a) + 4;
  playSound('slam', 1, -10); playSound('rumble', 0.6, -6); shakeScreen(state, 8, 3);
  // (the script first; then the AD calls them; then they come)
  meatheadSays(state, pickLine(CASE), true, () => adSay(state, AD_CAST, () => { F.said.called = true; }));
};

const queueWave = (state: GameState, w: number) => {
  const F = whOf(state).fight, p = state.player, px = p.pos.x + p.width / 2, cam = state.camera.x;
  F.wave = w; F.waveT = 0;
  WAVES[w].forEach(([i, mode, d], k) => {
    // (walking on from the wings: from off the screen, whichever side there's stage off it (no popping in))
    const offL = cam - 40 >= L0, offR = cam + CANVAS_WIDTH + 40 <= R0;
    const side = d < 0 ? (offL || !offR ? -1 : 1) : (offR || !offL ? 1 : -1);
    const x = mode === 'walk' ? clampX(side < 0 ? cam - 40 : cam + CANVAS_WIDTH + 40) : clampX(px + d);
    F.queue.push({ i, mode, x, y: 0, vy: 0, t: -k * 26, speaks: k === 0 || (mode === 'unhooked') });
  });
  if (w > 0) adSay(state, AD_WAVE, undefined, false);
  // (lean: a little something comes down with the third and fifth waves)
  if (w === 2 || w === 4) state.pickups.push({ id: `hww-cast-${w}`, pos: { x: clampX(px + (w === 2 ? 180 : -180)) - 10, y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: w === 2 ? 'small_health' : 'small_ammo', life: 1e9 });
};

/** One of them down on the floor and on: an enemy now (a hero landing's a beat on one knee first). */
const appear = (state: GameState, a: Arrival) => {
  const F = whOf(state).fight, c = CAST[a.i];
  const top = a.y;
  const e = makeKindEnemy(ACTOR_KIND as EnemyKind, a.x, top);
  e.variant = a.i; e.health = BIG; e.maxHealth = BIG; e.seen = true;
  e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
  const p = state.player;
  e.facing = a.x > p.pos.x + p.width / 2 ? -1 : 1;
  e.aiState = a.mode === 'drop' ? 'land' : 'approach'; e.aiTimer = 0; e.leapCd = 40 + (a.i * 13) % 50;
  state.enemies.push(e);
  F.actors.push({ i: a.i, hp: c.hp, max: c.hp, e, lx: a.x, ly: top, flash: 0 });
};

/** Dead: down where they stood (bloodied), the body staying; onto the heap if there's one there. */
const fall = (ctx: FrameContext, a: Actor, how: 'hit' | 'splat') => {
  const { state } = ctx, o = whOf(state), F = o.fight, p = state.player;
  if (a.e) { const e = a.e; state.enemies = state.enemies.filter(q => q !== e); o.barks.delete(e); }
  a.e = null; a.hp = 0;
  const x = a.lx, y = Math.min(GY, floorTopAt(state.blocks, x, a.ly - 4) ?? GY);
  const under = F.bodies.filter(b => Math.abs(b.x - x) < 48 && Math.abs(b.y + b.lift - y) < 30).length;
  const lift = Math.min(4, under) * 13;
  const dir: 1 | -1 = p.pos.x + p.width / 2 < x ? -1 : 1;
  F.bodies.push({ i: a.i, x, y: y - lift, dir, t: 0, fall: how === 'splat' ? 0.99 : 0, pool: 0, lift });
  F.killed++;
  playSound('splat', 0.9, -2); playSound('thud', 0.6, -6);
  for (let k = 0; k < (how === 'splat' ? 30 : 18); k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: y - 30 - Math.random() * 30 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 5 }, life: 30 + Math.random() * 20, color: ['#B91C1C', '#7F1D1D', '#DC2626'][k % 3], size: 2 + Math.random() * 3, grav: 0.35 });
  if (how === 'splat') { shakeScreen(state, 8, 4); return; }
  // (their last words, now and then; his, now and then)
  const left = CAST.length - F.killed;
  if (Math.random() < 0.6) castSay(state, a.i, DEATH, false);
  if (F.killed === 15) meatheadSays(state, pickLine(HALF), true);
  else if (left === 1 && !F.queue.length && !F.arrivals.length) meatheadSays(state, pickLine(LAST), true);
  else if (left > 0 && Math.random() < 0.2) meatheadSays(state, pickLine(KILL_QUIPS), false);
};

/** On the way in: dropping (the shadow under them), down a wire, falling off one, walking on. */
const arrive = (ctx: FrameContext, a: Arrival) => {
  const { state } = ctx, F = whOf(state).fight, p = state.player, top = state.camera.y - 60;
  a.t++;
  if (a.t === 1) {
    a.y = a.mode === 'walk' ? GY : a.mode === 'drop' ? top : ROOF_Y + 40;
    if (a.mode === 'walk') { appear(state, a); if (a.speaks) castSay(state, a.i, ENTRANCES[a.i], true); return true; }
    if (a.speaks && a.mode !== 'unhooked') castSay(state, a.i, ENTRANCES[a.i], true);
    if (a.mode === 'unhooked') castSay(state, a.i, ENTRANCES[a.i], true, () => castSay(state, a.i, UNHOOKED, false));
    playSound(a.mode === 'drop' ? 'whoosh' : 'click', 0.5, a.mode === 'drop' ? -6 : 8);
  }
  if (a.t < 1) return false;
  // (the first thing under them: a riser, the plinth, the floor)
  const ground = floorTopAt(state.blocks, a.x, a.y, 0) ?? GY;
  if (a.mode === 'drop') { a.vy = Math.min(22, a.vy + 0.8); a.y += a.vy; }
  else if (a.mode === 'wire') { a.y = Math.min(ground, a.y + 5); }
  else if (a.mode === 'unhooked') {
    // (lowered like a god a moment; then the wire's gone and so are they)
    if (a.t < 40) a.y += 2.5; else { if (a.t === 40) playSound('clink', 0.8, 10); a.vy = Math.min(24, a.vy + 0.9); a.y += a.vy; }
  }
  if (a.y < ground) return false;
  a.y = ground;
  if (a.mode === 'unhooked') {
    // SPLAT: that's them
    const dead: Actor = { i: a.i, hp: 0, max: CAST[a.i].hp, e: null, lx: a.x, ly: ground, flash: 0 };
    F.actors.push(dead);
    fall(ctx, dead, 'splat');
    playSound('crunch', 1, -6);
    ctx.fx.spawnDamageNumber({ x: a.x - 20, y: ground - 90 }, 'NOT HOOKED UP', true, '#FCA5A5');
    if (!F.said[`unhooked${a.i}`]) { F.said[`unhooked${a.i}`] = true; meatheadSays(state, pickLine(UNHOOKED_QUIP), true); }
    return true;
  }
  if (a.mode === 'drop') {
    // (the hero landing: on him, it's on him)
    playSound('slam', 0.9, -8); shakeScreen(state, 7, 4);
    for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: a.x + (Math.random() - 0.5) * 50, y: ground - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -0.5 - Math.random() * 2 }, life: 30, color: 'rgba(168, 162, 158, 0.7)', size: 4 + Math.random() * 5 });
    const pcx = p.pos.x + p.width / 2;
    if (p.health > 0 && Math.abs(pcx - a.x) < 40 && p.pos.y + p.height > ground - 90 && p.invincibilityTimer <= 0 && !p.inCutscene) hurtPlayer(ctx, 10, 'm2:hww_flop', { x: Math.sign(pcx - a.x || 1) * 8, y: -6 }, 20);
    if (!F.said.arrived) { F.said.arrived = true; meatheadSays(state, pickLine(CAST_ARRIVE), true); }
  } else playSound('clink', 0.5, 4);
  appear(state, a);
  return true;
};

/** Each frame of the fight: the door, the waves, the arrivals, the hits, the bodies. */
export const updateFight = (ctx: FrameContext) => {
  const { state } = ctx, o = whOf(state), F = o.fight, p = state.player;
  F.doorK += ((F.phase === 'on' ? 1 : 0) - F.doorK) * 0.2;
  // (the bodies: going over, the pool spreading under them)
  for (const b of F.bodies) { b.t++; b.fall = Math.min(1, b.fall + 1 / 16); if (b.fall >= 1) b.pool = Math.min(1, b.pool + 1 / 110); }
  if (F.phase === 'wait') {
    if (!castDone(state) && p.health > 0 && !p.inCutscene && p.pos.x + p.width / 2 > X(ARENA_TRIGGER)) start(state);
    return;
  }
  if (F.phase !== 'on') return;
  F.t++;
  // The hits: what came off the engine's health is the hit; theirs is kept here (no breather)
  for (const a of F.actors) {
    const e = a.e;
    if (!e) continue;
    const gone = !state.enemies.includes(e) || !!e.isBlownAway;
    const dealt = gone ? a.hp : Math.max(0, BIG - e.health);
    e.health = BIG; e.maxHealth = BIG;
    if (!gone) { a.lx = e.pos.x + e.width / 2; a.ly = e.pos.y + e.height; }
    if (a.flash > 0) a.flash--;
    if (dealt <= 0) continue;
    a.hp -= dealt; a.flash = 6;
    if (Math.random() < 0.5) state.particles.push({ pos: { x: a.lx, y: a.ly - 50 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 2 }, life: 20, color: '#B91C1C', size: 2 + Math.random() * 2, grav: 0.3 });
    if (a.hp <= 0) fall(ctx, a, 'hit');
  }
  // The waves: the first once he's been called on; the next once the last's down to one (the last, all of them)
  const alive = F.actors.filter(a => a.e).length + F.arrivals.length + F.queue.length;
  if (F.wave < 0) { if (F.said.called || F.t > 420) queueWave(state, 0); }
  else if (F.wave < WAVES.length - 1 && alive <= 1) { if (++F.waveT > 50) queueWave(state, F.wave + 1); }
  // (the queue: each in its turn)
  for (const a of F.queue) a.t++;
  while (F.queue.length && F.queue[0].t >= 0) { const a = F.queue.shift()!; a.t = 0; F.arrivals.push(a); }
  F.arrivals = F.arrivals.filter(a => !arrive(ctx, a));
  // All of them dead
  if (F.killed >= CAST.length && !F.arrivals.length && !F.queue.length) {
    F.phase = 'done';
    state.stageMemo[CAST_MEMO] = '1';
    // (the stage door goes back up)
    if (F.door) F.door.x = -1e7;
  }
};

/** The camera kept to the main stage while they're at him. */
export const fightCam = (state: GameState) => (fightOn(state) ? { min: X(ARENA.a) - 30, max: X(ARENA.b) + 60 - CANVAS_WIDTH } : undefined);

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The bodies (behind the living), the drop shadows of the ones coming down. */
export const drawFightBack = (c: CanvasRenderingContext2D, state: GameState) => {
  const F = whOf(state).fight, cam = state.camera.x;
  for (const b of F.bodies) if (b.x > cam - 160 && b.x < cam + 960) drawBody(c, b.i, b.x, b.y, b.dir, b.fall, b.lift > 0 ? b.pool * 0.4 : b.pool);
  for (const a of F.arrivals) {
    if (a.mode !== 'drop' && a.mode !== 'unhooked') continue;
    const k = Math.max(0.15, Math.min(1, 1 - (GY - a.y) / 600));
    c.fillStyle = `rgba(0, 0, 0, ${0.25 + 0.35 * k})`; c.beginPath(); c.ellipse(a.x, GY - 2, 14 + 26 * k, 4 + 3 * k, 0, 0, Math.PI * 2); c.fill();
  }
};
/** The ones coming down (in front), and what any of them is saying. */
export const drawFightFront = (c: CanvasRenderingContext2D, state: GameState, saidOver: (c: CanvasRenderingContext2D, s: string, x: number, y: number, col: string, w: number) => void) => {
  const o = whOf(state), F = o.fight, f = state.frame, p = state.player;
  for (const a of F.arrivals) {
    if (a.t < 1) continue;
    const dir: 1 | -1 = a.x > p.pos.x + p.width / 2 ? -1 : 1;
    if (a.mode === 'wire' || (a.mode === 'unhooked' && a.t < 40)) { c.strokeStyle = '#18181B'; c.lineWidth = 2; c.beginPath(); c.moveTo(a.x, ROOF_Y + 30); c.lineTo(a.x, a.y - 80); c.stroke(); box(c, a.x - 5, a.y - 84, 10, 6, '#F59E0B'); }
    if (a.mode === 'unhooked' && a.t >= 40) { c.strokeStyle = '#18181B'; c.lineWidth = 2; c.beginPath(); c.moveTo(a.x, ROOF_Y + 30); c.lineTo(a.x + 6, ROOF_Y + 120); c.stroke(); }
    drawArriving(c, a.i, a.x, a.y, f, a.mode === 'drop' || (a.mode === 'unhooked' && a.t >= 40), dir);
  }
  // (who's saying what: over them on the way in, up, or lying there)
  for (const [i, s] of o.castSaid) {
    const act = F.actors.find(a => a.i === i), arr = F.arrivals.find(a => a.i === i), body = F.bodies.find(b => b.i === i);
    let x: number, y: number;
    if (act?.e) { x = act.e.pos.x + act.e.width / 2; y = act.e.pos.y - 18; }
    else if (arr) { x = arr.x; y = arr.y - 100; }
    else if (body) { x = body.x; y = body.y - 40; }
    else continue;
    saidOver(c, s.text, x, y, '#FBCFE8', 220);
  }
};
/** Their bar: the lot of them (top band, clear of the HUD). */
export const drawFightHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const F = whOf(state).fight;
  if (F.phase !== 'on' || state.player.inCutscene) return;
  const band = topBand(), w = band.x2 - band.x1;
  const done = new Set(F.actors.map(a => a.i));
  let hp = 0;
  for (const a of F.actors) hp += Math.max(0, a.hp);
  CAST.forEach((m, i) => { if (!done.has(i)) hp += m.hp; });
  const flash = F.actors.some(a => a.flash > 0);
  box(c, band.x1, 18, w, 14, '#18181B'); box(c, band.x1 + 2, 20, (w - 4) * Math.max(0, hp / TOTAL_HP), 10, flash ? '#FECACA' : '#DC2626');
  label(c, `THE ENSEMBLE CAST: ${CAST.length - F.killed} OF ${CAST.length}`, band.mid, 44, '#FDE68A', 8);
};
