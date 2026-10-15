// Thrones of the Stars, drawn (the crude first pass: readable boxes and the park's letters). The sky by the hour (the
// park far below the higher he gets, the HAPPYWOOD hill and the skyline sinking under him), the rest of the monstrosity
// in the distance; the track he rides (a gold rail on a crimson spine, rolling where it rolls, on spindly legs down to
// the park), the queue's switchbacks full of guests, the station under its crown of a canopy, and the three stops: the
// decks up on the structure (walled off by the pylons: the track goes through them, barred), the catwalks (lit lips:
// standable), the staff doors, the SERVICE STAIRS, and the shrine at each: a famous toilet on a plinth behind velvet
// ropes, spotlit, its plaque, its name over it. The control booth up on its stilts, the sleeper, the lever. The train:
// three golden throne-toilets on wheels.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { box, happywoodHill, steveFlier } from '../section';
import { HWX } from '../geometry';
import { drawTodSky, hourMix } from '../../timeOfDay';
import { drawPerson } from '../../adventure/temple/people';
import { farCoaster } from '../blvd/art';
import { words, print, enamel, brass, marquee, ledgeLip, velvetRope, signW } from '../blvd/paint';
import {
  x0, X, Y, GY, QUEUE_GROUND, STATION, RAILS, RAIL_H, STOPS, BOOTH, FUMES, CAR_GAP, CARS, STEVE_STANDEE, queueH, parkAt,
  LAUNCHED_MEMO, WALKER_MEMO, CLEARED_MEMO, LEVER_MEMO, type Place,
} from './layout';
import { tracks, at, STEP, type Track } from './track';
import type { Coaster, QGuest } from './state';

type Ctx = CanvasRenderingContext2D;
export { GY };

const viewOf = (state: GameState) => state.view ?? { x: state.camera.x, y: state.camera.y, w: 800, h: 600 };
const seen = (state: GameState, a: number, b: number, top = -1e9, bot = 1e9) => {
  const v = viewOf(state);
  return b > v.x - 80 && a < v.x + v.w + 80 && bot > v.y - 80 && top < v.y + v.h + 80;
};

// ---------------------------------------------------------------------------------------------------------------
// Screen space: the sky, the park far below

