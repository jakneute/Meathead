// The ride itself (each frame, before he moves): the trains along their tracks (their cars laid along the loops, at
// their depths about the eye), him carried on his; his hops between cars (next / previous weapon: the mouse wheel, LB /
// RB; up a car or down one, a leap, a little cooldown; never in a loop); the loops (locked in: HOLD down on the
// handlebars, or he's flung off, all the way down); the steep drops (braced: carried); the holes in the track (broken
// ahead with a bang, a warning for every one, the dragon that runs into one going over the end with whoever's on it:
// his own death for each track; a spare dragon down onto the track after); each train's own obstacles and what's thrown
// at it; the breath at the near misses; the splashdown, the mountain, the drops; the station (aboard: off it goes), the
// unload (pulled in: done; the suitors off the train ahead, out the exit), the camera (all three always in the picture,
// pulled out as they spread and loop, in as they close; a kick on the drops). No guns on it (the user's): he holds on.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickFreshLine, pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CLEAR_Y } from '../../../m1/constants';
import { setUi, takeCarHop, tragonMarkAt } from '../../store';
import { speak, meatheadSays, byPants, solid } from '../section';
import { PIPER_PA_VOICE, type ByPants } from '../talk';
import { piperLine, piperMust } from '../piperLines';
import { RIVALS } from '../glen/rivals';
import {
  GY, TL, LOCK, S0X, GATE_X, END_S, EXIT_X, AWAY, LANES, LANE_NAME, LANE_COL, SCRIPT, RIDE_CPS, UNLOAD_CP, DONE_MEMO,
  TIPS_MEMO, LOOP_MEMO, DECK_X0, DECK_X1, TUNNEL, LAGOON, DROPS, laneY, rearX, speedAt, evDue, rideCp, V_TEACH, type Lane, type Ev,
} from './layout';
import { trackPt, proj, spinAt, type Spin } from './track';
import { tragonsOf, type Tragons, type Train, type Obst } from './state';
import { makeTrainBlocks, layCars, roofSpan, roofAt, carUnder, alongTrain, trainSpun, trainUnder, overTrains, hopTarget, trainOn } from './cars';
import { TRACK_SRC, FLUNG_SRC, FELL_SRC, trackDeath } from './deaths';
import { unloadSpots } from './rivals';
import {
  SPIEL, SPIEL_VOICE, PIPER_T, LOAD, BOARD, NO_GUNS, FIRST_GAP, HOPPED, NEAR, DROP, LOOP_SEE, LOOP_IN, CORK_IN, BRAID, LOOP_OUT, SLIP,
  TUNNEL as TUNNEL_L, SPLASH, ARRIVE, CLOSED, RIVAL_UNLOAD, RIVAL_VOICES,
} from './lines';

/** His hop: frames in the air, and the cooldown from when he leaves (the user's "a little cooldown"; halved since, the
 *  user's: was 32), and the least he's held after he lands (no spamming it into glitches). */
export const HOP_T = 20, HOP_CD = 16, HOP_LAND_CD = 6;
/** Not holding down through a loop this long and his hands go (frames): a slip first, then flung. */
export const GRIP_SLIP = 5, GRIP_GONE = 16;
/** The screen's framing of the ride: the trains' rears this far in from the left; the band under the HUD and over the
 *  loop card at the bottom it fits in. */
export const FRAME_X = 120, FRAME_TOP = HUD_CLEAR_Y + 8, FRAME_BOT = CANVAS_HEIGHT - 58;
/** A car this steep under him and he's braced (carried, crouched gripping on) till it levels out. */
const STEEP = 0.42, STEEP_OFF = 0.34;
/** The suitors' places in the unload's yard. */
export const UNLOAD_SPOTS = unloadSpots(DECK_X1);

// ---------------------------------------------------------------------------------------------------------------
// Saying things

/** The ride's PA (its spiel or Piper), in turn: what's said is up in the top band while it's said. */
export const paSay = (state: GameState, who: 'spiel' | 'piper', line: string | null, onDone?: () => void) => {
  if (!line) { onDone?.(); return; }
  const t = tragonsOf(state);
  speak(who === 'spiel' ? SPIEL_VOICE : PIPER_PA_VOICE, line, s => { t.pa = s; if (s) t.paWho = who; }, true, onDone);
};
/** Him, a pool by the state of him, never a line he's said in the last 45 s (queued, or casual: a scream). */
const mSay = (state: GameState, pool: ByPants, after = true) => {
  const line = pickFreshLine(byPants(state, pool));
  if (line && state.player.health > 0) meatheadSays(state, line, after);
};
const once = (t: Tragons, k: string) => { if (t.said[k]) return false; t.said[k] = true; return true; };

// ---------------------------------------------------------------------------------------------------------------
// Building

export const buildRide = (state: GameState) => {
  const t = tragonsOf(state);
  t.trains = LANES.map(lane => ({ lane, cars: [], phase: 'ok' as const, t: 0, fx: 0, fy: 0, fvy: 0, rot: 0, fd: 1, ...makeTrainBlocks(state) }));
  gate = solid(state, GATE_X, GY - 320, 20, 320, { hidden: true, tag: 'tragons-gate' });
  decks = LANES.map(lane => solid(state, DECK_X0, AWAY, DECK_X1 - DECK_X0 - (2 - lane) * 80, 16, { type: 'platform', oneWay: true, hidden: true, tag: 'tragons-deck' }));
};
let gate: { y: number } = { y: 0 };
let decks: { y: number }[] = [];
/** The unload's decks (one a lane, at its dragon's roof as it stops): out (or away till then). */
const setDecks = (on: boolean) => decks.forEach((d, lane) => { d.y = on ? deckY(lane as Lane) : AWAY; });
export const deckY = (lane: Lane) => laneY(lane, END_S + TL / 2);

/** The eye: the trains' middle (all depths are drawn about it), eased to where the three are. */
const eyeTo = (t: Tragons, snap: boolean) => {
  t.eye.x = rearX(t.dist) + TL / 2;
  const s = t.dist + TL / 2, y = (laneY(0, s) + laneY(1, s) + laneY(2, s)) / 3;
  t.eye.y = snap ? y : t.eye.y + (y - t.eye.y) * 0.1;
};

/** The first frame: where he really starts is known now (a cheat's pick comes after the build). The ride set up as it
 *  is at that checkpoint: at the station; on a car that far along (what's been and gone, gone; what's coming, coming:
 *  holes, loops, obstacles still ahead put back); or done. */
