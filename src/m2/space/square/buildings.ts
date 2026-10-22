// Futureland's shopfronts (the square's, the main drag's, and the walk in's: walkAway/intoSpace.ts paints the same
// fronts): pastel stucco in stepped ramps, a band of trim, the googie roof (a boomerang, a dome, a fin, a saucer up on a
// stalk, a flat parapet), a big display window with the hour in its glass and the gag in it (what they sell: snow
// globes, a robot butler fallen over, a burger the size of a tire...), a chrome door, the name up on a board and the
// joke under it. At the play plane (some he stands on), their sides and tops going back toward the eye (sideBack /
// topBack), the farthest first, then the fronts over them.

import type { GameState } from '../../../m1/game/core/state';
import { type Ctx, type View, type Letter, INK, box, checker, mix, hash, poly, still, inView, at, board, boardSize, twoLines, slab, starburst, ball, chromePole, glassOf, lit, ramp6, sideBack, topBack, CHROME, PINK, TEAL } from './paint';

export interface Shop { x: number; w: number; h: number; wall: string; trim: string; roof: 'boomerang' | 'dome' | 'fin' | 'flat' | 'saucer'; font?: Letter; name: string; sub?: string; nameBg?: string; nameInk?: string; signDrop?: number }
/** How far back the shops' sides go. */
export const SIDE_D = 0.88;

/** Something box-shaped at the play plane whose side and top go back: x0..x1, from `top` down to `bottom`. */
export interface Block { x0: number; x1: number; top: number; bottom: number; col: string; d?: number; noTop?: boolean; roof?: Shop['roof']; trim?: string }

