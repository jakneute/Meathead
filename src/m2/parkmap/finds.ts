// The park map's tally: under each land's name a little plaque of three slots, one per hidden find there (store.ts
// LAND_FINDS: the armor piece, the two others). A find not got yet is a wooden crate with a ? on it (nothing said of
// where it is or what); one got is a gold tile with its icon (a piece of armor, a heart, a bullet, a charge shard),
// the got ones first. Beside the plaque, once the boss is beaten, a flag on a pole: CLEAR in the land's sign colors,
// or, the boss beaten AND all three found, a gold 100% one (store.ts isLandComplete). The flag waves: a few frames,
// each painted the once and kept (a badge canvas per land per state per frame), put down with one drawImage.

import { LANDS } from '../hub/lands';
import { signText, signW, type Look } from '../signLetters';
import { findsGot, isLandCleared, isLandComplete, LAND_COLLECTIBLES, type FindKind } from '../store';
import { R, hl, vl, dith, mix, ramp, type Ctx } from './paint';

const INK = '#1C1206';
const SLOT = 11, SLOT_GAP = 1, PLAQUE_PAD = 2;
const FLAG_FRAMES = 8, FLAG_MS = 117;
const POLE_GAP = 3;
/** The cloth's height: 100%'s letters set tall (its % and 0s read at 1x tall, not bold). */
const flagH = (word: Word) => (word === '100%' ? 17 : 11);

type Word = 'CLEAR' | '100%';
const wordLook = (li: number, word: Word): Look => word === '100%'
  ? { sx: 1, sy: 2, bold: false, gap: 2, fill: ['#FFFFFF', '#FFFFFF', '#FEF3C7', '#FDE68A'], ink: '#5A1E04' }
  : { sx: 1, sy: 1, bold: true, fill: LANDS[li].signText, shadow: INK };
const clothW = (li: number, word: Word) => Math.round(signW(word, wordLook(li, word))) + 10;

/** The plaque's size (screen px). */
const plaqueW = (n: number) => PLAQUE_PAD * 2 + n * SLOT + (n - 1) * SLOT_GAP;
const PLAQUE_H = SLOT + PLAQUE_PAD * 2;
/** The whole badge's box (the plaque, the pole and the widest cloth it could fly): the same whatever's been found, so
 *  the map's labels keep off all of it (render.ts reserves it under the name). */
export const BADGE_H = PLAQUE_H + 8;
/** The badge's left edge from the name's middle: the plaque's centered under the name, the flag off to its right. */
export const badgeLeft = (li: number) => -Math.round(plaqueW(LAND_COLLECTIBLES[LANDS[li].id] ?? 3) / 2);
export const badgeW = (li: number) => plaqueW(LAND_COLLECTIBLES[LANDS[li].id] ?? 3) + POLE_GAP + 3 + Math.max(clothW(li, 'CLEAR'), clothW(li, '100%')) + 3;

// ---- the slots' art (pixel bitmaps: a letter per color)
const BITS: Record<FindKind | 'q', { rows: string[]; cols: Record<string, string> }> = {
  q: { rows: ['.aaa.', 'a...a', '...a.', '..a..', '.....', '..a..'], cols: { a: '#FFF1C8' } },
  health: { rows: ['.rr.rr.', 'rhrrrrr', 'rrrrrrr', 'rrrrrrd', '.rrrrd.', '..rrd..', '...d...'], cols: { r: '#DC2626', h: '#FCA5A5', d: '#7F1D1D' } },
  ammo: { rows: ['.g.', 'ghg', 'ggd', 'bhb', 'bhd', 'bbd', 'bbd', 'ddd'], cols: { g: '#78716C', h: '#FEF3C7', b: '#C2870A', d: '#5C3402' } },
  shard: { rows: ['..c..', '.chc.', '.chc.', 'chccc', 'ccccd', '.ccd.', '..d..'], cols: { c: '#22D3EE', h: '#E0FFFF', d: '#0E7490' } },
  armor: { rows: ['.sssss.', 'shssssd', 'shssssd', 'shsssdd', '.ssssd.', '..sdd..'], cols: { s: '#A1A1AA', h: '#F4F4F5', d: '#52525B' } },
};
const bits = (g: Ctx, x: number, y: number, k: FindKind | 'q') => {
  const b = BITS[k], w = b.rows[0].length, h = b.rows.length;
  const ox = x + Math.floor((SLOT - w) / 2), oy = y + Math.floor((SLOT - h) / 2);
  b.rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const c = b.cols[row[i]]; if (c) R(g, ox + i, oy + j, 1, 1, c); } });
};

/** A slot, its top left at (x, y): a crate (not found) or a gold tile with the find's icon. */
const paintSlot = (g: Ctx, x: number, y: number, kind: FindKind | null) => {
  const r = ramp(kind ? '#E0AE3A' : '#9A6B3A');
  R(g, x, y, SLOT, SLOT, INK);
  R(g, x + 1, y + 1, SLOT - 2, SLOT - 2, r.base);
  // (lit top, shaded foot, a dithered seam between)
  hl(g, x + 1, y + 1, SLOT - 2, r.hi); dith(g, x + 1, y + 2, SLOT - 2, 1, r.lit);
  hl(g, x + 1, y + SLOT - 2, SLOT - 2, r.deep); dith(g, x + 1, y + SLOT - 3, SLOT - 2, 1, r.shade);
  vl(g, x + 1, y + 2, SLOT - 4, r.lit); vl(g, x + SLOT - 2, y + 2, SLOT - 4, r.shade);
  if (kind) { R(g, x + 2, y + 2, SLOT - 4, SLOT - 4, mix(r.base, '#FFFBEB', 0.7)); bits(g, x, y, kind); }
  else { hl(g, x + 2, y + 5, SLOT - 4, r.shade); bits(g, x, y, 'q'); }
};

