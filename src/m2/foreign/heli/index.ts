// HELICOPTER RIDES ACROSS THE WORLD: the land's second stretch (about half its play time), and its mini-boss rush.
// Walked straight into off the end of Canada (no cut: the helipad's on the end of the promenade).
//
//   THE HELIPAD: the big health + ammo and checkpoint 110 before the ride; the queue (three hours long, the guests in
//     it yelling at him as he walks past all of them); HELICOPTER HARRY waving by his helicopter.
//   THE BOARDING (a cutscene: HUD hidden, SKIP >> for the lot, from here to his taking the controls): he's at the front
//     of the line, climbs in the back; Harry's welcome (no judgment: by his pants). Up off the pad, the camera going up
//     with it and ZOOMING OUT, the park opening up below (park.ts: the clearing's orbit trick, the whole of Foreign Lands
//     laid out round the lagoon, the giant landmarks stood round it on their circuit).
//   THE TOUR: round the park, the giant replicas coming round on their plinths ("IN AMERICA, EVERYTHING IS BIGGER.
//     EVEN OTHER PLACES."), Harry preaching tolerance and reusable straws; "SHUT UP, HIPPIE."; Harry out the door, all
//     the way down onto the park's service road, flat on his back; Meathead over into the pilot's seat; Harry up, the
//     act dropped, swearing, the ride's REMOTE out; the landmarks stir. No cut: the tour becomes the shooter.
//   THE GAUNTLET (his: copter.ts the flying, mechs.ts the nine landmarks and each one's arrival, goons.ts the lackeys
//     between them, park.ts the circuit going round): each landmark comes round in front, rises out of the ground and
//     fights; the beaten ones' wrecks stay where they fell. Harry's on the ground the whole time, chasing along after
//     the helicopter (on foot, jetpack hops), yelling up, keying the remote; out of the fight. Checkpoints 111-119, one
//     per landmark (starting again at one: the park round to it, the wrecks before it in place, straight into it). A big
//     health + ammo after every one.
//   THE END (a cutscene): Harry, furious, shoots him out of the sky with a rocket launcher from the ground; the fall; the
//     white; Harry's arena (DOORS.harry.start: job 5's).
//
// Back here after it's over (walking back from Harry's arena): no helicopter, a scorch on the pad, the ride closed, the
// queue gone home.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Pickup } from '../../../m1/types';
import { GRAVITY, CANVAS_WIDTH, topBand } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { setUi } from '../../store';
import { setDropTable } from '../../../m1/game/core/effects';
import type { ForeignSection } from '../section';
import { layOwn, endWalls, endExits, runExits, meatheadSays, hands, teleport, saidOver, box, label } from '../section';
import { DOORS } from '../geometry';
import { registerHurts } from '../pavilion';
import { viewIn, promenade, postBoard, onScreen, LOOKS, INK, dimmed, hour, setBack, at, topBack, ramp6, checker, still, timeOfDay, box as kbox } from '../kit';
import { lookOf } from '../../adventure/temple/people';
import { markBossFight } from '../../bossQuiet';
import { heliOf, type Heli } from './state';
import { x0, x1, X, GY, REFILL, CP_PAD, QUEUE_A, QUEUE_B, BOARD_AT, PAD_X, PAD_O, SEAT_BACK, SEAT_FRONT, CAMX, CY, Z, SW, SH, CAM_FLY, toWorld, CP_X, MEMO } from './geo';
import { flyCopter, updateRockets, drawCopter, drawRockets, heliMeters } from './copter';
import { makeMechs, startMech, updateMechs, mechDone } from './mechs';
import { WAVES, goonsLeft, sweepGoons, fightGroup, tickEntrances, drawEntrances } from './goons';
import { shredHold } from './shred';
import { drawPark, roadY, panicAt, inWorld, RISE, fireLamps } from './park';
import { drawAttacks } from './mechArt';
import { drawLandmarkWorld } from './landmarks3d';
import { drawStreetsBackdrop } from '../backdrop';
import { drawHarry } from './harryArt';
import { harrySays, guestShouts, quiet, harryFrom, harryPick, harrySaid } from './talk';
import {
  HURT, MECHS, MECH_NAME, QUEUE_SHOUT, QUEUE_SHOUT_SHAT, QUEUE_SHOUT_NUDE, HARRY_BOARD, HARRY_TOUR, MH_TOUR, MH_SHUT_UP, HARRY_SHOVED,
  HARRY_TURNS, MH_TAKES, HARRY_HECKLE, HARRY_GOONS, HARRY_GLOAT, HARRY_END, MH_ROCKET, HARRY_HIT,
} from './lines';

registerHurts(HURT);

const CHECKPOINTS = [
  { name: 'HELICOPTER RIDES ACROSS THE WORLD', cp: 110, x: X(CP_PAD), y: GY },
  ...MECHS.map((id, i) => ({ name: `HELICOPTER: ${MECH_NAME[id].replace(/ \(.*\)$/, '')}`, cp: 111 + i, x: CP_X, y: GY, manual: true })),
];

/** Where the helicopter's held during the tour and handed over (screen, at the flight's zoom: his feet). */
const TOUR_AT = { x: 250, y: 300 };
/** Harry on the ground: how big he's drawn (he's a small figure down there, but he has to read), his running speed. */
const HARRY_SCALE = 0.78, HARRY_RUN = 2.6;
/** Where a landmark's words go (screen): over its head. */
const BASE_SAY = { x: 600, y: 120 };
/** The ground under Harry at world x (the park's service road, down below). */
const roadAt = (wx: number) => CY + roadY((wx - CAMX) * Z) / Z;

// ---------------------------------------------------------------------------------------------------------------
// The camera

const holdCam = (state: GameState, h: Heli, x: number, y: number) => {
  h.cam = true; h.camX = x; h.camY = y;
  state.camera.x = x; state.camera.y = y;
  state.cameraOverride = { x, y };
  // (zoomed out, the whole view's the screen for the rules: what he can see, he can shoot)
  state.viewIsScreen = true;
};
const letCamGo = (state: GameState, h: Heli) => { if (h.cam) { state.cameraOverride = null; h.cam = false; } state.viewIsScreen = false; h.zoom = 1; h.pull = 1; };

/** His feet into his seat, the helicopter's origin at (ox, oy). */
const seatHim = (state: GameState, h: Heli) => {
  const p = state.player;
  p.carried = true; p.cartSeat = true; p.isGrounded = false; p.facing = 1; p.vel.x = 0; p.vel.y = 0;
  p.pos.x = h.ox + h.seat - p.width / 2; p.pos.y = h.oy - p.height;
};
const feetOf = (state: GameState) => ({ x: state.player.pos.x + state.player.width / 2, y: state.player.pos.y + state.player.height });

// ---------------------------------------------------------------------------------------------------------------
// Into flight (handed over after the tour, or starting again at a landmark's checkpoint)

const takeOff = (state: GameState, h: Heli, at: number) => {
  const p = state.player;
  h.phase = 'fly'; h.t = 0; h.turned = true; h.seat = SEAT_FRONT; h.flags.door = false;
  if (!h.mechs.length) h.mechs = makeMechs();
  h.mechs.forEach((m, i) => { if (i < at) m.st = 'dead'; });
  h.cur = at; h.prog = at - RISE[at].d;
  p.inCutscene = false; p.noSpecials = true; p.spriteRot = 0;
  setUi({ noSwitch: true });
  h.zoom = Z; h.up = 1; h.pull = 1; h.pullX = SW / 2; h.pullY = SH / 2; h.tilt = 0; p.kickPose = 0;
  holdCam(state, h, CAM_FLY.x, CAM_FLY.y);
  const spot = toWorld(TOUR_AT.x, TOUR_AT.y);
  h.ox = spot.x - h.seat; h.oy = spot.y;
  seatHim(state, h);
  // (Harry down on the ground, if he isn't already (starting again up here, or the tour skipped))
  if (!h.flags.landed) { h.flags.landed = true; h.hx = toWorld(200, 0).x; h.hy = roadAt(h.hx); h.hvx = 0; h.hvy = 0; h.hop = 0; }
  h.hpose = 'run';
  h.heckleAt = state.frame + 700;
};

