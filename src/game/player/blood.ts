// Blood off Meathead when he's hurt: a spurt off him the moment it lands (more the harder it was), and for a while
// after, drops falling off him. (How bloody he looks is his health: the cuts and the blood drawn on him, see
// render/player/gore.ts. Nothing sticks to him.)

import type { FrameContext } from '../core/context';
import { PARTICLE_PALETTES } from '../../constants';

const GORE = PARTICLE_PALETTES.GORE;

/** A point somewhere on his body (the upper three quarters of him: not his boots). */
const onHim = (p: FrameContext['state']['player']) => ({ x: p.pos.x + p.width * (0.15 + Math.random() * 0.7), y: p.pos.y + p.height * (0.08 + Math.random() * 0.62) });

/** Once a frame, after everything's had its go at him. */
export const updateBlood = (ctx: FrameContext) => {
  const { state } = ctx;
  const p = state.player;
  const was = p.bloodHp ?? p.health;
  p.bloodHp = p.health;
  // Hurt: a spurt off him, and he's bleeding for a while
  const dmg = was - p.health;
  if (dmg > 0.5 && p.health > 0) {
    const at = onHim(p);
    const n = Math.min(26, 6 + Math.round(dmg * 1.4));
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const sp = 2 + Math.random() * (3 + dmg * 0.15);
      state.particles.push({ pos: { x: at.x, y: at.y }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp }, life: 40 + Math.random() * 30, color: GORE[i % GORE.length], size: 1.5 + Math.random() * 3, ownBlood: true });
    }
    p.bleedT = Math.min(300, (p.bleedT ?? 0) + 50 + dmg * 5);
  }
  // Bleeding: drops off him, every so often (fewer as it stops)
  if ((p.bleedT ?? 0) > 0) {
    p.bleedT = (p.bleedT ?? 0) - 1;
    if (Math.random() < Math.min(0.5, (p.bleedT ?? 0) / 300 + 0.08)) {
      const at = onHim(p);
      state.particles.push({ pos: at, vel: { x: p.vel.x * 0.3 + (Math.random() - 0.5) * 0.4, y: 0.5 }, life: 60, color: GORE[Math.floor(Math.random() * GORE.length)], size: 1.2 + Math.random() * 1.6, ownBlood: true });
    }
  }
};
