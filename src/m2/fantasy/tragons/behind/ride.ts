// The ride from behind, each frame (ride.ts hands over to this from the dispatch's cut to the arrival's): the trains
// along their tracks, the script (geom.ts), his controls (no forward or back: LB / RB hop a track left / right, JUMP,
// DOWN ducks gripping the handrails, DOWN held through a roll hangs on and LEFT / RIGHT lean into it), each track's
// own (FIRE's rings: jump; ICE's icicles: duck, its bars: jump; the LIGHTNING dragon going live: hop off), the holes
// (a dragon runs off a broken end: on it, his death for that track: deaths.ts), the rolls (hang on, lean, or flung),
// the camera, and where he is in the world for the engine (his words over his head, his death's spot).
//
// THE GRIP through a roll (the owner's): hold DOWN the whole way; as the car rolls over, gravity pulls him to one side,
// and he leans the other way (LEFT / RIGHT: the high side's handrail) to keep both hands on. Not leaning, or leaning
// the wrong way, and the high hand tears off: one hand left, dangling (the warning: he's almost off). Lean back and he
// grabs on again. Both hands off, or DOWN let go: flung off, all the way down.
//
// His death on the ride's drawn from a side shot (the classic ride's deaths, deaths.ts: the camera cuts to it): the
// engine's death plays where he's put for it (the shot's own spots: on a dragon's back, on the lawn).

import type { FrameContext } from '../../../../m1/game/core/context';
import type { GameState } from '../../../../m1/game/core/state';
import type { Controls } from '../../../../m1/game/platform/input';
import type { Block } from '../../../../m1/types';
import { NO_CONTROLS } from '../../../../m1/game/platform/input';
import { hurtPlayer } from '../../../../m1/game/bosses/shared';
import { playSound } from '../../../../m1/game/platform/audio';
import { pickFreshLine } from '../../../../m1/game/platform/speech';
import { shakeScreen } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH, HUD_CLEAR_Y, CANVAS_HEIGHT } from '../../../../m1/constants';
import { setUi, takeCarHop, tragonMarkAt } from '../../../store';
import { speak, meatheadSays, byPants } from '../../section';
import { PIPER_PA_VOICE, type ByPants } from '../../talk';
import { paLine } from '../../piperLines';
import { GY, LANES, LANE_NAME, LANE_COL, RIDE_CPS, LOOP_MEMO, TIPS_MEMO, DROPS, rearX, speedAt, rideCp, type Lane } from '../layout';
import { tragonsOf, type Tragons } from '../state';
import { TRACK_SRC, FLUNG_SRC, FELL_SRC, trackDeath } from '../deaths';
import {
  SPIEL, SPIEL_VOICE, PIPER_T, NO_GUNS, FIRST_GAP, HOPPED, NEAR, DROP, LOOP_SEE, LOOP_IN, CORK_IN, BRAID, LOOP_OUT, SLIP,
  TUNNEL as TUNNEL_L, SPLASH,
} from '../lines';
import {
  BV_SCRIPT, END_S, TUNNEL, LAGOON, REAR, NOSE, CAR_L, CAM_BACK, CAM_UP, HORIZON, FOCAL, NEAR_K, HOP_REACH, ZAP_TELL, ZAP_LIVE,
  bvDue, bvEnd, trackAt, rollOn, laneBase, curveK, project, type BvEv, type TP, type SP,
} from './geom';
import type { Bv } from './state';

// ---------------------------------------------------------------------------------------------------------------
// Feel

/** His jump: up this fast, pulled down this hard (about 34 frames up and down, 60 high). */
const JUMP_V = 7.2, GRAV = 0.42;
/** His hop to the next track: frames in the air, its arc's height, the cooldown from when he goes. */
const HOP_T = 18, HOP_CD = 14;
export const HOP_ARC = 46;
/** The grip through a roll: DOWN let go this long and he's off; slipping this far and a hand's off; this far, both. */
const DOWN_GRACE = 9, SLIP_ONE = 12, SLIP_GONE = 46;
/** A roll's lean wants him leaning once the car's this far over on its side (|sin| of the roll). */
const LEAN_AT = 0.42;
/** How high his feet must be to clear a ring's burning bottom / a frozen bar; ducked under the icicles. */
const RING_CLEAR = 24, BAR_CLEAR = 20;
/** The arrival: the fade out starts this far short of the end. */
const OUT_LEAD = 900, FADE = 16;
/** The death's side shot: the engine's camera here (world), so the shot's lawn is the park's (GY) at screen row 520. */
export const shotCam = () => ({ x: rearX(0) + 1500 - CANVAS_WIDTH / 2, y: GY - 520 });
/** In the shot: the dragon's back he dies on (screen), the lawn's row. */
export const SHOT_CAR = { x: 400, y: 300 }, SHOT_LAWN = 520;
/** How tall he's drawn on his car (world units over his boots), for his words' place. */
export const ME_H = 88;

// ---------------------------------------------------------------------------------------------------------------
// Saying things

