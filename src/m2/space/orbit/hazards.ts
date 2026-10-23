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
import { drawRock, drawJunk, drawScrap } from './art';
import { orbitOf, type Rock } from './state';
import { W } from './geo';
import { HUD_CLEAR_Y } from '../../../m1/constants';

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
  // (and the rocks and the breakable junk in it: a fuel tank caught in it goes off next, and so on down the line)
  for (const k of o.rocks) if (k.hp !== Infinity && Math.hypot(k.x - x, k.y - y) < r + k.r) { k.hp -= BLAST_ROCK; k.flash = 3; }
};
/** What a blast takes out of a rock or a breakable piece of junk in it. */
const BLAST_ROCK = 90;

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

/** Their bolts, made plain against the dark and the pink of his own: a fat orange-gold orb, inked, with a pulsing
 *  ring round it and a short streak behind (drawn over the engine's own pink). */
export const drawAlienBolts = (c: CanvasRenderingContext2D, state: GameState) => {
  const f = state.frame;
  for (const p of state.projectiles) {
    if (p.owner !== 'enemy' || !p.sadBolt) continue;
    const x = Math.round(p.pos.x + p.width / 2), y = Math.round(p.pos.y + p.height / 2);
    const r = 8 + ((f >> 2) % 2), sp = Math.hypot(p.vel.x, p.vel.y) || 1, ux = -p.vel.x / sp, uy = -p.vel.y / sp;
    // (the streak behind)
    for (let i = 1; i <= 3; i++) { c.fillStyle = i === 1 ? '#F97316' : i === 2 ? '#C2410C' : '#7C2D12'; c.beginPath(); c.arc(x + ux * i * 7, y + uy * i * 7, r - i * 2, 0, Math.PI * 2); c.fill(); }
    // (the ring: it pulses)
    c.strokeStyle = (f >> 3) % 2 ? '#FDE047' : '#FFFFFF'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r + 5, 0, Math.PI * 2); c.stroke();
    // (the orb, inked)
    c.fillStyle = '#1A0B06'; c.beginPath(); c.arc(x, y, r + 1.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F59E0B'; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FEF08A'; c.beginPath(); c.arc(x - 2, y - 2, r * 0.5, 0, Math.PI * 2); c.fill();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Rocks and junk

export const addRock = (state: GameState, x: number, y: number, r: number, vx: number, vy: number) => {
  orbitOf(state).rocks.push({ x, y, r, vx, vy, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 0.04, seed: Math.random() * 100, hp: r * 2.2, flash: 0 });
};
/** Junk's size by what it is: 0 a satellite, 1 a fuel tank, 2 a porta-potty, 3 a piece of Space Needle 2's deck (off in
 *  the blowout), 4 a Star Sled car (off the ride), 5 the gift shop's big sign. */
const JUNK_SIZE: [number, number][] = [[150, 60], [90, 54], [44, 80], [170, 44], [96, 40], [190, 78]];
/** A piece of junk drifting through. `hp`: what it takes to break it up (Infinity: it doesn't). */
export const addJunk = (state: GameState, x: number, y: number, what: number, vx = 0, vy = 0, spin = 0, hp = Infinity): Rock => {
  const [w, h] = JUNK_SIZE[what] ?? JUNK_SIZE[0];
  const j: Rock = { x, y, r: Math.min(w, h) / 2, vx, vy, rot: 0, spin, seed: 0, hp, max: hp, flash: 0, junk: { w, h, what } };
  orbitOf(state).rocks.push(j);
  return j;
};
/** Its box (axis-aligned: near enough at the angles they turn to). */
const rockBox = (k: Rock) => k.junk ? { x: k.x - k.junk.w / 2, y: k.y - k.junk.h / 2, w: k.junk.w, h: k.junk.h } : { x: k.x - k.r * 0.85, y: k.y - k.r * 0.85, w: k.r * 1.7, h: k.r * 1.7 };
const overlaps = (a: { x: number; y: number; w: number; h: number }, x: number, y: number, w: number, h: number) => x < a.x + a.w && x + w > a.x && y < a.y + a.h && y + h > a.y;

const ROCK_DMG = 12, JUNK_DMG = 14, SCRAP_DMG = 8;
/** Scrap off something broken can't hurt him till it's this old (frames): breaking a thing up in his face is no hit. */
const SCRAP_GRACE = 30;
/** A fuel tank going off: its reach, its hurt. */
const TANK_R = 135, TANK_DMG = 16;
/** Bits of scrap off something: how many, by what it was. */
const SCRAP_N = [7, 0, 5, 7, 5, 9];
/** Their colors, by what they came off. */
const SCRAP_COL = [['#C2C4CC', '#16285E', '#B8892A'], ['#F97316'], ['#3B6FE0', '#1E40A0'], ['#2DD4BF', '#C2C4CC', '#F97316'], ['#DC2626', '#F5F5F4'], ['#0F172A', '#FDE047', '#DCEBFF']];

/** Bits of scrap thrown off a piece of junk: flying out, then drifting; they hurt whoever they hit (him only once
 *  they're clear of it). */
const throwScrap = (k: Rock, n: number, out: Rock[], fast = 3.2) => {
  const cols = SCRAP_COL[k.junk?.what ?? 0] ?? SCRAP_COL[0];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.6, s = 1.4 + Math.random() * fast;
    const r = 8 + Math.random() * 6;
    out.push({ x: k.x + Math.cos(a) * 14, y: k.y + Math.sin(a) * 10, r, vx: k.vx + Math.cos(a) * s, vy: Math.sin(a) * s, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 0.3, seed: i, hp: 14, flash: 0, scrap: cols[i % cols.length], age: 0 });
  }
};

export const updateRocks = (ctx: FrameContext) => {
  const { state } = ctx, o = orbitOf(state), p = state.player, cam = state.camera.x;
  const zones: Zone[] = [];
  for (const k of o.rocks) {
    k.x += k.vx; k.y += k.vy; k.rot += k.spin;
    if (k.flash > 0) k.flash--;
    const b = rockBox(k);
    if (k.age !== undefined) k.age++;
    zones.push({ x0: b.x - 10, x1: b.x + b.w + 10, y0: b.y - 10, y1: b.y + b.h + 10 });
    // (his bolts: chip it, break it; junk just sparks)
    for (const q of state.projectiles) {
      if (q.owner !== 'player' || q.health <= 0 || !overlaps(b, q.pos.x, q.pos.y, q.width, q.height)) continue;
      q.health = 0;
      k.flash = 3;
      state.particles.push({ pos: { x: q.pos.x + q.width, y: q.pos.y + q.height / 2 }, vel: { x: -1 - Math.random() * 2, y: (Math.random() - 0.5) * 3 }, life: 10, color: k.junk ? '#FDE047' : '#A8A29E', size: 2 + Math.random() * 2 });
      if (k.hp !== Infinity) k.hp -= q.damage;
    }
    // (him: knocked off it, hurt)
    if (p.health > 0 && p.invincibilityTimer <= 0 && (k.age ?? SCRAP_GRACE) >= SCRAP_GRACE && overlaps(b, p.pos.x + 6, p.pos.y + 6, p.width - 12, p.height - 12)) {
      const m = mid(p), dx = m.x - k.x, dy = m.y - k.y, d = Math.hypot(dx, dy) || 1;
      const metal = !!(k.junk || k.scrap);
      hurtPlayer(ctx, k.scrap ? SCRAP_DMG : k.junk ? JUNK_DMG : ROCK_DMG, metal ? 'm2:space_junk' : 'm2:asteroid', { x: (dx / d) * 8, y: (dy / d) * 8 });
      playSound(metal ? 'clang' : 'crunch', 0.8);
      if (k.scrap) k.hp = 0;
    }
    // (anybody else it runs into)
    for (const e of hazardVictims(state)) {
      if (!overlaps(b, e.pos.x, e.pos.y, e.width, e.height) || k.riders?.includes(e)) continue;
      hazardHit(ctx, e, k.junk ? 80 : k.scrap ? 60 : 30 + k.r, k.x, k.junk || k.scrap ? 'JUNKED!' : 'ROCKED!');
      if (!k.junk) k.hp -= 30;
    }
  }
  // (broken up: the big ones into a couple of little ones; junk into scrap, a fuel tank with a bang)
  const kept: Rock[] = [];
  for (const k of o.rocks) {
    // (the sign crumbling as it's shot: bits off it at two thirds and a third)
    if (k.junk?.what === 5 && k.max && k.hp > 0) {
      const stage = k.hp < k.max / 3 ? 2 : k.hp < (k.max * 2) / 3 ? 1 : 0;
      if (stage > k.seed) { k.seed = stage; throwScrap(k, 3, kept, 2); playSound('crumble', 0.8, -3); shakeScreen(state, 4); }
    }
    if (k.hp <= 0 && k.junk) {
      breakJunk(ctx, k, kept);
      continue;
    }
    if (k.hp <= 0 && k.scrap) {
      for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: k.x, y: k.y }, vel: { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5 }, life: 12 + Math.random() * 8, color: i % 2 ? k.scrap : '#FDE047', size: 2 + Math.random() * 2 });
      continue;
    }
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

