// JAPAN: section 6 of the streets. STUB (the first job's): a placeholder walk-through. Its owner builds (foreign-spec.md):
// a five-story pagoda climbed floor by floor, torii gates, a koi pond, a vending-machine alley; ninjas (smoke bombs,
// blinking about), a sumo wrestler (a big shove), a samurai (pointy: punishes the charge, KindDef.pointy), an anime
// cosplay kid. Checkpoints 50-59. Flows on from Italy and into Morocco (no walls, no doors).

import { stubPavilion } from '../stub';

export const japan = stubPavilion({
  id: 'japan', cp: 50, name: 'JAPAN', sign: ['JAPAN', 'A TASTE OF ASIA (CHINA)'], fronts: ['#DC2626', '#F5F5F4', '#1C1917'], board: '#7F1D1D',
  soon: ['THE PAGODA, NINJAS, SUMO'],
});
