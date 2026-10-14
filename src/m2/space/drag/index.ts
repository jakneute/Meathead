// THE DRAG: section 4 of Space Land (owner: the outdoors agent). Landing on the main drag (launched out of the giant
// atom by the ride's ram, with the sled in front and its riders: they're a smear, he's fine: landing.ts), then
// outdoor platforming on down Futureland's main drag: the square's gear and cast again, escalated and mixed, with
// holes in the street now (layout.ts). Up to Space Needle 2 (a parody of the Space Needle that goes way higher: into
// actual space), towering ahead the whole way; its lift at the end: on to the needle section's start.
//
// Way back: walking off the left end puts him back in the atom at the ride's load platform (DOORS.ride.end: the
// ride's owner's call), the launch being one-way.
//
// Target: ~7500 px of play, ~1.5 min. Checkpoints 30-39. Outdoors: the time of day's light (timeOfDay.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind } from '../../../m1/types';
import { pickLine } from '../../../m1/game/platform/speech';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { CANVAS_WIDTH } from '../../../m1/constants';
import type { SpaceSection } from '../section';
import { layOwn, ledge, endWalls, runExits, meatheadSays, saidOver, teleport } from '../section';
import { setUi } from '../../store';
import { SECTIONS, DOORS, GY } from '../geometry';
import { X, Y, GROUND, LEDGES, SAUCERS as SAUCER_DEFS, BELTS, PLATES, PADS, MONO, TRACK, TRACK_LEGS, ENEMIES, PICKUPS, CHECKPOINTS, T1, T2, LIFT_X, SPEAKERS, SMEAR } from './layout';
import { makeGear, updateGear, drawGearBack, drawGearFront, drawTrack, type Gear } from '../square/gear';
import { updateShots, drawShots, drawBarks } from '../square/kinds';
import { outOf } from '../square/state';
import { paSay } from '../square';
import { FALL_SCREAM, PAD_LAUNCHED, MONO_RIDE } from '../square/lines';
import { drawDragBackdrop, drawDragBack, drawDragSpeakers, dragLamps } from './art';
import { landingDue, startLanding, runLanding, drawLanding, drawLandingHud, launchOntoDrag, LANDED_MEMO } from './landing';
import { LANDED, SMEAR_AGAIN, PA_EJECT, NEEDLE_SEEN, SAUCERS, THIRD_RAIL, MOVER_BACK, NEEDLE_BASE } from './lines';

export { launchOntoDrag };

const { x0, x1 } = SECTIONS.drag;
const pick = pickLine;
void LANDED;

interface Dr { gear: Gear; last: number }
const DR = new WeakMap<object, Dr>();
const mine = (state: GameState) => DR.get(state.stage as object);

