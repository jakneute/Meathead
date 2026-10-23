// THE RIDE: section 3 of Space Land (owner: the atom agent). The hijacked star sled on the Voyage to 2010 (like
// Adventure Land's mine cart, not the same): the ride sets the pace; he jumps (the sled and him in it), ducks, and
// fires the sled's own SPACE BLASTER (a green bolt from his gun: no ammo, not his gun's; tricks.ts).
// The ride's PA (pa.ts: a cheesy upbeat 1990 corporate narrator, never updated) tells him what 2010 will bring, all of it
// wrong, and teaches the blaster ("USE YOUR ONBOARD SPACE BLASTER") before the first cardboard Martian. ACT 1, the dark
// ride, slow. The chain lift up into the dome. ACT 2, space, fast. Then the MAIN BREAKER (DO NOT TOUCH): he half
// stands up out of the sled and punches it in going by, and the work lights bang on bank by bank (the sled crawls
// through it: it's all in view). It's a warehouse. ACT 3, the warehouse version, the show dead and the PA still going,
// down the last drop to the floor. THE BRAKE RUN (a scene from here): an ordinary ride ending. The brake fins grab the
// sled, it grinds to a crawl, in under STATION AHEAD, past the bored attendant's booth, into the station he left from
// (the track's a circuit: the drop's seen from the start), its unload end, plainly back, the PA's please-remain-seated,
// the gates' lamps green, and it stops, dead, at the platform. Done. Then he decides it isn't: the brake control's
// right there, and he punches it in. Sparks, nothing; BRAKE FAILURE, calmly, off the tape; then the drive tires kick it
// from a dead stop to impossibly fast all at once, the unload attendant snagged and flung, through the load end, everybody
// on the track flattened, the line sent flying, into the back of the sled in front, loading: up
// through the station's roof, out through the atom's shell (the outside shot: launch.ts), over the main drag. They're a
// smear. He's fine: on to the drag (DOORS.drag.start).
//
// Kept across his deaths and on fresh starts (state.stageMemo): the breaker (layout.ts BREAKER_MEMO: from checkpoint 23
// on it's gone), the launch (LAUNCHED_MEMO: the drag draws the smear). One-way: there's no coming back in from the drag
// (the launch is a one-way set piece); DOORS.ride.end (the atom's load platform) is kept for the record only.
//
// ~16600 px of track: about 70 s of riding plus the reveal, ~10 s of scenes (the brake run, the launch). Checkpoints 20-23.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { EnemyKind } from '../../../m1/types';
import type { SpaceSection } from '../section';
import { lay, hands, speak, meatheadSays, saidOver, sectionState, teleport, type Said } from '../section';
import { GY, DOORS } from '../geometry';
import { setUi } from '../../store';
import { silenceAll, pickLine, isTalking } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { ATOM, homeFacing } from '../atom/kinds';
import { OP_SEED } from '../atom/art';
import { drawAtomPerson, type Outfit } from '../atom/people';
import { box } from '../../intro/art/kit';
import {
  x0, x1, R, RUNS, GAPS, OBS, PA_CUES, BREAKER_X, ACT3_X, BRAKE_AT, FINS_X0, FINS_X1, BRAKE_X, BRAKE_BOX_X, FRONT_AT,
  STATION_ROOF, WORKERS, STATION_FOLK, UNLOAD_OP, QUEUE, CONSOLE_OP_X, speedAt, trackY, runAt, slopeAt, BREAKER_MEMO, LAUNCHED_MEMO, lightsOn,
} from './layout';
import { type Tricks, newTricks, runTricks, settleTricks, fireBlaster, JUMP_V, JUMP_G } from './tricks';
import { paStory, paSaying, paHush } from './pa';
import { drawSled, seatedIn, HIS_SLED, FRONT_SLED, SEATS, SLED_SINK } from './sled';
import { drawRideBackdrop, drawRideBack, drawRideFront, rideLighting, drawBlaster, drawPunchFlash, type RideLook } from './art';
import { drawLaunchOutside, prewarmLaunch, OUT_END, OUT_SPLAT, OUT_LAND_ME } from './launch';
import * as L from './lines';
import { SEAT_PUNCH_REACH, SEAT_PUNCH_UP } from '../../../m1/game/render/player/seatPunch';
import { forceWeapon, releaseWeapon } from '../../weaponLock';

const SINK = SLED_SINK;
/** (where his feet sit in it, from the sled's middle: the front seat) */
const SEAT = SEATS[0];
/** The runaway's top speed through the station (px a frame), and how much it gains a frame; what the drive tires kick it
 *  to all at once from a dead stop (the lurch); the crawl the brake fins hold it to, in to the platform. */
const RUNAWAY = 26, RUNAWAY_GAIN = 1.1, LURCH = 20, CRAWL = 1.1;
/** The haymaker (frames): the wind-up; the throw (at the sled's speed: the distance it covers in that many frames);
 *  the hit-stop on the fist going in; back down into the seat. */
const PUNCH_WIND = 12, PUNCH_THROW = 5, HIT_STOP = 6, PUNCH_BACK = 16;
/** Where the fist goes in: the breaker's face (its left edge, a little in), the brake control's. */
const BREAKER_FACE = BREAKER_X - 30, BOX_FACE = BRAKE_BOX_X - 18;
/** Where the brake run stops it dead: his fist, at full reach, on the brake control. */
const STOP_X = BOX_FACE - SEAT - SEAT_PUNCH_REACH;
/** Stopped: how long the stillness holds at least before his line; the longest it waits on the PA's spiel. */
const STILL_MIN = 50, STILL_MAX = 600;
/** After the punch: still at least this long (the sparks), and never longer than this (BRAKE FAILURE said whole). */
const BEAT_MIN = 34, BEAT_MAX = 220;
/** A jump pressed this many frames before he's back on the rail still goes; and off the end of the rail, this long. */
const JUMP_BUFFER = 8, COYOTE = 6;


