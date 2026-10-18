// THE CRASH into Sawdust Gulch (the user's: "when the train crashes in the station, make it look more devastating as
// tucker flies from the wreckage and lands face first in the dirt as paramedics pick him up and carry him to first
// aid"). The train's scene (train/engine.ts) dips to black as the station's sign comes up; this is the rest of it, a
// cutscene from its first frame (no HUD, no controls, SKIP >> for all of it: the aftermath):
//
//   the wide shot (the camera pulled back further, 0.62): the train flat out along the last of the line, the whistle
//   stuck on, guests on the platform turning, screaming, running; the engine through the buffer stop (its timbers
//   flying), the canopy over the platform smashed down, the rails torn up and curled, the engine plowing on through the
//   dirt into the depot's front (a hole stove in it, boards everywhere), nosed down, its back end up; the tender riding
//   up onto the cab, the coach behind jackknifed the other way, its nose in the dirt and its back end up in the air;
//   steam bursting out of the boiler, sparks, debris raining down, a dust cloud rolling over it all, fires catching in
//   the cab, the coal and the coach; a big shake for each.
//   Tucker (the full figure, the eye shot through, limp: apparently dead) thrown out of the cab in a long tumbling arc,
//   FACE FIRST into the dirt (a skid, a spray of dirt, his face buried), his cap coming down after.
//   Meathead tumbles out of the cab after him (back in control from here on, once it's done).
//   The park's paramedics run out round FIRST AID with a stretcher, roll him over onto it (face up: the hole through
//   his eye), his cap on his chest, and carry him in. Never alive: the undertaker's coffin stays empty (FIRST AID's
//   still got him).
//
// The wreck stays for the visit (the aftermath, art.ts's end of the line calls drawWreck): all background, nothing to
// stand on (no lit tops), the fires smoldering, the steam still going, the debris where it came down. A later visit has
// the stop rebuilt (art.ts). Module state (outlives a death; a fresh visit starts over).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy } from '../../../m1/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound, playHornDrone } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { drawPerson, type Pose as PersonPose } from '../../adventure/temple/people';
import { meatheadSays, speak, byPants, saidOver, hands, landVisit, teleport, tuckerWoundsOf, type Said } from '../section';
import { box, mix, INK, hash, type Ctx } from '../kit';
import { drawTucker, drawTuckerCap } from '../tucker';
import { takeCrashScene } from '../train/engine';
import { GY } from '../geometry';
import { townOf } from './state';
import { X } from './layout';
import { TOWN_VOICES, ARRIVE, STRETCHER, MEDIC } from './lines';

const TAU = Math.PI * 2;
/** The train's speed coming in (px a frame), the frames of it before the stop. */
const V = 18, IN = 50;
/** The engine at the train's size (its first pass's drawing, 360 long, blown up to 600). */
const ES = 600 / 360;
/** Where its nose hits the stop, where it ends up (stove into the depot), the frames it takes. */
const NOSE_HIT = 190, NOSE_END = 470, STOP = 31;
/** Time for the aftermath (everything where it ended up). */
const AFTER = 99999;
/** Where Tucker comes down (his middle, x from the section's start, after the skid), the FIRST AID door's far edge. */
const TUCKER_AT = 566, DOOR_B = 782;
/** The camera: zoomed out for the crash, back to the town's for the paramedics. */
export const CRASH_ZOOM = 0.62;

type Phase = 'crash' | 'arrive' | 'run' | 'load' | 'carry' | 'in' | 'done';
/** A piece of wreckage flying (or come to rest). */
interface Bit { x: number; y: number; vx: number; vy: number; a: number; va: number; w: number; h: number; col: string; rest: boolean }
/** A cloud: dust or steam, growing and fading. */
interface Puff { x: number; y: number; vx: number; vy: number; r: number; gr: number; t: number; life: number; col: string; a: number }
interface Crash {
  visit: number;
  /** Frames since the engine hit the stop (from -IN). */
  t: number;
  phase: Phase; pt: number; token: number;
  /** The camera's middle (x from the section's start), eased. */
  cam: number;
  /** The stretcher's middle (world x). */
  sx: number;
  medicSaid: Said | null; lineDone: boolean; mhDone: boolean; mhOut: boolean;
  bits: Bit[]; puffs: Puff[];
  held: Set<Enemy>;
}
let live: Crash | null = null;
let arriveVisit = -1;
const mine = () => (live && live.visit === landVisit() ? live : null);

/** The crash's cutscene is on. */
export const crashRunning = () => { const s = mine(); return !!s && s.phase !== 'done'; };
/** Meathead's had his say on arriving (in the cutscene) this visit: the walk-in line isn't said again. */
export const arriveSaid = () => arriveVisit === landVisit();
/** The zoom the crash wants (null: the town's own). */
export const crashZoom = () => { const s = mine(); return s && (s.phase === 'crash') ? CRASH_ZOOM : null; };
/** FIRST AID's door open (them carrying him in). */
export const firstAidOpen = () => { const s = mine(); return !!s && (s.phase === 'carry' || (s.phase === 'in' && s.pt < 14)); };

// ---------------------------------------------------------------------------------------------------------------
// Where everything is at time t (frames since the hit)

const ease = (k: number) => 1 - (1 - k) * (1 - k);
const clamp01 = (k: number) => Math.max(0, Math.min(1, k));
const noseAt = (t: number) => (t < 0 ? NOSE_HIT + V * t : t < STOP ? NOSE_HIT + (NOSE_END - NOSE_HIT) * ease(t / STOP) : NOSE_END);
const tiltAt = (t: number) => (t < 0 ? 0 : 0.05 * clamp01(t / STOP) + (t < STOP + 10 ? Math.sin(t * 0.9) * 0.01 * (1 - clamp01(t / (STOP + 10))) : 0));
const crushAt = (t: number) => (t < 0 ? 0 : Math.min(36, t * 3));

