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
// themselves (each in its ramp, inked, a six-frame gallop with weight: the body drops onto each footfall and stretches
// off it, the head nods, ears and trunk swing; each frame painted once).

const INK = '#1A0B06';
/** Each beast's skin, darkest first, and its extras. */
const RAMPS: Record<Beast, string[]> = {
  rhino: ['#2A2622', '#463F38', '#665D53', '#887D70', '#AA9F90', '#CCC2B2'],
  hippo: ['#33263A', '#523F5C', '#74607E', '#957F9F', '#B6A0BE', '#D6C4DC'],
  elephant: ['#30343C', '#4C525C', '#6C737E', '#8D95A0', '#AEB5BF', '#D0D5DC'],
};
const IVORY = ['#8A7A58', '#C2B28A', '#E8DDBE', '#FFF8E6'];
const FRAMES = 6;

/** An inked, shaded ellipse (a body, a head): ink round it, shadow, the body up-left of it, a lit crown, a glint. */
const mass = (c: Ctx, x: number, y: number, rx: number, ry: number, r: string[], rot = 0) => {
  const e = (dx: number, dy: number, sx: number, sy: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x + dx, y + dy, Math.max(1, sx), Math.max(1, sy), rot, 0, Math.PI * 2); c.fill(); };
  e(0, 0, rx + 2, ry + 2, INK);
  e(0, 0, rx, ry, r[1]);
  e(-rx * 0.06, -ry * 0.1, rx * 0.9, ry * 0.8, r[2]);
  e(-rx * 0.14, -ry * 0.3, rx * 0.7, ry * 0.5, r[3]);
  e(-rx * 0.22, -ry * 0.5, rx * 0.4, ry * 0.22, r[4]);
  c.fillStyle = r[5]; c.fillRect(Math.round(x - rx * 0.36), Math.round(y - ry * 0.7), Math.max(2, Math.round(rx * 0.14)), 2);
};
/** A leg, from the hip: thigh and shin (the knee bending as it comes forward), a foot; lit down its front. */
const leg = (c: Ctx, hx: number, hy: number, len: number, th: number, ph: number, r: string[], far: boolean) => {
  const swing = Math.sin(ph) * 0.32, lift = Math.max(0, Math.cos(ph)) * 0.6;
  const kx = hx + Math.sin(swing) * len * 0.5, ky = hy + Math.cos(swing) * len * 0.5;
  const sa = swing - lift;
  const fx = kx + Math.sin(sa) * len * 0.5, fy = Math.min(0, ky + Math.cos(sa) * len * 0.5);
  const col = far ? r[1] : r[2], lit = far ? r[2] : r[3];
  for (const [w, cl] of [[th + 3, INK], [th, col]] as const) { c.strokeStyle = cl; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(fx, fy - th * 0.3); c.stroke(); }
  c.strokeStyle = lit; c.lineWidth = Math.max(2, th * 0.3); c.beginPath(); c.moveTo(hx + th * 0.25, hy); c.lineTo(kx + th * 0.25, ky); c.lineTo(fx + th * 0.25, fy - th * 0.4); c.stroke();
  c.lineCap = 'butt';
  // (the foot: a pad, toenails)
  c.fillStyle = INK; c.fillRect(Math.round(fx - th / 2 - 1), Math.round(fy - 5), Math.round(th + 2), 6);
  c.fillStyle = r[0]; c.fillRect(Math.round(fx - th / 2), Math.round(fy - 4), Math.round(th), 4);
  c.fillStyle = IVORY[2]; for (let k = 0; k < 3; k++) c.fillRect(Math.round(fx - th / 2 + 1 + k * (th / 3)), Math.round(fy - 3), 2, 2);
};

