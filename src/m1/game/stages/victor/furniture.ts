// The loose furniture round Victor's place (the club's bar stools and VIP tables, the VIP lounge's couches and
// stools, his office's couch, rope posts, chair, desk and what's on it): each its own little body (where it is, how
// it's moving, which way up it is and how fast it's turning) so that Meathead's tsunami can knock it about: shoved
// along the way the wave's going, tumbling, bouncing off the floor and the walls, sliding to a stop, tipping over
// onto a side. It's all for looks: nothing touches it or is touched by it, and it changes nothing about the fight.
// Kept on the game state (state.victorFurniture), put back where it was on every (re)spawn (core/level.ts).

import { ARENA_LEFT, GROUND_Y, TSUNAMI_WAVE_SPEED } from '../../../constants';
import type { GameState } from '../../core/state';
import { tsunamiTop } from '../../bosses/hazards';
import { COURSE } from './course';

export type FurnitureKind = 'stool' | 'table' | 'couch' | 'loungeStool' | 'lairCouch' | 'post' | 'chair' | 'desk' | 'lamp' | 'bucket';
export type FurnitureArea = 'club' | 'lounge' | 'lair';

export interface Furniture {
  kind: FurnitureKind;
  area: FurnitureArea;
  /** Which of its kind (for its look). */
  n: number;
  /** Its box (w x h): it stands on the middle of its bottom edge. */
  w: number; h: number;
  /** How heavy (a stool 1): how hard the wave shoves it, and how much it turns over. */
  mass: number;
  /** The floor's height, and the walls either side of where it can go. */
  floor: number; minX: number; maxX: number;
  /** Where it was (its box's middle), to put it back. */
  homeX: number; homeY: number;
  /** Where its box's middle is, how it's moving, its angle and spin. */
  x: number; y: number; vx: number; vy: number; a: number; va: number;
  /** Up on something (the desk): held there until the wave gets to it. */
  perched: boolean;
  /** The last wave that got it (each wave's first touch is the big shove). */
  wave: number;
}

const piece = (kind: FurnitureKind, area: FurnitureArea, n: number, x: number, floor: number, w: number, h: number, mass: number,
  bounds: { minX: number; maxX: number }, perchedAt?: number): Furniture => {
  const y = (perchedAt ?? floor) - h / 2;
  return { kind, area, n, w, h, mass, floor, ...bounds, homeX: x, homeY: y, x, y, vx: 0, vy: 0, a: 0, va: 0, perched: perchedAt !== undefined, wave: -1 };
};

