// America USA: the free bit at the front of Happy Land: every American city as a street of tacky shops and restaurants,
// under more flags than anywhere has ever needed. Painted peak-SNES: the building fronts, the arch, the lamps, the
// fountain, the carts and the brick street are still art, painted once into stamps; whatever moves (flags, neon, water,
// the L, the fish, the drizzle, the flames in the lanterns) is drawn live over them. Awnings, balconies, cornices and the
// L are dimmed back: the street at GROUND_Y is the only floor here.

import { R, STAIRS_END, USA_START, USA_END, DISTRICTS, DISTRICT_W } from '../geometry';
import { GROUND_Y } from '../../../m1/constants';
import {
  type Ctx, INK, RED, WHITE, BLUE, FLAG_RED, FLAG_WHITE, FLAG_BLUE, box, shinyStar, flag, bunting, sign, dim, eagle,
  slab, pole, ball, rampOf, dark, lite, mix, hash, checker, bandedGradient, hazeBands, pixelBlob, tilePattern, stamp,
  sideFace,
} from './kit';
import { type Look, signAt, signText, federal, gilt, tube, marker, print } from './letters';

const GY = GROUND_Y;
type Id = 'nola' | 'nash' | 'chi' | 'sea' | 'bos';
type Pt = [number, number];

// ---------------------------------------------------------------------------------------------------------------
// Little painting helpers

