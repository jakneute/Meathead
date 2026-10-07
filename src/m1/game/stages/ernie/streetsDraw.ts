// Drawing what's along the streets (see streets.ts for the plan): the painted
// ladies, shops with awnings, taquerias under papel picado and murals, glass
// startup boxes, Chinatown's red-trimmed buildings and lanterns strung over the
// street, parks at the tops of hills, and cross streets with their signs. Each
// sits on the lowest point of the ground under it (they step up the hills).

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH } from '../../../constants';
import { COURSE } from './course';
import { lotAt, LOT_W, Lot, groundUnder as groundAt, lotBase, lotFoot } from './streets';
import { bandedGradient, checker, steppedGlow } from '../../render/pixelArt';
import { INK, ink, shaded, dark, lite } from '../../render/npc/kit';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const groundUnder = (state: GameState, x: number) => groundAt(state.groundRuns, x);

const PAINT = ['#F4A6B5', '#9FD8CB', '#F7D08A', '#B6A4E0', '#F2B880', '#A8D5F2', '#E8E1C8', '#C9E4A8', '#F9C6A8'];
const TRIM = '#FFFBEB';
const lit = (n: number) => (hash(n) > 0.55 ? '#FDE68A' : '#2A2F3A');

/** A building's front: its paint, lit down the left edge, in shadow down the right (dithered between), inked round. */
const facade = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => {
  ctx.fillStyle = INK; ctx.fillRect(x - 1, y - 1, w + 2, h + 1);
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.2); ctx.fillRect(x, y, 3, h);
  ctx.fillStyle = dark(c, 0.2); ctx.fillRect(x + w - 8, y, 8, h);
  checker(ctx, x + w - 12, y, 4, h, dark(c, 0.2));
};

/** A strip of trim: cream, lit along the top, a shadow line under it. */
const trim = (ctx: Ctx, x: number, y: number, w: number, h: number, c = TRIM) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, w, 1);
  if (h >= 3) { ctx.fillStyle = dark(c, 0.18); ctx.fillRect(x, y + h - 1, w, 1); }
  if (h >= 4) { ctx.fillStyle = INK; ctx.fillRect(x, y + h, w, 1); }
};

/** A pane of glass, lit from inside (warm, brighter up top) or dark (the evening sky caught in it); the frame's shadow along its top and left. */
const pane = (ctx: Ctx, x: number, y: number, w: number, h: number, glass: string) => {
  if (w <= 0 || h <= 0) return;
  const on = glass !== '#2A2F3A';
  ctx.fillStyle = glass; ctx.fillRect(x, y, w, h);
  if (on) {
    ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x, y, w, Math.round(h * 0.35));
    checker(ctx, x, y + Math.round(h * 0.35), w, 2, '#FEF3C7');
    ctx.fillStyle = '#E8B84A'; ctx.fillRect(x, y + h - 3, w, 3);
  } else {
    ctx.fillStyle = '#4A3A5A'; ctx.fillRect(x, y, w, Math.round(h * 0.3));
    checker(ctx, x, y + Math.round(h * 0.3), w, 2, '#4A3A5A');
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'; ctx.fillRect(x + w * 0.2, y + 2, 2, h - 4); ctx.fillRect(x + w * 0.2 + 4, y + 2, 1, h * 0.5);
  }
  ctx.fillStyle = 'rgba(26, 11, 6, 0.45)'; ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y, 2, h);
};

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
  const lots: { lot: Lot; base: number; foot: number }[] = [];
  for (let i = Math.max(0, i0); i <= i1; i++) {
    const lot = lotAt(S.x1 + i * LOT_W + 1);
    if (!lot) continue;
    lots.push({ lot, base: lotBase(state.groundRuns, lot), foot: lotFoot(state.groundRuns, lot) });
  }
  // Behind them: the party walls where one meets the next (a row here is built wall to wall, nothing to see between),
  // and a building's side wall where it meets a cross street's corner
  for (let n = 0; n + 1 < lots.length; n++) {
    const a = lots[n], b = lots[n + 1];
    const ab = BUILT.has(a.lot.kind), bb = BUILT.has(b.lot.kind);
    if (!(ab && (bb || b.lot.kind === 'cross')) && !(bb && a.lot.kind === 'cross')) continue;
    const ta = ab ? a.base - lotHeight(a.lot.kind, a.lot.i) : Infinity, tb = bb ? b.base - lotHeight(b.lot.kind, b.lot.i) : Infinity;
    const top = ab && bb ? Math.max(ta, tb) : Math.min(ta, tb), gx = b.lot.x - 7, bottom = Math.max(a.foot, b.foot) + 12;
    ctx.fillStyle = INK; ctx.fillRect(gx, top, 10, bottom - top);
    ctx.fillStyle = '#2A2230'; ctx.fillRect(gx + 1, top + 2, 8, bottom - top - 2);
  }
  // Up a hill, each one's foundation: from the house level down to the street on the downhill side
  for (const { lot, base, foot } of lots) if (BUILT.has(lot.kind) && foot > base) drawFoundation(ctx, lot.x, LOT_W - 4, base, foot, lot.i);
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
      // (paper lit from inside: its ribs, a bright middle, the gold caps and tassel)
      steppedGlow(ctx, lx, ly + 10, 18, '#FCA5A5', 0.18, 0.02, 3);
      shaded(ctx, () => ctx.ellipse(lx, ly + 10, 8, 10, 0, 0, Math.PI * 2), '#DC2626', lx - 8, ly, 16, 20);
      ctx.fillStyle = '#F87171'; ctx.fillRect(lx - 3, ly + 5, 4, 8);
      ctx.fillStyle = '#991B1B'; ctx.fillRect(lx - 7, ly + 9, 14, 1); ctx.fillRect(lx - 6, ly + 14, 12, 1);
      ink(ctx, () => { ctx.rect(lx - 6, ly, 12, 2); ctx.rect(lx - 6, ly + 19, 12, 2); }, '#FACC15', 0.6);
      ctx.fillStyle = '#FACC15'; ctx.fillRect(lx - 1, ly + 21, 2, 6); ctx.fillStyle = '#CA8A04'; ctx.fillRect(lx, ly + 21, 1, 6);
    }
  }
};

