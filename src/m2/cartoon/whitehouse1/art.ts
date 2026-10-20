// CHELSEA AND SOCKS' WACKY WHITE HOUSE, part one, painted (crude-but-clean first pass): the show's White House the way a
// Saturday morning cartoon draws it. Flat bright colors in a couple of steps, a fat black line round everything, nothing
// quite straight (walls bulge, columns wobble, frames lean). The rooms cut away along their backs as sets, every wall,
// floor and ceiling drawn to the one eye (the middle of the screen; back to front, nothing deeper over anything
// nearer), culled by where they land on screen. Above each room's ceiling and under the second floor's floor: the
// house's own fill (no sky showing through).
//
// In the play plane, bright and inked, everything he stands on lit along its top: the Steinway, the chair stack and the
// risers, the podium, the sideboard and the banquet table, the Grand Staircase's treads, the second floor's edge, the
// Lincoln bed, the arbor and the bench; scenery that might look standable (the bed's headboard, the drapes' pelmets,
// the dining chairs' backs) is drawn back on the wall, dimmed. Each room has its placard (a gilt easel, the show's fat
// letters), the entrance its title banner hung off the ceiling. Outdoors (the balcony, the garden), the sky by the hour
// and the house's South Portico behind; the West Colonnade at the far end, its sign TO THE WEST WING.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText, signW } from '../../signLetters';
import { box, mix, hash, toonLetters, toonSign, toonSky, wobblePath, onScreen, INK, stamp, type Ctx } from '../kit';
import { GY } from '../geometry';
import { whOf } from './state';
import { chandelierAt, vacBox, sprinklerAt, BALL_R, SPRAY_H, SPRAY_W, ROSE_H } from './hazards';
import {
  ROOMS, D_BACK, F2, CEIL1, PIANO, CHAIRS, RISER, PODIUM, SIDEBOARD, TABLE, BED, BENCH, ARBOR, STAIRS, BALCONY_EDGE, WAX,
  CHANDELIER, BALL_RETURN, BALL_GRATE, ROSES, SPRINKLERS, PEROT_ARENA, FALWELL_ARENA, X, Y, type Room,
} from './layout';

// ---------------------------------------------------------------------------------------------------------------
// The eye

type P = { x: number; y: number };
const eyeOf = (state: GameState): P => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 });
const proj = (E: P, x: number, y: number, s: number): P => ({ x: E.x + (x - E.x) * s, y: E.y + (y - E.y) * s });
const atDepth = (c: Ctx, E: P, s: number, fn: () => void) => { c.save(); c.translate(E.x, E.y); c.scale(s, s); c.translate(-E.x, -E.y); fn(); c.restore(); };
const seen = (state: GameState, E: P, x0: number, x1: number, s: number, m = 40) => { const a = proj(E, x0, 0, s).x, b = proj(E, x1, 0, s).x; return b > state.camera.x - m && a < state.camera.x + CANVAS_WIDTH + m; };
const quad = (c: Ctx, pts: P[], fill: string, line = 0) => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) c.lineTo(p.x, p.y); c.closePath(); c.fillStyle = fill; c.fill(); if (line) { c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke(); } };
const inked = (c: Ctx, path: () => void, fill: string, w = 3) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = w; c.stroke(); };
const dim = (col: string) => mix(col, '#8E86B4', 0.28);

// ---------------------------------------------------------------------------------------------------------------
// The rooms' looks

interface Look { wall: string; trim: string; floor: string; floor2?: string; ceil: string; paper?: 'stripe' | 'dots' | 'fleur' | 'none' }
const LOOK: Record<string, Look> = {
  entrance: { wall: '#FFF1D6', trim: '#E2B33C', floor: '#F5F0E6', floor2: '#2B2B3A', ceil: '#F7E7C4', paper: 'none' },
  crosshall: { wall: '#FFEBC7', trim: '#D9A53A', floor: '#C81E3C', ceil: '#F7E2B8', paper: 'stripe' },
  eastroom: { wall: '#FFF7E6', trim: '#E6B740', floor: '#C98A4B', floor2: '#B57438', ceil: '#FFF0CF', paper: 'none' },
  press: { wall: '#2D4EA8', trim: '#E2B33C', floor: '#3B4C8C', ceil: '#E9E4D8', paper: 'none' },
  dining: { wall: '#F5E6B8', trim: '#C8962E', floor: '#9C5B2E', floor2: '#86491F', ceil: '#F9EECB', paper: 'fleur' },
  stairhall: { wall: '#FDEBD0', trim: '#D8A847', floor: '#EDE6D8', ceil: '#F5E1BC', paper: 'stripe' },
  centerhall: { wall: '#FDE68A', trim: '#C8962E', floor: '#3E6FB0', ceil: '#FFF3C4', paper: 'dots' },
  lincoln: { wall: '#3F7D56', trim: '#D4A843', floor: '#7A2E2E', ceil: '#E8E0C8', paper: 'fleur' },
  sitting: { wall: '#F8D9C6', trim: '#C8962E', floor: '#4A7A9E', ceil: '#FBEBDD', paper: 'stripe' },
};

/** A wobbly cartoon column at x on the back wall, floor fy to ceiling cy. */
const column = (c: Ctx, x: number, fy: number, cy: number, col = '#FFFFFF') => {
  const w = 30, h = fy - cy;
  inked(c, () => wobblePath(c, x - w / 2, cy + 24, w, h - 44, -3), col, 3);
  inked(c, () => c.roundRect(x - w / 2 - 8, fy - 20, w + 16, 20, 4), col, 3);
  inked(c, () => c.roundRect(x - w / 2 - 10, cy + 6, w + 20, 18, 4), col, 3);
  c.fillStyle = mix(col, '#9CA3AF', 0.35); for (const dx of [-7, 0, 7]) c.fillRect(x + dx - 1, cy + 30, 2, h - 56);
  c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(x - w / 2 + 4, cy + 30, 3, h - 56);
};
/** A window with drapes (its middle at x, its sill at sy), the outside behind (the sky's blue, or the night's). */
const windowAt = (c: Ctx, x: number, sy: number, w: number, h: number, drape: string) => {
  inked(c, () => c.roundRect(x - w / 2 - 6, sy - h - 6, w + 12, h + 12, [w / 2, w / 2, 3, 3]), '#FFFFFF', 3);
  inked(c, () => c.roundRect(x - w / 2, sy - h, w, h, [w / 2 - 4, w / 2 - 4, 2, 2]), '#9DD6F5', 2);
  c.fillStyle = '#C8ECFB'; c.fillRect(x - w / 2 + 6, sy - h + 20, 6, h - 30);
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x, sy - h + 4); c.lineTo(x, sy); c.moveTo(x - w / 2, sy - h * 0.45); c.lineTo(x + w / 2, sy - h * 0.45); c.stroke();
  for (const s of [-1, 1]) inked(c, () => { c.moveTo(x + s * (w / 2 + 14), sy - h - 16); c.quadraticCurveTo(x + s * (w / 2 - 6), sy - h * 0.4, x + s * (w / 2 + 4), sy + 6); c.lineTo(x + s * (w / 2 + 22), sy + 6); c.quadraticCurveTo(x + s * (w / 2 + 24), sy - h * 0.5, x + s * (w / 2 + 24), sy - h - 16); c.closePath(); }, drape, 3);
  inked(c, () => c.roundRect(x - w / 2 - 28, sy - h - 26, w + 56, 14, 6), dim(drape), 3);
};
/** A portrait in a gilt frame (whose: a white-wigged founding father, the bearded one in the stovepipe, a lady in
 *  pearls, a dog), its middle at (x, y). */
