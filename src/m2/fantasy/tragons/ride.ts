// The ride itself (each frame, before he moves): the trains along their tracks, him and the rivals carried on them;
// his hops between cars (next / previous weapon: the mouse wheel, LB / RB; up a car or down one, a leap, a little
// cooldown); the holes in the track (broken ahead with a bang, a warning for every one, the dragon that runs into one
// going over the end with whoever's on it; a spare dragon down onto the track after); each train's own obstacles and
// what's thrown at it; the station (aboard: off it goes), the unload (pulled in: done), the camera (all three always in
// the picture, pulled out as they spread, in as they close).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickFreshLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { mid } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CLEAR_Y } from '../../../m1/constants';
import { hazardHit, hazardKill } from '../../hazardHit';
import { setUi, takeCarHop } from '../../store';
import { speak, meatheadSays, byPants, solid } from '../section';
import { PIPER_PA_VOICE, type ByPants } from '../talk';
import {
  GY, TL, LOCK, RX, S0X, GATE_X, END_S, EXIT_X, AWAY, LANES, LANE_ID, SCRIPT, RIDE_CPS, UNLOAD_CP, DONE_MEMO, TIPS_MEMO,
  DECK_X0, DECK_X1, laneY, trainY, wxOf, rearX, speedAt, evDue, rideCp, V_TEACH, type Lane, type Ev,
} from './layout';
import { tragonsOf, keptDead, type Tragons, type Train, type Obst, type RivalId } from './state';
import { makeTrainBlocks, placeBlocks, trainUnder, standsOn, overTrains, trainBeyond, trainOn } from './cars';
import { putRival, wakeRival, bark, rivalOf, rivalHopping, rivalSat, rivalDucks, rivalLeaves, updateThrown } from './rivals';
import { SPIEL, SPIEL_VOICE, PIPER_T, LOAD, BOARD, NO_GUNS, FIRST_GAP, HOPPED, NEAR, ICE_SLIDE, RIVAL_DOWN, ARRIVE, CLOSED, RIVAL_STATION, RIVAL_FALL, RIVAL_WAKE, RIVAL_BOUNCE } from './lines';

/** His hop: frames in the air, and the cooldown from when he leaves (the user's "a little cooldown"). */
export const HOP_T = 20, HOP_CD = 32;
/** The screen's framing of the ride: the trains' rears this far in from the left; the band under the HUD it fits in. */
export const FRAME_X = 120, FRAME_TOP = HUD_CLEAR_Y + 8, FRAME_BOT = CANVAS_HEIGHT - 16;

// ---------------------------------------------------------------------------------------------------------------
// Saying things

/** The ride's PA (its spiel or Piper), in turn: what's said is up in the top band while it's said. */
export const paSay = (state: GameState, who: 'spiel' | 'piper', line: string | null, onDone?: () => void) => {
  if (!line) { onDone?.(); return; }
  const t = tragonsOf(state);
  speak(who === 'spiel' ? SPIEL_VOICE : PIPER_PA_VOICE, line, s => { t.pa = s; if (s) t.paWho = who; }, true, onDone);
};
/** Him, a pool by the state of him, never a line he's said in the last 45 s. */
const mSay = (state: GameState, pool: ByPants, after = true) => {
  const line = pickFreshLine(byPants(state, pool));
  if (line && state.player.health > 0) meatheadSays(state, line, after);
};
const once = (t: Tragons, k: string) => { if (t.said[k]) return false; t.said[k] = true; return true; };

// ---------------------------------------------------------------------------------------------------------------
// Building

/** The ride's blocks: the three trains (their roofs, heads, tails), the station's gate, the unload's decks. */
export const buildRide = (state: GameState) => {
  const t = tragonsOf(state);
  t.trains = LANES.map(lane => ({ lane, y: trainY(lane, 0), py: trainY(lane, 0), phase: 'ok' as const, t: 0, fx: 0, fy: 0, fvy: 0, rot: 0, ...makeTrainBlocks(state) }));
  gate = solid(state, GATE_X, GY - 320, 20, 320, { hidden: true, tag: 'tragons-gate' });
  decks = LANES.map(lane => solid(state, DECK_X0, AWAY, DECK_X1 - DECK_X0 - (2 - lane) * 80, 16, { type: 'platform', oneWay: true, hidden: true, tag: 'tragons-deck' }));
};
let gate: { y: number } = { y: 0 };
let decks: { y: number }[] = [];
/** The unload's decks (one a lane, at its dragon's roof as it stops): out (or away till then). */
const setDecks = (on: boolean) => decks.forEach((d, lane) => { d.y = on ? trainY(lane as Lane, END_S) : AWAY; });
export const deckY = (lane: Lane) => trainY(lane, END_S);

/** The rivals that start on the dragons (sat on them at the station): Blake on the FIRE dragon, Rafael on the LIGHTNING. */
const HOME: Record<RivalId, Lane> = { blake: 1, rafael: 0, hank: 0 };

/** The first frame: where he really starts is known now (a cheat's pick comes after the build). The ride set up as it
 *  is at that checkpoint: at the station; on a car that far along (what's been and gone, gone); or done. */
