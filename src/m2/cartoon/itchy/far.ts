// PUNCHY & KICKY's far off (screen space: the backdrop), every layer painted once for the hour into a tile and slid
// along (only the banner plane and the water tower's propeller live):
//
//   the sky by the hour (a hot blue down to a coral blush: the show's warm), fat stepped cumulus, a cloud the shape of a
//   skull and one of a bone among them (it's that kind of cartoon), jet streaks; THE BANNER PLANE (a red biplane towing
//   PUNCHY & KICKY: NOW 40% MORE KILLING!); far off past the park's berm, the hazy hills, a line of pylons, the
//   GENERIC-CO plant (its stacks, its smoke banded, the logo on its tank), a drive-in's screen, a cemetery on its knoll, a
//   quarry; THE CARTOON LAND WATER TOWER (monument.ts: bigger again); THE REST OF CARTOON LAND: back the way he came the
//   big-kid zone (the Hurl-A-Whirl, the halfpipe, the inflatable Rad Rat, the neon bolt, the slime bucket), the studios'
//   logo, the WACKY WHITE HOUSE, Sillyville's domes; ahead DAD GUY LIVE!'s band shell and light towers, the UBX
//   AMPHITHEATER's sign, the beer garden's umbrellas, a DAD GUY billboard; trees, bunting and lamps between; and
//   nearest, THE KNOCKOFF'S OWN ROOFS: blood-red, mustard, black and bone show buildings dripping off their parapets,
//   with the show's giant props on top (a mallet driven into a roof, an anvil through one, a cleaver stuck in another,
//   the skull water tank, the inflatable Punchy with his X'd eye, Kicky's ears on a dome, a dynamite-stick chimney, a
//   stack of GENERIC-CO crates, the KILL-O-COASTER's loop, a searchlight), rooftop billboards, a fence of bones and red
//   puff trees along their feet; all lit up after dark. No volcanoes.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { pixelBlob, hazeBands } from '../../../m1/game/render/pixelArt';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { snap2, wave, mist } from '../../adventure/farArt';
import { signText, type Look } from '../../signLetters';
import { box, mix, hash, checker, stamp, INK, type Ctx } from '../kit';
import { MONUMENT_AT, drawMonument } from '../monument';
import { SECTIONS } from '../geometry';
import { farSpooky, farHollywood } from '../glimpse';

/** How far the country, the park and the water tower stand up over the horizon (so they show over the roofs). */
const LIFT = 110;

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

/** Where the horizon sits on screen (it drifts down as the camera climbs onto the towers' lids). */
export const horizonY = (state: GameState) => Math.round(440 + Math.max(-20, Math.min(70, (50 - state.camera.y) * 0.1)));

/** The knockoff's sky, top to horizon: a hot blue down through a dusty lilac to a coral blush. */
const SKY = ['#2E7ED0', '#4A98DE', '#78B4E6', '#ACC4E4', '#E4B8BC', '#FFA88C'];

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const fk = () => (fontReady() ? 'f' : 'n');
/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx) => void) => {
  const tod = timeOfDay(), k = `ct-pkf-${key}-${tod.key}-${fk()}`;
  for (let x = -(((off % tw) + tw) % tw); x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, k, 0, 0, tw, h, paint); c.restore(); }
};
/** A far layer's color for the hour: toward dusk and night, then into the sky's haze by `k`. */
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A6A', 0.2), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);
/** A window: lit warm after dark (most of them), else the glass. */
const win = (tod: TimeOfDay, i: number, glass: string) => (tod.lamps > 0.3 ? (hash(i * 1.7) > 0.25 ? (hash(i * 3.1) > 0.5 ? '#FFE08A' : '#F6B860') : glass) : glass);
const tiny = (fill: string | string[], ink?: string, slant = 0): Look => ({ sx: 1, sy: 1, bold: false, fill, ink, gap: 1, slant });
const tinyB = (fill: string | string[], ink?: string): Look => ({ sx: 1, sy: 1, bold: true, fill, ink });
/** Three steps of a color for a far layer: shade, itself, lit. */
const st3 = (T: (c: string) => string, col: string) => [T(mix(col, INK, 0.3)), T(col), T(mix(col, '#FFFFFF', 0.35))];
const disc = (g: Ctx, x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const oval = (g: Ctx, x: number, y: number, a: number, b: number, col: string, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, a, b, rot, 0, Math.PI * 2); g.fill(); };
const tri = (g: Ctx, pts: number[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };

// ---------------------------------------------------------------------------------------------------------------
// Clouds: fat stepped cumulus, a skull, a bone; jet streaks

const CW = 1200, CH = 190;
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#B0A0C8', '#D4C8E4', '#F0E8F4', '#FFFFFF'].map(c => cloudTint(c, tod));
  const puffy = (cx: number, cy: number, s: number, puffs: number, seed: number) => {
    for (const [L, dy, k] of [[0, 3, 1], [1, 0, 0.9], [2, -3, 0.7], [3, -6, 0.4]] as const) for (let p = 0; p < puffs; p++) {
      const px = cx + (p - puffs / 2) * 19 * s, py = cy - Math.sin((p / Math.max(1, puffs - 1)) * Math.PI) * 18 * s + dy * s, r = (13 + hash(seed * 13 + p) * 11) * s * k;
      for (const ox of [0, CW, -CW]) pixelBlob(g, px + ox - (L === 3 ? 5 : 0), py, r * 1.3, r * 0.82, C[L]);
    }
    for (const ox of [0, CW, -CW]) { box(g, cx + ox - puffs * 9.5 * s, cy + 12 * s, puffs * 19 * s, 3, C[0]); checker(g, cx + ox - puffs * 9.5 * s, cy + 10 * s, puffs * 19 * s, 2, C[0], 0, 2); }
  };
  for (let i = 0; i < 6; i++) { if (i === 2 || i === 4) continue; puffy((i * CW) / 6 + hash(i * 4.3) * 60, 52 + hash(i * 6.1) * 86, 0.7 + hash(i * 8.7) * 0.8, 3 + Math.floor(hash(i * 1.3) * 4), i); }
  // (the skull cloud: a dome of puffs, two sockets of sky, a jaw of little puffs)
  for (const ox of [0, CW, -CW]) {
    const sx = 2 * CW / 6 + 40 + ox, sy = 78;
    for (const [L, dy] of [[0, 3], [1, 0], [2, -3], [3, -6]] as const) { pixelBlob(g, sx - (L === 3 ? 6 : 0), sy + dy, 40 - L * 4, 30 - L * 3, C[L]); for (let k = -2; k <= 2; k++) pixelBlob(g, sx + k * 12, sy + 30 + dy * 0.5, 7 - L, 8 - L, C[L]); }
    const sky = skyAt(0.3, tod);
    pixelBlob(g, sx - 14, sy + 4, 9, 9, sky); pixelBlob(g, sx + 14, sy + 4, 9, 9, sky); tri(g, [sx, sy + 14, sx - 4, sy + 22, sx + 4, sy + 22], sky);
    // (the bone cloud: a long puff with two knobs each end)
    const bx = 4 * CW / 6 + 30 + ox, by = 132;
    for (const [L, dy] of [[0, 2], [1, 0], [2, -2], [3, -4]] as const) { box(g, bx - 60, by - 8 + dy + L, 120, 16 - L * 2, C[L]); for (const ex of [-62, 62]) for (const s of [-1, 1]) pixelBlob(g, bx + ex, by + s * 10 + dy, 12 - L * 2, 11 - L * 2, C[L]); }
  }
  for (let i = 0; i < 3; i++) {
    const x0 = hash(i * 7.7) * CW, y0 = 20 + hash(i * 2.9) * 70, len = 160 + hash(i * 5.5) * 140, sl = 0.08 + hash(i) * 0.08;
    for (const ox of [0, CW, -CW]) for (let x = 0; x < len; x += 2) {
      const y = y0 + x * sl, fray = x / len;
      if (hash(x * 0.37 + i) < fray * 0.7) continue;
      box(g, x0 + ox + x, y, 2, fray > 0.5 ? 2 : 1, C[fray > 0.6 ? 2 : 3]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The banner plane, live: a red biplane towing PUNCHY & KICKY: NOW 40% MORE KILLING!

const paintPlane = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.2), R = st3(T, '#C8283E'), Y = st3(T, '#F2C030');
  // (the banner first, rippling behind on its rope)
  const bx = 70, bw = 230, by = 22;
  g.strokeStyle = T('#5A5470'); g.lineWidth = 1; g.beginPath(); g.moveTo(54, 20); g.quadraticCurveTo(62, 26, bx, by + 2); g.stroke();
  for (let x = 0; x < bw; x += 2) { const y = by + Math.sin(x * 0.06) * 3; box(g, bx + x, y - 1, 2, 16, T(INK)); box(g, bx + x, y, 2, 14, T(x % 8 < 4 ? '#FFF7E8' : '#F4EADA')); box(g, bx + x, y + 12, 2, 2, T('#D8CCB8')); }
  signText(g, 'PUNCHY & KICKY: NOW 40% MORE KILLING!', bx + bw / 2, by + 10, tiny(T('#B01C22')));
  // (the biplane, facing left: the two wings, struts, the fuselage stepped, the prop a blur)
  box(g, 6, 8, 44, 4, T(INK)); box(g, 7, 9, 42, 2, Y[1]); box(g, 7, 9, 42, 1, Y[2]);
  box(g, 4, 22, 46, 4, T(INK)); box(g, 5, 23, 44, 2, Y[1]);
  for (const sx of [14, 38]) box(g, sx, 11, 2, 12, T(INK));
  oval(g, 30, 17, 24, 6, T(INK)); oval(g, 30, 17, 23, 5, R[1]); oval(g, 28, 15, 18, 2.5, R[2]); box(g, 34, 19, 18, 2, R[0]);
  tri(g, [50, 17, 60, 8, 62, 18, 54, 20], T(INK)); tri(g, [51, 17, 59, 10, 60, 17, 54, 19], R[1]);
  box(g, 24, 10, 6, 5, T(INK)); oval(g, 27, 10, 3, 3, T('#7A5A3A'));
  box(g, 3, 13, 3, 8, T(INK)); g.globalAlpha = 0.55; oval(g, 2, 17, 1.5, 9, T('#DCDCDC')); g.globalAlpha = 1;
  if (tod.lamps > 0.3) { box(g, 5, 9, 2, 2, '#FF5050'); box(g, 47, 9, 2, 2, '#7CFF7C'); }
};
const drawPlane = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), period = 4600, t = ((state.frame + 1700) % period) / period;
  const x = W + 40 - t * (W + 420) - ((state.camera.x * 0.02) % 200), y = 46 + Math.sin(state.frame * 0.013) * 4;
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, `ct-pkf-plane-${tod.key}-${fk()}`, 0, 0, 310, 50, g => paintPlane(g, tod));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Past the park's berm: hazy hills, pylons, the GENERIC-CO plant, a drive-in, a cemetery, a quarry