/** A car: its rear's foot (x, height off the ground) and its angle (−: front up). */
interface Pose { x: number; h: number; a: number }
interface CarDef { len: number; base: number; th: number; dur: number; fin: Pose }
/** The tender (rides up onto the cab) and the coach behind (jackknifed the other way: nose in the dirt, back end up). */
const TENDER: CarDef = { len: 400, base: NOSE_HIT - 600 - 12 - 400, th: 3, dur: 30, fin: { x: -500, h: 0, a: -0.612 } };
const COACH: CarDef = { len: 480, base: NOSE_HIT - 600 - 12 - 400 - 12 - 480, th: 9, dur: 34, fin: { x: -978, h: 152, a: 0.32 } };
const carAt = (d: CarDef, t: number): Pose => {
  if (t < d.th) return { x: d.base + V * t, h: 0, a: 0 };
  const k = clamp01((t - d.th) / d.dur), e = ease(k), x0 = d.base + V * d.th, hop = Math.sin(k * Math.PI);
  return { x: x0 + (d.fin.x - x0) * e, h: d.fin.h * e + hop * 34, a: d.fin.a * e + Math.sin(k * TAU) * 0.05 };
};
/** A point on a car (lx along it from its rear, ly up off its floor line: negative) in the world. */
const onCar = (p: Pose, lx: number, ly: number): [number, number] => {
  const cs = Math.cos(p.a), sn = Math.sin(p.a);
  return [X(p.x) + lx * cs - ly * sn, GY - p.h + lx * sn + ly * cs];
};
/** A point on the engine (its drawing's units: x back from the nose, negative; y up, negative) in the world. */
const onEngine = (t: number, lx: number, ly: number): [number, number] => {
  const a = tiltAt(t), cs = Math.cos(a), sn = Math.sin(a), x = lx * ES, y = ly * ES;
  return [X(noseAt(t)) + x * cs - y * sn, GY + x * sn + y * cs];
};

/** Tucker's arc out of the cab: from the cab at t 6 to face down in the dirt at t 68. */
const FLY_A = 6, FLY_B = 68, SKID = 12;
const tuckerFlight = (t: number) => {
  const u = clamp01((t - FLY_A) / (FLY_B - FLY_A));
  const h = 250 + (16 - 250) * u + 4 * 247 * u * (1 - u);
  return { x: X(-250 + (TUCKER_AT - 26 + 250) * u), y: GY - h, spin: 4 * Math.PI * u };
};
const skidAt = (t: number) => 26 * ease(clamp01((t - FLY_B) / SKID));
/** His cap: off in the hit, down a little after him. */
const CAP_A = 10, CAP_B = 84, CAP_REST = { x: 630, y: GY - 6, rot: 0.3 };
const capFlight = (t: number) => {
  const u = clamp01((t - CAP_A) / (CAP_B - CAP_A));
  return { x: X(-230 + (CAP_REST.x + 230) * u), y: GY - (300 + (6 - 300) * u + 4 * 200 * u * (1 - u)), rot: 6 * Math.PI * u + CAP_REST.rot };
};

/** The guests on the platform: [seed, where they stood, where they ran to, how they stand after]. */
const GUESTS: [number, number, number, 'photo' | 'point' | 'stand'][] = [[11, 330, 845, 'photo'], [29, 390, 880, 'point'], [47, 450, 915, 'stand'], [63, 510, 950, 'photo'], [81, 560, 985, 'point']];
const RUN_AT = -22;

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const begin = (state: GameState) => {
  live = { visit: landVisit(), t: -IN, phase: 'crash', pt: 0, token: 0, cam: 0, sx: X(900), medicSaid: null, lineDone: false, mhDone: false, mhOut: false, bits: [], puffs: [], held: new Set() };
  const p = state.player;
  teleport(state, X(200), GY);
  p.inCutscene = true; p.hidden = true; p.carried = true; p.untouchable = true; p.vel.x = 0; p.vel.y = 0; p.facing = 1;
  townOf(state).zoom = 0.8;
  aim(state, live);
  playHornDrone(1.4);
};
/** The camera on the scene (its middle eased toward where the scene wants it; set outright, the engine's easing kept
 *  out of it). Its middle never left of the section's start (the train's stretch stays off screen). */
const aim = (state: GameState, s: Crash) => {
  const want = s.phase === 'crash' ? (s.t < 45 ? 0 : 250) : 500;
  s.cam += (want - s.cam) * 0.035;
  if (Math.abs(want - s.cam) < 0.5) s.cam = want;
  const x = X(s.cam) - CANVAS_WIDTH / 2, y = GY - 510;
  state.camera.x = x; state.camera.y = y;
  state.cameraOverride = { x, y };
};

const bits = (s: Crash, n: number, x: number, y: number, spread: number, vx: [number, number], vy: [number, number], cols: string[], size: [number, number]) => {
  for (let i = 0; i < n && s.bits.length < 90; i++) {
    const r = Math.random;
    s.bits.push({ x: x + (r() - 0.5) * spread, y: y - r() * spread * 0.5, vx: vx[0] + r() * (vx[1] - vx[0]), vy: vy[0] + r() * (vy[1] - vy[0]), a: r() * TAU, va: (r() - 0.5) * 0.5, w: size[0] + r() * (size[1] - size[0]), h: 3 + r() * 4, col: cols[i % cols.length], rest: false });
  }
};
const puffs = (s: Crash, n: number, x: number, y: number, spread: number, col: string, r: number, a: number, life: number, rise = 0.6) => {
  for (let i = 0; i < n; i++) {
    const q = Math.random;
    s.puffs.push({ x: x + (q() - 0.5) * spread, y: y - q() * 30, vx: (q() - 0.5) * 2.4, vy: -q() * rise - 0.15, r: r * (0.5 + q() * 0.6), gr: 0.5 + q() * 0.9, t: 0, life: life * (0.7 + q() * 0.5), col, a });
  }
};
const step = (s: Crash) => {
  for (const b of s.bits) {
    if (b.rest) continue;
    b.vy += 0.42; b.x += b.vx; b.y += b.vy; b.a += b.va;
    if (b.y >= GY - b.h / 2 && b.vy > 0) {
      b.y = GY - b.h / 2;
      if (b.vy < 2.2) { b.rest = true; b.a = (hash(b.x) - 0.5) * 0.4; }
      else { b.vy *= -0.3; b.vx *= 0.5; b.va *= 0.5; }
    }
  }
  for (const q of s.puffs) { q.t++; q.x += q.vx; q.y += q.vy; q.vx *= 0.98; q.r += q.gr; }
  s.puffs = s.puffs.filter(q => q.t < q.life);
};