const settle = (state: GameState) => {
  const t = tragonsOf(state), p = state.player;
  t.settled = true;
  p.carried = false; p.tragon = undefined; p.noSpecials = false; p.spriteRot = undefined; p.spriteScaleX = undefined; p.spriteScaleY = undefined;
  const rc = rideCp(state.checkpoint);
  if (state.stageMemo[DONE_MEMO] || state.checkpoint >= UNLOAD_CP) {
    t.phase = 'done'; t.dist = END_S; t.v = 0;
    gate.y = AWAY; setDecks(true);
  } else if (rc) {
    t.phase = 'ride'; t.dist = rc.s; t.v = speedAt(rc.s); t.lane = rc.lane;
    Object.assign(t.said, { load: true, board: true, station: true });
    gate.y = AWAY;
    t.cam.on = 1;
    SCRIPT.forEach((ev, i) => {
      if (!evDue(ev, t.dist, t.v)) return;
      t.fired.add(i);
      if (ev.k === 'spin' && ev.at + ev.len + 600 > t.dist) putSpin(state, ev, i, true);
      else if ((ev.k === 'gap' || ev.k === 'safe') && ev.at + ev.len > t.dist) breakTrack(state, ev, true);
      else if ((ev.k === 'duck' || ev.k === 'jump' || ev.k === 'mover') && ev.at > t.dist + TL) spawnWave(t, ev.k, ev.at);
    });
  } else {
    t.phase = 'load'; t.dist = 0; t.v = 0;
  }
  eyeTo(t, true);
  for (const tr of t.trains) { layCars(t, tr); placeBlocks(state, tr); }
  if (rc) {
    const tr = trainOn(t, rc.lane), at = alongTrain(tr, 0.5);
    p.pos.x = at.x - p.width / 2; p.pos.y = roofAt(tr, at.x) - p.height; p.vel.x = 0; p.vel.y = 0;
    const c = camTarget(state); t.cam.fx = c.fx; t.cam.fy = c.fy; t.cam.k = c.k;
  }
};

/** Puts a train's blocks where it is: its roof under his x (so wherever he walks, jumps or lands along it, it's the
 *  roof's height there), the head over its front, the tail at its back; away while it's not there, while he's flung,
 *  while he's locked on it (carried). */
const placeBlocks = (state: GameState, tr: Train) => {
  const t = tragonsOf(state), p = state.player;
  const live = tr.phase === 'ok' && tr.cars.length > 0;
  const { x0, x1 } = live ? roofSpan(tr) : { x0: 0, x1: 0 };
  const px = Math.max(x0 + 2, Math.min(x1 - 2, p.pos.x + p.width / 2));
  const d = live ? tr.cars[1].d : 1;
  // (no roof where the car under him's gone up into a loop: he's hung on to it there, carried)
  const off = !live || t.flung || (!!t.lock && t.lane === tr.lane) || !!spinAt(t.spins, tr.lane, carUnder(tr, px).car.s);
  tr.roof.x = x0 - 4; tr.roof.w = x1 - x0 + 8; tr.roof.y = off ? AWAY : roofAt(tr, px);
  // (pulled in at the unload, the heads are no wall: he steps off the front onto the deck; none while the front's up
  // in a loop)
  const fy = live ? roofAt(tr, x1 - 2) : 0, ry = live ? roofAt(tr, x0 + 2) : 0;
  tr.head.w = 16 * d; tr.head.h = 46 * d; tr.head.x = x1 - 16 * d; tr.head.y = !off && !trainSpun(t, tr) && t.phase !== 'arrive' && t.phase !== 'done' ? fy - 46 * d : AWAY;
  tr.tail.w = 12 * d; tr.tail.h = 24 * d; tr.tail.x = x0; tr.tail.y = !off ? ry - 24 * d : AWAY;
};

// ---------------------------------------------------------------------------------------------------------------
// The holes in the track

/** The lane he's on (or hopping to). */
const hisLane = (t: Tragons) => (t.hop ? t.hop.to : t.lane);
const pick = (a: Lane, b: Lane) => (Math.random() < 0.5 ? a : b);

/** One of the script's holes goes off: the track breaks ahead (a bang, the bits falling), on the lanes it's for:
 *  always told (the spiel names the track; the sign, the countdown and the alarm: art.ts, below). */
const breakTrack = (state: GameState, ev: Extract<Ev, { k: 'gap' | 'safe' }>, silent = false) => {
  const t = tragonsOf(state), his = hisLane(t);
  let lanes: Lane[], safe: Lane | undefined;
  if (ev.k === 'gap') lanes = [his];
  else {
    safe = ev.safe === 'next' ? (his === 1 ? pick(0, 2) : 1) : his === 0 ? 2 : his === 2 ? 0 : pick(0, 2);
    lanes = LANES.filter(l => l !== safe);
    t.lastSafe = safe;
  }
  const a = Math.max(ev.at, t.dist + TL + 160);
  for (const lane of lanes) {
    t.gaps.push({ lane, a, b: a + ev.len, at: state.frame, safe, w: (a - (t.dist + TL)) / Math.max(1, t.v) });
    if (silent) continue;
    const q = trackPt(t.spins, t.dist, lane, a), m = proj(t.eye, q.x, q.y, q.d);
    for (let k = 0; k < 16; k++) state.particles.push({ pos: { x: m.x + Math.random() * 60, y: m.y + 48 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 5 }, life: 50, color: k % 3 ? '#52525B' : '#FDE047', size: 3 + Math.random() * 3 });
  }
  if (silent) return;
  playSound('boom', 0.55, -4); shakeScreen(state, 6, 3);
  // (no spiel naming the track: the warnings on screen tell it (the user's: "remove the announcer on the ride calling
  // out the obstacles"))
  if (once(t, 'firstGap')) mSay(state, FIRST_GAP, false);
  if (once(t, 'piperGap')) paSay(state, 'piper', piperLine(PIPER_T.gap));
};