/** The cloth, flat, on its own canvas (the waving cuts it in columns). */
const cloths = new Map<string, HTMLCanvasElement>();
const clothArt = (li: number, word: Word) => {
  const key = `${li}|${word}`;
  let c = cloths.get(key);
  if (c) return c;
  const w = clothW(li, word), h = flagH(word);
  c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  const r = ramp(word === '100%' ? '#D9A21E' : LANDS[li].sign);
  R(g, 0, 0, w, h, INK);
  R(g, 1, 1, w - 2, h - 2, r.base);
  hl(g, 1, 1, w - 2, r.hi); dith(g, 1, 2, w - 2, 1, r.lit);
  hl(g, 1, h - 2, w - 2, r.deep); dith(g, 1, h - 3, w - 2, 1, r.shade);
  // (the hem down the pole side)
  vl(g, 1, 1, h - 2, r.deep); vl(g, 2, 1, h - 2, r.shade);
  if (word === '100%') { R(g, w - 3, 2, 1, 1, '#FFFFFF'); R(g, 4, h - 4, 1, 1, '#FFFFFF'); }
  signText(g, word, 3 + (w - 3) / 2, h - 2, wordLook(li, word));
  cloths.set(key, c);
  return c;
};

/** A frame of the flag: the pole at x (its foot at the badge's foot), the cloth flying right, waving. */
const paintFlag = (g: Ctx, li: number, word: Word, x: number, k: number) => {
  const top = 1, foot = BADGE_H;
  R(g, x - 1, top + 1, 3, foot - top - 1, INK); vl(g, x, top + 2, foot - top - 3, '#E7E5E4');
  R(g, x - 1, top - 1, 3, 3, word === '100%' ? '#FDE047' : '#E0AE3A'); R(g, x, top - 1, 1, 1, '#FFFBEB');
  const cl = clothArt(li, word), w = cl.width, FLAG_H = cl.height, ph = (k / FLAG_FRAMES) * Math.PI * 2, r = ramp(word === '100%' ? '#D9A21E' : LANDS[li].sign);
  for (let col = 0; col < w; col += 2) {
    const u = col / w, a = ph - u * 4.4, dy = Math.round(1.6 * Math.min(1, u * 1.6) * Math.sin(a)), s = Math.cos(a) * Math.min(1, u * 2);
    const cw = Math.min(2, w - col), X = x + 2 + col, Y = top + 2 + dy;
    g.drawImage(cl, col, 0, cw, FLAG_H, X, Y, cw, FLAG_H);
    // (light and shade down the folds, dithered at the turns)
    // (along the hems only: the word stays clean)
    if (col >= 4) {
      const c = s > 0.55 ? r.hi : s < -0.55 ? r.deep : null;
      if (c) { dith(g, X, Y + 1, cw, 1, c); dith(g, X, Y + FLAG_H - 2, cw, 1, c); }
    }
  }
};

/** A land's badge for what's found and beaten, a frame of it (painted once, kept). */
const badges = new Map<string, HTMLCanvasElement>();
const badgeArt = (li: number, got: FindKind[], word: Word | null, k: number) => {
  const key = `${li}|${got.join(',')}|${word}|${word ? k : 0}`;
  let c = badges.get(key);
  if (c) return c;
  const n = LAND_COLLECTIBLES[LANDS[li].id] ?? 3, pw = plaqueW(n);
  const w = word ? pw + POLE_GAP + 3 + clothW(li, word) + 3 : pw;
  c = document.createElement('canvas'); c.width = w; c.height = BADGE_H;
  const g = c.getContext('2d')!;
  // (the plaque: a strip of the brochure's cream on a drop shadow, inked)
  const py = BADGE_H - PLAQUE_H;
  R(g, 1, py + 1, pw, PLAQUE_H, 'rgba(40,24,8,0.4)');
  R(g, 0, py, pw, PLAQUE_H, INK); R(g, 1, py + 1, pw - 2, PLAQUE_H - 2, '#FFF7E0'); hl(g, 1, py + PLAQUE_H - 2, pw - 2, '#E9D9B0');
  for (let i = 0; i < n; i++) paintSlot(g, PLAQUE_PAD + i * (SLOT + SLOT_GAP), py + PLAQUE_PAD, got[i] ?? null);
  if (word) paintFlag(g, li, word, pw + POLE_GAP, k);
  badges.set(key, c);
  return c;
};

/** Every land's badge, live over the map (at: where each land's badge goes on screen, its top left (render.ts
 *  landBadgeAt);
 *  null skips it: the closest zoom shows no names). t: ms, for the wave. */
/** (one badge, for a look at it off the map: tools) */
export const findBadgeArt = (li: number, got: FindKind[], word: Word | null, k: number) => badgeArt(li, got, word, k);

export const drawFindBadges = (g: Ctx, at: (li: number) => { x: number; y: number } | null, t: number) => {
  const k = Math.floor(t / FLAG_MS) % FLAG_FRAMES;
  LANDS.forEach((land, li) => {
    const p = at(li);
    if (!p) return;
    const word: Word | null = isLandComplete(land.id) ? '100%' : isLandCleared(land.id) ? 'CLEAR' : null;
    const art = badgeArt(li, findsGot(land.id), word, k);
    // (the plaque under the name, the flag off to its right: render.ts places it and keeps the room)
    g.drawImage(art, Math.round(p.x), Math.round(p.y));
  });
};