/** The lots with a building on them (the rest are a park or a cross street). */
const BUILT = new Set<Lot['kind']>(['victorian', 'shop', 'taqueria', 'glass', 'chinatown']);

/**
 * A building's foundation up a hill: the concrete under it, from its floor (base) down to the street at its downhill
 * end (foot), in board-formed courses, a vent or two, darker toward the street. No lit edge along the top: it's the
 * house's, not something to stand on.
 */
const drawFoundation = (ctx: Ctx, x: number, w: number, base: number, foot: number, i: number) => {
  const h = foot - base + 14;
  ctx.fillStyle = INK; ctx.fillRect(x - 1, base - 2, w + 2, h + 2);
  ctx.fillStyle = '#665F5A'; ctx.fillRect(x, base, w, h);
  ctx.fillStyle = '#57504C'; ctx.fillRect(x, base + Math.round(h / 2), w, h - Math.round(h / 2));
  // (the board-formed courses, each one's shadow under its lip)
  for (let y = base + 9; y < base + h; y += 9) { ctx.fillStyle = '#4A4440'; ctx.fillRect(x, y, w, 1); ctx.fillStyle = '#7A726B'; ctx.fillRect(x, y + 1, w, 1); }
  // (shaded down the right like the house over it, the shadow of the house along the top)
  ctx.fillStyle = 'rgba(30, 20, 30, 0.3)'; ctx.fillRect(x + w - 10, base, 10, h);
  ctx.fillStyle = 'rgba(20, 12, 20, 0.45)'; ctx.fillRect(x, base, w, 3);
  // A vent or two (dark, barred)
  if (h > 26) for (let k = 0; k < 2; k++) {
    const vx = Math.round(x + 18 + k * (w * 0.5) + hash(i * 3 + k) * 20), vy = base + 8;
    ctx.fillStyle = INK; ctx.fillRect(vx - 1, vy - 1, 16, 9);
    ctx.fillStyle = '#1E1A1E'; ctx.fillRect(vx, vy, 14, 7);
    ctx.fillStyle = '#5A5450'; ctx.fillRect(vx + 3, vy, 1, 7); ctx.fillRect(vx + 7, vy, 1, 7); ctx.fillRect(vx + 11, vy, 1, 7);
  }
};

// ---------------------------------------------------------------------------

