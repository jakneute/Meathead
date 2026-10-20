// The temple roof, painted (the final pass: peak SNES). What's here:
//
//   The view (screen space): the hour's banded sky, its clouds; far off over the park, the other lands' landmarks on
//     the skyline (the castle's spires, the needle tower, the haunted castle, the mesa), hazed; the hills; the
//     monorail going by on its beam; the jungle's canopy in two layers, sliding by at their own rates, sinking under
//     him as he's up high (from the roof he sees out over it all; down by the line it's all trees); the rest of Jungle
//     Land's rides up out of each layer (the treehouse in its banyan, the dino park's stockade and gate with the
//     brachiosaurus over it, the cruise's lookout, the tiki totem; the mine train's lift hill and drop, the safari
//     balloon, the Jungle Cruise boathouse, Trader Stan's with its gorilla), lit after dark, painted per hour.
//   The show building (world space, behind the temple): the box the temple's the front of, its flat roof going back
//     from the tread (membrane, walk pads, a puddle, parapets), the rooftop units (fans going round), exhaust fans, the
//     duct, the hatch, the dish, the crew's corner, and the giant jaguar head at the back from behind (fiberglass on a
//     lumber frame, braced, THIS SIDE TOWARD GUESTS); its top shows over the temple from down by the line.
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
import { drawGuest as drawParkGuest } from '../../frontier/town/people';
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

/** A ramp from a color through `T` (the hour's haze for the layer): deep, shade, body, lit, highlight. */
const rampT = (T: (c: string) => string, col: string) => [T(mix(col, '#0A0A14', 0.4)), T(mix(col, '#0A0A14', 0.2)), T(col), T(mix(col, '#FFFFFF', 0.22)), T(mix(col, '#FFFFFF', 0.45))];
/** Thatch over a pitched roof (left x0, right x1, eaves at y, peak at top): bands of straw, lit up the left. */
const thatchRoof = (g: Ctx, x0: number, x1: number, y: number, top: number, P: string[], ink: string) => {
  const mx = (x0 + x1) / 2;
  quad(g, [[x0 - 2, y + 2], [mx, top - 2], [x1 + 2, y + 2]], ink);
  quad(g, [[x0, y], [mx, top], [x1, y]], P[2]);
  quad(g, [[x0, y], [mx, top], [mx - (x1 - x0) * 0.12, y]], P[3]);
  quad(g, [[mx + (x1 - x0) * 0.2, y], [mx, top], [x1, y]], P[1]);
  for (let k = 1; k < 4; k++) { const yy = top + ((y - top) * k) / 4, hw = ((x1 - x0) / 2) * (k / 4); for (let x = mx - hw; x < mx + hw; x += 4) box(g, x, yy, 2, 2, x < mx ? P[4] : P[0]); }
  for (let x = x0; x < x1; x += 3) box(g, x, y, 2, 2 + ((x * 7) % 3), P[1]);
};

/**
 * Jungle Land's far rides, sticking up out of the far canopy (their feet in it): the treehouse in its giant fake banyan
 * (plank decks, thatched huts, a rope bridge to a second tree, the flag), the dino park's log stockade and its gate arch
 * (torches on the posts) with the brachiosaurus's neck up over it (an animatronic: the seams in its neck), the Jungle
 * Cruise's lookout on its stilts (its striped pennant), the tiki totem. Windows and torches lit after dark.
 */
