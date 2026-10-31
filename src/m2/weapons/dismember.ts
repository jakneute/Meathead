// Torn apart: an enemy burst into its pieces, each one cut out of its own picture (so it's that guard's head, that
// tourist's legs), flung off spinning in the carnage, bleeding as it goes, bouncing where it comes down and lying there
// a while. A person: the head, the trunk, both arms, both legs. An animal: the head, the front half, the back half,
// the legs. (The stunt car's: see stuntCar.ts runDown.)

import type { Enemy, Block } from '../../m1/types';
import type { GameState } from '../../m1/game/core/state';
import { CANVAS_HEIGHT } from '../../m1/constants';
import { kindFacing, isHumanoidKind, KIND_HEAD } from '../../m1/game/render/enemies';
import { drawEnemyAt } from '../moves/grab';
import { viewRectOf, inView } from '../../m1/game/render/viewCull';
import { kindGore } from '../../m1/game/enemies/kindBlood';

type Ctx = CanvasRenderingContext2D;
/** A piece's shape, in the enemy's own picture (feet at the origin, facing right): a circle (its head) or a box. */
/** A box's `poly`, if it has one, is the shape cut out of it (the same coordinates; the box just bounds it): an animal
 *  sliced nose to tail on a slant. */
export type Cut = { circle: true; x: number; y: number; r: number } | { circle: false; x0: number; y0: number; x1: number; y1: number; poly?: [number, number][] };
interface Piece { e: Enemy; face: 1 | -1; cut: Cut; cx: number; cy: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number; t: number; down: boolean; bounced: boolean; bake?: BakedCut }

const LIE = 480, FADE = 60, MAX_PIECES = 90, G = 0.55;
let pieces: Piece[] = [];
export const stopDismember = () => { pieces = []; };

const solid = (b: Block) => b.type !== 'pit' && b.type !== 'door';
const floorUnder = (state: GameState, x: number, from: number) => {
  let best: number | null = null;
  for (const b of state.blocks) if (solid(b) && x >= b.x && x <= b.x + b.w && b.y >= from - 6 && (best === null || b.y < best)) best = b.y;
  return best;
};

/** The pieces of a person or an animal, cut from its picture (feet at the origin, facing right). */
const cutsOf = (e: Enemy): Cut[] => {
  const w = e.width, h = e.height;
  const hd = (e.kind && KIND_HEAD[e.kind]) || { x: 0, y: -h * 0.85, r: Math.min(w, h) * 0.2 };
  if (isHumanoidKind(e.kind)) {
    const neck = hd.y + hd.r * 0.9, hip = -h * 0.42, half = w / 2 + 10;
    return [
      { circle: true, x: hd.x, y: hd.y, r: hd.r * 1.3 },
      { circle: false, x0: -w * 0.28, y0: neck, x1: w * 0.28, y1: hip },
      { circle: false, x0: -half, y0: neck, x1: -w * 0.28, y1: hip + 6 },
      { circle: false, x0: w * 0.28, y0: neck, x1: half, y1: hip + 6 },
      { circle: false, x0: -half, y0: hip, x1: 0, y1: 2 },
      { circle: false, x0: 0, y0: hip, x1: half, y1: 2 },
    ];
  }
  // (an animal, side on: its head, the front of it, the back of it, the legs under)
  const back = -h * 0.35;
  return [
    { circle: true, x: hd.x, y: hd.y, r: hd.r * 1.4 },
    { circle: false, x0: 0, y0: -h - 10, x1: w / 2 + 12, y1: back },
    { circle: false, x0: -w / 2 - 12, y0: -h - 10, x1: 0, y1: back },
    { circle: false, x0: -w / 2 - 12, y0: back, x1: w / 2 + 12, y1: 2 },
  ];
};