const settle = (state: GameState) => {
  const t = tragonsOf(state), p = state.player, dead = keptDead();
  t.settled = true;
  p.carried = false; iceT = 0;
  const rc = rideCp(state.checkpoint);
  if (state.stageMemo[DONE_MEMO] || state.checkpoint >= UNLOAD_CP) {
    t.phase = 'done'; t.dist = END_S; t.v = 0;
    gate.y = AWAY; setDecks(true);
  } else if (rc) {
    t.phase = 'ride'; t.dist = rc.s; t.v = speedAt(rc.s); t.lane = rc.lane;
    SCRIPT.forEach((ev, i) => { if (evDue(ev, t.dist, t.v)) t.fired.add(i); });
    Object.assign(t.said, { load: true, board: true, station: true });
    gate.y = AWAY;
    t.cam.on = 1;
  } else {
    t.phase = 'load'; t.dist = 0; t.v = 0;
  }
  for (const tr of t.trains) { tr.y = tr.py = trainY(tr.lane, t.dist); placeBlocks(t, tr); }
  if (rc) {
    const tr = trainOn(t, rc.lane); p.pos.x = RX + 150 - p.width / 2; p.pos.y = tr.y - p.height; p.vel.x = 0; p.vel.y = 0;
    // (the camera framing the ride from the first frame back)
    const c = camTarget(state); t.cam.fx = c.fx; t.cam.fy = c.fy; t.cam.k = c.k;
  }
  if (t.phase === 'done') return;
  // (the rivals: sat on their dragons at the station; that far along, up (if they're up by then), never on his)
  const taken = new Set<Lane>([t.lane]);
  const laneFor = (want: Lane) => { const l = !taken.has(want) ? want : ([0, 1, 2] as Lane[]).find(x => !taken.has(x))!; taken.add(l); return l; };
  const front = rearX(t.dist) + TL - 70;
  if (!dead.has('blake')) { const e = putRival(state, 'blake', laneFor(HOME.blake), front, !(rc && rc.cp >= 33)); e.facing = -1; }
  if (!dead.has('rafael')) { const e = putRival(state, 'rafael', laneFor(HOME.rafael), front - 40, !(rc && rc.cp >= 35)); e.facing = -1; }
  if (!dead.has('hank') && rc && rc.cp >= 36) putRival(state, 'hank', laneFor(HOME.hank), front - 20, false);
};

// ---------------------------------------------------------------------------------------------------------------
// The holes in the track

/** A train's roof's height on the track at s (the train's own level where it's sat over the track, bent back to the
 *  track either side of it): where the track, and what's on it, is drawn and hits. */
export const yAt = (t: Tragons, lane: Lane, s: number) => {
  const ly = laneY(lane, s), tr = t.trains[lane];
  if (!tr || tr.phase !== 'ok') return ly;
  const d = s < t.dist ? t.dist - s : s > t.dist + TL ? s - (t.dist + TL) : 0;
  const w = Math.max(0, 1 - d / 90);
  return ly + (tr.y - ly) * w;
};

/** The lane he's on (or hopping to). */
const hisLane = (t: Tragons) => (t.hop ? t.hop.to : t.lane);

/** One of the script's holes goes off: the track breaks ahead (a bang, the bits falling), on the lanes it's for. */
const breakTrack = (state: GameState, ev: Extract<Ev, { k: 'gap' | 'safe' }>) => {
  const t = tragonsOf(state), his = hisLane(t);
  const pick = (a: Lane, b: Lane) => (Math.random() < 0.5 ? a : b);
  let lanes: Lane[], safe: Lane | undefined;
  if (ev.k === 'gap') lanes = [ev.lane === 'his' ? his : his === 1 ? pick(0, 2) : 1];
  else {
    safe = ev.safe === 'next' ? (his === 1 ? pick(0, 2) : 1) : his === 0 ? 2 : his === 2 ? 0 : pick(0, 2);
    lanes = LANES.filter(l => l !== safe);
  }
  const a = Math.max(ev.at, t.dist + TL + 160);
  for (const lane of lanes) {
    t.gaps.push({ lane, a, b: a + ev.len, at: state.frame, safe, spare: ev.k === 'gap' ? ev.spare : undefined, w: (a - (t.dist + TL)) / Math.max(1, t.v) });
    // (the bang where it went: the bits off it)
    const x = wxOf(t.dist, a), y = laneY(lane, a) + 48;
    for (let k = 0; k < 16; k++) state.particles.push({ pos: { x: x + Math.random() * 60, y }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 5 }, life: 50, color: k % 3 ? '#52525B' : '#FDE047', size: 3 + Math.random() * 3 });
  }
  playSound('boom', 0.55, -4); shakeScreen(state, 6, 3);
  // (told: the ride's spiel, him the first time it's his, Piper the first time)
  const mine = lanes.includes(his);
  if (safe !== undefined) paSay(state, 'spiel', pickFreshLine(SPIEL.safe[LANE_ID[safe]]));
  else if (mine) paSay(state, 'spiel', pickFreshLine(SPIEL.out[LANE_ID[lanes[0]]]));
  if (mine && once(t, 'firstGap')) mSay(state, FIRST_GAP, false);
  if (once(t, 'piperGap')) paSay(state, 'piper', pickFreshLine(PIPER_T.gap));
};

