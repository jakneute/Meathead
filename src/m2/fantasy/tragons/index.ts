// TRUELLING TRAGONS: section 4 of Fairy Land, trial two. The user's design (fantasy-spec.md, verbatim there): a parody
// of Dueling Dragons with three cars, not two: a FIRE car, an ICE car and a LIGHTNING car. No guns here; next /
// previous weapon (the mouse wheel, LB / RB) hops him between cars, with a little cooldown. The track goes away now and
// then and he has to hop to another car; sometimes only one car's safe to stand on; each car has its own obstacles.
// All three always shown (zoom in and out as needed), side view, readable in the chaos; a warning before every hole.
// Reworked (the user's): a survival ride, not a fight (no suitors on it); crazy depth and height (track.ts: the tracks
// diving at the camera and away, huge drops and climbs); loops and corkscrews, sometimes into and round each other,
// where he's locked on and has to HOLD down on the handlebars or be flung off (each warned: which track, which
// button); his own poses on the dragon (no gun); a death of its own for each track's broken end (deaths.ts).
//
// In from the glen's queue: the load station (three empty dragons: onto any one's back and off it goes); the ride
// (ride.ts: the trains stand still in the world and the world goes by; layout.ts's script: teach, then escalate); the
// unload (the decks, the suitors off the train ahead having their say: rivals.ts; the exit to the castle's base). The
// drawing: art.ts.
//
// Checkpoints 30-38: the station, seven along the ride (back on a car that far along: the world as the run left it),
// the unload. One-way: the ride. Way back: the left end to the glen; on a revisit (the ride done: CLOSED, no dragons)
// it's a walk along the ground between the station and the unload. On: the exit past the unload (the castle's base).

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import type { FantasySection } from '../section';
import { layOwn, endWalls, endExits, runExits, solid } from '../section';
import { DOORS } from '../geometry';
import { x0, x1, GY, CHECKPOINTS, EXIT_X } from './layout';
import { tragonsOf } from './state';
import { buildRide, updateRide, viewOf, cameraLimits } from './ride';
import { drawTragonsBackdrop, drawTragonsBack, drawTragonsFront, drawTragonsHud } from './art';
import './deaths';

// (back from the castle's base: out by the unload's exit)
DOORS.tragons.end = { x: EXIT_X - 160, y: GY };

export const tragons: FantasySection = {
  id: 'tragons', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    // (the ground the whole way: the station's floor, the park far under the ride (all the way down: a fall's end),
    // the unload's yard to the exit; a wall past the exit)
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: EXIT_X + 400, y2: GY, surface: 'dirt' }]);
    endWalls(state, 'tragons', { right: false });
    solid(state, EXIT_X + 160, -6000, 40, 8000, { hidden: true, tag: 'tragons-end' });
    buildRide(state);
  },
  update: (ctx, controls) => {
    const out = updateRide(ctx, controls);
    // (the ways: back off the left end to the glen's queue; on out the exit past the unload, to the castle's base)
    runExits(ctx.state, [...endExits('tragons', { right: false }), { x0: EXIT_X + 30, x1: EXIT_X + 120, yTop: GY - 40, yBot: GY + 2, to: DOORS.keep.start }]);
    return out;
  },
  drawBackdrop: (c, state) => drawTragonsBackdrop(c, state),
  drawBack: (c, state) => drawTragonsBack(c, state),
  drawFront: (c, state) => drawTragonsFront(c, state),
  drawHud: (c, state) => drawTragonsHud(c, state),
  cameraX: (state) => cameraLimits(state),
  cameraRow: () => 500,
  // (the ride: all three dragons in the picture, the camera pulled out as they spread and in as they close; blended
  // in from the engine's camera as it sets off, and back out at the unload)
  zoom: (state) => {
    if (tragonsOf(state).cam.on <= 0) return null;
    const v = viewOf(state);
    return { scale: v.k, x: v.cx, y: v.cy, shiftX: CANVAS_WIDTH / 2 - (v.cx - state.camera.x), shiftY: CANVAS_HEIGHT / 2 - (v.cy - state.camera.y) };
  },
  outdoors: () => 1,
};
