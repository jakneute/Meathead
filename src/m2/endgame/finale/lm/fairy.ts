import { type Ctx, INK, R, blockI, poly, ell, line, txt, sign, tree, lattice, track } from './kit';

// ---------------------------------------------------------------------------------------------------------------
// FAIRY LAND (stand-ins)

export const paintHogsmeat = (g: Ctx) => {
  for (let k = 0; k < 6; k++) {
    const x = -88 + k * 30, h = 22 + (k % 3) * 6, w = 26;
    blockI(g, x, -h, w, h, ['#E8D8B8', '#D8C0A0', '#C8B0D0'][k % 3], '#FFFFFF', '#6A5A4A');
    for (let b = 0; b < 3; b++) R(g, x + 2 + b * 8, -h + 2, 1, h - 4, '#5A3A24');
    poly(g, [x - 3, -h, x + w / 2 + (k % 2 ? 3 : -2), -h - 12, x + w + 3, -h], '#4A3A5A'); poly(g, [x - 1, -h - 1, x + w / 2, -h - 9, x + w + 1, -h - 1], '#F8FAFC', false);
    R(g, x + 9, -9, 7, 9, '#4A2A14');
  }
  sign(g, 'HOGSMEAT', 0, -46, -40, '#7C3AED', '#FDE68A', 5);
  for (const x of [-96, 94]) tree(g, x, 26, 'pine', ['#1F5A3A', '#F8FAFC']);
};
export const paintFairyWheel = (g: Ctx) => {
  const cy = -60, r = 46;
  for (const s of [-1, 1]) { line(g, s * 30, 0, 0, cy, '#9A8AB4', 3); line(g, s * 30, 0, 0, cy, '#D8CCEE', 1); }
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(0, cy, r, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#E0B4F0'; g.lineWidth = 2; g.stroke();
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; line(g, 0, cy, Math.cos(a) * r, cy + Math.sin(a) * r, '#C8B0E0'); }
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2, x = Math.cos(a) * r, y = cy + Math.sin(a) * r; ell(g, x, y + 5, 5, 3, k % 2 ? '#F472B6' : '#F8FAFC'); R(g, x - 3, y + 6, 6, 3, '#C084FC'); }
  ell(g, 0, cy, 7, 7, '#F9A8D4'); R(g, -24, -6, 48, 6, '#8A7AA4');
  sign(g, 'THE FAIRY WHEEL', 0, -12, -2, '#F472B6', '#F8FAFC', 5, false);
};
export const paintGlen = (g: Ctx) => {
  for (const [x, h, col] of [[-56, 18, '#DC2626'], [-36, 12, '#F472B6'], [44, 22, '#DC2626'], [60, 10, '#A855F7']] as const) { R(g, x - 2, -h, 4, h, '#F5E6C8'); ell(g, x, -h, 10, 6, col); for (let k = 0; k < 3; k++) ell(g, x - 5 + k * 5, -h - 2, 1.5, 1, '#F8FAFC', false); }
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(0, 8, 34, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.strokeStyle = '#A8784A'; g.lineWidth = 2; g.stroke();
  for (let k = 0; k < 9; k++) R(g, -28 + k * 7, -20 - Math.sin((k / 8) * Math.PI) * 6, 1, 10, '#6A4A2A');
  R(g, -20, -8, 40, 8, '#60A5FA'); R(g, -20, -8, 40, 1, '#BFDBFE');
  sign(g, 'STORYBOOK BRIDGE', 0, -46, -30, '#FDE68A', '#4A2A14', 4);
};
export const paintTragons = (g: Ctx) => {
  const loop = (cx: number, col: string, lit: string) => { const pts: number[] = []; for (let k = 0; k <= 24; k++) { const a = Math.PI / 2 - (k / 24) * Math.PI * 2; pts.push(cx + Math.cos(a) * 20, -30 - Math.sin(a) * 24); } track(g, pts, col, lit, 3); lattice(g, cx - 20, cx + 20, () => -8, 10, '#4A4A5A'); };
  loop(-60, '#E8B020', '#FFF0A0'); loop(0, '#DC2626', '#FCA5A5'); loop(60, '#3B82F6', '#BFDBFE');
  blockI(g, -100, -24, 30, 24, '#8A8494', '#C8C0D0', '#4A4454'); for (const [x, c] of [[-95, '#E8B020'], [-86, '#DC2626'], [-77, '#3B82F6']] as const) R(g, x, -18, 6, 10, c);
  sign(g, 'TRUELLING TRAGONS', 0, -72, -58, '#4C1D95', '#FDE68A', 5);
};
export const paintBroomPort = (g: Ctx) => {
  for (const s of [-1, 1]) { poly(g, [s * 76, 0, s * 76, -40, s * 40, -10, s * 40, 0], '#7A6A8A'); for (let r = 0; r < 5; r++) for (let k = 0; k < 5; k++) R(g, Math.min(s * 76, s * 40) + k * 7 + 2, -8 - r * 6, 2, 2, ['#DC2626', '#16A34A', '#2563EB', '#FDE047'][(k + r) % 4]); }
  for (const x of [-30, 30]) { R(g, x, -44, 2, 44, '#C8B870'); ell(g, x + 1, -46, 5, 5, '#E8C44A'); }
  R(g, -24, -60, 48, 16, INK); R(g, -23, -59, 46, 14, '#1E1B4B'); txt(g, 'HIGHEST WINDOW', 0, -49, '#FDE68A', 3);
  sign(g, 'THE BROOM PORT', 0, -76, -62, '#4C1D95', '#F8FAFC', 5, false);
};
export const paintPixieCastle = (g: Ctx) => {
  poly(g, [-100, 0, -70, -40, -20, -56, 30, -50, 80, -34, 100, 0], '#E8EEF6');
  const tower = (x: number, w: number, h: number) => { blockI(g, x - w / 2, -h, w, h - 40, '#C8B8E0', '#F0E8FF', '#6A5A8A'); poly(g, [x - w / 2 - 3, -h, x, -h - w * 1.4, x + w / 2 + 3, -h], '#3B5BBF'); R(g, x - w / 2 - 3, -h - 1, w + 6, 2, '#E8C44A'); R(g, x, -h - w * 1.4 - 6, 1, 6, '#9A8A70'); R(g, x + 1, -h - w * 1.4 - 6, 5, 3, '#F472B6'); };
  blockI(g, -60, -76, 120, 30, '#C8B8E0', '#F0E8FF', '#6A5A8A');
  for (let k = 0; k < 12; k++) R(g, -60 + k * 10, -80, 6, 4, '#C8B8E0');
  tower(-56, 16, 96); tower(56, 16, 92); tower(-22, 14, 110); tower(22, 14, 106); tower(0, 18, 136);
  R(g, -4, -128, 8, 10, '#F472B6'); R(g, -3, -127, 6, 8, '#FBCFE8');
  R(g, -10, -60, 20, 14, '#3A2A4A');
  sign(g, "THE GREAT PIXIE'S CASTLE", 0, -22, -2, '#4C1D95', '#FDE68A', 5, false);
};
