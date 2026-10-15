// The temple roof, painted (the final pass: peak SNES). What's here:
//
//   The view (screen space): the hour's banded sky, its clouds; far off over the park, the other lands' landmarks on
//     the skyline (the castle's spires, the needle tower, the haunted castle, the mesa), hazed; the hills; the
//     monorail going by on its beam; the jungle's canopy in two layers, sliding by at their own rates, sinking under
//     him as he's up high (from the roof he sees out over it all; down by the line it's all trees).
//   The temple (world space): four tiers of sandy stone blocks in courses (every block in its ramp, moss low down,
//     carved jaguar glyphs, fiberglass panel seams and bolt heads: it's a ride), its ends and its steps' treads in
//     perspective (they go back from the strip toward the eye), the entrance in its foot (a carved lintel, tiki
//     torches), vines down it. Caved in: cracks, a panel off showing the plywood under it, rubble on the steps.
//   The roof: its top a lit tread going back (stood on), each tile of it its own; the hole through it with depth (the
//     shell's edge, the framing inside, the dark), crumbling as it goes (cracking ahead of the front, chunks, dust).
//   The line: the ride's queue going back across the plaza in switchbacks (bamboo posts and rope), the rows smaller
//     and hazier the further back (each row dimmed once, as a layer), facing this way and that; the front row along
//     the rope, horrified when the roof goes. The signs on posts. A jungle treeline along the back of the plaza.
//   Artie's parachute, the empty cart, the dust, the big cloud out of the hole.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { timeOfDay, drawTodSky, farTint, cloudTint, skyAt } from '../../timeOfDay';
import { INK, box, checker, mix, hash, pixelBlob, pole, ball, text, stamp, bandedGradient, bendFloor, tilePattern } from '../../intro/art/kit';
import { drawPerson } from '../temple/people';
import { STONE, MOSS, PLY, SHELL, FOAM, DARK, stoneWall, vineDown, plaque, glyph } from './stone';
import {
  x0, x1, BASE_L, BASE_R, TIER_H, TIER_IN, RY, ROOF_L, ROOF_R, HOLE_X, TILE, LINE_L, LINE_R, EXIT_X, DOOR_X, DOOR_W, DOOR_H, GUESTS,
} from './layout';
import { GY } from '../geometry';
import { sunBehind } from '../../sunFlare';
import { signAt, stencil, stone, routed, print } from '../letters';
import { snap2, wave, jag, range, mist, kabooma, canopy } from '../farArt';

type Ctx = CanvasRenderingContext2D;

/** What of the roof's state the art goes by. */
export interface RoofLook {
  tiles: { gone: boolean; shake: number }[];
  caved: boolean; horror: boolean;
  dust: { x: number; y: number; vx: number; vy: number; r: number; life: number }[];
}

const r1 = (a: number, b = 0) => hash(a * 12.9898 + b * 78.233);

// ---------------------------------------------------------------------------------------------------------------
// The eye (for what goes back from the strip: the temple's ends and treads, the plaza, the line)

