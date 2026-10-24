// DAD GUY LIVE!'s far off (screen space: the backdrop), every layer painted once for the hour into a tile and slid
// along (only the SWILL LITE blimp and the water tower's propeller live). The last of Cartoon Land, late in the day:
//
//   the sky by the hour (a tired blue down through a dusty lilac to an amber blush), fat stepped cumulus warm on their
//   undersides, long stratus streaks lit from below, jet trails; THE SWILL LITE BLIMP (the show's sponsor: silver, the
//   can on its envelope, IT'S BEER. ALMOST. trailing); far off, past the park's berm, the hazy hills and a radio mast,
//   the SWILL brewery (its brick brewhouse, the fermenting tanks, the water tank done up as a giant can, the stack's
//   steam banded off it, hopper cars on the siding), the interstate on its viaduct (cars, billboards), the strip under it
//   (LIQUOR, BOWL-A-RAMA, PIZZA), a high school's football field under its lights, SERENITY OAKS on its knoll, a church,
//   cul-de-sacs; THE CARTOON LAND WATER TOWER (monument.ts: the biggest it ever is); the rest of the park back the way
//   he came (Sillyville's domes, the studios' soundstages and logo, the WACKY WHITE HOUSE with Socks, the big-kid zone's
//   Hurl-A-Whirl, halfpipe, Rad Rat and bolt, PUNCHY & KICKY's bone arch, KILL-O-RAMA pylon, big top and bloody roofs),
//   the park's back lot (the SWILL LITE truck, the maintenance sheds), the main lot's light poles and cars, the big wheel;
//   and nearest, the grove along the park's back fence (maples and oaks in steps, the green privacy slats, utility
//   poles and their wires, the maintenance quonset), lit up after dark. No volcanoes.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { pixelBlob, hazeBands } from '../../../m1/game/render/pixelArt';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { snap2, wave, mist } from '../../adventure/farArt';
import { signText, type Look } from '../../signLetters';
import { box, mix, hash, checker, stamp, INK, type Ctx } from '../kit';
import { MONUMENT_AT, drawMonument } from '../monument';
import { prestamp } from '../../../m1/game/render/stamp';
import { SECTIONS } from '../geometry';
import { farSpooky, farHollywood } from '../glimpse';

/** How far the country, the park and the water tower stand up over the horizon (so they show over the grove). */
const LIFT = 50;

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Where the horizon sits on screen: down in the bowl the eye's lower and the rim hides more of the far off. */
export const horizonY = (state: GameState) => Math.round(436 + Math.max(-26, Math.min(26, (50 - state.camera.y) * 0.1)));

