import { type Ctx, INK, R, poly, ell, line, sign } from './kit';
import { rampOf, dith, sBlock, sCol, sBall, tube } from './shade';

// ---------------------------------------------------------------------------------------------------------------
// FUTURE LAND (the second pass), and SPACE NEEDLE 2 (the throw: it reaches space, so it's tall). 1962's tomorrow:
// white enamel and chrome, teal and orange, lilac fiberglass; lit from the east (the right).

const CHROME = ['#2A3248', '#55627E', '#8E9CB6', '#C6D0E0', '#F4F7FC'];
const WHITE = ['#6A7690', '#A2ACC2', '#D6DCE8', '#F0F3F8', '#FFFFFF'];
const TEAL = ['#083B47', '#0F5A68', '#1A808C', '#34A6AC', '#7FD6D4'];
const ORANGE = ['#7A2A0E', '#B8451A', '#F07A2E', '#FBA45E', '#FDD3A0'];
const LILAC = ['#4A2A78', '#7450A8', '#A688D4', '#CDB6EE', '#F3EAFF'];
const GLASS = ['#16233C', '#24406A', '#3A6A9C', '#7FB6DC', '#D8F0FF'];
const PINK = rampOf('#E8659E');

/** A Googie pavilion: a glass front between white piers under a folded-plate roof (teal or orange), its foot at 0. */
const pavilion = (g: Ctx, x: number, w: number, h: number, roof: readonly string[]) => {
  sBlock(g, x, -h, w, h, WHITE);
  R(g, x + 3, -h + 4, w - 6, h - 4, GLASS[1]); R(g, x + 3, -h + 4, w - 6, 3, GLASS[2]); dith(g, x + 3, -h + 7, w - 6, 2, GLASS[2]);
  for (let k = 1; k < 4; k++) R(g, x + 3 + Math.round(((w - 6) * k) / 4), -h + 4, 1, h - 4, WHITE[1]);
  // (a glint across the glass, the door)
  line(g, x + w - 12, -h + 5, x + w - 18, -2, GLASS[4]); R(g, x + w / 2 - 3, -9, 6, 9, GLASS[0]); R(g, x + w / 2, -9, 1, 9, WHITE[2]);
  // (the roof: folded plates, up at the right like a boomerang)
  const n = 4, pw = (w + 12) / n;
  for (let k = 0; k < n; k++) {
    const x0 = x - 6 + k * pw, y0 = -h - 2 - k * 2;
    poly(g, [x0, y0 + 3, x0 + pw / 2, y0 - 4, x0 + pw, y0 + 1, x0 + pw, y0 + 4, x0 + pw / 2, y0, x0, y0 + 6], roof[2]);
    poly(g, [x0 + pw / 2, y0 - 4, x0 + pw, y0 + 1, x0 + pw, y0 + 4, x0 + pw / 2, y0], roof[3], false);
    line(g, x0 + pw / 2, y0 - 3.5, x0 + pw, y0 + 1.5, roof[4]);
  }
};
/** An atomic palm (a lollipop topiary of tomorrow): a chrome stalk, teal balls on spokes. */
const atomPalm = (g: Ctx, x: number, h: number) => {
  R(g, x, -h, 1, h, CHROME[2]);
  for (const [dx, dy] of [[-5, 2], [5, 1], [0, -4], [-3, -2], [4, -3]] as const) { line(g, x + 0.5, -h, x + dx, -h + dy, CHROME[1]); sBall(g, x + dx, -h + dy, 2.2, 2.2, TEAL); }
};
/** A starburst on a pole (the square's sputnik sign). */
const starburst = (g: Ctx, x: number, y: number, r: number) => {
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.2, rr = k % 2 ? r * 0.6 : r; line(g, x, y, x + Math.cos(a) * rr, y + Math.sin(a) * rr, k % 2 ? ORANGE[3] : '#FDE68A'); R(g, x + Math.cos(a) * rr - 0.5, y + Math.sin(a) * rr - 0.5, 1, 1, '#FFFFFF'); }
  sBall(g, x, y, 2, 2, ORANGE);
};

