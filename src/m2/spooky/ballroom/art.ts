// The GRAND BALLROOM, painted: a theme park's idea of a vampire's ballroom, rented out for a wedding. Purple flock
// wallpaper, gold-painted plastic pilasters, red velvet swags, a mirror panel, a portrait of somebody's idea of a count;
// the buffet and the cake against the back wall, the DJ's table; plastic chandeliers (stood on), a disco ball, fog
// machines, gold folding chairs, the bandstand's riser; a light-up dance floor. The room's two ends show their near
// sides going back (paint.ts's light fake 3D): the foyer's arch in the left one, the kitchen's swing doors in the right
// one, where the guests run through.
//
// Still things are stamped; the floor's lights, the crystals' glints, the disco ball and its spots, the fog are live.

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import {
  INK, box, text, slab, pole, ball, rampOf, mix, checker, hazeBands, stamp, hash, pixelBlob,
  WALL_D, CEIL, eyeOf, inDepth, at, quad, seg, inked, standTop, wallRun, ceiling, plaque, type Eye, type P,
} from '../control/paint';
import { type Passage, passageBack, passageSide, passageFront, passageLintel } from '../control/passage';
import { rockWall } from '../control/shopArt';
import { drawBallDoors } from '../control/ballDoors';
import { x0, ARENA_L, ARENA_R, ARENA_MID, CIRCLE_X, CHANDELIERS, RISER } from './arena';
import { signAt, haunt, print, candle } from '../letters';
import { bust, drawBust, SKIN, HAIR, CLOTH, IRIS, type BustSpec } from '../../grossBust';

/** Somebody's idea of a count: deathly, a widow's peak slicked back, a high collar, bloodshot, grinning. */
const COUNT: BustSpec = { seed: 777, skin: SKIN.ghoul, hair: 'slick', hairRamp: HAIR.black, iris: IRIS.yellow, sclera: 'red', mouth: 'grin', coat: CLOTH.black, extras: ['ruff', 'mole', 'drool'], tall: 1.1, wide: 0.9, nose: 1.15, bulge: 1.25 };

type Ctx = CanvasRenderingContext2D;

const FLOCK = '#3B0764', GOLD = '#CA8A04', VELVET = '#8E1414';
/** The room's ends at his plane: the left (the gate's line) and the stage's wall. */
const END_L = ARENA_L - 30, END_R = ARENA_R;
/** The doorway he kicked in, at the far left (seen before the fight). */
const DOOR_X = x0 + 30;

// ---------------------------------------------------------------------------------------------------------------
// The back wall (a tile: 200 wide, a pilaster at its left)

