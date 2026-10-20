// The three trains, as things stand on: where each car is (along its track, at its depth about the eye: through a
// loop the cars stay a car's length of track apart, not stretched), the roof's height under any x, who's on which,
// which is above or below which. Shared by the ride (ride.ts) and the drawing (art.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { TL, CAR, AWAY, type Lane } from './layout';
import { trackPt, proj, spinAt, type Pt } from './track';
import type { Tragons, Train, Car } from './state';

/** Anything with a box. */
interface Boxed { pos: { x: number; y: number }; width: number; height: number; vel: { x: number; y: number } }

/** A train's blocks: the roof (a jump-through under him: the dragon's back, lit along its top), its head (a wall over
 *  the front: the dragon's neck and head) and its tail (a low wall at the back: its tail curled up). */
export const makeTrainBlocks = (state: GameState) => {
  const roof: Block = { x: 0, y: AWAY, w: TL, h: 16, type: 'platform', oneWay: true, hidden: true, tag: 'tragon-roof' } as Block;
  const head: Block = { x: 0, y: AWAY, w: 16, h: 46, type: 'wall', hidden: true, tag: 'tragon-head' } as Block;
  const tail: Block = { x: 0, y: AWAY, w: 12, h: 24, type: 'wall', hidden: true, tag: 'tragon-tail' } as Block;
  state.blocks.push(roof, head, tail);
  return { roof, head, tail };
};

const P: Pt = { x: 0, y: 0, d: 1, roll: 0 }, Q: Pt = { x: 0, y: 0, d: 1, roll: 0 };

/** A car at track position s on lane: its roof's middle as drawn, its heading, depth and roll. */
export const carAt = (t: Tragons, lane: Lane, s: number): Car => {
  trackPt(t.spins, t.dist, lane, s - 4, P); const a = proj(t.eye, P.x, P.y, P.d);
  trackPt(t.spins, t.dist, lane, s + 4, Q); const b = proj(t.eye, Q.x, Q.y, Q.d);
  trackPt(t.spins, t.dist, lane, s, P); const m = proj(t.eye, P.x, P.y, P.d);
  return { x: m.x, y: m.y, a: Math.atan2(b.y - a.y, b.x - a.x), d: P.d, roll: P.roll, s };
};

/** Lays a train's cars out where they are now (rear first): the front one's middle half a car back from its nose,
 *  each next a car's length of track (as it's laid, not as the crow flies) behind it. */
export const layCars = (t: Tragons, tr: Train) => {
  const ss: number[] = [];
  let s = t.dist + TL - CAR / 2;
  ss.push(s);
  trackPt(t.spins, t.dist, tr.lane, s, P);
  let px = P.x, py = P.y;
  for (let i = 1; i < 3; i++) {
    let acc = 0;
    while (acc < CAR) { s -= 5; trackPt(t.spins, t.dist, tr.lane, s, Q); acc += Math.hypot(Q.x - px, Q.y - py); px = Q.x; py = Q.y; }
    ss.push(s);
  }
  tr.cars = ss.reverse().map(q => carAt(t, tr.lane, q));
};

/** A car's two ends along its roof (rear, front). */
const ends = (c: Car) => {
  const h = (CAR / 2) * c.d, dx = Math.cos(c.a) * h, dy = Math.sin(c.a) * h;
  return [c.x - dx, c.y - dy, c.x + dx, c.y + dy] as const;
};
/** A car that's still the right way up to stand on (not gone up into a loop or rolled over). */
const flat = (c: Car) => Math.abs(c.a) < 1.0 && Math.cos(c.roll) > 0.5;
/** The cars of a train that can be stood on: from its rear, up to the first that's gone up into a loop. */
const flats = (tr: Train) => { const n = tr.cars.findIndex(c => !flat(c)); return n < 0 ? tr.cars : tr.cars.slice(0, Math.max(1, n)); };
/** A train's roof's extent (x) as it's drawn now (what of it can be stood on). */
export const roofSpan = (tr: Train) => {
  const cs = flats(tr);
  if (!cs.length) return { x0: 0, x1: 0 };
  return { x0: ends(cs[0])[0], x1: Math.max(ends(cs[0])[0] + 20, ends(cs[cs.length - 1])[2]) };
};
/** The roof's height (world y) under x: along whichever car's over it (between two cars, from one's end to the
 *  next's; past either end, that end's). */
