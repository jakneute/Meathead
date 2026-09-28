// Particles, drawn as shapes instead of squares: blood as stretched droplets
// and splats, glass as shards, water as drops, everything else as soft blobs.

import { Particle } from '../../types';
import { isGoreColor } from '../core/effects';

const GLOSS = 'rgba(255, 255, 255, 0.35)';

/** Stable per-particle wobble so splats don't flicker frame to frame. */
const hash = (p: Particle, salt: number) => {
  const v = Math.sin((p.pos.x * 12.9898 + p.pos.y * 78.233 + salt * 37.719) % 1000) * 43758.5453;
  return v - Math.floor(v);
};

export const drawParticle = (ctx: CanvasRenderingContext2D, p: Particle) => {
  const r = Math.max(1, p.size / 2);
  const x = p.pos.x + r, y = p.pos.y + r;
  if (p.isGlass) return drawShard(ctx, p, x, y, r);
  if (isGoreColor(p.color) || p.isBossGore) {
    if (p.isSplat || p.isStuck) return drawSplat(ctx, p, x, y, r);
    return drawDroplet(ctx, p, x, y, r);
  }
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (p.isWater) {
    ctx.fillStyle = GLOSS;
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
};

/** Flying blood: a droplet stretched along its path, with a wet highlight. */
const drawDroplet = (ctx: CanvasRenderingContext2D, p: Particle, x: number, y: number, r: number) => {
  const speed = Math.hypot(p.vel.x, p.vel.y);
  const stretch = 1 + Math.min(2.2, speed * 0.12);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(p.vel.y, p.vel.x));
  ctx.fillStyle = p.color;
  ctx.beginPath();
  // Teardrop: round head leading, pointed tail behind
  ctx.moveTo(-r * stretch * 1.4, 0);
  ctx.quadraticCurveTo(-r * 0.2, -r, r * 0.6, -r * 0.85);
  ctx.arc(r * 0.6, 0, r * 0.85, -Math.PI / 2, Math.PI / 2);
  ctx.quadraticCurveTo(-r * 0.2, r, -r * stretch * 1.4, 0);
  ctx.fill();
  if (r > 2) {
    ctx.fillStyle = GLOSS;
    ctx.beginPath();
    ctx.arc(r * 0.7, -r * 0.3, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

/** Blood that's landed: an irregular splat with spatter around it and a thick drip. */
const drawSplat = (ctx: CanvasRenderingContext2D, p: Particle, x: number, y: number, r: number) => {
  const onFloor = !!p.isSplat;
  // Floor splats spread out into a flat puddle; wall/ceiling ones stay round
  const big = r * (onFloor ? 2.4 : 1.4);
  ctx.fillStyle = p.color;
  ctx.beginPath();
  const points = 9;
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = big * (0.65 + hash(p, i) * 0.55);
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * (onFloor ? 0.35 : 1);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  // Spatter
  for (let k = 0; k < 3; k++) {
    const a = hash(p, 20 + k) * Math.PI * 2, d = big * (1.3 + hash(p, 30 + k));
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * (onFloor ? 0.35 : 1), Math.max(1, r * 0.3 * hash(p, 40 + k) + 0.8), 0, Math.PI * 2);
    ctx.fill();
  }
  // Stuck to a wall or ceiling: a drip running down
  if (!onFloor && hash(p, 50) > 0.5) {
    const len = big * (1.5 + hash(p, 51) * 2.5);
    ctx.fillRect(x - r * 0.25, y, r * 0.5, len);
    ctx.beginPath();
    ctx.arc(x, y + len, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  // Dark wet centre
  ctx.fillStyle = 'rgba(40, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, y, big * 0.45, big * 0.45 * (onFloor ? 0.35 : 1), 0, 0, Math.PI * 2);
  ctx.fill();
};

/** Glass and ice shards: little spinning triangles. */
const drawShard = (ctx: CanvasRenderingContext2D, p: Particle, x: number, y: number, r: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(hash(p, 1) * Math.PI * 2 + p.life * 0.15);
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(-r, -r * 0.6);
  ctx.lineTo(r * 1.2, -r * 0.2);
  ctx.lineTo(-r * 0.3, r);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
};
