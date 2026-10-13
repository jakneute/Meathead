// What's out here besides them: rocks and junk drifting through (they hurt him, and anybody they hit; the rocks
// break up when shot, the junk just takes it), blasts (a mine, a kamikaze, a wreck: they hurt everybody in reach),
// their pink bolts, and the pilots' yelling (the words over whoever's saying it, only while it's said).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy } from '../../../m1/types';
import { hurtPlayer, enemyProjectile } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hazardVictims, hazardHit, setHazardZones, type Zone } from '../../hazardHit';
import { saidOver, voice } from '../section';
import { say } from '../../../m1/game/platform/speech';
import { drawRock, drawJunk } from './art';
import { orbitOf, type Rock } from './state';
import { W } from './geo';

type Ctx = CanvasRenderingContext2D;
const mid = (p: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 });

// ---------------------------------------------------------------------------------------------------------------
// Blasts

/** A blast at (x, y), `r` across: him (unless `spareHim`) and whoever else is in it. */
export const blast = (ctx: FrameContext, x: number, y: number, r: number, dmg: number, source: string, opts: { spareHim?: boolean; big?: boolean } = {}) => {
  const { state } = ctx, o = orbitOf(state), p = state.player;
  o.booms.push({ x, y, r, t: 0, big: !!opts.big });
  playSound('boom', opts.big ? 1 : 0.7, opts.big ? -6 : 0);
  shakeScreen(state, opts.big ? 14 : 7);
  for (let i = 0; i < (opts.big ? 26 : 14); i++) {
    const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * (opts.big ? 7 : 4);
    state.particles.push({ pos: { x, y }, vel: { x: Math.cos(a) * s, y: Math.sin(a) * s }, life: 18 + Math.random() * 20, color: i % 3 === 0 ? '#FDE047' : i % 3 === 1 ? '#F97316' : '#FFFFFF', size: 3 + Math.random() * 5 });
  }
  const pm = mid(p);
  if (!opts.spareHim && dmg > 0 && p.health > 0 && p.invincibilityTimer <= 0 && Math.hypot(pm.x - x, pm.y - y) < r + 18) {
    const d = Math.hypot(pm.x - x, pm.y - y) || 1;
    hurtPlayer(ctx, dmg, source, { x: ((pm.x - x) / d) * 7, y: ((pm.y - y) / d) * 7 });
  }
  for (const e of hazardVictims(state)) {
    const m = mid(e);
    if (Math.hypot(m.x - x, m.y - y) < r + Math.max(e.width, e.height) / 2) hazardHit(ctx, e, Math.max(dmg, 40) * 2, x, 'KABOOM!');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Their bolts

/** A pink bolt (Zorblax's people's: his were the same) from (x, y) at (tx, ty), `speed` a frame, plus `carry` (the
 *  scroll: it's fired from something moving with the screen). Its hurt is `kind`'s `_shot`. */
export const bolt = (state: GameState, kind: string, x: number, y: number, tx: number, ty: number, speed: number, dmg: number, carry = 0) => {
  const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy) || 1;
  boltV(state, kind, x, y, (dx / d) * speed + carry, (dy / d) * speed, dmg);
};
export const boltV = (state: GameState, kind: string, x: number, y: number, vx: number, vy: number, dmg: number) => {
  state.projectiles.push(enemyProjectile(`zb-${state.frame}-${Math.random()}`, x - 7, y - 5, vx, vy, 14, 10, dmg, { sadBolt: true, shooterKind: kind, life: 420, bornAt: state.frame }));
};

// ---------------------------------------------------------------------------------------------------------------
// Rocks and junk

export const addRock = (state: GameState, x: number, y: number, r: number, vx: number, vy: number) => {
  orbitOf(state).rocks.push({ x, y, r, vx, vy, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 0.04, seed: Math.random() * 100, hp: r * 2.2, flash: 0 });
};
export const addJunk = (state: GameState, x: number, y: number, what: number, vx = 0, vy = 0, spin = 0): Rock => {
  const [w, h] = what === 0 ? [150, 60] : what === 1 ? [90, 54] : [44, 80];
  const j: Rock = { x, y, r: Math.min(w, h) / 2, vx, vy, rot: 0, spin, seed: 0, hp: Infinity, flash: 0, junk: { w, h, what } };
  orbitOf(state).rocks.push(j);
  return j;
};
/** Its box (axis-aligned: near enough at the angles they turn to). */
const rockBox = (k: Rock) => k.junk ? { x: k.x - k.junk.w / 2, y: k.y - k.junk.h / 2, w: k.junk.w, h: k.junk.h } : { x: k.x - k.r * 0.85, y: k.y - k.r * 0.85, w: k.r * 1.7, h: k.r * 1.7 };
const overlaps = (a: { x: number; y: number; w: number; h: number }, x: number, y: number, w: number, h: number) => x < a.x + a.w && x + w > a.x && y < a.y + a.h && y + h > a.y;

const ROCK_DMG = 12, JUNK_DMG = 14;

export const updateRocks = (ctx: FrameContext) => {
  const { state } = ctx, o = orbitOf(state), p = state.player, cam = state.camera.x;
  const zones: Zone[] = [];
  for (const k of o.rocks) {
    k.x += k.vx; k.y += k.vy; k.rot += k.spin;
    if (k.flash > 0) k.flash--;
    const b = rockBox(k);
    zones.push({ x0: b.x - 10, x1: b.x + b.w + 10, y0: b.y - 10, y1: b.y + b.h + 10 });
    // (his bolts: chip it, break it; junk just sparks)
    for (const q of state.projectiles) {
      if (q.owner !== 'player' || q.health <= 0 || !overlaps(b, q.pos.x, q.pos.y, q.width, q.height)) continue;
      q.health = 0;
      k.flash = 3;
      state.particles.push({ pos: { x: q.pos.x + q.width, y: q.pos.y + q.height / 2 }, vel: { x: -1 - Math.random() * 2, y: (Math.random() - 0.5) * 3 }, life: 10, color: k.junk ? '#FDE047' : '#A8A29E', size: 2 + Math.random() * 2 });
      if (!k.junk) k.hp -= q.damage;
    }
    // (him: knocked off it, hurt)
    if (p.health > 0 && p.invincibilityTimer <= 0 && overlaps(b, p.pos.x + 6, p.pos.y + 6, p.width - 12, p.height - 12)) {
      const m = mid(p), dx = m.x - k.x, dy = m.y - k.y, d = Math.hypot(dx, dy) || 1;
      hurtPlayer(ctx, k.junk ? JUNK_DMG : ROCK_DMG, k.junk ? 'm2:space_junk' : 'm2:asteroid', { x: (dx / d) * 8, y: (dy / d) * 8 });
      playSound(k.junk ? 'clang' : 'crunch', 0.8);
    }
    // (anybody else it runs into)
    for (const e of hazardVictims(state)) {
      if (!overlaps(b, e.pos.x, e.pos.y, e.width, e.height)) continue;
      hazardHit(ctx, e, k.junk ? 80 : 30 + k.r, k.x, k.junk ? 'JUNKED!' : 'ROCKED!');
      if (!k.junk) k.hp -= 30;
    }
  }
  // (broken up: the big ones into a couple of little ones)
  const kept: Rock[] = [];
  for (const k of o.rocks) {
    if (k.hp <= 0) {
      playSound('crumble', 0.7);
      for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: k.x, y: k.y }, vel: { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6 }, life: 20 + Math.random() * 15, color: i % 2 ? '#78716C' : '#A8A29E', size: 2 + Math.random() * 4 });
      if (k.r >= 26) for (const s of [-1, 1]) kept.push({ ...k, r: k.r * 0.55, hp: k.r * 0.55 * 2.2, vx: k.vx + 0.6, vy: k.vy + s * 1.4, seed: k.seed + s * 13, flash: 0 });
      continue;
    }
    // (gone off the screen behind, or way off up or down)
    if (k.x < cam - 300 || k.x > cam + W + 1600 || Math.abs(k.y - (state.camera.y + 300)) > 900) continue;
    kept.push(k);
  }
  o.rocks = kept;
  setHazardZones(state, 'orbit-rocks', zones);
};

