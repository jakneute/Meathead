// The water park's level 1, drawn (a crude first pass: readable boxes and strokes, the SNES pass comes later). At night
// (the endgame's hour 10; 11 once the kid's dead). Florida: warm, flat, palms, pastel concrete, and MOUNT EVEREST BUT
// BETTER sticking up out of it with fake snow on.
//
// Depth, back to front (each step's own draw, in this order):
//   the backdrop (screen space): the sky; far off, Happy Land's landmarks on the horizon (their own painters, parkFar.ts)
//     and the water park's other rides; nearer, the park's giant tangled slide towers (dimmed); all drop away down the
//     screen as he climbs (the height reads).
//   drawBack (world, behind everything that moves): the plaza's back props (palms, booths, umbrellas: dimmed, nothing
//     to stand on); the pits' walls; the pools'
//     water and tiles; the slides' stairs, decks, chutes and legs; the tube rides' bottomless drop (dark bands down
//     into nothing), their legs going down into it, their chutes, the gaps' striped broken ends and GAP signs, the
//     pipes' gantries; the tower (its back wall, its floors'
//     props, its decks, its stair switchbacks outside it, its doors and gates); the summit; the descent's chute; the
//     level 2 stub. The ground's slab (lit top edge) over all of it at GY.
//   (the engine: enemies, him, the shots' particles)
//   drawFront (world, in front of him): each slide's and chute's near wall (his legs down in the water behind it), the
//     tube's front half round him, the pipes end-on, the shots.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { stamp, prestamp } from '../../../m1/game/render/stamp';
import { drawTodSky, timeOfDay, farTint, lampGlow, skyAt } from '../../timeOfDay';
import { drawTowerAt } from '../../cartoon/monument';
import { farMark, farTreeline } from '../../parkFar';
import { text, steppedGlow, mix, checker as dither, hazeBands, sideFace } from '../../intro/art/kit';
import { signText, signW, signH, rampDown, type Look } from '../../signLetters';
import { GY, GROUND, POOLS, LEDGES, ISLANDS, SLIDES, TUBES, TOWER, FLOORS, floorY, exitSide, FLOOR_NAMES, FLOOR_FT, SUMMIT, DESCENT, L2, step, tubeSpan, type Slide, type Tube, type Stairs } from './geo';
import { SLIDE_PATHS, pointAt, surfaceAt, type Path } from './slides';
import { tubePaths, tubeLap, tubeLapNo, PIPE_CLEAR, GAP_WARN } from './tube';
import { FLOOR_LEDGES, DOORS_X, ROUND, FACE } from './tower';
import { elbowFront, kneeFront } from '../../art/limb';
import { grabBusy } from '../../moves/grab';
import { drawZonesBack, groundAt, paintZoneGround, drawRideSky, drawRideDrop } from './zones';
import { TUBE_RING } from '../../../m1/game/render/player/tubePose';
import { drawFunnelBack, drawFunnelFront } from './funnel';

type Ctx = CanvasRenderingContext2D;
const INK = '#0A0806';
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// (the view as drawn: on the spiral the world's drawn into a strip wider than the screen (the turning tower's sides), all
// of which is wrapped on: culled to that, not the camera's 800)
const vis = (state: GameState, a: number, b: number, m = 80) => { const v = state.view, x0 = v && v.w > W ? v.x : state.camera.x, w = v && v.w > W ? v.w : W; return b > x0 - m && a < x0 + w + m; };
const visY = (state: GameState, a: number, b: number, m = 80) => b > state.camera.y - m && a < state.camera.y + H + m;

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen space)

/** The tube rides' bottomless drop: banded (stepped down, SNES) into black. */
const VOID = '#020308';
const FAR_W = 1600, FAR_H = 300;
/** Five steps round a color: deep, shade, body, lit, highlight. */
const ramp5 = (col: string) => [mix(col, INK, 0.55), mix(col, INK, 0.3), col, mix(col, '#FFFFFF', 0.25), mix(col, '#FFFFFF', 0.5)];
const poly = (c: Ctx, pts: [number, number][], col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); c.fill(); };
/** A stroke along a path of points (round caps and joins), `dy` down. */
const along = (g: Ctx, pts: [number, number][], dy: number, w: number, col: string, dash?: number[]) => {
  g.strokeStyle = col; g.lineWidth = w; if (dash) g.setLineDash(dash);
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y + dy) : g.moveTo(x, y + dy))); g.stroke();
  if (dash) g.setLineDash([]);
};
/** A cubic bezier's points (for its legs and its shading). */
const bez = (x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, n = 24): [number, number][] =>
  Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3] as [number, number]; });
/** A round tube along points, stepped across (SNES: shadow under, body, the lit band along its top, a glint line): `w`
 *  its width, its colors a ramp (ramp5). `rings`: its joints' bands every so far (the sections bolted together). */
const tubeAlong = (g: Ctx, pts: [number, number][], w: number, R: string[], ink: string, rings = 0) => {
  g.lineCap = 'round'; g.lineJoin = 'round';
  along(g, pts, 0, w + 3, ink);
  along(g, pts, 0, w, R[1]);
  along(g, pts, -w * 0.12, w * 0.7, R[2]);
  along(g, pts, -w * 0.26, Math.max(1.5, w * 0.28), R[3]);
  along(g, pts, -w * 0.34, Math.max(1, w * 0.1), R[4], [Math.max(2, w * 0.6), Math.max(3, w * 0.5)]);
  if (rings) along(g, pts, 0, w, R[0], [2, rings]);
  g.lineCap = 'butt'; g.lineJoin = 'miter';
};

/** The far horizon (screen space, a strip cached for the hour): the night's haze glowing low with the park's lights; Happy
 *  Land's lands' landmarks as they are now (their own painters, parkFar.ts); the water park's own further rides in
 *  steps (towers, flumes and their legs, a wave-pool's wall, a bowl ride), the hotels' lit windows; a treeline of palms
 *  along the foot, banded into the haze. Busy, but dark: it's ten at night. No volcanoes. */
/** A seamless strip: painted at x and x ± FAR_W, so it wraps every FAR_W with no jump. (It used to wrap every FAR_W - W
 *  with only one copy, so the whole far strip jumped 800 px once a long way along, or round and round a tube ride's
 *  loops: the owner's "mid distance background elements show then abruptly disappear".) */
const paintFar = (g: Ctx) => { for (const off of [-FAR_W, 0, FAR_W]) { g.save(); g.translate(off, 0); paintFarOnce(g); g.restore(); } };
const paintFarOnce = (g: Ctx) => {
  const tod = timeOfDay(), t = (col: string, k = 1) => farTint(col, k, tod);
  const foot = FAR_H - 4;
  // (the haze low down: the lights of the park on it, banded up into the sky)
  hazeBands(g, 0, foot - 120, FAR_W, 120, t('#5A3A5A', 0.5), 0, 0.32, 6);
  // (a far line of resort hotels behind it all, their windows lit here and there)
  for (let i = 0; i < 22; i++) {
    const x = i * 76 + hash(i + 200) * 30, w = 40 + hash(i + 210) * 34, h = 30 + hash(i + 220) * 46;
    const Rh = ramp5(t('#1C2238', 0.8));
    R(g, x, foot - h, w, h, Rh[1]); R(g, x, foot - h, 3, h, Rh[2]); R(g, x + w - 4, foot - h, 4, h, Rh[0]); R(g, x - 1, foot - h - 2, w + 2, 2, Rh[2]);
    for (let yy = foot - h + 5; yy < foot - 6; yy += 6) for (let xx = x + 5; xx < x + w - 5; xx += 6) if (hash(xx * 0.31 + yy * 0.7 + i) < 0.22) R(g, xx, yy, 2, 2, hash(xx + yy) < 0.7 ? t('#F6C860', 0.4) : t('#9CC8F0', 0.4));
  }
  // Happy Land on the horizon: its lands' landmarks, as they are now (dark, the odd light)
  farMark(g, 'rockies', 200, foot, 70, 0.55, tod);
  farMark(g, 'fairyCastle', 120, foot, 120, 0.45, tod);
  farMark(g, 'needle', 330, foot, 170, 0.45, tod);
  farMark(g, 'atom', 440, foot, 80, 0.45, tod);
  farMark(g, 'clockTower', 560, foot, 110, 0.45, tod);
  farMark(g, 'thrones', 700, foot, 70, 0.5, tod);
  // (Cartoon Land's water tower: painted at its far size here, not shrunk (shrunk smooth, its thin legs went see-through
  // and the tank hung in the air like a ghost in a propeller beanie): pixel for pixel, its legs down solid to its feet on
  // the horizon, washed toward the haze over its own pixels only)
  if (typeof document !== 'undefined') {
    const s = 96 / 280, cv = document.createElement('canvas'); cv.width = 70; cv.height = 106;
    const og = cv.getContext('2d')!;
    og.imageSmoothingEnabled = false;
    drawTowerAt(og, 35, 100, s, 0);
    og.globalCompositeOperation = 'source-atop'; og.globalAlpha = 0.3; og.fillStyle = skyAt(0.86, tod); og.fillRect(0, 0, cv.width, cv.height);
    g.drawImage(cv, 840 - 35, foot - 100);
  }
  farMark(g, 'showcase', 960, foot, 80, 0.5, tod);
  // (the water park's own rides, farther along: scaffold towers in steps, their flumes off them on legs, canopies)
  const FL = ['#0891B2', '#BE185D', '#CA8A04', '#16A34A', '#7C3AED'];
  for (let i = 0; i < 6; i++) {
    const x = 1060 + i * 88 + hash(i + 5) * 20, h = 60 + hash(i) * 70, Rt = ramp5(t('#2A3456', 0.7));
    R(g, x - 1, foot - h, 16, h, INK); R(g, x, foot - h, 14, h, Rt[1]); R(g, x, foot - h, 3, h, Rt[3]); R(g, x + 11, foot - h, 3, h, Rt[0]);
    for (let yy = foot - h + 8; yy < foot; yy += 12) R(g, x, yy, 14, 1, Rt[0]);
    const Rc = ramp5(t('#7A2A1A', 0.7));
    poly(g, [[x - 8, foot - h - 2], [x + 7, foot - h - 14], [x + 22, foot - h - 2]], Rc[2]); poly(g, [[x + 7, foot - h - 14], [x + 22, foot - h - 2], [x + 7, foot - h - 2]], Rc[1]);
    const pts = bez(x + 14, foot - h + 6, x + 46, foot - h, x + 62, foot - h * 0.4, x + 84, foot - 4, 16);
    for (let k = 3; k < pts.length - 1; k += 3) R(g, pts[k][0] - 1, pts[k][1] + 2, 2, foot - pts[k][1] - 2, Rt[0]);
    tubeAlong(g, pts, 5, ramp5(t(FL[i % 5], 0.6)), t(INK, 0.6));
  }
  // (the wave pool's wall and its big bowl ride, a funnel on its side)
  { const x = 1550, Rw = ramp5(t('#3A4A6A', 0.7)); R(g, x - 30, foot - 26, 80, 26, Rw[1]); R(g, x - 30, foot - 26, 80, 3, Rw[2]); for (let k = 0; k < 5; k++) R(g, x - 26 + k * 16, foot - 20, 8, 6, Rw[0]); }
  // (the treeline: palms along the foot, then the crowns' band; into the haze)
  farTreeline(g, 0, FAR_W, foot - 16, t('#16301E', 0.7), 3);
  for (let i = 0; i < 46; i++) {
    const x = hash(i + 400) * FAR_W, h = 22 + hash(i + 410) * 26, col = t('#10241A', 0.75), cl = t('#1E3A26', 0.75);
    R(g, x, foot - h, 2, h, t('#1A1410', 0.75));
    for (let k = -2; k <= 2; k++) { poly(g, [[x + 1, foot - h], [x + 1 + k * 6, foot - h + 3 + Math.abs(k) * 2], [x + 1 + k * 5, foot - h + 1]], col); R(g, x + 1 + k * 3, foot - h + 1, 2, 1, cl); }
  }
  hazeBands(g, 0, foot - 14, FAR_W, 18, t('#1A2440', 0.6), 0.1, 0.55, 4);
  // (the lights along the horizon: lamps, the odd window; a few with their stepped glow)
  for (let i = 0; i < 70; i++) {
    const x = hash(i + 3) * FAR_W, y = foot - 4 - hash(i) * 40, col = i % 3 ? '#F6C860' : '#93C5FD';
    if (i % 9 === 0) steppedGlow(g, x + 1, y + 1, 6, col, 0.25, 0.04, 3);
    R(g, x, y, 2, 2, col);
  }
};
/** The park's giant slides, nearer (the owner's: "i want the scale to feel grander with all the slides"): towers of
 *  scaffold with slides tangled round and between them, helixes, enclosed tubes, long sweeps down to their pools.
 *  Dimmed (nothing here to stand on: no lit tops). A seamless strip (everything's painted at x and x ± BIG_W).
 *  The SNES pass: the towers in steel steps (lit legs, shaded backs, braces in two tones, a stair zig-zag up the inside),
 *  their canopies' stripes stepped, every flume a round tube in its plastic's ramp (the lit band along its top, joints
 *  banded), legs down from them to the ground, the pools at their feet with lit rims and a glint; all of it hazed back,
 *  in bands, deeper toward the foot. */
const BIG_W = 1800, BIG_H = 430, BIG_TW = 300, BIG_TH = 215;
const NOBIG = import.meta.env.DEV && typeof location !== 'undefined' && location.search.includes('wpnobig');
const BIG_COLS = ['#0891B2', '#DB2777', '#CA8A04', '#16A34A', '#EA580C', '#7C3AED', '#0EA5E9', '#E11D48'];
const paintBig = (g: Ctx, x0 = -1e9, x1 = 1e9) => {
  const t = (col: string) => farTint(col, 0.42);
  const foot = BIG_H - 2;
  const towers = Array.from({ length: 8 }, (_, i) => ({ x: 90 + i * 225 + Math.round(hash(i + 40) * 60), h: 170 + Math.round(hash(i + 7) * 240), w: 30 + Math.round(hash(i + 2) * 16) }));
  const S = ramp5(t('#2A3450')), ink = t('#060810');
  /** Legs down from a flume's points to the ground, every so many points. */
  const legs = (pts: [number, number][], every: number) => { for (let k = every; k < pts.length - 1; k += every) { const [x, y] = pts[k]; if (y > foot - 8) continue; R(g, x - 2, y + 3, 4, foot - y - 3, S[0]); R(g, x - 2, y + 3, 1, foot - y - 3, S[2]); R(g, x - 5, y + 2, 10, 2, S[1]); } };
  for (const off of [-BIG_W, 0, BIG_W]) {
    g.save(); g.translate(off, 0);
    // (the pools at their feet: the deck's rim lit, the water banded, a glint)
    for (let i = 0; i < 8; i++) {
      const x = 40 + i * 225 + hash(i + 90) * 80;
      g.fillStyle = t('#8A8A84'); g.beginPath(); g.ellipse(x, foot - 4, 74, 9, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = t('#14507E'); g.beginPath(); g.ellipse(x, foot - 4, 70, 7, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = t('#1E6FA8'); g.beginPath(); g.ellipse(x, foot - 5, 62, 4, 0, 0, Math.PI * 2); g.fill();
      R(g, x - 30, foot - 7, 18, 1, t('#7FC4F0')); R(g, x + 12, foot - 5, 10, 1, t('#7FC4F0'));
    }
    towers.forEach((T, i) => {
      // (a tile's only what reaches into it: a tower and what's off it reach ~700 either side)
      if (T.x + off < x0 - 720 || T.x + off > x1 + 720) return;
      const top = foot - T.h, tl = T.x - T.w / 2;
      // (the scaffold: the back legs (shaded), a stair zig-zagging up inside, the braces, the front legs (lit); the deck
      // up top and its canopy, striped)
      R(g, tl + 5, top, 3, T.h, S[0]); R(g, tl + T.w - 8, top, 3, T.h, S[0]);
      g.strokeStyle = S[0]; g.lineWidth = 2; g.beginPath();
      for (let y = top + 14, k = 0; y < foot - 10; y += 22, k++) { g.moveTo(k % 2 ? tl + 6 : tl + T.w - 6, y); g.lineTo(k % 2 ? tl + T.w - 6 : tl + 6, y + 22); }
      g.stroke();
      g.strokeStyle = S[1]; g.lineWidth = 2; g.beginPath();
      for (let y = top + 10; y < foot - 20; y += 28) { g.moveTo(tl + 2, y); g.lineTo(tl + T.w - 2, y + 28); g.moveTo(tl + T.w - 2, y); g.lineTo(tl + 2, y + 28); }
      g.stroke();
      for (let y = top + 10; y < foot - 4; y += 28) { R(g, tl, y, T.w, 2, S[1]); R(g, tl, y, T.w, 1, S[2]); }
      R(g, tl - 1, top, 6, T.h, ink); R(g, tl, top, 4, T.h, S[2]); R(g, tl, top, 1, T.h, S[3]);
      R(g, tl + T.w - 5, top, 6, T.h, ink); R(g, tl + T.w - 4, top, 4, T.h, S[1]); R(g, tl + T.w - 4, top, 1, T.h, S[2]);
      R(g, tl - 9, top - 5, T.w + 18, 8, ink); R(g, tl - 8, top - 4, T.w + 16, 6, S[1]); R(g, tl - 8, top + 1, T.w + 16, 1, S[0]);
      const Rc = ramp5(t(BIG_COLS[(i + 3) % 8]));
      R(g, tl - 8, top - 24, 3, 20, S[1]); R(g, tl + T.w + 5, top - 24, 3, 20, S[1]); R(g, T.x - 1, top - 24, 2, 20, S[0]);
      poly(g, [[tl - 14, top - 21], [T.x, top - 42], [tl + T.w + 14, top - 21]], ink);
      poly(g, [[tl - 12, top - 22], [T.x, top - 40], [T.x, top - 22]], Rc[3]);
      poly(g, [[T.x, top - 40], [tl + T.w + 12, top - 22], [T.x, top - 22]], Rc[1]);
      for (let k = 1; k < 4; k++) { const fx = tl - 12 + ((T.x - (tl - 12)) * k) / 4; poly(g, [[fx, top - 22], [T.x, top - 40], [fx + 5, top - 22]], Rc[4]); }
      R(g, tl - 12, top - 22, T.w + 24, 3, Rc[0]);
      g.lineCap = 'round'; g.lineJoin = 'round';
      const col = ramp5(t(BIG_COLS[i % 8])), col2 = ramp5(t(BIG_COLS[(i + 5) % 8]));
      // (a helix down the tower: its back halves first, darker, then the front, round in its plastic's steps)
      if (i % 2 === 0) {
        const turns = Math.max(3, Math.floor(T.h / 80)), r = T.w / 2 + 26;
        for (const front of [false, true]) for (let k = 0; k < turns; k++) {
          const y = top + 30 + k * ((T.h - 60) / turns);
          const pts = Array.from({ length: 17 }, (_, j) => { const a = (front ? 0 : Math.PI) + (j / 16) * Math.PI; return [T.x + Math.cos(a) * r, y + 20 + Math.sin(a) * 16] as [number, number]; });
          if (front) tubeAlong(g, pts, 9, col, ink, 10); else { along(g, pts, 0, 8, ink); along(g, pts, 0, 6, col[0]); along(g, pts, -1, 2, col[1]); }
        }
        // (its legs: posts out to the helix's rim)
        for (const s of [-1, 1]) { R(g, T.x + s * r - 2, top + 40, 3, T.h - 40, S[0]); R(g, T.x + s * r - 2, top + 40, 1, T.h - 40, S[2]); }
      }
      // (a long sweep off the top, down and away to the next tower's pool or further, crossing what's between, on legs)
      const dir = i % 3 === 1 ? -1 : 1, reach = 260 + hash(i + 11) * 360;
      const sweep = bez(T.x + dir * T.w / 2, top + 4, T.x + dir * reach * 0.35, top - 10, T.x + dir * reach * 0.5, foot - T.h * 0.2, T.x + dir * reach, foot - 10, 30);
      legs(sweep, 3);
      tubeAlong(g, sweep, 9, col2, ink, 14);
      // (an enclosed tube: thicker, its rings banded, a loop-de-loop on the way down)
      if (i % 3 !== 1) {
        const lx = T.x + dir * 40, ly = top + T.h * 0.45;
        const path = new Path2D();
        path.moveTo(T.x - dir * T.w / 2, top + 20); path.quadraticCurveTo(T.x - dir * 120, top + 40, lx, ly - 50);
        path.arc(lx, ly, 50, -Math.PI / 2, Math.PI * 1.5 * (dir > 0 ? 1 : -1) - (dir > 0 ? 0 : Math.PI), dir < 0);
        path.quadraticCurveTo(lx + dir * 180, ly + 40, lx + dir * 240, foot - 8);
        const Re = ramp5(t(BIG_COLS[(i + 2) % 8]));
        const st = (w: number, col: string, dy = 0, dash?: number[]) => { g.save(); g.translate(0, dy); g.strokeStyle = col; g.lineWidth = w; if (dash) g.setLineDash(dash); g.stroke(path); g.restore(); g.setLineDash([]); };
        st(17, ink); st(13, Re[1]); st(9, Re[2], -1); st(4, Re[3], -3); st(1.5, Re[4], -4, [8, 6]); st(13, Re[0], 0, [3, 14]);
        // (its legs: under the loop and the run-out)
        for (const [px, py] of [[lx, ly + 50], [lx + dir * 120, ly + 30], [lx + dir * 190, ly + 70]] as const) if (py < foot - 8) { R(g, px - 2, py + 8, 4, foot - py - 8, S[0]); R(g, px - 2, py + 8, 1, foot - py - 8, S[2]); }
      }
      // (a short kiddie one off a lower deck)
      const dy = foot - T.h * 0.3;
      R(g, tl - 11, dy - 1, T.w + 22, 6, ink); R(g, tl - 10, dy, T.w + 20, 4, S[1]);
      const kid = bez(tl - 10, dy + 2, tl - 40, dy + 4, tl - 70, foot - 20, tl - 90, foot - 6, 12);
      tubeAlong(g, kid, 6, ramp5(t(BIG_COLS[(i + 6) % 8])), ink);
      g.lineCap = 'butt'; g.lineJoin = 'miter';
    });
    g.restore();
  }
  // (dimmed: a haze over the lot, so none of it reads as somewhere to stand; deeper toward the foot (the night air),
  // in bands; over what's painted only: the sky behind's left as it is)
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(8, 12, 26, 0.5)'; g.fillRect(0, 0, BIG_W, BIG_H);
  hazeBands(g, 0, BIG_H * 0.45, BIG_W, BIG_H * 0.55, '#080C1A', 0, 0.3, 6);
  g.globalCompositeOperation = 'source-over';
};
/** Screen space: the sky; the far horizon and the plaza's rides, dropping away as he climbs. `shift`: how far the tube
 *  rides have carried him back round their loops (the parallax carries on as if they hadn't: no jump). `hole`: a part
 *  of the screen the world's sure to cover, solid, this frame (the turning tower: its face and its floors), where none
 *  of this is put down (it was, under all of it, every frame: a good part of the spiral's cost). */
export const drawParkBackdrop = (c: Ctx, state: GameState, shift = 0, hole?: { x0: number; x1: number; y0: number; y1: number } | null) => {
  const h = hole && hole.x1 > hole.x0 && hole.y1 > hole.y0 ? hole : null;
  if (!h) return paintBackdrop(c, state, shift);
  // (the world covers the whole screen, solid: nothing of it to put down)
  if (h.x0 <= 0 && h.y0 <= 0 && h.x1 >= W && h.y1 >= H) { backShift = shift; return true; }
  // (round it: what's over it and under it, the whole width; either side of it, its height)
  c.save(); c.beginPath();
  if (h.y0 > 0) c.rect(0, 0, W, h.y0);
  if (h.y1 < H) c.rect(0, h.y1, W, H - h.y1);
  if (h.x0 > 0) c.rect(0, h.y0, h.x0, h.y1 - h.y0);
  if (h.x1 < W) c.rect(h.x1, h.y0, W - h.x1, h.y1 - h.y0);
  c.clip();
  paintBackdrop(c, state, shift);
  c.restore();
  return true;
};
const paintBackdrop = (c: Ctx, state: GameState, shift: number) => {
  const f = state.frame, cx = state.camera.x + shift, cy = state.camera.y, tod = timeOfDay();
  backShift = shift;
  // (over a tube ride's drop: nothing of the backdrop's painted under the drop's top (it's the drop's, black: painted
  // once, below), so the screen's not painted twice over there)
  const drop = dropRect(state);
  // (a plain rect clip only, the drop across the whole screen: a clip of any other shape costs more than it saves)
  const crop = !!drop && drop.x0 <= 0 && drop.x1 >= W;
  if (crop) { c.save(); c.beginPath(); c.rect(0, 0, W, drop!.y); c.clip(); }
  drawTodSky(c, 0, 0, W, H, tod.sky, { moon: [620, 80], horizon: 420, t: f, scroll: cx });
  // (how high he is: the camera's top over the ground's)
  const up = Math.max(0, -cy);
  const hz = 420 + up * 0.05;
  if (hz - FAR_H < H) {
    const o = Math.round(((cx * 0.03) % FAR_W + FAR_W) % FAR_W);
    for (const dx of [-o, FAR_W - o]) {
      if (dx >= W || dx + FAR_W <= 0) continue;
      c.save(); c.translate(dx, Math.round(hz - FAR_H));
      stamp(c, `wp-far-${tod.key}`, 0, 0, FAR_W, FAR_H, paintFar);
      c.restore();
    }
  }
  const my = 470 + up * 0.22;
  // (the haze down at the horizon, and under it the dark of the land)
  const base = Math.round(Math.max(hz, my));
  if (base < H) { R(c, 0, base, W, H - base, farTint('#0A1020', 0.8)); }
  // (the park's giant slides (in place of the plain far-off rides there were): a seamless strip, dropping away quicker
  // as he climbs)
  const by = 548 + up * 0.35;
  if (by - BIG_H < H && !NOBIG) {
    const ox = ((cx * 0.2) % BIG_W + BIG_W) % BIG_W;
    // (in tiles, only those on screen (and not under the drop) put down)
    const top = Math.round(by - BIG_H), cut = drop && crop ? drop.y : H;
    for (const dx of [-ox, BIG_W - ox]) for (let tx = 0; tx < BIG_W; tx += BIG_TW) for (let ty = 0; ty < BIG_H; ty += BIG_TH) {
      const sx = Math.round(dx) + tx, sy = top + ty;
      if (sx >= W || sx + BIG_TW <= 0 || sy >= cut || sy + BIG_TH <= 0) continue;
      c.save(); c.translate(Math.round(dx), top);
      stamp(c, `wp-big-${tod.key}-${tx}-${ty}`, tx, ty, BIG_TW, BIG_TH, g => { g.save(); g.beginPath(); g.rect(tx, ty, BIG_TW, BIG_TH); g.clip(); paintBig(g, tx, tx + BIG_TW); g.restore(); });
      c.restore();
    }
    if (by < H) R(c, 0, Math.round(by), W, H - Math.round(by), farTint('#0A1020', 0.8));
  }
  // (a tube ride's own theming up in the air: its inflatables on their tethers (zones.ts))
  const dz = dropOf(state);
  if (dz) drawRideSky(c, TUBES[dz.i].id, cx, cy);
  // (over a tube ride's drop: the mist rising out of it, thin up high, thickening down to the haze's top (drawTubeBack
  // carries on from there, in front of the legs): the slides far down under him go into it, so none of them reads as
  // somewhere a fall would land; stepped in over the drop's ends (the tower's, the splash pool's), no hard edge)
  if (dz) {
    const x0 = Math.max(0, Math.round(dz.a - state.camera.x)), x1 = Math.min(W, Math.round(dz.b - state.camera.x));
    const ST = 5, SW = 28, SH = 36, base = Math.min(H + 20, dz.top - Math.round(state.camera.y)), y1 = Math.min(H, base, drop ? drop.y : H);
    const cols: [number, number, number][] = [];
    const L = x0 > 0 ? ST : 0, Rn = x1 < W ? ST : 0, m0 = x0 + L * SW, m1 = x1 - Rn * SW;
    if (m1 > m0) {
      for (let k = 0; k < L; k++) cols.push([x0 + k * SW, x0 + (k + 1) * SW, (k + 1) / (ST + 1)]);
      cols.push([m0, m1, 1]);
      for (let k = Rn - 1; k >= 0; k--) cols.push([x1 - (k + 1) * SW, x1 - k * SW, (k + 1) / (ST + 1)]);
    }
    for (let k = 0; k < MIST_UP.length; k++) {
      const ya = Math.max(0, base - (MIST_UP.length - k) * SH), yb = Math.min(y1, base - (MIST_UP.length - k - 1) * SH);
      if (yb <= ya) continue;
      for (const [ca, cb, g2] of cols) if (cb > ca) { c.fillStyle = `rgba(14, 19, 34, ${(MIST_UP[k] * g2).toFixed(3)})`; c.fillRect(ca, ya, cb - ca, yb - ya); }
    }
  }
  if (drop) {
    if (crop) c.restore();
    // (the drop under its haze's solid line (the haze: drawTubeBack): banded on down into black, no bottom)
    const w = drop.x1 - drop.x0;
    DROP_BANDS.forEach((col, k) => R(c, drop.x0, drop.y + k * 26, w, 26, col));
    const v = drop.y + DROP_BANDS.length * 26;
    if (v < H) R(c, drop.x0, v, w, H - v, VOID);
    // (down in it: the ride's stars, or its glowing plankton (zones.ts))
    if (dz) drawRideDrop(c, TUBES[dz.i].id, cx, drop);
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The plaza: the ground, its pits and pools, its props
//
// The SNES pass (the owner's "snes-ify all the visual elements added since starting with the abduction"). Depth, back to
// front, all in drawBack (world, behind him), each step's own draw in this order:
//   drawProps: palms (furthest back, dimmed), the light poles, the gate's towers and arch (their side faces first),
//     the ticket booths and the turnstiles, the stands (HOT DOGS, SNO-CONES), the lockers, the loungers and umbrellas,
//     the trash cans (all dimmed, nothing on them to stand on: no lit tops, round or sloped tops), the signs on their
//     posts (stood on the ground, at its depth), the tiki hut and the lifeguard stand (stood on: lit tops), the Wipeout's
//     island (stood on: a lit top);
//   the pits (the craters' dark in bands and their broken edges; the deep end's black is the tube rides');
//   the pools (the lagoon's tiles, its water over them);
//   the slides (legs, stairs, the tower under the deck, its canopy, the chute's back half and its water);
//   the ground's slab (its lit lip) over all of it at GY.
// In front of him (drawFront): the pools' water over him, the slides' near walls.

/** The plaza's pavers, in steps (deep to highlight). */
const PAVE = ['#4A4034', '#655949', '#807260', '#9C8C74', '#B8A68A', '#D6C6A8', '#F2E6CE'];
/** The background props' colors: their own, a little back toward the night (dimmed: nothing there to stand on). */
const back = (col: string) => mix(col, '#26304E', 0.3);
/** The one eye the plaza's solid props' side faces go back toward: the screen's middle, at the ground (their feet stay
 *  on the ground line: the plaza's seen side on, no floor going back to stand them on). */
const eyeOf = (state: GameState) => ({ x: state.camera.x + W / 2, y: GY });
/** A box's side faces, whichever faces him (sideFace skips the other): drawn before its front. */
const faces = (c: Ctx, state: GameState, x0: number, x1: number, top: number, col: string, depth = 0.9) => {
  const e = eyeOf(state);
  sideFace(c, e, x0, -1, top, GY, depth, col);
  sideFace(c, e, x1, 1, top, GY, depth, col);
};

/** The ground's tiles (world-anchored, one of four looks each): the coping along the top (lit: standable reads standable),
 *  two courses of pavers in their steps, the odd crack, drain, stain. */
const GT = 256, GH = 90;
const paintGround = (g: Ctx, x: number, v: number) => {
  const y = GY, P = PAVE;
  R(g, x, y, GT, GH, P[0]);
  // (the coping: its lit lip, its face, the shadow under it)
  R(g, x, y, GT, 2, '#FFF6E2'); R(g, x, y + 2, GT, 3, P[5]); R(g, x, y + 5, GT, 5, P[4]); dither(g, x, y + 5, GT, 2, P[5]);
  R(g, x, y + 10, GT, 2, P[1]);
  for (let k = 0; k < GT; k += 32) R(g, x + k, y + 5, 1, 5, P[2]);
  // (the pavers: two courses, staggered; each lit along its top and left, shaded along its foot and right, specked)
  for (const [cy, ch, off] of [[y + 13, 28, 0], [y + 43, 30, 32]] as const) {
    for (let px = x - 64 + off; px < x + GT; px += 64) {
      const n = hash(px * 0.013 + cy), base = n < 0.33 ? P[2] : n < 0.66 ? mix(P[2], P[3], 0.5) : P[3];
      const x0 = Math.max(x, px + 1), x1 = Math.min(x + GT, px + 63);
      if (x1 <= x0) continue;
      R(g, x0, cy, x1 - x0, ch, base);
      dither(g, x0, cy + ch - 8, x1 - x0, 4, P[1]);
      R(g, x0, cy + ch - 3, x1 - x0, 3, mix(base, P[1], 0.6));
      R(g, x0, cy, x1 - x0, 2, P[4]); R(g, x0, cy, x1 - x0, 1, P[5]);
      if (px + 1 >= x) R(g, px + 1, cy, 2, ch, mix(base, P[4], 0.6));
      if (px + 63 <= x + GT) R(g, px + 61, cy, 2, ch, P[1]);
      for (let k = 0; k < 6; k++) { const sx = px + 4 + hash(px + k * 7.3 + cy) * 56, sy = cy + 4 + hash(px * 0.7 + k + cy) * (ch - 10); if (sx >= x && sx < x + GT - 2) R(g, sx, sy, 2, 1, k % 2 ? P[1] : P[4]); }
    }
  }
  R(g, x, y + 73, GT, 3, P[1]); dither(g, x, y + 76, GT, 4, P[1]);
  // (its look: a crack, a drain, a stain)
  if (v === 1) { g.strokeStyle = P[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 70, y + 13); g.lineTo(x + 84, y + 24); g.lineTo(x + 80, y + 33); g.lineTo(x + 98, y + 46); g.lineTo(x + 94, y + 60); g.stroke(); g.strokeStyle = P[4]; g.beginPath(); g.moveTo(x + 71, y + 14); g.lineTo(x + 85, y + 25); g.stroke(); }
  if (v === 2) { R(g, x + 150, y + 18, 34, 16, INK); R(g, x + 151, y + 19, 32, 14, '#1E2228'); for (let k = 0; k < 7; k++) R(g, x + 153 + k * 4, y + 20, 2, 12, '#5A606A'); R(g, x + 151, y + 19, 32, 1, '#8A909A'); }
  if (v === 3) { g.fillStyle = 'rgba(40, 30, 20, 0.35)'; g.beginPath(); g.ellipse(x + 110, y + 30, 26, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(40, 30, 20, 0.25)'; g.beginPath(); g.ellipse(x + 124, y + 52, 16, 4, 0, 0, Math.PI * 2); g.fill(); }
};
/** The plaza's slab at GY: its tiles (stamped, anchored to the world), cut to each run; a lit corner where a run ends. */
const drawGround = (c: Ctx, state: GameState) => {
  const bot = state.camera.y + H + 40;
  if (bot < GY) return;
  const v = state.view && state.view.w > W ? state.view : { x: state.camera.x, w: W };
  for (const [a, b] of GROUND) {
    if (!vis(state, a, b, 20)) continue;
    const x0 = Math.max(a, v.x - 40), x1 = Math.min(b, v.x + v.w + 40);
    if (x1 <= x0) continue;
    c.save(); c.beginPath(); c.rect(x0, GY, x1 - x0, bot - GY); c.clip();
    // (each area's own ground (zones.ts); the plaza's pavers at the gate and at base camp)
    for (let tx = Math.floor(x0 / GT) * GT; tx < x1; tx += GT) {
      const k = Math.floor(hash(tx / GT + 0.5) * 4), z = groundAt(tx);
      c.save(); c.translate(tx, 0);
      if (z === 'pave') stamp(c, `wp-gnd-${k}`, 0, GY, GT, GH, g => paintGround(g, 0, k));
      else stamp(c, `wp-gnd-${z}-${k}`, 0, GY, GT, GH, g => paintZoneGround(g, z, 0, k, GT, GH));
      c.restore();
    }
    if (bot > GY + GH) R(c, x0, GY + GH, x1 - x0, bot - GY - GH, PAVE[0]);
    c.restore();
    // (the edge of a run: a lit corner, the slab's broken face down it)
    for (const e of [a, b]) if (e > x0 - 2 && e < x1 + 2) { R(c, e - (e === a ? 0 : 3), GY, 3, 12, '#FFF6E2'); R(c, e - (e === a ? 0 : 3), GY + 12, 3, 48, PAVE[3]); }
  }
};
/** The craters' dark, in bands going down; their glow (something burning down there). */
const CRATER = ['#3E2A1C', '#2C1D14', '#1F140E', '#140C09', '#0A0505'];
const SOIL = ['#1A110A', '#2A1C10', '#3C2A18', '#523A22', '#6A4C2E'];
/** A crater's broken edge (d: 1 the pit's to the right of ex, -1 to its left): the slab snapped off, a chunk of it
 *  hanging, rebar bent out of it, the gravel and the dirt under it going down. Stamped. */
const paintCraterEdge = (g: Ctx, ex: number, d: number) => {
  const X = (dx: number) => ex + d * dx;
  // (the dirt under the slab, going down into the dark, banded)
  poly(g, [[X(0), GY + 10], [X(34), GY + 26], [X(26), GY + 60], [X(46), GY + 96], [X(20), GY + 140], [X(30), GY + 200], [X(0), GY + 210]], SOIL[1]);
  poly(g, [[X(0), GY + 12], [X(26), GY + 28], [X(20), GY + 58], [X(32), GY + 90], [X(0), GY + 100]], SOIL[2]);
  dither(g, Math.min(X(0), X(36)), GY + 92, 36, 6, SOIL[1]);
  for (let k = 0; k < 12; k++) { const sx = X(4 + hash(ex + k) * 26), sy = GY + 20 + hash(ex * 0.3 + k) * 150; R(g, sx, sy, 3, 2, k % 3 ? SOIL[3] : SOIL[4]); }
  // (the slab: snapped off ragged, its top lit, its broken face, a chunk of it hanging down on its rebar)
  poly(g, [[X(0), GY - 1], [X(28), GY + 1], [X(20), GY + 7], [X(32), GY + 12], [X(12), GY + 16], [X(0), GY + 16]], INK);
  poly(g, [[X(0), GY], [X(26), GY + 2], [X(18), GY + 7], [X(29), GY + 11], [X(10), GY + 14], [X(0), GY + 14]], PAVE[3]);
  poly(g, [[X(0), GY + 8], [X(29), GY + 11], [X(10), GY + 14], [X(0), GY + 14]], PAVE[1]);
  R(g, Math.min(X(0), X(25)), GY, 25, 2, '#FFF6E2');
  poly(g, [[X(14), GY + 18], [X(40), GY + 24], [X(48), GY + 46], [X(22), GY + 42]], INK);
  poly(g, [[X(15), GY + 19], [X(38), GY + 25], [X(45), GY + 44], [X(23), GY + 40]], PAVE[2]);
  poly(g, [[X(15), GY + 19], [X(38), GY + 25], [X(39), GY + 29], [X(17), GY + 23]], PAVE[4]);
  // (the rebar: rust in steps, bent out over the drop)
  g.lineCap = 'round';
  for (const [y0, a, b] of [[GY + 6, 46, -4], [GY + 12, 38, 14], [GY + 30, 56, 30]] as const) {
    g.strokeStyle = '#2A140A'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(10), y0); g.quadraticCurveTo(X(a * 0.7), y0 + b * 0.2, X(a), y0 + b); g.stroke();
    g.strokeStyle = '#8A4A26'; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = '#C07A46'; g.lineWidth = 1; g.beginPath(); g.moveTo(X(10), y0 - 1); g.quadraticCurveTo(X(a * 0.7), y0 + b * 0.2 - 1, X(a * 0.9), y0 + b * 0.8 - 1); g.stroke();
  }
  g.lineCap = 'butt';
  // (a broken water pipe out of the dirt, dribbling)
  R(g, Math.min(X(0), X(22)), GY + 70, 22, 8, INK); R(g, Math.min(X(0), X(21)), GY + 71, 21, 6, '#5A6068'); R(g, Math.min(X(0), X(21)), GY + 71, 21, 2, '#9AA0AA');
  R(g, X(21) - (d > 0 ? 0 : 2), GY + 78, 2, 40, 'rgba(120, 190, 240, 0.45)');
};
/** The mountain's outside's foot past base camp's ground (the face's band 0 out over the crater there: TR..TR+FACE,
 *  base camp's ground ends at 29900): its fiberglass rock carried on down past the ground's line, a concrete footing
 *  under it on piers, the lot banded off into the crater's dark (no lit top: nothing to stand on). */
const FACE_FOOT: [number, number] = [GROUND[7][1], TOWER.TR + (TOWER.TR - TOWER.TL)], FOOT_H = 320;
const paintFaceFoot = (g: Ctx) => {
  const [x0, x1] = FACE_FOOT, Rk = ['#2E2418', '#463828', '#5E4C38', '#7E6850', '#9A8468', '#B8A284'];
  R(g, x0 - 4, GY, x1 - x0 + 4, 70, Rk[2]);
  dither(g, x0 - 4, GY + 20, x1 - x0 + 4, 40, Rk[1]);
  for (let i = 0; i < 8; i++) { const fx = x0 + hash(i + 900) * (x1 - x0 - 90), fw = 50 + hash(i + 910) * 80, fy = GY + 6 + hash(i + 920) * 30; poly(g, [[fx, fy + 30], [fx + fw * 0.3, fy], [fx + fw, fy + 6], [fx + fw + 6, fy + 34]], Rk[3]); R(g, fx + fw * 0.3, fy, fw * 0.5, 1, Rk[4]); }
  for (let x = x0 + 120 - ((x0 - TOWER.TR) % 160); x < x1; x += 160) if (x > x0) { R(g, x, GY, 2, 70, Rk[0]); R(g, x + 2, GY, 1, 70, Rk[4]); }
  // (the shell's bottom edge, ragged, and the concrete footing it's bolted down onto)
  const fy = GY + 64;
  R(g, x0 - 4, fy, x1 - x0 + 4, 30, INK); R(g, x0 - 4, fy + 1, x1 - x0 + 4, 28, CONC[2]); R(g, x0 - 4, fy + 1, x1 - x0 + 4, 2, CONC[3]); R(g, x0 - 4, fy + 24, x1 - x0 + 4, 5, CONC[0]);
  for (let x = x0 + 10; x < x1; x += 40) { R(g, x, fy - 2, 4, 4, INK); R(g, x + 1, fy - 1, 2, 2, '#B8B2AA'); }
  for (let x = x0; x < x1; x += 12) R(g, x, fy - 3 - Math.round(hash(x * 0.3) * 4), 8, 3, Rk[1]);
  // (its piers on down, and the dark: banded off into the crater's)
  for (const px of [x0 + 40, (x0 + x1) / 2 - 12, x1 - 70]) { const p = Math.round(px); R(g, p - 1, fy + 30, 26, FOOT_H - 94, INK); R(g, p, fy + 30, 24, FOOT_H - 94, CONC[1]); R(g, p, fy + 30, 3, FOOT_H - 94, CONC[2]); R(g, p + 19, fy + 30, 5, FOOT_H - 94, CONC[0]); }
  hazeBands(g, x0 - 4, GY + 24, x1 - x0 + 4, FOOT_H - 24, CRATER[4], 0.15, 1, 7);
  // (the shell's cut edge on its far side, carried down)
  R(g, x1 - 10, GY, 10, 70, '#120E0A'); R(g, x1 - 12, GY, 2, 70, Rk[1]);
};
/** The pits between runs: blast craters (in bands down into the dark, a glow far down), or the drained DEEP END under
 *  the tube rides (black: the drop's bands over it, drawTubeBack). */
const drawPits = (c: Ctx, state: GameState, face = false) => {
  const bot = state.camera.y + H + 40;
  for (let i = 0; i + 1 < GROUND.length; i++) {
    const a = GROUND[i][1], b0 = GROUND[i + 1][0];
    if (!vis(state, a, b0, 20) || bot < GY) continue;
    const pool = POOLS.find(p => p.x1 >= a - 1 && p.x2 <= b0 + 1);
    // (a pool at the far end of a crater (the descent's splash pool, past base camp's): the crater up to the pool's wall)
    const b = pool && pool.x1 > a + 200 && !TUBES.some(t => t.pool === pool) ? pool.x1 : b0;
    const deep = TUBES.some(t => t.deck.x1 >= a - 140 && t.deck.x1 <= a + 5);
    const x0 = Math.max(a, state.camera.x - 40), x1 = Math.min(b, state.camera.x + W + 40);
    if (deep) {
      // (under the tube rides: nothing. Black all the way down, under the drop's haze (drawTubeBack): its solid line's
      // never lower than this)
      // (not where a ride's drop is (its haze and bands, drawTubeBack and the backdrop), nor under a splash pool (its own
      // piers down into the dark): only under the tower's shaft and past the pool's far end)
      if (bot > GY + 140) for (const T of TUBES) { if (T.deck.x1 < a - 140 || T.deck.x1 > a + 5) continue; for (const [u, v] of [[a, T.deck.x2], [T.pool.x2, b]]) { const p0 = Math.max(x0, u), p1 = Math.min(x1, v); if (p1 > p0) R(c, p0, GY + 140, p1 - p0, bot - GY - 140, VOID); } }
      continue;
    }
    if (pool && b === b0) continue;
    // (a crater: the dark in bands, each seam dithered; the glow far down, stepped)
    const w = x1 - x0;
    // (the descent's crater, past base camp: deeper, darker from its top (it's the long drop under the slide))
    const CR = a === FACE_FOOT[0] ? [CRATER[2], CRATER[3], CRATER[4], CRATER[4], CRATER[4]] : CRATER;
    CR.forEach((col, k) => { const y0 = GY + k * 44, h = k === CRATER.length - 1 ? bot - y0 : 44; if (h > 0 && y0 < bot) { R(c, x0, y0, w, h, col); if (k) dither(c, x0, y0 - 2, w, 2, col); } });
    for (let k = 0; k < 4; k++) { const y0 = GY + 230 + k * 40; if (y0 < bot) { c.fillStyle = `rgba(234, 88, 12, ${(0.05 + k * 0.045).toFixed(3)})`; c.fillRect(x0, y0, w, k === 3 ? bot - y0 : 40); } }
    // (the mountain's foot, out past base camp's ground over the crater: its fiberglass on down into the dark and the
    // concrete footing it stands on, before the crater's broken edge (in front of it))
    if (face && a === FACE_FOOT[0] && vis(state, FACE_FOOT[0] - 10, FACE_FOOT[1] + 10)) for (let ty = GY; ty < Math.min(bot, GY + FOOT_H); ty += 160) if (visY(state, ty, ty + 160, 0)) stamp(c, `wp-facefoot-${ty}`, FACE_FOOT[0] - 4, ty, FACE_FOOT[1] - FACE_FOOT[0] + 4, Math.min(160, GY + FOOT_H - ty), g => { g.save(); g.beginPath(); g.rect(FACE_FOOT[0] - 4, ty, FACE_FOOT[1] - FACE_FOOT[0] + 4, 160); g.clip(); paintFaceFoot(g); g.restore(); });
    for (const [ex, d] of [[a, 1], [b, -1]] as const) {
      if (pool && d < 0) continue;
      if (ex < state.camera.x - 80 || ex > state.camera.x + W + 80) continue;
      stamp(c, `wp-crater-${ex}`, d > 0 ? ex - 2 : ex - 62, GY - 4, 64, 220, g => paintCraterEdge(g, ex, d));
    }
    // (an island stood up out of it (the Wipeout's): over the crater's dark, down into it)
    for (const [x, y, w] of ISLANDS) if (x > a && x < b) if (vis(state, x, x + w)) stamp(c, `wp-island-${x}`, x, y, w, GY + 400 - y, g => paintIsland(g, x, y, w));
  }
};
const waterOf = (p: (typeof POOLS)[number], greenPool: number, a: number) => {
  const green = p === POOLS[3] ? greenPool : 0;
  return green > 0 ? `rgba(${Math.round(40 + 30 * (1 - green))}, ${Math.round(120 + 40 * green)}, ${Math.round(200 - 140 * green)}, ${a + 0.12})` : `rgba(40, 140, 220, ${a})`;
};
/** The pools' water in front of him (he's in it, down in it: the water over him), its surface glinting. */
const drawPoolsFront = (c: Ctx, state: GameState, greenPool: number) => {
  for (const p of POOLS) {
    if (!vis(state, p.x1, p.x2) || !visY(state, p.surface, p.bottom)) continue;
    const green = p === POOLS[3] ? greenPool : 0;
    c.fillStyle = waterOf(p, greenPool, 0.32); c.fillRect(p.x1, p.surface, p.x2 - p.x1, p.bottom - p.surface);
    R(c, p.x1, p.surface, p.x2 - p.x1, 2, green > 0.5 ? '#BEF264' : '#BFE6FF');
    for (let x = p.x1 + ((state.frame * 0.6) % 30); x < p.x2 - 8; x += 30) R(c, x, p.surface + 4, 8, 1, '#E0F2FE');
  }
};
/** THE LAGOON's basin (stamped): its walls in mosaic tile (a band of wave tiles up top, the depth markers), banded darker
 *  going down; its floor's tiles lit along the top (he stands on it); its end walls; the coping round its rim, lit; the
 *  ladder at its far end in chrome steps. */
const TILE = ['#0E3460', '#16487E', '#1F5A92', '#2E70AA', '#4A8AC8', '#8AC0EA'];
const paintLagoon = (g: Ctx, p: (typeof POOLS)[number], marks: [string, string] = ['3 FT', '9 FT']) => {
  const { x1, x2, bottom } = p, w = x2 - x1;
  R(g, x1, GY, w, bottom - GY + 20, TILE[2]);
  for (let y = GY + 20; y < bottom; y += 8) for (let x = x1 + ((y >> 3) % 2) * 4; x < x2; x += 8) { const n = hash(x * 0.37 + y * 0.11); R(g, x, y, 7, 7, n < 0.3 ? TILE[1] : n < 0.8 ? TILE[2] : TILE[3]); R(g, x, y, 7, 1, TILE[3]); }
  // (the wave tiles' band along the top: white crests on blue)
  R(g, x1, GY + 4, w, 14, TILE[3]);
  for (let x = x1; x < x2; x += 16) { poly(g, [[x, GY + 16], [x + 6, GY + 7], [x + 12, GY + 9], [x + 10, GY + 12], [x + 16, GY + 16]], '#E0F2FE'); R(g, x + 6, GY + 8, 3, 1, '#FFFFFF'); }
  R(g, x1, GY + 18, w, 2, TILE[0]);
  // (deeper, darker: banded down)
  hazeBands(g, x1, GY + 20, w, bottom - GY - 20, '#041228', 0, 0.55, 5);
  // (the depth markers on the wall, in tile letters)
  signText(g, marks[0], x1 + 40, GY + 38, { sx: 1, sy: 2, fill: '#F8FAFC', shadow: TILE[0] }, 'center');
  signText(g, marks[1], x2 - 60, GY + 38, { sx: 1, sy: 2, fill: '#F8FAFC', shadow: TILE[0] }, 'center');
  // (its floor: tiles, lit along the top: he stands on it)
  R(g, x1, bottom, w, 20, TILE[1]); R(g, x1, bottom, w, 2, '#CFEFFF'); R(g, x1, bottom + 2, w, 2, TILE[5]); R(g, x1, bottom + 4, w, 1, TILE[3]);
  for (let x = x1 + 16; x < x2; x += 32) R(g, x, bottom + 5, 1, 15, TILE[0]);
  // (its end walls: darker tile, a lit edge down each)
  for (const [ex, d] of [[x1, 1], [x2, -1]] as const) {
    const ox = d > 0 ? ex : ex - 8;
    R(g, ox, GY, 8, bottom - GY, TILE[0]); R(g, d > 0 ? ex + 8 : ex - 10, GY, 2, bottom - GY, TILE[4]);
    for (let y = GY + 8; y < bottom; y += 8) R(g, ox, y, 8, 1, TILE[1]);
  }
  // (the coping round the rim: stone, lit along its top, its lip over the water)
  for (const ex of [x1, x2]) { R(g, ex - 6, GY - 3, 12, 10, INK); R(g, ex - 5, GY - 2, 10, 8, PAVE[4]); R(g, ex - 5, GY - 2, 10, 2, '#FFF6E2'); R(g, ex - 5, GY + 4, 10, 2, PAVE[2]); }
  // (the ladder at the far end: chrome rails in steps, rungs)
  for (const rx of [x2 - 22, x2 - 11]) { R(g, rx - 1, GY - 32, 5, 64, INK); R(g, rx, GY - 31, 3, 62, '#9AA2AC'); R(g, rx, GY - 31, 1, 62, '#F1F5F9'); R(g, rx + 2, GY - 31, 1, 62, '#5A626C'); }
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(x2 - 16.5, GY - 31, 5.5, Math.PI, 0); g.stroke();
  g.strokeStyle = '#C8CED6'; g.lineWidth = 2; g.stroke();
  for (let y = GY - 22; y < GY + 30; y += 12) { R(g, x2 - 21, y, 12, 3, '#5A626C'); R(g, x2 - 21, y, 12, 1, '#E2E8F0'); }
};
/** A tube ride's splash pool: the lagoon's basin (its tiles, its markers, its coping, the ladder out at its far end),
 *  and the outside of its near wall going down into the drop the chute comes in over (concrete, streaked, no lit top:
 *  nothing to stand on), banded on down into black. */
const SPLASH = [POOLS[1], POOLS[2]];
const CONC = ramp5(mix('#6A7080', '#0B1020', 0.35));
const SPLASH_DEEP = 260;
const paintSplash = (g: Ctx, p: (typeof POOLS)[number]) => {
  const x = p.x1 - 16, top = GY + 8, shell = p.bottom + 20, bot = p.bottom + SPLASH_DEEP;
  // (the basin's shell under its floor: concrete, its bottom edge shaded (nothing to stand on under there)), and the piers
  // it stands on, on down into the drop's dark)
  R(g, x - 1, shell, p.x2 - x + 1, 34, INK); R(g, x, shell, p.x2 - x, 32, CONC[1]); R(g, x, shell, p.x2 - x, 2, CONC[2]); R(g, x, shell + 26, p.x2 - x, 6, CONC[0]);
  for (let k = x + 40; k < p.x2; k += 64) R(g, k, shell + 4, 1, 22, CONC[0]);
  for (const px of [x + 30, (x + p.x2) / 2 - 12, p.x2 - 60]) { const pxr = Math.round(px); R(g, pxr - 1, shell + 32, 26, bot - shell - 32, INK); R(g, pxr, shell + 32, 24, bot - shell - 32, CONC[1]); R(g, pxr, shell + 32, 3, bot - shell - 32, CONC[2]); R(g, pxr + 19, shell + 32, 5, bot - shell - 32, CONC[0]); }
  // (its near wall's outside: down the drop side of it to the shell)
  R(g, x - 1, top, 17, shell + 32 - top, INK); R(g, x, top, 16, shell + 32 - top, CONC[2]); R(g, x, top, 2, shell + 32 - top, CONC[3]); R(g, x + 12, top, 4, shell + 32 - top, CONC[1]);
  for (let y = top + 18; y < shell + 30; y += 30) { R(g, x, y, 16, 1, CONC[0]); R(g, x, y + 1, 16, 1, CONC[3]); }
  for (let k = 0; k < 5; k++) { const sx = x + 3 + Math.floor(hash(k + p.x1) * 9); R(g, sx, top + 4 + k * 37, 1, 14 + Math.floor(hash(k + 9) * 20), CONC[1]); }
  dither(g, x, top, 16, 6, CONC[0]);
  // (going down into the dark: banded off into black under the floor)
  hazeBands(g, x - 1, shell + 40, p.x2 - x + 1, bot - shell - 40, VOID, 0.2, 1, 7);
  paintLagoon(g, p, ['12 FT', '12 FT']);
};
const drawPools = (c: Ctx, state: GameState, greenPool: number) => {
  for (const p of POOLS) {
    if (!vis(state, p.x1 - 20, p.x2)) continue;
    if (p === POOLS[0] || SPLASH.includes(p) || p === POOLS[3]) {
      // (the lagoon: its basin stamped; the water over it live (banded: deeper, bluer)) (the tube rides' splash pools the
      // same, their near walls' outsides down into the drop)
      if (p === POOLS[0]) stamp(c, 'wp-lagoon', p.x1 - 10, GY - 40, p.x2 - p.x1 + 20, p.bottom - GY + 64, g => paintLagoon(g, p));
      else stamp(c, `wp-splash-${p.x1}`, p.x1 - 22, GY - 40, p.x2 - p.x1 + 32, p.bottom - GY + SPLASH_DEEP + 40, g => paintSplash(g, p));
      const d = p.bottom - p.surface;
      // (the Everest splash pool's goes green with the kid's blood: the bands toward his green)
      const gk = p === POOLS[3] ? Math.min(1, greenPool) : 0;
      const band = (r: number, gg: number, b: number, a: number) => (gk > 0 ? `rgba(${Math.round(r + (46 - r) * gk)}, ${Math.round(gg + (150 - gg) * gk)}, ${Math.round(b + (60 - b) * gk)}, ${(a + 0.1 * gk).toFixed(3)})` : `rgba(${r}, ${gg}, ${b}, ${a})`);
      c.fillStyle = band(40, 150, 225, 0.42); c.fillRect(p.x1, p.surface, p.x2 - p.x1, d * 0.3);
      c.fillStyle = band(34, 128, 210, 0.5); c.fillRect(p.x1, p.surface + Math.round(d * 0.3), p.x2 - p.x1, Math.round(d * 0.35));
      c.fillStyle = band(26, 100, 190, 0.58); c.fillRect(p.x1, p.surface + Math.round(d * 0.65), p.x2 - p.x1, d - Math.round(d * 0.65));
      // (his blood in it in clouds, darker, drifting)
      if (gk > 0.3) for (let k = 0; k < 5; k++) { const cx = p.x1 + 40 + ((hash(k + 950) * (p.x2 - p.x1 - 120) + state.frame * (0.1 + k * 0.03)) % (p.x2 - p.x1 - 100)), cy = p.surface + 30 + hash(k + 960) * (d - 60); c.fillStyle = `rgba(20, 70, 24, ${(0.25 * gk).toFixed(3)})`; c.fillRect(Math.round(cx), Math.round(cy), 50 + k * 8, 10); c.fillRect(Math.round(cx) + 8, Math.round(cy) - 6, 30, 6); c.fillRect(Math.round(cx) + 14, Math.round(cy) + 10, 26, 5); }
      // (the light off the water on the floor, wobbling)
      for (let x = p.x1 + 20 + ((state.frame * 0.4) % 40); x < p.x2 - 20; x += 40) R(c, x, p.bottom - 3, 12, 1, 'rgba(200, 240, 255, 0.5)');
      continue;
    }
    // (the tiles of its walls and floor; the water over it, banded, its surface glinting)
    R(c, p.x1, GY, p.x2 - p.x1, p.bottom - GY + 20, '#2A6AA8');
    for (let y = GY; y < p.bottom; y += 16) R(c, p.x1, y, p.x2 - p.x1, 1, '#4A8AC8');
    // (its floor: tiles, lit along the top: he stands on it)
    R(c, p.x1, p.bottom, p.x2 - p.x1, 3, '#BFE6FF'); R(c, p.x1, p.bottom + 3, p.x2 - p.x1, 2, '#7FB4E6');
    // (its walls: darker, a lit edge down each)
    R(c, p.x1, GY, 6, p.bottom - GY, '#1E4E82'); R(c, p.x2 - 6, GY, 6, p.bottom - GY, '#1E4E82');
    R(c, p.x1 + 6, GY, 2, p.bottom - GY, '#6AA8E0'); R(c, p.x2 - 8, GY, 2, p.bottom - GY, '#6AA8E0');
    c.fillStyle = waterOf(p, greenPool, 0.5); c.fillRect(p.x1, p.surface, p.x2 - p.x1, p.bottom - p.surface);
    // (its rim: lit, a ladder at the far end)
    R(c, p.x1 - 4, GY - 2, 8, 8, '#F8FAFC'); R(c, p.x2 - 4, GY - 2, 8, 8, '#F8FAFC');
    R(c, p.x2 - 20, GY - 30, 3, 60, '#C8CCD2'); R(c, p.x2 - 10, GY - 30, 3, 60, '#C8CCD2');
    for (let y = GY - 24; y < GY + 30; y += 12) R(c, p.x2 - 20, y, 13, 2, '#C8CCD2');
  }
};
/** A sign on posts, stood on the ground at (x, feet), its board high enough to read over him: a water park's, its top a
 *  wave cresting (foam on it), planks in its paint's steps, an ink edge; its words in the park's sign letters (enamel,
 *  ramped down each letter, a drop shadow), the name big; its posts bamboo, notched, stood on the ground. */
const SIGN_INK = '#140A04';
const nameLook = (col: string): Look => ({ sx: 2, sy: 2, fill: rampDown(col, 0.35), dither: true, shadow: SIGN_INK, drop: 2, gap: 1 });
const subLook = (col: string): Look => ({ sx: 1, sy: 2, fill: rampDown(col, 0.3), dither: true, shadow: SIGN_INK, drop: 1, gap: 1 });
export const sign = (c: Ctx, x: number, feet: number, lines: string[], board = '#0E7490', ink = '#FEF3C7', key?: string) => {
  const draw = (g: Ctx) => {
    const Ls = lines.map((_, i) => (i ? subLook(ink) : nameLook(ink)));
    const w = Math.round(Math.max(84, ...lines.map((l, i) => signW(l, Ls[i]))) + 26);
    const h = Math.round(10 + Ls.reduce((n, L) => n + signH(L) + 5, 0)), top = feet - 114, x0 = Math.round(x - w / 2);
    const B = ramp5(board), bam = ramp5('#A8843E');
    // (its posts: bamboo, notched, from under the board down to the ground)
    for (const px of [x0 + 12, x0 + w - 18]) {
      R(g, px - 1, top + h, 8, feet - top - h, INK); R(g, px, top + h, 6, feet - top - h, bam[2]); R(g, px, top + h, 2, feet - top - h, bam[3]); R(g, px + 5, top + h, 1, feet - top - h, bam[1]);
      for (let yy = top + h + 12; yy < feet - 6; yy += 16) { R(g, px, yy, 6, 2, bam[0]); R(g, px, yy + 2, 6, 1, bam[4]); }
      R(g, px - 2, feet - 3, 10, 3, bam[0]);
    }
    // (the board: its crest of a wave along the top, then the planks)
    g.fillStyle = INK; for (let k = x0 + 4; k < x0 + w - 4; k += 14) { g.beginPath(); g.arc(k + 5, top + 1, 8, Math.PI, 0); g.fill(); }
    R(g, x0 - 2, top - 2, w + 4, h + 4, INK);
    for (let k = x0 + 4; k < x0 + w - 4; k += 14) { g.fillStyle = B[2]; g.beginPath(); g.arc(k + 5, top + 1, 6, Math.PI, 0); g.fill(); R(g, k + 1, top - 4, 3, 2, B[4]); R(g, k + 2, top - 5, 2, 1, '#FFFFFF'); }
    R(g, x0, top, w, h, B[2]);
    R(g, x0, top, w, 3, B[3]); R(g, x0, top, w, 1, B[4]); R(g, x0, top, 2, h, B[3]);
    for (let yy = top + 12; yy < top + h - 4; yy += 12) R(g, x0, yy, w, 1, B[1]);
    R(g, x0, top + h - 3, w, 3, B[1]); dither(g, x0, top + h - 7, w, 4, B[1]); R(g, x0 + w - 2, top, 2, h, B[1]);
    for (const sx of [x0 + 4, x0 + w - 7]) { R(g, sx, top + h - 10, 3, 3, B[0]); R(g, sx, top + h - 10, 1, 1, B[4]); }
    let yy = top + 6;
    lines.forEach((l, i) => { yy += signH(Ls[i]); signText(g, l, x, yy, Ls[i]); yy += 5; });
  };
  if (key) stamp(c, `wp-sign-${key}`, x - 200, feet - 140, 400, 144, draw); else draw(c);
};
/** A palm (three looks): its trunk in rings of bark, lit up its left, curving up; its fronds in three greens, each a spine
 *  with leaflets drooping off it, the under side darker; coconuts at the crown. Behind the play: a touch dimmed. */
const paintPalm = (g: Ctx, x: number, v: number) => {
  const lean = (v - 1) * 14, top = 196 + v * 8, bark = ramp5(back('#6E5034')), leaf = ramp5(back('#22663C'));
  const at = (t: number) => { const u = 1 - t; return [u * u * x + 2 * u * t * (x + lean * 0.4) + t * t * (x + lean), GY - top * t] as const; };
  for (let s = 0; s < top; s += 6) {
    const [cx, cy] = at(s / top), w = Math.round(13 - (s / top) * 5), l = Math.round(cx - w / 2);
    R(g, l - 1, cy - 6, 1, 7, INK); R(g, l + w, cy - 6, 1, 7, INK);
    R(g, l, cy - 6, w, 6, bark[2]); R(g, l, cy - 6, 3, 6, bark[3]); R(g, l, cy - 6, 1, 6, bark[4]); R(g, l + w - 3, cy - 6, 3, 6, bark[1]);
    // (its rings: a notch across, lit under, staggered)
    R(g, l + 1, cy - 6, w - 2, 1, bark[1]); R(g, l + ((s / 6) % 2 ? 2 : 4), cy - 5, w - 6, 1, bark[3]);
  }
  const [hx, hy] = at(1);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const fronds = 9;
  for (const pass of [0, 1]) for (let k = 0; k < fronds; k++) {
    // (the back fronds first (darker), the front ones over them)
    if ((k % 2) !== pass) continue;
    const a = Math.PI + (k / (fronds - 1)) * Math.PI + (hash(k + v * 9) - 0.5) * 0.2, len = 62 + hash(k * 3 + v) * 22;
    const tx = hx + Math.cos(a) * len, ty = hy + Math.sin(a) * len * 0.45 + 34 + Math.abs(Math.cos(a)) * 20;
    const mx = hx + Math.cos(a) * len * 0.5, my = hy + Math.sin(a) * len * 0.5 - 10, dir = Math.cos(a) < 0 ? -1 : 1;
    const L = pass ? leaf : leaf.map(cc => mix(cc, INK, 0.25));
    // (a frond: filled, its top edge along the spine, its leaflets hanging off it in a saw edge, toward its tip)
    const n = 14, spine: [number, number][] = [], upper: [number, number][] = [], lower: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t, px = u * u * hx + 2 * u * t * mx + t * t * tx, py = u * u * hy + 2 * u * t * my + t * t * ty;
      const w = 3 * (1 - t) + 1, ll = (18 - 12 * t) * (0.8 + 0.4 * hash(i + k * 13 + v));
      spine.push([px, py]); upper.push([px, py - w]);
      lower.push(i % 2 ? [px + dir * 5, py + ll] : [px, py + 2]);
    }
    const shape = [...upper, ...lower.reverse()];
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); shape.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.stroke();
    g.fillStyle = L[1]; g.fill();
    g.fillStyle = L[2]; g.beginPath(); [...upper, ...spine.slice().reverse().map(([px, py]) => [px, py + 4] as [number, number])].forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fill();
    along(g, spine, 0, 1.5, L[3]);
    along(g, upper.slice(0, 8), 0, 1, L[4]);
  }
  g.lineCap = 'butt'; g.lineJoin = 'miter';
  // (the coconuts)
  for (const [ox, oy] of [[-5, 6], [4, 7], [0, 11]] as const) { g.fillStyle = INK; g.beginPath(); g.arc(hx + ox, hy + oy, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = back('#5A3A1E'); g.beginPath(); g.arc(hx + ox, hy + oy, 4, 0, Math.PI * 2); g.fill(); R(g, hx + ox - 2, hy + oy - 2, 2, 2, back('#9A6A3A')); }
};
/** The gate's kit, as the lot paints it from the other side (endgame/lot/art.ts GATE: the colors exactly). */
const GTOWER = ['#0B2340', '#14345A', '#1E4A7A', '#2C64A0', '#3A7AB8', '#6AA4D8'];
const GCAP = ['#0E5A6E', '#0E8CA8', '#22D3EE', '#67E8F9', '#A5F3FC'];
const GARCH = ['#064A5E', '#06708A', '#0891B2', '#22B8D8', '#67E8F9', '#CFFAFE'];
const GBARS = ['#2A2E36', '#4A4E58', '#6A6E78', '#8A8E98', '#A4A8B2', '#C8CCD2'];
const GBRASS = ['#5C3A06', '#9A6A0E', '#D4A017', '#F2CC4A', '#FFF0A0'];
const GATE_TX = [-120, 210] as const, GATE_TW = 50, GATE_TH = 260;
/** The gate from inside, kicked down (stamped): its towers' backs in their blue stucco (lit down the left, banded joints,
 *  a staff door and an EXIT plaque on one, a breaker box on the other), their cyan caps in tiers; the arch's back, the
 *  wave in its steps, its plaque (COME BACK SOON); the gates themselves flat on the plaza, bars and spear tips, the
 *  chain still round them and its padlock. */
const paintGate = (g: Ctx) => {
  const B = GY, T = GTOWER, C = GCAP, A = GARCH;
  for (const tx of GATE_TX) {
    R(g, tx - 2, B - GATE_TH, GATE_TW + 4, GATE_TH, INK);
    R(g, tx, B - GATE_TH + 2, GATE_TW, GATE_TH - 2, T[2]);
    R(g, tx, B - GATE_TH + 2, 6, GATE_TH - 2, T[4]); R(g, tx + 6, B - GATE_TH + 2, 2, GATE_TH - 2, T[3]); dither(g, tx + 8, B - GATE_TH + 2, 2, GATE_TH - 2, T[3]);
    R(g, tx + GATE_TW - 10, B - GATE_TH + 2, 10, GATE_TH - 2, T[1]); dither(g, tx + GATE_TW - 12, B - GATE_TH + 2, 2, GATE_TH - 2, T[1]); R(g, tx + GATE_TW - 2, B - GATE_TH + 2, 2, GATE_TH - 2, T[0]);
    for (let k = 0; k < 8; k++) { R(g, tx, B - 236 + k * 30, GATE_TW, 2, T[0]); R(g, tx, B - 234 + k * 30, GATE_TW, 1, T[3]); }
    R(g, tx - 4, B - 26, GATE_TW + 8, 26, INK); R(g, tx - 3, B - 25, GATE_TW + 6, 25, T[1]); R(g, tx - 3, B - 25, GATE_TW + 6, 2, T[3]); dither(g, tx - 3, B - 10, GATE_TW + 6, 8, T[0]);
    const tiers: [number, number, number][] = [[-8, B - GATE_TH - 14, GATE_TW + 16], [-4, B - GATE_TH - 24, GATE_TW + 8], [0, B - GATE_TH - 32, GATE_TW]];
    for (const [dx, y, w] of tiers) { R(g, tx + dx - 1, y - 1, w + 2, 12, INK); R(g, tx + dx, y, w, 10, C[2]); R(g, tx + dx, y, w, 2, C[4]); R(g, tx + dx, y + 7, w, 3, C[1]); R(g, tx + dx, y + 2, 3, 5, C[3]); }
    const px = tx + GATE_TW / 2;
    poly(g, [[px - 7, B - GATE_TH - 32], [px - 2, B - GATE_TH - 50], [px + 8, B - GATE_TH - 44], [px + 2, B - GATE_TH - 42], [px + 6, B - GATE_TH - 32]], INK);
    poly(g, [[px - 5, B - GATE_TH - 33], [px - 1.5, B - GATE_TH - 47], [px + 5, B - GATE_TH - 44], [px + 1, B - GATE_TH - 41], [px + 4, B - GATE_TH - 33]], C[3]);
  }
  // (the left tower's staff door, its EXIT plaque; the right one's breaker box, its conduit up)
  { const dx = GATE_TX[0] + 10; R(g, dx - 1, B - 92, 32, 66, INK); R(g, dx, B - 91, 30, 65, '#3A4656'); R(g, dx, B - 91, 30, 2, '#6A7686'); R(g, dx + 2, B - 89, 1, 61, '#5A6676'); R(g, dx + 24, B - 60, 3, 3, GBRASS[3]);
    R(g, dx - 3, B - 112, 36, 14, INK); R(g, dx - 2, B - 111, 34, 12, '#7F1D1D'); signText(g, 'EXIT', dx + 15, B - 102, { sx: 1, sy: 1, fill: ['#FCA5A5', '#F87171', '#EF4444'], shadow: '#3A0A0A' }); }
  { const bx = GATE_TX[1] + 12; R(g, bx - 1, B - 120, 28, 36, INK); R(g, bx, B - 119, 26, 34, '#5A6470'); R(g, bx, B - 119, 26, 2, '#8A949E'); R(g, bx + 2, B - 110, 22, 1, '#3A424C'); R(g, bx + 10, B - 104, 6, 6, '#FACC15'); R(g, bx + 12, B - 102, 2, 2, INK); R(g, bx + 11, B - 230, 4, 111, '#3A424C'); R(g, bx + 11, B - 230, 1, 111, '#6A747E'); }
  // (the arch's back: the wave in its steps)
  const L0 = GATE_TX[0] + 20, R0 = GATE_TX[1] + 30, X = (L0 + R0) / 2;
  const arc = (dy: number) => { g.beginPath(); g.moveTo(L0, B - 236 + dy); g.quadraticCurveTo(X, B - 330 + dy, R0, B - 236 + dy); };
  g.lineCap = 'round';
  arc(0); g.strokeStyle = INK; g.lineWidth = 36; g.stroke();
  arc(1); g.strokeStyle = A[1]; g.lineWidth = 30; g.stroke();
  arc(-2); g.strokeStyle = A[2]; g.lineWidth = 22; g.stroke();
  arc(-8); g.strokeStyle = A[3]; g.lineWidth = 8; g.stroke();
  arc(-12); g.strokeStyle = A[4]; g.lineWidth = 4; g.stroke();
  arc(-14); g.strokeStyle = A[5]; g.lineWidth = 1.5; g.setLineDash([6, 5]); g.stroke(); g.setLineDash([]);
  arc(10); g.strokeStyle = A[0]; g.lineWidth = 6; g.stroke();
  g.lineCap = 'butt';
  // (its plaque at the top, held on it: what the way out says)
  R(g, X - 92, B - 294, 184, 28, INK); R(g, X - 91, B - 293, 182, 26, '#0B2A4A'); R(g, X - 91, B - 293, 182, 2, A[3]); R(g, X - 91, B - 269, 182, 2, '#061A30');
  for (const sx of [X - 87, X + 85]) R(g, sx, B - 289, 2, 2, GBRASS[3]);
  signText(g, 'COME BACK SOON', X, B - 275, { sx: 1, sy: 2, fill: rampDown('#FEF08A', 0.35), dither: true, shadow: '#3A2A06', gap: 1 });
  // (the gates, down flat (kicked in): seen edge on, a sliver of bars on the ground, the spear tips at their top's end,
  // the rails, the chain still round them, its padlock)
  R(g, -62, B - 7, 264, 7, INK); R(g, -60, B - 6, 260, 5, GBARS[2]); R(g, -60, B - 6, 260, 1, GBARS[5]); R(g, -60, B - 2, 260, 1, GBARS[0]);
  for (let x = -56; x < 196; x += 14) { R(g, x, B - 5, 4, 3, GBARS[4]); R(g, x, B - 5, 1, 3, GBARS[5]); }
  for (const rx of [-40, 60, 170]) { R(g, rx, B - 9, 8, 9, INK); R(g, rx + 1, B - 8, 6, 7, GBARS[3]); R(g, rx + 1, B - 8, 6, 1, GBARS[5]); }
  for (let k = 0; k < 4; k++) poly(g, [[200 + k * 3, B - 6], [206 + k * 3, B - 4 - k], [200 + k * 3, B - 2]], GBARS[4]);
  for (let k = 0; k < 6; k++) { g.strokeStyle = k % 2 ? '#9AA0AA' : '#C8CCD2'; g.lineWidth = 2; g.beginPath(); g.ellipse(52 + k * 7, B - 9, 4, 2.5, 0, 0, Math.PI * 2); g.stroke(); }
  R(g, 94, B - 15, 12, 10, INK); R(g, 95, B - 14, 10, 8, GBRASS[2]); R(g, 95, B - 14, 10, 2, GBRASS[4]); R(g, 99, B - 11, 2, 3, GBRASS[0]);
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(100, B - 15, 3.5, Math.PI, 0); g.stroke(); g.strokeStyle = GBARS[4]; g.lineWidth = 1.5; g.stroke();
};
/** A ticket booth (stamped, dimmed): pink stucco in its steps, its window smashed in (glass shards, the dark), a striped
 *  awning over it, a cresting-wave cap on top (no flat top: nothing to stand on), TICKETS on it in the park's letters,
 *  CLOSED on a card in the glass. */
const BOOTH = '#D84F92';
const paintBooth = (g: Ctx, x: number) => {
  const P = ramp5(back(BOOTH)), A = ramp5(back('#0EA5E9')), gl = back('#0B1220');
  R(g, x - 50, GY - 120, 100, 120, INK); R(g, x - 48, GY - 118, 96, 118, P[2]);
  R(g, x - 48, GY - 118, 6, 118, P[3]); R(g, x - 48, GY - 118, 2, 118, P[4]); R(g, x + 38, GY - 118, 10, 118, P[1]); dither(g, x + 36, GY - 118, 2, 118, P[1]);
  for (let y = GY - 98; y < GY - 16; y += 22) R(g, x - 48, y, 96, 1, P[1]);
  // (the window: its frame, the dark through it, the glass smashed (shards still in the frame), a CLOSED card)
  R(g, x - 38, GY - 98, 76, 44, P[0]); R(g, x - 36, GY - 96, 72, 40, gl);
  for (const s of [[[-36, -96], [-14, -96], [-30, -80]], [[36, -96], [14, -96], [24, -86], [36, -70]], [[-36, -56], [-24, -56], [-36, -68]], [[36, -56], [6, -56], [20, -64]]] as [number, number][][]) {
    poly(g, s.map(([a, b]) => [x + a, GY + b] as [number, number]), back('#3A5A7A'));
    g.strokeStyle = back('#BFE0FF'); g.lineWidth = 1; g.beginPath(); g.moveTo(x + s[1][0], GY + s[1][1]); g.lineTo(x + s[2][0], GY + s[2][1]); g.stroke();
  }
  R(g, x - 10, GY - 74, 26, 14, back('#F1EFEA')); signText(g, 'CLOSED', x + 3, GY - 64, { sx: 1, sy: 1, fill: back('#B91C1C') });
  // (the counter under it, the kick plate along the foot)
  R(g, x - 42, GY - 54, 84, 5, P[0]); R(g, x - 42, GY - 54, 84, 1, P[1]);
  R(g, x - 48, GY - 18, 96, 18, P[1]); dither(g, x - 48, GY - 22, 96, 4, P[1]); R(g, x - 48, GY - 4, 96, 4, P[0]);
  // (the awning over the window: stripes, scalloped)
  for (let k = 0; k < 10; k++) { const ax = x - 44 + k * 9; R(g, ax, GY - 108, 9, 8, k % 2 ? P[4] : A[2]); g.fillStyle = k % 2 ? P[4] : A[2]; g.beginPath(); g.arc(ax + 4.5, GY - 100, 4.5, 0, Math.PI); g.fill(); }
  R(g, x - 44, GY - 109, 90, 2, INK);
  // (the cap: a wave cresting over it, TICKETS on its board)
  poly(g, [[x - 58, GY - 116], [x - 50, GY - 136], [x - 20, GY - 150], [x + 26, GY - 148], [x + 54, GY - 134], [x + 46, GY - 128], [x + 58, GY - 116]], INK);
  poly(g, [[x - 55, GY - 118], [x - 48, GY - 134], [x - 20, GY - 147], [x + 25, GY - 145], [x + 50, GY - 134], [x + 42, GY - 129], [x + 55, GY - 118]], A[2]);
  poly(g, [[x - 48, GY - 134], [x - 20, GY - 147], [x + 25, GY - 145], [x + 20, GY - 140], [x - 18, GY - 141], [x - 44, GY - 130]], A[4]);
  R(g, x - 55, GY - 121, 110, 3, A[0]);
  R(g, x - 36, GY - 136, 72, 14, INK); R(g, x - 35, GY - 135, 70, 12, back('#F8FAFC'));
  signText(g, 'TICKETS', x, GY - 125, { sx: 1, sy: 1, fill: [back('#0E7490'), back('#155E75')], shadow: back('#A5F3FC') });
};
/** A food stand (stamped, dimmed): its hut in its paint's steps, a striped awning, the shutter half down, its board, and
 *  on its roof the thing it sells, giant and fiberglass (round: nothing to stand on). */
const paintStand = (g: Ctx, x: number, kind: 'dogs' | 'sno') => {
  const body = ramp5(back(kind === 'dogs' ? '#E8B83A' : '#7DD3FC')), st = ramp5(back(kind === 'dogs' ? '#DC2626' : '#DB2777')), wht = back('#F1EFEA');
  R(g, x - 46, GY - 96, 92, 96, INK); R(g, x - 44, GY - 94, 88, 94, body[2]); R(g, x - 44, GY - 94, 5, 94, body[3]); R(g, x + 34, GY - 94, 10, 94, body[1]); dither(g, x + 32, GY - 94, 2, 94, body[1]);
  R(g, x - 36, GY - 76, 72, 30, back('#140E0A')); for (let y = GY - 76; y < GY - 60; y += 3) R(g, x - 36, y, 72, 2, body[1]);
  R(g, x - 38, GY - 46, 76, 5, body[0]);
  R(g, x - 44, GY - 16, 88, 16, body[1]); R(g, x - 44, GY - 3, 88, 3, body[0]);
  for (let k = 0; k < 10; k++) { const ax = x - 46 + k * 9.4; R(g, ax, GY - 88, 9.4, 8, k % 2 ? wht : st[2]); g.fillStyle = k % 2 ? wht : st[2]; g.beginPath(); g.arc(ax + 4.7, GY - 80, 4.7, 0, Math.PI); g.fill(); }
  signText(g, kind === 'dogs' ? '$19' : 'BLUE OR RED', x, GY - 26, { sx: 1, sy: 1, fill: st[1] });
  if (kind === 'dogs') {
    // (the giant hot dog: bun, sausage, the mustard zig-zag)
    const bun = ramp5(back('#D9933E')), dog = ramp5(back('#B3412A'));
    g.fillStyle = INK; g.beginPath(); g.ellipse(x, GY - 118, 46, 12, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = dog[2]; g.beginPath(); g.ellipse(x, GY - 122, 44, 7, 0, 0, Math.PI * 2); g.fill(); R(g, x - 36, GY - 127, 72, 2, dog[4]);
    g.fillStyle = bun[2]; g.beginPath(); g.ellipse(x, GY - 116, 40, 8, 0, 0, Math.PI); g.fill(); R(g, x - 34, GY - 117, 68, 2, bun[4]); R(g, x - 30, GY - 111, 60, 2, bun[1]);
    g.strokeStyle = back('#FACC15'); g.lineWidth = 2; g.beginPath(); for (let k = 0; k < 9; k++) g.lineTo(x - 32 + k * 8, GY - 124 + (k % 2) * 4); g.stroke();
  } else {
    // (the giant sno-cone: the paper cone, the ice in a ball, its syrup)
    const cone = ramp5(back('#F1EFEA')), ice = ramp5(back('#3B82F6'));
    poly(g, [[x - 20, GY - 128], [x + 20, GY - 128], [x, GY - 98]], INK); poly(g, [[x - 18, GY - 127], [x + 18, GY - 127], [x, GY - 100]], cone[2]); poly(g, [[x - 18, GY - 127], [x - 8, GY - 127], [x, GY - 100]], cone[4]);
    g.fillStyle = INK; g.beginPath(); g.arc(x, GY - 136, 23, 0, Math.PI * 2); g.fill();
    g.fillStyle = ice[1]; g.beginPath(); g.arc(x, GY - 136, 21, 0, Math.PI * 2); g.fill();
    g.fillStyle = ice[2]; g.beginPath(); g.arc(x - 3, GY - 139, 16, 0, Math.PI * 2); g.fill();
    g.fillStyle = back('#DC2626'); g.beginPath(); g.arc(x + 6, GY - 140, 9, 0, Math.PI * 2); g.fill();
    R(g, x - 10, GY - 150, 5, 4, ice[4]);
  }
  // (its board, over the roof's front)
  R(g, x - 40, GY - 110, 80, 18, INK); R(g, x - 39, GY - 109, 78, 16, wht);
  signText(g, kind === 'dogs' ? 'HOT DOGS' : 'SNO-CONES', x, GY - 97, { sx: 1, sy: 1, fill: [st[3], st[2], st[1]], shadow: st[0] });
};
/** The lockers (stamped, dimmed): a bank of them in their steel steps, vents, numbers, one hanging open; their top
 *  sloped (nothing to stand on), LOCKERS on a plaque, the rate. */
const paintLockers = (g: Ctx, x: number) => {
  const S = ramp5(back('#4A7A9A'));
  poly(g, [[x - 2, GY - 90], [x + 92, GY - 104], [x + 92, GY], [x - 2, GY]], INK);
  poly(g, [[x, GY - 88], [x + 90, GY - 102], [x + 90, GY - 96], [x, GY - 82]], S[0]);
  for (let k = 0; k < 6; k++) {
    const lx = x + k * 15;
    R(g, lx + 1, GY - 80, 13, 76, k === 4 ? back('#0E141A') : S[2]);
    if (k !== 4) { R(g, lx + 1, GY - 80, 2, 76, S[3]); R(g, lx + 12, GY - 80, 2, 76, S[1]); for (let v = 0; v < 4; v++) R(g, lx + 4, GY - 74 + v * 3, 7, 1, S[0]); R(g, lx + 10, GY - 44, 2, 5, S[4]); R(g, lx + 4, GY - 60, 6, 4, back('#E2E8F0')); }
    else { poly(g, [[lx + 1, GY - 80], [lx - 8, GY - 84], [lx - 8, GY - 2], [lx + 1, GY - 4]], S[3]); R(g, lx - 6, GY - 70, 5, 2, S[0]); }
  }
  R(g, x, GY - 4, 90, 4, S[0]);
  R(g, x + 14, GY - 116, 62, 22, INK); R(g, x + 15, GY - 115, 60, 20, back('#FDE047'));
  R(g, x + 24, GY - 94, 2, 6, INK); R(g, x + 64, GY - 94, 2, 6, INK);
  signText(g, 'LOCKERS', x + 45, GY - 107, { sx: 1, sy: 1, fill: back('#1E293B') }); signText(g, '$8 AN HOUR', x + 45, GY - 98, { sx: 1, sy: 1, fill: back('#B91C1C') });
};
/** Loungers and an umbrella (stamped, dimmed): the chairs' white frames, their straps, a towel; the umbrella's pole and
 *  its striped dome (round: nothing to stand on). */
const paintLoungers = (g: Ctx, x: number, seed: number) => {
  const F = ramp5(back('#E8E4DA')), U = ramp5(back(['#F97316', '#0891B2', '#DB2777'][seed % 3]));
  for (const lx of [x, x + 64]) {
    R(g, lx, GY - 14, 52, 3, INK); R(g, lx, GY - 14, 52, 2, F[3]);
    poly(g, [[lx + 40, GY - 14], [lx + 56, GY - 34], [lx + 59, GY - 32], [lx + 44, GY - 12]], F[2]);
    for (let k = 0; k < 6; k++) R(g, lx + 4 + k * 7, GY - 15, 4, 3, k % 2 ? back('#38BDF8') : back('#F8FAFC'));
    for (const fx of [lx + 4, lx + 44]) R(g, fx, GY - 12, 2, 12, F[1]);
  }
  R(g, x + 70, GY - 16, 26, 3, back('#FACC15'));
  const ux = x + 56;
  R(g, ux - 1, GY - 96, 3, 96, F[1]); R(g, ux - 1, GY - 96, 1, 96, F[4]);
  g.fillStyle = INK; g.beginPath(); g.ellipse(ux, GY - 96, 52, 20, 0, Math.PI, 0); g.fill();
  for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? F[4] : U[2]; g.beginPath(); g.moveTo(ux, GY - 116); g.ellipse(ux, GY - 96, 50, 18, 0, Math.PI + (k / 8) * Math.PI, Math.PI + ((k + 1) / 8) * Math.PI); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(10, 12, 30, 0.25)'; g.beginPath(); g.moveTo(ux, GY - 116); g.ellipse(ux, GY - 96, 50, 18, 0, Math.PI * 1.5, Math.PI * 2); g.closePath(); g.fill();
  R(g, ux - 50, GY - 97, 100, 2, U[0]); R(g, ux - 2, GY - 120, 4, 4, F[3]);
};
/** Trash cans (stamped, dimmed): drums painted like lifebuoys, domed lids (nothing to stand on). */
const paintCans = (g: Ctx, x: number) => {
  for (const cx of [x, x + 34]) {
    R(g, cx - 13, GY - 44, 26, 44, INK); R(g, cx - 12, GY - 43, 24, 43, back('#F1EFEA')); R(g, cx - 12, GY - 30, 24, 10, back('#DC2626')); R(g, cx - 12, GY - 43, 4, 43, back('#FFFFFF')); R(g, cx + 6, GY - 43, 6, 43, back('#B8B4AE'));
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx, GY - 44, 15, 8, 0, Math.PI, 0); g.fill(); g.fillStyle = back('#4A5A6A'); g.beginPath(); g.ellipse(cx, GY - 44, 13, 6, 0, Math.PI, 0); g.fill(); R(g, cx - 8, GY - 48, 5, 2, back('#8A9AAA'));
  }
};
/** The plaza's light poles (where parkLamps' lights are: a pole under each, stamped): steel in steps, a lantern up top. */
const paintLamp = (g: Ctx, x: number, on: boolean) => {
  const S = ramp5(back('#4A525E'));
  R(g, x - 3, GY - 156, 6, 156, INK); R(g, x - 2, GY - 156, 4, 156, S[2]); R(g, x - 2, GY - 156, 1, 156, S[4]); R(g, x + 1, GY - 156, 1, 156, S[0]);
  R(g, x - 6, GY - 12, 12, 12, INK); R(g, x - 5, GY - 11, 10, 11, S[1]); R(g, x - 5, GY - 11, 10, 1, S[3]);
  R(g, x - 9, GY - 172, 18, 4, INK); R(g, x - 8, GY - 171, 16, 2, S[3]);
  R(g, x - 7, GY - 168, 14, 12, INK); R(g, x - 6, GY - 167, 12, 10, on ? '#FFE8A8' : S[1]); if (on) { R(g, x - 4, GY - 165, 4, 6, '#FFF8E0'); R(g, x + 2, GY - 167, 4, 10, '#E8C070'); }
  R(g, x - 2, GY - 176, 4, 4, S[2]);
};
/** Where the plaza's stands, lockers, loungers and cans are (world x of their left or middle). */
const PROPS: { x: number; kind: 'dogs' | 'sno' | 'lockers' | 'loungers' | 'cans'; w: number }[] = [
  { x: 950, kind: 'dogs', w: 50 }, { x: 1960, kind: 'loungers', w: 120 }, { x: 4160, kind: 'lockers', w: 92 },
  { x: 5210, kind: 'loungers', w: 120 }, { x: 16480, kind: 'sno', w: 50 }, { x: 19110, kind: 'cans', w: 50 },
];
/** Where the plaza's signs stand (no palm in front of one). */
/** (the Wipeout's, left of the lifeguard stand: at its stairs' foot it was behind the stand; the tubes', clear of their stairs) */
const slideSignX = (S: Slide) => (S.id === 'wipeout1' ? 16880 : S.stairs.x - 90), tubeSignX = (T: Tube) => T.stairs.x - 110;
const SIGN_X = [...SLIDES.filter(S => S.stairs.n > 0).map(slideSignX), ...TUBES.map(tubeSignX), 4600, 520, 760, ...PROPS.map(p => p.x + (p.kind === 'loungers' || p.kind === 'lockers' ? 50 : 0))];
/** The tiki hut (its roof the ledge: lit along its top): bamboo posts, the thatch and its fringe, the bar under it (its
 *  front bamboo, its top dimmed: not stood on), a carved tiki on the post, TIKI BAR on its front. */
const paintTiki = (g: Ctx, x: number, y: number, w: number) => {
  const bam = ramp5('#A8843E'), th = ramp5('#B8862E');
  for (const px of [x + 10, x + w - 18]) { R(g, px - 1, y + 14, 10, GY - y - 14, INK); R(g, px, y + 14, 8, GY - y - 14, bam[2]); R(g, px, y + 14, 2, GY - y - 14, bam[3]); R(g, px + 6, y + 14, 2, GY - y - 14, bam[1]); for (let yy = y + 30; yy < GY - 4; yy += 20) { R(g, px, yy, 8, 2, bam[0]); R(g, px, yy + 2, 8, 1, bam[4]); } }
  // (the bar under it: its front in bamboo, its counter (dimmed), bottles on the back shelf)
  const bx = x + 26, bw = w - 52;
  R(g, bx, GY - 74, bw, 2, back('#5A4028')); for (let k = 0; k < 6; k++) { const cx = bx + 6 + k * (bw - 12) / 5; R(g, cx, GY - 86, 4, 12, back(['#16A34A', '#B45309', '#7C2D12', '#0891B2'][k % 4])); R(g, cx + 1, GY - 90, 2, 4, back('#D6D3D1')); }
  R(g, bx - 2, GY - 52, bw + 4, 6, INK); R(g, bx - 1, GY - 51, bw + 2, 4, back(th[1]));
  for (let k = 0; k < bw; k += 7) { R(g, bx + k, GY - 46, 7, 46, INK); R(g, bx + k + 1, GY - 46, 5, 46, back(bam[k % 14 ? 2 : 1])); R(g, bx + k + 1, GY - 46, 1, 46, back(bam[3])); R(g, bx + k + 1, GY - 24, 5, 1, back(bam[0])); }
  R(g, bx + bw / 2 - 34, GY - 40, 68, 14, INK); R(g, bx + bw / 2 - 33, GY - 39, 66, 12, back('#3A2410'));
  signText(g, 'TIKI BAR', bx + bw / 2, GY - 30, { sx: 1, sy: 1, fill: ['#FDE68A', '#F59E0B', '#B45309'], shadow: INK });
  // (a tiki carved on the left post: its brow, eyes, the grin)
  { const tx = x + 14; R(g, tx - 7, y + 34, 14, 30, INK); R(g, tx - 6, y + 35, 12, 28, '#7A5230'); R(g, tx - 6, y + 35, 12, 3, '#A8764A'); R(g, tx - 4, y + 41, 3, 3, '#FDE68A'); R(g, tx + 1, y + 41, 3, 3, '#FDE68A'); R(g, tx - 4, y + 52, 8, 4, INK); R(g, tx - 3, y + 53, 6, 1, '#F8FAFC'); }
  // (the thatch: the roof he stands on: its top lit, the straw in its steps, its fringe hanging ragged)
  R(g, x - 4, y, w + 8, 16, INK);
  R(g, x - 3, y + 1, w + 6, 14, th[2]);
  for (let k = 0; k < w + 6; k += 4) R(g, x - 3 + k, y + 4 + (k % 8 ? 0 : 2), 1, 9, th[1]);
  R(g, x - 3, y + 1, w + 6, 2, '#FFF2B0'); R(g, x - 3, y + 3, w + 6, 2, th[4]);
  for (let k = 0; k < w + 8; k += 5) { const l = 8 + hash(x + k) * 10; poly(g, [[x - 4 + k, y + 15], [x + 1 + k, y + 15], [x - 1 + k, y + 15 + l]], k % 10 ? th[1] : th[0]); }
};
/** The lifeguard stand (its seat platform the ledge: lit along its top): white-painted wood in its steps, its A-frame legs
 *  braced, a ladder up the left, the red cross on its skirt, an OFF DUTY card hung under it. */
const paintGuard = (g: Ctx, x: number, y: number, w: number) => {
  const F = ramp5('#E2DED2');
  const leg = (x0: number, x1: number) => { g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(x0, y + 12); g.lineTo(x1, GY); g.stroke(); g.strokeStyle = F[2]; g.lineWidth = 6; g.stroke(); g.strokeStyle = F[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 - 2, y + 12); g.lineTo(x1 - 2, GY); g.stroke(); };
  leg(x + 16, x + 4); leg(x + w - 16, x + w - 4); leg(x + 34, x + 30); leg(x + w - 34, x + w - 30);
  g.strokeStyle = F[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 12, y + 40); g.lineTo(x + w - 12, GY - 20); g.moveTo(x + w - 12, y + 40); g.lineTo(x + 12, GY - 20); g.stroke();
  for (let yy = y + 26; yy < GY - 6; yy += 14) { R(g, x + 6, yy, 26, 3, INK); R(g, x + 7, yy, 24, 2, F[3]); }
  // (the platform: the ledge, lit along its top; its skirt, the red cross)
  R(g, x - 2, y - 1, w + 4, 14, INK); R(g, x - 1, y, w + 2, 12, F[2]); R(g, x - 1, y, w + 2, 2, '#FFFFFF'); R(g, x - 1, y + 2, w + 2, 1, F[4]); R(g, x - 1, y + 9, w + 2, 3, F[1]);
  R(g, x + 8, y + 12, w - 16, 18, INK); R(g, x + 9, y + 12, w - 18, 17, F[1]); R(g, x + 9, y + 12, w - 18, 2, F[3]);
  const cx = x + w / 2; R(g, cx - 3, y + 14, 6, 13, '#DC2626'); R(g, cx - 7, y + 18, 14, 5, '#DC2626'); R(g, cx - 3, y + 14, 2, 13, '#F87171');
  R(g, cx + 22, y + 30, 1, 8, INK); R(g, cx + 44, y + 30, 1, 8, INK);
  R(g, cx + 18, y + 38, 30, 12, INK); R(g, cx + 19, y + 39, 28, 10, '#FDE047');
  signText(g, 'OFF DUTY', cx + 33, y + 47, { sx: 1, sy: 1, fill: '#7F1D1D' });
};
/** The Wipeout's island (stood on: a lit top): poured concrete in its steps from its top down into the pit, the pour
 *  lines, its orange band, the rebar stubs, darker going down. */
const paintIsland = (g: Ctx, x: number, y: number, w: number) => {
  const h = GY + 400 - y, C = PAVE;
  R(g, x, y, w, h, C[2]); R(g, x, y, 4, h, C[4]); R(g, x + 4, y, 2, h, C[3]); R(g, x + w - 8, y, 8, h, C[1]); dither(g, x + w - 10, y, 2, h, C[1]);
  for (let yy = y + 24; yy < y + h; yy += 26) { R(g, x, yy, w, 1, C[1]); R(g, x, yy + 1, w, 1, C[3]); }
  R(g, x, y + 8, w, 12, '#C2410C'); R(g, x, y + 8, w, 2, '#FB923C'); R(g, x, y + 18, w, 2, '#7C2D12');
  for (let k = 0; k < w; k += 20) R(g, x + k + 4, y + 10, 8, 8, '#7C2D12');
  R(g, x, y, w, 2, '#FFF6E2'); R(g, x, y + 2, w, 3, C[5]); R(g, x, y + 5, w, 2, C[4]);
  hazeBands(g, x, y + 220, w, h - 220, '#0B0606', 0, 0.7, 5);
};
/** The plaza's back props (behind him, dimmed: nothing here to stand on), the signs, the stood-on huts. */
const drawProps = (c: Ctx, state: GameState) => {
  const busy = (x: number, m: number) => SIGN_X.some(sx => Math.abs(sx - x) < m) || [...SLIDES, ...TUBES].some(S => x > S.stairs.x - 40 && x < S.deck.x2 + 40) || LEDGES.some(([lx, , lw]) => x > lx - 60 && x < lx + lw + 60);
  // (each area's own near background, furthest back (zones.ts))
  drawZonesBack(c, state, (a, b) => vis(state, a, b));
  // (palms, every so often, back from the path: not in the areas with no place for one (the road, the hangar's plate,
  // the starship deck, the deep))
  for (let x = Math.floor((state.camera.x - 200) / 520) * 520 + 130; x < state.camera.x + W + 200; x += 520) {
    const z = groundAt(x);
    if (z === 'road' || z === 'plate' || z === 'deck' || z === 'sea') continue;
    if (GROUND.every(([a, b]) => x < a + 40 || x > b - 40) || (x > TOWER.TL - 600 && x < TOWER.TR + 300) || (x > -220 && x < 440)) continue;
    // (never over a sign, a slide's stairs or a booth)
    if (busy(x, 160)) continue;
    const v = Math.floor(x / 520) % 3;
    c.save(); c.translate(x, 0); stamp(c, `wp-palm-${v}`, -110, GY - 262, 220, 264, g => paintPalm(g, 0, v)); c.restore();
  }
  // (the light poles, under the lamps' lights: on the ground, clear of the signs, the stairs, the props)
  const on = lampGlow() > 0.3;
  for (let x = Math.floor((state.camera.x - 300) / 700) * 700 + 350; x < state.camera.x + W + 300; x += 700) {
    if (TUBES.some(T => x > tubeSpan(T)[0] - 200 && x < tubeSpan(T)[1]) || GROUND.every(([a, b]) => x < a + 20 || x > b - 20) || busy(x, 70) || SLIDES.some(S => x > S.pts[0][0] - 20 && x < S.pts[S.pts.length - 1][0] + 20) || (x > -220 && x < 440) || (x > TOWER.TL - 100)) continue;
    c.save(); c.translate(x, 0); stamp(c, `wp-lamp-${on ? 1 : 0}`, -12, GY - 180, 24, 182, g => paintLamp(g, 0, on)); c.restore();
  }
  // (the gate, kicked down: its towers' side faces, then the towers, the arch and the gates flat on the plaza)
  if (vis(state, -200, 420)) {
    for (const tx of GATE_TX) faces(c, state, tx - 2, tx + GATE_TW + 2, GY - GATE_TH, back(GTOWER[2]), 0.92);
    stamp(c, 'wp-gate', -200, GY - 336, 620, 342, paintGate);
  }
  // (the ticket booths, smashed; the turnstiles between them)
  for (const x of [520, 760]) if (vis(state, x - 80, x + 80)) { faces(c, state, x - 50, x + 50, GY - 120, back(BOOTH), 0.92); stamp(c, `wp-booth-${x}`, x - 70, GY - 160, 140, 162, g => paintBooth(g, x)); }
  if (vis(state, 580, 700)) stamp(c, 'wp-turnstiles', 580, GY - 50, 120, 52, g => {
    const S = ramp5(back('#8A8E98'));
    for (const tx of [596, 640, 684]) { R(g, tx - 5, GY - 38, 10, 38, INK); R(g, tx - 4, GY - 37, 8, 37, S[2]); R(g, tx - 4, GY - 37, 2, 37, S[4]); R(g, tx + 2, GY - 37, 2, 37, S[1]); for (const a of [-1, 1]) { R(g, tx + a * 4, GY - 30, a * 14, 3, INK); R(g, tx + a * 4, GY - 30, a * 13, 2, S[3]); } R(g, tx - 6, GY - 42, 12, 5, INK); R(g, tx - 5, GY - 41, 10, 3, back('#DC2626')); }
  });
  // (the stands, the lockers, the loungers, the cans)
  for (const p of PROPS) {
    if (!vis(state, p.x - 80, p.x + 140)) continue;
    if (p.kind === 'dogs' || p.kind === 'sno') { faces(c, state, p.x - 46, p.x + 46, GY - 96, back(p.kind === 'dogs' ? '#E8B83A' : '#7DD3FC'), 0.92); stamp(c, `wp-stand-${p.x}`, p.x - 60, GY - 164, 120, 166, g => paintStand(g, p.x, p.kind as 'dogs' | 'sno')); }
    else if (p.kind === 'lockers') { faces(c, state, p.x - 2, p.x + 92, GY - 90, back('#4A7A9A'), 0.94); stamp(c, `wp-lockers-${p.x}`, p.x - 14, GY - 120, 120, 122, g => paintLockers(g, p.x)); }
    else if (p.kind === 'loungers') stamp(c, `wp-loungers-${p.x}`, p.x - 4, GY - 124, 140, 126, g => paintLoungers(g, p.x, Math.floor(p.x / 100)));
    else stamp(c, `wp-cans-${p.x}`, p.x - 20, GY - 56, 76, 58, g => paintCans(g, p.x));
  }
  // (the slides' and tubes' signs, at their stairs' foot)
  for (const S of SLIDES) if (S.stairs.n > 0 && vis(state, slideSignX(S) - 130, slideSignX(S) + 130)) sign(c, slideSignX(S), GY, [S.name, S.id === 'squirt' ? 'RIDE IT. FLY.' : S.id === 'kamikaze' ? 'NOT FOR CHILDREN' : S.id === 'twister' ? 'MIND THE CRATER' : 'KEEP ARMS IN'], '#9A3412', '#FEF3C7', S.id);
  for (const T of TUBES) if (vis(state, tubeSignX(T) - 130, tubeSignX(T) + 130)) sign(c, tubeSignX(T), GY, [T.name, 'TUBES ONLY', 'MIND THE GAPS'], '#3730A3', '#E0E7FF', T.id);
  if (vis(state, 4500, 4720)) sign(c, 4600, GY, ['THE LAGOON', 'NO DIVING'], '#0E7490', '#FEF3C7', 'lagoon');
  // (the tiki hut under its roof ledge, the lifeguard stand: their tops lit, they're stood on)
  LEDGES.forEach(([x, y, w], i) => { if (vis(state, x - 20, x + w + 20)) stamp(c, `wp-ledge-${x}`, x - 10, y - 4, w + 20, GY - y + 6, g => (i === 0 ? paintTiki : paintGuard)(g, x, y, w)); });
};

// ---------------------------------------------------------------------------------------------------------------
// The slides

/** The plaza slides' chute (the SNES pass; the tube rides' and the descent's have their own): its back half a
 *  round trough in its plastic's steps (shade under, the body, the lit inner rim along its top, a glint), its sections'
 *  joints banded; the water in it in steps (deep, the run, the foam flecked along it). Within chuteBack's own bounds. */
const slideBack = (g: Ctx, pts: [number, number][], col: string) => {
  const C = ramp5(col);
  g.lineCap = 'round'; g.lineJoin = 'round';
  along(g, pts, -4, 24, INK);
  along(g, pts, -4, 20, C[1]);
  along(g, pts, -6, 14, C[2]);
  along(g, pts, -11, 4, C[3]);
  along(g, pts, -12, 1.5, C[4], [10, 6]);
  along(g, pts, 4, 3, C[0]);
  along(g, pts, -4, 20, C[0], [2, 46]);
  // (the water: the deep of it, the run, foam flecked along)
  along(g, pts, -3, 7, '#2A78C0');
  along(g, pts, -3, 5, 'rgba(120, 205, 255, 0.95)');
  along(g, pts, -5, 2, '#E0F2FE');
  along(g, pts, -4, 2, '#FFFFFF', [3, 11]);
  g.lineCap = 'butt'; g.lineJoin = 'miter';
};
/** ...its near wall (in front of him): in its steps, the lit lip along its top, the joints banded. Within chuteFront's. */
const slideFront = (g: Ctx, pts: [number, number][], col: string) => {
  const C = ramp5(col);
  g.lineCap = 'round'; g.lineJoin = 'round';
  along(g, pts, 2, 15, INK);
  along(g, pts, 2, 11, C[1]);
  along(g, pts, 0.5, 7, C[2]);
  along(g, pts, -2, 2.5, C[3]);
  along(g, pts, -3, 1, C[4]);
  along(g, pts, 6, 2, C[0]);
  along(g, pts, 2, 11, C[0], [2, 46]);
  g.lineCap = 'butt'; g.lineJoin = 'miter';
};
const boundsOf = (pts: [number, number][], pad = 40) => {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, w: Math.max(...xs) - Math.min(...xs) + pad * 2, h: Math.max(...ys) - Math.min(...ys) + pad * 2 };
};
/** Steel, in its steps (the slides' legs, stairs and towers). */
const STEEL = ramp5('#56647A');
/** A slide's tower (the plaza's and the tube rides'): its stairs (lit treads, a riveted stringer, ribbed panels under), the
 *  steel tower under the deck (ribbed, riveted, its pilasters, the ride's color banded round it), the rail up the stairs
 *  and along the deck, the peaked striped canopy over it. (The deck's own lit top: the caller's.) */
const paintTower = (g: Ctx, st: Stairs, d: { x1: number; x2: number; y: number }, col: string) => {
  const St = STEEL;
  // (the stairs: a solid run of steel steps; each tread's nose lit (he walks up them), the risers shaded, the
  // stringer along the noses riveted, the panels under it ribbed)
  for (let i = 0; i < st.n; i++) {
    const s = step(st, i);
    R(g, s.x, s.y, s.w, s.h, St[1]);
    for (let yy = s.y + 14; yy < GY; yy += 24) R(g, s.x, yy, s.w, 1, St[0]);
    R(g, s.x, s.y, 1, Math.min(10, s.h), St[0]);
    R(g, s.x, s.y, s.w, 2, '#F1F5F9'); R(g, s.x, s.y + 2, s.w, 2, St[4]); R(g, s.x, s.y + 4, s.w, 2, St[2]); R(g, s.x, s.y + 6, s.w, 1, St[0]);
  }
  dither(g, st.x, GY - 16, st.n * st.run, 16, St[0]);
  g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(st.x, GY - 6); g.lineTo(d.x1, d.y + 18); g.stroke();
  g.strokeStyle = St[2]; g.lineWidth = 6; g.stroke();
  g.strokeStyle = St[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(st.x, GY - 9); g.lineTo(d.x1, d.y + 15); g.stroke();
  for (let k = 1; k < st.n; k += 2) { const s = step(st, k); R(g, s.x + 2, s.y + 18, 2, 2, St[4]); }
  // (the tower under the deck: steel panels, ribbed, riveted, its pilasters, the slide's color banded round it)
  R(g, d.x1, d.y, d.x2 - d.x1, GY - d.y, St[1]);
  R(g, d.x1, d.y, 4, GY - d.y, St[3]); R(g, d.x1, d.y, 1, GY - d.y, St[4]); R(g, d.x2 - 6, d.y, 6, GY - d.y, St[0]); dither(g, d.x2 - 10, d.y, 4, GY - d.y, St[0]);
  for (let y = d.y + 24; y < GY; y += 24) { R(g, d.x1 + 4, y, d.x2 - d.x1 - 10, 2, St[0]); R(g, d.x1 + 4, y + 2, d.x2 - d.x1 - 10, 1, St[2]); for (let x = d.x1 + 10; x < d.x2 - 8; x += 14) R(g, x, y - 4, 2, 2, St[3]); }
  const Cc = ramp5(col);
  R(g, d.x1, d.y + 10, d.x2 - d.x1, 8, Cc[2]); R(g, d.x1, d.y + 10, d.x2 - d.x1, 2, Cc[4]); R(g, d.x1, d.y + 16, d.x2 - d.x1, 2, Cc[0]);
  dither(g, d.x1, GY - 40, d.x2 - d.x1, 40, St[0]);
  // (the rail up the stairs and along the deck: a steel tube, its posts every other step)
  for (let k = 0; k < st.n; k += 2) { const s = step(st, k); R(g, s.x + 4, s.y - 38, 2, 38, St[2]); }
  for (const px of [d.x1 + 6, (d.x1 + d.x2) / 2]) R(g, px, d.y - 38, 2, 38, St[2]);
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(st.x, GY - 40); g.lineTo(d.x1, d.y - 40); g.lineTo(d.x2 - 10, d.y - 40); g.stroke();
  g.strokeStyle = St[4]; g.lineWidth = 2; g.stroke();
  // (the canopy over the deck: its posts, a peaked roof in the slide's color, striped, stepped (no flat top), a pennant)
  R(g, d.x1 - 1, d.y - 100, 5, 100, INK); R(g, d.x1, d.y - 100, 3, 100, St[3]); R(g, d.x2 - 5, d.y - 100, 5, 100, INK); R(g, d.x2 - 4, d.y - 100, 3, 100, St[2]);
  const mx = (d.x1 + d.x2) / 2, L = d.x1 - 12, Rr = d.x2 + 12;
  poly(g, [[L - 2, d.y - 98], [mx, d.y - 124], [Rr + 2, d.y - 98]], INK);
  poly(g, [[L, d.y - 99], [mx, d.y - 121], [mx, d.y - 99]], Cc[3]);
  poly(g, [[mx, d.y - 121], [Rr, d.y - 99], [mx, d.y - 99]], Cc[1]);
  for (let k = 1; k < 6; k += 2) { const ax = L + ((Rr - L) * k) / 6; poly(g, [[ax, d.y - 99], [mx, d.y - 121], [ax + (Rr - L) / 6, d.y - 99]], k < 3 ? '#F8FAFC' : '#C8CCD6'); }
  for (let x = L; x < Rr; x += 8) { g.fillStyle = INK; g.beginPath(); g.arc(x + 4, d.y - 98, 4, 0, Math.PI); g.fill(); g.fillStyle = Cc[2]; g.beginPath(); g.arc(x + 4, d.y - 98, 3, 0, Math.PI); g.fill(); }
  R(g, mx - 1, d.y - 140, 2, 20, St[2]); poly(g, [[mx + 1, d.y - 140], [mx + 16, d.y - 135], [mx + 1, d.y - 130]], Cc[3]);
};
const drawSlideBack = (c: Ctx, state: GameState, S: Slide) => {
  const b = boundsOf(S.pts, 30), x0 = S.stairs.x, x1 = b.x + b.w;
  if (!vis(state, x0 - 40, x1)) return;
  const d = S.deck;
  // (the tower under the deck: its side face, toward the eye (live), behind its front)
  if (S.stairs.n > 0) sideFace(c, eyeOf(state), d.x2, 1, d.y, GY, 0.94, STEEL[1]);
  stamp(c, `wp-slide-${S.id}`, x0 - 20, S.deck.y - 150, x1 - x0 + 60, GY - S.deck.y + 210, g => {
    const St = STEEL;
    // (the legs down from the chute to the ground (or into the pit): round steel columns in steps, a bracket under the
    // chute, a footing; braced to the next one)
    for (let i = 1; i < S.pts.length - 1; i++) {
      const [x, y] = S.pts[i], n = S.pts[i + 1];
      if (i + 1 < S.pts.length - 1 && n[0] - x < 140) { g.strokeStyle = St[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + 30); g.lineTo(n[0], Math.min(GY - 10, n[1] + 80)); g.stroke(); }
      R(g, x - 4, y + 8, 8, GY + 60 - y, INK); R(g, x - 3, y + 8, 6, GY + 60 - y, St[2]); R(g, x - 3, y + 8, 2, GY + 60 - y, St[3]); R(g, x - 3, y + 8, 1, GY + 60 - y, St[4]); R(g, x + 2, y + 8, 1, GY + 60 - y, St[0]);
      R(g, x - 9, y + 6, 18, 4, INK); R(g, x - 8, y + 6, 16, 2, St[3]);
      if (y < GY - 20 && !GROUND.every(([a, bb]) => x < a || x > bb)) { R(g, x - 8, GY - 5, 16, 5, INK); R(g, x - 7, GY - 4, 14, 4, PAVE[3]); R(g, x - 7, GY - 4, 14, 1, PAVE[5]); }
    }
    if (S.stairs.n > 0) paintTower(g, S.stairs, d, S.col);
    // (the deck: steel, lit along its top: he stands on it)
    R(g, d.x1, d.y, d.x2 - d.x1, 2, '#F1F5F9'); R(g, d.x1, d.y + 2, d.x2 - d.x1, 2, St[4]); R(g, d.x1, d.y + 4, d.x2 - d.x1, 2, St[2]); R(g, d.x1, d.y + 6, d.x2 - d.x1, 1, St[0]);
    slideBack(g, S.pts, S.col);
  });
};
const drawSlideFront = (c: Ctx, state: GameState, S: Slide) => {
  const b = boundsOf(S.pts, 20);
  if (!vis(state, b.x, b.x + b.w)) return;
  stamp(c, `wp-slidef-${S.id}`, b.x, b.y, b.w, b.h, g => slideFront(g, S.pts, S.col));
};

// ---------------------------------------------------------------------------------------------------------------
// The tube rides

/** (narrow: the Abyss's steep chute in a wide tile made it tall, mostly empty, and every pixel of it drawn each frame;
 *  150, and each tile cut to the chute's own reach above and below it (the back half 32 over the line to 26 under it,
 *  the near wall 14 over to 18 under, slopes and all): the tiles were most of the ride's draw) */
const TUBE_TILE = 150;
/** Each tile's top and bottom of the chute, worked out once (ride, lap, tile). */
const BANDS = new Map<string, [number, number]>();
const tileBand = (T: Tube, paths: Path[], tx: number) => {
  const k = `${T.id}-${tubeLapNo(TUBES.indexOf(T))}-${tx}`;
  let b = BANDS.get(k);
  if (!b) { b = bandOf(paths.flatMap(tubePts), tx, TUBE_TILE); BANDS.set(k, b); }
  return b;
};
const tubePts = (P: Path): [number, number][] => [[P.segs[0].x0, P.segs[0].y0], ...P.segs.map(s => [s.x1, s.y1] as [number, number])];
/** The chute's lowest on screen (world y; -Infinity: none of it), the same either side of the loop's carry back. */
const CHUTE_PTS = TUBES.map(T => T.laps.map(l => l.pieces.flat()));
const lowestAt = (i: number, x0: number, x1: number) => { let y = -Infinity; for (const [x, yy] of CHUTE_PTS[i][tubeLapNo(i)]) if (x > x0 && x < x1 && yy > y) y = yy; return y; };

// The tube rides (the SNES pass). Depth, back to front:
//   the backdrop (screen space): the sky, the far horizon, the giant slides; under the drop's haze line, black (cropped:
//     nothing of it painted there);
//   drawTubeBack (world, behind him), each step's own draw in this order:
//     the tower's side face (toward the eye, down into the drop);
//     the chute's legs (steel columns off saddles under the chute, X-braced to the next) and the pipes' risers (coming up
//       out of the dark behind the chute), all running on down;
//     the drop's haze (a flat line just under the lowest of the chute on screen: the mist thickening down it into bands,
//       then black: the legs and the risers go down into it and are gone; drifting wisps in it): over the legs, under
//       everything else; no bottom to it anywhere;
//     the tower (its shaft on down into the dark, its stairs, the tower, the canopy, the rack of tubes, the deck's lit top);
//     the GAP signs (on posts stood on the chute's back rim, their feet behind it);
//     the chute's back half (the trough, the water in it, the broken ends at the gaps): over the legs' saddles, the
//       risers, the signs' feet;
//   (the engine: the aliens, him, the tube's back half)
//   drawTubeFront (world, in front of him): the chute's near wall, the pipes' ends (end on, coming at us off their risers'
//     elbows, a LOW plate on struts on top).

/** The rides' looks: the chute's plastic (the Black Hole's deep-space indigo; the Abyss's deep-sea teal), the stripe
 *  along the near wall (and the canopy's color), the print on the plastic (the Black Hole's stars, the Abyss's glowing
 *  plankton). */
const TUBE_LOOK: Record<string, { body?: string; accent: string; print: string[] }> = {
  blackHole: { accent: '#7C3AED', print: ['#F8FAFC', '#C4B5FD', '#818CF8'] },
  abyss: { body: '#0F3A50', accent: '#F59E0B', print: ['#67E8F9', '#A7F3D0', '#22D3EE'] },
};
const tubeCol = (T: Tube) => (TUBE_LOOK[T.id]?.body ?? T.col);
/** Dotted along a line (1 on, 1 off), two rows staggered: a dithered seam between two of a ramp's steps. */
const ditherAlong = (g: Ctx, pts: [number, number][], dy: number, col: string) => {
  g.lineCap = 'butt';
  for (const [d, o] of [[0, 0], [1, 1]] as const) { g.lineDashOffset = o; along(g, pts, dy + d, 1, col, [1, 1]); }
  g.lineDashOffset = 0;
};
/** Marks along the chute (its joints, its print, the foam) are anchored to the world and repeat every PERIOD: both
 *  loops' lengths are multiples of it, so the carry back shows the same marks either side. */
const PERIOD = 1920;
const mod = (x: number) => ((x % PERIOD) + PERIOD) % PERIOD;
/** A piece's points near x0..x1 (one either side past it): a tile's strokes only that much of the chute (the whole ride
 *  stroked into every tile and clipped was most of a tile's paint). */
const near = (pts: [number, number][], x0: number, x1: number) => {
  let i0 = 0, i1 = pts.length - 1;
  while (i0 < i1 && pts[i0 + 1][0] < x0) i0++;
  while (i1 > i0 && pts[i1 - 1][0] > x1) i1--;
  return pts.slice(i0, i1 + 1);
};
const GOLD = ['#6B4A04', '#A87A0A', '#FACC15', '#FDE68A', '#FFF9DB'];
/** The chute's back half (a tile's worth, x0..x1): the trough in its plastic's steps (the shadow under it, the body, the
 *  lit inner rim along its top, a glint), the sections' joints banded and bolted, the print on it; the water running in
 *  it (deep, the run, the foam flecked along). Within chuteBack's old bounds. */
const tubeBack = (g: Ctx, P: Path, T: Tube, x0: number, x1: number) => {
  const pts = near(tubePts(P), x0 - 80, x1 + 80);
  if (pts.length < 2) return;
  const C = ramp5(tubeCol(T)), Lk = TUBE_LOOK[T.id] ?? TUBE_LOOK.blackHole;
  g.lineCap = 'round'; g.lineJoin = 'round';
  // (the trough: inked, its shade, the inside of its far wall in its body color, stepped up to the rolled rim along its
  // top (lit, a glint along it), the seams dithered; dark under)
  along(g, pts, -7, 31, INK);
  along(g, pts, -7, 27, C[1]);
  along(g, pts, -10, 17, C[2]);
  along(g, pts, -15, 6, mix(C[2], C[3], 0.5));
  along(g, pts, -19, 4, C[3]);
  along(g, pts, -20.5, 1.5, C[4]);
  along(g, pts, -20.5, 1, '#FFFFFF', [3, 17]);
  ditherAlong(g, pts, -2, C[1]);
  ditherAlong(g, pts, -13, C[2]);
  along(g, pts, 5, 3, C[0]);
  along(g, pts, 7.5, 1, INK);
  g.lineCap = 'butt'; g.lineJoin = 'miter';
  const lo = Math.max(x0 - 24, pts[0][0]), hi = Math.min(x1 + 24, pts[pts.length - 1][0]);
  for (let x = Math.ceil(lo / 16) * 16; x <= hi; x += 16) {
    const q = surfaceAt(P, x);
    if (!q) continue;
    const y = Math.round(q.y), m = mod(x);
    if (m % 80 === 0) { R(g, x - 1, y - 20, 2, 25, C[0]); R(g, x + 1, y - 20, 1, 25, C[3]); R(g, x - 2, y - 21, 5, 2, C[4]); R(g, x - 1, y - 21, 2, 1, INK); continue; }
    const n = hash(m * 0.37);
    if (n < 0.45) R(g, x + Math.floor(hash(m + 3) * 12), y - 16 + Math.floor(hash(m + 7) * 8), n < 0.1 ? 2 : 1, 1, Lk.print[Math.floor(hash(m + 11) * 3) % 3]);
  }
  // (the water running down it, in bands: the deep of it, the run, the bright of the rush, its foam along the top (its
  // streaks rushing on: drawTubeFlow, live))
  g.lineCap = 'round'; g.lineJoin = 'round';
  along(g, pts, -2, 11, '#123F72');
  along(g, pts, -2.5, 8, '#1F64A8');
  along(g, pts, -3.5, 5, '#3E92D6');
  along(g, pts, -5, 2.5, '#8FD3FF');
  along(g, pts, -6.5, 1, '#E0F2FE');
  ditherAlong(g, pts, 0.5, '#1F64A8');
  g.lineCap = 'butt'; g.lineJoin = 'miter';
  for (let x = Math.ceil(lo / 24) * 24; x <= hi; x += 24) { const q = surfaceAt(P, x); if (q && hash(mod(x) * 0.71) < 0.6) R(g, x, Math.round(q.y) - 7, 3, 1, '#FFFFFF'); }
};
/** A piece's ends at the gaps (`first`: its start, `last`: its end): the last stretch of the trough striped yellow and
 *  black (lit along the top), the end snapped off ragged (a cracked lip of the plastic, a shard hanging), a bolt rod
 *  bent out of the break. */
const brokenEnds = (g: Ctx, P: Path, T: Tube, first: boolean, last: boolean, x0 = -Infinity, x1 = Infinity) => {
  const C = ramp5(tubeCol(T)), ends: [number, number][] = [];
  // (only an end that's in the tile being painted (x0..x1, its bits sticking out round it): the rest were stroked into
  // every tile of the piece and clipped away)
  const near = (s: number) => { const e = pointAt(P, s).x; return e > x0 - 40 && e < x1 + 40; };
  if (last && near(P.len)) ends.push([P.len - 64, P.len]);
  if (first && near(0)) ends.push([0, 40]);
  for (const [s0, s1] of ends) {
    g.lineCap = 'butt';
    for (let s = s0, k = 0; s < s1; s += 12, k++) {
      const q = pointAt(P, s), q2 = pointAt(P, Math.min(s1, s + 12));
      g.lineWidth = 9; g.strokeStyle = k % 2 ? INK : GOLD[2]; g.beginPath(); g.moveTo(q.x, q.y - 4); g.lineTo(q2.x, q2.y - 4); g.stroke();
      g.lineWidth = 2; g.strokeStyle = k % 2 ? '#3A3020' : GOLD[4]; g.beginPath(); g.moveTo(q.x, q.y - 8); g.lineTo(q2.x, q2.y - 8); g.stroke();
      g.lineWidth = 1; g.strokeStyle = k % 2 ? INK : GOLD[0]; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q2.x, q2.y); g.stroke();
    }
    const e = pointAt(P, s0 === 0 ? 0 : P.len), d = s0 === 0 ? -1 : 1;
    // (the break: ragged, ink; the plastic's cracked lip inside it, lit; a shard hanging off its foot)
    poly(g, [[e.x, e.y - 22], [e.x + d * 6, e.y - 15], [e.x - d * 2, e.y - 8], [e.x + d * 5, e.y - 1], [e.x - d * 3, e.y + 6], [e.x + d * 2, e.y + 10], [e.x - d * 8, e.y + 10], [e.x - d * 8, e.y - 22]], INK);
    poly(g, [[e.x - d * 1, e.y - 20], [e.x + d * 3, e.y - 15], [e.x - d * 4, e.y - 9], [e.x - d * 4, e.y - 19]], C[3]);
    poly(g, [[e.x - d * 2, e.y + 6], [e.x + d * 1, e.y + 9], [e.x - d * 1, e.y + 17], [e.x - d * 4, e.y + 9]], INK);
    poly(g, [[e.x - d * 2, e.y + 7], [e.x, e.y + 9], [e.x - d * 1, e.y + 14], [e.x - d * 3, e.y + 9]], C[2]);
    // (a bolt rod bent out of the break, lit along its top)
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(e.x, e.y - 2); g.lineTo(e.x + d * 10, e.y + 4); g.lineTo(e.x + d * 14, e.y + 14); g.stroke();
    g.strokeStyle = '#8A93A0'; g.lineWidth = 1; g.stroke();
  }
};
/** ...the near wall (in front of him: his legs down in the water behind it): in its steps, the lit lip along its top,
 *  the ride's stripe along it, the joints banded. Within chuteFront's old bounds. */
const tubeFrontPaint = (g: Ctx, P: Path, T: Tube, x0: number, x1: number) => {
  const pts = near(tubePts(P), x0 - 80, x1 + 80);
  if (pts.length < 2) return;
  const C = ramp5(tubeCol(T)), Lk = TUBE_LOOK[T.id] ?? TUBE_LOOK.blackHole;
  g.lineCap = 'round'; g.lineJoin = 'round';
  // (the near wall: inked, its shade, its body, the rolled lip along its top (lit, a glint, wet), the ride's stripe
  // (inked under), the shade dithered in toward its foot)
  along(g, pts, 2, 16, INK);
  along(g, pts, 2, 12, C[1]);
  along(g, pts, 0.5, 8, C[2]);
  along(g, pts, -2.5, 3, C[3]);
  along(g, pts, -3.5, 1, C[4]);
  along(g, pts, -3.5, 1, '#FFFFFF', [2, 21]);
  along(g, pts, 4, 2.5, mix(Lk.accent, INK, 0.5));
  along(g, pts, 3.5, 1.5, Lk.accent);
  ditherAlong(g, pts, 5.5, C[0]);
  along(g, pts, 8, 1.5, C[0]);
  g.lineCap = 'butt'; g.lineJoin = 'miter';
  const lo = Math.max(x0 - 24, pts[0][0]), hi = Math.min(x1 + 24, pts[pts.length - 1][0]);
  for (let x = Math.ceil(lo / 80) * 80; x <= hi; x += 80) { const q = surfaceAt(P, x); if (!q) continue; const y = Math.round(q.y); R(g, x - 1, y - 3, 2, 11, C[0]); R(g, x + 1, y - 3, 1, 11, C[3]); R(g, x - 1, y + 2, 2, 2, C[4]); }
};

/** The chute's legs (live, a handful of fills each: a stamp apiece cost more), drawn from the chute's line there: a
 *  saddle under the chute, a steel column in its steps (lit up its left, the night on its right), bolted collars, on
 *  down past the haze's solid line. The pipes' risers the same, fatter, in their paint. */
const LEG_H = 880;
/** A leg's (or a riser's) length: on down to the haze's solid line (gone into it there; no more of it painted). */
const legLen = (y: number, solid: number) => Math.min(LEG_H, Math.max(20, solid - y));
const LEG = ramp5(mix('#56647A', '#0B1020', 0.3));
const PIPE = ramp5('#4B6270');
const paintLeg = (g: Ctx, LEG_H: number) => {
  R(g, -12, 7, 24, 7, INK); R(g, -11, 8, 22, 2, LEG[3]); R(g, -11, 10, 22, 3, LEG[1]); R(g, -11, 8, 1, 5, LEG[4]);
  R(g, -5, 14, 10, LEG_H - 14, INK); R(g, -4, 14, 8, LEG_H - 14, LEG[2]); R(g, -4, 14, 2, LEG_H - 14, LEG[3]); R(g, -4, 14, 1, LEG_H - 14, LEG[4]); R(g, 2, 14, 2, LEG_H - 14, LEG[1]); R(g, 3, 14, 1, LEG_H - 14, LEG[0]);
  R(g, 0, 14, 1, LEG_H - 14, LEG[1]);
  for (let y = 70; y < LEG_H; y += 110) { R(g, -6, y, 12, 6, INK); R(g, -5, y + 1, 10, 4, LEG[1]); R(g, -5, y + 1, 10, 1, LEG[3]); R(g, -3, y + 3, 1, 1, LEG[4]); R(g, 2, y + 3, 1, 1, LEG[4]); }
};
const paintRiser = (g: Ctx, LEG_H: number) => {
  // (its elbow at the top, turned at us (the end's drawn in front, over it): a round cap)
  g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 9, Math.PI, 0); g.fill();
  g.fillStyle = PIPE[2]; g.beginPath(); g.arc(0, 0, 7, Math.PI, 0); g.fill();
  R(g, -8, 0, 16, LEG_H, INK); R(g, -7, 0, 14, LEG_H, PIPE[2]); R(g, -7, 0, 3, LEG_H, PIPE[3]); R(g, -6, 0, 1, LEG_H, PIPE[4]); R(g, 3, 0, 4, LEG_H, PIPE[1]); R(g, 6, 0, 1, LEG_H, PIPE[0]);
  R(g, 1, 0, 1, LEG_H, PIPE[1]);
  for (let y = 46; y < LEG_H; y += 64) { R(g, -10, y, 20, 7, INK); R(g, -9, y + 1, 18, 5, PIPE[1]); R(g, -9, y + 1, 18, 1, PIPE[4]); R(g, -7, y + 3, 2, 1, PIPE[4]); R(g, 5, y + 3, 2, 1, PIPE[4]); }
};

/** The drop's haze (live: a handful of plain fills, cheaper than one big see-through picture put down): the mist
 *  thickening down it in bands (each seam dithered), solid HAZE_H down from its top (the drop's bands on into black under
 *  that: the backdrop's); wisps drifting in it, long thin streaks of the mist, lit a touch. */
const HAZE_H = 102;
const MIST = '#141A2C';
const DROP_BANDS = [MIST, '#0E1322', '#090D18', '#05070F'];
const HAZE_A = [0.34, 0.52, 0.67, 0.8, 0.9, 0.97];
const hazeRgb = (a: number) => `rgba(20, 26, 44, ${a.toFixed(3)})`;
const HAZE_COLS = HAZE_A.map(hazeRgb), HAZE_SEAMS = HAZE_A.map((a, k) => hazeRgb(k ? a - HAZE_A[k - 1] : a));
const WISP_W = 512;
/** The mist rising up out of the drop (behind the world: the backdrop's), up to the haze's top, band by band. */
const MIST_UP = [0.07, 0.14, 0.21, 0.28, 0.35, 0.4];
const GAP_SHAFT = [0.04, 0.1, 0.18, 0.28, 0.4].map(a => `rgba(6, 9, 20, ${a})`);
const WISPS = Array.from({ length: 7 }, (_, i) => ({ x: Math.floor(hash(i + 300) * WISP_W), w: 50 + Math.floor(hash(i + 310) * 130), y: 28 + Math.floor(hash(i + 320) * 30) }));
/** (`phase`: where along the world a wisp's repeat starts (it drifts: slower than the world, a parallax)) */
const drawHaze = (c: Ctx, x: number, top: number, w: number, phase: number) => {
  const bh = HAZE_H / HAZE_A.length;
  HAZE_COLS.forEach((col, k) => R(c, x, top + Math.round(k * bh), w, Math.round((k + 1) * bh) - Math.round(k * bh), col));
  for (let k = 1; k < HAZE_A.length; k++) dither(c, x, top + Math.round(k * bh) - 2, w, 2, HAZE_SEAMS[k]);
  for (let px = phase + Math.floor((x - phase) / WISP_W) * WISP_W - WISP_W; px < x + w; px += WISP_W) for (const s of WISPS) {
    const a = Math.max(x, px + s.x), b = Math.min(x + w, px + s.x + s.w);
    if (b > a) { R(c, a, top + s.y, b - a, 2, 'rgba(120, 140, 190, 0.16)'); if (b - a > 30) R(c, a + 10, top + s.y - 1, b - a - 24, 1, 'rgba(150, 170, 215, 0.12)'); }
  }
};
/** How far the tube rides have carried him back round (the backdrop's told: the wisps drift on as if he hadn't been). */
let backShift = 0;
/** The drop under the ride on screen: its haze's top (world y: just under the chute's lowest on screen), the stretch of
 *  world it's under (the deck's end to the splash pool's outside wall), or null: no ride's drop in view. */
const dropOf = (state: GameState) => {
  for (let i = 0; i < TUBES.length; i++) {
    const [a, b] = tubeSpan(TUBES[i]);
    if (!vis(state, a, b, 0)) continue;
    const t = lowestAt(i, state.camera.x - 120, state.camera.x + W + 120);
    if (!isFinite(t)) return null;
    return { i, a, b, top: Math.round(t + 8) };
  }
  return null;
};
/** ...on screen, where it's solid (the backdrop paints nothing under it: it's the drop's, black), or null. */
const dropRect = (state: GameState) => {
  const d = dropOf(state);
  if (!d) return null;
  const y = Math.round(d.top + HAZE_H - state.camera.y);
  if (y >= H) return null;
  return { x0: Math.max(0, Math.round(d.a - state.camera.x)), x1: Math.min(W, Math.round(d.b - state.camera.x)), y: Math.max(0, y) };
};
const inGap = (i: number, x: number, m = 0) => tubeLap(i).gaps.some(([a, b]) => x > a - m && x < b + m);
/** The chute's height at world x on ride i (null: a gap). */
const chuteY = (paths: Path[], x: number) => { for (const P of paths) if (x >= P.segs[0].x0 && x <= P.segs[P.segs.length - 1].x1) { const q = surfaceAt(P, x); if (q) return q.y; } return null; };
const RACK = ['#F97316', '#FACC15', '#22D3EE', '#EC4899'];
/** A tube ride's tower (stamped): the plaza slides' tower (paintTower), its shaft on down past the ground into the drop
 *  (its panels going on, ribbed, banded darker into black), the deck's lit top, the rack of tubes on it (each ring in
 *  its rubber's steps). */
const paintTubeTower = (g: Ctx, T: Tube) => {
  const d = T.deck, St = STEEL, w = d.x2 - d.x1, sh = 520;
  R(g, d.x1, GY, w, sh, St[1]); R(g, d.x1, GY, 4, sh, St[3]); R(g, d.x1, GY, 1, sh, St[4]); R(g, d.x2 - 6, GY, 6, sh, St[0]); dither(g, d.x2 - 10, GY, 4, sh, St[0]);
  for (let y = GY + 24 - ((GY - d.y) % 24); y < GY + sh; y += 24) { R(g, d.x1 + 4, y, w - 10, 2, St[0]); R(g, d.x1 + 4, y + 2, w - 10, 1, St[2]); for (let x = d.x1 + 10; x < d.x2 - 8; x += 14) R(g, x, y - 4, 2, 2, St[3]); }
  hazeBands(g, d.x1, GY, w, sh, VOID, 0.15, 1, 8);
  paintTower(g, T.stairs, d, (TUBE_LOOK[T.id] ?? TUBE_LOOK.blackHole).accent);
  R(g, d.x1, d.y, w, 2, '#F1F5F9'); R(g, d.x1, d.y + 2, w, 2, St[4]); R(g, d.x1, d.y + 4, w, 2, St[2]); R(g, d.x1, d.y + 6, w, 1, St[0]);
  // (the rack: tubes stacked by the canopy's post, each ring inked, its rubber, lit along its top, shaded under)
  for (let k = 0; k < 4; k++) {
    const cx = d.x1 + 40, cy = d.y - 9 - k * 13, Rr = ramp5(RACK[k]);
    const ring = (lw: number, col: string, a0 = 0, a1 = Math.PI * 2, ry = 7, rx = 22) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, a0, a1); g.stroke(); };
    ring(11, INK); ring(7, Rr[2]); ring(3, Rr[0], 0.2, Math.PI - 0.2, 8.5); ring(2, Rr[4], Math.PI + 0.5, Math.PI * 1.6, 5.5, 20); ring(1, Rr[3], Math.PI * 1.6, Math.PI * 1.9, 5.5, 20);
  }
};
const drawTubeBack = (c: Ctx, state: GameState, T: Tube, i: number) => {
  const paths = tubePaths(i);
  const first = T.stairs.x, last = paths[paths.length - 1].segs[paths[paths.length - 1].segs.length - 1].x1;
  if (!vis(state, first - 40, last + 40)) return;
  const d = T.deck, bot = state.camera.y + H + 20;
  const dp = dropOf(state), solid = dp && dp.i === i ? dp.top + HAZE_H : bot;
  // (the tower's side face: toward the eye, from the deck on down into the drop (the haze over its foot))
  if (vis(state, d.x1, d.x2 + 60)) sideFace(c, eyeOf(state), d.x2, 1, d.y, Math.min(bot, GY + 520), 0.94, STEEL[1]);
  // (the legs: one every 160 under the chute (none under a gap, or near one), X-braced to the next; the pipes' risers)
  const legs: [number, number][] = [];
  for (let x = Math.floor((state.camera.x - 200) / 160) * 160; x < state.camera.x + W + 200; x += 160) {
    if (x < d.x2 + 20 || x > last - 20 || inGap(i, x, 30)) continue;
    const y = chuteY(paths, x);
    if (y === null || y + 10 > bot) continue;
    legs.push([x, Math.round(y)]);
  }
  c.beginPath();
  for (let k = 0; k + 1 < legs.length; k++) {
    const [x, y] = legs[k], [x2, y2] = legs[k + 1];
    if (x2 - x !== 160) continue;
    c.moveTo(x + 4, y + 44); c.lineTo(x2 - 4, y2 + 150); c.moveTo(x + 4, y + 150); c.lineTo(x2 - 4, y2 + 44);
  }
  c.strokeStyle = INK; c.lineWidth = 4; c.stroke(); c.strokeStyle = LEG[1]; c.lineWidth = 2; c.stroke();
  for (const [x, y] of legs) { c.save(); c.translate(x, y); paintLeg(c, legLen(y, solid)); c.restore(); }
  for (const x of tubeLap(i).pipes) {
    if (!vis(state, x - 20, x + 20)) continue;
    const y = chuteY(paths, x);
    if (y === null) continue;
    const ry = Math.round(y - PIPE_CLEAR - 12), n = legLen(ry, solid);
    c.save(); c.translate(x, ry); paintRiser(c, n); c.restore();
  }
  // (the haze: the screen's width, put down at the camera; cut to the drop's stretch where it's not all of the screen)
  if (dp && dp.i === i && dp.top < bot) {
    const cx = state.camera.x, x0 = Math.max(cx, dp.a), x1 = Math.min(cx + W, dp.b - 16);
    if (x1 > x0) {
      drawHaze(c, Math.floor(x0), dp.top, Math.ceil(x1) - Math.floor(x0), Math.round(cx - (cx + backShift) * 0.5));
    }
  }
  // (the tower up to the rack)
  if (vis(state, first - 40, d.x2 + 40)) stamp(c, `wp-tubetower-${T.id}`, first - 20, d.y - 150, d.x2 - first + 60, GY - d.y + 670, g => paintTubeTower(g, T));
  // (under each gap: the dark coming up the hole, in see-through bands thickening down to the haze (nothing under a gap
  // to land on), its sides dithered)
  if (dp && dp.i === i) for (const [g1, g2] of tubeLap(i).gaps) {
    if (!vis(state, g1, g2, 0)) continue;
    const ya = chuteY(paths, g1 - 1), yb = chuteY(paths, g2 + 1);
    const top = Math.round(Math.max(ya ?? -Infinity, yb ?? -Infinity) + 12), sol = dp.top + HAZE_H;
    if (sol <= top) continue;
    const n = GAP_SHAFT.length, bh = (sol - top) / n, x = Math.round(g1 + 6), w = Math.round(g2 - g1 - 12);
    GAP_SHAFT.forEach((col, k) => R(c, x, Math.round(top + k * bh), w, Math.round(top + (k + 1) * bh) - Math.round(top + k * bh), col));
    dither(c, x - 4, Math.round(top + bh), 4, sol - Math.round(top + bh), GAP_SHAFT[1]); dither(c, x + w, Math.round(top + bh), 4, sol - Math.round(top + bh), GAP_SHAFT[1]);
  }
  // (the GAP signs: well before each gap, on posts stood on the chute's back rim (their feet behind it). Two gaps back to
  // back (the second's sign would stand over the first's hole: the Abyss's): one sign for both, GAPS AHEAD, JUMP X2)
  const gs = tubeLap(i).gaps;
  const onChute = (wx: number) => chuteY(paths, wx) !== null;
  for (let gi = 0; gi < gs.length; gi++) {
    const [g1] = gs[gi], x = g1 - GAP_WARN;
    const two = !!gs[gi + 1] && !onChute(gs[gi + 1][0] - GAP_WARN);
    if (!vis(state, x - 90, x + 90)) continue;
    const cy = chuteY(paths, x);
    if (cy === null) continue;
    const top = Math.round(cy - 160), L1 = two ? 'GAPS AHEAD' : 'GAP AHEAD', L2 = two ? 'JUMP X2!' : 'JUMP!';
    const w = Math.max(100, Math.round(Math.max(signW(L1, GAP_L1), signW(L2, GAP_L2)) + 22)), h = 48, x0 = Math.round(x - w / 2);
    // (its posts: inside the board's ends, moved in off a hole if one's under them)
    const posts = [x0 + 16, x0 + w - 20].map(px => { let p = px; while (!onChute(p) && Math.abs(p - x) > 4) p += p < x ? 4 : -4; return [p, Math.round((chuteY(paths, p) ?? cy) - 8)] as [number, number]; });
    const foot = Math.max(...posts.map(p => p[1]));
    stamp(c, `wp-gapsign-${T.id}-${tubeLapNo(i)}-${g1}${two ? '-2' : ''}`, x0 - 14, top - 6, w + 28, foot - top + 12, g => paintGapSign(g, x, x0, top, w, h, posts, L1, L2));
    // (its warning lamps, blinking in turn)
    const on = Math.floor(state.frame / 12) % 2 === 0;
    for (const [lx, lit] of [[x0 - 9, on], [x0 + w + 3, !on]] as const) {
      R(c, lx, top + 17, 6, 6, lit ? '#EF4444' : '#4A0B0B');
      if (lit) { R(c, lx + 1, top + 18, 2, 2, '#FECACA'); c.fillStyle = 'rgba(239, 68, 68, 0.22)'; c.fillRect(lx - 3, top + 14, 12, 12); }
    }
  }
  // (the chute: baked in tiles along its length; the ends at the gaps broken off, striped. The tile either side just off
  // the screen baked ahead (prestamp): a tile coming on was painted twice, live its first frame, then into its stamp)
  for (let tx = Math.floor(state.camera.x / TUBE_TILE) * TUBE_TILE - TUBE_TILE; tx < state.camera.x + W + TUBE_TILE; tx += TUBE_TILE) {
    if (tx + TUBE_TILE < d.x2 - 40 || tx > last + 40) continue;
    const [y0, y1] = tileBand(T, paths, tx);
    if (y1 < y0 || !visY(state, y0 - 32, y1 + 26, 0)) continue;
    (tx + TUBE_TILE <= state.camera.x || tx >= state.camera.x + W ? prestamp : stamp)(c, `wp-tube-${T.id}-${tubeLapNo(i)}-${tx}`, tx, y0 - 32, TUBE_TILE, y1 - y0 + 58, g => {
      g.save(); g.beginPath(); g.rect(tx, y0 - 32, TUBE_TILE, y1 - y0 + 58); g.clip();
      paths.forEach((P, pi) => {
        if (P.segs[P.segs.length - 1].x1 < tx - 80 || P.segs[0].x0 > tx + TUBE_TILE + 80) return;
        tubeBack(g, P, T, tx, tx + TUBE_TILE);
        brokenEnds(g, P, T, pi > 0, pi < paths.length - 1, tx, tx + TUBE_TILE);
      });
      g.restore();
    });
  }
  drawTubeFlow(c, state, T, i);
};
/** The water rushing down the chute (live: two strokes a frame): foam streaks on its top, world-anchored every 48 (the
 *  loops' lengths are multiples of it: no jump at the carry back), running on faster than the tube rides it. */
const drawTubeFlow = (c: Ctx, state: GameState, T: Tube, i: number) => {
  const paths = tubePaths(i), cx = state.camera.x, ph = (state.frame * T.speed * 1.7) % 48;
  // (opaque: the water's colors mixed in already, no see-through strokes in the frame)
  for (const [dx, len, dy, col] of [[0, 12, -5.5, '#D6ECFB'], [26, 6, -3.5, '#7EB6E2']] as const) {
    c.beginPath();
    for (let x = Math.floor((cx - 60) / 48) * 48 + ph + dx; x < cx + W + 20; x += 48) {
      const y0 = chuteY(paths, x), y1 = chuteY(paths, x + len);
      if (y0 === null || y1 === null || !visY(state, y0 - 10, y0 + 10, 0)) continue;
      c.moveTo(Math.round(x), Math.round(y0 + dy)); c.lineTo(Math.round(x + len), Math.round(y1 + dy));
    }
    c.strokeStyle = col; c.lineWidth = 1; c.stroke();
  }
};
/** The GAP sign's letters: the warning stenciled in ink, JUMP in red enamel. */
const GAP_L1: Look = { sx: 1, sy: 2, fill: '#1A1206', gap: 1, bold: true };
const GAP_L2: Look = { sx: 2, sy: 2, fill: rampDown('#DC2626', 0.3), dither: true, shadow: '#1A1206', drop: 1, gap: 1 };
/** A GAP sign (stamped): its two steel posts (lit up their left) braced across under the board, their feet down behind
 *  the chute's rim; the board in hazard enamel (its steps, the lit top, the shaded foot, chevrons along the bottom, bolts),
 *  its lamps' housings either end. */
const paintGapSign = (g: Ctx, x: number, x0: number, top: number, w: number, h: number, posts: [number, number][], L1: string, L2: string) => {
  const St = STEEL;
  for (const [px, fy] of posts) { R(g, px - 1, top + h, 6, fy - top - h, INK); R(g, px, top + h, 4, fy - top - h, St[2]); R(g, px, top + h, 1, fy - top - h, St[4]); R(g, px + 3, top + h, 1, fy - top - h, St[0]); }
  const by = top + h + 12;
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(posts[0][0] + 2, by); g.lineTo(posts[1][0] + 2, by + 18); g.moveTo(posts[0][0] + 2, by + 18); g.lineTo(posts[1][0] + 2, by); g.stroke();
  g.strokeStyle = St[1]; g.lineWidth = 1; g.stroke();
  R(g, posts[0][0], by - 2, posts[1][0] - posts[0][0] + 4, 4, INK); R(g, posts[0][0] + 1, by - 1, posts[1][0] - posts[0][0] + 2, 2, St[3]);
  // (the board)
  R(g, x0 - 2, top - 2, w + 4, h + 4, INK);
  R(g, x0, top, w, h, GOLD[2]); R(g, x0, top, w, 2, GOLD[4]); R(g, x0, top + 2, w, 1, GOLD[3]); R(g, x0, top, 2, h, GOLD[3]); R(g, x0 + w - 2, top, 2, h, GOLD[1]);
  dither(g, x0, top + h - 14, w, 4, GOLD[1]);
  R(g, x0, top + h - 10, w, 10, INK);
  for (let k = 0; k < w; k += 12) poly(g, [[x0 + k, top + h - 1], [x0 + k + 6, top + h - 9], [x0 + k + 12, top + h - 9], [x0 + k + 6, top + h - 1]], GOLD[2]);
  R(g, x0, top + h - 10, w, 1, GOLD[0]);
  for (const sx of [x0 + 4, x0 + w - 7]) { R(g, sx, top + 4, 3, 3, GOLD[0]); R(g, sx, top + 4, 1, 1, GOLD[4]); }
  signText(g, L1, x, top + 18, GAP_L1);
  signText(g, L2, x, top + 34, GAP_L2);
  // (the lamps' housings, bolted to the board's ends)
  for (const lx of [x0 - 11, x0 + w + 1]) { R(g, lx, top + 14, 10, 12, INK); R(g, lx + 1, top + 15, 8, 1, St[3]); }
};
/** The top and bottom of a chute's points in a tile (x tx..tx+w, a margin either side). */
const bandOf = (pts: [number, number][], tx: number, w: number): [number, number] => {
  let y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i], nx = pts[i + 1]?.[0] ?? x, px = pts[i - 1]?.[0] ?? x;
    if (Math.max(x, nx, px) < tx - 40 || Math.min(x, nx, px) > tx + w + 40) continue;
    y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return [y0, y1];
};
/** A low pipe's end (stamped, in front of him): end on, coming at us off its riser's elbow: its flange in hazard
 *  stripes (lit along its top, bolted), the dark bore; a LOW plate on two struts on top of it. (y: its middle) */
const paintPipeEnd = (g: Ctx, x: number, y: number) => {
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.fill();
  g.fillStyle = GOLD[2]; g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = INK; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x, y); g.arc(x, y, 12, k * Math.PI / 2 + 0.3, k * Math.PI / 2 + Math.PI / 4 + 0.3); g.closePath(); g.fill(); }
  g.lineWidth = 2; g.strokeStyle = GOLD[4]; g.beginPath(); g.arc(x, y, 11, Math.PI * 1.05, Math.PI * 1.6); g.stroke();
  g.strokeStyle = GOLD[0]; g.beginPath(); g.arc(x, y, 11, 0.1, Math.PI * 0.6); g.stroke();
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + 0.5, bx = Math.round(x + Math.cos(a) * 9), byy = Math.round(y + Math.sin(a) * 9); R(g, bx - 1, byy - 1, 2, 2, '#3A3020'); R(g, bx - 1, byy - 1, 1, 1, GOLD[4]); }
  g.fillStyle = '#2A3442'; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#0B0F18'; g.beginPath(); g.arc(x + 1, y + 1, 4.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = VOID; g.beginPath(); g.arc(x + 1.5, y + 1.5, 2.5, 0, Math.PI * 2); g.fill();
  // (the plate on its struts)
  for (const sx of [x - 12, x + 10]) { R(g, sx - 1, y - 23, 4, 12, INK); R(g, sx, y - 23, 2, 11, STEEL[3]); }
  R(g, x - 24, y - 42, 48, 20, INK); R(g, x - 23, y - 41, 46, 18, GOLD[2]); R(g, x - 23, y - 41, 46, 2, GOLD[4]); R(g, x - 23, y - 25, 46, 2, GOLD[1]);
  for (const sx of [x - 21, x + 19]) { R(g, sx, y - 38, 2, 2, GOLD[0]); R(g, sx, y - 38, 1, 1, GOLD[4]); }
  signText(g, 'LOW', x, y - 26, GAP_L1);
};
/** The tube chutes' near walls, the pipes' ends (in front of him). */
const drawTubeFront = (c: Ctx, state: GameState, T: Tube, i: number) => {
  const paths = tubePaths(i);
  const last = paths[paths.length - 1].segs[paths[paths.length - 1].segs.length - 1].x1;
  // (baked a tile ahead either side, as the back half's)
  for (let tx = Math.floor(state.camera.x / TUBE_TILE) * TUBE_TILE - TUBE_TILE; tx < state.camera.x + W + TUBE_TILE; tx += TUBE_TILE) {
    if (tx + TUBE_TILE < T.deck.x2 - 40 || tx > last + 40) continue;
    const [y0, y1] = tileBand(T, paths, tx);
    if (y1 < y0 || !visY(state, y0 - 14, y1 + 18, 0)) continue;
    (tx + TUBE_TILE <= state.camera.x || tx >= state.camera.x + W ? prestamp : stamp)(c, `wp-tubef-${T.id}-${tubeLapNo(i)}-${tx}`, tx, y0 - 14, TUBE_TILE, y1 - y0 + 32, g => {
      g.save(); g.beginPath(); g.rect(tx, y0 - 14, TUBE_TILE, y1 - y0 + 32); g.clip();
      for (const P of paths) if (P.segs[P.segs.length - 1].x1 >= tx - 80 && P.segs[0].x0 <= tx + TUBE_TILE + 80) tubeFrontPaint(g, P, T, tx, tx + TUBE_TILE);
      g.restore();
    });
  }
  // (the low pipes: end on, off their risers (drawTubeBack), at the hit's height: its underside PIPE_CLEAR over the chute)
  for (const x of tubeLap(i).pipes) {
    if (!vis(state, x - 60, x + 60)) continue;
    const cy = chuteY(paths, x);
    if (cy === null) continue;
    const y = Math.round(cy - PIPE_CLEAR - 12);
    stamp(c, `wp-pipe-${T.id}-${tubeLapNo(i)}-${x}`, x - 30, y - 48, 60, 66, g => paintPipeEnd(g, x, y));
  }
};
/** The tube rides' count: the aliens left to kill (the ride goes round till they're all dead). In the top band. */
export const drawTubeHud = (c: Ctx, left: number, band: { x1: number; x2: number; mid: number }) => {
  const s = left > 0 ? `ALIENS LEFT: ${left}` : 'ALL DEAD: RIDE IT OUT';
  c.font = '8px "Press Start 2P"';
  const w = c.measureText(s).width + 16;
  R(c, band.mid - w / 2, 22, w, 16, 'rgba(10, 8, 6, 0.75)');
  text(c, s, band.mid, 34, left > 0 ? '#BEF264' : '#FDE047', 8);
};
/** Each ride's inner tubes: vinyl, in its ramp (the Black Hole's orange against its indigo chute, the Abyss's aqua
 *  against its dark red one), and the stripe printed round it. */
const RING_LOOK: Record<string, { col: string; stripe: string }> = {
  blackHole: { col: '#F97316', stripe: '#FEF3C7' },
  abyss: { col: '#14B8C8', stripe: '#FDE047' },
};
const RING_RX = TUBE_RING.rx, RING_RY = 8, RING_TH = TUBE_RING.th;
/** The ring's two halves: the back one round over the top and on down past its front end (where his legs hang over
 *  it: they're in front of that end), the front one across his hips (his butt down in the hole behind it). */
const RING_SPLIT = 0.75, RING_LEFT = Math.PI - 0.2;
/** The tube he's parked in (live: a dozen strokes, turned with the chute; nothing here could be stamped turned). Its
 *  back half behind him (`front` false), its front half over his hips. Vinyl in its steps: the inked edge, the shade
 *  under, the body, the lit band round its top, a specular streak and wet glints; the seam's stitching, the printed
 *  stripe, the valve on its front; squashed flat under his weight (Player.tubeSit's squash, about its bottom); the dark
 *  of the hole he's sunk into; the foam it pushes along. Sat, it's round his butt (tubePose.ts TUBE_RING); in an air
 *  grab, round his waist; stood up in it (the spellbook, the hammer), round his shins. */
/** One half of the ring, painted (in the ring's own frame, unsquashed: its middle at 0, 0) at squash `sq`, with the
 *  foam and drips at `phase` (0..7 of their 24-frame cycle; -1 none). Baked once per look (ringBake). */
const RING_BOT = RING_RY + RING_TH / 2;
const paintRing = (g: Ctx, Lk: { col: string; stripe: string }, front: boolean, sq: number, phase: number) => {
  const Rm = ramp5(Lk.col);
  // (squashed about its bottom: flatter and a touch wider under him)
  g.translate(0, RING_BOT); g.scale(1 + sq * 0.08, 1 - sq * 0.22); g.translate(0, -RING_BOT);
  const [a0, a1] = front ? [RING_SPLIT, RING_LEFT] : [RING_LEFT, Math.PI * 2 + RING_SPLIT];
  const arc = (lw: number, col: string, dy = 0, drx = 0, dash?: number[], off = 0) => {
    g.strokeStyle = col; g.lineWidth = lw;
    if (dash) { g.setLineDash(dash); g.lineDashOffset = off; }
    g.beginPath(); g.ellipse(0, dy, RING_RX + drx, RING_RY + drx * 0.36, 0, a0, a1); g.stroke();
    if (dash) { g.setLineDash([]); g.lineDashOffset = 0; }
  };
  if (!front) {
    // (the hole: dark down in it, the water's glint at its far rim)
    g.fillStyle = '#071526'; g.beginPath(); g.ellipse(0, 1, RING_RX - 7, RING_RY - 3.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#123A5C'; g.beginPath(); g.ellipse(0, -1, RING_RX - 9, RING_RY - 5.5, 0, Math.PI, Math.PI * 2); g.fill();
  }
  g.lineCap = 'butt';
  arc(RING_TH + 3, INK);
  arc(RING_TH, Rm[1]);
  arc(RING_TH - 6, Rm[2], -2);
  // (the printed stripe round it, on the body's middle, inked either side)
  arc(4, mix(Lk.stripe, INK, 0.45), 1);
  arc(2, Lk.stripe, 1);
  arc(5, Rm[3], -5.5);
  arc(2, Rm[4], -7.5, -1, [8, 10]);
  arc(3, Rm[0], 8);
  // (the seam's stitches round its outside)
  arc(1, Rm[1], 4.5, 8, [1, 3]);
  // (wet: glints along the top, and a streak of it running off)
  arc(1, '#FFFFFF', -7, -2, [2, 13], 5);
  if (front) {
    // (the valve: a rubber stem up off its front, the brass cap)
    const va = 2.2, vx = Math.round(Math.cos(va) * RING_RX), vy = Math.round(Math.sin(va) * RING_RY) - 6;
    R(g, vx - 2, vy - 6, 5, 7, INK); R(g, vx - 1, vy - 5, 3, 5, '#27272A'); R(g, vx - 1, vy - 5, 1, 5, '#52525B'); R(g, vx - 2, vy - 9, 5, 4, INK); R(g, vx - 1, vy - 8, 3, 2, '#D4A017'); R(g, vx - 1, vy - 8, 1, 1, '#FFF0A0');
    // (the foam it shoves along the chute, and drips off its bottom)
    if (phase >= 0) {
      const f = phase * 3;
      arc(2, 'rgba(224, 242, 254, 0.85)', 10, 2, [3, 4], -f * 0.8);
      for (let k = 0; k < 3; k++) { const t = ((f + k * 8) % 24) / 24, dx = -14 + k * 13; R(g, dx, RING_BOT + t * 6, 1, 2, `rgba(191, 230, 255, ${(0.8 * (1 - t)).toFixed(2)})`); }
    }
  }
};
/** The ring's halves baked (look, half, squash in sixths, foam phase, the scale it's put down at): turned with the
 *  chute, so not stampable (the stamp cache won't take a turn); baked once each, then put down turned. Box: the ring's
 *  frame from (-RB_X, -RB_T), RB_W by RB_H. */
const RB_X = 46, RB_T = 28, RB_W = 92, RB_H = 64;
const RING_BAKES = new Map<string, HTMLCanvasElement>();
const ringBake = (ride: string, front: boolean, sq: number, phase: number, scale: number) => {
  const key = `${ride}|${front ? 1 : 0}|${sq}|${phase}|${scale}`;
  let cv = RING_BAKES.get(key);
  if (!cv) {
    if (RING_BAKES.size > 400) RING_BAKES.clear();
    cv = document.createElement('canvas'); cv.width = Math.ceil(RB_W * scale); cv.height = Math.ceil(RB_H * scale);
    const g = cv.getContext('2d')!;
    g.scale(scale, scale); g.translate(RB_X, RB_T);
    paintRing(g, RING_LOOK[ride] ?? RING_LOOK.blackHole, front, sq, phase);
    RING_BAKES.set(key, cv);
  }
  return cv;
};
/** The tube he's parked in. Its back half behind him (`front` false), its front half over his hips. Vinyl in its steps:
 *  the inked edge, the shade under, the body, the lit band round its top, a specular streak and wet glints; the seam's
 *  stitching, the printed stripe, the valve on its front; squashed flat under his weight (Player.tubeSit's squash, about
 *  its bottom); the dark of the hole he's sunk into; the foam it pushes along and its drips (sat on the chute). Sat, it's
 *  round his butt (tubePose.ts TUBE_RING); in an air grab, round his waist; stood up in it (the spellbook, the hammer),
 *  round his shins. Baked (ringBake): one drawImage a half a frame. */
export const drawTubeRing = (c: Ctx, state: GameState, ride: string, front: boolean) => {
  const p = state.player, sit = p.tubeSit, grab = grabBusy() || !!p.hidden;
  const sq = sit ? Math.round(sit.squash * 6) / 6 : 0;
  const phase = front && sit && p.isGrounded && !grab ? Math.floor((state.frame % 24) / 3) : -1;
  c.save();
  c.translate(p.pos.x + p.width / 2, p.pos.y + p.height);
  c.rotate(p.spriteRot ?? 0);
  c.translate(TUBE_RING.x, grab ? -28 : sit ? TUBE_RING.y : -12);
  const t = c.getTransform(), scale = Math.max(0.5, Math.round(Math.hypot(t.a, t.b) * 4) / 4);
  c.drawImage(ringBake(ride, front, sq, phase, scale), -RB_X, -RB_T, RB_W, RB_H);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// MOUNT EVEREST BUT BETTER

const { TL, TR, FLOOR, DECK, CEIL } = TOWER;
// The SNES pass (the owner's "snes-ify all the visual elements added since starting with the abduction"). Depth, back
// to front, all in drawBack (world, behind him), each step's own draw in this order:
//   drawTower, floor by floor (a stamp each, base camp up): the back wall (banded) and the scaffold behind the tarp
//     (standards, ledgers, braces, couplers), the tarp hung off the top ledger (its mountain print, its folds, its ties,
//     a corner torn down showing the scaffold), the prayer flags under the ceiling, the floor's props (dimmed: nothing
//     on them to stand on), the queue's stanchions and rope, WAIT FROM THIS POINT bolted to the wall, QUEUE CONTINUES
//     hung off the ceiling (its arrows: up, and on to the way up), the staff doors in their frames (STAFF ONLY, a red
//     beacon over each), the way down's arch (left), the way up's striped arch and its lamp's housing (right), the
//     ceiling (the deck over's underside: every floor its own look and color, none of them a door's; the beam along
//     its foot carrying the floor's name board; caged lamps hung under it), the ledges (shelves on steel legs: bottles
//     or sacks of fake snow racked under them, their lit lips), the deck (diamond plate, its lit lip, the queue's
//     arrows painted along its face); then live over it: the way up's shutter (filling its arch, rolling up into its
//     top), its lamp, the doors' tells (the door rattling in its dark frame, the beacon flashing);
//   drawFace (the mountain's outside, in tiles: out past the way up, and again round the far side, which from base camp
//     is the mountain stood over the plaza): fiberglass rock in its steps (strata, moulded boulders lit up their
//     left), panel seams and bolts, a torn hole with the warm Florida night through it, fake snow (stained, foamed),
//     plastic icicles, prayer flags on poles, its statue, its tacky sign on brackets (marquee bulbs), the shell's cut
//     edges; and the queue up the spiral: the stringer on brackets into the rock, the treads (lit: he walks them), the
//     stanchions and rope, QUEUE CONTINUES and WAIT FROM HERE on posts stood on the treads;
//   (on the spiral: the inside drawn round again either side);
//   drawBaseCamp (after the face: stood on the ground in front of the mountain): the big sign on its posts, the queue's
//     start, the yeti's cutout, the base camp marker, the bottles and the fake snow.
/** Six steps round a color: deep, shade, under, body, lit, highlight. */
const ramp6 = (c: string) => [mix(c, INK, 0.62), mix(c, INK, 0.36), mix(c, INK, 0.14), c, mix(c, '#FFFFFF', 0.28), mix(c, '#FFFFFF', 0.56)];
/** Each floor's look (the owner's "make them visually distinct from one another and the doors"): its back wall, its
 *  tarp's print, its staff doors' paint, its accent (the queue's rope, the signs' boards). */
const THEME: { wall: string; band: string; tarp: string; door: string; accent: string }[] = [
  { wall: '#2A3448', band: '#4A5468', tarp: '#3A4A66', door: '#475569', accent: '#DC2626' },  // 0 BASE CAMP
  { wall: '#183048', band: '#2E5878', tarp: '#5AA0C8', door: '#0E7490', accent: '#22D3EE' },  // 1 KHUMBU ICEFALL
  { wall: '#33284A', band: '#54447A', tarp: '#7A60A8', door: '#7C3AED', accent: '#FACC15' },  // 2 CAMP 1
  { wall: '#26381F', band: '#46603A', tarp: '#6A8A4A', door: '#15803D', accent: '#F97316' },  // 3 CAMP 2
  { wall: '#2C3A5A', band: '#4E6290', tarp: '#C8D8EE', door: '#1D4ED8', accent: '#F8FAFC' },  // 4 THE LHOTSE FACE
  { wall: '#4A2A22', band: '#704234', tarp: '#A0604A', door: '#B45309', accent: '#FDE047' },  // 5 CAMP 3
  { wall: '#22222E', band: '#3A3A52', tarp: '#5A5A80', door: '#6D28D9', accent: '#4ADE80' },  // 6 CAMP 4
  { wall: '#141218', band: '#2A2430', tarp: '#4A3A4A', door: '#7F1D1D', accent: '#EF4444' },  // 7 THE DEATH ZONE
  { wall: '#3A2C3E', band: '#5A4460', tarp: '#9A8AA4', door: '#0F766E', accent: '#38BDF8' },  // 8 THE HILLARY STEP
  { wall: '#2A3448', band: '#4A5468', tarp: '#3A4A66', door: '#475569', accent: '#DC2626' },  // 9 THE SUMMIT
];
/** Each floor's ceiling (the deck over's underside, the room's lid): its own look and color, none of them a door's. */
type CeilKind = 'ply' | 'ice' | 'canvas' | 'tin' | 'frost' | 'foil' | 'ducts' | 'hazard' | 'rock';
const CEIL_LOOK: { col: string; kind: CeilKind }[] = [
  { col: '#6A583E', kind: 'ply' },     // 0 base camp: plywood between the joists
  { col: '#8AB4D0', kind: 'ice' },     // 1 the icefall: frosted panels, plastic icicles
  { col: '#A08036', kind: 'canvas' },  // 2 camp 1: tent canvas sagging between the joists
  { col: '#7A6E60', kind: 'tin' },     // 3 camp 2: corrugated tin, a string of bulbs
  { col: '#C4D2E2', kind: 'frost' },   // 4 the Lhotse face: an ice roof, the fixed ropes looped off it
  { col: '#66748A', kind: 'foil' },    // 5 camp 3: silver insulation, quilted
  { col: '#34403E', kind: 'ducts' },   // 6 camp 4: the oxygen ducts run along it
  { col: '#1C181C', kind: 'hazard' },  // 7 the death zone: black, the beams in hazard stripes, red caged lamps
  { col: '#6A5862', kind: 'rock' },    // 8 the Hillary step: a fiberglass rock overhang
];
/** What's under each floor's name on its board (with its height). */
const FLOOR_GAG = ['', 'MIND THE CREVASSES', 'TENTS ARE FOR DISPLAY', 'MESS TENT CLOSED', 'FIXED ROPES: DO NOT PULL', 'NO SHERPAS ON DUTY', 'THE SOUTH COL', 'NO REFUNDS', 'ONE AT A TIME, PLEASE'];
/** The queue's wait, posted on each floor (the owner's "like a queue for a ride"): sillier the higher he gets. */
const WAIT = ['', '45 MINUTES', '2 HOURS', '4 HOURS', '1 DAY', '3 DAYS', '2 WEEKS', 'A WHOLE SEASON', 'THE REST OF YOUR LIFE'];
const STEEL6 = ramp6('#5A667C'), CHROME = ['#3A4250', '#5E6878', '#8E98A8', '#BCC4D0', '#E8EEF4'], WOOD6 = ramp6('#94703C');
const FLAGS = ['#2563EB', '#F1F5F9', '#DC2626', '#16A34A', '#FACC15'].map(ramp5);
/** An arrow (dir: 1 right, -1 left, 0 up, 2 down), inked. */
const arrowPath = (g: Ctx, x: number, y: number, dir: number, s: number) => {
  g.beginPath();
  if (dir === 0 || dir === 2) { const v = dir === 0 ? 1 : -1; g.moveTo(x, y - 8 * s * v); g.lineTo(x + 7 * s, y); g.lineTo(x + 3 * s, y); g.lineTo(x + 3 * s, y + 8 * s * v); g.lineTo(x - 3 * s, y + 8 * s * v); g.lineTo(x - 3 * s, y); g.lineTo(x - 7 * s, y); }
  else { g.moveTo(x + dir * 9 * s, y); g.lineTo(x, y - 7 * s); g.lineTo(x, y - 3 * s); g.lineTo(x - dir * 8 * s, y - 3 * s); g.lineTo(x - dir * 8 * s, y + 3 * s); g.lineTo(x, y + 3 * s); g.lineTo(x, y + 7 * s); }
  g.closePath();
};
const arrowGlyph = (g: Ctx, x: number, y: number, dir: number, col: string, s = 1) => {
  g.fillStyle = INK; g.save(); g.translate(1, 1); arrowPath(g, x, y, dir, s); g.fill(); g.restore();
  g.fillStyle = col; arrowPath(g, x, y, dir, s); g.fill();
  g.fillStyle = mix(col, '#FFFFFF', 0.4); g.save(); g.beginPath(); g.rect(x - 10 * s, y - 9 * s, 20 * s, 3 * s + 1); g.clip(); arrowPath(g, x, y, dir, s); g.fill(); g.restore();
};
/** A steel upright, w wide: inked, lit down its left, shaded down its right. */
const postV = (g: Ctx, x: number, y0: number, y1: number, w: number, Rm: string[]) => {
  const h = y1 - y0, e = Math.max(1, w >> 2);
  R(g, x - 1, y0, w + 2, h, INK); R(g, x, y0, w, h, Rm[3]); R(g, x, y0, e, h, Rm[5] ?? Rm[4]); R(g, x + e, y0, 1, h, Rm[4]); R(g, x + w - e, y0, e, h, Rm[1]);
};
/** A steel run across, h tall: inked, lit along its top, shaded under. */
const beamH = (g: Ctx, x0: number, x1: number, y: number, h: number, Rm: string[]) => {
  R(g, x0, y - 1, x1 - x0, h + 2, INK); R(g, x0, y, x1 - x0, h, Rm[3]); R(g, x0, y, x1 - x0, 1, Rm[5] ?? Rm[4]); R(g, x0, y + h - 1, x1 - x0, 1, Rm[1]);
};
/** A board: inked, its paint in steps (lit along its top and left, the foot shaded, a dither seam), its corners screwed. */
const board = (g: Ctx, x0: number, y0: number, w: number, h: number, col: string) => {
  const B = ramp6(col);
  R(g, x0 - 2, y0 - 2, w + 4, h + 4, INK); R(g, x0, y0, w, h, B[3]);
  R(g, x0, y0, w, 2, B[5]); R(g, x0, y0 + 2, w, 1, B[4]); R(g, x0, y0, 1, h, B[4]);
  dither(g, x0, y0 + h - 8, w, 4, B[2]); R(g, x0, y0 + h - 4, w, 4, B[2]); R(g, x0, y0 + h - 1, w, 1, B[1]); R(g, x0 + w - 1, y0, 1, h, B[1]);
  for (const [sx, sy] of [[x0 + 3, y0 + 4], [x0 + w - 5, y0 + 4], [x0 + 3, y0 + h - 6], [x0 + w - 5, y0 + h - 6]]) { R(g, sx, sy, 2, 2, B[0]); R(g, sx, sy, 1, 1, B[5]); }
};
/** The park's sign letters, small: enamel in its steps, a drop shadow. */
const smallLook = (col: string, sy = 1): Look => ({ sx: 1, sy, fill: rampDown(col, 0.3), dither: sy > 1, shadow: SIGN_INK, drop: 1, gap: 1 });
/** Words set to fit a width (the look shrunk a step if they won't), centered on x, their foot at y. */
const words = (g: Ctx, s: string, x: number, y: number, L: Look, maxW: number) => {
  let use = L;
  if (signW(s, use) > maxW && (use.sx ?? 1) > 1) use = { ...use, sx: 1 };
  // (bold letters set tight run into each other (the spiral's THE REST OF YOUR LIFE lost its I): thinned first)
  if (signW(s, use) > maxW && use.bold && (use.gap ?? 1) > 0) use = { ...use, bold: false };
  if (signW(s, use) > maxW && (use.gap ?? 1) > 0) use = { ...use, gap: 0 };
  signText(g, s, x, y, use);
};
/** A string of prayer flags from (x0, y) to (x1, y), sagging `sag` in the middle: the cord, the flags in their five
 *  colors, each lit along its top and shaded down its far side, its print a dark mark. */
const prayerFlags = (g: Ctx, x0: number, x1: number, y: number, sag: number, step = 24) => {
  const at = (x: number) => { const u = (x - x0) / (x1 - x0); return y + sag * 4 * u * (1 - u); };
  g.strokeStyle = '#3A3630'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y + 1); g.quadraticCurveTo((x0 + x1) / 2, y + sag * 2 + 1, x1, y + 1); g.stroke();
  g.strokeStyle = '#CBD5E1'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y); g.stroke();
  for (let x = x0 + 8, i = 0; x < x1 - 12; x += step, i++) {
    const fy = Math.round(at(x + 6)), F = FLAGS[(i + Math.round(x0 / step)) % 5], sway = i % 3 === 1 ? 1 : 0;
    R(g, x - 1 + sway, fy, 14, 14, F[0]); R(g, x + sway, fy, 12, 13, F[2]); R(g, x + sway, fy, 12, 2, F[3]); R(g, x + sway, fy + 1, 1, 11, F[3]);
    R(g, x + 10 + sway, fy + 2, 2, 11, F[1]); R(g, x + sway, fy + 11, 12, 2, F[1]); R(g, x + 4 + sway, fy + 4, 4, 5, F[1]); R(g, x + 5 + sway, fy + 5, 2, 1, F[0]);
  }
};
/** A run of queue stanchions and their sagging rope along a floor at y (background: no lit tops, nothing to stand on):
 *  chrome posts on weighted bases, the rope in the floor's accent (shaded under, lit along it), a hook at each end. */
const queueRail = (g: Ctx, x0: number, x1: number, y: number, rope: string) => {
  const n = Math.max(1, Math.round(Math.abs(x1 - x0) / 70)), Rp = ramp5(rope);
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n);
    if (i < n) {
      const nx = x0 + ((x1 - x0) * (i + 1)) / n;
      for (const [w, col, dy] of [[4, INK, 1], [3, Rp[1], 0], [1, Rp[3], -1]] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x, y - 37 + dy); g.quadraticCurveTo((x + nx) / 2, y - 24 + dy, nx, y - 37 + dy); g.stroke(); }
    }
    R(g, x - 3, y - 40, 6, 37, INK); R(g, x - 2, y - 40, 4, 37, CHROME[2]); R(g, x - 2, y - 40, 1, 37, CHROME[4]); R(g, x + 1, y - 40, 1, 37, CHROME[0]);
    R(g, x - 4, y - 44, 8, 5, INK); R(g, x - 3, y - 43, 6, 3, CHROME[3]); R(g, x - 3, y - 43, 6, 1, CHROME[4]);
    R(g, x - 8, y - 5, 16, 5, INK); R(g, x - 7, y - 4, 14, 3, CHROME[1]); R(g, x - 7, y - 4, 14, 1, CHROME[3]);
  }
};
/** An oxygen bottle stood up (9 wide, 24 tall, its foot at yy): steel in its paint's steps, a shoulder, the valve, a band. */
const bottle = (g: Ctx, x: number, yy: number, col = '#C2570C') => {
  const B = ramp5(col);
  R(g, x - 1, yy - 25, 11, 25, INK); R(g, x, yy - 24, 9, 24, B[2]); R(g, x, yy - 24, 2, 24, B[3]); R(g, x + 1, yy - 22, 1, 18, B[4]); R(g, x + 7, yy - 24, 2, 24, B[1]);
  R(g, x + 1, yy - 26, 7, 2, B[2]); R(g, x + 2, yy - 27, 5, 1, B[3]);
  R(g, x + 2, yy - 31, 5, 4, INK); R(g, x + 3, yy - 30, 3, 3, '#A8B0BC'); R(g, x + 6, yy - 30, 2, 1, '#6B7280');
  R(g, x, yy - 15, 9, 4, '#E8EEF4'); R(g, x + 7, yy - 15, 2, 4, '#9CA3AF'); R(g, x + 2, yy - 14, 4, 1, '#166534');
};
/** A sack of fake snow (lumpy, round-topped: nothing to stand on), FAKE SNOW printed on it. */
const sack = (g: Ctx, x: number, yy: number, w = 30, h = 22) => {
  const S = ramp5('#D8D2BE');
  g.fillStyle = INK; g.beginPath(); g.ellipse(x + w / 2, yy - h / 2, w / 2 + 1, h / 2 + 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = S[1]; g.beginPath(); g.ellipse(x + w / 2, yy - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = S[2]; g.beginPath(); g.ellipse(x + w / 2 - 2, yy - h / 2 - 2, w / 2 - 3, h / 2 - 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = S[3]; g.beginPath(); g.ellipse(x + w / 2 - 5, yy - h / 2 - 5, w / 4, h / 5, 0, 0, Math.PI * 2); g.fill();
  R(g, x + w / 2 - 3, yy - h - 2, 6, 4, S[1]); R(g, x + w / 2 - 2, yy - h - 4, 4, 2, '#8A6A3A');
  R(g, x + 5, yy - h / 2 - 1, w - 10, 1, '#1D4ED8'); R(g, x + 5, yy - h / 2 + 2, w - 12, 1, '#1D4ED8'); R(g, x + 6, yy - h / 2 + 5, w - 14, 1, '#1D4ED8');
};
/** The back wall and the scaffold behind the tarp, the tarp with its stretch of the mountain printed on it. */
const paintWall = (g: Ctx, k: number, y: number, top: number) => {
  const T = THEME[k], Wl = ramp6(T.wall), S = ramp6(mix('#5A667C', T.band, 0.35)), Tp = ramp6(T.tarp), H6 = (y - top) / 6;
  // (the wall behind it all, banded: darkest up under the ceiling and down at the deck, lightest where the lamps throw)
  const bands = [Wl[0], Wl[1], Wl[2], Wl[2], Wl[1], Wl[0]];
  bands.forEach((col, i) => R(g, TL, top + i * H6, TR - TL, H6 + 1, col));
  for (let i = 1; i < 6; i++) dither(g, TL, Math.round(top + i * H6) - 2, TR - TL, 2, bands[i]);
  // (the scaffold: standards every 100, ledgers across, braces in two tones, couplers where they meet)
  const LEDG = [top + 26, top + 130, y - 40];
  g.lineCap = 'butt';
  for (let x = TL; x < TR; x += 100) for (let i = 0; i < 2; i++) {
    const ya = LEDG[i], yb = LEDG[i + 1], [a, b] = (x / 100 + i) % 2 ? [x + 8, x + 100] : [x + 100, x + 8];
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(a, ya); g.lineTo(b, yb); g.stroke();
    g.strokeStyle = S[2]; g.lineWidth = 2; g.stroke();
    g.strokeStyle = S[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(a, ya - 1); g.lineTo(b, yb - 1); g.stroke();
  }
  for (const ly of LEDG) beamH(g, TL, TR, ly, 5, S);
  for (let x = TL + 4; x < TR; x += 100) {
    postV(g, x, top, y, 6, S);
    for (const ly of LEDG) { R(g, x - 3, ly - 3, 12, 11, INK); R(g, x - 2, ly - 2, 10, 9, S[4]); R(g, x - 2, ly - 2, 10, 1, S[5]); R(g, x - 2, ly + 5, 10, 2, S[2]); R(g, x + 2, ly + 1, 2, 2, S[0]); }
  }
  // (the tarp, hung off the top ledger: its corner torn down on odd floors, the scaffold showing behind)
  const tx0 = TL + 46, tx1 = TR - 46, ty0 = LEDG[0] + 4, ty1 = y - 8, torn = k % 2 === 1;
  const edge: [number, number][] = [[tx0, ty0]];
  for (let x = tx0 + 36; x <= tx1; x += 36) { edge.push([x - 18, ty0 + 3]); edge.push([Math.min(x, tx1), ty0]); }
  if (torn) { edge.pop(); edge.pop(); edge.push([tx1 - 120, ty0 + 2], [tx1, ty0 + 90]); }
  edge.push([tx1, ty1], [tx0, ty1]);
  poly(g, edge.map(([x, yy]) => [x + 1, yy + 1] as [number, number]), INK);
  g.save(); g.beginPath(); g.moveTo(edge[0][0], edge[0][1]); for (const [x, yy] of edge.slice(1)) g.lineTo(x, yy); g.closePath(); g.clip();
  // (the print's sky: banded down toward its horizon)
  const sky = [mix(T.tarp, '#101828', 0.62), mix(T.tarp, '#101828', 0.5), mix(T.tarp, '#101828', 0.38), mix(T.tarp, '#101828', 0.26)];
  const sh = (ty1 - ty0) / 4;
  sky.forEach((col, i) => R(g, tx0, ty0 + i * sh, tx1 - tx0, sh + 1, col));
  for (let i = 1; i < 4; i++) dither(g, tx0, Math.round(ty0 + i * sh) - 2, tx1 - tx0, 2, sky[i]);
  // (the far range, hazed; then the massif: its peaks lit up their left faces, shaded down their right, snow on top)
  const far: [number, number][] = [[tx0, ty1 - 60]];
  for (let i = 0; i <= 10; i++) far.push([tx0 + ((tx1 - tx0) * (i + 0.5)) / 10.5, ty1 - 90 - hash(i + k * 11) * 70], [tx0 + ((tx1 - tx0) * (i + 1)) / 10.5, ty1 - 70 - hash(i + k * 11 + 5) * 30]);
  far.push([tx1, ty1], [tx0, ty1]);
  poly(g, far, mix(T.tarp, '#101828', 0.15));
  const peaks: [number, number][] = [[TL + 160 + k * 23, top + 60], [TL + 330, top + 110], [TL + 480 + k * 11, top + 40], [TL + 640 - k * 9, top + 96]];
  const base = ty1;
  for (const [px, py] of peaks) {
    const wl = (base - py) * 0.95, wr = (base - py) * 1.1;
    poly(g, [[px - wl, base], [px, py], [px + wr, base]], Tp[2]);
    poly(g, [[px - wl, base], [px, py], [px + wr * 0.12, base]], Tp[3]);
    poly(g, [[px - wl * 0.5, base - (base - py) * 0.5], [px, py], [px - wl * 0.08, base - (base - py) * 0.55]], Tp[4]);
    poly(g, [[px + wr * 0.12, base], [px + wr * 0.35, py + (base - py) * 0.45], [px + wr, base]], Tp[1]);
    // (its snow: white, stepped, a ragged foot dithered into the rock)
    const sd = (base - py) * 0.3, sn: [number, number][] = [[px - wl * 0.3, py + sd]];
    for (let j = 1; j <= 6; j++) sn.push([px - wl * 0.3 + ((wl * 0.3 + wr * 0.3) * j) / 6, py + sd + (j % 2 ? 8 : -2)]);
    sn.push([px, py]);
    poly(g, sn, '#E2EAF4');
    poly(g, [[px - wl * 0.3, py + sd], [px, py], [px + wr * 0.03, py + sd * 0.7]], '#F8FAFC');
    dither(g, Math.round(px - wl * 0.25), Math.round(py + sd + 2), Math.round(wl * 0.5), 4, '#C8D4E4');
  }
  // (its folds: hanging down from the ties, a shadow and a lit crease each)
  for (let x = tx0 + 18; x < tx1; x += 36) { R(g, x - 3, ty0, 5, ty1 - ty0, 'rgba(6, 8, 18, 0.16)'); R(g, x + 2, ty0, 2, ty1 - ty0, 'rgba(255, 255, 255, 0.07)'); }
  R(g, tx0, ty1 - 5, tx1 - tx0, 5, Tp[0]); R(g, tx0, ty0, tx1 - tx0, 3, 'rgba(255, 255, 255, 0.1)');
  g.restore();
  // (the ties up to the ledger, a grommet each; the torn corner's flap hanging off)
  for (let x = tx0; x <= tx1 - (torn ? 120 : 0); x += 36) { R(g, x - 1, LEDG[0] + 2, 2, 4, '#1A1A1A'); R(g, x - 2, ty0 + 2, 5, 5, INK); R(g, x - 1, ty0 + 3, 3, 3, '#B8C0CC'); R(g, x, ty0 + 4, 1, 1, INK); }
  if (torn) {
  }
  // (the prayer flags strung across under the ceiling: before the props, so the signs on the wall are in front of them)
  prayerFlags(g, TL + 4, TR - 4, top + 12, 18, 26);
};
/** The ceiling (the deck over's underside, cy0 down to the room's top): its own look, the beam along its foot, the
 *  floor's name board on that, the lamps caged under it. */
const paintCeiling = (g: Ctx, k: number, cy0: number, top: number) => {
  const { col, kind } = CEIL_LOOK[k], C = ramp6(col), S = STEEL6, hgt = top - cy0;
  // (the deck's underside up top, in shadow)
  R(g, TL, cy0, TR - TL, hgt, C[2]); R(g, TL, cy0, TR - TL, 6, C[0]); dither(g, TL, cy0 + 6, TR - TL, 2, C[0]);
  const mid = cy0 + 8, low = top - 10;
  switch (kind) {
    case 'ply': // (plywood sheets between steel joists, their grain, the sheets' joins)
      for (let x = TL; x < TR; x += 64) { R(g, x, mid, 64, low - mid, C[3]); R(g, x, mid, 64, 2, C[4]); for (let yy = mid + 6; yy < low; yy += 7) R(g, x + 4 + ((yy * 7) % 11), yy, 30 + ((yy * 3) % 20), 1, C[2]); R(g, x + 62, mid, 2, low - mid, C[1]); }
      for (let x = TL + 30; x < TR; x += 128) postV(g, x, mid, low, 8, S);
      break;
    case 'ice': // (frosted panels, the frost dithered in from their edges, the ribs between)
      for (let x = TL; x < TR; x += 100) { R(g, x, mid, 100, low - mid, C[3]); dither(g, x + 2, mid, 96, 6, C[5]); dither(g, x + 2, low - 8, 96, 6, C[2]); R(g, x + 8, mid + 10, 30, 2, C[5]); R(g, x + 12, mid + 14, 14, 1, C[4]); postV(g, x, mid, low, 5, ramp6('#4A6A88')); }
      break;
    case 'canvas': // (tent canvas sagging between the joists, banded into its folds)
      for (let x = TL; x < TR; x += 80) {
        R(g, x, mid, 80, low - mid - 8, C[3]); dither(g, x, mid + 10, 80, 4, C[4]); R(g, x, mid, 80, 8, C[4]);
        g.fillStyle = C[2]; g.beginPath(); g.moveTo(x, low - 8); g.quadraticCurveTo(x + 40, low + 6, x + 80, low - 8); g.lineTo(x + 80, low - 16); g.quadraticCurveTo(x + 40, low - 4, x, low - 16); g.closePath(); g.fill();
        g.fillStyle = C[1]; g.beginPath(); g.moveTo(x, low - 8); g.quadraticCurveTo(x + 40, low + 6, x + 80, low - 8); g.lineTo(x + 80, low - 6); g.quadraticCurveTo(x + 40, low + 8, x, low - 6); g.closePath(); g.fill();
        R(g, x + 38, mid + 4, 2, low - mid - 10, C[2]); postV(g, x, mid, low, 6, WOOD6);
      }
      break;
    case 'tin': // (corrugated tin, its ribs lit and shaded, rust run down it; a string of bulbs along under the beam)
      for (let x = TL; x < TR; x += 8) { R(g, x, mid, 4, low - mid, C[4]); R(g, x + 4, mid, 4, low - mid, C[2]); R(g, x + 1, mid, 1, low - mid, C[5]); }
      for (let i = 0; i < 9; i++) { const x = TL + 40 + hash(i + k * 3) * (TR - TL - 80); R(g, x, mid + 4, 3, 10 + hash(i + 9) * 20, '#7A3A16'); }
      for (let x = TL + 60; x < TR; x += 160) postV(g, x, mid, low, 8, S);
      break;
    case 'frost': // (an ice roof: lumps of it in its steps, dithered)
      R(g, TL, mid, TR - TL, low - mid, C[3]);
      for (let i = 0; i < 16; i++) { const x = TL + i * 52 + hash(i + 40) * 20, w = 50 + hash(i + 41) * 30; g.fillStyle = C[4]; g.beginPath(); g.ellipse(x + w / 2, mid + 10, w / 2, 9, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = C[5]; g.beginPath(); g.ellipse(x + w / 2 - 6, mid + 7, w / 4, 4, 0, 0, Math.PI * 2); g.fill(); }
      dither(g, TL, low - 10, TR - TL, 6, C[2]);
      break;
    case 'foil': // (silver insulation, quilted in diamonds, a glint on each)
      R(g, TL, mid, TR - TL, low - mid, C[3]);
      g.strokeStyle = C[1]; g.lineWidth = 1; g.beginPath();
      for (let x = TL - 40; x < TR + 40; x += 20) { g.moveTo(x, mid); g.lineTo(x + (low - mid), low); g.moveTo(x, low); g.lineTo(x + (low - mid), mid); }
      g.stroke();
      for (let x = TL + 10; x < TR; x += 20) for (let yy = mid + 6; yy < low - 4; yy += 20) R(g, x, yy, 2, 1, C[5]);
      for (let x = TL + 80; x < TR; x += 200) postV(g, x, mid, low, 8, S);
      break;
    case 'ducts': { // (the oxygen ducts: two round runs along it in their steps, flanged, O2 stenciled)
      R(g, TL, mid, TR - TL, low - mid, C[2]);
      const Dct = ramp6('#7C8A96');
      for (const [dy, r] of [[mid + 9, 8], [mid + 26, 6]] as const) {
        R(g, TL, dy - r - 1, TR - TL, r * 2 + 2, INK);
        R(g, TL, dy - r, TR - TL, r * 2, Dct[2]); R(g, TL, dy - r, TR - TL, Math.round(r * 0.6), Dct[3]); R(g, TL, dy - r + 1, TR - TL, 1, Dct[5]); R(g, TL, dy + r - 2, TR - TL, 2, Dct[0]);
        for (let x = TL + 50; x < TR; x += 120) { R(g, x, dy - r - 2, 4, r * 2 + 4, INK); R(g, x + 1, dy - r - 1, 2, r * 2 + 2, Dct[4]); }
      }
      for (let x = TL + 100; x < TR; x += 240) signText(g, 'O2', x, mid + 13, { sx: 1, sy: 1, fill: '#FACC15', gap: 1 });
      break;
    }
    case 'hazard': // (black, its beams in hazard stripes)
      R(g, TL, mid, TR - TL, low - mid, C[2]);
      for (let x = TL + 40; x < TR; x += 120) { R(g, x - 1, mid, 18, low - mid, INK); for (let yy = mid; yy < low; yy += 8) { R(g, x, yy, 16, 4, '#CA8A04'); R(g, x, yy, 16, 1, '#FDE047'); } }
      break;
    case 'rock': // (a fiberglass rock overhang: lumps lit along their tops, drips of it hung under)
      R(g, TL, mid, TR - TL, low - mid, C[2]);
      for (let i = 0; i < 18; i++) { const x = TL + i * 46 + hash(i + 60) * 16, w = 40 + hash(i + 61) * 30, yy = mid + 6 + hash(i + 62) * 12; g.fillStyle = C[3]; g.beginPath(); g.ellipse(x + w / 2, yy, w / 2, 10, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = C[4]; g.beginPath(); g.ellipse(x + w / 2 - 4, yy - 4, w / 3, 4, 0, 0, Math.PI * 2); g.fill(); }
      dither(g, TL, low - 10, TR - TL, 6, C[1]);
      break;
  }
  // (the beam along its foot: the deck's edge, a flange in steel's steps; dark under, it's no lid to stand on)
  R(g, TL, low - 1, TR - TL, 11, INK); R(g, TL, low, TR - TL, 8, S[2]); R(g, TL, low, TR - TL, 1, S[4]); R(g, TL, low + 6, TR - TL, 2, S[0]);
  for (let x = TL + 20; x < TR; x += 40) { R(g, x, low + 3, 2, 2, S[0]); R(g, x, low + 3, 1, 1, S[4]); }
  // (what hangs under it: plastic icicles, the canvas's ties, the bulbs, the fixed ropes looped, the rock's drips)
  if (kind === 'ice' || kind === 'frost') for (let x = TL + 14; x < TR - 10; x += 22) { const l = 6 + Math.round(hash(x * 0.37 + k) * 10); g.fillStyle = INK; g.beginPath(); g.moveTo(x - 3, top - 1); g.lineTo(x + 4, top - 1); g.lineTo(x, top + l + 1); g.closePath(); g.fill(); g.fillStyle = '#D8ECFA'; g.beginPath(); g.moveTo(x - 2, top); g.lineTo(x + 3, top); g.lineTo(x, top + l); g.closePath(); g.fill(); R(g, x - 1, top, 1, Math.max(1, l - 4), '#FFFFFF'); }
  if (kind === 'frost') { g.lineWidth = 2; for (let x = TL + 60; x < TR - 100; x += 180) for (const [col, o] of [['#B91C1C', 0], ['#CA8A04', 6]] as const) { g.strokeStyle = col; g.beginPath(); g.moveTo(x + o, top); g.quadraticCurveTo(x + 45 + o, top + 18, x + 90 + o, top); g.stroke(); } }
  if (kind === 'tin') { g.strokeStyle = '#1A1612'; g.lineWidth = 1; g.beginPath(); g.moveTo(TL, top + 2); for (let x = TL; x < TR; x += 60) g.quadraticCurveTo(x + 30, top + 12, x + 60, top + 2); g.stroke(); for (let x = TL + 30, i = 0; x < TR; x += 60, i++) { const b = ['#FDE68A', '#FCA5A5', '#86EFAC', '#93C5FD'][i % 4]; R(g, x - 2, top + 6, 4, 2, '#3F3F46'); R(g, x - 2, top + 8, 4, 5, b); R(g, x - 1, top + 8, 1, 2, '#FFFFFF'); } }
  if (kind === 'rock') for (let x = TL + 24; x < TR - 10; x += 34) { const l = 4 + Math.round(hash(x * 0.21) * 8); g.fillStyle = C[1]; g.beginPath(); g.moveTo(x - 5, top - 1); g.lineTo(x + 5, top - 1); g.lineTo(x, top + l); g.closePath(); g.fill(); }
  if (kind === 'canvas') for (let x = TL + 40; x < TR; x += 80) { R(g, x - 1, top, 2, 8, '#5A4420'); R(g, x - 3, top + 7, 6, 3, '#5A4420'); }
  // (its lamps, caged, hung under the beam: red in the death zone)
  const lampCol = kind === 'hazard' ? ['#7F1D1D', '#DC2626', '#FCA5A5'] : ['#B45309', '#FDE68A', '#FFFBEB'];
  for (let x = TL + 140; x < TR; x += 260) {
    R(g, x - 1, top, 2, 3, INK); R(g, x - 10, top + 2, 20, 6, INK); R(g, x - 9, top + 3, 18, 4, S[3]); R(g, x - 9, top + 3, 18, 1, S[5]);
    R(g, x - 8, top + 8, 16, 9, lampCol[0]); R(g, x - 7, top + 8, 14, 7, lampCol[1]); R(g, x - 4, top + 9, 6, 3, lampCol[2]);
    for (let i = -8; i <= 6; i += 4) R(g, x + i, top + 8, 1, 9, INK);
    R(g, x - 8, top + 16, 16, 1, INK);
  }
  // (the floor's name board on the beam: its name big, its height and its gag under; bolted up)
  const nx = (TL + TR) / 2, bw = 300, bh = hgt - 22, by = cy0 + 9;
  for (const bx of [nx - bw / 2 + 30, nx + bw / 2 - 34]) { R(g, bx, cy0 + 4, 4, 6, INK); R(g, bx + 1, cy0 + 4, 2, 6, S[4]); }
  board(g, nx - bw / 2, by, bw, bh, '#7C2D12');
  R(g, nx - bw / 2 + 4, by + 3, bw - 8, 1, '#C2410C');
  signText(g, FLOOR_NAMES[k], nx, by + 17, nameLook('#FEF3C7'));
  words(g, `ELEV. ${FLOOR_FT[k].toLocaleString('en-US')} FT${FLOOR_GAG[k] ? ' - ' + FLOOR_GAG[k] : ''}`, nx, by + bh - 6, smallLook('#FDE68A'), bw - 16);
};
/** A staff door's slab (its foot at y, middle at dx): its paint in steps, a lit edge and a shaded one, its panel, a
 *  wired-glass window, its push plate, the hinges, a kick plate in hazard stripes. (Also the doors' tell: stamped.) */
const paintDoorSlab = (g: Ctx, dx: number, y: number, col: string) => {
  const D = ramp6(col);
  R(g, dx - 24, y - 102, 48, 102, D[3]);
  dither(g, dx - 24, y - 40, 48, 4, D[2]); R(g, dx - 24, y - 36, 48, 36, D[2]);
  R(g, dx - 24, y - 102, 48, 2, D[5]); R(g, dx - 24, y - 102, 2, 102, D[4]); R(g, dx + 21, y - 102, 3, 102, D[1]);
  // (the lower panel, pressed in)
  R(g, dx - 15, y - 64, 30, 40, D[1]); R(g, dx - 14, y - 63, 29, 39, D[3]); R(g, dx - 14, y - 25, 29, 1, D[4]); R(g, dx + 14, y - 63, 1, 39, D[4]);
  // (the window: wired glass, dark, a glint)
  R(g, dx - 13, y - 94, 26, 22, INK); R(g, dx - 12, y - 93, 24, 20, '#1A2436'); R(g, dx - 12, y - 83, 24, 10, '#243048');
  for (let i = 0; i < 24; i += 4) R(g, dx - 12 + i, y - 93, 1, 20, '#3A465C');
  for (let i = 0; i < 20; i += 4) R(g, dx - 12, y - 93 + i, 24, 1, '#3A465C');
  g.fillStyle = 'rgba(200, 220, 255, 0.35)'; g.beginPath(); g.moveTo(dx - 10, y - 75); g.lineTo(dx - 2, y - 93); g.lineTo(dx + 2, y - 93); g.lineTo(dx - 6, y - 75); g.closePath(); g.fill();
  R(g, dx - 13, y - 72, 26, 1, D[5]);
  // (the push plate and the handle; the hinges)
  R(g, dx + 10, y - 62, 7, 14, INK); R(g, dx + 11, y - 61, 5, 12, CHROME[2]); R(g, dx + 11, y - 61, 1, 12, CHROME[4]);
  for (const hy of [y - 94, y - 54, y - 16]) { R(g, dx - 25, hy, 3, 8, INK); R(g, dx - 24, hy + 1, 1, 6, CHROME[3]); }
  // (the kick plate)
  R(g, dx - 24, y - 19, 48, 16, INK);
  g.save(); g.beginPath(); g.rect(dx - 23, y - 18, 46, 14); g.clip();
  for (let i = -20; i < 50; i += 10) poly(g, [[dx - 23 + i, y - 4], [dx - 23 + i + 5, y - 4], [dx - 23 + i + 19, y - 18], [dx - 23 + i + 14, y - 18]], '#E0A90A');
  R(g, dx - 23, y - 18, 46, 1, '#FDE68A');
  g.restore();
};
/** One floor (k) of the tower: its back wall, its props, its queue, its signs, its doors, its ways down and up, its
 *  ceiling, its ledges, its deck (lit). Baked once each. */
const paintFloor = (g: Ctx, k: number) => {
  const y = floorY(k), T = THEME[k], A = ramp6(T.accent);
  if (k < FLOORS) {
    const top = floorY(k + 1) + CEIL, cy0 = floorY(k + 1) + DECK, s = exitSide(k);
    paintWall(g, k, y, top);
    // (its props: what's up there of the real mountain, in plastic (dimmed))
    themeProps(g, k, y, top);
    // (the queue (the owner's "like a queue for a ride"): rails along the back toward the way up)
    queueRail(g, s > 0 ? TL + 60 : TR - 60, s > 0 ? TR - 70 : TL + 70, y - 4, T.accent);
    // (QUEUE CONTINUES, hung off the ceiling's beam on two rods by the way up: its arrows, up and on toward it)
    {
      const hx = s > 0 ? TR - 160 : TL + 160, by = top + 24;
      for (const rx of [hx - 48, hx + 46]) { R(g, rx - 1, top - 2, 4, 26, INK); R(g, rx, top - 2, 2, 26, CHROME[3]); R(g, rx - 2, by - 3, 6, 4, CHROME[1]); }
      board(g, hx - 62, by, 124, 36, '#FACC15');
      R(g, hx - 58, by + 3, 116, 1, '#FEF08A');
      words(g, k < FLOORS - 1 ? 'QUEUE CONTINUES' : 'TO THE SUMMIT', hx, by + 13, smallLook('#1C1206'), 116);
      arrowGlyph(g, hx + s * 26, by + 25, s, '#DC2626', 0.85); arrowGlyph(g, hx - s * 10, by + 25, 0, '#DC2626', 0.8);
    }
    // (WAIT FROM THIS POINT, bolted to the scaffold's ledger on brackets, clear of the ledges and the doors)
    if (WAIT[k]) {
      const wx = s > 0 ? TL + 210 : TR - 210, wy = y - 214, ww = 132, wh = 52;
      for (const bx of [wx - 50, wx + 46]) { R(g, bx, top, 3, wy - top, INK); R(g, bx + 1, top, 1, wy - top, CHROME[3]); R(g, bx - 1, wy - 8, 6, 10, INK); R(g, bx, wy - 8, 4, 10, STEEL6[3]); R(g, bx + 1, wy - 6, 2, 2, STEEL6[5]); }
      board(g, wx - ww / 2, wy, ww, wh, '#F1F5F9');
      R(g, wx - ww / 2, wy, ww, 12, T.accent === '#F8FAFC' ? '#1D4ED8' : A[2]); R(g, wx - ww / 2, wy, ww, 1, T.accent === '#F8FAFC' ? '#3B82F6' : A[4]);
      words(g, 'WAIT FROM THIS POINT', wx, wy + 10, { sx: 1, sy: 1, fill: '#140A04', gap: 1 }, ww - 6);
      words(g, WAIT[k], wx, wy + 32, { sx: 2, sy: 2, fill: rampDown('#B91C1C', 0.3), dither: true, shadow: '#F8C8C8', drop: 1, gap: 1 }, ww - 8);
      words(g, 'THANKS FOR WAITING', wx, wy + 45, { sx: 1, sy: 1, fill: '#64748B', gap: 1 }, ww - 8);
    }
    // (the staff doors at the back: doorways, not wall: a frame in the floor's accent (inked, lit up its left), the door
    // in its own paint, STAFF ONLY over it, a beacon on top (its flash: the tell, live))
    if (k > 0) for (const dx of DOORS_X) {
      R(g, dx - 34, y - 112, 68, 112, INK); R(g, dx - 32, y - 110, 64, 110, A[2]); R(g, dx - 32, y - 110, 3, 110, A[4]); R(g, dx - 32, y - 110, 64, 2, A[5]); R(g, dx + 29, y - 110, 3, 110, A[0]);
      R(g, dx - 27, y - 105, 54, 105, '#06080C'); R(g, dx - 27, y - 105, 54, 2, A[0]);
      paintDoorSlab(g, dx, y, T.door);
      R(g, dx - 38, y - 4, 76, 4, INK); R(g, dx - 37, y - 3, 74, 2, CHROME[2]);
      board(g, dx - 33, y - 130, 66, 16, '#F8FAFC');
      words(g, 'STAFF ONLY', dx, y - 116, { sx: 1, sy: 2, fill: '#B91C1C', gap: 1 }, 58);
      R(g, dx - 7, y - 135, 14, 3, INK); R(g, dx - 6, y - 134, 12, 2, STEEL6[3]);
      R(g, dx - 5, y - 142, 10, 7, INK); R(g, dx - 4, y - 141, 8, 6, '#5A1010'); R(g, dx - 3, y - 141, 2, 2, '#9A3030');
      for (const cx of [dx - 3, dx, dx + 3]) R(g, cx, y - 142, 1, 7, INK);
    }
    // (the way down, on the left, where he came in: a plain steel arch, the stair going down inside it into the dark)
    if (k > 0) {
      const ex = TL + 22;
      R(g, ex - 20, y - 130, 40, 130, INK); R(g, ex - 18, y - 128, 36, 128, STEEL6[2]); R(g, ex - 18, y - 128, 2, 128, STEEL6[4]); R(g, ex - 18, y - 128, 36, 2, STEEL6[5]);
      ['#0C1018', '#090C14', '#06080E', '#04050A'].forEach((col, i) => R(g, ex - 14, y - 122 + i * 30, 28, 31, col));
      for (let i = 0; i < 5; i++) R(g, ex - 14 + i * 5, y - 92 + i * 18, 14, 2, i < 3 ? '#2A3240' : '#1A2030');
      board(g, ex - 12, y - 152, 66, 14, '#475569');
      words(g, 'WAY DOWN', ex + 16, y - 141, { sx: 1, sy: 1, fill: '#E2E8F0', shadow: INK, gap: 1 }, 50);
      arrowGlyph(g, ex + 46, y - 145, 2, '#E2E8F0', 0.45);
    }
    // (the way up: an archway in the side wall at its edge, striped like a queue's entrance, the stair going up inside;
    // its sign over it; the lamp's housing (its lens: live))
    {
      const ex = s > 0 ? TR - 22 : TL + 22;
      R(g, ex - 22, y - 140, 44, 140, INK);
      ['#0E1420', '#0A0E18', '#070A12', '#05070C'].forEach((col, i) => R(g, ex - 18, y - 136 + i * 34, 36, 35, col));
      for (let i = 0; i < 5; i++) R(g, ex - 18 + i * 7, y - 20 - i * 22, 12, 2, '#2E3848');
      for (let yy = y - 136; yy < y; yy += 14) { R(g, ex - 22, yy, 4, 7, A[3]); R(g, ex - 22, yy, 1, 7, A[5]); R(g, ex + 18, yy + 7, 4, 7, A[3]); }
      R(g, ex - 22, y - 140, 44, 4, A[1]); R(g, ex - 22, y - 140, 44, 1, A[4]);
      R(g, ex - 7, y - 151, 14, 10, INK); R(g, ex - 6, y - 150, 12, 8, STEEL6[2]); R(g, ex - 5, y - 147, 10, 6, '#111318');
      const sx = s > 0 ? TR - 52 : TL + 52;
      board(g, sx - 44, y - 172, 88, 18, '#15803D');
      words(g, k < FLOORS - 1 ? 'WAY UP' : 'SUMMIT', sx - 8, y - 159, { sx: 1, sy: 2, fill: rampDown('#F0FDF4', 0.2), shadow: '#052E16', drop: 1, gap: 1 }, 60);
      arrowGlyph(g, sx + 28, y - 163, s, '#F0FDF4', 0.6);
    }
    paintCeiling(g, k, cy0, top);
  }
  // (the ledges: shelves of planks on steel legs (stood on: their lips lit), bottles or sacks of fake snow racked under
  // them, the snow's drips down over their fronts)
  for (const [x, h, w] of FLOOR_LEDGES[k]) {
    const ly = y - h;
    g.strokeStyle = STEEL6[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 12, ly + 20); g.lineTo(x + w - 12, y - 6); g.moveTo(x + w - 12, ly + 20); g.lineTo(x + 12, y - 6); g.stroke();
    for (const lx of [x + 6, x + w - 12]) { postV(g, lx, ly + 16, y - 2, 6, STEEL6); R(g, lx - 3, y - 3, 12, 3, INK); R(g, lx - 2, y - 3, 10, 2, STEEL6[2]); }
    if (h <= 110 && k !== 7) { if (k % 2) for (let t = x + 18; t < x + w - 24; t += 13) bottle(g, t, y - 4, (t / 13) % 3 < 1 ? '#15803D' : '#C2570C'); else for (let t = x + 16; t < x + w - 40; t += 34) sack(g, t, y - 3); }
    else beamH(g, x + 8, x + w - 8, y - 60, 5, STEEL6);
    R(g, x, ly, w, 16, INK); R(g, x + 1, ly + 1, w - 2, 14, WOOD6[3]); R(g, x + 1, ly + 10, w - 2, 5, WOOD6[2]); dither(g, x + 1, ly + 8, w - 2, 2, WOOD6[2]);
    for (let px = x + 26; px < x + w - 4; px += 26) { R(g, px, ly + 4, 1, 11, WOOD6[1]); R(g, px + 1, ly + 4, 1, 11, WOOD6[4]); }
    R(g, x + 1, ly + 1, w - 2, 2, '#FDE68A'); R(g, x + 1, ly + 3, w - 2, 1, WOOD6[5]); R(g, x + 1, ly + 14, w - 2, 1, WOOD6[0]);
    for (let d = x + 10; d < x + w - 8; d += 17) { const l = 3 + Math.round(hash(d + k) * 6); R(g, d, ly + 15, 5, l, '#E2E8F0'); R(g, d + 1, ly + 15 + l, 3, 2, '#E2E8F0'); R(g, d + 4, ly + 15, 1, l, '#94A3B8'); }
  }
  // (the deck under it: diamond plate in steel's steps, lit along its top (standable reads standable), the queue's
  // arrows painted along its face toward the way up)
  if (k > 0) {
    const S = STEEL6;
    R(g, TL, y, TR - TL, DECK, S[2]); dither(g, TL, y + 6, TR - TL, DECK - 12, S[3]); R(g, TL, y + DECK - 5, TR - TL, 5, S[1]); R(g, TL, y + DECK - 1, TR - TL, 1, INK);
    R(g, TL, y, TR - TL, 2, '#F1F5F9'); R(g, TL, y + 2, TR - TL, 2, S[5]); R(g, TL, y + 4, TR - TL, 1, S[0]);
    for (let x = TL + 20; x < TR; x += 40) { R(g, x, y + 8, 2, 2, S[0]); R(g, x, y + 8, 1, 1, S[5]); R(g, x, y + 16, 2, 2, S[0]); }
    for (let x = TL + 200; x < TR; x += 200) R(g, x, y + 5, 1, DECK - 6, S[0]);
    if (k < FLOORS) for (let x = TL + 100; x < TR - 40; x += 200) arrowGlyph(g, x, y + 13, exitSide(k), mix(T.accent === '#F8FAFC' ? '#FACC15' : T.accent, S[2], 0.15), 0.5);
  }
};
/** What's on each floor of the real mountain, done in plastic (background: dimmed, nothing to stand on). */
const themeProps = (g: Ctx, k: number, y: number, top: number) => {
  /** A tent: its panels lit up the near side, shaded on the far, the ridge and its seams, a door flap, guy lines. */
  const tent = (x: number, col: string, w = 90) => {
    const C = ramp6(col), h = Math.round(w * 0.62);
    g.strokeStyle = '#94A3B8'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x - w / 2 - 22, y); g.moveTo(x, y - h); g.lineTo(x + w / 2 + 22, y); g.stroke();
    poly(g, [[x - w / 2 - 3, y], [x, y - h - 3], [x + w / 2 + 3, y]], INK);
    poly(g, [[x - w / 2, y], [x, y - h], [x, y]], C[4]); poly(g, [[x, y - h], [x + w / 2, y], [x, y]], C[2]);
    poly(g, [[x - w / 2, y], [x - w / 4, y - h / 2], [x - w / 4 + 6, y - h / 2], [x - w / 2 + 8, y]], C[3]);
    poly(g, [[x + w / 2, y], [x + w / 4, y - h / 2], [x + w / 4 + 6, y - h / 2], [x + w / 2 - 6, y]], C[1]);
    R(g, x - 1, y - h, 2, h, C[5]);
    poly(g, [[x - 12, y], [x, y - 28], [x + 12, y]], '#0A0C12'); poly(g, [[x, y - 28], [x + 12, y], [x + 4, y]], C[1]); R(g, x - 1, y - 26, 1, 26, '#64748B');
    R(g, x - w / 2 - 24, y - 3, 3, 3, '#64748B'); R(g, x + w / 2 + 21, y - 3, 3, 3, '#64748B');
  };
  switch (k) {
    case 1: { // (the icefall: blocks of fake ice in their steps, the ladders laid across between them)
      const I = ramp6('#9CC8E4');
      for (const [x, w, h] of [[TL + 250, 90, 70], [TL + 440, 70, 100], [TR - 260, 110, 60]]) {
        poly(g, [[x - 2, y], [x + 8, y - h - 2], [x + w - 12, y - h - 14], [x + w + 2, y]], INK);
        poly(g, [[x, y], [x + 10, y - h], [x + w - 14, y - h - 12], [x + w, y]], I[3]);
        poly(g, [[x + 10, y - h], [x + w - 14, y - h - 12], [x + w * 0.55, y - h * 0.55], [x + 14, y - h * 0.7]], I[5]);
        poly(g, [[x + w * 0.55, y - h * 0.55], [x + w - 14, y - h - 12], [x + w, y], [x + w * 0.6, y]], I[2]);
        dither(g, x + 12, Math.round(y - h * 0.5), Math.round(w * 0.4), 4, I[4]); R(g, x + 16, y - h + 6, 2, Math.round(h * 0.4), '#FFFFFF');
      }
      for (const x of [TL + 340, TR - 360]) { R(g, x - 1, y - 11, 82, 3, INK); R(g, x, y - 10, 80, 2, CHROME[3]); R(g, x - 1, y - 5, 82, 3, INK); R(g, x, y - 4, 80, 2, CHROME[2]); for (let t = x + 4; t < x + 80; t += 10) R(g, t, y - 9, 2, 5, CHROME[2]); }
      break;
    }
    case 2: tent(TL + 260, '#FACC15'); tent(TL + 500, '#F97316', 70); tent(TR - 250, '#EAB308', 100); break;
    case 3: { // (camp 2: the mess tent (its name on it), the table and its pots)
      tent(TL + 300, '#16A34A', 140);
      signText(g, 'MESS', TL + 274, y - 30, { sx: 1, sy: 1, fill: '#F0FDF4', shadow: '#052E16', gap: 1 }); signText(g, 'TENT', TL + 274, y - 21, { sx: 1, sy: 1, fill: '#F0FDF4', shadow: '#052E16', gap: 1 });
      const Tb = ramp6('#475569');
      R(g, TL + 469, y - 41, 62, 6, INK); R(g, TL + 470, y - 40, 60, 4, Tb[3]); R(g, TL + 470, y - 40, 60, 1, Tb[5]);
      for (const lx of [TL + 474, TL + 522]) R(g, lx, y - 36, 4, 36, Tb[1]);
      for (const [px, pw, ph] of [[TL + 478, 18, 12], [TL + 502, 20, 10]] as const) { R(g, px - 1, y - 41 - ph - 1, pw + 2, ph + 1, INK); R(g, px, y - 41 - ph, pw, ph, CHROME[2]); R(g, px, y - 41 - ph, 3, ph, CHROME[4]); R(g, px - 2, y - 41 - ph, pw + 4, 2, CHROME[3]); }
      break;
    }
    case 4: { // (the Lhotse face: a steep wall of fake ice up the back, banded, the fixed ropes down it, their anchors)
      const I = ramp6('#7E92AC');
      poly(g, [[TL + 197, y], [TL + 518, top + 27], [TL + 623, top + 27], [TL + 383, y]], INK);
      poly(g, [[TL + 200, y], [TL + 520, top + 30], [TL + 620, top + 30], [TL + 380, y]], I[3]);
      poly(g, [[TL + 330, y], [TL + 590, top + 30], [TL + 620, top + 30], [TL + 380, y]], I[2]);
      for (let i = 1; i < 6; i++) { const yy = y - ((y - top - 30) * i) / 6, xx = TL + 200 + (320 * i) / 6; dither(g, Math.round(xx), Math.round(yy), 120, 2, I[5]); }
      for (const [col, o] of [['#DC2626', 0], ['#CA8A04', 40]] as const) { g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(TL + 260 + o, y); g.lineTo(TL + 560 + o, top + 34); g.stroke(); g.strokeStyle = col; g.lineWidth = 2; g.stroke(); for (let i = 1; i < 4; i++) { const ax = TL + 260 + o + (300 * i) / 4, ay = y - ((y - top - 34) * i) / 4; R(g, ax - 2, ay - 2, 5, 5, INK); R(g, ax - 1, ay - 1, 3, 3, CHROME[3]); } }
      break;
    }
    case 5: tent(TL + 230, '#F97316', 80); tent(TL + 390, '#DC2626', 80); tent(TR - 300, '#F97316', 110); break;
    case 6: // (camp 4, the south col: oxygen bottles, piles of them, the empties on their sides)
      for (let i = 0; i < 9; i++) bottle(g, TL + 220 + (i % 5) * 12 + Math.floor(i / 5) * 6, y - Math.floor(i / 5) * 25, i % 3 ? '#C2570C' : '#15803D');
      for (let i = 0; i < 7; i++) bottle(g, TR - 320 + (i % 4) * 12, y - Math.floor(i / 4) * 25, i % 2 ? '#C2570C' : '#1D4ED8');
      for (const [bx, col] of [[TL + 400, '#C2570C'], [TL + 430, '#15803D']] as const) { const B = ramp5(col); R(g, bx - 1, y - 11, 26, 11, INK); R(g, bx, y - 10, 24, 9, B[2]); R(g, bx, y - 10, 24, 2, B[3]); R(g, bx, y - 3, 24, 2, B[1]); R(g, bx + 24, y - 8, 4, 5, '#A8B0BC'); }
      break;
    case 7: { // (the death zone: frozen mannequins laid out stiff in their down suits, the famous green boots)
      for (const [x, f] of [[TL + 260, 1], [TR - 300, -1]] as const) {
        const Su = ramp5(f > 0 ? '#C2410C' : '#1D4ED8'), Bt = ramp5('#16A34A');
        // (its head (a helmet, goggles), the suit in its quilted rolls, the legs laid out, the boots)
        const hx = x - 34 * f, yy = y - 2;
        g.fillStyle = INK; g.beginPath(); g.ellipse(hx, yy - 8, 9, 8, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#E2E8F0'; g.beginPath(); g.ellipse(hx, yy - 8, 8, 7, 0, 0, Math.PI * 2); g.fill();
        R(g, hx - 5, yy - 9, 10, 4, '#0F172A'); R(g, hx - 4, yy - 9, 3, 1, '#7DD3FC');
        R(g, Math.min(x - 24 * f, x + 22 * f) - 1, yy - 15, 47, 15, INK);
        for (let i = 0; i < 5; i++) { const sx = x - 24 * f + i * 9 * f - (f < 0 ? 9 : 0); R(g, sx, yy - 14, 9, 13, Su[2]); R(g, sx, yy - 14, 9, 3, Su[3]); R(g, sx, yy - 4, 9, 3, Su[1]); R(g, sx + (f > 0 ? 8 : 0), yy - 14, 1, 13, Su[0]); }
        R(g, Math.min(x + 21 * f, x + 50 * f) - 1, yy - 11, 31, 11, INK);
        R(g, Math.min(x + 22 * f, x + 50 * f), yy - 10, 28, 9, Su[1]); R(g, Math.min(x + 22 * f, x + 50 * f), yy - 10, 28, 2, Su[2]);
        const bx = Math.min(x + 50 * f, x + 62 * f);
        R(g, bx - 1, yy - 15, 14, 15, INK); R(g, bx, yy - 14, 12, 13, Bt[2]); R(g, bx, yy - 14, 12, 3, Bt[3]); R(g, bx, yy - 3, 12, 2, Bt[0]); R(g, bx + 2, yy - 10, 8, 1, Bt[4]);
      }
      break;
    }
    case 8: { // (the Hillary step: the big rock step at the back, moulded fiberglass in its steps, a fixed rope up it)
      const Rk = ramp6('#7A6A58');
      const pts: [number, number][] = [[TL + 240, y], [TL + 260, y - 120], [TL + 420, y - 130], [TL + 440, y - 60], [TL + 560, y - 60], [TL + 580, y]];
      poly(g, pts.map(([x, yy]) => [x + (x < TL + 400 ? -2 : 2), yy - 2] as [number, number]), INK);
      poly(g, pts, Rk[3]);
      poly(g, [[TL + 260, y - 120], [TL + 420, y - 130], [TL + 410, y - 112], [TL + 268, y - 104]], Rk[5]);
      poly(g, [[TL + 440, y - 60], [TL + 560, y - 60], [TL + 552, y - 48], [TL + 446, y - 48]], Rk[5]);
      poly(g, [[TL + 420, y - 130], [TL + 440, y - 60], [TL + 440, y], [TL + 410, y]], Rk[1]);
      poly(g, [[TL + 560, y - 60], [TL + 580, y], [TL + 556, y]], Rk[1]);
      dither(g, TL + 266, y - 100, 140, 4, Rk[4]); dither(g, TL + 250, y - 30, 180, 4, Rk[2]);
      for (let i = 0; i < 7; i++) { const cx = TL + 270 + hash(i + 80) * 140, cy = y - 90 + hash(i + 81) * 70; R(g, cx, cy, 10 + hash(i + 82) * 14, 1, Rk[1]); }
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(TL + 230, y); g.quadraticCurveTo(TL + 270, y - 80, TL + 330, y - 126); g.stroke(); g.strokeStyle = '#DC2626'; g.lineWidth = 2; g.stroke();
      // (the refill (the big health and ammo on the deck in front of it): LAST AID STATION, a first aid cabinet and an
      // oxygen rack on a cart at the step's foot, its board on a post; behind the play, nothing to stand on)
      { const cx = TL + 196, cy = y;
        R(g, cx - 1, cy - 40, 132, 34, INK); R(g, cx, cy - 39, 130, 32, '#3F4654'); R(g, cx, cy - 39, 130, 2, '#6B7486'); R(g, cx, cy - 10, 130, 3, '#262B34');
        for (const wx of [cx + 12, cx + 116]) { R(g, wx - 6, cy - 8, 12, 8, INK); R(g, wx - 5, cy - 7, 10, 6, '#1C1F26'); R(g, wx - 2, cy - 5, 4, 2, '#8A93A0'); }
        R(g, cx + 6, cy - 36, 38, 26, INK); R(g, cx + 7, cy - 35, 36, 24, '#F1F5F9'); R(g, cx + 7, cy - 35, 36, 2, '#FFFFFF'); R(g, cx + 40, cy - 35, 3, 24, '#B8C0CC');
        R(g, cx + 22, cy - 31, 6, 16, '#DC2626'); R(g, cx + 17, cy - 26, 16, 6, '#DC2626'); R(g, cx + 22, cy - 31, 2, 16, '#F87171');
        for (let i = 0; i < 5; i++) bottle(g, cx + 54 + i * 12, cy - 9, i % 2 ? '#15803D' : '#C2570C');
        postV(g, cx + 118, cy - 86, cy - 40, 4, STEEL6);
        board(g, cx + 70, cy - 108, 100, 26, '#B91C1C');
        words(g, 'LAST AID STATION', cx + 120, cy - 97, { sx: 1, sy: 1, fill: '#FFFFFF', gap: 1 }, 94);
        words(g, 'FREE REFILLS', cx + 120, cy - 88, { sx: 1, sy: 1, fill: '#FDE68A', gap: 1 }, 94); }
      break;
    }
  }
  // (dimmed: behind the play, nothing to stand on)
  g.fillStyle = 'rgba(6, 8, 16, 0.2)'; g.fillRect(TL, top, TR - TL, y - top);
};
/** The way up's shutter (live: it rolls up into its arch's top as the floor's cleared): slats in steel's steps, its
 *  foot bar in hazard stripes; it fills the arch (no way over it). Stamped whole, cut to what's down. */
const SHUT_H = 136;
const paintShutter = (g: Ctx, x: number, y: number) => {
  R(g, x - 1, y - SHUT_H, 38, SHUT_H, INK);
  for (let yy = y - SHUT_H; yy < y - 12; yy += 8) { R(g, x, yy, 36, 7, STEEL6[3]); R(g, x, yy, 36, 1, STEEL6[5]); R(g, x, yy + 5, 36, 2, STEEL6[1]); R(g, x, yy + 3, 36, 1, STEEL6[4]); }
  dither(g, x, y - 60, 36, 4, STEEL6[1]);
  R(g, x, y - 12, 36, 12, INK);
  for (let i = 0; i < 36; i += 8) R(g, x + i, y - 11, 4, 10, '#DC2626');
  R(g, x, y - 12, 36, 1, '#FCA5A5'); R(g, x + 14, y - 9, 8, 4, CHROME[3]);
};
const drawTower = (c: Ctx, state: GameState, gates: number[], tells: { x: number; t: number }[], lockedFloor: number | null, ox = 0) => {
  if (!vis(state, TL + ox, TR + ox, ox ? 0 : 60)) return;
  if (ox) { c.save(); c.translate(ox, 0); }
  for (let k = 0; k <= FLOORS; k++) {
    const y = floorY(k);
    if (!visY(state, y - FLOOR - 40, y + CEIL + 40)) continue;
    stamp(c, `wp-floor-${k}`, TL - 4, y - FLOOR - 4, TR - TL + 8, FLOOR + DECK + 8, g => paintFloor(g, k));
    // (the way up's shutter: down till the floor's clear, then it rolls up into the arch's top; the way up's lamp,
    // green once it's open)
    if (k < FLOORS) {
      const s = exitSide(k), ex = s > 0 ? TR - 22 : TL + 22, lift = gates[k] ?? 0, gx = ex - 18;
      if (lift < 0.98) {
        // (one stamp for every floor's, put down where it is: (0, 0) its foot's left)
        const down = Math.round(SHUT_H * (1 - lift));
        if (down >= SHUT_H - 1) { c.save(); c.translate(gx, y); stamp(c, 'wp-shutter', -2, -SHUT_H - 2, 40, SHUT_H + 4, g => paintShutter(g, 0, 0)); c.restore(); }
        else {
          // (rolling up: live, a few slats and its foot bar (a clipped stamp cost more, without a GPU))
          const y0 = y - SHUT_H, foot = y0 + down;
          R(c, gx - 1, y0, 38, down, INK);
          for (let yy = foot - 12 - 8; yy >= y0 - 7; yy -= 8) { const t = Math.max(y0, yy); R(c, gx, t, 36, yy + 7 - t, STEEL6[3]); if (yy >= y0) R(c, gx, yy, 36, 1, STEEL6[5]); }
          if (down > 12) { R(c, gx, foot - 12, 36, 12, '#DC2626'); R(c, gx, foot - 12, 36, 1, '#FCA5A5'); R(c, gx, foot - 2, 36, 2, INK); }
        }
      }
      const on = lift > 0.9, blink = Math.floor(state.frame / 15) % 2;
      R(c, ex - 4, y - 146, 8, 4, on ? (blink ? '#4ADE80' : '#16A34A') : '#B91C1C');
      R(c, ex - 3, y - 146, 2, 1, on ? '#DCFCE7' : '#FCA5A5');
    }
    // (a door's tell: it rattles in its dark frame, its beacon flashing)
    if (k === lockedFloor && !ox) for (const t of tells) {
      const on = (t.t >> 2) % 2 === 0, j = on ? 2 : -2;
      R(c, t.x - 27, y - 105, 54, 105, '#06080C');
      c.save(); c.translate(t.x + j, 0);
      stamp(c, `wp-door-${k}`, -26, y - 104, 52, 106, g => paintDoorSlab(g, 0, y, THEME[k].door));
      c.restore();
      if (on) { steppedGlow(c, t.x, y - 138, 16, '#F87171', 0.6, 0.08, 3); R(c, t.x - 4, y - 141, 8, 6, '#FCA5A5'); R(c, t.x - 3, y - 141, 2, 2, '#FFFFFF'); }
    }
  }
  if (ox) c.restore();
};
/** The mountain's outside, round which the spiral goes (the owner's: "the 'rotating tower' thing should sell the idea of
 *  climbing the mountain or rather, a weird floridian tacky facismile of it"): fiberglass rock with its seams and bolts,
 *  fake snow (paint, foam, cotton) patchy and sun-faded, more of it and colder the higher, plastic icicles, prayer flags
 *  between scaffold poles, the warm Florida night through the gaps (a palm, the back of an AC unit, pipes), its tacky
 *  signs and statues; and the queue: the spiral's steps, its stanchions and rope, its signs. Band k: floor k up to k+1. */
const FACE_SIGNS: [string, string][] = [
  ['BASE CAMP', 'GIFT SHOP >'], ['KHUMBU ICEFALL', '(FIBERGLASS)'], ['OXYGEN BAR', '$12 A HUFF'], ['CAMP 2', 'NOW A GIFT SHOP'],
  ['YETI SIGHTINGS', 'DAILY 7PM'], ['SHERPA PHOTO', '$25'], ['CREVASSE', '(DECAL)'], ['DEATH ZONE', 'PHOTO OP $40'], ['ALMOST THERE!', '(NOT REALLY)'],
];
const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
/** A statue on the face (stood on its plinth at (sx, sy)): the yeti mascot, its paint peeling; the sherpa animatronic,
 *  seized with an arm up, its wires out. (Joints from limb.ts.) */
const yetiStatue = (g: Ctx, sx: number, sy: number) => {
  const F = ramp6('#DCE6F0'), Pl = ramp6('#57534E');
  // (the plinth, its plaque)
  R(g, sx - 37, sy - 7, 74, 15, INK); R(g, sx - 36, sy - 6, 72, 13, Pl[3]); R(g, sx - 36, sy - 6, 72, 2, Pl[5]); R(g, sx - 36, sy + 4, 72, 3, Pl[1]);
  signText(g, 'DO NOT CLIMB', sx, sy + 4, { sx: 1, sy: 1, fill: '#FDE68A', gap: 0 });
  // (its legs, stumpy; its body, fur in rolls; its arms hanging (the elbow from limb.ts), the fists)
  for (const lx of [sx - 18, sx + 6]) { R(g, lx - 1, sy - 30, 14, 24, INK); R(g, lx, sy - 29, 12, 23, F[2]); R(g, lx, sy - 29, 3, 23, F[4]); R(g, lx - 2, sy - 10, 16, 4, F[1]); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(sx, sy - 58, 31, 34, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = F[2]; g.beginPath(); g.ellipse(sx, sy - 58, 30, 33, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = F[3]; g.beginPath(); g.ellipse(sx - 6, sy - 62, 22, 27, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = F[4]; g.beginPath(); g.ellipse(sx - 12, sy - 70, 10, 14, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 5; i++) R(g, sx - 20 + i * 9, sy - 40 + (i % 2) * 3, 6, 2, F[1]);
  g.lineCap = 'round';
  for (const s of [-1, 1]) {
    const [shx, shy] = [sx + s * 26, sy - 80], [hx, hy] = [sx + s * 34, sy - 36], [ex, ey] = elbowFront(shx, shy, hx, hy, 24, 24, s);
    for (const [w, col] of [[14, INK], [11, F[2]], [4, F[4]]] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(shx - (w === 4 ? s * 3 : 0), shy); g.lineTo(ex - (w === 4 ? s * 3 : 0), ey); g.lineTo(hx - (w === 4 ? s * 3 : 0), hy); g.stroke(); }
    g.fillStyle = INK; g.beginPath(); g.arc(hx, hy + 3, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = F[1]; g.beginPath(); g.arc(hx, hy + 3, 6, 0, Math.PI * 2); g.fill();
  }
  g.lineCap = 'butt';
  // (its head: the brow, the eyes, the fangs; the paint gone in patches, the gray fiberglass under)
  g.fillStyle = INK; g.beginPath(); g.ellipse(sx, sy - 102, 21, 19, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = F[3]; g.beginPath(); g.ellipse(sx, sy - 102, 20, 18, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = F[4]; g.beginPath(); g.ellipse(sx - 5, sy - 108, 11, 8, 0, 0, Math.PI * 2); g.fill();
  R(g, sx - 12, sy - 104, 24, 4, F[1]); R(g, sx - 10, sy - 102, 6, 4, '#7F1D1D'); R(g, sx + 4, sy - 102, 6, 4, '#7F1D1D'); R(g, sx - 9, sy - 102, 2, 2, '#FCA5A5'); R(g, sx + 5, sy - 102, 2, 2, '#FCA5A5');
  R(g, sx - 9, sy - 93, 18, 6, '#3A1010'); R(g, sx - 7, sy - 93, 3, 4, '#F8FAFC'); R(g, sx + 4, sy - 93, 3, 4, '#F8FAFC');
  for (let i = 0; i < 8; i++) { const px = sx - 24 + hash(sx + i * 3.3) * 44, py = sy - 118 + hash(sx + i * 5.1) * 96; R(g, px - 1, py - 1, 9, 7, '#5A5450'); R(g, px, py, 7, 5, '#8A847E'); R(g, px, py, 7, 1, '#A8A29E'); }
};
const sherpaStatue = (g: Ctx, sx: number, sy: number) => {
  const J = ramp6('#B91C1C'), Pn = ramp6('#3F3F46'), Sk = ramp6('#B07A4A'), Pl = ramp6('#57534E');
  R(g, sx - 31, sy - 7, 62, 15, INK); R(g, sx - 30, sy - 6, 60, 13, Pl[3]); R(g, sx - 30, sy - 6, 60, 2, Pl[5]); R(g, sx - 30, sy + 4, 60, 3, Pl[1]);
  signText(g, 'OUT OF ORDER', sx, sy + 4, { sx: 1, sy: 1, fill: '#FDE68A', gap: 0 });
  // (its legs (the knees from limb.ts: stood near straight), its boots)
  g.lineCap = 'round';
  for (const s of [-1, 1]) {
    const [hx, hy] = [sx + s * 6, sy - 40], [fx, fy] = [sx + s * 8, sy - 10], [kx, ky] = kneeFront(hx, hy, fx, fy, 16, 16, s);
    for (const [w, col] of [[11, INK], [8, Pn[3]], [2, Pn[5]]] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(hx - (w === 2 ? 2 : 0), hy); g.lineTo(kx - (w === 2 ? 2 : 0), ky); g.lineTo(fx - (w === 2 ? 2 : 0), fy); g.stroke(); }
    R(g, fx - 6, fy - 2, 14, 8, INK); R(g, fx - 5, fy - 1, 12, 6, '#57301A'); R(g, fx - 5, fy - 1, 12, 1, '#8A5A30');
  }
  // (the down jacket, quilted; the arms: the left hanging, the right seized up over his head (elbows from limb.ts))
  R(g, sx - 15, sy - 93, 30, 56, INK); R(g, sx - 14, sy - 92, 28, 54, J[3]); R(g, sx - 14, sy - 92, 6, 54, J[4]); R(g, sx + 9, sy - 92, 5, 54, J[1]);
  for (let yy = sy - 82; yy < sy - 40; yy += 10) R(g, sx - 14, yy, 28, 2, J[1]);
  R(g, sx - 1, sy - 92, 2, 54, J[2]);
  const arms: [number, number, number, number][] = [[sx - 12, sy - 88, sx - 18, sy - 50], [sx + 12, sy - 88, sx + 18, sy - 136]];
  for (const [shx, shy, hx, hy] of arms) {
    const [ex, ey] = elbowFront(shx, shy, hx, hy, 20, 20, Math.sign(shx - sx));
    for (const [w, col] of [[11, INK], [8, J[3]], [2, J[5]]] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(shx, shy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke(); }
    g.fillStyle = INK; g.beginPath(); g.arc(hx, hy, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = Sk[3]; g.beginPath(); g.arc(hx, hy, 4, 0, Math.PI * 2); g.fill();
  }
  // (a torn wire out at his shoulder, sparking no more)
  g.strokeStyle = '#FACC15'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx + 13, sy - 86); g.quadraticCurveTo(sx + 26, sy - 78, sx + 22, sy - 64); g.stroke();
  g.strokeStyle = '#2563EB'; g.beginPath(); g.moveTo(sx + 13, sy - 84); g.quadraticCurveTo(sx + 30, sy - 74, sx + 27, sy - 60); g.stroke();
  g.lineCap = 'butt';
  // (his head: skin in its steps, a grin, the yellow hat)
  g.fillStyle = INK; g.beginPath(); g.arc(sx, sy - 104, 13, 0, Math.PI * 2); g.fill();
  g.fillStyle = Sk[3]; g.beginPath(); g.arc(sx, sy - 104, 12, 0, Math.PI * 2); g.fill();
  g.fillStyle = Sk[4]; g.beginPath(); g.arc(sx - 4, sy - 107, 6, 0, Math.PI * 2); g.fill();
  R(g, sx - 6, sy - 106, 3, 3, INK); R(g, sx + 3, sy - 106, 3, 3, INK); R(g, sx - 5, sy - 99, 10, 3, '#3A1010'); R(g, sx - 4, sy - 99, 8, 1, '#F8FAFC');
  R(g, sx - 13, sy - 120, 26, 9, INK); R(g, sx - 12, sy - 119, 24, 7, '#EAB308'); R(g, sx - 12, sy - 119, 24, 2, '#FDE047'); R(g, sx - 2, sy - 124, 4, 4, '#DC2626');
};
const paintFace = (g: Ctx, k: number, cx0 = -1e9, cx1 = 1e9, cy0 = -1e9, cy1 = 1e9) => {
  const x0 = TR, x1 = TR + FACE, yb = floorY(k) + DECK, yt = floorY(k + 1), t = k / (FLOORS - 1);
  const hsh = (n: number) => hash(n * 3.7 + k * 17.3);
  /** (anything not reaching into this tile's not painted at all) */
  const inT = (a: number, b: number, c0: number, d: number) => b > cx0 - 2 && a < cx1 + 2 && d > cy0 - 2 && c0 < cy1 + 2;
  // (the fake rock: warm tan fiberglass low down, colder and bluer up high: its body, dithered darker down each band;
  // ledges of it in broken runs (a lit lip, the shadow under); moulded boulders over that; cracks)
  const Rk = ramp6(mixHex('#7E6850', '#62728C', t));
  R(g, x0, yt, FACE, yb - yt, Rk[2]);
  dither(g, x0, Math.round(yt + (yb - yt) * 0.6), FACE, Math.round((yb - yt) * 0.4), Rk[1]);
  for (let i = 0; i < 14; i++) {
    const lx = x0 + hsh(200 + i) * (FACE - 120), ly = Math.round(yt + 20 + hsh(210 + i) * (yb - yt - 40)), lw = 80 + hsh(220 + i) * 160, ld = 2 + Math.round(hsh(230 + i) * 4);
    if (!inT(lx, lx + lw + 20, ly - 4, ly + 18)) continue;
    poly(g, [[lx, ly], [lx + lw * 0.3, ly - ld], [lx + lw, ly - 1], [lx + lw + 16, ly + 8], [lx + 8, ly + 10]], Rk[3]);
    poly(g, [[lx, ly], [lx + lw * 0.3, ly - ld], [lx + lw, ly - 1], [lx + lw, ly + 1], [lx + lw * 0.3, ly - ld + 2], [lx, ly + 2]], Rk[5]);
    poly(g, [[lx + 8, ly + 10], [lx + lw + 16, ly + 8], [lx + lw + 10, ly + 13], [lx + 12, ly + 14]], Rk[0]);
  }
  // (moulded boulders: the shadow under each, its body, its lit face up its left, a highlight on its top, its shade)
  for (let i = 0; i < 16; i++) {
    const fx = x0 + 4 + hsh(i) * (FACE - 150), fy = yt + 30 + hsh(i + 9) * (yb - yt - 120), w = 80 + hsh(i + 3) * 120, h = 46 + hsh(i + 5) * 70, pk = 0.25 + hsh(i + 7) * 0.4;
    if (!inT(fx - 4, fx + w + 6, fy - 14, fy + h + 6)) continue;
    poly(g, [[fx - 3, fy + h + 4], [fx + w * 0.12, fy + h * 0.3], [fx + w * pk, fy - 4], [fx + w * 0.85, fy + h * 0.2], [fx + w + 4, fy + h + 4]], Rk[0]);
    poly(g, [[fx, fy + h], [fx + w * 0.12, fy + h * 0.3], [fx + w * pk, fy], [fx + w * 0.85, fy + h * 0.2], [fx + w, fy + h]], Rk[2]);
    poly(g, [[fx, fy + h], [fx + w * 0.12, fy + h * 0.3], [fx + w * pk, fy], [fx + w * (pk + 0.05), fy + h * 0.6], [fx + w * 0.35, fy + h]], Rk[3]);
    poly(g, [[fx + w * 0.12, fy + h * 0.3], [fx + w * pk, fy], [fx + w * (pk + 0.02), fy + h * 0.25], [fx + w * 0.16, fy + h * 0.45]], Rk[4]);
    poly(g, [[fx + w * pk, fy], [fx + w * 0.85, fy + h * 0.2], [fx + w, fy + h], [fx + w * 0.7, fy + h], [fx + w * (pk + 0.05), fy + h * 0.6]], Rk[1]);
    R(g, Math.round(fx + w * (pk - 0.08)), Math.round(fy + 3), Math.round(w * 0.1), 1, Rk[5]);
    dither(g, Math.round(fx + w * 0.2), Math.round(fy + h * 0.62), Math.round(w * (pk - 0.05)), 4, Rk[2]);
    dither(g, Math.round(fx + w * (pk + 0.06)), Math.round(fy + h * 0.4), Math.round(w * 0.2), 4, Rk[0]);
  }
  g.strokeStyle = Rk[0]; g.lineWidth = 1; g.beginPath();
  for (let i = 0; i < 10; i++) { let cx = x0 + hsh(240 + i) * FACE, cy = yt + hsh(250 + i) * (yb - yt); g.moveTo(cx, cy); for (let j = 0; j < 4; j++) { cx += (hsh(260 + i * 4 + j) - 0.5) * 30; cy += 8 + hsh(270 + i * 4 + j) * 10; g.lineTo(Math.round(cx), Math.round(cy)); } }
  g.stroke();
  // (the panels' seams (a lit lip along each) and their bolts: it's a shell)
  for (let x = x0 + 120; x < x1; x += 160) if (inT(x - 4, x + 4, yt, yb)) { R(g, x, yt, 2, yb - yt, Rk[0]); R(g, x + 2, yt, 1, yb - yt, Rk[4]); for (let yy = yt + 14; yy < yb; yy += 40) { R(g, x - 4, yy, 4, 4, INK); R(g, x - 3, yy + 1, 2, 2, '#B8B2AA'); } }
  for (let yy = yt + 90; yy < yb; yy += 120) if (inT(x0, x1, yy - 4, yy + 4)) { R(g, x0, yy, FACE, 2, Rk[0]); R(g, x0, yy + 2, FACE, 1, Rk[4]); for (let x = x0 + 30; x < x1; x += 60) { R(g, x, yy - 4, 4, 4, INK); R(g, x + 1, yy - 3, 2, 2, '#B8B2AA'); } }
  // (a hole torn in the shell: the warm Florida night behind it (its sky banded, stars, a palm, the scaffold, the back
  // of an AC unit and its pipes), the fiberglass mat frayed round its edge)
  if (k < 6) {
    const gx = x0 + 80 + hsh(21) * (FACE - 260), gy = yt + 40 + hsh(22) * 80;
    if (inT(gx - 10, gx + 132, gy - 10, gy + 102)) {
      const edge: [number, number][] = [];
      for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2, r = 1 + (hsh(140 + i) - 0.5) * 0.24; edge.push([gx + 60 + Math.cos(a) * 64 * r, gy + 45 + Math.sin(a) * 50 * r]); }
      poly(g, edge.map(([x, y]) => [gx + 60 + (x - gx - 60) * 1.08, gy + 45 + (y - gy - 45) * 1.1] as [number, number]), mixHex('#C8B890', Rk[3], 0.4));
      poly(g, edge.map(([x, y]) => [gx + 60 + (x - gx - 60) * 1.03, gy + 45 + (y - gy - 45) * 1.04] as [number, number]), INK);
      g.save(); g.beginPath(); g.moveTo(edge[0][0], edge[0][1]); for (const [x, y] of edge.slice(1)) g.lineTo(x, y); g.closePath(); g.clip();
      ['#0E1430', '#161C40', '#22224A', '#30284E'].forEach((col, i) => R(g, gx - 8, gy - 8 + i * 28, 140, 29, col));
      for (let i = 0; i < 10; i++) R(g, gx + hsh(30 + i) * 120, gy - 2 + hsh(40 + i) * 50, i % 3 ? 1 : 2, i % 3 ? 1 : 2, i % 2 ? '#F6C860' : '#E0E8F8');
      R(g, gx - 8, gy + 70, 140, 30, '#141020'); for (let i = 0; i < 6; i++) R(g, gx + i * 22 + hsh(50 + i) * 8, gy + 66, 3, 2, '#F6C860');
      const Pm = ramp5('#2A3A24');
      g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(gx + 30, gy + 100); g.quadraticCurveTo(gx + 34, gy + 50, gx + 44, gy + 26); g.stroke();
      g.strokeStyle = '#3A2C20'; g.lineWidth = 3; g.stroke();
      for (let j = 0; j < 6; j++) { const a = -Math.PI / 2 + (j - 2.5) * 0.55; poly(g, [[gx + 44, gy + 25], [gx + 44 + Math.cos(a) * 30, gy + 33 + Math.sin(a) * 14], [gx + 44 + Math.cos(a) * 18, gy + 29 + Math.sin(a) * 8]], j % 2 ? Pm[1] : Pm[2]); }
      postV(g, gx + 60, gy - 8, gy + 100, 4, ramp6('#4A5468')); beamH(g, gx + 60, gx + 132, gy + 40, 4, ramp6('#4A5468'));
      const Ac = ramp6('#9CA3AF');
      R(g, gx + 73, gy + 55, 42, 32, INK); R(g, gx + 74, gy + 56, 40, 30, Ac[3]); R(g, gx + 74, gy + 56, 40, 2, Ac[5]); R(g, gx + 74, gy + 56, 2, 30, Ac[4]);
      R(g, gx + 78, gy + 60, 32, 22, Ac[1]); for (let i = 0; i < 4; i++) R(g, gx + 79, gy + 62 + i * 5, 30, 2, Ac[0]);
      g.strokeStyle = Ac[2]; g.lineWidth = 1; g.beginPath(); g.arc(gx + 94, gy + 71, 8, 0, Math.PI * 2); g.stroke();
      R(g, gx + 100, gy + 30, 4, 26, '#8A4A14'); R(g, gx + 100, gy + 30, 1, 26, '#D08A44'); R(g, gx + 100, gy + 30, 22, 4, '#8A4A14'); R(g, gx + 100, gy + 30, 22, 1, '#D08A44');
      g.restore();
      for (let i = 0; i < 14; i++) { const [ax, ay] = edge[(i * 3) % 20]; R(g, ax - 2, ay - 1, 4 + hsh(150 + i) * 4, 1, '#D8C8A0'); }
    }
  }
  // (the fake snow: white paint, spray foam, cotton batting, patchy and gone yellow at the edges; more the higher;
  // in its steps (the blue shadow under, the body, the lit top), the foam's pocks; plastic icicles under it up high)
  const snowN = 3 + k;
  const Sn0 = [mixHex('#8A9AB0', '#7A90B0', t), mixHex('#C8BC98', '#B4C4D8', t), mixHex('#E0D8C0', '#D4E0EE', t), mixHex('#F4F0E4', '#EEF4FA', t)], Sn = Sn0.map(col => mixHex(col, Rk[2], 0.3));
  for (let i = 0; i < snowN; i++) {
    const sx = x0 + hsh(50 + i) * (FACE - 80), sy = yt + hsh(60 + i) * (yb - yt - 30), w = 50 + hsh(70 + i) * 110;
    if (!inT(sx - 6, sx + w + 6, sy - 16, sy + 28)) continue;
    g.fillStyle = INK; g.beginPath(); g.ellipse(sx + w / 2, sy + 1, w / 2 + 4, 15, 0, Math.PI, 0); g.fill();
    g.fillStyle = Sn[0]; g.beginPath(); g.ellipse(sx + w / 2, sy, w / 2 + 3, 14, 0, Math.PI, 0); g.fill();
    g.fillStyle = Sn[1]; g.beginPath(); g.ellipse(sx + w / 2, sy - 1, w / 2, 12, 0, Math.PI, 0); g.fill();
    g.fillStyle = Sn[2]; g.beginPath(); g.ellipse(sx + w / 2 - 3, sy - 2, w / 2 - 6, 10, 0, Math.PI, 0); g.fill();
    dither(g, Math.round(sx), Math.round(sy - 4), 8, 4, '#B8A060'); dither(g, Math.round(sx + w - 6), Math.round(sy - 4), 8, 4, '#B8A060');
    for (let j = 0; j < 4; j++) R(g, sx + 8 + hsh(170 + i * 4 + j) * (w - 16), sy - 3 - hsh(180 + i * 4 + j) * 6, 2, 1, Sn[1]);
    R(g, sx - 3, sy, w + 6, 2, Sn[0]);
    if (k >= 3) for (let j = 0; j < 4; j++) { const ix = sx + 8 + (j / 4) * (w - 16), il = 8 + hsh(90 + i * 4 + j) * 14; g.fillStyle = INK; g.beginPath(); g.moveTo(ix - 4, sy + 1); g.lineTo(ix + 4, sy + 1); g.lineTo(ix, sy + il + 1); g.closePath(); g.fill(); g.fillStyle = '#C8E4F8'; g.beginPath(); g.moveTo(ix - 3, sy + 1); g.lineTo(ix + 3, sy + 1); g.lineTo(ix, sy + il); g.closePath(); g.fill(); R(g, ix - 1, sy + 2, 1, Math.max(1, il - 6), '#FFFFFF'); }
  }
  // (prayer flags strung between two scaffold poles clamped to it)
  { const py = yt + 40 + hsh(100) * 60, pa = x0 + 60 + hsh(101) * 200, pb = pa + 260;
    if (inT(pa - 6, pb + 6, py - 14, py + 64)) {
      for (const px of [pa, pb]) { postV(g, px - 2, py - 10, py + 60, 4, STEEL6); R(g, px - 5, py + 50, 10, 6, INK); R(g, px - 4, py + 51, 8, 4, STEEL6[4]); R(g, px - 3, py - 12, 6, 3, STEEL6[5]); }
      prayerFlags(g, pa, pb, py, 11, 22);
    } }
  // (its statue: the yeti mascot, its paint peeling; or the sherpa animatronic, seized; or neither)
  if ((k === 4 || k === 1 || k === 5) && inT(x0 + FACE - 160, x0 + FACE - 50, yb - 165, yb)) {
    const sx = x0 + FACE - 110, sy = yb - 30;
    poly(g, [[sx - 46, sy + 8], [sx + 46, sy + 8], [sx + 40, sy + 16], [sx - 40, sy + 16]], INK);
    poly(g, [[sx - 45, sy + 8], [sx + 45, sy + 8], [sx + 39, sy + 15], [sx - 39, sy + 15]], Rk[2]);
    R(g, sx - 45, sy + 8, 90, 1, Rk[3]);
    for (const bx of [sx - 26, sx + 22]) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(bx + 2, sy + 15); g.lineTo(bx + 2, sy + 22); g.stroke(); g.strokeStyle = STEEL6[2]; g.lineWidth = 2; g.stroke(); }
    if (k === 5) sherpaStatue(g, sx, sy); else yetiStatue(g, sx, sy);
  }
  // (the crevasse, a decal: a crack in blue going down into black, its white rim, a corner peeling up)
  if (k === 6 && inT(x0 + 270, x0 + 480, yb - 80, yb - 20)) {
    poly(g, [[x0 + 278, yb - 40], [x0 + 330, yb - 72], [x0 + 422, yb - 62], [x0 + 474, yb - 32], [x0 + 380, yb - 42]], '#8E9AAA');
    poly(g, [[x0 + 284, yb - 41], [x0 + 330, yb - 69], [x0 + 420, yb - 60], [x0 + 466, yb - 34], [x0 + 380, yb - 45]], '#1E3A8A');
    poly(g, [[x0 + 300, yb - 44], [x0 + 334, yb - 64], [x0 + 410, yb - 56], [x0 + 446, yb - 38], [x0 + 380, yb - 48]], '#0F1E4A');
    poly(g, [[x0 + 330, yb - 50], [x0 + 350, yb - 58], [x0 + 400, yb - 52], [x0 + 380, yb - 49]], '#05070F');
    poly(g, [[x0 + 466, yb - 34], [x0 + 474, yb - 32], [x0 + 470, yb - 44]], '#C8D0DA');
  }
  // (its tacky sign, bolted flat to the rock on brackets (nothing under it to stand posts on): pink enamel, a marquee's
  // bulbs round it, readable)
  { const [l1, l2] = FACE_SIGNS[k] ?? FACE_SIGNS[0], sx = x0 + FACE * 0.68, sy = yb - 150;
    if (inT(sx - 72, sx + 72, sy - 12, sy + 48)) {
      for (const bx of [sx - 52, sx + 44]) { R(g, bx - 1, sy - 9, 10, 22, INK); R(g, bx, sy - 8, 8, 20, '#3F3A36'); R(g, bx + 1, sy - 8, 2, 8, '#78716C'); R(g, bx + 2, sy - 5, 3, 3, '#A8A29E'); }
      board(g, sx - 66, sy - 2, 132, 44, '#BE185D');
      for (let bx = sx - 62, i = 0; bx < sx + 64; bx += 8, i++) for (const by of [sy + 1, sy + 37]) { R(g, bx, by, 3, 3, INK); R(g, bx, by, 2, 2, i % 3 ? '#FDE68A' : '#FFFBEB'); }
      words(g, l1, sx, sy + 20, { ...smallLook('#FEF3C7', 2), bold: true }, 120);
      words(g, l2, sx, sy + 32, { ...smallLook('#FDE68A'), bold: true }, 120);
    } }
  // (the shell's cut edges either side, where the inside's in: dark, its rim lit)
  R(g, x0, yt, 10, yb - yt, '#120E0A'); R(g, x0 + 10, yt, 2, yb - yt, Rk[4]); R(g, x1 - 10, yt, 10, yb - yt, '#120E0A'); R(g, x1 - 12, yt, 2, yb - yt, Rk[1]);
  // (the queue up the spiral: the stringer, bolted to the rock on brackets; its treads (lit along their tops: he walks
  // them); a stanchion every other one and their rope; QUEUE CONTINUES half way, and the wait)
  const ax = TR + 10, ay = floorY(k), bx = TR + FACE - 10, by = floorY(k + 1), n = 28, T = THEME[k], A = ramp5(T.accent), S = STEEL6;
  const yAt = (x: number) => ay + ((by - ay) * (x - ax)) / (bx - ax);
  // (the spiral's corner standards up both edges of the face, bracketed into the rock, and a landing on each at the
  // flight's ends: its foot and its head stand on something (from round the far side, where the tower's inside isn't
  // drawn, the flight's end hung off the face's edge in the air))
  for (const [sx, ly, lx0, lx1] of [[x0 + 12, ay, x0 + 4, ax + 22], [x1 - 20, by, bx - 22, x1 - 4]] as const) {
    if (inT(sx - 2, sx + 10, yt, yb)) {
      postV(g, sx, yt, yb, 7, S);
      for (let yy = yt + 50; yy < yb - 10; yy += 120) { R(g, sx - 3, yy, 14, 6, INK); R(g, sx - 2, yy + 1, 12, 4, S[2]); R(g, sx - 2, yy + 1, 12, 1, S[4]); R(g, sx + 2, yy + 2, 2, 2, S[5]); }
    }
    if (inT(lx0 - 4, lx1 + 4, ly - 8, ly + 40)) {
      R(g, lx0 - 1, ly - 5, lx1 - lx0 + 2, 10, INK); R(g, lx0, ly - 4, lx1 - lx0, 8, S[3]); R(g, lx0, ly - 4, lx1 - lx0, 2, '#E2E8F0'); R(g, lx0, ly - 2, lx1 - lx0, 1, S[5]); R(g, lx0, ly + 2, lx1 - lx0, 2, S[1]);
      for (let x = lx0 + 3; x < lx1 - 3; x += 6) R(g, x, ly, 2, 1, S[2]);
      // (its knee brace, from under it into the standard)
      const kx = sx < (x0 + x1) / 2 ? lx1 - 6 : lx0 + 6, sx0 = sx + 3;
      g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(kx, ly + 5); g.lineTo(sx0, ly + 32); g.stroke(); g.strokeStyle = S[2]; g.lineWidth = 3; g.stroke();
    }
  }
  if (inT(ax - 10, bx + 10, by - 60, ay + 30)) {
    for (let x = ax + 60; x < bx - 20; x += 130) { const sy0 = yAt(x) + 16; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x, sy0); g.lineTo(x - 30, sy0 + 30); g.stroke(); g.strokeStyle = S[2]; g.lineWidth = 3; g.stroke(); R(g, x - 36, sy0 + 26, 12, 10, INK); R(g, x - 35, sy0 + 27, 10, 8, S[3]); R(g, x - 32, sy0 + 30, 2, 2, S[5]); }
    poly(g, [[ax, ay + 1], [bx, by + 1], [bx, by + 18], [ax, ay + 18]], INK);
    poly(g, [[ax, ay + 3], [bx, by + 3], [bx, by + 16], [ax, ay + 16]], S[2]);
    poly(g, [[ax, ay + 3], [bx, by + 3], [bx, by + 6], [ax, ay + 6]], S[4]);
    poly(g, [[ax, ay + 13], [bx, by + 13], [bx, by + 16], [ax, ay + 16]], S[0]);
    for (let i = 0; i < n; i++) {
      const u = i / n, x = Math.round(ax + (bx - ax) * u), yy = Math.round(ay + (by - ay) * u), w = Math.round((bx - ax) / n) + 3;
      R(g, x - 1, yy - 5, w, 9, INK); R(g, x, yy - 4, w - 2, 7, S[3]); R(g, x, yy - 4, w - 2, 2, '#E2E8F0'); R(g, x, yy - 2, w - 2, 1, S[5]); R(g, x, yy + 1, w - 2, 2, S[1]);
      if (i % 2 === 0) { R(g, x + 1, yy - 45, 6, 41, INK); R(g, x + 2, yy - 44, 4, 40, CHROME[2]); R(g, x + 2, yy - 44, 1, 40, CHROME[4]); R(g, x, yy - 48, 8, 5, INK); R(g, x + 1, yy - 47, 6, 3, CHROME[3]); }
    }
    for (const [w, col, dy] of [[4, INK, 1], [3, A[1], 0], [1, A[3], -1]] as const) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(ax + 4, ay - 42 + dy); g.lineTo(bx + 4, by - 42 + dy); g.stroke(); }
  }
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  if (inT(mx - 66, mx + 66, my - 154, my)) {
    postV(g, mx - 2, my - 118, my - 4, 4, STEEL6);
    board(g, mx - 60, my - 148, 120, 28, '#FACC15');
    words(g, 'QUEUE CONTINUES', mx - 8, my - 130, { ...smallLook('#1C1206'), bold: true, gap: 0 }, 96); arrowGlyph(g, mx + 46, my - 134, 1, '#DC2626', 0.7);
  }
  if (WAIT[k + 1]) {
    const wy = my - 210, px = mx + 140;
    if (inT(px - 64, px + 66, wy - 4, yAt(px))) {
      postV(g, px - 2, wy + 32, yAt(px) - 4, 4, STEEL6);
      board(g, px - 60, wy, 120, 32, '#F8FAFC');
      words(g, 'WAIT FROM HERE', px, wy + 12, { sx: 1, sy: 1, fill: '#140A04', gap: 1 }, 112);
      words(g, WAIT[k + 1], px, wy + 25, { sx: 1, sy: 1, fill: '#B91C1C', gap: 1, bold: true }, 112);
    }
  }
};
const FACE_TW = 204, FACE_TH = 197;
const drawFace = (c: Ctx, state: GameState, ox: number) => {
  if (!vis(state, TR + ox, TR + FACE + ox, 0)) return;
  for (let k = 0; k < FLOORS; k++) {
    // (each band from its own top: what of it pokes up over that (its top stanchions, a sign's top) is under the next
    // band's rock, put down after it, so it's not put down at all; but the top band's, under the open sky)
    const yt = floorY(k + 1), yb = floorY(k) + DECK, y0 = k === FLOORS - 1 ? yt - 60 : yt;
    if (!visY(state, y0, yb + 10, 0)) continue;
    // (in tiles: only what's on screen put down, the big stamp's cost was in what wasn't)
    c.save(); c.translate(ox, 0);
    for (let tx = TR - 4; tx < TR + FACE + 4; tx += FACE_TW) for (let ty = y0; ty < yb + 10; ty += FACE_TH) {
      const w = Math.min(FACE_TW, TR + FACE + 4 - tx), h = Math.min(FACE_TH, yb + 10 - ty);
      if (!vis(state, tx + ox, tx + ox + w, 0) || !visY(state, ty, ty + h, 0)) continue;
      stamp(c, `wp-face-${k}-${tx}-${ty}`, tx, ty, w, h, g => { g.save(); g.beginPath(); g.rect(tx, ty, w, h); g.clip(); paintFace(g, k, tx, tx + w, ty, ty + h); g.restore(); });
    }
    c.restore();
  }
};
/** The summit (stamped; the SNES pass): the fake peak behind the arena (moulded fiberglass in its steps, the coldest
 *  blue of the mountain's, lit up its left, its panel seams and bolts, a torn panel with the scaffold inside, the fake
 *  snowcap in bands with its blue shade, its stains and its plastic icicles: nothing on it reads as a ledge), the
 *  SUMMIT flag on its pole at the top, prayer flags strung from it down to poles on the slopes, the coin telescope, the
 *  queue's rope along the back of the deck; THE SUMMIT's board on its posts (icy letters, snow piled on it, bulbs);
 *  THE BIG ONE's start gate over the slide's mouth on the right (striped posts on their plates, a marquee board in
 *  bulbs, its caged lamps), NO REFUNDS on its post; the deck's lit top. Depth: all of it behind the kid and him (drawn in
 *  drawBack after the tower and the face), the board and the gate stood on the deck. */
const SUMMIT_PEAK: [number, number][] = [[0, 0], [60, -30], [120, -50], [170, -82], [215, -96], [258, -132], [300, -150], [338, -190], [372, -214], [400, -242], [422, -226], [448, -202], [472, -164], [520, -142], [580, -112], [640, -86], [700, -52], [760, -24], [800, 0]];
const peakY = (dx: number) => { for (let i = 1; i < SUMMIT_PEAK.length; i++) { const [ax, ay] = SUMMIT_PEAK[i - 1], [bx, by] = SUMMIT_PEAK[i]; if (dx <= bx) return ay + ((by - ay) * (dx - ax)) / Math.max(1, bx - ax); } return 0; };
/** A string of prayer flags from (x0, y0) to (x1, y1), sagging: the cord, the flags hung square off it. */
const flagLine = (g: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number, step = 18) => {
  const at = (u: number) => [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + sag * 4 * u * (1 - u)] as const;
  g.strokeStyle = '#3A3630'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 16; i++) { const [x, y] = at(i / 16); if (i) g.lineTo(x, y + 1); else g.moveTo(x, y + 1); } g.stroke();
  g.strokeStyle = '#CBD5E1'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= 16; i++) { const [x, y] = at(i / 16); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
  const n = Math.max(2, Math.floor(Math.hypot(x1 - x0, y1 - y0) / step));
  for (let i = 1; i < n; i++) {
    const [x, y] = at(i / n), F = FLAGS[i % 5], fx = Math.round(x - 5), fy = Math.round(y);
    R(g, fx - 1, fy, 12, 12, F[0]); R(g, fx, fy, 10, 11, F[2]); R(g, fx, fy, 10, 2, F[3]); R(g, fx, fy + 1, 1, 9, F[3]);
    R(g, fx + 8, fy + 2, 2, 9, F[1]); R(g, fx, fy + 9, 10, 2, F[1]); R(g, fx + 3, fy + 4, 4, 4, F[1]);
  }
};
const paintSummit = (g: Ctx) => {
  const sy = SUMMIT.y, Rk = ramp6('#5E6E8A'), S = STEEL6;
  const at = (i: number) => [TL + SUMMIT_PEAK[i][0], sy + SUMMIT_PEAK[i][1]] as [number, number];
  const outline = SUMMIT_PEAK.map((_, i) => at(i));
  // (the peak: its ink edge, its rock in steps: lit down its left face, shaded down its right (the ridge from the top
  // down to the deck the line between), the seam dithered)
  poly(g, outline.map(([x, y]) => [x, y - 2] as [number, number]), INK);
  poly(g, outline, Rk[2]);
  g.save(); g.beginPath(); g.moveTo(outline[0][0], outline[0][1]); for (const [x, y] of outline.slice(1)) g.lineTo(x, y); g.closePath(); g.clip();
  poly(g, [[TL, sy], [TL + 400, sy - 242], [TL + 360, sy - 120], [TL + 430, sy]], Rk[3]);
  poly(g, [[TL, sy], [TL + 400, sy - 242], [TL + 300, sy - 150], [TL + 170, sy - 82], [TL + 40, sy]], Rk[4]);
  poly(g, [[TL + 400, sy - 242], [TL + 800, sy], [TL + 520, sy], [TL + 452, sy - 120]], Rk[1]);
  dither(g, TL + 420, sy - 140, 60, 140, Rk[1]);
  // (its strata, in broken runs: a lit lip, the shadow under; cracks)
  for (let i = 0; i < 12; i++) {
    const lx = TL + 30 + hash(i + 600) * 680, ly = sy - 10 - hash(i + 610) * 120, lw = 40 + hash(i + 620) * 90;
    if (ly < sy + peakY(lx - TL) + 8) continue;
    poly(g, [[lx, ly], [lx + lw * 0.4, ly - 3], [lx + lw, ly], [lx + lw + 8, ly + 6], [lx + 4, ly + 7]], Rk[1]);
    R(g, lx + 2, ly - 1, lw * 0.6, 1, Rk[5]);
  }
  g.strokeStyle = Rk[0]; g.lineWidth = 1; g.beginPath();
  for (let i = 0; i < 8; i++) { let cx = TL + 60 + hash(i + 640) * 680, cy = sy - 6 - hash(i + 650) * 90; g.moveTo(cx, cy); for (let j = 0; j < 3; j++) { cx += (hash(i * 3 + j + 660) - 0.5) * 24; cy += 6 + hash(i * 3 + j + 670) * 8; g.lineTo(Math.round(cx), Math.round(cy)); } }
  g.stroke();
  // (the shell's panels: a seam every so far, its lit lip, its bolts)
  for (let x = TL + 100; x < TR - 20; x += 140) { R(g, x, sy - 260, 2, 260, Rk[0]); R(g, x + 2, sy - 260, 1, 260, Rk[4]); for (let yy = sy - 230; yy < sy; yy += 36) { R(g, x - 4, yy, 4, 4, INK); R(g, x - 3, yy + 1, 2, 2, '#B8B2AA'); } }
  // (a panel torn off low on the right: the scaffold inside, dark, a lamp)
  { const hx = TL + 560, hy = sy - 74;
    poly(g, [[hx, hy], [hx + 50, hy - 8], [hx + 62, hy + 30], [hx + 40, hy + 52], [hx + 4, hy + 46]], INK);
    poly(g, [[hx + 3, hy + 3], [hx + 48, hy - 4], [hx + 58, hy + 30], [hx + 38, hy + 48], [hx + 6, hy + 43]], '#0C1020');
    R(g, hx + 18, hy - 2, 4, 50, S[1]); R(g, hx + 18, hy - 2, 1, 50, S[3]); R(g, hx + 4, hy + 20, 52, 3, S[1]); R(g, hx + 4, hy + 20, 52, 1, S[3]);
    g.strokeStyle = S[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(hx + 22, hy + 22); g.lineTo(hx + 52, hy + 46); g.stroke();
    R(g, hx + 36, hy + 6, 4, 4, '#F6C860'); R(g, hx + 37, hy + 7, 2, 2, '#FFF6D0');
    for (let i = 0; i < 8; i++) R(g, hx + 4 + hash(i + 690) * 52, hy + hash(i + 700) * 46, 3, 1, '#D8C8A0');
  }
  // (the fake snowcap: down from the top in a ragged line, banded (the blue shade under, the body, lit up its left, the
  // highlight along the ridge), the seams dithered, yellowed at its edges, its foam pocked; plastic icicles under it)
  const Sn = ['#7A8EB0', '#B4C4D8', '#D4E0EE', '#EEF4FA', '#FFFFFF'];
  const cap: [number, number][] = [];
  for (let dx = 150; dx <= 660; dx += 15) cap.push([TL + dx, sy + peakY(dx) - 2]);
  const foot: [number, number][] = [];
  for (let dx = 660; dx >= 150; dx -= 15) { const top = peakY(dx), deep = (dx > 300 && dx < 520 ? 64 : 30) * (0.7 + hash(dx * 0.13) * 0.5); foot.push([TL + dx, sy + top + Math.min(-top - 10, deep)]); }
  const capPoly = [...cap, ...foot];
  poly(g, capPoly.map(([x, y]) => [x, y + 2] as [number, number]), Sn[0]);
  poly(g, capPoly, Sn[2]);
  g.save(); g.beginPath(); g.moveTo(capPoly[0][0], capPoly[0][1]); for (const [x, y] of capPoly.slice(1)) g.lineTo(x, y); g.closePath(); g.clip();
  poly(g, [[TL + 150, sy], [TL + 400, sy - 250], [TL + 380, sy]], Sn[3]);
  poly(g, [[TL + 400, sy - 250], [TL + 700, sy], [TL + 470, sy], [TL + 440, sy - 170]], Sn[1]);
  dither(g, TL + 430, sy - 200, 40, 200, Sn[1]); dither(g, TL + 340, sy - 200, 30, 200, Sn[3]);
  for (const [x, y] of foot) { R(g, x - 8, y - 4, 16, 4, Sn[1]); dither(g, x - 8, y - 8, 16, 4, Sn[1]); }
  for (let i = 0; i < 18; i++) R(g, TL + 200 + hash(i + 720) * 420, sy - 30 - hash(i + 730) * 180, 2, 1, Sn[1]);
  g.restore();
  for (let i = 1; i < cap.length; i++) { const [x, y] = cap[i]; R(g, x - 7, y + 1, 14, 1, Sn[4]); }
  for (const [x, y] of foot) {
    if (hash(x * 0.7) < 0.35) dither(g, x - 6, y - 4, 10, 3, '#B8A060');
    const il = 5 + Math.round(hash(x * 0.3) * 10);
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.lineTo(x, y + il + 1); g.closePath(); g.fill();
    g.fillStyle = '#C8E4F8'; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 3, y); g.lineTo(x, y + il); g.closePath(); g.fill(); R(g, x - 1, y + 1, 1, Math.max(1, il - 5), '#FFFFFF');
  }
  g.restore();
  // (the queue's rope along the back of the deck: background, no lit tops)
  queueRail(g, TL + 40, TL + 330, sy - 1, '#DC2626');
  queueRail(g, TL + 470, SUMMIT.mouthX - 80, sy - 1, '#DC2626');
  // (the coin telescope on its pedestal: 25 CENTS, a view of the parking lot)
  { const tx = TL + 360;
    postV(g, tx - 3, sy - 46, sy - 4, 6, S); R(g, tx - 10, sy - 5, 20, 5, INK); R(g, tx - 9, sy - 4, 18, 3, S[2]); R(g, tx - 9, sy - 4, 18, 1, S[4]);
    R(g, tx - 12, sy - 62, 26, 18, INK); R(g, tx - 11, sy - 61, 24, 16, '#B45309'); R(g, tx - 11, sy - 61, 24, 3, '#F59E0B'); R(g, tx - 11, sy - 61, 3, 16, '#D97706'); R(g, tx + 9, sy - 61, 4, 16, '#78350F');
    for (const ex of [tx + 12, tx + 12]) { R(g, ex, sy - 59, 7, 6, INK); R(g, ex + 1, sy - 58, 5, 4, '#1E293B'); R(g, ex + 1, sy - 58, 2, 1, '#93C5FD'); }
    R(g, tx - 6, sy - 50, 8, 3, INK); R(g, tx - 5, sy - 50, 6, 1, '#FDE68A'); }
  // (the SUMMIT flag up on its pole at the top: the pole stood into the peak on a bracket, a ball on it; the flag in its
  // red, a fold in it, SUMMIT in white)
  { const px = TL + 398;
    postV(g, px, sy - 300, sy - 238, 4, S); R(g, px - 3, sy - 244, 10, 6, INK); R(g, px - 2, sy - 243, 8, 4, S[2]);
    g.fillStyle = INK; g.beginPath(); g.arc(px + 2, sy - 303, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F2CC4A'; g.beginPath(); g.arc(px + 2, sy - 303, 3, 0, Math.PI * 2); g.fill(); R(g, px + 1, sy - 305, 1, 1, '#FFF0A0');
    const F = ramp6('#DC2626');
    for (let i = 0; i < 46; i += 2) { const wv = Math.round(Math.sin(i * 0.16) * 2); R(g, px + 4 + i, sy - 299 + wv, 2, 27, INK); R(g, px + 4 + i, sy - 298 + wv, 2, 25, i > 26 && i < 36 ? F[2] : F[3]); R(g, px + 4 + i, sy - 298 + wv, 2, 2, F[4]); R(g, px + 4 + i, sy - 275 + wv, 2, 2, F[1]); }
    signText(g, 'SUMMIT', px + 27, sy - 280, { sx: 1, sy: 2, fill: rampDown('#FFFFFF', 0.12), shadow: '#5A0A0A', drop: 1, gap: 1, bold: true });
    // (prayer flags strung off it, down to a pole on either slope)
    for (const [qx, qy] of [[TL + 236, sy + peakY(236)], [TL + 566, sy + peakY(566)]] as const) { postV(g, qx - 2, qy - 64, qy + 18, 4, S); R(g, qx - 5, qy + 14, 10, 5, INK); R(g, qx - 4, qy + 15, 8, 3, S[3]); }
    flagLine(g, px, sy - 272, TL + 236, sy + peakY(236) - 62, 10);
    flagLine(g, px + 4, sy - 272, TL + 566, sy + peakY(566) - 62, 10);
  }
  // (THE SUMMIT's board, stood on the deck on its posts, at the snow's foot: readable over the kid's head; deep enough
  // that the far-off SPACE NEEDLE 2's saucer's all behind it)
  { const bx = TL + 100, by = sy - 160, bw = 200, bh = 62;
    for (const px of [TL + 150, TL + 245]) { postV(g, px - 1, by + bh, sy - 3, 6, S); R(g, px - 6, sy - 4, 16, 4, INK); R(g, px - 5, sy - 4, 14, 3, S[2]); R(g, px - 5, sy - 4, 14, 1, S[4]); }
    beamH(g, TL + 150, TL + 251, sy - 60, 4, S);
    board(g, bx, by, bw, bh, '#13265E');
    R(g, bx + 4, by + 4, bw - 8, 1, '#2E50A8');
    const top: [number, number][] = [[bx - 4, by + 2]];
    for (let x = bx - 4; x < bx + bw + 4; x += 14) top.push([x + 7, by - 6 - Math.round(hash(x * 0.9) * 6)], [Math.min(bx + bw + 4, x + 14), by - 2]);
    top.push([bx + bw + 4, by + 6], [bx - 4, by + 6]);
    poly(g, top.map(([x, y]) => [x, y - 1] as [number, number]), INK); poly(g, top, '#DCE6F0');
    for (let x = bx; x < bx + bw; x += 14) R(g, x + 3, by - 3 - Math.round(hash(x * 0.9 + 1) * 4), 7, 2, '#F8FAFC');
    for (let x = bx + 6; x < bx + bw - 4; x += 18) { const l = 2 + Math.round(hash(x + 5) * 4); R(g, x, by + 6, 4, l, '#DCE6F0'); R(g, x + 3, by + 6, 1, l, '#94A3B8'); }
    for (let x = bx + 6, i = 0; x < bx + bw - 4; x += 12, i++) { R(g, x, by + bh - 7, 4, 4, INK); R(g, x, by + bh - 7, 3, 3, i % 3 ? '#FDE68A' : '#FFFBEB'); }
    signText(g, 'THE SUMMIT', bx + bw / 2, by + 26, { sx: 2, sy: 2, fill: rampDown('#F0F9FF', 0.15), dither: true, shadow: '#060C24', drop: 1, gap: 1, bold: true, drip: { col: '#BAE6FD', tip: '#F0F9FF', rate: 0.3, len: 3 } });
    signText(g, 'ELEV. 1,000 FT', bx + bw / 2, by + 41, { sx: 1, sy: 2, fill: rampDown('#FDE047', 0.35), dither: true, shadow: '#0B1640', drop: 1, gap: 1 });
    signText(g, '(ROUGHLY)', bx + bw / 2, by + 50, { sx: 1, sy: 1, fill: '#FDBA74', shadow: '#0B1640', drop: 1, gap: 1 });
  }
  // (THE BIG ONE's start gate over the slide's mouth: its striped posts on their plates (hazard stripes low down), the
  // marquee board across in its bulbs, caged lamps on the posts' tops; NO REFUNDS on a post by it)
  { const mx = SUMMIT.mouthX, T = ramp6('#0E7490');
    for (const px of [mx - 22, mx + 100]) {
      postV(g, px, sy - 148, sy - 3, 12, T);
      g.save(); g.beginPath(); g.rect(px, sy - 40, 12, 37); g.clip();
      for (let i = -12; i < 40; i += 8) poly(g, [[px, sy - 3 - i], [px + 12, sy - 15 - i], [px + 12, sy - 11 - i], [px, sy + 1 - i]], '#FACC15');
      g.restore();
      R(g, px - 4, sy - 4, 20, 4, INK); R(g, px - 3, sy - 4, 18, 3, S[2]); R(g, px - 3, sy - 4, 18, 1, S[4]);
      R(g, px - 1, sy - 160, 14, 12, INK); R(g, px, sy - 159, 12, 10, '#FDE68A'); for (let k = 0; k < 3; k++) R(g, px + 1 + k * 4, sy - 159, 1, 10, S[1]);
      steppedGlow(g, px + 6, sy - 154, 12, '#FDE68A', 0.35, 0.06, 3);
    }
    board(g, mx - 34, sy - 182, 158, 30, '#0E7490');
    for (let x = mx - 30, i = 0; x < mx + 122; x += 8, i++) for (const yy of [sy - 180, sy - 159]) { R(g, x, yy, 3, 3, INK); R(g, x, yy, 2, 2, i % 3 ? '#FDE68A' : '#FFFBEB'); }
    signText(g, 'THE BIG ONE', mx + 45, sy - 163, { sx: 1, sy: 2, fill: rampDown('#F0FDFA', 0.2), dither: true, shadow: '#022C36', drop: 1, gap: 1, bold: true });
    postV(g, mx - 50, sy - 72, sy - 3, 4, S); R(g, mx - 55, sy - 4, 14, 4, INK); R(g, mx - 54, sy - 4, 12, 3, S[2]);
    board(g, mx - 74, sy - 98, 52, 28, '#F8FAFC');
    R(g, mx - 74, sy - 98, 52, 8, '#B91C1C'); R(g, mx - 74, sy - 98, 52, 1, '#F87171');
    words(g, 'DANGER', mx - 48, sy - 91, { sx: 1, sy: 1, fill: '#FFFFFF', gap: 1 }, 48);
    words(g, 'NO REFUNDS', mx - 48, sy - 78, { sx: 1, sy: 1, fill: '#140A04', gap: 0 }, 48);
  }
  // (the deck's lit top over the summit)
  R(g, TL, sy, TR - TL, 3, '#F8FAFC');
};
const drawSummit = (c: Ctx, state: GameState) => {
  const sy = SUMMIT.y;
  if (visY(state, sy - 320, sy + 40)) stamp(c, 'wp-summit2', TL - 60, sy - 330, TR - TL + 260, 340, paintSummit);
};
/** The summit's door (on its left, at the top of the Hillary Step's stairs): up, or kicked in flat. Its frame in steel's
 *  steps, the red beacon over it; the door (side on: its edge) in its paint, lit down its left; down flat on the deck,
 *  its face up: the panel, the push plate, the hinges torn out, his boot print on it. */
const SDOOR = ramp6('#7C2D12');
const drawSummitDoor = (c: Ctx, state: GameState, down: number, ox = 0) => {
  const sy = SUMMIT.y, x = TL;
  if (!visY(state, sy - 200, sy + 20) || !vis(state, x - 100 + ox, x + 100 + ox)) return;
  // (its frame; the door up in it, or going over inward (squashed toward the deck, not turned: stamped either way),
  // flat on the deck at the last)
  stamp(c, 'wp-sdoor-frame2', x - 18, sy - 152, 36, 154, g => {
    postV(g, x - 14, sy - 132, sy, 9, STEEL6); postV(g, x + 5, sy - 132, sy, 9, STEEL6);
    beamH(g, x - 15, x + 15, sy - 141, 9, STEEL6);
    R(g, x - 5, sy - 150, 10, 8, INK); R(g, x - 4, sy - 149, 8, 6, '#B91C1C'); R(g, x - 3, sy - 149, 2, 2, '#FCA5A5');
    R(g, x - 4, sy - 132, 8, 132, '#06080C');
  });
  if (down >= 1) {
    stamp(c, 'wp-sdoor-flat2', x + 2, sy - 16, 136, 18, g => {
      const D = SDOOR;
      R(g, x + 5, sy - 13, 130, 14, INK); R(g, x + 6, sy - 12, 128, 12, D[3]); R(g, x + 6, sy - 12, 128, 2, D[5]); R(g, x + 6, sy - 3, 128, 3, D[1]);
      R(g, x + 30, sy - 10, 60, 6, D[2]); R(g, x + 30, sy - 10, 60, 1, D[1]); R(g, x + 30, sy - 5, 60, 1, D[4]);
      R(g, x + 100, sy - 10, 12, 5, INK); R(g, x + 101, sy - 9, 10, 3, CHROME[2]); R(g, x + 101, sy - 9, 10, 1, CHROME[4]);
      for (const hx of [x + 10, x + 56]) { R(g, hx, sy - 12, 6, 3, INK); R(g, hx + 1, sy - 12, 4, 1, CHROME[3]); }
      // (his boot print, kicked in)
      for (const [dx, w] of [[60, 9], [62, 7]] as const) R(g, x + dx, sy - 10 + (dx - 60), w, 2, D[0]);
      R(g, x + 72, sy - 10, 5, 4, D[0]);
    });
    return;
  }
  const k = Math.max(0.06, Math.cos(Math.min(1, down) * Math.PI / 2));
  c.save(); c.translate(x, sy); c.scale(1, k); c.translate(-x, -sy);
  stamp(c, 'wp-sdoor2', x - 8, sy - 130, 16, 132, g => {
    const D = SDOOR;
    R(g, x - 6, sy - 128, 12, 128, D[3]); R(g, x - 6, sy - 128, 2, 128, D[5]); R(g, x - 4, sy - 128, 1, 128, D[4]); R(g, x + 3, sy - 128, 3, 128, D[1]);
    R(g, x - 6, sy - 128, 12, 2, D[5]); R(g, x - 6, sy - 20, 12, 18, '#E0A90A'); for (let y = sy - 18; y < sy - 2; y += 6) R(g, x - 6, y, 12, 3, INK);
    R(g, x - 2, sy - 72, 5, 8, INK); R(g, x - 1, sy - 71, 3, 6, '#FACC15');
  });
  c.restore();
};
/** Where the descent's behind the mountain (the spiral's world: its outside face, the inside drawn round again past
 *  it): from the tower's right wall round to where the spiral comes in again. Till the kid's dead (the descent's
 *  ridden: then there's no face out there, just the slide in the open), what of the slide's in there isn't drawn: the
 *  mountain's in front of it (it was drawn over the spiral's steps and its signs' posts). */
const HIDE_X0 = TR, HIDE_X1 = TR + ROUND;
/** The descent's chute: deeper than the plaza's (its near wall up past the riders' hips, the water's line over it). */
export const DESC_WIDE = 30, DESC_WATER = -18, DESC_LIFT = 10;
/** The descent's height at world x (between its points). */
const descY = (x: number) => {
  const j = DESCENT.findIndex(([px]) => px >= x);
  if (j < 1) return DESCENT[Math.max(0, j)][1];
  const [ax, ay] = DESCENT[j - 1], [bx, by] = DESCENT[j];
  return ay + (by - ay) * ((x - ax) / Math.max(1, bx - ax));
};
/** THE BIG ONE's plastic, in its steps. */
const DESC_C = ramp5('#0891B2');
/** The descent's chute's back half (the SNES pass, within chuteBack's old bounds: the trough's ink 26 over its line to 8
 *  under): the trough in its plastic's steps (the shadow under it, the body, the lit inner rim along its top, a glint),
 *  the sections' joints banded and bolted (world-anchored, every 80), the water running in it (deep, the run, the foam
 *  flecked along). */
const descBack = (g: Ctx, pts: [number, number][], x0: number, x1: number) => {
  const C = DESC_C, Wt = DESC_WATER;
  g.lineCap = 'round'; g.lineJoin = 'round';
  along(g, pts, -9, 34, INK);
  along(g, pts, -9, 30, C[1]);
  along(g, pts, -12, 20, C[2]);
  along(g, pts, -22, 4, C[3]);
  along(g, pts, -23.5, 1.5, C[4]);
  along(g, pts, 5, 3, C[0]);
  g.lineCap = 'butt'; g.lineJoin = 'miter';
  for (let x = Math.ceil(x0 / 80) * 80; x <= x1; x += 80) {
    if (x < DESCENT[0][0] + 20 || x > DESCENT[DESCENT.length - 1][0]) continue;
    const y = Math.round(descY(x));
    R(g, x - 1, y - 24, 3, 30, C[0]); R(g, x + 2, y - 24, 1, 30, C[3]); R(g, x - 2, y - 25, 6, 2, C[4]); R(g, x - 1, y - 25, 3, 1, INK);
    R(g, x - 1, y + 3, 3, 2, '#C8CED6');
  }
  for (let x = Math.ceil(x0 / 8) * 8; x <= x1; x += 8) { const n = hash(x * 0.37); if (n < 0.25 && x > DESCENT[0][0]) R(g, x, Math.round(descY(x)) - 16 + Math.floor(hash(x + 3) * 6), 2, 1, C[3]); }
  g.lineCap = 'round'; g.lineJoin = 'round';
  along(g, pts, Wt + 1, 9, '#1D5C99');
  along(g, pts, Wt, 6, 'rgba(120, 205, 255, 0.95)');
  along(g, pts, Wt - 2, 2, '#E0F2FE');
  g.lineCap = 'butt'; g.lineJoin = 'miter';
  for (let x = Math.ceil(x0 / 24) * 24; x <= x1; x += 24) if (hash(x * 0.71) < 0.6 && x > DESCENT[0][0]) R(g, x, Math.round(descY(x)) + Wt - 3, 3, 1, '#FFFFFF');
};
/** ...its near wall (in front of him: the riders down in it from the hips; within chuteFront's old bounds): in its
 *  steps, the lit lip along its top, the gold stripe along it, the joints banded. */
const descFront = (g: Ctx, pts: [number, number][], x0: number, x1: number) => {
  const C = DESC_C, d = 2 - DESC_LIFT / 2;
  g.lineCap = 'round'; g.lineJoin = 'round';
  along(g, pts, d, 25, INK);
  along(g, pts, d, 21, C[1]);
  along(g, pts, d - 1.5, 14, C[2]);
  along(g, pts, d + 2.5, 2, GOLD[2]);
  along(g, pts, d + 1.5, 1, GOLD[4]);
  along(g, pts, d - 8, 2, C[3]);
  along(g, pts, d - 9.5, 1, C[4]);
  along(g, pts, d + 9.5, 1.5, C[0]);
  g.lineCap = 'butt'; g.lineJoin = 'miter';
  for (let x = Math.ceil(x0 / 80) * 80; x <= x1; x += 80) {
    if (x < DESCENT[0][0] + 20 || x > DESCENT[DESCENT.length - 1][0]) continue;
    const y = Math.round(descY(x));
    R(g, x - 1, y + d - 9, 2, 19, C[0]); R(g, x + 1, y + d - 9, 1, 19, C[3]); R(g, x - 1, y + d - 3, 2, 2, C[4]);
  }
};
/** The descent's legs: steel columns in their steps (live, a handful of fills each), a saddle under the chute, bolted
 *  collars, braced across in pairs; down to the ground on a footing, or (over the crater past base camp) on down into
 *  its dark. */
const DLEG = ramp5(mix('#56647A', '#0B1020', 0.2));
const descLeg = (c: Ctx, x: number, top: number, bot: number, footing: boolean) => {
  const h = bot - top;
  if (h <= 0) return;
  R(c, x - 12, top - 7, 24, 7, INK); R(c, x - 11, top - 6, 22, 2, DLEG[3]); R(c, x - 11, top - 4, 22, 3, DLEG[1]); R(c, x - 11, top - 6, 1, 5, DLEG[4]);
  R(c, x - 5, top, 10, h, INK); R(c, x - 4, top, 8, h, DLEG[2]); R(c, x - 4, top, 2, h, DLEG[3]); R(c, x - 4, top, 1, h, DLEG[4]); R(c, x + 2, top, 2, h, DLEG[1]); R(c, x + 3, top, 1, h, DLEG[0]);
  for (let y = Math.ceil((top + 40) / 120) * 120; y < bot - 8; y += 120) { R(c, x - 6, y, 12, 6, INK); R(c, x - 5, y + 1, 10, 4, DLEG[1]); R(c, x - 5, y + 1, 10, 1, DLEG[3]); }
  if (footing) { R(c, x - 11, bot - 6, 22, 6, INK); R(c, x - 10, bot - 5, 20, 5, PAVE[3]); R(c, x - 10, bot - 5, 20, 1, PAVE[5]); }
};
const onGround = (x: number) => GROUND.some(([a, b]) => x >= a && x <= b);
/** The descent's chute (baked in tiles), its legs down to the ground. `behind`: the mountain's face out there, in front. */
const drawDescentChute = (c: Ctx, state: GameState, behind: boolean) => {
  const x0 = DESCENT[0][0], x1 = DESCENT[DESCENT.length - 1][0];
  if (!vis(state, x0 - 60, x1 + 60)) return;
  // (its legs down to the ground (or into the crater's dark), a few a screen; braced across in pairs)
  const camBot = state.camera.y + H + 20, v = state.view && state.view.w > W ? state.view : { x: state.camera.x, w: W };
  for (let x = Math.ceil(Math.max(x0 + 100, v.x - 40) / 200) * 200; x < Math.min(x1, v.x + v.w + 40); x += 200) {
    if (behind && x > HIDE_X0 - 10 && x < HIDE_X1 + 10) continue;
    // (none in the splash pool's wall)
    if (POOLS.some(p => x > p.x1 - 40 && x < p.x2 + 10)) continue;
    const py = descY(x), grd = onGround(x), bot = grd ? Math.min(GY, camBot) : camBot;
    if (bot <= py + 8) continue;
    const top = Math.max(py + 8, state.camera.y - 20);
    // (the X-brace to the next leg: two steel flats, lit along their tops)
    const nx = x + 200;
    if (nx < x1 && !(behind && nx > HIDE_X0 - 10 && nx < HIDE_X1 + 10)) {
      const ny = descY(nx) + 8, ya = py + 60, yb = ya + 160, yc = ny + 60, yd = yc + 160;
      if (Math.max(yb, yd) > state.camera.y - 20 && Math.min(ya, yc) < camBot && Math.max(yb, yd) < bot) {
        c.lineCap = 'butt';
        for (const [w, col, dy] of [[4, INK, 0], [2, DLEG[2], 0], [1, DLEG[4], -1]] as const) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x, ya + dy); c.lineTo(nx, yd + dy); c.moveTo(x, yb + dy); c.lineTo(nx, yc + dy); c.stroke(); }
      }
    }
    descLeg(c, x, top, bot, grd && bot >= GY - 1);
  }
  for (let tx = Math.floor((v.x - 60) / 600) * 600; tx < v.x + v.w + 60; tx += 600) {
    if (tx + 600 < x0 - 40 || tx > x1 + 40) continue;
    if (behind && tx >= HIDE_X0 && tx + 600 <= HIDE_X1) continue;
    const pts = DESCENT.filter(([x]) => x > tx - 300 && x < tx + 900);
    if (pts.length < 2) continue;
    const [y0, y1] = bandOf(DESCENT, tx, 600);
    if (y1 < y0 || !visY(state, y0 - 60, y1 + 60)) continue;
    stamp(c, `wp-desc2-${tx}`, tx, y0 - 60, 600, y1 - y0 + 100, g => {
      g.save(); g.beginPath(); g.rect(tx, y0 - 60, 600, y1 - y0 + 100); g.clip();
      descBack(g, pts, tx - 20, tx + 620);
      g.restore();
    });
  }
};
const drawDescentFront = (c: Ctx, state: GameState, behind: boolean) => {
  const x0 = DESCENT[0][0], x1 = DESCENT[DESCENT.length - 1][0];
  if (!vis(state, x0 - 60, x1 + 60)) return;
  const v = state.view && state.view.w > W ? state.view : { x: state.camera.x, w: W };
  for (let tx = Math.floor((v.x - 60) / 600) * 600; tx < v.x + v.w + 60; tx += 600) {
    if (tx + 600 < x0 - 40 || tx > x1 + 40) continue;
    // (behind the mountain: none of it in there; the one tile that's half in, cut at the tower's wall (out of the
    // slide's mouth at the summit, then round the back))
    if (behind && tx >= HIDE_X0 && tx + 600 <= HIDE_X1) continue;
    const cut = behind && tx < HIDE_X0 && tx + 600 > HIDE_X0;
    const pts = DESCENT.filter(([x]) => x > tx - 300 && x < tx + 900);
    if (pts.length < 2) continue;
    const ys = pts.map(p => p[1]), y0 = Math.min(...ys) - 40, y1 = Math.max(...ys) + 40;
    if (!visY(state, y0, y1)) continue;
    // (and down at the summit's deck: what of it's under there is inside the deck and the tower's wall, not over them)
    const w = cut ? HIDE_X0 - tx : 600, h = cut ? Math.min(y1, SUMMIT.y + 2) - y0 : y1 - y0;
    stamp(c, `wp-descf2-${tx}${cut ? '-cut' : ''}`, tx, y0, w, h, g => { g.save(); g.beginPath(); g.rect(tx, y0, w, h); g.clip(); descFront(g, pts, tx - 20, tx + 620); g.restore(); });
  }
};
/** Base camp's dressing (stamped; drawn after the mountain's face: stood on the ground in front of it): MOUNT EVEREST
 *  BUT BETTER on its posts (icy letters, the snow piled on the board, its bulbs), the yeti's plywood cutout waving (its
 *  arms from limb.ts), BASE CAMP 0 FT on its stake, the queue's rails on in under the sign to the way in, bottles and
 *  sacks of fake snow, prayer flags from the sign over to the mountain. Clear of the face's own signs behind. */
const drawBaseCamp = (c: Ctx, state: GameState) => {
  if (!vis(state, 27980, TL + 40)) return;
  stamp(c, 'wp-basecamp', 27980, GY - 300, TL - 27980 + 40, 302, paintBaseCamp);
};
const paintBaseCamp = (g: Ctx) => {
  {
    // (the prayer flags: from the big sign's right post up to the mountain by the way in)
    prayerFlags(g, 28432, 28790, GY - 236, 22, 24);
    R(g, 28787, GY - 246, 4, 14, INK); R(g, 28788, GY - 246, 2, 14, STEEL6[4]);
    // (the bottles racked and the sacks of fake snow, behind the rails)
    for (let i = 0; i < 6; i++) bottle(g, 28566 + i * 12, GY - 2, i % 2 ? '#15803D' : '#C2570C');
    sack(g, 28644, GY - 1, 34, 24); sack(g, 28676, GY - 1, 28, 20); sack(g, 28656, GY - 20, 26, 18);
    // (low drifts of it about, dimmed: nothing to stand on)
    for (const [x, w] of [[28150, 70], [28480, 60], [28720, 50]] as const) { g.fillStyle = '#9AA6B8'; g.beginPath(); g.ellipse(x, GY, w / 2, 9, 0, Math.PI, 0); g.fill(); g.fillStyle = '#C8D2DE'; g.beginPath(); g.ellipse(x - 4, GY, w / 2 - 6, 6, 0, Math.PI, 0); g.fill(); dither(g, x - w / 2 + 2, GY - 4, 8, 4, '#B8A060'); }
    // (the queue's rails, on in under the sign to the way in)
    queueRail(g, 28210, 28780, GY - 1, '#DC2626');
    // (the big sign on its posts: steel, lit up their left)
    for (const px of [28150, 28426]) { postV(g, px, GY - 172, GY - 2, 8, STEEL6); R(g, px - 4, GY - 4, 16, 4, INK); R(g, px - 3, GY - 4, 14, 3, STEEL6[2]); }
    beamH(g, 28150, 28434, GY - 120, 5, STEEL6);
    board(g, 28120, GY - 240, 340, 72, '#13265E');
    R(g, 28124, GY - 236, 332, 1, '#2E50A8');
    // (the snow piled along its top, drips of it down its face; the bulbs along its foot)
    const top: [number, number][] = [[28116, GY - 238]];
    for (let x = 28116; x < 28464; x += 16) top.push([x + 8, GY - 246 - Math.round(hash(x) * 8)], [Math.min(28464, x + 16), GY - 242]);
    top.push([28464, GY - 232], [28116, GY - 232]);
    poly(g, top.map(([x, y]) => [x, y - 1] as [number, number]), INK); poly(g, top, '#DCE6F0');
    for (let x = 28120; x < 28460; x += 16) { R(g, x + 4, GY - 242 - Math.round(hash(x - 4) * 6), 8, 2, '#F8FAFC'); }
    for (let x = 28126; x < 28456; x += 22) { const l = 2 + Math.round(hash(x + 3) * 3); R(g, x, GY - 232, 5, l, '#DCE6F0'); R(g, x + 1, GY - 232 + l, 3, 2, '#DCE6F0'); R(g, x + 4, GY - 232, 1, l, '#94A3B8'); }
    for (let x = 28128, i = 0; x < 28454; x += 12, i++) { R(g, x, GY - 177, 4, 4, INK); R(g, x, GY - 177, 3, 3, i % 3 ? '#FDE68A' : '#FFFBEB'); }
    signText(g, 'MOUNT EVEREST', 28290, GY - 199, { sx: 2, sy: 3, fill: rampDown('#F0F9FF', 0.15), dither: true, shadow: '#060C24', drop: 1, gap: 1, bold: true, drip: { col: '#BAE6FD', tip: '#F0F9FF', rate: 0.35, len: 5 } });
    signText(g, 'BUT BETTER', 28290, GY - 181, { sx: 2, sy: 2, fill: rampDown('#FDE047', 0.35), dither: true, shadow: '#0B1640', drop: 1, gap: 1 });
    // (the yeti's plywood cutout, waving: its plywood edge showing, a stand behind it, its paint)
    const yx = 28064, F = ramp6('#E8EEF4'), Ply = '#8A6A3A';
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(yx + 10, GY - 90); g.lineTo(yx + 44, GY - 1); g.stroke(); g.strokeStyle = Ply; g.lineWidth = 3; g.stroke();
    const arms: [number, number, number, number, number][] = [[yx + 26, GY - 96, yx + 46, GY - 148, 1], [yx - 26, GY - 96, yx - 22, GY - 54, -1]];
    const shape = (dx: number, dy: number, col: string, grow: number) => {
      g.fillStyle = col;
      g.beginPath(); g.ellipse(yx + dx, GY - 70 + dy, 33 + grow, 46 + grow, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(yx + dx, GY - 128 + dy, 21 + grow, 0, Math.PI * 2); g.fill();
      for (const lx of [-22, 6]) g.fillRect(yx + lx + dx - grow, GY - 34 + dy - grow, 16 + grow * 2, 34 + grow);
      g.lineCap = 'round'; g.strokeStyle = col; g.lineWidth = 13 + grow * 2;
      for (const [shx, shy, hx, hy, s] of arms) { const [ex, ey] = elbowFront(shx, shy, hx, hy, 28, 28, s); g.beginPath(); g.moveTo(shx + dx, shy + dy); g.lineTo(ex + dx, ey + dy); g.lineTo(hx + dx, hy + dy); g.stroke(); g.beginPath(); g.arc(hx + dx, hy + dy, 9 + grow, 0, Math.PI * 2); g.fill(); }
      g.lineCap = 'butt';
    };
    shape(3, 2, INK, 1); shape(3, 1, Ply, 0); shape(0, 0, INK, 2); shape(0, 0, F[2], 0);
    g.fillStyle = F[4]; g.beginPath(); g.ellipse(yx - 8, GY - 80, 18, 28, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(yx - 6, GY - 134, 11, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 5; i++) R(g, yx - 20 + i * 9, GY - 50 + (i % 2) * 3, 6, 2, F[1]);
    R(g, yx - 13, GY - 136, 26, 18, '#4A86C8'); R(g, yx - 13, GY - 136, 26, 3, '#7AB0E8');
    R(g, yx - 9, GY - 131, 6, 6, '#F8FAFC'); R(g, yx + 3, GY - 131, 6, 6, '#F8FAFC'); R(g, yx - 7, GY - 129, 3, 3, INK); R(g, yx + 5, GY - 129, 3, 3, INK);
    R(g, yx - 10, GY - 123, 20, 7, '#3A1010'); for (let i = 0; i < 5; i++) R(g, yx - 9 + i * 4, GY - 123, 3, 3, '#F8FAFC');
    R(g, yx - 22, GY - 34, 16, 3, F[1]); R(g, yx + 6, GY - 34, 16, 3, F[1]);
    // (BASE CAMP 0 FT on its stake, by the way in)
    postV(g, 28698, GY - 72, GY - 1, 4, WOOD6);
    board(g, 28650, GY - 96, 100, 26, '#FDE047');
    words(g, 'BASE CAMP', 28700, GY - 84, { sx: 1, sy: 1, fill: '#140A04', gap: 1 }, 92);
    words(g, 'ELEV. 0 FT', 28700, GY - 75, { sx: 1, sy: 1, fill: '#B91C1C', gap: 1 }, 92);
  }
};
// (dev only: the tower's figures and floors painted on their own, for their contact sheets)
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __wpTowerArt: unknown }).__wpTowerArt = { yetiStatue, sherpaStatue, paintFloor, paintFace, paintBaseCamp, GY, TL, TR, floorY };
/** The gate building between the water park's levels: level 2's way in (past the splash pool: THE LAZY RIVER, its
 *  shutter rolled up now, the way on; the owner's level 2 brief) and level 3's (out past the son's grotto: THE WAVE
 *  POOL, still shut: a stub, the owner designs it). Its gate
 *  building in the gate's blue stucco (lit down its left, banded, its side face toward the eye), up off the top of the
 *  screen (no way over it), the arch's roll shutter down to the deck and padlocked, OPENING SOON hung on it; the wave
 *  pool's marquee across the top in wave-crested letters; a CLOSED sawhorse and cones in front, a palm either side.
 *  Stood on the deck at its ground's depth; the shut way's the wall (wp-l2) where the shutter is. */
const STUB_TOP = GY - 640;
const paintStub = (g: Ctx, wall: number, open: boolean, title: string, sub: string) => {
  const w0 = wall - 150, w1 = wall + 150, Gt = GTOWER, S = STEEL6;
  // (the building: its front in stucco steps, the course lines, lit down the left; a darker band along its foot)
  R(g, w0 - 2, STUB_TOP, w1 - w0 + 4, GY - STUB_TOP, INK);
  R(g, w0, STUB_TOP, w1 - w0, GY - STUB_TOP, Gt[2]);
  R(g, w0, STUB_TOP, 6, GY - STUB_TOP, Gt[4]); R(g, w0 + 6, STUB_TOP, 2, GY - STUB_TOP, Gt[3]);
  dither(g, w0 + 8, STUB_TOP, 4, GY - STUB_TOP, Gt[3]);
  for (let y = STUB_TOP + 40; y < GY - 20; y += 48) { R(g, w0, y, w1 - w0, 2, Gt[1]); R(g, w0, y + 2, w1 - w0, 1, Gt[3]); }
  R(g, w0, GY - 26, w1 - w0, 26, Gt[1]); R(g, w0, GY - 26, w1 - w0, 2, Gt[3]);
  // (its pilasters, either side of the arch, their caps)
  for (const px of [wall - 112, wall + 84]) { R(g, px - 1, STUB_TOP, 30, GY - STUB_TOP, INK); R(g, px, STUB_TOP, 28, GY - STUB_TOP, Gt[3]); R(g, px, STUB_TOP, 3, GY - STUB_TOP, Gt[5]); R(g, px + 22, STUB_TOP, 6, GY - STUB_TOP, Gt[1]); for (let y = STUB_TOP + 20; y < GY; y += 30) R(g, px, y, 28, 1, Gt[2]); }
  // (the arch: its dark reveal, the roll shutter down in it to the deck, slats in steel's steps, its foot bar striped;
  // a padlock on its hasp)
  const ax0 = wall - 82, ax1 = wall + 84, atop = GY - 230;
  R(g, ax0 - 2, atop - 2, ax1 - ax0 + 4, GY - atop + 2, INK); R(g, ax0, atop, ax1 - ax0, 8, Gt[0]);
  g.fillStyle = INK; g.beginPath(); g.ellipse((ax0 + ax1) / 2, atop + 2, (ax1 - ax0) / 2 + 2, 30, 0, Math.PI, 0); g.fill();
  g.fillStyle = Gt[0]; g.beginPath(); g.ellipse((ax0 + ax1) / 2, atop + 2, (ax1 - ax0) / 2 - 4, 24, 0, Math.PI, 0); g.fill();
  if (open) {
    // (open: the shutter rolled up into its drum at the top of the arch, the passage through dark, the lazy river's
    // glow at the far end of it; the OPENING SOON banner torn off, hanging by a zip tie)
    R(g, ax0 + 2, atop + 8, ax1 - ax0 - 4, GY - atop - 8, '#0A0608');
    for (let k = 0; k < 4; k++) R(g, ax0 + 2, GY - 40 - k * 30, ax1 - ax0 - 4, 30, ['#2A1208', '#1E0E08', '#140A08', '#0E0808'][k]);
    R(g, ax0 + 2, atop + 8, ax1 - ax0 - 4, 14, INK); R(g, ax0 + 4, atop + 9, ax1 - ax0 - 8, 12, S[2]); R(g, ax0 + 4, atop + 9, ax1 - ax0 - 8, 2, S[4]); R(g, ax0 + 4, atop + 18, ax1 - ax0 - 8, 2, S[1]);
    poly(g, [[ax1 - 20, atop + 22], [ax1 - 8, atop + 22], [ax1 - 12, atop + 70], [ax1 - 26, atop + 64]], '#F8FAFC'); R(g, ax1 - 20, atop + 22, 2, 4, '#111827');
  } else {
  for (let y = atop + 8; y < GY - 14; y += 9) { R(g, ax0 + 2, y, ax1 - ax0 - 4, 8, S[3]); R(g, ax0 + 2, y, ax1 - ax0 - 4, 1, S[5]); R(g, ax0 + 2, y + 7, ax1 - ax0 - 4, 1, S[1]); }
    R(g, ax0 + 2, atop + 8, 3, GY - atop - 22, S[1]); R(g, ax1 - 5, atop + 8, 3, GY - atop - 22, S[1]);
    R(g, ax0 + 2, GY - 14, ax1 - ax0 - 4, 14, INK);
    g.save(); g.beginPath(); g.rect(ax0 + 2, GY - 13, ax1 - ax0 - 4, 12); g.clip();
    for (let i = -20; i < ax1 - ax0 + 20; i += 14) poly(g, [[ax0 + i, GY - 1], [ax0 + i + 7, GY - 1], [ax0 + i + 19, GY - 13], [ax0 + i + 12, GY - 13]], '#E0A90A');
    g.restore();
    R(g, wall - 6, GY - 26, 12, 12, INK); R(g, wall - 5, GY - 25, 10, 10, '#D4A017'); R(g, wall - 5, GY - 25, 10, 2, '#FFF0A0'); R(g, wall - 1, GY - 21, 2, 3, INK);
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(wall, GY - 27, 4, Math.PI, 0); g.stroke(); g.strokeStyle = '#A4A8B2'; g.lineWidth = 1.5; g.stroke();
    // (OPENING SOON, a vinyl banner zip-tied across the shutter, sagging, its corner curled)
    { const bx0 = ax0 + 12, bx1 = ax1 - 12, by = GY - 170;
      poly(g, [[bx0 - 2, by - 2], [bx1 + 2, by - 2], [bx1 + 2, by + 46], [(bx0 + bx1) / 2, by + 50], [bx0 - 2, by + 46]], INK);
      poly(g, [[bx0, by], [bx1, by], [bx1, by + 44], [(bx0 + bx1) / 2, by + 48], [bx0, by + 44]], '#F8FAFC');
      R(g, bx0, by, bx1 - bx0, 3, '#FFFFFF'); dither(g, bx0, by + 38, bx1 - bx0, 6, '#CBD5E1');
      poly(g, [[bx1 - 12, by + 44], [bx1, by + 44], [bx1, by + 34]], '#94A3B8');
      for (const zx of [bx0 + 2, bx1 - 4]) { R(g, zx, by + 2, 2, 4, '#111827'); R(g, zx, by + 38, 2, 4, '#111827'); }
      words(g, 'OPENING', (bx0 + bx1) / 2, by + 20, { sx: 2, sy: 2, fill: rampDown('#DC2626', 0.3), dither: true, shadow: '#F8C8C8', drop: 1, gap: 1, bold: true }, bx1 - bx0 - 8);
      words(g, 'SOON', (bx0 + bx1) / 2, by + 38, { sx: 2, sy: 2, fill: rampDown('#1D4ED8', 0.3), dither: true, shadow: '#C8D8F8', drop: 1, gap: 1, bold: true }, bx1 - bx0 - 8);
    }
  }
  // (THE WAVE POOL across the top of the arch: a marquee board, its wave crests along its top, bulbs, its letters)
  { const mx0 = w0 + 16, mx1 = w1 - 16, my = atop - 92;
    board(g, mx0, my, mx1 - mx0, 56, '#0E7490');
    for (let x = mx0; x < mx1 - 8; x += 16) { poly(g, [[x, my], [x + 6, my - 9], [x + 12, my - 7], [x + 10, my - 4], [x + 16, my]], '#E0F2FE'); R(g, x + 6, my - 8, 3, 1, '#FFFFFF'); }
    for (let x = mx0 + 6, i = 0; x < mx1 - 4; x += 12, i++) { R(g, x, my + 49, 4, 4, INK); R(g, x, my + 49, 3, 3, i % 3 ? '#FDE68A' : '#FFFBEB'); }
    signText(g, title, (mx0 + mx1) / 2, my + 30, { sx: 2, sy: 3, fill: rampDown('#F0F9FF', 0.15), dither: true, shadow: '#022C36', drop: 1, gap: 1, bold: true });
    signText(g, sub, (mx0 + mx1) / 2, my + 43, { sx: 1, sy: 1, fill: '#FDE047', shadow: '#022C36', drop: 1, gap: 1 });
  }
  // (the CLOSED sawhorse in front, on the deck: its legs, the striped board; two cones (shut only; open, they're
  // knocked over off to the side: the son came through))
  if (!open) { const sx = wall - 230, sy = GY;
    for (const lx of [sx + 4, sx + 66]) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(lx - 8, sy); g.lineTo(lx, sy - 34); g.lineTo(lx + 8, sy); g.stroke(); g.strokeStyle = '#E8E0D0'; g.lineWidth = 3; g.stroke(); }
    R(g, sx - 6, sy - 44, 84, 16, INK); R(g, sx - 5, sy - 43, 82, 14, '#F8FAFC');
    g.save(); g.beginPath(); g.rect(sx - 5, sy - 43, 82, 14); g.clip(); for (let i = -14; i < 90; i += 14) poly(g, [[sx - 5 + i, sy - 29], [sx + 2 + i, sy - 29], [sx + 16 + i, sy - 43], [sx + 9 + i, sy - 43]], '#EA580C'); g.restore();
    R(g, sx + 14, sy - 42, 44, 11, INK); R(g, sx + 15, sy - 41, 42, 9, '#F8FAFC');
    words(g, 'CLOSED', sx + 36, sy - 33, { sx: 1, sy: 1, fill: '#B91C1C', gap: 1, bold: true }, 40);
    for (const cx of [sx + 110, wall - 96]) {
      poly(g, [[cx - 11, sy], [cx - 3, sy - 28], [cx + 3, sy - 28], [cx + 11, sy]], INK);
      poly(g, [[cx - 9, sy - 1], [cx - 2, sy - 27], [cx + 2, sy - 27], [cx + 9, sy - 1]], '#EA580C');
      poly(g, [[cx - 6, sy - 12], [cx - 4, sy - 18], [cx + 4, sy - 18], [cx + 6, sy - 12]], '#F8FAFC');
      R(g, cx - 2, sy - 26, 2, 24, '#FDBA74'); R(g, cx - 14, sy - 3, 28, 3, INK); R(g, cx - 13, sy - 3, 26, 2, '#C2410C');
    }
  }
  // (a palm past it, on the deck: the plaza's (the plaza's own stand this side))
  paintPalm(g, w1 + 40, 2);
};
/** The gate building at `wall` (its arch's middle): `open`, the shutter's up (the way on). */
export const drawStubAt = (c: Ctx, state: GameState, wall: number, open: boolean, title: string, sub: string) => {
  const STUB_X0 = wall - 320, STUB_X1 = wall + 160;
  if (!vis(state, STUB_X0, STUB_X1)) return;
  // (the building's side face toward the eye, behind its front)
  sideFace(c, eyeOf(state), wall - 150, -1, STUB_TOP, GY, 0.94, GTOWER[1]);
  for (let ty = STUB_TOP; ty < GY + 2; ty += 214) if (visY(state, ty, ty + 214, 0)) stamp(c, `wp-stub2-${wall}-${open ? 1 : 0}-${ty}`, STUB_X0, ty, STUB_X1 - STUB_X0, Math.min(214, GY + 2 - ty), g => { g.save(); g.beginPath(); g.rect(STUB_X0, ty, STUB_X1 - STUB_X0, 214); g.clip(); paintStub(g, wall, open, title, sub); g.restore(); });
};
/** Level 2's way in (its shutter's up: on to THE LAZY RIVER). */
const drawStub = (c: Ctx, state: GameState) => drawStubAt(c, state, L2.wall, true, 'THE LAZY RIVER', 'FLOAT FOREVER');
// ---------------------------------------------------------------------------------------------------------------

export interface DrawState {
  gates: number[]; tells: { x: number; t: number }[]; locked: number | null; door: number; greenPool: number;
  /** On the spiral: off floor k, how far wrapped round (the tower's face drawn round again either side, its steps). */
  climb?: { k: number; e: number } | null;
  /** The descent's on or done (the kid's dead): no mountain face out past the tower's right wall, the slide in the open
   *  (he's riding it); else the face is there, in front of the slide's run behind it. */
  descent?: boolean;
}
/** World space, behind everything that moves. */
export const drawParkBack = (c: Ctx, state: GameState, d: DrawState, extra?: () => void) => {
  drawProps(c, state);
  drawPits(c, state, !d.descent);
  drawPools(c, state, d.greenPool);
  for (const S of SLIDES) drawSlideBack(c, state, S);
  TUBES.forEach((T, i) => drawTubeBack(c, state, T, i));
  // (the Abyss's funnel over its pool: its inside and back rim behind him (funnel.ts))
  for (const T of TUBES) if (T.funnel) drawFunnelBack(c, state, T.funnel, T.pool);
  drawDescentChute(c, state, !d.descent);
  extra?.();
  drawTower(c, state, d.gates, d.tells, d.locked);
  // (the mountain's outside, round which the spiral goes (out past the way up, and again round the far side); on the
  // spiral, the inside drawn round again either side of it (where he comes in at the top: tower.ts))
  if (!d.descent) { drawFace(c, state, 0); drawFace(c, state, -ROUND); }
  // (base camp stood on the ground in front of the mountain (its far side's face, from down here))
  drawBaseCamp(c, state);
  if (d.climb) { drawTower(c, state, d.gates, d.tells, null, -ROUND); drawTower(c, state, d.gates, d.tells, null, ROUND); }
  drawSummit(c, state);
  drawSummitDoor(c, state, d.door);
  // (on the spiral: the summit round with the tower's inside, either side (no lone sliver of its snow, no pop onto it))
  if (d.climb) for (const ox of [-ROUND, ROUND]) if (vis(state, TL - 60 + ox, TR + 200 + ox, 0)) { c.save(); c.translate(ox, 0); drawSummit(c, state); drawSummitDoor(c, state, d.door, ox); c.restore(); }
  drawStub(c, state);
  drawGround(c, state);
};
/** World space, in front of him: the near walls. */
export const drawParkFront = (c: Ctx, state: GameState, greenPool = 0, descent = false) => {
  drawPoolsFront(c, state, greenPool);
  for (const S of SLIDES) drawSlideFront(c, state, S);
  TUBES.forEach((T, i) => drawTubeFront(c, state, T, i));
  // (...its outside, spout and front lip in front of him)
  for (const T of TUBES) if (T.funnel) drawFunnelFront(c, state, T.funnel);
  drawDescentFront(c, state, !descent);
};
/** The lamps (world): the plaza's light poles (only where a pole stands: none over a pool, where one lit him yellow in
 *  the Abyss's funnel), the towers' work lights, a floor's lights. */
export const parkLamps = (state: GameState): Light[] => {
  const out: Light[] = [], k = lampGlow();
  for (let x = Math.floor((state.camera.x - 300) / 700) * 700 + 350; x < state.camera.x + W + 300; x += 700) if (!TUBES.some(T => x > tubeSpan(T)[0] - 200 && x < tubeSpan(T)[1]) && !GROUND.every(([a, b]) => x < a + 20 || x > b - 20)) out.push({ x, y: GY - 160, r: 200, a: 0.3 * k, color: '#FDE68A' } as Light);
  if (vis(state, TL - 200, TR + 200)) for (let j = 0; j <= FLOORS; j++) { const y = floorY(j) - 200; if (visY(state, y - 200, y + 200)) out.push({ x: (TL + TR) / 2, y, r: 420, a: 0.32, color: '#E0F2FE' } as Light); }
  return out;
};
export { SLIDE_PATHS };