export const updateCrash = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx;
  if (takeCrashScene()) begin(state);
  const s = mine();
  if (!s) return controls;
  step(s);
  if (s.phase === 'done') return controls;
  const p = state.player;
  s.t++; s.pt++;
  p.inCutscene = true;
  for (const e of state.enemies) if (e.health > 0 && !e.puppet && Math.abs(e.pos.x - X(400)) < 1800) { e.puppet = true; e.vel.x = 0; s.held.add(e); }
  // (all or nothing: SKIP >> lands on the aftermath)
  offerSkip();
  if (takeSkip()) { skip(state, s); return hands(); }
  aim(state, s);
  const t = s.t;
  const tok = s.token, ok = () => live === s && s.token === tok;
  switch (s.phase) {
    case 'crash': {
      // (the guests see it coming)
      if (t === -26) playSound('screams', 1, 0);
      // ---- THE HIT: through the buffer stop
      if (t === 0) {
        playSound('crash', 1, -10); playSound('boom', 1, -18); playSound('crunch', 1, -8); playSound('clang', 1, -10); playSound('rumble', 1, -6);
        shakeScreen(state, 46, 13);
        bits(s, 14, X(NOSE_HIT), GY - 40, 40, [5, 17], [-13, -4], ['#5A3A1E', '#DC2626', '#F8FAFC', '#8A5A30'], [10, 26]);
        puffs(s, 12, X(NOSE_HIT - 60), GY - 10, 260, '#B8935A', 46, 0.6, 170, 0.5);
        // (the boiler bursting: steam everywhere)
        const [bx, by] = onEngine(0, -90, -140);
        puffs(s, 14, bx, by, 140, '#F8FAFC', 40, 0.75, 120, 1.6);
        playSound('whoosh', 1, -16);
      }
      // (plowing on through the dirt: sparks, dirt thrown up)
      if (t > 0 && t < STOP && t % 2 === 0) {
        const nx = X(noseAt(t));
        for (let n = 0; n < 4; n++) state.particles.push({ pos: { x: nx - Math.random() * 60, y: GY - Math.random() * 10 }, vel: { x: 2 + Math.random() * 8, y: -2 - Math.random() * 7 }, life: 20 + Math.random() * 20, color: n % 2 ? '#FDE047' : '#F97316', size: 2 + Math.random() * 2 });
        puffs(s, 2, nx - 40, GY - 6, 60, '#A8845A', 30, 0.5, 120, 0.4);
        if (t % 6 === 0) bits(s, 3, nx - 20, GY - 10, 30, [3, 10], [-9, -4], ['#7A5A38', '#5A3A1E'], [6, 12]);
      }
      if (t === 3) playSound('crunch', 1, -12);
      // (into the depot's front)
      if (t === 14) {
        playSound('crash', 1, -4); playSound('glass', 1, -2); shakeScreen(state, 20, 8);
        bits(s, 18, X(410), GY - 140, 160, [2, 12], [-11, -3], ['#B08A5A', '#8A6A40', '#7A6A4A', '#C8A070', '#BFE0F8'], [10, 30]);
      }
      if (t === 24) playSound('ignite', 1, -6);
      // (the tender up onto the cab, the coach slewed down behind)
      if (t === TENDER.th + TENDER.dur) {
        playSound('crash', 1, -12); playSound('clang', 0.9, -14); shakeScreen(state, 18, 7);
        const [x, y] = onCar(carAt(TENDER, t), 200, -170);
        bits(s, 12, x, y, 120, [-5, 7], [-10, -3], ['#18181B', '#27272A', '#3F3F46'], [5, 10]);
        puffs(s, 6, X(-400), GY - 10, 200, '#B8935A', 40, 0.55, 150, 0.5);
      }
      if (t === COACH.th + COACH.dur) {
        playSound('crash', 1, -16); playSound('boom', 0.8, -20); playSound('glass', 0.8, -6); shakeScreen(state, 22, 9);
        const [x, y] = onCar(carAt(COACH, t), 440, -150);
        bits(s, 12, x, y, 120, [-6, 6], [-11, -3], ['#5A2A3A', '#BFE0F8', '#341620', '#8A6A40'], [8, 20]);
        puffs(s, 8, X(-560), GY - 10, 240, '#B8935A', 46, 0.55, 160, 0.5);
      }
      if (t === FLY_A) playSound('whoosh', 0.8, -4);
      // ---- Tucker comes down: face first, a skid, the dirt
      if (t === FLY_B) {
        playSound('thud', 1, -6); playSound('splat', 0.9, -4); playSound('crunch', 0.7, -2); shakeScreen(state, 8, 4);
        const hx = X(TUCKER_AT - 26) + 44;
        puffs(s, 6, hx, GY - 4, 40, '#A8845A', 22, 0.6, 70, 0.6);
        bits(s, 6, hx, GY - 6, 20, [1, 5], [-6, -2], ['#7A5A38', '#5A3A1E', '#B8935A'], [3, 6]);
      }
      if (t === CAP_B) playSound('land', 0.5, 8);
      // ---- Meathead tumbles out of the cab after him
      if (t === 140) {
        p.hidden = false; p.carried = false;
        teleport(state, X(40), GY - 200);
        p.vel.x = 4; p.vel.y = -6; p.facing = 1;
        s.mhOut = true;
        aim(state, s);
      }
      if (t >= 178 && s.mhOut && p.isGrounded) {
        s.phase = 'arrive'; s.pt = 0; s.mhDone = false; arriveVisit = s.visit;
        meatheadSays(state, pickLine(byPants(state, ARRIVE)), true, () => { if (ok()) s.mhDone = true; });
      }
      break;
    }
    case 'arrive':
      if (s.mhDone && s.pt > 24) { s.phase = 'run'; s.pt = 0; s.sx = X(900); playSound('slam', 0.4, 6); }
      break;
    case 'run':
      // (out round the back of FIRST AID with the stretcher, at a run)
      s.sx -= 5;
      if (s.sx <= X(TUCKER_AT)) {
        s.sx = X(TUCKER_AT); s.phase = 'load'; s.pt = 0; s.lineDone = false;
        speak(TOWN_VOICES.woman, pickLine(byPants(state, MEDIC)), said => { if (ok()) s.medicSaid = said; }, true, () => { if (ok()) { s.lineDone = true; s.medicSaid = null; } });
      }
      break;
    case 'load':
      // (rolled over onto it, his cap on his chest)
      if (s.pt === 12) playSound('thud', 0.6, 2);
      if (s.pt > 60 && s.lineDone) { s.phase = 'carry'; s.pt = 0; s.mhDone = false; }
      break;
    case 'carry':
      if (s.pt > 16) s.sx += 2.6;
      if (s.pt === 24) meatheadSays(state, pickLine(byPants(state, STRETCHER)), true, () => { if (ok()) s.mhDone = true; });
      if (s.sx - 70 > X(DOOR_B)) { s.phase = 'in'; s.pt = 0; playSound('slam', 0.6, 2); }
      break;
    case 'in':
      if (s.mhDone && s.pt > 20) end(state, s);
      break;
  }
  return hands();
};

