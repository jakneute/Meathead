// Truelling Tragons, drawn (crude first pass: flat colors in a few steps, readable shapes). The sky and the castle
// going by (rising and sinking with the drops); the park far below, the lagoon, the fake mountain; the three tracks
// (steel box beams with their lane's stripe, no lit tops: not to stand on), their pylons dimmed, through the loops,
// corkscrews and the helix; the holes (bent, broken ends); the dragons (three cars each, along their track: the head up
// over the front car, the tail curled up off the back, the back lit along its top with a grab rail over it), going over
// a broken end, or coming down onto the track on bat wings (a spare); each lane's obstacles; the breath at the near
// misses; the load station and the unload, the suitors glimpsed off the train ahead.
//
// THE DEPTH (layout.ts, track.ts): everything on a track is put at that track's depth there about the scene's one eye
// (cars.ts / track.ts proj: what the ride's physics stands him on too), scaled with it, and drawn far to near: what's
// nearer than his dragon goes over him (drawTragonsFront), the rest under (drawTragonsBack). Culled by where it lands on
// the screen, never by where it'd be flat (no pop-in).
//
// Over it all in screen space: the dark inside the mountain (his dragons' lamps soft through it), the warnings (a
// flashing sign at every hole and loop coming, in its lane's color, an arrow at the edge while it's off the screen, a
// countdown over the dragon that's going into it, SAFE over the one that won't), the PA's words in the top band.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, topBand } from '../../../m1/constants';
import { saidOver, box, groundBox, ledgeBox } from '../section';
import { storySign, fairySky, mix, INK, type Ctx } from '../kit';
import { drawCastleAt, MONUMENT_AT } from '../monument';
import { RIVALS } from '../glen/rivals';
import { drawUnloadRivals } from './rivals';
import {
  GY, TL, CAR, S0X, STATION_X, GATE_X, LOCK, END_S, DECK_X0, DECK_X1, EXIT_X, LANES, LANE_COL, LANE_NAME, TUNNEL, LAGOON,
  wxOf, rearX, type Lane,
} from './layout';
import { trackPt, proj, spinAt, type Pt } from './track';
import { roofSpan } from './cars';
import { tragonsOf, type Tragons, type Obst, type Train, type Car } from './state';
import { toScreen, viewOf, deckY, hisTrainD, UNLOAD_SPOTS, FRAME_TOP, FRAME_BOT } from './ride';

/** Under a dragon's roof: its wheels on the rail this far down. */
const RAIL = 48;
const FONT = '"Press Start 2P"';

/** What of the world's on screen as drawn. */
const viewBox = (state: GameState) => state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
const inView = (state: GameState, x0: number, x1: number, m = 80) => { const v = viewBox(state); return x1 > v.x - m && x0 < v.x + v.w + m; };
const boxIn = (state: GameState, x0: number, y0: number, x1: number, y1: number, m = 60) => { const v = viewBox(state); return x1 > v.x - m && x0 < v.x + v.w + m && y1 > v.y - m && y0 < v.y + v.h + m; };
/** The station's offset (it goes off the left as the ride gets going; back where it was on a revisit). */
const stationShift = (t: Tragons) => (t.phase === 'done' ? 0 : Math.max(0, t.dist - LOCK));
/** How far the track's come along under the world (for things on the ground going by). */
const groundS = (t: Tragons) => (t.phase === 'done' ? 0 : t.dist);
/** Far off: into the haze (toward the sky's blue-grey); near: a step darker. */
const fog = (col: string, d: number) => (d < 1 ? mix(col, '#8A9AC4', Math.min(0.55, (1 - d) * 1.4)) : d > 1 ? mix(col, '#000000', Math.min(0.3, (d - 1) * 0.6)) : col);

// ---------------------------------------------------------------------------------------------------------------
// Screen space: the sky

export const drawTragonsBackdrop = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state);
  // (the far hills going by with the ride; the castle drifting across as it goes, sinking as the ride climbs and
  // rising up as it drops)
  const virt = { ...state, camera: { ...state.camera, x: state.camera.x + groundS(t) * 0.6 } } as GameState;
  fairySky(c, virt, null, { near: '#2A2E4A' });
  const at = MONUMENT_AT.tragons, k = Math.min(1, t.dist / END_S);
  const lift = t.cam.on > 0 ? Math.max(-80, Math.min(140, (viewOf(state).cy - (GY - 480)) * -0.1)) : 0;
  drawCastleAt(c, Math.round(at.from + (at.to - at.from) * k), at.base + lift, at.k, state.frame);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// World space

/** The park far below: grass, paths, flower beds and lamp posts going by; the station's stone floor; the lagoon. */
const drawGround = (c: Ctx, state: GameState, t: Tragons) => {
  const v = viewBox(state), sh = stationShift(t), gs = groundS(t);
  if (v.y + v.h < GY - 40) return;
  const end = GATE_X + 30 - sh;
  groundBox(c, v.x - 40, v.x + v.w + 40, GY, '#3E5A34', '#6E9A50');
  if (end > v.x) groundBox(c, Math.max(v.x - 40, STATION_X - 600 - sh), Math.min(end, v.x + v.w + 40), GY, '#5A5466', '#B8B0C8');
  const step = 260, first = Math.floor((v.x + gs - 200) / step) * step;
  for (let s = first; s < v.x + v.w + gs + 200; s += step) {
    const x = s - gs;
    if (x < end + 20) continue;
    const n = Math.abs(Math.floor(s / step)) % 5;
    if (n === 0 || n === 3) { box(c, x, GY + 6, 70, 10, '#6B3A2A'); for (let i = 0; i < 6; i++) box(c, x + 4 + i * 11, GY + 3, 6, 6, ['#F472B6', '#FDE047', '#A78BFA'][i % 3]); }
    if (n === 1) { box(c, x, GY - 70, 4, 70, '#2E2A3A'); box(c, x - 4, GY - 78, 12, 9, '#FDE68A'); }
    if (n === 4) box(c, x - 30, GY + 20, 120, 6, '#8A7A5A');
  }
  // (the lagoon at the bottom of the splashdown: water across the park, ripples, a lily pad or two)
  if (t.phase !== 'done') {
    const a = wxOf(t.dist, LAGOON.a), b = wxOf(t.dist, LAGOON.b);
    if (inView(state, a, b)) {
      box(c, a, GY - 6, b - a, 60, '#1E3A8A'); box(c, a, GY - 6, b - a, 4, '#7DD3FC'); box(c, a, GY - 2, b - a, 3, '#3B82F6');
      for (let x = a + 30; x < b - 30; x += 90) { const w = 20 + ((x * 7) % 30); box(c, x + ((state.frame >> 3) % 6), GY + 8 + ((x >> 4) % 3) * 8, w, 2, '#60A5FA'); }
      for (let x = a + 120; x < b - 60; x += 340) { c.fillStyle = '#16A34A'; c.beginPath(); c.ellipse(x, GY - 3, 12, 4, 0, 0, Math.PI * 2); c.fill(); box(c, x + 2, GY - 9, 4, 4, '#F9A8D4'); }
    }
  }
};

