// The town square's hazards, and what the cast throw.
//
//   SNOW off the crooked roofs: a cornice of it builds on the eave; then the TELL (a trickle off the eave and a creak
//     for a second), then the slab drops: everybody under it (him: hurt, knocked down; the cast: hurt or done in);
//     it leaves a heap that melts off, and the eave builds again. On the clock, each eave out of step. While it's
//     telling or falling it's a danger zone (the cast won't walk into it; knocked in, that's another matter).
//   THE BUTTER BREW KEG on its cart (a fixture, kinds.ts): hit it and it bursts: a geyser of hot foam over everybody
//     near (the cast flung, him scalded if he's close), foam everywhere.
//   What the cast throw: the clerks' sparkler bolts (arcing down, fizzing out), the princesses' glass slippers (they
//     smash), the bros' broomballs (fast, bouncing twice), the troll's shockwaves (along the ground each way: jump
//     them), the dragon's flame (a cone in front of its mouth while it breathes).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import { hazardVictims, hazardHit, boxHits, setHazardZones } from '../../hazardHit';
import { envSound } from '../../bossQuiet';
import { meatheadSays, byPants } from '../section';
import { box, mix, onScreen, INK, type Ctx } from '../kit';
import { timeOfDay } from '../../timeOfDay';
import { squareOf, type Snow, type Throw } from './state';
import { SNOW, CART, X, Y } from './layout';
import { KEG_BURST } from './lines';
import { GY } from '../geometry';

const PERIOD = 300, IDLE = 170, TELL = 64;
const SLAB_W = 76, SLAB_H = 24, KEG_Y = 34;

export const buildHazards = (state: GameState) => {
  const sq = squareOf(state);
  sq.snows = SNOW.map(([x, eave, phase]): Snow => ({ x: X(x), eave, phase, state: 'idle', t: 0, y: Y(eave), vy: 0 }));
  const k = makeKindEnemy('m2:fa_keg' as EnemyKind, X(CART), Y(KEG_Y));
  k.variant = 0; k.facing = 1;
  state.enemies.push(k);
  sq.keg = { e: k, burst: -1 };
};

