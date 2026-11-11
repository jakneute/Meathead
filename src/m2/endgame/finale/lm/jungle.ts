import { type Ctx, INK, R, poly, ell, line, txt, sign } from './kit';
import { ramp, hash, dith, wall, crown } from './kitFJF';
import { farTemple } from '../../../adventure/teases';

// ---------------------------------------------------------------------------------------------------------------
// JUNGLE LAND (the second pass): each attraction as it looks in its own land (adventure/teases.ts's temple, cruise
// and paddock, roof/art.ts's treehouse banyan, the dino park's stockade, dino/art/world.ts's fiberglass MOUNT KABOOMA),
// small, lit from the sunrise (upper right).

const LEAF = ['#1F4A2E', '#2D6438', '#3E7A40', '#5A9446'];
const BARK = ramp('#6E5236'), PLANK = ramp('#9A7448'), THATCH = ramp('#C0A060'), BAMBOO = ramp('#C9A64E'), LOG = ramp('#7A5E40');
const STEEL = ramp('#7E848C'), CONC = ramp('#AAA89E');
const LAVA = ['#7A1004', '#B82A06', '#E8540A', '#F88A1A', '#FFC23A', '#FFEC8A'];

/** A thatched roof: eaves at y between x0 and x1, the ridge `h` up; straw banded, lit on the right, its fringe. */
const thatch = (g: Ctx, x0: number, x1: number, y: number, h: number, P = THATCH) => {
  const mx = (x0 + x1) / 2;
  poly(g, [x0 - 1, y + 1, mx, y - h - 1, x1 + 1, y + 1], INK, false);
  poly(g, [x0, y, mx, y - h, x1, y], P[2], false);
  poly(g, [x0, y, mx, y - h, mx - (x1 - x0) * 0.14, y], P[1], false);
  poly(g, [mx + (x1 - x0) * 0.16, y, mx, y - h, x1, y], P[3], false);
  for (let k = 1; k < 4; k++) { const yy = Math.round(y - h + (h * k) / 4), hw = ((x1 - x0) / 2) * (k / 4); for (let x = Math.round(mx - hw); x < mx + hw; x += 3) R(g, x, yy, 2, 1, x < mx ? P[0] : P[4]); }
  for (let x = Math.round(x0); x < x1; x += 2) R(g, x, y, 1, 1 + ((x * 7) % 3 === 0 ? 1 : 0), P[1]);
};
/** A palm: a banded trunk leaning, fronds in three greens, coconuts. */
const palm = (g: Ctx, x: number, h: number, lean = 2) => {
  for (let k = 0; k < h; k += 2) { const px = x + Math.round((k / h) * (k / h) * lean); R(g, px - 1, -k - 2, 3, 2, INK); R(g, px, -k - 2, 1, 2, k % 4 ? '#8A6A40' : '#6A4E2C'); }
  const tx = x + lean, ty = -h;
  for (const [a, l] of [[-2.9, 9], [-2.3, 10], [-1.2, 8], [-0.5, 10], [0.2, 10], [0.9, 7], [2.6, 7]] as const) {
    const ex = tx + Math.cos(a) * l, ey = ty + Math.sin(a) * l * 0.6 + 3;
    line(g, tx, ty, ex, ey, INK, 3); line(g, tx, ty, ex, ey, a > -1.5 ? LEAF[3] : LEAF[1], 1.5); R(g, ex, ey, 1, 2, LEAF[2]);
  }
  R(g, tx - 1, ty, 2, 2, '#4A2E14');
};
const torch = (g: Ctx, x: number, y: number) => { R(g, x, y - 5, 1, 5, '#5A3A1E'); R(g, x - 1, y - 8, 3, 3, '#E87A20'); R(g, x, y - 10, 1, 3, '#F8C040'); R(g, x, y - 8, 1, 1, '#FFF0B0'); };

// ---------------------------------------------------------------------------------------------------------------

/** THE GIANT TREE: the treehouse's fake banyan: a trunk of tangled roots, aerial roots down from its limbs, the wide
 *  crown in lumps; plank decks round it with their rails, two thatched huts (a lit window each), the rope bridge
 *  sagging off to the right, the ladder, the flag; the cast door in the bark with its lamp. */
