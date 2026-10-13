// Zorblax's people, as Meathead 2 enemies (new kinds, all of them; drawn in aliens.ts). Taught one at a time across the
// impact site, then mixed in XENOSCARE:
//   SOLDIER  (m2:sp_grunt) the ray gun on his forearm, as Zorblax had: keeps his distance, raises the arm (the coil
//            glowing up: the tell) and fires a pink bolt level at him. The bolts hit anybody in the way (friendly fire).
//   BRUTE    (m2:sp_brute) a head taller and twice as wide, a spiked battle helmet (spiky: dive kicking down onto it is
//            his own foot through a spike); plods at him, raises both fists (the tell) and lunges a punch.
//   CRAWLER  (m2:sp_crawler) the top half of one: the crash took the rest. Drags itself at him and snaps at his ankles.
//            Small: a slide (or anything) finishes it.
//   RUNNER   (m2:sp_fleer) one that got out alive, in a state (an arm off, his head on fire): sees him and runs for it,
//            screaming, for the haunted house, and in. Harmless (they're the ones that escape); killable all the same.
// They bleed green (Zorblax's slime: the engine's blood off them, turned).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { registerM2Kind, registerHurtLines } from '../../kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { playSound } from '../../../m1/game/platform/audio';
import { say, pickLine } from '../../../m1/game/platform/speech';
import { isGoreColor } from '../../../m1/game/core/effects';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { hazardVictims, hazardHit } from '../../hazardHit';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { voice, saidOver } from '../section';
import { drawAlien, drawCrawler, ALIEN_MUZZLE, type AlienPose } from './aliens';
import { MOUTH_X } from './layout';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const pick = pickLine;
const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });
const dressed = (state: GameState): L.Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

export const GRUNT = 'm2:sp_grunt', BRUTE = 'm2:sp_brute', CRAWLER = 'm2:sp_crawler', FLEER = 'm2:sp_fleer';
const LASER = 'm2:sp_laser', SPIKES = 'm2:sp_brute_spikes';
export const ALIEN_KINDS = new Set<string>([GRUNT, BRUTE, CRAWLER, FLEER]);

registerHurtLines(GRUNT, L.HURT_GRUNT, L.DEATH_GRUNT);
registerHurtLines(LASER, L.HURT_LASER, L.DEATH_LASER);
registerDeathKind(LASER, 'vaporized');
registerHurtLines(BRUTE, L.HURT_BRUTE, L.DEATH_BRUTE);
registerHurtLines(SPIKES, L.HURT_SPIKES, L.DEATH_SPIKES);
registerDeathKind(SPIKES, 'spiked');
registerHurtLines(CRAWLER, L.HURT_CRAWLER, L.DEATH_CRAWLER);

/** Each one's look (set on it where it's made: its variant). */
const seedOf = (e: Enemy) => ((e.variant ?? 0) % 1000) || Math.abs(Math.round(e.homeX || 0)) % 997;
const isWoman = (e: Enemy) => e.kind !== BRUTE && seedOf(e) % 4 === 1;

// ---------------------------------------------------------------------------------------------------------------
// What they say: a bark each the first time they come for him, over their heads while it's said (one at a time)

