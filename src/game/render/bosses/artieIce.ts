// Artie Avalanche's ice: icicles hanging from (and falling from) the ceiling,
// the big ice blocks he throws, and the shards they burst into. World space.
// Also the block of ice a frozen boss is stuck in (Ernie).

import { Enemy, Projectile } from '../../../types';
import { GameState } from '../../core/state';
import { steppedGlow, pixelBlob } from '../pixelArt';

const FLOOR_Y = 550;

export const drawIcicles = (ctx: CanvasRenderingContext2D, state: GameState) => {
  if (state.icicles.length === 0) return;
  const frame = state.frame;
  ctx.save();
  for (const i of state.icicles) {
    const hanging = i.fallIn > 0;
    const grow = Math.min(1, i.age / 12);
    const len = i.length * grow;
    // About to drop: it shakes, and a shadow gathers on the floor underneath
    const shaking = hanging && i.fallIn < 20;
    const x = i.x + (shaking ? (frame % 4 < 2 ? -1.5 : 1.5) : 0);
    const warn = hanging ? Math.max(0, 1 - i.fallIn / 60) : 1;
    ctx.fillStyle = `rgba(10, 40, 70, ${0.2 + 0.4 * warn})`;
    ctx.beginPath();
    ctx.ellipse(i.x, FLOOR_Y - 2, 8 + 14 * warn, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(95, 225, 255, ${0.3 + 0.5 * warn})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (!hanging) {
      // Motion streaks while falling
      ctx.strokeStyle = 'rgba(224, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      for (const dx of [-5, 5]) {
        ctx.beginPath();
        ctx.moveTo(x + dx, i.y - 4);
        ctx.lineTo(x + dx, i.y - 4 - Math.min(40, i.vy * 3));
        ctx.stroke();
      }
    } else {
      // Frosty clump it's hanging from
      ctx.fillStyle = '#E8F8FF';
      ctx.beginPath();
      ctx.ellipse(x, i.y + 2, 17, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // The icicle: a big jagged spike, glowing so it stands out from the scenery
    const hw = 12;
    ctx.save();
    ctx.shadowColor = shaking && frame % 6 < 3 ? '#FFFFFF' : '#5FE1FF';
    ctx.shadowBlur = shaking ? 18 : 10;
    const grad = ctx.createLinearGradient(x - hw, 0, x + hw, 0);
    grad.addColorStop(0, '#8FD3F2');
    grad.addColorStop(0.45, '#FFFFFF');
    grad.addColorStop(1, '#6DBDE3');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x - hw, i.y);
    ctx.lineTo(x - hw * 0.65, i.y + len * 0.35);
    ctx.lineTo(x - hw * 0.8, i.y + len * 0.45);
    ctx.lineTo(x, i.y + len);
    ctx.lineTo(x + hw * 0.55, i.y + len * 0.55);
    ctx.lineTo(x + hw * 0.45, i.y + len * 0.4);
    ctx.lineTo(x + hw, i.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#1F6F9F';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 4, i.y + 4);
    ctx.lineTo(x - 1, i.y + len * 0.7);
    ctx.stroke();
    // Cracking loose at the base just before it drops
    if (shaking) {
      ctx.strokeStyle = '#1F6F9F';
      ctx.beginPath();
      ctx.moveTo(x - hw, i.y + 6); ctx.lineTo(x - 3, i.y + 9); ctx.lineTo(x + 2, i.y + 5); ctx.lineTo(x + hw, i.y + 8);
      ctx.stroke();
    }

    // A drip forming at the tip
    if (hanging && grow >= 1) {
      const d = ((frame + Math.floor(i.x)) % 50) / 50;
      ctx.fillStyle = 'rgba(190, 240, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(x, i.y + len + 2 + (d > 0.7 ? (d - 0.7) * 120 : 0), 2 * Math.min(1, d * 2), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
};

/** Ice in steps, deep to bright: a face gets the step its slant to the light (upper left) earns. */
const ICE_RAMP = ['#2F6F9E', '#4F9BCB', '#86CBEB', '#BDE9F8', '#EAFBFF'];
const ICE_INK = '#123A57';
/** The step for a face whose outward normal is (nx, ny) in the turned frame, the light staying put upper left. */
const iceStep = (nx: number, ny: number, angle: number) => {
  const c = Math.cos(angle), s = Math.sin(angle);
  const wx = nx * c - ny * s, wy = nx * s + ny * c, len = Math.hypot(wx, wy) || 1;
  const lit = (-0.62 * wx - 0.78 * wy) / len; // -1..1
  return ICE_RAMP[Math.max(0, Math.min(ICE_RAMP.length - 1, Math.round((lit + 1) * 0.5 * (ICE_RAMP.length - 1) + 0.3)))];
};
/** A four-point sparkle, `s` the arm. */
const sparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(Math.round(x) - 1, Math.round(y - s), 2, s * 2);
  ctx.fillRect(Math.round(x - s), Math.round(y) - 1, s * 2, 2);
};

/** Artie's thrown ice block: a cut, faceted chunk, a flat face in the middle, bubbles frozen in it; tumbles and trails snow. */
export const drawIceBlock = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2, r = p.width / 2;
  const dir = Math.sign(p.vel.x) || 1;
  const angle = frame * 0.08 * dir;
  ctx.save();
  // Frost trail: chunky puffs, fading in steps
  for (let k = 1; k <= 4; k++) {
    ctx.globalAlpha = 0.5 - k * 0.1;
    pixelBlob(ctx, cx - dir * k * 14, cy + Math.sin(frame * 0.3 + k) * 4, r * (0.75 - k * 0.12), r * (0.75 - k * 0.12), '#D2F5FF');
  }
  ctx.globalAlpha = 1;
  // Chilly glow, in rings
  steppedGlow(ctx, cx, cy, r * 1.4, '#7FDBFF', 0.3, 0.06, 4);
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const pts = [[-1, -0.7], [-0.35, -1], [0.55, -0.85], [1, -0.2], [0.8, 0.7], [0.1, 1], [-0.75, 0.8], [-1, 0.1]].map(([x, y]) => [x * r, y * r]);
  // (the flat face in the middle: the outline pulled in round a point off-centre)
  const fx = -0.1 * r, fy = -0.1 * r;
  const inner = pts.map(([x, y]) => [fx + (x - fx) * 0.52, fy + (y - fy) * 0.52]);
  const poly = (q: number[][]) => { ctx.beginPath(); q.forEach(([x, y], k) => (k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))); ctx.closePath(); };
  // Ink
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ICE_INK; ctx.lineWidth = 2.5;
  poly(pts); ctx.stroke();
  // The bevels round the face, each its own step
  for (let k = 0; k < pts.length; k++) {
    const a = pts[k], b = pts[(k + 1) % pts.length], ia = inner[k], ib = inner[(k + 1) % pts.length];
    const nx = (a[0] + b[0]) / 2 - fx, ny = (a[1] + b[1]) / 2 - fy;
    ctx.fillStyle = iceStep(nx, ny, angle);
    poly([a, b, ib, ia]); ctx.fill();
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.6; ctx.stroke(); // (no seams)
  }
  // The face, a step under the brightest, a lit band along its upper-left edges
  ctx.fillStyle = '#A9DEF3';
  poly(inner); ctx.fill();
  ctx.save(); poly(inner); ctx.clip(); ctx.rotate(-angle);
  ctx.fillStyle = '#C9EEFA'; ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.25, r * 0.38, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)'; ctx.lineWidth = 1;
  poly(inner); ctx.stroke();
  // Bubbles frozen in it, and a fracture running through
  ctx.fillStyle = '#E4F8FF';
  for (const [bx, by, br] of [[0.12, 0.2, 2.2], [0.28, 0.05, 1.4], [-0.25, 0.32, 1.2], [0.05, 0.42, 1]]) {
    ctx.beginPath(); ctx.arc(bx * r, by * r, br, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0.12 * r - 1.5, 0.2 * r - 1.5, 1, 1);
  ctx.strokeStyle = '#2F6F9E'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(0.3 * r, 0.1 * r); ctx.lineTo(0.5 * r, 0.35 * r); ctx.lineTo(0.35 * r, 0.55 * r); ctx.lineTo(0.48 * r, 0.75 * r); ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(0.3 * r - 1, 0.1 * r); ctx.lineTo(0.5 * r - 1, 0.35 * r); ctx.lineTo(0.35 * r - 1, 0.55 * r); ctx.stroke();
  ctx.restore();
  // Glints: a fixed one upper left, and a sparkle now and then
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(Math.round(cx - r * 0.5), Math.round(cy - r * 0.55), 3, 2);
  ctx.fillRect(Math.round(cx - r * 0.6), Math.round(cy - r * 0.42), 2, 2);
  if (frame % 30 < 4) sparkle(ctx, cx - r * 0.4, cy - r * 0.5, frame % 30 < 2 ? 4 : 6);

  // Snowflakes shedding off it
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (let k = 0; k < 3; k++) {
    const t = ((frame * 2 + k * 11) % 24) / 24;
    ctx.fillRect(Math.round(cx - dir * (r + t * 30) + Math.sin(k * 3 + t * 6) * 6), Math.round(cy - r * 0.6 + k * r * 0.6 + t * 10), 2, 2);
  }
};

/** A shard of a shattered ice block: a spinning splinter, a ridge down it, one side catching the light. */
export const drawIceShard = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const cx = p.pos.x + p.width / 2, cy = p.pos.y + p.height / 2;
  const angle = frame * 0.3 + p.pos.x * 0.05;
  ctx.save();
  steppedGlow(ctx, cx, cy, 11, '#7FDBFF', 0.22, 0.05, 3);
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const outline = () => { ctx.beginPath(); ctx.moveTo(-9, -3); ctx.lineTo(10, 0); ctx.lineTo(-9, 4); ctx.lineTo(-5, 0); ctx.closePath(); };
  ctx.lineJoin = 'round';
  ctx.strokeStyle = ICE_INK; ctx.lineWidth = 2;
  outline(); ctx.stroke();
  // (the two sides of the ridge, each its step)
  ctx.fillStyle = iceStep(0, -1, angle);
  ctx.beginPath(); ctx.moveTo(-9, -3); ctx.lineTo(10, 0); ctx.lineTo(-5, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = iceStep(0, 1, angle);
  ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(10, 0); ctx.lineTo(-9, 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'; ctx.fillRect(-5, -0.5, 13, 1);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(6, -1, 2, 2);
  ctx.restore();
};

/** A boss frozen solid (Ernie hit by the shotgun mid-move): a block of ice around him, turning with him as he topples. */
export const drawIceEncasing = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  if (!e.frozenTimer || e.frozenTimer <= 0) return;
  const cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height / 2;
  const hw = e.width / 2 + 10, hh = e.height / 2 + 10;
  ctx.save();
  ctx.translate(cx, cy);
  if (e.rotation) ctx.rotate(e.rotation);
  ctx.shadowColor = '#7FDBFF';
  ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(170, 230, 255, 0.45)';
  ctx.beginPath();
  ctx.moveTo(-hw + 6, -hh); ctx.lineTo(hw - 4, -hh + 3); ctx.lineTo(hw, hh - 8); ctx.lineTo(hw - 10, hh);
  ctx.lineTo(-hw + 3, hh - 2); ctx.lineTo(-hw, -hh + 10);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#E8FBFF';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Facets and a glint
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-hw + 10, -hh + 6); ctx.lineTo(-hw * 0.2, -hh * 0.1); ctx.lineTo(hw - 12, hh - 10);
  ctx.moveTo(-hw * 0.2, -hh * 0.1); ctx.lineTo(-hw + 8, hh - 12);
  ctx.stroke();
  ctx.fillStyle = frame % 24 < 4 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(-hw + 12, -hh + 10, 8, 4);
  ctx.restore();
};
