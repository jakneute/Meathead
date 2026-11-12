// DAD GUY's place in hell (SLOTH): DAD GUY, LIVE IN HELL. He never got off the couch. Now he works: a live show every
// night, no reruns, no breaks, the real actors who played his family bolted to the track (rf/cartoon.ts). The sky's dead
// air, gray-blue static in bands, scanlines rolling down it; out past the bowl a mountain of old TVs, every one showing
// snow, broadcast towers blinking red over it, and HELL TV's billboard counting the shows (SHOW NO. 7,302,451. SHOWS
// LEFT: ALL OF THEM.); over the stage an ON AIR box that never goes dark; the banner's small line reads LIVE FROM HELL.
// NO RERUNS. EVER.
//
//   - the sky (screen space, the land's far off hidden): painted once; live: the far layer slid by the camera at the
//     bowl's horizon (cartoon/amphi/far.ts horizonY), the towers' lights, the scan bars, a few screens flickering;
//   - the banner's line and the ON AIR box (cartoon/amphi/stage.ts STAGE_HOOKS.bannerSub / .shell: at the shell's
//     depth, hung off it over the banner).

import type { GameState } from '../../../../m1/game/core/state';
import type { HellPlace } from '../defs';
import { horizonY } from '../../../cartoon/amphi/far';
import { pixelBlob } from '../../../../m1/game/render/pixelArt';
import { type Ctx, type Look, W, H, INK, h01, box, line, bake, strip, sign, bandedGradient, hazeBands, checker, signText, IRONK } from './kitPA';

const STATIC = ['#0A0C14', '#121620', '#1A202E', '#242C3E', '#323C52', '#46526A', '#5E6C86', '#8090AA'];
const CASE = ['#120E0A', '#221A12', '#36281A', '#4A3824', '#604A30', '#7A603E'];
const AIR = ['#3A0606', '#7A0E0E', '#C81E1E', '#FF4A3A', '#FFA090'];

// ---------------------------------------------------------------------------------------------------------------
// The sky: dead air

const paintSky = (g: Ctx) => {
  bandedGradient(g, 0, 0, W, H, ['#06080E', '#0A0E16', '#10141E', '#161C28', '#1E2634', '#283244', '#323E54', '#3C4A62', '#2A3446', '#1A2030'], 18);
  // (snow: the static, baked, thick near the horizon, thin up top)
  for (let k = 0; k < 2600; k++) { const x = h01(k * 1.37) * W, y = Math.pow(h01(k * 2.91), 0.6) * H * 0.9, c = h01(k * 7.3); box(g, x, y, c > 0.9 ? 2 : 1, 1, c > 0.7 ? STATIC[7] : c > 0.4 ? STATIC[5] : STATIC[3]); }
  // (scanlines, every other)
  for (let y = 0; y < H; y += 3) { g.fillStyle = 'rgba(4, 6, 10, 0.28)'; g.fillRect(0, y, W, 1); }
  for (let k = 0; k < 20; k++) { const x = h01(k * 4.4) * (W + 160) - 80, y = 230 + h01(k * 3.1) * 120; pixelBlob(g, x, y, 60 + h01(k) * 80, 6, '#0C1018'); }
};

