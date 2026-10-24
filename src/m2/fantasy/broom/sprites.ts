// The arena's billboards at peak SNES (each painted once for the hour at twice the old resolution, each with a chain of
// smaller copies, averaged down, so it never shimmers far off: the drawn size picks the copy). Every one faces the eye.
//
//   THE GREAT PIXIE'S CASTLE (its own painter here, at the arena's scale: monument.ts's proportions, Piper's window
//   exactly where monument.ts's PIPER_WINDOW puts it): the crag (rock in steps, moss and flowers, the road up it with
//   its lamps, a cascade), the curtain wall (ashlar, merlons, a gallery of lancets, banners, the gate with its portcullis
//   up and a gilt crest), the corner towers and the far slate towers, the great hall and the chapel behind, THE KEEP
//   (buttresses, two tiers of lancets, a rose window, long banners, a machicolated crown, corner pinnacles), the two
//   near round towers, the side spires, and THE HIGHEST SPIRE (its courses, slits, her window on its balcony, the crown,
//   the tallest cone and its gilt star); guards on the walks, sconces lit after dark.
//   The WATCHTOWERS (a plinth with steps, the drum's courses and slits, lancets lit after dark, a lookout gallery with a
//   guard, banners, the cone and its pennant). The TREES (an oak, a blossom tree, a frosted fairy pine, a spire tree).
//   The BANNER POLES (gilt, a swallowtail pennant in four frames). PIPER'S HOT-AIR BALLOONS (gores in stepped pink and
//   white, a gilt heart crest, ropes, the basket and its riders; the burner's flame is drawn live).

import { timeOfDay, thisHour, multiply, type TimeOfDay } from '../../timeOfDay';
import { INK, hash, checker, SNOW, GOLD, IRON, TIMBER, SLATE } from '../kit';
import { PALE, ROOF, PINK, PLUM, RED, LEAVES, ashlar, merlons, slit, lancet, banner, cone, drum } from '../keep/paint';
import { PIPER_WINDOW } from '../monument';

type Ctx = CanvasRenderingContext2D;

const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const poly = (g: Ctx, col: string, p: number[]) => { g.fillStyle = col; g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.closePath(); g.fill(); };
const disc = (g: Ctx, x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2); g.fill(); };

// ---------------------------------------------------------------------------------------------------------------
// The sprites and their copies

/** A billboard: its copies (full size first, each half the last), where its anchor is on the full one. */
export interface Sprite { mips: HTMLCanvasElement[]; w: number; h: number; ax: number; ay: number }
const cache = new Map<string, Sprite>();
const halve = (src: HTMLCanvasElement) => {
  const cv = document.createElement('canvas'); cv.width = Math.max(1, src.width >> 1); cv.height = Math.max(1, src.height >> 1);
  const g = cv.getContext('2d')!; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(src, 0, 0, cv.width, cv.height);
  return cv;
};
const sprite = (key: string, w: number, h: number, ax: number, ay: number, levels: number, paint: (g: Ctx, tod: TimeOfDay) => void): Sprite => {
  const tod = timeOfDay(), k = `${key}|${tod.key}`;
  let s = thisHour(cache).get(k);
  if (s) return s;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false;
  paint(g, tod);
  const mips = [cv];
  for (let i = 1; i < levels; i++) mips.push(halve(mips[i - 1]));
  s = { mips, w, h, ax, ay };
  cache.set(k, s);
  return s;
};
/** Draw a sprite with its anchor at (x, y), `sc` view px a sprite px (the copy that fits picked, no smoothing). */
export const drawSprite = (g: Ctx, s: Sprite, x: number, y: number, sc: number, flip = false) => {
  let lvl = 0;
  while (lvl < s.mips.length - 1 && sc * (1 << lvl) < 0.6) lvl++;
  const w = Math.max(1, Math.round(s.w * sc)), h = Math.max(1, Math.round(s.h * sc)), x0 = Math.round(x - s.ax * sc), y0 = Math.round(y - s.ay * sc);
  if (flip) { g.save(); g.translate(x0 + w, y0); g.scale(-1, 1); g.drawImage(s.mips[lvl], 0, 0, w, h); g.restore(); }
  else g.drawImage(s.mips[lvl], x0, y0, w, h);
};
/** Copies of any canvas (a suitor's sprite), made once. */
const chains = new WeakMap<HTMLCanvasElement, HTMLCanvasElement[]>();
export const mipsOf = (cv: HTMLCanvasElement, levels = 4) => {
  let m = chains.get(cv);
  if (!m) { m = [cv]; for (let i = 1; i < levels; i++) m.push(halve(m[i - 1])); chains.set(cv, m); }
  return m;
};
/** Draw any canvas at (x0, y0) w by h through its copies. */
export const drawMipped = (g: Ctx, cv: HTMLCanvasElement, x0: number, y0: number, w: number, h: number) => {
  const m = mipsOf(cv), sc = w / cv.width;
  let lvl = 0;
  while (lvl < m.length - 1 && sc * (1 << lvl) < 0.6) lvl++;
  g.drawImage(m[lvl], x0, y0, w, h);
};

const ramps = (tod: TimeOfDay) => {
  const M = (c: string) => multiply(c, tod.mul), R = (r: string[]) => r.map(M);
  return { M, S: R(PALE), Rf: R(ROOF), Gd: R(GOLD), Pk: R(PINK), Pl: R(PLUM), Sl: R(SLATE), Sn: R(SNOW), Ir: R(IRON), Tm: R(TIMBER), Rd: R(RED), Lv: R(LEAVES), Rk: R(['#24203A', '#3A3456', '#544C72', '#706890', '#9088AE', '#B4AECE']) };
};
const winGlow = (tod: TimeOfDay, i: number, M: (c: string) => string) => (tod.lamps > 0.3 ? (hash(i * 1.7) > 0.25 ? (hash(i * 3.1) > 0.5 ? '#FFD88A' : '#F2B060') : M('#3A3060')) : hash(i * 1.7) > 0.85 ? M('#E8B070') : M('#3A3060'));