/** The sky, top to horizon: a tired blue, a dusty lilac, an amber blush. */
const SKY = ['#2C5C9E', '#3E74B4', '#6A90C4', '#A0A8CC', '#DCB0A8', '#FFC48A'];

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const fk = () => (fontReady() ? 'f' : 'n');
/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  const tod = timeOfDay(), k = `ct-amf-${key}-${tod.key}-${fk()}`;
  for (let x = -(((off % tw) + tw) % tw); x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, k, 0, 0, tw, h, paint); c.restore(); }
};
/** A far layer's color for the hour: toward dusk and night, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A5A', 0.22), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);
/** A window: lit warm after dark (most of them), else the glass. */
const win = (tod: TimeOfDay, i: number, glass: string) => (tod.lamps > 0.3 ? (hash(i * 1.7) > 0.25 ? (hash(i * 3.1) > 0.5 ? '#FFE08A' : '#F6B860') : glass) : glass);
const tiny = (fill: string | string[], ink?: string): Look => ({ sx: 1, sy: 1, bold: false, fill, ink, gap: 1 });
const tinyB = (fill: string | string[], ink?: string): Look => ({ sx: 1, sy: 1, bold: true, fill, ink });
/** Three steps of a color for a far layer: shade, itself, lit. */
const st3 = (T: (c: string) => string, col: string) => [T(mix(col, INK, 0.3)), T(col), T(mix(col, '#FFFFFF', 0.35))];
const disc = (g: Ctx, x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const oval = (g: Ctx, x: number, y: number, a: number, b: number, col: string, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, a, b, rot, 0, Math.PI * 2); g.fill(); };
const tri = (g: Ctx, pts: number[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
/** A stepped block (inked, lit down its left, shaded down its right, a dithered seam). */
const block = (g: Ctx, x: number, y: number, w: number, h: number, S: string[], ink: string) => {
  box(g, x - 1, y - 1, w + 2, h + 1, ink); box(g, x, y, w, h, S[1]); box(g, x, y, 2, h, S[2]); box(g, x + w - Math.max(2, Math.round(w * 0.18)), y, Math.max(2, Math.round(w * 0.18)), h, S[0]);
  checker(g, x + w - Math.max(2, Math.round(w * 0.18)) - 2, y, 2, h, S[0], 0, 1); box(g, x, y, w, 1, S[2]);
};
/** A stepped puff of a tree (shade, itself, lit) on a trunk. */
const puff = (g: Ctx, x: number, base: number, h: number, r: number, R: string[], trunk: string) => {
  box(g, x - 1, base - h, 3, h, trunk);
  pixelBlob(g, x + 2, base - h - r * 0.2, r, r * 0.85, R[0]); pixelBlob(g, x, base - h - r * 0.35, r * 0.9, r * 0.75, R[1]);
  pixelBlob(g, x - r * 0.3, base - h - r * 0.6, r * 0.45, r * 0.35, R[2]); box(g, x - r * 0.45, base - h - r * 0.8, 2, 2, R[2]);
};

// ---------------------------------------------------------------------------------------------------------------
// Clouds: fat stepped cumulus warm underneath, stratus streaks lit from below, jet trails

const CW = 1200, CH = 200;
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#B898A8', '#D8BCC0', '#F2E0DA', '#FFFFFF'].map(c => cloudTint(c, tod)), warm = cloudTint('#FFC8A0', tod);
  for (let i = 0; i < 6; i++) {
    const cx = (i * CW) / 6 + hash(i * 4.3) * 70, cy = 60 + hash(i * 6.1) * 80, s = 0.7 + hash(i * 8.7) * 0.8, puffs = 3 + Math.floor(hash(i * 1.3) * 4);
    for (const [L, dy, k] of [[0, 3, 1], [1, 0, 0.9], [2, -3, 0.7], [3, -6, 0.4]] as const) {
      for (let p = 0; p < puffs; p++) {
        const px = cx + (p - puffs / 2) * 19 * s, py = cy - Math.sin((p / Math.max(1, puffs - 1)) * Math.PI) * 18 * s + dy * s, r = (13 + hash(i * 13 + p) * 11) * s * k;
        for (const ox of [0, CW, -CW]) pixelBlob(g, px + ox - (L === 3 ? 5 : 0), py, r * 1.3, r * 0.82, C[L]);
      }
    }
    // (the flat bottoms, warm with the low sun, dithered up into the grey)
    for (const ox of [0, CW, -CW]) { box(g, cx + ox - puffs * 9.5 * s, cy + 12 * s, puffs * 19 * s, 3, warm); checker(g, cx + ox - puffs * 9.5 * s, cy + 10 * s, puffs * 19 * s, 2, warm, 0, 2); }
  }
  // (stratus: long thin bars low down, lit amber along their feet)
  for (let i = 0; i < 5; i++) {
    const x0 = hash(i * 9.1) * CW, y0 = 150 + hash(i * 3.7) * 40, len = 180 + hash(i * 2.2) * 260;
    for (const ox of [0, CW, -CW]) { box(g, x0 + ox, y0, len, 3, C[1]); box(g, x0 + ox + 10, y0 - 2, len - 30, 2, C[2]); box(g, x0 + ox + 4, y0 + 3, len - 12, 1, warm); checker(g, x0 + ox - 8, y0, 8, 3, C[1], 0, 1); checker(g, x0 + ox + len, y0, 10, 3, C[1], 1, 1); }
  }
  for (let i = 0; i < 3; i++) {
    const x0 = hash(i * 7.7) * CW, y0 = 18 + hash(i * 2.9) * 60, len = 150 + hash(i * 5.5) * 160, sl = 0.07 + hash(i) * 0.08;
    for (const ox of [0, CW, -CW]) for (let x = 0; x < len; x += 2) {
      const y = y0 + x * sl, fray = x / len;
      if (hash(x * 0.37 + i) < fray * 0.7) continue;
      box(g, x0 + ox + x, y, 2, fray > 0.5 ? 2 : 1, C[fray > 0.6 ? 2 : 3]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The SWILL LITE blimp, live (the show's sponsor): silver, the can on its envelope, a banner trailing

const paintBlimp = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.18);
  const S = ['#5A6070', '#7E8696', '#A8B0BC', '#CED4DC', '#EEF2F6'].map(T);
  // (the banner first, on its line behind)
  const bx = 150, bw = 170, by = 30;
  g.strokeStyle = T('#5A5470'); g.lineWidth = 1; g.beginPath(); g.moveTo(132, 32); g.lineTo(bx, by + 4); g.stroke();
  for (let x = 0; x < bw; x += 2) { const y = by + Math.sin(x * 0.07) * 2; box(g, bx + x, y - 1, 2, 14, T(INK)); box(g, bx + x, y, 2, 12, T(x % 8 < 4 ? '#FFF7E8' : '#F2E8D6')); }
  signText(g, "SWILL LITE: IT'S BEER. ALMOST.", bx + bw / 2, by + 9, tiny(T('#B01C2C')));
  // (the envelope: a long egg banded top to bottom, the fins, the gondola)
  oval(g, 70, 30, 62, 21, T(INK));
  for (let k = 0; k < 5; k++) oval(g, 70, 30 - k * 2.4, 61 - k * 7, 20 - k * 3.6, S[k]);
  tri(g, [126, 22, 140, 10, 140, 26], T(INK)); tri(g, [126, 23, 138, 13, 138, 25], S[2]);
  tri(g, [126, 38, 140, 50, 140, 34], T(INK)); tri(g, [126, 37, 138, 47, 138, 35], S[1]);
  box(g, 54, 50, 26, 7, T(INK)); box(g, 55, 51, 24, 5, S[2]); for (let k = 0; k < 4; k++) box(g, 57 + k * 6, 52, 3, 2, win(tod, k + 900, T('#3A4A6A')));
  // (the can on its side: red, the white band, the crown)
  box(g, 40, 21, 44, 18, T(INK)); box(g, 41, 22, 42, 16, T('#C8102E')); box(g, 41, 22, 42, 3, T('#F25A6E')); box(g, 41, 34, 42, 4, T('#8E0C20'));
  box(g, 41, 27, 42, 6, T('#F4F1E8')); signText(g, 'SWILL', 62, 32, tinyB(T('#B01C2C'))); box(g, 84, 22, 3, 16, T('#C9CDD4'));
  if (tod.lamps > 0.3) { box(g, 10, 29, 2, 2, '#FF5050'); box(g, 136, 24, 2, 2, '#7CFF7C'); }
};
const drawBlimp = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), period = 5200, t = ((state.frame + 900) % period) / period;
  const x = -330 + t * (W + 560) - ((state.camera.x * 0.02) % 200), y = 60 + Math.sin(state.frame * 0.011) * 4;
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `ct-amf-blimp-${tod.key}-${fk()}`, 0, 0, 330, 64, g => paintBlimp(g, tod));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Past the park's berm: the hills, the brewery, the interstate, the strip, the football field, SERENITY OAKS

const HW = 1600, HH = 210;
const backRidge = (x: number) => snap2(HH - 100 + wave(x, HW, 2.3) * 24 + wave(x, HW, 5.1, 2) * 6);
const midRidge = (x: number) => snap2(HH - 58 + wave(x, HW, 3.7) * 12 - Math.abs(wave(x, HW, 1.1, 3)) * 5);
const paintCountry = (g: Ctx, tod: TimeOfDay) => {
  const Tb = farCol(tod, 0.62), Tm = farCol(tod, 0.42), lamps = tod.lamps > 0.3;
  // (the park's neighbors far off over the hills, deep in the haze: Spooky Land back left, Hollywood Land on the right)
  farSpooky(g, farCol(tod, 0.7), 330, HH - 92, lamps);
  farHollywood(g, farCol(tod, 0.7), 760, HH - 94);
  const BR = ['#8C86A8', '#9E9AB8', '#B4B2C8', '#CCCAD6'].map(Tb);
  for (let x = 0; x < HW; x += 2) { const y = backRidge(x), lt = backRidge(x + 4) < backRidge(x - 4); box(g, x, y, 2, HH - y, BR[lt ? 2 : 1]); if (lt) box(g, x, y, 2, 2, BR[3]); else checker(g, x, y + 2, 2, 4, BR[0], 0, 1); }
  // (the radio mast on the back ridge, its guy wires; the light on top)
  { const mx = 96, my = backRidge(96) + 2, P = Tb('#6A6484');
    for (let y = my - 86; y < my; y += 2) { const w = 1 + (y - my + 86) * 0.03; box(g, mx - w, y, 1, 2, P); box(g, mx + w, y, 1, 2, P); if ((y - my) % 8 === 0) box(g, mx - w, y, w * 2, 1, P); }
    g.strokeStyle = Tb('#8A86A0'); g.lineWidth = 1; g.beginPath(); for (const s of [-1, 1]) { g.moveTo(mx, my - 80); g.lineTo(mx + s * 40, my + 6); g.moveTo(mx, my - 50); g.lineTo(mx + s * 30, my + 6); } g.stroke();
    box(g, mx - 1, my - 90, 3, 3, lamps ? '#FF5050' : Tb('#C83A3A')); }
  // (the mid hills: scrub in steps)
  const MR = ['#728A5E', '#82986A', '#9AB27E', '#B8CA94'].map(Tm);
  for (let x = 0; x < HW; x += 2) { const y = midRidge(x), lt = midRidge(x + 4) < midRidge(x - 4); box(g, x, y, 2, HH - y, MR[lt ? 2 : 1]); if (lt) box(g, x, y, 2, 2, MR[3]); }
  for (let x = 4; x < HW; x += 9) { if (hash(x * 0.61) < 0.55) continue; const y = midRidge(x) + 4 + hash(x) * 10, r = 4 + hash(x * 3) * 4; pixelBlob(g, x, y, r, r * 0.8, MR[0]); pixelBlob(g, x - 1, y - 1, r * 0.8, r * 0.6, MR[1]); box(g, x - r * 0.4, y - r * 0.5, 2, 2, MR[3]); }
  // ---- THE SWILL BREWERY: the brick brewhouse, the tanks, the can tower, the stack, hopper cars
  { const bx = 170, base = midRidge(260) + 26, Br = st3(Tm, '#A04A36'), St = st3(Tm, '#B8BCC8');
    block(g, bx, base - 52, 70, 52, Br, Tm(INK));
    for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { const wx = bx + 6 + k * 16, wy = base - 44 + r * 22; box(g, wx, wy, 10, 14, win(tod, k + r * 5 + 500, Tm('#3A4A66'))); g.fillStyle = Br[0]; g.beginPath(); g.arc(wx + 5, wy, 5, Math.PI, 0); g.fill(); g.fillStyle = win(tod, k + r * 5 + 500, Tm('#3A4A66')); g.beginPath(); g.arc(wx + 5, wy + 1, 4, Math.PI, 0); g.fill(); }
    for (let y = base - 50; y < base; y += 4) box(g, bx, y, 70, 1, Br[0]);
    box(g, bx - 2, base - 56, 74, 4, Tm(INK)); box(g, bx - 1, base - 55, 72, 2, Br[2]);
    signText(g, 'SWILL', bx + 35, base - 60, tinyB(Tm('#F4F1E8'), Tm(INK)));
    // (the fermenting tanks: steel cylinders on legs, conical feet)
    for (let k = 0; k < 4; k++) { const tx = bx + 80 + k * 18; block(g, tx, base - 46, 14, 34, St, Tm(INK)); tri(g, [tx, base - 12, tx + 14, base - 12, tx + 7, base - 4], St[0]); box(g, tx + 2, base - 4, 1, 4, St[0]); box(g, tx + 11, base - 4, 1, 4, St[0]); oval(g, tx + 7, base - 46, 7, 2, St[2]); }
    // (the water tank done up as a giant can of SWILL LITE, on its legs)
    const cx = bx + 176, ct = base - 108;
    for (const lx of [cx - 14, cx - 4, cx + 6, cx + 14]) box(g, lx, ct + 46, 2, base - ct - 46, Tm('#5A5470'));
    g.strokeStyle = Tm('#5A5470'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 14, ct + 60); g.lineTo(cx + 14, ct + 80); g.moveTo(cx + 14, ct + 60); g.lineTo(cx - 14, ct + 80); g.stroke();
    box(g, cx - 17, ct - 1, 34, 48, Tm(INK)); box(g, cx - 16, ct, 32, 46, Tm('#C8102E')); box(g, cx - 16, ct, 6, 46, Tm('#F25A6E')); box(g, cx + 8, ct, 8, 46, Tm('#8E0C20')); checker(g, cx + 6, ct, 2, 46, Tm('#8E0C20'), 0, 1);
    box(g, cx - 16, ct + 14, 32, 14, Tm('#F4F1E8')); box(g, cx + 8, ct + 14, 8, 14, Tm('#C8C4B8'));
    signText(g, 'SWILL', cx, ct + 24, tinyB(Tm('#B01C2C'))); box(g, cx - 16, ct - 3, 32, 3, Tm('#C9CDD4')); box(g, cx - 16, ct + 46, 32, 2, Tm('#9AA0A8')); box(g, cx - 3, ct - 5, 6, 2, Tm('#9AA0A8'));
    if (lamps) { box(g, cx - 1, ct - 8, 3, 3, '#FF5050'); }
    // (the stack, its steam banded off downwind)
    const sx = bx + 50, top = base - 96; box(g, sx, top, 8, 44, Br[1]); box(g, sx, top, 2, 44, Br[2]); box(g, sx + 6, top, 2, 44, Br[0]); box(g, sx - 1, top, 10, 3, Tm(INK)); for (let y = top + 6; y < base - 52; y += 9) box(g, sx, y, 8, 1, Br[0]);
    for (let j = 0; j < 7; j++) { const r = 5 + j * 2.4; pixelBlob(g, sx + 6 + j * 10, top - 6 - j * 4, r, r * 0.7, Tm(j < 2 ? '#E8E4EC' : '#D4D0DC')); pixelBlob(g, sx + 4 + j * 10, top - 8 - j * 4, r * 0.6, r * 0.4, Tm('#F8F6FA')); }
    // (hopper cars on the siding)
    box(g, bx - 30, base + 2, 280, 1, Tm('#4A4458'));
    for (let k = 0; k < 5; k++) { const hx = bx - 26 + k * 26; box(g, hx, base - 10, 22, 11, Tm(INK)); box(g, hx + 1, base - 9, 20, 9, Tm(['#7A4A3A', '#5A6A7A', '#8A7A5A'][k % 3])); box(g, hx + 1, base - 9, 20, 1, Tm('#C8B8A8')); disc(g, hx + 5, base + 1, 2, Tm(INK)); disc(g, hx + 17, base + 1, 2, Tm(INK)); } }
  // ---- THE INTERSTATE on its viaduct, cars on it, billboards; the strip under it
  { const vx0 = 470, vx1 = 1060, dy = midRidge(760) - 6, S = st3(Tm, '#B4AEB8');
    box(g, vx0, dy, vx1 - vx0, 6, S[1]); box(g, vx0, dy, vx1 - vx0, 1, S[2]); box(g, vx0, dy + 5, vx1 - vx0, 1, S[0]);
    for (let x = vx0 + 10; x < vx1; x += 46) { box(g, x, dy + 6, 6, HH - dy - 6, S[1]); box(g, x, dy + 6, 1, HH - dy - 6, S[2]); box(g, x + 5, dy + 6, 1, HH - dy - 6, S[0]); }
    for (let k = 0; k < 13; k++) { const cx = vx0 + 8 + hash(k * 3.1) * (vx1 - vx0 - 16); box(g, cx, dy - 4, 8, 4, Tm(['#C83A3A', '#3A6AC8', '#E8E4D8', '#2A8A5A', '#E8B424'][k % 5])); box(g, cx + 2, dy - 5, 4, 1, Tm('#A8C8E8')); if (lamps) box(g, k % 2 ? cx : cx + 7, dy - 3, 1, 1, k % 2 ? '#FFF4C8' : '#FF4040'); }
    // (billboards on the shoulder)
    const bill = (x: number, l1: string, l2: string, bg: string, fg: string) => {
      const by = dy - 40; box(g, x + 10, by + 22, 2, 18, Tm('#5A5470')); box(g, x + 50, by + 22, 2, 18, Tm('#5A5470'));
      box(g, x - 1, by - 1, 64, 24, Tm(INK)); box(g, x, by, 62, 22, Tm(bg)); box(g, x, by, 62, 1, Tm(mix(bg, '#FFFFFF', 0.4)));
      signText(g, l1, x + 31, by + 9, tinyB(Tm(fg))); signText(g, l2, x + 31, by + 18, tiny(Tm(fg)));
      if (lamps) { box(g, x + 14, by + 22, 4, 2, '#FFF0C0'); box(g, x + 44, by + 22, 4, 2, '#FFF0C0'); }
    };
    bill(520, 'SWILL LITE', 'ALMOST BEER', '#C8102E', '#FFFFFF');
    bill(700, 'CARTOON LAND', 'EXIT 12 >', '#6D28D9', '#FDE047');
    bill(900, 'HURT IN A WRECK?', 'CALL BIG AL', '#F2C030', '#1F2937');
    // (the strip: LIQUOR, BOWL-A-RAMA with its pin, PIZZA; a lot of cars)
    const sb = HH - 18;
    const shop = (x: number, w: number, h: number, wall: string, name: string, fg: string) => {
      const S2 = st3(Tm, wall); block(g, x, sb - h, w, h, S2, Tm(INK));
      box(g, x + 3, sb - 10, w - 6, 9, win(tod, x, Tm('#3A4A66'))); box(g, x, sb - h - 2, w, 3, S2[0]);
      signText(g, name, x + w / 2, sb - h + 7, tinyB(lamps ? mix(fg, '#FFFFFF', 0.3) : Tm(fg), Tm(INK)));
    };
    shop(560, 54, 22, '#E8DCC8', 'LIQUOR', '#DC2626'); shop(618, 30, 18, '#C8D4E4', 'LOTTO', '#2563EB');
    shop(660, 92, 26, '#7C3AED', 'BOWL-A-RAMA', '#FDE047');
    { const px = 760; box(g, px, sb - 50, 3, 24, Tm('#5A5470')); oval(g, px + 1, sb - 58, 6, 9, Tm(INK)); oval(g, px + 1, sb - 58, 5, 8, Tm('#F4F1E8')); box(g, px - 3, sb - 58, 9, 2, Tm('#DC2626')); }
    shop(790, 44, 20, '#E8B424', 'PIZZA', '#B91C1C'); shop(840, 60, 20, '#D4DCE4', 'PAWN', '#1F2937');
    for (let k = 0; k < 18; k++) { const cx = 560 + k * 19 + hash(k) * 6; box(g, cx, sb + 6, 10, 4, Tm(['#C83A3A', '#3A6AC8', '#E8E4D8', '#5A5A6A', '#2A8A5A'][k % 5])); box(g, cx + 2, sb + 5, 6, 1, Tm('#A8C8E8')); } }
  // ---- a high school's football field under its lights (the bleachers, the goalposts, the scoreboard)
  { const fx = 1110, base = midRidge(1180) + 30, Gr = st3(Tm, '#3A9A4A');
    tri(g, [fx, base, fx + 180, base, fx + 168, base - 22, fx + 12, base - 22], Gr[1]);
    for (let k = 0; k <= 10; k++) { const t = k / 10; box(g, fx + 12 + t * 156 - (1 - 0) * 0, base - 22, 1, 22, Gr[2]); }
    box(g, fx, base - 1, 180, 1, Gr[0]); tri(g, [fx, base, fx + 12, base - 22, fx + 30, base - 22, fx + 22, base], Tm('#C83A3A'));
    for (const gx of [fx + 8, fx + 172]) { box(g, gx, base - 36, 1, 16, Tm('#F2C030')); box(g, gx - 5, base - 36, 11, 1, Tm('#F2C030')); box(g, gx - 5, base - 46, 1, 10, Tm('#F2C030')); box(g, gx + 5, base - 46, 1, 10, Tm('#F2C030')); }
    for (let r = 0; r < 4; r++) box(g, fx + 40 + r * 2, base - 34 - r * 4, 100 - r * 4, 4, Tm(r % 2 ? '#9AA2AE' : '#B8C0C8'));
    box(g, fx + 74, base - 70, 34, 18, Tm(INK)); box(g, fx + 75, base - 69, 32, 16, Tm('#1F2937')); signText(g, 'HOME 0', fx + 91, base - 63, tiny(lamps ? '#FF6060' : Tm('#C83A3A'))); signText(g, 'GUEST 0', fx + 91, base - 55, tiny(lamps ? '#FF6060' : Tm('#C83A3A')));
    for (const lx of [fx + 20, fx + 160]) { box(g, lx, base - 80, 2, 58, Tm('#5A5470')); box(g, lx - 8, base - 88, 18, 9, Tm('#3A3450')); for (let k = 0; k < 6; k++) box(g, lx - 7 + (k % 3) * 6, base - 87 + Math.floor(k / 3) * 4, 4, 3, lamps ? '#FFF6D0' : Tm('#C8C4D8')); } }
  // ---- SERENITY OAKS (recovery), low brick on its knoll among oaks; a church
  { const sx = 1360, base = midRidge(1420) + 18, Br = st3(Tm, '#B47A5A');
    block(g, sx, base - 22, 110, 22, Br, Tm(INK)); tri(g, [sx - 4, base - 22, sx + 55, base - 34, sx + 114, base - 22], Tm('#6A5A5A'));
    for (let k = 0; k < 8; k++) box(g, sx + 6 + k * 13, base - 16, 7, 8, win(tod, k + 700, Tm('#4A5A7A')));
    box(g, sx + 30, base + 2, 50, 12, Tm(INK)); box(g, sx + 31, base + 3, 48, 10, Tm('#F4F1E8')); signText(g, 'SERENITY OAKS', sx + 55, base + 10, tiny(Tm('#2A5A3A')));
    const Oak = st3(Tm, '#4A7A3E'); for (const ox of [sx - 14, sx + 120, sx + 136]) puff(g, ox, base, 14, 12, Oak, Tm('#4A3A2A'));
    const ch = 1540, cb = midRidge(1550) + 20, Wh = st3(Tm, '#ECE6DA'); block(g, ch, cb - 20, 26, 20, Wh, Tm(INK)); box(g, ch + 18, cb - 44, 8, 24, Wh[1]); tri(g, [ch + 17, cb - 44, ch + 22, cb - 60, ch + 27, cb - 44], Tm('#5A5A6A')); box(g, ch + 21, cb - 66, 1, 6, Tm('#5A5A6A')); box(g, ch + 19, cb - 64, 5, 1, Tm('#5A5A6A')); box(g, ch + 8, cb - 12, 6, 12, Tm('#5A3A2A')); }
  // (cul-de-sacs in the gaps)
  for (let i = 0; i < 54; i++) {
    const hx = 10 + i * 30 + hash(i * 3.3) * 12;
    if ((hx > 150 && hx < 430) || (hx > 540 && hx < 920) || (hx > 1090 && hx < 1300) || (hx > 1340 && hx < 1570)) continue;
    const hy = midRidge(hx) + 22 + (i % 3) * 7, roof = Tm(['#9A5A4A', '#6A6A7A', '#8A7A5A', '#5A6A8A'][i % 4]), wall = ['#E8DCC8', '#D4DCE4', '#F0E4D0'][i % 3];
    box(g, hx - 7, hy - 5, 14, 6, Tm(wall)); box(g, hx + 3, hy - 5, 4, 6, Tm(mix(wall, INK, 0.2)));
    tri(g, [hx - 9, hy - 5, hx - 4, hy - 10, hx + 4, hy - 10, hx + 9, hy - 5], roof);
    box(g, hx - 5, hy - 3, 2, 2, win(tod, i * 7, Tm('#5A6A8A'))); box(g, hx + 1, hy - 3, 2, 2, win(tod, i * 7 + 1, Tm('#5A6A8A')));
    if (hash(i * 5.1) > 0.7) puff(g, hx + 11, hy + 1, 5, 5, st3(Tm, '#5A8A4A'), Tm('#4A3A2A'));
  }
  mist(g, HW, HH - 74, 74, skyAt(0.92, tod), 0.0, 0.42, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// The rest of the park, back the way he came

const PW = 2000, PH = 270, PG = PH - 26;
const paintPark = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.3), lamps = tod.lamps > 0.3;
  box(g, 0, PG, PW, PH - PG, T('#6A9658')); box(g, 0, PG, PW, 2, T('#8ABE76'));
  for (let x = 0; x < PW; x += 4) box(g, x, PG + 6 + ((x / 4) % 3) * 4, 2, 1, T('#5A864A'));
  // ---- SILLYVILLE: drooping domes and Truffula tufts
  for (let i = 0; i < 6; i++) {
    const x = 16 + i * 30 + hash(i) * 8, h = 30 + hash(i * 2.7) * 34, w = 22 + hash(i * 5.1) * 10, Wl = st3(T, ['#F8C8DC', '#FCE69A', '#BEDCF6', '#C2ECCE', '#DCCCF6'][i % 5]), R = st3(T, ['#E2465E', '#7C5CC8', '#24A69C', '#F2822A'][i % 4]);
    box(g, x, PG - h, w, h, Wl[1]); box(g, x, PG - h, 2, h, Wl[2]); box(g, x + w - 4, PG - h, 4, h, Wl[0]);
    g.fillStyle = R[1]; g.beginPath(); g.moveTo(x - 3, PG - h + 1); g.quadraticCurveTo(x + w / 2, PG - h - w * 1.2, x + w * 0.9, PG - h - w * 0.8); g.quadraticCurveTo(x + w * 0.7, PG - h - w * 0.4, x + w + 3, PG - h + 1); g.closePath(); g.fill();
    disc(g, x + w * 0.9, PG - h - w * 0.8, 2.5, T('#FFFFFF'));
    for (let k = 0; k < 2; k++) box(g, x + 6 + k * 9, PG - h + 10, 4, 5, win(tod, i * 3 + k, T('#7AAEDC')));
  }
  for (let k = 0; k < 5; k++) { const tx = 30 + k * 36, th = 20 + hash(k * 9) * 12; box(g, tx, PG - th, 2, th, T(k % 2 ? '#F472B6' : '#FFF7E8')); pixelBlob(g, tx + 1, PG - th - 5, 7, 6, T(['#F472B6', '#FDE047', '#A78BFA'][k % 3])); }
  // ---- THE STUDIOS: arched soundstages and the logo on its lattice
  { const sx = 220; for (let k = 0; k < 3; k++) { const x = sx + k * 36, S = st3(T, '#D8D0C0'); block(g, x, PG - 50, 32, 50, S, T(INK)); g.fillStyle = S[1]; g.beginPath(); g.ellipse(x + 16, PG - 50, 16, 8, 0, Math.PI, 0); g.fill(); box(g, x + 6, PG - 30, 20, 2, S[0]); signText(g, String(k + 1), x + 16, PG - 36, tinyB(T('#5A5470'))); }
    const lx = sx + 10, ly = PG - 110; box(g, lx + 10, ly + 22, 2, 38, T('#5A5470')); box(g, lx + 80, ly + 22, 2, 38, T('#5A5470'));
    box(g, lx - 4, ly, 98, 22, T(INK)); box(g, lx - 3, ly + 1, 96, 20, T('#6D28D9')); box(g, lx - 3, ly + 1, 96, 2, T('#9F7AEA'));
    signText(g, 'CARTOON LAND', lx + 45, ly + 10, tiny(T('#FDE047'), T(INK))); signText(g, 'STUDIOS', lx + 45, ly + 19, tiny(T('#FFFFFF'), T(INK)));
    if (lamps) for (let k = 0; k < 9; k++) box(g, lx - 2 + k * 11, ly - 2, 2, 2, k % 2 ? '#FFF0B0' : '#FFB0E0'); }
  // ---- THE WACKY WHITE HOUSE, Socks peeking over the roof
  { const hx = 410, base = PG, Wh = st3(T, '#F4F2F8');
    box(g, hx - 56, base - 40, 112, 40, Wh[1]); box(g, hx - 56, base - 40, 112, 2, Wh[2]); box(g, hx + 44, base - 40, 12, 40, Wh[0]);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 8; k++) box(g, hx - 50 + k * 12, base - 34 + r * 16, 5, 9, win(tod, k + 200 + r * 20, T('#5A6A9A')));
    tri(g, [hx - 22, base - 40, hx, base - 54, hx + 22, base - 40], Wh[1]); for (let k = 0; k < 5; k++) box(g, hx - 18 + k * 8, base - 38, 3, 26, Wh[0]);
    oval(g, hx, base - 56, 16, 16, T(INK)); oval(g, hx, base - 56, 14, 14, Wh[1]); oval(g, hx - 5, base - 61, 4, 8, Wh[2]);
    for (const s of [-1, 1]) tri(g, [hx + 38 + s * 9, base - 46, hx + 38 + s * 8, base - 58, hx + 38 + s * 2, base - 50], T('#22202C'));
    oval(g, hx + 38, base - 46, 11, 8, T('#22202C')); for (const s of [-1, 1]) oval(g, hx + 38 + s * 4, base - 47, 2, 3, T('#9EE64A'));
    box(g, hx - 1, base - 90, 1, 20, T('#5A5470')); box(g, hx, base - 90, 12, 7, T('#E2465E')); box(g, hx, base - 90, 4, 4, T('#3A5AB0')); }
  // ---- THE BIG-KID ZONE: boxy roofs in Memphis bands, the Hurl-A-Whirl, the halfpipe, Rad Rat, the bolt
  { const zx = 500, base = PG;
    for (let i = 0; i < 6; i++) { const x = zx + i * 52, h = 30 + hash(i * 4.4) * 30, Wl = st3(T, ['#B9A4F0', '#7EE0D2', '#F8A8D0', '#FCE07A'][i % 4]), Bd = st3(T, ['#7C3AED', '#0D9488', '#DB2777', '#EA580C'][i % 4]);
      box(g, x, base - h, 48, h, Wl[1]); box(g, x, base - h, 2, h, Wl[2]); box(g, x + 44, base - h, 4, h, Wl[0]); for (let k = 0; k < 48; k += 2) box(g, x + k, base - h + 8 + Math.abs(((k / 2) % 8) - 4), 2, 4, Bd[1]); for (let k = 0; k < 3; k++) box(g, x + 6 + k * 14, base - 12, 8, 7, win(tod, i * 5 + k + 400, T('#5A7AAA'))); }
    const wx = zx + 70, wt = base - 130; for (let y = wt + 20; y < base - 30; y += 2) box(g, wx - 5, y, 10, 2, ((y >> 2) % 2) ? T('#E2465E') : T('#FFF4F8'));
    [-0.5, 0.2, 0.9, 1.6, 2.3, 3.0].forEach((a, i) => { const ex = wx + Math.cos(a) * 46, ey = wt + 36 + Math.sin(a) * 12; g.strokeStyle = T('#5A5470'); g.lineWidth = 2; g.beginPath(); g.moveTo(wx, wt + 30); g.lineTo(ex, ey); g.stroke(); oval(g, ex, ey + 4, 6, 5, T(INK)); oval(g, ex, ey + 4, 5, 4, T(['#F2D23A', '#5EC4F4', '#84CC16'][i % 3])); });
    oval(g, wx, wt + 14, 16, 16, T(INK)); oval(g, wx, wt + 14, 15, 15, T('#F8F0E8')); disc(g, wx, wt + 18, 4, T('#E2465E')); for (const s of [-1, 1]) disc(g, wx + s * 14, wt + 8, 7, T('#F28A2E'));
    const hx = zx + 180; g.fillStyle = T('#B4B0BC'); g.beginPath(); g.moveTo(hx, base - 40); g.quadraticCurveTo(hx + 10, base, hx + 40, base); g.lineTo(hx + 70, base); g.quadraticCurveTo(hx + 100, base, hx + 110, base - 40); g.lineTo(hx + 110, base); g.lineTo(hx, base); g.closePath(); g.fill(); box(g, hx - 2, base - 42, 6, 2, T('#E8E4F0')); box(g, hx + 106, base - 42, 6, 2, T('#E8E4F0'));
    const rx = zx + 268, ry = base - 66; oval(g, rx, ry, 18, 24, T(INK)); oval(g, rx, ry, 17, 23, T('#9A96A8')); oval(g, rx - 5, ry - 8, 6, 10, T('#BAB6C8')); oval(g, rx, ry - 26, 13, 12, T('#9A96A8')); for (const s of [-1, 1]) disc(g, rx + s * 11, ry - 36, 6, T('#F4A6C0')); box(g, rx - 10, ry - 28, 20, 4, T('#1F2937')); box(g, rx - 12, ry - 38, 22, 5, T('#DB2777'));
    tri(g, [zx + 300, base - 110, zx + 316, base - 110, zx + 308, base - 90, zx + 320, base - 90, zx + 298, base - 60, zx + 304, base - 84, zx + 294, base - 84], lamps ? '#FEF08A' : T('#F2D23A')); }
  // ---- PUNCHY & KICKY: the bone arch, the KILL-O-RAMA pylon, the big top, bloody roofs, a mallet driven into one
  { const px = 860, base = PG, Bl = st3(T, '#B01C22'), Bn = st3(T, '#EADFC0');
    for (let i = 0; i < 5; i++) { const x = px + i * 46, h = 34 + hash(i * 6.6) * 26, Wl = st3(T, ['#C8323A', '#E8B424', '#3A3040', '#EADFC0'][i % 4]);
      block(g, x, base - h, 42, h, Wl, T(INK)); box(g, x - 2, base - h - 3, 46, 3, Bl[1]);
      for (let k = 0; k < 4; k++) { const dx = x + hash(i * 7 + k) * 38, l = 3 + hash(i + k * 3) * 10; box(g, dx, base - h, 2, l, Bl[1]); box(g, dx, base - h, 1, l - 1, Bl[2]); }
      for (let k = 0; k < 2; k++) box(g, x + 8 + k * 16, base - 12, 8, 7, win(tod, i * 4 + k + 600, T('#5A6A8A'))); }
    // (the mallet driven into a roof)
    g.save(); g.translate(px + 66, base - 52); g.rotate(0.35); box(g, -2, -40, 4, 40, T('#C2853F')); box(g, -14, -54, 28, 16, T(INK)); box(g, -13, -53, 26, 14, T('#D9A066')); box(g, -13, -53, 26, 2, T('#EBC08E')); g.restore();
    // (the bone arch)
    const ax = px + 250; for (const s of [-1, 1]) { box(g, ax + s * 34 - 3, base - 70, 6, 70, Bn[1]); box(g, ax + s * 34 - 3, base - 70, 1, 70, Bn[2]); for (const e of [-1, 1]) disc(g, ax + s * 34 + e * 3, base - 72, 4, Bn[1]); }
    box(g, ax - 40, base - 82, 80, 10, T(INK)); box(g, ax - 39, base - 81, 78, 8, Bl[1]); signText(g, 'PUNCHY & KICKY', ax, base - 75, tiny(T('#FFF0A0')));
    // (the KILL-O-RAMA pylon)
    const kx = px + 330, top = base - 160; box(g, kx - 10, top + 30, 20, base - top - 30, T(INK)); box(g, kx - 9, top + 31, 18, base - top - 31, Bl[1]); box(g, kx - 9, top + 31, 4, base - top - 31, Bl[2]); box(g, kx + 5, top + 31, 4, base - top - 31, Bl[0]);
    for (let k = 0; k < 9; k++) signText(g, 'KILLORAMA'[k], kx, top + 42 + k * 11, tiny(T('#FFF0A0'), T(INK)));
    for (let k = 0; k < 12; k++) { box(g, kx - 11, top + 34 + k * 10, 2, 2, lamps && k % 2 ? '#FFF0B0' : T('#F2C84A')); box(g, kx + 9, top + 34 + k * 10, 2, 2, lamps && k % 2 === 0 ? '#FFF0B0' : T('#F2C84A')); }
    oval(g, kx, top + 16, 14, 12, T(INK)); oval(g, kx, top + 16, 13, 11, T('#E8902E')); for (const s of [-1, 1]) tri(g, [kx + s * 12, top + 10, kx + s * 10, top - 4, kx + s * 3, top + 5], T('#E8902E'));
    // (the big top, striped)
    const bx = px + 400, bt = base - 70; g.save(); g.beginPath(); g.moveTo(bx - 50, base - 26); g.quadraticCurveTo(bx - 30, bt + 10, bx, bt); g.quadraticCurveTo(bx + 30, bt + 10, bx + 50, base - 26); g.lineTo(bx + 50, base); g.lineTo(bx - 50, base); g.closePath(); g.clip();
    for (let k = -50; k < 50; k += 10) box(g, bx + k, bt, 5, base - bt, T('#C8283E')); for (let k = -45; k < 55; k += 10) box(g, bx + k, bt, 5, base - bt, T('#F4ECD8')); box(g, bx + 20, bt, 30, base - bt, 'rgba(20,10,30,0.18)'); g.restore();
    box(g, bx - 1, bt - 14, 2, 14, T('#5A5470')); tri(g, [bx + 1, bt - 14, bx + 11, bt - 11, bx + 1, bt - 8], T('#F2C030')); }
  // ---- the park's back lot: the maintenance sheds, the SWILL LITE truck backed up to them, a dumpster, pallets
  { const mx = 1290, base = PG, Sh = st3(T, '#A8A496');
    for (let k = 0; k < 2; k++) { const x = mx + k * 70; block(g, x, base - 34, 62, 34, Sh, T(INK)); for (let r = 0; r < 31; r += 3) box(g, x, base - 34 + r, 62, 1, Sh[0]); box(g, x + 10, base - 22, 22, 22, T('#5A5A66')); for (let r = 0; r < 22; r += 3) box(g, x + 10, base - 22 + r, 22, 1, T('#4A4A56')); }
    signText(g, 'PARK MAINT.', mx + 31, base - 38, tiny(T('#F4F1E8'), T(INK)));
    const tx = mx + 150; box(g, tx, base - 26, 46, 22, T(INK)); box(g, tx + 1, base - 25, 44, 20, T('#F4F1E8')); box(g, tx + 1, base - 25, 44, 2, T('#FFFFFF')); box(g, tx + 6, base - 21, 34, 10, T('#C8102E')); signText(g, 'SWILL LITE', tx + 23, base - 13, tiny(T('#FFFFFF')));
    box(g, tx + 46, base - 18, 14, 14, T(INK)); box(g, tx + 47, base - 17, 12, 12, T('#C8102E')); box(g, tx + 52, base - 15, 6, 5, T('#A8C8E8'));
    for (const wx of [tx + 8, tx + 34, tx + 54]) { disc(g, wx, base - 3, 4, T(INK)); disc(g, wx, base - 3, 2, T('#9AA0A8')); }
    box(g, mx + 220, base - 14, 22, 14, T('#2A6A4A')); box(g, mx + 218, base - 16, 26, 3, T('#1A4A3A')); for (let k = 0; k < 3; k++) { box(g, mx + 248 + k * 10, base - 6 - (k % 2) * 4, 9, 4, T('#B48A5A')); } }
  // ---- the main lot: light poles over rows of cars; the park's big wheel past it
  { const lx = 1560, base = PG;
    for (let r = 0; r < 3; r++) for (let k = 0; k < 14; k++) { const cx = lx + k * 13 + r * 4, cy = base - 2 - r * 5; box(g, cx, cy - 3, 9, 3, T(['#C83A3A', '#3A6AC8', '#E8E4D8', '#2A8A5A', '#5A5A6A', '#E8B424'][(k + r * 2) % 6])); box(g, cx + 2, cy - 4, 5, 1, T('#A8C8E8')); }
    for (let k = 0; k < 4; k++) { const px = lx + 10 + k * 52; box(g, px, base - 60, 2, 50, T('#5A5470')); box(g, px - 6, base - 62, 14, 4, T('#3A3450')); if (lamps) { box(g, px - 5, base - 59, 4, 2, '#FFF6D0'); box(g, px + 3, base - 59, 4, 2, '#FFF6D0'); } }
    const wx = 1860, wy = base - 110, r = 74;
    g.strokeStyle = T('#7A7494'); g.lineWidth = 2; g.beginPath(); g.arc(wx, wy, r, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.beginPath(); g.arc(wx, wy, r - 8, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a) * r, wy + Math.sin(a) * r); g.stroke(); const gx = wx + Math.cos(a) * r, gy = wy + Math.sin(a) * r; box(g, gx - 4, gy, 8, 7, T(INK)); box(g, gx - 3, gy + 1, 6, 5, T(['#E2465E', '#F2D23A', '#5EC4F4', '#84CC16'][k % 4])); if (lamps) box(g, gx - 1, gy - 1, 2, 2, '#FFF0B0'); }
    disc(g, wx, wy, 6, T('#5A5470')); for (const s of [-1, 1]) { g.strokeStyle = T('#5A5470'); g.lineWidth = 3; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + s * 40, base); g.stroke(); } }
  // ---- trees, bunting and lamps between
  for (let x = 8; x < PW; x += 22) {
    const hs = hash(x * 0.41); if (hs < 0.35) continue;
    const h = 16 + Math.floor(hash(x * 1.3) * 22), col = ['#4A8A3E', '#5A9A44', '#3E7A3A', '#8A9A3A', '#C88A3A'][Math.floor(hash(x * 2.1) * 5)];
    puff(g, x, PG, h, 6 + hash(x) * 3, st3(T, col), T('#5A4A3A'));
  }
  for (let k = 0; k < 11; k++) { const x0 = 40 + k * 180, x1 = x0 + 80, y = PG - 52 - hash(k) * 24; for (let t = 0; t <= 1; t += 0.06) { const xx = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * 10; box(g, xx, yy, 1, 1, T('#5A4A6A')); if (Math.round(t / 0.06) % 2) tri(g, [xx - 2, yy, xx + 2, yy, xx, yy + 4], T(['#C8283E', '#F2D23A', '#2A5AB0', '#F4ECD8'][Math.round(t / 0.12) % 4])); } }
  if (lamps) for (let x = 40; x < PW; x += 90) { box(g, x, PG - 26, 1, 26, T('#3A3450')); box(g, x - 1, PG - 29, 3, 3, '#FFE0A0'); }
  hazeBands(g, 0, PG - 90, PW, 90, skyAt(0.9, tod), 0.0, 0.18, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// The grove along the park's back fence, nearest: maples and oaks, the privacy slats, utility poles, the quonset

const GW = 1800, GH = 250, GG = GH - 40;
const paintGrove = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.12), lamps = tod.lamps > 0.3;
  // (the ground, banded down to the bottom)
  const Gd = ['#5E8A4A', '#527E42', '#46703A', '#3C6232'].map(T);
  for (let i = 0; i < Gd.length; i++) { box(g, 0, GG + i * 10, GW, GH - GG - i * 10, Gd[i]); if (i) checker(g, 0, GG + i * 10 - 2, GW, 2, Gd[i], i % 2, 2); }
  // (a back row of big trees, then a nearer row: stepped crowns, some going yellow)
  const crowns = ['#3E6A34', '#4A7A3A', '#5A8A40', '#6A8A3A', '#8A8A3A', '#B0843A'];
  for (const [row, step, base, sc] of [[0, 46, GG - 6, 1.25], [1, 62, GG + 4, 1]] as const) {
    for (let x = (row ? 20 : 0); x < GW + 40; x += step) {
      const s = hash(x * 0.73 + row * 9), h = (40 + s * 46) * sc, r = (20 + hash(x * 1.7 + row) * 16) * sc, col = crowns[Math.floor(hash(x * 2.9 + row * 3) * (row ? 6 : 4))], R = [T(mix(col, INK, 0.34)), T(col), T(mix(col, '#FFFFFF', 0.28)), T(mix(col, '#FFF0B0', 0.42))];
      if (row === 1 && hash(x * 4.1) < 0.18) continue;
      box(g, x - 2, base - h, 5, h, T('#4A3626')); box(g, x - 2, base - h, 1, h, T('#6A5038'));
      g.strokeStyle = T('#4A3626'); g.lineWidth = 2; g.beginPath(); g.moveTo(x, base - h * 0.6); g.lineTo(x - r * 0.5, base - h - r * 0.1); g.moveTo(x, base - h * 0.7); g.lineTo(x + r * 0.5, base - h - r * 0.2); g.stroke();
      for (let p = 0; p < 5; p++) { const a = (p / 5) * Math.PI * 2 + s, cx = x + Math.cos(a) * r * 0.55, cy = base - h - r * 0.3 + Math.sin(a) * r * 0.35; pixelBlob(g, cx + 2, cy + 2, r * 0.55, r * 0.45, R[0]); }
      for (let p = 0; p < 5; p++) { const a = (p / 5) * Math.PI * 2 + s, cx = x + Math.cos(a) * r * 0.5, cy = base - h - r * 0.35 + Math.sin(a) * r * 0.3; pixelBlob(g, cx, cy, r * 0.5, r * 0.4, R[1]); }
      pixelBlob(g, x - r * 0.25, base - h - r * 0.6, r * 0.42, r * 0.3, R[2]); pixelBlob(g, x - r * 0.35, base - h - r * 0.72, r * 0.18, r * 0.12, R[3]);
      for (let k = 0; k < 6; k++) box(g, x - r * 0.6 + hash(x + k) * r * 1.1, base - h - r * 0.1 + hash(x * 2 + k) * r * 0.4, 2, 2, R[0]);
    }
  }
  // (the maintenance quonset and a chiller box poking up between)
  { const qx = 720, Q = st3(T, '#A8AAB0'); g.fillStyle = T(INK); g.beginPath(); g.ellipse(qx, GG - 2, 62, 42, 0, Math.PI, 0); g.fill(); for (let k = 0; k < 3; k++) { g.fillStyle = Q[2 - k]; g.beginPath(); g.ellipse(qx + k * 6, GG - 2, 60 - k * 18, 40 - k * 6, 0, Math.PI, 0); g.fill(); }
    for (let k = -54; k < 60; k += 9) box(g, qx + k, GG - 2 - Math.sqrt(Math.max(0, 1 - (k / 60) ** 2)) * 40, 1, Math.sqrt(Math.max(0, 1 - (k / 60) ** 2)) * 40, Q[0]);
    box(g, qx - 14, GG - 24, 28, 22, T('#4A4A56')); for (let r = 0; r < 22; r += 3) box(g, qx - 14, GG - 24 + r, 28, 1, T('#3A3A46')); signText(g, 'COSTUMES', qx, GG - 30, tiny(T('#F4F1E8'), T(INK))); }
  { const cx = 1380; block(g, cx, GG - 30, 44, 30, st3(T, '#9AA4AE'), T(INK)); for (let k = 0; k < 2; k++) { disc(g, cx + 11 + k * 22, GG - 30, 8, T('#3A3E46')); disc(g, cx + 11 + k * 22, GG - 30, 6, T('#5A6068')); box(g, cx + 6 + k * 22, GG - 31, 10, 1, T('#8A9098')); } }
  // (utility poles along the back, the wires sagging between, a transformer can)
  const poles: [number, number][] = [];
  for (let x = 60; x < GW; x += 240) { const top = GG - 120; poles.push([x, top]); box(g, x - 2, top, 4, GG - top, T('#5A4232')); box(g, x - 2, top, 1, GG - top, T('#7A5E46')); box(g, x - 16, top + 6, 32, 3, T('#5A4232')); for (const s of [-12, 0, 12]) box(g, x + s - 1, top + 3, 3, 3, T('#C8CCD4')); if ((x / 240) % 2 < 1) { box(g, x + 3, top + 18, 8, 12, T('#6A7078')); box(g, x + 3, top + 18, 2, 12, T('#8A9098')); } }
  g.strokeStyle = T('#2A2430'); g.lineWidth = 1;
  for (const s of [-12, 0, 12]) for (const ox of [0, -GW]) {
    g.beginPath();
    for (let i = 0; i < poles.length; i++) { const [x, top] = poles[i], x2 = i + 1 < poles.length ? poles[i + 1][0] : poles[0][0] + GW; g.moveTo(x + s + ox, top + 4); g.quadraticCurveTo((x + x2) / 2 + s + ox, top + 18, x2 + s + ox, top + 4); }
    g.stroke();
  }
  // (the park's back fence: green chain-link with privacy slats, a CAST ONLY gate, bushes along its foot)
  const F = st3(T, '#2E6A4A');
  box(g, 0, GG - 26, GW, 26, F[1]); for (let x = 0; x < GW; x += 3) box(g, x, GG - 26, 1, 26, F[0]); box(g, 0, GG - 27, GW, 2, T('#9AA2AE'));
  for (let x = 0; x < GW; x += 60) { box(g, x, GG - 30, 3, 30, T('#8A929E')); box(g, x, GG - 30, 1, 30, T('#C2CAD4')); }
  { const gx = 1080; box(g, gx, GG - 26, 40, 26, F[0]); box(g, gx + 19, GG - 26, 2, 26, T('#8A929E')); box(g, gx + 6, GG - 20, 28, 9, T('#F4F1E8')); signText(g, 'CAST ONLY', gx + 20, GG - 14, tiny(T('#B91C1C'))); }
  for (let x = 6; x < GW; x += 14) { const r = 5 + hash(x * 1.9) * 5; pixelBlob(g, x, GG - 2, r, r * 0.7, T('#2E5A2A')); pixelBlob(g, x - 1, GG - 4, r * 0.6, r * 0.4, T('#467A3A')); }
  if (lamps) for (let x = 120; x < GW; x += 300) { box(g, x, GG - 70, 2, 44, T('#3A3450')); box(g, x - 4, GG - 72, 10, 3, T('#3A3450')); box(g, x - 3, GG - 70, 8, 2, '#FFE8B0'); }
  hazeBands(g, 0, GG - 140, GW, 140, skyAt(0.9, tod), 0.0, 0.12, 4);
};