/** Somebody flung (`floor`: they come down on it, a splat and a bounce, then lie there; none: off and away). */
interface Flyer { x: number; y: number; vx: number; vy: number; rot: number; seed: number; outfit: Outfit; floor?: number; lands?: number }
/** The haymaker: frames into it, how far through (seatPunch: 0..1 the wind-up, 1..2 the throw, 2..3 back down), the
 *  hit-stop left, landed. */
interface Punch { t: number; v: number; stop: number; done: boolean }
interface Sled {
  mode: 'off' | 'ride' | 'reveal' | 'crash' | 'up' | 'out' | 'gone';
  x: number; y: number; railY: number; vy: number; speed: number; air: boolean; jumpWas: boolean; t: number; lead: number;
  /** (a jump pressed early, frames left; frames since it went off the end of the rail) */
  jumpBuf: number; offRail: number; ducked: boolean;
  tricks: Tricks;
  /** The work lights (0 the show, 1 on), frames since the breaker went; the brake run: frames since the fins grabbed,
   *  since he punched the brake box in (BRAKE FAILURE, the siren). */
  k: number; breakerT: number; brakeT: number; boxT: number;
  /** The haymaker going (null: not); his bark at the breaker's said; the brake run: frames stopped dead, frames it's
   *  been quiet, his line's said, it's done (on with the punch); the flash where the fist went in (frames). */
  punch: Punch | null; barked: boolean; stopT: number; quietT: number; idea: boolean; ideaDone: boolean; flash: number; flashX: number; flashY: number;
  /** Who's been flung in the station (the line: q0..; the unload attendant, the operator). */
  gone: Set<string>;
  /** The PA's on (not on a second ride: the power's out). */
  paLive: boolean; cued: Set<string>; yelled: boolean; braked: boolean;
  /** The scene: frames into it; frames since the drive tires kicked it (0: not yet); the sled in front (gone through
   *  the roof); who's flying (up through it, or flung across the station). */
  sceneT: number; lurchT: number; frontGone: boolean; fliers: Flyer[]; front: { x: number; y: number; rot: number; vy: number } | null;
  /** The station's people: who's been hit (flying, in `fliers`); a beat held on each hit. */
  flat: Set<number>; hold: number;
  said: Said | null; saidX: number; saidY: number;
  /** Frames since the scene started (all of it: the skip's offered from SKIP_AFTER on). */
  skipT: number;
}
const fresh = (state: GameState): Sled => ({
  mode: 'off', x: R + 150, y: GY, railY: GY, vy: 0, speed: 0, air: false, jumpWas: false, t: 0, lead: 150,
  jumpBuf: 0, offRail: 0, ducked: false, tricks: newTricks(),
  k: lightsOn(state) ? 1 : 0, breakerT: lightsOn(state) ? 999 : 0, brakeT: 0, boxT: 0,
  punch: null, barked: false, stopT: 0, quietT: 0, idea: false, ideaDone: false, flash: 0, flashX: 0, flashY: 0, gone: new Set(),
  paLive: !state.stageMemo[LAUNCHED_MEMO], cued: new Set(), yelled: false, braked: false,
  sceneT: 0, lurchT: 0, frontGone: false, fliers: [], front: null, flat: new Set(), hold: 0, said: null, saidX: 0, saidY: 0, skipT: 0,
});
const sledOf = (state: GameState) => sectionState<Sled, 'ride'>(state, 'ride', () => fresh(state));
const look = (state: GameState): RideLook => {
  const s = sledOf(state);
  return { k: s.k, tricks: s.tricks, breakerT: s.breakerT, brakeT: s.brakeT, boxT: s.boxT, sledX: s.x, sledY: s.y, speed: s.speed, frontGone: s.frontGone, flat: s.flat, crashing: s.mode === 'crash' || s.mode === 'up', gone: s.gone, lurched: s.lurchT > 0 };
};

/** Into it, where he is (the atom's handed him over, or back at a checkpoint). */
const board = (state: GameState, s: Sled) => {
  const p = state.player;
  let at = Math.max(R + 150, Math.min(BRAKE_AT - 300, p.pos.x + p.width / 2));
  if (trackY(at) === null) at = (RUNS.find(r => r[0] > at) ?? RUNS[0])[0] + 20;
  s.mode = 'ride'; s.x = at; s.y = s.railY = trackY(at) ?? GY; s.vy = 0; s.speed = 0; s.air = false; s.t = 0;
  // (past where its story's cued: not told again)
  for (const [id, x] of PA_CUES) if (x < at - 40) s.cued.add(id);
  p.carried = true;
  place(state, s);
};
const place = (state: GameState, s: Sled) => {
  const p = state.player, rot = s.air ? 0 : slopeAt(s.x) ?? 0;
  p.pos.x = s.x + SEAT * Math.cos(rot) - p.width / 2; p.pos.y = s.y + SEAT * Math.sin(rot) - SINK - p.height;
  p.vel.x = 0; p.vel.y = 0;
};
/** (each obstacle kind's first-time line: the kinds that share one) */
const SEES_OF: Record<string, string> = { sat: 'satellite', tray: 'butler', trolley: 'butler', beam: 'laser', wire: 'laser', pallet: 'forklift', rock: 'rock', crates: 'crates' };
const firstSight = (state: GameState, kind: string) => {
  const k = SEES_OF[kind];
  if (!k || !L.SEES[k]) return;
  const key = `m2:rideSaw:${k}`;
  if (state.stageMemo[key]) return;
  state.stageMemo[key] = 'yes';
  // (the cardboard Martian's line waits on the PA's lesson: it's said after, not over it)
  meatheadSays(state, pickLine(L.SEES[k]));
};
const sayAt = (s: Sled, voiceId: string, text: string, x: number, y: number) => {
  s.saidX = x; s.saidY = y;
  speak(voiceId, text, v => { s.said = v; }, true);
};
/** The space blaster, out of his gun (sat in the sled; ducked, lower). */
/** How the sled's tipped: going up out of the station's roof, in the air (its nose with how it's flying), or along the rail. */
const sledRot = (s: Sled) => s.mode === 'up' ? -0.4 - s.sceneT * 0.05 : s.air ? Math.max(-0.3, Math.min(0.3, s.vy * 0.03)) : slopeAt(s.x) ?? 0;
const blast = (state: GameState, s: Sled) => {
  const p = state.player;
  // (out of his gun the way the sled's pointed: its tilt, up a hill or in the air, turning the muzzle and the shot)
  const ang = sledRot(s), dx = p.pos.x + p.width + 4 - s.x, dy = p.pos.y + (s.ducked ? 40 : 30) - s.y;
  const cs = Math.cos(ang), sn = Math.sin(ang);
  fireBlaster(s.tricks, s.x + dx * cs - dy * sn, s.y + dx * sn + dy * cs, s.speed, ang);
};

