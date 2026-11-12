import { type Ctx, INK, R, poly, ell, line, txt, sign, tree } from './kit';
import { rampOf, dith, sBlock, sCol, sBall } from './shade';

// ---------------------------------------------------------------------------------------------------------------
// CARTOON LAND (the second pass): 1994's Saturday morning in candy colors, fat shapes, nothing straight; lit from the
// east (the right).

const PINK = ['#7A1A4E', '#C03A82', '#F472B6', '#F9A8D4', '#FFE0F0'];
const PURPLE = ['#2E1065', '#5B21B6', '#7C3AED', '#A78BFA', '#DDD6FE'];
const LILAC = ['#4A2A78', '#7450A8', '#C084FC', '#DDB6FE', '#F5EAFF'];
const YELLOW = ['#7A4A06', '#C88A0E', '#FDE047', '#FEF08A', '#FFFCE0'];
const CYAN = ['#0A4A5A', '#0E7C92', '#22D3EE', '#7EE8F8', '#DCFBFF'];
const LIME = ['#2A4A0A', '#4D7C0F', '#A3E635', '#D0F47A', '#F4FFD0'];
const WHITE = ['#6A6A80', '#A8A8BC', '#E0E0EA', '#F4F4F8', '#FFFFFF'];
const RED = ['#4A0A0A', '#8A1616', '#DC2626', '#F87171', '#FECACA'];
const ORANGE = rampOf('#F97316', '#3A1004');
const BROWN = rampOf('#8A5A2E', '#1A0E06');

/** A Truffula tuft: a striped bendy trunk, a pom-pom on top. */
const tuft = (g: Ctx, x: number, h: number, bend: number, r: readonly string[]) => {
  for (let k = 0; k < h; k += 2) { const u = k / h, xx = x + Math.sin(u * 2.2) * bend; R(g, xx, -k - 2, 2, 2, (k >> 1) % 2 ? '#FDE047' : '#1A1028'); }
  const tx = x + Math.sin(2.2) * bend + 1;
  sBall(g, tx, -h - 4, 6, 5.5, r); for (let k = 0; k < 7; k++) { const a = k * 0.9; R(g, tx + Math.cos(a) * 6.5, -h - 4 + Math.sin(a) * 6, 1, 1, r[3]); }
};
/** A Sillyville house: a fat curvy body, a drooping onion dome with its tip flopped over, a round door, a porthole. */
const droopy = (g: Ctx, x: number, w: number, h: number, body: readonly string[], dome: readonly string[], flop: number) => {
  // (the body: bulging in the middle)
  g.beginPath(); g.moveTo(x - w / 2 + 2, 0); g.quadraticCurveTo(x - w / 2 - 3, -h / 2, x - w / 2 + 1, -h); g.lineTo(x + w / 2 - 1, -h); g.quadraticCurveTo(x + w / 2 + 3, -h / 2, x + w / 2 - 2, 0); g.closePath();
  g.fillStyle = body[2]; g.fill(); g.save(); g.clip();
  R(g, x - w / 2 - 3, -h, w * 0.3, h, body[1]); dith(g, x - w / 2 - 3 + w * 0.3, -h, 2, h, body[1]); R(g, x + w / 2 - w * 0.2, -h, w * 0.3, h, body[3]); dith(g, x + w / 2 - w * 0.2 - 2, -h, 2, h, body[3], 1);
  for (let y = -h + 5; y < 0; y += 6) R(g, x - w / 2 - 3, y, w + 6, 1, body[1]);
  g.restore(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
  // (the dome: an onion, its tip drooping over to one side, a ball on the end)
  sBall(g, x, -h - w * 0.28, w * 0.56, w * 0.36, dome);
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x, -h - w * 0.6); g.quadraticCurveTo(x + flop * 2, -h - w * 0.6 - 10, x + flop * 8, -h - w * 0.6 - 3); g.stroke();
  g.strokeStyle = dome[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -h - w * 0.58); g.quadraticCurveTo(x + flop * 2, -h - w * 0.6 - 10, x + flop * 8, -h - w * 0.6 - 3); g.stroke();
  sBall(g, x + flop * 8, -h - w * 0.6 - 2, 2.5, 2.5, YELLOW);
  R(g, x - w / 2 - 2, -h - 1, w + 4, 2, INK); R(g, x - w / 2 - 1, -h - 1, w + 2, 1, dome[4]);
  // (a round door, a porthole)
  ell(g, x - 2, -5, 4, 6, PURPLE[0]); ell(g, x - 1.5, -5, 2.6, 4.6, PURPLE[1], false); R(g, x, -5, 1, 1, YELLOW[2]);
  ell(g, x + w * 0.2, -h + 8, 3, 3, CYAN[3]); R(g, x + w * 0.2, -h + 6, 1, 1, '#FFFFFF');
};
/** A soundstage: a long box under a barrel roof, its big number on the side. */
const stage = (g: Ctx, x: number, w: number, h: number, r: readonly string[], n: string) => {
  sBlock(g, x, -h, w, h, r);
  g.save(); g.beginPath(); g.rect(x - 2, -h - 12, w + 4, 12); g.clip(); sBall(g, x + w / 2, -h, w / 2 + 1, 9, WHITE); for (let xx = x + 4; xx < x + w; xx += 5) R(g, xx, -h - 10, 0.5, 10, WHITE[1]); g.restore();
  R(g, x - 1, -h - 1, w + 2, 2, INK); R(g, x, -h - 1, w, 1, r[4]);
  txt(g, n, x + w / 2 + 0.5, -h + 12, r[0], 8);
  R(g, x + w / 2 - 5, -9, 10, 9, r[0]); R(g, x + w / 2 - 4, -8, 8, 8, r[1]);
};