/** THE PEOPLE MOVER through Tomorrow Square: three Googie pavilions under folded roofs, the mover's white beam on its
 *  pylons across them with its train of little orange cars, the starburst on its pole, atomic palms. */
export const paintFutureSquare = (g: Ctx) => {
  // (the square's paving: pale terrazzo, a teal inlay)
  R(g, -100, -3, 200, 3, WHITE[1]); R(g, -100, -3, 200, 1, WHITE[3]); for (let x = -96; x < 100; x += 16) R(g, x, -2, 8, 1, TEAL[3]);
  pavilion(g, -92, 40, 22, TEAL); pavilion(g, -40, 38, 27, ORANGE); pavilion(g, 46, 44, 23, TEAL);
  for (const x of [-48, 4, 20, 96]) atomPalm(g, x, 16);
  R(g, 31, -52, 1, 52, CHROME[1]); starburst(g, 31.5, -54, 7);
  // (the mover: pylons (a Y each), the beam, the cars on it)
  for (const x of [-84, -30, 22, 76]) { sCol(g, x - 2, -34, 4, 34, WHITE); poly(g, [x - 6, -40, x + 6, -40, x + 2, -34, x - 2, -34], WHITE[2]); R(g, x + 2, -39, 3, 1, WHITE[4]); }
  R(g, -101, -44, 202, 5, INK); R(g, -100, -43, 200, 3, WHITE[2]); R(g, -100, -43, 200, 1, WHITE[4]); dith(g, -100, -41, 200, 1, WHITE[1]);
  for (let k = 0; k < 5; k++) {
    const x = -58 + k * 14;
    R(g, x - 1, -52, 13, 9, INK); R(g, x, -51, 11, 7, ORANGE[2]); R(g, x, -51, 11, 2, ORANGE[4]); R(g, x, -46, 11, 2, ORANGE[1]);
    R(g, x + 2, -50, 3, 3, GLASS[3]); R(g, x + 6, -50, 3, 3, GLASS[3]); R(g, x + 8, -50, 1, 1, '#FFFFFF');
    // (a rider's head in each)
    R(g, x + 3, -53, 2, 2, ['#F2C9A0', '#8A5A3A', '#E8B48A', '#C68A5E', '#F2C9A0'][k]);
  }
  // (its sign, on the beam, between two posts off it)
  sign(g, 'PEOPLE MOVER', 44, -60, -44, TEAL[1], '#F4FFFE', 5, true);
};

/** THE GIANT ATOM: a ball of lilac fiberglass on its chrome stalk and fins, a band of portholes round it, three
 *  chrome orbits round it with bulbs along them and a rocket car on each; its name on a marquee at its foot. */
