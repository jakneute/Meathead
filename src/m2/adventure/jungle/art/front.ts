// In front of everything: the nearest plants, between him and the screen (ferns, big leaves, grass), dark against the
// light, swaying, sliding by faster than the ground. Low: their tops stay under the ground line, never over his feet.

import type { GameState } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../../m1/constants';
import { timeOfDay, farTint } from '../../../timeOfDay';
import { stamp } from '../../../intro/art/kit';
import { SECTIONS } from '../../geometry';
import { PITS } from './ground';
import { type Ctx, mix, hash, fern, bigLeaf, leaf, LEAF } from './paint';

const K = 1.32, GAP = 210;

export const drawJungleFront = (c: Ctx, state: GameState) => {
  const cam = state.camera, f = state.frame;
  // (where the ground line is on screen: the plants stand well below it)
  const line = GROUND_Y - cam.y;
  const base = line + 116;
  if (base - 100 > CANVAS_HEIGHT) return;
  const room = Math.max(30, Math.min(92, base - (line + 20)));
  const tod = timeOfDay();
  const pal = LEAF.map(col => farTint(mix(col, '#000000', 0.5), 0.1, tod));
  const rx = cam.x - SECTIONS.jungle.x0, eyeX = cam.x + CANVAS_WIDTH / 2;
  c.save(); c.translate(cam.x, cam.y);
  for (let i = Math.floor((rx * K - 200) / GAP); i * GAP < rx * K + CANVAS_WIDTH + 200; i++) {
    const sx = i * GAP + hash(i * 3.1) * 120 - rx * K;
    if (sx < -120 || sx > CANVAS_WIDTH + 120) continue;
    // (none in front of a ravine: there's no ground there to grow out of)
    const wx = eyeX + (cam.x + sx - eyeX) / K;
    if (PITS.some(p => wx > p.a - 40 && wx < p.b + 40)) continue;
    const kind = Math.floor(hash(i * 5.7) * 3), frame = Math.round((Math.sin(f * 0.03 + i * 1.7) * 0.5 + 0.5) * 3);
    const h = room * (0.75 + hash(i * 2.3) * 0.25);
    c.save(); c.translate(Math.round(sx), Math.round(base));
    stamp(c, `jg-fg-${kind}-${i % 4}-${frame}-${Math.round(h / 8)}-${tod.key}`, -110, -h - 30, 220, h + 40, g => {
      const sway = (frame - 1.5) * 0.06;
      if (kind === 0) fern(g, 0, 0, h * 1.1, i, sway, pal, 3);
      else if (kind === 1) for (let k = -2; k <= 2; k++) bigLeaf(g, k * 10, 0, h * 0.42, -Math.PI / 2 + k * 0.45 + sway, pal, k < 0 ? 4 : 3);
      else for (let k = 0; k < 14; k++) leaf(g, -40 + k * 6, 0, h * (0.5 + hash(k + i) * 0.5), -Math.PI / 2 + (k - 7) * 0.08 + sway * 1.5, pal, k % 3 ? 3 : 4);
    });
    c.restore();
  }
  c.restore();
};