// ---------------------------------------------------------------------------------------------------------------

/** Stamped ahead, a layer a frame, from the other side of the gate (itchy/index.ts, near its way on): through it is a
 *  teleport, and every layer was painted live and then stamped on its first two frames in (two long frames). Onto a
 *  scratch canvas at the backdrop's own transform (`c`'s, its drawing state), so they're the very stamps drawAmphiFar
 *  asks for; a pixel of each put down on `c` before its own backdrop's painted over it (so the GPU draws it in now). */
let scratch: Ctx | null = null, primed = '', primeStep = 0;
export const primeAmphiFar = (c: Ctx) => {
  const tod = timeOfDay(), m = c.getTransform(), key = `${tod.key}-${fk()}-${m.a},${m.d}`;
  if (primed !== key) { primed = key; primeStep = 0; }
  const layers: [string, number, number, (g: Ctx) => void][] = [
    ['clouds', CW, CH, g => paintClouds(g, tod)], ['country', HW, HH, g => paintCountry(g, tod)], ['park', PW, PH, g => paintPark(g, tod)],
    ['grove', GW, GH, g => paintGrove(g, tod)], ['blimp', 330, 64, g => paintBlimp(g, tod)],
  ];
  if (primeStep >= layers.length || typeof document === 'undefined') return;
  if (!scratch) { const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; scratch = cv.getContext('2d')!; }
  const [k, w, h, paint] = layers[primeStep++], g = scratch;
  Object.assign(g, { lineCap: c.lineCap, lineJoin: c.lineJoin, miterLimit: c.miterLimit, lineWidth: c.lineWidth, font: c.font, textAlign: c.textAlign, textBaseline: c.textBaseline, globalAlpha: 1 });
  g.imageSmoothingEnabled = c.imageSmoothingEnabled;
  g.setTransform(m.a, 0, 0, m.d, 0, 0);
  const cv = prestamp(g, `ct-amf-${k}-${tod.key}-${fk()}`, 0, 0, w, h, paint);
  if (cv) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(cv, 0, 0, 1, 1, 0, 0, 1, 1); c.restore(); }
};