/** A painted lady: garage and stoop, a bay window up two floors, sills with pots, a cornice (and a gable on some). */
const drawVictorian = (ctx: Ctx, x: number, w: number, base: number, i: number) => {
  const c = PAINT[Math.floor(hash(i) * PAINT.length)];
  const h = lotHeight('victorian', i);
  const top = base - h;
  facade(ctx, x, top, w, h, c);
  // (the clapboard: each board's shadow under its lip)
  ctx.fillStyle = dark(c, 0.08); for (let y = top + 8; y < base; y += 8) ctx.fillRect(x + 3, y, w - 11, 1);
  ctx.fillStyle = lite(c, 0.12); for (let y = top + 9; y < base; y += 8) ctx.fillRect(x + 3, y, w - 11, 1);
  // The garage door, in panels
  const gx = x + w * 0.52, gw = w * 0.4;
  ctx.fillStyle = INK; ctx.fillRect(gx - 1, base - 75, gw + 2, 75);
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(gx, base - 74, gw, 74);
  ctx.fillStyle = '#D6D3D1'; for (let y = base - 66; y < base; y += 12) ctx.fillRect(gx + 4, y, gw - 8, 2);
  ctx.fillStyle = '#FFFFFF'; for (let y = base - 64; y < base; y += 12) ctx.fillRect(gx + 4, y, gw - 8, 1);
  ctx.fillStyle = '#C4BFBA'; ctx.fillRect(gx + gw - 4, base - 74, 4, 74);
  // The stoop: each step lit along its tread, inked
  for (let s = 0; s < 6; s++) {
    const sx = x + 10 + s * 5, sy = base - 12 * (s + 1), sw = 44 - s * 5;
    ctx.fillStyle = INK; ctx.fillRect(sx - 1, sy - 1, sw + 1, 13);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(sx, sy, sw, 12);
    ctx.fillStyle = '#D6D3D1'; ctx.fillRect(sx, sy, sw, 2);
    ctx.fillStyle = '#78716C'; ctx.fillRect(sx, sy + 10, sw, 2);
  }
  // The front door (panels, the transom lit over it)
  ctx.fillStyle = INK; ctx.fillRect(x + 25, base - 129, 28, 58);
  ctx.fillStyle = '#7C2D12'; ctx.fillRect(x + 26, base - 128, 26, 56);
  ctx.fillStyle = '#9A3B1A'; ctx.fillRect(x + 26, base - 128, 3, 56);
  ctx.fillStyle = '#5C1F0C'; ctx.fillRect(x + 30, base - 110, 8, 16); ctx.fillRect(x + 41, base - 110, 8, 16); ctx.fillRect(x + 30, base - 90, 8, 14); ctx.fillRect(x + 41, base - 90, 8, 14);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x + 46, base - 96, 2, 2);
  pane(ctx, x + 30, base - 124, 18, 10, '#FDE68A');
  // The bay window, standing out from the front: its shadow on the wall, lit down its left side
  const bx = x + w * 0.48, bw = w * 0.46;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'; ctx.fillRect(bx + 4, base - 330, bw, 232);
  checker(ctx, bx + bw, base - 330, 4, 232, 'rgba(0, 0, 0, 0.18)');
  ctx.fillStyle = INK; ctx.fillRect(bx - 1, base - 335, bw + 2, 234);
  ctx.fillStyle = c; ctx.fillRect(bx, base - 334, bw, 232);
  ctx.fillStyle = lite(c, 0.25); ctx.fillRect(bx, base - 334, 4, 232);
  ctx.fillStyle = dark(c, 0.15); ctx.fillRect(bx + bw - 4, base - 334, 4, 232);
  trim(ctx, bx - 3, base - 340, bw + 6, 8); trim(ctx, bx - 3, base - 104, bw + 6, 6); trim(ctx, bx - 3, base - 222, bw + 6, 5);
  for (const fy of [base - 206, base - 320]) {
    for (let k = 0; k < 3; k++) {
      const wx = bx + 6 + k * (bw - 12) / 3, ww = (bw - 12) / 3 - 2;
      ctx.fillStyle = TRIM; ctx.fillRect(wx - 2, fy - 2, ww, 88);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(wx - 2, fy - 2, 1, 88);
      ctx.fillStyle = INK; ctx.fillRect(wx - 3, fy - 3, ww + 2, 1); ctx.fillRect(wx - 3, fy + 86, ww + 2, 1);
      pane(ctx, wx + 2, fy + 2, ww - 8, 80, lit(i * 3 + k + fy));
      ctx.fillStyle = TRIM; ctx.fillRect(wx + 2, fy + 40, ww - 8, 2);
    }
  }
  for (const sill of [base - 190, base - 310]) {
    ctx.fillStyle = INK; ctx.fillRect(x + 9, sill - 67, 42, 68);
    ctx.fillStyle = TRIM; ctx.fillRect(x + 10, sill - 66, 40, 66);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 10, sill - 66, 40, 1); ctx.fillRect(x + 10, sill - 66, 1, 66);
    pane(ctx, x + 14, sill - 62, 32, 58, lit(i * 5 + sill));
    // (the pots on the sills are the quake's: see streets.ts, drawn with everything else that's loose)
    trim(ctx, x + 12, sill - 34, 36, 3); trim(ctx, x + 6, sill, 48, 5);
  }
  // The cornice and its brackets
  trim(ctx, x - 4, top - 10, w + 8, 12);
  for (let bxx = x + 4; bxx < x + w; bxx += 16) { ctx.fillStyle = TRIM; ctx.fillRect(bxx, top + 2, 5, 8); ctx.fillStyle = '#D6CFB8'; ctx.fillRect(bxx + 3, top + 2, 2, 8); ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; ctx.fillRect(bxx + 5, top + 3, 2, 8); }
  if (hash(i + 9) > 0.5) {
    const gable = () => { ctx.beginPath(); ctx.moveTo(x - 4, top - 10); ctx.lineTo(x + w / 2, top - 70); ctx.lineTo(x + w + 4, top - 10); ctx.closePath(); };
    gable(); ctx.fillStyle = c; ctx.fill();
    ctx.save(); gable(); ctx.clip();
    ctx.fillStyle = dark(c, 0.08); for (let y = top - 66; y < top - 10; y += 6) ctx.fillRect(x - 4, y, w + 8, 1);
    ctx.fillStyle = dark(c, 0.18); ctx.fillRect(x + w / 2 + 20, top - 70, w, 60);
    ctx.restore();
    gable(); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = TRIM; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + w / 2, top - 34, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = TRIM; ctx.beginPath(); ctx.arc(x + w / 2, top - 34, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = lit(i * 7 + 2) === '#FDE68A' ? '#FDE68A' : '#4A3A5A'; ctx.beginPath(); ctx.arc(x + w / 2, top - 34, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = TRIM; ctx.fillRect(x + w / 2 - 1, top - 40, 2, 12); ctx.fillRect(x + w / 2 - 6, top - 35, 12, 2);
  }
};

/** Two floors: a shopfront (big window, a striped awning, the sign) and a flat upstairs over it. */
const drawShop = (ctx: Ctx, x: number, w: number, base: number, lot: Lot) => {
  const c = ['#7C3AED', '#0F766E', '#B45309', '#BE185D', '#1D4ED8', '#4D7C0F'][Math.floor(hash(lot.i + 3) * 6)];
  const h = lotHeight(lot.kind, lot.i), top = base - h;
  facade(ctx, x, top, w, h, c);
  // (stucco: a speckle of light and dark)
  for (let k = 0; k < 24; k++) { ctx.fillStyle = k % 2 ? lite(c, 0.12) : dark(c, 0.12); ctx.fillRect(x + 4 + Math.round(hash(lot.i * 31 + k) * (w - 16)), top + 12 + Math.round(hash(lot.i * 37 + k) * (h - 140)), 2, 2); }
  // Parapet
  trim(ctx, x - 3, top - 8, w + 6, 10, '#E7E5E4');
  ctx.fillStyle = INK; ctx.fillRect(x - 4, top - 9, w + 8, 1);
  // Upstairs windows
  for (let k = 0; k < 3; k++) {
    const wx = x + 12 + k * (w - 24) / 3, ww = (w - 24) / 3 - 6;
    ctx.fillStyle = INK; ctx.fillRect(wx - 3, base - 237, ww + 2, 64);
    ctx.fillStyle = TRIM; ctx.fillRect(wx - 2, base - 236, ww, 62);
    pane(ctx, wx + 2, base - 232, (w - 24) / 3 - 14, 54, lit(lot.i * 11 + k));
    ctx.fillStyle = TRIM; ctx.fillRect(wx + 2, base - 206, (w - 24) / 3 - 14, 2);
    trim(ctx, wx - 5, base - 170, (w - 24) / 3, 4);
  }
  // The sign board
  ctx.fillStyle = INK; ctx.fillRect(x + 7, base - 151, w - 14, 26);
  ctx.fillStyle = '#111827'; ctx.fillRect(x + 8, base - 150, w - 16, 24);
  ctx.fillStyle = '#374151'; ctx.fillRect(x + 8, base - 150, w - 16, 2);
  ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = '#92400E'; ctx.fillText(lot.name, x + w / 2 + 1, base - 132, w - 24);
  ctx.fillStyle = '#FDE047'; ctx.fillText(lot.name, x + w / 2, base - 133, w - 24);
  ctx.textAlign = 'left';
  // Striped awning: each stripe lit at the top, its scalloped hem in shadow, inked
  for (let k = 0; k < 8; k++) {
    const a0 = x + 4 + k * (w - 8) / 8, a1 = x + 4 + (k + 1) * (w - 8) / 8, sc = k % 2 ? '#F8FAFC' : c;
    ctx.fillStyle = sc; ctx.beginPath(); ctx.moveTo(a0, base - 122); ctx.lineTo(a1, base - 122); ctx.lineTo(a1 + 4, base - 100); ctx.lineTo(a0 + 4, base - 100); ctx.fill();
    ctx.fillStyle = lite(sc, 0.25); ctx.beginPath(); ctx.moveTo(a0, base - 122); ctx.lineTo(a1, base - 122); ctx.lineTo(a1 + 1, base - 117); ctx.lineTo(a0 + 1, base - 117); ctx.fill();
    ctx.fillStyle = dark(sc, 0.2); ctx.fillRect(a0 + 3.5, base - 104, a1 - a0, 4);
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 4, base - 122); ctx.lineTo(x + w - 4, base - 122); ctx.lineTo(x + w, base - 100); ctx.lineTo(x + 8, base - 100); ctx.closePath(); ctx.stroke();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; ctx.fillRect(x + 8, base - 99, w - 12, 6); checker(ctx, x + 8, base - 93, w - 12, 2, 'rgba(0, 0, 0, 0.2)');
  // Shop window (the goods in it) and door
  ctx.fillStyle = INK; ctx.fillRect(x + 9, base - 95, w * 0.55 + 2, 72);
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x + 10, base - 94, w * 0.55, 70);
  ctx.fillStyle = '#FFFBEB'; ctx.fillRect(x + 10, base - 94, w * 0.55, 18);
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let k = 0; k < 3; k++) ctx.fillRect(x + 18 + k * 26, base - 60, 16, 30);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 0; k < 3; k++) ctx.fillRect(x + 30 + k * 26, base - 60, 4, 30);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fillRect(x + 14, base - 90, 2, 20); ctx.fillRect(x + 18, base - 90, 1, 10);
  ctx.fillStyle = INK; ctx.fillRect(x + w * 0.66 - 1, base - 91, 36, 91);
  ctx.fillStyle = '#44403C'; ctx.fillRect(x + w * 0.66, base - 90, 34, 90);
  ctx.fillStyle = '#57534E'; ctx.fillRect(x + w * 0.66, base - 90, 3, 90);
  pane(ctx, x + w * 0.66 + 6, base - 84, 22, 36, '#2A2F3A');
  ctx.fillStyle = '#93C5FD'; ctx.globalAlpha = 0.35; ctx.fillRect(x + w * 0.66 + 6, base - 84, 22, 36); ctx.globalAlpha = 1;
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x + w * 0.66 + 28, base - 44, 3, 2);
};

