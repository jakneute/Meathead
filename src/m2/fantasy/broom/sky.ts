// The arena's sky (on the 400x300 view): a banded gradient by the hour, and round the whole horizon (rings that wrap with
// his heading, each painted once for the hour): stars after dark, the moon, high cirrus and stepped cumulus; THE ALPS
// (snowfields, rock ribs, hazed; no volcanoes); and the far park right on the horizon (snowy hills, pines, turrets and
// spires, Hogsmeat's roofs and steeple, the fairy wheel lit up after dark, Truelling Tragons' three loops, Rapunzel's
// tower, the beanstalk up into its cloud, a windmill, the frozen lake's glint). Live over it: the sun by day, birds by
// day and fireworks after dark, all at their own bearings (turn and they stay where they are).

import { timeOfDay, thisHour, multiply, skyAt, skyRamp, cloudTint, drawStars, drawMoon, type TimeOfDay } from '../../timeOfDay';
import { bandedGradient } from '../../intro/art/kit';
import { hash, mix, INK } from '../kit';
import { W, FOCAL } from './world';

type Ctx = CanvasRenderingContext2D;

/** The ring's width: 360 degrees at this focal length. */
export const LW = Math.round((W * Math.PI * 2) / (2 * Math.atan(W / 2 / FOCAL)));
const SKY_H = 700, SKY_HZ = 470, CLOUD_H = 210, ALPS_H = 70, PARK_H = 40;
const SKY = ['#22327E', '#3A5ABA', '#6890DA', '#A0C0EE', '#DAD6F2', '#F6CCDC'];

const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const poly = (g: Ctx, col: string, p: number[]) => { g.fillStyle = col; g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.closePath(); g.fill(); };