let liftUpWas = true;
export const drag: SpaceSection = {
  id: 'drag', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, b]) => ({ x1: X(a), y1: GY, x2: X(b), y2: GY, surface: 'hard' }) as never));
    for (const [rx, h, w] of LEDGES) ledge(state, X(rx), Y(h), w, { hidden: true, tag: 'drag' });
    ledge(state, X(TRACK.a), Y(TRACK.h), TRACK.b - TRACK.a, { hidden: true, tag: 'drag-track' });
    endWalls(state, 'drag');
    const gear = makeGear(state, 'drag', {
      belts: BELTS.map(([a, b, v]) => [X(a), X(b), GY, v]),
      plates: PLATES.map(([x, w, h, off]) => [X(x), w, Y(h), off]),
      pads: PADS.map(([x, w, h, mode, off]) => [X(x), w, Y(h), mode, off]),
      monos: [{ a: X(MONO.a), b: X(MONO.b), y: Y(TRACK.h), len: MONO.len, v: MONO.v, period: MONO.period, off: MONO.off }],
      saucers: SAUCER_DEFS.map(([x, h, w, ax, ay, period, phase]) => [X(x), Y(h), w, ax, ay, period, phase]),
    });
    DR.set(state.stage as object, { gear, last: -99 });
    // (starting from one of the drag's checkpoints: he's been launched already; the smear's there)
    if (state.checkpoint >= 30) state.stageMemo[LANDED_MEMO] = '1';
    ENEMIES.forEach(([kind, rx, h], i) => {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
      e.variant = (i * 5 + rx) % 13;
      state.enemies.push(e);
    });
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `drag-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    if (import.meta.env.DEV) (window as unknown as { __dragLaunch?: () => void }).__dragLaunch = () => launchOntoDrag(state);
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, o = outOf(state), dr = mine(state)!;
    const justArrived = state.frame - dr.last > 2;
    dr.last = state.frame;
    if (landingDue(state, justArrived)) startLanding(state);
    const ev = updateGear(ctx, dr.gear);
    updateShots(ctx);
    const scene = runLanding(ctx);
    if (scene) return scene;
    const rx = p.pos.x + p.width / 2 - x0;
    const once = (k: string, go: () => void) => { if (!o.said[k]) { o.said[k] = true; go(); } };
    // (his say, not over the PA's: it waits till that's done)
    const says = (k: string, lines: string[]) => { if (!o.pa && !o.paBusy) once(k, () => meatheadSays(state, pick(lines), true)); };
    if (!p.inCutscene && p.health > 0) {
      if (rx > 700 && rx < 1100) { says('d-needle', NEEDLE_SEEN); once('d-pa-eject', () => paSay(state, PA_EJECT[0])); }
      if (rx > T1.a - 150 && rx < T1.b) says('d-saucers', SAUCERS);
      if (rx > 2150 && rx < 3000 && p.pos.y + p.height < Y(TRACK.h) + 4) says('d-rail', THIRD_RAIL);
      if (rx > 3660 && rx < 4300) says('d-mover', MOVER_BACK);
      if (rx > LIFT_X - 500) says('d-base', NEEDLE_BASE);
      // (back past the smear, later on: once)
      if (o.said['d-needle'] && rx > SMEAR.a && rx < SMEAR.b && o.said['d-base']) says('d-smear', SMEAR_AGAIN);
      if (ev.padFired) says('launched', PAD_LAUNCHED);
      if (ev.onMono) says('monoride', MONO_RIDE);
    }
    if (p.isGrounded) o.said.falling = false;
    else if (!o.said.falling && ((rx > T1.a && rx < T1.b) || (rx > T2.a && rx < T2.b)) && p.pos.y + p.height > GY + 30) {
      o.said.falling = true; meatheadSays(state, pick(FALL_SCREAM), false); playSound('whoosh', 0.8, -8);
    }
    // In at the lift (up the needle: its start); back off the left end (the atom's load platform: the ride's call)
    runExits(state, [{ x0, x1: x0 + 50, yTop: GY - 40, yBot: GY + 2, to: DOORS.ride.end }]);
    // (the needle's doors: up, with its prompt, to go in)
    const atLift = p.isGrounded && !p.inCutscene && Math.abs(p.pos.x + p.width / 2 - X(LIFT_X)) < 40;
    if (atLift) {
      setUi({ upPrompt: 'SPACE NEEDLE 2' });
      if (controls.up && !liftUpWas) { liftUpWas = true; teleport(state, DOORS.needle.start.x, DOORS.needle.start.y); return controls; }
    }
    liftUpWas = !!controls.up;
    return controls;
  },
  drawBackdrop: (c, state) => drawDragBackdrop(c, state),
  drawBack: (c, state) => {
    const dr = mine(state);
    drawDragBack(c, state, () => { if (dr) { drawTrack(c, state, dr.gear.monos[0], TRACK_LEGS.map(X)); drawGearBack(c, state, dr.gear); } drawLanding(c, state); });
    drawDragSpeakers(c, state, !!outOf(state).pa);
  },
  drawFront: (c, state) => {
    const dr = mine(state);
    if (dr) drawGearFront(c, state, dr.gear);
    drawShots(c, state);
    drawBarks(c, state, saidOver);
    const s = outOf(state).pa;
    if (s && state.player.pos.x > x0 - 400) {
      const cx = state.camera.x + CANVAS_WIDTH / 2;
      let best = SPEAKERS[0], bd = Infinity;
      for (const sp of SPEAKERS) { const d = Math.abs(X(sp[0]) - cx); if (d < bd) { bd = d; best = sp; } }
      if (bd < CANVAS_WIDTH) saidOver(c, s.text, X(best[0]) + 24, Y(best[1]) - 22, '#FDE047', 300);
    }
  },
  drawHud: (c, state) => drawLandingHud(c, state),
  outdoors: () => 1,
  lamps: () => dragLamps(),
};
void T2;
