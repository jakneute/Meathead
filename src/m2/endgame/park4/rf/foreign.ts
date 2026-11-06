// HELICOPTER HARRY's refight (WRATH): FIRST-PASS STUB (the framework's defaults: the land's own fight at 999, the
// hell's tint and props, plain stitches). To be filled in: his three looks, the statue's two, his new lines, his arena.

import type { RefightDef } from '../defs';
import { foreignLayout } from '../../../foreign/index';
import { keptForRevisits } from '../../../store';
import { MEMO_CRUMBLED, MEMO_DEATH } from '../../../foreign/harry/fight';
import { refightId, refightStage } from '../where';

export const foreignRefight: RefightDef = {
  land: 'foreign', id: refightId('foreign'), stage: refightStage('foreign'),
  boss: 'HELICOPTER HARRY', sin: 'WRATH',
  inner: foreignLayout, cp: 120,
  sign: { pic: 'statue', word: 'LIBERTY', color: '#1E40AF' },
  looks: ['spin', 'buried', 'barfed'],
  lookNow: () => keptForRevisits(MEMO_DEATH) || 'spin',
  statueNow: () => (keptForRevisits(MEMO_CRUMBLED) === '1' ? 'fell' : 'shot'),
  lookName: l => (l === 'buried' ? 'BURIED IN CEMENT (WEAKNESS)' : l === 'barfed' ? 'PUKED TO DEATH (WEAKNESS)' : 'SHOT BY HIS OWN ROUNDS'),
  swaps: () => [],
  arena: () => null,
  stitches: look => look === 'buried'
    ? { thread: '#1A1A1A', patch: '#A8A29E', seams: [[0.1, 0.3, 0.9, 0.3]], patches: [[0.2, 0.4, 0.6, 0.3]] }
    : look === 'barfed'
      ? { thread: '#1A1A1A', patch: '#84CC16', seams: [[0.2, 0.15, 0.8, 0.2]], stain: { col: '#65A30D', k: 0.4 } }
      : { thread: '#F5F5F4', patch: '#7F1D1D', seams: [[0.2, 0.3, 0.8, 0.3]], holes: [[0.3, 0.35], [0.6, 0.4], [0.45, 0.55], [0.7, 0.62], [0.25, 0.7]] },
};
