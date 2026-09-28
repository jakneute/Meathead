// Drawing what's along the streets (see streets.ts for the plan): the painted
// ladies, shops with awnings, taquerias under papel picado and murals, glass
// startup boxes, Chinatown's red-trimmed buildings and lanterns strung over the
// street, parks at the tops of hills, and cross streets with their signs. Each
// sits on the lowest point of the ground under it (they step up the hills).

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH } from '../../../constants';
import { COURSE } from './course';
import { lotAt, LOT_W, Lot, groundUnder as groundAt, lotBase } from './streets';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const groundUnder = (state: GameState, x: number) => groundAt(state.groundRuns, x);

const PAINT = ['#F4A6B5', '#9FD8CB', '#F7D08A', '#B6A4E0', '#F2B880', '#A8D5F2', '#E8E1C8', '#C9E4A8', '#F9C6A8'];
const TRIM = '#FFFBEB', SHADE = 'rgba(0,0,0,0.18)';
const lit = (n: number) => (hash(n) > 0.55 ? '#FDE68A' : '#2A2F3A');

/** How tall a lot's building is (not counting a gable); nothing on a park or a cross street. */
const lotHeight = (kind: Lot['kind'], i: number) => {
  switch (kind) {
    case 'victorian': return 330 + Math.floor(hash(i + 1) * 70);
    case 'shop': return 250 + Math.floor(hash(i + 4) * 30);
    case 'taqueria': return 240;
    case 'glass': return 520 + Math.floor(hash(i + 6) * 80);
    case 'chinatown': return 300 + Math.floor(hash(i + 8) * 50);
    default: return 0;
  }
};

/** The top of the building on the lot next door (for a cross street's walls to meet), or a middling height if there isn't one. */
const neighborTop = (state: GameState, x: number, fallback: number) => {
  const n = lotAt(x);
  if (!n) return fallback - 280;
  const h = lotHeight(n.kind, n.i);
  return lotBase(state.groundRuns, n) - (h || 280);
};

/** Everything along the streets in view (it shakes in a quake: `shake` is how hard). */
export const drawDistricts = (ctx: Ctx, state: GameState, shake: number) => {
  const S = COURSE.streets;
  const i0 = Math.floor((state.camera.x - 250 - S.x1) / LOT_W), i1 = Math.floor((state.camera.x + CANVAS_WIDTH + 250 - S.x1) / LOT_W);
  const lots: { lot: Lot; base: number }[] = [];
  for (let i = Math.max(0, i0); i <= i1; i++) {
    const lot = lotAt(S.x1 + i * LOT_W + 1);
    if (!lot) continue;
    lots.push({ lot, base: lotBase(state.groundRuns, lot) });
  }
  for (const { lot, base } of lots) {
    const wob = shake > 0 ? Math.sin(state.frame * 0.9 + lot.i * 2) * shake * 2 : 0;
    const x = lot.x + wob, w = LOT_W - 4, f = state.frame;
    switch (lot.kind) {
      case 'victorian': drawVictorian(ctx, x, w, base, lot.i); break;
      case 'shop': drawShop(ctx, x, w, base, lot); break;
      case 'taqueria': drawTaqueria(ctx, x, w, base, lot, f); break;
      case 'glass': drawGlass(ctx, x, w, base, lot, f); break;
      case 'chinatown': drawChinatown(ctx, x, w, base, lot); break;
      case 'park': drawPark(ctx, lot.x, LOT_W, state, lot); break;
      case 'cross': drawCross(ctx, lot.x, LOT_W, state, lot, f); break;
    }
  }
  // Lanterns strung across the street between the Chinatown buildings
  for (let n = 0; n + 1 < lots.length; n++) {
    const a = lots[n], b = lots[n + 1];
    if (a.lot.kind !== 'chinatown' || b.lot.kind !== 'chinatown') continue;
    const x1 = a.lot.x + LOT_W * 0.5, x2 = b.lot.x + LOT_W * 0.5, y1 = a.base - 250, y2 = b.base - 250;
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + 40, x2, y2); ctx.stroke();
    for (let k = 1; k < 5; k++) {
      const t = k / 5, lx = x1 + (x2 - x1) * t, ly = y1 + (y2 - y1) * t + 4 * 40 * t * (1 - t) * 0.5 * 2 + Math.sin(state.frame * 0.05 + k) * 2;
      ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.ellipse(lx, ly + 10, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FACC15'; ctx.fillRect(lx - 6, ly, 12, 2); ctx.fillRect(lx - 6, ly + 19, 12, 2); ctx.fillRect(lx - 1, ly + 21, 2, 6);
    }
  }
};

