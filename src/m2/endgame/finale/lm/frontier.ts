import { type Ctx, INK, R, poly, ell, line, txt, sign } from './kit';
import { rampOf, dith, sBlock, sCol, sBall, sRoof, courses, mound } from './shade';

// ---------------------------------------------------------------------------------------------------------------
// WILDERNESS LAND (the second pass): a theme park's Old West, so it's sawn boards, molded fiberglass rock with the
// bolts showing, plywood pines on their braces. Lit from the east (the right).

const BOARD = ['#3A2412', '#6A4522', '#9A6A3A', '#C08E56', '#E4BC84'];
const DARKW = ['#1E120A', '#3A2414', '#5A3A24', '#7A5234', '#9A6E48'];
const ROCK = ['#5A3424', '#8A5232', '#B4764A', '#D49A66', '#F0C490'];
const IRON = ['#07090E', '#151A24', '#262E3C', '#445066', '#7A88A0'];
const BRASS = ['#5A3E0C', '#8A641A', '#C8982E', '#E8C458', '#FBE9A6'];
const RED = ['#4A0A0A', '#7F1D1D', '#B91C1C', '#DC4A3A', '#F4907A'];
const PINE = ['#0E2E1E', '#1A4A2E', '#2A6A3E', '#44904E', '#7ABE6A'];
const CREAM = ['#8A8270', '#B8B098', '#E0D8C0', '#F4EEDC', '#FFFFFF'];
const WATER = ['#1E4A8A', '#2E6AB4', '#60A5FA', '#A8D0FC', '#F0F8FF'];
const DIRT = rampOf('#98784C', '#2A1A10');

/** A board-and-batten wall: a ramped block, battens down it. */
const boards = (g: Ctx, x: number, y: number, w: number, h: number, r: readonly string[], step = 3) => {
  sBlock(g, x, y, w, h, r);
  for (let xx = x + step; xx < x + w - 1; xx += step) R(g, xx, y + 1, 1, h - 2, r[1]);
};
/** A plywood pine on its brace (the park's: a flat cutout, its 2x4 showing behind). */
const plyPine = (g: Ctx, x: number, y: number, h: number) => {
  line(g, x + 1, y - h * 0.5, x + 6, y, BOARD[1]);
  R(g, x, y - h * 0.3, 2, h * 0.3, DARKW[2]);
  for (let k = 0; k < 3; k++) { const yy = y - h + k * h * 0.24, hw = 3 + k * 1.6; poly(g, [x + 1, yy, x + 1 - hw, yy + h * 0.34, x + 1 + hw, yy + h * 0.34], PINE[2]); poly(g, [x + 1, yy, x + 1, yy + h * 0.34, x + 1 + hw, yy + h * 0.34], PINE[3], false); }
};
/** A false front: the tall plank face with its cornice, the real little shed behind it showing at the side, a porch
 *  roof on posts, a door, windows, its name lettered across the top. */
const falseFront = (g: Ctx, x: number, w: number, h: number, r: readonly string[], name: string, trim: string) => {
  // (the shed behind: lower, its roof's slope showing past the front's right edge)
  poly(g, [x + w, -h + 8, x + w + 5, -h + 12, x + w + 5, 0, x + w, 0], DARKW[2]);
  boards(g, x, -h, w, h, r);
  R(g, x - 1, -h - 2, w + 2, 3, INK); R(g, x, -h - 1, w, 2, trim); R(g, x, -h - 1, w, 1, '#FFFFFF88');
  R(g, x + 2, -h + 3, w - 4, 6, CREAM[3]); R(g, x + 2, -h + 3, w - 4, 1, CREAM[4]); txt(g, name, x + w / 2 + 0.5, -h + 8, DARKW[0], 4);
  for (const wx of [x + 4, x + w - 9]) { R(g, wx, -h + 11, 5, 6, '#26303C'); R(g, wx, -h + 11, 5, 1, '#7FB6DC'); R(g, wx + 2, -h + 11, 1, 6, trim); }
  // (the porch: its shingled roof, two posts, the boardwalk)
  poly(g, [x - 2, -13, x + w + 2, -13, x + w, -17, x, -17], DARKW[2]); R(g, x - 2, -13, w + 4, 1, DARKW[4]);
  for (const px of [x, x + w - 1]) R(g, px, -13, 1, 12, DARKW[3]);
  R(g, x + w / 2 - 3, -10, 6, 9, DARKW[1]); R(g, x + w / 2 - 3, -10, 6, 1, DARKW[3]);
  R(g, x - 2, -1, w + 4, 1, BOARD[3]);
};
/** A cedar water tank on its legs (staves, two iron hoops, a cone roof, the spout). */
const waterTank = (g: Ctx, x: number, top: number, w: number) => {
  const th = w * 0.8;
  for (const s of [-1, 1]) { R(g, x + s * (w / 2 - 2) - 0.5, top + th, 1.5, -top - th, DARKW[2]); }
  line(g, x - w / 2 + 2, top + th, x + w / 2 - 2, -1, DARKW[1]); line(g, x + w / 2 - 2, top + th, x - w / 2 + 2, -1, DARKW[1]);
  sCol(g, x - w / 2, top, w, th, BOARD);
  for (let xx = x - w / 2 + 2; xx < x + w / 2; xx += 2) R(g, xx, top, 0.5, th, BOARD[1]);
  for (const k of [0.25, 0.7]) R(g, x - w / 2, top + th * k, w, 1, IRON[1]);
  sRoof(g, x - w / 2 - 2, x + w / 2 + 2, top, x, top - w * 0.4, DARKW);
  line(g, x + w / 2, top + th - 2, x + w / 2 + 6, top + th + 3, IRON[2], 1.5);
};
/** A stepped cloud of steam or smoke: balls in a ramp. */
const cloud = (g: Ctx, pts: readonly (readonly [number, number, number])[], r: readonly string[]) => { for (const [x, y, rr] of pts) sBall(g, x, y, rr, rr * 0.82, r, false); };

