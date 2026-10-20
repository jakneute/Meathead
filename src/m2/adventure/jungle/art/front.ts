// In front of everything: the nearest plants, between him and the screen (ferns, big leaves, grass), dark against the
// light, swaying, sliding by faster than the ground. Low: their tops stay under the ground line, never over his feet.

import type { GameState } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../../m1/constants';
import { timeOfDay, farTint } from '../../../timeOfDay';
import { stamp } from '../../../intro/art/kit';
import { SECTIONS } from '../../geometry';
import { PITS } from './ground';
import { type Ctx, INK, box, poly, mix, hash, fern, bigLeaf, leaf, LEAF, BARK, ROCK as ROCKS } from './paint';

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
    const kind = Math.floor(hash(i * 5.7) * 5), frame = kind > 2 ? 0 : Math.round((Math.sin(f * 0.03 + i * 1.7) * 0.5 + 0.5) * 3);
    const h = room * (0.75 + hash(i * 2.3) * 0.25);
    c.save(); c.translate(Math.round(sx), Math.round(base));
    stamp(c, `jg-fg-${kind}-${i % 4}-${frame}-${Math.round(h / 8)}-${tod.key}`, -110, -h - 30, 220, h + 40, g => {
      const sway = (frame - 1.5) * 0.06;
      if (kind === 0) fern(g, 0, 0, h * 1.1, i, sway, pal, 3);
      else if (kind === 1) for (let k = -2; k <= 2; k++) bigLeaf(g, k * 10, 0, h * 0.42, -Math.PI / 2 + k * 0.45 + sway, pal, k < 0 ? 4 : 3);
      else if (kind === 2) for (let k = 0; k < 14; k++) leaf(g, -40 + k * 6, 0, h * (0.5 + hash(k + i) * 0.5), -Math.PI / 2 + (k - 7) * 0.08 + sway * 1.5, pal, k % 3 ? 3 : 4);
      else if (kind === 3) {
        // (a mossy boulder, close and dark, ferns either side of it)
        const R = ROCKS.map(col => farTint(mix(col, '#000000', 0.55), 0.1, tod)), rh = h * 0.55;
        poly(g, [[-58, 1], [-50, -rh * 0.7], [-24, -rh], [16, -rh * 0.92], [44, -rh * 0.55], [56, 1]], INK);
        poly(g, [[-56, 0], [-48, -rh * 0.7 + 1], [-24, -rh + 1], [15, -rh * 0.92 + 1], [42, -rh * 0.55], [54, 0]], R[2]);
        poly(g, [[-48, -rh * 0.7 + 1], [-24, -rh + 1], [15, -rh * 0.92 + 1], [-4, -rh * 0.6], [-34, -rh * 0.4]], R[3]);
        poly(g, [[15, -rh * 0.92 + 1], [42, -rh * 0.55], [54, 0], [20, 0]], R[1]);
        for (let k = -40; k < 10; k += 4) if (hash(k + i) > 0.3) box(g, k, -rh * 0.9 + Math.abs(k + 14) * 0.12, 4, 3, pal[3]);
        fern(g, -60, 0, h * 0.7, i, sway, pal, 3); fern(g, 58, 0, h * 0.6, i + 3, sway, pal, 3);
      } else {
        // (a log, end on, close: its rings, moss up its side, a big leaf in front)
        const B = BARK.map(col => farTint(mix(col, '#000000', 0.5), 0.1, tod)), r = h * 0.32;
        box(g, -70, -r * 2 - 1, 80, r * 2 + 1, INK); box(g, -70, -r * 2, 80, r * 2, B[2]); box(g, -70, -r * 2, 80, r * 0.5, B[3]); box(g, -70, -r * 0.6, 80, r * 0.6, B[1]);
        g.fillStyle = INK; g.beginPath(); g.ellipse(10, -r, r * 0.6 + 1, r + 1, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = farTint(mix('#B08A5C', '#000000', 0.5), 0.1, tod); g.beginPath(); g.ellipse(10, -r, r * 0.6, r, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = farTint(mix('#7A5A38', '#000000', 0.5), 0.1, tod); g.lineWidth = 1; for (const k of [0.65, 0.35]) { g.beginPath(); g.ellipse(10, -r, r * 0.6 * k, r * k, 0, 0, Math.PI * 2); g.stroke(); }
        for (let k = -66; k < 0; k += 4) if (hash(k * 1.3 + i) > 0.35) box(g, k, -r * 2 - 2, 4, 3, pal[3]);
        bigLeaf(g, -20, 0, h * 0.3, -Math.PI / 2 - 0.3 + sway, pal, 3);
      }
    });
    c.restore();
  }
  c.restore();
};
