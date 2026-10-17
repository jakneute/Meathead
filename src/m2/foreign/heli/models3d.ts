// The nine landmarks as low-poly 3D models (mesh3d.ts), each the size of its old flat art (world units: about as tall
// as the park is wide), local x across its front, y up from its base (on top of the mech's legs, or its plinth), z away
// from the camera it faces in its fight. Built once each. Their moving bits are groups (the Opera House's shells, the
// Redeemer's arms, the Leaning Tower itself, the Taj's minarets, the moai's head and body); their mech legs are built
// fresh each frame (legsMesh), posed by the walk and the stomp.

import { MB, mat, box, frustum, lathe, beam, rotZ, mov, scl, type Mesh, type M34, type V3 } from './mesh3d';
import { LEG } from './geo';
import type { MechId } from './lines';
import type { Mech } from './state';

const Q = Math.PI / 4;

// Materials (their old flat art's steps)
const IRON = mat(['#3A2214', '#5A3620', '#7C4A2D', '#A0673C', '#C98A52']);
const GRANITE = mat(['#6E5236', '#8C6844', '#A47E58', '#C8A27A', '#E2C29A']);
const GLASSG = mat(['#3A2A12', '#5C4420', '#7C5A2A', '#A27A3A', '#D9A441']);
const TILE = mat(['#94A3B8', '#CBD5E1', '#E2E8F0', '#F8FAFC', '#FFFFFF']);
const SHADOWT = mat(['#64748B', '#7C8BA0', '#94A3B8', '#B4C0D0', '#CBD5E1']);
const SOAP = mat(['#8E9A7E', '#B8C4A6', '#D6E0C6', '#E7EFD9', '#F4F8EC']);
const PED = mat(['#4B5056', '#6B7280', '#82888E', '#A8ADB2', '#D1D5DB']);
const PISAM = mat(['#8E8A85', '#BDB8B2', '#D6D3D1', '#EDEBE9', '#FFFFFF']);
const MARBLE = mat(['#94A3B8', '#CBD5E1', '#E2E8F0', '#F8FAFC', '#FFFFFF']);
const SANDST = mat(['#8C6F45', '#B89B6A', '#D4B98A', '#E8D3A8', '#F5E6C8']);
const GOLD = mat(['#713F12', '#A16207', '#CA8A04', '#EAB308', '#FDE68A']);
const BENS = mat(['#7C5A2A', '#A16207', '#C08A48', '#D6A35C', '#E8C48A']);
const VERD = mat(['#22382B', '#36503F', '#4D6B5A', '#6B8F7A', '#8FB39C']);
const COLS = mat(['#6B5238', '#8B6F4E', '#C8A47A', '#E7C9A0', '#F4DEBC']);
const COLIN = mat(['#4A3826', '#6B5238', '#8B6F4E', '#A88A64', '#C8A47A']);
const ARENA = mat(['#8C6F45', '#A88A5C', '#C8A878', '#DCC196', '#EAD6B0']);
const PYR = mat(['#92400E', '#B45309', '#D97706', '#FCD34D', '#FEF3C7']);
const MOAI = mat(['#3A3532', '#4A4440', '#6B6560', '#8E8780', '#A8A29E']);
const PUKAO = mat(['#5A1E14', '#7A2A1E', '#9A3A2A', '#C0563E', '#D9785E']);
const STEEL = mat(['#2A2A30', '#3F3F46', '#52525B', '#71717A', '#A1A1AA']);
const CHROME = mat(['#52525B', '#71717A', '#A1A1AA', '#D4D4D8', '#F4F4F5']);
const YEL = mat(['#854D0E', '#A16207', '#CA8A04', '#FACC15', '#FDE68A']);
const PLINTHM = mat(['#6E6960', '#8E887C', '#A8A296', '#B8B2A6', '#DAD5CB']);
const FLAGB = mat(['#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA']), FLAGW = mat(['#94A3B8', '#CBD5E1', '#E2E8F0', '#F8FAFC', '#FFFFFF']), FLAGR = mat(['#7F1D1D', '#991B1B', '#B91C1C', '#DC2626', '#EF4444']);

