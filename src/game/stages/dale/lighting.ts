// Dale's desert at sunset: a warm dusky tint over the dunes, the highway and
// the town (it's golden hour the whole way). The cartel's warehouse is dark
// inside, lit in pools by the strip lights hung on chains (one on the blink);
// the office up the stairs is a little brighter. The pharmacy's fluorescent:
// lit as drawn.

import type { GameState } from '../../core/state';
import type { Light, SceneLight } from '../../render/lighting';
import { GROUND_Y } from '../../../constants';
import { COURSE } from './course';
import { regionOf } from './runtime';
import { nearView, inArena } from '../lightKit';

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export const daleScene = (state: GameState): SceneLight | null => {
  if (inArena(state)) return null;
  const region = regionOf(state.camera.x + 400);
  const W = COURSE.warehouse, O = COURSE.office;
  const cx = state.camera.x + 400;
  if (region === 'desert' && cx > W.x1 && cx < O.x2 + 200) {
    const lights: Light[] = [];
    // The strip lights (the same spots the warehouse draws them, flickering with them)
    for (let x = W.x1 + 120; x < W.x2; x += 260) {
      if (!nearView(state, x + 90)) continue;
      const flick = hash(x + Math.floor(state.frame / 7)) > 0.97 ? 0.3 : 1;
      lights.push({ x: x + 90, y: W.ceiling + 36, r: GROUND_Y - W.ceiling - 36, a: 0.9 * flick, cone: 110, color: 'rgba(254, 249, 195, 0.1)' });
    }
    // The office: a lamp over the desk, the window's light
    if (nearView(state, O.desk)) lights.push({ x: O.desk + 40, y: O.floor - 150, r: 320, a: 0.8, color: 'rgba(254, 240, 138, 0.08)' });
    if (nearView(state, O.window)) lights.push({ x: O.window - 30, y: O.floor - 140, r: 260, a: 0.8, color: 'rgba(253, 186, 116, 0.1)' });
    return { dark: state.player.pos.y + state.player.height <= O.floor + 4 && state.player.pos.x > O.x1 ? 0.24 : 0.42, shade: [14, 10, 6], lights };
  }
  return { dark: 0.1, shade: [60, 20, 36], lights: [] };
};
