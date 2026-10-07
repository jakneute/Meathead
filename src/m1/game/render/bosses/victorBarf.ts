// Victor's fire barf: a stream out of his mouth, thin at his lips and fanning out, rolling flame along it.

import type { Enemy } from '../../../types';
import { BARF_WIDTH, victorMouth } from '../../bosses/victor';
import { chunky, ditherFill } from '../fx/fireball';

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
  // (worked out along the stream, then turned into the world, so it's painted chunky square to the screen whichever
  // way he's aiming)
  const ca = Math.cos(e.barfAngle), sa = Math.sin(e.barfAngle);
  const at = (x: number, y: number): [number, number] => [mx + x * ca - y * sa, my + x * sa + y * ca];
  const end = BARF_WIDTH.base + BARF_WIDTH.spread * (len / 900) + 30;
  const corners = [at(-20, -end), at(-20, end), at(len + 20, -end), at(len + 20, end)];
  const x0 = Math.min(...corners.map(c => c[0])), y0 = Math.min(...corners.map(c => c[1]));
  const x1 = Math.max(...corners.map(c => c[0])), y1 = Math.max(...corners.map(c => c[1]));
  chunky(ctx, x0, y0, x1 - x0, y1 - y0, g => {
    const band = (k: number, fill: string | CanvasPattern, wob: number) => {
      g.fillStyle = fill;
      g.beginPath(); g.moveTo(...at(0, -5 * k));
      for (let x = 0; x <= len; x += 12) g.lineTo(...at(x, -(BARF_WIDTH.base + BARF_WIDTH.spread * (x / 900)) * k - Math.sin(x * 0.08 - frame * 0.5 + wob) * 3 * k));
      for (let x = len; x >= 0; x -= 12) g.lineTo(...at(x, (BARF_WIDTH.base + BARF_WIDTH.spread * (x / 900)) * k + Math.sin(x * 0.09 - frame * 0.45 + wob) * 3 * k));
      g.closePath(); g.fill();
    };
    // The body of it: a dithered fringe, red edges, orange, yellow, a white-hot core, widening out
    band(1.18, ditherFill(g, '#B91C1C'), 1);
    const layers: [string, number][] = [['#991B1B', 1], ['#EA580C', 0.78], ['#F59E0B', 0.56], ['#FDE047', 0.36], ['#FEF9C3', 0.16]];
    for (const [color, k] of layers) band(k, color, 0);
    // Rolling balls of flame along it, each in steps
    for (let i = 0; i < 16; i++) {
      const x = ((frame * 9 + i * 57) % Math.max(1, len));
      const r = 5 + (x / 900) * 16, y = Math.sin(i * 1.7 + frame * 0.3) * r * 0.5;
      g.fillStyle = i % 2 ? '#F97316' : '#FBBF24'; g.beginPath(); g.arc(...at(x, y), r, 0, Math.PI * 2); g.fill();
      g.fillStyle = i % 2 ? '#FBBF24' : '#FDE047'; g.beginPath(); g.arc(...at(x - r * 0.2, y - r * 0.2), r * 0.55, 0, Math.PI * 2); g.fill();
    }
    // A white-hot flare right at his lips, where it comes out of him
    g.fillStyle = '#FDE047'; g.beginPath(); g.ellipse(...at(2, 0), 14, 9, e.barfAngle!, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FEF9C3'; g.beginPath(); g.ellipse(...at(4, 0), 9, 6 + Math.sin(frame * 0.7) * 1.5, e.barfAngle!, 0, Math.PI * 2); g.fill();
  });
};
