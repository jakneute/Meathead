// The backlot, drawn (the final pass: peak SNES, fake 3D, the boulevard's one eye). The backdrop (far.ts): the sky by
// the hour (gone red with ash once the real disasters are on, the city burning), the mountains, the HAPPYWOOD hill, the
// city, the studio's far sheds and its palms, and nearest the backlot's own soundstages across the lot. In the world,
// back to front: the lot strip behind the fronts; the ground going back stretch by stretch and the holes going back
// through it (ground.ts), the flood tank's (effects.ts); the fronts, braced from behind, the gift shop and the ride's
// building (fronts.ts); Steve's posters; the dump tank's tower; everything standing on the ground, farthest first, the
// guests reading the leak among it (props.ts); the rain rig; the warehouse's smashed far wall at the start; the street at
// the play plane, bent; the wet on it; what he stands on, lit along its lips; the script's pages blowing about.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { realDisastersOn } from '../section';
import { GY } from '../geometry';
import { X, DUMP, GIFT, LOT_BOARDED_MEMO } from './layout';
import { type Ctx, INK, box, at, viewOf, seen, hash } from '../blvd/kit';
import { drawLotStrip, bentX, bentK } from '../blvd/ground';
import { drawLotFar } from './far';
import { drawLotPavement, drawLotHoles, drawLotStreet } from './ground';
import { drawLotFronts, drawGiftShop, drawGiftFront, drawRideMarquee, rideGlow, drawWallBreak } from './fronts';
import { drawLotStanding, drawLotPosters, drawLotPlayThings, standingLights } from './props';
import { drawRainRig, drawRainPuddles, drawTankHole, drawDumpTower } from './effects';

export const drawLotBackdrop = (c: Ctx, state: GameState) => { drawLotFar(c, state); return true; };

/** The script's pages: lying about on the ground going back (more near the dumpster), and blowing along down the lot. */
const pagesLying = (c: Ctx, state: GameState) => {
  const v = viewOf(state), eye = v.eye;
  for (let rx = DUMP.a - 100, k = 0; rx < 2600; rx += 70 + ((rx * 7) % 50), k++) {
    const d = 0.9 + hash(k * 1.7) * 0.085;
    if (!seen(v, X(rx) - 10, X(rx) + 20, d)) continue;
    const [sx, sy] = at(eye, X(rx), GY, d), w = Math.round(12 * d), h = Math.max(2, Math.round(4 * d));
    box(c, sx - 1, sy - h - 1, w + 2, h + 2, INK); box(c, sx, sy - h, w, h, '#F5F5F4'); box(c, sx + 2, sy - h + 1, w - 4, 1, '#A8A29E');
  }
};
const pagesBlowing = (c: Ctx, state: GameState) => {
  const f = state.frame, cam = state.camera.x;
  for (let k = 0; k < 18; k++) {
    const span = 1800, px0 = X(DUMP.a) + ((k * 211 + f * (0.8 + (k % 4) * 0.3)) % span);
    if (px0 < cam - 20 || px0 > cam + 820) continue;
    const py = GY - 60 - ((k * 71) % 260) + Math.sin(f * 0.05 + k) * 20, flip = Math.cos(f * 0.11 + k);
    c.save(); c.translate(px0, py); c.rotate(Math.sin(f * 0.08 + k) * 0.8); c.scale(Math.abs(flip) < 0.2 ? 0.2 : flip, 1);
    box(c, -7, -9, 14, 18, INK); box(c, -6, -8, 12, 16, flip > 0 ? '#F8FAFC' : '#D8D4CC'); box(c, -6, -8, 12, 2, '#FFFFFF');
    if (flip > 0) { box(c, -4, -5, 8, 1, '#78716C'); box(c, -4, -2, 8, 1, '#78716C'); box(c, -4, 1, 6, 1, '#78716C'); box(c, -4, 4, 7, 1, '#78716C'); }
    c.restore();
  }
};

export const drawLotBack = (c: Ctx, state: GameState) => {
  const v = viewOf(state), f = state.frame, real = realDisastersOn(state);
  drawLotStrip(c, v);
  drawLotPavement(c, v);
  drawLotHoles(c, v);
  drawTankHole(c, v, state);
  pagesLying(c, state);
  drawLotFronts(c, v);
  drawGiftShop(c, v);
  drawRideMarquee(c, v, f);
  drawLotPosters(c, v);
  drawDumpTower(c, v, state);
  drawLotStanding(c, v, f);
  drawRainRig(c, v, state);
  drawGiftFront(c, v);
  drawWallBreak(c, v, state.stageMemo[LOT_BOARDED_MEMO] === '1');
  drawLotStreet(c, v);
  drawRainPuddles(c, state);
  if (real) {
    // (the weather's got in: puddles of ash-gray water on the near street, stepped)
    // (laid on the bent street: fanned out to where their spots are at their rows, culled by where they land)
    for (let rx = 200; rx < 9000; rx += 260) {
      const py = GY + 20 + (rx % 3) * 20, px = Math.round(bentX(v, X(rx), py)), sk = bentK(py);
      if (px < v.v0 - 60 || px > v.v1 + 60) continue;
      for (let r = 0; r < 5; r++) { const hw = Math.round(40 * sk * Math.sqrt(Math.max(0, 1 - ((2 * (r + 0.5)) / 5 - 1) ** 2))); box(c, px - hw, py + r, hw * 2, 1, r ? 'rgba(90, 84, 80, 0.6)' : 'rgba(168, 160, 152, 0.7)'); }
    }
  }
  drawLotPlayThings(c, v, f);
  pagesBlowing(c, state);
};

/** Lit after dark: the ride's marquee, the gift shop's fascia, the gate, the PA poles. */
export const lotLamps = (state: GameState): Light[] => {
  const v = viewOf(state), [rx, ry] = rideGlow(v);
  return [
    { x: rx, y: ry, r: 280, a: 0.9, color: '#F97316' },
    { x: X((GIFT.a + GIFT.b) / 2), y: GY - 336, r: 240, a: 0.8, color: '#FDE68A' },
    ...standingLights(v),
  ];
};
