// THE LAZY RIVER's themed stretches (the owner, 2026-11-05: "i want the background to be varied the whole way, like how
// real lazy river rides are themed" / "generally speaking i want the theming of the levels to feel unique, like you're
// going through a water park"). The river winds through a run of themed zones, each with its own landmarks far back,
// its own bank behind the river (and its own name board on it, where it starts), its own decks and its own pergola
// posts for the vines. All of it at the small hours (11), all of it on fire (the goth son's doing), wrecked to suit.
// No volcanoes.
//
//   THE RIVER'S HEAD   the pool deck by the tube rental: the splash playground's bucket tower, a wave pool's house
//   THE LOST RUINS     (the vines) a stepped temple, a giant stone head, broken columns, idols, burning palms
//   THE CANOPY         (the burning canopy) giant fake banyans, treehouses, rope bridges between, lanterns
//   GATOR BAYOU        (the log jam) cypress and moss, a burning paddlewheeler, a stilt shack of gifts, fake gators
//   TIKI VILLAGE       (the swim-up bar, the tiki towers) giant tiki heads, longhouses and huts on stilts, torches
//   PIRATE COVE        (the towers and the vine, the mix's log) a burning galleon, a fort, a lighthouse, cannons
//   MIRAGE OASIS       (the soup) a pyramid, a sphinx in shades, dunes and date palms, tents
//   CRYSTAL CAVERNS    (the last bend) under the rock: stalactites, glowing crystals, glowworms
//   SKULL GROTTO       the son's: purple rock, bones, candles (the grotto's own art is art.ts's)
//   BACKSTAGE          (the coast past the grotto) the theming stops: the backs of the plywood flats, braces,
//                      scaffold, pumps, a fence, the maintenance door (level 3's way in)
//
// Depth, back to front (each its own draw step):
//   drawZoneMid (screen space, in the backdrop, after level 1's sky, far horizon and the park's big slides): the zone's
//     big landmarks, parallax 0.4, dimmed and hazed toward the night, lit red from below by the fire; their fires live.
//     Tiles 400 wide, each one zone's (the zone the screen's middle is in when that tile's in the middle). Their feet
//     stand behind the bank's top (no ground band of their own: no seam where the zone changes).
//   drawZoneBank (world, first thing in drawBack2, behind the pergola, the river, the decks): the river's far bank, its
//     face down to the far water, the props stood on its top (dimmed: nothing to stand on), live flames on them. Tiles
//     480 wide, world-anchored; each zone starts on a tile edge, its name board stood on the bank over the seam.
//   the decks' look per zone (art.ts paints them; deckStyle here), the pergola's posts and the vines' beams per zone.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH as W } from '../../../m1/constants';
import { stamp } from '../../intro/art/kit';
import { mix, checker, hazeBands } from '../../intro/art/kit';
import { timeOfDay } from '../../timeOfDay';
import { GY, B, RIVER_Y, L3, waterY, floorDy } from './geo';
import { fireRow, flame, FIRE } from './fire';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
/** A fire on a painted tile: tile-local (x, foot y, width, height). */
type Spot = [number, number, number, number];
const INK = '#0A0604';
const R = (g: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const poly = (g: Ctx, pts: P[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); };
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string, a0 = 0, a1 = Math.PI * 2) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, a0, a1); g.closePath(); g.fill(); };
const stroke = (g: Ctx, pts: P[], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.lineCap = 'butt'; g.lineJoin = 'miter'; };
/** Five steps round a color: deep, shade, body, lit, highlight. */
const ramp5 = (col: string) => [mix(col, INK, 0.55), mix(col, INK, 0.3), col, mix(col, '#FFFFFF', 0.22), mix(col, '#FFFFFF', 0.45)];
/** Toward the night air (scenery behind the play: nothing back there to stand on). */
const nt = (col: string, k: number) => mix(col, '#0B0A1E', k);
/** A block in its ramp: inked, lit along its top and left (the moon), shaded right and along its foot, the seams
 *  dithered. */
