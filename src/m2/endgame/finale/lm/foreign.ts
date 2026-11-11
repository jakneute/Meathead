import { type Ctx, R, blockI, poly, ell, line, txt, sign } from './kit';

// ---------------------------------------------------------------------------------------------------------------
// FOREIGN LANDS (stand-ins): the pavilions (one landmark), the world monuments (two)

const paintMonumentsA = (g: Ctx) => {
  // (THE EIFFEL TOWER 3X, PISA leaning, BIG BEN BIGGER, THE COLOSSEUM)
  poly(g, [-140, 0, -122, -40, -116, -110, -112, -110, -106, -40, -88, 0, -98, 0, -114, -24, -130, 0], '#8A6A4A');
  R(g, -126, -44, 24, 3, '#6A4A2A'); R(g, -120, -80, 12, 2, '#6A4A2A'); txt(g, '3X', -114, -6, '#FDE68A', 4);
  for (let k = 0; k < 6; k++) R(g, -64 + k * 1.6, -14 - k * 10, 16, 10, k % 2 ? '#F1EDE4' : '#E2DCD0');
  blockI(g, 4, -86, 18, 86, '#C8A06A', '#F0D09A', '#6A4A1A'); ell(g, 13, -70, 6, 6, '#F8FAFC'); poly(g, [2, -86, 13, -104, 24, -86], '#3A5A4A');
  for (let k = 0; k < 4; k++) { R(g, 60, -12 - k * 12, 80, 11, k % 2 ? '#D8C49A' : '#C8B48A'); for (let a = 0; a < 8; a++) R(g, 63 + a * 10, -10 - k * 12, 5, 7, '#5A4A2A'); }
  poly(g, [120, -48, 140, -48, 140, 0, 132, 0], '#A8946A', false);
};
export const paintPavilions = (g: Ctx) => {
  // (left to right: MEXICO's pyramid, NORWAY's stave church, CHINA's pagoda, GERMANY's castle, ITALY's bell tower,
  // JAPAN's pagoda, MOROCCO's tower, FRANCE's arc, the UK's phone box, CANADA's falls)
  let x = -200;
  const gap = 40;
  for (let k = 0; k < 4; k++) R(g, x - 16 + k * 8, -(k + 1) * 8, 32 - k * 16 + 16 * 1, 8, '#C89A5A'); x += gap;
  poly(g, [x - 10, 0, x - 10, -20, x, -38, x + 10, -20, x + 10, 0], '#7A3A22'); x += gap;
  for (let k = 0; k < 4; k++) { R(g, x - 10 + k * 2, -10 - k * 10, 20 - k * 4, 8, '#C81E1E'); poly(g, [x - 14 + k * 2, -10 - k * 10, x, -16 - k * 10, x + 14 - k * 2, -10 - k * 10], '#E8C44A', false); } x += gap;
  blockI(g, x - 14, -28, 28, 28, '#E8E0D0', '#FFFFFF', '#8A8270'); poly(g, [x - 16, -28, x - 8, -42, x, -28], '#3B5BBF'); poly(g, [x, -28, x + 8, -46, x + 16, -28], '#3B5BBF'); x += gap;
  blockI(g, x - 5, -50, 10, 50, '#D8A878', '#F8D0A0', '#7A5A30'); x += gap;
  for (let k = 0; k < 3; k++) { R(g, x - 8 + k * 2, -8 - k * 12, 16 - k * 4, 10, '#2A2A2A'); poly(g, [x - 14 + k * 3, -8 - k * 12, x, -14 - k * 12, x + 14 - k * 3, -8 - k * 12], '#DC2626', false); } x += gap;
  blockI(g, x - 6, -44, 12, 44, '#E8C08A', '#FFE0B0', '#8A6A3A'); R(g, x - 7, -48, 14, 4, '#15803D'); x += gap;
  blockI(g, x - 14, -30, 28, 30, '#E8E0D0', '#FFFFFF', '#8A8270'); R(g, x - 6, -18, 12, 18, '#3A3A4A'); x += gap;
  blockI(g, x - 3, -20, 6, 20, '#DC2626', '#FCA5A5', '#7F1D1D'); x += gap;
  R(g, x - 14, -24, 28, 24, '#6A7A5A'); for (let k = 0; k < 4; k++) R(g, x - 10 + k * 6, -24, 3, 24, '#BFDBFE');
  for (let k = 0; k < 10; k++) { const fx = -200 + k * gap; R(g, fx - 1, -58, 1, 10, '#9CA3AF'); R(g, fx, -58, 6, 4, ['#16A34A', '#DC2626', '#E8C44A', '#111827', '#15803D', '#F8FAFC', '#DC2626', '#2563EB', '#1D4ED8', '#DC2626'][k]); }
  sign(g, 'WORLD SHOWCASE', 0, -76, -62, '#0EA5E9', '#F8FAFC', 6);
};
/** AMERICA, under construction (the owner's "in construction america land"): a half-built pavilion, its steel frame
 *  up two floors, scaffolding round it, a tower crane over it with a beam on its hook, the hoarding along the front
 *  with its sign: AMERICA: COMING SOON. */
