// Artie's mountain at night, under the northern lights: moonlit snow, a cold
// blue dark over it all (snow throws a lot of light back, so not much of one).
// The lights up here are few and warm: the tram stations' lamps, the cabin's
// lanterns as it rides, the ranger cabin's windows at the bottom. His ice
// fortress is lit its own cold blue.

import type { GameState } from '../../core/state';
import type { Light, SceneLight } from '../../render/lighting';
import { COURSE } from './course';
import { CABIN_W, CABIN_H } from './tram';
import { getArtie } from './runtime';
import { caveRoofAt } from './draw';
import { nearView, inArena } from '../lightKit';

const WARM = 'rgba(253, 186, 116, 0.16)';

export const artieScene = (state: GameState): SceneLight | null => {
  if (inArena(state)) return { dark: 0.22, shade: [6, 24, 48], lights: [] };
  const rt = getArtie(state);
  const lights: Light[] = [];
  // The stations, top and bottom: a lamp over each platform
  for (const [x, y] of [[COURSE.tram.x, COURSE.tram.y], [COURSE.tram.toX, COURSE.tram.toY]]) if (nearView(state, x + CABIN_W / 2)) lights.push({ x: x + CABIN_W / 2, y: y - CABIN_H - 30, r: 340, a: 0.9, color: WARM });
  // The tram cabin's lanterns, riding with it
  if (rt && nearView(state, rt.tram.x + CABIN_W / 2)) for (const k of [0.25, 0.75]) lights.push({ x: rt.tram.x + CABIN_W * k, y: rt.tram.y - CABIN_H + 30, r: 230, a: 0.85, color: WARM });
  // The ranger cabin's windows at the bottom of the run
  if (nearView(state, COURSE.cabin.x)) lights.push({ x: COURSE.cabin.x + 160, y: COURSE.cabin.y - 90, r: 300, a: 0.85, color: WARM });
  // In the ice cave: darker, bluer, lit by the crystals in the walls (going in, it comes on over a stretch, not all
  // at once the moment the middle of the screen's past the mouth; and the crystals are lit whenever they're in view)
  const cx = state.camera.x + 400, C = COURSE.cave;
  for (let x = Math.floor((cx - 600) / 310) * 310 + 120; x < cx + 600; x += 310) if (x > C.x1 && x < C.x2) lights.push({ x, y: caveRoofAt(x) + 150, r: 200, a: 0.8, color: 'rgba(103, 232, 249, 0.14)' });
  const k = Math.max(0, Math.min(1, (cx - C.x1 + 200) / 500, (C.x2 - cx + 200) / 500));
  const mixed = (a: number, b: number) => Math.round(a + (b - a) * k);
  return { dark: 0.36 + 0.14 * k, shade: [mixed(10, 4), mixed(18, 16), mixed(52, 48)], lights };
};