/** A train runs off a broken end: over it goes. On it (or just up off it), he goes with it: that track's own death. */
const derail = (ctx: FrameContext, tr: Train, onIt: boolean) => {
  const { state } = ctx, t = tragonsOf(state), p = state.player;
  const m = tr.cars[1];
  tr.phase = 'fall'; tr.t = 0; tr.fx = m.x; tr.fy = m.y; tr.fvy = -1.5; tr.rot = m.a; tr.fd = m.d;
  placeBlocks(state, tr);
  playSound('crash', 0.8, -6); playSound('screams', 0.5, 2);
  if (onIt && p.health > 0) {
    Object.assign(trackDeath, { cx: m.x, cy: m.y, a: m.a, d: m.d, lane: tr.lane });
    // (the death draws the dragon going down with him: none of it left here to draw twice)
    tr.phase = 'gone'; tr.t = -200;
    p.carried = true; t.hop = null; t.lock = null; p.tragon = undefined; p.spriteRot = undefined; p.spriteScaleX = undefined; p.spriteScaleY = undefined;
    p.invincibilityTimer = 0; p.vel.x = 0; p.vel.y = 0;
    t.downAt = state.frame;
    hurtPlayer(ctx, 9999, TRACK_SRC[tr.lane]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The loops

/** One of the script's loops comes up: spun onto the lanes it's for (his, two, all, the safe one), told. */
const putSpin = (state: GameState, ev: Extract<Ev, { k: 'spin' }>, i: number, silent = false) => {
  const t = tragonsOf(state), his = hisLane(t);
  const lanes: Lane[] = ev.on === 'his' ? [his] : ev.on === 'two' ? [his, his === 1 ? pick(0, 2) : 1] : ev.on === 'safe' ? [t.lastSafe ?? his] : [0, 1, 2];
  const w = Math.max(1, (ev.at - (t.dist + TL)) / Math.max(1, t.v));
  const base = { len: ev.len, r: ev.r, ev: i, w, turns: ev.turns ?? 1, teach: ev.teach && !state.stageMemo[LOOP_MEMO] };
  lanes.forEach((lane, n) => {
    let q: Spin;
    if (ev.kind === 'cork') q = { ...base, kind: 'cork', lane, s0: ev.at, dz: 0.28, ph: 0 };
    else if (ev.kind === 'braid') q = { ...base, kind: 'braid', lane, s0: ev.at, dz: 0.3, ph: (lane * Math.PI * 2) / 3 };
    // (the chain: his near, the other's far, half a loop on)
    else if (ev.kind === 'chain') q = { ...base, kind: 'chain', lane, s0: ev.at + n * ev.len * 0.5, dz: n ? -0.2 : 0.24, ph: 0 };
    // (the finale: one far, one middling, one near, each a bit after the last)
    else if (ev.kind === 'chain3') q = { ...base, kind: 'chain3', lane, s0: ev.at + lane * 250, dz: [-0.24, 0, 0.24][lane], ph: 0 };
    else q = { ...base, kind: 'loop', lane, s0: ev.at, dz: 0, ph: 0 };
    t.spins.push(q);
  });
  if (silent) return;
  playSound('alert', 0.5, 4);
  // (no spiel naming the track(s): the warnings on screen tell it (the user's); him, if it's his; Piper the first time)
  if (lanes.includes(his)) mSay(state, ev.kind === 'braid' ? BRAID : LOOP_SEE);
  if (once(t, 'piperLoop')) paSay(state, 'piper', piperLine(PIPER_T.loop));
};

/** Thrown off a loop (let go): off the rail the way the car was going, arms and legs going, all the way down. */
const fling = (ctx: FrameContext) => {
  const { state } = ctx, t = tragonsOf(state), p = state.player, tr = trainOn(t, t.lane);
  const c = t.lock ? alongTrain(tr, t.lock.u).car : tr.cars[1];
  const sp = Math.max(6, t.v * 1.3);
  t.lock = null; t.flung = true;
  p.carried = false; p.tragon = undefined; p.spriteRot = undefined; p.spriteScaleX = undefined; p.spriteScaleY = undefined;
  p.freefall = { style: 'flail', t: 0, rot: 0, land: 0 };
  hurtPlayer(ctx, 1, FLUNG_SRC);
  p.vel.x = Math.cos(c.a) * sp * 0.7 + 1.5; p.vel.y = Math.sin(c.a) * sp * 0.7 - 6;
  playSound('screams', 0.8, 4); playSound('whoosh', 0.9, -4);
};

// ---------------------------------------------------------------------------------------------------------------
// The obstacles: each train its own (fantasy-spec: the duck ones, the jump ones, what throws)

const WAVES: Record<'duck' | 'jump' | 'mover', [Obst['kind'], Obst['kind'], Obst['kind']]> = {
  // (by lane: LIGHTNING, FIRE, ICE)
  duck: ['arc', 'ring', 'icicles'], jump: ['live', 'jet', 'bar'], mover: ['cloud', 'tower', 'cannon'],
};
const spawnWave = (t: Tragons, k: 'duck' | 'jump' | 'mover', at: number) => {
  LANES.forEach(lane => t.obst.push({ kind: WAVES[k][lane], lane, s: at + lane * 40, len: WAVES[k][lane] === 'live' ? 460 : 0, shots: 0, lastShot: -999, hit: false }));
};
/** Each hits what's in its box (at its depth): how big, how hard, its source, which way it knocks him. */
const BOXES: Partial<Record<Obst['kind'], { x: number; y0: number; y1: number; dmg: number; src: string; kx: number; ky: number }>> = {
  ring: { x: 12, y0: -84, y1: -44, dmg: 12, src: 'm2:fa_ring', kx: -5, ky: -4 },
  icicles: { x: 36, y0: -112, y1: -44, dmg: 11, src: 'm2:fa_icicles', kx: -5, ky: -3 },
  arc: { x: 9, y0: -112, y1: -44, dmg: 12, src: 'm2:fa_arc', kx: -5, ky: -4 },
  jet: { x: 12, y0: -30, y1: 2, dmg: 11, src: 'm2:fa_jet', kx: -4, ky: -8 },
  bar: { x: 8, y0: -28, y1: -6, dmg: 10, src: 'm2:fa_icebar', kx: -6, ky: -4 },
};

const hitsBox = (o: { pos: { x: number; y: number }; width: number; height: number }, top: number, x0: number, x1: number, y0: number, y1: number) =>
  o.pos.x < x1 && o.pos.x + o.width > x0 && top < y1 && o.pos.y + o.height > y0;
/** His box's top (lower ducked). */
const pTop = (state: GameState) => { const p = state.player; return p.pos.y + p.height - (p.isDucking ? 36 : p.height); };

const updateObstacles = (ctx: FrameContext) => {
  const { state } = ctx, t = tragonsOf(state), p = state.player, f = state.frame;
  const live = p.health > 0 && !p.inCutscene && !t.flung;
  const pOn = live ? trainUnder(p, t, 6) : null;
  for (const o of t.obst) {
    const q = trackPt(t.spins, t.dist, o.lane, o.s), m = proj(t.eye, q.x, q.y, q.d), tr = trainOn(t, o.lane);
    const b = BOXES[o.kind];
    if (b && live && !o.hit && p.invincibilityTimer <= 0 && hisLane(t) === o.lane && !t.lock) {
      const x0 = m.x - b.x * q.d, x1 = m.x + b.x * q.d, y0 = m.y + b.y0 * q.d, y1 = m.y + b.y1 * q.d;
      if (hitsBox(p, pTop(state), x0, x1, y0, y1)) {
        o.hit = true;
        hurtPlayer(ctx, b.dmg, b.src, { x: b.kx, y: b.ky });
        playSound(o.lane === 0 ? 'taser' : o.lane === 1 ? 'flame' : 'glass', 0.8, 0);
      }
    }
    // (the live rail's crackle, building as it comes and loud while the roof's live: louder on his own lane)
    if (o.kind === 'live' && tr.phase === 'ok' && t.phase === 'ride') {
      const ahead = o.s - (t.dist + TL), mine = hisLane(t) === o.lane ? 1 : 0.45;
      if (ahead > 0 && ahead < 1300) { const every = 5 + Math.floor(ahead / 60); if (f % every === 0) playSound('taser', (0.12 + 0.3 * (1 - ahead / 1300)) * mine, 6); }
      else if (ahead <= 0 && t.dist < o.s + o.len && f % 7 === 0) playSound('taser', 0.38 * mine, 2 + (f % 3));
    }
    // The live rail: the lightning dragon's back live while it's on it (stood on it: shocked, thrown up off it)
    if (o.kind === 'live' && tr.phase === 'ok' && t.dist + TL > o.s && t.dist < o.s + o.len && pOn === tr && f - t.shockAt > 22) {
      t.shockAt = f;
      hurtPlayer(ctx, 6, 'm2:fa_live_rail', { x: 0, y: -7 });
      p.vel.y = -7;
      playSound('taser', 0.9, 4);
    }
    // The throwers: the dragon tower's fireballs onto the fire dragon, the snow cannon's snowballs along the ice
    // dragon, the storm cloud's strikes on the lightning dragon (aimed at him if he's on it)
    if ((o.kind === 'tower' || o.kind === 'cannon' || o.kind === 'cloud') && tr.phase === 'ok' && tr.cars.length && o.shots < 2 && t.phase === 'ride') {
      const { x0: rx, x1: hx } = roofSpan(tr);
      const lo = o.kind === 'cloud' ? rx - 40 : hx + (o.kind === 'tower' ? 60 : 160);
      const hi = o.kind === 'cloud' ? hx + 360 : hx + (o.kind === 'tower' ? 820 : 760);
      const gapEvery = o.kind === 'cloud' ? 64 : o.kind === 'tower' ? 52 : 46;
      if (m.x > lo && m.x < hi && f - o.lastShot > gapEvery) {
        o.shots++; o.lastShot = f;
        const onIt = pOn === tr;
        const tx = onIt ? p.pos.x + p.width / 2 + p.vel.x * 10 : rx + 40 + Math.random() * (hx - rx - 80);
        const cx = Math.max(rx + 24, Math.min(hx - 30, tx));
        if (o.kind === 'tower') { t.shots.push({ kind: 'fireball', lane: o.lane, tx: cx, t: 0, dur: 50, sx: m.x - 30 * q.d, sy: m.y - 168 * q.d, s: 0, hit: false }); playSound('flame', 0.7, -6); }
        else if (o.kind === 'cannon') { t.shots.push({ kind: 'snowball', lane: o.lane, tx: 0, t: 0, dur: 999, sx: 0, sy: 0, s: o.s - 30, hit: false }); playSound('thud', 0.7, 4); }
        else { t.shots.push({ kind: 'strike', lane: o.lane, tx: cx, t: 0, dur: 56, sx: 0, sy: 0, s: 0, hit: false }); playSound('alert', 0.4, -6); }
      }
    }
  }
  t.obst = t.obst.filter(o => o.s + o.len > t.dist - 700);
};

/** What's flying at the trains. */
const updateShots = (ctx: FrameContext) => {
  const { state } = ctx, t = tragonsOf(state), p = state.player;
  const live = p.health > 0 && !p.inCutscene && !t.flung && !t.lock;
  const area = (q: { hit: boolean; lane: Lane }, x0: number, x1: number, y0: number, y1: number, dmg: number, src: string, kx: number) => {
    if (live && !q.hit && hisLane(t) === q.lane && p.invincibilityTimer <= 0 && hitsBox(p, pTop(state), x0, x1, y0, y1)) { q.hit = true; hurtPlayer(ctx, dmg, src, { x: kx, y: -5 }); }
  };
  for (const q of t.shots) {
    const tr = trainOn(t, q.lane), ok = tr.phase === 'ok' && tr.cars.length > 0, d = ok ? tr.cars[1].d : 1;
    q.t++;
    if (ok && q.kind !== 'snowball') q.ty = roofAt(tr, q.tx);
    if (q.kind === 'fireball') {
      const ty = q.ty ?? q.sy + 600;
      if (q.t >= q.dur) {
        q.dead = true;
        if (ok) {
          area(q, q.tx - 36 * d, q.tx + 36 * d, ty - 60 * d, ty, 13, 'm2:fa_fireball', -4);
          playSound('ignite', 0.9, -4);
          for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: q.tx, y: ty - 6 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 5 }, life: 26, color: ['#FDE047', '#F97316', '#DC2626'][k % 3], size: 3 + Math.random() * 3 });
        }
      }
    } else if (q.kind === 'strike') {
      if (q.t === q.dur - 6 && ok) {
        area(q, q.tx - 22 * d, q.tx + 22 * d, (q.ty ?? 0) - 100 * d, q.ty ?? 0, 13, 'm2:fa_strike', -3);
        playSound('thunder', 0.9, 0); shakeScreen(state, 6, 3);
      }
      if (q.t >= q.dur) q.dead = true;
    } else {
      // (the snowball: along the lane, at his chest, faster than the track comes)
      q.s -= 4.6;
      const a = trackPt(t.spins, t.dist, q.lane, q.s), m = proj(t.eye, a.x, a.y, a.d);
      q.sx = m.x; q.sy = m.y - 54 * a.d;
      area(q, q.sx - 9, q.sx + 9, q.sy - 9, q.sy + 9, 8, 'm2:fa_snowball', -7);
      if (q.hit) { q.dead = true; playSound('splat', 0.7, 6); for (let k = 0; k < 10; k++) state.particles.push({ pos: { x: q.sx, y: q.sy }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 22, color: '#F8FAFC', size: 3 }); }
      if (q.s < t.dist - 300) q.dead = true;
    }
  }
  t.shots = t.shots.filter(q => !q.dead);
};

