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
import { words, print } from '../blvd/paint';
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
      if (E.t === 1 && !E.wallHit) execSay(state, EXEC_PHONE);
      if (E.ex.mode !== 'off') E.ex.t++;
      const front = () => E.heapX + HALF;
      // The engine catching; then up the stage, the pile ahead of the blade
      if (E.t < 50) {
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
// Drawing

/** The bulldozer, its middle at x on the floor (blade to the right): HAPPYWOOD FACILITIES' own, yellow, beat up. */
export const drawDozer = (c: Ctx, x: number, f: number, running: boolean) => {
  const jig = running ? (f % 4 < 2 ? -1 : 0) : 0;
  // (the tracks)
  box(c, x - 112, GY - 36, 214, 36, '#000'); box(c, x - 110, GY - 34, 210, 32, '#292524');
  for (let k = 0; k < 9; k++) box(c, x - 104 + ((k * 24 + (running ? f * 3 : 0)) % 200), GY - 32, 12, 28, '#44403C');
  for (const wx of [x - 92, x + 84]) { c.fillStyle = '#1C1917'; c.beginPath(); c.arc(wx, GY - 18, 15, 0, Math.PI * 2); c.fill(); }
  // (the body, the engine, the exhaust stack)
  box(c, x - 102, GY - 98 + jig, 174, 64, '#000'); box(c, x - 100, GY - 96 + jig, 170, 60, '#EAB308');
  box(c, x - 100, GY - 96 + jig, 170, 6, '#FDE047'); box(c, x + 30, GY - 90 + jig, 38, 50, '#CA8A04');
  for (let k = 0; k < 4; k++) box(c, x + 34, GY - 84 + k * 10 + jig, 30, 3, '#78350F');
  box(c, x + 22, GY - 152 + jig, 8, 56, '#27272A'); box(c, x + 20, GY - 156 + jig, 12, 6, '#18181B');
  words(c, 'HAPPYWOOD', x - 36, GY - 66 + jig, print(1, '#1C1917'));
  words(c, 'FACILITIES', x - 36, GY - 54 + jig, print(1, '#1C1917'));
  // (the cab: its roof and back; the glass)
  box(c, x - 76, GY - 178 + jig, 92, 82, '#000'); box(c, x - 74, GY - 176 + jig, 88, 80, '#CA8A04');
  box(c, x - 66, GY - 166 + jig, 72, 62, '#7DD3FC'); box(c, x - 66, GY - 166 + jig, 72, 10, '#BAE6FD');
  // (the arms out to the blade; the blade, curved, its edge worn bright)
  box(c, x + 66, GY - 66 + jig, 50, 10, '#A16207');
  c.fillStyle = '#000'; c.beginPath(); c.moveTo(x + 112, GY - 112); c.quadraticCurveTo(x + 134, GY - 60, x + 118, GY - 2); c.lineTo(x + 132, GY - 2); c.quadraticCurveTo(x + 148, GY - 60, x + 126, GY - 112); c.closePath(); c.fill();
  c.fillStyle = '#A16207'; c.beginPath(); c.moveTo(x + 114, GY - 110); c.quadraticCurveTo(x + 135, GY - 60, x + 120, GY - 4); c.lineTo(x + 130, GY - 4); c.quadraticCurveTo(x + 146, GY - 60, x + 124, GY - 110); c.closePath(); c.fill();
  box(c, x + 120, GY - 8, 12, 4, '#D6D3D1');
};
/** The studio exec (feet's middle at x, y): charcoal suit, red tie, the slicked silver hair, a tan. On the phone (stood
 *  there), arms up (losing it: the case going, the rant), or running. */
const drawExec = (c: Ctx, x: number, y: number, face: 1 | -1, pose: 'phone' | 'arms' | 'run', f: number) => {
  const step = pose === 'phone' ? 0 : f % 8 < 4 ? 5 : -5;
  x += pose === 'arms' ? (f % 4 < 2 ? 1 : -1) : 0;
  // (the shoes, the legs)
  box(c, x - 11 + step, y - 6, 10, 6, '#000'); box(c, x + 2 - step, y - 6, 10, 6, '#000');
  box(c, x - 10 + step, y - 38, 8, 33, '#27272A'); box(c, x + 2 - step, y - 38, 8, 33, '#27272A');
  // (the jacket, the shirt's V and the tie)
  box(c, x - 14, y - 70, 28, 36, '#000'); box(c, x - 13, y - 69, 26, 34, '#3F3F46');
  box(c, x - 4, y - 69, 8, 14, '#F8FAFC'); box(c, x - 2, y - 67, 4, 16, '#B91C1C');
  // (the head: tan, the silver hair slicked back; the mouth shut on the phone, wide open otherwise)
  box(c, x - 9, y - 88, 18, 19, '#000'); box(c, x - 8, y - 87, 16, 17, '#D6A06B');
  box(c, x - 9, y - 90, 18, 6, '#D4D4D8'); box(c, x - 9 - face * 3, y - 88, 6, 8, '#D4D4D8');
  box(c, x + face * 4 - 1, y - 82, 3, 3, '#000');
  if (pose === 'phone') box(c, x + face * 2 - 2, y - 75, 5, 2, '#7C2D12');
  else { box(c, x + face * 3 - 3, y - 77, 6, 5, '#000'); box(c, x + face * 4 - 9, y - 85, 18, 2, '#000'); }
  // (the arms: one at his side, the phone at his ear; both up; pumping)
  if (pose === 'phone') {
    box(c, x - face * 15 - 3, y - 68, 6, 26, '#3F3F46');
    box(c, x + face * 9 - 3, y - 80, 6, 14, '#3F3F46'); box(c, x + face * 8 - 3, y - 88, 6, 10, '#111827');
  } else if (pose === 'arms') {
    box(c, x - 20, y - 104, 6, 36, '#3F3F46'); box(c, x + 14, y - 104, 6, 36, '#3F3F46');
    box(c, x - 21, y - 110, 8, 7, '#D6A06B'); box(c, x + 13, y - 110, 8, 7, '#D6A06B');
  } else {
    box(c, x - face * 18 - 3, y - 66 - step, 6, 22, '#3F3F46'); box(c, x + face * 14 - 3, y - 92 + step, 6, 24, '#3F3F46');
  }
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
  // (the hand, up out of the top one: their sleeve, their glove or skin)
  const top = E.heap[E.heap.length - 1];
  if (top) {
    const a = CAST[top.i], lean = handLean(t), skin = a.gloves ?? a.look?.skin ?? '#D6A06B';
    c.save(); c.translate(hx + top.ox + 6, GY - TOP + 8); c.rotate(lean);
    box(c, -4, -28, 8, 30, '#000'); box(c, -3, -27, 6, 28, a.suit);
    box(c, -5, -38, 10, 12, '#000'); box(c, -4, -37, 8, 10, skin);
    // (the fingers, spread; gone limp once it's down)
    if (lean < 1) for (let k = 0; k < 3; k++) box(c, -4 + k * 3, -42, 2, 5, skin);
    c.restore();
  }
  // (the hammer: a rubber prop's grey head, the wooden handle)
  const h = hammerAt(t);
  c.save(); c.translate(hx + h.x, h.y); c.rotate(h.rot);
  box(c, -14, -3, 22, 6, '#000'); box(c, -13, -2, 20, 4, '#78350F');
  box(c, 6, -9, 14, 18, '#000'); box(c, 7, -8, 12, 16, '#A1A1AA'); box(c, 7, -8, 12, 3, '#D4D4D8');
  c.restore();
  // (the shield: red, white, blue, the star; turning as it rolls, squashing down flat as it settles)
  const s = shieldAt(t);
  c.save(); c.translate(hx + s.x + s.jig, s.y); c.scale(1, s.ry / SR); c.rotate(s.rot);
  for (const [r, col] of [[SR + 1.5, '#000'], [SR, '#DC2626'], [SR * 0.72, '#F8FAFC'], [SR * 0.45, '#1D4ED8']] as const) { c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); }
  box(c, -2, -5, 4, 10, '#F8FAFC'); box(c, -5, -2, 10, 4, '#F8FAFC');
  c.restore();
};

/** The cab's front posts and roof edge, over him in the seat. */
const dozerFront = (c: Ctx, x: number, f: number) => {
  const jig = f % 4 < 2 ? -1 : 0;
  box(c, x - 76, GY - 178 + jig, 10, 82, '#CA8A04'); box(c, x + 6, GY - 178 + jig, 10, 82, '#CA8A04');
  box(c, x - 80, GY - 182 + jig, 100, 8, '#A16207');
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
  // (the dust: thick at first, thinning off the bulldozer as it settles)
  const k = E.t < 60 ? 0.92 : Math.max(0, 0.92 - (E.t - 60) / 70);
  if (k > 0) {
    for (let i = 0; i < 9; i++) {
      const dx = LOT_WALL_BREAK.hole.x0 + i * 62 + Math.sin(f * 0.03 + i) * 10, dy = GY - 60 - (i % 3) * 50 - Math.min(40, E.t * 0.4);
      c.fillStyle = `rgba(${i % 2 ? '168, 162, 158' : '120, 113, 108'}, ${k})`;
      c.beginPath(); c.ellipse(dx, dy, 80 + (E.t % 40), 60, 0, 0, Math.PI * 2); c.fill();
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
