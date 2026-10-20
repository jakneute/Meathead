// THE BIG-KID ZONE's far off (screen space: the backdrop), every layer painted once for the hour into a tile and slid
// along (only the park blimp and the water tower's propeller live):
//
//   the sky by the hour (a hot 90s blue down to a lilac and a peach blush, banded, dithered between), fat stepped cumulus
//   and jet streaks drifting; THE PARK BLIMP (CARTOON LAND on its envelope, a banner trailing: SEE STUPID DAD LIVE!);
//   far off, past the park's berm, the hazy hills, a radio mast, the interstate on its viaduct with its billboards and
//   cars, the 1994 strip mall (VIDEO BARN, a pizza place, a tanning salon), cul-de-sacs of rooftops; THE CARTOON LAND
//   WATER TOWER on its hill (monument.ts: bigger than from the square); then THE REST OF CARTOON LAND: Sillyville's
//   drooping domes and Truffula tufts, the studios' soundstages, the WACKY WHITE HOUSE's cartoon dome, PUNCHY & KICKY's
//   KILL-O-RAMA pylon, STUPID DAD LIVE!'s band shell and light towers, a STUPID DAD billboard with CANCELED slapped
//   across it, trees, bunting and lamps between; and nearest, THE ZONE'S OWN ROOFS past the street: boxy show buildings
//   with giant props on top (a soda cup and its straw, a pizza slice, a hi-top, a boombox, a slime bucket tipping, the
//   inflatable Rad Rat, a Gloppy statue), neon (EXTREME!, the lightning bolt), rooftop billboards, satellite dishes, the
//   water slides' tubes corkscrewing down a tower, light towers, chain-link, all lit up after dark.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { pixelBlob, hazeBands } from '../../../m1/game/render/pixelArt';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { snap2, wave, mist } from '../../adventure/farArt';
import { signText, type Look } from '../../signLetters';
import { box, mix, hash, checker, stamp, INK, type Ctx } from '../kit';
import { MONUMENT_AT, drawMonument } from '../monument';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Where the horizon sits on screen (it drifts down as the camera climbs onto the towers' lids). */
export const horizonY = (state: GameState) => Math.round(440 + Math.max(-20, Math.min(70, (50 - state.camera.y) * 0.1)));

/** The zone's sky, top to horizon: a hot blue down through lilac to a peach blush. */
const SKY = ['#2A86D8', '#3C9CE2', '#62B4EA', '#94CCEE', '#C8C2EE', '#FFBCC8'];

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const fk = () => (fontReady() ? 'f' : 'n');
/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  const tod = timeOfDay(), k = `ct-bkf-${key}-${tod.key}-${fk()}`;
  for (let x = -(((off % tw) + tw) % tw); x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, k, 0, 0, tw, h, paint); c.restore(); }
};
/** A far layer's color for the hour: toward dusk and night, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A7A', 0.2), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);
/** A window: lit warm after dark (most of them), else the glass. */
const win = (tod: TimeOfDay, i: number, glass: string) => (tod.lamps > 0.3 ? (hash(i * 1.7) > 0.25 ? (hash(i * 3.1) > 0.5 ? '#FFE08A' : '#F6B860') : glass) : glass);
const tiny = (fill: string | string[], ink?: string, slant = 0): Look => ({ sx: 1, sy: 1, bold: false, fill, ink, gap: 1, slant });
/** A neon tube's color for the hour: lit hard after dark, a painted tube by day. */
const neonOf = (tod: TimeOfDay, col: string, T: (c: string) => string) => (tod.lamps > 0.3 ? mix(col, '#FFFFFF', 0.25) : T(col));
/** Three steps of a color for a far layer: shade, itself, lit. */
const st3 = (T: (c: string) => string, col: string) => [T(mix(col, INK, 0.3)), T(col), T(mix(col, '#FFFFFF', 0.35))];

// ---------------------------------------------------------------------------------------------------------------
// Clouds: fat stepped cumulus, flat-bottomed; long jet streaks

const CW = 1100, CH = 180;
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#A0A4D4', '#C6C8EC', '#E8E8F8', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (let i = 0; i < 7; i++) {
    const cx = (i * CW) / 7 + hash(i * 4.3) * 60, cy = 52 + hash(i * 6.1) * 86, s = 0.7 + hash(i * 8.7) * 0.8, puffs = 3 + Math.floor(hash(i * 1.3) * 4);
    for (const [L, dy, k] of [[0, 3, 1], [1, 0, 0.9], [2, -3, 0.7], [3, -6, 0.4]] as const) {
      for (let p = 0; p < puffs; p++) {
        const px = cx + (p - puffs / 2) * 19 * s, py = cy - Math.sin((p / Math.max(1, puffs - 1)) * Math.PI) * 18 * s + dy * s;
        const r = (13 + hash(i * 13 + p) * 11) * s * k;
        for (const ox of [0, CW, -CW]) pixelBlob(g, px + ox - (L === 3 ? 5 : 0), py, r * 1.3, r * 0.82, C[L]);
      }
    }
    for (const ox of [0, CW, -CW]) { box(g, cx + ox - puffs * 9.5 * s, cy + 12 * s, puffs * 19 * s, 3, C[0]); checker(g, cx + ox - puffs * 9.5 * s, cy + 10 * s, puffs * 19 * s, 2, C[0], 0, 2); }
  }
  // (jet streaks: a long thin line, frayed at the old end)
  for (let i = 0; i < 3; i++) {
    const x0 = hash(i * 7.7) * CW, y0 = 20 + hash(i * 2.9) * 70, len = 160 + hash(i * 5.5) * 140, sl = 0.08 + hash(i) * 0.08;
    for (const ox of [0, CW, -CW]) for (let x = 0; x < len; x += 2) {
      const y = y0 + x * sl, fray = x / len;
      if (hash(x * 0.37 + i) < fray * 0.7) continue;
      box(g, x0 + ox + x, y, 2, fray > 0.5 ? 2 : 1, C[fray > 0.6 ? 2 : 3]);
      if (fray > 0.5) box(g, x0 + ox + x, y + 2, 2, 1, C[1]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The park blimp, live: CARTOON LAND on its envelope, a banner trailing on its rope (SEE STUPID DAD LIVE!)

const BL = 150, BH = 46;
const paintBlimp = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.22), E = ['#3A2C6A', '#5A46A0', '#7C66CC', '#A08EE6', '#C8BCF4', '#ECE6FE'].map(T);
  // (the envelope: an egg banded across in steps, lit along its top, a stripe down its middle)
  const cx = 90, cy = 30;
  for (let i = 0; i < 6; i++) { const k = 1 - i * 0.12; g.fillStyle = i === 0 ? T(INK) : E[Math.min(5, i)]; g.beginPath(); g.ellipse(cx - i * 2, cy - i * 2.2, (BL / 2) * k + (i === 0 ? 1 : 0), (BH / 2) * k + (i === 0 ? 1 : 0), 0, 0, Math.PI * 2); g.fill(); }
  g.save(); g.beginPath(); g.ellipse(cx, cy, BL / 2, BH / 2, 0, 0, Math.PI * 2); g.clip();
  box(g, cx - BL / 2, cy + 8, BL, 6, T('#F2D23A')); box(g, cx - BL / 2, cy + 8, BL, 1, T('#FFF0A0')); box(g, cx - BL / 2, cy + 14, BL, 2, T('#E2465E'));
  box(g, cx - BL / 2, cy + BH * 0.3, BL, BH, E[1]); checker(g, cx - BL / 2, cy + BH * 0.3 - 2, BL, 2, E[1], 0, 1);
  g.restore();
  signText(g, 'CARTOON LAND', cx - 4, cy + 3, { sx: 1, sy: 1, bold: true, fill: [T('#FFFFFF'), T('#FFF7C2')], ink: T(INK), slant: 0 });
  // (the fins, the gondola, its windows)
  for (const [dy, s] of [[-1, -1], [1, 1]] as const) { g.fillStyle = T(INK); g.beginPath(); g.moveTo(cx + BL / 2 - 26, cy + dy * 6); g.lineTo(cx + BL / 2 + 6, cy + s * 20); g.lineTo(cx + BL / 2 + 8, cy + s * 8); g.lineTo(cx + BL / 2 - 6, cy + s * 3); g.closePath(); g.fill(); g.fillStyle = s < 0 ? T('#E2465E') : T('#B01C3C'); g.beginPath(); g.moveTo(cx + BL / 2 - 22, cy + dy * 6); g.lineTo(cx + BL / 2 + 4, cy + s * 18); g.lineTo(cx + BL / 2 + 5, cy + s * 9); g.lineTo(cx + BL / 2 - 6, cy + s * 4); g.closePath(); g.fill(); }
  box(g, cx - 16, cy + BH / 2 - 1, 32, 10, T(INK)); box(g, cx - 15, cy + BH / 2, 30, 8, T('#D8D4E8')); box(g, cx - 15, cy + BH / 2, 30, 2, T('#FFFFFF'));
  for (let k = 0; k < 5; k++) box(g, cx - 13 + k * 6, cy + BH / 2 + 3, 4, 3, win(tod, k + 70, T('#3A4A7A')));
  if (tod.lamps > 0.3) { box(g, cx - BL / 2 + 2, cy - 1, 3, 3, '#FF5050'); box(g, cx + BL / 2 - 3, cy - 1, 3, 3, '#7CFF7C'); }
  // (the rope back to the banner, the banner rippling)
  g.strokeStyle = T('#5A5470'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx + BL / 2 + 6, cy + 10); g.quadraticCurveTo(cx + BL / 2 + 24, cy + 22, cx + BL / 2 + 40, cy + 18); g.stroke();
  const bx = cx + BL / 2 + 40, bw = 168;
  for (let x = 0; x < bw; x += 2) { const y = cy + 12 + Math.sin(x * 0.07) * 3; box(g, bx + x, y, 2, 14, T(INK)); box(g, bx + x, y + 1, 2, 12, T(x % 8 < 4 ? '#FFF7E8' : '#F6ECDA')); box(g, bx + x, y + 11, 2, 2, T('#D8CCB8')); }
  signText(g, 'SEE STUPID DAD LIVE!', bx + bw / 2, cy + 24, tiny(T('#C8283E')));
};
const drawBlimp = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), period = 5200, t = (state.frame % period) / period;
  const x = W + 60 - t * (W + 520) - ((state.camera.x * 0.02) % 200), y = 92 + Math.sin(state.frame * 0.01) * 3;
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `ct-bkf-blimp-${tod.key}-${fk()}`, 0, 0, 420, 80, g => paintBlimp(g, tod));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Past the park's berm: hazy hills, the radio mast, the interstate and its billboards, the strip mall, cul-de-sacs