/** How far back the temple's ends and treads go (toward the eye: 0 none). */
const DK = 0.16;
/** The plaza behind the strip: how high up the screen it goes back to the treeline. */
const BACK_H = 128;
const eyeOf = (state: GameState) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  return { x: v.x + v.w / 2, y: v.y + v.h * 0.4 };
};
type Eye = { x: number; y: number };
/** A point on the strip (x, y) taken k of the way back (toward the eye). */
const back = (e: Eye, x: number, y: number, k: number): [number, number] => { const d = 1 - DK * k; return [e.x + (x - e.x) * d, e.y + (y - e.y) * d]; };
const quad = (c: Ctx, pts: [number, number][], col: string) => {
  c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// The view out over the park (screen space)

const W = CANVAS_WIDTH;
/** A strip of scenery painted once (for the hour) and tiled across, `off` px slid. */
const strip = (c: Ctx, key: string, y: number, w: number, h: number, off: number, paint: (g: Ctx) => void) => {
  const o = ((off % w) + w) % w;
  for (let k = -1; k * w - o < W; k++) {
    const sx = Math.round(k * w - o);
    if (sx + w < 0) continue;
    c.save(); c.translate(sx, Math.round(y));
    stamp(c, key, 0, 0, w, h, paint);
    c.restore();
  }
};

/** A clump of jungle canopy: crowns in a ramp (shadow, body, lit, highlight), dithered between. */
export const crown = (g: Ctx, x: number, y: number, r: number, ramp: string[]) => {
  pixelBlob(g, x + r * 0.15, y + r * 0.12, r, r * 0.8, ramp[0]);
  pixelBlob(g, x, y, r * 0.92, r * 0.72, ramp[1]);
  pixelBlob(g, x - r * 0.2, y - r * 0.18, r * 0.62, r * 0.46, ramp[2]);
  pixelBlob(g, x - r * 0.34, y - r * 0.32, r * 0.3, r * 0.2, ramp[3]);
};
/** A palm, sticking up out of the canopy: a leaning trunk in bands, fronds drooping. */
export const palm = (g: Ctx, x: number, y: number, h: number, ramp: string[], trunk: string) => {
  for (let k = 0; k < h; k += 4) box(g, x + Math.round((k / h) ** 2 * 10), y - k, 4, 4, k % 8 ? trunk : mix(trunk, INK, 0.25));
  const tx = x + 10, ty = y - h;
  for (const [dx, dy] of [[-22, 6], [-14, 12], [14, 12], [22, 6], [0, -6], [-8, -4], [8, -4]] as const) {
    g.strokeStyle = ramp[1]; g.lineWidth = 4; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + dx * 0.6, ty + dy - 10, tx + dx, ty + dy + 6); g.stroke();
    g.strokeStyle = ramp[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(tx, ty - 1); g.quadraticCurveTo(tx + dx * 0.6, ty + dy - 11, tx + dx, ty + dy + 4); g.stroke();
  }
};
/** A canopy strip: crowns along it (the bumpy top), filled solid below, palms poking up here and there. */
const canopyStrip = (g: Ctx, w: number, h: number, seed: number, ramp: string[], r0: number, palms: number) => {
  // (each palm one piece, its trunk from down in the canopy (its foot hidden in it) up; the crowns in front of its foot)
  const foot = r0 * 1.7;
  for (let i = 0; i < palms; i++) { const px = ((i + 0.5) / palms) * w + (r1(i, seed) - 0.5) * 60; palm(g, px, foot, foot - r0 * 0.6 + r0 * 0.9 + r1(i, seed + 1) * r0 * 0.6, ramp, mix(ramp[1], '#6B4A2A', 0.5)); }
  box(g, 0, r0 * 0.9, w, h, ramp[0]);
  for (let x = -r0; x < w + r0; x += r0 * 0.9) {
    const s = r1(x, seed), r = r0 * (0.75 + s * 0.5);
    // (wrapped: a crown off one end is painted again off the other, so the strip tiles)
    for (const wx of [x, x - w, x + w]) if (wx > -r * 1.4 && wx < w + r * 1.4) crown(g, wx, r0 + (s - 0.5) * r0 * 0.5, r, ramp);
  }
  checker(g, 0, r0 * 1.6, w, 2, ramp[1]);
};

/**
 * The other lands' landmarks along the skyline (as from Adventure Land: off over the hub), hazed by the distance, each
 * in its own ramp (lit at the left, its shade dithered in at the right): the castle (curtain wall, crenels, round towers
 * in bands under stepped blue cones, pennants, the gate), the needle tower (its saucer, a ring of windows, the beacon),
 * the haunted castle on its crag (snuffer roofs, a sick green window), the mesa in its strata (the water tower by it),
 * the Ferris wheel by the hub's gate; windows lit after dark (more the darker it gets), the wheel's bulbs on. The hub's
 * treeline along their feet. Painted 1:1 (on the art's grid), y = h the ground.
 */
const skyline = (g: Ctx, w: number, h: number, haze: (c: string) => string, lamps: number) => {
  const y = h;
  /** A ramp of a color, hazed: deep, shade, body, lit, highlight. */
  const R = (col: string) => [haze(mix(col, '#0A0A14', 0.36)), haze(mix(col, '#0A0A14', 0.18)), haze(col), haze(mix(col, '#FFFFFF', 0.2)), haze(mix(col, '#FFFFFF', 0.4))];
  const lampCol = haze(mix('#FFD27A', '#FFFFFF', 0.1)), lit = (n: number) => lamps > 0.1 && r1(n, 7) > 0.9 - 0.5 * lamps;
  const quadP = (pts: [number, number][], col: string) => { g.fillStyle = col; g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fill(); };
  /** A round thing standing (a tower): in bands across, lit at the left. */
  const round = (x: number, top: number, ww: number, P: string[]) => {
    const order = [3, 3, 2, 2, 2, 1, 1, 0];
    for (let k = 0; k < order.length; k++) box(g, x + Math.floor((k * ww) / order.length), top, Math.ceil(ww / order.length) + 1, y - top, P[order[k]]);
    checker(g, x + Math.floor((2 * ww) / order.length) - 1, top, 2, y - top, P[2]);
    checker(g, x + Math.floor((5 * ww) / order.length) - 1, top, 2, y - top, P[1]);
  };
  /** A cone (a tower's roof): stepped across in `P`'s steps, lit at the left. */
  const cone = (cx: number, base: number, top: number, half: number, cols: string[]) => {
    const n = cols.length;
    for (let i = 0; i < n; i++) { const a = -half + (2 * half * i) / n, b = -half + (2 * half * (i + 1)) / n; quadP([[cx + a, base], [cx + a * 0.08, top], [cx + b * 0.08, top], [cx + b, base]], cols[i]); }
  };
  const win = (x: number, wy: number, ww: number, hh: number, n: number, dark: string) => box(g, x, wy, ww, hh, lit(n) ? lampCol : dark);

  // The castle (fantasy)
  {
    const cx = 220, S = R('#D6D3D1'), T = R('#E7E5E4'), B = R('#2563EB'), F = R('#DC2626');
    // (the curtain wall: lit at its left, its shade dithered in, crenels along its top, the gate's arch)
    box(g, cx - 30, y - 30, 60, 30, S[2]); box(g, cx - 30, y - 30, 4, 30, S[3]); box(g, cx + 22, y - 30, 8, 30, S[1]); checker(g, cx + 20, y - 30, 2, 30, S[1]);
    for (let k = 0; k < 60; k += 6) box(g, cx - 30 + k, y - 34, 4, 4, S[2]);
    box(g, cx - 6, y - 16, 12, 16, S[0]); box(g, cx - 4, y - 18, 8, 2, S[0]);
    for (let k = 0; k < 4; k++) win(cx - 24 + k * 14 + (k > 1 ? 8 : 0), y - 24, 2, 4, cx + k, S[0]);
    // (the towers: round, in bands; stepped blue cones; pennants)
    for (const [tx, th, tw] of [[-34, 46, 10], [-14, 66, 12], [6, 58, 12], [26, 42, 10]] as const) {
      const x = cx + tx;
      round(x, y - th, tw, T);
      box(g, x - 1, y - th - 2, tw + 2, 2, T[1]);
      cone(x + tw / 2, y - th - 2, y - th - 22, tw / 2 + 3, [B[4], B[3], B[2], B[1], B[0]]);
      box(g, x + tw / 2 - 1, y - th - 30, 1, 8, T[0]); box(g, x + tw / 2, y - th - 30, 5, 3, F[2]); box(g, x + tw / 2, y - th - 28, 3, 1, F[1]);
      for (let wy = y - th + 8; wy < y - 34; wy += 12) win(x + tw / 2 - 1, wy, 2, 4, x * 3 + wy, T[0]);
    }
  }
  // The needle tower (space)
  {
    const cx = 632, S = R('#CBD5E1'), D = R('#F87171');
    // (its legs flaring at the foot, the shaft in bands)
    quadP([[cx - 12, y], [cx - 3, y - 30], [cx + 3, y - 30], [cx + 12, y]], S[1]); quadP([[cx - 12, y], [cx - 3, y - 30], [cx - 1, y - 30], [cx - 8, y]], S[3]);
    box(g, cx - 3, y - 84, 2, 84, S[3]); box(g, cx - 1, y - 84, 2, 84, S[2]); box(g, cx + 1, y - 84, 2, 84, S[1]);
    for (let k = y - 80; k < y - 30; k += 10) box(g, cx - 3, k, 6, 1, S[0]);
    // (the saucer: its top lit, its underside in shade, a ring of windows round its rim)
    const sy = y - 84;
    g.fillStyle = S[1]; g.beginPath(); g.ellipse(cx, sy + 2, 17, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = S[3]; g.beginPath(); g.ellipse(cx, sy, 17, 3, 0, Math.PI, 0); g.fill();
    g.fillStyle = S[4]; g.beginPath(); g.ellipse(cx - 4, sy - 1, 8, 1.5, 0, Math.PI, 0); g.fill();
    box(g, cx - 16, sy + 1, 32, 1, S[0]);
    for (let k = -14; k <= 12; k += 4) box(g, cx + k, sy + 2, 2, 2, lamps > 0.1 ? lampCol : S[0]);
    // (the dome on top, the beacon)
    g.fillStyle = D[2]; g.beginPath(); g.ellipse(cx, sy - 2, 6, 4, 0, Math.PI, 0); g.fill();
    g.fillStyle = D[3]; g.beginPath(); g.ellipse(cx - 2, sy - 3, 3, 2, 0, Math.PI, 0); g.fill();
    box(g, cx, sy - 12, 1, 6, S[0]); box(g, cx - 1, sy - 14, 3, 2, lamps > 0.1 ? '#FF6A5A' : D[1]);
  }
  // The haunted castle (spooky), on its crag
  {
    const cx = 1017, C = R('#3B3049'), K = R('#4C3D5E'), Rf = R('#2E2440');
    // (the crag: its left face lit, its right in shade, a seam or two down it)
    quadP([[cx - 40, y], [cx - 26, y - 22], [cx + 28, y - 26], [cx + 40, y]], C[2]);
    quadP([[cx - 40, y], [cx - 26, y - 22], [cx - 14, y - 23], [cx - 26, y]], C[3]);
    quadP([[cx + 14, y], [cx + 20, y - 25], [cx + 28, y - 26], [cx + 40, y]], C[1]);
    for (const sx of [-6, 6]) for (let k = 0; k < 18; k += 2) box(g, cx + sx + Math.round(Math.sin(k) * 1), y - 20 + k, 1, 2, C[0]);
    // (the keep and its towers, snuffer roofs; one sick green window)
    box(g, cx - 20, y - 56, 40, 34, K[2]); box(g, cx - 20, y - 56, 3, 34, K[3]); box(g, cx + 14, y - 56, 6, 34, K[1]); checker(g, cx + 12, y - 56, 2, 34, K[1]);
    for (let k = 0; k < 40; k += 6) box(g, cx - 20 + k, y - 60, 4, 4, K[2]);
    for (const [sx, th] of [[-22, 28], [-6, 42], [12, 32]] as const) {
      round(cx + sx, y - 56 - th + 22, 9, K);
      cone(cx + sx + 4.5, y - 56 - th + 22, y - 56 - th + 2, 7, [Rf[3], Rf[2], Rf[1], Rf[0]]);
    }
    box(g, cx - 3, y - 46, 3, 4, haze('#BEF264')); box(g, cx - 4, y - 47, 5, 1, mix(haze('#BEF264'), K[2], 0.5));
    for (let k = 0; k < 3; k++) win(cx - 14 + k * 12, y - 36, 2, 4, cx * 2 + k, K[0]);
  }
  // The mesa (frontier), in its strata; the water tower by it
  {
    const cx = 1320, M = R('#C2410C'), N = R('#EA580C');
    quadP([[cx - 48, y], [cx - 38, y - 46], [cx + 28, y - 52], [cx + 46, y]], M[2]);
    g.save(); g.beginPath(); g.moveTo(cx - 48, y); g.lineTo(cx - 38, y - 46); g.lineTo(cx + 28, y - 52); g.lineTo(cx + 46, y); g.closePath(); g.clip();
    // (the strata: bands across, dithered between)
    for (let k = 0; k < 5; k++) { const by = y - 44 + k * 10, col = k % 2 ? N[1] : M[1]; box(g, cx - 50, by, 100, 4, col); checker(g, cx - 50, by + 4, 100, 2, col); }
    // (its left face lit, the right in shade)
    quadP([[cx - 48, y], [cx - 38, y - 46], [cx - 30, y - 47], [cx - 40, y]], N[3]);
    quadP([[cx + 20, y], [cx + 22, y - 52], [cx + 28, y - 52], [cx + 46, y]], M[0]);
    g.restore();
    // (the water tower: legs, the tank lit at the left)
    const T = R('#92400E');
    for (const lx of [32, 40]) box(g, cx + lx, y - 32, 2, 32, T[1]);
    box(g, cx + 29, y - 46, 15, 14, T[2]); box(g, cx + 29, y - 46, 3, 14, T[3]); box(g, cx + 40, y - 46, 4, 14, T[1]);
    quadP([[cx + 28, y - 46], [cx + 36, y - 51], [cx + 45, y - 46]], T[1]);
  }
  // The Ferris wheel by the hub's gate: its rim, the spokes, gondolas, its A-frame; bulbs round the rim after dark
  {
    const cx = 1529, cy = y - 40, rr = 28, S = R('#E5E7EB'), Fr = R('#9CA3AF');
    quadP([[cx - 17, y], [cx - 1, cy], [cx + 1, cy], [cx - 13, y]], Fr[3]); quadP([[cx + 13, y], [cx - 1, cy], [cx + 1, cy], [cx + 17, y]], Fr[1]);
    g.strokeStyle = S[1]; g.lineWidth = 1;
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); g.stroke(); }
    g.strokeStyle = S[2]; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = S[3]; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, rr - 1, Math.PI * 0.9, Math.PI * 1.6); g.stroke();
    g.strokeStyle = S[1]; g.beginPath(); g.arc(cx, cy, rr * 0.55, 0, Math.PI * 2); g.stroke();
    box(g, cx - 2, cy - 2, 4, 4, S[0]);
    const GC = ['#EF4444', '#FACC15', '#3B82F6'].map(R);
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, gx = Math.round(cx + Math.cos(a) * rr), gy = Math.round(cy + Math.sin(a) * rr); const P = GC[k % 3]; box(g, gx - 2, gy + 1, 5, 4, P[2]); box(g, gx - 2, gy + 1, 2, 4, P[3]); box(g, gx, gy - 1, 1, 2, S[0]); }
    if (lamps > 0.1) for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2 + 0.13; box(g, Math.round(cx + Math.cos(a) * rr) - 1, Math.round(cy + Math.sin(a) * rr) - 1, 2, 2, k % 2 ? lampCol : haze('#FF9AD0')); }
  }
  // (the hub's own treeline along their feet: crowns in steps, lit up the left)
  const TR = R('#2F5A3A');
  box(g, 0, y - 6, w, 6, TR[1]);
  for (let x = 0; x < w; x += 8) {
    const hh = 6 + r1(x, 3) * 8;
    pixelBlob(g, x + 4, y - hh * 0.5, 7, hh * 0.6, TR[1]);
    pixelBlob(g, x + 2, y - hh * 0.6, 4, hh * 0.35, TR[3]);
  }
};

