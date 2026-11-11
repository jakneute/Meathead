import { type Ctx, INK, R, blockI, poly, ell, sign } from './kit';

// ---------------------------------------------------------------------------------------------------------------
// FUTURE LAND (stand-ins), and SPACE NEEDLE 2 (the throw: it reaches space, so it's tall)

export const paintFutureSquare = (g: Ctx) => {
  for (const [x, w, h] of [[-90, 40, 22], [-40, 36, 28], [40, 44, 24]] as const) { blockI(g, x, -h, w, h, '#F1F5F9', '#FFFFFF', '#94A3B8'); poly(g, [x - 6, -h, x + w + 8, -h - 8, x + w + 8, -h - 5, x - 6, -h + 2], '#14B8A6'); R(g, x + 4, -h + 6, w - 8, 3, '#A5F3FC'); }
  R(g, -100, -36, 200, 3, '#CBD5E1'); for (const x of [-80, -20, 40, 90]) R(g, x, -33, 2, 33, '#94A3B8'); for (let k = 0; k < 5; k++) blockI(g, -60 + k * 12, -42, 10, 6, '#F97316', '#FDBA74', '#9A3412');
  sign(g, 'PEOPLE MOVER', 0, -58, -42, '#14B8A6', '#F8FAFC', 5, false);
};
export const paintAtom = (g: Ctx) => {
  R(g, -2, -52, 4, 52, '#CBD5E1'); R(g, -12, -4, 24, 4, '#94A3B8');
  for (const [ry, rot] of [[14, -0.5], [14, 0.5], [12, 1.57]] as const) { g.save(); g.translate(0, -70); g.rotate(rot); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 40, ry, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#E5E7EB'; g.lineWidth = 1; g.stroke(); g.restore(); }
  ell(g, 0, -70, 18, 18, '#C4B5FD'); ell(g, -5, -75, 6, 5, '#EDE9FE', false); R(g, -18, -71, 36, 2, '#7C3AED');
  sign(g, 'THE GIANT ATOM', 0, -24, -4, '#7C3AED', '#F8FAFC', 5);
};
export const paintVoyage = (g: Ctx) => {
  blockI(g, -60, -30, 120, 30, '#E2E8F0', '#FFFFFF', '#94A3B8'); g.beginPath(); g.ellipse(0, -30, 60, 14, 0, Math.PI, 0); g.fillStyle = '#CBD5E1'; g.fill(); g.strokeStyle = INK; g.stroke();
  poly(g, [-20, -40, 20, -40, 30, -34, -10, -34], '#F97316'); R(g, -40, -16, 80, 6, '#0EA5E9');
  sign(g, 'VOYAGE TO 2010', 0, -60, -44, '#0EA5E9', '#F8FAFC', 5, false);
};
export const paintMonorail = (g: Ctx) => {
  R(g, -120, -26, 240, 4, '#CBD5E1'); R(g, -120, -26, 240, 1, '#FFFFFF'); for (let x = -110; x < 120; x += 40) R(g, x, -22, 4, 22, '#94A3B8');
  blockI(g, -60, -38, 90, 12, '#F8FAFC', '#FFFFFF', '#94A3B8'); poly(g, [30, -38, 44, -32, 30, -26], '#DC2626'); R(g, -56, -35, 84, 3, '#38BDF8');
  R(g, -110, -4, 220, 4, '#0EA5E9');
  sign(g, 'LAGOON MONORAIL', -80, -56, -40, '#DC2626', '#F8FAFC', 5);
};
export const paintXenoscare = (g: Ctx) => {
  blockI(g, -50, -36, 100, 36, '#3F3F46', '#71717A', '#18181B');
  for (let k = 0; k < 8; k++) { g.strokeStyle = '#D6D3D1'; g.lineWidth = 2; g.beginPath(); g.arc(-40 + k * 11, -14, 8, Math.PI, 0); g.stroke(); }
  R(g, -10, -24, 20, 24, '#0A0A0A'); g.fillStyle = 'rgba(200, 200, 210, 0.4)'; g.fillRect(-14, -8, 28, 8);
  sign(g, 'XENOSCARE', 0, -52, -38, '#16A34A', '#0A0A0A', 6);
};
/** SPACE NEEDLE 2: three white legs to a waist, the shaft "up forever", saucer decks getting smaller, a beacon. Its box
 *  runs off the top of the screen (it reaches space). */
export const NEEDLE_H = 640;
export const paintNeedle = (g: Ctx) => {
  for (const s of [-1, 0, 1]) poly(g, [s * 30 - 3, 0, s * 30 + 3, 0, s * 3 + 2, -90, s * 3 - 2, -90], '#F1F5F9');
  R(g, -3, -NEEDLE_H + 20, 6, NEEDLE_H - 100, '#E2E8F0'); R(g, -3, -NEEDLE_H + 20, 2, NEEDLE_H - 100, '#FFFFFF'); R(g, 2, -NEEDLE_H + 20, 1, NEEDLE_H - 100, '#94A3B8');
  for (let k = 0; k < 5; k++) { const y = -110 - k * 110, w = 34 - k * 5; ell(g, 0, y, w, 5, '#F8FAFC'); R(g, -w, y, w * 2, 2, '#38BDF8'); }
  ell(g, 0, -NEEDLE_H + 16, 3, 3, '#EF4444');
  sign(g, 'SPACE NEEDLE 2', 0, -60, -60, '#0EA5E9', '#F8FAFC', 5, false);
};