/** LONESOME PINE STATION: the depot (board and batten, its bay window, the long platform canopy on posts), the cedar
 *  water tank and its spout, the lonesome pine itself, a baggage cart, the rails off east. */
export const paintStation = (g: Ctx) => {
  // (the ballast and the rails)
  R(g, -82, -3, 164, 3, '#6A5E52'); dith(g, -82, -3, 164, 1, '#8A7E70'); R(g, -82, -4, 164, 1, IRON[4]); for (let x = -80; x < 82; x += 6) R(g, x, -3, 3, 1, DARKW[2]);
  // (the one pine: tall, real, a little crooked)
  R(g, -74, -40, 2, 38, DARKW[2]); R(g, -73, -40, 1, 38, DARKW[3]);
  for (let k = 0; k < 4; k++) { const y = -50 + k * 9, hw = 5 + k * 2; poly(g, [-73, y, -73 - hw, y + 12, -73 + hw, y + 12], PINE[1 + (k & 1)]); poly(g, [-73, y, -73, y + 12, -73 + hw, y + 12], PINE[3], false); }
  // (the platform, the depot on it)
  R(g, -60, -7, 78, 5, INK); R(g, -59, -6, 76, 3, BOARD[2]); R(g, -59, -6, 76, 1, BOARD[4]);
  boards(g, -52, -28, 44, 22, RED.map((c, i) => (i < 2 ? c : ['#9A3A2A', '#B8523A', '#D4775A'][i - 2])));
  sBlock(g, -36, -24, 12, 18, CREAM); R(g, -34, -22, 8, 8, '#26303C'); R(g, -34, -22, 8, 1, '#7FB6DC'); R(g, -30, -22, 1, 8, CREAM[2]);
  R(g, -48, -19, 5, 13, DARKW[1]); R(g, -17, -21, 5, 6, '#26303C'); R(g, -17, -21, 5, 1, '#7FB6DC');
  sRoof(g, -56, -4, -28, -30, -40, DARKW); R(g, -31, -46, 3, 7, RED[1]); R(g, -31, -46, 3, 1, RED[3]);
  // (the canopy out over the platform, its posts and brackets)
  poly(g, [-58, -27, 20, -27, 16, -31, -54, -31], DARKW[2]); R(g, -58, -27, 78, 1, DARKW[4]);
  for (const x of [-56, -6, 16]) { R(g, x, -26, 1, 20, DARKW[3]); line(g, x + 1, -22, x + 4, -26, DARKW[3]); }
  // (the station's board, hung under the canopy's edge on two chains)
  for (const x of [-34, 6]) R(g, x, -26, 1, 3, IRON[3]);
  R(g, -41, -24, 54, 8, INK); R(g, -40, -23, 52, 6, CREAM[3]); txt(g, 'LONESOME PINE', -13.5, -18, DARKW[0], 4);
  // (a baggage cart, a milk can, a crate)
  R(g, 2, -11, 10, 4, BOARD[2]); R(g, 2, -11, 10, 1, BOARD[4]); ell(g, 4, -6.5, 1.5, 1.5, IRON[2]); ell(g, 10, -6.5, 1.5, 1.5, IRON[2]); R(g, 4, -15, 4, 4, DARKW[3]); sCol(g, 9, -15, 3, 4, IRON.map((_c, i) => ['#4A5058', '#7A8088', '#A8AEB6', '#D0D4DA', '#F0F2F4'][i]), false);
  // (the tank by the track, its spout over the rails)
  waterTank(g, 46, -44, 20);
  // (the semaphore, its arm at STOP; the buffer of sacks)
  R(g, 72, -38, 1, 36, IRON[3]); R(g, 66, -38, 7, 3, RED[2]); R(g, 66, -38, 7, 1, RED[4]); ell(g, 72.5, -40, 1.5, 1.5, '#DC2626');
};