export const paintBigTree = (g: Ctx) => {
  // (aerial roots behind, down from the limbs)
  for (const [x, top] of [[-30, -58], [-22, -66], [24, -64], [31, -56]] as const) { R(g, x, top, 1, -top, BARK[1]); }
  // (the trunk: a tangle of root-columns, the middle ones lit, flaring at the foot)
  for (let k = -3; k <= 3; k++) {
    const x = k * 4, P = BARK[k < -1 ? 1 : k > 1 ? 3 : 2];
    poly(g, [x - 3 - Math.abs(k) * 0.5 + k * 2.4, 0, x - 2.5, -22, x - 2.5, -76, x + 2.5, -76, x + 2.5, -22, x + 3 + Math.abs(k) * 0.5 + k * 2.4, 0], INK, false);
    poly(g, [x - 2 + k * 2.4, 0, x - 1.5, -22, x - 1.5, -76, x + 1.5, -76, x + 1.5, -22, x + 2 + k * 2.4, 0], P, false);
    for (let y = -70; y < -6; y += 9) R(g, x + ((y + k) % 2 ? 0 : -1), y + (k * 3) % 5, 1, 4, BARK[0]);
  }
  for (const [x, w] of [[-22, 8], [16, 9], [-6, 6]] as const) { poly(g, [x, 0, x + w * 0.4, -5, x + w, 0], INK, false); poly(g, [x + 1, 0, x + w * 0.4, -4, x + w - 1, 0], BARK[2], false); }
  // (the limbs out to the crown)
  for (const [x1, y1] of [[-26, -84], [27, -86], [-12, -96], [14, -98]] as const) { line(g, 0, -70, x1, y1, INK, 6); line(g, 0, -70, x1, y1, x1 > 0 ? BARK[3] : BARK[1], 4); }
  // (the crown, wide, lumped; a little hanging moss off its underside)
  for (const [x, y, r] of [[-25, -84, 14], [26, -86, 13], [0, -96, 16], [-13, -100, 11], [15, -101, 10], [-34, -76, 6], [35, -78, 6]] as const) crown(g, x, y, r, LEAF);
  for (const [x, y, l] of [[-36, -70, 6], [-18, -72, 9], [20, -74, 8], [36, -72, 5], [6, -80, 5]] as const) for (let d = 0; d < l; d += 2) R(g, x + (d % 4 ? 1 : 0), y + d, 1, 2, d % 4 ? LEAF[2] : LEAF[3]);
  // (the decks: planks on brackets, their rails; the huts; the ladder up)
  const deck = (y: number, x0: number, x1: number) => {
    R(g, x0 - 1, y - 1, x1 - x0 + 2, 4, INK); R(g, x0, y, x1 - x0, 2, PLANK[2]); R(g, x0, y, x1 - x0, 1, PLANK[4]); for (let x = x0 + 3; x < x1; x += 5) R(g, x, y + 1, 1, 1, PLANK[0]);
    for (let x = x0; x <= x1 - 1; x += 5) R(g, x, y - 6, 1, 6, PLANK[1]); R(g, x0, y - 6, x1 - x0, 1, PLANK[3]);
    line(g, x0 + 2, y + 2, -6, y + 10, PLANK[0]); line(g, x1 - 2, y + 2, 6, y + 10, PLANK[0]);
  };
  const hut = (cx: number, y: number, w: number) => {
    wall(g, cx - w / 2, y - 10, w, 10, PLANK); for (let x = cx - w / 2 + 2; x < cx + w / 2; x += 3) R(g, x, y - 9, 1, 9, PLANK[1]);
    R(g, cx - 2, y - 8, 4, 4, INK); R(g, cx - 1, y - 7, 2, 2, '#FFD27A');
    thatch(g, cx - w / 2 - 3, cx + w / 2 + 3, y - 10, 9);
  };
  hut(-17, -48, 14); deck(-48, -30, 22);
  hut(13, -64, 12); deck(-64, -8, 26);
  for (let y = -46; y < 0; y += 4) R(g, -29, y, 5, 1, PLANK[3]); R(g, -29, -48, 1, 48, PLANK[1]); R(g, -25, -48, 1, 48, PLANK[1]);
  // (the rope bridge off the upper deck, sagging away to the right; the flag)
  g.strokeStyle = '#8A6A3A'; g.lineWidth = 1; for (const dy of [0, -5]) { g.beginPath(); g.moveTo(26, -64 + dy); g.quadraticCurveTo(34, -56 + dy, 40, -62 + dy); g.stroke(); }
  for (let k = 0; k < 4; k++) R(g, 28 + k * 3, -67 + [1, 3, 3, 2][k], 1, 5, '#6A4E2C');
  R(g, 13, -86, 1, 14, '#3A2A1A'); for (let k = 0; k < 3; k++) poly(g, [14, -86 + k * 2, 22 - k * 2, -84 + k, 14, -81], k % 2 ? '#F4F0E8' : '#D8402A', false);
  // (the cast door in the bark, its lamp)
  R(g, -4, -13, 8, 13, INK); R(g, -3, -12, 6, 12, BARK[1]); R(g, -3, -12, 6, 1, BARK[3]); R(g, 1, -7, 1, 1, '#FDE047'); R(g, -1, -16, 2, 2, '#FFE9A8');
};