const block = (g: Ctx, x: number, y: number, w: number, h: number, Rm: string[], ink = true) => {
  if (ink) R(g, x - 1, y - 1, w + 2, h + 2, INK);
  R(g, x, y, w, h, Rm[2]);
  R(g, x, y, w, 2, Rm[4]); R(g, x, y + 2, w, 2, Rm[3]); R(g, x, y, 2, h, Rm[3]);
  R(g, x + w - 3, y, 3, h, Rm[1]); R(g, x, y + h - 2, w, 2, Rm[0]);
  if (h > 8 && w > 8) checker(g, x + 2, y + h - 6, w - 4, 4, Rm[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// The zones

export type ZoneId = 'head' | 'ruins' | 'canopy' | 'bayou' | 'tiki' | 'pirate' | 'oasis' | 'caves' | 'grotto' | 'back';
const BANK_T = 480;
/** Where each starts (world x, on a bank tile's edge), its name board's words (none: no board). */
const snapT = (x: number) => Math.round(x / BANK_T) * BANK_T;
export const ZONES: { id: ZoneId; x: number; name?: [string, string]; board?: string }[] = [
  { id: 'head', x: -1e9 },
  { id: 'ruins', x: snapT(B + 1500), name: ['THE LOST RUINS', 'MIND THE CURSE'], board: '#6B5B3A' },
  { id: 'canopy', x: snapT(B + 5400), name: ['THE CANOPY', 'TREEHOUSE TRAIL'], board: '#3F6212' },
  { id: 'bayou', x: snapT(B + 9300), name: ['GATOR BAYOU', 'KEEP ARMS IN TUBE'], board: '#4B5563' },
  { id: 'tiki', x: snapT(B + 14400), name: ['TIKI VILLAGE', 'ALOHA, Y\'ALL'], board: '#9A3412' },
  { id: 'pirate', x: snapT(B + 18500), name: ['PIRATE COVE', 'ARR. NO REFUNDS.'], board: '#1E3A5F' },
  { id: 'oasis', x: snapT(B + 23000), name: ['MIRAGE OASIS', 'IT\'S A DRY HEAT'], board: '#B45309' },
  { id: 'caves', x: snapT(B + 26400), name: ['CRYSTAL CAVERNS', 'WATCH YOUR HEAD'], board: '#4C1D95' },
  { id: 'grotto', x: snapT(B + 28000) },
  { id: 'back', x: snapT(B + 29930) },
];
export const zoneAt = (x: number): ZoneId => { let z: ZoneId = 'head'; for (const q of ZONES) if (x >= q.x) z = q.id; return z; };

// ---------------------------------------------------------------------------------------------------------------
// The far landmarks (screen space, parallax): one tile's worth each, 400 wide, 470 tall (screen y 0..470 at the level's
// camera), their feet at MG (behind the bank's top)

const MID_W = 400, MID_H = 470, MG = 452, PAR = 0.4;
/** The world x a mid tile stands for (the screen's middle's, when it's in the middle). */
const midX = (j: number) => ((j * MID_W + MID_W / 2) - 400) / PAR + 400;
/** The landmarks' night: how far back toward the dark, and a haze. */
const MD = 0.5;
const m = (col: string) => nt(col, MD);
/** A burning palm, far: a curved trunk, its crown burnt to ribs (its fire's a spot). */
const farPalm = (g: Ctx, x: number, foot: number, h: number, lean: number, sp: Spot[], k = MD) => {
  const tr = ramp5(nt('#5A3A22', k));
  const top: P = [x + lean, foot - h];
  stroke(g, [[x, foot], [x + lean * 0.3, foot - h * 0.6], top], 7, INK);
  stroke(g, [[x, foot], [x + lean * 0.3, foot - h * 0.6], top], 5, tr[2]);
  stroke(g, [[x - 1, foot], [x + lean * 0.3 - 1, foot - h * 0.6], top], 2, tr[3]);
  for (let y = foot - 8; y > foot - h + 6; y -= 7) R(g, x + lean * Math.pow((foot - y) / h, 1.6) - 3, y, 6, 1, tr[0]);
  for (let a = 0; a < 7; a++) { const an = Math.PI + 0.2 + a * 0.45; stroke(g, [top, [top[0] + Math.cos(an) * 22, top[1] + Math.sin(an) * 12 - 6], [top[0] + Math.cos(an) * 36, top[1] + Math.sin(an) * 18 + 10]], 2, '#120A08'); }
  sp.push([top[0], top[1] + 6, 26, 26]);
};
/** The night and the fire on a painted tile: dimmed bands toward the foot (the haze over the river), the fire's red
 *  from below; over what's painted only. */
const nightWash = (g: Ctx, w: number, h: number, foot: number) => {
  g.globalCompositeOperation = 'source-atop';
  hazeBands(g, 0, foot - 200, w, 200, '#0B0A1E', 0, 0.45, 6);
  hazeBands(g, 0, foot - 150, w, 150, '#C2410C', 0, 0.32, 6);
  g.globalCompositeOperation = 'source-over';
};

const midHead = (g: Ctx, j: number, sp: Spot[]) => {
  if (j % 2 === 0) {
    // (the splash playground's bucket tower: a scaffold of pipes in the park's colors, platforms, the giant tipping
    // bucket on top; a slide off it)
    const x = 200, top = MG - 300, S = ramp5(m('#0E7490')), Y = ramp5(m('#CA8A04')), Rd = ramp5(m('#B91C1C'));
    for (const lx of [x - 70, x - 20, x + 30, x + 70]) block(g, lx - 4, top + 70, 8, MG - top - 70, S);
    for (let y = top + 90; y < MG; y += 60) block(g, x - 80, y, 160, 8, Y);
    poly(g, [[x - 50, top + 70], [x, top + 20], [x + 50, top + 70]], INK); poly(g, [[x - 46, top + 68], [x, top + 24], [x, top + 68]], Rd[3]); poly(g, [[x, top + 24], [x + 46, top + 68], [x, top + 68]], Rd[1]);
    // (the bucket: a drum on a pivot, tipped a little; burning on the far side)
    R(g, x - 2, top - 20, 4, 44, S[1]);
    poly(g, [[x - 40, top - 64], [x + 36, top - 54], [x + 28, top - 4], [x - 34, top - 12]], INK);
    poly(g, [[x - 37, top - 61], [x + 33, top - 52], [x + 26, top - 7], [x - 31, top - 14]], Y[2]);
    poly(g, [[x - 37, top - 61], [x + 33, top - 52], [x + 32, top - 46], [x - 37, top - 55]], Y[4]);
    for (let k = 0; k < 4; k++) R(g, x - 30 + k * 16, top - 50 + k * 1.5, 3, 40, Y[1]);
    // (a slide off its platform, round tube)
    stroke(g, [[x + 80, MG - 150], [x + 130, MG - 120], [x + 150, MG - 60], [x + 190, MG - 10]], 18, INK);
    stroke(g, [[x + 80, MG - 150], [x + 130, MG - 120], [x + 150, MG - 60], [x + 190, MG - 10]], 14, Rd[2]);
    stroke(g, [[x + 80, MG - 154], [x + 130, MG - 124], [x + 150, MG - 64], [x + 190, MG - 14]], 4, Rd[3]);
    sp.push([x + 20, top - 50, 30, 34]);
  } else {
    // (the wave pool's house: a long low shed with a wave-shaped roof, its big blowers, WAVE POOL in dead letters)
    const x0 = 40, x1 = 360, top = MG - 150, Wl = ramp5(m('#94A3B8')), Rf = ramp5(m('#0369A1'));
    block(g, x0, top, x1 - x0, MG - top, Wl);
    g.fillStyle = INK; g.beginPath(); g.moveTo(x0 - 10, top + 4); for (let x = x0 - 10; x <= x1 + 10; x += 40) g.quadraticCurveTo(x + 20, top - 34, x + 40, top + 4); g.lineTo(x1 + 10, top + 10); g.lineTo(x0 - 10, top + 10); g.fill();
    g.fillStyle = Rf[2]; g.beginPath(); g.moveTo(x0 - 8, top + 4); for (let x = x0 - 8; x < x1 + 8; x += 40) g.quadraticCurveTo(x + 20, top - 30, x + 40, top + 4); g.lineTo(x1 + 8, top + 8); g.lineTo(x0 - 8, top + 8); g.fill();
    for (let x = x0 - 8; x < x1 + 8; x += 40) R(g, x + 14, top - 10, 10, 2, Rf[4]);
    for (let k = 0; k < 4; k++) { const bx = x0 + 30 + k * 76; block(g, bx, top + 40, 40, 40, ramp5(m('#475569'))); ell(g, bx + 20, top + 60, 14, 14, m('#1E293B')); for (let a = 0; a < 4; a++) stroke(g, [[bx + 20, top + 60], [bx + 20 + Math.cos(a * 1.57 + 0.4) * 12, top + 60 + Math.sin(a * 1.57 + 0.4) * 12]], 2, m('#64748B')); }
    g.font = '10px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = m('#FDE68A'); g.fillText('WAVE POOL', 200, top + 28); g.textAlign = 'left';
    sp.push([110, top - 4, 40, 30]); sp.push([300, top - 2, 30, 24]);
  }
};

const midRuins = (g: Ctx, j: number, sp: Spot[]) => {
  const S = ramp5(m('#8A7A5A')), Mo = ramp5(m('#3F5A2A'));
  if (j % 2 === 0) {
    // (the stepped temple: five tiers, a stair up its middle, a shrine on top, its doorway dark; vines down it)
    const x = 200;
    for (let k = 0; k < 5; k++) { const w = 320 - k * 56, y = MG - (k + 1) * 46; block(g, x - w / 2, y, w, 46, S); for (let bx = x - w / 2 + 14; bx < x + w / 2 - 14; bx += 22) R(g, bx, y + 22, 1, 22, S[1]); }
    block(g, x - 22, MG - 230, 44, 230, ramp5(m('#9A8A6A')));
    for (let y = MG - 228; y < MG; y += 8) R(g, x - 21, y, 42, 1, S[0]);
    block(g, x - 46, MG - 300, 92, 70, S); R(g, x - 16, MG - 284, 32, 54, INK);
    poly(g, [[x - 54, MG - 300], [x, MG - 330], [x + 54, MG - 300]], S[1]); poly(g, [[x - 54, MG - 300], [x, MG - 330], [x, MG - 300]], S[3]);
    // (a carved face over the door: two eyes, a grin)
    R(g, x - 12, MG - 296, 6, 4, S[0]); R(g, x + 6, MG - 296, 6, 4, S[0]);
    for (const vx of [x - 130, x - 70, x + 90, x + 140]) stroke(g, [[vx, MG - 140 + (vx % 30)], [vx + 4, MG - 90], [vx - 2, MG - 40]], 3, Mo[1]);
    sp.push([x - 40, MG - 300, 22, 26]); sp.push([x + 40, MG - 300, 22, 26]);
    farPalm(g, 30, MG, 200, 20, sp); farPalm(g, 370, MG, 180, -24, sp);
  } else {
    // (the giant stone head, cracked, moss on its brow, half sunk; a broken colonnade behind it)
    for (let k = 0; k < 5; k++) { const cx = 40 + k * 80, h = 120 + hash(j * 5 + k) * 120; block(g, cx - 12, MG - h, 24, h, S); R(g, cx - 18, MG - h - 8, 36, 8, S[3]); R(g, cx - 18, MG - h - 2, 36, 2, S[0]); for (let fx = cx - 8; fx < cx + 10; fx += 6) R(g, fx, MG - h + 4, 1, h - 6, S[1]); }
    block(g, 30, MG - 250, 140, 14, S); block(g, 270, MG - 210, 110, 14, S);
    const x = 200, Hd = ramp5(m('#7A6E58'));
    poly(g, [[x - 80, MG], [x - 86, MG - 120], [x - 70, MG - 190], [x, MG - 214], [x + 70, MG - 190], [x + 86, MG - 120], [x + 80, MG]], INK);
    poly(g, [[x - 76, MG], [x - 82, MG - 120], [x - 66, MG - 186], [x, MG - 210], [x + 66, MG - 186], [x + 82, MG - 120], [x + 76, MG]], Hd[2]);
    poly(g, [[x - 76, MG], [x - 82, MG - 120], [x - 66, MG - 186], [x - 40, MG - 200], [x - 50, MG - 120], [x - 46, MG]], Hd[3]);
    poly(g, [[x + 40, MG], [x + 50, MG - 120], [x + 66, MG - 186], [x + 82, MG - 120], [x + 76, MG]], Hd[1]);
    R(g, x - 60, MG - 156, 120, 12, Hd[1]);
    for (const ex of [-34, 34]) { ell(g, x + ex, MG - 130, 18, 10, Hd[0]); ell(g, x + ex, MG - 132, 10, 6, '#FDBA74'); ell(g, x + ex, MG - 132, 5, 3, '#FFF7D6'); }
    poly(g, [[x - 8, MG - 124], [x - 20, MG - 80], [x + 20, MG - 80], [x + 8, MG - 124]], Hd[1]);
    R(g, x - 44, MG - 58, 88, 16, Hd[0]); for (let k = 0; k < 6; k++) R(g, x - 40 + k * 14, MG - 56, 10, 6, Hd[3]);
    stroke(g, [[x + 10, MG - 206], [x + 20, MG - 170], [x + 6, MG - 140]], 2, INK);
    ell(g, x - 20, MG - 200, 46, 10, Mo[2]); checker(g, x - 60, MG - 202, 80, 6, Mo[3]);
    farPalm(g, 360, MG, 220, -30, sp);
  }
};

const midCanopy = (g: Ctx, j: number, sp: Spot[]) => {
  const Tr = ramp5(m('#4A3424')), Lf = ramp5(m('#1F4A26')), Th = ramp5(m('#8A6A3A'));
  const tree = (x: number, w: number, top: number) => {
    // (the trunk, its buttress roots, the crown in stepped lumps; burnt black at its edges)
    poly(g, [[x - w, MG], [x - w * 0.4, MG - 60], [x - w * 0.35, top + 60], [x + w * 0.35, top + 60], [x + w * 0.4, MG - 60], [x + w, MG]], INK);
    poly(g, [[x - w + 3, MG], [x - w * 0.4 + 2, MG - 60], [x - w * 0.35 + 2, top + 62], [x + w * 0.35 - 2, top + 62], [x + w * 0.4 - 2, MG - 60], [x + w - 3, MG]], Tr[2]);
    poly(g, [[x - w + 3, MG], [x - w * 0.4 + 2, MG - 60], [x - w * 0.35 + 2, top + 62], [x - w * 0.1, top + 62], [x - w * 0.15, MG]], Tr[3]);
    for (let y = top + 80; y < MG; y += 14) R(g, x + w * 0.1, y, w * 0.2, 2, Tr[1]);
    for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8) * Math.PI, cx = x + Math.cos(a) * w * 2.2, cy = top + 50 + Math.sin(a) * 50; ell(g, cx, cy, 40, 26, INK); ell(g, cx, cy, 38, 24, Lf[1]); ell(g, cx - 6, cy - 6, 26, 14, Lf[2]); checker(g, cx - 20, cy - 16, 30, 6, Lf[3]); }
    // (burnt holes in the crown: black, the fire at them)
    for (let k = 0; k < 2; k++) { const cx = x - w * 1.4 + k * w * 2.6, cy = top + 30 + k * 16; ell(g, cx, cy, 16, 10, '#120A08'); sp.push([cx, cy + 8, 26, 30]); }
  };
  const house = (x: number, y: number, burnt: boolean) => {
    block(g, x - 34, y - 36, 68, 36, Th); for (let k = 0; k < 5; k++) R(g, x - 32 + k * 14, y - 34, 1, 32, Th[1]);
    R(g, x - 10, y - 26, 20, 24, INK); R(g, x - 40, y - 2, 80, 6, Th[0]);
    poly(g, [[x - 46, y - 34], [x, y - 70], [x + 46, y - 34]], INK); poly(g, [[x - 42, y - 36], [x, y - 66], [x + 42, y - 36]], ramp5(m('#A88A4A'))[burnt ? 0 : 2]);
    for (let k = 0; k < 6; k++) R(g, x - 36 + k * 13, y - 40 + Math.abs(k - 2.5) * 2, 2, 6, Th[1]);
    if (burnt) sp.push([x, y - 40, 40, 40]);
  };
  if (j % 2 === 0) {
    tree(110, 26, MG - 330); tree(310, 22, MG - 290);
    house(110, MG - 190, false); house(310, MG - 170, true);
    // (a rope bridge between, snapped in the middle, its halves hanging)
    stroke(g, [[140, MG - 196], [180, MG - 176], [196, MG - 120]], 2, Th[3]); stroke(g, [[280, MG - 176], [240, MG - 160], [226, MG - 110]], 2, Th[3]);
    for (let k = 0; k < 4; k++) { R(g, 148 + k * 10, MG - 192 + k * 5, 6, 2, Th[1]); R(g, 270 - k * 10, MG - 172 + k * 4, 6, 2, Th[1]); }
  } else {
    tree(200, 34, MG - 360); house(200, MG - 220, true);
    // (a ladder down the trunk, lanterns strung off it)
    for (let y = MG - 210; y < MG - 20; y += 12) R(g, 190, y, 20, 2, Th[3]);
    stroke(g, [[20, MG - 240], [100, MG - 210], [170, MG - 230]], 1, m('#6A5A3A'));
    for (let k = 0; k < 5; k++) { const lx = 30 + k * 30, ly = MG - 234 + Math.sin(k) * 10 + 18; R(g, lx - 3, ly, 6, 8, k % 2 ? '#FDBA74' : '#FDE68A'); R(g, lx - 3, ly, 6, 1, INK); }
    farPalm(g, 360, MG, 190, -20, sp);
  }
};

const midBayou = (g: Ctx, j: number, sp: Spot[]) => {
  const Cy = ramp5(m('#4A4030')), Mo = ramp5(m('#5A6A4A'));
  const cypress = (x: number, h: number) => {
    poly(g, [[x - 26, MG], [x - 10, MG - 40], [x - 6, MG - h], [x + 6, MG - h], [x + 10, MG - 40], [x + 26, MG]], INK);
    poly(g, [[x - 24, MG], [x - 9, MG - 40], [x - 5, MG - h + 2], [x + 5, MG - h + 2], [x + 9, MG - 40], [x + 24, MG]], Cy[2]);
    poly(g, [[x - 24, MG], [x - 9, MG - 40], [x - 5, MG - h + 2], [x - 1, MG - h + 2], [x - 3, MG]], Cy[3]);
    // (its crown: ragged clumps of needles off the boughs, stepped, the moss hung under)
    for (let k = 0; k < 4; k++) {
      const cy = MG - h + 10 + k * 18, cx = x + (k % 2 ? 22 : -22);
      stroke(g, [[x, cy + 10], [cx, cy + 2]], 3, Cy[1]);
      for (let b = 0; b < 4; b++) { const bx = cx - 18 + b * 12 + hash(x + k * 4 + b) * 6, by = cy - 2 + (b % 2) * 4; ell(g, bx, by, 11, 8, INK); ell(g, bx, by - 1, 10, 6.5, m('#2A3A22')); ell(g, bx - 2, by - 3, 6, 3, m('#3E5232')); }
    }
    // (the Spanish moss: hanging strands, dithered)
    for (let k = 0; k < 9; k++) { const sx = x - 44 + k * 11, sy = MG - h + 14 + (k % 3) * 18, len = 20 + hash(x + k) * 40; R(g, sx, sy, 2, len, Mo[1]); checker(g, sx - 2, sy + 4, 6, len - 8, Mo[2]); }
  };
  if (j % 2 === 0) {
    cypress(70, 260); cypress(330, 230);
    // (the paddlewheeler: a riverboat wreck aground, its stacks, its wheel, burning)
    const x = 200, Hl = ramp5(m('#E7E5E4')), Rd = ramp5(m('#9F1239'));
    block(g, x - 110, MG - 50, 220, 40, Hl); R(g, x - 110, MG - 24, 220, 4, Rd[2]);
    block(g, x - 80, MG - 96, 150, 46, Hl); block(g, x - 50, MG - 130, 90, 34, Hl);
    for (let k = 0; k < 8; k++) R(g, x - 74 + k * 18, MG - 86, 10, 14, k % 3 ? m('#1A1410') : '#FDBA74');
    for (const sx of [x - 30, x + 10]) { block(g, sx - 6, MG - 200, 12, 70, ramp5(m('#27272A'))); R(g, sx - 10, MG - 206, 20, 6, m('#3F3F46')); }
    ell(g, x + 120, MG - 50, 40, 40, INK); ell(g, x + 120, MG - 50, 36, 36, Rd[1]); for (let a = 0; a < 8; a++) stroke(g, [[x + 120, MG - 50], [x + 120 + Math.cos(a * 0.785) * 36, MG - 50 + Math.sin(a * 0.785) * 36]], 3, Rd[3]);
    g.font = '8px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = Rd[2]; g.fillText('BAYOU BELLE', x - 6, MG - 116); g.textAlign = 'left';
    sp.push([x - 30, MG - 206, 22, 40]); sp.push([x + 30, MG - 130, 50, 40]); sp.push([x - 80, MG - 96, 34, 30]);
  } else {
    cypress(200, 300);
    // (a stilt shack, lit windows, a water tower)
    const Wd = ramp5(m('#6B6458'));
    for (const lx of [40, 80, 120]) R(g, lx, MG - 80, 5, 80, Wd[0]);
    block(g, 30, MG - 160, 100, 80, Wd); for (let y = MG - 152; y < MG - 82; y += 8) R(g, 31, y, 98, 1, Wd[1]);
    poly(g, [[22, MG - 158], [80, MG - 196], [138, MG - 158]], INK); poly(g, [[26, MG - 160], [80, MG - 192], [134, MG - 160]], m('#4A4440'));
    R(g, 50, MG - 140, 16, 14, '#FDE68A'); R(g, 92, MG - 140, 16, 14, m('#1A1410'));
    const T = ramp5(m('#57534E'));
    for (const lx of [290, 340]) R(g, lx, MG - 180, 4, 180, T[0]);
    block(g, 276, MG - 260, 80, 80, T); poly(g, [[270, MG - 260], [316, MG - 290], [362, MG - 260]], T[1]);
    g.font = '8px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = T[4]; g.fillText('GATOR', 316, MG - 216); g.textAlign = 'left';
    sp.push([80, MG - 186, 40, 40]);
  }
};

const midTiki = (g: Ctx, j: number, sp: Spot[]) => {
  const Wd = ramp5(m('#7A4A26')), Th = ramp5(m('#A88A4A'));
  const tiki = (x: number, h: number, w: number) => {
    // (a giant tiki head: a carved log, stacked faces, the eyes lit by torches inside)
    block(g, x - w / 2, MG - h, w, h, Wd);
    const faces = Math.max(1, Math.floor(h / 90));
    for (let k = 0; k < faces; k++) {
      const y = MG - h + 10 + k * 90;
      R(g, x - w / 2 + 4, y, w - 8, 6, Wd[1]);
      for (const ex of [-w * 0.22, w * 0.22]) { R(g, x + ex - 10, y + 14, 20, 14, INK); R(g, x + ex - 7, y + 17, 14, 8, k === 0 ? '#FDBA74' : Wd[0]); }
      poly(g, [[x - 6, y + 30], [x - 12, y + 52], [x + 12, y + 52], [x + 6, y + 30]], Wd[3]);
      R(g, x - w * 0.35, y + 60, w * 0.7, 14, INK); for (let t = 0; t < 5; t++) R(g, x - w * 0.32 + t * w * 0.14, y + 62, w * 0.1, 6, Wd[4]);
    }
    poly(g, [[x - w / 2 - 14, MG - h], [x, MG - h - 30], [x + w / 2 + 14, MG - h]], Th[1]);
    sp.push([x, MG - h - 6, w * 0.8, 30]);
  };
  const hut = (x: number, y: number) => {
    for (const lx of [x - 30, x + 26]) R(g, lx, y, 5, MG - y, Wd[0]);
    block(g, x - 36, y - 40, 72, 40, ramp5(m('#9A7A4A'))); R(g, x - 8, y - 30, 16, 30, INK);
    poly(g, [[x - 52, y - 36], [x, y - 92], [x + 52, y - 36]], INK); poly(g, [[x - 48, y - 38], [x, y - 88], [x + 48, y - 38]], Th[2]);
    for (let k = 0; k < 7; k++) R(g, x - 44 + k * 14, y - 42, 2, 8, Th[0]);
    for (let k = 1; k < 4; k++) R(g, x - 48 + k * 10, y - 40 - k * 12, 96 - k * 20, 1, Th[3]);
  };
  if (j % 2 === 0) { tiki(90, 270, 70); hut(260, MG - 110); sp.push([260, MG - 196, 50, 40]); farPalm(g, 370, MG, 210, -16, sp); }
  else {
    // (the longhouse: an A-frame roof sweeping up to a point each end)
    const x = 200;
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 160, MG - 60); g.quadraticCurveTo(x - 120, MG - 120, x - 170, MG - 220); g.quadraticCurveTo(x, MG - 150, x + 170, MG - 220); g.quadraticCurveTo(x + 120, MG - 120, x + 160, MG - 60); g.fill();
    g.fillStyle = Th[2]; g.beginPath(); g.moveTo(x - 154, MG - 62); g.quadraticCurveTo(x - 116, MG - 120, x - 162, MG - 212); g.quadraticCurveTo(x, MG - 146, x + 162, MG - 212); g.quadraticCurveTo(x + 116, MG - 120, x + 154, MG - 62); g.fill();
    for (let k = 0; k < 10; k++) R(g, x - 140 + k * 30, MG - 150 + Math.abs(k - 4.5) * 6, 2, 80, Th[1]);
    block(g, x - 130, MG - 62, 260, 62, Wd); for (let k = 0; k < 6; k++) R(g, x - 110 + k * 44, MG - 50, 20, 30, k % 2 ? '#FDBA74' : INK);
    tiki(x - 160, 120, 34); tiki(x + 160, 120, 34);
    sp.push([x - 90, MG - 170, 50, 40]); sp.push([x + 60, MG - 160, 40, 34]);
  }
};

