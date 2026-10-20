// Future Land's landmarks far off, shared by its outdoor backdrops (the art pass's "tease the other attractions"; the
// giant atom and Space Needle 2 are square/sky.ts's, already the same wherever they're seen):
//
// - XENOSCARE far across the park, where the impact site is (the land's end): its black box with the starfield painted
//   on it, the chrome parapet, the bone-white fiberglass derelict jutting out of it, portholes, the green neon name up
//   top; to the right of everything from the square (small, hazy), nearer from the main drag; not drawn where it's in
//   the scene itself.
// - the park's horizon, past the far hills: the neighbors, small and hazy. Foreign Lands' World Showcase (a lattice
//   tower that is legally not the Eiffel Tower, an onion dome, a pagoda) one way; Wilderness Land the other (TIMBER
//   TUMBLE's fiberglass mesa with the log flume trestled down its face and the splash at its foot, the frontier town's
//   white church steeple and its water tank). A flat-topped mesa, cliffs and ledges: no volcanoes.
// - the sky kept busy: the JETPACK DEMONSTRATION TEAM looping over the park on their smoke trails by day, a show rocket
//   going up off its pad behind the skyline now and then (it never gets far), and neon searchlights (pink, teal) after
//   dark.
//
// Still things are painted once for the hour into stamps; only the fliers, the rocket and the beams are live (cheap).

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../m1/constants';
import { timeOfDay, farTint, skyAt, hourMix, type TimeOfDay } from '../timeOfDay';
import { type Ctx, INK, box, checker, mix, hash, stamp, pixelBlob, poly, hazeBands } from './square/paint';
import { lettering } from './square/lettering';
import { SECTIONS, SECTION_ORDER, SPX } from './geometry';

const W = CANVAS_WIDTH;
type T = (c: string) => string;

/** A far color for the hour (Future Land's far layers' own: its pastels toward dusk and night), into the haze by k. */
const farCol = (tod: TimeOfDay, k: number): T => (c: string) => mix(farTint(hourMix(c, mix(c, '#9A6A90', 0.22), mix(c, '#1A2048', 0.4), tod), 1, tod), skyAt(0.86, tod), k);
const ramp = (T: T, c: string) => [mix(c, INK, 0.55), mix(c, INK, 0.3), c, mix(c, '#FFFFFF', 0.25), mix(c, '#FFFFFF', 0.5)].map(T);
/** A block lit down its left (a strip, dithered off), shaded down its right (a band, dithered in), inked round. */
const block = (g: Ctx, x: number, y: number, w: number, h: number, R: string[]) => {
  x = Math.round(x); y = Math.round(y); w = Math.max(2, Math.round(w)); h = Math.max(2, Math.round(h));
  box(g, x - 1, y - 1, w + 2, h + 1, R[0]); box(g, x, y, w, h, R[2]);
  const lw = Math.max(1, Math.round(w * 0.1)), sw = Math.max(2, Math.round(w * 0.24));
  box(g, x, y, lw, h, R[3]); if (w > 12) checker(g, x + lw, y, 2, h, R[3]);
  box(g, x + w - sw, y, sw, h, R[1]); if (w > 12) checker(g, x + w - sw - 2, y, 2, h, R[1], 1);
};

// ---------------------------------------------------------------------------------------------------------------
// XENOSCARE, far off (painted at scale s, its foot along y = 0, from x = 0 rightward)

