// The lighting on Barry's stage. It's night and the grid's failing: every place
// has a level of dark over it (dim on the street, near enough normal in the
// offices, rolling in waves across the rooftops), and the lights cut holes in it:
// the street lamps' cones (the bad ones flickering, cutting out for a while and
// stuttering back), neon signs, bulbs and fluorescent tubes indoors, the beacons
// on the roofs, the fires at the end. Meathead lights up when he's under one (a
// warm glow over him, as over anyone else under one); out of the light he's in
// the dark with everything else. (The drawing's render/lighting.ts's.)

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, ARENA_LEFT } from '../../../constants';
import type { Light, SceneLight } from '../../render/lighting';
import { COURSE, Lamp, placeOf, Place, roomOf } from './course';
import type { BarryRuntime } from './runtime';

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** How dark each place is (0 lit, 1 black). */
const DARK: Record<Place, number> = { streets: 0.62, lobby: 0.1, office: 0.16, maintenance: 0.42, lab: 0.3, roofs: 0.3, power: 0.22, landing: 0.38 };

/** Indoors it's cramped: the view pushes in on the room (by this much, about the middle of it). */
export const ROOM_ZOOM = 1.4;
export const roomZoom = (state: GameState) => {
  const room = roomOf(placeOf(state.camera.x + CANVAS_WIDTH / 2));
  return room ? { scale: ROOM_ZOOM, x: state.camera.x + CANVAS_WIDTH / 2, y: (room.ceiling + room.floor) / 2 + 5 } : null;
};

/** The rolling blackout over the rooftops: 0 the lights are on, 1 they're out (a wave that moves across the city). */
export const blackout = (frame: number, x: number) => {
  const cycle = 620;
  const t = ((frame - (x - COURSE.roofs.x1) * 0.25) % cycle + cycle) % cycle;
  if (t < 220) return 0;
  if (t < 280) return (t - 220) / 60;
  if (t < 480) return 1;
  if (t < 540) return 1 - (t - 480) / 60;
  return 0;
};

/** How dark it is where the camera is, right now. */
export const darkness = (state: GameState, rt: BarryRuntime) => {
  const place = placeOf(state.camera.x + CANVAS_WIDTH / 2);
  let d = DARK[place];
  if (place === 'roofs') d = 0.3 + 0.5 * blackout(state.frame, state.camera.x + CANVAS_WIDTH / 2);
  if (place === 'power') d = rt.power.gone >= 3 ? 0.55 : DARK.power + rt.power.gone * 0.08;
  return d;
};

/** How far up a lamp is right now (0 out, 1 full): the bad ones cut out for a stretch, stutter back on, buzz. */
export const lampLevel = (lamp: Lamp, frame: number, x = lamp.x) => {
  if (lamp.look === 'beacon') return blackout(frame, x) > 0.5 ? 0 : (Math.floor(frame / 40) % 2 ? 1 : 0.35);
  if (lamp.flicker <= 0) return 1;
  const t = frame + hash(lamp.x) * 1000;
  const period = 150;
  const slot = Math.floor(t / period), inSlot = t % period;
  if (hash(slot * 7.3 + lamp.x * 0.01) < lamp.flicker * 0.6) {
    // Out for this stretch: a stutter as it goes, then nothing
    return inSlot < 18 && Math.floor(t / 3) % 2 ? 0.7 : 0;
  }
  // On, with the odd buzzing dip (worse the worse it is)
  if (inSlot < 12 && lamp.flicker > 0.4) return Math.floor(t / 2) % 2 ? 1 : 0.2;
  return 1;
};

/** Everything giving off light in view (shots, fires and the like the engine adds itself). */
const lightsInView = (state: GameState): Light[] => {
  const f = state.frame;
  const out: Light[] = [];
  const view = (x: number) => x > state.camera.x - 300 && x < state.camera.x + CANVAS_WIDTH + 300;
  for (const l of COURSE.lamps) {
    if (!view(l.x)) continue;
    const a = lampLevel(l, f);
    if (a <= 0) continue;
    if (l.look === 'street') { out.push({ x: l.x, y: l.y, r: 280, a, cone: 150, color: 'rgba(255, 214, 140, 0.16)' }); out.push({ x: l.x, y: l.y, r: 46, a }); }
    else if (l.look === 'sign') out.push({ x: l.x, y: l.y, r: 110, a, color: 'rgba(244, 114, 182, 0.14)' });
    else if (l.look === 'bulb') out.push({ x: l.x, y: l.y + 10, r: 190, a, color: 'rgba(253, 224, 71, 0.08)' });
    else if (l.look === 'tube') out.push({ x: l.x, y: l.y + 10, r: 230, a, color: 'rgba(224, 242, 254, 0.06)' });
    else out.push({ x: l.x, y: l.y, r: 70, a, color: 'rgba(239, 68, 68, 0.18)' });
  }
  // Fires at the end, flickering
  if (placeOf(state.camera.x + 400) === 'landing') for (const p of COURSE.props) if (p.look === 'burningcar' && view(p.x)) out.push({ x: p.x + 70, y: p.y - 60, r: 260 + Math.sin(f * 0.3) * 20, a: 0.9, color: 'rgba(249, 115, 22, 0.16)' });
  // The power room's generators glow while they run
  for (const e of state.enemies) if (e.kind === 'generator' && view(e.pos.x)) out.push({ x: e.pos.x + e.width / 2, y: e.pos.y + 40, r: 170, a: 0.9, color: 'rgba(56, 189, 248, 0.12)' });
  return out;
};

/** The stage's lighting (none in Barry's own room, which has its own, nor over the city on the ride down). */
export const barryScene = (state: GameState, rt: BarryRuntime): SceneLight | null => {
  if (state.camera.x + CANVAS_WIDTH / 2 > ARENA_LEFT - 200 || rt.surf?.phase === 'air') return null;
  return { dark: darkness(state, rt), lights: lightsInView(state) };
};
