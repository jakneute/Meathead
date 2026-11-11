import { type Ctx, R, blockI, poly, ell, sign, windows, star } from './kit';

// ---------------------------------------------------------------------------------------------------------------
// AMERICA USA (the hub's gate land: Main Street USA, flags, a fake capitol dome over the gate)

export const paintAmerica = (g: Ctx) => {
  // (the gate's capitol dome, white, on its drum; the flags down either side; the brick main street)
  for (const [x, w, h, col] of [[-130, 46, 30, '#B4533A'], [-82, 40, 36, '#C8A878'], [40, 44, 34, '#7A9AB4'], [86, 44, 28, '#B4533A']] as const) {
    blockI(g, x, -h, w, h, col, '#FFF1D6', '#5A2A1C'); windows(g, x + 3, -h + 4, w - 6, h - 12, 4, 2, '#24324A', '#FDE68A', x);
    R(g, x - 2, -h - 3, w + 4, 3, '#F8FAFC'); R(g, x + w / 2 - 6, -10, 12, 10, '#3A2414');
  }
  blockI(g, -38, -34, 76, 34, '#F1EDE4', '#FFFFFF', '#A8A094');
  for (let k = 0; k < 6; k++) R(g, -34 + k * 13, -30, 4, 26, '#D8D2C4');
  poly(g, [-40, -34, 0, -44, 40, -34], '#E8E2D6');
  ell(g, 0, -52, 18, 12, '#F8F6F0'); R(g, -18, -52, 36, 8, '#F8F6F0'); R(g, -1, -70, 2, 8, '#E5E7EB'); ell(g, 0, -71, 2, 2, '#FDE047');
  for (const x of [-120, -60, 60, 120]) { R(g, x, -60, 1, 60, '#D4D4D8'); for (let s = 0; s < 4; s++) R(g, x + 1, -60 + s * 2, 12, 1, s % 2 ? '#F8FAFC' : '#DC2626'); R(g, x + 1, -60, 5, 4, '#1D4ED8'); }
  sign(g, 'AMERICA USA', 0, -30, -2, '#1D4ED8', '#F8FAFC', 6, false);
  for (let x = -126; x < 130; x += 14) star(g, x, -1, 3, '#FDE047');
};
