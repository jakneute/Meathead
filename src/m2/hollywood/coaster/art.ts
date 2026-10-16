// Thrones of the Stars, drawn (the final pass: peak SNES, fake 3D, one eye for the scene: paint.ts). Back to front:
// the backdrop (far.ts: the boulevard's sky and far off, sinking as he climbs, the rest of the monstrosity across the
// park in two rows, the park under it all); the plaza going back, the hedge on its far side and the structure going
// back on it (structure.ts); the track he rides (a crimson box spine, the gold rails lit along their tops, the ties, the
// chain up the lifts, the brake fins and the booster tires; lattice legs down to their piers where it's the right way
// up); the queue (its switchbacks going back full of guests, the queue house under the ramps, its posters, the rails,
// the arch, the signs, Steve's standee); the station under its gold crown of a canopy; the three stops (each deck's
// floor of bathroom tile going back to the set's wall (set.ts), the shrine (shrine.ts), the catwalks, the doors, the
// pylons); the control booth and its lever; Steve's billboard. The train: three golden throne-toilets on wheels, in
// two layers (the back behind him, the near side in front: he's sat down in it).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { drawPerson } from '../../adventure/temple/people';
import { type Ctx, type CView, INK, cview, vis, pal, lattice, rivets, hazard, goldStar, chains, PORCELAIN, CHROME, CRIMSON } from './paint';
import {
  box, checker, mix, hash, poly, at, atDepth, still, stillAt, signW, STEEL, BRASS, VELVET, STEVE, ramp6, hour, lit, board, deco, bulbs, plain,
  words, sideBack, topBack, underBack, ball,
} from '../blvd/kit';
import { paintStandee, steveCard, velvetRopePaint } from '../blvd/props';
import { drawCoasterFar } from './far';
import { drawStructureBack, drawFloor } from './structure';
import { drawSet, deckTop, deckFront, deckRail, catwalk, door, pylon, WALL_D, WALL_H } from './set';
import { drawShrine, drawShrineTitle, drawBooth } from './shrine';
import {
  x0, X, Y, GY, QUEUE_GROUND, STATION, RAILS, RAIL_H, STOPS, BOOTH, CAR_GAP, CARS, STEVE_STANDEE, queueH, parkAt,
  LAUNCHED_MEMO, WALKER_MEMO, LEVER_MEMO, CLEARED_MEMO, type Place,
} from './layout';
import { tracks, at as trackAt, STEP, Mode, type Track } from './track';
import type { Coaster, QGuest } from './state';

export { GY };

// ---------------------------------------------------------------------------------------------------------------
// Screen space: the sky, the far off

export const drawCoasterBackdrop = (c: Ctx, state: GameState) => { drawCoasterFar(c, state); return true; };

// ---------------------------------------------------------------------------------------------------------------
// The track

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
    ch.push({ i0: i, i1, x0: a, x1: b, y0: t, y1: u });
  }
  CHUNKS.set(tr, ch);
  return ch;
};
/** On a deck (where the deck's own floor carries the rail: no legs). */
const onDeck = (x: number, y: number) => (y > Y(STATION.h) - 4 && y < Y(STATION.h) + 4 && x < X(STATION.b + 60)) || STOPS.some(s => x > X(s.a - 60) && x < X(s.b + 60) && Math.abs(y - Y(s.h)) < 4);
/** A leg down from here: the track the right way up, going either way (the cars sat on top of it: not climbing a
 *  loop, not mid-roll, not hung under the rail: there a leg off the rail comes down right through the cars and him),
 *  not on a deck, up off the park. */
const legAt = (p: { x: number; y: number; a: number; roll: number }) => Math.cos(p.a) * Math.cos(p.roll) >= 0.5 && Math.abs(Math.cos(p.roll)) >= 0.9 && !onDeck(p.x, p.y) && p.y <= GY - 30;