/** THE ROCKIES (PAINTED): a painted flat, plywood sheets on 2x4 frames braced from behind, sandbagged; the painter's
 *  ladder and bucket still by it; the last sheet not done. */
export const paintRockies = (g: Ctx) => {
  const SKYB = ['#6A8AC4', '#8AA6D8', '#B4C8EA'], MTN = ['#3E4A6A', '#5A6A8E', '#7A8AA8', '#A2B0C8', '#D4DCEA'];
  // (the braces showing at both ends and through the unpainted sheet's gap)
  for (const x of [-100, 96]) { line(g, x + 2, -70, x + (x < 0 ? -1 : 5), 0, BOARD[2], 1.5); line(g, x + 2, -40, x + (x < 0 ? -2 : 6), -1, BOARD[1]); }
  // (the flat: six sheets; its cut-out top follows the peaks)
  const top = (x: number) => -46 - 24 * Math.max(0, 1 - Math.abs(x + 58) / 34) - 30 * Math.max(0, 1 - Math.abs(x - 8) / 40) - 18 * Math.max(0, 1 - Math.abs(x - 70) / 26);
  g.save(); g.beginPath(); g.moveTo(-96, -2); for (let x = -96; x <= 96; x += 2) g.lineTo(x, top(x) - 6); g.lineTo(96, -2); g.closePath();
  g.fillStyle = INK; g.fill(); g.clip();
  // (the painted sky, in three flat bands; the peaks; the snow; the pines along the foot)
  for (let k = 0; k < 3; k++) R(g, -95, -90 + k * 14, 190, 90, SKYB[k]);
  g.beginPath(); g.moveTo(-95, -2); for (let x = -95; x <= 95; x += 1) g.lineTo(x, top(x)); g.lineTo(95, -2); g.closePath(); g.fillStyle = MTN[2]; g.fill();
  for (const [px, ph] of [[-58, 70], [8, 76], [70, 64]] as const) {
    poly(g, [px, -ph, px - 30, -24, px, -24], MTN[1], false); poly(g, [px, -ph, px + 4, -ph + 10, px + 30, -24, px, -24], MTN[3], false);
    poly(g, [px, -ph, px - 7, -ph + 14, px - 2, -ph + 10, px + 2, -ph + 16, px + 7, -ph + 12], '#FFFFFF', false); poly(g, [px, -ph, px - 7, -ph + 14, px - 2, -ph + 10], MTN[4], false);
  }
  R(g, -95, -24, 190, 22, PINE[1]); for (let x = -94; x < 95; x += 5) poly(g, [x, -24, x + 2.5, -31 - ((x * 7) & 3), x + 5, -24], PINE[2], false);
  R(g, -95, -8, 190, 6, PINE[0]);
  // (the sheets' seams; the last sheet: bare plywood, the pencil lines on it)
  for (let k = 1; k < 6; k++) R(g, -95 + k * 31.6, -90, 0.5, 90, '#00000055');
  R(g, 63, -90, 33, 90, BOARD[3]); for (let y = -80; y < 0; y += 5) R(g, 63, y, 33, 0.5, BOARD[2]); g.strokeStyle = DARKW[2]; g.lineWidth = 0.5; g.beginPath(); g.moveTo(63, -44); g.lineTo(70, -60); g.lineTo(84, -40); g.lineTo(96, -30); g.stroke();
  g.restore();
  // (sandbags on its foot; the ladder, the bucket)
  for (const x of [-88, -40, 20, 82]) { ell(g, x, -2, 6, 2.5, '#B8A888'); R(g, x - 3, -4, 5, 1, '#D8CCB0'); }
  line(g, 52, -1, 60, -50, BOARD[3], 1.5); line(g, 58, -1, 66, -50, BOARD[3], 1.5); for (let k = 1; k < 8; k++) line(g, 52 + k + 0.5, -1 - k * 6, 58 + k + 0.5, -1 - k * 6, BOARD[2]);
  sCol(g, 44, -6, 5, 6, IRON.map((_c, i) => ['#4A5058', '#7A8088', '#A8AEB6', '#D0D4DA', '#F0F2F4'][i]), true); R(g, 44, -6, 5, 1, '#F8FAFC');
  sign(g, 'THE ROCKIES (PAINTED)', -22, -16, -1, CREAM[3], DARKW[0], 4, true);
};

/** SAWDUST GULCH: the main street's false fronts (each its own paint and trim, its shed showing behind), the white
 *  church and its steeple, the cedar water tower, the windmill, hitching rail and barrels, the town's sign over the
 *  street on its two poles. */
