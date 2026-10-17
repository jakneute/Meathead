// The landmarks drawn in 3D (models3d.ts through mesh3d.ts), through the park's one camera (park.ts): out on the
// circuit (screen space, in the park's back-to-front order), and the one he's fighting (world space: the same camera
// fitted to the field, so it stands exactly where its boxes are). As the camera goes round the circuit their sides turn,
// you see round them, their feet stay planted on the park's ground.
//
//   Its front faces the camera it's fought from (so the fight's view of it is the old one's), lit from that camera's
//   upper left at the hour's sun height (the 2D art's light: the shadow side down the right), in the hour's light.
//   Verticals are kept upright about its base (a tilt-shift: the towers stand straight on screen, matching their boxes);
//   its ground is the park's.
//   Its arrival: a replica on its plinth, sunk (cut off at the ground), up on its legs, its legs walked in (each foot
//   where it is on the ground). Hit: a flash. Beaten up: cracks and scorched faces as its health goes. Dying: pieces of
//   it fly off as it goes up. Wrecked: blackened, over on its side by its folded legs, smoking (the Leaning Tower: lying
//   where it fell).
//   Googly eyes: billboards stuck on its front, always to the camera (hidden when its front's turned away).
//
// Cheap: modest meshes, built once; the replicas still to come and the wrecks (they don't move) painted to a canvas
// each and blitted while the camera's still (most of the time: every fight); details dropped when one's small.

import { timeOfDay } from '../../timeOfDay';
import type { Heli, Mech } from './state';
import { LEG, CAMX, CY, Z } from './geo';
import { EYES, PISA_DOWN } from './mechs';
import type { MechId } from './lines';
import { proj, phiOf, DC, camFit, mechAt, type Cam } from './park';
import { modelOf, groupsOf, EYE_AT, plinthOf, legsMesh, hipH } from './models3d';
import { prepare, paint, emptyPrep, rotZ, mov, mmul, ap, type View, type Place, type M34, type V3, type Prepared } from './mesh3d';
import { eyesOf, smoke, mechLook, type MechLook } from './mechArt';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';
const hash = (n: number) => { const x = Math.sin(n * 91.7 + 7.1) * 43758.5; return x - Math.floor(x); };

/** A foot walking in (world, on the ground), how high it's lifted, which side. */
export interface FootW { x: number; z: number; lift: number; side: -1 | 1 }

/** The view through the park's camera (park.ts paints the pavilions through it too: one light for the whole scene). */
export const viewOf = (cam: Cam, f: number): View => {
  const tod = timeOfDay(), mul = [1, 3, 5].map(i => parseInt(tod.mul.slice(i, i + 2), 16));
  // (the light: from the camera's upper left, a little in front; higher at midday, raking at sundown)
  const s = Math.sin(cam.phi), co = Math.cos(cam.phi), el = 0.35 + 0.6 * Math.max(0, Math.min(1, tod.sunH));
  const L = { x: -co * 0.62 + s * 0.5, y: el, z: s * 0.62 + co * 0.5 }, l = Math.hypot(L.x, L.y, L.z);
  return {
    proj: (x, y, z) => proj(cam, x, y, z), eye: { x: DC * s, y: cam.hc, z: DC * co }, light: { x: L.x / l, y: L.y / l, z: L.z / l },
    upright: null, mul, mulKey: tod.mul, variant: 'n', lod: false, f,
  };
};

/** Its axes: across (the fight camera's right) and away (toward the park's middle). */
const axesOf = (i: number) => { const p = phiOf(i); return { R: { x: Math.cos(p), z: -Math.sin(p) }, F: { x: -Math.sin(p), z: -Math.cos(p) } }; };

