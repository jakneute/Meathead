// CON-FUCK-TIOUS's loft over the library (benLoft.ts), painted: THE RESTRICTED SECTION, a forgotten reading loft up in
// the roof over the kitchen, walled in with the books nobody was ever allowed to read, turned into a gym-bro hideout.
// Its own signature (no other lair has it): a COFFIN for a bench press, the barbell racked over it on two candelabras,
// its plates stacks of encyclopedias belted together; book-stack dumbbells; a skull in a sweatband on the reading
// lectern next to a tub of mass gainer; his moth-eaten chaise longue; towers of forbidden books; the old candle wheel
// on its chain; a stone pillar with a sconce; the tall bookcase by the way in; a round ROSE WINDOW in the gable, the
// moonlight coming down through it in a shaft, dust in it; the chimney over the cannon; cobwebs in every corner. The
// brass plaque says RESTRICTED SECTION; the cardboard under it, in marker, BEN'S. KNOCK. SHH.
//
// The way up the library's dark top left (the old wall shelves, the bookcase's top board) and the FALSE SHELF in the
// stone wall (closed: books in a stone wall, the draft blowing dust out between them; open: swung in, the passage dark
// behind it) are drawn on the library's side; the loft itself stays under the roof's dark till he's in (its `reveal`).
// The bedroom's servants' hatch the cannon shoots him out of, too. Still art painted once (stamps, the room in
// chunks); the flames, the dust, the smoke live and few. More of his things (paintDen): the oak icebox by the cannon
// with a hot plate and a cauldron of oats on it, an illuminated page (THOU SHALT NOT SKIP LEG DAY), the hook board with
// the next cape half sewn and his tools, the work shelf under it, gainer tubs among the high books, a jack-o'-lantern
// bucket of chalk, chalk handprints, candle soot, a gift-shop rubber bat; a near tie-beam across the top in front.

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { INK, box, pole, rampOf, mix, checker, bandedGradient, hazeBands, brickPattern, stamp, hash } from '../../intro/art/kit';
import { signAt, gothic, print, fit } from '../letters';
import { drawCannon, SPOOKY } from '../../upgrades/returnCannon';
import { drawBen, benHeadY, drawBenGross, drawBenGrossBack, drawGate, drawCannonChain, gateK } from '../../upgrades/confucktious';
import { drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { saidOver } from '../section';
import {
  LA, LOFT, F, PASS_TOP, PART_L, PART_R, PATH, COFFIN, SHELF, PILLAR_LX, WHEEL_LX, CHIMNEY, CANNON_LX, HOLE, HOLE_MEMO,
  loftOf, benAt, inLoft, loftView,
} from './benLoft';

type Ctx = CanvasRenderingContext2D;
const W = LOFT.b - LOFT.a, H = LOFT.h;
const GLOOM = '#0C0608';
const dimc = (col: string, k = 0.3) => mix(col, GLOOM, k);
const seen = (state: GameState, a: number, b: number, t: number, bt: number) =>
  b > state.camera.x - 60 && a < state.camera.x + CANVAS_WIDTH + 60 && bt > state.camera.y - 60 && t < state.camera.y + CANVAS_HEIGHT + 60;

/** Ramps: old oak, iron, brass, the stone, wax, the chaise's velvet. */
const OAK = rampOf('#4A3020'), IRON = rampOf('#3A3A44'), BRASS = rampOf('#A87A1E'), STONE = rampOf('#463C42');
const WAX = ['#9A9080', '#C8C0AE', '#E8E2D0', '#F6F2E6', '#FFFFFF'];
const VELVET = rampOf('#5A1430');
const BOOKS = ['#5A1414', '#14285A', '#143A20', '#5A3A10', '#3A1460', '#7A5A10', '#2A2A2A', '#5A2A3A'];

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** A run of book spines standing on y (their feet), x0..x1: every height and width, a lean, gilt bands; dimmed by k. */
const spines = (g: Ctx, x0: number, x1: number, y: number, seed: number, k = 0.25, hMin = 16, hRange = 12) => {
  for (let bx = x0, i = seed; bx < x1; i++) {
    const s = hash(i * 1.37), bw = 5 + Math.floor(s * 7), bh = hMin + Math.floor(hash(i * 2.1) * hRange), R = rampOf(dimc(BOOKS[i % BOOKS.length], k));
    if (bx + bw > x1) break;
    if (s > 0.9 && bx + 20 < x1) { g.save(); g.translate(bx, y); g.rotate(-0.3); box(g, 0, -bh, bw, bh, R[2]); box(g, 0, -bh, 1, bh, R[3]); g.restore(); bx += 16; continue; }
    box(g, bx, y - bh, bw, bh, R[2]); box(g, bx, y - bh, 1, bh, R[3]); box(g, bx + bw - 1, y - bh, 1, bh, R[0]);
    if (s < 0.55) { box(g, bx, y - bh + 3, bw, 1, dimc('#A07A1E', k)); box(g, bx, y - 5, bw, 1, dimc('#A07A1E', k)); }
    bx += bw + 1;
  }
};
/** A pile of books lying flat, bottom at y, centered on x (widths wobbling), n high. */
const pile = (g: Ctx, x: number, y: number, n: number, seed: number, k = 0.2) => {
  for (let i = 0; i < n; i++) {
    const w = 30 + Math.floor(hash(seed + i * 3.1) * 16), off = Math.floor((hash(seed + i * 7.7) - 0.5) * 8), R = rampOf(dimc(BOOKS[(seed + i) % BOOKS.length], k));
    const by = y - (i + 1) * 7;
    box(g, x - w / 2 + off - 1, by - 1, w + 2, 9, INK); box(g, x - w / 2 + off, by, w, 7, R[2]); box(g, x - w / 2 + off, by, w, 1, R[3]);
    box(g, x + w / 2 + off - 4, by + 1, 3, 5, WAX[k > 0.25 ? 0 : 1]);
  }
};
/** A cobweb in a corner: threads fanning out from it, rings across them. `sx`, `sy`: which way it opens. */
const web = (g: Ctx, x: number, y: number, r: number, sx: 1 | -1, sy: 1 | -1, col = 'rgba(220,220,230,0.45)') => {
  g.strokeStyle = col; g.lineWidth = 1;
  for (let k = 0; k <= 4; k++) { const a = (k / 4) * (Math.PI / 2); g.beginPath(); g.moveTo(x, y); g.lineTo(x + sx * Math.cos(a) * r, y + sy * Math.sin(a) * r); g.stroke(); }
  for (let ring = 1; ring <= 3; ring++) {
    const rr = (r * ring) / 3.4;
    g.beginPath();
    for (let k = 0; k <= 4; k++) { const a = (k / 4) * (Math.PI / 2), px = x + sx * Math.cos(a) * rr, py = y + sy * Math.sin(a) * rr; if (k === 0) g.moveTo(px, py); else g.quadraticCurveTo(x + sx * Math.cos(a - 0.2) * rr * 0.86, y + sy * Math.sin(a - 0.2) * rr * 0.86, px, py); }
    g.stroke();
  }
};
/** A standable thing's body with its top lit (dim: `dimK` how far the lip's let down into the dark). */
const lipSlab = (g: Ctx, x: number, y: number, w: number, h: number, body: string, lip: string) => {
  const r = rampOf(body), l = rampOf(lip);
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  box(g, x, y, w, h, r[2]); box(g, x, y + h - 3, w, 3, r[0]); checker(g, x, y + h - 5, w, 2, r[1]);
  box(g, x, y, w, 2, l[3]); box(g, x, y + 2, w, 2, l[2]); checker(g, x, y + 4, w, 2, l[1]);
};
/** A candlestick's wax and wick (the flame's drawn live): its flame's foot at (x, y), h tall. */
const candleWax = (g: Ctx, x: number, y: number, h: number) => {
  box(g, x - 4, y - 1, 9, h + 2, INK); box(g, x - 3, y, 7, h, WAX[2]); box(g, x - 3, y, 2, h, WAX[4]); box(g, x + 2, y, 2, h, WAX[1]);
  box(g, x - 3, y, 7, 2, WAX[3]); box(g, x + 3, y + 2, 2, 6, WAX[3]); box(g, x + 4, y + 7, 1, 3, WAX[2]);
  box(g, x, y - 3, 1, 3, INK);
};

// ---------------------------------------------------------------------------------------------------------------
// The loft (local: x 0..W from its left wall, y up from its floor at 0)

const paintWall = (g: Ctx) => {
  // (the stone, banded darker up into the roof; mortar; damp)
  g.fillStyle = brickPattern(g, 'spLoftStone', 30, 15, [dimc(STONE[2], 0.25), dimc(mix(STONE[2], STONE[1], 0.5), 0.25)], dimc(STONE[0], 0.3));
  g.fillRect(-40, -H - 40, W + 80, H + 42);
  hazeBands(g, -40, -H - 40, W + 80, 220, '#040204', 0.85, 0, 6);
  for (let k = 0; k < 7; k++) { const x = 40 + hash(k * 9.1) * (W - 80); checker(g, x, -H + 40 + hash(k * 3.3) * 200, 6 + hash(k) * 10, 60 + hash(k * 5) * 80, 'rgba(10,16,10,0.35)'); }
  // (the gable: the roof's pitch, two great oak rafters down from the ridge; the ceiling beam along under it, its struts)
  for (const s of [-1, 1]) {
    const rx = W / 2 + s * (W / 2 + 40);
    g.fillStyle = INK; g.beginPath(); g.moveTo(W / 2 - 16, -H - 40); g.lineTo(W / 2 + 16, -H - 40); g.lineTo(rx + s * 16, -H + 120); g.lineTo(rx - s * 16, -H + 120); g.closePath(); g.fill();
    g.fillStyle = dimc(OAK[1], 0.3); g.beginPath(); g.moveTo(W / 2 - 12, -H - 40); g.lineTo(W / 2 + 12, -H - 40); g.lineTo(rx + s * 12, -H + 120); g.lineTo(rx - s * 12, -H + 120); g.closePath(); g.fill();
  }
  // (the rose window in the gable: stone tracery round a wheel of moonlit glass, eight petals, a quatrefoil in the middle)
  const wx = 600, wy = -300, wr = 46;
  g.fillStyle = INK; g.beginPath(); g.arc(wx, wy, wr + 8, 0, Math.PI * 2); g.fill();
  g.fillStyle = STONE[3]; g.beginPath(); g.arc(wx, wy, wr + 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = STONE[1]; g.beginPath(); g.arc(wx + 2, wy + 2, wr + 2, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(wx, wy, wr, 0, Math.PI * 2); g.clip();
  bandedGradient(g, wx - wr, wy - wr, wr * 2, wr * 2, ['#8EB4E8', '#5E86C8', '#3A5A9C', '#24386E'], 6);
  g.restore();
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr); g.stroke();
    g.strokeStyle = STONE[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr); g.stroke();
    const px = wx + Math.cos(a + Math.PI / 8) * wr * 0.66, py = wy + Math.sin(a + Math.PI / 8) * wr * 0.66;
    box(g, px - 3, py - 3, 6, 6, k % 3 === 0 ? '#A83A5A' : k % 3 === 1 ? '#C8A83A' : '#6AA0D8');
  }
  g.fillStyle = INK; g.beginPath(); g.arc(wx, wy, 12, 0, Math.PI * 2); g.fill(); g.fillStyle = STONE[3]; g.beginPath(); g.arc(wx, wy, 10, 0, Math.PI * 2); g.fill();
  box(g, wx - 4, wy - 4, 8, 8, '#B8D4F4'); box(g, wx - 4, wy - 4, 3, 3, '#FFFFFF');
  web(g, wx + wr + 4, wy - wr + 6, 22, -1, 1);
  // (the ceiling beam, its struts and braces; the old flue up through it, up and right of the cannon: where it shoots)
  box(g, -40, -H - 4, W + 80, 30, INK); box(g, -40, -H - 2, W + 80, 26, OAK[1]); box(g, -40, -H - 2, W + 80, 3, OAK[3]); box(g, -40, -H + 20, W + 80, 3, OAK[0]);
  for (let x = 30; x < W; x += 150) {
    pole(g, x, -H + 24, 14, 50, OAK[1]);
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(x - 30, -H + 24); g.lineTo(x + 2, -H + 70); g.moveTo(x + 44, -H + 24); g.lineTo(x + 12, -H + 70); g.stroke();
    g.strokeStyle = OAK[2]; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 30, -H + 24); g.lineTo(x + 2, -H + 70); g.moveTo(x + 44, -H + 24); g.lineTo(x + 12, -H + 70); g.stroke();
    web(g, x + 14, -H + 24, 16, 1, 1, 'rgba(220,220,230,0.3)');
  }
  // (the flue: brick, sooty, open up into the dark)
  g.fillStyle = brickPattern(g, 'spLoftFlue', 18, 9, ['#4A2A22', '#3A201A'], '#1A0C08');
  g.fillRect(CHIMNEY.a - 10, -H - 40, CHIMNEY.b - CHIMNEY.a + 20, 74);
  box(g, CHIMNEY.a, -H - 40, CHIMNEY.b - CHIMNEY.a, 66, '#050304');
  bandedGradient(g, CHIMNEY.a, -H + 6, CHIMNEY.b - CHIMNEY.a, 28, ['#050304', '#120806', '#22120C'], 4);
  box(g, CHIMNEY.a - 12, -H + 26, CHIMNEY.b - CHIMNEY.a + 24, 8, INK); box(g, CHIMNEY.a - 11, -H + 27, CHIMNEY.b - CHIMNEY.a + 22, 6, '#5A3428'); box(g, CHIMNEY.a - 11, -H + 27, CHIMNEY.b - CHIMNEY.a + 22, 1, '#8A5A44');
  // (corner webs)
  web(g, 0, -H + 26, 48, 1, 1); web(g, W, -H + 26, 40, -1, 1);
};

