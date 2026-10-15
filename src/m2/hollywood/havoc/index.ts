// THE HAVOC: section 6 of Hollywood Land (owner: the havoc agent). Disaster: The Ride's lever made it real: every
// natural disaster at once, a total juxtaposition. High winds (pushing him, flinging debris), lava rivers, crumbling
// buildings, quakes, hail, a blizzard's avalanches. A forced-forward climb UP (in -y from GY, as far as it needs) as the
// flood rises under him and buildings are demolished round him. A TORNADO chasing him: if it hits him, he dies; he
// takes cover where the snow avalanches come down (the avalanche sheds it, or the cover holds while it passes). At the
// end the tornado catches him and flings him (a cutscene: HUD hidden, skip all-or-nothing) onto Stuntman Steve's stunt
// stage (on to stunt's start). If he died to the tornado before, he breaks the fourth wall on the way: "NORMALLY YOU
// KILL ME, BUT BECAUSE THIS IS A CUTSCENE I JUST MOVE TO THE NEXT SCRIPTED SET PIECE. OKAY. MAKES PERFECT SENSE."
//
// Every new way to hurt him here (wind debris, lava, the flood, falling buildings, the tornado) gets voiced hurt and
// death lines. The hazards hurt enemies too (nobody idles in them; they can be knocked in).
//
// Target: ~19500 px of play (the climb counted by how long it plays), ~4 min. Checkpoints 50-59. Outdoors: the time of
// day's light, under whatever the disasters do to the sky.
//
// One-way set piece: the fling. The way back from the stunt stage (DOORS.havoc.end) puts him where the tornado caught
// him, on the ground; keep that spot reachable on foot both ways. Revisits differ: the tornado's spent (no chase), the
// flood's gone down and left the wreckage, the climb's still climbable (destruction never locks the way back).

import type { HollywoodSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop, steveFlier, landVisit } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.havoc;

// ---------------------------------------------------------------------------------------------------------------
// Died to the tornado: kept here, not on the stage (state.stage is rebuilt every death), so it outlives the death;
// it starts over on a fresh way into the land (section.ts's landVisit), never on a respawn.

let tornadoVisit = -1, tornadoDeaths = 0;
/** He just died to the tornado (call it from the kill). */
export const noteTornadoDeath = () => { if (tornadoVisit !== landVisit()) { tornadoVisit = landVisit(); tornadoDeaths = 0; } tornadoDeaths++; };
/** Has the tornado killed him on this visit to the land? (the fling's fourth-wall line) */
export const diedToTornado = () => tornadoVisit === landVisit() && tornadoDeaths > 0;

export const havoc: HollywoodSection = {
  id: 'havoc', x0, x1,
  checkpoints: [{ name: 'REAL DISASTERS', cp: 50, x: DOORS.havoc.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'havoc');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('havoc'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { sky: ['#1C1917', '#44403C', '#7C2D12', '#EA580C'], far: '#292524', hill: true }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#3F3F46', '#A8A29E');
    postSign(c, x0 + 600, GY, 'HAVOC: PLACEHOLDER');
    steveFlier(c, x0 + 2400, GY - 130, 'flier', 2);
    postSign(c, x0 + 9000, GY, 'THE FLOOD CLIMB (UP)');
    postSign(c, x1 - 1500, GY, 'THE TORNADO CATCHES HIM');
    postSign(c, x1 - 400, GY, 'THIS WAY (FLUNG)');
  },
  outdoors: () => 1,
  wires: () => [],
};
