// Special kill animations for regular enemies, by what killed them:
//   charred   (flamethrower): blackens in the flames, blinks, crumbles to ash
//   fried     (taser): X-ray skeleton flashing, then a smoking heap
//   melted    (sludge barfer): slumps into a bubbling green puddle
//   greased   (oil rocket): flung off slick and black, splats into an oil slick
//   pancaked  (boulder): flattened on the floor
// The enemy itself is removed; one of these plays in its place.

import { Enemy, Vector2 } from '../types';
import { COLORS, GRAVITY } from '../constants';
import type { GameState } from './state';

export type EnemyDeathKind = 'charred' | 'fried' | 'melted' | 'greased' | 'pancaked';

export interface EnemyDeath {
  kind: EnemyDeathKind;
  x: number; y: number; w: number; h: number;
  color: string;
  t: number;
  vx: number; vy: number;
  rot: number;
  /** The floor it's lying on (greased bodies land; pancakes lie flat on it). */
  floorY: number;
  landed: boolean;
  isShield: boolean;
}

export const DEATH_FRAMES: Record<EnemyDeathKind, number> = {
  charred: 95, fried: 85, melted: 110, greased: 160, pancaked: 130,
};

const FLOOR_Y = 550;

/** The colour the enemy was drawn in (matches drawEnemies). */
export const enemyBodyColor = (e: { id: string, enemyType?: string, width: number }) => {
  if (e.enemyType === 'shield') return '#444444';
  if (e.id.startsWith('rusher')) return '#9B59B6';
  if (e.enemyType === 'flyer' && e.width > 60) return '#34495E';
  if (e.enemyType === 'flyer') return COLORS.ENEMY_FLYER;
  if (e.enemyType === 'drone') return COLORS.ENEMY_DRONE;
  return COLORS.ENEMY_TANK;
};

export const startEnemyDeath = (state: GameState, e: Enemy, kind: EnemyDeathKind, vel?: Vector2) => {
  state.enemyDeaths.push({
    kind,
    x: e.pos.x, y: e.pos.y, w: e.width, h: e.height,
    color: enemyBodyColor(e),
    t: 0,
    vx: vel?.x ?? 0, vy: vel?.y ?? 0,
    rot: 0,
    floorY: FLOOR_Y,
    landed: false,
    isShield: e.enemyType === 'shield',
  });
};

/** Advances every death animation, with the smoke, sparks and bubbles that go with them. */
export const updateEnemyDeaths = (state: GameState) => {
  state.enemyDeaths = state.enemyDeaths.filter(d => {
    d.t++;
    const cx = d.x + d.w / 2;
    switch (d.kind) {
      case 'charred':
        if (d.t < 20 && d.t % 2 === 0) state.particles.push({ pos: { x: d.x + Math.random() * d.w, y: d.y + Math.random() * d.h }, vel: { x: (Math.random() - 0.5) * 2, y: -2 - Math.random() * 3 }, life: 18, color: Math.random() > 0.5 ? '#F97316' : '#FDE047', size: 4 + Math.random() * 5 });
        if (d.t >= 15 && d.t % 4 === 0) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * d.w * 0.6, y: d.y + d.h * (d.t > 55 ? 0.8 : 0.1) }, vel: { x: (Math.random() - 0.5) * 0.8, y: -1 - Math.random() }, life: 35, color: '#57534E', size: 5 + Math.random() * 6 });
        break;
      case 'fried':
        if (d.t < 40 && d.t % 3 === 0) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * d.w, y: d.y + Math.random() * d.h }, vel: { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 }, life: 8, color: Math.random() > 0.5 ? '#FFFFFF' : '#00E5FF', size: 2 + Math.random() * 3 });
        if (d.t >= 40 && d.t % 5 === 0) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * d.w * 0.5, y: d.floorY - 12 }, vel: { x: (Math.random() - 0.5) * 0.6, y: -1 - Math.random() }, life: 30, color: '#44403C', size: 4 + Math.random() * 5 });
        break;
      case 'melted':
        if (d.t % 5 === 0 && d.t < 90) {
          const hLeft = d.h * Math.max(0.08, 1 - d.t / 60);
          state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * d.w, y: d.y + d.h - hLeft }, vel: { x: (Math.random() - 0.5) * 1.5, y: -1.5 - Math.random() * 2 }, life: 16, color: Math.random() > 0.5 ? '#ADFF2F' : '#4ADE80', size: 3 + Math.random() * 4 });
        }
        break;
      case 'greased':
        if (!d.landed) {
          d.vy += GRAVITY * 0.8;
          d.x += d.vx; d.y += d.vy;
          d.vx *= 0.985;
          d.rot += d.vx * 0.03;
          if (d.t % 2 === 0) state.particles.push({ pos: { x: cx, y: d.y + d.h / 2 }, vel: { x: -d.vx * 0.1, y: 1 }, life: 22, color: '#0A0A0A', size: 4 + Math.random() * 4 });
          if (d.y + d.h >= d.floorY && d.vy > 0) {
            d.landed = true;
            d.y = d.floorY - d.h;
            for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: cx, y: d.floorY - 4 }, vel: { x: (Math.random() - 0.5) * 12, y: -Math.random() * 6 }, life: 25, color: i % 3 ? '#111111' : '#3E2723', size: 3 + Math.random() * 5 });
          }
          if (d.y > 1000) return false;
        }
        break;
      case 'pancaked':
        break;
    }
    return d.t < DEATH_FRAMES[d.kind];
  });
};
