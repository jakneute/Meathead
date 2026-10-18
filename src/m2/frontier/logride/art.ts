// Timber Tumble, drawn (the final pass: peak SNES). The PARK's log ride (a plank flume on its trestles through molded
// fiberglass crags with the bolts showing, plywood pines on their braces, the Old Sawmill's shed, the big drop and its
// splash pool with the ride photo's camera and soaked guests on the bridge, the lumber camp and its silk cookfire), then
// under it all the SEWER (brick, dark, sludge, grates letting the day down in soft bands), then out of the bluff the park
// sits on into the REAL wilderness (a real river between real banks, real trees, real rock, the real world's junk, a
// real waterfall: no bolts, no paint, no plywood). The pieces: far.ts (the far off by the hour), flume.ts, parkArt.ts
// (the earth, the station, the canyon, the shed, the pool, the camp, the break), sewerArt.ts (the sewer, the culvert),
// realArt.ts (the river, the falls, the clearing's bank); here the order they go down in, the log, the big splashes and
// the lighting.
//
// Standable reads standable: the station's platform and the clearing have their lit lips; the walkways in the sewer
// are the rats' (dimmed: he's never off the log down there). Impassable reads impassable: the duck-unders are walls
// down to the gap (hazards.ts).

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { todLight, timeOfDay } from '../../timeOfDay';
import { signText } from '../../signLetters';
import { onScreen, parkSign } from '../kit';
import { type Ctx, box, checker, mix, hash, still, INK, hr, asIs, pixelBlob, POOL, RIVER, SLUDGE, FAKEBARK, RINGS, CONCRETE } from './paint';
import { X, Y, x0, waterY, inSewer, indoorsAt, realAt, SIGNS, LOAD_X, CHASM, CHIPPER, PIPES, JUNK, GUSHERS, DUCK_LINE } from './layout';
import { LOG_LEN, RIM } from './ride';
import { rideOf } from './state';
import { drawFlumeBack, drawFlumeFront } from './flume';
import { drawEarth, drawStation, drawCanyon, drawShedBack, drawShedFront, drawSplashPool, drawCamp, drawBreak, SLAM_AT } from './parkArt';
import { drawSewerBack, drawSewerFront, drawCulvert } from './sewerArt';
import { drawRiverBack, drawRiverFront, drawFalls, drawClearingBank } from './realArt';

export { drawRideBackdrop } from './far';

/** Where the camera's looking (x from the section's start). */
const camRx = (state: GameState) => state.camera.x + CANVAS_WIDTH / 2 - x0;

/** Which water it is at x: the park's pool-blue flume, the sewer's sludge, the real river. */
type Wet = 'pool' | 'sludge' | 'river';
const wetAt = (rx: number): Wet => (rx > 5700 && rx < 8440 ? 'sludge' : rx >= 8440 ? 'river' : 'pool');
/** Its tones for the splashes and the water round the log: deep, body, light, crest, foam. */
const WET: Record<Wet, () => [string, string, string, string, string]> = {
  pool: () => { const W = hr('pool', POOL, 0.12); return [W[4], W[6], W[7], W[8], '#F8FCFE']; },
  sludge: () => { const S = asIs(SLUDGE); return [S[3], S[5], S[6], S[7], '#C8C48A']; },
  river: () => { const R = hr('river', RIVER, 0.16); return [R[4], R[6], R[7], R[8], '#F2F8F4']; },
};

// ---------------------------------------------------------------------------------------------------------------
// The world, behind the cast

