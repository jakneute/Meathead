// The walk-away from Donnie Dracula (Spooky Land's boss): back down the town's street toward the camera at whatever
// hour it is now (timeOfDay.ts: its look was painted for night, and goes by day and dusk too). The same Victorian street
// he crossed coming in (spooky/town/art.ts): its shopfronts shoulder to shoulder down both sides (steep gables with
// their finials, bay windows, balconies with their lit lips, the boards over the doors: APOTHECARY - NOW WITH
// DRIVE-THRU and the rest), their signs hung out over the sidewalk, its gas lamps (FREE WI-FI) along the curbs, its
// cobbles. At the street's far end, the wrecked ELEVATOR TO HELL clock tower: leaning, its support beams snapped, the
// clock face cracked and stopped, the cable snapped and hanging, a little smoke and a hellish red glow at its foot (and
// now and then another car, still being sent, dropping in). In the foreground, a little of the ballroom's carnage:
// gift-shop junk strewn about, a dropped HELLO MY NAME IS DONNIE sticker; killed by his weakness, a trail of his ash.
// His new toy: the SOUL SUCKER.
//
// The street's walls are drawn the SNES's raycast way: a column of the picture at a time, each column one slice of a
// strip of shopfronts painted once (at each of its distances' mip levels and fog steps), at the distance that column's
// bit of wall is at. One eye for the lot (the ground's), straight walls, every shop's look keyed to which shop it is.

import { type Ctx, type Prop, type SceneDef, INK, LW, HOR, F, CAM_H, VP_X, ME_X, SPEED, box, hash, lump, rampOf, stipple, smoke, fire, project } from './kit';
import { canvas, gradeOf, hazeOf, spriteOf, fogAt, wobble } from './screen';
import { timeOfDay, hourMix, drawStars, drawMoon } from '../timeOfDay';

const LAMP = '#FDE68A';
/** The town's sign boards (spooky/town/art.ts). */
const BOARD = '#1E1036', BOARD_INK = '#E9D5FF';
const fontIn = () => (typeof document !== 'undefined' && document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
const font = (px: number) => `${px}px "Press Start 2P"`;

/** Words, centered on x, their baseline at y. */
const say = (g: Ctx, s: string, x: number, y: number, col: string, size: number) => {
  g.font = font(size); g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = col; g.fillText(s, Math.round(x), Math.round(y)); g.textAlign = 'left';
};
/** The biggest of the sizes the words fit `w` at. */
const fit = (g: Ctx, lines: string[], w: number, sizes = [8, 7, 6, 5]) => {
  for (const z of sizes) { g.font = font(z); if (lines.every(l => g.measureText(l).width <= w)) return z; }
  return sizes[sizes.length - 1];
};
/** A town board: inked, its lit top edge, its words (a line or two), its middle at (x, y); fits `maxW`. */
const board = (g: Ctx, x: number, y: number, lines: string[], maxW: number, bg = BOARD, ink = BOARD_INK) => {
  const z = fit(g, lines, maxW - 8);
  g.font = font(z);
  const w = Math.min(maxW, Math.max(...lines.map(l => g.measureText(l).width)) + 8), h = lines.length * (z + 3) + 5;
  const x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2);
  box(g, x0 - 1, y0 - 1, w + 2, h + 2, INK); box(g, x0, y0, w, h, bg); box(g, x0, y0, w, 1, '#3B2A5E'); box(g, x0, y0 + h - 1, w, 1, '#120A22');
  lines.forEach((l, i) => say(g, l, x, y0 + 3 + (i + 1) * (z + 3) - 2, ink, z));
};

// ---------------------------------------------------------------------------------------------------------------
// The street's measures (meters; x across from the eye, the path's middle at ME_X)

/** The roadway's half-width (cobbles), the curb, the shopfronts' line (the walls), and the walls' painted height. */
const ROAD = 3.5, WALK = 7, WALL_H = 10;
const XL = ME_X - WALK, XR = ME_X + WALK;
/** The lamps, just in from the curb (both sides, a lamp every LAMP_GAP m). */
const LAMP_X = 3.9, LAMP_GAP = 10;
/** Where the street ends (m): its last shops' corners, the tower standing past them in the square. */
const D_END = 60;

// ---------------------------------------------------------------------------------------------------------------
// The ground: the town's cobbles (STONE, its seams), the curbs' lit lip, the sidewalks' flags, dead leaves, puddles

const ground = (g: Ctx, w: number, h: number) => {
  const m = w / 2, ppm = 16, road = ROAD * ppm, walk = WALK * ppm + 4;
  box(g, 0, 0, w, h, '#1C1826');
  // (the cobbles, every one: rows staggered, a dark seam round each, a lit top edge)
  box(g, m - road, 0, road * 2, h, '#2A2533');
  for (let y = 0; y < h; y += 6) for (let x = m - road + ((y / 6) % 2) * 4; x < m + road - 1; x += 8) {
    const tone = ['#3F3A4A', '#463F52', '#38323F', '#423C4E'][Math.floor(x * 7 + y * 3) % 4];
    box(g, x + 1, y + 1, Math.min(7, m + road - x - 1), 4, tone); box(g, x + 1, y + 1, Math.min(7, m + road - x - 1), 1, '#5A5368');
  }
  for (const sd of [-1, 1]) {
    // (the gutter, the curb: its lit lip, the town's)
    const gx = sd < 0 ? m - road - 2 : m + road;
    box(g, gx, 0, 2, h, '#16121E');
    const cx = sd < 0 ? m - road - 6 : m + road + 2;
    box(g, cx, 0, 4, h, '#4A4458'); box(g, sd < 0 ? cx + 3 : cx, 0, 1, h, '#9A93AE');
    for (let y = 0; y < h; y += 16) box(g, cx, y, 4, 1, '#2E2938');
    // (the sidewalk: big flags, seamed, each its own tone)
    const x0 = sd < 0 ? m - walk : m + road + 6, x1 = sd < 0 ? m - road - 6 : m + walk;
    box(g, x0, 0, x1 - x0, h, '#2E2938');
    for (let y = 0, r = 0; y < h; y += 12, r++) for (let x = x0 + (r % 2) * 7, k = 0; x < x1; x += 14, k++) {
      const ww = Math.min(13, x1 - x - 1);
      if (ww < 2) continue;
      box(g, x, y, ww, 11, ['#4A4458', '#443E52', '#504A5E'][(k + r * 2) % 3]); box(g, x, y, ww, 1, '#5E5870');
    }
  }
  // (puddles on the road, the sky in them)
  for (let i = 0; i < 8; i++) {
    const x = m + (hash(i * 5.3) - 0.5) * road * 1.6, y = hash(i * 8.7) * h;
    g.fillStyle = '#1E1B33'; g.beginPath(); g.ellipse(Math.round(x), Math.round(y), 6 + hash(i) * 9, 2 + hash(i + 3) * 2, 0, 0, Math.PI * 2); g.fill();
    box(g, x - 3, y - 1, 6, 1, '#6E66A0');
  }
  // (dead leaves, blown into the gutters mostly; soot and ash from the tower)
  for (let i = 0; i < 90; i++) {
    const sd = i % 2 ? 1 : -1, x = m + sd * (road - 4 + hash(i * 2.3) * (i % 3 ? 8 : 60)), y = hash(i * 4.1) * h;
    box(g, x, y, 2, 1, ['#7C2D12', '#9A3412', '#713F12'][i % 3]); if (i % 4 === 0) box(g, x + 1, y + 1, 1, 1, '#451A03');
  }
  for (let i = 0; i < 200; i++) box(g, hash(i * 1.9) * w, hash(i * 3.7) * h, 1, 1, i % 3 ? '#1A1626' : '#6B6478');
};

