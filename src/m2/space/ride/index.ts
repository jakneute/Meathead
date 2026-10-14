// THE RIDE: section 3 of Space Land (owner: the atom agent). The hijacked star sled on the Voyage to 2010 (like
// Adventure Land's mine cart, not the same): jump (the sled and him in it), duck, on a bit (right) or held back (left).
// The ride's PA (pa.ts: a cheesy upbeat 1990 corporate narrator, never updated) tells him what 2010 will bring, all of it
// wrong. ACT 1, the dark ride, slow: the scenes of 2010; satellites hung low, Robo-Butler's tray, the track not built
// yet. The chain lift up into the dome. ACT 2, space, fast: laser curtains (time them, or duck or jump the bands), meteors
// lowered onto the track, a rocket's exhaust, the drops and the gaps. Then the MAIN BREAKER: the sled smashes it, and
// the work lights bang on bank by bank (the sled crawls through it: it's all in view). It's a warehouse. ACT 3, the
// warehouse version, the show dead and the PA still going: workers on the track (run them down), the forklift's
// pallet, the ladder, the meteor on a hand hoist. THE BRAKE RUN (a scene from here): through the brake controls, no
// brakes, back into the station he left from, into the back of the sled in front, loading: up through the station's
// roof, out through the atom's shell (the outside shot: launch.ts), over the main drag. They're a smear. He's fine: on
// to the drag (DOORS.drag.start).
//
// Kept across his deaths and on fresh starts (state.stageMemo): the breaker (layout.ts BREAKER_MEMO: from checkpoint 23
// on it's gone), the launch (LAUNCHED_MEMO: the drag draws the smear). One-way: coming back in from the drag puts him at
// the atom's load platform (DOORS.ride.end), the sled waiting; a second ride is the warehouse version all the way, the
// show and the PA dead.
//
// ~16000 px of track: about 70 s of riding plus the reveal, ~45 s of scenes (the brake run, the launch). Checkpoints 20-23.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { EnemyKind } from '../../../m1/types';
import type { SpaceSection } from '../section';
import { lay, hands, speak, meatheadSays, saidOver, sectionState, teleport, type Said } from '../section';
import { GY, DOORS } from '../geometry';
import { setUi } from '../../store';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { ATOM, homeFacing } from '../atom/kinds';
import { drawAtomPerson } from '../atom/people';
import {
  x0, x1, R, RUNS, BREAKER_X, ACT3_X, BRAKE_AT, BRAKE_X, FRONT_AT, STATION_ROOF, WORKERS, PA_CUES, speedAt, trackY, slopeAt,
  BREAKER_MEMO, LAUNCHED_MEMO, lightsOn,
} from './layout';
import { type Tricks, newTricks, runTricks } from './tricks';
import { paStory, paSaying, paHush } from './pa';
import { drawSled, seatedIn, HIS_SLED, FRONT_SLED, SEATS, SLED_SINK } from './sled';
import { drawRideBackdrop, drawRideBack, drawRideFront, drawPallet, rideLighting, type RideLook } from './art';
import { drawLaunchOutside, OUT_END, OUT_SPLAT, OUT_LAND_ME } from './launch';
import * as L from './lines';

const SINK = SLED_SINK;
/** (where his feet sit in it, from the sled's middle: the front seat) */
const SEAT = SEATS[0];