export const drawRideBack = (c: Ctx, state: GameState) => {
  const vis = (a: number, b: number) => onScreen(state, X(a), X(b));
  if (vis(-300, 8440)) drawEarth(c, state);
  if (vis(-300, 900)) drawStation(c, state);
  // (the park's scenery behind the trough, then the trough)
  if (vis(900, 2500)) drawCanyon(c, state);
  if (vis(3000, 3900)) drawShedBack(c, state);
  if (vis(3880, 4700)) drawSplashPool(c, state);
  if (vis(4250, 5600)) drawCamp(c, state);
  if (vis(5400, 6200)) drawBreak(c, state);
  drawFlumeBack(c, state);
  // (under the park; out of it)
  if (vis(5640, 8460)) drawSewerBack(c, state);
  if (vis(8300, 8760)) drawCulvert(c, state);
  if (vis(8400, 11100)) drawRiverBack(c, state);
  if (vis(9800, 10060)) drawFalls(c, state);
  if (vis(10880, 11220)) drawClearingBank(c, state);
  for (const [rx, h, words, warn] of SIGNS) if (vis(rx - 120, rx + 120)) parkSign(c, X(rx), Y(h) - (h < 0 ? 18 : 0), words, { warn, seed: rx, tall: 70 });
};
/** The log's far side and its inside (he sits in it), and its near side over his legs. */
export const drawLogBack = (c: Ctx, state: GameState) => drawLog(c, state, true);
export const drawLogFront = (c: Ctx, state: GameState) => drawLog(c, state, false);

/** In front of the cast: the trough's near wall and the water's front (over his feet and the log's bottom), the
 *  sewer's sludge and near edge, the river's front and near bank, the shed's doorposts. */
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
// water running down the screen. Huge, drawn last, in front of everything. In the water's own tones (pool-blue in the
// park, sludge in the sewer, the river's), stepped: a deep body, a lit band up its face, the crest, the foam.

