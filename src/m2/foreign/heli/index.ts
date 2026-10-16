// HELICOPTER RIDES ACROSS THE WORLD: the second stretch (about half the land). STUB (the first job's): the helipad, a
// crude helicopter, a placeholder walk on to Harry's arena. Its owner builds (foreign-spec.md): boarding (he skips the
// line), HELICOPTER HARRY's tolerance tour over landmark replicas much bigger than the real ones ("IN AMERICA,
// EVERYTHING IS BIGGER. EVEN OTHER PLACES."), "SHUT UP, HIPPIE.", Harry thrown out, the helicopter jacked; then the
// shooter (space/orbit's way, a Cuphead-Djimmi framing round a giant globe; X machine gun, Y up to three homing
// rockets on a cooldown, B the rotor boost that shreds jetpackers, any direction; the helicopter always faces right):
// the souvenir landmarks as googly-eyed mechs one at a time, jetpack goons between; then Harry's rocket and the crash
// (on to Harry's arena). Checkpoints 110-119.
//
// The way in: the theater's doors (DOORS.heli.start). Back: the left end, to the theater. On: the right end (for now).

import type { ForeignSection } from '../section';
import { layOwn, endWalls, endExits, runExits } from '../section';
import { SECTIONS, GY } from '../geometry';
import { viewIn, promenade, postBoard, onScreen, LOOKS, box, INK } from '../kit';
import { drawTodSky } from '../../timeOfDay';

const { x0, x1 } = SECTIONS.heli;
const X = (rx: number) => x0 + rx;

export const heli: ForeignSection = {
  id: 'heli', x0, x1,
  checkpoints: [{ name: 'HELICOPTER RIDES', cp: 110, x: X(200), y: GY }],
  build: (state) => { layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]); endWalls(state, 'heli'); },
  update: (ctx, controls) => { runExits(ctx.state, endExits('heli')); return controls; },
  drawBackdrop: (c) => { drawTodSky(c, 0, 0, 800, 600, ['#1E3A8A', '#2563EB', '#60A5FA', '#BFDBFE'], { horizon: 430, sun: [620, 110], moon: [170, 90] }); return true; },
  drawBack: (c, state) => {
    const v = viewIn(state);
    promenade(c, v, x0 - 200, x1 + 200, '#9CA3AF', '#4B5563');
    // (the helipad's line, the helicopter: a cabin, a tail, the rotor, the skids)
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
