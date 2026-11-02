// The gift shop's places, drawn (giftShop.ts has the what and why):
//
//   OUTSIDE (world, over the section's own art, both the show's and the real stage's):
//     - THE ARROW on the lawn: a park sign, a fat red arrow board pointing left (GIFT SHOP, a shopping bag on it) on a
//       candy-striped pole, sunk in a hummock of grass. Scenery: nothing lit along a top.
//     - THE SHINGLE at the porch door: a little swinging board off a brass bracket over the door (GIFT SHOP), an OPEN
//       card hung on the knob, a WELCOME mat (flat on the floor).
//   THE STOCKROOM (painted once in chunks, at the game's grade): the back wall (cinder block in a muted ramp, banded
//     where the lamps fall), tall steel shelving loaded with unsold souvenirs (bobblehead boxes, I ♥ DC mugs, snow
//     globes, Socks plush, rolled flags: all dimmed, no lit edges, none of it's stood on), the ceiling's beams, the
//     hatch he drops through, cage lamps on cords over each stack, stenciled signs (EMPLOYEES ONLY, RETURNS ▼ ALL SALES
//     FINAL); the crate stacks in the play plane (cardboard courses on pallets, lit along their tops: stood on).
//   THE TOWERS (live: they lean): sway.ts's bending spine, but stacked souvenirs (each tier a baked sprite: a bobblehead
//     box, a giant mug, a snow globe crate, a tub of plush cats, a bundle of flags), turned along the spine; a pallet lid
//     lit along its top.
//   THE RETURNS CHUTE (in front, painted once): the dark the towers and stacks go down into, banded and dithered to
//     black; he drops into it.
//   THE HEART CANISTER: a glass jar with brass caps, a fat red heart in it (+), a FREE tag on a string, on a velvet
//     plinth; a soft pulsing glow (live), bobbing.
//   stockLighting: dim down here; the lamps' cones, the hatch's daylight, the heart's red, a glow about him.

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawCannon } from '../../upgrades/returnCannon';
import { signText } from '../../signLetters';
import { INK, box, mix, stamp, checker, still, ramp6, toonLetters, hour, STEEL, CHERRY, BRASS, type Ctx } from '../kit';
import { GY } from '../geometry';
import { towerTop, lidW, type Tower } from '../sway';
import { STOCK, SL, SH, STOCK_W, CEIL_H, STACKS, DOOR_X, ARROW_X, HEART_X, HEART_Y, shopOf, inStock } from './giftShop';

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** Down here, scenery's colors are pulled toward the dark (none of it reads as somewhere to stand). */
const DARKS = '#2A2036';
const dimS = (col: string, k = 0.42) => mix(col, DARKS, k);
const dimR = (R: string[], k = 0.42) => R.map(c => dimS(c, k));
const inkP = (g: Ctx, path: () => void, fill: string, w = 2) => { g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); };
/** A slab stepped across (lit left, shaded right, dithered), inked. */
const slabI = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  box(g, x, y, w, h, R[3]); box(g, x, y, Math.max(1, Math.round(w * 0.18)), h, R[4]); box(g, x, y, w, 2, R[4]);
  box(g, x + Math.round(w * 0.72), y, w - Math.round(w * 0.72), h, R[2]); checker(g, x + Math.round(w * 0.72) - 2, y, 2, h, R[2], 0, 1);
  box(g, x, y + h - 2, w, 2, R[1]);
};
const label = (g: Ctx, text: string, x: number, y: number, col: string, cell = 1) => signText(g, text, x, y, { sx: cell, sy: cell, gap: 1, fill: col });
const CARD = ['#3E2410', '#6A421E', '#94622E', '#B8844A', '#D4A66A', '#ECCA92'];
const NAVY = ['#0A1430', '#122250', '#1E3A7E', '#2E56AE', '#5A82D2', '#9AB8EE'];
const RED = CHERRY;
const LIT = '#FFF2D6';

// ---------------------------------------------------------------------------------------------------------------
// Outside

