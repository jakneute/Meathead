// The train, laid out: its cars from the caboose (left) to the engine (right), what's in and on each, where Tucker cuts
// cars loose, the checkpoints, and what comes by (low bridges, water towers, tunnels, the robbers riding up), each set
// off by where he is along the train. Teach, then escalate: every hazard alone first (the first uncoupling on an empty
// flatcar, the first low bridge over an empty hopper, the first tunnel while he's inside, the first robber alone, the
// first water tower over a coach), then together (a cut with a brakeman on it, a cut with a bridge coming, a quick cut
// in a tunnel; tunnels longer and closer together toward the front; the stack's cinders over the last cars).
//
// The train stands still in the world (x); the world goes by it (the scenery, the ties, whatever's coming). The cars'
// floors meet over the couplings (a plate across: no falling between cars) until a coupling's cut.

import { GY, SECTIONS } from '../geometry';

const { x0 } = SECTIONS.train;

/** The cars' floors (decks), the roofs of the cars he can go into (their top) and their ceilings (inside). */
export const DECK = GY - 34;
export const ROOF = GY - 138;
export const CEIL = GY - 130;
/** Between two cars' bodies (the coupling; the floors' plates meet in the middle of it). */
export const COUPLER = 40;
/** The open platform at each end of a car (a vestibule, a porch), before its body. */
export const END = 26;
/** How fast the world goes by at speed (px a frame), and while he's running for the caboose (the train on the grade). */
export const V_FULL = 9;
export const V_INTRO = 3;

export type CarKind = 'caboose' | 'coach' | 'diner' | 'baggage' | 'cattle' | 'boxcar' | 'flat' | 'hopper' | 'tank' | 'tender' | 'engine';
/** Cars he goes into (a floor and a roof over it); the rest he crosses on top. */
export const ENTERABLE: CarKind[] = ['caboose', 'coach', 'diner', 'baggage', 'cattle'];
/** The top of a car he can't go into (what he stands on crossing it). */
export const TOP: Partial<Record<CarKind, number>> = { boxcar: ROOF, flat: GY - 100, hopper: GY - 112, tank: GY - 104, tender: GY - 100 };

export type FoeKind = 'porter' | 'brakeman' | 'cook' | 'passenger' | 'steer' | 'fireman';
/** Somebody on a car: who, x from the car's left end, inside (on the floor) or on top. */
export type Foe = [FoeKind, number, 'in' | 'top'];

export interface CarDef {
  kind: CarKind; len: number;
  foes?: Foe[];
  /** A checkpoint at its back end: number, name. */
  cp?: [number, string];
  /** Tucker cuts it loose (and everything behind it) once he's this far along it (0..1); `tell` frames of warning. */
  cut?: { at: number; tell: number };
  /** Crates in a baggage car (solid, to hop): x from its left end. */
  crates?: number[];
}

const C = (kind: CarKind, len: number, more: Partial<CarDef> = {}): CarDef => ({ kind, len, ...more });

export const CARS: CarDef[] = [
  /* 0 */ C('caboose', 300, { cp: [10, 'THE CABOOSE'] }),
  /* 1 */ C('boxcar', 340),
  /* 2 */ C('flat', 360, { cut: { at: 0.3, tell: 120 } }),
  /* 3 */ C('coach', 400, { cp: [11, 'THE COACHES'], foes: [['passenger', 160, 'in'], ['passenger', 300, 'in']] }),
  /* 4 */ C('coach', 400, { foes: [['passenger', 150, 'in'], ['porter', 310, 'in']] }),
  /* 5 */ C('boxcar', 340, { foes: [['brakeman', 230, 'top']] }),
  /* 6 */ C('hopper', 320),
  /* 7 */ C('baggage', 420, { cp: [12, 'THE BAGGAGE CAR'], foes: [['porter', 340, 'in']], crates: [140, 230] }),
  /* 8 */ C('cattle', 380, { foes: [['steer', 260, 'in']] }),
  /* 9 */ C('flat', 360, { cut: { at: 0.3, tell: 110 }, foes: [['brakeman', 240, 'top']] }),
  /* 10 */ C('diner', 440, { cp: [13, 'THE DINING CAR'], foes: [['passenger', 150, 'in'], ['cook', 380, 'in']] }),
  /* 11 */ C('coach', 400, { foes: [['passenger', 200, 'in'], ['passenger', 310, 'in']] }),
  /* 12 */ C('tank', 340, { foes: [['brakeman', 210, 'top']] }),
  /* 13 */ C('coach', 400, { cp: [14, 'THE WATER TOWER'], foes: [['porter', 290, 'in']] }),
  /* 14 */ C('boxcar', 340, { foes: [['brakeman', 130, 'top'], ['brakeman', 270, 'top']] }),
  /* 15 */ C('flat', 360, { cut: { at: 0.25, tell: 100 } }),
  /* 16 */ C('cattle', 380, { foes: [['steer', 170, 'in'], ['steer', 300, 'in']] }),
  /* 17 */ C('baggage', 420, { cp: [15, 'THE MAIL CAR'], foes: [['porter', 210, 'in'], ['porter', 370, 'in']], crates: [110, 290] }),
  /* 18 */ C('hopper', 320),
  /* 19 */ C('diner', 440, { foes: [['passenger', 150, 'in'], ['passenger', 250, 'in'], ['cook', 390, 'in']] }),
  /* 20 */ C('tank', 340, { cut: { at: 0.15, tell: 80 }, foes: [['brakeman', 240, 'top']] }),
  /* 21 */ C('coach', 400, { cp: [16, 'THE LAST COACH'], foes: [['passenger', 160, 'in'], ['porter', 330, 'in']] }),
  /* 22 */ C('boxcar', 340, { foes: [['brakeman', 250, 'top']] }),
  /* 23 */ C('flat', 360, { cp: [17, 'THE LOG CAR'] }),
  /* 24 */ C('tender', 260, { cp: [18, 'THE ENGINE'], foes: [['fireman', 160, 'top']] }),
  /* 25 */ C('engine', 360),
];
export const TENDER = 24, ENGINE = 25;

