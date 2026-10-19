// Riding the log: it follows the flume at the ride's own pace (the stretch's speed) on the water (bobbing, its wake and
// its spray, the water lapping); left drags his hands in the water (brake), right paddles (faster), where the ride lets
// him (not on the chain, not down a drop); jump hops him up out of the log and back down into it, and left or right in
// the hop carries him a little back or on along it (the log always follows, catching up under him: the user's, to get
// out of the way of things); down ducks him right down in it. He faces the way he's going. He sits in it (Player.logSeat:
// legs down in the log, a hand on its rim, the gun out). He can shoot (no specials: the charge, the slide and the rest
// need ground under them). The camera rides ahead of him. Off the foot of every drop the water goes up in a big wave
// (bigSplash: the big drop, into the sewer, into the river, the waterfall).
//
// Back at a checkpoint (31-38) he's put straight back in a log there; at the station (30) he walks to it.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { setUi } from '../../store';
import { meatheadSays, speak, byPants } from '../section';
import type { ByPants } from '../talk';
import { rideOf, type Ride } from './state';
import { X, x0, x1, waterY, speedAt, slopeAt, realAt, RIDE_CPS, START, END, DROPS } from './layout';
import {
  RIDE_VOICES, RIDE_START, FIRST_SAW, LIFT_HILL, BIG_DROP, PHOTO, SEWER, REAL_RIVER, FALLS, CHIPPER_SEEN,
  SPIEL_CREEK, SPIEL_MILL, SPIEL_DROP,
} from './lines';

/** Where his feet are off the waterline sat in the log (negative: down in it, under the line), how much further down he
 *  slumps ducking, the log's length, its rim. */
export const SINK = -4, DUCK_SINK = 10, LOG_LEN = 136, RIM = 26;
/** His box's height over his seat, sat up and ducked (the duck-unders' undersides are DUCK_LINE over the water: ducked
 *  his head's well under it, sat up well over). */
const SAT_H = 62, DUCKED_H = 34;
const JUMP_V = 9.6, FALL = 0.5;
/** A hop's carry along the log (px a frame either way), how far off its middle he can get, how fast it catches up. */
const HOP_DX = 3.6, OFF_MAX = 76, CATCH = 0.1;
/** His paddle and his brake: what they make of the stretch's pace (the user's: speed's a real dodge). */
const PADDLE = 1.75, BRAKE = 0.38;

/** Ducked down in the log (not mid-hop). */
export const ducked = (state: GameState) => !!state.player.isDucking && rideOf(state).log.up <= 0;
/** The log's tilt at rx (the water's slope under its length): it's drawn turned to it, and him in it with it. */
export const logTilt = (rx: number) => Math.atan2(waterY(rx + 30) - waterY(rx - 30), 60);
/** His seat (world y): where his feet are sat up. */
export const seatY = (r: Ride) => waterY(r.log.rx) - SINK - r.log.bob - r.log.float - r.log.up;
/** Where his feet are (world y), riding. */
export const feetY = (r: Ride, duck = false) => seatY(r) + (duck ? DUCK_SINK : 0);
/** Where he is along it (world x): the log's middle, and his hop off it. */
export const riderX = (r: Ride) => X(r.log.rx + r.log.off);
/** His box riding (world): narrower than his sprite, his head right down when he's ducked. */
export const riderBox = (state: GameState) => {
  const r = rideOf(state), s = seatY(r), d = ducked(state);
  const top = s - (d ? DUCKED_H : SAT_H);
  return { x: riderX(r) - 15, y: top, w: 30, h: s + (d ? DUCK_SINK : 0) - top };
};
export const riding = (state: GameState) => { const m = rideOf(state).log.mode; return m === 'ride' || m === 'scene'; };

