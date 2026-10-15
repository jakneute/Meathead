// THE COASTER: section 2 of Hollywood Land (owner: the coaster agent). THRONES OF THE STARS: an outdoor roller
// coaster, absurdly huge and absurdly impossible (a theme-park-sim monstrosity: loops on loops, twists, a 'suicide
// coaster' run of ever smaller loops). He skips the line (as everywhere, callously) and hops in the seat. Not a tracked
// ride he steers: a ride with stops. Each ride is a show (the camera on the train through the loops; he loves it, never
// nauseous), then a stop: a TOILET A FAMOUS PERSON SHAT IN, on a plinth like a relic (three stops, each more grotesque
// than the last). At each stop, park employees pile out to kill the line cutter: kill them all before the train will
// take him on. At the third stop, past the employees, a guy asleep in a control booth by a lever: flipped to
// EXPERIMENTAL, the next ride launches him off the track and through the warehouse's wall (on to the warehouse's
// start; its walls all come down).
//
// Target: ~15000 px (the rides counted by how long they play, plus three stop fights), ~3 min. Checkpoints 10-19
// (one at each stop). Outdoors: the time of day's light.
//
// One-way set piece: the launch. The way back from the warehouse (DOORS.coaster.end) puts him at the third stop, by
// the booth; give him a way down from there (the train back to the station with the lever off, or the stop's service
// stairs) and say so here. Revisits differ: the booth's lever stays flipped, the sleeper gone, the track bent where he
// left it.

import type { HollywoodSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop, steveFlier } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.coaster;

export const coaster: HollywoodSection = {
  id: 'coaster', x0, x1,
  checkpoints: [{ name: 'THRONES OF THE STARS', cp: 10, x: DOORS.coaster.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'metal' }]);
    endWalls(state, 'coaster');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('coaster'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { sky: ['#1E3A8A', '#3B82F6', '#93C5FD', '#FDE68A'], far: '#7F1D1D', hill: true }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#3F3F46', '#A1A1AA');
    postSign(c, x0 + 600, GY, 'THRONES OF THE STARS: PLACEHOLDER');
    steveFlier(c, x0 + 1200, GY - 130, 'flier', 2);
    postSign(c, x0 + 5000, GY, 'STOP 1');
    postSign(c, x0 + 9000, GY, 'STOP 2');
    postSign(c, x0 + 13000, GY, 'STOP 3: THE BOOTH');
    postSign(c, x1 - 400, GY, 'THIS WAY (LAUNCH)');
  },
  outdoors: () => 1,
};