/** The arrow sign on the lawn (feet at the ground), painted once a time of day. */
const paintArrow = (g: Ctx) => {
  const G = ramp6(hour('#6CCC6A')), R = ramp6(hour(RED[3])), P = ['#FFF7E8', '#EF4444'].map(c => hour(c));
  // (the hummock it's sunk in)
  inkP(g, () => g.ellipse(0, 2, 30, 10, 0, Math.PI, 0), G[2], 2);
  box(g, -20, -4, 26, 3, G[3]); box(g, -12, -6, 10, 2, G[4]); checker(g, -24, -2, 48, 2, G[1], 0, 1);
  for (const [fx, fc] of [[-17, '#FFFFFF'], [14, '#F9A8D4']] as const) { box(g, fx, -5, 2, 2, fc); }
  // (the pole: candy-striped, lit down its left)
  box(g, -5, -128, 10, 126, INK); box(g, -4, -127, 8, 124, P[0]);
  for (let y = -124; y < -4; y += 14) { g.fillStyle = P[1]; g.beginPath(); g.moveTo(-4, y + 6); g.lineTo(4, y); g.lineTo(4, y + 6); g.lineTo(-4, y + 12); g.closePath(); g.fill(); }
  box(g, -4, -127, 2, 124, 'rgba(255,255,255,0.35)'); box(g, 2, -127, 2, 124, 'rgba(26,16,40,0.25)');
  inkP(g, () => g.arc(0, -130, 6, 0, Math.PI * 2), hour(BRASS[4]), 2); box(g, -3, -133, 2, 2, '#FFFFFF');
  // (the arrow board, pointing left: fat, rounded, stepped down in bands, its rim lit up top; GIFT SHOP on it)
  const ax = -104, bx = 84, top = -118, bot = -72, mid = (top + bot) / 2;
  const arrow = () => { g.moveTo(ax, mid); g.lineTo(ax + 30, top - 10); g.lineTo(ax + 30, top); g.lineTo(bx, top); g.quadraticCurveTo(bx + 6, top, bx + 6, top + 6); g.lineTo(bx + 6, bot - 6); g.quadraticCurveTo(bx + 6, bot, bx, bot); g.lineTo(ax + 30, bot); g.lineTo(ax + 30, bot + 10); g.closePath(); };
  g.fillStyle = '#3A1030'; g.beginPath(); g.save(); g.translate(3, 3); arrow(); g.restore(); g.fill();
  g.save(); g.beginPath(); arrow(); g.clip();
  const n = 5; for (let i = 0; i < n; i++) { const y0 = top - 10 + ((bot + 10 - top + 10) * i) / n; box(g, ax, y0, bx - ax + 8, (bot - top + 20) / n + 1, R[4 - Math.min(3, i)]); if (i) checker(g, ax, y0 - 1, bx - ax + 8, 2, R[4 - Math.min(3, i)], i % 2, 1); }
  box(g, ax, top - 10, bx - ax + 8, 3, R[5]);
  g.restore();
  g.beginPath(); arrow(); g.strokeStyle = INK; g.lineWidth = 3; g.lineJoin = 'round'; g.stroke();
  // (a little shopping bag at the tip end: white, red handles)
  const sx = ax + 40, sy = mid - 2;
  inkP(g, () => g.rect(sx - 7, sy - 6, 14, 14), '#FFFFFF', 1.5); box(g, sx - 6, sy - 5, 4, 12, '#FFFFFF'); box(g, sx + 3, sy - 5, 3, 12, '#D8D4E6');
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy - 6, 4, Math.PI, 0); g.stroke();
  box(g, sx - 2, sy - 1, 4, 4, R[3]);
  if (fontReady()) signText(g, 'GIFT SHOP', ax + 54, mid + 7, toonLetters(2, undefined, 7), 'left');
};

/** The shingle over the porch door, the OPEN card, the WELCOME mat (world: the door's middle, at the floor). */
const paintShingle = (g: Ctx) => {
  const M = ramp6(hour('#1E3A7E')), B = ramp6(hour(BRASS[3]));
  // (the bracket: a brass arm out of the wall over the door, a curl under it)
  box(g, 40, -214, 6, 18, INK); box(g, 41, -213, 4, 16, B[3]);
  box(g, 40, -212, 70, 5, INK); box(g, 41, -211, 68, 3, B[3]); box(g, 41, -211, 68, 1, B[5]);
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(46, -200); g.quadraticCurveTo(70, -200, 76, -210); g.stroke();
  g.strokeStyle = B[4]; g.lineWidth = 1.5; g.stroke();
  // (two little chains down to the board)
  for (const cx of [52, 102]) for (let k = 0; k < 3; k++) { g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, -204 + k * 5, 1.6, 2.6, 0, 0, Math.PI * 2); g.stroke(); }
  // (the board: navy, gold rim, GIFT SHOP in gold, a star either side)
  inkP(g, () => g.roundRect(42, -190, 72, 40, 5), M[2], 2.5);
  box(g, 45, -187, 66, 34, M[3]); box(g, 45, -187, 66, 6, M[4]); box(g, 45, -159, 66, 6, M[1]); checker(g, 45, -181, 66, 2, M[3], 0, 1);
  g.strokeStyle = B[4]; g.lineWidth = 1.5; g.strokeRect(47.5, -184.5, 61, 29);
  if (fontReady()) {
    const look = { sx: 1, sy: 1, gap: 1, bold: true, fill: [B[5], B[4], B[3]], ink: INK };
    signText(g, 'GIFT', 78, -173, look); signText(g, 'SHOP', 78, -162, look);
  }
  for (const sx of [51, 105]) { g.fillStyle = B[4]; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 1.4 : 3.4; g.lineTo(sx + Math.cos(a) * r, -170 + Math.sin(a) * r); } g.closePath(); g.fill(); }
  // (the OPEN card hung on the knob by its string)
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(22, -86); g.lineTo(16, -78); g.moveTo(22, -86); g.lineTo(28, -78); g.stroke();
  inkP(g, () => g.rect(9, -78, 26, 13), '#FFFFFF', 1.5); box(g, 10, -77, 24, 2, '#FFFFFF'); box(g, 10, -67, 24, 1, '#D8D4E6');
  if (fontReady()) label(g, 'OPEN', 22, -68, '#DC2626');
  // (the WELCOME mat, flat on the porch floor in front of the door)
  inkP(g, () => g.rect(-40, -3, 80, 4), hour('#7A4A1E'), 1.5); box(g, -38, -2, 76, 1, hour('#B07A44'));
  for (let x = -36; x < 36; x += 6) box(g, x, -1, 3, 1, hour('#5A3414'));
};

/** World space, behind him (after the section's own): the arrow on the lawn, the shingle at the porch door. */
export const drawGiftShopOutside = (c: Ctx, state: GameState) => {
  const v0 = state.camera.x - 120, v1 = state.camera.x + CANVAS_WIDTH + 120;
  if (ARROW_X > v0 && ARROW_X < v1) still(c, 'wh1-gift-arrow', ARROW_X, GY, -112, -150, 212, 156, paintArrow);
  if (DOOR_X > v0 - 120 && DOOR_X < v1) still(c, 'wh1-gift-shingle', DOOR_X, GY, -44, -222, 168, 228, paintShingle);
};

// ---------------------------------------------------------------------------------------------------------------
// The stockroom, painted once (local: x a stockroom x, y up from the datum is negative)

const WALL = ['#1E1624', '#2C2232', '#3A2E40', '#4A3C4E', '#5C4C5C', '#726070'];
const FLOOR_H = 210;
const LAMPS = [130, 520, 980, 1430, 1830, 2330];

