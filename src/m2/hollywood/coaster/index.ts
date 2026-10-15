// THE COASTER: section 2 of Hollywood Land (owner: the coaster agent). THRONES OF THE STARS: an outdoor roller
// coaster, absurdly huge and absurdly impossible (a theme-park-sim monstrosity: loops on loops, an immelmann, a top
// hat straight up and down, the INSANITY LOOPS: ten, each smaller than the last). He skips the line (shoving through the
// guests, over the rails: they're outraged) and hops in the front seat (a golden throne-toilet). Not a ride he steers:
// the rides are shows (track.ts: the camera pulled back on the train, HUD gone, SKIP >> for the lot), he whoops, never
// sick. Three stops, each a deck up on the structure with a TOILET A FAMOUS PERSON SHAT IN on a plinth like a relic
// (art.ts: merely gross, worse, a biohazard), the ride's narrator introducing each like a holy relic. At each stop the
// staff pile out of the doors to kill the line cutter (kinds.ts: ride ops, janitors with plungers, docents with
// pointers, security; layout.ts WAVES, escalating); the train won't go till they're all dead. Stop 3: the biohazard
// vents fumes (they hurt him and the staff); past the staff, the CONTROL BOOTH up on its stilts, a guy asleep at the
// desk, the lever: flipped to EXPERIMENTAL, the next ride launches him off the end of the track and through the air at
// the warehouse (its walls come down: the warehouse's burst-in, section.ts takeBurstIn).
//
// Rides hurt anybody on the track (the station's gate staff, if he boards with them alive; stop 2's track walker, who
// had his headphones on). Kept across his deaths (state.stageMemo; layout.ts): each stop's staff dead, the lever, the
// launch, the walker. Checkpoints 10-14: the queue, the station, a stop each.
//
// One-way: the launch. Back from the warehouse (DOORS.coaster.end) he's on stop 3's deck under the booth; the way
// down is each stop's SERVICE STAIRS (out at the station's staff door), or the train (the lever stays on EXPERIMENTAL:
// it launches him again, off the bent end). Revisits differ: the booth empty (BACK IN 5), the track bent and torn at
// the end (TRACK CLOSED), the staff gone, the walker's blood on the deck.
//
// ~15000 px of play: the queue and station ~2700 (~35 s with the shoving), the rides ~14 s, ~20 s and ~30 s (the
// launch ~6 s), the three stops' fights ~25 s, ~40 s and ~60 s. About 3.5 min, the rides skippable.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { EnemyKind } from '../../../m1/types';
import type { HollywoodSection } from '../section';
import {
  layOwn, solid, ledge, endWalls, endExits, runExits, hands, speak, meatheadSays, saidOver, teleport, noteBurstIn,
} from '../section';
import { DOORS } from '../geometry';
import { setUi } from '../../store';
import { pickLine, silenceAll, isTalking } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { setHazardZones, hazardVictims, hazardKill, hazardHit, boxHits } from '../../hazardHit';
import { lookOf, drawPerson } from '../../adventure/temple/people';
import { byPants } from '../blvd/kinds';
import { PA_VOICE } from '../blvd/lines';
import {
  x0, x1, X, Y, GY, QUEUE_GROUND, STATION, RAILS, RAIL_H, GUESTS, GATE_OPS, STEVE_STANDEE, STOPS, BOOTH, FUMES, WAVES, WIRES,
  PICKUPS, CHECKPOINTS, queueH, parkAt, CLEARED_MEMO, LEVER_MEMO, LAUNCHED_MEMO, WALKER_MEMO, type Place,
} from './layout';
import { tracks, rideFrom, at, Mode, type Track } from './track';
import { coasterOf, type Coaster } from './state';
import { updatePlungers, staffBark, BEAM } from './kinds';
import { drawPlunger } from './kindArt';
import { drawCoasterBackdrop, drawCoasterBack, drawTrain, drawFlyingTrain, carsOn, carsParked, coasterLamps, SINK } from './art';
import * as L from './lines';
import { updateThrones, drawThroneFront, inCase, throneState } from './thrones';

const narr = L.NARRATOR;

/** Once a stage run (kept across his deaths: not said again every time he's back at a checkpoint). */
const once = (state: GameState, k: string) => { const key = `hwc-said-${k}`; if (state.stageMemo[key]) return false; state.stageMemo[key] = '1'; return true; };
const memo = (state: GameState, k: string) => !!state.stageMemo[k];

/** A fixed line (no pool to pick from) said in the last 45 s: not again yet (the standing rule; pickLine does it for
 *  the pools). */
const lastSaid = new Map<string, number>();
const fresh = (line: string) => { const t = Date.now(), l = lastSaid.get(line); if (l !== undefined && t - l < 45000) return false; lastSaid.set(line, t); return true; };
/** The PA says something (the ride's narrator over the thrones' speakers, or the park's over the horn): in turn. */
const paSay = (state: GameState, voice: string, line: string, onDone?: () => void) => {
  if (!fresh(line)) { onDone?.(); return; }
  const o = coasterOf(state);
  o.paAt = state.frame; o.paBusy = true; o.paFrom = voice === PA_VOICE ? 'horn' : 'train';
  let done = false;
  speak(voice, line, s => { o.pa = s; }, true, () => { if (done) return; done = true; o.paBusy = false; onDone?.(); });
};