const midPirate = (g: Ctx, j: number, sp: Spot[]) => {
  const Hl = ramp5(m('#5A3A1E')), Sl = ramp5(m('#D6CFC0'));
  if (j % 2 === 0) {
    // (the galleon, run aground, listing, sails torn and burning, the jolly roger)
    const x = 200;
    g.save(); g.translate(x, MG); g.rotate(-0.06);
    poly(g, [[-170, -70], [150, -70], [180, -110], [190, -30], [120, 10], [-130, 10], [-180, -40]], INK);
    poly(g, [[-166, -68], [148, -68], [176, -104], [186, -32], [118, 6], [-128, 6], [-176, -40]], Hl[2]);
    poly(g, [[-166, -68], [148, -68], [176, -104], [178, -96], [-170, -60]], Hl[4]);
    for (let y = -56; y < 0; y += 10) R(g, -160, y, 330, 1, Hl[1]);
    for (let k = 0; k < 6; k++) { R(g, -120 + k * 44, -50, 12, 9, INK); R(g, -118 + k * 44, -48, 8, 5, k % 2 ? '#FDBA74' : '#1A1410'); }
    block(g, 110, -130, 70, 62, Hl);
    for (const [mx, mh] of [[-90, 250], [10, 290], [100, 220]] as const) {
      R(g, mx - 4, -70 - mh, 8, mh, Hl[0]); R(g, mx - 3, -70 - mh, 2, mh, Hl[3]);
      const sw = 56;
      for (const sy of [-60 - mh * 0.8, -60 - mh * 0.45]) { poly(g, [[mx - sw, sy], [mx + sw, sy], [mx + sw - 6, sy + 50], [mx - sw + 8, sy + 54]], INK); poly(g, [[mx - sw + 3, sy + 2], [mx + sw - 3, sy + 2], [mx + sw - 8, sy + 48], [mx - sw + 10, sy + 51]], Sl[2]); R(g, mx - sw + 3, sy + 2, sw * 2 - 6, 3, Sl[4]); ell(g, mx + 10, sy + 30, 12, 14, '#120A08'); R(g, mx - sw - 4, sy - 2, sw * 2 + 8, 3, Hl[1]); }
    }
    R(g, 6, -380, 26, 16, INK); ell(g, 19, -373, 4, 4, '#E7E5E4');
    g.restore();
    sp.push([x - 80, MG - 260, 50, 40]); sp.push([x + 30, MG - 300, 40, 40]); sp.push([x + 140, MG - 140, 40, 34]);
  } else {
    // (the fort: a stone wall with crenels, a cannon poking out each, a flag; a lighthouse behind, its lamp dark)
    const S = ramp5(m('#6B6458')), Lh = ramp5(m('#E7E5E4'));
    poly(g, [[290, MG], [300, MG - 300], [340, MG - 300], [350, MG]], INK);
    poly(g, [[292, MG], [302, MG - 298], [338, MG - 298], [348, MG]], Lh[2]);
    for (let k = 0; k < 4; k++) R(g, 300 - k * 1.5, MG - 260 + k * 70, 42 + k * 3, 22, m('#B91C1C'));
    block(g, 296, MG - 340, 48, 40, ramp5(m('#27272A'))); R(g, 304, MG - 332, 32, 24, '#FDBA74'); poly(g, [[290, MG - 340], [320, MG - 370], [350, MG - 340]], m('#7F1D1D'));
    block(g, 20, MG - 140, 250, 140, S); for (let y = MG - 130; y < MG; y += 16) for (let x = 20 + ((y / 16) % 2) * 16; x < 268; x += 32) R(g, x, y, 1, 16, S[1]);
    for (let k = 0; k < 7; k++) block(g, 24 + k * 36, MG - 162, 22, 22, S);
    for (let k = 0; k < 3; k++) { R(g, 50 + k * 80, MG - 100, 30, 10, INK); ell(g, 80 + k * 80, MG - 95, 5, 5, '#1A1410'); }
    R(g, 140, MG - 250, 3, 90, m('#27272A')); poly(g, [[143, MG - 250], [190, MG - 240], [143, MG - 226]], INK); ell(g, 160, MG - 239, 4, 4, '#D6D3D1');
    sp.push([60, MG - 160, 40, 30]); sp.push([220, MG - 162, 30, 26]);
    farPalm(g, 380, MG, 170, -20, sp);
  }
};