/** THE JUNGLE CRUISE: the river and the dock; the queue house's long hipped thatch on bamboo posts (heads under its
 *  eave); the boathouse's two tiers of thatch, the sign board on its ridge; a launch at the dock (the green-and-white
 *  canopy, the white hull over its red boot top, the skipper); the lookout on its stilts with its striped pennant. */
export const paintCruise = (g: Ctx) => {
  // (the river: banded green water, ripples, lily pads; the dock's planks along it)
  R(g, -86, -5, 172, 5, INK); R(g, -85, -4, 170, 4, '#2E6A5A'); R(g, -85, -4, 170, 1, '#7ACBB4'); dith(g, -85, -3, 170, 1, '#4A9A84');
  for (let k = 0; k < 9; k++) R(g, -80 + k * 19 + (k % 2) * 4, -2, 7, 1, '#9ADCC8'); for (const x of [-70, 30, 48]) { R(g, x, -3, 3, 1, '#5AB04A'); R(g, x + 1, -4, 1, 1, '#F9A8D4'); }
  R(g, -52, -8, 100, 3, INK); R(g, -51, -7, 98, 2, PLANK[2]); R(g, -51, -7, 98, 1, PLANK[4]); for (let x = -50; x < 46; x += 6) { R(g, x, -6, 1, 1, PLANK[0]); R(g, x + 2, -5, 1, 5, PLANK[1]); }
  // (the queue house: a long low hipped thatch on its posts, the crowd's heads under the eave)
  for (let x = -82; x < -44; x += 7) { R(g, x, -15, 1, 10, BAMBOO[x < -64 ? 1 : 3]); }
  for (let x = -81; x < -46; x += 3) R(g, x, -10 - (hash(x) > 0.5 ? 1 : 0), 2, 2, ['#F0C8A2', '#6E4426', '#D9A877', '#A86B43', '#F2C9A0'][Math.floor(hash(x * 1.3) * 5)]);
  poly(g, [-87, -14, -76, -27, -52, -27, -41, -14], INK, false); poly(g, [-86, -15, -76, -26, -52, -26, -42, -15], THATCH[2], false);
  poly(g, [-86, -15, -76, -26, -72, -26, -80, -15], THATCH[1], false); poly(g, [-58, -15, -54, -26, -52, -26, -42, -15], THATCH[3], false);
  for (let y = -24; y < -15; y += 3) for (let x = -80; x < -46; x += 3) if (hash(x * 0.3 + y) > 0.45) R(g, x, y, 2, 1, x > -60 ? THATCH[4] : THATCH[0]);
  for (let x = -86; x < -41; x += 2) R(g, x, -15, 1, 1 + (x % 3 === 0 ? 1 : 0), THATCH[1]);
  // (the boathouse: bamboo posts, two tiers of thatch, the sign on the ridge)
  const bx = 2;
  for (let k = -3; k <= 3; k++) { const px = bx + k * 9; R(g, px - 1, -22, 3, 15, INK); R(g, px, -22, 1, 15, BAMBOO[k < 0 ? 1 : 3]); for (let y = -19; y < -8; y += 4) R(g, px, y, 1, 1, BAMBOO[0]); }
  thatch(g, bx - 33, bx + 33, -21, 9); thatch(g, bx - 20, bx + 20, -28, 9);
  sign(g, 'JUNGLE CRUISE', bx, -48, -36, '#5A3A1A', '#FDE68A', 5, true);
  // (a launch at the dock: the striped canopy on its stanchions, the hull, the skipper and three heads)
  const lx = bx - 22;
  for (const sx of [lx + 2, lx + 40]) R(g, sx, -18, 1, 8, '#C8C0B0');
  R(g, lx - 1, -20, 46, 4, INK); for (let k = 0; k < 11; k++) R(g, lx + k * 4, -19, 4, 2, k % 2 ? '#F4F0E8' : '#2E7A4A'); R(g, lx, -19, 44, 1, '#FFFFFF66');
  for (let k = 0; k < 4; k++) { R(g, lx + 8 + k * 7, -13, 2, 3, ['#DC2626', '#2563EB', '#F59E0B', '#F8FAFC'][k]); R(g, lx + 8 + k * 7, -15, 2, 2, ['#F2C9A0', '#8A5A3A', '#E8B48A', '#C68A5E'][k]); }
  R(g, lx + 36, -14, 2, 4, '#C8B48A'); R(g, lx + 36, -16, 2, 2, '#F2C9A0'); R(g, lx + 35, -17, 4, 1, '#E8DCB8');
  poly(g, [lx - 5, -11, lx + 48, -11, lx + 45, -4, lx - 2, -4], INK, false); poly(g, [lx - 4, -10, lx + 47, -10, lx + 44, -6, lx - 2, -6], '#E8E4DA', false);
  R(g, lx - 3, -10, 50, 1, '#FFFFFF'); R(g, lx - 2, -6, 46, 2, '#B91C1C'); R(g, lx + 30, -9, 12, 2, '#C8C4BA');
  // (the lookout on its stilts: braced, the deck and rail, a thatch cone, the pennant)
  const ox = 62;
  for (const sx of [-6, -2, 2, 6]) { R(g, ox + sx, -30, 1, 25, sx < 0 ? BAMBOO[1] : BAMBOO[3]); }
  for (let y = -27; y < -8; y += 8) { line(g, ox - 6, y, ox + 7, y + 8, BAMBOO[0]); line(g, ox + 7, y, ox - 6, y + 8, BAMBOO[0]); }
  R(g, ox - 10, -32, 21, 3, INK); R(g, ox - 9, -31, 19, 1, PLANK[3]); for (let k = ox - 8; k <= ox + 8; k += 4) R(g, k, -36, 1, 4, PLANK[1]); R(g, ox - 9, -36, 19, 1, PLANK[2]);
  thatch(g, ox - 11, ox + 12, -36, 8);
  R(g, ox, -48, 1, 5, '#3A2A1A'); for (let k = 0; k < 2; k++) poly(g, [ox + 1, -48 + k * 2, ox + 8 - k * 2, -46 + k, ox + 1, -44], k % 2 ? '#F4F0E8' : '#D8402A', false);
  // (the jungle round it: palms, a hippo's back and ears in the river: the animatronic, mid-yawn)
  palm(g, 76, 30, 3); palm(g, 82, 22, -2);
  R(g, 33, -6, 9, 3, INK); R(g, 34, -6, 7, 2, '#8A7A8A'); R(g, 34, -6, 7, 1, '#B0A0B0'); R(g, 34, -8, 2, 2, '#8A7A8A'); R(g, 39, -8, 2, 2, '#8A7A8A'); R(g, 36, -5, 1, 1, INK);
};

