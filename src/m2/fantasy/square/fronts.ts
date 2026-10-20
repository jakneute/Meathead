// The town square's shopfronts (back from the play plane at FRONT_D: dimmed a step toward the cold air, none of them
// to stand on), with real sides going back to BACK_D (walk past an end and there's its wall, its snowy roof running
// back, the alley between it and the next):
//
//   HOGSMEAT    crooked half-timbered fronts: a stone plinth, the shop's bay window glowing warm and stacked with what it
//               sells (wands in their boxes, jars of sweets, quills and ink, brooms, owls in cages, robes, joke boxes,
//               a pub's fire), an oak door with its lantern, the name on a gilt fascia; jettied upper floors leaning out
//               over the street (oak studs, braces, plaster panels, leaded casements with snow on their sills); a steep
//               gable heaped with snow, icicles off its eaves, a crooked chimney
//   STORYBOOK   Fantasyland's cottages: pastel plaster, painted timbers, an arcade arch, scalloped shingle roofs under
//               the snow, window boxes of evergreen with red bows, a crest, a turret on the corner of some
//   GINGERBREAD the lane's: gingerbread walls, royal icing piped along every edge and dripping off the eaves, candy-cane
//               corners, gumdrops on the ridge, boiled-sugar windows, a peppermint rose window
//   THE PARK    past the bandstand: a clipped hedge with its topiary (a swan, a dragon, a teapot) and the gate on to the
//               fairy wheel
//
// The pavement going back to them (worn flags, joints running back to the eye, a granite kerb, snow banked along their
// feet), the snowy back alley behind them, and on the pavement the street's furniture: iron lamp posts, benches
// under snow, a snowman, the owl post box, butter brew barrels, a Christmas tree, a broom rack.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { signText, signW } from '../../signLetters';
import { timeOfDay } from '../../timeOfDay';
import {
  type Ctx, type View, INK, box, mix, hash, checker, gilt, at, stillAt, seen, polyF, sideBack, slab, postR, ballR, snowCap,
  FRONT_D, BACK_D, PLASTER, TIMBER, SLATE, SNOW, FLAG, STONE, IRON, GOLD, GINGER, ICING, PINE, BRICK, ramp6, rampH, dimmed, hour, lit, warmGlass,
} from '../kit';
import { GY } from '../geometry';
import { X } from './layout';

type Style = 'hog' | 'story' | 'ginger' | 'park' | 'station';
type Goods = 'wands' | 'sweets' | 'quills' | 'brooms' | 'owls' | 'robes' | 'jokes' | 'pub' | 'cauldrons' | 'slippers' | 'toys' | 'gowns' | 'portraits' | 'tea';
interface Front { x: number; w: number; h: number; style: Style; seed: number; goods: Goods; name: string | null }

/** Where each street's fronts run (x from the section's start). Between them: the station, WANDS & SONS (in the play
 *  plane), the gorge, the Grand Staircase (their own backs). */
const AREAS: [number, number, Style][] = [[-460, 230, 'station'], [250, 3660, 'hog'], [4130, 4860, 'hog'], [4860, 6660, 'story'], [7940, 10660, 'ginger'], [10660, 11000, 'story'], [12320, 14380, 'story'], [14400, 15400, 'park']];
const HOG_NAMES = ['HONEYPOTS', "SCRIBBLER'S", 'THE THREE BROOMS', 'OWL POST', 'JOKES & SUCH', 'ROBES', "THE PIG'S BUTT", 'CAULDRONS', 'BROOMS R US', 'TEA ROOM', 'OLLIE VANDERS', 'BUTTER BREW'];
const HOG_GOODS: Goods[] = ['sweets', 'quills', 'pub', 'owls', 'jokes', 'robes', 'pub', 'cauldrons', 'brooms', 'tea', 'wands', 'pub'];
const STORY_NAMES = ['GIFTS', 'PRINCESS FAIRE', 'TOYS', 'GLASS SLIPPERS', 'PORTRAITS', 'SWEETS', 'TIARAS'];
const STORY_GOODS: Goods[] = ['toys', 'gowns', 'toys', 'slippers', 'portraits', 'sweets', 'gowns'];

export const FRONTS: Front[] = (() => {
  const out: Front[] = [];
  for (const [a, b, style] of AREAS) {
    if (style === 'park' || style === 'station') { out.push({ x: a, w: b - a, h: style === 'park' ? 90 : 200, style, seed: 7, goods: 'tea', name: null }); continue; }
    let x = a, i = 0;
    while (x < b - 60) {
      const seed = Math.floor(a / 7) + i * 13, w = Math.min(b - x, 130 + Math.floor(hash(seed) * 90));
      const h = style === 'story' ? 130 + Math.floor(hash(seed * 3) * 50) : style === 'ginger' ? 120 + Math.floor(hash(seed * 3) * 40) : 150 + Math.floor(hash(seed * 3) * 64);
      const k = Math.floor(hash(seed * 5) * 97);
      const name = style === 'hog' ? (seed % 4 !== 3 ? HOG_NAMES[k % HOG_NAMES.length] : null) : style === 'story' ? (seed % 3 !== 2 ? STORY_NAMES[k % STORY_NAMES.length] : null) : null;
      const goods = style === 'hog' ? HOG_GOODS[k % HOG_GOODS.length] : style === 'story' ? STORY_GOODS[k % STORY_GOODS.length] : 'sweets';
      if (w > 90) out.push({ x, w, h, style, seed, goods, name });
      x += w + 18; i++;
    }
  }
  return out;
})();

/** The roof's rise over a front (its gable), its peak's x (crooked in Hogsmeat), how far it leans. */
const roofOf = (f: Front) => {
  const lean = f.style === 'hog' ? Math.round((hash(f.seed * 7) - 0.5) * 16) : 0;
  const rh = f.style === 'park' || f.style === 'station' ? 0 : f.style === 'story' ? Math.round(f.w * 0.42) : f.style === 'ginger' ? Math.round(f.w * 0.5) : Math.round(f.w * 0.62);
  return { lean, rh, peak: Math.round(f.w * (0.5 + (f.style === 'hog' ? (hash(f.seed * 2) - 0.5) * 0.2 : 0)) + lean) };
};

// ---------------------------------------------------------------------------------------------------------------
// What's in the windows (painted inside a glowing pane: x, y its top left, w, h)

