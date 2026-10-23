// The showpiece room (THE HOLD), drawn (the SNES pass): the antechamber (a purple hall banded dark to light, the queue's
// chrome stanchions and velvet ropes, the framed THE HOLD sign, a poster or two), and the room itself: a domed hive
// (resin walls in hex cells, each lit along its top edge and shaded under, resin drips stepped down them, the hold's
// ribs arching up), the control booth up in the left wall (the two operators at their consoles), the dish on it, her
// stage (foam rock, footlights), the plaque, the banner; the glass in front of her; after the fall, her stand empty
// and the hole. The queen herself: sprite.ts.

import type { GameState } from '../../../m1/game/core/state';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { stamp } from '../../../m1/game/render/stamp';
import { bandedGradient } from '../../../m1/game/render/pixelArt';
import { box } from '../section';
import { chrome, square, slime, print, engraved, stencil } from './letters';
import { GY } from '../geometry';
import { drawAlien } from '../crater/aliens';
import { x0, ANTE_R, ARENA_L, ARENA_R, GLASS_X, QUEEN_X, BOOTH } from './geo';
import { type Ramp, CHROME, STEELR, SACR, dith, tube, blob, hose, quad, shapeShade, hash } from './paint';

type Ctx = CanvasRenderingContext2D;

export { drawQueen, queenHead, QUEEN_H, type QueenPose, type QueenDraw } from './sprite';

const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const RESIN: Ramp = ['#0A0410', '#1E0B2C', '#2E1242', '#43195C', '#6A2D84'];
const BONE: Ramp = ['#05020A', '#1A0A26', '#2C1240', '#46205E', '#6E3A8C'];
const WOOD: Ramp = ['#1A0A02', '#4A2208', '#78350F', '#A35A1C', '#D08A3A'];

// ---------------------------------------------------------------------------------------------------------------
// The room

export interface RoomDraw {
  /** The glass: up, or kicked in. */
  glass: boolean;
  /** The booth's lights up (they're in there), and its window splattered (the feedback got them). */
  booth: number; splat: boolean;
  /** The booth's operators, alive (drawn at their controls). */
  operators: boolean;
  /** The mind-control beam on (0..1). */
  beam: number;
  /** The queen's head, for the beam to land on. */
  head: { x: number; y: number };
}

const shown = (state: GameState, a: number, b: number) => { const v = state.view ?? { x: state.camera.x, w: 800 }; return b > v.x - 60 && a < v.x + v.w + 60; };