const midOasis = (g: Ctx, j: number, sp: Spot[]) => {
  const Sd = ramp5(m('#C2A05A')), St = ramp5(m('#B8955A'));
  // (the dunes behind: humps of sand in bands)
  for (let k = 0; k < 3; k++) { const cx = 60 + k * 150 + (j % 2) * 40; ell(g, cx, MG + 20, 130, 90, INK, Math.PI, 0); ell(g, cx, MG + 20, 128, 88, Sd[1], Math.PI, 0); ell(g, cx - 20, MG + 20, 90, 70, Sd[2], Math.PI, 0); checker(g, cx - 100, MG - 50, 120, 6, Sd[3]); }
  if (j % 2 === 0) {
    // (the pyramid: stepped courses, its lit face and shaded face, a crack; the capstone gold)
    const x = 220, h = 300;
    poly(g, [[x - 190, MG], [x, MG - h], [x + 190, MG]], INK);
    poly(g, [[x - 186, MG], [x, MG - h + 4], [x, MG]], St[3]); poly(g, [[x, MG - h + 4], [x + 186, MG], [x, MG]], St[1]);
    for (let y = MG - h + 20; y < MG; y += 14) { const hw = ((y - (MG - h)) / h) * 186; R(g, x - hw, y, hw, 1, St[2]); R(g, x, y, hw, 1, St[0]); }
    poly(g, [[x - 18, MG - h + 36], [x, MG - h + 4], [x + 18, MG - h + 36]], m('#EAB308'));
    stroke(g, [[x + 40, MG - 180], [x + 30, MG - 140], [x + 52, MG - 100]], 2, INK);
    R(g, x - 16, MG - 40, 32, 40, INK);
    sp.push([x + 70, MG - 120, 40, 34]);
    farPalm(g, 40, MG, 160, 16, sp, MD); farPalm(g, 70, MG, 130, -14, sp, MD);
  } else {
    // (the sphinx, lying, a pair of shades on, its nose knocked off; a striped tent, a date palm)
    const x = 180, Sx = ramp5(m('#C8A468'));
    block(g, x - 140, MG - 60, 260, 60, Sx);
    block(g, x + 70, MG - 170, 80, 110, Sx);
    poly(g, [[x + 56, MG - 170], [x + 110, MG - 200], [x + 164, MG - 170], [x + 170, MG - 90], [x + 150, MG - 90], [x + 150, MG - 150], [x + 70, MG - 150], [x + 70, MG - 90], [x + 50, MG - 90]], m('#1E3A8A'));
    for (let k = 0; k < 6; k++) R(g, x + 54 + k * 20, MG - 168, 6, 70, m('#EAB308'));
    block(g, x + 84, MG - 148, 52, 88, Sx);
    R(g, x + 86, MG - 132, 48, 10, INK); R(g, x + 90, MG - 130, 18, 6, '#60A5FA'); R(g, x + 114, MG - 130, 18, 6, '#60A5FA');
    R(g, x + 100, MG - 96, 20, 4, Sx[0]);
    for (const px of [x - 130, x + 90]) block(g, px, MG - 22, 40, 22, Sx);
    // (the tent)
    poly(g, [[300, MG], [350, MG - 110], [400, MG]], INK); for (let k = 0; k < 4; k++) poly(g, [[304 + k * 24, MG], [350, MG - 106], [316 + k * 24, MG]], k % 2 ? m('#DC2626') : m('#F5F5F4'));
    sp.push([x - 60, MG - 60, 50, 30]); sp.push([350, MG - 108, 30, 30]);
    farPalm(g, 20, MG, 170, 20, sp, MD);
  }
};

const midCaves = (g: Ctx, j: number, sp: Spot[]) => {
  // (under the rock: the whole tile's cave, its far wall in banded rock, the ceiling hung with stalactites, crystal
  // clusters glowing violet and cyan, glowworms' dots)
  const Rk = ramp5(m('#3A3048'));
  R(g, 0, 0, MID_W, MID_H, Rk[1]);
  for (let y = 0; y < MID_H; y += 30) for (let x = ((y / 30) % 2) * 40 - 40; x < MID_W; x += 80) { ell(g, x + 40, y + 14, 44, 16, Rk[2]); R(g, x + 14, y + 2, 40, 2, Rk[3]); checker(g, x + 6, y + 22, 60, 4, Rk[0]); }
  for (let k = 0; k < 12; k++) { const x = k * 36 + hash(j + k) * 20, h = 40 + hash(j * 3 + k) * 90; poly(g, [[x - 12, 0], [x + 12, 0], [x + 1, h]], INK); poly(g, [[x - 10, 0], [x + 10, 0], [x + 1, h - 3]], Rk[2]); poly(g, [[x - 10, 0], [x - 2, 0], [x, h - 6]], Rk[3]); }
  for (let k = 0; k < 6; k++) { const x = 30 + k * 66 + hash(j * 7 + k) * 20, h = 40 + hash(k + j) * 70; poly(g, [[x - 18, MG], [x + 1, MG - h], [x + 18, MG]], INK); poly(g, [[x - 16, MG], [x + 1, MG - h + 3], [x + 16, MG]], Rk[2]); poly(g, [[x - 16, MG], [x + 1, MG - h + 3], [x - 2, MG]], Rk[3]); }
  for (let k = 0; k < 4; k++) {
    const x = 50 + k * 100 + hash(j * 11 + k) * 30, y = 140 + hash(j + k * 5) * 220, col = k % 2 ? '#22D3EE' : '#C084FC', Cr = ramp5(col);
    for (let c = 0; c < 4; c++) { const a = -Math.PI / 2 + (c - 1.5) * 0.4, len = 22 + c * 6; const tip: P = [x + Math.cos(a) * len, y + Math.sin(a) * len]; poly(g, [[x - 5, y], tip, [x + 5, y]], INK); poly(g, [[x - 4, y], tip, [x, y]], Cr[3]); poly(g, [[x, y], tip, [x + 4, y]], Cr[1]); }
    ell(g, x, y, 12, 4, Cr[0]);
  }
  for (let k = 0; k < 40; k++) R(g, hash(j * 13 + k) * MID_W, hash(j * 17 + k) * 200, 1, 1, k % 3 ? '#A5F3FC' : '#E0F2FE');
  void sp;
};

const midGrotto = (g: Ctx, j: number, sp: Spot[]) => {
  // (purple rock cliffs, skull-ish knobs worn into them, a few bones, candles burning in niches)
  const Rk = ramp5(m('#4A2A5A'));
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, MG); for (let x = 0; x <= MID_W; x += 20) g.lineTo(x, MG - 260 - Math.sin(x * 0.02 + j) * 60 - hash(x + j) * 30); g.lineTo(MID_W, MG); g.fill();
  g.fillStyle = Rk[2]; g.beginPath(); g.moveTo(0, MG); for (let x = 0; x <= MID_W; x += 20) g.lineTo(x, MG - 256 - Math.sin(x * 0.02 + j) * 60 - hash(x + j) * 30); g.lineTo(MID_W, MG); g.fill();
  for (let y = MG - 300; y < MG; y += 26) checker(g, 0, y, MID_W, 4, Rk[1]);
  for (let k = 0; k < 3; k++) { const x = 60 + k * 130, y = MG - 140 - (k % 2) * 50; ell(g, x, y, 24, 22, Rk[3]); ell(g, x - 8, y, 6, 7, INK); ell(g, x + 8, y, 6, 7, INK); R(g, x - 8, y + 12, 16, 4, INK); R(g, x - 4, y - 40, 8, 10, INK); R(g, x - 2, y - 38, 4, 6, '#F5F0E6'); sp.push([x, y - 40, 8, 12]); }
};

const midBack = (g: Ctx, j: number, sp: Spot[]) => {
  // (the backs of the theming: plywood flats on 2x4 braces, a cutout palm's back, scaffold, a water tank, a light
  // tower; the park's lights beyond)
  const Pw = ramp5(m('#A8906A')), Sc = ramp5(m('#71717A'));
  for (let k = 0; k < 3; k++) {
    const x = 20 + k * 130, h = 160 + hash(j * 3 + k) * 80;
    block(g, x, MG - h, 110, h, Pw);
    for (let y = MG - h + 40; y < MG; y += 40) R(g, x, y, 110, 2, Pw[1]);
    stroke(g, [[x + 110, MG - h + 20], [x + 150, MG]], 5, Pw[0]); stroke(g, [[x + 110, MG - h + 20], [x + 150, MG]], 3, Pw[3]);
    g.font = '8px "Press Start 2P"'; g.fillStyle = m('#1A1410'); g.fillText(['FLAT 7', 'RUINS B', 'TIKI 3', 'COVE 2', 'GATOR 4', 'OASIS A', 'FLAT 12', 'CANOPY 9'][(j * 3 + k) % 8], x + 10, MG - h + 20);
  }
  if (j % 2 === 0) { for (const lx of [300, 360]) R(g, lx, MG - 300, 4, 300, Sc[1]); for (let y = MG - 290; y < MG; y += 40) { R(g, 300, y, 64, 3, Sc[2]); stroke(g, [[300, y], [364, y + 40]], 2, Sc[0]); } block(g, 286, MG - 340, 92, 50, ramp5(m('#52525B'))); g.font = '8px "Press Start 2P"'; g.fillStyle = Sc[4]; g.fillText('H2O', 316, MG - 310); }
  else { R(g, 330, MG - 360, 6, 360, Sc[1]); block(g, 300, MG - 380, 66, 26, Sc); for (let k = 0; k < 4; k++) R(g, 304 + k * 16, MG - 376, 12, 18, '#FEF3C7'); }
  void sp;
};