/** A point off the rail along its normal (rolled with the train), `off` px (+ under it). */
const offAt = (p: { x: number; y: number; a: number; roll: number }, off: number): [number, number] => {
  const k = Math.cos(p.roll);
  return [p.x - Math.sin(p.a) * k * off, p.y + Math.cos(p.a) * k * off];
};
const drawTrackPath = (c: Ctx, v: CView, tr: Track, f: number) => {
  const pts = tr.pts, S = pal().steel, Cr = pal().crimson, G = pal().gold;
  const vis0 = v.vx - 80, vis1 = v.vx + v.vw + 80, vt = v.vy - 80, vb = v.vy + v.vh + 80;
  for (const ch of chunksOf(tr)) {
    if (ch.x1 < vis0 || ch.x0 > vis1 || ch.y0 > vb) continue;
    // (the legs: from the track down to the park, now and then, where the track's the right way up)
    for (let i = ch.i0; i < ch.i1; i++) {
      if (i % 50 !== 0) continue;
      const p = pts[i];
      if (!legAt(p) || p.x < vis0 || p.x > vis1) continue;
      const top = Math.max(p.y + 12, vt - 60), foot = Math.min(GY, vb + 60);
      if (foot > top) lattice(c, p.x, top, foot, 20, S, 52, 0, foot >= GY, p.y + 12);
      if (p.y + 12 >= vt - 60) { box(c, p.x - 14, p.y + 8, 28, 6, INK); box(c, p.x - 13, p.y + 9, 26, 4, S[3]); box(c, p.x - 13, p.y + 9, 26, 1, S[5]); }
    }
    if (ch.y1 < vt) continue;
    // (the spine and the rails, along the points (every third), rolled with the train)
    const spine: [number, number][] = [], rail: [number, number][] = [];
    for (let i = ch.i0; i <= ch.i1; i += 3) { spine.push(offAt(pts[i], 7)); rail.push(offAt(pts[i], -2)); }
    if (ch.i1 % 3) { spine.push(offAt(pts[ch.i1], 7)); rail.push(offAt(pts[ch.i1], -2)); }
    const path = (ps: [number, number][]) => () => { c.moveTo(ps[0][0], ps[0][1]); for (let k = 1; k < ps.length; k++) c.lineTo(ps[k][0], ps[k][1]); };
    const sp = path(spine), rl = path(rail);
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = INK; c.lineWidth = 13; c.beginPath(); sp(); c.stroke();
    c.strokeStyle = Cr[1]; c.lineWidth = 11; c.beginPath(); sp(); c.stroke();
    c.save(); c.translate(-1, -1.5); c.strokeStyle = Cr[2]; c.lineWidth = 8; c.beginPath(); sp(); c.stroke();
    c.translate(-1, -1.5); c.strokeStyle = Cr[4]; c.lineWidth = 2; c.beginPath(); sp(); c.stroke(); c.restore();
    // (the ties across, steel)
    c.lineCap = 'butt';
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath();
    for (let i = ch.i0; i < ch.i1; i += 5) { const [ax, ay] = offAt(pts[i], -6), [bx, by] = offAt(pts[i], 10); c.moveTo(ax, ay); c.lineTo(bx, by); }
    c.stroke();
    c.strokeStyle = S[3]; c.lineWidth = 2; c.beginPath();
    for (let i = ch.i0; i < ch.i1; i += 5) { const [ax, ay] = offAt(pts[i], -5), [bx, by] = offAt(pts[i], 9); c.moveTo(ax, ay); c.lineTo(bx, by); }
    c.stroke();
    // (what the track's doing: the chain up the lifts (crawling), the brake fins, the booster tires)
    for (let i = ch.i0; i < ch.i1; i += 2) {
      const p = pts[i];
      if (p.mode === Mode.Lift && (i + (f >> 1)) % 4 === 0) { const [qx, qy] = offAt(p, 2); box(c, qx - 2, qy - 2, 4, 4, INK); box(c, qx - 1, qy - 1, 2, 2, S[2]); }
      else if (p.mode === Mode.Brake && i % 6 === 0) { const [qx, qy] = offAt(p, 12); box(c, qx - 3, qy - 2, 6, 6, INK); box(c, qx - 2, qy - 1, 4, 4, '#B4642A'); box(c, qx - 2, qy - 1, 4, 1, '#E89A5A'); }
      else if ((p.mode === Mode.Boost || p.mode === Mode.Launch) && i % 8 === 0) { const [qx, qy] = offAt(p, 12); c.fillStyle = INK; c.beginPath(); c.arc(qx, qy, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#3A3A40'; c.beginPath(); c.arc(qx, qy, 2.5, 0, Math.PI * 2); c.fill(); box(c, qx - 1, qy - 1, 1, 1, '#8A8A90'); }
    }
    // (the gold rails over it, lit along their tops)
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); rl(); c.stroke();
    c.strokeStyle = G[2]; c.lineWidth = 4; c.beginPath(); rl(); c.stroke();
    c.save(); c.translate(-0.5, -1); c.strokeStyle = G[4]; c.lineWidth = 2; c.beginPath(); rl(); c.stroke();
    c.translate(-0.5, -0.5); c.strokeStyle = G[5]; c.lineWidth = 1; c.beginPath(); rl(); c.stroke(); c.restore();
    c.lineCap = 'butt'; c.lineJoin = 'miter';
  }
};

/** Every track (the three rides, the launch, the way back, the station's way in), and the EXPERIMENTAL section's end. */
const drawTracks = (c: Ctx, v: CView, state: GameState) => {
  const T = tracks(), launched = !!state.stageMemo[LAUNCHED_MEMO], f = state.frame;
  for (const tr of [T.r1, T.r2, T.r3, T.back, T.arrive, T.launch]) drawTrackPath(c, v, tr, f);
  // The EXPERIMENTAL section: the track just stops, pointed at the sky, a buffer on its end; bent up and torn after the
  // launch (they never fixed it)
  const end = T.launch.pts[T.launch.pts.length - 1];
  if (!vis(v, end.x - 300, end.x + 300, end.y - 300, end.y + 300)) return;
  const G = pal().gold, Cr = pal().crimson, S = pal().steel;
  c.save(); c.translate(end.x, end.y); c.rotate(end.a);
  if (launched) {
    // (the rails torn and curled up off the end, the spine split, bolts hanging)
    c.lineCap = 'round';
    for (const [w, col] of [[6, INK], [4, G[2]], [1, G[5]]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(0, -2); c.quadraticCurveTo(40, -10, 54, -50); c.stroke(); }
    for (const [w, col] of [[11, INK], [8, Cr[2]], [2, Cr[4]]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(0, 7); c.quadraticCurveTo(30, 12, 46, -16); c.stroke(); }
    c.lineCap = 'butt';
    for (let k = 0; k < 4; k++) { box(c, 10 + k * 12, -14 - k * 6, 7, 4, INK); box(c, 11 + k * 12, -13 - k * 6, 5, 2, S[3]); }
  } else {
    // (the buffer stop: a hazard-striped block on the rail's end)
    box(c, -6, -14, 14, 28, INK); hazard(c, -5, -13, 12, 26, 5);
  }
  c.restore();
  // (the sign on its post under the end: held up, stenciled)
  const sx = end.x - 40, sy = end.y + 60;
  box(c, sx - 4, sy, 8, 150, INK); box(c, sx - 3, sy, 6, 150, S[3]); box(c, sx - 3, sy, 2, 150, S[5]);
  still(c, `hwc-endsign-${launched ? 1 : 0}`, sx, sy - 18, -84, -28, 168, 56, g => {
    if (launched) board(g, 0, 0, ['TRACK CLOSED', 'SORRY'], { sx: 1, sy: 1, fill: '#FEF3C7', stencil: true }, '#7F1D1D', STEEL, 7);
    else board(g, 0, 0, ['EXPERIMENTAL', 'TRACK ENDS'], { sx: 1, sy: 1, fill: '#18181B', stencil: true }, '#FACC15', STEEL, 7);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The train: three golden throne-toilets on wheels (front first). Local: x along the rail, up is -y. `layer` 'back'
// (the bogie, the base, the throne's back, the tank, the seat: behind whoever's sat in it), 'front' (the throne's near
// side and arm, the bowl's front, the lap bar: in front of him, so he's sat down in it, just his top half showing). Sat
// in the way the other rides' cars sit him (the cart's RIDE_SINK, the cart's pose: cartSeat): feet SINK over the rail
// at the car's middle, hips under the arm's top.

/** How far over the rail his feet sit in the front car (the mine cart's RIDE_SINK). */
export const SINK = 14;
/** How a car (and whoever's in it) is squashed up and down by the track's roll: on its side, nearly flat; hung under
 *  the rail, upside down. */
export const rollScale = (roll: number) => { const sc = Math.cos(roll); return Math.abs(sc) < 0.12 ? 0.12 * Math.sign(sc || 1) : sc; };
const car = (c: Ctx, layer: 'back' | 'front', k: number) => {
  const G = pal().gold, V = pal().velvet, P = pal().porcelain, S = pal().steel;
  if (layer === 'back') {
    // (the bogie: a steel frame, its wheels (stepped, a hub, a glint), an upstop wheel under)
    box(c, -29, -11, 58, 11, INK); box(c, -28, -10, 56, 9, S[2]); box(c, -28, -10, 56, 2, S[4]); box(c, -28, -3, 56, 2, S[1]);
    rivets(c, -24, 24, -8, 8, S);
    for (const wx of [-18, 18]) {
      c.fillStyle = INK; c.beginPath(); c.arc(wx, -2, 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = S[1]; c.beginPath(); c.arc(wx, -2, 6, 0, Math.PI * 2); c.fill();
      c.fillStyle = S[3]; c.beginPath(); c.arc(wx - 1, -3, 4, 0, Math.PI * 2); c.fill();
      c.fillStyle = S[5]; c.beginPath(); c.arc(wx, -2, 1.6, 0, Math.PI * 2); c.fill();
    }
    // (the gold base: no lit top on it: it's not for standing on)
    box(c, -31, -25, 62, 16, INK); box(c, -30, -24, 60, 14, G[3]); box(c, -30, -24, 3, 14, G[4]); box(c, -30, -15, 60, 3, G[2]); box(c, -30, -12, 60, 2, G[1]);
    checker(c, -30, -17, 60, 2, G[2], 0, 2);
    for (let x = -24; x < 28; x += 12) { box(c, x, -21, 2, 2, G[1]); box(c, x, -21, 1, 1, G[5]); }
    // (the throne's back: a carved gold frame, red velvet tufted in it, a star on top)
    box(c, -35, -91, 18, 70, INK);
    box(c, -34, -90, 16, 68, G[3]); box(c, -34, -90, 3, 68, G[5]); box(c, -21, -90, 3, 68, G[1]); box(c, -34, -90, 16, 2, G[4]);
    for (let y = -84; y < -24; y += 12) box(c, -34, y, 2, 2, G[1]);
    box(c, -31, -85, 10, 58, INK); box(c, -30, -84, 8, 56, V[2]); box(c, -30, -84, 2, 56, V[3]); box(c, -24, -84, 2, 56, V[1]);
    for (let y = -79; y < -32; y += 9) { box(c, -28, y, 3, 3, V[1]); box(c, -28, y, 1, 1, G[4]); }
    box(c, -36, -96, 20, 6, INK); box(c, -35, -95, 18, 4, G[4]); box(c, -35, -95, 18, 1, G[5]);
    goldStar(c, -26, -104, 8);
    // (the far arm, behind him: in shade)
    box(c, -23, -55, 48, 8, INK); box(c, -22, -54, 46, 6, G[2]); box(c, -22, -54, 46, 1, G[3]);
    // (the tank behind the seat: white porcelain, stepped; its lid; a gold handle)
    box(c, -21, -65, 14, 32, INK); box(c, -20, -64, 12, 30, P[3]); box(c, -20, -64, 3, 30, P[4]); box(c, -11, -64, 3, 30, P[2]);
    box(c, -22, -68, 16, 5, INK); box(c, -21, -67, 14, 3, P[4]); box(c, -21, -67, 14, 1, P[5]);
    box(c, -9, -58, 4, 2, G[4]);
    // (the seat: the ring, lit; the bowl down under him in shade)
    box(c, -13, -41, 40, 8, INK); box(c, -12, -40, 38, 6, k ? G[4] : P[4]); box(c, -12, -40, 38, 1, k ? G[5] : P[5]); box(c, -12, -36, 38, 2, k ? G[2] : P[2]);
    box(c, -8, -35, 32, 14, P[2]); box(c, -8, -35, 32, 3, P[1]);
  } else {
    // The near side of the throne: a gold panel from the base up to the arm (his hips and legs down behind it),
    // stepped from its lit top to its dark foot, a velvet inset tufted, a star
    box(c, -27, -49, 54, 40, INK);
    box(c, -26, -48, 52, 38, G[3]); box(c, -26, -48, 52, 4, G[4]); box(c, -26, -48, 52, 1, G[5]); box(c, -26, -48, 3, 38, G[5]);
    box(c, -26, -21, 52, 9, G[2]); checker(c, -26, -23, 52, 2, G[2], 0, 2); box(c, -26, -13, 52, 3, G[1]);
    box(c, 22, -44, 4, 22, G[2]);
    box(c, -20, -41, 36, 20, INK); box(c, -19, -40, 34, 18, V[2]); box(c, -19, -40, 34, 3, V[3]); box(c, -19, -40, 2, 18, V[4]); box(c, -19, -25, 34, 3, V[1]);
    for (const bx of [-13, 9]) for (const by of [-35, -28]) { box(c, bx, by, 3, 3, V[0]); box(c, bx, by, 1, 1, G[4]); }
    goldStar(c, -2, -31, 5);
    // (the bowl's front, porcelain, out the front of it)
    const bowl = () => { c.beginPath(); c.moveTo(22, -42); c.lineTo(38, -42); c.quadraticCurveTo(41, -24, 28, -15); c.lineTo(22, -15); c.closePath(); };
    c.fillStyle = INK; c.save(); c.translate(0.5, 0.5); bowl(); c.fill(); c.restore();
    c.save(); bowl(); c.clip();
    box(c, 20, -44, 22, 30, P[3]); box(c, 20, -44, 6, 30, P[4]); box(c, 23, -42, 2, 14, P[5]); box(c, 33, -44, 9, 30, P[2]); box(c, 20, -22, 22, 8, P[1]);
    c.restore();
    c.strokeStyle = INK; c.lineWidth = 1.2; bowl(); c.stroke();
    // (the near arm: rolled gold, a scroll at the front end)
    box(c, -29, -53, 60, 9, INK); box(c, -28, -52, 58, 7, G[3]); box(c, -28, -52, 58, 2, G[5]); box(c, -28, -46, 58, 1, G[1]);
    c.fillStyle = INK; c.beginPath(); c.arc(30, -48, 6.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = G[3]; c.beginPath(); c.arc(30, -48, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = G[4]; c.beginPath(); c.arc(29, -49, 3, 0, Math.PI * 2); c.fill();
    c.fillStyle = G[1]; c.beginPath(); c.arc(30.5, -47.5, 1.6, 0, Math.PI * 2); c.fill();
    box(c, 27, -52, 1, 1, G[5]);
    // (the lap bar: up from the arm's front, over his lap; a padded grip)
    c.lineCap = 'round';
    for (const [w, col] of [[6, INK], [4, S[3]], [1.5, S[5]]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(24, -50); c.quadraticCurveTo(24, -64, 6, -62); c.stroke(); }
    c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(14, -63); c.lineTo(6, -62); c.stroke();
    c.strokeStyle = V[2]; c.lineWidth = 5; c.beginPath(); c.moveTo(14, -63); c.lineTo(6, -62); c.stroke();
    c.lineCap = 'butt';
  }
};
/** The cars' places: along the track (a train going), or parked at a place (level, front at its parked spot). */
export interface CarAt { x: number; y: number; a: number; roll: number }
export const carsOn = (tr: Track, s: number): CarAt[] => {
  const out: CarAt[] = [];
  for (let i = 0; i < CARS; i++) {
    const si = s - i * CAR_GAP;
    if (si >= 0) { const p = trackAt(tr, si); out.push({ x: p.x, y: p.y, a: p.a, roll: p.roll }); }
    else { const p0 = tr.pts[0]; out.push({ x: p0.x + Math.cos(p0.a) * si, y: p0.y + Math.sin(p0.a) * si, a: p0.a, roll: 0 }); }
  }
  return out;
};
export const carsParked = (pl: Place): CarAt[] => { const p = parkAt(pl); return [0, 1, 2].map(i => ({ x: p.x - i * CAR_GAP, y: p.y, a: 0, roll: 0 })); };
export const drawTrain = (c: Ctx, cars: CarAt[], layer: 'back' | 'front', f: number, riderFront = false, lockLight?: boolean) => {
  // (the back car first: the front one's in front of it)
  for (let i = cars.length - 1; i >= 0; i--) {
    const k = cars[i], ridden = riderFront && i === 0;
    if (layer === 'front' && !ridden) continue;
    c.save(); c.translate(k.x, k.y); c.rotate(k.a);
    c.scale(1, rollScale(k.roll));
    car(c, layer, i);
    // (nobody in it: its near side too, here (behind him walking past it); his: in front of him, drawn after him)
    if (layer === 'back' && !ridden) car(c, 'front', i);
    // (the front car's light: red, the lap bar locked; green, hop on)
    if (layer === 'back' && i === 0 && lockLight !== undefined) { box(c, 15, -37, 8, 8, INK); box(c, 16, -36, 6, 6, lockLight ? (f % 30 < 15 ? '#EF4444' : '#7F1D1D') : '#4ADE80'); box(c, 16, -36, 2, 2, '#FFFFFF'); }
    c.restore();
  }
};
/** The train flying (the launch, off the end): the three cars in a line, turning over. */
export const drawFlyingTrain = (c: Ctx, x: number, y: number, rot: number, layer: 'back' | 'front', f: number) => {
  const cars: CarAt[] = [0, 1, 2].map(i => ({ x: x - Math.cos(rot) * i * CAR_GAP, y: y - Math.sin(rot) * i * CAR_GAP, a: rot, roll: 0 }));
  drawTrain(c, cars, layer, f, true);
};

// ---------------------------------------------------------------------------------------------------------------
// The queue and the station

/** How far back the queue's walkways go (the lanes behind him, full of guests). */
const LANE_D = 0.9;
const guestAt = (c: Ctx, g: QGuest, f: number) => {
  const h = queueH(g.rx), x = X(g.rx) + (g.shove > 0 ? g.dir * (30 - g.shove) * 0.8 : 0), y = Y(h);
  c.save(); c.translate(x, y);
  if (g.shove > 0) c.rotate(g.dir * Math.sin((g.shove / 30) * Math.PI) * 0.5);
  const face = (g.seed % 2 ? 1 : -1) as 1 | -1;
  c.scale(face * 0.92, 0.92);
  drawPerson(c, { seed: g.seed, outfit: 'guest', f, pose: g.mad > 0 ? 'point' : g.seed % 5 === 0 ? 'photo' : 'stand', mood: g.mad > 0 ? 'angry' : g.seed % 3 === 0 ? 'bored' : 'happy', shorts: g.seed % 3 === 0, talking: g.mad > 0 && f % 10 < 5 });
  if (g.mad <= 0 && g.seed % 5 === 0) { box(c, 14, -70, 8, 12, INK); box(c, 15, -69, 6, 10, '#27272A'); box(c, 16, -67, 4, 5, f % 120 < 4 ? '#FFFFFF' : '#60A5FA'); }
  c.restore();
};
/** The queue's floor going back from its front edge to the back lane (the ramps too: each a quad). */
const laneTops = (c: Ctx, v: CView) => {
  const eye = v.eye, R = ramp6(hour('#4A3A3E')), K = pal().concrete;
  for (const [a, b, ha, hb] of QUEUE_GROUND) {
    if (b < a + 1 || !vis(v, X(a), X(b), Y(Math.max(ha, hb)) - 10, Y(Math.min(ha, hb)) + 10)) continue;
    const n = 3;
    for (let i = 0; i < n; i++) {
      const d0 = 1 - ((1 - LANE_D) * i) / n, d1 = 1 - ((1 - LANE_D) * (i + 1)) / n;
      const col = a >= STATION.a ? K[4 - Math.min(i, 2)] : R[4 - i];
      poly(c, [at(eye, X(a), Y(ha), d0), at(eye, X(b), Y(hb), d0), at(eye, X(b), Y(hb), d1), at(eye, X(a), Y(ha), d1)], col);
    }
    // (rubber matting's ribs, running back)
    if (a < STATION.a) { c.strokeStyle = R[2]; c.lineWidth = 1; c.beginPath(); for (let x = Math.ceil(a / 24) * 24; x < b; x += 24) { const h = ha + ((hb - ha) * (x - a)) / (b - a), [px, py] = at(eye, X(x), Y(h), 1), [qx, qy] = at(eye, X(x), Y(h), LANE_D); c.moveTo(px, py); c.lineTo(qx, qy); } c.stroke(); }
  }
};
/** The lanes going back: stanchions and their velvet ropes along them, the guests waiting in them. */
const BACK_GUESTS: [number, number, number][] = [
  [150, 0.955, 31], [330, 0.93, 44], [470, 0.955, 18], [610, 0.93, 66], [820, 0.955, 9], [960, 0.93, 57], [1140, 0.955, 72],
  [1240, 0.93, 13], [1420, 0.955, 85], [1520, 0.93, 28], [260, 0.93, 90], [700, 0.955, 3],
];
const lanes = (c: Ctx, v: CView, f: number) => {
  const eye = v.eye;
  for (const d of [0.93, 0.955]) {
    const [lo, hi] = [v.eye.x + (v.vx - 80 - v.eye.x) / d, v.eye.x + (v.vx + v.vw + 80 - v.eye.x) / d];
    atDepth(c, eye, d, () => {
      const G = BRASS.map(cc => hour(cc)), V = VELVET.map(cc => hour(cc));
      // (the people first: the ropes are in front of them)
      for (const [rx, gd, seed] of BACK_GUESTS) {
        if (gd !== d || X(rx) < lo - 40 || X(rx) > hi + 40) continue;
        c.save(); c.translate(X(rx), Y(queueH(rx))); c.scale((seed % 2 ? 1 : -1) * 0.92, 0.92);
        drawPerson(c, { seed, outfit: 'guest', f, pose: seed % 4 === 0 ? 'photo' : 'stand', mood: seed % 3 ? 'bored' : 'happy', shorts: seed % 3 === 0 });
        c.restore();
      }
      const step = 64;
      for (let rx = Math.floor((lo - x0) / step) * step; X(rx) < hi && rx < STATION.a - 40; rx += step) {
        if (rx < -200) continue;
        const x = X(rx), y = Y(queueH(rx)), nx = X(rx + step), ny = Y(queueH(rx + step));
        if (rx + step < STATION.a - 40) for (const [w, col, o] of [[5, INK, 0], [3, V[2], 0], [1, V[4], -1]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x, y - 30 + o); c.quadraticCurveTo((x + nx) / 2, (y + ny) / 2 - 16 + o, nx, ny - 30 + o); c.stroke(); }
        box(c, x - 3, y - 36, 6, 36, INK); box(c, x - 2, y - 35, 4, 35, G[3]); box(c, x - 2, y - 35, 1, 35, G[5]);
        box(c, x - 6, y - 4, 12, 4, INK); box(c, x - 5, y - 3, 10, 3, G[2]);
        ball(c, x, y - 38, 3, G[4]);
      }
    });
  }
};
/** The queue house: the mass under the ramps and the station (crimson stucco, a gold band, posters in frames). */
const paintPosterThrones = (g: Ctx) => {
  board(g, 0, -30, ['THRONES'], deco('#F2C24A', '#4C0519', 2, 1), '#5A0820', BRASS, 5);
  board(g, 0, 0, ['SIT WHERE', 'THE STARS SAT'], plain(1, 1, '#FEF3C7'), '#7F1D1D', BRASS, 5);
};
const paintPosterToilet = (g: Ctx) => {
  const G = BRASS.map(c => hour(c));
  box(g, -34, -46, 68, 92, INK); box(g, -33, -45, 66, 90, G[2]); box(g, -33, -45, 66, 1, G[5]); box(g, -33, -45, 1, 90, G[4]);
  box(g, -29, -41, 58, 82, hour('#2A0A18'));
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.fillStyle = hour('#4C0519'); g.beginPath(); g.moveTo(0, -6); g.lineTo(Math.cos(a - 0.2) * 40, -6 + Math.sin(a - 0.2) * 40); g.lineTo(Math.cos(a + 0.2) * 40, -6 + Math.sin(a + 0.2) * 40); g.closePath(); g.fill(); }
  box(g, -29, -41, 58, 2, hour('#5A1426'));
  // (a gold toilet, spotlit)
  box(g, -12, -24, 12, 18, INK); box(g, -11, -23, 10, 16, G[3]); box(g, -11, -23, 3, 16, G[5]);
  box(g, -4, -8, 22, 6, INK); box(g, -3, -7, 20, 4, G[4]);
  box(g, -1, -3, 16, 12, INK); box(g, 0, -2, 14, 10, G[3]); box(g, 0, -2, 4, 10, G[5]);
  words(g, 'NOW', 0, 26, plain(1, 1, '#FDE68A')); words(g, 'SEATING', 0, 36, plain(1, 1, '#FDE68A'));
};
const queueHouse = (c: Ctx, v: CView) => {
  const a = 700, b = STATION.b;
  if (!vis(v, X(a), X(b), Y(STATION.h), GY)) return;
  const R = ramp6(hour('#6A0E24')), G = pal().gold, K = pal().concrete;
  // (its face: from the ramps' edges down to the park; banded darker going down; a plinth of concrete at its foot)
  c.fillStyle = R[3]; c.beginPath(); c.moveTo(X(a), GY);
  for (const [qa, qb, ha, hb] of QUEUE_GROUND) if (qa >= a) { c.lineTo(X(qa), Y(ha) + 8); c.lineTo(X(qb), Y(hb) + 8); }
  c.lineTo(X(b), GY); c.closePath(); c.fill();
  const l = Math.max(X(a), v.vx - 40), r = Math.min(X(b), v.vx + v.vw + 40);
  box(c, l, GY - 40, r - l, 40, R[2]); checker(c, l, GY - 42, r - l, 2, R[2], 0, 2);
  box(c, l, GY - 16, r - l, 16, K[2]); box(c, l, GY - 16, r - l, 2, K[4]);
  // (the gold band under the walkways' edges)
  for (const [qa, qb, ha, hb] of QUEUE_GROUND) {
    if (qa < a) continue;
    for (const [o, col, w] of [[8, INK, 8], [9, G[3], 6], [9, G[5], 1], [14, G[1], 1]] as const) { c.fillStyle = col; c.beginPath(); c.moveTo(X(qa), Y(ha) + o); c.lineTo(X(qb), Y(hb) + o); c.lineTo(X(qb), Y(hb) + o + w); c.lineTo(X(qa), Y(ha) + o + w); c.closePath(); c.fill(); }
  }
  // (pilasters every so far, stepped)
  for (let rx = a + 100; rx < b; rx += 200) { const x = X(rx), h = queueH(rx); if (x < l - 30 || x > r + 30 || h < 80) continue; box(c, x - 9, Y(h) + 22, 18, GY - Y(h) - 62, INK); box(c, x - 8, Y(h) + 22, 16, GY - Y(h) - 62, R[4]); box(c, x - 8, Y(h) + 22, 4, GY - Y(h) - 62, R[5]); box(c, x + 4, Y(h) + 22, 4, GY - Y(h) - 62, R[2]); }
  // (the posters: THRONES, a gold toilet NOW SEATING; Steve's, yellow)
  const POS: [number, 'thrones' | 'toilet' | 'steve'][] = [[1100, 'steve'], [1300, 'steve'], [1700, 'thrones'], [1900, 'steve'], [2100, 'toilet'], [2300, 'thrones'], [2500, 'steve']];
  for (const [rx, kind] of POS) {
    const x = X(rx), wt = Y(queueH(rx)) + 16, wb = GY - 42, y = Math.round((wt + wb) / 2);
    if (x < l - 80 || x > r + 80) continue;
    // (a low wall gets a flier; the station's tall one, the framed posters)
    if (wb - wt < 110) { if (wb - wt >= 50 && kind === 'steve') still(c, `hwc-qflier-${rx % 3}`, x, y, -24, -32, 48, 64, g => steveCard(g, 0, 0, 0.8, rx, 'flier')); continue; }
    if (kind === 'steve') still(c, `hwc-qsteve-${rx % 3}`, x, y, -50, -66, 100, 132, g => steveCard(g, 0, 0, 1.4, rx, 'poster'));
    else if (kind === 'toilet') still(c, 'hwc-qtoilet', x, y, -40, -50, 80, 100, paintPosterToilet);
    else still(c, 'hwc-qthrones', x, y, -70, -50, 140, 70, paintPosterThrones);
  }
  // (the walkways' front edges: their lit lips)
  const Lp = pal().lip;
  for (const [qa, qb, ha, hb] of QUEUE_GROUND) {
    if (qa < -200) continue;
    for (const [o, col, w] of [[-1, INK, 9], [0, Lp[1], 4], [0, Lp[2], 2], [0, Lp[3], 1]] as const) { c.fillStyle = col; c.beginPath(); c.moveTo(X(qa), Y(ha) + o); c.lineTo(X(qb), Y(hb) + o); c.lineTo(X(qb), Y(hb) + o + w); c.lineTo(X(qa), Y(ha) + o + w); c.closePath(); c.fill(); }
  }
};

/** The arch over the way in: its posts, the header (THRONES in bulbs), QUEUE; the PA's horn. Feet at 0. */
const paintArch = (g: Ctx) => {
  const S = STEEL.map(c => hour(c)), G = BRASS, R = ramp6(hour('#5A0820'));
  for (const px of [-84, 84]) { box(g, px - 8, -232, 16, 232, INK); box(g, px - 7, -232, 14, 232, G[3]); box(g, px - 7, -232, 4, 232, G[5]); box(g, px + 3, -232, 4, 232, G[1]); for (let y = -220; y < -10; y += 30) box(g, px - 7, y, 14, 2, G[2]); box(g, px - 12, -10, 24, 10, INK); box(g, px - 11, -9, 22, 9, S[2]); box(g, px - 11, -9, 22, 2, S[4]); }
  box(g, -114, -286, 228, 62, INK); box(g, -112, -284, 224, 58, G[2]); box(g, -112, -284, 224, 2, G[5]); box(g, -112, -284, 2, 58, G[4]);
  box(g, -106, -278, 212, 46, R[2]); for (let y = -278; y < -232; y += 8) box(g, -106, y, 212, 4, R[3]);
  box(g, -106, -244, 212, 12, R[1]);
  signText2(g, 'QUEUE', 0, -235);
  // (the horn on its bracket)
  box(g, 80, -304, 12, 8, INK); box(g, 81, -303, 10, 6, S[3]);
  poly(g, [[90, -306], [110, -314], [110, -284], [90, -292]], INK); poly(g, [[91, -305], [108, -312], [108, -286], [91, -293]], S[3]); poly(g, [[91, -305], [108, -312], [108, -305], [91, -299]], S[5]);
};
const signText2 = (g: Ctx, t: string, x: number, y: number) => words(g, t, x, y, plain(1, 1, '#FDE68A', '#2A0408'));
/** A sign on a post: its board up top. Feet at 0. */
const paintPostSign = (g: Ctx, lines: string[], bg: string, ink: string, h: number, sub?: string) => {
  const S = STEEL.map(c => hour(c));
  box(g, -3, -h, 6, h, INK); box(g, -2, -h, 4, h, S[3]); box(g, -2, -h, 1, h, S[5]);
  box(g, -8, -4, 16, 4, INK); box(g, -7, -3, 14, 3, S[2]);
  board(g, 0, -h - 12, lines, plain(1, 1, ink), bg, S, 6);
  if (sub) board(g, 0, -h + 12, [sub], { sx: 2, sy: 2, fill: ['#FFF0A8', '#E8C25A', '#C8962E', '#9A6A1C'], dither: true, shadow: '#3A2408' }, '#2A1A1A', BRASS, 5);
};

/** What of the queue and the station's set back (behind the track): the lanes going back and their guests, the
 *  station's floor, the set behind it, Steve's poster on it. */
const drawQueueBack = (c: Ctx, v: CView, state: GameState) => {
  if (!vis(v, X(-260), X(STATION.b + 100), Y(STATION.h) - 340, GY)) return;
  laneTops(c, v);
  lanes(c, v, state.frame);
  if (vis(v, X(STATION.a - 100), X(STATION.b + 100), Y(STATION.h) - 320, Y(STATION.h))) {
    const y = Y(STATION.h);
    deckTop(c, v, 'station', X(STATION.a), X(STATION.b), y);
    drawSet(c, v, 'station', X(STATION.a + 70), X(STATION.b - 10), y, [[X(STATION.b - 190), X(STATION.b - 50)], [X(1980) - 60, X(1980) + 60]], []);
    atDepth(c, v.eye, WALL_D, () => still(c, 'hwc-stposter', X(1980), y - 150, -50, -66, 100, 132, g => steveCard(g, 0, 0, 1.4, 3, 'poster')));
  }
};
const drawQueue = (c: Ctx, v: CView, state: GameState, co: Coaster) => {
  const f = state.frame;
  if (!vis(v, X(-260), X(STATION.b + 100), Y(STATION.h) - 340, GY)) return;
  queueHouse(c, v);
  deckRail(c, v, X(STATION.a), X(STATION.b), Y(STATION.h));
  // The way in: the arch, the wait; the FAST PASS lane's sign (still a three-hour wait)
  const ax = X(120);
  if (vis(v, ax - 130, ax + 130, GY - 320, GY)) {
    stillAt(c, v, 0.975, 'hwc-arch', ax, GY, -130, -320, 260, 322, paintArch);
    atDepth(c, v.eye, 0.975, () => words(c, 'THRONES', ax, GY - 251, bulbs(3, 3, '#FBBF24', lit() || f % 30 < 24)));
  }
  if (vis(v, X(250) - 80, X(250) + 80, GY - 170, GY)) stillAt(c, v, 0.97, 'hwc-wait', X(250), GY, -80, -170, 160, 172, g => paintPostSign(g, ['WAIT FROM HERE'], '#F8FAFC', '#18181B', 120, '4 HOURS'));
  if (vis(v, X(1100) - 80, X(1100) + 80, Y(110) - 190, Y(110))) stillAt(c, v, 0.97, 'hwc-fastpass', X(1100), Y(110), -90, -190, 180, 192, g => paintPostSign(g, ['FAST PASS LANE', 'WAIT: 3 HOURS'], '#FDE68A', '#18181B', 140));
  // The rails between the lanes (low: over them): chrome stanchions on a rail, the velvet along them
  const G = BRASS.map(cc => hour(cc)), V = pal().velvet, Ch = CHROME.map(cc => hour(cc)), Lp = pal().lip;
  for (const [rx, h] of RAILS) {
    const x = X(rx), y = Y(h);
    if (!vis(v, x - 70, x + 70, y - 50, y)) continue;
    for (const s of [-1, 1]) for (const [w, col, o] of [[5, INK, 0], [3, V[2], 0], [1, V[4], -1]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x, y - 28 + o); c.quadraticCurveTo(x + s * 30, y - 14 + o, x + s * 60, y - 26 + o); c.stroke(); }
    box(c, x - 6, y - RAIL_H - 1, 12, RAIL_H + 1, INK); box(c, x - 5, y - RAIL_H, 10, RAIL_H, Ch[3]); box(c, x - 5, y - RAIL_H, 3, RAIL_H, Ch[5]); box(c, x + 2, y - RAIL_H, 3, RAIL_H, Ch[1]);
    box(c, x - 9, y - 5, 18, 5, INK); box(c, x - 8, y - 4, 16, 4, G[2]); box(c, x - 8, y - 4, 16, 1, G[4]);
    box(c, x - 6, y - RAIL_H - 3, 12, 4, Lp[1]); box(c, x - 6, y - RAIL_H - 3, 12, 2, Lp[2]);
  }
  // Steve's standee, in the queue (yellow)
  if (vis(v, X(STEVE_STANDEE) - 60, X(STEVE_STANDEE) + 60, Y(queueH(STEVE_STANDEE)) - 150, Y(queueH(STEVE_STANDEE)))) stillAt(c, v, 0.975, 'standee', X(STEVE_STANDEE), Y(queueH(STEVE_STANDEE)), -52, -140, 104, 152, paintStandee);
  // The station: its floor, the set behind it, the canopy (a gold crown) on its columns, BOARDING, the staff door,
  // its end wall
  if (vis(v, X(STATION.a - 100), X(STATION.b + 100), Y(STATION.h) - 320, Y(STATION.h))) {
    const y = Y(STATION.h);
    canopy(c, v, y, f);
    door(c, v, X(STATION.b - 120), y, 0, 'STAFF ONLY', '#FCA5A5', '#18181B', undefined, 'restroom', 'station');
  }
  for (const g of co.guests) if (vis(v, X(g.rx) - 40, X(g.rx) + 40, Y(queueH(g.rx)) - 90, Y(queueH(g.rx)))) guestAt(c, g, f);
};
/** The station's canopy: gold fluted columns (front and back), the crimson fascia in its gold frame, the crown's
 *  points along the top with their bulbs (chasing), its top going back; BOARDING hung under it. */
const canopy = (c: Ctx, v: CView, y: number, f: number) => {
  const G = pal().gold, R = ramp6(hour('#6A0820')), eye = v.eye, a = X(STATION.a), b = X(STATION.b), top = y - 274;
  const cols = [STATION.a + 40, 2100, STATION.b - 60];
  // (the back columns, at the wall)
  atDepth(c, eye, WALL_D, () => { for (const rx of cols) { box(c, X(rx) - 1, top + 28, 14, y - top - 28, INK); box(c, X(rx), top + 28, 12, y - top - 28, G[2]); box(c, X(rx), top + 28, 3, y - top - 28, G[3]); } });
  topBack(c, eye, a, b, top, 1, WALL_D, R, 3);
  underBack(c, eye, a, b, top + 28, 1, WALL_D, R, 3);
  // (the front columns: fluted, stepped, a capital and a base)
  for (const rx of cols) {
    const x = X(rx);
    box(c, x - 1, top + 28, 14, y - top - 28, INK);
    box(c, x, top + 28, 12, y - top - 28, G[3]); box(c, x, top + 28, 3, y - top - 28, G[5]); box(c, x + 9, top + 28, 3, y - top - 28, G[1]);
    for (const fx of [x + 4, x + 7]) box(c, fx, top + 34, 1, y - top - 46, G[2]);
    box(c, x - 4, top + 28, 20, 6, INK); box(c, x - 3, top + 29, 18, 4, G[4]);
    box(c, x - 4, y - 8, 20, 8, INK); box(c, x - 3, y - 7, 18, 7, G[2]); box(c, x - 3, y - 7, 18, 1, G[4]);
  }
  // (the fascia: a crimson band in its gold frame)
  box(c, a, top, b - a, 28, INK); box(c, a + 2, top + 2, b - a - 4, 24, G[3]); box(c, a + 2, top + 2, b - a - 4, 1, G[4]);
  box(c, a + 5, top + 5, b - a - 10, 18, R[3]); box(c, a + 5, top + 5, b - a - 10, 2, R[4]); box(c, a + 5, top + 20, b - a - 10, 3, R[1]);
  // (the crown's points, a bulb on each, chasing)
  for (let x = a, k = 0; x < b; x += 50, k++) {
    poly(c, [[x, top + 1], [x + 25, top - 29], [x + 50, top + 1]], INK);
    poly(c, [[x + 2, top], [x + 25, top - 26], [x + 48, top]], G[3]);
    poly(c, [[x + 2, top], [x + 25, top - 26], [x + 25, top]], G[4]);
    const on = (k + (f >> 3)) % 3 === 0 || lit();
    box(c, x + 21, top - 34, 8, 8, INK); box(c, x + 22, top - 33, 6, 6, on ? '#FFF6C8' : '#C8A040'); box(c, x + 22, top - 33, 2, 2, '#FFFFFF');
  }
  // (BOARDING, hung under the fascia on chains)
  chains(c, [X(2300) - 70, X(2300) + 70], top + 28, y - 234);
  still(c, 'hwc-boarding', X(2300), y - 218, -100, -20, 200, 40, g => board(g, 0, 0, ['BOARDING'], deco('#F2C24A', '#4C0519', 3, 2), '#5A0820', BRASS, 8));
};

// ---------------------------------------------------------------------------------------------------------------
// The stops

/** A stop's set back (behind the track): the floor going back, the set along the back (round the doors and the
 *  shrine; its sign clear of the low catwalks), the stop's number on its board. */
const drawStopBack = (c: Ctx, v: CView, i: number) => {
  const s = STOPS[i], dy = Y(s.h), pl = i as Place;
  if (!vis(v, X(s.a - 200), X(s.b + 200), dy - 400, dy + 40)) return;
  deckTop(c, v, pl, X(s.a), X(s.b), dy);
  {
    const keep: [number, number][] = [[X(s.door) - 64, X(s.door) + 64], [X(s.stairs) - 60, X(s.stairs) + 60], [X(s.shrine.x) - 175, X(s.shrine.x + s.shrine.w) + 120]];
    if (s.door2 !== undefined) keep.push([X(s.door2) - 50, X(s.door2) + 50]);
    drawSet(c, v, pl, X(s.a) + 20, X(s.b) - 20, dy, keep, s.ledges.filter(([, h]) => h <= 160).map(([rx, , w]) => [X(rx), X(rx) + w]));
  }
  // (the catwalk's janitor closet: built into a tall tiled plumbing chase that rises off the set's top behind it, so
  // it stands against a wall, never hanging in the air; its pipes up it, the plywood edge going back like the set's)
  if (s.upper) {
    const cx = X(s.upper.x), top = Y(s.h + s.upper.h) - 150, base = dy - WALL_H + 2, hw = 62;
    if (top < base && vis(v, cx - hw - 20, cx + hw + 20, top - 10, base, WALL_D)) {
      const T = ramp6(hour('#8A8E96')), Pp = ramp6(hour('#9A6A3A'));
      atDepth(c, v.eye, WALL_D, () => {
        box(c, cx - hw - 1, top - 1, hw * 2 + 2, base - top + 1, INK);
        box(c, cx - hw, top, hw * 2, base - top, T[3]);
        for (let y = top + 10; y < base; y += 10) box(c, cx - hw, y, hw * 2, 1, T[2]);
        for (let y = top, r = 0; y < base; y += 10, r++) for (let x = cx - hw + (r % 2 ? 0 : 10); x < cx + hw; x += 20) box(c, x, y, 1, Math.min(10, base - y), T[2]);
        box(c, cx - hw, top, 3, base - top, T[4]); box(c, cx + hw - 4, top, 4, base - top, T[1]);
        box(c, cx - hw, top, hw * 2, 3, T[5]);
        // (the pipes up it: a soil stack and a supply line, their brackets)
        for (const [px, pw] of [[cx - hw + 14, 8], [cx + hw - 20, 5]] as const) {
          box(c, px - 1, top, pw + 2, base - top, INK); box(c, px, top, pw, base - top, Pp[3]); box(c, px, top, 2, base - top, Pp[5]);
          for (let y = top + 20; y < base; y += 60) { box(c, px - 3, y, pw + 6, 4, INK); box(c, px - 2, y + 1, pw + 4, 2, T[4]); }
        }
      });
      const P = pal().ply;
      topBack(c, v.eye, cx - hw, cx + hw, top, WALL_D, WALL_D - 0.012, P, 2);
      sideBack(c, v.eye, cx - hw, -1, top, base, WALL_D, WALL_D - 0.012, P, 1, false);
      sideBack(c, v.eye, cx + hw, 1, top, base, WALL_D, WALL_D - 0.012, P, 1, false);
    }
  }
  // (the stop's number, big, on a board at the back on its posts)
  {
    const NL = deco('#F2C24A', '#4C0519', 3, 2), w = signW(`STOP ${i + 1}`, NL) + 30, bx = X(s.a + 200), by = dy - 300;
    if (vis(v, bx - w, bx + w, by - 40, dy)) {
      const S = pal().steel;
      atDepth(c, v.eye, 0.97, () => {
        for (const px of [bx - w / 2 + 14, bx + w / 2 - 14]) { box(c, px - 3, by + 20, 6, dy - by - 20, INK); box(c, px - 2, by + 20, 4, dy - by - 20, S[3]); box(c, px - 2, by + 20, 1, dy - by - 20, S[5]); }
        still(c, `hwc-stopn-${i}`, bx, by, -w / 2 - 10, -30, w + 20, 60, g => board(g, 0, 0, [`STOP ${i + 1}`], NL, '#5A0820', BRASS, 10));
      });
    }
  }
};
const drawStop = (c: Ctx, v: CView, state: GameState, i: number, co: Coaster) => {
  const s = STOPS[i], dy = Y(s.h), f = state.frame;
  if (!vis(v, X(s.a - 200), X(s.b + 200), dy - 1400, GY)) return;
  const run = co.stops[i];
  const passing = co.ride.on && !!co.ride.track && Math.abs(trackAt(co.ride.track, co.ride.s).y - dy) < 30;
  const pl = i as Place;
  // The deck's front and struts
  deckFront(c, v, X(s.a), X(s.b), dy);
  deckRail(c, v, X(s.a), X(s.b), dy);
  // The shrine (its name first: the catwalks go in front of its posts)
  drawShrineTitle(c, v, i);
  drawShrine(c, v, state, i, co);
  // The catwalks (lit lips), on their rods up into the structure
  for (const [rx, h, w] of s.ledges) catwalk(c, v, X(rx), Y(s.h + h), w);
  if (i === 2) drawBooth(c, v, state, co);
  // The doors: STAFF ONLY (where they come from), the SERVICE STAIRS (locked while they're at him)
  // (diegetic: the staff burst out of a stall marked STAFF ONLY, and the janitor's closet; the stairs are a restroom door)
  const cleared = !!state.stageMemo[CLEARED_MEMO(i)];
  door(c, v, X(s.door), dy, run.door, 'STAFF ONLY', '#FCA5A5', '#18181B', undefined, 'stall', pl);
  if (s.upper) door(c, v, X(s.upper.x), Y(s.h + s.upper.h), run.upper, 'JANITOR', '#FDE68A', '#1E3A8A', undefined, 'closet', pl, WALL_D);
  if (s.door2 !== undefined) door(c, v, X(s.door2), dy, run.upper, 'JANITOR', '#FDE68A', '#1E3A8A', undefined, 'closet', pl);
  const fighting = run.phase === 'intro' || run.phase === 'fight';
  door(c, v, X(s.stairs), dy, 0, 'SERVICE STAIRS', '#86EFAC', '#14532D', fighting && !cleared ? 'red' : 'green', 'restroom', pl);
  // Stop 2's track walker (in his headphones, mopping the rail, his back to the way it comes), or what's left
  if (i === 1) {
    const wx = X(s.a + 100);
    if (!state.stageMemo[WALKER_MEMO] && !co.walker) {
      const P = pal().porcelain;
      c.save(); c.translate(wx, dy); c.scale(-0.92, 0.92);
      drawPerson(c, { seed: 3321, outfit: 'maint', f, pose: 'hold', mood: 'happy' });
      c.restore();
      // (his headphones; the mop and its bucket)
      box(c, wx - 8, dy - 72, 16, 4, INK); box(c, wx - 7, dy - 71, 14, 2, '#3F3F46'); box(c, wx - 9, dy - 70, 4, 7, INK); box(c, wx + 5, dy - 70, 4, 7, INK);
      box(c, wx - 20, dy - 62, 5, 62, INK); box(c, wx - 19, dy - 61, 3, 60, '#A16207'); box(c, wx - 19, dy - 61, 1, 60, '#D4A040');
      box(c, wx - 30, dy - 8, 24, 8, INK); box(c, wx - 29, dy - 7, 22, 7, P[4]); for (let k = 0; k < 5; k++) box(c, wx - 28 + k * 4, dy - 4, 2, 4, P[2]);
      box(c, wx - 60, dy - 20, 24, 20, INK); box(c, wx - 59, dy - 19, 22, 19, '#EAB308'); box(c, wx - 59, dy - 19, 22, 3, '#FDE047'); box(c, wx - 59, dy - 19, 4, 19, '#FDE047'); box(c, wx - 41, dy - 19, 4, 19, '#A16207');
    } else if (state.stageMemo[WALKER_MEMO]) {
      // (what's left: a smear down the deck, the mop snapped, a shoe)
      c.fillStyle = '#5A0A0A'; c.beginPath(); c.ellipse(wx + 70, dy - 1, 90, 3, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#8A1414'; c.beginPath(); c.ellipse(wx + 60, dy - 2, 60, 2, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#B91C1C'; c.beginPath(); c.ellipse(wx + 40, dy - 2, 24, 1.5, 0, 0, Math.PI * 2); c.fill();
      c.save(); c.translate(wx + 120, dy - 4); c.rotate(-0.1); box(c, -31, -3, 62, 6, INK); box(c, -30, -2, 60, 4, '#A16207'); box(c, 27, -7, 16, 10, INK); box(c, 28, -6, 14, 8, '#E7E5E4'); c.restore();
      box(c, wx + 160, dy - 7, 14, 7, INK); box(c, wx + 161, dy - 6, 12, 5, '#3A2A1A'); box(c, wx + 161, dy - 6, 12, 1, '#5A4A3A');
    }
  }
  // The pylons at the deck's ends (the train's way through; barred unless it's passing)
  pylon(c, v, X(s.a) - 40, dy, passing, f);
  pylon(c, v, X(s.b), dy, passing, f);
};

/** Steve's billboard on the structure, seen from the first lift (yellow): he tested it. Its foot at (0, 0). */
const paintBillboard = (g: Ctx) => {
  const Y2 = ramp6(STEVE[3]), S = STEEL.map(c => hour(c));
  box(g, -154, -124, 308, 128, INK); box(g, -152, -122, 304, 124, S[2]); box(g, -152, -122, 304, 1, S[4]);
  box(g, -148, -118, 296, 116, Y2[3]); box(g, -148, -118, 296, 3, Y2[5]); box(g, -148, -118, 3, 116, Y2[4]); box(g, -148, -6, 296, 4, Y2[2]);
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; if (k % 2) continue; poly(g, [[-100, -60], [-100 + Math.cos(a - 0.2) * 90, -60 + Math.sin(a - 0.2) * 90], [-100 + Math.cos(a + 0.2) * 90, -60 + Math.sin(a + 0.2) * 90]], Y2[4]); }
  steveCard(g, -100, -60, 1.5, 1, 'flier');
  words(g, 'SAFETY TESTED BY', 40, -80, plain(1, 1, '#2A1408'));
  words(g, 'STUNTMAN STEVE', 40, -60, { sx: 1, sy: 2, fill: ['#5A3A04', '#2A1408', '#2A1408', '#2A1408', '#000000'], dither: true, shadow: STEVE[5] });
  words(g, 'HE IS FINE', 40, -38, plain(1, 1, '#7F1D1D'));
  // (its catwalk, its lamps over it)
  box(g, -158, 2, 316, 6, INK); box(g, -157, 3, 314, 4, S[3]); box(g, -157, 3, 314, 1, S[5]);
  for (let x = -130; x <= 130; x += 65) { box(g, x, -140, 2, 16, S[2]); box(g, x - 6, -144, 14, 6, INK); box(g, x - 5, -143, 12, 4, lit() ? '#FFF2C8' : S[4]); }
};

export const drawCoasterBack = (c: Ctx, state: GameState, co: Coaster) => {
  const v = cview(state);
  drawStructureBack(c, state);
  drawFloor(c, state);
  // (Steve's billboard on its lattice mast, seen from the first lift: behind the track)
  const bx = X(3200), by = Y(700);
  if (vis(v, bx - 170, bx + 170, by - 150, GY)) {
    lattice(c, bx, by + 8, GY, 26, pal().steel, 60);
    still(c, 'hwc-billboard', bx, by, -160, -146, 320, 156, paintBillboard);
  }
  // (what's set back at the station and the stops, then the track over it, then what's at the play plane)
  drawQueueBack(c, v, state);
  for (let i = 0; i < 3; i++) drawStopBack(c, v, i);
  drawTracks(c, v, state);
  drawQueue(c, v, state, co);
  // (the station's end wall: the train's way out through its arch)
  pylon(c, v, X(STATION.b), Y(STATION.h), co.ride.on && !!co.ride.track && co.ride.track === tracks().r1 && co.ride.s < 600, state.frame, true);
  for (let i = 0; i < 3; i++) drawStop(c, v, state, i, co);
};

/** The lights after dark: the station's canopy bulbs, each shrine's theatre lights, the booth's window, the arch. */
export const coasterLamps = (): Light[] => [
  { x: X(2150), y: Y(STATION.h) - 290, r: 380, a: 0.9, color: '#FDE68A' },
  ...STOPS.map(s => ({ x: X(s.shrine.x + s.shrine.w / 2), y: Y(s.h) - 120, r: 300, a: 0.95, color: '#FEF08A' })),
  { x: X(BOOTH.cab + 100), y: Y(BOOTH.h) - 80, r: 160, a: 0.8, color: '#7DD3FC' },
  { x: X(120), y: GY - 250, r: 200, a: 0.8, color: '#FBBF24' },
  { x: X(3200), y: Y(700) - 140, r: 220, a: 0.7, color: '#FDE68A' },
];
export { LEVER_MEMO };

void mix; void hash; void STEP; void PORCELAIN; void CRIMSON; void velvetRopePaint; void WALL_H; void x0; void sideBack; void rivets;