const paintWallTile = (g: Ctx, x: number, v: number) => {
  const W = 200, top = CEIL - 260;
  box(g, x, top, W, GY - top, FLOCK);
  // (the damask: a stepped lozenge with a fleur in it, in rows)
  for (let row = 0; row < 16; row++) {
    const y = CEIL + 14 + row * 30;
    if (y > GY - 120) break;
    for (let k = 0; k < 4; k++) {
      const cx = x + 25 + k * 50 + (row % 2) * 25;
      if (cx > x + W - 4) continue;
      box(g, cx - 2, y - 8, 4, 16, '#4C1D95'); box(g, cx - 6, y - 4, 12, 8, '#4C1D95'); box(g, cx - 9, y - 1, 18, 2, '#4C1D95');
      box(g, cx - 1, y - 7, 2, 4, '#5B21B6'); box(g, cx - 5, y - 3, 3, 2, '#5B21B6');
    }
  }
  hazeBands(g, x, CEIL, W, 170, '#0A0310', 0.65, 0, 6);
  // (the wainscot: panels in gold trim; the rail; the skirting)
  box(g, x, GY - 112, W, 112, '#2E1065');
  for (let k = 0; k < 4; k++) { const px = x + 30 + k * 44; box(g, px, GY - 94, 34, 76, '#3B0764'); box(g, px, GY - 94, 34, 1, '#A16207'); box(g, px, GY - 94, 1, 76, '#A16207'); box(g, px, GY - 19, 34, 1, '#1E0A33'); box(g, px + 33, GY - 94, 1, 76, '#1E0A33'); }
  box(g, x, GY - 116, W, 4, '#6B4A14'); box(g, x, GY - 116, W, 1, '#8A6420');
  box(g, x, GY - 12, W, 12, '#1E0A33'); box(g, x, GY - 12, W, 2, '#A16207');
  // (the pilaster: gold-painted plastic, a capital, a base; the paint worn through at the bottom)
  pole(g, x, CEIL, 20, GY - CEIL, '#A6780A');
  slab(g, x - 5, CEIL + 2, 30, 12, '#EAB308', { edge: 2 });
  slab(g, x - 4, GY - 24, 28, 24, '#A16207', { edge: 2 });
  checker(g, x + 4, GY - 60, 12, 30, '#E7E5E4');
  // (a swag of red velvet between the pilasters, gold tassels at its ends)
  const sag = 44;
  inked(g, () => { g.moveTo(x + 18, CEIL + 6); g.quadraticCurveTo(x + W / 2 + 10, CEIL + 6 + sag * 2, x + W + 2, CEIL + 6); g.lineTo(x + W + 2, CEIL + 22); g.quadraticCurveTo(x + W / 2 + 10, CEIL + 22 + sag * 2.2, x + 18, CEIL + 22); g.closePath(); }, VELVET, 2);
  g.strokeStyle = '#5C0A0A'; g.lineWidth = 2;
  for (const k of [0.3, 0.55, 0.8]) { g.beginPath(); g.moveTo(x + 18 + (W - 16) * k, CEIL + 10); g.quadraticCurveTo(x + W / 2 + 10, CEIL + 16 + sag * 1.6 * k, x + 18 + (W - 16) * (1 - k) * 0.4, CEIL + 22 + sag * k); g.stroke(); }
  g.strokeStyle = '#B91C1C'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 22, CEIL + 9); g.quadraticCurveTo(x + W / 2 + 10, CEIL + 9 + sag * 2, x + W, CEIL + 9); g.stroke();
  for (const tx of [x + 22, x + W - 2]) { box(g, tx - 3, CEIL + 20, 6, 6, '#EAB308'); for (let i = 0; i < 4; i++) box(g, tx - 3 + i * 2, CEIL + 26, 1, 16, i % 2 ? '#CA8A04' : '#FDE047'); }
  if (v === 1) {
    // a mirror panel: silver in steps, two streaks of reflection
    const mx = x + 54, my = GY - 330;
    slab(g, mx - 6, my - 6, 104, 196, GOLD, { edge: 3 });
    box(g, mx, my, 92, 184, '#5E6A84'); box(g, mx, my, 92, 50, '#7684A0'); checker(g, mx, my + 50, 92, 2, '#7684A0'); box(g, mx, my + 150, 92, 34, '#4A5470'); checker(g, mx, my + 148, 92, 2, '#4A5470');
    for (let i = 0; i < 2; i++) { g.fillStyle = 'rgba(255, 255, 255, 0.22)'; g.beginPath(); g.moveTo(mx + 14 + i * 22, my); g.lineTo(mx + 26 + i * 22, my); g.lineTo(mx + i * 22, my + 70); g.lineTo(mx, my + 70 - (i ? 0 : 30)); g.closePath(); g.fill(); }
  } else if (v === 2) {
    // a candelabra sconce, plastic, a flame bulb on each arm
    const cx = x + 100, cy = GY - 250;
    slab(g, cx - 6, cy, 12, 36, GOLD, { edge: 1 }); ball(g, cx, cy + 40, 5, GOLD);
    box(g, cx - 26, cy + 6, 52, 3, GOLD); box(g, cx - 27, cy - 4, 3, 12, GOLD); box(g, cx + 24, cy - 4, 3, 12, GOLD);
    for (const dx of [-26, 0, 25]) { box(g, cx + dx - 2, cy - 16 + (dx ? 0 : -6), 5, 12, '#F1EFEA'); box(g, cx + dx - 2, cy - 23 + (dx ? 0 : -6), 5, 7, '#FDE68A'); box(g, cx + dx - 1, cy - 21 + (dx ? 0 : -6), 2, 3, '#FFFFFF'); }
  } else if (v === 3) {
    // a portrait: somebody's idea of a count (pale, a widow's peak, a high collar), in a gilt frame
    const px = x + 60, py = GY - 340;
    slab(g, px - 8, py - 8, 96, 122, GOLD, { edge: 4 });
    box(g, px, py, 80, 106, '#1C0F24'); box(g, px, py, 80, 40, '#2A1635'); checker(g, px, py + 40, 80, 2, '#2A1635');
    // (the count himself: a gross-up in oils (grossBust.ts), fangs in the grin, the varnish cracked)
    drawBust(g, bust('ballroom-count', COUNT, 'oil'), px + 2, py + 2, 76, 104, 150);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Against the back wall: the buffet and the cake (left), the DJ's table (right); wall units at WALL_D

const BUF_X = ARENA_L + 60, DJ_X = ARENA_R - 300;
const paintBuffet = (g: Ctx) => {
  const x = BUF_X;
  // (the table: a white cloth to the floor, a purple runner; chafing dishes; the punch bowl; the cake)
  slab(g, x, GY - 56, 240, 56, '#E7E2D8', { edge: 2 });
  for (let k = 0; k < 240; k += 16) box(g, x + k, GY - 50, 2, 50, '#C9C2B4');
  box(g, x + 60, GY - 56, 30, 56, '#6B21A8'); box(g, x + 60, GY - 56, 30, 2, '#8B5CF6');
  for (let i = 0; i < 2; i++) { const cx = x + 112 + i * 44; slab(g, cx, GY - 70, 36, 14, '#A8A29E', { edge: 2 }); inked(g, () => g.ellipse(cx + 18, GY - 70, 18, 7, 0, Math.PI, 0), '#D6D3D1', 2); box(g, cx + 16, GY - 80, 4, 4, '#71717A'); }
  inked(g, () => g.ellipse(x + 30, GY - 64, 18, 8, 0, 0, Math.PI), '#BAE6FD', 2);
  box(g, x + 14, GY - 66, 32, 3, '#B91C1C'); box(g, x + 18, GY - 70, 2, 8, '#A1A1AA');
  // (the cake: three tiers, piped icing, a little bride and groom on it, him in a cape)
  const cx = x + 214;
  slab(g, cx - 22, GY - 82, 44, 26, '#F8F4EA', { edge: 2 }); slab(g, cx - 16, GY - 102, 32, 20, '#F8F4EA', { edge: 2 }); slab(g, cx - 10, GY - 118, 20, 16, '#F8F4EA', { edge: 2 });
  for (const [y, w] of [[GY - 82, 44], [GY - 102, 32], [GY - 118, 20]] as const) for (let k = 0; k < w; k += 4) box(g, cx - w / 2 + k, y, 2, 2, '#F9A8D4');
  box(g, cx - 6, GY - 132, 4, 14, '#18181B'); box(g, cx - 7, GY - 136, 6, 5, '#E8B48A'); box(g, cx + 2, GY - 132, 5, 14, '#F8FAFC'); box(g, cx + 2, GY - 136, 5, 5, '#E8B48A'); box(g, cx - 9, GY - 131, 3, 12, '#7F1D1D');
};
const paintDJ = (g: Ctx) => {
  const x = DJ_X;
  // (the DJ's folding table, a banner on it; the decks; two speakers on stands)
  slab(g, x, GY - 52, 150, 52, '#18181B', { edge: 2 });
  box(g, x + 14, GY - 46, 122, 20, '#7C3AED'); signAt(g, 'DJ VLAD', x + 75, GY - 32, 8, haunt(8, '#FDE047', '#4C1D95'));
  slab(g, x + 12, GY - 62, 126, 10, '#3F3F46', { edge: 2 });
  for (const dx of [30, 104]) { inked(g, () => g.ellipse(x + dx, GY - 62, 14, 3, 0, 0, Math.PI * 2), '#27272A', 1); box(g, x + dx - 1, GY - 63, 2, 2, '#DC2626'); }
  slab(g, x + 56, GY - 78, 38, 16, '#52525B', { edge: 2 }); box(g, x + 60, GY - 75, 30, 9, '#60A5FA');
  for (const sx of [x - 40, x + 166]) { box(g, sx + 11, GY - 60, 3, 60, '#3F3F46'); box(g, sx + 2, GY - 4, 22, 4, '#27272A'); slab(g, sx, GY - 118, 26, 58, '#1F1F22', { edge: 2 }); ball(g, sx + 13, GY - 100, 8, '#3F3F46'); ball(g, sx + 13, GY - 74, 5, '#3F3F46'); }
};

// ---------------------------------------------------------------------------------------------------------------
// At his plane

/** A gold plastic folding chair (feet at x, GY); or knocked over. */
const paintChair = (g: Ctx, x: number, over: boolean) => {
  if (over) {
    g.save(); g.translate(x, GY - 4); g.rotate(-Math.PI / 2 + 0.1); g.translate(-x, -(GY - 4)); paintChair(g, x, false); g.restore();
    return;
  }
  for (const dx of [-11, 9]) pole(g, x + dx, GY - 34, 3, 34, GOLD);
  pole(g, x - 11, GY - 74, 3, 40, GOLD); pole(g, x + 9, GY - 74, 3, 40, GOLD);
  for (let k = 0; k < 4; k++) box(g, x - 9, GY - 70 + k * 7, 18, 2, '#EAB308');
  slab(g, x - 14, GY - 38, 28, 6, '#F1EFEA', { edge: 2 });
  box(g, x - 13, GY - 38, 26, 1, '#FFFFFF');
};

const paintRiser = (g: Ctx) => {
  const x = RISER.x, top = GY - RISER.h, w = RISER.w;
  // (the bandstand's riser: a pleated skirt; on it, a drum kit with the band's name on the bass drum)
  slab(g, x, top, w, RISER.h, '#7F1D1D', { edge: 2 });
  for (let i = 0; i < w; i += 8) { box(g, x + i, top + 8, 3, RISER.h - 8, '#991B1B'); box(g, x + i + 3, top + 8, 1, RISER.h - 8, '#B91C1C'); }
  standTop(g, x - 2, top, w + 4, '#57534E', '#FBBF24');
  const bx = x + w - 34;
  inked(g, () => g.ellipse(bx, top - 16, 16, 15, 0, 0, Math.PI * 2), '#F8FAFC', 2);
  box(g, bx - 14, top - 22, 28, 10, '#7F1D1D'); signAt(g, 'BATS', bx, top - 14, 6, print(6, '#F8FAFC'));
  box(g, bx - 30, top - 26, 3, 26, '#A1A1AA'); inked(g, () => g.ellipse(bx - 28, top - 28, 10, 2, 0, 0, Math.PI * 2), '#EAB308', 1);
  slab(g, bx - 58, top - 20, 16, 20, '#B91C1C', { edge: 2 });
};

/** A fog machine (live: its puffs), feet at x. */
const fogMachine = (c: Ctx, fx: number, f: number, dir: number) => {
  stamp(c, 'ball-fogger', fx - 2, GY - 26, 46, 28, g => {
    slab(g, fx, GY - 22, 40, 22, '#27272A', { edge: 2 });
    box(g, fx + 4, GY - 18, 8, 4, '#7F1D1D'); box(g, fx + 32, GY - 16, 6, 8, '#18181B');
  });
  box(c, fx + 4, GY - 18, 8, 4, Math.floor(f / 20) % 2 ? '#EF4444' : '#7F1D1D');
  for (let i = 0; i < 4; i++) {
    const u = ((f + i * 40 + fx) % 160) / 160;
    c.globalAlpha = 0.35 * (1 - u);
    pixelBlob(c, fx + 20 + dir * (24 + u * 120), GY - 12 - u * 12, 18 + u * 40, 7 + u * 6, '#E2E8F0');
  }
  c.globalAlpha = 1;
};

/** A plastic chandelier: chains up, a brass ring (stood on: its lip lit), tiers, crystals; the candle bulbs. */
const paintChandelier = (g: Ctx, x: number, top: number, w: number) => {
  const mid = x + w / 2;
  for (const cx of [x + 14, mid, x + w - 14]) for (let y = CEIL; y < top - 2; y += 8) { box(g, cx - 2, y, 4, 5, INK); box(g, cx - 1, y + 1, 2, 3, '#CA8A04'); }
  slab(g, x + 20, top + 14, w - 40, 10, '#A16207', { edge: 2 }); slab(g, x + 40, top + 24, w - 80, 10, '#854D0E', { edge: 2 });
  pole(g, mid - 5, top + 34, 10, 14, GOLD); ball(g, mid, top + 50, 4, '#EAB308');
  for (let i = 0; i < 9; i++) { const cx = x + 10 + i * ((w - 20) / 8), len = 10 + (i % 3) * 5; box(g, cx - 1, top + 14, 2, len, '#BAE6FD'); box(g, cx, top + 14, 1, len, '#E0F2FE'); }
  standTop(g, x, top, w, '#A16207', '#FDE047');
  for (const cx of [x + 4, x + w - 10]) { slab(g, cx, top - 12, 6, 12, '#F1EFEA', { edge: 1 }); }
};

// ---------------------------------------------------------------------------------------------------------------
// The stage's end, going back: the kitchen's swing doors in it (the left end's the way in: a passage, below)

const endWall = (c: Ctx, eye: Eye, X: number, side: -1 | 1, f: number) => {
  if (side < 0 ? eye.x >= X : eye.x <= X) return;
  const p = (y: number, d: number): P => at(eye, X, y, d), top = CEIL - 300;
  const ds = [1, 0.97, 0.94, 0.91, 0.885, WALL_D];
  // (each band on to the back wall, the next over it: no antialiased hairline between them crawling as it scrolls)
  for (let i = 0; i < ds.length - 1; i++) quad(c, mix('#2E1065', INK, i * 0.1), p(top, ds[i]), p(top, WALL_D), p(GY, WALL_D), p(GY, ds[i]));
  quad(c, '#1E0A33', p(GY - 112, 1), p(GY - 112, WALL_D), p(GY, WALL_D), p(GY, 1));
  seg(c, p(GY - 114, 1), p(GY - 114, WALL_D), GOLD, 2);
  seg(c, p(CEIL, 1), p(CEIL, WALL_D), GOLD, 2);
  // (the opening: an arch on the left, swing doors on the right)
  const a = 0.97, b = 0.905;
  quad(c, INK, p(GY - 150, a), p(GY - 150, b), p(GY, b), p(GY, a));
  if (side < 0) {
    quad(c, '#0E0418', p(GY - 146, a), p(GY - 146, b), p(GY, b), p(GY, a));
    quad(c, '#3A2A10', p(GY - 20, a), p(GY - 20, b), p(GY, b), p(GY, a));
  } else {
    const m = (a + b) / 2, swing = Math.sin(f * 0.15) * 0.004;
    quad(c, '#57534E', p(GY - 140, a), p(GY - 140, m + swing), p(GY, m + swing), p(GY, a));
    quad(c, '#4A4744', p(GY - 140, m - swing), p(GY - 140, b), p(GY, b), p(GY, m - swing));
    for (const d of [(a + m) / 2, (m + b) / 2]) { const q = p(GY - 100, d); box(c, q[0] - 2, q[1], 4, 5, '#BAE6FD'); }
    seg(c, p(GY - 140, m), p(GY, m), INK, 1);
  }
  seg(c, p(top, WALL_D), p(GY, WALL_D), INK, 2);
};

// ---------------------------------------------------------------------------------------------------------------
// The room, drawn (world space, behind everything)

export interface BallLook { cleared: boolean; ballDown: boolean }

export const drawBallroomArt = (c: Ctx, state: GameState, look: BallLook) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  const f = state.frame, eye = eyeOf(state);
  const vis = (a: number, z: number) => z > v.x - 100 && a < v.x + v.w + 100;
  const L = x0 - 260, R = ARENA_R + 400;
  box(c, L, CEIL - 900, R - L, 900, '#0A0310');
  wallRun(c, eye, 'ball-wall', L, R, 200, 4, paintWallTile, 'rgba(10, 3, 18, 0.34)');
  ceiling(c, eye, L, R, ['#14061F', '#1A0A28', '#200C30', '#26103A'], 100, '#6B4A10');
  inDepth(c, eye, WALL_D, () => {
    stamp(c, 'ball-buffet', BUF_X - 4, GY - 140, 250, 142, paintBuffet);
    stamp(c, 'ball-dj', DJ_X - 44, GY - 122, 240, 124, paintDJ);
    // (the banner over the floor, between the pilasters)
    c.fillStyle = 'rgba(10, 3, 18, 0.22)'; c.fillRect(BUF_X - 50, GY - 140, DJ_X + 250 - BUF_X, 140);
    plaque(c, ARENA_MID, GY - 420, 'CONGRATULATIONS BRAD & TIFFANY', '#3B0764', '#F9A8D4', 8, GOLD, candle(8, '#3B0764', '#F9A8D4', false));
  });
  // The floor: the parquet in the foyer, the light-up dance floor going back (its tiles going round their colors)
  {
    const [s0, s1] = [Math.max(L, v.x - 200), Math.min(R, v.x + v.w + 200)];
    const rows = 3;
    for (let r = 0; r < rows; r++) {
      const d0 = WALL_D + (1 - WALL_D) * (r / rows), d1 = WALL_D + (1 - WALL_D) * ((r + 1) / rows), k = (rows - 1 - r) * 0.1;
      for (let x = Math.floor(s0 / 50) * 50; x < s1; x += 50) {
        const n = Math.floor(x / 50);
        let col: string;
        if (x < END_L) col = mix(n % 2 ? '#78350F' : '#8A4A1C', INK, k);
        else { const lit = (n + r * 3 + Math.floor(f / 30)) % 5 === 0; col = mix(lit ? ['#F472B6', '#60A5FA', '#FDE047', '#A78BFA'][(n + r) % 4] : (n + r) % 2 ? '#2E1065' : '#4C1D95', INK, k + (lit ? 0.2 : 0)); }
        quad(c, col, at(eye, x, GY, d0), at(eye, x + 50, GY, d0), at(eye, x + 50, GY, d1), at(eye, x, GY, d1));
      }
      box(c, s0, Math.round(eye.y + (GY - eye.y) * d0), s1 - s0, 1, '#1E0A33');
    }
    c.strokeStyle = '#1E0A33'; c.lineWidth = 1; c.beginPath();
    for (let x = Math.floor(s0 / 50) * 50; x < s1; x += 50) { const a = at(eye, x, GY, WALL_D), b = at(eye, x, GY, 1); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
    c.stroke();
    // (the near floor: the same tiles, cut at his plane: banded down)
    for (let x = Math.floor(s0 / 50) * 50; x < s1; x += 50) {
      const n = Math.floor(x / 50), foyer = x < END_L;
      const lit = !foyer && (n + 9 + Math.floor(f / 30)) % 5 === 0;
      const col = foyer ? (n % 2 ? '#78350F' : '#8A4A1C') : lit ? ['#F472B6', '#60A5FA', '#FDE047', '#A78BFA'][(n + 3) % 4] : n % 2 ? '#2E1065' : '#4C1D95';
      const r = rampOf(col);
      box(c, x, GY, 50, 400, r[1]); box(c, x, GY + 14, 50, 400, r[0]); checker(c, x, GY + 12, 50, 2, r[0]);
      box(c, x, GY, 50, 2, r[4]); box(c, x, GY + 2, 50, 2, r[3]); box(c, x + 49, GY, 1, 400, '#14061F');
    }
  }
  // (once it's done: the scorch where the circle opened, in steps)
  if (look.cleared) {
    for (const [rx, d0, d1, col] of [[110, 0.93, 1.0, '#0A0505'], [80, 0.945, 0.99, '#2A0A0A'], [44, 0.955, 0.98, '#3B0A0A']] as const) {
      const pts: P[] = [];
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; pts.push(at(eye, CIRCLE_X + Math.cos(a) * rx * (0.85 + hash(i) * 0.25), GY, (d0 + d1) / 2 + Math.sin(a) * (d1 - d0) / 2)); }
      c.fillStyle = col; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); c.fill();
    }
  }
  // The ends going back (in the fight's view, both show a strip of themselves): the arch, the kitchen's doors
  passageSide(c, eye, END_L, 1, ENTRY, '#2E1065', false);
  endWall(c, eye, END_R, -1, f);
  // The way in: the passage through the far left wall, the doors he kicked in flat on its floor
  if (vis(L, END_L + 100)) drawEntry(c, eye);
  // The stage's wall at the far right: the proscenium, the curtain
  if (vis(END_R, R)) stamp(c, 'ball-stage', END_R, CEIL - 300, R - END_R, GY - CEIL + 302, paintStage);
  if (!vis(ARENA_L - 100, ARENA_R + 100)) return;
  // Fog machines in the corners, puffing
  fogMachine(c, ARENA_L + 20, f, 1);
  fogMachine(c, ARENA_R - 175, f, -1);
  // Gold folding chairs round the edge, one or two over once it's done
  for (let i = 0; i < 4; i++) { const cx = ARENA_L + 90 + i * 150, over = look.cleared && i % 2 === 1; c.save(); c.translate(cx, 0); stamp(c, `ball-chair-${over ? 'o' : 'u'}`, -40, GY - 80, 80, 82, g => paintChair(g, 0, over)); c.restore(); }
  // The bandstand's riser
  stamp(c, 'ball-riser', RISER.x - 64, GY - RISER.h - 36, RISER.w + 70, RISER.h + 38, paintRiser);
  // The chandeliers: the ring stood on, crystals glinting, the bulbs flickering
  for (const ch of CHANDELIERS) {
    const top = GY - ch.h;
    c.save(); c.translate(ch.x, 0);
    stamp(c, 'ball-chandelier', -4, CEIL - 2, ch.w + 8, top - CEIL + 56, g => paintChandelier(g, 0, top, ch.w));
    c.restore();
    for (let i = 0; i < 9; i++) { const cx = ch.x + 10 + i * ((ch.w - 20) / 8), len = 10 + (i % 3) * 5; box(c, cx - 2, top + 14 + len, 4, 4, (i + Math.floor(f / 8)) % 4 ? '#7DD3FC' : '#FFFFFF'); }
    for (const cx of [ch.x + 4, ch.x + ch.w - 10]) { box(c, cx + 1, top - 18 - (Math.floor(f / 6 + cx) % 2), 4, 6, '#FDE047'); box(c, cx + 2, top - 16, 2, 3, '#FFFFFF'); }
  }
  // The disco ball over the middle of the floor (its spots going round the walls); down once it's all over
  if (!look.ballDown) {
    box(c, ARENA_MID - 1, CEIL, 2, GY - 382 - CEIL, '#71717A');
    discoBall(c, ARENA_MID, GY - 366, 16, f);
    for (let i = 0; i < 8; i++) { const a = f * 0.01 + i * 0.8; box(c, ARENA_MID + Math.cos(a) * 340, GY - 250 + Math.sin(a * 1.7) * 140, 4, 4, ['#F472B6', '#60A5FA', '#FDE047', '#FFFFFF'][i % 4]); }
  } else if (look.cleared) discoBall(c, ARENA_MID - 160, GY - 14, 14, 0);
};