/** SILLYVILLE SQUARE: the drooping domes, the Truffula tufts, the WUMPLE-GO-ROUND (its striped mushroom top, the
 *  wumples on their poles), the candy-stripe path, the land's lollipop lamps. */
export const paintSilly = (g: Ctx) => {
  R(g, -98, -3, 196, 3, PINK[3]); for (let x = -98; x < 98; x += 8) R(g, x, -3, 4, 3, WHITE[3]); R(g, -98, -3, 196, 1, WHITE[4]);
  droopy(g, -78, 26, 26, YELLOW, PURPLE, 1); droopy(g, -48, 20, 36, CYAN, PINK, -1); droopy(g, 60, 24, 30, LIME, ORANGE, 1); droopy(g, 84, 18, 22, PINK, CYAN, -1);
  tuft(g, -94, 30, 3, PINK); tuft(g, -30, 22, -3, ORANGE); tuft(g, 38, 26, 3, CYAN); tuft(g, 96, 34, -2, YELLOW);
  for (const x of [-62, 46]) tree(g, x, 16, 'lolly', [PINK[2], PINK[4]]);
  // (the wumple-go-round: the platform, the pole, the mushroom top in stripes, four wumples going round)
  ell(g, 4, -4, 26, 4, PURPLE[1]); ell(g, 6, -5, 20, 2.2, PURPLE[3], false);
  sCol(g, 2, -34, 5, 30, WHITE);
  for (let k = 0; k < 4; k++) {
    const x = -14 + k * 12, y = -12 - (k % 2) * 5, c = [PINK, LIME, YELLOW, CYAN][k];
    R(g, x, -30, 1, 26, WHITE[2]);
    sBall(g, x + 0.5, y, 4.5, 3.5, c); sBall(g, x + 4, y - 3, 2.5, 2.5, c); R(g, x + 4, y - 4, 1, 1, INK); R(g, x + 6, y - 2, 2, 1, c[1]); R(g, x - 3, y + 3, 1, 3, c[1]); R(g, x + 2, y + 3, 1, 3, c[1]);
  }
  g.save(); g.beginPath(); g.rect(-30, -52, 70, 20); g.clip(); sBall(g, 4.5, -32, 30, 16, PINK);
  g.beginPath(); g.ellipse(4.5, -32, 30, 16, 0, 0, Math.PI * 2); g.clip(); for (let k = -3; k <= 3; k++) { g.fillStyle = k % 2 ? '#FFFFFFAA' : 'rgba(0,0,0,0)'; g.beginPath(); g.ellipse(4.5 + k * 9, -32, 4.5 - Math.abs(k) * 0.6, 16, 0, 0, Math.PI * 2); g.fill(); }
  g.restore();
  R(g, -27, -33, 63, 3, INK); for (let k = 0; k < 10; k++) ell(g, -24 + k * 6.3, -31, 3, 2.5, k % 2 ? YELLOW[2] : PURPLE[2], false);
  sBall(g, 4.5, -50, 3, 3, YELLOW);
  sign(g, 'SILLYVILLE', 4, -64, -50, PURPLE[1], YELLOW[3], 6, true);
};

/** THE CARTOON LAND WATER TOWER: the fat pink tank on four bandy lilac legs, the goofy face painted on it (googly
 *  eyes, a buck-toothed grin, blushed cheeks), CARTOON LAND round its belly in the purple band, the catwalk and its
 *  rail, the ladder up a leg, the propeller beanie for a roof. He rips it up for the finisher; it topples. */
