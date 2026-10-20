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
import { box, onScreen, checker, still, polyF, rampH, SNOW as SNOW_R, SLATE, TIMBER, INK, type Ctx } from '../kit';
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

/** (exported for the glen, job 3: the square's cast turn up there too, and what they throw still flies) */
export const updateThrows = (ctx: FrameContext) => {
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
    // (the eave it sits on: a slate roof's edge jutting out over the street on carved brackets (scenery: dimmed, it's
    // not stood on), painted once)
    still(c, `sq-eave-${Math.round(s.x)}`, s.x, ey, -SLAB_W / 2 - 16, -46, SLAB_W + 32, 70, g => {
      const Sl = rampH(SLATE, true), T = rampH(TIMBER, true), w = SLAB_W / 2;
      polyF(g, [[-w - 13, 1], [w + 13, 1], [w + 5, -42], [-w - 5, -42]], INK);
      polyF(g, [[-w - 11, 0], [w + 11, 0], [w + 4, -40], [-w - 4, -40]], Sl[3]);
      for (let y = -4, r = 0; y > -40; y -= 6, r++) { const k = (-y) / 40, half = w + 11 - k * 7; box(g, -half, y, half * 2, 1, Sl[1]); for (let x = -half + (r % 2) * 5; x < half; x += 10) box(g, x, y - 5, 1, 5, Sl[2]); box(g, -half, y - 1, half * 2, 1, Sl[4]); }
      box(g, -w - 11, -2, SLAB_W + 22, 3, T[3]); box(g, -w - 11, -2, SLAB_W + 22, 1, T[4]);
      for (const bx of [-w + 4, w - 8]) { polyF(g, [[bx - 1, 1], [bx + 5, 1], [bx + 5, 20], [bx + 2, 20], [bx - 1, 8]], INK); polyF(g, [[bx, 1], [bx + 4, 1], [bx + 4, 19], [bx + 2, 19], [bx, 8]], T[3]); box(g, bx, 1, 1, 7, T[4]); }
    });
    // (the cornice on the eave: built back up while it's idle; snow in steps, its lumpy front, icicles)
    const t = (state.frame + s.phase) % PERIOD;
    const built = s.state === 'idle' ? Math.min(1, t / IDLE + 0.3) : s.state === 'tell' ? 1 : 0;
    if (built > 0) {
      const h = Math.round(SLAB_H * built), S = rampH(SNOW_R), x0 = s.x - SLAB_W / 2;
      box(c, x0 - 1, ey - 1, SLAB_W + 2, h + 2, INK);
      box(c, x0, ey, SLAB_W, h, S[4]); box(c, x0, ey, SLAB_W, 2, S[5]); box(c, x0, ey + h - 4, SLAB_W, 4, S[2]); checker(c, x0, ey + h - 6, SLAB_W, 2, S[2], 0, 1);
      box(c, x0 + SLAB_W - 6, ey, 6, h, S[3]);
      for (let k = 4; k < SLAB_W - 2; k += 9) { const l = 3 + ((k * 7 + Math.round(s.x)) % 6); box(c, x0 + k, ey + h, 2, l, S[2]); box(c, x0 + k, ey + h, 1, l - 1, S[5]); }
    }
    if (s.state === 'tell') { const j = (state.frame % 4 < 2 ? 1 : -1); box(c, s.x - SLAB_W / 2 + j, ey + SLAB_H - 2, SLAB_W, 2, '#A8B4D8'); box(c, s.x - 6 + j * 2, ey + 4, 1, SLAB_H - 6, '#8A96BC'); box(c, s.x + 14 - j, ey + 8, 1, SLAB_H - 10, '#8A96BC'); }
    if (s.state === 'heap') {
      const k = 1 - s.t / 70, S = rampH(SNOW_R);
      c.fillStyle = INK; c.beginPath(); c.ellipse(s.x, GY, SLAB_W / 2 + 4, 16 * k + 1, 0, Math.PI, 0); c.fill();
      c.fillStyle = S[3]; c.beginPath(); c.ellipse(s.x, GY, SLAB_W / 2 + 3, 15 * k, 0, Math.PI, 0); c.fill();
      c.fillStyle = S[5]; c.beginPath(); c.ellipse(s.x - 8, GY - 6 * k, SLAB_W / 3, 6 * k, 0, Math.PI, 0); c.fill();
      for (let q = -SLAB_W / 2; q < SLAB_W / 2; q += 11) box(c, s.x + q, GY - 3 * k - ((q * 13) & 3), 4, 2, S[2]);
    }
  }
};