// ---------------------------------------------------------------------------------------------------------------
// The haymaker (the two control panels: the MAIN BREAKER going by, the brake control stopped at it)

/** Where his fist is at full reach (world x), sat in the front seat. */
const fistX = (s: Sled) => s.x + SEAT + SEAT_PUNCH_REACH;
/** The haymaker at a panel whose face is at `face`: the wind-up, then the throw timed off the sled's motion so the fist
 *  goes in exactly as they line up (`still`: it's stopped, the throw just thrown). True the frame it lands (it then
 *  holds there, the hit-stop, and comes back down into the seat). Call once a frame while s.punch is going. */
const swing = (s: Sled, face: number, still: boolean): boolean => {
  const pu = s.punch!;
  pu.t++;
  if (pu.stop > 0) { pu.stop--; pu.v = 2; return false; }
  if (pu.done) { pu.v += 1 / PUNCH_BACK; if (pu.v >= 3) s.punch = null; return false; }
  const gap = face - fistX(s), reach = Math.max(0.01, s.speed) * PUNCH_THROW;
  const throwing = still ? pu.t > PUNCH_WIND : gap <= reach;
  if (!throwing) { pu.v = Math.min(1, pu.t / PUNCH_WIND); return false; }
  // (the throw: going by, how far it's come in toward the face; stopped, frame by frame)
  const k = still ? Math.min(1, Math.max(pu.v - 1, 0) + 1 / PUNCH_THROW) : Math.max(pu.v - 1, 1 - gap / reach, 0);
  pu.v = 1 + Math.min(1, k);
  if (k < 1) return false;
  pu.v = 2; pu.stop = HIT_STOP; pu.done = true;
  return true;
};
/** The fist in: the panel caves in (the flash, sparks, the fuse-box pop, its buttons and knobs flying, smoke), the
 *  shake, the sound (the punch, the crackle). */
const panelHit = (state: GameState, s: Sled, x: number, y: number) => {
  s.flash = 8; s.flashX = x; s.flashY = y;
  playSound('punch', 1, -8); playSound('crunch', 1, -4); playSound('taser', 0.9, -6); playSound('glass', 0.6, 4); playSound('boom', 0.5, 6);
  shakeScreen(state, 14, 7);
  for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 12, y: y + (Math.random() - 0.5) * 16 }, vel: { x: (Math.random() - 0.35) * 10, y: -2 - Math.random() * 7 }, life: 18 + Math.random() * 18, color: ['#FDE047', '#FFFFFF', '#F97316', '#BAE6FD'][i % 4], size: 2 + Math.random() * 2, grav: 0.3 });
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: y - 6 }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.6 - Math.random() * 1.2 }, life: 50 + Math.random() * 30, color: i % 2 ? 'rgba(82, 82, 91, 0.55)' : 'rgba(161, 161, 170, 0.45)', size: 6 + Math.random() * 6, grav: -0.02 });
  // (its buttons and knobs, a toggle, a lamp's lens)
  for (let i = 0; i < 9; i++) s.tricks.bits.push({ x, y, vx: (Math.random() - 0.2) * 8, vy: -4 - Math.random() * 6, rot: Math.random() * 6, col: ['#DC2626', '#FDE047', '#22C55E', '#27272A', '#E5E7EB'][i % 5], w: 4 + Math.random() * 4, h: 4 + Math.random() * 4 });
};

// ---------------------------------------------------------------------------------------------------------------
// Riding

