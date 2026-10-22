// Safari Artie's stampede: his mating whistle brings them running across the clearing, a rhino, a hippo, an elephant,
// one at a time early on and several later, spaced unevenly. Each its own size and pace and hit:
//   rhino     small and quick: jump it
//   hippo     wider, steadier: jump it (a good jump)
//   elephant  big and slow: too tall to jump; jump and uppercut over it
// Touching any of them anywhere hurts: there's no standing on them (nothing lit along their tops: they don't read
// as standable). Each comes with a warning: dust
// at the edge it's coming from, the ground rumbling, a flashing arrow. Whatever the spawner's let loose in its path
// (on the ground, on a bush) is squashed. They're not anybody: no shooting them, nothing to grab.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Block } from '../../../m1/types';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { hazardVictims, hazardKill, boxHits, setHazardZones, type Zone } from '../../hazardHit';
import { trample } from '../../weapons/spawner';
import { pixelBlob, stamp } from '../../intro/art/kit';
import { checkerFill, PIX } from '../../../m1/game/render/pixelArt';
import { GY } from '../geometry';
import { ARENA_L, ARENA_R, VIEW_L, VIEW_R } from './arena';

type Ctx = CanvasRenderingContext2D;
export type Beast = 'rhino' | 'hippo' | 'elephant';

/** Size (its back's at GY - h), pace (a frame), damage (before Meathead 2's softening), its color, its call. */
export const BEASTS: Record<Beast, { w: number; h: number; speed: number; dmg: number; col: string; call: Parameters<typeof playSound>[0]; pitch: number }> = {
  rhino: { w: 96, h: 56, speed: 8.6, dmg: 20, col: '#78716C', call: 'snort', pitch: -4 },
  hippo: { w: 128, h: 72, speed: 6.2, dmg: 24, col: '#8B7A99', call: 'bellow', pitch: 0 },
  elephant: { w: 168, h: 116, speed: 4.3, dmg: 30, col: '#9CA3AF', call: 'horn', pitch: 6 },
};
/** How long the warning's up before each one comes out. */
export const WARN = 80;

export interface Animal {
  kind: Beast; dir: 1 | -1;
  /** Its left edge. */
  x: number;
  /** Frames till it comes out (the warning's up for the last WARN of them). */
  warn: number;
  t: number; done: boolean;
  /** (nothing to stand on: always null) */
  block: Block | null;
  /** Got to Artie (he's dealt with it, one way or another). */
  metArtie: boolean;
  /** (the fight's over: it runs on through, harmless) */
  tame: boolean;
}

/** A stampede: these, coming this way (dir: which way they run), `gaps` frames apart. */
export const makeStampede = (kinds: Beast[], dir: 1 | -1, gaps: number[]): Animal[] => {
  let at = WARN;
  return kinds.map((kind, i) => {
    if (i > 0) at += gaps[i - 1] ?? 60;
    const b = BEASTS[kind];
    return { kind, dir, x: dir > 0 ? VIEW_L - b.w - 30 : VIEW_R + 30, warn: at, t: 0, done: false, block: null, metArtie: false, tame: false };
  });
};

/** Its body (what hurts): all of it, top to toe, head to tail. */
const bodyOf = (a: Animal) => {
  const b = BEASTS[a.kind], head = 18;
  return { x: a.x + 2 - (a.dir < 0 ? head : 0), y: GY - b.h - 2, w: b.w - 4 + head, h: b.h + 2 };
};
const overlaps = (r: { x: number; y: number; w: number; h: number }, x: number, y: number, w: number, h: number) => r.x < x + w && r.x + r.w > x && r.y < y + h && r.y + r.h > y;

/**
 * Each frame: out they come, on across; him hurt by one (or carried along on its back), the litter squashed under it,
 * and `atArtie` told the moment one gets to Artie (his x), once.
 */
export const updateStampede = (ctx: FrameContext, herd: Animal[], artieX: number | null, atArtie: (a: Animal) => void, holdPlayer: boolean) => {
  const { state } = ctx, p = state.player;
  const zones: Zone[] = [];
  setHazardZones(state, 'stampede', zones);
  for (const a of herd) {
    if (a.done) continue;
    const b = BEASTS[a.kind];
    if (a.warn > 0) {
      a.warn--;
      if (a.warn === WARN - 1) { playSound('rumble', 0.7); shakeScreen(state, 20, 3); }
      if (a.warn === 18) playSound(b.call, 0.9, b.pitch);
      continue;
    }
    a.t++;
    a.x += a.dir * b.speed;
    // (the ground shakes under it, the bigger the more)
    if (!a.tame && a.t % Math.round(48 / b.speed) === 0) { playSound('thud', 0.35 + b.h / 300, -6 - b.h / 30); shakeScreen(state, 6, b.h / 40); }
    if (a.t % 4 === 0) state.particles.push({ pos: { x: a.dir > 0 ? a.x + 10 : a.x + b.w - 10, y: GY - 4 }, vel: { x: -a.dir * (1 + Math.random() * 2), y: -0.5 - Math.random() * 1.5 }, life: 26, color: Math.random() < 0.5 ? 'rgba(168, 140, 100, 0.7)' : 'rgba(120, 100, 70, 0.6)', size: 4 + Math.random() * 6 });
    // Squashing whatever's under it
    trample(state, a.x, GY - b.h, b.w, b.h + 6);
    // (and whoever's in its way: his own guides too)
    const body0 = bodyOf(a);
    if (!a.tame) {
      for (const e of hazardVictims(state)) if (boxHits(e, body0.x, body0.y, body0.w, body0.h)) hazardKill(ctx, e, a.x + b.w / 2 - a.dir * 60, 'TRAMPLED!', { fling: { x: a.dir * 12, y: -12 }, sound: 'splat' });
      zones.push({ x0: body0.x - (a.dir < 0 ? 160 : 0), x1: body0.x + body0.w + (a.dir > 0 ? 160 : 0), y0: body0.y, y1: GY });
    }
    // Into him
    const body = bodyOf(a);
    if (!a.tame && !holdPlayer && p.health > 0 && state.deathTimer <= 0 && p.invincibilityTimer <= 0 && overlaps(body, p.pos.x, p.pos.y, p.width, p.height)) {
      hurtPlayer(ctx, b.dmg, `m2:${a.kind}`, { x: a.dir * 9, y: -8 }, 24);
      playSound('crunch', 0.8); shakeScreen(state, 12, 6);
    }
    // To Artie
    if (!a.metArtie && artieX !== null && artieX > body.x - 40 && artieX < body.x + body.w + 40) { a.metArtie = true; atArtie(a); }
    // Off the far side
    if ((a.dir > 0 && a.x > ARENA_R + 60) || (a.dir < 0 && a.x + b.w < ARENA_L - 60)) {
      a.done = true;
      if (a.block) { state.blocks = state.blocks.filter(k => k !== a.block); a.block = null; }
    }
  }
};