// ---------------------------------------------------------------------------------------------------------------
// The shopfronts: the town's, both sides of the street (their walls the town's purples, lifted a step: it's them we're
// looking at here, not past). Each shop's look keyed to which shop it is.

type Goods = 'bottles' | 'potions' | 'candles' | 'crystal' | 'smoothie' | 'gifts' | 'arcade' | 'atm' | 'cafe';
interface Shop {
  /** The board over the door (a line or two), and the sign hung out over the sidewalk. */
  board: string[]; blade: string;
  /** Its frontage (m), its wall, where its gable starts (m up), what's in its windows. */
  w: number; wall: string; eave: number; goods: Goods;
  bay?: boolean; balcony?: boolean; crypt?: boolean;
}
/** The left side (the side the sights are on: the most of it in view), near to far. */
const LEFT: Shop[] = [
  { board: ['APOTHECARY', 'NOW WITH DRIVE-THRU'], blade: 'APOTHECARY', w: 7.5, wall: '#4A3A5E', eave: 6.6, goods: 'bottles', bay: true },
  { board: ['POTION SHOPPE', 'TAP TO PAY'], blade: 'POTIONS', w: 6.5, wall: '#3E3550', eave: 7.2, goods: 'potions', balcony: true },
  { board: ['CANDLES', '(BATTERY OPERATED)'], blade: 'CANDLES', w: 6, wall: '#523A52', eave: 6.2, goods: 'candles' },
  { board: ['FORTUNES TOLD', 'CARDS ACCEPTED'], blade: 'FORTUNES', w: 7, wall: '#3A3A58', eave: 6.9, goods: 'crystal', bay: true },
  { board: ['YE OLDE SMOOTHIE BAR'], blade: 'SMOOTHIES', w: 8, wall: '#4C3448', eave: 6.4, goods: 'smoothie', balcony: true },
];
/** The right side (seen steeply: most of it far), near to far. */
const RIGHT: Shop[] = [
  { board: ['CURSED GIFTS', '& SUNSCREEN'], blade: 'GIFTS', w: 7, wall: '#4A3A5E', eave: 6.5, goods: 'gifts', balcony: true },
  { board: ['CRYPT-O ATM', 'FEES APPLY'], blade: 'ATM', w: 5, wall: '#57534E', eave: 4.6, goods: 'atm', crypt: true },
  { board: ['THE GRAND ARCADE', 'NO LOITERING'], blade: 'ARCADE', w: 8.5, wall: '#3E3550', eave: 7, goods: 'arcade', bay: true },
  { board: ['COFFIN CAFE', 'OAT MILK EXTRA'], blade: 'CAFE', w: 6.5, wall: '#523A52', eave: 6.3, goods: 'cafe' },
];
const lenOf = (shops: Shop[]) => shops.reduce((a, s) => a + s.w, 0);

const WP = 20, TEX_H = WALL_H * WP;
/** A window's glass: dull sky by day, lamplit (dim, warm) after dark; or dark. */
const glassLit = () => hourMix('#5A6280', '#A87838', '#B8843E');
const glassDark = () => hourMix('#3A4058', '#2A2238', '#160F22');

/** What's in a shop window (x, y its top-left, w x h, px). */
const goods = (g: Ctx, kind: Goods, x: number, y: number, w: number, h: number, seed: number) => {
  const shelf = (yy: number) => box(g, x, yy, w, 1, '#3F2A1A');
  switch (kind) {
    case 'bottles': for (let r = 0; r < 2; r++) { shelf(y + h * (0.45 + r * 0.45)); for (let i = 0; i < w / 5 - 1; i++) { const col = ['#15803D', '#7C2D12', '#1D4ED8', '#A16207'][(i + r + seed) % 4]; box(g, x + 2 + i * 5, y + h * (0.45 + r * 0.45) - 6, 3, 6, col); box(g, x + 3 + i * 5, y + h * (0.45 + r * 0.45) - 8, 1, 2, col); } } break;
    case 'potions': shelf(y + h * 0.8); for (let i = 0; i < w / 7; i++) { const col = ['#65A30D', '#9333EA', '#DB2777'][(i + seed) % 3]; g.fillStyle = INK; g.beginPath(); g.arc(x + 4 + i * 7, y + h * 0.8 - 3, 3.5, 0, Math.PI * 2); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(x + 4 + i * 7, y + h * 0.8 - 3, 2.5, 0, Math.PI * 2); g.fill(); box(g, x + 3 + i * 7, y + h * 0.8 - 9, 2, 3, '#A8A29E'); } break;
    case 'candles': shelf(y + h * 0.85); for (let i = 0; i < w / 5; i++) { const ch = 6 + ((i * 3 + seed) % 4) * 2; box(g, x + 2 + i * 5, y + h * 0.85 - ch, 3, ch, '#E7E5E4'); box(g, x + 3 + i * 5, y + h * 0.85 - ch - 2, 1, 2, '#22D3EE'); } break;
    case 'crystal': lump(g, x + w / 2, y + h * 0.55, 6, 6, ['#3B0764', '#6D28D9', '#8B5CF6', '#C4B5FD', '#FFFFFF']); box(g, x + w / 2 - 5, y + h * 0.55 + 6, 10, 3, '#3F2A1A'); for (let i = 0; i < 3; i++) box(g, x + 3 + i * 4, y + h * 0.82, 3, 5, ['#F8FAFC', '#DC2626', '#F8FAFC'][i]); break;
    case 'smoothie': shelf(y + h * 0.8); for (let i = 0; i < w / 7; i++) { box(g, x + 2 + i * 7, y + h * 0.8 - 9, 5, 9, ['#65A30D', '#DB2777', '#F59E0B'][(i + seed) % 3]); box(g, x + 5 + i * 7, y + h * 0.8 - 13, 1, 4, '#F8FAFC'); } break;
    case 'gifts': shelf(y + h * 0.8); for (let i = 0; i < w / 7; i++) { if (i % 2) { box(g, x + 2 + i * 7, y + h * 0.8 - 6, 5, 6, '#E7E5E4'); box(g, x + 3 + i * 7, y + h * 0.8 - 5, 1, 1, INK); box(g, x + 5 + i * 7, y + h * 0.8 - 5, 1, 1, INK); } else { box(g, x + 2 + i * 7, y + h * 0.8 - 9, 4, 9, '#FDE047'); box(g, x + 2 + i * 7, y + h * 0.8 - 6, 4, 2, '#F97316'); } } break;
    case 'arcade': for (let i = 0; i < w / 9; i++) { box(g, x + 2 + i * 9, y + h * 0.3, 7, h * 0.7, '#18181B'); box(g, x + 3 + i * 9, y + h * 0.35, 5, 5, ['#22D3EE', '#A3E635', '#F472B6'][(i + seed) % 3]); } break;
    case 'cafe': shelf(y + h * 0.8); box(g, x + 2, y + h * 0.8 - 5, 12, 5, '#4A2C1A'); box(g, x + 3, y + h * 0.8 - 4, 10, 1, '#A16207'); for (let i = 0; i < 3; i++) box(g, x + w - 6 - i * 5, y + h * 0.8 - 5, 3, 5, '#F8FAFC'); break;
    case 'atm': break;
  }
};

