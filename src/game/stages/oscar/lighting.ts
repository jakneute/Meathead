// Oscar's stage, lit. Out in the field it's late afternoon, the light going
// orange, the flare stacks burning. The break room's lit by its tubes (and
// then by the fire). On the chase the field burns brighter and darker the more
// of it's been set alight; behind the field office it's all smoke and fire.

import type { GameState } from '../../core/state';
import type { Light, SceneLight } from '../../render/lighting';
import { CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { groundLineAt } from '../../core/terrain';
import { COURSE, placeOf } from './course';
import { getOscar } from './runtime';
import { nearView, inArena } from '../lightKit';
import { roomIntact } from './bunker';
import { burnLevel } from './field';

export const oscarScene = (state: GameState): SceneLight | null => {
  if (inArena(state)) return null;
  const rt = getOscar(state);
  if (!rt) return null;
  const place = placeOf(state.camera.x + CANVAS_WIDTH / 2);
  const lights: Light[] = [];
  if (place === 'field' || place === 'bunker' || place === 'outside') {
    for (const p of COURSE.props) if (p.look === 'flare' && nearView(state, p.x)) lights.push({ x: p.x, y: p.y - 200, r: 260, a: 0.8 + Math.sin(state.frame * 0.3) * 0.08, color: 'rgba(249, 115, 22, 0.14)' });
    for (const o of rt.field.oil) { const k = burnLevel(o); if (k > 0) lights.push({ x: (o.x1 + o.x2) / 2, y: groundLineAt(state.groundRuns, o.x1) - 30, r: 180 + (o.x2 - o.x1) / 2, a: k, color: 'rgba(249, 115, 22, 0.18)' }); }
    const B = COURSE.bunker;
    if (nearView(state, B.x1, 200) && roomIntact(rt.bunker)) for (const x of [B.x1 + 180, B.x1 + 520]) lights.push({ x, y: B.roof + 20, r: 260, a: 0.8, color: 'rgba(224, 242, 254, 0.08)' });
    return { dark: 0.1, shade: [70, 30, 20], lights };
  }
  if (place === 'chase') {
    const burning = rt.chase.far.filter(f => f.state === 'blowing' || f.state === 'burning').length;
    return { dark: 0.1 + burning * 0.025, shade: [60, 22, 14], lights };
  }
  // Out back of the field office: the whole field's going up behind it
  return { dark: 0.3, shade: [60, 20, 12], lights: [{ x: COURSE.end.wall - 40, y: GROUND_Y - 40, r: 200, a: rt.ending.bike.state === 'crashed' ? 0.8 : 0, color: 'rgba(249, 115, 22, 0.16)' }] };
};