/** The sled's front wheel and its middle (the back trails: never caught on what it's leaving), and how far into a run one can be and still be caught on it. */
const WHEELS = [40, 0], SNAP_IN = 44;
/** The sled's nose ahead of its middle (where it meets the breaker); the beat held on each thing it wrecks (frames). */
const BREAKER_REACH = 96, SMASH_HOLD = 18;
const riding = (ctx: FrameContext, s: Sled, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  // (the fist in the breaker: everything held a few frames, the hit-stop)
  if (s.punch && s.punch.stop > 0) { swing(s, BREAKER_FACE, false); place(state, s); return { ...controls, left: false, right: false, jump: false, down: false, charge: false, special: false }; }
  s.t++;
  const reveal = s.mode === 'reveal';
  const want = reveal ? 1.3 : speedAt(s.x);
  s.speed += (Math.min(want, s.t / 6) - s.speed) * (reveal ? 0.08 : 0.06);
  // (a beat held on what it's just smashed through: the breaker)
  if (s.hold > 0) { s.hold--; s.speed = Math.min(s.speed, 0.5); } else s.x += s.speed;
  // The PA's stories, as it gets to each (the blaster's lesson cuts in: it has to be said before the first Martian)
  if (s.paLive) for (const [id, x] of PA_CUES) if (!s.cued.has(id) && s.x >= x) { s.cued.add(id); paStory(state, id, id === 'blaster'); }
  // The breaker: he punches it in going by, and the lights come up, bank by bank
  // (it hangs in the back of a doorway barely wider than the sled, at his height: his bark at it first (a bark: never
  // over anybody), the wind-up as it comes, the throw timed so the fist goes in as they line up)
  if (s.breakerT === 0) {
    if (!s.barked && s.x >= BREAKER_X - 900) { s.barked = true; meatheadSays(state, pickLine(L.PUNCH_BREAKER), false); }
    if (!s.punch && BREAKER_FACE - fistX(s) <= s.speed * (PUNCH_WIND + PUNCH_THROW)) s.punch = { t: 0, v: 0, stop: 0, done: false };
    const landed = s.punch ? swing(s, BREAKER_FACE, false) : false;
    // (landed, or (never short of it) the sled's nose at it)
    if (landed || s.x >= BREAKER_X - BREAKER_REACH) {
      if (!landed) s.punch = { t: 0, v: 2, stop: HIT_STOP, done: true };
      s.breakerT = 1; s.mode = 'reveal'; state.stageMemo[BREAKER_MEMO] = 'yes'; s.hold = SMASH_HOLD; s.speed = 0.4;
      panelHit(state, s, BREAKER_FACE, s.y - SINK - SEAT_PUNCH_UP);
      playSound('clang', 1, -10); playSound('ignite', 0.6, 8);
    }
  } else if (s.punch) swing(s, BREAKER_FACE, false);
  if (s.breakerT > 0 && s.breakerT < 999) {
    s.breakerT++;
    // (thunk, thunk, thunk, thunk: the banks of work lights)
    for (const [at, k] of [[30, 0.25], [55, 0.5], [80, 0.75], [105, 1]] as const) if (s.breakerT === at) { s.k = k; playSound('thud', 1, -14); playSound('click', 0.8, -10); shakeScreen(state, 3, 2); }
    if (s.breakerT === 120 && s.paLive) paStory(state, 'stars');
    if (s.breakerT === 200) { s.mode = 'ride'; s.breakerT = 999; }
  }
  // (a worker, the lights up and the sled still coming)
  if (!s.yelled && s.x > ACT3_X + 50 && s.k >= 1) { s.yelled = true; sayAt(s, 'm2.space.hand', pickLine(L.WORKER_YELLS), WORKERS[2][0], (trackY(WORKERS[2][0]) ?? GY) - 90); }
  // (the brake run's attendant, him coming far too fast)
  if (!s.braked && s.x > BRAKE_AT - 900) { s.braked = true; sayAt(s, 'm2.space.hand', L.BRAKE_YELL, BRAKE_X - 10, (trackY(BRAKE_X) ?? GY) - 170); }
  // The brake run: from here, a scene
  if (s.x >= BRAKE_AT) { startCrash(state, s); return hands(); }
  // Jump: the sled and him in it (not crawling through the reveal). Pressed a moment early, it goes as he lands; a
  // moment late, off the end of the rail, it still goes
  const jumpNow = !!controls.jump;
  if (jumpNow && !s.jumpWas) s.jumpBuf = JUMP_BUFFER;
  else if (s.jumpBuf > 0) s.jumpBuf--;
  s.jumpWas = jumpNow;
  const canJump = !reveal && (!s.air || s.offRail > 0 && s.offRail <= COYOTE);
  if (s.jumpBuf > 0 && canJump) { s.jumpBuf = 0; s.offRail = 0; s.vy = -JUMP_V; s.air = true; playSound('jump', 0.7); playSound('clang', 0.3, 10); }
  const ty = trackY(s.x);
  if (s.air) {
    if (s.offRail > 0) s.offRail++;
    s.vy += JUMP_G; s.y += s.vy;
    // (down onto the rail: any of its wheels (the front's, the middle, the back's) touching a run, or even a little
    // way into it (the nose clipping the end of the next one), and it's on: snapped onto that run, never through it)
    if (s.vy >= 0) for (const dx of WHEELS) {
      const wx = s.x + dx, wy = trackY(wx);
      if (wy === null || s.y < wy - 1 || s.y > wy + SNAP_IN || s.y - s.vy > wy + SNAP_IN) continue;
      const r = runAt(wx)!;
      // (only a run ahead it's coming down onto: never the one it's just gone off the end of, or it'd catch on that
      // over and over going off a cliff)
      if (dx !== 0 && r[0] <= s.x) continue;
      s.x = Math.max(r[0] + 1, Math.min(r[1] - 1, s.x));
      s.y = trackY(s.x) ?? wy; s.vy = 0; s.air = false; s.offRail = 0;
      playSound('land', 0.8); playSound('clang', 0.5, -2); shakeScreen(state, 4, 2);
      break;
    }
  } else if (ty === null) {
    const r = [...RUNS].reverse().find(q => q[1] < s.x);
    s.vy = r ? ((r[3] - r[2]) / (r[1] - r[0])) * s.speed : 0;
    s.air = true; s.offRail = 1;
  } else s.y = ty;
  if (!s.air) s.railY = s.y;
  // Down a gap: that's him
  if (s.y > s.railY + 320) {
    hurtPlayer(ctx, 9999, 'ride_pit');
    if (p.health <= 0) { p.carried = false; s.mode = 'off'; return controls; }
    const next = RUNS.find(r => r[0] > s.x) ?? RUNS[RUNS.length - 1];
    s.x = next[0] + 20; s.y = s.railY = trackY(s.x) ?? GY; s.vy = 0; s.air = false; s.offRail = 0;
  }
  // Ducked (down held, on the rail; not mid-punch); the blaster (fire)
  s.ducked = !!controls.down && !s.air && !s.punch;
  if (controls.shoot && !reveal) blast(state, s);
  runTricks(ctx, s.tricks, { x: s.x, y: s.y, air: s.air, t: s.t, ducked: s.ducked, speed: s.speed }, kind => firstSight(state, kind));
  place(state, s);
  p.isGrounded = !s.air;
  state.cameraRestY = s.y - SINK - 400;
  p.facing = 1;
  return { ...controls, left: false, right: false, jump: false, charge: false, special: false, ...(s.punch ? { down: false } : {}) };
};

