// Sillyville Square's fronts (back from the play plane at FRONT_D: dimmed a step toward the air, none of them to stand
// on), with real sides going back to BACK_D drawn the cartoon way (a bulging wall bulges all the way back: walk past an
// end and there's its curvy side, darker going back), the garden alley behind them, the candy pavement going back to
// them, and the street's furniture on it:
//
//   THE FRONTS   Seuss Landing's: no straight lines. Bulging, leaning walls in pastel plaster (candy spirals on some,
//                polka dots or scalloped bands on others), a shop on the ground floor (a round-topped door with its
//                OPEN card, a fat bay of a window glowing warm with what it sells (toys, hats, gumdrops, books, fudge,
//                pretzels, kites, balloons), a scalloped candy-striped awning), round windows up the floors in a
//                wiggle (frames, shutters, flower boxes), the shop's name on a cloud of a board on a curly bracket, a
//                roof that droops, flops, stacks or corkscrews (onion domes, floppy cones with pom-poms, stacked balls,
//                cake tiers, corkscrew spires, a toadstool cap), curly chimneys.
//   THE PAVEMENT candy tiles in bands coming toward him, their joints running back to the eye; a flower bed along the
//                fronts' feet.
//   THE STREET   Truffula trees (shaggy tufts on striped trunks), curly lamp posts (lit after dark), curly benches, the
//                balloon man's post (a bunch tied to it; the revisit: popped, the skins dangling), a popcorn cart, a
//                hippo of a trash can (FEED ME), planters, topiary.
//
// The revisit (the rides shut for the day): the shops' cards say CLOSED, the balloons are popped.

import type { Light } from '../../../m1/game/render/lighting';
import { signText, signW } from '../../signLetters';
import { timeOfDay } from '../../timeOfDay';
import {
  type Ctx, type View, INK, box, mix, hash, checker, at, stillAt, seen, polyF, sideBack, ramp6, rampH, dimmed, lit, toonLetters,
  FRONT_D, BACK_D, GRASS, FROSTING, LICORICE, BRASS, candyStroke, eggR, ballR,
} from '../kit';
import { GY } from '../geometry';
import { X, PITS, STUDIO, SHOP, HATTERY, CAROUSEL } from './layout';

type Roof = 'onion' | 'flop' | 'balls' | 'cake' | 'cork' | 'toad';
type Goods = 'toys' | 'hats' | 'gumdrops' | 'books' | 'fudge' | 'pretzels' | 'kites' | 'balloons' | 'socks' | 'gifts';
type Skin = 'plain' | 'spiral' | 'dots' | 'scallop';
interface Front { x: number; w: number; h: number; bulge: number; lean: number; roof: Roof; skin: Skin; seed: number; goods: Goods; name: string | null }

const NAMES: [string, Goods][] = [['THE TOY BOX', 'toys'], ['SILLY HATS', 'hats'], ['GUMDROP GULCH', 'gumdrops'], ['BOOK NOOK', 'books'], ['FUDGE-O-RAMA', 'fudge'], ['PRETZEL PALACE', 'pretzels'], ['KITE & SEEK', 'kites'], ['POP! BALLOONS', 'balloons'], ['ODD SOCKS', 'socks'], ['GIFTS GALORE', 'gifts'], ['WHATSIT SHOP', 'toys'], ['CANDY CORNER', 'gumdrops']];
const ROOFS: Roof[] = ['onion', 'flop', 'balls', 'cake', 'onion', 'cork', 'flop', 'toad', 'cake', 'balls', 'onion'];
const SKINS: Skin[] = ['plain', 'spiral', 'dots', 'scallop', 'plain', 'spiral'];
/** Where the fronts run (x from the section's start): all along, up to the studio's own front. */
const AREA: [number, number] = [-560, STUDIO.a - 140];

export const FRONTS: Front[] = (() => {
  const out: Front[] = [];
  let x = AREA[0], i = 0;
  while (x < AREA[1] - 100) {
    const seed = i * 13 + 5, w = Math.min(AREA[1] - x, 120 + Math.floor(hash(seed) * 90));
    const [name, goods] = NAMES[Math.floor(hash(seed * 5) * NAMES.length)];
    if (w > 100) out.push({
      x, w, h: 150 + Math.floor(hash(seed * 3) * 110), bulge: 6 + Math.round(hash(seed * 7) * 8), lean: Math.round((hash(seed * 11) - 0.5) * 22),
      roof: ROOFS[Math.floor(hash(seed * 2.3) * ROOFS.length)], skin: SKINS[Math.floor(hash(seed * 4.1) * SKINS.length)], seed, goods, name: hash(seed * 1.7) > 0.25 ? name : null,
    });
    x += w + 18 + Math.floor(hash(seed * 9) * 22); i++;
  }
  return out;
})();
const WALLS = ['#F8C8DC', '#FCE69A', '#BEDCF6', '#C2ECCE', '#DCCCF6', '#FCD2B0', '#F4F0E4'];
const ROOFC = ['#E2465E', '#7C5CC8', '#24A69C', '#F2822A', '#3E76DE', '#D8408A', '#E8B020'];
const wallOf = (f: Front) => WALLS[f.seed % WALLS.length];
const roofOf = (f: Front) => ROOFC[(f.seed * 3 + 1) % ROOFC.length];
/** The front's outline's edge at height t (0 foot..1 top), out from its foot corner (+ outward): the same curve the
 *  front's own outline takes (paintFront's quadratics), so the side meets it all the way up. */
const bowL = (f: Front) => (t: number) => 2 * t * (1 - t) * (2 * f.bulge - f.lean * 0.5) - t * t * f.lean;
const bowR = (f: Front) => (t: number) => 2 * t * (1 - t) * (2 * f.bulge + f.lean * 0.5) + t * t * f.lean;

// ---------------------------------------------------------------------------------------------------------------
// What's in the windows (painted inside a glowing pane: x, y its top left, w, h)