// ---------------------------------------------------------------------------------------------------------------

const eiffel = () => {
  const b = new MB();
  // (the four legs, raking in to the first deck, latticed; the arches between them)
  b.begin(IRON);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) beam(b, { x: sx * 90, y: 0, z: sz * 90 }, { x: sx * 56, y: 112, z: sz * 56 }, 12, 12, { k: 'lattice', a: 4 });
  b.begin(IRON);
  for (let side = 0; side < 4; side++) {
    // (each side's arch: a band from leg to leg, curved underneath)
    const P = (u: number, y: number): V3 => { const along = u, off = 72 - (y / 112) * 10; return side === 0 ? { x: along, y, z: -off } : side === 1 ? { x: off, y, z: along } : side === 2 ? { x: -along, y, z: off } : { x: -off, y, z: -along }; };
    const N = 4;
    for (let k = 0; k < N; k++) {
      const u0 = -66 + (132 * k) / N, u1 = -66 + (132 * (k + 1)) / N, low = (u: number) => Math.max(26, 84 * (1 - (u / 70) ** 2));
      const v = [b.v(P(u0, low(u0)).x, low(u0), P(u0, low(u0)).z), b.v(P(u1, low(u1)).x, low(u1), P(u1, low(u1)).z), b.v(P(u1, 112).x, 112, P(u1, 112).z), b.v(P(u0, 112).x, 112, P(u0, 112).z)];
      b.f(v, { x: 0, y: 70, z: 0 }, { k: 'lattice', a: 2 });
      b.f(v.slice().reverse(), { x: P(0, 90).x * 4, y: 70, z: P(0, 90).z * 4 });
    }
  }
  // (the first deck, its railing; the middle, narrowing; the second deck; the top; its deck, the lantern, the mast)
  b.begin(IRON); box(b, -76, 76, 112, 126, -76, 76, { sides: { k: 'rail', a: 12 } });
  b.begin(IRON); frustum(b, 0, 0, 78, 78, 126, 252, 4, 0.4, Q, { k: 'lattice', a: 4 }, false);
  b.begin(IRON); box(b, -33, 33, 252, 264, -33, 33, { sides: { k: 'rail', a: 7 } });
  b.begin(IRON); frustum(b, 0, 0, 29, 29, 264, 402, 4, 0.24, Q, { k: 'lattice', a: 5 }, false);
  b.begin(IRON); box(b, -12, 12, 400, 410, -12, 12);
  b.begin(GOLD, 0, true); box(b, -6, 6, 410, 420, -6, 6);
  b.begin(GOLD, 0, true); box(b, -2.5, 2.5, 420, 438, -2.5, 2.5);
  // (the flag on it, the tricolor)
  ([[FLAGB, 3], [FLAGW, 10], [FLAGR, 17]] as const).forEach(([m, x]) => { b.begin(m, 1, true); const v = [b.v(x, 424, 0), b.v(x + 7, 424, 0), b.v(x + 7, 434, 0), b.v(x, 434, 0)]; b.f(v, { x: x + 3, y: 429, z: 5 }); b.f(v.slice().reverse(), { x: x + 3, y: 429, z: -5 }); });
  return b.done();
};

