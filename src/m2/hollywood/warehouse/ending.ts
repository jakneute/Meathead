// The ending (the user's): the last of the cast dead, Meathead says "BETTER CLEAN UP THE BODIES." Cut: the bodies are
// all in one big pile; a beat on it (the user's: a comic one), the camera in on it, panning slowly up it: the shield
// rolls off the top, down onto the floor, and spins down flat like a dropped coin; the hammer slides off the other side
// and lands on the floor squeaking (a rubber prop); last, up top, a hand sticking up out of it twitches, and flops.
// He's in the bulldozer that happens to be parked at the back of the stage; it rumbles up and
// shoves the pile along the stage, and as it gets to the script's case at the back of the stage the camera PUSHES IN on
// it (the playtest notes): the pile slams into the plinth, the case goes over, the glass goes, the pages go up and out
// over the crowd at the fallen walls (the leak, the most devastating thing he's done). Back out, and it CRASHES THROUGH
// THE FAR WALL. Cut to outside, at the lot's start (geometry.ts LOT_WALL_BREAK, LOT_DUMPSTER: the lot owner's set
// piece): the dust out of the hole, the bodies tumbling out of it into the dumpster, the pages blowing down the lot; the
// dust settles on the bulldozer, crashed into the dumpster's end, and he hops down. He's in the lot.
//
// The tragedy's the leak, not the cast (the user's): a studio executive stands at the back of the stage by the script,
// on his phone (they own the faces: CGI, AI), well out of the bulldozer's way, never a look at the bodies going past;
// the case goes, the pages fly, and he loses it; the AD panics on the bullhorn, the public grabs pages; outside he comes
// out of the hole after them and rants (the cast we can replace; the script was the only copy) under the bodies flying
// into the dumpster, never a look, and runs off after the pages. Then he hops down and shrugs. One speaker at a time
// (all queued, in turn).
//
// A cutscene: HUD hidden (inCutscene), SKIP >> for the lot (all or nothing). Kept across his deaths: LEAK_MEMO (the far
// wall open, the case down and empty, the bodies gone, the bulldozer outside).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { silenceAll, pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hands, meatheadSays, box, saidOver } from '../section';
import { outOf } from '../blvd/state';
import { SECTIONS, LOT_WALL_BREAK, LOT_DUMPSTER } from '../geometry';
import { INK, checker, mix, poly, stamp, pixelBlob, board, plain } from '../blvd/kit';
import { bodyOf, legs, arm, torso, part, px, dk, headShape, faceOn } from '../../spooky/costume';
import { X, GY, BACK_Y, PILE_X, DOZER_X, DOZER_START, CASE_X, FAR_WALL, ARENA_CAM, LEAK_MEMO, CAST_MEMO } from './layout';
import { whOf } from './state';
import { drawBody, CAST } from './cast';
import { CLEAN_UP, CROWD_PAGES, SHRUG, AD_LEAK, EXEC_PHONE, EXEC_SEES, EXEC_RANT } from './lines';
import { crowdSay, adSay, execSay } from './talk';

type Ctx = CanvasRenderingContext2D;

const LOT0 = SECTIONS.lot.x0;
/** The bulldozer: its blade's front off its middle; the heap's half width (its rows), its rows. */
const BLADE = 124, HALF = 90, ROWS = [8, 6, 4, 3, 1], SPACE = 22;
/** Where the bodies come out of the hole, and where they come down (into the dumpster, under its rim). */
const OUT = { x: LOT_WALL_BREAK.hole.x1 - 30, y: GY - 80 };
const RIM = GY - 132;
/** The exec: where he stands at the back of the stage (by the script, past it: never in the bulldozer's way), how big
 *  he's drawn back there; where he stands to rant outside. */
const EX_BACK_X = CASE_X + 85, EX_BACK = 0.82, EX_RANT_X = LOT0 + 210;
/** The push in on the case: where on it, how far in. */
const CASE_FOCUS = { y: BACK_Y - 80 }, ZOOM_IN = 1.25;
/** The beat on the pile: how long; how far in; the pile's top (off the floor); the shield's size. */
const PILE_T = 160, PILE_ZOOM = 0.8, TOP = 86, SR = 13;

export const leaked = (state: GameState) => !!state.stageMemo[LEAK_MEMO];
/** Going (from the line to the hop down). */
export const endingOn = (state: GameState) => { const ph = whOf(state).ending.phase; return ph !== 'off' && ph !== 'done'; };
/** Where the bulldozer is (its middle), or null: gone out through the far wall. */
export const dozerX = (state: GameState) => {
  const E = whOf(state).ending;
  if (leaked(state) || E.phase === 'lot' || E.phase === 'done') return null;
  return E.phase === 'drive' || E.phase === 'pile' || (E.phase === 'cut' && E.heap.length) ? E.dx : X(DOZER_X);
};
/** The case: knocked over (empty, smashed) or still up. */
export const caseDown = (state: GameState) => leaked(state) || whOf(state).ending.caseDown;
/** How far over the case has gone (0 up .. 1 on its side). */
export const caseTip = (state: GameState) => (leaked(state) ? 1 : whOf(state).ending.caseDown ? Math.min(1, whOf(state).ending.caseT / 16) : 0);
/** Through the far wall (the hole's there). */
export const wallOpen = (state: GameState) => leaked(state) || whOf(state).ending.wallHit;

export const startEnding = (state: GameState) => {
  const E = whOf(state).ending;
  if (E.phase !== 'off' || leaked(state)) return;
  E.phase = 'say'; E.t = 0; E.all = 0; E.said = false;
  state.player.inCutscene = true;
  meatheadSays(state, CLEAN_UP, true, () => { E.said = true; });
};