export const paintAtom = (g: Ctx) => {
  const cy = -58, r = 17;
  // (the pad: a chrome disc; the stalk and its fins; the collar under the ball)
  ell(g, 0, -2, 20, 3, CHROME[1]); ell(g, 2, -3, 14, 1.5, CHROME[3], false);
  for (const s of [-1, 1]) { poly(g, [s * 4, -34, s * 18, -4, s * 18, -1, s * 4, -8], s < 0 ? CHROME[1] : CHROME[3]); R(g, s * 18 - (s > 0 ? 1 : 0), -5, 1, 4, PINK[2]); }
  sCol(g, -4, cy + r - 2, 8, -cy - r, CHROME);
  for (let y = cy + r + 8; y < -6; y += 9) R(g, -4, y, 8, 1, CHROME[0]);
  R(g, -7, cy + r - 2, 14, 3, INK); R(g, -6, cy + r - 1, 12, 1, CHROME[3]);
  // (the orbits' far halves, dimmer)
  const dim = CHROME.map((c, i) => (i > 2 ? CHROME[i - 1] : c));
  const rots = [0, 1.05, -1.05];
  for (const a of rots) tube(g, 0, cy, 42, 10, a, Math.PI, Math.PI * 2, 2.5, dim);
  // (the ball: stepped shells, its panels' seams, the chrome band of portholes)
  sBall(g, 0, cy, r, r, LILAC);
  g.save(); g.beginPath(); g.arc(0, cy, r, 0, Math.PI * 2); g.clip();
  g.strokeStyle = LILAC[1]; g.lineWidth = 0.5;
  for (const k of [0.45, 0.82]) { g.beginPath(); g.ellipse(0, cy, r * k, r, 0, 0, Math.PI * 2); g.stroke(); }
  for (const dy of [-0.56, 0.56]) R(g, -r, cy + dy * r, r * 2, 0.5, LILAC[1]);
  R(g, -r, cy - 2.5, r * 2, 5, INK); R(g, -r, cy - 2, r * 2, 4, CHROME[2]); R(g, -r, cy - 2, r * 2, 1, CHROME[4]); R(g, -r, cy + 1, r * 2, 1, CHROME[1]);
  for (let k = -4; k <= 4; k++) R(g, k * 3.6 - 1, cy - 1, 2, 2, GLASS[k > 1 ? 3 : 1]);
  g.restore();
  // (the near halves, bulbs along them, a rocket car on each)
  rots.forEach((a, i) => {
    tube(g, 0, cy, 42, 10, a, 0, Math.PI, 3, CHROME);
    g.save(); g.translate(0, cy); g.rotate(a);
    for (let k = 1; k < 9; k++) { const u = (k / 9) * Math.PI; R(g, Math.cos(u) * 42 - 0.5, Math.sin(u) * 10 - 1, 1, 1, k % 3 ? '#F0ABFC' : '#FFFFFF'); }
    const u = [0.6, 2.3, 1.2][i], cx = Math.cos(u) * 42, cyy = Math.sin(u) * 10 - 2.5;
    ell(g, cx, cyy, 5, 2.6, [PINK[2], TEAL[2], ORANGE[2]][i]); R(g, cx - 3, cyy - 2, 5, 1, '#FFFFFF99'); ell(g, cx + 1, cyy - 2, 2, 1.4, GLASS[4], false);
    poly(g, [cx - 5, cyy, cx - 8, cyy - 2, cx - 8, cyy + 2], '#FDE68A', false);
    g.restore();
  });
  // (the marquee at its foot: dark violet, the name in pink neon, on its two posts)
  sign(g, 'THE GIANT ATOM', 0, -20, -1, '#2A0650', '#F5D0FE', 5, true);
  R(g, -38, -21, 76, 1, '#7A3AAE');
};

/** VOYAGE TO 2010 (the dark ride's show building, from outside): a white ribbed dome on a drum, the orange boomerang
 *  over its doors, the show rocket on its gantry beside it, the name up on the dome's frame. */
export const paintVoyage = (g: Ctx) => {
  R(g, -60, -3, 120, 3, WHITE[1]); R(g, -60, -3, 120, 1, WHITE[3]);
  // (the rocket on its gantry, left: it never gets far)
  for (let y = -44; y < 0; y += 6) { line(g, -56, y, -50, y + 6, CHROME[1]); line(g, -50, y, -56, y + 6, CHROME[1]); }
  R(g, -57, -46, 1, 46, CHROME[2]); R(g, -50, -46, 1, 46, CHROME[2]);
  sCol(g, -48, -40, 7, 34, WHITE); poly(g, [-49, -40, -44.5, -52, -40, -40], PINK[2]); poly(g, [-44.5, -40, -44.5, -52, -40, -40], PINK[3], false);
  poly(g, [-51, -6, -48, -16, -48, -6], PINK[1]); poly(g, [-38, -6, -41, -16, -41, -6], PINK[3]); R(g, -47, -30, 5, 2, TEAL[2]); R(g, -46, -24, 3, 3, GLASS[3]);
  // (the drum: white panels between teal fins; the doors; the dome over it, ribbed)
  sBlock(g, -34, -18, 92, 18, WHITE);
  for (let x = -30; x < 56; x += 11) { R(g, x, -17, 2, 17, TEAL[2]); R(g, x + 1, -17, 1, 17, TEAL[3]); }
  g.save(); g.beginPath(); g.rect(-40, -60, 104, 42); g.clip();
  sBall(g, 12, -18, 46, 26, WHITE);
  g.beginPath(); g.ellipse(12, -18, 46, 26, 0, 0, Math.PI * 2); g.clip();
  g.strokeStyle = WHITE[1]; g.lineWidth = 0.5; for (const k of [0.3, 0.62, 0.86]) { g.beginPath(); g.ellipse(12, -18, 46 * k, 26, 0, 0, Math.PI * 2); g.stroke(); }
  R(g, -34, -30, 92, 0.5, WHITE[1]);
  g.restore();
  R(g, -35, -19, 94, 2, INK); R(g, -34, -19, 92, 1, CHROME[3]);
  R(g, 4, -12, 16, 12, GLASS[0]); R(g, 11, -12, 1, 12, CHROME[2]); R(g, 4, -12, 16, 1, GLASS[2]);
  poly(g, [-4, -15, 16, -24, 30, -14, 28, -12, 16, -19, -2, -12], ORANGE[2]); line(g, 16, -23.5, 29, -14, ORANGE[4]);
  // (the name, on a frame up on the dome)
  sign(g, 'VOYAGE TO 2010', 12, -62, -42, ORANGE[1], '#FFF6E0', 5, true);
};