/** The scene's over: him his own again, the camera the town's. */
const end = (state: GameState, s: Crash) => {
  s.phase = 'done'; s.token++; s.medicSaid = null;
  const p = state.player;
  p.inCutscene = false; p.hidden = false; p.carried = false; p.untouchable = false;
  state.cameraOverride = null;
  for (const e of s.held) e.puppet = false;
  s.held.clear();
};
/** SKIP >>: straight to the aftermath (him at the stop, the wreck as it ended up, Tucker in FIRST AID). */
const skip = (state: GameState, s: Crash) => {
  silenceAll();
  const p = state.player;
  if (!s.mhOut || !p.isGrounded) teleport(state, X(200), GY);
  p.vel.x = 0; p.vel.y = 0;
  s.bits = s.bits.filter(b => b.rest); s.puffs = [];
  townOf(state).zoom = 0.8;
  state.camera.x = X(100);
  end(state, s);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the wreck (behind everything that moves), what's flying (in front), the fade in and SKIP (on the screen)

const RED = '#A3262A', RED_L = '#D4483E', BLACK = '#26262C', BRASS = '#E0B040', WOOD = '#8A5A30', GLASS = '#BFE0F8';

const wheel = (c: Ctx, x: number, y: number, r: number, a: number, col = RED) => {
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 1.5, 0, TAU); c.fill();
  c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.fillStyle = mix(col, '#000000', 0.45); c.beginPath(); c.arc(x, y, r - 3, 0, TAU); c.fill();
  c.strokeStyle = mix(col, '#FFFFFF', 0.2); c.lineWidth = 2;
  for (let k = 0; k < 8; k++) { const q = a + (k * Math.PI) / 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(q) * (r - 3), y + Math.sin(q) * (r - 3)); c.stroke(); }
  c.fillStyle = BRASS; c.beginPath(); c.arc(x, y, 3, 0, TAU); c.fill();
};
const poly = (c: Ctx, pts: number[], col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
const tongue = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => {
  c.fillStyle = col; c.beginPath(); c.moveTo(x - w / 2, y); c.quadraticCurveTo(x - w / 2, y - h * 0.55, x, y - h); c.quadraticCurveTo(x + w / 2, y - h * 0.55, x + w / 2, y); c.closePath(); c.fill();
};
/** A fire: tongues of flame flickering, a column of smoke off it. k 0..1 how far it's caught. */
const fire = (c: Ctx, x: number, y: number, size: number, f: number, seed: number, k: number) => {
  if (k <= 0) return;
  const sz = size * k;
  for (let i = 0; i < 6; i++) {
    const q = (f * 0.01 + i / 6 + seed * 0.37) % 1;
    c.globalAlpha = 0.42 * (1 - q) * k; c.fillStyle = mix('#27272A', '#78716C', q);
    c.beginPath(); c.arc(x + Math.sin(q * 5 + seed) * 12 + q * 50, y - sz - q * 220, sz * 0.45 + q * sz * 1.6, 0, TAU); c.fill();
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 4; i++) {
    const fl = Math.sin(f * 0.45 + i * 2.1 + seed) * 0.22 + 0.86;
    tongue(c, x + (i - 1.5) * sz * 0.32, y, sz * (0.55 - i * 0.06), sz * (1.3 - i * 0.14) * fl, i % 2 ? '#F97316' : '#DC2626');
  }
  tongue(c, x + Math.sin(f * 0.3 + seed) * 2, y, sz * 0.36, sz * 0.85 * (Math.sin(f * 0.6 + seed) * 0.2 + 0.9), '#FDE047');
};

/** The engine (the train's, at its size), its nose's foot at (x, GY), tipped `tilt` (+: its back end up), its front
 *  stove in `crush`. No lit tops: it's wreck, not a ledge. */
const drawLoco = (c: Ctx, x: number, tilt: number, crush: number, hit: boolean) => {
  c.save(); c.translate(x, GY); c.rotate(tilt); c.scale(ES, ES);
  const b1 = -64 - crush, roll = x / (24 * ES);
  // (the frame, the drivers and their rods (snapped once it's hit), the pilot wheels)
  box(c, -362, -36, 340 - crush, 12, INK);
  for (const wx of [-320, -250, -180]) wheel(c, wx, -24, 24, roll);
  wheel(c, -112 - crush * 0.5, -12, 12, roll * 2); wheel(c, -72 - crush * 0.8, -12, 12, roll * 2);
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(-320, -14); c.lineTo(-180, -14); c.stroke();
  c.strokeStyle = '#C8C8D0'; c.lineWidth = 3; c.stroke();
  c.strokeStyle = '#A1A1AA'; c.lineWidth = 3; c.beginPath(); c.moveTo(-180, -14);
  if (hit) c.lineTo(-150, 6); else c.lineTo(-112, -30);
  c.stroke();
  // (the cab: red, its roof, the window blown out)
  box(c, -366, -198, 112, 10, BLACK);
  box(c, -362, -190, 104, 156, INK); box(c, -360, -188, 100, 152, RED);
  box(c, -360, -150, 100, 4, mix(RED, '#000000', 0.25));
  box(c, -344, -166, 42, 36, '#1A1210');
  if (hit) { poly(c, [-344, -166, -334, -166, -340, -150], GLASS); poly(c, [-302, -130, -310, -130, -304, -146], GLASS); }
  else box(c, -340, -162, 10, 4, '#8AA8C0');
  // (the boiler: dented, its bands, the domes, the stack bent forward, the smokebox front stove in)
  box(c, -258, -134, b1 + 258, 72, INK); box(c, -256, -132, b1 + 254, 68, BLACK); box(c, -256, -100, b1 + 254, 3, '#18181C');
  for (let k = 1; k < 4; k++) { const bx = -256 + k * (b1 + 254) / 4; box(c, bx, -134, 5, 72, k === 3 && hit ? '#926E16' : BRASS); }
  box(c, -210, -154, 26, 22, INK); box(c, -208, -152, 22, 20, BRASS);
  box(c, -150, -148, 14, 14, BRASS);
  c.save(); c.translate(-96, -130); c.rotate(hit ? 0.35 : 0);
  poly(c, [-14, 0, -24, -60, 22, -60, 12, 0], INK); poly(c, [-12, 0, -21, -57, 19, -57, 10, 0], BLACK); box(c, -24, -63, 46, 6, BRASS);
  c.restore();
  if (hit) {
    poly(c, [b1, -136, b1 + 14, -120, b1 + 4, -104, b1 + 18, -86, b1 + 6, -70, b1 + 12, -60, b1 - 6, -60, b1 - 6, -136], '#18181C');
    poly(c, [b1 + 6, -128, b1 + 12, -118, b1 + 6, -112], '#52525B');
    // (the headlamp, smashed hanging off)
    box(c, b1 - 4, -150, 24, 20, INK); box(c, b1 - 2, -148, 20, 16, WOOD); box(c, b1 + 4, -144, 9, 9, '#3F3F46');
    // (the cowcatcher crumpled under it)
    poly(c, [b1 - 4, -40, b1 + 30, -10, b1 + 18, -2, b1 - 4, -2], INK);
    c.strokeStyle = RED_L; c.lineWidth = 3; c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(b1 + k * 6, -4); c.lineTo(b1 + 2 + k * 4, -34 + k * 5); } c.stroke();
  } else {
    box(c, b1, -138, 18, 80, INK); box(c, b1 + 2, -136, 14, 76, '#3F3F46');
    box(c, b1 - 6, -164, 28, 26, INK); box(c, b1 - 4, -162, 24, 22, WOOD); box(c, b1 + 4, -157, 12, 12, '#FDE68A');
    poly(c, [b1 + 14, -40, b1 + 56, -2, b1 + 14, -2], INK);
    c.strokeStyle = RED_L; c.lineWidth = 3; c.beginPath(); for (let k = 0; k < 5; k++) { c.moveTo(b1 + 16 + k * 7, -4); c.lineTo(b1 + 16, -36 + k * 7); } c.stroke();
  }
  c.restore();
};