const paintAnte = (g: Ctx) => {
  const L = x0 - 200, W = ANTE_R - x0 + 230;
  // (the hall: banded dark to purple, pilasters every so often, a wainscot of quilted vinyl, a gold rail)
  bandedGradient(g, L, GY - 470, W, 470, ['#0A0414', '#1C0A33', '#2E1052', '#3B1468', '#2A0E4A'], 12);
  const PIL = ['#5B21B6', '#4C1D95', '#3B1468', '#2E1052', '#1A0830', '#0E041C'];
  for (let x = L + 40; x < L + W; x += 180) {
    px(g, x - 1, GY - 440, 26, 440, '#05020B');
    PIL.forEach((col, k) => px(g, x + k * 4, GY - 440, 4, 440, col));
    for (const fx of [x + 7, x + 15]) { px(g, fx, GY - 420, 2, 250, '#14052A'); px(g, fx - 1, GY - 420, 1, 250, '#6D28D9'); }
    for (const [y, ex, h] of [[GY - 440, 6, 5], [GY - 435, 4, 4], [GY - 431, 2, 3], [GY - 176, 2, 4], [GY - 172, 4, 5], [GY - 167, 6, 13]] as const) {
      px(g, x - ex - 1, y - 1, 26 + ex * 2, h + 2, '#05020B'); px(g, x - ex, y, 24 + ex * 2, h, '#3B1468'); px(g, x - ex, y, 24 + ex * 2, 1, '#8B5CF6'); px(g, x - ex, y + h - 1, 24 + ex * 2, 1, '#14052A'); px(g, x - ex, y, 2, h, '#5B21B6');
    }
  }
  px(g, L, GY - 470, W, 30, '#05020B'); px(g, L, GY - 442, W, 2, '#3B1468');
  px(g, L, GY - 150, W, 150, '#22093C');
  for (let x = L; x < L + W; x += 20) for (let y = GY - 146; y < GY - 6; y += 20) { px(g, x + 2, y + 2, 16, 16, '#2E0E50'); px(g, x + 2, y + 2, 16, 2, '#4A1A78'); px(g, x + 9, y + 9, 2, 2, '#14052A'); }
  px(g, L, GY - 154, W, 4, '#5A3A0A'); px(g, L, GY - 154, W, 1, '#8A6A1A'); px(g, L, GY - 150, W, 1, '#2A1A04');
  // (the floor's lip: the carpet, lit at its edge)
  px(g, L, GY - 4, W, 4, '#4C1D95'); px(g, L, GY - 4, W, 1, '#A78BFA');
  // (the sign: framed in chrome, lit from over it)
  const sx = x0 + 120, sy = GY - 330;
  px(g, sx - 4, sy - 4, 308, 78, '#05020B'); px(g, sx - 2, sy - 2, 304, 74, '#8E8E99'); px(g, sx - 2, sy - 2, 304, 2, '#F4F4F5');
  px(g, sx, sy, 300, 70, '#12061E'); px(g, sx, sy, 300, 3, '#2A1240');
  chrome(g, 'THE HOLD', sx + 150, sy + 10, 2, 4, { shadow: '#4C1D95', slant: 1 });
  square(g, 'MEET THE QUEEN (LEGALLY DISTINCT)', sx + 150, sy + 51, 1, 1, ['#12061E', '#5B21B6', '#8B5CF6', '#C4B5FD', '#EDE9FE'], { spacing: 1 });
  tube(g, sx + 150, sy - 4, sx + 150, sy - 20, 3, CHROME); px(g, sx + 144, sy - 6, 13, 4, '#05020B'); px(g, sx + 145, sy - 5, 11, 2, CHROME[2]);
  px(g, sx + 108, sy - 30, 84, 10, '#05020B');
  ['#F4F4F5', '#C9CBD3', '#8E8E99', '#52525B'].forEach((col, k) => px(g, sx + 109, sy - 29 + k * 2, 82, 2, col));
  px(g, sx + 109, sy - 21, 82, 1, '#FEF3C7'); px(g, sx + 112, sy - 21, 76, 1, '#FFFFFF');
  for (const ex of [sx + 107, sx + 189]) blob(g, ex + 2, sy - 25, 3, 4, CHROME);
  g.fillStyle = dith(g, 'rgba(254, 243, 199, 0.22)'); g.beginPath(); g.moveTo(sx + 112, sy - 20); g.lineTo(sx + 188, sy - 20); g.lineTo(sx + 230, sy - 2); g.lineTo(sx + 70, sy - 2); g.closePath(); g.fill();
  // (a poster: NOW 40% MORE LEGALLY DISTINCT)
  const ppx = x0 + 500, ppy = GY - 300;
  px(g, ppx - 2, ppy - 2, 104, 144, '#05020B'); px(g, ppx, ppy, 100, 140, '#14532D'); px(g, ppx, ppy, 100, 3, '#22C55E');
  blob(g, ppx + 50, ppy + 56, 26, 30, ['#020403', '#0A1A10', '#14281A', '#2E4A36', '#6A8A72']);
  for (let k = 0; k < 5; k++) px(g, ppx + 34 + k * 7, ppy + 70, 3, 6, '#E5E7EB');
  slime(g, 'XENOSCARE', ppx + 50, ppy + 94, 1, ['#020403', '#15803D', '#22C55E', '#86EFAC', '#F0FDF4'], 7);
  print(g, 'NOW 40% MORE', ppx + 50, ppy + 113, 1, 1, ['#FFFFFF', '#DCFCE7'], { shadow: '#052E16' });
  print(g, 'LEGALLY DISTINCT', ppx + 50, ppy + 123, 1, 1, ['#FFFFFF', '#DCFCE7'], { shadow: '#052E16' });
  // (the queue: chrome stanchions, red velvet ropes sagging between them)
  const posts = [x0 + 40, x0 + 160, x0 + 280, x0 + 400];
  for (let i = 0; i < posts.length - 1; i++) hose(g, quad(posts[i], GY - 70, (posts[i] + posts[i + 1]) / 2, GY - 44, posts[i + 1], GY - 70, 8), 5, ['#2A0505', '#7F1D1D', '#B91C1C', '#EF4444', '#FCA5A5']);
  for (const p of posts) { tube(g, p, GY - 74, p, GY - 8, 6, CHROME); blob(g, p, GY - 76, 5, 5, CHROME); g.fillStyle = '#18181B'; g.beginPath(); g.ellipse(p, GY - 4, 14, 4, 0, 0, Math.PI * 2); g.fill(); px(g, p - 12, GY - 6, 24, 2, '#A1A1AA'); }
};

