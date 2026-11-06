// DONNIE DRACULA's refight (GLUTTONY): FIRST-PASS STUB (the framework's defaults: the land's own fight at 999, the hell's tint
// and props, plain stitches). To be filled in: the per-boss notes (necromancer-boss-rush.md), his new lines, his arena.

import type { RefightDef } from '../defs';
import { spookyLayout } from '../../../spooky/index';
import { bossDeath } from '../../../store';
import { refightId, refightStage } from '../where';

export const spookyRefight: RefightDef = {
  land: 'spooky', id: refightId('spooky'), stage: refightStage('spooky'),
  boss: 'DONNIE DRACULA', sin: 'GLUTTONY',
  inner: spookyLayout, cp: 62,
  sign: { pic: 'bat', word: 'BAT', color: '#7C3AED' },
  looks: ['normal', 'weakness'],
  lookNow: () => bossDeath('spooky') ?? 'normal',
  lookName: l => (l === 'weakness' ? 'SOUL SUCKED (WEAKNESS)' : 'SHAT HIMSELF'),
  swaps: () => [],
  arena: () => null,
  stitches: look => look === 'weakness'
    ? { thread: '#1A1A1A', patch: '#9CA3AF', seams: [[0.1, 0.25, 0.9, 0.3], [0.2, 0.6, 0.8, 0.55]], patches: [[0.55, 0.1, 0.3, 0.15]], staples: [[0.5, 0.2]] }
    : { thread: '#F5F5F4', patch: '#7F1D1D', seams: [[0.15, 0.3, 0.85, 0.6]], staples: [[0.5, 0.36], [0.3, 0.5]] },
};
