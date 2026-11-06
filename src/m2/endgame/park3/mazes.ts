// THE DEAD BODY MAZES (geo.ts MAZES: where they are, their maps). The owner's (2026-11-06): "there are chlorine tanks
// scattered in the deep end of the pool you need to swim through. you need to swim through some treacherous piles of
// dead bodies in several 'dead body mazes' to find chlorine tanks and dash into them to release the chlorine".
//
//   THE PILES   solid (merged blocks, like the tunnels' grid); painted once into tiles (stamps), every body its own
//               (seeded by where it is: no strip repeats), drowned-grey, bloated, Ren & Stimpy gross. Their tops lit
//               (they can be stood on).
//   THE SNAGS   rebar, gaff hooks, broken bones sticking out into the corridor: touched, they hurt (a knock, no more).
//   THE HANDS   out of the wall, on a clock: twitching (the tell: the fingers working, a gurgle), then out across the
//               corridor: caught, he's held a second (hurt a little, his air going). Out of step with each other.
//   THE TANKS   one per maze, CHLORINE (the cheap imported stuff from the tunnels' storage): he dashes into it (the
//               underwater lunge: special) and it bursts. The chlorine clouds the water round it a long while (harmless
//               to him; GUPPLAX swimming into it sneezes). The fight counts them (boss.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Block } from '../../../m1/types';
import type { Light } from '../../../m1/game/render/lighting';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { stamp, mix, checker, hash } from '../../intro/art/kit';
import { MAZES, mzX, mzY, CELL } from './geo';

type Ctx = CanvasRenderingContext2D;
const INK = '#0A0C0A';
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); c.fill(); };

// ---------------------------------------------------------------------------------------------------------------
// The numbers (tune here)

/** A hand's clock: [rest, tell, out] frames; and how long it holds him, what it takes. */
const HAND = { rest: 80, tell: 40, out: 46, hold: 34, dmg: 7, reach: 62 };
const SNAG_DMG = 8;
/** A cloud of chlorine: how long it hangs about, how far it spreads (GUPPLAX in it: a sneeze). */
export const CLOUD = { life: 1800, r: 150 };

// ---------------------------------------------------------------------------------------------------------------
// What's read off the maps (once)

export interface Tank { x: number; y: number; w: number; h: number; maze: number; burst: boolean; t: number }
interface Snag { x: number; y: number; dir: 1 | -1 | 2 | -2 }
interface Hand { x: number; y: number; dx: number; dy: number; phase: number; maze: number }
export interface Cloud { x: number; y: number; t: number; seed: number }
export interface MazeBox { x0: number; y0: number; x1: number; y1: number; name: string }

const solidCh = (ch: string | undefined) => ch === '#';
/** Each maze's map cell (col, row: the maze's own), or undefined off it. */
const mapAt = (m: number, c: number, r: number) => MAZES[m].map[r]?.[c];
/** Water off the map (round a maze: open pool). */
const solidMap = (m: number, c: number, r: number) => solidCh(mapAt(m, c, r));

export const MAZE_BOX: MazeBox[] = MAZES.map(d => ({ x0: mzX(d.c0), y0: mzY(d.r0), x1: mzX(d.c0 + d.map[0].length), y1: mzY(d.r0 + d.map.length), name: d.name }));
const TANKS0: Omit<Tank, 'burst' | 't'>[] = [];
const SNAGS: Snag[] = [];
const HANDS: Hand[] = [];
MAZES.forEach((d, m) => d.map.forEach((row, r) => [...row].forEach((ch, c) => {
  const x = mzX(d.c0 + c), y = mzY(d.r0 + r);
  if (ch === 'T') TANKS0.push({ x: x + 12, y: y + 10, w: CELL * 2 - 24, h: CELL * 2 - 16, maze: m });
  if (ch === 'x') {
    const dir = solidMap(m, c - 1, r) ? 1 : solidMap(m, c + 1, r) ? -1 : solidMap(m, c, r + 1) ? -2 : 2;
    SNAGS.push({ x, y, dir });
  }
  if (ch === 'h') {
    // (out of whichever wall's beside it, across: up, down, left, right)
    const [dx, dy] = solidMap(m, c, r - 1) ? [0, 1] : solidMap(m, c, r + 1) ? [0, -1] : solidMap(m, c - 1, r) ? [1, 0] : [-1, 0];
    HANDS.push({ x: x + CELL / 2 - dx * CELL / 2, y: y + CELL / 2 - dy * CELL / 2, dx, dy, phase: (HANDS.length * 71) % (HAND.rest + HAND.tell + HAND.out), maze: m });
  }
})));
export const TANK_COUNT = TANKS0.length;

