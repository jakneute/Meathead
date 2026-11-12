import { type Ctx, INK, R, poly, ell, line, txt, sign, tree } from './kit';
import { rampOf, dith, sBlock, sCol, sBall, sRoof, courses, mound } from './shade';

// ---------------------------------------------------------------------------------------------------------------
// SPOOKY LAND (the second pass): lilac-gray dressed stone in courses, purple slate, red flags and bat banners,
// windows lit red and sick green; the sunrise catching the east faces (the right).

const STONE = ['#262030', '#4A4458', '#7A7390', '#A49CBA', '#D2CCE2'];
const DARKST = ['#18141F', '#2E2838', '#4A4458', '#686080', '#8A84A0'];
const SLATE = ['#1A0A2E', '#3B0764', '#561A8A', '#7A3AAE', '#A870D8'];
const CRAG = ['#1A1626', '#2E2840', '#443C5A', '#5E5678', '#807898'];
const OAK = ['#1A0E08', '#3A2414', '#5A3A22', '#7A5434', '#A07A52'];
const RED = ['#4A0A0A', '#7F1D1D', '#B91C1C', '#DC2626', '#F87171'];
const TIMBER = ['#120C0A', '#241812', '#3A2A20', '#54402E', '#705A44'];
const PLASTER = rampOf('#8A8498', '#1A1424');
const GREEN = '#A3E635';

/** A wall of coursed stone: a ramped block, its joints, every few blocks a lighter or darker one. */
const wall = (g: Ctx, x: number, y: number, w: number, h: number, r: readonly string[] = STONE) => {
  sBlock(g, x, y, w, h, r);
  courses(g, x, y, w, h, 7, 4, r[1]);
  for (let k = 0; k < (w * h) / 60; k++) { const bx = x + 1 + ((k * 37) % Math.max(1, w - 6)), by = y + 1 + ((k * 23) % Math.max(1, Math.floor(h / 4))) * 4; if (by < y + h - 3) R(g, bx, by, 4, 2, r[k % 3 === 0 ? 1 : 3]); }
};
/** Battlements along a wall's top (merlons, lit tops). */
const merlons = (g: Ctx, x: number, y: number, w: number, r: readonly string[] = STONE) => {
  for (let xx = x; xx < x + w - 2; xx += 6) { R(g, xx - 1, y - 5, 5, 6, INK); R(g, xx, y - 4, 3, 4, r[2]); R(g, xx, y - 4, 3, 1, r[4]); R(g, xx + 2, y - 4, 1, 4, r[3]); }
};
/** A pointed window, lit (red by default). */
const lancet = (g: Ctx, x: number, y: number, h = 7, col = '#DC2626', hot = '#FCA5A5') => { poly(g, [x - 2, y + h, x - 2, y + 2, x, y - 1, x + 2, y + 2, x + 2, y + h], INK, false); R(g, x - 1, y + 2, 2, h - 3, col); R(g, x - 1, y + 2, 1, 2, hot); };
/** A round tower under a candle-snuffer roof (its foot at y0, its eave at y1). */
const roundTower = (g: Ctx, x: number, w: number, y0: number, y1: number, cone: number, r: readonly string[] = STONE) => {
  sCol(g, x - w / 2, y1, w, y0 - y1, r);
  for (let y = y1 + 4; y < y0; y += 4) R(g, x - w / 2, y, w, 0.5, r[1]);
  R(g, x - w / 2 - 2, y1 - 2, w + 4, 3, INK); R(g, x - w / 2 - 1, y1 - 1, w + 2, 1, r[4]);
  sRoof(g, x - w / 2 - 2, x + w / 2 + 2, y1 - 2, x, y1 - 2 - cone, SLATE);
  R(g, x - 0.5, y1 - 2 - cone - 4, 1, 4, DARKST[3]);
};
/** A bat banner hung down a wall (red, the black bat on it, a forked tail). */
const banner = (g: Ctx, x: number, y: number, h = 16) => {
  poly(g, [x - 3, y, x + 3, y, x + 3, y + h, x, y + h - 3, x - 3, y + h], RED[2]); R(g, x + 1, y, 2, h - 2, RED[3]); R(g, x - 3, y, 6, 1, '#E8C44A');
  poly(g, [x - 2.5, y + 5, x - 1, y + 4, x, y + 5.5, x + 1, y + 4, x + 2.5, y + 5, x + 1, y + 7, x, y + 6, x - 1, y + 7], INK, false);
};
/** A torch in a bracket (lit). */
const torch = (g: Ctx, x: number, y: number) => { R(g, x, y, 1, 5, OAK[3]); R(g, x - 1, y - 3, 3, 3, '#F97316'); R(g, x, y - 5, 1, 3, '#FDE047'); };
const ivy = (g: Ctx, x: number, y: number, h: number, seed: number) => { for (let k = 0; k < h; k++) { const dx = Math.round(Math.sin(k * 0.9 + seed) * 2); R(g, x + dx, y + k, 2, 1, k % 3 ? '#2A5A2E' : '#4A8A44'); if (k % 4 === 0) R(g, x + dx + 2, y + k, 1, 1, '#6AB05A'); } };

