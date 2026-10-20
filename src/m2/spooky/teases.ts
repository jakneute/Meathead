// Spooky Land's own set pieces seen far off from its other sections (painted once an hour into a held canvas or a
// backdrop's stamp), to the look they have up close now:
//   DRACULA'S OTHER CASTLE (town/buildings.ts's, at the top of the stairs): the curtain wall in lilac-gray dressed
//     stone, coursed (each block its own tone, lit along its top), battlements, pilasters; the keep up the middle behind
//     it, its battlements, the purple slate spike and the red flag; the round towers' candle-snuffer roofs at its ends;
//     the red bat banners; pointed windows (lit red after dark); the big arched oak door between its torches; ivy.
//   THE ELEVATOR TO HELL's clock tower is walkAway/spookyTown.ts's own painter (drawTowerIntact), used as it is.
// Everything takes `T` (into the layer's haze and the hour's light) and paints on whole pixels; nothing on it's lit
// along a top like a ledge (none of it's to stand on).

import { INK as INK0, box, checker, mix, hash } from '../intro/art/kit';
import { STONE } from './town/paint';

type Ctx = CanvasRenderingContext2D;
type Tint = (col: string) => string;

const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };

/**
 * Dracula's other castle far off, the middle of its wall's foot at (x, foot), `h` px from its foot to the flag's top
 * (its wall's 0.6 h wide). Windows lit red after dark (`lamps`).
 */