export const drawCoasterBackdrop = (c: Ctx, state: GameState) => {
  const W = 800, H = 600, cam = state.camera.x;
  // (up on the structure, the horizon goes down under him: the park far below, then nothing but sky)
  const up = Math.max(0, -state.camera.y);
  const horizon = 430 + up * 0.17;
  drawTodSky(c, 0, 0, W, H, ['#1E3A8A', '#3B82F6', '#93C5FD', '#FDE68A'], { horizon: Math.min(horizon, 900), sun: [620, 120 + up * 0.04], moon: [160, 90] });
  if (horizon > H + 300) return true;
  happywoodHill(c, 560 - (cam - HWX) * 0.004, horizon, hourMix('#A16207', '#92400E', '#3F2A14'));
  // (the rest of the monstrosity, off in the distance: huge)
  farCoaster(c, 500 - (cam - x0) * 0.05, horizon, 1.5, hourMix('#64748B', '#475569', '#1E293B'));
  farCoaster(c, 1300 - (cam - x0) * 0.05, horizon, 1.1, hourMix('#64748B', '#475569', '#1E293B'));
  const far = hourMix('#78716C', '#57534E', '#292524');
  const off = -((cam * 0.2) % 160);
  for (let x = off - 160, k = 0; x < W + 160; x += 160, k++) {
    const h = 50 + ((k * 37 + Math.floor(cam / 800)) % 5) * 18;
    box(c, x, horizon - h, 120, h + 400, far);
  }
  // (the park's floor far below: a haze)
  box(c, 0, horizon, W, H, hourMix('#A8A29E', '#78716C', '#292524'));
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The track: a gold rail on a crimson spine, ties across, legs down to the park

interface Chunk { i0: number; i1: number; x0: number; x1: number; y0: number; y1: number }
const CHUNKS = new WeakMap<Track, Chunk[]>();
const chunksOf = (tr: Track) => {
  let ch = CHUNKS.get(tr);
  if (ch) return ch;
  ch = [];
  for (let i = 0; i < tr.pts.length - 1; i += 48) {
    const i1 = Math.min(tr.pts.length - 1, i + 48);
    let a = Infinity, b = -Infinity, t = Infinity, u = -Infinity;
    for (let k = i; k <= i1; k++) { const p = tr.pts[k]; a = Math.min(a, p.x); b = Math.max(b, p.x); t = Math.min(t, p.y); u = Math.max(u, p.y); }
    ch.push({ i0: i, i1, x0: a, x1: b, y0: t, y1: Math.max(u, GY) });
  }
  CHUNKS.set(tr, ch);
  return ch;
};
/** On a deck (where the deck's own floor carries the rail: no legs). */
const onDeck = (x: number, y: number) => (y > Y(STATION.h) - 4 && y < Y(STATION.h) + 4 && x < X(STATION.b + 60)) || STOPS.some(s => x > X(s.a - 60) && x < X(s.b + 60) && Math.abs(y - Y(s.h)) < 4);

const drawTrackPath = (c: Ctx, state: GameState, tr: Track, bentFrom = -1) => {
  const v = viewOf(state), pts = tr.pts;
  for (const ch of chunksOf(tr)) {
    if (ch.x1 < v.x - 60 || ch.x0 > v.x + v.w + 60 || ch.y1 < v.y - 60 || ch.y0 > v.y + v.h + 60) continue;
    // (the legs: from the track down to the park, now and then, where the track's the right way up)
    c.strokeStyle = '#52525B'; c.lineWidth = 5;
    c.beginPath();
    for (let i = ch.i0; i < ch.i1; i++) {
      if (i % 50 !== 0) continue;
      const p = pts[i];
      if (Math.cos(p.a) < 0.5 || onDeck(p.x, p.y) || p.y > GY - 30) continue;
      c.moveTo(p.x, p.y + 10); c.lineTo(p.x, GY);
    }
    c.stroke();
    c.strokeStyle = '#3F3F46'; c.lineWidth = 2;
    c.beginPath();
    for (let i = ch.i0; i < ch.i1; i++) {
      if (i % 50 !== 0) continue;
      const p = pts[i];
      if (Math.cos(p.a) < 0.5 || onDeck(p.x, p.y) || p.y > GY - 30) continue;
      for (let y = p.y + 60; y < GY - 40; y += 120) { c.moveTo(p.x - 14, y); c.lineTo(p.x + 14, y + 60); c.moveTo(p.x + 14, y); c.lineTo(p.x - 14, y + 60); }
    }
    c.stroke();
    // (the spine, under the rail; the rail on top: rolled with the train where it rolls)
    for (const [w, col, off] of [[9, '#450A0A', 6], [6, '#991B1B', 6], [4, '#000000', -2], [3, '#FBBF24', -2]] as const) {
      c.strokeStyle = col; c.lineWidth = w; c.beginPath();
      let started = false;
      for (let i = ch.i0; i <= ch.i1; i += 3) {
        const p = pts[i];
        if (bentFrom >= 0 && i * STEP > bentFrom) break;
        const k = Math.cos(p.roll), nx = Math.sin(p.a) * k * -off, ny = -Math.cos(p.a) * k * -off;
        if (!started) { c.moveTo(p.x + nx, p.y + ny); started = true; } else c.lineTo(p.x + nx, p.y + ny);
      }
      c.stroke();
    }
    // (ties across the rail)
    c.strokeStyle = '#78350F'; c.lineWidth = 2; c.beginPath();
    for (let i = ch.i0; i < ch.i1; i += 5) {
      const p = pts[i];
      if (bentFrom >= 0 && i * STEP > bentFrom) break;
      const k = Math.cos(p.roll), nx = Math.sin(p.a) * k, ny = -Math.cos(p.a) * k;
      c.moveTo(p.x - nx * 4, p.y - ny * 4); c.lineTo(p.x + nx * 8, p.y + ny * 8);
    }
    c.stroke();
  }
};

/** Every track (the three rides, the launch, the way back, the station's way in), and the EXPERIMENTAL section's end. */
export const drawTracks = (c: Ctx, state: GameState) => {
  const T = tracks(), launched = !!state.stageMemo[LAUNCHED_MEMO];
  for (const tr of [T.r1, T.r2, T.r3, T.back, T.arrive]) drawTrackPath(c, state, tr);
  drawTrackPath(c, state, T.launch);
  // The EXPERIMENTAL section: the track just stops, pointed at the sky, a sign on the end; bent up and torn after the
  // launch (they never fixed it)
  const end = T.launch.pts[T.launch.pts.length - 1];
  if (seen(state, end.x - 300, end.x + 300, end.y - 300, end.y + 300)) {
    c.save(); c.translate(end.x, end.y); c.rotate(end.a);
    if (launched) {
      // (the rails torn and curled up off the end)
      c.strokeStyle = '#FBBF24'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -2); c.quadraticCurveTo(40, -10, 54, -50); c.stroke();
      c.strokeStyle = '#991B1B'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 6); c.quadraticCurveTo(30, 10, 46, -16); c.stroke();
      for (let k = 0; k < 4; k++) box(c, 10 + k * 12, -14 - k * 6, 6, 3, '#71717A');
    } else {
      box(c, -4, -10, 10, 22, '#000'); box(c, -2, -8, 6, 18, '#FACC15');
    }
    c.restore();
    // (the sign on its post, under the end: held up, its own letters)
    const sx = end.x - 40, sy = end.y + 60;
    box(c, sx - 3, sy, 6, 140, '#57534E');
    box(c, sx - 74, sy - 34, 148, 36, '#000'); box(c, sx - 72, sy - 32, 144, 32, launched ? '#7F1D1D' : '#FACC15');
    words(c, launched ? 'TRACK CLOSED' : 'EXPERIMENTAL', sx, sy - 18, print(1, launched ? '#FEF3C7' : '#18181B'));
    words(c, launched ? 'SORRY' : 'TRACK ENDS', sx, sy - 6, print(1, launched ? '#FCA5A5' : '#7F1D1D'));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The train: three golden throne-toilets on wheels (front first). Local: x along the rail, up is -y. `layer` 'back'
// (the bogie, the base, the throne's back, the seat), 'front' (the bowl's front and the lap bar, over whoever's sat in
// it).

/** How far over the rail his feet sit in the front car. */
export const SINK = 16;
const car = (c: Ctx, layer: 'back' | 'front', f: number, k: number) => {
  if (layer === 'back') {
    // (the bogie and its wheels)
    box(c, -28, -10, 56, 10, '#000'); box(c, -27, -9, 54, 8, '#27272A');
    for (const wx of [-18, 18]) { c.fillStyle = '#000'; c.beginPath(); c.arc(wx, -2, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#71717A'; c.beginPath(); c.arc(wx, -2, 3, 0, Math.PI * 2); c.fill(); }
    // (the gold base)
    // (no lit top on it: it's not for standing on)
    box(c, -30, -24, 60, 15, '#000'); box(c, -29, -23, 58, 13, '#CA8A04'); box(c, -29, -14, 58, 3, '#A16207');
    // (the throne's back: gold frame, red velvet, a star on top)
    box(c, -32, -88, 16, 66, '#000'); box(c, -31, -87, 14, 64, '#EAB308'); box(c, -28, -82, 8, 54, '#9F1239');
    for (let y = -78; y < -32; y += 10) box(c, -26, y, 4, 4, '#BE123C');
    c.fillStyle = '#FDE047'; c.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 4 : 9, an = -Math.PI / 2 + (i * Math.PI) / 5; c.lineTo(-24 + Math.cos(an) * r, -96 + Math.sin(an) * r); }
    c.closePath(); c.fill();
    // (the tank behind the seat, white porcelain; the lid up against the back)
    box(c, -18, -60, 12, 30, '#000'); box(c, -17, -59, 10, 28, '#F5F5F4');
    // (the seat: the ring)
    box(c, -10, -36, 34, 6, '#000'); box(c, -9, -35, 32, 4, k ? '#FDE68A' : '#FEF3C7');
    // (the bowl, behind his legs)
    box(c, -6, -32, 28, 14, '#E7E5E4');
  } else {
    // (the bowl's front, porcelain, and the gold lap bar down over his lap)
    c.fillStyle = '#000'; c.beginPath(); c.moveTo(-6, -32); c.lineTo(24, -32); c.quadraticCurveTo(26, -18, 14, -16); c.lineTo(0, -16); c.closePath(); c.fill();
    c.fillStyle = '#F5F5F4'; c.beginPath(); c.moveTo(-4, -31); c.lineTo(22, -31); c.quadraticCurveTo(23, -19, 13, -17); c.lineTo(1, -17); c.closePath(); c.fill();
    box(c, 2, -30, 18, 2, '#FFFFFF');
    c.strokeStyle = '#000'; c.lineWidth = 5; c.beginPath(); c.moveTo(-18, -66); c.quadraticCurveTo(10, -76, 20, -44); c.stroke();
    c.strokeStyle = '#FBBF24'; c.lineWidth = 3; c.beginPath(); c.moveTo(-18, -66); c.quadraticCurveTo(10, -76, 20, -44); c.stroke();
    void f;
  }
};
/** The cars' places: along the track (a train going), or parked at a place (level, front at its parked spot). */
export interface CarAt { x: number; y: number; a: number; roll: number }
export const carsOn = (tr: Track, s: number): CarAt[] => {
  const out: CarAt[] = [];
  for (let i = 0; i < CARS; i++) {
    const si = s - i * CAR_GAP;
    if (si >= 0) { const p = at(tr, si); out.push({ x: p.x, y: p.y, a: p.a, roll: p.roll }); }
    else { const p0 = tr.pts[0]; out.push({ x: p0.x + Math.cos(p0.a) * si, y: p0.y + Math.sin(p0.a) * si, a: p0.a, roll: 0 }); }
  }
  return out;
};
export const carsParked = (pl: Place): CarAt[] => { const p = parkAt(pl); return [0, 1, 2].map(i => ({ x: p.x - i * CAR_GAP, y: p.y, a: 0, roll: 0 })); };
export const drawTrain = (c: Ctx, cars: CarAt[], layer: 'back' | 'front', f: number, riderFront = false, lockLight?: boolean) => {
  // (the back car first: the front one's in front of it)
  for (let i = cars.length - 1; i >= 0; i--) {
    const k = cars[i];
    if (layer === 'front' && !(riderFront && i === 0)) continue;
    c.save(); c.translate(k.x, k.y); c.rotate(k.a);
    const sc = Math.cos(k.roll); c.scale(1, Math.abs(sc) < 0.12 ? 0.12 * Math.sign(sc || 1) : sc);
    car(c, layer, f, i);
    // (the front car's light: red, the lap bar locked; green, hop on)
    if (layer === 'back' && i === 0 && lockLight !== undefined) { box(c, 24, -30, 6, 6, '#000'); box(c, 25, -29, 4, 4, lockLight ? (f % 30 < 15 ? '#EF4444' : '#7F1D1D') : '#4ADE80'); }
    c.restore();
  }
};
/** The train flying (the launch, off the end): the three cars in a line, turning over. */
export const drawFlyingTrain = (c: Ctx, x: number, y: number, rot: number, layer: 'back' | 'front', f: number) => {
  const cars: CarAt[] = [0, 1, 2].map(i => ({ x: x - Math.cos(rot) * i * CAR_GAP, y: y - Math.sin(rot) * i * CAR_GAP, a: rot, roll: 0 }));
  drawTrain(c, cars, layer, f, true);
};

// ---------------------------------------------------------------------------------------------------------------
// Bits

/** A plaque on a stand: two lines (brass). */
const plaque = (c: Ctx, x: number, feetY: number, a: string, b: string, col = '#FEF3C7') => {
  box(c, x - 2, feetY - 50, 4, 50, '#57534E'); box(c, x - 10, feetY - 4, 20, 4, '#44403C');
  const L1 = brass(8), L2 = print(1, col), w = Math.max(signW(a, L1), signW(b, L2)) + 16;
  box(c, x - w / 2 - 1, feetY - 84, w + 2, 34, '#000'); box(c, x - w / 2, feetY - 83, w, 32, '#92400E'); box(c, x - w / 2 + 2, feetY - 81, w - 4, 28, '#B45309');
  words(c, a, x, feetY - 70, L1);
  words(c, b, x, feetY - 58, L2);
};
/** A sign board hung on two chains from y0 (or on two posts from the floor if `posts`), its middle at (x, y). */
const hungSign = (c: Ctx, x: number, y: number, w: number, h: number, from: number, board: string, posts = false) => {
  if (posts) { box(c, x - w / 2 + 8, y + h / 2, 6, from - y - h / 2, '#57534E'); box(c, x + w / 2 - 14, y + h / 2, 6, from - y - h / 2, '#57534E'); }
  else for (const cx of [x - w / 2 + 12, x + w / 2 - 12]) for (let yy = from; yy < y - h / 2; yy += 7) box(c, cx - 2, yy, 4, 5, '#71717A');
  box(c, x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6, '#000'); box(c, x - w / 2, y - h / 2, w, h, board);
};
/** A spotlight's beam down onto (x, y) from up above. */
const spot = (c: Ctx, x: number, y: number, h: number, f: number, col = 'rgba(254, 240, 138, 0.16)') => {
  c.fillStyle = col; c.beginPath(); c.moveTo(x - 10, y - h); c.lineTo(x + 10, y - h); c.lineTo(x + 70, y); c.lineTo(x - 70, y); c.closePath(); c.fill();
  box(c, x - 9, y - h - 12, 18, 14, '#18181B'); box(c, x - 6, y - h, 12, 3, f % 60 < 58 ? '#FEF9C3' : '#FDE68A');
};
/** A door: its frame; open by `k` (0 shut); a sign over it. */
const door = (c: Ctx, x: number, feetY: number, k: number, sign: string, signCol = '#FACC15', board = '#18181B', light?: 'red' | 'green') => {
  box(c, x - 34, feetY - 116, 68, 116, '#000'); box(c, x - 32, feetY - 114, 64, 114, '#3F3F46');
  box(c, x - 26, feetY - 108, 52, 108, '#09090B');
  const w = 52 * (1 - k * 0.85);
  box(c, x - 26, feetY - 108, w, 108, '#57534E'); box(c, x - 26 + w - 6, feetY - 58, 4, 8, '#A1A1AA');
  const L = print(1, signCol), sw = signW(sign, L) + 14;
  box(c, x - sw / 2, feetY - 136, sw, 16, board); words(c, sign, x, feetY - 124, L);
  if (light) { box(c, x + 22, feetY - 70, 8, 8, '#000'); box(c, x + 23, feetY - 69, 6, 6, light === 'red' ? '#EF4444' : '#4ADE80'); }
};
/** A pylon at a deck's end: a steel lattice tower up out of sight and down to the park; the train's arch through it at
 *  the deck, barred (the barrier arm down) unless the train's going through. */
const pylon = (c: Ctx, x: number, deckY: number, open: boolean) => {
  box(c, x - 4, deckY - 1400, 48, 1400 + (GY - deckY) + 10, '#000');
  box(c, x - 2, deckY - 1400, 44, 1400 + (GY - deckY) + 10, '#52525B');
  c.strokeStyle = '#3F3F46'; c.lineWidth = 3; c.beginPath();
  for (let y = deckY - 1400; y < GY; y += 44) { c.moveTo(x - 2, y); c.lineTo(x + 42, y + 44); c.moveTo(x + 42, y); c.lineTo(x - 2, y + 44); }
  c.stroke();
  box(c, x - 2, deckY - 1400, 4, 1400 + GY - deckY, '#71717A');
  // (the train's arch through it, at the deck; the barrier)
  box(c, x - 2, deckY - 104, 44, 104, '#0C0A09');
  if (!open) for (let k = 0; k < 5; k++) box(c, x - 2, deckY - 96 + k * 20, 44, 10, k % 2 ? '#F8FAFC' : '#DC2626');
};
/** A deck up on the structure: its floor (the lit lip), its girder face down a bit, struts down to the park. */
const deckFloor = (c: Ctx, a: number, b: number, y: number) => {
  c.strokeStyle = '#57534E'; c.lineWidth = 6; c.beginPath();
  for (let x = a + 60; x < b - 30; x += 240) { c.moveTo(x, y + 40); c.lineTo(x, GY); c.moveTo(x, y + 40); c.lineTo(x + 120, y + 260); }
  c.stroke();
  box(c, a, y, b - a, 40, '#000'); box(c, a, y + 1, b - a, 38, '#44403C');
  for (let x = a; x < b; x += 40) box(c, x, y + 14, 2, 26, '#292524');
  box(c, a, y, b - a, 4, '#D6D3D1');
  // (the rail along it: the train's)
  box(c, a, y - 3, b - a, 3, '#FBBF24');
};

// ---------------------------------------------------------------------------------------------------------------
// The queue and the station

const guestAt = (c: Ctx, g: QGuest, f: number) => {
  const h = queueH(g.rx), x = X(g.rx) + (g.shove > 0 ? g.dir * (30 - g.shove) * 0.8 : 0), y = Y(h);
  c.save(); c.translate(x, y);
  if (g.shove > 0) c.rotate(g.dir * Math.sin((g.shove / 30) * Math.PI) * 0.5);
  const face = (g.seed % 2 ? 1 : -1) as 1 | -1;
  c.scale(face * 0.92, 0.92);
  drawPerson(c, { seed: g.seed, outfit: 'guest', f, pose: g.mad > 0 ? 'point' : g.seed % 5 === 0 ? 'photo' : 'stand', mood: g.mad > 0 ? 'angry' : g.seed % 3 === 0 ? 'bored' : 'happy', shorts: g.seed % 3 === 0, talking: g.mad > 0 && f % 10 < 5 });
  c.restore();
};

const drawQueue = (c: Ctx, state: GameState, co: Coaster) => {
  const f = state.frame;
  if (!seen(state, X(-200), X(STATION.b + 100))) return;
  // (the queue house under the ramps and the station: a wall with posters, the floors' lit lips)
  c.fillStyle = '#4C0519'; c.beginPath(); c.moveTo(X(700), GY);
  for (const [a, b, ha, hb] of QUEUE_GROUND) if (a >= 700) { c.lineTo(X(a), Y(ha)); c.lineTo(X(b), Y(hb)); }
  c.lineTo(X(STATION.b), GY); c.closePath(); c.fill();
  for (const rx of [900, 1450, 2000, 2450]) { box(c, X(rx) - 30, GY - 80, 60, 60, '#000'); box(c, X(rx) - 28, GY - 78, 56, 56, '#FDE68A'); words(c, 'THRONES', X(rx), GY - 50, print(1, '#9F1239')); words(c, 'SIT HERE', X(rx), GY - 38, print(1, '#7F1D1D')); }
  for (const [a, b, ha, hb] of QUEUE_GROUND) {
    if (b < X(-200) - x0) continue;
    c.fillStyle = '#000'; c.beginPath(); c.moveTo(X(a), Y(ha) - 1); c.lineTo(X(b), Y(hb) - 1); c.lineTo(X(b), Y(hb) + 8); c.lineTo(X(a), Y(ha) + 8); c.closePath(); c.fill();
    c.fillStyle = '#A8A29E'; c.beginPath(); c.moveTo(X(a), Y(ha)); c.lineTo(X(b), Y(hb)); c.lineTo(X(b), Y(hb) + 6); c.lineTo(X(a), Y(ha) + 6); c.closePath(); c.fill();
    c.strokeStyle = '#F5F5F4'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(a), Y(ha)); c.lineTo(X(b), Y(hb)); c.stroke();
  }
  if (seen(state, X(-200), X(800))) box(c, X(-200), GY, 1000, 400, '#57534E');
  // The way in: the arch, the wait
  {
    const ax = X(120);
    box(c, ax - 90, GY - 230, 14, 230, '#57534E'); box(c, ax + 76, GY - 230, 14, 230, '#57534E');
    box(c, ax - 110, GY - 280, 220, 56, '#000'); box(c, ax - 106, GY - 276, 212, 48, '#4C0519');
    words(c, 'THRONES', ax, GY - 252, marquee(2, 2, '#FBBF24', f % 30 < 24));
    words(c, 'QUEUE', ax, GY - 236, print(1, '#FDE68A'));
    // (the PA's horn on it)
    box(c, ax + 80, GY - 300, 10, 10, '#52525B'); c.fillStyle = '#71717A'; c.beginPath(); c.moveTo(ax + 90, GY - 302); c.lineTo(ax + 106, GY - 310); c.lineTo(ax + 106, GY - 282); c.lineTo(ax + 90, GY - 290); c.closePath(); c.fill();
    const wx = X(250);
    box(c, wx - 3, GY - 120, 6, 120, '#71717A');
    box(c, wx - 60, GY - 156, 120, 40, '#000'); box(c, wx - 58, GY - 154, 116, 36, '#F8FAFC');
    words(c, 'WAIT FROM HERE', wx, GY - 140, print(1, '#18181B')); words(c, '4 HOURS', wx, GY - 125, brass(8));
    const fx = X(1100);
    box(c, fx - 3, Y(110) - 130, 6, 130, '#71717A');
    box(c, fx - 70, Y(110) - 166, 140, 40, '#000'); box(c, fx - 68, Y(110) - 164, 136, 36, '#FDE68A');
    words(c, 'FAST PASS LANE', fx, Y(110) - 150, print(1, '#18181B')); words(c, 'WAIT: 3 HOURS', fx, Y(110) - 136, print(1, '#7F1D1D'));
  }
  // The rails between the lanes (low: over them), velvet along them
  for (const [rx, h] of RAILS) {
    const x = X(rx), y = Y(h);
    box(c, x - 5, y - RAIL_H, 10, RAIL_H, '#000'); box(c, x - 4, y - RAIL_H + 1, 8, RAIL_H - 1, '#A1A1AA'); box(c, x - 4, y - RAIL_H, 8, 3, '#F5F5F4');
    c.strokeStyle = '#7F1D1D'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 60, y - 26); c.quadraticCurveTo(x - 30, y - 14, x, y - 28); c.quadraticCurveTo(x + 30, y - 14, x + 60, y - 26); c.stroke();
  }
  // Steve's standee, in the queue
  steveFlier(c, X(STEVE_STANDEE), Y(queueH(STEVE_STANDEE)), 'standee', 1);
  // The station: its canopy (a crown of gold over it), its BOARDING sign, its end wall (the track out through its arch)
  if (seen(state, X(STATION.a - 100), X(STATION.b + 100))) {
    const y = Y(STATION.h);
    for (const rx of [STATION.a + 40, 2100, STATION.b - 60]) box(c, X(rx), y - 250, 12, 250, '#CA8A04');
    box(c, X(STATION.a), y - 274, STATION.b - STATION.a, 28, '#000'); box(c, X(STATION.a) + 2, y - 272, STATION.b - STATION.a - 4, 24, '#EAB308');
    for (let x = X(STATION.a); x < X(STATION.b); x += 50) { c.fillStyle = '#EAB308'; c.beginPath(); c.moveTo(x, y - 272); c.lineTo(x + 25, y - 300); c.lineTo(x + 50, y - 272); c.closePath(); c.fill(); box(c, x + 22, y - 304, 6, 6, f % 40 < 30 ? '#FEF3C7' : '#FDE68A'); }
    words(c, 'BOARDING', X(2300), y - 254, enamel(8, '#7F1D1D'));
    // (the station's staff door: where the stops' service stairs come out)
    door(c, X(STATION.b - 120), y, 0, 'STAFF ONLY', '#FCA5A5');
    steveFlier(c, X(1980), y - 150, 'poster', 3);
    box(c, X(STATION.b), y - 800, 50, 800, '#000'); box(c, X(STATION.b) + 2, y - 800, 46, 800, '#7F1D1D');
    box(c, X(STATION.b) + 2, y - 104, 46, 104, '#0C0A09');
    for (let k = 0; k < 5; k++) box(c, X(STATION.b) + 2, y - 96 + k * 20, 46, 10, k % 2 ? '#F8FAFC' : '#DC2626');
  }
  for (const g of co.guests) if (seen(state, X(g.rx) - 40, X(g.rx) + 40)) guestAt(c, g, f);
};

