// The cartoon White House's far off (screen space: what's seen past the Truman Balcony and over the Rose Garden), every
// layer painted once for the hour into a tile and slid along (only the fountain's spray and the birds live):
//
//   the sky by the hour (a cartoon blue banded down to a warm haze, dithered between), fat cel cumulus with flat bottoms
//   and curled tails drifting; far off, THE SHOW'S WASHINGTON: the Washington Monument (its red lights after dark), the
//   Jefferson Memorial's dome and portico, the Capitol dome on its hill, the Old Executive Office Building's mansards
//   and chimneys, the Treasury's colonnade, rows of trees along the Mall in stepped puffs; nearer, the Ellipse and the
//   South Lawn: elms and magnolias, the South Fountain (live spray), the iron fence with its gilt spikes, tourists at it
//   (seeded, waving, cameras up), a Secret Service sedan, flags on poles; the hedges' tops along the garden's back.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { pixelBlob } from '../../../m1/game/render/pixelArt';
import { drawTodSky, timeOfDay, farTint, skyAt, hourMix, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { box, mix, hash, checker, stamp, INK, type Ctx } from '../kit';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
/** A tile `tw` wide (painted once for the hour), slid along by `off`, its top at y. */
const tile = (c: Ctx, key: string, off: number, y: number, h: number, tw: number, paint: (g: Ctx, tod: TimeOfDay) => void) => {
  const tod = timeOfDay(), k = `ct-wh1-${key}-${tod.key}-${fontReady() ? 'f' : 'n'}`;
  for (let x = -(((off % tw) + tw) % tw); x < W; x += tw) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, k, 0, 0, tw, h, g => paint(g, tod)); c.restore(); }
};
const farCol = (tod: TimeOfDay, k: number) => (col: string) => mix(farTint(hourMix(col, mix(col, '#8A5A7A', 0.2), mix(col, '#141832', 0.46), tod), 1, tod), skyAt(0.86, tod), k);
const lit = (tod: TimeOfDay, i: number, glass: string) => (tod.lamps > 0.3 ? (hash(i * 1.7) > 0.3 ? (hash(i * 3.1) > 0.5 ? '#FFE08A' : '#F6B860') : glass) : glass);

/** Where the horizon is on screen (it drifts down as the camera climbs onto the balcony). */
export const whHorizon = (state: GameState) => Math.round(430 + Math.max(-20, Math.min(90, (40 - state.camera.y) * 0.12)));

// ---------------------------------------------------------------------------------------------------------------
// Clouds

