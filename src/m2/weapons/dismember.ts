// Torn apart: an enemy burst into its pieces, each one cut out of its own picture (so it's that guard's head, that
// tourist's legs), flung off spinning in the carnage, bleeding as it goes, bouncing where it comes down and lying there
// a while. A person: the head, the trunk, both arms, both legs. An animal: the head, the front half, the back half,
// the legs. (The stunt car's: see stuntCar.ts runDown.)

import type { Enemy, Block } from '../../m1/types';
import type { GameState } from '../../m1/game/core/state';
import { CANVAS_HEIGHT } from '../../m1/constants';
import { kindFacing, isHumanoidKind, KIND_HEAD } from '../../m1/game/render/enemies';
import { drawEnemyAt } from '../moves/grab';

type Ctx = CanvasRenderingContext2D;
/** A piece's shape, in the enemy's own picture (feet at the origin, facing right): a circle (its head) or a box. */
type Cut = { circle: true; x: number; y: number; r: number } | { circle: false; x0: number; y0: number; x1: number; y1: number };
interface Piece { e: Enemy; face: 1 | -1; cut: Cut; cx: number; cy: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number; t: number; down: boolean; bounced: boolean }

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

/** Each frame: flying, bleeding; down, a bounce, lying there; and gone. */
export const tickDismember = (state: GameState) => {
  if (!pieces.length) return;
  const bottom = state.camera.y + CANVAS_HEIGHT + 300;
  pieces = pieces.filter(p => {
    p.t++;
    if (!p.down) {
      p.vy = Math.min(16, p.vy + G); p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      // (bleeding as it goes)
      if (p.t % 2 === 0 && state.particles.length < 900) state.particles.push({ pos: { x: p.x, y: p.y }, vel: { x: p.vx * 0.2, y: p.vy * 0.2 }, life: 24, color: p.t % 4 ? '#991B1B' : '#7F1D1D', size: 2 + Math.random() * 2 });
      // (into a wall: it stops dead and drops)
      if (state.blocks.some(b => solid(b) && !b.oneWay && p.x > b.x && p.x < b.x + b.w && p.y > b.y + 4 && p.y < b.y + b.h)) { p.x -= p.vx; p.vx = -p.vx * 0.2; }
      const floor = p.vy > 0 ? floorUnder(state, p.x, p.y - p.vy - 4) : null;
      if (floor !== null && p.y + 4 >= floor) {
        p.y = floor - 4;
        if (!p.bounced && p.vy > 4) { p.bounced = true; p.vy = -p.vy * 0.3; p.vx *= 0.5; p.vr *= 0.5; }
        else { p.down = true; p.vx = 0; p.vy = 0; p.t = 0; p.rot = Math.round(p.rot / (Math.PI / 2)) * (Math.PI / 2) + (Math.random() - 0.5) * 0.5;
          state.particles.push({ pos: { x: p.x, y: floor - 0.5 }, vel: { x: 0, y: 0 }, life: LIE, color: '#7F1D1D', size: 5 + Math.random() * 3, isSplat: true }); }
      }
      if (p.y > bottom) return false;
      return true;
    }
    return p.t < LIE;
  });
};

/** The pieces (world space): each one its own bit of the enemy's picture, turned however it's landed. */
export const drawDismember = (c: Ctx, state: GameState) => {
  for (const p of pieces) {
    const alpha = p.down && p.t > LIE - FADE ? (LIE - p.t) / FADE : 1;
    if (alpha <= 0) continue;
    c.save(); c.globalAlpha = alpha;
    c.translate(p.x, p.y); c.rotate(p.rot); c.translate(-p.cx * p.face, -p.cy);
    // (cut out of the picture: in its own coordinates, mirrored the way it faces)
    c.beginPath();
    const cut = p.cut;
    if ('x0' in cut) { const a = cut.x0 * p.face, b = cut.x1 * p.face; c.rect(Math.min(a, b), cut.y0, Math.abs(b - a), cut.y1 - cut.y0); }
    else c.arc(cut.x * p.face, cut.y, cut.r, 0, Math.PI * 2);
    c.clip();
    drawEnemyAt(c, p.e, state, 0, 0, 0, p.face);
    c.restore();
  }
};
/** (for tests) */
export const piecesForTests = () => pieces.map(p => `${p.e.kind}:${Math.round(p.x)},${Math.round(p.y)}:${p.down ? 'down' : 'fly'}`);