/** A train runs off a broken end: over it goes, with whoever's on it. */
const derail = (ctx: FrameContext, tr: Train, onIt: boolean) => {
  const { state } = ctx, t = tragonsOf(state), p = state.player;
  const x = rearX(t.dist);
  // (whoever's stood on it goes with it)
  for (const e of state.enemies) {
    const id = rivalOf(e);
    if (!id || e.health <= 0 || e.isBlownAway || !standsOn(e, t, tr, 10)) continue;
    bark(state, e, id, pickFreshLine(RIVAL_FALL[id]) ?? RIVAL_FALL[id][0]);
    hazardKill(ctx, e, x + TL + 60, 'TRACK OUT!', { fling: { x: 3, y: -5 }, sound: 'crash' });
  }
  // (his own, even if he's up off it in a jump: what kills him on the way down is the hole's)
  if (tr.lane === t.lane) t.downAt = state.frame;
  tr.phase = 'fall'; tr.t = 0; tr.fx = x; tr.fy = tr.y; tr.fvy = -1.5; tr.rot = 0;
  placeBlocks(t, tr);
  playSound('crash', 0.8, -6); playSound('screams', 0.5, 2);
  if (onIt && p.health > 0) {
    // (thrown off the front as it goes over, arms and legs going, all the way down: the death screen's)
    p.carried = false; t.hop = null;
    p.invincibilityTimer = 0; p.vel.x = 4; p.vel.y = -8;
    t.downAt = state.frame;
    hurtPlayer(ctx, 9999, 'm2:fa_track_out');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The obstacles: each train its own (fantasy-spec: the duck ones, the jump ones, what throws)

const WAVES: Record<'duck' | 'jump' | 'mover', [Obst['kind'], Obst['kind'], Obst['kind']]> = {
  // (by lane: LIGHTNING, FIRE, ICE)
  duck: ['arc', 'ring', 'icicles'], jump: ['live', 'jet', 'bar'], mover: ['cloud', 'tower', 'cannon'],
};
const spawnWave = (t: Tragons, k: 'duck' | 'jump' | 'mover', at: number) => {
  LANES.forEach(lane => t.obst.push({ kind: WAVES[k][lane], lane, s: at + lane * 40, len: WAVES[k][lane] === 'live' ? 460 : 0, shots: 0, lastShot: -999, hit: new Set() }));
};
/** Each hits what's in its box: how big, how hard, its source, the callout over a rival. */
const BOXES: Partial<Record<Obst['kind'], { x: number; y0: number; y1: number; dmg: number; src: string; call: string; kx: number; ky: number }>> = {
  ring: { x: 12, y0: -84, y1: -44, dmg: 12, src: 'm2:fa_ring', call: 'TORCHED!', kx: -5, ky: -4 },
  icicles: { x: 36, y0: -112, y1: -44, dmg: 11, src: 'm2:fa_icicles', call: 'ICED!', kx: -5, ky: -3 },
  arc: { x: 9, y0: -112, y1: -44, dmg: 12, src: 'm2:fa_arc', call: 'ZAPPED!', kx: -5, ky: -4 },
  jet: { x: 12, y0: -30, y1: 2, dmg: 11, src: 'm2:fa_jet', call: 'HOTFOOT!', kx: -4, ky: -8 },
  bar: { x: 8, y0: -28, y1: -6, dmg: 10, src: 'm2:fa_icebar', call: 'TRIPPED!', kx: -6, ky: -4 },
};
const DUCKS = new Set(['ring', 'icicles', 'arc']);

const hitsBox = (o: { pos: { x: number; y: number }; width: number; height: number }, top: number, x0: number, x1: number, y0: number, y1: number) =>
  o.pos.x < x1 && o.pos.x + o.width > x0 && top < y1 && o.pos.y + o.height > y0;
/** His box's top (lower ducked). */
const pTop = (state: GameState) => { const p = state.player; return p.pos.y + p.height - (p.isDucking ? 36 : p.height); };

const updateObstacles = (ctx: FrameContext) => {
  const { state } = ctx, t = tragonsOf(state), p = state.player, f = state.frame;
  const head = rearX(t.dist) + TL;
  const live = p.health > 0 && !p.inCutscene;
  for (const o of t.obst) {
    const ox = wxOf(t.dist, o.s), yb = yAt(t, o.lane, o.s), tr = trainOn(t, o.lane);
    const b = BOXES[o.kind];
    if (b) {
      const x0 = ox - b.x, x1 = ox + b.x, y0 = yb + b.y0, y1 = yb + b.y1;
      if (live && !o.hit.has(p) && p.invincibilityTimer <= 0 && hitsBox(p, pTop(state), x0, x1, y0, y1)) {
        o.hit.add(p);
        hurtPlayer(ctx, b.dmg, b.src, { x: b.kx, y: b.ky });
        playSound(o.lane === 0 ? 'taser' : o.lane === 1 ? 'flame' : 'glass', 0.8, 0);
      }
      for (const e of state.enemies) {
        if (!rivalOf(e) || e.health <= 0 || e.isBlownAway || o.hit.has(e) || rivalSat(e) || rivalHopping(e)) continue;
        // (coming at him: now and then he ducks it, or jumps it)
        const near = ox - (e.pos.x + e.width);
        if (near > 0 && near < 70 && !o.hit.has(`d${e.id}`)) {
          o.hit.add(`d${e.id}`);
          if (Math.random() < 0.5) { if (DUCKS.has(o.kind)) rivalDucks(e, 34); else if (e.vel.y === 0) e.vel.y = -9; o.hit.add(e); continue; }
        }
        if (hitsBox(e, e.pos.y, x0, x1, y0, y1)) { o.hit.add(e); hazardHit(ctx, e, 30, ox + 60, b.call, { knock: 6 }); }
      }
    }
    // The live rail: the lightning dragon's roof live while it's on it (stood on it: shocked, thrown up off it)
    if (o.kind === 'live' && tr.phase === 'ok' && t.dist + TL > o.s && t.dist < o.s + o.len) {
      if (live && standsOn(p, t, tr, 6) && f - t.shockAt > 22) {
        t.shockAt = f;
        hurtPlayer(ctx, 6, 'm2:fa_live_rail', { x: 0, y: -7 });
        p.vel.y = -7;
        playSound('taser', 0.9, 4);
      }
      for (const e of state.enemies) {
        if (!rivalOf(e) || e.health <= 0 || rivalSat(e) || !standsOn(e, t, tr, 8) || (e.hitFlash ?? 0) > 0 || f % 24) continue;
        hazardHit(ctx, e, 10, mid(e).x + 40, 'SHOCKED!', { knock: 2 });
      }
    }
    // The throwers: the dragon tower's fireballs onto the fire dragon, the snow cannon's snowballs along the ice
    // dragon, the storm cloud's strikes on the lightning dragon (aimed at him if he's on it)
    if ((o.kind === 'tower' || o.kind === 'cannon' || o.kind === 'cloud') && tr.phase === 'ok' && o.shots < 2 && t.phase === 'ride') {
      const lo = o.kind === 'cloud' ? rearX(t.dist) - 40 : head + (o.kind === 'tower' ? 60 : 160);
      const hi = o.kind === 'cloud' ? head + 360 : head + (o.kind === 'tower' ? 820 : 760);
      const gapEvery = o.kind === 'cloud' ? 64 : o.kind === 'tower' ? 52 : 46;
      if (ox > lo && ox < hi && f - o.lastShot > gapEvery) {
        o.shots++; o.lastShot = f;
        const onIt = live && standsOn(p, t, tr, 8);
        const rx = rearX(t.dist), tx = onIt ? p.pos.x + p.width / 2 + p.vel.x * 10 : rx + 40 + Math.random() * (TL - 80);
        const cx = Math.max(rx + 24, Math.min(rx + TL - 30, tx));
        if (o.kind === 'tower') { t.shots.push({ kind: 'fireball', lane: o.lane, tx: cx, t: 0, dur: 50, sx: ox - 30, sy: yb - 168, s: 0, hit: new Set() }); playSound('flame', 0.7, -6); }
        else if (o.kind === 'cannon') { t.shots.push({ kind: 'snowball', lane: o.lane, tx: 0, t: 0, dur: 999, sx: 0, sy: 0, s: o.s - 30, hit: new Set() }); playSound('thud', 0.7, 4); }
        else { t.shots.push({ kind: 'strike', lane: o.lane, tx: cx, t: 0, dur: 56, sx: 0, sy: 0, s: 0, hit: new Set() }); playSound('alert', 0.4, -6); }
      }
    }
  }
  t.obst = t.obst.filter(o => wxOf(t.dist, o.s + o.len) > rearX(t.dist) - 700);
};

/** What's flying at the trains. */
const updateShots = (ctx: FrameContext) => {
  const { state } = ctx, t = tragonsOf(state), p = state.player;
  const live = p.health > 0 && !p.inCutscene;
  const area = (x0: number, x1: number, y0: number, y1: number, set: Set<object>, dmg: number, src: string, call: string, kx: number) => {
    if (live && !set.has(p) && p.invincibilityTimer <= 0 && hitsBox(p, pTop(state), x0, x1, y0, y1)) { set.add(p); hurtPlayer(ctx, dmg, src, { x: kx, y: -5 }); }
    for (const e of state.enemies) if (rivalOf(e) && e.health > 0 && !e.isBlownAway && !set.has(e) && !rivalSat(e) && hitsBox(e, e.pos.y, x0, x1, y0, y1)) { set.add(e); hazardHit(ctx, e, 28, (x0 + x1) / 2 + 20, call, { knock: 6 }); }
  };
  for (const q of t.shots) {
    const tr = trainOn(t, q.lane);
    q.t++;
    if (q.kind === 'fireball') {
      const ty = tr.phase === 'ok' ? tr.y : q.sy + 600, u = q.t / q.dur;
      if (q.t >= q.dur) {
        q.dead = true;
        if (tr.phase === 'ok') {
          area(q.tx - 36, q.tx + 36, ty - 60, ty, q.hit, 13, 'm2:fa_fireball', 'FLAMBEED!', -4);
          playSound('ignite', 0.9, -4);
          for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: q.tx, y: ty - 6 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 5 }, life: 26, color: ['#FDE047', '#F97316', '#DC2626'][k % 3], size: 3 + Math.random() * 3 });
        }
      } else if (u > 0.4 && q.t % 2 === 0) state.particles.push({ pos: { x: q.sx + (q.tx - q.sx) * u, y: q.sy + (ty - q.sy) * u - Math.sin(Math.PI * u) * 110 }, vel: { x: 1.5, y: -0.5 }, life: 14, color: '#F97316', size: 3 });
    } else if (q.kind === 'strike') {
      if (q.t === q.dur - 6 && tr.phase === 'ok') {
        area(q.tx - 22, q.tx + 22, tr.y - 100, tr.y, q.hit, 13, 'm2:fa_strike', 'SMITTEN!', -3);
        playSound('thunder', 0.9, 0); shakeScreen(state, 6, 3);
      }
      if (q.t >= q.dur) q.dead = true;
    } else {
      // (the snowball: along the lane, at his chest, faster than the track comes)
      q.s -= 4.6;
      const x = wxOf(t.dist, q.s), y = yAt(t, q.lane, q.s) - 54;
      q.sx = x; q.sy = y;
      area(x - 9, x + 9, y - 9, y + 9, q.hit, 8, 'm2:fa_snowball', 'SNOWED!', -7);
      if (q.hit.size) { q.dead = true; playSound('splat', 0.7, 6); for (let k = 0; k < 10; k++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 5, y: -Math.random() * 4 }, life: 22, color: '#F8FAFC', size: 3 }); }
      if (x < rearX(t.dist) - 300) q.dead = true;
    }
  }
  t.shots = t.shots.filter(q => !q.dead);
};