interface Flyer { x: number; y: number; vx: number; vy: number; rot: number; seed: number }
interface Sled {
  mode: 'off' | 'ride' | 'reveal' | 'crash' | 'up' | 'out' | 'gone';
  x: number; y: number; railY: number; vy: number; speed: number; air: boolean; jumpWas: boolean; t: number; lead: number;
  tricks: Tricks;
  /** The work lights (0 the show, 1 on), frames since the breaker went; the brake booth, frames since. */
  k: number; breakerT: number; brakeT: number;
  /** The PA's on (not on a second ride: the power's out). */
  paLive: boolean; cued: Set<string>; yelled: boolean;
  /** The scene: frames into it; the sled in front (gone through the roof); who's flying up through it. */
  sceneT: number; frontGone: boolean; fliers: Flyer[]; front: { x: number; y: number; rot: number; vy: number } | null;
  said: Said | null; saidX: number; saidY: number;
  /** Frames since the scene started (all of it: the skip's offered from SKIP_AFTER on). */
  skipT: number;
}
const fresh = (state: GameState): Sled => ({
  mode: 'off', x: R + 150, y: GY, railY: GY, vy: 0, speed: 0, air: false, jumpWas: false, t: 0, lead: 150, tricks: newTricks(),
  k: lightsOn(state) ? 1 : 0, breakerT: lightsOn(state) ? 999 : 0, brakeT: 0, paLive: !state.stageMemo[LAUNCHED_MEMO], cued: new Set(), yelled: false,
  sceneT: 0, frontGone: false, fliers: [], front: null, said: null, saidX: 0, saidY: 0, skipT: 0,
});
const sledOf = (state: GameState) => sectionState<Sled, 'ride'>(state, 'ride', () => fresh(state));
const look = (state: GameState): RideLook => {
  const s = sledOf(state);
  return { k: s.k, tricks: s.tricks, breakerT: s.breakerT, brakeT: s.brakeT, sledX: s.x, sledY: s.y, frontGone: s.frontGone };
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
const firstSight = (state: GameState, kind: string) => {
  const key = `m2:rideSaw:${kind}`;
  if (state.stageMemo[key] || !L.SEES[kind]) return;
  state.stageMemo[key] = 'yes';
  meatheadSays(state, pickLine(L.SEES[kind]));
};
const sayAt = (s: Sled, voiceId: string, text: string, x: number, y: number) => {
  s.saidX = x; s.saidY = y;
  speak(voiceId, text, v => { s.said = v; }, true);
};

// ---------------------------------------------------------------------------------------------------------------
// Riding

const riding = (ctx: FrameContext, s: Sled, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  s.t++;
  const reveal = s.mode === 'reveal';
  const want = reveal ? 1.3 : speedAt(s.x, !!controls.right, !!controls.left);
  s.speed += (Math.min(want, s.t / 6) - s.speed) * (reveal ? 0.08 : 0.06);
  s.x += s.speed;
  // The PA's stories, as it gets to each
  if (s.paLive) for (const [id, x] of PA_CUES) if (!s.cued.has(id) && s.x >= x) { s.cued.add(id); paStory(state, id); }
  // The breaker: smashed, and the lights come up, bank by bank
  if (s.breakerT === 0 && s.x >= BREAKER_X - 30) {
    s.breakerT = 1; s.mode = 'reveal'; state.stageMemo[BREAKER_MEMO] = 'yes';
    playSound('crash', 1, -6); playSound('clang', 1, -10); playSound('ignite', 0.6, 8); shakeScreen(state, 12, 6);
    for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: BREAKER_X, y: s.y - 100 }, vel: { x: 2 + Math.random() * 6, y: -Math.random() * 6 }, life: 30, color: i % 2 ? '#FDE047' : '#E0F2FE', size: 2 });
  }
  if (s.breakerT > 0 && s.breakerT < 999) {
    s.breakerT++;
    // (thunk, thunk, thunk, thunk: the banks of work lights)
    for (const [at, k] of [[30, 0.25], [55, 0.5], [80, 0.75], [105, 1]] as const) if (s.breakerT === at) { s.k = k; playSound('thud', 1, -14); playSound('click', 0.8, -10); shakeScreen(state, 3, 2); }
    if (s.breakerT === 120 && s.paLive) paStory(state, 'stars');
    if (s.breakerT === 200) { s.mode = 'ride'; s.breakerT = 999; }
  }
  // (a worker, the lights up and the sled still coming)
  if (!s.yelled && s.x > ACT3_X + 50 && s.k >= 1) { s.yelled = true; sayAt(s, 'm2.space.hand', pickLine(L.WORKER_YELLS), WORKERS[2][0], (trackY(WORKERS[2][0]) ?? GY) - 90); }
  // The brake run: from here, a scene
  if (s.x >= BRAKE_AT) { startCrash(state, s); return hands(); }
  // Jump: the sled and him in it (not on the lift's chain, not crawling through the reveal)
  const jumpNow = !!controls.jump;
  if (jumpNow && !s.jumpWas && !s.air && !reveal) { s.vy = -10.5; s.air = true; playSound('jump', 0.7); playSound('clang', 0.3, 10); }
  s.jumpWas = jumpNow;
  const ty = trackY(s.x);
  if (s.air) {
    s.vy += 0.5; s.y += s.vy;
    if (ty !== null && s.vy >= 0 && s.y >= ty && s.y - s.vy <= ty + 16) { s.y = ty; s.vy = 0; s.air = false; playSound('land', 0.8); playSound('clang', 0.5, -2); shakeScreen(state, 4, 2); }
  } else if (ty === null) {
    const r = [...RUNS].reverse().find(q => q[1] < s.x);
    s.vy = r ? ((r[3] - r[2]) / (r[1] - r[0])) * s.speed : 0;
    s.air = true;
  } else s.y = ty;
  if (!s.air) s.railY = s.y;
  // Down a gap: that's him
  if (s.y > s.railY + 320) {
    hurtPlayer(ctx, 9999, 'ride_pit');
    if (p.health <= 0) { p.carried = false; s.mode = 'off'; return controls; }
    const next = RUNS.find(r => r[0] > s.x) ?? RUNS[RUNS.length - 1];
    s.x = next[0] + 20; s.y = s.railY = trackY(s.x) ?? GY; s.vy = 0; s.air = false;
  }
  runTricks(ctx, s.tricks, { x: s.x, y: s.y, air: s.air, t: s.t }, kind => firstSight(state, kind));
  place(state, s);
  p.isGrounded = !s.air;
  state.cameraRestY = s.y - SINK - 400;
  p.facing = 1;
  return { ...controls, left: false, right: false, jump: false, charge: false, special: false };
};