/** Towers of forbidden books against the back wall (dimmed: none to stand on), shelves along it crammed. */
const paintStacks = (g: Ctx) => {
  // (a long low shelf along the wall, crammed; a second up over it)
  for (const [x0, x1, y] of [[150, 420, -150], [650, 740, -150], [20, 300, -250], [680, 900, -250]] as const) {
    box(g, x0 - 4, y, x1 - x0 + 8, 6, dimc(OAK[1], 0.4)); box(g, x0 - 4, y, x1 - x0 + 8, 1, dimc(OAK[2], 0.4)); box(g, x0 - 4, y + 6, x1 - x0 + 8, 2, INK);
    spines(g, x0, x1, y, x0 + y, 0.45);
  }
  // (book towers, leaning)
  for (const [x, n, s] of [[130, 9, 11], [470, 16, 21], [700, 8, 31], [880, 11, 41]] as const) pile(g, x, 0, n, s, 0.35);
  // (the plaque: RESTRICTED SECTION; the cardboard under it in marker)
  box(g, 254, -342, 172, 28, INK); box(g, 255, -341, 170, 26, BRASS[1]); box(g, 255, -341, 170, 2, BRASS[3]); box(g, 255, -317, 170, 2, BRASS[0]);
  signAt(g, 'RESTRICTED SECTION', 340, -328, 7, gothic(7, '#2A1A08', '#E8C870'));
  g.save(); g.translate(340, -292); g.rotate(-0.05);
  box(g, -54, -16, 108, 34, INK); box(g, -53, -15, 106, 32, '#B08A5A'); box(g, -53, -15, 106, 2, '#C8A472'); checker(g, -53, 12, 106, 4, '#8A6A42');
  box(g, -4, -22, 8, 8, '#C8C8C0'); box(g, -3, -21, 6, 1, '#FFFFFF');
  signAt(g, "BEN'S. KNOCK.", 0, -6, 7, print(7, '#141010'));
  signAt(g, 'SHH.', 0, 8, 7, print(7, '#7A1010'));
  g.restore();
};

/** His things: the coffin bench and its barbell, the dumbbells, the lectern and the skull, the chaise, the pillar, the
 *  candle wheel, the tall bookcase, the chimney's hearth round the cannon. */