const CW = 1100, CH = 170;
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const C = ['#8C9ACC', '#B8C2E6', '#E2E6F8', '#FFFFFF'].map(c => cloudTint(c, tod));
  for (let i = 0; i < 7; i++) {
    const cx = (i * CW) / 7 + hash(i * 3.7) * 60, cy = 44 + hash(i * 5.3) * 86, s = 0.7 + hash(i * 7.1) * 0.7, puffs = 3 + Math.floor(hash(i * 1.3) * 4);
    for (const ox of [0, CW, -CW]) {
      for (const [L, dy, k] of [[0, 4, 1], [1, 0, 0.9], [2, -3, 0.7], [3, -6, 0.38]] as const) for (let p = 0; p < puffs; p++) {
        const px = cx + ox + (p - puffs / 2) * 18 * s, py = cy - Math.sin((p / Math.max(1, puffs - 1)) * Math.PI) * 18 * s + dy * s, r = (13 + hash(i * 11 + p) * 10) * s * k;
        pixelBlob(g, px - (L === 3 ? 4 : 0), py, r * 1.25, r * 0.85, C[L]);
      }
      box(g, cx + ox - puffs * 9 * s, cy + 12 * s, puffs * 18 * s, 3, C[0]); checker(g, cx + ox - puffs * 9 * s, cy + 10 * s, puffs * 18 * s, 2, C[0], 0, 2);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The show's Washington, far off

const FW = 1400, FH = 200;
const paintCity = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.5), T2 = farCol(tod, 0.32), base = FH;
  // (the treeline along the Mall: stepped puffs in two rows)
  const trees = (row: number, col: string, hi: string, y: number) => {
    for (let x = -10; x < FW + 20; x += 9) { const r = 8 + hash(x * 0.3 + row) * 7, ty = y - r * 0.5 + Math.sin(x * 0.02 + row) * 3; g.fillStyle = col; g.beginPath(); g.arc(x, ty, r, 0, Math.PI * 2); g.fill(); box(g, x - r * 0.5, ty - r * 0.7, r * 0.5, 2, hi); }
  };
  // (the Capitol on its hill, far left)
  const cap = (x: number) => {
    const C = ['#9CA4BE', '#BCC2D6', '#DCE0EC', '#F4F6FC'].map(T);
    box(g, x - 90, base - 46, 180, 30, C[1]); box(g, x - 90, base - 46, 180, 3, C[3]); for (let k = -84; k < 84; k += 8) box(g, x + k, base - 40, 3, 22, C[0]);
    box(g, x - 34, base - 62, 68, 16, C[1]); for (let k = -30; k < 30; k += 6) box(g, x + k, base - 60, 2, 12, C[0]);
    g.fillStyle = C[2]; g.beginPath(); g.ellipse(x, base - 62, 30, 34, 0, Math.PI, 0); g.fill();
    g.fillStyle = C[3]; g.beginPath(); g.ellipse(x - 8, base - 70, 12, 22, 0, Math.PI, Math.PI * 1.5); g.lineTo(x - 8, base - 62); g.fill();
    for (let k = -26; k < 26; k += 7) box(g, x + k, base - 84 + Math.abs(k) * 0.5, 2, 10, C[1]);
    box(g, x - 5, base - 108, 10, 12, C[2]); box(g, x - 1, base - 118, 2, 10, C[1]); box(g, x - 2, base - 121, 4, 3, C[3]);
  };
  // (the Washington Monument: the obelisk, its lit side, its little windows near the top, red lights after dark)
  const obelisk = (x: number) => {
    const C = ['#A8A4B8', '#C8C4D6', '#ECE8F4', '#FFFFFF'].map(T2), h = 190;
    g.fillStyle = C[1]; g.beginPath(); g.moveTo(x - 10, base); g.lineTo(x - 7, base - h); g.lineTo(x, base - h - 14); g.lineTo(x + 7, base - h); g.lineTo(x + 10, base); g.closePath(); g.fill();
    g.fillStyle = C[2]; g.beginPath(); g.moveTo(x - 10, base); g.lineTo(x - 7, base - h); g.lineTo(x, base - h - 14); g.lineTo(x - 1, base); g.closePath(); g.fill();
    box(g, x - 9, base - h * 0.32, 18, 2, C[0]);
    for (const dx of [-3, 2]) box(g, x + dx, base - h + 8, 1, 2, C[0]);
    if (tod.lamps > 0.3) for (const dx of [-4, 3]) box(g, x + dx, base - h + 2, 2, 2, '#FF4A4A');
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; box(g, x + Math.cos(a) * 26 - 1, base - 6 + Math.sin(a) * 3, 2, 6, T('#5A6A8A')); box(g, x + Math.cos(a) * 26 + 1, base - 9 + Math.sin(a) * 3, 3, 2, T(['#C8202E', '#FFFFFF', '#2F58B8'][k % 3])); }
  };
  // (the Jefferson Memorial: a low dome on a ring of columns, a pediment, the Tidal Basin glinting in front)
  const jefferson = (x: number) => {
    const C = ['#A8A4B8', '#C8C4D6', '#E6E2F0', '#FFFFFF'].map(T);
    g.fillStyle = C[2]; g.beginPath(); g.ellipse(x, base - 36, 46, 26, 0, Math.PI, 0); g.fill();
    g.fillStyle = C[3]; g.beginPath(); g.ellipse(x - 14, base - 40, 16, 18, 0, Math.PI, Math.PI * 1.5); g.lineTo(x - 14, base - 36); g.fill();
    box(g, x - 50, base - 36, 100, 20, C[1]); for (let k = -46; k < 46; k += 7) box(g, x + k, base - 34, 3, 16, C[3]);
    g.fillStyle = C[2]; g.beginPath(); g.moveTo(x - 30, base - 36); g.lineTo(x, base - 50); g.lineTo(x + 30, base - 36); g.closePath(); g.fill();
    box(g, x - 56, base - 16, 112, 4, C[0]);
    for (let k = 0; k < 8; k++) box(g, x - 60 + k * 15, base - 8, 9, 1, T(mix(skyAt(0.5, tod), '#FFFFFF', 0.4)));
  };
  // (the Old Executive Office Building: wedding-cake mansards, chimneys, rows of windows)
  const oeob = (x: number) => {
    const C = ['#7A7A90', '#9898AC', '#BABAC8', '#D8D8E4'].map(T);
    for (let t = 0; t < 3; t++) { const w = 200 - t * 50, y = base - 30 - t * 26; box(g, x - w / 2, y, w, 26, C[1 + (t % 2)]); box(g, x - w / 2, y, w, 2, C[3]); for (let k = -w / 2 + 6; k < w / 2 - 6; k += 12) box(g, x + k, y + 6, 5, 12, lit(tod, k * 7 + t, C[0])); }
    g.fillStyle = C[0]; g.beginPath(); g.moveTo(x - 50, base - 108); g.lineTo(x - 36, base - 126); g.lineTo(x + 36, base - 126); g.lineTo(x + 50, base - 108); g.closePath(); g.fill();
    for (const k of [-44, -12, 18, 40]) { box(g, x + k, base - 140, 6, 16, C[0]); box(g, x + k - 1, base - 142, 8, 3, C[2]); }
    box(g, x - 1, base - 160, 2, 34, C[0]); box(g, x + 1, base - 158, 12, 7, T('#C8202E')); box(g, x + 1, base - 158, 5, 4, T('#2F58B8'));
  };
  // (the Treasury: a long colonnade)
  const treasury = (x: number) => {
    const C = ['#A8A4B8', '#C8C4D6', '#E6E2F0', '#FFFFFF'].map(T);
    box(g, x - 110, base - 52, 220, 40, C[1]); box(g, x - 110, base - 52, 220, 4, C[3]); box(g, x - 114, base - 58, 228, 6, C[2]);
    for (let k = -104; k < 104; k += 9) { box(g, x + k, base - 46, 4, 34, C[3]); box(g, x + k + 3, base - 46, 1, 34, C[0]); }
  };
  trees(0, T('#4A7A5A'), T('#6A9A6A'), base - 18);
  cap(140); treasury(520); jefferson(860); oeob(1150); obelisk(380);
  trees(1, T2('#3A6A4A'), T2('#5A8A5A'), base - 4);
  box(g, 0, base - 4, FW, 6, T2('#3A6A4A'));
};

