// Bits the stages' lighting shares: what's in view, lava glowing along its
// surface, whether the camera's in the boss's room.

import type { GameState } from '../core/state';
import type { Light } from '../render/lighting';
import { CANVAS_WIDTH, ARENA_LEFT } from '../../constants';

/** Is world x anywhere near the screen? */
export const nearView = (state: GameState, x: number, pad = 350) => x > state.camera.x - pad && x < state.camera.x + CANVAS_WIDTH + pad;

/** The camera's in the boss's room (the stage's lighting gives way to the arena's). */
export const inArena = (state: GameState) => state.camera.x + CANVAS_WIDTH / 2 > ARENA_LEFT - 100;

/** Lava lighting up everything over it: a warm glow every so far along each lava run in view (breathing a little). */
export const lavaLights = (state: GameState, r = 190, a = 0.8): Light[] => {
  const out: Light[] = [];
  for (const run of state.groundRuns) {
    if (run.surface !== 'lava' || run.x2 < state.camera.x - 300 || run.x1 > state.camera.x + CANVAS_WIDTH + 300) continue;
    const n = Math.max(1, Math.round((run.x2 - run.x1) / 140));
    for (let i = 0; i < n; i++) {
      const x = run.x1 + (i + 0.5) * (run.x2 - run.x1) / n;
      if (!nearView(state, x)) continue;
      const y = run.y1 + (x - run.x1) / (run.x2 - run.x1) * (run.y2 - run.y1);
      out.push({ x, y: y - 10, r: r + Math.sin(state.frame * 0.05 + i * 1.7) * 14, a, color: 'rgba(249, 115, 22, 0.18)' });
    }
  }
  return out;
};

/** A row of lights along a stretch (ceiling lamps, a strip): every `step` from x1 to x2 at y. */
export const row = (state: GameState, x1: number, x2: number, step: number, y: number, l: Omit<Light, 'x' | 'y'>): Light[] => {
  const out: Light[] = [];
  for (let x = x1 + step / 2; x < x2; x += step) if (nearView(state, x)) out.push({ ...l, x, y });
  return out;
};
