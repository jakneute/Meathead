// The view out of Piper's windows (the top of the highest spire: the whole park laid out below), by the hour, painted
// into the windows' still art (cached per hour with them). Top to bottom:
//
//   the sky (banded, dithered between; stars after dark), stepped cumulus; the park's neighbors on the far horizon
//   (Hollywood Land's hill and its letters, Jungle Land's temple: glimpse.ts); THE ALPS (snowfields over rock ribs, lit
//   up left, no volcanoes); then the park far below, going away from the castle: HOGSMEAT's roofs and steeple in the
//   snow, THE FAIRY WHEEL (glimpse.ts, small), the frozen lake, the ENCHANTED GLEN's green blot in the middle of the
//   winter (round crowns, blossom), TRUELLING TRAGONS' three tracks knotted round their loops and the plaster mountain;
//   nearest, the castle's own grounds (lawns under patchy snow, the moat iced over, the hedge maze, the broom port's
//   stands and hoops, the lamp-lit paths).

import { box, mix, hash, checker, INK, type Ctx } from '../kit';
import { timeOfDay, skyRamp, farTint, hourMix, skyAt, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { farWheel, farJungle, farHollywood } from '../glimpse';

const poly = (g: Ctx, pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
/** A far color for the hour, hazed toward the sky by k. */
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A7A', 0.2), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);
const LANES = [['#FACC15', '#6D28D9'], ['#EA580C', '#991B1B'], ['#38BDF8', '#1D4ED8']];

/** Paints the view into l..r, top..bot, its horizon (the Alps' feet) at hY. */
export const parkView = (g: Ctx, l: number, r: number, top: number, bot: number, hY: number) => {
  const tod = timeOfDay(), w = r - l, lamps = tod.lamps > 0.35;
  // (the sky: banded, dithered where the bands meet)
  const S = skyRamp(['#23307A', '#3A55B4', '#6E8EDC', '#A8C4F0', '#E8D4F0', '#F8C8D8'], tod);
  const sh = hY - top;
  for (let i = 0; i < S.length; i++) { const y0 = top + (i * sh) / S.length; box(g, l, y0, w, sh / S.length + 1, S[i]); if (i) checker(g, l, y0 - 1, w, 2, S[i], 0, 1); }
  if (tod.stars > 0.3) for (let k = 0; k < 18; k++) box(g, l + hash(k * 3.3) * w, top + hash(k * 7.1) * sh * 0.7, 1, 1, k % 4 ? '#FFFFFF' : '#FFE9A8');
  // (stepped cumulus: a shaded flat base, puffs lit up top)
  const C = ['#8C96C0', '#B4BEE0', '#DCE2F6', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (const [cx, cy, s] of [[l + w * 0.22, top + sh * 0.3, 1], [l + w * 0.78, top + sh * 0.5, 0.75], [l + w * 0.5, top + sh * 0.14, 0.6]] as const) {
    for (const [L, dy] of [[0, 2], [1, 0], [2, -2], [3, -4]] as const) for (let p = 0; p < 4; p++) {
      const px = cx + (p - 1.5) * 9 * s, py = cy - Math.sin((p / 3) * Math.PI) * 6 * s + dy * s, rr = (7 - L) * s;
      g.fillStyle = C[L]; g.beginPath(); g.ellipse(px - (L === 3 ? 2 : 0), py, rr * 1.3, rr * 0.8, 0, 0, Math.PI * 2); g.fill();
    }
    box(g, cx - 20 * s, cy + 5 * s, 40 * s, 2, C[0]); checker(g, cx - 20 * s, cy + 3 * s, 40 * s, 2, C[0], 0, 2);
  }
  // (the neighbors on the far horizon, deep in the haze)
  const TF = farCol(tod, 0.66);
  farHollywood(g, TF, l + w * 0.12, hY - 18);
  farJungle(g, TF, l + w * 0.9, hY - 16);
  // (THE ALPS: jagged, snowfields over the rock, lit on the faces turned up left)
  const TA = farCol(tod, 0.45), Rk = ['#4E4A6E', '#62608A', '#7A78A2'].map(TA), Sn = ['#BCC8E6', '#DCE6F6', '#F6FAFF'].map(TA);
  const ridge = (x: number) => { const u = (x - l) / w; return Math.round((hY - 10 - 30 * Math.abs(Math.sin(u * 7.1 + 0.6)) - 16 * Math.abs(Math.sin(u * 15.3)) - (hash(Math.floor(x / 4)) - 0.5) * 4) / 2) * 2; };
  for (let x = l; x < r; x += 2) {
    const y = ridge(x), lit = ridge(x + 2) < ridge(x - 2), sl = Math.max(y, hY - 14 + Math.round(Math.sin(x * 0.3) * 3));
    box(g, x, sl, 2, hY - sl + 2, Rk[lit ? 2 : 1]); box(g, x, hY - 4, 2, 6, Rk[0]);
    if (sl > y) { box(g, x, y, 2, sl - y, Sn[lit ? 1 : 0]); if (lit) box(g, x, y, 2, 1, Sn[2]); }
  }
  // (the park below, going away from the castle: the snowfields banded down toward us)
  const T = farCol(tod, 0.3), gh = bot - hY;
  const SNOW = ['#C4CCE4', '#D6DEF0', '#E6ECF8', '#F2F6FE'].map(T);
  for (let i = 0; i < 4; i++) { const y0 = hY + (i * gh) / 4; box(g, l, y0, w, gh / 4 + 1, SNOW[3 - i]); if (i) checker(g, l, y0 - 1, w, 2, SNOW[3 - i], 1, 2); }
  const far = (k: number) => hY + gh * k;
  // (Hogsmeat: a huddle of snowy roofs and the steeple, windows lit after dark)
  for (let i = 0; i < 7; i++) {
    const x = l + w * 0.04 + i * 6 + hash(i * 3) * 3, y = far(0.06) + (i % 2) * 2, hw = 4 + hash(i) * 2;
    box(g, x, y, hw, 4, T(['#A8968A', '#8A7E8E', '#B0A08C'][i % 3])); poly(g, [[x - 1, y], [x + hw / 2, y - 3], [x + hw + 1, y]], T('#F4F8FF'));
    if (lamps && hash(i * 7) > 0.3) box(g, x + 1, y + 1, 1, 1, '#FFD88A');
  }
  box(g, l + w * 0.2, far(0.06) - 10, 2, 12, T('#A49AB4')); poly(g, [[l + w * 0.2 - 2, far(0.06) - 10], [l + w * 0.2 + 1, far(0.06) - 18], [l + w * 0.2 + 4, far(0.06) - 10]], T('#3A4058'));
  // (the frozen lake beyond it, skaters' scratches)
  g.fillStyle = T('#9EB6DA'); g.beginPath(); g.ellipse(l + w * 0.42, far(0.1), w * 0.16, 3, 0, 0, Math.PI * 2); g.fill();
  box(g, l + w * 0.34, far(0.1) - 1, w * 0.1, 1, T('#E6EEF8'));
  // (THE FAIRY WHEEL, small: where his first trial was)
  farWheel(g, T, l + w * 0.6, far(0.04) - 16, 13, far(0.07), lamps);
  // (THE ENCHANTED GLEN: a green blot in the middle of the winter, round crowns and blossom, mist on it)
  const GL = ['#1E4826', '#2E6436', '#448248', '#64A460'].map(T), BL = ['#F49AC8', '#C8A8F4', '#FFF0F8'].map(T);
  for (let k = 0; k < 26; k++) {
    const gx = l + w * (0.08 + hash(k * 2.1) * 0.55), gy = far(0.22 + hash(k * 4.3) * 0.12), rr = 3 + hash(k) * 3;
    g.fillStyle = GL[0]; g.beginPath(); g.arc(gx, gy, rr, 0, Math.PI * 2); g.fill();
    g.fillStyle = k % 5 === 0 ? BL[k % 2] : GL[2]; g.beginPath(); g.arc(gx - 1, gy - 1, rr * 0.7, 0, Math.PI * 2); g.fill();
    box(g, gx - 2, gy - rr * 0.6, 2, 1, k % 5 === 0 ? BL[2] : GL[3]);
  }
  // (TRUELLING TRAGONS: the plaster mountain, three tracks knotted round their loops on their legs)
  const tx0 = l + w * 0.52, tx1 = r - 4, tb = far(0.36), mx = tx0 + (tx1 - tx0) * 0.55;
  poly(g, [[mx - 18, tb], [mx - 6, tb - 16], [mx, tb - 20], [mx + 8, tb - 14], [mx + 18, tb]], T('#8A7A88'));
  poly(g, [[mx - 7, tb - 15], [mx, tb - 20], [mx + 7, tb - 15], [mx, tb - 13]], T('#F4F8FF'));
  for (let k = 0; k < 3; k++) {
    const ty = (x: number) => tb - 8 - Math.sin((x - tx0) * 0.16 + k * 2.1) * 5 - k * 2;
    g.strokeStyle = T(mix(LANES[k][1], INK, 0.3)); g.lineWidth = 3; g.beginPath(); for (let x = tx0; x <= tx1; x += 2) (x === tx0 ? g.moveTo(x, ty(x) + 1) : g.lineTo(x, ty(x) + 1)); g.stroke();
    g.strokeStyle = T(LANES[k][0]); g.lineWidth = 1; g.beginPath(); for (let x = tx0; x <= tx1; x += 2) (x === tx0 ? g.moveTo(x, ty(x)) : g.lineTo(x, ty(x))); g.stroke();
    const lx = tx0 + 6 + k * 9, ly = ty(lx) - 5; g.strokeStyle = T(LANES[k][0]); g.beginPath(); g.ellipse(lx, ly, 3, 5, 0, 0, Math.PI * 2); g.stroke();
    for (let x = tx0 + 2; x < tx1; x += 6) box(g, x, ty(x) + 2, 1, tb - ty(x) - 2, T('#7A84A0'));
  }
  // (the castle's own grounds, nearest: the moat iced over, the hedge maze, the broom port's stands and hoops, paths)
  const g0 = far(0.55);
  box(g, l, g0, w, bot - g0, T('#6A8A5A')); checker(g, l, g0, w, bot - g0, T('#E6ECF8'), 0, 3);
  box(g, l, g0, w, 4, T('#DCE4F2')); box(g, l, g0 + 4, w, 3, T('#A8C4E4')); box(g, l, g0 + 4, w, 1, T('#E6F0FA'));
  for (let y = g0 + 10; y < bot - 4; y += 5) for (let x = l + ((y / 5) % 2) * 3; x < l + w * 0.42; x += 7) { box(g, x, y, 5, 3, T('#3E6A3A')); box(g, x, y, 5, 1, T('#F4F8FF')); }
  box(g, l + w * 0.5, g0 + 12, w * 0.36, 5, T('#E8C4D8')); for (let k = 0; k < 8; k++) box(g, l + w * 0.5 + k * 5, g0 + 10, 3, 2, T(['#F45AAE', '#60A5FA', '#F2C84A', '#4ADE80'][k % 4]));
  for (const hx of [l + w * 0.62, l + w * 0.8]) { g.strokeStyle = T('#F2C84A'); g.lineWidth = 1.5; g.beginPath(); g.arc(hx, g0 + 28, 5, 0, Math.PI * 2); g.stroke(); box(g, hx, g0 + 33, 1, 8, T('#A06C1C')); }
  for (let k = 0; k < 7; k++) box(g, l + 6 + k * (w / 7), bot - 8 + (k % 2) * 2, 2, 3, lamps ? '#FFE9A8' : T('#F4F0FA'));
};