/** The Opera House's shells: [middle x, size, height, z]. */
const SHELLS: [number, number, number, number][] = [[-120, 0.6, 80, 6], [-70, 1, 140, 0], [10, 1.2, 168, 0], [70, 0.9, 120, 0], [-10, 0.55, 72, 48], [74, 0.5, 64, 48]];
const opera = () => {
  const b = new MB();
  // (the podium, its granite steps down the front; the glass walls)
  b.begin(GRANITE); box(b, -156, 156, 0, 62, -70, 90, { front: { k: 'hlines', a: 6 }, sides: { k: 'hlines', a: 3 } });
  b.begin(GLASSG); box(b, -120, 120, 62, 100, -40, 64, { sides: { k: 'vlines', a: 16, col: '#D9A441' } });
  // (the shells: each a curved vault, its spine rising from the back to the tip, the open mouth at the front in shadow)
  SHELLS.forEach(([x, s, h, zc], j) => {
    b.begin(TILE, 1 + j);
    const xa = x - 50 * s, xb = x + 30 * s, xt = x + 40 * s, w = 22 + 26 * s, y0 = 62, N = 4;
    const ridge = Array.from({ length: N + 1 }, (_, i) => { const t = i / N; return b.v(xa + (xt - xa) * t, y0 + h * (1 - (1 - t) * (1 - t)), zc); });
    for (const sd of [-1, 1]) {
      const base = Array.from({ length: N + 1 }, (_, i) => { const t = i / N; return b.v(xa + (xb - xa) * t, y0, zc + sd * w * Math.sin((t * Math.PI) / 2)); });
      for (let i = 0; i < N; i++) b.f(i === 0 ? [base[1], ridge[1], ridge[0]] : [base[i], base[i + 1], ridge[i + 1], ridge[i]], { x: x, y: y0 - 40, z: zc }, i === 0 ? undefined : { k: 'tiles', a: 4 });
    }
    b.begin(SHADOWT, 1 + j);
    const m0 = b.v(xb, y0, zc - w), m1 = b.v(xb, y0, zc + w), tip = b.v(xt, y0 + h, zc);
    b.f([m0, m1, tip], { x: xa, y: y0, z: zc });
  });
  return b.done();
};

const redeemer = () => {
  const b = new MB();
  b.begin(PED); box(b, -52, 52, 0, 62, -52, 52, { sides: { k: 'panel' } });
  b.begin(PED); box(b, -46, 46, 62, 70, -46, 46);
  // (the robe, flaring at the hem, its folds; the sash)
  b.begin(SOAP); frustum(b, 0, 0, 46, 34, 70, 120, 8, 0.84, Math.PI / 8, { k: 'vlines', a: 3 }, false);
  b.begin(SOAP); frustum(b, 0, 0, 38.6, 28.6, 120, 302, 8, 0.58, Math.PI / 8, { k: 'vlines', a: 3 });
  b.begin(SOAP, 0, true); frustum(b, 0, 0, 34, 25, 196, 203, 8, 0.98, Math.PI / 8, undefined, false);
  // (the arms, straight out (they spin; they're the beams while they hug), the hands)
  b.begin(SOAP, 1); box(b, -182, 182, 279, 303, -13, 13, { front: { k: 'vlines', a: 10 }, back: { k: 'vlines', a: 10 } });
  for (const s of [-1, 1]) { b.begin(SOAP, 1); box(b, s > 0 ? 182 : -197, s > 0 ? 197 : -182, 281, 301, -11, 11); }
  // (the neck, the head, the hair)
  b.begin(SOAP); frustum(b, 0, 0, 11, 9, 302, 312, 6, 1);
  b.begin(SOAP); lathe(b, 0, 0, [[0, 308], [16, 311], [24, 322], [25, 334], [21, 348], [12, 356], [0, 358]], 8, 0.92);
  b.begin(SOAP, 0, true); lathe(b, 0, 4, [[23, 338], [26, 346], [20, 356], [10, 362], [0, 363]], 8, 0.92);
  return b.done();
};

