// The ELEVATOR TO HELL itself: a closed loop of cars (there's no end of them), each one moving through it the whole
// way, never popping in or out where he can see:
//
//   under   an empty car on its way back underground (in the rock: out of sight), to the foot of the bay's lift
//   lift    up through the hatch in the loading bay's floor, under the platform
//   board   the gate open; the riders file in from the line (out from behind the operator's booth), one by one; the
//           lap bars come down, the gate shuts, the operator's light goes green
//   roll    sideways on its track off the platform, through the tower's wall, to the foot of the shaft
//   wait    there, till the shaft's clear
//   rise    up the UP shaft, slowly (click, clack), the riders nervous
//   top     at the top of it, till the DOWN shaft's clear
//   cross   across at the top, sideways, into the DOWN shaft (two shafts: cars never pass each other in one)
//   hold    a beat at the top of the DOWN shaft (tick, tock; the clock room: held there while the main support's up)
//   drop    free fall down the DOWN shaft; the brakes catch it short of the ride's "hell" under the tower's foot
//   unload  the riders out, off to the gift shop through its door in the far wall
//   return  the empty car off along its track into the tunnel under the bay: under again
//
// Once the tower's last beam is out both shafts are open to the real hell: every car goes down one or the other for good
// (every other one straight back down the UP shaft from its top, the crossing's broken), and new empty ones keep coming
// up the bay's lift from below. Nobody minds.

import type { GameState } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { box, label } from '../section';
import { drawPerson } from '../../adventure/temple/people';
import { GY } from '../geometry';
import { DOCK_X, BOOTH_X, SHU, SHD, B1, CH0, HELL_AT, CAR_TOP, CAR_W, CAR_H, SEATS } from './layout';

type Ctx = CanvasRenderingContext2D;
const INK = '#0C0A09';

