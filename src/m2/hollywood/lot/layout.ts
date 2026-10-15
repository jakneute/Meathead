// The backlot, laid out (x from the section's start, heights up from the ground line). The boulevard's mechanics
// pushed on: the stunt wires in chains and on moving rigs, the old tour's "special effects" that work, sort of, and
// hurt whoever's in them. Each new enemy alone first, then mixed.
//
//   0      Out through the hole the bulldozer smashed in the warehouse's far wall: rubble, siding and rebar torn
//          outward, the bulldozer crashed into THE DUMPSTER, which is overflowing with dead Revengers (capes, masks,
//          limbs, blood); the script's pages blowing down the lot, guests grabbing and reading them (spoilers).
//          Revengers merch carts already selling the leaked script on T-shirts (REVENGERS: RESEMBLE). A tour guide,
//          alone (the megaphone).
//   1400   The studio gate: HAPPYWOOD STUDIOS BACKLOT (nothing filmed since 1987).
//   1500   CHECKPOINT. NEW YORK STREET (one plank deep): the FAKE RAIN rig over it; it rains, it pours (the tell, the
//          thunder), and the fake lightning really zaps the wet street: be up off it (the fire escapes, the crates)
//          when it goes. Backlot security in a golf cart (alone), a guide up a fire escape.
//   3000   CHECKPOINT. THE FLASH FLOOD tank, sunk across the street: three stunt wires in a chain over it (jump from
//          one to the next), and the dump tank's surge every so often, knocking him off a low one. Fall in: it hurts,
//          and he's back at the edge. Centurion extras on the far side (don't charge the spear).
//   4700   CHECKPOINT. THE WESTERN TOWN: cowboy extras (the lasso), a centurion; the WATER TOWER, a camera dolly (a
//          shuttle wire: it runs on its own) up to its tank (a small ammo); MAIN STREET COLLAPSE, a pit, over it on
//          another shuttle.
//   6550   CHECKPOINT. THE FAKE SUBURB: the same house six times, no backs; behind them, a foundation pit to cross on a
//          wire into a shuttle (catch it as it comes back). Guides, carts, extras.
//   7950   CHECKPOINT. EXIT THROUGH THE GIFT SHOP (walked through), then the doors of DISASTER: THE RIDE.

import { SECTIONS, GY, LOT_DUMPSTER, LOT_WALL_BREAK } from '../geometry';
import type { StuntWire } from '../section';

export const X = (rx: number) => SECTIONS.lot.x0 + rx;
export const Y = (h: number) => GY - h;
export const HANDS = 80;
export const R = (x: number) => x - SECTIONS.lot.x0;

export const DUMP = { a: R(LOT_DUMPSTER.x0), b: R(LOT_DUMPSTER.x1), h: GY - LOT_DUMPSTER.top } as const;
export const BREAK = { x: R(LOT_WALL_BREAK.x), a: R(LOT_WALL_BREAK.hole.x0), b: R(LOT_WALL_BREAK.hole.x1), top: GY - LOT_WALL_BREAK.hole.top } as const;
export const RAIN = { a: 1600, b: 2800, period: 330, tell: 230, zap: 290, zapEnd: 310 } as const;
export const TANK = { a: 3300, b: 4200, depth: 160, period: 420, warn: 330, surge: 360, surgeEnd: 400, surgeH: 130 } as const;
export const TOWER = { x: 5400, w: 170, h: 300 } as const;
export const PIT1 = { a: 6050, b: 6450 } as const;
export const PIT2 = { a: 7000, b: 7700 } as const;
export const GIFT = { a: 8000, b: 8600 } as const;
export const RIDE_DOORS = 8800;

export const GROUND: [number, number][] = [[-200, TANK.a], [TANK.b, PIT1.a], [PIT1.b, PIT2.a], [PIT2.b, 9200]];

export type SolidWhat = 'crate' | 'trough' | 'counter';
export const SOLIDS: [number, number, number, SolidWhat][] = [
  [1980, 60, 70, 'crate'], [2420, 60, 70, 'crate'],
  [5250, 50, 120, 'trough'],
  [8280, 60, 100, 'counter'],
];
export type LedgeWhat = 'escape' | 'tower' | 'porch' | 'shelf';
export const LEDGES: [number, number, number, LedgeWhat][] = [
  [1700, 120, 140, 'escape'], [1740, 240, 120, 'escape'],
  [2200, 120, 140, 'escape'], [2240, 240, 120, 'escape'],
  [2620, 120, 140, 'escape'],
  [TOWER.x, TOWER.h, TOWER.w, 'tower'],
  [4880, 110, 160, 'porch'], [6700, 110, 150, 'porch'],
  [8420, 130, 140, 'shelf'],
];