/** A pointed (gothic) window: ink round it, its glass, the trim's cross, its pointed top; lit or not. */
const gothic = (g: Ctx, x: number, y: number, w: number, h: number, trim: string, lit: boolean) => {
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 1, y + h + 1); g.lineTo(x - 1, y + w * 0.5); g.lineTo(x + w / 2, y - w * 0.3 - 1); g.lineTo(x + w + 1, y + w * 0.5); g.lineTo(x + w + 1, y + h + 1); g.closePath(); g.fill();
  g.fillStyle = lit ? glassLit() : glassDark(); g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w * 0.5); g.lineTo(x + w / 2, y - w * 0.3); g.lineTo(x + w, y + w * 0.5); g.lineTo(x + w, y + h); g.closePath(); g.fill();
  box(g, x + w / 2 - 1, y, 2, h, trim); box(g, x, y + h * 0.45, w, 2, trim);
  box(g, x - 2, y + h + 1, w + 4, 2, trim); box(g, x - 2, y + h + 3, w + 4, 1, INK);
  if (lit) box(g, x + 1, y + w * 0.5, 2, 2, lit ? '#E8C27A' : trim);
};

/** One shop's front, painted into the strip at x0 (w px wide). */
const paintShop = (g: Ctx, x0: number, w: number, s: Shop, i: number) => {
  const Y = (m: number) => TEX_H - m * WP;
  const R = rampOf(s.wall), trim = s.crypt ? '#78716C' : '#6A587E', trimLit = s.crypt ? '#A8A29E' : '#8E7AA6';
  const eave = Y(s.eave), peak = Math.max(4, Y(s.eave + (w / WP) * 0.38));
  const lit = (k: number) => hash(i * 7.3 + k * 1.7) > 0.45;
  // The gable (the town's steep one), its finial; a chimney behind it
  if (!s.crypt) {
    box(g, x0 + w * 0.72, peak + (eave - peak) * 0.35, 8, eave - peak, INK); box(g, x0 + w * 0.72 + 1, peak + (eave - peak) * 0.35 + 1, 6, eave - peak, R[1]); box(g, x0 + w * 0.72 - 1, peak + (eave - peak) * 0.35, 10, 3, R[0]);
  }
  g.fillStyle = INK; g.beginPath(); g.moveTo(x0, eave + 1); g.lineTo(x0 + w / 2, peak - 1); g.lineTo(x0 + w, eave + 1); g.closePath(); g.fill();
  g.fillStyle = R[2]; g.beginPath(); g.moveTo(x0 + 2, eave); g.lineTo(x0 + w / 2, peak + 2); g.lineTo(x0 + w - 2, eave); g.closePath(); g.fill();
  // (the bargeboards: trim along the slopes, lit along the top; stepped)
  for (let k = 0; k < w / 2; k += 2) {
    const yy = eave - ((peak - eave) * -1) * (k / (w / 2));
    box(g, x0 + k, yy - 1, 2, 3, trim); box(g, x0 + w - k - 2, yy - 1, 2, 3, trim); box(g, x0 + k, yy - 1, 2, 1, trimLit); box(g, x0 + w - k - 2, yy - 1, 2, 1, trimLit);
  }
  box(g, x0 + w / 2 - 1, peak - 12, 2, 12, INK); box(g, x0 + w / 2 - 2, peak - 13, 4, 3, INK);
  // (the attic window, up in the gable, round-topped)
  if (!s.crypt) gothic(g, x0 + w / 2 - 6, (eave + peak) / 2 - 2, 12, 16, trim, lit(9));
  // The wall: stepped (lit at its left, shaded at its right), grime stippled up from the foot
  box(g, x0, eave, w, TEX_H - eave, R[2]);
  box(g, x0, eave, 2, TEX_H - eave, R[3]); box(g, x0 + w - 3, eave, 3, TEX_H - eave, R[1]); box(g, x0 + w - 1, eave, 1, TEX_H - eave, INK);
  g.fillStyle = stipple(g, R[1]); g.fillRect(x0 + 2, Y(1.6), w - 5, Y(0) - Y(1.6));
  // (the cornice under the gable: a ledge, dentils under it, the shadow under that)
  box(g, x0 - 1, eave, w + 2, 4, trim); box(g, x0 - 1, eave, w + 2, 1, trimLit);
  for (let x = x0 + 2; x < x0 + w - 2; x += 4) box(g, x, eave + 4, 2, 2, trim);
  g.fillStyle = stipple(g, R[0]); g.fillRect(x0 + 2, eave + 6, w - 5, 3);
  if (s.crypt) {
    // The crypt with the ATM in it (the town's): stone, its columns, the black doorway, the cyan screen
    for (const cx of [x0 + 8, x0 + w - 18]) { box(g, cx - 1, eave + 6, 12, Y(0) - eave - 6, INK); box(g, cx, eave + 6, 10, Y(0) - eave - 6, R[3]); box(g, cx + 7, eave + 6, 3, Y(0) - eave - 6, R[1]); }
    const dx = x0 + w / 2 - 16;
    box(g, dx - 1, Y(3) - 1, 34, Y(0) - Y(3) + 1, INK); box(g, dx, Y(3), 32, Y(0) - Y(3), '#120E18');
    box(g, dx + 6, Y(2.2), 20, 13, INK); box(g, dx + 7, Y(2.2) + 1, 18, 11, '#22D3EE'); box(g, dx + 9, Y(2.2) + 3, 14, 2, '#0E7490');
    box(g, dx + 8, Y(1.3), 16, 8, '#52525B'); for (let k = 0; k < 3; k++) box(g, dx + 10 + k * 5, Y(1.3) + 2, 3, 2, '#D4D4D8');
    board(g, x0 + w / 2, Y(3.6), s.board, w - 6, '#0C4A6E', '#BAE6FD');
    return;
  }
  // Up a floor: a bay window (out from the wall: its sides shaded, its own little roof), or a row of the town's
  // pointed windows; a balcony along some, the town's (its lit lip: it reads as a ledge, and it is one in the town)
  const f2 = Y(5.6), f2h = Y(4.1) - f2;
  if (s.bay) {
    const bw = Math.min(w * 0.5, 64), bx = x0 + (w - bw) / 2;
    box(g, bx - 1, f2 - 6, bw + 2, f2h + 14, INK); box(g, bx, f2 - 5, bw, f2h + 12, R[3]);
    box(g, bx, f2 - 5, 6, f2h + 12, R[4]); box(g, bx + bw - 6, f2 - 5, 6, f2h + 12, R[1]);
    for (let k = 0; k < 3; k++) { const wx = bx + 8 + k * ((bw - 16) / 3); box(g, wx, f2, (bw - 16) / 3 - 3, f2h - 2, INK); box(g, wx + 1, f2 + 1, (bw - 16) / 3 - 5, f2h - 4, lit(k) ? glassLit() : glassDark()); }
    g.fillStyle = INK; g.beginPath(); g.moveTo(bx - 3, f2 - 5); g.lineTo(bx + bw / 2, f2 - 14); g.lineTo(bx + bw + 3, f2 - 5); g.closePath(); g.fill();
    box(g, bx - 2, f2 - 6, bw + 4, 2, trimLit);
    box(g, bx + 2, f2 + f2h + 7, bw - 4, 2, R[0]);
    for (const wx of [x0 + 8, x0 + w - 20]) if (wx + 12 < bx || wx > bx + bw) gothic(g, wx, f2 + 4, 12, f2h - 6, trim, lit(wx));
  } else {
    const n = Math.max(2, Math.floor((w - 12) / 26));
    for (let k = 0; k < n; k++) gothic(g, x0 + 10 + k * ((w - 20) / n) + ((w - 20) / n - 14) / 2, f2 + 4, 14, f2h - 4, trim, lit(k + 3));
  }
  if (s.balcony) {
    const by = Y(4);
    // (the rail, its posts, then the floor's lip, lit: the town's ledge colors)
    box(g, x0 + 3, by - 18, w - 6, 2, '#27272A'); for (let x = x0 + 4; x < x0 + w - 4; x += 6) box(g, x, by - 18, 1, 18, '#27272A');
    box(g, x0 + 2, by, w - 4, 5, '#57483A'); box(g, x0 + 2, by - 1, w - 4, 2, '#D6B98A'); box(g, x0 + 2, by + 5, w - 4, 1, INK);
    for (const bx of [x0 + 6, x0 + w - 12]) { g.fillStyle = '#3F3428'; g.beginPath(); g.moveTo(bx, by + 5); g.lineTo(bx + 6, by + 5); g.lineTo(bx + (bx < x0 + w / 2 ? 0 : 6), by + 14); g.closePath(); g.fill(); }
  }
  // The shopfront: the board over the door (the town's), the door (pointed, dark), the display windows (what they sell)
  const sf = Y(3.2), door = 20, dx = x0 + w / 2 - door / 2;
  box(g, x0 + 3, sf, w - 6, Y(0) - sf, R[1]);
  box(g, x0 + 3, sf, w - 6, 1, R[0]);
  board(g, x0 + w / 2, Y(2.95), s.board, w - 10);
  const wy = Y(2.35), wh = Y(0.7) - wy;
  for (const [wx, ww] of [[x0 + 6, dx - x0 - 9], [dx + door + 3, x0 + w - dx - door - 9]] as const) {
    if (ww < 6) continue;
    box(g, wx - 1, wy - 1, ww + 2, wh + 2, INK);
    box(g, wx, wy, ww, wh, glassLit());
    goods(g, s.goods, wx + 1, wy + 2, ww - 2, wh - 3, i + (wx > dx ? 1 : 0));
    box(g, wx, wy, ww, 1, trimLit); box(g, wx + ww - 1, wy, 1, wh, trim);
    // (the bulkhead under it: a panel)
    box(g, wx, Y(0.65), ww, Y(0.2) - Y(0.65), R[0]); box(g, wx + 2, Y(0.6), ww - 4, 1, R[2]);
  }
  g.fillStyle = INK; g.beginPath(); g.moveTo(dx - 1, Y(0)); g.lineTo(dx - 1, Y(2.1)); g.lineTo(dx + door / 2, Y(2.5)); g.lineTo(dx + door + 1, Y(2.1)); g.lineTo(dx + door + 1, Y(0)); g.closePath(); g.fill();
  box(g, dx + 1, Y(2.05), door - 2, Y(0) - Y(2.05), '#120E18'); box(g, dx + 4, Y(1.9), door - 8, 8, glassDark()); box(g, dx + door - 5, Y(1.05), 2, 2, '#A16207');
  // (the plinth, and a cobweb in the shopfront's corner)
  box(g, x0, Y(0.2), w, Y(0) - Y(0.2), R[0]);
  if (i % 2 === 0) { g.strokeStyle = '#C8C4D8'; g.lineWidth = 1; for (let k = 1; k <= 3; k++) { g.beginPath(); g.moveTo(x0 + 6, sf + 2 + k * 3); g.lineTo(x0 + 6 + k * 3, sf + 2); g.stroke(); } g.beginPath(); g.moveTo(x0 + 6, sf + 2); g.lineTo(x0 + 15, sf + 11); g.stroke(); }
};