// ---------------------------------------------------------------------------------------------------------------
// THE CASTLE

/** The castle sprite: 1 px is 1.8 world units (monument.ts's art at 2x: CASTLE_K), its crag's foot at (CX, CY). */
export const CASTLE_K = 2, CASTLE_CX = 360, CASTLE_CY = 960, CASTLE_W = 720, CASTLE_H = 966;

const paintCastle = (g: Ctx, tod: TimeOfDay) => {
  const { M, S, Rf, Gd, Pk, Sl, Sn, Ir, Tm, Lv, Rk } = ramps(tod);
  const lamps = tod.lamps > 0.3;
  g.save(); g.translate(CASTLE_CX, CASTLE_CY);
  const win = (x: number, y: number, w: number, h: number, i: number) => { box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, winGlow(tod, i, M)); if (w > 2) box(g, x, y, 1, h, lamps ? '#FFF4C8' : S[2]); };
  const guard = (x: number, y: number, i: number) => { box(g, x - 2, y - 9, 4, 9, INK); box(g, x - 1, y - 8, 2, 7, M(i % 2 ? '#2E5AAE' : '#C8283E')); box(g, x - 1, y - 11, 3, 3, INK); box(g, x - 1, y - 10, 2, 2, M('#F2C8A0')); box(g, x + 2, y - 16, 1, 15, Ir[4]); box(g, x + 1, y - 17, 3, 2, Ir[5]); };

  // THE CRAG: rock in stepped strata, moss and flowers (the Great Pixie keeps her grounds in bloom), the road up it
  // in switchbacks with lamps, a cascade down its right side into the moat
  poly(g, INK, [-346, 2, -300, -80, -220, -140, -120, -170, 120, -172, 224, -132, 300, -72, 346, 2]);
  poly(g, Rk[2], [-344, 0, -298, -80, -218, -138, -120, -168, 120, -170, 222, -130, 298, -72, 344, 0]);
  poly(g, Rk[3], [-344, 0, -298, -80, -218, -138, -120, -168, -80, -168, -180, -80, -240, 0]);
  poly(g, Rk[4], [-330, -10, -296, -76, -240, -118, -270, -60]);
  poly(g, Rk[1], [120, -170, 222, -130, 298, -72, 344, 0, 180, 0, 160, -80]);
  poly(g, Rk[0], [240, -80, 298, -72, 344, 0, 272, 0]);
  for (let k = 0; k < 16; k++) {
    const y = -8 - k * 10, hw = 340 - k * 14 - (k > 10 ? (k - 10) * 6 : 0);
    for (let x = -hw; x < hw; x += 6 + Math.floor(hash(k * 7 + x) * 10)) { const t = hash(k * 13.1 + x * 0.37); box(g, x, y, 4 + t * 8, 1, t > 0.6 ? Rk[x < 0 ? 4 : 2] : Rk[x < 0 ? 1 : 0]); }
  }
  for (let k = 0; k < 40; k++) { const x = (hash(k * 2.7) - 0.5) * 600, y = -10 - hash(k * 1.9) * 150; if (Math.abs(x) > 340 - (-y) * 1.3) continue; box(g, x, y, 8, 3, Lv[3]); box(g, x + 1, y, 5, 1, Lv[5]); box(g, x + 2, y + 3, 4, 1, Lv[1]); if (k % 3 === 0) box(g, x + 3, y - 1, 1, 1, M(['#F472B6', '#FDE047', '#F4F4F5'][k % 3])); }
  // (ivy up the crag's face, in curtains)
  for (const [x0, len] of [[-250, 70], [-160, 110], [70, 100], [200, 80]] as const) for (let y = -150 + (x0 > 0 ? 10 : 0); y < -150 + len; y += 2) { const x = x0 + Math.sin(y * 0.2 + x0) * 4; box(g, x, y, 3, 2, Lv[2]); box(g, x, y, 1, 1, Lv[4]); }
  // (the road: switchbacks, a low wall along each, lamps)
  const road = [-330, -4, -90, -40, -230, -86, -40, -122, -150, -150, 0, -168];
  g.strokeStyle = INK; g.lineWidth = 9; g.lineJoin = 'round'; g.beginPath(); g.moveTo(road[0], road[1]); for (let i = 2; i < road.length; i += 2) g.lineTo(road[i], road[i + 1]); g.stroke();
  g.strokeStyle = M('#BCA270'); g.lineWidth = 7; g.stroke(); g.strokeStyle = M('#D4BC88'); g.lineWidth = 3; g.stroke();
  for (let i = 0; i + 3 < road.length; i += 2) { const n = 4; for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, x = road[i] + (road[i + 2] - road[i]) * t, y = road[i + 1] + (road[i + 3] - road[i + 1]) * t; box(g, x, y - 14, 2, 11, INK); box(g, x - 2, y - 18, 6, 5, INK); box(g, x - 1, y - 17, 4, 3, lamps ? '#FFD88A' : S[4]); } }
  // (the cascade: water in steps down the rock, foam where it lands)
  for (let y = -150; y < 0; y += 2) { const x = 250 + (y + 150) * 0.35 + Math.sin(y * 0.3) * 2; box(g, x, y, 10, 2, M(y % 6 === 0 ? '#A4CCEE' : '#62A0D8')); box(g, x + 2, y, 2, 2, M('#FFFFFF')); }
  for (let k = 0; k < 10; k++) disc(g, 300 + (hash(k) - 0.5) * 30, -3 - hash(k * 2) * 6, 3 + hash(k * 3) * 3, M('#F4F8FF'));

  // THE FAR RANK behind the curtain wall: slate-roofed towers (the old bones) and the great hall's and chapel's roofs
  for (const [x, top, w] of [[-192, -448, 44], [184, -476, 44], [-250, -380, 36], [262, -400, 34]] as const) {
    drum(g, x, top, -240, w, S, 400 + x, { slits: true });
    cone(g, x, top - 2, w / 2 + 6, 72, Sl, Gd, null, Sn);
    for (let k = 0; k < 3; k++) win(x - 2, top + 30 + k * 44, 5, 12, x + k);
  }
  // (the great hall's long slate roof and dormers, left; the chapel's gable, rose and star spire, right)
  { const x0 = -230, x1 = -96, t = -330; poly(g, INK, [x0 - 6, -258, x0 + 20, t - 1, x1 - 20, t - 1, x1 + 6, -258]); poly(g, Sl[3], [x0 - 4, -258, x0 + 21, t, x1 - 21, t, x1 + 4, -258]); for (let r = 0; r < 10; r++) { const y = -262 - r * 7; for (let x = x0 + r * 2.5; x < x1 - r * 2.5; x += 6) box(g, x, y, 5, 1, r % 2 ? Sl[2] : Sl[1]); } box(g, x0 + 20, t, x1 - x0 - 40, 3, Gd[3]); box(g, x0 + 20, t - 2, x1 - x0 - 40, 2, Sn[4]);
    for (let dx = x0 + 30; dx < x1 - 20; dx += 34) { box(g, dx - 7, t + 22, 14, 18, INK); box(g, dx - 6, t + 23, 12, 17, S[3]); win(dx - 3, t + 27, 6, 9, dx); poly(g, INK, [dx - 9, t + 23, dx, t + 12, dx + 9, t + 23]); poly(g, Sl[4], [dx - 8, t + 22, dx, t + 14, dx + 8, t + 22]); }
    box(g, x0 + 40, t - 30, 10, 30, INK); box(g, x0 + 41, t - 29, 8, 29, M('#A03C2E')); box(g, x0 + 41, t - 29, 2, 29, M('#C25A44')); box(g, x0 + 39, t - 32, 12, 3, Sn[4]); }
  { const cx = 150, t = -336; poly(g, INK, [cx - 52, -258, cx, t - 2, cx + 52, -258]); poly(g, Sl[3], [cx - 50, -258, cx, t, cx + 50, -258]); poly(g, Sl[4], [cx - 50, -258, cx, t, cx - 10, -258]); box(g, cx - 50, -260, 100, 3, Sn[4]);
    disc(g, cx, -282, 13, INK); for (let a = 0; a < 8; a++) { g.fillStyle = lamps ? ['#FFB0D8', '#FFE9A8', '#A8D8FF'][a % 3] : M(['#8A3A6A', '#C8962A', '#3A5AAA'][a % 3]); g.beginPath(); g.moveTo(cx, -282); g.arc(cx, -282, 11, (a / 8) * 6.283, ((a + 1) / 8) * 6.283 - 0.1); g.closePath(); g.fill(); } disc(g, cx, -282, 3, Gd[4]);
    const sx = cx + 36, st = -420; box(g, sx - 7, st, 14, 100, INK); box(g, sx - 6, st, 12, 100, S[3]); box(g, sx - 6, st, 3, 100, S[4]); box(g, sx + 3, st, 3, 100, S[1]); win(sx - 2, st + 20, 4, 12, 71); cone(g, sx, st, 11, 70, Rf, Gd, null, Sn);
    const yy = st - 94; poly(g, Gd[4], [sx, yy - 8, sx + 3, yy - 3, sx + 8, yy - 3, sx + 4, yy + 1, sx + 6, yy + 7, sx, yy + 4, sx - 6, yy + 7, sx - 4, yy + 1, sx - 8, yy - 3, sx - 3, yy - 3]); }

  // THE KEEP: buttressed, two tiers of lancets, the rose window, long banners, a machicolated crown, corner pinnacles
  const k0 = -88, k1 = 88, kTop = -560;
  box(g, k0 - 1, kTop - 1, k1 - k0 + 2, -260 - kTop + 2, INK);
  ashlar(g, k0, kTop, k1 - k0, -260 - kTop, S, 41, 13, 26);
  box(g, k1 - 22, kTop, 22, -260 - kTop, S[2]); checker(g, k1 - 26, kTop, 4, -260 - kTop, S[2], 0, 1); box(g, k1 - 8, kTop, 8, -260 - kTop, S[1]); box(g, k0, kTop, 4, -260 - kTop, S[4]);
  for (const bx2 of [k0 + 8, k1 - 16]) for (const [y0, y1, bw] of [[-380, -260, 16], [-480, -380, 12], [-550, -480, 9]] as const) { box(g, bx2 - 1, y0, bw + 2, y1 - y0, INK); box(g, bx2, y0, bw, y1 - y0, S[4]); box(g, bx2 + bw - 4, y0, 4, y1 - y0, S[2]); box(g, bx2, y0, 2, y1 - y0, S[5]); poly(g, INK, [bx2 - 2, y0 + 2, bx2 + bw / 2, y0 - 8, bx2 + bw + 2, y0 + 2]); poly(g, S[5], [bx2 - 1, y0 + 1, bx2 + bw / 2, y0 - 6, bx2 + bw + 1, y0 + 1]); }
  for (const [ty, wh] of [[-360, 46], [-470, 44]] as const) { box(g, k0, ty + wh + 12, k1 - k0, 3, S[5]); box(g, k0, ty + wh + 15, k1 - k0, 1, S[1]); for (const lx of [-56, 52]) lancet(g, lx, ty, 16, wh, S, ty === -360 ? '#C8306E' : '#3A6ACC', 600 + lx - ty); }
  { const rx = 0, ry = -484; disc(g, rx, ry, 28, INK); disc(g, rx, ry, 26, S[5]); disc(g, rx + 1, ry + 1, 24, S[2]); disc(g, rx, ry, 22, INK);
    for (let a = 0; a < 16; a++) { const an = (a / 16) * 6.283; g.fillStyle = lamps ? ['#FF9AD0', '#FFE9A8', '#C8A8FF', '#A8E0FF'][a % 4] : M(['#B0306E', '#D8A030', '#6A3AAA', '#2E6AAA'][a % 4]); g.beginPath(); g.moveTo(rx, ry); g.arc(rx, ry, 21, an + 0.04, an + Math.PI / 8 - 0.04); g.closePath(); g.fill(); }
    disc(g, rx, ry, 9, INK); disc(g, rx - 3, ry - 1, 4, lamps ? '#FF7AB8' : Pk[2]); disc(g, rx + 3, ry - 1, 4, lamps ? '#FF7AB8' : Pk[2]); poly(g, lamps ? '#FF7AB8' : Pk[2], [rx - 7, ry, rx, ry + 7, rx + 7, ry]); }
  banner(g, -30, -420, 18, 120, Pk, Gd, 'heart'); banner(g, 30, -420, 18, 120, Pk, Gd, 'heart');
  box(g, k0 - 8, kTop - 14, k1 - k0 + 16, 16, INK); box(g, k0 - 7, kTop - 13, k1 - k0 + 14, 14, S[4]); box(g, k0 - 7, kTop - 13, k1 - k0 + 14, 2, S[5]);
  for (let cx = k0 - 4; cx < k1 + 4; cx += 12) { poly(g, INK, [cx, kTop + 1, cx + 8, kTop + 1, cx + 6, kTop + 12, cx + 2, kTop + 12]); poly(g, S[3], [cx + 1, kTop + 1, cx + 7, kTop + 1, cx + 5, kTop + 11, cx + 3, kTop + 11]); }
  merlons(g, k0 - 7, kTop - 14, k1 - k0 + 14, S, 14, 9, 14, true);
  for (const px of [k0 - 8, k1 - 12]) { box(g, px - 1, kTop - 50, 22, 36, INK); box(g, px, kTop - 49, 20, 35, S[3]); box(g, px, kTop - 49, 5, 35, S[4]); box(g, px + 14, kTop - 49, 6, 35, S[1]); cone(g, px + 10, kTop - 50, 13, 60, Rf, Gd, null, Sn); }
  // (flying buttresses from the keep down to the wall)
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(s * 88, kTop + 90); g.quadraticCurveTo(s * 140, kTop + 130, s * 164, -262); g.stroke(); g.strokeStyle = S[3]; g.lineWidth = 4; g.stroke(); g.strokeStyle = S[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(s * 88, kTop + 88); g.quadraticCurveTo(s * 140, kTop + 128, s * 164, -264); g.stroke(); }

  // THE SIDE SPIRES and THE HIGHEST SPIRE (Piper's window on its face, exactly at monument.ts's PIPER_WINDOW)
  for (const [sx2, top] of [[-60, -800], [80, -768]] as const) {
    const b = kTop - 14;
    box(g, sx2 - 9, top, 18, b - top, INK); box(g, sx2 - 8, top, 16, b - top, S[3]); box(g, sx2 - 8, top, 4, b - top, S[4]); box(g, sx2 + 4, top, 4, b - top, S[1]);
    for (let y = top + 8; y < b; y += 10) box(g, sx2 - 8, y, 16, 1, S[2]);
    win(sx2 - 2, top + 22, 4, 12, sx2); slit(g, sx2, top + 70, 14, S);
    box(g, sx2 - 12, top - 3, 24, 5, INK); box(g, sx2 - 11, top - 2, 22, 3, S[5]);
    cone(g, sx2, top - 3, 14, 96, Rf, Gd, sx2 < 0 ? M('#F49AC8') : M('#F6D365'), Sn);
  }
  const W = { x: PIPER_WINDOW.x * CASTLE_K, y: PIPER_WINDOW.y * CASTLE_K }, sx = W.x, sTop = -744, sw = 62;
  box(g, sx - sw / 2 - 1, sTop, sw + 2, kTop - 14 - sTop, INK);
  drum(g, sx, sTop, kTop - 14, sw, S, 99, { band: false, slits: false });
  slit(g, sx - 18, sTop + 24, 14, S); slit(g, sx + 18, sTop + 24, 14, S);
  // (her balcony under the window: a gilt rail on corbels; the window's moulded arch and pink glass (fight.ts draws
  //  its glow, its rose barrier and the close-up over it))
  box(g, W.x - 24, W.y + 26, 48, 6, INK); box(g, W.x - 23, W.y + 27, 46, 4, S[5]); box(g, W.x - 23, W.y + 30, 46, 1, S[1]);
  for (let k = W.x - 20; k < W.x + 22; k += 8) poly(g, S[2], [k, W.y + 32, k + 6, W.y + 32, k + 4, W.y + 40, k + 2, W.y + 40]);
  for (let k = W.x - 22; k <= W.x + 22; k += 4) box(g, k, W.y + 16, 1, 10, Gd[3]);
  box(g, W.x - 23, W.y + 14, 46, 2, Gd[4]); box(g, W.x - 23, W.y + 16, 46, 1, Gd[1]);
  const arch = (r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(W.x - r, W.y + 26); g.lineTo(W.x - r, W.y - 16); g.arc(W.x, W.y - 16, r, Math.PI, 0); g.lineTo(W.x + r, W.y + 26); g.closePath(); g.fill(); };
  arch(20, INK); arch(18, S[5]); arch(16, S[2]); arch(14, INK);
  const PG2 = lamps ? ['#C83A8A', '#F06AB0', '#FF9AD0', '#FFD0EC'] : ['#9A2A6A', '#C8448E', '#E870B0', '#FFB0DA'];
  g.save(); arch(13, PG2[1]); g.clip();
  for (let py = W.y - 30; py < W.y + 26; py += 5) for (let px = W.x - 13; px < W.x + 13; px += 5) { const t = hash(py * 0.7 + px * 1.3); box(g, px, py, 4, 4, PG2[t > 0.7 ? 3 : t > 0.35 ? 2 : 1]); }
  box(g, W.x - 1, W.y - 30, 1, 56, INK); box(g, W.x - 13, W.y - 2, 26, 1, INK); box(g, W.x - 13, W.y + 12, 26, 1, INK);
  g.restore();
  g.fillStyle = Gd[4]; g.beginPath(); g.arc(W.x - 3, W.y - 12, 3, 0, 6.283); g.arc(W.x + 3, W.y - 12, 3, 0, 6.283); g.fill(); poly(g, Gd[4], [W.x - 6, W.y - 11, W.x, W.y - 4, W.x + 6, W.y - 11]);
  merlons(g, sx - sw / 2 - 4, sTop, sw + 8, S, 10, 7, 12, true);
  cone(g, sx, sTop - 16, sw / 2 + 9, 140, Rf, Gd, null, Sn);
  { const yy = sTop - 16 - 140 - 22; poly(g, INK, [sx, yy - 12, sx + 4, yy - 4, sx + 12, yy - 4, sx + 6, yy + 2, sx + 8, yy + 11, sx, yy + 6, sx - 8, yy + 11, sx - 6, yy + 2, sx - 12, yy - 4, sx - 4, yy - 4]);
    poly(g, Gd[4], [sx, yy - 10, sx + 3, yy - 3, sx + 10, yy - 3, sx + 5, yy + 2, sx + 7, yy + 9, sx, yy + 5, sx - 7, yy + 9, sx - 5, yy + 2, sx - 10, yy - 3, sx - 3, yy - 3]); box(g, sx - 2, yy - 6, 2, 3, '#FFFFFF'); }

  // THE NEAR ROUND TOWERS either side of the keep (lancets up them, a banner, cones and pennants)
  for (const [x, top, s2] of [[-124, -552, -1], [124, -516, 1]] as const) {
    drum(g, x, top, -252, 52, S, 400 + x, { windows: 3, glassCol: s2 < 0 ? '#C8306E' : '#3A6ACC', slits: true });
    merlons(g, x - 30, top, 60, S, 10, 6, 12, true);
    cone(g, x, top - 16, 33, 96, Rf, Gd, s2 < 0 ? M('#F49AC8') : M('#F6D365'), Sn);
    banner(g, x, top + 60, 16, 70, s2 < 0 ? Pk : ramps(tod).Pl, Gd, s2 < 0 ? 'crown' : 'star');
  }

  // THE CURTAIN WALL across the crag: ashlar, the gallery of lancets, slits, banners, merlons with guards on the walk
  const wTop = -260, wFoot = -164;
  box(g, -262, wTop - 1, 524, wFoot - wTop + 2, INK);
  ashlar(g, -260, wTop, 520, wFoot - wTop, S, 5, 12, 26);
  box(g, 230, wTop, 30, wFoot - wTop, S[2]); checker(g, 226, wTop, 4, wFoot - wTop, S[2], 0, 1);
  for (let x = -236; x < 236; x += 32) { if (Math.abs(x) < 52) continue; win(x - 2, wTop + 24, 5, 14, x); }
  for (let x = -244; x < 244; x += 20) if (Math.abs(x) > 60) box(g, x, wTop + 60, 1, 8, INK);
  for (const [x, col] of [[-170, 0], [-96, 1], [96, 1], [170, 0]] as const) banner(g, x, wTop + 6, 14, 46, col ? ramps(tod).Rf : Pk, Gd, col ? 'star' : 'heart');
  merlons(g, -260, wTop, 520, S, 14, 9, 14, true);
  for (let k = 0; k < 6; k++) guard(-210 + k * 84, wTop - 18, k);
  // (the gate: a deep arch, the portcullis up in its slot, the passage glowing, a gilt crest over it, sconces)
  g.fillStyle = INK; g.beginPath(); g.moveTo(-34, wFoot); g.lineTo(-34, wFoot - 52); g.arc(0, wFoot - 52, 34, Math.PI, 0); g.lineTo(34, wFoot); g.closePath(); g.fill();
  g.fillStyle = S[1]; g.beginPath(); g.moveTo(-30, wFoot); g.lineTo(-30, wFoot - 52); g.arc(0, wFoot - 52, 30, Math.PI, 0); g.lineTo(30, wFoot); g.closePath(); g.fill();
  g.fillStyle = lamps ? M('#C88A3A') : M('#3A3060'); g.beginPath(); g.moveTo(-24, wFoot); g.lineTo(-24, wFoot - 50); g.arc(0, wFoot - 50, 24, Math.PI, 0); g.lineTo(24, wFoot); g.closePath(); g.fill();
  for (let x = -22; x <= 22; x += 6) box(g, x, wFoot - 74, 2, 18, Gd[2]);
  for (let y = wFoot - 74; y < wFoot - 56; y += 6) box(g, -24, y, 48, 2, Gd[2]);
  box(g, -24, wFoot - 56, 48, 2, Gd[1]);
  for (let k = -3; k <= 3; k++) box(g, k * 6 - 1, wFoot - 56, 2, 4, Gd[3]);
  for (const sx3 of [-44, 40]) { box(g, sx3, wFoot - 60, 4, 10, Ir[3]); box(g, sx3 - 2, wFoot - 64, 8, 4, Ir[4]); if (lamps) { g.globalAlpha = 0.3; disc(g, sx3 + 2, wFoot - 70, 10, '#FDBA74'); g.globalAlpha = 1; } box(g, sx3, wFoot - 70, 4, 6, lamps ? '#FBBF24' : M('#F97316')); }
  poly(g, INK, [0, wFoot - 112, 14, wFoot - 96, 0, wFoot - 80, -14, wFoot - 96]); poly(g, Gd[3], [0, wFoot - 109, 11, wFoot - 96, 0, wFoot - 83, -11, wFoot - 96]); poly(g, Gd[5], [0, wFoot - 109, -11, wFoot - 96, 0, wFoot - 96]); disc(g, 0, wFoot - 96, 4, Pk[3]);
  // THE CORNER TOWERS at the wall's ends, and the mid towers
  for (const [x, top, w] of [[-256, -330, 60], [256, -340, 60], [-128, -300, 40], [134, -306, 40]] as const) {
    drum(g, x, top, wFoot + 4, w, S, 400 + x, { windows: w > 50 ? 2 : 1, glassCol: '#E0AE3A', slits: w > 50 });
    merlons(g, x - w / 2 - 4, top, w + 8, S, 10, 6, 12, true);
    cone(g, x, top - 16, w / 2 + 7, w * 1.4, Rf, Gd, x < 0 ? M('#F49AC8') : M('#F6D365'), Sn);
  }
  // (a cascade of window boxes and a few guards' torches along the crag's top)
  for (let x = -230; x < 230; x += 46) { box(g, x, wFoot - 2, 14, 4, Tm[2]); for (let k = 0; k < 6; k++) box(g, x + 1 + k * 2, wFoot - 4, 1, 2, M(['#F472B6', '#DC2626', '#FDE047'][k % 3])); }
  g.restore();
};

