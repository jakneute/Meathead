// The wilds' water: the pond, the creek's pools, the rapids' channels, the long river (layout.ts WATERS). He swims in it
// (the stage's waterBodyAt); a step just under the surface at each end to climb out by; walkers keep out of it (a danger
// zone: hazardHit.ts) and drown if they're knocked in (drown.ts). The rapids' and the river's current carries a
// swimmer downstream; at the river's end, the log boom, and under it the pull over the falls (the falls are logs.ts's).
//
// Drawn (peak SNES): its surface going back from the play plane to the far bank (banded paler far off, where it takes
// the sky; glints and the current's streaks riding it; cattails and reeds along the far bank); the water's body at the
// play plane, banded deeper and dithered between, the light's caustics wavering down from the surface, the bed's
// gravel and stones (and what the guests dropped), the submerged rocks; and over whoever's in it the water's front
// (see-through, its lit surface line rippling, foam on the rapids running downstream, white water round the rocks).

import type { GameState } from '../../../m1/game/core/state';
import type { WaterBody } from '../../../m1/game/stages/index';
import { ledge } from '../section';
import { setHazardZones } from '../../hazardHit';
import { GY } from '../geometry';
import { onScreen } from '../kit';
import { type Ctx, type View, box, checker, mix, hash, PIX, at, poly, stamp, atDepth, timeOfDay, farTint, skyAt, INK, FAR, WATER, STONE, DIRT, GRASS, LIP } from './paint';
import { WATERS, BED, type Water } from './layout';

export const surfaceY = (w: Water) => GY + w.surface;

/** The water at (x, y), if any (from a little over its surface down). */
export const waterAt = (x: number, y: number): WaterBody | null => {
  for (const w of WATERS) if (x > w.a && x < w.b && y > surfaceY(w) - 14 && y < GY + BED + 10) return { key: w.key, x1: w.a, x2: w.b, surface: surfaceY(w), bottom: GY + BED, kind: 'clean' };
  return null;
};
export const waterOf = (x: number) => WATERS.find(w => x > w.a && x < w.b) ?? null;

/** The steps out at each end (just under the surface). */
export const layWaterSteps = (state: GameState) => {
  for (const w of WATERS) {
    ledge(state, w.a, surfaceY(w) + 26, 50, { hidden: true, tag: `${w.key}-step` });
    if (!w.boom) ledge(state, w.b - 50, surfaceY(w) + 26, 50, { hidden: true, tag: `${w.key}-step` });
  }
};

/** Walkers keep out of the water (they stop at the edge); every frame. */
export const waterZones = (state: GameState) =>
  setHazardZones(state, 'fr-water', WATERS.map(w => ({ x0: w.a, x1: w.boom ? (w.fallsTo ?? w.b) : w.b, y0: GY - 4, y1: GY + BED, ground: true })));

