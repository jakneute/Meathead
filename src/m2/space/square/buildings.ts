// Futureland's shopfronts (the square's, the main drag's, and the walk in's: walkAway/intoSpace.ts paints the same
// fronts): pastel stucco in stepped ramps, a band of trim, the googie roof (a boomerang, a dome, a fin, a saucer up on a
// stalk, a flat parapet), a big display window with the hour in its glass and the gag in it (what they sell: snow
// globes, a robot butler fallen over, a burger the size of a tire...), a chrome door, the name up on a board and the
// joke under it. At the play plane (some he stands on), their sides and tops going back toward the eye (sideBack /
// topBack), the farthest first, then the fronts over them.

import type { GameState } from '../../../m1/game/core/state';
import { type Ctx, type View, INK, box, checker, mix, hash, poly, still, inView, board, slab, starburst, ball, chromePole, glassOf, lit, ramp6, sideBack, topBack, CHROME, PINK, TEAL } from './paint';

export interface Shop { x: number; w: number; h: number; wall: string; trim: string; roof: 'boomerang' | 'dome' | 'fin' | 'flat' | 'saucer'; name: string; sub?: string; nameBg?: string; nameInk?: string; signDrop?: number }
/** How far back the shops' sides go. */
export const SIDE_D = 0.88;

/** Something box-shaped at the play plane whose side and top go back: x0..x1, from `top` down to `bottom`. */
export interface Block { x0: number; x1: number; top: number; bottom: number; col: string; d?: number; noTop?: boolean }