const hexCell = (g: Ctx, cx: number, cy: number, r: number, k: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9]); }
  const path = (s: number, dx: number, dy: number) => { g.beginPath(); pts.forEach(([x, y], i) => { const X = cx + (x - cx) * s + dx, Y = cy + (y - cy) * s + dy; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.closePath(); };
  path(1, 0, 0); g.fillStyle = RESIN[0]; g.fill();
  path(0.9, 0, 0); g.fillStyle = k ? RESIN[2] : RESIN[1]; g.fill();
  path(0.78, -1.5, -2); g.fillStyle = dith(g, RESIN[3]); g.fill();
  path(0.6, -2, -3); g.fillStyle = k ? RESIN[3] : RESIN[2]; g.fill();
  path(0.3, 2, 2); g.fillStyle = RESIN[0]; g.fill();
};

const paintRoom = (g: Ctx) => {
  const l = ARENA_L - 60, w = ARENA_R - ARENA_L + 360;
  bandedGradient(g, l, GY - 600, w, 600, ['#06020A', '#12061C', '#1E0A2E', '#24103A', '#1A0A2A'], 12);
  // (the honeycomb: hex cells in rows, each shaded in steps (a few lit stronger), dark in their middles)
  for (let row = 0; row < 12; row++) for (let col = 0; col < 26; col++) {
    const hx = l + col * 46 + (row % 2) * 23, hy = GY - 560 + row * 40;
    hexCell(g, hx, hy, 21, (row + col) % 5 === 0 ? 1 : 0);
  }
  // (resin drips down the walls: stepped green, a bead at each end)
  for (let i = 0; i < 18; i++) {
    const dx = l + 20 + i * 64, dl = 80 + (i * 37) % 140;
    px(g, dx, GY - 600, 7, dl, 'rgba(101, 163, 13, 0.25)'); px(g, dx + 1, GY - 600, 2, dl, 'rgba(190, 242, 100, 0.25)');
    g.fillStyle = dith(g, 'rgba(132, 204, 22, 0.35)'); g.fillRect(dx - 2, GY - 600, 11, dl * 0.6);
    blob(g, dx + 3, GY - 600 + dl, 4, 5, ['#1A2E05', '#3F6212', '#65A30D', '#A3E635', '#ECFCCB']);
  }
  // (the hold's ribs arching up the walls: bone-ish resin, shaded round)
  for (let i = 0; i < 6; i++) {
    const rx = l + 60 + i * 200;
    hose(g, quad(rx, GY, rx - 30, GY - 420, rx + 60, GY - 560, 14), 16, BONE);
    for (let k = 1; k < 6; k++) { const u = k / 6, bx = (1 - u) * (1 - u) * rx + 2 * u * (1 - u) * (rx - 30) + u * u * (rx + 60), by = (1 - u) * (1 - u) * GY + 2 * u * (1 - u) * (GY - 420) + u * u * (GY - 560); px(g, bx - 9, by, 18, 2, BONE[0]); }
  }
  // (a speaker in plain sight, gaffer-taped; the LEGALLY DISTINCT banner over her)
  px(g, ARENA_L + 328, GY - 562, 32, 38, '#05020B'); px(g, ARENA_L + 330, GY - 560, 28, 34, '#27272A'); px(g, ARENA_L + 330, GY - 560, 28, 2, '#52525B');
  blob(g, ARENA_L + 344, GY - 543, 9, 9, ['#05050A', '#2A2A33', '#3F3F4C', '#5A5A6A', '#8A8A9A']);
  px(g, ARENA_L + 326, GY - 548, 36, 5, '#9CA3AF');
  const bnL = GLASS_X + 10, bnR = GLASS_X + 310, bnT = GY - 420, bnB = GY - 388, PT = 20;
  const pts = () => { g.moveTo(bnL, bnT); g.lineTo(bnR, bnT); g.lineTo(bnR, bnB); for (let x = bnR; x > bnL; x -= PT) { g.lineTo(x - PT / 2, bnB + 9); g.lineTo(x - PT, bnB); } g.closePath(); };
  g.fillStyle = '#05020B'; g.lineWidth = 3; g.strokeStyle = '#05020B'; g.beginPath(); pts(); g.stroke(); g.fill();
  g.save(); g.beginPath(); pts(); g.clip();
  const FOLD = ['#5A0F0F', '#7F1D1D', '#991B1B', '#B91C1C', '#C53030', '#991B1B', '#7F1D1D'];
  for (let x = bnL, k = 0; x < bnR; x += 3, k++) px(g, x, bnT, 3, bnB + 10 - bnT, FOLD[k % FOLD.length]);
  g.fillStyle = dith(g, '#450A0A'); g.fillRect(bnL, bnB - 8, bnR - bnL, 18);
  px(g, bnL, bnT, bnR - bnL, 3, '#450A0A');
  g.restore();
  // (the gold fringe along its points, the rod and its finials, the cords up)
  for (let x = bnL; x < bnR; x += PT) { g.strokeStyle = '#CA8A04'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, bnB); g.lineTo(x + PT / 2, bnB + 9); g.lineTo(x + PT, bnB); g.stroke(); blob(g, x + PT / 2, bnB + 11, 2, 2.5, ['#2E1F02', '#854D0E', '#CA8A04', '#FACC15', '#FEF08A']); }
  for (const cx of [bnL + 30, bnR - 30]) { g.strokeStyle = '#854D0E'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, bnT - 4); g.lineTo((bnL + bnR) / 2, bnT - 26); g.stroke(); }
  tube(g, bnL - 8, bnT - 3, bnR + 8, bnT - 3, 5, ['#2E1F02', '#854D0E', '#CA8A04', '#FACC15', '#FEF08A']);
  for (const fx of [bnL - 10, bnR + 10]) blob(g, fx, bnT - 3, 4, 4, ['#2E1F02', '#854D0E', '#CA8A04', '#FACC15', '#FEF08A']);
  square(g, 'THE HOLD - LEGALLY DISTINCT', GLASS_X + 160, GY - 410, 1, 2, ['#2A0505', '#A16207', '#E8B84A', '#FDE68A', '#FFFBEB'], { spacing: 1 });
  // (the floor: dark, slick, its lip lit (stand on it); a reflection of the stage's footlights in it)
  px(g, l, GY, w, 4, '#18181B'); px(g, l, GY, w, 2, '#A78BFA'); px(g, l, GY + 2, w, 1, '#4C1D95');
  // (the stage: a raised lip of rock-look foam in front of her, shaded, cracked; the footlights)
  const st = () => { g.moveTo(GLASS_X - 20, GY); g.lineTo(GLASS_X - 20, GY - 14); g.quadraticCurveTo(GLASS_X + 40, GY - 22, GLASS_X + 160, GY - 18); g.quadraticCurveTo(ARENA_R + 100, GY - 24, ARENA_R + 300, GY - 18); g.lineTo(ARENA_R + 300, GY); g.closePath(); };
  shapeShade(g, st, ['#0A0418', '#1E0A40', '#2E1065', '#4C1D95', '#7C3AED'], 0, -1.2, 2, GLASS_X + 200, GY - 8);
  for (let i = 0; i < 8; i++) { const fx = GLASS_X + i * 40; px(g, fx - 1, GY - 17, 12, 7, '#05020B'); px(g, fx, GY - 16, 10, 5, '#A16207'); px(g, fx + 1, GY - 16, 8, 2, '#FDE047'); px(g, fx + 3, GY - 15, 3, 1, '#FFFFFF'); }
  // (the plaque: wood, its brass face, on its post)
  const pl = GLASS_X - 236;
  tube(g, GLASS_X - 126, GY - 66, GLASS_X - 126, GY, 6, WOOD);
  px(g, pl - 2, GY - 138, 224, 74, '#05020B'); px(g, pl, GY - 136, 220, 70, WOOD[2]); px(g, pl, GY - 136, 220, 3, WOOD[4]); px(g, pl + 214, GY - 133, 6, 67, WOOD[1]);
  px(g, pl + 6, GY - 130, 208, 58, '#7A5A12'); px(g, pl + 6, GY - 130, 208, 2, '#E8C060'); g.fillStyle = dith(g, '#5A400A'); g.fillRect(pl + 6, GY - 80, 208, 8);
  engraved(g, 'THE QUEEN', pl + 110, GY - 127, 2, '#3A2606', '#E8C060');
  engraved(g, '(LEGALLY DISTINCT)', pl + 110, GY - 110, 1, '#3A2606', '#E8C060');
  engraved(g, 'ANY RESEMBLANCE TO COPYRIGHTED', pl + 110, GY - 99, 1, '#4A3208', '#D6B050');
  engraved(g, 'XENOMORPHS IS PURELY COINCIDENTAL', pl + 110, GY - 90, 1, '#4A3208', '#D6B050');
  // (the booth: a steel box up in the wall at the left, its window, its sign)
  const bx = BOOTH.x - 14, by = BOOTH.y - 14, bw = BOOTH.w + 28, bh = BOOTH.h + 40;
  px(g, bx - 2, by - 2, bw + 4, bh + 4, '#05020B'); px(g, bx, by, bw, bh, STEELR[2]); px(g, bx, by, bw, 3, STEELR[4]); px(g, bx + bw - 8, by + 3, 8, bh - 3, STEELR[1]); px(g, bx, by + bh - 6, bw, 6, STEELR[1]);
  for (const [rx, ry] of [[bx + 4, by + 6], [bx + bw - 14, by + 6], [bx + 4, by + bh - 12], [bx + bw - 14, by + bh - 12]]) px(g, rx, ry, 3, 3, CHROME[3]);
  px(g, BOOTH.x - 6, BOOTH.y - 6, BOOTH.w + 12, BOOTH.h + 12, '#05050A');
  px(g, BOOTH.x - 5, BOOTH.y - 5, BOOTH.w + 10, BOOTH.h + 10, CHROME[1]); px(g, BOOTH.x - 5, BOOTH.y - 5, BOOTH.w + 10, 1, CHROME[4]); px(g, BOOTH.x - 5, BOOTH.y - 4, BOOTH.w + 10, 1, CHROME[3]); px(g, BOOTH.x - 5, BOOTH.y - 5, 1, BOOTH.h + 10, CHROME[3]); px(g, BOOTH.x + BOOTH.w + 4, BOOTH.y - 4, 1, BOOTH.h + 9, CHROME[0]);
  px(g, BOOTH.x - 2, BOOTH.y - 2, BOOTH.w + 4, BOOTH.h + 4, '#05050A');
  px(g, BOOTH.x, BOOTH.y, BOOTH.w, BOOTH.h, '#0A0A0A');
  stencil(g, 'CONTROL - STAFF ONLY', BOOTH.x + BOOTH.w / 2, BOOTH.y + BOOTH.h + 12, 1, '#FDE047', { seed: 3, spray: 'rgba(253, 224, 71, 0.3)', runs: false });
  // (the dish on the booth's front, aimed at her: a chrome bowl on an arm, its feed horn)
  tube(g, BOOTH.x + BOOTH.w + 6, BOOTH.y + BOOTH.h + 4, BOOTH.x + BOOTH.w + 18, BOOTH.y + BOOTH.h - 8, 4, CHROME);
  g.save(); g.translate(BOOTH.x + BOOTH.w + 18, BOOTH.y + BOOTH.h - 8); g.rotate(-0.6);
  g.fillStyle = '#05050A'; g.beginPath(); g.ellipse(0, 0, 11, 19, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = CHROME[1]; g.beginPath(); g.ellipse(0, 0, 10, 18, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = CHROME[3]; g.beginPath(); g.ellipse(2, -2, 6, 13, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = CHROME[4]; g.fillRect(3, -10, 2, 6);
  tube(g, 0, 0, 14, 0, 2, CHROME); blob(g, 15, 0, 2.5, 2.5, ['#1A2E05', '#4D7C0F', '#84CC16', '#D9F99D', '#FFFFFF']);
  g.restore();
};

/** The control booth's back wall, still: green-gray panels (banded, their seams lit), six screens in bezels (dark
 *  green, a stippled grid, the top line). */
const paintCtrlWall = (g: Ctx) => {
  const X = BOOTH.x, Y = BOOTH.y, w = BOOTH.w, h = BOOTH.h;
  ['#0E1C13', '#0C1810', '#0A140D', '#08100A'].forEach((col, k) => px(g, X, Y + k * (h / 4), w, Math.ceil(h / 4), col));
  for (let x = X + 3; x < X + w; x += 39) { px(g, x, Y, 1, h, '#05080A'); px(g, x + 1, Y, 1, h, '#1E3A28'); }
  for (let i = 0; i < 6; i++) {
    const sx = X + 6 + i * 39, sy = Y + 6;
    px(g, sx - 2, sy - 2, 36, 26, '#05050A'); px(g, sx - 1, sy - 1, 34, 24, '#3F3F46'); px(g, sx - 1, sy - 1, 34, 1, '#A1A1AA'); px(g, sx + 32, sy, 1, 23, '#27272A');
    px(g, sx, sy, 32, 22, '#052E16'); g.fillStyle = dith(g, '#0A3A1E'); g.fillRect(sx, sy, 32, 22);
    for (let gx = sx + 4; gx < sx + 32; gx += 8) px(g, gx, sy, 1, 22, '#0B3D20');
    px(g, sx + 2, sy + 2, 28, 1, '#14532D'); px(g, sx + 1, sy + 1, 3, 2, '#86EFAC');
    px(g, sx + 14, sy + 23, 4, 3, '#18181B');
  }
};
/** The control booth's console, still: its top (lit lip), its banded face, the lamps' sockets, knobs between. */
const paintCtrlDesk = (g: Ctx) => {
  const X = BOOTH.x, Y = BOOTH.y + BOOTH.h - 14, w = BOOTH.w;
  px(g, X, Y - 2, w, 2, '#05050A');
  ['#52525B', '#3F3F46', '#34343B', '#2A2A30'].forEach((col, k) => px(g, X, Y + k * 3.5, w, 4, col));
  px(g, X, Y, w, 2, '#A1A1AA'); px(g, X, Y, w, 1, '#E4E4E7');
  for (let i = 0; i < 12; i++) { const lx = X + 8 + i * 18; px(g, lx - 1, Y + 3, 8, 6, '#18181B'); if (i < 11) { blob(g, lx + 12, Y + 7, 2, 2, CHROME); } }
};

export const drawRoomBack = (c: Ctx, state: GameState, r: RoomDraw) => {
  // The antechamber: a purple hall, the queue's velvet ropes, the sign
  if (shown(state, x0 - 200, ANTE_R)) stamp(c, 'sp-q-ante2', x0 - 200, GY - 470, ANTE_R - x0 + 230, 474, paintAnte);
  if (!shown(state, ARENA_L - 60, ARENA_R + 300)) return;
  // The showpiece room: a domed hive (resin walls, honeycomb), the stage at the right with her on it
  stamp(c, 'sp-q-room2', ARENA_L - 60, GY - 600, ARENA_R - ARENA_L + 360, 604, paintRoom);
  // The booth's insides (lit, them at the controls), live
  if (r.booth > 0) {
    c.save(); c.beginPath(); c.rect(BOOTH.x, BOOTH.y, BOOTH.w, BOOTH.h); c.clip();
    // (its back wall: panels, their screens (stamped); the screens' green line scrolling, live)
    stamp(c, 'sp-q-ctrl-wall', BOOTH.x, BOOTH.y, BOOTH.w, BOOTH.h, paintCtrlWall);
    for (let i = 0; i < 6; i++) px(c, BOOTH.x + 8 + i * 39, BOOTH.y + 8 + ((state.frame >> 3) + i * 3) % 18, 28, 1, '#4ADE80');
    c.fillStyle = `rgba(74, 222, 128, ${(0.2 * r.booth).toFixed(2)})`; c.fillRect(BOOTH.x, BOOTH.y, BOOTH.w, BOOTH.h);
    if (r.operators) for (let i = 0; i < 2; i++) { c.save(); c.translate(BOOTH.x + 60 + i * 100, BOOTH.y + BOOTH.h + 50); drawAlien(c, { seed: 101 + i * 7, headset: true, woman: i === 1 }, 'operate', state.frame + i * 9, 0.95); c.restore(); }
    else for (let i = 0; i < 2; i++) { const bx = BOOTH.x + 60 + i * 100; c.fillStyle = ALIEN.hide[5]; c.beginPath(); c.roundRect(bx - 20, BOOTH.y + BOOTH.h - 34, 46, 40, 6); c.fill(); box(c, bx - 14, BOOTH.y + BOOTH.h - 40, 30, 8, ALIEN.gum); }
    // (the console under the window: its lamps blinking, a row of knobs)
    stamp(c, 'sp-q-ctrl-desk', BOOTH.x, BOOTH.y + BOOTH.h - 16, BOOTH.w, 16, paintCtrlDesk);
    for (let i = 0; i < 12; i++) { const on = (state.frame + i * 7) % 30 < 15; px(c, BOOTH.x + 8 + i * 18, BOOTH.y + BOOTH.h - 10, 6, 4, on ? '#EF4444' : '#22C55E'); px(c, BOOTH.x + 8 + i * 18, BOOTH.y + BOOTH.h - 10, 2, 1, '#FFFFFF'); }
    // (the glass: a sheen)
    c.fillStyle = dith(c, 'rgba(255, 255, 255, 0.16)'); c.beginPath(); c.moveTo(BOOTH.x + 30, BOOTH.y); c.lineTo(BOOTH.x + 70, BOOTH.y); c.lineTo(BOOTH.x + 30, BOOTH.y + BOOTH.h); c.lineTo(BOOTH.x - 10, BOOTH.y + BOOTH.h); c.closePath(); c.fill();
    c.restore();
    if (r.splat) {
      // (the two of them popped: a green burst on the glass over where each sat, drips running down from it)
      for (const sx of [BOOTH.x + 60, BOOTH.x + 160]) {
        c.fillStyle = ALIEN.slimeDark; c.beginPath(); c.ellipse(sx, BOOTH.y + 34, 26, 18, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = ALIEN.slime; c.beginPath(); c.ellipse(sx - 2, BOOTH.y + 32, 18, 12, 0, 0, Math.PI * 2); c.fill();
        for (let i = 0; i < 6; i++) { const a = i * 1.05; box(c, sx + Math.cos(a) * 30 - 3, BOOTH.y + 32 + Math.sin(a) * 20 - 3, 6, 6, ALIEN.slime); }
        for (let i = 0; i < 4; i++) box(c, sx - 16 + i * 10, BOOTH.y + 44, 3, 12 + ((i * 7) % 20), ALIEN.slimeDark);
        box(c, sx - 6, BOOTH.y + 28, 4, 3, ALIEN.slimeLight);
      }
    }
  }
  // The mind-control beam: rings down from the dish to her head (stepped: an outer ring and a hot inner one)
  if (r.beam > 0) {
    const sx = BOOTH.x + BOOTH.w + 33, sy = BOOTH.y + BOOTH.h - 8, n = 10;
    for (let i = 0; i < n; i++) {
      const k = ((i / n) + state.frame * 0.03) % 1, x = sx + (r.head.x - sx) * k, y = sy + (r.head.y - sy) * k;
      c.strokeStyle = `rgba(101, 163, 13, ${(0.7 * r.beam * (1 - k * 0.5)).toFixed(2)})`; c.lineWidth = 4;
      c.beginPath(); c.ellipse(x, y, 8 + k * 14, 14 + k * 20, -0.6, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = `rgba(217, 249, 157, ${(0.85 * r.beam * (1 - k * 0.5)).toFixed(2)})`; c.lineWidth = 1.5; c.stroke();
    }
  }
};

/** In front of her: the glass panel (up), or its frame and the shards left in it (kicked in). */
export const drawGlass = (c: Ctx, state: GameState, up: boolean) => {
  if (!shown(state, GLASS_X - 40, GLASS_X + 40)) return;
  // (the frame: a chrome post, banded round; the header along the top)
  px(c, GLASS_X - 9, GY - 331, 18, 331, '#05050A');
  ['#3F3F46', '#71717A', '#C9CBD3', '#F4F4F5', '#8E8E99', '#52525B'].forEach((col, i) => px(c, GLASS_X - 8 + i * 2.67, GY - 330, 3, 330, col));
  px(c, GLASS_X - 9, GY - 341, 322, 14, '#05050A'); px(c, GLASS_X - 8, GY - 340, 320, 12, '#71717A'); px(c, GLASS_X - 8, GY - 340, 320, 2, '#E4E4E7'); px(c, GLASS_X - 8, GY - 330, 320, 2, '#3F3F46');
  if (up) {
    c.fillStyle = 'rgba(186, 230, 253, 0.14)'; c.fillRect(GLASS_X + 8, GY - 328, 300, 310);
    c.fillStyle = dith(c, 'rgba(224, 242, 254, 0.18)'); c.fillRect(GLASS_X + 8, GY - 328, 300, 310);
    // (the shine: two slanted streaks, stepped)
    for (const [ox, w, a] of [[30, 10, 0.35], [50, 4, 0.3], [180, 6, 0.18]] as const) { c.fillStyle = `rgba(255, 255, 255, ${a})`; c.beginPath(); c.moveTo(GLASS_X + ox + 30, GY - 320); c.lineTo(GLASS_X + ox + 30 + w, GY - 320); c.lineTo(GLASS_X + ox + w, GY - 160); c.lineTo(GLASS_X + ox, GY - 160); c.closePath(); c.fill(); }
    // (a smudge where people pressed their faces to it; the sign on it)
    c.fillStyle = 'rgba(255, 255, 255, 0.08)'; c.beginPath(); c.ellipse(GLASS_X + 110, GY - 150, 16, 12, 0, 0, Math.PI * 2); c.fill();
    print(c, 'DO NOT TAP ON GLASS', GLASS_X + 160, GY - 46, 1, 1, 'rgba(254, 202, 202, 0.85)', { shadow: 'rgba(69, 10, 10, 0.5)' });
  } else {
    // (the shards still in the frame)
    for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(186, 230, 253, 0.4)'; c.beginPath(); c.moveTo(GLASS_X + 8, GY - 320 + i * 60); c.lineTo(GLASS_X + 30 + (i % 2) * 20, GY - 300 + i * 60); c.lineTo(GLASS_X + 8, GY - 280 + i * 60); c.fill(); px(c, GLASS_X + 9, GY - 318 + i * 60, 2, 20, 'rgba(255, 255, 255, 0.6)'); }
    for (let i = 0; i < 10; i++) { px(c, GLASS_X - 120 + i * 26, GY - 3, 6, 3, 'rgba(224, 242, 254, 0.7)'); px(c, GLASS_X - 120 + i * 26, GY - 3, 2, 1, '#FFFFFF'); }
  }
};

/** The room's dark: her spot, the booth, the beam. */
export const roomLights = (r: RoomDraw, queenX: number) => [
  { x: queenX, y: GY - 200, r: 260, a: 0.85, color: 'rgba(167, 139, 250, 0.08)' },
  { x: ARENA_L + 260, y: GY - 120, r: 300, a: 0.55 },
  { x: GLASS_X + 140, y: GY - 10, r: 150, a: 0.5, color: 'rgba(253, 224, 71, 0.1)' },
  ...(r.booth > 0 ? [{ x: BOOTH.x + BOOTH.w / 2, y: BOOTH.y + BOOTH.h / 2, r: 180, a: 0.7 * r.booth, color: 'rgba(74, 222, 128, 0.1)' }] : []),
  ...(r.beam > 0 ? [{ x: r.head.x, y: r.head.y, r: 160, a: 0.8 * r.beam, color: 'rgba(163, 230, 53, 0.14)' }] : []),
];
export { QUEEN_X };

// ---------------------------------------------------------------------------------------------------------------
// After she's gone through the floor: her stand empty (its torn lines hanging, the sac on its dolly), the hole

export const drawAfterFall = (c: Ctx, state: GameState, hole: { a: number; b: number }) => {
  if (!shown(state, hole.a - 100, ARENA_R + 300)) return;
  stamp(c, 'sp-q-afterfall2', hole.a - 20, GY - 260, ARENA_R + 280 - hole.a, 300, g => {
    // (the plinth, the arm bent over, the lines hanging off it torn; the sac, deflated a bit, on its dolly)
    const Q = QUEEN_X;
    px(g, Q - 92, GY - 28, 184, 28, STEELR[0]); px(g, Q - 90, GY - 26, 180, 24, STEELR[2]); px(g, Q - 90, GY - 26, 180, 3, STEELR[3]); px(g, Q - 90, GY - 26, 180, 1, STEELR[4]);
    px(g, Q - 90, GY - 14, 180, 4, STEELR[1]);
    for (let i = 0; i < 30; i++) { g.fillStyle = i % 2 ? '#18181B' : '#FACC15'; g.beginPath(); g.moveTo(Q - 90 + i * 6, GY - 10); g.lineTo(Q - 84 + i * 6, GY - 10); g.lineTo(Q - 87 + i * 6, GY - 4); g.lineTo(Q - 93 + i * 6, GY - 4); g.closePath(); g.fill(); }
    tube(g, Q + 20, GY - 30, Q - 10, GY - 70, 16, STEELR);
    tube(g, Q - 10, GY - 70, Q - 60, GY - 60, 12, CHROME);
    blob(g, Q + 20, GY - 30, 11, 11, CHROME); blob(g, Q - 10, GY - 70, 8, 8, CHROME);
    const lines: Ramp[] = [['#2A0505', '#7F1D1D', '#B91C1C', '#EF4444', '#FCA5A5'], ['#06122E', '#1E3A8A', '#1D4ED8', '#60A5FA', '#BFDBFE'], ['#2E1F02', '#854D0E', '#CA8A04', '#FACC15', '#FEF08A']];
    for (let i = 0; i < 3; i++) hose(g, quad(Q - 60, GY - 60, Q - 80 - i * 10, GY - 30, Q - 90 - i * 14, GY - 6, 6), 3, lines[i]);
    shapeShade(g, () => g.ellipse(Q + 185, GY - 80, 88, 48, -0.05, 0, Math.PI * 2), ['#2A2418', '#6E6650', '#A8A086', '#C8C0A4', '#E8E2CA'], -3, -3, 2, Q + 185, GY - 80);
    for (let i = 0; i < 4; i++) { g.strokeStyle = '#4A4436'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(Q + 120 + i * 40, GY - 118 + Math.abs(i - 1.5) * 6); g.quadraticCurveTo(Q + 130 + i * 40, GY - 80, Q + 122 + i * 40, GY - 40); g.stroke(); }
    // (the hole: the floor gone, the edges broken, the dark down there, rebar out of its edges)
    px(g, hole.a, GY - 2, hole.b - hole.a, 40, '#020204');
    for (let x = hole.a - 10; x < hole.b + 10; x += 12) { const d = (x * 7) % 5; px(g, x, GY - 3 - d, 10, 4, '#3F3F46'); px(g, x, GY - 3 - d, 10, 1, '#8A8A96'); }
    px(g, hole.a - 16, GY - 2, 14, 4, '#71717A'); px(g, hole.b + 2, GY - 2, 14, 4, '#71717A');
    for (const ex of [hole.a, hole.b]) for (let k = 0; k < 2; k++) tube(g, ex, GY + 2 + k * 6, ex + (ex === hole.a ? 14 : -14), GY + 8 + k * 6, 2, ['#1A0A04', '#5A2A10', '#7C2D12', '#B45309', '#F59E0B']);
    void hash; void SACR;
  });
};