/** TEMPLE OF THE JAGUAR: the land's own (teases.ts's painter: the stepped pyramid in sandy stone, glyph panels, moss
 *  and vines, the stair, the shrine on top, the fanged entrance and its torches, and behind it the stucco show
 *  building it's the front of, the fiberglass jaguar head on the roof from behind); its sign on posts at the foot. */
export const paintTemple = (g: Ctx) => {
  farTemple(g, 0, 0, 150, c => c, 0.5);
  // (the light's from the right here: a lit edge down each tier's right end, shade down the left; ink round the foot)
  for (let i = 0; i < 3; i++) { const half = 75 - i * 19.5, y = -(i + 1) * 15.75; R(g, half - 3, y + 2, 2, 13, '#E4D8B0'); R(g, half - 1, y, 1, 16, INK); R(g, -half, y + 2, 3, 13, '#6E644C'); R(g, -half - 1, y, 1, 16, INK); }
  R(g, -76, -1, 152, 1, INK);
  // (jungle crowding its ends: crowns, a palm)
  crown(g, -78, -8, 8, LEAF); crown(g, 79, -6, 6, LEAF); crown(g, -70, -4, 5, LEAF);
  sign(g, 'TEMPLE OF THE JAGUAR', -38, -15, 0, '#5A3A1A', '#FDE68A', 4, true);
};

