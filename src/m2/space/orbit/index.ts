// THE ORBIT: section 6 of Space Land (owner: the shooter agent). The land's new mechanic: a side-scrolling space
// shooter (Cuphead's plane levels). Free flight: up, down, left, right; he faces right only; the ray gun only, and in
// space it fires rapid (some dumb reason why, said). Aliens (Zorblax's people, pissed he killed him in the last game:
// new M2 kinds in his species' look) come after him: fighter formations, kamikazes, turret pods, asteroid and junk
// fields, mines, beam sweeps. Teach it, then escalate. The sub-boss: a flying saucer (arena locked till it dies, never
// respawned once past; a big health + ammo refill before it). Hurt enough, it abducts him; unseen inside, he says
// "MORNING, LADIES." / "AFTERNOON, LADIES." / "EVENING, LADIES." by timeOfDay(); the saucer explodes; a speedline zoom
// on it crashing back to earth: on to the crater section's start.
//
// THE FLIGHT HOOK (section.ts's Flight, reserved for this section): return a Flight from `flight` while he's flying.
// The stage (index.ts) then keeps him to the ray gun (no switching, no specials) and stores it on the stage
// (spaceFlight(state)); this section's update gets the raw controls and returns what the engine gets. The flying
// itself (no gravity, the movement, facing right, the rapid fire) is this section's to build, with any engine hook it
// needs.
//
// Target: ~20000 px of scrolling, ~3 min. Checkpoints 50-59. Outer space is space (no time of day).

import type { SpaceSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.orbit;

export const orbit: SpaceSection = {
  id: 'orbit', x0, x1,
  checkpoints: [{ name: 'ORBIT', cp: 50, x: DOORS.orbit.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'metal' }]);
    endWalls(state, 'orbit');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('orbit'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { flat: '#02020A', far: '#0F172A', stars: true }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#1E293B', '#475569');
    postSign(c, x0 + 600, GY, 'ORBIT: PLACEHOLDER');
    postSign(c, x1 - 400, GY, 'THIS WAY');
  },
  // (free flight: the shooter's to build. Return a Flight (section.ts) while he's flying; null on foot.)
  flight: () => null,
};
