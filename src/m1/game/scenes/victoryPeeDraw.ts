// Meathead relieving himself on a boss's corpse after a weakness kill
// (see victoryPee.ts): his meaty wiener, the arcing stream, the splash
// and a spreading yellow puddle.

import { GameState } from '../core/state';
import { peeProgress, PEE_SHAKE_FRAMES } from './victoryPee';

const SKIN = '#E0AC69';
const SKIN_SHADOW = '#C68B45';
const SKIN_HIGHLIGHT = '#F5D0A9';
const PEE = '#F2DA3A';
const PEE_LIGHT = '#FFF59D';

export const drawVictoryPee = (ctx: CanvasRenderingContext2D, state: GameState) => {
  const c = state.bossCorpse;
  const p = state.player;
  const { peeing, shaking, out, t } = peeProgress(p.peeTimer);
  if (!c || !out) return;
  const frame = state.frame;
  const f = p.facing;
  const feetX = p.pos.x + p.width / 2, feetY = p.pos.y + p.height;
  const tip = { x: feetX + f * 23, y: feetY - 19 };
  const target = { x: c.x + (Math.sin(frame * 0.07) * 10), y: c.y - 14 };

  ctx.save();
  // Spreading puddle under the corpse
  const pool = Math.min(1, t / 160);
  if (pool > 0) {
    ctx.fillStyle = 'rgba(242, 218, 58, 0.55)';
    ctx.beginPath();
    ctx.ellipse(c.x, c.y - 1, 12 + pool * 55, 3 + pool * 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 250, 200, 0.5)';
    ctx.beginPath();
    ctx.ellipse(c.x - 8, c.y - 3, 6 + pool * 18, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (peeing) {
    // The stream: a wobbling arc that grows out to the corpse, flowing
    const grow = Math.min(1, t / 12);
    const ctrl = { x: (tip.x + target.x) / 2, y: Math.min(tip.y, target.y) - 45 + Math.sin(frame * 0.3) * 4 };
    const at = (u: number) => ({
      x: (1 - u) * (1 - u) * tip.x + 2 * (1 - u) * u * ctrl.x + u * u * target.x,
      y: (1 - u) * (1 - u) * tip.y + 2 * (1 - u) * u * ctrl.y + u * u * target.y,
    });
    const trace = () => {
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) { const q = at((i / 20) * grow); if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); }
    };
    ctx.lineCap = 'round';
    ctx.strokeStyle = PEE;
    ctx.lineWidth = 3.5;
    trace(); ctx.stroke();
    ctx.strokeStyle = PEE_LIGHT;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 6]);
    ctx.lineDashOffset = -frame * 2.5;
    trace(); ctx.stroke();
    ctx.setLineDash([]);
    // Splash where it lands
    if (grow >= 1) {
      ctx.fillStyle = PEE;
      for (let k = 0; k < 5; k++) {
        const s = ((frame * 1.7 + k * 13) % 16) / 16;
        const dir = k % 2 === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.arc(target.x + dir * (4 + s * 14) * (0.5 + k * 0.2), target.y - Math.sin(s * Math.PI) * (8 + k * 2), 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // The whole of it out, pants round his ankles (local frame: feet centre, facing +x): the hair, his balls hanging, and
  // his meaty wiener, held out in both hands
  ctx.translate(feetX, feetY);
  ctx.scale(f, 1);
  const shake = shaking ? Math.sin(t * 2.2) * 0.35 : Math.sin(frame * 0.2) * 0.04;
  // (the hair: a dark thatch at the base of it, curls off the edges)
  ctx.fillStyle = '#2A170B';
  ctx.beginPath(); ctx.ellipse(4, -24, 5.5, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2A170B'; ctx.lineWidth = 0.7;
  for (let k = 0; k < 6; k++) { const a = -Math.PI + k * 0.6; ctx.beginPath(); ctx.arc(4 + Math.cos(a) * 5.5, -24 + Math.sin(a) * 3, 1, 0, Math.PI * 1.5); ctx.stroke(); }
  // (his balls: hanging under it, a bit swinging, one lower than the other, wrinkled, a few hairs)
  const swing = Math.sin(frame * 0.12) * 0.6 + (shaking ? Math.sin(t * 2.2) * 1.2 : 0);
  for (const [bx, by, r, c] of [[3.2, -16.6, 3.6, SKIN_SHADOW], [6.6, -17.6, 3.4, '#D39B5A']] as const) {
    ctx.fillStyle = c as string; ctx.beginPath(); ctx.ellipse(bx + swing * 0.5, by, r, r * 1.15, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120, 60, 25, 0.8)'; ctx.lineWidth = 0.6; ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(120, 60, 25, 0.6)'; ctx.lineWidth = 0.4;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(2 + k * 1.6 + swing * 0.5, -19); ctx.quadraticCurveTo(3 + k * 1.6 + swing * 0.5, -16.5, 2 + k * 1.6 + swing * 0.5, -14.5); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(5 + swing * 0.5, -19.5); ctx.lineTo(5 + swing * 0.5, -14); ctx.stroke(); // (the seam)
  ctx.save();
  ctx.translate(6, -21);
  ctx.rotate(0.12 + shake);
  ctx.scale(1.4, 1.4); // it's Meathead, after all
  // The shaft
  ctx.fillStyle = SKIN;
  ctx.strokeStyle = SKIN_SHADOW;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(0, -2.8, 8.6, 5.6, 2.2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = SKIN_HIGHLIGHT; ctx.fillRect(1, -2.1, 6, 1.1);
  ctx.strokeStyle = '#B45309';                                                                  // a vein, naturally
  ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(1, 1.5); ctx.quadraticCurveTo(4, 0.3, 7.6, 1.6); ctx.stroke();
  // The head: rounder, a shade pinker, the ridge where it meets the shaft, the slit at the end
  ctx.fillStyle = '#D9876E';
  ctx.beginPath(); ctx.moveTo(8, -3.4); ctx.quadraticCurveTo(13.2, -3.6, 13.2, 0); ctx.quadraticCurveTo(13.2, 3.6, 8, 3.4); ctx.quadraticCurveTo(9.2, 0, 8, -3.4); ctx.fill();
  ctx.strokeStyle = '#A0523D'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = 'rgba(255, 220, 205, 0.7)'; ctx.fillRect(9.6, -2.6, 2, 0.9);
  ctx.strokeStyle = '#6E2A1C'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(13, -0.9); ctx.lineTo(13, 0.9); ctx.stroke();
  // Both hands holding it (the arms reaching down are drawn with Meathead)
  ctx.scale(1 / 1.4, 1 / 1.4);
  for (const [hx, shade] of [[1.5, SKIN_SHADOW], [6.5, SKIN]] as const) {
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(hx, 0, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8A5A2B';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(hx - 2, -3); ctx.lineTo(hx - 2, 3); ctx.moveTo(hx + 1, -3.5); ctx.lineTo(hx + 1, 3.5); ctx.stroke(); // knuckles
  }
  ctx.scale(1.4, 1.4);
  // Last drips during the shake
  if (shaking) {
    ctx.fillStyle = PEE;
    const d = (t % PEE_SHAKE_FRAMES) / PEE_SHAKE_FRAMES;
    ctx.beginPath();
    ctx.arc(13, 2 + d * 14, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
};
