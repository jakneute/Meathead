// The studio's working parts: what moves that he stands on (the drying rack's cel, the paint room's two cels on their
// overhead track, the camera crane's seat), the two things to fall in (THE REJECT PILE, THE PAINT VAT: in, and he's
// coughed back up where he last stood safe, hurt; the staff go under for good), and what the staff throw (the
// interns' coffee, the guides' souvenir plates).
//
// A mover's a one-way ledge kept where it is each frame before he moves (as the stacks' lids are, sway.ts); stood on
// it, he's carried with it. Each one's on a clock off the frame (the same for drawing and for standing).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hazardKill, setHazardZones } from '../../hazardHit';
import { envSound } from '../../bossQuiet';
import { teleport } from '../section';
import { onTower } from '../sway';
import { studioOf, type Mover } from './state';
import { MOVERS, PITS, REJECTS, VAT, X, Y, type MoverDef } from './layout';
import { GY } from '../geometry';

const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const overlaps = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };

// ---------------------------------------------------------------------------------------------------------------
// The movers

const AWAY = -99999;
/** Where a mover is at frame f (its top's middle, world), and how far along (0 at a, 1 at b). */
export const moverAt = (d: MoverDef, f: number) => {
  const t = (((f / d.period + d.phase) % 1) + 1) % 1;
  // (there and back: a wait at each end, a smooth run between)
  const run = 0.5 - d.dwell;
  let u: number;
  if (t < d.dwell / 2) u = 0;
  else if (t < d.dwell / 2 + run) u = (t - d.dwell / 2) / run;
  else if (t < d.dwell * 1.5 + run) u = 1;
  else if (t < d.dwell * 1.5 + run * 2) u = 1 - (t - d.dwell * 1.5 - run) / run;
  else u = 0;
  const k = 0.5 - 0.5 * Math.cos(u * Math.PI);
  return { x: X(d.xa + (d.xb - d.xa) * k), y: Y(d.ha + (d.hb - d.ha) * k), k };
};
export const makeMovers = (state: GameState): Mover[] => MOVERS.map(d => {
  const at = moverAt(d, state.frame);
  const b: Block = { x: at.x - d.w / 2, y: at.y, w: d.w, h: 12, type: 'platform', oneWay: true, hidden: true, tag: `ct-mover-${d.id}` } as Block;
  state.blocks.push(b);
  return { d, x: at.x, y: at.y, b, on: false };
});
const onMover = (state: GameState, m: Mover) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  return m.b.y !== AWAY && p.health > 0 && p.vel.y >= 0 && Math.abs(feet - m.b.y) <= 3 && cx >= m.b.x - 4 && cx <= m.b.x + m.b.w + 4;
};
/** First thing each frame (before he moves): each to where it is now, carrying him if he's on it. */
export const updateMovers = (state: GameState, list: Mover[]) => {
  const p = state.player;
  for (const m of list) {
    const on = onMover(state, m), at = moverAt(m.d, state.frame);
    m.on = on;
    if (on) { p.pos.x += at.x - m.x; p.pos.y += at.y - m.y; }
    // (the crane's whir going up and down; the cels' trolleys clacking at the ends)
    if (m.d.id === 'crane' && Math.abs(at.y - m.y) > 0.2 && state.frame % 24 === 0) envSound(state, at.x, 'engine', 0.12, 20);
    { const prev = moverAt(m.d, state.frame - 1).k; if ((at.k === 1 && prev < 1) || (at.k === 0 && prev > 0)) envSound(state, at.x, m.d.id === 'crane' ? 'clang' : 'clink', 0.2, 8); }
    m.x = at.x; m.y = at.y;
    m.b.x = at.x - m.d.w / 2; m.b.y = at.y; m.b.w = m.d.w;
  }
};
/** Him on one of them (which). */
export const ridingMover = (state: GameState, list: Mover[]) => list.find(m => m.on && onMover(state, m)) ?? null;

// ---------------------------------------------------------------------------------------------------------------
// The pile and the vat

/** Where he last stood safe (every frame: on the floor or a desk, not a stack or a mover, not at a pit's lip). */
export const noteSafe = (state: GameState) => {
  const p = state.player, s = studioOf(state);
  if (!p.isGrounded || p.health <= 0 || p.inCutscene) return;
  if (s.towers.some(t => onTower(state, t)) || s.movers.some(m => onMover(state, m))) return;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (PITS.some(([a, b]) => cx > X(a) - 40 && cx < X(b) + 40) && Math.abs(feet - GY) < 4) return;
  s.safe.x = cx; s.safe.y = feet;
};

const PAPER = ['#FFFFFF', '#F5F0E1', '#E7E2D3', '#FDF6E3'];
const PAINT = ['#DC2626', '#2563EB', '#FACC15'];
/** The vat's paint where x is (it's in three runs of color). */
export const paintAt = (x: number) => PAINT[Math.max(0, Math.min(2, Math.floor((x - X(VAT[0])) / ((VAT[1] - VAT[0]) / 3))))];
const spray = (state: GameState, x: number, inVat: boolean) => {
  for (let i = 0; i < 16; i++) state.particles.push({
    pos: { x: x + (Math.random() - 0.5) * 30, y: GY - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -3 - Math.random() * 5 },
    life: 34, color: inVat ? paintAt(x) : PAPER[i % PAPER.length], size: inVat ? 4 : 5, grav: 0.3,
  } as typeof state.particles[number]);
};