// ---------------------------------------------------------------------------------------------------------------
// THE BRAKE RUN, THE DROP, THE STATION, THE RAM, THE LAUNCH (a scene: skip it all, or none of it)

const startCrash = (state: GameState, s: Sled) => {
  s.mode = 'crash'; s.sceneT = 0; s.ducked = false;
  state.player.inCutscene = true; state.player.isDucking = false;
};
const toDrag = (state: GameState, s: Sled, skipped: boolean) => {
  const p = state.player;
  if (skipped) silenceAll();
  paHush(state);
  s.mode = 'gone'; s.said = null;
  state.stageMemo[LAUNCHED_MEMO] = 'yes';
  p.carried = false; p.cartSeat = false; p.seatPunch = undefined; p.inCutscene = false; p.hidden = false; p.spriteRot = 0;
  p.noSpecials = false; setUi({ noSwitch: false, pauseControls: null });
  releaseWeapon(state);
  state.cameraOverride = null; state.cameraLeadX = 0;
  teleport(state, DOORS.drag.start.x, DOORS.drag.start.y);
  p.facing = 1;
  meatheadSays(state, pickLine(L.MEATHEAD_LANDS));
};
const BLOOD = ['#B91C1C', '#7F1D1D', '#DC2626'];
const gore = (state: GameState, x: number, y: number, n: number, push = 6) => {
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 20, y: y + (Math.random() - 0.5) * 30 }, vel: { x: push * (0.3 + Math.random()), y: -2 - Math.random() * 8 }, life: 40 + Math.random() * 30, color: BLOOD[i % 3], size: 2 + Math.random() * 4, grav: 0.35 });
};

/** Somebody in the station sent flying (once): a big spinning arc (the hard-thrown up through the roof, the rest down on
 *  the floor, a splat and a bounce), their stuff (a hat, a drink, a souvenir) flung off them, a scream now and then. */
const FLUNG = ['#2563EB', '#FDE047', '#F472B6', '#DC2626', '#FFFFFF', '#22C55E'];
const fling = (state: GameState, s: Sled, key: string, x: number, y: number, outfit: Outfit, seed: number, vx: number, vy: number) => {
  if (s.gone.has(key)) return;
  s.gone.add(key);
  const roof = vy < -22;
  s.fliers.push({ x, y, vx, vy, rot: (Math.random() - 0.5) * 0.6, seed, outfit, floor: roof ? undefined : GY - 6 });
  for (let i = 0; i < 2; i++) s.tricks.bits.push({ x: x + (Math.random() - 0.5) * 16, y: y - 50 - Math.random() * 30, vx: vx * (0.4 + Math.random() * 0.8), vy: vy * (0.5 + Math.random() * 0.6), rot: Math.random() * 6, col: FLUNG[(seed + i) % FLUNG.length], w: 6 + Math.random() * 6, h: 5 + Math.random() * 6 });
  gore(state, x, y - 50, 8, vx * 0.6);
  if (s.gone.size % 3 === 1) playSound('screams', 0.5, Math.random() * 6);
  if (s.gone.size % 2 === 0) playSound('crunch', 0.5, Math.random() * 6);
};

