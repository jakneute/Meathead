// Machines don't bleed (a game's own robots: see registerKind's `machine`): whatever blood and guts the engine throws
// off one (shot, kicked, flung into a wall, splatted on the floor), it comes out as scrap instead: bits of casing that
// fall and bounce, sparks, and oil. Done in one place, on the particles themselves, the frame they're made, so every
// kind of kill (and every hit) gets it without each one knowing about robots.
//
// (Meathead 1's drones still bleed: that's a joke kept on purpose, and they're not `machine` kinds.)

import type { GameState } from '../core/state';
import type { Enemy, Particle } from '../../types';
import { isGoreColor } from '../core/effects';
import { isMachineKind } from './kinds';

const SCRAP = ['#9CA3AF', '#6B7280', '#4B5563', '#D1D5DB'];
const SPARK = ['#FDE047', '#FFFFFF', '#F59E0B'];
const OIL = ['#0A0A0A', '#1C1917', '#292524'];

const checked = new WeakSet<Particle>();
/** Where robots have just died (their bodies gone already, the gore of it still coming): a few frames. */
let recent: { x: number; y: number; w: number; h: number; until: number }[] = [];
const dyingSeen = new WeakSet<Enemy>();

const inside = (p: Particle, x: number, y: number, w: number, h: number, pad: number) =>
  p.pos.x > x - pad && p.pos.x < x + w + pad && p.pos.y > y - pad && p.pos.y < y + h + pad;

/**
 * A machine that's out of the enemy list for now (held in somebody's hands, being taken apart): whatever gore's thrown
 * off around (x, y, w, h) over the next few frames is scrap too.
 */
export const markMachineGore = (state: GameState, x: number, y: number, w: number, h: number, frames = 4) => {
  recent.push({ x, y, w, h, until: state.frame + frames });
};

/** Every frame, before the particles move: any new blood about a machine turned to scrap, sparks and oil. */
export const scrapMachineGore = (state: GameState) => {
  const zones: { x: number; y: number; w: number; h: number; pad: number }[] = [];
  for (const e of state.enemies) {
    if (!isMachineKind(e.kind)) continue;
    const dead = e.health <= 0 || !!e.isBlownAway;
    zones.push({ x: e.pos.x, y: e.pos.y, w: e.width, h: e.height, pad: dead ? 60 : 24 });
    if (dead && !dyingSeen.has(e)) { dyingSeen.add(e); recent.push({ x: e.pos.x, y: e.pos.y, w: e.width, h: e.height, until: state.frame + 30 }); }
  }
  for (const d of state.enemyDeaths) if (d.sprite && isMachineKind(d.sprite.kind)) zones.push({ x: d.x, y: d.y, w: d.w, h: d.h, pad: 60 });
  recent = recent.filter(r => r.until >= state.frame);
  for (const r of recent) zones.push({ ...r, pad: 60 });
  if (!zones.length) return;
  for (const p of state.particles) {
    if (checked.has(p)) continue;
    checked.add(p);
    if (p.ownBlood || p.isSplat || p.isStuck || !(isGoreColor(p.color) || p.isBossGore)) continue;
    if (!zones.some(z => inside(p, z.x, z.y, z.w, z.h, z.pad))) continue;
    p.isBossGore = false;
    const r = Math.random();
    if (r < 0.45) { p.color = SCRAP[Math.floor(Math.random() * SCRAP.length)]; p.chunk = true; p.grav = 0.32; p.size = Math.max(2, Math.min(6, p.size)); p.life = Math.min(Math.max(p.life, 90), 240); }
    else if (r < 0.75) { p.color = SPARK[Math.floor(Math.random() * SPARK.length)]; p.size = Math.min(3, p.size); p.life = Math.min(p.life, 14); p.vel.x *= 1.3; p.vel.y *= 1.3; }
    else { p.color = OIL[Math.floor(Math.random() * OIL.length)]; p.grav = 0.3; p.size = Math.min(5, p.size); p.life = Math.min(Math.max(p.life, 60), 200); }
  }
};