export const paintGulch = (g: Ctx) => {
  R(g, -126, -2, 252, 2, DIRT[1]);
  // (the windmill and the tank behind the fronts)
  R(g, -108, -70, 1, 70, DARKW[2]); line(g, -112, 0, -108, -60, DARKW[2]); line(g, -104, 0, -108, -60, DARKW[2]);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.2; poly(g, [-107.5, -70, -107.5 + Math.cos(a) * 9, -70 + Math.sin(a) * 9, -107.5 + Math.cos(a + 0.4) * 9, -70 + Math.sin(a + 0.4) * 9], k % 2 ? CREAM[2] : CREAM[4], false); }
  ell(g, -107.5, -70, 1.5, 1.5, IRON[3]); poly(g, [-107, -70, -98, -73, -98, -67], RED[2]);
  waterTank(g, 62, -62, 20);
  const fronts: [number, number, number, readonly string[], string, string][] = [
    [-98, 34, 34, BOARD, 'SALOON', RED[2]], [-60, 30, 28, rampOf('#7A8A6A', '#1A1810'), 'SHERIFF', CREAM[3]], [-26, 36, 40, rampOf('#B4764A', '#2A1408'), 'HOTEL', CREAM[3]],
    [14, 30, 30, rampOf('#8A6A8A', '#1A1020'), 'OPERA', BRASS[3]], [48, 30, 26, BOARD, 'GENERAL', PINE[3]],
  ];
  for (const [x, w, h, r, name, trim] of fronts) falseFront(g, x, w, h, r, name, trim);
  // (the hotel's balcony; the saloon's swing doors; the sheriff's star)
  R(g, -27, -27, 38, 1, CREAM[3]); for (let x = -26; x < 11; x += 3) R(g, x, -27, 1, 5, CREAM[2]);
  R(g, -84, -10, 6, 5, BOARD[4]); R(g, -81.5, -10, 1, 5, DARKW[1]);
  R(g, -46, -24, 2, 2, BRASS[3]);
  // (the bank: brick, a stone cornice)
  sBlock(g, 82, -30, 22, 30, rampOf('#9A4A36', '#1A0A08')); courses(g, 82, -30, 22, 30, 5, 3, '#6A2E22'); R(g, 81, -33, 24, 3, INK); R(g, 82, -32, 22, 2, CREAM[3]);
  txt(g, 'BANK', 93.5, -23, CREAM[4], 4); R(g, 90, -10, 6, 10, DARKW[1]); R(g, 85, -18, 4, 5, '#26303C'); R(g, 98, -18, 4, 5, '#26303C');
  // (the church: white clapboard, its steeple and cross, lit down its east side)
  sBlock(g, 108, -30, 16, 30, CREAM); for (let y = -27; y < 0; y += 3) R(g, 108, y, 16, 0.5, CREAM[1]);
  sBlock(g, 112, -46, 8, 16, CREAM); R(g, 114, -42, 4, 6, '#26303C'); sRoof(g, 110, 122, -46, 116, -68, CREAM); R(g, 115.5, -76, 1, 9, DARKW[2]); R(g, 113, -73, 6, 1, DARKW[2]);
  R(g, 113, -12, 6, 12, DARKW[1]); poly(g, [113, -12, 116, -16, 119, -12], DARKW[1], false);
  // (the street's furniture: a hitching rail, barrels, a trough)
  R(g, -20, -5, 16, 1, DARKW[3]); R(g, -20, -5, 1, 5, DARKW[3]); R(g, -5, -5, 1, 5, DARKW[3]);
  for (const x of [-64, 44]) { sCol(g, x, -6, 5, 6, BOARD, true); R(g, x, -4, 5, 1, IRON[2]); }
  R(g, 20, -4, 12, 4, DARKW[2]); R(g, 21, -4, 10, 1, WATER[2]);
  // (the town's sign, over the street between two poles)
  sign(g, 'SAWDUST GULCH', -8, -64, -1, BOARD[3], DARKW[0], 6, true);
};

/** THE TRAIN CRASH (Wilderness Land's, the end of the line at Sawdust Gulch: town/crash.ts): the depot with a hole
 *  stove in its front and its canopy down; No. 7 through the buffer stop, nosed down into the dirt, her back end up;
 *  the tender ridden up onto the cab; the coach jackknifed the other way; the rails torn up and curled; boards
 *  everywhere; steam and smoke standing off it. */
