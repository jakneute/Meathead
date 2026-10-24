// Tucker on the speaking tube: his voice down the length of the train from the cab, his words up at the top of the
// screen (a brass horn by them) while they're said, and only then.

import type { GameState } from '../../../m1/game/core/state';
import { pickLine, takeFreshLine } from '../../../m1/game/platform/speech';
import { CANVAS_WIDTH, HUD_CLEAR_Y, topBand } from '../../../m1/constants';
import { speak, saidOver, byPants } from '../section';
import { TUCKER_VOICE, type ByPants } from '../talk';
import { box, INK, type Ctx } from '../kit';
import { trainOf } from './state';
import type { TubeMood } from './tuckerPip';
import { TUBE_BOARD, TUBE_MISSED, TUBE_ROBBERS, TUBE_UNCOUPLE, TUBE_FALLS } from './lines';

/** His mood on each pool's lines (his gross-up in the corner, tuckerPip.ts): the meltdowns, the gleeful spite; the rest
 *  (the ledger, the tunnel) petty bookkeeping. */
const MOODS = new Map<ByPants, TubeMood>([[TUBE_BOARD, 'rage'], [TUBE_MISSED, 'rage'], [TUBE_ROBBERS, 'rage'], [TUBE_UNCOUPLE, 'glee'], [TUBE_FALLS, 'glee']]);

/** A line from the pool (clean, shat or naked: the state of him), down the tube. */
export const tubeSay = (state: GameState, pool: ByPants, onDone?: () => void, queued = true) => tubeLine(state, pickLine(byPants(state, pool)), onDone, queued, MOODS.get(pool));

/** This line, down the tube (none if it's been said in the last while: on with whatever's next). */
export const tubeLine = (state: GameState, text: string | null, onDone?: () => void, queued = true, mood: TubeMood = 'petty') => {
  const tr = trainOf(state);
  if (!text) { setTimeout(() => onDone?.(), 0); return; }
  tr.tubeBusy = true;
  speak(TUCKER_VOICE, text, s => { if (s && !tr.tube) tr.tubeMood = mood; tr.tube = s; }, queued, () => { tr.tube = null; tr.tubeBusy = false; onDone?.(); });
};
/** The `i`th line of a run of them (the rant), unless it was said just now (the rule: nothing twice in 45 s). */
export const tubeNth = (state: GameState, pool: ByPants, i: number, onDone?: () => void) => {
  const list = byPants(state, pool);
  if (i >= list.length) { setTimeout(() => onDone?.(), 0); return; }
  tubeLine(state, takeFreshLine([list[i]]), onDone, true, MOODS.get(pool));
};

/** Screen space: his words up top (clear of the HUD), a brass speaking-tube horn by them. */
export const drawTube = (c: Ctx, state: GameState) => {
  const tr = trainOf(state);
  if (!tr.tube) return;
  const band = topBand(), x = Math.min(band.mid, CANVAS_WIDTH - 200), y = HUD_CLEAR_Y + 30;
  // (the horn: a brass bell on a bent pipe)
  const hx = band.x1 + 8, hy = y - 18;
  box(c, hx - 1, hy - 1, 16, 8, INK); box(c, hx, hy, 14, 6, '#C8962C'); box(c, hx, hy, 14, 2, '#F4CC4E');
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx + 13, hy - 5); c.lineTo(hx + 26, hy - 10); c.lineTo(hx + 26, hy + 16); c.lineTo(hx + 13, hy + 11); c.closePath(); c.fill();
  c.fillStyle = '#E0B040'; c.beginPath(); c.moveTo(hx + 14, hy - 3); c.lineTo(hx + 24, hy - 7); c.lineTo(hx + 24, hy + 13); c.lineTo(hx + 14, hy + 9); c.closePath(); c.fill();
  box(c, hx + 22, hy - 6, 2, 18, '#3A2A08');
  saidOver(c, tr.tube.text, x, y, '#FDE68A', 300);
};
