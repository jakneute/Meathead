// Artie's blind (his little guard tower on stilts), as a thing stood out on the loop: seen from wherever the path's
// got to, from well back along it once the trees are down (from behind and his end, three quarters on, as the loop has
// it), turning to face you as you come round to it, till it's side on, as the fight has it, on the strip.
//
// The old 16-bit way (a sprite on a model of boxes): its logs, platform, camo hide and thatch roof are boxes and planes
// put through the orbit's own camera (orbit.ts: the same proj(), so it stands on the floor and goes in order with the
// temple, its wing and the trees), lit by the same sun in the same stepped ramps; Artie's his own sprite, stood in it,
// scaled with it, facing Meathead the whole time.
//
// The hand-off: the strip and the loop see the far end of the path a little differently (the strip's a bent band,
// ORBIT_WRAP; the loop's the real thing in perspective), and the strip's where the fight happens. So as the view comes
// round onto it the blind's turned to face the camera (bit by bit all the way along the walk up to it, TURN_FAR in),
// and (between W_FAR and W_NEAR of the loop's angle off the middle of the view) each of its points put `w` of the way
// from where the loop's camera puts it to where the strip puts it. At w = 1 it IS on the strip: the very same drawing in the world pass (side on, Artie on
// the same spot the fight starts him from), so nothing jumps where one hands to the other.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { GY } from '../geometry';
import { BLIND_X } from './arena';
import { type Pt, type OrbitItem, viewOf, proj, depth, polar, camPos, orbitAngle, ORBIT_WRAP, PR, SUN } from './orbit';
import { drawSafariArtie, ROOF_SCUFFS, type ArtiePose } from '../river/artie';
import { plaque } from '../roof/stone';
import { crown } from '../roof/art';

type Ctx = CanvasRenderingContext2D;
type S = { x: number; y: number };
type L3 = readonly [number, number, number];

/** Where it stands round the loop. */
const BETA = orbitAngle(BLIND_X);
/** How far round the loop off the middle of the view it starts coming round onto the strip, and is there; and from
 *  how far it starts turning to face you (all the way along the walk up to it, side on by the time it's there). */
const W_FAR = 0.95, W_NEAR = 0.5, TURN_FAR = 2.0;
const ease = (from: number, to: number, a: number) => { const k = Math.max(0, Math.min(1, (from - a) / (from - to))); return k * k * (3 - 2 * k); };

/** How far it's come round onto the strip (0 out on the loop .. 1 on the strip), for where the camera is. */
export const blindOnStrip = (state: GameState) => ease(W_FAR, W_NEAR, BETA - viewOf(state).phi);

/** The blind seen from here: where each of its points lands (u along the path, y up, v out toward the strip's camera). */
interface Look {
  w: number;
  at: (u: number, y: number, v: number) => S;
  /** How far off (for putting its parts in order: the orbit camera's depth, it turned as it's shown). */
  far: (u: number, y: number, v: number) => number;
  /** A face's normal (u, v: in its own frame) out in the world, for the light on it. */
  nrm: (nu: number, nv: number) => Pt;
  /** A sprite stood at its middle (Artie): across and up scales. */
  sx: number; sy: number;
  item: { foot: Pt[]; z: number };
}

/**
 * `world`: the strip's own coordinates (drawn in the world pass, bent with the rest of the strip): only once it's all
 * the way round (w = 1). Otherwise screen space, blended as above.
 */