// ---------------------------------------------------------------------------------------------------------------
// The three shrines

const TITLES = ['THE CHAIRMAN OF THE BOWEL', "THE GODFATHER'S CLOG", "THE ROCK GOD'S TOUR BUS TOILET"];
const PLAQUES: [string, string][] = [['AS SAT ON BY', 'DINO SINATRELLI 1961'], ['AS CLOGGED BY', 'MARLOWE BRANDOE 1994'], ['NEVER FLUSHED', 'SINCE 1973']];

/** A toilet (crude): the tank, the bowl, the seat; its color. Feet at (x, y). */
const toilet = (c: Ctx, x: number, y: number, col: string, dark: string) => {
  box(c, x - 26, y - 70, 24, 40, '#000'); box(c, x - 25, y - 69, 22, 38, col);
  box(c, x - 28, y - 74, 28, 6, '#000'); box(c, x - 27, y - 73, 26, 4, col);
  box(c, x - 6, y - 34, 40, 10, '#000'); box(c, x - 5, y - 33, 38, 8, col);
  c.fillStyle = '#000'; c.beginPath(); c.moveTo(x - 4, y - 26); c.lineTo(x + 32, y - 26); c.quadraticCurveTo(x + 30, y - 8, x + 16, y - 6); c.lineTo(x + 12, y); c.lineTo(x - 2, y); c.closePath(); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(x - 2, y - 25); c.lineTo(x + 30, y - 25); c.quadraticCurveTo(x + 28, y - 9, x + 15, y - 7); c.lineTo(x + 11, y - 1); c.lineTo(x, y - 1); c.closePath(); c.fill();
  box(c, x - 4, y - 30, 4, 4, dark);
};