/** Burst `e` into its pieces, flung off `dir`-ward (the way whatever hit it was going), `force` how hard. */
export const dismember = (state: GameState, e: Enemy, dir: number, force = 1) => {
  const face = (kindFacing(e, state) >= 0 ? 1 : -1) as 1 | -1;
  const fx = e.pos.x + e.width / 2, fy = e.pos.y + e.height;
  e.vel = { x: 0, y: 0 }; e.pose = undefined; e.melee = undefined;
  // (dead: nothing on it moves any more, a wing, a leg, a tail: its picture held as it was)
  e.frozeAt = state.frame; e.frozenTimer = 1e9;
  for (const cut of cutsOf(e)) {
    let lx: number, ly: number;
    if ('x0' in cut) { lx = (cut.x0 + cut.x1) / 2; ly = (cut.y0 + cut.y1) / 2; } else { lx = cut.x; ly = cut.y; }
    const up = 'x0' in cut ? 1 : 1.25;
    pieces.push({
      e, face, cut, cx: lx, cy: ly, x: fx + lx * face, y: fy + ly,
      vx: dir * (2 + Math.random() * 6) * force + (Math.random() - 0.5) * 7, vy: -(7 + Math.random() * 7) * force * up,
      rot: 0, vr: (Math.random() - 0.5) * 0.7, t: 0, down: false, bounced: false,
    });
  }
  if (pieces.length > MAX_PIECES) pieces.splice(0, pieces.length - MAX_PIECES);
};

/**
 * Sliced in half (the leg armor's flash kick: upgrades/followups.ts): the two halves stood where it was, then falling
 * apart, bleeding from the cut, and lying there a while like any other piece. A person: top to bottom, down the
 * forehead, the halves falling apart either way and turning outward. An animal: the same idea along its long axis
 * (the owner's "it's different for humans/animals"): nose to tail through the head, on the slant from its head down to
 * its rump, the top half sliding off its back and the bottom half slumping where it stood. An animal's halves are
 * painted the once there and then, as it looked alive (its dead picture's lying down, or belly up: no good to cut).
 */
export const sliceInHalf = (state: GameState, e: Enemy) => {
  const face = (kindFacing(e, state) >= 0 ? 1 : -1) as 1 | -1;
  const fx = e.pos.x + e.width / 2, fy = e.pos.y + e.height;
  e.vel = { x: 0, y: 0 }; e.pose = undefined; e.melee = undefined;
  e.frozeAt = state.frame; e.frozenTimer = 1e9;
  const hd = e.kind ? KIND_HEAD[e.kind] : undefined;
  const wide = e.width / 2 + 24, top = -e.height - 26;
  if (!isHumanoidKind(e.kind)) {
    // (the line: through the middle of its head and its rump, half its height up its back end)
    const h = hd ?? { x: e.width * 0.35, y: -e.height * 0.75, r: 6 };
    const tx = -e.width / 2, ty = -e.height * 0.5, k = (h.y - ty) / ((h.x - tx) || 1);
    const yL = ty + k * (-wide - tx), yR = ty + k * (wide - tx);
    const upper: Cut = { circle: false, x0: -wide, y0: top, x1: wide, y1: Math.max(yL, yR), poly: [[-wide, top], [wide, top], [wide, yR], [-wide, yL]] };
    const lower: Cut = { circle: false, x0: -wide, y0: Math.min(yL, yR), x1: wide, y1: 3, poly: [[-wide, yL], [wide, yR], [wide, 3], [-wide, 3]] };
    for (const [cut, upperHalf] of [[upper, true], [lower, false]] as const) {
      const lx = (cut.x0 + cut.x1) / 2, ly = (cut.y0 + cut.y1) / 2;
      pieces.push({
        e, face, cut, cx: lx, cy: ly, x: fx + lx * face, y: fy + ly,
        // (the top half off backward over its rump, tipping; the bottom half just slumps)
        vx: upperHalf ? -face * (1 + Math.random() * 1.2) : face * 0.3, vy: upperHalf ? -3 - Math.random() * 1.5 : -0.8,
        rot: 0, vr: upperHalf ? -face * (0.05 + Math.random() * 0.03) : face * 0.015, t: 0, down: false, bounced: false,
        bake: bakeEnemyCutAlive(state, e, face, cut),
      });
    }
    if (pieces.length > MAX_PIECES) pieces.splice(0, pieces.length - MAX_PIECES);
    return;
  }
  const at = hd ? hd.x : 0;
  for (const side of [-1, 1] as const) {
    // (in its own picture, facing right: the half on this side of the cut; `side` is which way it falls on screen)
    const lside = side * face;
    const cut: Cut = lside < 0 ? { circle: false, x0: -wide, y0: top, x1: at, y1: 3 } : { circle: false, x0: at, y0: top, x1: wide, y1: 3 };
    const lx = ((cut.x0 + cut.x1) / 2), ly = (cut.y0 + cut.y1) / 2;
    pieces.push({
      e, face, cut, cx: lx, cy: ly, x: fx + lx * face, y: fy + ly,
      vx: side * (1.2 + Math.random() * 1.2), vy: -2.5 - Math.random() * 1.5, rot: 0, vr: side * (0.05 + Math.random() * 0.03), t: 0, down: false, bounced: false,
    });
  }
  if (pieces.length > MAX_PIECES) pieces.splice(0, pieces.length - MAX_PIECES);
};