/** A piece of junk shot (or blown) apart: its gun pods with it, scrap everywhere, and a fuel tank goes off. */
const breakJunk = (ctx: FrameContext, k: Rock, out: Rock[]) => {
  const { state } = ctx, what = k.junk!.what;
  for (const e of k.riders ?? []) if (e.health > 0) hazardHit(ctx, e, 9999, k.x, 'SCRAPPED!');
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: k.x + (Math.random() - 0.5) * k.junk!.w, y: k.y + (Math.random() - 0.5) * k.junk!.h }, vel: { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6 }, life: 16 + Math.random() * 14, color: i % 3 ? '#FDE047' : '#FFFFFF', size: 2 + Math.random() * 3 });
  // (the porta-potty: what was in it)
  if (what === 2) for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: k.x, y: k.y }, vel: { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5 }, life: 30 + Math.random() * 20, color: i % 2 ? '#5B3A1A' : '#3F2A12', size: 3 + Math.random() * 4 });
  if (what === 1) blast(ctx, k.x, k.y, TANK_R, TANK_DMG, 'm2:fuel_tank', { big: true });
  else { playSound('clang', 1, -6); playSound('crumble', 0.8); shakeScreen(state, what === 5 ? 12 : 6); }
  throwScrap(k, SCRAP_N[what] ?? 5, out, what === 5 ? 4 : 3.2);
};