/** A swimmer in moving water is carried downstream (the rapids hard, the river gently, the pull at the boom hard). */
export const carrySwimmer = (state: GameState) => {
  const p = state.player;
  if (!p.swimming || p.health <= 0) return;
  const w = waterOf(p.pos.x + p.width / 2);
  if (!w || !w.current) return;
  const pull = w.boom && p.pos.x + p.width / 2 > w.boom - 220 ? 1.7 : 0;
  p.pos.x += w.current * 0.8 + pull;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The water's colors for the hour (the rapids a touch paler and greener: aerated). */
const waterR = (w: Water) => { const tod = timeOfDay(); return WATER.map(c => farTint(w.rapids ? mix(c, '#4A9A9A', 0.12) : c, 0.25, tod)); };

/** The far bank's reeds and cattails (a tile, stamped, cut to the water). */
const paintReeds = (g: Ctx, tod: ReturnType<typeof timeOfDay>) => {
  const haze = skyAt(0.9, tod), G = GRASS.map(c => mix(farTint(c, 0.7, tod), haze, 0.2)), D = DIRT.map(c => mix(farTint(c, 0.7, tod), haze, 0.2));
  // (the far bank: dirt down to the water, a grass lip, stones at the waterline)
  box(g, 0, -18, 420, 18, D[3]); box(g, 0, -18, 420, 3, G[4]); box(g, 0, -15, 420, 2, G[3]); checker(g, 0, -13, 420, 2, D[4], 0);
  for (let i = 0; i < 18; i++) { const sx = i * 24 + hash(i * 2.1) * 12; box(g, sx, -4, 10, 4, mix(farTint(STONE[4], 0.7, tod), haze, 0.2)); box(g, sx + 1, -4, 6, 1, mix(farTint(STONE[6], 0.7, tod), haze, 0.2)); }
  // (reeds: blades in clumps, lit up their left; cattails with their brown heads)
  for (let i = 0; i < 30; i++) {
    const x = i * 14 + hash(i * 3.3) * 10, h = 14 + hash(i * 1.7) * 22;
    for (let k = -1; k <= 1; k++) { const lean = k * (2 + hash(i + k) * 3); g.strokeStyle = k < 0 ? G[5] : G[3]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + k * 2, -14); g.quadraticCurveTo(x + k * 2 + lean * 0.3, -14 - h * 0.6, x + k * 2 + lean, -14 - h); g.stroke(); }
    if (hash(i * 5.1) > 0.55) { box(g, x, -14 - h - 2, 1, h * 0.4, G[2]); box(g, x - 1, -14 - h - 10, 3, 9, D[2]); box(g, x - 1, -14 - h - 10, 1, 9, D[4]); }
  }
};

/** The water's surface going back from the play plane to the far bank (and the reeds along it). Behind everything. */
export const drawWaterTop = (c: Ctx, v: View) => {
  const tod = timeOfDay(), eye = v.eye, f = v.f, haze = skyAt(0.85, tod);
  for (const w of WATERS) {
    if (w.b < v.v0 - 400 || w.a > v.v1 + 400) continue;
    const s = surfaceY(w), R = waterR(w);
    if (eye.y > s - 2) continue;
    const xb = w.boom ? (w.fallsTo ?? w.b) : w.b;
    const pt = (x: number, d: number) => at(eye, x, s, d);
    // (banded: darker near, paler far off where it takes the sky)
    const cols = [R[4], R[5], R[5], mix(R[6], haze, 0.2), mix(R[6], haze, 0.4), mix(R[7], haze, 0.4)], N = cols.length;
    for (let i = 0; i < N; i++) {
      const d0 = 1 - ((1 - FAR) * i) / N, d1 = 1 - ((1 - FAR) * (i + 1)) / N;
      poly(c, [pt(w.a, d0), pt(xb, d0), pt(xb, d1), pt(w.a, d1)], cols[i]);
      const [lx, sy] = pt(w.a, d1), [rx] = pt(xb, d1);
      checker(c, lx, sy, rx - lx, PIX, cols[Math.min(N - 1, i + 1)], i % 2);
    }
    // (glints and the current's streaks riding it, bigger nearer; drifting downstream with it)
    const sp = w.current * 1.2 + 0.15;
    for (let k = 0; k < (xb - w.a) / 22; k++) {
      const d = FAR + (1 - FAR) * hash(k * 3.7 + w.a), len = (6 + hash(k * 1.3) * (w.rapids ? 26 : 12)) * d;
      const x = w.a + ((hash(k * 7.1 + w.a) * (xb - w.a) + f * sp * d) % (xb - w.a));
      const [sx, sy] = pt(x, d);
      const tw = (f + k * 13) % 90 < 70;
      if (tw) box(c, sx, sy, len, 1, w.rapids && k % 2 ? 'rgba(240, 250, 252, 0.8)' : mix(R[8], haze, (1 - d) * 0.5));
    }
    // (white water over the submerged rocks, going back from them: the tell, where they are)
    for (const r of w.rocks ?? []) for (let k = 0; k < 6; k++) {
      const d = 1 - (1 - FAR) * (0.05 + k * 0.08), [sx, sy] = pt(r - 30 + ((k * 23 + f * 1.6) % 60), d);
      box(c, sx, sy, 6 * d, 1, '#F2FAFC');
    }
    // (the far bank: reeds and cattails, stamped, cut to the water)
    atDepth(c, eye, FAR, () => {
      c.save(); c.beginPath(); c.rect(w.a, s - 80, xb - w.a, 82); c.clip();
      for (let tx = Math.floor(w.a / 420) * 420; tx < xb; tx += 420) {
        const ex = eye.x + (tx - eye.x) * FAR;
        if (ex + 420 * FAR < v.v0 - 60 || ex > v.v1 + 60) continue;
        c.save(); c.translate(tx, s); stamp(c, `fw-reeds-${tod.key}`, -10, -70, 440, 72, g => paintReeds(g, tod)); c.restore();
      }
      c.restore();
    });
  }
};

