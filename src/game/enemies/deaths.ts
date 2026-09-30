// Special kill animations for regular enemies, by what killed them:
//   charred   (flamethrower): blackens in the flames, blinks, crumbles to ash
//   fried     (taser): X-ray skeleton flashing, then a smoking heap
//   melted    (sludge barfer): slumps into a bubbling green puddle
//   greased   (oil rocket): flung off slick and black, splats into an oil slick
//   pancaked  (boulder): flattened on the floor
//   headshot  (the sniper up the bell tower): head off in one piece, the body stood there a moment, then over
//   ceilinged (an overdose that went up into a ceiling): flattened on the underside of it, dripping, and it stays
// The enemy itself is removed; one of these plays in its place.

import { Enemy, EnemyKind, Vector2 } from '../../types';
import { COLORS, GRAVITY } from '../../constants';
import type { GameState } from '../core/state';
import { floorTopAt } from '../core/terrain';
import { isMidBoss } from '../combat/midBoss';
import { KIND_HEAD } from '../render/enemies/index';

export type EnemyDeathKind = 'charred' | 'fried' | 'melted' | 'greased' | 'pancaked' | 'headshot' | 'ceilinged';

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
  /** Died down in a pool (Tommy's muck): it floats up till its feet are here (the surface), and melts there, where it can be seen. */
  floatTo?: number;
  isShield: boolean;
  /** A themed enemy (Artie's wildlife and goons) dies as itself, not as a coloured block. */
  sprite?: { kind: EnemyKind; facing: 1 | -1; phase: number };
  /** One of the range's practice dummies (the boxer, the balloon man): drawn as himself (a person's bones, for the x-ray). */
  dummy?: 'ground' | 'air';
  /** (headshot) The head, off: where it sat on the body (its middle, from the body's top left) and how big; where it's
   * got to (world), how it's going, its spin. */
  head?: { ox: number; oy: number; r: number; x: number; y: number; vx: number; vy: number; rot: number; landed: boolean };
}

export const DEATH_FRAMES: Record<EnemyDeathKind, number> = {
  charred: 95, fried: 85, melted: 110, greased: 160, pancaked: 130, headshot: 170, ceilinged: 600,
};

const FLOOR_Y = 550;

/** The colour the enemy was drawn in (matches drawEnemies). */
const KIND_COLORS: Record<string, string> = {
  wolverine: '#4A3222', goat: '#E7E2D6', eagle: '#5A3A1E', shooter: '#DCE8F5', charger: '#1E3A8A', shielder: '#C9DBEF',
  tourist: '#F97316', bouncer: '#F8FAFC', surfer: '#0F766E', cop: '#1E3A8A', riotcop: '#1F2937', civilian: '#F472B6',
  gator: '#3F5B2A', pelican: '#6B5B45', iguana: '#65A30D', crab: '#DC2626', shark: '#64748B',
  sicario: '#991B1B', enforcer: '#F5F5F4', cardoor: '#60A5FA', rattlesnake: '#C2A26B', scorpion: '#D4A95C', coyote: '#B48A5A', visitor: '#F97316',
  pimp: '#7C3AED', hooker: '#EC4899', mugger: '#18181B', bum: '#78716C', rat: '#57534E', guard: '#1E3A8A', commuter: '#4B5563', reader: '#A16207',
  exec: '#F8FAFC', intern: '#93C5FD', hr: '#BE185D', exterminator: '#65A30D', janitor: '#6B7280', custodian: '#2563EB', labtech: '#F8FAFC',
  subject: '#BAE6FD', scientist: '#F8FAFC', tenant: '#F8FAFC', minion: '#FACC15', generator: '#374151',
  banger: '#DC2626', bruiser: '#F8FAFC', pitbull: '#78716C', lowrider: '#9D174D', hazmat: '#FACC15', bloater: '#84A98C', manhole: '#F97316',
  sludgeling: '#4D7C0F', mutantfish: '#6B8E23', amalgam: '#3F6212',
};