/** THE TOWN SQUARE: the crooked half-timbered shops (leaning on each other, slate roofs, bent chimneys, windows lit a
 *  sick green), the APOTHECARY with its drive-thru hatch and its board, a gas lamp, the well, dead trees, cobbles. */
export const paintSpookyTown = (g: Ctx) => {
  R(g, -95, -2, 190, 2, DARKST[1]); for (let x = -94; x < 95; x += 5) R(g, x + ((x >> 2) & 1), -2, 3, 1, DARKST[3]);
  for (const x of [-92, 90]) tree(g, x, 32, 'dead', ['#000', '#000']);
  const house = (x: number, w: number, h: number, lean: number, r: readonly string[], seed: number) => {
    g.save(); g.transform(1, 0, lean, 1, 0, 0);
    sBlock(g, x, -h, w, h, r);
    // (the timbers: posts, a rail, braces)
    for (const tx of [x, x + Math.round(w / 2) - 1, x + w - 2]) R(g, tx, -h, 2, h, TIMBER[1]);
    R(g, x, -h + Math.round(h * 0.48), w, 2, TIMBER[1]); line(g, x + 2, -h + 2, x + w / 2 - 1, -h * 0.52, TIMBER[2]); line(g, x + w - 2, -h + 2, x + w / 2 + 1, -h * 0.52, TIMBER[2]);
    // (the jetty: the upper floor out over the lower)
    R(g, x - 2, -h + Math.round(h * 0.48) - 1, w + 4, 1, TIMBER[3]);
    for (const [wx, wy] of [[x + 4, -h + 5], [x + w - 9, -h + 5], [x + 4, -h * 0.4]] as const) { R(g, wx - 1, wy - 1, 7, 8, INK); R(g, wx, wy, 5, 6, (wx + seed) % 3 ? GREEN : '#1A1A2A'); R(g, wx, wy, 5, 1, '#ECFCCB'); R(g, wx + 2, wy, 1, 6, TIMBER[0]); R(g, wx, wy + 3, 5, 1, TIMBER[0]); }
    R(g, x + w - 10, -11, 6, 11, OAK[1]); R(g, x + w - 10, -11, 6, 1, OAK[3]); R(g, x + w - 6, -6, 1, 1, '#E8C44A');
    // (the roof: steep slate, its ridge sagging; the chimney, bent)
    sRoof(g, x - 3, x + w + 3, -h, x + w / 2 + (seed % 2 ? 3 : -2), -h - 14 - (seed % 3) * 3, SLATE.map((c, i) => (i < 2 ? ['#0F0D17', '#1A1726'][i] : ['#343048', '#454060', '#5A5478'][i - 2])));
    for (let k = 1; k < 4; k++) R(g, x + 2, -h - k * 3.5, w - 4 - k * 5, 0.5, '#0F0D17');
    g.save(); g.translate(x + w - 8, -h - 6); g.rotate(seed % 2 ? 0.2 : -0.15); R(g, -2, -9, 5, 10, INK); R(g, -1, -8, 3, 9, DARKST[2]); R(g, 1, -8, 1, 9, DARKST[4]); R(g, -2, -10, 5, 2, DARKST[3]); g.restore();
    g.restore();
  };
  house(-84, 30, 30, -0.06, PLASTER, 1); house(-50, 28, 38, 0.05, rampOf('#7A6A7A', '#1A1424'), 2); house(18, 30, 34, -0.04, rampOf('#6E7A82', '#141820'), 3); house(52, 30, 28, 0.07, PLASTER, 4);
  // (the apothecary: stone, its bottle sign, the drive-thru hatch and its little speaker post)
  wall(g, -18, -30, 32, 30, DARKST); sRoof(g, -21, 17, -30, -2, -42, SLATE);
  R(g, -14, -22, 9, 9, INK); R(g, -13, -21, 7, 7, GREEN); R(g, -13, -21, 7, 1, '#ECFCCB'); for (const [bx, c] of [[-12, '#7C3AED'], [-10, '#DC2626'], [-8, '#0EA5E9']] as const) R(g, bx, -18, 1, 3, c);
  R(g, 0, -20, 10, 8, INK); R(g, 1, -19, 8, 6, '#FDE68A'); R(g, 1, -14, 8, 1, OAK[3]); R(g, 14, -12, 1, 12, DARKST[4]); R(g, 13, -14, 3, 3, DARKST[3]);
  R(g, -12, -10, 6, 10, OAK[1]);
  // (a gas lamp, lit green; the well)
  R(g, -40, -30, 1, 30, DARKST[1]); R(g, -42, -34, 5, 5, INK); R(g, -41, -33, 3, 3, GREEN); R(g, -42, -35, 5, 1, DARKST[3]);
  sCol(g, 84, -8, 8, 8, DARKST); R(g, 83, -16, 1, 9, OAK[2]); R(g, 92, -16, 1, 9, OAK[2]); poly(g, [81, -16, 88, -21, 95, -16], OAK[2]);
  sign(g, 'APOTHECARY - NOW WITH DRIVE-THRU', 0, -58, -42, '#2A1048', GREEN, 4, true);
};