const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const hits = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export const updateHazards = (ctx: FrameContext) => {
  const { state } = ctx, sq = squareOf(state), p = state.player;
  // The roofs' snow
  const zones = [];
  for (const s of sq.snows) {
    const t = (state.frame + s.phase) % PERIOD;
    if (s.state === 'idle' && t >= IDLE && t < IDLE + TELL) { s.state = 'tell'; s.t = 0; envSound(state, s.x, 'rumble', 0.3, 12); }
    s.t++;
    if (s.state === 'tell') {
      if (s.t % 3 === 0) state.particles.push({ pos: { x: s.x + (Math.random() - 0.5) * SLAB_W, y: Y(s.eave) + 4 }, vel: { x: 0, y: 1 + Math.random() }, life: 26, color: '#F4F8FF', size: 2 });
      if (s.t >= TELL) { s.state = 'fall'; s.t = 0; s.y = Y(s.eave); s.vy = 0; envSound(state, s.x, 'whoosh', 0.5, -8); }
    } else if (s.state === 'fall') {
      s.vy += 0.8; s.y += s.vy;
      const top = s.y - SLAB_H;
      if (alive(state) && p.invincibilityTimer <= 0 && hits(state, s.x - SLAB_W / 2, top, SLAB_W, SLAB_H)) hurtPlayer(ctx, 14, 'm2:fa_snow', { x: (mid(p).x < s.x ? -1 : 1) * 3, y: 2 });
      for (const e of hazardVictims(state)) if (boxHits(e, s.x - SLAB_W / 2, top, SLAB_W, SLAB_H)) hazardHit(ctx, e, 70, s.x, 'SNOWED IN!', { knock: 4 });
      if (s.y >= GY) { s.y = GY; s.state = 'heap'; s.t = 0; envSound(state, s.x, 'thud', 0.8, -10); for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: s.x + (Math.random() - 0.5) * SLAB_W, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 24, color: i % 2 ? '#FFFFFF' : '#DCE4F2', size: 3 }); }
    } else if (s.state === 'heap' && s.t > 70) s.state = 'idle';
    if (s.state === 'tell' || s.state === 'fall') zones.push({ x0: s.x - SLAB_W / 2 - 6, x1: s.x + SLAB_W / 2 + 6, y0: Y(s.eave), y1: GY });
  }
  setHazardZones(state, 'fa-square-snow', zones);
  // The keg
  const k = sq.keg;
  if (k.e && k.burst < 0 && (k.e.health <= 0 || !state.enemies.includes(k.e))) {
    k.burst = 0;
    const kx = X(CART), ky = Y(KEG_Y) - 16;
    playSound('boom', 0.7, 6); playSound('splash', 1, -4);
    for (const e of hazardVictims(state)) if (Math.abs(mid(e).x - kx) < 140 && Math.abs(e.pos.y + e.height - GY) < 160) hazardHit(ctx, e, 75, kx, 'FOAMED!', { knock: 12 });
    if (alive(state) && Math.abs(mid(p).x - kx) < 100 && Math.abs(p.pos.y + p.height - GY) < 140) hurtPlayer(ctx, 10, 'm2:fa_keg', { x: (mid(p).x < kx ? -1 : 1) * 8, y: -6 });
    if (Math.abs(mid(p).x - kx) < 420 && !sq.said.keg && p.health > 0) { sq.said.keg = true; meatheadSays(state, pickLine(byPants(state, KEG_BURST)), false); }
    for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: kx, y: ky }, vel: { x: (Math.random() - 0.5) * 9, y: -3 - Math.random() * 9 }, life: 40 + Math.random() * 20, color: ['#F6D365', '#FFF6C8', '#E0AE3A', '#FFFFFF'][i % 4], size: 3 + Math.random() * 3, grav: 0.3 } as typeof state.particles[number]);
  }
  if (k.burst >= 0 && k.burst < 70) { k.burst++; if (k.burst % 2 === 0) state.particles.push({ pos: { x: X(CART) + (Math.random() - 0.5) * 10, y: Y(KEG_Y) - 14 }, vel: { x: (Math.random() - 0.5) * 3, y: -6 - Math.random() * 4 }, life: 30, color: Math.random() < 0.5 ? '#FFF6C8' : '#F6D365', size: 3 }); }
  updateThrows(ctx);
};

const R: Record<Throw['kind'], number> = { spark: 8, slipper: 7, ball: 7, wave: 14, flame: 0 };
const DMG: Record<Throw['kind'], number> = { spark: 9, slipper: 8, ball: 9, wave: 12, flame: 7 };
const SRC: Record<Throw['kind'], string> = { spark: 'm2:fa_clerk_shot', slipper: 'm2:fa_princess_shot', ball: 'm2:fa_bro_shot', wave: 'm2:fa_troll_shot', flame: 'm2:fa_dragon_shot' };
const G: Record<Throw['kind'], number> = { spark: 0.22, slipper: 0.32, ball: 0.3, wave: 0, flame: 0 };

