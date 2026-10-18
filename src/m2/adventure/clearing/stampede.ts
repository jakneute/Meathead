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

/** The rhino's head's height (its middle) in a frame of its gallop (the body's bob, the nod). */
const rhinoHeadY = (fr: number) => {
  const ph = (fr / FRAMES) * Math.PI * 2;
  return -32 + Math.round(Math.abs(Math.sin(ph)) * 4) - 2 + 4 + Math.round(Math.sin(ph) * 2);
};
/** The rhino's head, its middle at (46, hy) (facing right): the head, the snout, the horn, the little horn, the ear, the
 *  eye. Dead: the eye an X, the tongue lolled out under the snout, blood out of the nostril and down the horn. */
const rhinoHead = (c: Ctx, r: string[], hy: number, ph: number, dead: boolean) => {
  mass(c, 46, hy, 20, 13, r, 0.25);
  mass(c, 62, hy + 6, 10, 8, r, 0.1);
  if (dead) {
    // (the tongue, out of the side of its mouth and hanging: pink, a shade down its middle)
    c.fillStyle = INK; c.beginPath(); c.ellipse(60, hy + 16, 4.4, 7.4, 0.35, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#C0566A'; c.beginPath(); c.ellipse(60, hy + 16, 3, 6, 0.35, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#E58A9A'; c.fillRect(58, hy + 11, 2, 7);
  }
  c.fillStyle = INK; c.beginPath(); c.moveTo(60, hy - 2); c.lineTo(78, hy - 26); c.lineTo(70, hy + 2); c.fill();
  c.fillStyle = IVORY[1]; c.beginPath(); c.moveTo(62, hy - 2); c.lineTo(77, hy - 23); c.lineTo(69, hy); c.fill();
  c.fillStyle = IVORY[3]; c.beginPath(); c.moveTo(64, hy - 4); c.lineTo(75, hy - 21); c.lineTo(66, hy - 3); c.fill();
  if (dead) {
    // (the horn bloodied from the tip down, stepped: fresh at the tip, dark further down, a run down its front)
    c.fillStyle = '#7F1D1D'; c.beginPath(); c.moveTo(66, hy - 9); c.lineTo(78, hy - 26); c.lineTo(73, hy - 7); c.fill();
    c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(69, hy - 14); c.lineTo(78, hy - 26); c.lineTo(74, hy - 12); c.fill();
    c.fillStyle = '#B91C1C'; c.fillRect(70, hy - 8, 1, 9);
  }
  c.fillStyle = INK; c.beginPath(); c.moveTo(50, hy - 8); c.lineTo(57, hy - 20); c.lineTo(58, hy - 6); c.fill();
  c.fillStyle = IVORY[2]; c.beginPath(); c.moveTo(52, hy - 8); c.lineTo(56, hy - 17); c.lineTo(56, hy - 7); c.fill();
  const ear = dead ? 0.5 : -0.6 + Math.sin(ph) * 0.2;
  c.fillStyle = INK; c.beginPath(); c.ellipse(36, hy - 12, 4, 8, ear, 0, Math.PI * 2); c.fill();
  c.fillStyle = r[3]; c.beginPath(); c.ellipse(36, hy - 12, 2.5, 6, ear, 0, Math.PI * 2); c.fill();
  if (dead) {
    // (the eye: an X, the lid gone slack over it; a crease of skin bunched up over the brow where it hit)
    c.fillStyle = INK; for (let i = -2; i <= 2; i++) { c.fillRect(50 + i, hy - 2 + i, 2, 2); c.fillRect(50 + i, hy - 2 - i, 2, 2); }
    c.strokeStyle = r[0]; c.lineWidth = 1.5; for (const k of [0, 4]) { c.beginPath(); c.moveTo(40 + k, hy - 10 + k * 0.4); c.quadraticCurveTo(46 + k, hy - 13, 52 + k, hy - 9 - k * 0.3); c.stroke(); }
    c.strokeStyle = r[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(41, hy - 11); c.quadraticCurveTo(46, hy - 14, 52, hy - 10.5); c.stroke();
    // (blood out of the nostril, running)
    c.fillStyle = '#7F1D1D'; c.fillRect(67, hy + 8, 4, 3); c.fillStyle = '#B91C1C'; c.fillRect(68, hy + 9, 2, 9); c.fillRect(67, hy + 17, 4, 3);
  } else {
    c.fillStyle = INK; c.fillRect(48, hy - 3, 4, 3); c.fillStyle = '#F8FAFC'; c.fillRect(49, hy - 3, 1, 1);
    c.fillStyle = INK; c.fillRect(46, hy - 6, 7, 2);
    c.fillStyle = INK; c.fillRect(68, hy + 8, 3, 2);
  }
};

/** A frame of the rhino's gallop t frames into its run at `speed` (as drawBeast picks them). */
export const gallopFrame = (t: number, speed: number) => Math.floor((t * speed * 0.09) / (Math.PI * 2) * FRAMES) % FRAMES;
/** The rhino's horn in a frame of its gallop (feet at the origin, facing right): its base (the middle of where it comes
 *  out of the snout) and its tip. */
export const rhinoHorn = (fr: number) => { const hy = rhinoHeadY(fr); return { bx: 65, by: hy, tx: 77.5, ty: hy - 24.5 }; };

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
    rhinoHead(c, r, rhinoHeadY(fr), ph, false);
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
const drawBeast = (c: Ctx, a: Animal) => drawBeastAt(c, a.kind, a.x + BEASTS[a.kind].w / 2, a.dir, gallopFrame(a.t, BEASTS[a.kind].speed));

/** One of them, its feet's middle at (cx, GY), facing `dir`, in frame `fr` of its gallop. */
export const drawBeastAt = (c: Ctx, kind: Beast, cx: number, dir: 1 | -1, fr: number) => {
  const b = BEASTS[kind];
  c.save();
  c.translate(Math.round(cx), GY);
  c.scale(dir, 1);
  // (its shadow on the ground)
  c.fillStyle = 'rgba(26, 11, 6, 0.3)'; c.fillRect(Math.round(-b.w * 0.5), -3, Math.round(b.w * 1.05), 4);
  stamp(c, `beast:${kind}:${fr}`, -b.w / 2 - 50, -b.h - 50, b.w + 120, b.h + 56, g => paintBeast(g, kind, fr));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The rhino that gored Artie, after the wall (his standard death, fight.ts): crumpled up against it. Its head's been
// driven into the stone nose-down, the neck kinked under it, the horn level into the wall (through Artie); the body's
// buckled up behind it, the rear end up in the air: one back leg stuck straight up, dead-bug stiff, the other splayed
// out behind; the front legs folded under it, one with its foot turned sole-up. An X for an eye, the tongue out.

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

/** A limb by its joints (hip, knee, foot), inked, shaded, lit down its front; a pad on the end (sole up: turned over). */
const deadLeg = (c: Ctx, j: number[], th: number, r: string[], far: boolean, soleUp = false) => {
  const [hx, hy, kx, ky, fx, fy] = j;
  const col = far ? r[1] : r[2], lit = far ? r[2] : r[3];
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (const [w, cl] of [[th + 3, INK], [th, col]] as const) { c.strokeStyle = cl; c.lineWidth = w; c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke(); }
  c.strokeStyle = lit; c.lineWidth = Math.max(2, th * 0.3); c.beginPath(); c.moveTo(hx - th * 0.25, hy - th * 0.2); c.lineTo(kx - th * 0.25, ky - th * 0.2); c.lineTo(fx - th * 0.25, fy - th * 0.2); c.stroke();
  // (the wrinkles bunched at the knee)
  c.strokeStyle = r[0]; c.lineWidth = 1; for (const k of [-2, 2]) { c.beginPath(); c.moveTo(kx - th * 0.4, ky + k); c.lineTo(kx + th * 0.4, ky + k + 1); c.stroke(); }
  c.lineCap = 'butt';
  // (the foot: the pad, its toenails; turned sole up, the pad's underside and the nails pointing back)
  const a = Math.atan2(fy - ky, fx - kx);
  c.save(); c.translate(fx, fy); c.rotate(a - Math.PI / 2);
  c.fillStyle = INK; c.fillRect(Math.round(-th / 2 - 1), -1, Math.round(th + 2), 7);
  c.fillStyle = soleUp ? r[3] : r[0]; c.fillRect(Math.round(-th / 2), 0, Math.round(th), 5);
  c.fillStyle = IVORY[2]; for (let k = 0; k < 3; k++) c.fillRect(Math.round(-th / 2 + 1 + k * (th / 3)), soleUp ? 0 : 3, 2, 2);
  c.restore();
};

/**
 * The rhino after the wall, the foot of the wall at the origin, facing right (all of it to the left). `k` 0..1: how far
 * it's buckled (the rear end coming up and over in the moment after it hits); `fr` the frame (a back leg twitching).
 */
export const drawDeadRhino = (c: Ctx, k: number, fr: number) => {
  const r = RAMPS.rhino;
  const e = 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;
  // (the body: level when it hits, buckling up rear-first behind its head)
  const bx = -92 + (1 - e) * 6, by = -40 - e * 6, rot = 0.35 * e;
  const cs = Math.cos(rot), sn = Math.sin(rot);
  const on = (x: number, y: number): [number, number] => [bx + x * cs - y * sn, by + x * sn + y * cs];
  // (a back leg kicking, now and then, long after)
  const tw = fr % 97 < 8 ? Math.sin(fr * 1.9) * 4 : 0;
  // (its shadow, the length of it)
  c.fillStyle = 'rgba(26, 11, 6, 0.32)'; c.fillRect(-150, -3, 150, 4);
  // Far legs first: the back one stuck up in the air, stiff; the front one folded under
  const [h1x, h1y] = on(-30, -6), [h2x, h2y] = on(36, 8);
  deadLeg(c, [h1x, h1y, h1x - 12 - e * 4, h1y - 18 * e - 4 + tw * 0.4, h1x - 16 - e * 6 + tw, h1y - 40 * e - 6], 9, r, true);
  deadLeg(c, [h2x, h2y, h2x + 8, -6, h2x - 10, -3], 9, r, true);
  // (the tail, limp, hanging off the rear)
  const [tx, ty] = on(-44, -6);
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx - 6, ty + 6, tx - 4, ty + 16); c.stroke();
  c.strokeStyle = r[2]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx - 6, ty + 6, tx - 4, ty + 15); c.stroke();
  // The body, its armor folds, the folds bunched up hard behind the neck where it buckled
  mass(c, bx, by, 44, 20, r, rot);
  for (const fx2 of [-18, 16]) {
    const [ax, ay] = on(fx2, 0);
    c.strokeStyle = r[1]; c.lineWidth = 2; c.beginPath(); c.arc(ax, ay, 18, rot - 1.2, rot + 1.2); c.stroke();
    c.strokeStyle = r[4]; c.lineWidth = 1; c.beginPath(); c.arc(ax + 2, ay, 18, rot - 1.1, rot + 0.4); c.stroke();
  }
  for (let i = 0; i < 3; i++) { const [ax, ay] = on(30 + i * 4, -14 + i * 2); c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(ax + 3, ay + 8, ax, ay + 16); c.stroke(); }
  // Near legs: the back one splayed out behind, the front one buckled out forward, its foot turned sole up
  const [h3x, h3y] = on(-22, 8), [h4x, h4y] = on(30, 10);
  deadLeg(c, [h3x, h3y, h3x - 22, h3y + 4, h3x - 38 - e * 6, h3y + 24], 10, r, false);
  deadLeg(c, [h4x, h4y, h4x + 16, -6, h4x + 30, -10], 10, r, false, true);
  // The neck, kinked: folded skin from the shoulder down into the head, a dark crease in it
  const [nx, ny] = on(40, -4);
  mass(c, (nx + DEAD_HEAD.x) / 2 - 2, (ny + DEAD_HEAD.y) / 2 + 4, 14, 12, r, 0.6);
  c.strokeStyle = INK; c.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(nx - 6 + i * 4, ny - 10 - i * 3); c.quadraticCurveTo(nx + 2 + i * 4, ny - 2 - i * 4, nx + i * 4, ny + 6 - i * 3); c.stroke(); }
  // The head, driven nose-down into the wall
  c.save(); c.translate(DEAD_HEAD.x, DEAD_HEAD.y); c.rotate(DEAD_HEAD.rot); c.translate(-46, 0);
  rhinoHead(c, r, 0, 0, true);
  c.restore();
};