/** Starting again at a landmark: straight into it. */
const startAt = (state: GameState, h: Heli, i: number) => {
  takeOff(state, h, i);
  h.transit = false; h.waves = [];
  h.flags.introAt = true;
  h.t = -60;
  if (!state.stageMemo[MEMO.tips]) { state.stageMemo[MEMO.tips] = '1'; h.tips = 600; }
};

/** The tour's over: his. The first wave (the lesson), then the Eiffel Tower. */
const handOver = (state: GameState, h: Heli) => {
  takeOff(state, h, 0);
  beginTransit(state, h, 0);
  h.transitFrom = 0;
  state.stageMemo[MEMO.tips] = '1'; h.tips = 720;
  if (state.checkpoint < 111) state.checkpoint = 110;
};

/** Between landmarks, how long (frames) it waits on lackeys still out with none being killed before they fly off. */
const STRAGGLER_WAIT = 240;
const beginTransit = (state: GameState, h: Heli, i: number) => {
  h.transit = true; h.transitFrom = h.prog; h.transitT = 0; h.cur = i;
  h.waves = [...WAVES[i]]; h.waveAt = state.frame + 90;
};

/** A big health floated out after every landmark (the user's), in front of him. No ammo up here: the helicopter's
 *  guns don't use it (the lackeys drop health only, FLY_DROPS). */
const refillAfter = (state: GameState, i: number) => {
  state.pickups.push({ id: `hl-sky-health-${i}`, pos: toWorld(520, 280), vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
};
/** What the lackeys drop up here (health only, at the park's rate), and the park's own, back on the ground. */
const FLY_DROPS = { health: 0.06, ammo: 0 }, PARK_DROPS = { health: 0.06, ammo: 0.05 };

// ---------------------------------------------------------------------------------------------------------------
// The helipad and the boarding

const PAD_GUESTS = Array.from({ length: 22 }, (_, i) => ({ x: QUEUE_A + 20 + i * ((QUEUE_B - QUEUE_A - 40) / 21), row: i % 2, seed: 4000 + i * 37 }));

const padUpdate = (ctx: FrameContext, h: Heli, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2, rx = cx - x0;
  h.ox = PAD_O.x; h.oy = PAD_O.y; h.seat = SEAT_BACK; h.rotor += 0.05;
  state.viewIsScreen = false;
  h.hx = PAD_O.x + 110; h.hy = GY; h.hpose = 'wave';
  // (the queue yelling at him as he walks past the lot of them)
  if (p.health > 0 && rx > QUEUE_A - 40 && rx < QUEUE_B + 40 && state.frame % 40 === 0 && Math.random() < 0.6) {
    const g = PAD_GUESTS.reduce((a, b) => (Math.abs(X(b.x) - cx) < Math.abs(X(a.x) - cx) ? b : a));
    guestShouts(state, pickLine(isNude(state) ? [...QUEUE_SHOUT_NUDE, ...QUEUE_SHOUT] : isShat(state) ? [...QUEUE_SHOUT_SHAT, ...QUEUE_SHOUT] : QUEUE_SHOUT), X(g.x), g.seed);
  }
  if (p.health > 0 && !p.inCutscene && rx >= BOARD_AT) { h.phase = 'board'; h.t = 0; h.step = 0; }
  return controls;
};

const boardUpdate = (ctx: FrameContext, h: Heli): Controls => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  p.inCutscene = true;
  h.ox = PAD_O.x; h.oy = PAD_O.y; h.seat = SEAT_BACK; h.rotor += 0.08;
  const seatX = PAD_O.x + SEAT_BACK;
  if (h.step === 0) {
    // (over to it, past the front of the line)
    h.hpose = 'wave';
    if (h.t === 1) harrySays(state, harryFrom(state, HARRY_BOARD), true, () => { h.flags.welcomed = true; });
    if (cx < seatX - 30 && h.t < 300) return { ...hands(), right: true };
    h.step = 1; h.t = 0; h.flags.fromX = true; (h as unknown as { boardHop: { x: number; y: number } }).boardHop = { x: cx, y: p.pos.y + p.height };
    playSound('jump', 0.6);
  }
  if (h.step === 1) {
    // (the hop in)
    const hop = (h as unknown as { boardHop: { x: number; y: number } }).boardHop, k = Math.min(1, h.t / 18);
    p.carried = true; p.vel.x = 0; p.vel.y = 0;
    const fx = hop.x + (seatX - hop.x) * k, fy = hop.y + (PAD_O.y - hop.y) * k - Math.sin(k * Math.PI) * 40;
    p.pos.x = fx - p.width / 2; p.pos.y = fy - p.height;
    if (k >= 1) { seatHim(state, h); h.step = 2; h.t = 0; playSound('thud', 0.5, 4); }
    return hands();
  }
  seatHim(state, h);
  // (Harry in the pilot's seat; once he's done talking, up)
  if (h.t === 10) { h.hpose = 'pilot'; playSound('engine', 0.6, -6); }
  if (h.hpose === 'pilot') { h.hx = h.ox + SEAT_FRONT; h.hy = h.oy; }
  if (h.t > 40 && (h.flags.welcomed || h.t > 900)) { h.phase = 'lift'; h.t = 0; h.flags.liftFrom = true; liftFrom.set(h, { x: state.camera.x, y: state.camera.y }); }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// The lift and the tour

const LIFT = 210;
/** The camera where the lift began (each helicopter's run). */
const liftFrom = new WeakMap<Heli, { x: number; y: number }>();
const ease = (k: number) => k * k * (3 - 2 * k);
const liftUpdate = (ctx: FrameContext, h: Heli): Controls => {
  const { state } = ctx, p = state.player;
  p.inCutscene = true;
  h.rotor += 0.6;
  const k = ease(Math.min(1, h.t / LIFT));
  // (from where the camera was when the lift began: held there, not h.camX (holdCam moves that every frame, and the
  // camera would race up ahead of him, leaving him "fallen" off the bottom of it))
  const from = liftFrom.get(h) ?? { x: h.camX, y: h.camY };
  // (up and over: from the pad to the tour's spot; the camera up with it, ZOOMING OUT as it goes (the park opening up
  // below: its camera climbing too), so the tour's already the flight's view)
  const to = toWorld(TOUR_AT.x, TOUR_AT.y), tx = to.x - SEAT_FRONT, ty = to.y;
  h.ox = PAD_O.x + (tx - PAD_O.x) * k; h.oy = PAD_O.y + (ty - PAD_O.y) * k + (k < 0.1 ? -k * 40 : 0);
  h.zoom = 1 + (Z - 1) * k; h.up = k; h.pull = 1;
  holdCam(state, h, from.x + (CAM_FLY.x - from.x) * k, from.y + (CAM_FLY.y - from.y) * k);
  h.hx = h.ox + SEAT_FRONT; h.hy = h.oy; h.hpose = 'pilot';
  seatHim(state, h);
  if (h.t === 1) { playSound('whoosh', 0.8, -14); shakeScreen(state, 3, 3); }
  if (h.t % 20 === 0) playSound('engine', 0.5, -8);
  if (h.t === 30) harrySays(state, HARRY_TOUR[0], true, () => { h.flags.t0 = true; });
  if (h.t >= LIFT) { h.phase = 'tour'; h.t = 0; h.step = 0; }
  h.prog = -2.6;
  return hands();
};

/** The tour's script: Harry and him, one after another (each waits for the last). */
const TOUR: { who: 'harry' | 'mh'; line: () => string }[] = [
  { who: 'harry', line: () => HARRY_TOUR[1] }, { who: 'mh', line: () => MH_TOUR[0] },
  { who: 'harry', line: () => HARRY_TOUR[2] }, { who: 'mh', line: () => MH_TOUR[1] },
  { who: 'mh', line: () => MH_SHUT_UP },
];

const tourUpdate = (ctx: FrameContext, h: Heli): Controls => {
  const { state } = ctx, p = state.player, f = state.frame;
  p.inCutscene = true;
  h.rotor += 0.6;
  h.spin += 0.0015;
  if (h.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { skipTour(state, h); return hands(); } }
  // (the park turning round toward the Eiffel Tower as he talks)
  h.prog = Math.min(-RISE[0].d, h.prog + 0.0035);
  // (the helicopter bobbing where it's held; him over into the pilot's seat once Harry's gone)
  { const at = toWorld(TOUR_AT.x, TOUR_AT.y); h.ox = at.x - SEAT_FRONT + Math.sin(f * 0.03) * 4; h.oy = at.y + Math.sin(f * 0.05) * 5; }
  if (h.flags.shoved) h.seat = Math.min(SEAT_FRONT, h.seat + 1.6);
  // (the wobble from the kick, dying away; the view easing back out after it)
  if (h.flags.shoved) { const w = h.step === TOUR.length ? h.t - 30 : h.t + 28; h.tilt = Math.sin(w * 0.45) * 0.22 * Math.max(0, 1 - w / 70); p.spriteRot = h.tilt; }
  if (h.step > TOUR.length && h.pull > 1) h.pull = Math.max(1, h.pull - 0.035);
  seatHim(state, h);
  const fly = (step: number) => { h.step = step; h.flags.busy = false; };
  // The script: Harry's tour and his answers; SHUT UP, HIPPIE.; out the door
  if (h.step < TOUR.length) {
    if (!h.flags.busy && (h.flags.t0 || h.t > 600)) {
      h.flags.busy = true;
      const s = TOUR[h.step], next = h.step + 1;
      if (s.who === 'harry') harrySays(state, s.line(), true, () => fly(next));
      else meatheadSays(state, s.line(), true, () => fly(next));
    }
    h.hx = h.ox + SEAT_FRONT; h.hy = h.oy; h.hpose = 'pilot';
    return hands();
  }
  if (h.step === TOUR.length) {
    // THE KICK (the user: "show meathead kicking the hippie off"): the view punches in on the cabin; he turns in his
    // seat and plants his boot in Harry; Harry out the door, arms flailing, yelling; the helicopter wobbles; then back
    // out (the fall and the landing go on below), him sliding over into the pilot's seat
    if (!h.flags.kick) { h.flags.kick = true; h.t = 0; h.flags.door = true; playSound('whoosh', 0.5, 8); }
    const cab = { x: TOUR_AT.x + 10 * Z, y: TOUR_AT.y - 50 * Z };
    h.pullX = cab.x; h.pullY = cab.y;
    h.pull = 1 + 0.9 * ease(Math.min(1, h.t / 22));
    if (h.t === 22) { p.kickPose = 22; playSound('whoosh', 0.8, -4); }
    if (h.t === 30) {
      // (the boot lands: WHAM)
      h.flags.shoved = true; h.hpose = 'shoved'; h.hvx = 4.5; h.hvy = -3.5; h.flags.wham = true;
      playSound('punch', 1, -8); playSound('crunch', 0.6, 4); shakeScreen(state, 8, 6);
      harrySays(state, HARRY_SHOVED[0], true);
    }
    if (h.flags.shoved) { h.hvy += 0.35; h.hx += h.hvx; h.hy += h.hvy; } else { h.hx = h.ox + SEAT_FRONT; h.hy = h.oy; h.hpose = 'pilot'; }
    if (h.t >= 58) { h.step++; h.t = 0; h.flags.wham = false; }
    return hands();
  }
  if (h.step === TOUR.length + 1) {
    // (Harry falling away, all the way down to the park, flat on his back on the service road; him into the pilot's
    // seat; his line; Harry up on his feet, red-faced, the remote out; the act dropped; he wakes the landmarks)
    if (!h.flags.landed) {
      h.hvy += 0.35; h.hx += h.hvx; h.hy += h.hvy; if (h.t > 20) h.hpose = 'fall';
      const gy = roadAt(h.hx);
      if (h.hy >= gy) {
        h.hy = gy; h.flags.landed = true; h.hpose = 'down'; h.hvx = 0; h.hvy = 0;
        playSound('thud', 1, -8); playSound('crunch', 0.6, 2); shakeScreen(state, 4, 4);
        for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: h.hx + (Math.random() - 0.5) * 40, y: gy - 4 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 30, color: '#A8A29E', size: 4 + Math.random() * 4 });
      }
    }
    if (h.t === 50) { h.flags.door = false; meatheadSays(state, pickLine(MH_TAKES), true, () => { h.flags.took = true; }); }
    if (h.flags.landed && (h.flags.took || h.t > 600) && h.t > 160 && !h.flags.turning) {
      h.flags.turning = true; h.hpose = 'remote'; h.remote = 9999;
      playSound('engine', 0.5, 10);
      harrySays(state, HARRY_TURNS[0], true, () => harrySays(state, HARRY_TURNS[1], true, () => {
        harrySays(state, HARRY_TURNS[2], true, () => { h.flags.woke = true; });
        // (the landmarks stirring: a rumble right round the park, their eyes on (shut: asleep till each one's called))
        setTimeout(() => { h.turned = true; }, 1200);
      }));
    }
    if (h.turned && !h.flags.woken) { h.flags.woken = true; playSound('rumble', 1, -10); playSound('clang', 0.9, -8); shakeScreen(state, 10, 6); }
    if (h.flags.woke && h.turned) { h.remote = 0; handOver(state, h); }
  }
  return hands();
};

