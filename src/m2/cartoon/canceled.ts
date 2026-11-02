// Cartoon Land after DAD GUY's dead (the owner's revisit brief, 2026-11-02: "there are big cancelled signs on any
// cartoon dad posters you see"). `dadGone()` for whether he's dead on this save; `goneKey()` to go on the key of any
// baked canvas or stamp that paints a DAD GUY poster (so the painted-once art has a cleared look of its own);
// `canceledSlap` paints the sign: a big red paper strip pasted on slantwise over the poster, CANCELED on it in fat
// white letters (American spelling, as everywhere on screen). Paint it inside the bake only: never per frame.

import { isLandCleared } from '../store';
import { signText } from '../signLetters';
import { box, checker, INK, type Ctx } from './kit';

/** DAD GUY's dead on this save: his posters all get CANCELED slapped across them. */
export const dadGone = () => isLandCleared('cartoon');
/** For a baked canvas's key: its cleared look kept apart from the other. */
export const goneKey = () => (dadGone() ? '-gone' : '');

/** The CANCELED strip, centered at (cx, cy) in `g`'s space, `len` long, its letters `size` px a cell, turned `ang`;
 *  `tone` the bake's color for the hour (or its dimming). Clip to the poster first if it shouldn't hang off it. */
export const canceledSlap = (g: Ctx, cx: number, cy: number, len: number, size = 2, ang = -0.36, tone: (col: string) => string = c => c) => {
  const h = 7 * size + Math.max(6, size * 4), l = -len / 2, t = -h / 2;
  g.save(); g.translate(Math.round(cx), Math.round(cy)); g.rotate(ang);
  // (a shadow off it, the ink edge, the red paper in steps: a lit lip, the paste's dither, a dark foot)
  box(g, l + 2, t + 2, len, h, 'rgba(26,16,40,0.3)');
  box(g, l - 1, t - 1, len + 2, h + 2, tone(INK));
  box(g, l, t, len, h, tone('#DC2626'));
  box(g, l, t, len, 2, tone('#F87171'));
  checker(g, l, t + 2, len, 1, tone('#F87171'), 0, 1);
  box(g, l, t + h - 3, len, 3, tone('#991B1B'));
  checker(g, l, t + h - 4, len, 1, tone('#991B1B'), 1, 1);
  // (paste wrinkles across it)
  for (let k = 1; k < 4; k++) box(g, l + (len * k) / 4, t + 2, 1, h - 5, tone('#B91C1C'));
  signText(g, 'CANCELED', 0, Math.round(7 * size / 2), { sx: size, sy: size, bold: true, fill: [tone('#FFFFFF'), tone('#FEE2E2')], ink: tone('#450A0A') });
  g.restore();
};
