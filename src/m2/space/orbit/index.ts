// THE ORBIT: section 6 of Space Land. The land's new mechanic: a side-scrolling space shooter (Cuphead's plane levels).
//
// Out Space Needle 2's window in his suit (the needle hands him over at DOORS.orbit.start), he flies: free in all four
// directions, no gravity, facing right only, the screen scrolling on by itself and him kept on it. The ray gun only
// (the stage keeps him to it: index.ts). Space radiation gets into it: it fires rapid, and upgrades itself as the
// shooter goes on, saying so (gun.ts): twin streams, a spread, five streams, plasma, and at the end THE BEAM.
//
// The flying saucer (ufo.ts: Zorblax's widow) is there the whole way, hanging off his right, health bar up, spewing
// out the waves (waves.ts: fighters, kamikazes; and the junk with guns on it, mines, rocks, the cruisers' beams). His
// bolts barely chip it. Once the screen stops and the gun's the beam, it's done for: it takes him, "MORNING, LADIES.",
// it blows up, the crash, "GOING BACK TO FACTORY SETTINGS.", the crater.
//
// Checkpoints 50-54. Starting again from one: the scroll there, the waves after it, the gun's level for there, the
// saucer as worn as it was (state.stageMemo). Outer space is space (no time of day). One way: back from the crater,
// he's at the foot of Space Needle 2 (geometry.ts's DOORS.orbit.end).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Pickup } from '../../../m1/types';
import { GRAVITY } from '../../../m1/constants';
import { pickLine } from '../../../m1/game/platform/speech';
import type { SpaceSection } from '../section';
import { layOwn, endWalls, meatheadSays, teleport } from '../section';
import { DOORS, GY } from '../geometry';
import { putOnSuit, reapplySuit } from '../needle/suit';
import { orbitOf, MEMO } from './state';
import { X0, X1, CY, W, H, SCROLL, ARENA_CAM, FLY_Y, START_SX, FLY_SPEED, FLY_ACCEL, EDGE_L, EDGE_R, EDGE_T, EDGE_B, at } from './geo';
import { drawSpace, drawNeedleTop } from './art';
import { updateRocks, drawRocks, updateBooms, drawBooms, drawBarks, drawAlienBolts, drawWarns } from './hazards';
import { pilotOf, mineBlows, K } from './kinds';
import { runWaves, skipWavesTo } from './waves';
import { startSaucer, updateSaucer, drawSaucerFront, drawSaucerHud, noteSaucerHp } from './ufo';
import { updateGun, drawGun, levelAt, gunSays, RAPID_AT } from './gun';
import { MH_ARRIVE, MH_RAPID, GUN_UPGRADE } from './lines';
import { forceWeapon, releaseWeapon } from '../../weaponLock';

/** Where the big refill is put out, before the end (a camera offset), and where (screen). */
const REFILL_AT = ARENA_CAM - X0 - 250;

/** Into flight (out the window, or starting again at one of its checkpoints). */
const startFlight = (ctx: FrameContext) => {
  const { state } = ctx, o = orbitOf(state), p = state.player;
  o.on = true;
  o.quiet = !!state.stageMemo[MEMO.ufo];
  o.scroll = Math.max(X0, Math.min(ARENA_CAM, p.pos.x + p.width / 2 - START_SX));
  const off = o.scroll - X0;
  skipWavesTo(state, off);
  o.level = levelAt(off);
  o.vx = 0; o.vy = 0; o.pb = 0; o.cpSeen = state.checkpoint;
  // (out in the field, wherever he came from)
  if (p.pos.y + p.height < CY + 60 || p.pos.y > CY + H) { p.pos.y = FLY_Y - p.height; }
  // (in the suit: back in it after a death; put on if he's started out here fresh)
  reapplySuit(state);
  if (!p.spaceSuit) putOnSuit(state);
  forceWeapon(state, 'GUN');
  if (!o.quiet) startSaucer(state);
  if (!state.stageMemo[MEMO.hi]) { state.stageMemo[MEMO.hi] = '1'; meatheadSays(state, pickLine(MH_ARRIVE), true); }
};