export type CarPhase = 'under' | 'lift' | 'board' | 'roll' | 'wait' | 'rise' | 'top' | 'cross' | 'hold' | 'drop' | 'unload' | 'return' | 'plunge';
export interface Rider { seed: number; woman: boolean; boardAt: number }
export interface Car {
  phase: CarPhase; t: number;
  /** Its middle (x), its floor (y). */
  x: number; y: number; vy: number;
  /** Its riders (none: empty). */
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
/** The ride: its cars, all of them somewhere round the loop; whether the top's holding the one there. */
export interface Ride { cars: Car[]; count: number; held: boolean; alt?: boolean }
export const newRide = (): Ride => ({ cars: [], count: 0, held: false });

/** The rise is slow (a tense click-clack crawl he keeps pace with, climbing), the drop's a free fall. */
const RISE = 2, ROLL = 4, LIFT = 1.6, RETURN = 3, CROSS = 2.5;
/** Boarding: one rider after another this far apart (frames), walking this fast from behind the booth to the car. */
const BOARD_EVERY = 34, WALK = 1.8, UNLOAD_EVERY = 26, UNLOAD_WALK = 1.6;
/** Where the riders come from (behind the operator's booth: the front of the line), and where they go out (the gift
 *  shop's door, in the far wall of the ride's "hell"). */
const FROM_X = BOOTH_X + 10, OUT_X = CH0 + 26;
/** Under the bay: the lift's foot (out of sight), and the time a car takes along the tunnel to it. */
const LIFT_FOOT = GY + CAR_H + 60, UNDER_T = 150;
/** The fleet: how many cars there are going round. */
const FLEET = 5;
/** After: how long it's held at the top with the shaft's red lamps going (the tell) before it drops. */
export const LAMP_HOLD = 75;
/** The car in the UP shaft (going up it, at its top, or dropping back down it, after), if there is one. */
export const upCar = (r: Ride) => r.cars.find(c => c.x === SHU && (c.phase === 'rise' || c.phase === 'top' || c.phase === 'drop'));
/** The car in the DOWN shaft (coming across into it, at its top, dropping), or being unloaded under it. */
export const downCar = (r: Ride) => r.cars.find(c => c.phase === 'cross' || c.phase === 'hold' || c.phase === 'unload' || (c.phase === 'drop' && c.x === SHD));
/** The shaft's red lamps: on while a car's held at the top about to drop for good, and while it's coming down. */
export const lampOn = (r: Ride, crashed: boolean) => crashed && r.cars.some(c => !c.crash && (c.phase === 'hold' || (c.phase === 'drop' && c.real)));
/** The operator's light: green while a loaded car's gate is shut at the platform, and as it goes. */
export const readyLight = (r: Ride) => r.cars.some(c => (c.phase === 'board' && boarded(c)) || (c.phase === 'roll' && c.x < SHU - 300));

let seedN = 9000;
const ridersFor = (boarding: boolean): Rider[] => SEATS.map((_, i) => ({ seed: (seedN += 137), woman: (seedN + i) % 5 < 2, boardAt: boarding ? 20 + i * BOARD_EVERY : 0 }));
/** A car already loaded, at a point in the loop (the crash's, the first one up the shaft as he comes in). */
export const loadedCar = (r: Ride, phase: CarPhase, x: number, y: number): Car => {
  r.count++;
  return { phase, t: 0, x, y, vy: 0, riders: ridersFor(false), real: false };
};
const emptyCar = (r: Ride): Car => { r.count++; return { phase: 'under', t: 0, x: DOCK_X, y: LIFT_FOOT, vy: 0, riders: [], real: false }; };

/** Boarding: how long till rider i's sat (frames from the start), and when they're all in, the bars down, the gate shut. */
const seatedAt = (i: number) => 20 + i * BOARD_EVERY + Math.abs(DOCK_X + SEATS[i] - FROM_X) / WALK;
const BOARDED = seatedAt(SEATS.length - 1) + 50;
const boarded = (c: Car) => c.t >= BOARDED;
/** How shut the gate is (0 open .. 1 shut), how far down the lap bars are. */
const gateOf = (c: Car) => (c.phase === 'board' ? Math.max(0, Math.min(1, (c.t - (BOARDED - 30)) / 25)) : c.phase === 'unload' ? Math.max(0, 1 - c.t / 15) : c.phase === 'return' || c.phase === 'under' || c.phase === 'lift' ? 0 : 1);
const barsOf = (c: Car) => (c.phase === 'board' ? Math.max(0, Math.min(1, (c.t - (BOARDED - 50)) / 18)) : c.phase === 'unload' ? Math.max(0, 1 - c.t / 10) : c.riders.length ? 1 : 0);

/** Where rider i of a car is: in their seat, or walking (in, or out), or gone. */
export const riderAt = (c: Car, i: number): { x: number; y: number; state: 'in' | 'walking' | 'gone' } => {
  const seat = c.x + SEATS[i];
  if (c.phase === 'board') {
    const t = c.t - c.riders[i].boardAt;
    if (t < 0) return { x: FROM_X, y: c.y, state: 'gone' };
    const x = FROM_X + Math.sign(seat - FROM_X) * Math.min(Math.abs(seat - FROM_X), t * WALK);
    return { x, y: c.y, state: x === seat ? 'in' : 'walking' };
  }
  if (c.phase === 'unload') {
    const t = c.t - 20 - i * UNLOAD_EVERY;
    if (t < 0) return { x: seat, y: c.y, state: 'in' };
    const x = seat - t * UNLOAD_WALK;
    return { x, y: c.y, state: x < OUT_X - 30 ? 'gone' : 'walking' };
  }
  return { x: seat, y: c.y, state: c.riders.length ? 'in' : 'gone' };
};

export interface RideEvents {
  /** A car's dropping (the fake drop or the real one), where it is. */
  dropped?: (car: Car) => void;
  /** It's past a floor y on its way down (the crash breaks things as it goes). */
  passing?: (car: Car, fromY: number, toY: number) => void;
  /** A car's starting to load. */
  loading?: (car: Car) => void;
}

/** Each frame: the cars round the loop. `crashed`: the brakes are gone (every car goes into the real hell, for good). */
export const runRide = (state: GameState, r: Ride, crashed: boolean, ev: RideEvents) => {
  // (unlimited cars: one more on its way round underground whenever the fleet's short, out of sight)
  if (r.cars.length < FLEET && !r.cars.some(c => c.phase === 'under')) r.cars.push(emptyCar(r));
  const busy = (...ph: CarPhase[]) => r.cars.some(c => ph.includes(c.phase));
  for (const c of [...r.cars]) {
    c.t++;
    const near = Math.abs(state.player.pos.x - c.x) < 900 && Math.abs(state.player.pos.y - c.y) < 700;
    switch (c.phase) {
      case 'under':
        // (along the tunnel under the bay to the foot of the lift; up it once the platform's free)
        if (c.t > UNDER_T && !busy('lift', 'board')) { c.phase = 'lift'; c.t = 0; c.x = DOCK_X; c.y = LIFT_FOOT; if (near) playSound('clang', 0.5, -12); }
        break;
      case 'lift':
        c.y = Math.max(GY, c.y - LIFT);
        if (c.t % 14 === 0 && near) playSound('click', 0.25, -12);
        if (c.y <= GY) { c.phase = 'board'; c.t = 0; c.riders = ridersFor(true); if (near) playSound('thud', 0.5, -8); ev.loading?.(c); }
        break;
      case 'board':
        if (near && c.t === Math.round(BOARDED - 50)) playSound('clang', 0.6, -4);
        if (near && c.t === Math.round(BOARDED - 10)) playSound('slam', 0.5, 4);
        // (off once it's loaded and the foot of the shaft is free)
        if (boarded(c) && !busy('roll', 'wait')) { c.phase = 'roll'; c.t = 0; if (near) playSound('beep', 0.5, 6); }
        break;
      case 'roll':
        c.x = Math.min(SHU, c.x + ROLL);
        if (c.t % 12 === 0 && near) playSound('click', 0.15, -12);
        if (c.x >= SHU) { c.phase = 'wait'; c.t = 0; }
        break;
      case 'wait':
        // (at the foot of the shaft, loaded: up it once the one before has come down past, and been taken off its floor)
        if (!upCar(r)) { c.phase = 'rise'; c.t = 0; if (near) playSound('clang', 0.4, -10); }
        break;
      case 'rise':
        c.y = Math.max(CAR_TOP, c.y - (crashed ? RISE * 2 : RISE));
        // (the chain dog clacking on every link)
        if (c.t % 10 === 0 && near) playSound('click', 0.3, c.t % 20 ? -14 : -8);
        if (c.y <= CAR_TOP) { c.phase = 'top'; c.t = 0; if (near) playSound('ding', 0.7, -18); }
        break;
      case 'top':
        // (after: every other one goes straight back down the UP shaft, the crossing's broken)
        if (crashed && r.alt && !r.held && c.t > LAMP_HOLD) { r.alt = false; c.phase = 'drop'; c.t = 0; c.real = true; if (near) playSound('whoosh', 1, -10); ev.dropped?.(c); }
        else if (!downCar(r) && !(crashed && r.alt)) { c.phase = 'cross'; c.t = 0; if (crashed) r.alt = true; }
        break;
      case 'cross':
        c.x = Math.min(SHD, c.x + CROSS);
        if (c.t % 10 === 0 && near) playSound('click', 0.25, -6);
        if (c.x >= SHD) { c.phase = 'hold'; c.t = 0; }
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
          if (state.frame % 2 === 0) for (const sx of [c.x - 70, c.x + 70]) state.particles.push({ pos: { x: sx, y: c.y - 10 }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 4 }, life: 18, color: Math.random() < 0.5 ? '#FDE047' : '#FB923C', size: 2 });
        }
        c.y += c.vy;
        ev.passing?.(c, from, c.y);
        if (!c.real && c.y >= B1) { c.y = B1; c.vy = 0; c.phase = 'unload'; c.t = 0; c.braked = false; if (near) { playSound('thud', 0.8, -10); playSound('clang', 0.6, -2); } }
        // (into the real hell: gone for good)
        if (c.real && c.y > HELL_AT + 600) r.cars.splice(r.cars.indexOf(c), 1);
        break;
      }
      case 'unload':
        // (the riders out one by one, off to the gift shop; then the empty car away along its track)
        if (c.riders.every((_, i) => riderAt(c, i).state === 'gone')) { c.riders = []; c.phase = 'return'; c.t = 0; c.saidUp = false; c.screamed = false; c.hit = false; }
        break;
      case 'return':
        c.x -= RETURN;
        if (c.t % 12 === 0 && near) playSound('click', 0.15, -12);
        if (c.x < CH0 - CAR_W) { c.phase = 'under'; c.t = 0; }
        break;
      case 'plunge':
        break;
    }
  }
};