const portrait = (c: Ctx, x: number, y: number, who: number) => {
  inked(c, () => c.roundRect(x - 34, y - 42, 68, 84, 4), '#E2B33C', 3);
  inked(c, () => c.rect(x - 26, y - 34, 52, 68), ['#4B5D3A', '#5B3A2E', '#3A4B6B', '#6B4B2E'][who % 4], 2);
  const hx = x, hy = y - 8;
  if (who % 4 === 3) {
    // (a dog: a beagle in a bow tie)
    inked(c, () => c.ellipse(hx, hy + 4, 13, 11, 0, 0, Math.PI * 2), '#E8C9A0', 2);
    inked(c, () => c.ellipse(hx - 12, hy + 4, 5, 10, 0.3, 0, Math.PI * 2), '#7C4A1E', 2); inked(c, () => c.ellipse(hx + 12, hy + 4, 5, 10, -0.3, 0, Math.PI * 2), '#7C4A1E', 2);
    c.fillStyle = INK; c.fillRect(hx - 5, hy, 3, 3); c.fillRect(hx + 3, hy, 3, 3); c.beginPath(); c.arc(hx, hy + 8, 3, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#DC2626'; c.fillRect(hx - 6, hy + 16, 12, 4);
    return;
  }
  inked(c, () => { c.moveTo(hx - 22, y + 34); c.quadraticCurveTo(hx - 20, hy + 14, hx, hy + 14); c.quadraticCurveTo(hx + 20, hy + 14, hx + 22, y + 34); c.closePath(); }, who % 4 === 2 ? '#C084FC' : '#1F2937', 2);
  inked(c, () => c.ellipse(hx, hy, 10, 12, 0, 0, Math.PI * 2), '#F6C9A8', 2);
  if (who % 4 === 0) { inked(c, () => { c.moveTo(hx - 12, hy + 4); c.quadraticCurveTo(hx - 14, hy - 16, hx, hy - 14); c.quadraticCurveTo(hx + 14, hy - 16, hx + 12, hy + 4); c.lineTo(hx + 8, hy - 6); c.lineTo(hx - 8, hy - 6); c.closePath(); }, '#F1F5F9', 2); }
  if (who % 4 === 1) { inked(c, () => c.rect(hx - 9, hy - 34, 18, 22), '#111827', 2); inked(c, () => c.rect(hx - 14, hy - 13, 28, 3), '#111827', 2); inked(c, () => { c.moveTo(hx - 9, hy + 2); c.quadraticCurveTo(hx, hy + 22, hx + 9, hy + 2); c.closePath(); }, '#2B1A12', 2); }
  if (who % 4 === 2) { inked(c, () => c.ellipse(hx, hy - 8, 12, 8, 0, Math.PI, 0), '#B45309', 2); c.fillStyle = '#FFFFFF'; for (let k = -6; k <= 6; k += 3) c.fillRect(hx + k, hy + 13, 2, 2); }
  c.fillStyle = INK; c.fillRect(hx - 5, hy - 2, 2, 2); c.fillRect(hx + 3, hy - 2, 2, 2);
  c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx - 4, hy + 6); c.lineTo(hx + 4, hy + 6); c.stroke();
};
/** A cartoon chandelier hanging off the ceiling (scenery: dimmed, it's not the one he rides). */
const hangingLamp = (c: Ctx, x: number, cy: number, drop: number) => {
  c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, cy); c.lineTo(x, cy + drop); c.stroke();
  inked(c, () => c.ellipse(x, cy + drop + 10, 30, 10, 0, 0, Math.PI * 2), dim('#F2C94C'), 3);
  for (let k = -2; k <= 2; k++) { inked(c, () => c.rect(x + k * 12 - 2, cy + drop - 6, 4, 10), '#FFFFFF', 1.5); c.fillStyle = '#FDE047'; c.beginPath(); c.arc(x + k * 12, cy + drop - 9, 3, 0, Math.PI * 2); c.fill(); }
  for (let k = -3; k <= 3; k++) { c.fillStyle = '#E0F2FE'; c.beginPath(); c.moveTo(x + k * 8, cy + drop + 18); c.lineTo(x + k * 8 - 3, cy + drop + 26); c.lineTo(x + k * 8 + 3, cy + drop + 26); c.closePath(); c.fill(); }
};
const wallpaper = (c: Ctx, a: number, b: number, top: number, bot: number, L: Look) => {
  const col = mix(L.wall, L.trim, 0.3);
  if (L.paper === 'stripe') { c.fillStyle = col; for (let x = a + 10; x < b; x += 36) c.fillRect(x, top, 10, bot - top); }
  if (L.paper === 'dots') { c.fillStyle = col; for (let x = a + 20; x < b; x += 40) for (let y = top + 20; y < bot; y += 40) { c.beginPath(); c.arc(x + ((y / 40) % 2) * 20, y, 4, 0, Math.PI * 2); c.fill(); } }
  if (L.paper === 'fleur') { c.fillStyle = col; for (let x = a + 30; x < b; x += 60) for (let y = top + 30; y < bot; y += 60) { const xx = x + ((y / 60) % 2) * 30; c.beginPath(); c.moveTo(xx, y - 8); c.quadraticCurveTo(xx + 8, y, xx, y + 8); c.quadraticCurveTo(xx - 8, y, xx, y - 8); c.fill(); } }
};

