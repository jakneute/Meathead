// THE QUEEN'S PLAIN DEATH (anything but her weakness, the mallet): her motor oil (the cheap stuff that wouldn't burn
// all fight) boils over out of her joints and catches. Flames and black smoke pour off her; her latex chars, blisters
// and peels off her in burning flakes; and under it, a steel ENDOSKELETON nobody knew was in there (a certain pizza
// place's kind): bare struts, pistons, servo joints, wire looms, a steel skull with its jaw hinge out in the open and
// two pinprick eyes lit in its sockets. Worse than she was. A beat; its eyes flare; LESS FATAL MODE... DISABLED; it
// screams and lunges at him one last time; its feet tangle, a knee buckles the wrong way, down it goes on its face and
// breaks apart at every joint, the skull bouncing off and rolling to a stop, the eyes going out. One heap: not the
// mallet's everywhere. Harmless the whole way (nothing of it can hurt him).
//
// The parts are painted once each (a cache of little canvases, by scale) and put down turned however they lie; the
// charred flakes the same. The burning shell is her own drawing, charred and holed in a layer of its own.

import type { GameState } from '../../../m1/game/core/state';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import type { Light } from '../../../m1/game/render/lighting';
import { GY } from '../geometry';
import { DISCO_L, DISCO_R } from './geo';
import { type Ramp, CHROME, STEELR, TOOTH, FOAMR, dith, tube, hose, quad, blob, shapeShade, hash, rings } from './paint';
import { drawQueen, type QueenDraw } from './sprite';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// The numbers

/** The burn (frames): the oil boiling over; it catches; her latex charring; the shell coming away; all of it off. */
const BOIL_T = 30, BURN_T = 160;
/** The beat bare (frames) before its head comes up, and how long the head takes. */
const BARE_SLUMP = 30, BARE_RISE = 40;
/** The lunge (frames), how far at most (px), and where it means to come down short of him. */
const LUNGE_T = 22, LUNGE_MAX = 320, LUNGE_MIN = 50, LUNGE_SHORT = 300;
/** The fall: its spin at the trip, gravity on it; the angle it hits the floor at. */
const TIP_V0 = 0.016, TIP_G = 0.0045, TIP_DOWN = 1.38;
/** The flakes: at most this many about (they stay where they land). */
const FLAKES_MAX = 42;

// ---------------------------------------------------------------------------------------------------------------
// The state

export type Part = 'thigh' | 'shin' | 'foot' | 'upper' | 'fore' | 'hand' | 'pelvis' | 'spine' | 'ribs' | 'skull' | 'jaw' | 'tail';
/** A part where the rig puts it (her local frame: facing right, the floor under her at 0): its pivot, its turn. */
interface Pose { k: Part; x: number; y: number; a: number; far: boolean }
/** A part broken off, loose (local, from where she went down): its middle, turn, how it's moving; lying still. */
export interface Bit { k: Part; x: number; y: number; a: number; vx: number; vy: number; va: number; far: boolean; rest: boolean; hitT: number; fire: number }
/** A flake of her burnt latex (world): falling, fluttering, still burning a while; lying where it landed. */
export interface Flake { x: number; y: number; vx: number; vy: number; a: number; va: number; v: number; burn: number; rest: boolean; seed: number }
export type EndoPh = 'burn' | 'bare' | 'lunge' | 'trip' | 'down';
export interface Endo {
  ph: EndoPh; t: number; all: number;
  /** The flames on her (0..1); the latex charred (0..1); the shell come away (0..1); its eyes lit (0..1), flared. */
  fire: number; char: number; reveal: number; eye: number; flare: number;
  /** The rig: leaning forward (rad), its head down (rad), reaching for him (0..1), its jaw (0..1), crouched (px), the
   *  near knee buckled (0..1), the whole of it tipped over its toes (rad) and how fast. */
  lean: number; head: number; reach: number; jaw: number; crouch: number; buckle: number; tip: number; tipV: number;
  /** The lunge: from, to (her x); the drift on after the trip. */
  from: number; to: number; drift: number;
  /** In pieces: where she went down (world x), which way she faced; the pieces; the flakes. */
  bx: number; bf: 1 | -1; bits: Bit[]; flakes: Flake[];
  /** Said: her burn line done; her last line asked for, done (the lunge's go); his quip asked for. */
  burnSaid: boolean; fatalAsked: boolean; go: boolean; quipped: boolean;
}
export const makeEndo = (): Endo => ({
  ph: 'burn', t: 0, all: 0, fire: 0, char: 0, reveal: 0, eye: 0, flare: 0,
  lean: 0.14, head: 0.45, reach: 0, jaw: 0, crouch: 0, buckle: 0, tip: 0, tipV: 0,
  from: 0, to: 0, drift: 0, bx: 0, bf: 1, bits: [], flakes: [],
  burnSaid: false, fatalAsked: false, go: false, quipped: false,
});
/** Who it is (the fight: where she is, which way she faces). */
interface Who { x: number; facing: 1 | -1 }

const sm = (k: number) => { const u = Math.max(0, Math.min(1, k)); return u * u * (3 - 2 * u); };
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// ---------------------------------------------------------------------------------------------------------------
// The rig: where each part goes for the pose it's in

/** A two-bone limb's middle joint (the knee, the elbow), bent to `bend`'s side. */
const ik = (ax: number, ay: number, bx: number, by: number, l1: number, l2: number, bend: number): [number, number] => {
  const dx = bx - ax, dy = by - ay, d = Math.min(l1 + l2 - 0.5, Math.max(1, Math.hypot(dx, dy)));
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const th = Math.atan2(dy, dx) + bend * a;
  return [ax + Math.cos(th) * l1, ay + Math.sin(th) * l1];
};
const rot = (a: number, x: number, y: number): [number, number] => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const LT = 40, LS = 44, LU = 38, LF = 42;
/** The pivot it falls over (its front toes). */
const TOE: [number, number] = [34, 0];