/** Everything that can be knocked about, where it stands to start with. `arenaRight`: the boss arena's right wall. */
export const createVictorFurniture = (arenaRight: number): Furniture[] => {
  const Y = GROUND_Y, X0 = COURSE.floor.x1, A = COURSE.atrium, L = COURSE.lounge;
  const out: Furniture[] = [];
  // The club. (Each part of the floor's an island in the lava: what's knocked to the edge of one stops there, a
  // stool's width short of going in, so it's all still there to be knocked back the other way.) The dance floor: high
  // tables at the edges of it
  const dance = { minX: X0 + 60, maxX: X0 + 1490 };
  out.push(piece('table', 'club', 0, X0 + 400, Y, 40, 44, 1.6, dance));
  out.push(piece('stool', 'club', 0, X0 + 440, Y, 22, 31, 1, dance));
  out.push(piece('table', 'club', 1, X0 + 1330, Y, 40, 44, 1.6, dance));
  // The bar (it's in a moat of lava): its stools
  const bar = COURSE.solids.find(s => s.look === 'bar');
  const barFloor = { minX: X0 + 1650, maxX: X0 + 2290 };
  if (bar) for (const [i, dx] of [[1, -56], [2, -30], [3, bar.w + 10], [4, bar.w + 36]] as [number, number][]) out.push(piece('stool', 'club', i, bar.x + dx + 11, Y, 22, 31, 1, barFloor));
  // Bottle service: the VIP tables, a stool or two at each (on to the far wall of the atrium)
  const vip = { minX: X0 + 2930, maxX: A.x2 };
  [3010, 3330, 3610].forEach((dx, i) => {
    out.push(piece('table', 'club', 2 + i, X0 + dx, Y, 40, 44, 1.6, vip));
    out.push(piece('stool', 'club', 5 + i * 2, X0 + dx - 34, Y, 22, 31, 1, vip));
    if (i !== 1) out.push(piece('stool', 'club', 6 + i * 2, X0 + dx + 34, Y, 22, 31, 1, vip));
  });
  // The VIP lounge: the couches, stools at the bar
  const lounge = { minX: L.x1, maxX: L.x2 - 10 };
  out.push(piece('couch', 'lounge', 0, L.x1 + 300, L.y, 156, 90, 2.2, lounge));
  out.push(piece('couch', 'lounge', 1, L.x1 + 1130, L.y, 156, 90, 2.2, lounge));
  out.push(piece('loungeStool', 'lounge', 0, L.x1 + 885, L.y, 24, 36, 1, lounge));
  out.push(piece('loungeStool', 'lounge', 1, L.x1 + 1040, L.y, 24, 36, 1, lounge));
  // Victor's office (the boss arena): the couch, the two posts of the velvet rope, his chair, the desk, and the lava
  // lamp and the bucket on it. (Its floor's drawn a little up the back wall: they stand on that.)
  const AL = ARENA_LEFT, AR = arenaRight, AF = GROUND_Y - 14;
  const lair = { minX: AL + 24, maxX: AR - 24 };
  const sx = AL + 40, dx = AR - 250;
  out.push(piece('lairCouch', 'lair', 0, sx + 75, AF, 162, 78, 2.2, lair));
  out.push(piece('post', 'lair', 0, sx + 180, AF, 16, 62, 0.8, lair));
  out.push(piece('post', 'lair', 1, sx + 250, AF, 16, 62, 0.8, lair));
  out.push(piece('chair', 'lair', 0, dx + 123, AF, 58, 136, 1.4, lair));
  out.push(piece('desk', 'lair', 0, dx + 110, AF, 220, 68, 5, lair));
  out.push(piece('lamp', 'lair', 0, dx + 30, AF, 16, 42, 0.6, lair, GROUND_Y - 82));
  out.push(piece('bucket', 'lair', 0, dx + 170, AF, 24, 48, 0.7, lair, GROUND_Y - 82));
  return out;
};

const GRAVITY = 0.5;
/** Its reach either side of the wave's front (as with what the wave hits: see updateTsunami). */
const WAVE_REACH = 110;
const QUARTER = Math.PI / 2;