/** The Leaning Tower's tiers' ledges (from its base). */
const PISA_Y = [0, 40, 92, 144, 196, 248, 300, 352, 404, 440];
const pisa = () => {
  const b = new MB(), n = 10;
  for (let k = 0; k + 1 < PISA_Y.length; k++) { b.begin(PISAM, 1); frustum(b, 0, 0, 42, 42, PISA_Y[k], PISA_Y[k + 1], n, 1, 0, { k: 'arches', a: 1, b: 1, col: k % 2 ? '#78716C' : '#57534E' }, k === PISA_Y.length - 2); }
  for (let k = 1; k + 1 < PISA_Y.length; k++) { b.begin(PISAM, 1, true); frustum(b, 0, 0, 46.5, 46.5, PISA_Y[k] - 3, PISA_Y[k] + 5, n, 1, 0, undefined, true); }
  b.begin(PISAM, 1); frustum(b, 0, 0, 30, 30, 440, 478, n, 1, 0, { k: 'arches', a: 1, b: 1, col: '#57534E' });
  b.begin(PISAM, 1); frustum(b, 0, 0, 33, 33, 478, 484, n, 0.9, 0);
  return b.done();
};

const taj = () => {
  const b = new MB();
  b.begin(SANDST); box(b, -170, 170, 0, 8, -170, 170);
  // (the main block, its corners chamfered: the great iwans on its four faces, niches on the chamfers)
  b.begin(MARBLE);
  {
    const ring = (y: number) => Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + (i / 8) * Math.PI * 2; return b.v(Math.cos(a) * 121, y, -Math.sin(a) * 121); });
    const B = ring(8), T = ring(130), c = { x: 0, y: 70, z: 0 };
    // (ring point i at angle PI/8 + i PI/4: the face from i to i+1 faces PI/4 (i+1); the faces on the axes are i = 1, 3, 5, 7)
    for (let i = 0; i < 8; i++) b.f([B[(i + 1) % 8], B[i], T[i], T[(i + 1) % 8]], c, i % 2 === 0 ? { k: 'niches' } : { k: 'iwan' });
    b.f(T.slice(), { x: 0, y: 0, z: 0 });
  }
  b.begin(MARBLE); frustum(b, 0, 0, 58, 58, 130, 156, 12, 1, 0, { k: 'vlines', a: 2 }, false);
  b.begin(MARBLE); lathe(b, 0, 0, [[58, 156], [80, 172], [88, 196], [80, 222], [62, 246], [38, 266], [16, 284], [0, 296]], 12);
  b.begin(GOLD, 0, true); frustum(b, 0, 0, 4, 4, 294, 324, 4, 0.2, Q);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    b.begin(MARBLE, 0, sz > 0); frustum(b, sx * 82, sz * 82, 17, 17, 130, 146, 6, 1, 0, undefined, false);
    b.begin(MARBLE, 0, sz > 0); lathe(b, sx * 82, sz * 82, [[19, 146], [19, 154], [11, 162], [0, 167]], 6);
  }
  // (the minarets on the terrace's corners, their balconies, their caps: thrown, they're gone)
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * 150, z = sz * 150;
    b.begin(MARBLE, 1); frustum(b, x, z, 11, 11, 8, 250, 6, 0.8, 0, { k: 'hlines', a: 2 }, false);
    for (const y of [70, 140, 210]) { b.begin(MARBLE, 1, true); frustum(b, x, z, 15, 15, y, y + 5, 6, 1); }
    b.begin(MARBLE, 1); lathe(b, x, z, [[12, 250], [12, 257], [0, 266]], 6);
  }
  return b.done();
};