export const paintCwTower = (g: Ctx) => {
  const cy = -63;
  // (the legs: bandy tubes, far pair dimmer, rivet collars; the X braces and their turnbuckles; the ladder)
  const legTo = (x0: number, x1: number, r: readonly string[], w: number) => {
    for (const [c, lw] of [[INK, w + 2], [r[1], w], [r[3], w * 0.45]] as [string, number][]) { g.strokeStyle = c; g.lineWidth = lw; g.lineCap = 'butt'; g.beginPath(); g.moveTo(x0, 0); g.quadraticCurveTo(x0 * 1.5 + (lw < w ? 0.6 : 0), -26, x1 + (lw < w ? 0.6 : 0), -48); g.stroke(); }
    R(g, x0 - w / 2 - 1, -2, w + 2, 2, INK); R(g, x0 - w / 2, -2, w, 1, r[4]);
  };
  const dim = LILAC.map((c, i) => (i ? LILAC[i - 1] : c));
  legTo(-7, -4, dim, 3); legTo(7, 4, dim, 3);
  line(g, -19, -14, 16, -34, PURPLE[1]); line(g, 19, -14, -16, -34, PURPLE[1]); R(g, -1, -25, 3, 2, YELLOW[2]);
  legTo(-19, -12, LILAC, 4); legTo(19, 12, LILAC, 4);
  for (let y = -44; y < -2; y += 4) { const k = (-y) / 48, lx = -19 * 1.5 * 2 * k * (1 - k) - 19 * (1 - k) * (1 - k) - 12 * k * k; R(g, lx + 3, y, 4, 0.5, WHITE[2]); }
  // (the catwalk: a ring under the tank, its rail)
  R(g, -24, -48, 48, 3, INK); R(g, -23, -47, 46, 1, LILAC[4]); for (let x = -23; x < 24; x += 4) R(g, x, -52, 0.5, 4, LILAC[3]); R(g, -23, -52, 46, 0.5, LILAC[4]);
  // (the tank: a fat ball, riveted plates; the band and its letters)
  sBall(g, 0, cy, 23, 19, PINK);
  g.save(); g.beginPath(); g.ellipse(0, cy, 23, 19, 0, 0, Math.PI * 2); g.clip();
  for (const k of [0.5, 0.86]) { g.strokeStyle = PINK[1]; g.lineWidth = 0.5; g.beginPath(); g.ellipse(0, cy, 23 * k, 19, 0, 0, Math.PI * 2); g.stroke(); }
  R(g, -23, cy + 8, 46, 8, INK); R(g, -23, cy + 9, 46, 6, PURPLE[2]); R(g, 8, cy + 9, 15, 6, PURPLE[3]); R(g, -23, cy + 9, 10, 6, PURPLE[1]); R(g, -23, cy + 8.5, 46, 0.5, YELLOW[2]); R(g, -23, cy + 15, 46, 0.5, YELLOW[1]);
  g.restore();
  txt(g, 'CARTOON LAND', 0.5, cy + 14, YELLOW[3], 3);
  // (the face: googly eyes not looking the same way, blushed cheeks, the buck-toothed grin)
  for (const [x, px, py] of [[-8, 1, 1], [8, -1.5, 0.5]] as const) { ell(g, x, cy - 8, 6, 6.5, '#FFFFFF'); ell(g, x + px, cy - 8 + py, 2.6, 3, INK, false); R(g, x + px - 1.5, cy - 9.5 + py, 1.5, 1.5, '#FFFFFF'); }
  dith(g, -19, cy - 2, 6, 4, RED[3]); dith(g, 13, cy - 2, 6, 4, RED[3], 1);
  g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.arc(0, cy - 4, 10, 0.35, Math.PI - 0.35); g.stroke();
  poly(g, [-6, cy + 3.5, 6, cy + 3.5, 4, cy + 7, -4, cy + 7], '#7A1A2E', false); R(g, -3.5, cy + 3.5, 3, 3.5, '#FFFFFF'); R(g, 0.5, cy + 3.5, 3, 3.5, '#FFFFFF'); R(g, -0.5, cy + 3.5, 1, 3.5, INK);
  // (the beanie: gores in four colors, its brim, the button, the propeller)
  g.save(); g.beginPath(); g.rect(-16, cy - 31, 32, 13.5); g.clip();
  sBall(g, 0, cy - 17, 13, 12, YELLOW);
  g.beginPath(); g.ellipse(0, cy - 17, 13, 12, 0, 0, Math.PI * 2); g.clip();
  for (const [x0, w, c] of [[-13, 6, RED[2]], [-7, 7, CYAN[2]], [0, 7, YELLOW[2]], [7, 6, LIME[2]]] as const) { R(g, x0, cy - 30, w, 14, c); R(g, x0, cy - 30, 0.5, 14, INK); }
  R(g, 3, cy - 28, 4, 3, '#FFFFFF88');
  g.restore();
  R(g, -15, cy - 19, 30, 3, INK); R(g, -14, cy - 18.5, 28, 1.5, WHITE[3]);
  R(g, -0.5, cy - 34, 1.5, 5, INK); sBall(g, 0.2, cy - 30, 2, 2, RED);
  poly(g, [0, cy - 34, -11, cy - 36.5, -11, cy - 33], CYAN[2]); poly(g, [0, cy - 34, 11, cy - 31.5, 11, cy - 35], CYAN[3]);
};