type Paint = (g: Ctx, x: number, y: number, w: number, h: number, s: number) => void;
const D = (c: string) => dimmed(c);
const GOODS: Record<Goods, Paint> = {
  toys: (g, x, y, w, h) => { box(g, x, y + h - 3, w, 2, D('#8A5A3A')); for (let k = 0; k < Math.floor(w / 13); k++) { const cx = x + 6 + k * 13, f = y + h - 3; if (k % 3 === 0) { box(g, cx - 4, f - 10, 9, 10, D(['#E2465E', '#3E76DE', '#F2C84A'][k % 3])); box(g, cx - 4, f - 10, 9, 2, D('#FFFFFF')); signText(g, 'ABC'[k % 3], cx, f - 2, { sx: 1, sy: 1, fill: D('#FFFFFF') }); } else if (k % 3 === 1) { ballR(g, cx, f - 6, 5, ramp6(D('#B07A48')), false); ballR(g, cx, f - 13, 4, ramp6(D('#B07A48')), false); box(g, cx - 4, f - 17, 2, 2, D('#B07A48')); box(g, cx + 3, f - 17, 2, 2, D('#B07A48')); } else { box(g, cx - 1, f - 16, 2, 16, D('#F4F0E8')); g.fillStyle = D(['#5EC46A', '#E2465E'][k % 2]); g.beginPath(); g.moveTo(cx, f - 16); g.lineTo(cx + 7, f - 13); g.lineTo(cx, f - 10); g.closePath(); g.fill(); } } },
  hats: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 15); k++) { const cx = x + 8 + k * 15, f = y + h - 2 - (k % 2) * 10; box(g, cx - 1, f, 2, y + h - f, D('#6A5A4A')); box(g, cx - 7, f - 2, 14, 2, D(['#5A2A8A', '#1A1A2A', '#C8283E', '#2AA69C'][k % 4])); box(g, cx - 4, f - 12, 8, 10, D(['#5A2A8A', '#1A1A2A', '#C8283E', '#2AA69C'][k % 4])); for (let s = 0; s < 3; s++) box(g, cx - 4, f - 11 + s * 4, 8, 1, D('#F4F0F4')); } },
  gumdrops: (g, x, y, w, h) => { for (const sy of [y + h * 0.5, y + h - 2]) { box(g, x, sy, w, 2, D('#8A5A3A')); for (let k = 0; k < Math.floor(w / 10); k++) { const jx = x + 2 + k * 10; box(g, jx, sy - 11, 8, 11, D('#D8ECF8')); g.fillStyle = D(['#F472B6', '#FDE047', '#60A5FA', '#4ADE80', '#F97316'][(k + Math.round(sy)) % 5]); g.beginPath(); g.ellipse(jx + 4, sy - 4, 3, 3, 0, Math.PI, 0); g.fill(); g.fillRect(jx + 1, sy - 4, 6, 3); box(g, jx + 2, sy - 13, 4, 2, D('#E2465E')); box(g, jx + 1, sy - 10, 1, 8, D('#FFFFFF')); } } },
  books: (g, x, y, w, h) => { for (const sy of [y + h * 0.48, y + h - 2]) { box(g, x, sy, w, 2, D('#7A4A2A')); let bx = x + 1; let k = 0; while (bx < x + w - 3) { const bw = 3 + (k % 3), bh = 9 + (k * 5) % 6; box(g, bx, sy - bh, bw, bh, D(['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A', '#8A3AB0'][k % 5])); box(g, bx, sy - bh + 2, bw, 1, D('#F4E8C8')); bx += bw + 1; k++; } } },
  fudge: (g, x, y, w, h) => { box(g, x, y + h - 3, w, 2, D('#8A5A3A')); for (let k = 0; k < Math.floor(w / 14); k++) { const cx = x + 2 + k * 14; for (let r = 0; r < 2; r++) { box(g, cx, y + h - 9 - r * 6, 11, 5, D(['#6A3A1E', '#8A5A30', '#F4E0C8'][(k + r) % 3])); box(g, cx, y + h - 9 - r * 6, 11, 1, D('#B88A5A')); } } box(g, x + 2, y + 3, w - 4, 7, D('#FFF4E0')); signText(g, '$1 LB', x + w / 2, y + 9, { sx: 1, sy: 1, fill: D('#8A3A1A') }); },
  pretzels: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 16); k++) { const cx = x + 8 + k * 16, cy = y + h * 0.4 + (k % 2) * 10; g.strokeStyle = D('#A8642E'); g.lineWidth = 2.5; g.beginPath(); g.arc(cx - 3, cy, 4, 0, Math.PI * 2); g.arc(cx + 3, cy, 4, Math.PI, Math.PI * 3); g.stroke(); box(g, cx - 1, cy - 2, 1, 1, D('#FFFFFF')); box(g, cx + 2, cy + 1, 1, 1, D('#FFFFFF')); } },
  kites: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 18); k++) { const cx = x + 9 + k * 18, cy = y + 8 + (k % 2) * 8; g.fillStyle = D(['#E2465E', '#3E76DE', '#F2C84A', '#5EC46A'][k % 4]); g.beginPath(); g.moveTo(cx, cy - 7); g.lineTo(cx + 6, cy); g.lineTo(cx, cy + 7); g.lineTo(cx - 6, cy); g.closePath(); g.fill(); box(g, cx - 1, cy - 6, 1, 13, D('#FFFFFF')); for (let s = 0; s < 3; s++) box(g, cx + (s % 2 ? 1 : -1), cy + 9 + s * 4, 2, 2, D('#F472B6')); } },
  balloons: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 9); k++) { const cx = x + 5 + k * 9, cy = y + 6 + (k % 3) * 5; box(g, cx, cy + 6, 1, y + h - cy - 6, D('#E8E4F0')); eggR(g, cx, cy, 4, 5, ramp6(D(['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#EC4899'][k % 5])), false); } },
  socks: (g, x, y, w, h) => { box(g, x + 2, y + 4, w - 4, 1, D('#6A5A4A')); for (let k = 0; k < Math.floor(w / 10); k++) { const cx = x + 4 + k * 10, col = D(['#E2465E', '#5EC46A', '#3E76DE', '#F2C84A', '#8A3AB0'][k % 5]); box(g, cx, y + 5, 5, 14, col); box(g, cx, y + 16, 8, 4, col); for (let s = 0; s < 3; s++) box(g, cx, y + 7 + s * 4, 5, 1, D('#FFFFFF')); } },
  gifts: (g, x, y, w, h) => { for (let k = 0; k < Math.floor(w / 14); k++) { const cx = x + 2 + k * 14, bh = 8 + (k % 3) * 4, col = D(['#E2465E', '#3E76DE', '#F2C84A', '#5EC46A'][k % 4]); box(g, cx, y + h - bh - 2, 12, bh, col); box(g, cx + 5, y + h - bh - 2, 2, bh, D('#FFFFFF')); box(g, cx, y + h - bh + 2, 12, 2, D('#FFFFFF')); box(g, cx + 3, y + h - bh - 5, 6, 3, D('#FFFFFF')); } },
};