// ---------------------------------------------------------------------------

/** A painted lady: garage and stoop, a bay window up two floors, sills with pots, a cornice (and a gable on some). */
const drawVictorian = (ctx: Ctx, x: number, w: number, base: number, i: number) => {
  const c = PAINT[Math.floor(hash(i) * PAINT.length)];
  const h = lotHeight('victorian', i);
  const top = base - h;
  ctx.fillStyle = c; ctx.fillRect(x, top, w, h);
  ctx.fillStyle = SHADE; ctx.fillRect(x + w - 8, top, 8, h);
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; for (let y = top + 8; y < base; y += 8) ctx.fillRect(x, y, w, 1);
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(x + w * 0.52, base - 74, w * 0.4, 74);
  ctx.fillStyle = '#D6D3D1'; for (let y = base - 66; y < base; y += 12) ctx.fillRect(x + w * 0.52 + 4, y, w * 0.4 - 8, 2);
  ctx.fillStyle = '#A8A29E';
  for (let s = 0; s < 6; s++) ctx.fillRect(x + 10 + s * 5, base - 12 * (s + 1), 44 - s * 5, 12);
  ctx.fillStyle = '#7C2D12'; ctx.fillRect(x + 26, base - 128, 26, 56);
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(x + 30, base - 124, 18, 10);
  const bx = x + w * 0.48, bw = w * 0.46;
  ctx.fillStyle = SHADE; ctx.fillRect(bx + 4, base - 330, bw, 232);
  ctx.fillStyle = c; ctx.fillRect(bx, base - 334, bw, 232);
  ctx.fillStyle = TRIM; ctx.fillRect(bx - 3, base - 340, bw + 6, 8); ctx.fillRect(bx - 3, base - 104, bw + 6, 6); ctx.fillRect(bx - 3, base - 222, bw + 6, 5);
  for (const fy of [base - 206, base - 320]) {
    for (let k = 0; k < 3; k++) {
      const wx = bx + 6 + k * (bw - 12) / 3;
      ctx.fillStyle = TRIM; ctx.fillRect(wx - 2, fy - 2, (bw - 12) / 3 - 2, 88);
      ctx.fillStyle = lit(i * 3 + k + fy); ctx.fillRect(wx + 2, fy + 2, (bw - 12) / 3 - 10, 80);
    }
  }
  for (const sill of [base - 190, base - 310]) {
    ctx.fillStyle = TRIM; ctx.fillRect(x + 10, sill - 66, 40, 66);
    ctx.fillStyle = lit(i * 5 + sill); ctx.fillRect(x + 14, sill - 62, 32, 58);
    // (the pots on the sills are the quake's: see streets.ts, drawn with everything else that's loose)
    ctx.fillStyle = TRIM; ctx.fillRect(x + 12, sill - 34, 36, 3); ctx.fillRect(x + 6, sill, 48, 5);
  }
  ctx.fillStyle = TRIM; ctx.fillRect(x - 4, top - 10, w + 8, 12);
  for (let bxx = x + 4; bxx < x + w; bxx += 16) ctx.fillRect(bxx, top + 2, 5, 8);
  if (hash(i + 9) > 0.5) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - 4, top - 10); ctx.lineTo(x + w / 2, top - 70); ctx.lineTo(x + w + 4, top - 10); ctx.fill();
    ctx.strokeStyle = TRIM; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = TRIM; ctx.beginPath(); ctx.arc(x + w / 2, top - 34, 10, 0, Math.PI * 2); ctx.fill();
  }
};