const paintGym = (g: Ctx) => {
  // ---- the chaise longue under the window (his cot): moth-eaten velvet, a scroll arm, a tartan blanket off it
  { const x = 520, y = 0, V = VELVET.map(c => dimc(c, 0.2));
    box(g, x - 1, y - 40, 142, 30, INK); box(g, x, y - 39, 140, 28, V[1]); box(g, x, y - 39, 140, 4, V[3]); checker(g, x, y - 20, 140, 2, V[0]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + 8, y - 52, 16, 22, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = V[2]; g.beginPath(); g.ellipse(x + 8, y - 52, 14, 20, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = V[4]; g.fillRect(x + 1, y - 66, 4, 10);
    for (let k = 0; k < 6; k++) box(g, x + 30 + k * 18, y - 37, 2, 2, V[0]);
    box(g, x + 22, y - 33, 14, 6, '#C8B080'); box(g, x + 70, y - 30, 8, 4, '#C8B080');
    for (const lx of [x + 6, x + 128]) { box(g, lx - 1, y - 12, 8, 12, INK); box(g, lx, y - 11, 6, 11, dimc(OAK[2], 0.2)); }
    box(g, x + 86, y - 38, 44, 26, INK); for (let k = 0; k < 6; k++) box(g, x + 87 + k * 7, y - 37, 7, 24, k % 2 ? '#6A1A1A' : '#2A3A5A'); box(g, x + 87, y - 30, 42, 2, '#C8A83A');
    // (his sneakers under it, a sock)
    box(g, x + 40, y - 8, 16, 8, INK); box(g, x + 41, y - 7, 14, 6, '#E8E8EF'); box(g, x + 44, y - 4, 10, 1, '#D23030');
    box(g, x + 60, y - 4, 14, 4, '#DADAE0'); }
  // ---- the lectern: a skull in a sweatband, the tub of mass gainer, an open book with a workout log taped in
  { const x = 690, Wd = rampOf(dimc('#5A3420', 0.15));
    pole(g, x - 5, -70, 10, 70, Wd[2]); box(g, x - 18, -6, 36, 6, INK); box(g, x - 17, -5, 34, 4, Wd[2]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 26, -78); g.lineTo(x + 26, -88); g.lineTo(x + 24, -70); g.lineTo(x - 24, -64); g.closePath(); g.fill();
    g.fillStyle = Wd[3]; g.beginPath(); g.moveTo(x - 24, -77); g.lineTo(x + 24, -86); g.lineTo(x + 22, -72); g.lineTo(x - 22, -66); g.closePath(); g.fill();
    box(g, x - 20, -86, 18, 10, '#F1E8C8'); box(g, x + 2, -90, 18, 10, '#E8DCB8'); for (let k = 0; k < 3; k++) { box(g, x - 17, -84 + k * 3, 12, 1, '#7A6A4A'); box(g, x + 5, -88 + k * 3, 12, 1, '#7A6A4A'); }
    // (the skull: bone, the sockets, the teeth; the sweatband round its brow, red)
    const sx = x - 8, sy = -104;
    g.fillStyle = INK; g.beginPath(); g.ellipse(sx, sy, 12, 11, 0, 0, Math.PI * 2); g.fill(); box(g, sx - 8, sy + 4, 16, 10, INK);
    g.fillStyle = '#D8D0B8'; g.beginPath(); g.ellipse(sx, sy, 10.5, 9.5, 0, 0, Math.PI * 2); g.fill(); box(g, sx - 7, sy + 4, 14, 8, '#C8BEA4');
    box(g, sx - 6, sy - 6, 4, 3, '#F0EAD8'); box(g, sx - 7, sy, 5, 5, '#140A08'); box(g, sx + 2, sy, 5, 5, '#140A08'); box(g, sx - 1, sy + 5, 2, 3, '#2A1A10');
    for (let k = 0; k < 5; k++) box(g, sx - 6 + k * 3, sy + 9, 2, 3, k % 2 ? '#E8E0C8' : '#B8AE94');
    box(g, sx - 11, sy - 5, 22, 4, INK); box(g, sx - 10, sy - 4, 20, 2, '#C81E28'); box(g, sx - 10, sy - 4, 20, 1, '#EE5A5A');
    // (the tub: MASS, a scoop sticking out)
    box(g, x + 6, -112, 20, 24, INK); box(g, x + 7, -111, 18, 22, '#2A2A30'); box(g, x + 7, -111, 18, 4, '#4A4A52'); box(g, x + 9, -103, 14, 6, '#F0C020');
    box(g, x + 11, -102, 2, 4, INK); box(g, x + 14, -102, 2, 4, INK); box(g, x + 17, -102, 2, 4, INK); box(g, x + 18, -118, 3, 8, '#E8E8EF'); }
  // ---- the book-stack dumbbells on the floor (each two stacks of encyclopedias belted onto a short iron bar)
  for (const x of [380, 650]) {
    for (const s of [-1, 1]) { const bx = x + s * 14; for (let i = 0; i < 3; i++) { const R = rampOf(BOOKS[(i + x) % BOOKS.length]); box(g, bx - 7, -26 + i * 8, 14, 8, INK); box(g, bx - 6, -25 + i * 8, 12, 6, R[2]); box(g, bx - 6, -25 + i * 8, 12, 1, R[3]); } box(g, bx - 8, -16, 16, 3, '#6C421F'); }
    box(g, x - 8, -15, 16, 4, INK); box(g, x - 7, -14, 14, 2, IRON[3]);
  }
  // ---- the stone pillar (scenery: dimmed, no lip) and the iron sconce up it (the FAR candle's)
  { const x = PILLAR_LX, S2 = STONE.map(c => dimc(c, 0.2));
    box(g, x - 17, -H, 34, H, INK); g.fillStyle = brickPattern(g, 'spLoftPillar', 32, 16, [S2[2], mix(S2[2], S2[1], 0.5)], S2[0]); g.fillRect(x - 16, -H, 32, H);
    box(g, x - 16, -H, 4, H, S2[3]); box(g, x + 12, -H, 4, H, S2[1]);
    box(g, x - 22, -14, 44, 14, INK); box(g, x - 21, -13, 42, 12, S2[2]); box(g, x - 21, -13, 42, 2, S2[3]);
    box(g, x - 20, -H + 30, 40, 10, INK); box(g, x - 19, -H + 31, 38, 8, S2[2]);
    // (the sconce: its back plate, its arm out, the cup; the candle's wax in it)
    const cy = -315;
    box(g, x - 7, cy + 14, 14, 26, INK); box(g, x - 6, cy + 15, 12, 24, IRON[2]); box(g, x - 6, cy + 15, 12, 2, IRON[4]);
    box(g, x - 11, cy + 10, 22, 6, INK); box(g, x - 10, cy + 11, 20, 4, BRASS[2]); box(g, x - 10, cy + 11, 20, 1, BRASS[4]);
    candleWax(g, x, cy + 4 - 0, 7);
    web(g, x + 16, -H + 40, 20, 1, 1); }
  // ---- the candle wheel on its chain over the coffin (an iron hoop, candle stubs round it, the WHEEL candle in the middle)
  { const x = WHEEL_LX, y = -280;
    g.strokeStyle = '#2A2A30'; g.lineWidth = 3; g.setLineDash([5, 3]); g.beginPath(); g.moveTo(x, -H + 24); g.lineTo(x, y + 8); g.stroke(); g.setLineDash([]);
    for (const dx of [-38, 38]) { g.strokeStyle = '#2A2A30'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 40); g.lineTo(x + dx, y + 12); g.stroke(); }
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y + 14, 44, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = IRON[2]; g.beginPath(); g.ellipse(x, y + 13, 42, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y + 13, 36, 3, 0, 0, Math.PI * 2); g.fill();
    for (const dx of [-34, -20, 20, 34]) { box(g, x + dx - 2, y + 4, 5, 8, WAX[1]); box(g, x + dx - 2, y + 4, 2, 8, WAX[3]); box(g, x + dx, y + 1, 1, 3, INK); }
    box(g, x - 6, y + 12, 12, 4, INK); box(g, x - 5, y + 12, 10, 3, BRASS[2]);
    candleWax(g, x, y + 4, 8); }
  // ---- the coffin bench: a coffin laid on the floor (its six-sided lid his bench, a folded towel on it, brass handles
  // down its side, the nameplate), the barbell racked over it
  { const a = COFFIN.a, b = COFFIN.b, t = -COFFIN.top, w = b - a, C = rampOf('#5A2A1A');
    // (the body: wider at the head end, tapering to the foot; its grain, a molding round it)
    g.fillStyle = INK; g.beginPath(); g.moveTo(a - 2, t + 6); g.lineTo(b + 2, t + 6); g.lineTo(b - 4, 1); g.lineTo(a + 4, 1); g.closePath(); g.fill();
    g.fillStyle = C[2]; g.beginPath(); g.moveTo(a, t + 8); g.lineTo(b, t + 8); g.lineTo(b - 5, 0); g.lineTo(a + 5, 0); g.closePath(); g.fill();
    box(g, a + 2, t + 8, w - 4, 3, C[3]); checker(g, a + 4, -8, w - 8, 2, C[1]); box(g, a + 5, -3, w - 10, 3, C[0]);
    for (let k = 0; k < 4; k++) box(g, a + 14 + k * 30, t + 18 + (k % 2) * 6, 18, 1, C[1]);
    for (const hx of [a + 22, a + w / 2 - 6, b - 34]) { box(g, hx - 1, t + 20, 14, 7, INK); box(g, hx, t + 21, 12, 5, BRASS[2]); box(g, hx, t + 21, 12, 1, BRASS[4]); box(g, hx + 2, t + 23, 8, 2, BRASS[0]); }
    box(g, a + w / 2 + 16, t + 12, 22, 9, INK); box(g, a + w / 2 + 17, t + 13, 20, 7, BRASS[3]); box(g, a + w / 2 + 19, t + 15, 16, 1, BRASS[1]); box(g, a + w / 2 + 19, t + 17, 12, 1, BRASS[1]);
    // (its lid, six-sided, lit along the top: the bench he stands on; the towel on it)
    g.fillStyle = INK; g.beginPath(); g.moveTo(a - 8, t + 4); g.lineTo(a + 8, t - 2); g.lineTo(b - 8, t - 2); g.lineTo(b + 6, t + 4); g.lineTo(b - 8, t + 10); g.lineTo(a + 8, t + 10); g.closePath(); g.fill();
    g.fillStyle = C[3]; g.beginPath(); g.moveTo(a - 6, t + 4); g.lineTo(a + 8, t); g.lineTo(b - 8, t); g.lineTo(b + 4, t + 4); g.lineTo(b - 8, t + 8); g.lineTo(a + 8, t + 8); g.closePath(); g.fill();
    box(g, a, t, w, 2, '#E8C890'); box(g, a, t + 2, w, 1, '#C9A060');
    box(g, a + 34, t - 6, 44, 6, INK); box(g, a + 35, t - 5, 42, 4, '#E8E8EF'); box(g, a + 35, t - 5, 42, 1, '#FFFFFF'); box(g, a + 35, t - 3, 42, 1, '#3A6AC8');
    // (the barbell over it on two brass candelabra stands, the plates belted stacks of encyclopedias)
    for (const sx of [a - 18, b + 18]) { pole(g, sx - 3, -116, 6, 116, BRASS[2]); box(g, sx - 12, -6, 24, 6, INK); box(g, sx - 11, -5, 22, 4, BRASS[1]); box(g, sx - 10, -122, 20, 6, INK); box(g, sx - 9, -121, 18, 4, BRASS[3]); candleWax(g, sx, -130, 6); }
    box(g, a - 48, -120, w + 96, 6, INK); box(g, a - 47, -119, w + 94, 4, IRON[3]); box(g, a - 47, -119, w + 94, 1, IRON[4]);
    for (const s of [-1, 1]) {
      const px = s < 0 ? a - 34 : b + 34;
      for (let i = 0; i < 4; i++) { const R = rampOf(BOOKS[(i * 3 + (s < 0 ? 0 : 5)) % BOOKS.length]); const bx = px + s * i * 7 - 3; box(g, bx - 1, -142, 8, 50, INK); box(g, bx, -141, 6, 48, R[2]); box(g, bx, -141, 1, 48, R[3]); box(g, bx, -134, 6, 2, '#A07A1E'); }
      box(g, px - 8 + (s < 0 ? -18 : 0), -122, 30, 6, '#6C421F'); box(g, px - 8 + (s < 0 ? -18 : 0), -122, 30, 1, '#8E5C2E');
    } }
  // ---- the tall bookcase by the way in (its top lit: his to stand on), the HIGH candle in a brass holder on it
  { const a = SHELF.a, b = SHELF.b, t = -SHELF.top, Wd = rampOf('#3A2414');
    box(g, a - 1, t - 1, b - a + 2, -t + 1, INK); box(g, a, t, b - a, -t, Wd[0]);
    pole(g, a, t, 8, -t, Wd[2]); pole(g, b - 8, t, 8, -t, Wd[2]);
    for (let y = t + 40; y <= -4; y += 38) { spines(g, a + 10, b - 10, y, a + y, 0.15, 20, 12); box(g, a + 4, y, b - a - 8, 5, Wd[1]); box(g, a + 4, y, b - a - 8, 1, Wd[2]); }
    lipSlab(g, a - 4, t, b - a + 8, 12, '#4A3220', '#C9A060');
    box(g, 828 - 8, t - 6, 16, 6, INK); box(g, 828 - 7, t - 5, 14, 4, BRASS[2]); box(g, 828 - 7, t - 5, 14, 1, BRASS[4]);
    candleWax(g, 828, t - 22, 16);
    pile(g, a + 30, t, 2, 77, 0.05); }
  // ---- the cannon's hearth: the old fireplace's stone apron it stands on
  { box(g, CANNON_LX - 56, -6, 112, 6, INK); box(g, CANNON_LX - 55, -5, 110, 5, STONE[2]); box(g, CANNON_LX - 55, -5, 110, 1, STONE[3]); }
};

/** More of his things (dimmed: none of it's stood on): the oak icebox by the cannon (his mini fridge) with a hot plate
 *  and a little iron cauldron of oats on it; an illuminated page nailed up over it in his words; the hook board where
 *  the next cape's being sewn (hung half-hemmed, pins in it, the tag still on), his tools on it, the work shelf under
 *  it (pincushion, a spool, a glue pot, shears); tubs of gainer shoved in among the high shelf's books; a gift-shop
 *  jack-o'-lantern bucket of chalk by the coffin bench, chalk handprints on the pillar; candle soot up the stone; a
 *  rubber bat off the gift shop dangling on its string from a strut. */
const paintDen = (g: Ctx) => {
  // ---- the icebox (oak, two brass-latched doors, a drip tray), the hot plate on it, the cauldron, its ladle
  { const x = 4, w = 40, t = -58, Wd = rampOf(dimc('#5A3A20', 0.2)), B = BRASS.map(c => dimc(c, 0.2));
    box(g, x - 1, t - 1, w + 2, -t + 1, INK); box(g, x, t, w, -t, Wd[2]); box(g, x, t, w, 2, Wd[3]); box(g, x, t, 3, -t, Wd[3]); box(g, x + w - 3, t, 3, -t, Wd[1]);
    for (const [dy, dh] of [[4, 24], [32, 22]] as const) { box(g, x + 4, t + dy, w - 8, dh, INK); box(g, x + 5, t + dy + 1, w - 10, dh - 2, Wd[2]); box(g, x + 5, t + dy + 1, w - 10, 1, Wd[4]); box(g, x + w - 10, t + dy + dh / 2 - 3, 5, 6, B[2]); box(g, x + w - 10, t + dy + dh / 2 - 3, 5, 1, B[4]); }
    box(g, x + 2, -4, w - 4, 4, INK); box(g, x + 3, -3, w - 6, 2, IRON[2]);
    // (the hot plate, its coil glowing; the cauldron: iron, round-bellied, a rim, three stub legs; the ladle in it)
    box(g, x + 4, t - 6, w - 8, 6, INK); box(g, x + 5, t - 5, w - 10, 4, '#2A2A30'); box(g, x + 8, t - 6, w - 16, 1, '#E8603A');
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + w / 2, t - 15, 15, 11, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = IRON[2]; g.beginPath(); g.ellipse(x + w / 2, t - 15, 13.5, 9.5, 0, 0, Math.PI * 2); g.fill();
    box(g, x + w / 2 - 10, t - 20, 4, 9, IRON[3]); box(g, x + w / 2 + 6, t - 18, 3, 8, IRON[1]);
    box(g, x + w / 2 - 15, t - 26, 30, 5, INK); box(g, x + w / 2 - 14, t - 25, 28, 3, IRON[3]); box(g, x + w / 2 - 12, t - 26, 24, 2, '#C8B48A');
    box(g, x + w / 2 + 6, t - 40, 2, 16, INK); box(g, x + w / 2 + 6, t - 40, 1, 15, IRON[4]); }
  // ---- the illuminated page nailed up over it: vellum, a red drop cap, a vine border, in his words
  { const x = 18, y = -234, w = 104, h = 98, V = dimc('#D8CCA8', 0.3), VD = dimc('#B8A87E', 0.3);
    box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, V); checker(g, x, y + h - 10, w, 10, VD); box(g, x + w - 3, y, 3, h, VD);
    // (the border: a gilt rule, a green vine winding round it)
    g.strokeStyle = dimc('#A87A1E', 0.25); g.lineWidth = 1; g.strokeRect(x + 4.5, y + 4.5, w - 9, h - 9);
    for (let k = 0; k < 10; k++) { const vx = x + 8 + k * 9.6; box(g, vx, y + 3 + (k % 2) * 2, 3, 2, dimc('#2E6A2A', 0.25)); box(g, vx + 3, y + h - 6 - (k % 2) * 2, 3, 2, dimc('#2E6A2A', 0.25)); }
    // (the drop cap: a red block, a gold T)
    box(g, x + 9, y + 9, 18, 20, INK); box(g, x + 10, y + 10, 16, 18, dimc('#8A1A1A', 0.2)); box(g, x + 12, y + 13, 12, 3, dimc('#E8C870', 0.2)); box(g, x + 16, y + 13, 4, 13, dimc('#E8C870', 0.2));
    signAt(g, 'HOU', x + 28, y + 22, 8, print(10, dimc('#1A0E04', 0.1)), 'left');
    signAt(g, 'SHALT NOT', x + w / 2, y + 44, 8, fit('SHALT NOT', print(10, dimc('#1A0E04', 0.1)), w - 14));
    signAt(g, 'SKIP', x + w / 2, y + 62, 8, print(10, dimc('#1A0E04', 0.1)));
    signAt(g, 'LEG DAY', x + w / 2, y + 80, 8, fit('LEG DAY', print(10, dimc('#8A1010', 0.05)), w - 14));
    for (const [nx, ny] of [[x + 3, y + 2], [x + w - 6, y + 2]] as const) { box(g, nx, ny, 3, 3, INK); box(g, nx, ny, 2, 1, '#8A8A90'); }
    // (a corner torn off, a candle-wax drip)
    g.fillStyle = dimc(STONE[2], 0.25); g.beginPath(); g.moveTo(x + w + 1, y + h - 14); g.lineTo(x + w + 1, y + h + 1); g.lineTo(x + w - 14, y + h + 1); g.closePath(); g.fill();
    box(g, x + 70, y + 12, 3, 9, dimc(WAX[2], 0.2)); box(g, x + 70, y + 12, 1, 9, dimc(WAX[4], 0.2)); }
  // ---- candle soot up the stone over the sconce and over the wheel
  for (const [sx, sy, sw, sh] of [[PILLAR_LX, -340, 12, 26], [WHEEL_LX, -318, 22, 26], [828, -212, 10, 24]] as const) for (let i = 0; i < 4; i++) { g.fillStyle = `rgba(4,2,4,${(0.1 + i * 0.05).toFixed(2)})`; g.beginPath(); g.ellipse(sx, sy + i * 4, sw - i * 2.5, sh - i * 5, 0, 0, Math.PI * 2); g.fill(); }
  // ---- the hook board (an oak batten, iron hooks), the cape on it being sewn, his tools; the work shelf under it
  { const x = 466, y = -238, w = 86, Wd = rampOf(dimc('#4A3020', 0.25));
    box(g, x - 1, y - 1, w + 2, 10, INK); box(g, x, y, w, 8, Wd[2]); box(g, x, y, w, 1, Wd[4]); box(g, x, y + 7, w, 1, Wd[0]);
    for (const hx of [x + 10, x + 34, x + 60, x + 78]) { box(g, hx - 1, y + 3, 3, 3, IRON[1]); box(g, hx, y + 6, 2, 6, IRON[3]); box(g, hx + 1, y + 10, 3, 2, IRON[3]); }
    // (the cape: shiny black polyester, creased in squares from the bag, the tall collar, the red lining showing at a
    // turned-up hem; pins along the hem, the needle and the red thread hanging, the price tag on its barb)
    { const cx = x + 34, top = y + 12, P = ['#0A0A10', '#16161E', '#24242E', '#3A3A48', '#5A5A6A'].map(c => dimc(c, 0.1));
      g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 9, top - 1); g.lineTo(cx + 9, top - 1); g.lineTo(cx + 23, top + 63); g.lineTo(cx - 23, top + 63); g.closePath(); g.fill();
      g.fillStyle = P[2]; g.beginPath(); g.moveTo(cx - 8, top); g.lineTo(cx + 8, top); g.lineTo(cx + 22, top + 62); g.lineTo(cx - 22, top + 62); g.closePath(); g.fill();
      for (const fx of [-12, -4, 4, 12]) box(g, cx + fx, top + 10, 1, 50, P[fx < 0 ? 3 : 1]);
      for (const fy of [20, 36]) box(g, cx - 18 + (fy - 20) * 0.1, top + fy, 36, 1, P[3]);
      box(g, cx - 16, top + 6, 2, 12, P[4]); box(g, cx - 14, top + 24, 2, 10, P[4]);
      g.fillStyle = INK; g.beginPath(); g.moveTo(cx - 12, top + 2); g.lineTo(cx - 9, top - 16); g.lineTo(cx - 3, top + 2); g.closePath(); g.moveTo(cx + 12, top + 2); g.lineTo(cx + 9, top - 16); g.lineTo(cx + 3, top + 2); g.closePath(); g.fill();
      g.fillStyle = P[3]; g.beginPath(); g.moveTo(cx - 11, top + 1); g.lineTo(cx - 9, top - 13); g.lineTo(cx - 5, top + 1); g.closePath(); g.moveTo(cx + 11, top + 1); g.lineTo(cx + 9, top - 13); g.lineTo(cx + 5, top + 1); g.closePath(); g.fill();
      box(g, cx - 2, top - 1, 4, 3, IRON[3]);
      box(g, cx + 4, top + 56, 18, 6, dimc('#8A1A2A', 0.15)); box(g, cx + 4, top + 56, 18, 1, dimc('#C83A4A', 0.15));
      for (let k = 0; k < 5; k++) { box(g, cx - 18 + k * 8, top + 58, 1, 4, '#C8C8D0'); box(g, cx - 18 + k * 8, top + 57, 2, 2, k % 2 ? '#C81E28' : '#E8C870'); }
      g.strokeStyle = dimc('#C81E28', 0.1); g.lineWidth = 1; g.beginPath(); g.moveTo(cx + 20, top + 60); g.quadraticCurveTo(cx + 28, top + 68, cx + 25, top + 76); g.stroke();
      box(g, cx + 24, top + 76, 1, 5, '#C8C8D0');
      box(g, cx + 10, top + 4, 1, 6, '#C8C8D0'); box(g, cx + 6, top + 10, 12, 8, INK); box(g, cx + 7, top + 11, 10, 6, dimc('#E8E2D0', 0.15)); box(g, cx + 9, top + 13, 6, 1, dimc('#B01818', 0.1)); box(g, cx + 9, top + 15, 4, 1, dimc('#B01818', 0.1)); }
    // (the shears and a hammer on their hooks, a coil of rope)
    { const hx = x + 60; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(hx, y + 12); g.lineTo(hx - 3, y + 40); g.moveTo(hx + 2, y + 12); g.lineTo(hx + 6, y + 40); g.stroke();
      g.strokeStyle = IRON[3]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hx, y + 14); g.lineTo(hx - 3, y + 39); g.moveTo(hx + 2, y + 14); g.lineTo(hx + 6, y + 39); g.stroke();
      for (const s of [-1, 1]) { g.strokeStyle = dimc('#141010', 0.1); g.lineWidth = 2; g.beginPath(); g.arc(hx + s * 3, y + 14, 3, 0, Math.PI * 2); g.stroke(); } }
    { const hx = x + 79; box(g, hx - 1, y + 12, 4, 30, INK); box(g, hx, y + 12, 2, 30, dimc(OAK[3], 0.2)); box(g, hx - 6, y + 38, 14, 7, INK); box(g, hx - 5, y + 39, 12, 5, IRON[3]); box(g, hx - 5, y + 39, 12, 1, IRON[4]); }
    for (let k = 0; k < 3; k++) { g.strokeStyle = k % 2 ? dimc('#8A6A3A', 0.25) : dimc('#B08A52', 0.25); g.lineWidth = 2; g.beginPath(); g.ellipse(x + 10, y + 26, 8 - k, 11 - k, 0, 0, Math.PI * 2); g.stroke(); }
    // (the work shelf on its iron brackets: the pincushion (a tomato), a spool, the glue pot, a candle stub, offcuts)
    const sy = -140;
    for (const bx of [x + 6, x + w - 14]) { g.fillStyle = INK; g.beginPath(); g.moveTo(bx - 1, sy + 5); g.lineTo(bx + 9, sy + 5); g.lineTo(bx - 1, sy + 26); g.closePath(); g.fill(); g.fillStyle = IRON[1]; g.beginPath(); g.moveTo(bx, sy + 6); g.lineTo(bx + 7, sy + 6); g.lineTo(bx, sy + 22); g.closePath(); g.fill(); }
    box(g, x - 3, sy - 1, w + 6, 7, INK); box(g, x - 2, sy, w + 4, 5, Wd[2]); box(g, x - 2, sy, w + 4, 1, Wd[3]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + 10, sy - 6, 8, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = dimc('#B82828', 0.15); g.beginPath(); g.ellipse(x + 10, sy - 6, 7, 5, 0, 0, Math.PI * 2); g.fill();
    box(g, x + 8, sy - 13, 4, 3, dimc('#2E6A2A', 0.2)); for (const [px2, py2] of [[x + 6, sy - 12], [x + 13, sy - 11], [x + 10, sy - 14]] as const) box(g, px2, py2 - 3, 1, 3, '#C8C8D0');
    box(g, x + 22, sy - 12, 10, 12, INK); box(g, x + 23, sy - 11, 8, 10, dimc(OAK[3], 0.2)); box(g, x + 23, sy - 9, 8, 6, dimc('#141010', 0.1)); box(g, x + 23, sy - 9, 8, 1, dimc('#3A3A48', 0.1));
    box(g, x + 38, sy - 14, 16, 14, INK); box(g, x + 39, sy - 13, 14, 13, IRON[2]); box(g, x + 39, sy - 13, 14, 2, IRON[4]); box(g, x + 44, sy - 22, 2, 10, dimc(OAK[3], 0.2));
    box(g, x + 58, sy - 4, 22, 4, dimc('#16161E', 0.1)); box(g, x + 62, sy - 7, 14, 3, dimc('#8A1A2A', 0.15));
    candleWax(g, x + 82, sy - 9, 8); }
  // ---- tubs of gainer shoved in among the high shelf's books
  for (const [tx, lbl] of [[838, '#F0C020'], [860, '#C81E28']] as const) { box(g, tx - 1, -277, 20, 27, INK); box(g, tx, -276, 18, 26, dimc('#2A2A30', 0.2)); box(g, tx, -276, 18, 3, dimc('#4A4A52', 0.2)); box(g, tx + 2, -268, 14, 7, dimc(lbl, 0.25)); box(g, tx + 4, -266, 10, 1, INK); }
  // ---- the jack-o'-lantern bucket of chalk by the coffin bench, its dust on the boards; handprints on the pillar
  { const x = 352;
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, -9, 11, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = dimc('#E8741A', 0.2); g.beginPath(); g.ellipse(x, -9, 10, 9, 0, 0, Math.PI * 2); g.fill();
    box(g, x - 9, -17, 4, 12, dimc('#F8A04A', 0.2)); for (const fx of [-4, 3]) box(g, x + fx, -13, 3, 3, INK); box(g, x - 4, -7, 9, 2, INK);
    box(g, x - 8, -20, 16, 3, dimc('#E8E2D0', 0.1)); g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.arc(x, -18, 10, Math.PI, 0); g.stroke();
    checker(g, x - 20, -2, 40, 2, 'rgba(230,226,214,0.4)'); }
  for (const [hx, hy] of [[PILLAR_LX - 4, -150], [PILLAR_LX + 6, -128]] as const) { g.fillStyle = 'rgba(230,226,214,0.22)'; g.beginPath(); g.ellipse(hx, hy, 4, 5, 0, 0, Math.PI * 2); g.fill(); for (let k = 0; k < 4; k++) box(g, hx - 4 + k * 2.4, hy - 9, 1, 4, 'rgba(230,226,214,0.2)'); box(g, hx - 3, hy + 4, 6, 10, 'rgba(230,226,214,0.1)'); }
  // ---- the gift shop's rubber bat on its string, off a strut
  { const x = 787, y = -334;
    box(g, x, -366, 1, 28, '#9A9AA6');
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 16, y - 2); g.lineTo(x - 8, y - 6); g.lineTo(x - 2, y - 2); g.lineTo(x, y - 7); g.lineTo(x + 2, y - 2); g.lineTo(x + 8, y - 6); g.lineTo(x + 16, y - 2); g.lineTo(x + 10, y + 1); g.lineTo(x + 6, y + 5); g.lineTo(x, y + 3); g.lineTo(x - 6, y + 5); g.lineTo(x - 10, y + 1); g.closePath(); g.fill();
    box(g, x - 2, y - 1, 1, 1, '#E83A3A'); box(g, x + 2, y - 1, 1, 1, '#E83A3A'); box(g, x - 9, y - 3, 6, 1, '#2A2A34'); box(g, x + 4, y - 3, 6, 1, '#2A2A34'); }
};

