// The ride from behind, drawn (screen space, the whole picture: the section's backdrop; the world's layers draw
// nothing while it's on). The sky by the hour and the far off round the horizon; the park's lawn going away in bands
// (the lagoon's water, pines); the three tracks, step by step from the far end in (stamped strips, scaled by depth,
// hazed going away; a step rolled through a loop drawn turned), their supports down to the lawn, the holes (torn ends,
// sparks), FIRE's burning stretches; on them, far to near: the obstacles (rings, icicles, bars), the dragons (from
// behind, the front one's head up), him on his. The mountain: its face with the bore's mouth, the dark inside, its
// ribs and work lamps, the dragons' lamps, the way out. The whole view turned with his car's roll (and the bank).
// Over it (drawBehindHud): the warnings (a plaque at each hole and roll coming, a countdown over the dragon going in,
// SAFE, LIVE), the lean, the PA, the fades. Dead: the side shot his death plays in (ride.ts toShot).

import type { GameState } from '../../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../../m1/constants';
import { box, mix, INK, polyF, hash, type Ctx } from '../../kit';
import { timeOfDay } from '../../../timeOfDay';
import { LANES, LANE_COL, LANE_NAME, type Lane } from '../layout';
import { tragonsOf, type Tragons } from '../state';
import { paintCar } from '../dragon';
import { text, warnSign, loopSign, countdown, drawPa } from '../art';
import {
  SEG, DRAW_N, DRAW, TRACK_HW, REAR, CAR_L, NOSE, FOCAL, ZAP_TELL, TUNNEL,
  trackAt, project, curveX, inTunnel, inLagoon, type TP, type SP, type Cam,
} from './geom';
import { strip, carBack, panelBack, ring, icicles, iceBar, pine, sky, pano, hazeOf, HAZE, SKY_H, SKY_HORIZON, PANO_W, PANO_H, FLOOR_Y, type Placed } from './sprites';
import { drawMeBack, type MeQ } from './meathead';
import { SHOT_CAR, SHOT_LAWN, turned, HOP_ARC } from './ride';
import type { Bv } from './state';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
let M = 700;

/** Puts a picture down at screen (x, y) (its origin), scaled k, turned `a` (canvas radians). */
const put = (c: Ctx, p: Placed | null, x: number, y: number, k: number, a = 0) => {
  if (!p) return;
  if (Math.abs(a) < 0.002) { c.drawImage(p.cv, x + p.x * k, y + p.y * k, p.w * k, p.h * k); return; }
  c.save(); c.translate(x, y); c.rotate(a); c.drawImage(p.cv, p.x * k, p.y * k, p.w * k, p.h * k); c.restore();
};
const hazeStep = (z: number) => Math.min(HAZE - 1, Math.floor((z / DRAW) * HAZE * 1.15));

// ---------------------------------------------------------------------------------------------------------------
// The track ahead, worked out once a frame

