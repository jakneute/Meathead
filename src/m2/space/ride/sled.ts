// The Voyage to 2010's ride vehicle, the STAR SLED, one look wherever it turns up (at the load platform, out on the
// track, the one in front at the end): a long low rocket on a bogie, single file (two seats: the front one, the back
// one), its nose cone out front, fins at the back, a headrest behind each seat with the onboard speaker in it (the
// ride's PA comes out of there). Drawn in two layers: `back` (the seat backs and headrests, behind whoever's sat in
// it; `seats`: which seats' backs, to draw just those sat in by someone drawn with them) and the body (in front of them). `x` is the middle of it, `y` the rail; facing right.

import { INK, box, text, rampOf } from '../../intro/art/kit';

type Ctx = CanvasRenderingContext2D;

/** Where the riders sit from the sled's middle (front seat, back seat), and how far over the rail their feet are. */
export const SEATS = [26, -34] as const, SLED_SINK = 14, SLED_HALF = 72;

export interface SledLook { body: string; stripe: string; num: number }
export const HIS_SLED: SledLook = { body: '#E5E7EB', stripe: '#DC2626', num: 7 };
export const FRONT_SLED: SledLook = { body: '#E5E7EB', stripe: '#2563EB', num: 6 };

/** The sled. `lit`: the work lights are on (it's a fiberglass tub with a stripe; in the dark it gleams). */
export const drawSled = (c: Ctx, x: number, y: number, f: number, look: SledLook, back: boolean, rot = 0, lit = false, seats: readonly number[] = [0, 1]) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  const r = rampOf(look.body), s = rampOf(look.stripe);
  if (back) {
    // the seat backs, each with its headrest and the speaker grille in it
    for (const i of seats) {
      const bx = SEATS[i] - 22;
      box(c, bx - 1, -66, 12, 46, INK);
      box(c, bx, -65, 10, 44, '#1F2937'); box(c, bx, -65, 3, 44, '#374151');
      box(c, bx - 2, -80, 14, 16, INK); box(c, bx - 1, -79, 12, 14, '#111827');
      for (let k = 0; k < 3; k++) box(c, bx + 1, -76 + k * 4, 8, 1, '#4B5563');
    }
    c.restore(); return;
  }
  // (the bogie: the wheels on the rail under it, a guide wheel)
  box(c, -SLED_HALF + 14, -12, SLED_HALF * 2 - 28, 6, INK); box(c, -SLED_HALF + 15, -11, SLED_HALF * 2 - 30, 4, '#3F3F46');
  for (const wx of [-44, 40]) {
    c.fillStyle = INK; c.beginPath(); c.arc(wx, -5, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#52525B'; c.beginPath(); c.arc(wx, -5, 5.5, 0, Math.PI * 2); c.fill();
    const a = f * 0.45; box(c, wx + Math.cos(a) * 3 - 1, -6 + Math.sin(a) * 3, 2, 2, '#A1A1AA');
  }
  // the body: a long tub, rounded at the back, the nose cone out front (inked, stepped from its lit top to its belly)
  const path = () => {
    c.beginPath(); c.moveTo(-SLED_HALF + 6, -44); c.lineTo(SLED_HALF - 30, -44);
    c.quadraticCurveTo(SLED_HALF + 4, -40, SLED_HALF + 22, -24); c.quadraticCurveTo(SLED_HALF + 4, -10, SLED_HALF - 30, -10);
    c.lineTo(-SLED_HALF + 6, -10); c.quadraticCurveTo(-SLED_HALF - 4, -10, -SLED_HALF - 4, -27); c.quadraticCurveTo(-SLED_HALF - 4, -44, -SLED_HALF + 6, -44); c.closePath();
  };
  c.fillStyle = INK; c.save(); c.translate(0, 0); c.scale(1.02, 1.04); path(); c.fill(); c.restore();
  c.save(); path(); c.clip();
  box(c, -SLED_HALF - 6, -46, SLED_HALF * 2 + 30, 38, r[2]);
  box(c, -SLED_HALF - 6, -46, SLED_HALF * 2 + 30, 7, r[4]);
  box(c, -SLED_HALF - 6, -39, SLED_HALF * 2 + 30, 6, r[3]);
  box(c, -SLED_HALF - 6, -18, SLED_HALF * 2 + 30, 10, r[1]);
  // (the stripe, swept back from the nose; the number on the side)
  box(c, -SLED_HALF - 6, -31, SLED_HALF * 2 + 30, 6, s[2]); box(c, -SLED_HALF - 6, -31, SLED_HALF * 2 + 30, 1, s[4]);
  c.restore();
  // the seats' padded rims (one behind the other), the grab bar
  for (const sx of SEATS) { box(c, sx - 26, -48, 38, 6, INK); box(c, sx - 25, -47, 36, 4, '#374151'); box(c, sx - 25, -47, 36, 1, '#6B7280'); }
  box(c, SEATS[0] + 10, -60, 4, 14, INK); box(c, SEATS[0] + 11, -59, 2, 12, '#D4D4D8');
  // (the fins at the back, the exhaust bell)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-SLED_HALF + 2, -40); c.lineTo(-SLED_HALF - 18, -66); c.lineTo(-SLED_HALF - 14, -30); c.closePath(); c.fill();
  c.fillStyle = s[2]; c.beginPath(); c.moveTo(-SLED_HALF + 1, -39); c.lineTo(-SLED_HALF - 15, -61); c.lineTo(-SLED_HALF - 12, -32); c.closePath(); c.fill();
  box(c, -SLED_HALF - 10, -30, 8, 14, INK); box(c, -SLED_HALF - 9, -29, 6, 12, '#71717A');
  // (in the dark, the running lights along the side, chasing; with the work lights on, just bulbs)
  for (let k = 0; k < 7; k++) { const on = lit ? false : (Math.floor(f / 4) + k) % 7 < 2; box(c, -SLED_HALF + 12 + k * 18, -16, 4, 3, on ? '#67E8F9' : '#475569'); }
  text(c, `STAR SLED ${look.num}`, -8, -21, '#111827', 5, 'center', '#F8FAFC');
  c.restore();
};

/** Someone sat in a sled (`x` their seat, `rail` the rail under it): drawn by `draw` with their feet at the origin,
 *  cut off at the tub (their legs are down in it). */
export const seatedIn = (c: Ctx, x: number, rail: number, draw: (c: Ctx) => void) => {
  c.save(); c.beginPath(); c.rect(x - 80, rail - 260, 160, 246); c.clip();
  c.translate(x, rail); draw(c);
  c.restore();
};