type Paint = (g: Ctx, x: number, y: number, w: number, h: number, s: number) => void;
const D = (c: string) => dimmed(c);
const shelf = (g: Ctx, x: number, y: number, w: number) => { box(g, x, y, w, 2, D('#5E3E2A')); box(g, x, y, w, 1, D('#9E744E')); };
const GOODS: Record<Goods, Paint> = {
  wands: (g, x, y, w, h) => { for (let r = 0; r < Math.floor(h / 6); r++) for (let k = 0; k < Math.floor(w / 9); k++) { const bx = x + 1 + k * 9 + (r % 2) * 2, by = y + 2 + r * 6; box(g, bx, by, 8, 5, D(['#3A2A4A', '#5A3A24', '#2A3A4A', '#4A2A2A'][(r + k) % 4])); box(g, bx, by, 2, 5, D(['#C8A040', '#A8A8B8', '#C83A3A', '#3A8A5A'][(r * 3 + k) % 4])); } },
  sweets: (g, x, y, w, h) => { for (const sy of [y + h * 0.5, y + h - 2]) { shelf(g, x, sy, w); for (let k = 0; k < Math.floor(w / 10); k++) { const jx = x + 2 + k * 10; box(g, jx, sy - 11, 8, 11, D('#C8E4F4')); box(g, jx + 1, sy - 8, 6, 7, D(['#F472B6', '#FDE047', '#60A5FA', '#4ADE80', '#F97316'][(k + Math.round(sy)) % 5])); box(g, jx + 2, sy - 13, 4, 2, D('#8A5A30')); box(g, jx + 1, sy - 10, 1, 8, D('#FFFFFF')); } } },
  quills: (g, x, y, w, h) => { shelf(g, x, y + h - 2, w); for (let k = 0; k < Math.floor(w / 12); k++) { const qx = x + 4 + k * 12; box(g, qx - 3, y + h - 8, 7, 6, D('#1A1A2A')); g.strokeStyle = D(['#FFFFFF', '#E8C8A0', '#C8A8E8'][k % 3]); g.lineWidth = 2; g.beginPath(); g.moveTo(qx, y + h - 8); g.quadraticCurveTo(qx + 4, y + h * 0.4, qx + 8, y + 3); g.stroke(); } for (let k = 0; k < 3; k++) box(g, x + 4 + k * (w / 3), y + 4, w / 3 - 8, 10, D('#E8DCB8')); },
  brooms: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 14); k++) { const bx = x + 6 + k * 14; g.strokeStyle = D('#7A5232'); g.lineWidth = 2; g.beginPath(); g.moveTo(bx - 4, y + 2); g.lineTo(bx + 4, y + h - 10); g.stroke(); polyF(g, [[bx + 1, y + h - 12], [bx + 9, y + h - 12], [bx + 11, y + h], [bx - 2, y + h]], D('#C8A050')); box(g, bx + 1, y + h - 12, 8, 2, D('#8A3A2A')); } },
  owls: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 22); k++) { const cx = x + 11 + k * 22, cy = y + h * 0.55; g.strokeStyle = D('#C8A040'); g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, 9, Math.PI, 0); g.stroke(); for (let b = -8; b <= 8; b += 4) box(g, cx + b, cy, 1, 12, D('#C8A040')); box(g, cx - 9, cy + 12, 18, 2, D('#8A6A2A')); ballR(g, cx, cy + 5, 4, ramp6(D(['#C8A070', '#E8E0D0', '#6A5A4A'][k % 3])), false); box(g, cx - 2, cy + 3, 1, 1, INK); box(g, cx + 1, cy + 3, 1, 1, INK); } },
  robes: (g, x, y, w, h) => { const H2 = [['#9B1C1C', '#E0AE3A'], ['#166534', '#C8CCD4'], ['#1E3A8A', '#B07A4A'], ['#CA8A04', '#18181B']]; for (let k = 0; k < Math.floor(w / 20); k++) { const cx = x + 10 + k * 20, [m, t] = H2[k % 4]; polyF(g, [[cx - 5, y + 6], [cx + 5, y + 6], [cx + 8, y + h - 2], [cx - 8, y + h - 2]], D('#22202A')); box(g, cx - 1, y + 8, 2, h - 12, D(t)); box(g, cx - 5, y + 6, 10, 3, D(m)); box(g, cx - 3, y + 1, 6, 5, D('#D8D0C8')); } },
  jokes: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 13); k++) { const bx = x + 2 + k * 13, bh = 8 + (k % 3) * 4; box(g, bx, y + h - bh, 11, bh, D(['#F97316', '#A855F7', '#22C55E', '#EF4444'][k % 4])); box(g, bx + 4, y + h - bh + 2, 2, 4, D('#FFFFFF')); } const jx = x + w - 14; box(g, jx, y + h - 14, 10, 10, D('#E0AE3A')); g.strokeStyle = D('#A8A8B8'); g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 4; k++) { g.moveTo(jx + 2, y + h - 14 - k * 3); g.lineTo(jx + 8, y + h - 16 - k * 3); } g.stroke(); ballR(g, jx + 5, y + h - 28, 4, ramp6(D('#F4C8A0')), false); },
  pub: (g, x, y, w, h) => { box(g, x + w - 18, y + h - 16, 14, 14, D('#2A1A10')); for (let k = 0; k < 3; k++) box(g, x + w - 15 + k * 3, y + h - 10 - (k % 2) * 3, 3, 8, ['#FDE047', '#F97316', '#DC2626'][k]); for (let k = 0; k < Math.floor((w - 24) / 22); k++) { const tx = x + 8 + k * 22; box(g, tx - 6, y + h - 10, 14, 2, D('#5E3E2A')); box(g, tx, y + h - 8, 2, 8, D('#5E3E2A')); box(g, tx - 4, y + h - 15, 4, 5, D('#E8B040')); box(g, tx - 4, y + h - 16, 4, 1, D('#FFF8E8')); g.fillStyle = D('#3A2A2A'); g.beginPath(); g.arc(tx + 6, y + h - 22, 4, 0, Math.PI * 2); g.fill(); box(g, tx + 3, y + h - 18, 7, 8, D('#3A2A2A')); } },
  cauldrons: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 16); k++) for (let r = 0; r < 2; r++) { const cx = x + 8 + k * 16 + r * 8, cy = y + h - 6 - r * 12; if (cx > x + w - 6) continue; g.fillStyle = D('#1A1A22'); g.beginPath(); g.ellipse(cx, cy, 7, 6, 0, 0, Math.PI * 2); g.fill(); box(g, cx - 7, cy - 6, 14, 2, D('#3A3A48')); box(g, cx - 4, cy - 3, 2, 2, D('#5A5A6A')); } },
  slippers: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 18); k++) { const cx = x + 9 + k * 18, cy = y + h - 6; box(g, cx - 8, cy, 16, 5, D('#B91C4A')); box(g, cx - 8, cy, 16, 1, D('#F06A8A')); polyF(g, [[cx - 6, cy], [cx + 5, cy], [cx + 6, cy - 4], [cx - 1, cy - 5]], D('#CFF4FF')); box(g, cx - 4, cy - 4, 2, 1, '#FFFFFF'); } },
  toys: (g, x, y, w, h) => { shelf(g, x, y + h - 2, w); for (let k = 0; k < Math.floor(w / 14); k++) { const cx = x + 7 + k * 14, f = y + h - 2; if (k % 3 === 0) { box(g, cx - 2, f - 16, 5, 12, D('#C81E3A')); box(g, cx - 2, f - 20, 5, 4, D('#F4C8A0')); box(g, cx - 3, f - 24, 7, 4, D('#1A1A2A')); box(g, cx - 2, f - 4, 2, 4, D('#1A1A2A')); box(g, cx + 1, f - 4, 2, 4, D('#1A1A2A')); } else if (k % 3 === 1) { ballR(g, cx, f - 6, 5, ramp6(D('#B07A48')), false); ballR(g, cx, f - 14, 4, ramp6(D('#B07A48')), false); } else { box(g, cx - 6, f - 10, 12, 6, D('#F4F0E8')); box(g, cx + 4, f - 15, 4, 6, D('#F4F0E8')); g.strokeStyle = D('#8A5A30'); g.lineWidth = 1; g.beginPath(); g.arc(cx, f - 2, 7, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } } },
  gowns: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 20); k++) { const cx = x + 10 + k * 20, col = ['#3B82F6', '#FACC15', '#F472B6', '#2DD4BF', '#A78BFA'][k % 5]; polyF(g, [[cx - 3, y + 8], [cx + 3, y + 8], [cx + 9, y + h - 2], [cx - 9, y + h - 2]], D(col)); box(g, cx - 4, y + 6, 8, 6, D(col)); box(g, cx - 9, y + h - 6, 18, 1, D(mix(col, '#FFFFFF', 0.4))); box(g, cx - 1, y + 2, 2, 4, D('#8A8A9A')); } },
  portraits: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 18); k++) { const px = x + 3 + k * 18, py = y + 3 + (k % 2) * 6; box(g, px, py, 14, 18, D('#C8A040')); box(g, px + 2, py + 2, 10, 14, D(['#3A4A3A', '#4A3A3A', '#3A3A4A'][k % 3])); ballR(g, px + 7, py + 8, 3, ramp6(D(['#E8C0A0', '#8A5A36', '#C8946A'][k % 3])), false); box(g, px + 4, py + 11, 6, 5, D(['#7A1A2A', '#1A3A6A', '#2A5A2A'][k % 3])); } },
  tea: (g, x, y, w, h) => { shelf(g, x, y + h - 2, w); for (let k = 0; k < Math.floor(w / 16); k++) { const cx = x + 8 + k * 16, f = y + h - 2; if (k % 2) { ballR(g, cx, f - 6, 5, ramp6(D(['#F4F0FA', '#9CD0F4', '#F49AC8'][k % 3])), false); box(g, cx + 4, f - 9, 4, 2, D('#F4F0FA')); box(g, cx - 1, f - 12, 2, 2, D('#C8A040')); } else { box(g, cx - 6, f - 7, 12, 7, D('#F4E0C8')); box(g, cx - 6, f - 8, 12, 2, D('#F49AC8')); box(g, cx - 1, f - 11, 2, 3, D('#DC2626')); } } },
};