/** The near tie-beam across the top in front (silhouette): oak, cobwebs off it, a chain hanging. Local to the loft. */
const paintNearBeam = (g: Ctx) => {
  box(g, -40, -H - 40, W + 80, 34, '#050203'); box(g, -40, -H - 8, W + 80, 2, '#1E1012');
  for (let x = 60; x < W; x += 210) { box(g, x, -H - 8, 26, 12, '#050203'); box(g, x, -H + 3, 26, 1, '#1E1012'); }
  g.strokeStyle = 'rgba(200,200,214,0.3)'; g.lineWidth = 1;
  for (const wx of [120, 470, 760]) { g.beginPath(); g.moveTo(wx, -H - 6); g.quadraticCurveTo(wx + 14, -H + 14, wx + 34, -H - 6); g.moveTo(wx + 10, -H - 6); g.lineTo(wx + 14, -H + 10); g.stroke(); }
  g.strokeStyle = '#050203'; g.lineWidth = 3; g.setLineDash([4, 2]); g.beginPath(); g.moveTo(330, -H - 6); g.lineTo(330, -H + 14); g.stroke(); g.setLineDash([]);
};

/** The floor: old boards (the lit edge he walks along), the joists under, the dark of the roof void below. */
const paintFloor = (g: Ctx) => {
  box(g, -40, 0, W + 80, 40, '#080304');
  box(g, -40, 0, W + 80, 14, INK); box(g, -40, 1, W + 80, 12, OAK[1]);
  for (let x = -40; x < W + 40; x += 46) { box(g, x, 1, 1, 12, OAK[0]); box(g, x + 18, 5, 6, 1, OAK[0]); }
  box(g, -40, 1, W + 80, 2, '#D4A373'); box(g, -40, 3, W + 80, 2, OAK[3]); checker(g, -40, 5, W + 80, 2, OAK[2]);
  for (let x = -20; x < W + 40; x += 120) { box(g, x, 14, 22, 26, INK); box(g, x + 1, 14, 20, 26, '#1E100C'); box(g, x + 1, 14, 3, 26, '#2E1A12'); }
};