const drawWaves = (c: Ctx, state: GameState) => {
  const r = rideOf(state), f = state.frame;
  for (const w of r.waves) {
    if (!onScreen(state, w.x - 600, w.x + 700)) continue;
    const t = w.t, S = w.s, wet = wetAt(w.x - x0), [deep, body, light, crest, foam] = WET[wet]();
    const rise = t < 14 ? Math.sin((t / 14) * Math.PI / 2) : Math.max(0, 1 - (t - 14) / 72);
    const fade = t < 70 ? 1 : Math.max(0, (110 - t) / 40);
    // (the hit: a flash of white water over the whole view)
    if (t < 8) { c.globalAlpha = 0.45 * (1 - t / 8); c.fillStyle = mix(crest, '#FFFFFF', 0.4); c.fillRect(state.camera.x - 10, state.camera.y - 10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20); }
    // (the mist hanging over it, rising: soft stepped clouds)
    for (let i = 0; i < 7; i++) {
      c.globalAlpha = 0.2 * fade * Math.min(1, t / 6);
      pixelBlob(c, w.x - 200 * S + i * 70 * S, w.y - 80 * S - t * 1.6 - hash(i) * 120 * S, (56 + t * 0.9) * S, (30 + t * 0.5) * S, crest);
    }
    // (the curtains: thrown up and out back the way he came and, the biggest, on ahead: way over his head)
    for (const s of [-1, 1] as const) {
      const big = s > 0 ? 1.05 : 0.8, H = 350 * S * rise * big, out = (60 + t * 4.2) * big * S, base = w.x + s * 20;
      c.globalAlpha = 0.88 * fade;
      // (the sheet: thick at its foot, up and out, curling over at the top; a lit band up its face)
      c.fillStyle = deep; c.beginPath(); c.moveTo(base, w.y + 4);
      c.quadraticCurveTo(base + s * out * 0.15, w.y - H * 1.05, base + s * out, w.y - H * 0.8);
      c.quadraticCurveTo(base + s * out * 1.35, w.y - H * 0.55, base + s * (out * 1.25 + 30), w.y + 4); c.closePath(); c.fill();
      c.fillStyle = body; c.beginPath(); c.moveTo(base + s * 6, w.y + 2);
      c.quadraticCurveTo(base + s * out * 0.2, w.y - H * 0.95, base + s * out * 0.95, w.y - H * 0.76);
      c.quadraticCurveTo(base + s * out * 1.2, w.y - H * 0.5, base + s * (out * 1.1 + 18), w.y + 2); c.closePath(); c.fill();
      c.fillStyle = light; c.beginPath(); c.moveTo(base + s * 10, w.y);
      c.quadraticCurveTo(base + s * out * 0.22, w.y - H * 0.88, base + s * out * 0.7, w.y - H * 0.72);
      c.quadraticCurveTo(base + s * out * 0.55, w.y - H * 0.5, base + s * out * 0.4, w.y); c.closePath(); c.fill();
      // (the crest breaking into drops, falling as it goes over: chunky, inked)
      for (let i = 0; i < 22; i++) {
        const u = i / 21, px = base + s * out * (0.2 + u * 1.15) + s * hash(i + t) * 8, py = w.y - H * (0.98 - u * 0.5) + Math.max(0, t - 14) * u * 2.6 - hash(i * 3) * 16, sz = 4 + Math.round(hash(i * 7) * 7);
        box(c, px - sz / 2 - 1, py - sz / 2 - 1, sz + 2, sz + 2, deep); box(c, px - sz / 2, py - sz / 2, sz, sz, crest); box(c, px - sz / 2, py - sz / 2, Math.max(1, sz / 3), Math.max(1, sz / 3), foam);
      }
      // (streaks down its face)
      c.globalAlpha = 0.6 * fade;
      for (let i = 0; i < 7; i++) { const u = 0.2 + i * 0.12, px = base + s * out * u; box(c, px, w.y - H * (0.85 - u * 0.4), 3, H * 0.45, crest); box(c, px + 3, w.y - H * (0.8 - u * 0.4), 1, H * 0.3, light); }
    }
    // (the sheet thrown on ahead, arching right over the log and him)
    if (rise > 0.05) {
      const a0 = w.x - 30 * S, a1 = w.x + (180 + t * 3) * S, top = w.y - 300 * S * rise;
      c.globalAlpha = 0.6 * fade; c.strokeStyle = body; c.lineWidth = 20 * rise * S;
      c.beginPath(); c.moveTo(a0, w.y); c.quadraticCurveTo((a0 + a1) / 2, top - 60 * S, a1, w.y - 10); c.stroke();
      c.globalAlpha = 0.75 * fade; c.strokeStyle = light; c.lineWidth = 9 * rise * S;
      c.beginPath(); c.moveTo(a0, w.y); c.quadraticCurveTo((a0 + a1) / 2, top - 63 * S, a1, w.y - 10); c.stroke();
      c.globalAlpha = 0.85 * fade; c.strokeStyle = crest; c.lineWidth = 4 * rise * S;
      c.beginPath(); c.moveTo(a0, w.y); c.quadraticCurveTo((a0 + a1) / 2, top - 66 * S, a1, w.y - 10); c.stroke();
    }
    // (the near wall of water, thrown up toward us in front of the log: his legs and the log's side behind it)
    {
      const nH = 130 * S * rise, nx0 = w.x - 150 * S, nx1 = w.x + 220 * S;
      const edge = (k: number) => { c.beginPath(); c.moveTo(nx0, w.y + 10); for (let i = 0; i <= 12; i++) { const u = i / 12, bump = Math.sin(u * Math.PI) * (0.6 + 0.4 * Math.sin(i * 1.7 + t * 0.4)); c.lineTo(nx0 + (nx1 - nx0) * u, w.y - nH * bump * k); } c.lineTo(nx1, w.y + 10); c.closePath(); c.fill(); };
      c.globalAlpha = 0.6 * fade; c.fillStyle = body; edge(1);
      c.globalAlpha = 0.5 * fade; c.fillStyle = light; edge(0.6);
      c.globalAlpha = 0.9 * fade;
      for (let i = 0; i < 12; i++) { const u = (i + 0.5) / 12, bump = Math.sin(u * Math.PI) * (0.6 + 0.4 * Math.sin(i * 1.7 + 0.85 + t * 0.4)), sz = 6 + Math.round(hash(i + 9) * 6), px = nx0 + (nx1 - nx0) * u, py = w.y - nH * bump; box(c, px - sz / 2, py - sz / 2, sz, sz, crest); box(c, px - sz / 2, py - sz / 2, 2, 2, foam); }
    }
    // (the white burst of foam on the surface, spreading, and the white water boiling round the log's foot)
    c.globalAlpha = 0.85 * fade; c.strokeStyle = crest; c.lineWidth = 6;
    c.beginPath(); c.ellipse(w.x + 30, w.y, (70 + t * 5) * S, 8 + t * 0.25, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = foam; c.lineWidth = 2; c.stroke();
    c.globalAlpha = 0.9 * fade;
    for (let i = 0; i < 22; i++) { const px = w.x - 180 * S + i * 20 * S + Math.sin(t * 0.3 + i) * 5, py = w.y - 2 - hash(i + 5) * 8; pixelBlob(c, px, py, 12 + hash(i) * 10, 6 + hash(i + 1) * 5, i % 3 ? crest : foam); }
    c.globalAlpha = 1;
  }
  // (the spray, up and raining back down)
  for (const d of r.spray) {
    if (d.x < state.camera.x - 20 || d.x > state.camera.x + CANVAS_WIDTH + 20) continue;
    const [, body, light, crest] = WET[d.sewer ? 'sludge' : wetAt(d.x - x0)]();
    c.globalAlpha = Math.min(1, d.life / 30) * 0.9;
    c.fillStyle = d.s > 4 ? crest : d.s > 3 ? light : body;
    c.fillRect(Math.round(d.x), Math.round(d.y), Math.ceil(d.s), Math.ceil(d.s * (d.vy > 0 ? 1.8 : 1.2)));
    if (d.vy > 3) { c.globalAlpha *= 0.4; c.fillRect(Math.round(d.x + d.s / 2), Math.round(d.y - d.vy * 1.5), 1, Math.round(d.vy * 1.5)); }
  }
  c.globalAlpha = 1;
  void f;
};

/** The splash's water down the screen (the lens: drops sliding down it), fading. */
const LENS = 130;
const drawLens = (c: Ctx, state: GameState) => {
  const r = rideOf(state);
  if (r.lens <= 0) return;
  const a = Math.min(1, r.lens / 60), run = LENS - r.lens, [, body, light] = WET[inSewer(camRx(state)) ? 'sludge' : wetAt(camRx(state))]();
  for (let i = 0; i < 26; i++) {
    const sx = state.camera.x + hash(i * 7 + 3) * CANVAS_WIDTH, sy = state.camera.y + ((hash(i * 3 + 1) * CANVAS_HEIGHT * 0.8 + run * (1.5 + hash(i) * 4)) % CANVAS_HEIGHT);
    const w = 9 + hash(i * 5) * 18, h = w * 1.3;
    c.globalAlpha = 0.34 * a; c.fillStyle = light;
    c.beginPath(); c.ellipse(sx, sy, w, h, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = body; c.beginPath(); c.ellipse(sx + w * 0.2, sy + h * 0.25, w * 0.7, h * 0.6, 0, 0, Math.PI * 2); c.fill();
    c.fillRect(sx - 2, sy - h - run * 0.6, 4, run * 0.6);
    c.globalAlpha = 0.6 * a; c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(sx - w * 0.45), Math.round(sy - h * 0.55), Math.max(2, w * 0.3), Math.max(2, h * 0.22));
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// The log: the park's, molded fiberglass painted as a hollowed log (too even, too brown), a mold seam bolted along it,
// its ends painted with rings, its number stenciled on; the sewer's muck up its side once it's been down there. On the
// water: ripples spreading off it, its wake, a bow wave at its nose, the foam round its foot.

/** The near side (local: the rim along y -RIM, the waterline 0). */
const paintLogNear = (g: Ctx, muck: boolean) => {
  const B = asIs(FAKEBARK), Rg = asIs(RINGS), hl = LOG_LEN / 2;
  g.fillStyle = INK; g.beginPath(); g.roundRect(-hl - 2, -RIM, LOG_LEN + 4, RIM + 12, 12); g.fill();
  g.save(); g.beginPath(); g.roundRect(-hl, -RIM + 2, LOG_LEN, RIM + 8, 10); g.clip();
  // (the bark: banded round, lit along its top, molded plates in rows, cracks between)
  const rows = [B[5], B[4], B[4], B[3], B[3], B[2], B[2], B[1]];
  rows.forEach((col, i) => { box(g, -hl, -RIM + 2 + i * 4.5, LOG_LEN, 5, col); if (i) checker(g, -hl, -RIM + 2 + i * 4.5 - 1, LOG_LEN, 2, rows[i - 1], i % 2); });
  for (let r = 0; r < 4; r++) for (let x = -hl + 6 + (r % 2) * 7; x < hl - 8; x += 14) {
    const y = -RIM + 6 + r * 8;
    box(g, x, y, 10, 1, B[r < 2 ? 6 : 4]); box(g, x + 10, y, 2, 6, B[1]); box(g, x, y + 6, 10, 1, B[1]);
  }
  // (the mold seam along it, its bolts; a scuff showing the white gelcoat)
  box(g, -hl, -RIM / 2 + 1, LOG_LEN, 1, B[0]); box(g, -hl, -RIM / 2 + 2, LOG_LEN, 1, B[5]);
  for (let x = -hl + 14; x < hl - 10; x += 26) { box(g, x, -RIM / 2, 3, 3, '#3F3F46'); box(g, x, -RIM / 2, 1, 1, '#C4CCD6'); }
  box(g, hl - 34, -RIM + 8, 6, 2, '#E8E2D2'); box(g, hl - 33, -RIM + 10, 3, 1, B[1]);
  // (the sewer's muck up its side, drips)
  if (muck) { box(g, -hl, -6, LOG_LEN, 6, 'rgba(74, 74, 26, 0.75)'); for (let x = -hl + 4; x < hl; x += 9) box(g, x, -12 + hash(x) * 4, 2, 6 + hash(x * 3) * 4, 'rgba(74, 74, 26, 0.7)'); }
  g.restore();
  // (the ends: painted rings, lit up the left)
  for (const ex of [-hl + 4, hl - 4]) {
    g.fillStyle = INK; g.beginPath(); g.ellipse(ex, -RIM / 2 + 4, 6, RIM / 2 + 3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Rg[3]; g.beginPath(); g.ellipse(ex, -RIM / 2 + 4, 5, RIM / 2 + 2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Rg[4]; g.beginPath(); g.ellipse(ex - 1, -RIM / 2 + 2, 3, RIM / 2 - 2, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = Rg[1]; g.lineWidth = 1; for (const k of [0.6, 0.3]) { g.beginPath(); g.ellipse(ex, -RIM / 2 + 4, 5 * k, (RIM / 2 + 2) * k, 0, 0, Math.PI * 2); g.stroke(); }
    box(g, ex - 1, -RIM / 2 + 3, 2, 2, Rg[0]);
  }
  // (its number on a painted plate)
  box(g, -17, -14, 34, 12, INK); box(g, -16, -13, 32, 10, '#E8D8A8'); box(g, -16, -13, 32, 1, '#FFF4D0');
  signText(g, 'TT-4', 0, -5, { sx: 1, sy: 1, fill: ['#5A1A10', '#3F2A14', '#3F2A14', '#2A1608'], stencil: true });
};

const drawLog = (c: Ctx, state: GameState, back: boolean) => {
  const r = rideOf(state), L = r.log;
  // (the station's waiting log, before he's in one; the log on the ride; gone into the chipper)
  const rx = L.mode === 'off' ? LOAD_X : L.rx;
  if (L.mode === 'done' || (L.mode === 'chipper' && rx > 11095)) return;
  const wl = waterY(rx), x = X(rx), wy = wl - L.bob - L.float, ang = Math.atan2(waterY(rx + 30) - waterY(rx - 30), 60);
  const hl = LOG_LEN / 2, f = state.frame;
  // (on the water (not up the chipper's conveyor, not down a drop))
  const onWater = rx < 10760 && Math.abs(ang) < 0.3 && L.mode !== 'leap';
  const wet = wetAt(rx), v = L.mode === 'ride' || L.mode === 'chipper' ? L.v : 0;
  const [, body, light, crest, foam] = WET[wet]();
  if (back && onWater) {
    for (let i = 0; i < 3; i++) {
      const k = ((f * 0.02 + i / 3) % 1), rw = hl + 12 + k * 70;
      c.globalAlpha = 0.55 * (1 - k); c.strokeStyle = light; c.lineWidth = 2;
      c.beginPath(); c.ellipse(Math.round(x - k * v * 12), wl, rw, 4 + k * 4, 0, Math.PI, Math.PI * 2); c.stroke();
    }
    c.globalAlpha = 1;
  }
  c.save(); c.translate(Math.round(x), Math.round(wy)); c.rotate(ang);
  if (back) {
    // (the far side's rim and the dark hollow of it, a molded bench across it)
    const B = asIs(FAKEBARK);
    box(c, -hl, -RIM - 3, LOG_LEN, 11, INK); box(c, -hl + 2, -RIM - 1, LOG_LEN - 4, 8, B[4]); box(c, -hl + 2, -RIM - 1, LOG_LEN - 4, 2, B[6]);
    box(c, -hl + 6, -RIM + 5, LOG_LEN - 12, 8, '#1E1008'); box(c, -hl + 6, -RIM + 5, LOG_LEN - 12, 2, '#0E0804');
    box(c, -hl + 22, -RIM + 7, 14, 6, INK); box(c, -hl + 23, -RIM + 8, 12, 4, B[3]); box(c, -hl + 23, -RIM + 8, 12, 1, B[5]);
  } else {
    still(c, `lr-log-${rx > 5840 ? 1 : 0}`, -hl - 4, -RIM - 2, LOG_LEN + 8, RIM + 16, g => paintLogNear(g, rx > 5840));
  }
  c.restore();
  if (!back && onWater) {
    // (the water over its foot: see-through, lapping; the foam collar; the wake's V trailing off its tail; the bow wave)
    c.globalAlpha = 0.55; box(c, x - hl - 8, wl - 3, LOG_LEN + 16, 12, body); c.globalAlpha = 1;
    for (let i = 0; i < 12; i++) { const px = Math.round(x - hl - 4 + i * 12 + Math.sin(f * 0.2 + i) * 2), py = Math.round(wl - 3 + Math.sin(f * 0.15 + i * 1.7)); box(c, px, py, 7, 2, crest); box(c, px + 1, py, 3, 1, foam); }
    const wake = 50 + v * 34;
    c.globalAlpha = 0.75;
    for (let i = 0; i < wake; i += 4) { const k = i / wake; box(c, x - hl - i, wl - 1 - k * 5, 4, 1, crest); box(c, x - hl - i, wl + 2 + k * 6, 4, 1, crest); if (i % 8 === 0) box(c, x - hl - i, wl - k * 5, 4, 1, light); }
    for (let i = 0; i < 6; i++) { const k = ((f * (0.03 + v * 0.01) + i / 6) % 1); box(c, x - hl - k * wake, wl - 3 - k * 3 + (i % 2) * (6 + k * 8), Math.max(1, 5 - k * 3), 2, foam); }
    c.globalAlpha = 1;
    if (v > 0.5) {
      const h = 4 + v * 2.4 + Math.sin(f * 0.5) * 1.5;
      c.fillStyle = light; c.beginPath(); c.moveTo(x + hl - 4, wl); c.quadraticCurveTo(x + hl + 6, wl - h, x + hl + 14 + v * 2, wl - h * 0.4); c.lineTo(x + hl + 10, wl + 2); c.closePath(); c.fill();
      c.fillStyle = foam; c.beginPath(); c.moveTo(x + hl - 2, wl - 1); c.quadraticCurveTo(x + hl + 6, wl - h, x + hl + 10 + v * 2, wl - h * 0.5); c.lineTo(x + hl + 6, wl - 1); c.closePath(); c.fill();
    }
  }
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
    if (rx < 900) for (let k = -200; k < 900; k += 180) lights.push({ x: X(k), y: GYL() - 246, r: 200, a: 0.6, color: '#FEF08A' });
    else for (const k of [3150, 3450, 3690]) lights.push({ x: X(k), y: waterY(3400) - 200, r: 200, a: 0.5, color: '#F8FAFC' });
    return { dark: 0.3, shade: [24, 14, 8], rim: 0.55, lights };
  }
  return todLight(timeOfDay().lamps > 0.05 ? lamps : [], 1);
};
const GYL = () => Y(0);
void CHIPPER; void realAt; void CONCRETE;
