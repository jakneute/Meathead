// The later sections' stand-ins (the skeleton's: each one's owner replaces its folder's index.ts with the real thing):
// flat ground, walkable start to finish, a frontier sign naming what goes there and a COMING SOON board saying what
// it'll be, its checkpoint, the crude ways on (walk off its right end into the next) and back (its left end).

import type { GameState } from '../../m1/game/core/state';
import type { FrontierSection } from './section';
import { layOwn, endWalls, endExits, runExits, groundBox } from './section';
import { SECTIONS, GY, type FrontierId } from './geometry';
import { frontierSign, frontierSky, onScreen } from './kit';

export interface StubDef {
  id: FrontierId;
  /** Its checkpoint's number and name. */
  cp: number; name: string;
  /** Its sign's words; what it'll be (on the COMING SOON board). */
  sign: string[]; soon: string[];
  /** The ground's fill and its lit lip; indoors (no sky, no time of day). */
  ground?: [string, string]; indoors?: string;
  /** More signs along it: [x from its start, the words]. */
  more?: [number, string[]][];
}

export const stubSection = (d: StubDef): FrontierSection => {
  const { x0, x1 } = SECTIONS[d.id];
  const [fill, lip] = d.ground ?? ['#6B4A2A', '#A3B86C'];
  return {
    id: d.id, x0, x1,
    checkpoints: [{ name: d.name, cp: d.cp, x: x0 + 200, y: GY }],
    build: (state) => {
      layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'dirt' }]);
      endWalls(state, d.id);
    },
    update: (ctx, controls) => { runExits(ctx.state, endExits(d.id)); return controls; },
    drawBackdrop: (c, state) => {
      if (d.indoors) { c.fillStyle = d.indoors; c.fillRect(0, 0, 800, 600); return true; }
      return frontierSky(c, state);
    },
    drawBack: (c, state: GameState) => {
      groundBox(c, x0 - 200, x1 + 200, GY, fill, lip);
      if (onScreen(state, x0 + 300, x0 + 700)) frontierSign(c, x0 + 500, GY, d.sign, { seed: d.cp });
      const mid = (x0 + x1) / 2;
      if (onScreen(state, mid - 200, mid + 200)) frontierSign(c, mid, GY, ['COMING SOON', ...d.soon], { board: '#5A3A1E', big: 2, small: 1, tall: 110 });
      for (const [rx, words] of d.more ?? []) if (onScreen(state, x0 + rx - 200, x0 + rx + 200)) frontierSign(c, x0 + rx, GY, words, { seed: rx });
      if (onScreen(state, x1 - 400, x1)) frontierSign(c, x1 - 200, GY, ['THIS WAY >'], { big: 1 });
    },
    outdoors: d.indoors ? undefined : () => 1,
  };
};
