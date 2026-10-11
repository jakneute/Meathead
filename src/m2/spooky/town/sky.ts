// The town's backdrop (screen space): the gloomy sky by the hour (banded; the moon and stars after dark), a low cloud
// bank drifting, the far hills (dead trees along their tops), the ELEVATOR TO HELL's clock tower far off behind the town
// (growing as he goes: small behind the rooftops at the gate, huge by the castle stairs, its spire off the top of the
// screen; all of it from how far along he is, never a jump), and the town's skyline nearer (gables, spires, chimneys,
// a lit window or two after dark). Each far layer's a tile painted once for the hour (a stamp) and slid along.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawTodSky, timeOfDay, hourMix, farTint, skyAt, cloudTint, type TimeOfDay } from '../../timeOfDay';
import { SECTIONS } from '../geometry';
import { STAIRS } from './layout';
import { type Ctx, INK, box, mix, hash, poly, stamp, checker, hazeBands, pixelBlob, SLATE } from './paint';

const { x0 } = SECTIONS.town;
const TW = 1024;

const SKY = ['#34304E', '#423C5E', '#544A6C', '#685A78', '#7E6C82', '#94808A'];
/** The ELEVATOR TO HELL's ride: up the tower slow, a hold at the top, then the drop (frames). */
const RIDE_UP = 420, RIDE_HOLD = 90, RIDE_DROP = 22, RIDE_REST = 120;

/** A tile, slid along with the camera at `k` of its speed, repeated across the screen. */
const tile = (c: Ctx, key: string, camX: number, k: number, y: number, h: number, paint: (g: Ctx) => void) => {
  let x = -((((camX * k) % TW) + TW) % TW);
  for (; x < CANVAS_WIDTH; x += TW) { c.save(); c.translate(Math.round(x), Math.round(y)); stamp(c, key, 0, 0, TW, h, paint); c.restore(); }
};
/** Something painted at tile x, and again a tile either side (so what's cut off one edge carries on at the other). */
const wrap = (x: number, draw: (x: number) => void) => { draw(x); if (x < 260) draw(x + TW); if (x > TW - 260) draw(x - TW); };

const hazeOf = (col: string, k: number, tod: TimeOfDay) => mix(farTint(col, 1, tod), skyAt(0.85, tod), k);

/** The cloud bank: long flat-bottomed clouds in three steps, lit along their tops. */
const paintClouds = (g: Ctx, tod: TimeOfDay) => {
  const body = cloudTint('#6A5A7E', tod), lit = cloudTint('#8A7896', tod), dk = cloudTint('#4E4262', tod);
  for (let i = 0; i < 7; i++) wrap(i * (TW / 7) + hash(i * 3.1) * 60, x => {
    const y = 40 + hash(i * 1.7) * 60, w = 140 + hash(i * 2.3) * 120;
    pixelBlob(g, x, y + 10, w * 0.5, 10, dk);
    pixelBlob(g, x - w * 0.1, y + 4, w * 0.4, 10, body);
    pixelBlob(g, x - w * 0.18, y, w * 0.24, 7, lit);
    box(g, x - w * 0.5, y + 14, w, 4, dk);
  });
};

/** The far hills: rolling, a lit rim, dead trees standing up off their tops, a ruined wall or two. */
const paintHills = (g: Ctx, tod: TimeOfDay) => {
  const H = 200;
  const body = hazeOf(hourMix('#2E2442', '#2E1F38', '#140E22', tod), 0.25, tod), rim = hazeOf(hourMix('#433660', '#45304E', '#221838', tod), 0.25, tod);
  const back = hazeOf(hourMix('#3A3052', '#3A2A44', '#1A1428', tod), 0.45, tod);
  // (a paler row behind)
  for (let i = 0; i < 9; i++) wrap(i * (TW / 9) + hash(i * 7.7) * 40, x => pixelBlob(g, x, 70 + hash(i) * 20, 110 + hash(i * 2) * 50, 40, back));
  box(g, 0, 90, TW, H - 90, back);
  for (let i = 0; i < 7; i++) wrap(i * (TW / 7) + hash(i * 4.9) * 50, x => {
    const y = 96 + hash(i * 3.3) * 26, rw = 120 + hash(i * 5.1) * 60;
    pixelBlob(g, x, y + 20, rw, 36, body);
    pixelBlob(g, x - rw * 0.25, y + 6, rw * 0.5, 14, rim);
  });
  box(g, 0, 130, TW, H - 130, body);
  // (dead trees: a trunk, crooked limbs)
  for (let i = 0; i < 10; i++) wrap(i * (TW / 10) + hash(i * 9.3) * 60, x => {
    const y = 104 + hash(i * 3.3) * 22, h = 22 + hash(i * 1.1) * 18;
    box(g, x, y - h, 2, h + 6, body);
    for (let k = 0; k < 3; k++) { const ly = y - h + 4 + k * 6, s = k % 2 ? 1 : -1; for (let j = 0; j < 6 - k; j++) box(g, x + s * j, ly - Math.floor(j / 2), 1, 1, body); }
  });
  // (a ruined abbey wall on one, its windows pointed)
  wrap(620, x => {
    box(g, x, 74, 60, 40, body); box(g, x + 40, 58, 14, 56, body);
    for (let k = 0; k < 3; k++) { box(g, x + 6 + k * 12, 84, 6, 14, back); box(g, x + 7 + k * 12, 82, 4, 2, back); }
  });
  hazeBands(g, 0, 100, TW, 90, skyAt(0.95, tod), 0.0, 0.25, 4);
};

