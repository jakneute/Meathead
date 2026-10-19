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
import { drawGuest, type GuestPose, type GuestMood } from './people';
import { drawMachine, ENG } from '../train/engineArt';
import { drawBase, drawExt, drawTop, truck, windows, WIN_T, WIN_W, WIN_H } from '../train/carArt';
import { N, STEEL, BLACK, BRASS, RED as TRED, COAL, VARNISH, flame, puff } from '../train/paint';
import { CARS } from '../train/layout';
/** Cedar shakes (the platform canopy's: paint.ts's own, here to keep this module out of the view's import loop). */
const SHINGLE = ['#1A0E08', '#2E1A0E', '#462816', '#5E3820', '#78482A', '#946038', '#B07A4C'];
import { meatheadSays, speak, byPants, saidOver, hands, landVisit, teleport, tuckerWoundsOf, type Said } from '../section';
import { box, mix, INK, hash, type Ctx } from '../kit';
import { drawTucker, drawTuckerCap } from '../tucker';
import { takeCrashScene } from '../train/engine';
import { GY } from '../geometry';
import { townOf } from './state';
import { X } from './layout';
import { TOWN_VOICES, ARRIVE, STRETCHER, MEDIC } from './lines';
import { drawImpactBack, drawImpactFront, drawYardWreck, drawCoalHeap, stoveIn, holeAt, BURST } from './impact';