// ---------------------------------------------------------------------------------------------------------------
// THE BRAKE RUN, THE RAM, THE LAUNCH (a scene: skip it all, or none of it)

const startCrash = (state: GameState, s: Sled) => {
  s.mode = 'crash'; s.sceneT = 0;
  state.player.inCutscene = true; state.player.isDucking = false;
  sayAt(s, 'm2.space.hand', L.BRAKE_YELL, BRAKE_X + 40, (trackY(BRAKE_X) ?? GY) - 140);
};
const toDrag = (state: GameState, s: Sled, skipped: boolean) => {
  const p = state.player;
  if (skipped) silenceAll();
  paHush(state);
  s.mode = 'gone'; s.said = null;
  state.stageMemo[LAUNCHED_MEMO] = 'yes';
  p.carried = false; p.cartSeat = false; p.inCutscene = false; p.hidden = false; p.spriteRot = 0;
  p.noSpecials = false; setUi({ noSwitch: false });
  state.cameraOverride = null; state.cameraLeadX = 0;
  teleport(state, DOORS.drag.start.x, DOORS.drag.start.y);
  p.facing = 1;
  meatheadSays(state, pickLine(L.MEATHEAD_LANDS));
};

const scene = (ctx: FrameContext, s: Sled): Controls => {
  const { state } = ctx, p = state.player;
  s.sceneT++; s.skipT++;
  p.inCutscene = true;
  if (s.skipT > SKIP_AFTER) offerSkip();
  if (s.skipT > SKIP_AFTER && takeSkip()) { toDrag(state, s, true); return hands(); }
  if (s.mode === 'crash') {
    // Through the booth, no brakes, faster and faster into the station
    s.speed = Math.min(12, s.speed + (s.brakeT ? 0.12 : 0));
    s.x += s.speed;
    s.y = trackY(s.x) ?? s.y;
    if (!s.brakeT && s.x >= BRAKE_X - 50) {
      s.brakeT = 1; playSound('crash', 1, -4); playSound('glass', 0.9); playSound('grind', 0.8, -4); shakeScreen(state, 12, 6);
      for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: BRAKE_X, y: s.y - 60 }, vel: { x: 3 + Math.random() * 7, y: -2 - Math.random() * 6 }, life: 40, color: ['#0F766E', '#BAE6FD', '#FDE047'][i % 3], size: 2 + Math.random() * 3, grav: 0.3, chunk: true });
      meatheadSays(state, L.MEATHEAD_BRAKE);
    }
    if (s.brakeT) s.brakeT++;
    if (s.x >= FRONT_AT - 700 && !s.cued.has('scream')) { s.cued.add('scream'); sayAt(s, 'm2.guest2', L.FRONT_SCREAM, FRONT_AT, GY - 100); }
    // THE RAM
    if (s.x >= FRONT_AT - 150) {
      s.mode = 'up'; s.sceneT = 0;
      playSound('crash', 1, -10); playSound('boom', 0.8, -8); playSound('splat', 0.6); shakeScreen(state, 18, 8);
      meatheadSays(state, L.MEATHEAD_RAM, false);
      s.front = { x: FRONT_AT, y: GY, rot: 0, vy: -16 };
      s.fliers = [{ x: FRONT_AT + SEATS[0], y: GY - 40, vx: 6, vy: -19, rot: 0, seed: 8811 }, { x: FRONT_AT + SEATS[1], y: GY - 40, vx: 5, vy: -18, rot: 0, seed: 9922 }];
      s.vy = -15; p.cartSeat = false;
    }
    place(state, s);
    state.cameraLeadX = 120;
    return hands();
  }
  if (s.mode === 'up') {
    // Up through the station's roof, all of them
    s.vy += 0.25; s.y += s.vy; s.x += 4;
    for (const f of s.fliers) { f.vy += 0.25; f.x += f.vx; f.y += f.vy; f.rot += 0.3; }
    if (s.front) { s.front.vy += 0.25; s.front.y += s.front.vy; s.front.x += 5; s.front.rot += 0.12; }
    if (!s.frontGone && s.fliers[0].y < STATION_ROOF) { s.frontGone = true; playSound('crash', 1, -12); playSound('crumble', 0.8); shakeScreen(state, 10, 5); }
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
  p.noSpecials = true; setUi({ noSwitch: true });
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
      if (!back && !s.fliers.length) for (const [i, seed] of [[0, 8811], [1, 9922]] as const) seatedIn(c, FRONT_AT + SEATS[i], GY, g => drawAtomPerson(g, 'guest', { seed, f, pose: 'after', md: 'ok', talk: s.said?.text === L.FRONT_SCREAM }));
      if (!back) drawSled(c, fr.x, fr.y, f, FRONT_SLED, false, fr.rot, lit);
    }
  }
  if (!back) for (const fl of s.fliers) { c.save(); c.translate(fl.x, fl.y); c.rotate(fl.rot); drawAtomPerson(c, 'guest', { seed: fl.seed, f, pose: 'thrown', md: 'hurt' }); c.restore(); }
  if (s.mode === 'off' || s.mode === 'gone' || s.mode === 'out') return;
  const rot = s.mode === 'up' ? -0.4 - s.sceneT * 0.05 : s.air ? Math.max(-0.3, Math.min(0.3, s.vy * 0.03)) : slopeAt(s.x) ?? 0;
  drawSled(c, s.x, s.y, f, HIS_SLED, back, rot, lit);
};