/** What's lying on the bed (the park's guests dropped it): [x from the water's left, what]. */
const LITTER: Record<string, [number, 'can' | 'shoe' | 'cap' | 'coin'][]> = {
  pond: [[180, 'coin'], [420, 'can'], [640, 'coin'], [720, 'shoe']],
  creek1: [[260, 'can'], [480, 'coin']],
  creek2: [[140, 'cap'], [520, 'can']],
  rapids1: [[300, 'shoe'], [820, 'can']],
  rapids2: [[200, 'can'], [760, 'cap']],
  river: [[300, 'coin'], [700, 'can'], [1180, 'shoe'], [1600, 'cap']],
};

/** The water's body at the play plane, its bed and its rocks, painted once per hour per water (stamped in chunks). */
const paintBody = (g: Ctx, w: Water, x0: number, cw: number) => {
  const R = waterR(w), s = surfaceY(w), depth = GY + BED - s, tod = timeOfDay();
  const S = STONE.map(c => farTint(c, 0.25, tod));
  // (banded deeper, dithered between)
  const bands = [R[5], R[4], R[4], R[3], R[3], R[2], R[2], R[1]];
  for (let i = 0; i < bands.length; i++) {
    const y = s + (i * depth) / bands.length;
    box(g, x0, y, cw, depth / bands.length + 1, bands[i]);
    if (i) checker(g, x0, y - 1, cw, PIX, bands[i - 1], i % 2);
  }
  // (the bed: gravel on dark silt, stones lit on top)
  box(g, x0, GY + BED, cw, 200, mix(S[1], DIRT[1], 0.5));
  box(g, x0, GY + BED - 6, cw, 8, mix(R[1], S[2], 0.5));
  for (let x = Math.floor(x0 / 6) * 6; x < x0 + cw; x += 6) box(g, x + hash(x * 1.7) * 4, GY + BED - 4 + hash(x) * 3, 2, 2, hash(x * 3.1) > 0.5 ? mix(S[4], R[2], 0.5) : mix(S[2], R[1], 0.5));
  for (let x = Math.floor(x0 / 40) * 40; x < x0 + cw; x += 40) {
    const sx = x + hash(x * 2.3) * 30, rw = 6 + hash(x * 4.1) * 8;
    g.fillStyle = mix(INK, R[1], 0.4); g.beginPath(); g.ellipse(sx, GY + BED - 2, rw + 1, rw * 0.55 + 1, 0, Math.PI, 0); g.fill();
    g.fillStyle = mix(S[3], R[2], 0.45); g.beginPath(); g.ellipse(sx, GY + BED - 2, rw, rw * 0.55, 0, Math.PI, 0); g.fill();
    box(g, sx - rw * 0.5, GY + BED - 2 - rw * 0.45, rw * 0.6, 1, mix(S[5], R[3], 0.4));
  }
  // (weed waving up off the bed: dark strands)
  for (let x = Math.floor(x0 / 70) * 70 + 20; x < x0 + cw; x += 70) { const h = 16 + hash(x) * 30; for (let y = 0; y < h; y += 2) box(g, x + Math.sin(y * 0.2 + x) * 2, GY + BED - 4 - y, 2, 2, mix(GRASS[2], R[2], 0.4)); }
  // (the guests' litter)
  for (const [lx, k] of LITTER[w.key] ?? []) {
    const x = w.a + lx, y = GY + BED - 4;
    if (x < x0 - 10 || x > x0 + cw + 10) continue;
    const m = (col: string) => mix(farTint(col, 0.25, tod), R[2], 0.35);
    if (k === 'can') { box(g, x - 5, y - 4, 11, 5, INK); box(g, x - 4, y - 3, 9, 3, m('#C8302A')); box(g, x - 4, y - 3, 9, 1, m('#F06A5A')); box(g, x + 4, y - 3, 1, 3, m('#C8C8D0')); }
    else if (k === 'shoe') { box(g, x - 7, y - 5, 13, 6, INK); box(g, x - 6, y - 4, 11, 4, m('#E8E8F0')); box(g, x - 6, y - 1, 11, 1, m('#5A5A6A')); box(g, x - 2, y - 4, 3, 1, m('#2A6AC8')); }
    else if (k === 'cap') { g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, 7, 4, 0, Math.PI, 0); g.fill(); g.fillStyle = m('#2A4A8A'); g.beginPath(); g.ellipse(x, y, 6, 3, 0, Math.PI, 0); g.fill(); box(g, x + 4, y - 1, 6, 2, m('#1E3A6A')); }
    else { box(g, x - 2, y - 1, 4, 2, m('#E8C050')); box(g, x - 1, y - 1, 2, 1, m('#FFF0A0')); }
  }
  // (the submerged rocks: real rock, humped up near the surface, lit along their tops through the water)
  for (const r of w.rocks ?? []) {
    if (r + 50 < x0 || r - 50 > x0 + cw) continue;
    const rk = S.map(c => mix(c, R[2], 0.35));
    g.fillStyle = mix(INK, R[1], 0.3); g.beginPath(); g.moveTo(r - 46, GY + BED); g.lineTo(r - 36, s + 30); g.quadraticCurveTo(r, s + 8, r + 38, s + 26); g.lineTo(r + 48, GY + BED); g.closePath(); g.fill();
    g.fillStyle = rk[3]; g.beginPath(); g.moveTo(r - 44, GY + BED); g.lineTo(r - 34, s + 31); g.quadraticCurveTo(r, s + 10, r + 36, s + 27); g.lineTo(r + 46, GY + BED); g.closePath(); g.fill();
    g.fillStyle = rk[4]; g.beginPath(); g.moveTo(r - 34, s + 31); g.quadraticCurveTo(r - 8, s + 12, r + 10, s + 14); g.lineTo(r - 4, s + 40); g.lineTo(r - 30, s + 50); g.closePath(); g.fill();
    box(g, r - 20, s + 16, 18, 2, rk[5]);
    g.fillStyle = rk[2]; g.beginPath(); g.moveTo(r + 10, s + 40); g.lineTo(r + 40, s + 40); g.lineTo(r + 46, GY + BED); g.lineTo(r + 4, GY + BED); g.closePath(); g.fill();
    checker(g, r - 30, s + 48, 60, 4, rk[2], 0);
  }
};

