import { type Ctx, INK, R, blockI, poly, ell, line, txt, sign, tree } from './kit';

// ---------------------------------------------------------------------------------------------------------------
// JUNGLE LAND (stand-ins)

export const paintBigTree = (g: Ctx) => {
  poly(g, [-12, 0, -8, -60, 8, -60, 12, 0, 20, 0, 6, -8, -6, -8, -20, 0], '#6A4424');
  for (const [x, y, r] of [[0, -78, 30], [-26, -64, 18], [26, -66, 20], [0, -92, 18]] as const) ell(g, x, y, r, r * 0.8, '#2E7A3A');
  for (const [x, y, r] of [[-8, -86, 8], [18, -72, 6]] as const) ell(g, x, y, r, r * 0.7, '#5AB04A', false);
  blockI(g, -14, -52, 28, 12, '#A8784A', '#D8A878', '#5A3A1C'); poly(g, [-16, -52, 0, -60, 16, -52], '#7A5030'); R(g, -3, -48, 6, 8, '#2A1A0A');
  for (let k = 0; k < 4; k++) line(g, -30 + k * 20, -60, -30 + k * 20 + 2, -30, '#3A7A2A');
};
export const paintCruise = (g: Ctx) => {
  R(g, -84, -6, 168, 6, '#2E6A5A'); for (let k = 0; k < 8; k++) R(g, -80 + k * 21, -5, 8, 1, '#7ACBB4');
  blockI(g, -84, -18, 46, 12, '#A8784A', '#D8A878', '#5A3A1C'); for (let k = 0; k < 6; k++) R(g, -82 + k * 8, -18, 1, 12, '#5A3A1C');
  blockI(g, -20, -16, 60, 10, '#F8FAFC', '#FFFFFF', '#9AA0A8'); R(g, -20, -9, 60, 2, '#15803D');
  R(g, -16, -30, 52, 3, '#F8FAFC'); for (let k = 0; k < 9; k++) R(g, -16 + k * 6, -27, 6, 3, k % 2 ? '#F8FAFC' : '#15803D'); for (const x of [-14, 32]) R(g, x, -27, 1, 11, '#9AA0A8');
  sign(g, 'JUNGLE CRUISE', -60, -40, -18, '#FDE68A', '#14532D', 5);
  for (const x of [56, 74]) tree(g, x, 30, 'palm', ['#2E7A3A', '#5AB04A']);
};
export const paintTemple = (g: Ctx) => {
  const tiers = 5;
  for (let k = 0; k < tiers; k++) { const w = 160 - k * 28, h = 14; blockI(g, -w / 2, -(k + 1) * h, w, h, k % 2 ? '#8A8A80' : '#9A9A8E', '#C8C8BA', '#4A4A42'); for (let m = 0; m < 4; m++) R(g, -w / 2 + 4 + m * (w / 4), -(k + 1) * h + 2, 6, 2, '#4A7A3A'); }
  R(g, -6, -14 * tiers, 12, 14 * tiers, '#7A7A70'); for (let k = 0; k < tiers * 3; k++) R(g, -6, -k * 4.6, 12, 1, '#5A5A52');
  poly(g, [-18, -70, -10, -84, 4, -80, 18, -70], '#7A7A70');
  R(g, -8, -16, 16, 16, '#1A1A14');
  sign(g, 'TEMPLE OF THE JAGUAR', 0, -100, -86, '#A16207', '#F8FAFC', 5, false);
};
export const paintDinoPark = (g: Ctx) => {
  for (let x = -96; x < 60; x += 8) { R(g, x, -30, 2, 30, '#6A6A6A'); }
  R(g, -96, -30, 156, 2, '#4A4A4A'); for (let x = -96; x < 60; x += 16) R(g, x, -22, 8, 2, '#FDE047');
  blockI(g, -30, -50, 10, 50, '#8A6A3A', '#C8A06A', '#4A3A1A'); blockI(g, 20, -50, 10, 50, '#8A6A3A', '#C8A06A', '#4A3A1A');
  R(g, -34, -58, 68, 10, INK); R(g, -33, -57, 66, 8, '#FDE047'); txt(g, 'PRE-HYSTERIC PARK', 0, -51, '#1A1A1A', 4);
  R(g, 40, -44, 64, 4, '#9CA3AF'); for (const x of [50, 90]) R(g, x, -40, 3, 40, '#6B7280'); blockI(g, 60, -52, 26, 8, '#F8FAFC', '#FFFFFF', '#9CA3AF');
  txt(g, 'CLOSED SINCE 1997', 73, -56, '#DC2626', 3);
};
export const paintRexPaddock = (g: Ctx) => {
  for (let x = -70; x < 70; x += 6) R(g, x, -40, 1, 40, '#7A7A7A');
  R(g, -70, -40, 140, 2, '#5A5A5A'); R(g, -70, -20, 140, 1, '#5A5A5A');
  // (the rex, looking over: head and neck)
  poly(g, [10, -34, 16, -60, 26, -70, 46, -70, 52, -62, 40, -60, 30, -58, 24, -34], '#4A6A3A'); R(g, 34, -68, 2, 2, '#FDE047'); for (let k = 0; k < 4; k++) R(g, 40 + k * 3, -61, 1, 2, '#F8FAFC');
  for (const x of [-74, 66]) { blockI(g, x, -54, 8, 54, '#6A5A4A', '#A89A8A', '#3A2A1A'); ell(g, x + 4, -58, 4, 4, '#F59E0B'); }
  sign(g, 'T. REX PADDOCK', -34, -60, -40, '#FDE047', '#1A1A1A', 4);
};
export const paintKabooma = (g: Ctx) => {
  // (fiberglass: panels and bolts showing; the fake lava painted on and cycling; the schedule board)
  poly(g, [-100, 0, -40, -86, -20, -96, 20, -96, 40, -86, 100, 0], '#7A5A4A');
  for (let k = 0; k < 6; k++) line(g, -80 + k * 30, -4, -30 + k * 12, -88, '#5A3E30');
  for (let k = 0; k < 14; k++) R(g, -70 + k * 10, -20 - (k % 3) * 12, 1, 1, '#C8B0A0');
  poly(g, [-14, -96, 14, -96, 10, -60, 20, -30, 6, -40, -2, -10, -8, -50], '#F97316'); poly(g, [-8, -94, 8, -94, 4, -70, -4, -60], '#FDBA74', false);
  R(g, 60, -30, 30, 18, INK); R(g, 61, -29, 28, 16, '#1E293B'); txt(g, 'ERUPTS', 75, -22, '#FDE047', 3); txt(g, 'HOURLY', 75, -15, '#FDE047', 3);
  sign(g, 'MOUNT KABOOMA', -50, -60, -30, '#FDE68A', '#7A2A0A', 5);
};