/** A room's shell (its ceiling, floor and back wall to the eye), its wall's furnishings. */
const room = (c: Ctx, state: GameState, E: P, r: Room) => {
  const L = LOOK[r.id];
  if (!L) return;
  const a = X(r.a), b = X(r.b), fy = Y(r.floor), cy = Y(r.ceil);
  if (!seen(state, E, a, b, D_BACK, 80) && !onScreen(state, a, b)) return;
  // (the house above the ceiling: no sky through it)
  box(c, a - 1, cy - 1200, b - a + 2, 1200, '#3A2350');
  // (the ceiling going back, beams across it)
  quad(c, [proj(E, a, cy, D_BACK), proj(E, b, cy, D_BACK), proj(E, b, cy, 1), proj(E, a, cy, 1)], L.ceil);
  c.strokeStyle = mix(L.ceil, INK, 0.25); c.lineWidth = 1.5;
  for (let x = r.a + 120; x < r.b; x += 160) { const p0 = proj(E, X(x), cy, D_BACK), p1 = proj(E, X(x), cy, 1); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  // (the floor going back: its pattern)
  quad(c, [proj(E, a, fy, D_BACK), proj(E, b, fy, D_BACK), proj(E, b, fy, 1), proj(E, a, fy, 1)], L.floor);
  if (r.id === 'entrance') {
    // (black and white marble squares; the seal in the middle)
    for (let x = r.a; x < r.b; x += 60) for (let k = 0; k < 4; k++) {
      if (((x / 60) + k) % 2 === 0) continue;
      const d0 = D_BACK + (1 - D_BACK) * (k / 4), d1 = D_BACK + (1 - D_BACK) * ((k + 1) / 4);
      quad(c, [proj(E, X(x), fy, d0), proj(E, X(x + 60), fy, d0), proj(E, X(x + 60), fy, d1), proj(E, X(x), fy, d1)], L.floor2!);
    }
    const m = proj(E, X(520), fy, (D_BACK + 1) / 2);
    c.save(); c.translate(m.x, m.y); c.scale(1, 0.18);
    inked(c, () => c.arc(0, 0, 70, 0, Math.PI * 2), '#1E3A8A', 4); inked(c, () => c.arc(0, 0, 52, 0, Math.PI * 2), '#E2B33C', 3);
    c.restore();
  } else if (L.floor2) {
    // (parquet boards)
    for (let x = r.a; x < r.b; x += 40) quad(c, [proj(E, X(x), fy, D_BACK), proj(E, X(x + 18), fy, D_BACK), proj(E, X(x + 18), fy, 1), proj(E, X(x), fy, 1)], L.floor2);
  } else {
    // (a carpet runner's gold border)
    const d = D_BACK + (1 - D_BACK) * 0.15, d2 = D_BACK + (1 - D_BACK) * 0.85;
    c.strokeStyle = '#F2C94C'; c.lineWidth = 2; for (const dd of [d, d2]) { const p0 = proj(E, a, fy, dd), p1 = proj(E, b, fy, dd); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  }
  // (the back wall: paper, a dado rail, a skirting board, crown molding; then what's on it)
  atDepth(c, E, D_BACK, () => {
    box(c, a, cy, b - a, fy - cy, L.wall);
    wallpaper(c, a, b, cy + 30, fy - 60, L);
    box(c, a, fy - 60, b - a, 60, mix(L.wall, INK, 0.12)); box(c, a, fy - 62, b - a, 4, L.trim); box(c, a, fy - 14, b - a, 14, mix(L.trim, INK, 0.3));
    box(c, a, cy, b - a, 22, L.trim); box(c, a, cy + 22, b - a, 4, mix(L.trim, INK, 0.3));
    c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(a, cy, b - a, fy - cy);
    furnish(c, state, r, a, b, fy, cy);
  });
  // (the doorways between the rooms: arches at the ends of the back wall)
  atDepth(c, E, D_BACK, () => {
    for (const x of [a, b]) {
      inked(c, () => { c.moveTo(x - 46, fy); c.lineTo(x - 46, fy - 190); c.quadraticCurveTo(x, fy - 250, x + 46, fy - 190); c.lineTo(x + 46, fy); c.closePath(); }, mix(L.wall, INK, 0.55), 4);
      c.strokeStyle = L.trim; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 50, fy); c.lineTo(x - 50, fy - 192); c.quadraticCurveTo(x, fy - 256, x + 50, fy - 192); c.lineTo(x + 50, fy); c.stroke();
    }
  });
};

/** What's on each room's back wall (drawn at the wall's depth). */
const furnish = (c: Ctx, state: GameState, r: Room, a: number, b: number, fy: number, cy: number) => {
  const f = state.frame;
  switch (r.id) {
    case 'entrance':
      for (const x of [150, 420, 760, 1000]) column(c, X(x), fy, cy);
      portrait(c, X(290), fy - 250, 0); portrait(c, X(890), fy - 250, 3);
      windowAt(c, X(590), fy - 90, 90, 200, '#B91C1C');
      // (the front doors back out: big double doors at the far left)
      inked(c, () => c.roundRect(X(-120), fy - 230, 140, 230, [60, 60, 0, 0]), '#7C4A1E', 4);
      c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(X(-50), fy - 220); c.lineTo(X(-50), fy); c.stroke();
      c.fillStyle = '#FACC15'; c.fillRect(X(-60), fy - 110, 6, 10); c.fillRect(X(-46), fy - 110, 6, 10);
      break;
    case 'crosshall':
      for (const x of [1180, 1460, 1740, 2020]) column(c, X(x), fy, cy);
      portrait(c, X(1320), fy - 250, 1); portrait(c, X(1600), fy - 250, 2); portrait(c, X(1880), fy - 250, 0);
      hangingLamp(c, X(1460), cy, 70); hangingLamp(c, X(1880), cy, 70);
      break;
    case 'eastroom':
      windowAt(c, X(2420), fy - 110, 100, 250, '#E2B33C'); windowAt(c, X(2780), fy - 110, 100, 250, '#E2B33C'); windowAt(c, X(3500), fy - 110, 100, 250, '#E2B33C');
      portrait(c, X(3160), fy - 270, 0);
      // (a bandstand's backdrop: bunting)
      for (let x = 3300; x < 3640; x += 60) { inked(c, () => { c.moveTo(X(x), cy + 40); c.quadraticCurveTo(X(x + 30), cy + 80, X(x + 60), cy + 40); c.closePath(); }, ['#DC2626', '#FFFFFF', '#1D4ED8'][(x / 60) % 3 | 0], 2); }
      break;
    case 'press': {
      // (the briefing room: blue drapes, the oval sign, the show's cardboard press corps in their seats)
      for (let x = r.a + 20; x < r.b; x += 50) inked(c, () => { c.moveTo(X(x), cy + 26); c.quadraticCurveTo(X(x + 25), (cy + fy) / 2, X(x), fy - 60); c.lineTo(X(x + 50), fy - 60); c.quadraticCurveTo(X(x + 25), (cy + fy) / 2, X(x + 50), cy + 26); c.closePath(); }, x % 100 ? '#2A4A9E' : '#3459B8', 2);
      const mx = X(4300), my = fy - 250;
      inked(c, () => c.ellipse(mx, my, 150, 70, 0, 0, Math.PI * 2), '#1E3A8A', 4);
      inked(c, () => c.ellipse(mx, my, 136, 58, 0, 0, Math.PI * 2), '#E2B33C', 3);
      inked(c, () => c.ellipse(mx, my, 128, 52, 0, 0, Math.PI * 2), '#1E3A8A', 2);
      signText(c, 'THE WHITE HOUSE', mx, my + 6, toonLetters(2));
      signText(c, 'WASHINGTON', mx, my + 30, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDE68A', '#F59E0B']));
      // (Perot's flip charts, on easels, by the drapes)
      for (const [x, k] of [[3780, 0], [4880, 1]] as [number, number][]) {
        c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(X(x) - 20, fy); c.lineTo(X(x), fy - 160); c.lineTo(X(x) + 20, fy); c.stroke();
        inked(c, () => c.rect(X(x) - 40, fy - 200, 80, 90), '#FFFFFF', 3);
        if (k) { c.strokeStyle = '#DC2626'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(x) - 32, fy - 125); c.lineTo(X(x) - 10, fy - 150); c.lineTo(X(x) + 6, fy - 140); c.lineTo(X(x) + 30, fy - 190); c.stroke(); }
        else { c.save(); c.translate(X(x), fy - 155); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 30, i * 1.6, (i + 1) * 1.6); c.closePath(); c.fillStyle = ['#EF4444', '#3B82F6', '#FACC15', '#22C55E'][i]; c.fill(); } c.restore(); }
      }
      break;
    }
    case 'dining':
      portrait(c, X(5700), fy - 270, 1);
      inked(c, () => c.roundRect(X(5620), fy - 150, 160, 150, 6), '#F5F5F4', 3); inked(c, () => c.roundRect(X(5650), fy - 110, 100, 110, 4), '#1F2937', 3);
      c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(X(5680), fy); c.quadraticCurveTo(X(5700), fy - 40 - Math.sin(f * 0.3) * 6, X(5720), fy); c.fill();
      windowAt(c, X(5250), fy - 100, 90, 220, '#15803D'); windowAt(c, X(6150), fy - 100, 90, 220, '#15803D');
      hangingLamp(c, X(5500), cy, 60); hangingLamp(c, X(5900), cy, 60);
      break;
    case 'stairhall':
      for (const x of [6460, 7560]) column(c, X(x), fy, cy);
      windowAt(c, X(7000), fy - 320, 120, 260, '#B91C1C');
      portrait(c, X(6800), fy - 200, 2); portrait(c, X(7250), fy - 470, 0);
      // (the bowling lane's sign up on the landing)
      inked(c, () => c.roundRect(X(7380), Y(F2) - 230, 200, 60, 10), '#111827', 4);
      signText(c, 'PRESIDENTIAL', X(7480), Y(F2) - 208, toonLetters(1, ['#FDE047', '#FDE047', '#F59E0B', '#F59E0B']));
      signText(c, 'BOWLING LANE', X(7480), Y(F2) - 188, toonLetters(1, ['#F472B6', '#F472B6', '#EC4899', '#DB2777']));
      break;
    case 'centerhall':
      for (const x of [7700, 8000, 8300]) column(c, X(x), fy, cy, '#FFF7E6');
      portrait(c, X(7850), fy - 250, 3); portrait(c, X(8150), fy - 250, 2);
      break;
    case 'lincoln':
      // (the Lincoln bed's carved headboard on the wall (scenery: dimmed), his portrait, the Gettysburg Address under glass)
      inked(c, () => { c.moveTo(X(8800), fy); c.lineTo(X(8800), fy - 220); c.quadraticCurveTo(X(8905), fy - 330, X(9010), fy - 220); c.lineTo(X(9010), fy); c.closePath(); }, dim('#5B2E1A'), 4);
      inked(c, () => c.ellipse(X(8905), fy - 250, 30, 20, 0, 0, Math.PI * 2), dim('#7C3A1E'), 3);
      portrait(c, X(8640), fy - 260, 1);
      inked(c, () => c.rect(X(9150), fy - 240, 90, 70), '#E2B33C', 3); inked(c, () => c.rect(X(9158), fy - 232, 74, 54), '#F5EBD0', 2);
      c.fillStyle = '#6B5B4E'; for (let k = 0; k < 6; k++) c.fillRect(X(9164), fy - 224 + k * 8, 60 - (k % 3) * 8, 2);
      windowAt(c, X(9300), fy - 100, 70, 220, '#7F1D1D');
      break;
    case 'sitting': {
      // (the big half-moon fan window, the sun through it)
      const mx = X(9650), base = fy - 120;
      inked(c, () => { c.moveTo(mx - 170, base); c.arc(mx, base, 170, Math.PI, 0); c.closePath(); }, '#FFFFFF', 4);
      inked(c, () => { c.moveTo(mx - 156, base); c.arc(mx, base, 156, Math.PI, 0); c.closePath(); }, '#9DD6F5', 2);
      c.strokeStyle = INK; c.lineWidth = 3; for (let k = 1; k < 8; k++) { const t = Math.PI + (k / 8) * Math.PI; c.beginPath(); c.moveTo(mx, base); c.lineTo(mx + Math.cos(t) * 156, base + Math.sin(t) * 156); c.stroke(); }
      inked(c, () => c.arc(mx, base, 30, Math.PI, 0), '#FFFFFF', 3);
      inked(c, () => c.rect(mx - 170, base, 340, 120), '#9DD6F5', 4);
      break;
    }
  }
  void a; void b;
};

