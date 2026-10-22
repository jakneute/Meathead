// The train, laid out: its cars from the caboose (left) to the engine (right), what's in and on each, where Tucker cuts
// cars loose, the checkpoints, and what comes by (low bridges, water towers, tunnels, the waterfalls, the grades, the
// robbers riding up), each set off by where he is along the train. Teach, then escalate: every hazard alone first (the
// first uncoupling on an empty flatcar, the first low bridge over an empty boxcar, the first tunnel while he's inside,
// the first waterfall with a dining car to duck into, the first robber alone, the first water tower over a coach), then
// together (a cut with a brakeman on it, a cut with a bridge coming, a quick cut in a tunnel, the long waterfall over
// the open cars; tunnels and grades longer, steeper and closer together toward the front; the stack's cinders over the
// last cars).
//
// The playtest's: the cars are BIG (the user: "a lot bigger... allow me to actually platform inside"): the cars he goes
// into are 300 tall inside (racks, bunks, shelves, tables, crates and a hayloft to climb), their roofs up where it takes
// the steps on the car ends to get to; the camera pulled back to fit them (index.ts ZOOM).
//
// The train stands still in the world (x); the world goes by it (the scenery, the ties, whatever's coming). The cars'
// floors meet over the couplings (a plate across: no falling between cars) until a coupling's cut.

import { GY, SECTIONS } from '../geometry';

const { x0 } = SECTIONS.train;

/** The rails' top (the wheels sit on it). */
export const RAIL = GY - 7;
/** The cars' floors (decks), the ceilings inside the cars he can go into and their roofs (their top, to stand on). */
export const DECK = GY - 64;
export const CEIL = DECK - 300;
export const ROOF = CEIL - 12;
/** Between two cars' bodies (the coupling; the floors' plates meet in the middle of it). */
export const COUPLER = 52;
/** The open platform at each end of a car (a vestibule, a porch), before its body. */
export const END = 46;
/** How fast the world goes by at speed (px a frame), and while he's running for the caboose (the train on the grade). */
export const V_FULL = 9;
export const V_INTRO = 3;

export type CarKind = 'caboose' | 'coach' | 'diner' | 'baggage' | 'cattle' | 'boxcar' | 'flat' | 'hopper' | 'tank' | 'tender' | 'engine';
/** Cars he goes into (a floor and a roof over it); the rest he crosses on top. */
export const ENTERABLE: CarKind[] = ['caboose', 'coach', 'diner', 'baggage', 'cattle'];
/** The top of a car he can't go into (what he stands on crossing it). */
export const TOP: Partial<Record<CarKind, number>> = { boxcar: ROOF, flat: DECK - 132, hopper: DECK - 230, tank: DECK - 206, tender: DECK - 70 };

export type FoeKind = 'porter' | 'brakeman' | 'cook' | 'passenger' | 'steer' | 'fireman';
/** Somebody on a car: who, x from the car's left end, inside (on the floor) or on top; inside, perched up on one of
 *  the car's fittings that high over the deck (a rack, a shelf: a porter lobbing suitcases down from it). */
export type Foe = [FoeKind, number, 'in' | 'top', number?];

export interface CarDef {
  kind: CarKind; len: number;
  foes?: Foe[];
  /** A checkpoint at its back end: number, name. */
  cp?: [number, string];
  /** Tucker cuts it loose (and everything behind it) once he's this far along it (0..1); `tell` frames of warning. */
  cut?: { at: number; tell: number };
}

const C = (kind: CarKind, len: number, more: Partial<CarDef> = {}): CarDef => ({ kind, len, ...more });