/** THE MAGIC OF CARTOONS (the studio tour, from outside): the lobby's wavy yellow front under a giant pencil, the
 *  paint-splat logo, two soundstages behind with their numbers, the tram stop, EST. 1994 on the gate's arch. */
export const paintStudio = (g: Ctx) => {
  R(g, -62, -2, 124, 2, WHITE[2]);
  stage(g, -60, 36, 30, rampOf('#D8C8A0', '#2A2010'), '1'); stage(g, 26, 34, 34, rampOf('#B8C8D8', '#101A2A'), '2');
  // (the lobby: yellow, a wavy parapet, a row of round windows, the door under a paint splat)
  sBlock(g, -26, -34, 54, 34, YELLOW);
  for (let k = 0; k < 6; k++) ell(g, -21.5 + k * 9, -34, 4.5, 3, YELLOW[k > 3 ? 3 : 2]);
  R(g, -26, -34, 54, 1, YELLOW[4]);
  for (let k = 0; k < 4; k++) { ell(g, -17 + k * 12, -22, 3.5, 3.5, CYAN[1]); ell(g, -16.5 + k * 12, -22.5, 2.3, 2.3, CYAN[3], false); R(g, -16 + k * 12, -24, 1, 1, '#FFFFFF'); }
  R(g, -6, -13, 14, 13, INK); R(g, -5, -12, 12, 12, BROWN[1]); R(g, 0.5, -12, 1, 12, INK); R(g, -5, -12, 12, 1, BROWN[3]);
  for (const [x, y, r, c] of [[-2, -17, 5, PINK[2]], [5, -16, 4, PINK[2]], [1, -19, 3, PINK[3]], [9, -13, 2, PINK[2]], [-7, -14, 2, PINK[2]]] as const) ell(g, x, y, r, r * 0.7, c, false);
  // (the giant pencil, propped across the roof: yellow, its ferrule and eraser, its point to the east)
  g.save(); g.translate(0, -40); g.rotate(-0.12);
  R(g, -31, -4, 52, 7, INK); R(g, -30, -3, 50, 5, ORANGE[2]); R(g, -30, -3, 50, 2, YELLOW[2]); R(g, -30, 1, 50, 1, ORANGE[1]);
  R(g, -30, -3, 5, 5, PINK[2]); R(g, -30, -3, 5, 1, PINK[4]); R(g, -25, -3, 4, 5, WHITE[1]); R(g, -25, -3, 4, 1, WHITE[4]);
  poly(g, [20, -4, 30, -0.5, 20, 3], '#E8C89A'); poly(g, [27, -1.5, 30, -0.5, 27, 0.5], INK, false);
  g.restore();
  // (the tram stop: a striped canopy, a bench; the name over it all on its frame)
  for (const x of [-60, -44]) R(g, x, -12, 1, 12, WHITE[1]);
  sign(g, 'THE MAGIC OF CARTOONS', 0, -59, -44, PINK[1], YELLOW[3], 5, true);
  txt(g, 'EST. 1994', -41.5, -3, BROWN[0], 3);
};

/** THE WACKY WHITE HOUSE: the portico's fat columns (none of them straight), the wings and their windows, the cartoon
 *  dome with its flag, SOCKS the cat huge on the roof, the lawn's sign. */