/** THE KIDDIE RIDES: the SPINNING COFFIN CUPS on their turntable under its canopy, the MINI DROP OF DOOM's mast and
 *  seat ring, the BAT-O-ROUND under its purple tent with its bats on their poles. */
export const paintKiddie = (g: Ctx) => {
  R(g, -65, -2, 130, 2, DARKST[1]); for (let x = -64; x < 65; x += 5) R(g, x, -2, 3, 1, DARKST[3]);
  // (the cups: the turntable, four coffins on it, the hub and its little canopy)
  ell(g, -38, -4, 24, 4, DARKST[2]); ell(g, -36, -5, 18, 2.2, DARKST[4], false);
  sCol(g, -40, -24, 4, 20, DARKST); poly(g, [-52, -24, -38, -33, -24, -24], SLATE[2]); poly(g, [-38, -24, -38, -33, -24, -24], SLATE[3], false); for (let k = 0; k < 6; k++) R(g, -51 + k * 5, -24, 3, 2, k % 2 ? RED[2] : '#F8FAFC');
  for (const [x, y] of [[-56, -6], [-46, -9], [-30, -9], [-20, -6]] as const) {
    poly(g, [x - 3, y - 12, x + 3, y - 12, x + 5, y - 8, x + 3, y, x - 3, y, x - 5, y - 8], OAK[2]); poly(g, [x, y - 12, x + 3, y - 12, x + 5, y - 8, x + 3, y, x, y], OAK[3], false);
    R(g, x - 0.5, y - 10, 1, 5, '#E8C44A'); R(g, x - 2, y - 8.5, 4, 1, '#E8C44A');
    // (a kid in it, hands up)
    R(g, x - 1, y - 15, 2, 3, ['#F2C9A0', '#8A5A3A', '#E8B48A', '#C68A5E'][(x + 60) % 4]); R(g, x - 3, y - 17, 1, 3, '#F2C9A0'); R(g, x + 2, y - 17, 1, 3, '#F2C9A0');
  }
  sign(g, 'COFFIN CUPS', -38, -48, -33, '#1A1824', GREEN, 4, true);
  // (the mini drop: a mast, its seat ring half way up, a skull on top)
  sCol(g, -4, -62, 5, 62, DARKST); for (let y = -56; y < 0; y += 8) R(g, -4, y, 5, 1, RED[2]);
  R(g, -11, -38, 19, 5, INK); R(g, -10, -37, 17, 3, RED[2]); R(g, -10, -37, 17, 1, RED[4]); for (const x of [-9, -5, 3, 7]) { R(g, x, -34, 1, 4, '#1F2937'); R(g, x, -41, 2, 3, '#E8B48A'); }
  sBall(g, -1.5, -66, 4, 4, ['#6A6458', '#A8A294', '#D8D2C4', '#F0ECE0', '#FFFFFF']); R(g, -3.5, -67, 1.5, 1.5, INK); R(g, -0.5, -67, 1.5, 1.5, INK); R(g, -3, -63, 3, 1, INK);
  // (the bat-o-round: the purple tent, the platform, six bats on their poles)
  ell(g, 40, -4, 24, 4, DARKST[2]); ell(g, 42, -5, 18, 2.2, DARKST[4], false);
  sCol(g, 38, -40, 4, 36, DARKST);
  poly(g, [14, -40, 40, -56, 66, -40], SLATE[2]); poly(g, [40, -40, 40, -56, 66, -40], SLATE[3], false); line(g, 40, -55, 65, -40, SLATE[4]);
  for (let k = 0; k < 9; k++) poly(g, [15 + k * 5.6, -40, 20.6 + k * 5.6, -40, 17.8 + k * 5.6, -36], k % 2 ? GREEN : SLATE[1], false);
  R(g, 39.5, -62, 1, 6, DARKST[4]); poly(g, [40, -62, 46, -60, 40, -58], RED[2], false);
  for (let k = 0; k < 5; k++) {
    const x = 20 + k * 10, y = -18 - (k % 2) * 6;
    R(g, x, -40, 1, 36, '#C8C0D8');
    poly(g, [x - 5, y - 1, x - 2, y - 4, x, y - 2, x + 3, y - 4, x + 6, y - 1, x + 3, y + 1, x + 1, y + 3, x - 2, y + 1], '#1A1024'); R(g, x - 1, y - 2, 1, 1, RED[3]); R(g, x + 1, y - 2, 1, 1, RED[3]);
    if (k % 2) { R(g, x, y - 7, 2, 3, '#E8B48A'); R(g, x, y - 4, 2, 2, '#2563EB'); }
  }
  sign(g, 'BAT-O-ROUND', 40, -72, -55, '#1A1824', GREEN, 4, true);
};

