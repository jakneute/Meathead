// The ELEVATOR TO HELL itself: a car at a time (there's no end of them), boarded at the platform in the loading bay,
// rolled into the foot of the clock tower, up its shaft (behind him as he climbs), held at the top a moment (the
// clock ticking), dropped: the fake drop, down past the foot of the tower to the ride's "hell" a level under it (the
// brakes catching it), out sideways to the gift shop. Once the tower's last beam is out the brakes don't catch it: it
// goes through the floor into the real hell, and every car after it does the same. Nobody minds.

import type { GameState } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { box, label } from '../section';
import { drawPerson } from '../../adventure/temple/people';
import { GY } from '../geometry';
import { DOCK_X, PLATFORM_X0, SHM, B1, HELL_AT, CAR_TOP, CAR_W, CAR_H, SEATS } from './layout';

type Ctx = CanvasRenderingContext2D;

export type CarPhase = 'board' | 'roll' | 'rise' | 'hold' | 'drop' | 'out' | 'plunge';
export interface Rider { seed: number; woman: boolean; boardAt: number }
export interface Car {
  phase: CarPhase; t: number;
  /** Its middle (x), its floor (y). */
  x: number; y: number; vy: number;
  riders: Rider[];
  /** It's going all the way down (the brakes are gone). */
  real: boolean;
  /** The first time through the floor (the crash): it smashes what's in its way on the way down. */
  crash?: boolean;
  /** Screamed this drop already. */
  screamed?: boolean;
}
export interface Ride { car: Car | null; next: number; count: number; held: boolean }
export const newRide = (): Ride => ({ car: null, next: 60, count: 0, held: false });

const RISE = 3, ROLL = 4;
let seedN = 9000;
const newCar = (r: Ride): Car => {
  r.count++;
  const riders: Rider[] = SEATS.map((_, i) => ({ seed: (seedN += 137), woman: (seedN + i) % 5 < 2, boardAt: 18 + i * 26 }));
  return { phase: 'board', t: 0, x: DOCK_X, y: GY, vy: 0, riders, real: false };
};

export interface RideEvents {
  /** A car's dropping (the fake drop or the real one), where it is. */
  dropped?: (car: Car) => void;
  /** It's past a floor y on its way down (the crash breaks things as it goes). */
  passing?: (car: Car, fromY: number, toY: number) => void;
  /** A car's starting to load. */
  loading?: (car: Car) => void;
}

/** Each frame: the car along its way. `crashed`: the brakes are gone (every car goes into the real hell). */
export const runRide = (state: GameState, r: Ride, crashed: boolean, ev: RideEvents) => {
  if (!r.car) {
    if (--r.next > 0) return;
    r.car = newCar(r); ev.loading?.(r.car);
  }
  const c = r.car;
  c.t++;
  const near = Math.abs(state.player.pos.x - c.x) < 900 && Math.abs(state.player.pos.y - c.y) < 700;
  switch (c.phase) {
    case 'board':
      if (c.t === 150) { if (near) playSound('clang', 0.5, -8); c.phase = 'roll'; c.t = 0; }
      break;
    case 'roll':
      c.x = Math.min(SHM, c.x + ROLL);
      if (c.t % 12 === 0 && near) playSound('click', 0.15, -12);
      if (c.x >= SHM) { c.phase = 'rise'; c.t = 0; }
      break;
    case 'rise':
      c.y = Math.max(CAR_TOP, c.y - RISE);
      if (c.t % 15 === 0 && near) playSound('click', 0.2, -14);
      if (c.y <= CAR_TOP) { c.phase = 'hold'; c.t = 0; if (near) playSound('ding', 0.7, -18); }
      break;
    case 'hold':
      // (tick, tock; the clock room's held one there for the drop, the last beam still up: it waits)
      if (c.t % 30 === 0 && near) playSound('click', 0.4, c.t % 60 ? -6 : 6);
      if (!r.held && c.t > 100) { c.phase = 'drop'; c.t = 0; c.real = crashed; ev.dropped?.(c); }
      break;
    case 'drop': {
      const from = c.y;
      c.vy = Math.min(c.real ? 30 : 24, c.vy + (c.real ? 1.1 : 0.9));
      // (the fake drop: the brakes catch it short of the ride's "hell", a level down)
      if (!c.real && c.y > B1 - 700) c.vy = Math.max(3, c.vy * 0.9);
      c.y += c.vy;
      ev.passing?.(c, from, c.y);
      if (!c.real && c.y >= B1) { c.y = B1; c.vy = 0; c.phase = 'out'; c.t = 0; playSound('thud', near ? 0.8 : 0, -10); }
      if (c.real && c.y > HELL_AT + 600) { r.car = null; r.next = 240; }
      break;
    }
    case 'out':
      // (out sideways, into the ride's hell and on to the gift shop)
      c.x += Math.min(5, c.t * 0.2);
      if (c.t > 90) { r.car = null; r.next = 120; }
      break;
    case 'plunge':
      break;
  }
};