/** The breath at a near miss: the other dragons' heads turned on his, mouths glowing (the tell, 50 frames), then a
 *  stream across his dragon's back at head height (duck it, or hop off). */
const updateBreath = (ctx: FrameContext) => {
  const { state } = ctx, t = tragonsOf(state), p = state.player, b = t.breath;
  if (!b) return;
  const k = state.frame - b.at;
  b.to = hisLane(t);
  b.from = LANES.filter(l => l !== b.to && t.trains[l].phase === 'ok');
  if (k === 0 || k === 30) playSound('roar', 0.7, -4);
  if (k === 50) { playSound('flame', 1, -6); playSound('whoosh', 0.8, -4); }
  const tr = trainOn(t, b.to);
  if (k >= 52 && k <= 86 && !b.hit && tr.phase === 'ok' && tr.cars.length && p.health > 0 && !t.flung && p.invincibilityTimer <= 0) {
    const { x0, x1 } = roofSpan(tr), d = tr.cars[1].d, y = roofAt(tr, p.pos.x + p.width / 2);
    if (hitsBox(p, pTop(state), x0, x1, y - 84 * d, y - 40 * d)) { b.hit = true; hurtPlayer(ctx, 12, 'm2:fa_breath', { x: -5, y: -4 }); }
  }
  if (k > 92) t.breath = null;
};

// ---------------------------------------------------------------------------------------------------------------
// The camera: all three in the picture (the user's), pulled out as they spread and loop, pushed in as they close

const camTarget = (state: GameState) => {
  const t = tragonsOf(state), p = state.player;
  const fx = rearX(t.dist);
  if (t.flung) return { fx, fy: p.pos.y + p.height / 2, k: 0.62 };
  const ys: number[] = [], xs: number[] = [];
  for (const tr of t.trains) {
    if ((tr.phase !== 'ok' && tr.phase !== 'arrive') || !tr.cars.length) continue;
    for (const c of tr.cars) { ys.push(c.y - 70 * c.d, c.y + 50 * c.d); xs.push(c.x + 80 * c.d); }
  }
  if (!ys.length) ys.push(laneY(1, t.dist), laneY(1, t.dist) - 80);
  if (overTrains(p, t) && p.health > 0) ys.push(p.pos.y, p.pos.y + p.height);
  const top = Math.min(...ys) - 70, bot = Math.max(...ys) + 50, right = Math.max(fx + TL, ...xs);
  const k = Math.max(0.42, Math.min(1, (FRAME_BOT - FRAME_TOP) / (bot - top), (CANVAS_WIDTH - FRAME_X - 40) / Math.max(1, right - fx)));
  return { fx, fy: (top + bot) / 2, k };
};
/** The view the world's drawn with now (the engine's camera blended into the ride's framing): the world point at the
 *  screen's middle and the scale. */