/** A taqueria: bright paint, papel picado strung across the front, a mural down the side. */
const drawTaqueria = (ctx: Ctx, x: number, w: number, base: number, lot: Lot, f: number) => {
  const h = lotHeight(lot.kind, lot.i), top = base - h;
  facade(ctx, x, top, w, h, hash(lot.i) > 0.5 ? '#F59E0B' : '#10B981');
  // A mural: a big sun and hills and a face (painted flat, in steps)
  ctx.fillStyle = INK; ctx.fillRect(x + 7, top + 13, w - 14, 92);
  bandedGradient(ctx, x + 8, top + 14, w - 16, 90, ['#1E3A8A', '#1D4ED8', '#3B82F6'], 3);
  ctx.save(); ctx.beginPath(); ctx.rect(x + 8, top + 14, w - 16, 90); ctx.clip();
  steppedGlow(ctx, x + 40, top + 50, 34, '#FDE047', 0.4, 0.1, 3);
  ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.arc(x + 40, top + 50, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FEF9C3'; ctx.beginPath(); ctx.arc(x + 36, top + 46, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F97316'; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; ctx.fillRect(x + 40 + Math.cos(a) * 26 - 2, top + 50 + Math.sin(a) * 26 - 2, 4, 4); }
  ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.moveTo(x + 8, top + 104); ctx.quadraticCurveTo(x + w / 2, top + 50, x + w - 8, top + 104); ctx.fill();
  ctx.fillStyle = '#F87171'; ctx.beginPath(); ctx.moveTo(x + 8, top + 104); ctx.quadraticCurveTo(x + w / 2, top + 50, x + w - 8, top + 104); ctx.lineTo(x + w - 8, top + 106); ctx.quadraticCurveTo(x + w / 2, top + 54, x + 8, top + 106); ctx.fill();
  ctx.fillStyle = '#991B1B'; ctx.fillRect(x + 8, top + 96, w - 16, 8);
  ctx.restore();
  shaded(ctx, () => ctx.arc(x + w - 50, top + 44, 14, 0, Math.PI * 2), '#F472B6', x + w - 64, top + 30, 28, 28);
  ctx.fillStyle = '#111827'; ctx.fillRect(x + w - 56, top + 40, 4, 4); ctx.fillRect(x + w - 47, top + 40, 4, 4);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + w - 56, top + 40, 1, 1); ctx.fillRect(x + w - 47, top + 40, 1, 1);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + w - 54, top + 50, 8, 2);
  // Sign and papel picado
  ctx.fillStyle = INK; ctx.fillRect(x + 5, base - 151, w - 10, 28);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 6, base - 150, w - 12, 26);
  ctx.fillStyle = '#F87171'; ctx.fillRect(x + 6, base - 150, w - 12, 2); ctx.fillStyle = '#991B1B'; ctx.fillRect(x + 6, base - 126, w - 12, 2);
  ctx.font = 'bold 10px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = '#7F1D1D'; ctx.fillText(lot.name, x + w / 2 + 1, base - 131, w - 20);
  ctx.fillStyle = '#F8FAFC'; ctx.fillText(lot.name, x + w / 2, base - 132, w - 20); ctx.textAlign = 'left';
  const flags = ['#EC4899', '#22C55E', '#F97316', '#3B82F6', '#FACC15'];
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, base - 116); ctx.quadraticCurveTo(x + w / 2, base - 100, x + w, base - 116); ctx.stroke();
  for (let k = 0; k < 8; k++) {
    const t = (k + 0.5) / 8, fx = x + w * t, fy = base - 116 + 32 * t * (1 - t) + Math.sin(f * 0.08 + k) * 1.5;
    const flag = () => { ctx.moveTo(fx - 7, fy); ctx.lineTo(fx + 7, fy); ctx.lineTo(fx + 7, fy + 12); ctx.lineTo(fx, fy + 16); ctx.lineTo(fx - 7, fy + 12); ctx.closePath(); };
    ink(ctx, flag, flags[k % flags.length], 0.8);
    // (the cut-out pattern)
    ctx.fillStyle = dark(flags[k % flags.length], 0.35); ctx.fillRect(fx - 3, fy + 4, 2, 2); ctx.fillRect(fx + 1, fy + 4, 2, 2); ctx.fillRect(fx - 1, fy + 8, 2, 2);
    ctx.fillStyle = lite(flags[k % flags.length], 0.4); ctx.fillRect(fx - 6, fy + 1, 4, 1);
  }
  // Window with a menu, the door
  ctx.fillStyle = INK; ctx.fillRect(x + 9, base - 85, w * 0.5 + 2, 62);
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x + 10, base - 84, w * 0.5, 60);
  ctx.fillStyle = '#FFFBEB'; ctx.fillRect(x + 10, base - 84, w * 0.5, 14);
  ctx.fillStyle = '#7C2D12'; for (let k = 0; k < 4; k++) ctx.fillRect(x + 18, base - 76 + k * 12, w * 0.3, 3);
  ctx.fillStyle = '#B45309'; for (let k = 0; k < 4; k++) ctx.fillRect(x + 18 + w * 0.3 + 4, base - 76 + k * 12, 6, 3);
  ctx.fillStyle = INK; ctx.fillRect(x + w * 0.66 - 1, base - 89, 36, 89);
  ctx.fillStyle = '#44403C'; ctx.fillRect(x + w * 0.66, base - 88, 34, 88);
  ctx.fillStyle = '#57534E'; ctx.fillRect(x + w * 0.66, base - 88, 3, 88);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x + w * 0.66 + 28, base - 44, 3, 2);
};

