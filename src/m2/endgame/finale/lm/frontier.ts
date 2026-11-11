import { type Ctx, R, blockI, poly, ell, line, txt, sign, tree, track, braces } from './kit';

// ---------------------------------------------------------------------------------------------------------------
// WILDERNESS LAND (stand-ins)

export const paintStation = (g: Ctx) => {
  blockI(g, -70, -22, 50, 22, '#9A6A3A', '#D0A06A', '#4A2E14'); poly(g, [-74, -22, -45, -32, -16, -22], '#5A3A24'); txt(g, 'LONESOME PINE', -45, -25, '#F8FAFC', 3);
  for (const x of [-4, 14]) R(g, x, -40, 2, 40, '#5A3A24'); ell(g, 6, -46, 14, 8, '#8A6A3A'); R(g, -8, -46, 28, 6, '#8A6A3A');
  blockI(g, 30, -18, 40, 14, '#1F2937', '#4B5563', '#0A0A0A'); R(g, 60, -30, 6, 12, '#1F2937'); ell(g, 63, -34, 4, 3, '#9CA3AF', false); for (const x of [36, 48, 62]) ell(g, x, -3, 4, 4, '#DC2626');
  R(g, -76, -2, 160, 2, '#5A4A3A');
};
export const paintRockies = (g: Ctx) => {
  poly(g, [-100, 0, -60, -64, -30, -30, 10, -76, 50, -24, 80, -56, 100, 0], '#7A8AA0'); poly(g, [-60, -64, -50, -50, -70, -50], '#F8FAFC', false); poly(g, [10, -76, 22, -58, -2, -58], '#F8FAFC', false);
  for (const x of [-60, 10, 80]) { line(g, x, -10, x + 8, 0, '#8A6A44'); line(g, x + 12, -10, x + 4, 0, '#8A6A44'); }
  sign(g, 'THE ROCKIES (PAINTED)', 0, -20, -2, '#FDE68A', '#4A2A14', 4, false);
};
export const paintGulch = (g: Ctx) => {
  const names = ['SALOON', 'SHERIFF', 'HOTEL', 'OPERA', 'GENERAL', 'BANK'];
  for (let k = 0; k < 6; k++) { const x = -126 + k * 36, h = 26 + (k % 3) * 6; braces(g, x, 32, h); blockI(g, x, -h, 32, h, ['#9A6A3A', '#8A5A30', '#B07A44'][k % 3], '#D0A06A', '#4A2E14'); R(g, x, -h - 6, 32, 6, ['#9A6A3A', '#8A5A30', '#B07A44'][k % 3]); txt(g, names[k], x + 16, -h - 1, '#2A1A0A', 3); R(g, x + 12, -10, 8, 10, '#3A2414'); }
  blockI(g, 92, -36, 26, 36, '#F8FAFC', '#FFFFFF', '#9CA3AF'); poly(g, [96, -36, 105, -66, 114, -36], '#F8FAFC'); R(g, 104, -76, 2, 10, '#5A5A5A'); R(g, 101, -72, 8, 2, '#5A5A5A');
  sign(g, 'SAWDUST GULCH', -30, -62, -42, '#FDE68A', '#4A2A14', 6);
};
/** THE TRAIN CRASH (Wilderness Land's, the end of the line at Sawdust Gulch: town/crash.ts): the depot with a hole
 *  stove in its front, boards everywhere; the engine through the buffer stop, nosed down into the dirt, its back end
 *  up; the tender ridden up onto the cab; the coach behind jackknifed the other way; the rails torn up and curled;
 *  steam and smoke off it. */