interface Row { s: number; z: number; gy: number; ok: boolean[]; p: SP[]; phi: number[]; x: number[]; y: number[] }
const rows: Row[] = Array.from({ length: DRAW_N + 2 }, () => ({ s: 0, z: 0, gy: 0, ok: [false, false, false], p: [0, 1, 2].map(() => ({ x: 0, y: 0, k: 1 })), phi: [0, 0, 0], x: [0, 0, 0], y: [0, 0, 0] }));
const TQ: TP = { x: 0, y: 0, phi: 0 };
const fillRows = (bv: Bv) => {
  const cam = bv.cam, base = Math.floor(cam.s / SEG) * SEG + SEG;
  for (let k = 0; k < rows.length; k++) {
    const r = rows[k];
    r.s = base + k * SEG; r.z = r.s - cam.s;
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

const lawnCols = () => {
  const tod = timeOfDay();
  void tod;
  return { a: '#4E8A3E', b: '#5E9A48', far: '#7A9A80', water: ['#2A6AB0', '#3A82C8'], rock: ['#2A2030', '#4E3E50', '#665464', '#7E6C7A'] };
};

const inGap = (t: Tragons, lane: Lane, s: number) => t.gaps.some(g => g.lane === lane && s >= g.a && s < g.b);

/** The whole picture. */
export const drawBehind = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state), bv = t.bv!;
  if (bv.dead) { drawShot(c, state, t, bv); return; }
  const cam = bv.cam, f = state.frame;
  fillRows(bv);
  const L = lawnCols();
  const camIn = inTunnel(cam.s + 40);
  // (how far past the screen's edges the fills go: only turned does it need the corners covered)
  M = Math.abs(cam.ang) > 0.001 ? 700 : 0;
  c.save();
  c.imageSmoothingEnabled = false;
  // (the view turned with his car's roll and the bank, about the horizon's middle)
  if (Math.abs(cam.ang) > 0.001) { c.translate(W / 2, cam.hy); c.rotate(cam.ang); c.translate(-W / 2, -cam.hy); }
  // ---- the sky, the far off, the lawn's far end (wide enough to cover the corners turned)
  const heading = (curveX(cam.s + 400) - curveX(cam.s)) / 400;
  const drawSkyAll = () => {
    const sk = sky();
    box(c, -M, -M, W + 2 * M, cam.hy + M, '#23307A');
    if (sk) c.drawImage(sk, -300, cam.hy - SKY_HORIZON, W + 600, SKY_H);
    const pv = pano();
    if (pv) {
      const off = (((-heading * 900 - cam.x * 0.03) % PANO_W) + PANO_W) % PANO_W;
      for (let x = -off - PANO_W; x < W + 600; x += PANO_W) c.drawImage(pv, x, cam.hy - PANO_H + 2, PANO_W, PANO_H);
    }
    box(c, -M, cam.hy, W + 2 * M, H + M, L.far);
  };
  if (!camIn) drawSkyAll();
  else box(c, -M, -M, W + 2 * M, H + 2 * M, '#120E1A');

  // ---- the mountain's mouths ahead: the bore to clip the far side into
  const faceS = !camIn && TUNNEL.a > cam.s + 60 && TUNNEL.a < cam.s + DRAW ? TUNNEL.a : null;
  const exitS = camIn && TUNNEL.b < cam.s + DRAW ? TUNNEL.b : null;
  const hole = faceS !== null ? boreRect(bv, faceS) : exitS !== null ? boreRect(bv, exitS) : null;
  let clipped = false;
  if (hole && faceS !== null) {
    c.save(); c.beginPath(); c.rect(hole.x0, hole.y0, hole.x1 - hole.x0, hole.y1 - hole.y0); c.clip(); clipped = true;
    box(c, hole.x0, hole.y0, hole.x1 - hole.x0, hole.y1 - hole.y0, '#120E1A');
  } else if (hole && exitS !== null) {
    c.save(); c.beginPath(); c.rect(hole.x0, hole.y0, hole.x1 - hole.x0, hole.y1 - hole.y0); c.clip(); clipped = true;
    drawSkyAll();
  }

  // ---- what stands on the tracks, far to near
  items.length = 0;
  for (const o of bv.obst) {
    // (gone past his car: out of the picture, or it'd fill the screen between him and the camera)
    if (o.s < t.dist + REAR - 16 || o.s > cam.s + DRAW) continue;
    items.push({ s: o.s, draw: () => drawObst(c, t, bv, o.kind, o.lane, o.s, f) });
  }
  for (const tr of bv.trains) {
    if (tr.phase === 'gone') continue;
    for (let i = 2 as 0 | 1 | 2; i >= 0; i--) {
      const s = t.dist + REAR + i * CAR_L, which = i as 0 | 1 | 2;
      items.push({ s, draw: () => drawCar(c, state, t, bv, tr.lane, which, s) });
    }
  }
  items.sort((a, b) => b.s - a.s);
  let ii = 0;

  // ---- the lawn, the tracks, step by step from the far end in
  for (let k = DRAW_N - 1; k >= 0; k--) {
    const r = rows[k], n = rows[k + 1];
    if (r.z < 24) continue;
    const step = hazeStep(r.z), cave = inTunnel(r.s);
    // (out of the bore's clip once the steps come nearer than the mouth)
    if (clipped && ((faceS !== null && r.s < faceS) || (exitS !== null && r.s < exitS))) {
      c.restore(); clipped = false;
      if (faceS !== null) drawFace(c, bv, faceS, hole!, L.rock);
    }
    // the lawn's band (the lagoon's water; none in the mountain)
    if (!cave && n.z > 24) {
      const y0 = Math.min(r.gy, n.gy), y1 = Math.max(r.gy, n.gy);
      const water = inLagoon(r.s);
      const stripe = Math.floor(r.s / (SEG * 3)) % 2 === 0;
      const col = water ? L.water[stripe ? 0 : 1] : stripe ? L.a : L.b;
      box(c, -M, y0, W + 2 * M, y1 - y0 + 1, hazeOf(col, step, false));
      // (a pine now and then off either side)
      const id = Math.floor(r.s / SEG), h1 = hash(id * 1.37);
      if (!water && h1 < 0.16 && k > 1) {
        const side = hash(id * 2.11) < 0.5 ? -1 : 1, px = curveX(r.s) + side * (480 + hash(id * 3.7) * 700);
        if (project(cam, px, 0, r.s, SPi)) put(c, pine(step), SPi.x, SPi.y, SPi.k * 1.6);
      }
    }
    // the mountain's ribs and work lamps (fixed to the track, going by)
    if (cave && Math.floor(r.s / SEG) % 9 === 0) drawRib(c, bv, r, step);
    for (const l of LANES) {
      if (!r.ok[l] || !n.ok[l] || inGap(t, l, r.s)) continue;
      const a = r.p[l], b = n.p[l];
      // (its supports down to the lawn now and then; none rolled or in the mountain)
      if (!cave && r.z > 760 && Math.abs(r.phi[l]) < 0.01 && Math.floor(r.s / SEG) % 3 === 0 && r.gy > a.y) {
        const w = Math.max(1, 6 * a.k);
        box(c, a.x - w / 2, a.y, w, r.gy - a.y, hazeOf('#36344E', step, false));
        box(c, a.x - w / 2, a.y, Math.max(1, w * 0.3), r.gy - a.y, hazeOf('#6C6A88', step, false));
      }
      const tie = Math.floor(r.s / SEG) % 2 === 0;
      if (Math.abs(r.phi[l]) < 0.01 && Math.abs(n.phi[l]) < 0.01) {
        const y0 = Math.min(a.y, b.y), hh = Math.abs(a.y - b.y) + 1.2;
        const sp = strip(l, step, tie, cave);
        if (sp) c.drawImage(sp.cv, a.x - TRACK_HW * a.k, y0, TRACK_HW * 2 * a.k, hh);
      } else {
        // (rolled: the step turned with the track: a quad, the rails along its edges)
        const ca = Math.cos(r.phi[l]), sa = Math.sin(r.phi[l]), cb = Math.cos(n.phi[l]), sb = Math.sin(n.phi[l]);
        const ax = ca * TRACK_HW * a.k, ay = -sa * TRACK_HW * a.k, bx = cb * TRACK_HW * b.k, by = -sb * TRACK_HW * b.k;
        polyF(c, [[a.x - ax, a.y - ay], [a.x + ax, a.y + ay], [b.x + bx, b.y + by], [b.x - bx, b.y - by]], hazeOf(tie ? '#3A2A22' : mix(LANE_COL[l][0], '#000000', 0.3), step, cave));
        c.strokeStyle = hazeOf('#C8CCE0', step, cave); c.lineWidth = Math.max(1, 4 * a.k);
        c.beginPath(); c.moveTo(a.x - ax, a.y - ay); c.lineTo(b.x - bx, b.y - by); c.moveTo(a.x + ax, a.y + ay); c.lineTo(b.x + bx, b.y + by); c.stroke();
      }
      // (FIRE's burning stretch: flames along the rails)
      if (l === 1 && k % 2 === 0 && bv.burns.some(q => r.s > q.a && r.s < q.b)) flamesAt(c, a.x, a.y, a.k, f + k * 3, r.phi[l]);
      // (a hole's torn end: twisted rails and sparks)
      const g = t.gaps.find(q => q.lane === l && q.a >= r.s - SEG && q.a < r.s);
      if (g) tornEnd(c, a.x, a.y, a.k, f);
    }
    // the things on the track out past this step
    while (ii < items.length && items[ii].s >= r.s) { if (items[ii].s < r.s + SEG * 1.5 || k === DRAW_N - 1) items[ii].draw(); ii++; }
  }
  if (clipped) c.restore();
  while (ii < items.length) { items[ii].draw(); ii++; }
  // (the dragons' lamps in the mountain: a glow ahead of each head)
  if (camIn || faceS !== null) lamps(c, t, bv);
  // (his hop: him in the air between the two)
  if (bv.hop) drawHop(c, state, t, bv);
  c.restore();
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
  const x = SPi.x, sy = SPi.y, k = SPi.k, a = -CP.phi, z = s - bv.cam.s;
  const step = hazeStep(z), cave = inTunnel(s);
  const his = lane === t.lane && which === 0 && !bv.hop && !bv.fling;
  // (a spare's bat wings, beating)
  if (tr.phase === 'arrive' && which === 1) {
    const flap = Math.sin(f * 0.45) * 14;
    for (const sd of [-1, 1]) polyF(c, [[x + sd * 40 * k, sy - 30 * k], [x + sd * 150 * k, sy - (70 + flap) * k], [x + sd * 120 * k, sy - 10 * k]], LANE_COL[lane][2]);
  }
  put(c, carBack(lane, which, step, cave), x, sy, k, a);
  // (the LIGHTNING dragon going live: its tell (sparks crawling over it, flashing faster), then live (arcs all over it))
  if (lane === 0 && bv.zap && tr.phase === 'ok') zapFx(c, bv, x, sy, k, f + which * 7);
  if (his) {
    const q = pose(state, t, bv);
    c.save(); c.translate(x, sy); c.rotate(a); c.scale(k, k); c.translate(0, -FLOOR_Y - bv.jy);
    if (bv.hurtT > 0 && bv.hurtT % 6 < 3) c.globalAlpha = 0.55;
    drawMeBack(c, q, f);
    c.restore();
    put(c, panelBack(lane), x, sy, k, a);
  }
};