// ---------------------------------------------------------------------------------------------------------------
// The Ellipse, the South Lawn, the fence and the tourists at it

const NW = 1200, NH = 150;
const paintLawn = (g: Ctx, tod: TimeOfDay) => {
  const T = farCol(tod, 0.18);
  const G = ['#1E5A2E', '#2E7A3A', '#46A04E', '#6CC466', '#9AE08A'].map(T);
  // (the lawn: mowed stripes going across, banded)
  for (let i = 0; i < 6; i++) box(g, 0, 60 + i * 15, NW, 16, G[1 + (i % 2) + (i > 3 ? 0 : 1)]);
  checker(g, 0, 60, NW, 2, G[4], 0, 1);
  // (the elms and magnolias: big stepped puffs on trunks)
  for (let i = 0; i < 10; i++) {
    const x = 40 + i * 120 + hash(i * 3.1) * 50, r = 24 + hash(i * 1.7) * 14, magnolia = hash(i * 5.5) < 0.3, y = 64;
    box(g, x - 3, y - 30, 6, 30, T('#4A2E1E')); box(g, x - 3, y - 30, 2, 30, T('#6A4A2E'));
    const C = magnolia ? ['#7A3A5A', '#B45A86', '#E284B0', '#FAC2DC'].map(T) : ['#1E4A2E', '#2E6A3A', '#3E8A46', '#6AB45E'].map(T);
    for (const [dx, dy, rr, k] of [[0, -34, 1, 0], [-r * 0.6, -26, 0.7, 0], [r * 0.6, -26, 0.7, 0], [0, -34, 0.86, 1], [-r * 0.6, -26, 0.6, 1], [r * 0.6, -28, 0.6, 1], [-r * 0.2, -40, 0.55, 2], [-r * 0.35, -44, 0.3, 3]] as [number, number, number, number][]) pixelBlob(g, x + dx, y + dy, r * rr, r * rr * 0.86, C[k]);
  }
  // (the South Fountain: a round basin, its jet's live)
  const fx = 600;
  g.fillStyle = T('#E2E6F0'); g.beginPath(); g.ellipse(fx, 96, 60, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = T('#5AA8E8'); g.beginPath(); g.ellipse(fx, 95, 54, 6, 0, 0, Math.PI * 2); g.fill();
  box(g, fx - 40, 93, 30, 1, T('#C6E8FC'));
  // (the iron fence: black bars, gilt spikes, stone piers with lamps)
  const fy = 120;
  box(g, 0, fy - 2, NW, 3, T(INK));
  for (let x = 0; x < NW; x += 6) { box(g, x, fy - 30, 2, 30, T('#1A1A24')); box(g, x, fy - 33, 2, 3, T('#D09A30')); }
  box(g, 0, fy - 26, NW, 2, T('#1A1A24'));
  for (let x = 30; x < NW; x += 240) { box(g, x - 7, fy - 40, 14, 40, T('#D8D4E4')); box(g, x - 7, fy - 40, 4, 40, T('#F4F2FA')); box(g, x - 9, fy - 44, 18, 4, T('#B8B4C8')); g.fillStyle = tod.lamps > 0.3 ? '#FFE08A' : T('#E8E4F0'); g.beginPath(); g.arc(x, fy - 50, 5, 0, Math.PI * 2); g.fill(); }
  // (the tourists at the fence: seeded, waving, cameras up; a Secret Service sedan by a gate)
  for (let i = 0; i < 26; i++) {
    const x = 12 + i * 46 + hash(i * 9.1) * 20, h = 18 + hash(i * 2.3) * 6, skin = T(['#F2BC98', '#C98A6A', '#8A5A3E', '#E8B08A', '#6A3E2A'][Math.floor(hash(i * 4.4) * 5)]), shirt = T(['#E2465E', '#2F58B8', '#F2C84A', '#4CC89C', '#F4F2FA', '#9476DE', '#F2822A'][Math.floor(hash(i * 6.6) * 7)]);
    if (hash(i * 8.8) < 0.2) continue;
    box(g, x - 4, fy - h + 6, 8, h - 8, shirt); box(g, x - 4, fy - h + 6, 2, h - 8, mix(shirt, '#FFFFFF', 0.3));
    box(g, x - 3, fy - 4, 2, 4, T('#2A2A3A')); box(g, x + 1, fy - 4, 2, 4, T('#2A2A3A'));
    box(g, x - 3, fy - h, 6, 6, skin); box(g, x - 3, fy - h - 1, 6, 2, T(['#2A1A12', '#E8C060', '#1A1A1A', '#8A4A2A', '#C8C8D0'][i % 5]));
    if (i % 3 === 0) { box(g, x + 3, fy - h - 6, 2, 8, skin); } else if (i % 3 === 1) { box(g, x - 5, fy - h + 1, 6, 4, T('#1A1A24')); box(g, x - 4, fy - h + 2, 2, 2, T('#9CBCF0')); }
  }
  const sx = 900;
  box(g, sx - 30, fy - 18, 60, 12, T('#1A1A24')); box(g, sx - 20, fy - 26, 34, 9, T('#1A1A24')); box(g, sx - 16, fy - 24, 12, 6, T('#5A6A8A')); box(g, sx + 2, fy - 24, 10, 6, T('#5A6A8A'));
  for (const wx of [sx - 18, sx + 18]) { g.fillStyle = T(INK); g.beginPath(); g.arc(wx, fy - 6, 6, 0, Math.PI * 2); g.fill(); }
  // (the garden's own hedges' tops along the back)
  for (let x = 0; x < NW; x += 30) { g.fillStyle = T('#1E5A2E'); g.beginPath(); g.ellipse(x + 15, NH - 14, 18, 14, 0, Math.PI, 0); g.fill(); box(g, x + 4, NH - 26, 10, 2, T('#46A04E')); }
  box(g, 0, NH - 14, NW, 14, T('#1E5A2E'));
};

/** The fountain's jet and the birds (live). */
const liveBits = (c: Ctx, state: GameState, hz: number) => {
  const off = -((state.camera.x * 0.16) % NW), f = state.frame, tod = timeOfDay();
  for (let x = off + 600; x < W + NW; x += NW) {
    if (x < -80 || x > W + 80) continue;
    const y = hz - 50 + 94;
    c.fillStyle = farTint('#DDF2FE', 0.2, tod); c.fillRect(Math.round(x) - 1, y - 34, 2, 34);
    for (let k = 0; k < 6; k++) { const t = ((f * 0.8 + k * 9) % 50) / 50, h = 40 * Math.sin(t * Math.PI); c.fillRect(Math.round(x + (k - 2.5) * 6 * t), Math.round(y - h), 2, 3); }
  }
  if (tod.lamps < 0.5) for (let k = 0; k < 3; k++) {
    const bx = ((f * (0.6 + k * 0.2) + k * 300) % (W + 200)) - 100, by = 120 + k * 40 + Math.sin(f * 0.05 + k) * 10, flap = (f >> 3) % 2;
    c.fillStyle = '#2A2A3A'; c.fillRect(Math.round(bx - 4), Math.round(by - flap), 3, 1); c.fillRect(Math.round(bx + 1), Math.round(by - flap), 3, 1); c.fillRect(Math.round(bx - 1), Math.round(by), 2, 1);
  }
};

/** Screen space: the sky and the far off past the balcony and the garden. */
export const drawWhFar = (c: Ctx, state: GameState) => {
  const hz = whHorizon(state);
  drawTodSky(c, 0, 0, W, H, ['#3A92E6', '#56A8F0', '#7EC0F4', '#A8D6F6', '#D6E6F4', '#F6E2D2'], { horizon: hz, sun: [640, 110], moon: [170, 90] });
  tile(c, 'clouds', state.camera.x * 0.03 - state.frame * 0.06, 20, CH, CW, paintClouds);
  tile(c, 'city', state.camera.x * 0.06, hz - FH + 10, FH, FW, paintCity);
  tile(c, 'lawn', state.camera.x * 0.16, hz - 50, NH, NW, paintLawn);
  liveBits(c, state, hz);
  const below = hz - 50 + NH;
  if (below < H) box(c, 0, below, W, H - below, farTint('#1E5A2E', 0.15));
  return true;
};
