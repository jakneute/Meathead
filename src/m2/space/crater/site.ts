// The impact site, painted (the final pass: peak SNES, outdoors in the hour's light). One eye for the whole scene
// (paint.ts's view): the ground going back from the play plane to the tree line (mowed lawn in stripes, the pastel walks
// and their joints running away toward the eye, the furrow the saucer plowed, the bowl's far wall), and coming toward him
// under his feet (bent the SNES way so it fans out as he goes by); the backdrop standing on its far edge (the tree line,
// Futureland's skyline: Space Needle 2 going up out of the picture, the giant atom, the Tomorrow Sphere, the monorail).
// Everything standing out there shows its side going back toward the eye (XENOSCARE's building, the fiberglass hull's
// thickness, the churro cart, the pylon's beam, the burning chunk), drawn back to front, each on its own shadow.
// Still things are stamped (painted once; the hour's in the key where the light's baked in); what moves is live.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { timeOfDay, drawTodSky, farTint, skyAt, cloudTint, lampGlow } from '../../timeOfDay';
import { GY } from '../geometry';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { drawCorpse, slimePool, drawRag, type CorpseKind } from './aliens';
import { drawCheapGreen } from './green';
import { lettering, letterSize } from '../square/lettering';
import { D, x0, BOWL, WRECK_X, CART, PYLON, CHUNK_X, HOUSE_DOOR, MOUTH_X, CEIL } from './layout';
import {
  type Ctx, type View, INK, box, checker, mix, hash, stamp, hazeBands, pixelBlob, steppedGlow, bendFloor, viewOf, at, atDepth, poly, inked, line,
  sideFace, flatFace, panel, post, orb, floorAt, shown, LAWN, DIRT, SCORCH, WALK, HULL, CHROME, PINK, TEAL, BONE, STEEL, HAZ,
} from './paint';

const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
/** How far back the ground goes (the tree line stands along its far edge). */
const FAR = 0.62;
/** The eye's height on screen (paint.ts's view). */
const EYE_S = H * 0.42;
/** XENOSCARE's building: its left end, its top; how far back its front's set (the hull juts out of it, toward him). */
const BL = HOUSE_DOOR - 380, BTOP = GY - 470, BSET = 0.88;
/** The lamps out on the site (clear of the signs). */
export const SITE_LAMPS = [D + 2300, D + 4640];

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space): the sky, clouds, Futureland's skyline, the tree line, all standing on the ground's far edge

const SKY = ['#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#E0F2FE'];
/** Where the ground's far edge is on screen (the backdrop stands on it: it moves with the camera's height). */
const horizonY = (state: GameState) => { const g = GY - state.camera.y; return Math.round(EYE_S + (g - EYE_S) * FAR); };
/** A stamped strip repeating along x (screen space), offset ox, translated down to oy. */
const layer = (c: Ctx, key: string, ox: number, oy: number, tileW: number, top: number, h: number, paint: (g: Ctx) => void) => {
  const start = (((ox % tileW) + tileW) % tileW) - tileW;
  for (let tx = start; tx < W; tx += tileW) { c.save(); c.translate(Math.round(tx), Math.round(oy)); stamp(c, key, 0, top, tileW, h, paint); c.restore(); }
};

export const drawImpactBackdrop = (c: Ctx, state: GameState) => {
  const tod = timeOfDay(), cam = state.camera.x - D, hz = horizonY(state);
  drawTodSky(c, 0, 0, W, H, SKY, { horizon: hz, sun: [600, 110], moon: [140, 90], t: state.frame, scroll: cam * 0.02 });
  layer(c, `xc-clouds-${tod.key}`, -cam * 0.03 - state.frame * 0.04, 0, 1400, 10, 240, paintClouds);
  c.save(); c.translate(Math.round(-cam * 0.1), hz + 2); stamp(c, `xc-skyline-${tod.key}`, -130, -560, 1660, 566, paintSkyline); c.restore();
  layer(c, `xc-trees-${tod.key}`, -cam * 0.3, hz + 6, 1200, -120, 330, paintTrees);
  return true;
};

const paintClouds = (g: Ctx) => {
  const tod = timeOfDay();
  const dk = cloudTint('#8E9AB8', tod), sh = cloudTint('#BCC6DC', tod), base = cloudTint('#EEF2FA', tod), lit = cloudTint('#FFFFFF', tod);
  for (let i = 0; i < 5; i++) {
    const s = 34 + hash(i * 3.1) * 46, cx = 120 + i * 250 + hash(i * 7.7) * 60, cy = 50 + hash(i * 5.3) * 110;
    const puffs: [number, number, number, number][] = [[-0.75, 0.06, 0.5, 0.28], [-0.25, -0.18, 0.56, 0.42], [0.35, -0.08, 0.5, 0.34], [0.8, 0.08, 0.4, 0.22]];
    g.save(); g.beginPath(); g.rect(cx - s * 2, cy - s * 2, s * 4, s * 2 + s * 0.24); g.clip();
    for (const [col, dx, dy, k] of [[dk, 0, 6, 1], [sh, 0, 3, 1], [base, 0, 0, 1], [lit, -4, -5, 0.62]] as [string, number, number, number][])
      for (const [px, py, rw, rh] of puffs) pixelBlob(g, cx + px * s + dx, cy + py * s + dy, rw * s * k, rh * s * k, col);
    g.restore();
    box(g, cx - s * 1.1, cy + s * 0.2, s * 2.2, 2, sh);
    checker(g, cx - s * 1.05, cy + s * 0.2 - 2, s * 2.1, 2, sh);
  }
};

/** The far skyline, standing on y = 0 (from x -130 to 1530: it slides 0.1 of the camera). */
const paintSkyline = (g: Ctx) => {
  const tod = timeOfDay(), haze = skyAt(0.86, tod);
  const T = (col: string, k = 1) => mix(farTint(col, 1, tod), haze, 0.22 + 0.2 * k);
  const tr = (R: string[], k = 1) => R.map(col => T(col, k));
  const C = tr(CHROME, 1.2), P = tr(PINK, 1.2), Tl = tr(TEAL, 1.2);
  // Space Needle 2 (going up out of the picture: its decks stacked, a crane on the one they're still adding)
  {
    const x = 70;
    poly(g, [[x - 24, 0], [x - 6, -560], [x + 6, -560], [x + 24, 0]], C[2]);
    poly(g, [[x - 24, 0], [x - 6, -560], [x - 1, -560], [x - 8, 0]], C[4]);
    for (let y = -20; y > -560; y -= 34) { const hw = 24 - (18 * -y) / 560; line(g, [x - hw + 2, y], [x + hw - 2, y - 17], C[1]); line(g, [x + hw - 2, y], [x - hw + 2, y - 17], C[1]); }
    for (const [y, w] of [[-170, 96], [-290, 80], [-400, 66], [-500, 54]] as const) {
      g.fillStyle = C[1]; g.beginPath(); g.ellipse(x, y + 5, w / 2, 8, 0, 0, Math.PI * 2); g.fill();
      box(g, x - w / 2, y - 5, w, 10, C[4]); box(g, x - w / 2, y - 2, w, 4, Tl[3]);
      for (let k = x - w / 2 + 4; k < x + w / 2 - 2; k += 7) box(g, k, y - 2, 1, 4, Tl[1]);
      g.fillStyle = C[5]; g.beginPath(); g.ellipse(x, y - 5, w / 2, 6, 0, Math.PI, 0); g.fill();
      box(g, x - w / 2 + 6, y - 9, w * 0.3, 2, C[6]);
    }
    box(g, x - 1, -560, 2, 30, C[1]);
  }
  // The giant atom: its nucleus up on a pylon, three orbits round it, the electrons
  {
    const x = 440, y = -160;
    box(g, x - 6, y + 20, 12, -y - 20, C[2]); box(g, x - 6, y + 20, 4, -y - 20, C[4]); box(g, x - 16, -8, 32, 8, C[2]); box(g, x - 16, -8, 32, 2, C[4]);
    const ring = (a: number, back: boolean) => {
      g.save(); g.translate(x, y); g.rotate(a);
      g.beginPath(); g.rect(-100, back ? -40 : 0, 200, 40); g.clip();
      g.strokeStyle = C[1]; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, 86, 24, 0, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = C[5]; g.lineWidth = 2; g.beginPath(); g.ellipse(0, -1, 86, 24, 0, 0, Math.PI * 2); g.stroke();
      g.restore();
    };
    for (const a of [0, 1.05, -1.05]) ring(a, true);
    orb(g, x, y, 24, P, false);
    for (const a of [0, 1.05, -1.05]) ring(a, false);
    for (const [ex, ey] of [[x + 82, y + 8], [x - 40, y - 50], [x + 30, y + 52]]) orb(g, ex, ey, 6, Tl, false);
  }
  // The Tomorrow Sphere: a geodesic ball on three legs
  {
    const x = 900, y = -86, r = 70;
    for (const lx of [-54, 0, 54]) poly(g, [[x + lx - 5, 0], [x + lx * 0.5 - 3, y + 40], [x + lx * 0.5 + 3, y + 40], [x + lx + 5, 0]], C[2]);
    orb(g, x, y, r, C, false);
    g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
    g.strokeStyle = C[2]; g.lineWidth = 1;
    for (let k = -r; k < r; k += 18) { g.beginPath(); g.ellipse(x, y, r, Math.abs(k) + 2, 0, 0, Math.PI * 2); g.stroke(); }
    for (let k = -4; k <= 4; k++) { g.beginPath(); g.ellipse(x, y, Math.abs(k) * 17 + 1, r, 0, 0, Math.PI * 2); g.stroke(); }
    checker(g, x - r, y + r * 0.35, r * 2, r, C[1]);
    g.restore();
  }
  // The rocket jets: rockets on arms round a tower
  {
    const x = 1330;
    box(g, x - 4, -190, 8, 190, C[3]); box(g, x - 4, -190, 3, 190, C[5]); orb(g, x, -196, 9, P, false);
    for (const [s, k] of [[-1, 0], [1, 1], [-1, 2], [1, 3]] as const) {
      const ay = -150 + k * 18, ex = x + s * (60 + k * 6), ey = ay + 26;
      line(g, [x, ay], [ex, ey], C[2], 3);
      g.fillStyle = (k % 2 ? Tl : P)[3]; g.beginPath(); g.ellipse(ex, ey + 4, 14, 6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = (k % 2 ? Tl : P)[5]; g.fillRect(ex - 10, ey + 1, 12, 2);
      poly(g, [[ex - s * 12, ey + 4], [ex - s * 20, ey - 4], [ex - s * 18, ey + 8]], (k % 2 ? Tl : P)[2]);
    }
  }
  // The monorail's beam across the lot, on its T pylons; a car on it
  {
    const y = -70;
    for (let x = -100; x < 1540; x += 230) { box(g, x - 4, y, 8, -y, C[2]); box(g, x - 4, y, 3, -y, C[4]); box(g, x - 12, y + 6, 24, 4, C[2]); }
    box(g, -130, y - 1, 1660, 9, C[1]); box(g, -130, y, 1660, 6, C[3]); box(g, -130, y, 1660, 2, C[5]);
    const cx = 1110;
    g.fillStyle = T('#F8FAFC'); g.beginPath(); g.roundRect(cx, y - 22, 130, 21, [12, 12, 4, 4]); g.fill();
    box(g, cx + 6, y - 17, 116, 5, Tl[2]); for (let k = cx + 12; k < cx + 120; k += 14) box(g, k, y - 17, 1, 5, C[4]);
    box(g, cx + 2, y - 8, 126, 3, P[3]); box(g, cx + 8, y - 21, 50, 1, T('#FFFFFF'));
  }
  // The low buildings along the park's back: googie roofs (a boomerang, folded plates, a starburst up on a pole)
  const bodies = ['#E6E1F0', '#D9E8F2', '#F2E1EA', '#E4EEE0', '#F3EBD8'];
  for (let i = 0; i < 14; i++) {
    const x = -110 + i * 118 + Math.round(hash(i * 1.9) * 24), w = 70 + Math.round(hash(i * 2.7) * 44), h = 24 + Math.round(hash(i * 4.1) * 42);
    const R = tr([dark2(bodies[i % 5], 0.45), dark2(bodies[i % 5], 0.25), bodies[i % 5], lite2(bodies[i % 5])], 0.7);
    box(g, x, -h, w, h, R[2]); box(g, x, -h, 3, h, R[3]); box(g, x + w - 4, -h, 4, h, R[1]);
    box(g, x + 4, -Math.round(h * 0.6), w - 8, 6, Tl[2]); box(g, x + 4, -Math.round(h * 0.6), w - 8, 1, Tl[4]);
    for (let k = x + 10; k < x + w - 6; k += 12) box(g, k, -Math.round(h * 0.6), 1, 6, R[1]);
    const kind = i % 3, rc = i % 2 ? P : Tl;
    if (kind === 0) { poly(g, [[x - 12, -h + 2], [x + w * 0.55, -h - 16], [x + w + 14, -h + 2], [x + w + 14, -h + 5], [x + w * 0.55, -h - 12], [x - 12, -h + 5]], rc[3]); line(g, [x - 12, -h + 2], [x + w * 0.55, -h - 16], rc[5]); }
    else if (kind === 1) { for (let k = 0; k < 4; k++) { const a = x + (k * w) / 4, b = a + w / 4; poly(g, [[a, -h], [a + w / 8, -h - 9], [b, -h]], k % 2 ? rc[2] : rc[4]); } }
    else { box(g, x + w / 2 - 1, -h - 30, 2, 30, R[1]); const sx = x + w / 2, sy = -h - 34; for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; line(g, [sx, sy], [sx + Math.cos(a) * 9, sy + Math.sin(a) * 9], T(HAZ[4])); } }
  }
  hazeBands(g, -130, -44, 1660, 46, tod.haze, 0, 0.6, 6);
};
const dark2 = (c: string, k: number) => mix(c, '#2A2238', k);
const lite2 = (c: string) => mix(c, '#FFFFFF', 0.35);

