// HELICOPTER RIDES ACROSS THE WORLD: the land's second stretch (about half its play time), and its mini-boss rush.
// Walked straight into off the end of Canada (no cut: the helipad's on the end of the promenade).
//
//   THE HELIPAD: the big health + ammo and checkpoint 110 before the ride; the queue (three hours long, the guests in
//     it yelling at him as he walks past all of them); HELICOPTER HARRY waving by his helicopter.
//   THE BOARDING (a cutscene: HUD hidden, SKIP >> for the lot, from here to his taking the controls): he's at the front
//     of the line, climbs in the back; Harry's welcome (no judgment: by his pants). Up off the pad, the camera going up
//     with it, the giant globe coming up from under (tour.ts).
//   THE TOUR: round the globe, the giant replicas coming round ("IN AMERICA, EVERYTHING IS BIGGER. EVEN OTHER PLACES."),
//     Harry preaching tolerance and reusable straws; "SHUT UP, HIPPIE."; Harry out the door; Meathead over into the
//     pilot's seat; Harry back up on the ride's emergency jetpack, the act dropped, swearing; the landmarks wake up
//     (legs, googly eyes). No cut: the tour becomes the shooter.
//   THE GAUNTLET (his: copter.ts the flying, mechs.ts the nine landmarks, goons.ts the lackeys between them, globe.ts
//     the world going round): checkpoints 111-119, one per landmark (starting again at one: the globe round to it, the
//     wrecks before it on the globe, straight into it). A refill before the last.
//   THE END (a cutscene): Harry, furious, shoots him out of the sky with a rocket launcher; the fall; the white; Harry's
//     arena (DOORS.harry.start: job 5's).
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
import type { ForeignSection } from '../section';
import { layOwn, endWalls, endExits, runExits, meatheadSays, hands, teleport, saidOver, box, label } from '../section';
import { DOORS } from '../geometry';
import { byPants } from '../cast';
import { registerHurts } from '../pavilion';
import { viewIn, promenade, postBoard, onScreen, LOOKS, INK, dimmed, hour, setBack } from '../kit';
import { heliOf, type Heli } from './state';
import { x0, x1, X, GY, REFILL, CP_PAD, QUEUE_A, QUEUE_B, BOARD_AT, PAD_X, PAD_O, SEAT_BACK, SEAT_FRONT, CAMX, CY, W, H, CP_X, MEMO } from './geo';
import { flyCopter, updateRockets, drawCopter, drawRockets, drawCharges } from './copter';
import { makeMechs, startMech, updateMechs, mechDone } from './mechs';
import { WAVES, goonsLeft, sweepGoons } from './goons';
import { drawFlightBackdrop, drawLandmarks, globeRise } from './globe';
import { drawAttacks } from './mechArt';
import { drawHarry } from './harryArt';
import { harrySays, guestShouts, quiet } from './talk';
import {
  HURT, MECHS, MECH_NAME, QUEUE_SHOUT, QUEUE_SHOUT_SHAT, QUEUE_SHOUT_NUDE, HARRY_BOARD, HARRY_TOUR, MH_TOUR, MH_SHUT_UP, HARRY_SHOVED,
  HARRY_TURNS, MH_TAKES, HARRY_HECKLE, HARRY_GOONS, HARRY_GLOAT, HARRY_END, MH_ROCKET, HARRY_HIT,
} from './lines';

registerHurts(HURT);

const CHECKPOINTS = [
  { name: 'HELICOPTER RIDES ACROSS THE WORLD', cp: 110, x: X(CP_PAD), y: GY },
  ...MECHS.map((id, i) => ({ name: `HELICOPTER: ${MECH_NAME[id].replace(/ \(.*\)$/, '')}`, cp: 111 + i, x: CP_X, y: GY })),
];