/** THE FAKE MOUNTAIN (a painted plaster peak, snow on top: no crater, no lava, a coaster's mountain): behind the
 *  tracks, far back, the tracks diving into its tunnel mouths. */
const drawMountain = (c: Ctx, state: GameState, t: Tragons) => {
  const d = 0.92, mid = (TUNNEL.a + TUNNEL.b) / 2;
  const base = proj(t.eye, wxOf(t.dist, mid), GY, d), w = (TUNNEL.b - TUNNEL.a + 900) * d, h = 1250 * d;
  if (!boxIn(state, base.x - w / 2, base.y - h, base.x + w / 2, base.y)) return;
  const x0 = base.x - w / 2, x1 = base.x + w / 2, top = base.y - h;
  const rock = fog('#6B5A64', d), rockD = fog('#4A3C48', d), snow = fog('#F1F5F9', d);
  c.fillStyle = INK; c.beginPath(); c.moveTo(x0 - 4, base.y); c.lineTo(base.x - w * 0.12, top - 4); c.lineTo(base.x + w * 0.06, top + h * 0.08); c.lineTo(x1 + 4, base.y); c.closePath(); c.fill();
  c.fillStyle = rock; c.beginPath(); c.moveTo(x0, base.y); c.lineTo(base.x - w * 0.12, top); c.lineTo(base.x + w * 0.06, top + h * 0.1); c.lineTo(x1, base.y); c.closePath(); c.fill();
  // (the shaded side, stepped)
  c.fillStyle = rockD; c.beginPath(); c.moveTo(base.x - w * 0.12, top); c.lineTo(base.x + w * 0.06, top + h * 0.1); c.lineTo(x1, base.y); c.lineTo(base.x + w * 0.1, base.y); c.closePath(); c.fill();
  // (the snow cap, its ragged edge)
  c.fillStyle = snow; c.beginPath(); c.moveTo(base.x - w * 0.12, top);
  const sx0 = base.x - w * 0.2, sy = top + h * 0.2;
  c.lineTo(base.x + w * 0.05, top + h * 0.11); c.lineTo(base.x + w * 0.02, sy - 20 * d);
  for (let k = 0; k < 6; k++) c.lineTo(base.x - k * w * 0.03, sy + (k % 2 ? 24 : -6) * d);
  c.lineTo(sx0, sy + 10 * d); c.closePath(); c.fill();
  // (plaster seams, a painted waterfall, a maintenance door: it's fake)
  c.strokeStyle = rockD; c.lineWidth = 2 * d;
  for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(x0 + k * w * 0.15, base.y); c.lineTo(x0 + k * w * 0.15 + 40 * d, base.y - h * 0.3); c.stroke(); }
  box(c, base.x - w * 0.3, top + h * 0.45, 18 * d, h * 0.4, fog('#93C5FD', d));
  box(c, base.x + w * 0.3, base.y - 70 * d, 34 * d, 70 * d, fog('#3A3A3A', d)); box(c, base.x + w * 0.3 + 4 * d, base.y - 66 * d, 26 * d, 62 * d, fog('#71717A', d));
};

/** A run of track on a lane (s0..s1), at its depths: the points, each off the roof along its normal (rolled), its
 *  pylons down to the park at their own depth (not under a loop). */
const P: Pt = { x: 0, y: 0, d: 1, roll: 0 };
const trackRun = (t: Tragons, lane: Lane, s0: number, s1: number) => {
  const pts: { x: number; y: number; d: number }[] = [];
  let prev: { x: number; y: number } | null = null;
  for (let s = s0; s <= s1 + 0.01; s += 16) {
    trackPt(t.spins, t.dist, lane, s, P);
    const m = proj(t.eye, P.x, P.y, P.d);
    const nx = trackPt(t.spins, t.dist, lane, s + 6, { x: 0, y: 0, d: 1, roll: 0 });
    const n = proj(t.eye, nx.x, nx.y, nx.d);
    const a = Math.atan2(n.y - m.y, n.x - m.x), off = RAIL * P.d * Math.cos(P.roll);
    pts.push({ x: m.x - Math.sin(a) * off, y: m.y + Math.cos(a) * off, d: P.d });
    prev = m;
  }
  void prev;
  return pts;
};