const said = new Map<Enemy, string>();
let game: GameState | null = null;
/** Which pool they bark from: out at the impact site (the ship), or in the haunted house (the ride). */
let where: (e: Enemy) => 'crash' | 'house' = () => 'crash';
export const setBarkPlace = (f: (e: Enemy) => 'crash' | 'house') => { where = f; };
export const aliensTalking = () => { for (const [e, t] of said) if (t && e.health > 0) return true; return false; };
/** One of them says something (if nobody else is). */
export const alienSays = (e: Enemy, text: string) => {
  if (!game || aliensTalking()) return;
  say(text, voice(isWoman(e) ? 'm2.space.alienf' : 'm2.space.alien'), 'casual', {
    always: false,
    onShow: spoken => { said.set(e, text); if (!spoken) setTimeout(() => { if (said.get(e) === text) said.delete(e); }, Math.max(1600, text.length * 60)); },
    onHide: () => { if (said.get(e) === text) said.delete(e); },
  });
};
const bark = (e: Enemy) => {
  if (!game) return;
  const pool = e.kind === FLEER ? L.FLEE : where(e) === 'house' ? L.HOUSE_BARK : L.CRASH_BARK;
  alienSays(e, pick(pool[dressed(game)]));
};
/** Their words over their heads (world space, from the section's drawFront). */
export const drawAlienSaid = (c: Ctx, state: GameState) => {
  for (const e of state.enemies) { const t = said.get(e); if (t && e.health > 0) saidOver(c, t, e.pos.x + e.width / 2, e.pos.y - 18, '#D9F99D', 180); }
};

// ---------------------------------------------------------------------------------------------------------------
// The bolts (the soldiers'): level, fast, pink; hitting him, anybody else in the way, or a wall

interface Bolt { x: number; y: number; vx: number; t: number; from: Enemy }
let bolts: Bolt[] = [];
export const resetAliens = () => { bolts = []; said.clear(); };
const BOLT_SPEED = 7.5, BOLT_DMG = 12, BOLT_LIFE = 140;

const fire = (state: GameState, e: Enemy) => {
  const f = e.facing ?? 1;
  const m = { x: mid(e).x + f * (ALIEN_MUZZLE.x - 6), y: e.pos.y + e.height + ALIEN_MUZZLE.y * (e.height / 90) };
  bolts.push({ x: m.x, y: m.y, vx: f * BOLT_SPEED, t: 0, from: e });
  playSound('raygun', 0.5, 4);
};

