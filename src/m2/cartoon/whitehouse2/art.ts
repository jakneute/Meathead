// CHELSEA AND SOCKS' WACKY WHITE HOUSE, part two, painted (crude-but-clean first pass, the way part one is: the show's
// West Wing as a Saturday morning cartoon draws it: flat bright colors in a couple of steps, a fat black line round
// everything, nothing quite straight). The rooms cut away along their backs as sets, every wall, floor and ceiling drawn
// to the one eye (the middle of the screen; back to front), culled by where they land on screen; above each ceiling the
// house's own fill.
//
// In the play plane, bright and inked, everything he stands on lit along its top: the filing cabinets and their drawers,
// Limbaugh's desk, the jelly mold, the range, the pot rack, the cabinet table, the map cabinet and its step and stool,
// the Resolute desk, the arenas' shelves; scenery that might look standable (the cubicle walls, the chair backs, the
// mantel) drawn back on the wall, dimmed. Each room has its placard (a gilt easel, the show's fat letters). Outdoors (the
// colonnade), the sky by the hour and the Rose Garden behind.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText, signW } from '../../signLetters';
import { box, mix, toonLetters, toonSign, onScreen, wobblePath, INK, stamp, type Ctx } from '../kit';
import { GY } from '../geometry';
import { wh2Of } from './state';
import { drawerOut, burnerAt, blinkAt, sweepAt, jelloWobble, FIRE_H, FIRE_W } from './hazards';
import {
  ROOMS, D_BACK, CEIL, CABINETS, DRAWER_W, DRAWER_D, DESK_EIB, JELLO, RANGE, BURNERS, POT_RACK, CAB_TABLE, GLOBE, MAP_STEP, MAP_CAB,
  MAP_STOOL, RESOLUTE, BLINKERS, SWEEP, LIMBAUGH_ARENA, DOLE_ARENA, NEWT_ARENA, OVAL_WALL, X, Y, type Room, type Cabinet,
} from './layout';

type P = { x: number; y: number };
const eyeOf = (state: GameState): P => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 });
const proj = (E: P, x: number, y: number, s: number): P => ({ x: E.x + (x - E.x) * s, y: E.y + (y - E.y) * s });
const atDepth = (c: Ctx, E: P, s: number, fn: () => void) => { c.save(); c.translate(E.x, E.y); c.scale(s, s); c.translate(-E.x, -E.y); fn(); c.restore(); };
const seen = (state: GameState, E: P, x0: number, x1: number, s: number, m = 40) => { const a = proj(E, x0, 0, s).x, b = proj(E, x1, 0, s).x; return b > state.camera.x - m && a < state.camera.x + CANVAS_WIDTH + m; };
const quad = (c: Ctx, pts: P[], fill: string) => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) c.lineTo(p.x, p.y); c.closePath(); c.fillStyle = fill; c.fill(); };
const inked = (c: Ctx, path: () => void, fill: string, w = 3) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = w; c.stroke(); };
const dim = (col: string) => mix(col, '#8E86B4', 0.28);
const litTop = (c: Ctx, x: number, y: number, w: number) => { box(c, x + 2, y, w - 4, 2, '#FFFBEB'); box(c, x + 6, y, w * 0.4, 1, '#FFFFFF'); };

// ---------------------------------------------------------------------------------------------------------------
// The rooms' looks

interface Look { wall: string; trim: string; floor: string; floor2?: string; ceil: string; paper?: 'stripe' | 'dots' | 'check' | 'none' }
const LOOK: Partial<Record<Room['id'], Look>> = {
  offices: { wall: '#D9F2E3', trim: '#7FB89A', floor: '#9CA3AF', ceil: '#F1F5F9', paper: 'stripe' },
  roosevelt: { wall: '#F4E4C1', trim: '#B8862E', floor: '#7A3B22', floor2: '#6B3119', ceil: '#FBF1DC', paper: 'none' },
  kitchen: { wall: '#FFFFFF', trim: '#60A5FA', floor: '#F8FAFC', floor2: '#1F2937', ceil: '#F8FAFC', paper: 'check' },
  cabinet: { wall: '#F5EBD0', trim: '#C8962E', floor: '#1E3A8A', ceil: '#FFF8E6', paper: 'none' },
  map: { wall: '#E8DCC0', trim: '#8B5E34', floor: '#8B5E34', floor2: '#77502B', ceil: '#F5EBD5', paper: 'none' },
  situation: { wall: '#1E293B', trim: '#475569', floor: '#334155', ceil: '#0F172A', paper: 'none' },
  outer: { wall: '#FDE7C8', trim: '#C8962E', floor: '#3E6FB0', ceil: '#FFF3DE', paper: 'dots' },
  oval: { wall: '#FFF6DE', trim: '#D4A843', floor: '#2B4A9E', ceil: '#FFFBEF', paper: 'none' },
};