export const viewOf = (state: GameState) => {
  const t = tragonsOf(state), c = t.cam;
  const ex = state.camera.x + CANVAS_WIDTH / 2, ey = state.camera.y + CANVAS_HEIGHT / 2;
  if (c.on <= 0) return { cx: ex, cy: ey, k: 1 };
  const ck = c.k * (1 + c.kick * 0.08);
  const k = 1 + (ck - 1) * c.on;
  const rx = c.fx + (CANVAS_WIDTH / 2 - FRAME_X) / ck, ry = c.fy + (CANVAS_HEIGHT / 2 - (FRAME_TOP + FRAME_BOT) / 2) / ck;
  return { cx: ex + (rx - ex) * c.on, cy: ey + (ry - ey) * c.on, k };
};
/** A world spot on screen. */
export const toScreen = (state: GameState, wx: number, wy: number) => {
  const v = viewOf(state);
  return { x: CANVAS_WIDTH / 2 + (wx - v.cx) * v.k, y: CANVAS_HEIGHT / 2 + (wy - v.cy) * v.k };
};
/** (art.ts) The depth of the dragon he's on (what's nearer than it goes over him). */
export const hisTrainD = (state: GameState) => {
  const t = tragonsOf(state), p = state.player;
  if (t.phase !== 'dispatch' && t.phase !== 'ride') return 1;
  const tr = trainOn(t, hisLane(t));
  if (!tr || tr.phase !== 'ok' || !tr.cars.length) return 1;
  // (the car he's really on: hung on in a loop, where he's held; else the one under him (on a drop the front and back
  // cars' depths are well apart))
  if (t.lock && !t.hop) return alongTrain(tr, t.lock.u).car.d;
  return carUnder(tr, p.pos.x + p.width / 2).car.d;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export const updateRide = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, t = tragonsOf(state), p = state.player, f = state.frame;
  if (!t.settled) settle(state);
  if (t.hopCd > 0) t.hopCd--;
  const want = takeCarHop();
  const riding = t.phase === 'dispatch' || t.phase === 'ride';
  const alive = p.health > 0;
  eyeTo(t, false);
  // (who's stood on what, before it moves; how far along it he is)
  const pOn = alive && !t.hop && !t.lock && !t.flung ? trainUnder(p, t, 6) : null;
  if (pOn) t.lane = pOn.lane;
  const pu = pOn ? carUnder(pOn, p.pos.x + p.width / 2).u : 0;

  // ---- the station: on a dragon a moment, and off it goes
  if (t.phase === 'load') {
    const rx = p.pos.x + p.width / 2;
    if (rx > S0X - 700 && once(t, 'load')) mSay(state, LOAD);
    if (rx > S0X - 300 && once(t, 'station')) paSay(state, 'spiel', pickFreshLine(SPIEL.board));
    t.boardT = pOn ? t.boardT + 1 : 0;
    if (t.boardT > 24 && alive) {
      t.phase = 'dispatch'; t.goT = 0; gate.y = AWAY;
      playSound('ding', 0.8, 0);
      if (once(t, 'board')) mSay(state, BOARD);
    }
  }
  // ---- off it goes, and along
  if (t.phase === 'dispatch') {
    t.goT++;
    if (t.goT > 40) t.v = Math.min(V_TEACH, t.v + 0.06);
    t.dist += t.v;
    if (t.dist >= LOCK) t.phase = 'ride';
    // (off it, back on the platform, while it's still in the station: it stops and comes back for him)
    if (p.isGrounded && !pOn && p.pos.x + p.width / 2 < GATE_X && alive) {
      t.phase = 'load'; t.dist = 0; t.v = 0; t.boardT = 0; gate.y = GY - 320;
      paSay(state, 'spiel', pickFreshLine(SPIEL.remain));
    }
  } else if (t.phase === 'ride') {
    t.v += (speedAt(t.dist) - t.v) * 0.03;
    t.dist += t.v;
    if (t.dist >= END_S - 2) arrive(state);
  }

  // (up in the air off his dragon (a jump, not a hop): it goes on carrying him, so he comes down on the spot along it he
  // went up from, not further back down it)
  const air = riding && alive && !pOn && !t.hop && !t.lock && !t.flung && !p.isGrounded ? trainOn(t, t.lane) : null;
  const airLive = !!air && air.phase === 'ok' && air.cars.length > 0;
  let airU = 0, airX = 0;
  if (air && airLive) { const { x0, x1 } = roofSpan(air); airU = carUnder(air, Math.max(x0 + 2, Math.min(x1 - 2, p.pos.x + p.width / 2))).u; airX = alongTrain(air, airU).x; }
  // ---- the trains where they are now (their cars along the track); him carried on his
  for (const tr of t.trains) {
    if (tr.phase === 'ok' || tr.phase === 'arrive') layCars(t, tr);
    if (tr.phase === 'fall') {
      tr.t++; tr.fvy += 0.55; tr.fy += tr.fvy; tr.fx += 0.8; tr.rot = Math.min(1.25, tr.rot + 0.035);
      if (tr.fy > GY - 40) { tr.phase = 'gone'; tr.t = 0; playSound('crash', 1, -10); shakeScreen(state, 10, 4); for (let k = 0; k < 30; k++) state.particles.push({ pos: { x: tr.fx + (Math.random() - 0.5) * TL, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 7 }, life: 60, color: k % 3 ? '#57534E' : '#F97316', size: 3 + Math.random() * 4 }); }
    } else if (tr.phase === 'gone') tr.t++;
  }
  if (air && airLive && air.phase === 'ok' && air.cars.length) p.pos.x += alongTrain(air, airU).x - airX;
  if (pOn && pOn.phase === 'ok') {
    const at = alongTrain(pOn, pu);
    p.pos.x = at.x - p.width / 2; p.pos.y = roofAt(pOn, at.x) - p.height;
  }

  if (t.phase === 'ride') {
    // ---- the script
    SCRIPT.forEach((ev, i) => {
      if (t.fired.has(i) || !evDue(ev, t.dist, t.v)) return;
      t.fired.add(i);
      if (ev.k === 'gap' || ev.k === 'safe') breakTrack(state, ev);
      else if (ev.k === 'spin') putSpin(state, ev, i);
      else if (ev.k === 'duck' || ev.k === 'jump' || ev.k === 'mover') spawnWave(t, ev.k, ev.at);
      else if (ev.k === 'breath') { t.breath = { from: [], at: f, to: hisLane(t), hit: false }; }
      else if (ev.k === 'say') {
        if (ev.what === 'piper') paSay(state, 'piper', piperLine(PIPER_T.start));
        else if (ev.what === 'piperMid') paSay(state, 'piper', piperLine(PIPER_T.mid));
        else if (ev.what === 'piperLate') paSay(state, 'piper', piperLine(PIPER_T.late));
        // (the near miss: the dragons' mouths glowing tell it; no spiel calling it out (the user's), just him)
        else if (ev.what === 'near') mSay(state, NEAR);
        else paSay(state, 'spiel', pickFreshLine(SPIEL[ev.what]));
      }
    });
    // ---- the checkpoints along it
    for (const c of RIDE_CPS) if (c.cp > state.checkpoint && t.dist >= c.s) state.checkpoint = c.cp;
    // ---- the holes: a dragon that runs onto one goes over the end (him on it: or just up off it, over it)
    for (const tr of t.trains) {
      if (tr.phase !== 'ok') continue;
      if (t.gaps.some(g => g.lane === tr.lane && g.a <= t.dist + TL && g.b > t.dist)) {
        const { x0, x1 } = roofSpan(tr), cx = p.pos.x + p.width / 2;
        const onIt = alive && !t.flung && ((pOn === tr) || (t.lock !== null && t.lane === tr.lane) || (!t.hop && t.lane === tr.lane && cx > x0 - 10 && cx < x1 + 10 && roofAt(tr, cx) - (p.pos.y + p.height) < 120 && roofAt(tr, cx) >= p.pos.y + p.height - 4));
        derail(ctx, tr, onIt);
      }
    }
    t.gaps = t.gaps.filter(g => g.b > t.dist - 400);
    t.spins = t.spins.filter(q => q.s0 + q.len > t.dist - 300);
    // ---- the alarm: a hole coming on his
    const coming = t.gaps.find(g => g.lane === hisLane(t) && g.a > t.dist + TL);
    if (coming && alive && f - t.alarmAt > 34) { t.alarmAt = f; playSound('alarm', 0.35, 4); }
    // ---- spare dragons: down onto the track once it's whole under where they go
    for (const tr of t.trains) {
      if (tr.phase === 'gone' && tr.t > 50 && t.dist < END_S - 2500 && !t.gaps.some(g => g.lane === tr.lane && g.a < t.dist + TL + 500 && g.b > t.dist - 60) && !spinAt(t.spins, tr.lane, t.dist + TL / 2)) {
        tr.phase = 'arrive'; tr.t = 0;
        layCars(t, tr);
        if (once(t, `spare${Math.floor(f / 600)}`)) paSay(state, 'spiel', pickFreshLine(SPIEL.spare));
      }
      if (tr.phase === 'arrive' && t.phase === 'ride' && ++tr.t >= 80) { tr.phase = 'ok'; playSound('thud', 1, -8); shakeScreen(state, 5, 3); }
    }
    updateObstacles(ctx);
    updateShots(ctx);
    updateBreath(ctx);
    // ---- the set pieces: over the top of the drops, into the mountain, the splashdown
    const front = t.dist + TL;
    DROPS.forEach((s, i) => {
      if (front > s && once(t, `drop${i}`)) { mSay(state, DROP, false); t.cam.kick = 1; playSound('whoosh', 0.8, -8); }
    });
    if (front > TUNNEL.a && once(t, 'tunnel')) mSay(state, TUNNEL_L, false);
    if (t.dist + TL / 2 > LAGOON.splash && once(t, 'splash')) {
      t.splashAt = f; t.cam.kick = 1.4; shakeScreen(state, 10, 5); playSound('splash', 1, -6); playSound('splash', 0.8, 2);
      for (const tr of t.trains) for (const c of tr.cars) for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: c.x + (Math.random() - 0.5) * 100 * c.d, y: GY - 4 }, vel: { x: (Math.random() - 0.3) * 8, y: -6 - Math.random() * 10 }, life: 50, color: k % 3 ? '#BAE6FD' : '#FFFFFF', size: 3 + Math.random() * 4, grav: 0.4 });
      mSay(state, SPLASH, false);
    }
  }
  if (t.cam.kick > 0) t.cam.kick = Math.max(0, t.cam.kick - 0.025);

  // ---- locked on: through a loop (HOLD down or he's flung) or a steep drop (braced), carried on his car
  if (riding && alive && !t.hop && !t.flung) {
    const tr = trainOn(t, t.lane);
    if (!t.lock && tr.phase === 'ok' && tr.cars.length) {
      const cx = p.pos.x + p.width / 2, { x0, x1 } = roofSpan(tr);
      const near = pOn === tr || (cx > x0 - 6 && cx < x1 + 6 && Math.abs(roofAt(tr, cx) - (p.pos.y + p.height)) < 70);
      const u = carUnder(tr, cx).u, c = alongTrain(tr, u).car;
      const spun = !!spinAt(t.spins, tr.lane, c.s);
      if (near && (spun || Math.abs(c.a) > STEEP)) {
        t.lock = { u, loop: spun, t: 0, off: 0, hang: -Math.PI / 2 - 0.4, hv: 0 };
        p.isDucking = false;
        if (spun) {
          const q = spinAt(t.spins, tr.lane, c.s)!;
          mSay(state, q.kind === 'cork' ? CORK_IN : LOOP_IN, false);
          playSound('whoosh', 0.8, -2);
          t.cam.kick = Math.max(t.cam.kick, 0.8);
        }
      }
    }
    if (t.lock && tr.phase === 'ok' && tr.cars.length) {
      const L = t.lock, at = alongTrain(tr, L.u), c = at.car;
      const spun = !!spinAt(t.spins, tr.lane, c.s);
      L.t++;
      if (spun) L.loop = true;
      if (!spun && Math.abs(c.a) < STEEP_OFF && Math.cos(c.roll) > 0.9) {
        // (out the other end: stood back up on the roof where he is)
        p.carried = false; p.spriteRot = undefined; p.spriteScaleY = undefined;
        p.pos.x = at.x - p.width / 2; p.pos.y = roofAt(tr, at.x) - p.height - 0.5; p.vel.x = 0; p.vel.y = 1;
        if (L.loop) {
          if (!state.stageMemo[LOOP_MEMO]) state.stageMemo[LOOP_MEMO] = '1';
          if (once(t, 'loopOut') || Math.random() < 0.3) mSay(state, LOOP_OUT, false);
        }
        t.lock = null;
      } else {
        // (hung on where he is along it, turned and rolled with the car, at its depth)
        p.carried = true; p.facing = 1; p.vel.x = 0; p.vel.y = 0;
        p.pos.x = at.x - p.width / 2; p.pos.y = at.y - p.height;
        const r = Math.cos(c.roll);
        p.spriteRot = c.a; p.spriteScaleX = c.d; p.spriteScaleY = c.d * (Math.abs(r) < 0.15 ? Math.sign(r || 1) * 0.15 : r);
        // (the grip: HOLD down; let go a moment and his hands slip; any longer and he's gone)
        if (L.loop) {
          if (controls.down) L.off = 0;
          else {
            L.off++;
            if (L.off === GRIP_SLIP) { mSay(state, SLIP, false); playSound('whoosh', 0.6, 8); }
            if (L.off > GRIP_GONE) { fling(ctx); }
          }
        }
        // (his body swung round the rail the way gravity has him: in his own frame, the world's down turned back by the
        // car's heading, flipped by its roll; laid out back along the back when it's pressing him into it)
        if (t.lock) {
          const gx = Math.sin(c.a), gy = Math.cos(c.a) * Math.sign(r || 1);
          const target = gy > 0.2 ? -Math.PI + 0.25 + gx * 0.3 : Math.atan2(gy, gx);
          let dA = target - L.hang; while (dA > Math.PI) dA -= Math.PI * 2; while (dA < -Math.PI) dA += Math.PI * 2;
          L.hv = (L.hv + dA * 0.09 + Math.sin(f * 0.37) * 0.025) * 0.9;
          L.hang += L.hv;
          p.tragon = { mode: L.loop ? (L.off >= GRIP_SLIP ? 'slip' : 'loop') : 'brace', move: false, hang: L.hang, hurt: false };
        }
      }
    }
  }

  // ---- his hop: up a car or down one (the leap, the cooldown; never while he's locked in a loop)
  if (want && t.phase === 'ride' && alive && !p.inCutscene && !t.hop && !t.lock && !t.flung) {
    const cx = p.pos.x + p.width / 2;
    const base = pOn ? roofAt(pOn, cx) : overTrains(p, t) ? p.pos.y + p.height : null;
    // (the next car that way; off the top or the bottom, round to the far one (the user's): a longer leap over the
    // middle one)
    const hit = t.hopCd <= 0 && base !== null ? hopTarget(t, base, cx, want === 'up' ? -1 : 1, pOn?.lane) : null;
    if (hit) {
      const tgt = hit.tr;
      t.hop = { fx: cx, fy: p.pos.y + p.height, to: tgt.lane, t: 0, dur: hit.wrap ? HOP_T + 12 : HOP_T, up: want === 'up', wrap: hit.wrap };
      t.hopCd = HOP_CD;
      p.isDucking = false; p.carried = true; p.vel.x = 0; p.vel.y = 0;
      playSound('jump', 0.9, want === 'up' ? 2 : -2); playSound('whoosh', 0.5, 0);
    } else if (t.hopCd <= 0) { playSound('click', 0.5, -6); t.hopCd = 8; }
  }
  if (t.hop) {
    const h = t.hop, tr = trainOn(t, h.to);
    h.t++;
    if (tr.phase !== 'ok' || !alive) { t.hop = null; p.carried = false; }
    else {
      const { x0, x1 } = roofSpan(tr), u = Math.min(1, h.t / h.dur), e = u * u * (3 - 2 * u);
      const x = Math.max(x0 + 22, Math.min(x1 - 40, h.fx)), ty = roofAt(tr, x);
      p.pos.x = h.fx + (x - h.fx) * e - p.width / 2;
      // (a wrap: up off the top, a big arc up and over, down past the middle one onto the bottom; or off the bottom, a
      // spring up past the middle one and over onto the top)
      p.pos.y = h.fy + (ty - h.fy) * e - Math.sin(Math.PI * u) * (h.wrap ? (h.up ? 110 : 80) : h.up ? 64 : 34) - p.height;
      p.vel.x = 0; p.vel.y = 0;
      p.tragon = { mode: 'hop', move: false, hang: 0, hurt: false };
      if (h.t >= h.dur) {
        t.hop = null; p.carried = false; t.lane = h.to; t.hopCd = Math.max(t.hopCd, HOP_LAND_CD);
        p.pos.y = ty - p.height - 0.5; p.vel.y = 1;
        playSound('land', 0.8, -4);
        if (!state.stageMemo[TIPS_MEMO]) state.stageMemo[TIPS_MEMO] = '1';
        if (once(t, 'hopped') || Math.random() < 0.12) mSay(state, HOPPED);
      }
    }
  }

  // ---- flung: down he goes, arms and legs going (the camera with him)
  if (t.flung && p.freefall) { p.freefall.t++; p.freefall.rot += 0.16; }

  // ---- the ride's poses (no gun: render/player/tragonPose.ts), scaled with the dragon's depth under him
  if (riding && alive && !t.flung && !t.lock && !t.hop) {
    const tr = trainOn(t, t.lane);
    const over = tr.phase === 'ok' && tr.cars.length ? carUnder(tr, p.pos.x + p.width / 2).car.d : 1;
    if (Math.abs(p.vel.x) > 2.2) p.vel.x = Math.sign(p.vel.x) * 2.2;
    p.tragon = { mode: p.isDucking ? 'duck' : !p.isGrounded && !pOn ? 'jump' : 'ride', move: Math.abs(p.vel.x) > 0.4, hang: 0, hurt: false };
    p.spriteRot = undefined; p.spriteScaleX = over; p.spriteScaleY = over;
    t.said.posed = true;
  } else if (t.hop) {
    const tr = trainOn(t, t.hop.to), d = tr.cars.length ? tr.cars[1].d : 1;
    p.spriteScaleX = d; p.spriteScaleY = d; p.spriteRot = undefined;
  } else if (!t.lock && t.said.posed && (!riding || t.flung || !alive)) {
    if (!t.flung) p.tragon = undefined;
    p.spriteRot = undefined; p.spriteScaleX = undefined; p.spriteScaleY = undefined;
    if (!riding) { t.said.posed = false; p.tragon = undefined; }
  }
  // (no charge, slide, uppercut or dive kick on a dragon's back: survival, not a fight)
  if (riding) { p.noSpecials = true; t.said.nospec = true; setUi({ pauseControls: 'tragons' }); } else if (t.said.nospec) { p.noSpecials = false; t.said.nospec = false; setUi({ pauseControls: null }); }

  for (const tr of t.trains) placeBlocks(state, tr);

  // ---- down off the ride: all the way to the ground
  if (riding && alive && p.pos.y + p.height >= GY - 6 && p.pos.x + p.width / 2 > GATE_X + 10) {
    p.invincibilityTimer = 0; p.freefall = undefined;
    hurtPlayer(ctx, 9999, t.flung ? FLUNG_SRC : FELL_SRC);
  }
  // ---- the music's, the card's: what's coming on the loops
  setUi({
    carHops: t.phase === 'ride' && !t.lock, noSwitch: riding,
    tragonTips: t.phase === 'ride' && !state.stageMemo[TIPS_MEMO] && !p.inCutscene && !t.lock && !t.spins.some(q => q.teach),
    tragonHold: riding && alive && !t.flung ? holdCard(state) : null,
  });

  // ---- the unload's suitors: their say in turn, then out the exit
  if (t.phase === 'arrive') {
    t.unload.t++;
    if (t.unload.said >= RIVALS.length + 1) t.unload.walk += 1.6;
  }

  // ---- the camera
  const target = riding || t.flung || (t.phase === 'arrive' && t.goT < 90) ? camTarget(state) : null;
  if (t.phase === 'arrive') t.goT++;
  if (target) {
    if (t.cam.on <= 0) { t.cam.fx = target.fx; t.cam.fy = target.fy; t.cam.k = 1; }
    t.cam.fx = target.fx;
    t.cam.fy += (target.fy - t.cam.fy) * (t.flung ? 0.18 : 0.08);
    t.cam.k += (target.k - t.cam.k) * 0.05;
    t.cam.on = Math.min(1, t.cam.on + 1 / 60);
  } else t.cam.on = Math.max(0, t.cam.on - 1 / 60);
  state.viewIsScreen = t.cam.on > 0;
  setUi({ tragonMarks: hopMarks(state) });

  // ---- no guns on the ride (a line if he tries); locked, hopping or flung, nothing of his own at all
  if (riding) {
    if (controls.shoot && !t.said.shotHeld && alive && f - t.shotAt > 360) { t.shotAt = f; mSay(state, NO_GUNS, false); }
    t.said.shotHeld = !!controls.shoot;
    // (the gun reads the button itself too: held off for good while he rides, as the dirt bike does)
    p.shootCooldown = Math.max(p.shootCooldown, 3);
    if (t.lock || t.hop || t.flung) return { left: false, right: false, up: false, down: false, jump: false, special: false, shoot: false, secondary: false, charge: false };
    return { ...controls, shoot: false, secondary: false, special: false, charge: false };
  }
  if (t.phase === 'done' && p.pos.x + p.width / 2 < GATE_X && p.pos.x + p.width / 2 > S0X - 200 && once(t, 'closed')) mSay(state, CLOSED);
  return controls;
};

