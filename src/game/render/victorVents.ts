// Victor Volcano's magma vents: the cracking warning before they open, the
// erupting cones themselves (on the floor and bursting out of the walls), and
// the magma they spit. All world space.

import { Projectile, Volcano } from '../../types';
import { ARENA_LEFT, ARENA_RIGHT } from '../../constants';
import { CORK_FUSE } from '../bosses/victor';

const TELEGRAPH_FRAMES = 60;
const ERUPTION_FRAMES = 180;
const MID_X = (ARENA_LEFT + ARENA_RIGHT) / 2;

/**
 * Local frame for a vent: (0,0) is the middle of its base on the surface and
 * "up" (-y) points out into the arena. Floor vents point up; wall vents point
 * sideways out of the wall face.
 */
const atVent = (ctx: CanvasRenderingContext2D, v: Volcano) => {
  if (v.type === 'ground') {
    ctx.translate(v.pos.x, v.pos.y);
    return;
  }
  const isLeft = v.pos.x < MID_X;
  ctx.translate(isLeft ? ARENA_LEFT : ARENA_RIGHT, v.pos.y);
  ctx.rotate(isLeft ? Math.PI / 2 : -Math.PI / 2);
};

// ---------------------------------------------------------------------------
// Warning: the surface cracks open and glows before it erupts
// ---------------------------------------------------------------------------

export const drawVentTelegraph = (ctx: CanvasRenderingContext2D, v: Volcano, frame: number) => {
  const t = 1 - v.life / TELEGRAPH_FRAMES; // 0 -> 1 as the eruption nears
  const seed = Math.floor(v.pos.x * 7 + v.pos.y * 13);
  ctx.save();
  atVent(ctx, v);
  // Shake harder as it builds
  ctx.translate((Math.random() - 0.5) * t * 4, 0);

  // Danger column showing where it'll blast
  const col = ctx.createLinearGradient(0, 0, 0, -260);
  const pulse = 0.2 + 0.15 * Math.sin(frame * 0.5) + t * 0.3;
  col.addColorStop(0, `rgba(255, 60, 0, ${pulse})`);
  col.addColorStop(1, 'rgba(255, 60, 0, 0)');
  ctx.fillStyle = col;
  ctx.fillRect(-34, -260, 68, 260);

  // Glowing cracks spreading out from the vent
  const reach = 14 + t * 46;
  ctx.shadowColor = '#FF6A00';
  ctx.shadowBlur = 10 + t * 10;
  ctx.strokeStyle = t > 0.7 && frame % 4 < 2 ? '#FFF3B0' : '#FF7A1A';
  ctx.lineWidth = 2 + t * 2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const len = reach * (0.5 + ((seed + i * 37) % 50) / 100);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    let x = 0, y = 0;
    for (let k = 1; k <= 3; k++) {
      x += dir * (len / 3);
      y += (((seed + i * 17 + k * 29) % 9) - 4) * 0.8 - (i < 2 ? k * 2 : 0);
      ctx.lineTo(x, Math.min(2, y));
    }
    ctx.stroke();
  }
  // Hot spot where it'll break through, with a warning ring pulsing out of it
  ctx.fillStyle = '#FFD166';
  ctx.beginPath();
  ctx.ellipse(0, -2, 8 + t * 18, 4 + t * 5, 0, 0, Math.PI * 2);
  ctx.fill();
  const ring = (frame % 20) / 20;
  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(255, 90, 0, ${0.8 * (1 - ring)})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, -2, 10 + ring * 40, 4 + ring * 10, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Pebbles hopping off the surface
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#3B1F17';
  for (let i = 0; i < 4; i++) {
    const hop = Math.abs(Math.sin(frame * 0.35 + i * 1.7)) * (6 + t * 14);
    ctx.fillRect(-22 + i * 13, -hop - 4, 4, 4);
  }
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Erupting vent
// ---------------------------------------------------------------------------

