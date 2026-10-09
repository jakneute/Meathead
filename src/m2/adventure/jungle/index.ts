// THE JUNGLE: section 1 of Adventure Land. A real jungle, real animals (animals.ts), vines to swing on and climb
// (vines.ts), laid out in layout.ts; walked out of at the far end into the Jungle Cruise's queue.

import type { EnemyKind } from '../../../m1/types';
import type { Section } from '../section';
import { lay, ledge, teleport, meatheadSays } from '../section';
import { SECTIONS, GY } from '../geometry';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { updateVines, drawVines, drawGrip, onVine, VINE_ROW } from './vines';
import { updateThrown, drawThrown } from './animals';
import { jungleOf } from './state';
import { GROUND, BRANCHES, VINES, ANIMALS, PICKUPS, CHECKPOINTS, X, Y } from './layout';
import { drawJungleBackdrop, drawJungleBack } from './draw';
import { ARRIVE, GORGE, LEAVING } from './lines';

const { x0, x1 } = SECTIONS.jungle;
const pick = (l: string[]) => l[Math.floor(Math.random() * l.length)];

export const jungle: Section = {
  id: 'jungle', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    lay(state, GROUND.map(([a, b, h]) => ({ x1: X(a), y1: Y(h), x2: X(b), y2: Y(h), surface: 'jungle' })));
    for (const [a, b, h] of BRANCHES) ledge(state, X(a), Y(h), X(b) - X(a), { hidden: true });
    jungleOf(state);
    state.player.carried = false;
    for (const [kind, rx, h] of ANIMALS) {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      // (a boa: its head hangs under the branch it's wrapped round)
      if (kind === 'm2:boa') { e.homeX = X(rx); e.homeY = Y(h); e.pos.y = Y(h) + 70; e.initialY = e.pos.y; }
      e.homeX ??= e.pos.x; e.variant = Math.abs(rx) % 7;
      state.enemies.push(e);
    }
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `jungle-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, j = jungleOf(state);
    const rx = p.pos.x + p.width / 2 - x0;
    const out = updateVines(ctx, VINES, controls);
    updateThrown(ctx);
    // What he's got to say about it (once each)
    const once = (k: string, lines: string[]) => { if (!j.said[k]) { j.said[k] = true; meatheadSays(state, pick(lines), false); } };
    if (state.checkpoint === 0 && rx < 400 && state.frame > 40) once('arrive', ARRIVE);
    if (rx > 6700 && p.pos.y < GY - 300) once('gorge', GORGE);
    if (rx > 11400) once('leave', LEAVING);
    // On into the Jungle Cruise's queue
    if (p.pos.x + p.width / 2 > x1 - 120) { if (onVine(state)) j.hold.on = -1; p.carried = false; teleport(state, SECTIONS.queue.x0 + 150, GY); }
    return out;
  },
  drawBackdrop: (c, state) => drawJungleBackdrop(c, state),
  drawBack: (c, state) => { drawJungleBack(c, state); drawVines(c, state, VINES); },
  drawFront: (c, state) => { drawThrown(c, state); drawGrip(c, state); },
  cameraRow: (state) => (onVine(state) ? VINE_ROW : 500),
};
