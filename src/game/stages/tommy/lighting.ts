// Tommy's stage, lit. Out on the street it's late afternoon going on sunset
// (hardly any dark at the corner, a warm dusk by the end of the road). The
// sewer's dark: caged bulbs in the arches, the manhole's light down through
// the hole he came in by, the muck giving off a sick green glow of its own,
// and the thing in the cistern glowing with it. The tunnel's darker still. Up
// in the ruins it's dusk, the TV still flickering in what's left of the house;
// down at the bottom of the pit, a work light by Tommy's door.

import type { GameState } from '../../core/state';
import type { Light, SceneLight } from '../../render/lighting';
import { CANVAS_WIDTH, GROUND_Y, BOSS_DOOR_X } from '../../../constants';
import { COURSE, placeOf, WALK_Y, RUINS_Y } from './course';
import { getTommy } from './runtime';
import { eveningAt } from './streetDraw';
import { thingSpot } from './thing';
import { nearView, inArena } from '../lightKit';

const MUCK = 'rgba(132, 204, 22, 0.14)';

export const tommyScene = (state: GameState): SceneLight | null => {
  if (inArena(state)) return null;
  const rt = getTommy(state);
  if (!rt) return null;
  const place = placeOf(state.camera.x + CANVAS_WIDTH / 2);
  if (place === 'hood' || place === 'road') {
    const k = eveningAt(state.camera.x);
    return { dark: 0.04 + k * 0.2, shade: [60, 24, 40], lights: [] };
  }
  if (place === 'ruins') {
    const lights: Light[] = [];
    const H = COURSE.ruins.house;
    if (nearView(state, H)) lights.push({ x: H + 220, y: RUINS_Y - 28, r: 160, a: 0.8 + (state.frame % 6 < 3 ? 0.15 : 0), color: 'rgba(191, 219, 254, 0.14)' });
    // Down at the bottom: a work light by the door
    if (state.camera.y > RUINS_Y + 1200) lights.push({ x: BOSS_DOOR_X - 200, y: GROUND_Y - 260, r: 360, a: 0.9, cone: 170, color: 'rgba(253, 230, 138, 0.1)' });
    return { dark: state.camera.y > RUINS_Y + 1200 ? 0.4 : 0.26, shade: [30, 16, 44], lights };
  }
  // The sewer
  const S = COURSE.sewer;
  const lights: Light[] = [];
  for (let ax = Math.floor((state.camera.x - 400) / 420) * 420; ax < state.camera.x + CANVAS_WIDTH + 400; ax += 420) {
    if (ax < S.x1 || ax > S.x2 || (ax > S.tunnel.x1 - 100 && ax < S.tunnel.x2) || (ax > S.pit.x1 - 100 && ax < S.pit.x2)) continue;
    // (a caged bulb in each arch, the odd one on the blink)
    const blink = (ax / 420) % 5 === 0 && state.frame % 90 < 8 ? 0.3 : 1;
    lights.push({ x: ax + 210, y: WALK_Y - 230, r: 260, a: 0.8 * blink, color: 'rgba(253, 230, 138, 0.08)' });
  }
  if (nearView(state, S.drop)) lights.push({ x: S.drop, y: GROUND_Y - 300, r: 330, a: 0.95, cone: 110, color: 'rgba(253, 230, 138, 0.12)' });
  for (const c of COURSE.channels) {
    for (let x = c.x1 + 60; x < c.x2; x += 180) if (nearView(state, x)) lights.push({ x, y: c.surface + 10, r: 110, a: 0.55, color: MUCK });
  }
  if (rt.thing.e && rt.thing.phase !== 'dead') { const s = thingSpot(); lights.push({ x: s.x, y: s.y - 400, r: 420, a: 0.8, color: 'rgba(132, 204, 22, 0.16)' }); }
  const dark = place === 'tunnel' ? 0.58 : place === 'cistern' ? 0.42 : 0.46;
  return { dark, shade: [10, 18, 8], lights };
};
