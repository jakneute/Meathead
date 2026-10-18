// The woods, crude (the prototype first pass: flat colors, simple shapes, readable silhouettes): REAL woods, not the
// park's. Real trees every one different (pines and the turning hardwoods, their trunks lit down one side), a dirt
// trail, leaf litter, litter-litter (cans, a tire, a mattress, a shopping cart, a busted TV), power lines on wooden
// poles along the trail (a pair of sneakers slung over one span), a real NO TRESPASSING sign nailed to a tree (buckshot
// holes), the scout troop's hand-painted ivy warning, and far behind him the park's back fence: chain-link and barbed
// wire, and over it the BACKS of the park's painted mountains (raw plywood, 2x4 bracing, a stencil), the log ride's lift
// hill. Then the kids' dirt lot: jumps, a ramp, a burnt couch, a fire ring, DIRT RATS sprayed on a boulder.
// No park lettering out here (real-world signs: painted, stenciled, sprayed).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky } from '../../timeOfDay';
import { signText } from '../../signLetters';
import { box, mix, hash, INK, painted, onScreen, type Ctx } from '../kit';
import { groundBox } from '../section';
import { drawTeenPerson, teenOf } from './teens';
import {
  x0, x1, X, GY, SIGN_TREE, POLES, FALLEN, BOULDER, SCOUT_SIGN, LITTER, PILE, COUCH, FIRE, RAMP, TAG_ROCK, MOUNDS, SULK,
  CP_LOT, type Litter,
} from './layout';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT, GROUND = GY;
/** Distance haze toward the sky's color. */
const far = (col: string, k: number) => mix(col, '#9DB4C8', k);

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space)