const scene = (ctx: FrameContext, s: Sled): Controls => {
  const { state } = ctx, p = state.player, tr = s.tricks;
  s.sceneT++; s.skipT++;
  p.inCutscene = true;
  if (s.skipT > SKIP_AFTER) offerSkip();
  if (s.skipT > SKIP_AFTER && takeSkip()) { toDrag(state, s, true); return hands(); }
  settleTricks(tr);
  // (the flung: arcing, spinning, bleeding; down on the floor a splat and a bounce, then they lie there)
  for (const fl of s.fliers) {
    fl.vy += 0.5; fl.x += fl.vx; fl.y += fl.vy;
    if (fl.floor !== undefined && fl.vy > 0 && fl.y >= fl.floor) {
      fl.y = fl.floor;
      if ((fl.lands ?? 0) < 1) {
        fl.lands = 1; fl.vy = -fl.vy * 0.35; fl.vx *= 0.5;
        gore(state, fl.x, fl.y - 10, 10, 2);
        playSound('splat', 0.6, -2 + Math.random() * 6);
      } else { fl.lands = 2; fl.vy = 0; fl.vx = 0; fl.rot = (Math.PI / 2) * (Math.cos(fl.rot) >= 0 ? 1 : -1); }
    }
    if ((fl.lands ?? 0) < 2) { fl.rot += 0.28; if (state.frame % 2 === 0) gore(state, fl.x, fl.y - 30, 1, 0.5); }
  }
  if (s.flash > 0) s.flash--;
  if (s.mode === 'crash') {
    // (a beat held on each one he hits)
    if (s.hold > 0) { s.hold--; place(state, s); return hands(); }
    // (the fist in the brake control: everything held a few frames, the hit-stop)
    if (s.punch && s.punch.stop > 0) { swing(s, BOX_FACE, true); place(state, s); return hands(); }
    if (!s.boxT && s.x >= FINS_X0 - 30) {
      // An ordinary ride ending. The brake fins grab: sparks off the sled's belly, the grind, down to a crawl, in through
      // the station's mouth to the platform, the PA's spiel; and it stops, dead, right by the brake control
      if (!s.brakeT) {
        s.brakeT = 1; playSound('grind', 1, -6); playSound('clang', 0.8, -8); shakeScreen(state, 8, 4); meatheadSays(state, L.MEATHEAD_BRAKE);
        if (s.paLive) paStory(state, 'unload');
      }
      if (!s.stopT) {
        s.speed = Math.min(Math.max(CRAWL, s.speed - 0.17), Math.max(0.15, (STOP_X - s.x) * 0.04));
        if (state.frame % 9 === 0) playSound('grind', 0.6, -4 + Math.random() * 4);
        if (s.speed > 0.4) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: s.x - 40 + Math.random() * 80, y: s.y - 4 }, vel: { x: -2 - Math.random() * 5, y: -1 - Math.random() * 5 }, life: 14 + Math.random() * 10, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 2, grav: 0.25 });
        // (there: settled, the clunk of it)
        if (s.x + s.speed >= STOP_X) { s.speed = STOP_X - s.x; s.stopT = 1; playSound('thud', 0.7, -6); playSound('clang', 0.4, -12); shakeScreen(state, 3, 2); }
      } else {
        // Stopped. Done. A beat of stillness (the spiel said whole), then his idea: his line, said whole, then the punch
        s.stopT++; s.speed = 0;
        s.quietT = isTalking() || paSaying(state) ? 0 : s.quietT + 1;
        if (!s.idea && s.stopT > STILL_MIN && (s.quietT > 24 || s.stopT > STILL_MAX)) {
          s.idea = true;
          meatheadSays(state, pickLine(L.MEATHEAD_PUNCH_BRAKE), true, () => { s.ideaDone = true; });
        }
        // (never waiting past 6 s on his line)
        if (s.idea && !s.punch && !s.boxT && (s.ideaDone || s.stopT > STILL_MAX + 360)) s.punch = { t: 0, v: 0, stop: 0, done: false };
        if (s.punch && swing(s, BOX_FACE, true)) {
          // The fist in: the brake control caved in, sparking. BRAKE FAILURE, the lamps red. And nothing happens. Yet
          s.boxT = 1;
          panelHit(state, s, BOX_FACE, s.y - SINK - SEAT_PUNCH_UP);
          if (s.paLive) paStory(state, 'brakefail', true);
        }
      }
    } else if (s.boxT) {
      if (s.punch) swing(s, BOX_FACE, true);
      // No brakes. It sits there dead still, sparking (BRAKE FAILURE said whole over the stillness, calmly), then the
      // drive tires kick it from a dead stop to impossibly fast all at once: a jolt, the tires squealing, smoking, the
      // fins ripped off the rail behind, the unload attendant (by the gate) snagged and flung; faster and faster
      const held = s.boxT < BEAT_MIN || ((isTalking() || !!paSaying(state)) && s.boxT < BEAT_MAX);
      if (held) s.speed = 0;
      if (!held && !s.lurchT) {
        s.lurchT = 1; s.speed = LURCH;
        playSound('boom', 1, -10); playSound('ignite', 1, -4); playSound('grind', 1, 10); playSound('clang', 1, -12); playSound('crash', 0.6, 6); playSound('screams', 0.8);
        shakeScreen(state, 18, 9);
        for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: s.x - 50 + Math.random() * 70, y: s.y - 4 }, vel: { x: -4 - Math.random() * 9, y: -1 - Math.random() * 6 }, life: 16 + Math.random() * 14, color: ['#FDE047', '#FFFFFF', '#F97316', '#A1A1AA'][i % 4], size: 2 + Math.random() * 2, grav: 0.25 });
        for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: s.x - 60 + Math.random() * 120, y: s.y - 6 }, vel: { x: -1 - Math.random() * 3, y: -0.5 - Math.random() }, life: 40 + Math.random() * 30, color: 'rgba(212, 212, 216, 0.5)', size: 6 + Math.random() * 6, grav: -0.03 });
        // the fins, ripped up off the rail all along the run
        for (let x = FINS_X0; x < FINS_X1; x += 26) { const ry = trackY(x) ?? GY; tr.bits.push({ x, y: ry - 10, vx: -1 + Math.random() * 6, vy: -6 - Math.random() * 8, rot: Math.random() * 3, col: '#A1A1AA', w: 6, h: 18 }); }
        fling(state, s, 'unload', UNLOAD_OP.x, GY - 22, 'op', UNLOAD_OP.seed, 10, -14);
      }
      if (s.lurchT) { s.lurchT++; s.speed = Math.min(RUNAWAY, s.speed + RUNAWAY_GAIN); }
      if (s.boxT % 50 === 1) playSound('siren', 0.7);
      if (s.lurchT && s.speed > 12) shakeScreen(state, 4, 2);
      if (s.lurchT && state.frame % 3 === 0) playSound('rumble', 0.5, 4);
      // (the line, behind its rail: sent flying as it goes by them)
      if (s.lurchT) QUEUE.forEach((q, j) => { if (s.x + 90 > q.x) fling(state, s, `q${j}`, q.x, q.y, 'guest', q.seed, 6 + Math.random() * 8, -11 - Math.random() * 10); });
    }
    if (s.boxT) s.boxT++;
    if (s.brakeT) s.brakeT++;
    s.x += s.speed;
    s.y = trackY(s.x) ?? s.y;
    // Everybody on the track in the station: flattened (the beat held, the blood)
    STATION_FOLK.forEach((v, i) => {
      if (s.flat.has(i) || s.x + 80 < v.x) return;
      s.flat.add(i); s.hold = 3;
      s.fliers.push({ x: v.x, y: GY, vx: 7 + Math.random() * 6, vy: -12 - Math.random() * 8, rot: 0, seed: v.seed, outfit: v.outfit, floor: GY });
      gore(state, v.x, GY - 50, 34, 8);
      playSound('splat', 1, -4 + i); playSound('crunch', 0.9); playSound('gorespray', 0.7); if (i === 0 || i === 2) playSound('screams', 0.8);
      shakeScreen(state, 10, 5);
    });
    // THE RAM
    if (s.x >= FRONT_AT - 150) {
      s.mode = 'up'; s.sceneT = 0;
      playSound('crash', 1, -10); playSound('boom', 0.8, -8); playSound('splat', 0.6); shakeScreen(state, 18, 8);
      meatheadSays(state, L.MEATHEAD_RAM, false);
      // (the rest of the line and the operator: blown off their feet, some up through the roof)
      QUEUE.forEach((q, j) => fling(state, s, `q${j}`, q.x, q.y, 'guest', q.seed, 4 + Math.random() * 9, -14 - Math.random() * 12));
      fling(state, s, 'op', CONSOLE_OP_X, GY, 'op', OP_SEED, 7, -20);
      s.front = { x: FRONT_AT, y: GY, rot: 0, vy: -16 };
      s.fliers.push({ x: FRONT_AT + SEATS[0], y: GY - 40, vx: 6, vy: -19, rot: 0, seed: 8811, outfit: 'guest' }, { x: FRONT_AT + SEATS[1], y: GY - 40, vx: 5, vy: -18, rot: 0, seed: 9922, outfit: 'guest' });
      s.vy = -15; p.cartSeat = false;
    }
    place(state, s);
    // (the camera: well ahead of it, the station in front of it)
    state.cameraOverride = { x: s.x - 130, y: Math.min(GY - 430, s.y - 330) };
    return hands();
  }
  if (s.mode === 'up') {
    // Up through the station's roof, all of them
    s.vy += 0.25; s.y += s.vy; s.x += 4;
    if (s.front) { s.front.vy += 0.25; s.front.y += s.front.vy; s.front.x += 5; s.front.rot += 0.12; }
    const top = s.fliers[s.fliers.length - 2];
    if (!s.frontGone && top && top.y < STATION_ROOF) { s.frontGone = true; playSound('crash', 1, -12); playSound('crumble', 0.8); shakeScreen(state, 10, 5); }
    p.pos.x = s.x + SEAT - p.width / 2; p.pos.y = s.y - SINK - p.height - Math.min(40, s.sceneT * 2); p.spriteRot = (p.spriteRot ?? 0) + 0.25;
    state.cameraOverride = { x: FRONT_AT - 420, y: Math.min(GY - 450, s.y - 300) };
    if (s.sceneT > 60) { s.mode = 'out'; s.sceneT = 0; p.hidden = true; }
    return hands();
  }
  if (s.mode === 'out') {
    if (s.sceneT === OUT_SPLAT) { playSound('splat', 1, -6); playSound('gorespray', 0.8); playSound('crunch', 0.9); shakeScreen(state, 8, 4); }
    if (s.sceneT === OUT_SPLAT + 8) { playSound('crash', 0.8, -4); }
    if (s.sceneT === OUT_LAND_ME) { playSound('thud', 1, -8); playSound('land', 1); shakeScreen(state, 6, 3); }
    if (s.sceneT >= OUT_END) toDrag(state, s, false);
    return hands();
  }
  return hands();
};