/** The tree line along the far edge of the lawn (standing on y = 0), a chrome rail fence, the far lawn under it. */
const paintTrees = (g: Ctx) => {
  const tod = timeOfDay(), haze = skyAt(0.9, tod);
  const T = (col: string) => mix(farTint(col, 0.5, tod), haze, 0.16);
  const TR = ['#18301E', '#24442A', '#335E34', '#477A3C', '#62964A', '#86B25E'].map(T);
  const C = CHROME.map(T);
  box(g, 0, 0, 1200, 210, T(LAWN[3])); checker(g, 0, 0, 1200, 4, T(LAWN[2]));
  for (let i = 0; i < 17; i++) {
    const x = 34 + i * 66 + Math.round(hash(i * 3.3) * 20), kind = Math.floor(hash(i * 8.1) * 3);
    if (kind === 0) {
      box(g, x - 3, -26, 6, 26, T('#4A3424')); box(g, x - 3, -26, 2, 26, T('#6E5038'));
      pixelBlob(g, x, -52, 30, 26, TR[1]); pixelBlob(g, x - 4, -56, 26, 22, TR[2]); pixelBlob(g, x - 9, -62, 17, 14, TR[3]); pixelBlob(g, x - 13, -66, 8, 6, TR[4]);
    } else if (kind === 1) {
      box(g, x - 2, -40, 4, 40, T('#5A4030'));
      pixelBlob(g, x, -58, 20, 20, TR[2]); pixelBlob(g, x - 4, -62, 14, 14, TR[3]); pixelBlob(g, x - 7, -66, 6, 6, TR[5]);
    } else {
      for (let k = 0; k < 6; k++) { const y = -10 - k * 12, hw = 22 - k * 3.4; box(g, x - hw, y - 12, hw * 2, 12, TR[1 + (k % 2)]); box(g, x - hw, y - 12, hw * 0.7, 12, TR[3 + (k % 2)]); }
      box(g, x - 2, -10, 4, 10, T('#4A3424'));
    }
  }
  // (the fence: two chrome rails on posts)
  for (let x = 0; x < 1200; x += 40) { box(g, x, -18, 3, 18, C[2]); box(g, x, -18, 1, 18, C[5]); }
  box(g, 0, -16, 1200, 2, C[4]); box(g, 0, -9, 1200, 2, C[3]);
  hazeBands(g, 0, -40, 1200, 42, tod.haze, 0, 0.32, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// The ground going back (world, live: it swings with the eye)

/** The depth of the k-th fraction of the way back (rows bunching up toward the far edge). */
const dk = (k: number) => 1 - (1 - FAR) * (1 - Math.pow(1 - k, 1.5));
/** The walks across the lawn at the play plane (and going back to the far walk). */
const PLAZAS: [number, number][] = [[D + 2700, D + 3600], [D + 4500, HOUSE_DOOR]];
const FAR_WALK = [0.745, 0.705] as const;
const CRATER = { mx: (BOWL.a + BOWL.d) / 2, half: (BOWL.d - BOWL.a) / 2 + 50, deep: 0.18 };
/** The crater's far rim's depth at x (1 at its ends). */
const rimD = (x: number) => { const u = (x - CRATER.mx) / CRATER.half; return 1 - CRATER.deep * Math.sqrt(Math.max(0, 1 - u * u)); };
/** The furrow's far edge's depth at x (it widens toward the bowl). */
const FURROW = { a: x0 - 600, b: BOWL.a + 20 };
const furrowD = (x: number) => 1 - 0.03 - 0.08 * Math.max(0, Math.min(1, (x - FURROW.a) / (FURROW.b - FURROW.a)));

const drawGroundBack = (c: Ctx, v: View) => {
  const eye = v.eye, tod = timeOfDay(), hz = skyAt(0.92, tod);
  const L = Math.max(x0 - 600, eye.x - 760), R = Math.min(HOUSE_DOOR + 40, eye.x + 760);
  if (R <= L) return;
  const tint = (col: string, d: number) => mix(col, hz, Math.max(0, Math.min(1, (1 - d) / (1 - FAR))) * 0.4);
  const q = (xa: number, xb: number, da: number, db: number, col: string) => poly(c, [at(eye, xa, GY, da), at(eye, xb, GY, da), at(eye, xb, GY, db), at(eye, xa, GY, db)], col);
  const seam = (xa: number, xb: number, d: number, col: string) => { const [lx, y] = at(eye, xa, GY, d), [rx] = at(eye, xb, GY, d); checker(c, Math.round(lx), Math.round(y) - 1, Math.round(rx - lx), 2, col); };
  // The lawn, mowed in stripes, bunching up going back, hazier
  const n = 10;
  for (let i = 0; i < n; i++) q(L, R, dk(i / n), dk((i + 1) / n) - 0.001, tint(LAWN[i % 2 ? 3 : 4], dk(i / n)));
  for (let i = 1; i < n; i++) seam(L, R, dk(i / n), tint(LAWN[i % 2 ? 4 : 3], dk(i / n)));
  // (tufts, clover, a dandelion: smaller going back)
  for (let gx = Math.floor(L / 46) * 46; gx < R; gx += 46) {
    const d = 1 - (1 - FAR) * hash(gx * 0.0137), [px, py] = at(eye, gx + hash(gx * 0.07) * 40, GY, d), s = d > 0.85 ? 2 : 1;
    box(c, px, py - s, s * 2, s, tint(LAWN[2], d)); box(c, px + s, py - s * 2, s, s, tint(LAWN[5], d));
    if (hash(gx * 0.31) > 0.86) box(c, px + 3, py - 2, s, s, tint('#FDE047', d));
  }
  // The far walk (the park's promenade), its curbs, its joints
  q(L, R, FAR_WALK[0], FAR_WALK[1], tint(WALK[4], 0.72));
  q(L, R, FAR_WALK[0], FAR_WALK[0] - 0.006, tint(WALK[6], 0.74)); q(L, R, FAR_WALK[1] + 0.004, FAR_WALK[1], tint(WALK[2], 0.7));
  for (let x = Math.floor(L / 60) * 60; x < R; x += 60) line(c, at(eye, x, GY, FAR_WALK[0] - 0.006), at(eye, x, GY, FAR_WALK[1] + 0.004), tint(WALK[3], 0.72));
  // The plazas: running back from the play plane to the far walk, their joints converging on the eye, pink curbs
  for (const [a, b] of PLAZAS) {
    const xa = Math.max(a, L), xb = Math.min(b, R);
    if (xb <= xa) continue;
    for (let i = 0; i < 6; i++) { const da = 1 - ((1 - FAR_WALK[0]) * i) / 6, db = 1 - ((1 - FAR_WALK[0]) * (i + 1)) / 6; q(xa, xb, da, db, tint(WALK[i < 2 ? 5 : i < 4 ? 4 : 4], da)); }
    for (let x = Math.ceil(a / 64) * 64; x < b; x += 64) if (x > xa && x < xb) line(c, at(eye, x, GY, 1), at(eye, x, GY, FAR_WALK[0]), tint(WALK[3], 0.85));
    for (const d of [0.95, 0.89, 0.83, 0.78]) { const [lx, y] = at(eye, xa, GY, d), [rx] = at(eye, xb, GY, d); box(c, lx, y, rx - lx, 1, tint(WALK[3], d)); }
    for (const e of [a, b]) if (e >= L && e <= R) { line(c, at(eye, e, GY, 1), at(eye, e, GY, FAR_WALK[0]), tint(PINK[3], 0.85), 3); line(c, at(eye, e, GY, 1), at(eye, e, GY, FAR_WALK[0]), tint(PINK[5], 0.85), 1); }
  }
  // The furrow the saucer plowed: a scorched trench along the play line, widening to the bowl, its far bank thrown up
  {
    const xa = Math.max(FURROW.a, L), xb = Math.min(FURROW.b, R);
    if (xb > xa) {
      const pts = (f: (x: number) => number): [number, number][] => { const out: [number, number][] = []; for (let x = xa; x <= xb; x += 24) out.push(at(eye, x, GY, f(x))); out.push(at(eye, xb, GY, f(xb))); return out; };
      const far = pts(furrowD), bank = pts(x => furrowD(x) - 0.014), mid = pts(x => (1 + furrowD(x)) / 2);
      poly(c, [...bank, ...[...far].reverse()], tint(DIRT[4], 0.9));
      poly(c, [...bank.slice(0, 1), ...bank, ...[...bank].reverse().map(([x, y]) => [x, y + 2] as [number, number])], tint(DIRT[6], 0.9));
      poly(c, [at(eye, xa, GY, 1), at(eye, xb, GY, 1), ...[...far].reverse()], tint(SCORCH[3], 0.95));
      poly(c, [at(eye, xa, GY, 1), at(eye, xb, GY, 1), ...[...mid].reverse()], tint(SCORCH[2], 0.97));
      for (let x = Math.ceil(xa / 34) * 34; x < xb; x += 34) { const [px, py] = at(eye, x + hash(x) * 20, GY, furrowD(x) - 0.01); box(c, px, py - 2, 3, 2, tint(DIRT[5], 0.9)); box(c, px + 1, py - 3, 1, 1, tint(DIRT[6], 0.9)); }
      // (scorch streaks blown along it, and smoldering bits)
      for (let x = Math.ceil(xa / 90) * 90; x < xb; x += 90) line(c, at(eye, x, GY, 0.995), at(eye, x + 70, GY, (1 + furrowD(x)) / 2 + 0.01), tint(SCORCH[1], 0.97), 2);
    }
  }
  // The bowl: its ejecta lip round the far rim, its far wall going down into it in bands, scorch streaks out over the lawn
  {
    const xa = Math.max(CRATER.mx - CRATER.half, L), xb = Math.min(CRATER.mx + CRATER.half, R);
    if (xb > xa) {
      const xs: number[] = []; for (let x = xa; x < xb; x += 12) xs.push(x); xs.push(xb);
      // (the scorch streaks out across the lawn, behind the lip)
      for (let k = 0; k < 7; k++) {
        const ex = CRATER.mx + (k - 3) * 150, d0 = rimD(ex) - 0.01, d1 = Math.max(FAR + 0.02, d0 - 0.1 - hash(k) * 0.08);
        if (ex < L || ex > R) continue;
        poly(c, [at(eye, ex - 26, GY, d0), at(eye, ex + 26, GY, d0), at(eye, ex + (k - 3) * 60 + 4, GY, d1), at(eye, ex + (k - 3) * 60 - 4, GY, d1)], tint(SCORCH[3], d0));
      }
      const lip = (x: number) => rimD(x) - 0.03 * Math.sqrt(Math.max(0, 1 - ((x - CRATER.mx) / CRATER.half) ** 2));
      const rim = xs.map(x => at(eye, x, GY, rimD(x))), top = xs.map(x => at(eye, x, GY, lip(x)));
      poly(c, [...top, ...[...rim].reverse()], tint(DIRT[4], 0.85));
      poly(c, [...top, ...[...top].reverse().map(([x, y]) => [x, y + 2] as [number, number])], tint(DIRT[6], 0.85));
      // (the far wall, rim to the floor at the play plane, in bands: lit at the top, the shade down in it)
      const floorPt = (x: number): [number, number] => [x, floorAt(x)];
      const cols = [DIRT[5], DIRT[4], DIRT[3], DIRT[3], DIRT[2], DIRT[2]];
      for (let i = 0; i < cols.length; i++) {
        const t0 = i / cols.length, t1 = (i + 1) / cols.length;
        const lerp = (x: number, t: number): [number, number] => { const [ax, ay] = at(eye, x, GY, rimD(x)), [bx, by] = floorPt(x); return [ax + (bx - ax) * t, ay + (by - ay) * t]; };
        poly(c, [...xs.map(x => lerp(x, t0)), ...[...xs].reverse().map(x => lerp(x, t1))], cols[i]);
        if (i) { c.fillStyle = cols[i - 1]; for (let j = 0; j < xs.length; j += 2) { const [px, py] = lerp(xs[j], t0); c.fillRect(Math.round(px), Math.round(py), 2, 2); } }
      }
      // (furrows of the impact down the wall, clods, a smoking crack)
      for (let k = 0; k < 9; k++) {
        const x = CRATER.mx - CRATER.half * 0.8 + k * CRATER.half * 0.2;
        if (x < xa || x > xb) continue;
        const [ax, ay] = at(eye, x, GY, rimD(x));
        line(c, [ax, ay + 3], [x + (x - CRATER.mx) * 0.08, floorAt(x) - 4], DIRT[1], 2);
        box(c, ax + 6, ay + 10 + (k % 3) * 6, 4, 3, DIRT[5]); box(c, ax + 6, ay + 13 + (k % 3) * 6, 4, 1, DIRT[1]);
      }
    }
  }
  // The burning chunk's scorch mark (round, flat on the lawn)
  if (CHUNK_X + 140 > L && CHUNK_X - 140 < R) for (const [rx, rd, col] of [[130, 0.05, SCORCH[3]], [90, 0.032, SCORCH[2]], [50, 0.018, SCORCH[1]]] as const) {
    const pts: [number, number][] = [];
    for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2; pts.push(at(eye, CHUNK_X + Math.cos(a) * rx, GY, 1 - rd - 0.002 + Math.sin(a) * rd)); }
    poly(c, pts, tint(col, 0.95));
  }
  // The promenade's furniture: planters of pastel tulips, googie lamps (at the far walk: smaller, hazier)
  for (let x = Math.floor(L / 420) * 420 + 60; x < R; x += 420) {
    const d = FAR_WALK[0] + 0.01, [sx] = at(eye, x, GY, d);
    if (sx < v.cam.x - 80 || sx > v.cam.x + W + 80 || (x > CRATER.mx - CRATER.half - 60 && x < CRATER.mx + CRATER.half + 60)) continue;
    atDepth(c, eye, d, () => { c.save(); c.translate(Math.round(x), GY); stamp(c, `xc-planter-${tod.key}`, -40, -40, 80, 42, paintPlanter); c.restore(); });
    const lx = x + 210, [sl] = at(eye, lx, GY, FAR_WALK[1] + 0.002);
    if (lx < R && sl > v.cam.x - 40 && sl < v.cam.x + W + 40) atDepth(c, eye, FAR_WALK[1] + 0.002, () => { c.save(); c.translate(Math.round(lx), GY); stamp(c, `xc-farlamp-${tod.key}`, -20, -170, 40, 172, paintFarLamp); c.restore(); });
  }
};

const paintPlanter = (g: Ctx) => {
  const haze = skyAt(0.9), T = (col: string) => mix(col, haze, 0.2);
  inked(g, [[-30, -18], [30, -18], [26, 0], [-26, 0]], T(PINK[3]));
  box(g, -29, -18, 58, 3, T(PINK[5])); box(g, 18, -15, 9, 14, T(PINK[2]));
  for (let k = 0; k < 9; k++) {
    const x = -24 + k * 6, h = 10 + (k % 3) * 4;
    box(g, x, -18 - h, 1, h, T(LAWN[3]));
    const col = [PINK[4], '#FDE047', TEAL[4], '#C4B5FD'][k % 4];
    box(g, x - 2, -22 - h, 5, 5, T(col)); box(g, x - 2, -22 - h, 2, 2, T(mix(col, '#FFFFFF', 0.5)));
  }
};
const paintFarLamp = (g: Ctx) => {
  const haze = skyAt(0.9), T = (col: string) => mix(col, haze, 0.25);
  box(g, -2, -150, 4, 150, T(CHROME[2])); box(g, -2, -150, 1, 150, T(CHROME[5]));
  g.fillStyle = T(PINK[2]); g.beginPath(); g.ellipse(0, -152, 16, 6, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = T(PINK[4]); g.beginPath(); g.ellipse(0, -154, 16, 4, 0, Math.PI, 0); g.fill();
  box(g, -3, -164, 6, 8, T('#FFF7D6'));
};

// ---------------------------------------------------------------------------------------------------------------
// The ground at the play plane and under his feet (stamped tiles of it; bent toward the eye where it's flat)

const drawGroundNear = (c: Ctx, v: View) => {
  const a = Math.max(x0 - 400, v.v0), b = Math.min(HOUSE_DOOR + 40, v.v1);
  if (b <= a) return;
  for (let tx = Math.floor((a - D) / 400) * 400 + D; tx < b; tx += 400) stamp(c, `xc-near-${Math.round((tx - D) / 400)}`, tx, GY - 4, 400, 330, g => paintNear(g, tx));
  const bot = v.bot;
  bendFloor(c, v.eye, GY, GY, bot, Math.max(a, BOWL.d + 4), Math.min(b, HOUSE_DOOR));
};
const isWalk = (x: number) => PLAZAS.some(([a, b]) => x >= a && x < b);
const paintNear = (g: Ctx, tx: number) => {
  for (let x = tx; x < tx + 400; x += 2) {
    const y = Math.round(floorAt(x + 1)), inBowl = x > BOWL.a && x < BOWL.d, furrow = x <= BOWL.a, walk = !inBowl && !furrow && isWalk(x);
    const R = inBowl ? DIRT : furrow ? SCORCH.concat(DIRT[4], DIRT[5]) : walk ? WALK : LAWN;
    if (walk) {
      // (poured concrete, lavender: slabs, their joints, a pink inlay every so often)
      box(g, x, y, 2, 330, R[4]);
      box(g, x, y + 22, 2, 30, R[3]); box(g, x, y + 52, 2, 300, R[3]);
      if ((x - D) % 64 < 2) { box(g, x, y + 4, 1, 330, R[2]); box(g, x + 1, y + 4, 1, 330, R[5]); }
      if ((x - D) % 256 < 2) box(g, x, y + 4, 2, 330, PINK[4]);
      for (const ry of [y + 22, y + 52, y + 96]) box(g, x, ry, 2, 1, R[2]);
      box(g, x, y, 2, 2, R[6]); box(g, x, y + 2, 2, 2, R[5]);
    } else if (inBowl || furrow) {
      // (turned-up dirt: bands down, clods)
      box(g, x, y, 2, 330, R[3]); box(g, x, y + 16, 2, 330, R[2]); box(g, x, y + 46, 2, 300, R[1]);
      if (hash(x * 0.71) < 0.22) box(g, x, y + 6 + Math.floor(hash(x) * 30), 3, 2, R[0]);
      if (hash(x * 0.37) < 0.1) box(g, x, y + 4 + Math.floor(hash(x * 3) * 40), 2, 2, R[4]);
      box(g, x, y, 2, 2, furrow ? DIRT[5] : DIRT[6]); box(g, x, y + 2, 2, 2, furrow ? DIRT[4] : DIRT[5]);
    } else {
      // (the lawn: mowed in stripes toward him, blades along its lip)
      const stripe = Math.floor((x - D) / 48) % 2;
      box(g, x, y, 2, 330, R[stripe ? 4 : 3]); box(g, x, y + 40, 2, 300, R[stripe ? 3 : 2]);
      if (hash(x * 0.53) < 0.3) box(g, x, y + 4 + Math.floor(hash(x * 1.3) * 36), 1, 2, R[stripe ? 5 : 4]);
      box(g, x, y, 2, 2, R[6]); box(g, x, y + 2, 2, 1, R[5]);
      if (hash(x * 0.37) < 0.35) box(g, x + 1, y - 2 - Math.floor(hash(x * 2.1) * 2), 1, 2, R[5]);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Going back: XENOSCARE's building (set back) and its side, the hull's thickness, the cart's, the pylon's, the chunk's;
// each on a shadow along its foot

/** The fiberglass hull's outline (world, at the play plane). */
const hullPath = (g: Ctx) => {
  const cx = MOUTH_X;
  g.beginPath(); g.moveTo(BL - 40, GY); g.quadraticCurveTo(BL - 30, GY - 400, cx + 40, GY - 440); g.quadraticCurveTo(HOUSE_DOOR + 10, GY - 420, HOUSE_DOOR - 10, GY); g.closePath();
};
/** The burning chunk's outline. */
const chunkPath = (g: Ctx) => { g.beginPath(); g.moveTo(CHUNK_X - 80, GY); g.lineTo(CHUNK_X - 54, GY - 46); g.lineTo(CHUNK_X - 20, GY - 58); g.lineTo(CHUNK_X + 40, GY - 64); g.lineTo(CHUNK_X + 62, GY - 30); g.lineTo(CHUNK_X + 80, GY); g.closePath(); };

const drawGoingBack = (c: Ctx, v: View) => {
  const eye = v.eye;
  const shadow = (xa: number, xb: number, d: number) => poly(c, [at(eye, xa, GY, 1), at(eye, xb, GY, 1), at(eye, xb, GY, d), at(eye, xa, GY, d)], 'rgba(20, 16, 30, 0.32)');
  // XENOSCARE's building: its front set back (the starfield painted on it), its left side going back
  if (v.v0 < HOUSE_DOOR + 100 && v.v1 > BL - 700) {
    sideFace(c, eye, BL, -1, BTOP, GY, BSET, 0.6, [STEEL[3], STEEL[2], STEEL[2], STEEL[1]]);
    if (eye.x < BL) {
      // (the stars painted round its side too; its parapet's trim)
      for (let i = 0; i < 16; i++) { const p = at(eye, BL, BTOP + 20 + hash(i * 3.3) * 420, BSET - hash(i * 7.1) * (BSET - 0.6)); box(c, p[0], p[1], 1, 1, i % 3 ? '#8B7FC0' : '#D6D0F0'); }
      line(c, at(eye, BL, BTOP, BSET), at(eye, BL, BTOP, 0.6), CHROME[4], 2);
    }
    atDepth(c, eye, BSET, () => stamp(c, 'xc-building', BL - 4, BTOP - 10, HOUSE_DOOR + 700 - BL, GY - BTOP + 14, paintBuilding));
    // (the hull's thickness, back to the building: its outline again and again toward the eye, darker going back)
    c.save(); c.beginPath(); c.rect(v.v0 - 400, BTOP - 200, v.v1 - v.v0 + 800, GY - BTOP + 200); c.clip();
    shadow(BL - 60, HOUSE_DOOR, BSET);
    const steps: [number, string][] = [[BSET, BONE[1]], [0.91, BONE[2]], [0.935, BONE[2]], [0.955, BONE[3]], [0.972, BONE[3]], [0.986, BONE[4]]];
    for (const [d, col] of steps) atDepth(c, eye, d, () => { hullPath(c); c.fillStyle = col; c.fill(); });
    c.restore();
  }
  // The churro cart: its top (he's above it), its side toward the middle
  if (v.v0 < CART.x + CART.w + 200 && v.v1 > CART.x - 200) {
    const top = GY - CART.h + 6, x = CART.x, r = x + CART.w;
    shadow(x - 8, r + 8, 0.9);
    if (eye.x > r) sideFace(c, eye, r, 1, top, GY, 1, 0.92, [PINK[2], PINK[1]]);
    else if (eye.x < x) sideFace(c, eye, x, -1, top, GY, 1, 0.92, [PINK[2], PINK[1]]);
    flatFace(c, eye, x, r, top, 1, 0.92, [PINK[5], PINK[4], PINK[4]]);
    line(c, at(eye, x, top, 0.92), at(eye, r, top, 0.92), INK);
  }
  // The pylon's beam: its top (stood on), its ends; its column's
  if (v.v0 < PYLON.x + PYLON.w + 260 && v.v1 > PYLON.x - 260) {
    const { x, y, w } = PYLON, r = x + w;
    shadow(x - 60, r + 60, 0.93);
    const cx = r - 30;
    if (eye.x > cx + 20) sideFace(c, eye, cx + 20, 1, y + 18, GY, 1, 0.95, [CHROME[2], CHROME[1]]);
    if (eye.x > r) sideFace(c, eye, r, 1, y, y + 18, 1, 0.94, [CHROME[3], CHROME[2]]);
    else if (eye.x < x) sideFace(c, eye, x, -1, y, y + 18, 1, 0.94, [CHROME[3], CHROME[2]]);
    flatFace(c, eye, x, r, y, 1, 0.94, [CHROME[5], CHROME[4]]);
    line(c, at(eye, x, y, 0.94), at(eye, r, y, 0.94), INK);
    // (the fallen column's thickness)
    atDepth(c, eye, 0.95, () => poly(c, [[x - 52, GY], [x + 30, y + 16], [x + 56, y + 16], [x - 18, GY]], CHROME[1]));
  }
  // The chunk: its thickness
  if (v.v0 < CHUNK_X + 200 && v.v1 > CHUNK_X - 200) {
    shadow(CHUNK_X - 90, CHUNK_X + 90, 0.93);
    for (const [d, col] of [[0.93, HULL[0]], [0.955, HULL[1]], [0.978, HULL[2]]] as const) atDepth(c, eye, d, () => { chunkPath(c); c.fillStyle = col; c.fill(); });
  }
};

/** XENOSCARE's building front (drawn set back): a black box, a starfield and a nebula painted on it, its parapet. */
const paintBuilding = (g: Ctx) => {
  const w = HOUSE_DOOR + 700 - BL;
  box(g, BL, BTOP, w, GY - BTOP, STEEL[2]);
  for (let k = 0; k < 6; k++) box(g, BL, BTOP + 40 + k * 70, w, 1, STEEL[3]);
  pixelBlob(g, BL + 120, BTOP + 120, 90, 40, '#2A1650'); pixelBlob(g, BL + 150, BTOP + 112, 60, 24, '#3E1E6E'); pixelBlob(g, BL + 170, BTOP + 106, 26, 10, '#6A3EA8');
  pixelBlob(g, BL + 330, BTOP + 260, 70, 30, '#1A2A58'); pixelBlob(g, BL + 340, BTOP + 254, 40, 16, '#2E4A8A');
  for (let i = 0; i < 90; i++) {
    const sx = BL + 6 + hash(i * 1.37) * (w - 12), sy = BTOP + 8 + hash(i * 2.91) * (GY - BTOP - 20), big = hash(i * 5.7) > 0.88;
    box(g, sx, sy, 1, 1, i % 4 ? '#B4A8E8' : '#FFFFFF');
    if (big) { box(g, sx - 1, sy, 3, 1, '#7C6EC0'); box(g, sx, sy - 1, 1, 3, '#7C6EC0'); box(g, sx, sy, 1, 1, '#FFFFFF'); }
  }
  // (the parapet: chrome, lit)
  box(g, BL - 2, BTOP - 8, w + 2, 9, INK); box(g, BL, BTOP - 7, w, 6, CHROME[3]); box(g, BL, BTOP - 7, w, 2, CHROME[5]); box(g, BL, BTOP - 2, w, 1, CHROME[1]);
  box(g, BL, BTOP, 3, GY - BTOP, STEEL[5]);
};

// ---------------------------------------------------------------------------------------------------------------
// The wreck: the saucer (from a little above), half buried in the bowl; its upper deck and its cabin's roof are stood on

const drawWreck = (c: Ctx, state: GameState) => {
  if (!shown(state, WRECK_X - 420, WRECK_X + 420)) return;
  stamp(c, 'xc-wreck', WRECK_X - 380, GY - 120, 760, BOWL.deep + 140, paintWreck);
  // Live: the lights round the rim flickering, sparks off the torn wiring, the fire in the plates
  const f = state.frame, ry = GY + 12;
  if (f % 30 < 18) { box(c, WRECK_X - 70, ry, 12, 5, '#FDE047'); box(c, WRECK_X - 69, ry, 4, 2, '#FFFBE6'); }
  if (f % 46 < 10) { box(c, WRECK_X + 150, ry, 12, 5, '#F87171'); box(c, WRECK_X + 151, ry, 4, 2, '#FFE4E6'); }
  if (f % 70 < 6) for (let i = 0; i < 4; i++) box(c, WRECK_X + 112 + i * 7 - (f % 7), GY - 26 + ((i * 5 + f) % 9), 2, 2, i % 2 ? '#FFFFFF' : '#FDE047');
  fireAt(c, WRECK_X + 130, GY - 30, 44, f);
};
const paintWreck = (g: Ctx) => {
  const cx = WRECK_X, floor = GY + BOWL.deep, rimY = GY + 16;
  // (the lens: the rim's band and the hull under it, buried in the dirt; drawn in bands, lit from above)
  g.save(); g.beginPath(); g.ellipse(cx, rimY, 304, 52, 0, 0, Math.PI * 2); g.rect(cx - 380, floor - 2, 760, 40); g.clip();
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, rimY, 304, 52, 0, 0, Math.PI * 2); g.fill();
  const bands: [number, string][] = [[-52, HULL[5]], [-20, HULL[4]], [-6, HULL[6]], [-3, HULL[5]], [4, HULL[3]], [12, HULL[2]], [24, HULL[1]], [40, HULL[0]]];
  g.beginPath(); g.ellipse(cx, rimY, 302, 50, 0, 0, Math.PI * 2); g.clip();
  bands.forEach(([y0, col], i) => { const y1 = bands[i + 1]?.[0] ?? 60; box(g, cx - 310, rimY + y0, 620, y1 - y0, col); });
  bands.forEach(([y0, col], i) => { if (i && i !== 3) checker(g, cx - 310, rimY + y0 - 2, 620, 2, col); });
  // (the underside's panels, radiating to its belly; the rim's lights, most of them out)
  for (let k = -6; k <= 6; k++) line(g, [cx + k * 46, rimY + 6], [cx + k * 22, rimY + 52], HULL[0]);
  for (let i = 0; i < 12; i++) { const lx = cx - 262 + i * 46; box(g, lx - 1, rimY - 5, 14, 9, INK); box(g, lx, rimY - 4, 12, 7, i % 5 === 2 ? '#A16207' : '#3F3F46'); box(g, lx + 1, rimY - 3, 3, 2, '#71717A'); }
  g.restore();
  // (the upper hull: sloped up from the rim to the deck, stepped, its seams; the deck's top seen from above, its lit lip)
  const deckY = GY - 22, dl = cx - 250, dr = cx + 220;
  inked(g, [[cx - 300, rimY - 6], [dl - 18, deckY + 10], [dl, deckY], [dr, deckY], [dr + 18, deckY + 10], [cx + 300, rimY - 6]], HULL[4], 1.5);
  poly(g, [[cx - 296, rimY - 7], [dl - 16, deckY + 10], [dl + 2, deckY + 2], [dl + 60, deckY + 2], [cx - 200, rimY - 7]], HULL[5]);
  poly(g, [[cx + 160, rimY - 7], [dr - 40, deckY + 2], [dr, deckY + 2], [dr + 16, deckY + 10], [cx + 296, rimY - 7]], HULL[3]);
  box(g, cx - 296, rimY - 10, 592, 3, HULL[2]); checker(g, cx - 290, rimY - 13, 580, 2, HULL[3]);
  for (let k = -5; k <= 5; k++) line(g, [cx + k * 50, deckY + 2], [cx + k * 56, rimY - 8], HULL[3]);
  // (the deck: a flat disc on top, from a little above)
  g.save(); g.beginPath(); g.ellipse((dl + dr) / 2, deckY - 14, (dr - dl) / 2 + 2, 15, 0, 0, Math.PI * 2); g.clip();
  box(g, dl - 4, deckY - 30, dr - dl + 8, 34, HULL[5]); box(g, dl - 4, deckY - 30, dr - dl + 8, 10, HULL[4]); checker(g, dl - 4, deckY - 20, dr - dl + 8, 2, HULL[4]);
  for (let k = 0; k < 3; k++) { g.strokeStyle = HULL[4]; g.lineWidth = 1; g.beginPath(); g.ellipse((dl + dr) / 2, deckY - 14, 60 + k * 70, 4 + k * 4, 0, 0, Math.PI * 2); g.stroke(); }
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.ellipse((dl + dr) / 2, deckY - 14, (dr - dl) / 2 + 2, 15, 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
  box(g, dl, deckY - 1, dr - dl, 2, HULL[7]); box(g, dl + 4, deckY + 1, dr - dl - 8, 1, HULL[6]);
  // (plates torn back, the guts showing: wires, a blown panel; ZRB-2 on the hull, theirs)
  const tx = cx + 100, ty = deckY + 6;
  box(g, tx - 1, ty - 1, 74, 26, INK); box(g, tx, ty, 72, 24, '#0B0B10'); box(g, tx, ty, 72, 3, '#1F1F28');
  for (let i = 0; i < 7; i++) { g.lineCap = 'round'; line(g, [tx + 6 + i * 9, ty + 2], [tx + 8 + i * 9 + (i % 2) * 6, ty + 14 + (i % 3) * 6], INK, 3); line(g, [tx + 6 + i * 9, ty + 2], [tx + 8 + i * 9 + (i % 2) * 6, ty + 14 + (i % 3) * 6], ['#EF4444', '#22C55E', '#3B82F6', '#FDE047'][i % 4], 2); g.lineCap = 'butt'; }
  inked(g, [[tx - 2, ty], [tx + 30, ty - 34], [tx + 46, ty - 30], [tx + 26, ty]], HULL[4]);
  poly(g, [[tx + 2, ty - 1], [tx + 30, ty - 31], [tx + 36, ty - 30], [tx + 12, ty - 1]], HULL[6]);
  lettering(g, 'ZRB-2', cx + 230, rimY - 22, 'stencil', HULL[2], HULL[5]);
  // (the cabin: glass walls up from the deck to a flat chrome roof (stood on), cracked, a hole punched through; the
  // pilot still in there, slumped over the controls)
  const ca = cx - 80, cb = cx + 90, roofY = GY - 72, gl = cx - 110, gr = cx + 120;
  inked(g, [[gl, deckY - 2], [ca, roofY + 2], [cb, roofY + 2], [gr, deckY - 2]], '#1E3A5F', 1.5);
  g.save(); g.beginPath(); g.moveTo(gl, deckY - 2); g.lineTo(ca, roofY + 2); g.lineTo(cb, roofY + 2); g.lineTo(gr, deckY - 2); g.closePath(); g.clip();
  box(g, gl, roofY, gr - gl, 50, '#16304E'); box(g, gl, roofY + 30, gr - gl, 20, '#0F2238');
  g.save(); g.translate(cx + 20, deckY - 2); g.scale(0.55, 0.55);
  drawRag(g, { seed: 43 }, { sh: [-16, -62], hip: [-6, -26], gut: 1, legF: [[16, -22], [20, -2]], armF: [[22, -66], [40, -62]], armB: [[-26, -48], [-20, -30]], head: { at: [30, -74], a: 0.9, tongue: true } });
  g.restore();
  box(g, cx - 40, deckY - 22, 120, 6, '#334155'); for (let k = 0; k < 8; k++) box(g, cx - 34 + k * 14, deckY - 21, 6, 3, k % 3 ? '#0EA5E9' : '#F43F5E');
  g.fillStyle = 'rgba(147, 197, 253, 0.28)'; g.fillRect(gl, roofY, gr - gl, 52);
  poly(g, [[ca + 8, roofY + 4], [ca + 22, roofY + 4], [gl + 34, deckY - 4], [gl + 20, deckY - 4]], 'rgba(224, 242, 254, 0.45)');
  poly(g, [[cb - 30, roofY + 4], [cb - 24, roofY + 4], [gr - 30, deckY - 4], [gr - 36, deckY - 4]], 'rgba(224, 242, 254, 0.3)');
  g.restore();
  // (the hole: punched in, the cracks out from it)
  const hx = cx + 30, hy = roofY + 22;
  g.fillStyle = INK; g.beginPath(); g.ellipse(hx, hy, 15, 11, 0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#05070C'; g.beginPath(); g.ellipse(hx, hy, 13, 9, 0.3, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.2, r0 = 13, r1 = 22 + (i % 3) * 12; line(g, [hx + Math.cos(a) * r0, hy + Math.sin(a) * r0 * 0.7], [hx + Math.cos(a) * r1, hy + Math.sin(a) * r1 * 0.7], '#E0F2FE'); }
  // (the roof: a chrome plate from a little above, its lit lip; the antenna off it, bent)
  g.save(); g.beginPath(); g.ellipse((ca + cb) / 2, roofY - 6, (cb - ca) / 2 + 4, 7, 0, 0, Math.PI * 2); g.clip();
  box(g, ca - 6, roofY - 14, cb - ca + 12, 16, CHROME[4]); box(g, ca - 6, roofY - 14, cb - ca + 12, 5, CHROME[3]); checker(g, ca - 6, roofY - 9, cb - ca + 12, 2, CHROME[3]);
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.ellipse((ca + cb) / 2, roofY - 6, (cb - ca) / 2 + 4, 7, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  box(g, ca - 3, roofY - 1, cb - ca + 6, 2, CHROME[6]); box(g, ca - 1, roofY + 1, cb - ca + 2, 2, CHROME[2]);
  g.lineCap = 'round'; line(g, [cx - 30, roofY - 10], [cx - 34, roofY - 40], INK, 4); line(g, [cx - 34, roofY - 40], [cx - 54, roofY - 52], INK, 4); line(g, [cx - 30, roofY - 10], [cx - 34, roofY - 40], CHROME[4], 2); line(g, [cx - 34, roofY - 40], [cx - 54, roofY - 52], CHROME[4], 2); g.lineCap = 'butt';
  orb(g, cx - 56, roofY - 54, 4, ['#7F1D1D', '#B91C1C', '#EF4444', '#FCA5A5']);
  // (the hatch underneath hanging open, one of them hanging out of it upside down)
  const hx2 = cx - 170, hy2 = rimY + 8;
  box(g, hx2 - 1, hy2 - 1, 62, 32, INK); box(g, hx2, hy2, 60, 30, '#09090B'); box(g, hx2 + 2, hy2 + 2, 56, 3, '#27272A');
  inked(g, [[hx2, hy2 + 30], [hx2 - 18, hy2 + 52], [hx2 + 42, hy2 + 52], [hx2 + 60, hy2 + 30]], HULL[2]);
  g.save(); g.translate(hx2 + 30, hy2 - 10); g.scale(0.8, 0.8);
  drawRag(g, { seed: 41, gun: true }, { sh: [2, 96], hip: [0, 52], gut: 1, armB: [[-12, 110], [-16, 136]], armF: [[14, 112], [18, 138]], head: { at: [4, 116], a: Math.PI, flip: true, tongue: true } });
  g.fillStyle = ALIEN.slime; g.fillRect(16, 146, 2, 8); g.fillRect(4, 132, 2, 10);
  g.restore();
  // (the dirt banked up against it where it plowed in, over its buried belly; clods; under the rim, a pair of feet)
  const bank = (x: number, w: number, h: number) => {
    inked(g, [[x - w / 2, floor + 4], [x - w * 0.3, floor - h], [x + w * 0.1, floor - h - 4], [x + w * 0.4, floor - h * 0.6], [x + w / 2, floor + 4]], DIRT[3]);
    poly(g, [[x - w * 0.3 + 2, floor - h + 2], [x + w * 0.1, floor - h - 2], [x + w * 0.2, floor - h * 0.8], [x - w * 0.2, floor - h * 0.6]], DIRT[5]);
    checker(g, x - w * 0.4, floor - h * 0.5, w * 0.8, h * 0.5, DIRT[2]);
    for (let i = 0; i < 7; i++) { box(g, x - w / 2 + 6 + i * (w / 7), floor - 3 - (i % 3) * 2, 5, 3, DIRT[i % 2 ? 4 : 2]); box(g, x - w / 2 + 6 + i * (w / 7), floor - 3 - (i % 3) * 2, 5, 1, DIRT[6]); }
  };
  bank(cx - 280, 150, 30); bank(cx + 70, 120, 10); bank(cx + 300, 110, 22);
  for (const fx of [cx + 196, cx + 218]) { inked(g, [[fx, floor - 16], [fx + 9, floor - 16], [fx + 9, floor], [fx, floor]], ALIEN.hide[5]); box(g, fx + 1, floor - 15, 3, 14, ALIEN.hide[6]); for (let t = 0; t < 3; t++) box(g, fx + t * 3, floor - 19, 2, 3, ALIEN.claw[1]); }
  slimePool(g, cx + 208, floor, 44);
};

/** Fire licking up off a line from x - w/2 to x + w/2 at y (live): tongues in steps, inked, embers going up. */
export const fireAt = (c: Ctx, x: number, y: number, w: number, f: number) => {
  const n = Math.max(3, Math.round(w / 8));
  steppedGlow(c, x, y - 8, w * 0.9, '#F97316', 0.14, 0.03, 3);
  for (let i = 0; i < n; i++) {
    const fx = Math.round(x - w / 2 + (i + 0.5) * (w / n)), h = Math.round((10 + 14 * Math.abs(Math.sin(f * 0.23 + i * 1.7)) + (i % 2 ? 6 : 0)) / 2) * 2;
    box(c, fx - 5, y - h - 1, 10, h + 2, INK);
    box(c, fx - 4, y - h, 8, h, i % 2 ? '#B91C1C' : '#DC2626');
    box(c, fx - 3, y - h + 2, 6, h - 2, '#F97316');
    box(c, fx - 2, y - Math.round(h * 0.6), 4, Math.round(h * 0.6), '#FBBF24');
    box(c, fx - 1, y - Math.round(h * 0.3), 2, Math.round(h * 0.3), '#FEF3C7');
    box(c, fx - 4, y - h, 2, 2, '#FB923C');
  }
  for (let i = 0; i < 4; i++) { const k = ((f * 0.8 + i * 23) % 60) / 60; box(c, Math.round(x - w / 2 + hash(i * 3.7) * w + Math.sin(k * 6 + i) * 6), Math.round(y - 20 - k * 60), 2, 2, k < 0.5 ? '#FDE047' : '#F97316'); }
};

/** The smoke going up off the wreck and the burning chunk (live: puffs rising, swelling, thinning; each puff stamped). */
const drawSmoke = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const [sx, sy, n] of [[WRECK_X + 120, GY - 40, 14], [CHUNK_X, GY - 40, 8]] as const) {
    if (!shown(state, sx - 300, sx + 420)) continue;
    for (let i = 0; i < n; i++) {
      const k = ((f * 0.6 + i * (500 / n)) % 500) / 500;
      const x = Math.round(sx + Math.sin(k * 6 + i) * 20 + k * 120), y = Math.round(sy - k * 520), r = Math.max(8, Math.round((10 + k * 46) / 4) * 4);
      const tone = Math.min(4, Math.floor(k * 5));
      c.save(); c.translate(x, y); stamp(c, `xc-puff-${r}-${tone}`, -r - 4, -r - 4, r * 2 + 8, r * 2 + 8, g => paintPuff(g, r, tone)); c.restore();
    }
  }
};
const paintPuff = (g: Ctx, r: number, tone: number) => {
  const a = [0.62, 0.5, 0.38, 0.26, 0.14][tone], v = 58 + tone * 14;
  const col = (dv: number, k: number) => `rgba(${v + dv}, ${v + dv - 2}, ${v + dv - 6}, ${(a * k).toFixed(3)})`;
  pixelBlob(g, 2, 3, r, r * 0.82, col(-14, 1));
  pixelBlob(g, 0, 0, r * 0.92, r * 0.76, col(0, 0.9));
  pixelBlob(g, -r * 0.28, -r * 0.3, r * 0.5, r * 0.4, col(26, 0.8));
};

// ---------------------------------------------------------------------------------------------------------------
// The dead, strewn about the site (thinning further out)

const CORPSES: [number, CorpseKind, number][] = [
  [D + 420, 'flat', 3], [D + 640, 'halves', 7], [D + 1060, 'splat', 12], [D + 1250, 'impaled', 5], [D + 1820, 'heap', 9],
  [D + 2060, 'seat', 14], [D + 2420, 'headfirst', 21], [D + 2740, 'flat', 18], [D + 3290, 'wrapped', 26], [D + 3820, 'splat', 30],
  [D + 4020, 'halves', 33], [D + 4720, 'headfirst', 38],
];
const drawCorpses = (c: Ctx, state: GameState) => {
  for (const [x, kind, seed] of CORPSES) {
    if (!shown(state, x - 160, x + 160)) continue;
    c.save(); c.translate(x, floorAt(x)); drawCorpse(c, kind, seed); c.restore();
    // (the seat's still smoking: a thin wisp up off it)
    if (kind === 'seat') for (let i = 0; i < 4; i++) {
      const k = ((state.frame * 0.5 + i * 30) % 120) / 120, sx = Math.round(x - 20 + Math.sin(k * 5 + i) * 6 + k * 18), sy = Math.round(floorAt(x) - 90 - k * 90), r = Math.round((4 + k * 10) / 2) * 2 + 4;
      c.save(); c.translate(sx, sy); stamp(c, `xc-puff-${r}-${k < 0.5 ? 3 : 4}`, -r - 4, -r - 4, r * 2 + 8, r * 2 + 8, g => paintPuff(g, r, k < 0.5 ? 3 : 4)); c.restore();
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The park's things at the play plane: the churro cart (crushed, one of them under it), the monorail pylon (toppled:
// stand on its beam), the burning chunk of hull, the lamps, the plaza's sign

const drawProps = (c: Ctx, state: GameState) => {
  const f = state.frame;
  if (shown(state, CART.x - 70, CART.x + CART.w + 70)) stamp(c, 'xc-cart', CART.x - 50, GY - CART.h - 74, CART.w + 110, CART.h + 78, paintCart);
  if (shown(state, PYLON.x - 120, PYLON.x + PYLON.w + 120)) stamp(c, 'xc-pylon', PYLON.x - 80, PYLON.y - 64, PYLON.w + 170, GY - PYLON.y + 68, paintPylon);
  if (shown(state, CHUNK_X - 140, CHUNK_X + 140)) {
    stamp(c, 'xc-chunk', CHUNK_X - 92, GY - 70, 184, 74, paintChunk);
    fireAt(c, CHUNK_X - 6, GY - 54, 70, f);
  }
  if (shown(state, D + 220, D + 460)) stamp(c, 'xc-plazasign', D + 220, GY - 172, 220, 176, paintPlazaSign);
  for (const lx of SITE_LAMPS) if (shown(state, lx - 60, lx + 60)) {
    stamp(c, `xc-lamp-${lx}`, lx - 30, GY - 186, 60, 190, g => paintLamp(g, lx));
    const k = lampGlow();
    if (k > 0.05) steppedGlow(c, lx, GY - 158, 30, '#FDE7F3', 0.35 * k, 0.04 * k, 4);
  }
};

const paintCart = (g: Ctx) => {
  const x = CART.x, w = CART.w, top = GY - CART.h + 6, r = x + w;
  // (the box: pink fiberglass, stepped across, a teal skirt, the stencil; its lit lip (stand on it))
  box(g, x - 1, top - 1, w + 2, GY - top + 1, INK);
  box(g, x, top, w, GY - top, PINK[3]); box(g, x, top, 4, GY - top, PINK[4]); box(g, r - 6, top, 6, GY - top, PINK[2]); checker(g, r - 8, top, 2, GY - top, PINK[2]);
  box(g, x, top + 14, w, 10, TEAL[3]); box(g, x, top + 14, w, 2, TEAL[5]); box(g, x, top + 22, w, 2, TEAL[1]);
  box(g, x, GY - 8, w, 8, PINK[1]); checker(g, x, GY - 10, w, 2, PINK[1]);
  // (a dent where it came down on it)
  poly(g, [[x + 30, top], [x + 46, top + 10], [x + 62, top]], PINK[1]); line(g, [x + 30, top], [x + 46, top + 10], INK); line(g, [x + 46, top + 10], [x + 62, top], PINK[5]);
  lettering(g, 'COSMIC', x + w / 2, top + 31, 'small', '#FFFFFF', PINK[3]); lettering(g, 'CHURROS', x + w / 2, top + 41, 'small', '#FFFFFF', PINK[3]);
  box(g, x, top, w, 2, PINK[6]); box(g, x, top + 2, w, 1, PINK[5]);
  // (its wheels)
  for (const wx of [x + 18, r - 18]) orb(g, wx, GY - 3, 6, CHROME);
  // (the umbrella, snapped, hanging off it)
  g.lineCap = 'round'; line(g, [x + 70, top], [x + 96, top - 44], INK, 5); line(g, [x + 70, top], [x + 96, top - 44], CHROME[4], 3); g.lineCap = 'butt';
  inked(g, [[x + 80, top - 64], [x + 136, top - 30], [x + 104, top - 10]], TEAL[3]);
  poly(g, [[x + 84, top - 60], [x + 130, top - 31], [x + 118, top - 26]], TEAL[5]);
  poly(g, [[x + 104, top - 12], [x + 132, top - 29], [x + 118, top - 22]], TEAL[1]);
  // (churros everywhere)
  for (let i = 0; i < 7; i++) {
    const cx = x - 32 + i * 24, cy = GY - 4 - (i % 2) * 3, a = (i % 3 - 1) * 0.3;
    g.save(); g.translate(cx, cy); g.rotate(a);
    box(g, -8, -3, 16, 5, INK); box(g, -7, -2, 14, 3, '#B45309'); box(g, -7, -2, 14, 1, '#F59E0B');
    for (let k = -6; k < 6; k += 3) box(g, k, -2, 1, 3, '#78350F');
    g.restore();
  }
  // (one of them under it: an arm and the gun sticking out, the slime)
  slimePool(g, x - 12, GY, 46);
  g.lineCap = 'round'; line(g, [x + 4, GY - 6], [x - 24, GY - 4], INK, 11); line(g, [x + 4, GY - 6], [x - 24, GY - 4], ALIEN.hide[5], 9); line(g, [x + 2, GY - 8], [x - 22, GY - 6], ALIEN.hide[6], 2); g.lineCap = 'butt';
  g.fillStyle = INK; g.beginPath(); g.ellipse(x - 28, GY - 5, 8, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = ALIEN.hide[5]; g.beginPath(); g.ellipse(x - 28, GY - 5, 7, 5, 0, 0, Math.PI * 2); g.fill();
  box(g, x - 46, GY - 15, 26, 6, INK); box(g, x - 45, GY - 14, 24, 4, ALIEN.steel[3]); box(g, x - 45, GY - 14, 24, 1, ALIEN.steel[5]); box(g, x - 47, GY - 13, 3, 2, ALIEN.laser[3]);
};

const paintPylon = (g: Ctx) => {
  // (the monorail pylon, knocked over by the crash: its column lying across the walk, the beam on top of it bent; the
  // beam's flat top is what's stood on)
  const { x, y, w } = PYLON, r = x + w;
  // (the column, fallen: a fat chrome cylinder in bands along it)
  inked(g, [[x - 50, GY], [x + 30, y + 16], [x + 54, y + 16], [x - 20, GY]], CHROME[3], 1.5);
  poly(g, [[x - 48, GY - 1], [x + 31, y + 17], [x + 38, y + 17], [x - 40, GY - 1]], CHROME[5]);
  poly(g, [[x - 28, GY - 1], [x + 48, y + 17], [x + 53, y + 17], [x - 21, GY - 1]], CHROME[2]);
  for (let k = 1; k < 5; k++) { const u = k / 5; line(g, [x - 50 + 80 * u, GY - (GY - y - 16) * u], [x - 20 + 74 * u, GY - (GY - y - 16) * u], CHROME[1]); }
  // (its broken base, rebar sticking out)
  for (let k = 0; k < 4; k++) line(g, [x - 40 + k * 6, GY - 2], [x - 52 + k * 5, GY - 14 - (k % 2) * 6], '#78716C', 2);
  // (the beam: concrete, a pink stripe, the rail on top; its lit lip)
  box(g, x - 1, y - 1, w + 2, 20, INK);
  box(g, x, y, w, 18, CHROME[3]); box(g, x, y + 12, w, 6, CHROME[2]); checker(g, x, y + 10, w, 2, CHROME[2]);
  box(g, x + 4, y + 7, w - 8, 3, PINK[3]); box(g, x + 4, y + 7, w - 8, 1, PINK[5]);
  for (let i = 0; i < 6; i++) box(g, x + 20 + i * 56, y + 13, 30, 2, CHROME[1]);
  box(g, x, y, w, 2, CHROME[6]); box(g, x, y + 2, w, 1, CHROME[5]);
  // (the column at its far end still up: holding it)
  box(g, r - 31, y + 18, 22, GY - y - 18, INK); box(g, r - 30, y + 18, 20, GY - y - 18, CHROME[3]); box(g, r - 30, y + 18, 6, GY - y - 18, CHROME[5]); box(g, r - 14, y + 18, 4, GY - y - 18, CHROME[1]);
  for (let k = y + 30; k < GY - 6; k += 22) box(g, r - 30, k, 20, 1, CHROME[2]);
  // (a monorail car's nose, crumpled, poking in from the end)
  g.save(); g.translate(r + 36, y - 10); g.rotate(-0.4);
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, 0, 48, 30, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.ellipse(0, 0, 47, 29, 0, 0, Math.PI * 2); g.clip();
  box(g, -50, -30, 100, 60, '#E2E8F0'); box(g, -50, -30, 100, 14, '#F8FAFC'); box(g, -50, 12, 100, 20, '#94A3B8'); checker(g, -50, 10, 100, 2, '#94A3B8');
  box(g, -30, -18, 40, 12, TEAL[2]); box(g, -30, -18, 40, 2, TEAL[5]); line(g, [-24, -18], [-14, -6], TEAL[6]);
  box(g, -50, 2, 100, 5, PINK[3]); box(g, -50, 2, 100, 1, PINK[5]);
  line(g, [-6, -28], [10, 0], '#64748B', 2); line(g, [10, 0], [2, 28], '#64748B', 2);
  g.restore(); g.restore();
};

const paintChunk = (g: Ctx) => {
  chunkPath(g); g.fillStyle = HULL[3]; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
  g.save(); chunkPath(g); g.clip();
  box(g, CHUNK_X - 90, GY - 70, 180, 14, HULL[5]); box(g, CHUNK_X - 90, GY - 56, 180, 10, HULL[4]); checker(g, CHUNK_X - 90, GY - 48, 180, 2, HULL[4]);
  box(g, CHUNK_X - 90, GY - 18, 180, 20, HULL[2]); checker(g, CHUNK_X - 90, GY - 20, 180, 2, HULL[2]);
  for (let i = 0; i < 3; i++) { box(g, CHUNK_X - 50 + i * 36, GY - 34, 12, 6, INK); box(g, CHUNK_X - 49 + i * 36, GY - 33, 10, 4, i === 1 ? '#A16207' : '#3F3F46'); }
  box(g, CHUNK_X - 90, GY - 60, 180, 1, HULL[6]);
  g.restore();
  // (its torn edge, scorched)
  for (let i = 0; i < 6; i++) box(g, CHUNK_X + 44 + i * 3, GY - 60 + i * 9, 4, 6, i % 2 ? SCORCH[1] : SCORCH[2]);
};

const paintPlazaSign = (g: Ctx) => {
  // (a googie sign: a boomerang board on a chrome pole, a starburst on top)
  const x = D + 300;
  post(g, x, GY - 104, GY, 6);
  inked(g, [[D + 236, GY - 150], [D + 432, GY - 160], [D + 424, GY - 100], [D + 244, GY - 96]], '#1E1B4B', 1.5);
  poly(g, [[D + 238, GY - 149], [D + 430, GY - 159], [D + 429, GY - 154], [D + 238, GY - 144]], '#3730A3');
  poly(g, [[D + 245, GY - 100], [D + 423, GY - 104], [D + 424, GY - 100], [D + 244, GY - 97]], '#0C0A26');
  lettering(g, 'TOMORROW PLAZA', D + 334, GY - 133, 'neon', PINK[4], '#1E1B4B');
  lettering(g, 'PICNIC AREA', D + 334, GY - 113, 'enamel', '#A5B4FC', '#1E1B4B');
  const sx = D + 420, sy = GY - 164;
  for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4, l = k % 2 ? 7 : 12; line(g, [sx, sy], [sx + Math.cos(a) * l, sy + Math.sin(a) * l], INK, 3); line(g, [sx, sy], [sx + Math.cos(a) * l, sy + Math.sin(a) * l], HAZ[5], 1); }
  orb(g, sx, sy, 3, HAZ);
};
const paintLamp = (g: Ctx, lx: number) => {
  post(g, lx, GY - 150, GY, 5);
  box(g, lx - 6, GY - 40, 12, 4, INK); box(g, lx - 5, GY - 39, 10, 2, PINK[3]);
  // (a pink saucer shade, the bulb, a little starburst on top)
  g.fillStyle = INK; g.beginPath(); g.ellipse(lx, GY - 154, 18, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = PINK[2]; g.beginPath(); g.ellipse(lx, GY - 154, 17, 7, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = PINK[4]; g.beginPath(); g.ellipse(lx, GY - 156, 17, 5, 0, Math.PI, 0); g.fill();
  box(g, lx - 12, GY - 159, 8, 2, PINK[6]);
  box(g, lx - 5, GY - 148, 10, 5, '#FEF3C7'); box(g, lx - 3, GY - 148, 4, 2, '#FFFFFF');
  orb(g, lx, GY - 168, 5, TEAL);
  line(g, [lx, GY - 174], [lx, GY - 182], CHROME[4], 1);
};

// ---------------------------------------------------------------------------------------------------------------
// XENOSCARE's front: the fiberglass hull of a crashed derelict (ribbed, bone-gray, LEGALLY DISTINCT), stenciled M.S.
// COINCIDENCE; its boarding hatch with the ramp down (the runners go in there); a cheap green up on it waving; the neon
// name; the height sign. The queue's way in is at its end.

export const drawFacade = (c: Ctx, state: GameState) => {
  if (!shown(state, BL - 260, HOUSE_DOOR + 100)) return;
  const cx = MOUTH_X;
  stamp(c, 'xc-facade', BL - 170, GY - 600, HOUSE_DOOR - BL + 190, 604, paintFacade);
  const f = state.frame;
  drawCheapGreen(c, cx + 150, GY - 420, f, 0.9, 'wave');
  // (the fog machine's fog rolling down the ramp: drifting puffs, blacklight purple)
  for (let i = 0; i < 4; i++) {
    const k = ((f * 0.4 + i * 40) % 160) / 160, fx = Math.round(cx - 40 + i * 26 + k * 50), fy = GY - 10 - Math.round(Math.sin(k * Math.PI) * 4);
    c.save(); c.translate(fx, fy); stamp(c, `xc-fog-${i % 2}`, -60, -16, 120, 30, g => { pixelBlob(g, 0, 0, 56 - (i % 2) * 14, 10, 'rgba(167, 139, 250, 0.22)'); pixelBlob(g, -8, -3, 30, 5, 'rgba(221, 214, 254, 0.2)'); }); c.restore();
  }
  // (the neon over it, live: the letters stepping on, one tube dead, flickering; the park's neon, twice the size, each
  // letter's tube stamped lit and dark)
  const word = 'XENOSCARE!', n = word.length, on = Math.floor(f / 6) % (n + 12), S = 2;
  const adv = [...word].map(ch => letterSize(ch, 'neon')[0] - 6);
  const tw = (adv.reduce((a, b) => a + b, 0) - 2) * S, sx = Math.round(cx - tw / 2), sy = GY - 394;
  panel(c, sx - 18, sy - 22, tw + 36, 44, '#2A0F48', true);
  box(c, sx - 14, sy - 18, tw + 28, 36, '#0F0420');
  let lx = sx;
  for (let i = 0; i < n; i++) {
    const lit = i <= on && !(i === 4 && f % 50 < 8), ch = word[i], [cw] = letterSize(ch, 'neon'), col = i % 2 ? PINK[4] : '#4ADE80';
    c.save(); c.translate(lx + (cw / 2 - 3) * S, sy); c.scale(S, S);
    stamp(c, `xc-neon-${i}-${lit ? 1 : 0}`, -cw / 2 - 4, -14, cw + 8, 28, g => lettering(g, ch, 0, 0, 'neon', lit ? col : '#3F3F46', '#0F0420', lit));
    c.restore();
    lx += adv[i] * S;
  }
};

const paintFacade = (g: Ctx) => {
  const cx = MOUTH_X, bl = BL;
  // (the fake rock berm it juts out of: fiberglass boulders, painted)
  const ROCK = ['#1E1A1C', '#342E30', '#4C4446', '#665C5C', '#827674', '#A0948E'];
  for (let i = 0; i < 9; i++) {
    const rx = bl - 50 + i * 52 + (i % 2) * 10, rr = 26 + (i % 3) * 8;
    pixelBlob(g, rx, GY - rr * 0.4, rr + 2, rr * 0.7 + 2, INK); pixelBlob(g, rx, GY - rr * 0.4, rr, rr * 0.7, ROCK[2]); pixelBlob(g, rx - rr * 0.25, GY - rr * 0.6, rr * 0.6, rr * 0.4, ROCK[3]); pixelBlob(g, rx - rr * 0.4, GY - rr * 0.7, rr * 0.25, rr * 0.16, ROCK[5]);
  }
  // (the hull: a great curved fiberglass shell, in bands across (lit from the left), the grime up from its foot)
  hullPath(g); g.fillStyle = INK; g.fill();
  g.save(); hullPath(g); g.clip();
  const span = HOUSE_DOOR + 20 - (bl - 40), cols = [BONE[6], BONE[5], BONE[5], BONE[4], BONE[4], BONE[3], BONE[3], BONE[2]];
  cols.forEach((col, i) => box(g, bl - 40 + (span * i) / cols.length, GY - 460, span / cols.length + 1, 460, col));
  cols.forEach((col, i) => { if (i) checker(g, bl - 40 + (span * i) / cols.length - 2, GY - 460, 4, 460, col); });
  // (its foot grimy)
  box(g, bl - 40, GY - 50, span, 50, BONE[2]); checker(g, bl - 40, GY - 64, span, 14, BONE[2]); checker(g, bl - 40, GY - 20, span, 20, BONE[1]);
  // (the ribs: curved bands over it, stepped, darker between)
  for (let i = 0; i < 9; i++) {
    const rx = bl + 10 + i * 40, tx = rx + 60, ty = GY - 380 - (i % 3) * 10;
    const rib = (dx: number, col: string, lw: number) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(rx + dx, GY); g.quadraticCurveTo(rx + 10 + dx, GY - 260 - i * 10, tx + dx, ty); g.stroke(); };
    rib(3, BONE[1], 10); rib(0, INK, 9); rib(0, i < 4 ? BONE[4] : BONE[3], 7); rib(-2, i < 4 ? BONE[6] : BONE[5], 2); rib(2, BONE[2], 1);
  }
  g.restore();
  hullPath(g); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  // (its rim, lit along the top-left curve)
  g.save(); hullPath(g); g.clip(); g.strokeStyle = BONE[7]; g.lineWidth = 3; g.beginPath(); g.moveTo(bl - 36, GY - 60); g.quadraticCurveTo(bl - 26, GY - 396, cx + 40, GY - 436); g.stroke(); g.restore();
  // (the fiberglass's seams, a patch of the cheap: gaffer tape over a crack, a speaker bolted on in plain sight)
  box(g, cx + 60, GY - 300, 2, 180, BONE[2]); box(g, cx + 62, GY - 300, 1, 180, BONE[5]);
  g.save(); g.translate(cx + 120, GY - 244); g.rotate(-0.5);
  box(g, -24, -5, 48, 10, INK); box(g, -23, -4, 46, 8, '#A1A1AA'); box(g, -23, -4, 46, 2, '#D4D4D8'); for (let k = -20; k < 22; k += 6) box(g, k, -4, 1, 8, '#71717A');
  g.restore();
  g.save(); g.translate(cx + 120, GY - 244); g.rotate(0.6);
  box(g, -20, -5, 40, 10, INK); box(g, -19, -4, 38, 8, '#A1A1AA'); box(g, -19, -4, 38, 2, '#D4D4D8');
  g.restore();
  panel(g, bl + 28, GY - 302, 28, 36, '#27272A', false);
  orb(g, bl + 42, GY - 288, 9, ['#09090B', '#18181B', '#27272A', '#3F3F46', '#52525B']); orb(g, bl + 42, GY - 288, 3, ['#18181B', '#3F3F46', '#71717A']);
  box(g, bl + 40, GY - 270, 4, 2, '#52525B'); line(g, [bl + 42, GY - 266], [bl + 50, GY - 200], INK);
  // (portholes, one lit green)
  for (let i = 0; i < 3; i++) {
    const px = cx - 90 + i * 70, py = GY - 312 + i * 12;
    orb(g, px, py, 17, BONE.slice(2));
    const glass = i === 1 ? ['#052E16', '#14532D', '#16A34A', '#4ADE80', '#BBF7D0'] : ['#09090B', '#0C0A09', '#1C1917', '#292524', '#57534E'];
    orb(g, px, py, 12, glass);
    if (i === 1) { box(g, px - 6, py - 2, 3, 6, '#14532D'); box(g, px - 2, py - 7, 4, 3, '#14532D'); }
  }
  // (the stencil, weathered)
  lettering(g, 'M.S. COINCIDENCE', cx - 20, GY - 256, 'stencil2', BONE[1], BONE[4]);
  checker(g, cx - 96, GY - 262, 30, 14, BONE[4], 1);
  // (the boarding hatch: a dark oval, its rim stepped, the dark in there, the ramp down out of it, its rails)
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, GY - 110, 66, 102, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BONE[2]; g.beginPath(); g.ellipse(cx, GY - 110, 64, 100, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = BONE[4]; g.beginPath(); g.ellipse(cx - 2, GY - 112, 61, 97, 0, Math.PI * 0.6, Math.PI * 1.5); g.fill();
  g.fillStyle = INK; g.beginPath(); g.ellipse(cx, GY - 108, 58, 92, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.ellipse(cx, GY - 108, 57, 91, 0, 0, Math.PI * 2); g.clip();
  const insides = ['#0A0510', '#110A1C', '#180F28', '#1F1434', '#2A1A46'];
  insides.forEach((col, i) => box(g, cx - 60, GY - 200 + i * 38, 120, 40, col));
  insides.forEach((col, i) => { if (i) checker(g, cx - 60, GY - 200 + i * 38 - 2, 120, 2, col); });
  // (a corridor in there, going back: its ribs, a dim green light at the end)
  for (let k = 0; k < 4; k++) { const s = 1 - k * 0.2; g.strokeStyle = BONE[1]; g.lineWidth = 3 * s; g.beginPath(); g.ellipse(cx + 4, GY - 100, 50 * s, 80 * s, 0, 0, Math.PI * 2); g.stroke(); }
  box(g, cx - 2, GY - 112, 12, 16, '#14532D'); box(g, cx, GY - 110, 8, 12, '#22C55E');
  g.restore();
  // (the ramp, hazard stripes along its treads, its rails)
  inked(g, [[cx - 54, GY - 40], [cx + 54, GY - 40], [cx + 84, GY], [cx - 84, GY]], STEEL[3]);
  for (let i = 0; i < 4; i++) {
    const y = GY - 36 + i * 10, hw = 56 + i * 7;
    for (let x = cx - hw; x < cx + hw; x += 8) box(g, x, y, 8, 3, Math.floor((x - cx + 400) / 8) % 2 ? HAZ[4] : INK);
    box(g, cx - hw, y + 3, hw * 2, 1, STEEL[5]);
  }
  for (const s of [-1, 1]) { line(g, [cx + s * 56, GY - 70], [cx + s * 88, GY - 26], INK, 4); line(g, [cx + s * 56, GY - 70], [cx + s * 88, GY - 26], CHROME[4], 2); post(g, cx + s * 88, GY - 26, GY, 3); }
  // (the sign under the name: LEGALLY DISTINCT)
  panel(g, cx - 122, GY - 372, 244, 26, '#18181B');
  lettering(g, 'A LEGALLY DISTINCT DERELICT', cx, GY - 359, 'enamel', HAZ[5], '#18181B');
  // (the height sign: YOU MUST BE THIS TALL TO BE ABDUCTED)
  const hx = bl - 100;
  post(g, hx, GY - 112, GY, 5);
  panel(g, hx - 52, GY - 172, 104, 66, HAZ[4]);
  for (const [s, y] of [['YOU MUST BE', -152], ['THIS TALL', -140], ['TO BE', -128], ['ABDUCTED', -116]] as const) lettering(g, s, hx, GY + y - 3, 'small', INK, HAZ[4]);
  g.lineCap = 'round'; line(g, [hx + 2, GY - 100], [hx + 56, GY - 100], INK, 6); line(g, [hx + 2, GY - 100], [hx + 56, GY - 100], CHROME[4], 4); line(g, [hx + 2, GY - 101], [hx + 56, GY - 101], CHROME[6], 1); g.lineCap = 'butt';
  // (a little green hand at the end of the arm, pointing down at your head)
  orb(g, hx + 58, GY - 100, 5, ['#14532D', '#16A34A', '#4ADE80', '#86EFAC']);
};

// ---------------------------------------------------------------------------------------------------------------
// The lot, in order

/** The impact site, behind him (world). */
export const drawSiteBack = (c: Ctx, state: GameState) => {
  const v = viewOf(state);
  if (v.v0 > HOUSE_DOOR + 60) return;
  drawGroundBack(c, v);
  drawGroundNear(c, v);
  drawGoingBack(c, v);
  drawSmoke(c, state);
  drawProps(c, state);
  drawWreck(c, state);
  drawCorpses(c, state);
  drawFacade(c, state);
};

/** In front of him: the queue's way in (the building's corner: a lintel over him with its sign, a jamb either side). */
export const drawSiteFront = (c: Ctx, state: GameState) => {
  if (!shown(state, HOUSE_DOOR - 200, HOUSE_DOOR + 100)) return;
  const x = HOUSE_DOOR;
  stamp(c, 'xc-queuedoor', x - 14, CEIL - 134, 48, GY - CEIL + 138, g => {
    // (the lintel: the building's corner over him, steel, hazard-striped along its foot)
    box(g, x - 11, CEIL - 131, 42, GY - 160 - CEIL + 131, INK);
    box(g, x - 10, CEIL - 130, 40, GY - 160 - CEIL + 130, STEEL[3]); box(g, x - 10, CEIL - 130, 4, GY - 160 - CEIL + 130, STEEL[5]); box(g, x + 26, CEIL - 130, 4, GY - 160 - CEIL + 130, STEEL[1]);
    for (let y = CEIL - 120; y < GY - 170; y += 60) { box(g, x - 6, y, 32, 1, STEEL[1]); box(g, x - 6, y + 1, 32, 1, STEEL[5]); }
    for (let k = 0; k < 5; k++) box(g, x - 10 + k * 8, GY - 170, 8, 10, k % 2 ? HAZ[4] : INK);
    // (the jambs)
    for (const jx of [x - 10, x + 22]) { box(g, jx - 1, GY - 160, 10, 160, INK); box(g, jx, GY - 160, 8, 160, STEEL[4]); box(g, jx, GY - 160, 2, 160, STEEL[6]); box(g, jx + 6, GY - 160, 2, 160, STEEL[2]); }
  });
  // (its board, screwed to the lintel's face: enamel)
  stamp(c, 'xc-queueboard', x - 40, GY - 200, 100, 34, g => {
    const [tw] = letterSize('QUEUE', 'enamel'), w = tw + 16;
    panel(g, Math.round(x + 10 - w / 2), GY - 196, w, 24, '#1E1B4B');
    lettering(g, 'QUEUE', x + 10, GY - 184, 'enamel', HAZ[5], '#1E1B4B');
  });
};