/** His pose now (meathead.ts). */
const pose = (state: GameState, t: Tragons, bv: Bv): MeQ => {
  const pt = pants(state), hurt = bv.hurtT > 0;
  if (bv.lock) {
    // (the way gravity has him in his car's frame: the view's turned by the roll, so down's turned by it too)
    const a = bv.cam.ang, gx = -Math.sin(a), gy = Math.cos(a);
    const hang = Math.atan2(-gx, gy);
    if (bv.lock.oneOff) return { mode: 'dangle', side: gx < 0 ? -1 : 1, hang, hurt, ...pt };
    const leanIn = bv.lock.want !== 0 && bv.lock.lean === bv.lock.want;
    return { mode: 'grip', side: bv.lock.lean, hang: hang * (leanIn ? 0.3 : 0.8), hurt, ...pt };
  }
  if (bv.fall) return { mode: 'dangle', side: 1, hang: Math.PI * 0.9, hurt: true, ...pt };
  if (bv.jy > 0) return { mode: 'jump', side: 0, hang: 0, hurt, ...pt };
  if (bv.duck) return { mode: 'duck', side: 0, hang: 0, hurt, ...pt };
  return { mode: 'ride', side: 0, hang: 0, hurt, ...pt };
};

const HA: TP = { x: 0, y: 0, phi: 0 }, HB2: TP = { x: 0, y: 0, phi: 0 };
const drawHop = (c: Ctx, state: GameState, t: Tragons, bv: Bv) => {
  const h = bv.hop!, s = t.dist + REAR;
  trackAt(bv.rolls, h.from, s, HA); trackAt(bv.rolls, h.to, s, HB2);
  const u = Math.min(1, h.t / h.dur), e = u * u * (3 - 2 * u);
  const x = HA.x + (HB2.x - HA.x) * e, y = HA.y + (HB2.y - HA.y) * e + Math.sin(Math.PI * u) * HOP_ARC + bv.jy;
  if (!project(bv.cam, x, y, s, SPi)) return;
  c.save(); c.translate(SPi.x, SPi.y); c.scale(SPi.k, SPi.k); c.translate(0, -FLOOR_Y);
  drawMeBack(c, { mode: 'hop', side: Math.sign(h.to - h.from), hang: 0, hurt: false, ...pants(state) }, state.frame);
  c.restore();
};