/** Two floors: a shopfront (big window, a striped awning, the sign) and a flat upstairs over it. */
const drawShop = (ctx: Ctx, x: number, w: number, base: number, lot: Lot) => {
  const c = ['#7C3AED', '#0F766E', '#B45309', '#BE185D', '#1D4ED8', '#4D7C0F'][Math.floor(hash(lot.i + 3) * 6)];
  const h = lotHeight(lot.kind, lot.i), top = base - h;
  ctx.fillStyle = c; ctx.fillRect(x, top, w, h);
  ctx.fillStyle = SHADE; ctx.fillRect(x + w - 8, top, 8, h);
  // Parapet
  ctx.fillStyle = '#E7E5E4'; ctx.fillRect(x - 3, top - 8, w + 6, 10);
  // Upstairs windows
  for (let k = 0; k < 3; k++) {
    const wx = x + 12 + k * (w - 24) / 3;
    ctx.fillStyle = TRIM; ctx.fillRect(wx - 2, base - 236, (w - 24) / 3 - 6, 62);
    ctx.fillStyle = lit(lot.i * 11 + k); ctx.fillRect(wx + 2, base - 232, (w - 24) / 3 - 14, 54);
    ctx.fillStyle = TRIM; ctx.fillRect(wx - 5, base - 170, (w - 24) / 3, 4);
  }
  // The sign board
  ctx.fillStyle = '#111827'; ctx.fillRect(x + 8, base - 150, w - 16, 24);
  ctx.fillStyle = '#FDE047'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText(lot.name, x + w / 2, base - 133, w - 24);
  ctx.textAlign = 'left';
  // Striped awning
  for (let k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? '#F8FAFC' : c; ctx.beginPath(); ctx.moveTo(x + 4 + k * (w - 8) / 8, base - 122); ctx.lineTo(x + 4 + (k + 1) * (w - 8) / 8, base - 122); ctx.lineTo(x + 4 + (k + 1) * (w - 8) / 8 + 4, base - 100); ctx.lineTo(x + 4 + k * (w - 8) / 8 + 4, base - 100); ctx.fill(); }
  // Shop window and door
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x + 10, base - 94, w * 0.55, 70);
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let k = 0; k < 3; k++) ctx.fillRect(x + 18 + k * 26, base - 60, 16, 30);
  ctx.fillStyle = '#44403C'; ctx.fillRect(x + w * 0.66, base - 90, 34, 90);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(x + w * 0.66 + 6, base - 84, 22, 36);
};

/** A taqueria: bright paint, papel picado strung across the front, a mural down the side. */
const drawTaqueria = (ctx: Ctx, x: number, w: number, base: number, lot: Lot, f: number) => {
  const h = lotHeight(lot.kind, lot.i), top = base - h;
  ctx.fillStyle = hash(lot.i) > 0.5 ? '#F59E0B' : '#10B981'; ctx.fillRect(x, top, w, h);
  ctx.fillStyle = SHADE; ctx.fillRect(x + w - 8, top, 8, h);
  // A mural: a big sun and hills and a face
  ctx.fillStyle = '#1D4ED8'; ctx.fillRect(x + 8, top + 14, w - 16, 90);
  ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.arc(x + 40, top + 50, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.moveTo(x + 8, top + 104); ctx.quadraticCurveTo(x + w / 2, top + 50, x + w - 8, top + 104); ctx.fill();
  ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.arc(x + w - 50, top + 44, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(x + w - 56, top + 40, 4, 4); ctx.fillRect(x + w - 47, top + 40, 4, 4);
  // Sign and papel picado
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 6, base - 150, w - 12, 26);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(lot.name, x + w / 2, base - 132, w - 20); ctx.textAlign = 'left';
  const flags = ['#EC4899', '#22C55E', '#F97316', '#3B82F6', '#FACC15'];
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, base - 116); ctx.quadraticCurveTo(x + w / 2, base - 100, x + w, base - 116); ctx.stroke();
  for (let k = 0; k < 8; k++) {
    const t = (k + 0.5) / 8, fx = x + w * t, fy = base - 116 + 32 * t * (1 - t) + Math.sin(f * 0.08 + k) * 1.5;
    ctx.fillStyle = flags[k % flags.length]; ctx.beginPath(); ctx.moveTo(fx - 7, fy); ctx.lineTo(fx + 7, fy); ctx.lineTo(fx + 7, fy + 12); ctx.lineTo(fx, fy + 16); ctx.lineTo(fx - 7, fy + 12); ctx.fill();
  }
  // Window with a menu, the door
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x + 10, base - 84, w * 0.5, 60);
  ctx.fillStyle = '#7C2D12'; for (let k = 0; k < 4; k++) ctx.fillRect(x + 18, base - 76 + k * 12, w * 0.3, 3);
  ctx.fillStyle = '#44403C'; ctx.fillRect(x + w * 0.66, base - 88, 34, 88);
};

