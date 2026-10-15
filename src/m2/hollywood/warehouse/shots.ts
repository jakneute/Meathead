// What's flying, drawn (world): the runners' coffee, craft services' food, the cast's props (each their own: the shield,
// the suction-cup arrows, the cork, the tiara, the rubber batarang, the foam dart), Spider-Teen's silly string.

import type { GameState } from '../../../m1/game/core/state';
import { box } from '../section';
import { whOf } from './state';
import { CAST } from './cast';

type Ctx = CanvasRenderingContext2D;

export const drawShots = (c: Ctx, state: GameState) => {
  for (const s of whOf(state).shots) {
    c.save(); c.translate(Math.round(s.x), Math.round(s.y));
    if (s.kind === 'string') {
      c.strokeStyle = '#F472B6'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0);
      for (let k = 1; k < 7; k++) c.lineTo(-Math.sign(s.vx || 1) * k * 5, Math.sin(k * 1.7 + s.t * 0.5) * 4);
      c.stroke();
      c.fillStyle = '#A3E635'; c.beginPath(); c.arc(0, 0, 4, 0, Math.PI * 2); c.fill();
      c.restore(); continue;
    }
    c.rotate(s.rot);
    if (s.kind === 'coffee') { box(c, -5, -6, 10, 12, '#000'); box(c, -4, -5, 8, 10, '#F5F5F4'); box(c, -5, -7, 10, 3, '#18181B'); box(c, -4, -2, 8, 3, '#A16207'); }
    else if (s.kind === 'food') {
      if (s.look === 0) { c.fillStyle = '#000'; c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F9A8D4'; c.beginPath(); c.arc(0, 0, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#92400E'; c.beginPath(); c.arc(0, 0, 2, 0, Math.PI * 2); c.fill(); }
      else if (s.look === 1) { box(c, -9, -4, 18, 8, '#000'); box(c, -8, -3, 16, 6, '#E7C27D'); box(c, -8, -3, 4, 6, '#16A34A'); }
      else { box(c, -7, -5, 14, 10, '#000'); box(c, -6, -4, 12, 8, '#FEF3C7'); box(c, -6, -4, 12, 3, '#F472B6'); }
    } else {
      const prop = CAST[s.look]?.prop;
      if (prop === 'shield') { c.rotate(-s.rot); for (const [r, col] of [[11, '#000'], [10, '#DC2626'], [7, '#F8FAFC'], [4, '#1D4ED8']] as const) { c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); } }
      else if (prop === 'bow') { c.rotate(-s.rot + Math.atan2(s.vy, s.vx)); box(c, -12, -1, 22, 2, '#78350F'); box(c, 10, -3, 4, 6, '#DC2626'); box(c, -14, -3, 4, 6, '#F8FAFC'); }
      else if (prop === 'batarang') { c.fillStyle = '#18181B'; c.beginPath(); c.moveTo(-10, -2); c.lineTo(-3, -1); c.lineTo(0, -5); c.lineTo(3, -1); c.lineTo(10, -2); c.lineTo(6, 4); c.lineTo(0, 1); c.lineTo(-6, 4); c.closePath(); c.fill(); }
      else if (prop === 'tiara') { c.fillStyle = '#FACC15'; c.beginPath(); c.moveTo(-8, 3); c.lineTo(0, -6); c.lineTo(8, 3); c.lineTo(0, 0); c.closePath(); c.fill(); box(c, -1, -2, 2, 2, '#DC2626'); }
      else if (prop === 'blaster') { box(c, -4, -3, 8, 6, '#A16207'); box(c, -4, -3, 2, 6, '#78350F'); }
      else if (prop === 'gun') { box(c, -6, -2, 12, 4, '#F97316'); box(c, 4, -2, 3, 4, '#2563EB'); }
      else { box(c, -6, -6, 12, 12, '#000'); box(c, -5, -5, 10, 10, '#A1A1AA'); }
    }
    c.restore();
  }
};
