// Riding the log: it follows the flume at the ride's own pace (the stretch's speed); left drags his hands in the water
// (brake), right paddles (faster), where the ride lets him (not on the chain, not down a drop); jump hops him up out
// of the log and back down into it (the log goes on under him: he's kept over it), down ducks him low in it. He can
// shoot (no specials: the charge, the slide and the rest need ground under them). The camera rides ahead of him.
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
import { X, x0, x1, waterY, speedAt, slopeAt, RIDE_CPS, START, END } from './layout';
import {
  RIDE_VOICES, RIDE_START, FIRST_SAW, LIFT_HILL, BIG_DROP, PHOTO, SEWER, RATS_SEEN, REAL_RIVER, FALLS, CHIPPER_SEEN,
  SPIEL_CREEK, SPIEL_MILL, SPIEL_DROP,
} from './lines';

/** How far down in the log his feet are (under the waterline's height off it), the log's length, its rim. */
export const SINK = 6, LOG_LEN = 136, RIM = 26;
const JUMP_V = 9.6, FALL = 0.5;

/** Where his feet are (world y), riding. */
export const feetY = (r: Ride) => waterY(r.log.rx) - SINK - r.log.bob - r.log.up;
/** His box riding (world): narrower than his sprite, his head lower when he's ducked. */
export const riderBox = (state: GameState) => {
  const r = rideOf(state), p = state.player, f = feetY(r);
  const top = f - (p.isDucking && r.log.up <= 0 ? 34 : 62);
  return { x: X(r.log.rx) - 15, y: top, w: 30, h: f - top };
};
export const riding = (state: GameState) => { const m = rideOf(state).log.mode; return m === 'ride' || m === 'scene'; };

/** Puts him in a log at `rx` (from the section's start). */
export const board = (state: GameState, rx: number, mode: 'ride' | 'scene' = 'ride') => {
  const r = rideOf(state), p = state.player, L = r.log;
  L.mode = mode; L.rx = Math.max(START, Math.min(END - 400, rx)); L.v = mode === 'scene' ? 0 : speedAt(L.rx)[1]; L.push = 1;
  L.up = 0; L.vy = 0; L.bob = 0; L.bobV = 0; L.t = 0; L.camY = waterY(L.rx) - 420;
  p.carried = true; p.noSpecials = true; p.vel.x = 0; p.vel.y = 0; p.facing = 1;
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
  p.carried = false; p.noSpecials = false; p.spriteRot = 0;
  state.cameraOverride = null;
  if (r.log.mode !== 'done') r.log.mode = 'off';
};

/** Keeps him stood in the log where it is (the scene at the station: it's not going yet). */
export const holdInLog = (state: GameState) => { const r = rideOf(state); place(state, r); state.player.isGrounded = true; state.player.facing = 1; };
const place = (state: GameState, r: Ride) => {
  const p = state.player;
  p.pos.x = X(r.log.rx) - p.width / 2;
  p.pos.y = feetY(r) - p.height;
  p.vel.x = 0; p.vel.y = r.log.up > 0 ? -r.log.vy : 0;
};

/** What he says (and the ride's spiel) at each stretch, once: [key, at x]. */
const TRIGGERS: [string, number][] = [
  ['first', 1130], ['creek', 1840], ['lift', 2560], ['mill', 3040], ['spieldrop', 3800], ['drop', 3920], ['photo', 4230],
  ['sewer', 5960], ['rats', 6440], ['river', 8680], ['falls', 9740], ['chipper', 10560],
];
const MEATHEAD_AT: Record<string, ByPants> = { first: FIRST_SAW, lift: LIFT_HILL, drop: BIG_DROP, photo: PHOTO, sewer: SEWER, rats: RATS_SEEN, river: REAL_RIVER, falls: FALLS, chipper: CHIPPER_SEEN };
const SPIEL_AT: Record<string, string[]> = { creek: SPIEL_CREEK, mill: SPIEL_MILL, spieldrop: SPIEL_DROP };

export const paSay = (r: Ride, text: string) => speak(RIDE_VOICES.spiel, text, s => { r.pa = s; }, true);

/** A frame of the ride. */
export const updateRide = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, r = rideOf(state), L = r.log;
  if (p.health <= 0) { unboard(state); return controls; }
  L.t++;
  // ---- the pace: the stretch's, his brake or paddle on top where the ride lets him
  const [, base, free] = speedAt(L.rx);
  const want = free ? (controls.right ? 1.4 : controls.left ? 0.55 : 1) : 1;
  L.push += (want - L.push) * 0.06;
  const target = base * (free ? L.push : 1);
  // (down a drop it builds; anything else eases to it)
  L.v += (target - L.v) * (base > 6 ? 0.12 : 0.07);
  const before = L.rx;
  L.rx = Math.min(END, L.rx + L.v);
  // (the lift hill's chain: clack clack)
  if (base < 1.5 && L.t % 14 === 0) playSound('click', 0.5, -6);
  // (paddling: a slap of water now and then; braking: a hiss)
  if (free && L.t % 18 === 0 && (controls.right || controls.left)) playSound('splash', 0.18, controls.right ? 4 : -4);
  // ---- splashdowns: off a drop onto the flat
  const slopeWas = slopeAt(before), slopeNow = slopeAt(L.rx);
  if (slopeWas > 0.35 && slopeNow < 0.15) {
    L.bobV = 6 + L.v * 0.4; L.splash = 1; playSound('splash', 1, -6); shakeScreen(state, 8, 4);
    for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: X(L.rx) + (Math.random() - 0.3) * 120, y: waterY(L.rx) }, vel: { x: (Math.random() - 0.2) * 8, y: -3 - Math.random() * 9 }, life: 40, color: i % 2 ? '#E0F2FE' : '#93C5FD', size: 3 + Math.random() * 4 });
  }
  if (L.splash > 0) L.splash++;
  // ---- the log's buck (a rock, a splashdown): up and back down on the water
  if (L.bob > 0 || L.bobV > 0) { L.bob += L.bobV; L.bobV -= 0.7; if (L.bob <= 0) { L.bob = 0; L.bobV = 0; } }
  // ---- him: the hop out of it and back in
  const jumpNow = !!controls.jump;
  if (jumpNow && !jumpWas.get(state) && L.up <= 0 && !p.inCutscene) { L.vy = JUMP_V; L.up = 0.01; playSound('jump', 0.7); }
  jumpWas.set(state, jumpNow);
  if (L.up > 0) {
    // (holding jump floats it a touch longer, as on foot)
    L.vy -= jumpNow && L.vy > 0 ? FALL * 0.75 : FALL;
    L.up += L.vy;
    if (L.up <= 0) { L.up = 0; L.vy = 0; playSound('land', 0.6); playSound('thud', 0.4, 4); }
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
  // (stood in the log: on his feet, for ducking; up out of it, in the air)
  p.isGrounded = L.up <= 0;
  p.facing = 1;
  p.spriteRot = L.up > 0 ? 0 : slopeAt(L.rx) * 0.6;
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