const skipTour = (state: GameState, h: Heli) => {
  silenceAll(); h.harry = null; h.harryBusy = false; h.mech = null;
  handOver(state, h);
};

// ---------------------------------------------------------------------------------------------------------------
// The gauntlet

const flyUpdate = (ctx: FrameContext, h: Heli, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, f = state.frame;
  h.spin += 0.0015;
  holdCam(state, h, CAM_FLY.x, CAM_FLY.y);
  h.pull = 1;
  flyCopter(ctx, controls);
  const ft = feetOf(state); h.ox = ft.x - h.seat; h.oy = ft.y;
  updateRockets(ctx);
  updateMechs(ctx);
  tickEntrances(state);
  sweepGoons(state);
  // (the checkpoint's own: nothing to walk past up here)
  if (h.tips > 0 && --h.tips === 0) setUi({ heliTips: false }); else if (h.tips > 0) setUi({ heliTips: true });
  // Between landmarks: the park turning the next one round in front; the waves, one after another
  if (h.transit) {
    h.transitT++;
    // (round to just short of it: it comes up somewhere off ahead, and the camera comes the rest of the way round as it
    // arrives)
    h.prog = Math.min(h.cur - RISE[h.cur].d, h.transitFrom + h.transitT / 320);
    const died = h.goons.filter(e => e.health <= 0 || e.isBlownAway).length;
    if (died) h.killAt = f;
    if (died && Math.random() < 0.2) harrySays(state, harryPick(HARRY_GOONS), false);
    let left = goonsLeft(state);
    // (never stuck waiting on a lackey that won't die or leave (one hung up at the edge of the view, a fight's group
    // still about): a while with nothing killed, and whoever's left flies off)
    if (left > 0 && f - Math.max(h.killAt ?? 0, h.waveAt, h.goonLandAt) > STRAGGLER_WAIT) {
      for (const e of h.goons) (e as typeof e & { gone?: boolean }).gone = true;
      sweepGoons(state); left = goonsLeft(state);
    }
    if (h.waves.length && left === 0 && f >= h.waveAt) { const w = h.waves.shift()!; w(state); h.waveAt = f + 150; }
    if (!h.waves.length && left === 0 && h.prog >= h.cur - RISE[h.cur].d - 1e-6 && f >= h.waveAt - 90) {
      h.transit = false;
      if (state.checkpoint < 111 + h.cur) state.checkpoint = 111 + h.cur;
      callUp(state, h, h.cur);
    }
  } else if (h.flags.introAt && h.t >= 0) {
    h.flags.introAt = false;
    callUp(state, h, h.cur);
  } else if (mechDone(state)) {
    state.stageMemo[MEMO.wrecks] = String(h.cur + 1);
    if (h.cur >= MECHS.length - 1) { endBegin(state, h); return hands(); }
    refillAfter(state, h.cur);
    beginTransit(state, h, h.cur + 1);
  }
  // (lackeys sent in during a fight too, every 8-12 s, from all round; not while it's arriving, not at the Leaning
  // Tower (its lean has to read), never more than a handful out)
  { const cm = h.mechs[h.cur];
    if (!h.transit && cm?.st === 'fight' && cm.id !== 'pisa') {
      if (h.fightGoonAt === 0) h.fightGoonAt = f + 360;
      if (f >= h.fightGoonAt) { if (goonsLeft(state) < 4) { fightGroup(state, h.cur, h.fightGoonN++); } h.fightGoonAt = f + 480 + Math.floor(Math.random() * 240) - h.cur * 12; }
    } else { h.fightGoonAt = 0; } }
  // (arriving, the camera comes the rest of the way round to it: there exactly as its fight starts)
  { const cm = h.mechs[h.cur]; if (!h.transit && cm?.st === 'intro') { const q = Math.min(1, cm.t / (cm.introLen * 0.95)); h.prog = h.cur - RISE[h.cur].d * (1 - q * q * (3 - 2 * q)); } else if (!h.transit && cm && (cm.st === 'fight' || cm.st === 'dying')) h.prog = h.cur; }
  // Harry down on the ground, chasing after him, swearing up at him, working the remote
  harryRuns(state, h);
  if (p.health > 0 && f > h.heckleAt && quiet(state)) { h.heckleAt = f + 800 + Math.random() * 400; harrySays(state, harryFrom(state, HARRY_HECKLE), false); }
  if (h.lastHp >= 0 && p.health < h.lastHp && p.health > 0 && f - h.gloatAt > 600 && Math.random() < 0.3) { h.gloatAt = f; harrySays(state, harryPick(HARRY_GLOAT), false); }
  h.lastHp = p.health;
  // (what's dropped up here floats)
  for (const q of state.pickups as Pickup[]) if (q.pos.y < GY - 1000) { q.vel.x = 0; q.vel.y = -GRAVITY; }
  return hands();
};