/** A startup's glass box: tall, blue-green curtain wall, the logo up top, a scooter parked out front. */
const drawGlass = (ctx: Ctx, x: number, w: number, base: number, lot: Lot, f: number) => {
  const h = lotHeight(lot.kind, lot.i), top = base - h;
  // (the curtain wall: the sky's colors in bands down it, darker toward the street)
  ctx.fillStyle = INK; ctx.fillRect(x - 1, top - 1, w + 2, h + 1);
  bandedGradient(ctx, x, top, w, h, ['#5EEAD4', '#2DB4B0', '#0E7490', '#155E75', '#164E63'], 10);
  // Mullions, and the sunset reflected across it
  ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
  for (let y = top + 24; y < base; y += 24) ctx.fillRect(x, y, w, 2);
  for (let k = 1; k < 5; k++) ctx.fillRect(x + (w / 5) * k, top, 2, h);
  ctx.fillStyle = 'rgba(204, 251, 241, 0.35)';
  for (let y = top + 26; y < base; y += 24) ctx.fillRect(x, y, w, 1);
  for (let k = 1; k < 5; k++) ctx.fillRect(x + (w / 5) * k + 2, top, 1, h);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(x, top + 60); ctx.lineTo(x + w, top + 10); ctx.lineTo(x + w, top + 90); ctx.lineTo(x, top + 140); ctx.closePath(); ctx.clip();
  ctx.fillStyle = 'rgba(251, 146, 60, 0.25)'; ctx.fillRect(x, top, w, 140);
  ctx.fillStyle = 'rgba(253, 186, 116, 0.25)'; ctx.beginPath(); ctx.moveTo(x, top + 80); ctx.lineTo(x + w, top + 30); ctx.lineTo(x + w, top + 50); ctx.lineTo(x, top + 100); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(204, 251, 241, 0.25)'; ctx.fillRect(x, top, 3, h);
  // The logo
  ctx.fillStyle = INK; ctx.fillRect(x + 9, top + 23, w - 18, 28);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x + 10, top + 24, w - 20, 26);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x + 10, top + 48, w - 20, 2);
  ctx.fillStyle = '#0F172A'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(lot.name, x + w / 2, top + 42, w - 28); ctx.textAlign = 'left';
  // The lobby, lit, and a scooter
  ctx.fillStyle = INK; ctx.fillRect(x + 11, base - 81, w - 22, 81);
  ctx.fillStyle = '#E0F2FE'; ctx.fillRect(x + 12, base - 80, w - 24, 80);
  ctx.fillStyle = '#F0F9FF'; ctx.fillRect(x + 12, base - 80, w - 24, 20);
  ctx.fillStyle = '#BAE6FD'; ctx.fillRect(x + 12, base - 8, w - 24, 8);
  shaded(ctx, () => ctx.rect(x + 40, base - 40, 30, 40), '#94A3B8', x + 40, base - 40, 30, 40); // (a sculpture of some kind)
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + w - 40, base - 2); ctx.lineTo(x + w - 14, base - 2); ctx.moveTo(x + w - 18, base - 2); ctx.lineTo(x + w - 22, base - 30); ctx.lineTo(x + w - 30, base - 30); ctx.stroke();
  for (const sx of [x + w - 40, x + w - 14]) { ink(ctx, () => ctx.arc(sx, base - 3, 3, 0, Math.PI * 2), '#22C55E', 0.8); ctx.fillStyle = '#86EFAC'; ctx.fillRect(sx - 2, base - 5, 1, 1); }
  void f;
};