const farRides = (g: Ctx, T: (c: string) => string, lamps: number) => {
  const gy = 256, ink = T(INK), lit = lamps > 0.3, glow = T('#FFD27A');
  const LEAF = ['#1F4A2E', '#2D6438', '#3E7A40', '#5A9446'].map(T), BRK = rampT(T, '#6E5236'), PLK = rampT(T, '#9A7448'), TH = rampT(T, '#B89A5A');
  // The treehouse: the banyan (its trunk a tangle of roots, the crown wide), decks, huts, the bridge, the flag
  {
    const x = 200;
    for (let k = -3; k <= 3; k++) { const rx = x + k * 7; box(g, rx - 1, gy - 150, 7, 150, ink); box(g, rx, gy - 150, 5, 150, BRK[k < 0 ? 3 : k > 1 ? 1 : 2]); }
    for (let k = 0; k < 6; k++) { const rx = x - 50 + k * 20; box(g, rx, gy - 60 - (k % 3) * 10, 2, 60 + (k % 3) * 10, BRK[1]); }
    for (const [dx, dy, r] of [[-60, -160, 46], [55, -165, 44], [0, -190, 52], [-30, -205, 34], [34, -210, 30]] as const) crown(g, x + dx, gy + dy, r, LEAF);
    for (const [dy, w] of [[-118, 110], [-150, 70]] as const) {
      box(g, x - w / 2 - 1, gy + dy - 1, w + 2, 6, ink); box(g, x - w / 2, gy + dy, w, 4, PLK[2]); box(g, x - w / 2, gy + dy, w, 1, PLK[3]);
      for (let k = x - w / 2; k <= x + w / 2; k += 10) box(g, k, gy + dy - 10, 2, 10, PLK[1]);
      box(g, x - w / 2, gy + dy - 10, w, 2, PLK[2]);
    }
    for (const [hx, hy, hw] of [[x - 34, gy - 118, 30], [x + 22, gy - 150, 26]] as const) {
      box(g, hx - hw / 2, hy - 18, hw, 18, PLK[1]); box(g, hx - hw / 2, hy - 18, 3, 18, PLK[3]);
      box(g, hx - 4, hy - 13, 8, 8, lit ? glow : T('#2A1A0E'));
      thatchRoof(g, hx - hw / 2 - 6, hx + hw / 2 + 6, hy - 18, hy - 38, TH, ink);
    }
    // (the rope bridge, sagging, to the second tree, its own crown)
    g.strokeStyle = T('#8A6A3A'); g.lineWidth = 2; g.beginPath(); g.moveTo(x + 55, gy - 118); g.quadraticCurveTo(x + 90, gy - 100, x + 128, gy - 112); g.stroke();
    g.lineWidth = 1; g.beginPath(); g.moveTo(x + 55, gy - 130); g.quadraticCurveTo(x + 90, gy - 112, x + 128, gy - 124); g.stroke();
    for (let k = 0; k < 8; k++) { const t = k / 7, bx = x + 55 + 73 * t, by = gy - 118 + 18 * 4 * t * (1 - t) - 6 * t; box(g, bx, by - 12, 1, 12, T('#8A6A3A')); }
    box(g, x + 128, gy - 120, 8, 120, BRK[2]); box(g, x + 128, gy - 120, 3, 120, BRK[3]);
    for (const [dx, dy, r] of [[118, -136, 30], [146, -128, 26], [132, -152, 24]] as const) crown(g, x + dx, gy + dy, r, LEAF);
    box(g, x - 1, gy - 252, 2, 50, T('#4A3A2A')); box(g, x + 1, gy - 252, 18, 10, T('#2E8A4A')); box(g, x + 1, gy - 247, 18, 2, T('#F2C21E'));
  }
  // The dino park: the stockade, the gate arch (its sign, the torches), the brachiosaurus's neck over it
  {
    const x = 610, DINO = rampT(T, '#7E9A6A');
    // (the neck: up out of the trees behind, a curve of stepped segments, the animatronic's seams; the head looking left)
    const pts: [number, number][] = [];
    for (let t = 0; t <= 1; t += 0.05) pts.push([x + 70 - 60 * t + 20 * t * t, gy - 40 - 170 * t + 30 * t * t]);
    pts.forEach(([nx, ny], i) => { const r = 13 - i * 0.3; pixelBlob(g, nx + 1, ny + 1, r + 1, r + 1, ink); });
    pts.forEach(([nx, ny], i) => { const r = 13 - i * 0.3; pixelBlob(g, nx, ny, r, r, DINO[2]); pixelBlob(g, nx - r * 0.35, ny - r * 0.2, r * 0.45, r * 0.6, DINO[3]); if (i % 4 === 2) box(g, nx - r, ny, r * 2, 1, DINO[0]); });
    const [hx, hy] = pts[pts.length - 1];
    pixelBlob(g, hx - 10, hy - 2, 16, 9, ink); pixelBlob(g, hx - 10, hy - 3, 15, 8, DINO[2]); pixelBlob(g, hx - 14, hy - 6, 7, 3, DINO[3]);
    box(g, hx - 22, hy + 1, 14, 2, DINO[0]); box(g, hx - 6, hy - 6, 3, 3, ink); box(g, hx - 6, hy - 6, 1, 1, T('#FFFFFF'));
    // (the stockade: pointed logs)
    for (let k = x - 110; k < x + 110; k += 9) { const h = 70 + ((k * 13) % 9); box(g, k - 1, gy - h - 1, 10, h + 1, ink); box(g, k, gy - h, 8, h, BRK[k % 2 ? 2 : 3]); box(g, k + 6, gy - h, 2, h, BRK[1]); quad(g, [[k, gy - h], [k + 4, gy - h - 7], [k + 8, gy - h]], BRK[3]); }
    box(g, x - 110, gy - 50, 220, 3, BRK[0]);
    // (the gate arch: two big posts, a beam, the sign on it; torches)
    for (const px0 of [x - 40, x + 30]) { box(g, px0 - 1, gy - 120, 12, 120, ink); box(g, px0, gy - 120, 10, 120, BRK[2]); box(g, px0, gy - 120, 3, 120, BRK[3]); }
    box(g, x - 52, gy - 124, 106, 10, ink); box(g, x - 51, gy - 123, 104, 8, BRK[2]); box(g, x - 51, gy - 123, 104, 2, BRK[3]);
    box(g, x - 54, gy - 112, 110, 14, ink); box(g, x - 53, gy - 111, 108, 12, T('#E8C860'));
    signAt(g, 'PRE-HYSTERIC PARK', x + 1, gy - 102, 4, print(4, T('#5A2A10')));
    for (const tx of [x - 36, x + 34]) { box(g, tx - 2, gy - 134, 4, 10, T('#5A3A1E')); box(g, tx - 3, gy - 140, 6, 6, lit ? T('#FFB040') : T('#C8641A')); box(g, tx - 1, gy - 144, 2, 4, lit ? T('#FFE080') : T('#E89A3A')); }
  }
  // The Jungle Cruise's lookout on its stilts: the poles, the deck, the thatch cone, the striped pennant
  {
    const x = 940;
    for (const sx of [-18, -6, 6, 18]) { box(g, x + sx - 1, gy - 130, 4, 130, ink); box(g, x + sx, gy - 130, 2, 130, BRK[sx < 0 ? 3 : 2]); }
    for (let y = gy - 120; y < gy - 20; y += 26) { g.strokeStyle = BRK[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 18, y); g.lineTo(x + 18, y + 26); g.moveTo(x + 18, y); g.lineTo(x - 18, y + 26); g.stroke(); }
    box(g, x - 26, gy - 134, 52, 6, ink); box(g, x - 25, gy - 133, 50, 4, PLK[2]); box(g, x - 25, gy - 133, 50, 1, PLK[3]);
    for (let k = x - 24; k <= x + 22; k += 8) box(g, k, gy - 146, 2, 12, PLK[1]);
    thatchRoof(g, x - 32, x + 32, gy - 150, gy - 186, TH, ink);
    box(g, x, gy - 206, 2, 20, T('#3A2A1A'));
    for (let k = 0; k < 4; k++) quad(g, [[x + 2, gy - 206 + k * 2], [x + 24 - k * 3, gy - 202 + k], [x + 2, gy - 198]], k % 2 ? T('#F4F0E8') : T('#D8402A'));
    if (lit) box(g, x - 4, gy - 142, 8, 6, glow);
  }
  // The tiki totem: stacked faces, carved and painted, torches either side
  {
    const x = 1140, W = rampT(T, '#8A5A30');
    box(g, x - 15, gy - 150, 30, 150, ink); box(g, x - 14, gy - 150, 28, 150, W[2]); box(g, x - 14, gy - 150, 6, 150, W[3]); box(g, x + 8, gy - 150, 6, 150, W[1]);
    for (let k = 0; k < 4; k++) {
      const fy = gy - 146 + k * 34, col = [T('#D8402A'), T('#2E8A6A'), T('#E8B400'), T('#3A6AC8')][k];
      box(g, x - 14, fy, 28, 3, W[0]);
      box(g, x - 10, fy + 7, 7, 5, col); box(g, x + 3, fy + 7, 7, 5, col); box(g, x - 8, fy + 9, 3, 2, ink); box(g, x + 5, fy + 9, 3, 2, ink);
      box(g, x - 2, fy + 12, 4, 8, W[1]); box(g, x - 9, fy + 22, 18, 6, ink); for (let t = 0; t < 4; t++) box(g, x - 7 + t * 4, fy + 22, 2, 3, T('#F4F0E8'));
    }
    quad(g, [[x - 22, gy - 150], [x, gy - 168], [x + 22, gy - 150]], W[2]); quad(g, [[x - 22, gy - 150], [x, gy - 168], [x - 4, gy - 150]], W[3]);
    for (const tx of [x - 34, x + 34]) { box(g, tx - 2, gy - 100, 4, 100, T('#6A4A2A')); box(g, tx - 4, gy - 108, 8, 8, T('#4A3018')); box(g, tx - 3, gy - 114, 6, 6, lit ? T('#FFB040') : T('#C8641A')); box(g, tx - 1, gy - 118, 2, 4, lit ? T('#FFE080') : T('#E89A3A')); }
  }
};