/** The disco ball: banded silver, its facets in a grid, some catching the light (they go round). */
export const discoBall = (c: Ctx, x: number, y: number, r: number, f: number, rot = 0) => {
  ball(c, x, y, r, '#A1A1AA');
  // (its facets turned by `rot` (rolling: it turns as it goes), the light on them staying where it is)
  const cs = Math.cos(rot), sn = Math.sin(rot);
  for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
    const ox = i * r * 0.36, oy = j * r * 0.36;
    if (ox * ox + oy * oy > (r * 0.86) ** 2) continue;
    const fx = x + ox * cs - oy * sn, fy = y + ox * sn + oy * cs;
    box(c, Math.round(fx) - 2, Math.round(fy) - 2, 3, 3, (i + j * 3 + Math.floor(f / 5)) % 4 ? '#D4D4D8' : '#FFFFFF');
    box(c, Math.round(fx + cs * 2.5) - 1, Math.round(fy + sn * 2.5) - 1, 1, 1, '#71717A');
  }
};

// The way in, at the far left: the end wall's doorway done as a passage through it (control/passage.ts), the way the
// shop's end has it: over his head its lintel; through it, its back wall (the shop's rock giving way to the flock at
// the doors' frame), the shop's carpet giving way to the foyer's parquet; the doors he kicked in flat on its floor;
// its near jambs sliding past in front of him.
// (its threshold's at the far side of the doors' frame: through the frame, the shop)
const ENTRY: Passage = { A: x0 - 260, B: END_L, H: GY - 204, top: CEIL - 300, dp: 0.935, near: 1.09, split: DOOR_X + 64 };