export const paintTrainCrash = (g: Ctx) => {
  // (the churned dirt, the ballast, what's left of the rails and ties)
  mound(g, [-110, 0, -70, -3, -30, -7, 8, -10, 30, -6, 110, 0], DIRT, 4);
  R(g, -110, -4, 60, 1, IRON[4]); for (let x = -108; x < -50; x += 6) R(g, x, -3, 3, 1, DARKW[2]);
  for (const [x0, cx, cy, x1, y1] of [[-52, -30, -40, -6, -22], [-50, -22, -28, 6, -34]] as const) {
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, -4); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
    g.strokeStyle = IRON[4]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, -4); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
  }
  // (the steam and the smoke, standing off the wreck: behind everything)
  cloud(g, [[2, -62, 10], [14, -76, 12], [30, -86, 10], [-6, -80, 8]], ['#6A6470', '#8E8894', '#B8B2BC', '#DAD6DC', '#F6F4F6']);
  cloud(g, [[-84, -56, 8], [-92, -70, 10], [-80, -84, 7]], ['#1A1820', '#2C2A34', '#44424E', '#62606C', '#84828E']);
  // (the depot: board and batten, its sign hanging by one corner, the hole stove in its front, the canopy down)
  boards(g, 34, -48, 74, 48, BOARD, 4);
  sRoof(g, 28, 114, -48, 76, -62, DARKW);
  for (let x = 32; x < 112; x += 5) R(g, x, -49 - Math.max(0, 12 - Math.abs(x - 76) * 0.28), 2, 1, DARKW[4]);
  R(g, 84, -34, 8, 10, '#26303C'); R(g, 84, -34, 8, 1, '#7FB6DC'); R(g, 87.5, -34, 1, 10, CREAM[2]); R(g, 96, -34, 8, 10, '#26303C'); R(g, 96, -34, 8, 1, '#7FB6DC');
  poly(g, [34, -44, 52, -40, 66, -30, 70, -14, 62, 0, 34, 0], '#120A06'); poly(g, [36, -40, 50, -37, 62, -28, 64, -14, 58, -2, 36, -2], '#241408', false);
  for (const [x, y, a] of [[50, -40, 0.5], [64, -30, 1.1], [68, -16, 1.5], [60, -4, 2.2], [40, -44, 0.2]] as const) { g.save(); g.translate(x, y); g.rotate(a); R(g, -1, -1, 9, 2, BOARD[3]); R(g, -1, -1, 9, 0.5, BOARD[4]); g.restore(); }
  g.save(); g.translate(92, -44); g.rotate(0.3); R(g, -19, -1, 40, 9, INK); R(g, -18, 0, 38, 7, CREAM[3]); txt(g, 'SAWDUST GULCH', 1, 6, DARKW[0], 3); g.restore();
  g.save(); g.translate(70, -10); g.rotate(0.22); R(g, -34, -2, 76, 4, INK); R(g, -33, -1, 74, 2, DARKW[2]); R(g, -33, -1, 74, 1, DARKW[4]); g.restore();
  // (the coach, jackknifed: its nose in the dirt, its back end up in the air)
  g.save(); g.translate(-78, -14); g.rotate(-0.4);
  R(g, -27, -17, 54, 19, INK); R(g, -26, -16, 52, 17, RED[2]); R(g, -26, -16, 52, 2, RED[4]); R(g, -26, -3, 52, 4, RED[1]); R(g, -27, -20, 54, 4, INK); R(g, -26, -19, 52, 2, DARKW[3]); R(g, -26, -19, 52, 1, CREAM[2]);
  for (let k = 0; k < 6; k++) { R(g, -23 + k * 8, -13, 5, 6, k === 2 || k === 4 ? '#120A06' : '#FDE68A'); R(g, -23 + k * 8, -13, 5, 1, CREAM[4]); }
  R(g, -26, -5, 52, 1, BRASS[3]);
  for (const x of [-18, 18]) { ell(g, x, 3, 4, 4, IRON[2]); ell(g, x, 3, 1.5, 1.5, IRON[4], false); }
  g.restore();
  // (the tender, ridden up onto the cab: coal spilling off it)
  g.save(); g.translate(-58, -62); g.rotate(0.75);
  R(g, -16, -11, 32, 15, INK); R(g, -15, -10, 30, 13, IRON[2]); R(g, -15, -10, 30, 2, IRON[4]); R(g, -15, 0, 30, 3, IRON[1]); R(g, -15, -4, 30, 1, BRASS[2]);
  for (let k = 0; k < 7; k++) ell(g, -12 + k * 4, -11 - (k % 2), 3, 2, IRON[k % 2], false);
  for (const x of [-9, 9]) ell(g, x, 5, 3.5, 3.5, IRON[2]);
  g.restore();
  for (const [x, y] of [[-40, -36], [-46, -24], [-34, -12], [-44, -6], [-52, -44]] as const) R(g, x, y, 2, 2, IRON[0]);
  // (No. 7: nosed down into the depot's front, her back end up: the cab, the boiler in its brass bands, the domes
  // and the bell, the diamond stack buckled, the red drivers off the rail, the cowcatcher buried)
  g.save(); g.translate(14, -22); g.rotate(0.32);
  // the cab (varnished, its arched window)
  R(g, -65, -33, 20, 35, INK); R(g, -64, -32, 18, 33, '#7A3A1E'); R(g, -64, -32, 18, 2, '#C87A4A'); R(g, -50, -32, 4, 33, '#9A5230'); R(g, -67, -36, 24, 4, INK); R(g, -66, -35, 22, 2, IRON[3]);
  R(g, -60, -26, 9, 10, '#120A06'); R(g, -60, -26, 9, 1, BRASS[3]);
  // the boiler: banded top to bottom, brass bands round it
  R(g, -47, -23, 54, 22, INK);
  const B = [IRON[4], IRON[3], IRON[2], IRON[2], IRON[1], IRON[0]];
  for (let k = 0; k < 6; k++) R(g, -46, -22 + k * 3.4, 52, 4, B[k]);
  dith(g, -46, -19, 52, 1, IRON[3]); dith(g, -46, -9, 52, 1, IRON[1]);
  for (const x of [-34, -20, -6]) { R(g, x, -22, 2, 20, BRASS[2]); R(g, x, -22, 2, 4, BRASS[4]); }
  R(g, -46, -6, 52, 2, RED[2]);
  // the domes, the bell, the stack (buckled over)
  sBall(g, -27, -24, 5, 5, BRASS); sBall(g, -12, -24, 4, 4, IRON.map((c, i) => (i > 2 ? BRASS[i] : c)));
  R(g, -20, -30, 3, 4, BRASS[3]);
  g.save(); g.translate(0, -22); g.rotate(0.5); R(g, -3, -14, 6, 14, INK); R(g, -2, -13, 4, 13, IRON[2]); R(g, 0, -13, 1, 13, IRON[4]); poly(g, [-5, -13, 5, -13, 7, -19, -7, -19], IRON[1]); R(g, -6, -19, 12, 1, IRON[4]); g.restore();
  // the smokebox front, the lamp, the plate
  R(g, 5, -24, 5, 24, INK); R(g, 6, -23, 3, 22, IRON[1]); ell(g, 8, -12, 2.5, 2.5, BRASS[3]); R(g, 6, -30, 6, 6, INK); R(g, 7, -29, 4, 4, '#FDE68A');
  // the running gear: two big drivers, the rod, the pilot wheels; the cowcatcher into the dirt
  R(g, -46, -2, 60, 2, IRON[1]);
  for (const x of [-36, -18]) { ell(g, x, 6, 8, 8, RED[2]); ell(g, x, 6, 5.5, 5.5, RED[1], false); for (let s = 0; s < 6; s++) { const a = s * 1.047; line(g, x, 6, x + Math.cos(a) * 7, 6 + Math.sin(a) * 7, RED[3]); } ell(g, x, 6, 2, 2, IRON[3], false); }
  R(g, -38, 7, 24, 2, IRON[4]); for (const x of [0, 9]) { ell(g, x, 9, 4, 4, RED[2]); ell(g, x, 9, 1.5, 1.5, IRON[3], false); }
  poly(g, [10, -4, 24, 12, 10, 12], RED[2]); for (let k = 0; k < 4; k++) line(g, 11, -1 + k * 3.5, 11 + k * 3.5 + 2, 12, RED[4]);
  g.restore();
  // (the dirt thrown up over her nose; the buffer stop's timbers, scattered)
  mound(g, [16, 0, 24, -9, 34, -13, 44, -8, 52, 0], DIRT, 4);
  for (const [x, y, a] of [[-4, -3, 0.4], [-96, -4, -0.3], [22, -16, 1.0], [-14, -2, 2.4], [104, -3, 0.1]] as const) { g.save(); g.translate(x, y); g.rotate(a); R(g, -1, -1, 10, 3, INK); R(g, 0, 0, 8, 1, BOARD[3]); g.restore(); }
  // (a little fire in the cab and the coal, dimmed: the live one goes over it)
  for (const [x, y] of [[-40, -74], [-36, -78], [-60, -72]] as const) { R(g, x, y, 3, 5, '#9A3A1A'); R(g, x + 1, y + 2, 1, 3, '#E8A040'); }
};