/**
 * Jungle Land's nearer rides, up out of the near canopy: the mine train's wooden lift hill and its drop (the trestle's
 * bents and bracing, the chain, a train of ore carts on the lift), the safari balloon up on its tether (its gondola full
 * of guests), the Jungle Cruise's boathouse (a two-tier thatched pavilion, its sign on the ridge, a launch's striped
 * canopy at the dock), Trader Stan's (bamboo, a rusty tin roof, crates on the balcony, the fiberglass gorilla up top).
 */
const nearRides = (g: Ctx, T: (c: string) => string, lamps: number) => {
  const gy = 258, ink = T(INK), lit = lamps > 0.3, glow = T('#FFD27A');
  const WOOD = rampT(T, '#A07A4A'), TH = rampT(T, '#C0A060'), TIN = rampT(T, '#8A8A84');
  // The mine train: the lift hill up to its crest, the drop; the trestle under it; the carts on the lift
  {
    const tY = (x: number) => (x < 170 ? gy - 36 : x < 330 ? gy - 36 - ((x - 170) / 160) * 170 : x < 360 ? gy - 206 + ((x - 330) / 30) ** 2 * 10 : gy - 196 + ((x - 360) / 110) ** 1.4 * 180);
    // (the bents: a post down from the track every so often, X-braced between)
    for (let x = 160; x <= 470; x += 14) {
      const y = tY(x);
      box(g, x - 1, y, 4, gy - y, ink); box(g, x, y, 2, gy - y, WOOD[x % 28 ? 2 : 3]);
      const nx = x + 14, ny = tY(nx);
      if (nx <= 470) { g.strokeStyle = WOOD[1]; g.lineWidth = 1; g.beginPath(); for (let yy = Math.max(y, ny) + 4; yy < gy - 10; yy += 18) { g.moveTo(x + 1, yy); g.lineTo(nx + 1, yy + 18); g.moveTo(nx + 1, yy); g.lineTo(x + 1, yy + 18); } g.stroke(); }
    }
    for (let yy = gy - 20; yy > gy - 200; yy -= 30) for (let x = 160; x <= 470; x += 2) { if (tY(x) < yy) box(g, x, yy, 2, 2, WOOD[1]); }
    // (the track: ties, the rails, the chain up the lift)
    for (let x = 150; x < 480; x += 2) { const y = Math.round(tY(x)); box(g, x, y - 3, 2, 6, ink); box(g, x, y - 2, 2, 2, T('#B8BEC8')); if (x % 6 === 0) box(g, x, y, 2, 3, WOOD[0]); }
    for (let x = 172; x < 328; x += 4) box(g, x, Math.round(tY(x)) - 4, 2, 1, T('#5A5A60'));
    // (the train on the lift: three ore carts, riveted, tipped up the slope, guests' heads)
    const slope = Math.atan2(-170, 160);
    for (let k = 0; k < 3; k++) {
      const cx = 236 + k * 26, cy = tY(cx) - 4;
      g.save(); g.translate(cx, cy); g.rotate(slope);
      box(g, -12, -14, 24, 14, ink); box(g, -11, -13, 22, 12, T('#8A4A2A')); box(g, -11, -13, 22, 2, T('#B86A3A')); box(g, -11, -5, 22, 1, T('#5A2A10'));
      for (const hx of [-6, 3]) { box(g, hx, -20, 5, 6, ink); box(g, hx + 1, -19, 3, 4, T(['#F0C8A2', '#A86B43', '#D9A877'][(k + hx) & 1 ? 1 : (k % 3 === 2 ? 2 : 0)])); }
      g.restore();
    }
  }
  // The safari balloon, up on its tether: the envelope in its stripes, the burner, the gondola and its guests
  {
    const x = 640, y = gy - 196;
    g.strokeStyle = T('#5A5A60'); g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 66); g.lineTo(x + 8, gy); g.stroke();
    const S = [T('#E8B400'), T('#D8402A'), T('#2E8A4A'), T('#F4F0E8')];
    pixelBlob(g, x + 1, y + 1, 38, 44, ink);
    for (let k = 0; k < 8; k++) {
      g.save(); g.beginPath(); g.ellipse(x, y, 37, 43, 0, 0, Math.PI * 2); g.clip();
      box(g, x - 37 + k * 9.25, y - 44, 9.5, 88, S[k % 4]);
      g.restore();
    }
    // (round: shaded down its right in two steps (a row of dither between), lit up its left; the seams between gores)
    g.save(); g.beginPath(); g.ellipse(x, y, 37, 43, 0, 0, Math.PI * 2); g.clip();
    g.globalAlpha = 0.3; box(g, x + 14, y - 44, 24, 88, ink); box(g, x + 26, y - 44, 12, 88, ink); g.globalAlpha = 0.35; box(g, x - 37, y - 44, 9, 70, '#FFFFFF'); g.globalAlpha = 1;
    checker(g, x + 12, y - 44, 2, 88, mix(ink, S[0], 0.6));
    for (let k = 1; k < 8; k++) box(g, x - 37 + k * 9.25, y - 44, 1, 88, mix(ink, S[3], 0.4));
    g.restore();
    quad(g, [[x - 18, y + 38], [x + 18, y + 38], [x + 8, y + 52], [x - 8, y + 52]], S[1]);
    g.strokeStyle = ink; g.beginPath(); for (const sx of [-8, 8]) { g.moveTo(x + sx, y + 52); g.lineTo(x + sx * 1.4, y + 62); } g.stroke();
    box(g, x - 14, y + 62, 28, 12, ink); box(g, x - 13, y + 63, 26, 10, T('#A07A4A')); for (let k = x - 12; k < x + 12; k += 3) box(g, k, y + 63, 1, 10, T('#6A4A2A'));
    for (let k = 0; k < 4; k++) { box(g, x - 11 + k * 6, y + 56, 5, 6, ink); box(g, x - 10 + k * 6, y + 57, 3, 4, T(['#F0C8A2', '#6E4426', '#D9A877', '#F6DCC8'][k])); }
    if (lit) box(g, x - 2, y + 52, 4, 4, T('#FFB040'));
  }
  // The Jungle Cruise's boathouse: two tiers of thatch on bamboo posts, the sign on the ridge, a launch at the dock
  {
    const x = 940;
    for (let k = -3; k <= 3; k++) { const px0 = x + k * 34; box(g, px0 - 2, gy - 90, 6, 90, ink); box(g, px0 - 1, gy - 90, 4, 90, T('#C9A15A')); for (let y = gy - 80; y < gy; y += 14) box(g, px0 - 1, y, 4, 1, T('#7A5A2A')); }
    thatchRoof(g, x - 136, x + 136, gy - 88, gy - 130, TH, ink);
    thatchRoof(g, x - 80, x + 80, gy - 124, gy - 160, TH, ink);
    box(g, x - 56, gy - 182, 112, 20, ink); box(g, x - 55, gy - 181, 110, 18, T('#7A5230')); box(g, x - 55, gy - 181, 110, 2, T('#A07A4A'));
    for (const sx of [-44, 42]) box(g, x + sx, gy - 162, 3, 6, T('#5A3A1E'));
    signAt(g, 'JUNGLE CRUISE', x, gy - 167, 5, routed(5, T('#FDE68A'), T('#3A2410')));
    // (a launch at the dock under it: its striped canopy, fringed)
    for (let k = 0; k < 10; k++) box(g, x - 60 + k * 12, gy - 64, 12, 8, k % 2 ? T('#F4F0E8') : T('#2E7A8A'));
    for (let k = x - 60; k < x + 60; k += 3) box(g, k, gy - 56, 2, 3, T('#E8B400'));
    box(g, x - 62, gy - 66, 124, 2, ink);
    if (lit) for (const lx of [x - 120, x + 120]) { box(g, lx - 3, gy - 84, 6, 6, glow); box(g, lx - 1, gy - 78, 2, 6, T('#3A2A1A')); }
  }
  // Trader Stan's: two floors of bamboo, a rusty tin roof, the balcony's crates, the gorilla on the roof, its sign
  {
    const x = 1250;
    box(g, x - 60, gy - 120, 120, 120, ink); box(g, x - 59, gy - 119, 118, 119, T('#B8955A'));
    for (let k = x - 58; k < x + 58; k += 6) { box(g, k, gy - 119, 5, 119, T(k % 12 ? '#C9A86A' : '#A8854A')); box(g, k + 4, gy - 119, 1, 119, T('#7A5A2A')); }
    box(g, x - 64, gy - 66, 128, 5, ink); box(g, x - 63, gy - 65, 126, 3, T('#7A5A2A'));
    for (const wx of [x - 44, x - 12, x + 20]) { box(g, wx, gy - 108, 22, 20, ink); box(g, wx + 1, gy - 107, 20, 18, lit ? glow : T('#2A1E14')); box(g, wx + 10, gy - 107, 2, 18, T('#7A5A2A')); }
    // (the balcony's crates and a barrel)
    for (const [cx, cw, ch] of [[x - 54, 18, 14], [x - 36, 14, 10], [x + 34, 18, 16]] as const) { box(g, cx, gy - 66 - ch, cw, ch, ink); box(g, cx + 1, gy - 65 - ch, cw - 2, ch - 2, T('#A07A4A')); box(g, cx + 1, gy - 65 - ch, cw - 2, 1, T('#C8A070')); box(g, cx + 1, gy - 60 - ch + ch / 2, cw - 2, 1, T('#6A4A2A')); }
    // (the tin roof: corrugated, rust down it)
    quad(g, [[x - 72, gy - 118], [x - 50, gy - 146], [x + 50, gy - 146], [x + 72, gy - 118]], ink);
    quad(g, [[x - 70, gy - 119], [x - 49, gy - 144], [x + 49, gy - 144], [x + 70, gy - 119]], TIN[2]);
    for (let k = x - 66; k < x + 66; k += 4) box(g, k, gy - 140 + Math.abs(k - x) * 0.1, 1, 20, k % 8 ? TIN[3] : TIN[1]);
    for (const rx of [x - 30, x + 12, x + 40]) box(g, rx, gy - 136, 3, 18, T('#9A4A1E'));
    // (the gorilla up top, beating its chest: fiberglass, the paint chipped)
    const G = rampT(T, '#3A3A3E');
    pixelBlob(g, x + 1, gy - 164, 21, 19, ink); pixelBlob(g, x, gy - 165, 20, 18, G[2]); pixelBlob(g, x - 6, gy - 170, 8, 9, G[3]);
    pixelBlob(g, x + 1, gy - 186, 11, 10, ink); pixelBlob(g, x, gy - 187, 10, 9, G[2]); box(g, x - 4, gy - 186, 8, 5, T('#6A5A54')); box(g, x - 3, gy - 189, 2, 2, ink); box(g, x + 2, gy - 189, 2, 2, ink);
    for (const s of [-1, 1]) { pixelBlob(g, x + s * 22, gy - 160, 7, 14, ink); pixelBlob(g, x + s * 21, gy - 161, 6, 13, G[1]); pixelBlob(g, x + s * 8, gy - 168, 6, 5, G[3]); }
    box(g, x + 6, gy - 158, 4, 3, T('#C8B8A8'));
    // (its sign, hung off the balcony)
    box(g, x - 48, gy - 58, 96, 16, ink); box(g, x - 47, gy - 57, 94, 14, T('#2E5A2A'));
    signAt(g, "TRADER STAN'S", x, gy - 46, 5, print(5, T('#F2E6C4')));
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
  // (Jungle Land's rides up out of each: their feet in the canopy, painted behind it; the same tile and rate as it)
  const farRamp = ['#1F4A2E', '#2D6438', '#3E7A40', '#5A9446'].map(cl => mix(farTint(cl, 0.8, tod), sky(0.95), 0.3));
  const yF = hz - 6 + up * 0.08, yN = hz + 36 + up * 0.2;
  strip(c, `rfRideF:${tod.key}`, yF - 220, 1300, 262, cam.x * 0.2, g => farRides(g, cl => mix(farTint(cl, 0.8, tod), sky(0.95), 0.34), tod.lamps));
  strip(c, `rfCanF:${tod.key}`, yF, 1300, 400, cam.x * 0.2, g => canopyStrip(g, 1300, 400, 5, farRamp, 30, 5));
  const nearRamp = ['#123820', '#1C5028', '#2C6A30', '#4A8A3A'].map(cl => farTint(cl, 0.4, tod));
  strip(c, `rfRideN:${tod.key}`, yN - 210, 1500, 260, cam.x * 0.36, g => nearRides(g, cl => mix(farTint(cl, 0.45, tod), sky(0.95), 0.12), tod.lamps));
  strip(c, `rfCanN:${tod.key}`, yN, 1500, 400, cam.x * 0.36, g => canopyStrip(g, 1500, 400, 9, nearRamp, 44, 4));
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

// ---------------------------------------------------------------------------------------------------------------
// The show building: the big box the temple's only the front of. Its roof goes back from the top tier's tread (he's
// up on the facade's top lip; behind him it's a flat roof like any warehouse's): the white membrane in its seams, the
// walk pads, a puddle; the parapets round it; the rooftop units (louvered coils, fans going round on top), exhaust
// fans, a duct run, the roof hatch, the crew's corner (a lawn chair, a cooler, a coffee can of butts); and at the back
// edge the facade's other show piece, a giant jaguar head, seen from behind: raw fiberglass on a lumber frame, kicker
// braces down to the roof, THIS SIDE TOWARD GUESTS. From down by the line its top shows over the temple. All of it a
// step into the haze (nothing on it lit like a ledge: none of it's to stand on), drawn behind the temple.

/** How far back its roof goes (the tread's back edge is 1). */
const KB = 2.4;
const HZ = '#A9BCC8';
const hzd = (col: string, k = 0.2) => mix(col, HZ, k);
const DECK = ['#7E848A', '#A2A8AD', '#BEC3C7', '#D6DADC'].map(cl => hzd(cl));
const GALV = ['#4E565E', '#6E777F', '#929AA1', '#B4BBC1', '#D6DBDF'].map(cl => hzd(cl));
const STUC = ['#6E6250', '#8A7E6A', '#A49880', '#BEB298'].map(cl => hzd(cl));
const FIBER = ['#4E4A3C', '#6A6652', '#86826A', '#A29E84', '#BCB89E'].map(cl => hzd(cl));
const LUMBER = ['#6A4A26', '#8E6A3A', '#B08A52', '#CCA870'].map(cl => hzd(cl));

/** Runs `draw` in a frame where world coords land k back (a uniform scale about the eye). */
const atDepth = (c: Ctx, e: Eye, k: number, draw: () => void) => {
  const d = 1 - DK * k;
  c.save(); c.translate(e.x * (1 - d), e.y * (1 - d)); c.scale(d, d); draw(); c.restore();
};
/** A box stood on the roof (x..x+w across, h tall, k0..k1 back): its top if the eye's over it, the end turned to the
 *  eye, its front (painted once). */
const roofBox = (c: Ctx, e: Eye, x: number, w: number, h: number, k0: number, k1: number, top: string, key: string, front: (g: Ctx) => void) => {
  const y = RY - h;
  if (e.y < y) quad(c, [back(e, x, y, k0), back(e, x + w, y, k0), back(e, x + w, y, k1), back(e, x, y, k1)], top);
  if (e.x < x) quad(c, [back(e, x, y, k0), back(e, x, y, k1), back(e, x, RY, k1), back(e, x, RY, k0)], mix(top, '#FFFFFF', 0.08));
  if (e.x > x + w) quad(c, [back(e, x + w, y, k0), back(e, x + w, y, k1), back(e, x + w, RY, k1), back(e, x + w, RY, k0)], mix(top, INK, 0.28));
  atDepth(c, e, k0, () => stamp(c, key, x - 2, y - 2, w + 4, h + 4, front));
};
/** A line on the roof from one depth to another (a brace, a rod): inked, its color down the middle. */
const roofLine = (c: Ctx, a: [number, number], b: [number, number], w: number, col: string) => {
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
};

/** A rooftop unit's front: the louvered coil, the access panel (its screws, the plate, a sticker), the rails, rust. */
const hvacFront = (n: number) => (g: Ctx, x: number, y: number, w: number, h: number) => {
  box(g, x - 1, y - 1, w + 2, h + 2, INK);
  box(g, x, y, w, h, GALV[2]); box(g, x, y, w, 3, GALV[3]); box(g, x, y, 2, h, GALV[3]); box(g, x + w - 3, y, 3, h, GALV[1]);
  // (the coil: louvers across, dithered at its edges)
  const cw = Math.round(w * 0.55);
  box(g, x + 5, y + 7, cw, h - 18, GALV[0]);
  for (let ly = y + 8; ly < y + h - 12; ly += 3) { box(g, x + 6, ly, cw - 2, 1, GALV[3]); box(g, x + 6, ly + 1, cw - 2, 1, GALV[1]); }
  checker(g, x + 5, y + 7, cw, 2, GALV[2]);
  // (the access panel: its seam, screws, the unit's plate and a warning sticker; rust run down from a screw)
  const px0 = x + cw + 10;
  box(g, px0, y + 6, w - cw - 16, h - 16, GALV[2]); box(g, px0, y + 6, w - cw - 16, 1, GALV[0]); box(g, px0, y + 6, 1, h - 16, GALV[0]); box(g, px0 + 1, y + h - 11, w - cw - 17, 1, GALV[4]);
  for (const [sx, sy] of [[px0 + 3, y + 9], [px0 + w - cw - 21, y + 9], [px0 + 3, y + h - 14], [px0 + w - cw - 21, y + h - 14]]) box(g, sx, sy, 2, 2, GALV[0]);
  box(g, px0 + 2, y + 13, 38, 11, INK); box(g, px0 + 3, y + 14, 36, 9, '#E8E4D8'); signAt(g, `UNIT ${n}`, px0 + 21, y + 21, 4, stencil(4, '#2A3440'));
  box(g, px0 + 6, y + 27, 12, 8, '#E8C030'); box(g, px0 + 11, y + 28, 2, 4, INK); box(g, px0 + 11, y + 33, 2, 1, INK);
  box(g, px0 + w - cw - 20, y + 12, 2, 18, mix(GALV[2], '#A0522D', 0.5)); box(g, px0 + w - cw - 20, y + 30, 2, 6, mix(GALV[2], '#A0522D', 0.3));
  // (its rails, on the roof)
  box(g, x - 2, y + h - 6, w + 4, 6, GALV[0]); box(g, x - 2, y + h - 6, w + 4, 1, GALV[2]);
};
/** An exhaust fan: its curb, the hood (a dome in steps), the bird screen under it. */
const exhaustFront = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const cx = x + w / 2;
  box(g, x + 3, y + h - 9, w - 6, 9, INK); box(g, x + 4, y + h - 8, w - 8, 8, GALV[1]); box(g, x + 4, y + h - 8, w - 8, 1, GALV[3]);
  box(g, cx - w * 0.32, y + h - 15, w * 0.64, 6, GALV[0]);
  for (let k = cx - w * 0.3; k < cx + w * 0.3; k += 2) box(g, k, y + h - 15, 1, 6, GALV[2]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, y + h - 15, w / 2, h - 10, 0, Math.PI, 0); g.fill();
  const bands = [GALV[3], GALV[2], GALV[2], GALV[1], GALV[0]];
  bands.forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.ellipse(cx, y + h - 15, w / 2 - 1, h - 11, 0, Math.PI + (i / 5) * Math.PI, Math.PI + ((i + 1) / 5) * Math.PI); g.lineTo(cx, y + h - 15); g.fill(); });
  box(g, cx - w / 2 + 3, y + h - 17, w - 6, 2, GALV[4]);
};
/** The jaguar head from behind: raw fiberglass (chopped strand, resin runs), the lumber frame bolted across it, the
 *  steel base it's sat on; stencils for the crew, a bird's nest in the frame. */