export const farOtherCastle = (g: Ctx, x: number, foot: number, h: number, T: Tint, lamps: number) => {
  const u = h / 200, P = (n: number) => Math.round(n * u);
  const INK = T(INK0), S = STONE.map(c => T(mix(c, '#2E1E40', 0.1)));
  const R = ['#1A0A2E', '#2A1048', '#3B0764', '#561A8A', '#7A3AAE'].map(T);
  const glow = lamps > 0.3, win = glow ? T('#9A3A22') : S[1], win2 = glow ? '#E07A3A' : S[2];
  x = Math.round(x); foot = Math.round(foot);
  const W = P(124), wl = x - Math.round(W / 2), wr = wl + W, wt = foot - P(124);
  // The keep behind the wall, up the middle: coursed, two lancets, battlements, the purple spike, the flag
  const kx = wl + P(55), kw = P(30), kt = wt - P(40);
  box(g, kx - 1, kt - 1, kw + 2, wt - kt + 2, INK);
  for (let y = kt, r = 0; y < wt; y += 4, r++) for (let xx = kx + (r % 2) * 3; xx < kx + kw; xx += 6) { box(g, xx, y, Math.min(5, kx + kw - xx), 3, S[hash(xx * 0.3 + y) > 0.6 ? 4 : 3]); box(g, xx, y, Math.min(5, kx + kw - xx), 1, S[5]); }
  box(g, kx, kt, 2, wt - kt, S[5]); box(g, kx + kw - 4, kt, 4, wt - kt, S[2]);
  for (const lx of [kx + Math.round(kw * 0.3), kx + Math.round(kw * 0.62)]) { box(g, lx - 1, kt + P(10), 4, P(12), INK); box(g, lx, kt + P(10) + 1, 2, P(12) - 2, win); if (glow) box(g, lx, kt + P(10) + 1, 1, P(12) - 2, win2); }
  for (let xx = kx - 2; xx < kx + kw + 2; xx += 5) { box(g, xx - 1, kt - 5, 5, 6, INK); box(g, xx, kt - 4, 3, 4, S[4]); box(g, xx, kt - 4, 3, 1, S[6]); }
  const sp = kt - P(28);
  poly(g, [[kx - 4, kt - 3], [kx + kw / 2, sp - 2], [kx + kw + 4, kt - 3]], INK);
  poly(g, [[kx - 3, kt - 4], [kx + kw / 2, sp], [kx + kw + 3, kt - 4]], R[2]);
  poly(g, [[kx - 3, kt - 4], [kx + kw / 2, sp], [kx + kw / 2, kt - 4]], R[3]);
  poly(g, [[kx - 3, kt - 4], [kx + kw / 2, sp], [kx + kw * 0.22, kt - 4]], R[4]);
  for (let y = sp + 4; y < kt - 4; y += 3) { const k = (y - sp) / (kt - 4 - sp); box(g, Math.round(kx + kw / 2 - k * (kw / 2 + 3)), y, Math.round(k * (kw + 6)), 1, R[1]); }
  const fx = Math.round(kx + kw / 2);
  box(g, fx - 1, sp - P(14), 2, P(15), INK);
  poly(g, [[fx + 1, sp - P(14)], [fx + P(12), sp - P(12)], [fx + P(9), sp - P(10)], [fx + P(12), sp - P(8)], [fx + 1, sp - P(9)]], T('#7F1D1D'));
  poly(g, [[fx + 1, sp - P(14)], [fx + P(12), sp - P(12)], [fx + 1, sp - P(12)]], T('#B91C1C'));
  // The round towers at the wall's ends: banded round, candle-snuffer roofs in the slate
  for (const [tx, th] of [[wl - P(4), P(132)], [wr + P(4), P(140)]] as const) {
    const tw = P(18), tt = foot - th, tl = tx - Math.round(tw / 2);
    box(g, tl - 1, tt - 1, tw + 2, th + 1, INK);
    for (let k = 0; k < tw; k++) box(g, tl + k, tt, 1, th, S[k < tw * 0.18 ? 5 : k < tw * 0.4 ? 4 : k < tw * 0.7 ? 3 : k < tw * 0.85 ? 2 : 1]);
    for (let y = tt + 4; y < foot; y += 4) checker(g, tl, y, tw, 1, S[1]);
    for (const wy of [tt + P(14), tt + P(36)]) { box(g, tx - 2, wy, 4, P(7), INK); box(g, tx - 1, wy + 1, 2, P(7) - 2, win); }
    const rt = tt - P(30);
    poly(g, [[tl - 4, tt + 1], [tx, rt - 1], [tl + tw + 4, tt + 1]], INK);
    poly(g, [[tl - 3, tt], [tx, rt], [tl + tw + 3, tt]], R[2]); poly(g, [[tl - 3, tt], [tx, rt], [tx - 2, tt]], R[4]); poly(g, [[tx + 3, tt], [tx, rt], [tl + tw + 3, tt]], R[1]);
    box(g, tx - 1, rt - P(6), 2, P(6), INK);
  }
  // The curtain wall: dressed stone in courses, each block its own tone, lit along its top; battlements; pilasters
  box(g, wl - 1, wt - 1, W + 2, foot - wt + 1, INK);
  for (let y = wt, r = 0; y < foot; y += 4, r++) for (let xx = wl + (r % 2 ? -3 : 0); xx < wr; xx += 7) {
    const a = Math.max(wl, xx), b = Math.min(wr, xx + 7), t = hash(xx * 0.13 + y * 0.71);
    if (b - a < 2) continue;
    box(g, a, y, b - a - 1, 3, S[t > 0.75 ? 4 : t > 0.3 ? 3 : 2]); box(g, a, y, b - a - 1, 1, S[5]);
  }
  box(g, wl, wt, 3, foot - wt, S[5]); checker(g, wl, foot - P(18), W, P(9), S[1]); box(g, wl, foot - P(9), W, P(9), S[1]);
  for (let xx = wl; xx < wr - 2; xx += P(10)) { box(g, xx - 1, wt - P(6), P(6) + 2, P(6) + 1, INK); box(g, xx, wt - P(6) + 1, P(6), P(6) - 1, S[3]); box(g, xx, wt - P(6) + 1, P(6), 1, S[5]); }
  for (const px of [wl + P(28), wr - P(32)]) { box(g, px, wt, P(4), foot - wt, S[4]); box(g, px, wt, 1, foot - wt, S[5]); box(g, px + P(4) - 1, wt, 1, foot - wt, S[1]); }
  // (the bat banners, hung from their rods, tails cut)
  for (const bx of [wl + P(20), wr - P(22)]) {
    const bt = wt + P(10), bb = wt + P(46);
    box(g, bx - P(5), bt - 1, P(10), 1, INK);
    poly(g, [[bx - P(4), bt], [bx + P(4), bt], [bx + P(4), bb], [bx, bb - P(4)], [bx - P(4), bb]], T('#7F1D1D'));
    box(g, bx - P(4), bt, 1, bb - bt - 2, T('#991B1B')); box(g, bx - P(4), bt + 2, P(8), 1, T('#D09A30'));
    box(g, bx - 1, bt + P(14), 3, 2, INK); box(g, bx - 3, bt + P(13), 2, 1, INK); box(g, bx + 2, bt + P(13), 2, 1, INK);
  }
  // (pointed windows along it in rows, lit red after dark)
  for (let row = 0; row < 3; row++) for (let wx = wl + P(14); wx < wr - P(10); wx += P(22)) {
    if (Math.abs(wx - (wl + P(20))) < P(6) || Math.abs(wx - (wr - P(22))) < P(6)) continue;
    const wy = wt + P(10) + row * P(26);
    box(g, wx - 1, wy - 1, 5, P(10) + 2, INK); box(g, wx, wy, 3, P(10), win); box(g, wx + 1, wy - 2, 1, 2, INK);
    if (glow && hash(wx + row) > 0.4) box(g, wx, wy, 1, P(10), win2);
  }
  // (the door: a big pointed arch, oak, its torches either side)
  const dl = wr - P(28), dr = wr - P(8), dt = foot - P(30);
  poly(g, [[dl - 2, foot], [dl - 2, dt], [(dl + dr) / 2, dt - P(8)], [dr + 2, dt], [dr + 2, foot]], INK);
  poly(g, [[dl, foot], [dl, dt + 1], [(dl + dr) / 2, dt - P(6)], [dr, dt + 1], [dr, foot]], T('#4A2E1A'));
  for (let xx = dl + 3; xx < dr; xx += 3) box(g, xx, dt - P(4), 1, foot - dt + P(4), T('#2E1A0E'));
  for (const tx of [dl - 4, dr + 3]) { box(g, tx, foot - P(22), 2, 4, INK); box(g, tx, foot - P(25), 2, 3, glow ? '#F59E0B' : T('#B45309')); }
  // (ivy up the wall's foot)
  for (let k = 0; k < 4; k++) { const ix = wl + P(6) + k * P(26); for (let y = foot - 2; y > foot - P(28) - k * P(9); y -= 2) box(g, ix + Math.round(Math.sin(y * 0.3 + k) * 2), y, 2, 2, (y >> 1) % 3 ? T('#1E3A1E') : T('#2E5A26')); }
};