const drawFling = (c: Ctx, state: GameState, bv: Bv) => {
  const g = bv.fling!, k = Math.max(0.2, 1.2 - g.t * 0.012);
  c.save(); c.translate(g.x, g.y); c.rotate(g.rot); c.scale(k, k);
  drawMeBack(c, { mode: 'fling', side: 0, hang: 0, hurt: true, ...pants(state) }, state.frame);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The obstacles

const drawObst = (c: Ctx, t: Tragons, bv: Bv, kind: 'ring' | 'icicles' | 'bar', lane: Lane, s: number, f: number) => {
  if (bv.trains[lane] && inGap(t, lane, s)) return;
  trackAt(bv.rolls, lane, s, CP);
  if (!project(bv.cam, CP.x, CP.y, s, SPi)) return;
  const z = s - bv.cam.s, step = hazeStep(z), cave = inTunnel(s);
  const pic = kind === 'ring' ? ring((f >> 2) % 4, step, cave) : kind === 'icicles' ? icicles(step, cave) : iceBar(step, cave);
  put(c, pic, SPi.x, SPi.y, SPi.k, -CP.phi);
  // (a ring's glow in the dark)
  if (kind === 'ring' && (cave || step < 3)) { c.globalAlpha = 0.12; c.fillStyle = '#F97316'; c.beginPath(); c.arc(SPi.x, SPi.y - 64 * SPi.k, 80 * SPi.k, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
};

const flamesAt = (c: Ctx, x: number, y: number, k: number, f: number, phi: number) => {
  const F = ['#DC2626', '#F97316', '#FDE047'];
  for (const sd of [-1, 1]) {
    const bx = x + Math.cos(phi) * sd * TRACK_HW * k, by = y + Math.sin(phi) * sd * TRACK_HW * k;
    for (let i = 0; i < 3; i++) {
      const hgt = (10 + ((f * 3 + i * 7 + sd * 5) % 12)) * k * (1 - i * 0.25);
      box(c, bx - (4 - i) * k, by - hgt, (8 - i * 2) * k, hgt, F[i]);
    }
  }
};

const tornEnd = (c: Ctx, x: number, y: number, k: number, f: number) => {
  for (const sd of [-1, 1]) {
    const bx = x + sd * TRACK_HW * k;
    polyF(c, [[bx - 5 * k, y], [bx + 5 * k, y], [bx + sd * 10 * k, y - 16 * k], [bx, y - 8 * k]], '#2A2C3A');
  }
  if (f % 6 < 3) for (let i = 0; i < 4; i++) box(c, x + ((f * 7 + i * 13) % 60 - 30) * k, y - ((f * 3 + i * 11) % 30) * k, 3 * k + 1, 3 * k + 1, i % 2 ? '#FDE047' : '#FFFFFF');
  // (the drop beyond: dark)
};

const zapFx = (c: Ctx, bv: Bv, x: number, y: number, k: number, f: number) => {
  const z = bv.zap!;
  const live = z.phase === 'live', u = live ? 1 : z.t / ZAP_TELL;
  const every = live ? 2 : Math.max(2, Math.round(10 - u * 8));
  if (f % every !== 0) return;
  const n = live ? 4 : 1 + Math.floor(u * 3);
  for (let i = 0; i < n; i++) {
    const x0 = x + ((f * 13 + i * 37) % 110 - 55) * k, y0 = y - ((f * 7 + i * 19) % 50) * k;
    c.strokeStyle = '#6D28D9'; c.lineWidth = Math.max(1, 4 * k);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + 8 * k, y0 - 12 * k); c.lineTo(x0 - 4 * k, y0 - 20 * k); c.lineTo(x0 + 6 * k, y0 - 34 * k); c.stroke();
    c.strokeStyle = '#FFFFFF'; c.lineWidth = Math.max(1, 2 * k); c.stroke();
  }
  if (live) { c.globalAlpha = 0.2; c.fillStyle = '#FEF08A'; c.beginPath(); c.ellipse(x, y - 30 * k, 80 * k, 50 * k, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
};

// ---------------------------------------------------------------------------------------------------------------
// The mountain

const BP: TP = { x: 0, y: 0, phi: 0 }, BQ: SP = { x: 0, y: 0, k: 1 }, BR: SP = { x: 0, y: 0, k: 1 };
/** The bore's mouth at s, on screen: round all three tracks, from under them to well over. */
const boreRect = (bv: Bv, s: number) => {
  trackAt(bv.rolls, 0, s, BP); const x0 = BP.x - 150, y0 = BP.y;
  trackAt(bv.rolls, 2, s, BP); const x1 = BP.x + 150;
  const top = Math.max(y0, BP.y) + 300, bot = Math.min(y0, BP.y) - 90;
  project(bv.cam, x0, top, s, BQ); project(bv.cam, x1, bot, s, BR);
  return { x0: BQ.x, y0: BQ.y, x1: BR.x, y1: BR.y, k: BQ.k };
};
const drawFace = (c: Ctx, bv: Bv, s: number, hole: ReturnType<typeof boreRect>, R: string[]) => {
  // (the fake mountain's face: rock from the lawn up past the top of the screen, the mouth cut out of it)
  const gy = bv.cam.hy + bv.cam.y * (FOCAL / (s - bv.cam.s)), k = hole.k;
  const peak = hole.y0 - 600 * k;
  c.fillStyle = R[2];
  c.beginPath();
  c.moveTo(-700, gy); c.lineTo(-700, peak + 200 * k); c.lineTo(W / 2 - 500 * k, peak + 60 * k); c.lineTo(W / 2 - 120 * k, peak); c.lineTo(W / 2 + 200 * k, peak + 90 * k); c.lineTo(W + 700, peak + 220 * k); c.lineTo(W + 700, gy); c.closePath();
  c.rect(hole.x1, hole.y0, hole.x0 - hole.x1, hole.y1 - hole.y0);
  c.fill('evenodd');
  // (bands of rock, lit along their tops; the mouth's frame: plaster blocks, a gilt keystone)
  for (let i = 1; i < 5; i++) box(c, -700, peak + i * 120 * k, W + 1400, 3 * k + 1, R[3]);
  box(c, hole.x0 - 10 * k, hole.y0 - 14 * k, hole.x1 - hole.x0 + 20 * k, 14 * k, R[1]);
  box(c, hole.x0 - 10 * k, hole.y0 - 14 * k, 10 * k, hole.y1 - hole.y0 + 14 * k, R[1]);
  box(c, hole.x1, hole.y0 - 14 * k, 10 * k, hole.y1 - hole.y0 + 14 * k, R[1]);
  box(c, (hole.x0 + hole.x1) / 2 - 12 * k, hole.y0 - 22 * k, 24 * k, 22 * k, '#D09A30');
};
const drawRib = (c: Ctx, bv: Bv, r: Row, step: number) => {
  const hole = boreRect(bv, r.s);
  const col = hazeOf('#4E3E50', step, true);
  const w = Math.max(2, 10 * hole.k);
  box(c, hole.x0, hole.y0, hole.x1 - hole.x0, w, col);
  box(c, hole.x0, hole.y0, w, hole.y1 - hole.y0, col);
  box(c, hole.x1 - w, hole.y0, w, hole.y1 - hole.y0, col);
  // (a caged work lamp at the top)
  const lx = (hole.x0 + hole.x1) / 2, lw = Math.max(2, 10 * hole.k);
  box(c, lx - lw / 2, hole.y0 + w, lw, lw * 1.2, step > 3 ? '#8A6A30' : '#FFE6A0');
  if (step < 4) { c.globalAlpha = 0.1; c.fillStyle = '#FFE6A0'; c.beginPath(); c.arc(lx, hole.y0 + w, 60 * hole.k, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
};
const lamps = (c: Ctx, t: Tragons, bv: Bv) => {
  c.globalAlpha = 0.14;
  for (const tr of bv.trains) {
    if (tr.phase !== 'ok') continue;
    const s = t.dist + NOSE;
    trackAt(bv.rolls, tr.lane, s, CP);
    if (!inTunnel(s)) continue;
    if (!project(bv.cam, CP.x, CP.y + 60, s, BQ)) continue;
    trackAt(bv.rolls, tr.lane, s + 700, BP);
    if (!project(bv.cam, BP.x, BP.y + 30, s + 700, BR)) continue;
    c.fillStyle = LANE_COL[tr.lane][1];
    polyF(c, [[BQ.x - 20 * BQ.k, BQ.y], [BQ.x + 20 * BQ.k, BQ.y], [BR.x + 90 * BR.k, BR.y + 60 * BR.k], [BR.x - 90 * BR.k, BR.y + 60 * BR.k]], LANE_COL[tr.lane][1]);
  }
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// The side shot (his death on the ride plays in it: deaths.ts, the engine's)

const drawShot = (c: Ctx, state: GameState, t: Tragons, bv: Bv) => {
  const sk = sky(), pv = pano();
  box(c, 0, 0, W, H, '#23307A');
  if (sk) c.drawImage(sk, -50, SHOT_LAWN - 120 - SKY_HORIZON, W + 100, SKY_H);
  if (pv) { c.drawImage(pv, -200, SHOT_LAWN - 118 - PANO_H, PANO_W, PANO_H); }
  // (the park far under the ride, the lawn in bands to the bottom)
  const L = lawnCols();
  box(c, 0, SHOT_LAWN - 120, W, 120, hazeOf(L.b, 3, false));
  box(c, 0, SHOT_LAWN - 60, W, 60, hazeOf(L.a, 1, false));
  box(c, 0, SHOT_LAWN, W, H - SHOT_LAWN, L.a);
  for (let i = 0; i < 4; i++) box(c, 0, SHOT_LAWN + 12 + i * 18, W, 6, L.b);
  if (bv.dead === 'splat') return;
  // (the track he was on, side on: its steel box on lattice legs; broken off past the car, if that's what got him)
  const ty = SHOT_CAR.y + 44, end = bv.dead === 'track' ? SHOT_CAR.x + 170 : W;
  box(c, 0, ty, end, 14, INK); box(c, 0, ty + 1, end, 12, mix(LANE_COL[bv.deadLane][0], '#000000', 0.3)); box(c, 0, ty + 1, end, 3, '#C8CCE0');
  for (let x = 40; x < end - 10; x += 120) { box(c, x, ty + 14, 8, SHOT_LAWN - ty - 14, '#36344E'); box(c, x, ty + 14, 3, SHOT_LAWN - ty - 14, '#6C6A88'); }
  if (bv.dead === 'track') polyF(c, [[end, ty], [end + 14, ty + 4], [end + 4, ty + 9], [end + 16, ty + 14], [end, ty + 14]], '#2A2C3A');
  // (anything else killed him: on his dragon's back, the middle car under him)
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
      if (g.a < bv.cam.s + DRAW) { const p = onScreen(bv, g.lane, g.a, 60); if (p) { warnSign(c, clampX(p.x), clampY(p.y), main, f, 11); text(c, 'TRACK OUT', clampX(p.x), clampY(p.y) + 26, main, 6, 'center', true); } }
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
        if (r.s0 < bv.cam.s + DRAW) { const p = onScreen(bv, l, r.s0, 90); if (p) loopSign(c, clampX(p.x), clampY(p.y), main, f, 'loop', 10); }
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
        else { countdown(c, x, y, 70, 1 - bv.zap.t / ZAP_TELL, f % 10 < 5 && bv.zap.t > ZAP_TELL * 0.6 ? '#FFFFFF' : '#FDE047', false); text(c, 'GOING LIVE!', x, y - 6, '#FDE047', 6, 'center', true); }
      }
    }
    // ---- in a roll: the lean (a big arrow the way to lean), a hand off (red at the edges)
    if (bv.lock) {
      const L = bv.lock;
      if (L.want !== 0) {
        const x = W / 2 + L.want * 150, y = bv.me.y - 70, ok = L.lean === L.want;
        const col = ok ? '#4ADE80' : f % 10 < 5 ? '#FFFFFF' : '#FDE047';
        polyF(c, [[x - L.want * 22, y - 18], [x + L.want * 14, y], [x - L.want * 22, y + 18]], INK);
        polyF(c, [[x - L.want * 19, y - 13], [x + L.want * 9, y], [x - L.want * 19, y + 13]], col);
        text(c, 'LEAN', x - L.want * 6, y + 30, col, 7, 'center', true);
      }
      if (L.oneOff) {
        const a = 0.25 + 0.2 * (f % 12 < 6 ? 1 : 0);
        c.fillStyle = `rgba(220, 38, 38, ${a})`;
        c.fillRect(0, 0, W, 18); c.fillRect(0, H - 18, W, 18); c.fillRect(0, 0, 18, H); c.fillRect(W - 18, 0, 18, H);
        text(c, 'ONE HAND! LEAN!', W / 2, bv.me.y - 130, f % 8 < 4 ? '#FCA5A5' : '#FFFFFF', 8, 'center', true);
      }
    }
  }
  drawPa(c, t);
  // ---- the fades (in from the station; out to the unload)
  const fade = Math.max(bv.fadeIn / 16, bv.out / 16);
  if (fade > 0) { c.fillStyle = `rgba(0, 0, 0, ${Math.min(1, fade)})`; c.fillRect(0, 0, W, H); }
};

export const behindOn = (state: GameState) => !!tragonsOf(state).bv;
export type { Cam };