export const drawRocks = (c: Ctx, state: GameState) => {
  const o = orbitOf(state), cam = state.camera.x;
  for (const k of o.rocks) {
    if (k.x < cam - 200 || k.x > cam + W + 200) continue;
    if (k.junk) drawJunk(c, k.x, k.y, k.junk.w, k.junk.h, k.rot, k.junk.what);
    else drawRock(c, k.x, k.y, k.r, k.rot, k.seed, k.flash > 0);
  }
};

export const updateBooms = (state: GameState) => {
  const o = orbitOf(state);
  for (const b of o.booms) b.t++;
  o.booms = o.booms.filter(b => b.t < (b.big ? 40 : 26));
};
export const drawBooms = (c: Ctx, state: GameState) => {
  for (const b of orbitOf(state).booms) {
    const n = b.t / (b.big ? 40 : 26), r = b.r * (0.4 + n * 0.8);
    c.globalAlpha = Math.max(0, 1 - n);
    c.fillStyle = '#F97316'; c.beginPath(); c.arc(b.x, b.y, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FDE047'; c.beginPath(); c.arc(b.x, b.y, r * 0.65, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(b.x, b.y, r * 0.3 * (1 - n), 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Yelling

/** One of them says something (in a pilot's voice: a woman's or a man's), the words over it while it's said. `after`:
 *  waits its turn (a must); otherwise it's dropped if anybody's talking (nothing shown either). */
export const bark = (state: GameState, e: Enemy, text: string, female: boolean, after = false) => {
  const o = orbitOf(state);
  const b = { e, said: { text } };
  const off = () => { const i = o.barks.indexOf(b); if (i >= 0) o.barks.splice(i, 1); };
  const shown = say(text, voice(female ? 'm2.space.zpilotf' : 'm2.space.zpilot'), after ? 'queue' : 'casual', {
    always: after,
    // (not recorded yet: up a while anyway, then down)
    onShow: spoken => { o.barks.push(b); if (!spoken) setTimeout(off, Math.max(1800, text.length * 70)); },
    onHide: off,
    onDropped: off,
  });
  if (shown) o.lastBark = state.frame;
  return shown;
};
export const drawBarks = (c: Ctx, state: GameState) => {
  for (const b of orbitOf(state).barks) saidOver(c, b.said.text, b.e.pos.x + b.e.width / 2, b.e.pos.y - 14, '#BEF264');
};