/** The town's skyline (nearer): roofs shoulder to shoulder, steep gables and their finials, a spire, chimneys, dormers;
 *  windows lit after dark. Stepped: lit at the upper left. */
const paintSkyline = (g: Ctx, tod: TimeOfDay) => {
  const H = 300, G = 220;
  const R = SLATE.map(c => hazeOf(hourMix(mix(c, '#4A3E66', 0.35), mix(c, '#4E3450', 0.3), c, tod), 0.18, tod));
  const win = hourMix('#4A4060', '#8A5A2A', '#C8923C', tod), dark = hourMix('#2A2238', '#2A1E2C', '#0E0A16', tod);
  const lit = timeOfDay().lamps;
  let x = 0, i = 0;
  while (x < TW + 120) {
    const w = 70 + hash(i * 2.7) * 70, h = 70 + hash(i * 4.1) * 90, top = G - h, kind = hash(i * 6.3);
    const col = R[2 + (i % 2)], lt = R[4], dk = R[1];
    // (the house's body, its lit left edge and its shaded right)
    box(g, x, top, w, H - top, col); box(g, x, top, 3, H - top, lt); box(g, x + w - 4, top, 4, H - top, dk);
    if (kind < 0.6) {
      // A steep gable (its peak a finial), the bargeboard lit up its left slope
      const gh = Math.min(w * 0.9, 70);
      poly(g, [[x - 4, top + 1], [x + w / 2, top - gh], [x + w + 4, top + 1]], col);
      for (let k = 0; k < gh; k += 2) box(g, x - 4 + (k / gh) * (w / 2 + 4), top - k, 3, 2, lt);
      box(g, x + w / 2 - 1, top - gh - 10, 2, 10, dk); box(g, x + w / 2 - 2, top - gh - 12, 4, 3, dk);
      if (hash(i * 8.8) > 0.5) { box(g, x + w / 2 - 5, top - gh * 0.5, 10, 12, dark); box(g, x + w / 2 - 4, top - gh * 0.5 - 2, 8, 2, dark); }
    } else if (kind < 0.8) {
      // A mansard: the steep slate sides, dormers
      poly(g, [[x - 3, top + 1], [x + 8, top - 30], [x + w - 8, top - 30], [x + w + 3, top + 1]], dk);
      for (let k = 0; k < 30; k += 3) box(g, x + 8 - (k / 30) * 11, top - 30 + k, w - 16 + (k / 30) * 22, 1, col);
      for (let d = x + 12; d < x + w - 20; d += 26) { box(g, d, top - 22, 12, 16, col); poly(g, [[d - 2, top - 22], [d + 6, top - 30], [d + 14, top - 22]], lt); box(g, d + 3, top - 18, 6, 9, dark); }
    } else {
      // A spire (a church's), its belfry, the cross long gone: a weathervane
      box(g, x + w / 2 - 14, top - 50, 28, 50, col); box(g, x + w / 2 - 14, top - 50, 3, 50, lt);
      box(g, x + w / 2 - 5, top - 42, 10, 18, dark); box(g, x + w / 2 - 4, top - 45, 8, 3, dark);
      poly(g, [[x + w / 2 - 16, top - 50], [x + w / 2, top - 150], [x + w / 2 + 16, top - 50]], col);
      poly(g, [[x + w / 2 - 16, top - 50], [x + w / 2, top - 150], [x + w / 2 - 6, top - 50]], lt);
      box(g, x + w / 2 - 1, top - 166, 2, 16, dk); box(g, x + w / 2 - 6, top - 162, 12, 2, dk);
    }
    // (a chimney or two, their pots)
    if (hash(i * 3.9) > 0.35) { const cx = x + w * (0.65 + hash(i) * 0.2); box(g, cx, top - 46, 10, 46, dk); box(g, cx - 2, top - 48, 14, 4, col); box(g, cx + 2, top - 54, 3, 6, dk); box(g, cx + 6, top - 52, 3, 4, dk); }
    // (its windows: rows of them; lit after dark, some)
    for (let wy = top + 14; wy < G + 40; wy += 26) for (let wx = x + 10; wx < x + w - 14; wx += 18) {
      const on = lit > 0.1 && hash(wx * 0.37 + wy * 0.91) > 0.62;
      box(g, wx, wy, 7, 11, on ? win : dark); box(g, wx + 1, wy - 2, 5, 2, on ? win : dark);
      if (on) box(g, wx + 1, wy + 1, 2, 4, mix(win, '#FFF0C0', 0.35));
    }
    x += w + (hash(i * 5.5) > 0.7 ? 14 + hash(i) * 20 : -2);
    i++;
  }
  box(g, 0, G + 40, TW, H - G - 40, R[1]);
  checker(g, 0, G + 36, TW, 4, R[1]);
  hazeBands(g, 0, G - 40, TW, 90, skyAt(0.92, tod), 0.0, 0.18, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// The ELEVATOR TO HELL: the clock tower, drawn live (it grows), every edge snapped to the screen's pixels

const drawTower = (c: Ctx, state: GameState, tx: number, base: number, ts: number) => {
  const tod = timeOfDay(), f = state.frame;
  const H = (d: string, s: string, n: string) => hourMix(d, s, n, tod);
  const body = H('#3A3058', '#3A2A48', '#1E1630'), lit = H('#544872', '#54405E', '#2E2448'), lit2 = H('#6A5E8A', '#6A5272', '#3B2F58');
  const dk = H('#2A2242', '#2A1E36', '#140E22'), dk2 = H('#1E1830', '#1E1428', '#0C0816');
  const S = (v: number) => v * ts;
  /** A box in the tower's own units, snapped. */
  const R = (x: number, y: number, w: number, h: number, col: string) => {
    const a = Math.round(tx + S(x)), b = Math.round(base + S(y)), e = Math.round(tx + S(x + w)), d = Math.round(base + S(y + h));
    if (e > a && d > b) { c.fillStyle = col; c.fillRect(a, b, e - a, d - b); }
  };
  const P = (pts: [number, number][], col: string) => poly(c, pts.map(([x, y]) => [Math.round(tx + S(x)), Math.round(base + S(y))] as [number, number]), col);
  const T = -430;
  // The shaft: inked, stepped across (lit at its left), coursed, quoins at its corners
  R(-52, T + 68, 104, -T - 68, INK);
  R(-50, T + 70, 100, -T - 70, body);
  R(-50, T + 70, 10, -T - 70, lit); R(-50, T + 70, 4, -T - 70, lit2);
  R(28, T + 70, 22, -T - 70, dk); R(42, T + 70, 8, -T - 70, dk2);
  for (let y = T + 84; y < 0; y += 16) { R(-40, y, 68, 1, dk); }
  for (let y = T + 76, k = 0; y < -6; y += 16, k++) { R(-50, y, k % 2 ? 10 : 16, 8, lit2); R(k % 2 ? 40 : 34, y, k % 2 ? 10 : 16, 8, dk); }
  // (slit windows up it: a lit one or two after dark)
  for (let k = 0; k < 4; k++) { const y = T + 230 + k * 50; R(-6, y, 12, 26, dk2); P([[-6, y], [0, y - 8], [6, y]], dk2); if (tod.lamps > 0.3 && k % 2) R(-4, y + 4, 8, 18, '#8A5A2A'); }
  // The belfry ledge, the roof: stepped slate, lit up its left; the spire, its finial
  R(-62, T + 58, 124, 14, INK); R(-60, T + 60, 120, 10, lit); R(-60, T + 60, 120, 3, lit2); R(-60, T + 67, 120, 3, dk);
  for (let i = 0; i < 6; i++) {
    const w = 88 - i * 14, y = T + 60 - (i + 1) * 10;
    R(-w / 2 - 1, y - 1, w + 2, 11, INK); R(-w / 2, y, w, 10, i % 2 ? body : dk); R(-w / 2, y, Math.max(2, w * 0.25), 10, lit); R(-w / 2, y, w, 2, lit2);
  }
  R(-3, T - 30, 6, 32, INK); R(-2, T - 28, 3, 30, lit); R(1, T - 28, 1, 30, dk);
  R(-8, T - 22, 16, 2, dk); R(-5, T - 36, 10, 6, INK); R(-4, T - 35, 8, 4, BRASS_DIM);
  // The clock: a dark frame, the face banded (lit at the top), the hours ticked, the hands going round (stepped)
  R(-30, T + 84, 60, 60, INK); R(-28, T + 86, 56, 56, '#1A1424'); R(-28, T + 86, 56, 2, lit);
  R(-24, T + 90, 48, 48, '#CDB878'); R(-24, T + 90, 48, 14, '#D9C98A'); R(-24, T + 90, 48, 5, '#E6D8A0'); R(-24, T + 130, 48, 8, '#B8A266');
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; R(Math.sin(a) * 19 - 1.5, T + 114 - Math.cos(a) * 19 - 1.5, 3, 3, '#3B2F58'); }
  const t = f * 0.002;
  const hand = (a: number, len: number, w: number) => { for (let s = 0; s <= len; s += 2) R(Math.sin(a) * s - w / 2, T + 114 - Math.cos(a) * s - w / 2, w, w, '#1E1036'); };
  hand(t, 18, 3); hand(t / 12, 12, 4);
  R(-2, T + 112, 4, 4, '#7F1D1D');
  // The ride's sign, bolted to the front of it, lit red (dim: no glare); its letters' bulbs
  const glow = 0.6 + 0.4 * Math.max(tod.lamps, (Math.floor(f / 20) % 6 ? 1 : 0.4));
  R(-60, T + 154, 120, 48, INK); R(-58, T + 156, 116, 44, '#2A0A0A');
  R(-55, T + 159, 110, 38, mix('#4A0E0E', '#991B1B', glow)); R(-55, T + 159, 110, 3, mix('#5A1414', '#B91C1C', glow));
  c.save(); c.translate(Math.round(tx), Math.round(base)); c.scale(ts, ts);
  c.font = '8px "Press Start 2P"'; c.textAlign = 'center';
  c.fillStyle = '#3A0808'; c.fillText('ELEVATOR', 1, T + 176); c.fillText('TO HELL', 1, T + 191);
  c.fillStyle = mix('#C88A8A', '#FECACA', glow); c.fillText('ELEVATOR', 0, T + 175); c.fillText('TO HELL', 0, T + 190);
  c.textAlign = 'left'; c.restore();
  // The track up its right side (its rungs), and the car: up slow, a moment at the top, then the drop
  R(50, T + 78, 10, -T - 78, INK); R(51, T + 80, 8, -T - 80, '#18121F'); R(51, T + 80, 2, -T - 80, '#2E2440');
  for (let y = T + 86; y < 0; y += 14) R(50, y, 10, 2, '#3F3550');
  const cyc = RIDE_UP + RIDE_HOLD + RIDE_DROP + RIDE_REST, kk = f % cyc;
  const lo = -30, hi = T + 90;
  const carY = kk < RIDE_UP ? lo - (lo - hi) * (kk / RIDE_UP) : kk < RIDE_UP + RIDE_HOLD ? hi : kk < RIDE_UP + RIDE_HOLD + RIDE_DROP ? hi + (lo - hi) * ((kk - RIDE_UP - RIDE_HOLD) / RIDE_DROP) ** 2 : lo;
  R(55, carY - 1, 24, 22, INK); R(56, carY, 22, 20, '#7F1D1D'); R(56, carY, 22, 3, '#B91C1C'); R(74, carY, 4, 20, '#4A0E0E');
  R(58, carY + 4, 18, 7, '#FDE68A'); R(58, carY + 4, 18, 2, '#FFF4C0');
  // (the dots of the riders' heads in its window)
  for (let i = 0; i < 3; i++) R(60 + i * 5, carY + 6, 3, 3, '#3F2A1A');
};
const BRASS_DIM = '#8A6A2A';

export const drawTownBackdrop = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), camX = state.camera.x - x0, up = Math.max(0, -state.camera.y);
  const oy = up * 0.12, horizon = 440 + oy, cx = camX + 100000;
  drawTodSky(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, SKY, { bands: 12, sun: [150, 120 + oy], moon: [150, 100 + oy], horizon, t: state.frame });
  // (the low cloud bank, drifting)
  tile(c, `tn-cloud-${tod.key}`, cx + state.frame * 6, 0.012, 100 + oy * 0.5, 160, g => paintClouds(g, tod));
  // The far hills
  tile(c, `tn-hills-${tod.key}`, cx, 0.02, horizon - 140, 220, g => paintHills(g, tod));
  // The ELEVATOR TO HELL: far off and small behind the rooftops at the gate, looming by the castle stairs
  const k = Math.max(0, Math.min(1, camX / (STAIRS.a0 - CANVAS_WIDTH / 2))), ke = k * k * (3 - 2 * k);
  const ts = 0.6 + 0.9 * ke;
  const tx = 620 - camX * (0.012 + 0.012 * k), base = horizon + 10 + ke * 110;
  drawTower(c, state, tx, base, ts);
  // The town's skyline, nearer (the tower's foot sunk behind it)
  tile(c, `tn-sky-${tod.key}`, cx, 0.2, horizon - 190 + oy * 0.6, 300, g => paintSkyline(g, tod));
};