/** A rider walking (in from the line, or out to the gift shop): smaller, like the ones in the car. */
export const drawWalkers = (c: Ctx, car: Car, frame: number) => {
  car.riders.forEach((rd, i) => {
    const at = riderAt(car, i);
    if (at.state !== 'walking') return;
    c.save(); c.translate(Math.round(at.x), Math.round(at.y));
    const dir = car.phase === 'unload' ? -1 : 1;
    c.scale(0.75 * dir, 0.75);
    drawPerson(c, { seed: rd.seed, woman: rd.woman, outfit: 'guest', f: frame + i * 9, pose: 'walk', mood: car.phase === 'unload' ? 'happy' : 'bored' });
    c.restore();
  });
};

/** The car (world space; its floor at its y, its middle at its x), with whoever's sat in it: gripping going up, arms
 *  up coming down; the gate (open or shut), the lap bars. */
export const drawCar = (c: Ctx, car: Car, frame: number) => {
  const x = Math.round(car.x), y = Math.round(car.y), l = x - CAR_W / 2, top = y - CAR_H;
  const falling = car.phase === 'drop' || car.phase === 'plunge';
  const tense = car.phase === 'rise' || car.phase === 'hold' || car.phase === 'wait';
  // (a blur coming down: streaks up off it)
  if (falling && car.vy > 9) { c.fillStyle = 'rgba(253,230,138,0.35)'; for (let i = 0; i < 6; i++) c.fillRect(l + 10 + i * 26, top - 30 - car.vy * 5, 3, car.vy * 5); }
  // (the cable up out of it, in the shaft)
  if (tense) box(c, x - 2, top - 3000, 4, 3000, '#27272A');
  // the cage: an old brass elevator car (the ride's look), its back wall, the riders, its gate in front of them
  box(c, l - 1, top - 1, CAR_W + 2, CAR_H + 2, INK); box(c, l, top, CAR_W, CAR_H, '#1C1917');
  box(c, l - 6, top - 14, CAR_W + 12, 16, '#B45309'); box(c, l - 6, top - 14, CAR_W + 12, 3, '#FBBF24');
  box(c, l + CAR_W / 2 - 22, top - 34, 44, 20, '#7F1D1D'); label(c, 'B', x - 10, top - 20, '#FDE68A', 8); label(c, 'HELL', x + 10, top - 20, '#FCA5A5', 6);
  box(c, l - 6, y - 4, CAR_W + 12, 10, '#B45309');
  car.riders.forEach((rd, i) => {
    if (riderAt(car, i).state !== 'in') return;
    c.save();
    c.translate(x + SEATS[i], y - 6 + (falling ? Math.sin(frame * 0.6 + i) * 2 : tense ? Math.sin(frame * 0.9 + i * 2) * 0.6 : 0));
    c.scale(0.75, 0.75);
    drawPerson(c, { seed: rd.seed, woman: rd.woman, outfit: 'guest', f: frame + i * 7, pose: falling ? 'fly' : 'stand', mood: falling ? (car.real ? 'shocked' : 'happy') : tense ? 'scared' : 'happy' });
    c.restore();
  });
  // the lap bar (down over the riders' laps, or up out of the way), the gate (slid shut, or open, bunched at the side)
  const bars = barsOf(car), gate = gateOf(car);
  box(c, l, y - 34 - (1 - bars) * 40, CAR_W, 6, '#92400E');
  const gw = CAR_W * gate;
  for (let gx = l + 4; gx < l + Math.max(14, gw); gx += Math.max(3, 12 * gate)) box(c, gx, top + 40, 3, CAR_H - 44, '#D97706');
  box(c, l, top + 40, CAR_W, 4, '#FBBF24');
  box(c, l - 6, top, 6, CAR_H, '#92400E'); box(c, l + CAR_W, top, 6, CAR_H, '#92400E');
};

export { LIFT_FOOT };