/** THE CASTLE (Piper's window at (CASTLE_CX + PIPER_WINDOW.x * K, CASTLE_CY + PIPER_WINDOW.y * K) on it). */
export const castleSprite = () => sprite('fa-bb-castle', CASTLE_W, CASTLE_H, CASTLE_CX, CASTLE_CY, 6, paintCastle);

// ---------------------------------------------------------------------------------------------------------------
// The watchtowers, the trees, the banner poles, the balloons

/** A watchtower: 1 px 2 world units, its foot at the bottom middle (64, 656). */
export const TOWER_PX = 2;
export const towerSprite = () => sprite('fa-bb-tower', 128, 660, 64, 656, 6, (g, tod) => {
  const { M, S, Rf, Gd, Pk, Ir } = ramps(tod);
  g.save(); g.translate(64, 656);
  // (the plinth and its steps)
  for (let k = 0; k < 3; k++) { const w = 124 - k * 8, y = -k * 6; box(g, -w / 2 - 1, y - 7, w + 2, 7, INK); box(g, -w / 2, y - 6, w, 6, S[3 + (k % 2)]); box(g, -w / 2, y - 6, w, 1, S[5]); box(g, w / 2 - 10, y - 6, 10, 6, S[1]); }
  // (the drum: courses, slits, three lancets lit after dark, a door at its foot)
  drum(g, 0, -470, -18, 100, S, 7, { windows: 3, glassCol: '#C8306E', slits: true });
  box(g, -13, -60, 26, 42, INK); g.fillStyle = INK; g.beginPath(); g.arc(0, -60, 13, Math.PI, 0); g.fill();
  box(g, -11, -60, 22, 42, M('#5E3E2A')); g.fillStyle = M('#5E3E2A'); g.beginPath(); g.arc(0, -60, 11, Math.PI, 0); g.fill();
  for (let x = -9; x < 10; x += 5) box(g, x, -66, 1, 48, M('#3A2416')); box(g, -11, -40, 22, 2, Ir[3]); box(g, 5, -38, 3, 3, Gd[4]);
  // (a long banner down it)
  banner(g, -30, -400, 16, 110, Pk, Gd, 'heart');
  // (the lookout gallery: corbels, a parapet with merlons, a guard with his halberd, a lantern)
  for (let x = -54; x < 54; x += 10) { poly(g, INK, [x, -470, x + 8, -470, x + 6, -456, x + 2, -456]); poly(g, S[3], [x + 1, -470, x + 7, -470, x + 5, -457, x + 3, -457]); }
  box(g, -58, -488, 116, 18, INK); box(g, -57, -487, 114, 16, S[4]); box(g, -57, -487, 114, 2, S[5]); box(g, 40, -487, 17, 16, S[2]);
  merlons(g, -57, -488, 114, S, 12, 8, 12, true);
  box(g, 14, -518, 6, 18, INK); box(g, 15, -517, 4, 12, M('#2E5AAE')); box(g, 14, -524, 6, 6, INK); box(g, 15, -523, 4, 4, M('#F2C8A0')); box(g, 22, -540, 1, 40, Ir[4]); poly(g, Ir[5], [21, -540, 27, -536, 21, -532]);
  box(g, -40, -512, 2, 10, Ir[2]); box(g, -43, -520, 8, 8, INK); box(g, -42, -519, 6, 6, tod.lamps > 0.3 ? '#FFD88A' : M('#C8C6D6'));
  // (the cone and its pennant)
  cone(g, 0, -504, 60, 150, Rf, Gd, M('#F49AC8'));
  g.restore();
});