const drawChunk = (c: Ctx, state: GameState, t: Tragons, lane: Lane, s0: number, s1: number) => {
  const [main, light, dark] = LANE_COL[lane];
  const gaps = t.gaps.filter(g => g.lane === lane && g.b > s0 && g.a < s1);
  const pts = trackRun(t, lane, s0, s1);
  if (!pts.length) return;
  const dm = pts[Math.floor(pts.length / 2)].d;
  // (pylons: every 420 of track, down to the park at their depth; none under a hole or a loop)
  const gy = t.eye.y + (GY - t.eye.y) * dm, post = fog(mix('#3A3550', '#7A8AB4', 0.25), dm);
  for (let s = Math.ceil(s0 / 420) * 420, i = 0; s < s1; s += 420, i++) {
    if (gaps.some(g => s >= g.a - 40 && s < g.b + 40) || spinAt(t.spins, lane, s)) continue;
    const k = Math.round((s - s0) / 16), p = pts[Math.min(pts.length - 1, k)];
    if (p.y > gy) continue;
    box(c, p.x - 4 * dm, p.y + 6 * dm, 8 * dm, gy - p.y - 6 * dm, post);
    c.strokeStyle = post; c.lineWidth = 3 * dm; c.beginPath();
    for (let yy = p.y + 30 * dm; yy < gy - 20 * dm; yy += 70 * dm) { c.moveTo(p.x - 18 * dm, yy); c.lineTo(p.x + 18 * dm, yy + 35 * dm); }
    c.stroke();
  }
  // (the beam, its holes left out)
  const runs: { x: number; y: number }[][] = [];
  let cur: { x: number; y: number }[] = [];
  pts.forEach((p, i) => {
    const s = s0 + i * 16;
    if (gaps.some(g => s >= g.a && s < g.b)) { if (cur.length) runs.push(cur); cur = []; return; }
    cur.push(p);
  });
  if (cur.length) runs.push(cur);
  c.lineJoin = 'round'; c.lineCap = 'round';
  for (const run of runs) {
    if (run.length < 2) continue;
    const line = (w: number, col: string) => { c.strokeStyle = col; c.lineWidth = Math.max(1, w * dm); c.beginPath(); run.forEach(({ x, y }, i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); };
    line(14, INK); line(10, fog(mix(dark, '#000000', 0.35), dm)); line(4, fog(main, dm)); line(1.5, fog(mix(light, dark, 0.5), dm));
  }
  c.lineCap = 'butt';
  // (the broken ends: torn steel, bent down, sparking)
  for (const g of gaps) for (const [s, dir] of [[g.a, 1], [g.b, -1]] as [number, number][]) {
    if (s < s0 || s >= s1) continue;
    const p = pts[Math.min(pts.length - 1, Math.round((s - s0) / 16))];
    c.strokeStyle = mix(dark, '#000000', 0.3); c.lineWidth = 6 * dm;
    c.beginPath(); c.moveTo(p.x - dir * 4 * dm, p.y + 3 * dm); c.lineTo(p.x + dir * 18 * dm, p.y + 22 * dm); c.lineTo(p.x + dir * 12 * dm, p.y + 40 * dm); c.stroke();
    if (state.frame % 10 < 3) box(c, p.x + dir * 10 * dm, p.y + 20 * dm, 3, 3, '#FDE047');
  }
  // (the tunnel's mouths: dark arches the track goes into)
  for (const s of [TUNNEL.a, TUNNEL.b]) {
    if (s < s0 || s >= s1 || t.phase === 'done') continue;
    const p = pts[Math.min(pts.length - 1, Math.round((s - s0) / 16))];
    c.fillStyle = fog('#3A2E36', dm); c.beginPath(); c.ellipse(p.x, p.y - 30 * dm, 62 * dm, 110 * dm, 0, Math.PI, 0); c.lineTo(p.x + 62 * dm, p.y + 20 * dm); c.lineTo(p.x - 62 * dm, p.y + 20 * dm); c.fill();
    c.fillStyle = '#0B0612'; c.beginPath(); c.ellipse(p.x, p.y - 26 * dm, 48 * dm, 96 * dm, 0, Math.PI, 0); c.lineTo(p.x + 48 * dm, p.y + 16 * dm); c.lineTo(p.x - 48 * dm, p.y + 16 * dm); c.fill();
  }
};

/** A dragon's car at the origin (its roof's middle at 0,0, the front off to +x): car 0 the rear (its tail), 2 the
 *  front (the head). `danger` its side lights flashing red; `wings` (a spare coming down) bat wings beating; `char`
 *  burnt black. */
export const paintCar = (c: Ctx, lane: Lane, i: number, f: number, opts: { danger?: boolean; wings?: boolean; char?: boolean } = {}) => {
  const [main0, light0, dark0] = LANE_COL[lane];
  const ch = (col: string) => (opts.char ? mix(col, '#140C08', 0.85) : col);
  const main = ch(main0), light = ch(light0), dark = ch(dark0);
  const x = -CAR / 2;
  if (opts.wings && i === 1) {
    const a = Math.sin(f * 0.45) * 0.6;
    for (const side of [-1, 1]) {
      c.save(); c.translate(side * 30, -6); c.rotate(side * (0.4 + a));
      c.fillStyle = INK; c.beginPath(); c.moveTo(0, 0); c.lineTo(side * 150, -60); c.lineTo(side * 120, -10); c.lineTo(side * 90, -30); c.lineTo(side * 60, 4); c.closePath(); c.fill();
      c.fillStyle = mix(dark, '#000000', 0.2); c.beginPath(); c.moveTo(4 * side, -2); c.lineTo(side * 144, -56); c.lineTo(side * 118, -12); c.lineTo(side * 90, -28); c.lineTo(side * 62, 0); c.closePath(); c.fill();
      c.restore();
    }
  }
  if (i === 0) {
    // (the tail: curled up off the back)
    c.fillStyle = INK; c.beginPath(); c.moveTo(x + 14, 6); c.quadraticCurveTo(x - 26, 4, x - 18, -26); c.lineTo(x - 8, -24); c.quadraticCurveTo(x - 12, -4, x + 14, -6); c.closePath(); c.fill();
    c.fillStyle = main; c.beginPath(); c.moveTo(x + 12, 3); c.quadraticCurveTo(x - 22, 2, x - 16, -22); c.lineTo(x - 10, -21); c.quadraticCurveTo(x - 12, -6, x + 12, -3); c.closePath(); c.fill();
    box(c, x, -24, 12, 24, INK); box(c, x + 1, -23, 10, 22, main); box(c, x + 1, -23, 10, 2, light);
  }
  // (the car: its scaled body, the lights down the side, the wheels on the rail)
  box(c, x + 3, -1, CAR - 6, 44, INK);
  box(c, x + 4, 0, CAR - 8, 42, dark);
  box(c, x + 4, 0, CAR - 8, 20, main);
  for (let r = 0; r < 2; r++) for (let k = 0; k < 7; k++) { c.fillStyle = mix(main, light, 0.35); c.beginPath(); c.arc(x + 12 + k * 12 + r * 6, 8 + r * 8, 4, 0, Math.PI); c.fill(); }
  for (let k = 0; k < 4; k++) {
    const on = opts.danger ? f % 12 < 6 : (f / 6 + k + i * 4) % 8 < 4;
    box(c, x + 14 + k * 22, 28, 6, 6, opts.char ? '#1C1917' : opts.danger ? (on ? '#EF4444' : '#450A0A') : on ? light : mix(dark, '#000000', 0.3));
  }
  for (const wx of [x + 18, x + CAR - 18]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, 44, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#71717A'; c.beginPath(); c.arc(wx, 44, 4, 0, Math.PI * 2); c.fill(); }
  // (the dragon's back, lit along its top: where he stands; the grab rail over it on its posts (dim: not a step))
  box(c, x + 2, -3, CAR - 4, 4, INK); box(c, x + 3, -2, CAR - 6, 3, light);
  const rail = opts.char ? '#292524' : '#8A6A2A';
  for (const px of [x + 12, x + CAR / 2, x + CAR - 12]) box(c, px - 1, -16, 2, 14, rail);
  box(c, x + 8, -17, CAR - 16, 3, rail);
  if (i === 2) {
    // (the head: the neck up off the front, the head out ahead, horns, an eye; its breath)
    const hx = x + CAR - 16;
    box(c, hx - 1, -47, 18, 47, INK); box(c, hx, -46, 16, 46, main); box(c, hx, -46, 16, 3, light);
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx, -50); c.lineTo(hx + 44, -42); c.lineTo(hx + 48, -30); c.lineTo(hx + 22, -24); c.lineTo(hx, -26); c.closePath(); c.fill();
    c.fillStyle = main; c.beginPath(); c.moveTo(hx + 1, -48); c.lineTo(hx + 42, -41); c.lineTo(hx + 45, -31); c.lineTo(hx + 22, -26); c.lineTo(hx + 1, -28); c.closePath(); c.fill();
    box(c, hx + 22, -32, 22, 3, dark);
    c.fillStyle = light; c.beginPath(); c.moveTo(hx + 4, -48); c.lineTo(hx - 8, -64); c.lineTo(hx + 10, -50); c.fill();
    c.beginPath(); c.moveTo(hx + 12, -47); c.lineTo(hx + 6, -62); c.lineTo(hx + 18, -47); c.fill();
    box(c, hx + 24, -44, 5, 4, opts.char ? '#F8FAFC' : opts.danger && f % 12 < 6 ? '#EF4444' : '#FEF08A');
    if (!opts.char && f % 30 < 14) {
      const bx = hx + 50, by = -36;
      if (lane === 1) for (let k = 0; k < 3; k++) box(c, bx + k * 6, by - 2 + ((f + k) % 3), 5, 4, ['#FDE047', '#F97316', '#DC2626'][k]);
      else if (lane === 2) for (let k = 0; k < 3; k++) box(c, bx + k * 7, by - k * 2, 5, 5, '#E0F2FE');
      else { c.strokeStyle = '#FEF08A'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 6, by - 6); c.lineTo(bx + 10, by + 2); c.lineTo(bx + 18, by - 4); c.stroke(); }
    }
  }
};

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