/** Over each dragon he's not on, the button that hops him there (the user's: "show button icons on the dragon rides
 *  you're not currently on"): worked out the hop's own way (hopTarget: the next that way, or round), so it's always
 *  where that button really goes. Where each sits (screen, over the dragon's rear car, under the HUD band, over the
 *  loop card) into tragonMarkAt; which button each, as a string for the React side (null: no hopping now). */
const hopMarks = (state: GameState): string | null => {
  const t = tragonsOf(state), p = state.player;
  if (t.phase !== 'ride' || p.health <= 0 || p.inCutscene || t.hop || t.lock || t.flung) return null;
  const pOn = trainUnder(p, t, 6);
  const cx = p.pos.x + p.width / 2;
  const base = pOn ? roofAt(pOn, cx) : overTrains(p, t) ? p.pos.y + p.height : null;
  if (base === null) return null;
  const up = hopTarget(t, base, cx, -1, pOn?.lane)?.tr ?? null, down = hopTarget(t, base, cx, 1, pOn?.lane)?.tr ?? null;
  if (!up && !down) return null;
  const out = LANES.map(l => {
    const u = up?.lane === l, d = down?.lane === l;
    if (!u && !d) return '';
    const tr = t.trains[l], rear = tr.cars[0];
    const top = Math.min(...tr.cars.map(k => k.y - 70 * k.d));
    const s = toScreen(state, rear.x - 30 * rear.d, top);
    tragonMarkAt[l].x = Math.max(40, Math.min(CANVAS_WIDTH - 40, s.x));
    tragonMarkAt[l].y = Math.max(HUD_CLEAR_Y + 20, Math.min(FRAME_BOT - 24, s.y));
    return u && d ? 'both' : u ? 'up' : 'down';
  });
  return out.join('|');
};