/** Behind everything at the play plane: the water's body (stamped), its steps out (lit lips: standable), its ends. */
export const drawWaterBack = (c: Ctx, state: GameState) => {
  const tod = timeOfDay();
  const L = LIP.map(col => farTint(col, 0.25, tod)), D = DIRT.map(col => farTint(col, 0.25, tod));
  for (const w of WATERS) {
    if (!onScreen(state, w.a, w.b)) continue;
    const s = surfaceY(w);
    for (let x = w.a, i = 0; x < w.b; x += 512, i++) {
      const cw = Math.min(512, w.b - x);
      if (!onScreen(state, x, x + cw)) continue;
      stamp(c, `fw-water-${w.key}-${i}-${tod.key}`, x, s - 2, cw, GY + BED + 200 - s + 2, g => paintBody(g, w, x, cw));
    }
    // (the steps out: a rock ledge just under the surface, its lip lit)
    const step = (x: number) => { box(c, x, s + 26, 50, 8, D[3]); box(c, x, s + 34, 50, 4, D[2]); box(c, x, s + 26, 50, 2, L[2]); box(c, x, s + 28, 50, 1, L[1]); box(c, x, s + 25, 50, 1, INK); };
    step(w.a);
    if (!w.boom) step(w.b - 50);
  }
};