/** The left wall's end: the stone's edge. */
const paintLeft = (g: Ctx) => { box(g, -40, -H - 40, 40, H + 40, '#100A0C'); box(g, -6, -H - 40, 6, H + 40, STONE[1]); box(g, -2, -H - 40, 2, H + 40, STONE[3]); };

/** The passage, opened (local to the loft: x W..W+140 from its left wall): the tunnel's dark through the stone, the
 *  false shelf swung in against its far side, its back of plain planks. */
const paintPassage = (g: Ctx) => {
  const x0 = W, x1 = W + (PART_R - PART_L), t = PASS_TOP - F;
  box(g, x0, t, x1 - x0, -t, '#060304');
  bandedGradient(g, x0, t, x1 - x0, -t, ['#0A0507', '#140A0C', '#1C1012'], 5);
  for (let x = x0 + 10; x < x1; x += 34) box(g, x, t + 6, 2, -t - 12, 'rgba(60,40,44,0.5)');
  box(g, x0, t, x1 - x0, 4, INK); box(g, x0, -4, x1 - x0, 4, STONE[1]); box(g, x0, -4, x1 - x0, 1, '#C08A5A');
  // (the shelf door swung in: an edge-on panel by the left end, its back planks, an iron hinge)
  box(g, x0 + 4, t + 6, 22, -t - 8, INK); box(g, x0 + 5, t + 7, 20, -t - 10, OAK[1]);
  for (let y = t + 14; y < -6; y += 18) box(g, x0 + 5, y, 20, 1, OAK[0]);
  box(g, x0 + 22, t + 16, 4, 6, IRON[3]); box(g, x0 + 22, -26, 4, 6, IRON[3]);
  web(g, x1, t + 4, 18, -1, 1, 'rgba(220,220,230,0.35)');
};
/** The false shelf, shut (the library's face of the stone wall, under its ceiling): a stretch of bookshelf set into the
 *  stone, its books dusty, a gap where one's pulled out; the draft's dust drawn live. */