const rig = (e: Endo, fr: number): Pose[] => {
  const out: Pose[] = [];
  const H: [number, number] = [0, -84 + e.crouch];
  const at = (x: number, y: number): [number, number] => { const [rx, ry] = rot(e.lean, x, y); return [H[0] + rx, H[1] + ry]; };
  const seg = (k: Part, a: [number, number], b: [number, number], far: boolean) => out.push({ k, x: a[0], y: a[1], a: Math.atan2(b[1] - a[1], b[0] - a[0]), far });
  // (twitching while it's bare: its servos hunting)
  const tw = e.ph === 'bare' ? (fr % 7 < 2 ? 1.5 : 0) : 0;
  const leg = (s: number) => {
    const far = s < 0, hip: [number, number] = [H[0] + s * 6, H[1]];
    const stride = e.ph === 'lunge' || e.ph === 'trip' ? (far ? -18 : 26) * Math.min(1, e.reach * 1.4) : 0;
    let ank: [number, number] = [s * 10 + 6 + stride, -22];
    let bend = 1;
    // (the near one caught on the far one: across it, up, the knee gone the wrong way)
    if (!far && e.buckle > 0) {
      const fa: [number, number] = [-10 + -18 * Math.min(1, e.reach * 1.4) + 6, -22];
      ank = [ank[0] + (fa[0] - 4 - ank[0]) * e.buckle, ank[1] + (-40 - ank[1]) * e.buckle];
      if (e.buckle > 0.45) bend = -1;
    }
    const knee = ik(hip[0], hip[1], ank[0], ank[1], LT, LS, bend);
    seg('thigh', hip, knee, far); seg('shin', knee, ank, far);
    out.push({ k: 'foot', x: ank[0], y: ank[1], a: !far && e.buckle > 0 ? -0.9 * e.buckle : 0, far });
  };
  const arm = (s: number) => {
    const far = s < 0;
    const sh = at(20 + (far ? -8 : 0), -100 + (far ? -4 : 0));
    const hang: [number, number] = [sh[0] + 14 + tw, sh[1] + 64];
    const rx = rot(e.lean, 80, far ? -14 : -4), reach: [number, number] = [sh[0] + rx[0], sh[1] + rx[1]];
    const up: [number, number] = [sh[0] + 34 + (far ? -16 : 0), sh[1] - 60 + Math.sin(fr * 0.9 + s) * 8];
    const k = e.reach, b = e.buckle;
    let h: [number, number] = [hang[0] + (reach[0] - hang[0]) * k, hang[1] + (reach[1] - hang[1]) * k];
    h = [h[0] + (up[0] - h[0]) * b, h[1] + (up[1] - h[1]) * b];
    const el = ik(sh[0], sh[1], h[0], h[1], LU, LF, 1);
    seg('upper', sh, el, far); seg('fore', el, h, far);
    out.push({ k: 'hand', x: h[0], y: h[1], a: Math.atan2(h[1] - el[1], h[0] - el[0]), far });
  };
  leg(-1); arm(-1);
  out.push({ k: 'tail', x: H[0] - 16, y: H[1] + 4, a: -0.27 + e.lean * 0.3 + Math.sin(fr * 0.05) * 0.03, far: false });
  out.push({ k: 'pelvis', x: H[0], y: H[1], a: e.lean * 0.4, far: false });
  out.push({ k: 'spine', x: H[0], y: H[1], a: e.lean, far: false });
  const rb = at(4, -62); out.push({ k: 'ribs', x: rb[0], y: rb[1], a: e.lean, far: false });
  leg(1);
  const N = at(10, -112), sk = e.lean * 0.6 + e.head + (e.ph === 'bare' && fr % 11 < 2 ? 0.04 : 0);
  out.push({ k: 'skull', x: N[0], y: N[1], a: sk, far: false });
  const [jx, jy] = rot(sk, 16, 6);
  out.push({ k: 'jaw', x: N[0] + jx, y: N[1] + jy, a: sk + e.jaw * 0.75, far: false });
  arm(1);
  // (over on its toes)
  if (e.tip) for (const p of out) { const [x, y] = rot(e.tip, p.x - TOE[0], p.y - TOE[1]); p.x = TOE[0] + x; p.y = TOE[1] + y; p.a += e.tip; }
  return out;
};
/** Its eye (on the skull, skull-local). */
const EYE: [number, number] = [36, -15];

// ---------------------------------------------------------------------------------------------------------------
// Each frame

export const tickEndo = (state: GameState, e: Endo, who: Who, px: number) => {
  e.t++; e.all++;
  const fr = state.frame, t = e.t;
  if (e.flare > 0) e.flare = Math.max(0, e.flare - 0.04);
  if (e.ph === 'burn') {
    // (boiling over out of her joints: bubbling black, steam; then it catches: WHOOMPH)
    e.fire = t < BOIL_T ? 0 : Math.min(1, (t - BOIL_T) / 24);
    e.char = sm((t - BOIL_T) / 70);
    e.reveal = sm((t - 85) / (BURN_T - 85 - 10));
    if (t < BOIL_T && t % 3 === 0) { playSound('glug', 0.5, -6 + t / 6); }
    if (t === BOIL_T) { playSound('ignite', 1.2, -6); playSound('flame', 1, -4); playSound('screams', 0.8, -10); shakeScreen(state, 8, 4); }
    if (t > BOIL_T && t % 14 === 0) playSound('flame', 0.5, -6 + Math.random() * 4);
    if (t === 60 || t === 105) playSound('screams', 0.6, -12 + Math.random() * 3);
    if (t > 70 && t % 9 === 0) playSound('rayFizzle', 0.3, -2);
    // (her skin coming off her in burning flakes, more as the shell goes)
    if (t > 55 && e.flakes.length < FLAKES_MAX && Math.random() < 0.35 + e.reveal * 0.4) e.flakes.push(flakeAt(who.x + who.facing * rnd(-60, 50), GY - rnd(60, 280)));
    if (t >= BURN_T) { e.ph = 'bare'; e.t = 0; e.reveal = 1; e.char = 1; e.eye = 0.35; playSound('clang', 0.6, -10); playSound('rumble', 0.5, -6); }
  } else if (e.ph === 'bare') {
    // (stood there smoking, hunched; then its head comes up at him, its eyes flaring)
    e.fire = Math.max(0.35, e.fire - 0.01);
    const k = sm((t - BARE_SLUMP) / BARE_RISE);
    e.lean = 0.22 - 0.3 * k; e.head = 0.5 - 0.8 * k;
    who.facing = (px < who.x ? -1 : 1);
    if (t === BARE_SLUMP) { playSound('click', 0.8, -6); playSound('engine', 0.4, -10); }
    if (t === BARE_SLUMP + BARE_RISE - 4) { e.eye = 1; e.flare = 1; playSound('alienCharge', 0.9, -10); playSound('ding', 0.4, -14); shakeScreen(state, 4, 3); }
    if (t > BARE_SLUMP + BARE_RISE) e.jaw = 0.2 + (fr % 10 < 5 ? 0.06 : 0);
    if (t > 900) e.go = true;
    if (e.go && t >= BARE_SLUMP + BARE_RISE + 12) {
      // (the lunge: at him, to come down a way short of him)
      e.ph = 'lunge'; e.t = 0; e.from = who.x;
      const dir = who.facing, want = px - dir * LUNGE_SHORT, d = Math.max(LUNGE_MIN, Math.min(LUNGE_MAX, (want - who.x) * dir));
      e.to = Math.max(DISCO_L + 80, Math.min(DISCO_R - 80, who.x + dir * d));
      e.flare = 1; playSound('screams', 1.3, -6); playSound('roar', 1.1, -4); playSound('whoosh', 1, -6); shakeScreen(state, 10, 6);
    }
  } else if (e.ph === 'lunge') {
    const k = Math.min(1, t / LUNGE_T), u = 1 - (1 - k) * (1 - k);
    who.x = e.from + (e.to - e.from) * u;
    e.lean = -0.08 + 0.6 * sm(k * 2); e.head = -0.3 + 0.2 * k; e.reach = sm(k * 1.6); e.jaw = 1; e.crouch = 6 * Math.sin(k * Math.PI);
    if (t % 5 === 0) playSound('clang', 0.4, 6 - t / 5);
    if (t >= LUNGE_T * 0.7) {
      // (and its feet go: the near one's caught on the far one)
      e.ph = 'trip'; e.t = 0; e.tipV = TIP_V0; e.drift = Math.abs(e.to - e.from) / LUNGE_T * 0.6;
      playSound('clink', 1, -8); playSound('crunch', 0.8, 4);
    }
  } else if (e.ph === 'trip') {
    e.buckle = Math.min(1, t / 9);
    e.tipV += TIP_G; e.tip += e.tipV;
    who.x += who.facing * e.drift; e.drift *= 0.9;
    e.lean = Math.max(0, e.lean - 0.02); e.head = -0.5; e.jaw = 1;
    if (t === 4) playSound('screams', 0.7, 4);
    if (e.tip >= TIP_DOWN) breakUp(state, e, who, fr);
  } else {
    // (in pieces: rolling to a stop; the eyes going out)
    tickBits(state, e);
    e.eye = Math.max(0, e.eye - (t < 40 ? 0.004 : 0.012));
    e.fire = Math.max(0, e.fire - 0.004);
    if (e.bits.length) who.x = e.bx + e.bf * (e.bits.reduce((s, b) => s + b.x, 0) / e.bits.length);
  }
  if (e.ph !== 'down') e.eye = e.ph === 'burn' ? 0 : Math.max(e.eye, 0.35);
  tickFlakes(e);
  // (the smoke off it, the embers, the oil cooking out of it: a few a frame at most)
  const cx = who.x, top = e.ph === 'down' ? GY - 40 : GY - 260;
  const sm0 = e.ph === 'burn' ? (t < BOIL_T ? 0.4 : 0.9) : e.fire * 0.8 + 0.15;
  if (fr % 3 === 0 && Math.random() < sm0) state.particles.push({ pos: { x: cx + rnd(-60, 60), y: rnd(top, GY - 40) }, vel: { x: rnd(-0.4, 0.4), y: rnd(-1.6, -0.8) }, life: rnd(60, 100), color: Math.random() < 0.6 ? 'rgba(18, 16, 14, 0.55)' : 'rgba(58, 54, 50, 0.45)', size: rnd(12, 24) });
  if (e.fire > 0 && fr % 2 === 0) state.particles.push({ pos: { x: cx + rnd(-50, 50), y: rnd(top, GY - 20) }, vel: { x: rnd(-1, 1), y: rnd(-3, -1.2) }, life: rnd(18, 34), color: Math.random() < 0.5 ? '#FDBA74' : '#FACC15', size: 2 });
  if (fr % 4 === 0 && (e.ph === 'burn' ? t < BOIL_T + 60 : e.ph !== 'down')) {
    // (the oil boiling out of its joints, dripping, some of it alight)
    state.particles.push({ pos: { x: cx + rnd(-40, 40), y: rnd(GY - 220, GY - 60) }, vel: { x: rnd(-0.6, 0.6), y: 0.4 }, life: 50, color: Math.random() < 0.25 && e.fire > 0 ? '#F97316' : '#0A0604', size: rnd(2, 4), grav: 0.3 });
  }
};

