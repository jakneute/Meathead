// THE BLVD: section 1 of Hollywood Land (owner: the outdoors agent). Hollywood Blvd, or a cheap imitation of it: the
// Walk of Fame's stars in the pavement (for nobodies and things: THE GUY WHO SAID 'CUT' ONCE, a stunt dog's
// understudy, a blank YOUR NAME HERE $49.99), plywood facades with their bracing showing round the back, AS SEEN IN
// plaques on a bench and a hydrant behind velvet ropes. Costumed impersonators (legally distinct Marilyn, Elvis and the
// rest: new M2 kinds, seeded variants) come at him for photos and money (PHOTOS $20, tip jars); he answers with
// violence. Fairly standard platforming (mobility plus offense, teach then escalate) till it gets more interesting.
// Stuntman Steve's fliers on every pole. At its end, the way on to THRONES OF THE STARS.
//
// THE NEW MECHANIC IS THIS SECTION'S TO BUILD FIRST: STUNT WIRES (section.ts's StuntWire; return them from `wires`).
// Grab the harness, the rig pulls him along and up, he swings under it, he lets go (flung off its speed) or is let go
// at its end. Teach it here (safe first, then over a gap, then under fire); the other sections use it as built. Put the
// wire code where every section can reach it (say hollywood/wires.ts, appended to OWNERSHIP.md) with any engine hook
// it needs (append minimally).
//
// Target: ~11500 px of play, ~2.3 min. Checkpoints 0-9. Outdoors: the time of day's light (timeOfDay.ts).

import type { HollywoodSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop, steveFlier } from '../section';
import { SECTIONS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.blvd;

export const blvd: HollywoodSection = {
  id: 'blvd', x0, x1,
  checkpoints: [{ name: 'HOLLYWOOD BLVD', cp: 0, x: x0 + 150, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'blvd');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('blvd'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { sky: ['#1E3A8A', '#3B82F6', '#93C5FD', '#FDE68A'], far: '#78716C', hill: true }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#52525B', '#D4D4D8');
    postSign(c, x0 + 600, GY, 'HOLLYWOOD BLVD: PLACEHOLDER');
    steveFlier(c, x0 + 1100, GY - 60, 'standee');
    steveFlier(c, x0 + 3000, GY - 120, 'flier', 1);
    steveFlier(c, x0 + 6500, GY - 140, 'poster');
    postSign(c, x1 - 400, GY, 'THRONES OF THE STARS THIS WAY');
  },
  outdoors: () => 1,
  // (the stunt wires: this section builds them; none rigged yet)
  wires: () => [],
};