// ---------------------------------------------------------------------------------------------------------------

const run = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  const s = sledOf(state);
  if (p.health <= 0) { p.carried = false; return controls; }
  // (back again, from the platform: a second ride, the warehouse's)
  if (s.mode === 'gone') { if (p.inCutscene) return controls; Object.assign(s, fresh(state)); }
  if (s.mode === 'off') board(state, s);
  p.noSpecials = true; setUi({ noSwitch: true, pauseControls: 'sled' });
  // (the space blaster comes out of his ray gun: that's what's in his hands, the whole ride)
  forceWeapon(state, 'GUN');
  if (s.mode === 'crash' || s.mode === 'up' || s.mode === 'out') return scene(ctx, s);
  // (the faster it goes, the further ahead the camera looks: what is coming is on screen sooner)
  s.lead += (150 + Math.max(0, s.speed - 4.3) * 24 - s.lead) * 0.04;
  state.cameraLeadX = s.lead;
  return riding(ctx, s, controls);
};

/** The sled (his, and the one in front at the station), and who's in them. */
const drawSleds = (c: CanvasRenderingContext2D, state: GameState, back: boolean) => {
  const s = sledOf(state), f = state.frame, lit = s.k > 0.5;
  const cam = state.camera.x;
  // (the one in front, at the platform, loaded: till he's into the back of it)
  if (FRONT_AT > cam - 200 && FRONT_AT < cam + CANVAS_WIDTH + 200 || s.front) {
    const fr = s.front ?? { x: FRONT_AT, y: GY, rot: 0 };
    if (s.mode !== 'out') {
      drawSled(c, fr.x, fr.y, f, FRONT_SLED, back, fr.rot, lit);
      if (!back && !s.front) for (const [i, seed] of [[0, 8811], [1, 9922]] as const) seatedIn(c, FRONT_AT + SEATS[i], GY, g => drawAtomPerson(g, 'guest', { seed, f, pose: s.boxT > 0 ? 'after' : 'stand', md: 'ok' }));
      if (!back) drawSled(c, fr.x, fr.y, f, FRONT_SLED, false, fr.rot, lit);
    }
  }
  if (back) {
    // (the station's people, on the track: wide-eyed once it's coming)
    if (cam + CANVAS_WIDTH > STATION_FOLK[0].x - 100) STATION_FOLK.forEach((v, i) => {
      if (s.flat.has(i)) return;
      const seen = s.boxT > 0;
      c.save(); c.translate(v.x, GY); if (i % 2) c.scale(-1, 1);
      drawAtomPerson(c, v.outfit, { seed: v.seed, f, pose: seen ? 'after' : 'stand', md: 'ok' });
      c.restore();
      if (v.paddle) { box(c, v.x - 30, GY - 70, 4, 40, '#1C1917'); box(c, v.x - 40, GY - 92, 24, 24, '#1C1917'); box(c, v.x - 38, GY - 90, 20, 20, '#FACC15'); }
    });
  }
  if (!back) for (const fl of s.fliers) { c.save(); c.translate(fl.x, fl.y); c.rotate(fl.rot); drawAtomPerson(c, fl.outfit, { seed: fl.seed, f, pose: 'thrown', md: 'hurt' }); c.restore(); }
  if (s.mode === 'off' || s.mode === 'gone' || s.mode === 'out') return;
  const rot = sledRot(s);
  drawSled(c, s.x, s.y, f, HIS_SLED, back, rot, lit);
};