/** A frame of it: the wave shoving what it's over, and everything falling, sliding, turning and settling. */
export const updateVictorFurniture = (state: GameState, arenaRight: number) => {
  if (!state.victorFurniture.length) state.victorFurniture = createVictorFurniture(arenaRight);
  const wave = state.tsunamiActive ? {
    x: state.tsunamiX, dir: state.tsunamiDir || 1, serial: state.tsunamiSerial ?? 0,
    top: tsunamiTop(state, Math.abs(state.tsunamiX - state.tsunamiStartX)), base: GROUND_Y + (state.tsunamiOffsetY || 0),
  } : null;
  for (const p of state.victorFurniture) {
    const resting = p.vx === 0 && p.vy === 0 && p.va === 0 && !p.perched;
    // The wave: the first touch of each one a shove the way it's going (up and over, set spinning), and then while
    // it's in it, carried along a little and held up by the water
    let wet = false;
    if (wave && Math.abs(p.x - wave.x) < WAVE_REACH && p.floor >= wave.top - 20 && p.floor <= wave.base + 80) {
      wet = true;
      p.perched = false;
      const heft = 1 / Math.sqrt(p.mass), r = hashOf(p, wave.serial);
      if (p.wave !== wave.serial) {
        p.wave = wave.serial;
        p.vx += wave.dir * (3 + r * 3) * heft;
        p.vy = Math.min(p.vy, -(3 + r * 3.5) * heft);
        p.va += wave.dir * (0.1 + r * 0.18) / p.mass;
      }
      p.vx += (wave.dir * TSUNAMI_WAVE_SPEED * 0.45 - p.vx) * 0.03 * heft;
      p.va += wave.dir * 0.006 / p.mass;
    }
    if (p.perched || (resting && !wet)) continue;
    p.vy += wet ? GRAVITY * 0.35 : GRAVITY;
    p.x += p.vx; p.y += p.vy; p.a += p.va;
    // (how far its box reaches down and out from its middle, turned as it is)
    const c = Math.abs(Math.cos(p.a)), s = Math.abs(Math.sin(p.a));
    const down = (p.w / 2) * s + (p.h / 2) * c, side = (p.w / 2) * c + (p.h / 2) * s;
    // The walls: off them, turned by the knock
    // (only a real knock turns it: just leaning on the wall, it settles)
    if (p.x - side < p.minX) { const hit = p.vx < -1; p.x = p.minX + side; p.vx = Math.abs(p.vx) * 0.4; if (hit) p.va = -p.va * 0.5 + 0.04 / p.mass; }
    if (p.x + side > p.maxX) { const hit = p.vx > 1; p.x = p.maxX - side; p.vx = -Math.abs(p.vx) * 0.4; if (hit) p.va = -p.va * 0.5 - 0.04 / p.mass; }
    if (p.y + down >= p.floor) {
      // On the floor: a bounce if it came down hard, then sliding (friction) and settling onto whichever side's
      // nearest down (it tips over onto it, or rocks back up)
      p.y = p.floor - down;
      if (p.vy > 2.5) { p.vy = -p.vy * 0.3; p.va += p.vx * 0.006; }
      else p.vy = 0;
      p.vx *= 0.88;
      const rest = Math.round(p.a / QUARTER) * QUARTER;
      p.va = (p.va + (rest - p.a) * 0.08) * 0.78;
      if (Math.abs(p.vx) < 0.04 && Math.abs(p.va) < 0.002 && Math.abs(rest - p.a) < 0.01 && p.vy === 0) {
        p.vx = 0; p.va = 0; p.a = rest;
        p.y = p.floor - ((p.w / 2) * Math.abs(Math.sin(p.a)) + (p.h / 2) * Math.abs(Math.cos(p.a)));
      }
    } else p.va *= 0.995;
  }
};

/** A number 0..1 for this piece and this wave (so each takes a wave a little differently). */
const hashOf = (p: Furniture, serial: number) => { const s = Math.sin((p.homeX * 0.013 + p.n * 7.1 + serial * 3.7) * 127.1) * 43758.5453; return s - Math.floor(s); };

/** Draws `draw` where the piece is, turned as it is: in `draw`, (0, 0) is the middle of its bottom edge, up is -y. */
export const placed = (ctx: CanvasRenderingContext2D, p: Furniture, draw: () => void) => {
  ctx.save();
  ctx.translate(Math.round(p.x), Math.round(p.y));
  if (p.a) ctx.rotate(p.a);
  ctx.translate(0, Math.round(p.h / 2));
  draw();
  ctx.restore();
};

/** Where it all starts, for drawing before the first frame's made it (by the arena's right wall). */
const homes = new Map<number, Furniture[]>();
/** The pieces in one part of the place (of one kind, if given): as they are, or where they start if they aren't yet. */
export const furnitureIn = (state: GameState | undefined, area: FurnitureArea, kind?: FurnitureKind, arenaRight = 0) => {
  let all = state?.victorFurniture;
  if (!all?.length) { all = homes.get(arenaRight); if (!all) { all = createVictorFurniture(arenaRight); homes.set(arenaRight, all); } }
  return all.filter(p => p.area === area && (!kind || p.kind === kind));
};
