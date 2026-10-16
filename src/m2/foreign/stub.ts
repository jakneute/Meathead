// The later sections' stubs (the first job's: each one's owner replaces its folder's index.ts with the real thing):
// a placeholder walk-through so the land runs end to end. A street pavilion stub is a stretch of promenade with its
// name on a sign, a few set-back fronts in its colors, a COMING SOON board, and its checkpoint; it flows on into the
// next like the built ones (no walls, no doors). The cut sections' stubs (the helipad, Harry's arena) are in their own
// folders.

import type { ForeignSection } from './section';
import { layOwn } from './section';
import { SECTIONS, GY, type ForeignId } from './geometry';
import { viewIn, promenade, setBack, wall, hole, postBoard, onScreen, FACADE_D, plain, type Look } from './kit';

export interface StubDef {
  id: ForeignId;
  /** Its checkpoint's number and name. */
  cp: number; name: string;
  /** Its sign's words (the park's mistakes welcome), its colors (fronts), its board's color. */
  sign: string[]; fronts: string[]; board: string;
  look?: Look;
  /** What it'll be (on the COMING SOON board). */
  soon: string[];
}

export const stubPavilion = (d: StubDef): ForeignSection => {
  const { x0, x1 } = SECTIONS[d.id];
  const X = (rx: number) => x0 + rx;
  return {
    id: d.id, x0, x1,
    checkpoints: [{ name: d.name, cp: d.cp, x: X(150), y: GY }],
    build: (state) => { layOwn(state, [{ x1: x0, y1: GY, x2: x1, y2: GY, surface: 'hard' }]); },
    drawBack: (c, state) => {
      const v = viewIn(state), w = x1 - x0;
      promenade(c, v, x0, x1);
      for (let k = 0; k * 420 + 300 < w - 200; k++) {
        const rx = 300 + k * 420, col = d.fronts[k % d.fronts.length];
        setBack(c, v, X(rx), 300, FACADE_D, () => { wall(c, 0, 300, 180 + (k % 3) * 40, col); hole(c, 128, -80, 44, 80, true); hole(c, 30, -150, 34, 34, true); hole(c, 236, -150, 34, 34, true); });
      }
      const L = d.look ?? plain(2, 3, '#F8FAFC', '#1C1917');
      if (onScreen(v, X(200), X(700))) postBoard(c, X(420), GY, d.sign, L, d.board);
      if (onScreen(v, X(w / 2 - 300), X(w / 2 + 300))) postBoard(c, X(w / 2), GY, ['COMING SOON', ...d.soon], plain(1, 2, '#FDE68A', '#1C1917'), '#27272A', undefined, 100);
    },
    outdoors: () => 1,
  };
};