/** PRE-HYSTERIC PARK: the log stockade and its gate arch (torches on the posts, the sign board across), the
 *  brachiosaurus's neck up over the wall (an animatronic: the seams in its neck), the park's banded water tower, the
 *  monorail's beam on its T-head pillars and a car on it (white, the orange stripe), the CLOSED board. */
export const paintDinoPark = (g: Ctx) => {
  // (the water tower, back left: legs and bracing, the banded tank, the land's green band, the catwalk, its cap)
  {
    const wx = -78, S = ramp('#8A949E');
    for (const lx of [-9, -3, 3, 8]) R(g, wx + lx, -36, 1, 36, S[lx < 0 ? 1 : 3]);
    for (let y = -32; y < -4; y += 10) { R(g, wx - 9, y, 18, 1, S[1]); line(g, wx - 9, y, wx + 9, y + 10, S[0]); line(g, wx + 9, y, wx - 9, y + 10, S[0]); }
    R(g, wx - 13, -53, 26, 18, INK); const bands = [0, 1, 1, 2, 2, 3, 3, 4, 3, 2];
    for (let k = 0; k < bands.length; k++) R(g, wx - 12 + Math.round(k * 2.4), -52, 3, 16, S[bands[k]]);
    R(g, wx - 12, -46, 24, 5, '#3E7A3A'); R(g, wx + 4, -46, 8, 5, '#5A9A4A'); R(g, wx - 12, -46, 5, 5, '#2A5A2A'); for (let k = 0; k < 5; k++) R(g, wx - 9 + k * 4, -44, 2, 1, '#F2E8C8');
    R(g, wx - 15, -36, 30, 1, S[1]); for (let k = 0; k <= 30; k += 5) R(g, wx - 15 + k, -39, 1, 3, S[0]); R(g, wx - 15, -39, 30, 1, S[0]);
    poly(g, [wx - 14, -53, wx, -61, wx + 14, -53], INK, false); poly(g, [wx - 13, -53, wx, -60, wx + 13, -53], S[2], false); poly(g, [wx, -53, wx, -60, wx + 13, -53], S[4], false); R(g, wx, -62, 1, 2, '#B91C1C');
  }
  // (the monorail's beam along the back on its pillars; the car)
  for (const x of [-48, 14, 76]) { R(g, x, -40, 3, 40, CONC[2]); R(g, x + 2, -40, 1, 40, CONC[4]); R(g, x, -40, 1, 40, CONC[1]); R(g, x - 3, -41, 9, 2, CONC[1]); }
  R(g, -60, -45, 160, 4, INK); R(g, -60, -44, 160, 2, CONC[3]); R(g, -60, -44, 160, 1, CONC[4]); R(g, -60, -42, 160, 1, CONC[0]);
  R(g, 40, -53, 40, 9, INK); R(g, 41, -52, 38, 7, '#D8DCE0'); R(g, 41, -52, 38, 1, '#FFFFFF'); R(g, 41, -48, 38, 2, '#C2410C'); for (let k = 0; k < 6; k++) R(g, 44 + k * 6, -51, 4, 2, '#2A3A4A'); poly(g, [79, -53, 86, -49, 86, -45, 79, -45], INK, false); poly(g, [79, -52, 85, -49, 85, -46, 79, -46], '#D8DCE0', false); R(g, 80, -51, 3, 2, '#2A3A4A');
  // (the brachiosaurus's neck up over the stockade, looking right: seamed)
  {
    const N = ramp('#6E8A5A');
    poly(g, [-34, -20, -31, -44, -25, -56, -17, -60, -8, -59, -4, -55, -8, -52, -16, -53, -21, -48, -22, -20], INK);
    poly(g, [-33, -20, -30, -44, -24.5, -55, -17, -59, -9, -58, -5, -55, -8, -53, -16, -54, -22, -48, -23, -20], N[2], false);
    poly(g, [-33, -20, -30, -44, -24.5, -55, -22, -56, -28, -44, -30, -20], N[1], false);
    R(g, -16, -58, 7, 1, N[4]); R(g, -11, -57, 1, 1, INK); R(g, -6, -55, 1, 1, INK);
    for (const y of [-28, -36, -44]) line(g, -32, y, -23, y - 1, N[0]);
  }
  // (the stockade: pointed logs, banded; the gate arch on its two big posts, the board across, torches)
  for (let x = -60; x < 36; x += 4) {
    const h = 22 + ((x * 7) % 3), P = LOG;
    poly(g, [x - 0.5, 0, x - 0.5, -h, x + 1.5, -h - 3, x + 3.5, -h, x + 3.5, 0], INK, false);
    R(g, x, -h, 3, h, P[2]); R(g, x, -h, 1, h, P[1]); R(g, x + 2, -h, 1, h, P[3]); R(g, x + 1, -h - 2, 1, 2, P[3]);
  }
  R(g, -60, -16, 96, 1, LOG[0]); R(g, -60, -8, 96, 1, LOG[0]);
  for (const x of [-14, 16]) { R(g, x - 1, -40, 8, 40, INK); R(g, x, -39, 6, 39, LOG[2]); R(g, x, -39, 2, 39, LOG[1]); R(g, x + 4, -39, 2, 39, LOG[3]); for (let y = -34; y < 0; y += 6) R(g, x, y, 6, 1, LOG[0]); torch(g, x + 3, -40); }
  R(g, -8, -28, 24, 28, '#16100A'); for (let x = -6; x < 16; x += 4) R(g, x, -28, 1, 28, '#3A2A1A'); R(g, -8, -14, 24, 1, '#3A2A1A');
  R(g, -40, -41, 88, 11, INK); R(g, -39, -40, 86, 9, '#E8C030'); R(g, -39, -40, 86, 1, '#FFF0A0'); R(g, -39, -32, 86, 1, '#A8861A'); txt(g, 'PRE-HYSTERIC PARK', 4.5, -33, '#1A1A1A', 5);
  // (the CLOSED board by the gate, on its post; a palm, ferns)
  R(g, 28, -10, 1, 10, '#5A3A1E'); R(g, 20, -20, 30, 10, INK); R(g, 21, -19, 28, 8, '#F4F0E8'); txt(g, 'CLOSED', 35.5, -13, '#B91C1C', 4);
  palm(g, 92, 26, 3); crown(g, 62, -5, 6, LEAF); crown(g, -94, -6, 7, LEAF);
};