const paintFalseShelf = (g: Ctx) => {
  const w = PART_R - PART_L, t = PASS_TOP - F, Wd = rampOf(dimc('#3A2414', 0.1));
  box(g, -1, t - 1, w + 2, -t + 1, INK); box(g, 0, t, w, -t, Wd[0]);
  pole(g, 0, t, 9, -t, Wd[2]); pole(g, w - 9, t, 9, -t, Wd[2]);
  box(g, 0, t, w, 10, Wd[2]); box(g, 0, t, w, 2, Wd[3]);
  for (let y = t + 44; y <= -2; y += 38) { spines(g, 11, w - 11, y, 5 + y, 0.25, 22, 10); box(g, 6, y, w - 12, 5, Wd[1]); box(g, 6, y, w - 12, 1, Wd[2]); }
  // (the dust on its books, grayed; the one pulled out a little; the crack of light down its right edge)
  checker(g, 10, t + 12, w - 20, 2, 'rgba(200,190,180,0.25)');
  box(g, 60, t + 26, 7, 20, INK); box(g, 61, t + 25, 6, 20, '#7A1A1A'); box(g, 61, t + 25, 1, 20, '#9A3A3A');
  box(g, w - 3, t + 6, 2, -t - 10, '#E8A050'); box(g, w - 2, t + 6, 1, -t - 10, '#FFE0A0');
  web(g, 0, t, 16, 1, 1, 'rgba(220,220,230,0.4)');
  // (the card nailed across its bottom shelf at eye height, in marker, protesting too much (the owner, 2026-11-02: "make
  // the hidden bookcase have a sign that tries to divert attention how there is nothing there, when there is obviously
  // something there"): fresh white card on old dusty wood: the first thing seen)
  // (left of the middle: the wall's near edge comes over the shelf's right end from the library side)
  g.save(); g.translate(52, -26); g.rotate(-0.05);
  box(g, -46, -22, 92, 44, INK); box(g, -45, -21, 90, 42, '#ECE6D6'); box(g, -45, -21, 90, 2, '#FFFFFF'); box(g, -45, 20, 90, 1, '#C8BEA8');
  for (const nx of [-41, 38]) { box(g, nx, -19, 3, 3, INK); box(g, nx, -19, 2, 1, '#C8C8C0'); }
  signAt(g, 'NOTHING', 0, -12, 7, print(7, '#141010'));
  signAt(g, 'BACK HERE.', 0, -2, 7, print(7, '#141010'));
  signAt(g, 'NOT A DOOR.', 0, 12, 7, fit('NOT A DOOR.', print(7, '#B01818'), 84));
  g.restore();
};