const rgba = (hex: string, a: number) => { const n = parseInt(hex.slice(1, 7), 16); return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`; };
const SHADOW = 'rgba(26, 11, 6, 0.26)';
const SIL = '#0F1424';
const GOLD = '#C9A23A';
const poly = (g: Ctx, pts: Pt[], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
const disc = (g: Ctx, x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const oval = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill(); };
const inkRect = (g: Ctx, x: number, y: number, w: number, h: number) => { g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2); };
/** Small words on a sign, a plate, a label: the way in's government enamel (or a look of their own). */
const tiny = (g: Ctx, s: string, x: number, y: number, col: string, size = 6, shadow: string | null = INK, look?: Look) => signAt(g, s, x, y, size, look ?? federal(size, col, shadow ?? undefined));
/** A window's shape: a rectangle, or one with a round head. */
const pane = (g: Ctx, x: number, y: number, w: number, h: number, arched = false) => {
  g.beginPath();
  if (arched) { const r = w / 2; g.moveTo(x, y + h); g.lineTo(x, y + r); g.arc(x + r, y + r, r, Math.PI, Math.PI * 2); g.lineTo(x + w, y + h); g.closePath(); }
  else g.rect(x, y, w, h);
};
/** Light off glass: two diagonal glints and a sparkle in the corner. */
const glints = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const s = x + Math.round(w * 0.22), k = h * 0.7;
  poly(g, [[s, y + h], [s + 8, y + h], [s + 8 + k, y], [s + k, y]], 'rgba(255, 255, 255, 0.15)');
  poly(g, [[s + 14, y + h], [s + 17, y + h], [s + 17 + k, y], [s + 14 + k, y]], 'rgba(255, 255, 255, 0.10)');
  box(g, x + 2, y + 2, 2, 2, 'rgba(255, 255, 255, 0.55)');
};
/** A drop shadow thrown back onto the wall behind a prop. */
const castShadow = (g: Ctx, x: number, y: number, w: number, h: number) => { box(g, x + 5, y + 3, w, h - 3, 'rgba(26, 11, 6, 0.2)'); checker(g, x + w + 5, y + 3, 2, h - 3, 'rgba(26, 11, 6, 0.2)'); };

// ---------------------------------------------------------------------------------------------------------------
// The buildings: two to a district, each the city it's pretending to be

type Mat = 'siding' | 'brick' | 'stone' | 'terra';
type Win = 'sash' | 'arch' | 'chicago' | 'colonial';
type Prop = 'planter' | 'news' | 'trash' | 'bench' | 'hydrant' | 'aframe';
interface Bldg {
  wall: string; mat: Mat; trim: string; shutter?: string; shop: [string, string, string]; awn: [string, string];
  door: string; win: Win; curtain: string; glass: string; props: [Prop, Prop]; flagX: number;
}
const B: Record<Id, [Bldg, Bldg]> = {
  nola: [
    { wall: '#E9A3C2', mat: 'siding', trim: '#F2EEE2', shutter: '#2E7D5B', shop: ['BIG EASY BEIGNETS', '#FEF3C7', '#7C2D12'], awn: ['#2E7D5B', '#F2EEE2'], door: '#2E7D5B', win: 'arch', curtain: '#7C3AED', glass: 'SUGAR: MANDATORY', props: ['planter', 'aframe'], flagX: 304 },
    { wall: '#97D8B0', mat: 'siding', trim: '#F2EEE2', shutter: '#6D3FA6', shop: ['VOODOO-RAMA GIFTS', '#4C1D95', '#FDE047'], awn: ['#6D3FA6', '#E8B400'], door: '#6D3FA6', win: 'arch', curtain: '#B91C1C', glass: 'CURSES 50% OFF', props: ['news', 'trash'], flagX: 304 },
  ],
  nash: [
    { wall: '#B5463A', mat: 'brick', trim: '#F3E2C0', shop: ['HONKY TONK HEAVEN', '#7F1D1D', '#FDE047'], awn: ['#7F1D1D', '#F3E2C0'], door: '#5A2E0E', win: 'sash', curtain: '#FACC15', glass: 'NO COVER. NO MERCY.', props: ['bench', 'trash'], flagX: 290 },
    { wall: '#D5A040', mat: 'brick', trim: '#5A2E0E', shop: ['BOOT BARN-O-RAMA', '#78350F', '#FEF3C7'], awn: ['#78350F', '#FEF3C7'], door: '#78350F', win: 'sash', curtain: '#B91C1C', glass: 'FITS ALL FEET', props: ['planter', 'hydrant'], flagX: 318 },
  ],
  chi: [
    { wall: '#7A4A38', mat: 'stone', trim: '#D3C3A5', shop: ['DEEP DISH DEPOT', '#B91C1C', '#FEF3C7'], awn: ['#B91C1C', '#F8FAFC'], door: '#3F2A14', win: 'chicago', curtain: '#F59E0B', glass: 'LEGALLY A PIZZA', props: ['bench', 'news'], flagX: 300 },
    { wall: '#C0673B', mat: 'terra', trim: '#EAD9B8', shop: ['WINDY CITY TEES', '#1E3A8A', WHITE], awn: ['#1E3A8A', '#F8FAFC'], door: '#1E3A8A', win: 'chicago', curtain: '#1E3A8A', glass: 'SIZES S TO XXXXXL', props: ['trash', 'hydrant'], flagX: 300 },
  ],
  sea: [
    { wall: '#8C4030', mat: 'brick', trim: '#2F6B3A', shop: ["CUP O' JOE-MERICA", '#14532D', '#FEF3C7'], awn: ['#14532D', '#F3E2C0'], door: '#2F6B3A', win: 'sash', curtain: '#A3E635', glass: 'NOW EVEN HOTTER', props: ['bench', 'aframe'], flagX: 326 },
    { wall: '#74463A', mat: 'brick', trim: '#3F7A3A', shop: ['FLYING FISH MARKET', '#0E7490', WHITE], awn: ['#0E7490', '#F8FAFC'], door: '#0E7490', win: 'sash', curtain: '#0E7490', glass: 'HEADS UP', props: ['news', 'trash'], flagX: 300 },
  ],
  bos: [
    { wall: '#9A3A2C', mat: 'brick', trim: '#EEEAE0', shutter: '#1F3A2A', shop: ['CHOWDAH HOUSE', '#1E3A8A', '#FEF3C7'], awn: ['#1E3A8A', '#EEEAE0'], door: '#1F3A2A', win: 'colonial', curtain: '#F1EFEA', glass: 'NO TOMATOES. EVER.', props: ['planter', 'hydrant'], flagX: 300 },
    { wall: '#87362A', mat: 'brick', trim: '#EEEAE0', shutter: '#141A2E', shop: ['REVOLUTION GIFT SHOPPE', '#7F1D1D', '#FDE047'], awn: ['#7F1D1D', '#EEEAE0'], door: '#7F1D1D', win: 'colonial', curtain: '#1E3A8A', glass: 'NO TAXATION', props: ['bench', 'news'], flagX: 310 },
  ],
};
const TAG: Record<Id, string> = { nola: 'NEW ORLEANS-ISH', nash: 'NASHVILLE-ISH', chi: 'CHICAGO-ISH', sea: 'SEATTLE-ISH', bos: 'BOSTON-ISH' };

const BW = 340;
const bldgX = (x: number, k: number) => x + 20 + k * 360;
const bldgTop = (k: number) => GY - 300 - (k ? 30 : 0);
/** The shop sign's top (the shopfront's under it, the upstairs over it). */
const SY = GY - 150;
const rowsOf = (top: number) => { const y0 = top + 26, rowH = (SY - 8 - y0) / 2; return [0, 1].map(r => ({ y: Math.round(y0 + r * rowH + 4), h: Math.round(rowH - 18) })); };
const winXs = (bx: number, style: Win): [number, number][] => (style === 'chicago' ? [0, 1, 2].map(i => [bx + 24 + i * 104, 76]) : [0, 1, 2, 3].map(i => [bx + 26 + i * 80, 40]));

/** The carts out front, and the fountain: nothing on the pavement goes where they stand. */
const CARTS: { x: number; words: string; col: string; kind: 'fries' | 'dogs' | 'pie' }[] = [
  { x: R(6620), words: 'FREEDOM FRIES', col: RED, kind: 'fries' },
  { x: R(7940), words: 'EAGLE DOGS', col: BLUE, kind: 'dogs' },
  { x: R(8900), words: 'PIE ON A STICK', col: '#B45309', kind: 'pie' },
];
const FOUNTAIN_X = R(7300);
const clearAt = (x: number) => CARTS.every(k => Math.abs(k.x - x) > 100) && Math.abs(FOUNTAIN_X - x) > 104;

/** A wall's surface, as a fill: clapboard, brick, brownstone, glazed terracotta. */
const wallPattern = (g: Ctx, mat: Mat, col: string) => {
  const r = rampOf(col);
  if (mat === 'siding') return tilePattern(g, `usaSid${col}`, 4, 8, t => {
    t.fillStyle = col; t.fillRect(0, 0, 4, 8);
    t.fillStyle = r[3]; t.fillRect(0, 0, 4, 2); t.fillStyle = r[4]; t.fillRect(0, 0, 4, 1);
    t.fillStyle = r[1]; t.fillRect(0, 6, 4, 1); t.fillStyle = r[0]; t.fillRect(0, 7, 4, 1);
  });
  if (mat === 'brick') return tilePattern(g, `usaBrk${col}`, 24, 12, t => {
    t.fillStyle = mix(r[1], '#9A9284', 0.45); t.fillRect(0, 0, 24, 12);
    for (let row = 0; row < 2; row++) for (let i = -1; i < 2; i++) {
      const x = i * 12 + (row ? 6 : 0), y = row * 6, tint = (i + 3 + row) % 2 ? col : mix(col, r[1], 0.4);
      t.fillStyle = tint; t.fillRect(x, y, 11, 5);
      t.fillStyle = lite(tint, 0.16); t.fillRect(x, y, 11, 1);
      t.fillStyle = dark(tint, 0.2); t.fillRect(x, y + 4, 11, 1);
    }
  });
  if (mat === 'stone') return tilePattern(g, `usaSto${col}`, 32, 16, t => {
    t.fillStyle = r[0]; t.fillRect(0, 0, 32, 16);
    for (let row = 0; row < 2; row++) for (let i = -1; i < 2; i++) {
      const x = i * 16 + (row ? 8 : 0), y = row * 8, tint = (i + 3 + row) % 2 ? col : mix(col, r[3], 0.25);
      t.fillStyle = tint; t.fillRect(x, y, 15, 7);
      t.fillStyle = lite(tint, 0.14); t.fillRect(x, y, 15, 1); t.fillRect(x, y, 1, 7);
      t.fillStyle = dark(tint, 0.18); t.fillRect(x, y + 6, 15, 1); t.fillRect(x + 14, y, 1, 7);
      t.fillStyle = dark(tint, 0.3); t.fillRect(x + 4 + row * 5, y + 3, 1, 1); t.fillRect(x + 10 - row * 3, y + 2, 1, 1);
    }
  });
  return tilePattern(g, `usaTer${col}`, 16, 12, t => {
    t.fillStyle = r[0]; t.fillRect(0, 0, 16, 12);
    t.fillStyle = col; t.fillRect(0, 0, 15, 11);
    t.fillStyle = r[3]; t.fillRect(0, 0, 15, 1); t.fillRect(0, 0, 1, 11);
    t.fillStyle = r[1]; t.fillRect(0, 10, 15, 1); t.fillRect(14, 0, 1, 11);
    t.fillStyle = r[1]; t.fillRect(6, 4, 3, 3); t.fillStyle = r[4]; t.fillRect(6, 4, 1, 1);
  });
};

/** Light and weather on a wall: lit down its left, shadowed down its right and under the cornice, grimy at the foot. */
const wallShade = (g: Ctx, bx: number, top: number, bw: number) => {
  const h = GY - top;
  box(g, bx, top, 4, h, 'rgba(255, 255, 255, 0.14)'); checker(g, bx + 4, top, 2, h, 'rgba(255, 255, 255, 0.14)');
  box(g, bx + bw - 10, top, 10, h, 'rgba(26, 11, 6, 0.22)'); checker(g, bx + bw - 14, top, 4, h, 'rgba(26, 11, 6, 0.22)', 1);
  box(g, bx, top, bw, 24, 'rgba(26, 11, 6, 0.18)'); checker(g, bx, top + 24, bw, 4, 'rgba(26, 11, 6, 0.18)');
  checker(g, bx, GY - 26, bw, 8, 'rgba(46, 30, 20, 0.24)'); box(g, bx, GY - 18, bw, 18, 'rgba(46, 30, 20, 0.24)');
  for (let i = 0; i < 7; i++) {
    const sx = bx + 10 + hash(bx + i * 17) * (bw - 20), sy = top + 30 + hash(bx + i * 29) * (h - 220);
    box(g, Math.round(sx), Math.round(sy), 2, Math.round(10 + hash(i + bx) * 22), 'rgba(26, 11, 6, 0.12)');
  }
};

const quoins = (g: Ctx, bx: number, top: number, bw: number, trim: string) => {
  const r = rampOf(trim);
  for (let y = top + 22, i = 0; y < SY - 18; y += 12, i++) for (const side of [0, 1]) {
    const w = i % 2 ? 12 : 20, x = side ? bx + bw - w : bx;
    box(g, x, y, w, 11, r[2]); box(g, x, y, w, 1, r[4]); box(g, x, y + 10, w, 1, r[0]); box(g, side ? x : x + w - 1, y, 1, 11, r[1]);
  }
};

/** The roofline: a crown thrown out past the wall on brackets, dentils under it (dim: nothing up here to stand on). */
const cornice = (g: Ctx, bx: number, top: number, bw: number, trim: string) => {
  const r = rampOf(dim(trim));
  box(g, bx - 2, top + 5, bw + 4, 8, r[1]); box(g, bx - 2, top + 5, bw + 4, 1, r[0]);
  for (let x = bx + 2; x < bx + bw - 4; x += 8) { box(g, x, top + 13, 4, 5, r[2]); box(g, x, top + 13, 1, 5, r[3]); box(g, x, top + 17, 4, 1, r[0]); }
  box(g, bx, top + 18, bw, 3, SHADOW);
  for (let i = 0; i < 7; i++) {
    const x = Math.round(bx + 2 + i * (bw - 11) / 6);
    box(g, x - 1, top + 3, 9, 20, INK); box(g, x, top + 4, 7, 18, r[2]); box(g, x, top + 4, 2, 18, r[3]); box(g, x + 6, top + 4, 1, 18, r[0]); box(g, x + 1, top + 19, 5, 2, r[1]);
  }
  box(g, bx - 9, top - 9, bw + 18, 14, INK);
  box(g, bx - 8, top - 8, bw + 16, 12, r[2]); box(g, bx - 8, top - 8, bw + 16, 2, r[3]); checker(g, bx - 8, top - 6, bw + 16, 2, r[3]);
  box(g, bx - 8, top + 1, bw + 16, 3, r[1]); checker(g, bx - 8, top - 1, bw + 16, 2, r[1], 1);
};

/** What's behind an upstairs window: curtains, blinds, somebody looking out, a flag (of course), a cat. */
const room = (g: Ctx, x: number, y: number, w: number, h: number, seed: number, curtain: string) => {
  const v = Math.floor(seed * 6);
  if (v === 0 || v === 3) {
    const cr = rampOf(curtain), cw = Math.max(6, Math.round(w * 0.3));
    if (v === 3) { disc(g, x + w / 2, y + h * 0.62, 7, 'rgba(253, 230, 138, 0.25)'); box(g, x + w / 2 - 3, y + h * 0.55, 6, 5, '#FDE68A'); box(g, x + w / 2 - 1, y + h * 0.55 + 5, 2, h, '#3A2A1E'); }
    for (const [cx, dir] of [[x, 1], [x + w - cw, -1]] as const) {
      box(g, cx, y, cw, h, cr[2]);
      for (let i = 2; i < cw; i += 4) box(g, cx + i, y, 1, h, cr[1]);
      box(g, dir > 0 ? cx : cx + cw - 2, y, 2, h, cr[3]);
      box(g, dir > 0 ? cx + cw - 1 : cx, y, 1, h, cr[0]);
    }
    box(g, x, y, w, 4, cr[1]); box(g, x, y + 4, w, 1, cr[0]);
  } else if (v === 1) {
    for (let yy = y; yy < y + h * 0.62; yy += 3) { box(g, x, yy, w, 2, '#D6D3C8'); box(g, x, yy + 1, w, 1, '#A8A398'); }
    box(g, x + w - 5, y, 1, h * 0.75, '#E7E2D6');
  } else if (v === 2) {
    const px = Math.round(x + w * (0.3 + hash(seed * 9) * 0.4)), py = Math.round(y + h * 0.42);
    disc(g, px, py, 5, SIL); box(g, px - 9, py + 5, 18, h, SIL); box(g, px - 3, py + 3, 6, 4, SIL);
  } else if (v === 4) {
    const fw = w - 8, fh = Math.min(h - 8, Math.round(fw * 0.6)), fx = x + 4, fy = y + 4;
    for (let i = 0; i < 7; i++) box(g, fx, fy + Math.round(i * fh / 7), fw, Math.ceil(fh / 7), i % 2 ? FLAG_WHITE[3] : FLAG_RED[2]);
    box(g, fx, fy, Math.round(fw * 0.42), Math.round(fh * 0.55), FLAG_BLUE[2]);
    for (let i = 0; i < 4; i++) box(g, fx + 2 + (i % 2) * 6, fy + 2 + Math.floor(i / 2) * 4, 1, 1, '#FFFFFF');
    box(g, fx + fw - 2, fy, 2, fh, 'rgba(26, 11, 6, 0.3)');
  } else {
    const sx = Math.round(x + w * 0.6), sy = y + h - 2;
    oval(g, sx, sy - 5, 6, 4, SIL); disc(g, sx - 6, sy - 10, 4, SIL); poly(g, [[sx - 9, sy - 12], [sx - 8, sy - 17], [sx - 6, sy - 13]], SIL); poly(g, [[sx - 5, sy - 13], [sx - 3, sy - 17], [sx - 2, sy - 12]], SIL);
    box(g, sx + 5, sy - 4, 6, 2, SIL);
    box(g, x + 3, sy - 6, 7, 6, '#9A4A2A'); pixelBlob(g, x + 6, sy - 10, 6, 4, '#3F7A3A');
  }
};

/** The glass of a window: the room's dark, the sky's reflection banded down it, what's in there, the glints. */
const glassIn = (g: Ctx, x: number, y: number, w: number, h: number, seed: number, curtain: string, arched = false, inside = true) => {
  g.save(); pane(g, x, y, w, h, arched); g.clip();
  bandedGradient(g, x, y, w, h, ['#86A8D4', '#4E6E9E', '#2A3C62', '#1A2440'], 4);
  if (inside) room(g, x, y, w, h, seed, curtain);
  glints(g, x, y, w, h);
  g.restore();
};

const windowAt = (g: Ctx, x: number, y: number, w: number, h: number, b: Bldg, seed: number) => {
  const arched = b.win === 'arch', t = rampOf(b.trim);
  // shutters, louvered
  if (b.shutter) for (const sx of [x - 14, x + w + 4]) {
    const s = rampOf(b.shutter);
    box(g, sx - 1, y - 3, 12, h + 6, INK); box(g, sx, y - 2, 10, h + 4, s[2]);
    for (let yy = y + 1; yy < y + h; yy += 3) { box(g, sx + 1, yy, 8, 1, s[1]); box(g, sx + 1, yy + 1, 8, 1, s[3]); }
    box(g, sx, y - 2, 1, h + 4, s[4]);
  }
  // the head over it
  if (b.win === 'colonial' || b.win === 'chicago') {
    const l = rampOf(b.trim);
    box(g, x - 7, y - 12, w + 14, 9, INK); box(g, x - 6, y - 11, w + 12, 7, l[2]); box(g, x - 6, y - 11, w + 12, 1, l[4]); box(g, x - 6, y - 5, w + 12, 1, l[1]);
    if (b.win === 'colonial') { box(g, x + w / 2 - 5, y - 14, 10, 11, INK); box(g, x + w / 2 - 4, y - 13, 8, 9, l[3]); box(g, x + w / 2 + 2, y - 13, 2, 9, l[1]); }
    else for (let i = x; i < x + w; i += 12) box(g, i, y - 8, 1, 2, l[0]);
  } else if (b.win === 'sash') {
    const brick = dark(b.wall, 0.18);
    for (let i = x - 4; i < x + w + 4; i += 4) { box(g, i, y - 10, 3, 7, brick); box(g, i, y - 10, 3, 1, lite(brick, 0.2)); }
    if (b.trim === '#2F6B3A' || b.trim === '#3F7A3A') { box(g, x - 4, y - 4, w + 8, 2, t[2]); }
  } else { box(g, x + w / 2 - 4, y - 7, 8, 8, INK); box(g, x + w / 2 - 3, y - 6, 6, 6, t[3]); }
  // the casing: lit up and left, shaded down and right
  g.fillStyle = INK; pane(g, x - 4, y - 4, w + 8, h + 8, arched); g.fill();
  g.fillStyle = t[1]; pane(g, x - 3, y - 3, w + 6, h + 6, arched); g.fill();
  g.fillStyle = t[3]; pane(g, x - 3, y - 3, w + 5, h + 5, arched); g.fill();
  g.fillStyle = t[2]; pane(g, x - 2, y - 2, w + 4, h + 4, arched); g.fill();
  glassIn(g, x, y, w, h, seed, b.curtain, arched);
  // the bars across it
  const bar = (bx: number, by: number, bw: number, bh: number) => { box(g, bx, by, bw, bh, t[2]); if (bw > bh) box(g, bx, by + bh, bw, 1, t[0]); else box(g, bx + bw, by, 1, bh, t[0]); };
  if (b.win === 'sash') { bar(x, y + h / 2 - 1, w, 3); bar(x + w / 2 - 1, y, 2, h / 2); }
  else if (b.win === 'arch') { bar(x + w / 2 - 1, y, 2, h); bar(x, y + w / 2, w, 2); }
  else if (b.win === 'chicago') { bar(x + w * 0.25, y, 2, h); bar(x + w * 0.75 - 2, y, 2, h); bar(x, y + Math.round(h * 0.28), w, 2); }
  else { for (const k of [1, 2]) bar(x + Math.round(w * k / 3) - 1, y, 1, h); for (const k of [1, 2, 3]) bar(x, y + Math.round(h * k / 4) - (k === 2 ? 1 : 0), w, k === 2 ? 2 : 1); }
  // the sill, and the streak of grime it leaves under itself
  box(g, x - 7, y + h + 2, w + 14, 6, INK); box(g, x - 6, y + h + 3, w + 12, 4, t[2]); box(g, x - 6, y + h + 3, w + 12, 1, t[4]); box(g, x - 6, y + h + 6, w + 12, 1, t[0]);
  box(g, x + Math.round(w * 0.3), y + h + 8, 2, 10, 'rgba(26, 11, 6, 0.14)'); box(g, x + Math.round(w * 0.7), y + h + 8, 2, 6, 'rgba(26, 11, 6, 0.1)');
};

/** New Orleans' iron lace: a dim deck, a railing of curls, ferns hung under it, the beads from last night. */
const balcony = (g: Ctx, x0: number, w: number, deckY: number) => {
  const iron = '#1D1F2A', ironHi = '#4A4E66', deck = rampOf(dim('#5B5F6E'));
  box(g, x0, deckY + 6, w, 6, SHADOW); checker(g, x0, deckY + 12, w, 2, SHADOW);
  g.strokeStyle = iron; g.lineWidth = 2;
  for (let bx = x0 + 8; bx < x0 + w; bx += 54) { g.beginPath(); g.moveTo(bx, deckY + 5); g.quadraticCurveTo(bx, deckY + 16, bx + 10, deckY + 16); g.stroke(); }
  box(g, x0 - 1, deckY - 1, w + 2, 7, INK); box(g, x0, deckY, w, 3, deck[2]); box(g, x0, deckY + 3, w, 2, deck[0]);
  const ry = deckY - 20;
  box(g, x0, ry, w, 3, iron); box(g, x0, ry, w, 1, ironHi); box(g, x0, deckY - 3, w, 2, iron);
  for (let px = x0; px <= x0 + w - 2; px += 4) box(g, px, ry + 3, 1, 15, iron);
  g.lineWidth = 1;
  for (let px = x0 + 6; px < x0 + w - 4; px += 12) {
    g.beginPath(); g.arc(px, ry + 10, 4, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(px + 6, ry + 6, 2, 0, Math.PI * 2); g.stroke();
  }
  for (let px = x0; px <= x0 + w - 3; px += 56) { box(g, px, ry - 3, 3, 23, iron); box(g, px, ry - 3, 1, 23, ironHi); box(g, px - 1, ry - 5, 5, 2, iron); }
  // the beads, swagged on the rail and dangling
  const bead = ['#9333EA', '#16A34A', '#EAB308'];
  for (let sx = x0 + 4, i = 0; sx < x0 + w - 28; sx += 28, i++) {
    if (hash(sx) < 0.35) continue;
    const col = bead[i % 3];
    for (let k = 0; k <= 7; k++) { const u = k / 7, px = sx + u * 28, py = ry + 2 + Math.sin(u * Math.PI) * 9; box(g, px, py, 2, 2, col); box(g, px, py, 1, 1, '#FFFFFF'); }
    if (hash(sx + 3) > 0.5) for (let k = 0; k < 6; k++) box(g, sx + 14, deckY + 6 + k * 3, 2, 2, bead[(i + 1) % 3]);
  }
  // ferns in baskets
  for (let fx = x0 + 40; fx < x0 + w - 20; fx += 84) {
    box(g, fx, deckY + 5, 1, 6, iron);
    pixelBlob(g, fx, deckY + 16, 13, 5, '#24521F');
    for (let k = 0; k < 7; k++) { const dx = -12 + k * 4; box(g, fx + dx, deckY + 16, 2, 6 + Math.round(hash(fx + k) * 10), k % 2 ? '#2F6B2A' : '#4C8F3A'); }
    pixelBlob(g, fx - 1, deckY + 14, 10, 4, '#4C8F3A');
    box(g, fx - 6, deckY + 11, 12, 6, '#6B4423'); box(g, fx - 6, deckY + 11, 12, 1, '#8A5A30'); box(g, fx - 6, deckY + 16, 12, 1, INK);
  }
};

/** A lantern on a bracket off the shopfront: New Orleans' gas, Boston's colonial (the flame's drawn live). */
const lanternBody = (g: Ctx, x: number, y: number, gas: boolean) => {
  const iron = gas ? '#3A2A1E' : '#1A1A22';
  box(g, x - 1, y - 16, 2, 8, iron); box(g, x - 6, y - 16, 12, 2, iron);
  box(g, x - 8, y - 5, 16, 3, INK);
  poly(g, [[x - 7, y - 4], [x + 7, y - 4], [x + 4, y - 10], [x - 4, y - 10]], iron);
  ball(g, x, y - 11, 2, gas ? '#B87333' : '#E8B400', false);
  box(g, x - 6, y - 3, 12, 16, INK);
  bandedGradient(g, x - 5, y - 2, 10, 14, ['#FFF6D0', '#FDE68A', '#F2B84B'], 3);
  box(g, x - 1, y - 2, 2, 14, iron);
  box(g, x - 7, y + 13, 14, 3, iron); poly(g, [[x - 4, y + 16], [x + 4, y + 16], [x, y + 21]], iron);
};

const awning = (g: Ctx, x: number, y: number, w: number, cols: [string, string]) => {
  const n = Math.round(w / 16), drop = 18, flare = 6, W2 = w + flare * 2;
  for (let i = 0; i < n; i++) {
    const r = rampOf(dim(i % 2 ? cols[1] : cols[0]));
    const xa = x + i * w / n, xb = x + (i + 1) * w / n, xa2 = x - flare + i * W2 / n, xb2 = x - flare + (i + 1) * W2 / n;
    const mid = (a: number, b: number) => a + (b - a) * 0.35;
    poly(g, [[xa, y], [xb, y], [xb2, y + drop], [xa2, y + drop]], r[2]);
    poly(g, [[xa, y], [xb, y], [mid(xb, xb2), y + drop * 0.35], [mid(xa, xa2), y + drop * 0.35]], r[1]);
    g.fillStyle = r[1]; g.beginPath(); g.arc((xa2 + xb2) / 2, y + drop, (xb2 - xa2) / 2, 0, Math.PI); g.fill();
    box(g, (xa2 + xb2) / 2 - 2, y + drop + 1, 4, 2, r[0]);
  }
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w + flare, y + drop); g.lineTo(x - flare, y + drop); g.closePath(); g.stroke();
  box(g, x - flare, y + drop + 9, W2, 4, SHADOW); checker(g, x - flare, y + drop + 13, W2, 2, SHADOW);
};

const door = (g: Ctx, x: number, y: number, w: number, h: number, b: Bldg) => {
  const tr = rampOf(b.trim), dr = rampOf(b.door);
  box(g, x - 5, y - 5, w + 10, h + 5, INK);
  box(g, x - 4, y - 4, w + 8, h + 4, tr[1]); box(g, x - 4, y - 4, w + 8, 2, tr[3]); box(g, x - 4, y - 4, 2, h + 4, tr[3]);
  // the transom, the number in gold leaf
  glassIn(g, x, y, w, 12, 0, b.curtain, false, false);
  tiny(g, '1776', x + w / 2, y + 10, '#E8C25A', 6, '#5C4210', gilt(6, '#5C4210'));
  box(g, x, y + 12, w, 2, tr[2]);
  // the door: its glass, the OPEN card hung in it, panels, a brass kick plate, the handle
  const dy = y + 14, dh = h - 14;
  box(g, x, dy, w, dh, dr[2]); box(g, x, dy, 2, dh, dr[3]); box(g, x + w - 2, dy, 2, dh, dr[0]); box(g, x, dy, w, 2, dr[3]);
  box(g, x + 7, dy + 5, w - 14, 38, INK);
  glassIn(g, x + 8, dy + 6, w - 16, 36, 0.15, b.curtain, false, true);
  const ox = Math.round(x + w / 2 - 15), oy = dy + 16;
  box(g, x + w / 2 - 8, dy + 7, 1, 9, '#C8C2B6'); box(g, x + w / 2 + 7, dy + 7, 1, 9, '#C8C2B6');
  box(g, ox, oy, 30, 12, INK); box(g, ox + 1, oy + 1, 28, 10, '#F8F4E8'); box(g, ox + 1, oy + 9, 28, 2, '#D8D2C2');
  tiny(g, 'OPEN', x + w / 2, oy + 10, '#B91C1C', 6, null);
  box(g, x + 8, dy + 48, w - 16, 14, dr[1]); box(g, x + 8, dy + 61, w - 16, 1, dr[3]); box(g, x + w - 9, dy + 48, 1, 14, dr[3]); box(g, x + 8, dy + 48, w - 16, 1, dr[0]);
  box(g, x + 2, dy + dh - 10, w - 4, 8, '#9A6A22'); box(g, x + 2, dy + dh - 10, w - 4, 2, '#F0C860'); box(g, x + 2, dy + dh - 3, w - 4, 1, '#5C3A10');
  box(g, x + w - 12, dy + 40, 3, 12, INK); box(g, x + w - 11, dy + 41, 1, 10, '#F0C860'); ball(g, x + w - 10, dy + 46, 2, '#E8B400');
  box(g, x - 8, GY - 4, w + 16, 4, '#9C958A'); box(g, x - 8, GY - 4, w + 16, 1, '#C8C2B6');
};

/** A bill on the wall by the door: a header, lines of small print, a star. */
const poster = (g: Ctx, x: number, y: number, col: string, seed: number) => {
  box(g, x - 1, y - 1, 32, 46, INK); box(g, x, y, 30, 44, '#F2EBDA'); box(g, x, y, 30, 10, col); box(g, x, y, 30, 1, lite(col, 0.4));
  shinyStar(g, x + 15, y + 19, 6, '#E8B400');
  for (let i = 0; i < 5; i++) box(g, x + 4, y + 28 + i * 3, 22 - Math.round(hash(seed + i) * 10), 1, '#6B6358');
  box(g, x + 26, y, 4, 44, 'rgba(26, 11, 6, 0.12)');
};

// ---------------------------------------------------------------------------------------------------------------
// The shop windows: whatever they're selling, tacky as it gets

const bootShape = (g: Ctx, x: number, y: number, col: string, flagged = false) => {
  const r = rampOf(col);
  poly(g, [[x - 1, y - 1], [x + 9, y - 1], [x + 9, y + 11], [x + 17, y + 14], [x + 17, y + 18], [x - 1, y + 18]], INK);
  box(g, x, y, 8, 12, r[2]); poly(g, [[x, y + 11], [x + 9, y + 11], [x + 16, y + 14], [x + 16, y + 17], [x, y + 17]], r[2]);
  box(g, x, y, 2, 17, r[3]); box(g, x + 1, y + 15, 15, 2, r[0]); box(g, x, y + 16, 4, 2, INK);
  if (flagged) { for (let i = 0; i < 4; i++) box(g, x + 2, y + 2 + i * 3, 6, 1, FLAG_RED[2]); box(g, x, y, 4, 5, FLAG_BLUE[2]); }
  else { box(g, x + 3, y + 3, 1, 6, r[4]); box(g, x + 5, y + 4, 1, 4, r[1]); }
};
const tee = (g: Ctx, x: number, y: number, col: string, print: number) => {
  const shape: Pt[] = [[x - 5, y], [x - 13, y + 4], [x - 16, y + 11], [x - 10, y + 13], [x - 9, y + 26], [x + 9, y + 26], [x + 10, y + 13], [x + 16, y + 11], [x + 13, y + 4], [x + 5, y]];
  poly(g, shape, col); g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); shape.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.stroke();
  box(g, x + 4, y + 3, 5, 22, 'rgba(26, 11, 6, 0.18)'); box(g, x - 8, y + 13, 2, 12, 'rgba(255, 255, 255, 0.18)');
  box(g, x - 3, y, 6, 2, dark(col, 0.4));
  if (print === 0) shinyStar(g, x, y + 13, 5, col === '#F8FAFC' ? '#1E3A8A' : '#F8FAFC');
  else if (print === 1) for (let i = 0; i < 3; i++) box(g, x - 6, y + 9 + i * 4, 12, 2, FLAG_RED[2]);
  else tiny(g, 'USA', x, y + 16, '#F8FAFC', 5, null);
  box(g, x - 1, y - 5, 2, 5, '#9CA3AF');
};
const fishShape = (g: Ctx, x: number, y: number, s: number, rot: number) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  poly(g, [[-9, 0], [-15, -5], [-14, 0], [-15, 5]], '#5E6A78');
  oval(g, 0, 0, 11, 5, INK); oval(g, 0, 0, 10, 4, '#8E9AA8'); oval(g, -1, -1.5, 8, 2, '#C4CED8'); oval(g, 1, 2, 7, 1.5, '#E6ECF2');
  box(g, 5, -2, 2, 2, INK); box(g, 5, -2, 1, 1, '#FFFFFF');
  g.restore();
};

const stock = (g: Ctx, id: Id, k: number, x: number, y: number, w: number, h: number) => {
  switch (`${id}${k}`) {
    case 'nola0': {
      box(g, x, y + 28, w, h - 28, '#3A2A22'); box(g, x, y + 28, w, 3, '#6B4A32');
      box(g, x + 112, y + 14, 46, 13, '#22302A'); for (let i = 0; i < 3; i++) box(g, x + 116, y + 17 + i * 3, 30 - i * 7, 1, '#E7E5E4');
      disc(g, x + 92, y + 20, 5, SIL); box(g, x + 87, y + 11, 10, 6, '#F1EFEA'); box(g, x + 84, y + 25, 16, 6, '#E7E2D6');
      for (let t = 0; t < 2; t++) {
        const tx = x + 10 + t * 80, ty = y + h - 12;
        box(g, tx - 2, ty, 68, 4, '#A8AEB8'); box(g, tx - 2, ty, 68, 1, '#E2E6EC'); box(g, tx - 2, ty + 3, 68, 1, '#5E646E');
        for (let i = 0; i < 5; i++) for (let r = 0; r < 2; r++) {
          if (r && i === 4) continue;
          const px = tx + i * 12 + r * 6, py = ty - 7 - r * 6;
          box(g, px, py, 11, 7, INK); box(g, px + 1, py + 1, 9, 5, '#D49A50'); box(g, px + 1, py + 1, 9, 2, '#F0C984'); checker(g, px + 1, py, 9, 3, '#FFFFFF');
        }
      }
      box(g, x + 150, y + h - 22, 12, 12, INK); box(g, x + 151, y + h - 21, 10, 10, '#F1EFEA'); box(g, x + 151, y + h - 21, 10, 2, '#4A2A14'); box(g, x + 161, y + h - 18, 3, 5, '#F1EFEA');
      checker(g, x, y + h - 4, w, 2, 'rgba(255, 255, 255, 0.45)');
      break;
    }
    case 'nola1': {
      box(g, x, y + 30, w, 3, '#3B2A1E'); box(g, x, y + 33, w, h - 33, '#241A2E');
      for (let i = 0; i < 4; i++) { const sx = x + 14 + i * 38; disc(g, sx, y + 24, 6, INK); disc(g, sx, y + 24, 5, '#E7E2D6'); box(g, sx - 3, y + 22, 2, 2, INK); box(g, sx + 1, y + 22, 2, 2, INK); box(g, sx - 2, y + 27, 4, 1, INK); }
      for (let i = 0; i < 5; i++) { const cx = x + 30 + i * 30, col = ['#B91C1C', '#1A1A22', '#7C3AED'][i % 3]; box(g, cx, y + 36, 4, 10, col); box(g, cx + 1, y + 33, 2, 3, '#FDE68A'); box(g, cx + 1, y + 34, 1, 1, '#FFFFFF'); }
      for (let i = 0; i < 3; i++) {
        const dx = x + 22 + i * 56, dy = y + h - 22;
        box(g, dx - 9, dy + 3, 18, 3, INK); box(g, dx - 8, dy + 4, 16, 1, '#B89A6A');
        box(g, dx - 4, dy, 8, 18, INK); box(g, dx - 3, dy + 1, 6, 16, '#C8A876');
        disc(g, dx, dy - 4, 6, INK); disc(g, dx, dy - 4, 5, '#C8A876');
        for (const ex of [-3, 1]) { box(g, dx + ex, dy - 6, 2, 1, INK); box(g, dx + ex, dy - 5, 1, 1, INK); box(g, dx + ex + 1, dy - 5, 1, 1, INK); }
        for (let p = 0; p < 3; p++) { const px = dx - 2 + p * 2, py = dy + 4 + p * 4; box(g, px, py, 5, 1, '#9CA3AF'); box(g, px + 5, py - 1, 2, 2, ['#EF4444', '#22C55E', '#EAB308'][p]); }
      }
      for (const [mx, col] of [[x + 50, '#7C3AED'], [x + 106, '#16A34A']] as const) {
        oval(g, mx, y + h - 14, 12, 5, INK); oval(g, mx, y + h - 14, 11, 4, col); box(g, mx - 7, y + h - 15, 4, 2, INK); box(g, mx + 3, y + h - 15, 4, 2, INK);
        box(g, mx - 11, y + h - 18, 22, 1, '#EAB308'); for (let f = 0; f < 3; f++) box(g, mx + 8 + f * 2, y + h - 26 + f, 1, 8, ['#EAB308', '#9333EA', '#16A34A'][f]);
      }
      break;
    }
    case 'nash0': {
      box(g, x, y, w, 38, '#5C1414'); for (let i = 0; i < w; i += 8) { box(g, x + i, y, 2, 38, '#7F1D1D'); box(g, x + i + 2, y, 1, 38, '#3A0A0A'); }
      poly(g, [[x + 40, y], [x + 52, y], [x + 70, y + 40], [x + 22, y + 40]], 'rgba(253, 230, 138, 0.16)');
      poly(g, [[x + 116, y], [x + 128, y], [x + 146, y + 40], [x + 98, y + 40]], 'rgba(253, 230, 138, 0.16)');
      for (let i = 0; i < 18; i++) { const lx = x + 4 + i * 9, ly = y + 12 + Math.round(Math.sin(i * 0.7) * 2); box(g, lx, ly, 2, 3, ['#EF4444', '#FDE047', '#3B82F6', '#22C55E'][i % 4]); }
      box(g, x, y + 40, w, 4, '#4A2A18'); box(g, x, y + 40, w, 1, '#8A5A30');
      for (let i = 0; i < 3; i++) {
        const px = x + 30 + i * 50, py = y + 22;
        box(g, px - 8, py - 7, 16, 2, SIL); box(g, px - 4, py - 11, 8, 4, SIL); disc(g, px, py - 2, 4, SIL); box(g, px - 6, py + 2, 12, 16, SIL);
        if (i !== 1) { oval(g, px + 3, py + 12, 7, 5, SIL, -0.4); box(g, px + 6, py + 2, 12, 2, SIL); } else { box(g, px + 8, py - 2, 1, 22, SIL); disc(g, px + 8, py - 3, 2, SIL); }
      }
      for (let i = 0; i < 4; i++) { const sx = x + 20 + i * 42; disc(g, sx, y + h - 10, 6, '#7A4A22'); box(g, sx - 6, y + h - 11, 12, 2, '#A0703A'); box(g, sx - 1, y + h - 6, 2, 6, '#3A2410'); }
      break;
    }
    case 'nash1': {
      box(g, x, y, w, h, '#3A2414'); for (let i = 0; i < w; i += 14) box(g, x + i, y, 1, h, '#2A180C');
      for (const sy of [y + 30, y + h - 6]) { box(g, x, sy, w, 4, '#8A5A30'); box(g, x, sy, w, 1, '#B8834E'); box(g, x, sy + 4, w, 2, INK); }
      const cols = ['#7A4A22', '#B91C1C', '#E7E2D6', '#1E3A8A', '#5C3A1E', '#C08A3E', '#14532D', '#7A4A22'];
      for (let i = 0; i < 8; i++) bootShape(g, x + 6 + i * 20, y + 12, cols[i], i === 3);
      for (let i = 0; i < 7; i++) bootShape(g, x + 14 + i * 22, y + h - 24, cols[(i + 3) % 8], i === 5);
      box(g, x + 131, y + 19, 32, 9, '#F8F4E8'); box(g, x + 131, y + 19, 32, 1, '#FFFFFF'); signText(g, '$1776', x + 147, y + 27, print(5, '#B91C1C'));
      break;
    }
    case 'chi0': {
      g.fillStyle = tilePattern(g, 'usaChiTile', 8, 8, t => { t.fillStyle = '#DCD6C8'; t.fillRect(0, 0, 8, 8); t.fillStyle = '#B8B2A4'; t.fillRect(7, 0, 1, 8); t.fillRect(0, 7, 8, 1); });
      g.fillRect(x, y, w, 30);
      box(g, x, y, w, 30, 'rgba(26, 36, 64, 0.45)');
      box(g, x, y + h - 14, w, 14, '#B91C1C'); checker(g, x, y + h - 14, w, 14, '#F1EFEA', 0, 4);
      const px = x + 48, py = y + h - 30;
      box(g, px - 1, py + 1, 74, 17, INK); box(g, px, py + 4, 72, 12, '#3A3A40'); box(g, px, py + 4, 72, 2, '#6E6E78'); box(g, px, py + 14, 72, 2, '#1E1E24');
      box(g, px, py, 72, 5, '#D49A50'); box(g, px, py, 72, 1, '#F0C984');
      box(g, px + 2, py - 4, 68, 5, '#B91C1C'); for (let i = 0; i < 9; i++) box(g, px + 5 + i * 7, py - 5 + (i % 2), 3, 2, '#E04A3A');
      poly(g, [[px + 64, py - 12], [px + 96, py - 22], [px + 98, py - 6], [px + 70, py + 0]], '#D49A50');
      poly(g, [[px + 65, py - 12], [px + 96, py - 22], [px + 96, py - 17], [px + 66, py - 7]], '#F4D03F');
      for (let i = 0; i < 4; i++) box(g, px + 70 + i * 6, py - 12 - i * 2, 3, 3, '#7A3A1E');
      poly(g, [[px + 64, py - 14], [px + 96, py - 24], [px + 96, py - 21], [px + 64, py - 11]], '#B91C1C');
      for (let i = 0; i < 4; i++) box(g, px + 60 + i * 2, py - 8 + i * 2, 1, 8 - i * 2, '#F4D03F');
      box(g, px + 96, py - 12, 30, 3, '#9CA3AF'); box(g, px + 120, py - 12, 14, 3, '#5C3A1E');
      disc(g, x + 20, y + 18, 7, SIL); box(g, x + 12, y + 25, 16, 10, SIL); box(g, x + 15, y + 8, 10, 4, '#F1EFEA');
      break;
    }
    case 'chi1': {
      box(g, x, y, w, h, '#2A3346');
      box(g, x + 4, y + 8, w - 8, 2, '#9CA3AF'); box(g, x + 4, y + 8, w - 8, 1, '#E2E6EC');
      const cols = ['#1E3A8A', '#B91C1C', '#F8FAFC', '#6B7280', '#EAB308'];
      for (let i = 0; i < 5; i++) {
        if (i === 3) { g.save(); g.translate(x + 18 + i * 32, y + 15); g.rotate(-0.5); tee(g, 0, 0, cols[i], i % 3); g.restore(); }
        else tee(g, x + 18 + i * 32, y + 15, cols[i], i % 3);
      }
      for (let i = 0; i < 3; i++) box(g, x + 116 + i * 6, y + 18 + i * 5, 10, 1, 'rgba(255, 255, 255, 0.35)');
      box(g, x, y + h - 8, w, 8, '#5C3A1E'); box(g, x, y + h - 8, w, 1, '#8A5A30');
      for (let i = 0; i < 4; i++) { const sx = x + 10 + i * 40; box(g, sx, y + h - 13, 28, 5, cols[(i + 2) % 5]); box(g, sx, y + h - 13, 28, 1, lite(cols[(i + 2) % 5], 0.3)); box(g, sx, y + h - 9, 28, 1, INK); }
      break;
    }
    case 'sea0': {
      box(g, x, y, w, h, '#2E2620'); box(g, x, y + 4, w, 2, '#4A3A2E');
      box(g, x, y + h - 9, w, 9, '#5B3A22'); box(g, x, y + h - 9, w, 1, '#8A5A30');
      slab(g, x + 8, y + 18, 52, 30, '#B8BCC4');
      for (const gx of [x + 18, x + 46]) { box(g, gx - 4, y + 34, 8, 4, '#3A3A40'); box(g, gx - 2, y + 38, 4, 3, '#1E1E24'); }
      disc(g, x + 34, y + 26, 5, INK); disc(g, x + 34, y + 26, 4, '#F1EFEA'); box(g, x + 34, y + 23, 1, 3, '#B91C1C');
      eagle(g, x + 34, y + 12, 0.35);
      const sizes = [[8, 10, 'S'], [11, 14, 'M'], [14, 18, 'L'], [18, 23, 'XL'], [24, 30, 'USA']] as const;
      let cx = x + 72;
      for (const [cw, ch, lab] of sizes) {
        const cy = y + h - 9 - ch;
        box(g, cx - 1, cy - 1, cw + 2, ch + 1, INK); box(g, cx, cy, cw, ch, '#F1EFEA'); box(g, cx, cy, 2, ch, '#FFFFFF'); box(g, cx + cw - 2, cy, 2, ch, '#C8C2B6');
        box(g, cx, cy + Math.round(ch * 0.4), cw, Math.max(2, Math.round(ch * 0.25)), '#2F6B3A');
        box(g, cx - 1, cy - 3, cw + 2, 3, '#E2DDD0'); box(g, cx - 1, cy - 3, cw + 2, 1, INK);
        tiny(g, lab, cx + cw / 2, y + h - 1, '#FEF3C7', 5, null);
        cx += cw + 6;
      }
      break;
    }
    case 'sea1': {
      box(g, x, y, w, h, '#26313E'); for (let i = 0; i < w; i += 10) box(g, x + i, y, 1, 30, '#1C2530');
      // (the mongers: one throwing, one catching; the fish in the air is live)
      for (const [mx, up] of [[x + 12, true], [x + w - 12, false]] as const) {
        disc(g, mx, y + 18, 5, SIL); box(g, mx - 7, y + 23, 14, h, SIL); box(g, mx - 6, y + 23, 12, 18, '#E7E2D6');
        if (up) { box(g, mx + 5, y + 10, 3, 14, SIL); box(g, mx - 8, y + 12, 3, 12, SIL); } else { box(g, mx - 12, y + 18, 8, 3, SIL); box(g, mx + 4, y + 20, 6, 3, SIL); }
      }
      box(g, x + 24, y + h - 16, w - 48, 16, '#D8EEF8'); checker(g, x + 24, y + h - 16, w - 48, 16, '#A9D6EE'); box(g, x + 24, y + h - 16, w - 48, 1, '#FFFFFF');
      for (let i = 0; i < 6; i++) fishShape(g, x + 38 + i * 17, y + h - 12 + (i % 2) * 3, 0.8, (i % 2 ? 0.25 : -0.25));
      const cx = x + w - 40, cy = y + h - 20;
      oval(g, cx, cy, 9, 6, INK); oval(g, cx, cy, 8, 5, '#C2410C'); oval(g, cx - 2, cy - 2, 4, 2, '#F97316');
      disc(g, cx - 10, cy - 4, 3, '#C2410C'); disc(g, cx + 10, cy - 4, 3, '#C2410C'); box(g, cx - 3, cy - 7, 1, 3, INK); box(g, cx + 2, cy - 7, 1, 3, INK);
      box(g, x + 30, y + 6, 60, 10, '#F8F4E8'); tiny(g, 'FRESH-ISH', x + 60, y + 14, '#0E7490', 6, null);
      break;
    }
    case 'bos0': {
      box(g, x, y, w, h, '#2A2620'); for (let i = 0; i < w; i += 20) box(g, x + i, y, 1, 30, '#1E1A16');
      box(g, x, y + h - 8, w, 8, '#5B3A22'); box(g, x, y + h - 8, w, 1, '#8A5A30');
      for (let i = 0; i < 3; i++) {
        const cx = x + 22 + i * 34, cy = y + h - 17;
        oval(g, cx, cy, 13, 9, INK); oval(g, cx, cy, 12, 8, '#B8752E'); oval(g, cx - 3, cy + 1, 6, 5, '#D49A50');
        oval(g, cx, cy - 4, 10, 3, INK); oval(g, cx, cy - 4, 9, 2, '#F3EBD6'); box(g, cx - 3, cy - 5, 2, 1, '#9CA3AF'); box(g, cx + 2, cy - 4, 1, 1, '#16A34A');
      }
      const lx = x + 136, ly = y + h - 18;
      oval(g, lx, ly, 14, 6, INK); oval(g, lx, ly, 13, 5, '#B91C1C'); oval(g, lx - 3, ly - 2, 7, 2, '#EF4444');
      for (let i = 0; i < 4; i++) box(g, lx + 8 + i * 3, ly - 2, 1, 5, '#7F1D1D');
      disc(g, lx - 16, ly - 8, 5, '#B91C1C'); disc(g, lx - 6, ly - 12, 4, '#B91C1C'); box(g, lx - 18, ly - 10, 2, 2, INK);
      box(g, lx - 10, ly - 18, 1, 10, '#7F1D1D'); box(g, lx - 6, ly - 22, 1, 10, '#7F1D1D');
      break;
    }
    default: {
      box(g, x, y, w, h, '#2A2430'); box(g, x, y + h - 8, w, 8, '#5B3A22'); box(g, x, y + h - 8, w, 1, '#8A5A30');
      for (const [cx, cy] of [[x + 10, y + h - 22], [x + 34, y + h - 22], [x + 22, y + h - 36]] as const) {
        slab(g, cx, cy, 24, 14, '#8A5A2E'); tiny(g, 'TEA', cx + 12, cy + 10, '#3A2410', 6, null);
      }
      for (const hx of [x + 76, x + 104]) {
        box(g, hx - 1, y + 28, 2, h - 36, '#5C3A1E');
        poly(g, [[hx - 13, y + 26], [hx, y + 16], [hx + 13, y + 26], [hx, y + 30]], INK);
        poly(g, [[hx - 11, y + 25], [hx, y + 18], [hx + 11, y + 25], [hx, y + 28]], '#22222A');
        box(g, hx - 10, y + 25, 20, 1, GOLD); disc(g, hx + 5, y + 22, 2, FLAG_RED[2]); box(g, hx + 5, y + 22, 1, 1, '#FFFFFF');
      }
      for (const bx of [x + 130, x + 152]) {
        poly(g, [[bx - 9, y + h - 10], [bx - 6, y + h - 26], [bx + 6, y + h - 26], [bx + 9, y + h - 10]], INK);
        poly(g, [[bx - 8, y + h - 11], [bx - 5, y + h - 25], [bx + 5, y + h - 25], [bx + 8, y + h - 11]], '#A0702A');
        box(g, bx - 5, y + h - 25, 3, 13, '#C8963E'); box(g, bx + 1, y + h - 22, 1, 8, INK); box(g, bx - 3, y + h - 29, 6, 3, '#5C3A1E');
      }
      break;
    }
  }
};

const storefront = (g: Ctx, id: Id, k: number, bx: number, b: Bldg) => {
  const [name, face, ink] = b.shop, tr = rampOf(b.trim);
  box(g, bx, SY - 18, BW, 8, INK); box(g, bx, SY - 17, BW, 6, dim(b.trim)); box(g, bx, SY - 17, BW, 1, lite(dim(b.trim), 0.2));
  slab(g, bx + 4, SY - 8, BW - 8, 46, dark(b.trim, 0.45));
  sign(g, bx + 20, SY, BW - 40, 30, face, name, ink, 9, INK, federal({ sx: 1, sy: 2 }, ink, mix(face, INK, 0.45)));
  for (const px of [bx + 4, bx + BW - 18]) {
    slab(g, px, SY + 38, 14, GY - SY - 38, b.trim);
    box(g, px - 2, SY + 38, 18, 5, INK); box(g, px - 1, SY + 39, 16, 3, tr[3]);
    box(g, px - 2, GY - 12, 18, 12, INK); box(g, px - 1, GY - 11, 16, 11, tr[1]); box(g, px - 1, GY - 11, 16, 1, tr[3]);
  }
  awning(g, bx + 22, SY + 40, BW - 44, b.awn);
  const wx = bx + 30, wy = SY + 70, ww = 170, wh = 58;
  box(g, wx - 6, wy - 6, ww + 12, wh + 12, INK); box(g, wx - 5, wy - 5, ww + 10, wh + 10, tr[1]); box(g, wx - 5, wy - 5, ww + 10, 2, tr[3]); box(g, wx - 5, wy - 5, 2, wh + 10, tr[3]);
  box(g, wx - 1, wy - 1, ww + 2, wh + 2, INK);
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  bandedGradient(g, wx, wy, ww, wh, ['#3D4E6E', '#2A3550', '#1E2538', '#171B29'], 4);
  stock(g, id, k, wx, wy, ww, wh);
  tiny(g, b.glass, wx + ww / 2, wy + 9, '#E8C25A', 6, '#5C4210', gilt(6, '#5C4210'));
  glints(g, wx, wy, ww, wh);
  g.restore();
  const ky = wy + wh + 5;
  box(g, wx - 6, ky - 1, ww + 12, GY - 3 - ky, INK);
  box(g, wx - 5, ky, ww + 10, GY - 5 - ky, dark(b.trim, 0.25)); box(g, wx - 5, ky, ww + 10, 1, lite(dark(b.trim, 0.25), 0.3));
  for (const px of [wx + 2, wx + ww / 2 + 2]) { const pw = ww / 2 - 6, ph = GY - 11 - ky; box(g, px, ky + 3, pw, ph, dark(b.trim, 0.4)); box(g, px, ky + 3 + ph - 1, pw, 1, lite(dark(b.trim, 0.25), 0.25)); box(g, px + pw - 1, ky + 3, 1, ph, lite(dark(b.trim, 0.25), 0.25)); }
  door(g, bx + 214, SY + 56, 62, GY - 2 - (SY + 56), b);
  poster(g, bx + 286, SY + 74, b.awn[0], bx);
};

// ---------------------------------------------------------------------------------------------------------------
// The props along the front

const prop = (g: Ctx, kind: Prop, x: number) => {
  switch (kind) {
    case 'planter': {
      castShadow(g, x - 18, GY - 30, 36, 30);
      pixelBlob(g, x, GY - 24, 18, 8, '#24521F'); pixelBlob(g, x - 3, GY - 27, 12, 5, '#3F7A3A');
      for (let i = 0; i < 14; i++) { const px = Math.round(x - 15 + hash(x + i) * 28), py = Math.round(GY - 32 + hash(x + i * 3) * 9); box(g, px, py, 3, 3, [FLAG_RED[2], FLAG_WHITE[4], FLAG_BLUE[3]][i % 3]); box(g, px, py, 1, 1, '#FFFFFF'); }
      slab(g, x - 18, GY - 20, 36, 20, '#7A4A22');
      for (let px = x - 13; px < x + 16; px += 6) box(g, px, GY - 17, 1, 15, dark('#7A4A22', 0.3));
      shinyStar(g, x, GY - 10, 4, '#E8B400');
      break;
    }
    case 'news': {
      castShadow(g, x - 11, GY - 42, 22, 42);
      box(g, x - 9, GY - 12, 3, 12, '#2A2A2E'); box(g, x + 6, GY - 12, 3, 12, '#2A2A2E');
      slab(g, x - 11, GY - 40, 22, 30, '#1E3A8A');
      box(g, x - 11, GY - 44, 22, 6, INK); box(g, x - 10, GY - 43, 20, 4, RED); box(g, x - 10, GY - 43, 20, 1, '#F06A55');
      box(g, x - 8, GY - 36, 16, 12, INK); box(g, x - 7, GY - 35, 14, 10, '#EDE8DC');
      box(g, x - 6, GY - 34, 12, 2, INK); box(g, x - 6, GY - 31, 5, 4, '#6B6B6B'); for (let i = 0; i < 3; i++) box(g, x, GY - 31 + i * 2, 6, 1, '#8A8A8A');
      poly(g, [[x - 5, GY - 25], [x - 2, GY - 25], [x + 4, GY - 35], [x + 1, GY - 35]], 'rgba(255, 255, 255, 0.3)');
      box(g, x + 3, GY - 21, 5, 3, INK); box(g, x + 4, GY - 20, 3, 1, GOLD);
      break;
    }
    case 'trash': {
      castShadow(g, x - 11, GY - 34, 22, 34);
      pole(g, x - 10, GY - 28, 20, 28, '#2D51B0');
      box(g, x - 10, GY - 19, 20, 3, FLAG_RED[2]); box(g, x - 10, GY - 16, 20, 2, FLAG_WHITE[3]); box(g, x - 10, GY - 14, 20, 3, FLAG_RED[2]);
      shinyStar(g, x - 1, GY - 7, 4, '#F8FAFC');
      oval(g, x, GY - 29, 12, 4, INK); oval(g, x, GY - 30, 11, 3, '#1E3A8A'); oval(g, x - 3, GY - 31, 5, 1, '#4570D0');
      box(g, x - 3, GY - 36, 6, 4, INK); box(g, x - 2, GY - 35, 4, 2, '#4570D0');
      break;
    }
    case 'bench': {
      castShadow(g, x - 30, GY - 32, 60, 32);
      const wood = rampOf('#8A5A2E');
      for (let i = 0; i < 3; i++) { box(g, x - 31, GY - 33 + i * 5, 62, 4, INK); box(g, x - 30, GY - 32 + i * 5, 60, 3, wood[2]); box(g, x - 30, GY - 32 + i * 5, 60, 1, wood[3]); }
      box(g, x - 31, GY - 17, 62, 6, INK); box(g, x - 30, GY - 16, 60, 4, wood[2]); box(g, x - 30, GY - 16, 60, 1, wood[4]); box(g, x - 30, GY - 13, 60, 1, wood[0]);
      for (const ex of [x - 27, x + 21]) { box(g, ex, GY - 34, 6, 34, '#1D1F2A'); box(g, ex, GY - 34, 1, 34, '#4A4E66'); box(g, ex - 2, GY - 3, 10, 3, '#1D1F2A'); }
      box(g, x - 7, GY - 27, 14, 4, INK); box(g, x - 6, GY - 26, 12, 2, GOLD);
      break;
    }
    case 'hydrant': {
      castShadow(g, x - 8, GY - 28, 16, 28);
      box(g, x - 9, GY - 4, 18, 4, INK); box(g, x - 8, GY - 3, 16, 3, '#7F1D1D');
      pole(g, x - 6, GY - 22, 12, 19, '#C62828');
      box(g, x - 6, GY - 15, 12, 4, '#1E3A8A'); box(g, x - 4, GY - 14, 1, 1, '#FFFFFF'); box(g, x, GY - 13, 1, 1, '#FFFFFF'); box(g, x + 3, GY - 14, 1, 1, '#FFFFFF');
      box(g, x - 11, GY - 19, 5, 6, INK); box(g, x - 10, GY - 18, 4, 4, '#E7E2D6'); box(g, x + 6, GY - 19, 5, 6, INK); box(g, x + 6, GY - 18, 4, 4, '#C8C2B6');
      oval(g, x, GY - 23, 8, 4, INK); oval(g, x, GY - 23, 7, 3, '#F1EFEA'); box(g, x - 2, GY - 28, 4, 3, INK); box(g, x - 1, GY - 27, 2, 2, '#F1EFEA');
      break;
    }
    case 'aframe': {
      castShadow(g, x - 13, GY - 36, 26, 36);
      poly(g, [[x - 14, GY], [x - 7, GY - 36], [x + 7, GY - 36], [x + 14, GY]], INK);
      poly(g, [[x - 12, GY], [x - 6, GY - 34], [x + 6, GY - 34], [x + 12, GY]], '#7A4A22');
      poly(g, [[x - 9, GY - 4], [x - 4, GY - 31], [x + 4, GY - 31], [x + 9, GY - 4]], '#1F2A24');
      for (let i = 0; i < 4; i++) box(g, x - 5 + (i % 2), GY - 22 + i * 4, 10 - (i % 2) * 2, 1, '#D8D8D0');
      box(g, x - 3, GY - 28, 6, 2, '#F4A6A6');
      shinyStar(g, x + 4, GY - 8, 3, '#FDE047');
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The district touches: neon in Nashville, the market's clock sign in Seattle, Boston's steeple

const GUITAR = (bx: number, top: number): Pt => [bx + 92, top - 52];
const BOOTS = (bx: number, top: number): Pt => [bx + 186, top - 74];
const BLADE = (bx: number, top: number): Pt => [bx + 312, top + 22];
const MARKET = (bx: number, top: number) => ({ x0: bx + 34, ly: top - 20, cx: bx + 145, cy: top - 58 });
const WORD = 'PUBLIC-ISH MARKET';
const LIVE = ['L', 'I', 'V', 'E', '', 'M', 'U', 'S', 'I', 'C'];

const guitarBody = (c: Ctx, gx: number, gy: number) => { c.translate(gx, gy); c.rotate(-0.35); c.beginPath(); c.arc(0, 14, 18, -1.008, 4.149); c.arc(0, -10, 13, 2.401, 0.74 + Math.PI * 2); c.closePath(); c.moveTo(5, 2); c.arc(0, 2, 5, 0, Math.PI * 2); };
const guitarNeck = (c: Ctx, gx: number, gy: number) => { c.translate(gx, gy); c.rotate(-0.35); c.beginPath(); c.rect(-3, -64, 6, 42); c.rect(-5, -76, 10, 12); c.moveTo(-7, 20); c.lineTo(7, 20); };
const guitarStrings = (c: Ctx, gx: number, gy: number) => { c.translate(gx, gy); c.rotate(-0.35); c.beginPath(); for (const s of [-2, 0, 2]) { c.moveTo(s, 20); c.lineTo(s, -66); } };
const bootPath = (c: Ctx, x: number, y: number) => {
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14, y); c.lineTo(x + 15, y + 28); c.lineTo(x + 32, y + 36); c.lineTo(x + 34, y + 42); c.lineTo(x + 16, y + 42);
  c.lineTo(x + 15, y + 46); c.lineTo(x + 5, y + 46); c.lineTo(x + 3, y + 42); c.lineTo(x + 1, y + 28); c.closePath();
  c.moveTo(x + 3, y + 8); c.quadraticCurveTo(x + 8, y + 18, x + 12, y + 8);
};
/** A neon tube along a path: lit (a halo, the tube, its white-hot core) or dark (just the glass). */
const neon = (c: Ctx, on: boolean, col: string, build: (c: Ctx) => void) => {
  c.save(); build(c); c.restore();
  c.lineCap = 'round'; c.lineJoin = 'round';
  if (on) { c.strokeStyle = rgba(col, 0.22); c.lineWidth = 8; c.stroke(); c.strokeStyle = col; c.lineWidth = 3; c.stroke(); c.strokeStyle = lite(col, 0.65); c.lineWidth = 1; c.stroke(); }
  else { c.strokeStyle = dark(col, 0.55); c.lineWidth = 3; c.stroke(); c.strokeStyle = dark(col, 0.3); c.lineWidth = 1; c.stroke(); }
  c.lineCap = 'butt'; c.lineJoin = 'miter';
};
/** A steel strut from y0 down to y1 (what a rooftop sign stands on): stout enough to read, a foot plate where it's bolted down. */
const strut = (g: Ctx, x: number, y0: number, y1: number) => { const s = rampOf('#5A616E'); box(g, x - 2, y0, 7, y1 - y0, INK); box(g, x - 1, y0, 5, y1 - y0, s[2]); box(g, x - 1, y0, 1, y1 - y0, s[4]); box(g, x + 3, y0, 1, y1 - y0, s[0]); box(g, x - 4, y1 - 3, 11, 3, INK); box(g, x - 3, y1 - 3, 9, 2, s[3]); };

const steeple = (g: Ctx, bx: number, top: number, wallCol: string) => {
  const cx = bx + 230, wr = rampOf(dim('#EEEAE0'));
  g.fillStyle = wallPattern(g, 'brick', mix(wallCol, '#3A4A78', 0.12)); g.fillRect(cx - 30, top - 62, 60, 62);
  box(g, cx - 30, top - 62, 4, 62, 'rgba(255, 255, 255, 0.14)'); box(g, cx + 22, top - 62, 8, 62, SHADOW); checker(g, cx + 18, top - 62, 4, 62, SHADOW);
  for (let y = top - 60, i = 0; y < top - 4; y += 10, i++) for (const s of [0, 1]) { const w = i % 2 ? 7 : 11, x = s ? cx + 30 - w : cx - 30; box(g, x, y, w, 9, wr[2]); box(g, x, y, w, 1, wr[4]); }
  inkRect(g, cx - 31, top - 63, 62, 64);
  disc(g, cx, top - 32, 15, INK); disc(g, cx, top - 32, 14, wr[2]); disc(g, cx - 1, top - 33, 12, wr[3]);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; box(g, Math.round(cx + Math.cos(a) * 11), Math.round(top - 32 + Math.sin(a) * 11), 1, 1, INK); }
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, top - 32); g.lineTo(cx, top - 41); g.moveTo(cx, top - 32); g.lineTo(cx + 6, top - 29); g.stroke();
  slab(g, cx - 35, top - 70, 70, 8, wr[2]);
  slab(g, cx - 25, top - 112, 50, 42, wr[2]);
  g.fillStyle = INK; pane(g, cx - 13, top - 107, 26, 36, true); g.fill();
  g.fillStyle = '#141A2E'; pane(g, cx - 12, top - 106, 24, 35, true); g.fill();
  poly(g, [[cx - 7, top - 84], [cx - 5, top - 96], [cx + 5, top - 96], [cx + 7, top - 84]], '#A0702A'); box(g, cx - 5, top - 96, 3, 12, '#D8A848'); box(g, cx - 8, top - 85, 16, 2, '#7A5218'); box(g, cx - 1, top - 99, 2, 3, '#5C3A1E');
  for (let y = top - 80; y < top - 72; y += 3) box(g, cx - 12, y, 24, 1, wr[1]);
  for (const px of [cx - 25, cx + 19]) { box(g, px, top - 112, 6, 42, wr[3]); box(g, px + 5, top - 112, 1, 42, wr[1]); }
  slab(g, cx - 29, top - 118, 58, 7, wr[2]);
  slab(g, cx - 17, top - 138, 34, 20, wr[2]);
  for (const wx of [cx - 10, cx + 4]) { g.fillStyle = INK; pane(g, wx - 1, top - 135, 8, 14, true); g.fill(); g.fillStyle = '#2A3C62'; pane(g, wx, top - 134, 6, 12, true); g.fill(); }
  poly(g, [[cx - 16, top - 137], [cx, top - 190], [cx + 16, top - 137]], INK);
  poly(g, [[cx - 14, top - 138], [cx, top - 187], [cx, top - 138]], wr[3]);
  poly(g, [[cx, top - 187], [cx + 14, top - 138], [cx, top - 138]], wr[1]);
  for (let y = top - 180; y < top - 140; y += 8) box(g, cx - 1, y, 2, 1, wr[4]);
  box(g, cx - 1, top - 206, 2, 18, '#B8862E'); ball(g, cx, top - 190, 3, '#E8B400');
  box(g, cx - 12, top - 201, 24, 2, '#E8B400'); poly(g, [[cx + 12, top - 204], [cx + 17, top - 200], [cx + 12, top - 196]], '#E8B400'); poly(g, [[cx - 12, top - 204], [cx - 8, top - 200], [cx - 12, top - 196], [cx - 15, top - 196], [cx - 11, top - 200], [cx - 15, top - 204]], '#C9A23A');
};

const marketSign = (g: Ctx, bx: number, top: number) => {
  const { x0, ly, cx, cy } = MARKET(bx, top), s = rampOf(dim('#6B7280'));
  for (const px of [x0 + 4, x0 + 110, x0 + 214]) strut(g, px, ly - 16, top);
  strut(g, cx - 1, cy + 16, ly - 16);
  for (const py of [ly - 16, ly + 4]) { box(g, x0 - 9, py - 1, 238, 5, INK); box(g, x0 - 8, py, 236, 3, s[2]); box(g, x0 - 8, py, 236, 1, s[3]); }
  // (the neon's glass, dark: lit live, seaLive)
  for (let i = 0; i < WORD.length; i++) signText(g, WORD[i], x0 + i * 13 + 1, ly + 2, tube({ sx: 2, sy: 2 }, '#5A1612', false), 'left');
  disc(g, cx, cy, 20, INK); disc(g, cx, cy, 19, '#2F6B3A'); disc(g, cx - 1, cy - 1, 17, '#3F8A4A'); disc(g, cx, cy, 15, INK); disc(g, cx, cy, 14, '#E7E2D2'); disc(g, cx - 1, cy - 1, 12, '#F4F1E6');
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r = i % 3 ? 11 : 10; box(g, Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), i % 3 ? 1 : 2, i % 3 ? 1 : 2, INK); }
  box(g, cx + 21, cy - 7, 106, 14, INK); box(g, cx + 22, cy - 6, 104, 12, '#F4F1E6'); box(g, cx + 22, cy + 4, 104, 2, '#D8D2C2');
  tiny(g, '(LEGALLY DISTINCT)', cx + 74, cy + 3, '#7F1D1D', 5, null);
  strut(g, cx + 72, cy + 7, ly - 16);
  g.textAlign = 'left';
};

const nashNeonFrames = (g: Ctx, k: number, bx: number, top: number) => {
  if (k === 0) {
    const [gx, gy] = GUITAR(bx, top);
    strut(g, gx - 12, gy + 24, top); strut(g, gx + 10, gy + 22, top);
    neon(g, false, '#FF5FA2', c => guitarBody(c, gx, gy)); neon(g, false, '#FFD54A', c => guitarNeck(c, gx, gy));
    const [lx, ly] = BLADE(bx, top);
    box(g, lx - 6, ly + 8, 6, 3, INK); box(g, lx - 6, ly + 108, 6, 3, INK);
    slab(g, lx, ly, 22, 122, '#2A1A2E');
    for (let y = ly + 4; y < ly + 120; y += 8) { box(g, lx + 3, y, 2, 2, '#4A3A30'); box(g, lx + 17, y, 2, 2, '#4A3A30'); }
    LIVE.forEach((ch, i) => { if (ch) signText(g, ch, lx + 11, ly + 20 + i * 11, tube(8, '#4A2A2A', false)); });
  } else {
    const [x, y] = BOOTS(bx, top);
    strut(g, x + 8, y + 46, top); strut(g, x + 48, y + 46, top);
    box(g, x - 4, y + 48, 82, 4, INK); box(g, x - 3, y + 49, 80, 2, rampOf(dim('#6B7280'))[2]);
    neon(g, false, '#5CE1FF', c => bootPath(c, x, y)); neon(g, false, '#FF5FA2', c => bootPath(c, x + 40, y));
  }
};

const paintBuilding = (g: Ctx, id: Id, k: number, bx: number, top: number) => {
  const b = B[id][k];
  const wall = mix(b.wall, '#3A4A78', 0.12);
  g.fillStyle = wallPattern(g, b.mat, wall); g.fillRect(bx, top, BW, GY - top);
  wallShade(g, bx, top, BW);
  if (id === 'bos' || id === 'chi') quoins(g, bx, top, BW, b.trim);
  const rows = rowsOf(top);
  for (const row of rows) for (const [wx, ww] of winXs(bx, b.win)) windowAt(g, wx, row.y, ww, row.h, b, hash(wx * 0.37 + row.y));
  if (id === 'nola') for (const row of rows) balcony(g, bx + 4, BW - 8, row.y + row.h + 8);
  storefront(g, id, k, bx, b);
  cornice(g, bx, top, BW, b.trim);
  if (id === 'nola' || id === 'bos') for (const lx of [bx + 11, bx + BW - 11]) lanternBody(g, lx, SY + 52, id === 'nola');
  if (id === 'nash') nashNeonFrames(g, k, bx, top);
  if (id === 'sea' && k === 0) marketSign(g, bx, top);
  if (id === 'bos' && k === 1) steeple(g, bx, top, b.wall);
  // (the outline round the whole front)
  box(g, bx - 1, top, 1, GY - top, INK); box(g, bx + BW, top, 1, GY - top, INK);
  b.props.forEach((p, i) => { const px = bx + (i ? 304 : 70); if (clearAt(px)) prop(g, p, px); });
};

// ---------------------------------------------------------------------------------------------------------------
// Live: what moves on the buildings

const flame = (c: Ctx, x: number, y: number, f: number) => {
  const k = (f >> 2) + x, h = 5 + (hash(k) > 0.5 ? 1 : 0), dx = hash(k + 1) > 0.5 ? 1 : 0;
  box(c, x - 2, y + 9 - h, 4, h, '#F59E0B'); box(c, x - 1, y + 10 - h, 2, h - 2, '#FFF3B0'); box(c, x - 1 + dx, y + 8 - h, 1, 2, '#FDBA74');
};

const nashLive = (c: Ctx, x: number, f: number) => {
  const b0 = bldgX(x, 0), t0 = bldgTop(0), b1 = bldgX(x, 1), t1 = bldgTop(1);
  const [gx, gy] = GUITAR(b0, t0), p = (f >> 4) % 8;
  neon(c, p !== 7, '#FF5FA2', g => guitarBody(g, gx, gy));
  neon(c, p >= 1 && p !== 7, '#FFD54A', g => guitarNeck(g, gx, gy));
  if (p >= 2 && p !== 7) neon(c, (f >> 3) % 4 !== 0, '#5CE1FF', g => guitarStrings(g, gx, gy));
  const [bx, by] = BOOTS(b1, t1), q = (f >> 5) % 4;
  neon(c, q !== 1, '#5CE1FF', g => bootPath(g, bx, by));
  neon(c, q !== 0, '#FF5FA2', g => bootPath(g, bx + 40, by));
  // LIVE MUSIC: the bulbs chase round, LIVE steady (mostly), MUSIC spelled out a letter at a time
  const [lx, ly] = BLADE(b0, t0);
  let i = 0;
  for (let y = ly + 4; y < ly + 120; y += 8, i++) for (const bx2 of [lx + 3, lx + 17]) {
    if ((i + (f >> 2)) % 3 === 0) { box(c, bx2 - 1, y - 1, 4, 4, 'rgba(255, 236, 150, 0.35)'); box(c, bx2, y, 2, 2, '#FFF3B0'); }
  }
  const spelled = (f >> 3) % 9, flick = hash(f >> 2) < 0.05;
  LIVE.forEach((ch, j) => {
    if (!ch || (j < 4 && flick) || (j > 4 && j - 4 > spelled)) return;
    signText(c, ch, lx + 11, ly + 20 + j * 11, tube(8, '#FFE66B', true, '#2A1A2E'));
  });
};

const seaLive = (c: Ctx, x: number, f: number) => {
  const b0 = bldgX(x, 0), t0 = bldgTop(0);
  const { x0, ly, cx, cy } = MARKET(b0, t0);
  const m = f * 0.02, hr = m / 12;
  c.strokeStyle = INK; c.lineWidth = 2; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(hr) * 6, cy - Math.cos(hr) * 6); c.stroke();
  c.lineWidth = 1; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(m) * 10, cy - Math.cos(m) * 10); c.stroke();
  c.lineCap = 'butt'; box(c, cx - 1, cy - 1, 2, 2, '#B91C1C');
  // (the neon: one letter on the blink now and then)
  const dead = hash(f >> 3) < 0.3 ? (f >> 5) % WORD.length : -1;
  for (let i = 0; i < WORD.length; i++) {
    const ch = WORD[i]; if (i === dead || ch === ' ') continue;
    signText(c, ch, x0 + i * 13 + 1, ly + 2, tube({ sx: 2, sy: 2 }, '#FF4A3D', true, '#1A0A0A'), 'left');
  }
  // (the fish going across the market's window)
  const b1 = bldgX(x, 1), wx = b1 + 30, wy = SY + 70, ww = 170, wh = 58;
  const t = (f % 100) / 56;
  if (t <= 1) {
    const fx = wx + 20 + t * (ww - 40), fy = wy + 26 - Math.sin(t * Math.PI) * 18;
    c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip();
    fishShape(c, fx, fy, 1.1, -Math.cos(t * Math.PI) * 0.7 + t * 6.283);
    c.restore();
  }
};

/** The L: a riveted girder across the district on lattice columns, dim (it's not somewhere to stand). */
const paintL = (g: Ctx, x: number) => {
  const s = rampOf(dim('#56606E')), ty = GY - 270, x0 = x - 24, x1 = x + DISTRICT_W + 4;
  box(g, x0, ty + 26, x1 - x0, 6, SHADOW); checker(g, x0, ty + 32, x1 - x0, 2, SHADOW);
  for (const px of [x - 16, x + DISTRICT_W - 16]) {
    poly(g, [[px - 14, ty + 26], [px + 24, ty + 26], [px + 10, ty + 44], [px, ty + 44]], s[0]);
    box(g, px - 1, ty + 24, 12, GY - ty - 24, INK); box(g, px, ty + 24, 10, GY - ty - 24, s[1]); box(g, px, ty + 24, 2, GY - ty - 24, s[3]); box(g, px + 8, ty + 24, 2, GY - ty - 24, s[0]);
    g.strokeStyle = s[0]; g.lineWidth = 1; g.beginPath();
    for (let y = ty + 30; y < GY - 20; y += 14) { g.moveTo(px + 2, y); g.lineTo(px + 8, y + 7); g.lineTo(px + 2, y + 14); }
    g.stroke();
    for (let y = ty + 30; y < GY - 10; y += 7) { box(g, px + 1, y, 1, 1, s[4]); box(g, px + 8, y, 1, 1, s[3]); }
    box(g, px - 5, GY - 7, 20, 7, INK); box(g, px - 4, GY - 6, 18, 6, s[2]); box(g, px - 4, GY - 6, 18, 1, s[3]);
  }
  box(g, x0 - 1, ty - 1, x1 - x0 + 2, 28, INK);
  box(g, x0, ty, x1 - x0, 26, s[0]);
  for (const cy of [ty, ty + 20]) { box(g, x0, cy, x1 - x0, 6, s[2]); box(g, x0, cy, x1 - x0, 1, s[3]); box(g, x0, cy + 5, x1 - x0, 1, s[0]); }
  g.strokeStyle = s[1]; g.lineWidth = 2; g.beginPath();
  for (let px = x0; px < x1 - 20; px += 24) { g.moveTo(px + 3, ty + 7); g.lineTo(px + 24, ty + 19); }
  g.stroke();
  for (let px = x0; px < x1; px += 24) { box(g, px, ty + 6, 3, 14, s[2]); box(g, px, ty + 6, 1, 14, s[3]); }
  for (let px = x0 + 3; px < x1; px += 6) { box(g, px, ty + 2, 1, 1, s[4]); box(g, px, ty + 22, 1, 1, s[4]); }
  for (let px = x0; px < x1; px += 6) { box(g, px, ty - 4, 4, 4, dim('#4A3628')); box(g, px, ty - 4, 4, 1, dim('#6A5038')); }
  box(g, x0, ty - 7, x1 - x0, 2, s[3]); box(g, x0, ty - 5, x1 - x0, 1, s[0]);
  for (const bx of [x0, x1 - 8]) { box(g, bx - 1, ty - 15, 10, 12, INK); for (let i = 0; i < 4; i++) box(g, bx, ty - 14 + i * 2.5, 8, 2, i % 2 ? '#1A1A22' : dim('#EAB308')); }
  box(g, x + 120, ty + 8, 200, 11, INK); box(g, x + 121, ty + 9, 198, 9, '#F4F1E6');
  tiny(g, 'THE L-ISH (GOES NOWHERE)', x + 220, ty + 17, '#1E3A8A', 6, null);
};

const train = (c: Ctx, x: number, f: number) => {
  const P = 840, T = f % P, RUN = 280;
  if (T >= RUN) return;
  const ty = GY - 270, carW = 124, n = 3, len = n * (carW + 6), x0 = x - 24, x1 = x + DISTRICT_W + 4;
  const head = x0 - len + (T / RUN) * (x1 - x0 + len);
  c.save(); c.beginPath(); c.rect(x0, ty - 60, x1 - x0, 60); c.clip();
  const body = mix('#B8C0CA', '#3A4A78', 0.2), br = rampOf(body);
  for (let i = 0; i < n; i++) {
    const cx = Math.round(head + i * (carW + 6)), cy = ty - 46;
    box(c, cx + 8, cy + 36, 26, 8, INK); box(c, cx + carW - 34, cy + 36, 26, 8, INK);
    for (const wx of [cx + 14, cx + 28, cx + carW - 28, cx + carW - 14]) { disc(c, wx, cy + 41, 4, '#2A2A30'); box(c, wx - 1, cy + 39, 2, 2, '#6E6E78'); }
    box(c, cx - 1, cy - 1, carW + 2, 39, INK);
    box(c, cx, cy, carW, 37, br[2]); box(c, cx, cy, carW, 4, br[3]); box(c, cx, cy, carW, 1, br[4]); box(c, cx, cy + 32, carW, 5, br[1]);
    box(c, cx, cy + 24, carW, 3, FLAG_RED[2]); box(c, cx, cy + 27, carW, 2, FLAG_BLUE[2]);
    for (let w = 0; w < 6; w++) {
      const wx = cx + 8 + w * 19;
      if (w === 2) { box(c, wx - 1, cy + 6, 14, 26, INK); box(c, wx, cy + 7, 12, 24, br[1]); box(c, wx + 5, cy + 7, 1, 24, INK); continue; }
      box(c, wx - 1, cy + 7, 14, 13, INK); box(c, wx, cy + 8, 12, 11, '#3A5683'); box(c, wx, cy + 8, 12, 3, '#6D8FC0');
      if (hash(i * 7 + w) > 0.35) { disc(c, wx + 6, cy + 14, 3, SIL); box(c, wx + 2, cy + 16, 8, 3, SIL); }
      poly(c, [[wx + 2, cy + 19], [wx + 4, cy + 19], [wx + 10, cy + 8], [wx + 8, cy + 8]], 'rgba(255, 255, 255, 0.18)');
    }
    if (i === n - 1) { box(c, cx + carW - 6, cy + 6, 6, 14, '#3A5683'); box(c, cx + carW - 4, cy + 26, 3, 3, '#FFF3B0'); }
  }
  if (T % 9 < 2) { const sx = head + hash(T) * len; box(c, sx, ty - 3, 2, 2, '#FFF3B0'); box(c, sx + 3, ty - 6, 1, 1, '#FDBA74'); }
  c.restore();
};

/** Seattle's drizzle bar: a pipe across the district on posts, nozzles under it, the schedule hung off it. */
const PIPE_Y = 126;
const paintPipe = (g: Ctx, x: number) => {
  const pr = rampOf(dim('#7C8796'));
  for (const [px, foot] of [[x + 30, bldgTop(0)], [x + 700, bldgTop(1)]] as const) { box(g, px - 1, PIPE_Y, 5, foot - PIPE_Y, INK); box(g, px, PIPE_Y, 3, foot - PIPE_Y, pr[1]); box(g, px, PIPE_Y, 1, foot - PIPE_Y, pr[3]); }
  box(g, x + 13, PIPE_Y - 1, DISTRICT_W - 26, 8, INK);
  box(g, x + 14, PIPE_Y, DISTRICT_W - 28, 6, pr[2]); box(g, x + 14, PIPE_Y, DISTRICT_W - 28, 1, pr[4]); box(g, x + 14, PIPE_Y + 1, DISTRICT_W - 28, 1, pr[3]); box(g, x + 14, PIPE_Y + 5, DISTRICT_W - 28, 1, pr[0]);
  for (let nx = x + 24; nx < x + DISTRICT_W - 20; nx += 22) { box(g, nx, PIPE_Y + 6, 4, 3, pr[1]); box(g, nx + 1, PIPE_Y + 9, 2, 1, INK); }
  box(g, x + 140, PIPE_Y + 6, 1, 5, INK); box(g, x + 250, PIPE_Y + 6, 1, 5, INK);
  box(g, x + 120, PIPE_Y + 10, 150, 15, INK); box(g, x + 121, PIPE_Y + 11, 148, 13, '#F4F1E6'); box(g, x + 121, PIPE_Y + 22, 148, 2, '#D8D2C2');
  tiny(g, 'SCHEDULED DRIZZLE', x + 202, PIPE_Y + 21, '#0E7490', 6, null);
};
const DRIZZLE_P = 1200, DRIZZLE_ON = 420;
const drizzle = (c: Ctx, x: number, f: number) => {
  const t = f % DRIZZLE_P, on = t < DRIZZLE_ON;
  box(c, x + 124, PIPE_Y + 13, 7, 7, INK); box(c, x + 125, PIPE_Y + 14, 5, 5, on ? '#4ADE80' : '#7F1D1D'); if (on) box(c, x + 125, PIPE_Y + 14, 2, 2, '#DCFCE7');
  if (!on) {
    // (between showers: a drip off a nozzle now and then)
    const d = (f % 60) / 60, nx = x + 25 + Math.floor(hash(Math.floor(f / 60)) * 31) * 22;
    box(c, nx, PIPE_Y + 10 + d * d * (GY - PIPE_Y - 10), 1, 3, 'rgba(203, 225, 245, 0.8)');
    return;
  }
  const fade = Math.min(1, t / 40, (DRIZZLE_ON - t) / 40);
  c.fillStyle = `rgba(203, 222, 245, ${(0.55 * fade).toFixed(2)})`;
  const span = GY - PIPE_Y - 10;
  for (let i = 0; i < 80; i++) {
    const dy = (i * 53 + f * 7) % span, dx = x + 20 + ((i * 97) % (DISTRICT_W - 40)) - Math.round(dy * 0.08);
    c.fillRect(dx, PIPE_Y + 10 + dy, 1, 7);
  }
  c.fillStyle = `rgba(230, 240, 255, ${(0.7 * fade).toFixed(2)})`;
  for (let i = 0; i < 12; i++) { const sx = Math.round(x + 20 + hash(i * 13 + (f >> 2)) * (DISTRICT_W - 40)); c.fillRect(sx - 2, GY - 3, 1, 1); c.fillRect(sx + 2, GY - 3, 1, 1); c.fillRect(sx, GY - 4, 1, 1); }
};

const districtLive = (c: Ctx, id: Id, x: number, f: number) => {
  if (id === 'nash') nashLive(c, x, f);
  if (id === 'sea') seaLive(c, x, f);
  if (id === 'nola' || id === 'bos') for (let k = 0; k < 2; k++) { const bx = bldgX(x, k); for (const lx of [bx + 11, bx + BW - 11]) flame(c, lx, SY + 52, f); }
};

// ---------------------------------------------------------------------------------------------------------------
// The arch in, the lamps, the fountain, the carts

const fluted = (g: Ctx, x: number, capY: number, w: number, col: string) => {
  slab(g, x - 10, GY - 22, w + 20, 22, col);
  slab(g, x - 6, GY - 32, w + 12, 10, col);
  pole(g, x, capY + 4, w, GY - 32 - capY - 4, col);
  for (let fx = x + 5; fx < x + w - 4; fx += 6) { box(g, fx, capY + 8, 2, GY - 44 - capY, 'rgba(26, 11, 6, 0.16)'); box(g, fx + 2, capY + 8, 1, GY - 44 - capY, 'rgba(255, 255, 255, 0.3)'); }
  box(g, x, capY + 40, w, 4, GOLD); box(g, x, capY + 40, w, 1, '#F3D77A'); box(g, x, capY + 43, w, 1, '#7A5A18');
  // (a banner down its face: blue, a star, stripes, a swallowtail)
  const bx = x + 7, bw = w - 14, by = capY + 48, bh = 110;
  box(g, bx - 2, by - 3, bw + 4, 3, GOLD);
  poly(g, [[bx - 1, by - 1], [bx + bw + 1, by - 1], [bx + bw + 1, by + bh + 1], [bx + bw / 2, by + bh - 9], [bx - 1, by + bh + 1]], INK);
  poly(g, [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx + bw / 2, by + bh - 10], [bx, by + bh]], FLAG_BLUE[2]);
  box(g, bx, by, 3, bh - 4, FLAG_BLUE[3]); box(g, bx + bw - 3, by, 3, bh - 4, FLAG_BLUE[1]);
  shinyStar(g, bx + bw / 2, by + 20, 8, '#F8FAFC');
  for (let i = 0; i < 4; i++) box(g, bx, by + 44 + i * 10, bw, 5, i % 2 ? FLAG_WHITE[3] : FLAG_RED[2]);
  slab(g, x - 4, capY - 6, w + 8, 10, col);
  ball(g, x - 4, capY, 5, col); ball(g, x + w + 4, capY, 5, col);
  slab(g, x - 9, capY - 14, w + 18, 8, col);
};

// ---------------------------------------------------------------------------------------------------------------
// Depth that isn't there: the gate in, and the sides of the buildings, drawn as if it's all in 3D (the way the SNES and
// the Genesis faked it). Nothing moves but the camera; what's nearer slides by faster, what's further slower, and what
// joins them is drawn slice by slice between the two, so it swings round as he goes by.

/** Where the camera's looking from: its middle, across and up. */
export interface Eye { x: number; y: number }
/** Where something at depth `p` (1 the plane he walks in; more, nearer; less, further) is drawn, that's at x in the world. */
const at = (eye: Eye, x: number, p: number) => eye.x + (x - eye.x) * p;

/** The gate in, at the foot of the stairs: one column out in front of him (nearer than he is), one behind, the
 *  entablature over the top of the street between them, AMERICA USA along it, the eagle on top. He walks between them. */
const GATE_X = R(USA_START) + 50, GATE = { front: 1.32, back: 0.78, frontS: 1.28, backS: 0.8, frontFoot: GY + 70, backFoot: GY - 26, CW: 36, H: 316 };
const MARBLE = '#ECE7DD';

/** A column, s times life size, its foot at (x, foot). */
const gateColumn = (c: Ctx, x: number, foot: number, s: number, key: string) => {
  c.save(); c.translate(Math.round(x), Math.round(foot)); c.scale(s, s);
  const x0 = -GATE.CW / 2;
  stamp(c, key, x0 - 22, -GATE.H - 30, GATE.CW + 44, GATE.H + 32, g => { g.save(); g.translate(0, -GY); fluted(g, x0, GY - GATE.H, GATE.CW, MARBLE); g.restore(); });
  c.restore();
};

/** The entablature's long side, painted once: marble, the blue frieze, gold, AMERICA USA, stars, dentils. */
const FRIEZE_W = 360, FRIEZE_H = 66;
let frieze: HTMLCanvasElement | null = null;
const friezeArt = () => {
  if (frieze) return frieze;
  const cv = document.createElement('canvas'); cv.width = FRIEZE_W; cv.height = FRIEZE_H;
  const g = cv.getContext('2d')!;
  const mr = rampOf(MARBLE);
  slab(g, 0, 0, FRIEZE_W, 12, MARBLE);
  for (let x = 4; x < FRIEZE_W - 4; x += 8) { box(g, x, 12, 5, 6, mr[2]); box(g, x, 12, 1, 6, mr[3]); box(g, x, 17, 5, 1, mr[0]); }
  slab(g, 0, 18, FRIEZE_W, 34, FLAG_BLUE[1]);
  g.strokeStyle = GOLD; g.lineWidth = 2; g.strokeRect(6, 23, FRIEZE_W - 12, 24);
  signAt(g, 'AMERICA USA', FRIEZE_W / 2, 41, 12, { ...gilt({ sx: 2, sy: 2 }, '#3A2A08'), drop: 2 });
  for (const sx of [24, FRIEZE_W - 24]) shinyStar(g, sx, 35, 6, '#FDE047');
  slab(g, 0, 52, FRIEZE_W, 14, MARBLE); box(g, 4, 58, FRIEZE_W - 8, 1, mr[1]);
  g.textAlign = 'left';
  // (it's only kept once the pixel font's in: until then, painted again next time)
  if (document.fonts?.check('12px "Press Start 2P"')) frieze = cv;
  return cv;
};

/** The ground at a depth (`s`, how big things are there: 1 where he walks): the line it meets, going back up toward
 *  where he's looking. */
const groundAt = (eye: Eye, s: number) => eye.y + (GY - eye.y) * s;
/** How far back the shop fronts stand, as the gate's columns and the ground go (they slide by with him, the same as he
 *  does: depth 1). Anything with a smaller depth is behind them; bigger, in front. */
const SHOPS = 1;

/** Where the gate's parts are this frame (each column standing on the ground at its own depth). */
const gateNow = (eye: Eye) => {
  const xf = at(eye, GATE_X, GATE.front), xb = at(eye, GATE_X, GATE.back);
  const footF = groundAt(eye, GATE.frontS), footB = groundAt(eye, GATE.backS);
  const topF = footF - GATE.H * GATE.frontS, topB = footB - GATE.H * GATE.backS;
  return { xf, xb, topF, topB, footF, footB };
};

/** The entablature, slice by slice from t0 to t1 of the way from the back column to the front one. */
const frieze_ = (c: Ctx, eye: Eye, t0: number, t1: number) => {
  const { xf, xb, topF, topB } = gateNow(eye);
  const art = friezeArt();
  const N = 48, flip = xf < xb;
  for (let i = Math.floor(t0 * N); i < Math.ceil(t1 * N); i++) {
    const a = i / N, b = (i + 1) / N, tm = (a + b) / 2;
    const x0 = xb + (xf - xb) * a, x1 = xb + (xf - xb) * b;
    const s = GATE.backS + (GATE.frontS - GATE.backS) * tm, bottom = topB + (topF - topB) * tm;
    const h = FRIEZE_H * s;
    // (the picture across it, read left to right whichever side of it he's on)
    const u = flip ? 1 - tm : tm;
    c.drawImage(art, Math.floor(u * (FRIEZE_W - FRIEZE_W / N)), 0, FRIEZE_W / N, FRIEZE_H, Math.min(x0, x1), bottom - h, Math.abs(x1 - x0) + 1, h);
    // (its shade, deeper the further back)
    if (tm < 0.5) { c.fillStyle = `rgba(30, 36, 72, ${(0.3 * (1 - tm * 2)).toFixed(2)})`; c.fillRect(Math.min(x0, x1), bottom - h, Math.abs(x1 - x0) + 1, h); }
  }
};
/** Where along the entablature the shop fronts' depth is: the part back of it's behind them, the rest in front. */
const SHOP_T = (SHOPS - GATE.back) / (GATE.front - GATE.back);

/** Behind the shop fronts (drawn before them): the ground going back behind the street where there's nothing in
 *  front of it, the back column standing on it, and the back end of the entablature. */
export const gateBack = (c: Ctx, eye: Eye) => {
  const { xb, footB } = gateNow(eye);
  gateColumn(c, xb, footB, GATE.backS, 'gate-col-back');
  frieze_(c, eye, 0, SHOP_T);
};

/** In front of him: the near end of the entablature, the eagle and the sign at the middle of it, the column out in
 *  front. */
export const gateFront = (c: Ctx, eye: Eye, f: number) => {
  const { xf, xb, topF, topB, footF } = gateNow(eye);
  // The eagle up on top, halfway along, and YOU'RE WELCOME hung under it (further back than the near end and the front
  // column: drawn first)
  const sm = (GATE.backS + GATE.frontS) / 2, xm = (xb + xf) / 2, ym = (topB + topF) / 2;
  eagle(c, xm, ym - FRIEZE_H * sm - 26 * sm, 1.5 * sm);
  const sw = 92 * sm, sy = ym + 34 * sm;
  for (const dx of [-sw / 2 + 6, sw / 2 - 6]) for (let y = ym; y < sy; y += 3 * sm) box(c, xm + dx, y, 2 * sm, 2 * sm, '#B8BCC4');
  c.save(); c.translate(xm, sy); c.scale(sm, sm); sign(c, -46, 0, 92, 14, '#FEF3C7', "YOU'RE WELCOME", '#7F1D1D', 6); c.restore();
  frieze_(c, eye, SHOP_T, 1);
  // (the end of it over the front column: square on to him)
  const s = GATE.frontS, ew = (GATE.CW + 26) * s, eh = FRIEZE_H * s;
  slab(c, xf - ew / 2, topF - eh, ew, eh, MARBLE);
  shinyStar(c, xf, topF - eh / 2, 7 * s, '#FDE047');
  gateColumn(c, xf, footF, GATE.frontS, 'gate-col-front');
  void f;
};

/** The ground going back behind the street (where the shop fronts don't hide it): the sidewalk receding up toward
 *  where he's looking, its joints running back, darker the further. Drawn before everything that stands on it. */
const backGround = (c: Ctx, eye: Eye, x0: number, x1: number) => {
  const far = groundAt(eye, 0.62);
  const bands = ['#8E8676', '#9C9482', '#AAA290', '#B6AE9C'];
  bands.forEach((col, i) => { const y0 = far + (GY - far) * (i / bands.length), y1 = far + (GY - far) * ((i + 1) / bands.length); box(c, x0, y0, x1 - x0, y1 - y0 + 1, col); });
  // (joints running back toward where he's looking)
  c.strokeStyle = 'rgba(60, 54, 44, 0.45)'; c.lineWidth = 1;
  for (let x = Math.floor(x0 / 48) * 48; x < x1; x += 48) { const xf = eye.x + (x - eye.x) * 0.62; c.beginPath(); c.moveTo(x, GY); c.lineTo(xf, far); c.stroke(); }
  for (let i = 1; i < 4; i++) { const y = far + (GY - far) * (i / 4) ** 1.4; box(c, x0, y, x1 - x0, 1, 'rgba(60, 54, 44, 0.35)'); }
};

/** Between the buildings: an alley going back, not sky: the backs of the buildings behind across the end of it (dim
 *  brick, a lit window, a fire escape, a pipe), and the alley floor coming forward to the street (a dumpster, a puddle). */
const alleys = (c: Ctx, eye: Eye) => {
  const far = groundAt(eye, 0.62), top = GY - 360;
  for (const d of DISTRICTS) {
    const x = R(d.x);
    for (const [g0, g1] of [[bldgX(x, 0) + BW, bldgX(x, 1)], [bldgX(x, 1) + BW, x + DISTRICT_W + 20]] as [number, number][]) {
      if (d === DISTRICTS[DISTRICTS.length - 1] && g1 > x + DISTRICT_W) continue;
      if (g1 < eye.x - 520 || g0 > eye.x + 520) continue;
      const a = g0 - 6, w = g1 - g0 + 12;
      // (the backs of the buildings over the way: dim brick in courses, a window lit, a fire escape)
      box(c, a, top, w, far - top, '#3E3240');
      for (let y = top + 6; y < far; y += 8) box(c, a, y, w, 1, '#33283A');
      for (let y = top + 10, i = 0; y < far - 30; y += 46, i++) {
        const wx = a + 4 + ((i * 7) % Math.max(1, w - 18));
        box(c, wx, y, 10, 14, '#1A1420'); if (hash(x + y) > 0.5) box(c, wx + 1, y + 1, 8, 12, '#E8C46A');
        box(c, a, y + 18, w, 2, '#262030');
      }
      box(c, a + w / 2 - 1, top, 2, far - top, '#2A2234');
      // (the alley floor: cracked asphalt coming forward to the sidewalk, a puddle, a dumpster at the back)
      const bands = ['#4A4644', '#575250', '#64605C'];
      bands.forEach((col, i) => box(c, a, far + (GY - far) * (i / 3), w, (GY - far) / 3 + 1, col));
      box(c, a + 2, far - 14, Math.min(w - 4, 24), 14, '#1E4A2E'); box(c, a + 2, far - 14, Math.min(w - 4, 24), 2, '#2E6A42');
      c.fillStyle = 'rgba(120, 150, 190, 0.35)'; c.beginPath(); c.ellipse(a + w / 2, GY - 10, w * 0.3, 3, 0, 0, Math.PI * 2); c.fill();
    }
  }
};

/** The sides of the buildings: whichever side faces him, going back from the shop front toward where he's looking,
 *  standing on the ground going back with it; in the gaps between buildings (the next one's front hides the rest), all
 *  of it at the open ends of the street. */
const DEPTH = 0.78;
const buildingSides = (c: Ctx, eye: Eye, x: number, id: Id) => {
  const first = x === R(DISTRICTS[0].x), last = x === R(DISTRICTS[DISTRICTS.length - 1].x);
  for (let k = 0; k < 2; k++) {
    const bx = bldgX(x, k), top = bldgTop(k), b = B[id][k];
    // (the gaps either side: as far as the next building, or the next district's; open at the ends of the street)
    const gaps: [number, number, 1 | -1][] = [
      [bx + BW, k ? (last ? bx + BW + 900 : x + DISTRICT_W + 20) : bldgX(x, 1), 1],
      [k ? bldgX(x, 0) + BW : (first ? bx - 900 : x - 20), bx, -1],
    ];
    for (const [g0, g1, side] of gaps) {
      const e = side > 0 ? bx + BW : bx;
      // (only the side that faces him: the right side when he's off to its right, and the other way)
      if ((eye.x - e) * side <= 2) continue;
      const far = eye.x + (e - eye.x) * DEPTH, topFar = eye.y + (top - eye.y) * DEPTH, botFar = groundAt(eye, DEPTH);
      const wall = dark(dim(b.wall), 0.35), trim = dark(dim(b.trim), 0.2);
      c.save(); c.beginPath(); c.rect(Math.min(g0, g1), top - 40, Math.abs(g1 - g0), GY - top + 44); c.clip();
      // (the ground it stands on, going back with it, and its shadow along the foot)
      c.fillStyle = '#A39A88'; c.beginPath(); c.moveTo(e, GY); c.lineTo(far, botFar); c.lineTo(far + (far - e), botFar); c.lineTo(far + (far - e), GY); c.closePath(); c.fill();
      c.fillStyle = 'rgba(20, 16, 12, 0.35)'; c.beginPath(); c.moveTo(e, GY); c.lineTo(far, botFar); c.lineTo(far + (far - e) * 0.25, botFar + 3); c.lineTo(e + (far - e) * 0.3, GY); c.closePath(); c.fill();
      // (the wall)
      c.fillStyle = wall; c.beginPath(); c.moveTo(e, top); c.lineTo(far, topFar); c.lineTo(far, botFar); c.lineTo(e, GY); c.closePath(); c.fill();
      c.fillStyle = 'rgba(10, 10, 30, 0.22)'; c.beginPath(); c.moveTo(e + (far - e) * 0.5, top + (topFar - top) * 0.5); c.lineTo(far, topFar); c.lineTo(far, botFar); c.lineTo(e + (far - e) * 0.5, GY + (botFar - GY) * 0.5); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(10, 10, 30, 0.25)'; c.lineWidth = 1;
      for (let y = top + 14; y < GY; y += 14) { const yf = eye.y + (y - eye.y) * DEPTH; c.beginPath(); c.moveTo(e, y); c.lineTo(far, yf); c.stroke(); }
      // (a window or two going back along it, at the open ends, where there's room to see them)
      if (Math.abs(far - e) > 60) for (const kk of [0.3, 0.62]) for (const wy of [top + 40, top + 120]) {
        const p0x = e + (far - e) * kk, p1x = e + (far - e) * (kk + 0.16);
        const y0a = wy + (eye.y + (wy - eye.y) * DEPTH - wy) * kk, y0b = wy + (eye.y + (wy - eye.y) * DEPTH - wy) * (kk + 0.16);
        const h0 = 44 * (1 - (1 - DEPTH) * kk), h1 = 44 * (1 - (1 - DEPTH) * (kk + 0.16));
        c.fillStyle = '#1F2937'; c.beginPath(); c.moveTo(p0x, y0a); c.lineTo(p1x, y0b); c.lineTo(p1x, y0b + h1); c.lineTo(p0x, y0a + h0); c.closePath(); c.fill();
        c.fillStyle = 'rgba(147, 197, 253, 0.55)'; c.beginPath(); c.moveTo(p0x + (p1x - p0x) * 0.15, y0a + 3); c.lineTo(p1x - (p1x - p0x) * 0.15, y0b + 3); c.lineTo(p1x - (p1x - p0x) * 0.15, y0b + h1 - 3); c.lineTo(p0x + (p1x - p0x) * 0.15, y0a + h0 - 3); c.closePath(); c.fill();
      }
      c.fillStyle = trim; c.beginPath(); c.moveTo(e, top - 2); c.lineTo(far, topFar - 2 * DEPTH); c.lineTo(far, topFar + 8 * DEPTH); c.lineTo(e, top + 8); c.closePath(); c.fill();
      // (the corner, lit)
      box(c, e - (side > 0 ? 1 : 0), top, 1, GY - top, lite(dim(b.wall), 0.2));
      c.restore();
    }
  }
};

const paintLamp = (g: Ctx, x: number, i: number, tag: string | null) => {
  const iron = '#22315E', ir = rampOf(iron);
  // (a banner hung off the post: red or blue, a star)
  const col = i % 2 ? FLAG_RED : FLAG_BLUE;
  box(g, x + 2, GY - 302, 18, 2, GOLD); box(g, x + 2, GY - 242, 18, 2, GOLD);
  box(g, x + 4, GY - 301, 14, 60, INK); box(g, x + 5, GY - 300, 12, 58, col[2]); box(g, x + 5, GY - 300, 2, 58, col[3]); box(g, x + 15, GY - 300, 2, 58, col[1]);
  shinyStar(g, x + 11, GY - 284, 5, '#F8FAFC'); for (let k = 0; k < 3; k++) box(g, x + 5, GY - 268 + k * 7, 12, 3, k % 2 ? col[1] : '#F1EFEA');
  // (the post: a base, a fluted shaft, collars, the arm the bunting's hung off, the acorn lamp, a gold finial)
  slab(g, x - 9, GY - 20, 18, 20, iron); slab(g, x - 6, GY - 34, 12, 14, iron);
  pole(g, x - 3, GY - 338, 6, 304, iron);
  for (const cy of [GY - 120, GY - 230, GY - 334]) { box(g, x - 6, cy - 1, 12, 6, INK); box(g, x - 5, cy, 10, 4, ir[2]); box(g, x - 5, cy, 10, 1, ir[3]); box(g, x - 5, cy + 3, 10, 1, ir[0]); }
  box(g, x - 11, GY - 332, 22, 3, INK); box(g, x - 10, GY - 331, 20, 1, ir[3]);
  ball(g, x - 11, GY - 330, 2, '#E8B400', false); ball(g, x + 11, GY - 330, 2, '#E8B400', false);
  slab(g, x - 7, GY - 344, 14, 6, iron);
  oval(g, x, GY - 352, 9, 11, INK); oval(g, x, GY - 352, 8, 10, '#E8D49A'); oval(g, x - 1, GY - 353, 6, 8, '#F7EBC0'); oval(g, x - 3, GY - 355, 3, 4, '#FFFBEA');
  poly(g, [[x - 10, GY - 359], [x + 10, GY - 359], [x + 4, GY - 367], [x - 4, GY - 367]], INK);
  poly(g, [[x - 9, GY - 360], [x + 9, GY - 360], [x + 3, GY - 366], [x - 3, GY - 366]], ir[2]);
  box(g, x - 9, GY - 361, 18, 1, ir[3]);
  ball(g, x, GY - 369, 2, '#E8B400');
  if (tag) {
    box(g, x - 1, GY - 372, 2, 4, INK);
    box(g, x - 16, GY - 371, 32, 2, INK);
    sign(g, x - 70, GY - 390, 140, 16, WHITE, tag, BLUE, 6, RED);
  }
};

const paintFountain = (g: Ctx, fx: number) => {
  const stone = '#CFC6B6', sr = rampOf(stone);
  // (the sign up on gilt posts)
  for (const px of [fx - 82, fx + 79]) pole(g, px, GY - 212, 3, 162, '#C9A23A');
  sign(g, fx - 90, GY - 232, 180, 18, '#FEF3C7', 'THE FOUNTAIN OF FREEDOM', '#7F1D1D', 6);
  // (the basin's back rim, the water, the coins on the bottom)
  slab(g, fx - 84, GY - 52, 168, 9, stone);
  bandedGradient(g, fx - 82, GY - 44, 164, 10, ['#9BD3F5', '#4F98D8', '#2C6AAE'], 3);
  for (let i = 0; i < 26; i++) { const cx = Math.round(fx - 78 + hash(i * 3.1) * 156), cy = Math.round(GY - 42 + hash(i * 7.7) * 6); box(g, cx, cy, 3, 2, hash(i) > 0.3 ? '#E8B400' : '#C0C0C8'); box(g, cx, cy, 1, 1, '#FFF2A0'); }
  // (the pedestal up out of the water: a plinth with spouts, a fluted column banded red, white and blue, the capital)
  slab(g, fx - 22, GY - 76, 44, 34, stone);
  for (const sx of [fx - 22, fx + 22]) { ball(g, sx, GY - 62, 4, GOLD); box(g, sx - 1, GY - 63, 2, 2, INK); }
  box(g, fx - 16, GY - 70, 32, 8, INK); box(g, fx - 15, GY - 69, 30, 6, '#B8862E'); shinyStar(g, fx, GY - 66, 3, '#FFF2A0');
  pole(g, fx - 12, GY - 168, 24, 92, '#E7E1D4');
  for (let x = fx - 8; x < fx + 9; x += 5) { box(g, x, GY - 164, 1, 84, 'rgba(26, 11, 6, 0.18)'); box(g, x + 1, GY - 164, 1, 84, 'rgba(255, 255, 255, 0.35)'); }
  box(g, fx - 12, GY - 124, 24, 4, FLAG_RED[2]); box(g, fx - 12, GY - 120, 24, 3, FLAG_WHITE[3]); box(g, fx - 12, GY - 117, 24, 4, FLAG_BLUE[2]);
  slab(g, fx - 16, GY - 172, 32, 6, stone); slab(g, fx - 20, GY - 178, 40, 7, stone);
  ball(g, fx - 19, GY - 172, 3, stone); ball(g, fx + 19, GY - 172, 3, stone);
  eagle(g, fx, GY - 196, 1.3);
  box(g, fx - 82, GY - 40, 164, 4, '#4F98D8'); box(g, fx - 82, GY - 40, 164, 1, '#9BD3F5');
  // (the front of the basin: panels, the plaque, its foot)
  slab(g, fx - 90, GY - 36, 180, 36, stone);
  for (const px of [fx - 84, fx + 58]) { box(g, px, GY - 30, 26, 22, sr[1]); box(g, px, GY - 9, 26, 1, sr[3]); box(g, px + 25, GY - 30, 1, 22, sr[3]); }
  box(g, fx - 56, GY - 29, 112, 15, INK); box(g, fx - 55, GY - 28, 110, 13, '#B8862E'); box(g, fx - 55, GY - 28, 110, 1, '#F3D77A'); box(g, fx - 55, GY - 16, 110, 1, '#7A5A18');
  tiny(g, 'WISHES: TAX FREE', fx, GY - 18, '#3A2408', 6, null);
  box(g, fx - 92, GY - 4, 184, 4, sr[1]);
};
const waterArc = (c: Ctx, x0: number, y0: number, x1: number, y1: number, up: number, f: number, th: number) => {
  const n = Math.max(8, Math.round(Math.hypot(x1 - x0, y1 - y0) / 3));
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = x0 + (x1 - x0) * u, y = y0 - up * u + (y1 - y0 + up) * u * u;
    const k = (i - (f >> 1)) & 3;
    box(c, x - th / 2, y - th / 2, th, th, k === 0 ? '#F2FAFF' : k === 1 ? '#BFE3FF' : '#7FC0F0');
  }
};
const fountainLive = (c: Ctx, fx: number, f: number) => {
  waterArc(c, fx + 16, GY - 207, fx + 60, GY - 42, 24, f, 3);
  waterArc(c, fx - 25, GY - 62, fx - 48, GY - 41, 6, f, 2);
  waterArc(c, fx + 25, GY - 62, fx + 46, GY - 41, 6, f, 2);
  c.save(); c.beginPath(); c.rect(fx - 82, GY - 46, 164, 10); c.clip();
  for (const [lx, ph] of [[fx + 60, 0], [fx - 48, 17], [fx + 46, 33]] as const) for (let i = 0; i < 2; i++) {
    const t = ((f + ph + i * 24) % 48) / 48;
    c.strokeStyle = rgba('#EAF6FF', +(0.8 * (1 - t)).toFixed(2)); c.lineWidth = 1;
    c.beginPath(); c.ellipse(lx, GY - 40, 3 + t * 18, 1 + t * 3, 0, 0, Math.PI * 2); c.stroke();
  }
  for (let i = 0; i < 14; i++) box(c, fx - 80 + ((i * 37 + (f >> 1)) % 160), GY - 44 + (i % 4) * 2, 4, 1, i % 3 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(190, 225, 255, 0.6)');
  c.restore();
  for (let i = 0; i < 6; i++) { const t = ((f + i * 9) % 22) / 22; box(c, fx + 60 + (i - 2.5) * 4 * t, GY - 44 - Math.sin(t * Math.PI) * (6 + (i % 3) * 3), 2, 2, '#DDF1FF'); }
  const k = (f >> 4) % 26; if ((f >> 2) % 4 === 0) box(c, Math.round(fx - 77 + hash(k * 3.1) * 156), Math.round(GY - 43 + hash(k * 7.7) * 6), 1, 3, '#FFFFFF');
};

const paintCart = (g: Ctx, x: number, words: string, col: string, kind: 'fries' | 'dogs' | 'pie') => {
  castShadow(g, x - 56, GY - 70, 112, 70);
  // (the menu: a chalkboard on a stand by the cart)
  const mx0 = x - 92;
  castShadow(g, mx0, GY - 46, 36, 46);
  box(g, mx0 + 4, GY - 12, 3, 12, '#5C3A1E'); box(g, mx0 + 29, GY - 12, 3, 12, '#5C3A1E');
  box(g, mx0 - 3, GY - 46, 42, 36, INK); box(g, mx0 - 2, GY - 45, 40, 34, '#7A4A22'); box(g, mx0, GY - 43, 36, 30, '#1F2A24'); box(g, mx0, GY - 43, 36, 1, '#3A4A40');
  tiny(g, 'MENU', mx0 + 18, GY - 35, '#FDE047', 5, null, marker(5, '#FDE047', 1));
  tiny(g, 'REG $6', mx0 + 18, GY - 26, '#E7E5E4', 5, null, marker(5, '#E7E5E4', 2)); tiny(g, 'USA $9', mx0 + 18, GY - 18, '#F4A6A6', 5, null, marker(5, '#F4A6A6', 3));
  pole(g, x - 2, GY - 104, 4, 38, '#9CA3AF');
  // (the umbrella, under the shop's sign and dim: panels in turn, shaded to the right, a scalloped edge)
  const uy = GY - 104, n = 8, ry = 18;
  g.fillStyle = INK; g.beginPath(); g.ellipse(x, uy, 66, ry + 2, 0, Math.PI, Math.PI * 2); g.fill();
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI + (i / n) * Math.PI, a1 = Math.PI + ((i + 1) / n) * Math.PI, r = rampOf(dim(i % 2 ? '#F1EFEA' : col));
    poly(g, [[x, uy - ry], [x + Math.cos(a0) * 64, uy + Math.sin(a0) * ry], [x + Math.cos(a1) * 64, uy + Math.sin(a1) * ry]], r[i < n / 2 ? 3 : i < n - 1 ? 2 : 1]);
    const mx = x + (Math.cos(a0) + Math.cos(a1)) * 32;
    g.fillStyle = r[1]; g.beginPath(); g.arc(mx, uy, 8, 0, Math.PI); g.fill();
  }
  box(g, x - 64, uy - 1, 128, 2, INK); ball(g, x, uy - ry - 2, 3, '#E8B400');
  // (what's on the counter)
  if (kind === 'fries') {
    box(g, x - 42, GY - 92, 36, 24, INK); box(g, x - 41, GY - 91, 34, 22, '#3A4A5C');
    for (let i = 0; i < 14; i++) box(g, x - 38 + (i * 5) % 30, GY - 80 - (i % 3) * 3, 2, 10, i % 2 ? '#F4D03F' : '#E8B400');
    poly(g, [[x - 41, GY - 69], [x - 7, GY - 69], [x - 7, GY - 91], [x - 12, GY - 91]], 'rgba(255, 255, 255, 0.12)');
    for (const cx of [x + 4, x + 18]) { poly(g, [[cx - 6, GY - 82], [cx + 6, GY - 82], [cx + 3, GY - 68], [cx - 3, GY - 68]], RED); box(g, cx - 4, GY - 86, 8, 4, '#F4D03F'); box(g, cx - 1, GY - 78, 2, 2, '#F8FAFC'); }
    box(g, x + 30, GY - 84, 7, 16, INK); box(g, x + 31, GY - 83, 5, 14, RED); box(g, x + 32, GY - 88, 3, 4, '#F1EFEA');
  } else if (kind === 'dogs') {
    box(g, x - 44, GY - 84, 46, 16, INK); box(g, x - 43, GY - 83, 44, 14, '#9CA3AF'); box(g, x - 43, GY - 83, 44, 2, '#E2E6EC');
    for (let i = 0; i < 4; i++) { oval(g, x - 33 + i * 10, GY - 74, 5, 2.5, '#7A2A14'); box(g, x - 36 + i * 10, GY - 76, 5, 1, '#B8583A'); }
    box(g, x + 10, GY - 86, 7, 18, INK); box(g, x + 11, GY - 85, 5, 16, '#EAB308'); box(g, x + 12, GY - 90, 3, 4, '#B91C1C');
    box(g, x + 22, GY - 86, 7, 18, INK); box(g, x + 23, GY - 85, 5, 16, RED); box(g, x + 24, GY - 90, 3, 4, '#F1EFEA');
    for (let i = 0; i < 3; i++) { oval(g, x + 40, GY - 72 - i * 4, 7, 2, '#D49A50'); }
  } else {
    box(g, x - 40, GY - 72, 50, 4, '#5C3A1E');
    for (let i = 0; i < 4; i++) {
      const px = x - 32 + i * 12, py = GY - 88 + (i % 2) * 5;
      box(g, px - 1, py, 2, GY - 70 - py, '#E7D6B0');
      disc(g, px, py, 6, INK); disc(g, px, py, 5, '#C8862E'); disc(g, px - 1, py - 1, 3, '#E0A850');
      box(g, px - 4, py - 1, 8, 1, '#8A5418'); box(g, px - 1, py - 4, 1, 8, '#8A5418');
    }
    shinyStar(g, x + 26, GY - 82, 6, '#E8B400');
  }
  // (the cart: its body, a band of stars, the name, a steel counter, the handle, the wheels)
  slab(g, x - 50, GY - 66, 100, 44, col);
  box(g, x - 48, GY - 34, 96, 6, '#F1EFEA'); for (let i = 0; i < 8; i++) shinyStar(g, x - 42 + i * 12, GY - 31, 2.5, FLAG_BLUE[2]);
  sign(g, x - 48, GY - 58, 96, 14, WHITE, words, col, 6);
  box(g, x - 55, GY - 70, 110, 6, INK); box(g, x - 54, GY - 69, 108, 4, '#B8BCC4'); box(g, x - 54, GY - 69, 108, 1, '#F1F3F6');
  box(g, x + 50, GY - 62, 12, 3, INK); box(g, x + 59, GY - 64, 3, 10, INK);
  for (const wx of [x - 32, x + 32]) {
    disc(g, wx, GY - 12, 12, INK); disc(g, wx, GY - 12, 10, '#2A2A30'); disc(g, wx, GY - 12, 7, '#9CA3AF'); disc(g, wx, GY - 12, 6, '#2A2A30');
    g.strokeStyle = '#9CA3AF'; g.lineWidth = 1; g.beginPath(); for (let s = 0; s < 6; s++) { const a = s * Math.PI / 3; g.moveTo(wx, GY - 12); g.lineTo(wx + Math.cos(a) * 6, GY - 12 + Math.sin(a) * 6); } g.stroke();
    ball(g, wx, GY - 12, 2, '#E8B400', false);
  }
};
/** A cart's depth (live polygons under its stamp): the steel counter's top going back toward where he's looking (seen
 *  from above), and the end of the body that faces him, the way the shop fronts' sides go. */
const CART_DEPTH = 0.94;
const cartDepth = (c: Ctx, eye: Eye, x: number, col: string) => {
  const back = (px: number, py: number): [number, number] => [eye.x + (px - eye.x) * CART_DEPTH, eye.y + (py - eye.y) * CART_DEPTH];
  for (const [e, side] of [[x - 50, -1], [x + 50, 1]] as const) sideFace(c, eye, e, side, GY - 66, GY - 22, CART_DEPTH, col);
  const y = GY - 70, a = back(x - 55, y), b = back(x + 55, y);
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 55, y); c.lineTo(...a); c.lineTo(...b); c.lineTo(x + 55, y); c.closePath(); c.fill();
  const a2 = back(x - 54, y), b2 = back(x + 54, y);
  c.fillStyle = '#8A9098'; c.beginPath(); c.moveTo(x - 54, y); c.lineTo(a2[0], a2[1] + 1); c.lineTo(b2[0], b2[1] + 1); c.lineTo(x + 54, y); c.closePath(); c.fill();
};
const steam = (c: Ctx, x: number, f: number) => {
  for (let i = 0; i < 3; i++) {
    const t = ((f + i * 30) % 90) / 90;
    pixelBlob(c, x - 24 - t * 50 + Math.sin(t * 6 + i) * 3, GY - 92 - t * 26, 4 + t * 6, 3 + t * 4, `rgba(255, 255, 255, ${(0.45 * (1 - t)).toFixed(2)})`);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// America USA

export const america = (c: Ctx, f: number, vis: (a: number, b: number) => boolean, eye: Eye) => {
  // Behind it all: the ground going back behind the street, and the gate's back column and the far end of what's over
  // the top of it (the shop fronts stand in front of them)
  if (vis(R(USA_START) - 700, R(USA_END) + 700)) backGround(c, eye, Math.max(R(STAIRS_END) - 120, eye.x - 900), Math.min(R(USA_END) + 700, eye.x + 900));
  alleys(c, eye);
  if (vis(GATE_X - 600, GATE_X + 600)) gateBack(c, eye);
  // The districts: every one a pastiche of an American city, done as shops and restaurants, tacky as hell
  for (const d of DISTRICTS) {
    const x = R(d.x);
    if (!vis(x - 40, x + DISTRICT_W + 40)) continue;
    for (let k = 0; k < 2; k++) {
      const bx = bldgX(x, k), top = bldgTop(k);
      if (!vis(bx - 30, bx + BW + 30)) continue;
      stamp(c, `usa-b-${d.id}-${k}`, bx - 24, top - 212, BW + 48, GY - top + 214, g => paintBuilding(g, d.id, k, bx, top));
      // (a flag up on every roof, because)
      flag(c, bx + B[d.id][k].flagX, top - 44, f + k * 20 + d.x, 24, 16, top);
    }
    if (d.id === 'chi') { stamp(c, 'usa-chi-L', x - 44, GY - 292, DISTRICT_W + 64, 294, g => paintL(g, x)); train(c, x, f); }
    if (d.id === 'sea') stamp(c, 'usa-sea-pipe', x, PIPE_Y - 4, DISTRICT_W, bldgTop(0) - PIPE_Y + 6, g => paintPipe(g, x));
    districtLive(c, d.id, x, f);
  }
  // The sides of the buildings, in the gaps between them, as he goes by
  for (const d of DISTRICTS) { const x = R(d.x); if (vis(x - 60, x + DISTRICT_W + 60)) buildingSides(c, eye, x, d.id); }
  // Over the street: bunting from lamp to lamp; flags on every other lamp
  // (lamps in the gaps between the buildings, so none's in front of a shop sign; the mid ones hold the district's sign)
  const lamps = DISTRICTS.flatMap(d => [R(d.x) + 10, R(d.x) + 370]).concat([R(DISTRICTS[DISTRICTS.length - 1].x) + DISTRICT_W]);
  lamps.forEach((x, i) => {
    const next = lamps[i + 1];
    if (!vis(x - 80, (next ?? x) + 80)) return;
    const tag = i % 2 === 1 ? TAG[DISTRICTS[(i - 1) / 2].id] : null;
    if (vis(x - 80, x + 80)) stamp(c, `usa-lamp-${i}`, x - 80, GY - 400, 160, 402, g => paintLamp(g, x, i, tag));
    if (next) bunting(c, x, next, GY - 330, 22);
    if (i % 2 === 0 && vis(x - 20, x + 40)) flag(c, x, GY - 400, f + i * 13, 30, 18, GY - 372);
  });
  // The Fountain of Freedom: a bald eagle on a column, spitting water
  if (vis(FOUNTAIN_X - 110, FOUNTAIN_X + 110)) {
    stamp(c, 'usa-fountain', FOUNTAIN_X - 100, GY - 250, 200, 252, g => paintFountain(g, FOUNTAIN_X));
    fountainLive(c, FOUNTAIN_X, f);
  }
  // Carts out front: FREEDOM FRIES, EAGLE DOGS, apple pie on a stick
  for (const k of CARTS) if (vis(k.x - 100, k.x + 80)) {
    cartDepth(c, eye, k.x, k.col);
    stamp(c, `usa-cart-${k.kind}`, k.x - 96, GY - 128, 170, 130, g => paintCart(g, k.x, k.words, k.col, k.kind));
    steam(c, k.x, f);
  }
  // Seattle's scheduled drizzle, over everything in the district
  for (const d of DISTRICTS) if (d.id === 'sea' && vis(R(d.x), R(d.x) + DISTRICT_W)) drizzle(c, R(d.x), f);
};

// ---------------------------------------------------------------------------------------------------------------
// The street

/** One stretch of the street: the granite curb (its top lit: this is what you stand on), a soldier course, running-bond pavers going darker down, the wear. */
const FLOOR_CHUNK = 400, FLOOR_D = 160;
const paintFloor = (g: Ctx, x: number, w: number) => {
  box(g, x, GY, w, 8, '#B6AC9A'); checker(g, x, GY + 3, w, 4, '#A39886');
  box(g, x, GY, w, 2, '#F4ECDA'); box(g, x, GY + 2, w, 1, '#D8CFBE');
  for (let i = 0; i < w / 6; i++) { const sx = Math.round(x + hash(x + i * 1.7) * w); box(g, sx, GY + 3 + (i % 4), 1, 1, i % 2 ? '#8A7E6C' : '#E2DACA'); }
  for (let jx = Math.ceil(x / 48) * 48; jx < x + w; jx += 48) { box(g, jx, GY + 2, 1, 6, '#6E6352'); box(g, jx + 1, GY + 2, 1, 6, '#D8CFBE'); }
  box(g, x, GY + 8, w, 2, '#3E2A1C');
  g.save(); g.translate(0, GY + 10);
  g.fillStyle = tilePattern(g, 'usaSoldier', 16, 12, t => {
    t.fillStyle = '#4A2216'; t.fillRect(0, 0, 16, 12);
    for (const [bx, col] of [[0, '#8E3A24'], [8, '#9A4428']] as const) { t.fillStyle = col; t.fillRect(bx, 0, 7, 11); t.fillStyle = lite(col, 0.18); t.fillRect(bx, 0, 7, 1); t.fillRect(bx, 0, 1, 11); t.fillStyle = dark(col, 0.22); t.fillRect(bx, 10, 7, 1); t.fillRect(bx + 6, 0, 1, 11); }
  });
  g.fillRect(x, 0, w, 12);
  g.restore();
  box(g, x, GY + 22, w, 1, '#3A1A10');
  const PY = GY + 23;
  g.save(); g.translate(0, PY);
  g.fillStyle = tilePattern(g, 'usaPave', 32, 12, t => {
    t.fillStyle = '#5A2616'; t.fillRect(0, 0, 32, 12);
    const tints = ['#A84A2E', '#9C4228', '#B25536', '#94402A'];
    for (let row = 0; row < 2; row++) for (let i = -1; i < 2; i++) {
      if (!row && i < 0) continue;
      const bx = i * 16 + (row ? 8 : 0), by = row * 6, tint = row ? tints[2 + ((i % 2) + 2) % 2] : tints[i];
      t.fillStyle = tint; t.fillRect(bx, by, 15, 5);
      t.fillStyle = lite(tint, 0.18); t.fillRect(bx, by, 15, 1); t.fillRect(bx, by, 1, 5);
      t.fillStyle = dark(tint, 0.22); t.fillRect(bx, by + 4, 15, 1); t.fillRect(bx + 14, by, 1, 5);
    }
  });
  g.fillRect(x, 0, w, FLOOR_D - 23);
  g.restore();
  // (odd bricks: faded, scorched, replaced; the odd donor brick with a star on it)
  const brickAt = (px: number, r: number, col: string) => {
    const off = (r % 2) * 8, bx = Math.floor((px - off) / 16) * 16 + off, by = PY + r * 6;
    box(g, bx, by, 15, 5, col); box(g, bx, by, 15, 1, lite(col, 0.2)); box(g, bx, by + 4, 15, 1, dark(col, 0.25));
    return bx;
  };
  for (let i = 0; i < w / 14; i++) {
    const h0 = hash(x * 0.13 + i * 7.31), r = Math.floor(hash(x * 0.07 + i * 3.17) * 20);
    const col = h0 < 0.4 ? '#7E3420' : h0 < 0.75 ? '#BE6A48' : h0 < 0.92 ? '#8A4A3A' : '#C9A27A';
    const bx = brickAt(x + hash(x + i * 11.3) * (w - 16), r, col);
    if (h0 >= 0.92) { box(g, bx + 6, PY + r * 6 + 1, 3, 3, '#8A5A30'); box(g, bx + 7, PY + r * 6 + 2, 1, 1, '#F4E4B0'); }
  }
  // (gum, flattened)
  for (let i = 0; i < w / 30; i++) {
    const gx = Math.round(x + hash(x * 0.3 + i * 5.1) * w), gy = Math.round(GY + 26 + hash(x * 0.2 + i * 2.9) * 80), dk = hash(i + x) < 0.3;
    box(g, gx, gy, 4, 2, dk ? '#3A3533' : '#9A948C'); box(g, gx + 1, gy - 1, 2, 1, dk ? '#4A4542' : '#C4BEB6'); box(g, gx, gy, 1, 1, dk ? '#5A5450' : '#E0DAD2');
  }
  // (cracks)
  for (let i = 0; i < 2; i++) {
    let cx = Math.round(x + 20 + hash(x * 0.9 + i * 13.7) * (w - 40)), cy = GY + 24 + Math.round(hash(x + i * 9.1) * 30);
    for (let s = 0; s < 9; s++) {
      const dx = Math.round((hash(cx + s * 3.3) - 0.5) * 8);
      box(g, cx, cy, 1, 4, '#2E120A'); box(g, cx + 1, cy, 1, 4, '#C4704E');
      cx += dx; cy += 4;
      if (hash(cx + s) < 0.25) { box(g, cx, cy, 5, 1, '#2E120A'); }
    }
  }
  // (a storm drain now and then)
  if (hash(x * 0.011) > 0.35) {
    const dx = Math.round(x + 40 + hash(x * 0.017) * (w - 120));
    box(g, dx - 2, GY + 25, 48, 14, INK); box(g, dx - 1, GY + 26, 46, 12, '#3A3A40'); box(g, dx - 1, GY + 26, 46, 1, '#7A7A84');
    for (let s = 0; s < 9; s++) { box(g, dx + 2 + s * 5, GY + 28, 3, 8, '#0E0E12'); box(g, dx + 2 + s * 5, GY + 36, 3, 1, '#5A5A64'); }
    box(g, dx + 40, GY + 29, 2, 2, '#9CA3AF');
  }
  // (and darker going down)
  hazeBands(g, x, GY + 36, w, FLOOR_D - 36, '#1A0B06', 0.04, 0.5, 6);
};

/** America USA's street: brick paving. */
export const drawAmericaFloor = (c: Ctx) => {
  const x0 = R(STAIRS_END), x1 = R(USA_END);
  const m = c.getTransform(), sx = m.a || 1;
  const camL = -m.e / sx - 60, camR = camL + (c.canvas?.width ?? 4000) / sx + 120;
  for (let cx = x0, i = 0; cx < x1; cx += FLOOR_CHUNK, i++) {
    const w = Math.min(FLOOR_CHUNK, x1 - cx);
    if (cx + w < camL || cx > camR) continue;
    stamp(c, `usa-floor-${i}`, cx, GY, w, FLOOR_D, g => paintFloor(g, cx, w));
  }
};