/** A big round-topped shop window glowing (warm inside after dark, bright by day), the goods in it, mullions. */
const shopWindow = (g: Ctx, x: number, y: number, w: number, h: number, goods: Goods, s: number) => {
  const G = rampH(['#4A2A1A', '#8A4A1A', '#D08A30', '#F6C46A', '#FFE4A8', '#FFF8E0'], true);
  const path = () => { g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); };
  g.save(); g.beginPath(); path(); g.clip();
  for (let i = 0; i < 4; i++) box(g, x, y + (h * i) / 4, w, Math.ceil(h / 4) + 1, G[4 - i]);
  checker(g, x, y + h / 4 - 1, w, 2, G[3], 0, 1); checker(g, x, y + h / 2 - 1, w, 2, G[2], 1, 1);
  GOODS[goods](g, x + 2, y + w * 0.32, w - 4, h - w * 0.32 - 2, s);
  const M = D('#5A3A5A');
  box(g, x + w / 2 - 1, y, 2, h, M); box(g, x, y + w * 0.45, w, 2, M);
  g.strokeStyle = M; g.lineWidth = 2; g.beginPath(); g.arc(x + w / 2, y + w / 2, w / 2 - 6, Math.PI, 0); g.stroke();
  box(g, x + 3, y + w * 0.3, 2, h * 0.5, G[5]);
  g.restore();
  g.beginPath(); path(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  // (the sill: frosting piped along it)
  const F = rampH(FROSTING, true);
  box(g, x - 4, y + h, w + 8, 5, INK); box(g, x - 3, y + h + 1, w + 6, 3, F[3]); box(g, x - 3, y + h + 1, w + 6, 1, F[5]);
};
/** A round window, framed (lit warm after dark), shutters on some, a flower box on some. */
const roundWin = (g: Ctx, x: number, y: number, r: number, s: number) => {
  const on = lit() && hash(s * 1.3) > 0.3, F = rampH(FROSTING, true);
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 3, 0, Math.PI * 2); g.fill();
  g.fillStyle = F[3]; g.beginPath(); g.arc(x, y, r + 2, 0, Math.PI * 2); g.fill();
  g.fillStyle = F[1]; g.beginPath(); g.arc(x + 1, y + 1, r + 0.5, 0, Math.PI * 2); g.fill();
  const G = on ? ['#C8782A', '#F6B858', '#FFE29A'] : [D('#3E6A9A'), D('#6A9ACA'), D('#B8DAF2')];
  g.fillStyle = G[0]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = G[1]; g.beginPath(); g.arc(x - 1, y - 1, r - 1.5, 0, Math.PI * 2); g.fill();
  box(g, x - r * 0.5, y - r * 0.55, 2, 3, G[2]); box(g, x - r * 0.2, y - r * 0.7, 2, 2, G[2]);
  box(g, x - 0.5, y - r, 1, r * 2, D('#5A3A5A')); box(g, x - r, y - 0.5, r * 2, 1, D('#5A3A5A'));
  if (s % 4 === 1) { const C = rampH(ramp6(['#2AA69C', '#E2465E', '#7C5CC8'][s % 3]), true); for (const sx of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.ellipse(x + sx * (r + 6), y, 5, r + 1, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = C[3]; g.beginPath(); g.ellipse(x + sx * (r + 6), y, 4, r, 0, 0, Math.PI * 2); g.fill(); for (let k = -r + 3; k < r - 2; k += 4) box(g, x + sx * (r + 6) - 3, y + k, 6, 1, C[2]); } }
  if (s % 3 === 0) { box(g, x - r - 3, y + r + 1, r * 2 + 6, 5, INK); box(g, x - r - 2, y + r + 2, r * 2 + 4, 3, D('#A8642E')); for (let k = 0; k < 5; k++) { box(g, x - r + k * (r / 2.2), y + r - 2 - (k % 2) * 2, 3, 3, D(['#F472B6', '#FDE047', '#FFFFFF', '#C084FC', '#FB923C'][k])); box(g, x - r + k * (r / 2.2), y + r + 1, 3, 1, D('#3E8A4A')); } }
};
/** The scalloped candy-striped awning over a window (its stripes lit and shaded, the scallops' shade under them). */
const awning = (g: Ctx, x: number, y: number, w: number, col: string, s: number) => {
  const A = rampH(ramp6(col), true), Wt = rampH(FROSTING, true), n = Math.max(3, Math.round(w / 14)), sw = w / n;
  polyF(g, [[x - 5, y + 16], [x + 4, y - 2], [x + w - 4, y - 2], [x + w + 5, y + 16]], INK);
  for (let k = 0; k < n; k++) { const x0 = x - 4 + k * ((w + 8) / n), x1 = x0 + (w + 8) / n, R = k % 2 ? Wt : A; polyF(g, [[x0, y + 15], [x + 4 + k * ((w - 8) / n), y], [x + 4 + (k + 1) * ((w - 8) / n), y], [x1, y + 15]], R[3]); polyF(g, [[x0, y + 15], [x + 4 + k * ((w - 8) / n), y], [x + 6 + k * ((w - 8) / n), y], [x0 + 3, y + 15]], R[4]); }
  for (let k = 0; k < n + 1; k++) { const cx = x - 4 + (k + 0.5) * ((w + 8) / (n + 1)), R = k % 2 ? Wt : A; g.fillStyle = INK; g.beginPath(); g.arc(cx, y + 15, sw / 2 + 2, 0, Math.PI); g.fill(); g.fillStyle = R[2]; g.beginPath(); g.arc(cx, y + 15, sw / 2, 0, Math.PI); g.fill(); g.fillStyle = R[3]; g.beginPath(); g.arc(cx - 1, y + 15, sw / 2 - 2, 0, Math.PI * 0.6); g.fill(); }
  box(g, x - 4, y + 15, w + 8, 1, A[1]);
  void s;
};
/** A round-topped door: planks, a porthole, the OPEN card (or CLOSED, the revisit), a step. */
const door = (g: Ctx, x: number, foot: number, w: number, h: number, col: string, closed: boolean) => {
  const T = rampH(ramp6(col), true), F = rampH(FROSTING, true);
  box(g, x - 4, foot - 4, w + 8, 4, F[2]); box(g, x - 4, foot - 4, w + 8, 1, F[4]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 2, foot - 3); g.lineTo(x - 2, foot - h + w / 2); g.arc(x + w / 2, foot - h + w / 2, w / 2 + 2, Math.PI, 0); g.lineTo(x + w + 2, foot - 3); g.closePath(); g.fill();
  g.fillStyle = T[3]; g.beginPath(); g.moveTo(x, foot - 4); g.lineTo(x, foot - h + w / 2); g.arc(x + w / 2, foot - h + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, foot - 4); g.closePath(); g.fill();
  for (let k = 4; k < w - 2; k += 5) box(g, x + k, foot - h + 6, 1, h - 10, T[2]);
  box(g, x, foot - h + w / 2, 2, h - w / 2 - 4, T[4]); box(g, x + w - 3, foot - h + w / 2, 3, h - w / 2 - 4, T[1]);
  g.fillStyle = INK; g.beginPath(); g.arc(x + w / 2, foot - h + w / 2 + 2, 5, 0, Math.PI * 2); g.fill();
  g.fillStyle = lit() ? '#FFD88A' : D('#9ACAEA'); g.beginPath(); g.arc(x + w / 2, foot - h + w / 2 + 2, 3.5, 0, Math.PI * 2); g.fill();
  box(g, x + w - 6, foot - h * 0.45, 3, 3, rampH(BRASS, true)[4]);
  // (the card on its string)
  const cy = foot - h * 0.62;
  g.strokeStyle = D('#3A2A3A'); g.lineWidth = 1; g.beginPath(); g.moveTo(x + w / 2 - 6, cy); g.lineTo(x + w / 2, cy - 6); g.lineTo(x + w / 2 + 6, cy); g.stroke();
  const cw = closed ? 34 : 24;
  box(g, x + w / 2 - cw / 2 - 1, cy, cw + 2, 9, INK); box(g, x + w / 2 - cw / 2, cy + 1, cw, 7, closed ? D('#C8283E') : D('#F4F0E4'));
  signText(g, closed ? 'CLOSED' : 'OPEN', x + w / 2, cy + 7, { sx: 1, sy: 1, fill: closed ? D('#FFFFFF') : D('#2E8A4A') });
};
/** The shop's name: a cloud of a board out on a curly bracket off the wall. */
const nameBoard = (g: Ctx, cx: number, y: number, name: string, col: string) => {
  const L = toonLetters(1, [D('#FFFFFF'), D('#FFFFFF'), D('#FDF2F8'), D('#F9A8D4')]), w = Math.round(signW(name, L) + 18), B = rampH(ramp6(col), true);
  g.fillStyle = INK; g.beginPath(); g.roundRect(cx - w / 2 - 2, y - 2, w + 4, 18, 8); g.fill();
  g.fillStyle = B[3]; g.beginPath(); g.roundRect(cx - w / 2, y, w, 14, 7); g.fill();
  box(g, cx - w / 2 + 4, y + 1, w - 8, 2, B[4]); box(g, cx - w / 2 + 4, y + 11, w - 8, 2, B[2]);
  for (let k = 0; k < 4; k++) { g.fillStyle = B[3]; g.beginPath(); g.arc(cx - w / 2 + 6 + k * ((w - 12) / 3), y, 4, Math.PI, 0); g.fill(); }
  signText(g, name, cx, y + 11, L);
};

