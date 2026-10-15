// The walk screens' far layers, painted with the lands' own far kits (adventure/farArt.ts, space/farArt.ts): those
// paint on the screen's 2 px grid, and the walk screens' picture is half the screen's size (each of its pixels 2x2 on
// the screen), so a far layer's painted at twice the picture's size and brought down to it, cell for pixel (every cell
// of the kits' is 2 px on a 2 px grid, so nothing's lost or smeared). Painted once for the hour (timeOfDay.ts), kept.

import { type Ctx } from './kit';
import { canvas } from './screen';
import { timeOfDay } from '../timeOfDay';

const held = new Map<string, HTMLCanvasElement>();

/**
 * A far layer `w` by `h` picture px: `paint` paints it at twice that (its own coords 0..2w, 0..2h, the kits' 2 px
 * grid), once for the hour; it comes back at the picture's size, to be put down with one drawImage.
 */
export const farStrip = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  const id = `${key}@${timeOfDay().key}`;
  let s = held.get(id);
  if (!s) {
    if (held.size > 48) held.clear();
    const big = canvas(w * 2, h * 2), bg = big.getContext('2d')!;
    bg.imageSmoothingEnabled = false;
    paint(bg);
    s = canvas(w, h);
    const g = s.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.drawImage(big, 0, 0, w, h);
    held.set(id, s);
  }
  return s;
};