/** A glowing pane (warm inside, the goods in it, mullions over), inked. */
const pane = (g: Ctx, x: number, y: number, w: number, h: number, goods: Goods, s: number, mull = 2) => {
  const G = warmGlass();
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  for (let i = 0; i < 4; i++) box(g, x, y + (h * i) / 4, w, Math.ceil(h / 4) + 1, G[4 - i]);
  checker(g, x, y + h / 4 - 1, w, 2, G[3], 0, 1); checker(g, x, y + h / 2 - 1, w, 2, G[2], 1, 1);
  GOODS[goods](g, x, y, w, h, s);
  const M = D('#3A2418');
  for (let k = 1; k < mull; k++) box(g, x + (w * k) / mull - 1, y, 2, h, M);
  box(g, x, y + Math.round(h * 0.38), w, 1, M);
  box(g, x + 2, y + 2, 2, Math.min(10, h - 4), G[5]);
};
/** A leaded casement (diamond panes), its sill with snow on it, shutters on some. */
const casement = (g: Ctx, x: number, y: number, w: number, h: number, s: number, lit2: boolean) => {
  const G = warmGlass(), T = rampH(TIMBER, true), S = rampH(SNOW, true);
  box(g, x - 2, y - 2, w + 4, h + 4, INK); box(g, x - 1, y - 1, w + 2, h + 2, T[3]);
  if (lit2) { for (let i = 0; i < 3; i++) box(g, x, y + (h * i) / 3, w, Math.ceil(h / 3) + 1, G[4 - i]); }
  else { box(g, x, y, w, h, D('#3A3458')); box(g, x, y, w, h / 3, D('#5A5A80')); }
  g.strokeStyle = mix(T[1], INK, 0.3); g.lineWidth = 1; g.beginPath();
  for (let k = -h; k < w; k += 5) { g.moveTo(x + k, y); g.lineTo(x + k + h, y + h); g.moveTo(x + k + h, y); g.lineTo(x + k, y + h); }
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.stroke(); g.restore();
  box(g, x + w / 2 - 1, y, 2, h, T[1]);
  box(g, x - 3, y + h + 1, w + 6, 3, T[2]); box(g, x - 3, y + h, w + 6, 2, S[4]); box(g, x - 3, y + h - 1, w + 6, 1, S[5]);
  if (s % 3 === 0) { const C = rampH(ramp6(['#2E5A4A', '#7A2A2A', '#2A3E6A'][s % 3 === 0 ? (s >> 2) % 3 : 0]), true); for (const sx of [x - 9, x + w + 2]) { box(g, sx - 1, y - 1, 9, h + 2, INK); box(g, sx, y, 7, h, C[3]); box(g, sx, y, 2, h, C[4]); for (let k = y + 3; k < y + h - 2; k += 4) box(g, sx + 1, k, 5, 1, C[2]); } }
};
/** The front's name: a gilt board over the shop (fixed to it on two iron pins). */
const fascia = (g: Ctx, cx: number, y: number, name: string, board: string) => {
  const L = gilt(1), w = Math.round(signW(name, L) + 16), B = rampH(ramp6(board), true);
  box(g, cx - w / 2 - 2, y - 2, w + 4, 17, INK);
  box(g, cx - w / 2 - 1, y - 1, w + 2, 15, D(GOLD[3])); box(g, cx - w / 2 - 1, y - 1, w + 2, 1, D(GOLD[5]));
  box(g, cx - w / 2, y, w, 13, B[3]); box(g, cx - w / 2, y, w, 2, B[4]); box(g, cx - w / 2, y + 11, w, 2, B[2]);
  signText(g, name, cx, y + 10, L);
};
/** An oak door: panels, iron straps, a step, a lantern on its bracket beside it. */
const door = (g: Ctx, x: number, foot: number, w: number, h: number, col = '#5E3E2A') => {
  const T = rampH(ramp6(col), true), S = rampH(FLAG, true), I = rampH(IRON, true);
  box(g, x - 3, foot - 4, w + 6, 4, S[3]); box(g, x - 3, foot - 4, w + 6, 1, S[5]);
  box(g, x - 2, foot - h - 2, w + 4, h - 2, INK);
  g.fillStyle = INK; g.beginPath(); g.arc(x + w / 2, foot - h + w / 2, w / 2 + 2, Math.PI, 0); g.fill();
  box(g, x, foot - h + w / 2, w, h - w / 2 - 4, T[3]);
  g.fillStyle = T[3]; g.beginPath(); g.arc(x + w / 2, foot - h + w / 2, w / 2, Math.PI, 0); g.fill();
  for (let k = 2; k < w - 2; k += 5) box(g, x + k, foot - h + 4, 1, h - 8, T[2]);
  box(g, x, foot - h + w / 2, 2, h - w / 2 - 4, T[4]);
  for (const yy of [foot - h * 0.7, foot - h * 0.3]) { box(g, x, yy, w, 2, I[2]); box(g, x, yy, w, 1, I[4]); }
  box(g, x + w - 5, foot - h * 0.5, 2, 3, D(GOLD[4]));
  // (the lantern)
  const lx = x + w + 9, ly = foot - h + 4;
  box(g, lx - 6, ly - 2, 8, 2, I[2]); box(g, lx - 1, ly, 2, 4, I[2]);
  box(g, lx - 4, ly + 4, 8, 11, INK); box(g, lx - 3, ly + 5, 6, 9, lit() ? '#FFE9A8' : D('#F2D79A')); box(g, lx - 3, ly + 5, 2, 9, lit() ? '#FFFFFF' : D('#FFF6D8')); box(g, lx - 5, ly + 3, 10, 2, I[3]); box(g, lx - 2, ly + 15, 4, 2, I[3]);
};
/** A chimney stack: brick, its pots, snow on top. */
const chimney = (g: Ctx, x: number, y: number, h: number, seed: number) => {
  const B = rampH(BRICK, true);
  box(g, x - 1, y - 1, 16, h + 2, INK); box(g, x, y, 14, h, B[3]); box(g, x, y, 3, h, B[4]); box(g, x + 10, y, 4, h, B[2]);
  for (let yy = y + 3; yy < y + h; yy += 4) box(g, x + ((yy / 4) % 2) * 3, yy, 14, 1, B[1]);
  box(g, x - 2, y - 2, 18, 3, B[2]);
  for (const px of [x + 2, x + 8]) { box(g, px - 1, y - 9, 6, 8, INK); box(g, px, y - 8, 4, 7, D('#B8684A')); box(g, px, y - 8, 1, 7, D('#D8886A')); }
  snowCap(g, x - 2, y - 2, 18, 3, seed, rampH(SNOW, true), false);
};

// ---------------------------------------------------------------------------------------------------------------
// The fronts, painted (local: x 0..w along the street, y up from the foot at 0)

const paintHog = (g: Ctx, f: Front) => {
  const { w, h, seed } = f, { lean, rh, peak } = roofOf(f);
  const P = rampH(ramp6(['#CDBCA6', '#C8B4A8', '#D8C6A0', '#BCB0B4', '#D2BC9C'][seed % 5]), true), T = rampH(TIMBER, true), F = rampH(FLAG, true), S = rampH(SNOW, true), SL = rampH(SLATE, true);
  const gf = 74, floors = Math.max(1, Math.floor((h - gf) / 60)), fh = (h - gf) / floors;
  // GROUND FLOOR: a stone plinth, the plaster, the bay window and the door, the fascia
  box(g, -1, -gf - 1, w + 2, gf + 1, INK);
  slab(g, 0, -gf, w, gf, P);
  box(g, 0, -10, w, 10, F[2]); box(g, 0, -10, w, 1, F[4]); for (let k = 6; k < w; k += 14) box(g, k, -9, 1, 9, F[1]);
  const doorW = 22, doorX = seed % 2 ? 10 : w - doorW - 22, bayX = seed % 2 ? doorX + doorW + 26 : 12, bayW = Math.max(40, w - doorW - 58);
  // (the bay: a timber frame round a big glowing window, its own little lean-to roof of slate and snow)
  box(g, bayX - 5, -gf + 10, bayW + 10, gf - 22, T[2]); box(g, bayX - 5, -gf + 10, bayW + 10, 2, T[4]);
  pane(g, bayX, -gf + 14, bayW, gf - 30, f.goods, seed, Math.max(2, Math.round(bayW / 26)));
  box(g, bayX - 6, -14, bayW + 12, 4, T[3]); box(g, bayX - 6, -14, bayW + 12, 1, T[5]);
  door(g, doorX, 0, doorW, 46);
  // UPPER FLOORS: jettied out and leaning, half-timbered, leaded casements
  let base = -gf;
  for (let fl = 0; fl < floors; fl++) {
    const jx = -4 - fl * 3 + Math.round((lean * (fl + 1)) / (floors + 1)), jw = w + 8 + fl * 6, top = base - fh;
    // (the jetty's beam, its brackets under it)
    box(g, jx - 1, base - 4, jw + 2, 6, INK); box(g, jx, base - 3, jw, 4, T[3]); box(g, jx, base - 3, jw, 1, T[5]);
    for (let k = jx + 6; k < jx + jw - 4; k += 22) { polyF(g, [[k, base + 1], [k + 4, base + 1], [k + 1, base + 8]], T[1]); }
    box(g, jx - 1, top - 1, jw + 2, fh - 2, INK);
    box(g, jx, top, jw, fh - 3, P[4]); box(g, jx + jw - 6, top, 6, fh - 3, P[2]); checker(g, jx + jw - 9, top, 3, fh - 3, P[2], 0, 1);
    // (the timbers: posts, a mid rail, braces in the panels)
    const n = Math.max(3, Math.round(jw / 26)), step = jw / n;
    for (let k = 0; k <= n; k++) { const px = Math.round(jx + k * step) - (k === n ? 4 : 0); box(g, px, top, 4, fh - 3, T[3]); box(g, px, top, 1, fh - 3, T[4]); }
    box(g, jx, top, jw, 4, T[3]); box(g, jx, top + fh * 0.55, jw, 3, T[2]);
    g.strokeStyle = T[2]; g.lineWidth = 3; g.beginPath();
    for (let k = 0; k < n; k++) { if ((k + fl + seed) % 3) continue; const a = jx + k * step + 4, b = jx + (k + 1) * step; g.moveTo(a, top + fh * 0.55); g.lineTo(b, top + 4); if ((k + seed) % 2) { g.moveTo(b, top + fh * 0.55); g.lineTo(a, top + 4); } }
    g.stroke();
    // (casements, lit warm or dark; one's an oriel bay on the wide ones)
    const wins = Math.max(1, Math.floor(jw / 52));
    for (let k = 0; k < wins; k++) { const wx = Math.round(jx + ((k + 0.5) * jw) / wins - 9); casement(g, wx, top + 10, 18, Math.min(22, fh * 0.42), seed + fl * 5 + k, hash(seed + fl * 3 + k) > 0.35 || lit()); }
    base = top;
  }
  // (the shop's name on its gilt fascia, over the bay, under the jetty)
  if (f.name) fascia(g, bayX + bayW / 2, -gf + 4, f.name, ['#1E3A6E', '#5A1E2A', '#1E4A3A', '#3A2A5A'][seed % 4]);
  // THE ROOF: a steep crooked gable (slate hung in its face, a carved bargeboard), snow heaped along both slopes
  const eave = base, ex0 = -10 + lean, ex1 = w + 10 + lean;
  polyF(g, [[ex0 - 2, eave + 2], [peak, eave - rh - 3], [ex1 + 2, eave + 2]], INK);
  polyF(g, [[ex0 + 6, eave], [peak, eave - rh + 6], [ex1 - 6, eave]], SL[3]);
  g.save(); g.beginPath(); g.moveTo(ex0 + 6, eave); g.lineTo(peak, eave - rh + 6); g.lineTo(ex1 - 6, eave); g.closePath(); g.clip();
  for (let y = eave - 4, r = 0; y > eave - rh; y -= 5, r++) { box(g, ex0, y, ex1 - ex0, 1, SL[1]); for (let x = ex0 + (r % 2) * 5; x < ex1; x += 10) box(g, x, y - 4, 1, 4, SL[2]); }
  box(g, peak - 7, eave - rh * 0.55, 14, 16, INK); casement(g, peak - 6, eave - rh * 0.55 + 1, 12, 14, seed * 3, lit() || hash(seed * 9) > 0.5);
  g.restore();
  // (the bargeboards, then the snow on them: thick, lumpy, its lit top, icicles)
  for (const [x0, x1] of [[ex0, peak], [peak, ex1]] as const) {
    g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(x0, x0 < peak ? eave : eave - rh); g.lineTo(x1, x1 > peak ? eave : eave - rh); g.stroke();
    g.strokeStyle = T[3]; g.lineWidth = 6; g.stroke();
    g.strokeStyle = S[3]; g.lineWidth = 7; g.beginPath(); g.moveTo(x0, (x0 < peak ? eave : eave - rh) - 6); g.lineTo(x1, (x1 > peak ? eave : eave - rh) - 6); g.stroke();
    g.strokeStyle = S[5]; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, (x0 < peak ? eave : eave - rh) - 9); g.lineTo(x1, (x1 > peak ? eave : eave - rh) - 9); g.stroke();
  }
  for (const ex of [ex0, ex1]) for (let k = 0; k < 4; k++) {
    const left = ex < peak, ix = ex + (left ? 4 + k * 5 : -4 - k * 5);
    const iy = Math.round(eave + 2 - (left ? (ix - ex0) * rh / Math.max(1, peak - ex0) : (ex1 - ix) * rh / Math.max(1, ex1 - peak)));
    box(g, ix, iy, 2, 4 + ((seed + k) % 4) * 2, S[2]); box(g, ix, iy, 1, 3, S[5]);
  }
  if (hash(seed * 4) > 0.3) { const cx = Math.round(peak + (hash(seed * 6) > 0.5 ? 1 : -1) * rh * 0.35 - 7), cy = eave - Math.round(rh * 0.65) - 18; chimney(g, cx, cy, 26, seed); }
};

