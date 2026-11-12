import { type Ctx, INK, R, poly, ell, line, txt, star } from './kit';
import { rampOf, dith, sBlock, sCol, sBall, sRoof, courses } from './shade';

// ---------------------------------------------------------------------------------------------------------------
// AMERICA USA (the hub's gate land: the last of Main Street's shopfronts either side of the way out, the brick arch
// and its marquee in bulbs over the turnstiles, the biggest flag in the world on the biggest pole). The second pass;
// lit from the east (the right).

const BRICK = rampOf('#B4533A', '#2A0E08');
const CREAM = rampOf('#E8DCC0', '#3A2E1C');
const BLUE = rampOf('#7A9AB4', '#141E2E');
const MINT = rampOf('#9AC4A8', '#12241A');
const STONE = ['#7A7468', '#A8A294', '#D8D2C4', '#F1EDE4', '#FFFFFF'];
const NAVY = ['#0A1A4A', '#152E7A', '#1D4ED8', '#4A7AF0', '#9AB8FF'];

/** A Main Street shopfront: two floors, a bracketed cornice, tall windows over a striped awning and a plate-glass
 *  front, its door. */
const shop = (g: Ctx, x: number, w: number, h: number, r: readonly string[], awn: string, brick = false) => {
  sBlock(g, x, -h, w, h, r); if (brick) courses(g, x, -h, w, h, 5, 3, r[1]);
  // (the cornice, its brackets)
  R(g, x - 2, -h - 4, w + 4, 5, INK); R(g, x - 1, -h - 3, w + 2, 3, STONE[3]); R(g, x - 1, -h - 3, w + 2, 1, STONE[4]); for (let xx = x + 1; xx < x + w; xx += 4) R(g, xx, -h, 2, 2, STONE[2]);
  // (upstairs windows: tall, a stone lintel each)
  const n = Math.max(2, Math.round(w / 12));
  for (let k = 0; k < n; k++) { const wx = x + ((k + 0.5) / n) * w - 2; R(g, wx - 1, -h + 5, 6, 10, INK); R(g, wx, -h + 6, 4, 8, '#24324A'); R(g, wx, -h + 6, 4, 2, '#7FB6DC'); R(g, wx, -h + 10, 4, 0.5, STONE[3]); R(g, wx - 1, -h + 4, 6, 1, STONE[3]); }
  // (the shopfront: plate glass, the awning in stripes, the door)
  R(g, x + 2, -13, w - 4, 13, INK); R(g, x + 3, -12, w - 6, 12, '#24324A'); R(g, x + 3, -12, w - 6, 3, '#4A7AA8'); line(g, x + w - 8, -11, x + w - 12, -1, '#9ACBF4');
  R(g, x + w / 2 - 3, -10, 6, 10, '#3A2414'); R(g, x + w / 2 - 2, -9, 4, 5, '#7FB6DC');
  poly(g, [x, -17, x + w, -17, x + w + 2, -12, x - 2, -12], INK); for (let k = 0; k < Math.round(w / 4); k++) poly(g, [x + k * 4, -17, x + k * 4 + 4, -17, x + k * 4 + 4.4, -12.5, x + k * 4 - 0.4, -12.5], k % 2 ? awn : '#F8FAFC', false);
  R(g, x, -17, w, 0.5, '#FFFFFF');
};
const flagAt = (g: Ctx, x: number, y: number, w: number, h: number) => {
  // (old glory, in steps where it folds: three folds, each a band darker)
  for (let s = 0; s < 7; s++) R(g, x, y + (s * h) / 7, w, h / 7 + 0.5, s % 2 ? '#F8FAFC' : '#DC2626');
  R(g, x, y, w * 0.42, h * 0.56, NAVY[1]); for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) R(g, x + 1.5 + k * (w * 0.1), y + 1.5 + r * (h * 0.17), 1, 1, '#FFFFFF');
  for (const k of [0.3, 0.62, 0.86]) { R(g, x + w * k, y, w * 0.1, h, '#00000030'); R(g, x + w * k + w * 0.1, y, 1, h, '#FFFFFF40'); }
  g.strokeStyle = INK; g.lineWidth = 1; g.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));
};