/** DRACULA'S OTHER CASTLE up on its crag: the curtain wall in coursed lilac stone with its battlements and pilasters,
 *  the round end towers under candle-snuffer roofs, the keep up the middle behind it with its purple spike and red
 *  flag, bat banners, lancets lit red, the big oak door between its torches at the top of the stairs, ivy. */
export const paintDracula = (g: Ctx) => {
  // (the crag: banded, dead trees on it, the stairs up its face)
  mound(g, [-102, 0, -92, -18, -70, -30, 70, -30, 90, -20, 102, 0], CRAG, 8);
  for (const [x, h] of [[-94, 18], [92, 16], [-84, 12]] as const) { g.save(); g.translate(x, -Math.min(18, (102 - Math.abs(x)) * 1.2)); tree(g, 0, h, 'dead', ['#000', '#000']); g.restore(); }
  for (let k = 0; k < 8; k++) { R(g, -12 - (7 - k) * 1.5, -30 + k * 3.75, 24 + (7 - k) * 3, 4, STONE[k % 2 ? 1 : 2]); R(g, -12 - (7 - k) * 1.5, -30 + k * 3.75, 24 + (7 - k) * 3, 1, STONE[4]); }
  // (the keep, behind: tall, two lancets, battlements, the spike, the flag)
  wall(g, -19, -116, 38, 60, STONE.map((c, i) => (i ? STONE[i - 1] : '#1A1626')));
  merlons(g, -19, -116, 38); lancet(g, -8, -104, 9); lancet(g, 8, -104, 9); lancet(g, 0, -86, 9);
  sRoof(g, -14, 14, -120, 0, -146, SLATE); for (let k = 1; k < 4; k++) R(g, -12 + k * 3, -120 - k * 5.5, 24 - k * 6, 0.5, SLATE[0]);
  R(g, -0.5, -152, 1, 8, DARKST[4]); poly(g, [0.5, -152, 10, -150, 7, -148.5, 10, -147, 0.5, -146], RED[3], false); R(g, 1, -151, 6, 1, RED[4]);
  // (the inner turrets either side of the keep)
  roundTower(g, -34, 13, -70, -98, 20); roundTower(g, 34, 13, -70, -94, 18);
  lancet(g, -34, -90, 6); lancet(g, 34, -86, 6);
  // (the curtain wall: coursed, pilasters, battlements, banners, windows)
  wall(g, -62, -74, 124, 44);
  for (const x of [-42, -22, 18, 38]) { R(g, x, -74, 4, 44, STONE[3]); R(g, x + 3, -74, 1, 44, STONE[4]); R(g, x - 1, -74, 1, 44, STONE[1]); }
  merlons(g, -62, -74, 124);
  for (const x of [-52, -31, 32, 52]) lancet(g, x, -64, 8);
  banner(g, -31, -52, 15); banner(g, 31, -52, 15);
  ivy(g, -60, -70, 30, 1); ivy(g, 55, -60, 26, 4); ivy(g, -12, -74, 14, 2);
  // (the door: an arch of oak, iron-banded, a torch each side)
  poly(g, [-9, -30, -9, -46, -6, -51, 0, -53, 6, -51, 9, -46, 9, -30], INK, false);
  poly(g, [-7, -30, -7, -45, -5, -49, 0, -51, 5, -49, 7, -45, 7, -30], OAK[2], false); R(g, 0, -50, 7, 20, OAK[3]); R(g, -0.5, -51, 1, 21, OAK[0]);
  for (const y of [-44, -36]) R(g, -7, y, 14, 1, '#1F2937'); R(g, 2, -40, 1, 2, '#E8C44A');
  torch(g, -14, -46); torch(g, 13, -46);
  // (the round end towers: nearer, taller than the wall, snuffer roofs)
  roundTower(g, -66, 20, -30, -92, 26); roundTower(g, 66, 20, -30, -88, 24);
  for (const s of [-1, 1]) { lancet(g, s * 66, -82, 7); lancet(g, s * 66, -60, 7); }
  // (its name, at the crag's foot, on two posts)
  sign(g, "DRACULA'S OTHER CASTLE", 0, -16, -1, '#2A1048', '#FCA5A5', 5, true);
};