export const enemyBodyColor = (e: { id: string, enemyType?: string, width: number, kind?: string }) => {
  if (e.kind && KIND_COLORS[e.kind]) return KIND_COLORS[e.kind];
  if (e.enemyType === 'shield') return '#444444';
  if (e.id.startsWith('rusher')) return '#9B59B6';
  if (e.enemyType === 'flyer' && e.width > 60) return '#34495E';
  if (e.enemyType === 'flyer') return COLORS.ENEMY_FLYER;
  if (e.enemyType === 'drone') return COLORS.ENEMY_DRONE;
  return COLORS.ENEMY_TANK;
};

/** Which way a themed enemy was facing as it died (wildlife the way it was going, goons toward him). */
const deathFacing = (state: GameState, e: Enemy): 1 | -1 => {
  // (wildlife, beachgoers and shield-holders face their own way; the rest face him)
  const ownWay = ['wolverine', 'goat', 'eagle', 'shielder', 'surfer', 'riotcop', 'gator', 'pelican', 'iguana', 'crab', 'civilian', 'shark',
    'cardoor', 'rattlesnake', 'scorpion', 'coyote', 'visitor', 'bum', 'reader', 'hr', 'custodian', 'scientist', 'rat', 'tenant', 'minion',
    'pitbull', 'lowrider', 'manhole', 'sludgeling', 'mutantfish'];
  if (e.kind && ownWay.includes(e.kind)) return e.facing === 1 ? 1 : -1;
  return state.player.pos.x + state.player.width / 2 < e.pos.x + e.width / 2 ? -1 : 1;
};

export const startEnemyDeath = (state: GameState, e: Enemy, kind: EnemyDeathKind, vel?: Vector2) => {
  if (isMidBoss(e)) return; // (a mid-boss leaves its own corpse)
  if (e.kind === 'tenant') return; // (a tenant always goes out of his window: the stage sees to it)
  state.enemyDeaths.push({
    kind,
    x: e.pos.x, y: e.pos.y, w: e.width, h: e.height,
    color: enemyBodyColor(e),
    t: 0,
    vx: vel?.x ?? 0, vy: vel?.y ?? 0,
    rot: 0,
    // The ground under it (hills, ledges), or the usual floor
    floorY: floorTopAt(state.blocks, e.pos.x + e.width / 2, e.pos.y + e.height) ?? FLOOR_Y,
    landed: false,
    isShield: e.enemyType === 'shield',
    sprite: e.kind ? { kind: e.kind, facing: deathFacing(state, e), phase: Math.abs(Math.round(e.homeX || 0)) % 997 }
      // (a practice dummy's a person: he goes the way a person goes, drawn as himself)
      : e.id.startsWith('dummy-') ? { kind: 'tourist', facing: e.vel.x < 0 ? -1 : 1, phase: 0 } : undefined,
    dummy: e.id.startsWith('dummy-air') ? 'air' : e.id.startsWith('dummy-ground') ? 'ground' : undefined,
  });
  const d = state.enemyDeaths[state.enemyDeaths.length - 1];
  if (kind === 'headshot') {
    // (the head goes the way the round was going: vel)
    const hd = d.sprite ? KIND_HEAD[d.sprite.kind] : null;
    const ox = hd ? d.w / 2 + hd.x * d.sprite!.facing : d.w / 2;
    const oy = hd ? d.h + hd.y : Math.min(d.h * 0.2, 12);
    d.head = { ox, oy, r: hd ? hd.r : Math.min(d.w, d.h) * 0.22, x: d.x + ox, y: d.y + oy, vx: vel?.x ?? 0, vy: vel?.y ?? -6, rot: 0, landed: false };
    d.vx = 0; d.vy = 0;
  }
};

