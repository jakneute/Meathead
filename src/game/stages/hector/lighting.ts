// Hector's Miami: broad daylight on the beach, then the hurricane comes in and
// it goes dark as dusk under the clouds, blue-grey; the motels' neon signs come
// into their own (flickering in the storm), and every lightning strike lights
// the lot up white for a moment. Up inside the storm it's dark and it's
// everywhere; the Eye's arena is lit by what light gets in round the edges.
// After, sunshine (the daycare's lit as it's drawn). Hector's own studio is
// lit for TV.

import type { GameState } from '../../core/state';
import type { Light, SceneLight } from '../../render/lighting';
import { COURSE } from './course';
import { getHector, regionOf } from './runtime';
import { STRIKE_WARN, STRIKE_FLASH } from './hazards';
import { nearView, inArena } from '../lightKit';

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rgba = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${a})`;

export const hectorScene = (state: GameState): SceneLight | null => {
  if (inArena(state)) return null;
  const rt = getHector(state);
  if (!rt) return null;
  const region = regionOf(state.camera.x + 400);
  if (region === 'daycare') return null;
  if (region === 'tower') return { dark: 0.42, shade: [6, 10, 26], lights: [] };
  if (region === 'eye') return { dark: 0.3, shade: [8, 12, 30], lights: [] };
  const storm = rt.beach.storm;
  if (storm <= 0.02) return null;
  const f = state.frame;
  const lights: Light[] = [];
  // Neon on the motels and the marina, flickering the way the signs do
  for (const p of COURSE.props) {
    if (p.look !== 'sign' || !nearView(state, p.x)) continue;
    if (Math.floor(f / (6 + hash(p.x) * 20)) % 9 === 0) continue;
    lights.push({ x: p.x, y: p.y - 188, r: 180, a: 0.85 * storm, color: rgba(p.color ?? '#F43F5E', 0.16) });
  }
  // Lightning: the ground lit where it's about to hit, then everything, white, for a moment
  let flash = 0;
  for (const s of rt.hazards.strikes) {
    if (s.t >= STRIKE_WARN && s.t < STRIKE_WARN + STRIKE_FLASH) {
      flash = Math.max(flash, 1 - (s.t - STRIKE_WARN) / STRIKE_FLASH);
      lights.push({ x: s.x, y: s.ground - 200, r: 700, a: 1, color: 'rgba(224, 242, 254, 0.2)' });
    } else if (s.t > STRIKE_WARN - 30 && s.t < STRIKE_WARN) lights.push({ x: s.x, y: s.ground - 10, r: 90, a: 0.6, color: 'rgba(224, 242, 254, 0.12)' });
  }
  return { dark: 0.36 * storm * (1 - flash * 0.8), shade: [8, 14, 32], lights };
};