const XW = 760, XH = 420;
const xenoscare = (g: Ctx, s: number, T: T, night: number) => {
  const X = (v: number) => Math.round(v * s);
  const St = ramp(T, '#3A3E52'), Bn = ramp(T, '#D8D0BC'), Cr = ramp(T, '#B8C3D6');
  // (the black box: the starfield and a nebula painted on it, its parapet)
  const bx = X(80), bw = X(680), bh = X(330);
  box(g, bx - 1, -bh - 1, bw + 2, bh + 1, T(INK)); box(g, bx, -bh, bw, bh, T('#202436'));
  for (let k = 1; k < 5; k++) box(g, bx, -bh + X(k * 66), bw, 1, St[1]);
  pixelBlob(g, bx + X(470), -bh + X(110), X(90), X(36), T('#2A1650')); pixelBlob(g, bx + X(500), -bh + X(104), X(54), X(20), T('#3E1E6E')); pixelBlob(g, bx + X(515), -bh + X(100), X(20), X(8), T('#6A3EA8'));
  for (let i = 0; i < 60; i++) box(g, bx + 2 + Math.round(hash(i * 1.37) * (bw - 4)), -bh + 4 + Math.round(hash(i * 2.91) * (bh - 8)), 1, 1, T(i % 4 ? '#B4A8E8' : '#FFFFFF'));
  box(g, bx - 2, -bh - X(8) - 1, bw + 4, X(8) + 2, T(INK)); box(g, bx - 1, -bh - X(8), bw + 2, X(8), Cr[3]); box(g, bx - 1, -bh - X(8), bw + 2, Math.max(1, X(2)), Cr[4]);
  box(g, bx, -bh, Math.max(1, X(3)), bh, St[3]);
  // (the derelict jutting out of it: a fiberglass egg of a hull, its ribs, portholes, the dark mouth)
  const hx = X(250), hr = X(190), hh = X(400);
  g.fillStyle = T(INK); g.beginPath(); g.ellipse(hx, 0, hr + 1, hh + 1, 0, Math.PI, 0); g.fill();
  const shells: [number, number, number, string][] = [[0, 1, 1, Bn[1]], [-0.08, 0.86, 0.93, Bn[2]], [-0.2, 0.6, 0.82, Bn[3]], [-0.32, 0.26, 0.68, Bn[4]]];
  for (const [dx, kw, kh, col] of shells) { g.fillStyle = col; g.beginPath(); g.ellipse(hx + dx * hr, 0, hr * kw, hh * kh, 0, Math.PI, 0); g.fill(); }
  g.strokeStyle = Bn[1]; g.lineWidth = 1;
  for (const k of [0.45, 0.78]) { g.beginPath(); g.ellipse(hx, 0, hr * k, hh * (0.6 + k * 0.4), 0, Math.PI, 0); g.stroke(); }
  for (let k = 0; k < 3; k++) { const px = hx - X(80) + k * X(80), py = -X(300) + (k === 1 ? -X(20) : 0), r = Math.max(2, X(16)); g.fillStyle = T(INK); g.beginPath(); g.arc(px, py, r + 1, 0, Math.PI * 2); g.fill(); g.fillStyle = k === 1 ? T('#2A8A4A') : T('#2A2E40'); g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = T('#0A0612'); g.beginPath(); g.ellipse(hx, 0, X(60), X(150), 0, Math.PI, 0); g.fill();
  if (night > 0.2) box(g, hx - X(24), -X(40), X(48), Math.max(1, X(8)), '#FF6AC8');
  // (the name up top in green neon on its black plate)
  if (s >= 0.2) {
    const py = -bh - X(8) - 16;
    box(g, bx + bw / 2 - 56, py - 9, 112, 18, T(INK)); box(g, bx + bw / 2 - 55, py - 8, 110, 16, T('#120A1C'));
    lettering(g, 'XENOSCARE!', bx + bw / 2, py, 'neon', night > 0.3 ? '#7CFC9A' : '#5AD87A', '#120A1C');
  } else box(g, bx + bw / 2 - X(110), -bh - X(40), X(220), Math.max(2, X(22)), night > 0.3 ? '#7CFC9A' : T('#3AA85A'));
};
/** Which section he's in, by the camera. */
const sectionAt = (x: number) => { let at = 0; SECTION_ORDER.forEach((id, i) => { if (x >= SECTIONS[id].x0 - 1500) at = i; }); return at; };
const XENO_AT = SECTION_ORDER.indexOf('crater');
/** XENOSCARE far across the park (screen space), standing on `foot` (the far skyline's ground). */
export const drawFlXeno = (c: Ctx, state: GameState, foot: number) => {
  const cam = state.camera.x + W / 2, at = sectionAt(cam), d = XENO_AT - at;
  if (d < 1) return;
  const tod = timeOfDay(), id = SECTION_ORDER[at], sec = SECTIONS[id];
  const s = Math.round((0.8 / (1 + 0.55 * (d - 1))) * 100) / 100, T = farCol(tod, Math.min(0.55, 0.2 + 0.06 * d));
  const u = Math.max(-0.5, Math.min(0.5, (cam - (sec.x0 + sec.x1) / 2) / (sec.x1 - sec.x0)));
  // (straight ahead past the drag, a little left of the needle; it slides by its depth across a section)
  const x = Math.round(W / 2 + 60 * Math.log2(1 + d) - u * 160 * (s / 0.55) - (XW * s) / 2);
  if (x + XW * s < -20 || x > W + 20) return;
  c.save(); c.translate(x, Math.round(foot));
  stamp(c, `flx-${s}-${tod.key}`, -10, -XH * s - 40, XW * s + 20, XH * s + 44, g => xenoscare(g, s, T, tod.lamps));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The park's horizon: the neighbors (painted at twice their size, put down at half: every cell a pixel)

/** Foreign Lands' World Showcase: a lattice tower (legally not that one), an onion dome on its drum, a pagoda. */
const showcase = (g: Ctx, T: T) => {
  // (the tower: four legs to a waist, its platforms, the lattice, the mast)
  const tx = 70, R = ramp(T, '#8A6A50');
  poly(g, [[tx - 46, 0], [tx - 8, -200], [tx + 8, -200], [tx + 46, 0], [tx + 30, 0], [tx + 4, -160], [tx - 4, -160], [tx - 30, 0]], R[1]);
  poly(g, [[tx - 46, 0], [tx - 8, -200], [tx - 4, -200], [tx - 38, 0]], R[3]);
  g.strokeStyle = R[0]; g.lineWidth = 1; g.beginPath();
  for (let y = -10; y > -200; y -= 14) { const hw = 46 - ((-y) / 200) * 38; g.moveTo(tx - hw, y); g.lineTo(tx + hw - 6, y - 14); g.moveTo(tx + hw, y); g.lineTo(tx - hw + 6, y - 14); }
  g.stroke();
  poly(g, [[tx - 30, 0], [tx, -40], [tx + 30, 0]], T('#BFD8F0'));
  for (const [y, w] of [[-60, 58], [-130, 34], [-200, 20]] as const) { box(g, tx - w / 2 - 1, y - 1, w + 2, 6, R[0]); box(g, tx - w / 2, y, w, 4, R[2]); box(g, tx - w / 2, y, w, 1, R[4]); }
  box(g, tx - 4, -250, 8, 50, R[1]); box(g, tx - 4, -250, 3, 50, R[3]); box(g, tx - 1, -276, 2, 26, R[0]);
  if (timeOfDay().lamps > 0.3) for (let y = -12; y > -250; y -= 18) box(g, tx - 1 + (y % 36 ? 6 : -6), y, 2, 2, '#FFE8A0');
  // (the onion dome on its drum, striped, gold tip)
  const ox = 170, D = ramp(T, '#4A9A6A');
  block(g, ox - 22, -70, 44, 70, ramp(T, '#E8D8C0'));
  for (let k = 0; k < 3; k++) box(g, ox - 16 + k * 12, -58, 6, 14, T('#3A2A4A'));
  for (let y = -130; y < -70; y += 2) {
    const u = (y + 130) / 60, hw = Math.round(Math.sin(Math.min(1, u * 1.15) * Math.PI * 0.95) * 30 * (u < 0.15 ? u / 0.15 * 0.4 + 0.2 : 1));
    for (let x = -hw; x < hw; x += 2) box(g, ox + x, y, 2, 2, ((x + 40) >> 3) % 2 ? D[x < -hw * 0.3 ? 3 : x > hw * 0.4 ? 1 : 2] : T(x < 0 ? '#F4E8C8' : '#C8B48A'));
  }
  box(g, ox - 1, -146, 2, 16, T('#E8C25A')); box(g, ox - 3, -150, 6, 4, T('#F2D46A'));
  // (the pagoda: five tiers, red, their eaves upturned)
  const px = 250, P = ramp(T, '#B4342A');
  for (let k = 0; k < 5; k++) {
    const y = -k * 34, w = 64 - k * 10;
    block(g, px - w / 2 + 6, y - 26, w - 12, 26, ramp(T, '#E8D8C0'));
    poly(g, [[px - w / 2 - 10, y - 24], [px - w / 2 + 2, y - 34], [px + w / 2 - 2, y - 34], [px + w / 2 + 10, y - 24], [px + w / 2 - 2, y - 28], [px - w / 2 + 2, y - 28]], P[2]);
    box(g, px - w / 2 + 2, y - 34, w - 4, 2, P[4]);
  }
  box(g, px - 1, -206, 2, 36, T('#E8C25A'));
};
/** Wilderness Land: TIMBER TUMBLE's fiberglass mesa (flat top, cliffs and ledges, banded rock), the log flume trestled
 *  down its face to the splash at its foot, pines round it; the town's white church steeple and its water tank. */
const wilderness = (g: Ctx, T: T) => {
  const Rk = ['#5A2A1A', '#8A4228', '#B4623A', '#D48A5A', '#ECB888'].map(T);
  // (the mesa: a flat top, stepped cliffs down either side, its ledges lit along their tops, banded across)
  const prof: [number, number][] = [[0, 0], [14, -60], [30, -66], [40, -120], [56, -126], [64, -170], [200, -170], [210, -130], [226, -124], [236, -70], [252, -64], [268, 0]];
  poly(g, prof, Rk[1]);
  g.save(); g.beginPath(); prof.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  for (let y = -170; y < 0; y += 16) { box(g, 0, y, 270, 8, Rk[2]); checker(g, 0, y + 8, 270, 2, Rk[2]); }
  box(g, 0, -170, 110, 170, Rk[3]); checker(g, 110, -170, 4, 170, Rk[3]);
  box(g, 200, -170, 70, 170, Rk[0]); checker(g, 196, -170, 4, 170, Rk[0], 1);
  g.restore();
  for (const [a, b, y] of [[64, 200, -170], [40, 56, -120], [14, 30, -60], [210, 226, -130], [236, 252, -70]] as const) box(g, a, y, b - a, 2, Rk[4]);
  // (the flume: a trough zigzagging down the face on its trestles, the splash)
  const run: [number, number][] = [[180, -168], [90, -120], [170, -72], [60, -24], [30, -6]];
  g.strokeStyle = T('#3A2A1A'); g.lineWidth = 1; g.beginPath();
  for (let i = 1; i < run.length; i++) for (let k = 0; k < 4; k++) { const u = k / 4, x = run[i - 1][0] + (run[i][0] - run[i - 1][0]) * u, y = run[i - 1][1] + (run[i][1] - run[i - 1][1]) * u; g.moveTo(x, y); g.lineTo(x, 0); }
  g.stroke();
  g.strokeStyle = T('#7A5A3A'); g.lineWidth = 4; g.beginPath(); run.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  g.strokeStyle = T('#8ACCE8'); g.lineWidth = 2; g.beginPath(); run.forEach(([x, y], i) => (i ? g.lineTo(x, y - 2) : g.moveTo(x, y - 2))); g.stroke();
  pixelBlob(g, 26, -6, 18, 8, T('#E8F4FA')); pixelBlob(g, 22, -10, 8, 4, T('#FFFFFF'));
  // (pines round its foot)
  for (let i = 0; i < 12; i++) { const x = 4 + i * 24 + Math.round(hash(i * 3.1) * 10), h = 22 + Math.round(hash(i * 1.7) * 14); for (let k = 0; k < 4; k++) { const w = 12 - k * 3; box(g, x - w / 2, -h + k * (h / 4) - 4 + 4, w, Math.ceil(h / 4), T(k % 2 ? '#2A4A2A' : '#3A5E34')); } }
  // (the church, the steeple, the town's water tank on its legs)
  const cx = 330;
  block(g, cx - 22, -40, 44, 40, ramp(T, '#F2EEE4'));
  poly(g, [[cx - 26, -40], [cx, -60], [cx + 26, -40]], T('#6A4A3A'));
  block(g, cx + 10, -84, 14, 44, ramp(T, '#F2EEE4')); poly(g, [[cx + 8, -84], [cx + 17, -116], [cx + 26, -84]], T('#5A3A2A'));
  box(g, cx + 16, -126, 2, 10, T('#4A3A2A')); box(g, cx + 13, -122, 8, 2, T('#4A3A2A'));
  box(g, cx - 6, -22, 8, 22, T('#3A2A1A'));
  const wx = 400;
  for (const lx of [wx - 14, wx + 12]) box(g, lx, -40, 2, 40, T('#4A3424'));
  block(g, wx - 18, -66, 36, 26, ramp(T, '#8A6A4A')); poly(g, [[wx - 20, -66], [wx, -78], [wx + 20, -66]], T('#5A4030'));
};
interface Hz { id: string; bx: number; w: number; h: number; paint: (g: Ctx, T: T) => void }
/** The neighbors, by where each sits on screen when he walks in (they slide at the horizon's depth after that). */
const HORIZON: Hz[] = [
  { id: 'showcase', bx: 230, w: 300, h: 290, paint: showcase },
  { id: 'wild', bx: 640, w: 430, h: 180, paint: wilderness },
];
/** The park's horizon (screen space): the neighbors standing on `foot` (behind the far skyline, in front of the far
 *  hills: they're in the park). */
export const drawFlHorizon = (c: Ctx, state: GameState, foot: number) => {
  const tod = timeOfDay(), slide = (state.camera.x - SPX) * 0.0035, T = farCol(tod, 0.5);
  for (const h of HORIZON) {
    const x = Math.round(h.bx - slide - h.w / 4);
    if (x + h.w / 2 < -10 || x > W + 10) continue;
    c.save(); c.translate(x, Math.round(foot)); c.scale(0.5, 0.5);
    stamp(c, `flhz-${h.id}-${tod.key}`, -10, -h.h - 10, h.w + 20, h.h + 14, g => { h.paint(g, T); hazeBands(g, -10, -44, h.w + 20, 48, skyAt(0.9, tod), 0, 0.75, 5); });
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The sky, kept busy

/** A searchlight's beam (live): a long thin wedge up from (x, y), swinging; a wide faint one and a narrow one. */
const beam = (c: Ctx, x: number, y: number, ph: number, a: number, len: number, rgb: string) => {
  const ang = -Math.PI / 2 + Math.sin(ph) * 0.45;
  for (const [wd, k] of [[0.07, 1], [0.03, 1.6]] as const) {
    c.fillStyle = `rgba(${rgb}, ${(a * k).toFixed(3)})`;
    c.beginPath(); c.moveTo(x - 2, y); c.lineTo(x + Math.cos(ang - wd) * len, y + Math.sin(ang - wd) * len); c.lineTo(x + Math.cos(ang + wd) * len, y + Math.sin(ang + wd) * len); c.lineTo(x + 2, y); c.closePath(); c.fill();
  }
};
/**
 * The sky kept busy (screen space), drawn after the clouds, before the far hills: the jetpack team looping on their smoke
 * trails by day, the show rocket going up behind the skyline now and then, neon searchlights after dark. `hz`: the
 * horizon on screen.
 */
export const drawFlSkyBits = (c: Ctx, state: GameState, hz: number) => {
  const tod = timeOfDay(), f = state.frame, cam = state.camera.x;
  if (tod.lamps > 0.3) {
    for (let k = 0; k < 4; k++) { const bx = ((k * 251 + 60 - cam * 0.03) % 1000 + 1000) % 1000 - 100; beam(c, bx, hz, f * 0.007 + k * 1.9, 0.05 * tod.lamps, 480, k % 2 ? '125, 249, 255' : '255, 122, 208'); }
  } else {
    // (the jetpack team: two fliers looping round each other, their smoke behind them)
    const lx = ((380 - cam * 0.02 + f * 0.05) % 1400 + 1400) % 1400 - 300, ly = Math.max(60, hz - 250);
    if (lx > -120 && lx < W + 120) for (let p = 0; p < 2; p++) {
      const a0 = f * 0.025 + p * Math.PI;
      for (let k = 12; k >= 0; k--) {
        const a = a0 - k * 0.18, x = Math.round(lx + Math.cos(a) * 46 - k * 3), y = Math.round(ly + Math.sin(a) * 22);
        if (k) { const r = 2 + (k >> 2); box(c, x - r, y - r, r * 2, r * 2, `rgba(240, 244, 250, ${(0.55 - k * 0.04).toFixed(2)})`); }
        else { box(c, x - 2, y - 3, 4, 6, '#3A3A4A'); box(c, x - 1, y - 5, 2, 2, '#E2B48C'); box(c, x - 1, y + 3, 2, 2, (f >> 1) % 2 ? '#FDBA74' : '#FDE047'); }
      }
    }
  }
  // (the show rocket: up off its pad behind the skyline every so often, on its flame and its smoke; never gets far)
  const cyc = f % 1500;
  if (cyc < 260) {
    const rx = Math.round(((620 - cam * 0.03) % 1000 + 1000) % 1000 - 100), t = cyc / 260, ry = Math.round(hz - 20 - t * t * 260);
    if (rx > -40 && rx < W + 40) {
      for (let k = 1; k < 10; k++) { const yy = ry + k * 10 + 8, r = 2 + k * 0.8; if (yy < hz) box(c, Math.round(rx - r + Math.sin(k + f * 0.05) * 2), yy, Math.round(r * 2), 6, `rgba(236, 240, 246, ${(0.5 - k * 0.045).toFixed(2)})`); }
      box(c, rx - 3, ry - 10, 6, 14, INK); box(c, rx - 2, ry - 9, 4, 12, '#E4EAF4'); box(c, rx - 2, ry - 12, 4, 3, '#E8659E'); box(c, rx - 4, ry + 1, 8, 3, '#E8659E');
      box(c, rx - 1, ry + 4, 2, 4 + ((f >> 1) % 3) * 2, '#FDE047');
    }
  }
};
