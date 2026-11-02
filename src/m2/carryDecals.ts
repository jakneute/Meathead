// What lies on a thing that moves goes with it. The owner's "if a dead body or decal is on a moving platform or at a
// position where it should be moving, move it": the blood splats and the stuck bits on it, the smears, the bodies lying
// on it (the pancakes, the dead ones of the cast lying where they fell), the heads kicked off onto it. Every land, every
// frame (from the grab's update, which every land runs): any block that's moved since last frame (the UK bus's roof,
// the movers (the longship, the cuckoo wheel, the gondolas), the tram's and the bullet train's roofs, lifts, a cut-loose
// train car, a sinking ledge) takes what's on it along. One that's jumped (taken away, put back somewhere): what was on
// it is let go (the splats gone, the bodies left to fall). The planted ones are followups.ts's own (the same rule).
// Blocks that never move cost a lookup each.
//
// (The Wilderness train's ground that goes by under a still train is its own: frontier/train/groundDrift.ts.)

import type { GameState } from '../m1/game/core/state';
import type { Block } from '../m1/types';
import { carryLyingHeads } from './moves/followups';

const last = new WeakMap<Block, { x: number; y: number }>();
/** A move bigger than this in a frame isn't riding: it's been taken away or put somewhere. */
const JUMP = 80;
/** How near its top (or its sides, for what's stuck to them) counts as on it. */
const ON = 5;

export const carryDecals = (state: GameState) => {
  const blocks = state.blocks;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const was = last.get(b);
    if (!was) { last.set(b, { x: b.x, y: b.y }); continue; }
    const dx = b.x - was.x, dy = b.y - was.y;
    if (!dx && !dy) continue;
    const ox = was.x, oy = was.y;
    was.x = b.x; was.y = b.y;
    carry(state, b, ox, oy, dx, dy, Math.abs(dx) > JUMP || Math.abs(dy) > JUMP);
  }
};

const carry = (state: GameState, b: Block, ox: number, oy: number, dx: number, dy: number, jumped: boolean) => {
  const x0 = ox - ON, x1 = ox + b.w + ON, y0 = oy - ON, y1 = oy + (b.oneWay ? ON : b.h + ON);
  // (the splats on its top, the bits stuck to its sides)
  let drop = false;
  for (const p of state.particles) {
    if (!(p.isSplat || p.isStuck)) continue;
    const r = p.size / 2;
    if (p.pos.x < x0 || p.pos.x > x1 || p.pos.y + r < y0 || p.pos.y - r > y1) continue;
    if (jumped) { p.life = 0; drop = true; continue; }
    p.pos.x += dx; p.pos.y += dy;
  }
  if (drop) state.particles = state.particles.filter(p => p.life > 0);
  if (jumped) return;
  // (the smears along its top)
  if (state.groundSmears) for (const s of state.groundSmears) {
    if (Math.abs(s.y - oy) > ON || s.x2 < x0 || s.x1 > x1) continue;
    s.x1 += dx; s.x2 += dx; s.y += dy;
  }
  // (the bodies lying on it: the death poses, their heads; the dead of the cast lying there)
  for (const d of state.enemyDeaths) {
    const cx = d.x + d.w / 2;
    if (cx < x0 || cx > x1 || (Math.abs(d.y + d.h - oy) > ON + 2 && !(d.landed && Math.abs(d.floorY - oy) <= ON))) continue;
    d.x += dx; d.y += dy; d.floorY += dy;
    if (d.head?.landed) { d.head.x += dx; d.head.y += dy; }
  }
  for (const e of state.enemies) {
    if (e.health > 0 || e.isBlownAway || e.type === 'boss') continue;
    const cx = e.pos.x + e.width / 2;
    if (cx < x0 || cx > x1 || Math.abs(e.pos.y + e.height - oy) > ON) continue;
    e.pos.x += dx; e.pos.y += dy;
  }
  carryLyingHeads(ox - ON, oy, b.w + 2 * ON, dx, dy);
};