/** Each frame: flying, bleeding; down, a bounce, lying there; and gone. */
export const tickDismember = (state: GameState) => {
  if (!pieces.length) return;
  const bottom = state.camera.y + CANVAS_HEIGHT + 300;
  pieces = pieces.filter(p => {
    p.t++;
    if (!p.down) {
      p.vy = Math.min(16, p.vy + G); p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      // (bleeding as it goes)
      if (p.t % 2 === 0 && state.particles.length < 900) state.particles.push(kindGore({ pos: { x: p.x, y: p.y }, vel: { x: p.vx * 0.2, y: p.vy * 0.2 }, life: 24, color: p.t % 4 ? '#991B1B' : '#7F1D1D', size: 2 + Math.random() * 2 }, p.e.kind));
      // (into a wall: it stops dead and drops)
      if (state.blocks.some(b => solid(b) && !b.oneWay && p.x > b.x && p.x < b.x + b.w && p.y > b.y + 4 && p.y < b.y + b.h)) { p.x -= p.vx; p.vx = -p.vx * 0.2; }
      const floor = p.vy > 0 ? floorUnder(state, p.x, p.y - p.vy - 4) : null;
      if (floor !== null && p.y + 4 >= floor) {
        p.y = floor - 4;
        if (!p.bounced && p.vy > 4) { p.bounced = true; p.vy = -p.vy * 0.3; p.vx *= 0.5; p.vr *= 0.5; }
        else { p.down = true; p.vx = 0; p.vy = 0; p.t = 0; p.rot = Math.round(p.rot / (Math.PI / 2)) * (Math.PI / 2) + (Math.random() - 0.5) * 0.5;
          state.particles.push(kindGore({ pos: { x: p.x, y: floor - 0.5 }, vel: { x: 0, y: 0 }, life: LIE, color: '#7F1D1D', size: 5 + Math.random() * 3, isSplat: true }, p.e.kind)); }
      }
      if (p.y > bottom) return false;
      return true;
    }
    return p.t < LIE;
  });
};

/** The pieces (world space): each one its own bit of the enemy's picture, turned however it's landed. */
/** Each piece, cut out of the picture once into a canvas of its own (at PIECE_RES), then just put down turned: a
 *  turned transform can't come out of the stamp cache, so every piece was the whole enemy painted live, every frame,
 *  clipped (a stunt car flattening a crowd: dozens of them at once, the user's slowdown). */