/** Face down: every part off at its joint, sparks at each, the skull off and rolling. One heap. */
const breakUp = (state: GameState, e: Endo, who: Who, fr: number) => {
  e.ph = 'down'; e.t = 0; e.bx = who.x; e.bf = who.facing; e.buckle = 1;
  const ps = rig(e, fr), w = e.tipV;
  e.bits = ps.map(p => {
    const d = PART[p.k], [mx, my] = rot(p.a, d.mid[0], d.mid[1]), x = p.x + mx, y = p.y + my;
    // (still going the way the fall had it, damped; a bounce up off the floor; a bit of spin)
    let vx = -w * (y - TOE[1]) * 0.35 + rnd(-1.5, 1.5), vy = w * (x - TOE[0]) * 0.2 - rnd(1.5, 4), va = rnd(-0.12, 0.12);
    if (p.k === 'skull') { vx = rnd(4.2, 5.4); vy = -rnd(4.5, 6); va = vx / d.r; }
    if (p.k === 'jaw') { vx = rnd(1, 3); vy = -rnd(5, 7); va = rnd(-0.3, 0.3); }
    if (p.k === 'ribs' || p.k === 'pelvis' || p.k === 'spine') { vx *= 0.4; vy = -rnd(1, 2.5); va *= 0.4; }
    return { k: p.k, x, y: Math.min(y, -d.r), a: p.a, vx, vy, va, far: p.far, rest: false, hitT: 99, fire: Math.random() < 0.5 ? rnd(80, 220) : 0 };
  });
  playSound('crash', 1.3, -8); playSound('clang', 1.2, -6); playSound('slam', 1, -8); playSound('crunch', 1, -4); playSound('thud', 1.2, -12);
  shakeScreen(state, 18, 9);
  // (sparks off every joint that went; a puff of black off the floor)
  for (const p of ps) for (let i = 0; i < 3; i++) {
    const wx = e.bx + e.bf * p.x, wy = GY + p.y;
    state.particles.push({ pos: { x: wx, y: wy }, vel: { x: rnd(-5, 5), y: rnd(-6, -1) }, life: rnd(10, 20), color: i % 2 ? '#FDE047' : '#FFFFFF', size: 2, grav: 0.3 });
  }
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: e.bx + e.bf * rnd(40, 260), y: GY - 10 }, vel: { x: rnd(-1.5, 1.5), y: rnd(-1.2, -0.4) }, life: 70, color: 'rgba(30, 26, 22, 0.5)', size: rnd(14, 24) });
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: e.bx + e.bf * rnd(40, 240), y: GY - 6 }, vel: { x: rnd(-3, 3), y: rnd(-4, -1) }, life: 40, color: i % 3 ? '#0A0604' : '#3A2410', size: rnd(2, 4), grav: 0.3 });
};

/** The pieces: falling, bouncing, lying down flat the way they fall; the skull rolling. Off the hall's walls. */
const tickBits = (state: GameState | null, e: Endo) => {
  const lo = e.bf > 0 ? DISCO_L + 8 - e.bx : e.bx - (DISCO_R - 8), hi = e.bf > 0 ? DISCO_R - 8 - e.bx : e.bx - (DISCO_L + 8);
  let clatter = 0;
  for (const b of e.bits) {
    if (b.fire > 0) b.fire--;
    if (b.rest) continue;
    const d = PART[b.k];
    b.hitT++; b.vy += 0.5; b.x += b.vx; b.y += b.vy; b.a += b.va;
    if (b.x < lo + d.r) { b.x = lo + d.r; b.vx = Math.abs(b.vx) * 0.5; }
    if (b.x > hi - d.r) { b.x = hi - d.r; b.vx = -Math.abs(b.vx) * 0.5; }
    if (b.y + d.r > 0) {
      const hit = Math.abs(b.vy);
      b.y = -d.r; b.vy = -Math.abs(b.vy) * (b.k === 'skull' ? 0.45 : 0.3);
      if (b.k === 'skull') { b.vx *= 0.9; b.va = b.vx / d.r; }
      else {
        b.vx *= 0.6;
        // (lying down flat the way it fell)
        const flat = d.flat ? Math.PI / 2 : 0, n = Math.round((b.a - flat) / Math.PI), to = flat + n * Math.PI;
        b.a += (to - b.a) * 0.35; b.va *= 0.4;
      }
      if (Math.abs(b.vy) < 1.2) {
        b.vy = 0;
        if (b.k !== 'skull') b.vx *= 0.75;
        if (Math.abs(b.vx) < (b.k === 'skull' ? 0.12 : 0.3)) {
          b.rest = true; b.vx = 0; b.va = 0;
          // (the skull: stopped on its side, or on its face)
          if (b.k === 'skull') { const n = Math.round(b.a / Math.PI); b.a = n * Math.PI + (n % 2 ? 0.08 : -0.06); }
          else { const flat = d.flat ? Math.PI / 2 : 0; b.a = flat + Math.round((b.a - flat) / Math.PI) * Math.PI + (hash(b.x) - 0.5) * 0.12; }
        }
      }
      if (hit > 3 && b.hitT > 8) { b.hitT = 0; clatter++; }
    }
  }
  if (clatter && state) playSound(Math.random() < 0.6 ? 'clang' : 'clink', Math.min(0.8, 0.3 + clatter * 0.12), rnd(-4, 6));
};