export const drawAmphiFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), hz = horizonY(state), cx = state.camera.x, f = state.frame;
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: hz, sun: [610, 120], moon: [170, 90], t: f, scroll: cx * 0.01 });
  tile(c, 'clouds', cx * 0.015 + f * 0.04, hz - 430, CH, CW, g => paintClouds(g, tod));
  drawBlimp(c, state);
  // (the land rises behind the bowl: the country and the rest of the park stand up high enough to show over the grove
  //  and the bowl's rim; the park laid from the section's start, everywhere he's been, back the way he came: the
  //  studios, the White House, the big-kid zone, PUNCHY & KICKY)
  const up = LIFT, sx = cx - SECTIONS.amphi.x0;
  tile(c, 'country', sx * 0.03, hz - HH + 12 - up, HH, HW, g => paintCountry(g, tod));
  tile(c, 'park', sx * 0.07 + 350, hz - PH + 26 - up, PH, PW, g => paintPark(g, tod));
  box(c, 0, hz + 25 - up, W, H, farCol(tod, 0.3)('#6A9658'));
  // (the water tower on its hill over the park: the landmark, kept clear)
  const m = MONUMENT_AT.amphi;
  if (m) drawMonument(c, state, m, hz + 6 - up);
  const gy = hz + 40 - GG;
  tile(c, 'grove', cx * 0.2, gy, GH, GW, g => paintGrove(g, tod));
  box(c, 0, gy + GH - 1, W, H, farCol(tod, 0.12)('#3C6232'));
};
