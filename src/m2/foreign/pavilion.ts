// What every pavilion does the same way: the PA's hello as he walks in (once), his line after it (once), his gags
// passing things (once each); the hurt lines registered; the lines gathered for the voices.

import type { GameState } from '../../m1/game/core/state';
import { pickLine } from '../../m1/game/platform/speech';
import { registerHurtLines } from '../kinds';
import { meatheadSays } from './section';
import { streetsOf, paSay, gag, once } from './state';
import { byPants } from './cast';
import type { PavilionTalk, HurtTable } from './talk';
export { pavilionVoices, type Gag, type PavilionTalk, type HurtTable } from './talk';

export const pavilionTalk = (state: GameState, key: string, x0: number, gy: number, t: PavilionTalk) => {
  const p = state.player, o = streetsOf(state);
  if (p.inCutscene || p.health <= 0) return;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, rx = cx - x0;
  if (rx > 60 && rx < 1400) once(state, `${key}-pa`, () => {
    const go = () => { if (!o.said[`${key}-arrive`]) { o.said[`${key}-arrive`] = true; o.saidAt = state.frame; meatheadSays(state, pickLine(t.arrive), true); } };
    if (o.paBusy) { go(); return; }
    paSay(state, pickLine(byPants(state, t.pa)), go);
  });
  for (const g of t.gags) {
    if (rx < g.from || rx > g.to) continue;
    const h = gy - feet;
    if (g.minH !== undefined && h < g.minH) continue;
    if (g.maxH !== undefined && h > g.maxH) continue;
    gag(state, `${key}-${g.key}`, g.lines);
  }
};

export const registerHurts = (h: HurtTable) => { for (const [source, l] of Object.entries(h)) registerHurtLines(source, l.hurt, l.death); };