/** The tender: coal heaped on it, lettered, on two trucks (its rear's foot at the pose's point). */
const drawTender = (c: Ctx, p: Pose, hit: boolean) => {
  const [x, y] = onCar(p, 0, 0);
  c.save(); c.translate(x, y); c.rotate(p.a);
  for (const wx of [50, 110, 290, 350]) wheel(c, wx, -20, 20, x / 20 + wx, '#52525B');
  box(c, 0, -48, 400, 12, INK);
  box(c, 2, -150, 396, 104, INK); box(c, 4, -148, 392, 100, BLACK); box(c, 4, -112, 392, 10, RED);
  if (hit) { poly(c, [300, -148, 330, -148, 316, -110, 336, -80, 304, -100], '#18181C'); box(c, 120, -120, 40, 3, '#52525B'); }
  // (the coal, heaped up over its sides; spilling once it's hit)
  c.fillStyle = '#18181B'; c.beginPath(); c.moveTo(10, -148);
  for (let k = 0; k <= 12; k++) c.lineTo(10 + k * 31, -160 - Math.abs(Math.sin(k * 1.7)) * 22 - (hit && k > 8 ? 10 : 0));
  c.lineTo(390, -148); c.closePath(); c.fill();
  for (let k = 0; k < 10; k++) box(c, 20 + k * 37, -164 - (k % 3) * 5, 5, 3, '#3F3F46');
  c.restore();
};