/** Where he is: the queue and the station, one of the stops' decks (or up off it), or nowhere in particular. */
const placeOf = (state: GameState): Place | null => {
  const p = state.player, rx = p.pos.x + p.width / 2 - x0, feet = p.pos.y + p.height;
  if (rx < STATION.b + 60) return 'station';
  for (let i = 0; i < 3; i++) { const s = STOPS[i]; if (rx > s.a - 80 && rx < s.b + 80 && feet <= Y(s.h) + 12 && feet > Y(s.h) - 700) return i as 0 | 1 | 2; }
  return null;
};

// ---------------------------------------------------------------------------------------------------------------
// The ride: on the train, along a track (a show: no hands), and off at the far end

/** His feet on the front seat at a rail point (rolled with the car: over the top of a loop he's hanging under it). */
const seat = (state: GameState, x: number, y: number, a: number, roll: number) => {
  const p = state.player, k = Math.cos(roll);
  p.pos.x = x + Math.sin(a) * SINK * k - p.width / 2;
  p.pos.y = y - Math.cos(a) * SINK * k - p.height;
  p.vel.x = 0; p.vel.y = 0;
  p.spriteRot = a + roll;
  p.facing = k >= 0 ? 1 : -1;
};
/** (past the end of a track: on along its last heading) */
const pointOn = (tr: Track, s: number) => {
  if (s <= tr.len) return at(tr, s);
  const e = tr.pts[tr.pts.length - 1], d = s - tr.len;
  return { ...e, x: e.x + Math.cos(e.a) * d, y: e.y + Math.sin(e.a) * d };
};

const board = (state: GameState, co: Coaster, pl: Place) => {
  const p = state.player, r = co.ride, lever = memo(state, LEVER_MEMO);
  const tr = rideFrom(pl, lever);
  Object.assign(r, { on: true, track: tr, s: 0, v: 0, t: 0, fly: null, fade: 0, cued: new Set<string>(), lx: 0, ly: 0, zoom: 1 });
  // (the camera from where it is: it glides onto the train, no jump)
  r.fx = state.camera.x + CANVAS_WIDTH / 2; r.fy = state.camera.y + CANVAS_HEIGHT / 2;
  p.carried = true; p.cartSeat = true; p.inCutscene = true;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.isDucking = false;
  p.vine = undefined;
  const first = !co.said.boarded; co.said.boarded = true;
  meatheadSays(state, pickLine(first ? L.BOARD : L.BOARD_AGAIN), true);
  playSound('clang', 0.7, 4); playSound('beep', 0.4, 8);
  if (pl === 'station' && once(state, 'spiel')) paSay(state, narr, pickLine(L.SPIEL_STATION));
  if (pl === 0 && once(state, 'steve-narr')) paSay(state, narr, L.SPIEL_LIFT[1]);
  if (pl === 2) {
    if (lever) paSay(state, narr, L.SPIEL_EXPERIMENTAL[0]);
    else { paSay(state, narr, L.SPIEL_BACK[0]); meatheadSays(state, pickLine(L.RIDE_BACK), true); }
  }
};

/** Off the train (a ride's end, or the cut), back in his own hands. */
const offTrain = (state: GameState, co: Coaster) => {
  const p = state.player, r = co.ride;
  r.on = false; r.track = null; r.fly = null; r.fade = 0; r.zoom = 1;
  p.carried = false; p.cartSeat = false; p.inCutscene = false; p.spriteRot = 0; p.facing = 1; p.hidden = false;
  state.cameraOverride = null;
  setHazardZones(state, 'hwc-train', []);
};
/** Parked at a place: he hops out beside the front seat. */
const arrive = (state: GameState, co: Coaster, pl: Place, snap: boolean) => {
  offTrain(state, co);
  const park = parkAt(pl), p = state.player;
  p.pos.x = park.x + 46 - p.width / 2; p.pos.y = park.y - p.height; p.isGrounded = true;
  state.cameraRestY = park.y - 550;
  if (snap) { state.camera.x = park.x - CANVAS_WIDTH / 2; state.camera.y = park.y - 550; }
  if (pl === 1 && co.said.walkerHit) { co.said.walkerHit = false; meatheadSays(state, pickLine(L.WALKER), true); }
};
/** Out of the sky and through the warehouse's wall: on to the warehouse (its burst-in's its own). */
const handoff = (state: GameState, co: Coaster, skipped: boolean) => {
  if (skipped) silenceAll();
  offTrain(state, co);
  co.pa = null; co.paBusy = false;
  state.stageMemo[LAUNCHED_MEMO] = '1'; state.stageMemo[CLEARED_MEMO(2)] = '1';
  noteBurstIn();
  const d = DOORS.warehouse.start, p = state.player;
  teleport(state, d.x, d.y);
  state.camera.y = d.y - 550; state.cameraRestY = d.y - 550;
  p.vel.x = 6; p.vel.y = -5;
};
/** SKIP >>: the whole ride, to its end. */
const finish = (state: GameState, co: Coaster) => {
  const tr = co.ride.track!;
  silenceAll();
  co.pa = null; co.paBusy = false;
  if (tr === tracks().r2 && !memo(state, WALKER_MEMO)) state.stageMemo[WALKER_MEMO] = '1';
  if (tr.to === 'warehouse') return handoff(state, co, true);
  arrive(state, co, tr.to === 'fade' ? 'station' : tr.to, true);
};