/** The wreck's lie: over on its side to the left, resting on the ground (the lowest it gets, worked out once each). */
const lieOf = new Map<MechId, M34>();
const lie = (id: MechId) => {
  let M = lieOf.get(id);
  if (M) return M;
  const mesh = modelOf(id), r = rotZ(Math.PI / 2 - 0.15, 0, 0);
  let lo = Infinity, hi = -Infinity;
  for (const p of mesh.p) { const q = ap(r, p); lo = Math.min(lo, q.y); hi = Math.max(hi, q.x); }
  M = mmul(mov(-44 - hi, -lo + 1, 0), r);
  lieOf.set(id, M);
  return M;
};

/** Pieces blown off as it dies: a share of its parts, each off at its own moment, flung out and up, tumbling, gone. */
const piecesOf = (id: MechId, t: number): (M34 | null | undefined)[] | undefined => {
  if (t < 8) return undefined;
  const mesh = modelOf(id), cy = (mesh.minY + mesh.maxY) / 2;
  return mesh.parts.map((c, pi) => {
    const h = hash(pi * 3.7 + id.length);
    if (h > 0.42) return undefined;
    const td = 8 + hash(pi * 1.3) * 100, dt = t - td;
    if (dt <= 0) return undefined;
    if (dt > 80) return null;
    const dx = c.x || (h - 0.2), dz = c.z, dl = Math.hypot(dx, dz) || 1, sp = 2 + hash(pi * 5.1) * 4;
    const ox = (dx / dl) * sp * dt, oz = (dz / dl) * sp * dt * 0.6, oy = (3 + (c.y - cy) * 0.01) * dt - 0.22 * dt * dt;
    return mmul(mov(ox, oy, oz), rotZ((hash(pi * 9.3) - 0.5) * 0.12 * dt, c.x, c.y));
  });
};

/** One googly eye (screen): the white, the pupil rolling (m.eyes, lagging), the lid (shut, or how far up), X'd. */
const disc = (c: Ctx, x: number, y: number, r: number, col: string) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2); c.fill(); };
/** A googly eye, the craft-store kind stuck on: its drop shadow on the landmark, the clear plastic dome's rim, the
 *  white in steps (a gray crescent of shade down its lower right), the loose pupil (a lit rim, a glint), the dome's
 *  shine over it all; a lid down over it in steps; X'd on a wreck. */
