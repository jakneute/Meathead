// Truelling Tragons, drawn. The far off (far.ts: screen space, cached per hour, its horizon at the scene's eye); the park
// round the ride (scenery.ts: the ground going back, the lagoon, the props at three depths, the fake mountain); the
// load station and the unload (station.ts); the three tracks (steel.ts: real rails a gauge apart in depth, ties, the
// lane's box spine, lattice supports) through the loops, corkscrews and the helix; the holes (torn, sparking ends); the
// dragons (dragon.ts: three cars each along their track, the head up off the front car, the tail curled off the back,
// wings folded, the handlebar), going over a broken end, or coming down onto the track on bat wings (a spare); each
// lane's obstacles; the breath at the near misses; the suitors glimpsed off the train ahead at the unload.
//
// THE DEPTH (layout.ts, track.ts): everything on a track is put at that track's depth there about the scene's one eye
// (cars.ts / track.ts proj: what the ride's physics stands him on too), scaled with it, and drawn far to near with the
// park's props sorted in among it: what's nearer than his dragon goes over him (drawTragonsFront), the rest under
// (drawTragonsBack). Culled by where it lands on the screen, never by where it'd be flat (no pop-in). The sorted list's
// worked out once a frame (the back and the front share it).
//
// Over it all in screen space (the mountain's dark is the lighting's: cave.ts): the warnings (an
// enamel plaque at every hole and loop coming, in its lane's color, an arrow at the edge while it's off the screen, a
// countdown over the dragon that's going into it, SAFE over the one that won't), the PA's words in the top band.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, topBand } from '../../../m1/constants';
import { drawFireball } from '../../../m1/game/render/fx/fireball';
import { saidOver } from '../section';
import { mix, box, INK, IRON, SNOW, STONE, GOLD, ramp6, rampH, dimmed, polyF, postR, checker, type Ctx } from '../kit';
import { RIVALS } from '../glen/rivals';
import { drawUnloadRivals } from './rivals';
import { GY, TL, CAR, LANES, LANE_COL, LANE_NAME, rearX, type Lane } from './layout';
import { trackPt, proj, type Eye, type Pt } from './track';
import { roofSpan } from './cars';
import { tragonsOf, type Tragons, type Obst, type Train, type Car } from './state';
import { toScreen, hisTrainD, UNLOAD_SPOTS, FRAME_TOP, FRAME_BOT } from './ride';
import { viewBox, boxIn, sceneEye, fog } from './scene';
import { paintCar } from './dragon';
import { drawSteel, RAIL } from './steel';
import { drawFloor, drawMountain, sceneryItems } from './scenery';
import { drawCaveInside } from './cave';
import { drawStation, drawUnload, drawStationNear, drawUnloadNear } from './station';
import { drawTragonsFar } from './far';

export { paintCar };
const FONT = '"Press Start 2P"';

// ---------------------------------------------------------------------------------------------------------------
// Screen space: the far off

export const drawTragonsBackdrop = (c: Ctx, state: GameState) => drawTragonsFar(c, state);

// ---------------------------------------------------------------------------------------------------------------
// The dragons

/** A car put where it is: turned along the track, scaled with its depth, squashed through its roll (upside down past
 *  a quarter turn). */
const putCar = (c: Ctx, k: Car, lane: Lane, i: number, f: number, opts: Parameters<typeof paintCar>[4] = {}) => {
  const r = Math.cos(k.roll), sy = Math.abs(r) < 0.15 ? Math.sign(r || 1) * 0.15 : r;
  c.save(); c.translate(k.x, k.y); c.rotate(k.a); c.scale(k.d, k.d * sy);
  paintCar(c, lane, i, f, opts);
  c.restore();
};

/** Is a hole coming on this dragon's track (in its warning)? */
const endangered = (t: Tragons, lane: Lane) => t.gaps.some(g => g.lane === lane && g.a > t.dist + TL);
const trainD = (tr: Train) => (tr.phase === 'fall' ? tr.fd : tr.cars[1]?.d ?? 1);

const drawTrain = (c: Ctx, state: GameState, t: Tragons, tr: Train) => {
  const f = state.frame;
  if (tr.phase === 'gone' || !tr.cars.length) return;
  if (tr.phase === 'fall') {
    // (over the end: the three cars as one, tipping nose down and dropping)
    c.save(); c.translate(tr.fx, tr.fy); c.rotate(tr.rot); c.scale(tr.fd, tr.fd);
    for (let i = 0; i < 3; i++) { c.save(); c.translate((i - 1) * CAR, 0); paintCar(c, tr.lane, i, f, { danger: true }); c.restore(); }
    c.restore();
    return;
  }
  if (tr.phase === 'arrive') {
    const u = tr.t / 80, e = 1 - (1 - u) * (1 - u);
    c.save(); c.translate(0, -(1 - e) * 560);
    tr.cars.forEach((k, i) => putCar(c, k, tr.lane, i, f, { wings: true }));
    c.restore();
    return;
  }
  const danger = t.phase === 'ride' && endangered(t, tr.lane);
  tr.cars.forEach((k, i) => putCar(c, k, tr.lane, i, f, { danger }));
};

// ---------------------------------------------------------------------------------------------------------------
// Each lane's obstacles

/** Stepped flames up from (x, y): `h` tall, `w` wide, licking. */
const flames = (c: Ctx, x: number, y: number, w: number, h: number, f: number, seed = 0) => {
  const F = ['#7A1A1A', '#DC2626', '#F97316', '#FDE047', '#FFF6B0'];
  const n = Math.max(3, Math.round(w / 4));
  for (let L = 0; L < 4; L++) {
    const k = 1 - L * 0.22;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, lick = Math.sin(f * 0.4 + i * 1.7 + seed) * 0.25 + 0.75, hh = h * k * lick * Math.sin(u * Math.PI) ** 0.6;
      box(c, x - w / 2 + (u - 0.5) * w * (k - 1) + i * (w / n) * k + (w * (1 - k)) / 2, y - hh, Math.max(1, (w / n) * k), hh, F[L + 1]);
    }
  }
  box(c, x - w / 2, y - 2, w, 2, F[0]);
};

/** An obstacle on the track, its back (what's behind the dragon: posts, the far half of a hoop, towers, clouds) or its
 *  front (what hurts: the near half, the icicles, the arcs, the jet, the bar), at the origin (its foot on the track's
 *  top), drawn at its depth; `gl` the park's level there (local). Where it hurts is unchanged (ride.ts BOXES). */