const paSay = (state: GameState, who: 'spiel' | 'piper', line: string | null) => {
  if (!line) return;
  const t = tragonsOf(state);
  speak(who === 'spiel' ? SPIEL_VOICE : PIPER_PA_VOICE, line, s => { t.pa = s; if (s) t.paWho = who; }, true);
};
const mSay = (state: GameState, pool: ByPants, after = true) => {
  const line = pickFreshLine(byPants(state, pool));
  if (line && state.player.health > 0) meatheadSays(state, line, after);
};
const once = (t: Tragons, k: string) => { if (t.said[k]) return false; t.said[k] = true; return true; };

// ---------------------------------------------------------------------------------------------------------------
// Setting up

/** The floor his death's played on in the side shot (a dragon's back; away till then). */
let shotFloor: Block | null = null;
export const buildBehind = (state: GameState) => {
  shotFloor = { x: 0, y: -99999, w: 300, h: 16, type: 'platform', oneWay: true, hidden: true, tag: 'tragons-shot' } as Block;
  state.blocks.push(shotFloor);
};

const newBv = (lane: Lane): Bv => ({
  trains: LANES.map(l => ({ lane: l, phase: 'ok' as const, t: 0, fy: 0, fvy: 0 })),
  gaps: [], rolls: [], obst: [], burns: [], zap: null, fired: new Set(), lastSafe: null,
  hop: null, hopCd: 0, jy: 0, jv: 0, duck: false, jumpHeld: true, lock: null, fling: null, fall: null, dead: null, deadLane: lane,
  cam: { x: 0, y: 0, s: 0, ang: 0, hy: HORIZON }, camOx: 0, bank: 0, hy: HORIZON,
  me: { x: CANVAS_WIDTH / 2, y: 470, k: NEAR_K }, fadeIn: 0, out: 0, taught: {}, hurtT: 0,
});

/** The cut from the station's side view: the ride's seen from behind from here (his lane: the dragon he boarded). */
export const startBehind = (state: GameState, lane: Lane, fade = true) => {
  const t = tragonsOf(state);
  t.bv = newBv(lane);
  t.lane = lane; t.hop = null; t.lock = null; t.flung = false;
  t.bv.fadeIn = fade ? FADE : 0;
  t.cam.on = 0; state.viewIsScreen = false;
  setUi({ tragonTips: false, tragonHold: null });
  for (const tr of t.trains) { tr.roof.y = -99999; tr.head.y = -99999; tr.tail.y = -99999; }
  camera(state, t, t.bv, true);
};

/** Back on the ride at a checkpoint that far along: what's still to come put back. */
export const settleBehind = (state: GameState) => {
  const t = tragonsOf(state), rc = rideCp(state.checkpoint);
  if (!rc) return;
  startBehind(state, rc.lane, false);
  const bv = t.bv!;
  t.dist = rc.s; t.v = speedAt(rc.s);
  BV_SCRIPT.forEach((ev, i) => {
    if (!bvDue(ev, t.dist, t.v)) return;
    bv.fired.add(i);
    if (bvEnd(ev) + 200 > t.dist) fire(state, t, bv, ev, i, true);
  });
  camera(state, t, bv, true);
};

// ---------------------------------------------------------------------------------------------------------------
// The script

const hisLane = (t: Tragons, bv: Bv) => (bv.hop ? bv.hop.to : t.lane);
const pick = <T,>(a: T, b: T) => (Math.random() < 0.5 ? a : b);