const HW = 1500, HH = 190;
const backRidge = (x: number) => snap2(HH - 100 + wave(x, HW, 1.7) * 26 + wave(x, HW, 4.9, 2) * 7);
const midRidge = (x: number) => snap2(HH - 60 + wave(x, HW, 3.1) * 14 - Math.abs(wave(x, HW, 1.3, 3)) * 6);
const paintCountry = (g: Ctx, tod: TimeOfDay) => {
  const Tb = farCol(tod, 0.6), Tm = farCol(tod, 0.42), lamps = tod.lamps > 0.3;
  // (the park's neighbors far off over the hills, deep in the haze: Spooky Land back left, Hollywood Land on the right)
  farSpooky(g, farCol(tod, 0.68), 330, HH - 92, lamps);
  farHollywood(g, farCol(tod, 0.68), 1000, HH - 94);
  const BR = ['#8A88AE', '#9C9CBC', '#B2B4C8', '#CACCD4'].map(Tb);
  for (let x = 0; x < HW; x += 2) { const y = backRidge(x), lt = backRidge(x + 4) < backRidge(x - 4); box(g, x, y, 2, HH - y, BR[lt ? 2 : 1]); if (lt) box(g, x, y, 2, 2, BR[3]); else checker(g, x, y + 2, 2, 4, BR[0], 0, 1); }
  // (pylons marching over the back ridge, the wires sagging between)
  const pyl: [number, number][] = [];
  for (let x = 40; x < HW; x += 150) { const y = backRidge(x) + 4; pyl.push([x, y]); const P = Tb('#6A6A84');
    for (let k = 0; k < 40; k += 2) { const w = 2 + k * 0.22; box(g, x - w, y - 40 + k, 1, 2, P); box(g, x + w, y - 40 + k, 1, 2, P); if (k % 6 === 0) box(g, x - w, y - 40 + k, w * 2, 1, P); }
    box(g, x - 9, y - 36, 18, 1, P); box(g, x - 7, y - 30, 14, 1, P); }
  g.strokeStyle = Tb('#7A7894'); g.lineWidth = 1;
  for (let i = 0; i + 1 < pyl.length; i++) for (const dy of [-36, -30]) { const [a, ay] = pyl[i], [b, by] = pyl[i + 1]; g.beginPath(); g.moveTo(a + (dy === -36 ? -9 : -7), ay + dy); g.quadraticCurveTo((a + b) / 2, Math.max(ay, by) + dy + 10, b + (dy === -36 ? -9 : -7), by + dy); g.stroke(); }
  // (the mid hills: scrub in steps)
  const MR = ['#6E8A5E', '#7E9C6A', '#98B47E', '#B6CC94'].map(Tm);
  for (let x = 0; x < HW; x += 2) { const y = midRidge(x), lt = midRidge(x + 4) < midRidge(x - 4); box(g, x, y, 2, HH - y, MR[lt ? 2 : 1]); if (lt) box(g, x, y, 2, 2, MR[3]); }
  for (let x = 4; x < HW; x += 9) { if (hash(x * 0.61) < 0.5) continue; const y = midRidge(x) + 4 + hash(x) * 10, r = 4 + hash(x * 3) * 4; pixelBlob(g, x, y, r, r * 0.8, MR[0]); pixelBlob(g, x - 1, y - 1, r * 0.8, r * 0.6, MR[1]); box(g, x - r * 0.4, y - r * 0.5, 2, 2, MR[3]); }
  // ---- THE GENERIC-CO PLANT: sheds with sawtooth roofs, three striped stacks, smoke banded off them, the tank
  { const px = 120, base = midRidge(200) + 24, S = st3(Tm, '#A8A0B0'), Rd = st3(Tm, '#B8283A');
    for (let i = 0; i < 4; i++) { const sx = px + i * 34; box(g, sx, base - 22, 32, 22, S[1]); box(g, sx, base - 22, 2, 22, S[2]); box(g, sx + 28, base - 22, 4, 22, S[0]); for (let k = 0; k < 4; k++) tri(g, [sx + k * 8, base - 22, sx + k * 8 + 8, base - 22, sx + k * 8 + 8, base - 30], k % 2 ? S[2] : S[1]); for (let k = 0; k < 3; k++) box(g, sx + 4 + k * 9, base - 14, 6, 5, win(tod, i * 9 + k + 300, Tm('#5A6A8A'))); }
    for (let k = 0; k < 3; k++) { const sx = px + 20 + k * 40, top = base - 70 - k * 8; for (let y = top; y < base - 22; y += 2) box(g, sx, y, 7, 2, ((y - top) >> 3) % 2 ? Rd[1] : Tm('#F0ECE8')); box(g, sx, top, 2, base - 22 - top, Rd[2]); if (lamps) box(g, sx + 2, top - 2, 3, 2, '#FF4040');
      for (let j = 0; j < 6; j++) { const r = 5 + j * 2.4, sm = Tm(j < 2 ? '#C8C0C8' : '#B4AEBC'); pixelBlob(g, sx + 4 + j * 9, top - 6 - j * 5, r, r * 0.7, sm); pixelBlob(g, sx + 2 + j * 9, top - 8 - j * 5, r * 0.6, r * 0.4, Tm('#E4E0E8')); } }
    oval(g, px + 150, base - 16, 22, 16, S[0]); oval(g, px + 149, base - 17, 21, 15, S[1]); oval(g, px + 143, base - 22, 8, 6, S[2]);
    box(g, px + 132, base - 22, 36, 9, Tm('#F2C030')); signText(g, 'GC', px + 150, base - 14, tinyB(Tm('#1F2937'))); }
  // ---- a drive-in's screen on its scaffold, the lot's rows, a picture on it (a cat and a mouse, mallets)
  { const dx = 470, base = midRidge(520) + 26, S = Tm('#E8E4EC');
    for (const lx of [dx + 8, dx + 60]) { box(g, lx, base - 34, 3, 34, Tm('#6A6488')); for (let y = base - 32; y < base; y += 8) { g.strokeStyle = Tm('#6A6488'); g.lineWidth = 1; g.beginPath(); g.moveTo(lx - 6, y); g.lineTo(lx + 9, y + 8); g.stroke(); } }
    box(g, dx - 1, base - 72, 74, 40, Tm(INK)); box(g, dx, base - 71, 72, 38, lamps ? '#C8D8F0' : S);
    if (lamps) { disc(g, dx + 24, base - 50, 7, '#E8902E'); disc(g, dx + 48, base - 48, 6, '#9A968E'); box(g, dx + 30, base - 66, 3, 14, '#8A5A30'); box(g, dx + 26, base - 70, 10, 6, '#C89A5A'); }
    for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { const cx2 = dx - 20 + k * 13 + r * 4, cy = base + 4 + r * 6; box(g, cx2, cy, 8, 3, Tm(['#C8283E', '#2A5AB0', '#E8E4D8', '#2A8A5A'][(k + r) % 4])); box(g, cx2 + 2, cy - 1, 4, 1, Tm('#A8C8E8')); }
    signText(g, 'DRIVE-IN', dx + 36, base - 76, tiny(Tm('#C8283E'))); }
  // ---- a cemetery on its knoll: rows of little headstones, a crypt, a dead tree, the iron fence
  { const cx = 820, base = midRidge(860) + 18, St = st3(Tm, '#C8C4CC');
    for (let r = 0; r < 3; r++) for (let k = 0; k < 10; k++) { const sx = cx + k * 10 + r * 5, sy = base - 4 + r * 6; box(g, sx, sy - 6, 5, 6, St[1]); box(g, sx, sy - 7, 5, 1, St[2]); box(g, sx + 4, sy - 6, 1, 6, St[0]); if ((k + r) % 4 === 0) { box(g, sx + 2, sy - 10, 1, 4, St[1]); box(g, sx + 1, sy - 9, 3, 1, St[1]); } }
    box(g, cx + 110, base - 22, 22, 22, St[1]); tri(g, [cx + 108, base - 22, cx + 121, base - 32, cx + 134, base - 22], St[2]); box(g, cx + 116, base - 14, 10, 14, Tm('#3A3448'));
    g.strokeStyle = Tm('#4A3A3A'); g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 14, base); g.lineTo(cx - 12, base - 30); g.lineTo(cx - 20, base - 40); g.moveTo(cx - 12, base - 24); g.lineTo(cx - 2, base - 36); g.stroke();
    for (let k = 0; k < 40; k++) box(g, cx - 6 + k * 4, base + 14, 1, 6, Tm('#3A3448')); box(g, cx - 6, base + 15, 160, 1, Tm('#3A3448')); }
  // ---- a quarry: terraced steps cut into the hill, a crane, a dump truck
  { const qx = 1150, base = midRidge(1200) + 30, Q = st3(Tm, '#C8B49A');
    for (let k = 0; k < 4; k++) { box(g, qx + k * 12, base - 40 + k * 10, 180 - k * 24, 10, Q[k % 2 ? 0 : 1]); box(g, qx + k * 12, base - 40 + k * 10, 180 - k * 24, 1, Q[2]); }
    box(g, qx + 150, base - 70, 2, 30, Tm('#5A5470')); g.strokeStyle = Tm('#5A5470'); g.lineWidth = 1; g.beginPath(); g.moveTo(qx + 151, base - 70); g.lineTo(qx + 110, base - 56); g.lineTo(qx + 110, base - 40); g.stroke();
    box(g, qx + 60, base - 18, 14, 6, Tm('#F2C030')); box(g, qx + 72, base - 20, 6, 8, Tm('#F2C030')); disc(g, qx + 63, base - 11, 2, Tm(INK)); disc(g, qx + 74, base - 11, 2, Tm(INK)); }
  // (cul-de-sacs in the gaps)
  for (let i = 0; i < 50; i++) {
    const hx = 20 + i * 30 + hash(i * 3.3) * 12;
    if ((hx > 100 && hx < 320) || (hx > 440 && hx < 560) || (hx > 790 && hx < 980) || (hx > 1130 && hx < 1350)) continue;
    const hy = midRidge(hx) + 22 + (i % 3) * 7, roof = Tm(['#9A5A4A', '#6A6A7A', '#8A7A5A', '#5A6A8A'][i % 4]), wall = Tm(['#E8DCC8', '#D4DCE4', '#F0E4D0'][i % 3]);
    box(g, hx - 7, hy - 5, 14, 6, wall); box(g, hx + 3, hy - 5, 4, 6, Tm(mix(['#E8DCC8', '#D4DCE4', '#F0E4D0'][i % 3], INK, 0.2)));
    tri(g, [hx - 9, hy - 5, hx - 4, hy - 10, hx + 4, hy - 10, hx + 9, hy - 5], roof);
    box(g, hx - 5, hy - 3, 2, 2, win(tod, i * 7, Tm('#5A6A8A'))); box(g, hx + 1, hy - 3, 2, 2, win(tod, i * 7 + 1, Tm('#5A6A8A')));
  }
  mist(g, HW, HH - 70, 70, skyAt(0.92, tod), 0.0, 0.4, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// The rest of Cartoon Land: the big-kid zone back the way he came, the studios, the White House, Sillyville; ahead,
// DAD GUY LIVE!

const PW = 2200, PH = 270, PG = PH - 26;
const paintPark = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.3), lamps = tod.lamps > 0.3;
  box(g, 0, PG, PW, PH - PG, T('#6A9658')); box(g, 0, PG, PW, 2, T('#8ABE76'));
  for (let x = 0; x < PW; x += 4) box(g, x, PG + 6 + ((x / 4) % 3) * 4, 2, 1, T('#5A864A'));
  // ---- SILLYVILLE, far back: drooping domes and Truffula tufts
  for (let i = 0; i < 6; i++) {
    const x = 20 + i * 30 + hash(i) * 8, h = 30 + hash(i * 2.7) * 34, w = 22 + hash(i * 5.1) * 10, Wl = st3(T, ['#F8C8DC', '#FCE69A', '#BEDCF6', '#C2ECCE', '#DCCCF6'][i % 5]), R = st3(T, ['#E2465E', '#7C5CC8', '#24A69C', '#F2822A'][i % 4]);
    box(g, x, PG - h, w, h, Wl[1]); box(g, x, PG - h, 2, h, Wl[2]); box(g, x + w - 4, PG - h, 4, h, Wl[0]);
    g.fillStyle = R[1]; g.beginPath(); g.moveTo(x - 3, PG - h + 1); g.quadraticCurveTo(x + w / 2, PG - h - w * 1.2, x + w * 0.9, PG - h - w * 0.8); g.quadraticCurveTo(x + w * 0.7, PG - h - w * 0.4, x + w + 3, PG - h + 1); g.closePath(); g.fill();
    disc(g, x + w * 0.9, PG - h - w * 0.8, 2.5, T('#FFFFFF'));
    for (let k = 0; k < 2; k++) box(g, x + 6 + k * 9, PG - h + 10, 4, 5, win(tod, i * 3 + k, T('#7AAEDC')));
  }
  // ---- THE STUDIOS' logo on its lattice; THE WACKY WHITE HOUSE with Socks over the roof
  { const lx = 210, ly = PG - 110; box(g, lx, ly + 22, 2, 88, T('#5A5470')); box(g, lx + 100, ly + 22, 2, 88, T('#5A5470')); for (let k = 0; k < 8; k++) { g.strokeStyle = T('#6A6488'); g.lineWidth = 1; g.beginPath(); g.moveTo(lx + (k % 2) * 100, ly + 24 + k * 11); g.lineTo(lx + ((k + 1) % 2) * 100, ly + 35 + k * 11); g.stroke(); }
    box(g, lx - 6, ly, 114, 22, T(INK)); box(g, lx - 5, ly + 1, 112, 20, T('#6D28D9')); box(g, lx - 5, ly + 1, 112, 2, T('#9F7AEA'));
    signText(g, 'CARTOON LAND', lx + 51, ly + 10, tiny(T('#FDE047'), T(INK))); signText(g, 'STUDIOS', lx + 51, ly + 19, tiny(T('#FFFFFF'), T(INK)));
    if (lamps) for (let k = 0; k < 10; k++) box(g, lx - 4 + k * 11, ly - 2, 2, 2, k % 2 ? '#FFF0B0' : '#FFB0E0'); }
  { const hx = 410, base = PG, Wh = st3(T, '#F4F2F8');
    box(g, hx - 60, base - 40, 120, 40, Wh[1]); box(g, hx - 60, base - 40, 120, 2, Wh[2]); box(g, hx + 48, base - 40, 12, 40, Wh[0]);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 9; k++) box(g, hx - 54 + k * 12, base - 34 + r * 16, 5, 9, win(tod, k + 200 + r * 20, T('#5A6A9A')));
    tri(g, [hx - 22, base - 40, hx, base - 54, hx + 22, base - 40], Wh[1]); for (let k = 0; k < 5; k++) box(g, hx - 18 + k * 8, base - 38, 3, 26, Wh[0]);
    oval(g, hx, base - 56, 18, 18, T(INK)); oval(g, hx, base - 56, 16, 16, Wh[1]); oval(g, hx - 6, base - 62, 5, 9, Wh[2]); box(g, hx - 18, base - 56, 36, 10, Wh[1]);
    // (Socks peeking over the roof: black ears and eyes)
    for (const s of [-1, 1]) tri(g, [hx + 40 + s * 9, base - 46, hx + 40 + s * 8, base - 58, hx + 40 + s * 2, base - 50], T('#22202C'));
    oval(g, hx + 40, base - 46, 11, 8, T('#22202C')); for (const s of [-1, 1]) { oval(g, hx + 40 + s * 4, base - 47, 2, 3, T('#9EE64A')); }
    box(g, hx - 1, base - 92, 1, 20, T('#5A5470')); box(g, hx, base - 92, 12, 7, T('#E2465E')); box(g, hx, base - 92, 4, 4, T('#3A5AB0')); }
  // ---- THE BIG-KID ZONE: the Hurl-A-Whirl's hub and arms, the halfpipe's curve, the inflatable Rad Rat, a neon bolt,
  // the slime bucket tipping
  { const zx = 560, base = PG;
    // (the zone's roofs: boxy, Memphis bands)
    for (let i = 0; i < 7; i++) { const x = zx + i * 52, h = 30 + hash(i * 4.4) * 30, Wl = st3(T, ['#B9A4F0', '#7EE0D2', '#F8A8D0', '#FCE07A'][i % 4]), Bd = st3(T, ['#7C3AED', '#0D9488', '#DB2777', '#EA580C'][i % 4]);
      box(g, x, base - h, 48, h, Wl[1]); box(g, x, base - h, 2, h, Wl[2]); box(g, x + 44, base - h, 4, h, Wl[0]); for (let k = 0; k < 48; k += 2) box(g, x + k, base - h + 8 + Math.abs(((k / 2) % 8) - 4), 2, 4, Bd[1]); for (let k = 0; k < 3; k++) box(g, x + 6 + k * 14, base - 12, 8, 7, win(tod, i * 5 + k + 400, T('#5A7AAA'))); }
    // (the Hurl-A-Whirl: a striped column, a clown's head on top, its arms out with the cars)
    const wx = zx + 70, wt = base - 130; for (let y = wt + 20; y < base - 30; y += 2) box(g, wx - 5, y, 10, 2, ((y >> 2) % 2) ? T('#E2465E') : T('#FFF4F8'));
    [-0.5, 0.2, 0.9, 1.6, 2.3, 3.0].forEach((a, i) => { const ex = wx + Math.cos(a) * 46, ey = wt + 36 + Math.sin(a) * 12; g.strokeStyle = T('#5A5470'); g.lineWidth = 2; g.beginPath(); g.moveTo(wx, wt + 30); g.lineTo(ex, ey); g.stroke(); oval(g, ex, ey + 4, 6, 5, T(INK)); oval(g, ex, ey + 4, 5, 4, T(['#F2D23A', '#5EC4F4', '#84CC16'][i % 3])); });
    oval(g, wx, wt + 14, 16, 16, T(INK)); oval(g, wx, wt + 14, 15, 15, T('#F8F0E8')); disc(g, wx, wt + 18, 4, T('#E2465E')); for (const s of [-1, 1]) disc(g, wx + s * 14, wt + 8, 7, T('#F28A2E'));
    // (the halfpipe)
    const hx = zx + 190; g.fillStyle = T('#B4B0BC'); g.beginPath(); g.moveTo(hx, base - 40); g.quadraticCurveTo(hx + 10, base, hx + 40, base); g.lineTo(hx + 70, base); g.quadraticCurveTo(hx + 100, base, hx + 110, base - 40); g.lineTo(hx + 110, base); g.lineTo(hx, base); g.closePath(); g.fill(); box(g, hx - 2, base - 42, 6, 2, T('#E8E4F0')); box(g, hx + 106, base - 42, 6, 2, T('#E8E4F0'));
    // (the inflatable Rad Rat on a roof: a fat grey rat in shades, a backwards cap)
    const rx = zx + 290, ry = base - 66; oval(g, rx, ry, 18, 24, T(INK)); oval(g, rx, ry, 17, 23, T('#9A96A8')); oval(g, rx - 5, ry - 8, 6, 10, T('#BAB6C8')); oval(g, rx, ry - 26, 13, 12, T('#9A96A8')); for (const s of [-1, 1]) disc(g, rx + s * 11, ry - 36, 6, T('#F4A6C0')); box(g, rx - 10, ry - 28, 20, 4, T('#1F2937')); box(g, rx - 12, ry - 38, 22, 5, T('#DB2777'));
    // (a neon bolt; the slime bucket tipping)
    tri(g, [zx + 330, base - 110, zx + 346, base - 110, zx + 338, base - 90, zx + 350, base - 90, zx + 328, base - 60, zx + 334, base - 84, zx + 324, base - 84], lamps ? '#FEF08A' : T('#F2D23A'));
    g.save(); g.translate(zx + 20, base - 76); g.rotate(-0.4); box(g, -14, -18, 28, 26, T(INK)); box(g, -13, -17, 26, 24, T('#2563EB')); box(g, -13, -17, 26, 4, T('#60A5FA')); g.restore();
    for (let k = 0; k < 4; k++) box(g, zx + 26 + k * 3, base - 74 + k * 4, 4, 30 - k * 4, T('#84CC16')); }
  // ---- ahead: DAD GUY LIVE!'s band shell over the bowl, its light towers, the UBX AMPHITHEATER sign
  { const cx = 1150, base = PG - 16, rx = 110, ry = 104;
    const bands = ['#F3E9D2', '#7DB7E8', '#F3E9D2', '#5B9BD5', '#F3E9D2', '#7DB7E8'];
    for (let i = 0; i < bands.length; i++) { const k = 1 - i / bands.length; g.fillStyle = T(INK); g.beginPath(); g.ellipse(cx, base, rx * k + 2, ry * k + 2, 0, Math.PI, 0); g.fill(); g.fillStyle = T(bands[i]); g.beginPath(); g.ellipse(cx, base, rx * k, ry * k, 0, Math.PI, 0); g.fill(); g.fillStyle = T(mix(bands[i], '#FFFFFF', 0.3)); g.beginPath(); g.ellipse(cx - rx * k * 0.5, base - ry * k * 0.8, rx * k * 0.3, 2, -0.4, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = T('#2A2440'); g.beginPath(); g.ellipse(cx, base, rx * 0.17, ry * 0.17, 0, Math.PI, 0); g.fill();
    if (lamps) for (let k = 0; k < 26; k++) { const a = Math.PI + (k / 25) * Math.PI; box(g, cx + Math.cos(a) * rx - 1, base + Math.sin(a) * ry - 1, 2, 2, k % 2 ? '#FFF0B0' : '#FFC860'); }
    box(g, cx - 64, base - 50, 128, 16, T(INK)); box(g, cx - 63, base - 49, 126, 14, T('#B91C1C')); box(g, cx - 63, base - 49, 126, 2, T('#E2465E'));
    signText(g, 'DAD GUY LIVE!', cx, base - 39, tiny(T('#FFFFFF'), T(INK)));
    g.fillStyle = T('#B4ACA0'); g.beginPath(); g.moveTo(cx - 170, PG); g.quadraticCurveTo(cx, PG - 38, cx + 170, PG); g.closePath(); g.fill();
    for (let k = 0; k < 5; k++) { g.strokeStyle = T('#D8D0C4'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 156 + k * 8, PG - 2 - k * 2); g.quadraticCurveTo(cx, PG - 34 + k * 6, cx + 156 - k * 8, PG - 2 - k * 2); g.stroke(); }
    for (const lx of [cx - 160, cx + 160]) { box(g, lx - 2, PG - 170, 4, 170, T('#6A6488')); for (let y = PG - 166; y < PG; y += 10) { g.strokeStyle = T('#6A6488'); g.lineWidth = 1; g.beginPath(); g.moveTo(lx - 4, y); g.lineTo(lx + 4, y + 10); g.stroke(); } box(g, lx - 12, PG - 180, 24, 12, T('#3A3450')); for (let k = 0; k < 6; k++) box(g, lx - 10 + (k % 3) * 7, PG - 178 + Math.floor(k / 3) * 5, 5, 4, lamps ? '#FFF6D0' : T('#C8C4D8')); }
    // (the UBX AMPHITHEATER's sign on its pole; the beer garden's umbrellas)
    const sx = cx + 230; box(g, sx - 2, PG - 120, 4, 120, T('#5A5470')); box(g, sx - 50, PG - 150, 100, 34, T(INK)); box(g, sx - 49, PG - 149, 98, 32, T('#1E3A8A')); box(g, sx - 49, PG - 149, 98, 3, T('#3B5BB8'));
    signText(g, 'UBX', sx, PG - 136, { sx: 2, sy: 1, bold: true, fill: T('#FDE047'), ink: T(INK) }); signText(g, 'AMPHITHEATER', sx, PG - 122, tiny(T('#FFFFFF')));
    for (let k = 0; k < 5; k++) { const ux = cx + 200 + k * 26; box(g, ux, PG - 26, 1, 26, T('#E8E4F0')); tri(g, [ux - 12, PG - 24, ux, PG - 34, ux + 12, PG - 24], T(k % 2 ? '#E2465E' : '#F2D23A')); box(g, ux - 6, PG - 12, 12, 2, T('#8A6A4A')); } }
  // ---- a DAD GUY billboard (the live show's: TODAY, his can up)
  { const bx = 1500, by = PG - 140, bw = 180, bh = 70, S = T('#5A5470');
    for (const lx of [bx + bw * 0.2, bx + bw * 0.8]) box(g, lx - 2, by + bh, 4, PG - by - bh, S);
    box(g, bx - 2, by - 2, bw + 4, bh + 4, T(INK));
    for (let k = 0; k < 3; k++) box(g, bx, by + k * 24, bw, 24, T(['#5EB4F4', '#4AA4EC', '#3A94E0'][k]));
    const S3 = st3(T, '#F0B8A0'); oval(g, bx + 34, by + 38, 20, 22, T(INK)); oval(g, bx + 34, by + 38, 19, 21, S3[1]); oval(g, bx + 28, by + 30, 7, 7, S3[2]); box(g, bx + 26, by + 34, 6, 2, T(INK)); box(g, bx + 37, by + 34, 6, 2, T(INK)); disc(g, bx + 34, by + 42, 4, T('#FB7185')); box(g, bx + 26, by + 50, 16, 3, T('#7F1D1D'));
    box(g, bx + 56, by + 26, 9, 16, T(INK)); box(g, bx + 57, by + 27, 7, 14, T('#D8D8E8')); box(g, bx + 57, by + 31, 7, 4, T('#C8283E'));
    signText(g, 'DAD GUY', bx + 120, by + 24, { sx: 2, sy: 2, bold: true, fill: [T('#FFFFFF'), T('#FDE047')], ink: T(INK) });
    signText(g, 'LIVE! TODAY', bx + 120, by + 44, tiny(T('#FFFFFF'))); signText(g, 'BEER GARDEN OPEN', bx + 120, by + 56, tiny(T('#FDE047')));
    box(g, bx - 4, by + bh + 2, bw + 8, 2, S);
    if (lamps) for (const lx of [bx + 30, bx + 90, bx + 150]) { box(g, lx - 3, by + bh + 4, 6, 3, '#FFF0C0'); } }
  // ---- the knockoff's own gate tower far back (the KILL-O-RAMA's pylon), a light tower, a gift dome
  { const kx = 1820, top = PG - 180, Rd = st3(T, '#B01C22');
    box(g, kx - 12, top + 40, 24, PG - top - 40, T(INK)); box(g, kx - 11, top + 41, 22, PG - top - 41, Rd[1]); box(g, kx - 11, top + 41, 5, PG - top - 41, Rd[2]); box(g, kx + 6, top + 41, 5, PG - top - 41, Rd[0]);
    for (let k = 0; k < 9; k++) signText(g, 'KILLORAMA'[k], kx, top + 52 + k * 12, tiny(T('#FFF0A0'), T(INK)));
    for (let k = 0; k < 14; k++) { box(g, kx - 13, top + 44 + k * 10, 2, 2, lamps && k % 2 ? '#FFF0B0' : T('#F2C84A')); box(g, kx + 11, top + 44 + k * 10, 2, 2, lamps && k % 2 === 0 ? '#FFF0B0' : T('#F2C84A')); }
    box(g, kx - 30, top + 32, 60, 10, T(INK)); box(g, kx - 29, top + 33, 58, 8, T('#F2C84A'));
    for (const [mx, a] of [[kx - 30, -0.5], [kx + 32, 0.5]] as const) { g.save(); g.translate(mx, top + 20); g.rotate(a); box(g, -1, -26, 3, 26, T('#8A5A30')); box(g, -8, -36, 17, 11, T(INK)); box(g, -7, -35, 15, 9, T('#C89A5A')); g.restore(); }
    oval(g, kx, top + 18, 16, 14, T(INK)); oval(g, kx, top + 18, 15, 13, T('#E8902E')); for (const s of [-1, 1]) tri(g, [kx + s * 14, top + 12, kx + s * 12, top - 2, kx + s * 4, top + 6], T('#E8902E'));
    const gx = 1990, gt = PG - 60; box(g, gx - 36, gt, 72, 60, T('#F8E0EC')); box(g, gx + 24, gt, 12, 60, T('#E0C0D2'));
    g.save(); g.beginPath(); g.moveTo(gx - 40, gt); g.bezierCurveTo(gx - 54, gt - 46, gx - 6, gt - 46, gx, gt - 76); g.bezierCurveTo(gx + 6, gt - 46, gx + 54, gt - 46, gx + 40, gt); g.closePath(); g.clip();
    for (let k = -54; k < 54; k += 12) { g.fillStyle = T(((k / 12) | 0) % 2 ? '#B01C22' : '#FFF4E8'); g.fillRect(gx + k, gt - 80, 6, 82); }
    g.restore(); signText(g, 'GIFTS', gx, gt + 44, tiny(T('#B91C4A')));
    const lx = 2120; for (let y = PG - 190; y < PG; y += 2) box(g, lx - 2 + ((y >> 2) % 2), y, 3, 2, T('#7A7494')); box(g, lx - 14, PG - 202, 28, 14, T('#3A3450')); for (let k = 0; k < 8; k++) box(g, lx - 12 + (k % 4) * 6, PG - 200 + Math.floor(k / 4) * 6, 4, 4, lamps ? '#FFF6D0' : T('#C8C4D8')); }
  // ---- trees (red and orange puffs, the odd dead one) and bunting with bones
  for (let x = 8; x < PW; x += 22) {
    const hs = hash(x * 0.41); if (hs < 0.3) continue;
    const h = 18 + Math.floor(hash(x * 1.3) * 24), col = ['#DC3A3A', '#F28A2E', '#F2C030', '#6CCC6A', '#B01C22'][Math.floor(hash(x * 2.1) * 5)], R = [T(mix(col, INK, 0.35)), T(col), T(mix(col, '#FFFFFF', 0.4))];
    if (hs > 0.9) { g.strokeStyle = T('#4A3A3A'); g.lineWidth = 2; g.beginPath(); g.moveTo(x, PG); g.lineTo(x + 1, PG - h); g.lineTo(x - 5, PG - h - 8); g.moveTo(x + 1, PG - h * 0.7); g.lineTo(x + 8, PG - h - 4); g.stroke(); continue; }
    box(g, x, PG - h, 2, h, T('#6A4A3A')); pixelBlob(g, x + 1, PG - h - 4, 7, 7, R[0]); pixelBlob(g, x, PG - h - 5, 6, 6, R[1]); pixelBlob(g, x - 2, PG - h - 7, 2, 2, R[2]);
  }
  for (let k = 0; k < 13; k++) { const x0 = 30 + k * 170, x1 = x0 + 74, y = PG - 58 - hash(k) * 30; for (let t = 0; t <= 1; t += 0.06) { const xx = x0 + (x1 - x0) * t, yy = y + Math.sin(t * Math.PI) * 10; box(g, xx, yy, 1, 1, T('#5A4A6A')); if (Math.round(t / 0.06) % 2) { g.fillStyle = T(['#B01C22', '#F2D23A', '#F4ECD8', '#1F2937'][Math.round(t / 0.12) % 4]); g.beginPath(); g.moveTo(xx - 2, yy); g.lineTo(xx + 2, yy); g.lineTo(xx, yy + 4); g.closePath(); g.fill(); } } }
  if (lamps) for (let x = 40; x < PW; x += 90) { box(g, x, PG - 26, 1, 26, T('#3A3450')); box(g, x - 1, PG - 29, 3, 3, '#FFE0A0'); }
  hazeBands(g, 0, PG - 90, PW, 90, skyAt(0.9, tod), 0.0, 0.18, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// The knockoff's own roofs past the path: the show's buildings and its giant props

const RW = 1900, RH = 330, RG = RH - 40;
type Prop = 'mallet' | 'anvil' | 'cleaver' | 'skulltank' | 'punchy' | 'ears' | 'dynamite' | 'crates' | 'coaster' | 'search' | 'bones' | 'tnt';
interface Roof { x: number; w: number; h: number; prop: Prop; seed: number }
const PROPS: Prop[] = ['mallet', 'search', 'skulltank', 'crates', 'anvil', 'ears', 'coaster', 'dynamite', 'punchy', 'bones', 'cleaver', 'search', 'tnt', 'anvil'];
const ROOFS: Roof[] = (() => {
  const out: Roof[] = [];
  let x = 4, i = 0;
  while (x < RW - 70) {
    const s = i * 11 + 5, w = 76 + Math.floor(hash(s * 1.7) * 70);
    out.push({ x, w, h: 70 + Math.floor(hash(s * 2.3) * 84), prop: PROPS[i % PROPS.length], seed: s });
    x += w + 8 + Math.floor(hash(s * 3.1) * 14); i++;
  }
  return out;
})();
const RWALLS = ['#C8323A', '#E8B424', '#3A3040', '#EADFC0', '#D86A3A', '#F0C8B0'];
const RBANDS = ['#1F1A24', '#B01C22', '#E8B424', '#7A0E14', '#F4ECD8'];
const paintRoofs = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.14), lamps = tod.lamps > 0.3, BL = st3(T, '#9A1A20');
  box(g, 0, RG - 10, RW, RH - RG + 10, T('#8A7E8E'));
  for (const r of ROOFS) {
    const x = r.x, w = r.w, top = RG - r.h, wall = RWALLS[((Math.floor(r.seed) % RWALLS.length) + RWALLS.length) % RWALLS.length], band = RBANDS[((Math.floor(r.seed * 3) % RBANDS.length) + RBANDS.length) % RBANDS.length], Wl = st3(T, wall), Bd = st3(T, band);
    // (the box: inked, lit down its left, shaded right; a striped band; a mural of the heads on some; windows)
    box(g, x - 1, top - 1, w + 2, r.h + 1, T(INK)); box(g, x, top, w, r.h, Wl[1]);
    box(g, x, top, 4, r.h, Wl[2]); box(g, x + w - 10, top, 10, r.h, Wl[0]); checker(g, x + w - 12, top, 2, r.h, Wl[0], 0, 1);
    for (let k = 0; k < w; k += 8) box(g, x + k, top + r.h * 0.4, 4, 6, Bd[1]);
    box(g, x, top + r.h * 0.4 - 1, w, 1, Bd[0]); box(g, x, top + r.h * 0.4 + 6, w, 1, Bd[0]);
    if (r.seed % 3 === 1) {
      // (a mural: the cat's head and the mouse's, mallets crossed between; a splat)
      const my = top + r.h * 0.2, mx = x + w / 2;
      oval(g, mx - 14, my, 9, 8, T(INK)); oval(g, mx - 14, my, 8, 7, T('#EA8A2E')); oval(g, mx - 11, my + 2, 4, 3, T('#FFF4E0')); for (const s of [-1, 1]) tri(g, [mx - 14 + s * 7, my - 3, mx - 14 + s * 6, my - 11, mx - 14 + s * 2, my - 6], T('#EA8A2E'));
      oval(g, mx + 14, my, 8, 7, T(INK)); oval(g, mx + 14, my, 7, 6, T('#A8A29E')); for (const s of [-1, 1]) { disc(g, mx + 14 + s * 7, my - 7, 5, T(INK)); disc(g, mx + 14 + s * 7, my - 7, 4, T('#F9A8D4')); }
      box(g, mx - 2, my - 12, 4, 6, T('#C89A5A')); disc(g, mx, my + 8, 3, BL[1]);
    }
    for (let k = 0; k < Math.floor((w - 16) / 18); k++) { box(g, x + 10 + k * 18, RG - 24, 10, 12, T(INK)); box(g, x + 11 + k * 18, RG - 23, 8, 10, win(tod, r.seed * 5 + k, T('#5A7AAA'))); box(g, x + 11 + k * 18, RG - 23, 8, 2, T('#C8E4F8')); }
    // (the parapet, blood dripping off it)
    box(g, x - 3, top - 6, w + 6, 6, T(INK)); box(g, x - 2, top - 5, w + 4, 4, Bd[1]); box(g, x - 2, top - 5, w + 4, 1, Bd[2]);
    for (let k = 0; k < 5; k++) { const dx = x + hash(r.seed + k) * w, l = 4 + hash(r.seed * 2 + k) * 18; box(g, dx, top - 1, 3, l, BL[1]); box(g, dx, top - 1, 1, l - 2, BL[2]); box(g, dx - 1, top + l - 1, 5, 3, BL[1]); }
    // (the prop on top)
    const cx = x + w / 2, pt = top - 6;
    if (r.prop === 'mallet') {
      // (a giant mallet driven into the roof at a slant: the roof cracked round it)
      g.save(); g.translate(cx, pt + 6); g.rotate(0.35); box(g, -4, -96, 8, 96, T(INK)); box(g, -3, -95, 6, 95, T('#C2853F')); box(g, -3, -95, 2, 95, T('#E0B17A'));
      box(g, -32, -128, 64, 36, T(INK)); box(g, -31, -127, 62, 34, T('#D9A066')); box(g, -31, -127, 62, 4, T('#EBC08E')); box(g, 22, -127, 9, 34, T('#B07A45')); for (const bx of [-22, 14]) box(g, bx, -127, 5, 34, T('#8B5A2B')); box(g, -31, -96, 62, 3, BL[1]);
      g.restore(); g.strokeStyle = T(INK); g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 10, pt + 6); g.lineTo(cx - 20, pt + 16); g.moveTo(cx + 6, pt + 6); g.lineTo(cx + 14, pt + 20); g.stroke();
    } else if (r.prop === 'anvil') {
      // (a giant anvil come down through the roof: the parapet buckled, GENERIC-CO on its waist)
      const S = st3(T, '#56566A'); const ay = pt + 10;
      tri(g, [cx - 40, ay, cx + 40, ay, cx + 30, ay - 12, cx + 16, ay - 18, cx + 18, ay - 34, cx + 42, ay - 36, cx + 42, ay - 50, cx - 22, ay - 50, cx - 50, ay - 40, cx - 18, ay - 34, cx - 16, ay - 18, cx - 30, ay - 12], T(INK));
      tri(g, [cx - 37, ay - 2, cx + 37, ay - 2, cx + 28, ay - 12, cx + 14, ay - 18, cx + 16, ay - 36, cx + 40, ay - 37, cx + 40, ay - 48, cx - 22, ay - 48, cx - 46, ay - 40, cx - 16, ay - 36, cx - 14, ay - 18, cx - 28, ay - 12], S[1]);
      box(g, cx - 22, ay - 48, 62, 3, S[2]); box(g, cx - 12, ay - 30, 24, 8, T('#F2C030')); signText(g, 'GC', cx, ay - 23, tiny(T(INK)));
      for (const s of [-1, 1]) { g.strokeStyle = T(INK); g.lineWidth = 1; g.beginPath(); g.moveTo(cx + s * 30, ay); g.lineTo(cx + s * 44, ay + 12); g.stroke(); }
    } else if (r.prop === 'cleaver') {
      // (a giant cleaver stuck in the roof, blade down)
      g.save(); g.translate(cx, pt + 8); g.rotate(-0.25); box(g, -30, -60, 60, 62, T(INK)); box(g, -29, -59, 58, 60, T('#C8C8D4')); box(g, -29, -59, 58, 6, T('#ECECF4')); box(g, 20, -59, 9, 60, T('#9A9AAA')); disc(g, -18, -48, 4, T('#5A5A6A')); box(g, -10, -24, 30, 10, BL[1]);
      box(g, -8, -94, 16, 36, T(INK)); box(g, -7, -93, 14, 34, T('#7C2D12')); for (let k = 0; k < 3; k++) box(g, -7, -88 + k * 10, 14, 2, T('#B4542A')); g.restore();
    } else if (r.prop === 'skulltank') {
      // (the skull water tank on its stilts: the dome a skull, its sockets dark, the jaw a catwalk)
      const B3 = st3(T, '#EADFC0'), ty = pt - 66;
      for (const s of [-1, 1]) { g.strokeStyle = T('#5A5470'); g.lineWidth = 3; g.beginPath(); g.moveTo(cx + s * 22, pt); g.lineTo(cx + s * 16, ty + 20); g.stroke(); }
      g.strokeStyle = T('#5A5470'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 20, pt - 10); g.lineTo(cx + 17, ty + 26); g.moveTo(cx + 20, pt - 10); g.lineTo(cx - 17, ty + 26); g.stroke();
      oval(g, cx, ty, 30, 28, T(INK)); oval(g, cx, ty, 29, 27, B3[1]); oval(g, cx - 8, ty - 9, 12, 9, B3[2]); box(g, cx - 18, ty + 18, 36, 12, T(INK)); box(g, cx - 17, ty + 18, 34, 11, B3[1]);
      oval(g, cx - 11, ty + 2, 8, 9, T('#2A1A2A')); oval(g, cx + 11, ty + 2, 8, 9, T('#2A1A2A')); tri(g, [cx, ty + 9, cx - 4, ty + 16, cx + 4, ty + 16], T('#2A1A2A'));
      for (let k = -3; k <= 3; k++) box(g, cx + k * 5, ty + 20, 1, 8, B3[0]);
      if (lamps) { disc(g, cx - 11, ty + 2, 3, '#FF6A3A'); disc(g, cx + 11, ty + 2, 3, '#FF6A3A'); }
    } else if (r.prop === 'punchy') {
      // (the inflatable Punchy slumped on the roof: the ginger head, the X'd eye, the torn ear, a tether)
      const G3 = st3(T, '#EA8A2E'), hy = pt - 38;
      oval(g, cx, pt - 12, 30, 16, T(INK)); oval(g, cx, pt - 12, 29, 15, G3[1]);
      tri(g, [cx - 30, hy - 10, cx - 26, hy - 44, cx - 8, hy - 26], T(INK)); tri(g, [cx - 28, hy - 12, cx - 25, hy - 40, cx - 10, hy - 26], G3[1]);
      tri(g, [cx + 8, hy - 26, cx + 22, hy - 46, cx + 24, hy - 36, cx + 30, hy - 10], T(INK)); tri(g, [cx + 10, hy - 26, cx + 22, hy - 42, cx + 23, hy - 34, cx + 28, hy - 12], G3[1]);
      oval(g, cx, hy, 30, 27, T(INK)); oval(g, cx, hy, 29, 26, G3[1]); oval(g, cx - 10, hy - 9, 10, 8, G3[2]); oval(g, cx + 8, hy + 10, 16, 10, T('#FFF4E0'));
      g.strokeStyle = T(INK); g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 14, hy - 6); g.lineTo(cx - 6, hy + 2); g.moveTo(cx - 6, hy - 6); g.lineTo(cx - 14, hy + 2); g.stroke();
      oval(g, cx + 10, hy - 3, 6, 7, T('#FFFFFF')); disc(g, cx + 11, hy - 2, 2, T(INK)); box(g, cx + 2, hy + 12, 14, 3, T('#7F1D1D'));
      g.strokeStyle = T('#5A5470'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx + 26, hy + 10); g.lineTo(cx + 40, pt); g.stroke();
    } else if (r.prop === 'ears') {
      // (a dome with Kicky's ears on top: grey, pink inside)
      const M3 = st3(T, '#A8A29E');
      g.fillStyle = T(INK); g.beginPath(); g.ellipse(cx, pt, 34, 30, 0, Math.PI, 0); g.fill(); g.fillStyle = M3[1]; g.beginPath(); g.ellipse(cx, pt, 33, 29, 0, Math.PI, 0); g.fill(); oval(g, cx - 12, pt - 18, 10, 6, M3[2]);
      for (const s of [-1, 1]) { disc(g, cx + s * 30, pt - 40, 20, T(INK)); disc(g, cx + s * 30, pt - 40, 19, M3[1]); disc(g, cx + s * 30 + 1, pt - 39, 12, T('#F9A8D4')); disc(g, cx + s * 30 - 4, pt - 46, 4, T('#FCD0E4')); }
    } else if (r.prop === 'dynamite') {
      // (a chimney like a giant stick of dynamite, its fuse up top lit, sparking)
      box(g, cx - 12, pt - 80, 24, 80, T(INK)); box(g, cx - 11, pt - 79, 22, 79, T('#C8283E')); box(g, cx - 11, pt - 79, 5, 79, T('#E8606A')); box(g, cx + 5, pt - 79, 6, 79, T('#8E1420'));
      box(g, cx - 11, pt - 46, 22, 10, T('#F4ECD8')); signText(g, 'TNT', cx, pt - 38, tiny(T('#B01C22')));
      g.strokeStyle = T(INK); g.lineWidth = 2; g.beginPath(); g.moveTo(cx, pt - 80); g.quadraticCurveTo(cx + 8, pt - 92, cx + 4, pt - 100); g.stroke();
      for (let k = 0; k < 6; k++) { const a = k * 1.05; box(g, cx + 4 + Math.cos(a) * 6, pt - 101 + Math.sin(a) * 6, 2, 2, k % 2 ? '#FDE047' : '#FFFFFF'); } disc(g, cx + 4, pt - 101, 3, '#FDE047');
    } else if (r.prop === 'crates') {
      // (a stack of GENERIC-CO crates on the roof)
      const C3 = st3(T, '#C8963E');
      for (const [ox, oy, s] of [[-34, 0, 30], [-2, 0, 30], [-18, -30, 30], [30, 0, 24]] as [number, number, number][]) { box(g, cx + ox - 1, pt + oy - s - 1, s + 2, s + 2, T(INK)); box(g, cx + ox, pt + oy - s, s, s, C3[1]); box(g, cx + ox, pt + oy - s, s, 2, C3[2]); box(g, cx + ox + s - 3, pt + oy - s, 3, s, C3[0]); g.strokeStyle = C3[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + ox + 2, pt + oy - s + 2); g.lineTo(cx + ox + s - 2, pt + oy - 2); g.stroke(); signText(g, 'GC', cx + ox + s / 2, pt + oy - s / 2 + 3, tiny(T('#1F2937'))); }
    } else if (r.prop === 'coaster') {
      // (the KILL-O-COASTER's loop over the roofs: the red track, its lattice supports, a train upside down at the top)
      const R3 = st3(T, '#C8283E'), ly = pt - 70;
      for (let k = 0; k < 64; k++) { const a = (k / 64) * Math.PI * 2, px = cx + Math.sin(a) * 40, py = ly - Math.cos(a) * 46; box(g, px - 3, py - 2, 6, 4, T(INK)); box(g, px - 2, py - 1, 4, 2, R3[1]); }
      for (const s of [-1, 1]) { box(g, cx + s * 30 - 2, ly + 20, 4, pt - ly - 20, T('#5A5470')); for (let y = ly + 24; y < pt; y += 10) { g.strokeStyle = T('#5A5470'); g.lineWidth = 1; g.beginPath(); g.moveTo(cx + s * 30 - 5, y); g.lineTo(cx + s * 30 + 5, y + 10); g.stroke(); } }
      for (let k = 0; k < 3; k++) { box(g, cx - 14 + k * 10, ly - 46, 9, 6, T('#F2C030')); box(g, cx - 12 + k * 10, ly - 40, 4, 3, T('#F0B8A0')); }
      box(g, cx - 40, ly + 40, 80, 12, T(INK)); box(g, cx - 39, ly + 41, 78, 10, R3[1]); signText(g, 'KILL-O-COASTER', cx, ly + 49, tiny(T('#FFF0A0')));
    } else if (r.prop === 'search') {
      // (a searchlight on the roof: its drum and yoke; a soft beam swinging up after dark)
      box(g, cx - 10, pt - 8, 20, 8, T('#3A3450')); g.save(); g.translate(cx, pt - 18); g.rotate(-0.5 + (r.seed % 4) * 0.25); box(g, -9, -10, 18, 20, T(INK)); box(g, -8, -9, 16, 18, T('#8A8AA0')); box(g, -8, -12, 16, 4, lamps ? '#FFF6D0' : T('#C8C4D8')); g.restore();
      if (lamps) { g.save(); g.translate(cx, pt - 24); g.rotate(-0.5 + (r.seed % 4) * 0.25); g.fillStyle = 'rgba(255,246,208,0.12)'; g.beginPath(); g.moveTo(-8, 0); g.lineTo(-40, -260); g.lineTo(40, -260); g.lineTo(8, 0); g.closePath(); g.fill(); g.restore(); }
    } else if (r.prop === 'bones') {
      // (a heap of giant cartoon bones on the roof, a skull on top)
      const B3 = st3(T, '#EADFC0');
      for (let k = 0; k < 5; k++) { g.save(); g.translate(cx - 30 + k * 14, pt - 6 - (k % 2) * 8); g.rotate(-0.6 + k * 0.32); box(g, -16, -3, 32, 6, T(INK)); box(g, -15, -2, 30, 4, B3[1]); for (const ex of [-16, 16]) for (const s of [-1, 1]) { disc(g, ex, s * 3, 5, T(INK)); disc(g, ex, s * 3, 4, B3[1]); } g.restore(); }
      oval(g, cx, pt - 30, 14, 13, T(INK)); oval(g, cx, pt - 30, 13, 12, B3[1]); oval(g, cx - 4, pt - 34, 5, 4, B3[2]); disc(g, cx - 5, pt - 28, 3.5, T('#2A1A2A')); disc(g, cx + 5, pt - 28, 3.5, T('#2A1A2A')); box(g, cx - 7, pt - 20, 14, 5, B3[1]);
    } else {
      // (a giant TNT plunger box: the handle up, wires off it)
      box(g, cx - 22, pt - 30, 44, 30, T(INK)); box(g, cx - 21, pt - 29, 42, 28, T('#8A5A2A')); box(g, cx - 21, pt - 29, 42, 3, T('#B88A4A')); signText(g, 'TNT', cx, pt - 12, tinyB(T('#C8283E')));
      box(g, cx - 2, pt - 62, 4, 32, T(INK)); box(g, cx - 18, pt - 66, 36, 6, T(INK)); box(g, cx - 17, pt - 65, 34, 4, T('#C8C8D4'));
      g.strokeStyle = T(INK); g.lineWidth = 1; g.beginPath(); g.moveTo(cx + 22, pt - 10); g.quadraticCurveTo(cx + 40, pt, cx + 60, pt - 4); g.stroke();
    }
    // (a rooftop billboard on some)
    if (r.seed % 5 === 3) {
      const bw = Math.min(w - 10, 100), bx = x + 5, by = top - 48, labels = ['SPLATTER TEES', 'AS SEEN ON DAD GUY!', 'THEY FIGHT!', 'OW!', 'P&K'], L = labels[((Math.floor(r.seed) % labels.length) + labels.length) % labels.length];
      box(g, bx + 10, by + 30, 3, 18, T('#5A5470')); box(g, bx + bw - 13, by + 30, 3, 18, T('#5A5470'));
      box(g, bx - 1, by - 1, bw + 2, 32, T(INK)); box(g, bx, by, bw, 30, T('#F4ECD8')); box(g, bx, by, bw, 2, T('#FFFFFF')); box(g, bx, by + 26, bw, 4, BL[1]);
      signText(g, L, bx + bw / 2, by + 18, { sx: 1, sy: L.length > 12 ? 1 : 2, bold: true, fill: [T('#E8474A'), T('#9A1A20')], ink: T(INK) });
    }
  }
  // (a fence of bones along their feet; red puff trees)
  const B3 = st3(T, '#EADFC0');
  box(g, 0, RG - 22, RW, 3, B3[0]);
  for (let x = 0; x < RW; x += 12) { box(g, x, RG - 30, 5, 30, B3[1]); box(g, x, RG - 30, 1, 30, B3[2]); disc(g, x + 1, RG - 31, 3, B3[1]); disc(g, x + 4, RG - 31, 3, B3[1]); }
  for (let x = 40; x < RW; x += 120) {
    const hgt = 40 + hash(x) * 22, col = ['#DC3A3A', '#F28A2E', '#B01C22'][Math.floor(hash(x * 2) * 3)], R = st3(T, col);
    box(g, x, RG - hgt, 4, hgt, T('#6A4A3A')); box(g, x, RG - hgt, 1, hgt, T('#8A6A4A'));
    pixelBlob(g, x + 2, RG - hgt - 12, 20, 16, R[0]); pixelBlob(g, x, RG - hgt - 14, 18, 14, R[1]); pixelBlob(g, x - 5, RG - hgt - 19, 8, 6, R[2]);
  }
  hazeBands(g, 0, RG - 60, RW, 60, skyAt(0.92, tod), 0.0, 0.2, 4);
};