/** A coach: maroon, a clerestory roof, a row of windows (smashed once it's hit), on two trucks. */
const drawCoach = (c: Ctx, p: Pose, hit: boolean) => {
  const [x, y] = onCar(p, 0, 0);
  c.save(); c.translate(x, y); c.rotate(p.a);
  for (const wx of [50, 100, 380, 430]) wheel(c, wx, -18, 18, x / 18 + wx, '#52525B');
  box(c, 0, -46, 480, 12, INK);
  box(c, 0, -300, 480, 256, INK); box(c, 2, -298, 476, 252, '#5A2A3A'); box(c, 2, -110, 476, 64, '#341620');
  box(c, -8, -316, 496, 18, INK); box(c, -6, -314, 492, 14, '#2A1A1E');
  box(c, 40, -330, 400, 16, INK); box(c, 42, -328, 396, 12, '#3A1E24');
  for (let k = 0; k < 8; k++) {
    const wx = 26 + k * 56;
    box(c, wx, -260, 36, 64, INK);
    box(c, wx + 2, -258, 32, 60, hit ? '#120A0C' : '#2A3A4A');
    if (hit && k % 2 === 0) poly(c, [wx + 2, -258, wx + 16, -258, wx + 6, -236], GLASS);
    if (!hit) box(c, wx + 5, -254, 8, 3, '#8AA8C0');
  }
  box(c, 140, -282, 200, 14, INK); box(c, 142, -280, 196, 10, '#C8A070');
  if (hit) {
    // (the front end burst: the end wall split, splinters)
    poly(c, [470, -300, 480, -300, 480, -46, 452, -46, 462, -120, 446, -180, 466, -220], '#120A0C');
    c.strokeStyle = '#C8A070'; c.lineWidth = 2; c.beginPath(); c.moveTo(452, -150); c.lineTo(500, -170); c.moveTo(458, -210); c.lineTo(496, -240); c.moveTo(450, -90); c.lineTo(492, -70); c.stroke();
    c.strokeStyle = '#120A0C'; c.lineWidth = 2; c.beginPath(); c.moveTo(200, -298); c.lineTo(214, -250); c.lineTo(196, -200); c.lineTo(220, -140); c.stroke();
  }
  c.restore();
};

/** The platform's canopy: on posts, dimmed and sloped (not a ledge). `broken`: smashed down by the engine (0..1 its
 *  fall); `front` the half of it drawn in front of the engine (the slab come down on it). */
export const drawCanopy = (c: Ctx, broken: number, front = false) => {
  c.save(); c.globalAlpha = 0.62;
  if (broken <= 0) {
    if (!front) {
      for (const px of [205, 290, 370]) { box(c, X(px) - 4, GY - 204, 8, 204, INK); box(c, X(px) - 3, GY - 204, 6, 204, '#6B4423'); }
      poly(c, [X(180), GY - 204, X(398), GY - 214, X(402), GY - 200, X(176), GY - 192], INK);
      poly(c, [X(182), GY - 203, X(396), GY - 212, X(398), GY - 202, X(180), GY - 194], '#7A5230');
    }
  } else if (!front) {
    // (the posts snapped off short, the last one knocked over leaning)
    for (const px of [205, 290]) { box(c, X(px) - 4, GY - 54, 8, 54, INK); box(c, X(px) - 3, GY - 54, 6, 54, '#6B4423'); poly(c, [X(px) - 4, GY - 54, X(px), GY - 66, X(px) + 4, GY - 54], '#C8A070'); }
    c.save(); c.translate(X(372), GY); c.rotate(0.55 * broken);
    box(c, -4, -204, 8, 204, INK); box(c, -3, -204, 6, 204, '#6B4423');
    c.restore();
  } else {
    // (the roof come down: one end up on the boiler, the other down on the platform)
    const k = broken;
    c.save(); c.translate(X(190), GY - 204 - 34 * k); c.rotate(0.62 * k);
    poly(c, [-6, 0, 222, -10, 226, 4, -4, 12], INK); poly(c, [-4, 1, 220, -8, 222, 2, -2, 10], '#7A5230');
    poly(c, [222, -10, 236, -18, 230, 0, 240, 8, 226, 4], '#C8A070');
    c.restore();
  }
  c.restore();
};

/** The guests: on the platform, then running for it, then (stopped well clear) gawking. */
const drawGuests = (c: Ctx, t: number, f: number) => {
  for (const [seed, a, b, end] of GUESTS) {
    const run = t >= RUN_AT, x = run ? Math.min(b, a + 4.5 * (t - RUN_AT)) : a, there = x >= b;
    const pose: PersonPose = !run ? 'stand' : there ? end : 'walk';
    const mood = !run ? (t < -26 ? 'bored' : 'scared') : there ? 'shocked' : 'scared';
    c.save(); c.translate(Math.round(X(x)), GY - 6); c.scale(!run || there ? -1 : 1, 1);
    drawPerson(c, { seed, outfit: 'guest', f: f + seed, pose, mood });
    c.restore();
  }
};

/** A park paramedic: white shirt, navy trousers, a red cross on the chest (feet at x on the ground). */
const medic = (c: Ctx, x: number, seed: number, woman: boolean, f: number, facing: number, pose: PersonPose) => {
  c.save(); c.translate(Math.round(x), GY); c.scale(facing, 1);
  drawPerson(c, { seed, outfit: 'guest', f, pose, woman, mood: 'bored', look: { shirt: '#F1F5F9', pants: '#1E3A8A' } });
  box(c, -1, -53, 9, 9, '#F8FAFC'); box(c, 2.5, -52, 2, 7, '#DC2626'); box(c, 0, -49.5, 7, 2, '#DC2626');
  c.restore();
};
const stretcher = (c: Ctx, x: number, top: number) => {
  box(c, x - 68, top + 2, 136, 4, INK); box(c, x - 67, top + 3, 134, 2, '#A1A1AA');
  box(c, x - 56, top - 3, 112, 6, INK); box(c, x - 55, top - 2, 110, 4, '#E7E5E4');
  box(c, x - 46, top + 6, 3, 6, '#71717A'); box(c, x + 43, top + 6, 3, 6, '#71717A');
};

/** Tucker laid out, his middle at (x, y): sy 1 face up, −1 face down (his head to the right either way); spun `spin`. */
const lying = (c: Ctx, state: GameState, x: number, y: number, sy: number, spin: number) => {
  c.save(); c.translate(x, y); c.rotate(spin); c.scale(1, Math.abs(sy) < 0.05 ? 0.05 * Math.sign(sy || 1) : sy);
  drawTucker(c, -28, 16, -1, state.frame, 'flat', { face: 'out', wounds: tuckerWoundsOf(state) });
  c.restore();
};

