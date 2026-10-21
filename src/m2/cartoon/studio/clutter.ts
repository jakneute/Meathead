// The studio's clutter (the detail pass): what a 1994 studio piles up in every corner, added over each room's back
// wall and tableau (rooms.ts) and in a low near layer in front of the tableau (just behind the velvet rope): memos and
// overtime notices pinned up (the park's merchandising satire: SELL THE TOY FIRST, the crates of animation going out),
// animation desks with their light discs and peg bars, stacks of cels and drawings, ink and paint jars, film cans, coffee
// cups and ashtrays, crumpled paper, cables taped down, carts, lights. All still (stamped with the room's art); a few
// cheap live touches over it (drawClutterLive: an ashtray's smoke, a fluorescent tube on the blink, a desk fan, a tally
// light, an answering machine's lamp).
//
// World coordinates (X() from the section's start, heights up from GY); art.ts pushes each layer back to its depth.
// The near layer stays low (under the rope's height) so nothing in it reads as something to stand on or covers a sign.

import { signW } from '../../signLetters';
import { part, px, ball, limb, flat } from '../../spooky/costume';
import {
  box, mix, hash, INK, checker, type Ctx, slab, footShadow, PRINT, MARKER, txt, pinned, shelf, R6,
  PANEL, BEIGE, PAPER, STEEL, CHARCOAL, CHROME, GOLD, TEAL, REDPLAS,
} from './paint';
import { CEIL, X, type Room, type RoomId } from './layout';
import { GY } from '../geometry';
import { socks, steam } from './people';

// ---------------------------------------------------------------------------------------------------------------
// The kit