/** (the runaway: speed lines across the screen, thicker the faster) */
const drawSpeedLines = (c: CanvasRenderingContext2D, state: GameState, speed: number) => {
  if (speed < 9) return;
  const k = Math.min(1, (speed - 9) / 14), f = state.frame;
  c.save(); c.globalAlpha = 0.25 + k * 0.4;
  for (let i = 0; i < 26; i++) {
    const y = ((i * 97 + f * 13) % CANVAS_HEIGHT), len = 60 + ((i * 53) % 140) * (0.5 + k), x = ((i * 211 - f * (speed * 3)) % (CANVAS_WIDTH + 300) + CANVAS_WIDTH + 300) % (CANVAS_WIDTH + 300) - 150;
    box(c, x, y, len, i % 3 ? 2 : 3, i % 4 ? '#F8FAFC' : '#FDE047');
  }
  c.restore();
};

export const ride: SpaceSection = {
  id: 'ride', x0, x1,
  checkpoints: [
    { name: 'THE VOYAGE TO 2010', cp: 20, x: R + 150, y: GY },
    { name: 'THE LIFT', cp: 21, x: R + 6100, y: GY - 10 },
    { name: 'DEEP SPACE', cp: 22, x: R + 10600, y: GY - 620 },
    { name: 'THE WAREHOUSE', cp: 23, x: R + 13400, y: GY - 330 },
  ],
  build: (state) => {
    // (the launch's outside shot: its still layers painted ahead, in idle moments)
    prewarmLaunch();
    // (the track's own ground, under the workers on it; the gaps go down to nothing)
    const n0 = state.blocks.length;
    lay(state, RUNS.map(([a, b, ya, yb]) => ({ x1: a, y1: ya, x2: b, y2: yb, surface: 'metal' as const })));
    for (let i = n0; i < state.blocks.length; i++) state.blocks[i].hidden = true;
    // (a fresh start in the warehouse (the cheat's): the breaker's already gone)
    if (state.checkpoint >= 23) state.stageMemo[BREAKER_MEMO] = 'yes';
    if (state.checkpoint >= 30) state.stageMemo[LAUNCHED_MEMO] = 'yes';
    WORKERS.forEach(([x, v], i) => {
      const e = makeKindEnemy(ATOM.worker as EnemyKind, x, trackY(x) ?? GY);
      e.variant = v; e.homeX = e.pos.x + i; e.facing = -1; homeFacing.set(e, i % 2 ? 1 : -1);
      state.enemies.push(e);
    });
  },
  update: (ctx, controls) => {
    const out = run(ctx, controls);
    const p = ctx.state.player, s = sledOf(ctx.state);
    setUi({ introCutscene: !!p.inCutscene });
    p.cartSeat = p.carried && p.health > 0 && (s.mode === 'ride' || s.mode === 'reveal' || s.mode === 'crash');
    if ((s.mode === 'ride' || s.mode === 'reveal' || s.mode === 'crash') && p.carried) p.spriteRot = s.air ? 0 : slopeAt(s.x) ?? 0;
    else if (s.mode !== 'up') p.spriteRot = 0;
    // (his own gun's not fired, sat in it: the blaster's the sled's, handled in riding)
    // (the haymaker, sat in it: the pose follows the punch)
    p.seatPunch = p.cartSeat && s.punch ? s.punch.v : undefined;
    if (p.cartSeat) return { ...out, shoot: false, secondary: false };
    return out;
  },
  cameraRow: () => 430,
  drawBackdrop: (c, state) => drawRideBackdrop(c, state, look(state)),
  drawBack: (c, state) => { drawRideBack(c, state, look(state)); drawSleds(c, state, true); },
  drawFront: (c, state) => {
    drawSleds(c, state, false); drawRideFront(c, state, look(state));
    const s = sledOf(state);
    drawBlaster(c, state, s.tricks, state.player);
    // (the fist going in: a white flash, a starburst, where it hit)
    if (s.flash > 0) drawPunchFlash(c, s.flashX, s.flashY, s.flash);
    // (the PA's words, over the speaker in his headrest; the others', over them)
    const pa = paSaying(state);
    if (pa && s.mode !== 'out' && s.mode !== 'gone') saidOver(c, pa.text, s.x + SEAT - 22, s.y - 168, '#A5F3FC', 300);
    if (s.said) saidOver(c, s.said.text, s.saidX, s.saidY, '#FDE68A');
  },
  lighting: (state) => rideLighting(state, look(state)),
  drawHud: (c, state) => {
    const s = sledOf(state);
    if (s.mode === 'crash') drawSpeedLines(c, state, s.speed);
    if (s.mode === 'out') drawLaunchOutside(c, state, s.sceneT);
    if ((s.mode === 'crash' || s.mode === 'up' || s.mode === 'out') && s.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  },
};

// (dev: the bot in the headless checks reads the layout, and what it should press)
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  (window as unknown as { __ride: unknown }).__ride = {
    R, OBS, GAPS, PA_CUES, trackY, speedAt,
    /** What a player who reads every cue right presses, now. */
    botWants: (s: Sled) => {
      const want = { duck: false, jump: false, blast: false, gap: false };
      for (const o of OBS) {
        const d = o.x - s.x;
        if (o.verb === 'duck' && d > -60 && d < 140) want.duck = true;
        if (o.verb === 'jump' && d > 110 && d < 110 + s.speed * 6) want.jump = true;
        if (o.verb === 'blast' && d > 0 && d < 520 && !s.tricks.broken.has(OBS.indexOf(o))) want.blast = (s.t >> 1) % 2 === 0;
      }
      for (const [a] of GAPS) { const d = a - s.x; if (d > 0 && d < 40 + s.speed * 3) want.jump = want.gap = true; }
      if (want.jump) want.duck = false;
      return want;
    },
  };
}