/** A landmark called up: it arrives (mechs.ts), the guests round its plinth scatter, Harry keys his remote. */
const callUp = (state: GameState, h: Heli, i: number) => {
  startMech(state, i);
  panicAt(h, i, state.frame);
};

/**
 * Harry on the ground (no hitbox: he's out of the fight till the end): along the park's service road after the
 * helicopter, a little behind it, on foot; too far behind, a hop on the emergency jetpack (flames, a bounce); stopped
 * to key the remote while a landmark's coming up, shaking it up at him.
 */
const harryRuns = (state: GameState, h: Heli, stopAtSx?: number) => {
  const p = state.player;
  const heliSx = (p.pos.x + p.width / 2 - CAMX) * Z;
  const want = Math.max(60, Math.min(740, stopAtSx ?? heliSx - 70)), wx = toWorld(want, 0).x;
  const dx = wx - h.hx, still = h.remote > 0 || (stopAtSx !== undefined && Math.abs(dx) < 6);
  if (h.remote > 0) h.remote--;
  if (h.hop > 0 || h.hvy !== 0) {
    // (a jetpack hop: up, over, down)
    h.hvy += 0.32; h.hy += h.hvy; h.hx += h.hvx;
    const gy = roadAt(h.hx);
    if (h.hy >= gy) { h.hy = gy; h.hvy = 0; h.hop = 0; playSound('thud', 0.4, 6); }
  } else if (!still && Math.abs(dx) > 340) {
    h.hop = 1; h.hvy = -7.5; h.hvx = Math.sign(dx) * 6.5; playSound('ignite', 0.5, 6);
  } else {
    h.hvx = still || Math.abs(dx) < 8 ? 0 : Math.sign(dx) * Math.min(HARRY_RUN, Math.abs(dx) * 0.05 + 0.6);
    h.hx += h.hvx; h.hy = roadAt(h.hx);
  }
  h.hfacing = heliSx > (h.hx - CAMX) * Z ? 1 : -1;
  h.hpose = h.hop > 0 || h.hvy !== 0 ? 'jet' : still ? 'remote' : Math.abs(h.hvx) > 0.2 ? 'run' : 'remote';
};

// ---------------------------------------------------------------------------------------------------------------
// The end: Harry's rocket, fired up from the ground, the fall, on to his arena

const endBegin = (state: GameState, h: Heli) => {
  h.phase = 'end'; h.t = 0; h.step = 0; h.boost = null;
  for (const e of h.goons) e.health = 0;
  state.enemies = state.enemies.filter(e => !h.goons.includes(e));
  setUi({ heliTips: false });
};

/** The launcher's angle up at him from Harry's shoulder (radians up from level, his way), and its muzzle (world). */
const aimAtHim = (state: GameState, h: Heli) => {
  const ft = feetOf(state), sx = h.hx, sy = h.hy - 60 * HARRY_SCALE;
  const a = Math.atan2(sy - (ft.y - 40), Math.abs(ft.x - sx));
  return { a, mx: sx + h.hfacing * Math.cos(a) * 40 * HARRY_SCALE, my: sy - Math.sin(a) * 40 * HARRY_SCALE };
};

const endUpdate = (ctx: FrameContext, h: Heli): Controls => {
  const { state } = ctx, p = state.player, f = state.frame;
  p.inCutscene = true; p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  holdCam(state, h, CAM_FLY.x, CAM_FLY.y);
  h.pull = 1;
  if (h.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); finish(state, h); return hands(); } }
  h.rotor += 0.7; h.spin += 0.0015;
  updateRockets(ctx); updateMechs(ctx);
  if (h.step === 0) {
    // (him, eased to a hover; Harry running in under him, stopping; his rant, the launcher up at him)
    const to = toWorld(260, 330);
    h.ox += (to.x - h.seat - h.ox) * 0.03; h.oy += (to.y - h.oy) * 0.03; h.tilt *= 0.9; h.flip *= 0.8;
    p.spriteRot = h.tilt + h.flip * Math.PI;
    seatHim(state, h);
    if (h.hpose !== 'aim') harryRuns(state, h, 470);
    if (h.t === 40) harrySays(state, harryFrom(state, HARRY_END), true, () => { h.hpose = 'aim'; meatheadSays(state, pickLine(MH_ROCKET), true, () => { h.flags.fire = true; }); });
    if (h.flags.fire || h.t > 1200) {
      h.step = 1; h.t = 0; h.hpose = 'fire';
      const m = aimAtHim(state, h);
      h.hrocket = { x: m.mx, y: m.my };
      playSound('boom', 0.7, 8); playSound('whoosh', 1, -4);
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: m.mx, y: m.my }, vel: { x: (Math.random() - 0.5) * 3, y: Math.random() * 2 }, life: 30, color: i % 2 ? '#E5E7EB' : '#A1A1AA', size: 6 + Math.random() * 6 });
    }
  } else if (h.step === 1) {
    // (the rocket: up off the ground, right at him)
    seatHim(state, h);
    const r = h.hrocket!, ft = feetOf(state), tx = ft.x, ty = ft.y - 40, d = Math.hypot(tx - r.x, ty - r.y) || 1;
    r.x += (tx - r.x) / d * 12; r.y += (ty - r.y) / d * 12;
    if (h.t > 8) h.hpose = 'remote';
    if (f % 2 === 0) state.particles.push({ pos: { x: r.x, y: r.y }, vel: { x: 0, y: 0 }, life: 24, color: '#D4D4D8', size: 5 });
    if (d < 20) {
      h.hrocket = null; h.step = 2; h.t = 0; h.vy = -4;
      h.booms.push({ x: tx, y: ty, r: 130, t: 0, big: true });
      playSound('boom', 1, -12); playSound('crash', 1, -6); shakeScreen(state, 24, 12);
      harrySays(state, HARRY_HIT[0], true);
    }
  } else if (h.step === 2) {
    // (hit: burning, spinning, down off the bottom of the screen)
    h.vy = Math.min(14, h.vy + 0.3); h.tilt += 0.09;
    h.ox += -0.8; h.oy += h.vy;
    p.spriteRot = h.tilt;
    seatHim(state, h);
    if (f % 3 === 0) state.particles.push({ pos: { x: h.ox - 40, y: h.oy - 60 }, vel: { x: -1, y: -2 }, life: 40, color: f % 6 ? '#3F3F46' : '#F97316', size: 8 + Math.random() * 8 });
    if (h.oy > toWorld(0, SH).y + 120) { h.step = 3; h.t = 0; playSound('boom', 1, -16); playSound('crash', 1, -10); shakeScreen(state, 30, 20); }
  } else if (h.step === 3) {
    // (the crash, off the bottom: the white; then down at the crash site)
    h.white = Math.min(1, h.t / 10);
    if (h.t > 50) finish(state, h);
  }
  return hands();
};