/** THE T. REX PADDOCK: the steel fence (bars, two rails, concrete pillars, the yellow warning plates), the log gate
 *  post with its sign board and the torch on top; the rex up over the fence looking right: the big head, the brow, the
 *  teeth, the little arm hooked over the rail. */
export const paintRexPaddock = (g: Ctx) => {
  // (the jungle behind the fence)
  for (const [x, y, r] of [[-60, -26, 12], [-36, -30, 10], [58, -24, 11], [34, -20, 8]] as const) crown(g, x, y, r, LEAF);
  // (the rex: the body's bulk behind the bars, the neck up, the head over the top)
  {
    const X = ramp('#5A7A44'), B = ramp('#C8B878');
    poly(g, [-34, 0, -32, -30, -22, -44, -6, -50, 2, -64, 12, -72, 30, -73, 44, -68, 48, -60, 46, -56, 34, -56, 30, -50, 20, -48, 16, -36, 14, 0], INK);
    poly(g, [-33, 0, -31, -30, -21.5, -43, -6, -49, 3, -63, 12.5, -71, 30, -72, 43, -67.5, 47, -60, 45, -57, 34, -57, 29.5, -51, 20, -49, 15, -36, 13, 0], X[2], false);
    poly(g, [-33, 0, -31, -30, -21.5, -43, -12, -46, -20, -30, -22, 0], X[1], false);
    poly(g, [12.5, -71, 30, -72, 43, -67.5, 44, -65, 28, -68, 14, -67, 6, -60, 3, -63], X[3], false);
    // (the belly's pale band, the jaw: open a little, teeth both ways, the tongue)
    poly(g, [16, -48, 30, -50, 33, -56, 44, -56, 43, -53, 34, -52, 31, -46, 20, -44], INK, false);
    poly(g, [18, -47.5, 30, -49.5, 33, -55, 42, -55, 34, -53, 31, -47, 21, -45], B[2], false);
    R(g, 31, -57, 14, 2, '#5A1410'); for (let k = 0; k < 5; k++) { R(g, 33 + k * 3, -57, 1, 2, '#FFFFFF'); R(g, 34 + k * 3, -55, 1, 1, '#F4F0E8'); }
    // (the brow ridge, the eye under it, the nostril, scars)
    poly(g, [22, -70, 30, -73, 34, -70, 28, -68], X[0], false); R(g, 27, -68, 3, 2, '#FDE047'); R(g, 28, -68, 1, 2, INK); R(g, 43, -66, 1, 1, INK);
    for (const [x, y] of [[8, -58], [14, -62], [-10, -42], [-22, -30]] as const) R(g, x, y, 3, 1, X[0]);
    for (let k = 0; k < 6; k++) R(g, -28 + k * 6, -38 + Math.round(Math.abs(k - 2) * 1.5), 2, 1, X[4]);
    // (the little arm over the top rail: shoulder at the chest, the elbow bent down and forward, two claws)
    line(g, 12, -44, 18, -39, INK, 4); line(g, 18, -39, 23, -42, INK, 4); line(g, 12, -44, 18, -39, X[3], 2); line(g, 18, -39, 23, -42, X[3], 2); R(g, 23, -44, 1, 2, '#F4F0E8'); R(g, 25, -43, 1, 2, '#F4F0E8');
  }
  // (the fence: bars, the rails, the pillars and their plates)
  const top = -40;
  for (let x = -72; x < 72; x += 3) R(g, x, top, 1, 40, (x / 3) % 2 ? STEEL[3] : STEEL[1]);
  R(g, -72, top - 1, 144, 3, INK); R(g, -72, top, 144, 1, STEEL[4]); R(g, -72, -20, 144, 2, INK); R(g, -72, -20, 144, 1, STEEL[3]);
  for (let x = -74; x <= 70; x += 36) {
    R(g, x - 1, top - 5, 8, 45, INK); R(g, x, top - 4, 6, 44, CONC[2]); R(g, x, top - 4, 2, 44, CONC[1]); R(g, x + 4, top - 4, 2, 44, CONC[4]); R(g, x - 1, top - 6, 8, 2, CONC[4]);
    if (x < 60 && x !== -2) { R(g, x + 10, top + 6, 11, 8, INK); R(g, x + 11, top + 7, 9, 6, '#E8C030'); poly(g, [x + 15.5, top + 8, x + 18, top + 12, x + 13, top + 12], '#1A1A1A', false); }
  }
  // (the gate post: a log tower, the board on it, the torch)
  {
    const gx = -48;
    R(g, gx - 5, top - 20, 11, 60, INK); R(g, gx - 4, top - 19, 9, 59, LOG[2]); R(g, gx - 4, top - 19, 3, 59, LOG[1]); R(g, gx + 2, top - 19, 3, 59, LOG[3]);
    for (let y = top - 14; y < 0; y += 6) R(g, gx - 4, y, 9, 1, LOG[0]);
    R(g, gx - 27, top - 18, 62, 11, INK); R(g, gx - 26, top - 17, 60, 9, LOG[3]); R(g, gx - 26, top - 17, 60, 1, LOG[4]); txt(g, 'T. REX PADDOCK', gx + 4.5, top - 10, '#2A1A0A', 4);
    torch(g, gx, top - 20);
  }
  palm(g, 66, 34, 3);
};

