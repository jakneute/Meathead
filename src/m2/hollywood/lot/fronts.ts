// The backlot's fronts (back from the play plane at FRONT_D: dimmed, none of them to stand on), plywood one sheet deep
// like the boulevard's, painted up as the real thing and held up from behind by 2x4s down to sandbags (blvd/fronts.ts's
// bracing, going back toward the eye past their ends: walk past one and there it is):
//   NEW YORK STREET   brick tenements (running bond, stone quoins and lintels, sills, the windows by the hour, AC units,
//                     a flower box, the cornice and its dentils), the DELI (its striped awning painted flat, salamis in
//                     the window), a brownstone with a water tank up on its roof, the PAWN shop (bars, its three gold
//                     balls, guitars), the HOTEL (its blade sign in bulbs, a tank on the roof);
//   THE WESTERN TOWN  false fronts in board-and-batten (stepped and peaked tops over the gables behind), their names
//                     painted in serifed wood: the SALOON (batwing doors, its balcony door up top), the SHERIFF (bars,
//                     WANTED posters, Steve's among them), the BANK (stone, a pediment, gold leaf), the UNDERTAKER;
//   THE FAKE SUBURB   the same house over and over (clapboard, a shingled gable, shutters, a fanlight door and its porch
//                     lamp, a chimney), nothing behind any of them but the 2x4s;
// and the real buildings: EXIT THROUGH THE GIFT SHOP (open: its floor, its back wall of shelves, its side walls and
// ceiling going back, the fascia and its sign), DISASTER: THE RIDE (poured concrete, cracks painted on, the marquee, the
// mural, the doors under the canopy), and at the start the warehouse's far wall, smashed open by the bulldozer.

import { GY } from '../geometry';
import { X, GIFT, RIDE_DOORS, BREAK } from './layout';
import {
  type Ctx, type View, INK, box, checker, mix, hash, poly, at, atDepth, still, seen, signText, signW, timeOfDay,
  FRONT_D, PLY, BRASS, STEEL, CONCRETE, STEVE, ramp6, dimmed, rampH, glassOf, lit, slab, ball, board, deco, bulbs, paint, plain,
  sideBack, underBack, hour,
} from '../blvd/kit';
import { bracing } from '../blvd/fronts';
import { gate } from '../../hub/letters';
import { rampDown } from '../../signLetters';
import { bust, tintBust, drawBust, SKIN, HAIR, IRIS, type BustSpec } from '../../grossBust';
import { steveBust } from '../steveBust';

/** The other WANTED face: some varmint, gap-toothed, a scar, a mole. */
const VARMINT: BustSpec = { seed: 1881, skin: SKIN.olive, hair: 'crew', hairRamp: HAIR.black, beard: 'full', beardRamp: HAIR.black, iris: IRIS.gray, mouth: 'grimace', extras: ['scar', 'mole'], bulge: 1.3, look: [-0.5, 0] };
import { BRICK, BOARD, SHINGLE, SIDING, bricks, battens, corrugated } from './paint';

type Kind = 'ny' | 'west' | 'house';
type Dress = 'deli' | 'brownstone' | 'pawn' | 'hotel' | 'saloon' | 'sheriff' | 'bank' | 'undertaker' | 'house';
interface Front { rx: number; w: number; h: number; kind: Kind; dress: Dress; wall: string; name?: string; sub?: string }

export const LOT_FRONTS: Front[] = [
  { rx: 1550, w: 260, h: 300, kind: 'ny', dress: 'deli', wall: '#8A3E2C', name: 'DELI', sub: 'PASTRAMI ON RYE (PROP)' },
  { rx: 1850, w: 280, h: 320, kind: 'ny', dress: 'brownstone', wall: '#6E4A3A' },
  { rx: 2120, w: 260, h: 300, kind: 'ny', dress: 'pawn', wall: '#7A3628', name: 'PAWN', sub: 'WE BUY PROPS' },
  { rx: 2400, w: 300, h: 340, kind: 'ny', dress: 'hotel', wall: '#5E4A44', name: 'HOTEL' },
  { rx: 4800, w: 220, h: 220, kind: 'west', dress: 'saloon', wall: '#8C6438', name: 'SALOON', sub: 'NO SPURS ON THE PIANO' },
  { rx: 5050, w: 200, h: 200, kind: 'west', dress: 'sheriff', wall: '#7A5A38', name: 'SHERIFF' },
  { rx: 5640, w: 240, h: 230, kind: 'west', dress: 'bank', wall: '#A89C88', name: 'BANK', sub: 'EST. 1987 (FOR FILMING)' },
  { rx: 5900, w: 140, h: 190, kind: 'west', dress: 'undertaker', wall: '#5A4A3A', name: 'UNDERTAKER' },
  { rx: 6470, w: 190, h: 180, kind: 'house', dress: 'house', wall: '#FDE68A' },
  { rx: 6680, w: 200, h: 180, kind: 'house', dress: 'house', wall: '#BFDBFE' },
  { rx: 7730, w: 200, h: 180, kind: 'house', dress: 'house', wall: '#FBCFE8' },
];

/** The western town's own lettering: serifed capitals in painted wood (grain, chips), inked, a drop shadow. */
const wood = (col: string, sx = 2, sy = 2) => ({ sx, sy, serif: true, gap: 2, fill: rampDown(col, 0.35), dither: true, ink: '#1C1014', shadow: '#1C1014', drop: 1, grain: mix(col, '#1C1014', 0.3), worn: 0.06, wornCol: mix(col, '#1C1014', 0.5) });

// ---------------------------------------------------------------------------------------------------------------
// New York Street

/** A tenement window: its stone lintel, the glass by the hour (lit after dark), the sash, a shade half down, the sill;
 *  sometimes an AC unit hung out of it, sometimes a flower box. */