/** The stunt wires, in order (wires are matched by their place: keep it). */
export const WIRES: StuntWire[] = [
  // the flood tank's chain: each ends short of the next one's harness (jump across to it)
  { from: { x: X(3200), y: Y(0) - HANDS }, to: { x: X(3540), y: Y(0) }, rigY: Y(330) },
  { from: { x: X(3650), y: Y(0) - HANDS - 20 }, to: { x: X(3930), y: Y(0) }, rigY: Y(340) },
  { from: { x: X(4040), y: Y(0) - HANDS - 20 }, to: { x: X(4330), y: Y(0) }, rigY: Y(340) },
  // the water tower's camera dolly: up to the tank, on its own loop
  { from: { x: X(5150), y: Y(0) - HANDS }, to: { x: X(TOWER.x + 60), y: Y(TOWER.h) }, rigY: Y(TOWER.h + 170), shuttle: true, speed: 5 },
  // over MAIN STREET COLLAPSE, on its own loop
  { from: { x: X(5960), y: Y(0) - HANDS }, to: { x: X(6540), y: Y(0) }, rigY: Y(330), shuttle: true, speed: 6 },
  // the foundation pit: a rig out (it parks), then a shuttle on from it
  { from: { x: X(6920), y: Y(0) - HANDS }, to: { x: X(7300), y: Y(0) }, rigY: Y(340) },
  { from: { x: X(7410), y: Y(0) - HANDS - 20 }, to: { x: X(7790), y: Y(0) }, rigY: Y(340), shuttle: true, speed: 6 },
];

export type LotKind = 'm2:hw_guide' | 'm2:hw_cart' | 'm2:hw_legionary' | 'm2:hw_cowboy';
export const ENEMIES: [LotKind, number, number][] = [
  // a guide, alone
  ['m2:hw_guide', 1250, 0],
  // New York: a cart alone; a guide up a fire escape; a centurion
  ['m2:hw_cart', 2550, 0], ['m2:hw_guide', 2280, 240], ['m2:hw_legionary', 2900, 0],
  // the flood tank's far side: centurions
  ['m2:hw_legionary', 4450, 0], ['m2:hw_legionary', 4620, 0],
  // the western town: cowboys, a centurion on the porch's far side
  ['m2:hw_cowboy', 5050, 0], ['m2:hw_cowboy', 5650, 0], ['m2:hw_legionary', 5800, 0], ['m2:hw_cowboy', 4950, 110],
  // past the collapse
  ['m2:hw_guide', 6650, 0],
  // the suburb, the far side of the pit
  ['m2:hw_cart', 7900, 0], ['m2:hw_cowboy', 6760, 110],
  // the gift shop and the ride's doors: the lot of them
  ['m2:hw_guide', 8480, 130], ['m2:hw_legionary', 8700, 0], ['m2:hw_cowboy', 8900, 0], ['m2:hw_cart', 8150, 0],
];

export const PICKUPS: [number, number, 'small_health' | 'small_ammo'][] = [
  [1800, 240, 'small_health'],
  [TOWER.x + 85, TOWER.h, 'small_ammo'],
  [4960, 110, 'small_health'],
  [8490, 130, 'small_ammo'],
];

/** PA horns (on poles): [x]. Steve's standees and posters: [x, kind]. */
export const SPEAKERS = [300, 1450, 3050, 4750, 6600, 8000];
export const STEVES: [number, 'standee' | 'poster'][] = [[760, 'standee'], [1380, 'poster'], [2100, 'poster'], [2980, 'standee'], [4500, 'standee'], [5350, 'poster'], [6250, 'poster'], [6580, 'standee'], [7400, 'poster'], [7980, 'standee'], [8650, 'poster']];
/** The guests reading the leaked pages: [x, seed]. */
export const READERS: [number, number][] = [[880, 41], [960, 44], [1100, 47], [3120, 52], [4560, 55], [6620, 58], [7950, 61]];

export const CHECKPOINTS = [
  { name: 'THE BACKLOT', cp: 30, x: X(200), y: GY },
  { name: 'NEW YORK STREET', cp: 31, x: X(1500), y: GY },
  { name: 'THE FLASH FLOOD', cp: 32, x: X(3020), y: GY },
  { name: 'THE WESTERN TOWN', cp: 33, x: X(4720), y: GY },
  { name: 'THE FAKE SUBURB', cp: 34, x: X(6580), y: GY },
  { name: 'THE GIFT SHOP', cp: 35, x: X(7960), y: GY },
];
