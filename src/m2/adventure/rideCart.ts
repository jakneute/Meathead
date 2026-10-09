// The Temple of the Jaguar's ride cart, one look wherever it turns up (sat at the loading station, out on the track,
// Safari Artie's coming after him): a long tub on four wheels, its name along the side, its back built up into
// something to lean on. Drawn in two layers: the back (behind whoever's in it) and the rest (in front of them: they're
// sat down in it). `x` is the middle of it, `y` the rail it's on; whoever rides it sits SEAT_DX from the middle, back
// against the back of it, feet RIDE_SINK above the rail.

import { box, label } from './section';

type Ctx = CanvasRenderingContext2D;

/** Where the one riding sits, from the cart's middle (toward the back of it), and how far over the rail his feet are. */
export const SEAT_DX = -30, RIDE_SINK = 14;
const HALF = 60;

export interface CartLook { col: string; trim: string; name?: string }
export const JAGUAR_EXPRESS: CartLook = { col: '#7C2D12', trim: '#C2410C', name: 'JAGUAR EXPRESS' };
export const TOUR_CART: CartLook = { col: '#57534E', trim: '#A8A29E', name: 'TOUR' };

/** `back`: just the back of it (drawn before whoever's in it); otherwise the tub and the wheels. `dir` the way it faces. */
export const drawRideCart = (c: Ctx, x: number, y: number, f: number, look: CartLook, back: boolean, rot = 0, dir: 1 | -1 = 1) => {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(dir, 1);
  if (back) {
    // the back, built up, padded where a back goes
    box(c, -HALF - 2, -66, 16, 56, look.col); box(c, -HALF - 2, -66, 16, 4, look.trim);
    box(c, -HALF + 2, -60, 8, 30, 'rgba(0,0,0,0.22)');
    c.restore(); return;
  }
  box(c, -HALF, -40, HALF * 2, 30, look.col); box(c, -HALF, -40, HALF * 2, 4, look.trim); box(c, -HALF, -14, HALF * 2, 4, '#1C1917');
  for (const rx of [-28, 4, 34]) box(c, rx, -36, 3, 22, 'rgba(0,0,0,0.18)');
  if (look.name) { c.save(); c.scale(dir, 1); label(c, look.name, 0, -22, '#FDE047', 6); c.restore(); }
  for (const wx of [-40, 40]) {
    c.fillStyle = '#18181B'; c.beginPath(); c.arc(wx, -6, 9, 0, Math.PI * 2); c.fill();
    box(c, wx - 1 + Math.round(Math.cos(f * 0.5) * 4), -7, 2, 2, '#A1A1AA');
  }
  c.restore();
};