/** An obstacle on the track, its back (the posts, the towers, the clouds: behind) or its front (what hurts), at the
 *  origin (its foot on the track's top), drawn at its depth; `gl` the park's level, there (local). */
const drawObst = (c: Ctx, state: GameState, t: Tragons, o: Obst, front: boolean) => {
  const f = state.frame;
  const at = trackPt(t.spins, t.dist, o.lane, o.s, { x: 0, y: 0, d: 1, roll: 0 }), pp = proj(t.eye, at.x, at.y, at.d), d = at.d;
  const gl = (t.eye.y + (GY - t.eye.y) * d - pp.y) / d;
  const [main] = LANE_COL[o.lane];
  const post = fog(mix('#3A3550', '#7A8AB4', 0.2), d);
  if (o.kind === 'live') {
    if (front) return;
    // (the rail live along its length: glowing, sparks crawling along it)
    for (let s = o.s; s < o.s + o.len; s += 20) {
      const q = trackPt(t.spins, t.dist, o.lane, s, { x: 0, y: 0, d: 1, roll: 0 }), p = proj(t.eye, q.x, q.y, q.d);
      box(c, p.x, p.y + (RAIL - 3) * q.d, 20 * q.d, 6 * q.d, f % 6 < 3 ? '#FEF08A' : main);
      if ((s / 20 + f) % 9 === 0) { c.strokeStyle = '#FFFFFF'; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x, p.y + (RAIL - 4) * q.d); c.lineTo(p.x + 4, p.y + (RAIL - 14) * q.d); c.lineTo(p.x + 9, p.y + (RAIL - 8) * q.d); c.stroke(); }
    }
    const tr = t.trains[o.lane];
    if (tr.phase === 'ok' && t.dist + TL > o.s && t.dist < o.s + o.len) for (const k of tr.cars) for (let n = 0; n < 2; n++) {
      const x = k.x + (((f * 13 + n * 47) % CAR) - CAR / 2) * k.d;
      c.strokeStyle = '#FEF08A'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, k.y); c.lineTo(x + 4, k.y - 10 * k.d); c.lineTo(x - 2, k.y - 16 * k.d); c.stroke();
    }
    return;
  }
  c.save(); c.translate(pp.x, pp.y); c.scale(d, d);
  switch (o.kind) {
    case 'ring':
      if (!front) { box(c, -3, -20, 6, RAIL + 20, post); break; }
      c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.ellipse(0, 2, 13, 56, 0, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#B45309'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 2, 13, 56, 0, 0, Math.PI * 2); c.stroke();
      for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 + f * 0.05, fx = Math.cos(a) * 13, fy = 2 + Math.sin(a) * 56; box(c, fx - 3, fy - 6 - ((f + k * 3) % 6), 6, 8, ['#FDE047', '#F97316', '#DC2626'][(k + (f >> 2)) % 3]); }
      break;
    case 'icicles':
      if (!front) { box(c, -46, -124, 6, 124 + RAIL, post); box(c, 40, -124, 6, 124 + RAIL, post); break; }
      box(c, -48, -128, 96, 12, INK); box(c, -47, -127, 94, 10, '#BAE6FD'); box(c, -47, -127, 94, 3, '#F0F9FF');
      for (let k = 0; k < 9; k++) {
        const x = -40 + k * 10, len = 58 + ((k * 7) % 4) * 6;
        c.fillStyle = INK; c.beginPath(); c.moveTo(x - 4, -117); c.lineTo(x + 4, -117); c.lineTo(x, -117 + len + 2); c.fill();
        c.fillStyle = k % 2 ? '#E0F2FE' : '#7DD3FC'; c.beginPath(); c.moveTo(x - 3, -117); c.lineTo(x + 3, -117); c.lineTo(x, -117 + len); c.fill();
      }
      break;
    case 'arc':
      if (!front) { box(c, -30, -124, 6, 124 + RAIL, post); box(c, 24, -124, 6, 124 + RAIL, post); break; }
      box(c, -34, -128, 68, 10, INK); box(c, -33, -127, 66, 8, '#52525B');
      for (const cx of [-26, 26]) { c.fillStyle = INK; c.beginPath(); c.arc(cx, -130, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#C4B5FD'; c.beginPath(); c.arc(cx, -130, 6, 0, Math.PI * 2); c.fill(); }
      for (let k = 0; k < 3; k++) {
        c.strokeStyle = k === 1 ? '#FFFFFF' : f % 4 < 2 ? main : '#C4B5FD'; c.lineWidth = k === 1 ? 2 : 3;
        c.beginPath(); let y = -118; c.moveTo(-6 + k * 6, y);
        while (y < -46) { y += 10; c.lineTo(-6 + k * 6 + ((((f + y + k * 7) >> 2) % 3) - 1) * 6, Math.min(y, -46)); }
        c.stroke();
      }
      break;
    case 'jet':
      if (!front) { box(c, -8, 2, 16, RAIL - 2, INK); box(c, -7, 3, 14, RAIL - 4, '#57534E'); break; }
      for (let k = 0; k < 8; k++) { const h = 18 + ((f * 3 + k * 11) % 14); box(c, -12 + k * 3, -h, 4, h, ['#DC2626', '#F97316', '#FDE047'][(k + (f >> 1)) % 3]); }
      break;
    case 'bar':
      if (!front) { box(c, -12, -30, 6, 30 + RAIL, post); box(c, 6, -30, 6, 30 + RAIL, post); break; }
      box(c, -9, -29, 18, 24, INK); box(c, -8, -28, 16, 22, '#7DD3FC'); box(c, -8, -28, 16, 4, '#F0F9FF');
      break;
    case 'tower': {
      if (front) break;
      const top = -150;
      box(c, -22, top, 44, gl - top, fog(mix('#4A3A3A', '#7A8AB4', 0.2), d));
      box(c, -26, top - 6, 52, 10, INK);
      const glow = t.trains[o.lane].phase === 'ok' && o.shots < 2 && (f - o.lastShot) % 52 > 30;
      c.fillStyle = INK; c.beginPath(); c.moveTo(14, top - 6); c.lineTo(-40, top - 22); c.lineTo(-44, top - 8); c.lineTo(14, top + 2); c.fill();
      c.fillStyle = main; c.beginPath(); c.moveTo(12, top - 6); c.lineTo(-38, top - 20); c.lineTo(-41, top - 9); c.lineTo(12, top); c.fill();
      if (glow) { c.fillStyle = '#FDE047'; c.beginPath(); c.arc(-40, top - 14, 6, 0, Math.PI * 2); c.fill(); }
      box(c, -18, top - 18, 4, 4, '#FEF08A');
      break;
    }
    case 'cannon': {
      if (front) break;
      const y = -54;
      box(c, -6, y + 8, 12, gl - y, fog(mix('#3A4A5A', '#7A8AB4', 0.2), d));
      box(c, -30, y - 9, 42, 18, INK); box(c, -29, y - 8, 40, 16, '#E0F2FE'); box(c, -29, y - 8, 40, 4, '#FFFFFF');
      box(c, -32, y - 6, 4, 12, '#1E3A8A');
      if (f - o.lastShot < 10) for (let k = 0; k < 4; k++) box(c, -40 - k * 6, y - 6 + k * 3, 6, 6, '#F8FAFC');
      break;
    }
    case 'cloud': {
      if (front) break;
      const y = -250;
      for (const [dx, r] of [[-40, 26], [-10, 34], [26, 28], [50, 20]]) { c.fillStyle = '#3B2A5A'; c.beginPath(); c.arc(dx, y, r, 0, Math.PI * 2); c.fill(); }
      for (const [dx, r] of [[-30, 18], [0, 22], [30, 16]]) { c.fillStyle = f % 40 < 3 ? '#C4B5FD' : '#5B4A8A'; c.beginPath(); c.arc(dx, y - 6, r, 0, Math.PI * 2); c.fill(); }
      break;
    }
  }
  c.restore();
};
const obstD = (t: Tragons, o: Obst) => trackPt(t.spins, t.dist, o.lane, o.s, { x: 0, y: 0, d: 1, roll: 0 }).d;

/** What's flying: fireballs (their target ring on the roof), strikes (the glow, the bolt), snowballs. */
const drawShot = (c: Ctx, state: GameState, t: Tragons, q: Tragons['shots'][number]) => {
  const f = state.frame, tr = t.trains[q.lane], d = tr.cars[1]?.d ?? 1;
  if (q.kind === 'fireball') {
    const u = q.t / q.dur, gy = q.ty ?? q.sy + 400;
    if (tr.phase === 'ok') { c.strokeStyle = f % 8 < 4 ? '#F97316' : '#FDE047'; c.lineWidth = 3; c.beginPath(); c.ellipse(q.tx, gy - 2, 34 * d * (1 - u * 0.5), 6 * d, 0, 0, Math.PI * 2); c.stroke(); }
    const x = q.sx + (q.tx - q.sx) * u, y = q.sy + (gy - q.sy) * u - Math.sin(Math.PI * u) * 110 * d;
    c.fillStyle = INK; c.beginPath(); c.arc(x, y, 12 * d, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F97316'; c.beginPath(); c.arc(x, y, 10 * d, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FDE047'; c.beginPath(); c.arc(x - 2, y - 2, 5 * d, 0, Math.PI * 2); c.fill();
  } else if (q.kind === 'strike') {
    if (tr.phase !== 'ok') return;
    const u = q.t / q.dur, gy = q.ty ?? 0;
    if (q.t < q.dur - 6) { c.strokeStyle = f % 6 < 3 ? '#FACC15' : '#FFFFFF'; c.lineWidth = 3; c.beginPath(); c.ellipse(q.tx, gy - 2, 26 * d * (1.2 - u * 0.6), 6 * d, 0, 0, Math.PI * 2); c.stroke(); }
    else {
      c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; c.beginPath(); let y = gy - 330 * d; c.moveTo(q.tx, y);
      while (y < gy) { y += 30 * d; c.lineTo(q.tx + ((y * 7) % 30) - 15, Math.min(y, gy)); }
      c.stroke(); c.strokeStyle = '#FACC15'; c.lineWidth = 2; c.stroke();
    }
  } else {
    c.fillStyle = INK; c.beginPath(); c.arc(q.sx, q.sy, 10 * d, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(q.sx, q.sy, 9 * d, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#BAE6FD'; c.beginPath(); c.arc(q.sx + 2, q.sy + 3, 4 * d, 0, Math.PI * 2); c.fill();
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
    const h = tr.cars[2], m = { x: h.x + Math.cos(h.a) * 80 * h.d - Math.sin(h.a) * -36 * h.d, y: h.y + Math.sin(h.a) * 80 * h.d + Math.cos(h.a) * -36 * h.d };
    const [w, mid, deep] = BREATH_COL[lane];
    if (k < 50) {
      // (the tell: the mouth glowing brighter and brighter)
      const r = (4 + k * 0.18) * h.d;
      c.fillStyle = deep; c.beginPath(); c.arc(m.x, m.y, r + 3, 0, Math.PI * 2); c.fill();
      c.fillStyle = f % 6 < 3 ? w : mid; c.beginPath(); c.arc(m.x, m.y, r, 0, Math.PI * 2); c.fill();
      continue;
    }
    if (k > 86) continue;
    // (the stream: from its mouth across his dragon's back, at his head)
    const { x0, x1 } = roofSpan(to), ty = (to.cars[0].y + to.cars[2].y) / 2 - 62 * to.cars[1].d;
    for (let n = 0; n < 26; n++) {
      const u = ((n * 37 + k * 9) % 100) / 100, tx = x0 + (x1 - x0) * ((n * 13) % 26) / 26;
      const x = m.x + (tx - m.x) * u, y = m.y + (ty - m.y) * u + Math.sin(n + f * 0.4) * 10 * u;
      const r = (3 + u * 9) * to.cars[1].d;
      c.fillStyle = [w, mid, deep][n % 3]; c.fillRect(x - r / 2, y - r / 2, r, r);
    }
  }
};

/** The load station: the hall behind (dimmed), the board, its signs, the gate (shut till the ride goes). */
const drawStation = (c: Ctx, state: GameState, t: Tragons) => {
  const sh = stationShift(t), x0 = STATION_X - 500 - sh, x1 = GATE_X + 60 - sh;
  if (!inView(state, x0, x1 + 200)) return;
  const wall = mix('#3A2A4A', '#7A8AB4', 0.25), trim = mix('#6A4A2A', '#7A8AB4', 0.2);
  box(c, x0, GY - 560, x1 - x0, 560, wall);
  for (let x = x0 + 40; x < x1 - 60; x += 120) { box(c, x, GY - 520, 70, 140, mix(wall, '#000000', 0.3)); c.fillStyle = mix(wall, '#000000', 0.3); c.beginPath(); c.arc(x + 35, GY - 520, 35, Math.PI, 0); c.fill(); }
  box(c, x0 - 10, GY - 580, x1 - x0 + 20, 24, trim);
  ([1, 2, 0] as Lane[]).forEach((lane, i) => {
    const hx = x0 + 160 + i * 220, hy = GY - 610, [main, light] = LANE_COL[lane];
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 40, hy + 30); c.lineTo(hx + 40, hy + 10); c.lineTo(hx + 46, hy + 28); c.lineTo(hx - 40, hy + 40); c.fill();
    c.fillStyle = main; c.beginPath(); c.moveTo(hx - 38, hy + 30); c.lineTo(hx + 38, hy + 12); c.lineTo(hx + 43, hy + 27); c.lineTo(hx - 38, hy + 38); c.fill();
    box(c, hx + 16, hy + 14, 5, 4, light);
  });
  storySign(c, STATION_X + 60 - sh, GY, ['TRUELLING TRAGONS', 'THREE DRAGONS. NO SEATS.'], { tall: 170 });
  if (t.phase === 'done') storySign(c, S0X + 140 - sh, GY, ['RIDE CLOSED', 'TRACK DAMAGE'], { warn: true, tall: 120, big: 1 });
  else storySign(c, S0X - 150 - sh, GY, ['NO FIREARMS', 'ON THE DRAGONS'], { warn: true, tall: 120, big: 1 });
  const gx = GATE_X - sh, open = t.phase !== 'load';
  if (!open) {
    box(c, gx, GY - 320, 20, 320, INK);
    for (let y = GY - 316; y < GY; y += 4) box(c, gx + 2, y, 16, 1, '#2E2A3A');
    for (let k = 0; k < 4; k++) box(c, gx + 2 + k * 5, GY - 330, 3, 330, '#4A445A');
    for (let k = 0; k < 4; k++) { c.fillStyle = '#E0AE3A'; c.beginPath(); c.moveTo(gx + 3 + k * 5, GY - 338); c.lineTo(gx + k * 5, GY - 330); c.lineTo(gx + 6 + k * 5, GY - 330); c.fill(); }
  } else { box(c, gx - 2, GY - 320, 6, 320, INK); box(c, gx - 1, GY - 318, 4, 316, '#4A445A'); }
};

/** The unload: decks a lane (lit along their tops: off the dragons' fronts and down), the hall, the signs, the way out
 *  to the castle's base. */
const drawUnload = (c: Ctx, state: GameState, t: Tragons) => {
  const ux = wxOf(t.dist, END_S + TL) + 2, off = ux - DECK_X0;
  if (!inView(state, ux - 300, EXIT_X + off + 300)) return;
  const wall = mix('#3A2A4A', '#7A8AB4', 0.25);
  box(c, ux - 120, GY - 620, DECK_X1 - DECK_X0 + 240, 620, wall);
  box(c, ux - 130, GY - 640, DECK_X1 - DECK_X0 + 260, 24, mix('#6A4A2A', '#7A8AB4', 0.2));
  for (const lane of LANES) {
    const w = DECK_X1 - DECK_X0 - (2 - lane) * 80, y = deckY(lane);
    box(c, ux + 20, y + 14, 8, GY - y - 14, mix('#2E2A3A', '#7A8AB4', 0.2));
    ledgeBox(c, ux, y, w, mix(LANE_COL[lane][2], '#2A2A34', 0.5), LANE_COL[lane][1]);
  }
  storySign(c, ux + 360, GY, ['UNLOAD', 'EXIT TO THY RIGHT'], { tall: 130 });
  storySign(c, EXIT_X - 200 + off, GY, ["THE GREAT PIXIE'S CASTLE", 'THIS WAY >'], { tall: 150, board: '#2E5A3A' });
  const ex = EXIT_X + off;
  box(c, ex - 10, GY - 260, 140, 260, INK); box(c, ex - 6, GY - 256, 132, 256, mix('#6A6478', '#7A8AB4', 0.2));
  box(c, ex + 20, GY - 190, 72, 190, '#120A1E'); c.fillStyle = '#120A1E'; c.beginPath(); c.arc(ex + 56, GY - 190, 36, Math.PI, 0); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// Back to front, split at his dragon's depth

type Item = { d: number; draw: () => void };
const items = (c: Ctx, state: GameState, t: Tragons): { back: Item[]; front: Item[] } => {
  const v = viewBox(state), back: Item[] = [], front: Item[] = [];
  const dHis = hisTrainD(state);
  const put = (d: number, draw: () => void, mineFront = false) => (mineFront || d > dHis + 0.004 ? front : back).push({ d, draw });
  // (the track that's on screen: wide enough for the farthest depth and a loop's swing either side)
  const ex = t.eye.x, lo = ex + (v.x - ex) / 0.62, hi = ex + (v.x + v.w - ex) / 0.62;
  const s0 = Math.max(-900, Math.floor((lo - rearX(t.dist) + t.dist - 500) / 192) * 192), s1 = hi - rearX(t.dist) + t.dist + 500;
  for (const lane of LANES) for (let s = s0; s < s1; s += 192) {
    const m = trackPt(t.spins, t.dist, lane, s + 96, { x: 0, y: 0, d: 1, roll: 0 }), p = proj(t.eye, m.x, m.y, m.d);
    if (!boxIn(state, p.x - 420 * m.d, p.y - 480 * m.d, p.x + 420 * m.d, Math.max(p.y, GY) + 80)) continue;
    // (the track's always a hair behind the dragon on it)
    put(m.d - 0.002, () => drawChunk(c, state, t, lane, s, s + 192));
  }
  for (const tr of t.trains) put(trainD(tr), () => drawTrain(c, state, t, tr));
  const his = t.hop ? t.hop.to : t.lane;
  for (const o of t.obst) {
    const d = obstD(t, o);
    put(d - 0.003, () => drawObst(c, state, t, o, false));
    put(d, () => drawObst(c, state, t, o, true), o.lane === his);
  }
  for (const q of t.shots) put(trainD(t.trains[q.lane]) + 0.001, () => drawShot(c, state, t, q), q.lane === his);
  if (t.breath) put(9, () => drawBreath(c, state, t), true);
  back.sort((a, b) => a.d - b.d); front.sort((a, b) => a.d - b.d);
  return { back, front };
};

export const drawTragonsBack = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state);
  drawGround(c, state, t);
  drawStation(c, state, t);
  drawUnload(c, state, t);
  drawUnloadRivals(c, state, t, UNLOAD_SPOTS);
  // (the fake mountain: far back, behind every track whatever their depth)
  if (t.phase !== 'done') drawMountain(c, state, t);
  for (const it of items(c, state, t).back) it.draw();
};

export const drawTragonsFront = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state);
  for (const it of items(c, state, t).front) it.draw();
};