export const ride: SpaceSection = {
  id: 'ride', x0, x1,
  checkpoints: [
    { name: 'THE VOYAGE TO 2010', cp: 20, x: R + 150, y: GY },
    { name: 'THE LIFT', cp: 21, x: R + 6100, y: GY - 10 },
    { name: 'DEEP SPACE', cp: 22, x: R + 10600, y: GY - 620 },
    { name: 'THE WAREHOUSE', cp: 23, x: R + 13400, y: GY - 270 },
  ],
  build: (state) => {
    // (the track's own ground, under the workers on it; the gaps go down to nothing)
    const n0 = state.blocks.length;
    lay(state, RUNS.map(([a, b, ya, yb]) => ({ x1: a, y1: ya, x2: b, y2: yb, surface: 'metal' as const })));
    for (let i = n0; i < state.blocks.length; i++) state.blocks[i].hidden = true;
    // (a fresh start in the warehouse (the cheat's): the breaker's already gone)
    if (state.checkpoint >= 23) state.stageMemo[BREAKER_MEMO] = 'yes';
    if (state.checkpoint >= 30) state.stageMemo[LAUNCHED_MEMO] = 'yes';
    WORKERS.forEach(([x, v], i) => {
      // (the warehouse's: not there on the show's first go till it's the warehouse... they're always there, in the dark too)
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
    if ((s.mode === 'ride' || s.mode === 'reveal') && p.carried) p.spriteRot = s.air ? 0 : slopeAt(s.x) ?? 0;
    else if (s.mode !== 'up') p.spriteRot = 0;
    if (p.cartSeat) return { ...out, shoot: false, secondary: false };
    return out;
  },
  cameraRow: () => 430,
  drawBackdrop: (c, state) => drawRideBackdrop(c, state, look(state)),
  drawBack: (c, state) => { drawRideBack(c, state, look(state)); drawSleds(c, state, true); },
  drawFront: (c, state) => {
    drawSleds(c, state, false); drawPallet(c, state); drawRideFront(c, state, look(state));
    const s = sledOf(state);
    // (the PA's words, over the speaker in his headrest; the others', over them)
    const pa = paSaying(state);
    if (pa && s.mode !== 'out' && s.mode !== 'gone') saidOver(c, pa.text, s.x + SEAT - 22, s.y - 168, '#A5F3FC', 300);
    if (s.said) saidOver(c, s.said.text, s.saidX, s.saidY, '#FDE68A');
  },
  lighting: (state) => rideLighting(state, look(state)),
  drawHud: (c, state) => {
    const s = sledOf(state);
    if (s.mode === 'out') drawLaunchOutside(c, state, s.sceneT);
    if ((s.mode === 'crash' || s.mode === 'up' || s.mode === 'out') && s.skipT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  },
};