const googly = (c: Ctx, x: number, y: number, R: number, g: { x: number; y: number }, how: 'shut' | 'open', open: number, wreck: boolean, k: number) => {
  const lw = Math.max(1, 2.4 * k);
  c.globalAlpha = 0.35; disc(c, x + R * 0.16, y + R * 0.2, R * 1.04, INK); c.globalAlpha = 1;
  disc(c, x, y, R + lw * 0.6, INK);
  disc(c, x, y, R, '#C8CCD4');
  disc(c, x - R * 0.06, y - R * 0.06, R * 0.9, '#E8EAEE');
  disc(c, x - R * 0.12, y - R * 0.12, R * 0.74, '#FFFFFF');
  if (wreck) { c.strokeStyle = INK; c.lineWidth = Math.max(1, 3.5 * k); c.beginPath(); c.moveTo(x - R * 0.5, y - R * 0.5); c.lineTo(x + R * 0.5, y + R * 0.5); c.moveTo(x + R * 0.5, y - R * 0.5); c.lineTo(x - R * 0.5, y + R * 0.5); c.stroke(); return; }
  const px = x + g.x, py = y + g.y;
  disc(c, px, py, R * 0.52, '#2A2A34');
  disc(c, px + R * 0.04, py + R * 0.04, R * 0.44, INK);
  c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(px - R * 0.24), Math.round(py - R * 0.3), Math.max(1, Math.round(R * 0.2)), Math.max(1, Math.round(R * 0.2)));
  if (R > 6) { c.fillStyle = '#8A8E9A'; c.fillRect(Math.round(px + R * 0.12), Math.round(py + R * 0.16), Math.max(1, Math.round(R * 0.1)), Math.max(1, Math.round(R * 0.1))); }
  const lid = how === 'shut' ? 1 : 1 - open;
  if (lid > 0.02) {
    c.save(); c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.clip();
    const lh = (R * 2 + 2) * lid, ly = y - R - 1;
    c.fillStyle = '#7E8490'; c.fillRect(x - R - 1, ly, R * 2 + 2, lh);
    c.fillStyle = '#A4AAB4'; c.fillRect(x - R - 1, ly, R * 2 + 2, lh * 0.55);
    c.fillStyle = '#C4C8D0'; c.fillRect(x - R - 1, ly, R * 0.9, lh * 0.4);
    c.fillStyle = INK; c.fillRect(x - R - 1, ly + lh - Math.max(1, 3 * k), R * 2 + 2, Math.max(1, 3 * k));
    c.restore();
  }
  // (the plastic dome's shine: a lit arc up its top left, a glint)
  c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = Math.max(1, R * 0.12); c.beginPath(); c.arc(x, y, R * 0.82, Math.PI * 1.05, Math.PI * 1.45); c.stroke();
  c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(x - R * 0.5), Math.round(y - R * 0.62), Math.max(1, Math.round(R * 0.16)), Math.max(1, Math.round(R * 0.16)));
  c.strokeStyle = INK; c.lineWidth = lw; c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.stroke();
};
/** A burning piece flung off a landmark going up: a banded fireball on it, smoke trailing off. */
const pieceFire = (c: Ctx, x: number, y: number, r: number, t: number, n: number) => {
  const fl = 1 + Math.sin(t * 0.8 + n) * 0.15;
  c.globalAlpha = 0.55; disc(c, x - r * 0.6, y + r * 0.8, r * 1.3, '#3F3F46'); disc(c, x - r * 1.2, y + r * 1.6, r * 1.6, '#52525B'); c.globalAlpha = 1;
  disc(c, x, y, r * fl, '#B91C1C'); disc(c, x - r * 0.1, y - r * 0.15, r * 0.74 * fl, '#F97316'); disc(c, x - r * 0.2, y - r * 0.25, r * 0.44 * fl, '#FDE047'); disc(c, x - r * 0.25, y - r * 0.3, r * 0.18, '#FFFBEB');
};