// ---------------------------------------------------------------------------------------------------------------
// Screen space: the dark in the mountain, the warnings, the PA, the suitors' words

/** A flashing warning sign (a triangle in the lane's color, the !), its middle at (x, y). */
const warnSign = (c: Ctx, x: number, y: number, col: string, f: number, r = 15) => {
  const on = f % 16 < 10;
  c.fillStyle = INK; c.beginPath(); c.moveTo(x, y - r - 3); c.lineTo(x + r + 4, y + r * 0.8 + 2); c.lineTo(x - r - 4, y + r * 0.8 + 2); c.closePath(); c.fill();
  c.fillStyle = on ? col : mix(col, '#000000', 0.4); c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y + r * 0.8); c.lineTo(x - r, y + r * 0.8); c.closePath(); c.fill();
  c.fillStyle = INK; c.fillRect(x - 2, y - r * 0.45, 4, r * 0.75); c.fillRect(x - 2, y + r * 0.42, 4, 4);
};
/** A loop's sign: a round sign in the lane's color with the loop drawn on it (a corkscrew: a coil; the helix: three). */
const loopSign = (c: Ctx, x: number, y: number, col: string, f: number, kind: string, r = 15) => {
  const on = f % 16 < 10;
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 3, 0, Math.PI * 2); c.fill();
  c.fillStyle = on ? col : mix(col, '#000000', 0.4); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = INK; c.lineWidth = 3;
  if (kind === 'cork' || kind === 'braid') { c.beginPath(); for (let k = 0; k <= 24; k++) { const u = k / 24, xx = x - r * 0.7 + u * r * 1.4, yy = y + Math.sin(u * Math.PI * 4) * r * 0.45; if (k) c.lineTo(xx, yy); else c.moveTo(xx, yy); } c.stroke(); }
  else { c.beginPath(); c.arc(x, y - 2, r * 0.45, 0.5 * Math.PI + 0.4, 2.5 * Math.PI - 0.4); c.stroke(); c.beginPath(); c.moveTo(x - r * 0.7, y + r * 0.5); c.lineTo(x + r * 0.7, y + r * 0.5); c.stroke(); }
};
const text = (c: Ctx, s: string, x: number, y: number, col: string, size = 7, align: CanvasTextAlign = 'center') => {
  c.font = `${size}px ${FONT}`; c.textAlign = align;
  c.fillStyle = '#000'; c.fillText(s, x + 1, y + 1); c.fillStyle = col; c.fillText(s, x, y);
  c.textAlign = 'left';
};
const KIND_WORD: Record<string, string> = { loop: 'LOOP', cork: 'CORKSCREW', chain: 'LOOP', braid: 'HELIX', chain3: 'LOOP' };

