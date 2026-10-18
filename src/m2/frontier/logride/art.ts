// Timber Tumble, drawn (the prototype first pass: crude but readable: flat colors with a lit and a shaded tone, an ink
// edge, recognizable silhouettes). The PARK's log ride (a plank flume on its trestles through fiberglass rock with the
// bolts showing, plywood pines, a painted backdrop, the Old Sawmill's shed, the big drop and its splash pool with the
// ride photo's camera and soaked guests on the bridge, the lumber camp), then under it all the SEWER (brick, dark,
// sludge, grates letting a little daylight down), then out of the bluff the park sits on into the REAL wilderness (a
// real river between real banks, real pines, real rock, a real waterfall: no bolts, no paint, no plywood).
//
// Standable reads standable: the station's platform and the clearing have their lit lips; the walkways in the sewer
// are the rats' (dimmed: he's never off the log down there). Impassable reads impassable: the duck-unders are walls
// down to the gap (hazards.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, todLight, timeOfDay, farTint } from '../../timeOfDay';
import { signText } from '../../signLetters';
import { drawPerson } from '../../adventure/temple/people';
import { GY } from '../geometry';
import { box, mix, INK, frontierSky, frontierSign, onScreen, hash, burned, painted, type Ctx } from '../kit';
import { rideOf } from './state';
import { X, Y, x0, waterY, zoneAt, inSewer, indoorsAt, realAt, SIGNS, PLATFORM_END, LOAD_X, WALKWAYS, CHASM, CHIPPER, CLEARING, PIPES, JUNK, GUSHERS, DUCK_LINE } from './layout';
import { LOG_LEN, RIM } from './ride';

/** (hazards.ts's beats: the giant saw hits the ground SLAM_AT frames after it lets go; the flume over the crack goes at
 *  BREAK_AT) */
const SLAM_AT = 16, BREAK_AT = 50;
/** How far on the flume's drawn past the fault line (the way the ride was meant to go). */
const FLUME_END = 6400;

const LIP = '#E8C890';
const PLANK = '#8A5A30', PLANK_L = '#B07A44', PLANK_D = '#5A3A1E';
const ROCKF = '#C88A52', ROCKF_L = '#E0A86A', ROCKF_D = '#9A6438'; // fiberglass rock
const EARTH = '#4A3424', EARTH_D = '#2E2016';
const BRICK = '#4A3A2E', BRICK_D = '#2A2018', SLUDGE = '#4A4A1E', SLUDGE_L = '#6A6A2A';
const RIVER = '#3A6E8A', RIVER_D = '#1E4256', RIVER_L = '#7AB6D0';

/** Where the camera's looking (x from the section's start). */
const camRx = (state: GameState) => state.camera.x + CANVAS_WIDTH / 2 - x0;

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space)

export const drawRideBackdrop = (c: Ctx, state: GameState): boolean => {
  const rx = camRx(state), z = zoneAt(rx);
  // (the sewer's black; around the break, only once the view's gone down the chasm after him)
  const nearBreak = z === 'brk' || (rx >= 5700 && rx < 6300);
  if (nearBreak ? state.camera.y > GY - 100 : inSewer(rx)) { c.fillStyle = '#14120C'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return true; }
  if (indoorsAt(rx)) { c.fillStyle = '#2A1E14'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); return true; }
  if (realAt(rx)) return realSky(c, state);
  return frontierSky(c, state);
};

/** The real sky over real country: no plywood, no bracing. Far blue ridges (snow on the high ones), nearer forested
 *  hills, ragged with real pines. */
const realSky = (c: Ctx, state: GameState) => {
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  drawTodSky(c, 0, 0, W, H, ['#1E40AF', '#3B82F6', '#7DB8F0', '#BFE0F8', '#E8EEF2', '#F2E6C4'], { horizon: 400, sun: [620, 100], moon: [160, 90] });
  const ridge = (par: number, base: number, amp: number, col: string, seed: number, snow: boolean) => {
    const off = -((state.camera.x * par) % 600);
    c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
    for (let x = -40; x <= W + 40; x += 20) { const wx = x - off, n = Math.sin(wx * 0.011 + seed) * 0.6 + Math.sin(wx * 0.027 + seed * 2) * 0.3 + Math.sin(wx * 0.071) * 0.1; c.lineTo(x, base - n * amp); }
    c.lineTo(W, H); c.closePath(); c.fill();
    if (snow) { c.fillStyle = farTint('#EEF2F7', 0.6); for (let x = -40; x <= W + 40; x += 20) { const wx = x - off, n = Math.sin(wx * 0.011 + seed) * 0.6 + Math.sin(wx * 0.027 + seed * 2) * 0.3 + Math.sin(wx * 0.071) * 0.1; if (n > 0.55) c.fillRect(x - 6, base - n * amp, 14, (n - 0.5) * 30); } }
  };
  ridge(0.03, 330, 90, farTint('#8A9CB8', 1), 1.3, true);
  ridge(0.07, 380, 50, farTint('#5A7A6A', 0.7), 4.1, false);
  // (the near hills: a wall of real pines, every one different)
  const off = -((state.camera.x * 0.16) % 46);
  for (let i = -1; i < W / 46 + 2; i++) {
    const x = off + i * 46, wx = Math.floor((state.camera.x * 0.16) / 46) + i, h = 50 + hash(wx) * 50, y = 440 - hash(wx + 7) * 20;
    c.fillStyle = farTint('#2E4A30', 0.4); c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + 22 + hash(wx + 3) * 8, y); c.lineTo(x - 22 - hash(wx + 5) * 8, y); c.closePath(); c.fill();
  }
  box(c, 0, 436, W, H - 436, farTint('#24382A', 0.3));
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The world, behind the cast

export const drawRideBack = (c: Ctx, state: GameState) => {
  const f = state.frame;
  const vis = (a: number, b: number) => onScreen(state, X(a), X(b));
  // ---- the earth under everything of the park's (down to the sewer, and the bluff's face over the river)
  if (vis(-300, 8440)) {
    const a = Math.max(X(-300), state.camera.x - 20), b = Math.min(X(8440), state.camera.x + CANVAS_WIDTH + 20);
    box(c, a, GY - 4, b - a, 1300, EARTH); box(c, a, GY - 4, b - a, 3, '#6A8A3A');
    for (let k = 0; k < 6; k++) box(c, a, GY + 120 + k * 180, b - a, 3, EARTH_D);
  }
  if (vis(-300, 900)) drawStation(c, state);
  // ---- the flume, all the way along the ride (its back wall; the water; its trestles where it's up off the ground)
  drawFlumeBack(c, state);
  if (vis(900, 2500)) drawCanyon(c, state);
  if (vis(3000, 3900)) drawShedBack(c, state);
  if (vis(3880, 4600)) drawSplash(c, state);
  if (vis(4250, 5600)) drawCamp(c, state);
  if (vis(5400, 6200)) drawBreak(c, state);
  if (vis(5640, 8460)) drawSewerBack(c, state);
  if (vis(8300, 8700)) drawCulvert(c, state);
  if (vis(8400, 11100)) drawRiverBack(c, state);
  for (const [rx, h, words, warn] of SIGNS) if (vis(rx - 120, rx + 120)) frontierSign(c, X(rx), Y(h) - (h < 0 ? 18 : 0), words, { warn, seed: rx, tall: 70 });
  void f;
};
/** The log's far side and its inside (he stands in it), and its near side over his legs. */
export const drawLogBack = (c: Ctx, state: GameState) => drawLog(c, state, true);
export const drawLogFront = (c: Ctx, state: GameState) => drawLog(c, state, false);

