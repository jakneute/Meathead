// HELICOPTER RIDES ACROSS THE WORLD: the second stretch (about half the land). Walked into off the end of Canada (no
// cut: the helipad's on the promenade at the end of the streets). STUB for now: the helipad, the big refill and its
// checkpoint before the ride, a crude helicopter, a placeholder walk on to Harry's arena.
//
// The way on: the right end (for now) to Harry's arena (DOORS.harry.start). Back: walked, along the streets.

import type { ForeignSection } from '../section';
import { layOwn, endWalls, endExits, runExits } from '../section';
import { SECTIONS, GY } from '../geometry';
import { viewIn, promenade, postBoard, onScreen, LOOKS, box, INK } from '../kit';

const { x0, x1 } = SECTIONS.heli;
const X = (rx: number) => x0 + rx;

export const heli: ForeignSection = {
  id: 'heli', x0, x1,
  checkpoints: [{ name: 'HELICOPTER RIDES', cp: 110, x: X(500), y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'heli', { left: false });
    // (the big refill before the ride: the boss-door rule)
    state.pickups.push({ id: 'hl-health', pos: { x: X(400), y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
    state.pickups.push({ id: 'hl-ammo', pos: { x: X(440), y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
  },
  update: (ctx, controls) => { runExits(ctx.state, endExits('heli', { left: false })); return controls; },
  drawBack: (c, state) => {
    const v = viewIn(state);
    promenade(c, v, x0, x1 + 200, '#9CA3AF', '#4B5563');
    if (onScreen(v, X(1100), X(1900))) {
      box(c, X(1200), GY - 2, 400, 2, '#FDE047');
      box(c, X(1300), GY - 120, 160, 100, INK); box(c, X(1302), GY - 118, 156, 96, '#F8FAFC');
      box(c, X(1460), GY - 90, 220, 20, INK); box(c, X(1462), GY - 88, 216, 16, '#F8FAFC');
      box(c, X(1240), GY - 136, 300, 6, INK);
      box(c, X(1310), GY - 20, 140, 6, INK);
    }
    if (onScreen(v, X(300), X(900))) postBoard(c, X(600), GY, ['HELICOPTER RIDES ACROSS THE WORLD', 'COMING SOON'], LOOKS.land(1), '#1E3A8A', undefined, 120);
  },
  outdoors: () => 1,
};