export const roofAt = (tr: Train, x: number) => {
  let last: readonly number[] | null = null;
  for (const c of flats(tr)) {
    const e = ends(c);
    if (x <= e[0]) {
      if (!last) return e[1];
      const u = (x - last[2]) / Math.max(1, e[0] - last[2]);
      return last[3] + (e[1] - last[3]) * Math.max(0, Math.min(1, u));
    }
    if (x <= e[2]) return e[1] + ((e[3] - e[1]) * (x - e[0])) / Math.max(1, e[2] - e[0]);
    last = e;
  }
  return last ? last[3] : AWAY;
};
/** The car under x (the nearest), and how far along the train that is (0 rear .. 1 front). */
export const carUnder = (tr: Train, x: number) => {
  const cs = flats(tr);
  let i = cs.length - 1, k = 1;
  for (let n = 0; n < cs.length; n++) {
    const e = ends(cs[n]);
    if (x <= e[2] || n === cs.length - 1) { i = n; k = Math.max(0, Math.min(1, (x - e[0]) / Math.max(1, e[2] - e[0]))); break; }
  }
  return { car: tr.cars[i], u: Math.max(0, Math.min(1, (i + k) / 3)) };
};
/** Where along the train u (0..1) is, on its roof, as drawn: the point, the car it's on. */
export const alongTrain = (tr: Train, u: number) => {
  const k = Math.max(0, Math.min(2.999, u * 3)), i = Math.floor(k), c = tr.cars[i], f = (k - i - 0.5) * CAR * c.d;
  return { x: c.x + Math.cos(c.a) * f, y: c.y + Math.sin(c.a) * f, car: c };
};

/** Is the train spun (a loop, corkscrew, braid) anywhere along it? Its car at u? */
export const trainSpun = (t: Tragons, tr: Train) => tr.cars.some(c => !!spinAt(t.spins, tr.lane, c.s));
export const carSpun = (t: Tragons, tr: Train, u: number) => { const c = tr.cars[Math.min(2, Math.floor(Math.max(0, u) * 3))]; return !!c && !!spinAt(t.spins, tr.lane, c.s); };

/** Stood on this train (his feet on its roof, over it). */
export const standsOn = (o: Boxed, t: Tragons, tr: Train, slack = 4) => {
  if (tr.phase !== 'ok' || !tr.cars.length) return false;
  const cx = o.pos.x + o.width / 2, feet = o.pos.y + o.height, { x0, x1 } = roofSpan(tr);
  return cx >= x0 - 4 && cx <= x1 + 4 && Math.abs(feet - roofAt(tr, cx)) <= slack && o.vel.y >= -0.01;
};
/** Which train somebody's stood on (null: none). */
export const trainUnder = (o: Boxed, t: Tragons, slack = 4) => t.trains.find(tr => standsOn(o, t, tr, slack)) ?? null;

/** Over a train (his middle within its length). */
export const overTrains = (o: Boxed, t: Tragons) => {
  const cx = o.pos.x + o.width / 2;
  return t.trains.some(tr => { if (tr.phase !== 'ok') return false; const { x0, x1 } = roofSpan(tr); return cx >= x0 - 20 && cx <= x1 + 20; });
};

/** The train above (dir -1) or below (+1) a height at x, the nearest that's there to land on (whole, not spun where
 *  he'd land: no hopping into a loop) (null: none). */
export const trainBeyond = (t: Tragons, fromY: number, x: number, dir: -1 | 1, not?: Lane) => {
  let best: Train | null = null, bestY = 0;
  for (const tr of t.trains) {
    if (tr.phase !== 'ok' || tr.lane === not || trainSpun(t, tr)) continue;
    const { x0, x1 } = roofSpan(tr), y = roofAt(tr, Math.max(x0 + 20, Math.min(x1 - 30, x)));
    const d = (y - fromY) * dir;
    if (d < 30) continue;
    if (!best || (y - fromY) * dir < (bestY - fromY) * dir) { best = tr; bestY = y; }
  }
  return best;
};

/** Wrapping round (the user's: up off the top one lands on the bottom one, down off the bottom on the top): the
 *  farthest train the other way that can be landed on (null: none). */
export const trainWrap = (t: Tragons, fromY: number, x: number, dir: -1 | 1, not?: Lane) => {
  let best: Train | null = null, bestD = 0;
  for (const tr of t.trains) {
    if (tr.phase !== 'ok' || tr.lane === not || trainSpun(t, tr)) continue;
    const { x0, x1 } = roofSpan(tr), y = roofAt(tr, Math.max(x0 + 20, Math.min(x1 - 30, x)));
    const d = (fromY - y) * dir;
    if (d < 30) continue;
    if (!best || d > bestD) { best = tr; bestD = d; }
  }
  return best;
};
/** Where a hop that way takes him: the next one that way, or round to the far end. */
export const hopTarget = (t: Tragons, fromY: number, x: number, dir: -1 | 1, not?: Lane) => {
  const next = trainBeyond(t, fromY, x, dir, not);
  return next ? { tr: next, wrap: false } : (() => { const w = trainWrap(t, fromY, x, dir, not); return w ? { tr: w, wrap: true } : null; })();
};

/** A lane's train. */
export const trainOn = (t: Tragons, lane: Lane) => t.trains[lane];