const TAU = Math.PI * 2;
/** The train's speed coming in (px a frame), the frames of it before the stop. */
const V = 18, IN = 50;
/** The engine's drawing (the train's, train/engineArt.ts) to the crash's old units (its first pass's 360 long at 600). */
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
/** The depot's stove in (its own drawing leaves the impact point to impact.ts): from the nose's burst on, and after. */
export const depotStoveIn = () => { const s = mine(); return stoveIn(s && s.phase !== 'done' ? s.t : AFTER); };
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
const COACH: CarDef = { len: 620, base: NOSE_HIT - 600 - 12 - 400 - 12 - 620, th: 9, dur: 34, fin: { x: -1118, h: 152, a: 0.32 } };
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
  for (let i = 0; i < n && s.bits.length < 170; i++) {
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
      // (the depot's wall bowing ahead of the nose: dust sifting out of its seams)
      if (t >= 8 && t < BURST && t % 2 === 0) puffs(s, 1, X(380 + (t - 8) * 12), GY - 60 - Math.random() * 120, 30, '#8A7A62', 14, 0.45, 60, 0.3);
      if (t === 10) playSound('crunch', 0.8, -14);
      // (into the depot's front: the wall bursts, boards and studs and glass flying, the far window blowing out)
      if (t === BURST) {
        playSound('crash', 1, -4); playSound('glass', 1, -2); playSound('glass', 0.8, 4); shakeScreen(state, 20, 8);
        bits(s, 18, X(410), GY - 140, 160, [2, 12], [-11, -3], ['#B08A5A', '#8A6A40', '#7A6A4A', '#C8A070', '#BFE0F8'], [10, 30]);
        bits(s, 8, X(440), GY - 120, 120, [-6, 8], [-12, -5], ['#7A6A4A', '#B08A5A', '#5E4A30'], [26, 42]);
        bits(s, 12, X(380 + 196), GY - 122, 30, [1, 7], [-7, -2], ['#BFE0F8', '#E0F2FE', '#A8C0CE'], [2, 5]);
        bits(s, 10, X(420), GY - 130, 80, [-4, 6], [-9, -3], ['#BFE0F8', '#E0F2FE'], [2, 4]);
        const [hx, hy] = holeAt();
        puffs(s, 10, hx, hy + 40, 150, '#9A8A72', 44, 0.6, 170, 0.5);
      }
      // (the eaves coming down over it: shingles sliding off; the dust rolling out of the hole; embers off the
      // smoldering inside)
      if (t > BURST && t < BURST + 26 && t % 4 === 0) bits(s, 2, X(380 + 70), GY - 276, 70, [-3, 2], [-4, -1], ['#5E3820', '#462816', '#78482A'], [8, 12]);
      if (t > BURST && t < BURST + 60 && t % 3 === 0) {
        const [hx, hy] = holeAt(), n = s.puffs.length;
        puffs(s, 1, hx + 20, hy + 60 + Math.random() * 60, 60, Math.random() < 0.5 ? '#8A7A62' : '#6A5C4A', 30, 0.5, 150, 0.35);
        for (let i = n; i < s.puffs.length; i++) s.puffs[i].vx = -1.2 - Math.random() * 1.6;
      }
      if (t > BURST + 16 && t % 5 === 0) {
        const [hx] = holeAt();
        state.particles.push({ pos: { x: hx + 40 + Math.random() * 30, y: GY - 10 }, vel: { x: -0.6 + Math.random() * 1.2, y: -1.2 - Math.random() * 1.6 }, life: 30 + Math.random() * 30, color: Math.random() < 0.5 ? '#F97316' : '#FDE047', size: 1.5 + Math.random() });
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
        const [x, y] = onCar(carAt(COACH, t), 560, -200);
        bits(s, 12, x, y, 120, [-6, 6], [-11, -3], ['#5A2A3A', '#BFE0F8', '#341620', '#8A6A40'], [8, 20]);
        puffs(s, 8, X(-620), GY - 10, 240, '#B8935A', 46, 0.55, 160, 0.5);
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

// (the train's own: the same 4-4-0 No. 7 and the same cars as the train section, train/engineArt.ts, carArt.ts)
const CRASH_COACH = CARS.findIndex(d => d.kind === 'coach' && d.len === COACH.len);

const poly = (c: Ctx, pts: number[], col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
/** A fire: stepped flames flickering (the train's), a column of stepped smoke off it. k 0..1 how far it's caught. */
const fire = (c: Ctx, x: number, y: number, size: number, f: number, seed: number, k: number) => {
  if (k <= 0) return;
  const sz = size * k;
  for (let i = 0; i < 6; i++) {
    const q = (f * 0.01 + i / 6 + seed * 0.37) % 1;
    puff(c, x + Math.sin(q * 5 + seed) * 12 + q * 50, y - sz - q * 220, sz * 0.45 + q * sz * 1.6, [mix('#1C1A18', '#5A5650', q), mix('#2E2A26', '#7A746C', q), mix('#45403A', '#9A948A', q)], 0.5 * (1 - q) * k);
  }
  for (let i = 0; i < 3; i++) flame(c, x + (i - 1) * sz * 0.36, y, sz * (1.25 - Math.abs(i - 1) * 0.3), f + i * 7, seed + i);
};

/** The engine (the train's No. 7, train/engineArt.ts), its nose's foot at (x, GY), tipped `tilt` (+: its back end up);
 *  once it's hit, its front stove in (`crush`): the cowcatcher's slats crumpled back, the smokebox door caved, the
 *  headlamp smashed and hanging, steam bursting out of a split. Coming in: the smoke streaming, the whistle stuck on. */
const drawLoco = (c: Ctx, x: number, tilt: number, crush: number, hit: boolean, f: number) => {
  c.save(); c.translate(x, GY); c.rotate(tilt);
  const cab = -ENG.front, roll = x / ENG.dr;
  drawMachine(c, cab, -7, f, roll, !hit, !hit);
  if (hit) {
    const k = Math.min(1, crush / 36), S = N(STEEL), B = N(BLACK), Rd = N(TRED);
    // (the cowcatcher crumpled back: its slats bent every which way, a black tangle)
    poly(c, [-96, -94, -96 + 40 * (1 - k * 0.6), -8, -96 + 30 * (1 - k * 0.6), -2, -100, -2], INK);
    for (let n = 0; n < 6; n++) { c.strokeStyle = n % 2 ? Rd[5] : Rd[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(-94 + n * 6 * (1 - k * 0.5), -4); c.lineTo(-92 + n * 2, -20 - n * 9 + (n % 2) * 6); c.lineTo(-86 + n * 4 + (n % 3) * 4, -40 - n * 7); c.stroke(); }
    // (the smokebox's front caved in: dented black, its number plate's brass ring torn, rivets popped)
    poly(c, [-100, -238, -92 + 6 * k, -222, -98, -196, -90 + 8 * k, -168, -98, -140, -92, -114, -104, -112, -106, -236], B[1]);
    poly(c, [-102, -226, -96, -212, -100, -194], B[4]);
    c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.arc(-124, -175, 19, -0.9, 1.3); c.stroke();
    c.strokeStyle = BRASS[2]; c.lineWidth = 3; c.stroke();
    for (let n = 0; n < 5; n++) box(c, -104 + n * 3, -150 + n * 6, 2, 2, S[6]);
    // (the headlamp's glass smashed out, its lens dark, a crack down its box)
    c.fillStyle = INK; c.beginPath(); c.arc(-52, -269, 20, 0, TAU); c.fill();
    c.fillStyle = '#1A1410'; c.beginPath(); c.arc(-52, -269, 17, 0, TAU); c.fill();
    for (const [gx, gy] of [[-62, -280], [-48, -262], [-58, -258]] as const) poly(c, [gx, gy, gx + 5, gy - 5, gx + 8, gy + 3], '#D8E8F0');
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-80, -298); c.lineTo(-74, -276); c.lineTo(-82, -252); c.stroke();
    // (the pilot beam bent up in the middle, its coupler knocked askew)
    poly(c, [-104, -18, -62, -12, -40, -26, -10, -10, -10, -2, -40, -16, -62, -4, -104, -8], INK);
    poly(c, [-102, -16, -62, -10, -40, -23, -12, -8, -12, -4, -40, -18, -62, -6, -102, -10], Rd[3]);
    poly(c, [-102, -16, -62, -10, -40, -23, -40, -21, -62, -8, -102, -14], Rd[5]);
    box(c, -60, -22, 12, 8, INK); box(c, -59, -21, 10, 6, S[3]); box(c, -59, -21, 10, 1, S[5]);
    // (dents stove into the smokebox's side: stepped shadows, their lit lips)
    for (const [dx, dy, r] of [[-130, -206, 11], [-118, -160, 9], [-140, -132, 7]] as const) {
      c.fillStyle = B[0]; c.beginPath(); c.ellipse(dx, dy, r, r * 1.3, 0.3, 0, TAU); c.fill();
      c.fillStyle = B[1]; c.beginPath(); c.ellipse(dx + 2, dy + 2, r * 0.7, r * 0.9, 0.3, 0, TAU); c.fill();
      c.strokeStyle = B[5]; c.lineWidth = 1; c.beginPath(); c.ellipse(dx, dy, r, r * 1.3, 0.3, Math.PI * 0.9, Math.PI * 1.6); c.stroke();
    }
    // (a main rod snapped: its broken half hanging down off the crosshead into the dirt, its end ragged)
    c.save(); c.translate(-236, -62); c.rotate(1.1);
    box(c, -2, -5, 64, 10, INK); box(c, -1, -4, 62, 8, S[3]); box(c, -1, -4, 62, 2, S[5]); box(c, -1, 2, 62, 2, S[1]);
    poly(c, [61, -4, 66, -2, 62, 0, 67, 3, 61, 4], S[6]);
    c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 7, 0, TAU); c.fill(); c.fillStyle = S[4]; c.beginPath(); c.arc(0, 0, 5, 0, TAU); c.fill();
    c.restore();
    // (a steam pipe burst off the boiler's side: bent out, its end split open)
    c.lineCap = 'round';
    for (const [w, col] of [[8, INK], [5, S[3]], [1, S[6]]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(-352, -150); c.quadraticCurveTo(-338, -150, -334, -170); c.stroke(); }
    c.lineCap = 'butt';
    poly(c, [-340, -170, -334, -180, -328, -170], INK); poly(c, [-338, -171, -334, -177, -330, -171], '#1A1A1E');
  }
  c.restore();
};

/** A car of the train's at a pose (its rear's foot): its base and its body (the train's stills, kept under the turn),
 *  its trucks. */
const drawCar = (c: Ctx, p: Pose, kind: 'tender' | 'coach', len: number) => {
  const [x, y] = onCar(p, 0, 0);
  c.save(); c.translate(x, y); c.rotate(p.a); c.translate(0, -GY);
  for (const tx of [70, len - 70]) truck(c, tx, x / 18);
  drawBase(c, kind, len, 0);
  if (kind === 'coach') drawExt(c, kind, len, 0); else drawTop(c, kind, len, 0);
  c.restore();
};
/** The tender, wrecked: its side stove in, the coal spilling off it once it's hit. */
const drawTender = (c: Ctx, p: Pose, hit: boolean) => {
  drawCar(c, p, 'tender', TENDER.len);
  if (!hit) return;
  const [x, y] = onCar(p, 0, 0), C = N(COAL), B = N(BLACK);
  c.save(); c.translate(x, y); c.rotate(p.a);
  poly(c, [300, -190, 334, -190, 318, -150, 338, -112, 304, -132], B[0]);
  c.strokeStyle = B[5]; c.lineWidth = 2; c.beginPath(); c.moveTo(300, -188); c.lineTo(318, -150); c.stroke();
  for (let k = 0; k < 14; k++) { const cx = 330 + (k % 5) * 16 + hash(k) * 10, cy = -150 + Math.floor(k / 5) * 14 + hash(k * 3) * 8; box(c, cx - 1, cy - 1, 8, 7, INK); box(c, cx, cy, 6, 5, C[2 + (k % 3)]); box(c, cx, cy, 3, 1, C[6]); }
  c.restore();
};
/** The coach, wrecked: its windows smashed (shards hanging in the sashes, the curtains torn), its front end burst
 *  (the end wall split, the planks splintered out), soot over it once it's burning. */
const drawCoach = (c: Ctx, p: Pose, hit: boolean) => {
  drawCar(c, p, 'coach', COACH.len);
  if (!hit) return;
  const [x, y] = onCar(p, 0, 0), V = N(VARNISH), wt = WIN_T - GY;
  c.save(); c.translate(x, y); c.rotate(p.a);
  for (const [i, wx] of (CRASH_COACH >= 0 ? windows(CRASH_COACH) : []).entries()) {
    const l = wx - WIN_W / 2;
    box(c, l + 2, wt + 2, WIN_W - 4, WIN_H - 4, '#120A0C');
    for (const [gx, gy, gw] of [[l + 2, wt + 2, 12], [l + WIN_W - 12, wt + 2, 10], [l + 2, wt + WIN_H - 14, 8]] as const) poly(c, [gx, gy, gx + gw, gy, gx + gw * 0.4, gy + 14 + (i % 3) * 4], '#C8DCE8');
    if (i % 2) box(c, l + 4, wt + 4, 6, WIN_H - 20, '#7A1A20');
  }
  const L = COACH.len;
  poly(c, [L - 14, -376, L, -376, L, -64, L - 30, -64, L - 18, -150, L - 38, -230, L - 16, -290], '#120A0C');
  c.strokeStyle = INK; c.lineWidth = 5;
  for (const [a0, b0, a1, b1] of [[L - 30, -190, L + 26, -214], [L - 22, -262, L + 18, -298], [L - 34, -112, L + 20, -88], [L - 26, -150, L + 30, -146]]) { c.beginPath(); c.moveTo(a0, b0); c.lineTo(a1, b1); c.stroke(); }
  c.strokeStyle = V[4]; c.lineWidth = 3;
  for (const [a0, b0, a1, b1] of [[L - 30, -190, L + 26, -214], [L - 22, -262, L + 18, -298], [L - 34, -112, L + 20, -88], [L - 26, -150, L + 30, -146]]) { c.beginPath(); c.moveTo(a0, b0); c.lineTo(a1, b1); c.stroke(); }
  c.strokeStyle = '#120A0C'; c.lineWidth = 2; c.beginPath(); c.moveTo(260, -372); c.lineTo(276, -320); c.lineTo(254, -260); c.lineTo(282, -190); c.stroke();
  c.restore();
};

/** The platform's canopy: on posts, dimmed and sloped (not a ledge). `broken`: smashed down by the engine (0..1 its
 *  fall); `front` the half of it drawn in front of the engine (the slab come down on it). */
export const drawCanopy = (c: Ctx, broken: number, front = false) => {
  // (dimmed and sloped, its planks lit only faintly: not a ledge)
  const V = N(VARNISH).map(col => mix(col, '#5A6A7A', 0.3)), Sh = N(SHINGLE).map(col => mix(col, '#5A6A7A', 0.3));
  const post = (px: number, h: number) => { box(c, px - 5, GY - h, 10, h, INK); box(c, px - 4, GY - h, 8, h, V[3]); box(c, px - 4, GY - h, 2, h, V[5]); box(c, px + 2, GY - h, 2, h, V[1]); };
  const roof = () => {
    poly(c, [-6, 0, 222, -10, 226, 6, -4, 14], INK);
    poly(c, [-4, 1, 220, -8, 222, 4, -2, 12], Sh[3]);
    for (let k = 0; k < 220; k += 11) poly(c, [k, 1 - k * 0.045, k + 10, 1 - (k + 10) * 0.045, k + 10, 6 - (k + 10) * 0.045, k, 6 - k * 0.045], Sh[2 + ((k / 11) & 1)]);
    poly(c, [-2, 10, 222, 0, 222, 4, -2, 13], V[2]);
  };
  if (broken <= 0) {
    if (!front) {
      for (const px of [205, 290, 370]) post(X(px), 204);
      c.save(); c.translate(X(180), GY - 196); roof(); c.restore();
      for (const px of [205, 290, 370]) { box(c, X(px) - 12, GY - 196, 24, 4, V[2]); }
    }
  } else if (!front) {
    // (the posts snapped off short (splinters), the last one knocked over leaning)
    for (const px of [205, 290]) { post(X(px), 54); poly(c, [X(px) - 4, GY - 54, X(px) - 1, GY - 68, X(px) + 2, GY - 58, X(px) + 4, GY - 64, X(px) + 4, GY - 54], '#D8B880'); }
    c.save(); c.translate(X(372), GY); c.rotate(0.55 * broken);
    box(c, -5, -204, 10, 204, INK); box(c, -4, -204, 8, 204, V[3]); box(c, -4, -204, 2, 204, V[5]);
    c.restore();
  } else {
    // (the roof come down: one end up on the boiler, the other down on the platform, its shakes sliding off)
    const k = broken;
    c.save(); c.translate(X(190), GY - 204 - 34 * k); c.rotate(0.62 * k);
    roof();
    poly(c, [222, -10, 236, -18, 230, 0, 240, 8, 226, 4], '#D8B880');
    c.restore();
  }
};

/** The guests: on the platform, then running for it, then (stopped well clear) gawking. */
const drawGuests = (c: Ctx, t: number, f: number) => {
  for (const [seed, a, b, end] of GUESTS) {
    const run = t >= RUN_AT, x = run ? Math.min(b, a + 4.5 * (t - RUN_AT)) : a, there = x >= b;
    const pose: GuestPose = !run ? 'stand' : there ? end : 'walk';
    const mood: GuestMood = !run ? (t < -26 ? 'bored' : 'scared') : there ? 'shocked' : 'scared';
    drawGuest(c, X(x), GY - 6, { seed, f: f + seed, pose, mood, facing: !run || there ? -1 : 1 });
  }
};

/** A park paramedic: the park's white shirt with the red cross and a radio, navy trousers (feet at x on the ground). */
const medic = (c: Ctx, x: number, seed: number, woman: boolean, f: number, facing: number, pose: GuestPose) =>
  drawGuest(c, x, GY, { seed, f, pose, woman, outfit: 'medic', mood: 'bored', facing });
/** The stretcher: canvas on two poles, the poles' grips, its legs folded. */
const stretcher = (c: Ctx, x: number, top: number) => {
  const S = N(STEEL);
  box(c, x - 69, top + 1, 138, 6, INK); box(c, x - 68, top + 2, 136, 4, S[3]); box(c, x - 68, top + 2, 136, 1, S[6]);
  for (const gx of [x - 69, x + 59]) { box(c, gx, top + 1, 10, 6, INK); box(c, gx + 1, top + 2, 8, 4, '#3A2A1A'); }
  box(c, x - 57, top - 4, 114, 8, INK); box(c, x - 56, top - 3, 112, 6, '#E8E4D8'); box(c, x - 56, top - 3, 112, 2, '#F8F6F0'); box(c, x - 56, top + 2, 112, 1, '#B8B2A4');
  for (const sx of [x - 30, x + 20]) box(c, sx, top - 3, 6, 6, '#C83A3A');
  for (const lx of [x - 47, x + 42]) { box(c, lx, top + 6, 4, 7, INK); box(c, lx + 1, top + 6, 2, 6, S[4]); }
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
  // ---- the rails: torn up past where the stop was, curled up out of the ties (the ties kicked askew)
  const S = N(STEEL), Ti = N(['#1A120C', '#2A1E14', '#3C2C1E', '#4E3A28', '#624A34', '#7A5E44']);
  const tie = (x: number, y: number, a: number) => { c.save(); c.translate(x, y); c.rotate(a); box(c, -1, -1, 16, 6, INK); box(c, 0, 0, 14, 4, Ti[3]); box(c, 0, 0, 14, 1, Ti[5]); box(c, 2, 0, 2, 2, '#26262C'); box(c, 10, 0, 2, 2, '#26262C'); c.restore(); };
  if (hit) {
    // (the ground torn up, the buffer stop's stumps: impact.ts, a stamp)
    drawYardWreck(c, X(NOSE_HIT));
  } else {
    for (let x = X(100); x < X(200); x += 22) tie(x, GY - 4, 0);
    box(c, X(100), GY - 6, X(200) - X(100), 5, INK); box(c, X(100), GY - 5, X(200) - X(100), 3, S[3]); box(c, X(100), GY - 5, X(200) - X(100), 1, S[6]);
  }
  // ---- the depot's front stove in round the nose: the room inside through the hole, the attic, the eaves' far end
  //      shoved up (impact.ts: behind the engine)
  const nose = noseAt(t);
  drawImpactBack(c, state, t);
  // ---- the canopy (behind the engine)
  const fall = hit ? clamp01((t - 2) / 12) : 0;
  drawCanopy(c, hit ? Math.max(0.01, fall) : 0);
  // ---- the buffer stop: whole, or smashed flat and its striped beam gone
  const bx = X(NOSE_HIT), Tb = N(['#1E140C', '#2E2014', '#40301E', '#56422A', '#6E5838', '#8A7250', '#A88E6A']);
  if (!hit) {
    // (heavy timbers bolted up, the red-and-white striped beam, its red lamp (the train's))
    box(c, bx - 17, GY - 53, 36, 53, INK); box(c, bx - 16, GY - 52, 34, 52, Tb[2]); box(c, bx - 16, GY - 52, 5, 52, Tb[4]); box(c, bx + 13, GY - 52, 5, 52, Tb[1]);
    for (let k = 0; k < 3; k++) { box(c, bx - 16, GY - 46 + k * 14, 34, 7, k % 2 ? '#F2F0EA' : '#C81E1E'); box(c, bx - 16, GY - 46 + k * 14, 34, 1, k % 2 ? '#FFFFFF' : '#E85A4A'); }
    for (const by of [GY - 42, GY - 14]) for (const bxx of [bx - 10, bx + 8]) { box(c, bxx, by, 3, 3, INK); box(c, bxx, by, 1, 1, S[5]); }
    box(c, bx - 6, GY - 66, 14, 14, INK); box(c, bx - 5, GY - 65, 12, 12, S[3]); box(c, bx - 3, GY - 62, 8, 7, '#E8262A'); box(c, bx - 3, GY - 62, 3, 2, '#FF9A8A');
  }
  // ---- the train: the coach, the tender (the coal spilling off it in a heap), the engine; then what's left of the
  //      depot's wall round the nose, the eaves' near end come down, the name board hanging (impact.ts: in front of it)
  const tp = carAt(TENDER, t), cp = carAt(COACH, t);
  drawCoach(c, cp, t >= COACH.th);
  drawTender(c, tp, t >= TENDER.th);
  drawCoalHeap(c, X(-430), clamp01((t - (TENDER.th + TENDER.dur - 4)) / 30));
  drawLoco(c, X(nose), tiltAt(t), crushAt(t), hit, f);
  drawImpactFront(c, state, t);
  if (hit) drawCanopy(c, Math.max(0.01, fall), true);
  // ---- the fires catching (the cab, the coal, the coach's front), the steam still pouring off the boiler
  const k = clamp01((t - 24) / 50);
  if (k > 0) {
    const [ax, ay] = onEngine(t, -323, -134);
    fire(c, ax, ay, 30, f, 1, k);
    const [cx, cy] = onCar(tp, 230, -150);
    fire(c, cx, cy, 34, f, 2, k);
    const [dx, dy] = onCar(cp, 560, -120);
    fire(c, dx, dy, 44, f, 3, k);
    const [ex, ey] = onCar(cp, 390, -200);
    fire(c, ex, ey, 22, f, 4, k * 0.8);
  }
  if (hit) {
    const [sx, sy] = onEngine(t, -90, -140), st: [string, string, string] = ['#B8C0CA', '#E0E6EC', '#FFFFFF'];
    for (let n = 0; n < 8; n++) { const q = ((f * 0.7 + n * 25) % 200) / 200; puff(c, sx + n * 6 - q * 30, sy - q * 240, 16 + q * 50, st, 0.5 * (1 - q)); }
    // (a jet of it hissing out of a split in the boiler's side)
    const [jx, jy] = onEngine(t, -200, -100);
    for (let n = 0; n < 5; n++) { const q = ((f * 1.6 + n * 9) % 45) / 45; puff(c, jx - 6 + q * 70, jy + 4 - q * 26, 5 + q * 18, st, 0.55 * (1 - q)); }
    // (low off a burst cylinder cock, hissing out along the dirt; and out of the split smokebox into the depot's room)
    const [lx, ly] = onEngine(t, -125, -38);
    for (let n = 0; n < 4; n++) { const q = ((f * 1.3 + n * 11) % 44) / 44; puff(c, lx - q * 60, ly + 2 - q * 10, 4 + q * 14, st, 0.45 * (1 - q)); }
    const [ix, iy] = onEngine(t, -58, -120);
    for (let n = 0; n < 4; n++) { const q = ((f * 0.6 + n * 25) % 100) / 100; puff(c, ix + q * 70, iy - q * 50, 8 + q * 22, st, 0.35 * (1 - q)); }
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
  box(c, -b.w / 2, -b.h / 2, b.w, 1, mix(b.col, '#FFFFFF', 0.3)); if (b.h > 3) box(c, -b.w / 2, b.h / 2 - 1, b.w, 1, mix(b.col, INK, 0.35));
  if (b.w > 12) box(c, b.w / 2 - 3, -b.h / 2, 3, b.h, mix(b.col, '#F2E2B8', 0.4));
  c.restore();
};

/** In front of everything: the wreckage flying, the dust and the steam rolling over it, the paramedic's words. */
export const drawCrashFront = (c: Ctx, state: GameState) => {
  const s = mine();
  if (!s) return;
  for (const b of s.bits) if (!b.rest) bit(c, b);
  for (const q of s.puffs) puff(c, q.x, q.y, q.r, [mix(q.col, INK, 0.22), q.col, mix(q.col, '#FFFFFF', 0.3)], q.a * (1 - q.t / q.life));
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
  const out = [onEngine(t, -323, -134), onCar(carAt(TENDER, t), 230, -150), onCar(carAt(COACH, t), 560, -120)];
  void state;
  const [hx] = holeAt();
  // (the smolder inside the depot: smaller, softer)
  return [...out.map(([x, y]) => ({ x, y: y - 20, r: 170, a, color: '#6A3010' })), { x: hx + 48, y: GY - 30, r: 110, a: a * 0.6, color: '#6A3010' }];
};