/** Its middle's seat: his feet in the cab. */
const seat = (state: GameState, dx: number) => {
  const p = state.player;
  p.pos.x = dx - 34 - p.width / 2; p.pos.y = GY - 96 - p.height; p.vel.x = 0; p.vel.y = 0; p.facing = 1;
};
/** The cut: every body heaped up in one big pile; him up in the bulldozer; the exec at the back on his phone. */
const heapUp = (state: GameState) => {
  const o = whOf(state), E = o.ending, F = o.fight, p = state.player;
  const who = F.bodies.length ? F.bodies.map(b => b.i) : Array.from({ length: 22 }, (_, i) => i);
  E.heap = []; let n = 0;
  ROWS.forEach((count, r) => {
    for (let k = 0; k < count && n < who.length; k++, n++) E.heap.push({ i: who[n], ox: (k - (count - 1) / 2) * SPACE + ((n * 7) % 9) - 4, oy: r * 14, dir: (n % 2 ? 1 : -1) as 1 | -1 });
  });
  E.heapX = X(PILE_X); E.dx = X(DOZER_START); E.v = 0;
  F.bodies = []; o.castSaid.clear();
  p.hidden = false; p.carried = true; p.cartSeat = true; p.isCharging = false; p.isSliding = false; p.isDucking = false;
  seat(state, E.dx);
  Object.assign(E.ex, { mode: 'stand', x: X(EX_BACK_X), y: BACK_Y + 18, face: -1, t: 0, said: null, done: false });
  state.camera.x = X(ARENA_CAM); state.camera.y = GY - 550;
  state.cameraOverride = { x: state.camera.x, y: state.camera.y };
};

/** Done (or skipped): out in the lot, hopping down off the bulldozer; everything as it's left. */
const finish = (state: GameState, skipped: boolean) => {
  const o = whOf(state), E = o.ending, p = state.player;
  if (skipped) silenceAll();
  state.stageMemo[LEAK_MEMO] = '1'; state.stageMemo[CAST_MEMO] = '1';
  E.phase = 'done'; E.heap = []; E.flying = []; E.caseDown = true; E.caseT = 99; E.zoomK = 0; E.zf = null; E.wallHit = true; E.white = 0; E.fade = 0;
  E.ex.mode = 'off'; E.ex.said = null;
  o.fight.bodies = []; o.castSaid.clear(); o.crowd = null; o.ad = null;
  if (o.farWall) o.farWall.x = -1e7;
  p.hidden = false; p.carried = false; p.cartSeat = false; p.inCutscene = false; p.spriteRot = 0; p.facing = 1;
  p.pos.x = LOT0 + 312 - p.width / 2; p.pos.y = GY - 150 - p.height; p.vel.x = 2.5; p.vel.y = -3; p.isGrounded = false;
  state.cameraOverride = null;
  state.camera.x = LOT0 + 312 - CANVAS_WIDTH / 2; state.camera.y = GY - 550; state.cameraRestY = GY - 550;
  // (down off it: he cares about neither; it stands in for the lot's own arrival line)
  if (!skipped) { outOf(state).said['lot-arrive'] = true; meatheadSays(state, pickLine(SHRUG), true); }
};

// ---------------------------------------------------------------------------------------------------------------
// The beat on the pile: where each gag is at frame t of it (after it: where they were left, on the pile, pushed along
// with it). x's off the pile's middle; y's the world's.

/** The shield: on top, then rolling down the pile's right side, along the floor, then wobbling down flat like a coin. */
const S0 = 12, S1 = 40, S2 = 64, S3 = 118;
const shieldAt = (t: number) => {
  if (t < S0) return { x: -4, y: GY - TOP - SR, rot: 0, ry: SR, jig: 0, ph: 0 };
  if (t < S1) { const e = ((t - S0) / (S1 - S0)) ** 2, x = -4 + e * 124; return { x, y: GY - TOP + e * TOP - SR, rot: x / SR, ry: SR, jig: 0, ph: 0 }; }
  if (t < S2) { const u = (t - S1) / (S2 - S1), x = 120 + 45 * (1 - (1 - u) ** 2); return { x, y: GY - SR, rot: x / SR, ry: SR, jig: 0, ph: 0 }; }
  const s = Math.min(1, (t - S2) / (S3 - S2)), ph = s * s * 46, ry = Math.max(2.5, SR * (1 - s ** 1.4));
  return { x: 165, y: GY - ry, rot: 165 / SR, ry, jig: Math.sin(ph) * (1 - s) * 3, ph };
};
/** The hammer: on top (left), sliding off and tumbling down the left side; the floor: a squeaky bounce, a littler one. */
const H0 = 58, H1 = 80, H2 = 96, H3 = 106;
const hammerAt = (t: number) => {
  if (t < H0) return { x: -26, y: GY - TOP - 4, rot: 0.2 };
  if (t < H1) { const e = ((t - H0) / (H1 - H0)) ** 2; return { x: -26 - e * 74, y: GY - TOP - 4 + e * (TOP - 2), rot: 0.2 - e * 5.2 }; }
  if (t < H2) { const u = (t - H1) / (H2 - H1); return { x: -100 + u * 8, y: GY - 6 - 28 * Math.sin(Math.PI * u), rot: -5 + u * 3.2 }; }
  if (t < H3) { const u = (t - H2) / (H3 - H2); return { x: -92 + u * 4, y: GY - 6 - 9 * Math.sin(Math.PI * u), rot: -1.8 + u * 1.8 }; }
  return { x: -88, y: GY - 6, rot: 0 };
};
/** The hand up out of the top: still, three twitches, then over it flops. Its lean (0: straight up). */
const TW = [104, 113, 119], FLOP = 136;
const handLean = (t: number) => {
  for (let k = 0; k < TW.length; k++) if (t >= TW[k] && t < TW[k] + 4) return (k % 2 ? -0.35 : 0.3) * (t % 2 ? 1 : 0.6);
  if (t < FLOP) return 0;
  const u = Math.min(1, (t - FLOP) / 7);
  return 1.75 * u * u - (t >= FLOP + 7 && t < FLOP + 10 ? 0.15 : 0);
};
const pileSounds = (t: number) => {
  // (the shield: bumping down the pile, onto the floor, the rattle down to flat getting faster)
  if (t > S0 && t < S1 && (t - S0) % 7 === 0) playSound('clink', 0.3, 2);
  if (t === S1) playSound('clang', 0.45, 6);
  if (t > S2 && t < S3 && Math.floor(shieldAt(t).ph / Math.PI) !== Math.floor(shieldAt(t - 1).ph / Math.PI)) playSound('clink', 0.32, 8);
  if (t === S3) playSound('clink', 0.5, 4);
  // (the hammer: the rubber squeaks)
  if (t === H0 + 4) playSound('whoosh', 0.2, 6);
  if (t === H1) { playSound('squish', 0.6, 14); playSound('boing', 0.4, 10); }
  if (t === H2) { playSound('squish', 0.4, 17); playSound('boing', 0.25, 14); }
  // (the hand going over)
  if (t === FLOP + 7) playSound('thud', 0.35, 6);
};