/** A side's strip: each shop, shoulder to shoulder. */
const paintStrip = (g: Ctx, shops: Shop[]) => {
  let x = 0;
  shops.forEach((s, i) => { const w = Math.round(s.w * WP); paintShop(g, x, w, s, i); x += w; });
};

/** A side's wall, painted once (per hour, once the font's in): lit by the hour, then halved and halved again down to a
 *  pixel (the far columns take an average, not a speck: no crawl), each step in its four fogs. */
const walls = new Map<number, { key: string; lv: HTMLCanvasElement[][]; len: number }>();
const wallOf = (side: number) => {
  const key = `${timeOfDay().key}|${fontIn()}`;
  let wv = walls.get(side);
  if (!wv || wv.key !== key) {
    const shops = side < 0 ? LEFT : RIGHT, len = lenOf(shops);
    const w = Math.round(len * WP), base = canvas(w, TEX_H), g = base.getContext('2d')!;
    paintStrip(g, shops);
    const lit = canvas(w, TEX_H), lg = lit.getContext('2d')!;
    lg.drawImage(base, 0, 0);
    lg.globalCompositeOperation = 'multiply'; lg.fillStyle = gradeOf(); lg.fillRect(0, 0, w, TEX_H);
    lg.globalCompositeOperation = 'destination-in'; lg.drawImage(base, 0, 0);
    const lv: HTMLCanvasElement[][] = [];
    let cur = lit;
    for (;;) {
      const fogs = [cur];
      for (let f = 1; f <= 3; f++) {
        const c = canvas(cur.width, cur.height), cg = c.getContext('2d')!;
        cg.drawImage(cur, 0, 0);
        cg.globalCompositeOperation = 'source-atop'; cg.globalAlpha = 0.16 * f; cg.fillStyle = hazeOf(DONNIE_DRACULA); cg.fillRect(0, 0, c.width, c.height);
        fogs.push(c);
      }
      lv.push(fogs);
      if (cur.width <= 1 && cur.height <= 1) break;
      const nx = canvas(Math.max(1, cur.width >> 1), Math.max(1, cur.height >> 1)), ng = nx.getContext('2d')!;
      ng.imageSmoothingEnabled = true; ng.imageSmoothingQuality = 'high';
      ng.drawImage(cur, 0, 0, nx.width, nx.height);
      cur = nx;
    }
    wv = { key, lv, len };
    walls.set(side, wv);
  }
  return wv;
};