const layers = new Map<string, HTMLCanvasElement>();
const layer = (key: string, w: number, h: number, paint: (g: Ctx, tod: TimeOfDay) => void) => {
  const tod = timeOfDay(), k = key + tod.key;
  let cv = thisHour(layers).get(k);
  if (!cv) { cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d')!; g.imageSmoothingEnabled = false; paint(g, tod); layers.set(k, cv); }
  return cv;
};
/** Where something at a bearing (radians, clockwise from north) sits on the ring. */
const ringX = (b: number) => ((((b / (Math.PI * 2)) * LW + W / 2) % LW) + LW) % LW;
const D = Math.PI / 180;
/** Something at ring x, `n` times wrapped (drawn at each place it lands across the seam). */
const wrapped = (x: number, w: number, fn: (x: number) => void) => { fn(x); if (x < w) fn(x + LW); if (x > LW - w) fn(x - LW); };
/** A far color for the hour, then into the sky's haze by k. */
const far = (tod: TimeOfDay, k: number) => (c: string) => mix(multiply(c, tod.mul), skyAt(0.9, tod), k);

const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  drawStars(g, 0, 0, LW, CLOUD_H - 20, 0, 0, tod, 1);
  drawMoon(g, ringX(300 * D), 46, 9, tod);
  // (cirrus, high: streaks in two tints, dithered off their ends)
  const Ci = ['#C8D0EE', '#E4E8F8', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (let i = 0; i < 26; i++) {
    const x = hash(i * 4.7) * LW, y = 10 + hash(i * 2.9) * 60, w = 30 + hash(i * 1.3) * 80;
    for (let k = 0; k < 3; k++) wrapped(x + k * w * 0.2, w + 20, xx => { box(g, xx, y + k * 2, w * (1 - k * 0.25), 1, Ci[k % 2]); for (let d = 0; d < 8; d += 2) box(g, xx + w * (1 - k * 0.25) + d, y + k * 2, 1, 1, Ci[0]); });
  }
  // (stepped cumulus, lower: a shaded base, the body, lit tops, a dithered skirt)
  const C = ['#8C96C0', '#B4BEE0', '#DCE2F6', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (let i = 0; i < 22; i++) {
    const cx = (i + 0.5) * (LW / 22) + (hash(i * 3.3) - 0.5) * 40, base = CLOUD_H - 8 - hash(i * 5.1) * 70, s = 0.6 + hash(i * 7.7) * 0.9, puffs = 3 + Math.floor(hash(i * 1.9) * 4);
    wrapped(cx, 80, x => {
      for (const [L, dy, k] of [[0, 2, 1], [1, 0, 0.9], [2, -2, 0.72], [3, -4, 0.42]] as const) for (let p = 0; p < puffs; p++) {
        const px = x + (p - puffs / 2) * 9 * s, py = base - Math.sin((p / Math.max(1, puffs - 1)) * Math.PI) * 10 * s + dy * s, r = (6 + hash(i * 11 + p) * 5) * s * k;
        g.fillStyle = C[L]; g.beginPath(); g.ellipse(Math.round(px - (L === 3 ? 2 : 0)), Math.round(py), Math.max(1, r * 1.3), Math.max(1, r * 0.8), 0, 0, Math.PI * 2); g.fill();
      }
      box(g, x - puffs * 4.5 * s, base + 4 * s, puffs * 9 * s, 2, C[0]);
      for (let d = 0; d < puffs * 9 * s; d += 2) box(g, x - puffs * 4.5 * s + d, base + 4 * s + 2, 1, 1, C[0]);
    });
  }
  // (the beanstalk's cloud, its giant's castle on it, south-south-east)
  wrapped(ringX(150 * D), 40, x => { for (let k = 0; k < 5; k++) { g.fillStyle = C[1 + (k % 3)]; g.beginPath(); g.ellipse(x - 16 + k * 8, CLOUD_H - 70 - (k % 2) * 4, 10, 6, 0, 0, Math.PI * 2); g.fill(); } const T = far(tod, 0.35); box(g, x - 6, CLOUD_H - 86, 12, 10, T('#8A84A0')); box(g, x - 8, CLOUD_H - 92, 3, 16, T('#8A84A0')); box(g, x + 5, CLOUD_H - 94, 3, 18, T('#8A84A0')); });
};

/** The Alps: a ridge round the whole horizon, snowfields lit on the faces to the light, rock ribs, the haze at their feet. */
const paintAlps = (g: Ctx, tod: TimeOfDay) => {
  const T = far(tod, 0.5), ROCK = ['#4E4A6E', '#62608A', '#7A78A2', '#9694BC'].map(T), SN = ['#9CA8CC', '#BCC8E6', '#DCE6F6', '#F6FAFF'].map(T);
  const peaks: [number, number, number][] = [];
  for (let i = 0; i < 34; i++) peaks.push([(i / 34) * LW + hash(i * 3.7) * 30, 18 + hash(i * 1.7) * 40, 0.55 + hash(i * 5.3) * 0.6]);
  const ridge = (x: number) => { let top = 0; for (const [px, h, sl] of peaks) for (const o of [0, LW, -LW]) { const d = Math.abs(x - px - o); top = Math.max(top, h - d * sl * (0.9 + 0.25 * Math.sin(d * 0.1 + px))); } return Math.round(ALPS_H - Math.max(8, top) + Math.sin(x * 0.7) * 0.8); };
  const snowLine = (x: number) => Math.round(ALPS_H - 26 + Math.sin(x * 0.05) * 6 + Math.sin(x * 0.31) * 2);
  for (let x = 0; x < LW; x++) {
    const y = ridge(x), lit = ridge(x + 1) < ridge(x - 1), sl = Math.max(y, snowLine(x));
    box(g, x, sl, 1, ALPS_H - sl, ROCK[lit ? 2 : 1]); box(g, x, ALPS_H - 12, 1, 12, ROCK[lit ? 1 : 0]);
    if (sl > y) { box(g, x, y, 1, sl - y, SN[lit ? 2 : 1]); if (lit) box(g, x, y, 1, 1, SN[3]); }
    if (x % 17 === 0) for (let k = 0; k < 10; k++) box(g, x + Math.round(Math.sin(k * 0.6 + x) * 1), sl + k, 1, 1, SN[1]);
  }
  for (const [px] of peaks) for (let y = ridge(px) + 3, x = px; y < ALPS_H - 8; y++, x += Math.sin(y * 0.4) * 0.6) box(g, x, y, 1, 1, ROCK[0]);
  // (the haze along their feet, in steps)
  const hz = skyAt(0.92, tod);
  for (let k = 0; k < 4; k++) { g.globalAlpha = 0.18 + k * 0.14; box(g, 0, ALPS_H - 16 + k * 4, LW, 4, hz); }
  g.globalAlpha = 1;
};

/** The far park, right on the horizon: snowy hills and pines all round, turrets and spires, and the landmarks at their
 *  bearings from the castle (as the ground has them). */
const paintPark = (g: Ctx, tod: TimeOfDay) => {
  const T = far(tod, 0.38), H = PARK_H, lamps = tod.lamps > 0.3;
  const hill = (x: number) => Math.round(H - 12 - Math.abs(Math.sin(x * 0.013 + 1)) * 6 - Math.sin(x * 0.051) * 2);
  const HL = ['#5E6C98', '#7482AE', '#93A0C8', '#B8C4E0', '#E8EEF8', '#FFFFFF'].map(T);
  for (let x = 0; x < LW; x++) { const y = hill(x), lit = hill(x + 1) <= hill(x - 1); box(g, x, y, 1, 2, HL[lit ? 5 : 4]); box(g, x, y + 2, 1, 3, HL[lit ? 3 : 2]); box(g, x, y + 5, 1, H - y - 5, HL[lit ? 2 : 1]); }
  // (landmarks)
  const at = (deg: number, fn: (x: number) => void) => wrapped(ringX(deg * D), 30, fn);
  const turret = (x: number, foot: number, w: number, h: number, roof: string, i: number) => {
    box(g, x - w / 2 - 1, foot - h, w + 2, h, T(INK)); box(g, x - w / 2, foot - h, w, h, T('#C8BCD8')); box(g, x - w / 2, foot - h, 1, h, T('#E8E0F0')); box(g, x + w / 2 - 1, foot - h, 1, h, T('#9C90B4'));
    if (h > 6) box(g, x, foot - h + 2, 1, 2, lamps && hash(i) > 0.3 ? '#FFD88A' : T('#4A4066'));
    poly(g, T(roof), [x - w / 2 - 1, foot - h, x, foot - h - w * 1.6, x + w / 2 + 1, foot - h]); box(g, x - w / 2 - 1, foot - h - 1, w + 2, 1, T('#F4F8FF'));
  };
  // (Hogsmeat (south-west): crooked snowy roofs, the steeple, the clock tower, smoke)
  at(220, x => { for (let k = 0; k < 16; k++) { const rx = x - 34 + k * 4.4, hgt = 3 + hash(k * 1.3) * 4, y = H - 11; box(g, rx, y - hgt, 4, hgt, T('#6A5A5A')); poly(g, T('#F2F6FC'), [rx - 1, y - hgt, rx + 2, y - hgt - 3, rx + 5, y - hgt]); if (lamps && hash(k * 2.3) > 0.4) box(g, rx + 1, y - hgt + 1, 1, 1, '#FFD88A'); } box(g, x - 4, H - 30, 3, 19, T('#5A5070')); poly(g, T('#3A3452'), [x - 5, H - 30, x - 2.5, H - 40, x, H - 30]); box(g, x + 10, H - 26, 5, 15, T('#7A6A6A')); box(g, x + 11, H - 24, 3, 3, lamps ? '#FFF4D8' : T('#F4ECD8')); poly(g, T('#4A4060'), [x + 9, H - 26, x + 12.5, H - 31, x + 16, H - 26]); for (let k = 0; k < 4; k++) box(g, x - 20 + k * 9, H - 22 - k % 2 * 2, 1, 2, T('#C8C8D8')); });
  // (the fairy wheel (south-east))
  at(136, x => { const cy = H - 26; g.strokeStyle = T('#E8A8D8'); g.lineWidth = 1; g.beginPath(); g.arc(x, cy, 10, 0, Math.PI * 2); g.stroke(); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.beginPath(); g.moveTo(x, cy); g.lineTo(x + Math.cos(a) * 10, cy + Math.sin(a) * 10); g.stroke(); box(g, x + Math.cos(a) * 10 - 1, cy + Math.sin(a) * 10, 2, 2, lamps ? ['#FFD88A', '#FFB0D8', '#A8E0FF'][k % 3] : T(['#F472B6', '#FDE047', '#60A5FA'][k % 3])); } poly(g, T('#5A4E7A'), [x - 7, H - 11, x, cy, x + 7, H - 11, x + 6, H - 11, x, cy + 2, x - 6, H - 11]); });
  // (Truelling Tragons (east): three tracks in loops)
  at(86, x => { ['#FACC15', '#EF4444', '#60A5FA'].forEach((col, k) => { g.strokeStyle = T(col); g.lineWidth = 1; g.beginPath(); for (let s = 0; s <= 40; s++) { const xx = x - 24 + s * 1.2 + k * 4, yy = H - 13 - Math.abs(Math.sin(s * 0.2 + k)) * (8 + k * 2); if (s) g.lineTo(xx, yy); else g.moveTo(xx, yy); } g.stroke(); g.beginPath(); g.arc(x - 6 + k * 8, H - 20 - k, 4, 0, Math.PI * 2); g.stroke(); }); poly(g, T('#8A84A0'), [x + 18, H - 11, x + 24, H - 22, x + 30, H - 11]); box(g, x + 22, H - 22, 3, 2, T('#FFFFFF')); });
  // (Rapunzel's tower (north-east), its braid; the beanstalk (south-south-east) up into its cloud; a windmill (north))
  at(48, x => { turret(x, H - 10, 4, 18, '#D8609E', 48); box(g, x + 2, H - 26, 1, 14, T('#F6D365')); });
  at(150, x => { for (let y = H - 11; y > -6; y -= 1) box(g, x + Math.round(Math.sin(y * 0.3) * 2), y, 2, 1, T(y % 3 ? '#2E6228' : '#407C34')); });
  at(14, x => { box(g, x - 2, H - 20, 5, 9, T('#C8B8A0')); poly(g, T('#7A5A24'), [x - 3, H - 20, x + 0.5, H - 24, x + 4, H - 20]); g.strokeStyle = T('#5A4030'); g.lineWidth = 1; for (let k = 0; k < 4; k++) { const a = k * 1.571 + 0.3; g.beginPath(); g.moveTo(x, H - 21); g.lineTo(x + Math.cos(a) * 8, H - 21 + Math.sin(a) * 8); g.stroke(); } });
  at(356, x => { box(g, x - 30, H - 11, 60, 2, T('#DCEAF8')); box(g, x - 22, H - 11, 18, 1, T('#FFFFFF')); });
  // (turrets and spires of the other lands, all round; pines between: nowhere bare)
  for (let i = 0; i < 46; i++) { const x = (i / 46) * LW + hash(i * 2.3) * 20; if ([220, 136, 86, 48, 150, 14].some(d => Math.abs(((x - ringX(d * D) + LW * 1.5) % LW) - LW / 2) < 34)) continue; turret(x, H - 10 - hash(i) * 2, 3 + hash(i * 1.7) * 3, 6 + hash(i * 3.1) * 10, ['#3E68C4', '#D8609E', '#6A4090', '#B02A42'][i % 4], i); }
  for (let x = 2; x < LW; x += 3 + Math.floor(hash(x) * 4)) { const y = hill(x) + 2, h = 4 + hash(x * 1.3) * 6; poly(g, T('#22403E'), [x, y - h, x + 2, y, x - 2, y]); box(g, x - 1, y - h * 0.5, 2, 1, T('#E8EEF8')); }
  // (the near rim of the park: a dark band of forest right on the horizon)
  for (let x = 0; x < LW; x++) box(g, x, H - 8 - (x % 5 === 0 ? 2 : x % 3 === 0 ? 1 : 0), 1, 8, T('#1E3424'));
  for (let x = 0; x < LW; x += 2) box(g, x, H - 2, 1, 2, T('#2A4630'));
};

const wrap = (g: Ctx, cv: HTMLCanvasElement, off: number, y: number) => { const x = -Math.round(off); g.drawImage(cv, x, Math.round(y)); g.drawImage(cv, x + LW, Math.round(y)); };

/** The sky, its clouds, the Alps and the far park (the horizon at `hy`, his heading `yaw`), the sun, birds or
 *  fireworks live. */
export const drawSky = (g: Ctx, yaw: number, hy: number, f: number) => {
  const tod = timeOfDay();
  const sky = layer('fa-bb-sky2', W, SKY_H, gg => bandedGradient(gg, 0, 0, W, SKY_HZ, skyRamp(SKY, tod), 22, 1));
  g.fillStyle = skyRamp(SKY, tod)[SKY.length - 1]; g.fillRect(0, Math.round(hy), W, 4);
  g.drawImage(sky, 0, Math.round(hy - SKY_HZ));
  const off = ((((yaw / (Math.PI * 2)) * LW) % LW) + LW) % LW;
  wrap(g, layer('fa-bb-clouds2', LW, CLOUD_H, paintClouds), off, hy - CLOUD_H - 20);
  // (the sun by day, at its bearing, low or high with the hour; its glow in rings)
  const up = Math.max(0, Math.min(1, (tod.sunH + 0.12) / 0.2));
  if (up > 0.02) {
    const sx = onView(200, off), sy = hy - 40 - tod.sunH * 80;
    for (const x of [sx, sx - LW]) {
      if (x < -30 || x > W + 30) continue;
      g.globalAlpha = up * 0.2; g.fillStyle = tod.sunGlow; for (let k = 3; k >= 1; k--) { g.beginPath(); g.arc(Math.round(x), Math.round(sy), 7 + k * 4, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = up; g.beginPath(); g.arc(Math.round(x), Math.round(sy), 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = tod.sun; g.beginPath(); g.arc(Math.round(x), Math.round(sy), 6, 0, Math.PI * 2); g.fill();
      g.fillStyle = mix(tod.sun, '#FFFFFF', 0.6); g.beginPath(); g.arc(Math.round(x - 1), Math.round(sy - 1), 3, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;
    }
  }
  if (tod.lamps > 0.45) fireworks(g, off, hy, f); else birds(g, off, hy, f);
  wrap(g, layer('fa-bb-alps2', LW, ALPS_H, paintAlps), off, hy - ALPS_H + 2);
  wrap(g, layer('fa-bb-park2', LW, PARK_H, paintPark), off, hy - PARK_H + 2);
};

/** Where a bearing lands on the view this frame (it wraps). */
const onView = (deg: number, off: number) => ((ringX(deg * D) - off) % LW + LW) % LW;

const FW_COLS = [['#FFE9A8', '#F6C84A'], ['#FFB0D8', '#F472B6'], ['#A8E8FF', '#60A5FA'], ['#C8FFB8', '#4ADE80'], ['#E8C8FF', '#C084FC']];
/** Fireworks over the far park (after dark): a rocket's streak up, a burst in two rings of stepped dots, falling. */
const fireworks = (g: Ctx, off: number, hy: number, f: number) => {
  for (let n = 0; n < 9; n++) {
    const per = 120 + n * 17, t = (f + n * 37) % per, id = Math.floor((f + n * 37) / per) * 9 + n;
    if (t > 70) continue;
    const x = onView(n * 40 + hash(id * 1.3) * 30, off), y = hy - 40 - hash(id * 2.7) * 60, cols = FW_COLS[id % 5];
    if (x < -40 || x > W + 40) continue;
    if (t < 16) { box(g, x, y + (16 - t) * 3, 1, 2, '#FFE9C8'); continue; }
    const s = t - 16, r = 3 + s * 0.6 - s * s * 0.005, a = Math.max(0, 1 - s / 54);
    g.globalAlpha = a;
    for (let k = 0; k < 14; k++) { const an = (k / 14) * Math.PI * 2 + id; box(g, x + Math.cos(an) * r, y + Math.sin(an) * r + s * s * 0.004, 1, 1, cols[0]); box(g, x + Math.cos(an) * r * 0.6, y + Math.sin(an) * r * 0.6 + s * s * 0.003, 1, 1, cols[1]); }
    if (s < 3) box(g, x - 1, y - 1, 3, 3, '#FFFFFF');
    g.globalAlpha = 1;
  }
};
/** Birds by day: little flocks wheeling at their bearings. */
const birds = (g: Ctx, off: number, hy: number, f: number) => {
  g.fillStyle = '#2A2840';
  for (let fl = 0; fl < 6; fl++) {
    const x0 = onView(fl * 61 + f * 0.01 * (fl % 2 ? 1 : -1), off), y0 = hy - 60 - (fl % 3) * 22 + Math.sin(f * 0.01 + fl) * 6;
    if (x0 < -30 || x0 > W + 30) continue;
    for (let k = 0; k < 5; k++) {
      const x = x0 - Math.abs(k - 2) * 5, y = y0 + Math.abs(k - 2) * 3, up = Math.sin(f * 0.25 + k + fl) > 0 ? -1 : 0;
      g.fillRect(Math.round(x - 2), Math.round(y + up), 2, 1); g.fillRect(Math.round(x), Math.round(y), 1, 1); g.fillRect(Math.round(x + 1), Math.round(y + up), 2, 1);
    }
  }
};