/** On to Harry's arena, cleanly: his own self again, on his feet, the camera his. */
const finish = (state: GameState, h: Heli) => {
  const p = state.player;
  state.stageMemo[MEMO.done] = '1';
  state.stageMemo[MEMO.wrecks] = String(MECHS.length);
  h.phase = 'gone'; h.over = true; h.white = 0; h.hrocket = null;
  for (const q of h.shots.keys()) q.health = 0;
  h.shots.clear(); h.beams = []; h.drops = []; h.minions = []; h.rockets = [];
  p.carried = false; p.cartSeat = false; p.copterSeat = undefined; p.hidden = false; p.spriteRot = 0; p.inCutscene = false; p.noSpecials = false;
  p.vel.x = 0; p.vel.y = 0; p.facing = 1; p.invincibilityTimer = 0;
  setUi({ noSwitch: false, heliTips: false });
  setDropTable(PARK_DROPS);
  letCamGo(state, h);
  teleport(state, DOORS.harry.start.x, DOORS.harry.start.y);
  state.camera.y = DOORS.harry.start.y - 550;
  if (state.checkpoint < 120) state.checkpoint = 119;
};

/** The ride by where it's got to. */
const phaseUpdate = (ctx: FrameContext, h: Heli, controls: Controls): Controls => {
  const { state } = ctx;
  switch (h.phase) {
    case 'pad': return padUpdate(ctx, h, controls);
    case 'board': {
      if (h.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { skipTour(state, h); return hands(); } }
      return boardUpdate(ctx, h);
    }
    case 'lift': {
      if (h.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { skipTour(state, h); return hands(); } }
      return liftUpdate(ctx, h);
    }
    case 'tour': return tourUpdate(ctx, h);
    case 'fly': return flyUpdate(ctx, h, controls);
    case 'end': return endUpdate(ctx, h);
  }
  return controls;
};

/** His pose in the seat (render/player/copterPose.ts): bored stiff on the tour; flying it, leaning into it, the gun hand
 *  on the trigger, the stick yanked back for an up boost, hanging off his belt upside down, a snarl after a kill, a
 *  flinch when he's hit. Off it, nothing. */
const seatPose = (state: GameState, h: Heli, controls: Controls) => {
  const p = state.player, f = state.frame, b = h.boost;
  const seated = !h.over && ((h.phase === 'board' && h.step >= 2) || h.phase === 'lift' || h.phase === 'tour' || h.phase === 'fly' || h.phase === 'end');
  if (!seated) { p.copterSeat = undefined; return; }
  const pilot = h.phase === 'fly' || h.phase === 'end' || (h.phase === 'tour' && !!h.flags.shoved);
  const hit = p.invincibilityTimer > 30 || (p.pushbackTimer ?? 0) > 0 || (h.phase === 'end' && h.step >= 2);
  p.copterSeat = {
    mode: pilot ? 'pilot' : 'passenger',
    lean: b ? 0.18 : Math.max(-0.1, Math.min(0.15, h.vx * 0.025)),
    fire: pilot && h.phase === 'fly' && !!controls.shoot, yank: !!b && b.dy < 0, hang: h.flip > 0.5,
    mood: !pilot ? 'bored' : hit ? 'flinch' : f - h.killAt < 50 ? 'snarl' : 'grit',
  };
};

// ---------------------------------------------------------------------------------------------------------------
// The section