const column = (c: Ctx, x: number, fy: number, cy: number, col = '#FFFFFF') => {
  const w = 30, h = fy - cy;
  inked(c, () => wobblePath(c, x - w / 2, cy + 24, w, h - 44, -3), col, 3);
  inked(c, () => c.roundRect(x - w / 2 - 8, fy - 20, w + 16, 20, 4), col, 3);
  inked(c, () => c.roundRect(x - w / 2 - 10, cy + 6, w + 20, 18, 4), col, 3);
  c.fillStyle = mix(col, '#9CA3AF', 0.35); for (const dx of [-7, 0, 7]) c.fillRect(x + dx - 1, cy + 30, 2, h - 56);
};
const windowAt = (c: Ctx, x: number, sy: number, w: number, h: number, drape: string, out = '#9DD6F5') => {
  inked(c, () => c.roundRect(x - w / 2 - 6, sy - h - 6, w + 12, h + 12, [w / 2, w / 2, 3, 3]), '#FFFFFF', 3);
  inked(c, () => c.roundRect(x - w / 2, sy - h, w, h, [w / 2 - 4, w / 2 - 4, 2, 2]), out, 2);
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x, sy - h + 4); c.lineTo(x, sy); c.moveTo(x - w / 2, sy - h * 0.45); c.lineTo(x + w / 2, sy - h * 0.45); c.stroke();
  for (const s of [-1, 1]) inked(c, () => { c.moveTo(x + s * (w / 2 + 14), sy - h - 16); c.quadraticCurveTo(x + s * (w / 2 - 6), sy - h * 0.4, x + s * (w / 2 + 4), sy + 6); c.lineTo(x + s * (w / 2 + 22), sy + 6); c.quadraticCurveTo(x + s * (w / 2 + 24), sy - h * 0.5, x + s * (w / 2 + 24), sy - h - 16); c.closePath(); }, drape, 3);
};
const frame = (c: Ctx, x: number, y: number, w: number, h: number, inner: string) => { inked(c, () => c.roundRect(x - w / 2 - 6, y - h / 2 - 6, w + 12, h + 12, 3), '#E2B33C', 3); inked(c, () => c.rect(x - w / 2, y - h / 2, w, h), inner, 2); };
const wallpaper = (c: Ctx, a: number, b: number, top: number, bot: number, L: Look) => {
  const col = mix(L.wall, L.trim, 0.3);
  if (L.paper === 'stripe') { c.fillStyle = col; for (let x = a + 10; x < b; x += 36) c.fillRect(x, top, 10, bot - top); }
  if (L.paper === 'dots') { c.fillStyle = col; for (let x = a + 20; x < b; x += 40) for (let y = top + 20; y < bot; y += 40) { c.beginPath(); c.arc(x + ((y / 40) % 2) * 20, y, 4, 0, Math.PI * 2); c.fill(); } }
  if (L.paper === 'check') { c.fillStyle = '#DBEAFE'; for (let x = a; x < b; x += 30) for (let y = top; y < bot; y += 30) if (((x - a) / 30 + (y - top) / 30) % 2 < 1) c.fillRect(x, y, 30, 30); }
};