/** THE MOTHER LODE MINE: its fiberglass mountain (seams and bolts), the adit's timbered mouth with its lamp and the
 *  ore carts on their track, the headframe over the shaft with its sheave wheel, the high trestle off east. */
export const paintMine = (g: Ctx) => {
  mound(g, [-110, 0, -92, -26, -74, -48, -54, -56, -30, -46, -12, -22, 4, 0], ROCK, 13);
  for (const [x0, y0, x1, y1] of [[-88, -4, -70, -46], [-52, -54, -40, -4], [-28, -44, -14, -2]] as const) line(g, x0, y0, x1, y1, ROCK[1]);
  for (let k = 0; k < 10; k++) R(g, -96 + k * 9, -8 - ((k * 13) % 30), 1, 1, ROCK[4]);
  // (the adit: timbers, dark inside, a lamp; the name over it on its board)
  R(g, -66, -22, 22, 22, INK); R(g, -64, -20, 18, 20, '#0E0806'); R(g, -64, -20, 18, 3, '#2A1810');
  for (const x of [-66, -47]) { R(g, x, -23, 3, 23, BOARD[2]); R(g, x + 2, -23, 1, 23, BOARD[4]); } R(g, -68, -26, 26, 4, INK); R(g, -67, -25, 24, 2, BOARD[3]);
  R(g, -56, -18, 2, 3, '#FDE68A');
  R(g, -78, -36, 46, 9, INK); R(g, -77, -35, 44, 7, BOARD[3]); txt(g, 'MOTHER LODE', -54.5, -29.5, DARKW[0], 4);
  for (const x of [-74, -38]) R(g, x, -27, 1, 2, DARKW[2]);
  // (the track out of it, two ore carts heaped with gold-painted rock)
  R(g, -64, -2, 80, 1, IRON[4]); for (let x = -62; x < 16; x += 5) R(g, x, -1, 3, 1, DARKW[2]);
  for (const x of [-36, -20]) { poly(g, [x, -9, x + 12, -9, x + 10, -3, x + 2, -3], IRON[2]); R(g, x, -9, 12, 1, IRON[4]); for (let k = 0; k < 3; k++) sBall(g, x + 3 + k * 3, -10.5, 2, 1.8, BRASS, false); ell(g, x + 3, -2.5, 1.5, 1.5, IRON[1]); ell(g, x + 9, -2.5, 1.5, 1.5, IRON[1]); }
  // (the headframe: an A of timber, cross-braced, the sheave wheel up top, the hoist shed)
  for (const [x0, x1] of [[2, 14], [34, 22]] as const) { line(g, x0, 0, x1, -56, INK, 4); line(g, x0, 0, x1, -56, BOARD[2], 2); line(g, x0 + 0.6, 0, x1 + 0.6, -56, BOARD[4], 0.5); }
  for (const y of [-14, -30, -44]) { const k = -y / 56, xa = 2 + 12 * k, xb = 34 - 12 * k; R(g, xa, y, xb - xa, 1.5, BOARD[2]); line(g, xa, y, xb, y - 13, BOARD[1]); }
  R(g, 11, -59, 14, 4, INK); R(g, 12, -58, 12, 2, BOARD[3]);
  ell(g, 18, -60, 6, 6, IRON[2]); ell(g, 18, -60, 4, 4, '#C8A094', false); for (let s = 0; s < 4; s++) { const a = s * 0.785; line(g, 18 - Math.cos(a) * 5, -60 - Math.sin(a) * 5, 18 + Math.cos(a) * 5, -60 + Math.sin(a) * 5, IRON[3]); }
  line(g, 23, -62, 44, -14, IRON[3]); boards(g, 40, -16, 16, 16, RED.map((c, i) => (i < 2 ? c : ['#8A3A2A', '#A8523A', '#C4775A'][i - 2]))); sRoof(g, 38, 58, -16, 48, -23, DARKW);
  // (the trestle: bents, X braces, the deck and its rails, running off the box's east end)
  for (let x = 62; x <= 108; x += 11) { R(g, x, -32, 1.5, 32, BOARD[2]); R(g, x + 1, -32, 0.5, 32, BOARD[4]); if (x < 108) { line(g, x, -30, x + 11, -16, BOARD[1]); line(g, x + 11, -30, x, -16, BOARD[1]); line(g, x, -15, x + 11, -1, BOARD[1]); line(g, x + 11, -15, x, -1, BOARD[1]); R(g, x, -16, 12, 1, BOARD[2]); } }
  R(g, 58, -36, 53, 4, INK); R(g, 59, -35, 51, 2, BOARD[3]); R(g, 59, -35, 51, 1, BOARD[4]); R(g, 59, -37, 51, 1, IRON[4]);
};