export const paintWhiteHouse = (g: Ctx) => {
  R(g, -82, -3, 164, 3, LIME[1]); R(g, -82, -3, 164, 1, LIME[3]);
  // (the wings: white, a balustrade, rows of round-topped windows)
  for (const x of [-78, 30]) {
    sBlock(g, x, -32, 48, 32, WHITE);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) { const wx = x + 5 + k * 9, wy = -27 + r * 13; R(g, wx - 1, wy - 1, 6, 9, INK); R(g, wx, wy, 4, 7, '#3A5A8A'); R(g, wx, wy, 4, 2, '#9ACBF4'); ell(g, wx + 2, wy, 2, 1.5, '#9ACBF4', false); }
    for (let k = 0; k < 12; k++) R(g, x + 1 + k * 4, -36, 2, 4, WHITE[k > 8 ? 4 : 2]); R(g, x - 1, -37, 50, 1, INK); R(g, x, -36.5, 48, 0.5, WHITE[4]);
  }
  // (the middle: the portico, its pediment, six fat wobbly columns)
  sBlock(g, -30, -44, 60, 44, WHITE);
  R(g, -8, -16, 16, 16, INK); R(g, -7, -15, 14, 15, '#1D4ED8'); R(g, -0.5, -15, 1, 15, INK); R(g, -7, -15, 14, 1, '#93C5FD');
  for (let k = 0; k < 6; k++) { const x = -27 + k * 10.4, b = k % 2 ? 1 : -1; for (let y = -40; y < 0; y += 2) { const xx = x + Math.sin((y + 40) * 0.16) * 1.2 * b; R(g, xx - 0.5, y, 5, 2, INK); } for (let y = -40; y < 0; y += 2) { const xx = x + Math.sin((y + 40) * 0.16) * 1.2 * b; R(g, xx, y, 4, 2, WHITE[2]); R(g, xx + 2.5, y, 1.5, 2, WHITE[4]); R(g, xx, y, 1, 2, WHITE[1]); } R(g, x - 1.5, -41, 7, 2, WHITE[3]); R(g, x - 1.5, -2, 7, 2, WHITE[1]); }
  poly(g, [-34, -44, 0, -58, 34, -44], WHITE[2]); poly(g, [0, -44, 0, -58, 34, -44], WHITE[3], false); ell(g, 0, -49, 4, 3, YELLOW[2]); R(g, -34, -45, 68, 2, INK); R(g, -33, -45, 66, 1, WHITE[4]);
  // (the dome: a fat cartoon one, off centre, a flag on it)
  g.save(); g.beginPath(); g.rect(-20, -76, 40, 18.5); g.clip(); sBall(g, -2, -57, 13, 13, WHITE); g.restore();
  R(g, -3, -72, 2, 4, WHITE[2]); R(g, -2.5, -80, 1, 9, '#6B7280'); for (let s = 0; s < 4; s++) R(g, -1.5, -80 + s * 1.5, 9, 1.5, s % 2 ? '#FFFFFF' : RED[2]); R(g, -1.5, -80, 4, 3, '#1D4ED8');
  // (SOCKS, on the east wing's roof: a big gray and white cat's head, ears, whiskers, a smug look)
  sBall(g, 54, -48, 11, 10, ['#3A3A44', '#6A6A78', '#9A9AA8', '#C0C0CC', '#E4E4EC']);
  poly(g, [45, -54, 46, -63, 51, -57], '#6A6A78'); poly(g, [57, -57, 62, -63, 63, -54], '#9A9AA8'); poly(g, [46.5, -56, 47, -60, 49.5, -57], PINK[3], false); poly(g, [58.5, -57, 61, -60, 61.5, -56], PINK[3], false);
  ell(g, 54, -44, 6, 5, '#F4F4F8', false); R(g, 49, -51, 3, 2, LIME[2]); R(g, 56, -51, 3, 2, LIME[2]); R(g, 50, -51, 1, 2, INK); R(g, 57, -51, 1, 2, INK);
  poly(g, [53, -47, 55, -47, 54, -45.5], PINK[2], false); line(g, 54, -45.5, 52, -43.5, INK); line(g, 54, -45.5, 56, -43.5, INK);
  for (const s of [-1, 1]) { line(g, 54 + s * 4, -45, 54 + s * 13, -47, '#FFFFFF'); line(g, 54 + s * 4, -44, 54 + s * 13, -43, '#FFFFFF'); }
  R(g, 43, -39, 22, 3, INK); R(g, 44, -38.5, 20, 1.5, RED[2]); txt(g, 'SOCKS', 54.5, -32, INK, 3);
  sign(g, 'THE WACKY WHITE HOUSE', -40, -14, -1, '#1D4ED8', '#F8FAFC', 4, true);
};

/** THE BIG-KID ZONE (1994, extreme): the halfpipe, the HURL-A-WHIRL's arms and gondolas, the show building with the
 *  giant soda cup and its bendy straw on the roof, the neon bolt, the inflatable Rad Rat. */