/** THE LAGOON MONORAIL: the beam on its T pylons over the lagoon, the train on it (white, a red stripe, a band of
 *  tinted glass, its bullet nose to the east), the station's canopy and steps at one end. */
export const paintMonorail = (g: Ctx) => {
  // (the lagoon: banded teal, glints, the pylons' reflections)
  R(g, -120, -5, 240, 5, TEAL[1]); R(g, -120, -5, 240, 1, TEAL[4]); dith(g, -120, -4, 240, 1, TEAL[3]); R(g, -120, -2, 240, 2, TEAL[0]);
  for (let x = -112; x < 120; x += 19) R(g, x, -3, 6, 1, TEAL[3]);
  // (the station: a slab canopy on two piers, steps up, MONORAIL in its fascia)
  sBlock(g, -118, -22, 34, 22, WHITE);
  for (let k = 0; k < 5; k++) R(g, -84 + k * 3, -4 - k * 4, 3, 4 + k * 4, WHITE[k % 2 ? 2 : 1]);
  R(g, -112, -16, 22, 12, GLASS[1]); R(g, -112, -16, 22, 2, GLASS[3]); R(g, -101, -16, 1, 12, WHITE[1]);
  poly(g, [-122, -36, -66, -42, -66, -39, -122, -32], TEAL[2]); line(g, -122, -36, -66, -42, TEAL[4]);
  for (const x of [-116, -72]) R(g, x, -34, 2, 12, CHROME[2]);
  // (the pylons and the beam)
  for (let x = -40; x < 120; x += 46) { sCol(g, x - 2, -24, 5, 21, WHITE); R(g, x - 7, -26, 15, 3, INK); R(g, x - 6, -25, 13, 2, WHITE[2]); R(g, x - 6, -25, 13, 1, WHITE[4]); }
  R(g, -121, -30, 242, 5, INK); R(g, -120, -29, 240, 3, WHITE[2]); R(g, -120, -29, 240, 1, WHITE[4]); dith(g, -120, -27, 240, 1, WHITE[1]);
  // (the train: three cars, the bullet nose)
  for (let k = 0; k < 3; k++) {
    const x = -30 + k * 40;
    R(g, x - 1, -42, 39, 13, INK); R(g, x, -41, 37, 11, WHITE[2]); R(g, x, -41, 37, 2, WHITE[4]); R(g, x, -32, 37, 2, WHITE[1]);
    R(g, x, -35, 37, 2, '#DC2626'); R(g, x, -35, 37, 1, '#F87171');
    R(g, x + 3, -39, 31, 3, GLASS[1]); for (let w = 0; w < 5; w++) R(g, x + 4 + w * 6, -39, 4, 3, GLASS[w > 2 ? 3 : 2]);
    R(g, x + 30, -39, 1, 1, '#FFFFFF');
  }
  poly(g, [87, -42, 100, -38, 104, -33, 104, -30, 87, -30], WHITE[3]); poly(g, [88, -40, 98, -37, 100, -35, 88, -35], GLASS[3], false); R(g, 87, -35, 16, 1, '#DC2626'); R(g, 102, -33, 2, 1, '#FDE68A');
  // (the name, on its posts on the far bank)
  sign(g, 'LAGOON MONORAIL', -78, -58, -40, '#B91C1C', '#FFF6F6', 5, true);
};