/** One of the old wall shelves up the library's dark top left (on iron brackets; cobwebbed; its lip only dimly lit: up
 *  where the candles don't reach), or the big bookcase's top board under the ceiling (`top`). */
const paintWayShelf = (g: Ctx, w: number, top: boolean, seed: number) => {
  if (!top) for (const bx of [12, w - 22]) { g.fillStyle = INK; g.beginPath(); g.moveTo(bx - 1, 13); g.lineTo(bx + 11, 13); g.lineTo(bx + 5, 48); g.lineTo(bx - 1, 48); g.closePath(); g.fill(); g.fillStyle = IRON[1]; g.beginPath(); g.moveTo(bx, 14); g.lineTo(bx + 9, 14); g.lineTo(bx + 4, 44); g.lineTo(bx, 44); g.closePath(); g.fill(); }
  lipSlab(g, 0, 0, w, top ? 12 : 14, '#3A2818', '#A07E4E');
  // (a few books lying on it, dust, a web hanging off under it)
  pile(g, w * 0.3, 0, top ? 1 : 2, seed, 0.3);
  checker(g, 4, 4, w - 8, 2, 'rgba(160,150,140,0.25)');
  web(g, w - 2, top ? 12 : 14, 22, -1, 1, 'rgba(220,220,230,0.35)');
};

/** The hole the cannon's shot punches down through the library's ceiling at its right end: a ragged black gap through
 *  the plaster and the lath, broken boards hanging down out of it (swung wide a moment as he comes through), plaster
 *  crumbs on its edges. (0, 0): the ceiling's underside at the hole's middle. */