// ---------------------------------------------------------------------------------------------------------------
// The camera: all three in the picture (the user's), pulled out as they spread, pushed in as they close

const camTarget = (state: GameState) => {
  const t = tragonsOf(state), p = state.player;
  const ys = t.trains.filter(tr => tr.phase === 'ok' || tr.phase === 'arrive').map(tr => tr.y);
  if (!ys.length) ys.push(trainY(1, t.dist));
  if (overTrains(p, t) && p.health > 0) ys.push(p.pos.y + p.height);
  const top = Math.min(...ys) - 150, bot = Math.max(...ys) + 96;
  const k = Math.max(0.56, Math.min(1, (FRAME_BOT - FRAME_TOP) / (bot - top)));
  return { fx: rearX(t.dist), fy: (top + bot) / 2, k };
};
/** The view the world's drawn with now (the engine's camera blended into the ride's framing): the world point at the
 *  screen's middle and the scale. */
export const viewOf = (state: GameState) => {
  const t = tragonsOf(state), c = t.cam;
  const ex = state.camera.x + CANVAS_WIDTH / 2, ey = state.camera.y + CANVAS_HEIGHT / 2;
  if (c.on <= 0) return { cx: ex, cy: ey, k: 1 };
  const k = 1 + (c.k - 1) * c.on;
  const rx = c.fx + (CANVAS_WIDTH / 2 - FRAME_X) / c.k, ry = c.fy + (CANVAS_HEIGHT / 2 - (FRAME_TOP + FRAME_BOT) / 2) / c.k;
  return { cx: ex + (rx - ex) * c.on, cy: ey + (ry - ey) * c.on, k };
};
/** A world spot on screen. */
export const toScreen = (state: GameState, wx: number, wy: number) => {
  const v = viewOf(state);
  return { x: CANVAS_WIDTH / 2 + (wx - v.cx) * v.k, y: CANVAS_HEIGHT / 2 + (wy - v.cy) * v.k };
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export const updateRide = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, t = tragonsOf(state), p = state.player, f = state.frame;
  if (!t.settled) settle(state);
  if (t.hopCd > 0) t.hopCd--;
  const want = takeCarHop();
  const riding = t.phase === 'dispatch' || t.phase === 'ride';
  setUi({ carHops: t.phase === 'ride', noSwitch: riding, tragonTips: t.phase === 'ride' && !state.stageMemo[TIPS_MEMO] && !p.inCutscene });
  // (who's stood on what, before it moves)
  const pOn = p.health > 0 && !t.hop ? trainUnder(p, t) : null;
  if (pOn) t.lane = pOn.lane;
  const riders: [Enemy, Train][] = [];
  for (const e of state.enemies) { if (!rivalOf(e) || e.health <= 0 || e.isBlownAway || rivalHopping(e)) continue; const tr = trainUnder(e, t, 8); if (tr) riders.push([e, tr]); }

  // ---- the station: on a dragon a moment, and off it goes
  if (t.phase === 'load') {
    const rx = p.pos.x + p.width / 2;
    if (rx > S0X - 700 && once(t, 'load')) mSay(state, LOAD);
    if (rx > S0X - 300 && once(t, 'station')) {
      paSay(state, 'spiel', pickFreshLine(SPIEL.board), () => {
        const b = t.rivals.blake, r = t.rivals.rafael;
        if (b && b.health > 0) bark(state, b, 'blake', pickFreshLine(RIVAL_STATION.blake) ?? RIVAL_STATION.blake[0], true);
        if (r && r.health > 0) bark(state, r, 'rafael', pickFreshLine(RIVAL_STATION.rafael) ?? RIVAL_STATION.rafael[0], true);
      });
    }
    t.boardT = pOn ? t.boardT + 1 : 0;
    if (t.boardT > 24 && p.health > 0) {
      t.phase = 'dispatch'; t.goT = 0; gate.y = AWAY;
      playSound('ding', 0.8, 0);
      if (once(t, 'board')) mSay(state, BOARD);
    }
  }
  // ---- off it goes, and along
  const x0w = rearX(t.dist);
  if (t.phase === 'dispatch') {
    t.goT++;
    if (t.goT > 40) t.v = Math.min(V_TEACH, t.v + 0.06);
    t.dist += t.v;
    if (t.dist >= LOCK) t.phase = 'ride';
    // (off it, back on the platform, while it's still in the station: it stops and comes back for him)
    if (p.isGrounded && !pOn && p.pos.x + p.width / 2 < GATE_X && p.health > 0) {
      const back = -(rearX(t.dist) - S0X);
      for (const [e] of riders) e.pos.x += back;
      t.phase = 'load'; t.dist = 0; t.v = 0; t.boardT = 0; gate.y = GY - 320;
      paSay(state, 'spiel', pickFreshLine(SPIEL.remain));
    }
  } else if (t.phase === 'ride') {
    t.v += (speedAt(t.dist) - t.v) * 0.03;
    t.dist += t.v;
    if (t.dist >= END_S - 2) arrive(state);
  }
  const dxw = rearX(t.dist) - x0w;

  // ---- the trains where they are now; him and the rivals on them carried
  for (const tr of t.trains) {
    tr.py = tr.y;
    if (tr.phase === 'ok' || tr.phase === 'arrive') tr.y = trainY(tr.lane, t.dist);
    if (tr.phase === 'fall') {
      tr.t++; tr.fvy += 0.55; tr.fy += tr.fvy; tr.fx += 0.8; tr.rot = Math.min(1.2, tr.rot + 0.035);
      if (tr.fy > GY - 40) { tr.phase = 'gone'; tr.t = 0; playSound('crash', 1, -10); shakeScreen(state, 10, 4); for (let k = 0; k < 30; k++) state.particles.push({ pos: { x: tr.fx + TL / 2 + (Math.random() - 0.5) * TL, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 8, y: -2 - Math.random() * 7 }, life: 60, color: k % 3 ? '#57534E' : '#F97316', size: 3 + Math.random() * 4 }); }
    } else if (tr.phase === 'gone') tr.t++;
    placeBlocks(t, tr);
  }
  if (pOn && pOn.phase === 'ok') { p.pos.y += pOn.y - pOn.py; p.pos.x += dxw; }
  for (const [e, tr] of riders) if (tr.phase === 'ok') { e.pos.y += tr.y - tr.py; e.pos.x += dxw; }

  if (t.phase === 'ride') {
    // ---- the script
    SCRIPT.forEach((ev, i) => {
      if (t.fired.has(i) || !evDue(ev, t.dist, t.v)) return;
      t.fired.add(i);
      if (ev.k === 'gap' || ev.k === 'safe') breakTrack(state, ev);
      else if (ev.k === 'duck' || ev.k === 'jump' || ev.k === 'mover') spawnWave(t, ev.k, ev.at);
      else if (ev.k === 'wake') wakeRival(state, ev.who);
      else if (ev.k === 'say') {
        if (ev.what === 'piper') paSay(state, 'piper', pickFreshLine(PIPER_T.start));
        else if (ev.what === 'near') { paSay(state, 'spiel', pickFreshLine(SPIEL.near)); mSay(state, NEAR); }
        else paSay(state, 'spiel', pickFreshLine(SPIEL[ev.what]));
      }
    });
    // ---- the checkpoints along it
    for (const c of RIDE_CPS) if (c.cp > state.checkpoint && t.dist >= c.s) state.checkpoint = c.cp;
    // ---- the holes: a dragon that runs onto one goes over the end
    for (const tr of t.trains) {
      if (tr.phase !== 'ok') continue;
      if (t.gaps.some(g => g.lane === tr.lane && g.a <= t.dist + TL && g.b > t.dist)) derail(ctx, tr, !!pOn && pOn === tr);
    }
    t.gaps = t.gaps.filter(g => g.b > t.dist - 400);
    // ---- the alarm: a hole coming on his
    const his = hisLane(t);
    const coming = t.gaps.find(g => g.lane === his && g.a > t.dist + TL);
    if (coming && p.health > 0 && f - t.alarmAt > 34) { t.alarmAt = f; playSound('alarm', 0.35, 4); }
    // ---- spare dragons: down onto the track once it's whole under where they go
    for (const tr of t.trains) {
      if (tr.phase === 'gone' && tr.t > 50 && t.dist < END_S - 2500 && !t.gaps.some(g => g.lane === tr.lane && g.a < t.dist + TL + 500 && g.b > t.dist - 60)) {
        tr.phase = 'arrive'; tr.t = 0; tr.hank = false;
        const hankDue = SCRIPT.some((ev, i) => ev.k === 'gap' && ev.spare === 'hank' && t.fired.has(i)) && !t.rivals.hank && !keptDead().has('hank') && !t.said.hankIn;
        if (hankDue) { tr.hank = true; t.said.hankIn = true; }
        if (once(t, `spare${Math.floor(f / 600)}`)) paSay(state, 'spiel', pickFreshLine(SPIEL.spare));
      }
      if (tr.phase === 'arrive' && ++tr.t >= 80) {
        tr.phase = 'ok'; placeBlocks(t, tr);
        playSound('thud', 1, -8); shakeScreen(state, 5, 3);
        if (tr.hank) {
          tr.hank = false;
          const e = putRival(state, 'hank', tr.lane, rearX(t.dist) + TL - 80, false);
          bark(state, e, 'hank', pickFreshLine(byPants(state, RIVAL_WAKE.hank)) ?? RIVAL_WAKE.hank.clean[0], true);
          paSay(state, 'piper', pickFreshLine(PIPER_T.hank));
        }
      }
    }
    updateObstacles(ctx);
    updateShots(ctx);
    // ---- the frost on the ice dragon's back: stood still on it, he slides back
    if (pOn && pOn.lane === 2 && pOn.phase === 'ok' && !controls.left && !controls.right && p.isGrounded) {
      p.pos.x -= 0.9;
      if (f % 6 === 0) state.particles.push({ pos: { x: p.pos.x + p.width, y: p.pos.y + p.height - 2 }, vel: { x: 0.6, y: -0.4 }, life: 16, color: '#E0F2FE', size: 2 });
      if (!t.said.iceSlide && ++iceT > 90) { t.said.iceSlide = true; mSay(state, ICE_SLIDE); }
    }
  }
  updateThrown(ctx);

  // ---- his hop: up a car or down one (the leap, the cooldown)
  if (want && t.phase === 'ride' && p.health > 0 && !p.inCutscene && !t.hop) {
    const base = pOn ? pOn.y : overTrains(p, t) ? p.pos.y + p.height : null;
    const tgt = t.hopCd <= 0 && base !== null ? trainBeyond(t, base, want === 'up' ? -1 : 1, pOn?.lane) : null;
    if (tgt) {
      t.hop = { fx: p.pos.x + p.width / 2, fy: p.pos.y + p.height, to: tgt.lane, t: 0, dur: HOP_T, up: want === 'up' };
      t.hopCd = HOP_CD;
      p.isDucking = false; p.carried = true; p.vel.x = 0; p.vel.y = 0;
      playSound('jump', 0.9, want === 'up' ? 2 : -2); playSound('whoosh', 0.5, 0);
    } else if (t.hopCd <= 0) { playSound('click', 0.5, -6); t.hopCd = 8; }
  }
  if (t.hop) {
    const h = t.hop, tr = trainOn(t, h.to);
    h.t++;
    if (tr.phase !== 'ok' || p.health <= 0) { t.hop = null; p.carried = false; }
    else {
      const rx = rearX(t.dist), u = Math.min(1, h.t / h.dur), e = u * u * (3 - 2 * u);
      const x = Math.max(rx + 22, Math.min(rx + TL - 40, h.fx));
      p.pos.x = h.fx + (x - h.fx) * e - p.width / 2;
      p.pos.y = h.fy + (tr.y - h.fy) * e - Math.sin(Math.PI * u) * (h.up ? 64 : 34) - p.height;
      p.vel.x = 0; p.vel.y = 0;
      if (h.t >= h.dur) {
        t.hop = null; p.carried = false; t.lane = h.to;
        p.pos.y = tr.y - p.height - 0.5; p.vel.y = 1;
        playSound('land', 0.8, -4);
        if (!state.stageMemo[TIPS_MEMO]) state.stageMemo[TIPS_MEMO] = '1';
        if (once(t, 'hopped') || Math.random() < 0.12) mSay(state, HOPPED);
      }
    }
  }

  // ---- down off the ride: all the way to the ground (him, and the rivals)
  if (riding && p.health > 0 && p.pos.y + p.height >= GY - 6 && p.pos.x + p.width / 2 > GATE_X + 10) {
    for (let n = 0; n < 26; n++) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: GY - 8 }, vel: { x: (Math.random() - 0.5) * 9, y: -Math.random() * 7 }, life: 40, color: n % 2 ? '#B91C1C' : '#7F1D1D', size: 3 + Math.random() * 3 });
    playSound('splat', 1, -6);
    p.invincibilityTimer = 0;
    hurtPlayer(ctx, 9999, f - t.downAt < 240 ? 'm2:fa_track_out' : 'm2:fa_fell_ride');
  }
  for (const e of state.enemies) {
    if (!rivalOf(e) || e.health <= 0 || e.isBlownAway || rivalHopping(e) || !riding) continue;
    if (e.pos.y + e.height >= GY - 6 && mid(e).x > GATE_X + 10) hazardKill(ctx, e, mid(e).x, 'SPLAT!', { fling: { x: 0, y: -3 }, sound: 'splat' });
  }
  // ---- shot at (at the station: no firing on the ride): it bounces off them; hit while sat, they're up
  const rivals = state.enemies.filter(e => rivalOf(e) && e.health > 0 && !e.isBlownAway);
  if (rivals.length) state.projectiles = state.projectiles.filter(q => {
    if (q.owner !== 'player') return true;
    const qx = q.pos.x + (q.width ?? 0) / 2, qy = q.pos.y + (q.height ?? 0) / 2;
    const e = rivals.find(r => qx > r.pos.x - 4 && qx < r.pos.x + r.width + 4 && qy > r.pos.y && qy < r.pos.y + r.height);
    if (!e) return true;
    playSound('clink', 0.7, 6);
    for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: qx, y: qy }, vel: { x: -Math.sign(q.vel.x || 1) * (1 + Math.random() * 3), y: -1 - Math.random() * 3 }, life: 16, color: k % 2 ? '#FEF08A' : '#FFFFFF', size: 2 });
    const id = rivalOf(e)!;
    if ((id === 'blake' || id === 'rafael') && once(t, 'bounce')) bark(state, e, id, RIVAL_BOUNCE[id]);
    return false;
  });
  for (const e of rivals) if (rivalSat(e) && e.health < e.maxHealth && t.phase === 'ride') wakeRival(state, rivalOf(e)!);
  // ---- a rival dead (whatever did it): kept dead this visit; his scream, Piper purring, him
  for (const id of ['blake', 'rafael', 'hank'] as RivalId[]) {
    const e = t.rivals[id];
    if (!e || keptDead().has(id) || (e.health > 0 && !e.isBlownAway)) continue;
    keptDead().add(id);
    state.stageMemo[`fa-rival-dead-${id}`] = '1';
    if (!t.barks.has(e)) bark(state, e, id, pickFreshLine(RIVAL_FALL[id]) ?? RIVAL_FALL[id][1]);
    mSay(state, RIVAL_DOWN);
    paSay(state, 'piper', pickFreshLine(PIPER_T.kill));
  }
  // (the ones that rode it out: off at the unload, out the exit ahead of him (gone on, not dead))
  if (t.phase === 'arrive' || t.phase === 'done') state.enemies = state.enemies.filter(e => !rivalOf(e) || e.health <= 0 || e.pos.x < EXIT_X - 60);

  // ---- the camera
  const target = riding || (t.phase === 'arrive' && t.goT < 90) ? camTarget(state) : null;
  if (t.phase === 'arrive') t.goT++;
  if (target) {
    if (t.cam.on <= 0) { t.cam.fx = target.fx; t.cam.fy = target.fy; t.cam.k = 1; }
    t.cam.fx = target.fx;
    t.cam.fy += (target.fy - t.cam.fy) * 0.08;
    t.cam.k += (target.k - t.cam.k) * 0.04;
    t.cam.on = Math.min(1, t.cam.on + 1 / 60);
  } else t.cam.on = Math.max(0, t.cam.on - 1 / 60);
  state.viewIsScreen = t.cam.on > 0;

  // ---- no firing on the ride (a line if he tries)
  if (riding) {
    if (controls.shoot && !t.said.shotHeld && p.health > 0 && f - t.shotAt > 360) { t.shotAt = f; mSay(state, NO_GUNS, false); }
    t.said.shotHeld = !!controls.shoot;
    return { ...controls, shoot: false, secondary: false };
  }
  if (t.phase === 'done' && p.pos.x + p.width / 2 < GATE_X && p.pos.x + p.width / 2 > S0X - 200 && once(t, 'closed')) mSay(state, CLOSED);
  return controls;
};
let iceT = 0;