const lookAt = (state: GameState, world: boolean): Look => {
  const v = viewOf(state);
  const w = world ? 1 : blindOnStrip(state), turn = world ? 1 : ease(TURN_FAR, W_NEAR, BETA - v.phi);
  const A = polar(PR, BETA), cam = camPos(v);
  // (turned toward the camera, `turn` of the way: its front's out from the loop's middle as it stands)
  let g = Math.atan2(cam.x - A.x, cam.z - A.z) - BETA;
  g -= Math.round(g / (Math.PI * 2)) * Math.PI * 2;
  const th = BETA + turn * g;
  const n = { x: Math.sin(th), z: Math.cos(th) }, t = { x: Math.cos(th), z: -Math.sin(th) };
  const wx = (u: number, vv: number) => A.x + u * t.x + vv * n.x, wz = (u: number, vv: number) => A.z + u * t.z + vv * n.z;
  const far = (u: number, _y: number, vv: number) => depth(v, wx(u, vv), wz(u, vv));
  const nrm = (nu: number, nv: number) => ({ x: nu * t.x + nv * n.x, z: nu * t.z + nv * n.z });
  const foot = [[-62, -50], [62, -50], [62, 50], [-62, 50]].map(([u, vv]) => ({ x: wx(u, vv), z: wz(u, vv) }));
  const item = { foot, z: depth(v, A.x, A.z) };
  if (world) return { w, at: (u, y) => ({ x: BLIND_X + u, y: GY - y }), far, nrm, sx: 1, sy: 1, item };
  // (the strip's bend: a world x's column on the screen, as render/world.ts lays the strip on)
  const R = ORBIT_WRAP, cx = state.camera.x + CANVAS_WIDTH / 2, cy = state.camera.y;
  const strip = (u: number, y: number): S => ({ x: CANVAS_WIDTH / 2 + R * Math.sin((BLIND_X + u - cx) / R), y: GY - y - cy });
  const at = (u: number, y: number, vv: number): S => {
    const o = proj(v, wx(u, vv), y, wz(u, vv));
    if (w <= 0) return { x: o.x, y: o.y };
    const s = strip(u, y);
    return { x: o.x + (s.x - o.x) * w, y: o.y + (s.y - o.y) * w };
  };
  const sy = (at(0, 150, 0).y - at(0, 160, 0).y) / 10;
  const sx = sy * (1 + (Math.cos((BLIND_X - cx) / R) - 1) * w);
  return { w, at, far, nrm, sx, sy, item };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing it

/** Ramps, darkest first. */
const LOG = ['#2A1A0E', '#432A16', '#5E3E20', '#7A5430', '#966C40'];
const LASH = ['#7A5A2A', '#A0803E', '#C9A86A'];
const PLANK = ['#4A2E16', '#6A4426', '#8A6038', '#B08048', '#CFA060'];
const NET = ['#1E2812', '#2E3A18', '#3E4C22', '#4A5A2A', '#5E6E34', '#7E8A44'];
const NET_BITS = ['#3A4A1E', '#6A7A34', '#5A4A2A', '#7E8A44'];
const THATCH = ['#5E4A22', '#8A7038', '#A48A4A', '#B8A060', '#D2BC78', '#E8D494'];
const LEAVES = ['#1A4A22', '#27662C', '#3A8434', '#8CCB5A'];

/** A face's step in its ramp by how it's turned to the sun (lo .. hi: shadowed .. full on). */
const stepOf = (L: Look, nu: number, nv: number, lo: number, hi: number) => {
  const n = L.nrm(nu, nv);
  const k = Math.max(0, n.x * SUN.x + n.z * SUN.z);
  return lo + Math.round(k * (hi - lo));
};
/** Signed area on screen: below 0, turned toward you (its corners go round anticlockwise seen from outside). */
const area = (s: S[]) => { let a = 0; for (let i = 0; i < s.length; i++) { const p = s[i], q = s[(i + 1) % s.length]; a += p.x * q.y - q.x * p.y; } return a / 2; };
const fillPts = (c: Ctx, s: S[], col: string) => { c.fillStyle = col; c.beginPath(); s.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath(); c.fill(); };
const line = (c: Ctx, p: S, q: S, col: string, w: number) => { c.strokeStyle = col; c.lineWidth = Math.max(1, w); c.lineCap = 'butt'; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); };
/** Art drawn flat on a face (W across, H down from its top left corner), laid onto it where it's turned on screen. */
const onFace = (c: Ctx, s: S[], tl: S, tr: S, bl: S, W: number, H: number, paint: (g: Ctx) => void) => {
  c.save();
  c.beginPath(); s.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath(); c.clip();
  c.transform((tr.x - tl.x) / W, (tr.y - tl.y) / W, (bl.x - tl.x) / H, (bl.y - tl.y) / H, tl.x, tl.y);
  paint(c);
  c.restore();
};