/** A front's roof, painted over its top at (cx, top), w across. */
const roof = (g: Ctx, f: Front, cx: number, top: number, w: number) => {
  const R = rampH(ramp6(roofOf(f)), true), W2 = rampH(FROSTING, true);
  const flip = f.seed % 2 ? 1 : -1;
  if (f.roof === 'onion') {
    const dome = (k: number) => { g.beginPath(); g.moveTo(cx - w / 2 - 6 * k, top + 3); g.bezierCurveTo(cx - w / 2 - 22 * k, top - w * 0.5, cx - 10, top - w * 0.62, cx + flip * 16, top - w * 0.98); g.bezierCurveTo(cx + 8, top - w * 0.62, cx + w / 2 + 22 * k, top - w * 0.5, cx + w / 2 + 6 * k, top + 3); g.closePath(); };
    g.fillStyle = INK; dome(1.12); g.fill();
    g.save(); dome(1); g.clip();
    box(g, cx - w, top - w * 1.1, w * 2, w * 1.2, R[3]);
    if (f.seed % 3 === 0) { g.fillStyle = W2[3]; for (let k = -w; k < w; k += 18) { g.beginPath(); g.moveTo(cx + k, top + 4); g.quadraticCurveTo(cx + k * 0.4 + 6, top - w * 0.6, cx + flip * 16, top - w); g.lineTo(cx + flip * 16 + 3, top - w); g.quadraticCurveTo(cx + k * 0.4 + 14, top - w * 0.6, cx + k + 9, top + 4); g.closePath(); g.fill(); } }
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(cx - w, top - w * 1.1, w * 0.7, w * 1.2);
    g.fillStyle = 'rgba(26,16,40,0.22)'; g.fillRect(cx + w * 0.18, top - w * 1.1, w, w * 1.2); checker(g, cx + w * 0.18 - 2, top - w * 1.1, 2, w * 1.2, 'rgba(26,16,40,0.22)', 0, 1);
    g.fillStyle = 'rgba(26,16,40,0.3)'; g.fillRect(cx - w, top - 6, w * 2, 10);
    g.restore();
    ballR(g, cx + flip * 16, top - w * 0.98 - 5, 5, rampH(BRASS, true));
  } else if (f.roof === 'flop') {
    const cone = () => { g.beginPath(); g.moveTo(cx - w / 2 - 6, top + 3); g.quadraticCurveTo(cx, top - w * 1.4, cx + flip * w * 0.42, top - w * 1.3); g.quadraticCurveTo(cx + flip * w * 0.92, top - w * 1.2, cx + flip * w * 0.82, top - w * 0.78); g.quadraticCurveTo(cx + flip * w * 0.32, top - w * 0.6, cx + w / 2 + 6, top + 3); g.closePath(); };
    g.save(); g.translate(0, 0); g.fillStyle = INK; g.lineWidth = 5; g.strokeStyle = INK; cone(); g.stroke(); g.restore();
    g.save(); cone(); g.clip();
    box(g, cx - w * 1.2, top - w * 1.5, w * 2.4, w * 1.6, R[3]);
    for (let k = -3; k < 8; k++) { g.fillStyle = k % 2 ? W2[3] : R[3]; g.beginPath(); g.moveTo(cx - w, top - k * 18); g.lineTo(cx + w, top - k * 18 - 20); g.lineTo(cx + w, top - k * 18 - 30); g.lineTo(cx - w, top - k * 18 - 10); g.closePath(); if (k % 2) g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(cx - w, top - w * 1.5, w * 0.62, w * 1.6);
    g.fillStyle = 'rgba(26,16,40,0.22)'; g.fillRect(cx + w * 0.16, top - w * 1.5, w, w * 1.6); checker(g, cx + w * 0.16 - 2, top - w * 1.5, 2, w * 1.6, 'rgba(26,16,40,0.22)', 1, 1);
    g.restore();
    ballR(g, cx + flip * w * 0.82, top - w * 0.78, 6, rampH(FROSTING, true));
  } else if (f.roof === 'balls') {
    for (let k = 0; k < 3; k++) { const rr = w / 2 - k * 9 + 4, cy = top - 8 - k * 16, col = ROOFC[(f.seed + k * 2) % ROOFC.length]; eggR(g, cx, cy, rr, 10, rampH(ramp6(col), true)); }
    ballR(g, cx, top - 62, 6, rampH(BRASS, true));
  } else if (f.roof === 'cake') {
    for (let k = 0; k < 3; k++) {
      const ww = w + 8 - k * 18, hh = 16, cy = top - k * hh, C = rampH(ramp6(ROOFC[(f.seed + k * 3) % ROOFC.length]), true);
      box(g, cx - ww / 2 - 2, cy - hh - 2, ww + 4, hh + 3, INK); box(g, cx - ww / 2, cy - hh, ww, hh, C[3]); box(g, cx - ww / 2, cy - hh, 3, hh, C[4]); box(g, cx + ww / 2 - 4, cy - hh, 4, hh, C[1]);
      box(g, cx - ww / 2, cy - hh, ww, 4, W2[3]); box(g, cx - ww / 2, cy - hh, ww, 1, W2[5]);
      for (let d = cx - ww / 2 + 3; d < cx + ww / 2 - 3; d += 7) { box(g, d, cy - hh + 4, 4, 2 + ((d | 0) % 4), W2[3]); box(g, d + 3, cy - hh + 4, 1, 2 + ((d | 0) % 4), W2[1]); }
    }
    for (let k = 0; k < 3; k++) { const kx = cx - 10 + k * 10; box(g, kx - 2, top - 62, 4, 12, INK); box(g, kx - 1, top - 61, 2, 11, D(['#60A5FA', '#F472B6', '#FDE047'][k])); if (lit() || k === 1) { g.fillStyle = '#FFB040'; g.beginPath(); g.ellipse(kx, top - 65, 2, 3.5, 0, 0, Math.PI * 2); g.fill(); } }
  } else if (f.roof === 'cork') {
    const hh = w * 1.5;
    for (let y = 0; y < hh; y += 2) { const ww = (w / 2 + 6) * (1 - y / hh) + 1, band = ((y + f.seed * 3) >> 3) % 2; box(g, cx - ww - 1, top - y - 2, ww * 2 + 2, 2, INK); box(g, cx - ww, top - y - 2, ww * 2, 2, band ? R[3] : W2[3]); box(g, cx - ww, top - y - 2, Math.max(1, ww * 0.4), 2, band ? R[4] : W2[5]); box(g, cx + ww * 0.4, top - y - 2, ww * 0.6, 2, band ? R[1] : W2[1]); }
    box(g, cx - 1, top - hh - 10, 2, 10, D(INK)); g.fillStyle = D('#F2C84A'); g.beginPath(); g.moveTo(cx + 1, top - hh - 10); g.lineTo(cx + 10, top - hh - 7); g.lineTo(cx + 1, top - hh - 4); g.closePath(); g.fill();
  } else {
    // (a toadstool's cap for a roof, its white spots, the gills under its lip)
    const capR = w / 2 + 16;
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, top + 4, capR + 2, w * 0.56 + 2, 0, Math.PI, 0); g.fill();
    g.save(); g.beginPath(); g.ellipse(cx, top + 4, capR, w * 0.56, 0, Math.PI, 0); g.clip();
    const C = rampH(CHERRY_, true);
    box(g, cx - capR, top - w * 0.6, capR * 2, w * 0.66, C[3]); box(g, cx - capR, top - w * 0.6, capR * 0.6, w * 0.66, C[4]); box(g, cx + capR * 0.3, top - w * 0.6, capR, w * 0.66, C[2]); box(g, cx - capR, top, capR * 2, 6, C[1]);
    for (let k = 0; k < 5; k++) eggR(g, cx - capR * 0.7 + k * capR * 0.35, top - w * 0.28 + (k % 2) * 10, 5 - (k % 2), 4, rampH(FROSTING, true), false);
    g.restore();
    for (let k = -capR + 6; k < capR - 4; k += 5) box(g, cx + k, top + 4, 1, 3, D('#C8B49A'));
  }
};
const CHERRY_ = ['#4A060E', '#7A0E1C', '#B01C2C', '#DC3442', '#F06A72', '#FAAEB2'];