export const drawRocks = (c: Ctx, state: GameState) => {
  const o = orbitOf(state), cam = state.camera.x;
  for (const k of o.rocks) {
    if (k.x < cam - 200 || k.x > cam + W + 200) continue;
    if (k.scrap) drawScrap(c, k.x, k.y, k.r, k.rot, k.scrap);
    else if (k.junk) drawJunk(c, k.x, k.y, k.junk.w, k.junk.h, k.rot, k.junk.what, k.max && k.max !== Infinity ? k.hp / k.max : 1, k.flash > 0);
    else drawRock(c, k.x, k.y, k.r, k.rot, k.seed, k.flash > 0);
  }
};

export const updateBooms = (state: GameState) => {
  const o = orbitOf(state);
  for (const b of o.booms) b.t++;
  o.booms = o.booms.filter(b => b.t < (b.big ? 40 : 26));
};
export const drawBooms = (c: Ctx, state: GameState) => {
  // (SNES-style: flat rings of fire stepping out from a white core, the outer ones going to smoke; puffs of it round
  // the edge; as it dies the whole thing thins out in steps)
  const disc = (x: number, y: number, r: number, col: string) => { if (r <= 0.5) return; c.fillStyle = col; c.beginPath(); c.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2); c.fill(); };
  for (const b of orbitOf(state).booms) {
    const n = b.t / (b.big ? 40 : 26), r = b.r * (0.4 + n * 0.8);
    const fire = 1 - n;
    c.save();
    // (dying, it thins out in steps, not a smooth fade)
    c.globalAlpha = n < 0.55 ? 1 : n < 0.8 ? 0.62 : 0.3;
    c.beginPath(); c.arc(b.x, b.y, r + 12, 0, Math.PI * 2); c.clip();
    // (the smoke round the edge: puffs, darker as it goes)
    for (let i = 0; i < 8; i++) {
      const a = i * 0.785 + b.r * 0.1, d = r * (0.72 + 0.12 * Math.sin(i * 2.3));
      disc(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d, r * (0.32 + n * 0.12), n < 0.5 ? '#57534E' : '#3F3B38');
    }
    disc(b.x, b.y, r * 0.92, n < 0.45 ? '#B91C1C' : '#44403C');
    disc(b.x, b.y, r * 0.8 * fire + r * 0.1, '#EA580C');
    disc(b.x, b.y, r * 0.62 * fire, '#F97316');
    disc(b.x, b.y, r * 0.46 * fire, '#FDE047');
    disc(b.x, b.y, r * 0.28 * fire * fire, '#FEF9C3');
    disc(b.x, b.y, r * 0.14 * fire * fire, '#FFFFFF');
    c.restore();
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

// ---------------------------------------------------------------------------------------------------------------
// Warnings: fighters coming up from behind him (chevrons flashing at the screen's left edge, at their height; kept
// under the HUD's corner)

export const drawWarns = (c: Ctx, state: GameState) => {
  const o = orbitOf(state);
  if (!o.warns.length) return;
  const x = state.camera.x + 10;
  for (const w of o.warns) {
    if ((w.t >> 2) % 2) continue;
    const y = Math.round(state.camera.y + Math.max(HUD_CLEAR_Y + 16, Math.min(580, w.sy)));
    for (const dx of [0, 14]) {
      c.fillStyle = '#08090F'; c.beginPath(); c.moveTo(x + dx - 2, y - 13); c.lineTo(x + dx + 13, y); c.lineTo(x + dx - 2, y + 13); c.closePath(); c.fill();
      c.fillStyle = dx ? '#FDE047' : '#F97316'; c.beginPath(); c.moveTo(x + dx, y - 9); c.lineTo(x + dx + 9, y); c.lineTo(x + dx, y + 9); c.closePath(); c.fill();
    }
  }
};
