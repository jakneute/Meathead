// The HAPPYWOOD WATER TOWER's camera (benTower.ts runs it each frame, before the lot's own update). The owner's: "when
// swinging back and forth the camera can get spastic. make adjustments to even it out" / "sometimes while idle at the
// end it just moves up and down randomly" / "when i met ben in the water tower, ben wasn't in frame".
//
//   On one of the tower's rigs: the camera follows the rig's trolley (the swing's pivot) more than him at the end of
//     the swing, eased slow, and its height off where his feet would hang with the swing still (a dead zone round it):
//     not him swinging, and none of the engine's look-ahead for somewhere to land (its lookups flipped with every turn
//     of the swing, the deck under him found and lost: the bob at the end of a rig). He's always kept on screen.
//   Ben talking in the tank (the meetup, the gift, his lines in play): the camera eases over to hold the two of them.
//   After either: it eases back to following him as the engine does, then hands the camera back (no snap).
// Only the tower: the land's other rigs keep the engine's own camera.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hollywoodWires, type StuntWire } from '../section';
import { wireOn, wirePivot, WIRE_ROW } from '../wires';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
/** He's kept this far in from the screen's sides, his head this far under its top, his feet this far over its bottom. */
const SIDE = 110, TOP = 70, BOTTOM = 36;
/** On a rig: how much of the framing is the trolley (the rest him), the easing, the height's dead zone. */
const PIVOT = 0.75, EASE_X = 0.07, EASE_Y = 0.06, DEAD_Y = 22;
/** Framing Ben: the easing. Easing back: the frames it takes at most. */
const EASE_FRAME = 0.08, BACK_MAX = 90;

interface Cam { own: boolean; x: number; y: number; back: number }
const CAMS = new WeakMap<object, Cam>();
const camOf = (state: GameState): Cam => {
  const k = (state.stage ?? state) as object;
  let c = CAMS.get(k);
  if (!c) CAMS.set(k, c = { own: false, x: 0, y: 0, back: 0 });
  return c;
};

/** On one of these rigs now (the tower's own)? */
export const onTowerRig = (state: GameState, rigs: StuntWire[]) => {
  const i = wireOn(state);
  return i >= 0 && rigs.includes(hollywoodWires(state)[i]);
};

/**
 * The tower's camera, this frame. `rigs`: the tower's rigs. `frame`: two x's to hold on screen together (him and Ben)
 * with `row` his feet's row there; null when Ben's not talking. `room`: the room's ends (world x), the view kept in them
 * where it can be (him on screen comes first).
 */
export const runTowerCam = (state: GameState, rigs: StuntWire[], frame: [number, number] | null, row: number, room?: [number, number]) => {
  const c = camOf(state), p = state.player;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const all = hollywoodWires(state), on = wireOn(state);
  const rig = on >= 0 && rigs.includes(all[on]) && p.health > 0;
  if (!c.own) { c.x = state.camera.x; c.y = state.camera.y; }
  if (rig) {
    // The rig: its pivot more than him, slow; the height where he'd hang still, outside a dead zone
    const pv = wirePivot(state, all, on)!;
    const wantX = pv.x * PIVOT + cx * (1 - PIVOT) - W / 2;
    c.x += (wantX - c.x) * EASE_X;
    const wantY = pv.restFeet - WIRE_ROW, dy = wantY - c.y;
    if (Math.abs(dy) > DEAD_Y) c.y += (dy - Math.sign(dy) * DEAD_Y) * EASE_Y;
    c.back = 0;
  } else if (frame) {
    // Ben and him, the two held on screen together (between them), his feet on the room's row
    const wantX = (frame[0] + frame[1]) / 2 - W / 2;
    c.x += (wantX - c.x) * EASE_FRAME;
    if (p.isGrounded) c.y += (feet - row - c.y) * EASE_FRAME;
    c.back = 0;
  } else if (c.own) {
    // Easing back to the engine's follow (him in the middle across; on his feet, its row), quicker as it goes
    c.back++;
    const k = Math.min(1, 0.08 + c.back * 0.012);
    const wantX = cx - W / 2;
    c.x += (wantX - c.x) * k;
    if (p.isGrounded) c.y += (feet - row - c.y) * k;
    const settled = Math.abs(wantX - c.x) < 1 && (!p.isGrounded || Math.abs(feet - row - c.y) < 2);
    if (settled || c.back > BACK_MAX) {
      // (handed back: the engine's own camera from here, where this one left it)
      c.own = false; state.cameraOverride = null; state.cameraRestY = c.y;
      return;
    }
  } else return;
  // In the room where it fits; he's never let off the screen, nor past the camera's limits across
  if (room && frame && !rig && room[1] - room[0] >= W) c.x = Math.max(room[0], Math.min(room[1] - W, c.x));
  c.x = Math.max(cx - (W - SIDE), Math.min(cx - SIDE, c.x));
  c.x = Math.max(state.cameraMinX, Math.min(state.cameraMaxX ?? Infinity, c.x));
  c.y = Math.min(c.y, p.pos.y - TOP);
  c.y = Math.max(c.y, feet - (H - BOTTOM));
  c.own = true;
  state.camera.x = c.x; state.camera.y = c.y;
  state.cameraOverride = { x: c.x, y: c.y };
};
/** The tower's camera let go of at once (he's left the tower some other way: the cannon's, a death). */
export const dropTowerCam = (state: GameState) => {
  const c = camOf(state);
  if (c.own) { c.own = false; state.cameraOverride = null; }
};