const paintEntryRear = (g: Ctx) => {
  const { A, B, H, split } = ENTRY;
  rockWall(g, A, split, H, GY, 5);
  box(g, A, H, split - A, GY - H, 'rgba(70, 6, 6, 0.18)');
  box(g, split, H, B - split, GY - H, FLOCK);
  for (let y = H + 10; y < GY - 112; y += 24) for (let x = split + 8 + ((y / 24) % 2) * 12; x < B; x += 24) { box(g, x, y, 4, 6, '#4C1D95'); box(g, x - 2, y + 2, 8, 2, '#4C1D95'); }
  box(g, split, GY - 112, B - split, 112, '#2E1065'); box(g, split, GY - 116, B - split, 4, '#6B4A14');
  box(g, A, H, B - A, 6, 'rgba(0, 0, 0, 0.35)');
};
const paintEntryLintel = (g: Ctx) => {
  const { A, B, H, top } = ENTRY;
  box(g, A, top, B - A, H - top, FLOCK);
  for (let y = CEIL + 14; y < H - 20; y += 30) for (let x = A + 12; x < B; x += 50) box(g, x, y, 4, 10, '#4C1D95');
  hazeBands(g, A, CEIL, B - A, 170, '#0A0310', 0.65, 0, 6);
  slab(g, A, H - 14, B - A, 14, GOLD, { edge: 2 });
  for (let x = A + 6; x < B; x += 10) box(g, x, H - 6, 5, 4, '#854D0E');
};
const drawEntry = (c: Ctx, eye: Eye) => {
  passageBack(c, eye, ENTRY, 'ball-entry-rear', paintEntryRear, '#741A1A', '#8A4A1C', '#2E1065');
  // (the doors he kicked in: torn off, flat on the floor this side of their frame)
  drawBallDoors(c, eye, DOOR_X, { kind: 'down' });
  passageLintel(c, ENTRY, 'ball-entry-lintel', paintEntryLintel);
  box(c, END_L - 1, ENTRY.top, 2, ENTRY.H - ENTRY.top, INK);
};
/** World space, in front of everything: the way in's near jambs and lintel edge (off screen in the fight's view). */
export const drawBallroomFront = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  if (v.x > END_L + 300) return;
  passageFront(c, eyeOf(state), ENTRY, '#7A5A10');
};

