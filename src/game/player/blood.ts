// Blood on Meathead: his own, and everybody else's.
//
// Hurt, he bleeds: a spurt off him the moment it lands (more the harder it was), a splash of it left on him where it
// came out, and for a while after, drops falling off him. And what comes out of whatever he kills up close, the blood
// flying off it, sticks where it hits him: spattered across his chest, his arms, his face, his gun, running down him
// as it sits there, going dark, and fading off him again over the next several seconds (straight off, if he goes in
// the water). Drawn onto his sprite (render/player/player.ts), only where he is.

import type { FrameContext } from '../core/context';
import type { Player, Particle } from '../../types';
import { isGoreColor } from '../core/effects';
import { PARTICLE_PALETTES } from '../../constants';

/** The most that's on him at once (the oldest wipe off first). */
const MAX_SPLATS = 70;
/** How long a spatter stays on him (frames), and the stretch at the end of that over which it fades. */
const SPLAT_LIFE = 540, SPLAT_FADE = 160;
/** How much of what flies into him sticks. */
const STICK_CHANCE = 0.55;

const GORE = PARTICLE_PALETTES.GORE;

/** Puts a spatter on him at the world point (x, y). */
const stick = (state: FrameContext['state'], p: Player, x: number, y: number, r: number, dark = false) => {
  const splats = (p.splats ??= []);
  if (splats.length >= MAX_SPLATS) splats.shift();
  splats.push({ x: (x - (p.pos.x + p.width / 2)) * (p.facing || 1), y: y - (p.pos.y + p.height), r, at: state.frame, life: SPLAT_LIFE + Math.random() * 180, dark });
};

/** A point somewhere on his body (the upper three quarters of him: not his boots). */
const onHim = (p: Player) => ({ x: p.pos.x + p.width * (0.15 + Math.random() * 0.7), y: p.pos.y + p.height * (0.08 + Math.random() * 0.62) });

/** Once a frame, after everything's had its go at him. */
export const updateBlood = (ctx: FrameContext) => {
  const { state } = ctx;
  const p = state.player;
  const was = p.bloodHp ?? p.health;
  p.bloodHp = p.health;
  // Hurt: a spurt off him, some of it left on him, and he's bleeding for a while
  const dmg = was - p.health;
  if (dmg > 0.5 && p.health > 0) {
    const at = onHim(p);
    const n = Math.min(26, 6 + Math.round(dmg * 1.4));
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const sp = 2 + Math.random() * (3 + dmg * 0.15);
      state.particles.push({ pos: { x: at.x, y: at.y }, vel: { x: Math.cos(a) * sp, y: Math.sin(a) * sp }, life: 40 + Math.random() * 30, color: GORE[i % GORE.length], size: 1.5 + Math.random() * 3, ownBlood: true });
    }
    for (let i = 0; i < 1 + Math.min(4, Math.round(dmg / 6)); i++) stick(state, p, at.x + (Math.random() - 0.5) * 10, at.y + (Math.random() - 0.5) * 10, 1.5 + Math.random() * 2.5);
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
  // What flies into him off whatever he's killing sticks to him
  const box = { x: p.pos.x + 4, y: p.pos.y + 2, w: p.width - 8, h: p.height * 0.85 };
  for (const q of state.particles as Particle[]) {
    if (q.ownBlood || q.isStuck || q.isSplat || q.life <= 0 || !isGoreColor(q.color)) continue;
    if (q.pos.x < box.x || q.pos.x > box.x + box.w || q.pos.y < box.y || q.pos.y > box.y + box.h) continue;
    if (Math.abs(q.vel.x) + Math.abs(q.vel.y) < 1) continue;
    if (Math.random() > STICK_CHANCE) { q.ownBlood = true; continue; }
    stick(state, p, q.pos.x, q.pos.y, Math.min(4.5, 1 + q.size * 0.35), q.color === GORE[GORE.length - 1]);
    q.life = 0;
  }
  // Wiped off by the water; otherwise, off with time
  if (p.splats?.length) {
    if (p.swimming) p.splats = [];
    else p.splats = p.splats.filter(s => state.frame - s.at < s.life);
  }
};

/**
 * The blood on him, drawn into his sprite (origin at his feet, +x to the world's right): each spatter a blob with
 * flecks round it, a run of it going down him from it as it sits there, going dark, fading out at the end. The
 * caller draws this so it only lands on him (the sprite's source-atop).
 */
export const drawBloodOnHim = (ctx: CanvasRenderingContext2D, p: Player, frame: number) => {
  if (!p.splats?.length) return;
  const facing = p.facing || 1;
  for (const s of p.splats) {
    const age = frame - s.at, left = s.life - age;
    const a = Math.min(1, left / SPLAT_FADE) * 0.92;
    if (a <= 0) continue;
    const x = s.x * facing, y = s.y;
    const old = Math.min(1, age / 240);
    ctx.globalAlpha = a;
    ctx.fillStyle = s.dark || old > 0.6 ? '#5F0F0F' : old > 0.25 ? '#8B1414' : '#B91C1C';
    ctx.beginPath(); ctx.ellipse(x, y, s.r, s.r * 0.8, (s.x * 7) % 3, 0, Math.PI * 2); ctx.fill();
    // (flecks round it)
    for (let k = 0; k < 3; k++) { const fa = s.at * 1.7 + k * 2.1; ctx.fillRect(x + Math.cos(fa) * s.r * 1.8, y + Math.sin(fa) * s.r * 1.5, 1, 1); }
    // (running down him as it sits there)
    const run = Math.min(9, age / 14) * (s.r / 3);
    if (run > 0.5) { ctx.fillRect(x - 0.5, y, 1.1, run); ctx.beginPath(); ctx.ellipse(x, y + run, 0.9, 1.2, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
};
