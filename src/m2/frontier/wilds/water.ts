// The wilds' water: the pond, the creek's pools, the rapids' channels, the long river (layout.ts WATERS). He swims in it
// (the stage's waterBodyAt); a step just under the surface at each end to climb out by; walkers keep out of it (a danger
// zone: hazardHit.ts) and drown if they're knocked in (drown.ts). The rapids' and the river's current carries a
// swimmer downstream; at the river's end, the log boom, and under it the pull over the falls (the falls are logs.ts's).
//
// Drawn crude: the dug-out going back (its far bank in dirt and fake rock), the water's body (banded deeper), and over
// whoever's in it the water's front (see-through, its lit surface line, foam streaks on the rapids running downstream).

import type { GameState } from '../../../m1/game/core/state';
import type { WaterBody } from '../../../m1/game/stages/index';
import { ledge } from '../section';
import { setHazardZones } from '../../hazardHit';
import { GY } from '../geometry';
import { box, mix, hash, onScreen, type Ctx } from '../kit';
import { WATERS, BED, type Water } from './layout';

export const surfaceY = (w: Water) => GY + w.surface;

/** The water at (x, y), if any (from a little over its surface down). */
export const waterAt = (x: number, y: number): WaterBody | null => {
  for (const w of WATERS) if (x > w.a && x < w.b && y > surfaceY(w) - 14 && y < GY + BED + 10) return { key: w.key, x1: w.a, x2: w.b, surface: surfaceY(w), bottom: GY + BED, kind: 'clean' };
  return null;
};
export const waterOf = (x: number) => WATERS.find(w => x > w.a && x < w.b) ?? null;

/** The steps out at each end (just under the surface). */
export const layWaterSteps = (state: GameState) => {
  for (const w of WATERS) {
    ledge(state, w.a, surfaceY(w) + 26, 50, { hidden: true, tag: `${w.key}-step` });
    if (!w.boom) ledge(state, w.b - 50, surfaceY(w) + 26, 50, { hidden: true, tag: `${w.key}-step` });
  }
};

/** Walkers keep out of the water (they stop at the edge); every frame. */
export const waterZones = (state: GameState) =>
  setHazardZones(state, 'fr-water', WATERS.map(w => ({ x0: w.a, x1: w.boom ? (w.fallsTo ?? w.b) : w.b, y0: GY - 4, y1: GY + BED, ground: true })));

/** A swimmer in moving water is carried downstream (the rapids hard, the river gently, the pull at the boom hard). */
export const carrySwimmer = (state: GameState) => {
  const p = state.player;
  if (!p.swimming || p.health <= 0) return;
  const w = waterOf(p.pos.x + p.width / 2);
  if (!w || !w.current) return;
  const pull = w.boom && p.pos.x + p.width / 2 > w.boom - 220 ? 1.7 : 0;
  p.pos.x += w.current * 0.8 + pull;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const WATER = '#3A7CA8', DEEP = '#1E3F66', RAPID = '#4A90B8';

/** Behind everything: the dug-out (its far bank going down, the bed), the water's body under the surface. */
export const drawWaterBack = (c: Ctx, state: GameState) => {
  for (const w of WATERS) {
    if (!onScreen(state, w.a, w.b)) continue;
    const s = surfaceY(w), col = w.rapids ? RAPID : WATER;
    // (the far bank: dirt going down to the water, fake rock in it, darker under the water line)
    box(c, w.a, GY, w.b - w.a, s - GY, '#5A3E24'); box(c, w.a, GY, w.b - w.a, 2, '#7A9A4A');
    for (let x = w.a + 20; x < w.b - 20; x += 90) box(c, x + hash(x) * 30, GY + 6, 26 + hash(x * 3) * 20, 10, '#8A8478');
    // (the water's body, banded deeper)
    const bands = [col, mix(col, DEEP, 0.35), mix(col, DEEP, 0.7), DEEP];
    for (let i = 0; i < bands.length; i++) box(c, w.a, s + (i * (BED - w.surface)) / bands.length, w.b - w.a, (BED - w.surface) / bands.length + 1, bands[i]);
    // (the bed: stones)
    box(c, w.a, GY + BED, w.b - w.a, 400, '#3A3020');
    for (let x = w.a; x < w.b; x += 22) box(c, x + hash(x * 1.7) * 10, GY + BED - 5, 12, 6, '#5A5040');
    // (the submerged rocks, dark humps just under the surface)
    for (const r of w.rocks ?? []) { c.fillStyle = '#2A3440'; c.beginPath(); c.ellipse(r, s + 18, 34, 14, 0, Math.PI, 0); c.fill(); box(c, r - 30, s + 18, 60, BED - w.surface, '#2A3440'); }
    // (the ends: the banks' faces)
    box(c, w.a - 4, GY, 6, BED, '#4A3420'); box(c, w.b - 2, GY, 6, BED, '#4A3420');
    // (the steps out: lit lips)
    box(c, w.a, s + 26, 50, 6, '#6B5A3A'); box(c, w.a, s + 26, 50, 2, '#A89060');
    if (!w.boom) { box(c, w.b - 50, s + 26, 50, 6, '#6B5A3A'); box(c, w.b - 50, s + 26, 50, 2, '#A89060'); }
  }
};

/** Over whoever's in it: the water's front, see-through, its surface line lit, the rapids' foam running downstream. */
export const drawWaterFront = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const w of WATERS) {
    if (!onScreen(state, w.a, w.b)) continue;
    const s = surfaceY(w), col = w.rapids ? RAPID : WATER;
    const xa = Math.max(w.a, state.camera.x - 40), xb = Math.min(w.b, state.camera.x + 840);
    c.globalAlpha = 0.55;
    box(c, xa, s + 6, xb - xa, BED - w.surface - 6, mix(col, DEEP, 0.4));
    c.globalAlpha = 1;
    // (the surface: a lit line that ripples, the highlight drifting with the current)
    for (let x = Math.floor((xa - w.a) / 6) * 6 + w.a; x < xb; x += 6) {
      const lift = Math.sin(f * 0.07 + x * 0.04) * (w.rapids ? 3 : 1.5), y = Math.round(s - lift);
      box(c, x, y, 6, 3, mix(col, '#FFFFFF', 0.45)); box(c, x, y + 3, 6, 3, mix(col, '#FFFFFF', 0.15));
      const drift = (x - w.a - f * (w.current * 1.5 + 0.2)) / 6;
      if (((Math.floor(drift) % 11) + 11) % 11 === 0) box(c, x, y - 1, 6, 1, '#FFFFFF');
    }
    // (the rapids: white foam streaks running downstream, and round the submerged rocks)
    if (w.rapids || w.current > 0.4) for (let k = 0; k < (xb - xa) / 40; k++) {
      const len = 18 + hash(k * 2.1) * 26, sx = xa + ((hash(k * 1.3 + w.a) * (xb - xa) + f * w.current * 3) % (xb - xa)), sy = s + 3 + hash(k * 5.3) * 20;
      box(c, sx, sy, len, 2, w.rapids ? '#E8F4FA' : 'rgba(232, 244, 250, 0.6)');
    }
    for (const r of w.rocks ?? []) for (let i = 0; i < 5; i++) box(c, r - 30 + ((i * 17 + f) % 60), s - 2 + (i % 2) * 2, 8, 3, '#FFFFFF');
  }
};