const MIDS: Record<ZoneId, (g: Ctx, j: number, sp: Spot[]) => void> = {
  head: midHead, ruins: midRuins, canopy: midCanopy, bayou: midBayou, tiki: midTiki, pirate: midPirate, oasis: midOasis, caves: midCaves, grotto: midGrotto, back: midBack,
};
/** Every other pair of tiles mirrored (where there are no words on it): a zone's four or so tiles never read A B A B. */
const mirrored = (z: ZoneId, j: number) => j % 4 >= 2 && z !== 'head' && z !== 'bayou' && z !== 'back';
const paintMid = (g: Ctx, z: ZoneId, j: number, sp: Spot[]) => {
  g.save(); if (mirrored(z, j)) { g.translate(MID_W, 0); g.scale(-1, 1); }
  MIDS[z](g, j, sp);
  g.restore();
  // (the caves' rock, where the next tile over isn't the caves: a ragged edge of it, the cave's mouth, not a cut)
  if (z === 'caves') for (const side of [-1, 1] as const) {
    if (zoneAt(midX(j + side)) === 'caves') continue;
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); const x0 = side < 0 ? 0 : MID_W; g.moveTo(x0, 0);
    for (let y = 0; y <= MID_H; y += 20) { const d = 30 + Math.sin(y * 0.05 + j) * 22 + hash(y + j) * 18 - (y > MG - 140 ? (y - MG + 140) * 0.6 : 0); g.lineTo(x0 - side * Math.max(0, d), y); }
    g.lineTo(x0, MID_H); g.closePath(); g.fill();
    g.globalCompositeOperation = 'source-over';
  }
  if (z !== 'caves') nightWash(g, MID_W, MID_H, MG);
};

/** Spots recorded off a painter, without painting (run once against a 1x1 canvas, kept). */
const SPOTS = new Map<string, Spot[]>();
const spotsOf = (key: string, paint: (g: Ctx, sp: Spot[]) => void): Spot[] => {
  let s = SPOTS.get(key);
  if (!s) { s = []; if (typeof document !== 'undefined') { const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; paint(cv.getContext('2d')!, s); } SPOTS.set(key, s); }
  return s;
};

/** Screen space (in the backdrop): the zones' far landmarks, parallax, their fires. `from`: no tile for world before it
 *  (level 1's stretch). */