/** A memo pinned up: a sheet, its lines of print (the first in red if `head`), a pin. */
const memo = (g: Ctx, x: number, y: number, w0: number, lines: string[], o: { col?: string; pin?: string; head?: string; ink?: string } = {}) => {
  const w = Math.max(w0, ...lines.map(s => signW(s, PRINT()) + 8)), h = 10 + lines.length * 9 + (o.head ? 12 : 0);
  pinned(g, x, y, w, h, o.col ?? PAPER[4], o.pin ?? '#2563EB', q => {
    let ly = y + 10;
    if (o.head) { box(q, x + 3, y + 3, w - 6, 11, o.head); txt(q, lines[0], x + w / 2, y + 11, PRINT('#FFFFFF')); ly += 12; }
    for (let i = o.head ? 1 : 0; i < lines.length; i++) txt(q, lines[i], x + w / 2, ly + (i - (o.head ? 1 : 0)) * 9 + 1, PRINT(o.ink ?? '#1F2937'));
  });
  return h;
};
/** A paper coffee cup on a surface at y (its middle at x). */
const cup = (g: Ctx, x: number, y: number, col = '#F5F5F4') => {
  g.fillStyle = INK; g.beginPath(); g.moveTo(x - 5, y - 12); g.lineTo(x + 5, y - 12); g.lineTo(x + 4, y); g.lineTo(x - 4, y); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(x - 4, y - 11); g.lineTo(x + 4, y - 11); g.lineTo(x + 3, y - 1); g.lineTo(x - 3, y - 1); g.closePath(); g.fill();
  box(g, x - 4, y - 7, 8, 3, '#B45309'); box(g, x - 4, y - 11, 2, 10, '#FFFFFF'); box(g, x - 5, y - 13, 10, 2, '#5B3A1E');
};
/** A mug (its middle at x, on y), a logo stripe. */
const mug = (g: Ctx, x: number, y: number, col: string) => {
  slab(g, x - 5, y - 11, 10, 11, R6(col));
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(x + 6, y - 6, 3, -1.2, 1.2); g.stroke();
  box(g, x - 4, y - 10, 8, 2, '#3B2412');
};
/** An ashtray, butts in it (smoke drawn live). */
const ashtray = (g: Ctx, x: number, y: number) => {
  g.fillStyle = INK; g.beginPath(); g.ellipse(x, y - 2, 10, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#9AA6B4'; g.beginPath(); g.ellipse(x, y - 2, 9, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#4A505E'; g.beginPath(); g.ellipse(x, y - 2, 6, 2, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 4; i++) { box(g, x - 6 + i * 3, y - 4 - (i % 2), 4, 1, '#F6F4EC'); box(g, x - 3 + i * 3, y - 4 - (i % 2), 1, 1, '#D97706'); }
};
/** A crumpled ball of paper (a drawing that didn't make it). */
const crumple = (g: Ctx, x: number, y: number, r: number, k = 0) => {
  ball(g, x, y - r, r, PAPER[3 + (k % 2)], 1);
  g.strokeStyle = PAPER[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(x - r * 0.6, y - r); g.lineTo(x, y - r * 0.6); g.lineTo(x + r * 0.5, y - r * 1.3); g.stroke();
  if (k % 3 === 0) { g.strokeStyle = '#64748B'; g.beginPath(); g.arc(x - 1, y - r - 1, r * 0.35, 0, 4); g.stroke(); }
};
/** A cable lying on the floor through the points (black, a glint along it), gaffer tape over it here and there. */
const cable = (g: Ctx, pts: [number, number][], tape = true) => {
  g.lineCap = 'round';
  for (const [w, col] of [[4, INK], [2, '#2A2A34']] as [number, string][]) {
    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; g.quadraticCurveTo(ax + (bx - ax) * 0.5, ay + (i % 2 ? -3 : 3), bx, by); }
    g.stroke();
  }
  g.lineCap = 'butt';
  if (tape) for (let i = 1; i < pts.length - 1; i += 2) { box(g, pts[i][0] - 6, pts[i][1] - 3, 12, 5, INK); box(g, pts[i][0] - 5, pts[i][1] - 2, 10, 3, '#9CA3AF'); box(g, pts[i][0] - 5, pts[i][1] - 2, 10, 1, '#D1D5DB'); }
};
/** A flat stack of film cans on the floor (x its left). */
const canStack = (g: Ctx, x: number, y: number, n: number, w = 40) => {
  for (let i = 0; i < n; i++) {
    const cy = y - 7 - i * 7, ox = (hash(x + i) - 0.5) * 4;
    box(g, x + ox - 1, cy - 1, w + 2, 8, INK); box(g, x + ox, cy, w, 6, CHROME[3 - (i % 2)]); box(g, x + ox, cy, w, 1, CHROME[5]);
    box(g, x + ox + w * 0.3, cy + 2, w * 0.4, 2, i % 3 ? '#F8FAFC' : '#FDE68A');
  }
};
/** A wooden crate, stenciled (x its left, y the floor). */
const crate = (g: Ctx, x: number, y: number, w: number, h: number, lines: string[], ink = '#3B2A10') => {
  slab(g, x, y - h, w, h, R6('#A47148'));
  for (let k = 1; k < 3; k++) box(g, x + 2, y - h + (h * k) / 3, w - 4, 1, '#7A4F2A');
  box(g, x + 3, y - h + 3, 4, h - 6, '#8A5A32'); box(g, x + w - 7, y - h + 3, 4, h - 6, '#8A5A32');
  lines.forEach((s, i) => txt(g, s, x + w / 2, y - h + 12 + i * 10, PRINT(ink)));
};
/** A cardboard box (x its left, y the floor), taped, labeled. */
const carton = (g: Ctx, x: number, y: number, w: number, h: number, lines: string[], ink = '#3B2A10') => {
  slab(g, x, y - h, w, h, R6('#C49A62'));
  box(g, x + w / 2 - 3, y - h, 6, h, '#D8B47E'); box(g, x + w / 2 - 3, y - h, 1, h, '#E8CC9A');
  lines.forEach((s, i) => txt(g, s, x + w / 2, y - h + 11 + i * 9, PRINT(ink)));
};
/** An animation desk (x its left, y the floor): the slanted top, the round light disc in it lit, the peg bar, a stack of
 *  drawings on the shelf over it, a lamp on its arm, a pencil cup. */
const animDesk = (g: Ctx, x: number, y: number, k: number) => {
  slab(g, x, y - 64, 110, 64, PANEL);
  for (let i = 0; i < 3; i++) { box(g, x + 70, y - 58 + i * 18, 34, 15, PANEL[2]); box(g, x + 82, y - 52 + i * 18, 10, 2, CHROME[4]); }
  box(g, x + 6, y - 58, 58, 52, PANEL[1]);
  part(g, () => { g.moveTo(x - 4, y - 64); g.lineTo(x + 114, y - 64); g.lineTo(x + 108, y - 96); g.lineTo(x + 2, y - 90); g.closePath(); }, '#C9C4AE', x - 4, y - 96, 118, 32, 1.2);
  g.fillStyle = INK; g.beginPath(); g.ellipse(x + 54, y - 78, 30, 10, -0.05, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFF8DA'; g.beginPath(); g.ellipse(x + 54, y - 78, 28, 9, -0.05, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFFDF0'; g.beginPath(); g.ellipse(x + 48, y - 80, 14, 5, -0.05, 0, Math.PI * 2); g.fill();
  box(g, x + 38, y - 92, 32, 3, STEEL[2]); for (const p of [42, 53, 64]) box(g, x + p, y - 94, 2, 2, CHROME[5]);
  box(g, x + 36, y - 86, 36, 14, 'rgba(250,250,245,0.55)');
  g.strokeStyle = 'rgba(60,60,70,0.6)'; g.lineWidth = 1; g.beginPath(); g.arc(x + 54, y - 80, 4, 0, Math.PI * 2); g.stroke();
  // (the shelf over it, drawings and cels in stacks)
  shelf(g, x + 4, y - 132, 100, PANEL);
  for (let i = 0; i < 3; i++) { const sh = 6 + ((k + i) % 3) * 5; box(g, x + 10 + i * 30, y - 132 - sh - 1, 24, sh + 1, INK); box(g, x + 11 + i * 30, y - 132 - sh, 22, sh, PAPER[4 - (i % 2)]); for (let l = 2; l < sh; l += 2) box(g, x + 11 + i * 30, y - 132 - sh + l, 22, 1, PAPER[2]); }
  // (the lamp on its arm, the pencil cup)
  limb(g, x + 104, y - 92, x + 118, y - 126, 2, STEEL[3]); limb(g, x + 118, y - 126, x + 92, y - 136, 2, STEEL[3]);
  part(g, () => { g.moveTo(x + 82, y - 142); g.lineTo(x + 98, y - 142); g.lineTo(x + 102, y - 130); g.lineTo(x + 78, y - 130); g.closePath(); }, ['#16A34A', '#475569', '#B91C1C'][k % 3], x + 78, y - 142, 24, 12, 1);
  slab(g, x + 6, y - 102, 9, 10, PAPER); for (let i = 0; i < 3; i++) px(g, x + 7 + i * 3, y - 110, 1, 9, ['#F2C230', '#DC2626', '#2563EB'][i]);
  footShadow(g, x - 4, y, 118);
};
/** A stack of cels (clear sheets, a painted figure showing on the top one) on a surface at y. */
const celStack = (g: Ctx, x: number, y: number, w: number, n: number, col: string) => {
  for (let i = 0; i < n; i++) { box(g, x + (i % 2), y - 2 - i * 2, w, 2, i % 2 ? 'rgba(219,234,254,0.85)' : 'rgba(186,214,240,0.9)'); }
  box(g, x - 1, y - 2 - n * 2, w + 2, 1, INK);
  px(g, x + w * 0.35, y - 1 - n * 2, w * 0.3, 1, col);
};
/** A jar of ink or paint (on y). */
const jar = (g: Ctx, x: number, y: number, col: string) => {
  slab(g, x, y - 14, 10, 14, R6('#E5E7EB')); box(g, x + 1, y - 10, 8, 9, col); box(g, x + 1, y - 10, 2, 9, mix(col, '#FFFFFF', 0.3)); slab(g, x + 1, y - 17, 8, 3, CHARCOAL);
};
/** A trash can, overflowing (its middle at x, on y). */
const trash = (g: Ctx, x: number, y: number, k: number) => {
  slab(g, x - 13, y - 30, 26, 30, STEEL); for (let i = 0; i < 4; i++) box(g, x - 10 + i * 6, y - 26, 1, 22, STEEL[2]);
  for (let i = 0; i < 5; i++) crumple(g, x - 10 + (i % 3) * 9 + (i > 2 ? 4 : 0), y - 28 - (i > 2 ? 8 : 0), 5, k + i);
  if (k % 2) { slab(g, x - 6, y - 50, 18, 12, R6('#D6B98C')); txt(g, 'PIZZA', x + 3, y - 42, PRINT('#7F1D1D')); }
  crumple(g, x + 20, y, 4, k + 9);
};
/** A WET FLOOR sign (a yellow A-frame), its foot's middle at x. */
const wetFloor = (g: Ctx, x: number, y: number) => {
  part(g, () => { g.moveTo(x - 14, y); g.lineTo(x - 6, y - 40); g.lineTo(x + 6, y - 40); g.lineTo(x + 14, y); g.lineTo(x + 9, y); g.lineTo(x + 3, y - 30); g.lineTo(x - 3, y - 30); g.lineTo(x - 9, y); g.closePath(); }, '#FACC15', x - 14, y - 40, 28, 40, 1.2);
  box(g, x - 7, y - 26, 14, 10, '#FACC15'); txt(g, 'WET', x, y - 18, PRINT('#1F2937'));
  box(g, x - 5, y - 38, 10, 2, '#FDE68A');
};
/** A sandbag (on y). */
const sandbag = (g: Ctx, x: number, y: number) => {
  part(g, () => g.roundRect(x - 12, y - 9, 24, 9, 4), '#5A4A36', x - 12, y - 9, 24, 9, 1); box(g, x - 9, y - 8, 18, 1, '#7A684E'); box(g, x - 1, y - 10, 2, 4, '#3A2E20');
};
/** A C-stand with a lamp head (its foot at x, on y, the head at height h). */
const lampStand = (g: Ctx, x: number, y: number, h: number, dir = 1) => {
  for (const s of [-1, 0, 1]) limb(g, x, y - 18, x + s * 16, y, 2, STEEL[3]);
  limb(g, x, y - 18, x, y - h, 3, STEEL[3]);
  part(g, () => g.roundRect(x - 12 + dir * 4, y - h - 14, 24, 18, 3), '#27272A', x - 12 + dir * 4, y - h - 14, 24, 18, 1.2);
  box(g, x + dir * 14 - (dir > 0 ? 0 : 3), y - h - 12, 3, 14, '#FDE68A');
  for (const s of [-1, 1]) box(g, x + dir * 4 + s * 13 - 1, y - h - 16, 2, 22, '#18181B');
};
/** A rolling cart (x its left, y the floor): two shelves, casters. */
const cart = (g: Ctx, x: number, y: number, w: number, R: string[] = STEEL) => {
  slab(g, x, y - 52, w, 6, R); slab(g, x, y - 20, w, 6, R);
  for (const lx of [x + 2, x + w - 5]) box(g, lx, y - 46, 3, 36, R[2]);
  for (const cx of [x + 6, x + w - 6]) ball(g, cx, y - 4, 4, '#18181B', 1);
};

// ---------------------------------------------------------------------------------------------------------------
// The back walls' clutter (stamped with each room's back wall)

const W = (r: Room) => ({ a: X(r.a), b: X(r.b) });

export const WALL_EXTRAS: Partial<Record<RoomId, (g: Ctx, r: Room) => void>> = {};
// (the lobby: EMPLOYEE OF THE MONTH, every month the same man; a fire extinguisher by the doors)
WALL_EXTRAS.lobby = (g) => {
  for (let i = 0; i < 3; i++) {
    const fx = X(726), fy = CEIL + 150 + i * 62;
    slab(g, fx - 4, fy - 4, 58, 56, GOLD); box(g, fx, fy, 50, 48, '#1E2646');
    ball(g, fx + 25, fy + 20, 10, '#F0C8A2', 1); part(g, () => g.ellipse(fx + 25, fy + 13, 11, 5, 0, Math.PI, 0), '#5B4636', fx + 14, fy + 8, 22, 5, 1);
    part(g, () => { g.moveTo(fx + 12, fy + 48); g.quadraticCurveTo(fx + 25, fy + 28, fx + 38, fy + 48); g.closePath(); }, '#141414', fx + 12, fy + 28, 26, 20, 1);
    px(g, fx + 20, fy + 19, 3, 2, INK); px(g, fx + 27, fy + 19, 3, 2, INK);
    txt(g, ['JAN: DAVE', 'FEB: DAVE', 'MAR: DAVE'][i], fx + 25, fy + 60, PRINT('#FDE68A'));
  }
  txt(g, 'EMPLOYEE OF THE MONTH', X(751), CEIL + 136, PRINT('#FFFFFF'));
  // (the extinguisher in its red box, and the NOW HIRING card taped by it)
  const ex = X(258);
  slab(g, ex - 14, GY - 250, 28, 56, REDPLAS); box(g, ex - 10, GY - 246, 20, 40, '#3A0606');
  part(g, () => g.roundRect(ex - 6, GY - 242, 12, 32, 4), '#DC2626', ex - 6, GY - 242, 12, 32, 1); box(g, ex - 2, GY - 248, 4, 6, INK);
  txt(g, 'FIRE', ex, GY - 200, PRINT('#FFFFFF'));
  memo(g, ex - 24, GY - 186, 48, ['NOW', 'HIRING:', 'INTERNS', '(UNPAID)'], { col: '#FEF08A', pin: '#DC2626' });
};

WALL_EXTRAS.vision = (g, r) => {
  const { a } = W(r);
  // (the dado's empty panels: a framed merchandising forecast (the line going up) and the Rolodex of agents)
  const fx = a + 20;
  slab(g, fx, GY - 210, 46, 60, GOLD); box(g, fx + 4, GY - 206, 38, 52, '#F5EFDF');
  txt(g, 'MERCH', fx + 23, GY - 196, PRINT('#7F1D1D'));
  g.strokeStyle = '#16A34A'; g.lineWidth = 2; g.beginPath(); g.moveTo(fx + 8, GY - 160); g.lineTo(fx + 18, GY - 168); g.lineTo(fx + 26, GY - 166); g.lineTo(fx + 38, GY - 190); g.stroke();
  box(g, fx + 6, GY - 158, 34, 1, '#475569');
  // (THE SHOW: framed, the first fax from the network: SELL THE TOY FIRST)
  const mx = X(1250);
  slab(g, mx - 4, CEIL + 300, 140, 58, GOLD); box(g, mx, CEIL + 304, 132, 50, '#FAFAF5');
  txt(g, 'FROM: THE NETWORK', mx + 66, CEIL + 314, PRINT('#475569'));
  txt(g, 'SELL THE TOY FIRST.', mx + 66, CEIL + 328, PRINT('#B91C1C'));
  txt(g, 'THE SHOW CAN FOLLOW.', mx + 66, CEIL + 340, PRINT('#1F2937'));
  txt(g, 'GREAT JOB DAVE', mx + 66, CEIL + 350, MARKER('#1D4ED8', 2));
};

WALL_EXTRAS.writers = (g) => {
  // (under the corkboard: the memos the room wrote nothing about)
  memo(g, X(2306), CEIL + 312, 96, ['MEMO', 'SELL THE TOY FIRST.', 'WRITE AROUND THE', 'TOY. THANKS - MERCH'], { head: '#B91C1C' });
  memo(g, X(2412), CEIL + 312, 102, ['OVERTIME', 'IS ITS OWN REWARD.', '- MANAGEMENT'], { col: '#FEF9C3', pin: '#16A34A', head: '#1E3A8A' });
  memo(g, X(2240), CEIL + 330, 52, ['PIZZA', 'FUND:', '$3.00'], { col: '#FFFFFF', pin: '#F59E0B' });
  // (over the whiteboard: the season's air dates, a strip of index cards)
  for (let i = 0; i < 6; i++) pinned(g, X(1900 + i * 56), CEIL + 72, 40, 26, i % 2 ? '#FFFFFF' : '#FEF9C3', ['#DC2626', '#2563EB', '#16A34A'][i % 3], q => { txt(q, `SAT ${i + 3}`, X(1920 + i * 56), CEIL + 82, PRINT('#1E3A8A')); px(q, X(1904 + i * 56), CEIL + 88, 30, 1, '#94A3B8'); });
  // (the outlet strip down by the table, every socket full, a tangle off it)
  slab(g, X(2560), GY - 40, 46, 8, BEIGE); for (let i = 0; i < 4; i++) box(g, X(2564 + i * 10), GY - 38, 6, 4, INK);
  for (let i = 0; i < 4; i++) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(X(2567 + i * 10), GY - 34); g.quadraticCurveTo(X(2560 + i * 14), GY - 4, X(2610 + i * 6), GY - 16); g.stroke(); }
};

WALL_EXTRAS.storyboards = (g, r) => {
  const { b } = W(r);
  // (the episode's deadline board tacked on the frame's end; a sign-out sheet for the pencils)
  memo(g, b - 128, CEIL + 400, 50, ['PENCILS', 'SIGN OUT', 'X 10,000'], { col: '#FFFFFF', pin: '#DC2626' });
  memo(g, X(2830), CEIL + 400, 70, ['DUE', 'FRIDAY', '(LAST', 'FRIDAY)'], { col: '#FEF08A', pin: '#2563EB', ink: '#B91C1C' });
};

WALL_EXTRAS.voice = (g) => {
  // (a cable tray along the foam, cables in it down to the booth; the session sheet; UNION SCALE)
  slab(g, X(4000), CEIL + 40, 760, 8, STEEL);
  for (let i = 0; i < 4; i++) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(X(4180 + i * 20), CEIL + 48); g.quadraticCurveTo(X(4170 + i * 24), CEIL + 120, X(4200 + i * 18), CEIL + 200); g.stroke(); g.strokeStyle = ['#2A2A34', '#7F1D1D', '#1E3A8A', '#2A2A34'][i]; g.lineWidth = 1.5; g.stroke(); }
  memo(g, X(4398), CEIL + 290, 70, ['SESSION', 'MEOW', 'TAKES 1-40', 'NO GOOD'], { head: '#1E3A8A', pin: '#DC2626' });
  memo(g, X(4700), CEIL + 230, 80, ['TALENT IS', 'PAID BY', 'THE MEOW'], { col: '#FEF9C3', pin: '#16A34A' });
  // (the second headshot column's foot: a NO FOOD IN THE BOOTH card)
  memo(g, X(3884), CEIL + 300, 100, ['NO FOOD OR DRINK', 'IN THE BOOTH', '(THIS MEANS YOU)'], { col: '#FFFFFF', pin: '#DC2626', ink: '#B91C1C' });
};

