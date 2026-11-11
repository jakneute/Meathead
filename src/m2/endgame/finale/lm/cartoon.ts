import { type Ctx, INK, R, blockI, poly, ell, line, txt, sign, tree } from './kit';

// ---------------------------------------------------------------------------------------------------------------
// CARTOON LAND (stand-ins)

export const paintSilly = (g: Ctx) => {
  for (let k = 0; k < 7; k++) tree(g, -90 + k * 28, 24 + (k % 3) * 6, 'lolly', [['#F472B6', '#FBCFE8'], ['#A855F7', '#E9D5FF'], ['#FDE047', '#FEF9C3']][k % 3] as [string, string]);
  R(g, -30, -8, 60, 8, '#F9A8D4'); ell(g, 0, -10, 26, 6, '#C084FC'); for (let k = 0; k < 6; k++) R(g, -22 + k * 9, -24, 2, 14, '#F8FAFC'); poly(g, [-28, -24, 0, -40, 28, -24], '#F472B6');
  sign(g, 'WUMPLE-GO-ROUND', 0, -60, -44, '#FDE047', '#9D174D', 4);
};
export const paintCwTower = (g: Ctx) => {
  for (const [x0, x1] of [[-18, -8], [18, 8], [-6, -3], [6, 3]] as const) { g.strokeStyle = '#C084FC'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, 0); g.quadraticCurveTo(x0 * 1.6, -30, x1, -52); g.stroke(); }
  ell(g, 0, -68, 22, 18, '#F472B6'); R(g, -22, -66, 44, 7, '#7C3AED'); txt(g, 'CARTOON LAND', 0, -60, '#FDE047', 3);
  ell(g, -8, -76, 5, 5, '#F8FAFC'); ell(g, 8, -76, 5, 5, '#F8FAFC'); R(g, -7, -76, 3, 3, INK); R(g, 7, -75, 3, 3, INK);
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(0, -70, 8, 0.2, Math.PI - 0.2); g.stroke(); R(g, -3, -63, 3, 3, '#F8FAFC'); R(g, 1, -63, 3, 3, '#F8FAFC');
  ell(g, 0, -88, 10, 4, '#FDE047'); line(g, 0, -92, 0, -96, INK); line(g, -6, -96, 6, -96, '#60A5FA', 2);
};
export const paintStudio = (g: Ctx) => {
  blockI(g, -60, -40, 120, 40, '#FDE68A', '#FFFBEB', '#A16207'); for (let k = 0; k < 6; k++) R(g, -56 + k * 20, -34, 12, 12, '#60A5FA');
  R(g, -14, -20, 28, 20, '#7C2D12');
  sign(g, 'THE MAGIC OF CARTOONS', 0, -56, -42, '#DB2777', '#FDE68A', 5, false); txt(g, 'EST. 1994', 0, -44, '#7C2D12', 3);
};
export const paintWhiteHouse = (g: Ctx) => {
  blockI(g, -80, -36, 160, 36, '#F8FAFC', '#FFFFFF', '#A8A8B0'); for (let k = 0; k < 12; k++) R(g, -76 + k * 13, -30, 5, 10, '#94A3B8');
  blockI(g, -30, -44, 60, 44, '#F8FAFC', '#FFFFFF', '#A8A8B0'); poly(g, [-34, -44, 0, -58, 34, -44], '#F1F5F9'); for (let k = 0; k < 6; k++) R(g, -26 + k * 10, -40, 3, 40, '#E5E7EB');
  R(g, -1, -70, 2, 12, '#9CA3AF'); for (let s = 0; s < 4; s++) R(g, 1, -70 + s * 2, 10, 1, s % 2 ? '#F8FAFC' : '#DC2626');
  ell(g, 50, -46, 6, 6, '#9CA3AF'); R(g, 47, -44, 2, 2, '#F8FAFC'); txt(g, 'SOCKS', 50, -52, '#111827', 3);
  sign(g, 'THE WACKY WHITE HOUSE', 0, -14, -2, '#1D4ED8', '#F8FAFC', 5, false);
};
export const paintBigKid = (g: Ctx) => {
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(-40, -30, 30, 0.2, Math.PI - 0.2); g.stroke(); g.strokeStyle = '#22D3EE'; g.lineWidth = 3; g.stroke();
  R(g, 40, -40, 4, 40, '#A3E635'); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; line(g, 42, -40, 42 + Math.cos(a) * 26, -40 + Math.sin(a) * 10, '#F0ABFC', 2); ell(g, 42 + Math.cos(a) * 26, -36 + Math.sin(a) * 10, 4, 3, '#FDE047'); }
  sign(g, 'THE BIG-KID ZONE', 0, -66, -48, '#111827', '#A3E635', 5);
};
export const paintPunchy = (g: Ctx) => {
  blockI(g, -60, -40, 120, 40, '#FDE047', '#FEF9C3', '#A16207'); R(g, -14, -24, 28, 24, '#111827');
  for (const s of [-1, 1]) { R(g, s * 50 - 2, -70, 4, 30, '#7C2D12'); R(g, s * 50 - 12, -80, 24, 12, '#9CA3AF'); R(g, s * 50 - 12, -80, 24, 2, '#E5E7EB'); }
  sign(g, 'PUNCHY & KICKY', 0, -52, -42, '#DC2626', '#F8FAFC', 5, false); txt(g, 'KILL-O-RAMA', 0, -30, '#DC2626', 4);
};
export const paintAmphi = (g: Ctx) => {
  g.beginPath(); g.moveTo(-90, 0); g.quadraticCurveTo(-90, -70, 0, -70); g.quadraticCurveTo(90, -70, 90, 0); g.closePath(); g.fillStyle = '#E5E7EB'; g.fill(); g.strokeStyle = INK; g.stroke();
  for (let k = 1; k < 5; k++) { g.strokeStyle = '#9CA3AF'; g.beginPath(); g.ellipse(0, 0, 90 - k * 14, 70 - k * 12, 0, Math.PI, 0); g.stroke(); }
  R(g, -40, -24, 80, 24, '#7C2D12'); R(g, -30, -18, 26, 10, '#16A34A'); R(g, 6, -18, 10, 14, '#A16207'); ell(g, 22, -10, 5, 4, '#F8FAFC');
  sign(g, 'STUPID DAD LIVE!', 0, -84, -70, '#DC2626', '#FDE047', 6, false);
};