export const drawWoodsBackdrop = (c: Ctx, state: GameState) => {
  drawTodSky(c, 0, 0, W, H, ['#1E40AF', '#3B82F6', '#7DB8F0', '#BFE0F8', '#E8EEF2', '#F2E6C4'], { horizon: 400, sun: [620, 100], moon: [160, 90] });
  const cam = state.camera.x - x0;
  // (far blue ridges, snow on the high ones: real mountains, no fire in them)
  const ridge = (par: number, base: number, amp: number, col: string, seed: number, snow: boolean) => {
    const off = -((state.camera.x * par) % 600);
    c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
    for (let x = -40; x <= W + 40; x += 20) { const wx = x - off, n = Math.sin(wx * 0.011 + seed) * 0.6 + Math.sin(wx * 0.027 + seed * 2) * 0.3 + Math.sin(wx * 0.071) * 0.1; c.lineTo(x, base - n * amp); }
    c.lineTo(W, H); c.closePath(); c.fill();
    if (snow) { c.fillStyle = far('#EEF2F7', 0.4); for (let x = -40; x <= W + 40; x += 20) { const wx = x - off, n = Math.sin(wx * 0.011 + seed) * 0.6 + Math.sin(wx * 0.027 + seed * 2) * 0.3 + Math.sin(wx * 0.071) * 0.1; if (n > 0.55) c.fillRect(x - 6, base - n * amp, 14, (n - 0.5) * 30); } }
  };
  ridge(0.03, 320, 90, far('#7C8CA8', 0.3), 2.1, true);
  ridge(0.06, 372, 46, far('#5A7A6A', 0.45), 5.3, false);
  // ---- the park, glimpsed behind him (sliding away as he walks on): its back fence on the hill, and over it the backs
  // of its painted mountains (raw plywood, the 2x4s bracing them, a stencil), the log ride's lift hill, a light tower
  const px = 210 - cam * 0.14;
  if (px > -420) {
    const g = 392;
    // (the backs of two mountain flats: unpainted ply, the bracing, PROP 7 stenciled)
    for (const [ox, w, h, n] of [[-250, 230, 120, '7'], [-60, 190, 90, '12']] as const) {
      const bx = px + ox;
      c.fillStyle = far('#B08A5A', 0.35); c.beginPath(); c.moveTo(bx, g); c.lineTo(bx + w * 0.3, g - h); c.lineTo(bx + w * 0.45, g - h * 0.75); c.lineTo(bx + w * 0.7, g - h * 0.95); c.lineTo(bx + w, g); c.closePath(); c.fill();
      c.strokeStyle = far('#7A5A34', 0.35); c.lineWidth = 2;
      for (let k = 0.2; k < 1; k += 0.3) { c.beginPath(); c.moveTo(bx + w * k, g); c.lineTo(bx + w * k, g - h * 0.55); c.stroke(); c.beginPath(); c.moveTo(bx + w * k, g - h * 0.5); c.lineTo(bx + w * (k + 0.18), g); c.stroke(); }
      signText(c, `PROP ${n}`, bx + w * 0.5, g - 18, painted(1, far('#3F2A14', 0.3), far('#B08A5A', 0.35)));
    }
    // (the log ride's lift hill: a timber trestle slope, the flume on it)
    c.strokeStyle = far('#6B4A2A', 0.4); c.lineWidth = 2;
    for (let k = 0; k < 8; k++) { const lx = px + 150 + k * 14; c.beginPath(); c.moveTo(lx, g); c.lineTo(lx, g - 20 - k * 9); c.stroke(); }
    c.lineWidth = 5; c.beginPath(); c.moveTo(px + 140, g - 14); c.lineTo(px + 262, g - 88); c.stroke();
    // (a light tower)
    c.lineWidth = 2; c.beginPath(); c.moveTo(px + 300, g); c.lineTo(px + 300, g - 110); c.stroke(); box(c, px + 290, g - 118, 22, 8, far('#52525B', 0.4));
    // (the back fence: chain-link along the hill, barbed wire on top, a gap torn in it)
    c.strokeStyle = far('#8A949E', 0.3); c.lineWidth = 1;
    for (let fx = px - 320; fx < px + 360; fx += 6) { if (fx > px + 60 && fx < px + 90) continue; c.beginPath(); c.moveTo(fx, g); c.lineTo(fx + 6, g - 16); c.stroke(); c.beginPath(); c.moveTo(fx + 6, g); c.lineTo(fx, g - 16); c.stroke(); }
    for (let fx = px - 320; fx < px + 360; fx += 60) box(c, fx, g - 20, 2, 20, far('#6B7280', 0.3));
    c.beginPath(); for (let fx = px - 320; fx < px + 360; fx += 8) c.lineTo(fx, g - 21 - ((fx / 8) % 2)); c.stroke();
  }
  // ---- the near hills: a wall of real pines, every one different
  const off = -((state.camera.x * 0.18) % 44);
  for (let i = -1; i < W / 44 + 2; i++) {
    const x = off + i * 44, wx = Math.floor((state.camera.x * 0.18) / 44) + i, h = 56 + hash(wx) * 56, y = 446 - hash(wx + 7) * 18;
    c.fillStyle = far('#2E4A30', 0.25); c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + 22 + hash(wx + 3) * 8, y); c.lineTo(x - 22 - hash(wx + 5) * 8, y); c.closePath(); c.fill();
  }
  box(c, 0, 440, W, H - 440, far('#24382A', 0.2));
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The world, behind the cast

/** Every `step` px along rx a..b that's on screen. */
const along = (state: GameState, a: number, b: number, step: number, fn: (rx: number) => void) => {
  const lo = Math.max(a, Math.floor((state.camera.x - 200 - x0) / step) * step), hi = Math.min(b, state.camera.x + W + 200 - x0);
  for (let rx = lo; rx <= hi; rx += step) fn(rx);
};