/** The loop card (App.tsx: HOLD and the real down button): locked in a loop now (HOLD!), or the next one coming,
 *  which track(s) and what it is; the first one's the teaching card. */
const holdCard = (state: GameState) => {
  const t = tragonsOf(state);
  const his = hisLane(t);
  if (t.lock?.loop) {
    const q = spinAt(t.spins, t.lane, alongTrain(trainOn(t, t.lane), t.lock.u).car.s);
    return sameCard({ kind: KIND_CARD[q?.kind ?? 'loop'], lanes: [LANE_NAME[t.lane]], cols: [LANE_COL[t.lane][0]], mine: true, now: true, teach: false, slip: t.lock.off >= GRIP_SLIP });
  }
  const next = t.spins.filter(q => q.s0 > t.dist + TL - 2).sort((a, b) => a.s0 - b.s0)[0];
  if (!next) return null;
  const group = t.spins.filter(q => q.ev === next.ev);
  const lanes = [...new Set(group.map(q => q.lane))].sort();
  return sameCard({ kind: KIND_CARD[next.kind], lanes: lanes.map(l => LANE_NAME[l]), cols: lanes.map(l => LANE_COL[l][0]), mine: lanes.includes(his), now: false, teach: !!next.teach, slip: false });
};
type HoldCard = { kind: string; lanes: string[]; cols: string[]; mine: boolean; now: boolean; teach: boolean; slip: boolean };
let lastCard: HoldCard | null = null;
const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);
/** The card as it was last frame if nothing on it's changed (the same object: the UI's left alone, no re-render). */
const sameCard = (c: HoldCard) => {
  const l = lastCard;
  if (l && l.kind === c.kind && l.mine === c.mine && l.now === c.now && l.teach === c.teach && l.slip === c.slip && sameList(l.lanes, c.lanes) && sameList(l.cols, c.cols)) return l;
  return (lastCard = c);
};
const KIND_CARD: Record<string, string> = { loop: 'LOOP', cork: 'CORKSCREW', chain: 'INTERLOCKING LOOPS', braid: 'TRIPLE HELIX', chain3: 'TRIPLE LOOP' };

