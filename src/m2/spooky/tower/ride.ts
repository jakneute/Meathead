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

export type CarPhase = 'board' | 'roll' | 'wait' | 'rise' | 'hold' | 'drop' | 'out' | 'plunge';
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
  /** Its riders have said their piece going up already; screamed coming down. */
  saidUp?: boolean; screamed?: boolean;
  /** What came off it's hit him already, this drop. */
  hit?: boolean;
  /** The brakes have caught it (the clank, the sparks). */
  braked?: boolean;
}
/** The ride: its cars (there's no end of them: one in the shaft at a time, the next loaded and waiting at the foot of
 *  it, another boarding at the platform), the time to the next one, whether the top's holding the one there. */
export interface Ride { cars: Car[]; next: number; count: number; held: boolean }
export const newRide = (): Ride => ({ cars: [], next: 60, count: 0, held: false });

/** The rise is slow (a tense click-clack crawl he keeps pace with, climbing), the drop's a free fall. */
const RISE = 2, ROLL = 4;
/** After: how long it's held at the top with the shaft's red lamps going (the tell) before it drops. */
export const LAMP_HOLD = 75;
const inShaft = (c: Car) => c.phase === 'rise' || c.phase === 'hold' || c.phase === 'drop' || c.phase === 'plunge';
/** The car in the shaft (going up, at the top, coming down), if there is one. */
export const shaftCar = (r: Ride) => r.cars.find(inShaft);
/** The shaft's red lamps: on while a car's held at the top about to drop for good, and while it's coming down. */
export const lampOn = (r: Ride, crashed: boolean) => crashed && r.cars.some(c => !c.crash && (c.phase === 'hold' || (c.phase === 'drop' && c.real)));
let seedN = 9000;
export const loadedCar = (r: Ride, phase: CarPhase, x: number, y: number): Car => {
  r.count++;
  const riders: Rider[] = SEATS.map((_, i) => ({ seed: (seedN += 137), woman: (seedN + i) % 5 < 2, boardAt: phase === 'board' ? 18 + i * 26 : 0 }));
  return { phase, t: 0, x, y, vy: 0, riders, real: false };
};

export interface RideEvents {
  /** A car's dropping (the fake drop or the real one), where it is. */
  dropped?: (car: Car) => void;
  /** It's past a floor y on its way down (the crash breaks things as it goes). */
  passing?: (car: Car, fromY: number, toY: number) => void;
  /** A car's starting to load. */
  loading?: (car: Car) => void;
}

/** Each frame: the cars along their way. `crashed`: the brakes are gone (every car goes into the real hell). */
export const runRide = (state: GameState, r: Ride, crashed: boolean, ev: RideEvents) => {
  // (the next one boarding, as soon as the platform and the foot of the shaft are free)
  if (!r.cars.some(c => c.phase === 'board' || c.phase === 'roll' || c.phase === 'wait') && --r.next <= 0) {
    const c = loadedCar(r, 'board', DOCK_X, GY);
    r.cars.push(c); r.next = 60; ev.loading?.(c);
  }
  for (const c of [...r.cars]) {
    c.t++;
    const near = Math.abs(state.player.pos.x - c.x) < 900 && Math.abs(state.player.pos.y - c.y) < 700;
    switch (c.phase) {
      case 'board':
        if (c.t === (crashed ? 90 : 130)) { if (near) playSound('clang', 0.5, -8); c.phase = 'roll'; c.t = 0; }
        break;
      case 'roll':
        c.x = Math.min(SHM, c.x + ROLL);
        if (c.t % 12 === 0 && near) playSound('click', 0.15, -12);
        if (c.x >= SHM) { c.phase = 'wait'; c.t = 0; }
        break;
      case 'wait':
        // (at the foot of the shaft, loaded: up it once the one before has come down past)
        if (!shaftCar(r)) { c.phase = 'rise'; c.t = 0; if (near) playSound('clang', 0.4, -10); }
        break;
      case 'rise':
        c.y = Math.max(CAR_TOP, c.y - (crashed ? RISE * 2 : RISE));
        // (the chain dog clacking on every link)
        if (c.t % 10 === 0 && near) playSound('click', 0.3, c.t % 20 ? -14 : -8);
        if (c.y <= CAR_TOP) { c.phase = 'hold'; c.t = 0; if (near) playSound('ding', 0.7, -18); }
        break;
      case 'hold':
        // (a beat at the top: tick, tock; the clock room's held one waits there for the drop, the last beam still up)
        if (c.t % 30 === 0 && near) playSound('click', 0.4, c.t % 60 ? -6 : 6);
        if (!r.held && c.t > (crashed ? LAMP_HOLD : 70)) { c.phase = 'drop'; c.t = 0; c.real = crashed; if (near) playSound('whoosh', 1, -10); ev.dropped?.(c); }
        break;
      case 'drop': {
        const from = c.y;
        // (free fall; the fake drop's brakes catch it short of the ride's "hell", a level down: a clank, sparks)
        c.vy = Math.min(c.real ? 30 : 28, c.vy + (c.real ? 1.1 : 1.2));
        if (!c.real && c.y > B1 - 420) {
          if (!c.braked) {
            c.braked = true;
            if (near) { playSound('clang', 1, -6); playSound('crunch', 0.5, 6); }
          }
          c.vy = Math.max(3, c.vy * 0.86);
          if (state.frame % 2 === 0) for (const sx of [SHM - 70, SHM + 70]) state.particles.push({ pos: { x: sx, y: c.y - 10 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 4 }, life: 18, color: Math.random() < 0.5 ? '#FDE047' : '#FB923C', size: 2 });
        }
        c.y += c.vy;
        ev.passing?.(c, from, c.y);
        if (!c.real && c.y >= B1) { c.y = B1; c.vy = 0; c.phase = 'out'; c.t = 0; if (near) { playSound('thud', 0.8, -10); playSound('clang', 0.6, -2); } }
        if (c.real && c.y > HELL_AT + 600) r.cars.splice(r.cars.indexOf(c), 1);
        break;
      }
      case 'out':
        // (out sideways, into the ride's hell and on to the gift shop)
        c.x += Math.min(5, c.t * 0.2);
        if (c.t > 90) r.cars.splice(r.cars.indexOf(c), 1);
        break;
      case 'plunge':
        break;
    }
  }
};

/** The car (world space; its floor at its y, its middle at its x), with its riders: sat; arms up on the way down. */
export const drawCar = (c: Ctx, car: Car, frame: number) => {
  const x = Math.round(car.x), y = Math.round(car.y), l = x - CAR_W / 2, top = y - CAR_H;
  const falling = car.phase === 'drop' || car.phase === 'plunge';
  const tense = car.phase === 'rise' || car.phase === 'hold' || car.phase === 'wait';
  // (a blur coming down: streaks up off it)
  if (falling && car.vy > 9) { c.fillStyle = 'rgba(253,230,138,0.35)'; for (let i = 0; i < 6; i++) c.fillRect(l + 10 + i * 26, top - 30 - car.vy * 5, 3, car.vy * 5); }
  // (the cable up out of it, while there's one)
  if (tense) box(c, x - 2, top - 3000, 4, 3000, '#27272A');
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
    drawPerson(c, { seed: rd.seed, woman: rd.woman, outfit: 'guest', f: frame + i * 7, pose: falling ? 'fly' : step > 0 ? 'walk' : 'stand', mood: falling ? (car.real ? 'shocked' : 'happy') : tense ? 'scared' : 'happy' });
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
