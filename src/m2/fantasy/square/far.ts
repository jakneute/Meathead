// The town square's far off (screen space: the backdrop), every layer painted once for the hour into a tile and slid
// along (only the smoke, the snow and the castle's sparkles live):
//
//   the sky by the hour (a storybook winter blue down to a pink blush, banded, dithered between), stepped cumulus
//   drifting; the ALPS far off (jagged peaks, real snowfields and rock ribs, no volcanoes); THE GREAT PIXIE'S CASTLE on
//   its crag among them (monument.ts: the smallest it ever is, drifting as he goes); the park beyond the village (a
//   rolling pine ridge, the frozen lake with skaters' scratches, THE FAIRY WHEEL turning its lights on after dark,
//   TRUELLING TRAGONS' three tracks knotted round their loops, gift-shop turrets with their pennants); and nearest,
//   HOGSMEAT's own roofs past the street (crooked, snow-heaped, chimneys smoking, the steeple, the clock tower, the
//   owlery, banners), their windows lit warm. Snow coming down, far flakes behind the shopfronts.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { snap2, wave, jag, mist } from '../../adventure/farArt';
import { stamp, hazeBands, pixelBlob } from '../../intro/art/kit';
import { box, mix, hash, checker, INK, type Ctx } from '../kit';
import { MONUMENT_AT, drawCastleAt } from '../monument';
import { SECTIONS } from '../geometry';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Where the horizon sits on screen (it drifts down as the camera climbs the Grand Staircase). */
export const horizonY = (state: GameState) => Math.round(440 + Math.max(-20, Math.min(80, (50 - state.camera.y) * 0.1)));

/** The square's own sky, top to horizon: a storybook winter blue down to a pink blush. */
const SKY = ['#283A8C', '#3E62BE', '#6A8EDA', '#9CBAEE', '#D4D6F4', '#F4CADE'];

