// Where everything is on the way in (intro/index.ts, intro/draw.ts): distances from the start (R turns one into the world).

export const X0 = 20000;
export const R = (x: number) => X0 + x;
/** The ceiling, indoors (the garage, the hallway, the checkpoint): its underside. */
export const CEIL_Y = 196;
/** The sections. */
export const GARAGE_END = 1500, HALL_END = 3700, CHECK_END = 4800, USA_END = 8600;
/** The hallway's moving walkways, and how fast they carry you. */
export const WALKWAYS: [number, number][] = [[1650, 2250], [2350, 2950], [3050, 3550]];
export const WALKWAY_SPEED = 2.4;
/** The checkpoint's security office door. */
export const OFFICE_X = 4420;
/** The metal detector, just before the way out into America USA: walk through it and it goes off (jump it and it doesn't). */
export const DETECTOR_X = 4660;
/** The line: where it starts (he joins it there), the spot at the window, the window, the gap between people. */
export const QUEUE_START = 8950, FRONT_X = 9400, WINDOW_X = 9450, SPACING = 42;
/** The turnstile (no further without being let in), the gate (through it: the hub), the far wall. */
export const TURN_X = 9500, GATE_X = 9700, END_X = 9900;
/** America USA's districts: where each starts, its name. */
export const DISTRICTS: { x: number; id: 'nola' | 'nash' | 'chi' | 'sea' | 'bos' }[] = [
  { x: 4880, id: 'nola' }, { x: 5620, id: 'nash' }, { x: 6360, id: 'chi' }, { x: 7100, id: 'sea' }, { x: 7840, id: 'bos' },
];
export const DISTRICT_W = 740;