const paintStory = (g: Ctx, f: Front) => {
  const { w, h, seed } = f, { rh, peak } = roofOf(f);
  const wallCol = ['#F0DCC0', '#E2D2EE', '#F4D2C4', '#D6E6D4', '#F2E6B8'][seed % 5], trim = ['#4A78D4', '#B04A7A', '#3A8A6A', '#7A4AB0', '#C86A2A'][(seed >> 1) % 5];
  const P = rampH(ramp6(wallCol), true), T = rampH(ramp6(trim), true), F = rampH(FLAG, true), S = rampH(SNOW, true), R = rampH(ramp6(['#4A78D4', '#8A3A5A', '#6A4A8A', '#3A7A5A'][(seed >> 2) % 4]), true);
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  slab(g, 0, -h, w, h, P);
  box(g, 0, -12, w, 12, F[2]); box(g, 0, -12, w, 1, F[4]);
  // (painted timbers in the trim color: a frame, a mid rail, braces)
  box(g, 0, -h, 4, h, T[3]); box(g, w - 4, -h, 4, h, T[2]); box(g, 0, -h, w, 4, T[3]); box(g, 0, -Math.round(h * 0.5), w, 4, T[3]); box(g, 0, -Math.round(h * 0.5), w, 1, T[4]);
  // (the ground floor: an arched shop window or two, the door; the crest)
  const archW = Math.min(70, (w - 40) / 2);
  for (let k = 0; k < 2; k++) {
    const ax = k === 0 ? 12 : w - archW - 12, ay = -Math.round(h * 0.5) + 14, ah = Math.round(h * 0.5) - 30;
    if (k === 1 && w < 170) continue;
    g.fillStyle = INK; g.beginPath(); g.arc(ax + archW / 2, ay + archW / 2, archW / 2 + 1, Math.PI, 0); g.fill();
    pane(g, ax, ay + archW / 2, archW, ah - archW / 2, f.goods, seed + k, 3);
    g.save(); g.beginPath(); g.arc(ax + archW / 2, ay + archW / 2, archW / 2, Math.PI, 0); g.clip(); const G = warmGlass(); box(g, ax, ay, archW, archW / 2, G[4]); box(g, ax, ay, archW, 3, G[5]); g.restore();
    box(g, ax - 3, ay + ah + 1, archW + 6, 3, T[2]);
    // (a window box under it: evergreen, red bows)
    box(g, ax - 2, ay + ah + 4, archW + 4, 6, D('#6A4A2A')); for (let q = 0; q < archW; q += 5) { box(g, ax + q, ay + ah + 1, 5, 4, D(['#2A5A3A', '#3A6A4A'][q % 2])); } for (let q = 6; q < archW; q += 16) { box(g, ax + q, ay + ah + 2, 3, 3, D('#D82A3A')); }
  }
  door(g, w / 2 - 11, 0, 22, 44, trim);
  if (f.name) fascia(g, w / 2, -Math.round(h * 0.5) - 10, f.name, trim);
  // (the upper floor: casements with flower boxes; a shield crest between them)
  const wins = Math.max(2, Math.floor(w / 56));
  for (let k = 0; k < wins; k++) { const wx = Math.round(((k + 0.5) * w) / wins - 10); casement(g, wx, -h + 16, 20, 26, seed + k, lit() || hash(seed + k) > 0.45); }
  const cx = w / 2, cy = -h + 30;
  polyF(g, [[cx - 9, cy - 9], [cx + 9, cy - 9], [cx + 9, cy + 2], [cx, cy + 11], [cx - 9, cy + 2]], INK);
  polyF(g, [[cx - 8, cy - 8], [cx + 8, cy - 8], [cx + 8, cy + 2], [cx, cy + 10], [cx - 8, cy + 2]], T[3]);
  polyF(g, [[cx - 8, cy - 8], [cx, cy - 8], [cx, cy + 10], [cx - 8, cy + 2]], D(GOLD[4]));
  // (the roof: scalloped shingles in rows under the snow)
  polyF(g, [[-12, -h + 2], [peak, -h - rh - 2], [w + 12, -h + 2]], INK);
  polyF(g, [[-10, -h], [peak, -h - rh], [w + 10, -h]], R[3]);
  g.save(); g.beginPath(); g.moveTo(-10, -h); g.lineTo(peak, -h - rh); g.lineTo(w + 10, -h); g.closePath(); g.clip();
  for (let y = -h - 2, r = 0; y > -h - rh; y -= 6, r++) for (let x = -10 + (r % 2) * 4; x < w + 10; x += 8) { g.fillStyle = R[2]; g.beginPath(); g.arc(x + 4, y, 4, 0, Math.PI); g.fill(); box(g, x + 1, y - 4, 2, 2, R[4]); }
  g.restore();
  for (const [x0, y0, x1, y1] of [[-12, -h, peak, -h - rh], [peak, -h - rh, w + 12, -h]] as const) {
    g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(x0, y0 - 3); g.lineTo(x1, y1 - 3); g.stroke();
    g.strokeStyle = S[3]; g.lineWidth = 7; g.stroke();
    g.strokeStyle = S[5]; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0 - 6); g.lineTo(x1, y1 - 6); g.stroke();
  }
  for (let k = 4; k < w; k += 9) { box(g, k, -h + 2, 2, 3 + ((k + seed) % 5), S[2]); box(g, k, -h + 2, 1, 2, S[5]); }
  // (a turret on the corner of some: round, its cone roof, a pennant)
  if (seed % 3 === 1) {
    const tx = seed % 2 ? w - 6 : 6, top = -h - 30, tw = 30;
    box(g, tx - tw / 2 - 1, top - 1, tw + 2, h * 0.5 + 31, INK);
    box(g, tx - tw / 2, top, tw, h * 0.5 + 30, P[3]); box(g, tx - tw / 2, top, 8, h * 0.5 + 30, P[4]); box(g, tx + 6, top, 9, h * 0.5 + 30, P[2]);
    casement(g, tx - 5, top + 12, 10, 16, seed * 2, lit());
    polyF(g, [[tx - tw / 2 - 5, top + 2], [tx, top - 46], [tx + tw / 2 + 5, top + 2]], INK);
    polyF(g, [[tx - tw / 2 - 4, top], [tx, top - 44], [tx + tw / 2 + 4, top]], R[3]);
    polyF(g, [[tx - tw / 2 - 4, top], [tx, top - 44], [tx - 4, top]], S[4]);
    polyF(g, [[tx + 3, top], [tx, top - 44], [tx + tw / 2 + 4, top]], R[2]);
    box(g, tx - tw / 2 - 4, top - 3, tw + 8, 4, S[4]);
    box(g, tx, top - 56, 1, 12, D('#4A4060')); polyF(g, [[tx + 1, top - 56], [tx + 12, top - 53], [tx + 1, top - 50]], D('#F49AC8'));
  }
};

