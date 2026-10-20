// The later sections' stand-ins (the skeleton's: each one's owner replaces its folder's index.ts with the real thing):
// flat ground, walkable start to finish, a cartoon sign naming what goes there and a COMING SOON board saying what it'll
// be, its checkpoint, the water tower in its sky at the section's size (monument.ts) or a flat wall indoors, the crude
// ways on (walk off its right end into the next) and back (its left end).

import type { GameState } from '../../m1/game/core/state';
import type { CartoonSection } from './section';
import { layOwn, endWalls, endExits, runExits, groundBox } from './section';
import { SECTIONS, GY, type CartoonId } from './geometry';
import { toonSign, toonSky, onScreen, box } from './kit';
import { MONUMENT_AT } from './monument';

export interface StubDef {
  id: CartoonId;
  /** Its checkpoint's number and name. */
  cp: number; name: string;
  /** Its sign's words; what it'll be (on the COMING SOON board). */
  sign: string[]; soon: string[];
  /** The ground's fill and its lit lip; indoors (no sky, no time of day: the wall's color). */
  ground?: [string, string]; indoors?: string;
  /** More signs along it: [x from its start, the words]. */
  more?: [number, string[]][];
}

export const stubSection = (d: StubDef): CartoonSection => {
  const { x0, x1 } = SECTIONS[d.id];
  const [fill, lip] = d.ground ?? ['#6CC07A', '#D9F99D'];
  return {
    id: d.id, x0, x1,
    checkpoints: [{ name: d.name, cp: d.cp, x: x0 + 200, y: GY }],
    build: (state) => {
      layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: d.indoors ? 'wood' : 'dirt' }]);
      endWalls(state, d.id);
    },
    update: (ctx, controls) => { runExits(ctx.state, endExits(d.id)); return controls; },
    drawBackdrop: (c, state) => {
      if (d.indoors) {
        box(c, 0, 0, 800, 600, d.indoors);
        for (let x = -((state.camera.x * 0.5) % 80); x < 800; x += 80) box(c, x, 0, 3, 600, 'rgba(0,0,0,0.12)');
        return true;
      }
      return toonSky(c, state, MONUMENT_AT[d.id]);
    },
    drawBack: (c, state: GameState) => {
      groundBox(c, x0 - 200, x1 + 200, GY, fill, lip);
      if (onScreen(state, x0 + 300, x0 + 700)) toonSign(c, x0 + 500, GY, d.sign);
      const mid = (x0 + x1) / 2;
      if (onScreen(state, mid - 200, mid + 200)) toonSign(c, mid, GY, ['COMING SOON', ...d.soon], { board: '#DB2777', tall: 150 });
      for (const [rx, words] of d.more ?? []) if (onScreen(state, x0 + rx - 200, x0 + rx + 200)) toonSign(c, x0 + rx, GY, words);
      if (onScreen(state, x1 - 400, x1)) toonSign(c, x1 - 200, GY, ['THIS WAY >'], { board: '#16A34A' });
    },
    outdoors: d.indoors ? undefined : () => 1,
  };
};