/** Where the stretcher's top is, and Tucker on (or by) it, in the paramedics' phases. */
const loadState = (s: Crash) => {
  const top = s.phase === 'carry' || s.phase === 'in' ? GY - 10 - 34 * clamp01(s.pt / 16) : s.phase === 'load' ? GY - 10 : GY - 40;
  const roll = s.phase === 'load' ? clamp01((s.pt - 10) / 24) : s.phase === 'carry' || s.phase === 'in' ? 1 : 0;
  return { top, roll };
};

/** The wreck (or the crash happening): behind everything that moves. Called by art.ts's end of the line (the visit of
 *  the crash) after the depot and FIRST AID. */
export const drawWreck = (c: Ctx, state: GameState) => {
  const s = mine(), f = state.frame;
  const t = s && s.phase !== 'done' ? s.t : AFTER;
  const hit = t >= 0;
  // ---- the rails: torn up past where the stop was, curled up out of the ties
  if (hit) {
    for (let x = X(100); x < X(250); x += 26) box(c, x + hash(x) * 10, GY - 3 + hash(x * 3) * 3, 14, 4, '#5A3A1E');
    c.strokeStyle = '#71717A'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(X(96), GY - 4); c.quadraticCurveTo(X(200), GY - 8, X(236), GY - 70); c.quadraticCurveTo(X(250), GY - 104, X(226), GY - 118); c.stroke();
    c.beginPath(); c.moveTo(X(100), GY - 2); c.quadraticCurveTo(X(180), GY - 4, X(262), GY - 34); c.quadraticCurveTo(X(300), GY - 48, X(304), GY - 30); c.stroke();
    c.lineCap = 'butt';
  } else {
    box(c, X(100), GY - 5, X(200) - X(100), 4, '#71717A');
    for (let x = X(100); x < X(200); x += 26) box(c, x, GY - 3, 14, 4, '#5A3A1E');
  }
  // ---- the depot's front: a hole stove in it, once the engine's into it
  const nose = noseAt(t);
  if (nose > 380) {
    const hx = Math.min(nose, NOSE_END) + 30;
    poly(c, [X(372), GY, X(368), GY - 120, X(388), GY - 168, X(404), GY - 150, X(424), GY - 214, X(446), GY - 190, X(hx - 20), GY - 236, X(hx), GY - 200, X(hx + 12), GY - 120, X(hx + 4), GY], '#140D08');
    c.strokeStyle = '#C8A070'; c.lineWidth = 2; c.beginPath();
    for (const [a, b, d, e] of [[368, 120, 352, 132], [388, 168, 380, 186], [424, 214, 418, 236], [446, 190, 458, 206], [hx, 200, hx + 18, 214], [hx + 12, 120, hx + 30, 112]]) { c.moveTo(X(a), GY - b); c.lineTo(X(d), GY - e); }
    c.stroke();
  }
  // ---- the canopy (behind the engine)
  const fall = hit ? clamp01((t - 2) / 12) : 0;
  drawCanopy(c, hit ? Math.max(0.01, fall) : 0);
  // ---- the buffer stop: whole, or smashed flat and its striped beam gone
  const bx = X(NOSE_HIT);
  if (!hit) {
    box(c, bx - 16, GY - 52, 34, 52, INK); box(c, bx - 15, GY - 51, 32, 51, '#5A3A1E');
    for (let k = 0; k < 3; k++) box(c, bx - 15, GY - 46 + k * 14, 32, 7, k % 2 ? '#F8FAFC' : '#DC2626');
  } else {
    poly(c, [bx - 20, GY, bx - 16, GY - 22, bx - 4, GY - 30, bx + 6, GY - 16, bx + 22, GY - 26, bx + 26, GY], INK);
    poly(c, [bx - 17, GY, bx - 14, GY - 20, bx - 4, GY - 27, bx + 5, GY - 13, bx + 20, GY - 23, bx + 23, GY], '#5A3A1E');
  }
  // ---- the train: the coach, the tender, the engine
  const tp = carAt(TENDER, t), cp = carAt(COACH, t);
  drawCoach(c, cp, t >= COACH.th);
  drawTender(c, tp, t >= TENDER.th);
  drawLoco(c, X(nose), tiltAt(t), crushAt(t), hit);
  if (hit) drawCanopy(c, Math.max(0.01, fall), true);
  // ---- the fires catching (the cab, the coal, the coach's front), the steam still pouring off the boiler
  const k = clamp01((t - 24) / 50);
  if (k > 0) {
    const [ax, ay] = onEngine(t, -323, -134);
    fire(c, ax, ay, 30, f, 1, k);
    const [cx, cy] = onCar(tp, 230, -168);
    fire(c, cx, cy, 34, f, 2, k);
    const [dx, dy] = onCar(cp, 420, -60);
    fire(c, dx, dy, 44, f, 3, k);
    const [ex, ey] = onCar(cp, 300, -150);
    fire(c, ex, ey, 22, f, 4, k * 0.8);
  }
  if (hit) {
    const [sx, sy] = onEngine(t, -90, -140);
    for (let n = 0; n < 8; n++) {
      const q = ((f * 0.7 + n * 25) % 200) / 200;
      c.globalAlpha = 0.5 * (1 - q); c.fillStyle = '#F1F5F9';
      c.beginPath(); c.arc(sx + n * 6 - q * 30, sy - q * 240, 16 + q * 50, 0, TAU); c.fill();
    }
    // (a jet of it hissing out of a split in the boiler's side)
    const [jx, jy] = onEngine(t, -200, -100);
    for (let n = 0; n < 5; n++) { const q = ((f * 1.6 + n * 9) % 45) / 45; c.globalAlpha = 0.55 * (1 - q); c.beginPath(); c.arc(jx - 6 + q * 70, jy + 4 - q * 26, 5 + q * 18, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
  }
  // ---- what came down and lay where it fell: the scene's own, or (skipped) strewn as it would be
  if (s) { for (const b of s.bits) if (b.rest) bit(c, b); }
  else for (let i = 0; i < 46; i++) {
    const x = X(-560 + hash(i * 7.3) * 1200), w = 8 + hash(i * 3.1) * 22;
    if (x > X(660) && x < X(830)) continue;
    bit(c, { x, y: GY - 3, vx: 0, vy: 0, a: (hash(i) - 0.5) * 0.5, va: 0, w, h: 3 + hash(i * 9) * 4, col: ['#5A3A1E', '#8A6A40', '#18181B', '#C8A070', '#3F3F46', '#5A2A3A'][i % 6], rest: true });
  }
  // ---- the people: the guests, Tucker and his cap, the paramedics
  drawGuests(c, t, f);
  if (s && s.phase !== 'done') drawPeople(c, state, s);
};

/** Tucker (thrown, face down in the dirt, rolled onto the stretcher, carried in), his cap, the paramedics. */
const drawPeople = (c: Ctx, state: GameState, s: Crash) => {
  const t = s.t, f = state.frame, sx = s.sx;
  const loading = s.phase === 'load', carrying = s.phase === 'carry' || s.phase === 'in';
  const { top, roll } = loadState(s);
  // (his middle, on or by the stretcher, while they've got him)
  const ty = loading ? GY - 16 + (top - 15 - (GY - 16)) * roll : top - 15;
  // (going in: whatever's past the door's far edge is inside)
  c.save();
  if (carrying) { c.beginPath(); c.rect(X(-2000), -5000, X(DOOR_B) - X(-2000), 10000); c.clip(); }
  // ---- him, before they've got him: thrown, then face down in the dirt, his face buried (the dirt plowed up over it)
  if (!loading && !carrying) {
    if (t >= FLY_A && t < FLY_B) {
      const q = tuckerFlight(t);
      lying(c, state, q.x, q.y, -1, q.spin);
    } else if (t >= FLY_B) {
      const tx = X(TUCKER_AT - 26) + skidAt(t);
      lying(c, state, tx, GY - 16, -1, 0);
      const mx = tx + 42, g = clamp01((t - FLY_B) / SKID);
      c.fillStyle = INK; c.beginPath(); c.ellipse(mx, GY - 2, 4 + 15 * g, 3 + 7 * g, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#8A6A44'; c.beginPath(); c.ellipse(mx, GY - 2, 3 + 14 * g, 2 + 6 * g, 0, Math.PI, 0); c.fill();
      for (let i = 0; i < 4; i++) box(c, mx - 12 + i * 8, GY - 3 - (i % 2) * 3, 3, 2, '#5A3A1E');
    }
  }
  // ---- the paramedics and the stretcher: running out with it; down beside him, him rolled over onto it (face up);
  // carried in
  if (s.phase === 'run') {
    stretcher(c, sx, GY - 40);
    medic(c, sx - 60, 23, true, f, -1, 'walk'); medic(c, sx + 60, 58, false, f + 7, -1, 'walk');
  } else if (loading) {
    stretcher(c, sx, GY - 10);
    medic(c, sx - 62, 23, true, f, 1, 'hold'); medic(c, sx + 62, 58, false, f + 7, -1, 'hold');
    lying(c, state, sx, ty, -Math.cos(roll * Math.PI), 0);
  } else if (carrying) {
    medic(c, sx - 60, 23, true, f, 1, s.pt > 16 ? 'walk' : 'hold');
    stretcher(c, sx, top);
    lying(c, state, sx, ty, 1, 0);
  }
  // ---- his cap: off in the hit, down after him; put on his chest as they load him
  if (t >= CAP_A) {
    let cx: number, cy: number, rot: number;
    if (t < CAP_B) { const q = capFlight(t); cx = q.x; cy = q.y; rot = q.rot; }
    else {
      cx = X(CAP_REST.x); cy = CAP_REST.y; rot = CAP_REST.rot;
      const on = loading ? clamp01((s.pt - 30) / 20) : carrying ? 1 : 0;
      if (on > 0) { cx += (sx + 8 - cx) * on; cy += (ty - 19 - cy) * on; rot += (0.15 - rot) * on; }
    }
    drawTuckerCap(c, cx, cy, rot);
  }
  if (carrying) medic(c, sx + 60, 58, false, f + 7, 1, s.pt > 16 ? 'walk' : 'hold');
  c.restore();
};

const bit = (c: Ctx, b: Bit) => {
  c.save(); c.translate(b.x, b.y); c.rotate(b.a);
  box(c, -b.w / 2 - 1, -b.h / 2 - 1, b.w + 2, b.h + 2, INK); box(c, -b.w / 2, -b.h / 2, b.w, b.h, b.col);
  c.restore();
};

/** In front of everything: the wreckage flying, the dust and the steam rolling over it, the paramedic's words. */
export const drawCrashFront = (c: Ctx, state: GameState) => {
  const s = mine();
  if (!s) return;
  for (const b of s.bits) if (!b.rest) bit(c, b);
  for (const q of s.puffs) {
    c.globalAlpha = q.a * (1 - q.t / q.life); c.fillStyle = q.col;
    c.beginPath(); c.arc(q.x, q.y, q.r, 0, TAU); c.fill();
  }
  c.globalAlpha = 1;
  if (s.medicSaid && s.phase === 'load') saidOver(c, s.medicSaid.text, s.sx - 62, GY - 104, '#FDE68A');
};

/** On the screen: the fade in from the train's black, and SKIP >>. */
export const drawCrashHud = (c: Ctx, _state: GameState) => {
  const s = mine();
  if (!s || s.phase === 'done') return;
  const a = 1 - (s.t + IN) / 16;
  if (a > 0) { c.fillStyle = `rgba(0, 0, 0, ${a})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  drawSkipPrompt(c, CANVAS_WIDTH);
};

/** The fires' light (after dark), the visit of the crash. */
export const wreckLights = (state: GameState) => {
  const s = mine(), t = s && s.phase !== 'done' ? s.t : AFTER;
  if (t < 24) return [];
  const a = 0.34 * clamp01((t - 24) / 50);
  const out = [onEngine(t, -323, -134), onCar(carAt(TENDER, t), 230, -168), onCar(carAt(COACH, t), 420, -60)];
  void state;
  return out.map(([x, y]) => ({ x, y: y - 20, r: 170, a, color: '#6A3010' }));
};
