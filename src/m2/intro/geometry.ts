// Where everything is on the way in (intro/index.ts, intro/draw.ts): distances from the start (R turns one into the world).

import { GROUND_Y } from '../../m1/constants';

export const X0 = 20000;
export const R = (x: number) => X0 + x;
/** Up top (the garage level, the walkway, the checkpoint) the floor's this high; down the stairs, America USA's on the ground. */
export const UPPER = GROUND_Y - 170;
/** The garage's ceiling (the only one: everything after it's out in the open). */
export const CEIL_Y = 150;
/** The sections. */
export const GARAGE_END = 1500, HALL_END = 3700, CHECK_END = 4800, STAIRS_END = 5400, USA_START = 5400, USA_END = 9200;
/** The floor at a distance x: up top, down the stairs, then the ground. */
export const floorY = (x: number) => (x <= CHECK_END ? UPPER : x >= STAIRS_END ? GROUND_Y : UPPER + ((x - CHECK_END) / (STAIRS_END - CHECK_END)) * (GROUND_Y - UPPER));
/** The moving walkways, out from the garage, and how fast they carry you. */
export const WALKWAYS: [number, number][] = [[1650, 2250], [2350, 2950], [3050, 3550]];
export const WALKWAY_SPEED = 2.4;
/** The checkpoint's security office door. */
export const OFFICE_X = 4420;
/** The metal detector, just before the stairs down to America USA: walk through it and it goes off (jump it and it doesn't). */
export const DETECTOR_X = 4660;
/** The line: where it starts (he joins it there), the spot at the window, the window, the gap between people. */
export const QUEUE_START = 9550, FRONT_X = 10000, WINDOW_X = 10050, SPACING = 42;
/** The turnstile (no further without being let in), the gate (through it: the hub), the far wall. */
export const TURN_X = 10100, GATE_X = 10300, END_X = 10500;
/** America USA's districts: where each starts, its name. */
export const DISTRICTS: { x: number; id: 'nola' | 'nash' | 'chi' | 'sea' | 'bos' }[] = [
  { x: 5480, id: 'nola' }, { x: 6220, id: 'nash' }, { x: 6960, id: 'chi' }, { x: 7700, id: 'sea' }, { x: 8440, id: 'bos' },
];
export const DISTRICT_W = 740;