/** All through (or never started). */
export const stampedeOver = (herd: Animal[]) => herd.every(a => a.done);
/** Anything near him (out, coming or going): how far off the nearest is, horizontally. */
export const nearestTo = (herd: Animal[], x: number) => {
  let d = Infinity;
  for (const a of herd) { if (a.done || a.warn > 0) continue; const b = BEASTS[a.kind]; d = Math.min(d, Math.max(0, a.x - x, x - (a.x + b.w))); }
  return d;
};
/** Gone (him dead, the fight over): their backs come out of the world. */
export const clearStampede = (state: GameState, herd: Animal[]) => {
  for (const a of herd) if (a.block) { state.blocks = state.blocks.filter(k => k !== a.block); a.block = null; }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the warnings (dust boiling up at the edge, a flashing arrow with the beast's head on it) and the beasts
// themselves, peak SNES: every part in a stepped ramp of its hide (lit from the upper left; the steps dithered into
// each other where they meet), inked round, the hide worked over (the rhino's armor plates, folds and tubercles; the
// hippo's wet sheen and pink underside; the elephant's wrinkles, its veined ear). Each walks on its own anatomy: the
// rhino and hippo hocks bending back, the elephant's knees forward, the front legs folding at the wrist; an eight-frame
// gait each (the rhino's gallop, the hippo's trot, the elephant's amble), the feet planted through the stance and
// lifted through the swing, the body dropping onto each footfall. Each frame's painted once into a stamp.

const INK = '#1A0B06';
/** Each beast's hide, darkest first. */
const RAMPS: Record<Beast, string[]> = {
  rhino: ['#2A2622', '#463F38', '#665D53', '#887D70', '#AA9F90', '#CCC2B2'],
  hippo: ['#33263A', '#523F5C', '#74607E', '#957F9F', '#B6A0BE', '#D6C4DC'],
  elephant: ['#30343C', '#4C525C', '#6C737E', '#8D95A0', '#AEB5BF', '#D0D5DC'],
};
/** Horn (the rhino's, pale keratin), ivory (tusks, toenails), the hippo's pink, the elephant's ear inside, blood. */
const HORN = ['#4A3F2E', '#6E6048', '#978766', '#BDAE8C', '#DDD1B2', '#F4ECD6'];
const IVORY = ['#8A7A58', '#C2B28A', '#E8DDBE', '#FFF8E6'];
const PINK = ['#5E2E3C', '#8A4658', '#B46A7C', '#D3929F', '#ECBCC4', '#F8DCE0'];
const EAR_IN = ['#4A3E48', '#6A5866', '#8C7884', '#AC98A2', '#C9B6BE', '#E2D2D8'];
const BLOOD = ['#3A0606', '#7F1D1D', '#B91C1C', '#DC2626'];
const FRAMES = 8;
const TAU = Math.PI * 2;
const hs = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
type P = { x: number; y: number };

/** An ellipse, its edge dithered into whatever's under it (a checker of its color a cell out round it). */
const dEll = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => {
  c.fillStyle = checkerFill(c, col); c.beginPath(); c.ellipse(x, y, rx + PIX, ry + PIX, rot, 0, TAU); c.fill();
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(1, rx), Math.max(1, ry), rot, 0, TAU); c.fill();
};
/**
 * A part in steps, clipped to its outline (`path`, inside the box x, y, w, h): its color; the shade round its underside
 * and the deep shadow under that; lit toward the upper left, a highlight in that; each step dithered into the next.
 * `detail` paints over it while it's still clipped (folds, wrinkles, the hide's texture); then it's inked round.
 * Far: the whole ramp a step darker (the far side of the beast).
 */
const part = (c: Ctx, path: () => void, r: string[], x: number, y: number, w: number, h: number, detail?: () => void, far = false, line = 2) => {
  const o = far ? 1 : 0;
  c.save(); c.beginPath(); path(); c.clip();
  c.fillStyle = r[3 - o]; c.fillRect(x - 3, y - 3, w + 6, h + 6);
  dEll(c, x + w * 0.62, y + h * 1.04, w * 0.74, h * 0.5, r[2 - o]);
  dEll(c, x + w * 0.66, y + h * 1.26, w * 0.66, h * 0.42, r[1 - o]);
  dEll(c, x + w * 0.38, y + h * 0.2, w * 0.44, h * 0.28, r[4 - o]);
  dEll(c, x + w * 0.3, y + h * 0.14, w * 0.2, h * 0.11, r[5 - o]);
  detail?.();
  c.restore();
  c.beginPath(); path(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke();
};
/** A crease in the hide: the dark of the fold, the ridge over it catching the light. */
const fold = (c: Ctx, r: string[], x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, w = 2) => {
  const line = (dx: number, dy: number) => { c.beginPath(); c.moveTo(x0 + dx, y0 + dy); c.quadraticCurveTo(cx + dx, cy + dy, x1 + dx, y1 + dy); c.stroke(); };
  c.lineCap = 'round';
  c.strokeStyle = r[4]; c.lineWidth = 1; line(-1.5, -1);
  c.strokeStyle = r[0]; c.lineWidth = w; line(0, 0);
  c.lineCap = 'butt';
};
/** The hide's texture, scattered over an ellipse (cx, cy, rx, ry): little bumps, dark with a lit top (the lower half a
 *  step darker, in the shade). */
const bumps = (c: Ctx, r: string[], cx: number, cy: number, rx: number, ry: number, n: number, seed: number) => {
  for (let i = 0; i < n; i++) {
    const a = hs(seed + i * 3.7) * TAU, d = Math.sqrt(hs(seed + i * 1.9 + 0.31));
    const x = Math.round(cx + Math.cos(a) * rx * d), y = Math.round(cy + Math.sin(a) * ry * d), lo = y > cy ? 1 : 0;
    c.fillStyle = r[2 - lo]; c.fillRect(x, y, 2, 2);
    c.fillStyle = r[4 - lo]; c.fillRect(x, y - 1, 1, 1);
  }
};

// Legs: a quadruped's by its own anatomy. Each foot's planted through the stance (sliding back under it as the body
// goes on) and lifted through the swing; the joint between (the wrist on a front leg, the hock or the knee behind) found
// from the hip and the foot, bending the way that animal's does.

/** Where a foot is, u of the way through its step (0..1): planted (back from stride/2 ahead to stride/2 behind), then
 *  swung forward, lifted. */
const footAt = (u: number, stride: number, lift: number): P => {
  u = ((u % 1) + 1) % 1;
  if (u < 0.55) return { x: stride * (0.5 - u / 0.55), y: 0 };
  const k = (u - 0.55) / 0.45;
  return { x: stride * (-0.5 + k), y: -Math.sin(k * Math.PI) * lift };
};
/** The joint between hip h and foot f (bones l1, l2), bent forward (true) or back. The foot's pulled in if it's out of reach. */
const joint = (h: P, f: P, l1: number, l2: number, fwd: boolean): { j: P; f: P } => {
  let dx = f.x - h.x, dy = f.y - h.y, d = Math.hypot(dx, dy) || 1;
  const max = l1 + l2 - 0.5;
  if (d > max) { f = { x: h.x + (dx / d) * max, y: h.y + (dy / d) * max }; dx = f.x - h.x; dy = f.y - h.y; d = max; }
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const t = Math.atan2(dy, dx) + (fwd ? -a : a);
  return { j: { x: h.x + Math.cos(t) * l1, y: h.y + Math.sin(t) * l1 }, f };
};
/** A tapered bone (a to b, width w0 to w1), shifted `off` across itself; as a path. */
const seg = (c: Ctx, a: P, b: P, w0: number, w1: number, off = 0) => {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  c.beginPath();
  c.moveTo(a.x + nx * (off + w0 / 2), a.y + ny * (off + w0 / 2)); c.lineTo(b.x + nx * (off + w1 / 2), b.y + ny * (off + w1 / 2));
  c.lineTo(b.x + nx * (off - w1 / 2), b.y + ny * (off - w1 / 2)); c.lineTo(a.x + nx * (off - w0 / 2), a.y + ny * (off - w0 / 2));
  c.closePath();
};
/** A foot at f, its sole along `rot` (0: flat on the ground): the pad, domed, and its nails (the rhino's three, the
 *  hippo's stubby toes, the elephant's broad toenails). Sole up: the sole's showing, the nails pointing back. */
const foot = (c: Ctx, kind: Beast, f: P, rot: number, w: number, r: string[], far: boolean, soleUp = false) => {
  const o = far ? 1 : 0, rx = w * (kind === 'elephant' ? 0.62 : 0.6), ht = w * (kind === 'elephant' ? 0.5 : 0.55);
  c.save(); c.translate(f.x, f.y); c.rotate(rot);
  const dome = (grow: number) => { c.beginPath(); c.ellipse(w * 0.08, 0, rx + grow, ht + grow, 0, Math.PI, 0); c.closePath(); };
  c.fillStyle = INK; dome(1.5); c.fill();
  c.fillStyle = r[2 - o]; dome(0); c.fill();
  c.fillStyle = r[3 - o]; c.fillRect(Math.round(-rx * 0.7), Math.round(-ht * 0.9), Math.round(rx * 0.7), 2);
  if (soleUp) {
    // (the sole turned to the sky: cracked pad, pale)
    c.fillStyle = INK; c.beginPath(); c.ellipse(w * 0.08, 0, rx + 1, 3.5, 0, 0, TAU); c.fill();
    c.fillStyle = r[4]; c.beginPath(); c.ellipse(w * 0.08, 0, rx - 0.5, 2.2, 0, 0, TAU); c.fill();
    c.fillStyle = r[2]; c.fillRect(Math.round(-rx * 0.3), 0, Math.round(rx * 0.8), 1);
  }
  const n = kind === 'hippo' ? 4 : 3, span = rx * 1.5;
  for (let k = 0; k < n; k++) {
    const nx = w * 0.08 + rx * 0.9 - (k * span) / n, nw = kind === 'elephant' ? 4 : 3;
    if (kind === 'hippo') {
      // (stubby toes, each its own little bulge, a nail on it)
      c.fillStyle = INK; c.beginPath(); c.ellipse(nx, -2, 3.2, 3.2, 0, Math.PI, 0); c.fill();
      c.fillStyle = r[3 - o]; c.beginPath(); c.ellipse(nx, -2, 2, 2, 0, Math.PI, 0); c.fill();
      c.fillStyle = IVORY[1 - o]; c.fillRect(Math.round(nx - 1), -2, 2, 2);
    } else {
      c.fillStyle = INK; c.beginPath(); c.ellipse(nx, 0, nw / 2 + 1, nw * 0.7 + 1, 0, Math.PI, 0); c.fill();
      c.fillStyle = IVORY[2 - o]; c.beginPath(); c.ellipse(nx, 0, nw / 2, nw * 0.7, 0, Math.PI, 0); c.fill();
      c.fillStyle = IVORY[3 - o]; c.fillRect(Math.round(nx - nw / 2 + 0.5), Math.round(-nw * 0.55), 1, 1);
    }
  }
  c.restore();
};
/** A leg: hip, joint, foot; thick at the top, the joint knobbed, the shin narrower; shaded down the front, lit down the
 *  back (light from the upper left, facing right), wrinkles bunched at the joint, then the foot. */
const legArt = (c: Ctx, kind: Beast, h: P, j: P, f: P, w0: number, wj: number, wf: number, r: string[], far: boolean, footRot = 0, soleUp = false) => {
  const o = far ? 1 : 0;
  c.fillStyle = INK; seg(c, h, j, w0 + 3, wj + 3); c.fill(); seg(c, j, f, wj + 3, wf + 3); c.fill();
  c.beginPath(); c.arc(j.x, j.y, (wj + 3) / 2, 0, TAU); c.fill();
  c.fillStyle = r[3 - o]; seg(c, h, j, w0, wj); c.fill(); seg(c, j, f, wj, wf); c.fill();
  c.beginPath(); c.arc(j.x, j.y, wj / 2, 0, TAU); c.fill();
  // (the front of it in shade: a band, a darker rim; checker where the shade meets the color)
  c.fillStyle = checkerFill(c, r[2 - o]); seg(c, h, j, w0 * 0.5, wj * 0.5, -w0 * 0.12); c.fill(); seg(c, j, f, wj * 0.5, wf * 0.5, -wj * 0.12); c.fill();
  c.fillStyle = r[2 - o]; seg(c, h, j, w0 * 0.34, wj * 0.34, -w0 * 0.33); c.fill(); seg(c, j, f, wj * 0.34, wf * 0.34, -wj * 0.33); c.fill();
  c.fillStyle = r[1 - o]; seg(c, j, f, wj * 0.14, wf * 0.14, -wj * 0.43); c.fill();
  // (the back of it lit)
  c.fillStyle = r[4 - o]; seg(c, h, j, w0 * 0.16, wj * 0.16, w0 * 0.3); c.fill(); seg(c, j, f, wj * 0.14, wf * 0.14, wj * 0.3); c.fill();
  // (the wrinkles at the joint, the skin bunched; the elephant's ringed all down the shin)
  const dx = f.x - j.x, dy = f.y - j.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  c.strokeStyle = r[1 - o]; c.lineWidth = 1;
  const rings = kind === 'elephant' ? [-0.12, 0.05, 0.25, 0.45, 0.62] : [-0.1, 0.06, 0.2];
  for (const t of rings) {
    const cx = j.x + dx * t, cy = j.y + dy * t, hw = (wj + (wf - wj) * Math.max(0, t)) * 0.38;
    c.beginPath(); c.moveTo(cx - nx * hw, cy - ny * hw); c.quadraticCurveTo(cx + ux * 1.5, cy + uy * 1.5, cx + nx * hw, cy + ny * hw); c.stroke();
  }
  foot(c, kind, f, footRot, wf, r, far, soleUp);
};
/** A leg in its gait: hip h, u of the way through its step. */
const gaitLeg = (c: Ctx, kind: Beast, h: P, u: number, l1: number, l2: number, fwd: boolean, stride: number, lift: number, w0: number, wj: number, wf: number, r: string[], far: boolean) => {
  const ft = footAt(u, stride, lift);
  const { j, f } = joint(h, { x: h.x + ft.x, y: ft.y }, l1, l2, fwd);
  // (lifted, the foot tips: toe down coming forward)
  const tip = ft.y < -1 ? Math.max(-0.5, Math.min(0.5, (Math.atan2(f.y - j.y, f.x - j.x) - Math.PI / 2) * 0.6)) : 0;
  legArt(c, kind, h, j, f, w0, wj, wf, r, far, tip);
};

/** The tail: a rope off the rump (ink, the hide, a lit line), a tuft of dark hair on its end. */
const tail = (c: Ctx, r: string[], x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, w: number, tuft: number) => {
  c.lineCap = 'round';
  for (const [lw, col] of [[w + 2.5, INK], [w, r[2]], [Math.max(1, w * 0.35), r[4]]] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(cx, cy, x1, y1); c.stroke(); }
  c.lineCap = 'butt';
  if (tuft > 0) {
    const a = Math.atan2(y1 - cy, x1 - cx);
    c.fillStyle = INK; c.beginPath(); c.ellipse(x1 + Math.cos(a) * tuft * 0.6, y1 + Math.sin(a) * tuft * 0.6, tuft * 0.45 + 1, tuft + 1, a - Math.PI / 2, 0, TAU); c.fill();
    c.fillStyle = '#2A211C'; c.beginPath(); c.ellipse(x1 + Math.cos(a) * tuft * 0.6, y1 + Math.sin(a) * tuft * 0.6, tuft * 0.45, tuft, a - Math.PI / 2, 0, TAU); c.fill();
    c.fillStyle = '#4A3C30'; c.fillRect(Math.round(x1 - 1), Math.round(y1 + 1), 1, Math.round(tuft));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The rhino: a black rhino in a temper. The barrel of it in armor plates (the shield over the shoulder, the one over the
// rump, the folds between them and down over the legs, the hide studded with tubercles), the hump of the shoulders, the
// head down and charging: the long front horn swept back, ridged where it's grown, the little horn behind it, the
// hooked lip, the nostril flared, the small mean eye under a creased brow, the tubed ears flicking with the gallop.

const phOf = (fr: number) => (fr / FRAMES) * TAU;
/** The rhino's gallop in a frame: how far the body's dropped (bob), its middle's height (by), its head's (hy). */
const rhinoPose = (fr: number) => {
  const ph = phOf(fr), bob = Math.round(-Math.sin(ph) * 2.5), by = -32 + bob;
  return { ph, bob, by, hy: by + 4 + Math.round(Math.sin(ph + 0.9) * 2) };
};
/** A frame of the rhino's gallop t frames into its run at `speed` (as drawBeast picks them). */
export const gallopFrame = (t: number, speed: number) => Math.floor((t * speed * 0.09) / TAU * FRAMES) % FRAMES;
/** The rhino's horn in a frame of its gallop (feet at the origin, facing right): its base (the middle of where it comes
 *  out of the snout) and its tip. */
export const rhinoHorn = (fr: number) => { const hy = rhinoPose(fr).hy; return { bx: 65, by: hy, tx: 77.5, ty: hy - 24.5 }; };

/** The rhino's barrel, its middle at the origin (facing right): the plates, the folds, the tubercles. `buckle`: dead
 *  against the wall, the folds behind the neck crushed up hard. */
const rhinoBody = (c: Ctx, r: string[], buckle = 0) => {
  const path = () => {
    c.moveTo(-46, -6);
    c.bezierCurveTo(-44, -21, -24, -23, -6, -18);
    c.bezierCurveTo(6, -16, 14, -26, 26, -22);
    c.bezierCurveTo(36, -19, 44, -10, 46, 0);
    c.bezierCurveTo(46, 10, 38, 16, 26, 16);
    c.bezierCurveTo(10, 18, -16, 18, -30, 15);
    c.bezierCurveTo(-42, 13, -48, 6, -46, -6);
    c.closePath();
  };
  part(c, path, r, -48, -24, 94, 42, () => {
    // (the shoulder shield: the fold behind it, sweeping down behind the front leg; the rump shield's, in front of the
    // haunch; the flank fold low along the belly; the haunch's own curve)
    fold(c, r, 8, -18, 2, 0, 10, 20, 2.5);
    fold(c, r, -22, -20, -14, 0, -22, 20, 2.5);
    fold(c, r, -14, 12, 0, 16, 10, 12, 1.5);
    fold(c, r, -44, 2, -36, 14, -24, 10, 1.5);
    fold(c, r, 16, 6, 24, 16, 34, 10, 1.5);
    // (the plates' edges catching the light along the top of each)
    c.fillStyle = r[5]; c.fillRect(-18, -19, 8, 1); c.fillRect(12, -22, 7, 1);
    // (the tubercles, studded over the shields)
    bumps(c, r, 24, -4, 14, 12, 14, 3);
    bumps(c, r, -32, -6, 12, 12, 12, 7);
    bumps(c, r, -6, -4, 12, 10, 8, 11);
    // (the old scars: a pale scratch or two)
    c.fillStyle = r[4]; c.fillRect(-4, -10, 6, 1); c.fillRect(-2, -9, 4, 1); c.fillRect(30, 2, 1, 5);
    if (buckle > 0) for (let i = 0; i < 4; i++) fold(c, r, 30 + i * 4, -18 + i * 2, 34 + i * 4, -6, 30 + i * 4, 8 + i * 2, 2);
  });
};

/** The rhino's head, its middle at the origin, facing right; its horn's base at (19, 0) and tip at (31.5, -24.5).
 *  'bloody': carrying Artie (his blood down the horn, spattered up its face). 'dead': driven into the wall (an X for an
 *  eye, the lid slack; the brow split open where it hit, the little horn snapped; the tongue lolled out, blood out of
 *  the nostril and the mouth). */
const rhinoHead = (c: Ctx, r: string[], ph: number, how: 'live' | 'bloody' | 'dead') => {
  const dead = how === 'dead';
  // The far ear (behind)
  const ear = dead ? 0.7 : -0.5 + Math.sin(ph) * 0.25;
  const earArt = (ex: number, ey: number, a: number, far: boolean) => {
    c.save(); c.translate(ex, ey); c.rotate(a);
    part(c, () => c.ellipse(0, -6, 3.6, 7.5, 0, 0, TAU), r, -4, -14, 8, 15, () => { c.fillStyle = r[far ? 0 : 1]; c.beginPath(); c.ellipse(0.6, -7, 1.6, 5, 0, 0, TAU); c.fill(); }, far, 1.5);
    // (its fringe of hair at the tip)
    c.fillStyle = INK; c.fillRect(-2, -14, 1, 2); c.fillRect(0, -15, 1, 2); c.fillRect(2, -14, 1, 2);
    c.restore();
  };
  earArt(-8, -10, ear - 0.35, true);
  // The head: the poll, the forehead down to the nose, the hooked lip, the jaw, the cheek
  const path = () => {
    c.moveTo(-14, -10);
    c.quadraticCurveTo(4, -15, 14, -4);
    c.quadraticCurveTo(24, 0, 28, 8);
    c.quadraticCurveTo(30, 12, 26, 14);
    c.quadraticCurveTo(12, 17, 0, 13);
    c.quadraticCurveTo(-11, 10, -16, 1);
    c.closePath();
  };
  part(c, path, r, -16, -15, 46, 31, () => {
    // (the folds round the eye and down the cheek, the wrinkles over the nose)
    fold(c, r, -8, 3, -2, 8, 6, 7, 1.5);
    fold(c, r, -12, -4, -10, 4, -6, 10, 1.5);
    fold(c, r, 12, 2, 14, 6, 13, 10, 1);
    fold(c, r, 16, 4, 19, 7, 18, 11, 1);
    bumps(c, r, -6, -4, 6, 5, 6, 17);
    // (the lip, the mouth line back from it)
    c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(27, 12); c.quadraticCurveTo(18, 13, 8, 11); c.stroke();
    c.strokeStyle = r[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(25, 10); c.quadraticCurveTo(18, 11, 10, 9.5); c.stroke();
  });
  // The nostril: flared, snorting
  c.fillStyle = INK; c.beginPath(); c.ellipse(23, 5, 1.6, 2.8, 0.6, 0, TAU); c.fill();
  c.fillStyle = r[1]; c.fillRect(23, 2, 2, 1);
  // The little horn (snapped off short, dead: the stump jagged)
  const hornPart = (pts: () => void, x: number, y: number, w: number, h: number, rings: number[][], line = 2) => part(c, pts, HORN, x, y, w, h, () => {
    c.strokeStyle = HORN[1]; c.lineWidth = 1;
    for (const [x0, y0, x1, y1] of rings) { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2 + 1, (y0 + y1) / 2 + 2, x1, y1); c.stroke(); }
    c.fillStyle = HORN[5]; c.fillRect(Math.round(x + w * 0.3), Math.round(y + 3), 1, Math.round(h * 0.4));
  }, false, line);
  if (dead) {
    hornPart(() => { c.moveTo(2, -10); c.lineTo(3, -15); c.lineTo(5, -13); c.lineTo(6, -16); c.lineTo(8, -14); c.lineTo(9, -8); c.closePath(); }, 2, -16, 7, 8, [[3, -11, 8, -10]], 1.5);
    c.fillStyle = HORN[1]; c.fillRect(4, -14, 3, 1);
  } else {
    hornPart(() => { c.moveTo(2, -10); c.quadraticCurveTo(4, -18, 8, -22); c.quadraticCurveTo(10, -14, 9.5, -8); c.closePath(); }, 2, -22, 8, 14, [[3, -13, 9, -12], [5, -17, 9, -16]], 1.5);
  }
  // The front horn: swept back, ridged where it's grown
  hornPart(() => { c.moveTo(12, -4.5); c.quadraticCurveTo(18, -18, 31.5, -24.5); c.quadraticCurveTo(29, -7, 25, 3); c.closePath(); },
    12, -25, 20, 28, [[14, -2, 25, 1], [16, -8, 27, -5], [19, -14, 28, -12], [24, -19, 30, -18]]);
  if (how !== 'live') {
    // (blood down the horn: dark from the base, bright and wet further up where it's fresh, drips off the front edge)
    c.save(); c.beginPath(); c.moveTo(12, -4.5); c.quadraticCurveTo(18, -18, 31.5, -24.5); c.quadraticCurveTo(29, -7, 25, 3); c.closePath(); c.clip();
    c.fillStyle = BLOOD[1]; c.beginPath(); c.moveTo(14, -12); c.lineTo(32, -26); c.lineTo(30, -2); c.lineTo(24, 4); c.closePath(); c.fill();
    c.fillStyle = checkerFill(c, BLOOD[2]); c.fillRect(14, -26, 20, 10);
    c.fillStyle = BLOOD[2]; c.beginPath(); c.moveTo(22, -18); c.lineTo(32, -26); c.lineTo(29, -12); c.closePath(); c.fill();
    c.fillStyle = BLOOD[3]; c.fillRect(27, -20, 1, 6);
    c.restore();
    c.fillStyle = BLOOD[2]; c.fillRect(28, -6, 1, 5); c.fillRect(27, -1, 2, 2); c.fillRect(25, 1, 1, 6); c.fillRect(24, 7, 2, 2);
    // (spattered up its face)
    for (const [sx, sy] of [[10, -6], [6, -2], [14, 2], [2, -8], [17, -3], [8, 4]] as const) { c.fillStyle = BLOOD[(sx + sy) & 1 ? 1 : 2]; c.fillRect(sx, sy, 2, 1 + ((sx * 3) & 1)); }
  }
  // The eye: small, mean, under a creased brow (dead: an X, the lid slack over it)
  if (dead) {
    c.fillStyle = INK; for (let i = -2; i <= 2; i++) { c.fillRect(-1 + i, -1 + i, 2, 2); c.fillRect(-1 + i, -1 - i, 2, 2); }
    c.strokeStyle = r[1]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-5, -4); c.quadraticCurveTo(0, -1, 4, -4); c.stroke();
    // (the brow split open where it hit the stone: the gash, raw inside, a chip of skull showing, the blood out of it)
    c.fillStyle = INK; c.beginPath(); c.ellipse(9, -10, 6, 2.6, -0.5, 0, TAU); c.fill();
    c.fillStyle = BLOOD[1]; c.beginPath(); c.ellipse(9, -10, 4.6, 1.6, -0.5, 0, TAU); c.fill();
    c.fillStyle = BLOOD[3]; c.fillRect(7, -10, 3, 1);
    c.fillStyle = IVORY[3]; c.fillRect(10, -12, 2, 1);
    c.fillStyle = BLOOD[2]; c.fillRect(5, -8, 1, 6); c.fillRect(4, -2, 2, 2); c.fillRect(12, -7, 1, 4);
  } else {
    c.fillStyle = INK; c.beginPath(); c.ellipse(-1, -1, 2.6, 2, 0.2, 0, TAU); c.fill();
    c.fillStyle = '#5A2A10'; c.fillRect(-1, -2, 2, 2);
    c.fillStyle = '#F8FAFC'; c.fillRect(-1, -2, 1, 1);
    // (the brow, knotted down over it)
    c.fillStyle = INK; c.beginPath(); c.moveTo(-5, -5); c.lineTo(3, -2.5); c.lineTo(3, -1); c.lineTo(-5, -3.5); c.closePath(); c.fill();
    c.strokeStyle = r[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(-5, -7); c.quadraticCurveTo(-1, -8, 3, -5); c.stroke();
  }
  // The near ear
  earArt(-12, -9, ear, false);
  if (dead) {
    // (the tongue, out of the side of its mouth and hanging: pink, its shade down the middle; blood out of the nostril
    // and from the mouth, running)
    c.fillStyle = INK; c.beginPath(); c.ellipse(14, 17, 4.4, 7.4, 0.35, 0, TAU); c.fill();
    c.fillStyle = PINK[2]; c.beginPath(); c.ellipse(14, 17, 3, 6, 0.35, 0, TAU); c.fill();
    c.fillStyle = PINK[4]; c.fillRect(12, 12, 2, 7);
    c.fillStyle = PINK[1]; c.fillRect(15, 16, 1, 6);
    c.fillStyle = BLOOD[1]; c.fillRect(21, 7, 4, 3); c.fillStyle = BLOOD[2]; c.fillRect(22, 8, 2, 9); c.fillRect(21, 16, 4, 3); c.fillStyle = BLOOD[3]; c.fillRect(22, 9, 1, 4);
    c.fillStyle = BLOOD[2]; c.fillRect(8, 13, 2, 8); c.fillRect(7, 20, 4, 2);
  }
};

/** One frame of the rhino's gallop (feet at the origin, facing right). */
const paintRhino = (c: Ctx, fr: number, how: 'live' | 'bloody') => {
  const r = RAMPS.rhino, { ph, by, hy } = rhinoPose(fr), u = fr / FRAMES;
  // (a gallop: the hinds down together nearly, then the fronts; the hock bending back, the wrist forward)
  const hind = (x: number, k: number, far: boolean) => gaitLeg(c, 'rhino', { x, y: by + 8 }, u + k, 16, 16, false, 30, 9, 17, 11, 10, r, far);
  const front = (x: number, k: number, far: boolean) => gaitLeg(c, 'rhino', { x, y: by + 10 }, u + k, 14, 16, true, 30, 10, 15, 11, 10, r, far);
  hind(-20, 0.12, true); front(32, 0.62, true);
  hind(-28, 0, false); front(24, 0.5, false);
  // (the tail, up and flicking with the run)
  const sw = Math.sin(ph * 2) * 4;
  tail(c, r, -48, by - 8, -58, by - 12 + sw, -60, by + 2 + sw, 3, 4);
  // (the neck, behind the shoulder: thick, folded where it meets the head)
  part(c, () => c.ellipse(36, by + 1, 11, 14, 0.3, 0, TAU), r, 25, by - 13, 22, 28, () => { fold(c, r, 32, by - 10, 38, by, 34, by + 12, 1.5); fold(c, r, 38, by - 8, 43, by + 1, 40, by + 10, 1.5); });
  c.save(); c.translate(-4, by); rhinoBody(c, r); c.restore();
  c.save(); c.translate(46, hy); rhinoHead(c, r, ph, how); c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The hippo: a barrel of a thing at a trot, wet-skinned (the sheen along its back), pink under the belly and round the
// eyes, ears and jaws. The head's the most of it: the jaws open wide (wider on the footfall), the tusks up out of the
// bottom one, the pegs of its front teeth, the pink of its mouth and tongue; the eyes and the ears and the nostrils up
// on top in their bumps, the ears flicking. Stubby legs, four toes.

const paintHippo = (c: Ctx, fr: number) => {
  const r = RAMPS.hippo, ph = phOf(fr), u = fr / FRAMES;
  const bob = Math.round(Math.abs(Math.sin(ph)) * 3) - 1, by = -40 + bob;
  // (a trot: diagonal pairs together)
  const hind = (x: number, y: number, k: number, far: boolean) => gaitLeg(c, 'hippo', { x, y: by + y }, u + k, 15, 14, false, 24, 7, 20, 15, 15, r, far);
  const front = (x: number, y: number, k: number, far: boolean) => gaitLeg(c, 'hippo', { x, y: by + y }, u + k, 15, 14, true, 24, 7, 19, 15, 15, r, far);
  hind(-38, 14, 0.5, true); front(38, 16, 0.04, true);
  hind(-46, 16, 0, false); front(30, 18, 0.54, false);
  // (the stubby tail, a flat paddle, flicking)
  const fl = Math.sin(ph * 2) * 5;
  tail(c, r, -66, by - 6, -72, by - 2, -74, by + 6 + fl, 4, 2);
  // The barrel
  const path = () => {
    c.moveTo(-62, -2);
    c.bezierCurveTo(-62, -24, -40, -30, -12, -28);
    c.bezierCurveTo(14, -27, 34, -24, 44, -14);
    c.bezierCurveTo(52, -6, 52, 10, 42, 20);
    c.bezierCurveTo(24, 30, -30, 30, -48, 22);
    c.bezierCurveTo(-60, 16, -64, 8, -62, -2);
    c.closePath();
  };
  c.save(); c.translate(-6, by);
  part(c, path, r, -64, -30, 116, 58, () => {
    // (the pink belly, its own steps, dithered into the hide)
    dEll(c, -6, 30, 52, 12, PINK[2]); dEll(c, -6, 34, 48, 8, PINK[1]);
    c.fillStyle = checkerFill(c, PINK[3]); c.fillRect(-40, 17, 50, 2);
    // (the folds: behind the shoulder, in front of the haunch, the rolls of the neck)
    fold(c, r, 22, -22, 16, 0, 22, 20, 2);
    fold(c, r, -36, -24, -28, 0, -38, 18, 2);
    fold(c, r, 36, -16, 40, -4, 36, 8, 1.5);
    fold(c, r, 42, -10, 46, 0, 42, 10, 1.5);
    // (the wet sheen along the back: bright streaks, broken)
    c.fillStyle = r[5]; c.fillRect(-30, -25, 10, 1); c.fillRect(-16, -26, 6, 1); c.fillRect(2, -24, 12, 1); c.fillRect(-26, -23, 4, 1);
    c.fillStyle = '#F4ECF6'; c.fillRect(-28, -25, 3, 1); c.fillRect(5, -24, 3, 1);
    // (old scars, pale, the fights it's had)
    c.fillStyle = r[4]; for (const [sx, sy, sl] of [[-10, -8, 9], [-4, -4, 6], [10, -14, 7], [-46, -6, 5]] as const) c.fillRect(sx, sy, sl, 1);
    bumps(c, r, -10, -6, 40, 14, 18, 23);
  });
  c.restore();
  // The head: the jaws about a hinge under its ear, gaping (wider on the footfall)
  const gape = 0.22 + Math.abs(Math.sin(ph)) * 0.28, H = { x: 42, y: by - 4 };
  const upA = -gape * 0.6, loA = gape * 0.5;
  const at = (a: number, x: number, y: number): P => ({ x: H.x + x * Math.cos(a) - y * Math.sin(a), y: H.y + x * Math.sin(a) + y * Math.cos(a) });
  // (the mouth: dark red in the back of it, pink further forward)
  const u0 = at(upA, 34, 0), l0 = at(loA, 34, 0), u1 = at(upA, 14, 0), l1 = at(loA, 14, 0);
  c.fillStyle = INK; c.beginPath(); c.moveTo(H.x - 2, H.y); c.lineTo(u0.x, u0.y); c.lineTo(l0.x, l0.y); c.closePath(); c.fill();
  c.fillStyle = '#4A0F18'; c.beginPath(); c.moveTo(H.x, H.y); c.lineTo(u0.x, u0.y + 1); c.lineTo(l0.x, l0.y - 1); c.closePath(); c.fill();
  c.fillStyle = PINK[1]; c.beginPath(); c.moveTo(u1.x, u1.y + 1); c.lineTo(u0.x, u0.y + 1); c.lineTo(l0.x, l0.y - 1); c.lineTo(l1.x, l1.y - 1); c.closePath(); c.fill();
  c.fillStyle = checkerFill(c, PINK[2]); c.beginPath(); c.moveTo(u1.x, u1.y + 1); c.lineTo(u0.x, u0.y + 1); c.lineTo(l0.x, l0.y - 1); c.lineTo(l1.x, l1.y - 1); c.closePath(); c.fill();
  // The bottom jaw: its tusks up out of it, the pegs at the front, the tongue
  c.save(); c.translate(H.x, H.y); c.rotate(loA);
  // (the far tusk, behind)
  const tusk = (x: number, far: boolean) => part(c, () => { c.moveTo(x - 2, 1); c.quadraticCurveTo(x - 2, -8, x + 3, -14); c.quadraticCurveTo(x + 4, -6, x + 3, 1); c.closePath(); }, [IVORY[0], IVORY[0], IVORY[1], IVORY[2], IVORY[3], '#FFFFFF'], x - 2, -14, 6, 15, undefined, far, 1.5);
  tusk(22, true);
  part(c, () => { c.moveTo(-4, 0); c.lineTo(34, 0); c.quadraticCurveTo(40, 2, 38, 8); c.quadraticCurveTo(30, 18, 12, 16); c.quadraticCurveTo(-2, 14, -6, 6); c.closePath(); }, r, -6, 0, 46, 18, () => {
    dEll(c, 26, 6, 12, 5, PINK[2]); dEll(c, 30, 4, 6, 2, PINK[3]);
    fold(c, r, 4, 10, 12, 14, 20, 12, 1);
    c.fillStyle = r[1]; for (const [wx, wy] of [[30, 9], [33, 8], [28, 11], [34, 11]] as const) c.fillRect(wx, wy, 1, 1);
  });
  c.fillStyle = PINK[3]; c.beginPath(); c.ellipse(16, 0, 10, 2.4, 0, Math.PI, 0); c.fill();
  c.fillStyle = PINK[4]; c.fillRect(10, -1, 8, 1);
  tusk(28, false);
  for (const px2 of [34, 37]) { c.fillStyle = INK; c.fillRect(px2 - 1, -3, 4, 4); c.fillStyle = IVORY[2]; c.fillRect(px2, -2, 2, 2); c.fillStyle = IVORY[3]; c.fillRect(px2, -2, 1, 1); }
  c.restore();
  // The top: the dome of the head, the muzzle, the nostrils up on top; the eye in its bump, the ear
  part(c, () => c.ellipse(H.x - 4, H.y - 10, 16, 15, 0, 0, TAU), r, H.x - 20, H.y - 25, 32, 30, () => fold(c, r, H.x - 14, H.y - 16, H.x - 10, H.y - 4, H.x - 14, H.y + 4, 1.5));
  c.save(); c.translate(H.x, H.y); c.rotate(upA);
  part(c, () => { c.moveTo(-8, -18); c.quadraticCurveTo(10, -24, 24, -22); c.quadraticCurveTo(36, -24, 38, -12); c.quadraticCurveTo(41, -2, 34, 0); c.lineTo(2, 0); c.quadraticCurveTo(-8, -6, -8, -18); c.closePath(); }, r, -8, -24, 48, 24, () => {
    dEll(c, 26, -2, 14, 5, PINK[2]); dEll(c, 32, -4, 5, 3, PINK[3]);
    fold(c, r, 10, -20, 13, -12, 10, -4, 1);
    fold(c, r, 16, -20, 19, -12, 16, -4, 1);
    // (whisker stubble round the lip)
    c.fillStyle = r[1]; for (const [wx, wy] of [[28, -6], [31, -8], [34, -5], [25, -8], [30, -3], [35, -9]] as const) c.fillRect(wx, wy, 1, 1);
  });
  // (the nostril bumps, the slits flared)
  part(c, () => c.ellipse(30, -21, 6, 3.5, -0.15, 0, TAU), r, 24, -25, 12, 7, undefined, false, 1.5);
  c.fillStyle = INK; c.fillRect(28, -23, 3, 2); c.fillRect(33, -22, 2, 2);
  // (the top teeth: a tusk down, the pegs)
  c.fillStyle = INK; c.beginPath(); c.moveTo(25, 0); c.lineTo(26, 8); c.lineTo(30, 0); c.closePath(); c.fill();
  c.fillStyle = IVORY[2]; c.beginPath(); c.moveTo(26, 0.5); c.lineTo(26.6, 6); c.lineTo(28.8, 0.5); c.closePath(); c.fill();
  c.fillStyle = INK; c.fillRect(33, 0, 3, 4); c.fillStyle = IVORY[2]; c.fillRect(34, 0, 1, 3);
  // (the inside of the lip, pink)
  c.fillStyle = PINK[3]; c.fillRect(4, -1, 20, 1);
  c.restore();
  // (the eye up in its bump, pink-rimmed; the ear, flicking)
  const eb = at(upA * 0.5, -2, -22);
  part(c, () => c.ellipse(eb.x, eb.y, 6, 5, 0, 0, TAU), r, eb.x - 6, eb.y - 5, 12, 10, undefined, false, 1.5);
  c.fillStyle = PINK[2]; c.fillRect(Math.round(eb.x - 2), Math.round(eb.y - 1), 6, 4);
  c.fillStyle = INK; c.fillRect(Math.round(eb.x - 1), Math.round(eb.y - 1), 4, 3);
  c.fillStyle = '#6A2A14'; c.fillRect(Math.round(eb.x), Math.round(eb.y - 1), 2, 2);
  c.fillStyle = '#F8FAFC'; c.fillRect(Math.round(eb.x), Math.round(eb.y - 1), 1, 1);
  c.fillStyle = INK; c.fillRect(Math.round(eb.x - 3), Math.round(eb.y - 4), 7, 2);
  const flick = Math.sin(ph * 2) > 0.6 ? 0.6 : -0.2;
  c.save(); c.translate(H.x - 14, H.y - 22); c.rotate(flick);
  part(c, () => c.ellipse(0, -4, 3, 5, 0, 0, TAU), r, -3, -9, 6, 10, () => { c.fillStyle = PINK[2]; c.beginPath(); c.ellipse(0.5, -4, 1.5, 3.2, 0, 0, TAU); c.fill(); }, false, 1.5);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The elephant: a bull, lumbering at an amble (each foot in turn: the near hind, the near fore, the far hind, the far
// fore), the knees bending forward on the hinds as it goes. The hide wrinkled all over, ringed down the trunk and the
// legs; the high shoulder, the dip of the back; the great ear flapping, veined, its edge torn; the tusks, the trunk up
// trumpeting on the stride and swinging down off it, its lip open under it; the eye, lashed, in its wrinkles.

const paintElephant = (c: Ctx, fr: number) => {
  const r = RAMPS.elephant, ph = phOf(fr), u = fr / FRAMES;
  const bob = Math.round(Math.sin(ph * 2) * 1.5), by = -74 + bob;
  const leg2 = (x: number, y: number, k: number, far: boolean, front: boolean) =>
    gaitLeg(c, 'elephant', { x, y: by + y }, u + k, 31, 30, true, 32, 12, front ? 26 : 28, 21, 24, r, far);
  leg2(-50, 14, 0.5, true, false); leg2(42, 16, 0.75, true, true);
  leg2(-58, 18, 0, false, false); leg2(34, 20, 0.25, false, true);
  // (the tail, a long rope swinging, its tuft)
  tail(c, r, -82, by - 14, -94, by + Math.sin(ph) * 8, -90, by + 24 + Math.sin(ph) * 4, 2.5, 5);
  // The body: the high shoulder, the dip of the back, the sloped rump
  const path = () => {
    c.moveTo(-74, 0);
    c.bezierCurveTo(-76, -26, -60, -38, -36, -36);
    c.bezierCurveTo(-14, -34, 8, -42, 34, -38);
    c.bezierCurveTo(56, -34, 66, -16, 64, 4);
    c.bezierCurveTo(62, 22, 50, 34, 30, 36);
    c.bezierCurveTo(4, 40, -40, 40, -58, 32);
    c.bezierCurveTo(-70, 26, -74, 14, -74, 0);
    c.closePath();
  };
  c.save(); c.translate(-10, by);
  part(c, path, r, -76, -42, 142, 82, () => {
    // (the folds: the shoulder, the haunch, the slack skin hanging between them and over the knees)
    fold(c, r, 30, -34, 22, -4, 32, 30, 2.5);
    fold(c, r, -42, -34, -32, -4, -46, 28, 2.5);
    fold(c, r, -28, 26, -8, 32, 16, 28, 1.5);
    for (const wx of [-56, -48, 36, 44]) fold(c, r, wx, 14, wx + 4, 22, wx, 30, 1);
    // (the wrinkles all over it: short creases, criss-crossed)
    for (let i = 0; i < 34; i++) {
      const x = Math.round(-66 + hs(i * 2.3) * 124), y = Math.round(-30 + hs(i * 4.7 + 1) * 58), l = 3 + Math.round(hs(i * 7.1) * 5);
      c.strokeStyle = y > 8 ? r[0] : r[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y + (i & 1 ? 2 : -2), x + l, y); c.stroke();
    }
  });
  c.restore();
  // The head: the dome of the forehead, the face down into the trunk
  const hx = 60, hy = by - 2 + Math.round(Math.sin(ph) * 2);
  const sw = Math.sin(ph) * 14;
  // (the far tusk, behind the trunk)
  const tuskArt = (dx: number, dy: number, far: boolean) => part(c, () => {
    c.moveTo(hx + 12 + dx, hy + 10 + dy); c.quadraticCurveTo(hx + 34 + dx, hy + 28 + dy, hx + 46 + dx, hy + 14 + dy);
    c.quadraticCurveTo(hx + 32 + dx, hy + 18 + dy, hx + 16 + dx, hy + 4 + dy); c.closePath();
  }, [IVORY[0], IVORY[0], IVORY[1], IVORY[2], IVORY[3], '#FFFFFF'], hx + 12 + dx, hy + 4 + dy, 34, 22, () => {
    c.fillStyle = IVORY[0]; c.fillRect(hx + 14 + dx, hy + 6 + dy, 6, 6);
  }, far, 2);
  tuskArt(6, -2, true);
  part(c, () => {
    c.moveTo(hx - 22, hy - 14);
    c.quadraticCurveTo(hx - 6, hy - 36, hx + 14, hy - 24);
    c.quadraticCurveTo(hx + 27, hy - 14, hx + 24, hy + 4);
    c.quadraticCurveTo(hx + 18, hy + 20, hx + 4, hy + 20);
    c.quadraticCurveTo(hx - 16, hy + 18, hx - 22, hy + 2);
    c.closePath();
  }, r, hx - 22, hy - 30, 48, 50, () => {
    fold(c, r, hx - 2, hy - 26, hx + 6, hy - 18, hx + 14, hy - 22, 1.5);
    fold(c, r, hx + 2, hy + 2, hx + 10, hy + 8, hx + 18, hy + 4, 1);
    fold(c, r, hx, hy + 8, hx + 8, hy + 14, hx + 16, hy + 10, 1);
    bumps(c, r, hx, hy - 4, 14, 12, 8, 31);
  });
  // (the lip under the trunk, open: trumpeting on the stride)
  const open = Math.max(0, sw) / 14;
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx + 4, hy + 16); c.lineTo(hx + 16, hy + 16 + open * 2); c.lineTo(hx + 6, hy + 22 + open * 4); c.closePath(); c.fill();
  c.fillStyle = PINK[2]; c.beginPath(); c.moveTo(hx + 6, hy + 17); c.lineTo(hx + 14, hy + 17 + open * 2); c.lineTo(hx + 7, hy + 20 + open * 4); c.closePath(); c.fill();
  // The trunk: tapering down from the face, ringed with wrinkles, swinging; the end of it, its nostril
  const t0 = { x: hx + 18, y: hy + 6 }, tc = { x: hx + 40 + sw * 0.4, y: hy + 24 }, t1 = { x: hx + 34 + sw, y: hy + 50 - Math.max(0, -sw) * 2.4 };
  const N = 12, pts: P[] = [];
  for (let i = 0; i <= N; i++) { const t = i / N, m = 1 - t; pts.push({ x: m * m * t0.x + 2 * m * t * tc.x + t * t * t1.x, y: m * m * t0.y + 2 * m * t * tc.y + t * t * t1.y }); }
  const wAt = (i: number) => 15 - (i / N) * 8;
  c.lineCap = 'round';
  for (const [grow, col, off] of [[3, INK, 0], [0, r[3], 0], [-0.62, r[2], 0.22], [-0.82, r[4], -0.3]] as const) {
    for (let i = 0; i < N; i++) {
      const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, w = wAt(i);
      c.strokeStyle = col; c.lineWidth = grow >= 0 ? w + grow : w * (1 + grow);
      c.beginPath(); c.moveTo(a.x - nx * w * off, a.y - ny * w * off); c.lineTo(b.x - nx * w * off, b.y - ny * w * off); c.stroke();
    }
  }
  c.lineCap = 'butt';
  // (the rings)
  c.strokeStyle = r[1]; c.lineWidth = 1;
  for (let i = 1; i < N; i++) {
    const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, w = wAt(i) * 0.42;
    c.beginPath(); c.moveTo(a.x + nx * w, a.y + ny * w); c.quadraticCurveTo(a.x + dx / L * 1.5, a.y + dy / L * 1.5, a.x - nx * w, a.y - ny * w); c.stroke();
  }
  // (its end: the lip of it, the nostril)
  const e = pts[N];
  c.fillStyle = INK; c.beginPath(); c.ellipse(e.x, e.y, 5, 4, 0, 0, TAU); c.fill();
  c.fillStyle = r[2]; c.beginPath(); c.ellipse(e.x, e.y, 3.6, 2.6, 0, 0, TAU); c.fill();
  c.fillStyle = INK; c.fillRect(Math.round(e.x - 1), Math.round(e.y), 3, 2);
  tuskArt(0, 0, false);
  // The eye, lashed, in its wrinkles
  c.fillStyle = INK; c.beginPath(); c.ellipse(hx + 8, hy - 6, 3.4, 2.2, -0.15, 0, TAU); c.fill();
  c.fillStyle = '#6A3A1A'; c.fillRect(hx + 7, hy - 7, 3, 2);
  c.fillStyle = '#F8FAFC'; c.fillRect(hx + 7, hy - 7, 1, 1);
  c.fillStyle = INK; c.fillRect(hx + 4, hy - 10, 9, 2); c.fillRect(hx + 5, hy - 12, 1, 2); c.fillRect(hx + 8, hy - 12, 1, 2); c.fillRect(hx + 11, hy - 11, 1, 2);
  c.strokeStyle = r[1]; c.lineWidth = 1; for (const k of [0, 3]) { c.beginPath(); c.moveTo(hx + 2, hy - 2 + k); c.quadraticCurveTo(hx + 8, hy + 1 + k, hx + 14, hy - 3 + k); c.stroke(); }
  // The ear, flapping over the shoulder: veined inside, its edge torn
  const flap = Math.sin(ph) * 0.18;
  c.save(); c.translate(hx - 12, hy - 14); c.rotate(flap);
  const ear = () => {
    c.moveTo(2, -6);
    c.bezierCurveTo(-16, -30, -46, -22, -46, 4);
    c.bezierCurveTo(-46, 22, -38, 30, -32, 34);
    c.lineTo(-28, 31); c.lineTo(-26, 37);
    c.bezierCurveTo(-18, 46, -6, 40, -2, 28);
    c.bezierCurveTo(2, 18, 4, 6, 2, -6);
    c.closePath();
  };
  part(c, ear, r, -46, -26, 50, 70, () => {
    dEll(c, -20, 8, 16, 22, EAR_IN[2], 0.1);
    dEll(c, -16, 2, 10, 14, EAR_IN[3], 0.1);
    // (the veins, branching back from where it joins)
    c.strokeStyle = EAR_IN[0]; c.lineWidth = 1;
    for (const [x1, y1, x2, y2] of [[-30, -8, -38, -14], [-34, 8, -42, 6], [-28, 22, -34, 28], [-14, 28, -12, 36]] as const) {
      c.beginPath(); c.moveTo(-4, 4); c.quadraticCurveTo((x1 - 4) / 2, (y1 + 4) / 2 + 3, x1, y1); c.lineTo(x2, y2); c.stroke();
    }
    // (the rim folded over, lit)
    c.strokeStyle = r[4]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-2, -12); c.bezierCurveTo(-18, -26, -42, -18, -43, 4); c.stroke();
  });
  c.restore();
};

/** One frame of one beast, its feet at the origin, facing right. */
const paintBeast = (c: Ctx, kind: Beast, fr: number, bloody = false) => {
  if (kind === 'rhino') paintRhino(c, fr, bloody ? 'bloody' : 'live');
  else if (kind === 'hippo') paintHippo(c, fr);
  else paintElephant(c, fr);
};
/** A frame of a beast, stamped (its box round it, the feet at the origin). */
const stampBeast = (c: Ctx, kind: Beast, fr: number, bloody = false) => {
  const b = BEASTS[kind];
  stamp(c, `beast2:${kind}:${fr}${bloody ? ':gore' : ''}`, -b.w / 2 - 50, -b.h - 56, b.w + 130, b.h + 62, g => paintBeast(g, kind, fr, bloody));
};

/** The warnings, at the edge each's coming from. */
export const drawWarnings = (c: Ctx, state: GameState, herd: Animal[]) => {
  const f = state.frame;
  for (const a of herd) {
    if (a.done || a.warn <= 0 || a.warn > WARN) continue;
    const k = 1 - a.warn / WARN;
    const ex = a.dir > 0 ? VIEW_L + 8 : VIEW_R - 8;
    // dust, boiling up at the edge (stepped puffs)
    for (let i = 0; i < 7; i++) {
      const rr = 10 + k * 16 + ((i * 7 + f) % 9), px = ex + a.dir * (i * 9 - 6), py = GY - 10 - ((i * 23 + f * 2) % (30 + k * 60));
      pixelBlob(c, px + 3, py + 3, rr, rr * 0.8, '#78644A');
      pixelBlob(c, px, py, rr * 0.9, rr * 0.72, i % 2 ? '#A88C64' : '#B89C74');
      pixelBlob(c, px - rr * 0.25, py - rr * 0.25, rr * 0.4, rr * 0.3, '#D8C4A0');
    }
    // the arrow, flashing, with which one's coming on it (in miniature)
    if (Math.floor(f / 6) % 2 === 0) {
      const ax = ex + a.dir * 46, ay = GY - 150;
      c.fillStyle = INK; c.beginPath(); c.moveTo(ax + a.dir * 30, ay); c.lineTo(ax - a.dir * 8, ay - 26); c.lineTo(ax - a.dir * 8, ay + 26); c.closePath(); c.fill();
      c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(ax + a.dir * 26, ay); c.lineTo(ax - a.dir * 6, ay - 22); c.lineTo(ax - a.dir * 6, ay + 22); c.closePath(); c.fill();
      c.fillStyle = '#FEF9C3'; c.beginPath(); c.moveTo(ax - a.dir * 6, ay - 22); c.lineTo(ax + a.dir * 10, ay - 10); c.lineTo(ax - a.dir * 6, ay - 14); c.closePath(); c.fill();
      c.save(); c.translate(Math.round(ax + a.dir * 40), Math.round(ay + 6)); c.scale(a.dir * 0.42, 0.42);
      const b = BEASTS[a.kind];
      c.translate(-Math.round(b.w * 0.15), 0);
      stampBeast(c, a.kind, 0);
      c.restore();
    }
  }
};

export const drawStampede = (c: Ctx, state: GameState, herd: Animal[]) => {
  for (const a of herd) if (!a.done && a.warn <= 0) drawBeast(c, a);
};

/** One of them, its left edge at a.x, its feet on the ground, facing the way it's going (a frame of its gait). */
const drawBeast = (c: Ctx, a: Animal) => drawBeastAt(c, a.kind, a.x + BEASTS[a.kind].w / 2, a.dir, gallopFrame(a.t, BEASTS[a.kind].speed));

/** One of them, its feet's middle at (cx, GY), facing `dir`, in frame `fr` of its gait (bloody: the rhino carrying
 *  Artie, his blood down its horn). */
export const drawBeastAt = (c: Ctx, kind: Beast, cx: number, dir: 1 | -1, fr: number, bloody = false) => {
  const b = BEASTS[kind];
  c.save();
  c.translate(Math.round(cx), GY);
  c.scale(dir, 1);
  // (its shadow on the ground: banded, darker under the middle)
  c.fillStyle = 'rgba(26, 11, 6, 0.22)'; c.fillRect(Math.round(-b.w * 0.55), -3, Math.round(b.w * 1.15), 4);
  c.fillStyle = 'rgba(26, 11, 6, 0.2)'; c.fillRect(Math.round(-b.w * 0.4), -2, Math.round(b.w * 0.85), 3);
  stampBeast(c, kind, fr, bloody);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The rhino that gored Artie, after the wall (his standard death, fight.ts): crumpled up against it. Its head's been
// driven into the stone nose-down, the neck kinked under it, the horn level into the wall (through Artie); the body's
// buckled up behind it, the rear end up in the air: one back leg stuck straight up, dead-bug stiff, the other splayed
// out behind; the front legs folded under it, one with its foot turned sole-up. An X for an eye, the tongue out, the
// brow split on the stone, the little horn snapped off, blood out of everything.

/** Where its head's middle is (the foot of the wall at the origin, the rhino all off to the left of it), how far its
 *  head's turned down; so its horn's tip is at DEAD_HORN, in the wall. */
const DEAD_HEAD = { x: -43, y: -59, rot: 0.9 };
/** The horn, in that same space: its base (where it leaves the snout) and its tip (in the wall). */
export const DEAD_HORN = (() => {
  const cs = Math.cos(DEAD_HEAD.rot), sn = Math.sin(DEAD_HEAD.rot);
  const at = (x: number, y: number) => ({ x: DEAD_HEAD.x + x * cs - y * sn, y: DEAD_HEAD.y + x * sn + y * cs });
  const b = at(19, 0), t = at(31.5, -24.5);
  return { bx: b.x, by: b.y, tx: t.x, ty: t.y };
})();

/** A dead leg by its joints (hip, knee, foot), the foot square to the shin (sole up: turned over). */
const deadLeg = (c: Ctx, j: number[], th: number, r: string[], far: boolean, soleUp = false) => {
  const [hx, hy, kx, ky, fx, fy] = j;
  const rot = Math.atan2(fy - ky, fx - kx) - Math.PI / 2;
  legArt(c, 'rhino', { x: hx, y: hy }, { x: kx, y: ky }, { x: fx, y: fy }, th + 6, th + 1, th, r, far, rot, soleUp);
};

/**
 * The rhino after the wall, the foot of the wall at the origin, facing right (all of it to the left). `k` 0..1: how far
 * it's buckled (the rear end coming up and over in the moment after it hits); `fr` the frame (a back leg twitching).
 * Stamped once it's settled (the twitch in a few steps).
 */
export const drawDeadRhino = (c: Ctx, k: number, fr: number) => {
  const kk = Math.round(Math.min(1, Math.max(0, k)) * 10) / 10;
  // (a back leg kicking, now and then, long after)
  const tw = fr % 97 < 8 ? Math.round(Math.sin(fr * 1.9) * 2) * 2 : 0;
  // (its shadow, the length of it)
  c.fillStyle = 'rgba(26, 11, 6, 0.32)'; c.fillRect(-150, -3, 150, 4);
  stamp(c, `deadrhino2:${kk}:${tw}`, -200, -150, 230, 158, g => paintDeadRhino(g, kk, tw));
};

const paintDeadRhino = (c: Ctx, k: number, tw: number) => {
  const r = RAMPS.rhino;
  const e = 1 - (1 - k) ** 3;
  // (the body: level when it hits, buckling up rear-first behind its head)
  const bx = -92 + (1 - e) * 6, by = -40 - e * 6, rot = 0.35 * e;
  const cs = Math.cos(rot), sn = Math.sin(rot);
  const on = (x: number, y: number): [number, number] => [bx + x * cs - y * sn, by + x * sn + y * cs];
  // Far legs first: the back one stuck up in the air, stiff; the front one folded under
  const [h1x, h1y] = on(-30, -6), [h2x, h2y] = on(36, 8);
  deadLeg(c, [h1x, h1y, h1x - 12 - e * 4, h1y - 18 * e - 4 + tw * 0.4, h1x - 16 - e * 6 + tw, h1y - 40 * e - 6], 9, r, true);
  deadLeg(c, [h2x, h2y, h2x + 8, -8, h2x - 10, -4], 9, r, true);
  // (the tail, limp, hanging off the rear)
  const [tx, ty] = on(-46, -6);
  tail(c, r, tx, ty, tx - 6, ty + 6, tx - 4, ty + 16, 2.5, 4);
  // The body, its plates, the folds bunched up hard behind the neck where it buckled
  c.save(); c.translate(bx, by); c.rotate(rot); rhinoBody(c, r, e); c.restore();
  // Near legs: the back one splayed out behind, the front one buckled out forward, its foot turned sole up
  const [h3x, h3y] = on(-22, 8), [h4x, h4y] = on(30, 10);
  deadLeg(c, [h3x, h3y, h3x - 22, h3y + 4, h3x - 38 - e * 6, h3y + 24], 10, r, false);
  deadLeg(c, [h4x, h4y, h4x + 16, -8, h4x + 30, -12], 10, r, false, true);
  // The neck, kinked: folded skin from the shoulder down into the head, dark creases in it
  const [nx, ny] = on(40, -4);
  const mx = (nx + DEAD_HEAD.x) / 2 - 2, my = (ny + DEAD_HEAD.y) / 2 + 4;
  part(c, () => c.ellipse(mx, my, 15, 13, 0.6, 0, TAU), r, mx - 15, my - 13, 30, 26, () => {
    for (let i = 0; i < 3; i++) fold(c, r, nx - 6 + i * 4, ny - 10 - i * 3, nx + 2 + i * 4, ny - 2 - i * 4, nx + i * 4, ny + 6 - i * 3, 2);
  });
  // The head, driven nose-down into the wall
  c.save(); c.translate(DEAD_HEAD.x, DEAD_HEAD.y); c.rotate(DEAD_HEAD.rot);
  rhinoHead(c, r, 0, 'dead');
  c.restore();
};