/** A tree: 1 px 2 world units (scaled to its height), its foot at (64, 276). `v` 0 an oak, 1 a blossom tree, 2 a
 *  frosted fairy pine, 3 a spire tree. */
export const treeSprite = (v: number) => sprite(`fa-bb-tree${v}`, 128, 280, 64, 276, 5, (g, tod) => {
  const { M, Tm, Sn } = ramps(tod), R = (r: string[]) => r.map(M);
  g.save(); g.translate(64, 276);
  const blob = (x: number, y: number, r: number, Rr: string[]) => { disc(g, x, y, r + 1, INK); disc(g, x, y, r, Rr[1]); disc(g, x - r * 0.12, y - r * 0.14, r * 0.84, Rr[2]); disc(g, x - r * 0.3, y - r * 0.32, r * 0.56, Rr[3]); disc(g, x - r * 0.42, y - r * 0.46, r * 0.24, Rr[4]); checker(g, x - r, y + r * 0.35, r * 2, r * 0.5, Rr[0], 0, 2); };
  if (v <= 1) {
    const L2 = v === 0 ? R(['#0E2410', '#163618', '#204A20', '#2E6228', '#407C34', '#62A04C']) : R(['#5A1E3A', '#8A3060', '#B84A86', '#DA72AA', '#F2A2CA', '#FFD6EA']);
    box(g, -9, -90, 18, 90, INK); box(g, -8, -90, 16, 90, Tm[3]); box(g, -8, -90, 4, 90, Tm[4]); box(g, 3, -90, 5, 90, Tm[1]);
    for (let y = -84; y < 0; y += 7) box(g, -6 + ((y / 7) % 2) * 6, y, 4, 1, Tm[1]);
    poly(g, INK, [-10, -2, -26, 2, -8, -14]); poly(g, INK, [10, -2, 24, 2, 8, -14]);
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(0, -80); g.lineTo(-34, -130); g.moveTo(0, -96); g.lineTo(30, -150); g.stroke(); g.strokeStyle = Tm[3]; g.lineWidth = 3; g.stroke();
    for (const [x, y, r] of [[-30, -150, 30], [32, -164, 28], [0, -200, 40], [-22, -230, 26], [24, -226, 24], [0, -150, 30]] as const) blob(x, y, r, L2);
    if (v === 1) for (let k = 0; k < 60; k++) { const x = (hash(k * 1.3) - 0.5) * 110, y = -130 - hash(k * 2.1) * 130; box(g, x, y, 2, 2, k % 3 ? M('#FFD6EA') : M('#FFFFFF')); }
    else for (let k = 0; k < 10; k++) { const x = (hash(k * 1.3) - 0.5) * 90, y = -140 - hash(k * 2.1) * 100; box(g, x, y, 3, 3, M('#C8283E')); box(g, x, y, 1, 1, M('#FFB0B0')); }
    // (a toadstool at its foot)
    poly(g, INK, [16, -1, 18, -10, 30, -10, 32, -1]); box(g, 21, -9, 6, 9, M('#F4F4F5')); g.fillStyle = INK; g.beginPath(); g.ellipse(24, -11, 11, 7, 0, Math.PI, 0); g.fill(); g.fillStyle = M('#D8302A'); g.beginPath(); g.ellipse(24, -11, 10, 6, 0, Math.PI, 0); g.fill(); box(g, 19, -15, 3, 2, M('#FFFFFF')); box(g, 26, -13, 2, 2, M('#FFFFFF'));
  } else {
    const F = R(['#061410', '#0C221C', '#143228', '#1E4436', '#2C5A48', '#447A62']);
    box(g, -6, -40, 12, 40, INK); box(g, -5, -40, 10, 40, Tm[3]); box(g, -5, -40, 3, 40, Tm[4]);
    const tiers = v === 2 ? 6 : 9, top = v === 2 ? -270 : -276;
    for (let t = 0; t < tiers; t++) {
      const y0 = top + t * ((v === 2 ? 236 : 240) / tiers), half = v === 2 ? 14 + t * 9 : 8 + t * 3.4, hgt = v === 2 ? 52 : 36;
      poly(g, INK, [0, y0 - 2, half + 2, y0 + hgt, -half - 2, y0 + hgt]);
      poly(g, F[2], [0, y0, half, y0 + hgt - 2, -half, y0 + hgt - 2]);
      poly(g, F[3], [0, y0, -half * 0.2, y0 + hgt - 2, -half, y0 + hgt - 2]);
      poly(g, F[1], [0, y0, half, y0 + hgt - 2, half * 0.5, y0 + hgt - 2]);
      for (let k = -half + 4; k < half - 2; k += 6) box(g, k, y0 + hgt - 4, 3, 2, F[k < 0 ? 4 : 1]);
      if (v === 2) { box(g, -half + 2, y0 + hgt - 6, half * 2 - 4, 3, Sn[4]); box(g, -half + 3, y0 + hgt - 7, half, 1, Sn[5]); for (let k = -half + 4; k < half - 4; k += 7) box(g, k, y0 + hgt - 3, 2, 3 + (k & 1) * 2, Sn[3]); }
    }
    if (v === 2) { poly(g, Sn[5], [0, top - 2, 4, top + 10, -4, top + 10]); }
    else { box(g, -1, top - 14, 2, 14, ramps(tod).Gd[3]); poly(g, M('#F6D365'), [0, top - 22, 3, top - 16, 0, top - 10, -3, top - 16]); }
    for (let k = 0; k < 8; k++) { const y = top + 30 + hash(k * 3.1) * 190, x = (hash(k * 1.7) - 0.5) * (v === 2 ? 60 : 30); box(g, x, y, 2, 2, tod.lamps > 0.3 ? ['#FFE9A8', '#FFB0D8', '#A8E0FF'][k % 3] : M(['#E8C870', '#F49AC8', '#9CC8E8'][k % 3])); }
  }
  g.restore();
});