/** DRACULA'S FIRST CASTLE (the one that burned): older, squatter, darker stone on its own crag; one tower's roof
 *  gone, the ballroom wing's rafters black against the sky, soot up the walls, the gate's portcullis half down. */
export const paintFirstCastle = (g: Ctx) => {
  mound(g, [-82, 0, -72, -22, -50, -36, 50, -36, 70, -24, 82, 0], CRAG, 9);
  g.save(); g.translate(-74, -20); tree(g, 0, 16, 'dead', ['#000', '#000']); g.restore();
  // (the burnt wing, behind: its wall's top broken, the rafters)
  wall(g, 6, -78, 44, 42, DARKST); poly(g, [6, -79, 14, -84, 20, -79, 30, -86, 38, -79, 50, -82, 50, -79], DARKST[2]);
  for (let k = 0; k < 5; k++) { line(g, 10 + k * 8, -78, 16 + k * 8, -94 + (k % 2) * 4, INK, 2); line(g, 10 + k * 8, -78, 16 + k * 8, -94 + (k % 2) * 4, '#2A1E1C', 1); }
  line(g, 10, -90, 48, -88, '#2A1E1C', 1.5);
  for (const x of [16, 28, 40]) { lancet(g, x, -68, 9, '#0A0810', '#0A0810'); for (let k = 0; k < 8; k++) { R(g, x - 3 + ((k * 3) % 7), -70 - k * 1.5, 2, 2, '#0F0D17'); } dith(g, x - 4, -82, 9, 12, '#0F0D17', x); }
  // (the curtain wall and the gate)
  wall(g, -50, -62, 100, 26, DARKST); merlons(g, -50, -62, 100, DARKST);
  poly(g, [-8, -36, -8, -50, 0, -56, 8, -50, 8, -36], INK, false); R(g, -6, -49, 12, 13, '#07050A');
  for (let x = -5; x < 6; x += 3) R(g, x, -50, 1, 8, '#4B5563'); R(g, -6, -46, 12, 1, '#4B5563'); R(g, -6, -42, 12, 1, '#4B5563');
  for (const x of [-30, 30]) lancet(g, x, -54, 7, '#7F1D1D', '#DC2626');
  ivy(g, -48, -58, 20, 3); ivy(g, 22, -60, 18, 6);
  // (the towers: the west one whole, the east one's roof burned off, a wisp of old smoke stain up it)
  roundTower(g, -42, 16, -36, -84, 20, DARKST);
  sCol(g, 34, -80, 16, 44, DARKST); for (let y = -76; y < -36; y += 4) R(g, 34, y, 16, 0.5, DARKST[1]);
  poly(g, [33, -80, 36, -86, 40, -81, 44, -88, 47, -82, 51, -84, 51, -80], DARKST[2]); dith(g, 34, -80, 16, 10, '#0F0D17');
  lancet(g, -42, -74, 7); lancet(g, 42, -66, 7, '#0A0810', '#0A0810');
  // (a banner left, in rags)
  poly(g, [-25, -56, -19, -56, -19, -48, -21, -44, -23, -47, -25, -43], RED[1], false);
  sign(g, "DRACULA'S FIRST CASTLE", 0, -18, -1, '#2A1048', '#FCA5A5', 4, true);
};