const updateThrows = (ctx: FrameContext) => {
  const { state } = ctx, sq = squareOf(state), p = state.player;
  for (const s of sq.throws) {
    s.t++;
    if (s.kind === 'flame') {
      // (the dragon's flame: in front of its mouth while it breathes)
      const e = s.from;
      if (e.health <= 0 || e.aiState !== 'breathe' || !state.enemies.includes(e)) { s.dead = true; continue; }
      const f = e.facing ?? 1, mx = mid(e).x + f * 40, my = e.pos.y + 22;
      s.x = mx; s.y = my;
      for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: mx, y: my }, vel: { x: f * (5 + Math.random() * 4), y: (Math.random() - 0.5) * 2.4 }, life: 16 + Math.random() * 6, color: ['#FDE047', '#F97316', '#DC2626', '#FFF7D6'][(s.t + i) % 4], size: 4 + Math.random() * 4 });
      if (s.t % 10 === 1 && alive(state) && p.invincibilityTimer <= 0 && hits(state, f > 0 ? mx : mx - 124, my - 26, 124, 56)) hurtPlayer(ctx, DMG.flame, SRC.flame, { x: f * 4, y: -3 });
      if (s.t > 50) s.dead = true;
      continue;
    }
    if (s.kind === 'wave') {
      s.x += s.vx;
      const top = floorTopAt(state.blocks, s.x, s.y - 12, 30);
      if (top === null || Math.abs(top - s.y) > 22 || s.t > 70) { s.dead = true; continue; }
      s.y = top;
      if (s.t % 3 === 0) state.particles.push({ pos: { x: s.x, y: s.y - 4 }, vel: { x: s.vx * 0.2, y: -1.5 - Math.random() * 2 }, life: 16, color: Math.random() < 0.5 ? '#A8A29E' : '#D6D3D1', size: 3 });
      if (alive(state) && p.invincibilityTimer <= 0 && hits(state, s.x - R.wave, s.y - 22, R.wave * 2, 22)) hurtPlayer(ctx, DMG.wave, SRC.wave, { x: Math.sign(s.vx) * 4, y: -7 });
      continue;
    }
    s.vy += G[s.kind]; s.x += s.vx; s.y += s.vy;
    if (s.kind === 'spark' && s.t % 2 === 0) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5), y: (Math.random() - 0.5) }, life: 12, color: Math.random() < 0.5 ? '#FDE047' : '#F0ABFC', size: 2 });
    const r = R[s.kind];
    if (alive(state) && p.invincibilityTimer <= 0 && hits(state, s.x - r, s.y - r, r * 2, r * 2)) {
      hurtPlayer(ctx, DMG[s.kind], SRC[s.kind], { x: Math.sign(s.vx || 1) * 5, y: -4 });
      playSound(s.kind === 'slipper' ? 'glass' : s.kind === 'spark' ? 'ignite' : 'punch', 0.7, 0);
      s.dead = true; continue;
    }
    const top = s.vy > 0 ? floorTopAt(state.blocks, s.x, s.y - s.vy - 2, 0) : null;
    const wall = state.blocks.some(b => !b.oneWay && b.type !== 'platform' && b.type !== 'pit' && s.x > b.x && s.x < b.x + b.w && s.y > b.y + 4 && s.y < b.y + b.h);
    if ((top !== null && s.y >= top) || wall || s.t > 160) {
      if (s.kind === 'ball' && !wall && top !== null && s.bounces < 2) { s.y = top; s.vy = -Math.abs(s.vy) * 0.6; s.vx *= 0.8; s.bounces++; envSound(state, s.x, 'boing', 0.3, 8); continue; }
      s.dead = true;
      if (s.kind === 'slipper') { envSound(state, s.x, 'glass', 0.6, 4); for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: s.x, y: s.y - 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2 }, life: 18, color: '#CFF4FF', size: 2 }); }
      if (s.kind === 'spark') for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: s.x, y: s.y - 2 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 2 }, life: 14, color: i % 2 ? '#FDE047' : '#F0ABFC', size: 2 });
    }
  }
  sq.throws = sq.throws.filter(s => !s.dead);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space)