/** A banner pole: 1 px 2 world units, its foot at (12, 336); the pennant in four frames (it flaps). */
export const flagSprite = (frame: number) => sprite(`fa-bb-flag${frame & 3}`, 84, 340, 12, 336, 5, (g, tod) => {
  const { Gd, Pk, S } = ramps(tod);
  g.save(); g.translate(12, 336);
  box(g, -9, -10, 18, 10, INK); box(g, -8, -9, 16, 9, S[3]); box(g, -8, -9, 16, 2, S[5]); box(g, 4, -9, 4, 9, S[1]);
  box(g, -3, -320, 6, 312, INK); box(g, -2, -320, 4, 312, Gd[3]); box(g, -2, -320, 1, 312, Gd[5]); box(g, 1, -320, 1, 312, Gd[1]);
  for (let y = -300; y < -12; y += 40) { box(g, -4, y, 8, 3, INK); box(g, -3, y + 1, 6, 1, Gd[4]); }
  disc(g, 0, -326, 6, INK); disc(g, 0, -326, 5, Gd[3]); disc(g, -1.5, -327.5, 2, Gd[5]);
  const f = frame & 3, wv = (x: number) => Math.sin(x * 0.12 + f * 1.57) * 5 * (x / 70);
  const top = -312, len = 70, hgt = 46;
  const pts: number[] = [2, top];
  for (let x = 0; x <= len; x += 7) pts.push(2 + x, top + wv(x) + x * 0.06);
  pts.push(2 + len - 14, top + hgt / 2 + wv(len)); pts.push(2 + len, top + hgt + wv(len) - len * 0.06);
  for (let x = len; x >= 0; x -= 7) pts.push(2 + x, top + hgt + wv(x) - x * 0.06);
  poly(g, INK, pts);
  g.save(); g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.clip();
  box(g, 0, top - 20, len + 4, hgt + 40, Pk[3]);
  for (let x = 0; x < len; x += 7) { const sh = Math.cos(x * 0.12 + f * 1.57); box(g, 3 + x, top - 20, 7, hgt + 40, sh > 0.4 ? Pk[4] : sh < -0.4 ? Pk[2] : Pk[3]); }
  box(g, 0, top + 4, len + 4, 3, Gd[3]); box(g, 0, top + hgt - 7, len + 4, 3, Gd[3]);
  g.fillStyle = Gd[4]; const hx = 26, hy = top + hgt / 2 + wv(26); g.beginPath(); g.arc(hx - 4, hy - 2, 5, 0, 6.283); g.arc(hx + 4, hy - 2, 5, 0, 6.283); g.fill(); poly(g, Gd[4], [hx - 9, hy, hx, hy + 9, hx + 9, hy]);
  g.restore();
  g.restore();
});

