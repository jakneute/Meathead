// Ernie's San Francisco, at sunset: a warm pink-orange evening over the
// streets, the bridge and the bay (not dark: a tint of dusk over it all), the
// cars burning on the bridge lighting it up round them. Alcatraz's cell block
// is dim, cold and green, lit down through the skylights. The lab he's in is
// dim, lit by its screens and whatever's sparking.

import type { GameState } from '../../core/state';
import type { Light, SceneLight } from '../../render/lighting';
import { GROUND_Y } from '../../../constants';
import { COURSE } from './course';
import { regionOf } from './runtime';
import { nearView, inArena, row } from '../lightKit';

export const ernieScene = (state: GameState): SceneLight | null => {
  if (inArena(state)) return { dark: 0.26, shade: [16, 12, 8], lights: [] };
  const region = regionOf(state.camera.x + 400);
  if (region === 'cell') {
    const lights = row(state, COURSE.cellblock.x1, COURSE.cellblock.x2, 320, GROUND_Y - 470, { r: 470, a: 0.8, cone: 160, color: 'rgba(209, 250, 229, 0.08)' });
    return { dark: 0.36, shade: [8, 18, 16], lights };
  }
  const lights: Light[] = [];
  // The wrecks on the bridge, burning
  for (const w of COURSE.wrecks) if (nearView(state, w.x)) lights.push({ x: w.x, y: GROUND_Y - 50, r: 230 + Math.sin(state.frame * 0.3 + w.x) * 15, a: 0.9, color: 'rgba(249, 115, 22, 0.16)' });
  return { dark: region === 'bay' ? 0.14 : 0.1, shade: [52, 18, 44], lights };
};
