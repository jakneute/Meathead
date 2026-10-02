// Victor's fire barf: a stream out of his mouth, thin at his lips and fanning out, rolling flame along it.

import type { Enemy } from '../../../types';
import { BARF_WIDTH, victorMouth } from '../../bosses/victor';

export const drawVictorBarf = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const len = e.barfLen ?? 0;
  if (e.bossState !== 'barfing' || e.barfAngle === undefined) return;
  // (out of his mouth, wherever his head's turned to)
  const { x: mx, y: my } = victorMouth(e);
  // (winding up: his mouth glows)
  if (len <= 0) {
    ctx.save(); ctx.fillStyle = `rgba(255, 179, 0, ${0.4 + Math.sin(frame * 0.6) * 0.3})`;
    ctx.beginPath(); ctx.arc(mx, my, 7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(mx, my); ctx.rotate(e.barfAngle);
  // The body of it: red edges, orange, a yellow-white core, widening out
  const layers: [string, number][] = [['rgba(183, 28, 28, 0.55)', 1], ['rgba(255, 109, 0, 0.75)', 0.72], ['rgba(255, 214, 0, 0.85)', 0.42], ['rgba(255, 253, 231, 0.9)', 0.16]];
  for (const [color, k] of layers) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, -5 * k);
    for (let x = 0; x <= len; x += 12) ctx.lineTo(x, -(BARF_WIDTH.base + BARF_WIDTH.spread * (x / 900)) * k - Math.sin(x * 0.08 - frame * 0.5) * 3 * k);
    for (let x = len; x >= 0; x -= 12) ctx.lineTo(x, (BARF_WIDTH.base + BARF_WIDTH.spread * (x / 900)) * k + Math.sin(x * 0.09 - frame * 0.45) * 3 * k);
    ctx.closePath(); ctx.fill();
  }
  // A white-hot flare right at his lips, where it comes out of him
  ctx.fillStyle = 'rgba(255, 253, 231, 0.9)'; ctx.beginPath(); ctx.ellipse(4, 0, 9, 6 + Math.sin(frame * 0.7) * 1.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 214, 0, 0.6)'; ctx.beginPath(); ctx.ellipse(2, 0, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
  // Rolling balls of flame along it
  for (let i = 0; i < 16; i++) {
    const x = ((frame * 9 + i * 57) % Math.max(1, len));
    const r = 5 + (x / 900) * 16;
    ctx.fillStyle = i % 2 ? 'rgba(255, 145, 0, 0.8)' : 'rgba(255, 235, 59, 0.8)';
    ctx.beginPath(); ctx.arc(x, Math.sin(i * 1.7 + frame * 0.3) * r * 0.5, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};
