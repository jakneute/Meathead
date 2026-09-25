// Boulders (Ernie's, and Meathead's boulder gun), plus the rock chips they break into.

import { Enemy, Projectile } from '../../types';
import { ERNIE_BOULDER_SIZE } from '../bosses/ernie';

interface RockPalette { light: string; mid: string; dark: string; crack: string; speck: string }

const ERNIE_ROCK: RockPalette = { light: '#A1887F', mid: '#6D4C41', dark: '#3E2723', crack: '#1B0F0C', speck: '#BCAAA4' };
export const PLAYER_ROCK: RockPalette = { light: '#D7A86E', mid: '#8B5A2B', dark: '#4E2F12', crack: '#2A1808', speck: '#F0D2A8' };

/** A craggy, shaded rock. `seed` keeps each boulder's lumps and cracks its own. */
export const drawRock = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, angle: number, pal: RockPalette, seed: number) => {
  const lump = (i: number) => 0.84 + ((Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453) % 1 + 1) % 1 * 0.22;
  const points = 14;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const outline = () => {
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2;
      const rr = r * lump(i);
      if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
  };
  // Body, lit from the top-left (the light doesn't turn with the rock)
  const lx = Math.cos(-angle - 2.3) * r * 0.45, ly = Math.sin(-angle - 2.3) * r * 0.45;
  const shade = ctx.createRadialGradient(lx, ly, r * 0.1, 0, 0, r * 1.1);
  shade.addColorStop(0, pal.light);
  shade.addColorStop(0.55, pal.mid);
  shade.addColorStop(1, pal.dark);
  ctx.fillStyle = shade;
  outline();
  ctx.fill();
  ctx.strokeStyle = pal.crack;
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.stroke();

  // Flat facets
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let k = 0; k < 3; k++) {
    const a = seed + k * 2.1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2);
    ctx.lineTo(Math.cos(a + 0.5) * r * 0.75, Math.sin(a + 0.5) * r * 0.75);
    ctx.lineTo(Math.cos(a - 0.4) * r * 0.7, Math.sin(a - 0.4) * r * 0.7);
    ctx.closePath();
    ctx.fill();
  }
  // Cracks
  ctx.strokeStyle = pal.crack;
  ctx.lineWidth = Math.max(1.5, r * 0.05);
  ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    const a = seed * 1.7 + k * 2.9;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.85);
    ctx.lineTo(Math.cos(a + 0.3) * r * 0.4, Math.sin(a + 0.3) * r * 0.4);
    ctx.lineTo(Math.cos(a + 0.9) * r * 0.2, Math.sin(a + 0.9) * r * 0.2);
    ctx.stroke();
  }
  // Specks
  ctx.fillStyle = pal.speck;
  for (let k = 0; k < 6; k++) {
    const a = seed * 3.1 + k * 1.3, d = r * (0.25 + (k % 3) * 0.2);
    ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, Math.max(2, r * 0.07), Math.max(2, r * 0.07));
  }
  ctx.restore();
};

const seedOf = (id: string) => { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997; return h; };

/** A boulder projectile: rolls (spins with distance travelled), kicks up dust on the ground. */
export const drawBoulder = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const r = p.width / 2, cx = p.pos.x + r, cy = p.pos.y + p.height / 2;
  const pal = p.owner === 'player' ? PLAYER_ROCK : ERNIE_ROCK;
  const onGround = Math.abs(p.vel.y) < 1;
  if (onGround) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.95, r * 0.9, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Dust kicked up behind it while it rolls
  if (onGround && Math.abs(p.vel.x) > 1) {
    const back = -Math.sign(p.vel.x);
    for (let k = 0; k < 3; k++) {
      const t = ((frame * 2 + k * 9) % 24) / 24;
      ctx.fillStyle = `rgba(161, 136, 127, ${0.45 * (1 - t)})`;
      ctx.beginPath();
      ctx.arc(cx + back * (r * 0.6 + t * 30), cy + r * 0.8 - t * 14, r * 0.2 + t * r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  drawRock(ctx, cx, cy, r, p.pos.x / r, pal, seedOf(p.id));
};

/** Shrapnel from a broken boulder: small tumbling rock chips. */
export const drawRockChip = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(frame * 0.4 + seedOf(p.id));
  ctx.fillStyle = '#6D4C41';
  ctx.beginPath();
  ctx.moveTo(-6, -3); ctx.lineTo(1, -6); ctx.lineTo(6, -1); ctx.lineTo(3, 5); ctx.lineTo(-5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2A1808';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
};

/** Ernie holding a boulder over his head before he heaves it. */
export const drawErnieHeldBoulder = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  if (e.bossState !== 'attacking') return;
  const r = ERNIE_BOULDER_SIZE / 2;
  const strain = Math.sin(frame * 0.9) * 1.5; // straining under the weight
  drawRock(ctx, e.pos.x + e.width / 2, e.pos.y - r + 12 + strain, r, 0.3, ERNIE_ROCK, 7);
};