/** In front: the falling slabs, what's thrown. */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const sq = squareOf(state);
  const S = rampH(SNOW_R);
  for (const s of sq.snows) if (s.state === 'fall') {
    // (the slab coming down: a lumpy block of packed snow in steps, bits breaking off it)
    const x0 = s.x - SLAB_W / 2, y0 = s.y - SLAB_H;
    box(c, x0 - 1, y0 - 1, SLAB_W + 2, SLAB_H + 2, INK);
    for (let k = 0; k < SLAB_W; k += 8) box(c, x0 + k, y0 - 3 - ((k * 5) % 4), 8, 4, INK);
    box(c, x0, y0, SLAB_W, SLAB_H, S[4]);
    for (let k = 0; k < SLAB_W; k += 8) { box(c, x0 + k + 1, y0 - 2 - ((k * 5) % 4), 6, 4, S[5]); }
    box(c, x0, y0, 3, SLAB_H, S[5]); box(c, x0 + SLAB_W - 7, y0, 7, SLAB_H, S[3]); checker(c, x0 + SLAB_W - 11, y0, 4, SLAB_H, S[3], 0, 1);
    box(c, x0, s.y - 6, SLAB_W, 6, S[2]); checker(c, x0, s.y - 8, SLAB_W, 2, S[2], 1, 1);
    for (let k = 0; k < 3; k++) box(c, x0 + 10 + k * 22, y0 - 10 - ((state.frame + k * 5) % 9), 4, 4, S[4]);
  }
  drawThrows(c, state);
};
/** What the cast throw (exported for the glen, job 3: the square's cast turn up there too). */
export const drawThrows = (c: Ctx, state: GameState) => {
  const sq = squareOf(state), f = state.frame;
  for (const s of sq.throws) {
    if (s.kind === 'spark') {
      // (a sparkler star: an inked four-point burst, its core flicking gold and pink, a trail of embers behind)
      const tw = f % 4 < 2, col = tw ? '#FDE047' : '#F0ABFC';
      for (let k = 1; k < 4; k++) box(c, s.x - s.vx * k * 1.6 - 1, s.y - s.vy * k * 1.6 - 1, 3 - (k > 2 ? 1 : 0), 3 - (k > 2 ? 1 : 0), k % 2 ? '#FDE047' : '#F97316');
      polyF(c, [[s.x, s.y - 11], [s.x + 3, s.y - 3], [s.x + 11, s.y], [s.x + 3, s.y + 3], [s.x, s.y + 11], [s.x - 3, s.y + 3], [s.x - 11, s.y], [s.x - 3, s.y - 3]], INK);
      polyF(c, [[s.x, s.y - 9], [s.x + 2, s.y - 2], [s.x + 9, s.y], [s.x + 2, s.y + 2], [s.x, s.y + 9], [s.x - 2, s.y + 2], [s.x - 9, s.y], [s.x - 2, s.y - 2]], col);
      box(c, s.x - 2, s.y - 2, 4, 4, '#FFFFFF'); box(c, s.x - 1, s.y - 6, 1, 3, '#FFFFFF');
    }
    else if (s.kind === 'slipper') {
      // (a glass slipper end over end: pale blue glass in steps, a glint, the heel)
      c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.3);
      polyF(c, [[-9, 4], [8, 4], [9, -1], [3, -2], [-2, -6], [-8, -4]], INK);
      polyF(c, [[-8, 3], [7, 3], [8, -1], [3, -1], [-2, -5], [-7, -3]], '#A8DCF0');
      polyF(c, [[-7, 1], [6, 1], [7, -1], [3, -1], [-2, -4], [-6, -2]], '#CFF4FF');
      box(c, -6, -3, 4, 1, '#FFFFFF'); box(c, 5, 3, 3, 3, '#8ACAE8');
      c.restore();
    }
    else if (s.kind === 'ball') {
      // (the broomball: orange in steps, its seam, a highlight; spinning)
      c.fillStyle = INK; c.beginPath(); c.arc(s.x, s.y, 7.5, 0, Math.PI * 2); c.fill();
      for (const [col, r, o] of [['#C2410C', 6.5, 0], ['#F97316', 5.4, -0.8], ['#FDBA74', 3, -2.2]] as const) { c.fillStyle = col; c.beginPath(); c.arc(s.x + o, s.y + o, r, 0, Math.PI * 2); c.fill(); }
      const a = s.t * 0.4; c.strokeStyle = '#7C2D12'; c.lineWidth = 1; c.beginPath(); c.arc(s.x, s.y, 6, a, a + Math.PI * 0.9); c.stroke();
      box(c, s.x - 3, s.y - 4, 2, 1, '#FFFFFF');
    }
    else if (s.kind === 'wave') {
      // (the club's shockwave along the ground: a ring of churned snow and cobble grit, chunks flung up)
      const r = 14 + (s.t % 6), S = rampH(SNOW_R);
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.arc(s.x, s.y, r, Math.PI, 0); c.stroke();
      c.strokeStyle = S[3]; c.lineWidth = 3; c.stroke();
      c.strokeStyle = '#78716C'; c.lineWidth = 2; c.beginPath(); c.arc(s.x, s.y, r * 0.55, Math.PI, 0); c.stroke();
      for (let k = 0; k < 4; k++) { const ang = Math.PI + 0.4 + k * 0.7, d = r + 3 + ((s.t + k * 3) % 5); box(c, s.x + Math.cos(ang) * d - 1, s.y + Math.sin(ang) * d - 1, 3, 3, k % 2 ? S[5] : '#5A5068'); }
    }
  }
};