/** Advances every death animation, with the smoke, sparks and bubbles that go with them. */
export const updateEnemyDeaths = (state: GameState) => {
  state.enemyDeaths = state.enemyDeaths.filter(d => {
    // Killed down in a pool: up it comes, bubbling, to the surface first
    if (d.floatTo !== undefined && d.y + d.h > d.floatTo) {
      d.y = Math.max(d.floatTo - d.h, d.y - 2.2);
      if (state.frame % 3 === 0) state.particles.push({ pos: { x: d.x + Math.random() * d.w, y: d.y + d.h * Math.random() }, vel: { x: (Math.random() - 0.5) * 0.6, y: -1.5 - Math.random() }, life: 20, color: 'rgba(217, 249, 157, 0.7)', size: 2 + Math.random() * 2 });
      return true;
    }
    // Killed in mid-air (an eagle burnt, fried or melted on the wing): it drops to the ground first, then plays out
    if (d.kind !== 'greased' && d.kind !== 'headshot' && d.kind !== 'ceilinged' && !d.landed && d.y + d.h < d.floorY - 1) {
      d.vy = Math.min(14, Math.max(0, d.vy) + GRAVITY * 0.8);
      d.y = Math.min(d.floorY - d.h, d.y + d.vy);
      return d.y < d.floorY + 1000;
    }
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
          if (d.y > d.floorY + 1000) return false;
        }
        break;
      case 'pancaked':
        break;
      case 'ceilinged':
        // (dripping off the ceiling: a drop now and then, less as it goes)
        if (d.t % Math.max(6, Math.round(12 + d.t / 25)) === 0) state.particles.push({ pos: { x: d.x + d.w / 2 + (Math.random() - 0.5) * d.w * 1.3, y: d.y + d.h + 5 }, vel: { x: 0, y: 1 }, life: 60, color: Math.random() < 0.5 ? '#7F1D1D' : '#991B1B', size: 2 + Math.random() * 2.5 });
        break;
      case 'headshot': {
        // The body: shot on the wing, it drops; on its feet, it stays stood there
        if (d.y + d.h < d.floorY - 1) { d.vy = Math.min(14, d.vy + GRAVITY * 0.8); d.y = Math.min(d.floorY - d.h, d.y + d.vy); }
        const hd = d.head!;
        const neck = { x: d.x + hd.ox, y: d.y + hd.oy + hd.r * 0.7 };
        // A fountain out of the neck while it's stood there
        if (d.t < 44) for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: neck.x, y: neck.y }, vel: { x: (Math.random() - 0.5) * 2.5, y: -3 - Math.random() * 5 * (1 - d.t / 60) }, life: 26 + Math.random() * 14, color: i ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 3 });
        // The head: off and away, bouncing, rolling to a stop
        if (!hd.landed) {
          hd.vy += GRAVITY * 0.7; hd.x += hd.vx; hd.y += hd.vy; hd.rot += hd.vx * 0.09;
          if (d.t % 2 === 0) state.particles.push({ pos: { x: hd.x, y: hd.y }, vel: { x: 0, y: 0.5 }, life: 18, color: '#991B1B', size: 2 + Math.random() * 2 });
          const floor = floorTopAt(state.blocks, hd.x, hd.y + hd.r) ?? d.floorY;
          if (hd.y + hd.r >= floor && hd.vy > 0) {
            hd.y = floor - hd.r;
            if (hd.vy > 3) { hd.vy = -hd.vy * 0.35; hd.vx *= 0.6; state.particles.push({ pos: { x: hd.x, y: floor - 2 }, vel: { x: 0, y: -1 }, life: 20, color: '#B91C1C', size: 5 }); }
            else { hd.vy = 0; hd.vx *= 0.8; if (Math.abs(hd.vx) < 0.2) hd.landed = true; }
          }
          if (hd.y > d.floorY + 1500) hd.landed = true;
        }
        break;
      }
    }
    return d.t < DEATH_FRAMES[d.kind];
  });
};