/** A real pine (layered, ragged, dark), its foot at (x, feet), `h` tall. */
const pine = (c: Ctx, x: number, feet: number, h: number, seed: number, dim = 0) => {
  const g = mix(hash(seed) > 0.5 ? '#1F4A2A' : '#2A5530', '#2A3A40', dim), gl = mix(g, '#7DB87A', 0.18);
  box(c, x - 4, feet - h * 0.3, 8, h * 0.3, mix('#4A3420', '#2A3A40', dim));
  for (let k = 0; k < 4; k++) {
    const ty = feet - h + k * h * 0.2, w = h * (0.14 + k * 0.07) * (0.85 + hash(seed + k) * 0.3);
    c.fillStyle = mix(INK, '#2A3A40', dim); c.beginPath(); c.moveTo(x, ty - 2); c.lineTo(x + w + 2, ty + h * 0.32); c.lineTo(x - w - 2, ty + h * 0.32); c.closePath(); c.fill();
    c.fillStyle = g; c.beginPath(); c.moveTo(x, ty); c.lineTo(x + w, ty + h * 0.3); c.lineTo(x - w, ty + h * 0.3); c.closePath(); c.fill();
    c.fillStyle = gl; c.beginPath(); c.moveTo(x, ty); c.lineTo(x - w * 0.2, ty + h * 0.3); c.lineTo(x - w, ty + h * 0.3); c.closePath(); c.fill();
  }
};
/** A real hardwood, turning (green, yellow, orange, red by its seed), its trunk lit down one side. */
const hardwood = (c: Ctx, x: number, feet: number, h: number, seed: number, dim = 0) => {
  const leaf = mix(['#4D7C0F', '#CA8A04', '#D97706', '#B45309', '#9A3412'][Math.floor(hash(seed) * 5)], '#2A3A40', dim);
  const trunk = mix('#5A4630', '#2A3A40', dim);
  box(c, x - 6, feet - h * 0.55, 12, h * 0.55, mix(INK, '#2A3A40', dim)); box(c, x - 5, feet - h * 0.55, 10, h * 0.55, trunk); box(c, x - 5, feet - h * 0.55, 3, h * 0.55, mix(trunk, '#FFFFFF', 0.15));
  c.strokeStyle = trunk; c.lineWidth = 4; c.beginPath(); c.moveTo(x, feet - h * 0.5); c.lineTo(x - h * 0.18, feet - h * 0.72); c.moveTo(x, feet - h * 0.45); c.lineTo(x + h * 0.2, feet - h * 0.7); c.stroke();
  for (const [dx, dy, r] of [[0, -0.78, 0.26], [-0.2, -0.7, 0.2], [0.22, -0.68, 0.2], [0.05, -0.92, 0.18]] as const) {
    c.fillStyle = mix(INK, '#2A3A40', dim); c.beginPath(); c.arc(x + dx * h, feet + dy * h, r * h + 2, 0, Math.PI * 2); c.fill();
  }
  for (const [dx, dy, r] of [[0, -0.78, 0.26], [-0.2, -0.7, 0.2], [0.22, -0.68, 0.2], [0.05, -0.92, 0.18]] as const) {
    c.fillStyle = leaf; c.beginPath(); c.arc(x + dx * h, feet + dy * h, r * h, 0, Math.PI * 2); c.fill();
    c.fillStyle = mix(leaf, '#FFFFFF', 0.18); c.beginPath(); c.arc(x + dx * h - r * h * 0.3, feet + dy * h - r * h * 0.3, r * h * 0.45, 0, Math.PI * 2); c.fill();
  }
};