export const heli: ForeignSection = {
  id: 'heli', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, [{ x1: x0, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'heli', { left: false });
    // (the big refill before the ride: the boss-door rule)
    state.pickups.push({ id: 'hl-health', pos: { x: X(REFILL) - 30, y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
    state.pickups.push({ id: 'hl-ammo', pos: { x: X(REFILL) + 10, y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
    const h = heliOf(state);
    h.mechs = makeMechs();
    state.viewIsScreen = false;
    // (a new life: Harry's said nothing yet)
    harrySaid.clear();
    setDropTable(PARK_DROPS);
    if (state.stageMemo[MEMO.done]) { h.over = true; h.phase = 'gone'; }
    setUi({ heliTips: false, noSwitch: false });
  },
  update: (ctx, controls) => {
    const { state } = ctx, h = heliOf(state);
    h.t++;
    setDropTable(h.phase === 'tour' || h.phase === 'fly' || h.phase === 'end' ? FLY_DROPS : PARK_DROPS);
    // (the gauntlet's on: bossQuiet.ts)
    if (!h.over && (h.phase === 'fly' || h.phase === 'end')) markBossFight(state);
    if (h.over) { runExits(state, endExits('heli', { left: false })); return controls; }
    // (starting again at a landmark's checkpoint: straight up there, into it)
    if (h.phase === 'pad' && state.checkpoint >= 111 && state.checkpoint <= 119) { startAt(state, h, state.checkpoint - 111); return hands(); }
    const out = phaseUpdate(ctx, h, controls);
    seatPose(state, h, controls);
    // (flying: the main HUD's the helicopter's, its boost on the PWR row, its rockets, the machine gun)
    { const mt = heliMeters(h); setUi({ heliHud: h.phase === 'fly' || h.phase === 'end', heliBoost: mt.boost, heliRockets: mt.rockets }); }
    return out;
  },
  cameraX: (state) => { const h = heliOf(state); return h.cam ? { min: h.camX, max: h.camX } : undefined; },
  // (zoomed out over the park from the lift on, about the screen's middle; pulled back further while a landmark comes up)
  // (the pull, about its own screen point: the shift keeps that point put; the park's camera does the same)
  // (the rotor's shred: a little hit-stop, shred.ts)
  holdTick: () => shredHold(),
  zoom: (state) => {
    const h = heliOf(state), z = h.zoom * h.pull;
    return h.cam && Math.abs(z - 1) > 0.002 ? { scale: z, x: state.camera.x + SW / 2, y: state.camera.y + SH / 2, shiftX: (1 - h.pull) * (h.pullX - SW / 2), shiftY: (1 - h.pull) * (h.pullY - SH / 2) } : null;
  },
  drawBackdrop: (c, state) => {
    const h = heliOf(state);
    // (the lift: the park opening up below as he climbs, faded in over the streets)
    if (h.phase === 'lift') { const a = Math.max(0, Math.min(1, (h.t - 20) / 90)); if (a < 1) drawStreetsBackdrop(c, state); drawPark(c, state, a); return true; }
    if (h.phase !== 'tour' && h.phase !== 'fly' && h.phase !== 'end') return false;
    drawPark(c, state);
    return true;
  },
  drawBack: (c, state) => {
    const h = heliOf(state), f = state.frame;
    if (state.camera.y > CY + 900 || h.phase === 'pad' || h.phase === 'board' || h.phase === 'gone') drawPad(c, state, h);
    // (the landmark he's fighting, the world's while it's up; the rest stand out on the park's circuit)
    const m = h.mechs[h.cur];
    if (m && inWorld(h, m)) drawLandmarkWorld(c, h, m, f);
    // (Harry down on the ground, under it all: running, hopping, keying the remote, flat on his back, aiming up)
    if (h.flags.landed && h.hpose !== 'shoved' && h.hpose !== 'fall' && (h.phase === 'tour' || h.phase === 'fly' || h.phase === 'end')) {
      c.fillStyle = 'rgba(20,20,20,0.35)'; c.beginPath(); c.ellipse(h.hx, roadAt(h.hx), 16, 4, 0, 0, Math.PI * 2); c.fill();
      const aiming = h.hpose === 'aim' || h.hpose === 'fire';
      drawHarry(c, h.hx, h.hy, { pose: h.hpose, f, mad: h.turned || !!h.flags.turning, jetpack: true, burn: h.hop > 0 || h.hvy !== 0, talking: !!h.harry, facing: h.hfacing, scale: HARRY_SCALE, remote: true, keyed: h.remote > 0, aim: aiming ? aimAtHim(state, h).a : 0 });
    }
    // (the helicopter round him: its back half, behind him)
    if (!h.over && h.phase !== 'gone') {
      const piv = h.phase === 'pad' || (h.phase === 'board' && h.step < 2) ? { x: PAD_O.x + SEAT_BACK, y: PAD_O.y } : feetOf(state);
      const rot = h.phase === 'fly' || h.phase === 'end' || h.phase === 'tour' ? { tilt: h.tilt, flip: h.flip } : { tilt: 0, flip: 0 };
      drawCopter(c, 'back', piv.x, piv.y, { seat: h.phase === 'pad' || (h.phase === 'board' && h.step < 2) ? SEAT_BACK : h.seat, tilt: rot.tilt, flip: rot.flip, rotor: h.rotor }, f, { flash: state.player.invincibilityTimer > 0 && (f >> 2) % 2 === 0 });
      // (Harry in the pilot's seat)
      if (h.hpose === 'pilot') drawHarry(c, h.hx, h.hy, { pose: 'pilot', f, talking: !!h.harry });
    }
    // (Harry on the pad, waving)
    if (!h.over && (h.phase === 'pad' || (h.phase === 'board' && h.hpose === 'wave'))) drawHarry(c, h.hx, h.hy, { pose: 'wave', f, facing: -1, talking: !!h.harry });
  },
  drawFront: (c, state) => {
    const h = heliOf(state), f = state.frame, p = state.player;
    if (h.phase === 'fly' || h.phase === 'end') drawAttacks(c, state, h);
    if (!h.over && h.phase !== 'gone') {
      const onPad = h.phase === 'pad' || (h.phase === 'board' && h.step < 2);
      const piv = onPad ? { x: PAD_O.x + SEAT_BACK, y: PAD_O.y } : feetOf(state);
      const rot = h.phase === 'fly' || h.phase === 'end' || h.phase === 'tour' ? { tilt: h.tilt, flip: h.flip } : { tilt: 0, flip: 0 };
      drawCopter(c, 'front', piv.x, piv.y, { seat: onPad ? SEAT_BACK : h.seat, tilt: rot.tilt, flip: rot.flip, rotor: h.rotor }, f, { harryDoor: !!h.flags.door, burning: (h.phase === 'end' && h.step >= 2) || p.health <= 0 });
    }
    drawRockets(c, state);
    // (lackeys swooping in from up close, over everything)
    if (h.phase === 'fly') drawEntrances(c, state);
    // (the kick's WHAM, where the boot met him)
    if (h.flags.wham) {
      const ft = feetOf(state), x = ft.x + 40, y = ft.y - 50;
      // (a burst in steps: orange round the points, yellow, a white heart; the word shadowed)
      const star = (k: number, col: string, stroke: boolean) => { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + 0.1, rr = (i % 2 ? 10 : 24) * k; c[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fill(); if (stroke) { c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); } };
      star(1.15, '#F97316', true); star(0.95, '#FDE047', false); star(0.55, '#FFFBEB', false);
      c.font = '10px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#B91C1C'; c.fillText('WHAM', x + 1, y + 5); c.fillStyle = INK; c.fillText('WHAM', x, y + 4); c.textAlign = 'left';
    }
    // Harry kicked out, falling past (in front of everything) all the way down
    if (h.phase === 'tour' && (h.hpose === 'shoved' || h.hpose === 'fall')) drawHarry(c, h.hx, h.hy, { pose: h.hpose, f, talking: !!h.harry, rot: h.t * 0.15, scale: 0.9 + 0.1 * Math.max(0, 1 - h.t / 60) });
    if (h.hrocket) {
      // (his rocket, nose on toward the helicopter, its flame behind)
      const r = h.hrocket, ft = feetOf(state), a = Math.atan2(ft.y - 40 - r.y, ft.x - r.x);
      // (olive drab in steps, a yellow band, the red warhead, the fins; its flame banded white-hot to red)
      c.save(); c.translate(r.x, r.y); c.rotate(a);
      const fx = -26 - (f % 3) * 3;
      c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(-12, -5); c.lineTo(fx - 4, 0); c.lineTo(-12, 5); c.fill();
      c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(-12, -4); c.lineTo(fx, 0); c.lineTo(-12, 4); c.fill();
      c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(-12, -2.5); c.lineTo(fx + 8, 0); c.lineTo(-12, 2.5); c.fill();
      c.fillStyle = '#FFFBEB'; c.fillRect(-14, -1, 3, 2);
      c.fillStyle = INK; c.fillRect(-12, -5, 24, 10); c.beginPath(); c.moveTo(11, -5); c.lineTo(18, 0); c.lineTo(11, 5); c.fill();
      c.fillStyle = '#4D5B2A'; c.fillRect(-11, -4, 22, 8); c.fillStyle = '#6B7E3A'; c.fillRect(-11, -4, 22, 2); c.fillStyle = '#323C1A'; c.fillRect(-11, 2, 22, 2);
      c.fillStyle = '#EAB308'; c.fillRect(-3, -4, 2, 8);
      c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(10, -4); c.lineTo(16, 0); c.lineTo(10, 4); c.fill(); c.fillStyle = '#F87171'; c.fillRect(10, -4, 3, 1);
      c.fillStyle = '#323C1A'; c.beginPath(); c.moveTo(-12, -5); c.lineTo(-17, -10); c.lineTo(-7, -5); c.moveTo(-12, 5); c.lineTo(-17, 10); c.lineTo(-7, 5); c.fill();
      c.restore();
    }
    // Who's saying what (kept whole on screen)
    if (h.harry) saidOver(c, h.harry.text, h.hx, h.hy - (h.hpose === 'pilot' ? 104 : h.hpose === 'down' ? 40 : 84 * HARRY_SCALE + 10), '#FDE68A', 300);
    if (h.mech) { const m = h.mechs[h.cur], at = toWorld(BASE_SAY.x, m?.id === 'pisa' ? 150 : BASE_SAY.y); saidOver(c, h.mech.text, at.x, at.y, '#BFDBFE', 280); }
    if (h.guest) saidOver(c, h.guest.s.text, h.guest.x, GY - 100, '#E5E7EB', 220);
    if (h.goonSaid && h.goonSaid.e.health > 0) saidOver(c, h.goonSaid.s.text, h.goonSaid.e.pos.x + h.goonSaid.e.width / 2, h.goonSaid.e.pos.y - 16, '#BFDBFE', 200);
  },
  drawHud: (c, state) => {
    const h = heliOf(state), p = state.player;
    const cut = (h.phase === 'board' || h.phase === 'lift' || h.phase === 'tour' || h.phase === 'end') && h.t > SKIP_AFTER;
    if (cut) drawSkipPrompt(c, CANVAS_WIDTH);
    if (h.white > 0) { c.fillStyle = 'rgba(255,255,255,' + h.white + ')'; c.fillRect(0, 0, SW, SH); }
    if (h.phase !== 'fly' || p.inCutscene) return;
    // The landmark's bar (the top band, clear of the HUD): filling up as it arrives
    const m = h.mechs[h.cur];
    if (m && !h.transit && (m.st === 'intro' || m.st === 'fight' || m.st === 'dying')) {
      const band = topBand(), w = band.x2 - band.x1, arrive = m.st === 'intro' ? Math.min(1, m.t / (m.introLen * 0.8)) : 1;
      const k = (m.id === 'pisa' ? (m.hp > 0 ? 1 : 0) : Math.max(0, m.hp / m.max)) * arrive;
      box(c, band.x1, 18, w, 14, '#18181B');
      box(c, band.x1 + 2, 20, (w - 4) * k, 10, m.flash > 0 ? '#FECACA' : m.id === 'pisa' ? '#60A5FA' : k < 0.33 ? '#EF4444' : '#F59E0B');
      label(c, MECH_NAME[m.id], band.mid, 46, '#FDE68A', 7);
      if (m.id === 'pisa' && m.hp > 0) label(c, 'IMMUNE', band.mid, 29, (state.frame >> 3) % 2 ? '#FFFFFF' : '#BFDBFE', 7);
      label(c, (h.cur + 1) + ' OF ' + MECHS.length, band.x2 - 40, 60, '#A1A1AA', 6);
    }
  },
  outdoors: () => 1,
  // (the fires down in the wrecked park glowing, at dusk and after)
  lamps: (state) => fireLamps(state),
};

// ---------------------------------------------------------------------------------------------------------------
// The helipad, drawn: the concrete pad (its top going back, the joints, the painted yellow ring and the white H, its
// edge lights), the windsock; the queue's switchback (chrome stanchions, navy belt ropes sagging between them) and the
// guests in it, fed up, each their own person (lookOf: man or woman by the voice they shout in, skin, hair, build,
// clothes; arms crossed, on a phone, hands on hips, holding a soda); the ride's signs. After it's all over: the scorch
// where the helicopter was, the ride closed, nobody in line.

const drawPad = (c: CanvasRenderingContext2D, state: GameState, h: Heli) => {
  const v = viewIn(state), f = state.frame, night = timeOfDay().lamps > 0.3;
  promenade(c, v, x0, x1 + 200, '#D6CBB4', '#8C7F68');
  if (onScreen(v, X(PAD_X - 300), X(PAD_X + 300))) {
    const xa = X(PAD_X - 240), xb = X(PAD_X + 240), cx = X(PAD_X), top = GY - 4, R = ramp6(hour('#9CA3AF'));
    // (the pad's top going back, in steps; its joints; the ring and the H painted on it, worn; the scorch on a revisit)
    topBack(c, v.eye, xa, xb, top, 1, 0.9, R, 3);
    const P = (x: number, d: number) => at(v.eye, x, top, d);
    c.strokeStyle = R[1]; c.lineWidth = 1; c.beginPath();
    for (let x = xa + 120; x < xb; x += 120) { const [ax, ay] = P(x, 1), [bx, by] = P(x, 0.9); c.moveTo(ax, ay); c.lineTo(bx, by); }
    { const [ax, ay] = P(xa, 0.95), [bx, by] = P(xb, 0.95); c.moveTo(ax, ay); c.lineTo(bx, by); }
    c.stroke();
    const ring = (rx: number, rd: number) => Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return P(cx + Math.cos(a) * rx, 0.95 + Math.sin(a) * rd); });
    if (v.eye.y < top - 1) {
      const outer = ring(200, 0.046), inner = ring(184, 0.042);
      c.fillStyle = hour('#D4A017'); c.beginPath(); outer.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); inner.reverse().forEach(([x, y]) => c.lineTo(x, y)); c.closePath(); c.fill('evenodd');
      c.strokeStyle = hour('#FDE047'); c.beginPath(); ring(198, 0.045).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      const quad = (u0: number, u1: number, d0: number, d1: number, col: string) => { const pts = [P(cx + u0, d0), P(cx + u1, d0), P(cx + u1, d1), P(cx + u0, d1)]; c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); };
      const Hc = hour('#E8E8E4');
      quad(-70, -44, 0.928, 0.972, Hc); quad(44, 70, 0.928, 0.972, Hc); quad(-44, 44, 0.946, 0.954, Hc);
      if (h.over) {
        c.fillStyle = 'rgba(20,16,14,0.7)'; c.beginPath(); ring(150, 0.03).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.fill();
        c.fillStyle = 'rgba(20,16,14,0.5)'; c.beginPath(); ring(190, 0.04).forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.fill();
      }
    }
    // (its front face: lit along its top, shaded under, inked; the edge lights in their housings, lit after dark)
    box(c, xa, top, xb - xa, 4, R[3]); box(c, xa, top, xb - xa, 1, R[5]); box(c, xa, GY - 1, xb - xa, 1, R[1]);
    box(c, xa - 1, top, 1, 4, INK); box(c, xb, top, 1, 4, INK);
    for (let x = xa + 20; x < xb; x += 55) {
      box(c, x - 3, top - 4, 6, 4, INK); box(c, x - 2, top - 3, 4, 3, night ? ((f >> 4) % 2 ? '#FDE047' : '#F59E0B') : '#A1A1AA');
      if (night) { c.fillStyle = 'rgba(253,224,71,0.25)'; c.beginPath(); c.arc(x, top - 2, 7, 0, Math.PI * 2); c.fill(); }
    }
    // (the windsock: its pole, the sock in orange and white bands, flapping)
    const wx = xb + 40, wy = GY - 110;
    box(c, wx - 2, wy, 4, GY - wy, INK); box(c, wx - 1, wy, 2, GY - wy, '#A1A1AA'); box(c, wx - 1, wy, 1, GY - wy, '#E4E4E7');
    box(c, wx - 4, GY - 4, 8, 4, INK); box(c, wx - 3, GY - 3, 6, 3, '#52525B');
    for (let k = 0; k < 5; k++) {
      const s0 = k * 11, s1 = s0 + 11, fl = (u: number) => Math.sin(f * 0.12 - u * 0.06) * u * 0.08, hh = (u: number) => 9 - u * 0.09;
      const pts: [number, number][] = [[wx + 2 + s0, wy + 4 - hh(s0) + fl(s0)], [wx + 2 + s1, wy + 4 - hh(s1) + fl(s1)], [wx + 2 + s1, wy + 4 + hh(s1) + fl(s1)], [wx + 2 + s0, wy + 4 + hh(s0) + fl(s0)]];
      c.fillStyle = INK; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y + (i < 2 ? -1 : 1)) : c.moveTo(x, y - 1))); c.closePath(); c.fill();
      c.fillStyle = hour(k % 2 ? '#F8FAFC' : '#F97316'); c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
      c.fillStyle = hour(k % 2 ? '#CBD5E1' : '#C2410C'); c.fillRect(Math.round(pts[3][0]), Math.round(pts[3][1] - 2), 11, 2);
    }
  }
  // (the queue: the switchback's two lines of stanchions and their sagging belt ropes, set back; the guests between them
  // (not on a revisit): the back row first, then the front row, then the front rope over them)
  if (onScreen(v, X(QUEUE_A), X(QUEUE_B))) setBack(c, v, X(QUEUE_A), QUEUE_B - QUEUE_A, 0.92, () => {
    const w = QUEUE_B - QUEUE_A;
    const line = (base: number) => {
      const posts: number[] = []; for (let x = 0; x <= w; x += 80) posts.push(x);
      for (let i = 0; i + 1 < posts.length; i++) {
        const a = posts[i], b = posts[i + 1], y = base - 30;
        c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(a, y); c.quadraticCurveTo((a + b) / 2, y + 9, b, y); c.stroke();
        c.strokeStyle = dimmed('#1E3A8A'); c.lineWidth = 2.5; c.stroke();
        c.strokeStyle = dimmed('#3B82F6'); c.lineWidth = 1; c.beginPath(); c.moveTo(a, y - 1); c.quadraticCurveTo((a + b) / 2, y + 8, b, y - 1); c.stroke();
      }
      for (const x of posts) {
        box(c, x - 6, base - 3, 12, 3, INK); box(c, x - 5, base - 2, 10, 2, dimmed('#71717A'));
        box(c, x - 2, base - 34, 4, 32, INK); box(c, x - 1, base - 34, 2, 32, dimmed('#D4D4D8')); box(c, x - 1, base - 34, 1, 32, dimmed('#FFFFFF'));
        box(c, x - 3, base - 37, 6, 4, INK); box(c, x - 2, base - 36, 4, 2, dimmed('#E4E4E7'));
      }
    };
    line(-28);
    if (!h.over) for (const g of PAD_GUESTS) if (g.row) guest(c, g.x - QUEUE_A, -30, g.seed, f);
    if (!h.over) for (const g of PAD_GUESTS) if (!g.row) guest(c, g.x - QUEUE_A, -2, g.seed, f);
    line(0);
  });
  if (onScreen(v, X(QUEUE_A - 120), X(QUEUE_A + 120))) postBoard(c, X(QUEUE_A - 40), GY, h.over ? ['HELICOPTER RIDES ACROSS THE WORLD', 'CLOSED', '(HELICOPTER MISSING)'] : ['HELICOPTER RIDES ACROSS THE WORLD', 'WAIT TIME: 3 HOURS', 'TOLERANCE: MANDATORY'], LOOKS.land(1), '#1E3A8A', undefined, 150);
  if (onScreen(v, X(CP_PAD - 100), X(CP_PAD + 100)) && !h.over) postBoard(c, X(CP_PAD + 40), GY, ['SEE THE WHOLE WORLD', '(BIGGER)'], LOOKS.land(1), '#7F1D1D', undefined, 100);
};
/** A guest in the queue (set back, dimmed: scenery), painted once for the hour: who they are by seed (lookOf: the
 *  voice they yell in matches), stepped and inked; fed up, shifting their weight. */