const fire = (state: GameState, t: Tragons, bv: Bv, ev: BvEv, i: number, silent = false) => {
  const his = hisLane(t, bv), f = state.frame;
  if (ev.k === 'say') {
    if (silent) return;
    if (ev.what === 'piper') paSay(state, 'piper', paLine(PIPER_T.start));
    else if (ev.what === 'piperMid') paSay(state, 'piper', paLine(PIPER_T.mid));
    else if (ev.what === 'piperLate') paSay(state, 'piper', paLine(PIPER_T.late));
    else if (ev.what === 'near') mSay(state, NEAR);
    else paSay(state, 'spiel', pickFreshLine(SPIEL[ev.what]));
  } else if (ev.k === 'fire') {
    bv.burns.push({ a: ev.at - 160, b: ev.at + ev.len });
    for (let s = ev.at; s < ev.at + ev.len; s += ev.gap) if (s > t.dist + REAR + 40) bv.obst.push({ kind: 'ring', lane: 1, s, done: false, hit: false });
  } else if (ev.k === 'ice') {
    [...ev.pat].forEach((ch, n) => {
      const s = ev.at + n * ev.gap;
      if (s > t.dist + REAR + 40 && (ch === 'i' || ch === 'b')) bv.obst.push({ kind: ch === 'i' ? 'icicles' : 'bar', lane: 2, s, done: false, hit: false });
    });
  } else if (ev.k === 'zap') {
    if (!silent && bv.trains[0].phase === 'ok') { bv.zap = { phase: 'tell', t: 0, shockAt: -99 }; playSound('alert', 0.5, 6); }
  } else if (ev.k === 'gap' || ev.k === 'safe') {
    let lanes: Lane[], safe: Lane | undefined;
    if (ev.k === 'gap') lanes = [his];
    else {
      safe = ev.safe === 'next' ? (his === 1 ? pick<Lane>(0, 2) : 1) : his === 0 ? 2 : his === 2 ? 0 : pick<Lane>(0, 2);
      // (a hole that's followed by a roll on the track left: never LIGHTNING, it only rolls in the unison ones)
      const nextSpin = BV_SCRIPT.slice(i + 1).find(e => e.k === 'spin');
      if (safe === 0 && nextSpin?.k === 'spin' && nextSpin.on === 'safe') safe = 2;
      lanes = LANES.filter(l => l !== safe);
      bv.lastSafe = safe;
    }
    const a = Math.max(ev.at, t.dist + NOSE + 160);
    for (const lane of lanes) t.gaps.push({ lane, a, b: a + ev.len, at: f, safe, w: (a - (t.dist + NOSE)) / Math.max(1, t.v) });
    bv.gaps = t.gaps;
    if (silent) return;
    playSound('boom', 0.55, -4); shakeScreen(state, 6, 3);
    if (once(t, 'firstGap')) mSay(state, FIRST_GAP, false);
    if (once(t, 'piperGap')) paSay(state, 'piper', paLine(PIPER_T.gap));
  } else if (ev.k === 'spin') {
    // (LIGHTNING only rolls in the unison ones (the owner's): on his track if that's FIRE or ICE, else on those two)
    const lanes: Lane[] = ev.on === 'all' ? [0, 1, 2] : ev.on === 'two' ? [1, 2] : ev.on === 'safe' ? [bv.lastSafe ? bv.lastSafe : 2] : his === 0 ? [1, 2] : [his];
    const w = Math.max(1, (ev.at - (t.dist + NOSE)) / Math.max(1, t.v));
    const teach = !!ev.teach && !state.stageMemo[LOOP_MEMO];
    const kind = ev.kind === 'cork' ? 'CORKSCREW' : ev.kind === 'braid' ? 'TRIPLE HELIX' : ev.kind === 'chain' ? 'INTERLOCKING LOOPS' : ev.kind === 'chain3' ? 'TRIPLE LOOP' : 'LOOP';
    const base = { len: ev.len, turns: ev.turns ?? 1, ev: i, w, teach, kind };
    if (ev.kind === 'chain3') lanes.forEach(l => bv.rolls.push({ ...base, lanes: [l], s0: ev.at + l * 250, dir: l === 1 ? -1 : 1, shared: false }));
    else if (ev.kind === 'chain') lanes.forEach((l, n) => bv.rolls.push({ ...base, lanes: [l], s0: ev.at + n * ev.len * 0.5, dir: n ? -1 : 1, shared: false }));
    else bv.rolls.push({ ...base, lanes, s0: ev.at, dir: ev.kind === 'cork' ? -1 : 1, shared: ev.on === 'all' });
    if (silent) return;
    playSound('alert', 0.5, 4);
    if (lanes.includes(his)) mSay(state, ev.kind === 'braid' ? BRAID : LOOP_SEE);
    if (once(t, 'piperLoop')) paSay(state, 'piper', paLine(PIPER_T.loop));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Hurting him (his place for the engine moved to the side shot's for the hit: if it kills him, the death plays there)

const hurtMe = (ctx: FrameContext, bv: Bv, dmg: number, src: string) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0) return false;
  const keep = { x: p.pos.x, y: p.pos.y };
  toShot(ctx.state, 'other');
  hurtPlayer(ctx, dmg, src);
  if (p.health > 0) { p.pos.x = keep.x; p.pos.y = keep.y; p.vel.x = 0; p.vel.y = 0; bv.hurtT = 30; bv.dead = null; return true; }
  return true;
};

/** Puts him (and the engine's camera) in the death's side shot. */
const toShot = (state: GameState, how: 'track' | 'splat' | 'other') => {
  const t = tragonsOf(state), bv = t.bv!, p = state.player, cam = shotCam();
  bv.dead = how;
  state.cameraOverride = { ...cam }; state.camera.x = cam.x; state.camera.y = cam.y;
  const fx = cam.x + SHOT_CAR.x, fy = how === 'splat' ? GY : cam.y + SHOT_CAR.y;
  p.hidden = false; p.carried = how !== 'splat'; p.vel.x = 0; p.vel.y = 0;
  p.pos.x = fx - p.width / 2; p.pos.y = fy - p.height; p.isGrounded = true;
  p.spriteRot = undefined; p.spriteScaleX = undefined; p.spriteScaleY = undefined; p.tragon = undefined; p.freefall = undefined;
  if (shotFloor) { shotFloor.x = fx - 150; shotFloor.y = how === 'other' ? fy : -99999; }
  if (how === 'track') Object.assign(trackDeath, { cx: fx, cy: fy, a: 0, d: 1, lane: bv.deadLane });
};

const killWith = (ctx: FrameContext, how: 'track' | 'splat', src: string) => {
  const p = ctx.state.player;
  if (p.health <= 0) return;
  toShot(ctx.state, how);
  p.invincibilityTimer = 0;
  hurtPlayer(ctx, 9999, src);
};

// ---------------------------------------------------------------------------------------------------------------
// The camera: behind and over his car, leaning toward the middle track (all three in the picture), rolled with his
// car through a roll (the park overhead at the top), banked into the bends, pitched up the hills and down the drops

const TA: TP = { x: 0, y: 0, phi: 0 }, TB: TP = { x: 0, y: 0, phi: 0 }, MB = { x: 0, y: 0 }, HB = { x: 0, y: 0 };
const SPx: SP = { x: 0, y: 0, k: 1 };
const camera = (state: GameState, t: Tragons, bv: Bv, snap: boolean) => {
  const sCar = t.dist + REAR;
  // (where his car is: on his track, or between two in a hop)
  const lane = bv.hop ? bv.hop.to : t.lane;
  trackAt(bv.rolls, lane, sCar, TA);
  let cx = TA.x, cy = TA.y, phi = TA.phi;
  if (bv.hop) {
    trackAt(bv.rolls, bv.hop.from, sCar, TB);
    const u = Math.min(1, bv.hop.t / bv.hop.dur), e = u * u * (3 - 2 * u);
    cx = TB.x + (TA.x - TB.x) * e; cy = TB.y + (TA.y - TB.y) * e; phi = 0;
  }
  // (leaning toward the middle track: his own track's middle offset, unrolled)
  laneBase(1, sCar, MB); laneBase(lane, sCar, HB);
  const ox = -(HB.x - MB.x) * 0.62;
  bv.camOx = snap ? ox : bv.camOx + (ox - bv.camOx) * 0.12;
  const c = Math.cos(phi), s = Math.sin(phi);
  const lx = bv.camOx, ly = CAM_UP;
  bv.cam.x = cx + lx * c - ly * s; bv.cam.y = cy + lx * s + ly * c; bv.cam.s = sCar - CAM_BACK;
  // (the bank into the bends; the pitch up the hills and down the drops (the slope ahead of him); none in a roll)
  const bank = Math.max(-0.22, Math.min(0.22, -curveK(sCar + 400) * 9000));
  bv.bank = snap ? bank : bv.bank + (bank - bv.bank) * 0.05;
  laneBase(1, sCar + 260, HB);
  const slope = (HB.y - MB.y) / 260;
  const hy = HORIZON + Math.max(-150, Math.min(170, slope * FOCAL * 0.85));
  bv.hy = snap ? hy : bv.hy + (hy - bv.hy) * 0.1;
  bv.cam.hy = bv.hy;
  bv.cam.ang = phi + bv.bank * (bv.lock ? 0.3 : 1);
  // (his feet on screen: his car's place, before the view's turned)
  if (project(bv.cam, cx, cy, sCar, SPx)) { bv.me.x = SPx.x; bv.me.y = SPx.y; bv.me.k = SPx.k; }
};

/** A screen point (before the view's turned) as it's really drawn (after). */
export const turned = (bv: Bv, x: number, y: number) => {
  const a = bv.cam.ang, px = CANVAS_WIDTH / 2, py = bv.cam.hy, dx = x - px, dy = y - py, c = Math.cos(a), s = Math.sin(a);
  return { x: px + dx * c - dy * s, y: py + dx * s + dy * c };
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export const updateBehind = (ctx: FrameContext, controls: Controls, onArrive: () => void): Controls => {
  const { state } = ctx, t = tragonsOf(state), bv = t.bv!, p = state.player, f = state.frame;
  const alive = p.health > 0;
  if (import.meta.env.DEV) noteBehind(t);
  const asked = takeCarHop();
  if (bv.hurtT > 0) bv.hurtT--;
  if (bv.fadeIn > 0) bv.fadeIn--;
  p.noSpecials = true; p.shootCooldown = Math.max(p.shootCooldown, 3);
  setUi({ pauseControls: 'tragons', noSwitch: true });
  // ---- the side shot taken, but he's not dead (god mode): back on a dragon that's on its track
  if (alive && bv.dead) {
    bv.dead = null; bv.fling = null; bv.fall = null; bv.lock = null; bv.hop = null; bv.jy = 0; bv.jv = 0;
    const ok = LANES.find(l => bv.trains[l].phase === 'ok' && !t.gaps.some(g => g.lane === l && g.a <= t.dist + NOSE + 200 && g.b > t.dist));
    if (ok !== undefined) t.lane = ok;
    if (shotFloor) shotFloor.y = -99999;
  }
  // ---- dead: the side shot holds; nothing goes on
  if (!alive || bv.dead) {
    setUi({ carHops: false, tragonMarks: null, tragonCard: null });
    return { ...NO_CONTROLS };
  }
  const want = bv.hop || bv.lock || bv.fall || bv.fling ? null : asked;

  // ---- along (the brakes at the end); the fade out and the arrival
  t.v += (speedAt(t.dist) - t.v) * 0.03;
  t.dist += t.v;
  if (t.dist >= END_S - OUT_LEAD && !bv.lock && !bv.fall && !bv.fling) bv.out++;
  if (bv.out > FADE) { onArrive(); return { ...NO_CONTROLS }; }
  const sCar = t.dist + REAR, prevCar = sCar - t.v;

  // ---- the script; the checkpoints
  BV_SCRIPT.forEach((ev, i) => {
    if (bv.fired.has(i) || !bvDue(ev, t.dist, t.v)) return;
    bv.fired.add(i);
    fire(state, t, bv, ev, i);
  });
  for (const c of RIDE_CPS) if (c.cp > state.checkpoint && t.dist >= c.s) state.checkpoint = c.cp;

  // ---- the dragons: over a broken end; gone; a spare down onto the track once it's whole again
  for (const tr of bv.trains) {
    if (tr.phase === 'ok' && t.gaps.some(g => g.lane === tr.lane && g.a <= t.dist + NOSE && g.b > t.dist)) {
      tr.phase = 'fall'; tr.t = 0; tr.fvy = 0; tr.fy = 0;
      playSound('crash', 0.7, -6); playSound('screams', 0.4, 2);
      const on = !bv.hop && t.lane === tr.lane;
      if (on) { bv.fall = { t: 0, lane: tr.lane }; bv.lock = null; }
    }
    if (tr.phase === 'fall') { tr.t++; tr.fvy += 0.5; tr.fy += tr.fvy; if (tr.t > 70) { tr.phase = 'gone'; tr.t = 0; } }
    else if (tr.phase === 'gone') {
      tr.t++;
      if (tr.t > 40 && t.dist < END_S - 2500 && !t.gaps.some(g => g.lane === tr.lane && g.a < t.dist + NOSE + 500 && g.b > t.dist - 60) && !rollOn(bv.rolls, tr.lane, sCar) && !rollOn(bv.rolls, tr.lane, t.dist + NOSE)) {
        tr.phase = 'arrive'; tr.t = 0;
        if (once(t, `spare${Math.floor(f / 600)}`)) paSay(state, 'spiel', pickFreshLine(SPIEL.spare));
      }
    } else if (tr.phase === 'arrive' && ++tr.t >= 60) { tr.phase = 'ok'; playSound('thud', 0.9, -8); shakeScreen(state, 4, 3); }
  }
  t.gaps = t.gaps.filter(g => g.b > t.dist - 400); bv.gaps = t.gaps;
  bv.rolls = bv.rolls.filter(r => r.s0 + r.len > t.dist - 400);
  bv.burns = bv.burns.filter(b => b.b > t.dist - 400);
  const coming = t.gaps.find(g => g.lane === hisLane(t, bv) && g.a > t.dist + NOSE);
  if (coming && f - t.alarmAt > 34) { t.alarmAt = f; playSound('alarm', 0.35, 4); }

  // ---- his dragon over the end with him on it: a moment of it from behind, then the death (the side shot)
  if (bv.fall) {
    bv.fall.t++;
    if (bv.fall.t === 1) { playSound('screams', 0.8, 4); t.downAt = f; }
    if (bv.fall.t > 30) { bv.deadLane = bv.fall.lane; killWith(ctx, 'track', TRACK_SRC[bv.fall.lane]); }
  }

  // ---- the LIGHTNING dragon live: the tell, then live; on it with his boots on its back, shocked (hop off!)
  if (bv.zap) {
    const z = bv.zap, tr = bv.trains[0];
    z.t++;
    if (z.phase === 'tell') {
      if (z.t % Math.max(3, 14 - Math.floor(z.t / 9)) === 0) playSound('taser', 0.12 + 0.35 * (z.t / ZAP_TELL) * (t.lane === 0 ? 1 : 0.5), 6);
      if (z.t >= ZAP_TELL) { z.phase = 'live'; z.t = 0; playSound('thunder', 0.8, 2); shakeScreen(state, 5, 3); }
    } else {
      if (f % 6 === 0) playSound('taser', t.lane === 0 && !bv.hop ? 0.4 : 0.18, 2 + (f % 3));
      if (tr.phase === 'ok' && t.lane === 0 && !bv.hop && bv.jy < 3 && f - z.shockAt > 22 && !bv.fall && !bv.fling) {
        z.shockAt = f;
        if (hurtMe(ctx, bv, 8, 'm2:fa_live_rail')) { bv.jv = 5.2; bv.jy = 0.1; playSound('taser', 0.9, 4); }
      }
      if (z.t >= ZAP_LIVE || tr.phase !== 'ok') bv.zap = null;
    }
  }

  // ---- the rolls: locked in on his car (no hopping, no jumping): hold DOWN, lean to the high side
  if (!bv.hop && !bv.fall && !bv.fling && p.health > 0) {
    const r = rollOn(bv.rolls, t.lane, sCar);
    if (r && !bv.lock) {
      bv.lock = { down: 0, slip: 0, oneOff: false, lean: 0, want: 0, roll: r, t: 0 };
      bv.jy = 0; bv.jv = 0;
      mSay(state, r.kind === 'CORKSCREW' ? CORK_IN : LOOP_IN, false);
      playSound('whoosh', 0.8, -2);
    } else if (!r && bv.lock) {
      if (!state.stageMemo[LOOP_MEMO]) state.stageMemo[LOOP_MEMO] = '1';
      if (once(t, 'loopOut') || Math.random() < 0.3) mSay(state, LOOP_OUT, false);
      bv.lock = null;
    }
    if (bv.lock) {
      const L = bv.lock;
      L.t++;
      trackAt(bv.rolls, t.lane, sCar, TA);
      const sn = Math.sin(TA.phi);
      L.want = sn > LEAN_AT ? 1 : sn < -LEAN_AT ? -1 : 0;
      L.lean = controls.left && !controls.right ? -1 : controls.right && !controls.left ? 1 : 0;
      if (controls.down) L.down = 0; else L.down++;
      if (L.want !== 0) {
        if (L.lean === L.want) L.slip = Math.max(0, L.slip - 3);
        else L.slip += L.lean === -L.want ? 2 : 1;
      } else L.slip = Math.max(0, L.slip - 1);
      const was = L.oneOff;
      L.oneOff = L.slip >= SLIP_ONE;
      if (L.oneOff && !was) { mSay(state, SLIP, false); playSound('whoosh', 0.6, 8); }
      if (!L.oneOff && was) playSound('land', 0.5, 4);
      if (L.down === 4) playSound('whoosh', 0.5, 10);
      if (L.slip >= SLIP_GONE || L.down > DOWN_GRACE) flingOff(ctx, t, bv, L.want || 1);
    }
  }

  // ---- his jump, his duck (never in a roll, a fall or a fling)
  const free = !bv.lock && !bv.fall && !bv.fling;
  const jumpNow = !!controls.jump && !bv.jumpHeld;
  bv.jumpHeld = !!controls.jump;
  if (free) {
    if (jumpNow && bv.jy <= 0 && !bv.hop) { bv.jv = JUMP_V; bv.jy = 0.1; bv.duck = false; playSound('jump', 0.8, 0); }
    if (bv.jy > 0) {
      bv.jy += bv.jv; bv.jv -= GRAV;
      if (bv.jy <= 0) { bv.jy = 0; bv.jv = 0; if (!bv.hop) playSound('land', 0.6, -4); }
    }
    bv.duck = !!controls.down && bv.jy <= 0 && !bv.hop;
  } else bv.duck = false;

  // ---- his hop: a track left (LB) or right (RB)
  if (bv.hopCd > 0) bv.hopCd--;
  if (want && free && bv.hopCd <= 0) {
    const to = t.lane + (want === 'up' ? 1 : -1);
    const ok = to >= 0 && to <= 2 && canLand(t, bv, to as Lane, sCar) && !rollOn(bv.rolls, t.lane, sCar);
    if (ok) {
      bv.hop = { from: t.lane, to: to as Lane, t: 0, dur: HOP_T };
      t.lane = to as Lane;
      bv.hopCd = HOP_CD; bv.duck = false;
      playSound('jump', 0.9, want === 'up' ? 2 : -2); playSound('whoosh', 0.5, 0);
    } else { playSound('click', 0.5, -6); bv.hopCd = 8; }
  }
  if (bv.hop) {
    const h = bv.hop;
    h.t++;
    if (h.t >= h.dur) {
      bv.hop = null;
      if (bv.trains[h.to].phase !== 'ok' || t.gaps.some(g => g.lane === h.to && g.a <= sCar && g.b > sCar)) {
        // (nothing to land on: down past where it was)
        bv.fling = { t: 0, x: bv.me.x, y: bv.me.y, vx: (h.to - h.from) * 2, vy: -2, rot: 0, src: FELL_SRC };
        playSound('screams', 0.8, 4);
      } else {
        playSound('land', 0.8, -4);
        if (!state.stageMemo[TIPS_MEMO]) state.stageMemo[TIPS_MEMO] = '1';
        if (once(t, 'hopped') || Math.random() < 0.1) mSay(state, HOPPED);
      }
    }
  }

  // ---- what's on the tracks, going under his car: the rings (jump through), the icicles (duck), the bars (jump)
  const lane = t.lane;
  for (const o of bv.obst) {
    if (o.done || o.s > sCar || o.s <= prevCar) continue;
    o.done = true;
    if (bv.hop || bv.fall || bv.fling || o.lane !== lane || bv.trains[lane].phase !== 'ok') continue;
    const hit = o.kind === 'ring' ? bv.jy < RING_CLEAR || bv.duck : o.kind === 'bar' ? bv.jy < BAR_CLEAR : !bv.duck || bv.jy > 0;
    if (hit) {
      o.hit = true;
      const src = o.kind === 'ring' ? 'm2:fa_ring' : o.kind === 'bar' ? 'm2:fa_icebar' : 'm2:fa_icicles';
      if (hurtMe(ctx, bv, o.kind === 'ring' ? 12 : o.kind === 'bar' ? 10 : 11, src)) {
        playSound(o.kind === 'ring' ? 'flame' : 'glass', 0.8, 0);
        if (o.kind === 'bar') { bv.jv = 4; bv.jy = 0.1; }
      }
    } else playSound('whoosh', 0.35, 6);
  }
  bv.obst = bv.obst.filter(o => o.s > t.dist - 400);

  // ---- thrown off (a roll let go, or a hop onto nothing): tumbling away from behind, then the long fall's end
  if (bv.fling) {
    const g = bv.fling;
    g.t++; g.x += g.vx; g.y += g.vy; g.vy += 0.55; g.rot += 0.2;
    if (g.t > 52) killWith(ctx, 'splat', g.src);
  }

  // ---- the set pieces: over the top of the drops, into the mountain, the splashdown
  const front = t.dist + NOSE;
  DROPS.forEach((s, i) => { if (front > s && once(t, `drop${i}`)) { mSay(state, DROP, false); playSound('whoosh', 0.8, -8); } });
  if (front > TUNNEL.a && once(t, 'tunnel')) mSay(state, TUNNEL_L, false);
  if (sCar > LAGOON.splash && once(t, 'splash')) {
    t.splashAt = f; shakeScreen(state, 10, 5); playSound('splash', 1, -6); playSound('splash', 0.8, 2);
    mSay(state, SPLASH, false);
  }

  // ---- the camera; him in the world where he's drawn (his words over his head)
  camera(state, t, bv, false);
  if (p.health > 0 && !bv.dead) {
    const cam = shotCam();
    state.cameraOverride = { ...cam }; state.camera.x = cam.x; state.camera.y = cam.y;
    const head = turned(bv, bv.me.x, bv.me.y - (ME_H + bv.jy) * bv.me.k);
    p.hidden = true; p.carried = true; p.vel.x = 0; p.vel.y = 0;
    p.pos.x = cam.x + head.x - p.width / 2; p.pos.y = cam.y + Math.max(HUD_CLEAR_Y + 30, head.y);
    p.isDucking = bv.duck;
  }

  // ---- the HUD: the hop buttons over the dragons he can hop to; the cards
  setUi({ carHops: !bv.lock && !bv.fall && !bv.fling, tragonMarks: hopMarks(t, bv, sCar), tragonCard: card(state, t, bv) });
  // ---- no guns on the ride (a line if he tries)
  if (controls.shoot && !t.said.shotHeld && f - t.shotAt > 360) { t.shotAt = f; mSay(state, NO_GUNS, false); }
  t.said.shotHeld = !!controls.shoot;
  return { ...NO_CONTROLS };
};

/** Can he land on that track now (its dragon there, its track whole under his car, in reach, not rolling)? */
const canLand = (t: Tragons, bv: Bv, to: Lane, sCar: number) => {
  if (bv.trains[to].phase !== 'ok') return false;
  if (t.gaps.some(g => g.lane === to && g.a <= sCar + 30 && g.b > sCar)) return false;
  if (rollOn(bv.rolls, to, sCar) || rollOn(bv.rolls, to, sCar + 120)) return false;
  trackAt(bv.rolls, t.lane, sCar, TA); trackAt(bv.rolls, to, sCar, TB);
  return Math.abs(TA.x - TB.x) <= HOP_REACH && Math.abs(TA.y - TB.y) < 200;
};

const flingOff = (ctx: FrameContext, t: Tragons, bv: Bv, side: number) => {
  const { state } = ctx, p = state.player;
  bv.lock = null;
  // (the way gravity has him: off the low side, as drawn)
  const g = turned(bv, bv.me.x, bv.me.y);
  const a = bv.cam.ang;
  bv.fling = { t: 0, x: g.x, y: g.y - 40 * bv.me.k, vx: -Math.sin(a) * 5 - side * 2, vy: Math.cos(a) * 3 - 5, rot: 0, src: FLUNG_SRC };
  // (his scream: a hurt with the line, the death after the fall)
  const keep = { x: p.pos.x, y: p.pos.y };
  hurtPlayer(ctx, 1, FLUNG_SRC);
  p.pos.x = keep.x; p.pos.y = keep.y;
  if (p.health <= 0) { p.health = 1; }
  playSound('screams', 0.8, 4); playSound('whoosh', 0.9, -4);
};

// ---------------------------------------------------------------------------------------------------------------
// The HUD

const MK: SP = { x: 0, y: 0, k: 1 };
/** Over each dragon he can hop to, its button (TragonMarks.tsx: 'down' is LB, the track to his left; 'up' RB). */
const hopMarks = (t: Tragons, bv: Bv, sCar: number): string | null => {
  if (bv.hop || bv.lock || bv.fall || bv.fling || bv.out) return null;
  const out = LANES.map(l => {
    const d = l - t.lane;
    if (Math.abs(d) !== 1 || !canLand(t, bv, l, sCar)) return '';
    trackAt(bv.rolls, l, sCar + CAR_L, TA);
    if (!project(bv.cam, TA.x, TA.y + 120, sCar + CAR_L, MK)) return '';
    const s = turned(bv, MK.x, MK.y);
    tragonMarkAt[l].x = Math.max(40, Math.min(CANVAS_WIDTH - 40, s.x));
    tragonMarkAt[l].y = Math.max(HUD_CLEAR_Y + 24, Math.min(CANVAS_HEIGHT - 80, s.y));
    return d > 0 ? 'up' : 'down';
  });
  return out.some(Boolean) ? out.join('|') : null;
};

/** The card at the bottom (BehindCards.tsx): hanging on in a roll now (HOLD, the lean, a hand off); a roll coming
 *  (which tracks); the first time each thing comes at his track (the button for it); the controls (the first ride). */
export type BvCard =
  | { k: 'now'; lean: -1 | 0 | 1; oneOff: boolean; kind: string }
  | { k: 'coming'; kind: string; lanes: string[]; cols: string[]; mine: boolean; teach: boolean }
  | { k: 'teach'; what: 'ring' | 'icicles' | 'bar' | 'zap' | 'gap' }
  | { k: 'tips' };
let lastCard: BvCard | null = null;
const same = (a: BvCard | null, b: BvCard | null) => JSON.stringify(a) === JSON.stringify(b);
const card = (state: GameState, t: Tragons, bv: Bv): BvCard | null => {
  const c = cardNow(state, t, bv);
  if (same(c, lastCard)) return lastCard;
  return (lastCard = c);
};
const cardNow = (state: GameState, t: Tragons, bv: Bv): BvCard | null => {
  if (bv.fall || bv.fling || bv.out || state.player.inCutscene) return null;
  if (bv.lock) return { k: 'now', lean: bv.lock.want, oneOff: bv.lock.oneOff, kind: bv.lock.roll.kind };
  const sCar = t.dist + REAR;
  const next = bv.rolls.filter(r => r.s0 > sCar - 2).sort((a, b) => a.s0 - b.s0)[0];
  if (next && (next.s0 - sCar) / Math.max(1, t.v) < Math.max(next.w, 200)) {
    const group = bv.rolls.filter(r => r.ev === next.ev);
    const lanes = [...new Set(group.flatMap(r => r.lanes))].sort();
    return { k: 'coming', kind: next.kind, lanes: lanes.map(l => LANE_NAME[l]), cols: lanes.map(l => LANE_COL[l][0]), mine: lanes.includes(t.lane), teach: next.teach };
  }
  // (the first time each comes at his track: its button, a few seconds before it gets to him)
  const soon = (s: number) => s > sCar && (s - sCar) / Math.max(1, t.v) < 150;
  const teachOf = (what: 'ring' | 'icicles' | 'bar' | 'zap' | 'gap', now: boolean): BvCard | null => {
    const k = `fa-tragons-bv-${what}`;
    if (state.stageMemo[k]) return null;
    if (!now) { if (bv.taught[what] && state.frame - bv.taught[what] > 200) state.stageMemo[k] = '1'; return bv.taught[what] && state.frame - bv.taught[what] <= 200 ? { k: 'teach', what } : null; }
    if (!bv.taught[what]) bv.taught[what] = state.frame;
    return { k: 'teach', what };
  };
  { const c = teachOf('zap', !!bv.zap && t.lane === 0); if (c) return c; }
  const o = bv.obst.find(q => q.lane === t.lane && soon(q.s));
  for (const what of ['ring', 'icicles', 'bar'] as const) { const c = teachOf(what, o?.kind === what); if (c) return c; }
  { const c = teachOf('gap', t.gaps.some(g => g.lane === t.lane && g.a > t.dist + NOSE)); if (c) return c; }
  if (!state.stageMemo[TIPS_MEMO]) return { k: 'tips' };
  return null;
};

/** (the music) Hung on in a roll, or his dragon in one. */
export const bvInLoop = (t: Tragons) => !!t.bv && (!!t.bv.lock || !!rollOn(t.bv.rolls, t.lane, t.dist + REAR));

// (dev only: the headless checks read the ride from outside)
let lastT: Tragons | null = null;
export const noteBehind = (t: Tragons) => { lastT = t; };
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __tragonsBv: () => unknown }).__tragonsBv = () => {
  const t = lastT, bv = t?.bv;
  if (!t || !bv) return { phase: t?.phase ?? null };
  const sCar = t.dist + REAR;
  return {
    phase: t.phase, dist: Math.round(t.dist), lane: t.lane, hop: !!bv.hop, jy: bv.jy, lock: bv.lock ? { want: bv.lock.want, oneOff: bv.lock.oneOff, slip: bv.lock.slip } : null,
    obst: bv.obst.filter(o => !o.done && o.s > sCar).map(o => ({ kind: o.kind, lane: o.lane, ahead: Math.round(o.s - sCar) })).slice(0, 6),
    gaps: t.gaps.map(g => ({ lane: g.lane, ahead: Math.round(g.a - (t.dist + NOSE)) })),
    rolls: bv.rolls.map(r => ({ lanes: r.lanes, ahead: Math.round(r.s0 - sCar), len: r.len })),
    zap: bv.zap ? bv.zap.phase : null, trains: bv.trains.map(q => q.phase), dead: bv.dead, v: t.v,
  };
};