export const updateEnding =(ctx: FrameContext): Controls | null => {
  const { state, fx } = ctx, o = whOf(state), E = o.ending, p = state.player, f = state.frame;
  if (E.phase === 'off' || E.phase === 'done') return null;
  E.t++; E.all++;
  p.inCutscene = true;
  if (E.all > SKIP_AFTER) { offerSkip(); if (takeSkip()) { finish(state, true); return hands(); } }
  switch (E.phase) {
    case 'say':
      // (the line, on his feet; then the cut)
      if ((E.said && E.t > 40 && p.isGrounded) || E.t > 320) { E.phase = 'cut'; E.t = 0; }
      break;
    case 'cut':
      if (E.t <= 10) E.fade = E.t / 10;
      if (E.t === 10) heapUp(state);
      if (E.t > 14) E.fade = Math.max(0, 1 - (E.t - 14) / 12);
      if (E.t > 26) { E.phase = 'pile'; E.t = 0; E.fade = 0; }
      if (E.heap.length) seat(state, E.dx);
      break;
    case 'pile': {
      // The beat on the pile: in on it, panning slowly up it (the shield, the hammer, the hand up top)
      const u = Math.min(1, E.t / 110);
      E.zf = { x: E.heapX + 30, y: GY - 36 - 48 * u * u * (3 - 2 * u), z: PILE_ZOOM };
      E.zoomK += (1 - E.zoomK) * 0.1;
      pileSounds(E.t);
      seat(state, E.dx);
      state.cameraOverride = { x: X(ARENA_CAM), y: GY - 550 };
      if (E.t >= PILE_T) { E.phase = 'drive'; E.t = 0; }
      break;
    }
    case 'drive': {
      // The exec on his phone at the back (after his line, in turn): never a look at any of it
      if (E.t === 1 && !E.wallHit) { E.ex.phoned = false; execSay(state, EXEC_PHONE, () => { E.ex.phoned = true; }); }
      if (E.ex.mode !== 'off') E.ex.t++;
      const front = () => E.heapX + HALF;
      // The engine catching; then up the stage, the pile ahead of the blade
      // (idling till the exec's had his say on the phone: then it goes; 10 s at most)
      if (E.t < 50 || (!E.ex.phoned && E.t < 600 && !E.wallHit)) {
        if (E.t % 10 === 1) playSound('engine', 0.5, -10);
        if (E.t === 20) playSound('rumble', 0.7, -8);
        if (E.t % 4 === 0) state.particles.push({ pos: { x: E.dx + 26, y: GY - 156 }, vel: { x: -0.4, y: -1.5 }, life: 40, color: 'rgba(41, 37, 36, 0.7)', size: 5 + Math.random() * 4 });
      } else if (!E.wallHit) {
        // (slowing as it gets to the case, the camera in on it; a beat on it going over; then on, flat out)
        const near = !E.caseDown && front() > X(CASE_X) - 120;
        if (E.caseDown) E.caseT++;
        const crawl = near || (E.caseDown && E.caseT < 70);
        E.v = crawl ? Math.min(E.v + 0.12, near ? 1.8 : 1.1) : Math.min(7.5, E.v + 0.14);
        E.dx += E.v;
        if (f % 8 === 0) playSound('engine', 0.6, -8 + E.v);
        if (f % 3 === 0) state.particles.push({ pos: { x: E.dx + 26, y: GY - 156 }, vel: { x: -1 - E.v * 0.3, y: -1.5 }, life: 30, color: 'rgba(41, 37, 36, 0.6)', size: 4 + Math.random() * 4 });
        // (the blade on the pile: shoved along, dragging)
        if (E.dx + BLADE > E.heapX - HALF) {
          E.heapX = E.dx + BLADE + HALF;
          if (f % 2 === 0) state.particles.push({ pos: { x: E.heapX + HALF * (Math.random() - 0.2), y: GY - 6 }, vel: { x: E.v * 0.6, y: -1 - Math.random() * 2 }, life: 22, color: Math.random() < 0.5 ? 'rgba(168, 162, 158, 0.7)' : '#991B1B', size: 3 + Math.random() * 4 });
          if (f % 14 === 0) playSound('grind', 0.4, -6);
        }
        // The case: the pile into its plinth; over it goes, the glass, the pages up and out to the crowd
        if (!E.caseDown && front() > X(CASE_X) - 30) {
          E.caseDown = true; E.caseT = 0;
          playSound('glass', 1, -2); playSound('crash', 0.8); playSound('alarm', 0.5, 4); shakeScreen(state, 8, 4);
          fx.spawnGlassShatter({ x: X(CASE_X), y: BACK_Y - 110 });
          for (let k = 0; k < 80; k++) state.particles.push({ pos: { x: X(CASE_X) + (Math.random() - 0.5) * 40, y: BACK_Y - 110 }, vel: { x: (Math.random() - 0.45) * 8, y: -2 - Math.random() * 9 }, life: 160 + Math.random() * 60, color: k % 4 ? '#F8FAFC' : '#E7E5E4', size: 4 + Math.random() * 2, grav: 0.05 });
          // (the exec sees; the AD on the bullhorn; the public grabbing pages. In turn)
          E.ex.mode = 'lose'; E.ex.t = 0;
          execSay(state, EXEC_SEES);
          adSay(state, AD_LEAK);
          crowdSay(state, CROWD_PAGES, X(CASE_X) - 160, 7);
        }
        // The far wall: straight through it
        if (front() > X(FAR_WALL)) {
          E.wallHit = true; E.t = 0;
          playSound('crash', 1, -8); playSound('boom', 0.9, -6); shakeScreen(state, 26, 9);
          for (let k = 0; k < 40; k++) state.particles.push({ pos: { x: X(FAR_WALL) + Math.random() * 40, y: GY - Math.random() * 260 }, vel: { x: 3 + Math.random() * 8, y: -2 - Math.random() * 6 }, life: 40, color: ['#78716C', '#A8A29E', '#57534E', '#7C2D12'][k % 4], size: 3 + Math.random() * 5, grav: 0.35 });
        }
      } else {
        // (on through it, the white of the daylight coming in; then outside)
        E.dx += E.v; E.heapX += E.v;
        E.white = Math.min(1, E.t / 18);
        if (E.t >= 20) { E.phase = 'lot'; E.t = 0; }
      }
      // (the push in on the case: in as the pile gets to it, held while it goes over, back out)
      const zoomTo = !E.wallHit && ((!E.caseDown && front() > X(CASE_X) - 140) || (E.caseDown && E.caseT < 95)) ? 1 : 0;
      // (back out off the pile as the engine catches; then in on the case)
      if (zoomTo) E.zf = null;
      else if (E.zf) E.zf.x = E.heapX + 30;
      E.zoomK += (zoomTo - E.zoomK) * 0.07;
      if (E.zoomK < 0.005) E.zoomK = 0;
      seat(state, E.dx);
      state.cameraOverride = { x: X(ARENA_CAM), y: GY - 550 };
      break;
    }
    case 'lot': {
      E.zoomK = 0;
      // Outside: the dust out of the hole, the bodies out of it and into the dumpster, the pages down the lot
      if (E.t === 1) {
        p.hidden = true; p.cartSeat = false;
        state.camera.x = LOT0 - 90; state.camera.y = GY - 550;
        playSound('crash', 0.9, -10); shakeScreen(state, 18, 7);
        E.flying = E.heap.map((h, k) => {
          const tx = LOT_DUMPSTER.x0 + 50 + ((k * 37) % (LOT_DUMPSTER.x1 - LOT_DUMPSTER.x0 - 100)), T = 34 + (k % 4) * 3, g = 0.45;
          return { i: h.i, x: OUT.x, y: OUT.y - (k % 3) * 18, vx: (tx - OUT.x) / T, vy: (RIM - 14 - OUT.y - 0.5 * g * T * T) / T, dir: h.dir, t: -k * 3, at: 0, inBin: false };
        });
        E.heap = [];
      }
      state.cameraOverride = { x: LOT0 - 90, y: GY - 550 };
      E.white = Math.max(0, E.white - 0.08);
      for (const b of E.flying) {
        if (++b.t < 0 || b.inBin) continue;
        b.vy += 0.45; b.x += b.vx; b.y += b.vy;
        if (b.vy > 0 && b.y > RIM + 6 && b.x > LOT_DUMPSTER.x0 && b.x < LOT_DUMPSTER.x1) { b.inBin = true; playSound('thud', 0.5, -4 + (b.i % 5)); if (b.i % 3 === 0) playSound('splat', 0.4, -6); }
      }
      if (E.t < 110 && E.t % 2 === 0) state.particles.push({ pos: { x: OUT.x, y: GY - 60 - Math.random() * 120 }, vel: { x: 2 + Math.random() * 5, y: -1 - Math.random() * 3 }, life: 160, color: '#F8FAFC', size: 4 + Math.random() * 2, grav: 0.04 });
      if (E.t === 70) playSound('clang', 0.7, -10);
      // The exec out of the hole after it (under the bodies flying past him; not a look), the rant, off after the pages
      const ex = E.ex;
      if (E.t === 50) Object.assign(ex, { mode: 'out', x: LOT_WALL_BREAK.hole.x0 + 30, y: GY, face: 1, t: 0 });
      if (ex.mode === 'out') { ex.x += 5; if (ex.x >= EX_RANT_X) { ex.x = EX_RANT_X; ex.mode = 'rant'; ex.t = 0; execSay(state, EXEC_RANT, () => { ex.done = true; }); } }
      else if (ex.mode === 'rant') { ex.t++; if (ex.done) { ex.mode = 'run'; ex.t = 0; } }
      else if (ex.mode === 'run') { ex.t++; ex.x += 6; }
      const gone = ex.mode === 'off' || ex.mode === 'stand' || ex.mode === 'lose' || (ex.mode === 'run' && ex.x > state.camera.x + CANVAS_WIDTH + 60);
      if ((E.t >= 160 && gone) || E.t > 1500) finish(state, false);
      break;
    }
  }
  return hands();
};