export const CARS: CarDef[] = [
  /* 0 */ C('caboose', 440, { cp: [10, 'THE CABOOSE'] }),
  /* 1 */ C('boxcar', 520),
  /* 2 */ C('flat', 520, { cut: { at: 0.3, tell: 120 } }),
  /* 3 */ C('coach', 620, { cp: [11, 'THE COACHES'], foes: [['passenger', 170, 'in'], ['porter', 300, 'in'], ['passenger', 440, 'in']] }),
  /* 4 */ C('hopper', 460, { foes: [['brakeman', 260, 'top']] }),
  /* 5 */ C('baggage', 620, { cp: [12, 'THE BAGGAGE CAR'], foes: [['porter', 300, 'in']] }),
  /* 6 */ C('cattle', 580, { foes: [['steer', 260, 'in']] }),
  /* 7 */ C('flat', 520, { cut: { at: 0.3, tell: 110 }, foes: [['brakeman', 330, 'top']] }),
  /* 8 */ C('diner', 660, { cp: [13, 'THE DINING CAR'], foes: [['passenger', 160, 'in'], ['cook', 420, 'in']] }),
  // (the encounter pass: a porter up on the coach's high rack over the passenger coming at him (aim up, or climb))
  /* 9 */ C('coach', 620, { foes: [['porter', 275, 'in', 222], ['passenger', 400, 'in']] }),
  /* 10 */ C('tank', 480, { foes: [['brakeman', 350, 'top']] }),
  /* 11 */ C('coach', 620, { cp: [14, 'THE WATER TOWER'], foes: [['porter', 330, 'in']] }),
  /* 12 */ C('flat', 520, { cut: { at: 0.25, tell: 100 } }),
  /* 13 */ C('cattle', 580, { foes: [['steer', 180, 'in'], ['steer', 360, 'in']] }),
  // (the second porter up on the high shelf (he stood inside the checkpoint's reach), lobbing down over the first)
  /* 14 */ C('baggage', 620, { cp: [15, 'THE MAIL CAR'], foes: [['porter', 200, 'in'], ['porter', 450, 'in', 250]] }),
  /* 15 */ C('hopper', 460),
  /* 16 */ C('diner', 660, { foes: [['passenger', 160, 'in'], ['passenger', 290, 'in'], ['cook', 420, 'in']] }),
  /* 17 */ C('tank', 480, { cut: { at: 0.15, tell: 80 }, foes: [['brakeman', 300, 'top']] }),
  /* 18 */ C('coach', 620, { cp: [16, 'THE LAST COACH'], foes: [['passenger', 180, 'in'], ['porter', 415, 'in', 118]] }),
  /* 19 */ C('flat', 520, { cp: [17, 'THE LOG CAR'] }),
  // (the tender: nobody on it now (the playtest's: the fireman shoveling coal right before Tucker taken off); the kind
  // stays registered)
  /* 20 */ C('tender', 400, { cp: [18, 'THE ENGINE'] }),
  /* 21 */ C('engine', 600),
];
export const TENDER = 20, ENGINE = 21;

/** Where the caboose starts (its back end): room behind it for the run up, and for cut cars to fall back. */
export const REAR_X = x0 + 700;
/** Each car's left end (world x). */
export const CAR_X: number[] = (() => { const out: number[] = []; let x = REAR_X; for (const c of CARS) { out.push(x); x += c.len + COUPLER; } return out; })();
export const carRight = (i: number) => CAR_X[i] + CARS[i].len;
/** x along car i, `f` 0..1 of its length. */
export const along = (i: number, f: number) => CAR_X[i] + CARS[i].len * f;

// ---------------------------------------------------------------------------------------------------------------
// What's in and on the cars to climb (the playtest's: "actually platform inside")

/** Something to stand on in or on a car: x from its left end, its width, how high its top is over the deck; `solid`
 *  (that thick) or a one-way ledge (jump up through it). `look` says how it's drawn. */
export interface Fit { x: number; w: number; h: number; solid?: number; look: 'step' | 'rack' | 'bunk' | 'shelf' | 'table' | 'counter' | 'desk' | 'crate' | 'bale' | 'loft' }

/** The steps up a car's ends (rungs on the end of its body, out on the platforms): to its roof, or up onto its top. */
const steps = (len: number, hs: number[]): Fit[] => hs.flatMap(h => [{ x: 2, w: 38, h, look: 'step' as const }, { x: len - 40, w: 38, h, look: 'step' as const }]);

/** Car i's fittings (its own: the same every time). */
export const fittings = (i: number): Fit[] => {
  const d = CARS[i], L = d.len;
  switch (d.kind) {
    case 'caboose': return [...steps(L, [110, 215]),
      { x: 70, w: 120, h: 100, look: 'bunk' }, { x: 70, w: 120, h: 205, look: 'bunk' },
      { x: 250, w: 80, h: 44, solid: 44, look: 'desk' }, { x: 280, w: 100, h: 150, look: 'shelf' }];
    case 'coach': return [...steps(L, [110, 215]),
      { x: 80, w: 130, h: 118, look: 'rack' }, { x: 350, w: 130, h: 118, look: 'rack' },
      { x: 215, w: 120, h: 222, look: 'rack' }, { x: 470, w: 100, h: 222, look: 'rack' }];
    case 'diner': return [...steps(L, [110, 215]),
      { x: 80, w: 76, h: 48, look: 'table' }, { x: 220, w: 76, h: 48, look: 'table' }, { x: 360, w: 76, h: 48, look: 'table' },
      { x: 150, w: 110, h: 160, look: 'shelf' }, { x: 300, w: 120, h: 250, look: 'shelf' },
      { x: 480, w: 120, h: 56, solid: 56, look: 'counter' }, { x: 500, w: 90, h: 170, look: 'shelf' }];
    case 'baggage': return [...steps(L, [110, 215]),
      { x: 100, w: 60, h: 56, solid: 56, look: 'crate' }, { x: 108, w: 44, h: 104, solid: 48, look: 'crate' },
      { x: 210, w: 130, h: 165, look: 'shelf' }, { x: 390, w: 130, h: 250, look: 'shelf' },
      { x: 440, w: 66, h: 66, solid: 66, look: 'crate' }];
    case 'cattle': return [...steps(L, [110, 215]),
      { x: 100, w: 66, h: 46, solid: 46, look: 'bale' }, { x: 410, w: 66, h: 46, solid: 46, look: 'bale' },
      { x: 186, w: 210, h: 165, look: 'loft' }];
    case 'boxcar': return steps(L, [110, 215]);
    case 'hopper': return steps(L, [115]);
    case 'tank': return steps(L, [105]);
    case 'flat': return steps(L, [70]);
    default: return [];
  }
};

