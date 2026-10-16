// Draws the drowned (see game/enemies/drownDeath.ts): the one that died, as itself, turned about its middle (upright and
// thrashing, then over onto its face, butt up), the arms going up out of the water while it flails (people), swelling
// up before it bursts. The water's drawn over it by the stage (its front), so it's in it, not on it.

import type { GameState } from '../../core/state';
import type { EnemyDeath } from '../../enemies/deaths';
import { DROWN_FLAIL, DROWN_SWELL, DROWN_BURST } from '../../enemies/drownDeath';
import type { BodyOpts } from './deaths';
import { isHumanoidKind } from './index';

type Ctx = CanvasRenderingContext2D;
type Body = (ctx: Ctx, d: EnemyDeath, state: GameState, o?: BodyOpts) => void;

const SKIN = ['#F5D0A9', '#E0AC69', '#C68B59', '#8D5524', '#F1C27D'];

export const drawDrowned = (ctx: Ctx, d: EnemyDeath, state: GameState, body: Body) => {
  const dw = d.dw;
  if (!dw) return;
  const t = d.t, cx = d.x + d.w / 2, cy = dw.cy;
  // (swelling up, wobbling, before it goes)
  const sw = t > DROWN_SWELL ? Math.min(1, (t - DROWN_SWELL) / (DROWN_BURST - DROWN_SWELL)) : 0;
  const sx = 1 + 0.24 * sw * sw + Math.sin(t * 0.9) * 0.035 * sw, sy = sx * (1 + Math.sin(t * 0.9 + 1.5) * 0.03 * sw);
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(dw.rot); ctx.scale(sx, sy); ctx.translate(-cx, -cy);
  body(ctx, d, state);
  if (t < DROWN_FLAIL + 6 && d.sprite && isHumanoidKind(d.sprite.kind)) {
    // Both arms up out of the water, waving
    const skin = SKIN[Math.abs(Math.round(d.sprite.seed ?? d.sprite.phase)) % SKIN.length];
    ctx.strokeStyle = skin; ctx.fillStyle = skin; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      const ax = cx + s * d.w * 0.32, ay = d.y + d.h * 0.27;
      const a = -Math.PI / 2 + s * 0.55 + Math.sin(t * 0.7 + (s > 0 ? 1.6 : 0)) * 0.7;
      const ex = ax + Math.cos(a) * 22, ey = ay + Math.sin(a) * 22;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillRect(Math.round(ex) - 4, Math.round(ey) - 4, 8, 8);
    }
  }
  ctx.restore();
};