/** Chinatown: cream and red, green-tiled eaves, balconies with railings, a vertical sign. */
const drawChinatown = (ctx: Ctx, x: number, w: number, base: number, lot: Lot) => {
  const h = lotHeight(lot.kind, lot.i), top = base - h;
  facade(ctx, x, top, w, h, hash(lot.i) > 0.5 ? '#FDE68A' : '#FECACA');
  // Green tiled eaves, turned up at the ends: the tiles in rows, lit along each, inked
  const eave = () => { ctx.beginPath(); ctx.moveTo(x - 14, top + 4); ctx.lineTo(x - 4, top - 14); ctx.lineTo(x + w + 4, top - 14); ctx.lineTo(x + w + 14, top + 4); ctx.lineTo(x + w - 4, top - 2); ctx.lineTo(x + 4, top - 2); ctx.closePath(); };
  eave(); ctx.fillStyle = '#15803D'; ctx.fill();
  ctx.save(); eave(); ctx.clip();
  ctx.fillStyle = '#22C55E'; ctx.fillRect(x - 14, top - 14, w + 28, 3);
  ctx.fillStyle = '#166534'; for (let tx = x - 10; tx < x + w + 10; tx += 6) ctx.fillRect(tx, top - 11, 1, 12);
  ctx.fillStyle = '#14532D'; ctx.fillRect(x - 14, top - 4, w + 28, 4);
  ctx.restore();
  eave(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(x - 3, top - 3, w + 6, 8);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x - 2, top - 2, w + 4, 6);
  ctx.fillStyle = '#F87171'; ctx.fillRect(x - 2, top - 2, w + 4, 1); ctx.fillStyle = '#FACC15'; for (let tx = x + 4; tx < x + w; tx += 14) ctx.fillRect(tx, top, 4, 2);
  // Balconies with red railings over the windows
  for (const sill of [base - 170, base - 280]) {
    for (let k = 0; k < 2; k++) {
      const wx = x + 14 + k * (w / 2);
      ctx.fillStyle = INK; ctx.fillRect(wx - 2, sill - 60, w / 2 - 24, 58);
      ctx.fillStyle = '#B91C1C'; ctx.fillRect(wx - 1, sill - 59, w / 2 - 26, 56);
      pane(ctx, wx, sill - 58, w / 2 - 28, 54, lit(lot.i * 13 + k + sill));
    }
    ctx.fillStyle = INK; ctx.fillRect(x + 3, sill - 1, w - 6, 6);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(x + 4, sill, w - 8, 4);
    ctx.fillStyle = '#EF4444'; ctx.fillRect(x + 4, sill, w - 8, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; ctx.fillRect(x + 4, sill + 5, w - 8, 3);
    for (let rx = x + 6; rx < x + w - 6; rx += 8) { ctx.fillStyle = INK; ctx.fillRect(rx - 1, sill - 16, 4, 16); ctx.fillStyle = '#B91C1C'; ctx.fillRect(rx, sill - 16, 2, 16); ctx.fillStyle = '#EF4444'; ctx.fillRect(rx, sill - 16, 1, 16); }
    ctx.fillStyle = INK; ctx.fillRect(x + 3, sill - 19, w - 6, 5);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(x + 4, sill - 18, w - 8, 3);
    ctx.fillStyle = '#EF4444'; ctx.fillRect(x + 4, sill - 18, w - 8, 1);
  }
  // Vertical sign
  ctx.fillStyle = INK; ctx.fillRect(x + w - 31, base - 251, 24, 112);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x + w - 30, base - 250, 22, 110);
  ctx.fillStyle = '#F87171'; ctx.fillRect(x + w - 30, base - 250, 2, 110); ctx.fillStyle = '#991B1B'; ctx.fillRect(x + w - 10, base - 250, 2, 110);
  ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1; ctx.strokeRect(x + w - 27.5, base - 247.5, 17, 105);
  ctx.fillStyle = '#FACC15'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
  lot.name.split('').slice(0, 7).forEach((ch, k) => ctx.fillText(ch, x + w - 19, base - 234 + k * 14));
  ctx.textAlign = 'left';
  // Shopfront
  ctx.fillStyle = INK; ctx.fillRect(x + 5, base - 101, w - 10, 101);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + 6, base - 100, w - 12, 100);
  ctx.fillStyle = '#991B1B'; ctx.fillRect(x + 6, base - 100, w - 12, 3); ctx.fillRect(x + 6, base - 100, 3, 100);
  ctx.fillStyle = INK; ctx.fillRect(x + 13, base - 91, w * 0.5 + 2, 62);
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x + 14, base - 90, w * 0.5, 60);
  ctx.fillStyle = '#FFFBEB'; ctx.fillRect(x + 14, base - 90, w * 0.5, 12);
  ctx.fillStyle = '#44403C'; ctx.fillRect(x + 18, base - 62, w * 0.5 - 8, 1);
  for (let k = 0; k < 3; k++) { // (roast ducks)
    const dx = x + 30 + k * 22;
    ctx.fillStyle = '#44403C'; ctx.fillRect(dx - 1, base - 62, 1, 6);
    shaded(ctx, () => ctx.arc(dx, base - 50, 7, 0, Math.PI * 2), '#B45309', dx - 7, base - 57, 14, 14, 0.8);
    ctx.fillStyle = '#FDBA74'; ctx.fillRect(dx - 4, base - 54, 3, 2);
  }
};

