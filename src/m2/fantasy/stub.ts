// The later sections' stand-ins (the skeleton's: each one's owner replaces its folder's index.ts with the real thing):
// flat ground, walkable start to finish, a storybook sign naming what goes there and a COMING SOON board saying what
// it'll be, its checkpoint, the castle in its sky at the section's size (monument.ts), the crude ways on (walk off its
// right end into the next) and back (its left end).

import type { GameState } from '../../m1/game/core/state';
import type { FantasySection } from './section';
import { layOwn, endWalls, endExits, runExits, groundBox } from './section';
import { SECTIONS, GY, type FantasyId } from './geometry';
import { storySign, fairySky, onScreen } from './kit';
import { MONUMENT_AT } from './monument';

export interface StubDef {
  id: FantasyId;
  /** Its checkpoint's number and name. */
  cp: number; name: string;
  /** Its sign's words; what it'll be (on the COMING SOON board). */
  sign: string[]; soon: string[];
  /** The ground's fill and its lit lip; indoors (no sky, no time of day). */
  ground?: [string, string]; indoors?: string;
  /** More signs along it: [x from its start, the words]. */
  more?: [number, string[]][];
}

export const stubSection = (d: StubDef): FantasySection => {
  const { x0, x1 } = SECTIONS[d.id];
  const [fill, lip] = d.ground ?? ['#5A4A6A', '#B8C8E8'];
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
      return fairySky(c, state, MONUMENT_AT[d.id]);
    },
    drawBack: (c, state: GameState) => {
      groundBox(c, x0 - 200, x1 + 200, GY, fill, lip);
      if (onScreen(state, x0 + 300, x0 + 700)) storySign(c, x0 + 500, GY, d.sign);
      const mid = (x0 + x1) / 2;
      if (onScreen(state, mid - 200, mid + 200)) storySign(c, mid, GY, ['COMING SOON', ...d.soon], { board: '#4A2A5E', tall: 150 });
      for (const [rx, words] of d.more ?? []) if (onScreen(state, x0 + rx - 200, x0 + rx + 200)) storySign(c, x0 + rx, GY, words);
      if (onScreen(state, x1 - 400, x1)) storySign(c, x1 - 200, GY, ['THIS WAY >'], { big: 1, board: '#2E5A3A' });
    },
    outdoors: d.indoors ? undefined : () => 1,
  };
};