/** TIMBER TUMBLE, the log ride: its fiberglass mesa (flat-topped, strata banded, the seams and bolts showing), the
 *  lift hill's trestle up its west end, the trough along the ledge past the Old Sawmill, THE BIG DROP down its east
 *  face on its bents with a log of guests going over the lip, the splash pool and its white water, plywood pines. */
export const paintTimber = (g: Ctx) => {
  // (the mesa: cliffs and ledges, a flat top)
  mound(g, [-104, 0, -96, -30, -84, -44, -70, -70, -58, -84, 34, -84, 44, -70, 54, -48, 70, -30, 86, -10, 100, 0], ROCK, 20);
  // (strata: darker seams along it, a cap of pale rock; the shell's panel seams and bolts)
  for (const [y, c] of [[-70, ROCK[1]], [-52, ROCK[0]], [-30, ROCK[1]]] as const) { for (let x = -98; x < 90; x += 3) { const inside = x > -100 + (-y) * 0.5 && x < 96 + y * 0.72; if (inside && ((x * 7 + y) & 7) !== 0) R(g, x, y + ((x >> 3) & 1), 2, 1, c); } }
  R(g, -56, -83, 88, 2, ROCK[4]); dith(g, -56, -81, 88, 1, ROCK[4]);
  for (const x of [-40, -8, 24]) { R(g, x, -82, 0.5, 80, ROCK[1]); for (let y = -76; y < -6; y += 12) R(g, x + 1, y, 1, 1, ROCK[4]); }
  // (plywood pines along its foot and up on the top, on their braces)
  for (const [x, y, h] of [[-92, 0, 16], [-78, 0, 20], [-22, 0, 18], [-6, 0, 22], [12, 0, 17], [-50, -84, 14], [-36, -84, 17], [20, -84, 13]] as const) plyPine(g, x, y, h);
  // (the Old Sawmill up on the top: a shed, its big blade, the trough through it)
  boards(g, -16, -100, 26, 16, BOARD); sRoof(g, -20, 14, -100, -3, -109, DARKW);
  R(g, -10, -96, 14, 12, '#1A0E06'); ell(g, -3, -90, 5, 5, IRON[3]); ell(g, -3, -90, 3.5, 3.5, '#C8D0DA', false); ell(g, -3, -90, 1, 1, IRON[1], false);
  // (the lift hill: the trough up the west end on its trestle, the chain's cleats)
  const flume = (pts: number[]) => {
    g.lineJoin = 'round';
    for (const [c, w] of [[INK, 7], [BOARD[2], 5], [WATER[2], 2.5]] as [string, number][]) { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); }
    g.strokeStyle = WATER[4]; g.lineWidth = 0.5; g.beginPath(); g.moveTo(pts[0], pts[1] - 1); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1] - 1); g.stroke();
    g.strokeStyle = BOARD[4]; g.beginPath(); g.moveTo(pts[0], pts[1] - 3); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1] - 3); g.stroke();
    g.lineJoin = 'miter';
  };
  for (let x = -106; x <= -66; x += 8) { const y = -8 - ((x + 106) / 40) * 80; R(g, x, y, 1.5, -y, BOARD[2]); if (x < -66) { line(g, x, y + 4, x + 8, Math.min(0, y + 22), BOARD[1]); } }
  flume([-108, -6, -66, -90, -30, -90, -16, -93]);
  for (let k = 1; k < 8; k++) R(g, -108 + k * 5.2, -6 - k * 10.4 - 1, 2, 1, IRON[3]);
  // (out of the mill, along the top to the lip)
  flume([10, -93, 30, -90, 42, -88]);
  // (THE BIG DROP: down the east face on its bents, into the pool)
  for (let x = 48; x <= 84; x += 9) { const y = -88 + ((x - 42) / 46) * 80; R(g, x, y + 3, 1.5, -y - 3, BOARD[2]); R(g, x + 1, y + 3, 0.5, -y - 3, BOARD[4]); if (x < 84) line(g, x, y + 8, x + 9, Math.min(-1, y + 30), BOARD[1]); }
  flume([42, -88, 88, -8]);
  // (a log going over the lip: four guests, arms up)
  g.save(); g.translate(52, -74); g.rotate(1.05);
  R(g, -9, -5, 18, 6, INK); R(g, -8, -4, 16, 4, '#7A5230'); R(g, -8, -4, 16, 1, '#B88A5A'); R(g, 7, -4, 1, 4, '#E4C89A');
  for (let k = 0; k < 4; k++) { R(g, -6 + k * 3.5, -7, 2, 3, ['#DC2626', '#2563EB', '#FDE047', '#16A34A'][k]); R(g, -6 + k * 3.5, -9, 2, 2, ['#F2C9A0', '#8A5A3A', '#E8B48A', '#C68A5E'][k]); R(g, -6 + k * 3.5, -12, 1, 3, ['#F2C9A0', '#8A5A3A', '#E8B48A', '#C68A5E'][k]); }
  g.restore();
  // (the splash pool: banded water, the white water where the last log hit, the bridge over its far end)
  R(g, 64, -8, 46, 8, INK); R(g, 65, -7, 44, 7, WATER[1]); R(g, 65, -7, 44, 2, WATER[3]); dith(g, 65, -5, 44, 1, WATER[2]); R(g, 65, -2, 44, 2, WATER[0]);
  for (const [x, y, r] of [[88, -10, 5], [94, -14, 4], [82, -13, 3.5], [99, -9, 3]] as const) sBall(g, x, y, r, r, ['#8AB4E8', '#B8D4F4', '#E0EEFC', '#F4FAFF', '#FFFFFF'], false);
  for (const [x, y] of [[80, -20], [90, -22], [98, -18], [86, -26]] as const) R(g, x, y, 1, 2, '#FFFFFF');
  // (the name, big, on its two log posts at the mesa's foot)
  sign(g, 'TIMBER TUMBLE', -36, -36, -1, BOARD[3], DARKW[0], 6, true);
};