/**
 * The street's walls, a column at a time: each column's bit of wall at the distance it's at (the ground's own eye:
 * where the walls' feet are is where the ground has them), standing on the ground, scrolling off with it.
 */
const drawWalls = (c: Ctx, sway: number, travel: number) => {
  const vp = VP_X + sway;
  for (const side of [-1, 1]) {
    const X = side < 0 ? XL : XR, ax = Math.abs(X), wv = wallOf(side), top = wv.lv.length - 1;
    const xa = side < 0 ? 0 : Math.max(0, Math.floor(vp)), xb = side < 0 ? Math.min(LW, Math.ceil(vp)) : LW;
    for (let x = xa; x < xb; x++) {
      const dx = x + 0.5 - vp;
      if (dx * side < 0.2) continue;
      const d = (F * X) / dx;
      if (d > D_END) continue;
      const s = F / d, yF = Math.round(HOR + s * CAM_H), yT = Math.round(HOR - s * (WALL_H - CAM_H));
      if (yF <= yT) continue;
      const zw = d - travel, um = (((side < 0 ? zw : -zw) % wv.len) + wv.len) % wv.len;
      const tpc = ((d * d) / (F * ax)) * WP;
      const l = Math.max(0, Math.min(top, Math.round(Math.log2(Math.max(1, tpc)))));
      const cv = wv.lv[l][fogAt(d * (x & 1 ? 1.05 : 0.95))];
      const ux = Math.min(cv.width - 1, Math.floor((um * WP) / 2 ** l));
      c.drawImage(cv, ux, 0, 1, cv.height, x, yT, 1, yF - yT);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What's along the curbs and hung off the walls (drawn with the walls, near over far: all of it nearer than the walls,
// farther than the junk in the road): the gas lamps (the town's: black post, the yellow lantern, its pointed cap; FREE
// WI-FI on one, USB PORT on another) and each shop's sign hung out over the sidewalk (the town's boards)

const paintLamp = (sign: string) => (g: Ctx, w: number, h: number) => {
  const lit = timeOfDay().lamps > 0.05, m = Math.round(w / 2), u = h / 4;
  box(g, m - 2, u * 0.5, 4, h - u * 0.5, INK); box(g, m - 1, u * 0.5, 2, h - u * 0.5, '#3F3F46');
  box(g, m - 5, h - 5, 10, 5, INK); box(g, m - 4, h - 4, 8, 3, '#27272A');
  g.fillStyle = INK; g.beginPath(); g.moveTo(m - 6, u * 0.55); g.lineTo(m + 6, u * 0.55); g.lineTo(m + 5, u * 0.16); g.lineTo(m - 5, u * 0.16); g.closePath(); g.fill();
  g.fillStyle = lit ? LAMP : '#8A7A4A'; g.beginPath(); g.moveTo(m - 5, u * 0.52); g.lineTo(m + 5, u * 0.52); g.lineTo(m + 4, u * 0.18); g.lineTo(m - 4, u * 0.18); g.closePath(); g.fill();
  box(g, m - 1, u * 0.18, 1, u * 0.34, lit ? '#FFFBEB' : '#A8986A');
  g.fillStyle = INK; g.beginPath(); g.moveTo(m - 7, u * 0.17); g.lineTo(m + 7, u * 0.17); g.lineTo(m, 0); g.closePath(); g.fill();
  if (sign) board(g, m, h * 0.58, [sign], w, BOARD, '#BBF7D0');
};
const LAMPS: Prop[] = [
  { id: 'dw-lamp', x: 0, z: 0, w: 0.8, h: 3.8, ppm: 24, paint: paintLamp('') },
  { id: 'dw-lamp-wifi', x: 0, z: 0, w: 2.6, h: 3.8, ppm: 24, paint: paintLamp('FREE WI-FI') },
  { id: 'dw-lamp-usb', x: 0, z: 0, w: 2.2, h: 3.8, ppm: 24, paint: paintLamp('USB PORT') },
];

const paintBlade = (s: Shop, side: number) => (g: Ctx, w: number, h: number) => {
  // (the iron bracket out of the wall, its scroll; the chains; the board)
  const wallX = side < 0 ? 0 : w - 1;
  box(g, 0, 1, w, 3, INK); box(g, 0, 2, w, 1, '#3F3F46');
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(wallX, 14); g.quadraticCurveTo(wallX + (side < 0 ? 18 : -18), 12, wallX + (side < 0 ? 26 : -26), 3); g.stroke();
  for (const cx of [10, w - 11]) box(g, cx, 4, 1, 8, '#52525B');
  board(g, w / 2, 12 + (h - 14) / 2, [s.blade], w - 4, s.crypt ? '#0C4A6E' : BOARD, s.crypt ? '#BAE6FD' : BOARD_INK);
};
/** Each side's shops' hung signs (painted once each). */
const blades = (side: number) => (side < 0 ? LEFT : RIGHT).map((s, i): Prop => ({ id: `dw-blade${side}-${i}`, x: 0, z: 0, w: 2.4, h: 1.1, ppm: 40, paint: paintBlade(s, side) }));
const BLADES = { l: blades(-1), r: blades(1) };

type Item = { d: number; x: number; p: Prop; up: number };
const furnitureOf = (travel: number) => {
  const items: Item[] = [];
  // (the lamps, both sides, staggered; which lamp it is keyed to its place along the street, never the screen)
  for (const side of [-1, 1]) {
    const off = side < 0 ? 0 : LAMP_GAP / 2;
    for (let k = Math.ceil((1.5 - travel - off) / LAMP_GAP); ; k++) {
      const d = k * LAMP_GAP + off + travel;
      if (d > 300) break;
      const n = ((k % 7) + 7) % 7;
      items.push({ d, x: ME_X + side * LAMP_X, p: LAMPS[side < 0 && n === 2 ? 1 : side > 0 && n === 5 ? 2 : 0], up: 0 });
    }
    // (each shop's sign, out from the wall near the shop's near end)
    const shops = side < 0 ? LEFT : RIGHT, len = lenOf(shops), list = side < 0 ? BLADES.l : BLADES.r;
    let at = 0;
    shops.forEach((s, i) => {
      // (where along the strip: the left's runs away from the eye, the right's toward it)
      const u = side < 0 ? at + 1.2 : at + s.w - 1.2;
      at += s.w;
      const z0 = side < 0 ? u : -u;
      for (let n = Math.ceil((1.2 - travel - z0) / len); ; n++) {
        const d = z0 + n * len + travel;
        if (d > D_END) break;
        items.push({ d, x: side < 0 ? XL + 1.2 : XR - 1.2, p: list[i], up: 3.5 });
      }
    });
  }
  return items.sort((a, b) => b.d - a.d);
};
/** Those of them `from` to `to` m off, far to near. */
const drawFurniture = (c: Ctx, items: Item[], sway: number, from: number, to: number) => {
  const glow = timeOfDay().lamps, F_ = fontIn();
  for (const { d, x, p, up } of items) {
    if (d <= from || d > to) continue;
    const { sx, sy, s } = project(x, d, sway);
    const pw = p.w * s, ph = p.h * s;
    if (sx + pw / 2 < -2 || sx - pw / 2 > LW + 2 || pw < 1) continue;
    const id = p.paint && (p.id.includes('wifi') || p.id.includes('usb') || p.id.includes('blade')) ? { ...p, id: p.id + F_ } : p;
    // (the signs going round the last corner: stippled out over the last few meters, not gone in a blink)
    const fade = up ? Math.min(1, (D_END - d) / 8) : 1;
    if (fade < 1) c.globalAlpha = fade > 0.5 ? 0.66 : 0.33;
    c.drawImage(spriteOf(DONNIE_DRACULA, id, fogAt(d)), Math.round(sx - pw / 2), Math.round(sy - s * up - ph), Math.max(1, Math.round(pw)), Math.max(1, Math.round(ph)));
    c.globalAlpha = 1;
    // (the lamp's glow after dark: dim, stepped, two rings)
    if (!up && glow > 0.05 && d < 30) for (let r = 2; r >= 1; r--) { c.fillStyle = `rgba(253, 230, 138, ${(0.05 * glow * (3 - r)).toFixed(3)})`; c.beginPath(); c.arc(Math.round(sx), Math.round(sy - s * 3.55), s * 0.45 * r, 0, Math.PI * 2); c.fill(); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The far end of the street: the sky's furniture, and the wrecked ELEVATOR TO HELL (the town's tower: the square clock
// face, the stepped roof, the red sign, the track up its right side), painted once, crisp, leaning

const TW = 56, TH = 92;
const towers = new Map<string, HTMLCanvasElement>();
const towerOf = () => {
  const key = timeOfDay().key;
  let cv = towers.get(key);
  if (!cv) {
    cv = canvas(TW, TH);
    const g = cv.getContext('2d')!, m = TW / 2, B = TH;
    const H = (day: string, dusk: string, night: string) => hourMix(day, dusk, night);
    const body = H('#4A4262', '#3A2C4A', '#2C2244'), lit = H('#6A6082', '#523E62', '#3B2F58'), dk = H('#332C46', '#251C30', '#1A1428');
    // (the track up its right side, its rungs)
    box(g, m + 11, B - 64, 5, 64, INK); box(g, m + 12, B - 64, 3, 64, '#18121F'); for (let y = B - 62; y < B; y += 6) box(g, m + 11, y, 5, 1, '#3F3550');
    // (the body: inked, lit at its left, shaded at its right; cracked down it)
    box(g, m - 12, B - 66, 24, 66, INK); box(g, m - 11, B - 65, 22, 65, body); box(g, m - 11, B - 65, 3, 65, lit); box(g, m + 7, B - 65, 4, 65, dk);
    g.fillStyle = stipple(g, dk); g.fillRect(m - 8, B - 20, 15, 20);
    // (the ledge under the roof)
    box(g, m - 14, B - 69, 28, 4, INK); box(g, m - 13, B - 68, 26, 2, lit);
    // (the roof: stepped, the town's; the spire snapped, its top hanging off)
    for (let i = 0; i < 5; i++) { box(g, m - 12 + i * 2.5, B - 72 - i * 3, 24 - i * 5, 3, INK); box(g, m - 11 + i * 2.5, B - 72 - i * 3, 22 - i * 5, 2, i % 2 ? body : lit); }
    box(g, m - 1, B - 82, 2, 6, INK);
    box(g, m + 1, B - 84, 5, 2, INK); box(g, m + 5, B - 84, 2, 5, INK);
    // The clock: the square face, its dark frame (the town's); cracked across, stopped (the minute hand fallen)
    const cy = B - 50;
    box(g, m - 10, cy - 10, 20, 20, INK); box(g, m - 9, cy - 9, 18, 18, '#0F0B18');
    box(g, m - 8, cy - 8, 16, 16, H('#D9C98A', '#CDB878', '#C8B478'));
    box(g, m - 8, cy - 8, 16, 2, H('#ECE0AC', '#DCCA90', '#D8C890'));
    for (const [tx, ty] of [[0, -7], [6, 0], [0, 6], [-7, 0]]) box(g, m + tx - (tx ? 0 : 1), cy + ty - (ty ? 0 : 1), tx ? 1 : 2, ty ? 1 : 2, '#3B2F58');
    box(g, m - 1, cy - 6, 2, 6, '#1E1036');
    box(g, m - 1, cy, 2, 2, '#1E1036'); box(g, m, cy + 2, 1, 5, '#1E1036'); box(g, m + 1, cy + 6, 1, 1, '#1E1036');
    g.fillStyle = INK; for (const [x, y] of [[-8, -3], [-6, -3], [-5, -2], [-3, -2], [-2, -1], [1, -1], [2, 0], [4, 1], [5, 1], [7, 2]]) g.fillRect(m + x, cy + y, 1, 1);
    box(g, m + 3, cy - 8, 4, 4, '#0F0B18'); box(g, m + 4, cy - 4, 2, 2, '#0F0B18');
    // (the ELEVATOR TO HELL sign under it, its red gone dim, a letter or two still lit)
    box(g, m - 12, B - 37, 24, 9, INK); box(g, m - 11, B - 36, 22, 7, '#5A1414');
    for (let k = 0; k < 8; k++) if (k !== 3 && k !== 6) box(g, m - 10 + k * 2.6, B - 35, 2, 2, '#FECACA');
    for (let k = 0; k < 6; k++) if (k !== 2) box(g, m - 8 + k * 2.6, B - 32, 2, 2, '#FCA5A5');
    // (a window, blown out)
    box(g, m - 3, B - 22, 6, 7, INK); box(g, m - 2, B - 21, 4, 5, '#3B0A0A');
    // The support beams out its sides, like a ribcage: snapped, splintered (low, under the clock)
    for (const [y, len] of [[B - 26, 10], [B - 14, 12], [B - 4, 9]] as const) for (const sd of [-1, 1]) {
      const x0 = sd < 0 ? m - 12 - len : m + 16;
      box(g, x0, y - 2, len, 4, INK); box(g, x0 + 1, y - 1, len - 2, 2, '#78350F');
      box(g, sd < 0 ? x0 - 1 : x0 + len - 1, y - 3, 2, 2, '#A16207'); box(g, sd < 0 ? x0 : x0 + len - 2, y + 1, 2, 2, '#A16207');
    }
    towers.set(key, cv);
  }
  return cv;
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  const H = (day: string, dusk: string, night: string) => hourMix(day, dusk, night, tod);
  const travel = SPEED * t;
  drawStars(c, 0, 0, LW, HOR - 10, t, 0, tod, 1);
  drawMoon(c, 352, 16, 8, tod);
  // (low cloud, drifting)
  for (let i = 0; i < 5; i++) {
    const x = ((i * 113 - t * 0.05) % (LW + 160) + LW + 160) % (LW + 160) - 120;
    c.fillStyle = H('#C8C4D8', '#5A3A5A', '#2A2440'); c.beginPath(); c.roundRect(Math.round(x), 14 + (i % 3) * 7, 70 + (i % 2) * 40, 5, 2.5); c.fill();
  }
  // The far hills, low, past the square (each keyed to which it is)
  const hill = H('#3A3050', '#2B1A33', '#120C1E');
  for (let i = 0; i < 12; i++) { const hx = Math.round(i * 36 - 20 + sway); box(c, hx, HOR - 4 - Math.round(hash(i * 2.7) * 6), 40, 8, hill); }
  // (what's along the street past its end, in the square: behind the tower)
  const items = furnitureOf(travel);
  drawFurniture(c, items, sway, D_END, 400);
  // The tower, in the square at the street's far end, in the middle of it: first its glow (the hole at its foot: red,
  // dim, stepped)
  const tx = Math.round(VP_X + sway + (F * ME_X) / D_END), ty = HOR + Math.round((F * CAM_H) / D_END);
  const glow = 0.7 + 0.3 * Math.sin(t * 0.07);
  for (let i = 3; i >= 1; i--) { c.fillStyle = `rgba(220, 38, 38, ${(0.045 * (4 - i) * glow).toFixed(3)})`; c.beginPath(); c.ellipse(tx, ty - 2, 12 + i * 8, 4 + i * 4, 0, 0, Math.PI * 2); c.fill(); }
  // (leaning: over to the right, off its footing; the picture turned the SNES's way, its pixels kept)
  c.save(); c.translate(tx, ty); c.rotate(0.09);
  c.imageSmoothingEnabled = false;
  c.drawImage(towerOf(), -TW / 2, -TH);
  // (the cable: snapped at the top of the track, hanging off loose, swinging)
  const sw = Math.sin(t * 0.03) * 3;
  c.strokeStyle = '#71717A'; c.lineWidth = 1; c.beginPath(); c.moveTo(14, -66); c.quadraticCurveTo(20 + sw, -48, 17 + sw * 1.5, -32); c.stroke();
  // (now and then, another car sent down the track: it drops into the hole, a flash of red)
  const u = t % 420;
  if (u < 40) {
    const y = -62 + (u / 40) ** 2 * 60;
    box(c, 10, y - 7, 9, 7, INK); box(c, 11, y - 6, 7, 5, '#7F1D1D'); box(c, 12, y - 5, 5, 2, LAMP);
  } else if (u < 52) { c.fillStyle = `rgba(253, 186, 116, ${(0.5 * (1 - (u - 40) / 12)).toFixed(2)})`; c.beginPath(); c.ellipse(13, -3, 10, 4, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
  // (the smoke off the hole: thin, low, blown off right, behind the rooftops; a tongue of fire in it)
  smoke(c, tx + 4, ty - 2, 2.5, t, 4, { n: 6, rise: 0.03, drift: 0.07, size: 1.4, col: ['#3A2224', '#4A3036', '#5A4248', '#6E5A62'] });
  fire(c, tx, ty, 5, t, 3);
  // (the heat off the hole: rows rippling, just round its foot)
  wobble(c, tx - 16, ty - 18, 32, 20, t, 1);
  // The street: its shopfronts down both sides to the square, then what's along the curbs and hung off the walls
  drawWalls(c, sway, travel);
  drawFurniture(c, items, sway, 0, D_END);
};

// ---------------------------------------------------------------------------------------------------------------
// In the road: the junk out of the gift shop and the ballroom

const paintFork = (g: Ctx, w: number, h: number) => {
  // (a souvenir pitchfork, dropped)
  g.save(); g.translate(w / 2, h / 2); g.rotate(-0.3);
  box(g, -w / 2, -1, w, 3, INK); box(g, -w / 2 + 1, 0, w - 2, 1, '#991B1B');
  for (const ty of [-4, 0, 4]) box(g, w / 2 - 6, ty - 1, 6, 2, '#D4D4D8');
  g.restore();
};
const paintShirt = (g: Ctx, w: number, h: number) => {
  // (an I SURVIVED HELL tee, trodden on)
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, h * 0.2); g.lineTo(w * 0.3, 0); g.lineTo(w * 0.7, 0); g.lineTo(w, h * 0.2); g.lineTo(w * 0.85, h * 0.4); g.lineTo(w * 0.8, h); g.lineTo(w * 0.2, h); g.lineTo(w * 0.15, h * 0.4); g.closePath(); g.fill();
  g.fillStyle = '#18181B'; g.beginPath(); g.moveTo(1, h * 0.2); g.lineTo(w * 0.3, 1); g.lineTo(w * 0.7, 1); g.lineTo(w - 1, h * 0.2); g.lineTo(w * 0.84, h * 0.4); g.lineTo(w * 0.79, h - 1); g.lineTo(w * 0.21, h - 1); g.lineTo(w * 0.16, h * 0.4); g.closePath(); g.fill();
  box(g, w * 0.3, h * 0.4, w * 0.4, h * 0.15, '#DC2626'); box(g, w * 0.35, h * 0.6, w * 0.3, 2, '#FDE047');
};
const paintGlobe = (g: Ctx, w: number, h: number) => {
  // (a snow globe, cracked, its glitter spilled)
  box(g, w * 0.2, h * 0.7, w * 0.6, h * 0.3, INK); box(g, w * 0.22, h * 0.72, w * 0.56, h * 0.24, '#7F1D1D');
  lump(g, w / 2, h * 0.45, w * 0.3, h * 0.3, ['#3B82F6', '#7DD3FC', '#BAE6FD', '#E0F2FE', '#FFFFFF']);
  box(g, w * 0.45, h * 0.25, 1, h * 0.3, INK);
  for (let i = 0; i < 6; i++) box(g, hash(i) * w, h - 2 - hash(i + 4) * 3, 1, 1, '#F97316');
};
const paintTag = (g: Ctx, w: number, h: number) => {
  // (HELLO MY NAME IS DONNIE, peeled off, on the cobbles)
  box(g, 0, 0, w, h, INK); box(g, 1, 1, w - 2, h - 2, '#FFFFFF'); box(g, 1, 1, w - 2, h * 0.35, '#DC2626');
  if (h >= 8) { g.font = `${Math.max(4, Math.round(h * 0.4))}px "Press Start 2P"`; g.fillStyle = '#111827'; g.textAlign = 'center'; g.fillText('DONNIE', w / 2, h - 2); g.textAlign = 'left'; }
};
const paintAsh = (g: Ctx, w: number, h: number) => {
  g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, h, w / 2, h * 0.8, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#57534E'; g.beginPath(); g.ellipse(w / 2, h, w / 2 - 1, h * 0.7, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#1A1C26'; g.beginPath(); g.ellipse(w * 0.55, h * 0.4, w * 0.2, h * 0.18, 0.2, 0, Math.PI * 2); g.fill();
  box(g, w * 0.5, h * 0.3, w * 0.25, 1, '#7C8AA8');
};


const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [];
  // Donnie's tag; his ash, if it was the little statue that did for him
  out.push({ id: 'dw-tag', x: 1.4, z: 3.4, w: 0.7, h: 0.4, ppm: 40, paint: paintTag });
  if (weakness) out.push({ id: 'dw-ash', x: -1.6, z: 5.5, w: 1.2, h: 0.5, ppm: 32, paint: paintAsh, live: (c, sx, sy, s, t) => smoke(c, sx, sy - s * 0.3, s, t, 2, { n: 4, size: 0.3, rise: 0.02, col: ['#57534E', '#78716C', '#A8A29E'] }) });
  // The junk, strewn the whole way (in the road: in from the lamps, so nothing in it's ever over one nearer)
  for (let i = 0; i < 12; i++) {
    const side = i % 2 ? 1 : -1, x = ME_X + side * (0.9 + hash(i * 3.3) * 2), z = 3 + hash(i * 7.1) * 28, k = i % 3;
    if (k === 0) out.push({ id: 'dw-fork', x, z, w: 1, h: 0.3, ppm: 32, paint: paintFork, wrap: true });
    else if (k === 1) out.push({ id: 'dw-shirt', x, z, w: 0.7, h: 0.5, ppm: 32, paint: paintShirt, wrap: true });
    else out.push({ id: 'dw-globe', x, z, w: 0.4, h: 0.45, ppm: 40, paint: paintGlobe, wrap: true });
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// His new toy: the SOUL SUCKER, side on, pointing +x: a haunted-house shop vac (purple, a ghost decal), its hose out
// front to a wide nozzle, a meat grinder bolted on where the bag goes, the gore bag hanging under it

const soulSucker = (c: Ctx, t: number) => {
  const sl = Math.sin(t * 0.1) * 1;
  c.fillStyle = INK; c.beginPath(); c.ellipse(-14, 10 + sl, 8, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(-14, 10 + sl, 7, 5, 0, 0, Math.PI * 2); c.fill();
  box(c, -17, 7 + sl, 3, 2, '#B91C1C');
  box(c, -24, -9, 26, 16, INK); box(c, -23, -8, 24, 14, '#6D28D9'); box(c, -23, -8, 24, 3, '#8B5CF6'); box(c, -23, 3, 24, 3, '#4C1D95');
  box(c, -14, -4, 6, 6, '#F8FAFC'); box(c, -13, -2, 1, 1, INK); box(c, -11, -2, 1, 1, INK);
  box(c, -20, -15, 10, 7, '#71717A'); box(c, -19, -14, 8, 5, '#A1A1AA');
  const a = t * 0.2; box(c, -15 + Math.cos(a) * 5, -17 + Math.sin(a) * 3, 2, 2, '#3F3F46');
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(14, 6, 22, -1); c.stroke();
  c.strokeStyle = '#52525B'; c.lineWidth = 3; c.stroke();
  box(c, 22, -6, 10, 10, INK); box(c, 23, -5, 8, 8, '#A1A1AA'); box(c, 30, -7, 3, 12, '#3F3F46');
};



export const DONNIE_DRACULA: SceneDef = {
  land: 'SPOOKY LAND',
  weapon: 'SOUL_SUCKER',
  blurb: ['HOLD TO SUCK THEM IN AND GRIND THEM UP. TOO BIG? IT BLEEDS THEM DRY.', "THE BAG FILLS WITH GORE. SPRAY IT BACK OUT ALL OVER WHOEVER'S NEXT."],
  sky: ['#0E0A1E', '#1A1230', '#261A40', '#33224E', '#3E2A58', '#4A3262', '#563A6C'],
  haze: '#2A2240',
  ground, back, props,
  drawWeapon: soulSucker,
  grip: [[-12, -12], [20, 2]],
  rim: '#DC2626',
  embers: ['#FECACA', '#F87171', '#DC2626', '#991B1B'],
  // (no heat over the whole street: its walls stay straight; the tower's hole ripples on its own, in back())
  ripple: false,
};