/** One front, painted once for the hour (at the play plane's size: drawn at FRONT_D toward the eye). */
const paintFront = (g: Ctx, f: Front, closed: boolean) => {
  const w = f.w, h = f.h, Wl = rampH(ramp6(wallOf(f)), true), lean = f.lean, b = f.bulge;
  const outline = () => { g.moveTo(0, 0); g.quadraticCurveTo(-b * 2 + lean * 0.5, -h / 2, lean, -h); g.quadraticCurveTo(w / 2 + lean, -h - b * 0.8, w + lean, -h); g.quadraticCurveTo(w + b * 2 + lean * 0.5, -h / 2, w, 0); g.closePath(); };
  // (the wall: plaster banded light to shade across, the skin over it)
  g.save(); g.beginPath(); outline(); g.clip();
  box(g, -b * 2 - 10, -h - 20, w + b * 4 + 40, h + 22, Wl[3]);
  if (f.skin === 'spiral') { g.fillStyle = Wl[2]; for (let k = -h; k < w + h; k += 26) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 11, 0); g.lineTo(k + 11 + h * 0.36, -h - 10); g.lineTo(k + h * 0.36, -h - 10); g.closePath(); g.fill(); } }
  else if (f.skin === 'dots') { for (let yy = -h + 18; yy < -24; yy += 22) for (let xx = 10 + ((yy / 22) % 2 ? 11 : 0); xx < w; xx += 22) { g.fillStyle = Wl[4]; g.beginPath(); g.arc(xx + lean * (-yy / h), yy, 5, 0, Math.PI * 2); g.fill(); box(g, xx + lean * (-yy / h) - 2, yy - 3, 2, 2, Wl[5]); } }
  else if (f.skin === 'scallop') { for (let yy = -h + 30; yy < -30; yy += 46) { box(g, -10, yy, w + 40, 6, Wl[2]); for (let xx = -6; xx < w + 20; xx += 12) { g.fillStyle = Wl[2]; g.beginPath(); g.arc(xx + lean * (-yy / h), yy + 6, 6, 0, Math.PI); g.fill(); } } }
  g.fillStyle = 'rgba(255,255,255,0.24)'; g.fillRect(-b * 2 - 10, -h - 20, w * 0.2 + b * 2 + 10, h + 22); checker(g, w * 0.2, -h - 20, 2, h + 22, 'rgba(255,255,255,0.24)', 0, 1);
  g.fillStyle = 'rgba(26,16,40,0.16)'; g.fillRect(w * 0.66, -h - 20, w, h + 22); checker(g, w * 0.66 - 2, -h - 20, 2, h + 22, 'rgba(26,16,40,0.16)', 1, 1);
  g.fillStyle = 'rgba(26,16,40,0.18)'; g.fillRect(w * 0.86, -h - 20, w, h + 22);
  // (a skirting of darker plaster along the foot, the eave's shade under the roof)
  box(g, -20, -16, w + 50, 16, Wl[2]); box(g, -20, -16, w + 50, 2, Wl[4]);
  box(g, -20, -h - 10, w + 50, 14, 'rgba(26,16,40,0.18)');
  g.restore();
  g.beginPath(); outline(); g.strokeStyle = INK; g.lineWidth = 3; g.lineJoin = 'round'; g.stroke();
  // (the shop: the door, the bay of a window under its awning, the name board up over them)
  const dw = 26, dx = f.seed % 2 ? w - dw - 16 : 16, sx = f.seed % 2 ? 14 : dw + 30, sww = w - dw - 46;
  door(g, dx, 0, dw, 50, ['#7C3AED', '#E2465E', '#2AA69C', '#F2822A', '#3E76DE'][f.seed % 5], closed);
  if (sww > 30) { shopWindow(g, sx, -66, sww, 54, f.goods, f.seed); awning(g, sx - 4, -82, sww + 8, ROOFC[(f.seed + 2) % ROOFC.length], f.seed); }
  if (f.name) nameBoard(g, w / 2 + lean * 0.25, -112, f.name, ROOFC[(f.seed + 4) % ROOFC.length]);
  // (the round windows up the floors, in a wiggle)
  for (let k = 0; ; k++) {
    const wy = -140 - k * 40; if (wy < -h + 22) break;
    const u = -wy / h, wx = w / 2 + Math.sin(k * 1.9 + f.seed) * w * 0.22 + lean * u;
    roundWin(g, wx, wy, 9 + (k % 2) * 2, f.seed + k);
    if (w > 160) roundWin(g, wx + (wx > w / 2 ? -w * 0.36 : w * 0.36), wy + 8, 7, f.seed + k + 7);
  }
  // (the roof, and a curly chimney on some)
  roof(g, f, w / 2 + lean, -h - 2, w);
  if (hash(f.seed * 5) > 0.5 && f.roof !== 'toad') { const cx = (f.seed % 2 ? w * 0.18 : w * 0.82) + lean; candyStroke(g, () => { g.moveTo(cx, -h + 4); g.bezierCurveTo(cx - 12, -h - 14, cx + 12, -h - 26, cx, -h - 42); }, 6, rampH(ramp6('#F06A72'), true), rampH(FROSTING, true), 5); box(g, cx - 6, -h - 46, 12, 5, INK); box(g, cx - 5, -h - 45, 10, 3, D('#5A3A4A')); }
};