/** XENOSCARE, from outside: the black show box with its starfield painted on, the chrome parapet, the bone-white
 *  fiberglass derelict jutting out of its roof, its portholes, the fog out of the door, the green neon name. */
export const paintXenoscare = (g: Ctx) => {
  const BOX = ['#07050E', '#120C22', '#1D1436', '#2C2050', '#4A3A78'], BONE = ['#5E5848', '#8E8670', '#C4BCA2', '#E6E0CC', '#FBF8EC'];
  // (the derelict's hull behind the box: ribs, up and over to the east)
  g.save(); g.beginPath(); g.rect(-52, -56, 104, 22); g.clip();
  sBall(g, 14, -30, 36, 22, BONE);
  g.beginPath(); g.ellipse(14, -30, 36, 22, 0, 0, Math.PI * 2); g.clip();
  for (let x = -18; x < 52; x += 7) R(g, x, -54, 1, 24, BONE[1]);
  for (const [x, y] of [[0, -42], [12, -46], [24, -45], [36, -40]] as const) { R(g, x - 2, y - 2, 4, 4, INK); R(g, x - 1, y - 1, 2, 2, '#7CFC9A'); }
  g.restore();
  // (the box: banded black to violet, the stars painted on it)
  R(g, -51, -35, 102, 35, INK);
  for (let k = 0; k < 4; k++) { R(g, -50, -34 + k * 8.5, 100, 9, BOX[3 - k]); if (k) dith(g, -50, -34 + k * 8.5 - 1, 100, 2, BOX[3 - k], k); }
  R(g, 38, -34, 12, 34, BOX[3]); dith(g, 36, -34, 2, 34, BOX[3]);
  for (let k = 0; k < 44; k++) { const x = -48 + ((k * 37) % 96), y = -32 + ((k * 53) % 30); R(g, x, y, 1, 1, k % 7 === 0 ? '#FFFFFF' : k % 3 ? '#8A7AB8' : '#C8C0E8'); }
  // (the parapet: chrome, a lit top; the door, its fog)
  R(g, -52, -38, 104, 4, INK); R(g, -51, -37, 102, 2, CHROME[2]); R(g, -51, -37, 102, 1, CHROME[4]);
  R(g, -9, -22, 18, 22, INK); R(g, -8, -21, 16, 21, '#020104'); R(g, -8, -21, 16, 1, '#3AD86A');
  for (const [x, y, w] of [[-14, -5, 12], [-4, -7, 14], [6, -4, 12]] as const) { R(g, x, y, w, 3, '#B8C8C0'); dith(g, x - 2, y - 1, w + 4, 1, '#B8C8C0'); }
  // (hazard stripes by the door, a warning plate)
  for (let k = 0; k < 4; k++) R(g, -22 + k * 3, -3, 2, 3, k % 2 ? '#FDE047' : INK);
  // (the name: green neon on its frame on the roof)
  sign(g, 'XENOSCARE', -22, -52, -38, '#06140A', '#7CFC9A', 6, true);
  R(g, -52, -53, 60, 1, '#3AD86A');
};

/** SPACE NEEDLE 2: three white legs in to a waist and out to the first deck, the lift shaft straight up "forever"
 *  with its orange rings and the lift on it, teal saucer decks getting smaller, a beacon. Its box runs off the top of
 *  the screen (it reaches space); it topples, so it's painted clean and upright. */