const flakeAt = (x: number, y: number): Flake => ({ x, y, vx: rnd(-1.2, 1.2), vy: rnd(-1.5, 0), a: rnd(0, 6.28), va: rnd(-0.12, 0.12), v: Math.floor(Math.random() * FLAKE_N), burn: rnd(50, 140), rest: false, seed: Math.random() * 100 });
const tickFlakes = (e: Endo) => {
  for (const f of e.flakes) {
    if (f.burn > 0) f.burn--;
    if (f.rest) continue;
    f.vy = Math.min(1.8, f.vy + 0.1); f.x += f.vx + Math.sin(f.y * 0.05 + f.seed) * 0.6; f.y += f.vy; f.a += f.va; f.vx *= 0.98;
    if (f.y >= GY - 3) { f.y = GY - 3; f.rest = true; f.a = (hash(f.seed) - 0.5) * 0.5; }
    if (f.x < DISCO_L + 10) f.x = DISCO_L + 10;
    if (f.x > DISCO_R - 10) f.x = DISCO_R - 10;
  }
};

/** All-or-nothing skipped: straight to it in pieces, every piece and flake where it ends up. */
export const settleEndo = (e: Endo, who: Who) => {
  e.fire = 0; e.char = 1; e.reveal = 1; e.eye = 0; e.flare = 0;
  if (e.ph !== 'down') {
    if (e.ph === 'burn' || e.ph === 'bare') { who.facing = who.facing || 1; e.reach = 1; e.lean = 0.5; }
    e.buckle = 1; e.tip = TIP_DOWN; e.tipV = TIP_V0 + 0.09;
    e.ph = 'down'; e.bx = who.x; e.bf = who.facing;
    const ps = rig(e, 0);
    e.bits = ps.map(p => { const d = PART[p.k], [mx, my] = rot(p.a, d.mid[0], d.mid[1]); return { k: p.k, x: p.x + mx, y: Math.min(p.y + my, -d.r), a: p.a, vx: p.k === 'skull' ? 4.6 : rnd(-1, 1), vy: -2, va: 0, far: p.far, rest: false, hitT: 99, fire: 0 }; });
  }
  for (let i = 0; i < 600 && e.bits.some(b => !b.rest); i++) tickBits(null, e);
  for (const b of e.bits) { b.fire = 0; b.rest = true; }
  for (let i = 0; i < 400 && e.flakes.some(f => !f.rest); i++) tickFlakes(e);
  for (const f of e.flakes) f.burn = 0;
  if (e.bits.length) who.x = e.bx + e.bf * (e.bits.reduce((s, b) => s + b.x, 0) / e.bits.length);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The parts and the flakes, each painted the once at the scale it's shown at (to the half), then put down turned. */
const cache = new Map<string, HTMLCanvasElement>();
const sprite = (c: Ctx, key: string, bb: readonly [number, number, number, number], paint: (g: Ctx) => void) => {
  const m = c.getTransform(), s = Math.hypot(m.a, m.b), q = Math.max(1, Math.ceil(s * 2) / 2);
  if (typeof document === 'undefined') { paint(c); return; }
  const id = `${key}@${q}`;
  let cv = cache.get(id);
  if (!cv) {
    if (cache.size > 90) cache.clear();
    cv = document.createElement('canvas'); cv.width = Math.ceil(bb[2] * q); cv.height = Math.ceil(bb[3] * q);
    const g = cv.getContext('2d')!; g.setTransform(q, 0, 0, q, -bb[0] * q, -bb[1] * q);
    paint(g); cache.set(id, cv);
  }
  c.drawImage(cv, bb[0], bb[1], bb[2], bb[3]);
};

const drawPart = (c: Ctx, k: Part, far: boolean) => { const d = PART[k]; sprite(c, `endo-${k}${far ? 'f' : ''}`, d.bb, g => d.paint(g, far)); };
/** Its eye: a pinprick, white-hot, a red glow round it (flared, a big one). */
const eyeAt = (c: Ctx, x: number, y: number, e: number, flare: number) => {
  if (e <= 0.02) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  rings(c, x, y, 7 + 16 * flare, 6 + 14 * flare, '255, 48, 24', 0.55 * e, 0.04 * e, 3);
  c.restore();
  c.fillStyle = e > 0.5 ? '#FFF1EE' : '#FF5A3C'; c.fillRect(x - 1, y - 1, 2, 2);
  if (flare > 0.3) { c.fillStyle = '#FFFFFF'; c.fillRect(x - 1.5, y - 1.5, 3, 3); }
};
/** A flame up off a point: stepped tongues, dark red out to near white, flickering, leaning. */
const FIRE = ['#7F1D1D', '#DC2626', '#F97316', '#FACC15', '#FEF9C3'];
const flame = (c: Ctx, x: number, y: number, h: number, w: number, seed: number, fr: number) => {
  if (h < 2) return;
  const fl = 0.7 + 0.3 * hash(seed + Math.floor(fr / 3)), sway = (hash(seed * 3.1 + Math.floor(fr / 4)) - 0.5) * w * 0.9;
  for (let i = 0; i < FIRE.length; i++) {
    const k = 1 - i * 0.17, hh = h * fl * k, ww = w * k;
    c.fillStyle = FIRE[i]; c.beginPath();
    c.moveTo(x - ww, y + 2); c.quadraticCurveTo(x - ww * 0.9, y - hh * 0.45, x + sway * k, y - hh); c.quadraticCurveTo(x + ww * 0.9, y - hh * 0.45, x + ww, y + 2); c.closePath(); c.fill();
  }
};

/** Where the fire sits on her before the shell's off (her local frame, as drawn: free, stunned). */
const BODY: [number, number][] = [[0, -86], [-14, -110], [6, -140], [18, -176], [-20, -160], [40, -200], [24, -222], [-40, -236], [-70, -228], [44, -120], [60, -90], [-50, -70], [-110, -56], [-170, -46], [-8, -40], [16, -24], [-46, -190]];
/** Where the shell comes off first and last: holes burnt through it, each its own size and time. */
const HOLES = BODY.flatMap(([x, y], i) => [0, 1, 2].map(j => ({ x: x + (hash(i * 7 + j) - 0.5) * 34, y: y + (hash(i * 13 + j * 3) - 0.5) * 30, r: 20 + hash(i * 3 + j * 11) * 22, th: hash(i * 5 + j * 17), seed: i * 3 + j })));
const BLISTERS = Array.from({ length: 60 }, (_, i) => ({ x: -220 + hash(i * 1.7) * 330, y: -300 + hash(i * 2.3) * 300, r: 2 + hash(i * 3.9) * 3, th: hash(i * 5.1) }));

/** A layer of its own for the burning shell (her drawing, charred, holed through), put down over the skeleton. */
let lay: HTMLCanvasElement | null = null;
const layer = (c: Ctx, x0: number, y0: number, w: number, h: number, alpha: number, paint: (g: Ctx) => void) => {
  const m = c.getTransform();
  if (typeof document === 'undefined' || m.b !== 0 || m.c !== 0 || m.a <= 0 || m.d <= 0) { paint(c); return; }
  const L = m.a * x0 + m.e, T = m.d * y0 + m.f, dx = Math.floor(L), dy = Math.floor(T);
  const W = Math.ceil(m.a * w) + 2, H = Math.ceil(m.d * h) + 2;
  lay ??= document.createElement('canvas');
  if (lay.width < W || lay.height < H) { lay.width = Math.max(lay.width, W); lay.height = Math.max(lay.height, H); }
  const g = lay.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  g.setTransform(m.a, 0, 0, m.d, m.e - dx, m.f - dy);
  paint(g);
  g.globalCompositeOperation = 'source-over';
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha *= alpha; c.drawImage(lay, 0, 0, W, H, dx, dy, W, H); c.restore();
};

/** Her plain death, drawn: the burning shell over the skeleton; the skeleton; in pieces; the flames, the flakes. */
export const drawEndo = (c: Ctx, e: Endo, who: Who, fr: number, qd: QueenDraw) => {
  const x = who.x, f = who.facing;
  // (the oil boiling out of her before it catches: her own drawing, the bubbles on her)
  if (e.ph === 'burn' && e.reveal <= 0 && e.char <= 0) {
    drawQueen(c, x, f, qd);
  } else if (e.ph === 'burn') {
    // (the skeleton under, where the shell's burnt through)
    if (e.reveal > 0) drawRig(c, e, who, fr);
    const fade = 1 - sm((e.reveal - 0.72) / 0.28);
    if (fade > 0) layer(c, x - 300, GY - 360, 600, 370, fade, g => {
      drawQueen(g, x, f, qd);
      g.globalCompositeOperation = 'source-atop';
      // (charred: black over her, blistered, cracks glowing through it)
      g.fillStyle = `rgba(22, 12, 6, ${(0.86 * e.char).toFixed(3)})`; g.fillRect(x - 300, GY - 360, 600, 370);
      for (const b of BLISTERS) if (e.char > b.th) {
        const bx = x + f * b.x, by = GY + b.y;
        g.fillStyle = '#4A2A14'; g.fillRect(bx - b.r, by - b.r, b.r * 2, b.r * 2);
        g.fillStyle = '#7C4A22'; g.fillRect(bx - b.r + 1, by - b.r, b.r, 1);
        if ((fr + b.th * 40) % 30 < 15 && e.fire > 0) { g.fillStyle = '#F97316'; g.fillRect(bx, by + b.r - 1, 1, 1); }
      }
      // (the edges of every hole burning)
      for (const hl of HOLES) {
        const r = holeR(hl, e.reveal);
        if (r <= 0) continue;
        const hx = x + f * hl.x, hy = GY + hl.y;
        g.fillStyle = (fr + hl.seed) % 6 < 3 ? '#EA580C' : '#DC2626'; jag(g, hx, hy, r + 5, hl.seed); g.fill();
        g.fillStyle = '#FACC15'; jag(g, hx, hy, r + 2, hl.seed); g.fill();
      }
      g.globalCompositeOperation = 'destination-out';
      g.fillStyle = '#000';
      for (const hl of HOLES) { const r = holeR(hl, e.reveal); if (r > 0) { jag(g, x + f * hl.x, GY + hl.y, r, hl.seed); g.fill(); } }
    });
  } else if (e.ph === 'down') {
    c.save(); c.translate(e.bx, GY); c.scale(e.bf, 1);
    for (const b of e.bits) drawBit(c, b);
    const sk = e.bits.find(b => b.k === 'skull');
    if (sk) { const [ex, ey] = rot(sk.a, EYE[0] - PART.skull.mid[0], EYE[1] - PART.skull.mid[1]); eyeAt(c, sk.x + ex, sk.y + ey, e.eye, e.flare); }
    c.restore();
  } else drawRig(c, e, who, fr);
  // (the flames: on her body at first, then on its joints; on the pieces that are still alight)
  if (e.fire > 0) {
    if (e.ph === 'burn' && e.reveal < 0.6) {
      BODY.forEach(([bx, by], i) => flame(c, x + f * bx, GY + by + 8, (16 + hash(i) * 22) * e.fire, 7 + hash(i * 2) * 6, i, fr));
    } else if (e.ph !== 'down') {
      const ps = rig(e, fr);
      ps.forEach((p, i) => { if (i % 2 === 0) flame(c, x + f * p.x, GY + p.y + 6, (12 + hash(i) * 16) * e.fire, 5 + hash(i * 2) * 4, i + 50, fr); });
    } else for (let i = 0; i < e.bits.length; i++) {
      const b = e.bits[i];
      if (b.fire > 0) flame(c, e.bx + e.bf * b.x, GY + b.y + 4, Math.min(1, b.fire / 60) * (10 + hash(i) * 10), 5, i + 90, fr);
    }
  }
  drawFlakes(c, e, fr);
};

const holeR = (hl: { r: number; th: number }, reveal: number) => hl.r * Math.max(0, Math.min(1, (reveal - hl.th * 0.65) / 0.35));
/** A ragged hole's outline (burnt through). */
const jag = (g: Ctx, x: number, y: number, r: number, seed: number) => {
  g.beginPath();
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, rr = r * (0.72 + 0.28 * hash(seed * 9 + i)); if (i) g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath();
};

const drawRig = (c: Ctx, e: Endo, who: Who, fr: number) => {
  const ps = rig(e, fr);
  c.save(); c.translate(who.x, GY); c.scale(who.facing, 1);
  for (const p of ps) { c.save(); c.translate(p.x, p.y); c.rotate(p.a); drawPart(c, p.k, p.far); c.restore(); }
  const sk = ps.find(p => p.k === 'skull')!;
  const [ex, ey] = rot(sk.a, EYE[0], EYE[1]);
  eyeAt(c, sk.x + ex, sk.y + ey, e.eye, e.flare);
  c.restore();
};
const drawBit = (c: Ctx, b: { k: Part; x: number; y: number; a: number; far: boolean }) => {
  const d = PART[b.k];
  c.save(); c.translate(b.x, b.y); c.rotate(b.a); c.translate(-d.mid[0], -d.mid[1]); drawPart(c, b.k, b.far); c.restore();
};
const drawFlakes = (c: Ctx, e: Endo, fr: number) => {
  for (const f of e.flakes) {
    c.save(); c.translate(f.x, f.y); c.rotate(f.a);
    sprite(c, `endo-flake${f.v}`, FLAKE_BB, g => paintFlake(g, f.v));
    c.restore();
    // (still burning: an ember on its edge, a spark up off it now and then)
    if (f.burn > 0) { c.fillStyle = (fr + f.seed) % 8 < 4 ? '#F97316' : '#FACC15'; c.fillRect(Math.round(f.x + Math.cos(f.a) * 5) - 1, Math.round(f.y + Math.sin(f.a) * 5) - 1, 2, 2); if (!f.rest && (fr + f.seed) % 10 < 3) { c.fillStyle = '#FDE68A'; c.fillRect(Math.round(f.x) - 1, Math.round(f.y) - 6, 1, 2); } }
  }
};

/** The glow off it (the lighting pass): the fire, orange; its eyes, red. */
export const endoLights = (e: Endo | null, who: Who): Light[] => {
  if (!e) return [];
  const out: Light[] = [];
  const cx = who.x, cy = e.ph === 'down' ? GY - 30 : GY - 150;
  if (e.fire > 0.02) out.push({ x: cx, y: cy, r: 200 + 120 * e.fire, a: 0.85 * e.fire, color: 'rgba(251, 146, 60, 0.24)' });
  if (e.eye > 0.05) out.push({ x: cx + who.facing * 40, y: e.ph === 'down' ? GY - 20 : GY - 220, r: 70 + 90 * e.flare, a: 0.7 * e.eye, color: 'rgba(255, 40, 20, 0.22)' });
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// The heap, kept for the revisits (her plain death: the pieces where they lay, the flakes)

export const packEndo = (e: Endo) => JSON.stringify({
  x: Math.round(e.bx), f: e.bf,
  b: e.bits.map(b => [b.k, Math.round(b.x), Math.round(b.rest ? b.y : -PART[b.k].r), +b.a.toFixed(2), b.far ? 1 : 0]),
  l: e.flakes.map(f => [f.v, Math.round(f.x), +f.a.toFixed(2)]),
});
export interface Heap { x: number; f: 1 | -1; bits: { k: Part; x: number; y: number; a: number; far: boolean }[]; flakes: { v: number; x: number; a: number }[] }
export const unpackEndo = (s: string | null): Heap | null => {
  if (!s) return null;
  try {
    const o = JSON.parse(s) as { x: number; f: 1 | -1; b: [Part, number, number, number, number][]; l: [number, number, number][] };
    return { x: o.x, f: o.f, bits: o.b.filter(b => b[0] in PART).map(([k, x, y, a, far]) => ({ k, x, y, a, far: !!far })), flakes: o.l.map(([v, x, a]) => ({ v: v % FLAKE_N, x, a })) };
  } catch { return null; }
};
export const drawHeap = (c: Ctx, h: Heap) => {
  c.save(); c.translate(h.x, GY); c.scale(h.f, 1);
  for (const b of h.bits) drawBit(c, b);
  c.restore();
  for (const f of h.flakes) { c.save(); c.translate(f.x, GY - 3); c.rotate(f.a); sprite(c, `endo-flake${f.v}`, FLAKE_BB, g => paintFlake(g, f.v)); c.restore(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The parts, painted about their pivots (facing right; the far side a step darker): steel struts, chrome servos, the
// pistons, the wire looms, soot over the lot, her oil cooked onto it

const STEEL: Ramp = STEELR;
const STEELF: Ramp = ['#08080A', '#1C1C22', '#2E2E36', '#4A4A54', '#6E6E7A'];
const CHROMEF: Ramp = ['#0E0E10', '#3A3A40', '#64646C', '#8E8E99', '#C9CBD3'];
const RED: Ramp = ['#2A0505', '#7F1D1D', '#B91C1C', '#EF4444', '#FCA5A5'];
const BLUE: Ramp = ['#06122E', '#1E3A8A', '#1D4ED8', '#60A5FA', '#BFDBFE'];
const YEL: Ramp = ['#2E1F02', '#854D0E', '#CA8A04', '#FACC15', '#FEF08A'];
const SOOT = 'rgba(8, 6, 4, 0.55)', OILC = '#0A0604', OILG = '#3A2410';
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** Soot and cooked oil over it: dithered black patches, a glossy run. */
const soot = (g: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  g.fillStyle = dith(g, SOOT); g.fillRect(x, y, w, h);
  px(g, x + w * hash(seed), y + h * 0.5, Math.max(2, w * 0.2), 2, OILC); px(g, x + w * hash(seed) + 1, y + h * 0.5, 1, 1, OILG);
};

/** A limb's strut: twin steel bars braced across, a piston under it, a wire loom over it, a servo at its root. */
const strut = (g: Ctx, L: number, w: number, far: boolean, seed: number) => {
  const S = far ? STEELF : STEEL, C = far ? CHROMEF : CHROME;
  tube(g, 0, -w * 0.32, L, -w * 0.32, w * 0.5, S); tube(g, 0, w * 0.32, L, w * 0.32, w * 0.5, S);
  for (let i = 1; i < 4; i++) { const xx = (L * i) / 4; px(g, xx - 1, -w * 0.4, 2, w * 0.8, S[0]); px(g, xx - 1, -w * 0.4, 1, w * 0.8, S[3]); }
  // (the piston: its barrel, its chrome rod)
  tube(g, 4, w * 0.95, L * 0.55, w * 0.95, 4, S); tube(g, L * 0.55, w * 0.95, L - 3, w * 0.95, 2, C);
  px(g, L * 0.55 - 1, w * 0.95 - 2, 2, 4, C[3]);
  // (the loom: red, blue, zip-tied)
  hose(g, quad(3, -w * 0.85, L * 0.5, -w * 0.85 - 4, L - 3, -w * 0.75, 6), 1.5, RED, false);
  hose(g, quad(5, -w * 0.7, L * 0.45, -w * 0.7 - 3, L - 6, -w * 0.6, 6), 1.2, BLUE, false);
  px(g, L * 0.5 - 1, -w * 0.95 - 4, 2, 4, '#D4D4D8');
  // (the servo it turns on)
  blob(g, 0, 0, w * 0.7 + 1, w * 0.7 + 1, C); px(g, -1.5, -1.5, 3, 3, C[0]); px(g, -0.5, -0.5, 1, 1, C[2]);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; px(g, Math.cos(a) * (w * 0.7 + 1.5) - 1, Math.sin(a) * (w * 0.7 + 1.5) - 1, 2, 2, C[1]); }
  soot(g, L * 0.25, -w * 0.5, L * 0.4, w, seed);
};
const paintFoot = (g: Ctx, far: boolean) => {
  const S = far ? STEELF : STEEL, C = far ? CHROMEF : CHROME;
  tube(g, 0, 0, -8, 18, 6, S);
  tube(g, -10, 18, 18, 18, 6, S); px(g, -8, 15, 24, 1, S[4]);
  for (let k = 0; k < 3; k++) { const cx = 18 + k * 3, cy = 15 + k * 2; g.fillStyle = C[0]; g.beginPath(); g.moveTo(cx - 3, cy - 1); g.lineTo(cx + 10, cy + 4); g.lineTo(cx - 2, cy + 5); g.closePath(); g.fill(); px(g, cx, cy, 5, 1, C[3]); }
  g.fillStyle = S[2]; g.beginPath(); g.moveTo(-10, 15); g.lineTo(-20, 21); g.lineTo(-10, 21); g.closePath(); g.fill();
  blob(g, 0, 0, 4.5, 4.5, C); blob(g, -8, 18, 3.5, 3.5, C);
  soot(g, -4, 14, 14, 6, 3);
};
const paintHand = (g: Ctx, far: boolean) => {
  const S = far ? STEELF : STEEL, C = far ? CHROMEF : CHROME;
  for (let i = 0; i < 4; i++) {
    const an = (i - 1.5) * 0.3, mx = Math.cos(an) * 13, my = Math.sin(an) * 13, bn = an + 0.35, tx = mx + Math.cos(bn) * 12, ty = my + Math.sin(bn) * 12;
    tube(g, 0, 0, mx, my, 2.5, S); tube(g, mx, my, tx, ty, 2.2, S);
    blob(g, mx, my, 1.8, 1.8, C, false);
    tube(g, tx, ty, tx + Math.cos(bn + 0.5) * 7, ty + Math.sin(bn + 0.5) * 7, 2, C);
  }
  blob(g, 0, 0, 5.5, 5, C); px(g, -1, -1, 2, 2, C[0]);
};
const paintPelvis = (g: Ctx) => {
  shapeShade(g, () => { g.moveTo(-20, -8); g.lineTo(18, -10); g.lineTo(22, 4); g.lineTo(10, 12); g.lineTo(-16, 10); g.closePath(); }, STEEL, 1.4, -1.6, 2, 0, 0);
  for (let i = 0; i < 4; i++) px(g, -14 + i * 9, -6, 2, 2, CHROME[3]);
  // (the hydraulic pump on it, a hose off it)
  tube(g, -6, 2, 10, 2, 7, CHROME); px(g, -4, 0, 12, 1, CHROME[4]);
  hose(g, quad(-18, 4, -24, 10, -20, 14, 4), 2, YEL, false);
  blob(g, -6, 2, 5, 5, CHROME); blob(g, 6, 2, 5, 5, CHROMEF);
  soot(g, -16, -4, 20, 8, 7);
};
const paintSpine = (g: Ctx) => {
  tube(g, 0, 0, 10, -112, 4, CHROME);
  // (the loom up the back of it: three, tied off)
  hose(g, quad(-5, -4, -9, -60, 3, -110, 8), 2, RED, false); hose(g, quad(-3, -4, -7, -58, 5, -108, 8), 1.6, BLUE, false); hose(g, quad(-7, -2, -11, -62, 1, -108, 8), 1.6, YEL, false);
  for (let i = 0; i < 9; i++) { const u = (i + 0.5) / 9, xx = 10 * u, yy = -112 * u; blob(g, xx, yy, 7, 3.5, STEEL, true, 0.09); px(g, xx - 6, yy - 1, 12, 1, STEEL[4]); if (i % 3 === 1) px(g, xx - 9, yy - 1, 3, 3, '#D4D4D8'); }
  soot(g, -6, -80, 18, 40, 11);
};
const paintRibs = (g: Ctx) => {
  // (the dorsal pipes off its back, bare steel now, burnt)
  for (let i = 2; i >= 0; i--) { const bx = -24 + i * 6, by = -34 + i * 8, ex = bx - 30 - i * 4, ey = by - 22 + i * 4; tube(g, bx, by, ex, ey, 6, STEELF); blob(g, ex, ey, 4, 3.5, STEELF); px(g, ex - 1, ey - 1, 2, 2, OILC); }
  // (the cage: steel hoops off the spine round to the breastbone)
  for (let i = 0; i < 6; i++) { const y = -42 + i * 15; hose(g, quad(-24, y, 30 - Math.abs(i - 2.5) * 2, y - 8, 22, y + 4, 6), 3, i % 2 ? STEEL : STEELF); }
  tube(g, 20, -44, 24, 40, 4, STEEL);
  for (let i = 0; i < 6; i++) px(g, 20, -40 + i * 15, 4, 2, CHROME[3]);
  // (in its chest: the motor where a heart would be, its belt; her speaker, wired in)
  blob(g, -2, -8, 9, 9, CHROME); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; px(g, -2 + Math.cos(a) * 10 - 1, -8 + Math.sin(a) * 10 - 1, 2, 2, CHROME[1]); }
  px(g, -4, -10, 4, 4, '#7F1D1D'); px(g, -3, -9, 1, 1, '#EF4444');
  tube(g, -2, -8, 8, 16, 1.5, STEELF);
  g.fillStyle = STEEL[0]; g.beginPath(); g.roundRect(2, 12, 18, 14, 3); g.fill();
  px(g, 4, 14, 14, 10, '#0B0C10'); for (let k = 0; k < 3; k++) px(g, 5, 16 + k * 3, 12, 1, CHROME[1]);
  hose(g, quad(-20, 30, -6, 40, 6, 26, 6), 1.5, RED, false); hose(g, quad(-18, 34, -4, 44, 10, 26, 6), 1.5, YEL, false);
  // (the little arms, bare: two rods and a pincer)
  tube(g, 14, -36, 34, -22, 3, STEEL); tube(g, 34, -22, 42, -32, 2.5, STEEL); blob(g, 34, -22, 2.5, 2.5, CHROME, false);
  for (let i = 0; i < 3; i++) tube(g, 42, -32, 46 + i * 2, -38 + i * 4, 1.5, CHROME, false);
  soot(g, -20, -30, 34, 30, 13); soot(g, 0, 28, 20, 12, 17);
};
const paintSkull = (g: Ctx) => {
  // (the comb of steel rods her crest was riveted to: burnt stubs back off it)
  for (let i = 0; i < 4; i++) { tube(g, -6 - i * 6, -26 + i * 2, -30 - i * 7, -38 + i * 6, 2.5, STEELF); px(g, -31 - i * 7, -39 + i * 6, 3, 3, OILC); }
  // (the cranium: long steel plates riveted over a frame, gaps between them showing the dark inside)
  const dome = () => { g.moveTo(-32, -4); g.quadraticCurveTo(-22, -36, 18, -32); g.quadraticCurveTo(56, -28, 68, -8); g.lineTo(66, 2); g.lineTo(8, 6); g.quadraticCurveTo(-22, 8, -32, -4); };
  shapeShade(g, () => { dome(); g.closePath(); }, STEEL, 1.6, -2.2, 2, 18, -12);
  g.strokeStyle = STEEL[0]; g.lineWidth = 1.5;
  for (const sx of [-8, 14, 38]) { g.beginPath(); g.moveTo(sx, -32 + Math.abs(sx - 14) * 0.1); g.lineTo(sx + 4, 4); g.stroke(); }
  for (let i = 0; i < 9; i++) px(g, -20 + i * 9, -24 + Math.abs(i - 4) * 1.8, 2, 2, CHROME[3]);
  px(g, 0, -30, 30, 1, STEEL[4]);
  // (the eye socket: deep, a steel ring round it; the eye's lit live)
  g.fillStyle = STEEL[0]; g.beginPath(); g.ellipse(36, -15, 8, 6.5, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = CHROME[2]; g.lineWidth = 1.5; g.beginPath(); g.ellipse(36, -15, 8, 6.5, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  g.fillStyle = '#020203'; g.beginPath(); g.ellipse(36, -15, 5.5, 4.5, 0, 0, Math.PI * 2); g.fill();
  // (the far socket, just in sight past the snout's ridge)
  g.fillStyle = '#020203'; g.beginPath(); g.ellipse(48, -16, 3, 3.5, 0, 0, Math.PI * 2); g.fill();
  // (the cheek strut and the jaw hinge, out in the open: the servo, its horn, the piston up into the skull)
  tube(g, 2, -8, 16, 6, 4, STEEL);
  tube(g, 8, -18, 18, 4, 2.5, CHROME); px(g, 16, -2, 3, 6, CHROME[4]);
  blob(g, 16, 6, 6.5, 6.5, CHROME); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; px(g, 16 + Math.cos(a) * 7.5 - 1, 6 + Math.sin(a) * 7.5 - 1, 2, 2, CHROME[1]); }
  px(g, 15, 5, 2, 2, CHROME[0]);
  // (the upper fangs: steel, long)
  for (let i = 0; i < 9; i++) { const tx = 24 + i * 5; px(g, tx, 2, 3, 8 - (i % 2) * 2, TOOTH[0]); px(g, tx, 2, 3, 6 - (i % 2) * 2, TOOTH[2]); px(g, tx, 2, 1, 2, TOOTH[4]); }
  // (a wire loom out of the back of it, cut)
  hose(g, quad(-30, 0, -36, 6, -34, 12, 4), 2, RED, false); hose(g, quad(-28, 2, -32, 10, -28, 14, 4), 1.6, BLUE, false);
  soot(g, -20, -22, 30, 14, 19); soot(g, 40, -10, 20, 8, 23);
};
const paintJaw = (g: Ctx) => {
  tube(g, 0, 0, 46, 4, 6, STEEL); px(g, 4, -2, 40, 1, STEEL[4]);
  for (let i = 0; i < 8; i++) { const tx = 12 + i * 4.5; px(g, tx, -6, 3, 5, TOOTH[0]); px(g, tx, -5, 3, 4, TOOTH[2]); px(g, tx, -5, 1, 1, TOOTH[4]); }
  blob(g, 0, 0, 4, 4, CHROME);
  soot(g, 16, -1, 18, 5, 29);
};
const paintTail = (g: Ctx) => {
  const pts = quad(0, 0, -100, 8, -196, 30, 13);
  tube(g, 0, 0, -196, 30, 2.5, CHROME);
  for (let i = pts.length - 1; i >= 1; i--) {
    const [x, y] = pts[i], [x0, y0] = pts[i - 1], a = Math.atan2(y - y0, x - x0), u = i / (pts.length - 1);
    blob(g, x, y, 7 - u * 3, 4.5 - u * 2, i % 2 ? STEEL : STEELF, true, a);
    px(g, x - 1, y - 7 + u * 3, 2, 4 - u * 2, STEEL[3]);
  }
  // (the blade at its end: bare steel)
  g.save(); g.translate(-196, 30); g.rotate(Math.PI + 0.2);
  shapeShade(g, () => { g.moveTo(-2, -4); g.lineTo(20, -8); g.lineTo(26, 0); g.lineTo(20, 6); g.lineTo(-2, 4); g.closePath(); }, STEEL, 0, -1.4, 1.5, 12, 0);
  g.restore();
  soot(g, -120, 0, 60, 12, 31);
};

/** Each part: its box (for its little canvas), its middle (it turns about that, loose), how far its edge is from its
 *  middle lying down, and whether it lies down on its side (turned a quarter) or flat. */
const PART: Record<Part, { bb: readonly [number, number, number, number]; mid: [number, number]; r: number; flat: 0 | 1; paint: (g: Ctx, far: boolean) => void }> = {
  thigh: { bb: [-10, -14, 62, 30], mid: [20, 0], r: 6, flat: 0, paint: (g, far) => strut(g, LT, 9, far, 1) },
  shin: { bb: [-9, -13, 64, 28], mid: [22, 0], r: 5, flat: 0, paint: (g, far) => strut(g, LS, 7, far, 2) },
  foot: { bb: [-24, -8, 58, 36], mid: [4, 12], r: 7, flat: 0, paint: paintFoot },
  upper: { bb: [-9, -12, 58, 26], mid: [19, 0], r: 5, flat: 0, paint: (g, far) => strut(g, LU, 7, far, 4) },
  fore: { bb: [-9, -12, 62, 26], mid: [21, 0], r: 5, flat: 0, paint: (g, far) => strut(g, LF, 6, far, 5) },
  hand: { bb: [-8, -16, 44, 36], mid: [12, 2], r: 6, flat: 0, paint: paintHand },
  pelvis: { bb: [-28, -14, 54, 32], mid: [0, 0], r: 10, flat: 0, paint: () => {} },
  spine: { bb: [-16, -122, 38, 132], mid: [5, -56], r: 7, flat: 1, paint: () => {} },
  ribs: { bb: [-68, -64, 120, 116], mid: [-4, 0], r: 28, flat: 1, paint: () => {} },
  skull: { bb: [-42, -46, 116, 66], mid: [16, -12], r: 14, flat: 0, paint: () => {} },
  jaw: { bb: [-7, -9, 58, 20], mid: [22, 2], r: 5, flat: 0, paint: () => {} },
  tail: { bb: [-230, -16, 240, 60], mid: [-98, 14], r: 8, flat: 0, paint: () => {} },
};
PART.pelvis.paint = paintPelvis; PART.spine.paint = paintSpine; PART.ribs.paint = paintRibs;
PART.skull.paint = paintSkull; PART.jaw.paint = paintJaw; PART.tail.paint = paintTail;

/** The flakes of her burnt latex: curled, charred black, the burnt edge, a bit of the foam stuck to the back. */
const FLAKE_N = 6;
const FLAKE_BB = [-11, -8, 22, 16] as const;
const paintFlake = (g: Ctx, v: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2, r = 5 + hash(v * 13 + i) * 4; pts.push([Math.cos(a) * r * 1.2, Math.sin(a) * r * 0.7]); }
  const path = () => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
  path(); g.fillStyle = '#7C2D12'; g.fill();
  g.save(); g.translate(-0.5, -0.5); g.scale(0.85, 0.85); path(); g.fillStyle = '#16100C'; g.fill(); g.restore();
  px(g, -4, -2, 6, 1, '#3A2A1E'); px(g, -2, 1, 5, 1, '#2A1E16');
  if (v % 2) { px(g, 1, 2, 4, 2, FOAMR[0]); px(g, 2, 2, 2, 1, FOAMR[1]); }
  if (v % 3 === 0) px(g, -6, -1, 2, 2, '#5A3A1A');
};