/** Draws it (whatever's under it first: its shadow, the plinth or the legs; then the body; its eyes). */
const render = (c: Ctx, cam: Cam, id: MechId, i: number, at: { x: number; z: number }, L: MechLook, feet: FootW[] | undefined, f: number) => {
  const view = viewOf(cam, f), { R, F } = axesOf(i), m = L.m;
  const base0 = view.proj(at.x, 0, at.z);
  view.lod = base0.k * 420 < 90;
  view.upright = { x: at.x, z: at.z };
  const wreck = !!L.wreck, isPisa = id === 'pisa';
  view.variant = wreck ? (isPisa ? 'dark' : 'wreck') : L.flash ? 'flash' : 'n';
  view.wear = m && (m.st === 'fight' || m.st === 'dying') && !isPisa ? 1 - m.hp / m.max : 0;
  const sink = L.sink ?? 0, sh = L.shake ? Math.sin(L.f * 2.7) * L.shake : 0;
  const bx = at.x + R.x * sh, bz = at.z + R.z * sh, dy = -sink * 600;
  view.clipGround = sink > 0;
  const plinth = !!L.plinth || (!L.awake && L.legs === undefined);
  const u = wreck && !isPisa ? 0 : plinth ? 1 : Math.max(0, Math.min(1, L.legs ?? 1));
  const P: Prepared = emptyPrep();
  // (its shadow on the ground)
  const mesh = modelOf(id), rad = Math.max(-mesh.minX, mesh.maxX, 60) * 0.85;
  // (under it: the plinth, or its mech legs (each foot where it is, walking in))
  const under: Place = { bx, by: dy, bz, R, F };
  let localFeet: { x: number; y: number; z: number }[] | undefined;
  if (feet) localFeet = feet.map(ft => ({ x: (ft.x - at.x) * R.x + (ft.z - at.z) * R.z + ft.side * 28, y: ft.lift, z: (ft.x - at.x) * F.x + (ft.z - at.z) * F.z }));
  prepare(c, plinth ? plinthOf() : legsMesh({ u, f: L.f, wreck, feet: localFeet }), under, view, P);
  // (the body on top: lower while the legs are folded; a wreck lying beside its legs)
  const lean = isPisa ? (wreck ? PISA_DOWN : m?.lean ?? 0.07) : 0;
  const body: Place = {
    bx, bz, R, F, by: dy + (wreck && !isPisa ? 0 : plinth ? LEG : hipH(u)),
    groups: groupsOf(id, m, lean), parts: m?.st === 'dying' ? piecesOf(id, m.t) : undefined, all: wreck && !isPisa ? lie(id) : undefined,
  };
  const pieces = body.parts;
  const bt = prepare(c, mesh, body, view, P);
  // (its shadow, under all of it: a soft outer step and a darker core)
  for (const [kr, a] of [[1, 0.16], [0.72, 0.2]] as const) {
    c.fillStyle = `rgba(20, 16, 12, ${a})`; c.beginPath();
    for (let k = 0; k < 16; k++) { const ang = (k / 16) * Math.PI * 2, q = view.proj(at.x + Math.cos(ang) * rad * kr, 0, at.z + Math.sin(ang) * rad * kr); if (k) c.lineTo(q.x, q.y); else c.moveTo(q.x, q.y); }
    c.closePath(); c.fill();
  }
  paint(c, P, view, INK, view.lod ? 1 : 2.2);
  // (going up: the pieces flung off it burning, smoke trailing)
  if (pieces && m) mesh.parts.forEach((pc, pi) => {
    const M = bt.mats[pi];
    if (!pieces[pi] || !M) return;
    const w = bt.toWorld(ap(M, pc)), q = bt.scr(w);
    pieceFire(c, q.x, q.y, Math.max(2, 9 * base0.k), m.t + pi, pi);
  });
  // (the warning light on the chassis, blinking: its housing, the lit dome, a stepped glow)
  if (!plinth && !wreck && !view.lod) {
    const ly = dy + hipH(u) + 17, q = bt.scr({ x: bx, y: ly, z: bz });
    if (!view.clipGround || ly > 0) {
      const blink = (L.f >> 4) % 2 === 0, rr = Math.max(1.5, 5 * base0.k);
      if (blink) { c.globalAlpha = 0.18; disc(c, q.x, q.y - rr * 0.4, rr * 3.2, '#F87171'); c.globalAlpha = 0.3; disc(c, q.x, q.y - rr * 0.4, rr * 2, '#F87171'); c.globalAlpha = 1; }
      c.fillStyle = INK; c.fillRect(Math.round(q.x - rr * 1.3), Math.round(q.y - 1), Math.round(rr * 2.6), Math.max(2, Math.round(rr * 0.6)));
      c.fillStyle = blink ? '#EF4444' : '#7F1D1D'; c.beginPath(); c.arc(q.x, q.y, rr, Math.PI, 0); c.fill();
      c.fillStyle = blink ? '#FECACA' : '#B91C1C'; c.fillRect(Math.round(q.x - rr * 0.5), Math.round(q.y - rr * 0.7), Math.max(1, Math.round(rr * 0.4)), Math.max(1, Math.round(rr * 0.35)));
    }
  }
  // (its googly eyes, on its front, facing the camera; not while its front's turned away, not under the ground)
  const how = eyesOf(L);
  if (how !== 'none') {
    const spots = EYES[id](m ?? ({ k: 0, lean: 0 } as Mech)), ea = EYE_AT[id];
    const G = (body.groups?.[ea.g] ?? undefined) as M34 | undefined | null, A = body.all;
    const fn = { x: -F.x, z: -F.z };
    spots.forEach((e, j) => {
      let l: V3 = { x: e.x, y: -e.y - LEG, z: ea.z };
      if (G) l = ap(G, l);
      if (A) l = ap(A, l);
      const w = bt.toWorld(l);
      if (w.y < 0 && view.clipGround) return;
      if (!wreck && fn.x * (view.eye.x - w.x) + fn.z * (view.eye.z - w.z) < 0) return;
      const q = bt.scr(w), k = view.proj(w.x, w.y, w.z).k, g = m?.eyes[j] ?? { x: Math.sin(L.f * 0.05 + j) * 2, y: e.r * 0.3 };
      googly(c, q.x, q.y, e.r * 1.3 * k, { x: g.x * 1.3 * k, y: g.y * 1.3 * k }, how === 'shut' ? 'shut' : 'open', m?.open ?? 1, wreck, k);
    });
  }
  return base0;
};