/** A startup's glass box: tall, blue-green curtain wall, the logo up top, a scooter parked out front. */
const drawGlass = (ctx: Ctx, x: number, w: number, base: number, lot: Lot, f: number) => {
  const h = lotHeight(lot.kind, lot.i), top = base - h;
  const g = ctx.createLinearGradient(x, top, x + w, base);
  g.addColorStop(0, '#5EEAD4'); g.addColorStop(0.5, '#0E7490'); g.addColorStop(1, '#164E63');
  ctx.fillStyle = g; ctx.fillRect(x, top, w, h);
  // Mullions, and the sunset reflected across it
  ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
  for (let y = top + 24; y < base; y += 24) ctx.fillRect(x, y, w, 2);
  for (let k = 1; k < 5; k++) ctx.fillRect(x + (w / 5) * k, top, 2, h);
  ctx.fillStyle = 'rgba(251, 146, 60, 0.25)';
  ctx.beginPath(); ctx.moveTo(x, top + 60); ctx.lineTo(x + w, top + 10); ctx.lineTo(x + w, top + 90); ctx.lineTo(x, top + 140); ctx.fill();
  // The logo
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 10, top + 24, w - 20, 26);
  ctx.fillStyle = '#0F172A'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(lot.name, x + w / 2, top + 42, w - 28); ctx.textAlign = 'left';
  // The lobby, lit, and a scooter
  ctx.fillStyle = '#E0F2FE'; ctx.fillRect(x + 12, base - 80, w - 24, 80);
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(x + 40, base - 40, 30, 40); // (a sculpture of some kind)
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + w - 40, base - 2); ctx.lineTo(x + w - 14, base - 2); ctx.moveTo(x + w - 18, base - 2); ctx.lineTo(x + w - 22, base - 30); ctx.lineTo(x + w - 30, base - 30); ctx.stroke();
  ctx.fillStyle = '#22C55E'; ctx.beginPath(); ctx.arc(x + w - 40, base - 3, 3, 0, Math.PI * 2); ctx.arc(x + w - 14, base - 3, 3, 0, Math.PI * 2); ctx.fill();
  void f;
};

/** Chinatown: cream and red, green-tiled eaves, balconies with railings, a vertical sign. */
const drawChinatown = (ctx: Ctx, x: number, w: number, base: number, lot: Lot) => {
  const h = lotHeight(lot.kind, lot.i), top = base - h;
  ctx.fillStyle = hash(lot.i) > 0.5 ? '#FDE68A' : '#FECACA'; ctx.fillRect(x, top, w, h);
  ctx.fillStyle = SHADE; ctx.fillRect(x + w - 8, top, 8, h);
  // Green tiled eaves, turned up at the ends
  ctx.fillStyle = '#15803D';
  ctx.beginPath(); ctx.moveTo(x - 14, top + 4); ctx.lineTo(x - 4, top - 14); ctx.lineTo(x + w + 4, top - 14); ctx.lineTo(x + w + 14, top + 4); ctx.lineTo(x + w - 4, top - 2); ctx.lineTo(x + 4, top - 2); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x - 2, top - 2, w + 4, 6);
  // Balconies with red railings over the windows
  for (const sill of [base - 170, base - 280]) {
    for (let k = 0; k < 2; k++) {
      const wx = x + 14 + k * (w / 2);
      ctx.fillStyle = lit(lot.i * 13 + k + sill); ctx.fillRect(wx, sill - 58, w / 2 - 28, 54);
    }
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(x + 4, sill, w - 8, 4);
    for (let rx = x + 6; rx < x + w - 6; rx += 8) ctx.fillRect(rx, sill - 16, 2, 16);
    ctx.fillRect(x + 4, sill - 18, w - 8, 3);
  }
  // Vertical sign
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x + w - 30, base - 250, 22, 110);
  ctx.fillStyle = '#FACC15'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
  lot.name.split('').slice(0, 7).forEach((ch, k) => ctx.fillText(ch, x + w - 19, base - 234 + k * 14));
  ctx.textAlign = 'left';
  // Shopfront
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + 6, base - 100, w - 12, 100);
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x + 14, base - 90, w * 0.5, 60);
  ctx.fillStyle = '#B45309'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x + 30 + k * 22, base - 50, 7, 0, Math.PI * 2); ctx.fill(); } // (roast ducks)
};

