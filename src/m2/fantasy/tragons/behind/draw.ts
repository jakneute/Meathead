// The ride from behind, drawn (screen space, the whole picture: the section's backdrop; the world's layers draw
// nothing while it's on). The sky by the hour and the far off round the horizon (world.ts: the classic ride's own far
// layers); the park's lawn going away in mowed bands (its paths, the lagoon's water), the park's things along it; the
// three tracks, step by step from the far end in (sprites.ts: a step of steel a picture, stretched to its place, hazed
// going away; a step rolled through a loop put down turned), their lattice supports down to the lawn on their footings,
// the holes (torn ends, sparks), FIRE's burning stretches; on them, far to near: the obstacles (rings, jets, icicles,
// bars, pylons), the dragons (cars.ts: from behind, the front one's head up), him on his (meathead.ts). The mountain:
// its face with the bore's portal, the ribbed rock inside, the work lamps, the dragons' lamps, the way out glowing (the
// dark's the land's lighting: world.ts behindLight). The whole view turned with his car's roll (and the bank).
// The nearest steps of track (between the camera and his car, down off the screen's bottom) fade out and the
// supports start past his car: nothing blows up at the screen's bottom when the camera pulls back.
// Over it (drawBehindHud): the warnings (a plaque at each hole and roll coming, a countdown over the dragon going in,
// SAFE, LIVE), the balance meter, the PA, the fades. Dead: the side shot his death plays in (ride.ts toShot).

import type { GameState } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../../m1/constants';
import { box, mix, INK, polyF, type Ctx } from '../../kit';
import { timeOfDay } from '../../../timeOfDay';
import { LANES, LANE_COL, LANE_NAME, DROPS, type Lane } from '../layout';
import { tragonsOf, type Tragons } from '../state';
import { paintCar } from '../dragon';
import { text, warnSign, loopSign, countdown, drawPa } from '../art';
import {
  SEG, DRAW_N, DRAW, REAR, CAR_L, NOSE, FOCAL, TUNNEL,
  trackAt, project, curveX, inTunnel, inLagoon, zOf, sOfW, carS, noseS, paceAt, type TP, type SP, type Cam,
} from './geom';
import { RING_BOTTOM, RING_IN, PYLON_CRYSTAL, PYLON_LEG, DUCK_LOW, JET_Y, JET_HH, ST_W, SUP_W, SUP_H, jetPost, pylon, strip, lattice, footing, ring, icicles, iceBar, HAZE, type Placed } from './sprites';
import { carBack, panelBack, carLive, FLOOR_Y } from './cars';
import { drawSkyFar, drawLawn, propsRow, drawFace, caveSpan, drawRib, boreRect, ribLamps, setExitHole, splashFx, wakeFx, speedLines, snowFx, sky, put, hz, SKY_H, SKY_HORIZON, type Row, type Bore } from './world';
import { drawMe, type MeQ } from './meathead';
import { SHOT_CAR, SHOT_LAWN, turned, HOP_ARC, BAL_ONE, zapNear } from './ride';
import type { Bv } from './state';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
let M = 0;

const hazeStep = (z: number) => Math.min(HAZE - 1, Math.floor((z / DRAW) * HAZE * 1.15));
/** The nearest steps of track: none nearer than NEAR_CUT, faded in over NEAR_FADE past it. */
const NEAR_CUT = 140, NEAR_FADE = 30;
/** The ribs round the bore and the supports under the tracks, every this much track. */
const RIB = 360, SUP = 240;

// ---------------------------------------------------------------------------------------------------------------
// The track ahead, worked out once a frame