/** The sides (and tops) of the blocks on screen going back, the farthest from the eye first. Draw before their fronts. */
export const drawSides = (c: Ctx, v: View, blocks: Block[]) => {
  const on = blocks.filter(b => b.x1 > v.v0 - 200 && b.x0 < v.v1 + 200);
  on.sort((p, q) => Math.abs((q.x0 + q.x1) / 2 - v.eye.x) - Math.abs((p.x0 + p.x1) / 2 - v.eye.x));
  for (const b of on) {
    const R = ramp6(b.col), d = b.d ?? SIDE_D;
    const sd = v.eye.x > b.x1 ? 1 : v.eye.x < b.x0 ? -1 : 0;
    if (!b.noTop) topBack(c, v.eye, b.x0, b.x1, b.top, d, R);
    if (sd) sideBack(c, v.eye, sd > 0 ? b.x1 : b.x0, sd as 1 | -1, b.top, b.bottom, d, R);
    roofSide(c, v.eye, b, sd as 1 | -1 | 0, d);
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
// The roofs (googie: each one sitting on its walls, a cornice along the wall's top with the eaves out past it and their
// shadow down the wall; then what's up on it)

/** How far a roof's eaves come out past the walls, the cornice's depth, the boomerang's sizes. */
const EAVE = 8, CORN = 10, BOOM = { out: 26, peak: 0.35, rise: 46, plate: 10 } as const;

/** The cornice along the wall's top (its top at -h - CORN + 4), the eaves out past the walls, the shadow under. */
const cornice = (g: Ctx, w: number, h: number, T: string[]) => {
  const y = -h - CORN + 4;
  // (the eaves' shadow down the wall's top: banded, dithered off)
  box(g, 0, -h + 4, w, 5, 'rgba(20, 12, 36, 0.32)'); checker(g, 0, -h + 9, w, 2, 'rgba(20, 12, 36, 0.32)', 0, 2);
  box(g, -EAVE - 1, y - 1, w + EAVE * 2 + 2, CORN + 2, INK);
  box(g, -EAVE, y, w + EAVE * 2, CORN, T[3]);
  box(g, -EAVE, y, w + EAVE * 2, 2, T[5]); box(g, -EAVE, y + 2, w + EAVE * 2, 1, T[4]);
  box(g, -EAVE, y + CORN - 3, w + EAVE * 2, 3, T[1]); checker(g, -EAVE, y + CORN - 5, w + EAVE * 2, 2, T[1], 0, 2);
  box(g, -EAVE, y, 2, CORN, T[4]); box(g, w + EAVE - 3, y, 3, CORN, T[2]);
  for (let x = 4 - EAVE; x < w + EAVE - 4; x += 16) box(g, x, y + 4, 3, 2, T[2]);
  return y;
};

/** A shop's roof, over its wall (drawn after the wall: the cornice laps its top). */
const paintRoof = (g: Ctx, sh: Shop, T: string[], glass: string[]) => {
  const { w, h } = sh;
  if (sh.roof === 'flat') {
    // (a parapet: a coping lit along its top, its face banded, the shadow under it)
    box(g, 0, -h + 2, w, 4, 'rgba(20, 12, 36, 0.3)'); checker(g, 0, -h + 6, w, 2, 'rgba(20, 12, 36, 0.3)', 0, 2);
    box(g, -8, -h - 10, w + 16, 12, INK); box(g, -7, -h - 9, w + 14, 10, T[3]); box(g, -7, -h - 9, w + 14, 2, T[5]); box(g, -7, -h - 1, w + 14, 2, T[1]);
    box(g, -7, -h - 9, 2, 10, T[4]); box(g, w + 4, -h - 9, 3, 10, T[2]);
    return;
  }
  const top = sh.roof === 'boomerang' ? -h : cornice(g, w, h, T);
  if (sh.roof === 'boomerang') {
    // (a folded plate: a thick slab swept up to a point off-center, its eaves out past the walls; the gable under it
    // glazed, mullioned, the hour in its glass; it all sits on the cornice)
    const L = -BOOM.out, R = w + BOOM.out, px = Math.round(w * BOOM.peak), ey = -h - CORN + 4, py = ey - BOOM.rise, t = BOOM.plate;
    const under = (x: number) => (x < px ? ey + ((py + t) - ey) * ((x - L) / (px - L)) : ey + ((py + t) - ey) * ((R - x) / (R - px)));
    // the glazed gable, from the cornice up to the plate's underside
    poly(g, [[0, ey], [0, under(0)], [px, py + t], [w, under(w)], [w, ey]], INK);
    poly(g, [[1, ey], [1, under(1) + 1], [px, py + t + 1], [w - 1, under(w - 1) + 1], [w - 1, ey]], glass[1]);
    g.save(); g.beginPath(); g.moveTo(1, ey); g.lineTo(1, under(1)); g.lineTo(px, py + t); g.lineTo(w - 1, under(w - 1)); g.lineTo(w - 1, ey); g.closePath(); g.clip();
    box(g, 0, py, w, ey - py - 14, glass[2]); checker(g, 0, ey - 16, w, 2, glass[2], 0, 2);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(px - 30, ey); g.lineTo(px - 18, ey); g.lineTo(px + 10, py); g.lineTo(px - 2, py); g.fill();
    for (let x = 14; x < w; x += 16) { box(g, x - 1, py, 3, ey - py, INK); box(g, x, py, 1, ey - py, CHROME[4]); }
    box(g, 0, ey - 18, w, 2, CHROME[3]);
    g.restore();
    // the plate: inked, its face in the trim's ramp, lit along the top edge, shaded along the underside; its cut ends
    poly(g, [[L - 2, ey + 2], [L - 2, ey - t - 1], [px, py - 2], [R + 2, ey - t - 1], [R + 2, ey + 2], [px, py + t + 2]], INK);
    poly(g, [[L, ey], [L, ey - t + 1], [px, py], [R, ey - t + 1], [R, ey], [px, py + t]], T[3]);
    poly(g, [[L, ey - t + 1], [px, py], [px, py + 3], [L, ey - t + 4]], T[5]);
    poly(g, [[px, py], [R, ey - t + 1], [R, ey - t + 3], [px, py + 2]], T[4]);
    poly(g, [[L, ey - 2], [px, py + t - 2], [R, ey - 2], [R, ey], [px, py + t], [L, ey]], T[1]);
    box(g, L, ey - t + 1, 3, t - 1, T[4]); box(g, R - 3, ey - t + 1, 3, t - 1, T[2]);
    for (let k = 0.12; k < 1; k += 0.14) box(g, L + (px - L) * k - 1, ey - t + 1 + (py - (ey - t + 1)) * k + 4, 2, 2, lit() ? '#FFF3B0' : T[2]);
    for (let k = 0.12; k < 1; k += 0.14) box(g, px + (R - px) * k - 1, py + ((ey - t + 1) - py) * k + 4, 2, 2, lit() ? '#FFF3B0' : T[2]);
    // the cornice it sits on (over the gable's foot, under the plate's ends)
    box(g, 0, -h + 4, w, 5, 'rgba(20, 12, 36, 0.32)'); checker(g, 0, -h + 9, w, 2, 'rgba(20, 12, 36, 0.32)', 0, 2);
    box(g, -1, ey - 1, w + 2, CORN + 2, INK); box(g, 0, ey, w, CORN, CHROME[3]); box(g, 0, ey, w, 2, CHROME[5]); box(g, 0, ey + CORN - 3, w, 3, CHROME[1]);
  } else if (sh.roof === 'dome') {
    // (a dome on a drum: the drum a chrome band, portholes round it; the dome in stepped shells, ribbed, a glint, a
    // little spire with a ball on it)
    const r = w / 2 - 14, cx = w / 2, dy = top - 10;
    box(g, cx - r - 4, dy - 1, r * 2 + 8, 11, INK); box(g, cx - r - 3, dy, r * 2 + 6, 10, CHROME[3]); box(g, cx - r - 3, dy, r * 2 + 6, 2, CHROME[5]); box(g, cx - r - 3, dy + 7, r * 2 + 6, 3, CHROME[1]);
    for (let k = -3; k <= 3; k++) { const ox = cx + k * r * 0.26; box(g, ox - 2, dy + 3, 4, 4, INK); box(g, ox - 1, dy + 4, 2, 2, lit() ? '#FFE8A0' : glass[3]); }
    g.fillStyle = INK; g.beginPath(); g.arc(cx, dy, r + 2, Math.PI, 0); g.fill();
    for (let k = 0; k < 5; k++) { g.fillStyle = T[1 + Math.min(4, k)]; g.beginPath(); g.ellipse(cx - k * r * 0.07, dy - k * r * 0.04, r * (1 - k * 0.17), r * (1 - k * 0.15), 0, Math.PI, 0); g.fill(); }
    g.save(); g.beginPath(); g.arc(cx, dy, r, Math.PI, 0); g.clip();
    for (let k = 1; k < 5; k++) checker(g, cx - r, dy - r * (1 - k * 0.15) - 1, r * 2, 2, T[k], 0, 2);
    g.strokeStyle = T[1]; g.lineWidth = 1; for (let k = 1; k < 6; k++) { const a = Math.PI + (k * Math.PI) / 6; g.beginPath(); g.moveTo(cx, dy - r); g.quadraticCurveTo(cx + Math.cos(a) * r * 0.7, dy + Math.sin(a) * r * 0.9, cx + Math.cos(a) * r, dy); g.stroke(); }
    // (the ribs' lit edges, every other one, so they read as ribs not seams)
    g.strokeStyle = T[4]; for (let k = 1; k < 6; k += 2) { const a = Math.PI + (k * Math.PI) / 6; g.beginPath(); g.moveTo(cx + 1, dy - r + 4); g.quadraticCurveTo(cx + Math.cos(a) * r * 0.7 + 1, dy + Math.sin(a) * r * 0.9, cx + Math.cos(a) * r + 1, dy); g.stroke(); }
    g.restore();
    // (the glints: a long streak up the lit shoulder, a dot under it)
    for (let k = 0; k < 5; k++) box(g, Math.round(cx - r * 0.62 + k * 5), Math.round(dy - r * 0.42 - k * 9), 4, 6, k < 4 ? T[5] : '#FFFFFF');
    box(g, Math.round(cx - r * 0.45), Math.round(dy - r * 0.18), 3, 3, T[5]);
    // The crown: a chrome ring where the ribs meet, a glass skylight cap in it (lit by the hour), a stepped collar,
    // an antenna up out of it with a ball on top and a ring round it
    const ry = Math.round(dy - r), cr = Math.max(10, Math.round(r * 0.13));
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, ry + 3, cr + 3, 6, 0, 0, Math.PI * 2); g.fill();
    box(g, cx - cr - 2, ry, cr * 2 + 4, 4, CHROME[3]); box(g, cx - cr - 2, ry, cr * 2 + 4, 1, CHROME[6]); box(g, cx - cr - 2, ry + 3, cr * 2 + 4, 1, CHROME[1]);
    g.fillStyle = INK; g.beginPath(); g.arc(cx, ry, cr + 1, Math.PI, 0); g.fill();
    g.fillStyle = lit() ? '#FFE8A0' : glass[2]; g.beginPath(); g.arc(cx, ry, cr - 1, Math.PI, 0); g.fill();
    g.fillStyle = lit() ? '#FFF6D0' : glass[4]; g.beginPath(); g.arc(cx - 3, ry - 2, cr * 0.5, Math.PI, 0); g.fill();
    for (const k of [-0.5, 0, 0.5]) box(g, Math.round(cx + k * cr) - 1, ry - Math.round(cr * Math.sqrt(1 - k * k * 0.9)), 1, Math.round(cr * Math.sqrt(1 - k * k * 0.9)), INK);
    box(g, cx - 5, ry - cr - 4, 10, 4, INK); box(g, cx - 4, ry - cr - 3, 8, 2, CHROME[4]);
    chromePole(g, cx, ry - cr - 26, ry - cr - 3, 3);
    box(g, cx - 7, ry - cr - 17, 14, 3, INK); box(g, cx - 6, ry - cr - 16, 12, 1, CHROME[5]);
    ball(g, cx, ry - cr - 28, 4, '#F0C840');
  } else if (sh.roof === 'fin') {
    // (a fin up the right end: a thick blade set in a chrome shoe on the cornice, its edge lit, its face shaded across,
    // a starburst on its tip)
    const f0 = w - 56, f1 = w - 6, tx = w - 22, ty = top - 100;
    poly(g, [[f0 - 2, top + 1], [tx - 1, ty - 3], [tx + 3, ty - 2], [f1 + 2, top + 1]], INK);
    poly(g, [[f0, top], [tx, ty], [f1, top]], T[3]);
    poly(g, [[f0, top], [tx, ty], [tx - 4, top]], T[4]); poly(g, [[f0, top], [tx, ty], [f0 + 6, top]], T[5]);
    poly(g, [[tx, ty], [f1, top], [f1 - 6, top]], T[1]); poly(g, [[tx, ty], [f1 - 6, top], [f1 - 12, top]], T[2]);
    for (let k = 1; k < 5; k++) box(g, f0 + (tx - f0) * (k / 5) + 6, top + (ty - top) * (k / 5) + 8, 2, 2, lit() ? '#FFF3B0' : T[5]);
    box(g, f0 - 4, top - 5, f1 - f0 + 8, 6, INK); box(g, f0 - 3, top - 4, f1 - f0 + 6, 4, CHROME[3]); box(g, f0 - 3, top - 4, f1 - f0 + 6, 1, CHROME[5]);
    starburst(g, tx, ty - 6, 13);
  } else if (sh.roof === 'saucer') {
    // (a saucer up on a stalk over the roof, the stalk's shoe bolted down on the cornice; its rim of bulbs; its dome)
    const sy = top - 46;
    box(g, w / 2 - 12, top - 5, 24, 6, INK); box(g, w / 2 - 11, top - 4, 22, 4, CHROME[3]); box(g, w / 2 - 11, top - 4, 22, 1, CHROME[5]);
    chromePole(g, w / 2, sy, top - 4, 8);
    g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, sy, w / 2 - 6, 17, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = T[1]; g.beginPath(); g.ellipse(w / 2, sy, w / 2 - 8, 15, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = T[2]; g.beginPath(); g.ellipse(w / 2, sy - 2, w / 2 - 9, 11, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = T[3]; g.beginPath(); g.ellipse(w / 2, sy - 4, w / 2 - 12, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = T[4]; g.beginPath(); g.ellipse(w / 2 - 10, sy - 7, w / 4, 4, 0, 0, Math.PI * 2); g.fill();
    box(g, w / 2 - (w / 2 - 8), sy, (w / 2 - 8) * 2, 2, T[1]);
    for (let k = -4; k <= 4; k++) box(g, w / 2 + (k * (w / 2 - 16)) / 4.5 - 1, sy + 3, 3, 3, lit() ? '#FFF3B0' : T[5]);
    g.fillStyle = INK; g.beginPath(); g.arc(w / 2, sy - 10, 13, Math.PI, 0); g.fill();
    g.fillStyle = glass[2]; g.beginPath(); g.arc(w / 2, sy - 10, 11, Math.PI, 0); g.fill();
    g.fillStyle = glass[4]; g.beginPath(); g.arc(w / 2 - 3, sy - 13, 6, Math.PI, 0); g.fill(); box(g, w / 2 - 6, sy - 17, 3, 2, '#FFFFFF');
  }
};

/** A roof's side going back (with the wall's: drawSides), from the play plane at the wall's end x = e: the cornice's
 *  end, the boomerang's plate (its slope, its cut end). */
const roofSide = (c: Ctx, eye: { x: number; y: number }, b: Block, side: 1 | -1 | 0, d: number) => {
  if (!b.roof || b.roof === 'flat') return;
  const T = ramp6(b.trim ?? b.col), w = b.x1 - b.x0, h = b.bottom - b.top, ey = b.top - CORN + 4;
  const q = (pts: [number, number][], col: string) => poly(c, [...pts, ...pts.slice().reverse().map(([x, y]) => at(eye, x, y, d))], col);
  if (b.roof === 'boomerang') {
    if (!side) return;
    const e = side > 0 ? b.x1 + BOOM.out : b.x0 - BOOM.out, px = b.x0 + Math.round(w * BOOM.peak), py = ey - BOOM.rise, t = BOOM.plate;
    if (eye.y < py) q([[e, ey - t + 1], [px, py]], T[4]);
    else q([[e, ey], [px, py + t]], T[1]);
    q([[e, ey - t + 1], [e, ey]], T[2]);
    const [ax, ay] = at(eye, e, ey - t + 1, d), [bx, by] = at(eye, px, py, d), [cx2, cy2] = at(eye, e, ey, d);
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(bx, by); c.lineTo(ax, ay); c.lineTo(cx2, cy2); c.stroke();
    void h;
    return;
  }
  if (side) q([[side > 0 ? b.x1 + EAVE : b.x0 - EAVE, ey], [side > 0 ? b.x1 + EAVE : b.x0 - EAVE, ey + CORN]], T[2]);
  if (eye.y > ey + CORN) q([[b.x0 - EAVE, ey + CORN], [b.x1 + EAVE, ey + CORN]], T[0]);
  else if (eye.y < ey) q([[b.x0 - EAVE, ey], [b.x1 + EAVE, ey]], T[4]);
};

// ---------------------------------------------------------------------------------------------------------------
// A shop's front

/** The stucco over a wall's slab (local coords, foot at 0): banded light down it (bright under the eaves' shadow, a
 *  step darker toward the foot, dithered between), scored panel joints (lit edge over a dark one), quoins up both
 *  corners, rain streaks run down from the trim band, a stipple of texture, a vent. */
const stucco = (g: Ctx, w: number, h: number, R: string[], seed: number) => {
  const mid = mix(R[3], R[2], 0.5);
  // (light in bands: the top third a touch lit, the foot third a step down)
  const b1 = -h + Math.round(h * 0.34), b2 = -h + Math.round(h * 0.68);
  box(g, 5, -h + 2, w - 10, b1 + h - 2, mix(R[3], R[4], 0.22)); checker(g, 5, b1, w - 10, 2, mix(R[3], R[4], 0.22), 0, 2);
  box(g, 5, b2 + 2, w - 10, -b2 - 16, mid); checker(g, 5, b2, w - 10, 2, mid, 0, 2);
  // (the scored joints: courses across, staggered verticals; each a dark line with a lit one under it)
  for (let y = -h + 40, row = 0; y < -18; y += 26, row++) {
    box(g, 5, y, w - 10, 1, R[2]); box(g, 5, y + 1, w - 10, 1, R[4]);
    for (let x = (row % 2 ? 30 : 58); x < w - 8; x += 56) { box(g, x, y - 25, 1, 25, R[2]); box(g, x + 1, y - 25, 1, 25, R[4]); }
  }
  // (quoins: blocks up each corner, alternating long and short, lit tops, shaded feet)
  for (let y = -h + 32, k = 0; y < -12; y += 18, k++) for (const [qx, qw] of [[0, k % 2 ? 10 : 16], [w - (k % 2 ? 10 : 16), k % 2 ? 10 : 16]] as const) {
    box(g, qx, y, qw, 16, R[4]); box(g, qx, y, qw, 1, R[5]); box(g, qx, y + 15, qw, 1, R[1]); box(g, qx + (qx ? 0 : qw - 1), y, 1, 16, R[2]);
  }
  // (the texture: a fine stipple, light and dark)
  for (let i = 0; i < (w * h) / 160; i++) box(g, 4 + hash(seed + i * 1.3) * (w - 8), -h + 2 + hash(seed + i * 2.9) * (h - 4), 1 + (i % 2), 1, i % 3 ? R[2] : R[5]);
  // (streaks run down from the trim band: dithered, fading)
  for (let k = 0; k < 4; k++) {
    const sx = 20 + hash(seed * 1.7 + k) * (w - 40), len = 20 + hash(seed + k * 3.3) * 40;
    for (let y = 0; y < len; y += 2) box(g, sx + ((y >> 1) % 2), -h + 31 + y, 1, 1, y < len * 0.6 ? R[1] : R[2]);
  }
  // (a vent up high, louvered)
  if (w > 180) {
    const vx = Math.round(w * 0.5 + hash(seed) * 20 - 10) - 9;
    box(g, vx - 1, -h + 33, 20, 9, INK); box(g, vx, -h + 34, 18, 7, R[1]); for (let l = 0; l < 3; l++) box(g, vx + 1, -h + 35 + l * 2, 16, 1, R[4]);
  }
};

/** A shop's front, painted flat in its own coordinates: its foot at (0, 0), x across 0..w. */
export const paintShopFront = (g: Ctx, sh: Shop) => {
  const { w, h } = sh, R = ramp6(sh.wall), T = ramp6(sh.trim), glass = glassOf(), seed = sh.name.length * 13 + w;
  // The wall: stucco, stepped; louvers up its top (the googie sunshade) if there's room
  box(g, -2, -h - 2, w + 4, h + 2, INK);
  slab(g, 0, -h, w, h, R);
  stucco(g, w, h, R, seed);
  // (the trim band, lit along its top; a row of studs)
  box(g, 0, -h + 22, w, 9, INK); box(g, 0, -h + 23, w, 7, T[3]); box(g, 0, -h + 23, w, 2, T[5]); box(g, 0, -h + 29, w, 1, T[1]);
  for (let x = 6; x < w - 4; x += 14) box(g, x, -h + 25, 2, 2, T[5]);
  // The roof, on the wall (behind the boards: they're drawn last)
  paintRoof(g, sh, T, glass);
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
  // (its name in its own lettering; too wide for the wall in it, the next style that fits)
  const font = ([sh.font ?? 'chrome', 'chrome', 'small'] as Letter[]).find(f => boardSize(g, sh.name, 8, 8, f)[0] + 6 <= w - 4) ?? 'small';
  board(g, w / 2, -h + 12 + dy, sh.name, sh.nameBg ?? '#0F172A', sh.nameInk ?? '#FDE047', 8, 8, true, font);
  if (sh.sub) {
    // (screwed to the wall: never wider than it, or hanging off its end over nothing; too long, it goes on two lines)
    let sub = sh.sub, [bw] = boardSize(g, sub, 6, 5, 'small');
    if (bw + 6 > w - 12) { sub = twoLines(sub); [bw] = boardSize(g, sub, 6, 5, 'small'); }
    const half = bw / 2 + 3, cx = Math.max(6 + half, Math.min(w - 6 - half, (w - 70) / 2 + 12));
    board(g, Math.round(cx), -h + 50 + dy + (sub.includes('\n') ? 5 : 0), sub, '#FFFFFF', '#BE185D', 6, 5, false, 'small');
  }
  void mix;
};

/** The shops: each one's front, painted once for the hour, at the play plane. (Their sides: drawSides, before.) */
/** How far a shop's roof goes up over its wall's top (the paint box's headroom): a dome by its width (its crown and
 *  antenna), the rest a fixed 130. */
export const roofRise = (sh: Shop) => (sh.roof === 'dome' ? Math.max(130, Math.ceil(16 + sh.w / 2 - 14 + Math.max(10, Math.round((sh.w / 2 - 14) * 0.13)) + 36)) : 130);
export const drawShopFront = (c: Ctx, state: GameState, sh: Shop, y: number) => {
  if (!inView(state, sh.x - 80, sh.x + sh.w + 80)) return;
  const up = roofRise(sh);
  still(c, `spc-shop-${sh.name}-${sh.x}`, sh.x, y, -60, -sh.h - up, sh.w + 120, sh.h + up + 2, g => paintShopFront(g, sh));
};
/** The shops' blocks; their roofs' tops going back only where he can stand on them (`flatTops`: those with a roof
 *  ledge), the rest left without (a top lit like a ledge would read as one). */
export const shopBlocks = (shops: Shop[], gy: number, flatTops = false): Block[] => shops.map(s => ({ x0: s.x, x1: s.x + s.w, top: gy - s.h, bottom: gy, col: s.wall, noTop: !(flatTops && s.roof === 'flat'), roof: s.roof, trim: s.trim }));