WALL_EXTRAS.models = (g) => {
  // (between the sheets: the licensing memo and the merch approvals)
  memo(g, X(5160), CEIL + 326, 140, ['LICENSING', 'ALL PRODUCTS APPROVED', 'BEFORE THE PILOT AIRS.', 'IF THE TOY CHANGES,', 'THE CAT CHANGES.'], { head: '#7C3AED', pin: '#DC2626' });
  memo(g, X(4810), CEIL + 330, 44, ['EARS', '2MM', 'BIGGER'], { col: '#FEF08A', pin: '#2563EB', ink: '#B91C1C' });
};

WALL_EXTRAS.overseas = (g) => {
  // (the overtime notice, the quota chart (the line going up, the goal over it), the payphone and its calling cards)
  memo(g, X(6130), CEIL + 76, 120, ['NOTICE', 'MANDATORY OVERTIME', 'THIS WEEKEND.', 'AND NEXT WEEKEND.', '- MANAGEMENT'], { head: '#B91C1C', pin: '#2563EB' });
  const qx = X(6640), qy = CEIL + 70;
  pinned(g, qx, qy, 120, 116, '#FFFFFF', '#DC2626', q => {
    txt(q, 'DRAWINGS PER DAY', qx + 60, qy + 12, PRINT('#1E3A8A'));
    box(q, qx + 12, qy + 20, 1, 80, '#475569'); box(q, qx + 12, qy + 100, 100, 1, '#475569');
    for (let i = 0; i < 6; i++) { const bh = 18 + i * 12; box(q, qx + 18 + i * 15, qy + 100 - bh, 10, bh, i === 5 ? '#DC2626' : '#2563EB'); box(q, qx + 18 + i * 15, qy + 100 - bh, 10, 1, '#93C5FD'); }
    for (let k = 0; k < 100; k += 6) box(q, qx + 12 + k, qy + 24, 3, 1, '#16A34A');
    txt(q, 'GOAL', qx + 100, qy + 34, PRINT('#16A34A'));
  });
  memo(g, X(7120), CEIL + 74, 110, ['FINISHED', 'DRAWINGS GO TO:', 'BURBANK', 'SCREEN CREDIT:', 'NONE'], { head: '#1E3A8A', pin: '#16A34A' });
  // (the time clock and its rack of punch cards)
  const tx = X(5920);
  slab(g, tx, CEIL + 170, 40, 46, BEIGE); box(g, tx + 6, CEIL + 176, 28, 14, INK); txt(g, '2:45', tx + 20, CEIL + 186, PRINT('#5CF06A'));
  box(g, tx + 14, CEIL + 196, 12, 14, INK);
  slab(g, tx + 46, CEIL + 160, 40, 70, STEEL); for (let i = 0; i < 6; i++) { box(g, tx + 50, CEIL + 166 + i * 10, 32, 8, STEEL[1]); box(g, tx + 52 + (i % 3) * 4, CEIL + 162 + i * 10, 10, 10, PAPER[4]); }
  // (the payphone)
  const p = X(6340);
  slab(g, p, CEIL + 130, 40, 76, CHROME); box(g, p + 6, CEIL + 138, 28, 10, '#0A2A12'); for (let i = 0; i < 12; i++) box(g, p + 9 + (i % 3) * 8, CEIL + 154 + Math.floor(i / 3) * 8, 5, 5, CHROME[5]);
  slab(g, p - 8, CEIL + 140, 8, 34, CHARCOAL); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(p - 4, CEIL + 174); g.bezierCurveTo(p - 10, CEIL + 200, p + 6, CEIL + 196, p + 8, CEIL + 206); g.stroke();
  memo(g, p - 4, CEIL + 214, 48, ['CALL', 'HOME:', '1 MIN'], { col: '#FEF08A', pin: '#DC2626' });
};