/** Free flight: up, down, left, right, no gravity, facing right; carried along with the scroll, kept on the screen. */
const fly = (state: GameState, controls: Controls) => {
  const o = orbitOf(state), p = state.player;
  p.carried = true; p.isGrounded = false; p.facing = 1; p.isDucking = false;
  // (knocked: off the way he was hit, easing off)
  if ((p.pushbackTimer ?? 0) > o.pb) { o.vx = Math.max(-8, Math.min(8, p.vel.x)); o.vy = Math.max(-8, Math.min(8, p.vel.y)); }
  o.pb = p.pushbackTimer ?? 0;
  if (o.pb > 0 || p.health <= 0) { o.vx *= 0.9; o.vy *= 0.9; }
  else {
    const ix = (controls.right ? 1 : 0) - (controls.left ? 1 : 0), iy = (controls.down ? 1 : 0) - (controls.up ? 1 : 0);
    const n = ix && iy ? Math.SQRT1_2 : 1;
    o.vx += (ix * n * FLY_SPEED - o.vx) * FLY_ACCEL;
    o.vy += (iy * n * FLY_SPEED - o.vy) * FLY_ACCEL;
  }
  p.pos.x += o.vx + o.sv; p.pos.y += o.vy;
  const cam = state.camera.x;
  const x0 = cam + EDGE_L, x1 = cam + W - EDGE_R - p.width, y0 = CY + EDGE_T, y1 = CY + H - EDGE_B - p.height;
  if (p.pos.x < x0) { p.pos.x = x0; o.vx = Math.max(0, o.vx); }
  if (p.pos.x > x1) { p.pos.x = x1; o.vx = Math.min(0, o.vx); }
  if (p.pos.y < y0) { p.pos.y = y0; o.vy = Math.max(0, o.vy); }
  if (p.pos.y > y1) { p.pos.y = y1; o.vy = Math.min(0, o.vy); }
  // (his pose: floating, drifting the way he's going)
  p.vel.x = o.vx; p.vel.y = o.vy * 0.5;
};

/** The camera's ours while he's flying: the scroll, the field's top. */
const holdCamera = (state: GameState) => {
  const o = orbitOf(state);
  state.camera.x = o.scroll; state.camera.y = CY;
  state.cameraOverride = { x: o.scroll, y: CY };
  o.cam = true;
};