/** Pulled in at the unload: stopped, the decks out, the heads off the front (step off); the spiel, Piper, him; the
 *  suitors (off the train ahead) have their say in turn and go; done for good. */
const arrive = (state: GameState) => {
  const t = tragonsOf(state);
  t.dist = END_S; t.v = 0; t.phase = 'arrive'; t.goT = 0;
  setDecks(true);
  state.stageMemo[DONE_MEMO] = '1';
  state.checkpoint = Math.max(state.checkpoint, UNLOAD_CP);
  t.gaps = []; t.obst = []; t.shots = []; t.spins = []; t.breath = null;
  playSound('ding', 0.9, -2);
  const next = (i: number) => {
    t.unload.said = i;
    if (i >= RIVALS.length) { t.unload.said = RIVALS.length + 1; return; }
    const r = RIVALS[i];
    speak(RIVAL_VOICES[r.id], pickLine(byPants(state, RIVAL_UNLOAD[r.id])), s => { t.unload.talk[r.id] = s; }, true, () => next(i + 1));
  };
  paSay(state, 'spiel', pickFreshLine(SPIEL.unload), () => paSay(state, 'piper', piperMust(PIPER_T.end), () => {
    const line = pickFreshLine(byPants(state, ARRIVE));
    if (line && state.player.health > 0) meatheadSays(state, line, true, () => next(0)); else next(0);
  }));
};

/** The camera's limits: the station, then the whole ride and the unload to the exit. */
/** Off the ride this visit (the unload, or back here after it): no going back left (the user's: the view's locked at
 *  the unload deck, and so is he). */
export const offRideNow = (state: GameState) => offRide(state);
const offRide = (state: GameState) => {
  const t = tragonsOf(state);
  return t.phase === 'arrive' || (t.phase === 'done' && (!!state.stageMemo[DONE_MEMO] || state.checkpoint >= UNLOAD_CP));
};
const BACK_WALL = DECK_X0 - 30;
/** (index.ts, each frame) Held to the unload's side once he's off the ride. */
export const holdOffRide = (state: GameState) => {
  if (!offRide(state)) return;
  const p = state.player;
  if (p.pos.x < BACK_WALL) { p.pos.x = BACK_WALL; if (p.vel.x < 0) p.vel.x = 0; }
};
export const cameraLimits = (state: GameState) => {
  const t = tragonsOf(state);
  if (offRide(state)) return { min: BACK_WALL - 40, max: EXIT_X + 220 - CANVAS_WIDTH };
  return { min: S0X - 1000, max: t.phase === 'load' ? GATE_X + 200 - CANVAS_WIDTH / 2 : EXIT_X + 220 - CANVAS_WIDTH };
};
/** (index.ts) The holes coming on each lane, for the warnings. */
export const gapsAhead = (t: Tragons) => t.gaps.filter(g => g.a > t.dist + TL - 2);
/** (the music) Locked in a loop, or his dragon in one. */
export const inLoop = (t: Tragons) => !!t.lock?.loop || (!!t.trains[t.lane]?.cars.length && trainSpun(t, t.trains[t.lane]));
export { DECK_X1 };
