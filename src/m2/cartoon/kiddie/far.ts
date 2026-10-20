// Sillyville Square's far off (screen space: the backdrop), every layer painted once for the hour into a tile and slid
// along (only the chimney smoke, the escaped balloons and the water tower's propeller live):
//
//   the sky by the hour (a candy blue down to a pink blush, banded, dithered between), Seuss cumulus (stepped puffs with
//   curlicue tails) and long streamers drifting; far off, rolling hills patchworked with striped fields (curving
//   furrows, hedgerows between, lollipop trees along the crests, a winding road, little curly-roofed farms, spiral paths
//   up the round knolls); THE CARTOON LAND WATER TOWER on its hill (monument.ts: the smallest it ever is); then THE REST
//   OF CARTOON LAND beyond the square: the STUDIOS' soundstages (their numbers, the logo on its lattice up top), the
//   WACKY WHITE HOUSE billboard (Socks, the White House, SATURDAY MORNINGS), PUNCHY & KICKY's KILL-O-RAMA pylon (the cat
//   and the mouse with their mallets up), THE BIG-KID ZONE's tops (the neon bolt, the Hurl-A-Whirl's clown head and its
//   barf buckets, the halfpipe and its giant board, Detective Drake's pod, chain-link), STUPID DAD LIVE!'s band shell
//   and light towers over the bowl, the STUPID DAD billboard, a gift shop's striped dome; trees, flags and bunting
//   between, lit up after dark; and nearest, Sillyville's own roofs past the square (drooping onion domes, floppy cones,
//   stacked balls, cake-tier towers, corkscrew spires, a toadstool house, Truffula tufts, curly chimneys smoking).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { pixelBlob, hazeBands } from '../../../m1/game/render/pixelArt';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { snap2, wave, mist } from '../../adventure/farArt';
import { signText, type Look } from '../../signLetters';
import { box, mix, hash, checker, stamp, INK, type Ctx } from '../kit';
import { MONUMENT_AT, drawMonument } from '../monument';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Where the horizon sits on screen (it drifts down as the camera climbs onto the roofs and the towers' lids). */
export const horizonY = (state: GameState) => Math.round(440 + Math.max(-20, Math.min(70, (50 - state.camera.y) * 0.1)));

/** The square's own sky, top to horizon: a candy blue down to a pink blush. */
const SKY = ['#3C98E8', '#58AEF0', '#82C4F4', '#B0DAF6', '#EAD6F2', '#FFC4DC'];

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  const tod = timeOfDay(), k = `ct-ki-${key}-${tod.key}-${fontReady() ? 'f' : 'n'}`;
  for (let x = -(((off % tw) + tw) % tw); x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, k, 0, 0, tw, h, paint); c.restore(); }
};
/** A far layer's color for the hour: toward dusk and night, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A7A', 0.2), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);
/** A window: lit warm after dark (most of them), else the glass. */
const win = (tod: TimeOfDay, i: number, glass: string) => (tod.lamps > 0.3 ? (hash(i * 1.7) > 0.25 ? (hash(i * 3.1) > 0.5 ? '#FFE08A' : '#F6B860') : glass) : glass);
const tiny = (fill: string | string[], ink?: string): Look => ({ sx: 1, sy: 1, bold: false, fill, ink, gap: 1 });

// ---------------------------------------------------------------------------------------------------------------
// Clouds: Seuss cumulus (stepped puffs, a curlicue tail) and long streamers with curled ends