export const paintTrainCrash = (g: Ctx) => {
  // (the rails, torn up, curling)
  R(g, -110, -4, 220, 2, '#5A4A3A'); for (let x = -108; x < 110; x += 9) R(g, x, -4, 5, 4, '#6A4A2A');
  g.strokeStyle = '#8A8A90'; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, -4); g.quadraticCurveTo(-20, -30, 4, -14); g.moveTo(-36, -4); g.quadraticCurveTo(-10, -22, 10, -24); g.stroke();
  // (the depot: board-and-batten, its canopy down, the hole in its front)
  blockI(g, 30, -46, 78, 46, '#9A6A3A', '#D0A06A', '#4A2E14'); for (let x = 32; x < 106; x += 4) R(g, x, -44, 1, 42, '#7E5630');
  poly(g, [24, -46, 70, -58, 114, -46], '#5A3A24'); txt(g, 'SAWDUST GULCH', 70, -49, '#F8FAFC', 3);
  poly(g, [30, -40, 64, -30, 62, 0, 30, 0], '#1A1008');
  for (let k = 0; k < 8; k++) { g.save(); g.translate(16 + k * 7, -6 - (k % 3) * 8); g.rotate(k * 0.7); R(g, -6, -1, 12, 3, '#B07A44'); g.restore(); }
  // (the engine: nosed down into the depot, its back up; the stack, the cowcatcher buried, the cab)
  g.save(); g.translate(20, -16); g.rotate(-0.42);
  blockI(g, -56, -16, 50, 18, '#1F2937', '#4B5563', '#0A0A0A'); R(g, -56, -12, 50, 2, '#B91C1C');
  blockI(g, -66, -30, 16, 30, '#111827', '#374151', '#000000');
  R(g, -18, -26, 8, 12, '#111827'); R(g, -20, -28, 12, 3, '#374151');
  for (const x of [-48, -32, -16]) ell(g, x, 4, 6, 6, '#B91C1C');
  poly(g, [-6, -10, 6, 2, -6, 2], '#4B5563');
  g.restore();
  // (the tender up onto the cab; the coach jackknifed back the other way)
  g.save(); g.translate(-58, -28); g.rotate(0.5); blockI(g, -14, -10, 28, 14, '#374151', '#6B7280', '#111827'); R(g, -12, -12, 24, 3, '#111111'); g.restore();
  g.save(); g.translate(-86, -10); g.rotate(-0.35); blockI(g, -24, -16, 48, 16, '#7F1D1D', '#B91C1C', '#3A0A0A'); for (let k = 0; k < 4; k++) R(g, -20 + k * 11, -12, 7, 6, '#FDE68A'); g.restore();
  // (the steam and smoke, painted still: the live dust and fire go over it)
  for (const [x, y, r] of [[-30, -62, 10], [-20, -78, 13], [-6, -92, 15]] as const) ell(g, x, y, r, r * 0.8, '#C8C4C8', false);
};
export const paintMine = (g: Ctx) => {
  poly(g, [-110, 0, -70, -50, -30, -40, 0, 0], '#7A6A54'); R(g, -60, -20, 18, 20, '#1A1410'); for (const x of [-62, -44]) R(g, x, -22, 2, 22, '#6A4A2A'); R(g, -62, -22, 20, 2, '#6A4A2A');
  txt(g, 'MOTHER LODE', -52, -26, '#FDE68A', 3);
  R(g, 0, -30, 100, 3, '#6A4A2A'); for (let x = 4; x < 100; x += 12) { line(g, x, -27, x + 6, 0, '#6A4A2A'); line(g, x + 12, -27, x + 6, 0, '#6A4A2A'); }
  blockI(g, 60, -60, 10, 30, '#8A3A2A', '#C06050', '#3A1A12');
  sign(g, 'THE TRESTLE', 40, -50, -30, '#FDE68A', '#4A2A14', 4);
};
export const paintTimber = (g: Ctx) => {
  poly(g, [-110, 0, -60, -80, -20, -90, 30, -70, 80, -30, 110, 0], '#8A7A5A'); for (let k = 0; k < 10; k++) tree(g, -90 + k * 20, 14 + (k % 3) * 4, 'pine', ['#1F5A3A', '#3A8A4A']);
  const pts = [-80, -60, -40, -70, 0, -40, 40, -50, 80, -14]; track(g, pts, '#7A5A3A', '#BFDBFE', 4);
  ell(g, 86, -6, 20, 5, '#60A5FA'); for (const x of [-100, 96]) { R(g, x, -40, 2, 40, '#5A3A24'); for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2; line(g, x + 1, -40, x + 1 + Math.cos(a) * 9, -40 + Math.sin(a) * 9, '#9A8A70', 2); } }
  sign(g, 'TIMBER TUMBLE', 0, -110, -92, '#FDE68A', '#4A2A14', 6);
};