/** Behind the lanes: the woods' back rank of trees, the far side of the trail. */
export const drawWoodsBack = (c: Ctx, state: GameState) => {
  // ---- the back rank: real trees, every one different (dimmer, further)
  along(state, -200, 3200, 70, rx => {
    if (rx > CP_LOT + 300 && rx < 3000 && hash(rx + 2) < 0.5) return;
    const x = X(rx) + (hash(rx) - 0.5) * 30, h = 150 + hash(rx + 1) * 110;
    if (hash(rx + 3) > 0.45) pine(c, x, GY - 52, h, rx, 0.35); else hardwood(c, x, GY - 52, h * 0.8, rx, 0.35);
  });
  // ---- the ground: the far side of the trail (leaf litter), the lot's open dirt; then the trail itself
  box(c, x0 - 200, GY - 56, x1 - x0 + 400, 60, '#5A4A2A');
  box(c, x0 - 200, GY - 56, x1 - x0 + 400, 3, '#7A8A3A');
  box(c, X(CP_LOT) + 40, GY - 52, x1 - X(CP_LOT) + 160, 56, '#8A6A40');
  along(state, -200, 3200, 23, rx => { const h = hash(rx * 3); if (h > 0.4) { c.fillStyle = ['#B45309', '#92400E', '#CA8A04', '#7C2D12'][Math.floor(h * 10) % 4]; c.fillRect(X(rx), GY - 50 + h * 44, 4, 2); } });
  // ---- the lot's dirt jumps (its back lane), tire ruts
  for (const m of MOUNDS) if (onScreen(state, X(m) - 60, X(m) + 60)) {
    c.fillStyle = INK; c.beginPath(); c.moveTo(X(m) - 52, GY - 26); c.quadraticCurveTo(X(m), GY - 64, X(m) + 40, GY - 26); c.closePath(); c.fill();
    c.fillStyle = '#9A7448'; c.beginPath(); c.moveTo(X(m) - 50, GY - 26); c.quadraticCurveTo(X(m), GY - 61, X(m) + 38, GY - 26); c.closePath(); c.fill();
    c.fillStyle = '#B08A5A'; c.beginPath(); c.moveTo(X(m) - 30, GY - 34); c.quadraticCurveTo(X(m) - 8, GY - 50, X(m) + 4, GY - 44); c.lineTo(X(m) - 16, GY - 34); c.closePath(); c.fill();
  }
  along(state, CP_LOT, 3000, 40, rx => { box(c, X(rx), GY - 30 + (rx % 80 === 0 ? 2 : 0), 30, 2, '#6B4A2A'); box(c, X(rx) + 10, GY - 12, 26, 2, '#6B4A2A'); });
  // ---- the power lines: wooden poles, crossarms, glass insulators, two wires sagging between each pair
  for (let i = 0; i < POLES.length; i++) {
    const a = X(POLES[i]);
    if (onScreen(state, a - 30, a + 30)) {
      box(c, a - 4, GY - 300, 8, 250, INK); box(c, a - 3, GY - 300, 6, 250, '#6B5034'); box(c, a - 3, GY - 300, 2, 250, '#8A6A48');
      box(c, a - 30, GY - 290, 60, 6, INK); box(c, a - 29, GY - 289, 58, 4, '#7A5C3C');
      for (const dx of [-24, 22]) { box(c, dx + a - 1, GY - 296, 4, 6, '#7DD3C0'); }
      for (let k = 0; k < 6; k++) box(c, a - 3, GY - 220 + k * 22, 6, 1, '#4A3420');
    }
    if (i + 1 < POLES.length) {
      const b = X(POLES[i + 1]);
      if (onScreen(state, a, b)) {
        c.strokeStyle = '#18181B'; c.lineWidth = 1.2;
        for (const dx of [-23, 23]) { c.beginPath(); c.moveTo(a + dx, GY - 295); c.quadraticCurveTo((a + b) / 2, GY - 250, b + dx, GY - 295); c.stroke(); }
        // (the sneakers slung over the second span by their laces)
        if (i === 1) {
          const sx = (a + b) / 2 + 20, sy = GY - 272;
          c.beginPath(); c.moveTo(sx - 6, sy - 1); c.lineTo(sx - 8, sy + 16); c.moveTo(sx + 6, sy - 1); c.lineTo(sx + 8, sy + 12); c.stroke();
          for (const [dx, dy] of [[-8, 16], [8, 12]] as const) { box(c, sx + dx - 6, sy + dy, 12, 6, INK); box(c, sx + dx - 5, sy + dy + 1, 10, 4, '#F8FAFC'); box(c, sx + dx - 5, sy + dy + 4, 10, 1, '#DC2626'); }
        }
      }
    }
  }
  // ---- the trees by the trail (nearer: brighter), the NO TRESPASSING tree among them
  along(state, -200, 3200, 160, rx => {
    if (rx > CP_LOT - 40 && rx < 2950) return;
    const x = X(rx) + (hash(rx + 9) - 0.5) * 50, h = 190 + hash(rx + 4) * 90;
    if (Math.abs(rx - SIGN_TREE) < 90) return;
    if (hash(rx + 5) > 0.5) pine(c, x, GY - 30, h, rx + 50); else hardwood(c, x, GY - 30, h * 0.85, rx + 50);
  });
  if (onScreen(state, X(SIGN_TREE) - 80, X(SIGN_TREE) + 80)) noTrespassing(c, X(SIGN_TREE));
  // ---- the trail: dirt, its ruts, the grass and leaves at its edges
  groundBox(c, x0 - 200, x1 + 200, GY, '#5A4028', '#6B8A3A');
  box(c, x0 - 200, GY + 4, x1 - x0 + 400, 6, '#4A3420');
  along(state, -200, 3200, 31, rx => { const h = hash(rx); box(c, X(rx), GY + 14 + h * 30, 10 + h * 10, 2, '#3F2E1C'); if (h > 0.7) box(c, X(rx) + 4, GY - 3, 3, 4, '#7A9A4A'); });
  // ---- the set dressing
  for (const [rx, what] of LITTER) if (onScreen(state, X(rx) - 40, X(rx) + 40)) litter(c, X(rx), what);
  if (onScreen(state, X(SCOUT_SIGN) - 60, X(SCOUT_SIGN) + 60)) scoutSign(c, X(SCOUT_SIGN));
  if (onScreen(state, X(FALLEN[0]) - 40, X(FALLEN[1]) + 40)) fallenTree(c);
  if (onScreen(state, X(BOULDER[0]) - 20, X(BOULDER[1]) + 20)) boulder(c, X(BOULDER[0]), X(BOULDER[1]), GY - BOULDER[2], false);
  c.globalAlpha = 0.8;
  if (onScreen(state, X(RAMP) - 60, X(RAMP) + 60)) ramp(c, X(RAMP));
  if (onScreen(state, X(COUCH) - 60, X(COUCH) + 60)) couch(c, X(COUCH));
  c.globalAlpha = 1;
  if (onScreen(state, X(FIRE) - 40, X(FIRE) + 40)) fireRing(c, X(FIRE));
  if (onScreen(state, X(TAG_ROCK) - 60, X(TAG_ROCK) + 60)) tagRock(c, X(TAG_ROCK));
};