WALL_EXTRAS.inkpaint = (g) => {
  memo(g, X(8250), CEIL + 300, 120, ['SPILLS COME OUT', 'OF YOUR PAYCHECK.', 'STAY ON MODEL.', 'STAY IN THE LINES.'], { head: '#B91C1C', pin: '#2563EB' });
  memo(g, X(7646), CEIL + 300, 100, ['CEL COUNT', 'TODAY: 2,400', 'TOMORROW: 3,000'], { col: '#FEF9C3', pin: '#16A34A' });
};

WALL_EXTRAS.camera = (g) => {
  // (gaffer tape crosses on the drape, a light on a stand, the shot log on a clipboard)
  for (const [x, y] of [[8850, CEIL + 120], [8880, CEIL + 200]] as [number, number][]) { g.save(); g.translate(X(x), y); g.rotate(0.6); box(g, -10, -2, 20, 5, '#9CA3AF'); g.rotate(-1.2); box(g, -10, -2, 20, 5, '#9CA3AF'); g.restore(); }
  memo(g, X(9070), CEIL + 336, 60, ['SHOT LOG', 'EP 13', 'FRAME', '#14,402'], { col: '#FFFFFF', pin: '#DC2626' });
};

WALL_EXTRAS.premiere = () => { /* (the step-and-repeat covers the wall) */ };