/** One of Piper's hot-air balloons: 1 px 2 world units, its middle at (80, 92). */
export const BALLOON_AX = 80, BALLOON_AY = 92;
export const balloonSprite = () => sprite('fa-bb-balloon', 160, 240, BALLOON_AX, BALLOON_AY, 5, (g, tod) => {
  const { M, Gd, Pk, Tm } = ramps(tod);
  const cx = 80, cy = 92, rx = 74, ry = 86;
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, cy, rx + 2, ry + 2, 0, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(cx - rx * 0.62, cy + ry * 0.7); g.quadraticCurveTo(cx, cy + ry * 1.45, cx + rx * 0.62, cy + ry * 0.7); g.fill();
  g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 6.283); g.moveTo(cx - rx * 0.6, cy + ry * 0.7); g.quadraticCurveTo(cx, cy + ry * 1.42, cx + rx * 0.6, cy + ry * 0.7); g.clip();
  // (the gores: pink and white, each stepped across (lit left, shaded right), banded down in the curve)
  const n = 10;
  for (let k = 0; k < n; k++) {
    const a0 = -Math.PI / 2 + (k / n) * Math.PI, a1 = -Math.PI / 2 + ((k + 1) / n) * Math.PI;
    const x0 = cx + Math.sin(a0) * rx, x1 = cx + Math.sin(a1) * rx, light = 1 - k / n;
    const Rr = k % 2 ? [M('#C8B8D8'), M('#E4DAEE'), M('#FFFFFF')] : [Pk[2], Pk[3], Pk[4]];
    box(g, x0, cy - ry - 2, x1 - x0 + 1, ry * 2.5, Rr[light > 0.66 ? 2 : light > 0.33 ? 1 : 0]);
    box(g, x1 - 1, cy - ry, 1, ry * 2.4, Rr[0]);
  }
  for (let y = cy - ry; y < cy + ry * 1.4; y += 14) { g.globalAlpha = 0.18; box(g, cx - rx, y + 10, rx * 2, 4, INK); g.globalAlpha = 1; }
  box(g, cx - rx, cy + ry * 0.46, rx * 2, 6, Gd[3]); box(g, cx - rx, cy + ry * 0.46, rx * 2, 1, Gd[5]);
  for (let x = cx - rx; x < cx + rx; x += 8) poly(g, Gd[3], [x, cy + ry * 0.46 + 6, x + 8, cy + ry * 0.46 + 6, x + 4, cy + ry * 0.46 + 12]);
  g.globalAlpha = 0.25; g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(cx - rx * 0.4, cy - ry * 0.45, rx * 0.22, ry * 0.3, -0.3, 0, 6.283); g.fill(); g.globalAlpha = 1;
  g.restore();
  // (the crest: a gilt-framed heart with a P)
  disc(g, cx, cy - 6, 22, INK); disc(g, cx, cy - 6, 20, Gd[3]); disc(g, cx - 1, cy - 7, 17, Gd[4]); disc(g, cx, cy - 6, 15, M('#FFE4F2'));
  g.fillStyle = Pk[2]; g.beginPath(); g.arc(cx - 5, cy - 9, 6, 0, 6.283); g.arc(cx + 5, cy - 9, 6, 0, 6.283); g.fill(); poly(g, Pk[2], [cx - 11, cy - 6, cx, cy + 6, cx + 11, cy - 6]);
  box(g, cx - 2, cy - 13, 2, 12, '#FFFFFF'); box(g, cx - 2, cy - 13, 6, 2, '#FFFFFF'); box(g, cx + 3, cy - 12, 2, 4, '#FFFFFF'); box(g, cx - 2, cy - 8, 6, 2, '#FFFFFF');
  // (the ropes, the burner frame, the basket in wicker steps, two riders waving)
  const by = cy + ry * 1.48;
  g.strokeStyle = INK; g.lineWidth = 2; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 30, cy + ry * 1.2); g.lineTo(cx + s * 16, by); g.stroke(); }
  box(g, cx - 10, by - 14, 20, 4, INK); box(g, cx - 9, by - 13, 18, 2, M('#9AA2B8'));
  box(g, cx - 4, by - 10, 4, 8, INK); box(g, cx - 3, by - 9, 2, 6, M('#2C2C38')); box(g, cx + 6, by - 10, 4, 8, INK); box(g, cx + 7, by - 9, 2, 6, M('#C8283E'));
  box(g, cx - 4, by - 13, 4, 4, M('#F2C8A0')); box(g, cx + 6, by - 13, 4, 4, M('#7A4A2A')); box(g, cx + 10, by - 18, 2, 7, M('#7A4A2A'));
  box(g, cx - 18, by - 2, 36, 26, INK); box(g, cx - 17, by - 1, 34, 24, Tm[3]);
  for (let y = by; y < by + 22; y += 4) for (let x = cx - 17 + ((y / 4) % 2) * 3; x < cx + 17; x += 6) box(g, x, y, 4, 2, Tm[4]);
  box(g, cx - 17, by - 1, 34, 3, Tm[5]); box(g, cx + 9, by - 1, 8, 24, Tm[1]); box(g, cx - 17, by + 20, 34, 3, Tm[1]);
});