const CW = 1020, CH = 170;
const curl = (g: Ctx, x: number, y: number, r: number, dir: number, col: string, hi: string) => {
  // (a spiral of pixels winding in)
  for (let a = 0; a < Math.PI * 3.2; a += 0.18) {
    const rr = r * (1 - a / (Math.PI * 3.6)), px = x + Math.cos(a * dir) * rr, py = y + Math.sin(a * dir) * rr * 0.8;
    box(g, px - 1, py - 1, 3, 3, col); if (a < 2) box(g, px - 1, py - 2, 2, 1, hi);
  }
};
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#9AA8D4', '#C2CAEA', '#E6E8F8', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (let i = 0; i < 8; i++) {
    const cx = (i * CW) / 8 + hash(i * 3.3) * 50, cy = 46 + hash(i * 5.1) * 80, s = 0.6 + hash(i * 7.7) * 0.75;
    const puffs = 3 + Math.floor(hash(i) * 4);
    for (const [L, dy, k] of [[0, 3, 1], [1, 0, 0.92], [2, -3, 0.74], [3, -6, 0.44]] as const) {
      for (let p = 0; p < puffs; p++) {
        const px = cx + (p - puffs / 2) * 17 * s, py = cy - Math.sin((p / Math.max(1, puffs - 1)) * Math.PI) * 16 * s + dy * s;
        const r = (12 + hash(i * 11 + p) * 10) * s * k;
        for (const ox of [0, CW, -CW]) pixelBlob(g, px + ox - (L === 3 ? 4 : 0), py, r * 1.25, r * 0.85, C[L]);
      }
    }
    for (const ox of [0, CW, -CW]) {
      box(g, cx + ox - puffs * 8.5 * s, cy + 11 * s, puffs * 17 * s, 3, C[0]); checker(g, cx + ox - puffs * 8.5 * s, cy + 9 * s, puffs * 17 * s, 2, C[0], 0, 2);
      // (the Seuss curlicue off one end)
      if (i % 2 === 0) curl(g, cx + ox + puffs * 9 * s + 8, cy - 2 * s, 9 * s, i % 4 ? 1 : -1, C[2], C[3]);
    }
  }
  // (streamers: long thin wisps, a curl at each end)
  for (let i = 0; i < 4; i++) {
    const x0 = hash(i * 9.1) * CW, y0 = 18 + hash(i * 4.4) * 120, len = 110 + hash(i * 2.2) * 120;
    for (const ox of [0, CW, -CW]) {
      for (let x = 0; x < len; x += 2) { const y = y0 + Math.sin(x * 0.04 + i) * 3; box(g, x0 + ox + x, y, 2, 3, C[2]); box(g, x0 + ox + x, y, 2, 1, C[3]); box(g, x0 + ox + x, y + 3, 2, 1, C[1]); }
      curl(g, x0 + ox + len + 4, y0 - 2, 6, 1, C[2], C[3]);
      curl(g, x0 + ox - 4, y0 + 1, 5, -1, C[2], C[3]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The far hills: the back row hazy, the front row a patchwork of striped fields

const HW = 1280, HH = 170;
const backRidge = (x: number) => snap2(HH - 84 + wave(x, HW, 1.3) * 26 + wave(x, HW, 4.1, 2) * 6);
const frontRidge = (x: number) => snap2(HH - 48 + wave(x, HW, 2.7) * 20 - Math.abs(wave(x, HW, 0.4, 3)) * 6);
const FIELDS = [['#7CC864', '#6AB65A'], ['#B4DC6E', '#A0CC60'], ['#E8E07A', '#D6CC66'], ['#9AD482', '#86C474'], ['#D8C0E8', '#C6ACDA']];
const paintHills = (g: Ctx, tod: TimeOfDay) => {
  const Tb = farCol(tod, 0.58), Tf = farCol(tod, 0.36);
  // (the back row: round hazy hills, lit on the faces turned up left; three knolls with a path spiralling up them)
  const BR = ['#7A94AE', '#90AABA', '#A6C2C4', '#C2D8CE'].map(Tb);
  for (let x = 0; x < HW; x += 2) {
    const y = backRidge(x), s = backRidge(x + 4) - backRidge(x - 4), lt = s < 0;
    box(g, x, y, 2, HH - y, BR[lt ? 2 : 1]);
    if (lt) box(g, x, y, 2, 2, BR[3]); else checker(g, x, y + 2, 2, 4, BR[0], 0, 1);
  }
  for (const kx of [190, 610, 1010]) {
    const kr = 34 + hash(kx) * 14, ky = backRidge(kx) + 6;
    for (let x = -kr; x < kr; x += 2) { const top = snap2(ky - Math.sqrt(1 - (x / kr) ** 2) * kr * 0.9); box(g, kx + x, top, 2, HH - top, BR[x < -kr * 0.2 ? 2 : 1]); if (x < 0) box(g, kx + x, top, 2, 2, BR[3]); }
    for (let a = 0; a < Math.PI * 5; a += 0.12) { const u = a / (Math.PI * 5), r = kr * (1 - u) * 0.95, px = kx + Math.cos(a) * r, py = ky - u * kr * 0.85 + Math.sin(a) * r * 0.18; if (Math.sin(a) > -0.2) box(g, px, py, 2, 1, Tb('#F2E8D8')); }
    box(g, kx - 1, ky - kr * 0.9 - 8, 2, 8, Tb('#5A4A6A')); box(g, kx + 1, ky - kr * 0.9 - 8, 6, 4, Tb('#F472B6'));
  }
  // (the front row: the fields in curving furrows, hedgerows where they change, the crest lit)
  const F = FIELDS.map(([a, b]) => [Tf(a), Tf(b)]), hedge = Tf('#3E7A48'), road = Tf('#F4E6C8'), roadS = Tf('#C8B48E');
  for (let x = 0; x < HW; x += 2) {
    const y0 = frontRidge(x);
    let last = -1;
    for (let y = y0; y < HH; y += 2) {
      const band = Math.floor((x * 0.45 + (y - y0) * 2.4 + Math.sin(x * 0.011) * 40 + 2000) / 18), fi = Math.floor(band / 4) % FIELDS.length;
      const f = F[((Math.floor(fi + Math.floor(x / 160)) % F.length) + F.length) % F.length];
      box(g, x, y, 2, 2, (band + (y >> 1)) % 4 === 0 ? f[1] : f[0]);
      if (last >= 0 && fi !== last) box(g, x, y, 2, 2, hedge);
      last = fi;
    }
    const s = frontRidge(x + 4) - frontRidge(x - 4);
    box(g, x, y0, 2, 2, s < 0 ? Tf('#D4F0A8') : Tf('#5E9E5A'));
  }
  // (the winding road across them)
  for (let x = 0; x < HW; x += 2) { const y = snap2(HH - 22 + Math.sin(x * 0.012) * 10 + Math.sin(x * 0.031) * 4); box(g, x, y, 2, 3, road); box(g, x, y + 3, 2, 1, roadS); }
  // (lollipop trees and Truffula tufts along the crest; little curly-roofed farms on the fields)
  for (let x = 6; x < HW; x += 13) {
    if (hash(x * 0.71) < 0.45) continue;
    const y = frontRidge(x), h = 7 + Math.floor(hash(x) * 8), col = Tf(['#F472B6', '#FDE047', '#FB923C', '#C084FC', '#5EEAD4'][Math.floor(hash(x * 2.3) * 5)]);
    box(g, x, y - h, 1, h + 1, Tf('#5A3A4A'));
    g.fillStyle = col; g.beginPath(); g.arc(x, y - h - 3, 4, 0, Math.PI * 2); g.fill();
    box(g, x - 2, y - h - 6, 2, 2, Tf(mix(col, '#FFFFFF', 0.5)));
  }
  for (let i = 0; i < 9; i++) {
    const fx = 60 + i * 140 + hash(i * 6.1) * 60, fy = frontRidge(fx) + 14 + hash(i) * 14, wall = Tf(['#F8E8D8', '#FBD4E4', '#DDEBF8'][i % 3]), roof = Tf(['#E2465E', '#7C5CC8', '#2AA6A0'][i % 3]);
    box(g, fx - 5, fy - 6, 10, 7, wall); box(g, fx + 2, fy - 6, 3, 7, Tf(mix(wall, INK, 0.2)));
    g.fillStyle = roof; g.beginPath(); g.moveTo(fx - 7, fy - 6); g.quadraticCurveTo(fx, fy - 18, fx + (i % 2 ? 8 : -8), fy - 16); g.quadraticCurveTo(fx + 2, fy - 12, fx + 7, fy - 6); g.closePath(); g.fill();
    box(g, fx - 2, fy - 3, 2, 3, win(tod, i * 5, Tf('#5A6A8A')));
  }
  mist(g, HW, HH - 60, 60, skyAt(0.92, tod), 0.05, 0.55, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// The rest of Cartoon Land, beyond the square

const PW = 2000, PH = 250, PG = PH - 26;
/** A billboard on its scaffold: the board (w x h, its top left at x, y), the legs down to the ground, the catwalk and
 *  its lamps; `paint` its face. */
const billboard = (g: Ctx, T: (c: string) => string, tod: TimeOfDay, x: number, y: number, w: number, h: number, paint: () => void) => {
  const S = T('#5A5470'), S2 = T('#7A7494');
  for (const lx of [x + w * 0.2, x + w * 0.8]) { box(g, lx - 2, y + h, 4, PG - y - h, S); box(g, lx - 2, y + h, 1, PG - y - h, S2); for (let yy = y + h + 6; yy < PG - 4; yy += 12) { g.strokeStyle = S; g.lineWidth = 1; g.beginPath(); g.moveTo(lx - 2, yy); g.lineTo(lx + 2, yy + 12); g.stroke(); } }
  box(g, x - 2, y - 2, w + 4, h + 4, T(INK));
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); paint(); g.restore();
  box(g, x - 4, y + h + 2, w + 8, 2, S); box(g, x - 4, y + h + 2, w + 8, 1, S2);
  for (let k = 0; k < 4; k++) { const lx = x + 8 + k * ((w - 16) / 3); box(g, lx - 1, y + h + 2, 2, 5, S); box(g, lx - 3, y + h - 1, 6, 3, T('#2A2638')); if (tod.lamps > 0.3) { g.fillStyle = 'rgba(255,240,200,0.18)'; g.beginPath(); g.moveTo(lx - 3, y + h - 1); g.lineTo(lx - 22, y + 4); g.lineTo(lx + 22, y + 4); g.lineTo(lx + 3, y + h - 1); g.closePath(); g.fill(); } }
};
/** A cartoon cat's head (Socks: black, a white muzzle, green eyes), its middle at (x, y), r across. */
const catHead = (g: Ctx, T: (c: string) => string, x: number, y: number, r: number, fur = '#22202C', eye = '#9EE64A') => {
  g.fillStyle = T(INK);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * r * 0.9, y - r * 0.2); g.lineTo(x + s * r * 0.8, y - r * 1.3); g.lineTo(x + s * r * 0.2, y - r * 0.8); g.closePath(); g.fill(); }
  g.beginPath(); g.ellipse(x, y, r + 1, r * 0.86 + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = T(fur); g.beginPath(); g.ellipse(x, y, r, r * 0.86, 0, 0, Math.PI * 2); g.fill();
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * r * 0.8, y - r * 0.3); g.lineTo(x + s * r * 0.74, y - r * 1.16); g.lineTo(x + s * r * 0.3, y - r * 0.74); g.closePath(); g.fill(); }
  g.fillStyle = T('#F4F0F4'); g.beginPath(); g.ellipse(x, y + r * 0.38, r * 0.56, r * 0.4, 0, 0, Math.PI * 2); g.fill();
  for (const s of [-1, 1]) { g.fillStyle = T(eye); g.beginPath(); g.ellipse(x + s * r * 0.36, y - r * 0.12, r * 0.2, r * 0.24, 0, 0, Math.PI * 2); g.fill(); box(g, x + s * r * 0.36 - 1, y - r * 0.3, 2, r * 0.36, T(INK)); }
  box(g, x - 2, y + r * 0.16, 4, 3, T('#F472B6'));
};
const paintPark = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.3), lamps = tod.lamps > 0.3;
  // (the lawn the park stands on, hedges along it)
  box(g, 0, PG, PW, PH - PG, T('#5A9E58')); box(g, 0, PG, PW, 2, T('#86C47A'));
  for (let x = 0; x < PW; x += 4) box(g, x, PG + 6 + ((x / 4) % 3) * 4, 2, 1, T('#4A8A4A'));
  // ---- THE STUDIOS: three soundstages with arched gable ends, their numbers, elephant doors; the logo up top
  for (let i = 0; i < 3; i++) {
    const sx = 30 + i * 100, sw = 92, sh = 72 + (i === 1 ? 20 : 0), top = PG - sh, wall = T(['#B4AACC', '#C2B8D8', '#A89EC2'][i]), shade = T(mix(['#B4AACC', '#C2B8D8', '#A89EC2'][i], INK, 0.25));
    g.fillStyle = T(INK); g.beginPath(); g.moveTo(sx - 1, PG); g.lineTo(sx - 1, top); g.quadraticCurveTo(sx + sw / 2, top - 40, sx + sw + 1, top); g.lineTo(sx + sw + 1, PG); g.closePath(); g.fill();
    g.fillStyle = wall; g.beginPath(); g.moveTo(sx, PG); g.lineTo(sx, top); g.quadraticCurveTo(sx + sw / 2, top - 38, sx + sw, top); g.lineTo(sx + sw, PG); g.closePath(); g.fill();
    box(g, sx + sw - 10, top, 10, sh, shade); box(g, sx, top, 3, sh, T(mix(['#B4AACC', '#C2B8D8', '#A89EC2'][i], '#FFFFFF', 0.3)));
    for (let k = sx + 12; k < sx + sw - 8; k += 16) box(g, k, top - 6, 1, sh + 6, shade);
    signText(g, String(i + 1), sx + sw / 2, top + 22, { sx: 2, sy: 2, bold: true, fill: T('#F8F0FA'), ink: T(INK) });
    box(g, sx + 24, PG - 38, sw - 48, 38, T('#6A6088'));
    for (let k = 0; k < 6; k++) box(g, sx + 24, PG - 36 + k * 6, sw - 48, 1, T('#8A80A8'));
    box(g, sx + 6, PG - 20, 8, 12, win(tod, i, T('#5A6A8A'))); box(g, sx + sw - 16, PG - 20, 8, 12, win(tod, i + 9, T('#5A6A8A')));
  }
  // (the logo on its lattice over the middle stage)
  { const lx = 110, ly = PG - 92 - 52; box(g, lx, ly + 22, 2, 24, T('#5A5470')); box(g, lx + 120, ly + 22, 2, 24, T('#5A5470')); for (let k = 0; k < 6; k++) { g.strokeStyle = T('#6A6488'); g.lineWidth = 1; g.beginPath(); g.moveTo(lx + k * 24, ly + 46); g.lineTo(lx + k * 24 + 12, ly + 22); g.stroke(); }
    box(g, lx - 6, ly, 134, 22, T(INK)); box(g, lx - 5, ly + 1, 132, 20, T('#6D28D9')); box(g, lx - 5, ly + 1, 132, 2, T('#9F7AEA'));
    signText(g, 'CARTOON LAND', lx + 61, ly + 10, tiny(T('#FDE047'), T(INK))); signText(g, 'STUDIOS', lx + 61, ly + 19, tiny(T('#FFFFFF'), T(INK)));
    if (lamps) for (let k = 0; k < 12; k++) box(g, lx - 4 + k * 11, ly - 2, 2, 2, k % 2 ? '#FFF0B0' : '#FFB0E0'); }
  // (the reel on the gable end of the last stage)
  { const rx = 300, ry = PG - 60; g.fillStyle = T('#E2E0EE'); g.beginPath(); g.arc(rx, ry, 14, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#6A6088'); for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; g.beginPath(); g.arc(rx + Math.cos(a) * 8, ry + Math.sin(a) * 8, 3.5, 0, Math.PI * 2); g.fill(); } }
  // ---- THE WACKY WHITE HOUSE billboard
  billboard(g, T, tod, 400, PG - 150, 200, 80, () => {
    for (let k = 0; k < 4; k++) box(g, 400, PG - 150 + k * 20, 200, 20, T(['#5EB4F4', '#7CC4F6', '#9AD2F8', '#B8E0FA'][k]));
    // (the White House, cartoon: the portico, columns, the flag)
    const hx = 520, hy = PG - 96;
    box(g, hx - 34, hy, 68, 24, T('#F4F2F8')); box(g, hx - 34, hy, 68, 2, T('#FFFFFF')); box(g, hx + 26, hy, 8, 24, T('#D4D0E2'));
    g.fillStyle = T('#F4F2F8'); g.beginPath(); g.moveTo(hx - 16, hy); g.lineTo(hx, hy - 10); g.lineTo(hx + 16, hy); g.closePath(); g.fill();
    for (let k = 0; k < 5; k++) box(g, hx - 12 + k * 6, hy + 2, 2, 20, T('#C8C4D8'));
    for (let k = 0; k < 6; k++) box(g, hx - 30 + (k % 3) * 8 + (k > 2 ? 44 : 0), hy + 6, 4, 6, T('#5A6A9A'));
    box(g, hx - 1, hy - 22, 1, 12, T('#5A5470')); box(g, hx, hy - 22, 8, 5, T('#E2465E')); box(g, hx, hy - 22, 3, 3, T('#3A5AB0'));
    box(g, 400, PG - 72, 200, 2, T('#6AC46A'));
    catHead(g, T, 428, PG - 108, 18);
    signText(g, "CHELSEA & SOCKS'", 500, PG - 138, tiny(T('#FFFFFF'), T(INK)));
    signText(g, 'WACKY WHITE HOUSE', 500, PG - 129, tiny(T('#FDE047'), T(INK)));
    signText(g, 'SATURDAY MORNINGS!', 562, PG - 77, tiny(T('#FFFFFF'), T('#1E3A8A')));
  });
  // ---- PUNCHY & KICKY: the KILL-O-RAMA pylon, the cat and the mouse up top with their mallets
  { const kx = 680, top = PG - 170;
    box(g, kx - 12, top + 40, 24, PG - top - 40, T(INK)); box(g, kx - 11, top + 41, 22, PG - top - 41, T('#C8283E')); box(g, kx - 11, top + 41, 5, PG - top - 41, T('#E8586A')); box(g, kx + 6, top + 41, 5, PG - top - 41, T('#8E1A2A'));
    for (let k = 0; k < 9; k++) { const ch = 'KILLORAMA'[k]; signText(g, ch, kx, top + 52 + k * 12, tiny(T('#FFF0A0'), T(INK))); }
    for (let k = 0; k < 14; k++) { box(g, kx - 13, top + 44 + k * 10, 2, 2, lamps && k % 2 ? '#FFF0B0' : T('#F2C84A')); box(g, kx + 11, top + 44 + k * 10, 2, 2, lamps && k % 2 === 0 ? '#FFF0B0' : T('#F2C84A')); }
    box(g, kx - 30, top + 32, 60, 10, T(INK)); box(g, kx - 29, top + 33, 58, 8, T('#F2C84A'));
    catHead(g, T, kx - 16, top + 18, 12, '#7A86A4', '#FDE047');
    // (the mouse: a round gray head, huge round ears)
    for (const s of [-1, 1]) { g.fillStyle = T(INK); g.beginPath(); g.arc(kx + 18 + s * 10, top + 6, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#B8B0C8'); g.beginPath(); g.arc(kx + 18 + s * 10, top + 6, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#F4A6C0'); g.beginPath(); g.arc(kx + 18 + s * 10, top + 6, 4, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = T(INK); g.beginPath(); g.arc(kx + 18, top + 18, 11, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#B8B0C8'); g.beginPath(); g.arc(kx + 18, top + 18, 10, 0, Math.PI * 2); g.fill();
    box(g, kx + 14, top + 14, 2, 3, T(INK)); box(g, kx + 20, top + 14, 2, 3, T(INK)); box(g, kx + 16, top + 22, 4, 2, T('#E2465E'));
    // (the mallets up, crossed over them)
    for (const [mx, a] of [[kx - 30, -0.5], [kx + 32, 0.5]] as const) { g.save(); g.translate(mx, top + 20); g.rotate(a); box(g, -1, -26, 3, 26, T('#8A5A30')); box(g, -8, -36, 17, 11, T(INK)); box(g, -7, -35, 15, 9, T('#C89A5A')); box(g, -7, -35, 15, 2, T('#E8C48A')); g.restore(); }
  }
  // ---- THE BIG-KID ZONE: chain-link, the neon bolt, the Hurl-A-Whirl, the halfpipe, Drake's pod
  { const z0 = 760, z1 = 1170;
    for (let x = z0; x < z1; x += 2) for (let y = PG - 34; y < PG; y += 2) if (((x >> 1) + (y >> 1)) % 3 === 0) box(g, x, y, 1, 1, T('#8A8AA0'));
    for (let x = z0; x < z1; x += 40) { box(g, x, PG - 36, 2, 36, T('#6A6A80')); box(g, x - 1, PG - 37, 4, 2, T('#9A9AB0')); }
    box(g, z0, PG - 36, z1 - z0, 1, T('#9A9AB0'));
    // (the bolt on its hazard-striped pole: BIG-KID ZONE, neon after dark)
    const bx = 790;
    for (let y = PG - 120; y < PG; y += 8) { box(g, bx - 2, y, 5, 4, T('#F2D23A')); box(g, bx - 2, y + 4, 5, 4, T('#2A2638')); }
    const bolt: [number, number][] = [[bx - 26, PG - 186], [bx + 30, PG - 186], [bx + 8, PG - 156], [bx + 36, PG - 156], [bx - 14, PG - 112], [bx + 2, PG - 146], [bx - 30, PG - 146]];
    g.fillStyle = T(INK); g.beginPath(); bolt.forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.lineWidth = 3; g.strokeStyle = T(INK); g.stroke();
    g.fillStyle = T('#B6F23A'); g.fill();
    signText(g, 'BIG-KID', bx + 2, PG - 168, { sx: 1, sy: 1, bold: true, slant: 1, fill: T('#2A1A4A') }); signText(g, 'ZONE', bx + 4, PG - 158, { sx: 1, sy: 1, bold: true, slant: 1, fill: T('#C8283E') });
    if (lamps) { g.strokeStyle = 'rgba(190,255,90,0.55)'; g.lineWidth = 2; g.beginPath(); bolt.forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.stroke(); }
    // (the Hurl-A-Whirl: a clown head on a column, four arms with barf buckets, tilted)
    const hx = 900, hy = PG - 110;
    box(g, hx - 6, hy, 12, PG - hy, T('#6A5E88')); box(g, hx - 6, hy, 3, PG - hy, T('#8E84AA'));
    for (let k = 0; k < 4; k++) { const a = -0.3 + (k / 4) * Math.PI * 2, ex = hx + Math.cos(a) * 52, ey = hy + Math.sin(a) * 22; g.strokeStyle = T('#5A5470'); g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.stroke(); box(g, ex - 8, ey - 2, 16, 12, T(INK)); box(g, ex - 7, ey - 1, 14, 10, T(['#5EC46A', '#E2465E', '#F2D23A', '#5A8AE8'][k])); box(g, ex - 7, ey - 1, 14, 2, T('#FFFFFF')); }
    g.fillStyle = T(INK); g.beginPath(); g.arc(hx, hy - 6, 19, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#F4ECF0'); g.beginPath(); g.arc(hx, hy - 6, 17, 0, Math.PI * 2); g.fill();
    for (const s of [-1, 1]) { g.fillStyle = T('#8A4AC8'); g.beginPath(); g.arc(hx + s * 18, hy - 12, 8, 0, Math.PI * 2); g.fill(); }
    box(g, hx - 8, hy - 12, 4, 4, T(INK)); box(g, hx + 4, hy - 12, 4, 4, T(INK)); box(g, hx - 9, hy - 7, 6, 2, T('#8A6A9A')); box(g, hx + 3, hy - 7, 6, 2, T('#8A6A9A'));
    g.fillStyle = T('#E2283E'); g.beginPath(); g.arc(hx, hy - 4, 4, 0, Math.PI * 2); g.fill();
    box(g, hx - 7, hy + 4, 14, 2, T('#C8283E')); box(g, hx + 7, hy + 3, 10, 1, T('#F4F0E8')); box(g, hx + 17, hy + 1, 2, 2, T('#F2823A'));
    // (the halfpipe and its giant board)
    const px0 = 990;
    g.fillStyle = T('#A8A4B8'); g.beginPath(); g.moveTo(px0, PG); g.lineTo(px0, PG - 50); g.quadraticCurveTo(px0 + 10, PG - 6, px0 + 60, PG - 6); g.quadraticCurveTo(px0 + 110, PG - 6, px0 + 120, PG - 50); g.lineTo(px0 + 120, PG); g.closePath(); g.fill();
    box(g, px0 - 2, PG - 52, 6, 3, T('#6A6680')); box(g, px0 + 116, PG - 52, 6, 3, T('#6A6680'));
    g.save(); g.translate(px0 + 60, PG - 12); g.rotate(-0.08); box(g, -30, -4, 60, 5, T(INK)); box(g, -29, -3, 58, 3, T('#E2465E')); box(g, -29, -3, 58, 1, T('#F49AAA')); for (const wx of [-20, 18]) { box(g, wx - 3, 2, 6, 4, T(INK)); box(g, wx - 2, 2, 4, 3, T('#F2D23A')); } g.restore();
    signText(g, 'RAD RAT', px0 + 60, PG - 40, { sx: 1, sy: 1, bold: true, slant: 1, fill: T('#2A2638') });
    // (Drake's pod on its legs, its beacon)
    const dx = 1130;
    for (const s of [-1, 1]) { g.strokeStyle = T('#5A5470'); g.lineWidth = 3; g.beginPath(); g.moveTo(dx + s * 10, PG - 30); g.lineTo(dx + s * 22, PG); g.stroke(); }
    g.fillStyle = T(INK); g.beginPath(); g.ellipse(dx, PG - 44, 26, 18, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#3A3A5A'); g.beginPath(); g.ellipse(dx, PG - 44, 24, 16, 0, 0, Math.PI * 2); g.fill();
    box(g, dx - 14, PG - 50, 28, 6, T('#E8C84A')); box(g, dx - 4, PG - 64, 8, 4, lamps ? '#FF4A4A' : T('#C8283E'));
  }
  // ---- STUPID DAD LIVE!: the band shell over the bowl, its light towers
  { const cx = 1340, base = PG - 20, rx = 92, ry = 92;
    const bands = ['#F3E9D2', '#7DB7E8', '#F3E9D2', '#5B9BD5', '#F3E9D2', '#7DB7E8'];
    for (let i = 0; i < bands.length; i++) { const k = 1 - i / bands.length; g.fillStyle = T(INK); g.beginPath(); g.ellipse(cx, base, rx * k + 2, ry * k + 2, 0, Math.PI, 0); g.fill(); g.fillStyle = T(bands[i]); g.beginPath(); g.ellipse(cx, base, rx * k, ry * k, 0, Math.PI, 0); g.fill(); }
    g.fillStyle = T('#2A2440'); g.beginPath(); g.ellipse(cx, base, rx * 0.17, ry * 0.17, 0, Math.PI, 0); g.fill();
    for (let k = 1; k < 10; k++) { const a = Math.PI + (k / 10) * Math.PI; g.strokeStyle = T('#C9B98F'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx + Math.cos(a) * rx * 0.2, base + Math.sin(a) * ry * 0.2); g.lineTo(cx + Math.cos(a) * rx, base + Math.sin(a) * ry); g.stroke(); }
    if (lamps) for (let k = 0; k < 24; k++) { const a = Math.PI + (k / 23) * Math.PI; box(g, cx + Math.cos(a) * rx - 1, base + Math.sin(a) * ry - 1, 2, 2, k % 2 ? '#FFF0B0' : '#FFC860'); }
    box(g, cx - 60, base - 46, 120, 16, T(INK)); box(g, cx - 59, base - 45, 118, 14, T('#B91C1C')); box(g, cx - 59, base - 45, 118, 2, T('#E2465E'));
    signText(g, 'STUPID DAD LIVE!', cx, base - 35, tiny(T('#FFFFFF'), T(INK)));
    // (the bowl's rim and bleachers in front of it, its light towers)
    g.fillStyle = T('#B4ACA0'); g.beginPath(); g.moveTo(cx - 150, PG); g.quadraticCurveTo(cx, PG - 34, cx + 150, PG); g.closePath(); g.fill();
    for (let k = 0; k < 4; k++) { g.strokeStyle = T('#D8D0C4'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 140 + k * 8, PG - 2 - k * 2); g.quadraticCurveTo(cx, PG - 30 + k * 6, cx + 140 - k * 8, PG - 2 - k * 2); g.stroke(); }
    for (const lx of [cx - 140, cx + 140]) { box(g, lx - 2, PG - 150, 4, 150, T('#6A6488')); for (let y = PG - 146; y < PG; y += 10) { g.strokeStyle = T('#6A6488'); g.lineWidth = 1; g.beginPath(); g.moveTo(lx - 4, y); g.lineTo(lx + 4, y + 10); g.stroke(); } box(g, lx - 12, PG - 160, 24, 12, T('#3A3450')); for (let k = 0; k < 6; k++) box(g, lx - 10 + (k % 3) * 7, PG - 158 + Math.floor(k / 3) * 5, 5, 4, lamps ? '#FFF6D0' : T('#C8C4D8')); }
  }
  // ---- the STUPID DAD billboard
  billboard(g, T, tod, 1540, PG - 140, 180, 70, () => {
    for (let k = 0; k < 3; k++) box(g, 1540, PG - 140 + k * 24, 180, 24, T(['#F6D23A', '#F2C030', '#E8AE28'][k]));
    // (him: balding, the mustache, the can up)
    const fx = 1570, fy = PG - 100;
    g.fillStyle = T(INK); g.beginPath(); g.ellipse(fx, fy, 17, 20, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#F0C8A0'); g.beginPath(); g.ellipse(fx, fy, 15, 18, 0, 0, Math.PI * 2); g.fill();
    box(g, fx - 15, fy - 6, 4, 10, T('#6A4A2A')); box(g, fx + 11, fy - 6, 4, 10, T('#6A4A2A'));
    box(g, fx - 7, fy - 4, 4, 2, T(INK)); box(g, fx + 3, fy - 4, 4, 2, T(INK)); box(g, fx - 8, fy + 4, 16, 4, T('#6A4A2A')); box(g, fx - 4, fy + 10, 8, 2, T('#8A2A2A'));
    box(g, fx + 18, fy - 6, 9, 14, T(INK)); box(g, fx + 19, fy - 5, 7, 12, T('#D8D8E8')); box(g, fx + 19, fy - 1, 7, 4, T('#C8283E'));
    signText(g, 'STUPID DAD', 1655, PG - 118, { sx: 2, sy: 2, bold: true, fill: [T('#FF6A6A'), T('#C8283E')], ink: T(INK) });
    signText(g, "AMERICA'S NEW", 1655, PG - 98, tiny(T('#2A1A4A')));
    signText(g, 'FAVORITE FAMILY!', 1655, PG - 88, tiny(T('#2A1A4A')));
  });
  // ---- a gift shop's striped onion dome, flags
  { const gx = 1830, gt = PG - 70;
    box(g, gx - 40, gt, 80, 70, T('#F8E0EC')); box(g, gx + 26, gt, 14, 70, T('#E0C0D2')); box(g, gx - 40, gt, 4, 70, T('#FFF4FA'));
    for (let k = 0; k < 4; k++) box(g, gx - 32 + k * 18, gt + 16, 10, 16, win(tod, k + 40, T('#7AA6D8')));
    box(g, gx - 12, PG - 24, 24, 24, T('#7A3A5A'));
    g.save(); g.beginPath(); g.moveTo(gx - 44, gt); g.bezierCurveTo(gx - 60, gt - 50, gx - 6, gt - 50, gx, gt - 84); g.bezierCurveTo(gx + 6, gt - 50, gx + 60, gt - 50, gx + 44, gt); g.closePath(); g.clip();
    for (let k = -60; k < 60; k += 12) { g.fillStyle = T(((k / 12) | 0) % 2 ? '#E2465E' : '#FFF4F8'); g.fillRect(gx + k, gt - 90, 6, 92); }
    g.fillStyle = 'rgba(30,16,40,0.18)'; g.fillRect(gx + 10, gt - 90, 40, 92); g.restore();
    box(g, gx - 1, gt - 100, 2, 16, T('#5A4A6A')); box(g, gx + 1, gt - 100, 10, 6, T('#5EC4F4'));
    signText(g, 'GIFTS', gx, gt + 50, tiny(T('#B91C4A')));
  }
  // ---- trees, lamp posts and flags along the front of it all (Truffula tufts and puff-balls), bunting between
  for (let x = 12; x < PW; x += 26) {
    const hs = hash(x * 0.37); if (hs < 0.3) continue;
    const h = 22 + Math.floor(hash(x * 1.1) * 26), col = ['#F472B6', '#FDE047', '#C084FC', '#5EEAD4', '#FB923C'][Math.floor(hash(x * 2.9) * 5)], R = [T(mix(col, INK, 0.35)), T(col), T(mix(col, '#FFFFFF', 0.4))];
    if (hs > 0.7) {
      // (a Truffula: a thin striped trunk, bent, a shaggy tuft)
      const bend = (hash(x) - 0.5) * 10;
      for (let y = 0; y < h; y += 2) box(g, x + bend * (y / h) ** 2, PG - y - 2, 2, 2, (y >> 1) % 3 ? T('#F4ECD8') : T('#2A2638'));
      pixelBlob(g, x + bend, PG - h - 6, 9, 7, R[0]); pixelBlob(g, x + bend - 1, PG - h - 7, 8, 6, R[1]); pixelBlob(g, x + bend - 3, PG - h - 9, 4, 3, R[2]);
    } else {
      box(g, x, PG - h, 2, h, T('#6A4A3A'));
      pixelBlob(g, x + 1, PG - h - 4, 7, 7, R[0]); pixelBlob(g, x, PG - h - 5, 6, 6, R[1]); pixelBlob(g, x - 2, PG - h - 7, 2, 2, R[2]);
    }
  }
  for (let k = 0; k < 12; k++) { const x0 = 40 + k * 165, x1 = x0 + 70, y = PG - 60 - hash(k) * 30; for (let t = 0; t <= 1; t += 0.06) { const xx = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * 10; box(g, xx, yy, 1, 1, T('#5A4A6A')); if (Math.round(t / 0.06) % 2) { g.fillStyle = T(['#E2465E', '#F2D23A', '#5EC4F4', '#5EC46A'][Math.round(t / 0.12) % 4]); g.beginPath(); g.moveTo(xx - 2, yy); g.lineTo(xx + 2, yy); g.lineTo(xx, yy + 4); g.closePath(); g.fill(); } } }
  hazeBands(g, 0, PG - 90, PW, 90, skyAt(0.9, tod), 0.0, 0.18, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// Sillyville's own roofs, past the square

const RW = 1600, RH = 300, RG = RH - 40;
type RoofKind = 'onion' | 'flop' | 'balls' | 'cake' | 'corkscrew' | 'toad' | 'truffula';
interface Roof { x: number; w: number; h: number; kind: RoofKind; seed: number }
const KINDS: RoofKind[] = ['onion', 'flop', 'balls', 'cake', 'onion', 'corkscrew', 'flop', 'toad', 'cake', 'balls'];
const ROOFS: Roof[] = (() => {
  const out: Roof[] = [];
  let x = 6, i = 0;
  while (x < RW - 50) {
    const s = i * 7 + 3;
    if (hash(s * 1.9) > 0.78) { out.push({ x, w: 24, h: 50 + hash(s) * 40, kind: 'truffula', seed: s }); x += 26; }
    else { const w = 36 + Math.floor(hash(s * 1.3) * 44); out.push({ x, w, h: 56 + hash(s * 2.1) * 80, kind: KINDS[Math.floor(hash(s * 4.7) * KINDS.length)], seed: s }); x += w + 6 + Math.floor(hash(s * 3) * 14); }
    i++;
  }
  return out;
})();
const WALLS = ['#F8D8E8', '#FCEBB0', '#CCE4F8', '#D0F0DA', '#E4D8F8', '#FCDCC0'];
const TOPS = ['#E2465E', '#7C5CC8', '#2AA6A0', '#F2822A', '#4A7AE0', '#D8408A', '#E8B830'];
/** Where the chimneys are (tile x, y), for the smoke. */
const CHIMNEYS: [number, number][] = [];
for (const r of ROOFS) if (r.kind !== 'truffula' && hash(r.seed * 5) > 0.55) CHIMNEYS.push([r.x + r.w * 0.2, RG - r.h - 26]);

const paintRoofs = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.16);
  box(g, 0, RG - 10, RW, RH - RG + 10, T('#B4A4CC'));
  for (const r of ROOFS) {
    const x = r.x, w = r.w, top = RG - r.h, wall = WALLS[((Math.floor(r.seed) % WALLS.length) + WALLS.length) % WALLS.length], roof = TOPS[((Math.floor(r.seed * 3) % TOPS.length) + TOPS.length) % TOPS.length];
    if (r.kind === 'truffula') {
      const bend = (hash(r.seed) - 0.5) * 18, cx = x + w / 2;
      for (let y = 0; y < r.h; y += 2) box(g, cx + bend * (y / r.h) ** 2 - 1, RG - y - 2, 3, 2, (y >> 1) % 3 ? T('#F6EEDC') : T('#4A3A5A'));
      const tc = ['#F472B6', '#FDE047', '#C084FC', '#5EEAD4', '#FB923C'][((Math.floor(r.seed) % 5) + 5) % 5];
      pixelBlob(g, cx + bend, RG - r.h - 8, 15, 11, T(mix(tc, INK, 0.3))); pixelBlob(g, cx + bend - 1, RG - r.h - 10, 13, 9, T(tc)); pixelBlob(g, cx + bend - 5, RG - r.h - 13, 5, 4, T(mix(tc, '#FFFFFF', 0.45)));
      for (let k = 0; k < 6; k++) box(g, cx + bend - 12 + k * 5, RG - r.h - 2 + (k % 2) * 2, 2, 3, T(mix(tc, INK, 0.3)));
      continue;
    }
    // (the body: bulging, leaning a touch, lit down the left, shaded right, a candy spiral on some)
    const lean = Math.round((hash(r.seed * 9) - 0.5) * 12), bulge = 4 + hash(r.seed * 2) * 6;
    const body = () => { g.moveTo(x, RG); g.quadraticCurveTo(x - bulge + lean * 0.5, RG - r.h / 2, x + lean, top); g.lineTo(x + w + lean, top); g.quadraticCurveTo(x + w + bulge + lean * 0.5, RG - r.h / 2, x + w, RG); g.closePath(); };
    g.fillStyle = T(INK); g.save(); g.translate(-1, 0); g.beginPath(); body(); g.fill(); g.translate(2, 0); g.beginPath(); body(); g.fill(); g.restore();
    g.save(); g.beginPath(); body(); g.clip();
    box(g, x - 20, top - 4, w + 40, r.h + 8, T(wall));
    if (r.seed % 3 === 0) { g.fillStyle = T(mix(wall, roof, 0.45)); for (let k = -r.h; k < w + 20; k += 16) { g.beginPath(); g.moveTo(x + k, RG); g.lineTo(x + k + 7, RG); g.lineTo(x + k + 7 + r.h * 0.4, top); g.lineTo(x + k + r.h * 0.4, top); g.closePath(); g.fill(); } }
    box(g, x - 20, top - 4, w * 0.22 + 20, r.h + 8, T(mix(wall, '#FFFFFF', 0.35))); checker(g, x + w * 0.22, top - 4, 2, r.h + 8, T(mix(wall, '#FFFFFF', 0.35)), 0, 1);
    box(g, x + w * 0.7, top - 4, w, r.h + 8, T(mix(wall, INK, 0.2))); checker(g, x + w * 0.7 - 2, top - 4, 2, r.h + 8, T(mix(wall, INK, 0.2)), 1, 1);
    // (round windows in a wiggle up it, lit warm after dark)
    for (let k = 0; k < Math.floor(r.h / 30); k++) { const wy = RG - 22 - k * 30, wx = x + w / 2 + Math.sin(k * 1.9 + r.seed) * w * 0.2 + lean * (k * 30 / r.h); g.fillStyle = T(INK); g.beginPath(); g.arc(wx, wy, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = win(tod, r.seed * 3 + k, T('#7AAEDC')); g.beginPath(); g.arc(wx, wy, 4, 0, Math.PI * 2); g.fill(); box(g, wx - 2, wy - 3, 2, 2, T('#FFFFFF')); }
    g.restore();
    // (the roof)
    const tx = x + lean + w / 2, R = [T(mix(roof, INK, 0.35)), T(roof), T(mix(roof, '#FFFFFF', 0.35))];
    if (r.kind === 'onion') {
      const dome = (k: number) => { g.beginPath(); g.moveTo(tx - w / 2 - 5 * k, top + 2); g.bezierCurveTo(tx - w / 2 - 16 * k, top - w * 0.5, tx - 8, top - w * 0.6, tx + 4 + (r.seed % 2 ? 10 : -10), top - w * 0.95); g.bezierCurveTo(tx + 6, top - w * 0.6, tx + w / 2 + 16 * k, top - w * 0.5, tx + w / 2 + 5 * k, top + 2); g.closePath(); };
      g.fillStyle = T(INK); dome(1.15); g.fill(); g.fillStyle = R[1]; dome(1); g.fill();
      g.save(); dome(1); g.clip(); box(g, tx - w, top - w, w * 0.7, w * 1.2, R[2]); box(g, tx + w * 0.2, top - w, w, w * 1.2, R[0]); checker(g, tx + w * 0.2 - 2, top - w, 2, w * 1.2, R[0], 0, 1); g.restore();
      g.fillStyle = T('#F2C84A'); g.beginPath(); g.arc(tx + 4 + (r.seed % 2 ? 10 : -10), top - w * 0.95 - 3, 3, 0, Math.PI * 2); g.fill();
    } else if (r.kind === 'flop') {
      const f = r.seed % 2 ? 1 : -1;
      g.fillStyle = T(INK); g.beginPath(); g.moveTo(tx - w / 2 - 5, top + 2); g.quadraticCurveTo(tx, top - w * 1.4, tx + f * w * 0.4, top - w * 1.3); g.quadraticCurveTo(tx + f * w * 0.9, top - w * 1.2, tx + f * w * 0.8, top - w * 0.8); g.quadraticCurveTo(tx + f * w * 0.3, top - w * 0.6, tx + w / 2 + 5, top + 2); g.closePath(); g.fill();
      g.fillStyle = R[1]; g.beginPath(); g.moveTo(tx - w / 2 - 3, top + 1); g.quadraticCurveTo(tx, top - w * 1.36, tx + f * w * 0.4, top - w * 1.26); g.quadraticCurveTo(tx + f * w * 0.86, top - w * 1.16, tx + f * w * 0.78, top - w * 0.82); g.quadraticCurveTo(tx + f * w * 0.28, top - w * 0.62, tx + w / 2 + 3, top + 1); g.closePath(); g.fill();
      g.fillStyle = R[2]; g.beginPath(); g.moveTo(tx - w / 2 - 3, top + 1); g.quadraticCurveTo(tx - w * 0.1, top - w * 1.1, tx - w * 0.05, top - w * 0.8); g.lineTo(tx - w * 0.2, top); g.closePath(); g.fill();
      g.fillStyle = T('#FFFFFF'); g.beginPath(); g.arc(tx + f * w * 0.8, top - w * 0.8, 4, 0, Math.PI * 2); g.fill();
    } else if (r.kind === 'balls') {
      for (let k = 0; k < 3; k++) { const rr = w / 2 - k * 6, cy = top - 6 - k * 13, col = TOPS[((Math.floor(r.seed + k) % TOPS.length) + TOPS.length) % TOPS.length]; g.fillStyle = T(INK); g.beginPath(); g.ellipse(tx, cy, rr + 1, 8, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = T(col); g.beginPath(); g.ellipse(tx, cy, rr, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = T(mix(col, '#FFFFFF', 0.4)); g.beginPath(); g.ellipse(tx - rr * 0.3, cy - 3, rr * 0.4, 2, 0, 0, Math.PI * 2); g.fill(); }
    } else if (r.kind === 'cake') {
      for (let k = 0; k < 3; k++) { const ww = w - k * 10, hh = 12, cy = top - k * hh; box(g, tx - ww / 2 - 1, cy - hh - 1, ww + 2, hh + 2, T(INK)); box(g, tx - ww / 2, cy - hh, ww, hh, T(TOPS[((Math.floor(r.seed + k * 2) % TOPS.length) + TOPS.length) % TOPS.length])); box(g, tx - ww / 2, cy - hh, ww, 3, T('#FFF4FA')); for (let d = tx - ww / 2 + 3; d < tx + ww / 2 - 2; d += 6) box(g, d, cy - hh + 3, 3, 2 + ((d | 0) % 3), T('#FFF4FA')); }
      g.fillStyle = T('#E2283E'); g.beginPath(); g.arc(tx, top - 40, 4, 0, Math.PI * 2); g.fill();
    } else if (r.kind === 'corkscrew') {
      for (let y = 0; y < w * 1.6; y += 2) { const ww = (w / 2 + 4) * (1 - y / (w * 1.6)); box(g, tx - ww, top - y - 2, ww * 2, 2, ((y + (r.seed % 6)) >> 2) % 2 ? R[1] : T('#FFF4F8')); box(g, tx + ww * 0.4, top - y - 2, ww * 0.6, 2, ((y + (r.seed % 6)) >> 2) % 2 ? R[0] : T('#D8C8DC')); box(g, tx - ww, top - y - 2, 2, 2, R[2]); }
      box(g, tx - 1, top - w * 1.6 - 8, 2, 8, T('#5A4A6A'));
    } else {
      // (a toadstool cap for a roof, white spots)
      g.fillStyle = T(INK); g.beginPath(); g.ellipse(tx, top + 2, w / 2 + 12, w * 0.5, 0, Math.PI, 0); g.fill();
      g.fillStyle = T('#E2283E'); g.beginPath(); g.ellipse(tx, top + 1, w / 2 + 10, w * 0.46, 0, Math.PI, 0); g.fill();
      for (let k = 0; k < 4; k++) { g.fillStyle = T('#FFF4F4'); g.beginPath(); g.arc(tx - w / 2 + 4 + k * (w / 3), top - w * 0.2 + (k % 2) * 6, 3, 0, Math.PI * 2); g.fill(); }
    }
    // (a curly chimney on some)
    if (hash(r.seed * 5) > 0.55) { const cx = x + w * 0.2; g.strokeStyle = T(INK); g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, top + 6); g.bezierCurveTo(cx - 10, top - 6, cx + 10, top - 14, cx, top - 24); g.stroke(); g.strokeStyle = T('#E86A6A'); g.lineWidth = 3; g.stroke(); }
  }
  // (bunting strung between some of the towers)
  for (let i = 0; i + 1 < ROOFS.length; i += 3) {
    const a = ROOFS[i], b = ROOFS[i + 1]; if (a.kind === 'truffula' || b.kind === 'truffula') continue;
    const x0 = a.x + a.w, y0 = RG - a.h + 18, x1 = b.x, y1 = RG - b.h + 18;
    for (let t = 0; t <= 1; t += 0.08) { const xx = x0 + (x1 - x0) * t, yy = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 10; box(g, xx, yy, 1, 1, T('#5A4A6A')); if (Math.round(t / 0.08) % 2) { g.fillStyle = T(TOPS[Math.round(t / 0.16) % TOPS.length]); g.beginPath(); g.moveTo(xx - 3, yy); g.lineTo(xx + 3, yy); g.lineTo(xx, yy + 5); g.closePath(); g.fill(); } }
  }
  hazeBands(g, 0, RG - 60, RW, 60, skyAt(0.92, tod), 0.0, 0.2, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// Live: the chimneys' smoke (curly puffs), the balloons that got away

const smoke = (c: Ctx, x: number, y: number, f: number, seed: number, col: string) => {
  for (let k = 0; k < 5; k++) {
    const t = ((f * 0.4 + seed * 37 + k * 18) % 90) / 90, r = 2 + t * 5;
    const px = x + Math.sin(t * 7 + seed) * 5 + t * 10, py = y - t * 56;
    c.globalAlpha = 0.55 * (1 - t); c.fillStyle = col;
    c.fillRect(Math.round(px - r), Math.round(py - r * 0.7), Math.round(r * 2), Math.round(r * 1.4));
  }
  c.globalAlpha = 1;
};
const BALLOONS = ['#EF4444', '#FDE047', '#3B82F6', '#22C55E', '#EC4899', '#F97316'];
const strays = (c: Ctx, state: GameState, hz: number) => {
  const f = state.frame, tod = timeOfDay();
  for (let i = 0; i < 4; i++) {
    const period = 1400 + i * 260, t = ((f + i * 517) % period) / period;
    const x = ((hash(i * 4.1) * 900 + Math.sin(t * 9 + i) * 26 - state.camera.x * 0.05) % 900 + 900) % 900 - 50, y = hz - 40 - t * (hz + 40);
    const col = farTint(BALLOONS[i % BALLOONS.length], 0.5, tod), r = 4 + (i % 2);
    c.fillStyle = INK; c.beginPath(); c.ellipse(x, y, r + 1, r * 1.25 + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y, r, r * 1.25, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = mix(col, '#FFFFFF', 0.6); c.fillRect(Math.round(x - r * 0.5), Math.round(y - r * 0.7), 2, 2);
    c.fillStyle = mix(col, INK, 0.4); c.fillRect(Math.round(x - 1), Math.round(y + r * 1.25), 2, 1);
    c.strokeStyle = mix(col, '#FFFFFF', 0.3); c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + r * 1.25 + 1); c.quadraticCurveTo(x + Math.sin(f * 0.05 + i) * 4, y + r * 2.6, x - 1, y + r * 4); c.stroke();
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawKiddieFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), hz = horizonY(state), cx = state.camera.x, f = state.frame;
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: hz, sun: [640, 110], moon: [150, 84], t: f, scroll: cx * 0.01 });
  tile(c, 'clouds', cx * 0.015 + f * 0.06, hz - 410, CH, CW, g => paintClouds(g, tod));
  strays(c, state, hz);
  tile(c, 'hills', cx * 0.03, hz - HH + 8, HH, HW, g => paintHills(g, tod));
  tile(c, 'park', cx * 0.07, hz - PH + 22, PH, PW, g => paintPark(g, tod));
  // (the water tower up on its hill over the park, drifting across the sky as he goes: the landmark, kept clear)
  const m = MONUMENT_AT.kiddie;
  if (m) drawMonument(c, state, m, m.foot - 40 + (hz - 440));
  // (the square's own roofs, their chimneys smoking; under them, the ground right down)
  const ry = hz + 30 - RG, off = cx * 0.18;
  tile(c, 'roofs', off, ry, RH, RW, g => paintRoofs(g, tod));
  box(c, 0, ry + RH - 1, W, H, farCol(tod, 0.16)('#B4A4CC'));
  const sm = mix(farCol(tod, 0.3)('#F4ECF6'), skyAt(0.6, tod), 0.2);
  for (const [chx, chy] of CHIMNEYS) for (let x = chx - (((off % RW) + RW) % RW); x < W + 40; x += RW) if (x > -40) smoke(c, x, ry + chy, f, chx, sm);
};