/** In front of the cast: the trough's near wall and the water's front (over his feet and the log's bottom), the log's
 *  near side, the station's platform edge, the shed's front posts. */
export const drawRideFront = (c: Ctx, state: GameState) => {
  drawFlumeFront(c, state);
  if (onScreen(state, X(5640), X(8460))) drawSewerFront(c, state);
  if (onScreen(state, X(8400), X(11100))) drawRiverFront(c, state);
  if (onScreen(state, X(3000), X(3900))) drawShedFront(c, state);
};

/** Over everything (index.ts draws it last): the big splashes, the photo's flash, the water running down the screen. */
export const drawSplashes = (c: Ctx, state: GameState) => {
  drawWaves(c, state);
  const r = rideOf(state);
  if (r.flash > 0) { c.fillStyle = `rgba(255,255,255,${r.flash / 14})`; c.fillRect(state.camera.x - 10, state.camera.y - 10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20); }
  drawLens(c, state);
};

// ---------------------------------------------------------------------------------------------------------------
// The big splashes (ride.ts bigSplash): off the foot of every drop, a wall of water up either side of the log like a
// real log ride's (the front one the big one), curling over and coming down, the crest breaking into drops; then the
// water running down the screen.

const drawWaves = (c: Ctx, state: GameState) => {
  const r = rideOf(state), f = state.frame;
  for (const w of r.waves) {
    if (!onScreen(state, w.x - 600, w.x + 700)) continue;
    const t = w.t, S = w.s, rx = w.x - x0, sewer = rx > 5700 && rx < 8440;
    const rise = t < 14 ? Math.sin((t / 14) * Math.PI / 2) : Math.max(0, 1 - (t - 14) / 72);
    const fade = t < 70 ? 1 : Math.max(0, (110 - t) / 40);
    const body = sewer ? '#7A7A3A' : '#BFE0F8', crest = sewer ? '#A3A35A' : '#F8FAFC', deep = sewer ? '#5A5A28' : '#7AB6D0';
    // (the hit: a flash of white water over the whole view)
    if (t < 8) { c.globalAlpha = 0.45 * (1 - t / 8); c.fillStyle = sewer ? '#C8C88A' : '#E0F2FE'; c.fillRect(state.camera.x - 10, state.camera.y - 10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20); }
    // (the mist hanging over it, rising)
    for (let i = 0; i < 8; i++) {
      c.globalAlpha = 0.22 * fade * Math.min(1, t / 6); c.fillStyle = crest;
      c.beginPath(); c.ellipse(w.x - 200 * S + i * 62 * S, w.y - 80 * S - t * 1.6 - hash(i) * 120 * S, (60 + t * 0.9) * S, (34 + t * 0.5) * S, 0, 0, Math.PI * 2); c.fill();
    }
    // (the curtains: thrown up and out back the way he came and, the biggest, on ahead: way over his head)
    for (const s of [-1, 1] as const) {
      const big = s > 0 ? 1.05 : 0.8, H = 350 * S * rise * big, out = (60 + t * 4.2) * big * S, base = w.x + s * 20;
      c.globalAlpha = 0.85 * fade;
      // (the sheet: thick at its foot, up and out, curling over at the top)
      c.fillStyle = deep; c.beginPath(); c.moveTo(base, w.y + 4);
      c.quadraticCurveTo(base + s * out * 0.15, w.y - H * 1.05, base + s * out, w.y - H * 0.8);
      c.quadraticCurveTo(base + s * out * 1.35, w.y - H * 0.55, base + s * (out * 1.25 + 30), w.y + 4); c.closePath(); c.fill();
      c.fillStyle = body; c.beginPath(); c.moveTo(base + s * 6, w.y + 2);
      c.quadraticCurveTo(base + s * out * 0.2, w.y - H * 0.95, base + s * out * 0.95, w.y - H * 0.76);
      c.quadraticCurveTo(base + s * out * 1.2, w.y - H * 0.5, base + s * (out * 1.1 + 18), w.y + 2); c.closePath(); c.fill();
      // (the crest breaking into drops, falling as it goes over)
      c.fillStyle = crest;
      for (let i = 0; i < 22; i++) {
        const u = i / 21, px = base + s * out * (0.2 + u * 1.15), py = w.y - H * (0.98 - u * 0.5) + Math.max(0, t - 14) * u * 2.6;
        c.beginPath(); c.arc(px + s * hash(i + t) * 8, py - hash(i * 3) * 16, 3 + hash(i * 7) * 6, 0, Math.PI * 2); c.fill();
      }
      // (streaks down its face)
      c.fillStyle = crest; c.globalAlpha = 0.55 * fade;
      for (let i = 0; i < 7; i++) { const u = 0.2 + i * 0.12, px = base + s * out * u; c.fillRect(px, w.y - H * (0.85 - u * 0.4), 3, H * 0.45); }
    }
    // (the sheet thrown on ahead, arching right over the log and him)
    if (rise > 0.05) {
      const a0 = w.x - 30 * S, a1 = w.x + (180 + t * 3) * S, top = w.y - 300 * S * rise;
      c.globalAlpha = 0.6 * fade; c.strokeStyle = body; c.lineWidth = 20 * rise * S;
      c.beginPath(); c.moveTo(a0, w.y); c.quadraticCurveTo((a0 + a1) / 2, top - 60 * S, a1, w.y - 10); c.stroke();
      c.globalAlpha = 0.8 * fade; c.strokeStyle = crest; c.lineWidth = 5 * rise * S;
      c.beginPath(); c.moveTo(a0, w.y); c.quadraticCurveTo((a0 + a1) / 2, top - 66 * S, a1, w.y - 10); c.stroke();
    }
    // (the near wall of water, thrown up toward us in front of the log: his legs and the log's side behind it)
    {
      const nH = 130 * S * rise, nx0 = w.x - 150 * S, nx1 = w.x + 220 * S;
      c.globalAlpha = 0.62 * fade; c.fillStyle = body;
      c.beginPath(); c.moveTo(nx0, w.y + 10);
      for (let i = 0; i <= 12; i++) { const u = i / 12, bump = Math.sin(u * Math.PI) * (0.6 + 0.4 * Math.sin(i * 1.7 + t * 0.4)); c.lineTo(nx0 + (nx1 - nx0) * u, w.y - nH * bump); }
      c.lineTo(nx1, w.y + 10); c.closePath(); c.fill();
      c.globalAlpha = 0.85 * fade; c.fillStyle = crest;
      for (let i = 0; i < 12; i++) { const u = (i + 0.5) / 12, bump = Math.sin(u * Math.PI) * (0.6 + 0.4 * Math.sin(i * 1.7 + 0.85 + t * 0.4)); c.beginPath(); c.arc(nx0 + (nx1 - nx0) * u, w.y - nH * bump, 4 + hash(i + 9) * 5, 0, Math.PI * 2); c.fill(); }
    }
    // (the white burst of foam on the surface, spreading, and the white water boiling round the log's foot)
    c.globalAlpha = 0.85 * fade; c.strokeStyle = crest; c.lineWidth = 6;
    c.beginPath(); c.ellipse(w.x + 30, w.y, (70 + t * 5) * S, 8 + t * 0.25, 0, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = 0.9 * fade; c.fillStyle = crest;
    for (let i = 0; i < 22; i++) { const px = w.x - 180 * S + i * 20 * S + Math.sin(t * 0.3 + i) * 5; c.beginPath(); c.ellipse(px, w.y - 2 - hash(i + 5) * 8, 12 + hash(i) * 10, 6 + hash(i + 1) * 5, 0, 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 1;
  }
  // (the spray, up and raining back down)
  for (const d of r.spray) {
    if (d.x < state.camera.x - 20 || d.x > state.camera.x + CANVAS_WIDTH + 20) continue;
    c.globalAlpha = Math.min(1, d.life / 30) * 0.9;
    c.fillStyle = d.sewer ? (d.s > 4 ? '#A3A35A' : '#7A7A3A') : d.s > 4 ? '#F8FAFC' : '#BFDBFE';
    c.fillRect(d.x, d.y, d.s, d.s * (d.vy > 0 ? 1.8 : 1.2));
    if (d.vy > 3) { c.globalAlpha *= 0.4; c.fillRect(d.x + d.s / 2 - 0.5, d.y - d.vy * 1.5, 1, d.vy * 1.5); }
  }
  c.globalAlpha = 1;
  void f;
};

/** The splash's water down the screen (the lens: drops sliding down it), fading. */
const LENS = 130;
const drawLens = (c: Ctx, state: GameState) => {
  const r = rideOf(state);
  if (r.lens <= 0) return;
  const a = Math.min(1, r.lens / 60), run = LENS - r.lens, sewer = inSewer(camRx(state));
  for (let i = 0; i < 26; i++) {
    const sx = state.camera.x + hash(i * 7 + 3) * CANVAS_WIDTH, sy = state.camera.y + ((hash(i * 3 + 1) * CANVAS_HEIGHT * 0.8 + run * (1.5 + hash(i) * 4)) % CANVAS_HEIGHT);
    const w = 9 + hash(i * 5) * 18, h = w * 1.3;
    c.globalAlpha = 0.36 * a; c.fillStyle = sewer ? '#A3A35A' : '#E0F2FE';
    c.beginPath(); c.ellipse(sx, sy, w, h, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(sx - 2, sy - h - run * 0.6, 4, run * 0.6);
    c.globalAlpha = 0.6 * a; c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(sx - w * 0.35, sy - h * 0.4, w * 0.22, h * 0.18, 0, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// The log

const drawLog = (c: Ctx, state: GameState, back: boolean) => {
  const r = rideOf(state), L = r.log;
  // (the station's waiting log, before he's in one; the log on the ride; gone into the chipper)
  const rx = L.mode === 'off' ? LOAD_X : L.rx;
  if (L.mode === 'done' || (L.mode === 'chipper' && rx > 11095)) return;
  const wl = waterY(rx), x = X(rx), wy = wl - L.bob - L.float, ang = Math.atan2(waterY(rx + 30) - waterY(rx - 30), 60);
  const hl = LOG_LEN / 2, f = state.frame;
  // (on the water (not up the chipper's conveyor, not down a drop): the water round it: ripples spreading off it, its
  // wake trailing, a bow wave at its nose, foam round its foot)
  const onWater = rx < 10760 && Math.abs(ang) < 0.3 && L.mode !== 'leap';
  const sewer = rx > 5700 && rx < 8440, v = L.mode === 'ride' || L.mode === 'chipper' ? L.v : 0;
  const foam = sewer ? '#A3A35A' : '#F1F5F9', ripple = sewer ? '#7A7A3A' : RIVER_L;
  if (back && onWater) {
    for (let i = 0; i < 3; i++) {
      const k = ((f * 0.02 + i / 3) % 1), rw = hl + 12 + k * 70;
      c.globalAlpha = 0.5 * (1 - k); c.strokeStyle = ripple; c.lineWidth = 2;
      c.beginPath(); c.ellipse(x - k * v * 12, wl, rw, 4 + k * 4, 0, Math.PI, Math.PI * 2); c.stroke();
    }
    c.globalAlpha = 1;
  }
  c.save(); c.translate(Math.round(x), Math.round(wy)); c.rotate(ang);
  if (back) {
    // (the far side's rim and the dark inside of it, a bench)
    box(c, -hl, -RIM - 2, LOG_LEN, 10, INK); box(c, -hl + 2, -RIM, LOG_LEN - 4, 8, '#3F2A14');
    box(c, -hl + 10, -RIM + 6, LOG_LEN - 20, 6, '#2A1A0C');
  } else {
    // (the near side: a hollowed log, bark, its cut ends' rings, the ride's number painted on, water at its foot)
    c.fillStyle = INK; c.beginPath(); c.roundRect(-hl - 2, -RIM, LOG_LEN + 4, RIM + 12, 12); c.fill();
    c.fillStyle = '#7A4A24'; c.beginPath(); c.roundRect(-hl, -RIM + 2, LOG_LEN, RIM + 8, 10); c.fill();
    box(c, -hl + 6, -RIM + 2, LOG_LEN - 12, 4, '#A06A38');
    for (let k = 0; k < 9; k++) box(c, -hl + 10 + k * 14, -RIM + 8 + (k % 3) * 3, 8, 2, '#5A3418');
    for (const ex of [-hl + 4, hl - 4]) { c.fillStyle = '#C8A070'; c.beginPath(); c.ellipse(ex, -RIM / 2 + 4, 5, RIM / 2 + 2, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#8A6040'; c.lineWidth = 1; c.beginPath(); c.ellipse(ex, -RIM / 2 + 4, 2.5, RIM / 4, 0, 0, Math.PI * 2); c.stroke(); }
    signText(c, 'TT-4', 0, -6, painted(1, '#FEF3C7', '#3F2A14'));
  }
  c.restore();
  if (!back && onWater) {
    // (the water over its foot: see-through, lapping; the foam collar; the wake's V trailing off its tail; the bow wave)
    c.globalAlpha = 0.55; box(c, x - hl - 8, wl - 3, LOG_LEN + 16, 12, sewer ? SLUDGE : RIVER); c.globalAlpha = 1;
    for (let i = 0; i < 12; i++) { const px = x - hl - 4 + i * 12 + Math.sin(f * 0.2 + i) * 2; box(c, px, wl - 3 + Math.sin(f * 0.15 + i * 1.7), 7, 2, foam); }
    const wake = 50 + v * 34;
    c.strokeStyle = foam; c.lineWidth = 2; c.globalAlpha = 0.75;
    c.beginPath(); c.moveTo(x - hl, wl - 1); c.lineTo(x - hl - wake, wl - 6); c.moveTo(x - hl, wl + 2); c.lineTo(x - hl - wake, wl + 8); c.stroke();
    for (let i = 0; i < 6; i++) { const k = ((f * (0.03 + v * 0.01) + i / 6) % 1); box(c, x - hl - k * wake, wl - 3 - k * 3 + (i % 2) * (6 + k * 8), 5 - k * 3, 2, foam); }
    c.globalAlpha = 1;
    if (v > 0.5) {
      const h = 4 + v * 2.4 + Math.sin(f * 0.5) * 1.5;
      c.fillStyle = foam; c.beginPath(); c.moveTo(x + hl - 4, wl); c.quadraticCurveTo(x + hl + 6, wl - h, x + hl + 14 + v * 2, wl - h * 0.4); c.lineTo(x + hl + 10, wl + 2); c.closePath(); c.fill();
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The station

const drawStation = (c: Ctx, state: GameState) => {
  const f = state.frame, top = GY - 280;
  // ---- the station's back wall (planks), its rafters, bulbs
  box(c, X(-300), top, X(900) - X(-300), GY - top, '#5A3E26');
  for (let x = X(-300); x < X(900); x += 22) box(c, x, top, 2, GY - top, '#3F2A18');
  for (let x = X(-280); x < X(900); x += 160) { box(c, x, top, 14, GY - top, INK); box(c, x + 2, top, 10, GY - top, '#6B4423'); }
  box(c, X(-300), top - 20, X(900) - X(-300), 22, INK); box(c, X(-300), top - 18, X(900) - X(-300), 18, '#4A3020');
  for (let x = X(-200); x < X(900); x += 180) { box(c, x - 1, top, 2, 30, INK); c.fillStyle = '#FEF08A'; c.beginPath(); c.arc(x, top + 34, 5, 0, Math.PI * 2); c.fill(); }
  // (the ride's big sign: burned planks, crossed axes)
  const sx = X(150);
  box(c, sx - 130, top + 30, 260, 56, INK); box(c, sx - 128, top + 32, 256, 52, '#A0703C'); box(c, sx - 128, top + 32, 256, 3, '#C8905A');
  signText(c, 'TIMBER TUMBLE', sx, top + 64, burned(3, 4));
  // (posters: YOU WILL GET WET, the rules)
  box(c, X(-150), top + 120, 70, 90, '#E7D8B0'); signText(c, 'RULES', X(-115), top + 136, painted(1, '#7F1D1D', '#E7D8B0'));
  for (let k = 0; k < 5; k++) box(c, X(-145), top + 146 + k * 11, 60, 2, '#8A7A5A');
  // ---- the exit out to the ride: a dark doorway, its rubber flaps
  box(c, X(820), GY - 150, 84, 150, INK); box(c, X(824), GY - 146, 76, 146, '#120C08');
  for (let k = 0; k < 6; k++) box(c, X(826) + k * 12 + Math.sin(f * 0.1 + k) * 2, GY - 140, 9, 110, '#2A2A30');
  box(c, X(810), GY - 170, 104, 20, '#7F1D1D'); signText(c, 'FLOAT ON', X(862), GY - 157, painted(1, '#FDE047', '#1C1209'));
  // ---- the last of the long line (the town's queue runs on into the station: the same pipe rails and boards): two
  // switchback rows on the platform, the back one up on a step (dimmed: not for standing on), every rail on its posts,
  // packed with guests, the ones at the front the ones he cut
  const QA = X(-300), QB = X(300);
  box(c, QA, GY - 26, QB - QA, 26, '#4A3220'); box(c, QA, GY - 26, QB - QA, 2, '#5A4028');
  for (let x = QA; x < QB; x += 30) box(c, x, GY - 24, 1, 24, '#3A2616');
  const rows: [number, number][] = [[GY - 26, 0.84], [GY, 1]];
  rows.forEach(([y, s], ri) => {
    for (const ry of [y - 40 * s, y - 22 * s]) box(c, QA, ry, QB - QA, Math.max(2, 3 * s), '#A1A1AA');
    for (let x = QA + 10; x <= QB; x += 46) box(c, x, y - 42 * s, Math.max(2, 4 * s), 42 * s, '#71717A');
    // (the turn at the end, round to the front row)
    if (ri === 0) box(c, QB - 2, y - 42 * s, 4, 42 * s + 26, '#A1A1AA');
    const n = Math.floor((QB - QA) / (30 * s));
    for (let k = 0; k < n; k++) {
      const gx = QA + 16 + k * 30 * s + hash(k + ri * 40) * 6;
      if (gx < state.camera.x - 40 || gx > state.camera.x + CANVAS_WIDTH + 40) continue;
      const seed = 211 + ri * 61 + k * 19, cut = ri === 1 && gx > X(120);
      c.save(); c.translate(gx, y); c.scale(s, s);
      drawPerson(c, { seed, outfit: 'guest', f, pose: cut && k % 2 ? 'point' : hash(seed) < 0.12 ? 'photo' : 'stand', mood: cut ? 'angry' : hash(seed + 1) < 0.2 ? 'happy' : 'bored' });
      c.restore();
    }
  });
  waitBoard(c, X(40), GY - 26, 96, '15 MIN FROM HERE');
  waitBoard(c, X(250), GY, 112, 'NEXT LOG. ALMOST THERE');
  // ---- the platform (to stand on: its lit lip) and the trough's channel past it
  box(c, X(-300), GY, X(PLATFORM_END) - X(-300), 40, INK); box(c, X(-300), GY + 2, X(PLATFORM_END) - X(-300), 38, '#7A5A3A');
  box(c, X(-300), GY, X(PLATFORM_END) - X(-300), 3, LIP);
  for (let x = X(-300); x < X(PLATFORM_END); x += 30) box(c, x, GY + 3, 1, 37, '#5A3E26');
};

// ---------------------------------------------------------------------------------------------------------------
// The flume

/** For each stretch of the ride on screen: (x from the section's start) every 40 px along it. */
const along = (state: GameState, a: number, b: number, step: number, fn: (rx: number) => void) => {
  const lo = Math.max(a, Math.floor((state.camera.x - 80 - x0) / step) * step), hi = Math.min(b, state.camera.x + CANVAS_WIDTH + 80 - x0);
  for (let rx = lo; rx <= hi; rx += step) fn(rx);
};

/** The flume's waterline at x: the ride's own (TRACK) up to the fault line, and past it where the ride was meant to go
 *  on (on the level, behind the chasm). */
const flumeY = (rx: number) => (rx < CHASM.a ? waterY(rx) : Y(-60));
/** The flume's gone at x: down the chasm, once the ground's broken under it. */
const flumeGone = (state: GameState, rx: number) => { const t = rideOf(state).cutT; return t >= BREAK_AT && rx >= CHASM.a - 20 && rx < CHASM.b + 10; };

const drawFlumeBack = (c: Ctx, state: GameState) => {
  const r = rideOf(state), f = state.frame;
  // (the flume proper: the station on past the fault line (the way the ride was meant to go))
  along(state, PLATFORM_END, FLUME_END, 20, rx => {
    const wy = flumeY(rx), x = X(rx);
    if (flumeGone(state, rx)) return;
    // (its back wall, planks)
    box(c, x, wy - 34, 21, 36, PLANK_D); box(c, x, wy - 34, 21, 3, PLANK_L);
    // (the water in it, running: the surface banded, its ripples going by with the flow)
    box(c, x, wy - 4, 21, 12, mix(RIVER, '#000000', 0.1)); box(c, x, wy - 4, 21, 2, mix(RIVER, '#FFFFFF', 0.2));
    if ((rx + Math.floor(f * 2.2)) % 60 < 10) box(c, x + 4, wy - 3, 10, 2, RIVER_L);
    if ((rx * 3 + Math.floor(f * 1.7)) % 80 < 6) box(c, x + 10, wy + 1, 6, 1, '#E0F2FE');
    // (its trestles, where it's up off the ground: timber legs, cross-braced)
    if (wy < GY - 30 && rx % 80 === 0) {
      box(c, x - 4, wy + 10, 8, GY - wy - 10, INK); box(c, x - 3, wy + 10, 6, GY - wy - 10, '#6B4423');
      c.strokeStyle = '#5A3A1E'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, wy + 20); c.lineTo(x + 80, Math.min(GY, waterY(rx + 80) + 90)); c.stroke();
    }
    // (the lift hill's chain up the middle)
    if (rx >= 2500 && rx < 3000) box(c, x + ((Math.floor(f * 1.4)) % 20), wy + 2, 6, 3, '#71717A');
  });
  // (broken over the fault line: both ends splintered and sagging into the chasm, the water pouring off them; before it
  // goes, the length over the crack sagging, shaking)
  if (r.cutT >= BREAK_AT && onScreen(state, X(CHASM.a) - 60, X(CHASM.b) + 60)) {
    for (const [ex, dir] of [[CHASM.a - 20, 1], [CHASM.b + 10, -1]] as const) {
      const wy = Y(-60);
      for (let k = 0; k < 4; k++) { c.save(); c.translate(X(ex) + dir * k * 5, wy - 30); c.rotate(dir * (0.3 + k * 0.15)); box(c, -2, 0, 5, 40 + k * 6, PLANK); c.restore(); }
      for (let k = 0; k < 5; k++) box(c, X(ex) + dir * (8 + k * 3), wy + 4 + ((f * 6 + k * 13) % 90), 4, 8, RIVER_L);
    }
  }
};

const drawFlumeFront = (c: Ctx, state: GameState) => {
  const f = state.frame;
  along(state, PLATFORM_END, FLUME_END, 20, rx => {
    if (flumeGone(state, rx)) return;
    const wy = flumeY(rx), x = X(rx);
    // (the water over the log's foot, see-through, rippling; then the near wall down from just under the surface, its
    // lit top, over his legs and the log's belly)
    c.globalAlpha = 0.5; box(c, x, wy - 3, 21, 6, RIVER); c.globalAlpha = 1;
    box(c, x, wy - 3 + Math.round(Math.sin(f * 0.12 + rx * 0.05)), 21, 1, RIVER_L);
    box(c, x, wy + 3, 21, 22, PLANK); box(c, x, wy + 3, 21, 3, PLANK_L); box(c, x + 20, wy + 3, 1, 22, PLANK_D);
    box(c, x, wy + 22, 21, 3, PLANK_D);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The ride's scenery (the park's fakery)

/** A fiberglass rock: lumpy, its seams, its bolts showing. */
const fakeRock = (c: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 2, y + h);
  for (let k = 0; k <= 8; k++) c.lineTo(x + (w * k) / 8, y + (k === 0 || k === 8 ? h * 0.3 : hash(seed + k) * h * 0.35) - 2);
  c.lineTo(x + w + 2, y + h); c.closePath(); c.fill();
  c.fillStyle = ROCKF; c.beginPath(); c.moveTo(x, y + h);
  for (let k = 0; k <= 8; k++) c.lineTo(x + (w * k) / 8, y + (k === 0 || k === 8 ? h * 0.3 : hash(seed + k) * h * 0.35));
  c.lineTo(x + w, y + h); c.closePath(); c.fill();
  box(c, x + w * 0.6, y + h * 0.3, w * 0.4, h * 0.7, ROCKF_D);
  box(c, x + 4, y + h * 0.35, w * 0.3, 3, ROCKF_L);
  // (the seam between two panels, and its bolts)
  box(c, x + w * 0.45, y + h * 0.3, 2, h * 0.7, ROCKF_D);
  for (let k = 0; k < 4; k++) box(c, x + w * 0.45 - 3 + (k % 2) * 6, y + h * 0.4 + k * h * 0.15, 3, 3, '#71717A');
};
/** A plywood pine: flat, painted, a 2x4 brace behind it. */
const plyPine = (c: Ctx, x: number, feet: number, h: number) => {
  box(c, x + 6, feet - h * 0.7, 4, h * 0.7, '#8A6A40');
  c.fillStyle = INK; c.beginPath(); c.moveTo(x, feet - h - 2); c.lineTo(x + h * 0.32 + 2, feet - 8); c.lineTo(x - h * 0.32 - 2, feet - 8); c.closePath(); c.fill();
  c.fillStyle = '#3F6A3A'; c.beginPath(); c.moveTo(x, feet - h); c.lineTo(x + h * 0.32, feet - 10); c.lineTo(x - h * 0.32, feet - 10); c.closePath(); c.fill();
  c.fillStyle = '#5A8A4A'; c.beginPath(); c.moveTo(x, feet - h); c.lineTo(x - h * 0.1, feet - h * 0.5); c.lineTo(x - h * 0.32, feet - 10); c.closePath(); c.fill();
  box(c, x - 3, feet - 10, 6, 10, '#5A3A1E');
};

const drawCanyon = (c: Ctx, state: GameState) => {
  // (the canyon's walls: fiberglass, both banks; plywood pines between; the creek's reeds and the beavers' fake dam)
  for (let rx = 920; rx < 2500; rx += 140) if (onScreen(state, X(rx), X(rx + 140))) {
    fakeRock(c, X(rx), GY - 190 - hash(rx) * 60, 130, 170 + hash(rx) * 60, rx);
    if (hash(rx + 9) > 0.5) plyPine(c, X(rx + 70), GY - 20, 120 + hash(rx + 2) * 40);
  }
  for (let rx = 1820; rx < 2480; rx += 24) if (onScreen(state, X(rx), X(rx + 24))) { box(c, X(rx), GY - 54 - hash(rx) * 14, 3, 40, '#5A7A3A'); box(c, X(rx) - 2, GY - 58 - hash(rx) * 14, 6, 8, '#7A5A30'); }
  // (the far ground)
  box(c, X(900), GY - 20, X(2500) - X(900), 4, '#6A8A3A');
};

const drawShedBack = (c: Ctx, state: GameState) => {
  const wy = waterY(3400), top = wy - 290, f = state.frame;
  // (the Old Sawmill's shed: its back wall, the rafters the saws hang from, a window, a painted mill wheel)
  box(c, X(3000), top, 900, wy + 30 - top, '#4A3020');
  for (let x = X(3000); x < X(3900); x += 18) box(c, x, top, 2, wy + 30 - top, '#3A2416');
  box(c, X(3000), top, 900, 16, INK); box(c, X(3000), top + 2, 900, 12, '#6B4423');
  for (const wx of [3120, 3420, 3660]) { box(c, X(wx), top + 60, 60, 50, INK); box(c, X(wx) + 3, top + 63, 54, 44, '#9CC0D8'); box(c, X(wx) + 28, top + 63, 3, 44, INK); }
  c.strokeStyle = '#6B4423'; c.lineWidth = 6; c.beginPath(); c.arc(X(3260), top + 160, 50, 0, Math.PI * 2); c.stroke();
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + f * 0.01; c.beginPath(); c.moveTo(X(3260), top + 160); c.lineTo(X(3260) + Math.cos(a) * 50, top + 160 + Math.sin(a) * 50); c.stroke(); }
  board(c, X(3500), top + 40, 'THE OLD SAWMILL');
};
const drawShedFront = (c: Ctx, state: GameState) => {
  const wy = waterY(3400), top = wy - 290;
  // (its doors at either end (big, open), its front posts)
  for (const dx of [3000, 3890]) { box(c, X(dx) - 6, top, 16, wy + 30 - top, INK); box(c, X(dx) - 4, top, 12, wy + 30 - top, '#6B4423'); }
  void state;
};

const drawSplash = (c: Ctx, state: GameState) => {
  const f = state.frame, py = waterY(4300);
  // (the pool: wide, its far bank of fiberglass, the drop's chute down into it)
  fakeRock(c, X(4280), py - 120, 200, 110, 4280);
  // (the viewing bridge over the pool's far side, soaked guests on it, the photo camera on its pole)
  box(c, X(4380), py - 150, 260, 12, INK); box(c, X(4382), py - 148, 256, 8, '#6B4423');
  for (let k = 0; k < 5; k++) { c.save(); c.translate(X(4400) + k * 46, py - 150); drawPerson(c, { seed: 331 + k * 23, outfit: 'guest', f, pose: k % 2 ? 'cheer' : 'photo', mood: 'happy' }); c.restore(); }
  box(c, X(4250), py - 170, 6, 170, INK); box(c, X(4238), py - 186, 30, 20, INK); box(c, X(4240), py - 184, 26, 16, '#3F3F46');
  c.fillStyle = rideOf(state).flash > 0 ? '#FFFFFF' : '#9CC0D8'; c.beginPath(); c.arc(X(4253), py - 176, 5, 0, Math.PI * 2); c.fill();
  board(c, X(4510), py - 175, 'SPLASH ZONE');
};

const drawCamp = (c: Ctx, state: GameState) => {
  // (the lumber camp: canvas tents, stacked logs, a plywood cookfire)
  for (let rx = 4600; rx < 5500; rx += 300) if (onScreen(state, X(rx), X(rx + 200))) {
    const y = waterY(rx) - 14;
    c.fillStyle = INK; c.beginPath(); c.moveTo(X(rx), y); c.lineTo(X(rx) + 50, y - 70); c.lineTo(X(rx) + 100, y); c.closePath(); c.fill();
    c.fillStyle = '#D8CCA8'; c.beginPath(); c.moveTo(X(rx) + 3, y - 1); c.lineTo(X(rx) + 50, y - 66); c.lineTo(X(rx) + 97, y - 1); c.closePath(); c.fill();
    for (let k = 0; k < 3; k++) for (let j = 0; j < 3 - k; j++) { c.fillStyle = INK; c.beginPath(); c.arc(X(rx) + 150 + j * 20 + k * 10, y - 10 - k * 18, 10, 0, Math.PI * 2); c.fill(); c.fillStyle = '#C8A070'; c.beginPath(); c.arc(X(rx) + 150 + j * 20 + k * 10, y - 10 - k * 18, 8, 0, Math.PI * 2); c.fill(); }
  }
};

/** The break: the park's back lot past the ride (a chain-link fence, AUTHORIZED ONLY); once the giant saw's down, the
 *  fault line: cracks running off along the ground both ways, and the chasm torn open between them, rock and dirt down
 *  its sides, down to the sewer's broken vault. */
const drawBreak = (c: Ctx, state: GameState) => {
  const r = rideOf(state), t = r.cutT;
  box(c, X(5900), GY - 90, 240, 3, '#A1A1AA');
  for (let x = X(5900); x < X(6140); x += 20) box(c, x, GY - 90, 2, 90, '#A1A1AA');
  box(c, X(5940), GY - 70, 110, 24, '#E5E7EB'); signText(c, 'AUTHORIZED ONLY', X(5995), GY - 55, painted(1, '#B91C1C', '#E5E7EB'));
  if (t < SLAM_AT) return;
  const open = t >= 999 ? 1 : Math.min(1, (t - SLAM_AT) / 44);
  const a = X(CHASM.a), b = X(CHASM.b), mid = (a + b) / 2, half = ((b - a) / 2) * open, bottom = waterY(CHASM.b) - 236;
  // (the cracks, running off along the ground from it, growing)
  c.strokeStyle = '#120C08'; c.lineWidth = 3;
  for (const [dir, len] of [[-1, 200], [1, 170]] as const) {
    c.beginPath(); c.moveTo(mid + dir * half, GY - 3);
    for (let k = 1; k <= 8; k++) c.lineTo(mid + dir * (half + (len * open * k) / 8), GY - 3 + (k % 2 ? 4 : -1) + hash(k + dir) * 6);
    c.stroke();
  }
  if (half < 2) return;
  // (the chasm: jagged walls of dirt and rock down into the dark)
  const edge = (side: -1 | 1) => { const pts: [number, number][] = []; for (let k = 0; k <= 10; k++) { const y = GY - 4 + ((bottom - GY + 4) * k) / 10, w = half * (1 - k * 0.04) + (hash(k * 3 + side) - 0.5) * 14 * open; pts.push([mid + side * w, y]); } return pts; };
  const L = edge(-1), R = edge(1);
  c.fillStyle = '#0A0806'; c.beginPath(); c.moveTo(L[0][0], L[0][1]); for (const p of L) c.lineTo(p[0], p[1]); for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath(); c.fill();
  c.strokeStyle = '#6A5A44'; c.lineWidth = 3;
  for (const side of [L, R]) { c.beginPath(); c.moveTo(side[0][0], side[0][1]); for (const p of side) c.lineTo(p[0], p[1]); c.stroke(); }
  for (let k = 0; k < 8; k++) { const p = (k % 2 ? L : R)[1 + k]; box(c, p[0] - 5, p[1], 10, 6, k % 3 ? '#5A4630' : '#7A766E'); }
  // (the ground's torn edges, the grass turned up)
  box(c, mid - half - 14, GY - 6, 16, 6, '#6A8A3A'); box(c, mid + half - 2, GY - 5, 16, 5, '#6A8A3A');
};

// ---------------------------------------------------------------------------------------------------------------
// The sewer

const drawSewerBack = (c: Ctx, state: GameState) => {
  const f = state.frame, r = rideOf(state);
  along(state, 5640, 8460, 40, rx => {
    const wy = waterY(Math.max(rx, 5840)), x = X(rx), top = wy - 240;
    // (the brick tunnel: its back wall, the arch's shade at the top, the water's channel)
    box(c, x, top, 41, wy + 60 - top, BRICK);
    for (let k = 0; k < 15; k++) box(c, x + ((k % 2) * 20), top + k * 16, 41, 2, BRICK_D);
    box(c, x, top, 41, 26, mix(BRICK, '#000000', 0.45));
    // (the slime line on the wall, at the high-water mark)
    box(c, x, wy - 40, 41, 6, '#3A4A1E');
    // (the sludge: thick, brown-green, a sheen moving on it)
    box(c, x, wy - 4, 41, 64, SLUDGE);
    if ((rx + Math.floor(f * 1.2)) % 80 < 10) box(c, x + 6, wy - 3, 12, 2, SLUDGE_L);
  });
  // (the rats' walkways along the back wall: dimmed, they're not his)
  for (const [a, b, h] of WALKWAYS) if (onScreen(state, X(a), X(b))) { box(c, X(a), Y(h), X(b) - X(a), 10, '#3A322A'); box(c, X(a), Y(h), X(b) - X(a), 2, '#5A4E40'); }
  // (the storm grates up in the roof, daylight down through them; pipes along the wall; a drip)
  for (let rx = 6000; rx < 8400; rx += 520) if (onScreen(state, X(rx) - 60, X(rx) + 60)) {
    const top = waterY(rx) - 240;
    box(c, X(rx) - 30, top - 6, 60, 10, '#3F3F46'); for (let k = 0; k < 5; k++) box(c, X(rx) - 26 + k * 12, top - 6, 4, 10, '#9CA3AF');
    c.globalAlpha = 0.12; c.fillStyle = '#FEF9C3'; c.beginPath(); c.moveTo(X(rx) - 26, top); c.lineTo(X(rx) + 26, top); c.lineTo(X(rx) + 60, waterY(rx)); c.lineTo(X(rx) - 60, waterY(rx)); c.closePath(); c.fill(); c.globalAlpha = 1;
  }
  // (a water main along the back wall: a fat round pipe, lit along its top and dark under, its joints' collars and their
  // bolts every so often, hung on brackets, rust and slime weeping down from the joints)
  along(state, 5840, 8400, 40, rx => {
    const y = waterY(rx) - 160, x = X(rx);
    box(c, x, y - 1, 41, 20, INK); box(c, x, y, 41, 18, '#5A5A48'); box(c, x, y + 1, 41, 4, '#7A7A64'); box(c, x, y + 13, 41, 5, '#3F3F34');
    if (rx % 160 === 0) {
      box(c, x - 4, y - 4, 10, 26, INK); box(c, x - 3, y - 3, 8, 24, '#6A6A58');
      for (let k = 0; k < 3; k++) box(c, x - 1, y + 1 + k * 7, 3, 2, '#3F3A30');
      box(c, x + 2, y + 22, 2, 14 + hash(rx) * 20, '#4A5A22');
    }
    if (rx % 240 === 0) { box(c, x + 18, y - 40, 4, 40, '#3F3A30'); box(c, x + 12, y + 18, 16, 3, '#3F3A30'); }
  });
  // (the vault broken through where he came down: the hole up into the chasm, daylight down through it, rubble)
  if (r.cutT >= SLAM_AT + 20 && onScreen(state, X(CHASM.a) - 40, X(CHASM.b) + 40)) {
    const top = waterY(5850) - 240, a = X(CHASM.a) + 10, b = X(CHASM.b) - 10;
    c.fillStyle = '#0A0806'; c.beginPath(); c.moveTo(a, top - 6); for (let k = 0; k <= 6; k++) c.lineTo(a + ((b - a) * k) / 6, top + 14 + hash(k + 9) * 18); c.lineTo(b, top - 6); c.closePath(); c.fill();
    c.globalAlpha = 0.16; c.fillStyle = '#FEF9C3'; c.beginPath(); c.moveTo(a + 10, top); c.lineTo(b - 10, top); c.lineTo(b + 30, waterY(5850)); c.lineTo(a - 30, waterY(5850)); c.closePath(); c.fill(); c.globalAlpha = 1;
    for (let k = 0; k < 7; k++) box(c, a - 10 + k * 26, top + 22 + hash(k) * 12, 12, 8, k % 2 ? BRICK : '#6A5A44');
  }
  // (a caged bulb now and then)
  for (let rx = 5980; rx < 8400; rx += 400) if (onScreen(state, X(rx), X(rx))) { box(c, X(rx) - 4, waterY(rx) - 200, 8, 10, '#3F3F46'); c.fillStyle = '#FDE68A'; c.beginPath(); c.arc(X(rx), waterY(rx) - 186, 4, 0, Math.PI * 2); c.fill(); }
};
const drawSewerFront = (c: Ctx, state: GameState) => {
  along(state, 5840, 8440, 40, rx => {
    const wy = waterY(rx), x = X(rx);
    // (the sludge over the log's bottom: see-through, its lit line)
    c.globalAlpha = 0.7; box(c, x, wy - 2, 41, 30, SLUDGE); c.globalAlpha = 1;
    box(c, x, wy - 2, 41, 2, SLUDGE_L);
    // (the near edge of the channel, brick, and the dark under it)
    box(c, x, wy + 26, 41, 40, BRICK_D);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The culvert and the real river

const drawCulvert = (c: Ctx, state: GameState) => {
  const cy = waterY(8440) - 100;
  // (the bluff's face: earth and real rock, the park's fence along its top edge (busted where the log came through))
  box(c, X(8300), GY, X(8460) - X(8300), 1100, EARTH);
  c.fillStyle = '#6A6258'; c.beginPath(); c.moveTo(X(8440), GY); c.lineTo(X(8470), GY + 300); c.lineTo(X(8450), GY + 700); c.lineTo(X(8480), GY + 1100); c.lineTo(X(8440), GY + 1100); c.closePath(); c.fill();
  // (the culvert's concrete headwall, the round mouth, the busted chain-link across it)
  box(c, X(8400), cy - 130, 60, 260, INK); box(c, X(8402), cy - 128, 56, 256, '#A8A29E'); box(c, X(8402), cy - 128, 56, 6, '#D6D3D1');
  c.fillStyle = '#1A1610'; c.beginPath(); c.ellipse(X(8440), cy + 20, 26, 100, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#A1A1AA'; c.lineWidth = 1;
  for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(X(8462), cy - 70 + k * 20); c.lineTo(X(8490) + k * 3, cy - 40 + k * 26); c.stroke(); }
  // (PARK PROPERTY ENDS, on the headwall: the park's own sign, its last one)
  box(c, X(8470), cy - 170, 150, 46, INK); box(c, X(8472), cy - 168, 146, 42, '#7F1D1D');
  signText(c, 'PARK PROPERTY ENDS', X(8545), cy - 152, painted(1, '#FDE047', '#1C1209'));
  signText(c, 'NOT RESPONSIBLE PAST HERE', X(8545), cy - 136, painted(1, '#FEF3C7', '#1C1209'));
  box(c, X(8476), cy - 124, 4, 30, '#52525B'); box(c, X(8610), cy - 124, 4, 30, '#52525B');
  // (the spillway: concrete, down into the river, water sheeting off it)
  c.fillStyle = '#8A847C'; c.beginPath(); c.moveTo(X(8440), waterY(8440) + 30); c.lineTo(X(8640), waterY(8640) + 30); c.lineTo(X(8640), waterY(8640) + 80); c.lineTo(X(8440), waterY(8440) + 80); c.closePath(); c.fill();
};

const drawRiverBack = (c: Ctx, state: GameState) => {
  const f = state.frame;
  along(state, 8440, 11000, 40, rx => {
    const wy = waterY(rx), x = X(rx);
    // (the far bank: real rock and grass, a real pine now and then, every one different)
    box(c, x, wy - 60, 41, 60, '#5A6A3A'); box(c, x, wy - 60, 41, 4, '#7A9A4A');
    if (hash(rx) > 0.55) { const h = 90 + hash(rx + 3) * 90, tx = x + 20; c.fillStyle = INK; c.beginPath(); c.moveTo(tx, wy - 60 - h - 2); c.lineTo(tx + h * 0.28 + 2, wy - 58); c.lineTo(tx - h * 0.28 - 2, wy - 58); c.closePath(); c.fill(); c.fillStyle = hash(rx + 1) > 0.5 ? '#24502A' : '#2E5E34'; c.beginPath(); c.moveTo(tx, wy - 60 - h); c.lineTo(tx + h * 0.28, wy - 60); c.lineTo(tx - h * 0.28, wy - 60); c.closePath(); c.fill(); box(c, tx - 3, wy - 66, 6, 8, '#4A3420'); }
    if (hash(rx + 11) > 0.8) { c.fillStyle = '#6E6A62'; c.beginPath(); c.ellipse(x + 20, wy - 58, 18, 10, 0, Math.PI, 0); c.fill(); }
    // (the water: running, banded deeper, foam streaks going downstream)
    box(c, x, wy - 4, 41, 120, RIVER); box(c, x, wy + 30, 41, 90, RIVER_D);
    if ((rx - Math.floor(f * 3)) % 90 < 14) box(c, x + 8, wy - 3, 16, 2, '#E0F2FE');
  });
  // (the real waterfall: a ledge of real rock, the water pouring over, the mist)
  if (onScreen(state, X(9820), X(10040))) {
    const top = waterY(9860), bot = waterY(9990);
    c.fillStyle = '#5A5650'; c.beginPath(); c.moveTo(X(9850), top); c.lineTo(X(9880), top); c.lineTo(X(9900), bot + 40); c.lineTo(X(9850), bot + 40); c.closePath(); c.fill();
    for (let k = 0; k < 10; k++) box(c, X(9866) + k * 10, top + ((f * 7 + k * 23) % (bot - top)), 6, 14, k % 2 ? '#E0F2FE' : '#BFDBFE');
    c.globalAlpha = 0.35; c.fillStyle = '#F1F5F9'; c.beginPath(); c.ellipse(X(9990), bot - 10, 90, 30, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  }
  // (the clearing's bank under the chipper, real dirt down to the river)
  if (onScreen(state, X(10900), X(11200))) box(c, CHIPPER.x - 60, CHIPPER.ground, X(CLEARING.a) - CHIPPER.x + 60, 200, '#4A3420');
};
const drawRiverFront = (c: Ctx, state: GameState) => {
  along(state, 8640, 10780, 40, rx => {
    const wy = waterY(rx), x = X(rx);
    c.globalAlpha = 0.6; box(c, x, wy - 2, 41, 30, RIVER); c.globalAlpha = 1;
    box(c, x, wy - 2, 41, 2, RIVER_L);
    // (the near bank, under: real stones)
    box(c, x, wy + 28, 41, 60, '#3A4A2A');
    if (hash(rx + 5) > 0.6) { c.fillStyle = '#6E6A62'; c.beginPath(); c.ellipse(x + 20, wy + 30, 16, 8, 0, Math.PI, 0); c.fill(); }
  });
};

/** A queue board up on its post (the town's WAIT FROM HERE boards': yellow, painted). */
const waitBoard = (c: Ctx, x: number, feet: number, up: number, text: string) => {
  const w = text.length * 6 + 14;
  box(c, x - 3, feet - up, 6, up, INK); box(c, x - 2, feet - up, 4, up, '#6B4423');
  box(c, x - w / 2 - 1, feet - up - 9, w + 2, 18, INK); box(c, x - w / 2, feet - up - 8, w, 16, '#FDE047');
  signText(c, text, x, feet - up + 4, painted(1, '#1C1917', '#FDE047'));
};

/** A board with burned letters, hung at its middle. */
const board = (c: Ctx, x: number, y: number, text: string) => {
  const w = text.length * 12 + 20;
  box(c, x - w / 2 - 1, y - 13, w + 2, 26, INK); box(c, x - w / 2, y - 12, w, 24, '#A0703C'); box(c, x - w / 2, y - 12, w, 2, '#C8905A');
  signText(c, text, x, y + 7, burned(2, 3));
};

// ---------------------------------------------------------------------------------------------------------------
// The lighting

export const rideLighting = (state: GameState, lamps: Light[]): SceneLight | null => {
  const p = state.player, rx = p.pos.x + p.width / 2 - x0, me = { x: p.pos.x + p.width / 2, y: p.pos.y + 20, r: 120, a: 0.5 };
  if (inSewer(rx)) {
    const lights: Light[] = [me, ...lamps];
    for (let k = 6000; k < 8400; k += 520) lights.push({ x: X(k), y: waterY(k) - 120, r: 140, a: 0.55, color: '#FEF9C3' });
    for (let k = 5980; k < 8400; k += 400) lights.push({ x: X(k), y: waterY(k) - 186, r: 110, a: 0.6, color: '#FDE68A' });
    // (every obstacle lit out of the dark, so it reads well before it's on him: the pipes' caged work lamps, the busted
    // sections' orange blinkers, the outfalls' lamps going amber as they build)
    for (const k of PIPES) lights.push({ x: X(k) + 30, y: waterY(k) - DUCK_LINE - 22 - 70, r: 170, a: 0.85, color: '#FEF9C3' });
    for (const k of JUNK) lights.push({ x: X(k), y: waterY(k) - 40, r: 130, a: state.frame % 16 < 8 ? 0.8 : 0.45, color: '#FB923C' });
    for (const [k, ph] of GUSHERS) { const cyc = (state.frame + ph) % 160; lights.push({ x: X(k), y: waterY(k) - 200, r: 150, a: cyc >= 50 ? 0.75 : 0.35, color: cyc >= 115 && cyc < 150 ? '#FCA5A5' : cyc >= 50 ? '#FCD34D' : '#FEF3C7' }); }
    // (daylight down the chasm he came down)
    if (rideOf(state).cutT >= SLAM_AT) lights.push({ x: X((CHASM.a + CHASM.b) / 2), y: waterY(5850) - 120, r: 220, a: 0.7, color: '#FEF9C3' });
    return { dark: 0.62, shade: [10, 12, 6], rim: 0.6, lights };
  }
  if (indoorsAt(rx)) {
    const lights: Light[] = [...lamps];
    if (rx < 900) for (let k = -200; k < 900; k += 180) lights.push({ x: X(k), y: GY - 246, r: 200, a: 0.6, color: '#FEF08A' });
    else for (const k of [3150, 3450, 3690]) lights.push({ x: X(k), y: waterY(3400) - 200, r: 200, a: 0.5, color: '#F8FAFC' });
    return { dark: 0.3, shade: [24, 14, 8], rim: 0.55, lights };
  }
  return todLight(timeOfDay().lamps > 0.05 ? lamps : [], 1);
};
void CHIPPER;