const drawShrine = (c: Ctx, state: GameState, i: number, co: Coaster) => {
  const s = STOPS[i], f = state.frame, dy = Y(s.h), sx = X(s.shrine.x), sw = s.shrine.w, top = dy - s.shrine.h, mx = sx + sw / 2;
  // (the spotlights down on it)
  spot(c, mx - 50, top, 300, f); spot(c, mx + 50, top, 300, f + 20);
  // (the velvet ropes either side, the plaque in front)
  velvetRope(c, sx - 110, sx - 14, dy); velvetRope(c, sx + sw + 14, sx + sw + 110, dy);
  plaque(c, sx - 150, dy, PLAQUES[i][0], PLAQUES[i][1]);
  // The plinth (marble, gold trim; its top lit: he can stand on it)
  if (i < 2) {
    box(c, sx - 2, top - 2, sw + 4, s.shrine.h + 2, '#000'); box(c, sx, top, sw, s.shrine.h, '#E7E5E4');
    for (let k = 0; k < 3; k++) box(c, sx + 10 + k * 34, top + 10, 2, s.shrine.h - 14, '#D6D3D1');
    box(c, sx, top + s.shrine.h - 8, sw, 8, '#CA8A04'); box(c, sx, top, sw, 4, '#FDE68A');
  }
  if (i === 0) {
    // THE CHAIRMAN OF THE BOWEL: a pink crooner's toilet: a ring in it, a cigarette butt, a martini on the tank, his hat
    toilet(c, mx - 6, top, '#F9A8D4', '#BE185D');
    box(c, mx - 2, top - 27, 30, 2, '#78350F');
    box(c, mx + 10, top - 26, 6, 2, '#F5F5F4'); box(c, mx + 15, top - 26, 2, 2, '#F97316');
    c.strokeStyle = '#000'; c.lineWidth = 1; c.beginPath(); c.moveTo(mx - 30, top - 92); c.lineTo(mx - 20, top - 82); c.lineTo(mx - 10, top - 92); c.closePath(); c.stroke();
    box(c, mx - 21, top - 82, 2, 8, '#000'); box(c, mx - 22, top - 87, 3, 3, '#16A34A');
    box(c, mx - 34, top - 104, 26, 6, '#1C1917'); box(c, mx - 28, top - 112, 14, 8, '#1C1917'); box(c, mx - 28, top - 106, 14, 2, '#7F1D1D');
  } else if (i === 1) {
    // THE GODFATHER'S CLOG: an avocado toilet, overflowing (brown down the plinth, a puddle), a plunger stuck in it,
    // flies
    toilet(c, mx - 6, top, '#84CC16', '#3F6212');
    box(c, mx - 4, top - 30, 36, 6, '#713F12');
    for (const [x, h] of [[mx + 4, s.shrine.h + 6], [mx + 22, s.shrine.h - 10], [mx - 20, s.shrine.h - 20]]) box(c, x, top - 2, 6, h, '#78350F');
    box(c, sx - 30, dy - 4, sw + 60, 4, '#713F12');
    c.save(); c.translate(mx + 10, top - 28); c.rotate(0.3); box(c, -2, -40, 4, 40, '#A16207'); box(c, -9, -4, 18, 8, '#B91C1C'); c.restore();
    for (let k = 0; k < 7; k++) { const a = f * 0.13 + k * 0.9; box(c, mx + 8 + Math.cos(a * 1.3) * (18 + k * 3), top - 46 + Math.sin(a) * 14, 2, 2, '#000'); }
  } else {
    // THE ROCK GOD'S TOUR BUS TOILET: sealed in a hazmat case on its plinth (the case is the solid: stand on its lid),
    // the black bus toilet inside covered in band stickers, glowing green, something growing out of it; biohazard
    // signs; the case rattles before it vents (the fumes: index.ts)
    const cyc = co.fumeT % FUMES.every, tell = cyc >= FUMES.every - FUMES.vent - FUMES.tell && cyc < FUMES.every - FUMES.vent;
    const jx = tell ? (f % 4 < 2 ? -1 : 1) : 0;
    box(c, sx - 2, top + 70, sw + 4, 52, '#000'); box(c, sx, top + 72, sw, 48, '#3F3F46'); box(c, sx, top + 72, sw, 3, '#A1A1AA');
    for (let x = sx + 6; x < sx + sw - 6; x += 18) box(c, x, top + 104, 10, 6, '#FACC15');
    // (the case: glass, steel corners; inside, the glow)
    box(c, sx + jx - 2, top - 2, sw + 4, 76, '#000');
    c.fillStyle = 'rgba(132, 204, 22, 0.35)'; c.fillRect(sx + jx, top, sw, 72);
    toilet(c, mx - 6 + jx, top + 72, '#18181B', '#000');
    for (const [x, y, col] of [[mx - 26, top + 20, '#DC2626'], [mx - 20, top + 30, '#FACC15'], [mx + 4, top + 52, '#38BDF8'], [mx + 16, top + 48, '#F472B6']] as const) box(c, x + jx, y, 6, 4, col);
    c.fillStyle = `rgba(190, 242, 100, ${0.45 + 0.25 * Math.sin(f * 0.1)})`; c.beginPath(); c.ellipse(mx + 8 + jx, top + 46, 16, 5, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#65A30D'; c.lineWidth = 3; c.beginPath(); c.moveTo(mx + 10 + jx, top + 46); c.quadraticCurveTo(mx + 30 + Math.sin(f * 0.05) * 6, top + 20, mx + 18 + jx, top + 6); c.stroke();
    box(c, sx + jx, top, 6, 72, '#71717A'); box(c, sx + sw - 6 + jx, top, 6, 72, '#71717A');
    box(c, sx + jx, top, sw, 4, '#D9F99D');
    // (the biohazard signs on the plinth)
    for (const bx of [sx + 20, sx + sw - 20]) { c.fillStyle = '#FACC15'; c.beginPath(); c.moveTo(bx, top + 78); c.lineTo(bx + 12, top + 98); c.lineTo(bx - 12, top + 98); c.closePath(); c.fill(); box(c, bx - 1, top + 84, 2, 8, '#000'); box(c, bx - 1, top + 94, 2, 2, '#000'); }
  }
  // (its name over it: a board, hung or on posts; its own letters)
  const L = i === 2 ? enamel({ sx: 1, sy: 2 }, '#BEF264', '#000') : enamel({ sx: 1, sy: 2 }, '#FDE68A', '#000');
  const tw = signW(TITLES[i], L) + 30, ty = i === 0 ? dy - 186 : i === 1 ? dy - 160 : dy - 196;
  if (i === 0) hungSign(c, mx, ty, tw, 34, dy - 240 + 16, '#4C0519');
  else hungSign(c, mx, ty, tw, 34, dy, i === 2 ? '#14532D' : '#4C0519', true);
  words(c, TITLES[i], mx, ty + 8, L);
};

// ---------------------------------------------------------------------------------------------------------------
// The stops

const drawBooth = (c: Ctx, state: GameState, co: Coaster) => {
  const f = state.frame, by = Y(BOOTH.h), launched = !!state.stageMemo[LAUNCHED_MEMO];
  // (the stilts down to the deck, the balcony (lit lip: stand on it), its railing posts)
  for (const rx of [BOOTH.a + 20, BOOTH.b - 30]) box(c, X(rx), by + 14, 10, Y(STOPS[2].h) - by - 14, '#3F3F46');
  ledgeLip(c, X(BOOTH.a), by, BOOTH.b - BOOTH.a, '#52525B', '#FDE68A');
  // The booth: walls, its big window, the panel inside, the sleeper (or the note)
  const cx0 = X(BOOTH.cab), cw = X(BOOTH.b) - cx0 - 8;
  box(c, cx0, by - 130, cw, 130, '#000'); box(c, cx0 + 2, by - 128, cw - 4, 128, '#A8A29E');
  box(c, cx0 - 8, by - 140, cw + 16, 14, '#000'); box(c, cx0 - 6, by - 138, cw + 12, 10, '#7F1D1D');
  words(c, 'RIDE CONTROL', cx0 + cw / 2, by - 129, print(1, '#FDE68A'));
  box(c, cx0 + 14, by - 110, cw - 28, 60, '#0C4A6E'); box(c, cx0 + 16, by - 108, cw - 32, 56, 'rgba(186, 230, 253, 0.35)');
  box(c, cx0 + 16, by - 56, cw - 32, 14, '#27272A');
  for (let k = 0; k < 6; k++) box(c, cx0 + 24 + k * 22, by - 52, 6, 6, (k + Math.floor(f / 20)) % 3 ? '#4ADE80' : '#EF4444');
  if (!launched) {
    // (the sleeper: slumped over the desk, mouth open, a Zzz going up)
    c.save(); c.translate(cx0 + 70, by - 40); c.scale(0.9, 0.9);
    drawPerson(c, { seed: 4407, outfit: 'operator', f: 0, pose: 'sit', mood: 'bored', talking: !!co.sleeper });
    c.restore();
    for (let k = 0; k < 3; k++) { const t = ((f + k * 30) % 90) / 90; words(c, 'Z', cx0 + 86 + t * 20 + k * 4, by - 90 - t * 50, print(1 + (k % 2), `rgba(255,255,255,${1 - t})`)); }
  } else {
    box(c, cx0 + 50, by - 96, 70, 24, '#FEF3C7'); words(c, 'BACK IN 5', cx0 + 85, by - 80, print(1, '#18181B'));
  }
  // The lever: on the balcony, a plate reading NORMAL / EXPERIMENTAL, the handle thrown one way or the other
  const lx = X(BOOTH.lever), k = co.lever;
  box(c, lx - 36, by - 64, 4, 64, '#57534E');
  box(c, lx - 40, by - 100, 80, 38, '#000'); box(c, lx - 38, by - 98, 76, 34, '#E7E5E4');
  words(c, 'RIDE MODE', lx, by - 88, print(1, '#18181B'));
  words(c, 'NORMAL', lx - 18, by - 72, print(1, k < 0.5 ? '#15803D' : '#A8A29E'));
  words(c, 'EXPER.', lx + 20, by - 72, print(1, k >= 0.5 ? '#DC2626' : '#A8A29E'));
  box(c, lx - 14, by - 14, 28, 14, '#000'); box(c, lx - 12, by - 12, 24, 12, '#52525B');
  const ang = -0.7 + k * 1.4;
  c.save(); c.translate(lx, by - 10); c.rotate(ang);
  box(c, -3, -46, 6, 46, '#000'); box(c, -2, -45, 4, 44, '#A1A1AA');
  c.fillStyle = '#000'; c.beginPath(); c.arc(0, -48, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#DC2626'; c.beginPath(); c.arc(0, -48, 6, 0, Math.PI * 2); c.fill();
  c.restore();
};

const drawStop = (c: Ctx, state: GameState, i: number, co: Coaster) => {
  const s = STOPS[i], dy = Y(s.h), f = state.frame;
  if (!seen(state, X(s.a - 200), X(s.b + 200), dy - 1400, GY)) return;
  const run = co.stops[i], cleared = !!state.stageMemo[CLEARED_MEMO(i)];
  const passing = co.ride.on && !!co.ride.track && Math.abs(at(co.ride.track, co.ride.s).y - dy) < 30;
  deckFloor(c, X(s.a), X(s.b), dy);
  // (the stop's number, big, on a board at the back on posts)
  { const NL = enamel({ sx: 2, sy: 3 }, '#FDE68A', '#000'); hungSign(c, X(s.a + 200), dy - 300, signW(`STOP ${i + 1}`, NL) + 30, 40, dy, '#4C0519', true); words(c, `STOP ${i + 1}`, X(s.a + 200), dy - 300 + 11, NL); }
  // The catwalks (lit lips), their chains up into the structure
  for (const [rx, h, w] of s.ledges) {
    for (const cx of [X(rx) + 10, X(rx) + w - 14]) box(c, cx, Y(s.h + h) - 600, 4, 600, '#3F3F46');
    ledgeLip(c, X(rx), Y(s.h + h), w, '#52525B', '#FDE68A');
  }
  if (i === 2) drawBooth(c, state, co);
  // The doors: STAFF ONLY (where they come from), the SERVICE STAIRS (locked while they're at him)
  door(c, X(s.door), dy, run.door, 'STAFF ONLY', '#FCA5A5');
  if (s.upper) door(c, X(s.upper.x), Y(s.h + s.upper.h), run.upper, 'STAFF', '#FCA5A5');
  const fighting = run.phase === 'intro' || run.phase === 'fight';
  door(c, X(s.stairs), dy, 0, 'SERVICE STAIRS', '#86EFAC', '#14532D', fighting && !cleared ? 'red' : 'green');
  drawShrine(c, state, i, co);
  // Stop 2's track walker (in his headphones, mopping the rail, his back to the way it comes), or what's left
  if (i === 1) {
    const wx = X(s.a + 100);
    if (!state.stageMemo[WALKER_MEMO] && !co.walker) {
      c.save(); c.translate(wx, dy); c.scale(-0.92, 0.92);
      drawPerson(c, { seed: 3321, outfit: 'maint', f, pose: 'hold', mood: 'happy' });
      c.restore();
      box(c, wx - 6, dy - 70, 12, 4, '#18181B'); box(c, wx - 18, dy - 60, 4, 60, '#A16207'); box(c, wx - 26, dy - 6, 20, 6, '#E7E5E4');
    } else if (state.stageMemo[WALKER_MEMO]) {
      box(c, wx - 10, dy - 3, 160, 3, '#7F1D1D'); box(c, wx + 40, dy - 4, 50, 4, '#991B1B');
      c.save(); c.translate(wx + 120, dy - 4); c.rotate(-0.1); box(c, -30, -2, 60, 4, '#A16207'); box(c, 28, -6, 14, 8, '#E7E5E4'); c.restore();
    }
  }
  // The pylons at the deck's ends (the train's way through; barred unless it's passing)
  pylon(c, X(s.a) - 40, dy, passing);
  pylon(c, X(s.b), dy, passing);
  void f;
};

export const drawCoasterBack = (c: Ctx, state: GameState, co: Coaster) => {
  const v = viewOf(state);
  // (the park's floor, far below)
  if (v.y + v.h > GY - 40) { box(c, v.x - 100, GY, v.w + 200, 600, '#57534E'); box(c, v.x - 100, GY, v.w + 200, 4, '#A8A29E'); }
  drawTracks(c, state);
  drawQueue(c, state, co);
  for (let i = 0; i < 3; i++) drawStop(c, state, i, co);
  // (a billboard on the structure, seen from the first lift: Steve tested it)
  const bx = X(3200), by = Y(700);
  if (seen(state, bx - 200, bx + 200, by - 200, by + 200)) {
    box(c, bx - 4, by, 8, GY - by, '#52525B');
    box(c, bx - 150, by - 120, 300, 124, '#000'); box(c, bx - 146, by - 116, 292, 116, '#FEF3C7');
    steveFlier(c, bx - 100, by - 58, 'flier', 1);
    words(c, 'SAFETY TESTED BY', bx + 40, by - 76, print(1, '#18181B'));
    words(c, 'STUNTMAN STEVE', bx + 40, by - 58, enamel({ sx: 1, sy: 2 }, '#B91C1C'));
    words(c, 'HE IS FINE', bx + 40, by - 38, print(1, '#7F1D1D'));
  }
};

/** The lights after dark: the station's canopy bulbs, each shrine's spotlights, the booth's window. */
export const coasterLamps = (): Light[] => [
  { x: X(2150), y: Y(STATION.h) - 290, r: 380, a: 0.9, color: '#FDE68A' },
  ...STOPS.map(s => ({ x: X(s.shrine.x + s.shrine.w / 2), y: Y(s.h) - 200, r: 300, a: 0.95, color: '#FEF08A' })),
  { x: X(BOOTH.cab + 100), y: Y(BOOTH.h) - 80, r: 160, a: 0.8, color: '#7DD3FC' },
  { x: X(120), y: GY - 250, r: 200, a: 0.8, color: '#FBBF24' },
];
export { LEVER_MEMO };