// ---------------------------------------------------------------------------------------------------------------
// The tableaux' clutter (stamped with each room's props, at D_PROPS)

export const PROP_EXTRAS: Partial<Record<RoomId, (g: Ctx) => void>> = {
  lobby: (g) => {
    // (the merch cart by the doors: SOCKS plush in a pile, a price card)
    const mx = X(612);
    cart(g, mx, GY, 64, TEAL);
    for (let i = 0; i < 3; i++) socks(g, mx + 14 + i * 18, GY - 58, 0.22, i % 2);
    for (let i = 0; i < 4; i++) { slab(g, mx + 6 + i * 14, GY - 38, 12, 18, R6(['#F472B6', '#38BDF8', '#FDE047', '#86EFAC'][i])); box(g, mx + 8 + i * 14, GY - 34, 8, 3, '#FFFFFF'); }
    slab(g, mx + 8, GY - 86, 48, 18, PAPER); txt(g, 'PLUSH', mx + 32, GY - 79, PRINT('#B91C1C')); txt(g, '$29.99', mx + 32, GY - 71, PRINT('#1F2937'));
    footShadow(g, mx - 2, GY, 68);
  },
  vision: (g) => {
    // (a box of prototypes by the credenza: lunchboxes, a cereal box, SOCKS-O'S)
    const bx = X(812);
    carton(g, bx, GY, 50, 30, ['PROTO', 'TYPES']);
    slab(g, bx + 6, GY - 56, 20, 26, R6('#F59E0B')); txt(g, 'SOCKS', bx + 16, GY - 46, PRINT('#7F1D1D')); txt(g, "O'S", bx + 16, GY - 38, PRINT('#7F1D1D'));
    slab(g, bx + 28, GY - 46, 20, 16, R6('#2563EB')); box(g, bx + 34, GY - 50, 8, 4, INK); socks(g, bx + 38, GY - 33, 0.14, 0);
  },
  writers: (g) => {
    // (the table's other end: an ashtray, cups, a stack of scripts; a trash can by the coat rack)
    const ty = GY - 70;
    ashtray(g, X(2080), ty); cup(g, X(2200), ty); cup(g, X(2345), ty, '#FDE68A'); mug(g, X(2530), ty, '#1D4ED8');
    for (let i = 0; i < 5; i++) { box(g, X(2390) - 1, ty - 3 - i * 3, 30, 3, INK); box(g, X(2390), ty - 3 - i * 3 + 1, 28, 2, i % 2 ? PAPER[4] : PAPER[3]); }
    trash(g, X(1900), GY, 1);
  },
  storyboards: (g) => {
    // (an animation desk by the door: its light disc, the peg bar, drawings on the shelf over it; a box of storyboard paper)
    animDesk(g, X(2850), GY, 2);
    carton(g, X(2980), GY, 54, 34, ['STORY', 'BOARD', 'PADS']);
    carton(g, X(2988), GY - 34, 40, 22, ['PINS']);
    trash(g, X(3500), GY, 2);
  },
  voice: (g) => {
    // (a case of bottled water by the talent's chair)
    carton(g, X(4748), GY, 30, 22, ['H2O']);
  },
  models: (g) => {
    // (the licensed-products rack: the lunchbox, the plush, the cereal, the bendy toy: all before the pilot)
    const rx = X(5250);
    slab(g, rx, GY - 120, 6, 120, STEEL); slab(g, rx + 120, GY - 120, 6, 120, STEEL);
    for (let s = 0; s < 3; s++) slab(g, rx, GY - 40 - s * 40, 126, 5, STEEL);
    socks(g, rx + 22, GY - 125, 0.26, 0); socks(g, rx + 56, GY - 125, 0.26, 1);
    slab(g, rx + 80, GY - 102, 30, 22, R6('#2563EB')); box(g, rx + 89, GY - 107, 12, 5, INK); txt(g, 'LUNCH', rx + 95, GY - 88, PRINT('#FFFFFF'));
    for (let i = 0; i < 4; i++) { slab(g, rx + 8 + i * 28, GY - 74, 22, 30, R6(['#F59E0B', '#DC2626', '#16A34A', '#7C3AED'][i])); box(g, rx + 11 + i * 28, GY - 70, 16, 4, '#FFFFFF'); }
    slab(g, rx + 10, GY - 30, 106, 10, PAPER); txt(g, 'PRE-PILOT', rx + 63, GY - 22, PRINT('#B91C1C'));
    footShadow(g, rx - 4, GY, 136);
  },
  overseas: (g) => {
    // (the crates of finished animation going out, stenciled; a mop bucket; a cot rolled up)
    crate(g, X(7540), GY, 52, 48, ['RUSH', 'TO', 'BURBANK'], '#7F1D1D');
    crate(g, X(7546), GY - 48, 40, 32, ['FRAGILE']);
  },
  inkpaint: (g) => {
    // (a cart of paint jars by the door; cels drying flat on a rack)
    const cx = X(7618);
    cart(g, cx, GY, 50, STEEL);
    for (let i = 0; i < 4; i++) jar(g, cx + 4 + i * 11, GY - 52, ['#DC2626', '#18181B', '#FACC15', '#2563EB'][i]);
    for (let i = 0; i < 3; i++) jar(g, cx + 8 + i * 13, GY - 20, ['#F0C8A2', '#FFFFFF', '#7C3AED'][i]);
    celStack(g, X(8110), GY - 66, 40, 6, '#18181B');
  },
  camera: (g) => {
    // (a light on its stand by the rostrum, sandbagged; the cables to it)
    lampStand(g, X(8830), GY, 150, 1);
    sandbag(g, X(8830), GY);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The near layer: low clutter just behind the rope (depth NEAR), stamped per room

export const D_NEAR = 0.915;
export const NEAR: Partial<Record<RoomId, (g: Ctx) => void>> = {
  lobby: (g) => { wetFloor(g, X(110), GY); crumple(g, X(520), GY, 4, 1); },
  vision: (g) => {
    // (the putting green: the mat, the cup and its flag, balls short of it)
    const px0 = X(1610);
    part(g, () => g.roundRect(px0, GY - 6, 170, 6, 3), '#2F8A3A', px0, GY - 6, 170, 6, 1); checker(g, px0 + 2, GY - 5, 166, 2, '#3FA64A', 0, 2);
    g.fillStyle = INK; g.beginPath(); g.ellipse(px0 + 150, GY - 4, 5, 2, 0, 0, Math.PI * 2); g.fill();
    limb(g, px0 + 150, GY - 4, px0 + 150, GY - 40, 1.4, PAPER[4]); flat(g, () => g.rect(px0 + 151, GY - 40, 12, 8), '#DC2626', 1);
    for (const bx of [30, 52, 120]) ball(g, px0 + bx, GY - 8, 3, '#FFFFFF', 0.8);
    limb(g, px0 - 6, GY - 2, px0 + 14, GY - 44, 2, CHROME[3]); slab(g, px0 - 12, GY - 6, 14, 5, CHARCOAL);
  },
  writers: (g) => {
    for (const [x, k] of [[1960, 0], [2140, 1], [2230, 2], [2470, 3], [2590, 4], [2740, 5]] as [number, number][]) crumple(g, X(x), GY, 4 + (k % 3), k);
    cable(g, [[X(2560), GY - 2], [X(2620), GY - 4], [X(2700), GY - 2], [X(2780), GY - 3]]);
    slab(g, X(2290), GY - 6, 20, 6, R6('#D6B98C'));
  },
  storyboards: (g) => {
    for (const [x, k] of [[2900, 0], [3020, 1], [3460, 2], [3620, 3], [3770, 4]] as [number, number][]) crumple(g, X(x), GY, 4 + (k % 3), k);
    cup(g, X(3480), GY);
  },
  voice: (g) => {
    // (mic cables snaking across the floor to the booth, taped down)
    cable(g, [[X(3820), GY - 3], [X(3900), GY - 2], [X(3990), GY - 5], [X(4100), GY - 2], [X(4250), GY - 4], [X(4420), GY - 2]]);
    cable(g, [[X(4360), GY - 4], [X(4460), GY - 2], [X(4600), GY - 3], [X(4780), GY - 2]], false);
    // (a roll of gaffer tape)
    ball(g, X(4610), GY - 5, 5, '#9CA3AF', 1); ball(g, X(4610), GY - 5, 2, INK, 0);
  },
  models: (g) => {
    for (const [x, k] of [[4850, 0], [5000, 1], [5230, 2], [5560, 3]] as [number, number][]) crumple(g, X(x), GY, 4 + (k % 3), k);
    g.fillStyle = 'rgba(185,28,28,0.5)'; g.beginPath(); g.ellipse(X(5140), GY - 2, 8, 2, 0, 0, Math.PI * 2); g.fill();
  },
  overseas: (g) => {
    // (noodle cups, a thermos and a stack of drawings by the near end; a mop bucket and crates past the pile)
    for (let i = 0; i < 3; i++) { slab(g, X(5700 + i * 14), GY - 12, 10, 12, PAPER); box(g, X(5700 + i * 14), GY - 12, 10, 3, '#DC2626'); }
    part(g, () => g.roundRect(X(5750), GY - 20, 8, 20, 2), '#1E3A8A', X(5750), GY - 20, 8, 20, 0.9);
    for (let i = 0; i < 4; i++) box(g, X(5800), GY - 4 - i * 4, 40, 4, i % 2 ? PAPER[4] : PAPER[3]); box(g, X(5815), GY - 16, 4, 16, '#B45309');
    for (const [x, k] of [[5880, 0], [5990, 1], [7230, 2], [7480, 3]] as [number, number][]) crumple(g, X(x), GY, 4, k);
    // (the mop bucket)
    slab(g, X(7300), GY - 22, 30, 22, R6('#FACC15')); limb(g, X(7322), GY - 20, X(7340), GY - 80, 2, '#8B6B4A'); for (let i = 0; i < 4; i++) limb(g, X(7322), GY - 20, X(7316 + i * 4), GY - 10, 1.5, PAPER[2]);
    carton(g, X(7380), GY, 44, 26, ['OVERSEAS']);
  },
  inkpaint: (g) => {
    // (stacked paint cans, a bucket of brushes)
    for (let i = 0; i < 3; i++) { slab(g, X(7640 + i * 30), GY - 22, 26, 22, CHROME); box(g, X(7644 + i * 30), GY - 16, 18, 8, ['#DC2626', '#2563EB', '#FACC15'][i]); }
    slab(g, X(7652), GY - 44, 26, 22, CHROME); box(g, X(7656), GY - 38, 18, 8, '#18181B');
    slab(g, X(8440), GY - 20, 22, 20, STEEL); for (let i = 0; i < 5; i++) limb(g, X(8444 + i * 3), GY - 18, X(8442 + i * 4), GY - 34, 1.4, ['#A16207', '#DC2626', '#2563EB', '#A16207', '#16A34A'][i]);
    for (let i = 0; i < 5; i++) { g.fillStyle = ['rgba(220,38,38,0.45)', 'rgba(37,99,235,0.4)', 'rgba(250,204,21,0.45)'][i % 3]; g.beginPath(); g.ellipse(X(8380 + i * 40), GY - 1, 6, 1.5, 0, 0, Math.PI * 2); g.fill(); }
  },
  camera: (g) => {
    cable(g, [[X(8620), GY - 2], [X(8700), GY - 4], [X(8830), GY - 2]]);
    canStack(g, X(9040), GY, 3); sandbag(g, X(9010), GY);
  },
  premiere: (g) => {
    // (confetti on the red carpet's edge, a dropped program)
    for (let i = 0; i < 26; i++) box(g, X(9220 + hash(i * 3.7) * 400), GY - 1 - Math.floor(hash(i * 1.3) * 4), 2, 2, ['#F2C84A', '#EC4899', '#38BDF8', '#FFFFFF'][i % 4]);
    slab(g, X(9300), GY - 4, 16, 4, R6('#7C3AED'));
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The live touches (drawn at D_PROPS with the room's tableau)

export const drawClutterLive = (c: Ctx, id: RoomId, f: number) => {
  if (id === 'writers') {
    // (the ashtray's smoke, curling up)
    for (let i = 0; i < 4; i++) { const t = ((f + i * 30) % 120) / 120; c.fillStyle = `rgba(200,200,210,${(0.45 * (1 - t)).toFixed(2)})`; c.fillRect(Math.round(X(2080) + Math.sin(t * 7 + i) * 4), Math.round(GY - 76 - t * 40), 2, 2); }
  } else if (id === 'overseas') {
    // (one of the strip lights on the blink: flicks off now and then, a tick back on)
    const off = (f % 230) < 8 || ((f % 230) > 14 && (f % 230) < 18);
    if (off) { box(c, X(6650) - 56, CEIL + 48, 112, 3, '#6E7A72'); }
    // (the desk fan on the side table, its head turning)
    const fx = X(6280), fy = GY - 70, a = Math.sin(f * 0.02) * 0.9;
    limb(c, fx, fy, fx, fy - 18, 2, STEEL[3]);
    c.fillStyle = INK; c.beginPath(); c.ellipse(fx, fy - 26, 10 * Math.max(0.25, Math.abs(Math.cos(a))), 10, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#9AA6B4'; c.beginPath(); c.ellipse(fx, fy - 26, 9 * Math.max(0.2, Math.abs(Math.cos(a))), 9, 0, 0, Math.PI * 2); c.fill();
    const s = (f * 0.6) % (Math.PI * 2); box(c, fx + Math.cos(s) * 4 * Math.abs(Math.cos(a)) - 1, fy - 26 + Math.sin(s) * 4 - 1, 3, 3, '#4A505E');
    steam(c, X(5714), GY - 14, f, 3);
  } else if (id === 'vision') {
    // (the answering machine on the credenza: a message waiting, its lamp blinking)
    const ax = X(930), ay = GY - 92;
    box(c, ax - 1, ay - 9, 24, 10, INK); box(c, ax, ay - 8, 22, 8, CHARCOAL[3]); box(c, ax + 3, ay - 6, 8, 4, CHARCOAL[1]);
    box(c, ax + 15, ay - 6, 4, 3, (f >> 4) % 2 ? '#F87171' : '#5A0A0A');
  } else if (id === 'camera') {
    // (the rostrum camera's tally light: on while it shoots a frame)
    box(c, X(8960) + 30, GY - 330, 4, 4, (f % 50) < 25 ? '#EF4444' : '#3A0A0A');
  }
};