/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  const tod = timeOfDay();
  for (let x = -(((off % tw) + tw) % tw); x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, `fa-sq-${key}-${tod.key}`, 0, 0, tw, h, paint); c.restore(); }
};
/** A far layer's color for the hour: toward dusk and night, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A7A', 0.2), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);
const winLit = (tod: TimeOfDay, i: number) => tod.lamps > 0.3 ? (hash(i * 1.7) > 0.3 ? (hash(i * 3.1) > 0.5 ? '#FFD88A' : '#F2B060') : null) : (hash(i * 1.7) > 0.7 ? '#E8B070' : null);

// ---------------------------------------------------------------------------------------------------------------
// Clouds: stepped cumulus

const CW = 960, CH = 150;
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#8C96C0', '#B4BEE0', '#DCE2F6', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (let i = 0; i < 9; i++) {
    const cx = (i * CW) / 9 + hash(i * 3.3) * 60, cy = 40 + hash(i * 5.1) * 70, s = 0.6 + hash(i * 7.7) * 0.8;
    const puffs = 4 + Math.floor(hash(i) * 4);
    for (const [L, dy, k] of [[0, 3, 1], [1, 0, 0.92], [2, -3, 0.75], [3, -6, 0.45]] as const) {
      for (let p = 0; p < puffs; p++) {
        const px = cx + (p - puffs / 2) * 16 * s, py = cy - Math.sin((p / Math.max(1, puffs - 1)) * Math.PI) * 14 * s + dy * s;
        const r = (12 + hash(i * 11 + p) * 10) * s * k;
        for (const ox of [0, CW, -CW]) pixelBlob(g, px + ox - (L === 3 ? 4 : 0), py, r * 1.3, r * 0.8, C[L]);
      }
    }
    // (a flat, shaded base)
    for (const ox of [0, CW, -CW]) { box(g, cx + ox - puffs * 8 * s, cy + 10 * s, puffs * 16 * s, 3, C[0]); checker(g, cx + ox - puffs * 8 * s, cy + 8 * s, puffs * 16 * s, 2, C[0], 0, 2); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The Alps, far off

const MW = 1100, MH = 250;
const PEAKS: [number, number, number][] = [[60, 170, 1.1], [190, 205, 1.3], [300, 150, 0.9], [420, 230, 1.4], [540, 175, 1.0], [640, 196, 1.2], [770, 140, 0.8], [880, 214, 1.35], [1000, 160, 1.0]];
const ridge = (x: number) => {
  let top = 0;
  for (const [px, h, sl] of PEAKS) for (const o of [0, MW, -MW]) { const d = Math.abs(x - px - o); top = Math.max(top, h - d * sl * (0.9 + 0.25 * Math.sin(d * 0.05 + px))); }
  return snap2(MH - Math.max(30, top) + jag(x, MW, 6, 3) * 6);
};
const snowLine = (x: number) => snap2(MH - 112 + wave(x, MW, 2.2, 2) * 18 + jag(x, MW, 10, 7) * 10);
const paintAlps = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.5);
  const ROCK = ['#4E4A6E', '#62608A', '#7A78A2', '#9694BC'].map(T), SN = ['#9CA8CC', '#BCC8E6', '#DCE6F6', '#F6FAFF'].map(T);
  for (let x = 0; x < MW; x += 2) {
    const y = ridge(x), s = ridge(x + 2) - ridge(x - 2), lit = s < 0, sl = Math.max(y, snowLine(x));
    // (rock below the snowline: lit on the faces turned to the upper left, banded down into shade)
    box(g, x, sl, 2, MH - sl, ROCK[lit ? 2 : 1]);
    box(g, x, MH - 40, 2, 40, ROCK[lit ? 1 : 0]);
    if (hash(x * 0.37) > 0.6) box(g, x, sl + 4 + hash(x) * 60, 2, 2 + hash(x * 2) * 8, ROCK[lit ? 3 : 0]);
    // (the snowfields over it: lit, shade, the crest catching the sun)
    if (sl > y) { box(g, x, y, 2, sl - y, SN[lit ? 2 : 1]); if (lit) box(g, x, y, 2, 2, SN[3]); }
    // (snow tongues down the gullies)
    if (Math.floor(x / 2) % 23 === 0) for (let k = 0; k < 40; k += 2) box(g, x + Math.round(Math.sin(k * 0.2 + x) * 2), sl + k, 2, 2, SN[1]);
  }
  // (the rock ribs: dark seams down from the peaks)
  for (const [px] of PEAKS) for (let k = 0; k < 3; k++) {
    const x0 = px + (k - 1) * 22;
    for (let y = ridge(x0) + 6, x = x0; y < MH - 20; y += 2, x += k - 1 + Math.round(Math.sin(y * 0.15)) * 0.5) box(g, Math.round(x), y, 2, 2, ROCK[0]);
  }
  mist(g, MW, MH - 70, 70, skyAt(0.92, tod), 0, 0.7, 6);
};

// ---------------------------------------------------------------------------------------------------------------
// The park beyond the village: the pine ridge, the lake, the fairy wheel, Truelling Tragons, turrets

const PW = 1700, PH = 190;
const pineRidge = (x: number) => snap2(PH - 60 + wave(x, PW, 4.4, 2) * 10 + jag(x, PW, 8, 11) * 4);
const farPine = (g: Ctx, x: number, foot: number, h: number, P: string[], S: string) => {
  for (let k = 0; k < 4; k++) {
    const y = foot - h + (k * h) / 4, half = 2 + (k + 1) * (h / 9);
    g.fillStyle = P[0]; g.beginPath(); g.moveTo(x, y - 2); g.lineTo(x + half, y + h / 4); g.lineTo(x - half, y + h / 4); g.closePath(); g.fill();
    g.fillStyle = P[1]; g.beginPath(); g.moveTo(x, y - 2); g.lineTo(x, y + h / 4); g.lineTo(x - half, y + h / 4); g.closePath(); g.fill();
    box(g, x - half * 0.7, y + h / 4 - 2, half * 1.1, 2, S);
  }
};
/** THE FAIRY WHEEL (far: the next trial). */
const WHEEL = { x: 1260, r: 78 };
const paintWheel = (g: Ctx, T: (c: string) => string, tod: TimeOfDay) => {
  const cx = WHEEL.x, cy = PH - 30 - WHEEL.r - 14, r = WHEEL.r;
  // (the A-frame legs)
  g.strokeStyle = T('#5A4E7A'); g.lineWidth = 3;
  g.beginPath(); g.moveTo(cx - 44, PH - 30); g.lineTo(cx, cy); g.lineTo(cx + 44, PH - 30); g.moveTo(cx - 34, PH - 30); g.lineTo(cx, cy); g.lineTo(cx + 34, PH - 30); g.stroke();
  // (the spokes, the rim in pink and gold, the gondolas hanging plumb)
  g.strokeStyle = T('#C8A8D8'); g.lineWidth = 1;
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke(); }
  g.strokeStyle = T('#E87AB8'); g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = T('#F6C84A'); g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, r - 2, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(cx, cy, r * 0.62, 0, Math.PI * 2); g.stroke();
  const cols = ['#F49AC8', '#9CD0F4', '#F6D365', '#B8A0F0', '#A8E8C8', '#F4A878'];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.13, gx = cx + Math.cos(a) * r, gy = cy + Math.sin(a) * r;
    box(g, gx, gy, 1, 4, T('#4A3E6A'));
    box(g, gx - 5, gy + 4, 11, 8, T(INK)); box(g, gx - 4, gy + 5, 9, 6, T(cols[i % 6])); box(g, gx - 4, gy + 5, 9, 2, T(mix(cols[i % 6], '#FFFFFF', 0.4))); box(g, gx - 3, gy + 3, 7, 2, T(mix(cols[i % 6], INK, 0.3)));
    if (tod.lamps > 0.3) box(g, gx - 2, gy + 7, 5, 2, '#FFE9A8');
  }
  // (the bulbs round the rim after dark; the hub's gold boss and its pink heart)
  if (tod.lamps > 0.3) for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; box(g, cx + Math.cos(a) * r - 1, cy + Math.sin(a) * r - 1, 2, 2, i % 2 ? '#FFE9A8' : '#FFB0D8'); }
  g.fillStyle = T('#F6C84A'); g.beginPath(); g.arc(cx, cy, 7, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#E0408A'); g.beginPath(); g.arc(cx - 2, cy - 1, 2.4, 0, Math.PI * 2); g.arc(cx + 2, cy - 1, 2.4, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(cx - 4.4, cy); g.lineTo(cx, cy + 4); g.lineTo(cx + 4.4, cy); g.closePath(); g.fill();
  // (its boarding house at the foot: a pink pavilion)
  box(g, cx - 30, PH - 44, 60, 14, T('#E8C8E0')); box(g, cx - 30, PH - 44, 60, 2, T('#FFF0F8'));
  g.fillStyle = T('#C8508E'); g.beginPath(); g.moveTo(cx - 34, PH - 44); g.lineTo(cx, PH - 60); g.lineTo(cx + 34, PH - 44); g.closePath(); g.fill();
};
/** TRUELLING TRAGONS (far): three tracks, knotted round each other and their loops, on a lattice of legs. */
const paintTragons = (g: Ctx, T: (c: string) => string) => {
  const x0 = 290, x1 = 740, base = PH - 32;
  const trackY = (k: number, x: number) => base - 40 - Math.sin((x - x0) * 0.018 + k * 2.1) * 26 - Math.sin((x - x0) * 0.041 + k) * 12 - k * 6;
  // (the legs: thin gray lattice from each track down)
  for (let x = x0; x < x1; x += 14) for (let k = 0; k < 3; k++) { const y = trackY(k, x); box(g, x, y, 1, base - y, T('#6A6488')); if (x % 28 === 0) { g.strokeStyle = T('#5A5478'); g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 6); g.lineTo(x + 14, base); g.stroke(); } }
  const TR = ['#D8402E', '#7AC8F0', '#F2D24A'];
  for (let k = 0; k < 3; k++) {
    g.strokeStyle = T(mix(TR[k], INK, 0.4)); g.lineWidth = 4; g.beginPath();
    for (let x = x0; x <= x1; x += 4) (x === x0 ? g.moveTo(x, trackY(k, x) + 1) : g.lineTo(x, trackY(k, x) + 1));
    g.stroke();
    g.strokeStyle = T(TR[k]); g.lineWidth = 2; g.beginPath();
    for (let x = x0; x <= x1; x += 4) (x === x0 ? g.moveTo(x, trackY(k, x)) : g.lineTo(x, trackY(k, x)));
    g.stroke();
    // (its loop: a vertical ring standing up off the track)
    const lx = x0 + 110 + k * 120, ly = trackY(k, lx) - 26;
    g.strokeStyle = T(mix(TR[k], INK, 0.4)); g.lineWidth = 4; g.beginPath(); g.ellipse(lx, ly, 18, 26, 0, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = T(TR[k]); g.lineWidth = 2; g.beginPath(); g.ellipse(lx, ly, 18, 26, 0, 0, Math.PI * 2); g.stroke();
    box(g, lx - 1, ly + 26, 2, base - ly - 26, T('#6A6488'));
  }
  // (the station: a gothic shed with a dragon's head over its door)
  const sx = x1 - 40;
  box(g, sx - 26, base - 34, 52, 34, T('#6A5E86')); box(g, sx - 26, base - 34, 52, 2, T('#8E84AA'));
  g.fillStyle = T('#3A3458'); g.beginPath(); g.moveTo(sx - 30, base - 34); g.lineTo(sx, base - 56); g.lineTo(sx + 30, base - 34); g.closePath(); g.fill();
  box(g, sx - 4, base - 18, 8, 18, T('#2A2440'));
  g.fillStyle = T('#4A8A5A'); g.beginPath(); g.moveTo(sx - 8, base - 44); g.lineTo(sx + 12, base - 48); g.lineTo(sx + 8, base - 40); g.closePath(); g.fill();
};
/** A gift-shop turret: a round tower, a cone roof, its pennant. */
const turret = (g: Ctx, T: (c: string) => string, x: number, foot: number, w: number, h: number, roof: string, tod: TimeOfDay, i: number) => {
  box(g, x - w / 2, foot - h, w, h, T('#C8BCD8')); box(g, x - w / 2, foot - h, w * 0.3, h, T('#E2D8EE')); box(g, x + w * 0.2, foot - h, w * 0.3, h, T('#A498BC'));
  for (let k = 0; k < Math.floor(h / 14); k++) { const c = winLit(tod, i * 7 + k); box(g, x - 1, foot - h + 6 + k * 14, 3, 5, c ?? T('#5A5070')); }
  g.fillStyle = T(roof); g.beginPath(); g.moveTo(x - w / 2 - 3, foot - h); g.lineTo(x, foot - h - w * 1.4); g.lineTo(x + w / 2 + 3, foot - h); g.closePath(); g.fill();
  g.fillStyle = T(mix(roof, '#FFFFFF', 0.3)); g.beginPath(); g.moveTo(x - w / 2 - 3, foot - h); g.lineTo(x, foot - h - w * 1.4); g.lineTo(x - w * 0.15, foot - h); g.closePath(); g.fill();
  box(g, x - w / 2 - 3, foot - h - 2, w + 6, 2, T('#F4F8FF'));
  box(g, x, foot - h - w * 1.4 - 8, 1, 8, T('#4A4060')); g.fillStyle = T('#F49AC8'); g.beginPath(); g.moveTo(x + 1, foot - h - w * 1.4 - 8); g.lineTo(x + 9, foot - h - w * 1.4 - 6); g.lineTo(x + 1, foot - h - w * 1.4 - 4); g.closePath(); g.fill();
};
const paintPark = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.36), P = ['#2A4A4A', '#3E6460'].map(T), S = T('#E8EEF8');
  // (the pine ridge behind it all)
  g.fillStyle = T('#34525A'); g.beginPath(); g.moveTo(0, PH);
  for (let x = 0; x <= PW; x += 4) g.lineTo(x, pineRidge(x));
  g.lineTo(PW, PH); g.closePath(); g.fill();
  for (let x = 4; x < PW; x += 9) { const y = pineRidge(x); farPine(g, x + hash(x) * 4, y + 6, 12 + hash(x * 1.3) * 12, P, S); }
  paintTragons(g, T);
  paintWheel(g, T, tod);
  turret(g, T, 120, PH - 30, 14, 40, '#4A78D4', tod, 1);
  turret(g, T, 150, PH - 30, 10, 28, '#C8508E', tod, 2);
  turret(g, T, 880, PH - 30, 16, 48, '#6A4A9A', tod, 3);
  turret(g, T, 1010, PH - 30, 12, 34, '#4A78D4', tod, 4);
  turret(g, T, 1540, PH - 30, 18, 56, '#C8508E', tod, 5);
  turret(g, T, 1580, PH - 30, 11, 30, '#3A8A6A', tod, 6);
  // (the snowy meadow down to the lake; the lake, iced over: banded, skaters' scratches, the far shore's reflection)
  box(g, 0, PH - 30, PW, 10, T('#D8E2F2')); box(g, 0, PH - 30, PW, 2, T('#F4F8FF'));
  const ICE = ['#8EA8D0', '#A6BEE0', '#BED2EC'].map(T);
  for (let i = 0; i < 3; i++) box(g, 0, PH - 20 + i * 6, PW, 6, ICE[2 - i]);
  checker(g, 0, PH - 15, PW, 1, ICE[1], 0, 1); checker(g, 0, PH - 9, PW, 1, ICE[0], 1, 1);
  for (let i = 0; i < 40; i++) { const x = hash(i * 2.3) * PW, y = PH - 18 + hash(i * 4.1) * 14; box(g, x, y, 6 + hash(i) * 14, 1, T('#E6EEF8')); }
  mist(g, PW, PH - 70, 60, skyAt(0.9, tod), 0.1, 0.45, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// Hogsmeat's own roofs, past the street

const RW = 1440, RH = 270, RG = RH - 50;
interface Roof { x: number; w: number; h: number; kind: 'house' | 'steeple' | 'clock' | 'owlery' | 'turret' | 'pine'; seed: number }
const ROOFS: Roof[] = (() => {
  const out: Roof[] = [];
  let x = 0, i = 0;
  while (x < RW - 30) {
    const s = i * 7 + 3, special = i % 9 === 4 ? (['steeple', 'clock', 'owlery', 'turret'] as const)[Math.floor(i / 9) % 4] : null;
    if (special) { const w = special === 'steeple' ? 46 : special === 'clock' ? 56 : special === 'owlery' ? 50 : 38; out.push({ x, w, h: special === 'turret' ? 110 : 150, kind: special, seed: s }); x += w + 4; }
    else if (hash(s) > 0.84) { out.push({ x, w: 26, h: 50 + hash(s * 2) * 30, kind: 'pine', seed: s }); x += 22; }
    else { const w = 44 + Math.floor(hash(s * 1.3) * 50); out.push({ x, w, h: 46 + hash(s * 2.1) * 60, kind: 'house', seed: s }); x += w + 2 + Math.floor(hash(s * 3) * 6); }
    i++;
  }
  return out;
})();
/** Where the chimneys are (tile x, y), for the smoke. */
const CHIMNEYS: [number, number][] = [];
for (const r of ROOFS) if (r.kind === 'house' && hash(r.seed * 5) > 0.35) CHIMNEYS.push([r.x + r.w * (0.25 + hash(r.seed * 7) * 0.5), RG - r.h - r.w * 0.35]);

const paintRoofs = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.2);
  const WALL = ['#9A8A7A', '#8A7E8E', '#A8968A', '#7E7488', '#B0A08C'], RF = ['#3E4058', '#4A3E4A', '#344A5A', '#4E4466'];
  const SN = ['#B4C0DC', '#D8E2F4', '#F4F8FF'].map(T), TB = T('#3A2A22');
  // (the backs and the night between them: the ground under the roofs)
  box(g, 0, RG - 10, RW, RH - RG + 10, T('#4A4458'));
  for (const r of ROOFS) {
    const x = r.x, w = r.w, top = RG - r.h;
    if (r.kind === 'pine') { farPine(g, x + w / 2, RG, r.h, [T('#1E3A36'), T('#2E524A')], SN[2]); continue; }
    if (r.kind === 'house') {
      const wall = T(WALL[r.seed % 5]), roof = T(RF[r.seed % 4]), lean = (hash(r.seed * 9) - 0.5) * 8;
      box(g, x, top, w, r.h, wall); box(g, x + w - 6, top, 6, r.h, T(mix(WALL[r.seed % 5], INK, 0.25)));
      // (timbers on some)
      if (r.seed % 3 === 0) { box(g, x, top + r.h * 0.45, w, 2, TB); for (let k = x + 6; k < x + w - 4; k += 12) box(g, k, top, 2, r.h, TB); }
      // (windows, warm after dark)
      for (let row = 0; row < Math.floor(r.h / 22); row++) for (let k = 0; k < Math.floor(w / 16); k++) { const c = winLit(tod, r.seed + row * 13 + k); box(g, x + 5 + k * 16, top + 8 + row * 22, 6, 8, c ?? T('#3A3456')); if (c) box(g, x + 5 + k * 16, top + 8 + row * 22, 6, 1, '#FFF4C8'); }
      // (the roof: steep, crooked, snow on it in steps; a dormer on the wide ones)
      const rh = w * 0.62, px = x + w / 2 + lean;
      g.fillStyle = roof; g.beginPath(); g.moveTo(x - 4, top); g.lineTo(px, top - rh); g.lineTo(x + w + 4, top); g.closePath(); g.fill();
      g.fillStyle = SN[1]; g.beginPath(); g.moveTo(x - 4, top + 1); g.lineTo(px, top - rh); g.lineTo(x + w + 4, top + 1); g.lineTo(x + w + 4, top - 3); g.lineTo(px, top - rh + 7); g.lineTo(x - 4, top - 3); g.closePath(); g.fill();
      g.fillStyle = SN[2]; g.beginPath(); g.moveTo(x - 4, top - 2); g.lineTo(px, top - rh); g.lineTo(px - 2, top - rh + 6); g.lineTo(x - 4, top + 1); g.closePath(); g.fill();
      for (let k = x; k < x + w; k += 5) box(g, k, top + 1, 2, 2 + (k % 3), SN[0]);
      if (w > 70) { const dx = x + w * 0.3; box(g, dx, top - rh * 0.35, 12, 10, wall); box(g, dx + 3, top - rh * 0.35 + 3, 6, 6, winLit(tod, r.seed * 3) ?? T('#3A3456')); g.fillStyle = SN[2]; g.beginPath(); g.moveTo(dx - 2, top - rh * 0.35); g.lineTo(dx + 6, top - rh * 0.35 - 7); g.lineTo(dx + 14, top - rh * 0.35); g.closePath(); g.fill(); }
      if (hash(r.seed * 5) > 0.35) { const cx = x + w * (0.25 + hash(r.seed * 7) * 0.5), cy = top - w * 0.35; box(g, cx - 4, cy - 4, 8, top - cy + 8 - rh * 0.1, T('#6A4A3A')); box(g, cx - 5, cy - 6, 10, 3, SN[2]); }
    } else if (r.kind === 'steeple') {
      const cx = x + w / 2;
      box(g, cx - 16, top + 40, 32, r.h - 40, T('#A49AB4')); box(g, cx - 16, top + 40, 8, r.h - 40, T('#C4BCD2'));
      box(g, cx - 4, top + 56, 8, 14, T('#3A3456')); g.fillStyle = T('#3A3456'); g.beginPath(); g.arc(cx, top + 56, 4, Math.PI, 0); g.fill();
      g.fillStyle = T('#3A4058'); g.beginPath(); g.moveTo(cx - 20, top + 40); g.lineTo(cx, top - 50); g.lineTo(cx + 20, top + 40); g.closePath(); g.fill();
      g.fillStyle = SN[2]; g.beginPath(); g.moveTo(cx - 20, top + 40); g.lineTo(cx, top - 50); g.lineTo(cx - 4, top + 40); g.closePath(); g.fill();
      box(g, cx - 1, top - 62, 2, 14, T('#C8A040')); box(g, cx - 5, top - 58, 10, 2, T('#C8A040'));
    } else if (r.kind === 'clock') {
      const cx = x + w / 2;
      box(g, cx - 18, top, 36, r.h, T('#8E8298')); box(g, cx - 18, top, 9, r.h, T('#ACA0B6')); box(g, cx + 10, top, 8, r.h, T('#6E6478'));
      g.fillStyle = T('#F4ECD8'); g.beginPath(); g.arc(cx, top + 24, 12, 0, Math.PI * 2); g.fill();
      g.strokeStyle = T('#2A2440'); g.lineWidth = 1; g.beginPath(); g.arc(cx, top + 24, 12, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(cx, top + 24); g.lineTo(cx, top + 15); g.moveTo(cx, top + 24); g.lineTo(cx + 6, top + 26); g.stroke();
      for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; box(g, cx + Math.cos(a) * 10, top + 24 + Math.sin(a) * 10, 1, 1, T('#2A2440')); }
      g.fillStyle = T('#3E4058'); g.beginPath(); g.moveTo(cx - 22, top); g.lineTo(cx, top - 34); g.lineTo(cx + 22, top); g.closePath(); g.fill();
      g.fillStyle = SN[2]; g.beginPath(); g.moveTo(cx - 22, top); g.lineTo(cx, top - 34); g.lineTo(cx - 5, top); g.closePath(); g.fill();
      for (let row = 0; row < 4; row++) { const c = winLit(tod, r.seed + row); box(g, cx - 3, top + 50 + row * 22, 6, 10, c ?? T('#3A3456')); }
    } else if (r.kind === 'owlery') {
      // (the owlery: a squat round tower, a ring of little arched holes, owls on its sill, its wonky cone)
      const cx = x + w / 2;
      box(g, cx - 20, top + 30, 40, r.h - 30, T('#9C9088')); box(g, cx - 20, top + 30, 10, r.h - 30, T('#BAB0A6')); box(g, cx + 10, top + 30, 10, r.h - 30, T('#7A6E6A'));
      for (let k = 0; k < 5; k++) { box(g, cx - 16 + k * 7, top + 46, 4, 6, T('#2A2430')); box(g, cx - 16 + k * 7, top + 70, 4, 6, T('#2A2430')); }
      for (let k = 0; k < 4; k++) { box(g, cx - 14 + k * 9, top + 40, 4, 5, T('#8A6A4A')); box(g, cx - 13 + k * 9, top + 39, 2, 1, T('#F4ECD8')); }
      g.fillStyle = T('#4A3E4A'); g.beginPath(); g.moveTo(cx - 25, top + 30); g.lineTo(cx + 6, top - 20); g.lineTo(cx + 25, top + 30); g.closePath(); g.fill();
      g.fillStyle = SN[2]; g.beginPath(); g.moveTo(cx - 25, top + 30); g.lineTo(cx + 6, top - 20); g.lineTo(cx - 8, top + 30); g.closePath(); g.fill();
    } else {
      turret(g, T, x + w / 2, RG, 24, r.h, '#4A78D4', tod, r.seed);
      box(g, x + w / 2 - 1, RG - r.h - 54, 1, 10, T('#4A4060'));
    }
  }
  // (banners on poles between some roofs)
  for (let i = 0; i < 6; i++) { const bx = 120 + i * 230, by = RG - 120 - hash(i * 3) * 30; box(g, bx, by, 1, RG - by, T('#3A3448')); const col = ['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A'][i % 4]; box(g, bx + 1, by + 2, 10, 18, T(col)); g.fillStyle = T(col); g.beginPath(); g.moveTo(bx + 1, by + 20); g.lineTo(bx + 6, by + 16); g.lineTo(bx + 11, by + 20); g.closePath(); g.fill(); box(g, bx + 1, by + 2, 10, 2, T(mix(col, '#FFFFFF', 0.3))); }
  // (snow lying along the ground line between them)
  box(g, 0, RG - 4, RW, 6, SN[1]); for (let x = 0; x < RW; x += 6) box(g, x, RG - 6 - Math.floor(hash(x) * 3), 6, 3, SN[2]);
  hazeBands(g, 0, RG - 70, RW, 70, skyAt(0.92, tod), 0.0, 0.32, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// Live: the chimneys' smoke, the snow

const smoke = (c: Ctx, x: number, y: number, f: number, seed: number, col: string) => {
  for (let k = 0; k < 5; k++) {
    const t = ((f * 0.4 + seed * 37 + k * 18) % 90) / 90, r = 2 + t * 6;
    const px = x + Math.sin(t * 5 + seed) * 3 + t * 16, py = y - t * 60;
    c.globalAlpha = 0.5 * (1 - t); c.fillStyle = col;
    c.fillRect(Math.round(px - r), Math.round(py - r * 0.7), Math.round(r * 2), Math.round(r * 1.4));
  }
  c.globalAlpha = 1;
};
/** Snow coming down (screen space): `n` flakes, `size` px, `speed`, moved by the camera by `par`. */
export const snowfall = (c: Ctx, state: GameState, n: number, size: number, speed: number, par: number, alpha: number, seed = 0) => {
  const f = state.frame, cx = state.camera.x * par, cy = state.camera.y * par;
  c.fillStyle = '#FFFFFF';
  for (let i = 0; i < n; i++) {
    const h1 = hash(i * 1.37 + seed), h2 = hash(i * 2.71 + seed), h3 = hash(i * 0.53 + seed);
    const fall = f * speed * (0.6 + h3 * 0.6);
    const x = ((h1 * (W + 40) + Math.sin(fall * 0.02 + i) * 14 - cx) % (W + 40) + W + 40) % (W + 40) - 20;
    const y = ((h2 * (H + 40) + fall - cy) % (H + 40) + H + 40) % (H + 40) - 20;
    c.globalAlpha = alpha * (0.6 + h3 * 0.4);
    c.fillRect(Math.round(x), Math.round(y), size, size);
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------

export const drawSquareFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), hz = horizonY(state), cx = state.camera.x, f = state.frame;
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: hz, sun: [640, 110], moon: [150, 84], t: f, scroll: cx * 0.01 });
  tile(c, 'clouds', cx * 0.015 + f * 0.06, hz - 380, CH, CW, g => paintClouds(g, tod));
  tile(c, 'alps', cx * 0.03, hz - MH + 6, MH, MW, g => paintAlps(g, tod));
  // (the castle on its crag up on the far hills, drifting across the sky as he goes, standing clear over the roofs)
  const at = MONUMENT_AT.square, { x0, x1 } = SECTIONS.square, k = Math.max(0, Math.min(1, (cx - x0) / Math.max(1, x1 - x0 - W)));
  drawCastleAt(c, Math.round(at.from + (at.to - at.from) * k), Math.round(at.base - 50 + (hz - 440)), at.k, f);
  tile(c, 'park', cx * 0.07, hz - PH + 14, PH, PW, g => paintPark(g, tod));
  // (the village's roofs past the street, their chimneys smoking; under them, its ground right down)
  const ry = hz + 18 - RG, off = cx * 0.2;
  tile(c, 'roofs', off, ry, RH, RW, g => paintRoofs(g, tod));
  box(c, 0, ry + RH - 1, W, H, farCol(tod, 0.2)('#4A4458'));
  const sm = mix(farCol(tod, 0.3)('#E8ECF4'), skyAt(0.6, tod), 0.2);
  for (const [chx, chy] of CHIMNEYS) for (let x = chx - (((off % RW) + RW) % RW); x < W + 40; x += RW) if (x > -40) smoke(c, x, ry + chy - 6, f, chx, sm);
  snowfall(c, state, 46, 1, 0.35, 0.15, 0.7, 3);
};