/** What's said where on a ride (Meathead's casual: never over anybody). */
const cue = (state: GameState, co: Coaster, name: string) => {
  const T = tracks(), tr = co.ride.track!;
  const whoop = (pool: string[]) => meatheadSays(state, pickLine(pool), false);
  if (name === 'lift') { if (tr === T.r3) paSay(state, narr, L.SPIEL_INSANE[0]); else if (!co.paBusy) paSay(state, narr, L.SPIEL_LIFT[0]); else whoop(L.RIDE_LINES.lift); }
  else if (name === 'drop') whoop(L.RIDE_LINES.drop);
  else if (name === 'loop' || name === 'immelmann' || name === 'double') whoop(L.RIDE_LINES.loop);
  else if (name === 'roll') whoop(L.RIDE_LINES.roll);
  else if (name === 'tophat') whoop(L.RIDE_LINES.tophat);
  else if (name === 'insane0' || name === 'insane4' || name === 'insane8') whoop(L.RIDE_LINES[name]);
  else if (name === 'brakes' && Math.random() < 0.5) whoop(L.RIDE_LINES.brakes);
};

const G = 0.26, DRAG = 0.00025, LIFT_V = 4.5, MIN_V = 4;
const riding = (ctx: FrameContext, co: Coaster): Controls => {
  const { state } = ctx, p = state.player, r = co.ride, T = tracks();
  let tr = r.track!;
  r.t++;
  p.inCutscene = true; p.carried = true;
  if (r.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finish(state, co); return hands(); } }
  let x: number, y: number, a: number, roll = 0;
  if (r.fly) {
    // THE LAUNCH's flight: off the end, up and away, turning over; a white-out, and he's at the warehouse
    const fl = r.fly;
    fl.t++; fl.vy += 0.3; fl.x += fl.vx; fl.y += fl.vy; fl.rot += 0.07;
    if (fl.t === 12) paSay(state, narr, L.SPIEL_FLIGHT[0]);
    if (fl.t > 75) r.fade = Math.min(1, r.fade + 0.04);
    x = fl.x; y = fl.y; a = fl.rot;
    if (r.fade >= 1) { handoff(state, co, false); return hands(); }
  } else {
    const pt0 = pointOn(tr, r.s);
    // The physics: gravity along the rail, a little drag; the chain's own speed; the boosters; the launch; the brakes
    if (pt0.mode === Mode.Lift) { r.v += (LIFT_V - r.v) * 0.2; if (state.frame % 8 === 0) playSound('click', 0.35, -6); }
    else if (pt0.mode === Mode.Boost) r.v = Math.min(Math.max(r.v, 0) + 0.3, Math.max(r.v, 10));
    else if (pt0.mode === Mode.Launch) { r.v = Math.min(r.v + 0.5, 26); if (state.frame % 4 === 0) playSound('rumble', 0.5, 6); }
    else r.v += G * Math.sin(pt0.a) - DRAG * r.v * r.v;
    if (pt0.mode === Mode.Brake) { r.v = Math.min(r.v, Math.sqrt(2 * 0.14 * Math.max(0, tr.len - r.s)) + 0.4); if (state.frame % 6 === 0 && r.v > 1) playSound('grind', 0.25, 8); }
    if (pt0.mode !== Mode.Lift && pt0.mode !== Mode.Brake) r.v = Math.max(r.v, MIN_V);
    if (r.v > 14 && state.frame % 10 === 0) playSound('rumble', 0.35, 2);
    r.s += r.v;
    for (const [name, s] of tr.marks) if (r.s >= s && !r.cued.has(name)) { r.cued.add(name); cue(state, co, name); }
    // (the cut to the station: past the end of the way back, the fade to black; then in to the station, out of it)
    if (tr.to === 'fade' && r.s >= tr.len) {
      r.fade = Math.min(1, r.fade + 1 / 30);
      if (r.fade >= 1) { r.track = tr = T.arrive; r.s = 0; r.v = 7; const p0 = tr.pts[0]; r.fx = p0.x; r.fy = p0.y; r.lx = r.ly = 0; }
    } else if (tr === T.arrive && r.fade > 0) r.fade = Math.max(0, r.fade - 1 / 30);
    const pt = pointOn(tr, r.s);
    x = pt.x; y = pt.y; a = pt.a; roll = pt.roll;
    // Anybody on the track's run down (the station's gate staff, if he left them alive); nobody walks out in front of it
    const cars = carsOn(tr, Math.min(r.s, tr.len)), front = cars[0];
    for (const e of hazardVictims(state)) for (const k of cars) if (boxHits(e, k.x - 34, k.y - 92, 68, 92)) {
      hazardKill(ctx, e, k.x - Math.cos(k.a) * 40, 'NEXT STOP!', { fling: { x: Math.cos(k.a) * 14, y: -12 }, sound: 'crunch' });
      shakeScreen(state, 6, 3);
      break;
    }
    setHazardZones(state, 'hwc-train', [{ x0: front.x - 3 * 74 - 40, x1: front.x + 180, y0: front.y - 100, y1: front.y + 4 }]);
    // Stop 2's track walker (mopping the rail, headphones on): hit
    if (tr === T.r2 && !memo(state, WALKER_MEMO) && front.x >= X(STOPS[1].a + 100) - 40 && Math.abs(front.y - Y(STOPS[1].h)) < 40) {
      state.stageMemo[WALKER_MEMO] = '1'; co.said.walkerHit = true;
      co.walker = { x: X(STOPS[1].a + 100), y: Y(STOPS[1].h) - 40, vx: 11, vy: -15, rot: 0 };
      playSound('splat', 1, -4); playSound('crunch', 0.9); playSound('screams', 0.6); shakeScreen(state, 8, 4);
      for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: co.walker.x, y: co.walker.y }, vel: { x: 3 + Math.random() * 8, y: -2 - Math.random() * 8 }, life: 40 + Math.random() * 30, color: ['#B91C1C', '#7F1D1D', '#DC2626'][i % 3], size: 2 + Math.random() * 3, grav: 0.35 });
    }
    if (r.s >= tr.len && tr.to !== 'fade') {
      if (tr.to === 'warehouse') {
        // (off the end of the EXPERIMENTAL section)
        r.fly = { x, y, vx: Math.cos(a) * r.v, vy: Math.sin(a) * r.v, rot: a, t: 0 };
        meatheadSays(state, pickLine(L.LAUNCH), false);
        playSound('boom', 0.8, -6); playSound('whoosh', 1, -8); shakeScreen(state, 14, 6);
      } else { arrive(state, co, tr.to, false); return hands(); }
    }
  }
  seat(state, x, y, a, roll);
  // The camera: pulled back on the train, looking a little ahead the way it's going (back in to his size on the brakes)
  const mode = r.fly ? Mode.Free : pointOn(tr, r.s).mode;
  const look = Math.min(170, r.v * 9);
  r.lx += (Math.cos(a) * look - r.lx) * 0.05; r.ly += (Math.sin(a) * look * 0.6 - r.ly) * 0.05;
  const want = r.fly ? 0.45 : mode === Mode.Brake ? 1 : tr === T.r3 ? 0.5 : 0.58;
  r.zoom += (want - r.zoom) * (mode === Mode.Brake ? 0.05 : 0.03);
  r.fx += (x + r.lx - r.fx) * 0.2; r.fy += (y + r.ly - 40 * r.zoom - r.fy) * 0.2;
  state.camera.x = r.fx - CANVAS_WIDTH / 2; state.camera.y = r.fy - CANVAS_HEIGHT / 2;
  state.cameraOverride = { x: state.camera.x, y: state.camera.y };
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------
// The stops: the toilet, the staff, wave by wave; the train freed