/** The piles, solid: each maze's rows of '#' in runs, runs the same width stacked down merged. */
export const mazeBlocks = (): Block[] => {
  const out: Block[] = [];
  MAZES.forEach((d, m) => {
    const open = new Map<string, { c0: number; c1: number; r0: number; r1: number }>();
    const push = (o: { c0: number; c1: number; r0: number; r1: number }) => out.push({ x: mzX(d.c0 + o.c0), y: mzY(d.r0 + o.r0), w: (o.c1 - o.c0 + 1) * CELL, h: (o.r1 - o.r0 + 1) * CELL, type: 'wall', hidden: true, tag: 'wp3-pile' } as Block);
    d.map.forEach((row, r) => {
      const seen = new Set<string>();
      let c = 0;
      while (c < row.length) {
        if (!solidMap(m, c, r)) { c++; continue; }
        const a = c; while (c < row.length && solidMap(m, c, r)) c++;
        const k = `${a},${c - 1}`, o = open.get(k);
        if (o && o.r1 === r - 1) o.r1 = r; else { if (o) push(o); open.set(k, { c0: a, c1: c - 1, r0: r, r1: r }); }
        seen.add(k);
      }
      for (const [k, o] of [...open]) if (!seen.has(k)) { push(o); open.delete(k); }
    });
    for (const o of open.values()) push(o);
  });
  return out;
};

/** A pile there (world point)? (the globs splat on them; GUPPLAX's ram bonks on them) */
export const pileAt = (x: number, y: number) => {
  for (let m = 0; m < MAZES.length; m++) {
    const b = MAZE_BOX[m];
    if (x < b.x0 || x >= b.x1 || y < b.y0 || y >= b.y1) continue;
    return solidMap(m, Math.floor((x - b.x0) / CELL), Math.floor((y - b.y0) / CELL));
  }
  return false;
};
/** Which maze's box (world point) he's in, or -1. */
export const mazeAt = (x: number, y: number, pad = 0) => MAZE_BOX.findIndex(b => x > b.x0 - pad && x < b.x1 + pad && y > b.y0 - pad && y < b.y1 + pad);

// ---------------------------------------------------------------------------------------------------------------
// The state (a fight's worth: a retry starts them all whole again)

export interface Mazes {
  tanks: Tank[]; clouds: Cloud[];
  /** The hand that has him (its index), and till when; who's had a go at him lately (no grab twice running). */
  held: number; heldT: number; handCd: number[];
  /** The mazes he's been in, the tanks he's seen (lines once). */
  entered: boolean[]; seenTank: boolean[];
}
export const newMazes = (): Mazes => ({
  tanks: TANKS0.map(t => ({ ...t, burst: false, t: 0 })), clouds: [], held: -1, heldT: 0, handCd: HANDS.map(() => 0),
  entered: MAZES.map(() => false), seenTank: TANKS0.map(() => false),
});
export const tanksBurst = (mz: Mazes) => mz.tanks.filter(t => t.burst).length;

const handCyc = (f: number, h: Hand) => {
  const P = HAND.rest + HAND.tell + HAND.out, t = (f + h.phase) % P;
  if (t < HAND.rest) return { st: 'rest' as const, k: t / HAND.rest };
  if (t < HAND.rest + HAND.tell) return { st: 'tell' as const, k: (t - HAND.rest) / HAND.tell };
  return { st: 'out' as const, k: (t - HAND.rest - HAND.tell) / HAND.out };
};
/** How far out a hand is (0..1): shooting out, held, drawn back in. */
const handOut = (f: number, h: Hand) => { const s = handCyc(f, h); return s.st !== 'out' ? 0 : Math.min(1, s.k * 6, (1 - s.k) * 4); };
const handBox = (f: number, h: Hand) => {
  const k = handOut(f, h);
  if (k <= 0.2) return null;
  const len = HAND.reach * k, wd = 26;
  return h.dx !== 0 ? { x: h.dx > 0 ? h.x : h.x - len, y: h.y - wd / 2, w: len, h: wd } : { x: h.x - wd / 2, y: h.dy > 0 ? h.y : h.y - len, w: wd, h: len };
};
const near = (state: GameState, x: number, y: number, pad: number) => x > state.camera.x - pad && x < state.camera.x + W + pad && y > state.camera.y - pad && y < state.camera.y + H + pad;

