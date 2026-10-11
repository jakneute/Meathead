// The PA's horn speakers (the castle's and the dungeon's), painted: an old bell-mouthed loudspeaker on a wall bracket,
// its cable stapled up the wall into the dark; it shudders when Dracula's talking through it and his voice comes out
// of it in rings (stepped, pixel arcs). The still horn is stamped; the shudder and the rings are live.

import { INK, box, rampOf, stamp } from '../../intro/art/kit';

type Ctx = CanvasRenderingContext2D;
const STEEL = rampOf('#6B6F78'), BRASS = rampOf('#9A7424');

const paintHorn = (g: Ctx) => {
  // (the cable, up the wall, its staples)
  box(g, -1, -30, 2, 26, '#141012'); for (let y = -26; y < -6; y += 10) box(g, -3, y, 6, 2, STEEL[1]);
  // (the bracket: a plate on the wall, an arm out)
  box(g, -6, -6, 12, 18, INK); box(g, -5, -5, 10, 16, STEEL[1]); box(g, -5, -5, 10, 2, STEEL[3]); box(g, -2, -2, 4, 4, STEEL[0]);
  box(g, 4, 2, 8, 4, INK); box(g, 4, 3, 8, 2, STEEL[2]);
  // (the driver: a round can at the back of the horn)
  box(g, 9, -4, 10, 16, INK); box(g, 10, -3, 8, 14, STEEL[1]); box(g, 10, -3, 8, 3, STEEL[3]); box(g, 10, 8, 8, 3, STEEL[0]);
  // (the horn: flaring out in steps, lit along its top)
  const rows: [number, number][] = [[18, 3], [22, 4], [26, 6], [30, 8], [33, 10], [36, 12]];
  for (const [x, r] of rows) box(g, x - 1, 4 - r - 1, 5, r * 2 + 2, INK);
  for (const [x, r] of rows) { box(g, x, 4 - r, 4, r * 2, STEEL[2]); box(g, x, 4 - r, 4, 2, STEEL[3]); box(g, x, 4 + r - 3, 4, 3, STEEL[0]); }
  // (the mouth: a brass rim, the dark inside)
  box(g, 39, -10, 4, 28, INK); box(g, 40, -9, 2, 26, BRASS[3]); box(g, 40, -9, 2, 2, BRASS[4]); box(g, 40, 14, 2, 3, BRASS[1]);
  box(g, 37, -6, 3, 20, '#0C0A0A');
};

/** A PA horn at (x, y) (its bracket on the wall), pointed to the right; shuddering, its rings coming out, while talking. */
export const drawPaHorn = (c: Ctx, x: number, y: number, talking: boolean, f: number) => {
  const j = talking && (f >> 1) % 2 ? 1 : 0;
  c.save(); c.translate(Math.round(x), Math.round(y) + j);
  stamp(c, 'paHorn', -8, -62, 54, 84, paintHorn);
  c.restore();
  if (!talking) return;
  // (his voice: rings out of the mouth, stepped, fading as they spread)
  const cols = ['#FCA5A5', '#E07A7A', '#9A4A4A'];
  for (let k = 0; k < 3; k++) {
    const r = 8 + k * 7 + ((f >> 2) % 3) * 2;
    for (let a = -0.7; a <= 0.71; a += 0.35) box(c, Math.round(x + 44 + Math.cos(a) * r), Math.round(y + 4 + j + Math.sin(a) * r), 2, 2, cols[k]);
  }
};