/** THE HELL GIFT SHOP (where the ride lets out): a fiberglass cave mouth in brimstone red, fake flames bolted round
 *  it, the striped awning, the windows full of plush devils, the rack of pitchforks, EXIT THRU over the door. */
export const paintGiftShop = (g: Ctx) => {
  const BRIM = ['#2A0A08', '#5A1A12', '#8A2E1E', '#B8492C', '#E0774A'];
  mound(g, [-50, 0, -46, -22, -34, -36, -8, -42, 22, -40, 40, -30, 50, 0], BRIM, 9);
  for (const [x0, y0, x1, y1] of [[-36, -4, -28, -34], [4, -40, 10, -4], [34, -30, 38, -2]] as const) line(g, x0, y0, x1, y1, BRIM[1]);
  for (let k = 0; k < 7; k++) R(g, -40 + k * 13, -8 - ((k * 11) % 22), 1, 1, BRIM[4]);
  // (the fake flames: flat cut-outs on their bolts, three tones each)
  for (const [x, h] of [[-44, 14], [-30, 20], [30, 18], [43, 12]] as const) { poly(g, [x - 4, 0, x - 5, -h * 0.5, x - 1, -h * 0.7, x, -h, x + 2, -h * 0.6, x + 5, -h * 0.4, x + 4, 0], '#B91C1C'); poly(g, [x - 2, 0, x - 2, -h * 0.4, x, -h * 0.7, x + 2, -h * 0.35, x + 2, 0], '#F97316', false); poly(g, [x - 1, 0, x, -h * 0.4, x + 1, 0], '#FDE047', false); R(g, x, -2, 1, 1, '#4B5563'); }
  // (the shopfront in the cave's mouth: glass, the plush on its shelves, the door)
  R(g, -24, -24, 48, 24, INK); R(g, -23, -23, 46, 23, '#1A0A08');
  for (const x of [-21, 9]) { R(g, x, -20, 13, 12, '#FDE68A'); R(g, x, -20, 13, 1, '#FFFBEB'); R(g, x, -14, 13, 1, OAK[2]); for (let k = 0; k < 3; k++) { R(g, x + 1 + k * 4, -18, 3, 4, k % 2 ? '#DC2626' : '#7C3AED'); R(g, x + 1 + k * 4, -19, 1, 1, INK); R(g, x + 3 + k * 4, -19, 1, 1, INK); R(g, x + 1 + k * 4, -12, 3, 4, k % 2 ? '#16A34A' : '#DC2626'); } }
  R(g, -6, -18, 12, 18, '#3A1410'); R(g, -5, -17, 10, 17, '#F59E0B'); R(g, -5, -17, 10, 2, '#FDE68A'); R(g, 0, -17, 1, 17, '#3A1410');
  // (the awning: red and black stripes, a scalloped edge)
  poly(g, [-28, -24, 28, -24, 31, -18, -31, -18], INK); for (let k = 0; k < 10; k++) { poly(g, [-27 + k * 5.5, -24, -21.5 + k * 5.5, -24, -21 + k * 6, -19, -27 + k * 6 - 3, -19], k % 2 ? '#DC2626' : '#18181B', false); ell(g, -27.5 + k * 6.2, -18, 3, 2, k % 2 ? '#DC2626' : '#18181B', false); }
  R(g, -28, -24, 56, 1, '#F87171');
  // (a rack of pitchforks by the door; a tub of plush tails; the $ board)
  for (let k = 0; k < 3; k++) { R(g, 26 + k * 3, -14, 1, 14, OAK[3]); R(g, 25 + k * 3, -16, 3, 1, '#DC2626'); R(g, 25 + k * 3, -18, 1, 2, '#DC2626'); R(g, 27 + k * 3, -18, 1, 2, '#DC2626'); }
  R(g, -34, -8, 8, 8, INK); R(g, -33, -7, 6, 6, '#FDE047'); txt(g, '$', -29.5, -1.5, '#7F1D1D', 5);
  sign(g, 'HELL GIFT SHOP', 0, -58, -41, '#7F1D1D', '#FDE68A', 5, true);
  R(g, -14, -31, 28, 6, INK); R(g, -13, -30, 26, 4, '#14532D'); txt(g, 'EXIT THRU', 0.5, -26.5, '#BBF7D0', 3);
};

