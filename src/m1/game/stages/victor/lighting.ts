// Victor's volcano. Outside, the sky's gone red at dusk and everything's
// washed in it; the lava in the hollows glows, the cracks venting fire flare.
// Inside it's dark but for what's burning: the lava river under you lights the
// cave from below, the spouts and jets and fire bars light what's round them.
// The VIP lounge is a club: low purple light, coloured spots. His room's lit by
// the lava under the floor.

import type { GameState } from '../../core/state';
import type { Light, SceneLight } from '../../render/lighting';
import { ARENA_LEFT, ARENA_RIGHT, GROUND_Y } from '../../../constants';
import { COURSE } from './course';
import { regionOf } from './runtime';
import { ventPhase, jetPhase, barBalls } from './hazards';
import { nearView, inArena, lavaLights, row } from '../lightKit';

const FIRE = 'rgba(249, 115, 22, 0.18)';

/** The fire hazards in view: vents (a glow smoking, a blaze erupting), jets, fire bars. */
const fireLights = (state: GameState): Light[] => {
  const out: Light[] = [];
  const f = state.frame;
  for (const v of COURSE.vents) {
    if (!nearView(state, v.x)) continue;
    const ph = ventPhase(v, f);
    out.push(ph.burning ? { x: v.x, y: v.y - 120, r: 260, a: 0.95, color: FIRE } : { x: v.x, y: v.y - 6, r: ph.warning ? (v.lava ? 120 + 100 * (ph.t / ph.warn) : 120) : 70, a: ph.warning ? 0.8 : 0.5, color: FIRE });
  }
  for (const j of COURSE.jets) {
    if (!nearView(state, j.x)) continue;
    const ph = jetPhase(j, f);
    if (ph.burning) out.push({ x: j.x + j.dir * j.len / 2, y: j.y, r: 40 + j.len * 0.7, a: 0.95, color: FIRE });
    else if (ph.warning) out.push({ x: j.x, y: j.y, r: 90, a: 0.6, color: FIRE });
  }
  for (const b of COURSE.bars) {
    if (!nearView(state, b.x) || Math.abs(b.y - state.camera.y - 300) > 700) continue;
    const balls = barBalls(b, f), end = balls[balls.length - 1];
    out.push({ x: (b.x + end.x) / 2, y: (b.y + end.y) / 2, r: 60 + b.len, a: 0.9, color: FIRE });
  }
  return out;
};

export const victorScene = (state: GameState): SceneLight | null => {
  if (inArena(state)) {
    // Lava under the grating all the way across
    const lights = row(state, ARENA_LEFT, ARENA_RIGHT, 180, GROUND_Y + 10, { r: 230, a: 0.85, color: FIRE });
    return { dark: 0.3, shade: [30, 6, 2], lights };
  }
  const region = regionOf(state.camera.x + 400);
  if (region === 'lounge') {
    // Spots down from the ceiling, club colors
    const colors = ['rgba(217, 70, 239, 0.14)', 'rgba(56, 189, 248, 0.12)', 'rgba(251, 191, 36, 0.12)'];
    const lights: Light[] = [];
    let i = 0;
    for (let x = COURSE.lounge.x1 + 150; x < COURSE.lounge.x2; x += 260, i++) if (nearView(state, x)) lights.push({ x, y: COURSE.lounge.y - 300, r: 300, a: 0.85, cone: 110, color: colors[i % 3] });
    return { dark: 0.34, shade: [22, 6, 34], lights };
  }
  if (region === 'club') {
    // The club: lava under the glass floor, the fire, and coloured spots sweeping on the beat
    const colors = ['rgba(244, 114, 182, 0.14)', 'rgba(34, 211, 238, 0.12)', 'rgba(251, 146, 60, 0.13)', 'rgba(167, 139, 250, 0.12)'];
    const lights: Light[] = [...lavaLights(state, 220), ...fireLights(state)];
    const beat = Math.floor(state.frame / 30);
    for (let x = Math.floor((state.camera.x - 200) / 300) * 300; x < state.camera.x + 1000; x += 300) lights.push({ x: x + Math.sin(state.frame * 0.02 + x) * 80, y: state.camera.y + 40, r: 320, a: 0.8, cone: 90, color: colors[(Math.floor(x / 300) + beat) % 4] });
    return { dark: 0.36, shade: [30, 6, 26], lights };
  }
  const lights = [...lavaLights(state, region === 'inside' ? 240 : 190), ...fireLights(state)];
  return region === 'inside' ? { dark: 0.44, shade: [22, 6, 2], lights } : { dark: 0.2, shade: [44, 10, 6], lights };
};