export const drawZoneMid = (c: Ctx, state: GameState, from: number) => {
  const f = state.frame, L = state.camera.x * PAR, dy = 0;
  const tod = timeOfDay().key;
  for (let j = Math.floor(L / MID_W); j * MID_W < L + W; j++) {
    const X = midX(j);
    if (X < from) continue;
    const z = zoneAt(X), sx = Math.round(j * MID_W - L), key = `wp2-mid-${z}-${j}-${tod}`;
    c.save(); c.translate(sx, dy);
    stamp(c, key, 0, 0, MID_W, MID_H, g => paintMid(g, z, j, []));
    for (const [x0, y, w, h] of spotsOf(`${z}-${j}`, (g, sp) => MIDS[z](g, j, sp))) { const x = mirrored(z, j) ? MID_W - x0 : x0; fireRow(c, x - w / 2, x + w / 2, y, h, f, Math.max(8, w / 3), j * 7 + Math.round(x)); }
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The near bank (world): the river's far side, its face to the far water, the props on its top

const BANK_TOP = GY - 24, BANK_FOOT = GY + 16, BANK_H = 300;
const BD = 0.34;
const b = (col: string) => nt(col, BD);

/** The bank's face from its top down to the far water: `face` paints it (its own material), the far water under it
 *  (dark, banded, the fire's glimmer on it). */
const bankFace = (g: Ctx, face: () => void) => {
  face();
  R(g, 0, BANK_FOOT, BANK_T, RIVER_Y - BANK_FOOT + 200, '#1C0A08');
  R(g, 0, BANK_FOOT, BANK_T, 2, '#5A1E0A');
  for (let x = 0; x < BANK_T; x += 12) R(g, x + ((x / 12) % 3) * 3, BANK_FOOT + 6 + ((x / 12) % 2) * 6, 6, 1, '#7A2A0A');
};
const stoneFace = (g: Ctx, col: string, course = 16, brick = 34) => {
  const S = ramp5(b(col));
  R(g, 0, BANK_TOP, BANK_T, BANK_FOOT - BANK_TOP, S[1]);
  for (let y = BANK_TOP, n = 0; y < BANK_FOOT; y += course, n++) for (let x = -(n % 2) * (brick / 2); x < BANK_T; x += brick) { R(g, x + 1, y + 1, brick - 2, course - 2, S[2]); R(g, x + 1, y + 1, brick - 2, 1, S[3]); R(g, x + brick - 2, y + 1, 1, course - 2, S[0]); }
  R(g, 0, BANK_TOP, BANK_T, 2, S[3]);
};

const bankHead = (g: Ctx, k: number, sp: Spot[]) => {
  // (the pool deck's wall, blue tile coping; loungers, an umbrella or two, a lifeguard chair, tube stacks)
  bankFace(g, () => { const T = ramp5(b('#94A3B8')); R(g, 0, BANK_TOP, BANK_T, BANK_FOOT - BANK_TOP, T[2]); R(g, 0, BANK_TOP, BANK_T, 6, b('#0E7490')); for (let x = 0; x < BANK_T; x += 12) R(g, x, BANK_TOP, 1, 6, b('#155E75')); for (let x = 0; x < BANK_T; x += 24) R(g, x, BANK_TOP + 6, 1, 34, T[1]); });
  const C = ['#EC4899', '#22D3EE', '#FACC15', '#A3E635'];
  for (let i = 0; i < 3; i++) {
    const x = 50 + i * 150 + hash(k + i) * 40, col = ramp5(b(C[(k + i) % 4]));
    // (an umbrella, its pole, a lounger under; one of them on fire)
    R(g, x - 1, BANK_TOP - 90, 3, 90, b('#D4D4D8'));
    poly(g, [[x - 50, BANK_TOP - 80], [x, BANK_TOP - 104], [x + 50, BANK_TOP - 80]], INK);
    for (let s = 0; s < 4; s++) poly(g, [[x - 48 + s * 24, BANK_TOP - 81], [x, BANK_TOP - 102], [x - 24 + s * 24, BANK_TOP - 81]], s % 2 ? col[3] : b('#F5F5F4'));
    R(g, x + 10, BANK_TOP - 16, 50, 6, INK); R(g, x + 11, BANK_TOP - 15, 48, 4, col[2]); poly(g, [[x + 50, BANK_TOP - 15], [x + 62, BANK_TOP - 34], [x + 64, BANK_TOP - 30], [x + 56, BANK_TOP - 12]], col[1]);
    for (const lx of [x + 14, x + 54]) R(g, lx, BANK_TOP - 10, 2, 10, INK);
    if ((k + i) % 3 === 0) sp.push([x, BANK_TOP - 84, 50, 30]);
  }
};

const bankRuins = (g: Ctx, k: number, sp: Spot[]) => {
  bankFace(g, () => stoneFace(g, '#8A7A5A', 18, 40));
  const S = ramp5(b('#9A8A6A')), Mo = ramp5(b('#3F6A2A'));
  // (moss down the face)
  for (let x = 10; x < BANK_T; x += 46) { R(g, x, BANK_TOP, 10 + (x % 7), 6 + (x % 13), Mo[2]); checker(g, x - 4, BANK_TOP + 4, 18, 12, Mo[1]); }
  // (a fallen column, a standing one broken off, an idol with glowing eyes; a burning palm)
  const v = Math.floor(hash(k * 3.7 + 1) * 4);
  block(g, 30 + v * 10, BANK_TOP - 22, 120, 22, S); for (let x = 40 + v * 10; x < 146 + v * 10; x += 10) R(g, x, BANK_TOP - 20, 1, 18, S[1]); ell(g, 150 + v * 10, BANK_TOP - 11, 6, 11, S[0]);
  const cx = 250 + v * 20, h = 110 + v * 18; block(g, cx - 16, BANK_TOP - h, 32, h, S); block(g, cx - 22, BANK_TOP - 14, 44, 14, S);
  poly(g, [[cx - 16, BANK_TOP - h], [cx - 6, BANK_TOP - h - 12], [cx + 4, BANK_TOP - h - 4], [cx + 16, BANK_TOP - h - 14], [cx + 16, BANK_TOP - h]], S[2]);
  for (let x = cx - 10; x < cx + 14; x += 7) R(g, x, BANK_TOP - h + 4, 1, h - 20, S[1]);
  const ix = 400 - v * 12; block(g, ix - 20, BANK_TOP - 70, 40, 70, ramp5(b('#6A6450'))); R(g, ix - 14, BANK_TOP - 58, 10, 6, INK); R(g, ix + 4, BANK_TOP - 58, 10, 6, INK); R(g, ix - 12, BANK_TOP - 57, 6, 3, '#FDBA74'); R(g, ix + 6, BANK_TOP - 57, 6, 3, '#FDBA74'); R(g, ix - 10, BANK_TOP - 36, 20, 6, INK);
  farPalm(g, 200 - v * 14, BANK_TOP, 210 + v * 10, 26 - v * 14, sp, BD);
};

const bankCanopy = (g: Ctx, k: number, sp: Spot[]) => {
  // (an earth bank knotted with roots, ferns on top, a giant root arching up out of it, a lantern post, a fallen hut)
  bankFace(g, () => { const E = ramp5(b('#4A3424')); R(g, 0, BANK_TOP, BANK_T, BANK_FOOT - BANK_TOP, E[1]); checker(g, 0, BANK_TOP + 10, BANK_T, 20, E[2]); for (let x = 0; x < BANK_T; x += 30) stroke(g, [[x, BANK_TOP + 2], [x + 10, BANK_TOP + 20], [x + 4, BANK_FOOT]], 3, E[3]); });
  const Rt = ramp5(b('#5A4030')), F = ramp5(b('#2A5A2A'));
  const v = k % 4, rx = 120 + v * 50;
  stroke(g, [[rx - 60, BANK_TOP], [rx - 40, BANK_TOP - 110], [rx + 30, BANK_TOP - 130], [rx + 70, BANK_TOP]], 18, INK);
  stroke(g, [[rx - 60, BANK_TOP], [rx - 40, BANK_TOP - 110], [rx + 30, BANK_TOP - 130], [rx + 70, BANK_TOP]], 14, Rt[2]);
  stroke(g, [[rx - 62, BANK_TOP], [rx - 42, BANK_TOP - 112], [rx + 28, BANK_TOP - 133]], 4, Rt[3]);
  for (let i = 0; i < 10; i++) { const fx = i * 50 + hash(k * 3 + i) * 30, fh = 20 + hash(k + i) * 24; for (let a = -2; a <= 2; a++) stroke(g, [[fx, BANK_TOP], [fx + a * 8, BANK_TOP - fh], [fx + a * 14, BANK_TOP - fh + 8]], 3, a % 2 ? F[1] : F[2]); }
  const lx = 420 - v * 30; R(g, lx, BANK_TOP - 120, 4, 120, Rt[1]); R(g, lx - 8, BANK_TOP - 120, 20, 3, Rt[0]); R(g, lx + 6, BANK_TOP - 116, 8, 12, INK); R(g, lx + 7, BANK_TOP - 115, 6, 10, '#FDBA74');
  if (v % 2) { poly(g, [[300, BANK_TOP], [330, BANK_TOP - 50], [390, BANK_TOP - 40], [380, BANK_TOP]], b('#8A6A3A')); poly(g, [[296, BANK_TOP - 30], [350, BANK_TOP - 80], [400, BANK_TOP - 46]], b('#A88A4A')); sp.push([350, BANK_TOP - 50, 50, 40]); }
  sp.push([rx, BANK_TOP - 128, 30, 26]);
};

const bankBayou = (g: Ctx, k: number, sp: Spot[]) => {
  bankFace(g, () => { const M = ramp5(b('#3A3424')); R(g, 0, BANK_TOP, BANK_T, BANK_FOOT - BANK_TOP, M[1]); checker(g, 0, BANK_TOP + 4, BANK_T, 30, M[0]); R(g, 0, BANK_TOP, BANK_T, 3, M[3]); });
  const Ct = ramp5(b('#5A6A3A')), Gt = ramp5(b('#3F5A2A')), Wd = ramp5(b('#6B6458'));
  // (cattails, cypress knees)
  for (let i = 0; i < 14; i++) { const x = i * 34 + hash(k + i) * 20, h = 26 + hash(k * 7 + i) * 30; R(g, x, BANK_TOP - h, 2, h, Ct[2]); R(g, x - 1, BANK_TOP - h, 4, 9, b('#5A3A1E')); }
  for (let i = 0; i < 5; i++) { const x = 30 + i * 96 + hash(k * 3 + i) * 30; poly(g, [[x - 8, BANK_TOP + 2], [x, BANK_TOP - 18 - (i % 3) * 6], [x + 8, BANK_TOP + 2]], Wd[1]); }
  const v = Math.floor(hash(k * 3.7 + 1) * 4);
  if (v === 1) {
    // (the gift shack on stilts: BAYOU GIFTS, gator heads for sale, its porch burning)
    for (const lx of [150, 200, 250, 300]) R(g, lx, BANK_TOP - 50, 6, 50, Wd[0]);
    block(g, 140, BANK_TOP - 160, 170, 110, Wd); for (let y = BANK_TOP - 150; y < BANK_TOP - 52; y += 9) R(g, 141, y, 168, 1, Wd[1]);
    poly(g, [[128, BANK_TOP - 156], [225, BANK_TOP - 200], [322, BANK_TOP - 156]], INK); poly(g, [[132, BANK_TOP - 158], [225, BANK_TOP - 196], [318, BANK_TOP - 158]], b('#57534E'));
    block(g, 160, BANK_TOP - 150, 130, 22, ramp5(b('#CA8A04'))); g.font = '8px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = INK; g.fillText('BAYOU GIFTS', 225, BANK_TOP - 135); g.textAlign = 'left';
    R(g, 170, BANK_TOP - 116, 30, 26, '#FDBA74'); R(g, 250, BANK_TOP - 116, 30, 26, '#1A1410'); R(g, 214, BANK_TOP - 110, 22, 58, INK);
    for (let i = 0; i < 3; i++) { const gx = 176 + i * 9; R(g, gx, BANK_TOP - 104, 6, 4, Gt[3]); }
    sp.push([280, BANK_TOP - 160, 50, 40]);
  } else {
    // (a fake gator, half up the bank, mouth open; a rowboat on its side)
    const gx = 90 + v * 60;
    poly(g, [[gx - 70, BANK_TOP], [gx - 40, BANK_TOP - 18], [gx + 30, BANK_TOP - 20], [gx + 60, BANK_TOP - 14], [gx + 90, BANK_TOP - 26], [gx + 92, BANK_TOP - 18], [gx + 64, BANK_TOP - 6], [gx + 90, BANK_TOP - 4], [gx + 60, BANK_TOP]], INK);
    poly(g, [[gx - 66, BANK_TOP - 1], [gx - 38, BANK_TOP - 16], [gx + 30, BANK_TOP - 18], [gx + 58, BANK_TOP - 12], [gx + 86, BANK_TOP - 23], [gx + 60, BANK_TOP - 6], [gx + 58, BANK_TOP - 1]], Gt[2]);
    for (let x = gx - 30; x < gx + 30; x += 8) R(g, x, BANK_TOP - 20, 4, 3, Gt[3]);
    R(g, gx + 40, BANK_TOP - 18, 3, 3, '#FDE047');
    const bx = 330 - v * 20; ell(g, bx, BANK_TOP - 18, 50, 18, INK, Math.PI, 0); ell(g, bx, BANK_TOP - 18, 47, 16, Wd[2], Math.PI, 0); R(g, bx - 50, BANK_TOP - 20, 100, 4, Wd[0]);
    sp.push([bx - 20, BANK_TOP - 30, 30, 24]);
  }
};

const bankTiki = (g: Ctx, k: number, sp: Spot[]) => {
  bankFace(g, () => { const Bm = ramp5(b('#A8843E')); R(g, 0, BANK_TOP, BANK_T, BANK_FOOT - BANK_TOP, Bm[1]); for (let x = 0; x < BANK_T; x += 10) { R(g, x, BANK_TOP, 8, BANK_FOOT - BANK_TOP, Bm[2]); R(g, x, BANK_TOP, 2, BANK_FOOT - BANK_TOP, Bm[3]); for (let y = BANK_TOP + 10 + (x % 3) * 3; y < BANK_FOOT; y += 14) R(g, x, y, 8, 1, Bm[0]); } R(g, 0, BANK_TOP + 6, BANK_T, 3, b('#5A3A1E')); });
  const Wd = ramp5(b('#7A4A26')), Th = ramp5(b('#A88A4A'));
  // (tiki torches along it, burning; masks on posts; a little grass hut)
  for (let i = 0; i < 4; i++) { const x = 40 + i * 120; R(g, x - 2, BANK_TOP - 90, 5, 90, Wd[1]); R(g, x - 6, BANK_TOP - 96, 13, 10, INK); R(g, x - 5, BANK_TOP - 95, 11, 8, Wd[3]); for (let y = BANK_TOP - 80; y < BANK_TOP; y += 12) R(g, x - 2, y, 5, 2, Wd[0]); sp.push([x, BANK_TOP - 94, 14, 24]); }
  const v = Math.floor(hash(k * 3.7 + 1) * 4);
  for (let i = 0; i < 2; i++) { const x = 100 + i * 240 + v * 6; R(g, x - 2, BANK_TOP - 60, 4, 60, Wd[0]); block(g, x - 16, BANK_TOP - 104, 32, 44, Wd); R(g, x - 10, BANK_TOP - 94, 7, 6, INK); R(g, x + 3, BANK_TOP - 94, 7, 6, INK); R(g, x - 10, BANK_TOP - 74, 20, 6, INK); for (let t = 0; t < 4; t++) R(g, x - 9 + t * 5, BANK_TOP - 73, 3, 3, Wd[4]); }
  if (v % 2 === 0) { const x = 230; block(g, x - 36, BANK_TOP - 50, 72, 50, ramp5(b('#9A7A4A'))); R(g, x - 8, BANK_TOP - 36, 16, 36, INK); poly(g, [[x - 54, BANK_TOP - 44], [x, BANK_TOP - 100], [x + 54, BANK_TOP - 44]], INK); poly(g, [[x - 50, BANK_TOP - 46], [x, BANK_TOP - 96], [x + 50, BANK_TOP - 46]], Th[2]); for (let n = 1; n < 4; n++) R(g, x - 50 + n * 10, BANK_TOP - 46 - n * 12, 100 - n * 20, 1, Th[3]); sp.push([x + 16, BANK_TOP - 70, 34, 30]); }
};

const bankPirate = (g: Ctx, k: number, sp: Spot[]) => {
  bankFace(g, () => { const Wd = ramp5(b('#5A3A1E')); R(g, 0, BANK_TOP, BANK_T, BANK_FOOT - BANK_TOP, Wd[0]); for (let x = 0; x < BANK_T; x += 40) { R(g, x, BANK_TOP, 12, BANK_FOOT - BANK_TOP, Wd[2]); R(g, x, BANK_TOP, 3, BANK_FOOT - BANK_TOP, Wd[3]); } R(g, 0, BANK_TOP, BANK_T, 8, Wd[2]); R(g, 0, BANK_TOP, BANK_T, 2, Wd[4]); for (let x = 0; x < BANK_T; x += 24) R(g, x, BANK_TOP, 1, 8, Wd[0]); });
  const Br = ramp5(b('#7A4A22')), Fe = ramp5(b('#3F3F46')), Gd = ramp5(b('#CA8A04'));
  const v = Math.floor(hash(k * 3.7 + 1) * 4);
  // (barrels, crates, a cannon on its carriage, an anchor, a spilled chest of gold)
  for (let i = 0; i < 3; i++) { const x = 30 + i * 34 + v * 8; block(g, x, BANK_TOP - 34, 28, 34, Br); R(g, x, BANK_TOP - 26, 28, 3, Fe[2]); R(g, x, BANK_TOP - 10, 28, 3, Fe[2]); }
  block(g, 50 + v * 8, BANK_TOP - 64, 28, 30, Br);
  for (let i = 0; i < 2; i++) { const x = 160 + i * 44; block(g, x, BANK_TOP - 40, 40, 40, ramp5(b('#8A6A3A'))); stroke(g, [[x + 2, BANK_TOP - 38], [x + 38, BANK_TOP - 2]], 2, b('#5A4020')); }
  const cx = 290 + v * 10; R(g, cx - 20, BANK_TOP - 14, 50, 14, Br[1]); ell(g, cx - 10, BANK_TOP - 4, 8, 8, Br[0]); ell(g, cx + 22, BANK_TOP - 4, 8, 8, Br[0]); g.save(); g.translate(cx, BANK_TOP - 22); g.rotate(-0.25); block(g, -10, -9, 60, 18, Fe); R(g, 46, -11, 6, 22, Fe[0]); g.restore();
  const ax = 410 - v * 10; R(g, ax - 3, BANK_TOP - 70, 6, 60, Fe[2]); ell(g, ax, BANK_TOP - 74, 8, 8, INK); ell(g, ax, BANK_TOP - 74, 5, 5, Fe[1]); stroke(g, [[ax - 24, BANK_TOP - 30], [ax - 20, BANK_TOP - 10], [ax, BANK_TOP - 6], [ax + 20, BANK_TOP - 10], [ax + 24, BANK_TOP - 30]], 5, Fe[2]);
  if (v % 2) { block(g, 210, BANK_TOP - 70, 40, 26, ramp5(b('#6B3A1A'))); for (let i = 0; i < 12; i++) ell(g, 200 + hash(i) * 70, BANK_TOP - 44 + hash(i + 3) * 6, 4, 2, Gd[3]); }
  sp.push([60 + v * 8, BANK_TOP - 62, 30, 26]); sp.push([180, BANK_TOP - 38, 40, 30]);
};

const bankOasis = (g: Ctx, k: number, sp: Spot[]) => {
  bankFace(g, () => stoneFace(g, '#C2A05A', 14, 28));
  const Sd = ramp5(b('#D6B46A')), Cl = ramp5(b('#B4643A'));
  for (let i = 0; i < 4; i++) { const x = 60 + i * 120 + hash(k + i) * 30; ell(g, x, BANK_TOP + 2, 60, 14, Sd[2], Math.PI, 0); checker(g, x - 40, BANK_TOP - 8, 60, 4, Sd[3]); }
  const v = Math.floor(hash(k * 3.7 + 1) * 4);
  // (clay pots, a camel statue (one hump knocked off), a date palm burning, a striped awning)
  for (let i = 0; i < 3; i++) { const x = 40 + i * 26 + v * 10; ell(g, x, BANK_TOP - 14, 11, 14, INK); ell(g, x, BANK_TOP - 14, 10, 13, Cl[2]); ell(g, x - 3, BANK_TOP - 18, 4, 6, Cl[3]); R(g, x - 5, BANK_TOP - 30, 10, 4, Cl[1]); }
  const cx = 230 + v * 20, Cm = ramp5(b('#B8955A'));
  block(g, cx - 40, BANK_TOP - 60, 80, 26, Cm); ell(g, cx - 6, BANK_TOP - 62, 18, 12, Cm[2], Math.PI, 0);
  for (const lx of [cx - 34, cx - 20, cx + 20, cx + 32]) R(g, lx, BANK_TOP - 36, 6, 36, Cm[1]);
  stroke(g, [[cx + 36, BANK_TOP - 50], [cx + 52, BANK_TOP - 80], [cx + 64, BANK_TOP - 84]], 8, Cm[2]); R(g, cx + 58, BANK_TOP - 88, 3, 3, INK);
  farPalm(g, 400 - v * 20, BANK_TOP, 180, -20, sp, BD);
  if (v % 2) { poly(g, [[110, BANK_TOP - 80], [190, BANK_TOP - 80], [196, BANK_TOP - 66], [104, BANK_TOP - 66]], INK); for (let s = 0; s < 6; s++) R(g, 106 + s * 15, BANK_TOP - 78, 15, 10, s % 2 ? b('#DC2626') : b('#F5F5F4')); R(g, 108, BANK_TOP - 66, 3, 66, Cm[0]); R(g, 190, BANK_TOP - 66, 3, 66, Cm[0]); sp.push([150, BANK_TOP - 80, 40, 26]); }
};

const bankCaves = (g: Ctx, k: number, sp: Spot[]) => {
  bankFace(g, () => { const Rk = ramp5(b('#3A3048')); R(g, 0, BANK_TOP, BANK_T, BANK_FOOT - BANK_TOP, Rk[1]); for (let x = 0; x < BANK_T; x += 36) { ell(g, x + 18, BANK_TOP + 14, 22, 12, Rk[2]); R(g, x + 6, BANK_TOP + 4, 18, 2, Rk[3]); } });
  const Rk = ramp5(b('#4A3C5A'));
  for (let i = 0; i < 6; i++) { const x = 20 + i * 80 + hash(k * 3 + i) * 30, h = 40 + hash(k + i) * 80; poly(g, [[x - 20, BANK_TOP], [x, BANK_TOP - h], [x + 20, BANK_TOP]], INK); poly(g, [[x - 18, BANK_TOP], [x, BANK_TOP - h + 3], [x + 18, BANK_TOP]], Rk[2]); poly(g, [[x - 18, BANK_TOP], [x, BANK_TOP - h + 3], [x - 3, BANK_TOP]], Rk[3]); }
  for (let i = 0; i < 3; i++) {
    const x = 60 + i * 150 + hash(k * 5 + i) * 40, col = (i + k) % 2 ? '#22D3EE' : '#C084FC', Cr = ramp5(col);
    for (let c = 0; c < 5; c++) { const a = -Math.PI / 2 + (c - 2) * 0.35, len = 18 + (c % 3) * 10; const tip: P = [x + Math.cos(a) * len, BANK_TOP + Math.sin(a) * len]; poly(g, [[x - 5, BANK_TOP], tip, [x + 5, BANK_TOP]], INK); poly(g, [[x - 4, BANK_TOP], tip, [x, BANK_TOP]], Cr[3]); poly(g, [[x, BANK_TOP], tip, [x + 4, BANK_TOP]], Cr[1]); }
  }
  void sp;
};

const bankGrotto = (g: Ctx, k: number, sp: Spot[]) => {
  bankFace(g, () => { const Rk = ramp5(b('#3A2048')); R(g, 0, BANK_TOP, BANK_T, BANK_FOOT - BANK_TOP, Rk[1]); checker(g, 0, BANK_TOP + 6, BANK_T, 14, Rk[2]); R(g, 0, BANK_TOP, BANK_T, 2, Rk[3]); });
  const Bn = ramp5(b('#E7E0D0')), Rk = ramp5(b('#4A2A5A'));
  for (let i = 0; i < 4; i++) { const x = 40 + i * 120 + hash(k + i) * 30; ell(g, x, BANK_TOP, 44, 40 + (i % 2) * 20, INK, Math.PI, 0); ell(g, x, BANK_TOP, 42, 38 + (i % 2) * 20, Rk[2], Math.PI, 0); ell(g, x - 10, BANK_TOP - 14, 20, 14, Rk[3], Math.PI, 0); }
  for (let i = 0; i < 5; i++) { const x = 30 + i * 90 + hash(k * 9 + i) * 20; R(g, x, BANK_TOP - 4, 18, 3, Bn[2]); ell(g, x, BANK_TOP - 3, 3, 3, Bn[3]); ell(g, x + 18, BANK_TOP - 3, 3, 3, Bn[3]); }
  for (let i = 0; i < 3; i++) { const x = 80 + i * 150; ell(g, x, BANK_TOP - 50, 10, 9, Bn[2]); R(g, x - 5, BANK_TOP - 52, 3, 3, INK); R(g, x + 2, BANK_TOP - 52, 3, 3, INK); R(g, x - 2, BANK_TOP - 70, 4, 10, '#F5F0E6'); sp.push([x, BANK_TOP - 70, 6, 10]); }
};

const bankBack = (g: Ctx, k: number, sp: Spot[]) => {
  // (the theming's over: a concrete channel wall, pipes along it, a valve wheel, a chain-link fence, EMPLOYEES ONLY)
  bankFace(g, () => { const C = ramp5(b('#6B7280')); R(g, 0, BANK_TOP, BANK_T, BANK_FOOT - BANK_TOP, C[2]); for (let x = 0; x < BANK_T; x += 60) R(g, x, BANK_TOP, 1, BANK_FOOT - BANK_TOP, C[1]); R(g, 0, BANK_TOP, BANK_T, 2, C[3]); R(g, 0, BANK_TOP + 14, BANK_T, 8, b('#4B5563')); R(g, 0, BANK_TOP + 14, BANK_T, 2, b('#9CA3AF')); });
  // (the service walkway along it (the beer man's, after the fight): planks on the channel wall's top, a pipe rail
  // behind; dimmed, back from the play)
  const Wk = ramp5(b('#6B5A44'));
  R(g, 0, BANK_TOP - 4, BANK_T, 8, Wk[1]); R(g, 0, BANK_TOP - 4, BANK_T, 2, Wk[3]); for (let x = 0; x < BANK_T; x += 20) R(g, x, BANK_TOP - 2, 1, 6, Wk[0]);
  const Fe = ramp5(b('#71717A'));
  for (let x = 10; x < BANK_T; x += 60) { R(g, x, BANK_TOP - 110, 4, 110, Fe[1]); R(g, x, BANK_TOP - 110, 1, 110, Fe[3]); }
  for (let y = BANK_TOP - 104; y < BANK_TOP; y += 6) for (let x = 0; x < BANK_T; x += 6) R(g, x + ((y / 6) % 2) * 3, y, 1, 1, Fe[2]);
  R(g, 0, BANK_TOP - 110, BANK_T, 3, Fe[2]);
  if (hash(k * 1.3) < 0.5) { block(g, 180, BANK_TOP - 90, 100, 28, ramp5(b('#F8FAFC'))); g.font = '8px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = b('#B91C1C'); g.fillText('EMPLOYEES', 230, BANK_TOP - 78); g.fillText('ONLY', 230, BANK_TOP - 66); g.textAlign = 'left'; }
  else { block(g, 140, BANK_TOP - 60, 90, 60, ramp5(b('#52525B'))); ell(g, 185, BANK_TOP - 30, 18, 18, INK); ell(g, 185, BANK_TOP - 30, 15, 15, b('#B91C1C')); for (let a = 0; a < 4; a++) stroke(g, [[185, BANK_TOP - 30], [185 + Math.cos(a * 1.57) * 14, BANK_TOP - 30 + Math.sin(a * 1.57) * 14]], 2, INK); }
  void sp;
};

const BANKS: Record<ZoneId, (g: Ctx, k: number, sp: Spot[]) => void> = {
  head: bankHead, ruins: bankRuins, canopy: bankCanopy, bayou: bankBayou, tiki: bankTiki, pirate: bankPirate, oasis: bankOasis, caves: bankCaves, grotto: bankGrotto, back: bankBack,
};

/** A zone's name board, at its start (on the bank, over the seam): two posts in the zone's style, the board, its words
 *  (readable: lit by a lamp over it), a rock at the foot over the seam. */
const paintGate = (g: Ctx, x: number, z: (typeof ZONES)[number]) => {
  const name = z.name!, Bd = ramp5(z.board!);
  const Rk = ramp5(b('#3A3038'));
  ell(g, x, BANK_TOP + 4, 70, 30, INK, Math.PI, 0); ell(g, x, BANK_TOP + 4, 68, 28, Rk[2], Math.PI, 0); ell(g, x - 16, BANK_TOP - 6, 36, 14, Rk[3], Math.PI, 0); checker(g, x - 50, BANK_TOP - 4, 90, 6, Rk[1]);
  const top = BANK_TOP - 190, w = 210, h = 50;
  for (const px of [x - 80, x + 74]) { block(g, px, top + h, 8, BANK_TOP - 10 - top - h, ramp5(b('#6B4A2A'))); }
  block(g, x - w / 2, top, w, h, Bd);
  for (let y = top + 12; y < top + h - 4; y += 12) R(g, x - w / 2 + 2, y, w - 4, 1, Bd[1]);
  g.font = '10px "Press Start 2P"'; g.textAlign = 'center';
  g.fillStyle = INK; g.fillText(name[0], x + 1, top + 23); g.fillStyle = '#FEF3C7'; g.fillText(name[0], x, top + 22);
  g.font = '6px "Press Start 2P"'; g.fillStyle = INK; g.fillText(name[1], x + 1, top + 39); g.fillStyle = '#FDE68A'; g.fillText(name[1], x, top + 38);
  g.textAlign = 'left';
  // (scorched along its bottom edge; a lamp over it)
  checker(g, x - w / 2, top + h - 6, w, 4, '#1A0A06');
  R(g, x - 4, top - 14, 8, 14, INK); R(g, x - 3, top - 12, 6, 8, '#FDE68A');
};

/** World space, first in drawBack2: the far bank, zone by zone, its fires; the zones' name boards over the seams. */
export const drawZoneBank = (c: Ctx, state: GameState, from: number) => {
  const f = state.frame, tod = timeOfDay().key;
  const x0 = Math.max(from, Math.floor((state.camera.x - 160) / BANK_T) * BANK_T), x1 = Math.min(L3.wall + 400, state.camera.x + W + 160);
  for (let tx = x0 - (((x0 % BANK_T) + BANK_T) % BANK_T); tx < x1; tx += BANK_T) {
    // (each tile its own (no strip of the same props cycling by), stood at the decks' height there)
    const k = Math.floor(tx / BANK_T), z = zoneAt(tx + 1), dy = floorDy(tx + BANK_T / 2);
    c.save(); c.translate(tx, dy);
    stamp(c, `wp2-bank-${z}-${k}-${tod}`, 0, GY - BANK_H, BANK_T, BANK_H + RIVER_Y - GY + 200, g => BANKS[z](g, k, []));
    for (const [x, y, w, h] of spotsOf(`bank-${z}-${k}`, (g, sp) => BANKS[z](g, k, sp))) fireRow(c, x - w / 2, x + w / 2, y, h, f, Math.max(8, w / 3), k * 5 + Math.round(x));
    c.restore();
  }
  for (const z of ZONES) {
    if (!z.name || z.x < state.camera.x - 200 || z.x > state.camera.x + W + 200) continue;
    const dy = floorDy(z.x);
    c.save(); c.translate(0, dy); stamp(c, `wp2-gate-${z.id}`, z.x - 120, BANK_TOP - 210, 240, 250, g => paintGate(g, z.x, z));
    flame(c, z.x + 88, BANK_TOP - 140, 10, 18, f, 3); c.restore();
  }
};
export { BANK_TOP };

// ---------------------------------------------------------------------------------------------------------------
// The decks, per zone: what they're made of (art.ts paints them: the lit lip on top always)

export interface DeckStyle { lip: string; lip2: string; planks: string[]; seam: string; under: string; post?: string; kind: 'planks' | 'stone' | 'bamboo' | 'sand' | 'rock' | 'tile' }
export const DECK_STYLE: Record<ZoneId, DeckStyle> = {
  head: { lip: '#E0F2FE', lip2: '#7DD3FC', planks: ['#94A3B8', '#A3B1C6', '#8A98AE', '#9CAAC0'], seam: '#475569', under: '#2A3240', kind: 'tile' },
  ruins: { lip: '#F4E8C8', lip2: '#C8B48A', planks: ['#8A7A5A', '#7E6E50', '#968664', '#847452'], seam: '#3A3020', under: '#2A2418', kind: 'stone' },
  canopy: { lip: '#F0D8A8', lip2: '#C8A070', planks: ['#8A6238', '#7A5430', '#946A3E', '#82582E'], seam: '#3A2412', under: '#2A2014', post: '#3A2412', kind: 'planks' },
  bayou: { lip: '#E7E5E4', lip2: '#A8A29E', planks: ['#6B6458', '#625B50', '#746C60', '#5E584C'], seam: '#2A2620', under: '#1E1C18', post: '#2A2620', kind: 'planks' },
  tiki: { lip: '#FEF3C7', lip2: '#D6B46A', planks: ['#B8944A', '#A8843E', '#C4A056', '#9E7C3A'], seam: '#5A3A1E', under: '#2A1E10', kind: 'bamboo' },
  pirate: { lip: '#F5E0B8', lip2: '#B88A50', planks: ['#7A4A22', '#6E421E', '#845026', '#704420'], seam: '#2A160A', under: '#1E120A', post: '#2A160A', kind: 'planks' },
  oasis: { lip: '#FEF3C7', lip2: '#E8C888', planks: ['#C8A468', '#BC9A5E', '#D2AE72', '#B89458'], seam: '#7A5A30', under: '#4A3820', kind: 'sand' },
  caves: { lip: '#C4B5FD', lip2: '#7C6AA8', planks: ['#4A3C5A', '#423652', '#524462', '#46384E'], seam: '#1A1424', under: '#120E1A', kind: 'rock' },
  grotto: { lip: '#C4B5FD', lip2: '#6A525E', planks: ['#3A2A34', '#34262E', '#42303A', '#3E2C36'], seam: '#1A1218', under: '#120C10', kind: 'rock' },
  back: { lip: '#E5E7EB', lip2: '#9CA3AF', planks: ['#6B7280', '#646B78', '#727988', '#5E6572'], seam: '#374151', under: '#1F2937', kind: 'tile' },
};

// ---------------------------------------------------------------------------------------------------------------
// The vines' pergola, per zone: what the posts back in the river are (dimmed), and the beam each vine hangs off

const VIS = (state: GameState, a: number, bb: number) => bb > state.camera.x - 80 && a < state.camera.x + W + 80;
/** The posts back in the river under a vine's beam (dimmed; nothing to stand on), and its crossbeam up top. */
export const drawPergolaPost = (c: Ctx, state: GameState, wx: number, wy: number) => {
  if (!VIS(state, wx - 80, wx + 80)) return;
  const z = zoneAt(wx), x = 0, y = 0, top = -220, RIVER_Y = Math.round(waterY(wx) - wy);
  c.save(); c.translate(Math.round(wx), Math.round(wy));
  stamp(c, `wp2-post-${z}-${RIVER_Y}`, -80, top, 160, RIVER_Y - top + 2, g => {
    const post = (px: number) => {
      const h = RIVER_Y - top;
      if (z === 'ruins') { const S = ramp5(nt('#8A7A5A', 0.5)); R(g, px - 8, top, 16, h, INK); R(g, px - 7, top, 14, h, S[2]); R(g, px - 7, top, 3, h, S[3]); R(g, px + 4, top, 3, h, S[1]); for (let yy = top + 30; yy < RIVER_Y; yy += 34) R(g, px - 7, yy, 14, 2, S[0]); }
      else if (z === 'canopy') { const T = ramp5(nt('#4A3424', 0.5)); R(g, px - 7, top, 14, h, INK); R(g, px - 6, top, 12, h, T[2]); R(g, px - 6, top, 3, h, T[3]); for (let yy = top + 20; yy < RIVER_Y; yy += 26) R(g, px - 4, yy, 8, 2, T[1]); }
      else if (z === 'pirate') { const T = ramp5(nt('#5A3A1E', 0.5)); R(g, px - 5, top, 10, h, INK); R(g, px - 4, top, 8, h, T[2]); R(g, px - 4, top, 2, h, T[3]); for (let yy = top + 40; yy < RIVER_Y; yy += 50) R(g, px - 6, yy, 12, 3, nt('#3F3F46', 0.5)); }
      else if (z === 'oasis') { const T = ramp5(nt('#7A5A34', 0.5)); R(g, px - 6, top, 12, h, INK); R(g, px - 5, top, 10, h, T[2]); for (let yy = top + 6; yy < RIVER_Y; yy += 8) R(g, px - 5, yy, 10, 2, T[1]); }
      else { const Rk = ramp5(nt('#3A3048', 0.5)); poly(g, [[px - 14, RIVER_Y], [px - 6, top], [px + 6, top], [px + 14, RIVER_Y]], INK); poly(g, [[px - 12, RIVER_Y], [px - 5, top], [px + 5, top], [px + 12, RIVER_Y]], Rk[2]); poly(g, [[px - 12, RIVER_Y], [px - 5, top], [px - 1, top], [px - 4, RIVER_Y]], Rk[3]); }
    };
    post(x - 50); post(x + 50);
    // (the crossbeam between them, up behind the vine's own beam)
    const S = ramp5(nt(z === 'ruins' ? '#8A7A5A' : z === 'caves' ? '#3A3048' : '#4A3424', 0.5));
    R(g, x - 62, y - 30, 124, 12, INK); R(g, x - 61, y - 29, 122, 10, S[2]); R(g, x - 61, y - 29, 122, 2, S[3]);
  });
  c.restore();
};
/** The beam a vine hangs off (in front of the posts, behind the vine): the zone's (a stone lintel, a branch, a ship's
 *  yard, a palm log, a rock ledge), burnt and smoldering along its top; the rope lashing where the vine's tied on. */
export const drawVineBeam = (c: Ctx, state: GameState, wx: number, wy: number) => {
  const z = zoneAt(wx), f = state.frame, x = 0, y = 0;
  c.save(); c.translate(Math.round(wx), Math.round(wy));
  stamp(c, `wp2-beam-${z}`, -60, -30, 120, 44, g => {
    const kind = z === 'ruins' ? '#9A8A6A' : z === 'canopy' ? '#5A4030' : z === 'pirate' ? '#6E421E' : z === 'oasis' ? '#8A6A40' : z === 'caves' ? '#4A3C5A' : '#3A2414';
    const S = ramp5(kind);
    if (z === 'caves') {
      poly(g, [[x - 54, y - 16], [x + 54, y - 16], [x + 44, y], [x - 46, y]], INK); poly(g, [[x - 52, y - 15], [x + 52, y - 15], [x + 42, y - 2], [x - 44, y - 2]], S[2]); R(g, x - 50, y - 15, 100, 2, S[3]);
      for (const sx of [-34, -10, 22, 40]) poly(g, [[x + sx - 4, y - 2], [x + sx + 4, y - 2], [x + sx, y + 10]], S[1]);
    } else if (z === 'canopy') {
      stroke(g, [[x - 56, y - 4], [x - 10, y - 12], [x + 56, y - 8]], 15, INK); stroke(g, [[x - 56, y - 4], [x - 10, y - 12], [x + 56, y - 8]], 12, S[2]); stroke(g, [[x - 56, y - 8], [x - 10, y - 16], [x + 56, y - 12]], 3, S[3]);
      for (const lx of [-40, 30]) { stroke(g, [[x + lx, y - 8], [x + lx + 6, y - 22], [x + lx + 16, y - 26]], 3, '#14301A'); }
    } else {
      block(g, x - 46, y - 14, 92, 14, S);
      if (z === 'ruins') for (let k = -36; k < 40; k += 18) R(g, x + k, y - 12, 1, 10, S[1]);
      if (z === 'pirate') { R(g, x - 52, y - 10, 6, 6, S[1]); R(g, x + 46, y - 10, 6, 6, S[1]); }
      if (z === 'oasis') for (let k = -40; k < 44; k += 8) R(g, x + k, y - 13, 2, 12, S[1]);
    }
    // (charred along its top)
    checker(g, x - 44, y - 16, 88, 4, '#120806');
    R(g, x - 5, y - 14, 10, 14, INK); R(g, x - 4, y - 13, 8, 12, '#8A7448'); R(g, x - 4, y - 13, 8, 2, '#B8A06A'); for (let k = 0; k < 3; k++) R(g, x - 4, y - 10 + k * 4, 8, 1, '#5A4A30');
  });
  for (let k = 0; k < 5; k++) if (((k + (f >> 4)) % 3) === 0) { c.fillStyle = FIRE[2 + (k % 2)]; c.fillRect(x - 40 + k * 18, y - 16, 4, 1); }
  c.restore();
};