export const paintBigKid = (g: Ctx) => {
  R(g, -70, -2, 140, 2, '#3A3A44'); for (let x = -68; x < 70; x += 10) R(g, x, -2, 5, 1, YELLOW[2]);
  // (the halfpipe: plywood, cyan coping, a scaffold under each end, a skater's board in the air)
  g.save(); g.beginPath(); g.moveTo(-68, 0); g.lineTo(-68, -30); g.lineTo(-62, -30); g.quadraticCurveTo(-58, -4, -44, -3); g.quadraticCurveTo(-30, -4, -26, -30); g.lineTo(-20, -30); g.lineTo(-20, 0); g.closePath(); g.fillStyle = BROWN[2]; g.fill(); g.clip();
  R(g, -68, -30, 14, 30, BROWN[1]); R(g, -30, -30, 12, 30, BROWN[3]); for (let y = -26; y < 0; y += 5) R(g, -68, y, 48, 0.5, BROWN[1]);
  g.restore(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
  R(g, -69, -32, 8, 3, INK); R(g, -68, -31.5, 6, 1.5, CYAN[2]); R(g, -27, -32, 8, 3, INK); R(g, -26, -31.5, 6, 1.5, CYAN[3]);
  g.save(); g.translate(-28, -42); g.rotate(-0.6); R(g, -5, -1, 10, 2, INK); R(g, -4, -1, 8, 1, LIME[2]); R(g, -3, 1, 1, 1, RED[2]); R(g, 2, 1, 1, 1, RED[2]); g.restore();
  R(g, -30, -50, 3, 6, '#E8B48A'); R(g, -31, -46, 5, 4, PURPLE[2]);
  // (the show building: purple, a jagged teal stripe, the soda cup and straw on its roof, EXTREME! down its side)
  sBlock(g, -12, -30, 34, 30, PURPLE);
  for (let k = 0; k < 8; k++) poly(g, [-12 + k * 4.25, -14, -9.9 + k * 4.25, -19, -7.75 + k * 4.25, -14], CYAN[2], false);
  R(g, -12, -14, 34, 2, CYAN[2]); R(g, 0, -10, 10, 10, INK); R(g, 1, -9, 8, 9, YELLOW[2]);
  poly(g, [-4, -30, 8, -30, 10, -48, -6, -48], RED[2]); poly(g, [3, -30, 8, -30, 10, -48, 4, -48], RED[3], false); R(g, -7, -50, 18, 3, INK); R(g, -6, -49.5, 16, 1.5, WHITE[4]);
  for (let y = -44; y < -32; y += 4) R(g, -5, y, 14, 1.5, '#FFFFFF');
  line(g, 4, -50, 6, -60, INK, 3); line(g, 6, -60, 12, -62, INK, 3); line(g, 4, -50, 6, -60, LIME[2], 1.5); line(g, 6, -60, 12, -62, LIME[2], 1.5);
  poly(g, [18, -28, 21, -34, 19.5, -34, 22, -40, 16, -32, 18, -32, 15.5, -28], YELLOW[2]);
  // (the hurl-a-whirl: a mast, a tilted hub, six arms, a gondola on each)
  sCol(g, 44, -42, 5, 42, LIME);
  g.save(); g.translate(46.5, -42); g.rotate(-0.18);
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.3, x = Math.cos(a) * 22, y = Math.sin(a) * 7; line(g, 0, 0, x, y, INK, 2.5); line(g, 0, 0, x, y, PINK[2], 1); }
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.3, x = Math.cos(a) * 22, y = Math.sin(a) * 7; sBall(g, x, y + 2, 4, 3, [YELLOW, CYAN, ORANGE][k % 3]); R(g, x - 1, y - 2, 2, 2, '#E8B48A'); }
  sBall(g, 0, 0, 4, 3, PINK);
  g.restore();
  // (the inflatable Rad Rat: gray, shades, a backwards cap, thumbs up; tied down)
  sBall(g, 62, -12, 7, 10, ['#3A3A44', '#6A6A78', '#9A9AA8', '#C0C0CC', '#E4E4EC']); sBall(g, 62, -25, 5, 5, ['#3A3A44', '#6A6A78', '#9A9AA8', '#C0C0CC', '#E4E4EC']);
  ell(g, 57, -29, 2.5, 2.5, PINK[3]); ell(g, 67, -29, 2.5, 2.5, PINK[3]); R(g, 58, -27, 9, 2, INK); R(g, 58, -31, 8, 2, RED[2]); R(g, 55, -30, 4, 1, RED[2]);
  R(g, 68, -18, 2, 5, '#9A9AA8'); R(g, 68, -21, 2, 3, '#C0C0CC'); line(g, 56, -8, 52, 0, WHITE[1]); line(g, 68, -8, 70, 0, WHITE[1]);
  sign(g, 'THE BIG-KID ZONE', -22, -66, -52, '#18181B', LIME[2], 5, true);
};