/** A cloud bank (stepped: a shadowed base, the body, a lit crown). */
const cloud = (g: Ctx, x: number, y: number, s: number, cols: string[]) => {
  for (const [dx, dy, rw, rh, k] of [[0, 6, 40, 10, 0], [-22, 0, 22, 12, 1], [12, -4, 26, 16, 1], [30, 4, 18, 9, 1], [4, -8, 16, 9, 2], [-16, -4, 10, 6, 2]] as const) pixelBlob(g, x + dx * s, y + dy * s, rw * s, rh * s, cols[k]);
};

export const drawRoofBackdrop = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), f = state.frame, cam = state.camera;
  // (how far up he is from the ground's usual view: up on the roof, the far things rise into view over the trees)
  const up = Math.max(0, (GY - 550) - cam.y);
  const hz = 300 + up * 0.08;
  drawTodSky(c, 0, 0, W, CANVAS_HEIGHT, ['#2E6FC0', '#3D82CF', '#5096D8', '#69AADF', '#86BEE4', '#A6D0E8', '#C4E0EA'], { sun: [620, 70], moon: [470, 70], horizon: hz, t: f, scroll: cam.x * 0.02 });
  const sky = (v: number) => skyAt(v, tod);
  // Clouds, drifting (the hour's light on them)
  const cc = [cloudTint('#B9C6DA', tod), cloudTint('#E6ECF4', tod), cloudTint('#FFFFFF', tod)];
  strip(c, `rfCloud:${tod.key}`, 40 + up * 0.03, 1400, 140, cam.x * 0.03 - f * 0.08, g => {
    cloud(g, 160, 50, 1.6, cc); cloud(g, 520, 90, 1.1, cc); cloud(g, 860, 40, 1.9, cc); cloud(g, 1180, 100, 1.2, cc);
  });
  // The far hills (in their mist: lit flanks, gullies, the jungle up them), the other lands on the skyline
  strip(c, `rfHill:${tod.key}`, hz - 60, 1600, 100, cam.x * 0.04, g => {
    const hzK = 0.45, base = '#6F9AA8', T = (col: string) => mix(farTint(col, 1, tod), sky(0.85), hzK);
    const yAt = (x: number) => snap2(40 + 22 * Math.sin((x / 1600) * Math.PI * 6) + 12 * Math.sin((x / 1600) * Math.PI * 14 + 1) + jag(x, 1600, 8, 5) * 4);
    range(g, 1600, yAt, 100, { body: T(base), lit: T(mix(base, '#E0F0F4', 0.24)), hi: T(mix(base, '#FFFFFF', 0.4)), shade: T(mix(base, '#0A1418', 0.16)), deep: T(mix(base, '#0A1418', 0.28)) }, 9,
      { gullies: 30, d: 12, forest: [T('#3E6E52'), T('#5A8A60')], forestY: x => yAt(x) + 22 + wave(x, 1600, 3.3, 3) * 6 });
    mist(g, 1600, 30, 70, sky(0.9), 0.0, 0.4, 5);
  });
  strip(c, `rfSky:${tod.key}`, hz - 100, 1600, 104, cam.x * 0.06, g => skyline(g, 1600, 100, col => mix(farTint(col, 1, tod), sky(0.9), 0.5), tod.lamps));
  // MOUNT KABOOMA, over in the dino park: nearer than the other lands, steaming
  strip(c, `rfKab:${tod.key}`, hz - 236, 2400, 276, cam.x * 0.08, g => {
    const KC = '#6A5A4E', T = (col: string, k = 0.32) => mix(farTint(col, 1, tod), sky(0.9), k);
    const st = [cloudTint('#B8C0CC', tod), cloudTint('#DCE2EA', tod), cloudTint('#F6F8FC', tod)].map(cl => mix(cl, sky(0.9), 0.3));
    kabooma(g, 1500, 276, 230, 140, { body: T(KC), lit: T(mix(KC, '#E8D4B4', 0.25)), hi: T(mix(KC, '#FFF0D8', 0.4)), shade: T(mix(KC, '#140C08', 0.2)), deep: T(mix(KC, '#140C08', 0.36)), lava: T('#E0581A', 0.2), lavaHi: '#FFB040', steam: st }, tod.lamps);
    // (the jungle round its foot)
    const fr = ['#1F4A2E', '#2D6438', '#3E7A40', '#5A9446'].map(cl => T(cl, 0.36));
    canopy(g, 2400, x => 256 + wave(x, 2400, 2.7, 4) * 6, 276, fr, 10, 23);
  });
  // (the haze lying along the horizon)
  const hzc = sky(1);
  box(c, 0, hz, W, 6, mix(hzc, '#FFFFFF', 0.1)); checker(c, 0, hz - 2, W, 2, hzc);
  // The monorail going by, on its beam, far off
  {
    const my = hz + 8 + up * 0.12, off = cam.x * 0.12;
    const beam = farTint('#C8CDD6', 0.8, tod);
    box(c, 0, my, W, 4, beam); box(c, 0, my + 4, W, 1, mix(beam, INK, 0.3));
    for (let k = -1; k < 6; k++) { const px = Math.round(k * 170 - (off % 170)); box(c, px, my + 5, 4, 40, mix(beam, INK, 0.15)); }
    const tx = ((f * 0.9 - off) % 2200 + 2200) % 2200 - 600;
    for (let car = 0; car < 4; car++) {
      const cx2 = tx + car * 50;
      box(c, cx2, my - 12, 46, 12, farTint(car ? '#E5E7EB' : '#DC2626', 0.8, tod)); box(c, cx2, my - 12, 46, 2, farTint('#FFFFFF', 0.8, tod));
      for (let wdw = 0; wdw < 4; wdw++) box(c, cx2 + 5 + wdw * 10, my - 9, 6, 4, tod.lamps > 0.15 ? mix(farTint('#60A5FA', 0.8, tod), '#FFE0A0', Math.min(1, tod.lamps * 1.2)) : farTint('#60A5FA', 0.8, tod));
    }
  }
  // The jungle: two layers of canopy, the far one hazed
  const farRamp = ['#1F4A2E', '#2D6438', '#3E7A40', '#5A9446'].map(cl => mix(farTint(cl, 0.8, tod), sky(0.95), 0.3));
  strip(c, `rfCanF:${tod.key}`, hz - 6 + up * 0.08, 1300, 400, cam.x * 0.2, g => canopyStrip(g, 1300, 400, 5, farRamp, 30, 5));
  const nearRamp = ['#123820', '#1C5028', '#2C6A30', '#4A8A3A'].map(cl => farTint(cl, 0.4, tod));
  strip(c, `rfCanN:${tod.key}`, hz + 36 + up * 0.2, 1500, 400, cam.x * 0.36, g => canopyStrip(g, 1500, 400, 9, nearRamp, 44, 4));
  // (birds, wheeling over it)
  for (let i = 0; i < 4; i++) {
    const bx = ((i * 260 + f * (0.5 + i * 0.1) - cam.x * 0.15) % 1000 + 1000) % 1000 - 100, by = hz + 10 + Math.sin(f * 0.02 + i) * 20 + i * 8;
    const flap = Math.floor((f + i * 7) / 8) % 2;
    const bc = farTint('#1F2937', 0.6, tod);
    box(c, bx - 4, by - flap * 2, 4, 2, bc); box(c, bx, by, 2, 2, bc); box(c, bx + 2, by - flap * 2, 4, 2, bc);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The ground, the plaza going back, the treeline (world space)

const PAVE = ['#6E604A', '#8A7A5E', '#A08E6E', '#B8A684'];
const paverPattern = (c: Ctx) => tilePattern(c, 'rfPaver', 64, 32, g => {
  g.fillStyle = PAVE[1]; g.fillRect(0, 0, 64, 32);
  for (let row = 0; row < 2; row++) for (let i = -1; i < 3; i++) {
    const x = i * 32 + (row ? 16 : 0), y = row * 16;
    g.fillStyle = (i + row) % 2 ? PAVE[2] : mix(PAVE[1], PAVE[2], 0.5); g.fillRect(x + 1, y + 1, 30, 14);
    g.fillStyle = PAVE[3]; g.fillRect(x + 1, y + 1, 30, 1);
    g.fillStyle = PAVE[0]; g.fillRect(x + 1, y + 14, 30, 1);
  }
});

/** The treeline at the back of the plaza: painted once, slid at its own rate (it's further off than the strip). */
const TREE_PAR = 0.55;
const treeline = (c: Ctx, e: Eye, v: { x: number; w: number }) => {
  const top = GY - BACK_H - 380;
  // (at the depth it's at: x on the strip taken back toward the eye)
  const ramp = ['#173A22', '#22502C', '#336834', '#4E8440'].map(cl => mix(cl, '#5A7A8A', 0.32));
  const sh = Math.round(e.x * (1 - TREE_PAR));
  c.save(); c.translate(sh, 0);
  const L = Math.floor((x0 - 900) * TREE_PAR), R = Math.ceil((x1 + 900) * TREE_PAR);
  const paint = (g: Ctx, a: number, b: number) => {
    const gy = GY - BACK_H;
    // (the palms, furthest back: standing on the ground (their feet behind the trees), up over the canopy)
    for (let x = L + 60; x < R; x += 230) if (x > a - 40 && x < b + 40) palm(g, x, gy, 270 + r1(x) * 60, ramp, mix('#6B4A2A', '#5A7A8A', 0.3));
    box(g, a, gy - 100, b - a, 120, ramp[0]);
    for (let x = L; x < R; x += 38) {
      if (x < a - 80 || x > b + 40) continue;
      const s = r1(x, 2), h = 150 + s * 120, th = h * 0.55, cr = 40 + s * 22;
      box(g, x + 8, gy - th, 14, th, mix('#4A3626', '#5A7A8A', 0.3)); box(g, x + 8, gy - th, 4, th, mix('#6E5438', '#5A7A8A', 0.3));
      // (its crown sat down over its trunk's top: no daylight between)
      crown(g, x + 16, gy - th - cr * 0.4, cr, ramp);
    }
    // (ferns along its foot)
    for (let x = a - (a - L) % 10; x < b; x += 10) { const hh = 10 + r1(x, 7) * 14; box(g, x, GY - BACK_H - hh, 6, hh + 2, ramp[1 + (Math.floor(x / 10) % 2)]); box(g, x + 1, GY - BACK_H - hh, 3, 2, ramp[3]); }
  };
  // (in chunks, painted once each, only the ones in view put down)
  const CH = 400;
  for (let cx = L; cx < R; cx += CH) {
    if (cx + sh > v.x + v.w + 40 || cx + CH + sh < v.x - 40) continue;
    stamp(c, `rfTreeline2:${cx}`, cx, top, CH, 400, g => { g.save(); g.beginPath(); g.rect(cx, top, CH, 400); g.clip(); paint(g, cx, cx + CH); g.restore(); });
  }
  c.restore();
};

/** The ground: the strip's plaza (lit along its edge), down; and the plaza going back behind it to the treeline. */
const drawGround = (c: Ctx, state: GameState, e: Eye) => {
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  const L = Math.max(x0 - 600, v.x - 40), R = Math.min(x1 + 600, v.x + v.w + 40);
  if (R <= L) return;
  // (the plaza going back: bands of it, further and hazier up toward the treeline; joints fanning to the eye)
  if (v.y < GY) {
    treeline(c, e, v);
    const yb = GY - BACK_H;
    const bands = [PAVE[1], mix(PAVE[1], '#9FB0B8', 0.12), mix(PAVE[1], '#9FB0B8', 0.24), mix(PAVE[1], '#9FB0B8', 0.36)];
    for (let i = 0; i < 4; i++) { const ya = GY - BACK_H * ((i + 1) / 4) ** 0.8, yb2 = GY - BACK_H * (i / 4) ** 0.8; box(c, L, ya, R - L, yb2 - ya + 1, bands[i]); }
    // (the joints across, closer together further back; the ones going back, toward the eye)
    for (let k = 1; k < 9; k++) { const y = GY - BACK_H * (1 - 1 / (1 + k * 0.5)) / (1 - 1 / 5.5); if (y > yb) box(c, L, y, R - L, 1, mix(PAVE[0], '#9FB0B8', 0.2)); }
    c.strokeStyle = mix(PAVE[0], '#9FB0B8', 0.15); c.lineWidth = 1; c.beginPath();
    for (let x = Math.floor(L / 48) * 48; x < R; x += 48) { const [bx, by] = [e.x + (x - e.x) * TREE_PAR, yb]; c.moveTo(x, GY); c.lineTo(bx, by); }
    c.stroke();
    box(c, L, yb, R - L, 2, mix(PAVE[0], '#5A7A8A', 0.3));
  }
  // (the strip's own: the lit lip, the pavers, bent toward him)
  c.fillStyle = paverPattern(c); c.fillRect(L, GY, R - L, 1400);
  box(c, L, GY, R - L, 2, PAVE[3]); box(c, L, GY + 2, R - L, 2, PAVE[2]);
  bendFloor(c, e, GY, GY, GY + 200, L, R);
};

// ---------------------------------------------------------------------------------------------------------------
// The temple

const tierL = (k: number) => BASE_L + k * TIER_IN, tierR = (k: number) => BASE_R - k * TIER_IN, tierTop = (k: number) => GY - (k + 1) * TIER_H;

/** Its fronts, painted once (as it stands; caved in, the damage on it). */
const fronts = (g: Ctx, caved: boolean) => {
  for (let k = 0; k < 4; k++) {
    const l = tierL(k), r = tierR(k), t = tierTop(k);
    stoneWall(g, l, t, r - l, TIER_H, 11 + k * 7, { seams: 192, moss: k === 0 ? 0.32 : 0.12, glyphs: true });
    // (a carved cornice along its top: a lit cap, a fret under it, its shadow)
    box(g, l, t, r - l, 8, STONE[5]); box(g, l, t, r - l, 2, STONE[6]); box(g, l, t + 8, r - l, 3, STONE[1]);
    for (let x = l + 6; x < r - 14; x += 16) { box(g, x, t + 3, 10, 2, STONE[2]); box(g, x + 8, t + 3, 2, 4, STONE[2]); }
    // (the frieze: a row of jaguar glyphs midway up, on the upper tiers)
    if (k >= 2) for (let x = l + 70; x < r - 60; x += 210) { box(g, x - 18, t + 50, 36, 30, STONE[3]); box(g, x - 18, t + 50, 36, 2, STONE[5]); box(g, x - 18, t + 78, 36, 2, STONE[1]); glyph(g, x, t + 66, STONE[3]); }
    // (a stenciled panel number on a seam, the odd bolt-on patch)
    const sx = l + 192 - (Math.round((11 + k * 7) * 37) % 192);
    signAt(g, `PANEL ${k + 1}-${'ABCD'[k]}`, sx + 26, t + TIER_H - 12, 5, stencil(5, mix(STONE[2], STONE[4], 0.4)));
    // (vines off its edge)
    for (let i = 0; i < 4; i++) { const vx = l + 40 + r1(i, k) * (r - l - 80); vineDown(g, vx, t + 8, 30 + r1(i, k + 3) * (TIER_H - 30), i + k); }
  }
  // The entrance: a dark doorway in a jaguar's mouth (fangs along the lintel), steps up to it; carved over it, the sign
  const dx = DOOR_X, dy = GY - DOOR_H;
  box(g, dx - 18, dy - 34, DOOR_W + 36, DOOR_H + 34, STONE[2]);
  box(g, dx - 18, dy - 34, DOOR_W + 36, 2, STONE[5]); box(g, dx - 18, dy - 34, 2, DOOR_H + 34, STONE[4]);
  box(g, dx, dy, DOOR_W, DOOR_H, DARK);
  bandedGradient(g, dx, dy, DOOR_W, 40, ['#3A2A18', '#22180E', DARK], 4);
  for (let k = 0; k < 6; k++) { const fx = dx + 4 + k * 13; g.fillStyle = '#EDE6D2'; g.beginPath(); g.moveTo(fx, dy); g.lineTo(fx + 10, dy); g.lineTo(fx + 5, dy + 12 + (k % 2) * 4); g.fill(); box(g, fx, dy, 3, 2, '#FFFFFF'); }
  plaque(g, dx + DOOR_W / 2, dy - 18, DOOR_W + 20, 18, STONE[3], ['ENTRANCE'], STONE[0], 7, stone(7, STONE[0], STONE[5], MOSS[2]));
  // (the queue's little steps up into it)
  for (let k = 0; k < 2; k++) { box(g, dx - 8 + k * 4, GY - 8 + k * 4, DOOR_W + 16 - k * 8, 4, STONE[4 - k]); box(g, dx - 8 + k * 4, GY - 8 + k * 4, DOOR_W + 16 - k * 8, 1, STONE[6]); }
  // A sign bolted to the stone: the ride's rules (a joke at the end)
  plaque(g, BASE_R - 230, GY - 70, 92, 46, '#E7D9A8', ['KEEP HANDS,', 'ARMS & FEET', 'INSIDE THE', 'TEMPLE'], '#3B2A12', 5);
  if (!caved) return;
  // Caved in: cracks down from the top, a panel off (the plywood under it), rubble on the treads
  g.strokeStyle = STONE[0]; g.lineWidth = 2;
  for (const [sx, len] of [[ROOF_L + 60, 220], [HOLE_X + 70, 300], [ROOF_L + 300, 160], [ROOF_R - 80, 240], [ROOF_L + 180, 120]] as const) {
    g.beginPath(); let x = sx, y = RY + 8; g.moveTo(x, y);
    while (y < RY + len) { x += (r1(x, y) - 0.5) * 18; y += 10 + r1(y, x) * 12; g.lineTo(Math.round(x), Math.round(y)); }
    g.stroke();
  }
  // (a panel shaken off: the plywood and the framing behind the stone, its bolt holes)
  const px = ROOF_L + 120, py = RY + 34;
  box(g, px, py, 64, 50, PLY[1]); for (let k = 0; k < 64; k += 8) box(g, px + k, py, 1, 50, PLY[0]);
  box(g, px + 20, py, 6, 50, PLY[2]); box(g, px, py, 64, 2, SHELL); box(g, px, py + 48, 64, 2, PLY[0]);
  signAt(g, 'MADE IN', px + 32, py + 22, 5, stencil(5, PLY[3])); signAt(g, 'OHIO', px + 32, py + 32, 5, stencil(5, PLY[3]));
  // (rubble down on the treads and at the foot)
  for (let i = 0; i < 26; i++) {
    const k = i % 3, onRight = i % 2, tx = onRight ? tierR(k + 1) + 6 + r1(i) * (TIER_IN - 20) : tierL(k) + 6 + r1(i) * (TIER_IN - 20);
    const ty = tierTop(k), s = 6 + Math.floor(r1(i, 3) * 3) * 3;
    box(g, tx, ty - s, s * 1.4, s, STONE[3]); box(g, tx, ty - s, s * 1.4, 2, STONE[5]); box(g, tx + s * 1.4 - 2, ty - s, 2, s, STONE[1]);
  }
  for (let i = 0; i < 12; i++) { const tx = BASE_L + 20 + r1(i, 9) * (BASE_R - BASE_L - 40), s = 6 + r1(i, 4) * 10; box(g, tx, GY - s, s * 1.5, s, STONE[3]); box(g, tx, GY - s, s * 1.5, 2, STONE[5]); }
};

/** Its ends and the treads of its steps, going back toward the eye (live: they turn as he goes by). */
const sides = (c: Ctx, e: Eye) => {
  for (let k = 0; k < 4; k++) {
    const l = tierL(k), r = tierR(k), t = tierTop(k), b = t + TIER_H;
    // (the treads: the bits of each tier's top either side of the one over it; the top tier's is the roof, drawn apart)
    if (k < 3 && e.y < t - 1) {
      for (const [a, z] of [[l, tierL(k + 1)], [tierR(k + 1), r]] as const) {
        quad(c, [[a, t], [z, t], back(e, z, t, 1), back(e, a, t, 1)], STONE[4]);
        // (courses going back across it, the lit front edge)
        for (const kk of [0.33, 0.66]) { const p = back(e, a, t, kk), q = back(e, z, t, kk); box(c, Math.min(p[0], q[0]), p[1], Math.abs(q[0] - p[0]), 1, STONE[3]); }
        box(c, a, t - 2, z - a, 2, STONE[5]);
      }
    }
    // (its left end, if he's left of it; its right, if right: lit on the left, shadowed on the right)
    if (e.x < l - 1) { quad(c, [[l, t], back(e, l, t, 1), back(e, l, b, 1), [l, b]], STONE[5]); const m = back(e, l, t, 0.5), m2 = back(e, l, b, 0.5); c.strokeStyle = STONE[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(m[0], m[1]); c.lineTo(m2[0], m2[1]); c.stroke(); }
    if (e.x > r + 1) { quad(c, [[r, t], back(e, r, t, 1), back(e, r, b, 1), [r, b]], STONE[2]); checker(c, r, t, 4, TIER_H, STONE[1]); }
    // (the courses going back along whichever end's showing)
    const endX = e.x < l - 1 ? l : e.x > r + 1 ? r : null;
    if (endX !== null) for (let y = t + 28; y < b; y += 28) { const p = back(e, endX, y, 1); c.strokeStyle = STONE[endX === l ? 3 : 1]; c.lineWidth = 2; c.beginPath(); c.moveTo(endX, y); c.lineTo(p[0], p[1]); c.stroke(); }
  }
};

/** The roof's top (the bit he stands on): each tile its own (lit tread going back, its front the top course); gone, the
 * hole: the shell's broken edge, the framing in the dark, the dark. */
const roofTop = (c: Ctx, e: Eye, r: RoofLook, f: number) => {
  const n = r.tiles.length;
  const look = e.y < RY - 1;
  for (let i = 0; i < n; i++) {
    const t = r.tiles[i], x = ROOF_L + i * TILE;
    if (t.gone) {
      // (the hole: its far wall going down inside, the dark, the shell's broken lip and the stone's ragged bottom edge)
      const depth = 22 + Math.floor(r1(i, 5) * 4) * 6;
      if (look) { const a = back(e, x, RY, 1), b2 = back(e, x + TILE, RY, 1); quad(c, [[x, RY], [x + TILE, RY], b2, a], DARK); box(c, a[0], a[1], b2[0] - a[0] + 1, 6, PLY[1]); box(c, a[0], a[1] + 6, b2[0] - a[0] + 1, 4, PLY[0]); }
      box(c, x, RY, TILE, depth, DARK);
      if (i % 3 === 0) { box(c, x + 6, RY + 4, 4, depth - 4, PLY[1]); box(c, x + 6, RY + 4, 1, depth - 4, PLY[2]); }
      // (where it's broken off against tile still there: the edge of the shell, a tuft of the pink insulation)
      const lft = i > 0 && !r.tiles[i - 1].gone, rgt = i < n - 1 && !r.tiles[i + 1].gone;
      if (lft) { box(c, x, RY, 2, depth + 4, SHELL); box(c, x + 2, RY + 6, 4, 8, FOAM); }
      if (rgt) { box(c, x + TILE - 2, RY, 2, depth + 4, SHELL); box(c, x + TILE - 6, RY + 10, 4, 8, FOAM); }
      box(c, x, RY + depth, TILE, 4, STONE[1]); box(c, x + (i % 2) * 8, RY + depth + 4, 10, 4, STONE[1]);
      continue;
    }
    const j = t.shake ? Math.round(Math.sin(f * 1.7 + i) * 1.5) : 0;
    if (look) {
      const a = back(e, x + j, RY, 1), b2 = back(e, x + TILE + j, RY, 1);
      quad(c, [[x + j, RY], [x + TILE + j, RY], b2, a], i % 2 ? STONE[5] : mix(STONE[5], STONE[4], 0.4));
      const m = back(e, x + j, RY, 0.5); box(c, m[0], m[1], Math.max(1, b2[0] - a[0]), 1, STONE[4]);
      box(c, a[0], a[1], 1, RY - a[1], STONE[3]);
    }
    // (its front: the top course, lit lip along it: it's to stand on)
    box(c, x + j, RY, TILE, 26, i % 2 ? STONE[4] : mix(STONE[4], STONE[3], 0.5));
    box(c, x + j, RY + 24, TILE, 2, STONE[1]); box(c, x + j + TILE - 1, RY, 1, 26, STONE[1]);
    box(c, x + j, RY - 2, TILE, 2, STONE[6]); box(c, x + j, RY, TILE, 1, '#FFF4D6');
    if (t.shake) { c.strokeStyle = STONE[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 5, RY + 1); c.lineTo(x + 9, RY + 8); c.lineTo(x + 6, RY + 14); c.lineTo(x + 11, RY + 24); c.stroke(); }
  }
};

/** The tiki torches either side of the entrance, flickering (their light: lamps). */
const torch = (c: Ctx, x: number, f: number) => {
  pole(c, x - 3, GY - 96, 6, 96, '#8B6A3E');
  for (let k = 0; k < 4; k++) box(c, x - 4, GY - 90 + k * 22, 8, 2, '#5A3E1E');
  box(c, x - 7, GY - 104, 14, 10, '#6B4A2A'); box(c, x - 7, GY - 104, 14, 2, '#A07A4A');
  const fl = Math.floor(f / 5) % 3;
  const flame = [['#B91C1C', 9, 18], ['#F97316', 7, 14], ['#FDE047', 4, 8]] as const;
  flame.forEach(([col, w, h], i) => { const hh = h + (fl === i ? 3 : 0); c.fillStyle = col; c.beginPath(); c.moveTo(x - w, GY - 104); c.quadraticCurveTo(x - w * 0.6, GY - 104 - hh * 0.6, x + (fl - 1) * 2, GY - 104 - hh); c.quadraticCurveTo(x + w * 0.6, GY - 104 - hh * 0.6, x + w, GY - 104); c.fill(); });
};
export const TORCHES = [DOOR_X - 34, DOOR_X + DOOR_W + 34];

/** The temple and the ground round it (drawn again over him once he's gone in the hole). */
export const drawTempleBody = (c: Ctx, state: GameState, r: RoofLook) => {
  const e = eyeOf(state), f = state.frame;
  drawGround(c, state, e);
  sides(c, e);
  stamp(c, `rfFront:${r.caved ? 1 : 0}`, BASE_L - 4, RY - 4, BASE_R - BASE_L + 8, GY - RY + 8, g => fronts(g, r.caved));
  // (the sun behind it: the lens's glare fades, sunFlare.ts)
  sunBehind(c, (x, y) => { for (let k = 0; k < 4; k++) if (x > tierL(k) && x < tierR(k) && y > tierTop(k) && y < GY) return true; return false; });
  roofTop(c, e, r, f);
  for (const tx of TORCHES) torch(c, tx, f);
};

// ---------------------------------------------------------------------------------------------------------------
// The line: going back across the plaza in switchbacks, the rows smaller and hazier back there

/** A row of the line: how far back (0 the front, along the strip), and its people. */
const ROWS = [0.3, 0.55, 0.8].map((z, k) => ({
  z, dir: (k % 2 ? 1 : -1) as 1 | -1,
  people: Array.from({ length: 14 }, (_, i) => ({ x: LINE_L - 40 + i * 34 + r1(i, k) * 10, seed: 300 + k * 41 + i * 13, woman: r1(i, k + 7) < 0.5 })),
}));
/** On the plaza, z of the way back: up the screen by, how big. */
const rowAt = (z: number) => { const k = (1 - 1 / (1 + z * 1.6)) / (1 - 1 / 2.6); return { up: BACK_H * k * 0.92, s: 1 - (1 - TREE_PAR) * k }; };

let layer: HTMLCanvasElement | null = null;
/** Paints `paint` on a layer of its own, hazes what's on it once (only where it painted), and puts it down. */
const hazed = (c: Ctx, haze: string, a: number, bbox: [number, number, number, number], paint: (g: Ctx) => void) => {
  if (typeof document === 'undefined') return;
  const m = c.getTransform(), cw = c.canvas.width, ch = c.canvas.height;
  const L = Math.max(0, Math.floor(bbox[0] * m.a + m.e)), T = Math.max(0, Math.floor(bbox[1] * m.d + m.f));
  const R = Math.min(cw, Math.ceil(bbox[2] * m.a + m.e)), B = Math.min(ch, Math.ceil(bbox[3] * m.d + m.f));
  if (R - L < 1 || B - T < 1) return;
  if (!layer) layer = document.createElement('canvas');
  if (layer.width < cw || layer.height < ch) { layer.width = cw; layer.height = ch; }
  const g = layer.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(L, T, R - L, B - T);
  g.setTransform(m); g.imageSmoothingEnabled = false;
  paint(g);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-atop'; g.globalAlpha = a; g.fillStyle = haze; g.fillRect(L, T, R - L, B - T);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(layer, L, T, R - L, B - T, L, T, R - L, B - T); c.restore();
};

/** A bamboo post (scaled), its nodes. */
const post = (c: Ctx, x: number, y: number, s: number) => {
  const h = Math.round(34 * s), w = Math.max(2, Math.round(4 * s));
  box(c, x - w / 2 - 1, y - h - 1, w + 2, h + 1, INK);
  box(c, x - w / 2, y - h, w, h, '#C9A15A'); box(c, x - w / 2, y - h, Math.max(1, w / 3), h, '#E6C47E');
  for (let k = 1; k < 3; k++) box(c, x - w / 2, y - h + Math.round(k * 11 * s), w, 1, '#7A5A2A');
};
/** Rope swagged between posts. */
const rope = (c: Ctx, xa: number, xb: number, y: number, s: number) => {
  c.strokeStyle = '#5A3E1E'; c.lineWidth = Math.max(1, 3 * s); c.beginPath(); c.moveTo(xa, y); c.quadraticCurveTo((xa + xb) / 2, y + 8 * s, xb, y); c.stroke();
  c.strokeStyle = '#B08850'; c.lineWidth = Math.max(1, 1.4 * s); c.beginPath(); c.moveTo(xa, y - 1); c.quadraticCurveTo((xa + xb) / 2, y + 8 * s - 1, xb, y - 1); c.stroke();
};

/** One of the line, at (x, feet y), scale s, facing dir; horrified or bored; hands to the face (horrified, some). */
const guest = (c: Ctx, x: number, y: number, s: number, dir: 1 | -1, seed: number, woman: boolean, f: number, horror: boolean, talking = false, still = false) => {
  const shake = horror ? Math.round(Math.sin(f * 0.6 + seed) * 1.2) : 0;
  c.save(); c.translate(Math.round(x + shake), Math.round(y)); c.scale(dir * s, s);
  const paint = (g: Ctx, fr: number) => {
    const L = drawPerson(g, { seed, outfit: 'guest', f: fr, woman, mood: horror ? (seed % 3 ? 'shocked' : 'scared') : 'bored', talking });
    if (horror && seed % 2 && !talking) for (const hx of [-9, 9]) { g.fillStyle = INK; g.fillRect(hx - 3, -66, 7, 9); g.fillStyle = L.skin; g.fillRect(hx - 2, -65, 5, 7); }
  };
  // (the rows back there: each one painted once, as they are)
  if (still) stamp(c, `rfQ:${seed}:${woman ? 1 : 0}:${horror ? 1 : 0}`, -26, -96, 52, 100, g => paint(g, 40));
  else paint(c, f + seed * 7);
  c.restore();
};

/** The line's rows going back across the plaza: behind the strip, so behind the temple too (drawn before it). */
export const drawLineBack = (c: Ctx, state: GameState, r: RoofLook) => {
  const e = eyeOf(state), f = state.frame;
  const v = state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
  const horror = r.horror || r.caved;
  // (culled by where the rows land on screen: taken back toward the eye, they're not where the line stands)
  const s0 = rowAt(ROWS[ROWS.length - 1].z).s, ext = (x: number) => [x, e.x + (x - e.x) * s0];
  const [l0, l1] = ext(LINE_L - 120), [r0, r1] = ext(LINE_R + 160);
  if (Math.min(l0, l1) < v.x + v.w + 40 && Math.max(r0, r1) > v.x - 40 && v.y < GY) {
    // The rows going back, furthest first, each hazed once as it goes down (the further, the more)
    for (let k = ROWS.length - 1; k >= 0; k--) {
      const row = ROWS[k], at = rowAt(row.z), y = GY - at.up, s = at.s;
      const X = (x: number) => e.x + (x - e.x) * s;
      const xa = X(LINE_L - 80), xb = X(LINE_R + 120);
      hazed(c, '#9FB4C4', 0.18 + k * 0.14, [xa - 40, y - 90 * s, xb + 40, y + 6], g => {
        // (the rope behind them, the posts; the U-turn at the end into the next row)
        for (let x = LINE_L - 80; x <= LINE_R + 120; x += 100) post(g, X(x), y + 2, s);
        rope(g, xa, xb, y - 26 * s, s);
        for (const p of row.people) guest(g, X(p.x), y, s, horror ? -1 : row.dir, p.seed, p.woman, f, horror, false, true);
        rope(g, xa, xb, y - 16 * s + 6, s);
      });
    }
  }
};

/** The line's front row along the rope (on the strip, in front of everything back there), its signs, the way on. */
export const drawLine = (c: Ctx, state: GameState, r: RoofLook, saying: number) => {
  const f = state.frame, horror = r.horror || r.caved;
  // The front row: along the rope, nearest him
  for (let x = LINE_L - 20; x <= LINE_R + 20; x += 80) post(c, x, GY, 1);
  rope(c, LINE_L - 20, LINE_R + 20, GY - 28, 1);
  GUESTS.forEach((g, i) => guest(c, g.x, GY, 1, -1, g.seed, g.woman, f, horror, i === saying));
  rope(c, LINE_L - 20, LINE_R + 20, GY - 16, 1);
  // The sign at the tail of it, on its posts
  const sx = LINE_R + 70;
  post(c, sx - 40, GY, 2.6); post(c, sx + 40, GY, 2.6);
  plaque(c, sx, GY - 104, 116, 40, '#7A5230', ['TEMPLE OF THE', 'JAGUAR', 'WAIT: 95 MIN'], '#FDE68A', 6);
  // The way on: an arrow board on a post
  post(c, EXIT_X, GY, 2.8);
  c.save(); c.translate(EXIT_X, GY - 92);
  stamp(c, 'rfTrail', -56, -16, 124, 32, g => {
    g.fillStyle = INK; g.beginPath(); g.moveTo(-54, -14); g.lineTo(44, -14); g.lineTo(64, 0); g.lineTo(44, 14); g.lineTo(-54, 14); g.closePath(); g.fill();
    g.fillStyle = '#7A5230'; g.beginPath(); g.moveTo(-52, -12); g.lineTo(43, -12); g.lineTo(61, 0); g.lineTo(43, 12); g.lineTo(-52, 12); g.closePath(); g.fill();
    box(g, -52, -12, 95, 2, '#A07A4A'); box(g, -52, 9, 95, 3, '#4A3018');
    for (const yy of [-6, 3]) box(g, -50, yy, 90, 1, '#5E3E20');
    signAt(g, 'JUNGLE TRAIL', -2, 3, 6, routed(6, '#FDE68A', '#3A2410'));
  });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Dust, the cloud out of the hole, the cart, the parachute

/** A puff of dust, stepped (a dusky underside, the body, a lit top), fading in steps. */
const puff = (c: Ctx, x: number, y: number, rr: number, a: number) => {
  const q = a > 0.45 ? 0.7 : a > 0.25 ? 0.45 : 0.22;
  c.globalAlpha = q;
  pixelBlob(c, x + rr * 0.15, y + rr * 0.15, rr, rr * 0.8, '#8A7A60');
  pixelBlob(c, x, y, rr * 0.9, rr * 0.72, '#C2B396');
  pixelBlob(c, x - rr * 0.25, y - rr * 0.25, rr * 0.45, rr * 0.32, '#E6DCC4');
  c.globalAlpha = 1;
};
export const drawDust = (c: Ctx, r: RoofLook) => { for (const d of r.dust) puff(c, d.x, d.y, d.r, Math.min(0.6, d.life / 120)); };

/** Down the hole and dead: a big cartoon cloud of dust mushrooming up out of it, over the roof. */
export const drawPoof = (c: Ctx, t: number, x: number) => {
  const k = Math.min(1, t / 50), fade = t < 160 ? 1 : Math.max(0, 1 - (t - 160) / 80);
  if (fade <= 0) return;
  const base = RY + 10, rise = 30 + 75 * (1 - (1 - k) * (1 - k));
  const R = 20 + 24 * k;
  const puffs: [number, number, number][] = [[-1.05, 0.55, 0.6], [1.05, 0.55, 0.6], [0, 0.6, 0.85], [-0.75, 0.15, 0.9], [0.75, 0.15, 0.9], [0, 0, 1.25], [-0.4, -0.45, 0.95], [0.45, -0.45, 0.95], [0, -0.8, 1.05]];
  // (the stalk of it, up out of the hole)
  c.globalAlpha = fade > 0.6 ? 1 : fade > 0.3 ? 0.6 : 0.3;
  pixelBlob(c, x, base - rise * 0.3, R * 0.5, rise * 0.4 + 6, '#A89878');
  for (const [dx, dy, s] of puffs) { const wob = Math.sin(t * 0.15 + dx * 5) * 2; pixelBlob(c, x + dx * R * 1.3 + wob + 3, base - rise + dy * R + 3, R * s, R * s * 0.85, '#7A6A50'); }
  for (const [dx, dy, s] of puffs) { const wob = Math.sin(t * 0.15 + dx * 5) * 2; pixelBlob(c, x + dx * R * 1.3 + wob, base - rise + dy * R, R * s * 0.94, R * s * 0.8, '#CFC0A0'); }
  for (const [dx, dy, s] of puffs) if (dy < 0.2) pixelBlob(c, x + dx * R * 1.3 - R * 0.25, base - rise + dy * R - R * 0.3, R * s * 0.4, R * s * 0.3, '#F2EAD6');
  // (a few chunks still coming down out of it)
  for (let i = 0; i < 6; i++) { const a = i * 1.7; const cx = Math.round(x + Math.cos(a) * R * 1.8), cy = Math.round(base - rise + Math.sin(a) * R + (t % 40) * 1.5); box(c, cx - 1, cy - 1, 8, 7, INK); box(c, cx, cy, 6, 5, STONE[3]); box(c, cx, cy, 6, 1, STONE[5]); }
  c.globalAlpha = 1;
};

/** The empty cart, flying up out of the hole after him and back down it: riveted, rusted, its wheels spinning. */
export const drawCart = (c: Ctx, x: number, y: number, vy: number, f: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y - 24)); c.rotate(vy * 0.03);
  const R = ['#3A2414', '#5E3A1E', '#80522A', '#A86E3A'];
  c.fillStyle = INK; c.beginPath(); c.moveTo(-38, -14); c.lineTo(38, -14); c.lineTo(32, 12); c.lineTo(-32, 12); c.closePath(); c.fill();
  c.fillStyle = R[2]; c.beginPath(); c.moveTo(-36, -12); c.lineTo(36, -12); c.lineTo(30, 10); c.lineTo(-30, 10); c.closePath(); c.fill();
  box(c, -36, -12, 72, 3, R[3]); box(c, -30, 6, 60, 4, R[1]); box(c, -36, -12, 72, 1, '#D49A5A');
  for (let k = -30; k <= 30; k += 12) { box(c, k, -6, 2, 2, R[0]); box(c, k, 2, 2, 2, R[0]); }
  checker(c, -24, -4, 20, 6, R[1]);
  for (const wx of [-20, 20]) { ball(c, wx, 14, 6, '#4B5563'); const a = f * 0.6; box(c, wx + Math.cos(a) * 3 - 1, 14 + Math.sin(a) * 3 - 1, 2, 2, '#D1D5DB'); }
  c.restore();
};

/** Artie's parachute (from the gift shop: a souvenir, and it shows): popping open over him, swaying, its lines down to
 * his fists (up over his head: the 'dodge' pose's, 88 over his feet). Nylon panels, each lit across its top. */
export const drawChute = (c: Ctx, x: number, feetY: number, t: number, f: number) => {
  const open = Math.min(1, 0.25 + t / 10), sway = Math.sin(t * 0.05) * 0.12;
  c.save(); c.translate(x, feetY - 88); c.rotate(sway);
  const Wd = 68 * open, TOP = -96 - 10 * open, RIM = -62, H = RIM - TOP;
  // the lines, from the rim down to his fists
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath();
  for (const k of [-1, -0.45, 0.45, 1]) { c.moveTo(k * Wd, RIM); c.lineTo(k < 0 ? -4.5 : 4.5, 0); }
  c.stroke();
  c.strokeStyle = '#E7E5E4'; c.lineWidth = 1; c.beginPath();
  for (const k of [-1, -0.45, 0.45, 1]) { c.moveTo(k * Wd, RIM); c.lineTo(k < 0 ? -4.5 : 4.5, 0); }
  c.stroke();
  // the canopy: an ink edge, loud panels, each in its ramp (shadow toward the rim, lit toward the crown)
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, RIM, Wd + 2, H + 2, 0, Math.PI, 0); c.fill();
  const PANELS = [['#9D2A6A', '#DB4F95', '#F79BC8'], ['#B8901A', '#F2C624', '#FDE98A'], ['#127A8E', '#22B8D0', '#8AE6F2']];
  const order = [0, 1, 2, 1, 0, 1, 2, 1];
  for (let i = 0; i < order.length; i++) {
    const a0 = Math.PI + (i / order.length) * Math.PI, a1 = Math.PI + ((i + 1) / order.length) * Math.PI;
    const ramp = PANELS[order[i]];
    for (const [s, col] of [[1, ramp[0]], [0.8, ramp[1]], [0.45, ramp[2]]] as const) {
      c.fillStyle = col; c.beginPath(); c.moveTo(0, RIM - H * (1 - s));
      c.ellipse(0, RIM, Wd, H, 0, a0, a1); c.closePath(); c.fill();
      if (s < 1) break;
    }
    // (lit along the crown, shadowed on the side away from the light)
    c.fillStyle = i < 4 ? ramp[2] : ramp[0];
    c.beginPath(); c.moveTo(0, TOP + 2); c.ellipse(0, RIM, Wd * 0.94, H * 0.94, 0, a0, a1); c.lineTo(0, TOP + 2 + H * 0.5); c.closePath(); c.globalAlpha = 0.35; c.fill(); c.globalAlpha = 1;
  }
  // (the seams between the panels)
  c.strokeStyle = 'rgba(26,11,6,0.45)'; c.lineWidth = 1; c.beginPath();
  for (let i = 1; i < order.length; i++) { const a = Math.PI + (i / order.length) * Math.PI; c.moveTo(0, TOP + 2); c.lineTo(Math.cos(a) * Wd, RIM + Math.sin(a) * H); }
  c.stroke();
  // (scalloped rim)
  for (let k = -Wd; k < Wd - 1; k += Wd / 4) { c.fillStyle = INK; c.beginPath(); c.ellipse(k + Wd / 8, RIM, Wd / 8 + 1, 4, 0, 0, Math.PI); c.fill(); c.fillStyle = '#BE185D'; c.beginPath(); c.ellipse(k + Wd / 8, RIM, Wd / 8, 3, 0, 0, Math.PI); c.fill(); }
  // what's printed on it, once it's open: I (heart) ADVENTURE LAND, and the price tag still on it
  if (open >= 1) {
    signAt(c, 'I', -6, RIM - 21, 7, print(7, '#1E1B4B'));
    c.fillStyle = '#DC2626'; c.beginPath(); c.arc(3.5, RIM - 27, 2.6, Math.PI, 0); c.arc(8.7, RIM - 27, 2.6, Math.PI, 0); c.lineTo(6.1, RIM - 21); c.closePath(); c.fill();
    signAt(c, 'ADVENTURE LAND', 0, RIM - 10, 6, print(6, '#1E1B4B'));
    const ty = RIM + 10 + Math.sin(f * 0.2) * 1.5;
    c.strokeStyle = '#E7E5E4'; c.beginPath(); c.moveTo(Wd * 0.8, RIM + 1); c.lineTo(Wd * 0.8 + 3, ty); c.stroke();
    box(c, Wd * 0.8 - 3, ty - 1, 22, 11, INK); box(c, Wd * 0.8 - 2, ty, 20, 9, '#FAFAF9');
    text(c, '$9.99', Wd * 0.8 + 8, ty + 7, '#DC2626', 4, 'center', null);
  }
  c.restore();
};

/** The roof's falling bits (for the particles): stone in its ramp, the shell, the pink insulation. */
export const CHUNK_COLORS = [STONE[2], STONE[3], STONE[4], STONE[5], SHELL, FOAM, MOSS[2]];
