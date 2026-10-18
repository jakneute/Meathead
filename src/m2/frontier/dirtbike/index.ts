// THE DIRT-BIKE CHASE: section 6 of Wilderness Land, the TEENAGERS sub-boss. The user's design (frontier-spec.md,
// verbatim there): made to look like Road Rash on the Genesis, not Mode 7, with the effects Genesis games used to fake
// a turning road. X / left click (shoot) attacks left, B / right click (charge) attacks right, A jumps. Trees, cows and
// other wildlife by the roadside to bail into (heavy damage, a quick respawn; it only kills him low on health). The
// teens have weapons; instead of stealing them, he PARRIES: attack as they swing and they're done (grab the bike chain,
// swing the teen over his head and toss them forward: a little human bomb ahead of him; and the others: chase.ts).
//
//   road.ts   the segment road (generated as he rides, by stretch), its projection, its drawing, the parallax
//   art.ts    the roadside things (painted once, scaled), the riders from behind (him, the teens, Tucker)
//   chase.ts  the mode itself: riding, the teens' waves and swings, the parries, bails, Tucker glimpsed ahead, the
//             sub-boss bar, the end; drawn over the whole screen from drawHud
//   lines.ts  every line, clean / shitty / naked; the new hurts and their death screens
//
// The side view (this file): a short stretch of dirt trail. In off the bounty's ride (woods/scene.ts
// takeBountyHandoff) he's straight into the chase on the kid's bike; walked in on foot (a checkpoint before the bounty,
// say) the bike's parked there: walk onto it. Once it's on, there's no leaving it (the sub-boss rule) till the last teen
// goes down; then the cut to the arena (DOORS.arena.start, takeChaseHandoff for job 7's catch-up). Checkpoints 50-55,
// one a stretch: starting again at one puts him straight back on the bike there, the stretches before it beaten.
// Afterward (TEENS_MEMO, never again): the trail's empty but for the wrecks, walkable both ways (the woods behind, the
// arena ahead).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import type { FrontierSection } from '../section';
import { layOwn, endWalls, runExits, frontierState, hands, type Exit } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { frontierSky, onScreen, box, mix } from '../kit';
import { takeBountyHandoff } from '../woods/scene';
import { drawDirtBike } from '../woods/teens';
import { WAVES, inChase, startChase, updateChase, drawChase, teensDone } from './chase';

export { takeChaseHandoff, TEENS_MEMO } from './chase';

const { x0 } = SECTIONS.dirtbike;
const x1 = SECTIONS.dirtbike.x1;
/** The side view's length (the rest of the section's x room is unused: the chase is its own view). */
const LEN = 1800;
const BIKE_X = x0 + 460, CP_X = x0 + 600;
DOORS.dirtbike.end = { x: x0 + LEN - 300, y: GY };

interface Side { pending: number | null; first: boolean }
/** (its own slot in the stage's section states, beside the chase's 'dirtbike') */
const sideOf = (state: GameState) => frontierState<Side>(state, 'dirtbike-side' as 'dirtbike', () => ({ pending: null, first: true }));

const exits = (done: boolean): Exit[] => [
  ...(done ? [{ x0: x0 + LEN - 60, x1: x0 + LEN, yTop: GY - 40, yBot: GY + 2, to: DOORS.arena.start }] : []),
];

export const dirtbike: FrontierSection = {
  id: 'dirtbike', x0, x1,
  checkpoints: [
    { name: WAVES[0].name, cp: 50, x: DOORS.dirtbike.start.x, y: GY },
    ...WAVES.slice(1).map((w, i) => ({ name: w.name, cp: 51 + i, x: CP_X, y: GY, manual: true })),
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x0 + LEN + 200, y2: GY, surface: 'dirt' }]);
    endWalls(state, 'dirtbike', { right: false });
    state.blocks.push({ x: x0 + LEN, y: -6000, w: 40, h: 8000, type: 'wall', hidden: true, tag: 'dirtbike-end' });
    const s = sideOf(state);
    s.first = true;
    // (starting again inside the chase: straight back on the bike at that stretch)
    s.pending = !teensDone(state) && state.checkpoint >= 50 && state.checkpoint <= 50 + WAVES.length - 1 ? state.checkpoint - 50 : null;
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = sideOf(state);
    if (inChase(state)) return updateChase(ctx, controls);
    if (s.first) {
      s.first = false;
      const fromBounty = takeBountyHandoff();
      if (!teensDone(state) && (fromBounty || s.pending !== null)) { startChase(state, fromBounty ? 0 : s.pending ?? 0, fromBounty); s.pending = null; return hands(); }
    }
    const done = teensDone(state);
    // (walked in on foot: the bike's parked there; onto it and off he goes)
    if (!done && p.health > 0 && !p.inCutscene && Math.abs(p.pos.x + p.width / 2 - BIKE_X) < 30 && p.isGrounded) { startChase(state, 0, false); return hands(); }
    runExits(state, exits(done));
    return controls;
  },
  cameraX: () => ({ min: x0, max: x0 + LEN - CANVAS_WIDTH }),
  drawBackdrop: (c, state) => (inChase(state) ? true : frontierSky(c, state, { far: '#7C8CA8', near: '#2F4A2A' })),
  drawBack: (c, state) => {
    if (inChase(state)) return;
    const f = state.frame;
    // (real woods either side of a dirt trail)
    for (let x = x0 - 100; x < x0 + LEN + 100; x += 70) {
      if (!onScreen(state, x - 40, x + 40)) continue;
      const h = 150 + ((x * 37) % 60), tone = (x / 70) % 2 ? '#24432A' : '#2E5232';
      box(c, x - 4, GY - 40, 8, 40, '#4A2E18');
      for (let k = 0; k < 3; k++) { c.fillStyle = mix(tone, '#000000', k * 0.08); c.beginPath(); c.moveTo(x - 34 + k * 8, GY - 30 - k * (h / 4)); c.lineTo(x, GY - h - k * 6); c.lineTo(x + 34 - k * 8, GY - 30 - k * (h / 4)); c.closePath(); c.fill(); }
    }
    box(c, x0 - 200, GY, LEN + 400, 400, '#5A4024'); box(c, x0 - 200, GY, LEN + 400, 4, '#8A6A3A');
    for (let x = x0; x < x0 + LEN; x += 23) box(c, x, GY + 8 + ((x * 7) % 9), 10, 2, '#4A341C');
    if (!teensDone(state)) {
      // (the kid's bike he rode in on, parked, ticking over)
      if (onScreen(state, BIKE_X - 60, BIKE_X + 60)) drawDirtBike(c, BIKE_X, GY, 1, 1, 0, 0, '#DC2626', 7);
    } else {
      // (after: the wrecks they left, bikes on their sides in the ditch)
      for (const [dx, col, rot] of [[700, '#2563EB', 1.4], [980, '#16A34A', -1.5], [1260, '#F59E0B', 1.6]] as const) {
        const bx = x0 + dx;
        if (!onScreen(state, bx - 60, bx + 60)) continue;
        c.save(); c.translate(bx, GY - 6); c.rotate(rot * 0.2); drawDirtBike(c, 0, 6, rot > 0 ? 1 : -1, 1, rot * 0.6, f * 0, col, 3 + dx % 9); c.restore();
      }
    }
  },
  drawHud: (c, state) => { if (inChase(state)) drawChase(c, state); },
  outdoors: () => 1,
};