/** A frame: the snags, the hands, the tanks (dashed into: `onBurst`), the clouds. */
export const updateMazes = (ctx: FrameContext, mz: Mazes, onBurst: (t: Tank, i: number) => void) => {
  const { state } = ctx, p = state.player, f = state.frame;
  const bx = p.pos.x + 6, by = p.pos.y + 4, bw = p.width - 12, bh = p.height - 8;
  const live = p.health > 0 && !p.inCutscene && state.deathTimer <= 0;
  const hit = (x: number, y: number, w: number, h: number) => bx < x + w && bx + bw > x && by < y + h && by + bh > y;
  // ---- the snags
  if (live && p.invincibilityTimer <= 0) for (const s of SNAGS) {
    if (Math.abs(s.x - bx) > 120 || Math.abs(s.y - by) > 120) continue;
    if (hit(s.x + 8, s.y + 8, CELL - 16, CELL - 16)) {
      const kx = Math.abs(s.dir) === 1 ? s.dir * 5 : Math.sign(bx + bw / 2 - (s.x + 20)) * 3, ky = Math.abs(s.dir) === 2 ? (s.dir > 0 ? 4 : -4) : -2;
      hurtPlayer(ctx, SNAG_DMG, 'm2:wp3_snag', { x: kx, y: ky }, 14); shakeScreen(state, 4, 2);
      break;
    }
  }
  // ---- the hands: the tell's sound when he's near; out, they grab; holding, he's kept there
  for (let i = 0; i < HANDS.length; i++) {
    const h = HANDS[i];
    if (mz.handCd[i] > 0) mz.handCd[i]--;
    if (!near(state, h.x, h.y, 60)) continue;
    const s = handCyc(f, h);
    if (s.st === 'tell' && Math.floor(s.k * HAND.tell) === 1) playSound('glug', 0.35, -14);
    if (s.st === 'out' && Math.floor(s.k * HAND.out) === 1) playSound('crunch', 0.35, -8);
    const b = handBox(f, h);
    if (live && b && mz.held < 0 && mz.handCd[i] <= 0 && hit(b.x, b.y, b.w, b.h)) {
      mz.held = i; mz.heldT = HAND.hold; mz.handCd[i] = 160;
      if (p.invincibilityTimer <= 0) hurtPlayer(ctx, HAND.dmg, 'm2:wp3_hand', { x: 0, y: 0 }, 4);
      playSound('splat', 0.6, -6);
    }
  }
  if (mz.held >= 0) {
    const h = HANDS[mz.held];
    if (--mz.heldT <= 0 || !live) mz.held = -1;
    else {
      // (held by the wrist: kept where it caught him, the dash cut off)
      p.isCharging = false; p.swimDash = undefined;
      p.vel.x *= 0.2; p.vel.y *= 0.2;
      const tx = h.x + h.dx * 50 - p.width / 2, ty = h.y + h.dy * 50 - p.height / 2;
      p.pos.x += (tx - p.pos.x) * 0.08; p.pos.y += (ty - p.pos.y) * 0.08;
      if (f % 6 === 0) state.particles.push({ pos: { x: p.pos.x + p.width / 2, y: p.pos.y + 10 }, vel: { x: (Math.random() - 0.5), y: -1.4 }, life: 30, color: 'rgba(204, 251, 241, 0.8)', size: 3 });
    }
  }
  // ---- the tanks: dashed into (the lunge), burst
  for (let i = 0; i < mz.tanks.length; i++) {
    const t = mz.tanks[i];
    if (t.burst) { t.t++; continue; }
    if (live && p.isCharging && p.swimDash && hit(t.x - 4, t.y - 4, t.w + 8, t.h + 8)) {
      t.burst = true; t.t = 0;
      playSound('clang', 1, -6); playSound('glass', 0.8, -4); playSound('gush', 1, 2); shakeScreen(state, 10, 5);
      const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
      mz.clouds.push({ x: cx, y: cy, t: 0, seed: i * 31 + 7 });
      for (let k = 0; k < 26; k++) state.particles.push({ pos: { x: cx, y: cy }, vel: { x: (Math.random() - 0.5) * 9, y: (Math.random() - 0.5) * 9 }, life: 40, color: k % 3 ? '#E8F59A' : '#FDE047', size: 3 + Math.random() * 5 });
      for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: cx, y: cy }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 50, color: '#9CA3AF', size: 4, grav: 0.15 });
      onBurst(t, i);
    }
  }
  for (let i = mz.clouds.length - 1; i >= 0; i--) { const c = mz.clouds[i]; c.t++; c.y -= 0.12; if (c.t > CLOUD.life) mz.clouds.splice(i, 1); }
};
/** The tank nearest him that's whole and on the screen (the lines: seen once), or -1. */
export const tankInView = (state: GameState, mz: Mazes) => mz.tanks.findIndex(t => !t.burst && near(state, t.x, t.y, -60));
/** Is (x, y) in a cloud of chlorine (and how thick: 0..1)? */
export const inCloud = (mz: Mazes, x: number, y: number) => {
  let k = 0;
  for (const c of mz.clouds) { const r = cloudR(c), d = Math.hypot(x - c.x, y - c.y); if (d < r) k = Math.max(k, (1 - d / r) * cloudA(c)); }
  return k;
};
const cloudR = (c: Cloud) => 50 + (CLOUD.r - 50) * Math.min(1, c.t / 140);
const cloudA = (c: Cloud) => Math.min(1, (CLOUD.life - c.t) / 300);