/** A park at the top of a hill: lawn, a couple of trees, a bench, and the sky over it. */
const drawPark = (ctx: Ctx, x: number, w: number, state: GameState, lot: Lot) => {
  const g1 = groundUnder(state, x), g2 = groundUnder(state, x + w);
  ctx.fillStyle = '#4D7C0F';
  ctx.beginPath(); ctx.moveTo(x, g1 + 4); ctx.quadraticCurveTo(x + w / 2, Math.min(g1, g2) - 40, x + w, g2 + 4); ctx.lineTo(x + w, g2 + 8); ctx.lineTo(x, g1 + 8); ctx.fill();
  for (let k = 0; k < 2; k++) {
    const tx = x + 40 + k * 80 + hash(lot.i + k) * 20, ty = Math.min(g1, g2) - 20 - k * 6;
    ctx.fillStyle = '#57331F'; ctx.fillRect(tx - 4, ty - 70, 8, 72);
    ctx.fillStyle = k ? '#166534' : '#15803D';
    ctx.beginPath(); ctx.arc(tx, ty - 90, 34, 0, Math.PI * 2); ctx.arc(tx - 22, ty - 70, 24, 0, Math.PI * 2); ctx.arc(tx + 22, ty - 72, 24, 0, Math.PI * 2); ctx.fill();
  }
  if (lot.name) {
    ctx.fillStyle = '#78350F'; ctx.fillRect(x + 10, g1 - 50, 4, 50);
    ctx.fillStyle = '#166534'; ctx.fillRect(x - 10, g1 - 70, 70, 22);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(lot.name, x + 25, g1 - 56); ctx.textAlign = 'left';
  }
  // A bench
  ctx.fillStyle = '#78350F'; ctx.fillRect(x + w - 60, g2 - 22, 40, 4); ctx.fillRect(x + w - 60, g2 - 30, 40, 3);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(x + w - 58, g2 - 18, 3, 16); ctx.fillRect(x + w - 25, g2 - 18, 3, 16);
};

type Pt = [number, number];
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const quad = (ctx: Ctx, a: Pt, b: Pt, c: Pt, d: Pt) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); };

/** How far down the cross street we see (as a share of the way to the vanishing point). */
const CROSS_DEPTH = 0.62;

/**
 * A cross street, seen straight down in one-point perspective: the buildings along it either side receding to the
 * vanishing point up the hill (their windows too), its road and sidewalks running away between them, and the
 * buildings across its far end. On the near corners, the street sign and a traffic light going haywire in the quake.
 */