/** Puts him in a log at `rx` (from the section's start). */
export const board = (state: GameState, rx: number, mode: 'ride' | 'scene' = 'ride') => {
  const r = rideOf(state), p = state.player, L = r.log;
  L.mode = mode; L.rx = Math.max(START, Math.min(END - 400, rx)); L.v = mode === 'scene' ? 0 : speedAt(L.rx)[1]; L.push = 1;
  L.up = 0; L.vy = 0; L.off = 0; L.hopV = 0; L.float = 0; L.bob = 0; L.bobV = 0; L.t = 0; L.camY = waterY(L.rx) - 420;
  p.carried = true; p.noSpecials = true; p.logSeat = true; p.vel.x = 0; p.vel.y = 0; p.facing = 1;
  place(state, r);
  state.camera.x = Math.max(x0, Math.min(x1 - CANVAS_WIDTH, X(L.rx) - 300));
  state.camera.y = L.camY;
  // (anything said about a stretch he's past already, isn't)
  for (const [k, at] of TRIGGERS) if (rx > at + 40) r.said[k] = true;
  playSound('splash', 0.8, -2);
};

/** Out of the log (on his feet: the clearing, or dead). */
export const unboard = (state: GameState) => {
  const p = state.player, r = rideOf(state);
  p.carried = false; p.noSpecials = false; p.logSeat = false; p.spriteRot = 0;
  state.cameraOverride = null;
  if (r.log.mode !== 'done') r.log.mode = 'off';
};

/** Keeps him sat in the log where it is (the scene at the station: it's not going yet). */
export const holdInLog = (state: GameState) => { const r = rideOf(state); place(state, r); state.player.isGrounded = true; state.player.facing = 1; state.player.logSeat = true; };
const place = (state: GameState, r: Ride) => {
  const p = state.player;
  p.pos.x = riderX(r) - p.width / 2;
  p.pos.y = feetY(r, ducked(state)) - p.height;
  p.vel.x = 0; p.vel.y = r.log.up > 0 ? -r.log.vy : 0;
};

/** What he says (and the ride's spiel) at each stretch, once: [key, at x]. */
const TRIGGERS: [string, number][] = [
  ['first', 1130], ['creek', 1840], ['lift', 2560], ['mill', 3040], ['spieldrop', 3800], ['drop', 3920], ['photo', 4230],
  ['sewer', 5960], ['river', 8680], ['falls', 9740], ['chipper', 10560],
];
const MEATHEAD_AT: Record<string, ByPants> = { first: FIRST_SAW, lift: LIFT_HILL, drop: BIG_DROP, photo: PHOTO, sewer: SEWER, river: REAL_RIVER, falls: FALLS, chipper: CHIPPER_SEEN };
const SPIEL_AT: Record<string, string[]> = { creek: SPIEL_CREEK, mill: SPIEL_MILL, spieldrop: SPIEL_DROP };

export const paSay = (r: Ride, text: string) => speak(RIDE_VOICES.spiel, text, s => { r.pa = s; }, true);

/** Water (a splash's drops) off the log at world (x, y). */
const drops = (state: GameState, x: number, y: number, n: number, up: number, spread: number, sewer = false) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * spread, y }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * up }, life: 26 + Math.random() * 16, color: sewer ? (i % 2 ? '#8A8A3A' : '#6A6A2A') : i % 3 ? '#E0F2FE' : '#93C5FD', size: 2 + Math.random() * 3 });
};

/** The big wave splash off the foot of a drop (like a real log ride's): curtains of water thrown up and out both ways
 *  and on ahead, way over his head (a third of the screen and more), a white burst of foam on the surface, the spray
 *  raining back down, the screen running wet, the bang and the shake, the log bucking. `s`: how big (the big drop and
 *  the waterfall the biggest). Drawn over everything (art.ts drawSplashes). */