/** Behind him: the snow's cornices on their eaves, the heaps; the cart is the art's, the keg the kind's. */
export const drawHazardsBack = (c: Ctx, state: GameState) => {
  const sq = squareOf(state);
  for (const s of sq.snows) {
    if (!onScreen(state, s.x - 60, s.x + 60)) continue;
    const ey = Y(s.eave);
    // (the eave it sits on: a roof's edge jutting out over the street on brackets (scenery: dimmed, it's not stood on))
    const roofCol = mix('#4A4458', timeOfDay().haze, 0.3);
    c.fillStyle = INK; c.beginPath(); c.moveTo(s.x - SLAB_W / 2 - 12, ey + 1); c.lineTo(s.x + SLAB_W / 2 + 12, ey + 1); c.lineTo(s.x + SLAB_W / 2 + 4, ey - 40); c.lineTo(s.x - SLAB_W / 2 - 4, ey - 40); c.closePath(); c.fill();
    c.fillStyle = roofCol; c.beginPath(); c.moveTo(s.x - SLAB_W / 2 - 10, ey); c.lineTo(s.x + SLAB_W / 2 + 10, ey); c.lineTo(s.x + SLAB_W / 2 + 3, ey - 38); c.lineTo(s.x - SLAB_W / 2 - 3, ey - 38); c.closePath(); c.fill();
    for (const bx of [s.x - SLAB_W / 2 + 4, s.x + SLAB_W / 2 - 8]) { box(c, bx, ey, 4, 18, INK); box(c, bx + 1, ey, 2, 17, mix('#5A3A1E', timeOfDay().haze, 0.3)); }
    // (the cornice on the eave: built back up while it's idle)
    const t = (state.frame + s.phase) % PERIOD;
    const built = s.state === 'idle' ? Math.min(1, t / IDLE + 0.3) : s.state === 'tell' ? 1 : 0;
    if (built > 0) { const h = SLAB_H * built; box(c, s.x - SLAB_W / 2 - 1, ey - 1, SLAB_W + 2, h + 2, INK); box(c, s.x - SLAB_W / 2, ey, SLAB_W, h, '#F4F8FF'); box(c, s.x - SLAB_W / 2, ey + h - 3, SLAB_W, 3, '#C4CCE4'); for (let k = -SLAB_W / 2 + 6; k < SLAB_W / 2; k += 12) box(c, s.x + k, ey + h, 3, 4 + (k % 3), '#DCEBFA'); }
    if (s.state === 'tell') { const j = (state.frame % 4 < 2 ? 1 : -1); box(c, s.x - SLAB_W / 2 + j, ey + SLAB_H - 2, SLAB_W, 2, '#A8B4D8'); }
    if (s.state === 'heap') { const k = 1 - s.t / 70; c.fillStyle = INK; c.beginPath(); c.ellipse(s.x, GY, SLAB_W / 2 + 4, 16 * k + 1, 0, Math.PI, 0); c.fill(); c.fillStyle = '#F4F8FF'; c.beginPath(); c.ellipse(s.x, GY, SLAB_W / 2 + 3, 15 * k, 0, Math.PI, 0); c.fill(); }
  }
};

/** In front: the falling slabs, what's thrown. */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const sq = squareOf(state), f = state.frame;
  for (const s of sq.snows) if (s.state === 'fall') { box(c, s.x - SLAB_W / 2 - 1, s.y - SLAB_H - 1, SLAB_W + 2, SLAB_H + 2, INK); box(c, s.x - SLAB_W / 2, s.y - SLAB_H, SLAB_W, SLAB_H, '#F4F8FF'); box(c, s.x - SLAB_W / 2, s.y - 5, SLAB_W, 5, '#C4CCE4'); }
  for (const s of sq.throws) {
    if (s.kind === 'spark') { c.fillStyle = INK; c.beginPath(); c.arc(s.x, s.y, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = f % 4 < 2 ? '#FDE047' : '#F0ABFC'; c.beginPath(); c.arc(s.x, s.y, 4.5, 0, Math.PI * 2); c.fill(); box(c, s.x - 1, s.y - 8, 2, 16, '#FFFFFF'); box(c, s.x - 8, s.y - 1, 16, 2, '#FFFFFF'); }
    else if (s.kind === 'slipper') { c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.3); box(c, -8, -3, 16, 7, INK); box(c, -7, -2, 14, 5, '#CFF4FF'); box(c, -6, -2, 4, 2, '#FFFFFF'); c.restore(); }
    else if (s.kind === 'ball') { c.fillStyle = INK; c.beginPath(); c.arc(s.x, s.y, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F97316'; c.beginPath(); c.arc(s.x, s.y, 5.5, 0, Math.PI * 2); c.fill(); box(c, s.x - 3, s.y - 3, 2, 2, '#FED7AA'); }
    else if (s.kind === 'wave') { c.strokeStyle = '#E7E5E4'; c.lineWidth = 3; c.beginPath(); c.arc(s.x, s.y, 14 + (s.t % 6), Math.PI, 0); c.stroke(); c.strokeStyle = '#78716C'; c.lineWidth = 2; c.beginPath(); c.arc(s.x, s.y, 8 + (s.t % 6), Math.PI, 0); c.stroke(); }
  }
};