/** The far layer (a tile 1100 wide, 220 tall, its foot at the horizon): the heap of TVs, the towers, the billboard. */
const TW = 1100, TH = 220;
const SCREENS: [number, number, number, number][] = [];
const tv = (g: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  const C = CASE;
  box(g, x - 1, y - 1, w + 2, h + 2, INK); box(g, x, y, w, h, C[2 + (seed % 3)]); box(g, x, y, w, 1, C[5]);
  const sx = x + 3, sy = y + 3, sw = w - (w > 26 ? 12 : 6), sh = h - 6;
  box(g, sx, sy, sw, sh, STATIC[2]);
  for (let k = 0; k < sw * sh * 0.25; k++) box(g, sx + h01(seed + k * 0.7) * sw, sy + h01(seed * 3 + k * 1.3) * sh, 1, 1, h01(seed + k) > 0.5 ? STATIC[6] : STATIC[4]);
  box(g, sx, sy, sw, 1, STATIC[7]);
  if (w > 26) { box(g, x + w - 7, y + 4, 4, 4, C[1]); box(g, x + w - 7, y + 10, 4, 2, C[1]); }
  if (seed % 4 === 0) { line(g, [[x + w / 2, y], [x + w / 2 - 8, y - 12]], IRONK[4], 1); line(g, [[x + w / 2, y], [x + w / 2 + 8, y - 12]], IRONK[4], 1); }
  if (seed % 3 === 0) SCREENS.push([sx, sy, sw, sh]);
};
const paintFar = (g: Ctx) => {
  SCREENS.length = 0;
  // (far hills: black, low)
  g.fillStyle = '#080A10'; g.beginPath(); g.moveTo(0, TH); for (let x = 0; x <= TW; x += 10) g.lineTo(x, TH - 30 - Math.sin(x * 0.008) * 12 - Math.sin(x * 0.021) * 6); g.lineTo(TW, TH); g.fill();
  // (the heap of TVs, stacked in a mountain, every one showing snow)
  const hx = 520, base = TH - 4;
  for (let r = 0; r < 9; r++) {
    const rowW = 360 - r * 38, y = base - (r + 1) * 22;
    for (let x = hx - rowW / 2; x < hx + rowW / 2 - 20; ) { const w = 22 + Math.round(h01(r * 13 + x) * 16); tv(g, x, y + Math.round(h01(x * 0.3 + r) * 4), w, 18 + (w > 30 ? 4 : 0), Math.round(r * 31 + x)); x += w + 1; }
  }
  // (a couch on the top: empty)
  const cy = base - 9 * 22 - 2;
  box(g, hx - 22, cy - 14, 44, 14, INK); box(g, hx - 21, cy - 13, 42, 12, '#5A3A20'); box(g, hx - 21, cy - 20, 8, 19, '#4A2E18'); box(g, hx + 13, cy - 20, 8, 19, '#4A2E18'); box(g, hx - 15, cy - 22, 30, 10, '#6A4626');
  hazeBands(g, 0, base - 60, TW, 60, '#1A2030', 0, 0.5, 5, 2);
  // (the broadcast towers: lattice, guyed; lights at their tops (live))
  for (const [tx, th] of [[150, 190], [880, 170], [1020, 140]] as const) {
    for (let y = base - th; y < base; y += 8) { const w = 2 + ((base - y) / th) * 10; line(g, [[tx - w, y], [tx + w, y + 8]], '#1A1E28', 1); line(g, [[tx + w, y], [tx - w, y + 8]], '#1A1E28', 1); }
    line(g, [[tx, base - th], [tx - 12, base]], '#222836', 1); line(g, [[tx, base - th], [tx + 12, base]], '#222836', 1);
    line(g, [[tx, base - th + 20], [tx - 60, base]], '#141820', 1); line(g, [[tx, base - th + 20], [tx + 60, base]], '#141820', 1);
  }
  // (HELL TV's billboard, on its legs: the show's count)
  const bx = 300, by = base - 150;
  for (const lx of [bx - 50, bx + 46]) { box(g, lx, by + 40, 5, 110, '#141820'); box(g, lx, by + 40, 1, 110, '#2A3040'); }
  const big: Look = { sx: 2, sy: 2, fill: [AIR[4], AIR[3], AIR[2]], gap: 1, shadow: INK };
  const sm: Look = { sx: 1, sy: 1, fill: '#E0E4F0', gap: 1 };
  sign(g, bx, by, [['HELL TV', big], ['DAD GUY LIVE', sm], ['SHOW NO. 7,302,451', sm], ['SHOWS LEFT: ALL OF THEM', sm]], '#10141E', IRONK, 6);
};
export const TOWER_TOPS: [number, number][] = [[150, 190], [880, 170], [1020, 140]];