/** PUNCHY & KICKY: the bone arch over the way in, the KILL-O-RAMA pylon, the big top in its stripes (spattered), a
 *  giant boxing glove on a spring and a giant boot over the doors. */
export const paintPunchy = (g: Ctx) => {
  const BONE = ['#6A6458', '#A8A294', '#D8D2C4', '#F0ECE0', '#FFFFFF'];
  R(g, -62, -2, 124, 2, YELLOW[1]);
  // (the big top: red and yellow stripes, scallops, its two masts and flags, blood up it)
  g.save(); g.beginPath(); g.moveTo(-40, -22); g.quadraticCurveTo(-30, -50, -16, -58); g.lineTo(16, -58); g.quadraticCurveTo(30, -50, 40, -22); g.closePath(); g.fillStyle = YELLOW[2]; g.fill(); g.clip();
  for (let k = -5; k <= 5; k++) if (k % 2) { g.fillStyle = RED[2]; g.beginPath(); g.moveTo(k * 3, -58); g.lineTo(k * 3 + 3, -58); g.lineTo(k * 8 + 8, -22); g.lineTo(k * 8, -22); g.closePath(); g.fill(); }
  R(g, 14, -60, 30, 40, '#FFFFFF33'); dith(g, -40, -60, 16, 40, '#00000055');
  for (const [x, y, r] of [[-10, -40, 5], [-6, -34, 3], [12, -46, 4], [20, -30, 3]] as const) { ell(g, x, y, r, r * 0.7, '#7F1D1D', false); R(g, x - 0.5, y, 1, r + 3, '#7F1D1D'); }
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(-40, -22); g.quadraticCurveTo(-30, -50, -16, -58); g.lineTo(16, -58); g.quadraticCurveTo(30, -50, 40, -22); g.stroke();
  sBlock(g, -40, -22, 80, 22, YELLOW); for (let k = 0; k < 10; k++) { R(g, -40 + k * 8, -22, 4, 22, RED[2]); ell(g, -36 + k * 8, -22, 4, 2.5, k % 2 ? RED[2] : YELLOW[3], false); }
  R(g, -40, -23, 80, 1, INK);
  for (const x of [-16, 16]) { R(g, x - 0.5, -70, 1, 12, INK); poly(g, [x + 0.5, -70, x + 7, -68, x + 0.5, -66], x < 0 ? CYAN[2] : PINK[2], false); }
  // (the doors: black, the giant boot kicking out over them)
  R(g, -9, -18, 18, 18, INK); R(g, -8, -17, 16, 17, '#111827'); R(g, -0.5, -17, 1, 17, '#374151');
  poly(g, [-4, -30, 4, -30, 5, -22, 14, -22, 16, -19, 16, -17, -4, -17], BROWN[2]); poly(g, [5, -22, 14, -22, 16, -19, 5, -19], BROWN[3], false); R(g, -4, -17, 20, 1.5, INK); R(g, -4, -31, 8, 2, WHITE[3]);
  // (the bone arch at the west end: two femurs and a skull)
  for (const x of [-58, -44]) { sCol(g, x - 1.5, -34, 4, 34, BONE); sBall(g, x - 1.5, -35, 2.5, 2.5, BONE); sBall(g, x + 2.5, -35, 2.5, 2.5, BONE); }
  g.save(); g.translate(-51, -38); R(g, -10, -2, 20, 4, INK); R(g, -9, -1.5, 18, 2.5, BONE[2]); R(g, -9, -1.5, 18, 1, BONE[4]); g.restore();
  sBall(g, -51, -44, 5, 5, BONE); R(g, -53.5, -45, 2, 2, INK); R(g, -50, -45, 2, 2, INK); R(g, -52.5, -41, 3, 1, INK); R(g, -52, -40, 1, 1.5, BONE[3]); R(g, -50.5, -40, 1, 1.5, BONE[3]);
  // (the glove on its spring, punching out of a box at the east end)
  sBlock(g, 44, -12, 14, 12, PURPLE); for (let k = 0; k < 5; k++) { R(g, 48 + (k % 2) * 2, -14 - k * 3, 6, 1.5, WHITE[k % 2 ? 1 : 3]); }
  sBall(g, 52, -34, 7, 6.5, RED); sBall(g, 46, -32, 3, 3, RED); R(g, 48, -28, 8, 3, WHITE[3]); R(g, 48, -28, 8, 1, WHITE[4]);
  // (the KILL-O-RAMA pylon behind the top; the show's name on its frame)
  R(g, 28, -78, 12, 22, INK); R(g, 29, -77, 10, 20, '#18181B'); for (let k = 0; k < 4; k++) txt(g, 'KILL'[k], 34.5, -71 + k * 5, RED[3], 4);
  R(g, 33, -56, 2, 10, '#4B5563');
  sign(g, 'PUNCHY & KICKY', -14, -84, -58, RED[1], YELLOW[3], 5, true);
};