/** Each frame (the section's update): the bolts, the green blood. */
export const tickAliens = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  game = state;
  bolts = bolts.filter(b => {
    b.x += b.vx; b.t++;
    if (b.t > BOLT_LIFE) return false;
    const spark = () => { for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: b.x, y: b.y }, vel: { x: -Math.sign(b.vx) * Math.random() * 3, y: (Math.random() - 0.5) * 3 }, life: 14, color: i % 2 ? ALIEN.laser[4] : '#FFFFFF', size: 2 + Math.random() * 2 }); };
    const top = p.pos.y + (p.isDucking || p.isSliding ? 30 : 0);
    if (p.health > 0 && state.deathTimer <= 0 && p.invincibilityTimer <= 0 && b.x > p.pos.x - 4 && b.x < p.pos.x + p.width + 4 && b.y > top && b.y < p.pos.y + p.height) {
      hurtPlayer(ctx, BOLT_DMG, LASER, { x: Math.sign(b.vx) * 3, y: -2 }, 10);
      spark(); playSound('gunhit', 0.5, 6); return false;
    }
    // (one of theirs in the way, once it's clear of the one who fired it)
    const e = b.t > 6 ? hazardVictims(state).find(o => o !== b.from && b.x > o.pos.x && b.x < o.pos.x + o.width && b.y > o.pos.y && b.y < o.pos.y + o.height) : undefined;
    if (e) { hazardHit(ctx, e, 30, b.x - b.vx * 3, 'FRIENDLY FIRE!', { color: ALIEN.laser[4], knock: 5 }); spark(); return false; }
    if (state.blocks.some(k => k.type !== 'platform' && !k.oneWay && b.x > k.x && b.x < k.x + k.w && b.y > k.y && b.y < k.y + k.h)) { spark(); return false; }
    return true;
  });
  greenBlood(state);
};
export const drawBolts = (c: Ctx, f: number) => {
  const Lz = ALIEN.laser;
  for (const b of bolts) {
    const len = 22, x = Math.round(b.x - Math.sign(b.vx) * len), w = len;
    const l = Math.min(x, x + Math.sign(b.vx) * w);
    c.fillStyle = Lz[2]; c.fillRect(l, Math.round(b.y) - 3, w, 6);
    c.fillStyle = Lz[4]; c.fillRect(l + 2, Math.round(b.y) - 2, w - 4, 4);
    c.fillStyle = f % 4 < 2 ? Lz[6] : Lz[5]; c.fillRect(l + 4, Math.round(b.y) - 1, w - 8, 2);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Green blood: whatever the engine throws off one of them, Zorblax's slime instead

const SLIME = [ALIEN.slime, ALIEN.slimeDark, ALIEN.slimeLight, '#7DB32A', ALIEN.hide[4]];
const checked = new WeakSet<object>();
const greenBlood = (state: GameState) => {
  const zones: { x: number; y: number; w: number; h: number }[] = [];
  for (const e of state.enemies) if (e.kind && ALIEN_KINDS.has(e.kind)) zones.push({ x: e.pos.x - 30, y: e.pos.y - 30, w: e.width + 60, h: e.height + 60 });
  for (const d of state.enemyDeaths) if (d.sprite?.kind && ALIEN_KINDS.has(d.sprite.kind)) zones.push({ x: d.x - 70, y: d.y - 70, w: d.w + 140, h: d.h + 140 });
  if (!zones.length) return;
  for (const q of state.particles) {
    if (checked.has(q)) continue;
    checked.add(q);
    if (q.ownBlood || q.isStuck || !(isGoreColor(q.color) || q.isBossGore)) continue;
    if (!zones.some(z => q.pos.x > z.x && q.pos.x < z.x + z.w && q.pos.y > z.y && q.pos.y < z.y + z.h)) continue;
    q.color = SLIME[Math.floor(Math.random() * SLIME.length)];
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The AIs

const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry && state.player.health > 0 && !state.player.inCutscene;
};
const faceHim = (state: GameState, e: Enemy) => { e.facing = mid(state.player).x < mid(e).x ? -1 : 1; };
const grounded = (e: Enemy) => Math.abs(e.vel.y) < 0.01;

/** The operators (headsets on: their look's seed from 1000 up) working an animatronic this frame, each to its rig's x
 *  (rigs.ts sets it): they stand at it, working it, not shooting. */
let operating = new Map<Enemy, number>();
export const setOperating = (m: Map<Enemy, number>) => { operating = m; };
export const isOperator = (e: { variant?: number }) => (e.variant ?? 0) >= 1000;

const gruntAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  { const rx = operating.get(e); if (rx !== undefined) { e.vel.x = 0; e.facing = rx < mid(e).x ? -1 : 1; e.aiState = 'operate'; e.aiTimer = 0; return false; } }
  if (e.aiState === 'operate') e.aiState = 'walk';
  const dx = mid(state.player).x - mid(e).x, adx = Math.abs(dx);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 540, 260)) { e.aiState = 'walk'; e.aiTimer = 30; bark(e); }
      break;
    case 'walk': {
      faceHim(state, e);
      const f = e.facing ?? 1;
      // (his distance: backs off if he's close, comes on if he's far; up on something, he stays up on it)
      e.vel.x = adx < 180 ? -f * 1.5 : adx > 380 ? f * 1.5 : 0;
      if (e.homeY !== undefined && e.homeY + e.height < 540 && Math.abs(e.pos.x - (e.homeX ?? e.pos.x)) > 40 && Math.sign(e.vel.x) === Math.sign(e.pos.x - (e.homeX ?? e.pos.x))) e.vel.x = 0;
      if (e.aiTimer > 70 && adx < 600 && Math.abs(mid(state.player).y - mid(e).y) < 120) { e.aiState = 'aim'; e.aiTimer = 0; e.vel.x = 0; playSound('alienCharge', 0.35, 6); }
      if (!sees(state, e, 900, 400)) { e.aiState = 'idle'; e.aiTimer = 0; }
      break;
    }
    case 'aim':
      e.vel.x = 0; faceHim(state, e);
      if (e.aiTimer === 28) fire(state, e);
      if (e.aiTimer > 44) { e.aiState = 'walk'; e.aiTimer = Math.floor(Math.random() * 30); }
      break;
  }
  return false;
};

const bruteAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const dx = mid(state.player).x - mid(e).x, adx = Math.abs(dx);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 460, 220)) { e.aiState = 'walk'; e.aiTimer = 0; bark(e); playSound('bellow', 0.5, -2); }
      break;
    case 'walk':
      faceHim(state, e);
      e.vel.x = adx > 60 ? (e.facing ?? 1) * 1.3 : 0;
      if (adx < 150 && e.aiTimer > 30 && Math.abs(mid(state.player).y - mid(e).y) < 90) { e.aiState = 'tell'; e.aiTimer = 0; e.vel.x = 0; playSound('snort', 0.7, -8); }
      break;
    case 'tell':
      e.vel.x = 0; faceHim(state, e);
      if (e.aiTimer > 32) { e.aiState = 'strike'; e.aiTimer = 0; playSound('whoosh', 0.8, -6); }
      break;
    case 'strike':
      e.vel.x = (e.facing ?? 1) * (e.aiTimer < 12 ? 6.5 : 0);
      if (e.aiTimer > 18) { e.aiState = 'recover'; e.aiTimer = 0; }
      break;
    case 'recover':
      e.vel.x *= 0.8;
      if (e.aiTimer > 48) { e.aiState = 'walk'; e.aiTimer = 0; }
      break;
  }
  return false;
};

const crawlerAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const dx = mid(state.player).x - mid(e).x, adx = Math.abs(dx);
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 380, 160)) { e.aiState = 'crawl'; e.aiTimer = 0; playSound('snort', 0.4, 10); }
      break;
    case 'crawl':
      faceHim(state, e);
      // (heaves itself along in pulls, not a steady walk)
      e.vel.x = Math.floor(e.aiTimer / 20) % 2 === 0 ? (e.facing ?? 1) * 1.4 : 0.2 * (e.facing ?? 1);
      if (adx < 80 && grounded(e) && e.aiTimer > 30) { e.aiState = 'lunge'; e.aiTimer = 0; e.vel.x = (e.facing ?? 1) * 5; e.vel.y = -3.5; playSound('snort', 0.6, 6); }
      break;
    case 'lunge':
      if (grounded(e) && e.aiTimer > 6) { e.aiState = 'crawl'; e.aiTimer = 0; e.vel.x = 0; }
      break;
  }
  return false;
};

const fleerAI = (ctx: FrameContext, e: Enemy): boolean => {
  const { state } = ctx;
  if (gone.has(e)) { e.vel.x = 0; e.vel.y = 0; return true; }
  e.aiTimer = (e.aiTimer || 0) + 1;
  switch (e.aiState) {
    default:
      e.vel.x = 0;
      if (sees(state, e, 640, 300)) { e.aiState = 'run'; e.aiTimer = 0; bark(e); playSound('screams', 0.35, 10); onFlee?.(e); }
      break;
    case 'run': {
      // (for the haunted house, whatever's in the way: over it)
      e.facing = 1;
      e.vel.x = 3.8;
      const lastX = e.aiX ?? e.pos.x;
      if (grounded(e) && Math.abs(e.pos.x - lastX) < 0.5 && e.aiTimer > 8) e.vel.y = -10;
      e.aiX = e.pos.x;
      // (in through its mouth: gone)
      if (mid(e).x > MOUTH_X) { gone.add(e); e.vel.x = 0; e.vel.y = 0; playSound('slam', 0.4, 6); return true; }
      break;
    }
  }
  return false;
};
/** The runners that made it in (taken out of the world quietly: no death, no body). */
export const gone = new Set<Enemy>();
let onFlee: ((e: Enemy) => void) | null = null;
export const setOnFlee = (f: ((e: Enemy) => void) | null) => { onFlee = f; };
/** Take the ones that got away out of the world (the section's update, each frame). */
export const sweepGone = (state: GameState) => {
  if (!gone.size) return;
  state.enemies = state.enemies.filter(e => !gone.has(e));
  gone.clear();
};