/** One thing on a shelf (souvenirs, dimmed): by kind, its foot's middle at (x, y). */
const souvenir = (g: Ctx, kind: number, x: number, y: number, s: number) => {
  const k = kind % 6;
  if (k === 0) {
    // (a bobblehead box: a window, a big head inside)
    const C = dimR(CARD); slabI(g, x - 14, y - 30, 28, 30, C);
    box(g, x - 9, y - 26, 18, 16, dimS('#C8D8E8')); g.fillStyle = dimS('#F2C49A'); g.beginPath(); g.arc(x, y - 20, 6, 0, Math.PI * 2); g.fill();
    box(g, x - 3, y - 21, 2, 2, INK); box(g, x + 1, y - 21, 2, 2, INK); box(g, x - 6, y - 26, 12, 3, dimS('#E8E0D0'));
    box(g, x - 10, y - 7, 20, 3, dimS(RED[3]));
  } else if (k === 1) {
    // (a row of I-heart-DC mugs)
    for (let i = 0; i < 2; i++) { const mx = x - 12 + i * 15; inkP(g, () => g.rect(mx - 6, y - 16, 12, 16), dimS('#F4F2FA'), 1.5); box(g, mx - 5, y - 15, 3, 14, dimS('#FFFFFF')); g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.arc(mx + 7, y - 9, 3.5, -Math.PI / 2, Math.PI / 2); g.stroke(); box(g, mx - 2, y - 11, 4, 3, dimS(RED[3])); }
  } else if (k === 2) {
    // (snow globes on their bases)
    for (let i = 0; i < 2; i++) { const gx = x - 9 + i * 18; box(g, gx - 6, y - 5, 12, 5, dimS(BRASS[2])); g.fillStyle = INK; g.beginPath(); g.arc(gx, y - 12, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = dimS('#A8C8E8'); g.beginPath(); g.arc(gx, y - 12, 7, 0, Math.PI * 2); g.fill(); box(g, gx - 3, y - 12, 6, 5, dimS('#F4F2FA')); box(g, gx - 4, y - 16, 2, 2, dimS('#FFFFFF')); }
  } else if (k === 3) {
    // (a Socks plush: black and white cat, sat)
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, y - 9, 10 * s, 9, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x, y - 22, 8, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x - 7, y - 26); g.lineTo(x - 5, y - 33); g.lineTo(x - 1, y - 28); g.moveTo(x + 7, y - 26); g.lineTo(x + 5, y - 33); g.lineTo(x + 1, y - 28); g.fill();
    g.fillStyle = dimS('#2A2A34'); g.beginPath(); g.arc(x, y - 22, 6.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = dimS('#F4F2FA'); g.beginPath(); g.ellipse(x, y - 19, 4, 3, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(x, y - 8, 5, 6, 0, 0, Math.PI * 2); g.fill();
    box(g, x - 3, y - 24, 2, 2, dimS('#F6D23A')); box(g, x + 1, y - 24, 2, 2, dimS('#F6D23A'));
  } else if (k === 4) {
    // (rolled flags in a bin)
    slabI(g, x - 13, y - 14, 26, 14, dimR(NAVY));
    for (let i = 0; i < 4; i++) { const fx = x - 9 + i * 6; box(g, fx - 1, y - 30, 4, 18, INK); box(g, fx, y - 29, 2, 16, dimS(i % 2 ? '#F4F2FA' : RED[3])); }
  } else {
    // (a plain shipping box, tape and a label)
    const C = dimR(CARD); slabI(g, x - 16, y - 24 * s, 32, 24 * s, C);
    box(g, x - 2, y - 24 * s, 4, 24 * s, dimS('#C8A870')); box(g, x - 10, y - 14 * s, 8, 6, dimS('#F4F2FA'));
  }
};

const paintStockBack = (g: Ctx) => {
  const W = WALL;
  const L = -80, Rr = STOCK_W + 80, top = -CEIL_H - 60;
  // (the wall: cinder block in courses, a muted ramp banded lighter up under the lamps' height)
  const bandsY = [top, -760, -620, -480, -340, -FLOOR_H];
  const bandCols = [W[1], W[2], W[3], W[3], W[2]];
  for (let i = 0; i < bandCols.length; i++) { box(g, L, bandsY[i], Rr - L, bandsY[i + 1] - bandsY[i] + 1, bandCols[i]); if (i) checker(g, L, bandsY[i] - 1, Rr - L, 2, bandCols[i], i % 2, 1); }
  for (let y = -FLOOR_H - 24; y > top; y -= 24) {
    box(g, L, y, Rr - L, 2, W[0]);
    const off = ((-y / 24) & 1) * 30;
    for (let x = L + off; x < Rr; x += 60) { box(g, x, y, 2, 24, W[0]); box(g, x + 2, y + 2, 56, 1, W[4]); }
  }
  // (the chute's sill along the wall's foot: a concrete lip, dark under it; nothing lit)
  box(g, L, -FLOOR_H - 2, Rr - L, 16, INK); box(g, L, -FLOOR_H, Rr - L, 12, W[2]); box(g, L, -FLOOR_H, Rr - L, 2, W[3]);
  checker(g, L, -FLOOR_H + 10, Rr - L, 2, W[0], 0, 1);
  // (the shelving: tall steel units, the souvenirs on their shelves; dimmed, nothing lit along a top)
  const S = dimR(STEEL, 0.35);
  for (let ux = 40; ux < STOCK_W; ux += 330) {
    const uw = 250, shelves = [-300, -450, -600, -750];
    for (const sx of [ux, ux + uw]) { box(g, sx - 1, -790, 8, 790 - FLOOR_H + 2, INK); box(g, sx, -789, 6, 789 - FLOOR_H, S[3]); box(g, sx, -789, 2, 789 - FLOOR_H, S[4]); for (let y = -780; y < -FLOOR_H; y += 14) box(g, sx + 2, y, 2, 3, S[1]); }
    for (const sy of shelves) {
      // (the things on it first, then the shelf's face over their feet)
      let x = ux + 22;
      while (x < ux + uw - 20) { const kind = Math.floor(hash(ux * 0.37 + sy * 1.3 + x) * 6), sc = 0.9 + hash(x + sy) * 0.3; souvenir(g, kind, x, sy, sc); x += 34 + Math.floor(hash(x * 3.1 + sy) * 14); }
      box(g, ux, sy - 1, uw + 6, 9, INK); box(g, ux + 1, sy, uw + 4, 7, S[2]); box(g, ux + 1, sy + 5, uw + 4, 2, S[1]);
    }
    // (a tag on the unit)
    const what = ['BOBBLEHEADS', 'MUGS', 'SNOW GLOBES', 'SOCKS PLUSH', 'FLAGS', 'MISC'][Math.floor(ux / 330) % 6];
    if (fontReady()) { box(g, ux + uw / 2 - 40, -812, 80, 14, INK); box(g, ux + uw / 2 - 39, -811, 78, 12, dimS('#F4E8D2', 0.3)); label(g, what, ux + uw / 2 + 3, -802, '#3A2A1E'); }
  }
  // (stenciled on the wall: EMPLOYEES ONLY by the hatch; RETURNS and its arrows over the chute)
  if (fontReady()) {
    const sten = (t: string, x: number, y: number, cell: number) => signText(g, t, x, y, { sx: cell, sy: cell, gap: 1, bold: true, stencil: true, fill: dimS('#F6D23A', 0.35), ink: INK });
    sten('EMPLOYEES ONLY', 330, -840, 2);
    for (const rx of [560, 1260, 2040]) { sten('RETURNS', rx, -232, 2); }
    for (const rx of [1630]) { sten('ALL SALES FINAL', rx, -232, 2); }
  }
  for (const rx of [490, 630, 1190, 1330, 1970, 2110]) { g.fillStyle = INK; g.beginPath(); g.moveTo(rx - 10, -226); g.lineTo(rx + 10, -226); g.lineTo(rx, -214); g.closePath(); g.fill(); g.fillStyle = dimS('#F6D23A', 0.35); g.beginPath(); g.moveTo(rx - 7, -225); g.lineTo(rx + 7, -225); g.lineTo(rx, -216); g.closePath(); g.fill(); }
  // (the ceiling: a concrete slab, beams end on, the hatch he came down (open, the lid hung down, light through))
  box(g, L, top, Rr - L, 64, INK); box(g, L, top, Rr - L, 58, W[1]); box(g, L, top + 52, Rr - L, 4, W[0]); checker(g, L, top + 48, Rr - L, 2, W[0], 0, 1);
  for (let x = L + 40; x < Rr; x += 220) { box(g, x - 1, top + 56, 26, 22, INK); box(g, x, top + 56, 24, 20, W[2]); box(g, x, top + 56, 3, 20, W[3]); }
  const hx = 120;
  box(g, hx - 40, top, 80, 60, '#FFF4D8'); box(g, hx - 40, top, 80, 60, 'rgba(255,214,150,0.4)');
  box(g, hx - 42, top + 56, 84, 4, INK);
  // (the hatch's lid, hung down off its hinge)
  inkP(g, () => { g.moveTo(hx + 40, top + 58); g.lineTo(hx + 46, top + 58); g.lineTo(hx + 52, top + 132); g.lineTo(hx + 46, top + 134); g.closePath(); }, '#6A4A2E', 2);
  // (the cage lamps' cords down from the ceiling (the lamps themselves drawn live))
  for (const lx of LAMPS) { box(g, lx - 1, top + 58, 2, 110, INK); }
  // (the crate stacks, in the play plane: cardboard in courses down into the dark, a pallet on top, lit along it)
  for (const [a, b, h] of STACKS) paintStack(g, a, b, h);
};

/** A crate stack (play plane): from its top h down past the chute's dark. */
const paintStack = (g: Ctx, a: number, b: number, h: number) => {
  const w = b - a, C = CARD;
  // (the pallet on top: planks end on, lit along the top: what he stands on)
  box(g, a - 1, -h - 1, w + 2, 14, INK); box(g, a, -h, w, 12, '#8A5E34'); box(g, a, -h + 9, w, 3, '#5A3A1E');
  for (let x = a + 4; x < b - 4; x += 30) { box(g, x, -h + 3, 20, 4, '#A87848'); box(g, x + 20, -h, 2, 12, '#4A2E16'); }
  // (the courses of boxes under it, each a little offset, darker as they go down)
  let y = -h + 13, row = 0;
  while (y < 40) {
    const ch = 46, dk = Math.min(0.75, row * 0.13);
    const R = C.map(c => mix(c, DARKS, dk));
    let x = a + ((row * 23) % 40) - 20;
    while (x < b) {
      const bw = 56 + Math.floor(hash(a + x * 1.7 + row * 9.3) * 40), x0 = Math.max(a, x), x1 = Math.min(b, x + bw);
      if (x1 - x0 > 6) {
        slabI(g, x0, y, x1 - x0, ch, R);
        // (tape down its middle, a label or THIS SIDE UP)
        const mx = (x0 + x1) / 2;
        box(g, mx - 3, y, 6, ch, mix('#D8B880', DARKS, dk)); box(g, mx - 3, y, 1, ch, mix('#F0D8A8', DARKS, dk));
        const pick = hash(x * 0.9 + row * 4.1);
        if (x1 - x0 > 40 && pick < 0.4) { box(g, x0 + 6, y + 10, 18, 12, mix('#F4F2FA', DARKS, dk)); box(g, x0 + 8, y + 14, 14, 1, mix('#6A6A7A', DARKS, dk)); box(g, x0 + 8, y + 17, 10, 1, mix('#6A6A7A', DARKS, dk)); }
        else if (x1 - x0 > 40 && pick < 0.7) { const ax = x1 - 14; g.fillStyle = mix(RED[2], DARKS, dk); g.beginPath(); g.moveTo(ax, y + 8); g.lineTo(ax + 6, y + 16); g.lineTo(ax - 6, y + 16); g.closePath(); g.fill(); box(g, ax - 2, y + 16, 4, 8, mix(RED[2], DARKS, dk)); }
      }
      x += bw;
    }
    y += ch; row++;
  }
  // (the lit lip along the top: stood on)
  box(g, a + 1, -h - 1, w - 2, 1, INK); box(g, a + 2, -h, w - 4, 2, LIT); box(g, a + 6, -h, w * 0.4, 1, '#FFFFFF');
};

/** The chute's dark, in front: from the sill down to black, banded and dithered. */
const paintStockFront = (g: Ctx) => {
  const L = -80, Rr = STOCK_W + 80;
  const cols = ['rgba(14,8,20,0.28)', 'rgba(14,8,20,0.5)', 'rgba(12,6,18,0.72)', 'rgba(10,5,14,0.88)', '#0A050E'];
  const y0 = -FLOOR_H + 24, step = 38;
  for (let i = 0; i < cols.length; i++) { const y = y0 + i * step; box(g, L, y, Rr - L, i === cols.length - 1 ? 400 : step + 1, cols[i]); if (i) checker(g, L, y - 2, Rr - L, 2, cols[i], i % 2, 1); }
  // (a few lost souvenirs tumbling down it forever: painted, a still life of the fall)
  for (let i = 0; i < 9; i++) { const x = 120 + hash(i * 7.7) * (STOCK_W - 240), y = y0 + 30 + hash(i * 3.3) * 120; g.fillStyle = 'rgba(200,180,160,0.18)'; g.fillRect(Math.round(x), Math.round(y), 6, 5); }
};

const CHUNK = 640;
const chunks = (c: Ctx, state: GameState, key: string, y0: number, h: number, paint: (g: Ctx) => void) => {
  const font = fontReady() ? 'f' : 'n';
  c.save(); c.translate(STOCK.a, STOCK.floor);
  for (let bx = -80; bx < STOCK_W + 80; bx += CHUNK) {
    const bw = Math.min(CHUNK, STOCK_W + 80 - bx);
    if (STOCK.a + bx + bw < state.camera.x - 20 || STOCK.a + bx > state.camera.x + CANVAS_WIDTH + 20) continue;
    stamp(c, `ct-${key}-${bx}-${font}`, bx, y0, bw, h, g => { g.save(); g.beginPath(); g.rect(bx, y0, bw, h); g.clip(); paint(g); g.restore(); });
  }
  c.restore();
};

/** Screen space, under it all: the stockroom's far dark. */
export const drawStockBackdrop = (c: Ctx) => {
  stamp(c, 'ct-stock-far', 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, g => {
    const cols = ['#1A1222', '#160F1E', '#120C18', '#0E0914', '#0A060E'];
    for (let i = 0; i < cols.length; i++) { const y = (CANVAS_HEIGHT * i) / cols.length; box(g, 0, y, CANVAS_WIDTH, CANVAS_HEIGHT / cols.length + 1, cols[i]); if (i) checker(g, 0, y - 1, CANVAS_WIDTH, 2, cols[i], i % 2, 1); }
  });
};

/** World space, behind him: the room, the towers, the heart canister, the cannon. */
export const drawStockBack = (c: Ctx, state: GameState) => {
  const s = shopOf(state);
  if (!s) return;
  chunks(c, state, 'stock-back', -CEIL_H - 60, CEIL_H + 120, paintStockBack);
  const f = state.frame;
  // (the hatch's light down through the dust; the cage lamps, live: a swing on their cords)
  for (let i = 0; i < 8; i++) {
    const u = ((f * 0.4 + i * 61) % 420) / 420;
    c.fillStyle = `rgba(255,240,200,${(0.15 + 0.3 * Math.sin(u * Math.PI)).toFixed(3)})`;
    c.fillRect(Math.round(SL(120) + Math.sin(f * 0.02 + i * 1.9) * (14 + u * 40)), Math.round(SH(CEIL_H) + 60 + u * 420), 2, 2);
  }
  for (const lx of LAMPS) drawLamp(c, SL(lx), SH(CEIL_H) + 168, Math.sin(f * 0.02 + lx) * 0.05);
  drawStockTowers(c, state, s.towers);
  // (the plinth and, while it's there, the heart canister)
  drawPlinth(c, HEART_X, HEART_Y);
  if (s.heart) drawHeart(c, HEART_X, HEART_Y - 82 + Math.sin(f * 0.07) * 3, f);
  drawCannon(c, s.cannon);
};

/** World space, in front: the chute's dark (he drops into it). */
export const drawStockFront = (c: Ctx, state: GameState) => {
  chunks(c, state, 'stock-front', -FLOOR_H + 20, FLOOR_H + 420, paintStockFront);
  // (the room's end walls, near, in silhouette)
  for (const x of [STOCK.a - 60, SL(STOCK_W)]) { box(c, x, SH(CEIL_H + 60), 60, CEIL_H + 500, '#0E0A14'); box(c, x + (x < STOCK.a ? 52 : 0), SH(CEIL_H + 60), 8, CEIL_H + 500, '#241C2E'); }
};

/** A cage work lamp on its cord (live: it sways a hair). */
const drawLamp = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(a);
  c.fillStyle = INK; c.fillRect(-9, 0, 18, 10); c.fillStyle = '#5A5A6A'; c.fillRect(-8, 1, 16, 8); c.fillStyle = '#8A8A9A'; c.fillRect(-8, 1, 16, 2);
  c.fillStyle = '#FFF4C8'; c.beginPath(); c.ellipse(0, 16, 8, 8, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFFFFF'; c.fillRect(-3, 12, 4, 4);
  c.strokeStyle = INK; c.lineWidth = 1.5; for (const dx of [-6, 0, 6]) { c.beginPath(); c.moveTo(dx, 9); c.lineTo(dx * 1.3, 24); c.stroke(); }
  c.beginPath(); c.moveTo(-8, 20); c.lineTo(8, 20); c.stroke();
  for (let r = 3; r > 0; r--) { c.fillStyle = `rgba(255,224,160,${0.05 * (4 - r)})`; c.beginPath(); c.arc(0, 16, 10 + r * 8, 0, Math.PI * 2); c.fill(); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The towers: stacked souvenirs along sway.ts's bending spine (each tier baked once, then drawn turned)

const bakes = new Map<string, HTMLCanvasElement | null>();
const bake = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  if (bakes.has(key)) return bakes.get(key)!;
  if (typeof document === 'undefined') { bakes.set(key, null); return null; }
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * 2); cv.height = Math.ceil(h * 2);
  const g = cv.getContext('2d')!; g.scale(2, 2); paint(g);
  bakes.set(key, cv); return cv;
};
/** A tier, standing up, in a box (w + 12) x (h + 10), its middle at the box's middle. */
const paintTier = (g: Ctx, kind: number, w: number, h: number) => {
  const ox = 6, oy = 5, cx = ox + w / 2;
  if (kind === 0) {
    // (a bobblehead box: cardboard, a window, a big grinning head)
    slabI(g, ox, oy, w, h, CARD);
    box(g, ox + 6, oy + 5, w - 12, h - 16, '#BCD4EA'); box(g, ox + 6, oy + 5, w - 12, 3, '#E2F0FC');
    const r = Math.min(9, (h - 18) / 2);
    g.fillStyle = INK; g.beginPath(); g.arc(cx, oy + 5 + (h - 16) / 2, r + 1, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#F2C49A'; g.beginPath(); g.arc(cx, oy + 5 + (h - 16) / 2, r, 0, Math.PI * 2); g.fill();
    box(g, cx - r * 0.5, oy + 5 + (h - 16) / 2 - r * 0.9, r, 3, '#E8E4DA');
    box(g, cx - 4, oy + 3 + (h - 16) / 2, 2, 2, INK); box(g, cx + 2, oy + 3 + (h - 16) / 2, 2, 2, INK); box(g, cx - 3, oy + 7 + (h - 16) / 2, 6, 1, INK);
    box(g, ox + 2, oy + h - 9, w - 4, 6, RED[3]); box(g, ox + 2, oy + h - 9, w - 4, 1, RED[5]);
  } else if (kind === 1) {
    // (a giant I-heart-DC mug: white china, stepped, a red heart, the handle)
    const R = ['#5A5670', '#8A86A0', '#BEBAD0', '#E6E4F0', '#F8F8FC', '#FFFFFF'];
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(ox + w - 2, oy + h / 2, Math.min(9, h * 0.3), -Math.PI / 2, Math.PI / 2); g.stroke();
    g.strokeStyle = R[3]; g.lineWidth = 2; g.stroke();
    slabI(g, ox + 2, oy, w - 6, h, R);
    box(g, ox + 2, oy, w - 6, 3, R[1]);
    heartPath(g, cx - 4, oy + h / 2, Math.min(7, h * 0.22)); g.fillStyle = INK; g.fill();
    heartPath(g, cx - 4, oy + h / 2, Math.min(7, h * 0.22) - 1.2); g.fillStyle = RED[3]; g.fill();
    if (fontReady() && w > 38) { label(g, 'I', cx - 15, oy + h / 2 + 3, '#1E3A7E'); label(g, 'DC', cx + 9, oy + h / 2 + 3, '#1E3A7E'); }
  } else if (kind === 2) {
    // (a slatted crate of snow globes)
    const Wd = ['#2E1A0C', '#4E3018', '#6E4824', '#8E6232', '#B0844C', '#D2AA70'];
    slabI(g, ox, oy, w, h, Wd);
    for (let i = 0; i < Math.floor(w / 16); i++) { const gx = ox + 8 + i * 16; g.fillStyle = INK; g.beginPath(); g.arc(gx, oy + h * 0.45, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#9CC6EC'; g.beginPath(); g.arc(gx, oy + h * 0.45, 5, 0, Math.PI * 2); g.fill(); box(g, gx - 2, oy + h * 0.45, 4, 3, '#FFFFFF'); box(g, gx - 3, oy + h * 0.45 - 4, 2, 2, '#FFFFFF'); }
    for (const sy of [oy + 3, oy + h - 8]) { box(g, ox, sy, w, 5, INK); box(g, ox + 1, sy + 1, w - 2, 3, Wd[4]); box(g, ox + 1, sy + 1, w - 2, 1, Wd[5]); }
  } else if (kind === 3) {
    // (a clear tub of Socks plush cats, their heads piled up in it)
    box(g, ox, oy, w, h, INK); box(g, ox + 1, oy + 1, w - 2, h - 2, '#CFE2F2');
    for (let i = 0; i < Math.floor(w / 13); i++) for (let j = 0; j < 2; j++) {
      const hx = ox + 7 + i * 13 + (j ? 6 : 0), hy = oy + h - 8 - j * 10;
      if (hy < oy + 6) continue;
      g.fillStyle = INK; g.beginPath(); g.arc(hx, hy, 6, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(hx - 5, hy - 3); g.lineTo(hx - 4, hy - 9); g.lineTo(hx - 1, hy - 5); g.moveTo(hx + 5, hy - 3); g.lineTo(hx + 4, hy - 9); g.lineTo(hx + 1, hy - 5); g.fill();
      g.fillStyle = '#F4F2FA'; g.beginPath(); g.ellipse(hx, hy + 2, 3, 2, 0, 0, Math.PI * 2); g.fill();
      box(g, hx - 3, hy - 2, 2, 2, '#F6D23A'); box(g, hx + 1, hy - 2, 2, 2, '#F6D23A');
    }
    box(g, ox + 2, oy + 2, 3, h - 4, 'rgba(255,255,255,0.5)'); box(g, ox, oy, w, 4, '#2A5CBC'); box(g, ox, oy, w, 1, '#86AEF0');
  } else {
    // (a bundle of folded flags: stripes in steps, the blue canton with stars)
    box(g, ox - 1, oy - 1, w + 2, h + 2, INK);
    const n = Math.max(4, Math.floor(h / 5));
    for (let i = 0; i < n; i++) box(g, ox, oy + (i * h) / n, w, h / n + 1, i % 2 ? '#F4F2FA' : RED[3]);
    box(g, ox, oy, w * 0.42, h * 0.55, NAVY[3]); box(g, ox, oy, w * 0.42, 2, NAVY[4]);
    for (let i = 0; i < 6; i++) box(g, ox + 3 + (i % 3) * (w * 0.12), oy + 3 + Math.floor(i / 3) * 6, 2, 2, '#FFFFFF');
    box(g, ox, oy, 3, h, 'rgba(255,255,255,0.3)'); box(g, ox + w - 4, oy, 4, h, 'rgba(26,16,40,0.3)');
  }
};
const heartPath = (g: Ctx, x: number, y: number, r: number) => {
  g.beginPath(); g.moveTo(x, y + r);
  g.bezierCurveTo(x - r * 1.6, y - r * 0.1, x - r * 0.9, y - r * 1.5, x, y - r * 0.55);
  g.bezierCurveTo(x + r * 0.9, y - r * 1.5, x + r * 1.6, y - r * 0.1, x, y + r);
  g.closePath();
};
/** The lid: a pallet, planks end on, lit along its top (stood on). */
const paintLid = (g: Ctx, w: number) => {
  const ox = 4, oy = 3;
  box(g, ox - 1, oy - 1, w + 2, 16, INK);
  box(g, ox, oy, w, 5, '#B08050'); box(g, ox, oy + 5, w, 2, '#5A3A1E');
  for (let x = ox + 3; x < ox + w - 8; x += Math.max(14, w / 4)) { box(g, x, oy + 7, 10, 7, '#7A5230'); box(g, x, oy + 7, 10, 1, '#A07040'); }
  box(g, ox, oy + 12, w, 2, '#4A2E16');
  box(g, ox + 1, oy, w - 2, 2, LIT); box(g, ox + 4, oy, w * 0.4, 1, '#FFFFFF');
};

const drawStockTowers = (c: Ctx, state: GameState, list: Tower[]) => {
  for (const [ti, t] of list.entries()) {
    const d = t.d, top = towerTop(d, t.ang), half = lidW(d) / 2;
    if (Math.max(d.x, top.x) + half + 60 < state.camera.x || Math.min(d.x, top.x) - half - 60 > state.camera.x + CANVAS_WIDTH) continue;
    const n = Math.max(5, Math.round(d.h / 48));
    const at = (u: number) => ({ x: d.x + Math.sin(t.ang) * d.h * Math.pow(u, 1.6), y: d.y - d.h * u * (1 - (1 - Math.cos(t.ang)) * u), a: t.ang * Math.pow(u, 1.6) });
    const segH = Math.round(d.h / n) + 2;
    for (let i = 0; i < n; i++) {
      const p0 = at(i / n), p1 = at((i + 1) / n);
      // (deep in the chute: not drawn, the dark's over it anyway)
      if (p1.y > SH(-40)) continue;
      const ww = Math.min(lidW(d) - 10, 40 + ((i * 37 + ti * 11) % 4) * 6 - Math.max(0, i - 3) * 2);
      const kind = (i + ti * 2) % 5;
      const cv = bake(`tier-${kind}-${ww}-${segH}`, ww + 12, segH + 10, g => paintTier(g, kind, ww, segH));
      if (!cv) continue;
      const cx = (p0.x + p1.x) / 2, cy = (p0.y + p1.y) / 2;
      c.save(); c.translate(cx, cy); c.rotate((p0.a + p1.a) / 2);
      c.drawImage(cv, -(ww + 12) / 2, -(segH + 10) / 2, ww + 12, segH + 10);
      c.restore();
    }
    // (the pallet lid, tilting a little with the lean (drawn only: the footing's level))
    const lw = half * 2, lv = bake(`lid-${lw}`, lw + 8, 20, g => paintLid(g, lw));
    if (lv) { c.save(); c.translate(top.x, top.y); c.rotate(t.ang * 0.3); c.drawImage(lv, -half - 4, -3, lw + 8, 20); c.restore(); }
    // (the tell: wobble lines off its sides while it's swinging)
    if (Math.abs(t.vel) > 0.004) {
      c.strokeStyle = '#F4E8D2'; c.lineWidth = 2; c.lineCap = 'round';
      const m = at(0.6), side = t.vel > 0 ? -1 : 1;
      for (let k = 0; k < 2; k++) { c.beginPath(); c.arc(m.x + side * (30 + k * 8), m.y, 8 + k * 6, side > 0 ? -0.6 : Math.PI - 0.6, side > 0 ? 0.6 : Math.PI + 0.6); c.stroke(); }
      c.lineCap = 'butt';
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The heart canister and its plinth

const paintCanister = (g: Ctx) => {
  // (local: 72 x 64, the jar's middle at (24, 34), the tag off to its right)
  const B = BRASS, cx = 24;
  // (the glass: a rounded jar, the heart inside, then the glass's shine over it)
  inkP(g, () => g.roundRect(cx - 17, 12, 34, 42, 8), 'rgba(190,220,250,0.35)', 2);
  heartPath(g, cx, 34, 13); g.fillStyle = INK; g.fill();
  heartPath(g, cx, 34, 11.5); g.fillStyle = RED[2]; g.fill();
  g.save(); heartPath(g, cx, 34, 11.5); g.clip();
  box(g, cx - 18, 18, 36, 12, RED[3]); box(g, cx - 18, 18, 14, 8, RED[4]); checker(g, cx - 18, 29, 36, 2, RED[3], 0, 1);
  box(g, cx - 18, 42, 36, 10, RED[1]); checker(g, cx - 18, 41, 36, 2, RED[1], 1, 1);
  g.restore();
  box(g, cx - 8, 24, 3, 3, RED[5]); box(g, cx - 9, 27, 2, 2, '#FFFFFF');
  // (the + on it)
  box(g, cx - 1, 29, 3, 9, INK); box(g, cx - 4, 32, 9, 3, INK); box(g, cx, 30, 1, 7, '#FFFFFF'); box(g, cx - 3, 33, 7, 1, '#FFFFFF');
  box(g, cx - 14, 15, 3, 34, 'rgba(255,255,255,0.45)'); box(g, cx + 11, 18, 2, 28, 'rgba(255,255,255,0.18)');
  // (the brass cap and base)
  for (const [y, h] of [[6, 8], [52, 8]] as [number, number][]) { box(g, cx - 19, y - 1, 38, h + 2, INK); box(g, cx - 18, y, 36, h, B[3]); box(g, cx - 18, y, 36, 2, B[5]); box(g, cx - 18, y + h - 2, 36, 2, B[1]); box(g, cx - 18, y, 4, h, B[4]); }
  // (the FREE tag on its string, off the cap)
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + 16, 10); g.quadraticCurveTo(cx + 22, 16, cx + 20, 22); g.stroke();
  inkP(g, () => { g.moveTo(cx + 14, 22); g.lineTo(cx + 44, 22); g.lineTo(cx + 44, 32); g.lineTo(cx + 14, 32); g.closePath(); }, '#FDF6D8', 1);
  g.fillStyle = INK; g.beginPath(); g.arc(cx + 17, 27, 1.2, 0, Math.PI * 2); g.fill();
  if (fontReady()) signText(g, 'FREE', cx + 31, 30, { sx: 1, sy: 1, gap: 1, fill: '#DC2626' });
};

/** The velvet plinth (scenery: low, behind the play plane, nothing lit along it). */
const drawPlinth = (c: Ctx, x: number, y: number) => {
  still(c, 'wh1-gift-plinth', x, y, -24, -40, 48, 42, g => {
    slabI(g, -14, -30, 28, 30, dimR(['#1E0A14', '#3A1424', '#5A1E34', '#7A2A46', '#9E3E5E', '#C6627E'], 0.25));
    box(g, -18, -36, 36, 7, INK); box(g, -17, -35, 34, 5, dimS(BRASS[3], 0.25)); box(g, -17, -35, 34, 1, dimS(BRASS[5], 0.25));
    box(g, -16, -2, 32, 2, INK);
  });
};
/** How big the canister's drawn (baked at 1). */
const HEART_K = 1.3;
/** The canister, live: its glow pulsing (it's a find), drawn over the baked jar. */
const drawHeart = (c: Ctx, x: number, y: number, f: number) => {
  const k = 0.6 + Math.sin(f * 0.09) * 0.4;
  for (let r = 4; r > 0; r--) { c.fillStyle = `rgba(255,80,90,${(0.07 * k * (5 - r)).toFixed(3)})`; c.beginPath(); c.arc(x, y + 6, 22 + r * 10, 0, Math.PI * 2); c.fill(); }
  const cv = bake('canister', 72, 64, paintCanister);
  if (cv) c.drawImage(cv, Math.round(x - 24 * HEART_K), Math.round(y - 30 * HEART_K), Math.round(72 * HEART_K), Math.round(64 * HEART_K));
  // (a twinkle now and then)
  const tw = f % 90;
  if (tw < 12) { const a = 1 - tw / 12; c.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`; c.fillRect(Math.round(x - 13), Math.round(y - 22 - tw * 0.5), 2, 6); c.fillRect(Math.round(x - 15), Math.round(y - 20 - tw * 0.5), 6, 2); }
};

// ---------------------------------------------------------------------------------------------------------------
// The lighting

/** Down here: dim; each cage lamp's cone, the hatch's daylight, the heart's red, a glow about him. */
export const stockLighting = (state: GameState): SceneLight => {
  const p = state.player, s = shopOf(state);
  const lights: Light[] = [
    { x: SL(120), y: SH(CEIL_H) + 60, r: 520, cone: 110, a: 0.9, color: 'rgba(255,236,190,0.14)' },
    ...LAMPS.map(lx => ({ x: SL(lx), y: SH(CEIL_H) + 186, r: 520, cone: 210, a: 0.85, color: 'rgba(255,214,150,0.1)' })),
    { x: p.pos.x + p.width / 2, y: p.pos.y + 20, r: 150, a: 0.45 },
  ];
  if (s?.heart) lights.push({ x: HEART_X, y: HEART_Y - 66, r: 120, a: 0.8, color: 'rgba(255,70,80,0.18)' });
  return { dark: 0.5, shade: [16, 8, 22], rim: 0.5, lights };
};
export { inStock };