/** THE ELEVATOR TO HELL: the clock tower (coursed stone, buttressed, the big clock face under its belfry and purple
 *  spike, gargoyles), the drop ride's track bolted up its east side with the red car part way up, the red doors at
 *  its foot with the ride's board over them, hell's light out from under them. */
export const paintHellevator = (g: Ctx) => {
  // (the plinth and its steps)
  R(g, -27, -6, 54, 6, INK); R(g, -26, -5, 52, 5, STONE[1]); R(g, -26, -5, 52, 1, STONE[4]); R(g, -22, -8, 44, 3, STONE[2]); R(g, -22, -8, 44, 1, STONE[4]);
  // (the shaft: coursed, quoins at its corners, lancets up it)
  wall(g, -15, -100, 30, 92);
  for (let y = -98; y < -10; y += 8) { R(g, -15, y, 4, 4, STONE[1]); R(g, 11, y, 4, 4, STONE[4]); }
  for (const y of [-90, -70, -50]) lancet(g, -4, y, 9);
  // (buttresses at the foot)
  for (const s of [-1, 1]) { poly(g, [s * 15, -40, s * 22, -26, s * 22, -8, s * 15, -8], s < 0 ? STONE[1] : STONE[3]); R(g, s < 0 ? -22 : 15, -26, 7, 1, STONE[4]); }
  // (the clock's housing: wider, a cornice under and over; the face)
  R(g, -20, -128, 40, 30, INK); sBlock(g, -19, -127, 38, 28, STONE); courses(g, -19, -127, 38, 28, 7, 4, STONE[1]);
  R(g, -21, -100, 42, 3, INK); R(g, -20, -99, 40, 1, STONE[4]); R(g, -21, -130, 42, 3, INK); R(g, -20, -129, 40, 1, STONE[4]);
  ell(g, 0, -113, 12, 12, '#3A2A1A'); sBall(g, 0, -113, 10.5, 10.5, ['#B8A888', '#D8CCA8', '#F0E8D0', '#FBF6E6', '#FFFFFF'], false);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; R(g, Math.sin(a) * 8.5 - 0.5, -113 - Math.cos(a) * 8.5 - 0.5, 1, 1, '#1E1036'); }
  line(g, 0, -113, 0, -121, '#1E1036', 1.5); line(g, 0, -113, 5, -110, '#1E1036', 2); R(g, -1, -114, 2, 2, RED[2]);
  // (gargoyles off the cornice's corners)
  for (const s of [-1, 1]) { poly(g, [s * 20, -100, s * 27, -102, s * 28, -99, s * 24, -97, s * 20, -96], DARKST[2]); R(g, s * 26 - 0.5, -101, 1, 1, RED[3]); }
  // (the belfry: open arches, the bell; the spike and its weathervane bat)
  sBlock(g, -14, -140, 28, 10, STONE); for (const x of [-9, 0, 9]) { poly(g, [x - 3, -130, x - 3, -136, x, -139, x + 3, -136, x + 3, -130], '#120C1C', false); } R(g, -1, -136, 3, 4, '#C8982E');
  sRoof(g, -17, 17, -140, 0, -164, SLATE);
  // (the drop ride: its lattice track up the east side, the car on it, riders' heads; the cable)
  R(g, 16, -126, 2, 120, INK); R(g, 21, -126, 2, 120, INK); R(g, 16.5, -126, 1, 120, '#9CA3AF'); R(g, 21.5, -126, 1, 120, '#D1D5DB');
  for (let y = -122; y < -8; y += 6) line(g, 17, y, 22, y + 6, '#6B7280');
  R(g, 13, -78, 14, 13, INK); R(g, 14, -77, 12, 11, RED[2]); R(g, 14, -77, 12, 2, RED[4]); R(g, 22, -77, 4, 11, RED[3]); R(g, 15, -74, 10, 4, '#FDE68A');
  for (let k = 0; k < 3; k++) R(g, 16 + k * 3, -75, 2, 2, ['#F2C9A0', '#8A5A3A', '#E8B48A'][k]);
  // (the doors: red, brass-edged; hell's light out from under them; the board over them)
  R(g, -9, -32, 18, 24, INK); R(g, -8, -31, 16, 23, RED[2]); R(g, -8, -31, 16, 2, RED[4]); R(g, -0.5, -31, 1, 23, RED[0]); R(g, -3, -20, 1, 2, '#E8C44A'); R(g, 2, -20, 1, 2, '#E8C44A');
  R(g, -8, -9, 16, 1, '#FDE047'); dith(g, -10, -8, 20, 2, '#F97316');
  R(g, -19, -46, 38, 13, INK); R(g, -18, -45, 36, 11, '#7F1D1D'); R(g, -18, -45, 36, 1, '#F87171'); txt(g, 'ELEVATOR', 0.5, -39.5, '#FDE68A', 4); txt(g, 'TO HELL', 0.5, -34.5, '#FDE68A', 4);
  for (const x of [-16, 15]) R(g, x, -48, 1, 3, '#4B5563');
};