/** The camera pushed in on the case as the pile gets to it (the section's zoom). */
export const endingZoom = (state: GameState) => {
  const E = whOf(state).ending, k0 = E.zoomK;
  if (k0 <= 0) return null;
  const k = k0 * k0 * (3 - 2 * k0), x = E.zf ? E.zf.x : X(CASE_X), y = E.zf ? E.zf.y : CASE_FOCUS.y;
  return { scale: 1 + (E.zf ? E.zf.z : ZOOM_IN) * k, x, y, shiftX: k * (state.camera.x + CANVAS_WIDTH / 2 - x), shiftY: k * (state.camera.y + CANVAS_HEIGHT / 2 - y) };
};


// ---------------------------------------------------------------------------------------------------------------
// Drawing (peak SNES: every material in steps, inked round)

const DY = ['#3A2A04', '#6A4C06', '#A87A0A', '#D8A40E', '#F2C424', '#FCE06A', '#FFF4B0'];
/** The bulldozer's body, its cab, its push arms and blade (still: painted once), its middle-bottom at (0, 0), blade
 *  to the right. HAPPYWOOD FACILITIES' own: yellow, beat up, the paint chipped, rust down its seams. */
const paintDozer = (g: Ctx) => {
  const Y = DY, S = ['#141418', '#24242A', '#36363E', '#4C4C56', '#6A6A76', '#9A9AA6', '#D4D4DC'];
  // (the track frame behind the wheels: its top roller rail)
  box(g, -110, -40, 212, 6, INK); box(g, -109, -39, 210, 4, S[2]);
  // (the engine's hood: stepped, lit along the top, the side panels' louvers, the grille at the front)
  box(g, -102, -99, 176, 66, INK);
  box(g, -101, -98, 174, 64, Y[3]); box(g, -101, -98, 174, 4, Y[5]); box(g, -101, -98, 174, 1, Y[6]); box(g, -101, -98, 4, 64, Y[4]);
  box(g, -101, -40, 174, 6, Y[1]); checker(g, -101, -42, 174, 2, Y[1], 0, 2);
  box(g, 30, -90, 40, 52, INK); box(g, 31, -89, 38, 50, Y[2]); for (let k = 0; k < 6; k++) { box(g, 34, -85 + k * 8, 32, 4, S[1]); box(g, 34, -85 + k * 8, 32, 1, S[3]); }
  box(g, 68, -98, 6, 64, Y[1]);
  for (let k = 0; k < 5; k++) { box(g, -94 + k * 10, -86, 6, 30, Y[2]); box(g, -94 + k * 10, -86, 6, 1, Y[4]); }
  // (the decal, chipped paint, rust down a seam, a dent)
  board(g, -16, -60, ['HAPPYWOOD', 'FACILITIES'], plain(1, 1, '#1C1917'), '#E8E4DA', ['#3A2408', '#6A4410', '#9A6A1C', '#C8962E', '#E8C25A', '#FFF0A8'], 3);
  for (const [cx, cy] of [[-80, -94], [-40, -50], [10, -88], [50, -46]] as const) { box(g, cx, cy, 4, 2, S[2]); box(g, cx + 1, cy + 2, 2, 1, Y[1]); }
  box(g, 22, -96, 2, 50, '#7A3A12'); checker(g, 21, -70, 4, 22, '#9A5A22', 0, 1);
  g.fillStyle = Y[2]; g.beginPath(); g.ellipse(-60, -48, 7, 4, 0, 0, Math.PI * 2); g.fill();
  // (the hazard stripes on its back)
  box(g, -104, -96, 6, 60, INK);
  for (let y = -96; y < -36; y += 8) poly(g, [[-104, y], [-98, y + 4], [-98, y + 8], [-104, y + 4]], '#18181B');
  // (the exhaust stack, its rain cap)
  box(g, 20, -156, 10, 60, INK); box(g, 21, -155, 8, 58, S[2]); box(g, 21, -155, 2, 58, S[4]);
  box(g, 18, -160, 14, 6, INK); box(g, 19, -159, 12, 4, S[3]); box(g, 19, -159, 12, 1, S[5]);
  // (the cab: its posts and roof (the front posts go over him: drawn after him), the glass behind his seat, the seat)
  box(g, -78, -182, 98, 86, INK);
  box(g, -76, -180, 94, 8, Y[3]); box(g, -76, -180, 94, 2, Y[5]); box(g, -76, -174, 94, 2, Y[1]);
  box(g, -76, -172, 10, 76, Y[2]); box(g, -76, -172, 3, 76, Y[4]);
  box(g, -66, -172, 76, 76, '#5A7A98'); box(g, -66, -172, 76, 14, '#8AA8C4'); box(g, -66, -172, 76, 3, '#C8DCEC');
  poly(g, [[-60, -158], [-46, -172], [-40, -172], [-54, -158]], '#C8DCEC'); poly(g, [[-30, -158], [-20, -168], [-17, -168], [-27, -158]], '#A8C4DC');
  box(g, -60, -140, 22, 40, INK); box(g, -59, -139, 20, 38, '#2A2420'); box(g, -59, -139, 4, 38, '#3A342E');
  box(g, 10, -172, 8, 76, Y[2]); box(g, 15, -172, 3, 76, Y[1]);
  // (the push arms out to the blade, their rams)
  box(g, 60, -70, 60, 12, INK); box(g, 61, -69, 58, 10, Y[2]); box(g, 61, -69, 58, 2, Y[4]);
  box(g, 70, -94, 40, 7, INK); box(g, 71, -93, 38, 5, S[4]); box(g, 71, -93, 38, 1, S[6]);
  // (the blade: curved, its face stepped, the cutting edge worn bright, its bolts)
  const curve = (o: number) => { g.beginPath(); g.moveTo(112 - o, -114 - o); g.quadraticCurveTo(136 - o, -60, 118 - o, -2 + o); g.lineTo(134 + o, -2 + o); g.quadraticCurveTo(150 + o, -60, 128 + o, -114 - o); g.closePath(); };
  g.fillStyle = INK; curve(1); g.fill();
  g.fillStyle = Y[2]; curve(0); g.fill();
  g.save(); curve(0); g.clip();
  box(g, 110, -116, 8, 116, Y[4]); box(g, 110, -116, 3, 116, Y[5]); box(g, 128, -116, 22, 116, Y[1]);
  for (let y = -104; y < -10; y += 22) { box(g, 122, y, 3, 3, Y[0]); box(g, 122, y, 1, 1, Y[5]); }
  box(g, 110, -116, 40, 6, Y[3]);
  g.restore();
  box(g, 117, -8, 18, 6, INK); box(g, 118, -7, 16, 4, S[5]); box(g, 118, -7, 16, 1, S[6]);
};
/** The bulldozer, its middle at x on the floor (blade to the right). The tracks live (their plates going round). */
export const drawDozer = (c: Ctx, x: number, f: number, running: boolean) => {
  const jig = running ? (f % 4 < 2 ? -1 : 0) : 0;
  const S = ['#141418', '#24242A', '#36363E', '#4C4C56', '#6A6A76', '#9A9AA6'];
  // (the tracks: the belt, its grousers going round, the sprocket and the idler, the road wheels)
  box(c, x - 114, GY - 38, 218, 38, INK); box(c, x - 112, GY - 36, 214, 34, S[1]);
  const sh = running ? (f * 3) % 16 : 0;
  for (let k = -112 + sh; k < 100; k += 16) { box(c, x + k, GY - 37, 10, 4, S[3]); box(c, x + k, GY - 37, 10, 1, S[5]); box(c, x + k + 4, GY - 4, 10, 4, S[2]); }
  for (const [wx, r] of [[-94, 16], [86, 15]] as const) { c.fillStyle = INK; c.beginPath(); c.arc(x + wx, GY - 18, r + 1, 0, Math.PI * 2); c.fill(); c.fillStyle = S[3]; c.beginPath(); c.arc(x + wx, GY - 18, r - 2, 0, Math.PI * 2); c.fill(); c.fillStyle = S[1]; c.beginPath(); c.arc(x + wx, GY - 18, r * 0.45, 0, Math.PI * 2); c.fill(); const a = running ? f * 0.2 : 0; for (let k = 0; k < 4; k++) box(c, x + wx + Math.cos(a + k * 1.57) * r * 0.7 - 1, GY - 19 + Math.sin(a + k * 1.57) * r * 0.7, 3, 3, S[5]); }
  for (let k = 0; k < 5; k++) { const wx = x - 64 + k * 30; c.fillStyle = INK; c.beginPath(); c.arc(wx, GY - 12, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = S[2]; c.beginPath(); c.arc(wx, GY - 12, 6, 0, Math.PI * 2); c.fill(); box(c, wx - 1, GY - 14, 2, 2, S[5]); }
  c.save(); c.translate(Math.round(x), GY + jig);
  stamp(c, 'hww-dozer', -112, -190, 268, 192, paintDozer);
  c.restore();
};

/** The studio exec (feet's middle at x, y): a charcoal suit (stepped, a pocket square), a red tie, the silver hair
 *  slicked back, a tan, a gold watch. On the phone (stood there), arms up (losing it: the case going, the rant), or
 *  running. On Spooky Land's person drawer (costume.ts), a stamp a frame. */
const EXEC_SEED = 22, SUIT = '#33343C', EXEC_BOX: [number, number, number, number] = [-40, -112, 90, 116];
const paintExec = (g: Ctx, pose: 'phone' | 'arms' | 'run', fr: number) => {
  const B = bodyOf(EXEC_SEED, pose === 'run' ? 'walk' : 'stand', fr, false);
  B.L = { ...B.L, skin: '#C8905A', hair: '#D8D8DC', bald: false, long: false, face: 0, heavy: false };
  const skin = B.L.skin;
  legs(g, B, { col: SUIT, shoe: 'shoe', shoeCol: '#141012', detail: (gg, _h, k, ft) => px(gg, (k[0] + ft[0]) / 2, (k[1] + ft[1]) / 2 - 3, 1, 6, dk(SUIT, 0.3)) });
  const far: [number, number] = pose === 'arms' ? [-B.w / 2 - 8, B.shY - 26] : pose === 'run' ? [-B.w / 2 - 6, B.shY + 14 - (fr % 2) * 8] : [-B.w / 2 - 1, -30];
  const near: [number, number] = pose === 'arms' ? [B.w / 2 + 8, B.shY - 28] : pose === 'run' ? [B.w / 2 + 8, B.shY + 6 + (fr % 2) * 8] : [B.hx + 5, B.hy + 2];
  arm(g, B, -1, far[0], far[1], { sleeve: SUIT, hand: skin });
  torso(g, B, '#F4F2EC');
  // (the jacket open over the shirt, its lapels, a pocket square; the tie)
  part(g, () => { g.moveTo(-B.w / 2, B.shY + 1); g.lineTo(-B.hipW / 2 - 1, B.hipY + 3); g.lineTo(-2, B.hipY + 3); g.lineTo(-3, B.shY + 1); g.closePath(); }, SUIT, -B.hipW / 2 - 1, B.shY + 1, B.w / 2 + 2, B.hipY - B.shY + 2, 1);
  part(g, () => { g.moveTo(B.w / 2, B.shY + 1); g.lineTo(B.hipW / 2 + 1, B.hipY + 3); g.lineTo(3, B.hipY + 3); g.lineTo(4, B.shY + 1); g.closePath(); }, SUIT, 3, B.shY + 1, B.w / 2 + 2, B.hipY - B.shY + 2, 1);
  px(g, -4, B.shY + 2, 2, 10, dk(SUIT, 0.3)); px(g, 4, B.shY + 2, 2, 10, dk(SUIT, 0.3));
  part(g, () => { g.moveTo(-1, B.shY + 1); g.lineTo(2, B.shY + 1); g.lineTo(3, B.shY + 16); g.lineTo(0.5, B.shY + 19); g.lineTo(-2, B.shY + 16); g.closePath(); }, '#B91C1C', -2, B.shY + 1, 5, 18, 0.8);
  px(g, 6, B.shY + 8, 4, 2, '#F4F2EC'); px(g, 7, B.shY + 7, 2, 1, '#FFFFFF');
  headShape(g, B, skin);
  faceOn(g, B, { skin, eyes: pose === 'phone' ? 'smug' : 'wide', mouth: pose === 'phone' ? 'smirk' : 'o', md: 'ok', brows: '#9A9AA0' });
  // (the silver hair, slicked straight back: the top, a sweep behind the ear)
  part(g, () => { g.moveTo(B.hx - 9, B.hy + 1); g.quadraticCurveTo(B.hx - 9, B.hy - 12, B.hx + 2, B.hy - 11.5); g.quadraticCurveTo(B.hx + 9, B.hy - 11, B.hx + 9.5, B.hy - 6); g.lineTo(B.hx + 3, B.hy - 7); g.quadraticCurveTo(B.hx - 4, B.hy - 7, B.hx - 6, B.hy + 2); g.closePath(); }, '#D8D8DC', B.hx - 9, B.hy - 12, 19, 14, 1);
  for (let k = 0; k < 3; k++) px(g, B.hx - 6 + k * 4, B.hy - 9 + k, 3, 1, '#F4F4F6');
  arm(g, B, 1, near[0], near[1], { sleeve: SUIT, hand: skin });
  // (the phone at his ear; the gold watch)
  if (pose === 'phone') { part(g, () => g.roundRect(near[0] - 2, near[1] - 7, 5, 11, 1), '#18181B', near[0] - 2, near[1] - 7, 5, 11, 0.8); px(g, near[0] - 1, near[1] - 6, 3, 1, '#60A5FA'); }
  px(g, near[0] - 3, near[1] + 3, 4, 2, '#E8C25A');
};
const drawExec = (c: Ctx, x: number, y: number, face: 1 | -1, pose: 'phone' | 'arms' | 'run', f: number) => {
  const fr = pose === 'run' ? Math.floor(f / 5) % 6 : pose === 'arms' ? Math.floor(f / 4) % 2 : 0;
  c.save(); c.translate(Math.round(x + (pose === 'arms' ? (f % 4 < 2 ? 1 : -1) : 0)), Math.round(y)); c.scale(face, 1);
  stamp(c, `hww-exec-${pose}-${fr}`, EXEC_BOX[0], EXEC_BOX[1], EXEC_BOX[2], EXEC_BOX[3], g => paintExec(g, pose, fr));
  c.restore();
};
const execPose = (mode: string) => (mode === 'stand' ? 'phone' : mode === 'lose' || mode === 'rant' ? 'arms' : 'run');
/** The exec at the back of the stage (drawn smaller: he's back there, by the script), and his words over him. */
const execBack = (c: Ctx, state: GameState) => {
  const ex = whOf(state).ending.ex;
  if (ex.mode !== 'stand' && ex.mode !== 'lose') return;
  c.save(); c.translate(ex.x, ex.y); c.scale(EX_BACK, EX_BACK);
  drawExec(c, 0, 0, ex.face, execPose(ex.mode), state.frame);
  c.restore();
};

/** The beat's gags on the pile (where they've got to; after it, where they were left, pushed along with it). */
const drawPileGags = (c: Ctx, state: GameState) => {
  const E = whOf(state).ending, t = E.phase === 'pile' ? E.t : E.phase === 'cut' ? 0 : PILE_T, hx = E.heapX;
  // (the hand, up out of the top one: their sleeve, their glove or skin, stepped)
  const top = E.heap[E.heap.length - 1];
  if (top) {
    const a = CAST[top.i], lean = handLean(t), skin = a.gloves ?? a.look?.skin ?? '#D6A06B';
    const R = [mix(a.suit, INK, 0.4), a.suit, mix(a.suit, '#FFFFFF', 0.25)], K = [mix(skin, INK, 0.35), skin, mix(skin, '#FFFFFF', 0.3)];
    c.save(); c.translate(hx + top.ox + 6, GY - TOP + 8); c.rotate(lean);
    box(c, -5, -29, 10, 32, INK); box(c, -4, -28, 8, 30, R[1]); box(c, -4, -28, 2, 30, R[2]); box(c, 2, -28, 2, 30, R[0]);
    box(c, -6, -39, 12, 13, INK); box(c, -5, -38, 10, 11, K[1]); box(c, -5, -38, 3, 11, K[2]); box(c, 3, -38, 2, 11, K[0]);
    // (the fingers, spread; gone limp once it's down)
    if (lean < 1) for (let k = 0; k < 3; k++) { box(c, -5 + k * 3.5, -45, 3, 7, INK); box(c, -4 + k * 3.5, -44, 1.5, 6, K[1]); }
    else box(c, -5, -42, 10, 4, K[0]);
    box(c, 5, -34, 4, 3, INK); box(c, 5, -33, 3, 2, K[1]);
    c.restore();
  }
  // (the hammer: a rubber prop's grey head (it squashes), the wooden handle)
  const h = hammerAt(t), sq = t >= H1 && t < H1 + 4 ? 0.7 : t >= H2 && t < H2 + 3 ? 0.85 : 1;
  c.save(); c.translate(hx + h.x, h.y); c.rotate(h.rot);
  box(c, -15, -4, 24, 8, INK); box(c, -14, -3, 22, 6, '#8A5A2A'); box(c, -14, -3, 22, 2, '#B8844A'); box(c, -14, 1, 22, 1, '#5A3A1A');
  c.save(); c.scale(1, sq);
  box(c, 5, -10, 16, 20, INK); box(c, 6, -9, 14, 18, '#9A9AA4'); box(c, 6, -9, 14, 3, '#C8C8D0'); box(c, 6, -9, 3, 18, '#B8B8C0'); box(c, 17, -9, 3, 18, '#6A6A74');
  box(c, 7, -2, 12, 1, '#7A7A84');
  c.restore();
  c.restore();
  // (the shield: red, white, blue rings, stepped, the star; turning as it rolls, squashing down flat as it settles)
  const s = shieldAt(t);
  c.save(); c.translate(hx + s.x + s.jig, s.y); c.scale(1, s.ry / SR); c.rotate(s.rot);
  for (const [r, col] of [[SR + 1.5, INK], [SR, '#B91C1C'], [SR - 1.5, '#DC2626'], [SR * 0.72, '#F4F2EC'], [SR * 0.5, '#B91C1C'], [SR * 0.38, '#1D4ED8']] as const) { c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = '#F8FAFC'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? 1.6 : 4.2; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill();
  box(c, -SR * 0.6, -SR * 0.75, 3, 2, '#FFFFFF');
  c.restore();
};

/** The cab's front posts and roof edge, over him in the seat. */
const dozerFront = (c: Ctx, x: number, f: number) => {
  const jig = f % 4 < 2 ? -1 : 0, Y = DY;
  for (const px2 of [x - 78, x + 8]) { box(c, px2, GY - 182 + jig, 12, 86, INK); box(c, px2 + 1, GY - 181 + jig, 10, 84, Y[3]); box(c, px2 + 1, GY - 181 + jig, 3, 84, Y[5]); box(c, px2 + 8, GY - 181 + jig, 3, 84, Y[1]); }
  box(c, x - 82, GY - 186 + jig, 104, 10, INK); box(c, x - 81, GY - 185 + jig, 102, 8, Y[3]); box(c, x - 81, GY - 185 + jig, 102, 2, Y[5]); box(c, x - 81, GY - 179 + jig, 102, 2, Y[1]);
  // (the glass in front of him: a glint)
  c.fillStyle = 'rgba(200, 220, 236, 0.18)'; c.fillRect(x - 66, GY - 172 + jig, 74, 40);
  box(c, x - 20, GY - 170 + jig, 2, 22, 'rgba(255,255,255,0.4)');
};

/** The exec at the back, the heap (on the stage, ahead of the blade), the bulldozer driving. */
export const drawEndingBack = (c: Ctx, state: GameState) => {
  const E = whOf(state).ending;
  if (E.phase !== 'cut' && E.phase !== 'pile' && E.phase !== 'drive') return;
  execBack(c, state);
  if (!E.heap.length) return;
  for (const h of E.heap) drawBody(c, h.i, E.heapX + h.ox, GY - h.oy, h.dir, 1, 0);
  drawPileGags(c, state);
  drawDozer(c, E.dx, state.frame, E.phase === 'drive');
};
/** Over him: the cab's front; the exec's words. */
export const drawEndingFront = (c: Ctx, state: GameState) => {
  const E = whOf(state).ending, ex = E.ex;
  if ((E.phase === 'cut' && E.heap.length) || E.phase === 'pile' || E.phase === 'drive') dozerFront(c, E.dx, state.frame);
  if ((E.phase === 'cut' || E.phase === 'pile' || E.phase === 'drive') && ex.said && (ex.mode === 'stand' || ex.mode === 'lose')) saidOver(c, ex.said.text, ex.x, ex.y - 104, '#FDE68A', 260);
};
/** Outside (the lot's beat: he's still in the warehouse's hands, so it's drawn from its HUD, in the world): the bodies
 *  flying into the dumpster and the dust out of the hole. */
const drawLotBeat = (c: Ctx, state: GameState) => {
  const E = whOf(state).ending, f = state.frame, ex = E.ex;
  c.save(); c.translate(-Math.round(state.camera.x), -Math.round(state.camera.y));
  for (const b of E.flying) {
    if (b.t < 0 || b.inBin) continue;
    c.save();
    // (into the bin: none of them showing under its rim)
    if (b.x > LOT_DUMPSTER.x0 - 30) { c.beginPath(); c.rect(b.x - 200, b.y - 300, 400, RIM - (b.y - 300)); c.clip(); }
    drawBody(c, b.i, b.x, b.y + 16, b.dir, 1, 0);
    c.restore();
  }
  // (the exec: out of the dust, under the bodies flying past; his words over the dust)
  const outside = ex.mode === 'out' || ex.mode === 'rant' || ex.mode === 'run';
  if (outside) drawExec(c, ex.x, ex.y, ex.face, execPose(ex.mode), f);
  // (the dust: thick at first, thinning off the bulldozer as it settles; stepped puffs)
  const k = E.t < 60 ? 1 : Math.max(0, 1 - (E.t - 60) / 70);
  if (k > 0.05) {
    for (let i = 0; i < 9; i++) {
      const dx = LOT_WALL_BREAK.hole.x0 + i * 62 + Math.sin(f * 0.03 + i) * 10, dy = GY - 60 - (i % 3) * 50 - Math.min(40, E.t * 0.4);
      const r = (80 + (E.t % 40)) * (0.5 + k * 0.5);
      pixelBlob(c, dx, dy, r, r * 0.72, i % 2 ? '#A8A29E' : '#78716C');
      if (k > 0.5) pixelBlob(c, dx - r * 0.25, dy - r * 0.25, r * 0.5, r * 0.36, '#C8C2BA');
    }
  }
  if (outside && ex.said) saidOver(c, ex.said.text, ex.x, ex.y - 118, '#FDE68A', 260);
  c.restore();
};
/** The cuts (the black, the white), and SKIP >>. */
export const drawEndingHud = (c: Ctx, state: GameState) => {
  const E = whOf(state).ending;
  if (E.phase === 'off' || E.phase === 'done') return;
  if (E.phase === 'lot') drawLotBeat(c, state);
  if (E.fade > 0) { c.fillStyle = `rgba(0, 0, 0, ${E.fade})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if (E.white > 0) { c.fillStyle = `rgba(255, 255, 255, ${E.white})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if (E.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