// ---------------------------------------------------------------------------------------------------------------

export const drawItchyFar = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), hz = horizonY(state), cx = state.camera.x, f = state.frame;
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: hz, sun: [600, 104], moon: [180, 84], t: f, scroll: cx * 0.01 });
  tile(c, 'clouds', cx * 0.015 + f * 0.05, hz - 420, CH, CW, g => paintClouds(g, tod));
  drawPlane(c, state);
  // (the land rises behind the knockoff: the country, the rest of the park and the water tower stand up high enough to
  //  show over its own roofs and the fronts; the park laid from the section's start, in the order he's been and is
  //  going: the big-kid zone back left, DAD GUY LIVE! (next) ahead on the right)
  const up = LIFT, sx = cx - SECTIONS.itchy.x0;
  tile(c, 'country', sx * 0.03, hz - HH + 10 - up, HH, HW, g => paintCountry(g, tod));
  tile(c, 'park', sx * 0.07 + 400, hz - PH + 24 - up, PH, PW, g => paintPark(g, tod));
  box(c, 0, hz + 23 - up, W, H, farCol(tod, 0.3)('#6A9658'));
  // (the water tower up on its hill over the park, drifting across as he goes: the landmark, kept clear)
  const m = MONUMENT_AT.itchy;
  if (m) drawMonument(c, state, m, m.foot - 36 + (hz - 440) - up);
  const ry = hz + 34 - RG;
  tile(c, 'roofs', cx * 0.17, ry, RH, RW, g => paintRoofs(g, tod));
  box(c, 0, ry + RH - 1, W, H, farCol(tod, 0.14)('#8A7E8E'));
};