/** The leaf pile by the trail: whole (shivering, now and then), or burst (scattered flat). */
export const drawPile = (c: Ctx, state: GameState, burst: boolean, shiver: number) => {
  const x = X(PILE);
  if (!onScreen(state, x - 80, x + 80)) return;
  const sh = shiver > 0 ? Math.sin(shiver * 1.6) * 2 : 0;
  if (burst) {
    for (let i = 0; i < 16; i++) { c.fillStyle = ['#B45309', '#D97706', '#92400E', '#CA8A04'][i % 4]; c.beginPath(); c.ellipse(x - 70 + i * 9 + hash(i) * 6, GY - 2 + hash(i + 2) * 3, 5, 2, hash(i + 5) - 0.5, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#3F2E1C'; c.beginPath(); c.ellipse(x, GY + 1, 26, 4, 0, 0, Math.PI * 2); c.fill();
    return;
  }
  c.fillStyle = INK; c.beginPath(); c.ellipse(x + sh, GY - 16, 52, 22, 0, Math.PI, 0); c.closePath(); c.fill();
  c.fillStyle = '#B45309'; c.beginPath(); c.ellipse(x + sh, GY - 15, 50, 20, 0, Math.PI, 0); c.closePath(); c.fill();
  for (let i = 0; i < 26; i++) {
    const a = Math.PI + (i / 26) * Math.PI, r = 0.5 + hash(i + 11) * 0.48;
    c.fillStyle = ['#D97706', '#92400E', '#CA8A04', '#7C2D12', '#EA580C'][i % 5];
    c.beginPath(); c.ellipse(x + sh + Math.cos(a) * 46 * r, GY - 15 + Math.sin(a) * 18 * r, 5, 2.4, hash(i) * 3, 0, Math.PI * 2); c.fill();
  }
  box(c, x - 52, GY - 16, 104, 16, '#92400E');
};

/** After the bounty: the kid he kicked off his bike, sulking on a stump by the trail. */
export const drawSulk = (c: Ctx, state: GameState, seed: number, talking: boolean) => {
  const x = X(SULK);
  if (!onScreen(state, x - 60, x + 60)) return;
  box(c, x - 16, GY - 18, 32, 18, INK); box(c, x - 15, GY - 17, 30, 17, '#6B4423'); box(c, x - 15, GY - 17, 30, 3, '#A0703C');
  c.save(); c.translate(x, GY - 16);
  const p = state.player, facing = p.pos.x + p.width / 2 < x ? -1 : 1;
  c.scale(facing, 1);
  drawTeenPerson(c, teenOf(seed), state.frame, 'sit', 'angry', talking);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The props

/** A real NO TRESPASSING sign nailed to a real trunk: orange, black letters, buckshot through it. */
const noTrespassing = (c: Ctx, x: number) => {
  // (the trunk, up out of frame)
  box(c, x - 13, GY - 420, 26, 420, INK); box(c, x - 12, GY - 420, 24, 420, '#5A4630'); box(c, x - 12, GY - 420, 6, 420, '#7A6448');
  for (let k = 0; k < 14; k++) box(c, x - 10 + (k % 3) * 7, GY - 400 + k * 28, 3, 10, '#3F3020');
  const top = GY - 150, w = 96, h = 54;
  box(c, x - w / 2 - 1, top - 1, w + 2, h + 2, INK); box(c, x - w / 2, top, w, h, '#F97316');
  box(c, x - w / 2 + 3, top + 3, w - 6, h - 6, '#FB923C');
  signText(c, 'NO', x, top + 16, painted(2, '#111111', '#FB923C'));
  signText(c, 'TRESPASSING', x, top + 30, painted(1, '#111111', '#FB923C'));
  signText(c, 'VIOLATORS WILL BE', x, top + 41, painted(1, '#111111', '#FB923C'));
  signText(c, 'PROSECUTED', x, top + 50, painted(1, '#111111', '#FB923C'));
  // (the nails; the buckshot holes, rusting)
  for (const [nx, ny] of [[-44, 3], [42, 3], [-44, 49], [42, 49]] as const) box(c, x + nx, top + ny, 2, 2, '#52525B');
  for (const [hx, hy] of [[-30, 10], [-26, 16], [-20, 9], [18, 44], [24, 40], [30, 46], [8, 12]] as const) { box(c, x + hx, top + hy, 2, 2, INK); box(c, x + hx + 1, top + hy + 2, 1, 3, '#9A3412'); }
};

/** The scout troop's warning: a plank on a stake, hand-painted, a drawing of the three leaves. */
const scoutSign = (c: Ctx, x: number) => {
  const top = GY - 76, w = 104, h = 34;
  box(c, x - 3, top, 6, 76, INK); box(c, x - 2, top, 4, 76, '#7A5A38');
  box(c, x - w / 2 - 1, top - 1, w + 2, h + 2, INK); box(c, x - w / 2, top, w, h, '#8A6A40'); box(c, x - w / 2, top, w, 2, '#A88A5A');
  signText(c, 'LEAVES OF THREE', x + 8, top + 13, painted(1, '#F8FAFC', '#3F2A14'));
  signText(c, 'LET IT BE!', x + 8, top + 26, painted(1, '#F8FAFC', '#3F2A14'));
  for (const [dx, dy] of [[-4, 0], [4, 0], [0, -6]] as const) { c.fillStyle = '#4D7C0F'; c.beginPath(); c.ellipse(x - 40 + dx, top + 20 + dy, 4, 3, 0, 0, Math.PI * 2); c.fill(); }
  signText(c, 'TROOP 41', x + 30, top + h + 9, painted(1, '#F8FAFC', '#3F2A14'));
};

/** The fallen tree over the trail (standable: its lit top). */
const fallenTree = (c: Ctx) => {
  const [a, b, h] = FALLEN, xa = X(a), xb = X(b), top = GY - h;
  box(c, xa - 1, top - 1, xb - xa + 2, h + 1, INK); box(c, xa, top, xb - xa, h, '#5A4630');
  box(c, xa, top, xb - xa, 3, '#A88A5A');
  for (let k = 0; k < 6; k++) box(c, xa + 6 + k * 16, top + 7 + (k % 2) * 6, 10, 2, '#3F3020');
  // (its broken end: the rings; its roots the other side)
  c.fillStyle = INK; c.beginPath(); c.ellipse(xb, top + h / 2, 7, h / 2 + 1, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#C8A070'; c.beginPath(); c.ellipse(xb, top + h / 2, 6, h / 2, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#8A6A40'; c.lineWidth = 1; c.beginPath(); c.ellipse(xb, top + h / 2, 3, h / 4, 0, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = '#3F3020'; c.lineWidth = 3; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(xa, top + 4 + k * 5); c.lineTo(xa - 14 - (k % 2) * 6, top - 6 + k * 9); c.stroke(); }
};

/** A boulder (standable: its lit top). */
export const boulder = (c: Ctx, xa: number, xb: number, top: number, tagged: boolean, GY = GROUND) => {
  c.fillStyle = INK; c.beginPath(); c.moveTo(xa - 2, GY); c.lineTo(xa + 4, top + 6); c.quadraticCurveTo((xa + xb) / 2, top - 4, xb - 4, top + 4); c.lineTo(xb + 2, GY); c.closePath(); c.fill();
  c.fillStyle = '#7A766E'; c.beginPath(); c.moveTo(xa, GY); c.lineTo(xa + 5, top + 7); c.quadraticCurveTo((xa + xb) / 2, top - 2, xb - 5, top + 5); c.lineTo(xb, GY); c.closePath(); c.fill();
  c.fillStyle = '#A8A49A'; c.beginPath(); c.moveTo(xa + 5, top + 7); c.quadraticCurveTo((xa + xb) / 2, top - 2, xb - 5, top + 5); c.lineTo(xb - 6, top + 9); c.quadraticCurveTo((xa + xb) / 2, top + 3, xa + 6, top + 11); c.closePath(); c.fill();
  box(c, xa + 10, top + 20, 14, 8, '#5E7A3A');
  if (tagged) {
    signText(c, 'DIRT', (xa + xb) / 2, top + 30, painted(2, '#EC4899', '#3F3F46'));
    signText(c, 'RATS', (xa + xb) / 2, top + 48, painted(2, '#22D3EE', '#3F3F46'));
  }
};

const ramp = (c: Ctx, x: number) => {
  // (plywood on cinder blocks, in the lot's back lane)
  const g = GY - 26;
  for (const dx of [10, 26]) { box(c, x + dx, g - 16, 14, 16, INK); box(c, x + dx + 1, g - 15, 12, 14, '#9CA3AF'); box(c, x + dx + 4, g - 11, 6, 6, '#6B7280'); }
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 50, g); c.lineTo(x + 42, g - 20); c.lineTo(x + 42, g - 16); c.lineTo(x - 50, g + 3); c.closePath(); c.fill();
  c.fillStyle = '#C8A070'; c.beginPath(); c.moveTo(x - 48, g); c.lineTo(x + 40, g - 19); c.lineTo(x + 40, g - 16.5); c.lineTo(x - 48, g + 1.5); c.closePath(); c.fill();
};
const couch = (c: Ctx, x: number) => {
  // (burnt out: black and rust, the springs showing; in the back lane)
  const g = GY - 30;
  box(c, x - 40, g - 30, 80, 30, INK); box(c, x - 38, g - 28, 76, 26, '#3F3A34'); box(c, x - 38, g - 40, 76, 14, INK); box(c, x - 36, g - 38, 72, 10, '#57504A');
  box(c, x - 46, g - 34, 10, 34, INK); box(c, x + 36, g - 34, 10, 34, INK);
  c.strokeStyle = '#A1A1AA'; c.lineWidth = 1; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(x - 24 + k * 12, g - 26, 3, 0, Math.PI * 2); c.stroke(); }
  box(c, x - 30, g - 20, 22, 6, '#7C2D12');
};
const fireRing = (c: Ctx, x: number) => {
  const g = GY - 20;
  for (let k = 0; k < 7; k++) { c.fillStyle = k % 2 ? '#78716C' : '#A8A29E'; c.beginPath(); c.ellipse(x - 24 + k * 8, g, 6, 4, 0, 0, Math.PI * 2); c.fill(); }
  box(c, x - 14, g - 6, 28, 4, '#1C1917'); box(c, x - 10, g - 9, 4, 4, '#44403C'); box(c, x + 4, g - 8, 6, 3, '#44403C');
  for (let k = 0; k < 4; k++) can(c, x - 30 + k * 18 + (k % 2) * 4, g + 6, k % 3 === 0 ? '#DC2626' : '#E5E7EB', k % 2 === 1);
};
/** (the back lane's props: dimmed a touch, so nothing behind the trail reads as something to stand on) */
const tagRock = (c: Ctx, x: number) => { c.globalAlpha = 0.8; boulder(c, x - 60, x + 60, GY - 104, true, GY - 34); c.globalAlpha = 1; };

const can = (c: Ctx, x: number, y: number, col: string, down: boolean) => {
  if (down) { box(c, x - 5, y - 4, 10, 5, INK); box(c, x - 4, y - 3, 8, 3, col); box(c, x + 3, y - 3, 1, 3, '#A1A1AA'); }
  else { box(c, x - 3, y - 9, 6, 9, INK); box(c, x - 2, y - 8, 4, 7, col); box(c, x - 2, y - 8, 4, 1, '#D4D4D8'); }
};
const litter = (c: Ctx, x: number, what: Litter) => {
  const g = GY;
  switch (what) {
    case 'can': can(c, x, g, '#DC2626', true); return;
    case 'cans': can(c, x - 8, g, '#E5E7EB', false); can(c, x, g, '#DC2626', true); can(c, x + 9, g, '#1D4ED8', true); return;
    case 'bottle': box(c, x - 7, g - 3, 14, 4, INK); box(c, x - 6, g - 2, 10, 2, '#15803D'); box(c, x + 4, g - 2, 3, 1, '#15803D'); return;
    case 'bag': box(c, x - 8, g - 6, 16, 7, INK); box(c, x - 7, g - 5, 14, 5, '#FACC15'); box(c, x - 4, g - 4, 6, 2, '#DC2626'); return;
    case 'tire':
      c.fillStyle = INK; c.beginPath(); c.ellipse(x, g - 8, 18, 9, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#27272A'; c.beginPath(); c.ellipse(x, g - 8, 16, 7, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#5A4028'; c.beginPath(); c.ellipse(x, g - 8, 8, 3, 0, 0, Math.PI * 2); c.fill();
      return;
    case 'mattress':
      // (dumped in the leaves on the far side, stained)
      box(c, x - 40, g - 38, 80, 12, INK); box(c, x - 39, g - 37, 78, 10, '#E7E0CF');
      for (let k = 0; k < 5; k++) box(c, x - 34 + k * 16, g - 35, 2, 6, '#C8BFA8');
      c.fillStyle = '#A16207'; c.beginPath(); c.ellipse(x + 6, g - 32, 12, 3, 0, 0, Math.PI * 2); c.fill();
      return;
    case 'cart':
      // (a shopping cart on its side)
      c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(x - 22, g - 26, 40, 20); c.strokeStyle = '#A1A1AA'; c.lineWidth = 1.5; c.strokeRect(x - 22, g - 26, 40, 20);
      for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(x - 22 + k * 8, g - 26); c.lineTo(x - 22 + k * 8, g - 6); c.stroke(); }
      c.fillStyle = INK; for (const wx of [x - 18, x + 14]) { c.beginPath(); c.arc(wx, g - 3, 3, 0, Math.PI * 2); c.fill(); }
      return;
    case 'tv':
      box(c, x - 22, g - 46, 44, 34, INK); box(c, x - 20, g - 44, 40, 30, '#78716C'); box(c, x - 16, g - 40, 26, 22, '#1F2937');
      c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 10, g - 38); c.lineTo(x - 2, g - 28); c.lineTo(x + 6, g - 36); c.stroke();
      box(c, x + 12, g - 38, 4, 4, '#A8A29E'); box(c, x + 12, g - 30, 4, 4, '#A8A29E');
      return;
  }
};

/** In front of him: a near trunk or two (never over the lot, the signs or the hazards). */
export const drawWoodsFront = (c: Ctx, state: GameState) => {
  for (const rx of [40, 470, 1000]) {
    const x = X(rx) - 30;
    if (!onScreen(state, x - 30, x + 30)) continue;
    box(c, x - 15, GY - 600, 30, 640, '#1A140C'); box(c, x - 14, GY - 600, 8, 640, '#2E2416');
  }
};
