// AMERICA USA's way out (where he came in): the end of its Main Street through a brick arch, the turnstiles across it
// that only turn one way. Down the street beyond, to the hub's one eye: the shopfronts either side going back (brick and
// clapboard, their awnings, the windows lit after dark, the names on their boards, flags out over the walk), the
// streetcar's rails and the brick paving running back, lamp posts, the station at the far end with its clock. The arch:
// two brick piers with cream stone quoins and caps, lanterns on them, the marquee across in its bulbs, an eagle on top,
// bunting swagged under (that sways), flags. Painted once (a stamp, for the hour and lit or not); the bunting, the
// turnstiles' arms and the bulbs' chase live.

import { GROUND_Y } from '../../m1/constants';
import { stamp } from '../../m1/game/render/stamp';
import { type Ctx, INK, mix, hash, checker, box, R6 } from './kit';
import { HUB_HORIZON } from './geometry';
import { timeOfDay } from '../timeOfDay';
import { signText } from '../signLetters';
import { signAt, gate, enamel } from './letters';

const TOP = GROUND_Y - 230, W = 170, HALF = W / 2;
/** The street's far end (how far back, as the scale things shrink to there). */
const S_END = 0.24;
type Pt = [number, number];
/** A point down the street: `L` across from its middle, `h` up from the ground, `s` how near (1 at the arch). */
const P = (cx: number, L: number, h: number, s: number): Pt => [cx + L * s, HUB_HORIZON + (GROUND_Y - HUB_HORIZON - h) * s];
const quad = (g: Ctx, a: Pt, b: Pt, c: Pt, d: Pt, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fill(); };
const line = (g: Ctx, a: Pt, b: Pt, col: string, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };

const SHOPS = [
  { col: '#B4533C', trim: '#F1E8D8', aw: ['#DC2626', '#F8FAFC'], name: 'SODA' },
  { col: '#E8DCC4', trim: '#1E3A8A', aw: ['#1E3A8A', '#F8FAFC'], name: 'HATS' },
  { col: '#7A9ABE', trim: '#F8FAFC', aw: ['#15803D', '#F8FAFC'], name: 'FUDGE' },
  { col: '#C2410C', trim: '#FDE68A', aw: ['#7C2D12', '#FDE68A'], name: 'BARBER' },
  { col: '#F1E8D8', trim: '#B91C1C', aw: ['#B91C1C', '#F8FAFC'], name: 'CANDY' },
  { col: '#8A5A44', trim: '#F1E8D8', aw: ['#1E40AF', '#FDE047'], name: 'GIFTS' },
];

/** The street beyond the arch (clipped to the opening): the sky at its end, the station, the shopfronts going back, the
 *  paving and the rails, lamp posts. */