export const bigSplash = (state: GameState, r: Ride, x: number, y: number, sewer = false, s = 1, vx = 0) => {
  r.waves.push({ x, y, t: 0, s, vx });
  r.lens = 130;
  playSound('splash', 1, -12); playSound('splash', 1, -5); playSound('splash', 0.9, 2); playSound('crash', 0.6, -16); playSound('gush', 0.9, -10); playSound('thud', 0.8, -12);
  shakeScreen(state, 18, 10);
  // (the spray: up and out both ways and on ahead, raining back down onto the water)
  const n = Math.round(150 * s);
  for (let i = 0; i < n; i++) {
    const back = i % 3 === 0, a = Math.random();
    r.spray.push({
      x: x + (Math.random() - 0.3) * 90, y: y - Math.random() * 10,
      vx: back ? -1.5 - a * 5 : 1 + a * 7 + vx * 0.5, vy: -(6 + Math.random() * 13) * s,
      floor: y, life: 80 + Math.random() * 40, s: 2 + Math.random() * 4, sewer,
    });
  }
  drops(state, x + 40, y, 40, 14, 260, sewer);
};

/** A frame of the ride. */
export const updateRide = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, r = rideOf(state), L = r.log;
  if (p.health <= 0) { unboard(state); return controls; }
  L.t++;
  // ---- the pace: the stretch's, his brake or paddle on top where the ride lets him
  const [, base, free] = speedAt(L.rx);
  // (a real dodge, the user's: paddling nearly doubles it, dragging his hands nearly stops it, and it answers quick)
  const want = free ? (controls.right ? PADDLE : controls.left ? BRAKE : 1) : 1;
  L.push += (want - L.push) * 0.12;
  const target = base * (free ? L.push : 1);
  // (down a drop it builds; anything else eases to it)
  L.v += (target - L.v) * (base > 6 ? 0.12 : 0.11);
  const startRx = L.rx;
  L.rx = Math.min(END, L.rx + L.v);
  // (riding the water: a gentle bob on the flat)
  L.float = base < 6 && Math.abs(slopeAt(L.rx)) < 0.15 ? Math.sin(L.t * 0.09) * 1.6 : 0;
  // (the lift hill's chain: clack clack)
  if (base < 1.5 && L.t % 14 === 0) playSound('click', 0.5, -6);
  // (paddling: a slap of water now and then; braking: a hiss)
  if (free && L.t % 14 === 0 && (controls.right || controls.left)) playSound('splash', 0.24, controls.right ? 4 : -4);
  // (and the water off his hands: thrown back paddling, curling up off them braking)
  if (free && L.t % 4 === 0 && L.up <= 0 && (controls.right || controls.left)) {
    const sw = L.rx > 5700 && L.rx < 8440;
    drops(state, riderX(r) + (controls.right ? -24 : 28), waterY(L.rx) - 2, 2, controls.right ? 3 : 5, 16, sw);
  }
  // (the water lapping at it, always; the real river rushing)
  if (L.t % 44 === 0) playSound('splash', 0.07, 6 + Math.random() * 6);
  if (realAt(L.rx) && L.t % 90 === 0) playSound('gush', 0.08, -10);
  // (spray off its nose, going)
  if (L.v > 2.4 && L.t % 3 === 0 && L.up <= 0) drops(state, X(L.rx) + 60, waterY(L.rx) - 2, 1, 2 + L.v * 0.6, 10, L.rx > 5700 && L.rx < 8440);
  if (L.splash > 0) L.splash++;
  // ---- the log's buck (a rock, a splashdown): up and back down on the water
  if (L.bob > 0 || L.bobV > 0) { L.bob += L.bobV; L.bobV -= 0.7; if (L.bob <= 0) { L.bob = 0; L.bobV = 0; } }
  // ---- him: the hop out of it and back in, a little back or on along it with left or right; facing the way he goes
  const dir = controls.right ? 1 : controls.left ? -1 : 0;
  if (dir && !p.inCutscene) p.facing = dir as 1 | -1;
  const jumpNow = !!controls.jump;
  if (jumpNow && !jumpWas.get(state) && L.up <= 0 && !p.inCutscene) {
    L.vy = JUMP_V; L.up = 0.01; L.hopV = free ? dir * HOP_DX : 0;
    playSound('jump', 0.7); playSound('splash', 0.3, 6);
    drops(state, riderX(r), waterY(L.rx) - 4, 8, 4, 50);
  }
  jumpWas.set(state, jumpNow);
  if (L.up > 0) {
    // (holding jump floats it a touch longer, as on foot)
    L.vy -= jumpNow && L.vy > 0 ? FALL * 0.75 : FALL;
    L.up += L.vy;
    L.hopV = free ? L.hopV + (dir * HOP_DX - L.hopV) * 0.2 : L.hopV * 0.8;
    L.off = Math.max(-OFF_MAX, Math.min(OFF_MAX, L.off + L.hopV));
    if (L.up <= 0) {
      L.up = 0; L.vy = 0; L.hopV = 0;
      playSound('land', 0.6); playSound('thud', 0.4, 4); playSound('splash', 0.35, 2);
      drops(state, riderX(r), waterY(L.rx) - 4, 10, 4, 70, L.rx > 5700 && L.rx < 8440);
    }
  }
  // (the log follows him: it catches up under him wherever he's hopped to)
  const catchUp = L.off * (L.up > 0 ? CATCH : CATCH * 1.8);
  L.rx = Math.max(START, Math.min(END, L.rx + catchUp)); L.off -= catchUp;
  if (Math.abs(L.off) < 0.05) L.off = 0;
  // ---- splashdowns: across the foot of a drop this frame: the big wave
  for (const [fx, sz] of DROPS) {
    if (startRx >= fx || L.rx < fx) continue;
    L.bobV = 8 + L.v * 0.5; L.splash = 1;
    bigSplash(state, r, X(fx), waterY(fx), fx > 5700 && fx < 8440, sz, speedAt(fx + 10)[1]);
  }
  // ---- checkpoints, as he passes them
  for (const c of RIDE_CPS) if (L.rx >= c.rx && state.checkpoint < c.cp) state.checkpoint = c.cp;
  // ---- what's said along the way (each once)
  for (const [k, at] of TRIGGERS) {
    if (r.said[k] || L.rx < at) continue;
    r.said[k] = true;
    const mine = MEATHEAD_AT[k];
    if (mine) meatheadSays(state, pickLine(byPants(state, mine)), true);
    const spiel = SPIEL_AT[k];
    if (spiel) paSay(r, pickLine(spiel));
    if (k === 'photo') { r.flash = 14; playSound('click', 1, 10); playSound('beep', 0.4, 12); }
  }
  if (r.flash > 0) r.flash--;
  place(state, r);
  // (sat in the log: on his feet as far as ducking goes; up out of it, in the air, stood up off his seat)
  p.isGrounded = L.up <= 0;
  p.logSeat = L.up <= 0;
  // (drawn turned with the log, all the way: art.ts turns the log about his feet, so the two stay one piece on a slope
  // and, ducked, he stays down inside it behind its near side)
  p.spriteRot = L.up > 0 ? 0 : logTilt(L.rx);
  // ---- the camera: ahead of him, at the log's height (not bobbing up with his hops)
  const ty = waterY(L.rx) - 420;
  L.camY += (ty - L.camY) * 0.25;
  // (coming up on the woodchipper: eased on ahead, so the chipper, the clearing past it and the JUMP! are all in view)
  const lead = L.rx > 10450 ? Math.min(150, (L.rx - 10450) * 0.6) : 0;
  state.cameraOverride = { x: Math.max(x0, Math.min(x1 - CANVAS_WIDTH, X(L.rx) - 290 + lead)), y: L.camY };
  setUi({ noSwitch: false });
  // (his left and right are the log's; no jumping off his own legs, no specials; down's his duck; fire's his)
  return { ...controls, left: false, right: false, jump: false, special: false, charge: false };
};
const jumpWas = new WeakMap<GameState, boolean>();

/** A board line from the operator or him as the log goes, once a ride. */
export const rideStartLine = (state: GameState) => meatheadSays(state, pickLine(byPants(state, RIDE_START)), true);