const paintStage = (g: Ctx) => {
  const L = END_R, R = ARENA_R + 400, top = CEIL - 300;
  box(g, L, top, R - L, GY - top, '#450A0A');
  for (let x = L; x < R; x += 14) { box(g, x, top, 5, GY - top, '#5C0A0A'); box(g, x + 5, top, 2, GY - top, '#7F1D1D'); }
  slab(g, L, CEIL - 10, R - L, 26, GOLD, { edge: 3 });
  box(g, L, top, 2, GY - top, INK);
};

// ---------------------------------------------------------------------------------------------------------------
// The light: dim and purple; the chandeliers warm, the circle's red once it's open

export const ballroomLighting = (state: GameState, circle: number): SceneLight => {
  const lights: Light[] = [];
  for (const ch of CHANDELIERS) lights.push({ x: ch.x + ch.w / 2, y: GY - ch.h - 10, r: 230, a: 0.75, color: 'rgba(253, 224, 160, 0.07)' });
  lights.push({ x: ARENA_MID, y: GY - 366, r: 120, a: 0.5 });
  if (circle > 0) lights.push({ x: CIRCLE_X, y: GY - 40, r: 160 + 120 * circle, a: 0.8 * circle, color: `rgba(220, 38, 38, ${(0.12 * circle).toFixed(3)})` });
  // (the shop's red through the doorway he kicked in)
  lights.push({ x: DOOR_X + 20, y: GY - 70, r: 140, a: 0.55, color: 'rgba(220, 38, 38, 0.08)' });
  return { dark: 0.3, shade: [18, 4, 30], lights };
};

void CANVAS_HEIGHT; void text;