const guest = (c: CanvasRenderingContext2D, x: number, y: number, seed: number, f: number) => {
  const bob = Math.round(Math.sin(f * 0.04 + seed));
  still(c, `hl-guest-${seed}`, x, y + bob, -16, -86, 32, 88, g => paintGuest(g, seed));
};
const paintGuest = (g: CanvasRenderingContext2D, seed: number) => {
  const L = lookOf(seed), pose = seed % 4, shorts = (seed >> 2) % 3 === 0;
  const sk = ramp6(dimmed(L.skin)), sh = ramp6(dimmed(L.shirt)), pa = ramp6(dimmed(L.pants)), ha = ramp6(dimmed(L.hair));
  const hw = L.heavy ? 10 : 8, B = (x: number, yy: number, w: number, hh: number, col: string) => kbox(g, x, yy, w, hh, col);
  // (the legs and shoes: jeans or shorts (bare shins), a step lit up the near one)
  for (const lx of [-hw + 1, 1]) {
    B(lx - 1, -31, 8, 30, INK);
    B(lx, -30, 6, shorts ? 12 : 28, pa[3]); B(lx, -30, 2, shorts ? 12 : 28, pa[4]); B(lx + 5, -30, 1, shorts ? 12 : 28, pa[1]);
    if (shorts) { B(lx, -18, 6, 16, sk[3]); B(lx, -18, 2, 16, sk[4]); }
    B(lx - 1, -3, 8, 3, INK); B(lx, -3, 7, 2, dimmed(seed % 3 ? '#F8FAFC' : '#1C1917'));
  }
  // (the torso: the shirt in steps, a belt or not, its hem)
  B(-hw - 1, -59, hw * 2 + 2, 30, INK);
  B(-hw, -58, hw * 2, 28, sh[3]); B(-hw, -58, 3, 28, sh[4]); B(hw - 3, -58, 3, 28, sh[1]); checker(g, hw - 5, -58, 2, 28, sh[2], 0, 1);
  if (!L.woman) B(-hw, -32, hw * 2, 2, dimmed('#3F2A1C'));
  // (the arms by how they stand: crossed, on a phone (its screen glowing), hands on hips, a soda)
  const arm = (x: number, yy: number, w: number, hh: number) => { B(x - 1, yy - 1, w + 2, hh + 2, INK); B(x, yy, w, hh, sk[3]); B(x, yy, w, 1, sk[4]); };
  if (pose === 0) { arm(-hw - 2, -56, 4, 14); arm(hw - 2, -56, 4, 14); B(-hw + 1, -46, hw * 2 - 2, 5, INK); B(-hw + 2, -45, hw * 2 - 4, 3, sk[3]); B(-hw + 2, -45, hw * 2 - 4, 1, sk[4]); }
  else if (pose === 1) { arm(-hw - 3, -56, 4, 24); arm(hw - 1, -56, 4, 10); arm(hw - 6, -47, 8, 4); B(hw - 7, -55, 6, 9, INK); B(hw - 6, -54, 4, 7, '#93C5FD'); B(hw - 6, -54, 4, 2, '#DBEAFE'); }
  else if (pose === 2) { for (const s of [-1, 1]) { arm(s < 0 ? -hw - 6 : hw + 2, -56, 4, 10); arm(s < 0 ? -hw - 4 : hw - 1, -47, 4, 10); } }
  else { arm(-hw - 3, -56, 4, 24); arm(hw - 1, -56, 4, 18); B(hw - 2, -44, 7, 10, INK); B(hw - 1, -43, 5, 8, dimmed('#DC2626')); B(hw - 1, -43, 5, 2, dimmed('#F8FAFC')); B(hw + 2, -48, 1, 5, dimmed('#F8FAFC')); }
  // (the head: skin in steps, the ear, an eye, a frown; the hair (long, short, bald); a cap on some)
  B(-7, -75, 14, 17, INK); B(-6, -74, 12, 15, sk[3]); B(-6, -74, 3, 15, sk[4]); B(3, -74, 3, 15, sk[2]); B(-2, -63, 6, 4, sk[2]);
  B(-6, -67, 2, 3, sk[1]);
  B(2, -69, 2, 2, INK); B(0, -63, 4, 1, INK); B(1, -72, 4, 1, ha[1]);
  if (!L.bald) {
    B(-7, -77, 14, 5, INK); B(-6, -76, 12, 4, ha[3]); B(-6, -76, 6, 1, ha[4]);
    if (L.long) { B(-8, -73, 5, 18, INK); B(-7, -72, 3, 16, ha[2]); }
  }
  if (seed % 5 === 0) { B(-7, -80, 14, 5, INK); B(-6, -79, 12, 3, dimmed('#1E40AF')); B(4, -77, 6, 2, INK); B(4, -77, 5, 1, dimmed('#1D4ED8')); }
};
