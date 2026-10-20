// Cartoon Land's neighbors as glimpsed far off on the park's horizon: Spooky Land on one side (Dracula's OTHER castle
// as the hub has it: lilac-gray stone in courses, the keep's purple slate spike and its red flag, candle-snuffer
// towers, windows lit red after dark; THE CLOCK TOWER beside it, its face and the drop ride's car up its side), and
// Hollywood Land on the other (fantasy/glimpse.ts's hill and its letters). For far layers painted once for the hour:
// `T` is the layer's haze-and-hour tint.

import { box, mix, INK, type Ctx } from './kit';
export { farHollywood } from '../fantasy/glimpse';

type Tint = (c: string) => string;
const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
const r4 = (T: Tint, col: string) => [T(mix(col, INK, 0.35)), T(col), T(mix(col, '#FFFFFF', 0.3)), T(mix(col, '#FFFFFF', 0.6))];

/** Spooky Land far off: the other castle and the clock tower, their feet on `foot`, middle at x. */
export const farSpooky = (g: Ctx, T0: Tint, x0: number, foot0: number, lamps: boolean, s = 0.62) => {
  // (small, and pulled down into Spooky Land's own dusk purples whatever the haze, so it never reads as the Fairy
  //  castle: a dark spiky silhouette, the clock tower plainly beside it)
  const T: Tint = c => mix(T0(c), '#2A1838', 0.42);
  g.save(); g.translate(x0, foot0); g.scale(s, s);
  const x = 0, foot = 0;
  const S = r4(T, '#5A4E70'), P = r4(T, '#3B0764'), win = lamps ? '#F87171' : T('#1A0E28');
  // (the crag it stands on, and the dead trees)
  poly(g, [[x - 60, foot], [x - 40, foot - 10], [x - 10, foot - 14], [x + 30, foot - 12], [x + 62, foot]], T('#3E3452'));
  // (the curtain wall, battlements)
  box(g, x - 40, foot - 30, 64, 18, S[1]); box(g, x - 40, foot - 30, 64, 1, S[3]); box(g, x + 14, foot - 30, 10, 18, S[0]);
  for (let k = 0; k < 8; k++) box(g, x - 40 + k * 8, foot - 33, 5, 3, S[2]);
  // (the round towers under their candle-snuffer roofs)
  for (const [tx, th] of [[-40, 34], [22, 30]] as const) {
    box(g, x + tx - 5, foot - th - 12, 10, th, S[1]); box(g, x + tx - 5, foot - th - 12, 3, th, S[2]); box(g, x + tx + 2, foot - th - 12, 3, th, S[0]);
    poly(g, [[x + tx - 7, foot - th - 12], [x + tx, foot - th - 30], [x + tx + 7, foot - th - 12]], P[1]); poly(g, [[x + tx - 7, foot - th - 12], [x + tx, foot - th - 30], [x + tx - 2, foot - th - 12]], P[2]);
    box(g, x + tx - 1, foot - th + 2, 2, 4, win);
  }
  // (the keep: tall, its purple slate spike and the red flag)
  box(g, x - 16, foot - 62, 22, 50, S[1]); box(g, x - 16, foot - 62, 5, 50, S[2]); box(g, x + 1, foot - 62, 5, 50, S[0]);
  for (let k = 0; k < 3; k++) box(g, x - 9 + k * 6, foot - 52, 2, 5, win);
  box(g, x - 7, foot - 36, 4, 6, win);
  poly(g, [[x - 19, foot - 62], [x - 5, foot - 100], [x + 9, foot - 62]], P[1]); poly(g, [[x - 19, foot - 62], [x - 5, foot - 100], [x - 9, foot - 62]], P[2]);
  box(g, x - 5, foot - 110, 1, 10, T(INK)); poly(g, [[x - 4, foot - 110], [x + 5, foot - 107], [x - 4, foot - 104]], T('#B91C1C'));
  // (THE CLOCK TOWER off to its right: a tall stone shaft, the face, the pointed cap, the drop ride's car up its side)
  const cx = x + 46;
  box(g, cx - 7, foot - 92, 14, 92, S[1]); box(g, cx - 7, foot - 92, 4, 92, S[2]); box(g, cx + 3, foot - 92, 4, 92, S[0]);
  g.fillStyle = T(lamps ? '#FDE68A' : '#E8E0D0'); g.beginPath(); g.arc(cx, foot - 80, 5, 0, Math.PI * 2); g.fill();
  box(g, cx, foot - 84, 1, 4, T(INK)); box(g, cx, foot - 80, 3, 1, T(INK));
  poly(g, [[cx - 9, foot - 92], [cx, foot - 114], [cx + 9, foot - 92]], P[0]); poly(g, [[cx - 9, foot - 92], [cx, foot - 114], [cx - 2, foot - 92]], P[1]);
  box(g, cx + 7, foot - 60, 4, 4, T('#7F1D1D'));
  g.restore();
};