const paintHole = (g: Ctx, swung: boolean) => {
  const P = ['#5A524C', '#7A7068', '#9A9088', '#BAB0A6'];
  // (the gap: jagged, darker going up into the roof)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-40, 0); g.lineTo(-34, -14); g.lineTo(-22, -10); g.lineTo(-14, -22); g.lineTo(2, -16); g.lineTo(14, -24); g.lineTo(28, -12); g.lineTo(40, -16); g.lineTo(44, 0); g.lineTo(34, 6); g.lineTo(18, 3); g.lineTo(4, 8); g.lineTo(-10, 3); g.lineTo(-26, 7); g.closePath(); g.fill();
  g.fillStyle = '#050304'; g.beginPath(); g.moveTo(-32, 0); g.lineTo(-26, -8); g.lineTo(-12, -14); g.lineTo(14, -16); g.lineTo(34, -6); g.lineTo(34, 2); g.lineTo(4, 4); g.lineTo(-24, 3); g.closePath(); g.fill();
  // (the broken lath across it, the plaster's torn lip)
  for (const [x, w] of [[-30, 20], [6, 26]] as const) { box(g, x, -6, w, 3, INK); box(g, x, -5, w, 1, '#6A4826'); }
  for (let k = -36; k < 40; k += 9) { box(g, k, 2 + ((k * 7) & 3), 5, 2, P[(k + 40) % 4]); box(g, k, 2 + ((k * 7) & 3), 5, 1, P[3]); }
  // (the boards hanging down off it: on their nails, swung out as he comes through)
  const board = (x: number, len: number, a: number) => {
    g.save(); g.translate(x, 2); g.rotate(a);
    box(g, -5, 0, 10, len, INK); box(g, -4, 0, 8, len - 1, OAK[2]); box(g, -4, 0, 2, len - 1, OAK[3]); box(g, 2, 0, 2, len - 1, OAK[1]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(-5, len); g.lineTo(-1, len + 7); g.lineTo(2, len + 2); g.lineTo(5, len + 6); g.lineTo(5, len); g.closePath(); g.fill();
    box(g, -2, 3, 3, 3, IRON[4]);
    g.restore();
  };
  board(-24, 34, swung ? -1.1 : -0.25); board(24, 28, swung ? 1.0 : 0.3);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const FLAME = (c: Ctx, x: number, y: number, f: number, seed: number, big = 1) => {
  const fl = (f + seed) % 9 < 4 ? 1 : 0;
  box(c, x - 2 * big, y - 9 * big - fl, 5 * big, (7 + fl) * big, '#E8862A'); box(c, x - 1 * big, y - 7 * big - fl, 3 * big, 4 * big, '#F8D878'); box(c, x, y - 6 * big - fl, 1, 2, '#FFFFFF');
};

/** Behind him: the way up, the false shelf (or the passage, open), the bedroom's hatch; the loft (under the roof's dark
 *  till he's in): the room, the candles' flames, the cannon, Ben. */
export const drawLoftBack = (c: Ctx, state: GameState) => {
  const f = state.frame, h = loftOf(state);
  // The way up: the two wall shelves and the bookcase's top board
  PATH.forEach(([x, y, w], i) => { if (seen(state, x - 30, x + w + 30, y - 40, y + 60)) { c.save(); c.translate(x, y); stamp(c, `sp-way-${i}`, -4, -30, w + 30, 90, g => paintWayShelf(g, w, i === 2, 300 + i * 17)); c.restore(); } });
  // The false shelf in the stone wall (open once he's through it), and the draft out of it
  if (seen(state, PART_L - 40, PART_R + 200, PASS_TOP - 40, F + 20)) {
    c.save(); c.translate(PART_L, F);
    if (h.reveal > 0.3) { c.save(); c.translate(-W, 0); stamp(c, 'sp-passage', W - 2, PASS_TOP - F - 2, PART_R - PART_L + 4, F - PASS_TOP + 4, paintPassage); c.restore(); }
    else stamp(c, 'sp-falseshelf', -2, PASS_TOP - F - 2, PART_R - PART_L + 4, F - PASS_TOP + 4, paintFalseShelf);
    c.restore();
    if (h.reveal < 0.3) for (let i = 0; i < 9; i++) {
      const u = ((f * 0.6 + i * 37) % 160) / 160, x = PART_R + u * 150 + Math.sin(f * 0.05 + i) * 4, y = PASS_TOP + 20 + ((i * 29) % 90) + Math.sin(u * 6 + i) * 6 + u * 16;
      c.fillStyle = `rgba(230,210,180,${(0.55 * (1 - u)).toFixed(2)})`; c.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
  }
  // The hole down through the library's ceiling, once the cannon's put him through it (its boards swung wide a moment)
  if (state.stageMemo[HOLE_MEMO] && seen(state, HOLE.x - 60, HOLE.x + 60, HOLE.y - 40, HOLE.y + 60)) {
    const swung = f - h.hatchAt < 24;
    c.save(); c.translate(HOLE.x, HOLE.y); stamp(c, `sp-hole-${swung}`, -60, -30, 120, 80, g => paintHole(g, swung)); c.restore();
  }
  // The loft
  if (!seen(state, LA - 40, LOFT.b, F - H - 60, F + 40)) return;
  c.save();
  c.beginPath(); c.rect(LA - 40, F - H - 60, W + 40, H + 100); c.clip();
  c.translate(LA, F);
  const CH = 3, cw = (W + 80) / CH;
  for (let i = 0; i < CH; i++) {
    const bx = -40 + i * cw;
    if (!seen(state, LA + bx, LA + bx + cw, F - H - 60, F + 40)) continue;
    stamp(c, `sp-loft-${i}`, bx, -H - 40, cw, H + 80, g => { g.save(); g.beginPath(); g.rect(bx, -H - 40, cw, H + 80); g.clip(); paintWall(g); paintStacks(g); paintGym(g); paintDen(g); paintLeft(g); paintFloor(g); g.restore(); });
  }
  // (the moonlight's dust, drifting down the shaft from the rose window)
  for (let i = 0; i < 10; i++) {
    const u = ((f * 0.2 + i * 53) % 300) / 300;
    c.fillStyle = `rgba(190,210,250,${(0.15 + 0.35 * Math.sin(u * Math.PI)).toFixed(2)})`;
    c.fillRect(Math.round(600 + Math.sin(f * 0.01 + i * 1.7) * (10 + u * 40) + u * 30), Math.round(-250 + u * 250), 2, 2);
  }
  // (the cauldron's steam on the icebox)
  for (let i = 0; i < 3; i++) { const u = ((f * 0.5 + i * 33) % 100) / 100; c.fillStyle = `rgba(220,220,228,${(0.3 * (1 - u)).toFixed(2)})`; c.fillRect(Math.round(22 + Math.sin(f * 0.05 + i) * 4), Math.round(-88 - u * 40), Math.round(3 + u * 4), Math.round(3 + u * 4)); }
  // (the stubs on the barbell's stands, lit)
  for (const sx of [COFFIN.a - 18, COFFIN.b + 18]) FLAME(c, sx, -130, f, sx);
  // (the trial's candles: lit, or a wisp off the wick)
  for (const k of h.candles) {
    const y = -k.h + 8;
    if (k.lit) FLAME(c, k.lx, y, f, k.lx, 1.5);
    else { const t = f - k.outAt; if (t < 120) for (let j = 0; j < 3; j++) { const v = ((t + j * 13) % 40) / 40; c.fillStyle = `rgba(200,200,210,${(0.5 * (1 - v)).toFixed(2)})`; c.fillRect(Math.round(k.lx + Math.sin(v * 6 + j) * 3), Math.round(y - 4 - v * 24), 2, 2); } }
  }
  c.restore();
  drawCannon(c, h.cannon, SPOOKY);
  drawCannonChain(c, h.cannon, gateK(state, h.gate));
  drawGate(c, state, h.gate, 'books', PART_R - PART_L + 20);
  const b = h.ben, at = benAt(state);
  drawBen(c, at.x, at.y, b.facing, b.pose, Math.floor(b.poseT / 5), b.piece);
  // The roof's dark over it till he's in (the same dark and beams the kitchen's roof void is painted with)
  if (h.reveal < 1) {
    c.save(); c.globalAlpha = 1 - h.reveal;
    const a = Math.max(LA - 40, state.camera.x - 40), bb = Math.min(LOFT.b, state.camera.x + CANVAS_WIDTH + 40), top = F - H - 60, bot = F + 40;
    if (bb > a) {
      box(c, a, top, bb - a, bot - top, '#080304');
      for (let x = Math.floor(a / 160) * 160; x < bb; x += 160) { const x0 = Math.max(a, x), x1 = Math.min(bb, x + 20); if (x1 > x0) { box(c, x0, top, x1 - x0, bot - top, '#140A08'); if (x >= a) box(c, x, top, Math.min(3, bb - x), bot - top, '#1E100C'); } }
    }
    c.restore();
  }
};

/** In front of him: Ben's words over his head (only while said; not while his gross-up has them). */
export const drawLoftFront = (c: Ctx, state: GameState) => {
  const h = loftOf(state);
  // (the near tie-beam over it all, in silhouette, once the loft's showing)
  if (h.reveal > 0 && seen(state, LA - 40, LOFT.b, F - H - 60, F - H + 30)) {
    c.save(); c.globalAlpha = h.reveal; c.beginPath(); c.rect(LA - 40, F - H - 60, W + 40, 100); c.clip(); c.translate(LA, F);
    stamp(c, 'sp-loft-near', -40, -H - 40, W + 80, 60, paintNearBeam);
    c.restore();
  }
  if (h.reveal < 0.5 || !h.ben.said || h.script?.gross) return;
  const at = benAt(state);
  saidOver(c, h.ben.said.text, at.x, benHeadY(at.y), '#FFFFFF', 220);
};

/** Screen space: his gross-up while it's up; SKIP >> while the scene can be skipped. */
export const drawLoftHud = (c: Ctx, state: GameState) => {
  if (!inLoft(state)) return;
  const h = loftOf(state), sc = h.script;
  if ((h.phase === 'meet' || h.phase === 'gift') && sc?.gross) {
    drawBenGrossBack(c, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawBenGross(c, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, 0.9 + 0.1 * Math.min(1, sc.grossT / 10), state.frame, h.phase === 'meet' ? 'cape' : null, !!h.ben.said);
    if (h.ben.said) saidOver(c, h.ben.said.text, CANVAS_WIDTH / 2 + 60, 120);
  }
  if ((h.phase === 'meet' || h.phase === 'gift') && h.all > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};

/** The castle's light, and the loft's: in it, its own dark (deeper, a cold tint), the candles' warm pools, the moon down
 *  through the rose window, a glow about him; from the library, a warm glow leaking out of the false shelf (the tell). */
export const loftLighting = (base: SceneLight | null, state: GameState): SceneLight | null => {
  const h = loftOf(state), f = state.frame, p = state.player;
  const near = state.camera.x < LOFT.b + 500 && state.camera.x + CANVAS_WIDTH > LA - 200 && state.camera.y < F + 400 && state.camera.y + CANVAS_HEIGHT > F - H - 200;
  if (!near) return base;
  const lights: Light[] = [...(base?.lights ?? [])];
  if (h.reveal > 0) {
    const k = h.reveal;
    for (const cd of h.candles) if (cd.lit) { const fl = 0.85 + 0.15 * Math.sin(f * 0.3 + cd.lx); lights.push({ x: LA + cd.lx, y: F - cd.h, r: 190, a: 0.8 * fl * k, color: 'rgba(255,180,100,0.12)' }); }
    for (const sx of [COFFIN.a - 18, COFFIN.b + 18]) lights.push({ x: LA + sx, y: F - 136, r: 120, a: 0.5 * k, color: 'rgba(255,180,100,0.08)' });
    lights.push({ x: LA + 24, y: F - 64, r: 60, a: 0.45 * k, color: 'rgba(248,113,80,0.12)' });
    lights.push({ x: LA + 600, y: F - 300, r: 120, a: 0.6 * k, color: 'rgba(150,180,240,0.12)' });
    lights.push({ x: LA + 600, y: F - 260, r: 260, cone: 80, a: 0.5 * k, color: 'rgba(150,180,240,0.08)' });
    lights.push({ x: p.pos.x + p.width / 2, y: p.pos.y + 20, r: 140, a: 0.35 * k });
  }
  if (h.reveal < 1) lights.push({ x: PART_R + 8, y: F - 60, r: 150, a: 0.5 * (1 - h.reveal), color: 'rgba(255,170,90,0.10)' });
  const inside = loftView(state) && h.reveal > 0.5;
  return { ...(base ?? { dark: 0.42 }), dark: inside ? 0.56 : base?.dark ?? 0.42, shade: inside ? [12, 8, 20] : base?.shade, lights };
};

