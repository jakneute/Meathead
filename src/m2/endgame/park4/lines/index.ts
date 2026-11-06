// Level 4's lines, all of them, by voice, for the recordings (endgame/lines.ts folds PARK4_VOICE_LINES into
// ENDGAME_VOICE_LINES; npm run voices records them): Ned's (ned.ts), Meathead's to him, the skeletons', the new hurt
// lines, and every refight's (each land's file).

import * as N from './ned';
import { RF_ADVENTURE_VOICE_LINES } from './adventure';
import { RF_SPOOKY_VOICE_LINES } from './spooky';
import { RF_SPACE_VOICE_LINES } from './space';
import { RF_HOLLYWOOD_VOICE_LINES } from './hollywood';
import { RF_FOREIGN_VOICE_LINES } from './foreign';
import { RF_FRONTIER_VOICE_LINES } from './frontier';
import { RF_FANTASY_VOICE_LINES } from './fantasy';
import { RF_CARTOON_VOICE_LINES } from './cartoon';

type Pool = string | readonly string[] | { clean: readonly string[]; shitty: readonly string[]; nude: readonly string[] };
const all = (...ps: Pool[]): string[] => ps.flatMap(p => { if (typeof p === 'string') return [p]; if (Array.isArray(p)) return [...(p as readonly string[])]; const o = p as { clean: readonly string[]; shitty: readonly string[]; nude: readonly string[] }; return [...o.clean, ...o.shitty, ...o.nude]; });
const intros = Object.values(N.INTROS).flatMap(i => [i.place, i.sin, ...Object.values(i.looks), ...Object.values(i.statue ?? {}), ...all(i.close)]);

export const PARK4_VOICE_LINES: Record<string, string[]> = {
  [N.NED_VOICE]: [
    ...all(N.NED_APPEAR, N.NED_TAUNT, N.NED_BYE), ...intros,
    ...all(N.NED_FIGHT_HELLO, N.NED_ARCHERS, N.NED_MAGES, N.NED_DOGS, N.NED_ONE, N.NED_ALL_DEAD, N.NED_HURT, N.NED_TAUNTS, N.NED_BLINK, N.NED_LOW, N.NED_DYING),
  ],
  meathead: [...all(N.MH_WHO, N.MH_AFTER, N.MH_BACK, N.MH_SPENT, N.MH_FIGHT_HELLO, N.MH_NED_DEAD, N.MH_LAST), ...Object.values(N.HURT4).flatMap(h => h.hurt)],
  death: Object.values(N.HURT4).flatMap(h => h.death),
  [N.SKEL_VOICE]: [...N.SKEL_BARK],
};
for (const t of [RF_ADVENTURE_VOICE_LINES, RF_SPOOKY_VOICE_LINES, RF_SPACE_VOICE_LINES, RF_HOLLYWOOD_VOICE_LINES, RF_FOREIGN_VOICE_LINES, RF_FRONTIER_VOICE_LINES, RF_FANTASY_VOICE_LINES, RF_CARTOON_VOICE_LINES])
  for (const [v, l] of Object.entries(t)) (PARK4_VOICE_LINES[v] ??= []).push(...l);