const bigben = () => {
  const b = new MB();
  // (the shaft in three stages of gothic windows, ledges between; its corner buttresses)
  for (const [y0, y1] of [[0, 100], [100, 200], [200, 300]]) { b.begin(BENS); box(b, -52, 52, y0, y1, -52, 52, { sides: { k: 'windows', a: 4, b: 3, col: '#5B2A10' } }); }
  for (const y of [100, 200, 300]) { b.begin(BENS, 0, true); box(b, -55, 55, y - 3, y + 3, -55, 55); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { b.begin(BENS, 0, true); box(b, sx * 55 - 4, sx * 55 + 4, 0, 300, sz * 55 - 4, sz * 55 + 4); }
  // (the clock stage: a face on every side; the belfry; the green spire, its gold pinnacles and finial)
  b.begin(BENS); box(b, -57, 57, 300, 372, -57, 57, { sides: { k: 'clock', a: 0.36, b: 0.48 } });
  b.begin(BENS); box(b, -52, 52, 372, 382, -52, 52);
  b.begin(BENS); box(b, -42, 42, 382, 424, -42, 42, { sides: { k: 'arches', a: 3, b: 1, col: '#3F2A1C' } });
  b.begin(VERD); frustum(b, 0, 0, 66, 66, 424, 480, 4, 0, Q, { k: 'hlines', a: 4 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { b.begin(GOLD, 0, true); frustum(b, sx * 44, sz * 44, 5, 5, 424, 446, 4, 0, Q); }
  b.begin(GOLD); frustum(b, 0, 0, 5, 5, 478, 500, 4, 0.1, Q);
  return b.done();
};

const colosseum = () => {
  const b = new MB(), N = 20, RX = 172, RZ = 130;
  // (its height round it: full on the left, broken down on the right, jagged)
  const hAt = (i: number) => { const a = (i / N) * Math.PI * 2, x = Math.cos(a); if (x < 0.25) return 222; const j = ((i * 37) % 5) * 7; return Math.max(138, 222 - ((x - 0.25) / 0.75) * 84 - j); };
  const P = (i: number, k: number, y: number) => { const a = (i / N) * Math.PI * 2; return b.v(Math.cos(a) * RX * k, y, -Math.sin(a) * RZ * k); };
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N, hi = hAt(i), hj = hAt(j), mi = Math.min(178, hi - 14), mj = Math.min(178, hj - 14);
    const ca = ((i + 0.5) / N) * Math.PI * 2, out = { x: Math.cos(ca) * RX * 2, y: -60, z: -Math.sin(ca) * RZ * 2 };
    // (the outer wall: its three tiers of arches and the attic)
    b.begin(COLS); b.f([P(i, 1, 0), P(j, 1, 0), P(j, 1, hj), P(i, 1, hi)], { x: 0, y: 100, z: 0 }, { k: 'arcade3', a: (hi + hj) / 2 });
    // (the top of the wall; the seating down to the arena (the cavea); the arena's wall)
    b.begin(COLIN); b.f([P(i, 1, hi), P(j, 1, hj), P(j, 0.9, mj), P(i, 0.9, mi)], { x: 0, y: -400, z: 0 });
    b.begin(COLIN); b.f([P(i, 0.9, mi), P(j, 0.9, mj), P(j, 0.56, 22), P(i, 0.56, 22)], out, { k: 'hlines', a: 5 });
    b.begin(COLIN, 0, true); b.f([P(i, 0.56, 22), P(j, 0.56, 22), P(j, 0.56, 0), P(i, 0.56, 0)], out);
  }
  b.begin(ARENA); b.f(Array.from({ length: N }, (_, i) => P(i, 0.56, 1)), { x: 0, y: -100, z: 0 });
  return b.done();
};

const pyramid = () => {
  const b = new MB(), tiers = 8, top = 262;
  // (stepped courses, each a little in from the last: lit steps up its faces; the gold capstone, its eye)
  for (let t = 0; t < tiers; t++) {
    const y0 = (t / tiers) * top, y1 = ((t + 1) / tiers) * top, h0 = 182 * (1 - y0 / 302) - (t ? 3 : 0), h1 = 182 * (1 - y1 / 302);
    b.begin(PYR); frustum(b, 0, 0, h0 * Math.SQRT2, h0 * Math.SQRT2, y0, y1, 4, h1 / h0, Q, { k: 'courses', a: 2, b: 6 }, t === tiers - 1);
    if (t) { b.begin(PYR, 0, true); const r0 = (182 * (1 - y0 / 302)) * Math.SQRT2; frustum(b, 0, 0, r0, r0, y0 - 1, y0, 4, (h0 * Math.SQRT2) / r0, Q, undefined, false); }
  }
  b.begin(GOLD);
  {
    const h = 182 * (1 - top / 302), apex = b.v(0, 302, 0), c = [b.v(-h, top, -h), b.v(h, top, -h), b.v(h, top, h), b.v(-h, top, h)], cc = { x: 0, y: top + 10, z: 0 };
    // (its front with the eye on it: a quad with its top two corners at the point, so the eye maps on)
    b.f([c[0], c[1], apex, b.v(0, 302, 0)], cc, { k: 'eye' });
    b.f([c[1], c[2], apex], cc); b.f([c[2], c[3], apex], cc); b.f([c[3], c[0], apex], cc);
  }
  return b.done();
};

const moai = () => {
  const b = new MB();
  // (the body, risen up out of the ground under it: arms carved down its sides, hands on its belly)
  b.begin(MOAI, 2); box(b, -110, 110, 0, 150, -62, 62, { front: { k: 'moaiArms' }, sides: { k: 'vlines', a: 2 } });
  // (the head: long, the heavy brow, the long nose, pursed lips, the jutting chin; its ears; the red topknot)
  b.begin(MOAI, 1); box(b, -80, 80, 0, 272, -56, 56, { front: { k: 'moaiFace' } });
  b.begin(MOAI, 1); frustum(b, 0, 0, 80 * Math.SQRT2, 56 * Math.SQRT2, 272, 302, 4, 0.78, Q);
  b.begin(MOAI, 1); box(b, -76, 76, 222, 244, -70, -50);
  b.begin(MOAI, 1);
  {
    const v = [b.v(-24, 128, -56), b.v(24, 128, -56), b.v(0, 128, -88), b.v(-11, 224, -56), b.v(11, 224, -56), b.v(0, 224, -68)], c = { x: 0, y: 176, z: -50 };
    b.f([v[0], v[2], v[5], v[3]], c); b.f([v[2], v[1], v[4], v[5]], c); b.f([v[0], v[1], v[2]], c);
  }
  b.begin(MOAI, 1); box(b, -36, 36, 92, 106, -66, -50);
  b.begin(MOAI, 1); box(b, -46, 46, 28, 72, -64, -40);
  for (const s of [-1, 1]) { b.begin(MOAI, 1); box(b, s > 0 ? 80 : -95, s > 0 ? 95 : -80, 90, 222, -14, 18); }
  b.begin(PUKAO, 1); frustum(b, 0, -4, 56, 42, 300, 336, 8, 0.92, Math.PI / 8, { k: 'hlines', a: 2 });
  return b.done();
};

const BUILD: Record<MechId, () => Mesh> = { eiffel, opera, redeemer, pisa, taj, bigben, colosseum, pyramid, moai };
const built = new Map<MechId, Mesh>();
export const modelOf = (id: MechId) => { let m = built.get(id); if (!m) { m = BUILD[id](); built.set(id, m); } return m; };

/** Each one's moving bits this frame (by group; null: not there). */
export const groupsOf = (id: MechId, m: Mech | undefined, pisaLean: number): (M34 | null | undefined)[] => {
  switch (id) {
    case 'opera': { const open = m?.a ?? 0; return [undefined, ...SHELLS.map(([x]) => rotZ(open * 0.35 * (x < 0 ? 1 : 0.6), x, 62))]; }
    // (its arms spin about its shoulders (the flat art's turn, y down: the other way round here))
    case 'redeemer': return [undefined, m?.b ? null : rotZ(-(m?.a ?? 0), 0, 291)];
    case 'pisa': return [undefined, rotZ(pisaLean, -42, 0)];
    case 'taj': return [undefined, m?.b ? null : undefined];
    case 'moai': { const rise = (m?.k ?? 0) * 150; return [undefined, mov(0, rise, 0), rise > 2 ? scl(1, rise / 150, 1) : null]; }
    default: return [];
  }
};
/** Where its googly eyes sit on its front (local z) and which group they ride with. */
export const EYE_AT: Record<MechId, { z: number; g: number }> = {
  eiffel: { z: -42, g: 0 }, opera: { z: -46, g: 0 }, redeemer: { z: -26, g: 0 }, pisa: { z: -45, g: 1 }, taj: { z: -92, g: 0 },
  bigben: { z: -46, g: 0 }, colosseum: { z: -134, g: 0 }, pyramid: { z: -84, g: 0 }, moai: { z: -60, g: 0 },
};

// ---------------------------------------------------------------------------------------------------------------
// The mech under it (built each frame: posed), the plinth a replica stands on

let plinthMesh: Mesh | null = null;
export const plinthOf = () => {
  if (plinthMesh) return plinthMesh;
  const b = new MB();
  b.begin(PLINTHM); box(b, -64, 64, 0, LEG - 4, -64, 64, { sides: { k: 'panel' } });
  b.begin(PLINTHM); box(b, -66, 66, LEG - 4, LEG, -66, 66);
  return (plinthMesh = b.done());
};

export interface LegPose { u: number; f: number; wreck: boolean; feet?: { x: number; y: number; z: number }[] }
/** The hip's height off the ground: legs 0 crouched .. 1 stood. */
export const hipH = (u: number) => LEG * (0.5 + 0.5 * u);
/** The chassis and legs, posed (local, the ground at y 0): stomping in place, or each foot where it is (walking in). */
export const legsMesh = (P: LegPose): Mesh => {
  const b = new MB(), u = P.u, H = hipH(u), ph = P.wreck ? 0 : P.f * 0.09;
  for (const s of [-1, 1]) {
    const lift = u > 0.95 && !P.feet ? Math.max(0, Math.sin(ph + (s > 0 ? Math.PI : 0))) * 9 : 0;
    let foot = { x: s * (28 + (1 - u) * 6) + (u > 0.95 && !P.feet ? Math.cos(ph + (s > 0 ? Math.PI : 0)) * 5 : 0), y: lift, z: 0 };
    const ft = P.feet?.[s > 0 ? 1 : 0];
    if (ft) foot = { ...ft };
    const hip = { x: s * 16, y: H, z: 0 };
    // (the knee: between, out and forward, more as it's crouched or the foot's up)
    const knee = { x: (hip.x + foot.x) / 2 + s * (8 + (1 - u) * 14), y: (hip.y + foot.y) / 2 + 2, z: (hip.z + foot.z) / 2 - 12 - (1 - u) * 6 };
    b.begin(STEEL); beam(b, hip, knee, 7.5, 7.5);
    b.begin(CHROME); beam(b, knee, { x: foot.x, y: foot.y + 8, z: foot.z }, 5.5, 5.5);
    b.begin(YEL); box(b, knee.x - 8, knee.x + 8, knee.y - 8, knee.y + 8, knee.z - 8, knee.z + 8);
    b.begin(STEEL); frustum(b, foot.x, foot.z - 4, 26, 22, foot.y, foot.y + 10, 4, 0.6, Q);
    for (const t of [-16, 0, 16]) { b.begin(STEEL, 0, true); box(b, foot.x + t - 5, foot.x + t + 5, foot.y, foot.y + 6, foot.z - 24, foot.z - 14); }
  }
  // (the hip chassis: hazard stripes round it; the exhausts)
  b.begin(STEEL); box(b, -48, 48, H - 6, H + 12, -34, 34, { front: { k: 'hazard', a: 10 }, back: { k: 'hazard', a: 10 } });
  for (const s of [-1, 1]) { b.begin(STEEL, 0, true); box(b, s * 52 - 4, s * 52 + 4, H + 2, H + 16, -6, 6); }
  return b.done();
};
