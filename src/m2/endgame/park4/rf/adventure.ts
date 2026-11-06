// SAFARI ARTIE's refight (PRIDE): hell's knockoff of his clearing, Jungle Land's own boss fight run whole
// (adventure/clearing/fight.ts) at 999. The owner's: "artie is agitated like the rest. a hellish tour guide now. once
// again exasperated he has to amuse the guest who killed him. the animals he summons are hellish version of the ones
// in the normal fight." His lines swapped (park4/lines/adventure.ts); the herd hell's (fire down their backs, red eyes,
// an extra horn: setBeastOverlay, the same beasts and moves); stitched up the way he died: gored (the rhino's hole
// through his gut, plugged with a coconut, his folded spine seamed) or eaten (a mannequin's parts sewn in for the
// litter's bites).

import type { RefightDef } from '../defs';
import { advLayout } from '../../../adventure/index';
import { GY } from '../../../adventure/geometry';
import { ARENA_L, ARENA_R } from '../../../adventure/clearing/arena';
import * as A from '../../../adventure/clearing/lines';
import { setBeastOverlay } from '../../../adventure/clearing/stampede';
import { bossDeath } from '../../../store';
import { inRefight } from '../hook';
import { refightId, refightStage } from '../where';
import * as L from '../lines/adventure';

// (the herd, hell's: flames along the back, a horn more, eyes lit)
setBeastOverlay((c, kind, w, h, fr) => {
  if (!inRefight('adventure')) return;
  const flick = fr % 4;
  for (let i = 0; i < 5; i++) {
    const x = -w * 0.35 + i * w * 0.16, top = -h * (kind === 'elephant' ? 0.98 : 0.92);
    c.fillStyle = i % 2 ? '#F97316' : '#EF4444';
    c.beginPath(); c.moveTo(x - 6, top + 6); c.lineTo(x, top - 10 - ((i + flick) % 3) * 4); c.lineTo(x + 6, top + 6); c.closePath(); c.fill();
  }
  c.fillStyle = '#FDE047';
  c.fillRect(Math.round(w * (kind === 'elephant' ? 0.32 : 0.36)), Math.round(-h * 0.7), 4, 3);
  if (kind === 'rhino') { c.fillStyle = '#2A0A0A'; c.beginPath(); c.moveTo(w * 0.3, -h * 0.85); c.lineTo(w * 0.36, -h * 1.15); c.lineTo(w * 0.4, -h * 0.82); c.closePath(); c.fill(); }
});

export const adventureRefight: RefightDef = {
  land: 'adventure', id: refightId('adventure'), stage: refightStage('adventure'),
  boss: 'SAFARI ARTIE', sin: 'PRIDE',
  inner: advLayout, cp: 71,
  sign: { pic: 'dinosaur', word: 'DINOSAUR', color: '#65A30D' },
  looks: ['normal', 'weakness'],
  lookNow: () => bossDeath('adventure') ?? 'normal',
  lookName: l => (l === 'weakness' ? 'EATEN ALIVE (WEAKNESS)' : 'GORED BY A RHINO'),
  swaps: () => [
    [A.ARTIE_ENTRANCE, L.RF_ARTIE_ENTRANCE], [A.ARTIE_START, L.RF_ARTIE_START], [A.ARTIE_CUPS, L.RF_ARTIE_CUPS],
    [A.ARTIE_WHISTLE, L.RF_ARTIE_WHISTLE], [A.ARTIE_DART, L.RF_ARTIE_DART], [A.ARTIE_GRAB, L.RF_ARTIE_GRAB],
    [A.ARTIE_KNOCKED, L.RF_ARTIE_KNOCKED], [A.ARTIE_LAST_WHISTLE, L.RF_ARTIE_LAST_WHISTLE], [A.ARTIE_DIES, L.RF_ARTIE_DIES],
    [A.ARTIE_EATEN, L.RF_ARTIE_EATEN], [A.ARTIE_BONES, L.RF_ARTIE_BONES],
  ],
  arena: () => ({ l: ARENA_L - 60, r: ARENA_R + 40, floor: GY }),
  stitches: look => look === 'weakness'
    // (eaten: a store mannequin's beige plastic sewn in where the litter bit him off: an arm, a thigh, half his face)
    ? { thread: '#1A1A1A', patch: '#E8D2B4', seams: [[0.1, 0.2, 0.9, 0.24], [0.2, 0.52, 0.8, 0.5], [0.3, 0.75, 0.32, 0.98]], patches: [[0.55, 0.06, 0.35, 0.14], [0.6, 0.3, 0.3, 0.2], [0.1, 0.62, 0.32, 0.28]], staples: [[0.5, 0.18], [0.22, 0.6]] }
    // (gored: the hole the horn left through his gut, a coconut half plugged in it; his back, folded, seamed)
    : { thread: '#F5F5F4', patch: '#7C4A1E', seams: [[0.15, 0.3, 0.85, 0.62], [0.2, 0.2, 0.25, 0.7]], patches: [[0.36, 0.42, 0.28, 0.16]], staples: [[0.5, 0.36], [0.5, 0.66], [0.2, 0.22]] },
};