/** The faces of a box (u0..u1 along, y0..y1 up, v0..v1 out), each corner list going round anticlockwise from outside,
 *  with its normal (in the box's own frame). */
const boxFaces = (u0: number, u1: number, y0: number, y1: number, v0: number, v1: number): { p: L3[]; nu: number; nv: number; top?: boolean }[] => [
  { p: [[u0, y0, v1], [u1, y0, v1], [u1, y1, v1], [u0, y1, v1]], nu: 0, nv: 1 },
  { p: [[u1, y0, v0], [u0, y0, v0], [u0, y1, v0], [u1, y1, v0]], nu: 0, nv: -1 },
  { p: [[u1, y0, v1], [u1, y0, v0], [u1, y1, v0], [u1, y1, v1]], nu: 1, nv: 0 },
  { p: [[u0, y0, v0], [u0, y0, v1], [u0, y1, v1], [u0, y1, v0]], nu: -1, nv: 0 },
  { p: [[u0, y1, v1], [u1, y1, v1], [u1, y1, v0], [u0, y1, v0]], nu: 0, nv: 0, top: true },
];
const P = (L: Look, q: L3) => L.at(q[0], q[1], q[2]);

/** A log (a stilt, a post): its faces in the log ramp, lit side light, a lashing or two round it. */
const log = (c: Ctx, L: Look, u: number, vv: number, r: number, y0: number, y1: number, lash: number[]) => {
  for (const f of boxFaces(u - r, u + r, y0, y1, vv - r, vv + r)) {
    const s = f.p.map(q => P(L, q));
    if (area(s) > -0.2) continue;
    const k = f.top ? 3 : stepOf(L, f.nu, f.nv, 1, 4);
    fillPts(c, s, LOG[k]);
    if (f.top) continue;
    // (bark: a dark seam down it; the lashings, rope round it)
    const at = (a: number, y: number) => { const A = s[0], B = s[1]; const ya = (y - y0) / (y1 - y0); const lo = { x: A.x + (B.x - A.x) * a, y: A.y + (B.y - A.y) * a }; const hi = { x: s[3].x + (s[2].x - s[3].x) * a, y: s[3].y + (s[2].y - s[3].y) * a }; return { x: lo.x + (hi.x - lo.x) * ya, y: lo.y + (hi.y - lo.y) * ya }; };
    line(c, at(0.7, y0), at(0.7, y1), LOG[Math.max(0, k - 2)], 1);
    for (const ly of lash) fillPts(c, [at(0, ly - 2), at(1, ly - 2), at(1, ly + 2), at(0, ly + 2)], LASH[Math.min(2, k - 1)]);
  }
};

export interface BlindLook {
  /** Still hid in the leaves (till the trees go). */
  hidden: boolean;
  /** Artie in it, and how (or not there). */
  artie: ArtiePose | null;
  frame: number;
}

/**
 * The blind, its parts in order back to front. `part`: all of it; just what's behind Artie; or Artie and what's in
 * front of him (the strip's drawn him over its back, the netting over his legs).
 */
