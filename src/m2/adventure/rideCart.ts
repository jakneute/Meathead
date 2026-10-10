// The Temple of the Jaguar's ride cart, one look wherever it turns up (sat at the loading station, out on the track,
// Safari Artie's coming after him): a long riveted tub on four flanged wheels, its name on a brass plate along the
// side, its back built up and padded to lean on. Drawn in two layers: the back (behind whoever's in it) and the rest
// (in front of them: they're sat down in it). `x` is the middle of it, `y` the rail it's on; whoever rides it sits
// SEAT_DX from the middle, back against the back of it, feet RIDE_SINK above the rail.

import { INK, box, text, rampOf, lite, dark, checker } from '../intro/art/kit';

type Ctx = CanvasRenderingContext2D;

/** Where the one riding sits, from the cart's middle (toward the back of it), and how far over the rail his feet are. */
export const SEAT_DX = -30, RIDE_SINK = 14;
const HALF = 60;

export interface CartLook { col: string; trim: string; name?: string; spots?: boolean }
export const JAGUAR_EXPRESS: CartLook = { col: '#B4561A', trim: '#E8B400', name: 'JAGUAR EXPRESS', spots: true };
export const TOUR_CART: CartLook = { col: '#5E6A4A', trim: '#C8B98A', name: 'TOUR' };

/** `back`: just the back of it (drawn before whoever's in it); otherwise the tub and the wheels. `dir` the way it faces. */
export const drawRideCart = (c: Ctx, x: number, y: number, f: number, look: CartLook, back: boolean, rot = 0, dir: 1 | -1 = 1) => {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(dir, 1);
  const r = rampOf(look.col), t = rampOf(look.trim);
  if (back) {
    // the back, built up: a steel frame, a tufted pad on it, a grab rail across the top
    box(c, -HALF - 3, -70, 20, 62, INK);
    box(c, -HALF - 2, -69, 18, 60, r[1]); box(c, -HALF - 2, -69, 4, 60, r[3]);
    const pad = rampOf('#5A1F14');
    box(c, -HALF + 3, -64, 11, 34, pad[1]); box(c, -HALF + 4, -63, 9, 32, pad[2]); box(c, -HALF + 4, -63, 3, 32, pad[3]);
    for (const by of [-56, -44]) box(c, -HALF + 8, by, 2, 2, pad[0]);
    box(c, -HALF - 3, -73, 20, 5, INK); box(c, -HALF - 2, -72, 18, 3, t[3]); box(c, -HALF - 2, -72, 18, 1, t[4]);
    c.restore(); return;
  }
  // (the undercarriage: the frame rail, the axle boxes)
  box(c, -HALF + 6, -14, HALF * 2 - 12, 6, INK); box(c, -HALF + 7, -13, HALF * 2 - 14, 4, '#2E3036');
  // the tub: rounded off at the bottom corners, stepped from its lit top to its dark belly, riveted
  c.fillStyle = INK; c.beginPath(); c.moveTo(-HALF - 1, -42); c.lineTo(HALF + 1, -42); c.lineTo(HALF + 1, -18); c.quadraticCurveTo(HALF, -9, HALF - 8, -9); c.lineTo(-HALF + 8, -9); c.quadraticCurveTo(-HALF, -9, -HALF - 1, -18); c.closePath(); c.fill();
  c.save(); c.beginPath(); c.moveTo(-HALF, -41); c.lineTo(HALF, -41); c.lineTo(HALF, -18); c.quadraticCurveTo(HALF - 1, -10, HALF - 8, -10); c.lineTo(-HALF + 8, -10); c.quadraticCurveTo(-HALF + 1, -10, -HALF, -18); c.closePath(); c.clip();
  box(c, -HALF, -41, HALF * 2, 32, r[2]);
  box(c, -HALF, -35, HALF * 2, 6, r[3]); checker(c, -HALF, -29, HALF * 2, 2, r[3]);
  box(c, -HALF, -18, HALF * 2, 9, r[1]); checker(c, -HALF, -20, HALF * 2, 2, r[1]);
  box(c, -HALF, -12, HALF * 2, 3, r[0]);
  // (the jaguar's rosettes, if it has them)
  if (look.spots) for (const [sx, sy] of [[-50, -26], [-38, -16], [-18, -30], [30, -27], [44, -16], [52, -30], [-6, -14], [16, -15]]) {
    box(c, sx, sy, 6, 5, r[0]); box(c, sx + 2, sy + 1, 2, 3, r[1]);
  }
  // (ribs, stepped round)
  for (const rx of [-32, 0, 32]) { box(c, rx - 2, -41, 5, 31, r[1]); box(c, rx - 2, -41, 2, 31, r[3]); }
  c.restore();
  // (the rim: rolled over, the trim color, lit)
  box(c, -HALF - 2, -45, HALF * 2 + 4, 6, INK); box(c, -HALF - 1, -44, HALF * 2 + 2, 4, t[2]); box(c, -HALF - 1, -44, HALF * 2 + 2, 1, t[4]); box(c, -HALF - 1, -41, HALF * 2 + 2, 1, t[0]);
  for (let k = -HALF + 4; k < HALF; k += 10) { box(c, k, -38, 2, 2, r[0]); box(c, k, -38, 1, 1, r[4]); box(c, k, -14, 2, 2, r[0]); }
  // (the grab bar over the front, the bumpers, the lamp)
  box(c, HALF - 14, -56, 4, 14, INK); box(c, HALF - 13, -55, 2, 12, '#C0C4CC');
  box(c, HALF - 34, -58, 24, 4, INK); box(c, HALF - 33, -57, 22, 2, '#D8DCE2');
  box(c, HALF, -30, 6, 12, INK); box(c, HALF, -29, 5, 10, '#3A3E44'); box(c, -HALF - 6, -30, 6, 12, INK); box(c, -HALF - 5, -29, 5, 10, '#3A3E44');
  box(c, HALF + 2, -40, 6, 7, INK); box(c, HALF + 3, -39, 4, 5, f % 60 < 56 ? '#FFF4C8' : '#C9A160');
  // the name, on a brass plate riveted to the side
  if (look.name) {
    const w = look.name.length * 5 + 8;
    c.save(); c.scale(dir, 1);
    box(c, -w / 2 - 1, -32, w + 2, 12, INK); box(c, -w / 2, -31, w, 10, dark(look.trim, 0.1)); box(c, -w / 2, -31, w, 2, lite(look.trim, 0.35)); box(c, -w / 2, -23, w, 2, dark(look.trim, 0.4));
    text(c, look.name, 0, -23, '#2A1A08', 5, 'center', lite(look.trim, 0.5));
    c.restore();
  }
  // the wheels: flanged, spoked, turning; the axle boxes over them
  for (const wx of [-40, 40]) {
    box(c, wx - 7, -16, 14, 6, INK); box(c, wx - 6, -15, 12, 4, '#4A4E56'); box(c, wx - 6, -15, 12, 1, '#7A808A');
    c.fillStyle = INK; c.beginPath(); c.arc(wx, -6, 10, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2E3036'; c.beginPath(); c.arc(wx, -6, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#4A4E56'; c.beginPath(); c.arc(wx, -6, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1A1A1E'; c.beginPath(); c.arc(wx, -6, 5, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 3; k++) { const a = f * 0.5 + (k * Math.PI * 2) / 3; box(c, wx + Math.cos(a) * 3 - 1, -7 + Math.sin(a) * 3, 2, 2, '#9CA3AF'); }
    box(c, wx - 1, -7, 2, 2, '#C0C4CC');
    box(c, wx - 6, -14, 5, 1, '#8A909A');
  }
  c.restore();
};