const crestBack = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const cx = x + w / 2, by = y + h - 14;
  // (the shell: a head's back, its ears up)
  const shell = (col: string, inset: number) => {
    g.fillStyle = col; g.beginPath();
    g.moveTo(x + 18 + inset, by);
    g.quadraticCurveTo(x + 4 + inset, y + h * 0.45, x + 40 + inset, y + 40 + inset);
    g.lineTo(x + 46 + inset, y + 6 + inset); g.lineTo(x + 84, y + 30 + inset);
    g.quadraticCurveTo(cx, y + 14 + inset, x + w - 84, y + 30 + inset);
    g.lineTo(x + w - 46 - inset, y + 6 + inset); g.lineTo(x + w - 40 - inset, y + 40 + inset);
    g.quadraticCurveTo(x + w - 4 - inset, y + h * 0.45, x + w - 18 - inset, by);
    g.closePath(); g.fill();
  };
  shell(INK, -2); shell(FIBER[2], 0);
  // (lit up its left, shaded down its right, in steps with a row of dither between)
  g.save(); shell('rgba(0,0,0,0)', 0); g.clip();
  box(g, x, y, w * 0.24, h, FIBER[3]); checker(g, x + w * 0.24, y, 2, h, FIBER[3]);
  box(g, x, y, w * 0.08, h, FIBER[4]);
  box(g, x + w * 0.7, y, w * 0.3, h, FIBER[1]); checker(g, x + w * 0.7 - 2, y, 2, h, FIBER[1]);
  box(g, x + w * 0.88, y, w * 0.12, h, FIBER[0]);
  // (chopped strand: flecks; resin runs down from the seams)
  for (let i = 0; i < 160; i++) { const fx = x + r1(i, 3) * w, fy = y + r1(i, 5) * h; box(g, fx, fy, 2 + (i % 3), 1, i % 2 ? FIBER[1] : FIBER[3]); }
  for (const sx of [0.3, 0.52, 0.71]) { const lx = x + w * sx; box(g, lx, y + 20, 1, h - 34, FIBER[0]); for (let k = 0; k < 3; k++) box(g, lx + 1, y + 40 + k * 31 + r1(sx, k) * 10, 2, 6 + r1(k, sx) * 8, FIBER[3]); }
  g.restore();
  // (the lumber frame: two-by-fours across and up it, bolted on, the bolts' washers)
  const plank2 = (px: number, py: number, pw: number, ph: number) => { box(g, px - 1, py - 1, pw + 2, ph + 2, INK); box(g, px, py, pw, ph, LUMBER[2]); box(g, px, py, pw, 1, LUMBER[3]); box(g, px, py + ph - 1, pw, 1, LUMBER[0]); };
  for (const fy of [y + 58, y + 104]) plank2(x + 30, fy, w - 60, 6);
  for (const fx of [x + 62, cx - 3, x + w - 68]) plank2(fx, y + 34, 6, by - y - 34);
  for (const fx of [x + 62, cx - 3, x + w - 68]) for (const fy of [y + 58, y + 104]) { box(g, fx + 1, fy + 1, 4, 4, GALV[3]); box(g, fx + 2, fy + 2, 2, 2, GALV[0]); }
  // (the crew's stencils on it)
  signAt(g, 'THIS SIDE TOWARD GUESTS', cx, y + 90, 5, stencil(5, mix(FIBER[0], '#1A2430', 0.4)));
  signAt(g, 'JAG HEAD (REAR) 2 OF 2', cx, y + 128, 4, stencil(4, mix(FIBER[0], '#1A2430', 0.3)));
  signAt(g, 'NO STEP', x + 44, y + 150, 4, stencil(4, '#9A2A1E'));
  // (a bird's nest up in the frame, twigs and a bit of litter)
  const nx = x + w - 66, ny = y + 54;
  pixelBlob(g, nx, ny, 9, 4, LUMBER[0]); for (let k = 0; k < 7; k++) box(g, nx - 8 + k * 2.5, ny - 3 + (k % 3), 4, 1, k % 2 ? LUMBER[1] : '#5A4A2A');
  box(g, nx - 2, ny - 5, 4, 2, '#F2EEE4'); box(g, nx + 3, ny - 4, 3, 2, '#E8504A');
  // (the steel base it's sat on)
  box(g, x + 8, by - 1, w - 16, 15, INK); box(g, x + 9, by, w - 18, 13, GALV[1]); box(g, x + 9, by, w - 18, 2, GALV[3]);
  for (let k = x + 16; k < x + w - 20; k += 22) { box(g, k, by + 3, 2, 8, GALV[0]); box(g, k + 2, by + 3, 1, 8, GALV[2]); }
};
/** The crew's corner: a lawn chair (webbing gone at one end), a cooler, a coffee can of butts, a hard hat. */
const crewFront = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const gy = y + h;
  // (the chair: aluminum tubes, green and white webbing, sagging)
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 4, gy); g.lineTo(x + 14, gy - 16); g.lineTo(x + 30, gy - 16); g.lineTo(x + 36, gy); g.moveTo(x + 14, gy - 16); g.lineTo(x + 10, gy - 34); g.stroke();
  g.strokeStyle = GALV[3]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + 4, gy); g.lineTo(x + 14, gy - 16); g.lineTo(x + 30, gy - 16); g.lineTo(x + 36, gy); g.moveTo(x + 14, gy - 16); g.lineTo(x + 10, gy - 34); g.stroke();
  for (let k = 0; k < 5; k++) box(g, x + 11 + k * 0.4, gy - 32 + k * 3.4, 4, 2, k % 2 ? hzd('#F4F4F0') : hzd('#2E8A4A'));
  for (let k = 0; k < 4; k++) box(g, x + 15 + k * 4, gy - 16 + (k === 2 ? 3 : 0), 3, 2, k % 2 ? hzd('#F4F4F0') : hzd('#2E8A4A'));
  // (the cooler: red, a white lid, its handle)
  box(g, x + 40, gy - 14, 22, 14, INK); box(g, x + 41, gy - 13, 20, 12, hzd('#C8282A')); box(g, x + 41, gy - 13, 20, 4, hzd('#F4F4F0')); box(g, x + 41, gy - 13, 3, 12, hzd('#E85A4A'));
  box(g, x + 47, gy - 16, 8, 2, INK);
  // (the coffee can, butts in it; the hard hat on the roof)
  box(g, x + 66, gy - 9, 8, 9, INK); box(g, x + 67, gy - 8, 6, 8, hzd('#2A5AA8')); box(g, x + 67, gy - 8, 6, 2, hzd('#C8D0DA')); box(g, x + 68, gy - 10, 1, 2, '#F4F0E4'); box(g, x + 71, gy - 11, 1, 3, '#F4F0E4');
  g.fillStyle = INK; g.beginPath(); g.ellipse(x + 86, gy - 4, 10, 6, 0, Math.PI, 0); g.fill(); box(g, x + 74, gy - 4, 24, 3, INK);
  g.fillStyle = hzd('#F2C21E'); g.beginPath(); g.ellipse(x + 86, gy - 4, 9, 5, 0, Math.PI, 0); g.fill(); box(g, x + 75, gy - 4, 22, 2, hzd('#D8A818')); box(g, x + 80, gy - 8, 4, 2, hzd('#FFE680'));
  void w;
};