const PIECE_RES = 2;
const baked = new WeakMap<Piece, { cv: HTMLCanvasElement; x: number; y: number; w: number; h: number }>();
/** One piece of an enemy's picture (`cut`, in its own coordinates: feet at the origin, facing right; mirrored to `face`)
 *  painted the once into a canvas of its own. Put it down with drawImage(cv, x, y, w, h), its origin at the enemy's
 *  feet; turned however (the stamp cache can't take a turned transform: bake, then draw turned). Also the hidden
 *  upgrades' follow-ups' (a kicked-off head: upgrades/followups.ts). */
export type BakedCut = { cv: HTMLCanvasElement; x: number; y: number; w: number; h: number };
export const bakeEnemyCut = (state: GameState, e: Enemy, face: 1 | -1, cut: Cut): BakedCut => {
  let x: number, y: number, w: number, h: number;
  if ('x0' in cut) { const a = cut.x0 * face, b = cut.x1 * face; x = Math.min(a, b); y = cut.y0; w = Math.abs(b - a); h = cut.y1 - cut.y0; }
  else { x = cut.x * face - cut.r; y = cut.y - cut.r; w = h = cut.r * 2; }
  x = Math.floor(x) - 2; y = Math.floor(y) - 2; w = Math.ceil(w) + 4; h = Math.ceil(h) + 4;
  const cv = document.createElement('canvas'); cv.width = Math.max(1, w * PIECE_RES); cv.height = Math.max(1, h * PIECE_RES);
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false; g.scale(PIECE_RES, PIECE_RES); g.translate(-x, -y);
  // (cut out of the picture: in its own coordinates, mirrored the way it faces)
  g.beginPath();
  if ('x0' in cut && cut.poly) cut.poly.forEach(([px, py], i) => (i ? g.lineTo(px * face, py) : g.moveTo(px * face, py)));
  else if ('x0' in cut) { const a = cut.x0 * face, b = cut.x1 * face; g.rect(Math.min(a, b), cut.y0, Math.abs(b - a), cut.y1 - cut.y0); }
  else g.arc(cut.x * face, cut.y, cut.r, 0, Math.PI * 2);
  g.clip();
  drawEnemyAt(g, e, state, 0, 0, 0, face);
  return { cv, x, y, w, h };
};
/** The same, as it looked alive (hurt: flinching, eyes screwed shut), whatever it is now: an animal's dead picture is
 *  lying down or belly up, so a cut by where its parts stand (its head, its long axis) needs this one. */
export const bakeEnemyCutAlive = (state: GameState, e: Enemy, face: 1 | -1, cut: Cut): BakedCut => {
  const hp = e.health, fl = e.hitFlash, blown = e.isBlownAway;
  e.health = Math.max(1, hp); e.hitFlash = 6; e.isBlownAway = false;
  try { return bakeEnemyCut(state, e, face, cut); } finally { e.health = hp; e.hitFlash = fl; e.isBlownAway = blown; }
};
const bakePiece = (p: Piece, state: GameState) => {
  let b = p.bake ?? baked.get(p);
  if (b) return b;
  b = bakeEnemyCut(state, p.e, p.face, p.cut);
  baked.set(p, b);
  return b;
};
export const drawDismember = (c: Ctx, state: GameState) => {
  if (!pieces.length) return;
  // (only the ones in view: a room's worth lying about off the screen isn't drawn)
  const view = viewRectOf(c, 120);
  for (const p of pieces) {
    if (!inView(view, p.x, p.y)) continue;
    const alpha = p.down && p.t > LIE - FADE ? (LIE - p.t) / FADE : 1;
    if (alpha <= 0) continue;
    const b = bakePiece(p, state);
    c.save(); c.globalAlpha = alpha;
    c.translate(p.x, p.y); c.rotate(p.rot); c.translate(-p.cx * p.face, -p.cy);
    c.drawImage(b.cv, b.x, b.y, b.w, b.h);
    c.restore();
  }
};
/** (for tests) */
export const piecesForTests = () => pieces.map(p => `${p.e.kind}:${Math.round(p.x)},${Math.round(p.y)}:${p.down ? 'down' : 'fly'}`);