const HW = 1400, HH = 180;
const backRidge = (x: number) => snap2(HH - 96 + wave(x, HW, 2.1) * 24 + wave(x, HW, 5.3, 2) * 6);
const midRidge = (x: number) => snap2(HH - 62 + wave(x, HW, 3.7) * 14 - Math.abs(wave(x, HW, 0.9, 3)) * 5);
const paintSuburbs = (g: Ctx, tod: TimeOfDay) => {
  const Tb = farCol(tod, 0.6), Tm = farCol(tod, 0.42), lamps = tod.lamps > 0.3;
  // (the back hills: hazy, lit on the faces turned up left)
  const BR = ['#7A8EB0', '#8EA4BE', '#A4BCCA', '#BED4D6'].map(Tb);
  for (let x = 0; x < HW; x += 2) { const y = backRidge(x), lt = backRidge(x + 4) < backRidge(x - 4); box(g, x, y, 2, HH - y, BR[lt ? 2 : 1]); if (lt) box(g, x, y, 2, 2, BR[3]); else checker(g, x, y + 2, 2, 4, BR[0], 0, 1); }
  // (the radio mast on the back ridge, its guy wires, the red lights after dark)
  { const mx = 980, my = backRidge(980); for (let y = my - 70; y < my; y += 2) box(g, mx - 1 + ((y >> 1) % 2), y, 2, 2, Tb(y % 10 < 5 ? '#C8283E' : '#F4F0F4')); g.strokeStyle = Tb('#8A8AA0'); g.lineWidth = 1; g.beginPath(); g.moveTo(mx, my - 60); g.lineTo(mx - 26, my); g.moveTo(mx, my - 60); g.lineTo(mx + 26, my); g.stroke(); box(g, mx - 1, my - 72, 3, 3, lamps ? '#FF4040' : Tb('#C8283E')); }
  // (the mid hills: scrubby, tree clumps in steps)
  const MR = ['#5E8A66', '#6E9C70', '#86B47E', '#A6CC92'].map(Tm);
  for (let x = 0; x < HW; x += 2) { const y = midRidge(x), lt = midRidge(x + 4) < midRidge(x - 4); box(g, x, y, 2, HH - y, MR[lt ? 2 : 1]); if (lt) box(g, x, y, 2, 2, MR[3]); }
  for (let x = 4; x < HW; x += 9) { if (hash(x * 0.61) < 0.5) continue; const y = midRidge(x) + 4 + hash(x) * 10, r = 4 + hash(x * 3) * 4; pixelBlob(g, x, y, r, r * 0.8, MR[0]); pixelBlob(g, x - 1, y - 1, r * 0.8, r * 0.6, MR[1]); box(g, x - r * 0.4, y - r * 0.5, 2, 2, MR[3]); }
  // (cul-de-sacs: rows of little hip roofs, a few windows lit)
  for (let i = 0; i < 46; i++) {
    const hx = 30 + i * 30 + hash(i * 3.3) * 12; if (hx > 620 && hx < 760) continue;
    const hy = midRidge(hx) + 22 + (i % 3) * 7, roof = Tm(['#9A5A4A', '#6A6A7A', '#8A7A5A', '#5A6A8A'][i % 4]), wall = Tm(['#E8DCC8', '#D4DCE4', '#F0E4D0'][i % 3]);
    box(g, hx - 7, hy - 5, 14, 6, wall); box(g, hx + 3, hy - 5, 4, 6, Tm(mix(['#E8DCC8', '#D4DCE4', '#F0E4D0'][i % 3], INK, 0.2)));
    g.fillStyle = roof; g.beginPath(); g.moveTo(hx - 9, hy - 5); g.lineTo(hx - 4, hy - 10); g.lineTo(hx + 4, hy - 10); g.lineTo(hx + 9, hy - 5); g.closePath(); g.fill();
    box(g, hx - 5, hy - 3, 2, 2, win(tod, i * 7, Tm('#5A6A8A'))); box(g, hx + 1, hy - 3, 2, 2, win(tod, i * 7 + 1, Tm('#5A6A8A')));
  }
  // (the strip mall: a long flat box, its signs, the lot in front with its light poles)
  { const sx = 620, sw = 150, sy = midRidge(690) + 16;
    box(g, sx, sy - 18, sw, 18, Tm('#E2D6C2')); box(g, sx, sy - 18, sw, 2, Tm('#F6EEDE')); box(g, sx + sw - 8, sy - 18, 8, 18, Tm('#C2B6A2'));
    const shops: [string, string][] = [['VIDEO BARN', '#1E4AB0'], ['PIZZA', '#C8283E'], ['TAN', '#E8821A']];
    let x = sx + 4;
    for (const [name, col] of shops) { const w = name.length * 6 + 8; box(g, x, sy - 16, w, 7, Tm(col)); signText(g, name, x + w / 2, sy - 10, tiny(Tm('#FFFFFF'))); box(g, x, sy - 8, w, 6, win(tod, x, Tm('#4A6A8A'))); x += w + 4; }
    box(g, sx - 10, sy, sw + 20, 6, Tm('#7A7888')); for (let k = 0; k < 9; k++) box(g, sx - 4 + k * 18, sy + 2, 1, 3, Tm('#E8E4D0'));
    for (const lx of [sx + 10, sx + sw - 10]) { box(g, lx, sy - 26, 1, 26, Tm('#5A5470')); box(g, lx - 2, sy - 27, 5, 2, lamps ? '#FFE8A0' : Tm('#8A8AA0')); } }
  // (the interstate on its viaduct, along the foot: piers, the deck, cars, its billboards on poles)
  const dy = HH - 26, Dk = st3(Tm, '#B4B0C0');
  for (let x = 0; x < HW; x += 70) { box(g, x + 30, dy + 6, 6, HH - dy - 6, Dk[0]); box(g, x + 30, dy + 6, 2, HH - dy - 6, Dk[1]); }
  box(g, 0, dy, HW, 6, Dk[1]); box(g, 0, dy, HW, 1, Dk[2]); box(g, 0, dy + 5, HW, 1, Dk[0]);
  for (let x = 0; x < HW; x += 6) box(g, x, dy - 2, 1, 2, Dk[0]);
  box(g, 0, dy - 3, HW, 1, Dk[0]);
  for (let i = 0; i < 26; i++) { const cx2 = hash(i * 9.3) * HW, col = Tm(['#C8283E', '#2A5AB0', '#E8E4D8', '#2A8A5A', '#F2D23A'][i % 5]); box(g, cx2, dy - 4 + (i % 2), 7, 3, col); box(g, cx2 + 1, dy - 5 + (i % 2), 4, 1, Tm('#A8C8E8')); if (lamps) box(g, cx2 + (i % 2 ? 6 : 0), dy - 3 + (i % 2), 1, 1, i % 2 ? '#FF6060' : '#FFF4C0'); }
  const bb: [number, string, string, string][] = [[180, 'MALL-O-RAMA', 'EXIT 12', '#7C3AED'], [470, 'MOTEL', '$29.95', '#C8283E'], [1180, 'CARTOON LAND', 'NEXT EXIT', '#0E8A8A']];
  for (const [bx, a, b, col] of bb) {
    box(g, bx + 18, dy - 40, 2, 38, Tm('#5A5470')); box(g, bx + 50, dy - 40, 2, 38, Tm('#5A5470'));
    box(g, bx - 1, dy - 63, 72, 26, Tm(INK)); box(g, bx, dy - 62, 70, 24, Tm(col)); box(g, bx, dy - 62, 70, 2, Tm(mix(col, '#FFFFFF', 0.4)));
    signText(g, a, bx + 35, dy - 52, tiny(Tm('#FFFFFF'))); signText(g, b, bx + 35, dy - 42, tiny(Tm('#FDE047')));
  }
  mist(g, HW, HH - 70, 70, skyAt(0.92, tod), 0.0, 0.4, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// The rest of Cartoon Land (from the zone: the square, the studios, the White House, the knockoff's pylon, the bowl)

const PW = 2100, PH = 260, PG = PH - 26;
const catHead = (g: Ctx, T: (c: string) => string, x: number, y: number, r: number, fur = '#22202C', eye = '#9EE64A') => {
  g.fillStyle = T(INK);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * r * 0.9, y - r * 0.2); g.lineTo(x + s * r * 0.8, y - r * 1.3); g.lineTo(x + s * r * 0.2, y - r * 0.8); g.closePath(); g.fill(); }
  g.beginPath(); g.ellipse(x, y, r + 1, r * 0.86 + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = T(fur); g.beginPath(); g.ellipse(x, y, r, r * 0.86, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#F4F0F4'); g.beginPath(); g.ellipse(x, y + r * 0.38, r * 0.56, r * 0.4, 0, 0, Math.PI * 2); g.fill();
  for (const s of [-1, 1]) { g.fillStyle = T(eye); g.beginPath(); g.ellipse(x + s * r * 0.36, y - r * 0.12, r * 0.2, r * 0.24, 0, 0, Math.PI * 2); g.fill(); box(g, x + s * r * 0.36 - 1, y - r * 0.3, 2, r * 0.36, T(INK)); }
};
const dadFace = (g: Ctx, T: (c: string) => string, x: number, y: number, r: number) => {
  g.fillStyle = T(INK); g.beginPath(); g.ellipse(x, y, r + 1.5, r * 1.12 + 1.5, 0, 0, Math.PI * 2); g.fill();
  const S = st3(T, '#F0B8A0');
  g.fillStyle = S[1]; g.beginPath(); g.ellipse(x, y, r, r * 1.12, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = S[2]; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.4, r * 0.45, r * 0.4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = S[0]; g.beginPath(); g.ellipse(x + r * 0.5, y + r * 0.3, r * 0.4, r * 0.6, 0, 0, Math.PI * 2); g.fill();
  box(g, x - r * 0.5, y - r * 0.2, r * 0.35, 2, T(INK)); box(g, x + r * 0.15, y - r * 0.2, r * 0.35, 2, T(INK));
  g.fillStyle = T('#FB7185'); g.beginPath(); g.arc(x, y + r * 0.15, r * 0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#7F1D1D'); g.beginPath(); g.ellipse(x, y + r * 0.6, r * 0.32, r * 0.22, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = T(INK); g.lineWidth = 1; g.beginPath(); g.moveTo(x - r * 0.6, y - r * 0.85); g.quadraticCurveTo(x, y - r * 1.4, x + r * 0.6, y - r * 0.85); g.stroke();
};
const paintPark = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.3), lamps = tod.lamps > 0.3;
  box(g, 0, PG, PW, PH - PG, T('#5A9658')); box(g, 0, PG, PW, 2, T('#82BE76'));
  for (let x = 0; x < PW; x += 4) box(g, x, PG + 6 + ((x / 4) % 3) * 4, 2, 1, T('#4A864A'));
  // ---- SILLYVILLE: drooping domes, a floppy cone, stacked balls, Truffula tufts (the kiddie square, back the way he came)
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 34 + hash(i) * 8, h = 40 + hash(i * 2.7) * 46, w = 24 + hash(i * 5.1) * 12, wall = ['#F8C8DC', '#FCE69A', '#BEDCF6', '#C2ECCE', '#DCCCF6'][i % 5], roof = ['#E2465E', '#7C5CC8', '#24A69C', '#F2822A', '#3E76DE'][(i * 3) % 5];
    const Wl = st3(T, wall), R = st3(T, roof), top = PG - h, lean = (hash(i * 9) - 0.5) * 8;
    g.fillStyle = T(INK); g.beginPath(); g.moveTo(x - 1, PG); g.quadraticCurveTo(x - 5, PG - h / 2, x + lean - 1, top); g.lineTo(x + w + lean + 1, top); g.quadraticCurveTo(x + w + 5, PG - h / 2, x + w + 1, PG); g.closePath(); g.fill();
    g.fillStyle = Wl[1]; g.beginPath(); g.moveTo(x, PG); g.quadraticCurveTo(x - 4, PG - h / 2, x + lean, top); g.lineTo(x + w + lean, top); g.quadraticCurveTo(x + w + 4, PG - h / 2, x + w, PG); g.closePath(); g.fill();
    box(g, x + 1, top + 2, 3, h - 2, Wl[2]); box(g, x + w - 6, top + 2, 5, h - 2, Wl[0]);
    for (let k = 0; k < Math.floor(h / 18); k++) { const wy = PG - 12 - k * 18; g.fillStyle = win(tod, i * 4 + k, T('#7AAEDC')); g.beginPath(); g.arc(x + w / 2 + lean * (k * 18 / h), wy, 3, 0, Math.PI * 2); g.fill(); }
    const tx = x + w / 2 + lean;
    if (i % 3 === 0) { g.fillStyle = R[1]; g.beginPath(); g.moveTo(tx - w / 2 - 3, top + 1); g.bezierCurveTo(tx - w / 2 - 10, top - w * 0.5, tx - 4, top - w * 0.6, tx + 8, top - w); g.bezierCurveTo(tx + 4, top - w * 0.6, tx + w / 2 + 10, top - w * 0.5, tx + w / 2 + 3, top + 1); g.closePath(); g.fill(); g.fillStyle = R[2]; g.beginPath(); g.ellipse(tx - w * 0.2, top - w * 0.3, w * 0.15, w * 0.25, 0, 0, Math.PI * 2); g.fill(); }
    else if (i % 3 === 1) { g.fillStyle = R[1]; g.beginPath(); g.moveTo(tx - w / 2 - 3, top + 1); g.quadraticCurveTo(tx, top - w * 1.3, tx + w * 0.6, top - w * 0.9); g.quadraticCurveTo(tx + w * 0.2, top - w * 0.5, tx + w / 2 + 3, top + 1); g.closePath(); g.fill(); g.fillStyle = T('#FFFFFF'); g.beginPath(); g.arc(tx + w * 0.6, top - w * 0.9, 3, 0, Math.PI * 2); g.fill(); }
    else for (let k = 0; k < 3; k++) { g.fillStyle = st3(T, ['#E2465E', '#F2D23A', '#5EC4F4'][k])[1]; g.beginPath(); g.ellipse(tx, top - 4 - k * 9, w / 2 - k * 4, 5, 0, 0, Math.PI * 2); g.fill(); }
  }
  for (let k = 0; k < 6; k++) { const x = 30 + k * 52 + hash(k * 5) * 10, h = 30 + hash(k) * 30, col = ['#F472B6', '#FDE047', '#C084FC', '#5EEAD4'][k % 4]; for (let y = 0; y < h; y += 2) box(g, x, PG - y - 2, 2, 2, (y >> 1) % 3 ? T('#F4ECD8') : T('#2A2638')); pixelBlob(g, x + 1, PG - h - 5, 8, 6, T(mix(col, INK, 0.3))); pixelBlob(g, x, PG - h - 6, 7, 5, T(col)); }
  // ---- THE STUDIOS: three soundstages, arched gables, their numbers; the logo on its lattice
  for (let i = 0; i < 3; i++) {
    const sx = 360 + i * 88, sw = 80, sh = 64 + (i === 1 ? 18 : 0), top = PG - sh, base = ['#B4AACC', '#C2B8D8', '#A89EC2'][i], Wl = st3(T, base);
    g.fillStyle = T(INK); g.beginPath(); g.moveTo(sx - 1, PG); g.lineTo(sx - 1, top); g.quadraticCurveTo(sx + sw / 2, top - 34, sx + sw + 1, top); g.lineTo(sx + sw + 1, PG); g.closePath(); g.fill();
    g.fillStyle = Wl[1]; g.beginPath(); g.moveTo(sx, PG); g.lineTo(sx, top); g.quadraticCurveTo(sx + sw / 2, top - 32, sx + sw, top); g.lineTo(sx + sw, PG); g.closePath(); g.fill();
    box(g, sx + sw - 9, top, 9, sh, Wl[0]); box(g, sx, top, 3, sh, Wl[2]);
    for (let k = sx + 12; k < sx + sw - 8; k += 14) box(g, k, top - 4, 1, sh + 4, Wl[0]);
    signText(g, String(i + 1), sx + sw / 2, top + 20, { sx: 2, sy: 2, bold: true, fill: T('#F8F0FA'), ink: T(INK) });
    box(g, sx + 20, PG - 32, sw - 40, 32, T('#6A6088')); for (let k = 0; k < 5; k++) box(g, sx + 20, PG - 30 + k * 6, sw - 40, 1, T('#8A80A8'));
  }
  { const lx = 400, ly = PG - 82 - 52; box(g, lx, ly + 22, 2, 30, T('#5A5470')); box(g, lx + 120, ly + 22, 2, 30, T('#5A5470')); for (let k = 0; k < 6; k++) { g.strokeStyle = T('#6A6488'); g.lineWidth = 1; g.beginPath(); g.moveTo(lx + k * 24, ly + 50); g.lineTo(lx + k * 24 + 12, ly + 22); g.stroke(); }
    box(g, lx - 6, ly, 134, 22, T(INK)); box(g, lx - 5, ly + 1, 132, 20, T('#6D28D9')); box(g, lx - 5, ly + 1, 132, 2, T('#9F7AEA'));
    signText(g, 'CARTOON LAND', lx + 61, ly + 10, tiny(T('#FDE047'), T(INK))); signText(g, 'STUDIOS', lx + 61, ly + 19, tiny(T('#FFFFFF'), T(INK)));
    if (lamps) for (let k = 0; k < 12; k++) box(g, lx - 4 + k * 11, ly - 2, 2, 2, k % 2 ? '#FFF0B0' : '#FFB0E0'); }
  // ---- THE WACKY WHITE HOUSE: the cartoon dome and portico, Socks peeking over the roof, the flag
  { const hx = 720, base = PG, Wh = st3(T, '#F4F2F8');
    box(g, hx - 70, base - 46, 140, 46, Wh[1]); box(g, hx - 70, base - 46, 140, 2, Wh[2]); box(g, hx + 56, base - 46, 14, 46, Wh[0]);
    for (let k = 0; k < 10; k++) box(g, hx - 64 + k * 13, base - 38, 6, 10, win(tod, k + 200, T('#5A6A9A'))); for (let k = 0; k < 10; k++) box(g, hx - 64 + k * 13, base - 20, 6, 10, win(tod, k + 220, T('#5A6A9A')));
    g.fillStyle = Wh[1]; g.beginPath(); g.moveTo(hx - 26, base - 46); g.lineTo(hx, base - 62); g.lineTo(hx + 26, base - 46); g.closePath(); g.fill(); g.fillStyle = Wh[2]; g.beginPath(); g.moveTo(hx - 26, base - 46); g.lineTo(hx, base - 62); g.lineTo(hx, base - 58); g.lineTo(hx - 20, base - 46); g.closePath(); g.fill();
    for (let k = 0; k < 6; k++) box(g, hx - 22 + k * 8, base - 44, 3, 30, Wh[0]);
    // (the dome, wobbly: it's a cartoon)
    g.fillStyle = T(INK); g.beginPath(); g.ellipse(hx, base - 64, 22, 24, 0, Math.PI, 0); g.fill(); g.fillStyle = Wh[1]; g.beginPath(); g.ellipse(hx, base - 64, 20, 22, 0, Math.PI, 0); g.fill(); g.fillStyle = Wh[2]; g.beginPath(); g.ellipse(hx - 8, base - 70, 6, 12, 0, 0, Math.PI * 2); g.fill();
    catHead(g, T, hx + 48, base - 52, 11);
    box(g, hx - 1, base - 104, 1, 20, T('#5A5470')); box(g, hx, base - 104, 12, 7, T('#E2465E')); box(g, hx, base - 104, 4, 4, T('#3A5AB0')); box(g, hx, base - 101, 12, 1, T('#FFFFFF')); }
  // ---- PUNCHY & KICKY: the KILL-O-RAMA pylon, the cat and the mouse with their mallets up
  { const kx = 900, top = PG - 176, Rd = st3(T, '#C8283E');
    box(g, kx - 12, top + 40, 24, PG - top - 40, T(INK)); box(g, kx - 11, top + 41, 22, PG - top - 41, Rd[1]); box(g, kx - 11, top + 41, 5, PG - top - 41, Rd[2]); box(g, kx + 6, top + 41, 5, PG - top - 41, Rd[0]);
    for (let k = 0; k < 9; k++) signText(g, 'KILLORAMA'[k], kx, top + 52 + k * 12, tiny(T('#FFF0A0'), T(INK)));
    for (let k = 0; k < 14; k++) { box(g, kx - 13, top + 44 + k * 10, 2, 2, lamps && k % 2 ? '#FFF0B0' : T('#F2C84A')); box(g, kx + 11, top + 44 + k * 10, 2, 2, lamps && k % 2 === 0 ? '#FFF0B0' : T('#F2C84A')); }
    box(g, kx - 30, top + 32, 60, 10, T(INK)); box(g, kx - 29, top + 33, 58, 8, T('#F2C84A'));
    catHead(g, T, kx - 16, top + 18, 12, '#7A86A4', '#FDE047');
    for (const s of [-1, 1]) { g.fillStyle = T(INK); g.beginPath(); g.arc(kx + 18 + s * 10, top + 6, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#B8B0C8'); g.beginPath(); g.arc(kx + 18 + s * 10, top + 6, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#F4A6C0'); g.beginPath(); g.arc(kx + 18 + s * 10, top + 6, 4, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = T(INK); g.beginPath(); g.arc(kx + 18, top + 18, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#B8B0C8'); g.beginPath(); g.arc(kx + 18, top + 18, 10, 0, Math.PI * 2); g.fill();
    box(g, kx + 14, top + 14, 2, 3, T(INK)); box(g, kx + 20, top + 14, 2, 3, T(INK)); box(g, kx + 16, top + 22, 4, 2, T('#E2465E'));
    for (const [mx, a] of [[kx - 30, -0.5], [kx + 32, 0.5]] as const) { g.save(); g.translate(mx, top + 20); g.rotate(a); box(g, -1, -26, 3, 26, T('#8A5A30')); box(g, -8, -36, 17, 11, T(INK)); box(g, -7, -35, 15, 9, T('#C89A5A')); box(g, -7, -35, 15, 2, T('#E8C48A')); g.restore(); } }
  // ---- the knockoff area's gate past it: a bone arch
  { const ax = 1010, Bn = st3(T, '#F4ECD8');
    for (const s of [-1, 1]) { box(g, ax + s * 34 - 4, PG - 70, 8, 70, Bn[1]); box(g, ax + s * 34 - 4, PG - 70, 2, 70, Bn[2]); ballR3(g, ax + s * 34 - 4, PG - 72, 6, Bn); ballR3(g, ax + s * 34 + 4, PG - 72, 6, Bn); }
    g.strokeStyle = T(INK); g.lineWidth = 9; g.beginPath(); g.arc(ax, PG - 64, 36, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.strokeStyle = Bn[1]; g.lineWidth = 6; g.stroke(); }
  // ---- STUPID DAD LIVE!: the band shell over the bowl, its light towers
  { const cx = 1240, base = PG - 20, rx = 96, ry = 94;
    const bands = ['#F3E9D2', '#7DB7E8', '#F3E9D2', '#5B9BD5', '#F3E9D2', '#7DB7E8'];
    for (let i = 0; i < bands.length; i++) { const k = 1 - i / bands.length; g.fillStyle = T(INK); g.beginPath(); g.ellipse(cx, base, rx * k + 2, ry * k + 2, 0, Math.PI, 0); g.fill(); g.fillStyle = T(bands[i]); g.beginPath(); g.ellipse(cx, base, rx * k, ry * k, 0, Math.PI, 0); g.fill(); g.fillStyle = T(mix(bands[i], '#FFFFFF', 0.3)); g.beginPath(); g.ellipse(cx - rx * k * 0.5, base - ry * k * 0.8, rx * k * 0.3, 2, -0.4, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = T('#2A2440'); g.beginPath(); g.ellipse(cx, base, rx * 0.17, ry * 0.17, 0, Math.PI, 0); g.fill();
    if (lamps) for (let k = 0; k < 24; k++) { const a = Math.PI + (k / 23) * Math.PI; box(g, cx + Math.cos(a) * rx - 1, base + Math.sin(a) * ry - 1, 2, 2, k % 2 ? '#FFF0B0' : '#FFC860'); }
    box(g, cx - 60, base - 46, 120, 16, T(INK)); box(g, cx - 59, base - 45, 118, 14, T('#B91C1C')); box(g, cx - 59, base - 45, 118, 2, T('#E2465E'));
    signText(g, 'STUPID DAD LIVE!', cx, base - 35, tiny(T('#FFFFFF'), T(INK)));
    g.fillStyle = T('#B4ACA0'); g.beginPath(); g.moveTo(cx - 154, PG); g.quadraticCurveTo(cx, PG - 34, cx + 154, PG); g.closePath(); g.fill();
    for (let k = 0; k < 4; k++) { g.strokeStyle = T('#D8D0C4'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 140 + k * 8, PG - 2 - k * 2); g.quadraticCurveTo(cx, PG - 30 + k * 6, cx + 140 - k * 8, PG - 2 - k * 2); g.stroke(); }
    for (const lx of [cx - 144, cx + 144]) { box(g, lx - 2, PG - 156, 4, 156, T('#6A6488')); for (let y = PG - 152; y < PG; y += 10) { g.strokeStyle = T('#6A6488'); g.lineWidth = 1; g.beginPath(); g.moveTo(lx - 4, y); g.lineTo(lx + 4, y + 10); g.stroke(); } box(g, lx - 12, PG - 166, 24, 12, T('#3A3450')); for (let k = 0; k < 6; k++) box(g, lx - 10 + (k % 3) * 7, PG - 164 + Math.floor(k / 3) * 5, 5, 4, lamps ? '#FFF6D0' : T('#C8C4D8')); } }
  // ---- a STUPID DAD billboard: the show's star, CANCELED slapped across him
  { const bx = 1460, by = PG - 136, bw = 176, bh = 70, S = T('#5A5470');
    for (const lx of [bx + bw * 0.2, bx + bw * 0.8]) { box(g, lx - 2, by + bh, 4, PG - by - bh, S); for (let yy = by + bh + 6; yy < PG - 4; yy += 12) { g.strokeStyle = S; g.lineWidth = 1; g.beginPath(); g.moveTo(lx - 2, yy); g.lineTo(lx + 2, yy + 12); g.stroke(); } }
    box(g, bx - 2, by - 2, bw + 4, bh + 4, T(INK));
    for (let k = 0; k < 3; k++) box(g, bx, by + k * 24, bw, 24, T(['#F6D23A', '#F2C030', '#E8AE28'][k]));
    dadFace(g, T, bx + 32, by + 38, 18);
    box(g, bx + 52, by + 30, 8, 14, T(INK)); box(g, bx + 53, by + 31, 6, 12, T('#D8D8E8')); box(g, bx + 53, by + 35, 6, 4, T('#C8283E'));
    signText(g, 'STUPID DAD', bx + 118, by + 24, { sx: 2, sy: 2, bold: true, fill: [T('#FF6A6A'), T('#C8283E')], ink: T(INK) });
    signText(g, "AMERICA'S NEW", bx + 118, by + 42, tiny(T('#2A1A4A'))); signText(g, 'FAVORITE FAMILY!', bx + 118, by + 52, tiny(T('#2A1A4A')));
    g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip(); g.translate(bx + bw / 2, by + bh / 2); g.rotate(-0.3); box(g, -110, -8, 220, 16, T(INK)); box(g, -110, -7, 220, 14, T('#DC2626')); signText(g, 'CANCELED', 0, 4, tiny(T('#FFFFFF'))); g.restore();
    box(g, bx - 4, by + bh + 2, bw + 8, 2, S); }
  // ---- a gift shop's striped dome; the park's light tower; flags
  { const gx = 1760, gt = PG - 66;
    box(g, gx - 40, gt, 80, 66, T('#F8E0EC')); box(g, gx + 26, gt, 14, 66, T('#E0C0D2')); box(g, gx - 40, gt, 4, 66, T('#FFF4FA'));
    for (let k = 0; k < 4; k++) box(g, gx - 32 + k * 18, gt + 16, 10, 16, win(tod, k + 40, T('#7AA6D8')));
    g.save(); g.beginPath(); g.moveTo(gx - 44, gt); g.bezierCurveTo(gx - 60, gt - 50, gx - 6, gt - 50, gx, gt - 84); g.bezierCurveTo(gx + 6, gt - 50, gx + 60, gt - 50, gx + 44, gt); g.closePath(); g.clip();
    for (let k = -60; k < 60; k += 12) { g.fillStyle = T(((k / 12) | 0) % 2 ? '#E2465E' : '#FFF4F8'); g.fillRect(gx + k, gt - 90, 6, 92); }
    g.fillStyle = 'rgba(30,16,40,0.18)'; g.fillRect(gx + 10, gt - 90, 40, 92); g.restore();
    signText(g, 'GIFTS', gx, gt + 50, tiny(T('#B91C4A')));
    const lx = 1930; for (let y = PG - 190; y < PG; y += 2) box(g, lx - 2 + ((y >> 2) % 2), y, 3, 2, T('#7A7494')); box(g, lx - 14, PG - 202, 28, 14, T('#3A3450')); for (let k = 0; k < 8; k++) box(g, lx - 12 + (k % 4) * 6, PG - 200 + Math.floor(k / 4) * 6, 4, 4, lamps ? '#FFF6D0' : T('#C8C4D8')); }
  // ---- trees (puff-balls and Truffula tufts) and lamp posts along the front, bunting between
  for (let x = 8; x < PW; x += 24) {
    const hs = hash(x * 0.41); if (hs < 0.32) continue;
    const h = 20 + Math.floor(hash(x * 1.3) * 24), col = ['#F472B6', '#FDE047', '#C084FC', '#5EEAD4', '#FB923C', '#6CCC6A'][Math.floor(hash(x * 2.1) * 6)], R = [T(mix(col, INK, 0.35)), T(col), T(mix(col, '#FFFFFF', 0.4))];
    if (hs > 0.75) { const bend = (hash(x) - 0.5) * 10; for (let y = 0; y < h; y += 2) box(g, x + bend * (y / h) ** 2, PG - y - 2, 2, 2, (y >> 1) % 3 ? T('#F4ECD8') : T('#2A2638')); pixelBlob(g, x + bend, PG - h - 6, 9, 7, R[0]); pixelBlob(g, x + bend - 1, PG - h - 7, 8, 6, R[1]); pixelBlob(g, x + bend - 3, PG - h - 9, 4, 3, R[2]); }
    else { box(g, x, PG - h, 2, h, T('#6A4A3A')); pixelBlob(g, x + 1, PG - h - 4, 7, 7, R[0]); pixelBlob(g, x, PG - h - 5, 6, 6, R[1]); pixelBlob(g, x - 2, PG - h - 7, 2, 2, R[2]); }
  }
  for (let k = 0; k < 13; k++) { const x0 = 30 + k * 160, x1 = x0 + 70, y = PG - 58 - hash(k) * 30; for (let t = 0; t <= 1; t += 0.06) { const xx = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * 10; box(g, xx, yy, 1, 1, T('#5A4A6A')); if (Math.round(t / 0.06) % 2) { g.fillStyle = T(['#E2465E', '#F2D23A', '#5EC4F4', '#84CC16'][Math.round(t / 0.12) % 4]); g.beginPath(); g.moveTo(xx - 2, yy); g.lineTo(xx + 2, yy); g.lineTo(xx, yy + 4); g.closePath(); g.fill(); } } }
  hazeBands(g, 0, PG - 90, PW, 90, skyAt(0.9, tod), 0.0, 0.18, 4);
};
const ballR3 = (g: Ctx, x: number, y: number, r: number, R: string[]) => { g.fillStyle = R[0]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.fillStyle = R[1]; g.beginPath(); g.arc(x - 1, y - 1, r - 1, 0, Math.PI * 2); g.fill(); box(g, x - r * 0.5, y - r * 0.5, 2, 2, R[2]); };

// ---------------------------------------------------------------------------------------------------------------
// The zone's own roofs past the street: show buildings, giant props, neon, billboards, slides

const RW = 1800, RH = 320, RG = RH - 40;
type Prop = 'soda' | 'pizza' | 'sneaker' | 'boombox' | 'bucket' | 'rat' | 'gloppy' | 'neon' | 'dish' | 'slides' | 'board' | 'light';
interface Roof { x: number; w: number; h: number; prop: Prop; seed: number }
const PROPS: Prop[] = ['soda', 'neon', 'pizza', 'dish', 'sneaker', 'slides', 'boombox', 'board', 'bucket', 'light', 'rat', 'neon', 'gloppy', 'dish'];
const ROOFS: Roof[] = (() => {
  const out: Roof[] = [];
  let x = 4, i = 0;
  while (x < RW - 60) {
    const s = i * 11 + 7, w = 70 + Math.floor(hash(s * 1.7) * 70);
    out.push({ x, w, h: 70 + Math.floor(hash(s * 2.3) * 80), prop: PROPS[i % PROPS.length], seed: s });
    x += w + 8 + Math.floor(hash(s * 3.1) * 16); i++;
  }
  return out;
})();
const ZWALLS = ['#B9A4F0', '#7EE0D2', '#F8A8D0', '#FCE07A', '#9CC4F6', '#FDB98A', '#C4F07A'];
const ZBANDS = ['#7C3AED', '#0D9488', '#DB2777', '#EA580C', '#2563EB', '#65A30D'];
const paintRoofs = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.14), lamps = tod.lamps > 0.3;
  box(g, 0, RG - 10, RW, RH - RG + 10, T('#9A94B4'));
  for (const r of ROOFS) {
    const x = r.x, w = r.w, top = RG - r.h, wall = ZWALLS[((Math.floor(r.seed) % ZWALLS.length) + ZWALLS.length) % ZWALLS.length], band = ZBANDS[((Math.floor(r.seed * 3) % ZBANDS.length) + ZBANDS.length) % ZBANDS.length], Wl = st3(T, wall), Bd = st3(T, band);
    // (the box: inked, lit down its left, shaded right, a parapet, a zigzag band, squiggles and confetti)
    box(g, x - 1, top - 1, w + 2, r.h + 1, T(INK)); box(g, x, top, w, r.h, Wl[1]);
    box(g, x, top, 4, r.h, Wl[2]); box(g, x + w - 10, top, 10, r.h, Wl[0]); checker(g, x + w - 12, top, 2, r.h, Wl[0], 0, 1);
    const zy = top + r.h * 0.42;
    for (let k = 0; k < w; k += 2) { const zz = Math.abs(((k / 2 + r.seed) % 12) - 6); box(g, x + k, zy + zz, 2, 7, Bd[1]); box(g, x + k, zy + zz, 2, 1, Bd[2]); }
    g.strokeStyle = T(['#1F2937', '#DB2777', '#0D9488', '#7C3AED'][((Math.floor(r.seed) % 4) + 4) % 4]); g.lineWidth = 2; g.beginPath();
    for (let k = 0; k <= 8; k++) { const sx = x + 8 + (k * (w - 16)) / 8, sy = top + r.h * 0.22 + (k % 2 ? -5 : 5); if (k) g.lineTo(sx, sy); else g.moveTo(sx, sy); } g.stroke();
    for (let k = 0; k < 10; k++) box(g, x + 4 + hash(r.seed + k * 3.1) * (w - 10), top + 6 + hash(r.seed * 2 + k) * (r.h - 16), 3, 2, T(['#FDE047', '#22D3EE', '#F472B6', '#A3E635'][k % 4]));
    // (windows along the bottom row, lit after dark; the parapet with its coping)
    for (let k = 0; k < Math.floor((w - 16) / 18); k++) { box(g, x + 10 + k * 18, RG - 24, 10, 12, T(INK)); box(g, x + 11 + k * 18, RG - 23, 8, 10, win(tod, r.seed * 5 + k, T('#5A7AAA'))); box(g, x + 11 + k * 18, RG - 23, 8, 2, T('#C8E4F8')); }
    box(g, x - 3, top - 6, w + 6, 6, T(INK)); box(g, x - 2, top - 5, w + 4, 4, Bd[1]); box(g, x - 2, top - 5, w + 4, 1, Bd[2]);
    // (a vent unit on the roof, its fan)
    if (r.seed % 3 === 0) { box(g, x + w - 30, top - 16, 20, 11, T('#8A8AA0')); box(g, x + w - 30, top - 16, 20, 2, T('#B8B8CC')); for (let k = 0; k < 4; k++) box(g, x + w - 28 + k * 5, top - 12, 3, 6, T('#5A5A70')); }
    // (the prop on top)
    const cx = x + w / 2, pt = top - 6;
    const neonC = (col: string) => neonOf(tod, col, T);
    if (r.prop === 'soda') {
      const C = st3(T, '#E2465E');
      g.fillStyle = T(INK); g.beginPath(); g.moveTo(cx - 20, pt - 70); g.lineTo(cx + 20, pt - 70); g.lineTo(cx + 15, pt); g.lineTo(cx - 15, pt); g.closePath(); g.fill();
      g.fillStyle = C[1]; g.beginPath(); g.moveTo(cx - 18, pt - 68); g.lineTo(cx + 18, pt - 68); g.lineTo(cx + 14, pt - 1); g.lineTo(cx - 14, pt - 1); g.closePath(); g.fill();
      box(g, cx - 16, pt - 66, 7, 62, C[2]); box(g, cx + 8, pt - 66, 8, 62, C[0]);
      for (let k = 0; k < 3; k++) box(g, cx - 17, pt - 54 + k * 18, 34, 4, T('#FFFFFF'));
      box(g, cx - 22, pt - 76, 44, 8, T(INK)); box(g, cx - 21, pt - 75, 42, 6, T('#F4F0F8'));
      box(g, cx + 2, pt - 112, 5, 38, T(INK)); for (let y = pt - 111; y < pt - 75; y += 6) { box(g, cx + 3, y, 3, 3, T('#FFFFFF')); box(g, cx + 3, y + 3, 3, 3, T('#2A80C4')); }
      box(g, cx + 2, pt - 114, 14, 5, T(INK)); box(g, cx + 3, pt - 113, 12, 3, T('#FFFFFF'));
    } else if (r.prop === 'pizza') {
      const Cr = st3(T, '#E8B060'), Ch = st3(T, '#FCD84A');
      g.save(); g.translate(cx, pt - 6); g.rotate(-0.2);
      g.fillStyle = T(INK); g.beginPath(); g.moveTo(-34, -64); g.lineTo(34, -64); g.lineTo(0, 4); g.closePath(); g.fill();
      g.fillStyle = Ch[1]; g.beginPath(); g.moveTo(-30, -58); g.lineTo(30, -58); g.lineTo(0, 0); g.closePath(); g.fill();
      g.fillStyle = Ch[2]; g.beginPath(); g.moveTo(-28, -56); g.lineTo(-4, -56); g.lineTo(-12, -30); g.closePath(); g.fill();
      box(g, -36, -70, 72, 10, T(INK)); box(g, -35, -69, 70, 8, Cr[1]); box(g, -35, -69, 70, 2, Cr[2]); box(g, -35, -63, 70, 2, Cr[0]);
      for (const [px2, py2] of [[-14, -46], [8, -48], [-2, -30], [12, -32], [-4, -14]]) { g.fillStyle = T('#B91C1C'); g.beginPath(); g.arc(px2, py2, 5, 0, Math.PI * 2); g.fill(); box(g, px2 - 2, py2 - 3, 2, 2, T('#F06A72')); }
      for (const dx of [-20, 4, 22]) { box(g, dx, -58, 4, 10 + (dx & 7), Ch[1]); box(g, dx, -58, 1, 8, Ch[2]); }
      g.restore();
    } else if (r.prop === 'sneaker') {
      const Sh = st3(T, '#F4F0F8'), Ac = st3(T, '#E2465E');
      box(g, cx - 40, pt - 12, 82, 12, T(INK)); box(g, cx - 39, pt - 11, 80, 10, T('#F4F4F4')); box(g, cx - 39, pt - 5, 80, 4, T('#C8C4D8'));
      g.fillStyle = T(INK); g.beginPath(); g.moveTo(cx - 36, pt - 11); g.lineTo(cx - 34, pt - 70); g.lineTo(cx - 6, pt - 70); g.lineTo(cx - 2, pt - 34); g.quadraticCurveTo(cx + 30, pt - 34, cx + 42, pt - 11); g.closePath(); g.fill();
      g.fillStyle = Sh[1]; g.beginPath(); g.moveTo(cx - 34, pt - 12); g.lineTo(cx - 32, pt - 68); g.lineTo(cx - 8, pt - 68); g.lineTo(cx - 4, pt - 32); g.quadraticCurveTo(cx + 28, pt - 32, cx + 39, pt - 12); g.closePath(); g.fill();
      box(g, cx - 32, pt - 66, 5, 54, Sh[2]); g.fillStyle = Ac[1]; g.beginPath(); g.moveTo(cx - 30, pt - 22); g.quadraticCurveTo(cx - 6, pt - 44, cx + 26, pt - 18); g.lineTo(cx + 20, pt - 14); g.quadraticCurveTo(cx - 6, pt - 34, cx - 30, pt - 16); g.closePath(); g.fill();
      for (let k = 0; k < 5; k++) box(g, cx - 26 + k * 3, pt - 60 + k * 6, 14, 2, T('#5A5470'));
      box(g, cx - 36, pt - 70, 30, 6, Ac[1]); box(g, cx - 36, pt - 70, 30, 2, Ac[2]);
    } else if (r.prop === 'boombox') {
      const Bx = st3(T, '#3A3A4A');
      box(g, cx - 42, pt - 46, 84, 46, T(INK)); box(g, cx - 41, pt - 45, 82, 44, Bx[1]); box(g, cx - 41, pt - 45, 82, 3, Bx[2]); box(g, cx + 34, pt - 42, 7, 41, Bx[0]);
      for (const s of [-1, 1]) { const sx = cx + s * 24; g.fillStyle = T(INK); g.beginPath(); g.arc(sx, pt - 22, 15, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#5A5A6A'); g.beginPath(); g.arc(sx, pt - 22, 13, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#2A2A36'); g.beginPath(); g.arc(sx, pt - 22, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#8A8A9A'); g.beginPath(); g.arc(sx - 2, pt - 24, 3, 0, Math.PI * 2); g.fill(); }
      box(g, cx - 8, pt - 34, 16, 10, T('#1A1A24')); box(g, cx - 6, pt - 32, 12, 6, neonC('#22D3EE'));
      g.strokeStyle = T(INK); g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 30, pt - 46); g.lineTo(cx - 26, pt - 60); g.lineTo(cx + 26, pt - 60); g.lineTo(cx + 30, pt - 46); g.stroke(); g.strokeStyle = T('#C8C8D8'); g.lineWidth = 2; g.stroke();
      for (let k = 0; k < 3; k++) { g.strokeStyle = T('#F472B6'); g.lineWidth = 1.5; g.beginPath(); g.arc(cx + 46, pt - 30, 6 + k * 6, -0.7, 0.7); g.stroke(); }
    } else if (r.prop === 'bucket') {
      // (the slime bucket on its frame, tipped, glop slopping over the lip and down the wall)
      const Bk = st3(T, '#7C3AED'), Gl = st3(T, '#7ED321');
      box(g, cx - 34, pt - 64, 4, 64, T('#5A5470')); box(g, cx + 30, pt - 64, 4, 64, T('#5A5470')); box(g, cx - 36, pt - 66, 72, 4, T('#6A6488'));
      g.save(); g.translate(cx, pt - 64); g.rotate(0.5);
      g.fillStyle = T(INK); g.beginPath(); g.moveTo(-24, 0); g.lineTo(24, 0); g.lineTo(18, 44); g.lineTo(-18, 44); g.closePath(); g.fill();
      g.fillStyle = Bk[1]; g.beginPath(); g.moveTo(-22, 2); g.lineTo(22, 2); g.lineTo(16, 42); g.lineTo(-16, 42); g.closePath(); g.fill();
      box(g, -20, 4, 6, 36, Bk[2]); box(g, 10, 4, 8, 36, Bk[0]); box(g, -24, -2, 48, 5, T(INK)); box(g, -22, -1, 44, 3, Gl[1]);
      g.restore();
      g.fillStyle = Gl[0]; g.beginPath(); g.moveTo(cx - 20, pt - 72); g.quadraticCurveTo(cx - 40, pt - 60, cx - 44, pt + 4); g.lineTo(cx - 30, pt + 4); g.quadraticCurveTo(cx - 28, pt - 50, cx - 14, pt - 66); g.closePath(); g.fill();
      g.fillStyle = Gl[1]; g.beginPath(); g.moveTo(cx - 19, pt - 71); g.quadraticCurveTo(cx - 37, pt - 58, cx - 40, pt + 4); g.lineTo(cx - 33, pt + 4); g.quadraticCurveTo(cx - 31, pt - 50, cx - 15, pt - 66); g.closePath(); g.fill();
      box(g, cx - 38, pt - 40, 2, 30, Gl[2]);
      signText(g, 'SLIME TIME!', cx, pt - 76, tiny(neonC('#A3E635'), T(INK)));
    } else if (r.prop === 'rat') {
      // (the inflatable Rad Rat: grey, shades, the cap backwards, a guy rope)
      const Rt = st3(T, '#A8A8BC');
      for (const s of [-1, 1]) { g.fillStyle = T(INK); g.beginPath(); g.arc(cx + s * 22, pt - 92, 13, 0, Math.PI * 2); g.fill(); g.fillStyle = Rt[1]; g.beginPath(); g.arc(cx + s * 22, pt - 92, 11.5, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#F4A6C8'); g.beginPath(); g.arc(cx + s * 22, pt - 92, 6, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = T(INK); g.beginPath(); g.ellipse(cx, pt - 36, 24, 36, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#84CC16'); g.beginPath(); g.ellipse(cx, pt - 36, 22, 34, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#A8E04A'); g.beginPath(); g.ellipse(cx - 8, pt - 44, 6, 18, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = T(INK); g.beginPath(); g.ellipse(cx, pt - 78, 26, 22, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = Rt[1]; g.beginPath(); g.ellipse(cx, pt - 78, 24, 20, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = Rt[2]; g.beginPath(); g.ellipse(cx - 8, pt - 86, 9, 7, 0, 0, Math.PI * 2); g.fill();
      box(g, cx - 18, pt - 82, 36, 7, T('#18181B')); box(g, cx - 18, pt - 82, 36, 1, T('#EC4899'));
      g.fillStyle = T('#F472B6'); g.beginPath(); g.arc(cx, pt - 68, 4, 0, Math.PI * 2); g.fill(); box(g, cx - 4, pt - 62, 3, 5, T('#FFFFFF')); box(g, cx + 1, pt - 62, 3, 5, T('#FFFFFF'));
      g.fillStyle = T('#DC2626'); g.beginPath(); g.ellipse(cx, pt - 96, 18, 8, 0, Math.PI, 0); g.fill(); box(g, cx - 34, pt - 98, 16, 4, T('#B91C1C'));
      for (let k = 0; k < 5; k++) { g.fillStyle = T('#A855F7'); g.beginPath(); g.moveTo(cx - 10 + k * 5, pt - 103); g.lineTo(cx - 8 + k * 5, pt - 116 - (k % 2) * 4); g.lineTo(cx - 6 + k * 5, pt - 103); g.closePath(); g.fill(); }
      g.strokeStyle = T('#5A5470'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 20, pt - 50); g.lineTo(x + 4, pt); g.moveTo(cx + 20, pt - 50); g.lineTo(x + w - 4, pt); g.stroke();
    } else if (r.prop === 'gloppy') {
      const Gl = st3(T, '#65D11B');
      g.fillStyle = T(INK); g.beginPath(); g.ellipse(cx, pt - 34, 30, 36, 0, Math.PI, 0); g.lineTo(cx + 30, pt); g.lineTo(cx - 30, pt); g.closePath(); g.fill();
      g.fillStyle = Gl[1]; g.beginPath(); g.ellipse(cx, pt - 34, 28, 34, 0, Math.PI, 0); g.lineTo(cx + 28, pt - 1); g.lineTo(cx - 28, pt - 1); g.closePath(); g.fill();
      g.fillStyle = Gl[2]; g.beginPath(); g.ellipse(cx - 12, pt - 46, 7, 14, -0.3, 0, Math.PI * 2); g.fill(); box(g, cx + 14, pt - 40, 12, 38, Gl[0]);
      for (const s of [-1, 1]) { g.strokeStyle = Gl[1]; g.lineWidth = 4; g.beginPath(); g.moveTo(cx + s * 8, pt - 64); g.quadraticCurveTo(cx + s * 14, pt - 80, cx + s * 12, pt - 88); g.stroke(); g.fillStyle = T(INK); g.beginPath(); g.arc(cx + s * 12, pt - 90, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#FFFFFF'); g.beginPath(); g.arc(cx + s * 12, pt - 90, 5.5, 0, Math.PI * 2); g.fill(); box(g, cx + s * 12 - 1, pt - 91, 3, 3, T(INK)); }
      g.fillStyle = T('#7F1D1D'); g.beginPath(); g.ellipse(cx, pt - 30, 12, 9, 0, 0, Math.PI * 2); g.fill();
      for (let k = 0; k < 4; k++) { box(g, cx - 20 + k * 12, pt - 4, 4, 6 + (k % 2) * 4, Gl[1]); }
    } else if (r.prop === 'neon') {
      // (a lightning bolt of neon on a frame: EXTREME! (or TOTALLY RAD!))
      const label = r.seed % 2 ? 'EXTREME!' : 'TOTALLY RAD!';
      box(g, cx - 2, pt - 70, 4, 70, T('#5A5470')); for (let y = pt - 66; y < pt; y += 10) { g.strokeStyle = T('#5A5470'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 10, y); g.lineTo(cx + 10, y + 10); g.stroke(); }
      const bolt: [number, number][] = [[cx - 26, pt - 120], [cx + 20, pt - 120], [cx + 4, pt - 98], [cx + 26, pt - 98], [cx - 16, pt - 64], [cx - 4, pt - 90], [cx - 28, pt - 90]];
      g.fillStyle = T(INK); g.beginPath(); bolt.forEach(([a, b], k) => (k ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.fill();
      g.strokeStyle = neonC('#FDE047'); g.lineWidth = 2; g.stroke();
      box(g, cx - 54, pt - 62, 108, 20, T(INK)); box(g, cx - 53, pt - 61, 106, 18, T('#1E1B3A'));
      signText(g, label, cx, pt - 47, { sx: 1, sy: 1, bold: true, slant: 1, fill: neonC(r.seed % 4 < 2 ? '#F472B6' : '#22D3EE'), ink: T(INK) });
    } else if (r.prop === 'dish') {
      g.fillStyle = T(INK); g.beginPath(); g.ellipse(cx - 6, pt - 30, 22, 24, -0.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = T('#D8D8E4'); g.beginPath(); g.ellipse(cx - 6, pt - 30, 20, 22, -0.5, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#B4B4C8'); g.beginPath(); g.ellipse(cx - 2, pt - 26, 12, 15, -0.5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = T('#5A5470'); g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 6, pt - 30); g.lineTo(cx + 16, pt - 48); g.moveTo(cx, pt - 10); g.lineTo(cx, pt); g.stroke(); box(g, cx + 14, pt - 51, 5, 5, T('#5A5470'));
      box(g, cx + 24, pt - 50, 2, 50, T('#5A5470')); box(g, cx + 20, pt - 52, 10, 3, T('#7A7494')); if (lamps) box(g, cx + 24, pt - 54, 2, 2, '#FF4040');
    } else if (r.prop === 'slides') {
      // (a tower with the water slides' tubes corkscrewing down it: neon tubes, a splash pool's rim)
      box(g, cx - 10, pt - 120, 20, 120, T(INK)); box(g, cx - 9, pt - 119, 18, 119, T('#8A8AA0')); for (let y = pt - 116; y < pt; y += 12) { g.strokeStyle = T('#5A5A70'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 9, y); g.lineTo(cx + 9, y + 12); g.stroke(); }
      box(g, cx - 18, pt - 126, 36, 8, T(INK)); box(g, cx - 17, pt - 125, 34, 6, T('#F2D23A'));
      for (const [col, ph] of [['#22D3EE', 0], ['#F472B6', Math.PI], ['#A3E635', Math.PI / 2]] as [string, number][]) {
        const Tb = st3(T, col);
        for (let k = 0; k < 120; k += 2) { const a = k * 0.09 + ph, xx = cx + Math.sin(a) * 30, yy = pt - 118 + k; const front = Math.cos(a) > 0; if (!front) continue; box(g, xx - 4, yy, 9, 3, T(INK)); box(g, xx - 3, yy, 7, 2, Tb[1]); box(g, xx - 3, yy, 7, 1, Tb[2]); }
      }
    } else if (r.prop === 'board') {
      // (a giant skateboard stood on its tail against a frame: the deck's flames, its wheels)
      g.save(); g.translate(cx, pt); g.rotate(-0.12);
      box(g, -12, -118, 24, 118, T(INK)); box(g, -11, -117, 22, 116, T('#7C3AED')); box(g, -11, -117, 5, 116, T('#9C66F5'));
      for (let k = 0; k < 6; k++) { g.fillStyle = T(k % 2 ? '#F97316' : '#FDE047'); g.beginPath(); g.moveTo(-11, -24 - k * 14); g.lineTo(0, -38 - k * 14); g.lineTo(11, -24 - k * 14); g.closePath(); g.fill(); }
      for (const wy of [-104, -14]) for (const s of [-1, 1]) { g.fillStyle = T(INK); g.beginPath(); g.arc(s * 15, wy, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#FDE047'); g.beginPath(); g.arc(s * 15, wy, 4.5, 0, Math.PI * 2); g.fill(); }
      g.restore();
    } else {
      // (a light tower: a lattice mast, a rack of lamps)
      for (let y = pt - 140; y < pt; y += 2) box(g, cx - 3 + ((y >> 2) % 2) * 2, y, 3, 2, T('#7A7494'));
      box(g, cx - 18, pt - 152, 36, 16, T('#3A3450')); for (let k = 0; k < 10; k++) box(g, cx - 16 + (k % 5) * 7, pt - 150 + Math.floor(k / 5) * 7, 5, 5, lamps ? '#FFF6D0' : T('#C8C4D8'));
    }
    // (a rooftop billboard on some, behind the prop)
    if (r.seed % 5 === 2) {
      const bw = Math.min(w - 10, 96), bx = x + 5, by = top - 46, labels = ['GAME ZONE', 'PIZZA PIT', 'RAD!', 'GNARLY', 'BOO-YAH!'], L = labels[((Math.floor(r.seed) % labels.length) + labels.length) % labels.length];
      box(g, bx + 10, by + 30, 3, 14, T('#5A5470')); box(g, bx + bw - 13, by + 30, 3, 14, T('#5A5470'));
      box(g, bx - 1, by - 1, bw + 2, 32, T(INK)); box(g, bx, by, bw, 30, Bd[1]); box(g, bx, by, bw, 2, Bd[2]);
      signText(g, L, bx + bw / 2, by + 20, { sx: 1, sy: 2, bold: true, slant: 1, fill: [T('#FFFFFF'), T('#FDE047')], ink: T(INK) });
    }
  }
  // (chain-link along the foot between them, a hedge of neon-painted trash cans and palms)
  for (let x = 0; x < RW; x += 2) for (let y = RG - 30; y < RG; y += 2) if (((x >> 1) + (y >> 1)) % 4 === 0) box(g, x, y, 1, 1, T('#9A9AB4'));
  for (let x = 0; x < RW; x += 44) box(g, x, RG - 32, 2, 32, T('#6A6A84'));
  box(g, 0, RG - 32, RW, 1, T('#B4B4CC'));
  for (let x = 30; x < RW; x += 110) {
    const hgt = 46 + hash(x) * 20, bend = (hash(x * 3) - 0.5) * 10;
    for (let y = 0; y < hgt; y += 2) box(g, x + bend * (y / hgt) ** 2, RG - y - 2, 3, 2, (y >> 1) % 2 ? T('#8A6A4A') : T('#6A4A3A'));
    for (let k = 0; k < 6; k++) { const a = -Math.PI + (k / 5) * Math.PI, tx = x + bend; g.strokeStyle = T(k % 2 ? '#3A9A4A' : '#2A7A3A'); g.lineWidth = 3; g.beginPath(); g.moveTo(tx, RG - hgt); g.quadraticCurveTo(tx + Math.cos(a) * 14, RG - hgt - 10, tx + Math.cos(a) * 22, RG - hgt + 6); g.stroke(); }
  }
  hazeBands(g, 0, RG - 60, RW, 60, skyAt(0.92, tod), 0.0, 0.2, 4);
};

// ---------------------------------------------------------------------------------------------------------------

export const drawBigkidFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), hz = horizonY(state), cx = state.camera.x, f = state.frame;
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: hz, sun: [600, 104], moon: [180, 84], t: f, scroll: cx * 0.01 });
  tile(c, 'clouds', cx * 0.015 + f * 0.05, hz - 420, CH, CW, g => paintClouds(g, tod));
  drawBlimp(c, state);
  tile(c, 'suburbs', cx * 0.03, hz - HH + 10, HH, HW, g => paintSuburbs(g, tod));
  tile(c, 'park', cx * 0.07, hz - PH + 24, PH, PW, g => paintPark(g, tod));
  // (the water tower up on its hill over the park, drifting across as he goes: the landmark, kept clear)
  const m = MONUMENT_AT.bigkid;
  if (m) drawMonument(c, state, m, m.foot - 36 + (hz - 440));
  const ry = hz + 34 - RG;
  tile(c, 'roofs', cx * 0.17, ry, RH, RW, g => paintRoofs(g, tod));
  box(c, 0, ry + RH - 1, W, H, farCol(tod, 0.14)('#9A94B4'));
};