/** The tanks' glow (lights: the lighting's own), the clouds' faint one. */
export const mazeLights = (state: GameState, mz: Mazes): Light[] => {
  const out: Light[] = [];
  for (const t of mz.tanks) if (!t.burst && near(state, t.x, t.y, 260)) out.push({ x: t.x + t.w / 2, y: t.y + t.h / 2, r: 150, a: 0.45 + 0.1 * Math.sin(state.frame * 0.08), color: '#E8F59A' });
  for (const c of mz.clouds) if (near(state, c.x, c.y, 300)) out.push({ x: c.x, y: c.y, r: cloudR(c) * 1.3, a: 0.22 * cloudA(c), color: '#D9F99D' });
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the piles (baked tiles), the snags (in them), the tanks, the hands (live), the clouds (in front)

const TILE = 320;
/** The drowned: grey-green, bloated, their colors gone off in the water. */
const SKINS = ['#E8C4A0', '#C89870', '#9A6A48', '#6A4A32', '#F0D8C0', '#B07A5A'].map(s => mix(s, '#7A9A8A', 0.35));
const SUITS = ['#E04A3A', '#3A8AE0', '#F0C030', '#2AA060', '#E04A8A', '#8A4AE0', '#F08A2A', '#20B0B0'].map(s => mix(s, '#3A5A5A', 0.3));
const HAIRS = ['#2A1A10', '#6A4A2A', '#C8A050', '#8A8A8A', '#A03A1A', '#1A1A1A'];
const MUCK = ['#1A1E18', '#262A22', '#33382C', '#444A3A'];
const ramp4 = (b: string) => [mix(b, '#0E1A1A', 0.55), mix(b, '#0E1A1A', 0.25), b, mix(b, '#F0FFF0', 0.3)];

/** A blob in steps: inked, dark, mid, lit top-left. */
const lump = (g: Ctx, x: number, y: number, rx: number, ry: number, L: string[], rot = 0) => {
  ell(g, x, y, rx + 1.5, ry + 1.5, INK, rot); ell(g, x, y, rx, ry, L[1], rot);
  ell(g, x - rx * 0.1, y - ry * 0.12, rx * 0.82, ry * 0.74, L[2], rot); ell(g, x - rx * 0.35, y - ry * 0.38, rx * 0.36, ry * 0.26, L[3], rot);
};
const limb = (g: Ctx, x: number, y: number, len: number, wd: number, rot: number, L: string[], hand: boolean) => {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = wd + 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(len, 0); g.stroke();
  g.strokeStyle = L[1]; g.lineWidth = wd; g.beginPath(); g.moveTo(0, 0); g.lineTo(len, 0); g.stroke();
  g.strokeStyle = L[2]; g.lineWidth = wd * 0.5; g.beginPath(); g.moveTo(0, -wd * 0.15); g.lineTo(len, -wd * 0.15); g.stroke();
  if (hand) { lump(g, len + 3, 0, 6, 5, L); for (let k = 0; k < 4; k++) ell(g, len + 8, -4 + k * 2.7, 3.4, 1.4, L[2]); }
  else { g.fillStyle = INK; g.fillRect(len - 2, -wd / 2 - 2, 12, wd + 4); g.fillStyle = L[2]; g.fillRect(len - 1, -wd / 2 - 1, 10, wd + 2); }
  g.restore();
};
const head = (g: Ctx, x: number, y: number, r: number, s: number) => {
  const L = ramp4(SKINS[Math.floor(hash(s) * SKINS.length)]);
  lump(g, x, y, r, r * 0.92, L);
  // (hair, or a swim cap, or neither)
  const hk = hash(s + 1);
  if (hk < 0.45) { g.fillStyle = HAIRS[Math.floor(hash(s + 2) * HAIRS.length)]; g.beginPath(); g.ellipse(x, y - r * 0.6, r * 0.8, r * 0.38, 0, Math.PI, 0); g.fill(); }
  else if (hk < 0.65) { g.fillStyle = SUITS[Math.floor(hash(s + 3) * SUITS.length)]; g.beginPath(); g.ellipse(x, y - r * 0.3, r * 0.95, r * 0.7, 0, Math.PI, 0); g.fill(); }
  // (the eyes: bulging, tiny pupils; or X'd; or one gone)
  const ek = hash(s + 4), ex = r * 0.38;
  for (const sx of [-1, 1]) {
    const cx = x + sx * ex, cy = y - r * 0.05;
    if (ek < 0.5) { ell(g, cx, cy, r * 0.3, r * 0.3, INK); ell(g, cx, cy, r * 0.26, r * 0.26, '#E8ECD8'); R(g, cx - 1, cy - 1 + (sx > 0 ? 1 : 0), 2, 2, INK); g.strokeStyle = '#B04040'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(cx - r * 0.24, cy + 1); g.lineTo(cx - r * 0.1, cy); g.stroke(); }
    else if (ek < 0.8 || sx > 0) { g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx - 3, cy - 3); g.lineTo(cx + 3, cy + 3); g.moveTo(cx + 3, cy - 3); g.lineTo(cx - 3, cy + 3); g.stroke(); }
    else { ell(g, cx, cy, r * 0.24, r * 0.22, '#2A0A0A'); }
  }
  // (the mouth: slack, teeth with gaps, a purple tongue out)
  const my = y + r * 0.45;
  ell(g, x, my, r * 0.34, r * 0.16, INK);
  R(g, x - r * 0.25, my - r * 0.12, 3, 3, '#E8E0B0'); R(g, x + r * 0.05, my - r * 0.12, 3, 3, '#E8E0B0');
  if (hash(s + 5) < 0.6) { ell(g, x + 2, my + r * 0.2, r * 0.16, r * 0.24, '#7A3A6A'); ell(g, x + 1, my + r * 0.14, r * 0.07, r * 0.1, '#A86A9A'); }
  // (pores, a vein)
  for (let k = 0; k < 4; k++) R(g, x - r * 0.6 + hash(s + 10 + k) * r * 1.2, y - r * 0.5 + hash(s + 20 + k) * r, 1, 1, L[0]);
  g.strokeStyle = mix(L[1], '#3A5A9A', 0.4); g.lineWidth = 0.8; g.beginPath(); g.moveTo(x - r * 0.7, y - r * 0.2); g.quadraticCurveTo(x - r * 0.5, y - r * 0.5, x - r * 0.2, y - r * 0.7); g.stroke();
};
const torso = (g: Ctx, x: number, y: number, rx: number, ry: number, rot: number, s: number) => {
  const L = ramp4(SKINS[Math.floor(hash(s) * SKINS.length)]);
  lump(g, x, y, rx, ry, L, rot);
  g.save(); g.translate(x, y); g.rotate(rot);
  // (the suit: trunks, a one-piece, a bikini top)
  const suit = SUITS[Math.floor(hash(s + 6) * SUITS.length)], sk = hash(s + 7);
  g.fillStyle = INK; g.fillRect(-rx * 0.9, ry * 0.25 - 1, rx * 1.8, ry * 0.5 + 2);
  g.fillStyle = suit; g.fillRect(-rx * 0.88, ry * 0.25, rx * 1.76, ry * 0.5);
  if (sk < 0.4) { g.fillStyle = mix(suit, '#FFFFFF', 0.4); for (let k = 0; k < 4; k++) g.fillRect(-rx * 0.8 + k * rx * 0.45, ry * 0.3, 3, 3); }
  if (sk > 0.7) { ell(g, -rx * 0.35, -ry * 0.3, rx * 0.26, ry * 0.2, INK); ell(g, -rx * 0.35, -ry * 0.3, rx * 0.22, ry * 0.16, suit); ell(g, rx * 0.25, -ry * 0.3, rx * 0.26, ry * 0.2, INK); ell(g, rx * 0.25, -ry * 0.3, rx * 0.22, ry * 0.16, suit); }
  else { R(g, -rx * 0.4, -ry * 0.3, 2, 2, '#6A3A4A'); R(g, rx * 0.3, -ry * 0.3, 2, 2, '#6A3A4A'); }
  ell(g, 0, ry * 0.05, 2, 1.6, INK);
  // (a bite out of it, the ribs showing: the eels have been at it)
  if (hash(s + 8) < 0.3) { ell(g, rx * 0.5, -ry * 0.1, rx * 0.3, ry * 0.35, '#5A1A1A'); for (let k = 0; k < 3; k++) R(g, rx * 0.35, -ry * 0.3 + k * ry * 0.2, rx * 0.3, 2, '#E8E0C8'); }
  g.restore();
};
/** An inner tube, a pool noodle, a floatie: the junk in with them. */
const junk = (g: Ctx, x: number, y: number, s: number) => {
  const k = hash(s + 9), col = SUITS[Math.floor(hash(s + 11) * SUITS.length)];
  if (k < 0.4) { ell(g, x, y, 17, 11, INK); ell(g, x, y, 15, 9, col); ell(g, x, y, 7, 4, INK); for (let i = 0; i < 4; i++) ell(g, x + Math.cos(i * 1.57) * 11, y + Math.sin(i * 1.57) * 7, 3, 2, '#E8ECE0'); }
  else if (k < 0.7) { g.save(); g.translate(x, y); g.rotate(hash(s + 12) * 3); R(g, -22, -5, 44, 10, INK); R(g, -21, -4, 42, 8, col); R(g, -21, -4, 42, 2, mix(col, '#FFFFFF', 0.35)); g.restore(); }
  else { lump(g, x, y, 10, 9, ramp4('#C8C0A8')); R(g, x - 5, y - 2, 3, 3, INK); R(g, x + 2, y - 2, 3, 3, INK); R(g, x - 3, y + 4, 6, 2, INK); }
};