/** One frame of one beast, its feet at the origin, facing right. */
const paintBeast = (c: Ctx, kind: Beast, fr: number) => {
  const r = RAMPS[kind];
  const ph = (fr / FRAMES) * Math.PI * 2;
  // (the gallop's weight: down onto the footfall, up and stretched off it)
  const bob = Math.round(Math.abs(Math.sin(ph)) * 4) - 2, sq = 1 + Math.sin(ph * 2) * 0.04;
  if (kind === 'rhino') {
    const by = -32 + bob;
    leg(c, -26, by + 6, 30, 9, ph + Math.PI, r, true); leg(c, 24, by + 6, 30, 9, ph, r, true);
    // (the tail, the body, its armor folds)
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-44, by - 8); c.quadraticCurveTo(-54, by - 4 + bob, -52, by + 8); c.stroke();
    mass(c, -4, by, 44 * sq, 20 / sq, r);
    for (const fx2 of [-18, 16]) { c.strokeStyle = r[1]; c.lineWidth = 2; c.beginPath(); c.arc(fx2, by, 18, -1.2, 1.2); c.stroke(); c.strokeStyle = r[4]; c.lineWidth = 1; c.beginPath(); c.arc(fx2 + 2, by, 18, -1.1, 0.4); c.stroke(); }
    leg(c, -20, by + 8, 30, 10, ph, r, false); leg(c, 30, by + 8, 30, 10, ph + Math.PI, r, false);
    // (the head, down and charging, nodding with the gait; the horns; an ear back; the eye, mean)
    const hy = by + 4 + Math.round(Math.sin(ph) * 2);
    mass(c, 46, hy, 20, 13, r, 0.25);
    mass(c, 62, hy + 6, 10, 8, r, 0.1);
    c.fillStyle = INK; c.beginPath(); c.moveTo(60, hy - 2); c.lineTo(78, hy - 26); c.lineTo(70, hy + 2); c.fill();
    c.fillStyle = IVORY[1]; c.beginPath(); c.moveTo(62, hy - 2); c.lineTo(77, hy - 23); c.lineTo(69, hy); c.fill();
    c.fillStyle = IVORY[3]; c.beginPath(); c.moveTo(64, hy - 4); c.lineTo(75, hy - 21); c.lineTo(66, hy - 3); c.fill();
    c.fillStyle = INK; c.beginPath(); c.moveTo(50, hy - 8); c.lineTo(57, hy - 20); c.lineTo(58, hy - 6); c.fill();
    c.fillStyle = IVORY[2]; c.beginPath(); c.moveTo(52, hy - 8); c.lineTo(56, hy - 17); c.lineTo(56, hy - 7); c.fill();
    c.fillStyle = INK; c.beginPath(); c.ellipse(36, hy - 12, 4, 8, -0.6 + Math.sin(ph) * 0.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = r[3]; c.beginPath(); c.ellipse(36, hy - 12, 2.5, 6, -0.6 + Math.sin(ph) * 0.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = INK; c.fillRect(48, hy - 3, 4, 3); c.fillStyle = '#F8FAFC'; c.fillRect(49, hy - 3, 1, 1);
    c.fillStyle = INK; c.fillRect(46, hy - 6, 7, 2);
    c.fillStyle = INK; c.fillRect(68, hy + 8, 3, 2);
  } else if (kind === 'hippo') {
    const by = -40 + bob;
    leg(c, -36, by + 14, 22, 14, ph + Math.PI, r, true); leg(c, 30, by + 14, 22, 14, ph, r, true);
    mass(c, -6, by, 58 * sq, 28 / sq, r);
    // (the pink belly)
    c.fillStyle = '#C48A9A'; c.beginPath(); c.ellipse(-4, by + 20, 40, 6, 0, 0, Math.PI); c.fill();
    leg(c, -30, by + 16, 22, 15, ph, r, false); leg(c, 38, by + 16, 22, 15, ph + Math.PI, r, false);
    // (the head: jaws wide open (wider on the footfall), the teeth, the tusks; nostrils, an ear, the eye up on top)
    const gape = 0.35 + Math.abs(Math.sin(ph)) * 0.25, hx = 54, hy = by - 6;
    c.save(); c.translate(hx, hy + 6); c.rotate(gape * 0.6);
    mass(c, 14, 6, 20, 8, r);
    c.fillStyle = '#7F1D1D'; c.fillRect(0, -2, 30, 6); c.fillStyle = '#E78AA0'; c.fillRect(2, 0, 26, 3);
    c.fillStyle = IVORY[2]; c.fillRect(24, -10, 4, 10); c.fillRect(8, -6, 3, 6); c.fillStyle = IVORY[3]; c.fillRect(24, -10, 1, 8);
    c.restore();
    c.save(); c.translate(hx, hy + 6); c.rotate(-gape * 0.7);
    c.fillStyle = '#7F1D1D'; c.fillRect(0, -6, 32, 6); c.fillStyle = '#E78AA0'; c.fillRect(2, -5, 28, 3);
    mass(c, 14, -12, 22, 11, r);
    c.fillStyle = IVORY[2]; c.fillRect(26, -4, 4, 9); c.fillRect(10, -4, 3, 6); c.fillStyle = IVORY[3]; c.fillRect(26, -4, 1, 7);
    c.fillStyle = INK; c.fillRect(30, -20, 3, 3); c.fillRect(25, -21, 3, 3);
    c.restore();
    mass(c, hx - 6, hy - 6, 16, 14, r);
    mass(c, hx - 2, hy - 20, 6, 5, r);
    c.fillStyle = INK; c.fillRect(hx - 2, hy - 22, 4, 4); c.fillStyle = '#F8FAFC'; c.fillRect(hx - 1, hy - 22, 1, 1);
    c.fillStyle = INK; c.beginPath(); c.ellipse(hx - 14, hy - 18, 3, 5, -0.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = r[3]; c.beginPath(); c.ellipse(hx - 14, hy - 18, 1.6, 3.5, -0.4, 0, Math.PI * 2); c.fill();
    // (the stubby tail, flicking)
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-62, by - 4); c.lineTo(-70, by + 2 + Math.sin(ph * 2) * 4); c.stroke();
  } else {
    const by = -74 + bob;
    leg(c, -48, by + 18, 54, 24, ph + Math.PI, r, true); leg(c, 30, by + 18, 54, 24, ph, r, true);
    // (the tail, swinging; the body, the wrinkles over the knees)
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-82, by - 14); c.quadraticCurveTo(-92, by + Math.sin(ph) * 8, -88, by + 22); c.stroke();
    mass(c, -10, by, 74 * sq, 38 / sq, r);
    c.strokeStyle = r[1]; c.lineWidth = 1;
    for (const wx of [-50, -40, 26, 36]) { c.beginPath(); c.moveTo(wx, by + 14); c.quadraticCurveTo(wx + 4, by + 20, wx, by + 28); c.stroke(); }
    leg(c, -40, by + 22, 54, 27, ph, r, false); leg(c, 40, by + 22, 54, 27, ph + Math.PI, r, false);
    // (the head, the trunk up and trumpeting on the stride, swinging down off it; the tusks; the ear, flapping, over it)
    const hx = 62, hy = by - 4 + Math.round(Math.sin(ph) * 2);
    mass(c, hx, hy, 26, 26, r);
    const sw = Math.sin(ph) * 14;
    const trunk = (wd: number, col: string) => { c.strokeStyle = col; c.lineWidth = wd; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx + 18, hy + 6); c.quadraticCurveTo(hx + 40 + sw * 0.4, hy + 24, hx + 34 + sw, hy + 50 - Math.max(0, -sw) * 2.4); c.stroke(); c.lineCap = 'butt'; };
    trunk(15, INK); trunk(11, r[2]); trunk(4, r[3]);
    for (let k = 0; k < 5; k++) { const t = 0.3 + k * 0.14; c.fillStyle = r[1]; c.fillRect(Math.round(hx + 18 + (20 + sw * 0.5) * t * 1.4), Math.round(hy + 8 + 40 * t), 6, 1); }
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx + 14, hy + 14); c.quadraticCurveTo(hx + 34, hy + 26, hx + 44, hy + 16); c.lineTo(hx + 42, hy + 12); c.quadraticCurveTo(hx + 32, hy + 20, hx + 16, hy + 10); c.fill();
    c.fillStyle = IVORY[2]; c.beginPath(); c.moveTo(hx + 16, hy + 13); c.quadraticCurveTo(hx + 33, hy + 24, hx + 42, hy + 15); c.lineTo(hx + 42, hy + 13); c.quadraticCurveTo(hx + 32, hy + 21, hx + 17, hy + 11); c.fill();
    const flap = Math.sin(ph) * 0.18;
    c.save(); c.translate(hx - 12, hy - 8); c.rotate(flap);
    mass(c, -8, 12, 24, 32, r, 0.1);
    c.fillStyle = '#C49AA8'; c.beginPath(); c.ellipse(-6, 14, 13, 22, 0.1, 0, Math.PI * 2); c.fill();
    c.restore();
    c.fillStyle = INK; c.fillRect(hx + 6, hy - 8, 5, 4); c.fillStyle = '#F8FAFC'; c.fillRect(hx + 7, hy - 8, 1, 1);
    c.fillStyle = INK; c.fillRect(hx + 3, hy - 12, 9, 2);
  }
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
    // the arrow, flashing, with which one's coming on it (its head, in miniature)
    if (Math.floor(f / 6) % 2 === 0) {
      const ax = ex + a.dir * 46, ay = GY - 150;
      c.fillStyle = INK; c.beginPath(); c.moveTo(ax + a.dir * 30, ay); c.lineTo(ax - a.dir * 8, ay - 26); c.lineTo(ax - a.dir * 8, ay + 26); c.closePath(); c.fill();
      c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(ax + a.dir * 26, ay); c.lineTo(ax - a.dir * 6, ay - 22); c.lineTo(ax - a.dir * 6, ay + 22); c.closePath(); c.fill();
      c.fillStyle = '#FEF9C3'; c.beginPath(); c.moveTo(ax - a.dir * 6, ay - 22); c.lineTo(ax + a.dir * 10, ay - 10); c.lineTo(ax - a.dir * 6, ay - 14); c.closePath(); c.fill();
      c.save(); c.translate(ax + a.dir * 40, ay + 6); c.scale(a.dir * 0.42, 0.42);
      const b = BEASTS[a.kind];
      c.translate(-b.w * 0.15, 0);
      paintBeast(c, a.kind, 0);
      c.restore();
    }
  }
};

export const drawStampede = (c: Ctx, state: GameState, herd: Animal[]) => {
  for (const a of herd) if (!a.done && a.warn <= 0) drawBeast(c, a);
};

/** One of them, its left edge at a.x, its feet on the ground, facing the way it's going (a frame of its gallop). */
const drawBeast = (c: Ctx, a: Animal) => {
  const b = BEASTS[a.kind];
  const fr = Math.floor((a.t * b.speed * 0.09) / (Math.PI * 2) * FRAMES) % FRAMES;
  c.save();
  c.translate(Math.round(a.x + b.w / 2), GY);
  c.scale(a.dir, 1);
  // (its shadow on the ground)
  c.fillStyle = 'rgba(26, 11, 6, 0.3)'; c.fillRect(Math.round(-b.w * 0.5), -3, Math.round(b.w * 1.05), 4);
  stamp(c, `beast:${a.kind}:${fr}`, -b.w / 2 - 50, -b.h - 50, b.w + 120, b.h + 56, g => paintBeast(g, a.kind, fr));
  c.restore();
};