/** THE UBX AMPHITHEATER (DAD GUY LIVE!): the band shell's ribbed arches, the stage dressed as his living room (the
 *  couch, the TV, the lamp), the light towers either side, the benches down the front, the show's board over it. */
export const paintAmphi = (g: Ctx) => {
  const SHELL = ['#5A5A6E', '#9A9AB0', '#D8D8E4', '#F0F0F6', '#FFFFFF'];
  // (the shell: nested arches, each a step darker going in, ribs)
  for (let k = 0; k < 5; k++) {
    const rx = 78 - k * 11, ry = 66 - k * 10;
    g.beginPath(); g.moveTo(-rx, -6); g.ellipse(0, -6, rx, ry, 0, Math.PI, 0); g.closePath(); g.fillStyle = k === 4 ? '#2A2038' : SHELL[Math.max(0, 3 - k)]; g.fill();
    g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    if (k < 4) { g.save(); g.beginPath(); g.ellipse(0, -6, rx, ry, 0, Math.PI, 0); g.clip(); R(g, rx * 0.35, -80, rx, 80, '#FFFFFF44'); dith(g, -rx, -80, rx * 0.4, 80, '#00000033'); g.restore(); }
  }
  for (let k = -4; k <= 4; k++) line(g, k * 7, -32, k * 19, -6 - Math.sqrt(Math.max(0, 1 - (k * 19 / 78) ** 2)) * 66, '#9A9AB0');
  // (the stage: wood, a rug; his living room on it: the couch, the TV on its stand, the standing lamp, a beer)
  R(g, -52, -14, 104, 9, INK); R(g, -51, -13, 102, 7, BROWN[2]); R(g, -51, -13, 102, 1, BROWN[4]); R(g, -51, -8, 102, 2, BROWN[1]);
  R(g, -24, -14, 44, 2, RED[1]);
  R(g, -24, -26, 30, 12, INK); R(g, -23, -25, 28, 5, '#3F7A3A'); R(g, -23, -20, 28, 6, '#2E5A2A'); R(g, -23, -25, 28, 1, '#7ABE6A'); R(g, -25, -22, 4, 8, '#3F7A3A'); R(g, 3, -22, 4, 8, '#4E9A48');
  R(g, 14, -18, 12, 4, BROWN[1]); R(g, 13, -28, 14, 10, INK); R(g, 14, -27, 12, 8, '#9ADCF4'); R(g, 14, -27, 12, 2, '#E0F6FF'); line(g, 17, -28, 14, -33, INK); line(g, 22, -28, 25, -33, INK);
  R(g, -32, -30, 1, 16, '#4B5563'); poly(g, [-36, -30, -28, -30, -30, -36, -34, -36], YELLOW[3]); R(g, 8, -17, 2, 3, YELLOW[1]);
  // (the light towers: lattice, a bank of cans on each)
  for (const s of [-1, 1]) { const x = s * 84; R(g, x - 2, -70, 1, 70, '#4B5563'); R(g, x + 2, -70, 1, 70, '#6B7280'); for (let y = -66; y < 0; y += 6) line(g, x - 2, y, x + 3, y + 6, '#4B5563'); R(g, x - 6, -78, 13, 9, INK); for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) R(g, x - 5 + k * 4, -77 + r * 4, 3, 3, (k + r) % 2 ? '#FDE68A' : '#FFFFFF'); }
  // (the benches down the front, a few heads still in them)
  for (let r = 0; r < 2; r++) { R(g, -70 + r * 6, -5 + r * 2.5, 140 - r * 12, 2, r ? '#6B7280' : '#9CA3AF'); for (let k = 0; k < 14; k++) if ((k * 7 + r) % 3) R(g, -64 + r * 6 + k * 9.4, -8 + r * 2.5, 2, 3, ['#F87171', '#FDE047', '#60A5FA', '#E8B48A'][(k + r) % 4]); }
  // (the board over the shell, on its frame)
  sign(g, 'DAD GUY LIVE!', 0, -88, -70, RED[2], YELLOW[2], 6, true);
};