/** Where the caboose starts (its back end): room behind it for the run up, and for cut cars to fall back. */
export const REAR_X = x0 + 1000;
/** Each car's left end (world x). */
export const CAR_X: number[] = (() => { const out: number[] = []; let x = REAR_X; for (const c of CARS) { out.push(x); x += c.len + COUPLER; } return out; })();
export const carRight = (i: number) => CAR_X[i] + CARS[i].len;
/** x along car i, `f` 0..1 of its length. */
export const along = (i: number, f: number) => CAR_X[i] + CARS[i].len * f;

/** The cab: Tucker leaning out of its window (his feet, the sill, the window's span). */
export const CAB = { x: CAR_X[ENGINE], feet: GY - 50, sill: GY - 92, win: [CAR_X[ENGINE] + 16, CAR_X[ENGINE] + 70] as const };
/** Back into the train from the town (the tender's front end, on its deck). */
export const TRAIN_END = { x: carRight(TENDER) - 14, y: DECK };

export const CHECKPOINTS = CARS.flatMap((c, i) => (c.cp ? [{ name: c.cp[1], cp: c.cp[0], x: CAR_X[i] + 14, y: DECK }] : []));

/** What comes by, set off once by him getting this far (car, fraction along it). */
export type EventKind = 'bridge' | 'tower' | 'tunnel' | 'robbers';
export interface TrainEvent { at: [number, number]; kind: EventKind; len?: number; n?: number }
export const EVENTS: TrainEvent[] = [
  { at: [1, 0.05], kind: 'bridge' },
  { at: [7, 0.1], kind: 'tunnel', len: 1400 },
  { at: [11, 0.05], kind: 'robbers', n: 1 },
  { at: [12, 0.5], kind: 'robbers', n: 2 },
  { at: [13, 0.2], kind: 'tower' },
  { at: [14, 0.45], kind: 'bridge' },
  { at: [15, 0.3], kind: 'bridge' },
  { at: [16, 0.2], kind: 'tunnel', len: 2200 },
  { at: [18, 0.05], kind: 'robbers', n: 2 },
  { at: [19, 0.1], kind: 'tunnel', len: 3200 },
  { at: [20, 0.05], kind: 'tunnel', len: 2600 },
  { at: [21, 0.45], kind: 'tower' },
  { at: [22, 0.05], kind: 'robbers', n: 2 },
  { at: [22, 0.35], kind: 'bridge' },
  { at: [23, 0.3], kind: 'tunnel', len: 3000 },
];
export const eventX = (ev: TrainEvent) => along(ev.at[0], ev.at[1]);
/** From here on the stack's cinders come down over the cars. */
export const CINDERS_FROM = CAR_X[22];

/** Pickups (lean: small ones): [car, x along it, what]. On the floor. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [7, 60, 'small_ammo'],
  [10, 260, 'small_health'],
  [17, 60, 'small_ammo'],
  [21, 60, 'small_health'],
  [24, 30, 'small_health'],
];