export const paintAmerica = (g: Ctx) => {
  // (the street: brick pavers, a gold star set in every so often)
  R(g, -134, -3, 268, 3, BRICK[1]); dith(g, -134, -3, 268, 1, BRICK[3]); for (let x = -126; x < 130; x += 16) star(g, x, -1.5, 3, '#FDE047');
  // (the biggest flag in the world on the biggest pole, behind it all)
  sCol(g, 60, -74, 3, 74, STONE, true); sBall(g, 61.5, -75.5, 2, 2, rampOf('#E8C44A', '#3A2A08'));
  flagAt(g, 64, -73, 46, 24);
  // (the shopfronts, west side then east)
  shop(g, -132, 30, 34, BRICK, '#DC2626', true); shop(g, -100, 26, 40, CREAM, '#1D4ED8'); shop(g, -72, 28, 32, MINT, '#DC2626');
  shop(g, 44, 28, 36, BLUE, '#DC2626'); shop(g, 74, 26, 30, CREAM, '#15803D'); shop(g, 102, 30, 38, BRICK, '#1D4ED8', true);
  // (the town hall's clock cupola over the west row)
  sBlock(g, -92, -54, 10, 12, STONE); ell(g, -87, -48, 3, 3, '#FFFBEB'); line(g, -87, -48, -87, -50, INK); line(g, -87, -48, -85.5, -47.5, INK); sRoof(g, -94, -80, -54, -87, -62, rampOf('#3A6A5A', '#0A1A14'));
  // (bunting across the street, both sides of the gate)
  for (const [x0, x1] of [[-44, -22], [22, 44]] as const) for (let k = 0; k < 6; k++) { const x = x0 + (k / 5) * (x1 - x0), y = -34 + Math.sin((k / 5) * Math.PI) * 4; poly(g, [x - 1.5, y, x + 1.5, y, x, y + 4], ['#DC2626', '#F8FAFC', '#1D4ED8'][k % 3], false); }
  // (the gate: two brick piers, the stone cap across with its cornice, the eagle on it, the marquee in its bulbs)
  for (const x of [-40, 24]) { sBlock(g, x, -44, 16, 44, BRICK); courses(g, x, -44, 16, 44, 5, 3, BRICK[1]); R(g, x - 1, -8, 18, 8, INK); R(g, x, -7, 16, 7, STONE[2]); R(g, x, -7, 16, 1, STONE[4]); R(g, x + 6, -34, 4, 12, INK); R(g, x + 7, -33, 2, 10, '#FDE68A'); }
  R(g, -44, -56, 88, 13, INK); R(g, -43, -55, 86, 11, STONE[2]); R(g, -43, -55, 86, 2, STONE[4]); R(g, -43, -46, 86, 2, STONE[1]); R(g, 20, -55, 23, 11, STONE[3]);
  R(g, -46, -59, 92, 4, INK); R(g, -45, -58, 90, 2, STONE[3]); R(g, -45, -58, 90, 1, STONE[4]);
  R(g, -36, -54, 72, 9, INK); R(g, -35, -53, 70, 7, '#7F1D1D'); txt(g, 'AMERICA USA', 0.5, -47, '#F8FAFC', 6);
  for (let k = 0; k < 18; k++) { R(g, -35 + k * 4.1, -54, 1, 1, k % 2 ? '#FDE047' : '#FFFFFF'); R(g, -35 + k * 4.1, -46, 1, 1, k % 2 ? '#FFFFFF' : '#FDE047'); }
  // (the eagle: gilt, wings out)
  const GOLD = rampOf('#E8C44A', '#3A2A08');
  poly(g, [-12, -64, -4, -66, 0, -62, 4, -66, 12, -64, 6, -60, 2, -59, -2, -59, -6, -60], GOLD[2]); poly(g, [0, -62, 4, -66, 12, -64, 6, -60, 2, -59], GOLD[3], false); sBall(g, 0, -66, 2.2, 2.2, STONE, true); R(g, 1.5, -66, 2, 1, GOLD[2]);
  // (the turnstiles across the way, a ticket booth, the way out's arrow)
  for (let k = 0; k < 4; k++) { const x = -18 + k * 10; R(g, x, -8, 3, 8, INK); R(g, x + 0.5, -7.5, 2, 7, STONE[2]); R(g, x - 2, -6, 7, 1, STONE[4]); R(g, x + 1, -9, 1, 2, '#DC2626'); }
  sBlock(g, -22, -18, 8, 18, NAVY); R(g, -21, -15, 6, 5, '#FDE68A'); sRoof(g, -24, -12, -18, -18, -23, rampOf('#DC2626', '#3A0808'));
  // (lamp posts down the street, a flag on each)
  for (const x of [-56, 18]) { R(g, x, -30, 1, 30, '#1F2937'); R(g, x - 1.5, -33, 4, 4, INK); R(g, x - 0.5, -32, 2, 2, '#FDE68A'); flagAt(g, x + 1, -28, 8, 5); }
};