// ---------------------------------------------------------------------------------------------------------------
// The look

const poseOf = (e: Enemy): AlienPose => {
  if ((e.hitFlash ?? 0) > 0 || (e.pauseTimer ?? 0) > 2) return 'hurt';
  switch (e.aiState) {
    case 'aim': return 'aim';
    case 'tell': return 'tell';
    case 'strike': return 'strike';
    case 'run': return 'run';
    case 'operate': return 'operate';
    default: return Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand';
  }
};

registerM2Kind({
  kind: GRUNT, stats: { w: 40, h: 86, hp: 90, contact: 10, mass: 220 }, ai: gruntAI, humanoid: true, grab: 'body',
  gender: e => (isWoman(e) ? 'f' : 'm'),
  head: { x: 10, y: -96, r: 10 },
  draw: (c, e, f) => {
    drawAlien(c, { seed: seedOf(e), gun: true, woman: isWoman(e), headset: isOperator(e) }, poseOf(e), f, 0.95);
    // (the tell: the coil glowing up at the muzzle)
    if (e.aiState === 'aim' && (e.aiTimer ?? 0) < 30) {
      const k = Math.min(1, (e.aiTimer ?? 0) / 28), r = 2 + k * 5;
      c.fillStyle = ALIEN.laser[3]; c.fillRect(Math.round(ALIEN_MUZZLE.x * 0.95 - r), Math.round(ALIEN_MUZZLE.y * 0.95 - r), Math.round(r * 2), Math.round(r * 2));
      c.fillStyle = ALIEN.laser[6]; c.fillRect(Math.round(ALIEN_MUZZLE.x * 0.95 - r / 2), Math.round(ALIEN_MUZZLE.y * 0.95 - r / 2), Math.round(r), Math.round(r));
    }
  },
});

registerM2Kind({
  kind: BRUTE, stats: { w: 58, h: 118, hp: 260, contact: 16, mass: 480 }, ai: bruteAI, humanoid: true, grab: 'none',
  spiky: { source: SPIKES, label: 'SPIKED!', damage: 18 },
  gender: 'm',
  head: { x: 14, y: -132, r: 12 },
  draw: (c, e, f) => drawAlien(c, { seed: seedOf(e), spikes: true }, poseOf(e), f, 1.3),
});

registerM2Kind({
  kind: CRAWLER, stats: { w: 50, h: 30, hp: 25, contact: 7, mass: 60 }, ai: crawlerAI, humanoid: false, grab: 'critter',
  gender: e => (isWoman(e) ? 'f' : 'm'),
  head: { x: 22, y: -26, r: 8 },
  draw: (c, e, f) => drawCrawler(c, seedOf(e), f, e.aiState === 'lunge', e.health <= 0),
});

registerM2Kind({
  kind: FLEER, stats: { w: 40, h: 86, hp: 40, contact: 0, mass: 200 }, ai: fleerAI, humanoid: true, grab: 'body',
  make: b => ({ ...b, harmless: true }),
  gender: e => (isWoman(e) ? 'f' : 'm'),
  head: { x: 10, y: -96, r: 10 },
  draw: (c, e, f) => {
    if (gone.has(e)) return;
    const s = seedOf(e);
    drawAlien(c, { seed: s, woman: isWoman(e), hurt: s % 3 === 0 ? 'arm' : s % 3 === 1 ? 'fire' : null }, poseOf(e), f, 0.95);
  },
});

/** One of them, made: its look's seed on it. */
export const seedAlien = (e: Enemy, seed: number) => { e.variant = seed; return e; };