/** A park at the top of a hill: lawn, a couple of trees, a bench, and the sky over it. */
const drawPark = (ctx: Ctx, x: number, w: number, state: GameState, lot: Lot) => {
  const g1 = groundUnder(state, x), g2 = groundUnder(state, x + w), top = Math.min(g1, g2) - 40;
  const lawn = () => { ctx.beginPath(); ctx.moveTo(x, g1 + 4); ctx.quadraticCurveTo(x + w / 2, top, x + w, g2 + 4); ctx.lineTo(x + w, g2 + 8); ctx.lineTo(x, g1 + 8); ctx.closePath(); };
  lawn(); ctx.fillStyle = '#4D7C0F'; ctx.fill();
  ctx.save(); lawn(); ctx.clip();
  // (the grass: a lit crest, tufts, darker down the far side)
  ctx.strokeStyle = '#84CC16'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, g1 + 5); ctx.quadraticCurveTo(x + w / 2, top + 1, x + w, g2 + 5); ctx.stroke();
  ctx.fillStyle = '#3F6212'; ctx.fillRect(x + w * 0.7, top, w * 0.3, Math.max(g1, g2) - top + 8);
  checker(ctx, x + w * 0.66, top, w * 0.04, Math.max(g1, g2) - top + 8, '#3F6212');
  ctx.restore();
  // (the lawn's top at a point along it: what stands on it stands on that, rise and all)
  const lawnAt = (px: number) => { const t = Math.max(0, Math.min(1, (px - x) / w)); return (1 - t) * (1 - t) * (g1 + 4) + 2 * t * (1 - t) * top + t * t * (g2 + 4); };
  for (let gx = x + 6; gx < x + w - 4; gx += 9) { const gy = Math.round(lawnAt(gx)); ctx.fillStyle = '#65A30D'; ctx.fillRect(gx, gy - 2, 1, 2); ctx.fillRect(gx + 2, gy - 3, 1, 3); }
  for (let k = 0; k < 2; k++) {
    const tx = x + 40 + k * 80 + hash(lot.i + k) * 20, ty = lawnAt(tx) + 2;
    // (the trunk, lit down its left; the canopy in clumps, each lit on top, shadowed under, inked round)
    ctx.fillStyle = INK; ctx.fillRect(tx - 5, ty - 70, 10, 72);
    ctx.fillStyle = '#57331F'; ctx.fillRect(tx - 4, ty - 70, 8, 72);
    ctx.fillStyle = '#7A4A2E'; ctx.fillRect(tx - 4, ty - 70, 2, 72); ctx.fillStyle = '#3E2416'; ctx.fillRect(tx + 2, ty - 70, 2, 72);
    const leaf = k ? '#166534' : '#15803D';
    const crown = () => { ctx.beginPath(); ctx.arc(tx, ty - 90, 34, 0, Math.PI * 2); ctx.moveTo(tx - 22 + 24, ty - 70); ctx.arc(tx - 22, ty - 70, 24, 0, Math.PI * 2); ctx.moveTo(tx + 22 + 24, ty - 72); ctx.arc(tx + 22, ty - 72, 24, 0, Math.PI * 2); };
    crown(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    crown(); ctx.fillStyle = leaf; ctx.fill();
    ctx.save(); crown(); ctx.clip();
    ctx.fillStyle = dark(leaf, 0.25); ctx.fillRect(tx - 50, ty - 72, 100, 30);
    checker(ctx, tx - 50, ty - 76, 100, 4, dark(leaf, 0.25));
    ctx.fillStyle = lite(leaf, 0.25);
    for (const [cx, cy, r] of [[tx - 10, ty - 108, 14], [tx - 30, ty - 82, 9], [tx + 14, ty - 86, 9]]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = lite(leaf, 0.45); ctx.fillRect(tx - 16, ty - 116, 6, 2); ctx.fillRect(tx - 34, ty - 88, 4, 2);
    ctx.restore();
  }
  if (lot.name) {
    ctx.fillStyle = INK; ctx.fillRect(x + 9, g1 - 50, 6, 50);
    ctx.fillStyle = '#78350F'; ctx.fillRect(x + 10, g1 - 50, 4, 50); ctx.fillStyle = '#A16207'; ctx.fillRect(x + 10, g1 - 50, 1, 50);
    ctx.fillStyle = INK; ctx.fillRect(x - 11, g1 - 71, 72, 24);
    ctx.fillStyle = '#166534'; ctx.fillRect(x - 10, g1 - 70, 70, 22);
    ctx.fillStyle = '#22863F'; ctx.fillRect(x - 10, g1 - 70, 70, 2);
    ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1; ctx.strokeRect(x - 7.5, g1 - 67.5, 65, 17);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(lot.name, x + 25, g1 - 56); ctx.textAlign = 'left';
  }
  // A bench
  const bg = Math.min(lawnAt(x + w - 57), lawnAt(x + w - 24)) + 2;
  // (each leg down to the lawn under it)
  for (const lx of [x + w - 58, x + w - 25]) { ctx.fillStyle = INK; ctx.fillRect(lx - 1, bg - 16, 5, lawnAt(lx + 1) + 2 - (bg - 16)); ctx.fillStyle = '#1C1917'; ctx.fillRect(lx, bg - 16, 3, lawnAt(lx + 1) + 2 - (bg - 16)); ctx.fillStyle = '#44403C'; ctx.fillRect(lx, bg - 16, 1, lawnAt(lx + 1) + 2 - (bg - 16)); }
  for (const [sy, sh] of [[bg - 20, 4], [bg - 28, 3]]) {
    ctx.fillStyle = INK; ctx.fillRect(x + w - 61, sy - 1, 42, sh + 2);
    ctx.fillStyle = '#78350F'; ctx.fillRect(x + w - 60, sy, 40, sh);
    ctx.fillStyle = '#A16207'; ctx.fillRect(x + w - 60, sy, 40, 1);
  }
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
  for (let k = 0; k < 3; k++) {
    const x0 = flb[0] + (frb[0] - flb[0]) * (k / 3), x1 = flb[0] + (frb[0] - flb[0]) * ((k + 1) / 3);
    const top = flt[1] + (hash(lot.i * 3 + k) - 0.3) * 30;
    const col = k % 2 ? '#5E4E6E' : '#6B5A7A';
    ctx.fillStyle = col; ctx.fillRect(x0, top, x1 - x0 + 0.5, flb[1] - top);
    ctx.fillStyle = lite(col, 0.18); ctx.fillRect(x0, top, x1 - x0 + 0.5, 2);
    ctx.fillStyle = 'rgba(253, 230, 138, 0.55)';
    for (let wy = top + 8; wy < flb[1] - 10; wy += 14) for (let wx = x0 + 3; wx < x1 - 4; wx += 8) if (hash(wx * 3 + wy) > 0.55) ctx.fillRect(wx, wy, 3, 5);
  }
  // The road running away up the hill, its center line, the sidewalks either side
  const inset = 16;
  const rl: Pt = [x + inset, gL], rr: Pt = [x + w - inset, gR];
  ctx.fillStyle = '#4A494F'; quad(ctx, rl, rr, far(rr), far(rl));
  // (the road darker the further up it goes, in steps)
  for (let k = 1; k < 4; k++) { const t0 = CROSS_DEPTH * (k / 4); ctx.fillStyle = `rgba(30, 27, 38, ${(0.08 * k).toFixed(2)})`; quad(ctx, lerpPt(rl, vp, t0), lerpPt(rr, vp, t0), far(rr), far(rl)); }
  ctx.fillStyle = '#A8A29E'; quad(ctx, lb, rl, far(rl), flb); quad(ctx, rr, rb, frb, far(rr));
  ctx.strokeStyle = '#6B6B6B'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rl[0], rl[1]); ctx.lineTo(far(rl)[0], far(rl)[1]); ctx.moveTo(rr[0], rr[1]); ctx.lineTo(far(rr)[0], far(rr)[1]); ctx.stroke();
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
        const on = hash(lot.i * 17 + u * 50 + v * 90 + side) > 0.5;
        ctx.fillStyle = 'rgba(26, 11, 6, 0.5)'; quad(ctx, at(u - 0.01, v - 0.01), at(u - 0.01, v + 0.13), at(u + 0.11, v + 0.13), at(u + 0.11, v - 0.01));
        ctx.fillStyle = on ? 'rgba(253, 230, 138, 0.75)' : 'rgba(30, 27, 38, 0.8)';
        quad(ctx, at(u, v), at(u, v + 0.12), at(u + 0.1, v + 0.12), at(u + 0.1, v));
        if (on) { ctx.fillStyle = 'rgba(254, 243, 199, 0.6)'; quad(ctx, at(u, v + 0.08), at(u, v + 0.12), at(u + 0.1, v + 0.12), at(u + 0.1, v + 0.08)); }
      }
    }
    // The roofline, and the corner edge nearest us, catching the light; the wall's foot inked
    ctx.strokeStyle = 'rgba(255, 251, 235, 0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(ft[0], ft[1]); ctx.moveTo(base[0], base[1]); ctx.lineTo(top[0], top[1]); ctx.stroke();
    ctx.strokeStyle = 'rgba(26, 11, 6, 0.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(fb[0], fb[1]); ctx.stroke();
  }
  // The street sign on its pole
  const px = x + 26;
  ctx.fillStyle = INK; ctx.fillRect(px - 1, g - 160, 6, 160);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(px, g - 160, 4, 160); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(px, g - 160, 1, 160);
  ctx.fillStyle = INK; ctx.fillRect(px - 45, g - 171, 98, 22);
  ctx.fillStyle = '#166534'; ctx.fillRect(px - 44, g - 170, 96, 20);
  ctx.fillStyle = '#22863F'; ctx.fillRect(px - 44, g - 170, 96, 2);
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1; ctx.strokeRect(px - 42, g - 168, 92, 16);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText(lot.name, px + 4, g - 157, 88); ctx.textAlign = 'left';
  // A traffic light on the far corner, cycling through everything at once (the quake's got into it)
  const tx = x + w - 34;
  ctx.fillStyle = INK; ctx.fillRect(tx - 1, g - 130, 6, 130);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(tx, g - 130, 4, 130); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(tx, g - 130, 1, 130);
  ctx.fillStyle = INK; ctx.fillRect(tx - 8, g - 171, 20, 46);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(tx - 7, g - 170, 18, 44);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(tx - 7, g - 170, 2, 44);
  const on = Math.floor(f / 10) % 3;
  ['#EF4444', '#FACC15', '#22C55E'].forEach((col, k) => {
    const ly = g - 162 + k * 14;
    if (on === k) steppedGlow(ctx, tx + 2, ly, 14, col, 0.3, 0.05, 3);
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(tx - 5, ly - 7, 14, 2);
    ctx.fillStyle = on === k ? col : '#3F3F46'; ctx.beginPath(); ctx.arc(tx + 2, ly, 5, 0, Math.PI * 2); ctx.fill();
    if (on === k) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(tx, ly - 3, 2, 2); }
  });
};