/** Over whoever's in it: the water's front, see-through, the caustics wavering, its surface line lit and rippling,
 *  the rapids' foam running downstream, white water round the rocks. */
export const drawWaterFront = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const w of WATERS) {
    if (!onScreen(state, w.a, w.b)) continue;
    const s = surfaceY(w), R = waterR(w);
    const xa = Math.max(w.a, state.camera.x - 40), xb = Math.min(w.b, state.camera.x + 840);
    // (the body over him, see-through, deeper the further down)
    c.globalAlpha = 0.42; box(c, xa, s + 6, xb - xa, 30, R[4]);
    c.globalAlpha = 0.55; box(c, xa, s + 36, xb - xa, BED - w.surface - 36, R[2]);
    c.globalAlpha = 1;
    // (caustics: bands of light wavering down from the surface)
    c.globalAlpha = 0.18;
    for (let x = Math.floor(xa / 16) * 16; x < xb; x += 16) {
      const k = Math.sin(f * 0.05 + x * 0.07) + Math.sin(f * 0.031 - x * 0.11);
      if (k > 0.6) box(c, x, s + 8 + (k - 0.6) * 10, 8, 40 + k * 20, R[7]);
    }
    c.globalAlpha = 1;
    // (the surface: the line rippling, lit, its highlight drifting with the current)
    for (let x = Math.floor((xa - w.a) / 4) * 4 + w.a; x < xb; x += 4) {
      const lift = Math.sin(f * 0.07 + x * 0.04) * (w.rapids ? 3 : 1.5) + Math.sin(f * 0.11 + x * 0.13) * (w.rapids ? 1.5 : 0.5), y = Math.round(s - lift);
      box(c, x, y - 1, 4, 1, INK);
      box(c, x, y, 4, 2, R[7]); box(c, x, y + 2, 4, 2, R[6]); box(c, x, y + 4, 4, 2, R[5]);
      const drift = (x - w.a - f * (w.current * 1.5 + 0.2)) / 4;
      if (((Math.floor(drift) % 13) + 13) % 13 === 0) box(c, x, y, 4, 1, R[8]);
      if (((Math.floor(drift * 0.5) % 29) + 29) % 29 === 0) box(c, x - 2, y - 1, 8, 1, '#FFFFFF');
    }
    // (foam streaks running downstream on moving water: stepped, white with a pale tail)
    if (w.rapids || w.current > 0.4) for (let k = 0; k < (xb - xa) / 36; k++) {
      const len = 16 + hash(k * 2.1) * 30, sx = xa + ((hash(k * 1.3 + w.a) * (xb - xa) + f * w.current * 3) % (xb - xa)), sy = Math.round(s + 4 + hash(k * 5.3) * 22);
      box(c, sx, sy, len, 2, w.rapids ? 'rgba(236, 248, 250, 0.85)' : 'rgba(232, 244, 250, 0.5)');
      box(c, sx + len, sy, len * 0.5, 1, 'rgba(200, 230, 240, 0.4)');
      if (w.rapids && k % 3 === 0) box(c, sx + 4, sy - 2, 6, 2, 'rgba(255, 255, 255, 0.9)');
    }
    // (white water churning round the submerged rocks: a standing wave just past each)
    for (const r of w.rocks ?? []) {
      for (let i = 0; i < 9; i++) { const px = r - 34 + ((i * 17 + f * 1.4) % 72), py = s - 3 + (i % 3) * 2 - Math.max(0, Math.sin(f * 0.2 + i)) * 2; box(c, px, py, 7, 3, i % 2 ? '#FFFFFF' : '#D8EEF4'); }
      for (let i = 0; i < 4; i++) box(c, r + 30 + i * 6, s - 4 + Math.round(Math.sin(f * 0.25 + i) * 2), 5, 3, '#F2FAFC');
    }
  }
};