const paintGinger = (g: Ctx, f: Front) => {
  const { w, h, seed } = f, { rh, peak } = roofOf(f);
  const G = rampH(GINGER, true), I = rampH(ICING, true), F = rampH(FLAG, true);
  const CANDY = ['#E8344A', '#4ADE80', '#FDE047', '#60A5FA', '#F472B6', '#A855F7'];
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  slab(g, 0, -h, w, h, G);
  // (the gingerbread's bake: freckles, a darker crust round the edges)
  for (let i = 0; i < w * h / 70; i++) { const x = hash(seed + i * 1.3) * w, y = -hash(seed + i * 2.7) * h; box(g, x, y, 1, 1, G[hash(i) > 0.5 ? 2 : 4]); }
  checker(g, 0, -h, w, 3, G[2], 0, 1); checker(g, 0, -4, w, 3, G[2], 1, 1);
  box(g, 0, -8, w, 8, F[2]); box(g, 0, -8, w, 1, F[4]);
  // (royal icing piped along the edges: a scalloped band, drips)
  const icingBand = (y: number) => { box(g, 0, y, w, 3, I[3]); for (let x = 0; x < w; x += 6) { g.fillStyle = I[3]; g.beginPath(); g.arc(x + 3, y + 3, 3, 0, Math.PI); g.fill(); box(g, x + 2, y, 2, 1, I[5]); } };
  icingBand(-h); icingBand(-Math.round(h * 0.55));
  // (candy-cane corners)
  for (const cx of [0, w - 6]) { box(g, cx - 1, -h, 8, h, INK); box(g, cx, -h, 6, h, D('#FFFFFF')); for (let y = -h; y < 0; y += 8) polyF(g, [[cx, y], [cx + 6, y - 4], [cx + 6, y], [cx, y + 4]], D('#E8344A')); }
  // (boiled-sugar windows: colored panes in an icing frame; a chocolate-bar door)
  const wins = Math.max(2, Math.floor(w / 50));
  for (let k = 0; k < wins; k++) for (const wy of [-h + 14, -Math.round(h * 0.55) + 12]) {
    const wx = Math.round(((k + 0.5) * w) / wins - 10);
    if (wy > -40 && Math.abs(wx + 10 - w / 2) < 22) continue;
    box(g, wx - 3, wy - 3, 26, 28, I[3]); box(g, wx - 3, wy - 3, 26, 1, I[5]);
    for (let q = 0; q < 4; q++) box(g, wx + (q % 2) * 10, wy + Math.floor(q / 2) * 11, 10, 11, D(lit() ? ['#FFE07A', '#FF9A6A', '#FFC8E8', '#A8F0B8'][(q + k + seed) % 4] : mix(CANDY[(q + k + seed) % 6], '#3A2A4A', 0.35)));
    box(g, wx + 9, wy, 2, 22, I[4]); box(g, wx, wy + 10, 20, 2, I[4]);
  }
  const dx = w / 2 - 12; box(g, dx - 1, -43, 26, 43, INK); box(g, dx, -42, 24, 42, D('#4A2410')); for (let r = 0; r < 4; r++) for (let q = 0; q < 2; q++) { box(g, dx + 2 + q * 11, -40 + r * 10, 9, 8, D('#6A3418')); box(g, dx + 2 + q * 11, -40 + r * 10, 9, 1, D('#8A4A28')); }
  // (gumdrops along the band)
  for (let k = 8; k < w - 8; k += 16) ballR(g, k, -Math.round(h * 0.55) - 3, 3, rampH(ramp6(CANDY[(((Math.floor(k + seed)) % 6) + 6) % 6]), true));
  // (the roof: a slab of icing over the gable, dripping, sprinkles; a peppermint rose window in the gable)
  polyF(g, [[-12, -h + 2], [peak, -h - rh - 2], [w + 12, -h + 2]], INK);
  polyF(g, [[-10, -h], [peak, -h - rh], [w + 10, -h]], G[3]);
  const rx = peak, ry = -h - rh * 0.4;
  g.fillStyle = INK; g.beginPath(); g.arc(rx, ry, 11, 0, Math.PI * 2); g.fill();
  g.fillStyle = D('#FFFFFF'); g.beginPath(); g.arc(rx, ry, 10, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 6; k++) { g.fillStyle = D('#E8344A'); g.beginPath(); g.moveTo(rx, ry); g.arc(rx, ry, 10, (k * Math.PI) / 3, (k * Math.PI) / 3 + 0.5); g.closePath(); g.fill(); }
  for (const [x0, y0, x1, y1] of [[-12, -h, peak, -h - rh], [peak, -h - rh, w + 12, -h]] as const) {
    g.strokeStyle = INK; g.lineWidth = 12; g.beginPath(); g.moveTo(x0, y0 - 4); g.lineTo(x1, y1 - 4); g.stroke();
    g.strokeStyle = I[3]; g.lineWidth = 10; g.stroke();
    g.strokeStyle = I[5]; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0 - 8); g.lineTo(x1, y1 - 8); g.stroke();
    for (let t = 0.05; t < 1; t += 0.09) { const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; box(g, x, y, 3, 3 + ((t * 100 + seed) % 6), I[3]); box(g, x, y - 6, 2, 1, D(CANDY[(((Math.floor(t * 40 + seed)) % 6) + 6) % 6])); }
  }
  ballR(g, peak, -h - rh - 8, 5, rampH(ramp6(CANDY[((Math.floor(seed) % 6) + 6) % 6]), true));
};

