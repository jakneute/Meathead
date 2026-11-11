import { type Ctx, INK, R, blockI, poly, ell, line, sign, windows, tree } from './kit';

// ---------------------------------------------------------------------------------------------------------------
// SPOOKY LAND (stand-ins)

export const paintSpookyTown = (g: Ctx) => {
  for (let k = 0; k < 5; k++) { const x = -90 + k * 36, h = 26 + (k % 2) * 8; blockI(g, x, -h, 32, h, ['#5A5468', '#4A4458', '#6A6478'][k % 3], '#9A94A8', '#1A1824'); poly(g, [x - 2, -h, x + 16, -h - 14, x + 34, -h], '#3A2A4A'); windows(g, x + 3, -h + 4, 26, h - 12, 3, 2, '#1A1A2A', '#A3E635', k); }
  sign(g, 'APOTHECARY - NOW WITH DRIVE-THRU', 0, -54, -40, '#4C1D95', '#A3E635', 4);
  for (const x of [-100, 96]) tree(g, x, 30, 'dead', ['#000', '#000']);
};
export const paintKiddie = (g: Ctx) => {
  ell(g, -40, -6, 30, 6, '#3A2A4A'); for (let k = 0; k < 4; k++) { const x = -58 + k * 12; blockI(g, x, -18, 9, 12, '#1F1A24', '#4A4458', '#000000'); R(g, x + 3, -16, 3, 1, '#9A94A8'); }
  R(g, 40, -40, 2, 34, '#4A4458'); poly(g, [20, -40, 41, -52, 62, -40], '#7C3AED'); for (let k = 0; k < 4; k++) { const x = 26 + k * 10; line(g, x, -40, x, -24, '#9A94A8'); ell(g, x, -22, 4, 2, '#1A1A1A'); }
  sign(g, 'SPINNING COFFIN CUPS', -40, -40, -20, '#A3E635', '#1A1824', 3);
  sign(g, 'BAT-O-ROUND', 42, -70, -54, '#A3E635', '#1A1824', 4, false);
};
export const paintDracula = (g: Ctx) => {
  poly(g, [-100, 0, -80, -30, 80, -30, 100, 0], '#3A3448');
  blockI(g, -60, -70, 120, 40, '#8A8098', '#B8B0C8', '#3A3448');
  for (const x of [-60, -30, 30, 60]) { blockI(g, x - 8, -90, 16, 60, '#7A7088', '#B0A8C0', '#3A3448'); poly(g, [x - 10, -90, x, -108, x + 10, -90], '#4A3A6A'); }
  blockI(g, -12, -110, 24, 40, '#7A7088', '#B0A8C0', '#3A3448'); poly(g, [-14, -110, 0, -138, 14, -110], '#4A3A6A'); R(g, 0, -150, 1, 12, '#5A5A5A'); R(g, 1, -150, 8, 4, '#B91C1C');
  for (const x of [-40, -20, 20, 40]) R(g, x - 2, -60, 4, 8, '#DC2626');
  R(g, -8, -44, 16, 14, '#1A1424');
  sign(g, "DRACULA'S OTHER CASTLE", 0, -22, -2, '#4C1D95', '#FCA5A5', 5, false);
};
export const paintFirstCastle = (g: Ctx) => {
  poly(g, [-80, 0, -60, -40, -30, -50, 10, -42, 60, -48, 80, 0], '#4A4458');
  for (const x of [-40, 0, 40]) { blockI(g, x - 7, -80, 14, 34, '#6A6478', '#9A94A8', '#2A2438'); poly(g, [x - 9, -80, x, -96, x + 9, -80], '#3A2A4A'); }
  R(g, -40, -58, 80, 10, '#6A6478');
  sign(g, "DRACULA'S FIRST CASTLE", 0, -22, -4, '#4C1D95', '#FCA5A5', 4, false);
};
export const paintGiftShop = (g: Ctx) => {
  poly(g, [-50, 0, -44, -30, -10, -38, 30, -34, 50, 0], '#6A3A2A'); for (let k = 0; k < 6; k++) poly(g, [-40 + k * 15, 0, -34 + k * 15, -14 - (k % 2) * 8, -28 + k * 15, 0], '#F97316');
  R(g, -12, -20, 24, 20, '#1A0A08');
  sign(g, 'HELL GIFT SHOP', 0, -56, -40, '#B91C1C', '#FDE68A', 5);
};
export const paintHellevator = (g: Ctx) => {
  blockI(g, -24, -130, 48, 130, '#8A8098', '#B8B0C8', '#3A3448'); for (let k = 0; k < 10; k++) R(g, -24, -120 + k * 12, 48, 1, '#5A5468');
  poly(g, [-28, -130, 0, -160, 28, -130], '#4A3A6A');
  ell(g, 0, -106, 13, 13, '#F8F6F0'); line(g, 0, -106, 0, -114, INK, 2); line(g, 0, -106, 6, -104, INK, 2);
  R(g, -10, -30, 20, 30, '#7F1D1D'); R(g, -9, -29, 18, 28, '#DC2626'); R(g, -1, -29, 2, 28, '#7F1D1D');
  sign(g, 'ELEVATOR TO HELL', 0, -60, -60, '#7F1D1D', '#FDE68A', 5, false);
};