/** Where the helicopter's held during the tour and handed over (screen: his feet). */
const TOUR_AT = { x: 260, y: 330 };
/** Where Harry hovers, once he's turned (screen). */
const HARRY_AT = { x: 430, y: 150 };

// ---------------------------------------------------------------------------------------------------------------
// The camera

const holdCam = (state: GameState, h: Heli, x: number, y: number) => {
  h.cam = true; h.camX = x; h.camY = y;
  state.camera.x = x; state.camera.y = y;
  state.cameraOverride = { x, y };
};
const letCamGo = (state: GameState, h: Heli) => { if (h.cam) { state.cameraOverride = null; h.cam = false; } };

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
  h.cur = at; h.prog = at;
  p.inCutscene = false; p.noSpecials = true; p.spriteRot = 0;
  setUi({ noSwitch: true });
  holdCam(state, h, CAMX, CY);
  h.ox = CAMX + TOUR_AT.x - h.seat; h.oy = CY + TOUR_AT.y;
  seatHim(state, h);
  h.hx = CAMX + HARRY_AT.x; h.hy = CY + HARRY_AT.y; h.hpose = 'jet';
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

const beginTransit = (state: GameState, h: Heli, i: number) => {
  h.transit = true; h.transitFrom = h.prog; h.transitT = 0; h.cur = i;
  h.waves = [...WAVES[i]]; h.waveAt = state.frame + 90;
  // (the big refill before the last one: floating out in front)
  if (i === MECHS.length - 1 && !h.refill) {
    h.refill = true;
    state.pickups.push(
      { id: 'hl-sky-health', pos: { x: CAMX + 520, y: CY + 230 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 },
      { id: 'hl-sky-ammo', pos: { x: CAMX + 520, y: CY + 340 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 },
    );
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The helipad and the boarding

const PAD_GUESTS = Array.from({ length: 22 }, (_, i) => ({ x: QUEUE_A + 20 + i * ((QUEUE_B - QUEUE_A - 40) / 21), row: i % 2, seed: 4000 + i * 37 }));

const padUpdate = (ctx: FrameContext, h: Heli, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2, rx = cx - x0;
  h.ox = PAD_O.x; h.oy = PAD_O.y; h.seat = SEAT_BACK; h.rotor += 0.05;
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
    if (h.t === 1) harrySays(state, pickLine(byPants(state, HARRY_BOARD)), true, () => { h.flags.welcomed = true; });
    if (cx < seatX - 30 && h.t < 300) return { ...hands(), right: true };
    h.step = 1; h.t = 0; h.flags.fromX = true; (h as Heli & { hop?: { x: number; y: number } }).hop = { x: cx, y: p.pos.y + p.height };
    playSound('jump', 0.6);
  }
  if (h.step === 1) {
    // (the hop in)
    const hop = (h as Heli & { hop: { x: number; y: number } }).hop, k = Math.min(1, h.t / 18);
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
  if (h.t > 40 && (h.flags.welcomed || h.t > 900)) { h.phase = 'lift'; h.t = 0; h.flags.liftFrom = true; h.camX = state.camera.x; h.camY = state.camera.y; }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// The lift and the tour

const LIFT = 210;
const ease = (k: number) => k * k * (3 - 2 * k);
const liftUpdate = (ctx: FrameContext, h: Heli): Controls => {
  const { state } = ctx, p = state.player;
  p.inCutscene = true;
  h.rotor += 0.6;
  const k = ease(Math.min(1, h.t / LIFT));
  const sx = h.camX, sy = h.camY;
  // (up and over: from the pad to the tour's spot on the screen; the camera up with it)
  const tx = CAMX + TOUR_AT.x - SEAT_FRONT, ty = CY + TOUR_AT.y;
  h.ox = PAD_O.x + (tx - PAD_O.x) * k; h.oy = PAD_O.y + (ty - PAD_O.y) * k + (k < 0.1 ? -k * 40 : 0);
  holdCam(state, h, sx + (CAMX - sx) * k, sy + (CY - sy) * k);
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
  { who: 'harry', line: () => HARRY_TOUR[2] }, { who: 'mh', line: () => MH_TOUR[2] },
  { who: 'harry', line: () => HARRY_TOUR[3] }, { who: 'mh', line: () => MH_TOUR[1] },
  { who: 'harry', line: () => HARRY_TOUR[4] }, { who: 'mh', line: () => MH_SHUT_UP },
];

const tourUpdate = (ctx: FrameContext, h: Heli): Controls => {
  const { state } = ctx, p = state.player, f = state.frame;
  p.inCutscene = true;
  h.rotor += 0.6;
  h.spin += 0.0015;
  if (h.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { skipTour(state, h); return hands(); } }
  // (the globe round toward the Eiffel Tower as he talks)
  h.prog = Math.min(0, h.prog + 0.0035);
  // (the helicopter bobbing where it's held; him over into the pilot's seat once Harry's gone)
  h.ox = CAMX + TOUR_AT.x - SEAT_FRONT + Math.sin(f * 0.03) * 4; h.oy = CY + TOUR_AT.y + Math.sin(f * 0.05) * 5;
  if (h.flags.shoved) h.seat = Math.min(SEAT_FRONT, h.seat + 1.6);
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
    // (shoved out the door: Harry's last nice words on the way)
    h.step++; h.flags.shoved = true; h.flags.door = true;
    h.hpose = 'shoved'; h.hvx = 2.5; h.hvy = -3;
    playSound('punch', 1, -6); playSound('whoosh', 0.8, 4);
    harrySays(state, HARRY_SHOVED[0], true);
    h.t = 0;
  }
  if (h.step === TOUR.length + 1) {
    // (Harry falling away; him into the pilot's seat; his line; a beat; the jetpack's roar from under)
    if (h.hpose === 'shoved' || h.hpose === 'fall') { h.hvy += 0.35; h.hx += h.hvx; h.hy += h.hvy; if (h.t > 20) h.hpose = 'fall'; }
    if (h.t === 50) { h.flags.door = false; meatheadSays(state, pickLine(MH_TAKES), true, () => { h.flags.took = true; }); }
    if ((h.flags.took || h.t > 600) && h.t > 140 && !h.flags.rising) {
      h.flags.rising = true; h.hx = CAMX + 520; h.hy = CY + 700; h.hpose = 'jet'; h.turned = false;
      playSound('ignite', 1, -10); playSound('engine', 0.8, 6);
    }
    if (h.flags.rising) {
      h.hx += (CAMX + HARRY_AT.x - h.hx) * 0.04; h.hy += (CY + HARRY_AT.y - h.hy) * 0.04;
      if (Math.abs(h.hy - (CY + HARRY_AT.y)) < 20 && !h.flags.turning) {
        h.flags.turning = true;
        harrySays(state, HARRY_TURNS[0], true, () => harrySays(state, HARRY_TURNS[1], true, () => {
          harrySays(state, HARRY_TURNS[2], true, () => { h.flags.woke = true; });
          // (the landmarks waking up: legs, eyes, a rumble)
          setTimeout(() => { h.turned = true; }, 1200);
        }));
      }
    }
    if (h.turned && !h.flags.woken) { h.flags.woken = true; playSound('rumble', 1, -10); playSound('clang', 0.9, -8); shakeScreen(state, 10, 6); }
    if (h.flags.woke && h.turned) handOver(state, h);
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
  holdCam(state, h, CAMX, CY);
  flyCopter(ctx, controls);
  const ft = feetOf(state); h.ox = ft.x - h.seat; h.oy = ft.y;
  updateRockets(ctx);
  updateMechs(ctx);
  sweepGoons(state);
  // (the checkpoint's own: nothing to walk past up here)
  if (h.tips > 0 && --h.tips === 0) setUi({ heliTips: false }); else if (h.tips > 0) setUi({ heliTips: true });
  // Between landmarks: the globe turning the next one round; the waves, one after another
  if (h.transit) {
    h.transitT++;
    h.prog = Math.min(h.cur, h.transitFrom + h.transitT / 320);
    const died = h.goons.filter(e => e.health <= 0 || e.isBlownAway).length;
    if (died && Math.random() < 0.2) harrySays(state, pickLine(HARRY_GOONS), false);
    const left = goonsLeft(state);
    if (h.waves.length && left === 0 && f >= h.waveAt) { const w = h.waves.shift()!; w(state); h.waveAt = f + 150; }
    if (!h.waves.length && left === 0 && h.prog >= h.cur && f >= h.waveAt - 90) {
      h.transit = false;
      if (state.checkpoint < 111 + h.cur) state.checkpoint = 111 + h.cur;
      startMech(state, h.cur);
    }
  } else if (h.flags.introAt && h.t >= 0) {
    h.flags.introAt = false;
    startMech(state, h.cur);
  } else if (mechDone(state)) {
    state.stageMemo[MEMO.wrecks] = String(h.cur + 1);
    if (h.cur >= MECHS.length - 1) { endBegin(state, h); return hands(); }
    beginTransit(state, h, h.cur + 1);
  }
  // Harry hovering over it all, swearing
  harryHovers(state, h);
  if (p.health > 0 && f > h.heckleAt && quiet(state)) { h.heckleAt = f + 800 + Math.random() * 400; harrySays(state, pickLine(byPants(state, HARRY_HECKLE)), false); }
  if (h.lastHp >= 0 && p.health < h.lastHp && p.health > 0 && f - h.gloatAt > 600 && Math.random() < 0.3) { h.gloatAt = f; if (harrySays(state, pickLine(HARRY_GLOAT), false)) { h.hpose = 'gloat'; h.flags.gloatT = true; } }
  h.lastHp = p.health;
  // (what's dropped up here floats)
  for (const q of state.pickups as Pickup[]) if (q.pos.y < GY - 1000) { q.vel.x = 0; q.vel.y = -GRAVITY; }
  return hands();
};

const harryHovers = (state: GameState, h: Heli) => {
  const f = state.frame;
  const tx = CAMX + HARRY_AT.x + Math.sin(f * 0.013) * 70, ty = CY + HARRY_AT.y + Math.sin(f * 0.021) * 22;
  h.hx += (tx - h.hx) * 0.04; h.hy += (ty - h.hy) * 0.04;
  if (h.hpose === 'gloat' && !h.harry) h.hpose = 'jet';
};

// ---------------------------------------------------------------------------------------------------------------
// The end: Harry's rocket, the fall, on to his arena

const endBegin = (state: GameState, h: Heli) => {
  h.phase = 'end'; h.t = 0; h.step = 0; h.boost = null;
  for (const e of h.goons) e.health = 0;
  state.enemies = state.enemies.filter(e => !h.goons.includes(e));
  setUi({ heliTips: false });
};

const endUpdate = (ctx: FrameContext, h: Heli): Controls => {
  const { state } = ctx, p = state.player, f = state.frame;
  p.inCutscene = true; p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  holdCam(state, h, CAMX, CY);
  if (h.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); finish(state, h); return hands(); } }
  h.rotor += 0.7; h.spin += 0.0015;
  updateRockets(ctx); updateMechs(ctx);
  if (h.step === 0) {
    // (him, eased to a hover; Harry to his spot; his rant, the launcher up)
    h.ox += (CAMX + 240 - h.seat - h.ox) * 0.03; h.oy += (CY + 360 - h.oy) * 0.03; h.tilt *= 0.9; h.flip *= 0.8;
    p.spriteRot = h.tilt + h.flip * Math.PI;
    seatHim(state, h);
    h.hx += (CAMX + 600 - h.hx) * 0.04; h.hy += (CY + 160 - h.hy) * 0.04;
    if (h.t === 40) harrySays(state, pickLine(byPants(state, HARRY_END)), true, () => { h.hpose = 'aim'; meatheadSays(state, pickLine(MH_ROCKET), true, () => { h.flags.fire = true; }); });
    if (h.flags.fire || h.t > 1200) {
      h.step = 1; h.t = 0; h.hpose = 'fire';
      h.hrocket = { x: h.hx - 40, y: h.hy - 58 };
      playSound('boom', 0.7, 8); playSound('whoosh', 1, -4);
    }
  } else if (h.step === 1) {
    // (the rocket: right at him)
    seatHim(state, h);
    const r = h.hrocket!, ft = feetOf(state), tx = ft.x, ty = ft.y - 40, d = Math.hypot(tx - r.x, ty - r.y) || 1;
    r.x += (tx - r.x) / d * 12; r.y += (ty - r.y) / d * 12;
    if (h.t > 8) h.hpose = 'gloat';
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
    if (h.oy > CY + H + 120) { h.step = 3; h.t = 0; playSound('boom', 1, -16); playSound('crash', 1, -10); shakeScreen(state, 30, 20); }
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
  p.carried = false; p.cartSeat = false; p.hidden = false; p.spriteRot = 0; p.inCutscene = false; p.noSpecials = false;
  p.vel.x = 0; p.vel.y = 0; p.facing = 1; p.invincibilityTimer = 0;
  setUi({ noSwitch: false, heliTips: false });
  letCamGo(state, h);
  teleport(state, DOORS.harry.start.x, DOORS.harry.start.y);
  state.camera.y = DOORS.harry.start.y - 550;
  if (state.checkpoint < 120) state.checkpoint = 119;
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
    if (state.stageMemo[MEMO.done]) { h.over = true; h.phase = 'gone'; }
    setUi({ heliTips: false, noSwitch: false });
  },
  update: (ctx, controls) => {
    const { state } = ctx, h = heliOf(state), p = state.player;
    h.t++;
    if (h.over) { runExits(state, endExits('heli', { left: false })); return controls; }
    // (starting again at a landmark's checkpoint: straight up there, into it)
    if (h.phase === 'pad' && state.checkpoint >= 111 && state.checkpoint <= 119) { startAt(state, h, state.checkpoint - 111); return hands(); }
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
    void p;
    return controls;
  },
  cameraX: (state) => { const h = heliOf(state); return h.cam ? { min: h.camX, max: h.camX } : undefined; },
  drawBackdrop: (c, state) => {
    const h = heliOf(state);
    const up = (h.phase === 'lift' && globeRise(h) > 0) || h.phase === 'tour' || h.phase === 'fly' || h.phase === 'end';
    if (!up) return false;
    drawFlightBackdrop(c, state);
    return true;
  },
  drawBack: (c, state) => {
    const h = heliOf(state), v = viewIn(state), f = state.frame;
    if (state.camera.y > CY + 900 || h.phase === 'pad' || h.phase === 'board' || h.phase === 'gone') drawPad(c, state, h);
    if (h.phase === 'lift' || h.phase === 'tour' || h.phase === 'fly' || h.phase === 'end') drawLandmarks(c, state);
    void v;
    // (the helicopter round him: its back half, behind him)
    if (!h.over && h.phase !== 'gone') {
      const piv = h.phase === 'pad' || (h.phase === 'board' && h.step < 2) ? { x: PAD_O.x + SEAT_BACK, y: PAD_O.y } : feetOf(state);
      const rot = h.phase === 'fly' || h.phase === 'end' ? { tilt: h.tilt, flip: h.flip } : { tilt: 0, flip: 0 };
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
      const rot = h.phase === 'fly' || h.phase === 'end' ? { tilt: h.tilt, flip: h.flip } : { tilt: 0, flip: 0 };
      drawCopter(c, 'front', piv.x, piv.y, { seat: onPad ? SEAT_BACK : h.seat, tilt: rot.tilt, flip: rot.flip, rotor: h.rotor }, f, { harryDoor: !!h.flags.door, burning: (h.phase === 'end' && h.step >= 2) || p.health <= 0 });
    }
    drawRockets(c, state);
    // Harry out of the helicopter: falling, on his jetpack, with his launcher
    if (h.phase === 'tour' && h.step >= TOUR.length || h.phase === 'fly' || h.phase === 'end') {
      if (h.hpose !== 'pilot') drawHarry(c, h.hx, h.hy, { pose: h.hpose, f, mad: h.turned || !!h.flags.rising, jetpack: h.hpose !== 'shoved' && h.hpose !== 'fall', talking: !!h.harry, facing: h.hpose === 'aim' || h.hpose === 'fire' ? -1 : (state.player.pos.x < h.hx ? -1 : 1), rot: h.hpose === 'fall' || h.hpose === 'shoved' ? h.t * 0.15 : 0, scale: 1.15 });
    }
    if (h.hrocket) {
      const r = h.hrocket;
      c.fillStyle = INK; c.fillRect(r.x - 10, r.y - 5, 20, 10); c.fillStyle = '#4D5B2A'; c.fillRect(r.x - 9, r.y - 4, 18, 8); c.fillStyle = '#DC2626'; c.fillRect(r.x - 10, r.y - 4, 5, 8);
      c.fillStyle = (f >> 1) % 2 ? '#FDE047' : '#F97316'; c.beginPath(); c.arc(r.x + 13, r.y, 6, 0, Math.PI * 2); c.fill();
    }
    // Who's saying what (kept whole on screen)
    if (h.harry) saidOver(c, h.harry.text, h.hx, h.hy - 104, '#FDE68A', 300);
    if (h.mech) { const m = h.mechs[h.cur]; const mx = CAMX + 620, my = CY + (m?.id === 'pisa' ? 160 : 120); saidOver(c, h.mech.text, mx, Math.max(my, state.camera.y + 130), '#BFDBFE', 280); }
    if (h.guest) saidOver(c, h.guest.s.text, h.guest.x, GY - 100, '#E5E7EB', 220);
    if (h.goonSaid && h.goonSaid.e.health > 0) saidOver(c, h.goonSaid.s.text, h.goonSaid.e.pos.x + h.goonSaid.e.width / 2, h.goonSaid.e.pos.y - 16, '#BFDBFE', 200);
  },
  drawHud: (c, state) => {
    const h = heliOf(state), p = state.player;
    const cut = (h.phase === 'board' || h.phase === 'lift' || h.phase === 'tour' || h.phase === 'end') && h.t > SKIP_AFTER;
    if (cut) drawSkipPrompt(c, CANVAS_WIDTH);
    if (h.white > 0) { c.fillStyle = `rgba(255,255,255,${h.white})`; c.fillRect(0, 0, W, H); }
    if (h.phase !== 'fly' || p.inCutscene) return;
    drawCharges(c, state);
    // The landmark's bar (the top band, clear of the HUD)
    const m = h.mechs[h.cur];
    if (m && !h.transit && (m.st === 'intro' || m.st === 'fight' || m.st === 'dying')) {
      const band = topBand(), w = band.x2 - band.x1, k = m.id === 'pisa' ? (m.hp > 0 ? 1 : 0) : Math.max(0, m.hp / m.max);
      box(c, band.x1, 18, w, 14, '#18181B');
      box(c, band.x1 + 2, 20, (w - 4) * k, 10, m.flash > 0 ? '#FECACA' : m.id === 'pisa' ? '#60A5FA' : k < 0.33 ? '#EF4444' : '#F59E0B');
      label(c, MECH_NAME[m.id], band.mid, 46, '#FDE68A', 7);
      if (m.id === 'pisa' && m.hp > 0) label(c, 'IMMUNE', band.mid, 29, (state.frame >> 3) % 2 ? '#FFFFFF' : '#BFDBFE', 7);
      label(c, `${h.cur + 1} OF ${MECHS.length}`, band.x2 - 40, 60, '#A1A1AA', 6);
    }
  },
  outdoors: () => 1,
};

// ---------------------------------------------------------------------------------------------------------------
// The helipad, drawn (crude, the first pass): the pad and its H, the queue's rails and the guests in it, the ride's
// sign; after it's all over, the scorch where the helicopter was, the ride closed, nobody in line

const drawPad = (c: CanvasRenderingContext2D, state: GameState, h: Heli) => {
  const v = viewIn(state), f = state.frame;
  promenade(c, v, x0, x1 + 200, '#D6CBB4', '#8C7F68');
  // (the pad: a concrete slab, the yellow circle and its H)
  if (onScreen(v, X(PAD_X - 260), X(PAD_X + 260))) {
    box(c, X(PAD_X - 240), GY - 4, 480, 4, '#9CA3AF');
    c.strokeStyle = '#FDE047'; c.lineWidth = 4; c.beginPath(); c.ellipse(X(PAD_X), GY - 2, 200, 6, 0, 0, Math.PI * 2); c.stroke();
    if (h.over) { c.fillStyle = 'rgba(20,20,20,0.6)'; c.beginPath(); c.ellipse(X(PAD_X), GY - 2, 150, 5, 0, 0, Math.PI * 2); c.fill(); }
  }
  // (the queue: switchback rails, set back; the guests in it (not on a revisit))
  if (onScreen(v, X(QUEUE_A), X(QUEUE_B))) setBack(c, v, X(QUEUE_A), QUEUE_B - QUEUE_A, 0.92, () => {
    const w = QUEUE_B - QUEUE_A;
    for (const y of [-34, -64]) { box(c, 0, y, w, 4, dimmed('#A1A1AA')); for (let x = 0; x <= w; x += 80) box(c, x, y, 4, -y, dimmed('#71717A')); }
    if (!h.over) for (const g of PAD_GUESTS) guest(c, g.x - QUEUE_A, g.row ? -30 : -2, g.seed, f);
  });
  if (onScreen(v, X(QUEUE_A - 120), X(QUEUE_A + 120))) postBoard(c, X(QUEUE_A - 40), GY, h.over ? ['HELICOPTER RIDES ACROSS THE WORLD', 'CLOSED', '(HELICOPTER MISSING)'] : ['HELICOPTER RIDES ACROSS THE WORLD', 'WAIT TIME: 3 HOURS', 'TOLERANCE: MANDATORY'], LOOKS.land(1), '#1E3A8A', undefined, 150);
  if (onScreen(v, X(CP_PAD - 100), X(CP_PAD + 100)) && !h.over) postBoard(c, X(CP_PAD + 40), GY, ['SEE THE WHOLE WORLD', '(BIGGER)'], LOOKS.land(1), '#7F1D1D', undefined, 100);
};
/** A guest in the queue (crude: a body, a head, a shirt by seed; fed up). */
const guest = (c: CanvasRenderingContext2D, x: number, y: number, seed: number, f: number) => {
  const shirt = ['#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#9333EA', '#F8FAFC'][seed % 6], skin = ['#8A5A3C', '#C98E66', '#E2AC84', '#5C3A24'][seed % 4];
  const bob = Math.sin(f * 0.04 + seed) * 1;
  box(c, x - 7, y - 30, 14, 30, dimmed('#334155'));
  box(c, x - 9, y - 58 + bob, 18, 30, dimmed(shirt));
  box(c, x - 7, y - 74 + bob, 14, 16, dimmed(skin));
  box(c, x - 7, y - 76 + bob, 14, 5, dimmed(['#1C1917', '#78350F', '#FDE68A', '#57534E'][seed % 4]));
  void hour;
};