const drawObst = (c: Ctx, state: GameState, t: Tragons, e: Eye, o: Obst, front: boolean) => {
  const f = state.frame;
  const a = trackPt(t.spins, t.dist, o.lane, o.s, { x: 0, y: 0, d: 1, roll: 0 }), pp = proj(t.eye, a.x, a.y, a.d), d = a.d;
  const gl = (e.y + (GY - e.y) * d - pp.y) / d;
  const [main, light] = LANE_COL[o.lane];
  const I = IRON.map(col => fog(dimmed(col), d));
  const post = (x: number, top: number) => { if (gl > top) postR(c, x, top, gl, 6, I); };
  if (o.kind === 'live') {
    if (front) return;
    // (the rail live along its length, unmistakable from well off (the user's): a hazard bollard in yellow and black at
    // each end with a bolt plaque; the rail between glowing electric blue-white in a halo, a chase of white and yellow
    // along it, arcs jumping up off it (more and taller as it comes), sparks)
    const ahead = o.s - (t.dist + TL), warm = Math.max(0.35, Math.min(1, 1 - ahead / 1600));
    const Q: Pt = { x: 0, y: 0, d: 1, roll: 0 };
    for (let s = o.s; s < o.s + o.len; s += 20) {
      const q = trackPt(t.spins, t.dist, o.lane, s, Q), p = proj(t.eye, q.x, q.y, q.d), on = (Math.floor(s / 20) + (f >> 1)) % 4, ry = p.y + (RAIL - 4) * q.d;
      c.globalAlpha = (0.18 + 0.22 * ((f + s) % 5 < 2 ? 1 : 0.5)) * warm; box(c, p.x - 2, ry - 14 * q.d, 24 * q.d, 30 * q.d, '#7DD3FC'); c.globalAlpha = 1;
      box(c, p.x, ry, 20 * q.d, 8 * q.d, on === 0 ? '#FFFFFF' : on === 1 ? '#FEF08A' : on === 2 ? '#BAE6FD' : main);
      box(c, p.x, p.y + (RAIL - 1) * q.d, 20 * q.d, 2 * q.d, '#6D28D9');
      if ((s / 20 + f) % Math.max(3, Math.round(9 - warm * 5)) === 0) {
        const hgt = (18 + ((s * 7 + f * 3) % 26) * warm) * q.d;
        c.strokeStyle = '#6D28D9'; c.lineWidth = 4; c.beginPath(); c.moveTo(p.x, ry); c.lineTo(p.x + 5, ry - hgt * 0.4); c.lineTo(p.x - 2, ry - hgt * 0.65); c.lineTo(p.x + 4, ry - hgt); c.stroke();
        c.strokeStyle = '#FFFFFF'; c.lineWidth = 2; c.stroke();
        box(c, p.x + 3, ry - hgt - 2, 3, 3, '#FEF08A');
      }
    }
    for (const s of [o.s - 10, o.s + o.len + 10]) {
      const q = trackPt(t.spins, t.dist, o.lane, s, Q), p = proj(t.eye, q.x, q.y, q.d), d0 = q.d, by = p.y + RAIL * d0;
      box(c, p.x - 5 * d0, by - 46 * d0, 10 * d0, 46 * d0, INK);
      for (let k = 0; k < 5; k++) box(c, p.x - 4 * d0, by - (45 - k * 9) * d0, 8 * d0, 9 * d0, k % 2 ? '#1A1028' : '#FACC15');
      polyF(c, [[p.x, by - 66 * d0], [p.x + 13 * d0, by - 50 * d0], [p.x, by - 34 * d0], [p.x - 13 * d0, by - 50 * d0]], INK);
      polyF(c, [[p.x, by - 63 * d0], [p.x + 10 * d0, by - 50 * d0], [p.x, by - 37 * d0], [p.x - 10 * d0, by - 50 * d0]], f % 12 < 6 ? '#FACC15' : '#FEF08A');
      polyF(c, [[p.x + 2 * d0, by - 60 * d0], [p.x - 4 * d0, by - 49 * d0], [p.x, by - 49 * d0], [p.x - 2 * d0, by - 40 * d0], [p.x + 4 * d0, by - 52 * d0], [p.x, by - 52 * d0]], INK);
    }
    return;
  }
  c.save(); c.translate(pp.x, pp.y); c.scale(d, d);
  switch (o.kind) {
    case 'ring': {
      // (a burning hoop round the track on a gantry post: the far half behind the dragon, the near half over him)
      const ring = (a0: number, a1: number) => {
        c.lineCap = 'round';
        c.strokeStyle = INK; c.lineWidth = 10; c.beginPath(); c.ellipse(0, 2, 14, 56, 0, a0, a1); c.stroke();
        c.strokeStyle = I[2]; c.lineWidth = 7; c.stroke(); c.strokeStyle = '#F97316'; c.lineWidth = 3; c.stroke(); c.strokeStyle = '#FDE047'; c.lineWidth = 1; c.stroke();
        c.lineCap = 'butt';
        for (let k = 0; k < 10; k++) { const an = a0 + ((k + 0.5) / 10) * (a1 - a0) + Math.sin(f * 0.05) * 0.05, fx = Math.cos(an) * 14, fy = 2 + Math.sin(an) * 56; flames(c, fx, fy, 8, 10 + ((f + k * 5) % 8), f, k); }
      };
      if (!front) { post(0, 58); box(c, -10, 54, 20, 6, INK); box(c, -9, 55, 18, 4, I[3]); ring(Math.PI / 2, Math.PI * 1.5); break; }
      ring(-Math.PI / 2, Math.PI / 2);
      break;
    }
    case 'icicles': {
      if (!front) { post(-46, -124); post(46, -124); break; }
      // (an icicle curtain off a frosted gantry beam: snow along its top, the icicles in steps, dripping)
      const Ic = ['#3A7AC0', '#7DD3FC', '#BAE6FD', '#E0F2FE', '#FFFFFF'];
      box(c, -50, -130, 100, 14, INK); box(c, -49, -129, 98, 12, I[3]); box(c, -49, -129, 98, 2, I[5]);
      for (let x = -46; x < 46; x += 12) box(c, x, -125, 2, 2, I[1]);
      const Sn = SNOW;
      box(c, -51, -136, 102, 7, INK); box(c, -50, -135, 100, 6, Sn[4]); box(c, -50, -135, 100, 1, Sn[5]); for (let x = -48; x < 48; x += 7) box(c, x, -137 + ((x * 3) & 1), 5, 2, Sn[5]);
      for (let k = 0; k < 9; k++) {
        const x = -40 + k * 10, len = 56 + ((k * 7) % 4) * 6;
        polyF(c, [[x - 5, -117], [x + 5, -117], [x, -117 + len + 2]], INK);
        polyF(c, [[x - 4, -117], [x + 4, -117], [x, -117 + len]], Ic[1 + (k % 2)]);
        polyF(c, [[x - 4, -117], [x, -117], [x, -117 + len]], Ic[3]);
        box(c, x - 2, -116, 1, len * 0.5, Ic[4]);
        const dr = (f * 0.7 + k * 13) % 40;
        if (dr < 20) box(c, x, -117 + len + dr * 0.8, 1, 2, Ic[2]);
      }
      break;
    }
    case 'arc': {
      if (!front) { post(-28, -112); post(28, -112); break; }
      // (two tesla coils on the gantry: copper windings, toroids, the arcs crackling down between them to his head)
      const Cu = rampH(ramp6('#B8682A'), true);
      box(c, -36, -118, 72, 8, INK); box(c, -35, -117, 70, 6, I[3]); box(c, -35, -117, 70, 1, I[5]);
      for (const cx of [-28, 28]) {
        box(c, cx - 6, -150, 12, 34, INK); box(c, cx - 5, -149, 10, 32, Cu[3]); for (let y = -148; y < -118; y += 3) box(c, cx - 5, y, 10, 1, Cu[1]); box(c, cx - 5, -149, 3, 32, Cu[4]);
        c.fillStyle = INK; c.beginPath(); c.ellipse(cx, -154, 12, 6, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = I[4]; c.beginPath(); c.ellipse(cx, -154, 11, 5, 0, 0, Math.PI * 2); c.fill(); box(c, cx - 7, -157, 6, 2, I[5]);
        if (f % 6 < 3) box(c, cx - 2, -164, 4, 4, '#FFFFFF');
      }
      for (let k = 0; k < 3; k++) {
        c.strokeStyle = k === 1 ? '#FFFFFF' : f % 4 < 2 ? main : '#C4B5FD'; c.lineWidth = k === 1 ? 2 : 3;
        c.beginPath(); let y = -118; c.moveTo(-6 + k * 6, y);
        while (y < -46) { y += 10; c.lineTo(-6 + k * 6 + ((((f + y + k * 7) >> 2) % 3) - 1) * 7, Math.min(y, -46)); }
        c.stroke();
      }
      c.globalAlpha = 0.2; box(c, -18, -118, 36, 72, '#C4B5FD'); c.globalAlpha = 1;
      break;
    }
    case 'jet': {
      if (!front) {
        // (the burner housing on the track's side: riveted steel, its nozzle glowing)
        box(c, -11, 2, 22, RAIL - 2, INK); box(c, -10, 3, 20, RAIL - 4, I[2]); box(c, -10, 3, 20, 2, I[4]); for (let y = 8; y < RAIL; y += 8) { box(c, -8, y, 2, 2, I[5]); box(c, 6, y, 2, 2, I[5]); }
        box(c, -7, -2, 14, 5, INK); box(c, -6, -1, 12, 3, '#F97316');
        break;
      }
      flames(c, 0, 0, 22, 26 + ((f * 3) % 8), f, 3);
      break;
    }
    case 'bar': {
      if (!front) { post(-12, -30); post(12, -30); break; }
      // (a bar of ice across the back on its posts: stepped, frosted, its edges catching the light)
      const Ic = ['#2A5A9A', '#5AA8E8', '#9ADCFC', '#D8F2FF', '#FFFFFF'];
      box(c, -16, -30, 32, 26, INK); box(c, -15, -29, 30, 24, Ic[2]); box(c, -15, -29, 30, 5, Ic[3]); box(c, -15, -29, 30, 1, Ic[4]); box(c, -15, -9, 30, 4, Ic[1]); box(c, 9, -29, 6, 24, Ic[1]);
      checker(c, -15, -12, 30, 2, Ic[1], 0, 1);
      box(c, -10, -24, 3, 10, Ic[4]); box(c, -4, -20, 2, 6, Ic[4]);
      break;
    }
    case 'tower': {
      if (front) break;
      // (a dragon tower down on the park: stone in courses, a crenellated top, a dragon's head out of it spitting)
      const top = -150, St = STONE.map(col => fog(dimmed(col), d)), B = rampH(ramp6('#C42828'), true);
      box(c, -24, top, 48, gl - top, INK); box(c, -23, top, 46, gl - top, St[3]); box(c, -23, top, 10, gl - top, St[4]); box(c, 13, top, 10, gl - top, St[1]);
      for (let y = top + 14; y < gl; y += 14) box(c, -23, y, 46, 1, St[1]);
      for (let x = -24; x < 24; x += 12) { box(c, x, top - 12, 8, 12, INK); box(c, x + 1, top - 11, 6, 11, St[3]); }
      const glow = t.trains[o.lane].phase === 'ok' && o.shots < 2 && (f - o.lastShot) % 52 > 30;
      polyF(c, [[14, top - 4], [-40, top - 22], [-46, top - 8], [14, top + 4]], INK);
      polyF(c, [[12, top - 4], [-38, top - 20], [-43, top - 9], [12, top + 2]], B[3]); polyF(c, [[12, top - 4], [-38, top - 20], [-30, top - 14], [12, top - 2]], B[4]);
      polyF(c, [[0, top - 10], [10, top - 26], [8, top - 8]], rampH(ramp6('#F2E6C8'), true)[3]);
      box(c, -18, top - 18, 4, 4, '#FEF08A');
      if (glow) { c.globalAlpha = 0.35; c.fillStyle = '#F97316'; c.beginPath(); c.arc(-42, top - 14, 12, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; flames(c, -44, top - 8, 10, 12, f, 7); }
      box(c, -10, top + 30, 8, 14, INK); box(c, -9, top + 31, 6, 12, '#FFB060');
      break;
    }
    case 'cannon': {
      if (front) break;
      // (a snow cannon up on its post: the hopper heaped with snow, the barrel, a puff when it fires)
      const y = -54, Wh = rampH(ramp6('#E0F2FE'), true);
      postR(c, 0, y + 8, gl, 10, I);
      box(c, -32, y - 10, 46, 20, INK); box(c, -31, y - 9, 44, 18, Wh[3]); box(c, -31, y - 9, 44, 4, Wh[4]); box(c, -31, y + 5, 44, 4, Wh[1]);
      for (const bx of [-24, -8, 6]) box(c, bx, y - 9, 2, 18, Wh[2]);
      box(c, -36, y - 7, 6, 14, INK); box(c, -35, y - 6, 4, 12, rampH(ramp6('#1E3A8A'), true)[3]);
      box(c, 6, y - 22, 16, 13, INK); box(c, 7, y - 21, 14, 12, I[3]); box(c, 5, y - 26, 18, 6, SNOW[4]);
      if (f - o.lastShot < 12) for (let k = 0; k < 5; k++) box(c, -42 - k * 7, y - 7 + k * 3 - ((f - o.lastShot) % 4), 7, 7, k % 2 ? '#FFFFFF' : '#E0F2FE');
      break;
    }
    case 'cloud': {
      if (front) break;
      // (a storm cloud: stepped dark billows, lit inside when it's about to strike)
      const y = -250, flash = f % 40 < 3;
      const C = ['#1E1636', '#2E2250', '#3E3068', '#5A4A8A', '#8A78C0'];
      for (const [dx, dy, r] of [[-44, 6, 26], [-14, -6, 34], [22, -2, 30], [50, 6, 20], [6, 10, 26]] as const) { c.fillStyle = INK; c.beginPath(); c.arc(dx, y + dy, r + 1, 0, Math.PI * 2); c.fill(); }
      for (const [dx, dy, r] of [[-44, 6, 26], [-14, -6, 34], [22, -2, 30], [50, 6, 20], [6, 10, 26]] as const) { c.fillStyle = C[1]; c.beginPath(); c.arc(dx, y + dy, r, 0, Math.PI * 2); c.fill(); }
      for (const [dx, dy, r] of [[-34, -2, 18], [-8, -14, 22], [26, -10, 18]] as const) { c.fillStyle = flash ? '#C4B5FD' : C[3]; c.beginPath(); c.arc(dx, y + dy, r, 0, Math.PI * 2); c.fill(); c.fillStyle = flash ? '#FFFFFF' : C[4]; c.beginPath(); c.arc(dx - r * 0.3, y + dy - r * 0.3, r * 0.4, 0, Math.PI * 2); c.fill(); }
      checker(c, -60, y + 22, 120, 2, C[0], 0, 2);
      box(c, -50, y + 26, 100, 4, C[0]);
      if (f % 9 < 2) { c.strokeStyle = light; c.lineWidth = 1; c.beginPath(); c.moveTo(-20, y + 20); c.lineTo(-14, y + 30); c.lineTo(-18, y + 34); c.stroke(); }
      break;
    }
  }
  c.restore();
};
/** The LIGHTNING dragon's back while it's on a live rail (where it shocks him: ride.ts, unchanged): the whole roof
 *  crackling (a flickering electric blue-white glow along its full length, bright arcs up off it, sparks jumping off,
 *  its lamps strobing); just before (the front car onto it), sparks spitting off the front: the tell. Off it, none:
 *  safe reads safe. */
const drawLiveRoof = (c: Ctx, state: GameState, t: Tragons, o: Obst) => {
  const tr = t.trains[o.lane], f = state.frame;
  if (tr.phase !== 'ok' || !tr.cars.length) return;
  const live = t.dist + TL > o.s && t.dist < o.s + o.len, soon = !live && o.s - (t.dist + TL) < 260 && o.s > t.dist;
  if (!live && !soon) return;
  for (let i = 0; i < tr.cars.length; i++) {
    const k = tr.cars[i];
    if (soon && i < 2) continue;
    const ca = Math.cos(k.a), sa = Math.sin(k.a), half = (CAR / 2) * k.d;
    const pt = (u: number, up: number): [number, number] => [k.x + ca * u * half + sa * up * k.d, k.y + sa * u * half - ca * up * k.d];
    if (live) {
      // (the glow along the roof: two bands, flickering)
      const fl = f % 6 < 2 ? 0.62 : f % 6 < 4 ? 0.42 : 0.52;
      c.globalAlpha = fl * 0.5; polyF(c, [pt(-1.05, 14), pt(1.05, 14), pt(1.05, -5), pt(-1.05, -5)], '#7DD3FC');
      c.globalAlpha = fl; polyF(c, [pt(-1, 4), pt(1, 4), pt(1, -2), pt(-1, -2)], f % 4 < 2 ? '#FFFFFF' : '#E0F2FE');
      c.globalAlpha = 1;
      // (the lamps along its side strobing)
      for (let n = 0; n < 4; n++) { const [x, y] = pt(-0.75 + n * 0.5, -14); box(c, x - 2 * k.d, y - 2 * k.d, 4 * k.d, 4 * k.d, (f + n) % 4 < 2 ? '#FFFFFF' : '#38BDF8'); }
    }
    // (the arcs up off it and the sparks jumping off)
    const arcs = live ? 3 : 1;
    for (let n = 0; n < arcs; n++) {
      if (!live && (f + i * 5) % 5 > 1) continue;
      const u = ((((f * 13 + n * 37 + i * 19) % 100) / 100) * 2 - 1) * 0.95, hgt = 16 + ((f * 7 + n * 11) % 18);
      const [x0, y0] = pt(u, 0), [x1, y1] = pt(u + 0.06, hgt * 0.4), [x2, y2] = pt(u - 0.04, hgt * 0.7), [x3, y3] = pt(u + 0.05, hgt);
      c.strokeStyle = '#6D28D9'; c.lineWidth = 4; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.stroke();
      c.strokeStyle = n === 1 ? '#FEF08A' : '#FFFFFF'; c.lineWidth = 2; c.stroke();
    }
    for (let n = 0; n < (live ? 5 : 3); n++) {
      const life = (f * 2 + n * 9 + i * 7) % 18, u = ((n * 41 + i * 23 + Math.floor((f + n * 9) / 18) * 17) % 100) / 50 - 1;
      const [sx, sy] = pt(u, 2), dir = n % 2 ? 1 : -1;
      box(c, sx + dir * life * 1.6 * k.d, sy - (life * 2.2 - life * life * 0.09) * k.d, 2, 2, life % 3 ? '#FEF08A' : '#FFFFFF');
    }
  }
};
const obstD = (t: Tragons, o: Obst) => trackPt(t.spins, t.dist, o.lane, o.s, { x: 0, y: 0, d: 1, roll: 0 }).d;

/** What's flying: fireballs (their target ring on the roof), strikes (the glow, the bolt), snowballs. */
const drawShot = (c: Ctx, state: GameState, t: Tragons, q: Tragons['shots'][number]) => {
  const f = state.frame, tr = t.trains[q.lane], d = tr.cars[1]?.d ?? 1;
  if (q.kind === 'fireball') {
    const u = q.t / q.dur, gy = q.ty ?? q.sy + 400;
    if (tr.phase === 'ok') {
      // (where it'll land: a closing ring, hatched)
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.ellipse(q.tx, gy - 2, 34 * d * (1 - u * 0.5), 6 * d, 0, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = f % 8 < 4 ? '#F97316' : '#FDE047'; c.lineWidth = 3; c.stroke();
    }
    const x = q.sx + (q.tx - q.sx) * u, y = q.sy + (gy - q.sy) * u - Math.sin(Math.PI * u) * 110 * d;
    for (let k = 1; k < 5; k++) { const uu = Math.max(0, u - k * 0.04), tx = q.sx + (q.tx - q.sx) * uu, ty = q.sy + (gy - q.sy) * uu - Math.sin(Math.PI * uu) * 110 * d; c.globalAlpha = 0.5 - k * 0.1; box(c, tx - (6 - k) * d, ty - (6 - k) * d, (12 - k * 2) * d, (12 - k * 2) * d, k % 2 ? '#F97316' : '#78716C'); }
    c.globalAlpha = 1;
    drawFireball(c, x, y, 12 * d, f);
  } else if (q.kind === 'strike') {
    if (tr.phase !== 'ok') return;
    const u = q.t / q.dur, gy = q.ty ?? 0;
    if (q.t < q.dur - 6) {
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.ellipse(q.tx, gy - 2, 26 * d * (1.2 - u * 0.6), 6 * d, 0, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = f % 6 < 3 ? '#FACC15' : '#FFFFFF'; c.lineWidth = 3; c.stroke();
      if (u > 0.6 && f % 4 < 2) { c.globalAlpha = 0.25; box(c, q.tx - 3, gy - 330 * d, 6, 330 * d, '#E9D5FF'); c.globalAlpha = 1; }
    } else {
      c.strokeStyle = '#6D28D9'; c.lineWidth = 10; c.beginPath(); let y = gy - 330 * d; c.moveTo(q.tx, y);
      const pts: [number, number][] = [[q.tx, y]];
      while (y < gy) { y += 30 * d; pts.push([q.tx + ((y * 7) % 30) - 15, Math.min(y, gy)]); }
      pts.forEach(([x, yy], i) => (i ? c.lineTo(x, yy) : c.moveTo(x, yy))); c.stroke();
      c.strokeStyle = '#FACC15'; c.lineWidth = 5; c.stroke(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 2; c.stroke();
    }
  } else {
    c.fillStyle = INK; c.beginPath(); c.arc(q.sx, q.sy, 10 * d, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#C8E4F8'; c.beginPath(); c.arc(q.sx, q.sy, 9 * d, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(q.sx - 1.5 * d, q.sy - 1.5 * d, 6.5 * d, 0, Math.PI * 2); c.fill();
    box(c, q.sx - 4 * d, q.sy - 5 * d, 2 * d, 2 * d, '#FFFFFF');
    for (let k = 1; k < 4; k++) box(c, q.sx + k * 8 * d, q.sy + ((f + k) % 3 - 1) * 2, 3 * d, 2 * d, '#E0F2FE');
  }
};

/** The dragons' breath at a near miss: their mouths glowing (the tell), then a stream of fire / frost / lightning
 *  out across his dragon's back at head height. */
const BREATH_COL: [string, string, string][] = [['#FFFFFF', '#FACC15', '#A78BFA'], ['#FDE047', '#F97316', '#DC2626'], ['#FFFFFF', '#BAE6FD', '#38BDF8']];
const drawBreath = (c: Ctx, state: GameState, t: Tragons) => {
  const b = t.breath;
  if (!b) return;
  const f = state.frame, k = f - b.at, to = t.trains[b.to];
  if (!to || to.phase !== 'ok' || !to.cars.length) return;
  for (const lane of b.from) {
    const tr = t.trains[lane];
    if (tr.phase !== 'ok' || !tr.cars.length) continue;
    const h = tr.cars[2], m = { x: h.x + Math.cos(h.a) * 84 * h.d - Math.sin(h.a) * -35 * h.d, y: h.y + Math.sin(h.a) * 84 * h.d + Math.cos(h.a) * -35 * h.d };
    const [w, mid, deep] = BREATH_COL[lane];
    if (k < 50) {
      // (the tell: the mouth glowing brighter and brighter, in rings)
      const r = (4 + k * 0.2) * h.d;
      c.globalAlpha = 0.3; c.fillStyle = deep; c.beginPath(); c.arc(m.x, m.y, r * 2.2, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
      c.fillStyle = deep; c.beginPath(); c.arc(m.x, m.y, r + 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = f % 6 < 3 ? w : mid; c.beginPath(); c.arc(m.x, m.y, r, 0, Math.PI * 2); c.fill();
      continue;
    }
    if (k > 86) continue;
    // (the stream: from its mouth across his dragon's back, at his head)
    const { x0, x1 } = roofSpan(to), ty = (to.cars[0].y + to.cars[2].y) / 2 - 62 * to.cars[1].d;
    if (lane === 0) {
      for (let n = 0; n < 4; n++) {
        const tx = x0 + (x1 - x0) * ((n + ((k >> 2) % 2) * 0.5) / 4);
        c.strokeStyle = n % 2 ? '#FFFFFF' : '#FACC15'; c.lineWidth = n % 2 ? 2 : 3; c.beginPath(); c.moveTo(m.x, m.y);
        for (let s = 1; s <= 6; s++) { const u = s / 6; c.lineTo(m.x + (tx - m.x) * u + ((f * 7 + n * 13 + s * 29) % 17) - 8, m.y + (ty - m.y) * u + ((f * 5 + s * 11 + n) % 13) - 6); }
        c.stroke();
      }
    }
    for (let n = 0; n < 30; n++) {
      const u = ((n * 37 + k * 9) % 100) / 100, tx = x0 + (x1 - x0) * ((n * 13) % 26) / 26;
      const x = m.x + (tx - m.x) * u, y = m.y + (ty - m.y) * u + Math.sin(n + f * 0.4) * 10 * u;
      const r = (3 + u * 10) * to.cars[1].d;
      c.fillStyle = [w, mid, deep][n % 3]; c.fillRect(x - r / 2, y - r / 2, r, r);
      if (lane === 2 && n % 4 === 0) { c.fillStyle = '#FFFFFF'; c.fillRect(x - r * 0.7, y - 0.5, r * 1.4, 1); c.fillRect(x - 0.5, y - r * 0.7, 1, r * 1.4); }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Back to front, split at his dragon's depth (worked out once a frame)

type Item = { d: number; draw: () => void };
let sorted: { f: number; back: Item[]; front: Item[]; e: Eye } | null = null;
const items = (c: Ctx, state: GameState, t: Tragons): { back: Item[]; front: Item[]; e: Eye } => {
  if (sorted && sorted.f === state.frame) return sorted;
  const v = viewBox(state), back: Item[] = [], front: Item[] = [], e = sceneEye(state, t);
  // (his depth: the car he's really on (not the train's middle: on a drop the cars' depths differ a lot), or the one
  // he's hanging on in a loop, or landing on)
  const dHis = hisTrainD(state);
  const riding = t.phase === 'dispatch' || t.phase === 'ride';
  /** In front of him only if it's nearer than he is (or it's his own lane's thing that hits him); `back`: never. */
  const put = (d: number, draw: () => void, side: 'auto' | 'front' | 'back' = 'auto') => (side === 'front' || (side === 'auto' && d > dHis + 0.004) ? front : back).push({ d, draw });
  const his = t.hop ? t.hop.to : t.lane;
  // (the track that's on screen: wide enough for the farthest depth and a loop's swing either side). Cut into runs a
  // depth each: short ones round the trains and through anything spun (its depth swings fast there: one depth for a
  // long run had the far side of a corkscrew or the helix drawn over his head), long ones elsewhere.
  const ex = t.eye.x, lo = ex + (v.x - ex) / 0.62, hi = ex + (v.x + v.w - ex) / 0.62;
  const s0 = Math.max(-900, Math.floor((lo - rearX(t.dist) + t.dist - 500) / 192) * 192), s1 = hi - rearX(t.dist) + t.dist + 500;
  const nearA = t.dist - 240, nearB = t.dist + TL + 240;
  const M: Pt = { x: 0, y: 0, d: 1, roll: 0 };
  for (const lane of LANES) for (let s = s0; s < s1;) {
    const fine = (s + 192 > nearA && s < nearB) || t.spins.some(q => q.lane === lane && s + 192 > q.s0 - 60 && s < q.s0 + q.len + 60);
    const len = fine ? 64 : 192, a = s;
    s += len;
    const m = trackPt(t.spins, t.dist, lane, a + len / 2, M), p = proj(t.eye, m.x, m.y, m.d), d = m.d;
    if (!boxIn(state, p.x - (len + 330) * d, p.y - 480 * d, p.x + (len + 330) * d, Math.max(p.y, GY) + 80)) continue;
    // (the track's always a hair behind the dragon on it; his own under his train always behind him)
    const under = riding && lane === his && a + len > nearA + 200 && a < nearB - 200;
    put(d - 0.002, () => drawSteel(c, state, t, t.eye, lane, a, a + len), under ? 'back' : 'auto');
  }
  // (his own dragon always under him: he's stood on it)
  for (const tr of t.trains) put(trainD(tr), () => drawTrain(c, state, t, tr), riding && tr.lane === his && tr.phase === 'ok' ? 'back' : 'auto');
  // (the halls' things at the play plane: after the supports behind them)
  put(0.999, () => { drawStationNear(c, state, t); drawUnloadNear(c, state, t); }, 'back');
  for (const o of t.obst) {
    const d = obstD(t, o);
    put(d - 0.003, () => drawObst(c, state, t, e, o, false));
    put(d, () => drawObst(c, state, t, e, o, true), o.lane === his ? 'front' : 'auto');
    if (o.kind === 'live') put(trainD(t.trains[o.lane]) + 0.0015, () => drawLiveRoof(c, state, t, o), o.lane === his ? 'front' : 'auto');
  }
  for (const q of t.shots) put(trainD(t.trains[q.lane]) + 0.001, () => drawShot(c, state, t, q), q.lane === his ? 'front' : 'auto');
  if (t.breath) put(9, () => drawBreath(c, state, t), 'front');
  // (the park's props, in among it by depth)
  for (const it of sceneryItems(c, state, t, e)) put(it.d - 0.001, it.draw);
  back.sort((a, b) => a.d - b.d); front.sort((a, b) => a.d - b.d);
  sorted = { f: state.frame, back, front, e };
  return sorted;
};

export const drawTragonsBack = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state);
  sorted = null;
  const it = items(c, state, t), e = it.e;
  drawFloor(c, state, t, e);
  // (the fake mountain: far back, behind every track whatever their depth)
  drawMountain(c, state, t, e);
  // (inside it: the bore, behind every track and dragon; its dark's the lighting's: cave.ts)
  drawCaveInside(c, state);
  drawStation(c, state, t, e);
  drawUnload(c, state, t, e);
  drawUnloadRivals(c, state, t, UNLOAD_SPOTS);
  for (const x of it.back) x.draw();
};

export const drawTragonsFront = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state);
  for (const x of items(c, state, t).front) x.draw();
};

// ---------------------------------------------------------------------------------------------------------------
// Screen space: the dark in the mountain, the warnings, the PA, the suitors' words

/** A hole's warning: an enamel shield in the lane's color, a gilt rim, the broken track on it (two rails, the gap, the
 *  drop), flashing. Its middle at (x, y). */
const warnSign = (c: Ctx, x: number, y: number, col: string, f: number, r = 15) => {
  const on = f % 16 < 10, C = on ? col : mix(col, '#000000', 0.45);
  const shield = (s: number): [number, number][] => [[x - r * s, y - r * s], [x + r * s, y - r * s], [x + r * s, y + r * 0.2 * s], [x, y + r * 1.15 * s], [x - r * s, y + r * 0.2 * s]];
  polyF(c, shield(1.25), INK); polyF(c, shield(1.12), on ? GOLD[4] : GOLD[2]); polyF(c, shield(0.96), C);
  polyF(c, [[x - r * 0.9, y - r * 0.9], [x + r * 0.9, y - r * 0.9], [x + r * 0.9, y - r * 0.7], [x - r * 0.9, y - r * 0.7]], mix(C, '#FFFFFF', 0.35));
  const s = r / 15;
  box(c, x - 11 * s, y - 4 * s, 8 * s, 4 * s, INK); box(c, x + 3 * s, y - 4 * s, 8 * s, 4 * s, INK);
  box(c, x - 11 * s, y - 3 * s, 7 * s, 2 * s, '#F8FAFC'); box(c, x + 4 * s, y - 3 * s, 7 * s, 2 * s, '#F8FAFC');
  polyF(c, [[x - 3 * s, y + 1 * s], [x + 3 * s, y + 1 * s], [x + 3 * s, y + 5 * s], [x + 6 * s, y + 5 * s], [x, y + 11 * s], [x - 6 * s, y + 5 * s], [x - 3 * s, y + 5 * s]], INK);
};
/** A loop's warning: a round enamel medallion in the lane's color with a gilt rim, the loop drawn on it (a corkscrew:
 *  a coil; the helix: three strands). */
const loopSign = (c: Ctx, x: number, y: number, col: string, f: number, kind: string, r = 15) => {
  const on = f % 16 < 10, C = on ? col : mix(col, '#000000', 0.45);
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 4, 0, Math.PI * 2); c.fill();
  c.fillStyle = on ? GOLD[4] : GOLD[2]; c.beginPath(); c.arc(x, y, r + 2.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = C; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = mix(C, '#FFFFFF', 0.35); c.beginPath(); c.arc(x - r * 0.3, y - r * 0.35, r * 0.45, 0, Math.PI * 2); c.fill();
  const glyph = (w: number, col2: string) => {
    c.strokeStyle = col2; c.lineWidth = w; c.lineCap = 'round';
    if (kind === 'braid') { for (let n = 0; n < 3; n++) { c.beginPath(); for (let k = 0; k <= 20; k++) { const u = k / 20, xx = x - r * 0.7 + u * r * 1.4, yy = y + Math.sin(u * Math.PI * 3 + n * 2.1) * r * 0.4; if (k) c.lineTo(xx, yy); else c.moveTo(xx, yy); } c.stroke(); } }
    else if (kind === 'cork') { c.beginPath(); for (let k = 0; k <= 24; k++) { const u = k / 24, xx = x - r * 0.7 + u * r * 1.4, yy = y + Math.sin(u * Math.PI * 4) * r * 0.45; if (k) c.lineTo(xx, yy); else c.moveTo(xx, yy); } c.stroke(); }
    else { c.beginPath(); c.arc(x, y - 2, r * 0.45, 0.5 * Math.PI + 0.4, 2.5 * Math.PI - 0.4); c.stroke(); c.beginPath(); c.moveTo(x - r * 0.7, y + r * 0.5); c.lineTo(x + r * 0.7, y + r * 0.5); c.stroke(); }
    c.lineCap = 'butt';
  };
  glyph(4, INK); glyph(2, '#F8FAFC');
};
/** A label on a little banner (dark, gilt-edged). */
const text = (c: Ctx, s: string, x: number, y: number, col: string, size = 7, align: CanvasTextAlign = 'center', plate = false) => {
  c.font = `${size}px ${FONT}`; c.textAlign = align;
  if (plate) {
    const w = c.measureText(s).width + 8, x0 = align === 'center' ? x - w / 2 : align === 'left' ? x - 4 : x - w + 4;
    box(c, x0 - 1, y - size - 4, w + 2, size + 8, INK); box(c, x0, y - size - 3, w, size + 6, '#1A1028'); box(c, x0, y - size - 3, w, 1, GOLD[3]); box(c, x0, y + 2, w, 1, GOLD[1]);
  }
  c.fillStyle = '#000'; c.fillText(s, x + 1, y + 1); c.fillStyle = col; c.fillText(s, x, y);
  c.textAlign = 'left';
};
const KIND_WORD: Record<string, string> = { loop: 'LOOP', cork: 'CORKSCREW', chain: 'LOOP', braid: 'HELIX', chain3: 'LOOP' };
/** A countdown bar: a gilt frame, the dark inside, the lane's color in two steps, notched. */
const countdown = (c: Ctx, x: number, y: number, bw: number, k: number, col: string, hot: boolean) => {
  box(c, x - bw / 2 - 3, y - 3, bw + 6, 12, INK); box(c, x - bw / 2 - 2, y - 2, bw + 4, 10, GOLD[2]); box(c, x - bw / 2 - 2, y - 2, bw + 4, 1, GOLD[4]);
  box(c, x - bw / 2, y, bw, 6, '#140C1E');
  const fill = hot ? '#FFFFFF' : col;
  box(c, x - bw / 2, y, bw * k, 6, fill); box(c, x - bw / 2, y, bw * k, 2, mix(fill, '#FFFFFF', 0.45)); box(c, x - bw / 2, y + 4, bw * k, 2, mix(fill, '#000000', 0.3));
  for (let n = 1; n < 6; n++) box(c, x - bw / 2 + (bw * n) / 6, y, 1, 6, '#140C1E');
};

/** Over a dragon's top, on screen (kept out from under the HUD and off the top). */
const overTrain = (state: GameState, tr: Train, up: number) => {
  const top = Math.min(...tr.cars.map(k => k.y - up * k.d)), mx = tr.cars[1].x;
  const p = toScreen(state, mx, top);
  return { x: Math.max(60, Math.min(CANVAS_WIDTH - 60, p.x)), y: Math.max(FRAME_TOP + 8, Math.min(FRAME_BOT - 12, p.y)) };
};

export const drawTragonsHud = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state), f = state.frame;
  if (t.phase === 'ride') {
    // The holes coming
    for (const g of t.gaps) {
      if (g.a <= t.dist + TL - 2) continue;
      const [main] = LANE_COL[g.lane];
      const left = (g.a - (t.dist + TL)) / Math.max(1, t.v), total = Math.max(left, g.w ?? left);
      const q = trackPt(t.spins, t.dist, g.lane, g.a, { x: 0, y: 0, d: 1, roll: 0 }), w = proj(t.eye, q.x, q.y, q.d);
      const at = toScreen(state, w.x, w.y + 10);
      const off = at.x > CANVAS_WIDTH - 34;
      const sx = Math.min(CANVAS_WIDTH - 34, at.x), sy = Math.max(FRAME_TOP + 22, Math.min(FRAME_BOT - 30, at.y));
      warnSign(c, sx, sy, main, f);
      text(c, 'TRACK OUT', sx, sy + 32, main, 6, 'center', true);
      if (off && f % 16 < 10) text(c, '>>', sx + 22, sy + 4, main, 8, 'left');
      const tr = t.trains[g.lane];
      if (tr.phase === 'ok' && tr.cars.length) {
        const p = overTrain(state, tr, 92);
        const bw = 90, k = Math.max(0, Math.min(1, left / total));
        countdown(c, p.x, p.y, bw, k, f % 10 < 5 && k < 0.35 ? '#EF4444' : main, false);
        warnSign(c, p.x - bw / 2 - 15, p.y + 3, main, f, 8);
      }
    }
    // The loops coming (by event: its lanes together)
    for (const q of t.spins) {
      if (q.s0 <= t.dist + TL - 2) continue;
      const [main] = LANE_COL[q.lane];
      const left = (q.s0 - (t.dist + TL)) / Math.max(1, t.v), k = Math.max(0, Math.min(1, left / Math.max(1, q.w)));
      const a = trackPt(t.spins, t.dist, q.lane, q.s0, { x: 0, y: 0, d: 1, roll: 0 }), w = proj(t.eye, a.x, a.y, a.d);
      const at = toScreen(state, w.x, w.y - 30);
      const off = at.x > CANVAS_WIDTH - 34;
      const sx = Math.min(CANVAS_WIDTH - 34, at.x), sy = Math.max(FRAME_TOP + 22, Math.min(FRAME_BOT - 30, at.y));
      loopSign(c, sx, sy, main, f, q.kind);
      text(c, KIND_WORD[q.kind], sx, sy + 32, main, 6, 'center', true);
      if (off && f % 16 < 10) text(c, '>>', sx + 22, sy + 4, main, 8, 'left');
      const tr = t.trains[q.lane];
      if (tr.phase === 'ok' && tr.cars.length) {
        const p = overTrain(state, tr, 112);
        const bw = 90;
        countdown(c, p.x, p.y, bw, k, main, f % 10 < 5 && k < 0.35);
        loopSign(c, p.x - bw / 2 - 15, p.y + 3, main, f, q.kind, 8);
        text(c, `${LANE_NAME[q.lane]} ${KIND_WORD[q.kind]}`, p.x, p.y - 8, main, 6, 'center', true);
      }
    }
    // The live rail coming on the LIGHTNING track (the user's: "make the electric floor more obvious"): over its dragon,
    // a countdown to the roof going live and LIVE ROOF: JUMP!; while it's live, LIVE! flashing; off it, nothing
    for (const o of t.obst) {
      if (o.kind !== 'live') continue;
      const tr = t.trains[o.lane];
      if (tr.phase !== 'ok' || !tr.cars.length) continue;
      const ahead = o.s - (t.dist + TL), live = ahead < 0 && t.dist < o.s + o.len;
      const left = ahead / Math.max(1, t.v);
      if (!live && (ahead < 0 || left > 170)) continue;
      const [main] = LANE_COL[o.lane], p = overTrain(state, tr, 96);
      if (live) text(c, f % 10 < 5 ? 'LIVE! JUMP!' : 'LIVE!', p.x, p.y + 6, f % 6 < 3 ? '#FFFFFF' : '#FDE047', 8, 'center', true);
      else {
        countdown(c, p.x, p.y, 90, Math.max(0, Math.min(1, left / 170)), f % 10 < 5 && left < 60 ? '#FFFFFF' : '#7DD3FC', false);
        text(c, 'LIVE ROOF: JUMP!', p.x, p.y - 8, main, 6, 'center', true);
      }
    }
    // (only one dragon makes it: SAFE over that one)
    const safe = t.gaps.find(g => g.safe !== undefined && g.a > t.dist + TL - 2)?.safe;
    if (safe !== undefined && t.trains[safe].phase === 'ok' && t.trains[safe].cars.length) {
      const p = overTrain(state, t.trains[safe], 128);
      const bob = Math.sin(f * 0.2) * 3;
      text(c, `SAFE: ${LANE_NAME[safe]}`, p.x, p.y + bob, f % 20 < 14 ? '#4ADE80' : '#BBF7D0', 8, 'center', true);
      c.fillStyle = INK; c.beginPath(); c.moveTo(p.x - 9, p.y + 7 + bob); c.lineTo(p.x + 9, p.y + 7 + bob); c.lineTo(p.x, p.y + 17 + bob); c.fill();
      c.fillStyle = '#4ADE80'; c.beginPath(); c.moveTo(p.x - 7, p.y + 8 + bob); c.lineTo(p.x + 7, p.y + 8 + bob); c.lineTo(p.x, p.y + 15 + bob); c.fill();
    }
  }
  // (the suitors' words over them at the unload)
  if (t.phase === 'arrive') RIVALS.forEach((r, i) => {
    const s = t.unload.talk[r.id];
    if (!s) return;
    const p = toScreen(state, UNLOAD_SPOTS[i] + t.unload.walk, GY - 110);
    saidOver(c, s.text, p.x, p.y, '#FDE68A', 220);
  });
  // (the PA: the ride's spiel, or Piper, in the top band: a dark plate, a gilt rule, her pink or the herald's gold)
  if (t.pa) {
    const band = topBand(), who = t.paWho === 'piper' ? 'PIPER (PA):' : 'THE RIDE:';
    const col = t.paWho === 'piper' ? '#F9A8D4' : '#FDE68A';
    c.font = `7px ${FONT}`;
    const words = t.pa.text.split(' '), lines: string[] = [];
    let cur = '';
    const wide = band.x2 - band.x1 - 16;
    for (const w of words) { const s = cur ? `${cur} ${w}` : w; if (c.measureText(s).width > wide && cur) { lines.push(cur); cur = w; } else cur = s; }
    if (cur) lines.push(cur);
    const h = 20 + lines.length * 11;
    c.fillStyle = 'rgba(10,8,20,0.8)'; c.fillRect(band.x1, 8, band.x2 - band.x1, h);
    c.fillStyle = col; c.fillRect(band.x1, 8, 3, h);
    c.fillStyle = GOLD[3]; c.fillRect(band.x1 + 3, 8 + h - 1, band.x2 - band.x1 - 3, 1);
    text(c, who, band.x1 + 10, 20, col, 6, 'left');
    lines.forEach((l, i) => text(c, l, band.x1 + 10, 32 + i * 11, '#FFFFFF', 7, 'left'));
  }
};