/** The car (world space; its floor at its y, its middle at its x), with its riders: sat; arms up on the way down. */
export const drawCar = (c: Ctx, car: Car, frame: number) => {
  const x = Math.round(car.x), y = Math.round(car.y), l = x - CAR_W / 2, top = y - CAR_H;
  const falling = car.phase === 'drop' || car.phase === 'plunge';
  // (the cable up out of it, while there's one)
  if (car.phase === 'rise' || car.phase === 'hold') box(c, x - 2, top - 3000, 4, 3000, '#27272A');
  // the cage: an old brass elevator car (the ride's look), its back wall, the riders, its gate in front of them
  box(c, l, top, CAR_W, CAR_H, '#1C1917');
  box(c, l - 6, top - 14, CAR_W + 12, 16, '#B45309'); box(c, l - 6, top - 14, CAR_W + 12, 3, '#FBBF24');
  box(c, l + CAR_W / 2 - 22, top - 34, 44, 20, '#7F1D1D'); label(c, 'B', x - 10, top - 20, '#FDE68A', 8); label(c, 'HELL', x + 10, top - 20, '#FCA5A5', 6);
  box(c, l - 6, y - 4, CAR_W + 12, 10, '#B45309');
  car.riders.forEach((rd, i) => {
    if (car.phase === 'board' && car.t < rd.boardAt) return;
    // (just stepped in: still walking the last of it)
    const step = car.phase === 'board' ? Math.max(0, 1 - (car.t - rd.boardAt) / 20) : 0;
    c.save();
    c.translate(x + SEATS[i] - step * 60, y - 6 + (falling ? Math.sin(frame * 0.6 + i) * 2 : 0));
    c.scale(0.75, 0.75);
    drawPerson(c, { seed: rd.seed, woman: rd.woman, outfit: 'guest', f: frame + i * 7, pose: falling ? 'fly' : step > 0 ? 'walk' : 'stand', mood: falling ? (car.real ? 'shocked' : 'happy') : 'happy' });
    c.restore();
  });
  // the gate: brass bars, a lap bar
  for (let gx = l + 4; gx < l + CAR_W; gx += 12) box(c, gx, top + 40, 3, CAR_H - 44, '#D97706');
  box(c, l, top + 40, CAR_W, 4, '#FBBF24'); box(c, l, y - 34, CAR_W, 6, '#92400E');
  box(c, l - 6, top, 6, CAR_H, '#92400E'); box(c, l + CAR_W, top, 6, CAR_H, '#92400E');
};

/** The riders who'll be in the car (the ones in line): at the platform, by the car, before they're in. */
export const boardingAt = (car: Car) => car.phase === 'board' ? car.riders.filter(r => car.t < r.boardAt).length : 0;
export { PLATFORM_X0 };