const drawBlindParts = (c: Ctx, L: Look, o: BlindLook, part: 'all' | 'back' | 'front') => {
  const parts: { layer: number; d: number; draw: () => void; artie?: boolean }[] = [];
  const add = (layer: number, q: L3, draw: () => void, artie = false) => parts.push({ layer, d: L.far(q[0], q[1], q[2]), draw, artie });
  const s1 = L.sy;
  // Its shadow on the ground (out on the loop: on the strip it's under it, edge on)
  add(0, [0, 0, 0], () => {
    const sh = [[-58, -46], [58, -46], [58, 46], [-58, 46]].map(([u, vv]) => L.at(u - 14, 0, vv - 10));
    if (Math.abs(area(sh)) > 4) fillPts(c, sh, 'rgba(18, 38, 10, 0.32)');
  });
  // Under the platform: the stilts, their braces, the ladder, the sign
  for (const [u, vv] of [[-38, -28], [38, -28], [38, 28], [-38, 28]]) add(1, [u, 70, vv], () => log(c, L, u, vv, 4, 0, 142, [128, 60]));
  for (const [u0, v0, u1, v1, nu, nv] of [[-38, 28, 38, 28, 0, 1], [38, -28, -38, -28, 0, -1], [38, 28, 38, -28, 1, 0], [-38, -28, -38, 28, -1, 0]]) {
    add(1, [(u0 + u1) / 2, 75, (v0 + v1) / 2], () => {
      const k = stepOf(L, nu, nv, 1, 3);
      for (const [a, b] of [[[u0, 128, v0], [u1, 22, v1]], [[u1, 128, v1], [u0, 22, v0]]] as const) {
        const p = P(L, a as L3), q = P(L, b as L3);
        line(c, p, q, LOG[k - 1], 5 * s1); line(c, p, q, LOG[k + 1], 2.4 * s1);
      }
    });
  }
  add(1, [52, 75, 33], () => {
    // (the ladder up its front, by the right-hand stilt: two poles, rungs)
    for (const lu of [45, 58]) { line(c, P(L, [lu, 0, 33]), P(L, [lu, 152, 33]), LOG[1], 3.4 * s1); line(c, P(L, [lu, 0, 33]), P(L, [lu, 152, 33]), LOG[3], 1.6 * s1); }
    for (let y = 14; y < 150; y += 18) { line(c, P(L, [45, y, 33]), P(L, [58, y, 33]), LOG[3], 3 * s1); line(c, P(L, [45, y + 1, 33]), P(L, [58, y + 1, 33]), LOG[4], 1 * s1); }
  });
  add(1, [0, 132, 41], () => {
    // (a sign hung on its front: no peeking; from behind, just the board)
    const s = [P(L, [-34, 124, 41]), P(L, [34, 124, 41]), P(L, [34, 140, 41]), P(L, [-34, 140, 41])];
    if (area(s) < -1) onFace(c, s, s[3], s[2], s[0], 68, 16, g => plaque(g, 34, 8, 64, 14, '#8A5A2E', ['PRIVATE'], '#FDE68A', 5));
    else if (area(s) > 1) fillPts(c, s, '#5E3A1E');
  });
  // The platform
  add(2, [0, 147, 0], () => {
    for (const f of boxFaces(-52, 52, 142, 152, -40, 40)) {
      const s = f.p.map(q => P(L, q));
      if (area(s) > -0.2) continue;
      const k = f.top ? 3 : stepOf(L, f.nu, f.nv, 1, 3);
      fillPts(c, s, PLANK[k]);
      if (!f.top) {
        // (its edge lit along the top, a dark line along the bottom; the planks' ends)
        const lt = (a: number, b: number) => ({ x: s[3].x + (s[2].x - s[3].x) * a, y: s[3].y + (s[2].y - s[3].y) * a + b });
        fillPts(c, [s[3], s[2], lt(1, 2 * s1), lt(0, 2 * s1)], PLANK[k + 1]);
        line(c, s[0], s[1], PLANK[0], s1);
      }
    }
  });
  // In the hide: its walls, the far ones' insides first, Artie, the near ones over his legs; the posts, the roof
  const NU = 48, NV = 36, H0 = 152, H1 = 190;
  const walls: { p: L3[]; nu: number; nv: number; w: number }[] = [
    { p: [[-NU, H0, NV], [NU, H0, NV], [NU, H1, NV], [-NU, H1, NV]], nu: 0, nv: 1, w: NU * 2 },
    { p: [[NU, H0, -NV], [-NU, H0, -NV], [-NU, H1, -NV], [NU, H1, -NV]], nu: 0, nv: -1, w: NU * 2 },
    { p: [[NU, H0, NV], [NU, H0, -NV], [NU, H1, -NV], [NU, H1, NV]], nu: 1, nv: 0, w: NV * 2 },
    { p: [[-NU, H0, -NV], [-NU, H0, NV], [-NU, H1, NV], [-NU, H1, -NV]], nu: -1, nv: 0, w: NV * 2 },
  ];
  walls.forEach((wl, i) => {
    const mid: L3 = [(wl.p[0][0] + wl.p[1][0]) / 2, 170, (wl.p[0][2] + wl.p[1][2]) / 2];
    const s = wl.p.map(q => P(L, q));
    const a = area(s);
    if (Math.abs(a) < 0.5) return;
    const outside = a < 0;
    // (its inside: behind him, whatever its depth says; its outside: in front)
    parts.push({ layer: 3, d: L.far(...mid) + (outside ? -2000 : 2000), draw: () => {
      const k = stepOf(L, wl.nu, wl.nv, 2, 4) - (outside ? 0 : 2);
      fillPts(c, s, NET[k]);
      if (outside) {
        // (the camo netting: leaves stuck in it, a ragged hem; seen from outside, laid onto the face)
        onFace(c, s, s[3], s[2], s[0], wl.w, H1 - H0, g => {
          for (let j = 0; j < Math.round(wl.w * 0.42); j++) {
            const lx = hash(j, i * 7 + 1) * (wl.w - 6), ly = hash(j, i * 7 + 2) * (H1 - H0 - 6);
            g.fillStyle = NET_BITS[j % 4]; g.fillRect(lx, ly, 6, 4);
          }
          g.fillStyle = NET[1]; for (let x = 0; x < wl.w; x += 6) g.fillRect(x, H1 - H0 - 4, 3, 4 + (x % 12 ? 0 : 4));
          g.fillStyle = NET[5]; g.fillRect(0, 0, wl.w, 2);
        });
      } else {
        // (inside: the netting's back, in shadow; its lashings across)
        line(c, P(L, [wl.p[3][0], 178, wl.p[3][2]]), P(L, [wl.p[2][0], 178, wl.p[2][2]]), NET[0], 2 * s1);
      }
    } });
  });
  if (o.artie) {
    const pose = o.artie;
    add(3, [0, 175, 0], () => {
      const f = L.at(0, 150, 0);
      c.save(); c.translate(f.x, f.y); c.scale(L.sx, L.sy);
      // (facing Meathead: to the left of him, the whole way round)
      drawSafariArtie(c, 0, 0, -1, o.frame, pose, ROOF_SCUFFS);
      c.restore();
    }, true);
  }
  for (const [u, vv] of [[-46, -34], [46, -34], [46, 34], [-46, 34]]) add(3, [u, 214, vv], () => log(c, L, u, vv, 2.4, 186, 241, []));
  // The roof: four slopes of thatch up to a point (only those turned your way), a ragged eave
  const E = 240, AP: L3 = [0, 274, 0], RU = 62, RV = 50;
  const slopes: { p: L3[]; nu: number; nv: number; w: number }[] = [
    { p: [[-RU, E, RV], [RU, E, RV], AP], nu: 0, nv: 1, w: RU * 2 },
    { p: [[RU, E, -RV], [-RU, E, -RV], AP], nu: 0, nv: -1, w: RU * 2 },
    { p: [[RU, E, RV], [RU, E, -RV], AP], nu: 1, nv: 0, w: RV * 2 },
    { p: [[-RU, E, -RV], [-RU, E, RV], AP], nu: -1, nv: 0, w: RV * 2 },
  ];
  add(4, [0, 250, 0], () => {
    for (const sl of slopes) {
      const s = sl.p.map(q => P(L, q));
      if (area(s) > -0.2) continue;
      const k = stepOf(L, sl.nu, sl.nv, 1, 4);
      fillPts(c, s, THATCH[k]);
      // (the straw: streaks up it to the point, in the next steps; the eave's ragged lip)
      const n = Math.max(3, Math.round(sl.w / 8));
      for (let j = 1; j < n; j++) {
        const a = j / n, e = { x: s[0].x + (s[1].x - s[0].x) * a, y: s[0].y + (s[1].y - s[0].y) * a };
        const m = { x: e.x + (s[2].x - e.x) * (0.55 + 0.3 * hash(j, k)), y: e.y + (s[2].y - e.y) * (0.55 + 0.3 * hash(j, k)) };
        line(c, e, m, j % 2 ? THATCH[k - 1] : THATCH[k + 1], s1);
      }
      line(c, s[0], s[1], THATCH[0], 3 * s1);
      for (let j = 0; j <= n; j++) {
        const a = j / n, e = { x: s[0].x + (s[1].x - s[0].x) * a, y: s[0].y + (s[1].y - s[0].y) * a };
        line(c, e, { x: e.x, y: e.y + (j % 2 ? 4 : 7) * s1 }, THATCH[1], 1.6 * s1);
      }
      line(c, s[0], s[2], THATCH[Math.min(5, k + 1)], s1);
    }
  });
  // Hidden in the leaves, till the trees go: clumps all round it
  if (o.hidden) {
    const CL: [number, number, number, number][] = [[-30, 190, 44, 50], [32, 180, 44, 48], [0, 230, 40, 46], [-6, 150, 46, 44], [40, 130, 40, 36], [-44, 140, 40, 36], [-30, 200, -40, 48], [30, 190, -40, 46], [-56, 180, 0, 42], [56, 170, 0, 42]];
    CL.forEach(([u, y, vv, r]) => add(5, [u, y, vv], () => { const p = L.at(u, y, vv); crown(c, p.x, p.y + Math.sin(o.frame * 0.03 + u) * s1, r * s1, LEAVES); }));
  }
  parts.sort((a, b) => a.layer - b.layer || b.d - a.d);
  const at = parts.findIndex(p => p.artie);
  parts.forEach((p, i) => {
    if (part === 'back' && at >= 0 && i >= at) return;
    if (part === 'front' && (at < 0 || i < at)) return;
    p.draw();
  });
};
const hash = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5; return x - Math.floor(x); };