/** The sides (and tops) of the blocks on screen going back, the farthest from the eye first. Draw before their fronts. */
export const drawSides = (c: Ctx, v: View, blocks: Block[]) => {
  const on = blocks.filter(b => b.x1 > v.v0 - 200 && b.x0 < v.v1 + 200);
  on.sort((p, q) => Math.abs((q.x0 + q.x1) / 2 - v.eye.x) - Math.abs((p.x0 + p.x1) / 2 - v.eye.x));
  for (const b of on) {
    const R = ramp6(b.col), d = b.d ?? SIDE_D;
    const sd = v.eye.x > b.x1 ? 1 : v.eye.x < b.x0 ? -1 : 0;
    if (!b.noTop) topBack(c, v.eye, b.x0, b.x1, b.top, d, R);
    if (sd) sideBack(c, v.eye, sd > 0 ? b.x1 : b.x0, sd as 1 | -1, b.top, b.bottom, d, R);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What's in the window

type Goods = (g: Ctx, x: number, y: number, w: number, h: number) => void;
const shelf = (g: Ctx, x: number, y: number, w: number) => { box(g, x, y, w, 3, CHROME[2]); box(g, x, y, w, 1, CHROME[5]); };
const GOODS: [RegExp, Goods][] = [
  [/GIFT|SOUVENIR/, (g, x, y, w, h) => {
    // (snow globes with atoms in, plush atoms, a T-shirt pinned up)
    for (const sy of [y + h * 0.45, y + h - 6]) { shelf(g, x, sy, w); for (let k = 0; k < w / 14 - 1; k++) { const cx = x + 8 + k * 14; if (k % 2) { box(g, cx - 4, sy - 3, 8, 3, '#6A3A1A'); g.fillStyle = INK; g.beginPath(); g.arc(cx, sy - 8, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C8ECFF'; g.beginPath(); g.arc(cx, sy - 8, 5, 0, Math.PI * 2); g.fill(); box(g, cx - 1, sy - 9, 2, 2, '#9470C4'); box(g, cx - 3, sy - 11, 1, 1, '#FFFFFF'); } else ball(g, cx, sy - 6, 5, ['#E8659E', '#22BCAC', '#F0C840'][k % 3]); } }
    box(g, x + w - 26, y + 4, 22, 18, INK); box(g, x + w - 25, y + 5, 20, 16, '#F8FAFC'); box(g, x + w - 29, y + 5, 4, 6, '#F8FAFC'); box(g, x + w - 5, y + 5, 4, 6, '#F8FAFC'); box(g, x + w - 18, y + 10, 6, 6, '#9470C4');
  }],
  [/RESTROOM/, (g, x, y, w, h) => {
    // (frosted glass: a spaceman and a spacewoman on it, OUT OF ORDER tape across)
    checker(g, x, y, w, h, 'rgba(255,255,255,0.35)', 0, 2);
    for (const [cx, skirt] of [[x + w * 0.3, false], [x + w * 0.7, true]] as const) { g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(cx, y + 18, 7, 0, Math.PI * 2); g.fill(); box(g, cx - 6, y + 27, 12, 20, '#F8FAFC'); if (skirt) poly(g, [[cx - 6, y + 40], [cx + 6, y + 40], [cx + 10, y + 50], [cx - 10, y + 50]], '#F8FAFC'); }
    g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(-0.2); box(g, -w / 2 - 10, -5, w + 20, 10, '#FACC15'); for (let k = -w / 2 - 10; k < w / 2 + 10; k += 12) box(g, k, -5, 5, 10, INK); g.restore();
  }],
  [/PHONE/, (g, x, y, w, h) => {
    // (the videophone of the future: a big beige console, a round screen with a face on it, a dial)
    const cx = x + w / 2, cy = y + h * 0.5;
    box(g, cx - 34, cy - 18, 68, 46, INK); box(g, cx - 33, cy - 17, 66, 44, '#E8D8B8'); box(g, cx - 33, cy - 17, 66, 3, '#FFF4DC');
    g.fillStyle = INK; g.beginPath(); g.arc(cx - 10, cy + 4, 15, 0, Math.PI * 2); g.fill(); g.fillStyle = '#7AE6D6'; g.beginPath(); g.arc(cx - 10, cy + 4, 13, 0, Math.PI * 2); g.fill();
    box(g, cx - 15, cy, 3, 3, INK); box(g, cx - 7, cy, 3, 3, INK); box(g, cx - 13, cy + 8, 8, 2, INK);
    g.fillStyle = '#9A8A6A'; g.beginPath(); g.arc(cx + 18, cy + 4, 9, 0, Math.PI * 2); g.fill(); for (let k = 0; k < 8; k++) box(g, cx + 18 + Math.cos(k * 0.8) * 6 - 1, cy + 4 + Math.sin(k * 0.8) * 6 - 1, 2, 2, INK);
  }],
  [/BURGER/, (g, x, y, w, h) => {
    // (a burger the size of a tire, on a stand; the menu board)
    const cx = x + w * 0.35, cy = y + h * 0.55;
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy, 30, 22, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#D8902E'; g.beginPath(); g.ellipse(cx, cy - 6, 28, 14, 0, Math.PI, 0); g.fill();
    for (let k = 0; k < 6; k++) box(g, cx - 16 + k * 6, cy - 14 + (k % 2) * 3, 2, 1, '#FFF4C8');
    box(g, cx - 29, cy - 4, 58, 4, '#4CAF50'); box(g, cx - 28, cy, 56, 6, '#6A3418'); box(g, cx - 27, cy + 6, 54, 3, '#F0C030');
    g.fillStyle = '#C8802A'; g.beginPath(); g.ellipse(cx, cy + 10, 28, 8, 0, 0, Math.PI); g.fill();
    box(g, x + w - 50, y + 6, 44, h - 14, '#1A1A24'); for (let k = 0; k < 5; k++) { box(g, x + w - 46, y + 12 + k * 9, 24, 2, '#F8FAFC'); box(g, x + w - 18, y + 12 + k * 9, 8, 2, '#FDE047'); }
  }],
  [/ROBOT/, (g, x, y, w, h) => {
    // (robot butlers on stands, trays out; the end one toppled over, its tray on the floor)
    for (let k = 0; k < 2; k++) { const cx = x + 24 + k * 40, fy = y + h - 4; box(g, cx - 9, fy - 46, 18, 28, INK); box(g, cx - 8, fy - 45, 16, 26, '#B8C3D6'); box(g, cx - 8, fy - 45, 4, 26, '#E4EAF4'); box(g, cx - 7, fy - 60, 14, 13, INK); box(g, cx - 6, fy - 59, 12, 11, '#B8C3D6'); box(g, cx - 4, fy - 56, 2, 2, '#EF4444'); box(g, cx + 1, fy - 56, 2, 2, '#EF4444'); box(g, cx + 8, fy - 38, 14, 2, CHROME[4]); box(g, cx - 3, fy - 18, 6, 18, CHROME[2]); }
    g.save(); g.translate(x + w - 30, y + h - 8); g.rotate(1.4); box(g, -9, -28, 18, 28, INK); box(g, -8, -27, 16, 26, '#B8C3D6'); box(g, -7, -40, 14, 12, '#B8C3D6'); g.restore();
    box(g, x + w - 70, y + h - 4, 14, 2, CHROME[4]);
  }],
  [/ROCKET POPS/, (g, x, y, w, h) => {
    // (rocket pops in a freezer case, frosted; one huge one on a stand)
    box(g, x + 4, y + h - 22, w - 8, 20, '#E4EAF4'); box(g, x + 4, y + h - 22, w - 8, 2, '#FFFFFF');
    for (let k = 0; k < w / 12 - 1; k++) { const cx = x + 10 + k * 12; poly(g, [[cx - 3, y + h - 20], [cx, y + h - 32], [cx + 3, y + h - 20]], ['#EF4444', '#F8FAFC', '#3B82F6'][k % 3]); }
    const cx = x + w / 2, top = y + 6;
    poly(g, [[cx - 10, top + 50], [cx - 10, top + 16], [cx, top], [cx + 10, top + 16], [cx + 10, top + 50]], INK);
    box(g, cx - 9, top + 16, 18, 12, '#EF4444'); box(g, cx - 9, top + 28, 18, 11, '#F8FAFC'); box(g, cx - 9, top + 39, 18, 10, '#3B82F6'); poly(g, [[cx - 9, top + 16], [cx, top + 2], [cx + 9, top + 16]], '#EF4444'); box(g, cx - 1, top + 50, 2, 8, '#E8C890');
  }],
  [/SMOKE/, (g, x, y, w, h) => {
    // (cartons of ATOMIC cigarettes stacked, glowing green, a wooden spaceman with a cigar)
    for (let r = 0; r < 3; r++) for (let k = 0; k < (w - 40) / 16; k++) { const bx = x + 6 + k * 16, by = y + h - 16 - r * 14; box(g, bx, by, 14, 12, INK); box(g, bx + 1, by + 1, 12, 10, '#F8FAFC'); box(g, bx + 1, by + 4, 12, 3, '#22C55E'); box(g, bx + 3, by + 1, 2, 2, '#A3E635'); }
    const cx = x + w - 18; box(g, cx - 6, y + 16, 12, h - 20, INK); box(g, cx - 5, y + 17, 10, h - 22, '#8A5A30'); g.fillStyle = '#BFE6FF'; g.beginPath(); g.arc(cx, y + 12, 8, 0, Math.PI * 2); g.fill(); box(g, cx + 6, y + 14, 8, 2, '#6A3418'); box(g, cx + 14, y + 13, 2, 2, '#F97316');
  }],
  [/KITCHEN/, (g, x, y, w, h) => {
    // (the kitchen of 2000: a chrome oven with a porthole, meal pills in jars by flavor, all beige)
    box(g, x + 6, y + h - 46, 40, 44, INK); box(g, x + 7, y + h - 45, 38, 42, CHROME[4]); g.fillStyle = INK; g.beginPath(); g.arc(x + 26, y + h - 26, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F59E0B'; g.beginPath(); g.arc(x + 26, y + h - 26, 9, 0, Math.PI * 2); g.fill();
    shelf(g, x + 52, y + h * 0.5, w - 56);
    for (let k = 0; k < (w - 60) / 12; k++) { const jx = x + 56 + k * 12; box(g, jx, y + h * 0.5 - 14, 10, 14, INK); box(g, jx + 1, y + h * 0.5 - 13, 8, 13, '#E8EEF4'); for (let p = 0; p < 4; p++) box(g, jx + 2 + (p % 2) * 3, y + h * 0.5 - 10 + p * 2, 2, 2, ['#D6C6A8', '#C8B898', '#E2D2B4'][p % 3]); }
  }],
  [/EXIT/, (g, x, y, w, h) => {
    // (the gift shop through the glass: chrome turnstiles, a rack of VOYAGE TO 2010 shirts, a cardboard astronaut)
    for (let k = 0; k < 3; k++) { const cx = x + 20 + k * 30, fy = y + h - 4; box(g, cx - 2, fy - 24, 4, 24, CHROME[3]); box(g, cx - 10, fy - 24, 20, 3, CHROME[5]); }
    for (let k = 0; k < 4; k++) { const sx = x + w - 70 + k * 15; box(g, sx, y + 14, 12, 16, ['#9470C4', '#22BCAC', '#E8659E', '#F0C840'][k]); }
    box(g, x + w - 74, y + 12, 62, 2, CHROME[4]);
  }],
  [/DENTIST/, (g, x, y, w, h) => {
    // (a chair, a robot arm with a drill over it, a giant tooth on a stand)
    box(g, x + 10, y + h - 20, 50, 8, '#E8659E'); box(g, x + 10, y + h - 40, 10, 22, '#E8659E');
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 70, y + 6); g.lineTo(x + 50, y + 30); g.lineTo(x + 40, y + h - 30); g.stroke(); g.strokeStyle = CHROME[4]; g.lineWidth = 2; g.stroke(); box(g, x + 38, y + h - 32, 4, 8, '#FDE047');
    const tx = x + w - 30, ty = y + 14; poly(g, [[tx - 12, ty], [tx + 12, ty], [tx + 10, ty + 22], [tx + 6, ty + 34], [tx + 2, ty + 22], [tx - 2, ty + 22], [tx - 6, ty + 34], [tx - 10, ty + 22]], '#FFFFF0'); box(g, tx - 8, ty + 2, 4, 6, '#FFFFFF');
  }],
  [/CAR OF/, (g, x, y, w, h) => {
    // (the car of tomorrow on a turntable: fins, a bubble top, whitewalls)
    const cx = x + w / 2, fy = y + h - 6;
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, fy, w * 0.42, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = CHROME[3]; g.beginPath(); g.ellipse(cx, fy - 1, w * 0.4, 4, 0, 0, Math.PI * 2); g.fill();
    poly(g, [[cx - 60, fy - 10], [cx - 64, fy - 30], [cx - 50, fy - 22], [cx + 50, fy - 24], [cx + 62, fy - 16], [cx + 60, fy - 10]], '#E8659E');
    box(g, cx - 58, fy - 20, 116, 2, '#FCD0E2'); box(g, cx - 56, fy - 14, 112, 2, CHROME[5]);
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, fy - 24, 26, 14, 0, Math.PI, 0); g.fill(); g.fillStyle = '#BFE6FF'; g.beginPath(); g.ellipse(cx, fy - 24, 24, 12, 0, Math.PI, 0); g.fill(); box(g, cx - 14, fy - 32, 6, 2, '#FFFFFF');
    for (const wx of [cx - 36, cx + 36]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, fy - 8, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(wx, fy - 8, 4, 0, Math.PI * 2); g.fill(); }
  }],
  [/PNEUMATIC/, (g, x, y, w, h) => {
    // (clear tubes snaking about, capsules stuck in them, a letter mid-tube)
    for (let k = 0; k < 3; k++) { const ty = y + 14 + k * 18; box(g, x + 4, ty, w - 8, 8, 'rgba(200,236,255,0.5)'); box(g, x + 4, ty, w - 8, 1, '#FFFFFF'); box(g, x + 20 + k * 40, ty + 1, 14, 6, CHROME[3]); }
    box(g, x + w - 30, y + 50, 12, 8, '#F8FAFC'); box(g, x + w - 30, y + 50, 12, 1, '#E8659E');
  }],
  [/MOTEL/, (g, x, y, w, h) => {
    // (curtains drawn, a VACANCY tube lit, an ice machine)
    box(g, x, y, w / 2 - 2, h, '#B84A6A'); box(g, x + w / 2 + 2, y, w / 2 - 2, h, '#B84A6A'); for (let k = 0; k < w; k += 8) box(g, x + k, y, 2, h, '#8E2A4A');
    box(g, x + 10, y + h - 20, 56, 12, '#1A1A24'); g.font = '6px "Press Start 2P"'; g.fillStyle = lit() ? '#FF5A8A' : '#7A3A4A'; g.fillText('VACANCY', x + 13, y + h - 11);
  }],
  [/CLEANERS/, (g, x, y, w, h) => {
    // (a rack of shirts in plastic, a couple glowing green, the conveyor loop)
    box(g, x + 4, y + 8, w - 8, 2, CHROME[4]);
    for (let k = 0; k < (w - 16) / 12; k++) { const sx = x + 8 + k * 12; poly(g, [[sx, y + 10], [sx + 10, y + 10], [sx + 11, y + 36], [sx - 1, y + 36]], k % 3 === 1 ? '#A3E635' : '#E4EAF4'); box(g, sx + 4, y + 6, 2, 4, CHROME[2]); }
  }],
  [/TAN/, (g, x, y, w, h) => {
    // (a tanning bed open, its tubes glowing violet; a crispy mannequin)
    const fy = y + h - 10;
    box(g, x + 8, fy - 10, w - 40, 10, INK); box(g, x + 9, fy - 9, w - 42, 8, '#E4EAF4'); for (let k = 0; k < 6; k++) box(g, x + 12 + k * ((w - 50) / 6), fy - 8, (w - 50) / 6 - 3, 3, '#C084FC');
    poly(g, [[x + 8, fy - 12], [x + 20, fy - 44], [x + w - 40, fy - 44], [x + w - 32, fy - 12]], '#C8D0E0'); for (let k = 0; k < 6; k++) box(g, x + 22 + k * ((w - 64) / 6), fy - 40, (w - 70) / 6, 3, '#E9D5FF');
    ball(g, x + w - 18, fy - 34, 6, '#8A3A1A');
  }],
  [/NEEDLE GIFTS/, (g, x, y, w, h) => {
    // (needle snow globes, I WENT TO SPACE shirts, a model needle)
    for (let k = 0; k < 3; k++) box(g, x + 8 + k * 26, y + 8, 22, 20, ['#F8FAFC', '#E8659E', '#22BCAC'][k]);
    const nx = x + w - 30; box(g, nx - 1, y + 8, 2, h - 14, CHROME[4]); g.fillStyle = '#E8659E'; g.beginPath(); g.ellipse(nx, y + 20, 10, 3, 0, 0, Math.PI * 2); g.fill();
  }],
];
const goodsFor = (name: string): Goods => GOODS.find(([re]) => re.test(name))?.[1] ?? GOODS[0][1];

// ---------------------------------------------------------------------------------------------------------------
// A shop's front

/** A shop's front, painted flat in its own coordinates: its foot at (0, 0), x across 0..w. */
export const paintShopFront = (g: Ctx, sh: Shop) => {
  const { w, h } = sh, R = ramp6(sh.wall), T = ramp6(sh.trim), glass = glassOf(), seed = sh.name.length * 13 + w;
  // The roof (behind the boards: they're drawn last)
  if (sh.roof === 'boomerang') {
    // (a boomerang: two wings up to a point off-center, its underside shaded, its edge lit)
    const px0 = w * 0.35;
    poly(g, [[-32, -h + 6], [px0, -h - 42], [w + 32, -h + 6], [px0, -h - 22]], INK);
    poly(g, [[-28, -h + 3], [px0, -h - 38], [w + 28, -h + 3], [px0, -h - 24]], T[3]);
    poly(g, [[-28, -h + 3], [px0, -h - 24], [w + 28, -h + 3], [px0, -h - 18]], T[1]);
    poly(g, [[-28, -h + 3], [px0, -h - 38], [px0, -h - 34], [-22, -h + 1]], T[5]);
    for (let k = 0.15; k < 1; k += 0.17) box(g, -28 + (px0 + 28) * k, -h + 3 - 41 * k, 2, 2, lit() ? '#FFF3B0' : T[4]);
  } else if (sh.roof === 'dome') {
    // (a dome: stepped bands, ribs, a glint, a little spire)
    const r = w / 2 - 8, cx = w / 2;
    g.fillStyle = INK; g.beginPath(); g.arc(cx, -h, r + 2, Math.PI, 0); g.fill();
    for (let k = 0; k < 4; k++) { g.fillStyle = T[1 + k]; g.beginPath(); g.arc(cx - k * r * 0.08, -h, r * (1 - k * 0.2), Math.PI, 0); g.fill(); }
    g.strokeStyle = T[1]; g.lineWidth = 1; for (let k = 1; k < 6; k++) { const a = Math.PI + (k * Math.PI) / 6; g.beginPath(); g.moveTo(cx, -h - r); g.quadraticCurveTo(cx + Math.cos(a) * r * 0.7, -h + Math.sin(a) * r * 0.9, cx + Math.cos(a) * r, -h); g.stroke(); }
    box(g, cx - r * 0.45, -h - r * 0.7, 6, 3, T[5]);
    chromePole(g, cx, -h - r - 22, -h - r + 2, 3);
    ball(g, cx, -h - r - 24, 4, '#F0C840');
  } else if (sh.roof === 'fin') {
    // (a fin up the right end, a starburst on its tip)
    poly(g, [[w - 52, -h], [w - 20, -h - 104], [w - 4, -h]], INK);
    poly(g, [[w - 48, -h], [w - 21, -h - 98], [w - 8, -h]], T[3]);
    poly(g, [[w - 48, -h], [w - 21, -h - 98], [w - 30, -h]], T[4]);
    poly(g, [[w - 21, -h - 98], [w - 8, -h], [w - 14, -h]], T[1]);
    starburst(g, w - 20, -h - 106, 13);
  } else if (sh.roof === 'saucer') {
    // (a saucer up on a stalk over the roof, its rim of bulbs)
    chromePole(g, w / 2, -h - 42, -h, 8);
    g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, -h - 44, w / 2 - 8, 16, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = T[1]; g.beginPath(); g.ellipse(w / 2, -h - 44, w / 2 - 10, 14, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = T[3]; g.beginPath(); g.ellipse(w / 2, -h - 47, w / 2 - 12, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = T[4]; g.beginPath(); g.ellipse(w / 2 - 10, -h - 50, w / 4, 4, 0, 0, Math.PI * 2); g.fill();
    for (let k = -4; k <= 4; k++) box(g, w / 2 + k * (w / 2 - 16) / 4.5 - 1, -h - 42, 3, 3, lit() ? '#FFF3B0' : T[5]);
    g.fillStyle = INK; g.beginPath(); g.arc(w / 2, -h - 54, 12, Math.PI, 0); g.fill(); g.fillStyle = '#BFE6FF'; g.beginPath(); g.arc(w / 2, -h - 54, 10, Math.PI, 0); g.fill(); box(g, w / 2 - 6, -h - 60, 3, 2, '#FFFFFF');
  } else {
    // (a parapet: a coping lit along its top, its face banded)
    box(g, -8, -h - 10, w + 16, 12, INK); box(g, -7, -h - 9, w + 14, 10, T[3]); box(g, -7, -h - 9, w + 14, 2, T[5]); box(g, -7, -h - 1, w + 14, 2, T[1]);
  }
  // The wall: stucco, stepped; louvers up its top (the googie sunshade) if there's room
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  slab(g, 0, -h, w, h, R);
  for (let i = 0; i < (w * h) / 220; i++) box(g, hash(seed + i * 1.3) * w, -h + hash(seed + i * 2.9) * h, 2, 1, i % 3 ? R[2] : R[4]);
  // (the trim band, lit along its top; a row of studs)
  box(g, 0, -h + 22, w, 9, INK); box(g, 0, -h + 23, w, 7, T[3]); box(g, 0, -h + 23, w, 2, T[5]); box(g, 0, -h + 29, w, 1, T[1]);
  for (let x = 6; x < w - 4; x += 14) box(g, x, -h + 25, 2, 2, T[5]);
  // The display window: a chrome frame, the glass by the hour (the sky in it, or lit warm), what they sell, glints
  const wx = 16, wy = -h + 44, ww = w - 90, wh = h - 60;
  box(g, wx - 3, wy - 3, ww + 6, wh + 6, INK); box(g, wx - 2, wy - 2, ww + 4, wh + 4, CHROME[4]); box(g, wx - 2, wy - 2, ww + 4, 1, CHROME[6]);
  box(g, wx, wy, ww, wh, glass[1]);
  box(g, wx, wy, ww, Math.round(wh * 0.3), glass[2]); checker(g, wx, wy + Math.round(wh * 0.3), ww, 2, glass[2], 0, 2);
  box(g, wx, wy + wh - 10, ww, 10, glass[0]);
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  goodsFor(sh.name)(g, wx + 2, wy + 2, ww - 4, wh - 4);
  // (the glints: two diagonal streaks)
  g.fillStyle = 'rgba(255,255,255,0.22)'; for (const gx of [wx + 10, wx + ww * 0.6]) { g.beginPath(); g.moveTo(gx, wy + wh); g.lineTo(gx + 14, wy + wh); g.lineTo(gx + 14 + wh * 0.6, wy); g.lineTo(gx + wh * 0.6, wy); g.fill(); }
  g.restore();
  // (the sill: a planter box under it, flowers)
  box(g, wx - 4, wy + wh + 3, ww + 8, 8, INK); box(g, wx - 3, wy + wh + 4, ww + 6, 6, PINK[3]); box(g, wx - 3, wy + wh + 4, ww + 6, 2, PINK[5]);
  // The door: chrome frame, glass, a push bar, a starburst handle
  const dx = w - 60;
  box(g, dx - 2, -66, 44, 66, INK); box(g, dx - 1, -65, 42, 65, CHROME[3]); box(g, dx - 1, -65, 42, 1, CHROME[6]);
  box(g, dx + 3, -61, 34, 58, glass[1]); box(g, dx + 3, -61, 34, 16, glass[2]); box(g, dx + 3, -61, 2, 58, glass[4]);
  box(g, dx + 3, -32, 34, 4, INK); box(g, dx + 4, -31, 32, 2, CHROME[5]);
  box(g, dx + 6, -58, 8, 50, 'rgba(255,255,255,0.12)');
  box(g, dx - 4, -2, 48, 3, CHROME[2]);
  // (a starburst clock up by the door, on some)
  if (hash(seed) > 0.5 && w > 220) starburst(g, w - 40, -h + 40, 10, sh.trim);
  // (the kickplate: teal tile along the foot)
  box(g, 0, -10, dx - 2, 10, TEAL[2]); for (let x = 0; x < dx - 2; x += 8) box(g, x, -10, 1, 10, TEAL[1]); box(g, 0, -10, dx - 2, 1, TEAL[4]);
  // The boards: the name up top, the joke under it (`signDrop`: brought down off the roofline, where a roof he stands
  // on has its lit lip over them)
  const dy = sh.signDrop ?? 0;
  board(g, w / 2, -h + 12 + dy, sh.name, sh.nameBg ?? '#0F172A', sh.nameInk ?? '#FDE047', 8, 8, true);
  if (sh.sub) board(g, (w - 70) / 2 + 12, -h + 50 + dy, sh.sub, '#FFFFFF', '#BE185D', 6, 5);
  void mix;
};

/** The shops: each one's front, painted once for the hour, at the play plane. (Their sides: drawSides, before.) */
export const drawShopFront = (c: Ctx, state: GameState, sh: Shop, y: number) => {
  if (!inView(state, sh.x - 80, sh.x + sh.w + 80)) return;
  still(c, `spc-shop-${sh.name}-${sh.x}`, sh.x, y, -60, -sh.h - 130, sh.w + 120, sh.h + 132, g => paintShopFront(g, sh));
};
/** The shops' blocks; their roofs' tops going back only where he can stand on them (`flatTops`: those with a roof
 *  ledge), the rest left without (a top lit like a ledge would read as one). */
export const shopBlocks = (shops: Shop[], gy: number, flatTops = false): Block[] => shops.map(s => ({ x0: s.x, x1: s.x + s.w, top: gy - s.h, bottom: gy, col: s.wall, noTop: !(flatTops && s.roof === 'flat') }));