const startFight = (state: GameState, i: number) => {
  const run = coasterOf(state).stops[i];
  run.phase = 'fight'; run.wave = 0; run.queue = [...WAVES[i][0]]; run.spawnT = 10; run.t = 0;
};
const clearStop = (state: GameState, co: Coaster, i: number) => {
  co.stops[i].phase = 'clear';
  state.stageMemo[CLEARED_MEMO(i)] = '1';
  meatheadSays(state, pickLine(L.CLEARED), true);
  paSay(state, narr, pickLine(L.SPIEL_CLEAR));
  if (i === 2 && !memo(state, LEVER_MEMO)) meatheadSays(state, pickLine(L.BOOTH), true);
};
const spawn = (state: GameState, co: Coaster, i: number) => {
  const run = co.stops[i], s = STOPS[i], [kind, which] = run.queue.shift()!;
  const up = which === 'upper' && s.upper;
  const dx = up ? X(s.upper!.x) : X(s.door), fy = up ? Y(s.h + s.upper!.h) : Y(s.h);
  const e = makeKindEnemy(kind as EnemyKind, dx, fy);
  e.variant = (i * 41 + run.wave * 13 + run.n++ * 7) % 23;
  e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
  const p = state.player;
  e.facing = dx > p.pos.x + p.width / 2 ? -1 : 1;
  e.aiState = 'approach'; e.aiTimer = 0; e.leapCd = 30;
  state.enemies.push(e); run.out.push(e);
  if (up) run.upperT = 30; else run.doorT = 30;
  playSound('slam', 0.4, 6);
  if (run.n === 1) meatheadSays(state, pickLine(L.STAFF_OUT), false);
  else staffBark(state, e, e.kind === 'm2:hwc_janitor' ? L.STAFF_VOICES.janitor : e.kind === 'm2:hwc_docent' ? L.STAFF_VOICES.docent : e.kind === 'm2:hwc_guard' ? L.STAFF_VOICES.guard : L.STAFF_VOICES.rideop, e.kind === 'm2:hwc_janitor' ? L.JANITOR_BARK : e.kind === 'm2:hwc_docent' ? L.DOCENT_BARK : e.kind === 'm2:hwc_guard' ? L.GUARD_BARK : L.RIDEOP_BARK, 0.25);
};
const runStop = (state: GameState, co: Coaster, i: number) => {
  const run = co.stops[i], cleared = memo(state, CLEARED_MEMO(i));
  if (run.doorT > 0) run.doorT--;
  if (run.upperT > 0) run.upperT--;
  run.door += ((run.doorT > 0 ? 1 : 0) - run.door) * 0.15; run.upper += ((run.upperT > 0 ? 1 : 0) - run.upper) * 0.15;
  if (cleared && run.phase !== 'clear') { run.phase = 'clear'; return; }
  switch (run.phase) {
    case 'idle': {
      run.phase = 'intro'; run.t = 0; run.go = false;
      // (the first time here: the narrator's relic, his take on it, the staff called; back again after dying: straight on)
      if (once(state, `toilet${i}`)) paSay(state, narr, L.SPIEL_TOILET[i][0], () => {
        meatheadSays(state, pickLine(L.TOILET_LINES[i]), true, () => paSay(state, narr, pickLine(byPants(state, L.SPIEL_STAFF)), () => { run.go = true; }));
      });
      else run.go = true;
      break;
    }
    case 'intro':
      // (on once it's all been said; a long while at most, whatever the speech is doing)
      run.t++;
      if ((run.go && run.t > 50) || run.t > 900) startFight(state, i);
      break;
    case 'fight': {
      run.out = run.out.filter(e => e.health > 0 && !e.isBlownAway && state.enemies.includes(e));
      if (run.queue.length) { if (--run.spawnT <= 0) { spawn(state, co, i); run.spawnT = 28; } break; }
      if (run.out.length) { run.t = 0; break; }
      if (run.wave < WAVES[i].length - 1) {
        if (++run.t === 20 && !co.paBusy) paSay(state, narr, pickLine(L.SPIEL_MORE));
        if (run.t >= 75) { run.wave++; run.queue = [...WAVES[i][run.wave]]; run.spawnT = 0; run.t = 0; }
      } else clearStop(state, co, i);
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Him about the place: the queue, boarding, the stairs, the booth

const queueBits = (state: GameState, co: Coaster) => {
  const p = state.player, cx = p.pos.x + p.width / 2, rx = cx - x0, feet = p.pos.y + p.height;
  if (rx > 300 && once(state, 'pa-steve-1')) paSay(state, PA_VOICE, L.PA_STEVE_QUEUE[0]);
  if (rx > 1350 && once(state, 'pa-steve-2')) paSay(state, PA_VOICE, L.PA_STEVE_QUEUE[1]);
  if (rx > STEVE_STANDEE - 160 && rx < STEVE_STANDEE + 40 && once(state, 'standee')) meatheadSays(state, L.STEVE_STANDEE[0], true);
  co.guests.forEach((g, i) => {
    if (g.shove > 0) g.shove--;
    if (g.mad > 0) g.mad--;
    const gx = X(g.rx), gy = Y(queueH(g.rx));
    if (g.shove > 0 || Math.abs(cx - gx) > 20 || Math.abs(feet - gy) > 34 || (Math.abs(p.vel.x) < 0.5 && p.isGrounded)) return;
    // Shoved aside (he's not stopping)
    g.shove = 30; g.dir = Math.sign(p.vel.x) || 1; g.mad = 240;
    playSound('thud', 0.4, 4);
    if (once(state, 'cut')) meatheadSays(state, pickLine(L.CUT_LINE), true);
    else if (Math.random() < 0.12) meatheadSays(state, pickLine(L.SHOVE), false);
    if (!co.guestSaid && !co.pa && state.frame - co.guestAt > 100) {
      co.guestAt = state.frame;
      speak(lookOf(g.seed).woman ? L.GUEST_VOICES.f : L.GUEST_VOICES.m, pickLine(byPants(state, L.QUEUE_OUTRAGE)), s => { co.guestSaid = s ? { i, s } : null; }, false);
    }
  });
};

const prompt = (text: string) => setUi({ upPrompt: text });
const onDeckAt = (state: GameState, x: number, y: number, reach: number) => {
  const p = state.player;
  return Math.abs(p.pos.x + p.width / 2 - x) < reach && Math.abs(p.pos.y + p.height - y) < 8 && p.isGrounded;
};

const boarding = (state: GameState, co: Coaster, pl: Place, upIn: boolean) => {
  const park = parkAt(pl);
  if (!onDeckAt(state, park.x, park.y, 46)) return;
  const free = pl === 'station' || memo(state, CLEARED_MEMO(pl));
  if (free) prompt(pl === 2 ? (memo(state, LEVER_MEMO) ? 'HOP ON (EXPERIMENTAL)' : 'HOP ON (BACK TO THE STATION)') : 'HOP ON');
  if (!upIn) return;
  if (free) board(state, co, pl);
  else if (!co.said[`locked${pl}`]) { co.said[`locked${pl}`] = true; { if (fresh(L.LOCKED[0])) meatheadSays(state, L.LOCKED[0], true); }; }
};
const stairs = (state: GameState, co: Coaster, i: number, upIn: boolean) => {
  const s = STOPS[i];
  if (!onDeckAt(state, X(s.stairs), Y(s.h), 34)) return;
  const locked = !memo(state, CLEARED_MEMO(i)) && co.stops[i].phase !== 'idle';
  if (!locked) prompt('SERVICE STAIRS');
  if (!upIn) return;
  if (locked) { if (!co.said[`stairs${i}`]) { co.said[`stairs${i}`] = true; { if (fresh(L.LOCKED[1])) meatheadSays(state, L.LOCKED[1], true); }; } return; }
  // (down the stairs and out at the station's staff door)
  playSound('slam', 0.5, -2);
  teleport(state, X(STATION.b - 120), Y(STATION.h));
  state.camera.y = Y(STATION.h) - 550; state.cameraRestY = state.camera.y;
};
const booth = (state: GameState, co: Coaster, upIn: boolean) => {
  const launched = memo(state, LAUNCHED_MEMO), lever = memo(state, LEVER_MEMO), p = state.player, cx = p.pos.x + p.width / 2;
  // (the sleeper mumbles now and then, him about; he never wakes)
  if (!launched && Math.abs(cx - X(BOOTH.cab)) < 520 && !co.sleeper && state.frame - co.sleepAt > 480 && !isTalking() && !co.pa) {
    co.sleepAt = state.frame;
    speak(L.SLEEPER, pickLine(byPants(state, L.SLEEPER_MUMBLE)), s => { co.sleeper = s; }, false);
  }
  // (back here off the launch: the track's still bent)
  if (launched && !co.said.bent) { co.said.bent = true; meatheadSays(state, pickLine(L.BENT), true); paSay(state, narr, L.SPIEL_BENT[0]); }
  if (lever || !onDeckAt(state, X(BOOTH.lever), Y(BOOTH.h), 44)) return;
  prompt('PULL THE LEVER');
  if (!upIn) return;
  // EXPERIMENTAL
  state.stageMemo[LEVER_MEMO] = '1';
  playSound('clang', 1, -8); playSound('alarm', 0.5, 4); shakeScreen(state, 4, 2);
  meatheadSays(state, pickLine(L.LEVER), true);
  if (!launched && fresh(L.SLEEPER_LEVER[0])) speak(L.SLEEPER, L.SLEEPER_LEVER[0], s => { co.sleeper = s; }, true);
};

/** Stop 3's biohazard: the case rattles (the tell), then vents; the fumes hurt whoever's in them. */
const fumes = (ctx: FrameContext, co: Coaster) => {
  const { state } = ctx, p = state.player, s = STOPS[2], cx = X(s.shrine.x + s.shrine.w / 2);
  // (not while he's shut in the case on its toilet; never again once he's blown it up)
  if (co.ride.on || Math.abs(p.pos.x - cx) > 1600 || inCase(co) || throneState(state, 2) === 'exploded') { setHazardZones(state, 'hwc-fumes', []); return; }
  co.fumeT++;
  const cyc = co.fumeT % FUMES.every, ventAt = FUMES.every - FUMES.vent, tellAt = ventAt - FUMES.tell;
  const tell = cyc >= tellAt && cyc < ventAt, vent = cyc >= ventAt;
  const z = { x0: cx - FUMES.reach, x1: cx + FUMES.reach, y0: Y(s.h) - 200, y1: Y(s.h) + 10 };
  setHazardZones(state, 'hwc-fumes', tell || vent ? [z] : []);
  if (cyc === tellAt) playSound('rumble', 0.4, 10);
  if (tell && cyc % 8 === 0) playSound('click', 0.3, 14);
  if (cyc === ventAt) { playSound('whoosh', 0.9, -12); playSound('fart', 0.5, -6); co.fumeHit = new WeakSet(); }
  if (!vent) return;
  const k = (cyc - ventAt) / FUMES.vent;
  for (let i = 0; i < 2; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 40, y: Y(s.h) - 130 }, vel: { x: (Math.random() - 0.5) * 6, y: -0.5 - Math.random() * 1.5 }, life: 50, color: ['#84CC16', '#BEF264', '#4D7C0F'][i % 3], size: 5 + Math.random() * 6 });
  const inZ = (x: number, y: number, w: number, h: number) => x + w > z.x0 && x < z.x1 && y + h > z.y0 && y < z.y1;
  if (k < 0.95 && p.health > 0 && p.invincibilityTimer <= 0 && inZ(p.pos.x, p.pos.y, p.width, p.height)) hurtPlayer(ctx, 7, 'm2:hwc_fumes', { x: Math.sign(p.pos.x + p.width / 2 - cx || 1) * 6, y: -4 }, 22);
  for (const e of hazardVictims(state)) if (!co.fumeHit.has(e) && inZ(e.pos.x, e.pos.y, e.width, e.height)) { co.fumeHit.add(e); hazardHit(ctx, e, 40, cx, 'GASSED!', { color: '#BEF264' }); }
};

/** Stop 2's track walker, flying (the train's hit him). */
const walkerFlies = (state: GameState, co: Coaster) => {
  const w = co.walker;
  if (!w) return;
  w.vy += 0.5; w.x += w.vx; w.y += w.vy; w.rot += 0.3;
  if (state.frame % 2 === 0) state.particles.push({ pos: { x: w.x, y: w.y }, vel: { x: 0, y: 0 }, life: 30, color: '#991B1B', size: 3, grav: 0.3 });
  if (w.y > GY + 200) co.walker = null;
};

// ---------------------------------------------------------------------------------------------------------------

export const coaster: HollywoodSection = {
  id: 'coaster', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    const co = coasterOf(state);
    layOwn(state, QUEUE_GROUND.map(([a, b, ha, hb]) => ({ x1: X(a), y1: Y(ha), x2: X(b), y2: Y(hb), surface: 'hard' as const })));
    for (const [rx, h] of RAILS) solid(state, X(rx) - 5, Y(h) - RAIL_H, 10, RAIL_H, { hidden: true, tag: 'coaster' });
    solid(state, X(STATION.b), Y(STATION.h) - 900, 40, 900, { hidden: true, tag: 'coaster' });
    STOPS.forEach((s, i) => {
      layOwn(state, [{ x1: X(s.a), y1: Y(s.h), x2: X(s.b), y2: Y(s.h), surface: 'metal' }]);
      solid(state, X(s.a) - 40, Y(s.h) - 900, 40, 960, { hidden: true, tag: 'coaster' });
      solid(state, X(s.b), Y(s.h) - 900, 40, 960, { hidden: true, tag: 'coaster' });
      for (const [rx, h, w] of s.ledges) ledge(state, X(rx), Y(s.h + h), w, { hidden: true, tag: 'coaster' });
      solid(state, X(s.shrine.x), Y(s.h) - s.shrine.h, s.shrine.w, s.shrine.h, { hidden: true, tag: 'coaster' });
      void i;
    });
    ledge(state, X(BOOTH.a), Y(BOOTH.h), BOOTH.b - BOOTH.a, { hidden: true, tag: 'coaster' });
    endWalls(state, 'coaster');
    // (a fresh start further on (the checkpoint-skip cheat): what he'd have done on the way is done)
    if (state.checkpoint >= 13) { state.stageMemo[CLEARED_MEMO(0)] = '1'; state.stageMemo[WALKER_MEMO] = '1'; }
    if (state.checkpoint >= 14) state.stageMemo[CLEARED_MEMO(1)] = '1';
    if (state.checkpoint >= 20) { state.stageMemo[CLEARED_MEMO(2)] = '1'; state.stageMemo[LEVER_MEMO] = '1'; state.stageMemo[LAUNCHED_MEMO] = '1'; state.stageMemo[WALKER_MEMO] = '1'; }
    co.lever = state.stageMemo[LEVER_MEMO] ? 1 : 0;
    // The station's gate: two ride ops (the kind, alone first)
    GATE_OPS.forEach((rx, i) => {
      const e = makeKindEnemy('m2:hwc_rideop' as EnemyKind, X(rx), Y(STATION.h));
      e.variant = 5 + i * 9; e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y; e.facing = -1;
      state.enemies.push(e);
    });
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `coaster-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    co.guests = GUESTS.map(([rx, seed]) => ({ rx, seed, shove: 0, dir: 1, mad: 0 }));
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, co = coasterOf(state);
    if (!controls.up) co.upLatch = false;
    const upIn = !!controls.up && !co.upLatch;
    if (upIn) co.upLatch = true;
    updatePlungers(ctx);
    fumes(ctx, co);
    walkerFlies(state, co);
    co.lever += ((state.stageMemo[LEVER_MEMO] ? 1 : 0) - co.lever) * 0.2;
    if (co.ride.on) return riding(ctx, co);
    setHazardZones(state, 'hwc-train', []);
    if (p.health <= 0) return controls;
    // (the star toilets: crouched by one, or sat on one (thrones.ts))
    const sat = updateThrones(ctx, co, controls, line => paSay(state, narr, line));
    if (sat) return sat;
    const pl = placeOf(state);
    if (pl === 'station') queueBits(state, co);
    if (pl !== null && pl !== 'station') { runStop(state, co, pl); stairs(state, co, pl, upIn); }
    if (pl !== null) boarding(state, co, pl, upIn);
    if (pl === 2) booth(state, co, upIn);
    runExits(state, endExits('coaster').filter(e => e.to === DOORS.blvd.end));
    return controls;
  },
  drawBackdrop: (c, state) => drawCoasterBackdrop(c, state),
  drawBack: (c, state) => {
    const co = coasterOf(state), f = state.frame, r = co.ride;
    drawCoasterBack(c, state, co);
    // The trains: parked at every place (one each: the ride runs a few), but the one he's on, going
    if (r.on && r.track && !r.fly) drawTrain(c, carsOn(r.track, r.s), 'back', f, true);
    else if (r.on && r.fly) drawFlyingTrain(c, r.fly.x, r.fly.y, r.fly.rot, 'back', f);
    if (!r.on) for (const pl of ['station', 0, 1, 2] as Place[]) drawTrain(c, carsParked(pl), 'back', f, false, pl === 'station' ? undefined : !state.stageMemo[CLEARED_MEMO(pl)]);
  },
  drawFront: (c, state) => {
    const co = coasterOf(state), f = state.frame, r = co.ride, p = state.player;
    if (r.on && r.track && !r.fly) drawTrain(c, carsOn(r.track, r.s), 'front', f, true);
    else if (r.on && r.fly) drawFlyingTrain(c, r.fly.x, r.fly.y, r.fly.rot, 'front', f);
    for (const s of co.plungers) drawPlunger(c, s.x, s.y, s.rot);
    if (co.faceStuck > 0 && p.health > 0) drawPlunger(c, p.pos.x + p.width / 2 + p.facing * 30, p.pos.y + 16, p.facing * Math.PI / 2);
    // (security's flashlight beams, while they aim)
    for (const e of state.enemies) {
      if (e.kind !== 'm2:hwc_guard' || e.aiState !== 'aim' || e.health <= 0) continue;
      const fx = e.pos.x + e.width / 2 + e.facing! * 24, fy = e.pos.y + 34;
      c.fillStyle = 'rgba(254, 249, 195, 0.28)'; c.beginPath(); c.moveTo(fx, fy - 3); c.lineTo(fx + e.facing! * BEAM, fy - 40); c.lineTo(fx + e.facing! * BEAM, fy + 40); c.lineTo(fx, fy + 3); c.closePath(); c.fill();
    }
    // (the fumes: a cloud round the case while it vents)
    {
      const s = STOPS[2], cyc = co.fumeT % FUMES.every, ventAt = FUMES.every - FUMES.vent;
      if (cyc >= ventAt && Math.abs(p.pos.x - X(s.shrine.x)) < 1600 && !inCase(co) && throneState(state, 2) !== 'exploded') {
        const k = (cyc - ventAt) / FUMES.vent, cx = X(s.shrine.x + s.shrine.w / 2), a = Math.sin(k * Math.PI);
        for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(${i % 2 ? '132, 204, 22' : '190, 242, 100'}, ${0.22 * a})`; c.beginPath(); c.ellipse(cx + (i - 2.5) * 60, Y(s.h) - 60 - (i % 3) * 40 - k * 30, 70, 46, 0, 0, Math.PI * 2); c.fill(); }
      }
    }
    drawThroneFront(c, state, co);
    // (the walker, flying)
    if (co.walker) { const w = co.walker; c.save(); c.translate(w.x, w.y); c.rotate(w.rot); drawPerson(c, { seed: 3321, outfit: 'maint', f, pose: 'fly', mood: 'shocked' }); c.restore(); }
    // Who's saying what: the staff over their heads, a guest, the sleeper, the PA (not while riding: that's the HUD's)
    for (const e of state.enemies) { const s = co.barks.get(e); if (s && e.health > 0) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 18, '#DDD6FE', 220); }
    if (co.guestSaid) { const g = co.guests[co.guestSaid.i]; saidOver(c, co.guestSaid.s.text, X(g.rx), Y(queueH(g.rx)) - 92, '#FBCFE8', 220); }
    if (co.sleeper) saidOver(c, co.sleeper.text, X(BOOTH.cab + 100), Y(BOOTH.h) - 150, '#BAE6FD', 220);
    if (co.pa && !r.on) {
      if (co.paFrom === 'horn') saidOver(c, co.pa.text, X(220), GY - 320, '#FDE047', 300);
      else { const pl = placeOf(state) ?? 'station', pk = parkAt(pl); saidOver(c, co.pa.text, pk.x - 20, pk.y - 120, '#FDE68A', 300); }
    }
  },
  drawHud: (c, state) => {
    const co = coasterOf(state), r = co.ride;
    if (!r.on) return;
    // (the PA's words, riding: low on the screen, whole)
    if (co.pa) saidOver(c, co.pa.text, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40, '#FDE68A', 560);
    if (r.fade > 0) { c.fillStyle = r.fly ? `rgba(255, 255, 255, ${r.fade})` : `rgba(0, 0, 0, ${r.fade})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    if (r.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  },
  zoom: (state) => { const r = coasterOf(state).ride; return r.on && Math.abs(r.zoom - 1) > 0.005 ? { scale: r.zoom, x: r.fx, y: r.fy } : null; },
  cameraX: (state) => {
    const p = state.player, rx = p.pos.x + p.width / 2 - x0;
    if (coasterOf(state).ride.on) return undefined;
    if (rx < STATION.b + 100) return { min: x0, max: X(STATION.b + 40) - CANVAS_WIDTH };
    for (const s of STOPS) if (rx > s.a - 200 && rx < s.b + 200) return { min: X(s.a) - 44, max: Math.max(X(s.a) - 44, X(s.b) + 44 - CANVAS_WIDTH) };
    return undefined;
  },
  outdoors: () => 1,
  lamps: () => coasterLamps(),
  wires: () => WIRES,
};