// ---------------------------------------------------------------------------------------------------------------
// The outdoors: the South Portico behind the balcony and the garden, the lawn

const outdoors = (c: Ctx, state: GameState, E: P) => {
  const a = X(9950), b = X(12200);
  if (!onScreen(state, a - 300, b + 300) && !seen(state, E, a, b, 0.7)) return;
  // (the house's south front behind: white, its windows, the portico's columns going up past the balcony)
  atDepth(c, E, 0.7, () => {
    inked(c, () => c.rect(X(9600), Y(CEIL1 + 380), 1300, CEIL1 + 380), '#F8F7F2', 4);
    for (let x = 9660; x < 10880; x += 110) { inked(c, () => c.rect(X(x), Y(F2 + 230), 50, 120), '#9DD6F5', 3); inked(c, () => c.rect(X(x), Y(160), 50, 110), '#9DD6F5', 3); }
    // (the portico's curve of columns, the roof's balustrade)
    for (let x = 9980; x < 10360; x += 64) column(c, X(x), Y(F2), Y(CEIL1 + 300), '#FFFFFF');
    inked(c, () => c.rect(X(9600), Y(CEIL1 + 400), 1300, 30), '#ECEAE2', 4);
  });
  // (the lawn going back)
  quad(c, [proj(E, X(10300), GY, 0.7), proj(E, b, GY, 0.7), proj(E, b, GY, 1), proj(E, X(10300), GY, 1)], '#4ADE80');
  c.strokeStyle = '#22C55E'; c.lineWidth = 2;
  for (let x = 10320; x < 12200; x += 70) { const p0 = proj(E, X(x), GY, 0.72), p1 = proj(E, X(x + 30), GY, 0.98); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  // (the hedges along the back of the garden; the West Colonnade at the far end)
  atDepth(c, E, 0.82, () => {
    for (let x = 10400; x < 11760; x += 120) inked(c, () => c.roundRect(X(x), GY - 70, 110, 70, 30), '#15803D', 3);
    for (let x = 11760; x < 12200; x += 70) column(c, X(x), GY, GY - 260, '#FFFFFF');
    inked(c, () => c.rect(X(11740), GY - 290, 480, 34), '#F1F5F9', 4);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane: what he stands on (lit along its top), the placards, the banner, the stairs

const litTop = (c: Ctx, x: number, y: number, w: number) => { box(c, x + 2, y, w - 4, 2, '#FFFBEB'); box(c, x + 6, y, w * 0.4, 1, '#FFFFFF'); };
/** A placard on a gilt easel at (x, feet), the room's name in the show's letters. */
const placard = (c: Ctx, x: number, feet: number, words: string[]) => {
  stamp(c, `wh-placard-${words.join('|')}`, x - 80, feet - 150, 160, 154, g => {
    const ox = 80, oy = 150;
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(ox - 26, oy); g.lineTo(ox - 6, oy - 120); g.moveTo(ox + 26, oy); g.lineTo(ox + 6, oy - 120); g.moveTo(ox, oy); g.lineTo(ox, oy - 60); g.stroke();
    g.strokeStyle = '#E2B33C'; g.lineWidth = 2; g.stroke();
    inked(g, () => g.roundRect(ox - 70, oy - 140, 140, 64, 8), '#E2B33C', 3);
    inked(g, () => g.roundRect(ox - 62, oy - 132, 124, 48, 5), '#FFF7E6', 2);
    // (the big letters if they fit the card, else the small)
    words.forEach((w, i) => { const big = signW(w, toonLetters(2)) <= 116 ? 2 : 1; signText(g, w, ox, oy - 112 + i * 20 + (words.length === 1 ? 8 : 0), toonLetters(big, i ? ['#7C3AED', '#7C3AED', '#6D28D9', '#5B21B6'] : ['#DC2626', '#DC2626', '#B91C1C', '#991B1B'])); });
  });
};
const PLACARDS: [number, number, string[]][] = [
  [1160, 0, ['THE CROSS HALL']], [2300, 0, ['THE EAST ROOM']], [3760, 0, ['THE PRESS ROOM']], [5100, 0, ['THE STATE', 'DINING ROOM']],
  [6420, 0, ['THE GRAND', 'STAIRCASE']], [7640, F2, ['THE CENTER HALL']], [8470, F2, ['THE LINCOLN', 'BEDROOM']], [9400, F2, ['THE WEST', 'SITTING HALL']],
];

const piano = (c: Ctx) => {
  const a = X(PIANO.a), b = X(PIANO.b), top = Y(PIANO.h);
  // (the Steinway: a black grand, its lid propped open (scenery, up behind), its legs, the keys along the front)
  inked(c, () => { c.moveTo(a + 10, top); c.lineTo(b - 30, top - 70); c.lineTo(b - 26, top - 66); c.lineTo(a + 22, top); c.closePath(); }, dim('#111827'), 3);
  inked(c, () => c.roundRect(a, top, b - a, 34, [6, 30, 6, 6]), '#111827', 3);
  for (const x of [a + 12, b - 18]) inked(c, () => c.rect(x, top + 34, 8, GY - top - 34), '#111827', 3);
  inked(c, () => c.rect(a + 4, top + 24, 60, 10), '#FFFFFF', 2);
  c.fillStyle = INK; for (let k = 0; k < 8; k++) c.fillRect(a + 8 + k * 7, top + 24, 3, 6);
  c.fillStyle = '#E2B33C'; c.font = '6px "Press Start 2P"'; c.fillText('STEINWAY', a + 64, top + 14);
  litTop(c, a, top, b - a);
};
const chairStack = (c: Ctx) => {
  const a = X(CHAIRS.a), w = CHAIRS.b - CHAIRS.a, top = Y(CHAIRS.h), n = 10, hh = (GY - top) / n;
  // (gilt ballroom chairs, stacked to the ceiling-ish: too tall to jump, a solid lot)
  for (let i = 0; i < n; i++) {
    const y = GY - (i + 1) * hh, lean = (hash(i * 7.3) - 0.5) * 6;
    inked(c, () => c.roundRect(a + lean, y, w, hh, 3), i % 2 ? '#E2B33C' : '#F2C94C', 3);
    inked(c, () => c.roundRect(a + 6 + lean, y + 4, w - 12, hh - 10, 2), '#DC2626', 2);
  }
  litTop(c, a, top, w);
  // (the risers down the far side)
  const ra = X(RISER.a), rw = RISER.b - RISER.a, rt = Y(RISER.h);
  inked(c, () => c.rect(ra, rt, rw, GY - rt), '#1E40AF', 3);
  c.fillStyle = '#FFFFFF'; for (let x = ra + 6; x < ra + rw - 6; x += 14) c.fillRect(x, rt + 10, 6, GY - rt - 16);
  litTop(c, ra, rt, rw);
};
const podium = (c: Ctx) => {
  const a = X(PODIUM.a), w = PODIUM.b - PODIUM.a, top = Y(PODIUM.h);
  inked(c, () => { c.moveTo(a, top); c.lineTo(a + w, top); c.lineTo(a + w - 6, GY); c.lineTo(a + 6, GY); c.closePath(); }, '#7C4A1E', 3);
  inked(c, () => c.arc(a + w / 2, top + 40, 18, 0, Math.PI * 2), '#1E3A8A', 3);
  inked(c, () => c.arc(a + w / 2, top + 40, 12, 0, Math.PI * 2), '#E2B33C', 2);
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(a + w / 2 + 10, top); c.lineTo(a + w / 2 + 16, top - 18); c.stroke();
  litTop(c, a, top, w);
};
const dining = (c: Ctx, state: GameState) => {
  const sa = X(SIDEBOARD.a), sw = SIDEBOARD.b - SIDEBOARD.a, st = Y(SIDEBOARD.h);
  inked(c, () => c.rect(sa, st, sw, GY - st), '#7C4A1E', 3);
  c.fillStyle = '#5B3416'; c.fillRect(sa + 8, st + 18, sw - 16, 3); c.fillRect(sa + sw / 2 - 1, st + 22, 2, GY - st - 26);
  litTop(c, sa, st, sw);
  const ta = X(TABLE.a), tw = TABLE.b - TABLE.a, tt = Y(TABLE.h);
  // (the chairs' backs along the back of it: scenery, dimmed)
  for (let x = ta + 30; x < ta + tw - 20; x += 80) inked(c, () => c.roundRect(x, tt - 46, 30, 46, [10, 10, 0, 0]), dim('#B45309'), 2);
  // (the table: a white cloth to the floor, gold fringe; the feast on it, eaten through)
  inked(c, () => c.rect(ta, tt, tw, GY - tt), '#FFFFFF', 3);
  c.fillStyle = '#E2B33C'; for (let x = ta + 4; x < ta + tw - 4; x += 8) c.fillRect(x, GY - 8, 4, 8);
  c.fillStyle = '#E5E7EB'; c.fillRect(ta, tt + 14, tw, 2);
  const f = state.frame;
  for (const [dx, what] of [[60, 0], [200, 1], [330, 2], [470, 0], [590, 1]] as [number, number][]) {
    const x = ta + dx, y = tt;
    if (what === 0) { inked(c, () => c.ellipse(x, y - 4, 20, 5, 0, 0, Math.PI * 2), '#F5F5F4', 2); inked(c, () => c.ellipse(x, y - 12, 13, 10, 0, Math.PI, 0), '#B45309', 2); c.fillStyle = '#FFFFFF'; c.fillRect(x + 10, y - 22, 3, 8); }
    if (what === 1) { inked(c, () => c.rect(x - 2, y - 30, 4, 30), '#E2B33C', 2); for (const s of [-8, 0, 8]) { inked(c, () => c.rect(x + s - 1.5, y - 42, 3, 12), '#FFFFFF', 1.5); c.fillStyle = '#F97316'; c.beginPath(); c.arc(x + s, y - 45 - Math.sin(f * 0.3 + s) * 1.5, 2.5, 0, Math.PI * 2); c.fill(); } }
    if (what === 2) { inked(c, () => c.roundRect(x - 16, y - 18, 32, 18, 6), '#A16207', 2); c.fillStyle = '#FDE68A'; c.fillRect(x - 10, y - 16, 8, 3); }
  }
  litTop(c, ta, tt, tw);
};
const stairs = (c: Ctx, state: GameState) => {
  const a = X(STAIRS.a), b = X(STAIRS.b), n = STAIRS.steps, stepW = (b - a) / n, rise = F2 / n;
  if (!onScreen(state, a - 200, X(BALCONY_EDGE) + 50)) return;
  // (the stairs: marble treads, a red runner up them; the banister along the back (scenery))
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(a, GY - 90); c.lineTo(b, Y(F2) - 90); c.stroke();
  c.strokeStyle = '#B45309'; c.lineWidth = 2; c.stroke();
  for (let k = 0; k <= n; k += 2) { const x = a + k * stepW, y = GY - k * rise; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x, y - 88); c.stroke(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 1.5; c.stroke(); }
  c.beginPath(); c.moveTo(a, GY);
  for (let k = 1; k <= n; k++) { c.lineTo(a + (k - 1) * stepW, GY - k * rise); c.lineTo(a + k * stepW, GY - k * rise); }
  c.lineTo(b, GY); c.closePath(); c.fillStyle = '#EDE6D8'; c.fill(); c.strokeStyle = INK; c.lineWidth = 3; c.stroke();
  for (let k = 1; k <= n; k++) {
    const x = a + (k - 1) * stepW, y = GY - k * rise;
    box(c, x + stepW * 0.25, y, stepW * 0.5, rise, '#C81E3C');
    box(c, x + 1, y, stepW - 1, 2, '#FFFBEB');
    c.fillStyle = INK; c.fillRect(x, y, 2, rise);
  }
  // (the second floor's edge: its lit lip, the wall of the ground floor under it, wainscoted)
  const e0 = b, e1 = X(BALCONY_EDGE), top = Y(F2);
  if (onScreen(state, e0, e1)) {
    box(c, e0, top, e1 - e0, GY - top + 40, '#FDEBD0');
    box(c, e0, top, e1 - e0, 18, '#D8A847'); box(c, e0, top + 18, e1 - e0, 3, INK);
    box(c, e0, GY - 90, e1 - e0, 90, '#E8C99A'); box(c, e0, GY - 92, e1 - e0, 4, '#B8862E');
    for (let x = e0 + 40; x < e1; x += 140) inked(c, () => c.roundRect(x, GY - 76, 90, 60, 4), '#F2D6A8', 2);
    litTop(c, e0, top, e1 - e0);
  }
};
const bed = (c: Ctx) => {
  const a = X(BED.a), w = BED.b - BED.a, top = Y(BED.h);
  inked(c, () => c.rect(a, top + 10, w, Y(F2) - top - 10), '#5B2E1A', 3);
  inked(c, () => c.roundRect(a - 4, top, w + 8, 22, 8), '#FFFFFF', 3);
  inked(c, () => c.roundRect(a + w - 50, top - 10, 42, 14, 6), '#F8FAFC', 2);
  inked(c, () => c.rect(a + 10, top + 6, w - 70, 16), '#7C3AED', 2);
  for (const x of [a - 6, a + w - 2]) inked(c, () => c.rect(x, top - 20, 8, Y(F2) - top + 20), '#5B2E1A', 3);
  litTop(c, a - 4, top, w + 8);
};
const garden = (c: Ctx, state: GameState) => {
  const f = state.frame;
  // (the balcony's balustrade along its edge; the garden's own bench and arbor)
  const ba = X(9950), bb = X(BALCONY_EDGE);
  if (onScreen(state, ba, bb)) for (let x = ba + 6; x < bb - 4; x += 18) inked(c, () => c.roundRect(x, Y(F2) - 46, 10, 46, 4), dim('#FFFFFF'), 2);
  const ka = X(BENCH.a), kw = BENCH.b - BENCH.a, kt = Y(BENCH.h);
  inked(c, () => c.rect(ka, kt, kw, 14), '#FFFFFF', 3);
  for (const x of [ka + 8, ka + kw - 14]) inked(c, () => c.rect(x, kt + 14, 6, GY - kt - 14), '#FFFFFF', 3);
  litTop(c, ka, kt, kw);
  const aa = X(ARBOR.a), aw = ARBOR.b - ARBOR.a, at = Y(ARBOR.h);
  for (const x of [aa + 4, aa + aw - 12]) inked(c, () => c.rect(x, at, 8, GY - at), '#FFFFFF', 3);
  inked(c, () => c.rect(aa - 6, at, aw + 12, 12), '#FFFFFF', 3);
  for (let k = 0; k < 7; k++) { c.fillStyle = k % 2 ? '#F43F5E' : '#16A34A'; c.beginPath(); c.arc(aa + 4 + k * 14, at + 18 + (k % 3) * 6, 4, 0, Math.PI * 2); c.fill(); }
  litTop(c, aa - 6, at, aw + 12);
  // (the rose bushes: round, dark green, thorned, red roses on them)
  for (const [a, b] of ROSES) {
    const x = X(a), w = b - a;
    if (!onScreen(state, x - 40, x + w + 40)) continue;
    inked(c, () => { c.moveTo(x, GY); for (let k = 0; k <= 4; k++) c.quadraticCurveTo(x + (k - 0.5) * (w / 4), GY - ROSE_H - 12 - (k % 2) * 6, x + k * (w / 4), GY - ROSE_H + 6); c.lineTo(x + w, GY); c.closePath(); }, '#166534', 3);
    c.fillStyle = INK; for (let k = 0; k < 10; k++) { const tx = x + 6 + k * (w - 12) / 9, ty = GY - ROSE_H + 2 + (k % 3) * 8; c.beginPath(); c.moveTo(tx - 2, ty); c.lineTo(tx, ty - 6); c.lineTo(tx + 2, ty); c.fill(); }
    for (let k = 0; k < 5; k++) { const rx = x + 12 + k * (w - 24) / 4, ry = GY - ROSE_H + 8 + (k % 2) * 10; inked(c, () => c.arc(rx, ry, 5, 0, Math.PI * 2), '#E11D48', 2); }
  }
  // (the sprinklers: a brass head in the lawn, up and sputtering, then the column of water)
  for (const [rx, ph] of SPRINKLERS) {
    const x = X(rx);
    if (!onScreen(state, x - 60, x + 60)) continue;
    const s = sprinklerAt(ph, f), up = s.st === 'off' ? 0 : 1;
    inked(c, () => c.ellipse(x, GY, 12, 4, 0, 0, Math.PI * 2), '#3F3F46', 2);
    inked(c, () => c.rect(x - 4, GY - 4 - up * 12, 8, 4 + up * 12), '#CA8A04', 2);
    if (s.st === 'tell' && f % 6 < 3) { c.fillStyle = '#BAE6FD'; c.beginPath(); c.arc(x + (f % 4) - 2, GY - 22, 2.5, 0, Math.PI * 2); c.fill(); }
    if (s.st === 'spray') {
      const h = SPRAY_H * Math.min(1, s.k * 5), wob = Math.sin(f * 0.6) * 2;
      c.fillStyle = INK; c.beginPath(); c.moveTo(x - 6, GY - 14); c.quadraticCurveTo(x - SPRAY_W / 2 + wob, GY - h * 0.6, x - SPRAY_W / 2 - 4, GY - h); c.lineTo(x + SPRAY_W / 2 + 4, GY - h); c.quadraticCurveTo(x + SPRAY_W / 2 + wob, GY - h * 0.6, x + 6, GY - 14); c.closePath(); c.fill();
      c.fillStyle = '#7DD3FC'; c.beginPath(); c.moveTo(x - 4, GY - 14); c.quadraticCurveTo(x - SPRAY_W / 2 + 3 + wob, GY - h * 0.6, x - SPRAY_W / 2, GY - h + 3); c.lineTo(x + SPRAY_W / 2, GY - h + 3); c.quadraticCurveTo(x + SPRAY_W / 2 - 3 + wob, GY - h * 0.6, x + 4, GY - 14); c.closePath(); c.fill();
      c.fillStyle = '#E0F2FE'; c.fillRect(x - 2 + wob, GY - h + 6, 3, h - 24);
    }
  }
};

/** The hazards in the play plane (behind him): the vacuum, the chandelier, the bowling balls and the ball return. */
const hazards = (c: Ctx, state: GameState) => {
  const s = whOf(state), f = state.frame;
  // The vacuum: an upright, its bag puffed, its headlamp, the cord whipping behind, nobody pushing it
  const v = s.vac;
  if (v.x && onScreen(state, v.x - 80, v.x + 80)) {
    const bx = vacBox(state), d = v.dir, bag = 0.7 + v.bag * 0.3 + (v.pause ? Math.sin(f * 0.3) * 0.05 : Math.sin(f * 0.9) * 0.04);
    c.save(); c.translate(v.x, GY); c.scale(d, 1);
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-18, -20); for (let k = 1; k <= 6; k++) c.lineTo(-18 - k * 14, -6 + Math.sin(f * 0.5 + k) * 5); c.stroke();
    inked(c, () => c.roundRect(-10, -96, 8, 50, 3), '#9CA3AF', 2.5);
    inked(c, () => c.roundRect(-14, -102, 16, 8, 3), '#111827', 2);
    inked(c, () => c.ellipse(-6, -58, 16 * bag, 24 * bag, -0.1, 0, Math.PI * 2), '#60A5FA', 3);
    c.fillStyle = '#93C5FD'; c.beginPath(); c.ellipse(-10, -64, 5, 10, -0.1, 0, Math.PI * 2); c.fill();
    inked(c, () => c.roundRect(-24, -26, 50, 22, 6), '#DC2626', 3);
    inked(c, () => c.rect(14, -14, 14, 12), '#1F2937', 2);
    c.fillStyle = v.pause ? '#7F1D1D' : '#FDE047'; c.beginPath(); c.arc(22, -20, 4, 0, Math.PI * 2); c.fill();
    for (const wx of [-16, 16]) inked(c, () => c.arc(wx, -4, 5, 0, Math.PI * 2), '#111827', 2);
    c.fillStyle = '#FFFFFF'; c.font = '5px "Press Start 2P"'; c.fillText('HOOVER', -20, -12);
    c.restore();
    // (the suction: lines streaming into its nozzle)
    if (!v.pause) { c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.5; for (let k = 0; k < 3; k++) { const t = ((f * 6 + k * 40) % 120) / 120, x = v.x + d * (30 + (1 - t) * 160); c.beginPath(); c.moveTo(x, GY - 8 - k * 8); c.lineTo(x + d * 14, GY - 8 - k * 8); c.stroke(); } }
    void bx;
  }
  // The chandelier: its chain from the ceiling, the brass ring (lit along the top: he stands there), its tiers of crystal
  const ch = chandelierAt(f), px = X(CHANDELIER.x), py = Y(CHANDELIER.pivotH);
  if (onScreen(state, px - 300, px + 300)) {
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(px, py); c.lineTo(ch.x, ch.y); c.stroke();
    c.strokeStyle = '#CA8A04'; c.lineWidth = 2; c.setLineDash([4, 3]); c.stroke(); c.setLineDash([]);
    c.save(); c.translate(ch.x, ch.y); c.rotate(ch.a * 0.5);
    const w = CHANDELIER.w;
    inked(c, () => c.roundRect(-w / 2, 0, w, 12, 5), '#E2B33C', 3);
    for (let k = -3; k <= 3; k++) { inked(c, () => c.rect(k * 13 - 2, -12, 4, 12), '#FFFFFF', 1.5); c.fillStyle = '#FDE047'; c.beginPath(); c.arc(k * 13, -15 + Math.sin(f * 0.3 + k) * 0.8, 3, 0, Math.PI * 2); c.fill(); }
    inked(c, () => { c.moveTo(-w / 2 + 6, 12); c.quadraticCurveTo(0, 60, w / 2 - 6, 12); c.closePath(); }, '#F2C94C', 3);
    for (let k = -4; k <= 4; k++) { const cx = k * 9, cy = 14 + (16 - Math.abs(k) * 3); c.fillStyle = INK; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx - 4, cy + 12); c.lineTo(cx + 4, cy + 12); c.closePath(); c.fill(); c.fillStyle = '#E0F2FE'; c.beginPath(); c.moveTo(cx, cy + 2); c.lineTo(cx - 2.5, cy + 10); c.lineTo(cx + 2.5, cy + 10); c.closePath(); c.fill(); }
    box(c, -w / 2 + 3, 0, w - 6, 2, '#FFFBEB');
    c.restore();
    inked(c, () => c.arc(px, py + 4, 8, 0, Math.PI * 2), '#E2B33C', 3);
  }
  // The ball return up top (its light, the pins rattling in the tell), the grate at the bottom, the balls
  const rx = X(BALL_RETURN), ry = Y(F2);
  if (onScreen(state, rx - 80, rx + 120)) {
    const tell = s.ballTell > 0;
    inked(c, () => c.roundRect(rx - 10, ry - 70, 90, 70, [20, 20, 0, 0]), '#1D4ED8', 3);
    inked(c, () => c.ellipse(rx + 20, ry - 30, 22, 16, 0, 0, Math.PI * 2), '#111827', 3);
    c.fillStyle = tell && f % 6 < 3 ? '#FDE047' : '#7F1D1D'; c.beginPath(); c.arc(rx + 60, ry - 54, 6, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 3; k++) { const jig = tell ? Math.sin(f * 1.4 + k) * 2 : 0; inked(c, () => c.ellipse(rx + 52 + k * 8 + jig, ry - 14, 4, 12, jig * 0.05, 0, Math.PI * 2), '#FFFFFF', 2); c.fillStyle = '#DC2626'; c.fillRect(rx + 49 + k * 8 + jig, ry - 20, 6, 2); }
  }
  const ga = X(BALL_GRATE[0]), gb = X(BALL_GRATE[1]);
  if (onScreen(state, ga, gb)) { inked(c, () => c.rect(ga, GY - 4, gb - ga, 6), '#3F3F46', 2); c.fillStyle = INK; for (let x = ga + 6; x < gb - 4; x += 8) c.fillRect(x, GY - 3, 3, 4); }
  for (const b of s.balls) {
    c.save(); c.translate(b.x, b.y); c.rotate(b.spin);
    inked(c, () => c.arc(0, 0, BALL_R, 0, Math.PI * 2), '#1E1B4B', 3);
    c.fillStyle = '#6366F1'; c.beginPath(); c.arc(-4, -4, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = INK; for (const [hx, hy] of [[3, -5], [6, -1], [2, 0]]) { c.beginPath(); c.arc(hx, hy, 1.8, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
};

/** The wax's shine (glints sliding over the parquet). */
const wax = (c: Ctx, state: GameState) => {
  const a = X(WAX[0]), b = X(WAX[1]), f = state.frame;
  if (!onScreen(state, a, b)) return;
  for (let k = 0; k < 6; k++) { const x = a + ((k * 173 + f * 2) % (b - a)), w = 30 + (k % 3) * 20; c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(x, GY + 3, w, 2); c.fillRect(x + 6, GY + 7, w * 0.6, 1); }
  // (the yellow A-frame: CAUTION JUST WAXED)
  const sx = X(WAX[0] - 30);
  stamp(c, 'wh-waxsign', sx - 30, GY - 70, 60, 72, g => {
    inked(g, () => { g.moveTo(30 - 28, 70); g.lineTo(30 - 24, 4); g.lineTo(30 + 24, 4); g.lineTo(30 + 28, 70); g.closePath(); }, '#FACC15', 3);
    signText(g, 'CAUTION', 30, 26, { sx: 1, sy: 1, fill: '#111827' });
    signText(g, 'JUST', 30, 40, { sx: 1, sy: 1, fill: '#111827' });
    signText(g, 'WAXED', 30, 52, { sx: 1, sy: 1, fill: '#111827' });
  });
};

// ---------------------------------------------------------------------------------------------------------------

/** Screen space: the sky (the garden and the balcony are outdoors; the rooms cover it). */
export const drawWhBackdrop = (c: Ctx, state: GameState) => toonSky(c, state, null, { hill: '#A7D8A0' });

/** World space, behind him: the rooms, the outdoors, everything he stands on, the hazards. */
export const drawWhBack = (c: Ctx, state: GameState) => {
  const E = eyeOf(state);
  outdoors(c, state, E);
  for (const r of ROOMS) if (!r.outdoors) room(c, state, E, r);
  // (the floor's front edge: the ground floor's lit lip, the garden's)
  const x0 = X(-200), x1 = X(STAIRS.a);
  box(c, x0, GY, x1 - x0, 60, '#6B3A20'); box(c, x0, GY, x1 - x0, 3, '#FFFBEB');
  box(c, X(BALCONY_EDGE), GY, X(12200) - X(BALCONY_EDGE), 60, '#3F7D3A'); box(c, X(BALCONY_EDGE), GY, X(12200) - X(BALCONY_EDGE), 3, '#BBF7D0');
  stairs(c, state);
  if (onScreen(state, X(PIANO.a) - 300, X(RISER.b) + 100)) { piano(c); chairStack(c); }
  wax(c, state);
  if (onScreen(state, X(PEROT_ARENA.a), X(PEROT_ARENA.b))) {
    podium(c);
    for (const [a, b, h] of PEROT_ARENA.ledges) { inked(c, () => c.roundRect(X(a), Y(h), b - a, 14, 4), '#E2B33C', 3); box(c, X(a) + 2, Y(h), b - a - 4, 2, '#FFFBEB'); for (const x of [X(a) + 10, X(b) - 16]) inked(c, () => c.rect(x, Y(h) + 14, 6, 26), '#B8862E', 2); }
  }
  if (onScreen(state, X(SIDEBOARD.a) - 100, X(TABLE.b) + 100)) dining(c, state);
  if (onScreen(state, X(FALWELL_ARENA.a), X(FALWELL_ARENA.b))) {
    bed(c);
    for (const [a, b, h] of FALWELL_ARENA.ledges) { inked(c, () => c.roundRect(X(a), Y(h), b - a, 14, 4), '#7C3A1E', 3); box(c, X(a) + 2, Y(h), b - a - 4, 2, '#FFFBEB'); for (const x of [X(a) + 12, X(b) - 18]) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x, Y(h) + 14); c.lineTo(x + 6, Y(h) + 34); c.stroke(); } }
  }
  garden(c, state);
  for (const [x, h, words] of PLACARDS) if (onScreen(state, X(x) - 90, X(x) + 90)) placard(c, X(x), Y(h), words);
  if (onScreen(state, X(11700), X(12100))) toonSign(c, X(11920), GY, ['TO THE', 'WEST WING >'], { board: '#1D4ED8' });
  hazards(c, state);
};

/** World space, in front: the entrance's title banner, hung off the ceiling on its ropes. */
export const drawWhFront = (c: Ctx, state: GameState) => {
  const x = X(560), top = Y(CEIL1);
  if (!onScreen(state, x - 220, x + 220)) return;
  stamp(c, 'wh-banner', x - 210, top - 4, 420, 140, g => {
    const ox = 210, oy = 4;
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(ox - 170, oy); g.lineTo(ox - 160, oy + 40); g.moveTo(ox + 170, oy); g.lineTo(ox + 160, oy + 40); g.stroke();
    inked(g, () => { g.moveTo(ox - 196, oy + 40); g.quadraticCurveTo(ox, oy + 30, ox + 196, oy + 40); g.lineTo(ox + 186, oy + 120); g.quadraticCurveTo(ox, oy + 132, ox - 186, oy + 120); g.closePath(); }, '#1D4ED8', 4);
    inked(g, () => { g.moveTo(ox - 184, oy + 48); g.quadraticCurveTo(ox, oy + 39, ox + 184, oy + 48); g.lineTo(ox + 176, oy + 112); g.quadraticCurveTo(ox, oy + 123, ox - 176, oy + 112); g.closePath(); }, '#DC2626', 2);
    signText(g, "CHELSEA & SOCKS'", ox, oy + 70, toonLetters(2));
    signText(g, 'WACKY WHITE HOUSE ADVENTURES!', ox, oy + 98, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDE68A', '#FDE047']));
    for (const s of [-1, 1]) { g.fillStyle = '#FFFFFF'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4 : 9; g.lineTo(ox + s * 160 + Math.cos(a) * r, oy + 84 + Math.sin(a) * r); } g.closePath(); g.fill(); }
  });
};
