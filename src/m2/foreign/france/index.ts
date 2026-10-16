// FRANCE: section 8 of the streets. STUB (the first job's): a placeholder walk-through. Its owner builds
// (foreign-spec.md): a Paris street, a cafe, an Eiffel-ish tower base climbed; mimes (invisible walls that block shots
// till broken), snooty waiters, baguette swingers, a can-can line, a smoker who's rude to him. Checkpoints 70-79. Flows
// on from Morocco and into the United Kingdom.

import { stubPavilion } from '../stub';

export const france = stubPavilion({
  id: 'france', cp: 70, name: 'FRANCE', sign: ['FRANCE', 'OOH LA LA ZONE'], fronts: ['#E5E7EB', '#1E3A8A', '#FBCFE8'], board: '#1E3A8A',
  soon: ['THE TOWER, MIMES, THE CAN-CAN'],
});
