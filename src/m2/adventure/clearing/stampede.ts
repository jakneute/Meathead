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
import { trample } from '../../weapons/spawner';
import { box, label } from '../section';
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
// Drawing (crude: boxes, a few shapes)

/** The warnings, at the edge each's coming from. */
export const drawWarnings = (c: Ctx, state: GameState, herd: Animal[]) => {
  const f = state.frame;
  for (const a of herd) {
    if (a.done || a.warn <= 0 || a.warn > WARN) continue;
    const k = 1 - a.warn / WARN;
    const ex = a.dir > 0 ? VIEW_L + 8 : VIEW_R - 8;
    // dust, boiling up at the edge
    for (let i = 0; i < 7; i++) {
      const r = 10 + k * 16 + ((i * 7 + f) % 9);
      c.fillStyle = i % 2 ? 'rgba(168, 140, 100, 0.55)' : 'rgba(120, 100, 70, 0.45)';
      c.beginPath(); c.arc(ex + a.dir * (i * 9 - 6), GY - 10 - ((i * 23 + f * 2) % (30 + k * 60)), r, 0, Math.PI * 2); c.fill();
    }
    // the arrow, flashing
    if (Math.floor(f / 6) % 2 === 0) {
      const ax = ex + a.dir * 46, ay = GY - 150;
      c.fillStyle = '#FDE047'; c.strokeStyle = '#000'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(ax + a.dir * 26, ay); c.lineTo(ax - a.dir * 6, ay - 22); c.lineTo(ax - a.dir * 6, ay + 22); c.closePath(); c.fill(); c.stroke();
      label(c, `${a.kind.toUpperCase()}!`, ax + a.dir * 34, ay - 30, '#FDE047', 9);
    }
  }
};

export const drawStampede = (c: Ctx, state: GameState, herd: Animal[]) => {
  for (const a of herd) if (!a.done && a.warn <= 0) drawBeast(c, a, state.frame);
};

/** One of them, its left edge at a.x, its feet on the ground, facing the way it's going. */
const drawBeast = (c: Ctx, a: Animal, f: number) => {
  const b = BEASTS[a.kind];
  const { w, h, col } = b;
  c.save();
  c.translate(Math.round(a.x + w / 2), GY);
  c.scale(a.dir, 1);
  const L = -w / 2, step = Math.sin(a.t * b.speed * 0.09);
  const dark = shade(col, -0.25);
  // legs: front pair and back pair, going
  const legW = a.kind === 'elephant' ? 24 : a.kind === 'hippo' ? 18 : 14, legH = a.kind === 'elephant' ? 44 : a.kind === 'hippo' ? 22 : 22;
  for (const [lx, ph] of [[L + w * 0.18, 0], [L + w * 0.7, Math.PI]] as const) {
    for (const s of [0, 1]) {
      const sw = Math.sin(a.t * b.speed * 0.09 + ph + s * Math.PI) * (legW * 0.4);
      box(c, lx + sw + s * 6, -legH, legW, legH, s ? dark : col);
      box(c, lx + sw + s * 6, -4, legW, 4, '#292524');
    }
  }
  // the body, bobbing
  const bob = Math.abs(step) * 2;
  const top = -h + bob;
  c.fillStyle = '#1C1917'; c.beginPath(); c.roundRect(L - 1, top - 1, w + 2, h - legH + 8, 18); c.fill();
  c.fillStyle = col; c.beginPath(); c.roundRect(L, top, w, h - legH + 6, 18); c.fill();
  c.fillStyle = dark; c.fillRect(L + 8, top + (h - legH) * 0.7, w - 16, 6);
  // a tail behind
  box(c, L - 6, top + 14, 8, 3, dark);
  // the head, out front
  if (a.kind === 'rhino') {
    box(c, w / 2 - 6, top + 12, 28, 22, col); box(c, w / 2 - 6, top + 30, 28, 4, dark);
    // the horns
    c.fillStyle = '#E7E5E4'; c.strokeStyle = '#1C1917'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(w / 2 + 16, top + 14); c.lineTo(w / 2 + 30, top - 6); c.lineTo(w / 2 + 22, top + 16); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(w / 2 + 6, top + 12); c.lineTo(w / 2 + 12, top + 2); c.lineTo(w / 2 + 12, top + 13); c.closePath(); c.fill(); c.stroke();
    box(c, w / 2 - 4, top + 6, 5, 7, dark); box(c, w / 2 + 6, top + 16, 3, 3, '#000');
  } else if (a.kind === 'hippo') {
    // the mouth, wide open: the teeth
    const gape = 8 + Math.abs(step) * 6;
    box(c, w / 2 - 10, top + 6, 34, 18, col); box(c, w / 2 - 10, top + 24 + gape, 34, 14, col);
    box(c, w / 2 - 6, top + 24, 28, gape, '#7F1D1D'); box(c, w / 2 - 4, top + 24 + gape - 4, 22, 4, '#F9A8D4');
    for (const tx of [w / 2 + 2, w / 2 + 16]) { box(c, tx, top + 24, 4, 7, '#FAFAF9'); box(c, tx, top + 24 + gape - 6, 4, 6, '#FAFAF9'); }
    box(c, w / 2 - 6, top + 2, 6, 6, dark); box(c, w / 2 + 6, top + 9, 3, 3, '#000');
  } else {
    // the elephant: the ear flapping, the trunk swinging, the tusks
    box(c, w / 2 - 22, top + 8, 34, 40, col);
    const flap = Math.sin(a.t * 0.2) * 6;
    c.fillStyle = dark; c.beginPath(); c.ellipse(w / 2 - 22, top + 30, 16 + flap * 0.5, 26, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = shade(col, -0.1); c.beginPath(); c.ellipse(w / 2 - 22, top + 30, 12 + flap * 0.5, 21, 0, 0, Math.PI * 2); c.fill();
    const sw = Math.sin(a.t * 0.18) * 10;
    c.strokeStyle = '#1C1917'; c.lineWidth = 12; c.lineCap = 'round';
    c.beginPath(); c.moveTo(w / 2 + 6, top + 36); c.quadraticCurveTo(w / 2 + 22 + sw, top + 60, w / 2 + 14 + sw, top + 82); c.stroke();
    c.strokeStyle = col; c.lineWidth = 9;
    c.beginPath(); c.moveTo(w / 2 + 6, top + 36); c.quadraticCurveTo(w / 2 + 22 + sw, top + 60, w / 2 + 14 + sw, top + 82); c.stroke();
    c.lineCap = 'butt';
    c.strokeStyle = '#FAFAF9'; c.lineWidth = 4; c.beginPath(); c.moveTo(w / 2 + 4, top + 44); c.quadraticCurveTo(w / 2 + 20, top + 54, w / 2 + 26, top + 46); c.stroke();
    box(c, w / 2 + 2, top + 20, 3, 3, '#000');
  }
  c.restore();
};

/** A color lighter (k > 0) or darker (k < 0). */
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))));
  const r = ch(n >> 16), g = ch((n >> 8) & 255), bl = ch(n & 255);
  return `rgb(${r}, ${g}, ${bl})`;
};