const drawCross = (ctx: Ctx, x: number, w: number, state: GameState, lot: Lot, f: number) => {
  const gL = groundUnder(state, x + 2), gR = groundUnder(state, x + w - 2);
  const g = Math.min(gL, gR);
  // (up the hill, above the rooftops at the far end: San Francisco's cross streets climb)
  const vp: Pt = [x + w / 2, g - 190];
  const far = (p: Pt) => lerpPt(p, vp, CROSS_DEPTH);
  const hue = PAINT[Math.floor(hash(lot.i + 31) * PAINT.length)], hue2 = PAINT[Math.floor(hash(lot.i + 37) * PAINT.length)];
  // The buildings across the far end (hazy)
  // (the walls down either side are the side walls of the buildings on the corners: the same height as them)
  const lb: Pt = [x + 1, gL], lt: Pt = [x + 1, neighborTop(state, x - 2, gL)], rb: Pt = [x + w - 1, gR], rt: Pt = [x + w - 1, neighborTop(state, x + w + 2, gR)];
  const flb = far(lb), flt = far(lt), frb = far(rb), frt = far(rt);
  ctx.fillStyle = '#6B5A7A';
  for (let k = 0; k < 3; k++) {
    const x0 = flb[0] + (frb[0] - flb[0]) * (k / 3), x1 = flb[0] + (frb[0] - flb[0]) * ((k + 1) / 3);
    const top = flt[1] + (hash(lot.i * 3 + k) - 0.3) * 30;
    ctx.fillRect(x0, top, x1 - x0 + 0.5, flb[1] - top);
    ctx.fillStyle = 'rgba(253, 230, 138, 0.55)';
    for (let wy = top + 8; wy < flb[1] - 10; wy += 14) for (let wx = x0 + 3; wx < x1 - 4; wx += 8) if (hash(wx * 3 + wy) > 0.55) ctx.fillRect(wx, wy, 3, 5);
    ctx.fillStyle = k % 2 ? '#5E4E6E' : '#6B5A7A';
  }
  // The road running away up the hill, its center line, the sidewalks either side
  const inset = 16;
  const rl: Pt = [x + inset, gL], rr: Pt = [x + w - inset, gR];
  ctx.fillStyle = '#4A494F'; quad(ctx, rl, rr, far(rr), far(rl));
  ctx.fillStyle = '#A8A29E'; quad(ctx, lb, rl, far(rl), flb); quad(ctx, rr, rb, frb, far(rr));
  ctx.fillStyle = '#FDE047';
  const cn: Pt = [x + w / 2, (gL + gR) / 2];
  for (let k = 0; k < 6; k++) {
    const t0 = (k + 0.2) / 6 * CROSS_DEPTH, t1 = (k + 0.6) / 6 * CROSS_DEPTH;
    const a = lerpPt(cn, vp, t0), b = lerpPt(cn, vp, t1);
    const hw = 1.5 * (1 - t0);
    quad(ctx, [a[0] - hw, a[1]], [a[0] + hw, a[1]], [b[0] + hw * 0.8, b[1]], [b[0] - hw * 0.8, b[1]]);
  }
  // The buildings down either side: walls receding to the far end, windows and all, in shade
  for (const [base, top, fb, ft, col, side] of [[lb, lt, flb, flt, hue, -1], [rb, rt, frb, frt, hue2, 1]] as [Pt, Pt, Pt, Pt, string, number][]) {
    ctx.fillStyle = col; quad(ctx, base, top, ft, fb);
    ctx.fillStyle = side < 0 ? 'rgba(0, 0, 0, 0.32)' : 'rgba(0, 0, 0, 0.45)'; quad(ctx, base, top, ft, fb);
    // Windows: a grid laid out along the wall (u: how far along it, v: how far up)
    const at = (u: number, v: number) => lerpPt(lerpPt(base, top, v), lerpPt(fb, ft, v), u);
    for (let u = 0.08; u < 0.9; u += 0.2) {
      for (let v = 0.3; v < 0.9; v += 0.22) {
        ctx.fillStyle = hash(lot.i * 17 + u * 50 + v * 90 + side) > 0.5 ? 'rgba(253, 230, 138, 0.75)' : 'rgba(30, 27, 38, 0.8)';
        quad(ctx, at(u, v), at(u, v + 0.12), at(u + 0.1, v + 0.12), at(u + 0.1, v));
      }
    }
    // The roofline, and the corner edge nearest us, catching the light
    ctx.strokeStyle = 'rgba(255, 251, 235, 0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(ft[0], ft[1]); ctx.moveTo(base[0], base[1]); ctx.lineTo(top[0], top[1]); ctx.stroke();
  }
  // The street sign on its pole
  const px = x + 26;
  ctx.fillStyle = '#6B7280'; ctx.fillRect(px, g - 160, 4, 160);
  ctx.fillStyle = '#166534'; ctx.fillRect(px - 44, g - 170, 96, 20);
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1; ctx.strokeRect(px - 42, g - 168, 92, 16);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(lot.name, px + 4, g - 157, 88); ctx.textAlign = 'left';
  // A traffic light on the far corner, cycling through everything at once (the quake's got into it)
  const tx = x + w - 34;
  ctx.fillStyle = '#6B7280'; ctx.fillRect(tx, g - 130, 4, 130);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(tx - 7, g - 170, 18, 44);
  const on = Math.floor(f / 10) % 3;
  ['#EF4444', '#FACC15', '#22C55E'].forEach((col, k) => { ctx.fillStyle = on === k ? col : '#3F3F46'; ctx.beginPath(); ctx.arc(tx + 2, g - 162 + k * 14, 5, 0, Math.PI * 2); ctx.fill(); });
};