export const NEEDLE_H = 640;
export const paintNeedle = (g: Ctx) => {
  const waist = -92, deck1 = -150;
  // (a leg: foot to waist, waist to the deck; white enamel, lit down its east side)
  const leg = (a: number, b: number, c: number, lit: number) => {
    const seg = (x0: number, y0: number, x1: number, y1: number, w0: number, w1: number) => {
      poly(g, [x0 - w0, y0, x1 - w1, y1, x1 + w1, y1, x0 + w0, y0], WHITE[lit]);
      poly(g, [x0 + w0 * 0.2, y0, x1 + w1 * 0.2, y1, x1 + w1, y1, x0 + w0, y0], WHITE[Math.min(4, lit + 1)], false);
    };
    seg(a, 0, b, waist, 3.5, 2.5); seg(b, waist, c, deck1, 2.5, 2);
  };
  leg(-34, -8, -18, 1); leg(-10, -1, -4, 2); leg(34, 8, 18, 3);
  // (the feet: concrete pads)
  for (const x of [-34, -10, 34]) { R(g, x - 5, -3, 10, 3, INK); R(g, x - 4, -2, 8, 2, CHROME[2]); R(g, x - 4, -2, 8, 1, CHROME[4]); }
  // (the shaft, up from the ground: banded round; the orange rings; the lift)
  sCol(g, -4, -NEEDLE_H + 12, 8, NEEDLE_H - 12, WHITE);
  for (let y = -26; y > -NEEDLE_H + 14; y -= 26) { R(g, -4, y, 8, 2, ORANGE[2]); R(g, -4, y, 8, 1, ORANGE[4]); R(g, -4, y + 2, 8, 1, ORANGE[0]); }
  R(g, -4, -70, 8, 10, INK); R(g, -3, -69, 6, 8, '#F59E0B'); R(g, -3, -69, 6, 2, '#FDE68A'); R(g, -2, -66, 4, 3, GLASS[3]);
  // (the waist's ring)
  ell(g, 0, waist, 12, 3, TEAL[2]); ell(g, 2, waist - 1, 8, 1.2, TEAL[4], false);
  // (the decks: saucers round the shaft: the underside stepped up into the rim, a band of windows, a dome on top)
  const saucer = (y: number, r: number) => {
    for (let k = 0; k < 4; k++) { g.fillStyle = k ? TEAL[k - 1] : INK; g.beginPath(); g.ellipse(0, y + r * 0.05 * (3 - k), r * (1 - k * 0.14) + (k ? 0 : 1), r * 0.3 * (1 - k * 0.2) + (k ? 0 : 1), 0, 0, Math.PI); g.fill(); }
    const rh = Math.max(3, Math.round(r * 0.14));
    R(g, -r - 1, y - rh - 1, r * 2 + 2, rh + 2, INK); R(g, -r, y - rh, r * 2, rh, WHITE[2]); R(g, -r, y - rh, r * 2, 1, WHITE[4]); R(g, -r, y - 1, r * 2, 1, WHITE[1]);
    R(g, r * 0.5, y - rh, r * 0.5, rh, WHITE[3]);
    const n = Math.max(4, Math.round(r / 3));
    for (let i = 0; i < n; i++) { const wx = -r + ((i + 0.5) / n) * 2 * r; R(g, wx - 1, y - rh + 1, 2, Math.max(1, rh - 2), GLASS[i > n * 0.6 ? 3 : 1]); }
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, y - rh, r * 0.92 + 1, r * 0.26 + 1, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = TEAL[2]; g.beginPath(); g.ellipse(0, y - rh, r * 0.92, r * 0.26, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = TEAL[3]; g.beginPath(); g.ellipse(r * 0.2, y - rh, r * 0.6, r * 0.2, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = TEAL[4]; g.beginPath(); g.ellipse(r * 0.34, y - rh - r * 0.06, r * 0.26, r * 0.07, 0, 0, Math.PI * 2); g.fill();
    // (the shaft on up through the dome)
    sCol(g, -3, y - rh - r * 0.26 - 2, 6, r * 0.26 + 2, WHITE, false);
  };
  saucer(deck1, 34); saucer(-296, 26); saucer(-424, 19); saucer(-532, 14); saucer(-606, 9);
  // (the mast and its beacon)
  R(g, -1, -NEEDLE_H + 4, 2, 10, CHROME[2]); R(g, -2, -NEEDLE_H + 1, 4, 4, INK); R(g, -1, -NEEDLE_H + 2, 2, 2, '#FF4A5A');
  // (its name, down at its foot, on two posts)
  sign(g, 'SPACE NEEDLE 2', 0, -22, -1, '#0D4F5D', '#F4FFFE', 5, true);
};