/** Pulled in at the unload: stopped, the decks out, the heads off the front (step off), the rivals out ahead of him;
 *  the spiel, Piper, him; done for good. */
const arrive = (state: GameState) => {
  const t = tragonsOf(state);
  t.dist = END_S; t.v = 0; t.phase = 'arrive'; t.goT = 0;
  setDecks(true);
  state.stageMemo[DONE_MEMO] = '1';
  state.checkpoint = Math.max(state.checkpoint, UNLOAD_CP);
  t.gaps = []; t.obst = []; t.shots = [];
  for (const e of state.enemies) if (rivalOf(e) && e.health > 0) rivalLeaves(e);
  playSound('ding', 0.9, -2);
  paSay(state, 'spiel', pickFreshLine(SPIEL.unload), () => mSay(state, ARRIVE));
  paSay(state, 'piper', pickFreshLine(PIPER_T.end));
};

/** Where the heads are (off at the unload: step off the front). */
export const headsOff = (t: Tragons) => t.phase === 'arrive' || t.phase === 'done';
/** The camera's limits: the station, then the whole ride and the unload to the exit. */
export const cameraLimits = (state: GameState) => {
  const t = tragonsOf(state);
  return { min: S0X - 1000, max: t.phase === 'load' ? GATE_X + 200 - CANVAS_WIDTH / 2 : EXIT_X + 220 - CANVAS_WIDTH };
};
/** (index.ts) The gaps coming on each lane, for the warnings. */
export const gapsAhead = (t: Tragons) => t.gaps.filter(g => g.a > t.dist + TL - 2);
export { DECK_X1 };