/** A room's shell (its ceiling, floor and back wall to the eye), its wall's furnishings. */
const room = (c: Ctx, state: GameState, E: P, r: Room) => {
  const L = LOOK[r.id];
  if (!L) return;
  const a = X(r.a), b = X(r.b), fy = GY, cy = Y(CEIL);
  if (!seen(state, E, a, b, D_BACK, 80) && !onScreen(state, a, b)) return;
  box(c, a - 1, cy - 1200, b - a + 2, 1200, '#3A2350');
  quad(c, [proj(E, a, cy, D_BACK), proj(E, b, cy, D_BACK), proj(E, b, cy, 1), proj(E, a, cy, 1)], L.ceil);
  c.strokeStyle = mix(L.ceil, INK, 0.25); c.lineWidth = 1.5;
  for (let x = r.a + 120; x < r.b; x += 160) { const p0 = proj(E, X(x), cy, D_BACK), p1 = proj(E, X(x), cy, 1); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  quad(c, [proj(E, a, fy, D_BACK), proj(E, b, fy, D_BACK), proj(E, b, fy, 1), proj(E, a, fy, 1)], L.floor);
  if (r.id === 'kitchen') {
    for (let x = r.a; x < r.b; x += 50) for (let k = 0; k < 4; k++) {
      if (((x / 50) + k) % 2 === 0) continue;
      const d0 = D_BACK + (1 - D_BACK) * (k / 4), d1 = D_BACK + (1 - D_BACK) * ((k + 1) / 4);
      quad(c, [proj(E, X(x), fy, d0), proj(E, X(x + 50), fy, d0), proj(E, X(x + 50), fy, d1), proj(E, X(x), fy, d1)], L.floor2!);
    }
  } else if (r.id === 'oval') {
    // (the seal rug: a big blue oval, a gold ring, the eagle)
    const m = proj(E, X((r.a + r.b) / 2), fy, (D_BACK + 1) / 2);
    c.save(); c.translate(m.x, m.y); c.scale(1, 0.16);
    inked(c, () => c.ellipse(0, 0, 300, 120, 0, 0, Math.PI * 2), '#1E3A8A', 5); inked(c, () => c.ellipse(0, 0, 260, 100, 0, 0, Math.PI * 2), '#E2B33C', 4);
    inked(c, () => c.ellipse(0, 0, 90, 70, 0, 0, Math.PI * 2), '#F8FAFC', 4);
    c.restore();
  } else if (L.floor2) {
    for (let x = r.a; x < r.b; x += 40) quad(c, [proj(E, X(x), fy, D_BACK), proj(E, X(x + 18), fy, D_BACK), proj(E, X(x + 18), fy, 1), proj(E, X(x), fy, 1)], L.floor2);
  } else {
    const d = D_BACK + (1 - D_BACK) * 0.15, d2 = D_BACK + (1 - D_BACK) * 0.85;
    c.strokeStyle = r.id === 'situation' ? '#38BDF8' : '#F2C94C'; c.lineWidth = 2; for (const dd of [d, d2]) { const p0 = proj(E, a, fy, dd), p1 = proj(E, b, fy, dd); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  }
  atDepth(c, E, D_BACK, () => {
    box(c, a, cy, b - a, fy - cy, L.wall);
    wallpaper(c, a, b, cy + 30, fy - 60, L);
    box(c, a, fy - 60, b - a, 60, mix(L.wall, INK, 0.12)); box(c, a, fy - 62, b - a, 4, L.trim); box(c, a, fy - 14, b - a, 14, mix(L.trim, INK, 0.3));
    box(c, a, cy, b - a, 22, L.trim); box(c, a, cy + 22, b - a, 4, mix(L.trim, INK, 0.3));
    c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(a, cy, b - a, fy - cy);
    furnish(c, state, r, fy, cy);
  });
  atDepth(c, E, D_BACK, () => {
    for (const x of [a, b]) {
      if (r.id === 'oval' && x === b) continue;
      inked(c, () => { c.moveTo(x - 46, fy); c.lineTo(x - 46, fy - 190); c.quadraticCurveTo(x, fy - 250, x + 46, fy - 190); c.lineTo(x + 46, fy); c.closePath(); }, mix(L.wall, INK, 0.55), 4);
      c.strokeStyle = L.trim; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 50, fy); c.lineTo(x - 50, fy - 192); c.quadraticCurveTo(x, fy - 256, x + 50, fy - 192); c.lineTo(x + 50, fy); c.stroke();
    }
  });
};

/** What's on each room's back wall (drawn at the wall's depth). */
const furnish = (c: Ctx, state: GameState, r: Room, fy: number, cy: number) => {
  const f = state.frame;
  switch (r.id) {
    case 'offices': {
      // (cubicle walls along the back (scenery: dimmed), desks of paper, a water cooler, a fax spitting paper, a poster)
      for (let x = 1160; x < 2280; x += 190) {
        inked(c, () => c.rect(X(x), fy - 130, 160, 130), dim('#94A3B8'), 3);
        inked(c, () => c.rect(X(x) + 20, fy - 70, 120, 12), dim('#B45309'), 2);
        for (let k = 0; k < 3; k++) inked(c, () => c.rect(X(x) + 30 + k * 30, fy - 70 - 14 - k * 4, 20, 14 + k * 4), dim('#F8FAFC'), 1.5);
      }
      inked(c, () => c.roundRect(X(1560), fy - 160, 40, 100, 6), '#93C5FD', 3); inked(c, () => c.rect(X(1565), fy - 60, 30, 60), '#E5E7EB', 3);
      c.fillStyle = '#60A5FA'; c.beginPath(); c.arc(X(1580), fy - 120 + Math.sin(f * 0.1) * 2, 4, 0, Math.PI * 2); c.fill();
      inked(c, () => c.rect(X(2100), fy - 260, 120, 90), '#FDE68A', 3);
      signText(c, 'NEVER FILE IN', X(2160), fy - 232, { sx: 1, sy: 1, fill: '#7C2D12' }); signText(c, 'THE WRONG', X(2160), fy - 218, { sx: 1, sy: 1, fill: '#7C2D12' }); signText(c, 'DRAWER!', X(2160), fy - 200, toonLetters(1, ['#DC2626', '#DC2626', '#B91C1C', '#991B1B']));
      inked(c, () => c.rect(X(1300), fy - 300, 140, 100), '#FFFFFF', 3);
      for (let k = 0; k < 5; k++) { c.fillStyle = '#94A3B8'; c.fillRect(X(1310), fy - 290 + k * 16, 100 - k * 12, 4); }
      break;
    }
    case 'roosevelt': {
      // (Teddy's portrait (the mustache, the glasses), a moose head, and the show's EIB dressing: a banner, ON AIR lit)
      frame(c, X(2500), fy - 280, 90, 120, '#4B5D3A');
      inked(c, () => c.ellipse(X(2500), fy - 290, 18, 22, 0, 0, Math.PI * 2), '#F6C9A8', 2);
      inked(c, () => c.ellipse(X(2500), fy - 280, 18, 6, 0, 0, Math.PI), '#7C4A1E', 2);
      c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(X(2488), fy - 300, 10, 7); c.strokeRect(X(2502), fy - 300, 10, 7);
      inked(c, () => c.ellipse(X(3530), fy - 290, 26, 30, 0, 0, Math.PI * 2), '#7C4A1E', 3);
      for (const s of [-1, 1]) inked(c, () => { c.moveTo(X(3530) + s * 18, fy - 310); c.lineTo(X(3530) + s * 64, fy - 350); c.lineTo(X(3530) + s * 50, fy - 316); c.lineTo(X(3530) + s * 70, fy - 320); c.lineTo(X(3530) + s * 24, fy - 296); c.closePath(); }, '#E7D7A8', 3);
      inked(c, () => c.roundRect(X(2850), cy + 50, 420, 70, 10), '#1D4ED8', 4);
      signText(c, 'THE EIB NETWORK', X(3060), cy + 78, toonLetters(2));
      signText(c, 'LIVE FROM THE WHITE HOUSE!', X(3060), cy + 102, toonLetters(1, ['#FFFFFF', '#FFFFFF', '#FDE68A', '#FDE047']));
      const on = f % 60 < 40;
      inked(c, () => c.roundRect(X(3000), fy - 300, 120, 40, 8), on ? '#DC2626' : '#7F1D1D', 3);
      signText(c, 'ON AIR', X(3060), fy - 288, toonLetters(1, on ? ['#FFFFFF', '#FFFFFF', '#FEE2E2', '#FECACA'] : ['#FCA5A5', '#FCA5A5', '#F87171', '#EF4444']));
      // (the studio's sound panels behind the desk)
      for (let x = 2760; x < 3400; x += 80) inked(c, () => c.rect(X(x), fy - 240, 60, 80), dim('#475569'), 2);
      break;
    }
    case 'kitchen': {
      // (shelves of cans, a giant fridge, the hood over the range, hanging pots on the back wall (scenery: dimmed))
      inked(c, () => c.roundRect(X(3700), fy - 280, 120, 280, 10), '#E5E7EB', 3);
      c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(X(3700), fy - 170); c.lineTo(X(3820), fy - 170); c.stroke();
      inked(c, () => c.rect(X(3800), fy - 250, 8, 50), '#9CA3AF', 2);
      inked(c, () => { c.moveTo(X(4080), cy + 60); c.lineTo(X(4580), cy + 60); c.lineTo(X(4540), fy - 300); c.lineTo(X(4120), fy - 300); c.closePath(); }, '#CBD5E1', 3);
      for (let x = 4650; x < 4980; x += 110) { inked(c, () => c.rect(X(x), fy - 260, 100, 10), '#B45309', 2); for (let k = 0; k < 4; k++) inked(c, () => c.roundRect(X(x) + 6 + k * 24, fy - 290, 18, 30, 3), ['#DC2626', '#16A34A', '#F59E0B', '#2563EB'][k], 2); }
      break;
    }
    case 'cabinet': {
      // (portraits along the wall, flags, the fireplace, the eagle over it)
      for (const [x, w] of [[5100, 0], [5380, 1], [6330, 2]] as [number, number][]) { frame(c, X(x), fy - 270, 70, 90, ['#4B5D3A', '#5B3A2E', '#3A4B6B'][w]); inked(c, () => c.ellipse(X(x), fy - 280, 14, 17, 0, 0, Math.PI * 2), '#F6C9A8', 2); }
      inked(c, () => c.rect(X(5800), fy - 170, 120, 110), dim('#F5F5F4'), 3); inked(c, () => c.rect(X(5825), fy - 140, 70, 80), '#1F2937', 3);
      c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(X(5835), fy - 60); c.quadraticCurveTo(X(5860), fy - 100 - Math.sin(f * 0.3) * 6, X(5885), fy - 60); c.fill();
      inked(c, () => { c.moveTo(X(5860), fy - 330); c.lineTo(X(5800), fy - 300); c.lineTo(X(5830), fy - 296); c.lineTo(X(5860), fy - 260); c.lineTo(X(5890), fy - 296); c.lineTo(X(5920), fy - 300); c.closePath(); }, '#B45309', 3);
      for (const x of [5200, 6200]) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(X(x), fy); c.lineTo(X(x), fy - 260); c.stroke(); inked(c, () => c.rect(X(x), fy - 260, 70, 46), '#FFFFFF', 2); for (let k = 0; k < 3; k++) box(c, X(x), fy - 260 + k * 14 + 4, 70, 6, '#DC2626'); box(c, X(x), fy - 260, 30, 24, '#1D4ED8'); }
      break;
    }
    case 'map': {
      // (the war map: a big cartoon world on the wall, pins in it; the old charts)
      inked(c, () => c.roundRect(X(6800), fy - 360, 500, 230, 8), '#BFDBFE', 4);
      for (const [x, y, w, h] of [[6860, -320, 110, 70], [6990, -330, 80, 120], [7110, -320, 150, 90], [7160, -220, 60, 60]] as [number, number, number, number][]) inked(c, () => c.ellipse(X(x) + w / 2, fy + y + h / 2, w / 2, h / 2, 0.2, 0, Math.PI * 2), '#86EFAC', 2.5);
      for (let k = 0; k < 6; k++) { c.fillStyle = '#DC2626'; c.beginPath(); c.arc(X(6880 + k * 70), fy - 300 + (k % 3) * 40, 4, 0, Math.PI * 2); c.fill(); }
      frame(c, X(6500), fy - 270, 90, 70, '#E8DCC0'); frame(c, X(7600), fy - 300, 90, 70, '#E8DCC0');
      break;
    }
    case 'situation': {
      // (the wall of monitors: radar sweeps, a world map, a big red ALERT lamp turning)
      for (let x = 7880; x < 9240; x += 140) for (let k = 0; k < 2; k++) {
        inked(c, () => c.roundRect(X(x), fy - 340 + k * 100, 120, 80, 6), '#0F172A', 3);
        const cx = X(x) + 60, cyy = fy - 300 + k * 100;
        if ((x / 140 + k) % 3 < 1) { c.strokeStyle = '#22C55E'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cyy, 28, 0, Math.PI * 2); c.stroke(); const a = f * 0.05 + x; c.beginPath(); c.moveTo(cx, cyy); c.lineTo(cx + Math.cos(a) * 28, cyy + Math.sin(a) * 28); c.stroke(); }
        else if ((x / 140 + k) % 3 < 2) { c.fillStyle = '#1D4ED8'; c.fillRect(X(x) + 8, fy - 332 + k * 100, 104, 64); c.fillStyle = '#4ADE80'; c.fillRect(X(x) + 20, fy - 320 + k * 100, 30, 20); c.fillRect(X(x) + 64, fy - 316 + k * 100, 36, 28); }
        else { c.fillStyle = '#DC2626'; c.font = '6px "Press Start 2P"'; c.fillText('MEAN MEN', X(x) + 22, fy - 296 + k * 100); }
      }
      const al = f % 40 < 20;
      inked(c, () => c.arc(X(8550), cy + 60, 18, 0, Math.PI * 2), al ? '#EF4444' : '#7F1D1D', 3);
      break;
    }
    case 'outer': {
      // (the secretary's desk (scenery), a couch, the Oval Office's door: tall, white, a gold eagle over it)
      inked(c, () => c.rect(X(9400), fy - 90, 180, 90), dim('#B45309'), 3);
      inked(c, () => c.roundRect(X(9640), fy - 70, 160, 70, 12), dim('#DC2626'), 3);
      frame(c, X(9720), fy - 280, 100, 80, '#3A4B6B');
      break;
    }
    case 'oval': {
      // (the curved wall: the windows behind the desk with gold drapes, the flags, the fireplace, the portraits)
      for (const x of [10260, 10420, 10580]) windowAt(c, X(x), fy - 110, 90, 260, '#E2B33C');
      for (const x of [10140, 10700]) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(X(x), fy); c.lineTo(X(x), fy - 280); c.stroke(); inked(c, () => c.rect(X(x), fy - 280, 60, 42), x < 10400 ? '#FFFFFF' : '#1D4ED8', 2); if (x < 10400) { for (let k = 0; k < 3; k++) box(c, X(x), fy - 280 + k * 13 + 3, 60, 6, '#DC2626'); box(c, X(x), fy - 280, 26, 22, '#1D4ED8'); } }
      frame(c, X(10010), fy - 280, 70, 90, '#5B3A2E'); frame(c, X(10790), fy - 280, 70, 90, '#3A4B6B');
      break;
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The colonnade (outdoors): the Rose Garden behind, the colonnade's columns and roof

const colonnade = (c: Ctx, state: GameState, E: P) => {
  const a = X(-200), b = X(1100);
  if (!onScreen(state, a - 300, b + 300) && !seen(state, E, a, b, 0.7)) return;
  // (the lawn going back, hedges, the rose beds)
  quad(c, [proj(E, a, GY, 0.7), proj(E, b, GY, 0.7), proj(E, b, GY, 1), proj(E, a, GY, 1)], '#4ADE80');
  atDepth(c, E, 0.74, () => {
    inked(c, () => c.rect(X(-400), Y(CEIL + 300), 600, CEIL + 300), '#F8F7F2', 4);
    for (let x = -360; x < 200; x += 110) inked(c, () => c.rect(X(x), Y(380), 50, 110), '#9DD6F5', 3);
    for (let x = 0; x < 1300; x += 120) inked(c, () => c.roundRect(X(x), GY - 70, 110, 70, 30), '#15803D', 3);
    for (let x = 30; x < 1300; x += 120) for (let k = 0; k < 3; k++) { c.fillStyle = '#E11D48'; c.beginPath(); c.arc(X(x) + k * 30, GY - 60 + (k % 2) * 10, 5, 0, Math.PI * 2); c.fill(); }
  });
  // (the colonnade: white columns along it, its roof, the West Wing's wall at the far end)
  atDepth(c, E, 0.9, () => {
    for (let x = -100; x < 1100; x += 150) column(c, X(x), GY, Y(380), '#FFFFFF');
    inked(c, () => c.rect(X(-300), Y(420), 1400, 50), '#F1F5F9', 4);
    box(c, X(-300), Y(420) - 300, 1400, 300, '#3A2350');
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane

const placard = (c: Ctx, x: number, feet: number, words: string[]) => {
  stamp(c, `wh2-placard-${words.join('|')}`, x - 80, feet - 150, 160, 154, g => {
    const ox = 80, oy = 150;
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(ox - 26, oy); g.lineTo(ox - 6, oy - 120); g.moveTo(ox + 26, oy); g.lineTo(ox + 6, oy - 120); g.moveTo(ox, oy); g.lineTo(ox, oy - 60); g.stroke();
    g.strokeStyle = '#E2B33C'; g.lineWidth = 2; g.stroke();
    inked(g, () => g.roundRect(ox - 70, oy - 140, 140, 64, 8), '#E2B33C', 3);
    inked(g, () => g.roundRect(ox - 62, oy - 132, 124, 48, 5), '#FFF7E6', 2);
    words.forEach((w, i) => { const big = signW(w, toonLetters(2)) <= 116 ? 2 : 1; signText(g, w, ox, oy - 112 + i * 20 + (words.length === 1 ? 8 : 0), toonLetters(big, i ? ['#7C3AED', '#7C3AED', '#6D28D9', '#5B21B6'] : ['#DC2626', '#DC2626', '#B91C1C', '#991B1B'])); });
  });
};
const PLACARDS: [number, string[]][] = [
  [1160, ['THE WEST WING', 'OFFICES']], [2330, ['THE ROOSEVELT', 'ROOM']], [3640, ['THE KITCHENS']], [5040, ['THE CABINET', 'ROOM']],
  [6460, ['THE MAP ROOM']], [7860, ['THE SITUATION', 'ROOM']], [9340, ['THE OUTER', 'OVAL']],
];

/** A filing cabinet: a tall cartoon cabinet, drawers' fronts all up it (scenery), its live drawers out of either face. */
const cabinetArt = (c: Ctx, C: Cabinet, f: number, ci: number) => {
  const a = X(C.a), w = C.b - C.a, top = Y(C.h);
  inked(c, () => c.roundRect(a, top, w, GY - top, 4), '#9CA3AF', 3);
  box(c, a + 4, top + 4, w - 8, 6, '#CBD5E1');
  // (the drawer fronts up the face (painted on), their handles)
  for (let y = top + 16; y < GY - 30; y += 40) { inked(c, () => c.roundRect(a + 8, y, w - 16, 32, 3), '#A8B0BC', 2); inked(c, () => c.roundRect(a + w / 2 - 10, y + 12, 20, 6, 3), '#E5E7EB', 1.5); }
  litTop(c, a, top, w);
  // (the live drawers sliding out of either face: each a box, its handle, papers sticking out, its top lit)
  C.drawers.forEach((h, k) => {
    const out = drawerOut(ci, k, f);
    if (out <= 0) { for (const s of [-1, 1]) { const x = s < 0 ? a - 3 : a + w; inked(c, () => c.rect(x, Y(h), 3, DRAWER_D), '#6B7280', 1.5); } return; }
    for (const s of [-1, 1]) {
      const dw = DRAWER_W * out, x = s < 0 ? a - dw : a + w, y = Y(h);
      inked(c, () => c.rect(x, y, dw, DRAWER_D), '#B8C0CC', 2.5);
      box(c, s < 0 ? x + 2 : x + dw - 6, y + 4, 4, DRAWER_D - 8, '#8B94A3');
      if (dw > 20) { inked(c, () => c.roundRect(s < 0 ? x + 4 : x + dw - 22, y + 13, 18, 6, 3), '#E5E7EB', 1.5); for (let p = 0; p < 3; p++) box(c, x + 8 + p * 16 * out, y - 6, 10, 8, '#F8FAFC'); }
      if (out > 0.6) litTop(c, x, y, dw);
    }
  });
};
const jello = (c: Ctx, f: number) => {
  const a = X(JELLO.a), w = JELLO.b - JELLO.a, top = Y(JELLO.h), wob = jelloWobble.t > 0 ? Math.sin(f * 0.8) * (jelloWobble.t / 40) * 8 : Math.sin(f * 0.1) * 1;
  inked(c, () => c.ellipse(a + w / 2, GY - 2, w / 2 + 12, 6, 0, 0, Math.PI * 2), '#F8FAFC', 3);
  inked(c, () => { c.moveTo(a, GY - 2); c.quadraticCurveTo(a - 6 - wob, top + 20, a + 8, top + wob * 0.5); c.lineTo(a + w - 8, top - wob * 0.5); c.quadraticCurveTo(a + w + 6 + wob, top + 20, a + w, GY - 2); c.closePath(); }, '#22C55E', 3);
  for (let k = 1; k < 4; k++) { c.strokeStyle = '#16A34A'; c.lineWidth = 2; c.beginPath(); c.moveTo(a + k * w / 4, top + 6); c.lineTo(a + k * w / 4 + wob * 0.3, GY - 6); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(a + 18, top + 14, 6, 10, 0.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.arc(a + w / 2, top - 6 + wob * 0.3, 7, 0, Math.PI * 2); c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
  litTop(c, a + 6, top, w - 12);
};
const range = (c: Ctx, f: number) => {
  const a = X(RANGE.a), w = RANGE.b - RANGE.a, top = Y(RANGE.h);
  inked(c, () => c.roundRect(a, top, w, GY - top, 6), '#E5E7EB', 3);
  for (let x = a + 20; x < a + w - 80; x += 110) { inked(c, () => c.roundRect(x, top + 30, 90, 60, 6), '#1F2937', 3); box(c, x + 10, top + 40, 70, 3, '#F97316'); }
  for (let x = a + 30; x < a + w - 20; x += 50) inked(c, () => c.arc(x, top + 16, 6, 0, Math.PI * 2), '#111827', 2);
  BURNERS.forEach((rx, k) => {
    const x = X(rx), b = burnerAt(k, f);
    // (the ring: glowing and ticking in the tell)
    inked(c, () => c.ellipse(x, top - 2, 20, 4, 0, 0, Math.PI * 2), '#374151', 2);
    if (b.st === 'tell') { c.fillStyle = f % 8 < 4 ? '#FB923C' : '#F97316'; c.beginPath(); c.ellipse(x, top - 2, 16 * b.k + 4, 3, 0, 0, Math.PI * 2); c.fill(); }
    if (b.st === 'fire') {
      const h = FIRE_H * Math.min(1, b.k * 6), wob = Math.sin(f * 0.7 + k) * 3;
      inked(c, () => { c.moveTo(x - FIRE_W / 2, top); c.quadraticCurveTo(x - FIRE_W / 2 - 4 + wob, top - h * 0.6, x + wob, top - h); c.quadraticCurveTo(x + FIRE_W / 2 + 4 + wob, top - h * 0.6, x + FIRE_W / 2, top); c.closePath(); }, '#F97316', 3);
      c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(x - 12, top); c.quadraticCurveTo(x - 10 + wob, top - h * 0.5, x + wob, top - h * 0.7); c.quadraticCurveTo(x + 12 + wob, top - h * 0.4, x + 12, top); c.closePath(); c.fill();
    }
  });
  litTop(c, a, top, w);
};
const potRack = (c: Ctx, f: number) => {
  const a = X(POT_RACK.a), w = POT_RACK.b - POT_RACK.a, top = Y(POT_RACK.h);
  for (const x of [a + 20, a + w - 20]) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x, Y(CEIL)); c.lineTo(x, top); c.stroke(); c.strokeStyle = '#CA8A04'; c.lineWidth = 1.5; c.setLineDash([4, 3]); c.stroke(); c.setLineDash([]); }
  inked(c, () => c.roundRect(a, top, w, 10, 4), '#92400E', 3);
  for (let x = a + 40; x < a + w - 20; x += 64) { const sw = Math.sin(f * 0.05 + x) * 0.1; c.save(); c.translate(x, top + 10); c.rotate(sw); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 12); c.stroke(); inked(c, () => c.ellipse(0, 22, 16, 10, 0, 0, Math.PI * 2), x % 128 < 64 ? '#9CA3AF' : '#B45309', 2.5); c.restore(); }
  litTop(c, a, top, w);
};
const plainTop = (c: Ctx, a: number, b: number, h: number, body: string, lip: string) => { const top = Y(h); inked(c, () => c.roundRect(X(a), top, b - a, GY - top, 4), body, 3); box(c, X(a) + 4, top + 4, b - a - 8, 4, lip); litTop(c, X(a), top, b - a); };
const shelf = (c: Ctx, a: number, b: number, h: number, col: string) => { inked(c, () => c.roundRect(X(a), Y(h), b - a, 14, 4), col, 3); box(c, X(a) + 2, Y(h), b - a - 4, 2, '#FFFBEB'); for (const x of [X(a) + 10, X(b) - 16]) inked(c, () => c.rect(x, Y(h) + 14, 6, 26), mix(col, INK, 0.25), 2); };
const globeArt = (c: Ctx, state: GameState) => {
  const g = wh2Of(state).globe, f = state.frame;
  // (the stand: a carved wooden stand, the brass meridian)
  const sx = X(GLOBE.stand);
  inked(c, () => { c.moveTo(sx - 40, GY); c.lineTo(sx - 14, Y(GLOBE.standH) + 10); c.lineTo(sx + 14, Y(GLOBE.standH) + 10); c.lineTo(sx + 40, GY); c.closePath(); }, '#8B5E34', 3);
  if (g.st === 'split') {
    for (const [i, h] of g.halves.entries()) { c.save(); c.translate(h.x, GY); c.rotate(h.rock); inked(c, () => { c.arc(0, 0, GLOBE.r, Math.PI, 0); c.closePath(); }, '#3B82F6', 3); inked(c, () => c.ellipse(0, 0, GLOBE.r, 8, 0, 0, Math.PI * 2), '#F8FAFC', 2); c.fillStyle = '#4ADE80'; c.beginPath(); c.ellipse(i ? -14 : 16, -26, 16, 10, 0.3, 0, Math.PI * 2); c.fill(); c.restore(); }
    return;
  }
  const wob = g.st === 'tell' ? Math.sin(g.t * 1.1) * 0.12 : 0, x = g.x + (g.st === 'tell' ? Math.sin(g.t * 1.1) * 3 : 0), y = g.y;
  c.save(); c.translate(x, y); c.rotate(wob);
  inked(c, () => c.arc(0, 0, GLOBE.r, 0, Math.PI * 2), '#3B82F6', 3.5);
  c.save(); c.beginPath(); c.arc(0, 0, GLOBE.r - 2, 0, Math.PI * 2); c.clip();
  for (const [lx, ly, w, h] of [[-30, -20, 34, 28], [8, -30, 30, 50], [24, 10, 26, 22], [-20, 20, 22, 16]] as [number, number, number, number][]) { const ox = ((lx + g.spin * 30) % 140 + 140) % 140 - 70; c.fillStyle = '#4ADE80'; c.beginPath(); c.ellipse(ox, ly, w / 2, h / 2, 0.3, 0, Math.PI * 2); c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); }
  c.restore();
  c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 4; c.beginPath(); c.arc(-14, -16, 22, Math.PI * 1.1, Math.PI * 1.5); c.stroke();
  c.restore();
  if (g.st !== 'roll') { c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.arc(sx, y, GLOBE.r + 8, Math.PI * 0.75, Math.PI * 2.25); c.stroke(); c.strokeStyle = '#E2B33C'; c.lineWidth = 3; c.stroke(); }
  void f;
};
const lasers = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const [rx, ph] of BLINKERS) {
    const x = X(rx), st = blinkAt(ph, f);
    if (!onScreen(state, x - 40, x + 40)) continue;
    inked(c, () => c.roundRect(x - 14, GY - 16, 28, 16, 4), '#1F2937', 3); inked(c, () => c.roundRect(x - 14, Y(CEIL), 28, 16, 4), '#1F2937', 3);
    c.fillStyle = st === 'off' ? '#7F1D1D' : '#EF4444'; c.fillRect(x - 3, GY - 18, 6, 3); c.fillRect(x - 3, Y(CEIL) + 15, 6, 3);
    if (st === 'tell' && f % 6 < 3) { c.fillStyle = 'rgba(239,68,68,0.5)'; c.fillRect(x - 1, Y(CEIL) + 16, 2, CEIL - 32); }
    if (st === 'on') { c.fillStyle = 'rgba(239,68,68,0.35)'; c.fillRect(x - 6, Y(CEIL) + 16, 12, CEIL - 32); c.fillStyle = '#EF4444'; c.fillRect(x - 2.5, Y(CEIL) + 16, 5, CEIL - 32); c.fillStyle = '#FECACA'; c.fillRect(x - 1, Y(CEIL) + 16, 2, CEIL - 32); }
  }
  const a = X(SWEEP.a), b = X(SWEEP.b);
  if (!onScreen(state, a, b)) return;
  const y = Y(sweepAt(f));
  for (const x of [a - 16, b + 2]) { inked(c, () => c.roundRect(x, Y(SWEEP.hi + 20), 14, SWEEP.hi + 20, 4), '#1F2937', 3); c.fillStyle = '#EF4444'; c.fillRect(x + 4, y - 3, 6, 6); }
  c.fillStyle = 'rgba(239,68,68,0.35)'; c.fillRect(a, y - 6, b - a, 12); c.fillStyle = '#EF4444'; c.fillRect(a, y - 2.5, b - a, 5); c.fillStyle = '#FECACA'; c.fillRect(a, y - 1, b - a, 2);
};

