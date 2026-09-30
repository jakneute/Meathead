// The block, on foot, before the corner. The water mains under it have burst:
// the hydrants are sheared off at the curb, and every so often one gurgles and
// then blows the town's water sky high (so does the broken main down in the
// last flooded hole). It hurts: him, and anybody else it comes up under (it
// throws them, and they come down hard: lure them into it). The flooded holes
// themselves are the same stuff as the sewer's channels (see sewer.ts).

import type { FrameContext } from '../../core/context';
import { playSound } from '../../platform/audio';
import { hurtPlayer } from '../../bosses/shared';
import { pushEnemy } from '../../combat/knockback';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { shakeScreen } from '../../core/state';
import { COURSE, Main } from './course';

/** A main's cycle, at the end of each period: the gurgle before it goes, then the blast. */
export const MAIN_WARN = 55, MAIN_BLAST = 60;
/** How high the water goes, how wide the column is. */
export const MAIN_HEIGHT = 250, MAIN_W = 38;
/** What it does to him, and to anybody else. */
const MAIN_DAMAGE = 12, MAIN_ENEMY_DAMAGE = 25;

export interface Block {
  /** Who's been hit by which blast (a main's blast number): once a blast each. */
  hit: Map<string, number>;
}

export const createBlock = (): Block => ({ hit: new Map() });

/** Where a main is in its cycle: quiet, gurgling (0..1 to going off), or blowing (how high the water is right now). */
export const mainNow = (m: Main, frame: number): { state: 'quiet' } | { state: 'warn'; k: number } | { state: 'blast'; t: number; height: number } => {
  const t = (frame + m.phase) % m.period;
  const blastAt = m.period - MAIN_BLAST, warnAt = blastAt - MAIN_WARN;
  if (t < warnAt) return { state: 'quiet' };
  if (t < blastAt) return { state: 'warn', k: (t - warnAt) / MAIN_WARN };
  const bt = t - blastAt;
  // (up in a rush, holds, drops away at the end)
  const up = Math.min(1, bt / 7), down = Math.min(1, (MAIN_BLAST - bt) / 12);
  return { state: 'blast', t: bt, height: MAIN_HEIGHT * Math.min(up, down) * (0.94 + Math.sin(frame * 0.7 + m.x) * 0.06) };
};

/** The column of water a blowing main puts up (world). */
export const mainBox = (m: Main, height: number) => ({ x: m.x - MAIN_W / 2, y: m.base - height, w: MAIN_W, h: height });

export const updateBlock = (ctx: FrameContext, b: Block) => {
  const { state, fx } = ctx;
  const p = state.player;
  const pb = boundsOf(p);
  for (const m of COURSE.mains) {
    // (only the ones near enough to matter)
    if (Math.abs(m.x - (state.camera.x + 400)) > 900) continue;
    const now = mainNow(m, state.frame);
    const onScreen = Math.abs(m.x - (state.camera.x + 400)) < 480;
    if (now.state === 'warn') {
      if (onScreen && Math.floor(now.k * MAIN_WARN) === 0) playSound('glug', 0.6, -4);
      // (spurts and bubbles, more and more of them)
      if (state.frame % Math.max(2, Math.round(8 - now.k * 6)) === 0) {
        state.particles.push({ pos: { x: m.x + (Math.random() - 0.5) * 16, y: m.base - 4 }, vel: { x: (Math.random() - 0.5) * 2, y: -2 - Math.random() * 3 * (0.5 + now.k) }, life: 16, color: Math.random() < 0.5 ? '#92400E' : '#B45309', size: 2 + Math.random() * 3 });
      }
      continue;
    }
    if (now.state !== 'blast' || now.height < 8) continue;
    if (now.t === 0 && onScreen) { playSound('splash', 0.9, -6); playSound('rumble', 0.4, 4); shakeScreen(state, 6, 3); }
    // Spray off the top of it, and splashing down round the bottom
    if (state.frame % 2 === 0) {
      state.particles.push({ pos: { x: m.x + (Math.random() - 0.5) * MAIN_W, y: m.base - now.height }, vel: { x: (Math.random() - 0.5) * 7, y: -2 - Math.random() * 3 }, life: 26, color: Math.random() < 0.5 ? '#B45309' : '#D6A35C', size: 3 + Math.random() * 4 });
      state.particles.push({ pos: { x: m.x + (Math.random() - 0.5) * MAIN_W, y: m.base - 6 }, vel: { x: (Math.random() - 0.5) * 8, y: -Math.random() * 3 }, life: 16, color: '#78350F', size: 2 + Math.random() * 3 });
    }
    const box = mainBox(m, now.height);
    const blastNo = Math.floor((state.frame + m.phase) / m.period);
    const key = (id: string) => `${m.x}:${id}`;
    // Him: thrown up and off it
    if (rectsOverlap(pb, box) && p.invincibilityTimer <= 0 && state.deathTimer <= 0 && b.hit.get(key('player')) !== blastNo) {
      b.hit.set(key('player'), blastNo);
      const away = p.pos.x + p.width / 2 < m.x ? -1 : 1;
      hurtPlayer(ctx, MAIN_DAMAGE, 'hydrant', { x: away * 5, y: -13 });
      fx.spawnDamageNumber({ x: p.pos.x - 10, y: p.pos.y - 40 }, 'WATER MAIN!', true, '#D97706');
    }
    // Anybody else: thrown sky high (they come down hard)
    for (const e of state.enemies) {
      if (e.health <= 0 || e.isBlownAway || e.type === 'boss' || e.kind === 'sludgeling' || !rectsOverlap(boundsOf(e), box)) continue;
      if (b.hit.get(key(e.id)) === blastNo) continue;
      b.hit.set(key(e.id), blastNo);
      const away = e.pos.x + e.width / 2 < m.x ? -1 : 1;
      e.health -= MAIN_ENEMY_DAMAGE;
      e.hitFlash = 6;
      fx.spawnDamageNumber(e.pos, MAIN_ENEMY_DAMAGE);
      if (e.health <= 0) { fx.blowAwayEnemy(e, { x: away * 4, y: -20 }, 'charge_kill', away); state.player.killSatisfactionTimer = 60; }
      else { e.frozenTimer = 0; pushEnemy(e, away * 3, -15, 50); }
    }
  }
  // (forget the old blasts now and then)
  if (state.frame % 600 === 0) b.hit.clear();
};