const paintTile = (g: Ctx, m: number, tx: number, ty: number) => {
  const d = MAZES[m], X0 = mzX(d.c0), Y0 = mzY(d.r0);
  g.save(); g.beginPath(); g.rect(tx, ty, TILE, TILE); g.clip();
  const c0 = Math.max(-1, Math.floor((tx - X0) / CELL) - 1), c1 = Math.min(d.map[0].length, Math.ceil((tx + TILE - X0) / CELL) + 1);
  const r0 = Math.max(-1, Math.floor((ty - Y0) / CELL) - 1), r1 = Math.min(d.map.length, Math.ceil((ty + TILE - Y0) / CELL) + 1);
  const S = (c: number, r: number) => solidMap(m, c, r);
  // ---- the muck under them all (a lumpy edge where the pile meets the water: never more than a few px into it)
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    if (!S(c, r)) continue;
    const x = X0 + c * CELL, y = Y0 + r * CELL, s = m * 9973 + r * 131 + c;
    R(g, x, y, CELL, CELL, MUCK[1]);
    checker(g, x, y, CELL, CELL, MUCK[0], (r + c) % 2, 2);
    if (!S(c, r - 1)) for (let k = 0; k < 3; k++) ell(g, x + 7 + k * 13, y + 3, 9, 5 + hash(s + k) * 3, MUCK[2]);
    if (!S(c - 1, r)) ell(g, x + 3, y + 20, 5, 14, MUCK[1]);
    if (!S(c + 1, r)) ell(g, x + CELL - 3, y + 20, 5, 14, MUCK[1]);
  }
  // ---- the bodies: big ones over the inside of the pile, small ones round its edges (kept to the pile)
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    if (!S(c, r)) continue;
    const x = X0 + c * CELL + 20, y = Y0 + r * CELL + 20, s = m * 9973 + r * 131 + c * 7;
    const inner = S(c - 1, r) && S(c + 1, r) && S(c, r - 1) && S(c, r + 1);
    const sz = inner ? 1.35 : 0.8, k = hash(s);
    const ox = (hash(s + 1) - 0.5) * (inner ? 16 : 6), oy = (hash(s + 2) - 0.5) * (inner ? 16 : 6);
    const rot = (hash(s + 3) - 0.5) * 3;
    if (k < 0.3) torso(g, x + ox, y + oy, 18 * sz, 13 * sz, rot, s);
    else if (k < 0.52) head(g, x + ox, y + oy, 11 * sz, s);
    else if (k < 0.72) limb(g, x + ox - 14 * sz, y + oy, 24 * sz, 9 * sz, rot, ramp4(SKINS[Math.floor(hash(s + 4) * SKINS.length)]), hash(s + 5) < 0.6);
    else if (k < 0.84) junk(g, x + ox, y + oy, s);
    else { limb(g, x + ox - 12 * sz, y + oy - 4, 22 * sz, 8 * sz, rot, ramp4(SKINS[Math.floor(hash(s + 4) * SKINS.length)]), true); head(g, x + ox + 6, y + oy + 6, 9 * sz, s + 50); }
  }
  // ---- the tops: lit, where there's water over them (stood on)
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    if (!S(c, r) || S(c, r - 1)) continue;
    const x = X0 + c * CELL, y = Y0 + r * CELL;
    R(g, x, y, CELL, 3, '#8A9A7A'); R(g, x, y, CELL, 1, '#C8D8B0');
    for (let k = 0; k < 3; k++) R(g, x + 4 + k * 12 + (r % 3), y + 3, 6, 1, '#6A7A5A');
  }
  // ---- the snags: rebar, gaff hooks, a femur, out of the pile across the corridor
  for (const s of SNAGS) {
    if (s.x + CELL < tx - 20 || s.x > tx + TILE + 20 || s.y + CELL < ty - 20 || s.y > ty + TILE + 20) continue;
    const sx = Math.abs(s.dir) === 1 ? (s.dir > 0 ? s.x : s.x + CELL) : s.x + CELL / 2, sy = Math.abs(s.dir) === 2 ? (s.dir > 0 ? s.y : s.y + CELL) : s.y + CELL / 2;
    const dx = Math.abs(s.dir) === 1 ? s.dir : 0, dy = Math.abs(s.dir) === 2 ? Math.sign(s.dir) : 0;
    for (const [o, len, col] of [[-10, 36, '#6A3A1A'], [2, 30, '#8A4A22'], [12, 26, '#E8E0C8']] as [number, number, string][]) {
      const ax = sx + (dy !== 0 ? o : 0), ay = sy + (dx !== 0 ? o : 0), bx = ax + dx * len + dy * 4, by = ay + dy * len + dx * 4;
      g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
      g.strokeStyle = col; g.lineWidth = 3.5; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
      // (the barbs, the hook's curl)
      g.strokeStyle = col === '#E8E0C8' ? '#E8E0C8' : '#B06A3A'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - dx * 6 + dy * 6, by - dy * 6 + dx * 6); g.stroke();
    }
  }
  g.restore();
};
const drawPiles = (c: Ctx, state: GameState) => {
  const cx0 = state.camera.x - 30, cx1 = state.camera.x + W + 30, cy0 = state.camera.y - 30, cy1 = state.camera.y + H + 30;
  MAZES.forEach((_, m) => {
    const b = MAZE_BOX[m];
    if (b.x1 < cx0 || b.x0 > cx1 || b.y1 < cy0 || b.y0 > cy1) return;
    for (let ty = b.y0; ty < b.y1; ty += TILE) for (let tx = b.x0; tx < b.x1; tx += TILE) {
      if (tx + TILE < cx0 || tx > cx1 || ty + TILE < cy0 || ty > cy1) continue;
      const w = Math.min(TILE, b.x1 - tx), h = Math.min(TILE, b.y1 - ty);
      stamp(c, `wp3-pile-${m}-${tx}-${ty}`, tx, ty, w, h, g => paintTile(g, m, tx, ty));
    }
  });
};
const paintTank = (g: Ctx, x: number, y: number, w: number, h: number) => {
  // (a squat steel cylinder on its side, chipped yellow, the valve on top; CL2 and a skull stenciled on)
  const Y = ['#5A4A0A', '#8A7414', '#C8A820', '#E8D040', '#FFF08A'];
  R(g, x - 2, y + 4, w + 4, h - 8, INK);
  for (let k = 0; k < 5; k++) R(g, x, y + 6 + k * ((h - 12) / 5), w, (h - 12) / 5 + 1, Y[[1, 3, 4, 2, 0][k]]);
  ell(g, x + 2, y + h / 2, 6, h / 2 - 4, INK); ell(g, x + 2, y + h / 2, 4, h / 2 - 6, Y[2]);
  ell(g, x + w - 2, y + h / 2, 6, h / 2 - 4, INK); ell(g, x + w - 2, y + h / 2, 4, h / 2 - 6, Y[1]);
  R(g, x + w / 2 - 5, y - 4, 10, 10, INK); R(g, x + w / 2 - 3, y - 2, 6, 8, '#8A8A90'); R(g, x + w / 2 - 8, y - 6, 16, 4, '#B0B0B8');
  // (rust bleeding down it, the stencil)
  for (let k = 0; k < 4; k++) R(g, x + 6 + k * 11, y + 8, 2, 8 + (k % 3) * 5, '#7A3A12');
  g.font = '7px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = INK; g.fillText('CL2', x + w / 2, y + h / 2 + 4); g.textAlign = 'left';
  ell(g, x + w / 2, y + h / 2 + 14, 4, 4, INK); R(g, x + w / 2 - 3, y + h / 2 + 12, 2, 2, Y[3]); R(g, x + w / 2 + 1, y + h / 2 + 12, 2, 2, Y[3]);
};