// ---------------------------------------------------------------------------------------------------------------
// The street's furniture (at FURN_D, on the pavement)

const FURN_D = 0.94;
type Furn = 'truffula' | 'lamp' | 'bench' | 'balloons' | 'popcorn' | 'hippo' | 'planter' | 'topiary';
export const FURN: { x: number; kind: Furn; seed: number }[] = (() => {
  const out: { x: number; kind: Furn; seed: number }[] = [];
  const kinds: Furn[] = ['truffula', 'lamp', 'bench', 'truffula', 'planter', 'lamp', 'balloons', 'truffula', 'hippo', 'lamp', 'topiary', 'truffula', 'popcorn', 'lamp'];
  // (none in a ball pit, nor where a set piece's sides or round tops run back over the pavement: they'd stand in them)
  const clear: [number, number][] = [...PITS.map(([a, b]) => [a - 70, b + 70] as [number, number]), [SHOP.a - 240, SHOP.b + 240], [HATTERY.a - 240, HATTERY.b + 260], [CAROUSEL.cx - CAROUSEL.r - 90, CAROUSEL.cx + CAROUSEL.r + 90], [STUDIO.a - 320, 99999]];
  let x = -480, i = 0;
  while (x < STUDIO.a - 200) {
    if (!clear.some(([a, b]) => x > a && x < b)) out.push({ x, kind: kinds[i % kinds.length], seed: i * 7 + 2 });
    x += 120 + Math.floor(hash(i * 3.7) * 90); i++;
  }
  return out;
})();
const TUFTS = ['#F472B6', '#FDE047', '#C084FC', '#5EEAD4', '#FB923C', '#F87171'];
const paintFurn = (g: Ctx, kind: Furn, seed: number, popped: boolean) => {
  const T = (c: string) => dimmed(c);
  if (kind === 'truffula') {
    // (a Truffula: a thin trunk banded like a barber pole, bent, a shaggy tuft (stepped, its fringe hanging))
    const h = 150 + Math.floor(hash(seed) * 70), bend = (hash(seed * 2) - 0.5) * 50, col = TUFTS[seed % TUFTS.length], R = rampH(ramp6(col), true);
    for (let y = 0; y < h; y += 3) { const bx = bend * (y / h) ** 2; box(g, bx - 4, -y - 3, 8, 3, INK); box(g, bx - 3, -y - 3, 6, 3, ((y / 3) | 0) % 4 < 2 ? T('#F6EEDC') : T('#3A2E4A')); box(g, bx + 1, -y - 3, 2, 3, ((y / 3) | 0) % 4 < 2 ? T('#D8CCB8') : T('#22182E')); }
    const tx = bend, ty = -h - 18;
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2, rx = tx + Math.cos(a) * 24, ry = ty + Math.sin(a) * 16; g.fillStyle = INK; g.beginPath(); g.arc(rx, ry, 11, 0, Math.PI * 2); g.fill(); }
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2, rx = tx + Math.cos(a) * 24, ry = ty + Math.sin(a) * 16; g.fillStyle = Math.sin(a) > 0.3 ? R[2] : Math.cos(a) < -0.2 && Math.sin(a) < 0.2 ? R[4] : R[3]; g.beginPath(); g.arc(rx, ry, 9.5, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = R[3]; g.beginPath(); g.ellipse(tx, ty, 26, 17, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = R[4]; g.beginPath(); g.ellipse(tx - 8, ty - 6, 12, 7, 0, 0, Math.PI * 2); g.fill();
    box(g, tx - 14, ty - 10, 4, 2, R[5]); box(g, tx - 10, ty - 12, 3, 2, R[5]);
    for (let k = 0; k < 9; k++) { const fx = tx - 26 + k * 6.5; box(g, fx, ty + 14 + (k % 2) * 3, 3, 6, R[2]); box(g, fx, ty + 19 + (k % 2) * 3, 3, 2, R[1]); }
    checker(g, tx - 24, ty + 6, 48, 4, R[2], 0, 1);
    if (popped && seed % 3 === 0) for (let k = 0; k < 3; k++) { const sx = tx - 10 + k * 10; box(g, sx, ty + 12, 1, 18 + k * 6, T('#E8E4F0')); polyF(g, [[sx - 2, ty + 30 + k * 6], [sx + 3, ty + 30 + k * 6], [sx + 1, ty + 36 + k * 6]], T(['#EF4444', '#3B82F6', '#FDE047'][k])); }
  } else if (kind === 'lamp') {
    // (a curly lamp post: a twist of purple up to a crook, a round lamp on it, a ball finial)
    const L = rampH(LILAC_, true);
    candyStroke(g, () => { g.moveTo(0, 0); g.bezierCurveTo(-10, -60, 14, -100, 0, -140); g.quadraticCurveTo(-6, -162, 14, -160); }, 5, L, null);
    box(g, -8, -6, 16, 6, INK); box(g, -7, -5, 14, 4, L[3]); box(g, -7, -5, 14, 1, L[5]);
    g.fillStyle = INK; g.beginPath(); g.arc(16, -150, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = lit() ? '#FFF2C4' : T('#FCE7A0'); g.beginPath(); g.arc(16, -150, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = lit() ? '#FFFFFF' : T('#FFF8D8'); g.beginPath(); g.arc(14, -152, 3.5, 0, Math.PI * 2); g.fill();
    box(g, 10, -161, 12, 3, INK); box(g, 11, -160, 10, 1, L[4]); ballR(g, 16, -164, 3, L);
  } else if (kind === 'bench') {
    // (a curly bench: a wavy back of slats, scrolled iron ends)
    const Wd = rampH(ramp6('#F2822A'), true), Ir = rampH(LICORICE, true);
    for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(s * 34, 0); g.quadraticCurveTo(s * 40, -14, s * 30, -20); g.quadraticCurveTo(s * 42, -30, s * 36, -44); g.stroke(); g.strokeStyle = Ir[4]; g.lineWidth = 2; g.stroke(); }
    box(g, -38, -22, 76, 7, INK); box(g, -37, -21, 74, 5, Wd[3]); box(g, -37, -21, 74, 1, Wd[5]); box(g, -37, -17, 74, 1, Wd[1]);
    for (let k = 0; k < 3; k++) { const y = -30 - k * 7; g.fillStyle = INK; g.beginPath(); g.moveTo(-36, y); g.quadraticCurveTo(0, y - 6, 36, y); g.lineTo(36, y + 5); g.quadraticCurveTo(0, y - 1, -36, y + 5); g.closePath(); g.fill(); g.fillStyle = Wd[3 + (k === 2 ? 1 : 0)]; g.beginPath(); g.moveTo(-35, y + 1); g.quadraticCurveTo(0, y - 5, 35, y + 1); g.lineTo(35, y + 4); g.quadraticCurveTo(0, y - 2, -35, y + 4); g.closePath(); g.fill(); }
  } else if (kind === 'balloons') {
    // (the balloon man's post: a bunch tied to it; popped: the skins on their strings, a scrap or two on the ground)
    const P = rampH(ramp6('#E2465E'), true);
    candyStroke(g, () => { g.moveTo(0, 0); g.lineTo(0, -90); }, 4, rampH(FROSTING, true), P, 5);
    const cols = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#EC4899', '#F97316', '#A855F7'];
    for (let k = 0; k < 7; k++) {
      const bx = -26 + (k % 4) * 17 + (k > 3 ? 8 : 0), by = -150 + (k > 3 ? 22 : 0) + ((k * 7) % 5) * 2;
      if (popped) { g.strokeStyle = T('#E8E4F0'); g.lineWidth = 1; g.beginPath(); g.moveTo(0, -88); g.quadraticCurveTo(bx * 0.4, -96, bx * 0.5, by + 40); g.stroke(); polyF(g, [[bx * 0.5 - 3, by + 40], [bx * 0.5 + 3, by + 41], [bx * 0.5 + 1, by + 47], [bx * 0.5 - 2, by + 45]], T(cols[k])); continue; }
      g.strokeStyle = T('#E8E4F0'); g.lineWidth = 1; g.beginPath(); g.moveTo(0, -88); g.quadraticCurveTo(bx * 0.6, -110, bx, by + 12); g.stroke();
      eggR(g, bx, by, 9, 11, rampH(ramp6(cols[k]), true)); box(g, bx - 1, by + 11, 3, 2, T(mix(cols[k], INK, 0.3)));
    }
    if (popped) for (let k = 0; k < 4; k++) polyF(g, [[-30 + k * 18, -1], [-24 + k * 18, -3], [-22 + k * 18, 0]], T(cols[k + 1]));
    box(g, -8, -4, 16, 4, INK); box(g, -7, -3, 14, 3, T('#9A8AA8'));
  } else if (kind === 'popcorn') {
    // (a popcorn cart: red and white, glass case heaped, a striped roof, spoked wheels)
    const Rd = rampH(CHERRY_, true), Wt = rampH(FROSTING, true);
    for (const wx of [-22, 22]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -10, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = Wt[3]; g.beginPath(); g.arc(wx, -10, 8, 0, Math.PI * 2); g.fill(); g.strokeStyle = Rd[2]; g.lineWidth = 1; for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI; g.beginPath(); g.moveTo(wx + Math.cos(a) * 7, -10 + Math.sin(a) * 7); g.lineTo(wx - Math.cos(a) * 7, -10 - Math.sin(a) * 7); g.stroke(); } }
    box(g, -32, -44, 64, 28, INK); box(g, -31, -43, 62, 26, Rd[3]); box(g, -31, -43, 4, 26, Rd[4]); box(g, 25, -43, 6, 26, Rd[1]);
    box(g, -26, -84, 52, 40, INK); box(g, -25, -83, 50, 38, D('#DCEEFA')); for (let k = 0; k < 40; k++) box(g, -24 + hash(k + seed) * 46, -64 + hash(k * 3 + seed) * 18, 3, 3, D(k % 3 ? '#FFF4C8' : '#F6D27A'));
    box(g, -23, -82, 3, 30, D('#FFFFFF'));
    for (let k = 0; k < 6; k++) polyF(g, [[-36 + k * 12, -84], [-30 + k * 12, -100], [-24 + k * 12, -84]], k % 2 ? Wt[3] : Rd[3]);
    box(g, -36, -86, 72, 3, INK);
    signText(g, 'POPCORN', 0, -24, { sx: 1, sy: 1, fill: Wt[4] });
  } else if (kind === 'hippo') {
    // (a hippo of a trash can: mouth open wide, FEED ME on its belly)
    const Hp = rampH(ramp6('#9476DE'), true);
    eggR(g, 0, -24, 22, 24, Hp);
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -46, 18, 12, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = D('#5A1A3A'); g.beginPath(); g.ellipse(0, -46, 15, 9, 0, 0, Math.PI * 2); g.fill();
    for (const s of [-1, 1]) { box(g, s * 8 - 2, -55, 4, 5, INK); box(g, s * 8 - 1, -54, 2, 3, D('#FFFFFF')); ballR(g, s * 12, -60, 4, Hp); box(g, s * 12 - 1, -61, 2, 2, INK); }
    signText(g, 'FEED ME', 0, -14, { sx: 1, sy: 1, fill: D('#FFFFFF'), ink: INK });
  } else if (kind === 'planter') {
    // (a striped tub of flowers)
    const Pt = rampH(ramp6('#2AA69C'), true);
    polyF(g, [[-20, -24], [20, -24], [16, 0], [-16, 0]], INK); polyF(g, [[-19, -23], [19, -23], [15, -1], [-15, -1]], Pt[3]);
    for (let k = -14; k < 16; k += 8) polyF(g, [[k, -23], [k + 4, -23], [k + 3, -1], [k - 1, -1]], Pt[4]);
    for (let k = 0; k < 9; k++) { const fx = -16 + k * 4, fy = -30 - (k % 3) * 6; box(g, fx, fy, 1, -24 - fy, rampH(GRASS, true)[2]); ballR(g, fx, fy, 2.5, rampH(ramp6(['#F472B6', '#FDE047', '#FFFFFF', '#C084FC'][k % 4]), true), false); }
  } else {
    // (topiary: three clipped balls on a stick, the top one a little bird)
    const Gr = rampH(GRASS, true);
    box(g, -2, -60, 4, 60, D('#6A4A3A'));
    ballR(g, 0, -30, 16, Gr); ballR(g, 0, -62, 12, Gr); ballR(g, 2, -86, 8, Gr); polyF(g, [[8, -88], [16, -86], [8, -84]], Gr[2]);
    box(g, -16, -2, 32, 3, D('#A8642E'));
  }
};
const LILAC_ = ['#2E1A5A', '#4A2E8A', '#6C4CBC', '#9476DE', '#BAA4F0', '#E0D6FC'];
const FURN_BOX: Record<Furn, [number, number, number, number]> = {
  truffula: [-70, -270, 140, 274], lamp: [-24, -180, 52, 184], bench: [-48, -60, 96, 64], balloons: [-50, -176, 100, 180],
  popcorn: [-44, -106, 88, 110], hippo: [-30, -76, 60, 80], planter: [-26, -50, 52, 54], topiary: [-22, -100, 44, 104],
};

// ---------------------------------------------------------------------------------------------------------------
// The pavement going back to the fronts, the alley behind them

const PAVE = ['#F6C4DA', '#E4D2F6', '#C8ECD6', '#FCE6B0'];
/** Where the ball pits' back rims stand (the pavement stops there over a pit). */
export const PIT_D = 0.93;
const inPit = (x: number) => PITS.some(([a, b]) => x > X(a) && x < X(b));

/** The garden alley behind the fronts (between BACK_D and FRONT_D): dimmed grass, flowerbeds. */
export const drawAlley = (c: Ctx, v: View) => {
  const a = v.v0 - 200, b = v.v1 + 200, G = rampH(GRASS, true);
  for (let i = 0; i < 3; i++) {
    const d0 = BACK_D + ((FRONT_D - BACK_D) * i) / 3, d1 = BACK_D + ((FRONT_D - BACK_D) * (i + 1)) / 3;
    polyF(c, [at(v.eye, a, GY, d0), at(v.eye, b, GY, d0), at(v.eye, b, GY, d1), at(v.eye, a, GY, d1)], G[2 + i]);
  }
};
/** The candy pavement from the fronts' feet (FRONT_D) to the play plane, in bands; over a pit, only back to its rim. */
export const drawPavement = (c: Ctx, v: View) => {
  const a = v.v0 - 60, b = v.v1 + 60;
  // (the runs: the pits cut it short)
  const cuts: [number, number, number][] = [];
  let x = a;
  const edges = PITS.map(([p, q]) => [X(p), X(q)] as [number, number]).filter(([p, q]) => q > a && p < b).sort((m, n) => m[0] - n[0]);
  for (const [p, q] of edges) { if (p > x) cuts.push([x, p, 1]); cuts.push([Math.max(x, p), Math.min(b, q), PIT_D]); x = q; }
  if (x < b) cuts.push([x, b, 1]);
  const N = 6;
  for (const [s, e, dn] of cuts) {
    for (let i = 0; i < N; i++) {
      const d0 = FRONT_D + ((dn - FRONT_D) * i) / N, d1 = FRONT_D + ((dn - FRONT_D) * (i + 1)) / N, col = dimmed(PAVE[i % PAVE.length]);
      polyF(c, [at(v.eye, s, GY, d0), at(v.eye, e, GY, d0), at(v.eye, e, GY, d1), at(v.eye, s, GY, d1)], col);
      // (the seam between bands, a lighter edge on each band's near side)
      const [lx, ly] = at(v.eye, s, GY, d1), [rx] = at(v.eye, e, GY, d1);
      box(c, lx, ly - 1, rx - lx, 1, dimmed(mix(PAVE[i % PAVE.length], '#FFFFFF', 0.4)));
      checker(c, lx, ly - 3, rx - lx, 2, dimmed(PAVE[(i + 1) % PAVE.length]), i % 2, 1);
    }
    // (the joints running back to the eye)
    c.strokeStyle = dimmed('#B88AAA'); c.lineWidth = 1; c.beginPath();
    for (let jx = Math.ceil(s / 46) * 46; jx < e; jx += 46) { const [x0, y0] = at(v.eye, jx, GY, FRONT_D), [x1, y1] = at(v.eye, jx, GY, dn); c.moveTo(x0, y0); c.lineTo(x1, y1); }
    c.stroke();
  }
  // (the flower bed along the fronts' feet)
  const [fa, fy] = at(v.eye, a, GY, FRONT_D + 0.004), [fb] = at(v.eye, b, GY, FRONT_D + 0.004);
  box(c, fa, fy - 1, fb - fa, 4, dimmed(GRASS[2]));
  for (let fx = Math.floor(a / 9) * 9; fx < b; fx += 9) { const [px, py] = at(v.eye, fx, GY, FRONT_D + 0.004); if (hash(fx * 0.13) > 0.4) box(c, px, py - 3, 2, 2, dimmed(['#F472B6', '#FDE047', '#FFFFFF', '#C084FC'][Math.floor(hash(fx) * 4)])); }
};

// ---------------------------------------------------------------------------------------------------------------

/** The fronts: every side first (they run back behind the next one's front), then the fronts themselves. */
export const drawFronts = (c: Ctx, v: View, closed: boolean) => {
  const vis = FRONTS.filter(f => seen(v, X(f.x) - 60, X(f.x + f.w) + 60, FRONT_D, 120));
  for (const f of vis) {
    const R = rampH(ramp6(wallOf(f)), true), top = GY - f.h, a = X(f.x), b = X(f.x + f.w);
    sideBack(c, v.eye, a, -1, top, GY, FRONT_D, BACK_D, R, 3, bowL(f));
    sideBack(c, v.eye, b, 1, top, GY, FRONT_D, BACK_D, R, 3, bowR(f));
  }
  for (const f of vis) {
    const w = f.w, h = f.h;
    stillAt(c, v, FRONT_D, `ki-front-${f.seed}-${closed ? 1 : 0}`, X(f.x), GY, -w * 0.5 - 50, -h - w * 1.6 - 30, w * 2 + 100, h + w * 1.6 + 34, g => paintFront(g, f, closed));
  }
};
/** The street's furniture on the pavement. */
export const drawFurniture = (c: Ctx, v: View, popped: boolean) => {
  for (const it of FURN) {
    const bx = FURN_BOX[it.kind], x = X(it.x);
    if (!seen(v, x + bx[0], x + bx[0] + bx[2], FURN_D, 40)) continue;
    stillAt(c, v, FURN_D, `ki-furn-${it.kind}-${it.seed}-${popped && (it.kind === 'balloons' || it.kind === 'truffula') ? 1 : 0}`, x, GY, bx[0], bx[1], bx[2], bx[3], g => paintFurn(g, it.kind, it.seed, popped));
  }
};
/** The lamps after dark (the street's lamp posts, the shops' windows). */
export const frontLamps = (v: View): Light[] => {
  const out: Light[] = [];
  for (const it of FURN) {
    if (it.kind !== 'lamp') continue;
    const [x, y] = at(v.eye, X(it.x) + 16, GY - 150, FURN_D);
    if (x > v.cam.x - 200 && x < v.cam.x + 1000) out.push({ x, y, r: 120, a: 0.55, color: '#FFE8A8' });
  }
  for (const f of FRONTS) {
    const [x, y] = at(v.eye, X(f.x + f.w / 2), GY - 40, FRONT_D);
    if (x > v.cam.x - 200 && x < v.cam.x + 1000) out.push({ x, y, r: 70, a: 0.35, color: '#FFC870' });
  }
  return out;
};
export { inPit, FURN_D };
void timeOfDay;