const paintPark = (g: Ctx, f: Front) => {
  // (a clipped hedge, its top dusted with snow; topiary on it; the gate's posts and its arch toward the fairy wheel)
  const { w } = f, Pn = rampH(PINE, true), S = rampH(SNOW, true), St = rampH(STONE, true);
  const hh = 64;
  box(g, -1, -hh - 1, w + 2, hh + 1, INK);
  box(g, 0, -hh, w, hh, Pn[2]);
  for (let x = 0; x < w; x += 4) for (let y = -hh + 2; y < 0; y += 4) { const t = hash(x * 0.7 + y * 1.3); if (t > 0.6) box(g, x, y, 2, 2, Pn[3]); else if (t < 0.15) box(g, x + 1, y + 1, 2, 2, Pn[1]); }
  box(g, 0, -hh, w, 3, Pn[4]); snowCap(g, 0, -hh, w, 5, 41, S, false);
  const topiary: [number, 'swan' | 'dragon' | 'teapot' | 'cone'][] = [[90, 'cone'], [230, 'swan'], [420, 'cone'], [560, 'teapot'], [760, 'dragon'], [900, 'cone']];
  for (const [tx, kind] of topiary) {
    if (tx > w - 20) continue;
    const y = -hh - 4;
    if (kind === 'cone') { polyF(g, [[tx - 14, y + 2], [tx, y - 50], [tx + 14, y + 2]], INK); polyF(g, [[tx - 13, y], [tx, y - 48], [tx + 13, y]], Pn[2]); polyF(g, [[tx - 13, y], [tx, y - 48], [tx - 3, y]], Pn[3]); for (let k = 0; k < 4; k++) box(g, tx - 10 + k * 2, y - 12 - k * 10, 20 - k * 5, 2, S[4]); }
    if (kind === 'swan') { ballR(g, tx, y - 14, 16, Pn); g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(tx + 10, y - 20); g.quadraticCurveTo(tx + 22, y - 42, tx + 12, y - 52); g.stroke(); g.strokeStyle = Pn[3]; g.lineWidth = 6; g.stroke(); ballR(g, tx + 11, y - 52, 6, Pn); box(g, tx - 12, y - 30, 22, 3, S[4]); box(g, tx + 6, y - 58, 9, 2, S[4]); }
    if (kind === 'teapot') { ballR(g, tx, y - 16, 17, Pn); box(g, tx - 6, y - 38, 12, 6, Pn[3]); g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(tx + 14, y - 14); g.lineTo(tx + 28, y - 28); g.stroke(); g.strokeStyle = Pn[3]; g.lineWidth = 4; g.stroke(); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(tx - 18, y - 16, 7, Math.PI * 0.5, Math.PI * 1.5); g.stroke(); box(g, tx - 14, y - 33, 26, 3, S[4]); }
    if (kind === 'dragon') { ballR(g, tx, y - 14, 16, Pn); ballR(g, tx + 20, y - 34, 10, Pn); polyF(g, [[tx - 14, y - 10], [tx - 40, y - 4], [tx - 16, y - 20]], Pn[2]); polyF(g, [[tx - 4, y - 26], [tx - 16, y - 50], [tx + 6, y - 28]], Pn[3]); box(g, tx + 24, y - 38, 2, 2, INK); box(g, tx - 10, y - 30, 22, 3, S[4]); box(g, tx + 14, y - 44, 12, 2, S[4]); }
  }
  // (the gate: two stone piers, a wrought-iron arch, its sign)
  const gx = Math.min(w - 120, 330), I = rampH(IRON, true);
  for (const px of [gx, gx + 96]) { box(g, px - 1, -hh - 41, 22, hh + 41, INK); box(g, px, -hh - 40, 20, hh + 40, St[3]); box(g, px, -hh - 40, 5, hh + 40, St[4]); box(g, px + 15, -hh - 40, 5, hh + 40, St[2]); for (let y = -hh - 34; y < 0; y += 10) box(g, px, y, 20, 1, St[1]); snowCap(g, px - 2, -hh - 40, 24, 5, px, S, true); ballR(g, px + 10, -hh - 52, 6, rampH(GOLD, true)); }
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(gx + 58, -hh - 20, 42, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  g.strokeStyle = I[3]; g.lineWidth = 3; g.stroke();
  for (let k = 0; k < 7; k++) { const x = gx + 24 + k * 10; box(g, x, -hh - 40 + Math.abs(k - 3) * 3, 2, hh + 40 - Math.abs(k - 3) * 3, I[2]); box(g, x, -hh - 40 + Math.abs(k - 3) * 3, 1, hh + 40, I[4]); }
  box(g, gx + 20, -hh + 10, 76, 2, I[3]); box(g, gx + 20, -20, 76, 2, I[3]);
  const L = gilt(1), sw = signW('THE FAIRY WHEEL', L) + 14;
  box(g, gx + 58 - sw / 2 - 1, -hh - 71, sw + 2, 15, INK); box(g, gx + 58 - sw / 2, -hh - 70, sw, 13, D('#5A1E4A')); box(g, gx + 58 - sw / 2, -hh - 70, sw, 1, D('#F49AC8'));
  signText(g, 'THE FAIRY WHEEL', gx + 58, -hh - 60, L);
};

const paintStation = (g: Ctx, f: Front) => {
  // HOGSMEAT STATION: red brick in courses, stone quoins and sills, tall arched windows glowing, the clock gable over
  // the middle (its face, its little cupola and weathervane), the name in gilt on its board, snow along every ledge;
  // the platform's iron canopy out front on fluted columns, its valance cut in a dagger fringe
  const { w, h } = f, B = rampH(BRICK, true), St = rampH(STONE, true), S = rampH(SNOW, true), I = rampH(IRON, true), Gd = rampH(GOLD, true);
  box(g, -1, -h - 1, w + 2, h + 1, INK);
  slab(g, 0, -h, w, h, B);
  for (let y = -h + 4, r = 0; y < 0; y += 5, r++) { box(g, 0, y, w, 1, B[1]); for (let x = (r % 2) * 6; x < w; x += 12) box(g, x, y - 4, 1, 4, B[2]); }
  for (const qx of [0, w - 10, w / 2 - 70, w / 2 + 60]) for (let y = -h; y < 0; y += 12) { box(g, qx, y, 10, 6, St[3]); box(g, qx, y, 10, 1, St[5]); box(g, qx + (y % 24 ? 0 : 2), y + 6, 8, 6, St[2]); }
  // (the windows: tall, arched, warm, stone sills with snow)
  for (let k = 0; k < 6; k++) {
    if (k === 2 || k === 3) continue;
    const wx = 30 + k * ((w - 60) / 6), wy = -h + 50, ww = 40, wh = 90;
    g.fillStyle = INK; g.beginPath(); g.arc(wx + ww / 2, wy + ww / 2, ww / 2 + 3, Math.PI, 0); g.fill(); box(g, wx - 3, wy + ww / 2, ww + 6, wh - ww / 2 + 2, INK);
    g.fillStyle = St[3]; g.beginPath(); g.arc(wx + ww / 2, wy + ww / 2, ww / 2 + 2, Math.PI, 0); g.fill();
    const G = warmGlass();
    g.save(); g.beginPath(); g.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); g.rect(wx, wy + ww / 2, ww, wh - ww / 2); g.clip();
    for (let i = 0; i < 5; i++) box(g, wx, wy + (wh * i) / 5, ww, wh / 5 + 1, G[5 - Math.min(4, i)]);
    for (let q = 1; q < 4; q++) box(g, wx + (ww * q) / 4 - 1, wy, 2, wh, I[2]);
    for (let q = 1; q < 5; q++) box(g, wx, wy + ww / 2 + q * 12, ww, 1, I[2]);
    // (people waiting inside: silhouettes on the bench)
    for (let q = 0; q < 3; q++) { const px = wx + 6 + q * 13; g.fillStyle = D('#3A2A2A'); g.beginPath(); g.arc(px, wy + wh - 22, 3, 0, Math.PI * 2); g.fill(); box(g, px - 3, wy + wh - 19, 7, 10, D('#3A2A2A')); }
    g.restore();
    box(g, wx - 5, wy + wh, ww + 10, 4, St[3]); box(g, wx - 5, wy + wh, ww + 10, 1, St[5]); snowCap(g, wx - 5, wy + wh, ww + 10, 3, k * 7, S, true);
  }
  // (the clock gable: stone, a round face with its hands at a quarter to something, a cupola, a weathervane owl)
  const cx = w / 2, gt = -h - 70;
  polyF(g, [[cx - 72, -h + 1], [cx - 72, gt + 30], [cx, gt - 8], [cx + 72, gt + 30], [cx + 72, -h + 1]], INK);
  polyF(g, [[cx - 70, -h], [cx - 70, gt + 31], [cx, gt - 6], [cx + 70, gt + 31], [cx + 70, -h]], St[3]);
  polyF(g, [[cx - 70, -h], [cx - 70, gt + 31], [cx, gt - 6], [cx - 40, -h]], St[4]);
  ballR(g, cx, gt + 46, 26, rampH(ramp6('#F4ECD8'), true));
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(cx, gt + 46, 26, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(g, cx + Math.cos(a) * 22 - 1, gt + 46 + Math.sin(a) * 22 - 1, 2, 2, INK); }
  g.lineWidth = 2; g.beginPath(); g.moveTo(cx, gt + 46); g.lineTo(cx - 12, gt + 40); g.moveTo(cx, gt + 46); g.lineTo(cx + 2, gt + 26); g.stroke();
  box(g, cx - 10, gt - 28, 20, 24, INK); box(g, cx - 9, gt - 27, 18, 22, St[4]); box(g, cx - 4, gt - 22, 8, 12, warmGlass()[3]);
  polyF(g, [[cx - 13, gt - 27], [cx, gt - 46], [cx + 13, gt - 27]], rampH(SLATE, true)[3]); polyF(g, [[cx - 13, gt - 27], [cx, gt - 46], [cx - 3, gt - 27]], S[4]);
  box(g, cx, gt - 62, 1, 16, I[3]); ballR(g, cx + 2, gt - 64, 3, Gd); polyF(g, [[cx - 8, gt - 58], [cx + 10, gt - 58], [cx + 10, gt - 56], [cx - 8, gt - 56]], I[3]);
  snowCap(g, cx - 72, gt + 30, 4, 3, 1, S, false);
  for (const [x0, y0, x1, y1] of [[cx - 72, gt + 30, cx, gt - 8], [cx, gt - 8, cx + 72, gt + 30]] as const) { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(x0, y0 - 2); g.lineTo(x1, y1 - 2); g.stroke(); g.strokeStyle = S[3]; g.lineWidth = 5; g.stroke(); g.strokeStyle = S[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0 - 4); g.lineTo(x1, y1 - 4); g.stroke(); }
  // (the parapet: a stone cornice, snow along it)
  box(g, -4, -h - 6, w + 8, 8, INK); box(g, -3, -h - 5, w + 6, 6, St[3]); box(g, -3, -h - 5, w + 6, 1, St[5]);
  snowCap(g, -4, -h - 6, w + 8, 5, 3, S, true);
  // (the name, on its board under the clock)
  const L = gilt(2), sw = signW('HOGSMEAT', L) + 24;
  box(g, cx - sw / 2 - 2, -h + 6, sw + 4, 26, INK); box(g, cx - sw / 2, -h + 8, sw, 22, D('#1E3A6E')); box(g, cx - sw / 2, -h + 8, sw, 2, D('#4A6AA0'));
  signText(g, 'HOGSMEAT', cx, -h + 26, L);
  // (the platform canopy: iron columns, a glazed roof, the dagger-cut valance; snow on the glass)
  const ct = -h + 120;
  for (let x = 20; x < w; x += 110) { postR(g, x, ct, 0, 6, I); box(g, x - 6, ct, 12, 4, I[4]); g.strokeStyle = I[3]; g.lineWidth = 2; g.beginPath(); g.arc(x + 18, ct + 2, 16, Math.PI, Math.PI * 1.5); g.stroke(); g.beginPath(); g.arc(x - 18, ct + 2, 16, Math.PI * 1.5, 0); g.stroke(); }
  box(g, -10, ct - 8, w + 20, 8, INK); box(g, -9, ct - 7, w + 18, 6, I[2]);
  for (let x = -9; x < w + 9; x += 8) { polyF(g, [[x, ct - 1], [x + 8, ct - 1], [x + 4, ct + 9]], D('#E8E0D0')); box(g, x + 3, ct, 2, 4, D('#FFFFFF')); }
  snowCap(g, -10, ct - 8, w + 20, 4, 9, S, true);
};

const PAINT: Record<Style, (g: Ctx, f: Front) => void> = { hog: paintHog, story: paintStory, ginger: paintGinger, park: paintPark, station: paintStation };

// ---------------------------------------------------------------------------------------------------------------
// The sides going back (live: they change as he walks)