/** World, behind him: the piles, the tanks (whole: a glow, bubbles from the valve; burst: the split shell), the hands. */
export const drawMazesBack = (c: Ctx, state: GameState, mz: Mazes) => {
  drawPiles(c, state);
  const f = state.frame;
  for (const t of mz.tanks) {
    if (!near(state, t.x, t.y, 80)) continue;
    if (!t.burst) {
      stamp(c, 'wp3-tank', t.x - 8, t.y - 10, t.w + 16, t.h + 20, g => paintTank(g, t.x, t.y, t.w, t.h));
      for (let k = 0; k < 3; k++) { const by = t.y - 6 - ((f * 0.8 + k * 13) % 36); R(c, t.x + t.w / 2 - 2 + Math.sin(f * 0.1 + k) * 3, by, 3, 3, '#E8F59A'); }
    } else {
      // (the shell, split open, on its side in the pocket)
      R(c, t.x + 2, t.y + t.h - 14, t.w - 4, 12, INK); R(c, t.x + 4, t.y + t.h - 12, t.w * 0.4, 8, '#8A7414'); R(c, t.x + t.w * 0.55, t.y + t.h - 12, t.w * 0.4, 8, '#C8A820');
      R(c, t.x + t.w * 0.45, t.y + t.h - 18, 6, 10, '#5A4A0A');
    }
  }
  for (let i = 0; i < HANDS.length; i++) {
    const h = HANDS[i];
    if (!near(state, h.x, h.y, 80)) continue;
    const s = handCyc(f, h), out = mz.held === i ? 1 : handOut(f, h);
    const tw = s.st === 'tell' ? Math.sin(f * 0.9) * 3 * (0.4 + s.k) : 0;
    const len = 6 + HAND.reach * out, ex = h.x + h.dx * len, ey = h.y + h.dy * len;
    const L = ramp4(SKINS[i % SKINS.length]);
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 13; c.beginPath(); c.moveTo(h.x - h.dx * 8, h.y - h.dy * 8); c.lineTo(ex + h.dy * tw, ey + h.dx * tw); c.stroke();
    c.strokeStyle = L[1]; c.lineWidth = 10; c.beginPath(); c.moveTo(h.x - h.dx * 8, h.y - h.dy * 8); c.lineTo(ex + h.dy * tw, ey + h.dx * tw); c.stroke();
    c.strokeStyle = L[2]; c.lineWidth = 4; c.beginPath(); c.moveTo(h.x - h.dx * 6 - h.dy * 2, h.y - h.dy * 6 - h.dx * 2); c.lineTo(ex - h.dy * 2 + h.dy * tw, ey - h.dx * 2 + h.dx * tw); c.stroke();
    // (the hand: fat grey fingers, clawing (the tell: working), open out, shut on him)
    const hx = ex + h.dy * tw, hy = ey + h.dx * tw, open = mz.held === i ? 0.3 : s.st === 'out' ? 1 : s.st === 'tell' ? 0.5 + 0.5 * Math.sin(f * 0.6) : 0.2;
    lump(c, hx, hy, 8, 7, L);
    for (let k = -2; k <= 1; k++) {
      const a = Math.atan2(h.dy, h.dx) + k * 0.45 * open, fx = hx + Math.cos(a) * 10, fy = hy + Math.sin(a) * 10;
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(hx, hy); c.lineTo(fx, fy); c.stroke();
      c.strokeStyle = L[2]; c.lineWidth = 3; c.beginPath(); c.moveTo(hx, hy); c.lineTo(fx, fy); c.stroke();
      R(c, fx - 1, fy - 1, 2, 2, '#D8D0B8');
    }
    if (s.st === 'tell' && f % 10 < 5) R(c, hx - 1, hy - 14, 3, 3, '#E0F2FE');
  }
};
/** World, over him: the chlorine (thick, yellow-green, rolling). */
export const drawMazesFront = (c: Ctx, state: GameState, mz: Mazes) => {
  const f = state.frame;
  for (const cl of mz.clouds) {
    const r = cloudR(cl), a = cloudA(cl);
    if (!near(state, cl.x, cl.y, r + 20)) continue;
    for (let k = 0; k < 9; k++) {
      const ang = k * 0.7 + cl.seed + f * 0.004 * (k % 2 ? 1 : -1), dd = r * (0.25 + 0.55 * hash(cl.seed + k));
      const px = cl.x + Math.cos(ang) * dd, py = cl.y + Math.sin(ang) * dd * 0.8, pr = r * (0.35 + 0.2 * hash(cl.seed + k + 20));
      c.globalAlpha = 0.16 * a; c.fillStyle = '#D9F99D'; c.beginPath(); c.arc(px, py, pr, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 0.14 * a; c.fillStyle = '#F7FEE7'; c.beginPath(); c.arc(px - pr * 0.2, py - pr * 0.2, pr * 0.55, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
};