/** The show building's roof, its walls going down past the top tier, what's up on it. Drawn behind the temple. */
const showBuilding = (c: Ctx, e: Eye, f: number) => {
  const L = ROOF_L, R = ROOF_R, top = e.y < RY - 1;
  // (its side walls, going down past the top tier's ends: stucco, a control joint, a downspout)
  for (const [x, on] of [[L, e.x < L], [R, e.x > R]] as const) {
    if (!on) continue;
    quad(c, [back(e, x, RY, 1), back(e, x, RY, KB), back(e, x, GY, KB), back(e, x, GY, 1)], x === L ? STUC[2] : STUC[1]);
    const m = back(e, x, RY + 8, 1.7), m2 = back(e, x, GY, 1.7); c.strokeStyle = STUC[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(m[0], m[1]); c.lineTo(m2[0], m2[1]); c.stroke();
    roofLine(c, back(e, x, RY + 4, 2.1), back(e, x, GY, 2.1), 3, GALV[2]);
    quad(c, [back(e, x, RY - 12, 1), back(e, x, RY - 12, KB), back(e, x, RY, KB), back(e, x, RY, 1)], x === L ? STUC[3] : STUC[1]);
  }
  // The roof: the membrane (seams going back, the welds across), walk pads, a puddle with the sky in it
  if (top) {
    quad(c, [back(e, L, RY, 1), back(e, R, RY, 1), back(e, R, RY, KB), back(e, L, RY, KB)], DECK[2]);
    // (banded going back: the further, the hazier)
    quad(c, [back(e, L, RY, 1.9), back(e, R, RY, 1.9), back(e, R, RY, KB), back(e, L, RY, KB)], mix(DECK[2], HZ, 0.3));
    c.strokeStyle = DECK[1]; c.lineWidth = 1; c.beginPath();
    for (let x = L + 50; x < R; x += 70) { const a = back(e, x, RY, 1), b = back(e, x, RY, KB); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
    for (const k of [1.35, 1.7, 2.05]) { const a = back(e, L, RY, k), b = back(e, R, RY, k); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
    c.stroke();
    for (let i = 0; i < 9; i++) { const k = 1.12 + i * 0.12, x = L + 268 + Math.sin(i * 0.9) * 16; quad(c, [back(e, x, RY, k), back(e, x + 22, RY, k), back(e, x + 22, RY, k + 0.07), back(e, x, RY, k + 0.07)], DECK[0]); }
    const px0 = L + 470;
    quad(c, [back(e, px0, RY, 1.2), back(e, px0 + 90, RY, 1.25), back(e, px0 + 70, RY, 1.45), back(e, px0 - 10, RY, 1.4)], mix(skyAt(0.4), DECK[1], 0.45));
    quad(c, [back(e, px0 + 10, RY, 1.26), back(e, px0 + 40, RY, 1.27), back(e, px0 + 36, RY, 1.3), back(e, px0 + 8, RY, 1.29)], mix(skyAt(0.9), '#FFFFFF', 0.4));
  }
  // (the parapet along the back, its coping)
  if (top) quad(c, [back(e, L, RY - 14, KB), back(e, R, RY - 14, KB), back(e, R, RY - 14, KB + 0.06), back(e, L, RY - 14, KB + 0.06)], STUC[3]);
  atDepth(c, e, KB, () => stamp(c, 'rfParapet', L - 2, RY - 16, R - L + 4, 20, g => { box(g, L, RY - 14, R - L, 14, STUC[2]); box(g, L, RY - 14, R - L, 2, STUC[3]); box(g, L, RY - 3, R - L, 3, STUC[0]); for (let x = L + 40; x < R; x += 96) box(g, x, RY - 12, 1, 9, STUC[1]); }));
  // What's up there, back to front: the jaguar head's back (its braces), the units, the fans, the duct, the hatch
  const cx = L + 400, cw = 290, ch = 190, ck = 2.25;
  atDepth(c, e, ck, () => stamp(c, 'rfCrest', cx - cw / 2 - 2, RY - ch - 2, cw + 4, ch + 4, g => crestBack(g, cx - cw / 2, RY - ch, cw, ch)));
  // (a red light on its ear, for the planes, blinking)
  if (Math.floor(f / 40) % 2 === 0) atDepth(c, e, ck, () => { box(c, cx - cw / 2 + 44, RY - ch + 2, 4, 4, INK); box(c, cx - cw / 2 + 45, RY - ch + 3, 2, 2, '#FF4A3A'); });
  for (const bx of [cx - 100, cx, cx + 100]) roofLine(c, back(e, bx, RY - 120, ck), back(e, bx, RY, 1.85), 3, GALV[2]);
  for (const bx of [cx - 100, cx, cx + 100]) { const p = back(e, bx, RY, 1.85); box(c, p[0] - 6, p[1] - 4, 12, 5, INK); box(c, p[0] - 5, p[1] - 3, 10, 3, hzd('#C8B48A')); }
  // (the satellite dish on its ballast frame, by the left)
  roofBox(c, e, L + 24, 34, 8, 2.0, 2.15, GALV[1], 'rfDishBase', g => { box(g, L + 24, RY - 8, 34, 8, GALV[1]); box(g, L + 24, RY - 8, 34, 1, GALV[3]); for (let k = 0; k < 3; k++) box(g, L + 27 + k * 10, RY - 6, 8, 5, STUC[1]); });
  atDepth(c, e, 2.08, () => stamp(c, 'rfDish', L + 14, RY - 66, 60, 60, g => {
    g.fillStyle = INK; g.beginPath(); g.ellipse(L + 44, RY - 40, 21, 24, -0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = GALV[3]; g.beginPath(); g.ellipse(L + 44, RY - 40, 19, 22, -0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = GALV[2]; g.beginPath(); g.ellipse(L + 47, RY - 38, 13, 17, -0.4, 0, Math.PI * 2); g.fill();
    box(g, L + 40, RY - 18, 3, 12, GALV[0]); g.strokeStyle = GALV[0]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(L + 44, RY - 40); g.lineTo(L + 30, RY - 54); g.stroke(); box(g, L + 27, RY - 57, 5, 5, GALV[1]);
  }));
  const fan = (ex: number, ek: number) => roofBox(c, e, ex, 30, 26, ek, ek + 0.08, GALV[2], `rfFan:${ex}`, g => exhaustFront(g, ex, RY - 26, 30, 26));
  fan(L + 700, 2.0); fan(L + 360, 1.95);
  // (the duct off the big unit, along and down into its curb)
  roofBox(c, e, L + 230, 90, 22, 1.78, 1.9, GALV[3], 'rfDuct', g => { box(g, L + 229, RY - 23, 92, 24, INK); box(g, L + 230, RY - 22, 90, 22, GALV[2]); box(g, L + 230, RY - 22, 90, 3, GALV[4]); for (let k = L + 248; k < L + 320; k += 18) { box(g, k, RY - 22, 1, 22, GALV[0]); box(g, k + 1, RY - 22, 1, 22, GALV[4]); } box(g, L + 300, RY - 6, 20, 6, GALV[1]); });
  // (the units; their fans on top, going round: seen from above, flattened)
  for (const [n, ux, uw, uh, k0, k1] of [[3, L + 70, 160, 66, 1.62, 2.05], [4, L + 560, 130, 58, 1.42, 1.78]] as const) {
    roofBox(c, e, ux, uw, uh, k0, k1, GALV[2], `rfUnit${n}`, g => hvacFront(n)(g, ux, RY - uh, uw, uh));
    if (!top || e.y > RY - uh) continue;
    const m = back(e, ux + uw * 0.72, RY - uh, (k0 + k1) / 2), d = 1 - DK * (k0 + k1) / 2;
    const rx = 24 * d, ry = Math.max(2, (back(e, ux, RY - uh, k0)[1] - back(e, ux, RY - uh, k1)[1]) * 0.36);
    c.fillStyle = INK; c.beginPath(); c.ellipse(m[0], m[1], rx + 1, ry + 1, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = GALV[0]; c.beginPath(); c.ellipse(m[0], m[1], rx, ry, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = GALV[3]; c.lineWidth = 2; c.beginPath();
    for (let k = 0; k < 4; k++) { const a = f * 0.35 + (k * Math.PI) / 2; c.moveTo(m[0], m[1]); c.lineTo(m[0] + Math.cos(a) * rx * 0.85, m[1] + Math.sin(a) * ry * 0.85); }
    c.stroke();
    c.strokeStyle = GALV[2]; c.lineWidth = 1; c.beginPath(); c.ellipse(m[0], m[1], rx, ry, 0, 0, Math.PI * 2); c.stroke();
  }
  fan(L + 300, 1.42);
  // (the hatch: its curb, the lid, the safety post up out of it)
  roofBox(c, e, L + 250, 52, 12, 1.12, 1.32, GALV[2], 'rfHatch', g => { box(g, L + 249, RY - 13, 54, 14, INK); box(g, L + 250, RY - 12, 52, 12, GALV[2]); box(g, L + 250, RY - 12, 52, 2, GALV[4]); signAt(g, 'HATCH', L + 276, RY - 3, 4, stencil(4, '#9A2A1E')); });
  roofLine(c, back(e, L + 256, RY - 12, 1.2), back(e, L + 256, RY - 44, 1.2), 2, '#E8C030');
  roofLine(c, back(e, L + 296, RY - 12, 1.2), back(e, L + 296, RY - 44, 1.2), 2, '#E8C030');
  roofLine(c, back(e, L + 256, RY - 44, 1.2), back(e, L + 296, RY - 44, 1.2), 2, '#E8C030');
  // (the crew's corner)
  atDepth(c, e, 1.16, () => stamp(c, 'rfCrew', L + 610, RY - 40, 104, 42, g => crewFront(g, L + 612, RY - 38, 100, 38)));
  // (lightning rods along the side parapets)
  for (const x of [L + 4, R - 4]) for (const k of [1.3, 1.85, 2.3]) roofLine(c, back(e, x, RY, k), back(e, x, RY - 26, k), 1, GALV[3]);
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
  showBuilding(c, e, f);
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
  // (the park's guests, SNES'd (frontier/town/people.ts): horrified, some with their hands up at their faces; the one
  // talking working her mouth (shocked, then at him); the rows back there each painted once, as they are)
  const mood = talking ? (Math.floor(f / 7) % 2 ? 'shocked' : 'angry') : horror ? (seed % 3 ? 'shocked' : 'scared') : 'bored';
  const pose = horror && seed % 2 && !talking ? 'cower' : 'stand';
  drawParkGuest(c, x + shake, y, { seed, woman, f: still ? 40 : f + seed * 7, pose, mood, facing: dir, scale: s });
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
  // what's printed on it, once it's open: I (heart) JUNGLE LAND, and the price tag still on it
  if (open >= 1) {
    signAt(c, 'I', -6, RIM - 21, 7, print(7, '#1E1B4B'));
    c.fillStyle = '#DC2626'; c.beginPath(); c.arc(3.5, RIM - 27, 2.6, Math.PI, 0); c.arc(8.7, RIM - 27, 2.6, Math.PI, 0); c.lineTo(6.1, RIM - 21); c.closePath(); c.fill();
    signAt(c, 'JUNGLE LAND', 0, RIM - 10, 6, print(6, '#1E1B4B'));
    const ty = RIM + 10 + Math.sin(f * 0.2) * 1.5;
    c.strokeStyle = '#E7E5E4'; c.beginPath(); c.moveTo(Wd * 0.8, RIM + 1); c.lineTo(Wd * 0.8 + 3, ty); c.stroke();
    box(c, Wd * 0.8 - 3, ty - 1, 22, 11, INK); box(c, Wd * 0.8 - 2, ty, 20, 9, '#FAFAF9');
    text(c, '$9.99', Wd * 0.8 + 8, ty + 7, '#DC2626', 4, 'center', null);
  }
  c.restore();
};

/** The roof's falling bits (for the particles): stone in its ramp, the shell, the pink insulation. */
export const CHUNK_COLORS = [STONE[2], STONE[3], STONE[4], STONE[5], SHELL, FOAM, MOSS[2]];