const paintStreet = (g: Ctx, cx: number, lit: boolean) => {
  const sky = ['#6995EB', '#8DB1F2', '#B7CDF4', '#E6E3E6', '#F6E7D2'], tod = timeOfDay();
  const sk = tod.lamps > 0.5 ? ['#1E1B4B', '#312E81', '#4C3A7A', '#7A4A6A', '#B0607A'] : sky;
  sk.forEach((c, i) => box(g, cx - HALF, TOP + i * 16, W, 17, c));
  for (let i = 1; i < sk.length; i++) checker(g, cx - HALF, TOP + i * 16 - 1, W, 2, sk[i]);
  // (the station at the far end: a brick front, its arched windows, the clock tower)
  const [ex0, ey] = P(cx, -HALF, 0, S_END), [ex1] = P(cx, HALF, 0, S_END), sc = S_END;
  const st = R6('#A0503C'), sh = 120 * sc;
  box(g, ex0, ey - sh, ex1 - ex0, sh, st[3]); box(g, ex0, ey - sh, 3, sh, st[4]); box(g, ex1 - 5, ey - sh, 5, sh, st[2]);
  for (let k = 0; k < 4; k++) { const wx = ex0 + 4 + k * ((ex1 - ex0 - 8) / 4); box(g, wx + 1, ey - sh + 8, 5, 12, lit ? '#FFD87A' : '#3B5A8A'); }
  box(g, ex0 - 2, ey - sh - 3, ex1 - ex0 + 4, 3, '#F1E8D8');
  const tw = 14, tx = cx - tw / 2;
  box(g, tx, ey - sh - 40, tw, 40, st[3]); box(g, tx, ey - sh - 40, 3, 40, st[4]);
  g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(cx, ey - sh - 30, 5, 0, Math.PI * 2); g.fill(); box(g, cx, ey - sh - 34, 1, 4, INK); box(g, cx, ey - sh - 30, 3, 1, INK);
  g.fillStyle = '#2F5A3A'; g.beginPath(); g.moveTo(tx - 3, ey - sh - 40); g.lineTo(cx, ey - sh - 54); g.lineTo(tx + tw + 3, ey - sh - 40); g.fill();
  box(g, cx, ey - sh - 62, 1, 8, '#57534E');
  // (the paving running back: courses (deeper nearer), the joints running to the eye, the rails in the middle)
  quad(g, P(cx, -HALF, 0, 1), P(cx, HALF, 0, 1), P(cx, HALF, 0, S_END), P(cx, -HALF, 0, S_END), '#B4533C');
  for (let s = S_END, r = 0; s < 1.05; s += 0.012 + s * 0.05, r++) { const a = P(cx, -HALF, 0, s), b = P(cx, HALF, 0, s); line(g, a, b, '#7A3424'); if (r % 3 === 0) line(g, [a[0], a[1] + 1], [b[0], b[1] + 1], '#D07A5E'); }
  for (let L = -HALF; L <= HALF; L += 17) line(g, P(cx, L, 0, 1), P(cx, L, 0, S_END), '#8A4030');
  // (the sidewalks either side: cream, curbed)
  for (const sd of [-1, 1]) { quad(g, P(cx, sd * HALF, 0, 1), P(cx, sd * (HALF - 22), 0, 1), P(cx, sd * (HALF - 22), 0, S_END), P(cx, sd * HALF, 0, S_END), '#E7D9BC'); line(g, P(cx, sd * (HALF - 22), 0, 1), P(cx, sd * (HALF - 22), 0, S_END), '#8A7650', 2); }
  for (const L of [-12, -4, 4, 12]) { line(g, P(cx, L, 0, 1), P(cx, L, 0, S_END), '#57534E', 2); line(g, P(cx, L, 0.5, 1), P(cx, L, 0.5, S_END), '#D6D3D1'); }
  // (the shopfronts going back either side: each a run of the wall, its body, the window band, its awning and board)
  for (const sd of [-1, 1]) {
    let s0 = 1;
    for (let k = 0; s0 > S_END + 0.02; k++) {
      const shop = SHOPS[(k * 2 + (sd > 0 ? 1 : 0)) % SHOPS.length], s1 = Math.max(S_END, s0 - (0.11 + 0.1 * s0)), h = 150 + hash(k * 3 + sd) * 40;
      const B = R6(shop.col), wallCol = sd < 0 ? B[2] : B[3];
      quad(g, P(cx, sd * HALF, 0, s0), P(cx, sd * HALF, h, s0), P(cx, sd * HALF, h, s1), P(cx, sd * HALF, 0, s1), wallCol);
      // (brick courses on the brick ones)
      if (shop.col === '#B4533C' || shop.col === '#C2410C' || shop.col === '#8A5A44') for (let hh = 6; hh < h; hh += 6) line(g, P(cx, sd * HALF, hh, s0), P(cx, sd * HALF, hh, s1), B[1]);
      else for (let hh = 5; hh < h; hh += 5) line(g, P(cx, sd * HALF, hh, s0), P(cx, sd * HALF, hh, s1), B[2]);
      // (the cornice, the pilaster between this one and the next)
      quad(g, P(cx, sd * HALF, h, s0), P(cx, sd * HALF, h - 10, s0), P(cx, sd * HALF, h - 10, s1), P(cx, sd * HALF, h, s1), shop.trim);
      quad(g, P(cx, sd * HALF, 0, s0), P(cx, sd * HALF, h, s0), P(cx, sd * HALF, h, s0 - 0.012), P(cx, sd * HALF, 0, s0 - 0.012), mix(shop.trim, INK, 0.15));
      // (upstairs windows: two, framed, lit after dark)
      for (const u of [0.25, 0.65]) {
        const a = s0 + (s1 - s0) * u, b = s0 + (s1 - s0) * (u + 0.2);
        quad(g, P(cx, sd * HALF, h - 22, a), P(cx, sd * HALF, h - 52, a), P(cx, sd * HALF, h - 52, b), P(cx, sd * HALF, h - 22, b), shop.trim);
        quad(g, P(cx, sd * HALF, h - 25, a), P(cx, sd * HALF, h - 49, a), P(cx, sd * HALF, h - 49, b), P(cx, sd * HALF, h - 25, b), lit && hash(k + u + sd) > 0.3 ? '#FFD87A' : '#3B5A8A');
      }
      // (the shop window and the door, the awning over them, the board over that)
      const wa = s0 + (s1 - s0) * 0.12, wb = s0 + (s1 - s0) * 0.62, da = s0 + (s1 - s0) * 0.7, db = s0 + (s1 - s0) * 0.88;
      quad(g, P(cx, sd * HALF, 8, wa), P(cx, sd * HALF, 48, wa), P(cx, sd * HALF, 48, wb), P(cx, sd * HALF, 8, wb), lit ? '#F0A83E' : '#5A7AA0');
      quad(g, P(cx, sd * HALF, 30, wa), P(cx, sd * HALF, 48, wa), P(cx, sd * HALF, 48, wb), P(cx, sd * HALF, 30, wb), lit ? '#FFD87A' : '#9CC8E8');
      quad(g, P(cx, sd * HALF, 0, da), P(cx, sd * HALF, 50, da), P(cx, sd * HALF, 50, db), P(cx, sd * HALF, 0, db), '#4A2E18');
      for (let j = 0; j < 6; j++) {
        const a = s0 + (s1 - s0) * (j / 6), b = s0 + (s1 - s0) * ((j + 1) / 6);
        quad(g, P(cx, sd * HALF, 66, a), P(cx, sd * (HALF - 16), 54, a), P(cx, sd * (HALF - 16), 54, b), P(cx, sd * HALF, 66, b), mix(shop.aw[j % 2], '#4A4458', 0.22));
      }
      quad(g, P(cx, sd * HALF, 70, s0 - 0.01), P(cx, sd * HALF, 86, s0 - 0.01), P(cx, sd * HALF, 86, s1 + 0.01), P(cx, sd * HALF, 70, s1 + 0.01), shop.trim);
      // (a flag out over the walk)
      const fp = P(cx, sd * HALF, h - 6, s0 - 0.02), fe = P(cx, sd * (HALF - 18), h - 18, s0 - 0.02);
      line(g, fp, fe, '#57534E');
      quad(g, fe, [fe[0], fe[1] + 9 * s0], [fe[0] + sd * 8 * s0, fe[1] + 11 * s0], [fe[0] + sd * 8 * s0, fe[1] + 2 * s0], k % 2 ? '#1E3A8A' : '#DC2626');
      s0 = s1;
    }
  }
  // (lamp posts along the curbs)
  for (const sd of [-1, 1]) for (const s of [0.86, 0.6, 0.42, 0.3]) { const a = P(cx, sd * (HALF - 24), 0, s), b = P(cx, sd * (HALF - 24), 70, s); line(g, a, b, '#1F2937', Math.max(1, 3 * s)); g.fillStyle = lit ? '#FFF7C2' : '#FEF3C7'; g.beginPath(); g.arc(b[0], b[1] - 2 * s, 4 * s, 0, Math.PI * 2); g.fill(); }
  // (the haze down at its end)
  g.fillStyle = 'rgba(246, 231, 210, 0.35)'; g.fillRect(cx - HALF, ey - 50, W, 40);
};