const rows: Row[] = Array.from({ length: DRAW_N + 2 }, () => ({ s: 0, z: 0, gy: 0, ok: [false, false, false], p: [0, 1, 2].map(() => ({ x: 0, y: 0, k: 1 })), phi: [0, 0, 0], x: [0, 0, 0], y: [0, 0, 0] }));
const TQ: TP = { x: 0, y: 0, phi: 0 };
const fillRows = (bv: Bv) => {
  // (the rows a step apart along the drawn track: the pace stretches it)
  const cam = bv.cam, base = Math.floor(cam.w / SEG) * SEG + SEG;
  for (let k = 0; k < rows.length; k++) {
    const r = rows[k];
    const w = base + k * SEG;
    r.s = sOfW(w); r.z = w - cam.w;
    r.gy = cam.hy + cam.y * (FOCAL / r.z);
    for (const l of LANES) {
      trackAt(bv.rolls, l, r.s, TQ);
      r.x[l] = TQ.x; r.y[l] = TQ.y; r.phi[l] = TQ.phi;
      r.ok[l] = project(cam, TQ.x, TQ.y, r.s, r.p[l]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// What stands on the tracks (sorted far to near, put down as the track's drawn in past them)

interface Item { s: number; draw: () => void }
const items: Item[] = [];
const SPi: SP = { x: 0, y: 0, k: 1 };

const inGap = (t: Tragons, lane: Lane, s: number) => { for (const g of t.gaps) if (g.lane === lane && s >= g.a && s < g.b) return true; return false; };
const burning = (bv: Bv, s: number) => { for (const q of bv.burns) if (s > q.a && s < q.b) return true; return false; };

/** A step of track from row r (near) to row n (far) on a lane: flat (the picture stretched to the step's trapezoid,
 *  in slices so its edges run true), or rolled (put down turned with the track). */
const stripMemo: (Placed | null)[] = [];
let stripHour = '';
/** The step's picture, remembered (per lane, haze step, light and the lift's chain: no key built a call). */
const stripOf = (l: Lane, step: number, cave: boolean, lift: boolean, m: number) => {
  const h = timeOfDay().key;
  if (h !== stripHour) { stripHour = h; stripMemo.length = 0; }
  const i = (((l * HAZE + step) * 2 + (cave ? 1 : 0)) * 2 + (lift ? 1 : 0)) * 4 + (m - 1);
  return (stripMemo[i] ??= strip(l, step, cave, lift, m));
};
const segment = (c: Ctx, l: Lane, a: SP, b: SP, pa: number, pb: number, step: number, cave: boolean, lift: boolean, m = 1) => {
  const sp = stripOf(l, step, cave, lift, m);
  if (!sp) return;
  const cv = sp.cv, sw = cv.width, sh = cv.height;
  if (Math.abs(pa) < 0.01 && Math.abs(pb) < 0.01) {
    // (flat: in slices down the step, each its own width (the edges run true going away); a slice that runs across the
    // picture sheared along the track's line on screen (no stairs))
    const h = a.y - b.y, dx = a.x - b.x;
    const w = ST_W * (a.k + b.k) * 0.5;
    if (Math.abs(dx) < 10) { c.drawImage(cv, (a.x + b.x) / 2 - w / 2, Math.min(a.y, b.y), w, Math.abs(h) + 0.7); return; }
    // (running across the picture: sheared along the track's line on screen, no stairs)
    const cc = dx / sh, dd = (h + (h >= 0 ? 0.7 : -0.7)) / sh;
    mapTo(c, w / sw, 0, cc, dd, b.x - w / 2, b.y);
    c.drawImage(cv, 0, 0);
    c.setTransform(B0!);
    return;
  }
  // (rolled: the picture mapped onto the step, its far edge across the track at b, down to a; far off, a few pixels
  // of it, or right by the camera (a grazing view: no slivers), the spine's quad and its rails)
  const cb = Math.cos(pb), sb = Math.sin(pb), hw = (ST_W / 2) * b.k;
  if (a.k < 0.55 || a.k > 1.1) {
    // (the spine's quad in the lane's color, the two rails along its sides in steel)
    const ca = Math.cos(pa), sa = Math.sin(pa), ha = 36 * a.k, hb = 36 * b.k, sa2 = 12 * a.k, sb2 = 12 * b.k;
    polyF(c, [[a.x - ca * sa2, a.y + sa * sa2], [a.x + ca * sa2, a.y - sa * sa2], [b.x + cb * sb2, b.y - sb * sb2], [b.x - cb * sb2, b.y + sb * sb2]], rollCol(l, step, cave));
    c.strokeStyle = hz('#9AA4C0', step, cave); c.lineWidth = Math.max(1, 6 * a.k);
    c.beginPath(); c.moveTo(a.x - ca * ha, a.y + sa * ha); c.lineTo(b.x - cb * hb, b.y + sb * hb); c.moveTo(a.x + ca * ha, a.y - sa * ha); c.lineTo(b.x + cb * hb, b.y - sb * hb); c.stroke();
    return;
  }
  mapTo(c, (cb * b.k * ST_W) / sw, (-sb * b.k * ST_W) / sw, (a.x - b.x) / sh, (a.y - b.y + 0.5) / sh, b.x - cb * hw, b.y + sb * hw);
  c.drawImage(cv, 0, 0);
  c.setTransform(B0!);
};
/** A far rolled step's one color (its rails and spine together, hazed). */
const rollCol = (l: Lane, step: number, cave: boolean) => hz(LANE_COL[l][0], step, cave);
/** The steps put down together, per lane: groupEnd[l][k] the far row of the group starting at row k (0: none starts
 *  there). Near to, a step a picture; going away two, then four (a few pixels each: one put for the lot), never across
 *  a hole, a roll or an edge of the picture. */
const groupEnd = [0, 1, 2].map(() => new Int16Array(DRAW_N + 2));
const planGroups = (t: Tragons) => {
  for (const l of LANES) {
    const G = groupEnd[l]; G.fill(0);
    let k = 0;
    while (k < DRAW_N) {
      const r = rows[k];
      const want = r.z < 900 ? 1 : r.z < 1800 ? 2 : 4;
      let e = k + 1;
      if (r.ok[l] && rows[e].ok[l] && !inGap(t, l, r.s)) {
        while (e - k < want && e < DRAW_N && rows[e + 1].ok[l] && !inGap(t, l, rows[e].s) && (want > 1 || (Math.abs(rows[e].phi[l]) < 0.01 && Math.abs(r.phi[l]) < 0.01))) e++;
        G[k] = e;
      }
      k = e;
    }
  }
};
/** The frame's transform (the view turned), and a picture's own mapping put after it. */
let B0: DOMMatrix | null = null;
const mapTo = (c: Ctx, a: number, b: number, cc: number, d: number, e: number, f: number) => {
  const M = B0!;
  c.setTransform(M.a * a + M.c * b, M.b * a + M.d * b, M.a * cc + M.c * d, M.b * cc + M.d * d, M.a * e + M.c * f + M.e, M.b * e + M.d * f + M.f);
};

/** A lattice support from under the track at (x, top) down to the lawn at gy, scale k (its foot on a footing). */
const support = (c: Ctx, x: number, top: number, gy: number, k: number, step: number) => {
  const h = gy - top;
  if (h < 4) return;
  const cv = lattice(step);
  const w = SUP_W * k;
  if (cv) {
    const src = Math.min(SUP_H, h / k);
    c.drawImage(cv, 0, 0, cv.width, (src / SUP_H) * cv.height, x - w / 2, top, w, Math.min(h, src * k));
  }
  if (k > 0.28) put(c, footing(step), x, gy, k);
};

/** The whole picture. */
export const drawBehind = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state), bv = t.bv!;
  if (bv.dead) { drawShot(c, state, t, bv); return; }
  const cam = bv.cam, f = state.frame;
  fillRows(bv); planGroups(t);
  const camIn = inTunnel(cam.s + 40);
  // (how far past the screen's edges the fills go: only turned does it need the corners covered)
  M = Math.abs(cam.ang) > 0.001 ? 700 : 0;
  ribLamps.length = 0; setExitHole(null);
  c.save();
  c.imageSmoothingEnabled = false;
  // (the view turned with his car's roll and the bank, about the horizon's middle)
  if (Math.abs(cam.ang) > 0.001) { c.translate(W / 2, cam.hy); c.rotate(cam.ang); c.translate(-W / 2, -cam.hy); }
  B0 = c.getTransform();
  // ---- the sky, the far off (wide enough to cover the corners turned)
  const turn = curveX(cam.s + 2600) * 0.6 + cam.x * 0.05;
  const up = Math.max(0, cam.y - 300);
  const gF = rows[DRAW_N - 1].gy;
  const drawSkyAll = () => drawSkyFar(c, f, cam.hy, gF, turn, M, up);
  if (!camIn) drawSkyAll();
  else box(c, -M, -M, W + 2 * M, H + 2 * M, hz('#120E1A', 0, true));
  // (the lawn: flat on the ground, nothing under it, so all of it first; out in the open (or the mountain's face
  // ahead: the lawn's all nearer than it), or through the way out ahead)
  const lawn = () => drawLawn(c, cam, rows, DRAW_N - 1, f, M, inTunnel);
  if (!camIn) lawn();

  // ---- the mountain's mouths ahead: the bore to clip the far side into
  const faceS = !camIn && zOf(cam, TUNNEL.a) > 60 && zOf(cam, TUNNEL.a) < DRAW ? TUNNEL.a : null;
  const exitS = camIn && zOf(cam, TUNNEL.b) < DRAW ? TUNNEL.b : null;
  const hole = faceS !== null ? boreRect(bv, faceS) : exitS !== null ? boreRect(bv, exitS) : null;
  let clipped = false;
  if (hole && faceS !== null) {
    c.save(); c.beginPath(); c.rect(hole.x0, hole.y0, hole.x1 - hole.x0, hole.y1 - hole.y0); c.clip(); clipped = true;
    box(c, hole.x0, hole.y0, hole.x1 - hole.x0, hole.y1 - hole.y0, hz('#120E1A', 2, true));
  } else if (hole && exitS !== null) {
    c.save(); c.beginPath(); c.rect(hole.x0, hole.y0, hole.x1 - hole.x0, hole.y1 - hole.y0); c.clip(); clipped = true;
    drawSkyAll();
    lawn();
    setExitHole(hole);
  }

  // ---- what stands on the tracks, far to near
  items.length = 0;
  const sCar = t.dist + REAR;
  for (const o of bv.obst) {
    // (gone past his car: out of the picture, or it'd fill the screen between him and the camera; a ring goes on past
    // him a little: he's seen going through it)
    if (zOf(cam, o.s) > DRAW || o.s < sCar - (o.kind === 'ring' && o.lane === t.lane ? 110 : 16)) continue;
    if (o.kind === 'ring' && o.lane === t.lane && o.s < sCar + 60) {
      // (going by him: its top half and posts behind him, its bottom half in front)
      items.push({ s: Math.max(o.s, sCar + 1), draw: () => drawObst(c, t, bv, o.kind, o.lane, o.s, f, 'back') });
      items.push({ s: Math.min(o.s, sCar - 1), draw: () => drawObst(c, t, bv, o.kind, o.lane, o.s, f, 'front') });
    } else items.push({ s: o.s, draw: () => drawObst(c, t, bv, o.kind, o.lane, o.s, f) });
  }
  for (const tr of bv.trains) {
    if (tr.phase === 'gone') continue;
    for (let i = 2 as 0 | 1 | 2; i >= 0; i--) {
      const s = carS(t.dist, i), which = i as 0 | 1 | 2;
      items.push({ s, draw: () => drawCar(c, state, t, bv, tr.lane, which, s) });
    }
  }
  items.sort((a, b) => b.s - a.s);
  let ii = 0;

  // ---- the lawn, the tracks, step by step from the far end in
  let farRib: Bore | null = null, nearDone = false;
  const lift = DROPS[0];
  for (let k = DRAW_N - 1; k >= 0; k--) {
    const r = rows[k], n = rows[k + 1];
    if (r.z < NEAR_CUT * 0.5) continue;
    const step = hazeStep(r.z), cave = inTunnel(r.s);
    // (out of the bore's clip once the steps come nearer than the mouth)
    if (clipped && ((faceS !== null && r.s < faceS) || (exitS !== null && r.s < exitS))) {
      c.restore(); clipped = false;
      if (faceS !== null) drawFace(c, bv, faceS, hole!, M);
      else if (exitS !== null) { drawRib(c, hole!, 0); farRib = hole; }
    }
    // the lawn's band (the lagoon's water; none in the mountain)
    if (!cave && n.z > 24 && k > 1) propsRow(c, cam, r, step);
    // the mountain's inside: a rib round the bore at every RIB of track, the rock between it and the last
    if (cave || (n.s > TUNNEL.a && r.s <= TUNNEL.a)) {
      const ribAt = Math.floor(n.s / RIB) * RIB;
      if (ribAt >= r.s && ribAt > TUNNEL.a + 20 && ribAt < TUNNEL.b - 20 && zOf(cam, ribAt) > 30) {
        const rib = boreRect(bv, ribAt);
        if (farRib) caveSpan(c, rib, farRib, step, f, Math.floor(ribAt / RIB));
        drawRib(c, rib, step);
        if (step < 4) ribLamps.push({ x: (rib.x0 + rib.x1) / 2, y: rib.y0 + 18 * rib.k, r: 220 * rib.k });
        farRib = { ...rib };
        // (the last rib before the camera: the rock on out to the camera now, under what's nearer (drawn after, it
        // painted over the near cars: the owner's "the cave walls render in front of the dragon cart"))
        const nxt = ribAt - RIB;
        if (camIn && !nearDone && !(nxt > TUNNEL.a + 20 && zOf(cam, nxt) > 30)) {
          const near = boreRect(bv, Math.max(TUNNEL.a + 1, cam.s + 30)); caveSpan(c, near, farRib, 0, f, 0); nearDone = true;
        }
      }
    }
    const fade = r.z < NEAR_CUT ? 0 : r.z < NEAR_CUT + NEAR_FADE ? (r.z - NEAR_CUT) / NEAR_FADE : 1;
    if (fade > 0) {
      if (fade < 1) c.globalAlpha = fade;
      const id = Math.floor(r.s / SEG);
      const supRow = Math.floor(n.s / SUP) !== Math.floor(r.s / SUP);
      for (const l of LANES) {
        if (!r.ok[l] || !n.ok[l] || inGap(t, l, r.s)) continue;
        const a = r.p[l], b = n.p[l];
        if (a.k * ST_W > 900) continue;
        const flat = Math.abs(r.phi[l]) < 0.01;
        // (its supports down to the lawn: none rolled, in the mountain, over the lagoon or right under the camera)
        if (supRow && !cave && flat && r.z > 260 && r.z < 2800 && r.gy > a.y + 14 * a.k) support(c, a.x, a.y + 10 * a.k, r.gy, a.k, step);
        // (far off, two steps a picture: half the puts where they're a few pixels each)
        const ge = groupEnd[l][k];
        // (off the screen: nothing to put down (turned, the view's corners are in play: no cull then))
        const off = M === 0 && (Math.min(a.y, b.y) > H + 2 || Math.max(a.x, b.x) + ST_W * a.k < -2 || Math.min(a.x, b.x) - ST_W * a.k > W + 2);
        if (ge > 0 && !off) { const n2 = rows[ge]; segment(c, l, a, n2.p[l], r.phi[l], n2.phi[l], step, cave, r.s < lift, ge - k); }
        // (FIRE's burning stretch: flames along the rails, embers)
        if (l === 1 && (id & 1) === 0 && burning(bv, r.s)) flamesAt(c, a.x, a.y, a.k, f + k * 3, r.phi[l]);
        // (a hole's torn end: twisted rails and sparks)
        for (const g of t.gaps) if (g.lane === l && g.a >= r.s && g.a < n.s) tornEnd(c, b.x, b.y, b.k, f);
      }
      if (fade < 1) c.globalAlpha = 1;
    }
    // the things on the track out past this step
    while (ii < items.length && items[ii].s >= r.s) { if (items[ii].s < r.s + SEG * 1.5 || k === DRAW_N - 1) items[ii].draw(); ii++; }
  }
  // (the mountain's rock on past the nearest rib, out to the camera)
  if (camIn && farRib && !nearDone) { const near = boreRect(bv, Math.max(TUNNEL.a + 1, cam.s + 30)); caveSpan(c, near, farRib, 0, f, 0); }
  if (clipped) c.restore();
  while (ii < items.length) { items[ii].draw(); ii++; }
  // (the dragons' lamps in the mountain: a beam ahead of each head)
  if (camIn || faceS !== null) lamps(c, t, bv);
  // (his hop: him in the air between the two)
  if (bv.hop) drawHop(c, state, t, bv);
  // (the splashdown's spray off his dragon; its wake through the water)
  if (inLagoon(sCar)) wakeFx(c, f, bv.me.x, bv.me.y, bv.me.k);
  splashFx(c, t, f, bv.me.x, bv.me.y, bv.me.k);
  c.restore();
  // (the snow out in the open; the speed lines at the top speed)
  if (!camIn) snowFx(c, f, turn);
  const fast = t.v * paceAt(sCar);
  speedLines(c, f, cam.hy, (fast - 11.6) / 2);
  // (thrown off: tumbling away, screen space)
  if (bv.fling) drawFling(c, state, bv);
};

// ---------------------------------------------------------------------------------------------------------------
// The dragons, him

const CP: TP = { x: 0, y: 0, phi: 0 };
const pants = (state: GameState) => { const g = state.player.gut; return { nude: g?.stage === 3, shat: g?.stage === 2 }; };

const drawCar = (c: Ctx, state: GameState, t: Tragons, bv: Bv, lane: Lane, which: 0 | 1 | 2, s: number) => {
  const tr = bv.trains[lane], f = state.frame;
  trackAt(bv.rolls, lane, s, CP);
  let y = CP.y;
  if (tr.phase === 'fall') y -= tr.fy * (1 + (2 - which) * 0.1) + (which === 2 ? tr.t * 1.2 : 0);
  else if (tr.phase === 'arrive') { const u = tr.t / 60, e = 1 - (1 - u) * (1 - u); y += (1 - e) * 420; }
  if (!project(bv.cam, CP.x, y, s, SPi)) return;
  const x = SPi.x, sy = SPi.y, k = SPi.k, a = -CP.phi, z = zOf(bv.cam, s);
  const step = hazeStep(z), cave = inTunnel(s);
  if (x < -300 * k - M || x > W + 300 * k + M) return;
  const his = lane === t.lane && which === 0 && !bv.hop && !bv.fling;
  // (a spare's bat wings, beating)
  if (tr.phase === 'arrive' && which === 1) {
    const flap = Math.sin(f * 0.45) * 14, W2 = LANE_COL[lane];
    for (const sd of [-1, 1]) {
      polyF(c, [[x + sd * 40 * k, sy - 30 * k], [x + sd * 154 * k, sy - (74 + flap) * k], [x + sd * 124 * k, sy - 8 * k]], INK);
      polyF(c, [[x + sd * 42 * k, sy - 30 * k], [x + sd * 148 * k, sy - (70 + flap) * k], [x + sd * 120 * k, sy - 10 * k]], W2[2]);
      polyF(c, [[x + sd * 42 * k, sy - 30 * k], [x + sd * 148 * k, sy - (70 + flap) * k], [x + sd * 90 * k, sy - 40 * k]], mix(W2[2], '#FFFFFF', 0.2));
    }
  }
  const shake = his && bv.landT > 0 ? Math.sin(bv.landT * 1.9) * bv.landT * 0.25 * k : 0;
  const danger = t.gaps.some(g => g.lane === lane && g.a > t.dist + NOSE && g.a - (t.dist + NOSE) < 900);
  put(c, carBack(lane, which, his ? 0 : step, cave, his, k), x, sy + shake, k, a);
  // (its lamps, its eyes, its element: live)
  c.save(); c.translate(x, sy + shake); if (a) c.rotate(a); c.scale(k, k);
  carLive(c, lane, which, f, danger, step, k);
  c.restore();
  // (the LIGHTNING dragon going live: its tell (sparks crawling over it, flashing faster), then live (arcs all over it))
  if (lane === 0 && bv.zap && tr.phase === 'ok') zapFx(c, t, bv, x, sy, k, f + which * 7);
  if (his) {
    const q = pose(state, t, bv);
    c.save(); c.translate(x, sy + shake); c.rotate(a); c.scale(k, k); c.translate(0, -FLOOR_Y - bv.jy);
    if (bv.hurtT > 0 && bv.hurtT % 6 < 3) c.globalAlpha = 0.55;
    drawMe(c, q, f, k);
    c.globalAlpha = 1;
    // (a ring clipped: his ass and legs on fire a moment, over the car's back)
    if (bv.burnT > 0) for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      const hgt = 10 + ((f * 3 + i * 7 + sd * 5) % 12) - i * 2;
      box(c, sd * 13 - (5 - i), -34 - hgt - i * 6, (10 - i * 2), hgt + 10, ['#DC2626', '#F97316', '#FDE047'][i]);
    }
    c.restore();
    put(c, panelBack(lane, cave, k), x, sy + shake, k, a);
    c.save(); c.translate(x, sy + shake); if (a) c.rotate(a); c.scale(k, k);
    carLive(c, lane, 0, f, danger, 0, k);
    // (sparks off the rails under him as he lands a hop)
    if (bv.landT > 6) for (let i = 0; i < 8; i++) { const sd = i % 2 ? 1 : -1, u = ((16 - bv.landT) + i * 2) / 10; box(c, sd * (36 + u * 30 + i * 3), 2 - u * 18 + u * u * 10, 3, 3, i % 3 ? '#FDE047' : '#FFFFFF'); }
    c.restore();
    // (a ring gone through clean: a burst of flame round him, out and gone)
    if (bv.through > 0) {
      const u = 1 - bv.through / 30;
      c.globalAlpha = 0.7 * (1 - u); c.strokeStyle = u < 0.5 ? '#FDE047' : '#F97316'; c.lineWidth = Math.max(2, 10 * k * (1 - u));
      c.beginPath(); c.ellipse(x, sy - 90 * k, (60 + u * 140) * k, (70 + u * 150) * k, 0, 0, Math.PI * 2); c.stroke();
      c.globalAlpha = 1;
      for (let i = 0; i < 12; i++) { const an = (i / 12) * Math.PI * 2 + u, rr = (70 + u * 160) * k; box(c, x + Math.cos(an) * rr - 2, sy - 90 * k + Math.sin(an) * rr * 1.1 - 2, 4, 4, i % 2 ? '#FDE047' : '#F97316'); }
    }
  }
};

/** His pose now (meathead.ts). */
const pose = (state: GameState, t: Tragons, bv: Bv): MeQ => {
  const pt = pants(state), hurt = bv.hurtT > 0;
  if (bv.lock) {
    // (the way gravity has him in his car's frame: the view's turned by the roll, so down's turned by it too)
    const a = bv.cam.ang, gx = -Math.sin(a), gy = Math.cos(a);
    const hang = Math.atan2(-gx, gy);
    // (the needle's way is the way he's tipping: hung off that side's rail past the warning)
    const b = bv.lock.bal;
    if (bv.lock.oneOff) return { mode: 'dangle', side: b < 0 ? -1 : 1, hang: hang * 0.4 - Math.sign(b) * 1.1, hurt, ...pt };
    return { mode: 'grip', side: -bv.lock.push, hang: hang * 0.35 - b * 0.9, hurt, ...pt };
  }
  if (bv.fall) return { mode: 'dangle', side: 1, hang: Math.PI * 0.9, hurt: true, ...pt };
  if (bv.jy > 0) return { mode: 'jump', side: 0, hang: 0, hurt, ...pt };
  if (bv.duck) return { mode: 'duck', side: 0, hang: 0, hurt, ...pt };
  if (bv.landT > 0) return { mode: 'land', side: 0, hang: 0, hurt, ...pt };
  return { mode: 'ride', side: 0, hang: 0, hurt, ...pt };
};

const HA: TP = { x: 0, y: 0, phi: 0 }, HB2: TP = { x: 0, y: 0, phi: 0 };
const drawHop = (c: Ctx, state: GameState, t: Tragons, bv: Bv) => {
  const h = bv.hop!, s = t.dist + REAR;
  trackAt(bv.rolls, h.from, s, HA); trackAt(bv.rolls, h.to, s, HB2);
  const u = Math.min(1, h.t / h.dur), e = u * u * (3 - 2 * u);
  const x = HA.x + (HB2.x - HA.x) * e, y = HA.y + (HB2.y - HA.y) * e + Math.sin(Math.PI * u) * HOP_ARC + bv.jy;
  if (!project(bv.cam, x, y, s, SPi)) return;
  // (his shadow on the track under him)
  trackAt(bv.rolls, u < 0.5 ? h.from : h.to, s, HA);
  const sh: SP = { x: 0, y: 0, k: 1 };
  if (project(bv.cam, x, HA.y, s, sh)) { c.globalAlpha = 0.35; c.fillStyle = '#0A0612'; c.beginPath(); c.ellipse(sh.x, sh.y - 24 * sh.k, 30 * sh.k, 7 * sh.k, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  c.save(); c.translate(SPi.x, SPi.y); c.scale(SPi.k, SPi.k); c.translate(0, -FLOOR_Y);
  drawMe(c, { mode: 'hop', side: Math.sign(h.to - h.from), hang: 0, hurt: false, ...pants(state) }, state.frame, SPi.k);
  c.restore();
};

const drawFling = (c: Ctx, state: GameState, bv: Bv) => {
  const g = bv.fling!, k = Math.max(0.2, 1.2 - g.t * 0.012);
  c.save(); c.translate(g.x, g.y); c.rotate(g.rot); c.scale(k, k);
  drawMe(c, { mode: 'fling', side: 0, hang: 0, hurt: true, ...pants(state) }, state.frame, k);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The obstacles

const drawObst = (c: Ctx, t: Tragons, bv: Bv, kind: 'ring' | 'jet' | 'icicles' | 'bar' | 'pylon', lane: Lane, s: number, f: number, half: 'all' | 'back' | 'front' = 'all') => {
  if (bv.trains[lane] && inGap(t, lane, s)) return;
  trackAt(bv.rolls, lane, s, CP);
  if (!project(bv.cam, CP.x, CP.y, s, SPi)) return;
  if (SPi.x < -260 * SPi.k - M || SPi.x > W + 260 * SPi.k + M) return;
  const z = zOf(bv.cam, s), step = hazeStep(z), cave = inTunnel(s);
  if (kind === 'pylon') { drawPylon(c, t, bv, s, step, cave, f); return; }
  // (the ducks: a dark shadow line on the track under them, the bright gap over it)
  if ((kind === 'icicles' || kind === 'jet') && Math.abs(CP.phi) < 0.01) { c.globalAlpha = 0.6; box(c, SPi.x - 42 * SPi.k, SPi.y - 3 * SPi.k, 84 * SPi.k, 4 * SPi.k + 1, '#0A0814'); c.globalAlpha = 1; }
  // (hazed less than the scenery: they stand out from well off)
  const hs = Math.max(0, step - 2);
  if (kind === 'jet') { drawJet(c, SPi.x, SPi.y, SPi.k, -CP.phi, hs, cave, f); return; }
  // (a ring's glow round it, in steps, in the dark brighter)
  if (kind === 'ring' && half !== 'front' && (cave || step < 3)) {
    const cy = SPi.y - (RING_BOTTOM + RING_IN) * SPi.k;
    for (const [rr, al] of [[RING_IN + 44, 0.07], [RING_IN + 26, 0.08]] as const) { c.globalAlpha = al * (cave ? 1.6 : 1); c.fillStyle = '#F97316'; c.beginPath(); c.arc(SPi.x, cy, rr * SPi.k, 0, Math.PI * 2); c.fill(); }
    c.globalAlpha = 1;
  }
  const pic = kind === 'ring' ? ring((f >> 2) % 4, hs, cave, half) : kind === 'icicles' ? icicles(hs, cave) : iceBar(hs, cave);
  put(c, pic, SPi.x, SPi.y, SPi.k, -CP.phi);
  // (the icicles dripping)
  if (kind === 'icicles' && step < 3) for (let i = 0; i < 4; i++) {
    const ph = ((f + i * 23) % 40) / 40, x = SPi.x + (-60 + i * 38) * SPi.k;
    box(c, x, SPi.y - (DUCK_LOW + 4 - ph * 80) * SPi.k, Math.max(1, 2 * SPi.k), Math.max(1, 3 * SPi.k), '#DCF0FE');
  }
};

/** A jagged bolt from (x0, y0) to (x1, y1): purple round a white core. */
const bolt = (c: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, f: number, n = 6) => {
  c.beginPath(); c.moveTo(x0, y0);
  for (let i = 1; i < n; i++) { const u = i / n, j = (((f * 7 + i * 13) % 11) - 5) * w * 1.6; c.lineTo(x0 + (x1 - x0) * u + j, y0 + (y1 - y0) * u); }
  c.lineTo(x1, y1);
  c.lineJoin = 'round';
  for (const [col, lw] of [['#6D28D9', w * 2.6], ['#E9D5FF', w * 1.3], ['#FFFFFF', w * 0.5]] as const) { c.strokeStyle = col; c.lineWidth = Math.max(1, lw); c.stroke(); }
  c.lineJoin = 'miter';
};

/** The wizard's crystal pylon over the LIGHTNING track (what charges the dragon): crackling (more and faster as the
 *  dragon closes on it); the dragon's nose under it, a big arc down onto it. */
const drawPylon = (c: Ctx, t: Tragons, bv: Bv, s: number, step: number, cave: boolean, f: number) => {
  put(c, pylon(step, cave), SPi.x, SPi.y, SPi.k, -CP.phi);
  const z = bv.zap, k = SPi.k, x = SPi.x, y = SPi.y;
  const cy = y - PYLON_CRYSTAL * k;
  const near = z && Math.abs(z.s - s) < 2 ? zapNear(t, bv) : 0;
  // (its glow, in steps, brighter as the dragon comes)
  for (const [rr, al] of [[80, 0.06], [52, 0.08], [30, 0.12]] as const) { c.globalAlpha = (al + 0.12 * near) * (cave ? 1.5 : 1); c.fillStyle = '#C4B5FD'; c.beginPath(); c.arc(x, cy, (rr + 40 * near) * k, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
  if (near > 0.3 && f % 4 < 2) box(c, x - 2 * k, cy - 18 * k, 4 * k, 36 * k, '#FFFFFF');
  // (crackling: arcs off the crystal out to the legs, more and more of them)
  if (z && z.phase === 'tell' && Math.abs(z.s - s) < 2 && f % Math.max(2, Math.round(8 - near * 6)) === 0) {
    const n = 1 + Math.floor(near * 3);
    for (let i = 0; i < n; i++) { const sd = (f + i) % 2 ? 1 : -1; bolt(c, x, cy, x + sd * PYLON_LEG * k, y - (60 + ((f * 5 + i * 17) % 80)) * k, k, f + i * 3, 4); }
  }
  // (the strike: the big arc down onto the dragon's nose)
  if (z && z.flash > 0 && Math.abs(z.s - s) < 2) { bolt(c, x, cy, x + ((f % 3) - 1) * 6 * k, y - 20 * k, 2.6 * k, f, 8); bolt(c, x, cy, x - 30 * k, y - 10 * k, 1.2 * k, f + 5, 6); }
};

/** The FIRE track's duck: the dragon's head on its post, its gout of fire right across the track at head height (a
 *  roaring band in steps, licking, its underside DUCK_LOW up, smoke off its top), glowing. */
const JF = ['#450A0A', '#7A1A1A', '#DC2626', '#F97316', '#FDE047', '#FFF6B0'];
export const drawJet = (c: Ctx, x: number, y: number, k: number, a: number, step: number, cave: boolean, f: number) => {
  c.save(); c.translate(x, y); if (a) c.rotate(a); c.scale(k, k);
  const top = -JET_Y - JET_HH, bot = -DUCK_LOW;
  // (its glow on everything round it)
  c.fillStyle = '#F97316';
  for (const [rx, ry, al] of [[118, 44, 0.06], [96, 30, 0.08]] as const) { c.globalAlpha = al * (cave ? 1.8 : 1); c.beginPath(); c.ellipse(-22, (top + bot) / 2, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
  // (inked, then the band in steps: red outside to white-hot in its middle, widening as it goes; licks along its edges)
  polyF(c, [[66, top + 6], [-110, top - 6], [-110, bot + 6], [66, bot - 4]], INK);
  for (let L = 0; L < 4; L++) {
    const i = L * 4;
    polyF(c, [[64 - L * 2, top + 7 + i * 0.6], [-108 + L * 6, top - 4 + i], [-108 + L * 6, bot + 4 - i], [64 - L * 2, bot - 5 - i * 0.6]], JF[2 + L]);
  }
  for (let i = 0; i < 14; i++) {
    const lx = -104 + i * 12, h = 4 + ((f * 3 + i * 7) % 10);
    box(c, lx, top - h + i * 0.2, 8, h, JF[(i + (f >> 2)) % 2 ? 3 : 4]);
    box(c, lx + 4, bot - 2, 6, 3 + ((f * 5 + i * 3) % 6), JF[3]);
  }
  for (let i = 0; i < 5; i++) { const sx = -100 + ((f * 4 + i * 41) % 150), sy2 = top - 10 - ((f * 2 + i * 13) % 26); c.globalAlpha = 0.4; box(c, sx, sy2, 12, 7, '#44403C'); c.globalAlpha = 1; }
  c.restore();
  put(c, jetPost(step, cave), x, y, k, a);
};

const flamesAt = (c: Ctx, x: number, y: number, k: number, f: number, phi: number) => {
  for (const sd of [-1, 1]) {
    const bx = x + Math.cos(phi) * sd * 36 * k, by = y + Math.sin(phi) * sd * 36 * k;
    for (let i = 0; i < 4; i++) {
      const hgt = (12 + ((f * 3 + i * 7 + sd * 5) % 14)) * k * (1 - i * 0.22);
      box(c, bx - (5 - i) * k, by - hgt, (10 - i * 2.4) * k, hgt, JF[2 + i]);
    }
    if (k > 0.3) { const u = ((f * 2 + sd * 7) % 30) / 30; box(c, bx + Math.sin(f * 0.3 + sd) * 6 * k, by - (30 + u * 50) * k, 2 * k + 1, 2 * k + 1, u < 0.5 ? '#FDE047' : '#F97316'); }
  }
};

const tornEnd = (c: Ctx, x: number, y: number, k: number, f: number) => {
  for (const sd of [-1, 1]) {
    const bx = x + sd * 36 * k;
    polyF(c, [[bx - 6 * k, y], [bx + 6 * k, y], [bx + sd * 14 * k, y - 20 * k], [bx, y - 10 * k]], INK);
    polyF(c, [[bx - 4 * k, y], [bx + 4 * k, y], [bx + sd * 12 * k, y - 18 * k], [bx, y - 9 * k]], '#7A84A0');
  }
  polyF(c, [[x - 10 * k, y], [x + 10 * k, y], [x + 6 * k, y + 22 * k], [x - 8 * k, y + 16 * k]], INK);
  if (f % 6 < 3) for (let i = 0; i < 5; i++) box(c, x + ((f * 7 + i * 13) % 60 - 30) * k, y - ((f * 3 + i * 11) % 30) * k, 3 * k + 1, 3 * k + 1, i % 2 ? '#FDE047' : '#FFFFFF');
};

const zapFx = (c: Ctx, t: Tragons, bv: Bv, x: number, y: number, k: number, f: number) => {
  const z = bv.zap!;
  const live = z.phase === 'live', u = zapNear(t, bv);
  const every = live ? 2 : Math.max(2, Math.round(10 - u * 8));
  if (live) { for (const [rx, al] of [[90, 0.1], [62, 0.14]] as const) { c.globalAlpha = al; c.fillStyle = '#FEF08A'; c.beginPath(); c.ellipse(x, y - 30 * k, rx * k, rx * 0.6 * k, 0, 0, Math.PI * 2); c.fill(); } c.globalAlpha = 1; }
  if (f % every !== 0) return;
  const n = live ? 4 : 1 + Math.floor(u * 3);
  c.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const x0 = x + ((f * 13 + i * 37) % 110 - 55) * k, y0 = y - ((f * 7 + i * 19) % 50) * k;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + 8 * k, y0 - 12 * k); c.lineTo(x0 - 4 * k, y0 - 20 * k); c.lineTo(x0 + 6 * k, y0 - 34 * k);
    c.strokeStyle = '#6D28D9'; c.lineWidth = Math.max(1, 4 * k); c.stroke();
    c.strokeStyle = '#FFFFFF'; c.lineWidth = Math.max(1, 1.6 * k); c.stroke();
  }
  c.lineJoin = 'miter';
};

// ---------------------------------------------------------------------------------------------------------------
// The mountain's lamps

const BQ: SP = { x: 0, y: 0, k: 1 }, BR: SP = { x: 0, y: 0, k: 1 }, BP: TP = { x: 0, y: 0, phi: 0 };
const lamps = (c: Ctx, t: Tragons, bv: Bv) => {
  c.globalAlpha = 0.1;
  for (const tr of bv.trains) {
    if (tr.phase !== 'ok') continue;
    const s = noseS(t.dist);
    trackAt(bv.rolls, tr.lane, s, CP);
    if (!inTunnel(s)) continue;
    if (!project(bv.cam, CP.x, CP.y + 60, s, BQ)) continue;
    trackAt(bv.rolls, tr.lane, s + 700, BP);
    if (!project(bv.cam, BP.x, BP.y + 30, s + 700, BR)) continue;
    polyF(c, [[BQ.x - 20 * BQ.k, BQ.y], [BQ.x + 20 * BQ.k, BQ.y], [BR.x + 90 * BR.k, BR.y + 60 * BR.k], [BR.x - 90 * BR.k, BR.y + 60 * BR.k]], LANE_COL[tr.lane][1]);
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// The side shot (his death on the ride plays in it: deaths.ts, the engine's)

const drawShot = (c: Ctx, state: GameState, t: Tragons, bv: Bv) => {
  const sk = sky();
  box(c, 0, 0, W, H, '#23307A');
  if (sk) c.drawImage(sk, -50, SHOT_LAWN - 120 - SKY_HORIZON, W + 100, SKY_H);
  // (the park far under the ride, the lawn in bands to the bottom)
  const g = '#4E8A3E', g2 = '#5E9A48';
  box(c, 0, SHOT_LAWN - 120, W, 120, hz(g2, 3, false));
  box(c, 0, SHOT_LAWN - 60, W, 60, hz(g, 1, false));
  box(c, 0, SHOT_LAWN, W, H - SHOT_LAWN, g);
  for (let i = 0; i < 4; i++) box(c, 0, SHOT_LAWN + 12 + i * 18, W, 6, g2);
  if (bv.dead === 'splat') return;
  // (the track he was on, side on: its steel box on lattice legs; broken off past the car, if that's what got him)
  const ty = SHOT_CAR.y + 44, end = bv.dead === 'track' ? SHOT_CAR.x + 170 : W;
  box(c, 0, ty, end, 14, INK); box(c, 0, ty + 1, end, 12, mix(LANE_COL[bv.deadLane][0], '#000000', 0.3)); box(c, 0, ty + 1, end, 3, '#C8CCE0');
  for (let x = 40; x < end - 10; x += 120) { box(c, x, ty + 14, 8, SHOT_LAWN - ty - 14, '#36344E'); box(c, x, ty + 14, 3, SHOT_LAWN - ty - 14, '#6C6A88'); }
  if (bv.dead === 'track') polyF(c, [[end, ty], [end + 14, ty + 4], [end + 4, ty + 9], [end + 16, ty + 14], [end, ty + 14]], '#2A2C3A');
  if (bv.dead === 'other') { c.save(); c.translate(SHOT_CAR.x, SHOT_CAR.y); paintCar(c, t.lane, 1, state.frame, {}); c.restore(); }
};

// ---------------------------------------------------------------------------------------------------------------
// Over it all

const WP: TP = { x: 0, y: 0, phi: 0 };
/** Where a track point is really drawn (the view turned), or null off behind. */
const onScreen = (bv: Bv, lane: Lane, s: number, up: number) => {
  trackAt(bv.rolls, lane, s, WP);
  if (!project(bv.cam, WP.x, WP.y + up, s, SPi)) return null;
  return turned(bv, SPi.x, SPi.y);
};
const clampY = (y: number) => Math.max(132, Math.min(H - 90, y));
const clampX = (x: number) => Math.max(34, Math.min(W - 34, x));

export const drawBehindHud = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state), bv = t.bv!, f = state.frame;
  if (!bv.dead) {
    const sCar = t.dist + REAR;
    // ---- the holes coming: a plaque over each track's broken end, a countdown over the dragon going in
    for (const g of t.gaps) {
      if (g.a <= t.dist + NOSE - 2) continue;
      const [main] = LANE_COL[g.lane];
      const left = (g.a - (t.dist + NOSE)) / Math.max(1, t.v), total = Math.max(left, g.w ?? left), kk = Math.max(0, Math.min(1, left / total));
      if (zOf(bv.cam, g.a) < DRAW) { const p = onScreen(bv, g.lane, g.a, 60); if (p) { warnSign(c, clampX(p.x), clampY(p.y), main, f, 11); text(c, 'TRACK OUT', clampX(p.x), clampY(p.y) + 26, main, 6, 'center', true); } }
      if (bv.trains[g.lane].phase === 'ok') {
        const p = onScreen(bv, g.lane, sCar + CAR_L, 150);
        if (p) { countdown(c, clampX(p.x), clampY(p.y), 70, kk, f % 10 < 5 && kk < 0.35 ? '#EF4444' : main, false); text(c, g.lane === t.lane ? 'HOP OFF!' : 'TRACK OUT', clampX(p.x), clampY(p.y) - 6, main, 6, 'center', true); }
      }
    }
    // (only one makes it: SAFE over that one)
    const safe = t.gaps.find(g => g.safe !== undefined && g.a > t.dist + NOSE - 2)?.safe;
    if (safe !== undefined && bv.trains[safe].phase === 'ok') {
      const p = onScreen(bv, safe, sCar + CAR_L, 190);
      if (p) text(c, `SAFE: ${LANE_NAME[safe]}`, clampX(p.x), clampY(p.y) + Math.sin(f * 0.2) * 3, f % 20 < 14 ? '#4ADE80' : '#BBF7D0', 8, 'center', true);
    }
    // ---- the rolls coming: a plaque at each rolling track's start, the countdown over its dragon
    const seen = new Set<number>();
    for (const r of bv.rolls) {
      if (r.s0 <= sCar) continue;
      const left = (r.s0 - sCar) / Math.max(1, t.v), kk = Math.max(0, Math.min(1, left / Math.max(1, r.w)));
      for (const l of r.lanes) {
        const [main] = LANE_COL[l];
        if (zOf(bv.cam, r.s0) < DRAW) { const p = onScreen(bv, l, r.s0, 90); if (p) loopSign(c, clampX(p.x), clampY(p.y), main, f, 'loop', 10); }
        const key = l;
        if (seen.has(key) || bv.trains[l].phase !== 'ok' || left > 300) continue;
        seen.add(key);
        const p = onScreen(bv, l, sCar + CAR_L, 150);
        if (p) { countdown(c, clampX(p.x), clampY(p.y), 70, kk, main, f % 10 < 5 && kk < 0.35); text(c, r.kind, clampX(p.x), clampY(p.y) - 6, main, 6, 'center', true); }
      }
    }
    // ---- the LIGHTNING dragon going live: its countdown, then LIVE! HOP OFF!
    if (bv.zap && bv.trains[0].phase === 'ok') {
      const p = onScreen(bv, 0, sCar + CAR_L, 170);
      if (p) {
        const x = clampX(p.x), y = clampY(p.y);
        if (bv.zap.phase === 'live') text(c, f % 10 < 5 ? 'LIVE! HOP OFF!' : 'LIVE!', x, y, f % 6 < 3 ? '#FFFFFF' : '#FDE047', 8, 'center', true);
        else { const u = zapNear(t, bv); countdown(c, x, y, 70, 1 - u, f % 10 < 5 && u > 0.6 ? '#FFFFFF' : '#FDE047', false); text(c, 'GOING LIVE!', x, y - 6, '#FDE047', 6, 'center', true); }
      }
    }
    // ---- a ring gone through clean: THROUGH!
    if (bv.through > 0) { const hy = turned(bv, bv.me.x, bv.me.y - 150 * bv.me.k); text(c, 'THROUGH!', clampX(hy.x), clampY(hy.y) - (30 - bv.through), bv.through % 6 < 3 ? '#FDE047' : '#FFFFFF', 8, 'center', true); }
    // ---- in a roll: the balance meter, a hand off (red at the edges, in steps)
    if (bv.lock) {
      const L = bv.lock;
      balanceBar(c, L.bal, L.oneOff, L.push, f);
      if (L.oneOff) {
        const a = 0.25 + 0.2 * (f % 12 < 6 ? 1 : 0);
        for (const [w, al] of [[22, a * 0.5], [12, a]] as const) {
          c.fillStyle = `rgba(220, 38, 38, ${al})`;
          c.fillRect(0, 0, W, w); c.fillRect(0, H - w, W, w); c.fillRect(0, w, w, H - 2 * w); c.fillRect(W - w, w, w, H - 2 * w);
        }
        text(c, 'ONE HAND! BALANCE!', W / 2, ARC_Y + 6, f % 8 < 4 ? '#FCA5A5' : '#FFFFFF', 8, 'center', true);
      }
    }
  }
  // (the pylon's strike: a flash)
  if (bv.zap && bv.zap.flash > 8) { c.fillStyle = `rgba(233, 213, 255, ${(bv.zap.flash - 8) * 0.07})`; c.fillRect(0, 0, W, H); }
  drawPa(c, t);
  // ---- the fades (in from the station; out to the unload)
  const fade = Math.max(bv.fadeIn / 16, bv.out / 16);
  if (fade > 0) { c.fillStyle = `rgba(0, 0, 0, ${Math.min(1, fade)})`; c.fillRect(0, 0, W, H); }
};

// ---------------------------------------------------------------------------------------------------------------
// The balance meter (the owner's: "a 'tony hawk' balance meter? curved."): an arc like a rainbow over him in a gilt and
// iron frame (the game's HUD plate look: inked, lit along the top), the safe green at its top through yellow and
// orange to red at its two ends (stepped bands, lit along the outside, shaded inside), the warning zones past BAL_ONE
// marked with rivets, and the needle swinging on a gilt pivot under the arc's middle, his tiny flat-topped head and
// glasses on its tip. Screen space, a few fills.

const ARC_X = W / 2, ARC_Y = 262, ARC_R = 104, ARC_W = 14, ARC_SPAN = 1.05, BANDS = 17;
export const BAR_Y = ARC_Y - ARC_R;
const BAR_COLS = ['#16A34A', '#22C55E', '#4ADE80', '#A3E635', '#FACC15', '#F59E0B', '#F97316', '#EF4444'];
/** The point on the arc u of the way out (-1 the left end, 1 the right), at radius r. */
const arcAt = (u: number, r: number) => { const a = -Math.PI / 2 + u * ARC_SPAN; return { x: ARC_X + Math.cos(a) * r, y: ARC_Y + Math.sin(a) * r }; };
const band = (c: Ctx, u0: number, u1: number, r0: number, r1: number, col: string) => {
  const a = -Math.PI / 2 + u0 * ARC_SPAN, b = -Math.PI / 2 + u1 * ARC_SPAN;
  c.fillStyle = col; c.beginPath(); c.arc(ARC_X, ARC_Y, r1, a, b); c.arc(ARC_X, ARC_Y, r0, b, a, true); c.closePath(); c.fill();
};
const balanceBar = (c: Ctx, bal: number, oneOff: boolean, push: number, f: number) => {
  // (the frame: ink, the iron rim, a gilt edge along its outside)
  band(c, -1.08, 1.08, ARC_R - ARC_W / 2 - 6, ARC_R + ARC_W / 2 + 6, INK);
  band(c, -1.06, 1.06, ARC_R - ARC_W / 2 - 4, ARC_R + ARC_W / 2 + 4, '#36344E');
  band(c, -1.06, 1.06, ARC_R + ARC_W / 2 + 2, ARC_R + ARC_W / 2 + 4, '#D09A30');
  band(c, -1.06, 1.06, ARC_R + ARC_W / 2 + 3, ARC_R + ARC_W / 2 + 4, '#FFF0A8');
  band(c, -1.06, 1.06, ARC_R - ARC_W / 2 - 4, ARC_R - ARC_W / 2 - 2, '#18162A');
  band(c, -1.04, 1.04, ARC_R - ARC_W / 2 - 1, ARC_R + ARC_W / 2 + 1, INK);
  for (let i = 0; i < BANDS; i++) {
    const u0 = -1 + (i * 2) / BANDS, u1 = u0 + 2 / BANDS, far = Math.abs((u0 + u1) / 2);
    const col = BAR_COLS[Math.min(BAR_COLS.length - 1, Math.floor(far * BAR_COLS.length))];
    const hot = far > BAL_ONE && oneOff && f % 8 < 4;
    band(c, u0, u1 + 0.002, ARC_R - ARC_W / 2, ARC_R + ARC_W / 2, hot ? '#FFFFFF' : col);
    band(c, u0, u1 + 0.002, ARC_R + ARC_W / 2 - 3, ARC_R + ARC_W / 2, mix(col, '#FFFFFF', 0.45));
    band(c, u0, u1 + 0.002, ARC_R - ARC_W / 2, ARC_R - ARC_W / 2 + 3, mix(col, '#000000', 0.3));
  }
  // (the warning zones' marks: rivets on the rim; the top's notch)
  for (const s of [-1, 1]) {
    band(c, s * BAL_ONE - 0.012, s * BAL_ONE + 0.012, ARC_R - ARC_W / 2 - 3, ARC_R + ARC_W / 2 + 3, INK);
    const p = arcAt(s * BAL_ONE, ARC_R + ARC_W / 2 + 3);
    c.fillStyle = INK; c.beginPath(); c.arc(p.x, p.y, 3.2, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F2C84A'; c.beginPath(); c.arc(p.x, p.y, 2, 0, Math.PI * 2); c.fill();
    for (const e of [-1.06, 1.06]) { const q = arcAt(e, ARC_R); c.fillStyle = INK; c.beginPath(); c.arc(q.x, q.y, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#D09A30'; c.beginPath(); c.arc(q.x, q.y, 3.5, 0, Math.PI * 2); c.fill(); }
  }
  band(c, -0.012, 0.012, ARC_R + ARC_W / 2 - 4, ARC_R + ARC_W / 2 + 4, '#FFFFFF');
  // (the needle: from its pivot to past the arc, his tiny head on its tip; pushed: an arrow the way he's pushing)
  const u = Math.max(-1.04, Math.min(1.04, bal)), tip = arcAt(u, ARC_R + 16), base = arcAt(u, 26);
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(base.x, base.y); c.lineTo(tip.x, tip.y); c.stroke();
  c.strokeStyle = '#F8FAFC'; c.lineWidth = 3; c.beginPath(); c.moveTo(base.x, base.y); c.lineTo(tip.x, tip.y); c.stroke();
  c.strokeStyle = '#94A3B8'; c.lineWidth = 1; c.beginPath(); c.moveTo(base.x + 1, base.y); c.lineTo(tip.x + 1, tip.y); c.stroke();
  c.lineCap = 'butt';
  c.fillStyle = INK; c.beginPath(); c.arc(base.x, base.y, 6, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#D09A30'; c.beginPath(); c.arc(base.x, base.y, 4.5, 0, Math.PI * 2); c.fill();
  box(c, base.x - 2, base.y - 3, 2, 2, '#FFF0A8');
  const hd = arcAt(u, ARC_R + 26);
  c.fillStyle = INK; c.beginPath(); c.arc(hd.x, hd.y, 9, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#E0AC69'; c.beginPath(); c.arc(hd.x, hd.y, 7.5, 0, Math.PI * 2); c.fill();
  box(c, hd.x - 4, hd.y - 4, 3, 3, '#F5D0A9');
  box(c, hd.x - 8, hd.y - 10, 16, 6, INK); box(c, hd.x - 7, hd.y - 9, 14, 4, '#18181B'); box(c, hd.x - 7, hd.y - 9, 14, 1, '#45454D');
  box(c, hd.x - 8, hd.y - 2, 16, 2, INK); box(c, hd.x - 7, hd.y - 2, 5, 4, INK); box(c, hd.x + 2, hd.y - 2, 5, 4, INK);
  box(c, hd.x - 6, hd.y - 1, 3, 2, '#8EC5E8'); box(c, hd.x + 3, hd.y - 1, 3, 2, '#8EC5E8');
  if (push) { const p = arcAt(u + push * 0.2, ARC_R + 26); polyF(c, [[p.x, p.y - 7], [p.x + push * 9, p.y], [p.x, p.y + 7]], INK); polyF(c, [[p.x, p.y - 5], [p.x + push * 7, p.y], [p.x, p.y + 5]], '#FFFFFF'); }
};

export const behindOn = (state: GameState) => !!tragonsOf(state).bv;
export type { Cam };

// ---------------------------------------------------------------------------------------------------------------
// (dev only) The art sheet: the three dragons' cars at three sizes, every obstacle, a stretch of track and a support,
// for looking at (the headless check reads it)

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __tragonsArtSheet: () => string }).__tragonsArtSheet = () => {
    const cv = document.createElement('canvas'); cv.width = 1500; cv.height = 1180;
    const g = cv.getContext('2d')!;
    g.fillStyle = '#7A9AC8'; g.fillRect(0, 0, cv.width, 560); g.fillStyle = '#4E8A3E'; g.fillRect(0, 560, cv.width, 620);
    const f = 12;
    // (the cars: rear, middle, front, per lane, at 1.2, 0.8 and 0.45)
    [1.2, 0.8, 0.45].forEach((k, ki) => LANES.forEach(l => ([0, 1, 2] as const).forEach(w => {
      const x = 110 + l * 480 + w * 150 * (ki === 0 ? 1 : ki === 1 ? 0.75 : 0.5), y = ki === 0 ? 250 : ki === 1 ? 420 : 530;
      put(g, carBack(l, w, 0, false, false, k), x, y, k);
      g.save(); g.translate(x, y); g.scale(k, k); carLive(g, l, w, f, false, 0, k); g.restore();
    })));
    // (his car's near wall, per lane)
    LANES.forEach(l => put(g, panelBack(l, false, 0.8), 120 + l * 120, 1150, 0.8));
    // (the obstacles)
    put(g, ring(0, 0, false), 520, 880, 1.1);
    put(g, icicles(0, false), 760, 880, 1.1);
    put(g, iceBar(0, false), 950, 880, 1.1);
    drawJet(g, 1060, 880, 1.1, 0, 0, false, f);
    put(g, pylon(0, false), 1330, 880, 1.1);
    // (a step of track per lane, and a support; the cave's ring)
    LANES.forEach(l => { const sp = strip(l, 0, false, l === 0); if (sp) g.drawImage(sp.cv, 40 + l * 100, 620, 80, 120); });
    support(g, 380, 640, 900, 1, 0);
    put(g, ring(2, 0, true), 520, 1160, 0.9);
    return cv.toDataURL('image/png');
  };
}