// ---------------------------------------------------------------------------------------------------------------

/** World space, behind him: the rooms, the colonnade, everything he stands on, the hazards. */
export const drawWh2Back = (c: Ctx, state: GameState) => {
  const E = eyeOf(state), f = state.frame;
  colonnade(c, state, E);
  for (const r of ROOMS) if (!r.outdoors) room(c, state, E, r);
  // (the floor's lit front edge)
  const v0 = Math.max(X(-200), state.camera.x - 60), v1 = Math.min(X(OVAL_WALL + 40), state.camera.x + CANVAS_WIDTH + 60);
  if (v0 < v1) {
    const m = Math.max(v0, Math.min(v1, X(1100)));
    if (m > v0) box(c, v0, GY, m - v0, 60, '#3F7D3A');
    if (v1 > m) box(c, m, GY, v1 - m, 60, '#6B3A20');
    box(c, v0, GY, v1 - v0, 3, '#FFFBEB');
  }
  CABINETS.forEach((C, ci) => { if (onScreen(state, X(C.a) - 90, X(C.b) + 90)) cabinetArt(c, C, f, ci); });
  if (onScreen(state, X(LIMBAUGH_ARENA.a), X(LIMBAUGH_ARENA.b))) {
    // (his broadcast desk: a big curved console, the board's faders, a mic stand on it)
    plainTop(c, DESK_EIB.a, DESK_EIB.b, DESK_EIB.h, '#1E3A8A', '#3B82F6');
    for (let k = 0; k < 6; k++) box(c, X(DESK_EIB.a) + 12 + k * 16, Y(DESK_EIB.h) + 20 + (k % 3) * 6, 6, 10, '#FDE047');
    for (const [a, b, h] of LIMBAUGH_ARENA.ledges) shelf(c, a, b, h, '#B8862E');
  }
  if (onScreen(state, X(JELLO.a) - 60, X(POT_RACK.b) + 60)) { potRack(c, f); range(c, f); jello(c, f); }
  if (onScreen(state, X(DOLE_ARENA.a), X(DOLE_ARENA.b))) {
    // (the cabinet table: long, mahogany, the chairs' backs along the back of it (scenery: dimmed))
    for (let x = X(CAB_TABLE.a) + 20; x < X(CAB_TABLE.b) - 30; x += 60) inked(c, () => c.roundRect(x, Y(CAB_TABLE.h) - 56, 32, 56, [12, 12, 0, 0]), dim('#7C2D12'), 2);
    plainTop(c, CAB_TABLE.a, CAB_TABLE.b, CAB_TABLE.h, '#7C2D12', '#9A3412');
    for (let k = 0; k < 5; k++) inked(c, () => c.rect(X(CAB_TABLE.a) + 30 + k * 64, Y(CAB_TABLE.h) - 4, 22, 4), '#F8FAFC', 1.5);
    for (const [a, b, h] of DOLE_ARENA.ledges) shelf(c, a, b, h, '#C8962E');
  }
  if (onScreen(state, X(GLOBE.stand) - 120, X(MAP_STOOL.b) + 60)) {
    globeArt(c, state);
    plainTop(c, MAP_STEP.a, MAP_STEP.b, MAP_STEP.h, '#8B5E34', '#A87445');
    plainTop(c, MAP_CAB.a, MAP_CAB.b, MAP_CAB.h, '#77502B', '#A87445');
    for (let k = 0; k < 3; k++) { inked(c, () => c.rect(X(MAP_CAB.a) + 12, Y(MAP_CAB.h) + 14 + k * 38, MAP_CAB.b - MAP_CAB.a - 24, 30), '#8B5E34', 2); box(c, X(MAP_CAB.a) + (MAP_CAB.b - MAP_CAB.a) / 2 - 10, Y(MAP_CAB.h) + 26 + k * 38, 20, 4, '#E2B33C'); }
    plainTop(c, MAP_STOOL.a, MAP_STOOL.b, MAP_STOOL.h, '#B45309', '#D97706');
  }
  lasers(c, state);
  if (onScreen(state, X(NEWT_ARENA.a), X(OVAL_WALL) + 60)) {
    // (the Resolute desk: carved, the seal on its front, the phone on it)
    plainTop(c, RESOLUTE.a, RESOLUTE.b, RESOLUTE.h, '#5B2E1A', '#7C3A1E');
    inked(c, () => c.arc(X((RESOLUTE.a + RESOLUTE.b) / 2), Y(RESOLUTE.h) + 44, 16, 0, Math.PI * 2), '#E2B33C', 2.5);
    inked(c, () => c.roundRect(X(RESOLUTE.b) - 30, Y(RESOLUTE.h) - 10, 22, 10, 3), '#DC2626', 2);
    for (const [a, b, h] of NEWT_ARENA.ledges) shelf(c, a, b, h, '#E2B33C');
    // (the Oval Office's far wall, curving round: the end of the show's White House)
    const w = X(OVAL_WALL);
    inked(c, () => { c.moveTo(w, GY); c.quadraticCurveTo(w - 30, (GY + Y(CEIL)) / 2, w, Y(CEIL)); c.lineTo(w + 400, Y(CEIL)); c.lineTo(w + 400, GY); c.closePath(); }, '#FFF6DE', 4);
    box(c, w + 2, Y(CEIL) - 600, 400, 600, '#3A2350');
    box(c, w - 4, GY - 60, 400, 60, '#E8D9B0');
  }
  for (const [x, words] of PLACARDS) if (onScreen(state, X(x) - 90, X(x) + 90)) placard(c, X(x), GY, words);
  if (onScreen(state, X(700), X(1050))) toonSign(c, X(880), GY, ['THE WEST WING >', 'NO CATS'], { board: '#1D4ED8' });
};
/** Screen space: the sky (the colonnade's out of doors; the rooms cover it). */
export { Y };