/** The arch's piers, cap and marquee board, the eagle; the turnstiles' posts and their sign. */
const paintArch = (g: Ctx, cx: number, lit: boolean) => {
  const Br = R6('#9A3E2C'), St = R6('#E8DCC4');
  for (const x of [cx - HALF - 26, cx + HALF]) {
    box(g, x - 1, TOP + 19, 28, GROUND_Y - TOP - 19, INK);
    // (brick in courses, each brick a step of its own, mortar under; stone quoins up the edges)
    for (let y = TOP + 20, r = 0; y < GROUND_Y; y += 5, r++) for (let xx = x + (r % 2 ? -4 : 0); xx < x + 26; xx += 8) {
      const a = Math.max(x, xx), b = Math.min(x + 26, xx + 8), t = hash(xx * 0.31 + y * 0.17);
      box(g, a, y, b - a - 1, 4, Br[t > 0.75 ? 4 : t > 0.25 ? 3 : 2]);
    }
    for (let y = TOP + 26, r = 0; y < GROUND_Y - 10; y += 14, r++) for (const qx of [x, x + 26 - (r % 2 ? 10 : 6)]) { box(g, qx, y, r % 2 ? 10 : 6, 12, St[3]); box(g, qx, y, r % 2 ? 10 : 6, 1, St[5]); box(g, qx, y + 11, r % 2 ? 10 : 6, 1, St[1]); }
    box(g, x + 22, TOP + 20, 4, GROUND_Y - TOP - 20, Br[1]);
    // (its plinth, its cap)
    box(g, x - 3, GROUND_Y - 14, 32, 14, INK); box(g, x - 2, GROUND_Y - 13, 30, 13, St[3]); box(g, x - 2, GROUND_Y - 13, 30, 2, St[5]); box(g, x + 22, GROUND_Y - 13, 6, 13, St[1]);
    // (a lantern on a bracket, lit after dark)
    const lx = x + 13, ly = TOP + 64;
    box(g, lx - 6, ly, 12, 2, '#1F2937'); box(g, lx - 5, ly + 2, 10, 14, INK); box(g, lx - 4, ly + 3, 8, 12, lit ? '#FFE9A8' : '#E8DCC0'); box(g, lx - 4, ly + 3, 2, 12, lit ? '#FFFFFF' : '#F8F4E8'); box(g, lx - 6, ly + 15, 12, 2, '#1F2937');
    // (a flyer pasted on: THANK YOU FOR VISITING)
    box(g, x + 4, TOP + 110, 18, 22, '#F8FAFC'); box(g, x + 4, TOP + 110, 18, 4, '#1E3A8A'); for (let k = 0; k < 4; k++) box(g, x + 6, TOP + 117 + k * 3, 14, 1, '#94A3B8');
  }
  // (the cap across: stone, its cornice, the marquee board on it in its bulbs (the chase live), AMERICA USA)
  box(g, cx - HALF - 32, TOP - 1, W + 64, 33, INK);
  box(g, cx - HALF - 31, TOP, W + 62, 31, '#1E3A8A'); box(g, cx - HALF - 31, TOP, W + 62, 3, '#3B5BB0'); box(g, cx - HALF - 31, TOP + 27, W + 62, 4, '#142A66');
  checker(g, cx - HALF - 31, TOP + 25, W + 62, 2, '#142A66');
  box(g, cx - HALF - 34, TOP + 30, W + 68, 6, INK); box(g, cx - HALF - 33, TOP + 31, W + 66, 4, St[3]); box(g, cx - HALF - 33, TOP + 31, W + 66, 1, St[5]);
  box(g, cx - HALF - 34, TOP - 6, W + 68, 6, INK); box(g, cx - HALF - 33, TOP - 5, W + 66, 4, St[3]); box(g, cx - HALF - 33, TOP - 5, W + 66, 1, St[5]);
  signAt(g, 'AMERICA USA', cx, TOP + 24, 12, gate(12, '#F8FAFC', '#7F1D1D'));
  // (stars along the board's ends)
  for (const sx of [cx - HALF - 22, cx + HALF + 22]) { g.fillStyle = '#F8FAFC'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 2.5 : 6; g.lineTo(sx + Math.cos(a) * r, TOP + 14 + Math.sin(a) * r); } g.fill(); }
  // (the eagle on top, wings out, on a gilt ball)
  const ey = TOP - 8;
  g.fillStyle = INK; g.beginPath(); g.arc(cx, ey - 3, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#D09A30'; g.beginPath(); g.arc(cx, ey - 3, 4, 0, Math.PI * 2); g.fill(); box(g, cx - 2, ey - 6, 2, 2, '#FFF0A8');
  const wing = (s: number) => { g.fillStyle = INK; g.beginPath(); g.moveTo(cx + s * 3, ey - 12); g.lineTo(cx + s * 34, ey - 26); g.lineTo(cx + s * 30, ey - 18); g.lineTo(cx + s * 22, ey - 14); g.lineTo(cx + s * 6, ey - 6); g.closePath(); g.fill(); g.fillStyle = '#6A3A12'; g.beginPath(); g.moveTo(cx + s * 4, ey - 12); g.lineTo(cx + s * 32, ey - 25); g.lineTo(cx + s * 28, ey - 18); g.lineTo(cx + s * 21, ey - 15); g.lineTo(cx + s * 6, ey - 8); g.closePath(); g.fill(); for (let k = 0; k < 4; k++) box(g, cx + s * (12 + k * 5) - 1, ey - 18 - k * 2, 2, 4, '#4A2808'); };
  wing(-1); wing(1);
  box(g, cx - 4, ey - 16, 8, 9, '#6A3A12'); box(g, cx - 4, ey - 16, 2, 9, '#8A5A2A');
  g.fillStyle = INK; g.beginPath(); g.arc(cx, ey - 19, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(cx, ey - 19, 3, 0, Math.PI * 2); g.fill();
  box(g, cx + 2, ey - 20, 4, 2, '#F59E0B'); box(g, cx, ey - 20, 1, 1, INK);
  // (the turnstiles' housings: brushed steel, banded, a light on each (green this way, red the other))
  for (let k = 0; k < 3; k++) {
    const tx = cx - 50 + k * 50, S = R6('#9CA3AF');
    box(g, tx - 7, GROUND_Y - 45, 14, 45, INK); box(g, tx - 6, GROUND_Y - 44, 12, 44, S[3]); box(g, tx - 6, GROUND_Y - 44, 3, 44, S[4]); box(g, tx + 3, GROUND_Y - 44, 3, 44, S[2]);
    box(g, tx - 8, GROUND_Y - 48, 16, 5, INK); box(g, tx - 7, GROUND_Y - 47, 14, 3, S[4]);
    box(g, tx - 6, GROUND_Y - 30, 12, 2, S[1]); box(g, tx - 3, GROUND_Y - 42, 2, 2, '#DC2626'); box(g, tx + 1, GROUND_Y - 42, 2, 2, '#4ADE80');
    box(g, tx - 8, GROUND_Y - 3, 16, 3, S[1]);
  }
  // (the sign over them: red enamel, bolted, on two posts)
  for (const px of [cx - 46, cx + 44]) { box(g, px - 1, GROUND_Y - 84, 3, 40, INK); box(g, px, GROUND_Y - 84, 1, 40, '#9CA3AF'); }
  box(g, cx - 53, GROUND_Y - 85, 106, 28, INK); box(g, cx - 52, GROUND_Y - 84, 104, 26, '#DC2626'); box(g, cx - 52, GROUND_Y - 84, 104, 2, '#F87171'); box(g, cx - 52, GROUND_Y - 60, 104, 2, '#991B1B');
  box(g, cx - 50, GROUND_Y - 82, 100, 22, '#B91C1C'); box(g, cx - 49, GROUND_Y - 81, 98, 20, '#DC2626');
  for (const [bx, by] of [[cx - 50, GROUND_Y - 82], [cx + 48, GROUND_Y - 82], [cx - 50, GROUND_Y - 62], [cx + 48, GROUND_Y - 62]] as const) { box(g, bx, by, 2, 2, '#FCA5A5'); }
  signAt(g, 'EXIT ONLY', cx, GROUND_Y - 73, 6, enamel(6, '#FFFFFF', '#7F1D1D')); signAt(g, 'NO RE-ENTRY', cx, GROUND_Y - 63, 6, enamel(6, '#FFFFFF', '#7F1D1D'));
  void signText;
};

/** Where he came in (live: the stamp, then the bunting swaying, the turnstiles' arms, the marquee's bulbs). */
export const drawAmericaExit = (ctx: Ctx, cx: number, f: number) => {
  const lit = timeOfDay().lamps > 0.35, tod = timeOfDay();
  ctx.translate(cx, 0);
  stamp(ctx, `hubExit|${lit}|${tod.key}`, -HALF - 40, TOP - 40, W + 80, GROUND_Y - TOP + 42, g => {
    g.save(); g.beginPath(); g.rect(-HALF, TOP + 30, W, GROUND_Y - TOP - 30); g.clip(); paintStreet(g, 0, lit); g.restore();
    paintArch(g, 0, lit);
  });
  ctx.translate(-cx, 0);
  // (the bulbs round the marquee, chasing)
  const chase = Math.floor(f / 6);
  for (let k = 0; k < 26; k++) { const bx = cx - HALF - 28 + k * ((W + 56) / 25), on = (k + chase) % 3 === 0; box(ctx, bx - 1, TOP + 1, 2, 2, on || lit ? '#FFF7C2' : '#A08A40'); box(ctx, bx - 1, TOP + 27, 2, 2, (k + chase + 1) % 3 === 0 || lit ? '#FFF7C2' : '#A08A40'); }
  // (the bunting under the arch, swagged, swaying: fans of red, white and blue, pleated)
  for (let k = 0; k < 6; k++) {
    const bx = cx - HALF + k * (W / 6), w = W / 6, sag = 12 + Math.sin(f * 0.04 + k) * 1.5;
    for (const [i, col] of ['#DC2626', '#F8FAFC', '#1E3A8A'].entries()) {
      const d = sag - i * 4;
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(bx, TOP + 36); ctx.quadraticCurveTo(bx + w / 2, TOP + 36 + d * 2, bx + w, TOP + 36); ctx.closePath(); ctx.fill();
    }
    for (let p = 1; p < 4; p++) { ctx.fillStyle = 'rgba(26, 16, 40, 0.35)'; ctx.fillRect(Math.round(bx + (p * w) / 4), TOP + 36, 1, Math.round(sag * 0.9)); }
    box(ctx, bx - 1, TOP + 34, 3, 4, '#C9A227');
  }
  // (the turnstiles' arms, turning a touch)
  for (let k = 0; k < 3; k++) {
    const tx = cx - 50 + k * 50, a = Math.sin(f * 0.02 + k) * 0.1;
    for (const r of [0, 2.1, 4.2]) { const ex = tx + Math.cos(r + a) * 18, ey = GROUND_Y - 32 + Math.sin(r + a) * 6; ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tx, GROUND_Y - 32); ctx.lineTo(ex, ey); ctx.stroke(); ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 2; ctx.stroke(); }
    box(ctx, tx - 3, GROUND_Y - 35, 6, 6, '#4B5563');
  }
};