/**
 * Out on the loop (not all the way round onto the strip yet): the blind as one of the orbit's things, for
 * drawOrbitBackdrop to put in order (or, coming round onto the strip, over the lot). Null once it's on the strip.
 */
export const blindOrbitItem = (c: Ctx, state: GameState, o: BlindLook): { item: OrbitItem; over: boolean } | null => {
  const w = blindOnStrip(state);
  if (w >= 1) return null;
  const L = lookAt(state, false);
  // (nowhere near the screen: not drawn; the margin's its own width, roof and all)
  const m = L.at(0, 140, 0), half = 160 * Math.max(L.sx, L.sy);
  if (m.x < -half || m.x > CANVAS_WIDTH + half) return null;
  return { item: { foot: L.item.foot, y0: 0, y1: 274, z: L.item.z, draw: () => drawBlindParts(c, L, o, 'all') }, over: w > 0 };
};

/** On the strip (all the way round): the blind in the world pass, side on. `part` as drawBlindParts. */
export const drawBlindOnStrip = (c: Ctx, state: GameState, o: BlindLook, part: 'all' | 'back' | 'front') => {
  if (blindOnStrip(state) < 1) return;
  drawBlindParts(c, lookAt(state, true), o, part);
};

/** Where his words go over him in it, on the screen (wherever it's got to). */
export const blindWordsAt = (state: GameState): S => {
  const L = lookAt(state, false);
  return L.at(0, 250, 0);
};
