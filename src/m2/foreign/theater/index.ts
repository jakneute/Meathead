// CULTURES OF THE WORLD: the end of the streets, the sub-boss. STUB (the first job's): the theater's front at the end
// of the promenade (its marquee, its doors), the big health and ammo refill before them (keep it: the sub-boss rule),
// and through the doors (a crude cut for now) on to the helipad. Its owner builds (foreign-spec.md): the proscenium
// stage, the foreground crowd in silhouette the whole time, the smarmy PA narrator ("...BUT NOT AS COOL AS EATING HOT
// DOGS"), the eight showpieces cycling behind the curtain (only living ones come back; damage stays), both sides
// locked once it starts, no i-frames, big HP; the PA's "SPAIN: CANCELLED." per kill. Checkpoints 100-109.
//
// The way in: walked (Canada flows into it). The way on: its doors (DOORS.heli.start). Back from the helipad: its
// doors (DOORS.theater.end).

import type { ForeignSection } from '../section';
import { layOwn, endWalls, endExits, runExits } from '../section';
import { SECTIONS, GY } from '../geometry';
import { viewIn, promenade, setBack, wall, hole, postBoard, onScreen, LOOKS, box, dimmed } from '../kit';

const { x0, x1 } = SECTIONS.theater;
const X = (rx: number) => x0 + rx;

export const theater: ForeignSection = {
  id: 'theater', x0, x1,
  checkpoints: [{ name: 'CULTURES OF THE WORLD', cp: 100, x: X(300), y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'theater', { left: false });
    // (the big refill before the sub-boss's doors)
    state.pickups.push({ id: 'th-health', pos: { x: X(1900), y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
    state.pickups.push({ id: 'th-ammo', pos: { x: X(2000), y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
  },
  update: (ctx, controls) => { runExits(ctx.state, endExits('theater', { left: false })); return controls; },
  drawBack: (c, state) => {
    const v = viewIn(state);
    setBack(c, v, X(1500), 1500, 0.92, () => {
      wall(c, 0, 1500, 360, '#1E3A8A', '#B91C1C');
      for (let k = 0; k < 10; k++) box(c, 40 + k * 145, -340, 20, 340, dimmed('#E5E7EB'));
      hole(c, 1180, -170, 260, 170, true);
    });
    promenade(c, v, x0, x1 + 200, '#E5E7EB', '#6B7280');
    if (onScreen(v, X(1400), X(2400))) postBoard(c, X(1900), GY, ['CULTURES OF THE WORLD', 'COOL. BUT NOT AS COOL AS AMERICA.'], LOOKS.land(2), '#B91C1C', undefined, 150);
    if (onScreen(v, X(2400), X(3000))) postBoard(c, X(2700), GY, ['THE SHOW: COMING SOON', 'DOORS THIS WAY'], LOOKS.land(1), '#1E3A8A', undefined, 100);
  },
  outdoors: () => 1,
};
