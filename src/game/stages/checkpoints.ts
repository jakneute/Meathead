// Every stage's checkpoints by name, in order: for the skip-level cheat's picker (start anywhere in a stage, or at the boss).

import { CP as ARTIE } from './artie/course';
import { CP as VICTOR } from './victor/course';
import { CP as ERNIE } from './ernie/course';
import { CP as HECTOR } from './hector/course';
import { CP as TOMMY } from './tommy/course';
import { CP as BARRY } from './barry/course';
import { CP as OSCAR } from './oscar/course';
import { CP as DALE } from './dale/course';

const BY_STAGE: Record<string, Record<string, number>> = {
  'Artie Avalanche': ARTIE, 'Victor Volcano': VICTOR, 'Ernie Earthquake': ERNIE, 'Hector Hurricane': HECTOR,
  'Toxic Tommy': TOMMY, 'Blackout Barry': BARRY, 'Oily Oscar': OSCAR, 'Drug Trade Dale': DALE,
};

/** Where a checkpoint's own name doesn't say enough on its own. */
const LABELS: Record<string, Record<string, string>> = {
  'Hector Hurricane': { CHASE: 'COAST GUARD CHASE' },
};

/** A stage's checkpoints, first to last: their names (as words) and numbers. */
export const stageCheckpoints = (stageId: string): { name: string; cp: number }[] =>
  Object.entries(BY_STAGE[stageId] ?? { START: 0 })
    .map(([k, cp]) => ({ name: LABELS[stageId]?.[k] ?? k.replace(/_/g, ' '), cp }))
    .sort((a, b) => a.cp - b.cp);