/** Over a dragon's top, on screen (kept out from under the HUD and off the top). */
const overTrain = (state: GameState, tr: Train, up: number) => {
  const top = Math.min(...tr.cars.map(k => k.y - up * k.d)), mx = tr.cars[1].x;
  const p = toScreen(state, mx, top);
  return { x: Math.max(60, Math.min(CANVAS_WIDTH - 60, p.x)), y: Math.max(FRAME_TOP + 8, Math.min(FRAME_BOT - 12, p.y)) };
};

let dark: HTMLCanvasElement | null = null;
/** Inside the mountain: dark, but for his dragons' lamps (their heads, soft round them) and a glow round him. */
const drawDark = (c: Ctx, state: GameState, t: Tragons) => {
  const mid = t.dist + TL / 2, a = TUNNEL.a + 60, b = TUNNEL.b - 60;
  if (t.phase !== 'ride' || mid < a - 200 || mid > b + 200 || typeof document === 'undefined') return;
  const k = Math.min(1, (mid - (a - 200)) / 260, (b + 200 - mid) / 260) * 0.78;
  dark ??= document.createElement('canvas');
  if (dark.width !== CANVAS_WIDTH) { dark.width = CANVAS_WIDTH; dark.height = CANVAS_HEIGHT; }
  const g = dark.getContext('2d')!;
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  g.fillStyle = `rgba(6, 3, 14, ${k})`; g.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  g.globalCompositeOperation = 'destination-out';
  const hole = (x: number, y: number, r: number) => { const gr = g.createRadialGradient(x, y, r * 0.2, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,0.9)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  const s = viewOf(state).k;
  for (const tr of t.trains) { if (tr.phase !== 'ok' || !tr.cars.length) continue; const h = toScreen(state, tr.cars[2].x + 60 * tr.cars[2].d, tr.cars[2].y - 30); hole(h.x, h.y, 130 * s); const m = toScreen(state, tr.cars[1].x, tr.cars[1].y - 30); hole(m.x, m.y, 110 * s); }
  const p = state.player, pp = toScreen(state, p.pos.x + p.width / 2, p.pos.y + p.height / 2); hole(pp.x, pp.y, 90 * s);
  g.globalCompositeOperation = 'source-over';
  c.drawImage(dark, 0, 0);
};

export const drawTragonsHud = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state), f = state.frame;
  drawDark(c, state, t);
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
      text(c, 'TRACK OUT', sx, sy + 28, main, 6);
      if (off && f % 16 < 10) text(c, '>>', sx + 22, sy + 4, main, 8, 'left');
      const tr = t.trains[g.lane];
      if (tr.phase === 'ok' && tr.cars.length) {
        const p = overTrain(state, tr, 92);
        const bw = 90, k = Math.max(0, Math.min(1, left / total));
        box(c, p.x - bw / 2 - 2, p.y - 2, bw + 4, 10, INK);
        box(c, p.x - bw / 2, p.y, bw * k, 6, f % 10 < 5 && k < 0.35 ? '#EF4444' : main);
        warnSign(c, p.x - bw / 2 - 14, p.y + 3, main, f, 8);
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
      text(c, KIND_WORD[q.kind], sx, sy + 28, main, 6);
      if (off && f % 16 < 10) text(c, '>>', sx + 22, sy + 4, main, 8, 'left');
      const tr = t.trains[q.lane];
      if (tr.phase === 'ok' && tr.cars.length) {
        const p = overTrain(state, tr, 112);
        const bw = 90;
        box(c, p.x - bw / 2 - 2, p.y - 2, bw + 4, 10, INK);
        box(c, p.x - bw / 2, p.y, bw * k, 6, f % 10 < 5 && k < 0.35 ? '#FFFFFF' : main);
        loopSign(c, p.x - bw / 2 - 14, p.y + 3, main, f, q.kind, 8);
        text(c, `${LANE_NAME[q.lane]} ${KIND_WORD[q.kind]}`, p.x, p.y - 6, main, 6);
      }
    }
    // (only one dragon makes it: SAFE over that one)
    const safe = t.gaps.find(g => g.safe !== undefined && g.a > t.dist + TL - 2)?.safe;
    if (safe !== undefined && t.trains[safe].phase === 'ok' && t.trains[safe].cars.length) {
      const p = overTrain(state, t.trains[safe], 128);
      const bob = Math.sin(f * 0.2) * 3;
      text(c, `SAFE: ${LANE_NAME[safe]}`, p.x, p.y + bob, f % 20 < 14 ? '#4ADE80' : '#BBF7D0', 8);
      c.fillStyle = '#4ADE80'; c.beginPath(); c.moveTo(p.x - 7, p.y + 6 + bob); c.lineTo(p.x + 7, p.y + 6 + bob); c.lineTo(p.x, p.y + 14 + bob); c.fill();
    }
  }
  // (the suitors' words over them at the unload)
  if (t.phase === 'arrive') RIVALS.forEach((r, i) => {
    const s = t.unload.talk[r.id];
    if (!s) return;
    const p = toScreen(state, UNLOAD_SPOTS[i] + t.unload.walk, GY - 110);
    saidOver(c, s.text, p.x, p.y, '#FDE68A', 220);
  });
  // (the PA: the ride's spiel, or Piper, in the top band)
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
    c.fillStyle = 'rgba(10,8,20,0.78)'; c.fillRect(band.x1, 8, band.x2 - band.x1, h);
    c.fillStyle = col; c.fillRect(band.x1, 8, 3, h);
    text(c, who, band.x1 + 10, 20, col, 6, 'left');
    lines.forEach((l, i) => text(c, l, band.x1 + 10, 32 + i * 11, '#FFFFFF', 7, 'left'));
  }
};