export const updatePits = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, s = studioOf(state);
  // (none of the staff idle in them: walk round, or not at all)
  setHazardZones(state, 'ct-studio-pits', PITS.map(([a, b]) => ({ x0: X(a), x1: X(b), y0: GY - 2, y1: GY + 200, ground: true })));
  if (s.spat > 0) s.spat--;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const pit = PITS.find(([a, b]) => cx > X(a) && cx < X(b));
  if (pit && feet > GY + 30 && p.health > 0) {
    const vat = pit === VAT;
    spray(state, cx, vat);
    envSound(state, cx, vat ? 'splash' : 'crunch', 0.6, vat ? 0 : 6);
    hurtPlayer(ctx, 12, vat ? 'm2:ct_paint' : 'm2:ct_rejects', { x: 0, y: -4 });
    if (p.health > 0) { teleport(state, s.safe.x, s.safe.y); p.invincibilityTimer = Math.max(p.invincibilityTimer, 60); spray(state, s.safe.x, false); s.spat = 30; }
  }
  for (const e of state.enemies) {
    if (e.health <= 0 || e.type === 'boss' || e.enemyType === 'flyer' || e.isBlownAway) continue;
    const ex = e.pos.x + e.width / 2;
    const at = PITS.find(([a, b]) => ex > X(a) && ex < X(b));
    if (!at || e.pos.y + e.height < GY + 30) continue;
    spray(state, ex, at === VAT);
    if (e.seen) hazardKill(ctx, e, ex, at === VAT ? 'PAINTED OVER!' : 'REJECTED!', { fling: { x: (Math.random() < 0.5 ? -1 : 1) * 4, y: -14 }, sound: at === VAT ? 'splash' : 'crunch' });
    // (never seen: spared, back where it was put)
    else { e.pos.x = e.homeX ?? e.pos.x; e.pos.y = e.homeY ?? Y(0) - e.height; e.vel.x = 0; e.vel.y = 0; }
  }
};
/** Is world x over the reject pile / the vat? */
export const overRejects = (x: number) => x > X(REJECTS[0]) && x < X(REJECTS[1]);

// ---------------------------------------------------------------------------------------------------------------
// What the staff throw

export const updateThrows = (ctx: FrameContext) => {
  const { state } = ctx, s = studioOf(state), p = state.player;
  for (const t of s.throws) {
    t.t++;
    if (t.kind === 'puddle') { if (t.t > 240) t.dead = true; continue; }
    if (t.kind === 'plate') {
      // (flat and spinning, straight at him, dipping a little)
      t.x += t.vx; t.vy += 0.02; t.y += t.vy;
      if (t.t % 8 === 0) envSound(state, t.x, 'whoosh', 0.12, 16);
      if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, t.x - 11, t.y - 5, 22, 10)) {
        hurtPlayer(ctx, 9, 'm2:ct_plate_shot', { x: Math.sign(t.vx || 1) * 6, y: -4 });
        smash(state, t.x, t.y); t.dead = true; continue;
      }
      const wall = state.blocks.some(b => !b.oneWay && b.type !== 'platform' && t.x > b.x && t.x < b.x + b.w && t.y > b.y && t.y < b.y + b.h);
      const top = floorTopAt(state.blocks, t.x, t.y - 4, 0);
      if (wall || (top !== null && t.y >= top) || t.t > 150) { smash(state, t.x, t.y); t.dead = true; }
      continue;
    }
    // (coffee: lobbed, the lid off, spilling as it goes)
    t.vy += 0.3; t.x += t.vx; t.y += t.vy;
    if (t.t % 3 === 0) state.particles.push({ pos: { x: t.x, y: t.y }, vel: { x: 0, y: 0.5 }, life: 12, color: '#7C4A1E', size: 2 });
    if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, t.x - 7, t.y - 7, 14, 14)) {
      hurtPlayer(ctx, 8, 'm2:ct_coffee_shot', { x: Math.sign(t.vx || 1) * 4, y: -3 });
      playSound('splash', 0.5, 10); t.dead = true; continue;
    }
    const top = t.vy > 0 ? floorTopAt(state.blocks, t.x, t.y - t.vy - 2, 0) : null;
    const wall = state.blocks.some(b => !b.oneWay && b.type !== 'platform' && t.x > b.x && t.x < b.x + b.w && t.y > b.y + 4 && t.y < b.y + b.h);
    if ((top !== null && t.y >= top) || wall || t.t > 160) {
      t.dead = true;
      envSound(state, t.x, 'splash', 0.35, 12);
      for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: t.x, y: (top ?? t.y) - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1.5 - Math.random() * 2 }, life: 18, color: '#8B5A2B', size: 2 });
      if (top !== null && !wall) s.throws.push({ kind: 'puddle', x: t.x, y: top, vx: 0, vy: 0, t: 0, from: t.from });
    }
  }
  s.throws = s.throws.filter(t => !t.dead);
};
const smash = (state: GameState, x: number, y: number) => {
  envSound(state, x, 'glass', 0.5, 6);
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 3 }, life: 26, color: i % 3 ? '#F8FAFC' : '#2563EB', size: 3, grav: 0.3 } as typeof state.particles[number]);
};