/** MOUNT KABOOMA (the owner's own, kept as it is: a fiberglass volcano): the cone in bolted panels with its seams
 *  showing, the crater's rim, the fake lava painted down its channels in the old palette's steps, an access hatch, a
 *  steam vent; the tiki sign on its log posts and the show board. */
export const paintKabooma = (g: Ctx) => {
  const K = ramp('#7A5A4A');
  const cone = [-100, 0, -72, -40, -42, -84, -22, -95, -16, -92, 16, -92, 22, -95, 42, -84, 72, -40, 100, 0];
  poly(g, [-101, 0, -73, -41, -43, -85, -22, -96, -16, -93, 16, -93, 22, -96, 43, -85, 73, -41, 101, 0], INK);
  poly(g, cone, K[2], false);
  poly(g, [-100, 0, -72, -40, -42, -84, -22, -95, -16, -92, -30, -60, -46, 0], K[1], false);
  poly(g, [22, -95, 42, -84, 72, -40, 100, 0, 58, 0, 40, -50, 16, -92], K[3], false);
  poly(g, [42, -84, 72, -40, 100, 0, 84, 0, 62, -40], K[4], false);
  dith(g, -46, -60, 3, 60, K[1]); dith(g, 40, -50, 3, 50, K[3], 1);
  // (the panels' seams fanning down from the rim, cross seams, the bolts along them)
  for (let k = 0; k < 8; k++) { const xt = -18 + k * 5.2, xb = -86 + k * 24.6; line(g, xt, -90, xb, -1, K[0]); for (let u = 0.15; u < 1; u += 0.2) R(g, xt + (xb - xt) * u + 1, -90 + 89 * u, 1, 1, K[4]); }
  for (const [y, half] of [[-30, 78], [-62, 55]] as const) for (let x = -half; x < half; x += 2) R(g, x, y + Math.round(Math.sin(x * 0.08) * 2), 1, 1, K[0]);
  // (the crater: its rim, the lava in it, and down three channels in steps)
  R(g, -16, -93, 32, 3, INK); for (let i = 0; i < 8; i++) R(g, -15 + i * 4, -92, 4, 2, LAVA[(i * 2) % LAVA.length]);
  const run = (x0: number, end: number, wig: number, w: number) => { for (let y = -90, i = 0; y < end; y += 3, i++) { const x = x0 + Math.sin(y * 0.09) * 5 * wig; R(g, x - w / 2 - 1, y, w + 2, 3, LAVA[0]); R(g, x - w / 2, y, w, 3, LAVA[1 + (i % 4)]); R(g, x - 0.5, y, 1, 3, LAVA[Math.min(5, 3 + (i % 3))]); } };
  run(-8, -38, 1, 5); run(10, -30, -1, 4); run(0, -62, 0.5, 6);
  // (the hatch, the vent and its steam, painted still)
  R(g, 44, -30, 9, 12, INK); R(g, 45, -29, 7, 10, '#8A8E96'); R(g, 45, -29, 7, 1, '#C8CCD4'); R(g, 50, -24, 1, 2, INK); for (let k = 0; k < 3; k++) R(g, 46, -27 + k * 3, 3, 1, '#5A5E66');
  for (const [x, y, r] of [[-56, -52, 4], [-59, -60, 5], [-55, -69, 6]] as const) { ell(g, x, y, r, r * 0.8, '#F0F0F4', false); ell(g, x + 1, y - 1, r * 0.5, r * 0.4, '#FFFFFF', false); }
  for (const [x, y, r] of [[-4, -98, 4], [4, -98, 3]] as const) ell(g, x, y, r, r * 0.7, '#ECECF0', false);
  // (the tiki sign on its log posts; the show board on its own post)
  sign(g, 'MOUNT KABOOMA', -48, -34, 0, '#5A3A1A', '#FF9A2A', 5, true);
  R(g, 76, -14, 1, 14, '#5A3A1E'); R(g, 60, -34, 34, 20, INK); R(g, 61, -33, 32, 18, '#1E293B'); R(g, 61, -33, 32, 1, '#4A5A72'); txt(g, 'ERUPTS', 77.5, -25, '#FDE047', 4); txt(g, 'HOURLY', 77.5, -18, '#FDE047', 4);
  palm(g, -94, 22, 2); crown(g, 96, -5, 5, LEAF);
};
