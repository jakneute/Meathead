// The havoc, drawn (the final pass: peak SNES, fake 3D on the boulevard's one eye). The backdrop (far.ts): the backlot's
// far off by the hour under the real disasters' red sky, the HAPPYWOOD hill erupting, the city and the soundstages
// burning, the storm's clouds, ash and snow and the blizzard, lightning. In the world, back to front: the street under
// him (bent) and the lava toward us (ground.ts); the lot strip and the ground going back, the lava channels going back,
// the SAFE TORNADO LAUNCHING ZONE painted on the pavement, the puddles; DISASTER: THE RIDE's end at the start; the fronts,
// burning, braced, coming down (fronts.ts); the soundstages coming down behind the climb, the hillside and the
// HAPPYWOOD letters and the road down it, then the climb's buildings, frames, crane, water tower and platforms
// (climb.ts); the bunkers, the hill's rock face; what stands about (props.ts); the light tower; the zone's signs and
// gantry; the lava's heat. In front of him (effects.ts): the wrecking ball, what comes down and what's thrown, the
// tornado, the snow, the flood. Spent (the revisit): a gray sky, the lava crusted black, every front down, the snow
// banked up, the ball hanging still, quiet.
//
// Standable reads standable: the curb, the roofs, the platforms, the bunkers' slabs, the tent's top, the light tower
// lying across its river and the hill road all get a lit lip; the fronts, the crane, the water tower's catwalk and the
// gantry's truss are dimmed or dark along their tops (scenery).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { saidOver } from '../section';
import { viewOf, at, FRONT_D } from '../blvd/kit';
import { outOf } from '../blvd/state';
import { X, Y, R, GY, LAVA, LAVA_DOWN } from './layout';
import { ROAD_D } from './paint';
import { hvOf } from './state';
import { spent } from './hazards';
import { isTorn } from './chase';
import { drawHavocFar } from './far';
import { drawHavocPavement, drawHavocStreet, lavaBack, lavaNear, lavaGlow, puddlesBack, puddlesNear, STREET_LAVA, pourAt } from './ground';
import { drawHavocFronts, drawLightTower, drawRideEnd, FRONTS } from './fronts';
import { drawClimb, drawHill } from './climb';
import { drawHavocProps, zoneFloor, zoneStreet, zoneSigns, zoneLights } from './props';
import { drawHavocEffects } from './effects';

type Ctx = CanvasRenderingContext2D;

export const drawHavocBackdrop = (c: Ctx, state: GameState) => drawHavocFar(c, state);

export const drawHavocBack = (c: Ctx, state: GameState) => {
  const hv = hvOf(state), f = state.frame, done = spent(state), v = viewOf(state);
  // The street under him (bent), the zone's marks and the puddles on it; the lava toward us
  drawHavocStreet(c, v, (cc, a, b) => { zoneStreet(cc, a, b, state, done); puddlesNear(cc, a, b, f); });
  for (const l of STREET_LAVA) lavaNear(c, v, l, done, f);
  // The ground going back (and the lot behind the fronts), the lava channels going back, the zone, the puddles
  drawHavocPavement(c, v, done);
  for (const l of STREET_LAVA) lavaBack(c, v, l, done, f, FRONT_D);
  zoneFloor(c, v, state, hv, done);
  puddlesBack(c, v, f);
  // DISASTER: THE RIDE's end, its far wall out flat
  drawRideEnd(c, v, state);
  // The fronts
  drawHavocFronts(c, v, state, hv);
  // The climb and the hill, farthest first
  drawClimb(c, v, state, hv, done, 'far');
  drawHill(c, v, state, hv, done, 'back');
  drawClimb(c, v, state, hv, done, 'near');
  drawHill(c, v, state, hv, done, 'near');
  // What stands about; the light tower; the zone's signs; the lava's heat
  drawHavocProps(c, v, state, hv, done);
  drawLightTower(c, v, state, hv);
  zoneSigns(c, v, state, hv, done);
  if (!done) for (const l of LAVA) lavaGlow(c, v, l, f);
};

export const drawHavocFront = (c: Ctx, state: GameState) => {
  const hv = hvOf(state), cam = state.camera;
  drawHavocEffects(c, state, hv);
  // Who's saying what: the havoc's people, the PA, the narrator
  const o = outOf(state);
  for (const e of state.enemies) { const s = o.barks.get(e); if (s && e.health > 0 && e.kind?.startsWith('m2:hwh_')) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 18, '#FDE68A', 220); }
  const top = cam.y + 96;
  if (hv.narr) saidOver(c, hv.narr.text, cam.x + CANVAS_WIDTH / 2, top, '#FDE68A', 340);
  else if (o.pa && R(state.player.pos.x) > -300 && R(state.player.pos.x) < 20000) saidOver(c, o.pa.text, cam.x + CANVAS_WIDTH / 2, top, '#FDE047', 340);
};

/** The lava's glow, the fronts' fires, the zone's lights, as lamps (the time of day's light). */
export const havocLamps = (state: GameState): Light[] => {
  if (spent(state)) return [];
  const cam = state.camera.x, out: Light[] = [], v = viewOf(state);
  // (the lava: its glow up out of the channel, flickering; the pour at the far wall; each bank, up the channel's walls
  // and onto what's by it)
  for (const l of LAVA) {
    const x = X((l.a + l.b) / 2);
    if (Math.abs(x - cam - 400) > 1200) continue;
    const fl = 0.85 + 0.15 * Math.sin(state.frame * 0.11 + l.a) * Math.sin(state.frame * 0.037), y = Y(Math.min(l.hl, l.hr));
    out.push({ x, y: y + 20, r: Math.max(160, (l.b - l.a) * 0.9), a: 0.9 * fl, color: '#F97316' });
    const [px, py] = at(v.eye, X(pourAt(l)), y + LAVA_DOWN, l.hl > 0 ? ROAD_D : FRONT_D);
    out.push({ x: px, y: py - 16, r: 120, a: 0.75 * fl, color: '#FDBA4A' });
    for (const e of [X(l.a), X(l.b)]) out.push({ x: e, y: y + 10, r: 110, a: 0.5 * fl, color: '#FB6A1E' });
  }
  // (the fronts burning: their tops, where they're drawn)
  let n = 0;
  FRONTS.forEach((fr, i) => {
    if (n >= 5 || isTorn(state, 'facade', i)) return;
    const [x, y] = at(v.eye, X(fr.rx) + fr.w / 2, GY - fr.h, FRONT_D);
    if (Math.abs(x - cam - 400) > 700) return;
    out.push({ x, y, r: 190, a: 0.55 + 0.1 * Math.sin(state.frame * 0.2 + i), color: '#FB8A1E' }); n++;
  });
  // (the SAFE TORNADO LAUNCHING ZONE's spotlights, pulsing on its box; its sign lit up)
  const z = zoneLights(v);
  if (Math.abs(z.floor[0] - cam - 400) < 1200) {
    const k = 0.5 + 0.5 * Math.sin(state.frame * 0.16);
    out.push({ x: z.floor[0], y: z.floor[1], r: 210, a: 0.6 + 0.35 * k, color: '#FDE68A' });
    out.push({ x: z.sign[0], y: z.sign[1], r: 170, a: 0.55, color: '#FDE047' });
  }
  return out;
};
