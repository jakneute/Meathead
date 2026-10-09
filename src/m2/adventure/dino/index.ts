// THE DINO PARK (a placeholder to walk through: its real build goes here).

import type { Section } from '../section';
import { lay, teleport, box, label } from '../section';
import { SECTIONS, GY } from '../geometry';

const { x0, x1 } = SECTIONS.dino;

export const dino: Section = {
  id: 'dino', x0, x1,
  checkpoints: [{ name: 'THE DINO PARK', cp: 30, x: x0 + 150, y: GY }],
  build: (state) => {
    lay(state, [{ x1: x0, y1: GY, x2: x1, y2: GY, surface: 'concrete' }]);
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player;
    if (p.pos.x + p.width / 2 > SECTIONS.dino.x1 - 120) teleport(state, SECTIONS.temple.x0 + 150, GY);
    return controls;
  },
  drawBack: (c, state) => {
    box(c, x0, GY, x1 - x0, 200, '#57534E');
    if (state.camera.x < x1 && state.camera.x + 800 > x0) label(c, 'THE DINO PARK: TO COME', Math.max(x0 + 200, Math.min(x1 - 200, state.camera.x + 400)), GY - 200, '#FDE047', 10);
  },
};
