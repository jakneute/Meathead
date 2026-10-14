// The Voyage to 2010's ride vehicle, the STAR SLED, one look wherever it turns up (at the load platform, out on the
// track, the one in front at the end): a long low rocket on a bogie, single file (two seats: the front one, the back
// one), its nose cone out front, fins at the back, a headrest behind each seat with the onboard speaker in it (the
// ride's PA comes out of there). Drawn in two layers: `back` (the seat backs and headrests, behind whoever's sat in
// it; `seats`: which seats' backs, to draw just those sat in by someone drawn with them) and the body (in front of them). `x` is the middle of it, `y` the rail; facing right.

import { INK, box, text, rampOf, checker } from '../../intro/art/kit';

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
  box(c, -SLED_HALF + 14, -13, SLED_HALF * 2 - 28, 8, INK); box(c, -SLED_HALF + 15, -12, SLED_HALF * 2 - 30, 6, '#3F3F46'); box(c, -SLED_HALF + 15, -12, SLED_HALF * 2 - 30, 1, '#71717A');
  for (const wx of [-44, 40]) {
    c.fillStyle = INK; c.beginPath(); c.arc(wx, -5, 7.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3F3F46'; c.beginPath(); c.arc(wx, -5, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#71717A'; c.beginPath(); c.arc(wx - 1, -6, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#27272A'; c.beginPath(); c.arc(wx, -5, 2, 0, Math.PI * 2); c.fill();
    const a = f * 0.45; box(c, wx + Math.cos(a) * 3.5 - 1, -6 + Math.sin(a) * 3.5, 2, 2, '#D4D4D8');
  }
  // the body: a long fiberglass tub, rounded at the back, the nose cone out front (inked, stepped from its lit top to
  // its belly, each step dithered into the next)
  const path = () => {
    c.beginPath(); c.moveTo(-SLED_HALF + 6, -44); c.lineTo(SLED_HALF - 30, -44);
    c.quadraticCurveTo(SLED_HALF + 4, -40, SLED_HALF + 22, -24); c.quadraticCurveTo(SLED_HALF + 4, -10, SLED_HALF - 30, -10);
    c.lineTo(-SLED_HALF + 6, -10); c.quadraticCurveTo(-SLED_HALF - 4, -10, -SLED_HALF - 4, -27); c.quadraticCurveTo(-SLED_HALF - 4, -44, -SLED_HALF + 6, -44); c.closePath();
  };
  c.fillStyle = INK; c.save(); c.scale(1.02, 1.05); path(); c.fill(); c.restore();
  c.save(); path(); c.clip();
  const L = -SLED_HALF - 6, W = SLED_HALF * 2 + 30;
  box(c, L, -46, W, 38, r[2]);
  box(c, L, -46, W, 4, r[4]); box(c, L, -42, W, 6, r[3]); checker(c, L, -36, W, 2, r[3]);
  checker(c, L, -20, W, 2, r[1], 1); box(c, L, -18, W, 5, r[1]); box(c, L, -13, W, 5, r[0]);
  // (the stripe, swept back from the nose; a pinstripe under it)
  box(c, L, -32, W, 7, s[2]); box(c, L, -32, W, 2, s[3]); box(c, L, -32, W, 1, s[4]); box(c, L, -26, W, 1, s[0]);
  // (the nose: chrome, its own ramp)
  const n = rampOf('#CBD5E1');
  c.save(); c.beginPath(); c.rect(SLED_HALF - 20, -46, 60, 40); c.clip();
  box(c, SLED_HALF - 20, -46, 60, 38, n[2]); box(c, SLED_HALF - 20, -42, 60, 6, n[4]); box(c, SLED_HALF - 20, -18, 60, 8, n[0]); checker(c, SLED_HALF - 20, -36, 60, 2, n[3]);
  c.restore();
  box(c, SLED_HALF - 21, -46, 2, 38, INK);
  // (rivets along the stripe)
  for (let k = -SLED_HALF + 4; k < SLED_HALF - 24; k += 12) box(c, k, -35, 1, 1, r[0]);
  c.restore();
  // the seats' padded rims (one behind the other), the grab bar
  for (const sx of SEATS) { box(c, sx - 26, -48, 38, 6, INK); box(c, sx - 25, -47, 36, 4, '#374151'); box(c, sx - 25, -47, 36, 1, '#9CA3AF'); box(c, sx - 25, -44, 36, 1, '#1F2937'); }
  box(c, SEATS[0] + 10, -60, 4, 14, INK); box(c, SEATS[0] + 11, -59, 2, 12, '#E5E7EB'); box(c, SEATS[0] + 9, -61, 6, 3, INK);
  // (the fins at the back, the exhaust bell, its glow in the dark)
  c.fillStyle = INK; c.beginPath(); c.moveTo(-SLED_HALF + 3, -41); c.lineTo(-SLED_HALF - 19, -68); c.lineTo(-SLED_HALF - 15, -29); c.closePath(); c.fill();
  c.fillStyle = s[2]; c.beginPath(); c.moveTo(-SLED_HALF + 1, -39); c.lineTo(-SLED_HALF - 15, -61); c.lineTo(-SLED_HALF - 12, -32); c.closePath(); c.fill();
  c.fillStyle = s[4]; c.beginPath(); c.moveTo(-SLED_HALF - 1, -40); c.lineTo(-SLED_HALF - 15, -61); c.lineTo(-SLED_HALF - 12, -50); c.closePath(); c.fill();
  box(c, -SLED_HALF - 11, -31, 9, 16, INK); box(c, -SLED_HALF - 10, -30, 7, 14, '#71717A'); box(c, -SLED_HALF - 10, -30, 7, 3, '#A1A1AA');
  if (!lit) { c.globalAlpha = 0.35; box(c, -SLED_HALF - 18, -28, 8, 10, '#67E8F9'); c.globalAlpha = 0.7; box(c, -SLED_HALF - 13, -26, 3, 6, '#A5F3FC'); c.globalAlpha = 1; }
  // (in the dark, the running lights along the side, chasing, each with its little glow; with the work lights on, just bulbs)
  for (let k = 0; k < 7; k++) {
    const on = lit ? false : (Math.floor(f / 4) + k) % 7 < 2, bx = -SLED_HALF + 12 + k * 18;
    if (on) { c.globalAlpha = 0.3; box(c, bx - 2, -18, 8, 7, '#67E8F9'); c.globalAlpha = 1; }
    box(c, bx - 1, -17, 6, 5, INK); box(c, bx, -16, 4, 3, on ? '#CFFAFE' : '#475569');
  }
  // (the number: right way round even when it's turned the other way)
  const m = c.getTransform(), flip = m.a * m.d - m.b * m.c < 0;
  c.save(); c.translate(-8, -21); if (flip) c.scale(-1, 1);
  text(c, `STAR SLED ${look.num}`, 0, 0, '#111827', 5, 'center', '#F8FAFC');
  c.restore();
  c.restore();
};

/** Someone sat in a sled (`x` their seat, `rail` the rail under it): drawn by `draw` with their feet at the origin,
 *  cut off at the tub (their legs are down in it). */
export const seatedIn = (c: Ctx, x: number, rail: number, draw: (c: Ctx) => void) => {
  c.save(); c.beginPath(); c.rect(x - 80, rail - 260, 160, 246); c.clip();
  c.translate(x, rail); draw(c);
  c.restore();
};