const nyWindow = (g: Ctx, x: number, y: number, R: string[], S: string[], seed: number) => {
  const glass = glassOf(), on = lit() && hash(seed) > 0.45, ww = 24, wh = 34;
  box(g, x - 4, y - 7, ww + 8, 6, INK); box(g, x - 3, y - 6, ww + 6, 4, S[4]); box(g, x - 3, y - 6, ww + 6, 1, S[5]); box(g, x + ww / 2 - 2, y - 7, 4, 6, S[3]);
  box(g, x - 2, y - 2, ww + 4, wh + 4, INK);
  box(g, x, y, ww, wh, on ? '#C88A36' : glass[1]); box(g, x, y, ww, 10, on ? '#E8A646' : glass[2]); checker(g, x, y + 10, ww, 2, on ? '#E8A646' : glass[2], 0, 1);
  box(g, x, y, ww, 6 + Math.round(hash(seed * 3) * 12), on ? '#F2D088' : dimmed('#D8CCB0'));
  box(g, x, y + wh / 2 - 1, ww, 2, R[1]); box(g, x + ww / 2 - 1, y, 2, wh, R[1]);
  box(g, x - 3, y + wh + 1, ww + 6, 3, S[3]); box(g, x - 3, y + wh + 1, ww + 6, 1, S[5]);
  const k = hash(seed * 7.1);
  if (k > 0.72) { box(g, x + 2, y + wh - 12, 20, 12, INK); box(g, x + 3, y + wh - 11, 18, 10, dimmed('#B8BCC0')); for (let r = 0; r < 4; r++) box(g, x + 5, y + wh - 9 + r * 2, 14, 1, dimmed('#6A6E72')); }
  else if (k < 0.22) { box(g, x - 2, y + wh + 3, ww + 4, 6, INK); box(g, x - 1, y + wh + 4, ww + 2, 4, dimmed('#6A3A1A')); for (let f = 0; f < 5; f++) { box(g, x + 1 + f * 5, y + wh, 3, 4, dimmed('#3A6A28')); box(g, x + 2 + f * 5, y + wh - 1, 2, 2, dimmed(['#E84A6A', '#F2C24A', '#F4F0E8'][f % 3])); } }
};
/** A wooden water tank on the roof, on its stilts: staves, hoops, a conical cap, a ladder. Its foot at (x, y). */
const waterTank = (g: Ctx, x: number, y: number) => {
  const W2 = rampH('#8A6A48', true), I = STEEL.map(dimmed);
  for (const lx of [x + 4, x + 22, x + 40]) { box(g, lx - 1, y - 30, 4, 30, INK); box(g, lx, y - 30, 2, 30, I[3]); }
  g.strokeStyle = I[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 5, y - 28); g.lineTo(x + 41, y - 4); g.moveTo(x + 41, y - 28); g.lineTo(x + 5, y - 4); g.stroke();
  box(g, x - 1, y - 33, 50, 4, INK); box(g, x, y - 32, 48, 2, I[3]);
  box(g, x - 1, y - 75, 50, 43, INK);
  for (let k = 0; k < 48; k += 4) box(g, x + k, y - 74, 4, 42, W2[k < 8 ? 4 : k < 30 ? 3 : k < 40 ? 2 : 1]);
  for (let k = 0; k < 48; k += 4) box(g, x + k + 3, y - 74, 1, 42, W2[1]);
  for (const hy of [y - 66, y - 52, y - 38]) { box(g, x, hy, 48, 2, I[1]); box(g, x, hy, 48, 1, I[3]); }
  poly(g, [[x - 4, y - 74], [x + 24, y - 96], [x + 52, y - 74]], INK);
  poly(g, [[x - 2, y - 75], [x + 24, y - 94], [x + 24, y - 75]], W2[3]); poly(g, [[x + 24, y - 94], [x + 50, y - 75], [x + 24, y - 75]], W2[1]);
  box(g, x + 44, y - 74, 2, 44, I[2]); for (let r = y - 70; r < y - 32; r += 6) box(g, x + 42, r, 6, 1, I[2]);
};
const paintNY = (g: Ctx, f: Front) => {
  const { w, h } = f, R = rampH(f.wall, true), S = rampH('#C8BCA4', true), T = rampH(f.dress === 'deli' ? '#2E6A3A' : f.dress === 'pawn' ? '#2A2A3A' : f.dress === 'hotel' ? '#6A1A1A' : '#3A2A2A', true);
  // (the roof's things first, behind the parapet: the tank)
  if (f.dress === 'brownstone') waterTank(g, w * 0.62, -h - 10);
  if (f.dress === 'hotel') waterTank(g, w * 0.14, -h - 14);
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  if (f.dress === 'brownstone') {
    // (brownstone: dressed stone in courses, rusticated low)
    box(g, 0, -h, w, h, R[3]);
    for (let y = -h; y < 0; y += 10) { box(g, 0, y, w, 1, R[1]); for (let x = (y / 10) % 2 ? 0 : 20; x < w; x += 40) box(g, x, y, 1, 10, R[2]); }
    for (let i = 0; i < w * h / 90; i++) box(g, hash(f.rx + i * 1.3) * w, -h + hash(f.rx + i * 2.9) * h, 2, 1, i % 3 ? R[2] : R[4]);
    box(g, 0, -h, 4, h, R[4]); box(g, w - 6, -h, 6, h, R[1]);
  } else {
    bricks(g, 0, -h, w, h, R, dimmed('#3A2A26'), f.rx);
    // (stone quoins up its edges)
    for (let y = -h + 4, k = 0; y < -10; y += 12, k++) for (const qx of [0, w - (k % 2 ? 14 : 20)]) { box(g, qx, y, k % 2 ? 14 : 20, 11, S[3]); box(g, qx, y, k % 2 ? 14 : 20, 1, S[5]); box(g, qx, y + 10, k % 2 ? 14 : 20, 1, S[1]); }
    // (a ghost ad up the side, faded)
    if (f.dress === 'pawn') signText(g, 'CIGARS 5¢', w / 2, -h + 60, plain(1, 2, mix(R[3], '#F2E8D8', 0.3)));
  }
  // (the cornice: stepped bands, dentils; shaded on top: scenery, not a ledge)
  box(g, -8, -h - 14, w + 16, 16, INK);
  box(g, -7, -h - 13, w + 14, 5, S[2]); box(g, -7, -h - 13, w + 14, 1, S[1]);
  box(g, -5, -h - 8, w + 10, 4, S[3]); for (let x = -4; x < w + 4; x += 6) box(g, x, -h - 5, 3, 3, S[4]);
  box(g, -3, -h - 2, w + 6, 3, S[2]);
  box(g, -7, -h + 2, w + 14, 3, 'rgba(28, 16, 20, 0.35)');
  // (the floors of windows)
  const shopTop = -96, n = Math.max(2, Math.floor((w - 40) / 54));
  for (let wy = -h + 30, r = 0; wy + 40 < shopTop - 14; wy += 58, r++) {
    box(g, 6, wy + 44, w - 12, 3, S[2]); box(g, 6, wy + 44, w - 12, 1, S[4]);
    for (let k = 0; k < n; k++) nyWindow(g, Math.round(22 + k * ((w - 68) / (n - 1))), wy, R, S, f.rx + r * 17 + k * 5);
  }
  // (the shop at the street: its frame, the plate glass, what's in it, the door; the sign band over it)
  const glass = glassOf(), on = lit();
  box(g, 6, shopTop - 22, w - 12, 22, INK); box(g, 7, shopTop - 21, w - 14, 20, T[3]); box(g, 7, shopTop - 21, w - 14, 2, T[4]); box(g, 7, shopTop - 3, w - 14, 2, T[1]);
  box(g, 6, shopTop, w - 12, -shopTop, INK);
  const dx = w - 58;
  box(g, 10, shopTop + 4, dx - 18, -shopTop - 22, glass[1]); box(g, 10, shopTop + 4, dx - 18, 18, glass[2]);
  g.save(); g.beginPath(); g.rect(10, shopTop + 4, dx - 18, -shopTop - 22); g.clip();
  const gx = 10, gy = shopTop + 4, gw = dx - 18, gh = -shopTop - 22;
  if (f.dress === 'deli') {
    // (salamis and cheeses hanging, a counter, a neon OPEN)
    for (let k = 0; k < gw / 12; k++) { const hx = gx + 6 + k * 12; box(g, hx, gy, 1, 8 + (k % 3) * 3, dimmed('#3A2A1A')); g.fillStyle = INK; g.beginPath(); g.ellipse(hx, gy + 18 + (k % 3) * 3, 4, 9, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed(k % 3 === 1 ? '#E8C25A' : '#8A2A1A'); g.beginPath(); g.ellipse(hx, gy + 18 + (k % 3) * 3, 3, 8, 0, 0, Math.PI * 2); g.fill(); box(g, hx - 1, gy + 12 + (k % 3) * 3, 1, 6, dimmed('#F4E8C8')); }
    box(g, gx, gy + gh - 16, gw, 16, dimmed('#E8E0D0')); box(g, gx, gy + gh - 16, gw, 2, dimmed('#FFFFFF'));
  } else if (f.dress === 'pawn') {
    // (guitars hung up, a trumpet, a prop sword, a crown; bars over it all)
    for (let k = 0; k < 4; k++) { const cx = gx + 14 + k * 26; g.fillStyle = INK; g.beginPath(); g.ellipse(cx, gy + gh - 18, 9, 11, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed(['#C8762A', '#8A2A1A', '#2A2A2A', '#E8C25A'][k]); g.beginPath(); g.ellipse(cx, gy + gh - 18, 8, 10, 0, 0, Math.PI * 2); g.fill(); box(g, cx - 1, gy + 6, 3, gh - 34, dimmed('#3A2A1A')); box(g, cx - 1, gy + gh - 20, 3, 3, INK); }
    for (let x = gx; x < gx + gw; x += 7) box(g, x, gy, 2, gh, dimmed('#2A2A30'));
  } else if (f.dress === 'hotel') {
    // (the lobby: a chandelier, the desk, a bell; lit warm after dark)
    box(g, gx, gy, gw, gh, on ? '#A86A28' : glass[1]); box(g, gx + 10, gy + gh - 20, gw - 20, 20, dimmed('#5A2A1A')); box(g, gx + 10, gy + gh - 20, gw - 20, 2, dimmed('#8A4A2A'));
    for (let k = 0; k < 5; k++) box(g, gx + gw / 2 - 10 + k * 5, gy + 10, 2, 4, on ? '#FFF2C0' : dimmed('#E8C25A'));
  } else {
    for (let k = 0; k < 3; k++) box(g, gx + 10 + k * 30, gy + gh - 22, 20, 22, dimmed(['#6A5A4A', '#4A3A2A', '#7A6A5A'][k]));
  }
  g.fillStyle = 'rgba(255,255,255,0.18)'; for (const sx of [gx + 8, gx + gw * 0.6]) { g.beginPath(); g.moveTo(sx, gy + gh); g.lineTo(sx + 10, gy + gh); g.lineTo(sx + 10 + gh * 0.5, gy); g.lineTo(sx + gh * 0.5, gy); g.fill(); }
  g.restore();
  box(g, 10, -18, dx - 18, 18, T[2]); for (let x = 10; x < dx - 8; x += 8) box(g, x, -18, 1, 18, T[1]); box(g, 10, -18, dx - 18, 2, T[4]);
  // (the door, its transom, a step)
  box(g, dx, shopTop + 4, 40, -shopTop - 4, T[2]); box(g, dx + 4, shopTop + 22, 32, -shopTop - 40, glass[1]); box(g, dx + 4, shopTop + 22, 32, 10, glass[2]); box(g, dx + 4, shopTop + 8, 32, 10, on ? '#E8A646' : glass[2]);
  box(g, dx + 30, -46, 3, 3, BRASS.map(dimmed)[4]); box(g, dx - 4, -3, 48, 3, S[2]);
  // (the deli's awning, painted flat: stripes going down to a scalloped valance)
  if (f.dress === 'deli') {
    const A = rampH('#2E6A3A', true), Wt = rampH('#F4EEE2', true);
    const ay = shopTop + 2;
    for (let x = 10, k = 0; x < dx - 8; x += 12, k++) poly(g, [[x, ay], [x + 12, ay], [x + 13, ay + 20], [x + 1, ay + 20]], (k % 2 ? Wt : A)[2]);
    box(g, 10, ay, dx - 18, 2, A[1]);
    for (let x = 10, k = 0; x < dx - 8; x += 12, k++) { g.fillStyle = (k % 2 ? Wt : A)[1]; g.beginPath(); g.arc(x + 7, ay + 20, 6, 0, Math.PI); g.fill(); }
    box(g, 10, ay - 1, dx - 18, 1, INK);
  }
  // (the pawn's three gold balls on their bracket)
  if (f.dress === 'pawn') { const Bd = BRASS.map(dimmed); box(g, w - 30, shopTop - 70, 24, 3, Bd[1]); for (const [bx, by] of [[w - 26, shopTop - 58], [w - 14, shopTop - 58], [w - 20, shopTop - 48]] as const) ball(g, bx, by, 5, Bd[3]); }
  // (the hotel's blade sign: HOTEL down it in bulbs)
  if (f.dress === 'hotel') {
    const bx = w - 30, by = -h + 30;
    box(g, bx - 2, by - 2, 28, 150, INK); box(g, bx, by, 24, 146, T[2]); box(g, bx, by, 24, 2, T[4]); box(g, bx, by, 2, 146, T[4]);
    'HOTEL'.split('').forEach((ch, i) => signText(g, ch, bx + 12, by + 26 + i * 27, bulbs(3, 3, '#FFF4C8')));
    for (const sy of [by + 20, by + 120]) { box(g, bx - 10, sy, 10, 3, INK); box(g, bx - 9, sy + 1, 9, 1, T[4]); }
  }
  // (the name over the shop; the joke under, on a card in the window)
  if (f.name && f.dress !== 'hotel') signText(g, f.name, (dx - 8) / 2 + 6, shopTop - 6, f.dress === 'deli' ? paint(12, '#F4EEE2', INK) : gate({ sx: 2, sy: 2 }, '#E8C25A', '#2A2A3A'));
  if (f.dress === 'hotel') signText(g, 'THE GRAND-ISH', (dx - 8) / 2 + 6, shopTop - 8, deco('#F2C24A', '#6A1A1A', 2));
  if (f.sub) board(g, (dx - 8) / 2 + 6, shopTop + 48, [f.sub], plain(1, 1, '#2A1A1A'), '#F2EAD8', PLY.map(dimmed), 4);
  // (the stoop's grime)
  checker(g, 0, -6, w, 4, R[1], 1, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// The western town

const paintWest = (g: Ctx, f: Front) => {
  const { w, h } = f, R = rampH(f.wall, true), Bd = BOARD.map(dimmed), body = h - 50;
  // (the false front's silhouette over the low building: stepped, peaked or squared off)
  const top: [number, number][] = f.dress === 'saloon' ? [[0, -body], [0, -h + 20], [w * 0.2, -h + 20], [w * 0.2, -h], [w * 0.8, -h], [w * 0.8, -h + 20], [w, -h + 20], [w, -body]]
    : f.dress === 'undertaker' ? [[0, -body], [0, -h + 30], [w / 2, -h - 10], [w, -h + 30], [w, -body]]
    : [[0, -body], [0, -h], [w, -h], [w, -body]];
  if (f.dress === 'bank') {
    // (the bank: dressed stone, a pediment, pilasters, arched windows, gold leaf)
    const St = rampH('#A89C88', true);
    box(g, -2, -h - 2, w + 4, h + 2, INK);
    slab(g, 0, -h, w, h, St);
    for (let y = -h + 8; y < 0; y += 12) { box(g, 0, y, w, 1, St[1]); for (let x = (y / 12) % 2 ? 0 : 24; x < w; x += 48) box(g, x, y, 1, 12, St[2]); }
    poly(g, [[-8, -h], [w / 2, -h - 40], [w + 8, -h]], INK); poly(g, [[-5, -h - 1], [w / 2, -h - 37], [w + 5, -h - 1]], St[3]); poly(g, [[w / 2, -h - 37], [w + 5, -h - 1], [w / 2, -h - 1]], St[2]);
    poly(g, [[12, -h - 4], [w / 2, -h - 28], [w - 12, -h - 4]], St[1]);
    for (const px of [10, w - 30, w / 2 - 50, w / 2 + 30]) { box(g, px - 1, -h + 4, 22, h - 4, INK); slab(g, px, -h + 4, 20, h - 4, St, false); box(g, px - 3, -h + 4, 26, 5, St[4]); }
    const glass = glassOf();
    for (const wx of [w / 2 - 84, w / 2 + 54]) { g.fillStyle = INK; g.beginPath(); g.arc(wx + 15, -110, 17, Math.PI, 0); g.fill(); box(g, wx - 2, -110, 34, 70, INK); g.fillStyle = glass[2]; g.beginPath(); g.arc(wx + 15, -110, 15, Math.PI, 0); g.fill(); box(g, wx, -110, 30, 68, glass[1]); for (let y = -104; y < -44; y += 8) box(g, wx, y, 30, 1, dimmed('#2A2A30')); }
    box(g, w / 2 - 22, -84, 44, 84, INK); box(g, w / 2 - 20, -82, 40, 82, Bd[2]); box(g, w / 2 - 20, -82, 40, 2, Bd[4]); box(g, w / 2 - 1, -82, 2, 82, Bd[0]);
    signText(g, 'BANK', w / 2, -h + 46, { sx: 3, sy: 3, serif: true, gap: 2, fill: rampDown(dimmed('#F2C24A'), 0.4), dither: true, ink: INK, shadow: INK, drop: 1 });
    if (f.sub) board(g, w / 2, -h + 66, [f.sub], plain(1, 1, '#2A1A1A'), '#E8DCC0', BRASS.map(dimmed), 4);
    return;
  }
  // (the building's low gable behind the false front, showing past its shoulders)
  poly(g, top.map(([x, y]) => [x + (x < w / 2 ? -2 : 2), y - 2] as [number, number]).concat([[w + 2, 0], [-2, 0]]), INK);
  g.save(); g.beginPath(); top.concat([[w, 0], [0, 0]]).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  battens(g, 0, -h - 20, w, h + 20, R, f.rx);
  g.restore();
  // (the cap trim along its top edge (shaded on top: not a ledge), the corner boards)
  for (let i = 0; i + 1 < top.length; i++) { const [ax, ay] = top[i], [bx, by] = top[i + 1]; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); g.strokeStyle = Bd[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay + 1); g.lineTo(bx, by + 1); g.stroke(); }
  box(g, 0, -body, 6, body, Bd[3]); box(g, w - 6, -body, 6, body, Bd[1]);
  // (the sign board across it, the name in wood)
  const sy = -h + 44;
  box(g, 10, sy - 22, w - 20, 30, INK); box(g, 12, sy - 20, w - 24, 26, dimmed('#2A1A10')); box(g, 12, sy - 20, w - 24, 2, dimmed('#4A3018'));
  if (f.name) { const L = f.name.length > 8 ? wood(dimmed('#F2E2C2'), 1, 2) : wood(dimmed('#F2E2C2')); signText(g, f.name, w / 2, sy, L); }
  // (the upstairs: a door out onto the balcony, or windows)
  const glass = glassOf(), on = lit();
  const win = (x: number, y: number, ww: number, wh: number, seed: number) => { box(g, x - 3, y - 3, ww + 6, wh + 6, INK); box(g, x - 2, y - 2, ww + 4, wh + 4, Bd[3]); box(g, x, y, ww, wh, on && hash(seed) > 0.4 ? '#C88A36' : glass[1]); box(g, x, y, ww, 8, on && hash(seed) > 0.4 ? '#E8A646' : glass[2]); box(g, x + ww / 2 - 1, y, 2, wh, Bd[1]); box(g, x, y + wh / 2 - 1, ww, 2, Bd[1]); box(g, x + 2, y, 5, wh, dimmed('#8A2A2A')); box(g, x + ww - 7, y, 5, wh, dimmed('#8A2A2A')); };
  if (f.dress === 'saloon') { box(g, w / 2 - 15, -body + 4, 30, 44, INK); box(g, w / 2 - 13, -body + 6, 26, 42, Bd[2]); box(g, w / 2 - 11, -body + 8, 22, 18, glass[1]); win(26, -body + 10, 26, 30, f.rx + 1); win(w - 52, -body + 10, 26, 30, f.rx + 2); }
  else if (f.dress !== 'undertaker') { win(28, -body + 12, 28, 30, f.rx + 3); win(w - 56, -body + 12, 28, 30, f.rx + 4); }
  // (the street floor: the doors, the windows)
  if (f.dress === 'saloon') {
    // (the batwing doors, louvered, swinging a little; the dark in there)
    const dx = w / 2;
    box(g, dx - 24, -76, 48, 76, INK); box(g, dx - 22, -74, 44, 74, on ? '#5A3A1A' : dimmed('#1A1010'));
    for (const s of [-1, 1]) { const bx = s < 0 ? dx - 21 : dx + 1; box(g, bx - 1, -58, 22, 36, INK); box(g, bx, -57, 20, 34, Bd[3]); for (let y = -54; y < -24; y += 4) box(g, bx + 2, y, 16, 2, Bd[1]); box(g, bx, -57, 20, 2, Bd[5]); }
    win(18, -70, 34, 40, f.rx + 5); win(w - 52, -70, 34, 40, f.rx + 6);
    signText(g, 'BEER', 35, -24, plain(1, 1, dimmed('#F2E2C2'))); signText(g, 'WHISKEY', w - 35, -24, plain(1, 1, dimmed('#F2E2C2')));
  } else if (f.dress === 'sheriff') {
    box(g, 30, -78, 34, 78, INK); box(g, 32, -76, 30, 76, Bd[2]); box(g, 32, -76, 30, 2, Bd[4]); box(g, 54, -40, 3, 3, BRASS.map(dimmed)[3]);
    // (the jail's window: bars)
    box(g, w - 68, -74, 50, 40, INK); box(g, w - 66, -72, 46, 36, dimmed('#1A1214')); for (let x = w - 64; x < w - 20; x += 7) box(g, x, -72, 3, 36, STEEL.map(dimmed)[3]);
    // (WANTED posters by the door: one of them Steve, yellow)
    const wanted = (x: number, y: number, steve: boolean) => {
      box(g, x - 1, y - 1, 30, 38, INK); box(g, x, y, 28, 36, steve ? dimmed(STEVE[3]) : dimmed('#E8DCB8'));
      signText(g, 'WANTED', x + 14, y + 8, plain(1, 1, dimmed('#2A1408')));
      // (the mugs: gross-ups, old photos (grossBust.ts); Steve's, and some other varmint's)
      drawBust(g, steve ? steveBust('photo', dimmed('#FFFFFF')) : tintBust(bust('lot-varmint', VARMINT, 'photo'), dimmed('#FFFFFF')), x + 3, y + 10, 22, 17, 140);
      box(g, x + 4, y + 28, 20, 1, dimmed('#6A5A40')); box(g, x + 4, y + 31, 16, 1, dimmed('#6A5A40'));
    };
    wanted(68, -76, true); wanted(98, -70, false);
  } else {
    // (the undertaker's: a door, coffins stood up out front (painted), YOUR SIZE?)
    box(g, w / 2 - 16, -72, 32, 72, INK); box(g, w / 2 - 14, -70, 28, 70, Bd[1]); box(g, w / 2 - 14, -70, 28, 2, Bd[3]);
    for (const cx of [20, w - 20]) { poly(g, [[cx - 8, -84], [cx + 8, -84], [cx + 11, -60], [cx + 6, 0], [cx - 6, 0], [cx - 11, -60]], INK); poly(g, [[cx - 7, -83], [cx + 7, -83], [cx + 10, -60], [cx + 5, -1], [cx - 5, -1], [cx - 10, -60]], Bd[2]); poly(g, [[cx - 7, -83], [cx - 3, -83], [cx - 6, -60], [cx - 3, -1], [cx - 5, -1], [cx - 10, -60]], Bd[4]); }
    signText(g, 'YOUR SIZE?', w / 2, -h + 66, plain(1, 1, dimmed('#E8DCC0')));
  }
  if (f.sub) board(g, w / 2, -body - 6, [f.sub], plain(1, 1, '#2A1A1A'), '#E8DCC0', PLY.map(dimmed), 4);
  checker(g, 0, -6, w, 4, R[1], 1, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// The fake suburb: the same house

const paintHouse = (g: Ctx, f: Front) => {
  const { w, h } = f, R = rampH(f.wall, true), Wt = rampH('#F4F0E8', true), Sh = SHINGLE.map(dimmed), Br = BRICK.map(dimmed), glass = glassOf(), on = lit();
  const eave = h - 70;
  // (the chimney, behind the roof)
  box(g, w - 54, -h - 6, 22, 60, INK); bricks(g, w - 53, -h - 5, 20, 58, Br, dimmed('#2A1A16'), f.rx); box(g, w - 56, -h - 9, 26, 5, INK); box(g, w - 55, -h - 8, 24, 3, dimmed('#6A6A6A'));
  // (the roof: shingles in staggered courses, lit up its left slope; its rake boards)
  poly(g, [[-16, -eave + 2], [w / 2, -h - 2], [w + 16, -eave + 2]], INK);
  g.save(); g.beginPath(); g.moveTo(-14, -eave); g.lineTo(w / 2, -h); g.lineTo(w + 14, -eave); g.closePath(); g.clip();
  for (let y = -h, r = 0; y < -eave; y += 5, r++) for (let x = -16 + (r % 2) * 6; x < w + 16; x += 12) { const left = x < w / 2; box(g, x, y, 11, 4, Sh[left ? (hash(x + y) > 0.7 ? 4 : 3) : (hash(x + y) > 0.7 ? 2 : 1)]); box(g, x, y + 4, 11, 1, Sh[0]); }
  g.restore();
  g.strokeStyle = Wt[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(-14, -eave); g.lineTo(w / 2, -h); g.lineTo(w + 14, -eave); g.stroke();
  // (the walls: clapboard, each board shadowed under its lap; the corner boards)
  box(g, -2, -eave - 2, w + 4, eave + 2, INK);
  for (let y = -eave, k = 0; y < 0; y += 6, k++) { box(g, 0, y, w, 6, R[k % 7 === 3 ? 4 : 3]); box(g, 0, y + 5, w, 1, R[1]); box(g, 0, y, w, 1, R[4]); }
  box(g, 0, -eave, 6, eave, Wt[3]); box(g, w - 6, -eave, 6, eave, Wt[2]); box(g, 0, -eave, 2, eave, Wt[4]);
  box(g, -8, -eave - 4, w + 16, 6, INK); box(g, -7, -eave - 3, w + 14, 4, Wt[2]); box(g, -7, -eave + 1, w + 14, 3, 'rgba(28, 16, 20, 0.35)');
  // (the gable's round window)
  g.fillStyle = INK; g.beginPath(); g.arc(w / 2, -eave - 26, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = Wt[3]; g.beginPath(); g.arc(w / 2, -eave - 26, 10, 0, Math.PI * 2); g.fill();
  g.fillStyle = on ? '#E8A646' : glass[1]; g.beginPath(); g.arc(w / 2, -eave - 26, 7, 0, Math.PI * 2); g.fill(); box(g, w / 2 - 1, -eave - 33, 2, 14, Wt[2]); box(g, w / 2 - 7, -eave - 27, 14, 2, Wt[2]);
  // (the windows: shutters, sashes, a box of flowers under the downstairs ones)
  const shut = rampH('#2E5A3A', true);
  const win = (x: number, y: number, seed: number, box2: boolean) => {
    box(g, x - 12, y - 1, 10, 36, INK); box(g, x - 11, y, 8, 34, shut[2]); for (let r = y + 2; r < y + 32; r += 3) box(g, x - 11, r, 8, 1, shut[1]);
    box(g, x + 28, y - 1, 10, 36, INK); box(g, x + 29, y, 8, 34, shut[2]); for (let r = y + 2; r < y + 32; r += 3) box(g, x + 29, r, 8, 1, shut[1]);
    box(g, x - 2, y - 2, 30, 38, INK); box(g, x - 1, y - 1, 28, 36, Wt[3]);
    const ok = on && hash(seed) > 0.35;
    box(g, x + 1, y + 1, 24, 32, ok ? '#C88A36' : glass[1]); box(g, x + 1, y + 1, 24, 10, ok ? '#E8A646' : glass[2]);
    box(g, x + 12, y + 1, 2, 32, Wt[2]); box(g, x + 1, y + 16, 24, 2, Wt[2]);
    box(g, x - 3, y + 35, 32, 3, Wt[2]);
    if (box2) { box(g, x - 2, y + 38, 30, 7, INK); box(g, x - 1, y + 39, 28, 5, dimmed('#7A4A2A')); for (let k = 0; k < 5; k++) { box(g, x + k * 6, y + 34, 4, 5, dimmed('#3A6A28')); box(g, x + 1 + k * 6, y + 33, 2, 2, dimmed(['#E84A6A', '#F2C24A', '#B85AE8'][k % 3])); } }
  };
  win(28, -84, f.rx + 3, true);
  if (w >= 200) win(78, -84, f.rx + 4, true);
  // (the front door: a fanlight over it, its panels, the knob; the lamp beside it; the number)
  const dx = w - 62;
  g.fillStyle = INK; g.beginPath(); g.arc(dx + 18, -78, 18, Math.PI, 0); g.fill(); g.fillStyle = on ? '#E8A646' : glass[2]; g.beginPath(); g.arc(dx + 18, -78, 15, Math.PI, 0); g.fill();
  for (let k = 0; k < 5; k++) { const an = Math.PI + (k + 0.5) * (Math.PI / 5); g.strokeStyle = Wt[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(dx + 18, -78); g.lineTo(dx + 18 + Math.cos(an) * 15, -78 + Math.sin(an) * 15); g.stroke(); }
  box(g, dx - 2, -78, 40, 78, INK); const Dr = rampH('#7A1E1E', true);
  box(g, dx, -76, 36, 76, Dr[3]); box(g, dx, -76, 3, 76, Dr[4]); box(g, dx + 33, -76, 3, 76, Dr[1]);
  for (const [px2, py2, ph] of [[dx + 6, -70, 26], [dx + 20, -70, 26], [dx + 6, -38, 30], [dx + 20, -38, 30]] as const) { box(g, px2, py2, 10, ph, Dr[2]); box(g, px2, py2, 10, 1, Dr[1]); box(g, px2, py2 + ph - 1, 10, 1, Dr[4]); }
  ball(g, dx + 30, -38, 2, BRASS[3]);
  box(g, dx - 14, -66, 8, 12, INK); box(g, dx - 13, -65, 6, 10, on ? '#FFF2C0' : dimmed('#E8E0C8'));
  signText(g, '1313', dx + 18, -82 - 18, plain(1, 1, BRASS.map(dimmed)[4]));
  box(g, dx - 6, -3, 48, 3, dimmed(CONCRETE[4]));
  checker(g, 0, -6, w, 4, R[1], 1, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// The real buildings

/** EXIT THROUGH THE GIFT SHOP: its floor (linoleum checker) and its back wall of shelves at FRONT_D; its side walls'
 *  insides and its ceiling going back; its front: the end posts and the fascia, its sign. */
const GIFT_H = 316;
const paintGiftWall = (g: Ctx, w: number) => {
  const R = rampH('#F2E2C2', true), Sh = rampH('#8A4A1E', true);
  box(g, -2, -GIFT_H - 2, w + 4, GIFT_H + 2, INK);
  slab(g, 0, -GIFT_H, w, GIFT_H, R);
  // (a wallpaper of little gold stars, the banner: REVENGERS: RESEMBLE PLUSH $40)
  for (let y = -GIFT_H + 10; y < -30; y += 22) for (let x = 10 + ((y / 22) % 2) * 11; x < w; x += 22) box(g, x, y, 2, 2, R[4]);
  board(g, w / 2, -GIFT_H + 36, ['REVENGERS: RESEMBLE PLUSH $40'], plain(1, 1, '#FDE68A'), '#7F1D1D', BRASS.map(dimmed), 6);
  // (shelves, stocked: plush Revengers, the shirts, mugs, snow globes, Steve's own shelf in yellow)
  const SUITS = ['#1D4ED8', '#DC2626', '#15803D', '#F59E0B', '#7E22CE'];
  for (let y = -GIFT_H + 90, r = 0; y < -40; y += 62, r++) {
    box(g, 14, y, w - 28, 5, INK); box(g, 15, y, w - 30, 4, Sh[3]); box(g, 15, y, w - 30, 1, Sh[5]); box(g, 15, y + 4, w - 30, 2, 'rgba(28, 16, 20, 0.35)');
    for (const bx of [24, w - 30]) { box(g, bx, y + 5, 4, 8, Sh[1]); }
    for (let x = 24, k = 0; x < w - 34; x += 30, k++) {
      const kind = (k + r * 2) % 5, col = dimmed(SUITS[(k + r) % SUITS.length]);
      if (kind < 2) {
        // (a plush: a fat little body, a head, a cape, the mask)
        box(g, x - 1, y - 23, 20, 23, INK); box(g, x, y - 22, 18, 22, col); box(g, x, y - 22, 5, 22, mix(col, '#FFFFFF', 0.2));
        g.fillStyle = INK; g.beginPath(); g.arc(x + 9, y - 28, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#F0C8A2'); g.beginPath(); g.arc(x + 9, y - 28, 7, 0, Math.PI * 2); g.fill();
        box(g, x + 3, y - 31, 12, 3, col); box(g, x + 5, y - 30, 2, 1, INK); box(g, x + 11, y - 30, 2, 1, INK);
      } else if (kind === 2) {
        // (a folded shirt: I READ THE SCRIPT)
        box(g, x - 1, y - 13, 24, 13, INK); box(g, x, y - 12, 22, 12, k % 2 ? dimmed('#F8FAFC') : dimmed('#18181B')); box(g, x + 6, y - 9, 10, 3, dimmed('#FDE047'));
        box(g, x - 1, y - 26, 24, 13, INK); box(g, x, y - 25, 22, 12, dimmed('#FDE047')); box(g, x + 6, y - 22, 10, 3, dimmed('#1E3A8A'));
      } else if (kind === 3) {
        // (mugs)
        for (let m = 0; m < 2; m++) { box(g, x + m * 12 - 1, y - 13, 10, 13, INK); box(g, x + m * 12, y - 12, 8, 12, dimmed(m ? '#F8FAFC' : '#DC2626')); box(g, x + m * 12 + 8, y - 9, 3, 5, INK); }
      } else {
        // (snow globes with the HAPPYWOOD hill in them)
        box(g, x + 1, y - 5, 16, 5, dimmed('#5A3A1A'));
        g.fillStyle = INK; g.beginPath(); g.arc(x + 9, y - 14, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#C8ECFF'); g.beginPath(); g.arc(x + 9, y - 14, 8, 0, Math.PI * 2); g.fill();
        box(g, x + 4, y - 13, 10, 3, dimmed('#9A8458')); box(g, x + 5, y - 18, 1, 1, '#FFFFFF'); box(g, x + 11, y - 20, 1, 1, '#FFFFFF');
      }
    }
  }
  // (Steve's own end bay: all yellow, his plush with a neck brace)
  const sx = w - 70;
  box(g, sx - 4, -150, 60, 110, INK); box(g, sx - 3, -149, 58, 108, dimmed(STEVE[2])); box(g, sx - 3, -149, 58, 2, dimmed(STEVE[4]));
  signText(g, 'STEVE', sx + 26, -138, plain(1, 1, dimmed('#2A1408')));
  for (let k = 0; k < 3; k++) { const px = sx + 6 + k * 16; box(g, px, -80, 12, 30, dimmed(STEVE[3])); box(g, px + 1, -92, 10, 12, dimmed('#E2B48C')); box(g, px, -94, 12, 4, dimmed('#8A5A2A')); box(g, px + 1, -82, 10, 2, dimmed('#F4F0E8')); }
};
const paintGiftFascia = (g: Ctx, w: number) => {
  const R = rampH('#7F1D1D'), Bd = BRASS;
  box(g, -12, -44, w + 24, 46, INK);
  box(g, -10, -42, w + 20, 42, R[3]); box(g, -10, -42, w + 20, 2, R[2]); box(g, -10, -4, w + 20, 4, R[1]);
  for (let x = -6; x < w + 8; x += 10) box(g, x, -40, 2, 2, lit() ? '#FFF2C0' : Bd[2]);
  signText(g, 'EXIT THROUGH THE GIFT SHOP', w / 2, -12, gate({ sx: 2, sy: 2 }, '#FDE68A', '#7F1D1D'));
  // (its end posts' caps)
  for (const px of [-12, w]) { box(g, px, -48, 12, 6, INK); box(g, px + 1, -47, 10, 4, Bd[3]); }
};

/** DISASTER: THE RIDE: its building's front (poured concrete, cracks painted on, a mural of every disaster, the canopy
 *  over the doors, the marquee's box (its letters live)). Its foot at (0, 0), its doors' middle at x = 160. */
const RIDE = { a: -160, w: 520, h: 380 } as const;
const paintRide = (g: Ctx) => {
  const { a, w, h } = RIDE, C = rampH('#6A625E', true), O = rampH('#C2410C', true);
  box(g, a - 2, -h - 2, w + 4, h + 2, INK);
  slab(g, a, -h, w, h, C);
  // (poured concrete: light in bands down it, dithered between; each form panel a touch its own tone, its board marks
  // across it, the tie holes in rows, lit under each lift line; rust and water run down from the ties)
  { const up = mix(C[3], C[4], 0.22), low = mix(C[3], C[2], 0.55), b1 = -h + Math.round(h * 0.3), b2 = -h + Math.round(h * 0.68);
    box(g, a + 5, -h + 2, w - 10, b1 + h - 2, up); checker(g, a + 5, b1, w - 10, 2, up, 0, 2);
    box(g, a + 5, b2 + 2, w - 10, -b2 - 8, low); checker(g, a + 5, b2, w - 10, 2, low, 0, 2);
    for (let y = -h + 30, r = 0; y < 0; y += 40, r++) for (let x = a + 60 - 80, k = 0; x < a + w; x += 80, k++) {
      const t = hash(k * 3.1 + r * 7.7);
      if (t > 0.6) checker(g, Math.max(a + 5, x + 1), y + 1, 78, 38, t > 0.8 ? C[4] : C[2], (k + r) % 2, 3);
      for (let by = y + 8; by < y + 38; by += 8) box(g, Math.max(a + 5, x + 4), by, 70, 1, mix(C[3], C[2], 0.5));
      for (const tx of [x + 16, x + 62]) if (tx > a + 6 && tx < a + w - 8) { box(g, tx, y + 18, 3, 3, C[0]); box(g, tx, y + 21, 3, 1, C[4]); if (hash(tx + y) > 0.7) for (let d = 0; d < 14; d += 2) box(g, tx + 1, y + 22 + d, 1, 2, dimmed('#7A4A2A')); }
    }
    for (let i = 0; i < (w * h) / 200; i++) box(g, a + 4 + hash(i * 1.71) * (w - 8), -h + 2 + hash(i * 2.39) * (h - 4), 1 + (i % 2), 1, i % 3 ? C[2] : C[4]);
  }
  for (let y = -h + 30; y < 0; y += 40) { box(g, a, y, w, 1, C[1]); box(g, a, y + 1, w, 1, C[4]); }
  for (let x = a + 60; x < a + w; x += 80) box(g, x, -h, 1, h, C[2]);
  // (the cracks, painted on: zigzags, lit along one side)
  for (let k = 0; k < 6; k++) { let x = a + 40 + k * 86, y = -h + 10; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (hash(k * 7 + s) - 0.5) * 30; y += 16 + hash(k + s * 3) * 14; g.lineTo(x, y); } g.stroke(); }
  // (the mural, either side of the doors: a tornado over a wave, an earthquake swallowing a bus, painted in steps)
  const mural = (mx: number, my: number, kind: number) => {
    box(g, mx - 2, my - 2, 124, 104, INK);
    const sky = [dimmed('#2A1A3A'), dimmed('#5A2A3A'), dimmed('#A8442A')];
    for (let i = 0; i < 3; i++) box(g, mx, my + i * 33, 120, 34, sky[i]);
    if (kind === 0) { for (let i = 0; i < 9; i++) { const ww = 50 - i * 5; box(g, mx + 60 - ww / 2 + Math.sin(i) * 4, my + 8 + i * 9, ww, 9, dimmed(i % 2 ? '#8A8A9A' : '#6A6A7A')); } }
    if (kind === 0) { poly(g, [[mx, my + 100], [mx + 30, my + 84], [mx + 60, my + 92], [mx + 90, my + 80], [mx + 120, my + 90], [mx + 120, my + 100]], dimmed('#1E3A6A')); return; }
    // The earthquake: the city behind leaning, the street split open, a school bus going nose first down the crack
    // (the towers: stepped, their windows; the right one leaning off, its top coming away)
    for (const [ox, ww, hh] of [[6, 18, 40], [26, 14, 30], [92, 20, 46]] as const) {
      box(g, mx + ox, my + 72 - hh, ww, hh, dimmed('#3A3044')); box(g, mx + ox, my + 72 - hh, 3, hh, dimmed('#54485E')); box(g, mx + ox + ww - 3, my + 72 - hh, 3, hh, dimmed('#2A2234'));
      for (let y = my + 76 - hh; y < my + 68; y += 6) for (let x = mx + ox + 4; x < mx + ox + ww - 4; x += 4) box(g, x, y, 2, 2, dimmed((x + y) % 3 ? '#1A1424' : '#E8B04A'));
    }
    poly(g, [[mx + 70, my + 72], [mx + 84, my + 22], [mx + 98, my + 26], [mx + 86, my + 72]], dimmed('#4A3E54'));
    poly(g, [[mx + 84, my + 22], [mx + 98, my + 26], [mx + 97, my + 30], [mx + 83, my + 26]], dimmed('#6A5E74'));
    for (let i = 0; i < 4; i++) box(g, mx + 78 + i * 2, my + 34 + i * 9, 3, 3, dimmed('#E8B04A'));
    // (the street: banded asphalt going back, the far lip of the crack lit)
    const A = ['#2A2624', '#3A3432', '#4A4440', '#5A524C'].map(dimmed);
    for (let i = 0; i < 4; i++) box(g, mx, my + 70 + i * 8, 120, 8, A[3 - i]);
    for (let x = mx + 4; x < mx + 120; x += 16) box(g, x, my + 80, 8, 2, dimmed('#C8A030'));
    // (the crack: jagged, wide at the street, deep; its walls stepped dark, the fire glowing up from the bottom)
    const crack: [number, number][] = [[mx + 36, my + 72], [mx + 46, my + 74], [mx + 54, my + 71], [mx + 66, my + 75], [mx + 76, my + 72], [mx + 90, my + 74], [mx + 78, my + 86], [mx + 70, my + 100], [mx + 58, my + 100], [mx + 50, my + 88]];
    poly(g, crack, INK);
    poly(g, [[mx + 52, my + 84], [mx + 80, my + 84], [mx + 72, my + 100], [mx + 58, my + 100]], dimmed('#5A0A04'));
    poly(g, [[mx + 58, my + 92], [mx + 74, my + 92], [mx + 71, my + 100], [mx + 60, my + 100]], dimmed('#D2380A'));
    box(g, mx + 62, my + 97, 8, 3, dimmed('#FCA526'));
    for (const [x0, x1, y] of [[36, 54, 72], [54, 76, 72], [76, 90, 73]] as const) box(g, mx + x0, my + y - 1, x1 - x0, 1, A[3]);
    // (the bus: tipped nose down into it, its back end up; banded yellow, its windows, its wheels in the air)
    const r0 = [mx + 26, my + 60], u = [0.78, 0.62], n = [0.62, -0.78];
    const q = (s: number, t: number): [number, number] => [r0[0] + u[0] * s + n[0] * t, r0[1] + u[1] * s + n[1] * t];
    const band = (s0: number, s1: number, t0: number, t1: number, col: string) => poly(g, [q(s0, t0), q(s1, t0), q(s1, t1), q(s0, t1)], col);
    band(-1, 47, -1, 17, INK);
    band(0, 46, 0, 5, dimmed('#B8780A')); band(0, 46, 5, 12, dimmed('#E8A812')); band(0, 46, 12, 16, dimmed('#FCD34D'));
    band(0, 46, 6, 7, INK);
    for (let s = 5; s < 40; s += 7) band(s, s + 5, 9, 14, dimmed('#2A3A4A'));
    for (let s = 5; s < 40; s += 7) band(s, s + 2, 13, 14, dimmed('#8AA8C0'));
    band(0, 2, 2, 14, dimmed('#7A1A10'));
    for (const s of [9, 36]) { const [wx, wy] = q(s, -1); box(g, wx - 4, wy - 4, 8, 8, INK); box(g, wx - 2, wy - 2, 4, 4, dimmed('#5A5450')); }
    // (the near lip: the street toward us, the crack running on through it narrower, over the bus's nose)
    poly(g, [[mx, my + 90], [mx + 56, my + 90], [mx + 62, my + 100], [mx, my + 100]], A[1]);
    poly(g, [[mx + 70, my + 90], [mx + 120, my + 90], [mx + 120, my + 100], [mx + 66, my + 100]], A[1]);
    box(g, mx, my + 90, 56, 1, A[3]); box(g, mx + 70, my + 90, 50, 1, A[3]);
    // (the dust and chunks coming up out of it)
    for (let i = 0; i < 6; i++) box(g, mx + 40 + i * 9, my + 64 - (i % 3) * 7, 5 - (i % 2), 4, dimmed(i % 2 ? '#6A5E54' : '#8A7E70'));
    for (let i = 0; i < 4; i++) box(g, mx + 46 + i * 11, my + 54 - (i % 2) * 6, 2, 2, dimmed('#3A3230'));
  };
  mural(a + 20, -260, 0); mural(a + w - 140, -260, 1);
  // (the marquee's box, its frame; DISASTER: and THE RIDE go on it live)
  box(g, -122, -h + 18, 484, 94, INK); box(g, -120, -h + 20, 480, 90, '#1C1917'); box(g, -120, -h + 20, 480, 2, '#3A3432');
  box(g, -122, -h + 108, 484, 4, O[3]); box(g, -122, -h + 108, 484, 1, O[5]);
  signText(g, 'FEEL THE FURY OF NATURE (MILDLY)', 120, -h + 132, plain(1, 1, dimmed('#E7E5E4')));
  // (the canopy over the doors: orange, its edge banded, its underside in the dark)
  box(g, 50, -150, 220, 16, INK); box(g, 52, -148, 216, 12, O[3]); box(g, 52, -148, 216, 2, O[5]); box(g, 52, -138, 216, 2, O[1]);
  for (let x = 56; x < 266; x += 12) box(g, x, -140, 6, 2, lit() ? '#FFE8A8' : O[2]);
  // (the doors: black, double, push bars; ENTER over them)
  box(g, 108, -132, 104, 132, INK); box(g, 110, -130, 100, 130, '#0C0A09');
  for (const dx of [112, 162]) { box(g, dx, -128, 46, 128, '#1C1917'); box(g, dx, -128, 2, 128, '#3A3432'); box(g, dx + 6, -70, 34, 3, '#57534E'); box(g, dx + 6, -70, 34, 1, '#A8A29E'); }
  box(g, 158, -130, 4, 130, '#57534E');
  signText(g, 'ENTER', 160, -114, plain(1, 1, '#F97316'));
};

/** The warehouse's far wall, smashed out by the bulldozer: corrugated siding (lit rib by rib), its girt lines, the roof's
 *  edge, the jagged hole (the stage's dark in there going back, the green screen glimpsed, a light still on), siding torn
 *  outward and rebar with it, NO ENTRY up on the wall. Drawn at the play plane, world coordinates. */
const wallBreak = (c: Ctx, v: View) => {
  const wx = X(BREAK.x), top = GY - 360, left = X(-600);
  const S = SIDING.map(col => hour(col, 0.12)), eye = v.eye;
  // (its side going back from the corner: corrugated, darker)
  sideBack(c, eye, wx, 1, top, GY, 1, FRONT_D - 0.05, S, 4);
  // (its face)
  box(c, left, top - 2, wx - left + 2, GY - top + 2, INK);
  corrugated(c, left, top, wx - left, GY - top, S);
  for (const gy of [top + 70, top + 160, top + 250]) { box(c, left, gy, wx - left, 2, S[0]); box(c, left, gy + 2, wx - left, 1, S[4]); }
  box(c, left, top, wx - left, 8, S[1]); box(c, left, top, wx - left, 2, S[5]); box(c, left - 4, top - 8, wx - left + 10, 8, INK); box(c, left - 3, top - 7, wx - left + 8, 6, S[2]); box(c, left - 3, top - 7, wx - left + 8, 1, S[4]);
  box(c, wx - 6, top, 6, GY - top, S[1]);
  // (the hole: jagged, from the ground up; inside, the stage's dark banded back, the green screen, a work light)
  const ha = X(BREAK.a), hb = X(BREAK.b), ht = GY - BREAK.top, n = 10;
  const edge: [number, number][] = [[ha, GY]];
  for (let k = 0; k <= n; k++) { const x = ha + ((hb - ha) * k) / n; edge.push([x, ht + ((k * 37) % 5) * 9 + (k === 0 || k === n ? 40 : 0) - (k % 3 === 1 ? 6 : 0)]); }
  edge.push([hb + 6, GY]);
  poly(c, edge.map(([x, y]) => [x + (x < (ha + hb) / 2 ? -2 : 2), y - 2] as [number, number]), INK);
  c.save(); c.beginPath(); edge.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  const dk = ['#2A2630', '#1A1820', '#0E0C12', '#060508'];
  for (let i = 0; i < 4; i++) box(c, ha - 10, ht - 10 + i * ((GY - ht) / 4), hb - ha + 30, (GY - ht) / 4 + 2, dk[3 - i]);
  box(c, ha + 14, ht + 54, 52, 110, '#0B4419'); box(c, ha + 16, ht + 56, 48, 106, '#126224'); checker(c, ha + 16, ht + 56, 48, 106, '#188030', 0, 2); box(c, ha + 16, ht + 56, 48, 2, '#22A040');
  box(c, ha + 44, ht + 40, 10, 8, '#28282F'); box(c, ha + 45, ht + 41, 8, 6, '#FFF2C0');
  c.fillStyle = 'rgba(255, 242, 192, 0.12)'; c.beginPath(); c.moveTo(ha + 45, ht + 48); c.lineTo(ha + 10, GY); c.lineTo(ha + 90, GY); c.lineTo(ha + 53, ht + 48); c.closePath(); c.fill();
  // (the stage floor going back in there)
  box(c, ha - 10, GY - 24, hb - ha + 30, 24, '#151318'); box(c, ha - 10, GY - 24, hb - ha + 30, 1, '#34303A');
  c.restore();
  // (the siding round the hole: bent, torn out toward us, its ribs; rebar bent out with it)
  for (const [y, l, s] of [[ht + 10, 50, 1], [ht + 74, 38, 1], [ht + 140, 56, 1], [ht + 40, 26, -1]] as const) {
    const ex = s > 0 ? hb : ha;
    poly(c, [[ex, y - 1], [ex + s * (l + 2), y + 15], [ex + s * (l - 5), y + 30], [ex, y + 20]], INK);
    poly(c, [[ex, y], [ex + s * l, y + 16], [ex + s * (l - 6), y + 28], [ex, y + 18]], S[3]);
    poly(c, [[ex, y], [ex + s * l, y + 16], [ex + s * (l - 2), y + 19], [ex, y + 4]], S[5]);
  }
  c.lineCap = 'round';
  for (const y of [ht + 30, ht + 100, ht + 170]) { c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(hb - 4, y); c.quadraticCurveTo(hb + 20, y - 10, hb + 34, y + 12); c.stroke(); c.strokeStyle = '#8A3A1A'; c.lineWidth = 2; c.beginPath(); c.moveTo(hb - 4, y); c.quadraticCurveTo(hb + 20, y - 10, hb + 34, y + 12); c.stroke(); }
  c.lineCap = 'butt';
  // (NO ENTRY / CLOSED SET: a board bolted to the wall over the hole)
  board(c, X(42), top + 34, ['NO ENTRY', 'CLOSED SET'], { sx: 1, sy: 1, fill: '#C8302A', stencil: true }, '#F4F0E8', STEEL, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// Putting them down

interface Piece { x0: number; x1: number; top: number; braced: boolean; draw: () => void }

export const drawLotFronts = (c: Ctx, v: View) => {
  const eye = v.eye, pieces: Piece[] = [];
  for (const f of LOT_FRONTS) {
    const x0 = X(f.rx), x1 = x0 + f.w;
    const paintIt = f.kind === 'ny' ? (g: Ctx) => paintNY(g, f) : f.kind === 'west' ? (g: Ctx) => paintWest(g, f) : (g: Ctx) => paintHouse(g, f);
    const top = f.kind === 'house' ? GY - f.h + 70 : f.kind === 'west' ? GY - f.h + 30 : GY - f.h;
    pieces.push({ x0, x1, top, braced: true, draw: () => atDepth(c, eye, FRONT_D, () => still(c, `lot-front-${f.rx}`, x0, GY, -40, -f.h - 110, f.w + 80, f.h + 112, paintIt)) });
  }
  // (DISASTER: THE RIDE's building: a real one, its sides going back)
  const rx = X(RIDE_DOORS);
  pieces.push({ x0: rx + RIDE.a, x1: rx + RIDE.a + RIDE.w, top: GY - RIDE.h, braced: false, draw: () => {
    const C = rampH('#6A625E', true);
    for (const [e, s] of [[rx + RIDE.a, -1], [rx + RIDE.a + RIDE.w, 1]] as const) sideBack(c, eye, e, s, GY - RIDE.h, GY, FRONT_D, 0.8, C, 3);
    atDepth(c, eye, FRONT_D, () => still(c, 'lot-ride', rx, GY, RIDE.a - 10, -RIDE.h - 10, RIDE.w + 20, RIDE.h + 12, paintRide));
  } });
  const on = pieces.filter(p => seen(v, p.x0 - 60, p.x1 + 60, FRONT_D, 120));
  on.sort((p, q) => Math.abs((q.x0 + q.x1) / 2 - eye.x) - Math.abs((p.x0 + p.x1) / 2 - eye.x));
  for (const p of on) { if (p.braced) bracing(c, eye, p.x0, p.x1, p.top); p.draw(); }
};

/** The marquee's letters (live: the bulbs chase), at its depth. */
export const drawRideMarquee = (c: Ctx, v: View, f: number) => {
  const rx = X(RIDE_DOORS);
  if (!seen(v, rx - 200, rx + 400, FRONT_D)) return;
  atDepth(c, v.eye, FRONT_D, () => {
    signText(c, 'DISASTER:', rx + 120, GY - RIDE.h + 62, bulbs(3, 3, '#F97316', f % 40 < 30));
    signText(c, 'THE RIDE', rx + 120, GY - RIDE.h + 100, gate({ sx: 3, sy: 3 }, '#FDE047', '#7C2D12'));
  });
};
export const rideGlow = (v: View) => at(v.eye, X(RIDE_DOORS) + 120, GY - RIDE.h + 70, FRONT_D);

/** The gift shop: its floor and back wall, its sides and ceiling going back, its posts and fascia at the front. */
export const drawGiftShop = (c: Ctx, v: View) => {
  const a = X(GIFT.a), b = X(GIFT.b), eye = v.eye;
  if (!seen(v, a - 60, b + 60)) return;
  // (the floor in there: black and white linoleum going back)
  for (let i = 0; i < 6; i++) {
    const p = 0.99 - (0.99 - FRONT_D) * (i / 6), q = 0.99 - (0.99 - FRONT_D) * ((i + 1) / 6);
    for (let x = a, k = 0; x < b; x += 30, k++) poly(c, [at(eye, x, GY, p), at(eye, Math.min(b, x + 30), GY, p), at(eye, Math.min(b, x + 30), GY, q), at(eye, x, GY, q)], hour((k + i) % 2 ? '#E8E2D4' : '#2A2228', 0.2));
  }
  atDepth(c, eye, FRONT_D, () => still(c, 'lot-giftwall', a, GY, -4, -GIFT_H - 4, b - a + 8, GIFT_H + 6, g => paintGiftWall(g, b - a)));
  // (the side walls' insides, the ceiling, going back)
  const In = rampH('#E8D8B8', true), Cl = rampH('#C8B898', true);
  underBack(c, eye, a, b, GY - GIFT_H, 1, FRONT_D, Cl, 4);
  sideBack(c, eye, a, 1, GY - GIFT_H, GY, 1, FRONT_D, In, 4, false);
  sideBack(c, eye, b, -1, GY - GIFT_H, GY, 1, FRONT_D, In, 4, false);
};
/** The gift shop's front (at the play plane: after what stands in front of its back wall): its posts, the fascia. */
export const drawGiftFront = (c: Ctx, v: View) => {
  const a = X(GIFT.a), b = X(GIFT.b);
  if (!seen(v, a - 60, b + 60)) return;
  const P = ramp6(hour('#7F1D1D'));
  for (const px of [a - 12, b]) { box(c, px - 1, GY - GIFT_H, 14, GIFT_H, INK); box(c, px, GY - GIFT_H, 12, GIFT_H, P[3]); box(c, px, GY - GIFT_H, 3, GIFT_H, P[4]); box(c, px + 9, GY - GIFT_H, 3, GIFT_H, P[1]); }
  still(c, `lot-giftfascia-${b - a}`, a, GY - GIFT_H, -16, -52, b - a + 32, 54, g => paintGiftFascia(g, b - a));
};

/** The warehouse's smashed far wall (at the start). */
export const drawWallBreak = (c: Ctx, v: View) => { if (seen(v, X(-600), X(BREAK.x) + 60)) wallBreak(c, v); };

void PLY; void timeOfDay; void signW; void BOARD;