const sides = (c: Ctx, v: View, f: Front) => {
  if (f.style === 'park') return;
  const eye = v.eye, x0 = X(f.x), x1 = x0 + f.w, top = GY - f.h, { rh, peak } = roofOf(f), lean = roofOf(f).lean;
  const wallR = rampH(ramp6(f.style === 'ginger' ? GINGER[3] : f.style === 'story' ? '#D8CCC0' : PLASTER[2]), true);
  const S = rampH(SNOW, true), T = rampH(TIMBER, true);
  // (the walls going back: stepped, a timber line or a band of icing along them)
  for (const [e, side] of [[x0, -1], [x1, 1]] as const) {
    if (!sideBack(c, eye, e, side, top + 2, GY, FRONT_D, BACK_D, wallR)) continue;
    const band = f.style === 'ginger' ? rampH(ICING, true)[3] : f.style === 'hog' ? T[2] : wallR[1];
    const [ax, ay] = at(eye, e, top + f.h * 0.45, FRONT_D), [bx, by] = at(eye, e, top + f.h * 0.45, BACK_D);
    c.strokeStyle = band; c.lineWidth = 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
    // (a little window down the side, warm)
    const [wx, wy] = at(eye, e, top + 24, (FRONT_D + BACK_D) / 2 + 0.02);
    if (f.h > 140) { box(c, wx - 1, wy, 3, 8, INK); box(c, wx - (side > 0 ? 0 : 1), wy + 1, 2, 6, warmGlass()[3]); }
  }
  // (the roof's slopes going back: snow, a slate edge under its lip), if the eye's on the slope's outer side
  const P = (x: number, y: number, d: number) => at(eye, x, y, d);
  const eaveL = X(f.x) - 10 + lean, eaveR = X(f.x) + f.w + 10 + lean, px = X(f.x) + peak, py = top - rh, ey = top;
  for (const [ex, sgn] of [[eaveL, -1], [eaveR, 1]] as const) {
    if (rh === 0) break;
    const cross = (px - ex) * (eye.y - ey) - (py - ey) * (eye.x - ex);
    if (cross * sgn < 0) continue;
    const q: [number, number][] = [P(ex, ey - 5, FRONT_D), P(px, py - 5, FRONT_D), P(px, py - 5, BACK_D), P(ex, ey - 5, BACK_D)];
    polyF(c, q, f.style === 'ginger' ? rampH(ICING, true)[2] : S[2]);
    const mid: [number, number][] = [P(ex, ey - 5, FRONT_D - 0.02), P(px, py - 5, FRONT_D - 0.02), P(px, py - 5, BACK_D), P(ex, ey - 5, BACK_D)];
    polyF(c, mid, f.style === 'ginger' ? rampH(ICING, true)[3] : S[3]);
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(...q[1]); c.lineTo(...q[2]); c.lineTo(...q[3]); c.stroke();
    // (the ridge's own snow, lit)
    c.strokeStyle = S[5]; c.beginPath(); c.moveTo(...P(px, py - 6, FRONT_D)); c.lineTo(...P(px, py - 6, BACK_D)); c.stroke();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The back alley (FRONT_D..BACK_D) and the pavement (the play plane back to FRONT_D)

const yAt = (v: View, d: number) => v.eye.y + (GY - v.eye.y) * d;
/** Where there's no pavement (the gorge, the tower's floor is its own): world x ranges. */
const NO_PAVE: [number, number][] = [];
export const setNoPave = (r: [number, number][]) => { NO_PAVE.length = 0; NO_PAVE.push(...r); };
/** The stretches (world x at the play plane, their edges running back to the eye) wide enough to fill the screen at
 *  depth d, less the gaps. */
const runs = (v: View, d: number): [number, number][] => {
  let segs: [number, number][] = [[v.eye.x - (v.eye.x - v.cam.x + 300) / d, v.eye.x + (v.cam.x + 1100 - v.eye.x) / d]];
  for (const [a, b] of NO_PAVE) segs = segs.flatMap(([s, e]) => (b <= s || a >= e ? [[s, e]] : [[s, Math.min(e, a)], [Math.max(s, b), e]].filter(([p, q]) => q > p) as [number, number][]));
  return segs;
};
const Q = (c: Ctx, v: View, a: number, b: number, d0: number, d1: number, col: string) => polyF(c, [at(v.eye, a, GY, d0), at(v.eye, b, GY, d0), at(v.eye, b, GY, d1), at(v.eye, a, GY, d1)], col);

export const drawAlley = (c: Ctx, v: View) => {
  const S = rampH(SNOW, true);
  for (const [a, b] of runs(v, BACK_D)) {
    for (let i = 0; i < 3; i++) { const d0 = FRONT_D - ((FRONT_D - BACK_D) * i) / 3, d1 = FRONT_D - ((FRONT_D - BACK_D) * (i + 1)) / 3; Q(c, v, a, b, d0, d1, S[2 - Math.min(2, i)]); }
    const [p0, y] = at(v.eye, a, GY, BACK_D), [p1] = at(v.eye, b, GY, BACK_D); checker(c, p0, Math.round(y), p1 - p0, 2, S[1], 0, 1);
  }
};

export const drawPavement = (c: Ctx, v: View) => {
  const F = rampH(FLAG), S = rampH(SNOW), K = rampH(STONE);
  const KERB = 0.985, BANK = FRONT_D + 0.018;
  for (const [a, b] of runs(v, FRONT_D)) {
    // (the kerb: granite, its lit edge; the flags in bands, darker going back; the snow banked along the fronts' feet)
    Q(c, v, a, b, 1, KERB, K[4]); Q(c, v, a, b, KERB, KERB - 0.004, K[2]);
    const bands = [F[4], F[3], F[3], F[2]];
    for (let i = 0; i < 4; i++) { const d0 = KERB - 0.004 - ((KERB - 0.004 - BANK) * i) / 4, d1 = KERB - 0.004 - ((KERB - 0.004 - BANK) * (i + 1)) / 4; Q(c, v, a, b, d0, d1, bands[i]); }
    Q(c, v, a, b, BANK, FRONT_D, S[3]);
    const yb = Math.round(yAt(v, BANK));
    for (let x = Math.floor(a / 9) * 9; x < b - 9; x += 9) { const t = hash(x * 0.37), [sx] = at(v.eye, x, GY, BANK), [ex] = at(v.eye, x + 9, GY, BANK); box(c, sx, yb - 2 - Math.floor(t * 3), ex - sx, 3 + Math.floor(t * 3), S[t > 0.5 ? 4 : 3]); if (t > 0.8) box(c, sx + 2, yb - 4, 3, 1, S[5]); }
    // (the joints: across between the bands, and running back toward the eye every slab)
    c.strokeStyle = F[1]; c.lineWidth = 1; c.beginPath();
    for (let x = Math.ceil(a / 46) * 46; x < b; x += 46) { const [p0, q0] = at(v.eye, x, GY, KERB - 0.004), [p1, q1] = at(v.eye, x, GY, BANK); c.moveTo(p0, q0); c.lineTo(p1, q1); }
    for (const d of [0.96, 0.935, 0.91]) { const [p0, y] = at(v.eye, a, GY, d), [p1] = at(v.eye, b, GY, d); c.moveTo(p0, Math.round(y) + 0.5); c.lineTo(p1, Math.round(y) + 0.5); }
    c.stroke();
    // (worn spots and slush in the joints)
    for (let x = Math.floor(a / 13) * 13; x < b; x += 13) { const t = hash(x * 0.71), d = BANK + 0.01 + t * (KERB - BANK - 0.02), [sx, sy] = at(v.eye, x, GY, d); if (t > 0.55) box(c, sx, sy, 3, 1, t > 0.8 ? S[4] : F[5]); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The street's furniture (on the pavement at PROP_D)

const PROP_D = 0.93;
type PropKind = 'lamp' | 'bench' | 'snowman' | 'postbox' | 'barrels' | 'tree' | 'brooms' | 'cauldron';
/** [x from the section's start, what]. Lamp posts every so often; the rest where there's room for them. */
export const PROPS: [number, PropKind][] = [
  [420, 'lamp'], [980, 'barrels'], [1250, 'lamp'], [1560, 'bench'], [1980, 'lamp'], [2560, 'postbox'], [2780, 'lamp'], [3150, 'brooms'], [3500, 'lamp'],
  [4250, 'snowman'], [4500, 'lamp'], [4950, 'tree'], [5250, 'lamp'], [6050, 'bench'], [6380, 'lamp'],
  [8100, 'lamp'], [8480, 'cauldron'], [8900, 'lamp'], [9700, 'snowman'], [10050, 'lamp'], [10480, 'bench'],
  [12450, 'lamp'], [12900, 'barrels'], [13250, 'lamp'], [13600, 'snowman'], [14100, 'tree'],
];
const paintProp = (g: Ctx, kind: PropKind, s: number) => {
  const I = rampH(IRON), S = rampH(SNOW), T = rampH(TIMBER), Gd = rampH(GOLD);
  if (kind === 'lamp') {
    // (a fluted iron post on a stepped base, a scrolled arm, the lantern (lit after dark), snow on its cap)
    box(g, -8, -8, 16, 8, INK); box(g, -7, -7, 14, 7, I[3]); box(g, -7, -7, 14, 1, I[5]);
    postR(g, 0, -118, -8, 6, I);
    for (let y = -110; y < -12; y += 24) { box(g, -5, y, 10, 3, I[2]); box(g, -5, y, 10, 1, I[4]); }
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -112); g.quadraticCurveTo(10, -122, 4, -130); g.stroke(); g.strokeStyle = I[4]; g.lineWidth = 1; g.stroke();
    box(g, -9, -150, 18, 22, INK); box(g, -8, -149, 16, 20, lit() ? '#FFE9A8' : hour('#E8D8A8')); box(g, -8, -149, 5, 20, lit() ? '#FFFFFF' : hour('#FFF4D8'));
    box(g, -1, -149, 2, 20, I[2]); box(g, -10, -152, 20, 3, I[3]); polyF(g, [[-8, -152], [0, -160], [8, -152]], I[2]); ballR(g, 0, -162, 2, Gd);
    box(g, -10, -130, 20, 3, I[3]);
    snowCap(g, -8, -152, 16, 3, s, S, false);
  } else if (kind === 'bench') {
    // (a park bench: iron ends, oak slats, a cushion of snow)
    for (const x of [-26, 20]) { box(g, x - 1, -24, 8, 24, INK); box(g, x, -23, 6, 23, I[3]); box(g, x, -23, 2, 23, I[4]); }
    for (let k = 0; k < 3; k++) { box(g, -30, -16 + k * 4 - 12, 60, 3, INK); box(g, -29, -15 + k * 4 - 12, 58, 2, T[4 - k]); }
    box(g, -30, -14, 60, 4, INK); box(g, -29, -13, 58, 3, T[3]);
    snowCap(g, -30, -15, 60, 4, s, S, true); snowCap(g, -30, -28, 60, 3, s + 1, S, false);
  } else if (kind === 'snowman') {
    // (three balls, coal eyes, a carrot, a wizard's hat and a striped scarf somebody's left on him; stick arms)
    const W = ramp6('#EEF2FC').map(c => hour(c));
    ballR(g, 0, -14, 15, W); ballR(g, 0, -38, 11, W); ballR(g, 0, -56, 8, W);
    box(g, -3, -59, 2, 2, INK); box(g, 2, -59, 2, 2, INK); polyF(g, [[0, -56], [10, -54], [0, -53]], hour('#F97316'));
    for (let k = 0; k < 3; k++) box(g, -1, -42 + k * 6, 2, 2, INK);
    for (let k = 0; k < 4; k++) box(g, -9 + k * 5, -48, 5, 4, hour(k % 2 ? '#E0AE3A' : '#9B1C1C')); box(g, 5, -46, 4, 10, hour('#9B1C1C'));
    polyF(g, [[-11, -62], [11, -62], [3, -84], [-2, -76]], INK); polyF(g, [[-10, -63], [10, -63], [3, -82], [-2, -75]], hour('#2A2440')); box(g, -11, -64, 22, 3, hour('#3A3456'));
    g.strokeStyle = hour('#5E3E2A'); g.lineWidth = 2; g.beginPath(); g.moveTo(-10, -40); g.lineTo(-24, -50); g.moveTo(10, -40); g.lineTo(22, -54); g.lineTo(26, -52); g.stroke();
  } else if (kind === 'postbox') {
    // (the OWL POST box: a red pillar, a gilt owl on its cap, its slot)
    const R = rampH(ramp6('#B91C1C'));
    box(g, -12, -62, 24, 62, INK); box(g, -11, -61, 22, 61, R[3]); box(g, -11, -61, 6, 61, R[4]); box(g, 4, -61, 7, 61, R[2]);
    polyF(g, [[-14, -60], [0, -72], [14, -60]], INK); polyF(g, [[-13, -61], [0, -71], [13, -61]], R[3]); box(g, -14, -62, 28, 3, R[1]);
    box(g, -7, -50, 14, 3, INK); box(g, -8, -40, 16, 10, Gd[3]); signText(g, 'OWL', 0, -32, { sx: 1, sy: 1, fill: INK });
    ballR(g, 0, -77, 5, Gd); box(g, -2, -79, 1, 1, INK); box(g, 1, -79, 1, 1, INK);
    box(g, -12, -4, 24, 4, R[1]); snowCap(g, -13, -61, 26, 3, s, S, false);
  } else if (kind === 'barrels') {
    // (BUTTER BREW barrels, stacked, their hoops, a crate)
    for (const [bx, by] of [[-20, 0], [4, 0], [-8, -26]] as const) { box(g, bx - 1, by - 27, 24, 27, INK); box(g, bx, by - 26, 22, 26, T[4]); box(g, bx, by - 26, 5, 26, T[5]); box(g, bx + 16, by - 26, 6, 26, T[2]); for (const hy of [by - 22, by - 6]) { box(g, bx, hy, 22, 2, I[3]); box(g, bx, hy, 22, 1, I[5]); } box(g, bx + 6, by - 17, 10, 6, hour('#F4E8C8')); }
    snowCap(g, -9, -52, 24, 3, s, S, false);
  } else if (kind === 'tree') {
    // (the square's Christmas tree: tiered pine, baubles, a garland, a gold star, snow on its boughs)
    const P = rampH(PINE);
    box(g, -5, -14, 10, 14, T[3]);
    for (let k = 0; k < 5; k++) { const y = -24 - k * 22, half = 46 - k * 8; polyF(g, [[-half - 1, y + 2], [0, y - 30], [half + 1, y + 2]], INK); polyF(g, [[-half, y], [0, y - 28], [half, y]], P[3]); polyF(g, [[-half, y], [0, y - 28], [-half * 0.25, y]], P[4]); for (let x = -half + 4; x < half; x += 9) box(g, x, y - 2, 6, 3, S[4]); }
    const B = ['#E8344A', '#F2C84A', '#60A5FA', '#F472B6'];
    for (let i = 0; i < 22; i++) { const t = hash(s + i * 1.7), y = -30 - t * 100, half = 44 - (t * 100 / 22) * 8; ballR(g, (hash(s + i * 2.3) - 0.5) * half * 1.4, y, 2.5, ramp6(lit() && i % 2 ? '#FFF4C8' : hour(B[i % 4])), true); }
    polyF(g, [[0, -150], [4, -140], [14, -140], [6, -134], [9, -124], [0, -130], [-9, -124], [-6, -134], [-14, -140], [-4, -140]], Gd[4]);
  } else if (kind === 'brooms') {
    // (a broom rack: FOR HIRE, three brooms leant in it)
    box(g, -26, -40, 52, 4, INK); box(g, -25, -39, 50, 2, T[4]);
    for (const x of [-24, 22]) { box(g, x - 1, -42, 5, 42, INK); box(g, x, -41, 3, 41, T[3]); }
    for (let k = 0; k < 3; k++) { const x = -14 + k * 14; g.strokeStyle = T[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 4, -66); g.lineTo(x + 2, -10); g.stroke(); polyF(g, [[x - 3, -14], [x + 7, -14], [x + 9, 0], [x - 5, 0]], hour('#C8A050')); box(g, x - 3, -14, 10, 2, hour('#8A3A2A')); }
    snowCap(g, -26, -40, 52, 3, s, S, false);
  } else {
    // (a cauldron on its iron tripod, something pink bubbling in it)
    for (const [x0, x1] of [[-16, -4], [16, 4], [0, 0]] as const) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x1, -40); g.stroke(); }
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -26, 17, 14, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = I[2]; g.beginPath(); g.ellipse(0, -26, 15, 12, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = I[4]; g.beginPath(); g.ellipse(-5, -30, 5, 4, 0, 0, Math.PI * 2); g.fill();
    box(g, -16, -38, 32, 4, INK); box(g, -15, -38, 30, 2, hour('#F49AC8')); box(g, -6, -38, 3, 1, hour('#FFE0F0'));
    for (let k = -8; k < 10; k += 6) { box(g, k, -8, 4, 4, '#F97316'); box(g, k + 1, -11, 2, 3, '#FDE047'); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Putting it all down

interface Piece { x0: number; x1: number; draw: () => void; f: Front }
export const drawFronts = (c: Ctx, v: View) => {
  const eye = v.eye, pieces: Piece[] = [];
  for (const f of FRONTS) {
    const x0 = X(f.x), x1 = x0 + f.w;
    if (!seen(v, x0 - 80, x1 + 80, FRONT_D, 140)) continue;
    const top = f.h + roofOf(f).rh + (f.style === 'station' ? 150 : 80);
    pieces.push({ x0, x1, f, draw: () => stillAt(c, v, FRONT_D, `sqfront-${f.x}-${f.style}`, x0, GY, -40, -top, f.w + 80, top + 4, g => PAINT[f.style](g, f)) });
  }
  // (the farthest from the eye first: nearer fronts over farther ones' sides)
  pieces.sort((p, q) => Math.abs((q.x0 + q.x1) / 2 - eye.x) - Math.abs((p.x0 + p.x1) / 2 - eye.x));
  for (const p of pieces) { sides(c, v, p.f); p.draw(); }
};

export const drawProps = (c: Ctx, v: View) => {
  for (const [rx, kind] of PROPS) {
    const x = X(rx);
    if (!seen(v, x - 60, x + 60, PROP_D, 80)) continue;
    stillAt(c, v, PROP_D, `sqprop-${kind}-${rx}`, x, GY, -60, -170, 120, 174, g => paintProp(g, kind, rx));
  }
};

/** The lamps after dark: the lamp posts' lanterns, the fronts' door lanterns (where they're drawn now). */
export const frontLamps = (state: GameState, v: View): Light[] => {
  const out: Light[] = [];
  if (timeOfDay().lamps < 0.05) return out;
  for (const [rx, kind] of PROPS) if (kind === 'lamp') { const [x, y] = at(v.eye, X(rx), GY - 140, PROP_D); if (x > state.camera.x - 200 && x < state.camera.x + 1000) out.push({ x, y, r: 130, a: 0.55, color: '#FFD08A' }); }
  for (const f of FRONTS) if (f.style === 'hog' || f.style === 'story') { const [x, y] = at(v.eye, X(f.x) + f.w / 2, GY - 50, FRONT_D); if (x > state.camera.x - 200 && x < state.camera.x + 1000) out.push({ x, y, r: 90, a: 0.4, color: '#FFC070' }); }
  return out;
};