/** The cab: Tucker leaning out of the back of it over the tender (his feet on the cab's floor, the sill of the
 *  gangway's half door he leans over: at his waist, where his far hand grips it; the header over the opening). */
export const CAB = { x: CAR_X[ENGINE], sill: GY - 150, feet: GY - 112, header: GY - 244 };
/** The engine's drawing is the first pass's blown up by this (people stay their own size). */
export const ENGINE_SCALE = CARS[ENGINE].len / 360;
/** Back into the train from the town (the tender's front end, on its deck). */
export const TRAIN_END = { x: carRight(TENDER) - 14, y: DECK };

export const CHECKPOINTS = CARS.flatMap((c, i) => (c.cp ? [{ name: c.cp[1], cp: c.cp[0], x: CAR_X[i] + 14, y: DECK }] : []));

// ---------------------------------------------------------------------------------------------------------------
// What comes by

/** What comes by, set off once by him getting this far (car, fraction along it). `amp`: a grade's steepness (radians;
 *  above zero it climbs first then drops, below zero it dips first). */
export type EventKind = 'bridge' | 'tower' | 'tunnel' | 'robbers' | 'falls' | 'hill';
export interface TrainEvent { at: [number, number]; kind: EventKind; len?: number; n?: number; amp?: number }
export const EVENTS: TrainEvent[] = [
  { at: [1, 0.05], kind: 'bridge' },
  { at: [3, 0.3], kind: 'hill', len: 2600, amp: 0.03 },
  { at: [5, 0.1], kind: 'tunnel', len: 1400 },
  { at: [6, 0.5], kind: 'hill', len: 2400, amp: -0.042 },
  { at: [8, 0.15], kind: 'falls', len: 2000 },
  { at: [9, 0.4], kind: 'robbers', n: 1 },
  { at: [10, 0.1], kind: 'hill', len: 2600, amp: 0.054 },
  { at: [10, 0.4], kind: 'robbers', n: 2 },
  { at: [11, 0.2], kind: 'tower' },
  { at: [12, 0.3], kind: 'bridge' },
  { at: [13, 0.1], kind: 'tunnel', len: 2200 },
  { at: [13, 0.6], kind: 'hill', len: 2200, amp: -0.066 },
  { at: [14, 0.3], kind: 'robbers', n: 2 },
  { at: [14, 0.85], kind: 'falls', len: 3800 },
  { at: [15, 0.5], kind: 'hill', len: 2000, amp: 0.078 },
  { at: [16, 0.1], kind: 'tunnel', len: 3200 },
  { at: [17, 0.05], kind: 'tunnel', len: 2600 },
  { at: [17, 0.6], kind: 'hill', len: 1800, amp: -0.09 },
  { at: [18, 0.2], kind: 'tower' },
  { at: [18, 0.3], kind: 'robbers', n: 2 },
  { at: [18, 0.55], kind: 'bridge' },
  { at: [19, 0.1], kind: 'hill', len: 1800, amp: 0.1 },
  { at: [19, 0.35], kind: 'tunnel', len: 3000 },
];
export const eventX = (ev: TrainEvent) => along(ev.at[0], ev.at[1]);
/** From here on the stack's cinders come down over the cars. */
export const CINDERS_FROM = CAR_X[19];

/** Pickups (lean: small ones): [car, x along it, what]. On the floor. */
export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [5, 80, 'small_ammo'],
  [8, 300, 'small_health'],
  [14, 80, 'small_ammo'],
  [18, 80, 'small_health'],
  [20, 26, 'small_health'],
];
