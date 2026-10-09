// The river, laid out (relative to its x0): the dock, the open river the boat runs down (the far bank's fake animals),
// the backside of water (a wall of rock down into the water: under it or nothing), the tunnel under it (a rock roof
// just under the surface, with air pockets up through it), the discarded rides, the animatronic dinosaurs, the
// aquatic dinosaur tank (open to the air; the gallery behind its glass), and the storm drain's intake pipe.

import { GY } from '../geometry';

/** The water's surface (the open river, the tank, the air pockets). */
export const WS = GY + 40;
/** The tunnel's rock roof: its underside (under the surface: no air under it). */
export const CEIL = WS + 40;
/** The dock's end (dry land up to here). */
export const DOCK = 380;
/** The boat: where it waits, where it runs dry, its deck (above the surface), how long it is. */
export const BOAT = { x: 384, stop: 2900, w: 240, deck: WS - 16, speed: 1.8 };
/** The backside of water: a wall of rock down from the sky into the water. */
export const FALLS = { x: 3380, w: 70, bottom: WS + 90 };
/** The tunnel: from the falls to the tank. Air pockets up through its roof (to the surface, a hollow over it). */
export const TUNNEL = { x1: FALLS.x + FALLS.w, x2: 10000 };
export const POCKETS = [{ x: 4560, w: 200 }, { x: 6660, w: 200 }, { x: 8660, w: 200 }];
/** The hollow over a pocket: its roof. */
export const POCKET_TOP = WS - 150;
/** The tank: open above the water; its right wall down to the intake (the pipe's mouth at its foot). */
export const TANK = { x1: 10000, x2: 12400, wall: 60 };
export const PIPE = { x1: TANK.x2 + TANK.wall, x2: 13700, top: 900 };
/** Past here he's sucked in. */
export const SUCK_AT = 13560;

/** The river bed: points along it (relative x, y), straight between. */
export const BED: [number, number][] = [
  [DOCK, 760], [700, 860], [3300, 860], [3600, 940], [4400, 960], [4700, 900], [5400, 980], [6200, 1000], [7600, 1000],
  [8000, 960], [9800, 980], [10000, 1020], [12400, 1020], [12460, 1000], [PIPE.x2 + 100, 1000],
];
export const bedAt = (rx: number) => {
  for (let i = 1; i < BED.length; i++) {
    const [ax, ay] = BED[i - 1], [bx, by] = BED[i];
    if (rx <= bx) return ay + (by - ay) * Math.max(0, (rx - ax) / (bx - ax));
  }
  return BED[BED.length - 1][1];
};
/** The underside of whatever's over the water at x (the open surface where there's nothing). */
export const roofAt = (rx: number) => {
  if (rx >= FALLS.x && rx < TUNNEL.x2) {
    if (rx < TUNNEL.x1) return FALLS.bottom;
    return POCKETS.some(p => rx >= p.x && rx < p.x + p.w) ? WS : CEIL;
  }
  if (rx >= TANK.x2 && rx < PIPE.x2) return PIPE.top;
  return WS;
};

/** The discarded rides, sunk on the bed (solid: swim round them, stand on them). */
export interface Prop { x: number; w: number; h: number; look: 'boat' | 'teacup' | 'log' | 'rock' | 'booth' }
export const PROPS: Prop[] = [
  { x: 4250, w: 120, h: 90, look: 'rock' },
  { x: 5480, w: 260, h: 56, look: 'boat' },
  { x: 5960, w: 70, h: 46, look: 'teacup' },
  { x: 6080, w: 60, h: 40, look: 'teacup' },
  { x: 6380, w: 160, h: 34, look: 'log' },
  { x: 7250, w: 90, h: 110, look: 'booth' },
  { x: 11480, w: 110, h: 80, look: 'rock' },
];
/** The animatronic dinosaurs (harmless; scenery): where, and which. */
export const DINOS: { x: number; look: 'stego' | 'rex' | 'trike' | 'bronto' }[] = [
  { x: 7850, look: 'stego' }, { x: 8350, look: 'rex' }, { x: 9150, look: 'trike' }, { x: 9550, look: 'bronto' },
];
/** Bubble vents on the bed. */
export const VENTS = [4100, 5250, 6200, 7450, 8150, 9350, 11000, 12100, 12900];

/** Who's in the water: piranhas (x, y), eels (in a hole: its mouth, which way it comes out), snapping plants (root x). */
export const PIRANHAS_BOAT = [900, 1300, 1700, 2100, 2500, 2800, 3150];
export const PIRANHAS: [number, number][] = [
  [3900, 760], [3960, 800], [4900, 740], [5000, 790], [5800, 760], [6500, 760], [6560, 820], [7700, 760], [8500, 800],
  [9100, 760], [9180, 820], [10800, 760], [11900, 800],
];
export const EELS: { x: number; y: number; dir: 1 | -1 }[] = [
  { x: 4250, y: 960 - 60, dir: -1 }, { x: 5740, y: 0, dir: 1 }, { x: 8000, y: 0, dir: -1 }, { x: 11590, y: 0, dir: 1 },
];
export const SNAPPERS = [4850, 6300, 6900, 8800, 9650, 11200, 12000];

/** The gallery behind the tank's glass: where the guests stand. */
export const GALLERY = { x1: TANK.x1 + 80, x2: TANK.x2 - 80, floor: 1000, glassTop: WS + 70 };

/** Things he says the once each, swimming past (relative x). */
export const CALLOUTS: [number, 'dive' | 'rides' | 'rides2' | 'dinos' | 'dinos2' | 'tank' | 'drain'][] = [
  [3560, 'dive'], [5420, 'rides'], [6450, 'rides2'], [7750, 'dinos'], [8450, 'dinos2'], [10150, 'tank'], [12380, 'drain'],
];