export const drawVent = (ctx: CanvasRenderingContext2D, v: Volcano, frame: number) => {
  const age = ERUPTION_FRAMES - v.life;
  // Punches up out of the surface, then cools and sputters near the end
  const rise = Math.min(1, age / 10);
  const heat = Math.min(1, v.life / 40);
  const seed = Math.floor(v.pos.x * 7 + v.pos.y * 13);
  const w = 42, h = 52 * rise;

  ctx.save();
  atVent(ctx, v);
  // A corked vent shudders harder and harder as the pressure builds
  const pressure = v.corked ? 1 - (v.fuse ?? 0) / CORK_FUSE : 0;
  if (v.corked) ctx.translate((Math.random() - 0.5) * (1 + pressure * 6), 0);

  // Heat glow
  const glow = ctx.createRadialGradient(0, -h, 4, 0, -h, 90);
  glow.addColorStop(0, `rgba(255, 120, 0, ${0.55 * heat})`);
  glow.addColorStop(1, 'rgba(255, 60, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(-90, -h - 90, 180, 180);

  // Jagged basalt cone
  ctx.fillStyle = '#1A0E0B';
  ctx.beginPath();
  ctx.moveTo(-w, 2);
  ctx.lineTo(-w * 0.72, -h * 0.35);
  ctx.lineTo(-w * 0.62, -h * 0.4);
  ctx.lineTo(-w * 0.45, -h * 0.82);
  ctx.lineTo(-w * 0.3, -h);
  ctx.lineTo(-w * 0.12, -h * 0.9);
  ctx.lineTo(w * 0.12, -h * 0.9);
  ctx.lineTo(w * 0.3, -h);
  ctx.lineTo(w * 0.48, -h * 0.76);
  ctx.lineTo(w * 0.66, -h * 0.42);
  ctx.lineTo(w * 0.78, -h * 0.3);
  ctx.lineTo(w, 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4A2A20';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Rim light on the rocky facets
  ctx.strokeStyle = `rgba(255, 140, 60, ${0.35 + 0.35 * heat})`;
  ctx.beginPath();
  ctx.moveTo(-w * 0.62, -h * 0.4); ctx.lineTo(-w * 0.45, -h * 0.82); ctx.lineTo(-w * 0.3, -h);
  ctx.moveTo(w * 0.3, -h); ctx.lineTo(w * 0.48, -h * 0.76);
  ctx.stroke();

  // Glowing fissures in the rock
  ctx.shadowColor = '#FF5A00';
  ctx.shadowBlur = 8 * heat;
  ctx.strokeStyle = heat > 0.5 ? '#FF8A1F' : '#A33A10';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const sx = (-0.5 + i * 0.5) * w * 0.6;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx + (((seed + i * 11) % 7) - 3) * 2, -h * 0.35);
    ctx.lineTo(sx * 0.6, -h * 0.7);
    ctx.stroke();
  }

  // Lava rivulets running down the slopes from the lip
  ctx.strokeStyle = heat > 0.5 ? '#FF6A00' : '#B8420E';
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const flow = 0.35 + 0.65 * (((frame * 0.8 + i * 29) % 60) / 60); // how far down it's run
    const topX = side * w * (0.12 + (i >> 1) * 0.12), baseX = side * w * (0.4 + (i >> 1) * 0.22);
    ctx.lineWidth = 3.5 - (i >> 1);
    ctx.beginPath();
    ctx.moveTo(topX, -h * 0.9);
    ctx.lineTo(topX + (baseX - topX) * flow, -h * 0.9 + h * 0.9 * flow);
    ctx.stroke();
  }

  if (v.corked) { drawCork(ctx, w, h, pressure, frame); ctx.restore(); return; }

  // Bubbling crater
  ctx.shadowBlur = 16 * heat;
  ctx.fillStyle = heat > 0.5 ? '#FFB020' : '#C2410C';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.93, w * 0.34, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFF1A8';
  for (let i = 0; i < 3; i++) {
    const b = Math.sin(frame * 0.4 + i * 2.1);
    if (b > 0.2) {
      ctx.beginPath();
      ctx.arc(-8 + i * 8, -h * 0.93 - b * 5, 2 + b * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Fountain of lava licking out of the top
  if (heat > 0.3) {
    ctx.fillStyle = 'rgba(255, 110, 20, 0.85)';
    const jet = (18 + Math.sin(frame * 0.8) * 8) * heat;
    ctx.beginPath();
    ctx.moveTo(-7, -h * 0.93);
    ctx.quadraticCurveTo(-3, -h - jet * 0.6, Math.sin(frame * 0.3) * 3, -h - jet);
    ctx.quadraticCurveTo(3, -h - jet * 0.6, 7, -h * 0.93);
    ctx.fill();
  }

  // Smoke column
  ctx.shadowBlur = 0;
  for (let i = 0; i < 4; i++) {
    const s = ((frame * 0.9 + i * 22) % 90) / 90;
    ctx.fillStyle = `rgba(35, 25, 22, ${0.5 * (1 - s)})`;
    ctx.beginPath();
    ctx.arc(Math.sin(s * 5 + i) * 10, -h - 12 - s * 110, 8 + s * 18, 0, Math.PI * 2);
    ctx.fill();
  }
  // Embers
  for (let i = 0; i < 5; i++) {
    const s = ((frame * 1.3 + i * 17 + seed) % 60) / 60;
    ctx.fillStyle = s < 0.5 ? '#FFE08A' : '#FF6A00';
    ctx.fillRect(Math.sin(i * 2.3 + s * 4) * (10 + s * 30), -h - s * 90, 2.5, 2.5);
  }
  ctx.restore();
};

/** The boulder jammed in the crater, glowing cracks spreading and flashing as it's about to blow. */
const drawCork = (ctx: CanvasRenderingContext2D, w: number, h: number, pressure: number, frame: number) => {
  const cy = -h * 0.93;
  ctx.fillStyle = '#5D4037';
  ctx.beginPath(); ctx.ellipse(0, cy - 6, w * 0.42, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8D6E63';
  ctx.beginPath(); ctx.ellipse(-4, cy - 11, w * 0.24, 6, 0, 0, Math.PI * 2); ctx.fill();
  const hot = pressure > 0.75 && frame % 6 < 3;
  ctx.strokeStyle = hot ? '#FFF3B0' : `rgba(255, ${120 + pressure * 100}, 30, ${0.4 + pressure * 0.6})`;
  ctx.lineWidth = 2 + pressure * 2;
  ctx.shadowColor = '#FF6A00';
  ctx.shadowBlur = 6 + pressure * 14;
  for (let i = 0; i < 4; i++) {
    const a = -Math.PI * 0.9 + i * 0.6;
    const len = 6 + pressure * 18;
    ctx.beginPath(); ctx.moveTo(0, cy - 6); ctx.lineTo(Math.cos(a) * len, cy - 6 + Math.sin(a) * len * 0.5); ctx.stroke();
  }
  ctx.shadowBlur = 0;
  // Steam hissing out round the edges
  for (let i = 0; i < 3; i++) {
    const s = ((frame * (1 + pressure * 2) + i * 20) % 40) / 40;
    ctx.fillStyle = `rgba(230, 225, 220, ${0.5 * (1 - s)})`;
    ctx.beginPath(); ctx.arc((i - 1) * w * 0.35, cy - 12 - s * 40, 4 + s * 8, 0, Math.PI * 2); ctx.fill();
  }
};

// ---------------------------------------------------------------------------
// Magma blobs the vents spit
// ---------------------------------------------------------------------------

export const isMagma = (p: Projectile) => p.id.startsWith('magma-');

export const drawMagma = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  const speed = Math.hypot(p.vel.x, p.vel.y) || 1;
  const dx = -p.vel.x / speed, dy = -p.vel.y / speed;
  ctx.save();
  // Trail
  for (let i = 4; i >= 1; i--) {
    ctx.fillStyle = `rgba(255, ${80 + i * 20}, 0, ${0.12 * (5 - i)})`;
    ctx.beginPath();
    ctx.arc(cx + dx * i * 6, cy + dy * i * 6, 7 - i, 0, Math.PI * 2);
    ctx.fill();
  }
  // Molten blob with a crusted edge and a white-hot core
  ctx.shadowColor = '#FF5A00';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#7A1F05';
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FF6A00';
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = frame % 6 < 3 ? '#FFE9A0' : '#FFC04D';
  ctx.beginPath();
  ctx.arc(cx - 1.5, cy - 1.5, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