// ---------------------------------------------------------------------------------------------------------------
// The still ones, painted once (till the camera or the hour moves)

const cache = new Map<number, { key: string; cv: HTMLCanvasElement; x: number; y: number }>();
const still = (L: MechLook) => !!L.wreck || ((!!L.plinth || (!L.awake && L.legs === undefined)) && !L.sink && !L.shake && !L.flash && eyesOf(L) !== 'open');

/** A landmark out on the circuit (screen space, the park's camera): at its ground point; walking in, its feet. */
export const drawLandmark = (c: Ctx, cam: Cam, id: MechId, i: number, at: { x: number; z: number }, L: MechLook, feet?: FootW[]) => {
  if (still(L) && typeof document !== 'undefined') {
    const key = [cam.phi.toFixed(5), cam.hc.toFixed(2), cam.F.toFixed(2), cam.ppx.toFixed(1), cam.ppy.toFixed(1), timeOfDay().key, L.wreck ? 'w' : 'p', eyesOf(L), at.x.toFixed(1), at.z.toFixed(1)].join('|');
    let e = cache.get(i);
    if (!e || e.key !== key) {
      // (its bounds on screen: put through once to find them)
      const P = emptyPrep(), view = viewOf(cam, 0), { R, F } = axesOf(i);
      view.upright = { x: at.x, z: at.z };
      prepare(c, modelOf(id), { bx: at.x, by: 0, bz: at.z, R, F, all: L.wreck && id !== 'pisa' ? lie(id) : undefined, groups: groupsOf(id, L.m, id === 'pisa' ? (L.wreck ? PISA_DOWN : 0.07) : 0) }, view, P);
      const pad = 40, base = view.proj(at.x, 0, at.z), x0 = Math.floor(Math.min(P.x0, base.x - 80 * base.k) - pad), y0 = Math.floor(Math.min(P.y0, base.y) - pad - 30 * base.k);
      const w = Math.min(2400, Math.ceil(Math.max(P.x1, base.x + 80 * base.k) - x0 + pad)), hgt = Math.min(2400, Math.ceil(base.y + 40 * base.k - y0 + pad));
      if (!isFinite(w) || !isFinite(hgt) || w <= 0 || hgt <= 0) return;
      const cv = e?.cv ?? document.createElement('canvas');
      cv.width = w; cv.height = hgt;
      const g = cv.getContext('2d')!;
      g.clearRect(0, 0, w, hgt); g.translate(-x0, -y0);
      render(g, cam, id, i, at, { ...L, f: 0 }, undefined, 0);
      e = { key, cv, x: x0, y: y0 };
      cache.set(i, e);
    }
    c.drawImage(e.cv, e.x, e.y);
    if (L.wreck) { const q = proj(cam, at.x, 0, at.z); c.save(); c.translate(q.x, q.y); c.scale(q.k, q.k); smoke(c, L.f); c.restore(); }
    return;
  }
  render(c, cam, id, i, at, L, feet, L.f);
};

/** The one he's fighting (world space: drawn where its boxes are, BASE). */
export const drawLandmarkWorld = (c: Ctx, h: Heli, m: Mech, f: number) => {
  c.save();
  c.translate(CAMX, CY); c.scale(1 / Z, 1 / Z);
  const L = mechLook(h, m, m.i, f);
  render(c, camFit(h), m.id, m.i, mechAt(m, m.i), L, undefined, L.f);
  c.restore();
};