export const orbit: SpaceSection = {
  id: 'orbit', x0: X0, x1: X1,
  checkpoints: [
    { name: 'ORBIT', cp: 50, x: at(START_SX), y: FLY_Y },
    { name: 'ORBIT: JUNK', cp: 51, x: at(4400 + START_SX), y: FLY_Y },
    { name: 'ORBIT: MINES', cp: 52, x: at(9500 + START_SX), y: FLY_Y },
    { name: 'ORBIT: BEAMS', cp: 53, x: at(14700 + START_SX), y: FLY_Y },
    { name: 'ORBIT: THE SAUCER', cp: 54, x: at(REFILL_AT - 300 + START_SX), y: FLY_Y },
  ],
  build: (state) => {
    // (ground far under the field, for the engine's sake; nobody ever sees it)
    layOwn(state, [{ x1: X0 - 200, y1: GY, x2: X1 + 200, y2: GY, surface: 'metal' }]);
    endWalls(state, 'orbit');
  },
  update: (ctx, controls) => {
    const { state } = ctx, o = orbitOf(state), p = state.player;
    if (!o.on) startFlight(ctx);
    // (the saucer's cutscene: it has him)
    const cut = updateSaucer(ctx, controls);
    if (!o.on) return cut ?? controls;
    if (cut) { o.sv = 0; holdCamera(state); p.carried = true; p.facing = 1; p.vel.x = 0; p.vel.y = 0; return cut; }
    // The scroll (stopped at the end, or him dead)
    o.sv = o.scroll < ARENA_CAM && p.health > 0 ? Math.min(SCROLL, ARENA_CAM - o.scroll) : 0;
    o.scroll += o.sv;
    holdCamera(state);
    fly(state, controls);
    // (a checkpoint's just been reached: the saucer's health as it stands is kept for it)
    if (state.checkpoint !== o.cpSeen) { o.cpSeen = state.checkpoint; noteSaucerHp(state); }
    // The gun: a plain ray gun at first; a way out, the space radiation gets into it: rapid, and the gun says why
    if (o.scroll - X0 >= RAPID_AT && !state.stageMemo[MEMO.rapid] && p.health > 0) {
      state.stageMemo[MEMO.rapid] = '1';
      // (his answer after it's done, not over it)
      gunSays(state, GUN_UPGRADE[0], () => meatheadSays(state, MH_RAPID[0], true));
    }
    const out = updateGun(ctx, controls);
    if (!o.quiet) runWaves(ctx);
    updateRocks(ctx);
    updateBooms(state);
    // (theirs: shot mines go off anyway; whoever's flown off is taken out)
    const gone = new Set<unknown>();
    for (const e of o.tracked) {
      const P = pilotOf(e);
      if (e.kind === K.mine && e.health <= 0 && !P?.boomed) mineBlows(ctx, e);
      if (P?.gone) gone.add(e);
    }
    if (gone.size) state.enemies = state.enemies.filter(e => !gone.has(e));
    o.tracked = o.tracked.filter(e => !gone.has(e) && (e.health > 0 || e.isBlownAway) && state.enemies.includes(e));
    // (what they drop floats, out here)
    for (const q of state.pickups as Pickup[]) if (q.pos.x > o.scroll - 200 && q.pos.x < o.scroll + W + 200 && q.pos.y < GY - 1000) { q.vel.x = 0; q.vel.y = -GRAVITY; }
    // The big refill, before the end
    if (!o.refill && !o.quiet && o.scroll - X0 >= REFILL_AT) {
      o.refill = true;
      state.pickups.push(
        { id: 'orbit-health', pos: { x: o.scroll + 560, y: CY + 230 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 },
        { id: 'orbit-ammo', pos: { x: o.scroll + 560, y: CY + 350 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 },
      );
    }
    // (back out here after it's all over (a cheat start): off the right of the screen, down to the crater)
    if (o.quiet && o.scroll >= ARENA_CAM && p.pos.x + p.width >= o.scroll + W - EDGE_R - 1 && controls.right) leave(state);
    return { ...out, left: false, right: false, up: false, down: false, jump: false, special: false, charge: false };
  },
  cameraX: (state) => { const o = orbitOf(state); return o.on ? { min: o.scroll, max: o.scroll } : undefined; },
  flight: (state) => (orbitOf(state).on ? { rapidFire: true } : null),
  drawBackdrop: (c, state) => { drawSpace(c, state.camera.x, state.frame); return true; },
  drawBack: (c, state) => {
    if (state.camera.x < X0 + 600) drawNeedleTop(c, X0 + 70, FLY_Y - 40, state.frame);
    drawRocks(c, state);
  },
  drawFront: (c, state) => {
    drawAlienBolts(c, state);
    drawBooms(c, state);
    drawSaucerFront(c, state);
    drawGun(c, state);
    drawBarks(c, state);
    drawWarns(c, state);
  },
  drawHud: (c, state) => drawSaucerHud(c, state),
};

/** Out of space, the saucer down already: to the crater, on foot. */
const leave = (state: GameState) => {
  const o = orbitOf(state), p = state.player;
  o.on = false;
  if (o.cam) { state.cameraOverride = null; o.cam = false; }
  releaseWeapon(state);
  p.carried = false;
  teleport(state, DOORS.crater.start.x, DOORS.crater.start.y);
  state.camera.y = DOORS.crater.start.y - 550;
};
