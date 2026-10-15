// THE WAREHOUSE: section 3 of Hollywood Land (owner: the warehouse agent). The coaster's launch bursts him in through
// the wall and all its walls come down: they were secretly filming the next big superhero team-up (THE REVENGERS) here
// for a tax write-off, and now the whole public knows. Cast and crew are pissed. Green-screen sets (half-built hero
// sets, mocap suits, a city skyline on a flat, crash mats), a platforming fight through the film crew (new M2 kinds:
// grips, boom ops, ADs with headsets, craft services). At the end: the script, in a glass case, guarded like a temple
// idol. Before he gets near, the principal cast are all there, dozens of them: THE ENSEMBLE CAST, the sub-boss (dozens
// of low-HP goons, every one distinct, every one an A-lister: legally distinct parodies, seeded variants). Kill them
// all; then he kicks the glass case and the pages go flying for the onlookers to grab: the script leaked (a cutscene
// beat: HUD hidden, skip all-or-nothing).
//
// SUB-BOSS RULES: open before it starts; once it's on, both sides lock till every one of them is dead; never
// respawned once past (its checkpoint gets a `clear`); clean / shitty / naked line pools for every line group; a big
// health + ammo refill before it.
//
// Target: ~12500 px of play + the Ensemble Cast, ~2.5 min + the fight. Checkpoints 20-29. Indoors (the walls down:
// daylight in through the gaps is this section's own lighting call).
//
// Revisits differ: walls down for good, the sets wrecked, the script's pages all over, the glass case empty.

import type { HollywoodSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, postSign, placeholderBackdrop, steveFlier } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.warehouse;

export const warehouse: HollywoodSection = {
  id: 'warehouse', x0, x1,
  checkpoints: [{ name: 'THE SECRET WAREHOUSE', cp: 20, x: DOORS.warehouse.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'warehouse');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('warehouse'));
    return controls;
  },
  drawBackdrop: (c, state) => placeholderBackdrop(c, state, { flat: '#0F1A0F', far: '#16A34A' }),
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#27272A', '#71717A');
    postSign(c, x0 + 600, GY, 'THE WAREHOUSE: PLACEHOLDER');
    steveFlier(c, x0 + 3400, GY - 150, 'flier');
    postSign(c, x1 - 1500, GY, 'THE ENSEMBLE CAST: COMING SOON');
    postSign(c, x1 - 400, GY, 'THIS WAY');
  },
};