const skyLive = (c: Ctx, state: GameState) => {
  const f = state.frame, hz = horizonY(state), off = state.camera.x * 0.05, y0 = hz - TH - 95;
  const cv = bake('rf4-ca-far', TW, TH, paintFar);
  strip(c, cv, off, y0);
  // (the dark ground on under the heap, down behind the bowl's rim)
  c.fillStyle = '#080A10'; c.fillRect(0, Math.round(y0 + TH - 1), W, H);
  const wx = (x: number) => { const v = ((x - off) % TW + TW) % TW; return [v, v + TW, v - TW].filter(u => u > -20 && u < W + 20); };
  // (the towers' lights, blinking out of step)
  for (let i = 0; i < TOWER_TOPS.length; i++) if (((f >> 5) + i) % 2 === 0) for (const x of wx(TOWER_TOPS[i][0])) { c.fillStyle = AIR[3]; c.fillRect(Math.round(x) - 1, Math.round(y0 + TH - 4 - TOWER_TOPS[i][1]) - 3, 3, 3); }
  // (a few of the screens flickering)
  for (let i = 0; i < SCREENS.length; i++) {
    if ((f + i * 11) % 23 > 2) continue;
    const [sx, sy, sw, sh] = SCREENS[i];
    for (const x of wx(sx)) { c.fillStyle = (f + i) % 2 ? '#8090AA' : '#2A3446'; c.fillRect(Math.round(x), Math.round(y0 + sy), sw, sh); }
  }
  // (a scan bar rolling down the sky)
  const sb = (f * 1.4) % (H + 60) - 30;
  c.fillStyle = 'rgba(128, 144, 170, 0.06)'; c.fillRect(0, Math.round(sb), W, 18);
};

export const cartoonPlace: HellPlace = {
  light: { dark: 0.32, shade: [8, 10, 24], grade: '#D0D8EE' },
  sky: { paint: paintSky, alpha: 1 },
  skyLive,
};

// ---------------------------------------------------------------------------------------------------------------
// Off the shell: the ON AIR box over the banner (world space, at the shell's depth: the caller's)

const paintOnAir = (g: Ctx, lit: boolean) => {
  box(g, 0, 0, 80, 26, INK); box(g, 1, 1, 78, 24, IRONK[3]); box(g, 1, 1, 78, 1, IRONK[5]); box(g, 75, 1, 4, 24, IRONK[1]);
  box(g, 5, 4, 70, 18, lit ? AIR[2] : AIR[0]);
  if (lit) { box(g, 5, 4, 70, 4, AIR[3]); checker(g, 5, 8, 70, 2, AIR[3], 0, 1); }
  signText(g, 'ON AIR', 40, 19, lit ? { sx: 2, sy: 2, bold: true, fill: '#FFFFFF', gap: 1 } : { sx: 2, sy: 2, bold: true, fill: AIR[1], gap: 1 });
  for (const rx of [3, 75]) for (const ry of [3, 21]) box(g, rx, ry, 2, 2, IRONK[5]);
};
export const drawOnAir = (c: Ctx, f: number, bx: number, by: number) => {
  const x = Math.round(bx - 40), y = Math.round(by - 40);
  for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(bx + s * 30, y - 30); c.lineTo(bx + s * 30, y); c.stroke(); }
  // (it never goes dark: a hum, a flutter now and then)
  const lit = (f % 97) > 3;
  c.drawImage(bake(`rf4-ca-onair-${lit ? 1 : 0}`, 80, 26, g => paintOnAir(g, lit)), x, y);
};
export const CARTOON_BANNER = 'LIVE FROM HELL. NO RERUNS. EVER.';

// (dev: a sheet)
export const cartoonSheet = (g: Ctx) => {
  g.drawImage(bake('rf4-ca-sky', W, H, paintSky), 0, 0);
  g.drawImage(bake('rf4-ca-far', TW, TH, paintFar), 0, 300, 800, 160);
  g.save(); g.translate(20, 20); paintOnAir(g, true); g.restore();
  g.save(); g.translate(120, 20); paintOnAir(g, false); g.restore();
};