export const paintLibertyDig = (g: Ctx) => {
  R(g, -96, -8, 192, 8, '#8A6A4A'); ell(g, -20, -4, 40, 4, '#3A2A1A');
  // (the frame: columns and beams, red-oxide; the half-poured floor)
  for (let k = 0; k < 6; k++) R(g, -70 + k * 22, -64, 3, 56, '#8A3A22');
  for (const y of [-64, -40]) R(g, -70, y, 114, 3, '#8A3A22');
  R(g, -70, -42, 70, 4, '#A8A090');
  // (the scaffold round it: poles, boards, X braces, a tarp)
  g.strokeStyle = '#C8C4B4'; g.lineWidth = 1;
  for (let k = 0; k < 4; k++) { const x = -80 + k * 44; g.beginPath(); g.moveTo(x, -8); g.lineTo(x, -74); g.moveTo(x, -40); g.lineTo(x + 44, -74); g.stroke(); }
  for (const y of [-74, -52, -30]) R(g, -82, y, 134, 2, '#B8945A');
  R(g, 20, -70, 26, 30, 'rgba(30, 80, 160, 0.55)');
  // (the tower crane: its mast, the jib out over the site, the hook and a beam on it)
  R(g, 60, -108, 4, 100, '#E8C44A'); for (let y = -104; y < -10; y += 8) line(g, 60, y, 64, y + 8, '#8A6A20');
  R(g, 0, -110, 96, 3, '#E8C44A'); R(g, 54, -118, 14, 8, '#E8C44A'); R(g, 76, -108, 16, 6, '#5A5A5A');
  line(g, 16, -107, 16, -84, '#2A2A2A'); R(g, 4, -84, 24, 3, '#8A3A22');
  // (the hoarding along the front, the sign on it)
  R(g, -96, -22, 150, 14, '#E5E7EB'); for (let k = 0; k < 10; k++) R(g, -96 + k * 15, -22, 1, 14, '#9CA3AF');
  sign(g, 'AMERICA: COMING SOON', -22, -38, -22, '#1D4ED8', '#F8FAFC', 5);
  for (const x of [-90, 50]) { R(g, x, -30, 2, 22, '#F97316'); R(g, x - 2, -32, 6, 2, '#F8FAFC'); }
};
const paintMonumentsB = (g: Ctx) => {
  // (THE SYDNEY OPERA HOUSE, CHRIST THE REDEEMER, THE TAJ MAHAL, THE GREAT PYRAMID, THE EASTER ISLAND HEAD)
  for (let k = 0; k < 3; k++) poly(g, [-150 + k * 14, 0, -140 + k * 14, -24 - k * 4, -126 + k * 14, 0], '#F1EDE4');
  R(g, -88, -60, 4, 60, '#D8D0C0'); R(g, -104, -56, 36, 4, '#D8D0C0'); ell(g, -86, -64, 4, 4, '#D8D0C0');
  blockI(g, -50, -30, 60, 30, '#F1EDE4', '#FFFFFF', '#A8A094'); ell(g, -20, -40, 14, 14, '#F8F6F0'); R(g, -21, -60, 2, 8, '#E8C44A'); for (const x of [-50, 8]) R(g, x, -46, 2, 46, '#F1EDE4');
  poly(g, [30, 0, 80, -66, 130, 0], '#D8B878'); for (let k = 1; k < 6; k++) line(g, 30 + k * 8.3, -k * 11, 130 - k * 8.3, -k * 11, '#B89858');
  poly(g, [138, 0, 136, -40, 142, -50, 156, -50, 158, -16, 154, 0], '#6A6A62'); R(g, 142, -38, 10, 3, '#3A3A34');
};

// ---------------------------------------------------------------------------------------------------------------
/** The world monuments, the whole row (the owner's one throw target): EIFFEL 3X to the EASTER ISLAND HEAD, one sign
 *  over the lot. They go over like dominoes (sections.ts: 'domino'). */
export const paintMonuments = (g: Ctx) => {
  g.save(); g.translate(-160, 0); paintMonumentsA(g); g.restore();
  g.save(); g.translate(150, 0); paintMonumentsB(g); g.restore();
  sign(g, 'THE WORLD MONUMENTS', 0, -96, -80, '#0EA5E9', '#F8FAFC', 6);
};
